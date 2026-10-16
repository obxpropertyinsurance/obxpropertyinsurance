import { buildLeadResponse } from '../../src/leadResponse.mjs';
import { renderCustomerAcknowledgmentHTML } from './customerEmailHTML.mjs';

const RETRY_WINDOW = 23 * 60 * 60 * 1000; // Resend idempotency expires at 24h; leave a safety margin.
const LEASE_MS = 60_000;
const MAX_ATTEMPTS = 5;
const DELAYS = [60_000, 300_000, 900_000, 3_600_000, 7_200_000];
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const CAPS = { recipientHour: 3, recipientDay: 5, requesterHour: 20, requesterDay: 50 };
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const mailbox = value => typeof value === 'string' && value.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value);
const timestamp = now => new Date(now).getTime();

function configuration(env) {
  if (env.CUSTOMER_EMAIL_ENABLED !== 'true') return { state: 'disabled' };
  const from = String(env.CUSTOMER_EMAIL_FROM || '');
  const fromMailbox = from.match(/^[^<>\r\n]+ <([^<>]+)>$/)?.[1] || from;
  const replyTo = String(env.CUSTOMER_EMAIL_REPLY_TO || '');
  const owned = value => mailbox(value) && /@(?:[a-z0-9-]+\.)*obxncinsurance\.com$/i.test(value);
  if (env.CUSTOMER_EMAIL_FROM_VERIFIED !== 'true' || env.CUSTOMER_EMAIL_REPLY_TO_VERIFIED !== 'true'
      || !owned(fromMailbox) || !owned(replyTo) || !env.CUSTOMER_EMAIL_RESEND_API_KEY
      || typeof env.CUSTOMER_EMAIL_RATE_LIMIT_SALT !== 'string' || env.CUSTOMER_EMAIL_RATE_LIMIT_SALT.length < 32
      || !env.LEADS_DB?.prepare) return { state: 'configuration_required' };
  return { from, replyTo, apiKey: env.CUSTOMER_EMAIL_RESEND_API_KEY, db: env.LEADS_DB };
}

// The public route derives this only from Cloudflare's trusted connection header,
// never a client field or x-forwarded-for. The raw IP is not placed in this outbox.
export async function customerEmailRequestHash({ env, request }) {
  if (configuration(env).state) return null;
  if (!['www.obxncinsurance.com', 'obxncinsurance.com'].includes(new URL(request.url).hostname)) return null;
  const ip = request.headers.get('cf-connecting-ip')?.trim();
  if (!ip || ip.length > 45 || !/^[0-9a-f:.]+$/i.test(ip)) return null;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CUSTOMER_EMAIL_RATE_LIMIT_SALT),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip.toLowerCase()));
    return [...new Uint8Array(signed)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { return null; }
}

