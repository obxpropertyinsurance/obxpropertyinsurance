import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { enqueueCustomerAcknowledgment, dispatchCustomerAcknowledgment } from './customerEmail.mjs';

const submissionId = '88888888-8888-4888-8888-888888888888';
const leadId = '11111111-1111-4111-8111-111111111111';
const start = Date.parse('2026-10-16T14:00:00Z');
const lead = { fullName: 'Robin Sample', email: 'robin@example.com', preferredContact: 'Email first',
  callbackWindow: 'As soon as available', selectedCoverage: 'Homeowners + wind review',
  leadGoal: 'Buying / closing soon', coverageNeededBy: '2026-10-20', notes: '', address: 'Private fixture address' };

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON; CREATE TABLE leads(id TEXT PRIMARY KEY);');
  sqlite.prepare('INSERT INTO leads(id) VALUES (?)').run(leadId);
  sqlite.exec(readFileSync(new URL('../../migrations/customer-email-outbox-0001.sql', import.meta.url), 'utf8'));
  let failNextFinish = false;
  const db = {
    prepare(sql) {
      return { bind(...args) { return {
        async first() { return sqlite.prepare(sql).get(...args) || null; },
        async run() {
          if (failNextFinish && sql.includes('provider_id = ?')) { failNextFinish = false; throw Error('injected storage failure'); }
          const result = sqlite.prepare(sql).run(...args);
          return { success: true, meta: { changes: result.changes } };
        },
      }; } };
    },
  };
  const env = { LEADS_DB: db, CUSTOMER_EMAIL_ENABLED: 'true', CUSTOMER_EMAIL_FROM_VERIFIED: 'true',
    CUSTOMER_EMAIL_REPLY_TO_VERIFIED: 'true', CUSTOMER_EMAIL_FROM: 'OBXNCInsurance.com <hello@obxncinsurance.com>',
    CUSTOMER_EMAIL_REPLY_TO: 'hello@obxncinsurance.com', CUSTOMER_EMAIL_RESEND_API_KEY: 'fixture-not-a-key' };
  env.CUSTOMER_EMAIL_RATE_LIMIT_SALT = 'fixture-private-salt-at-least-32-characters';
  const enqueue = (overrides = {}) => enqueueCustomerAcknowledgment({ env, lead, leadId, submissionId, now: start, ...overrides });
  const send = (fetchImpl, overrides = {}) => dispatchCustomerAcknowledgment({ env, submissionId, now: start, fetchImpl, ...overrides });
  const row = () => sqlite.prepare('SELECT * FROM customer_email_outbox WHERE submission_id = ?').get(submissionId);
  return { sqlite, env, enqueue, send, row, failFinish: () => { failNextFinish = true; } };
}
const success = () => new Response(JSON.stringify({ id: 'provider-fixture-id' }), { status: 200 });

test('disabled or unverified configuration performs no storage or network work', async () => {
  const f = fixture();
  for (const change of [{ CUSTOMER_EMAIL_ENABLED: 'false' }, { CUSTOMER_EMAIL_ENABLED: true },
    { CUSTOMER_EMAIL_FROM_VERIFIED: 'false' }, { CUSTOMER_EMAIL_REPLY_TO_VERIFIED: 'false' },
    { CUSTOMER_EMAIL_FROM: 'attacker@example.com' }, { CUSTOMER_EMAIL_REPLY_TO: 'hello@example.com' },
    { CUSTOMER_EMAIL_RATE_LIMIT_SALT: '' },
    { CUSTOMER_EMAIL_RESEND_API_KEY: '' }, { LEADS_DB: null }]) {
    const env = { ...f.env, ...change };
    assert.ok(['disabled', 'configuration_required'].includes((await f.enqueue({ env })).state));
    await f.send(() => { throw Error('network must not be reached'); }, { env });
  }
  assert.equal(f.row(), undefined);
});

test('email-first only, no holds/conflicts, valid IDs and single recipient', async () => {
  const f = fixture();
  for (const change of [{ preferredContact: 'Phone call' }, { preferredContact: 'Text first' },
    { preferredContact: 'No preference' }, { callbackWindow: 'After I send documents' },
    { notes: 'Do not email me' }, { email: 'a@example.com,b@example.com' },
    { email: 'a@example.com\r\nbcc:other@example.com' }, { companyWebsite: 'honeypot' }]) {
    assert.equal((await f.enqueue({ lead: { ...lead, ...change } })).state, 'ineligible');
  }
  assert.equal((await f.enqueue({ submissionId: 'new-id-per-request' })).state, 'invalid_input');
  assert.equal(f.row(), undefined);
});

