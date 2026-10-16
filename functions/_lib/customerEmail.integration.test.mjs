import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequestPost } from '../api/lead.js';
import { customerEmailRequestHash } from './customerEmail.mjs';

const submissionId = '88888888-8888-4888-8888-888888888888';
const payload = { address: 'Private fixture address', fullName: 'Robin Sample', email: 'robin@example.com',
  phone: '2525550100', preferredContact: 'Email first', callbackWindow: 'As soon as available',
  selectedCoverage: 'Homeowners + wind review', leadGoal: 'Buying / closing soon', submissionId,
  notes: 'Please check the wind coverage.', sourcePath: '/' };

function fixture({ migration = true } = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  sqlite.exec(readFileSync(new URL('../../migrations/0001_create_leads.sql', import.meta.url), 'utf8'));
  if (migration) sqlite.exec(readFileSync(new URL('../../migrations/customer-email-outbox-0001.sql', import.meta.url), 'utf8'));
  const env = { CUSTOMER_EMAIL_ENABLED: 'true', CUSTOMER_EMAIL_FROM_VERIFIED: 'true', CUSTOMER_EMAIL_REPLY_TO_VERIFIED: 'true',
    CUSTOMER_EMAIL_FROM: 'OBXNCInsurance.com <hello@obxncinsurance.com>', CUSTOMER_EMAIL_REPLY_TO: 'hello@obxncinsurance.com',
    CUSTOMER_EMAIL_RESEND_API_KEY: 'fixture-not-a-key', CUSTOMER_EMAIL_RATE_LIMIT_SALT: 'fixture-private-salt-at-least-32-characters',
    LEADS_DB: { prepare(sql) { return { bind(...args) { return {
      async run() { const result = sqlite.prepare(sql).run(...args); return { meta: { changes: result.changes } }; },
      async first() { return sqlite.prepare(sql).get(...args) || null; },
    }; } }; } } };
  const continuations = [];
  const submit = (fields = {}, overrides = {}) => {
    const request = new Request('https://www.obxncinsurance.com/api/lead', { method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1', ...overrides.headers },
      body: JSON.stringify({ ...payload, ...fields }) });
    return onRequestPost({ request, env: { ...env, ...overrides.env }, waitUntil: work => continuations.push(work) });
  };
  const finish = async () => Promise.all(continuations);
  const row = () => sqlite.prepare('SELECT * FROM customer_email_outbox WHERE submission_id = ?').get(submissionId);
  return { env, sqlite, submit, finish, row, continuations };
}

test('enabled receipt runs after D1 save through waitUntil without replacing FormSubmit', async t => {
  const f = fixture(); const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (url === 'https://api.resend.com/emails') {
      assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM leads').get().n, 1);
      return Response.json({ id: 'receipt-fixture' });
    }
    return Response.json({ success: true });
  });
  const response = await f.submit(); const result = await response.json(); await f.finish();
  assert.equal(response.status, 200); assert.equal(result.delivery, 'formsubmit'); assert.equal(result.storage, 'd1');
  assert.equal(f.continuations.length, 1); assert.equal(f.row().state, 'accepted');
  assert.match(f.row().requester_hash, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(f.row().request_json, /192\.0\.2\.1|Private fixture address/);
  const admin = calls.find(call => call.url.startsWith('https://formsubmit.co/'));
  assert.equal(admin.options.body.get('email'), payload.email);
  assert.equal(admin.options.body.get('property_address'), payload.address);
  assert.equal(JSON.parse(calls.find(call => call.url === 'https://api.resend.com/emails').options.body).reply_to, 'hello@obxncinsurance.com');
});

test('slow customer sender cannot delay the accepted FormSubmit response', async t => {
  const f = fixture(); let completeCustomerSend;
  t.mock.method(globalThis, 'fetch', (url) => url === 'https://api.resend.com/emails'
    ? new Promise(resolve => { completeCustomerSend = resolve; })
    : Promise.resolve(Response.json({ success: true })));
  const response = await f.submit();
  assert.equal(response.status, 200); assert.equal(f.row().state, 'sending');
  completeCustomerSend(Response.json({ id: 'late-fixture' })); await f.finish();
  assert.equal(f.row().state, 'accepted');
});