async function hashText(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function fingerprint(lead) {
  const keys = ['email', 'fullName', 'preferredContact', 'callbackWindow', 'leadGoal', 'selectedCoverage',
    'coverageNeededBy', 'policyExpiration', 'notes', 'address', 'propertyUse'];
  const canonical = JSON.stringify(keys.map(key => [key, String(lead[key] ?? '')]));
  return hashText(canonical);
}

// Call only with a validated, accepted D1 lead and its stable submission UUID.
// This function never alters the lead record or the original submission response.
export async function enqueueCustomerAcknowledgment({ env, lead, leadId, submissionId, requesterHash, now = new Date() }) {
  const config = configuration(env);
  if (config.state) return { state: config.state };
  const at = timestamp(now);
  if (!uuid(submissionId) || !uuid(leadId) || !Number.isFinite(at)) return { state: 'invalid_input' };
  // Never accept a raw IP or browser-controlled hash. The route must derive this
  // from the trusted CF connection IP using a server-secret HMAC.
  if (requesterHash !== undefined && (typeof requesterHash !== 'string' || !/^[a-f0-9]{64}$/i.test(requesterHash))) {
    return { state: 'invalid_input' };
  }
  if (!lead || lead.companyWebsite) return { state: 'ineligible' };
  const email = String(lead.email || '').trim().toLowerCase();
  const plan = buildLeadResponse(lead, { now });
  if (!mailbox(email) || plan.channel !== 'email' || plan.requiresReview || plan.holdForDocuments || !plan.drafts.email.body) {
    return { state: 'ineligible' };
  }
  const request = JSON.stringify({ from: config.from, to: [email], reply_to: config.replyTo,
    subject: plan.drafts.email.subject, text: plan.drafts.email.body,
    html: renderCustomerAcknowledgmentHTML(lead, { now }) });
  try {
    const hash = await fingerprint(lead);
    const recipientHash = await hashText(email);
    const sourceHash = requesterHash?.toLowerCase() || null;
    // One SQLite write statement serializes the quota check with insertion.
    // Counts include all states, so failures/new IDs cannot reopen capacity.
    await config.db.prepare(`INSERT INTO customer_email_outbox
      (submission_id, lead_id, input_hash, recipient_hash, requester_hash, request_json, idempotency_key,
       created_at, updated_at, next_attempt_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM customer_email_outbox WHERE recipient_hash = ? AND created_at > ?) < ?
        AND (SELECT COUNT(*) FROM customer_email_outbox WHERE recipient_hash = ? AND created_at > ?) < ?
        AND (? IS NULL OR (
          (SELECT COUNT(*) FROM customer_email_outbox WHERE requester_hash = ? AND created_at > ?) < ?
          AND (SELECT COUNT(*) FROM customer_email_outbox WHERE requester_hash = ? AND created_at > ?) < ?
        )) ON CONFLICT(submission_id) DO NOTHING`)
      .bind(submissionId, leadId, hash, recipientHash, sourceHash, request, `obx-receipt/${submissionId}`, at, at, at,
        recipientHash, at - HOUR, CAPS.recipientHour, recipientHash, at - DAY, CAPS.recipientDay,
        sourceHash, sourceHash, at - HOUR, CAPS.requesterHour, sourceHash, at - DAY, CAPS.requesterDay).run();
    const existing = await config.db.prepare('SELECT * FROM customer_email_outbox WHERE submission_id = ?').bind(submissionId).first();
    if (!existing) return { state: 'rate_limited' };
    if (existing.input_hash !== hash) return { state: 'submission_conflict' };
    return { state: existing.state, submissionId };
  } catch {
    return { state: 'storage_error' }; // Do not include customer details, secrets, or provider bodies in logs/errors.
  }
}

async function finish(db, row, state, code, at, providerId = null, retryAt = at) {
  const result = await db.prepare(`UPDATE customer_email_outbox SET state = ?, error_code = ?,
    provider_id = ?, updated_at = ?, next_attempt_at = ?, lease_token = NULL, lease_expires_at = NULL
    WHERE submission_id = ? AND state = 'sending' AND lease_token = ?`)
    .bind(state, code, providerId, at, retryAt, row.submission_id, row.lease_token).run();
  return result.meta?.changes === 1 ? { state, submissionId: row.submission_id } : { state: 'lease_lost' };
}

function retryDelay(response, at, attempt) {
  const header = response?.headers?.get('retry-after');
  const seconds = header && /^\d+$/.test(header) ? Number(header) * 1000 : 0;
  const date = header && !seconds ? Date.parse(header) - at : 0;
  return Math.max(DELAYS[attempt - 1] || DELAYS.at(-1), seconds || (Number.isFinite(date) ? date : 0));
}

// One attempt only. A future trusted worker must invoke this again when retry is due.
// No timers, public retry endpoint, autonomous sequence, or provider setup lives here.
export async function dispatchCustomerAcknowledgment({ env, submissionId, now = new Date(), fetchImpl = fetch }) {
  const config = configuration(env);
  if (config.state) return { state: config.state };
  const at = timestamp(now);
  if (!uuid(submissionId) || !Number.isFinite(at)) return { state: 'invalid_input' };
  try {
    await config.db.prepare(`UPDATE customer_email_outbox SET state = 'review', error_code = 'retry_limit',
      updated_at = ?, lease_token = NULL, lease_expires_at = NULL
      WHERE submission_id = ? AND state IN ('queued','retry','sending')
      AND (state != 'sending' OR lease_expires_at <= ?)
      AND (attempts >= ? OR created_at <= ? OR first_attempt_at <= ?)`)
      .bind(at, submissionId, at, MAX_ATTEMPTS, at - RETRY_WINDOW, at - RETRY_WINDOW).run();
    const row = await config.db.prepare(`UPDATE customer_email_outbox SET state = 'sending',
      attempts = attempts + 1, first_attempt_at = COALESCE(first_attempt_at, ?), updated_at = ?,
      lease_token = ?, lease_expires_at = ?
      WHERE submission_id = ? AND attempts < ? AND created_at > ?
      AND (first_attempt_at IS NULL OR first_attempt_at > ?)
      AND ((state IN ('queued','retry') AND next_attempt_at <= ?) OR (state = 'sending' AND lease_expires_at <= ?))
      RETURNING *`)
      .bind(at, at, crypto.randomUUID(), at + LEASE_MS, submissionId, MAX_ATTEMPTS,
        at - RETRY_WINDOW, at - RETRY_WINDOW, at, at).first();
    if (!row) {
      const existing = await config.db.prepare('SELECT state FROM customer_email_outbox WHERE submission_id = ?').bind(submissionId).first();
      return { state: existing?.state || 'not_found', attempted: false };
    }
    // Freeze all content on enqueue. Configuration changes require a human review,
    // never a new key/body on retry of a possibly accepted request.
    const message = JSON.parse(row.request_json);
    if (message.from !== config.from || message.reply_to !== config.replyTo) {
      return await finish(config.db, row, 'review', 'sender_changed', at);
    }
    let response, data;
    try {
      response = await fetchImpl('https://api.resend.com/emails', {
        // Workers supports manual/follow only. Never forward credentials or
        // request content to a redirect destination; 3xx is a terminal failure.
        method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10_000),
        headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json', 'Idempotency-Key': row.idempotency_key },
        body: row.request_json,
      });
      data = await response.json().catch(() => null);
    } catch {
      // A timeout or disconnect may happen after acceptance. Retry only the same
      // frozen body and key within the bounded provider idempotency window.
    }
    if (response?.ok && typeof data?.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(data.id)) {
      return await finish(config.db, row, 'accepted', null, at, data.id);
    }
    const uncertain = !response || response.ok || response.status === 408 || response.status >= 500;
    const retryable = uncertain || response.status === 429 || (response.status === 409 && data?.name === 'concurrent_idempotent_requests');
    if (!retryable) return await finish(config.db, row, 'failed', `http_${response.status}`, at);
    const retryAt = at + retryDelay(response, at, row.attempts);
    const deadline = Math.min(row.created_at, row.first_attempt_at) + RETRY_WINDOW;
    if (row.attempts >= MAX_ATTEMPTS || retryAt >= deadline) {
      return await finish(config.db, row, 'review', uncertain ? 'acceptance_unknown' : 'retry_limit', at);
    }
    return await finish(config.db, row, 'retry', uncertain ? 'acceptance_unknown' : `http_${response.status}`, at, null, retryAt);
  } catch {
    // A write failure after provider acceptance leaves the lease to expire. A
    // same-key retry can reconcile within the window; never claim inbox delivery.
    return { state: 'storage_error' };
  }
}