test('queues one frozen personalized HTML and plain-text receipt, dedupes and rejects changed submission reuse', async () => {
  const f = fixture();
  await Promise.all([f.enqueue(), f.enqueue()]);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM customer_email_outbox').get().n, 1);
  const body = JSON.parse(f.row().request_json);
  assert.deepEqual(body.to, ['robin@example.com']);
  assert.equal(body.reply_to, 'hello@obxncinsurance.com');
  assert.match(body.text, /Hi Robin/);
  assert.match(body.text, /October 20, 2026/);
  assert.doesNotMatch(body.text, /Private fixture address/);
  assert.match(body.html, /Your request is in/);
  assert.match(body.html, /Robin\./);
  assert.match(body.html, /October 20, 2026/);
  assert.doesNotMatch(body.html, /Private fixture address/);
  assert.equal(body.cc, undefined);
  assert.equal((await f.enqueue({ lead: { ...lead, email: 'other@example.com' } })).state, 'submission_conflict');
  assert.deepEqual(JSON.parse(f.row().request_json).to, ['robin@example.com']);
});

test('only one concurrent dispatcher claims the row; accepted is terminal beyond provider expiry', async () => {
  const f = fixture(); await f.enqueue();
  let calls = 0;
  const network = async (url, options) => { calls++; assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers['Idempotency-Key'], `obx-receipt/${submissionId}`); return success(); };
  await Promise.all([f.send(network), f.send(network)]);
  assert.equal(calls, 1);
  assert.equal(f.row().state, 'accepted');
  assert.equal(f.row().provider_id, 'provider-fixture-id');
  await f.send(network, { now: start + 48 * 60 * 60 * 1000 });
  assert.equal(calls, 1);
});

test('uncertain timeout retries frozen bytes/key only after due time', async () => {
  const f = fixture(); await f.enqueue();
  const requests = [];
  assert.equal((await f.send(async (_, opts) => { requests.push(opts); throw Error('secret provider body'); })).state, 'retry');
  assert.equal(f.row().error_code, 'acceptance_unknown');
  let premature = false;
  await f.send(() => { premature = true; return success(); }, { now: start + 1000 });
  assert.equal(premature, false);
  assert.equal((await f.send(async (_, opts) => { requests.push(opts); return success(); }, { now: start + 60_000 })).state, 'accepted');
  assert.equal(requests[0].body, requests[1].body);
  assert.match(JSON.parse(requests[0].body).html, /Your request is in/);
  assert.equal(JSON.parse(requests[0].body).html, JSON.parse(requests[1].body).html);
  assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key']);
});

test('re-enqueue preserves earlier HTML and legacy plain-text-only payloads without regenerating them', async () => {
  for (const priorHTML of ['<p>Earlier approved template</p>', undefined]) {
    const f = fixture(); await f.enqueue();
    const previous = JSON.parse(f.row().request_json);
    if (priorHTML === undefined) delete previous.html;
    else previous.html = priorHTML;
    const frozen = JSON.stringify(previous);
    f.sqlite.prepare('UPDATE customer_email_outbox SET request_json = ? WHERE submission_id = ?').run(frozen, submissionId);
    await f.enqueue({ now: start + 30_000 });
    assert.equal(f.row().request_json, frozen);
    await f.send(async (_, options) => {
      assert.equal(options.body, frozen);
      assert.equal(JSON.parse(options.body).html, priorHTML);
      return success();
    });
  }
});

test('Workers-compatible manual redirect never follows a provider redirect or retries it', async () => {
  for (const status of [301, 302, 303, 307, 308]) {
    const f = fixture(); await f.enqueue();
    let calls = 0;
    const network = async (url, options) => {
      calls++;
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(options.redirect, 'manual');
      assert.ok(options.signal instanceof AbortSignal);
      return new Response(null, { status, headers: { location: 'https://redirect.example/never-follow' } });
    };
    assert.equal((await f.send(network)).state, 'failed');
    assert.equal(f.row().error_code, `http_${status}`);
    assert.equal((await f.send(network, { now: start + 60_000 })).state, 'failed');
    assert.equal(calls, 1);
  }
});

test('lost persistence after acceptance replays same key within lease/window', async () => {
  const f = fixture(); await f.enqueue(); f.failFinish();
  const keys = [];
  const network = async (_, opts) => { keys.push(opts.headers['Idempotency-Key']); return success(); };
  assert.equal((await f.send(network)).state, 'storage_error');
  assert.equal(f.row().state, 'sending');
  await f.send(network, { now: start + 1000 });
  assert.equal(keys.length, 1);
  assert.equal((await f.send(network, { now: start + 61_000 })).state, 'accepted');
  assert.deepEqual(keys, [`obx-receipt/${submissionId}`, `obx-receipt/${submissionId}`]);
});

test('expired ambiguous sends and stale unsent receipts require manual review, never new keys', async () => {
  for (const hadAttempt of [false, true]) {
    const f = fixture(); await f.enqueue();
    if (hadAttempt) await f.send(async () => { throw Error('timeout'); });
    let calls = 0;
    const result = await f.send(() => { calls++; return success(); }, { now: start + 23 * 60 * 60 * 1000 });
    assert.equal(result.state, 'review'); assert.equal(calls, 0);
    await f.enqueue({ now: start + 48 * 60 * 60 * 1000 });
    await f.send(() => { calls++; return success(); }, { now: start + 48 * 60 * 60 * 1000 });
    assert.equal(calls, 0);
  }
});