test('identical browser retry keeps one customer receipt while preserving original lead/admin behavior', async t => {
  const f = fixture(); let customers = 0, admin = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === 'https://api.resend.com/emails') { customers++; return Response.json({ id: 'receipt-fixture' }); }
    admin++; return Response.json({ success: true });
  });
  await f.submit(); await f.finish(); await f.submit({ submittedAt: new Date().toISOString() }); await f.finish();
  assert.equal(customers, 1); assert.equal(admin, 2);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM leads').get().n, 2);
  assert.equal(f.sqlite.prepare('SELECT COUNT(*) n FROM customer_email_outbox').get().n, 1);
});

test('missing activation gates or trusted IP and held/non-email requests leave original flow intact', async t => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.startsWith('https://formsubmit.co/')); return Response.json({ success: true });
  });
  for (const overrides of [{ env: { CUSTOMER_EMAIL_ENABLED: 'false' } },
    { env: { CUSTOMER_EMAIL_RATE_LIMIT_SALT: '' } }, { env: { CUSTOMER_EMAIL_FROM_VERIFIED: 'false' } },
    { env: { CUSTOMER_EMAIL_REPLY_TO_VERIFIED: 'false' } }, { headers: { 'cf-connecting-ip': '' } }]) {
    const f = fixture();
    assert.equal((await f.submit({}, overrides)).status, 200); await f.finish();
    assert.equal(f.continuations.length, 0); assert.equal(f.row(), undefined);
  }
  for (const fields of [{ preferredContact: 'Phone call' }, { preferredContact: 'Text first' },
    { callbackWindow: 'After I send documents' }, { notes: 'Do not email me' }, { submissionId: '' }]) {
    const f = fixture(); assert.equal((await f.submit(fields)).status, 200); await f.finish();
    assert.equal(f.continuations.length, 0); assert.equal(f.row(), undefined);
  }
});

test('missing outbox schema and customer provider failures cannot turn saved lead success into an error', async t => {
  t.mock.method(globalThis, 'fetch', async (url) => url === 'https://api.resend.com/emails'
    ? new Response('{}', { status: 503 }) : Response.json({ success: true }));
  const missing = fixture({ migration: false }); assert.equal((await missing.submit()).status, 200); await missing.finish();
  assert.equal(missing.continuations.length, 0);
  const failed = fixture(); const response = await failed.submit(); await failed.finish();
  assert.equal(response.status, 200); assert.equal((await response.json()).delivery, 'formsubmit');
  assert.equal(failed.row().state, 'retry');
});

test('operator delivery fallback stays unchanged even when the independent acknowledgment is accepted', async t => {
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async (url) => url === 'https://api.resend.com/emails'
    ? Response.json({ id: 'receipt-fixture' }) : Response.json({ success: false, message: 'Synthetic FormSubmit failure' }, { status: 502 }));
  const f = fixture(); const response = await f.submit(); await f.finish(); const body = await response.json();
  assert.equal(response.status, 424); assert.equal(body.fallback, 'formsubmit-browser');
  assert.equal(body.storage, 'd1'); assert.equal(f.row().state, 'accepted');
  assert.equal(f.sqlite.prepare('SELECT email_delivery FROM leads').get().email_delivery, 'formsubmit-browser-pending');
});

test('HMAC uses a secret and trusted connection header, never a browser-provided requester hash', async () => {
  const f = fixture();
  const request = new Request('https://www.obxncinsurance.com/api/lead', { headers: { 'cf-connecting-ip': '192.0.2.1' } });
  const hash = await customerEmailRequestHash({ env: f.env, request });
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash, await customerEmailRequestHash({ env: f.env, request }));
  assert.notEqual(hash, await customerEmailRequestHash({ env: { ...f.env, CUSTOMER_EMAIL_RATE_LIMIT_SALT: 'different-private-salt-at-least-32-chars' }, request }));
  assert.equal(await customerEmailRequestHash({ env: f.env, request: new Request('https://www.obxncinsurance.com/api/lead', { headers: { 'x-forwarded-for': '192.0.2.1' } }) }), null);
  assert.equal(await customerEmailRequestHash({ env: f.env, request: new Request('https://preview.obxncinsurance.pages.dev/api/lead', { headers: { 'cf-connecting-ip': '192.0.2.1' } }) }), null);
});