test('transient failures are bounded; permanent errors are not retried', async () => {
  const f = fixture(); await f.enqueue();
  let at = start;
  for (let i = 0; i < 5; i++) {
    await f.send(async () => new Response('{}', { status: 503 }), { now: at });
    at = f.row().next_attempt_at;
  }
  assert.equal(f.row().attempts, 5); assert.equal(f.row().state, 'review');
  const g = fixture(); await g.enqueue();
  assert.equal((await g.send(async () => new Response(JSON.stringify({ name: 'invalid_idempotent_request' }), { status: 409 }))).state, 'failed');
  assert.equal((await g.send(() => { throw Error('must not send'); })).state, 'failed');
});

test('Retry-After, concurrent-key response and changed sender fail safely', async () => {
  const f = fixture(); await f.enqueue();
  await f.send(async () => new Response('{}', { status: 429, headers: { 'retry-after': '120' } }));
  assert.equal(f.row().next_attempt_at, start + 120_000);
  const g = fixture(); await g.enqueue();
  assert.equal((await g.send(async () => new Response(JSON.stringify({ name: 'concurrent_idempotent_requests' }), { status: 409 }))).state, 'retry');
  const h = fixture(); await h.enqueue();
  assert.equal((await h.send(() => { throw Error('must not send'); }, { env: { ...h.env, CUSTOMER_EMAIL_REPLY_TO: 'other@obxncinsurance.com' } })).state, 'review');
  assert.equal(h.row().error_code, 'sender_changed');
});

test('missing migration/storage failure cannot throw into the lead response', async () => {
  const f = fixture(); f.sqlite.exec('DROP TABLE customer_email_outbox');
  assert.equal((await f.enqueue()).state, 'storage_error');
  assert.equal((await f.send(() => { throw Error('must not send'); })).state, 'storage_error');
});

test('recipient cap is atomic across concurrent new IDs; duplicate IDs use no additional capacity', async () => {
  const f = fixture();
  const ids = Array.from({ length: 8 }, () => crypto.randomUUID());
  const results = await Promise.all(ids.map(id => f.enqueue({ submissionId: id })));
  assert.equal(results.filter(result => result.state === 'queued').length, 3);
  assert.equal(results.filter(result => result.state === 'rate_limited').length, 5);
  const acceptedId = ids[results.findIndex(result => result.state === 'queued')];
  assert.equal((await f.enqueue({ submissionId: acceptedId })).state, 'queued');
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM customer_email_outbox').get().n, 3);
  for (let i = 0; i < 2; i++) assert.equal((await f.enqueue({ submissionId: crypto.randomUUID(), now: start + 3_600_001 })).state, 'queued');
  assert.equal((await f.enqueue({ submissionId: crypto.randomUUID(), now: start + 3_600_001 })).state, 'rate_limited');
  assert.equal((await f.enqueue({ submissionId: crypto.randomUUID(), now: start + 86_400_001 })).state, 'queued');
});

test('IP-derived hash cap spans recipients and preserves privacy; missing hash keeps recipient cap', async () => {
  const f = fixture();
  const requesterHash = 'a'.repeat(64);
  const enqueueNewRecipient = (i, at = start) => f.enqueue({ submissionId: crypto.randomUUID(), requesterHash,
    lead: { ...lead, email: `fixture${i}@example.com` }, now: at });
  const firstHour = await Promise.all(Array.from({ length: 24 }, (_, i) => enqueueNewRecipient(i)));
  assert.equal(firstHour.filter(result => result.state === 'queued').length, 20);
  assert.equal(firstHour.filter(result => result.state === 'rate_limited').length, 4);
  for (let i = 24; i < 44; i++) assert.equal((await enqueueNewRecipient(i, start + 3_600_001)).state, 'queued');
  for (let i = 44; i < 54; i++) assert.equal((await enqueueNewRecipient(i, start + 7_200_002)).state, 'queued');
  assert.equal((await enqueueNewRecipient(54, start + 7_200_002)).state, 'rate_limited');
  assert.equal((await f.enqueue({ submissionId: crypto.randomUUID(), requesterHash: 'b'.repeat(64), lead: { ...lead, email: 'different-ip@example.com' } })).state, 'queued');
  assert.equal((await f.enqueue({ submissionId: crypto.randomUUID(), lead: { ...lead, email: 'no-ip@example.com' } })).state, 'queued');
  assert.equal((await f.enqueue({ requesterHash: '192.0.2.1' })).state, 'invalid_input');
  const stored = f.sqlite.prepare('SELECT requester_hash, recipient_hash FROM customer_email_outbox LIMIT 1').get();
  assert.equal(stored.requester_hash, requesterHash);
  assert.match(stored.recipient_hash, /^[a-f0-9]{64}$/);
});
