# Customer acknowledgment service

Integrated and live in production release `3eb4e63e-6ab2-49c9-bcef-18d741b833cc`. The controlled website receipt passed Resend delivery and Zoho inbox verification on October 16, 2026. The additive D1 migration and activation settings are applied. These helpers send **one transactional acknowledgment**, not a nurture sequence. No retry scheduler is installed. `accepted` means provider acceptance; actual test inbox delivery is documented separately in `docs/customer-response-rollout.md`.

## Activation gates

All must be explicitly configured on the production host:

- `CUSTOMER_EMAIL_ENABLED=true` (exact string)
- `CUSTOMER_EMAIL_FROM_VERIFIED=true`, set only after the actual sending domain is verified in Resend
- `CUSTOMER_EMAIL_REPLY_TO_VERIFIED=true`, set only after the actual reply mailbox can receive messages and is monitored
- `CUSTOMER_EMAIL_FROM=OBXNCInsurance.com <hello@obxncinsurance.com>` (or a verified OBX domain sender)
- `CUSTOMER_EMAIL_REPLY_TO=hello@obxncinsurance.com`
- `CUSTOMER_EMAIL_RESEND_API_KEY` as a server-side secret restricted to the verified sending domain
- `CUSTOMER_EMAIL_RATE_LIMIT_SALT` as a separate server-only secret of at least 32 characters for IP HMACs
- Existing `LEADS_DB` binding and the additive outbox migration

Verification flags are operator attestations, not a substitute for provider and mailbox verification. The helper does not probe DNS, create accounts or purchase service. The dedicated secret intentionally differs from `RESEND_API_KEY`: setting that old variable would change the existing internal lead notification path.

## Integration contract

1. Both mounted forms now retain one random submission UUID across identical network retries; timestamp changes do not rotate it. Edits and the explicit new-property action reset it. No customer data or identifier is stored persistently or sent to analytics. A page reload creates a fresh form/inquiry; this is not cross-session deduplication. Browsers without UUID support still submit the original lead flow but do not trigger an acknowledgment.
2. The route validates the full lead, filters spam and saves it in D1 as today. It passes only a real saved `leadId` and normalized accepted data to `enqueueCustomerAcknowledgment({env, lead, leadId, submissionId, requesterHash})`. The helper rejects non-email preferences, known conflicts/holds, invalid destinations, and ambiguous dates through the shared response rules. It never substitutes email for a phone/text request. `customerEmailRequestHash` requires the production website hostname, the trusted `cf-connecting-ip` header and the dedicated salt. It computes a 64-character HMAC-SHA256 hash server-side; it never accepts a browser-provided hash or uses `x-forwarded-for`. Missing configuration or IP skips only the acknowledgment.
3. After a matching eligible enqueue returns `queued`, `retry` or `sending`, the route invokes `dispatchCustomerAcknowledgment({env, submissionId})` through `context.waitUntil`. No sender is called for ineligible/conflicting enqueue results. Customer sender latency/failure does not change FormSubmit delivery, the original receipt response, or conversion outcome. The original D1 `payload_json` gains the opaque `submissionId`; no existing lead-table columns or operator notification fields change.
4. A future trusted worker can inspect due `queued`/`retry` rows and expired `sending` leases, then call the same dispatcher. No retry worker is installed here. Without one, failed attempts remain durable but are not retried automatically. Never expose dispatch through a browser endpoint or use `/api/lead-delivery` as proof of permission/delivery.
5. Before enabling retries, integrate revocation/new customer instructions and human takeover: mark an unsent outbox row `suppressed` through authenticated operations; dispatcher will not claim it. An already in-flight provider request cannot be recalled by changing a database status. Alert on `review`, `failed`, stale leases and `storage_error` without putting personal data in logs. Do not mark an auto-receipt as a first human response.

The helper does not deduplicate the existing `leads` table. The lead handler should separately honor the same submission ID. A crash between saving the lead and enqueueing its acknowledgment can leave a saved lead without an acknowledgment; an audited reconciliation job or a future atomic D1 batch integration is needed to close that gap. Do not claim exactly-once delivery or guaranteed instant service.

## Delivery and duplicate protection

- The additive table has one row per stable submission ID and a foreign key to its original lead. Repeated identical requests preserve the stored message and terminal status; conflicting reuse is rejected. The hash includes the original contact/timing instructions. Templates and sender fields are frozen on first enqueue.
- Enqueue atomically caps **3 receipts per recipient per rolling hour and 5 per rolling 24 hours**. If `requesterHash` is supplied, the additional cap is **20 per rolling hour and 50 per rolling 24 hours** across recipients. The quota check and insertion occur in one D1 SQL write, so concurrent new IDs cannot bypass them. Retries of an existing ID consume no additional capacity. All states count; failed sends do not replenish quota. A `rate_limited` result must leave the saved lead and normal FormSubmit response intact. Missing `requesterHash` means recipient protection only; production integration should provide it. These defaults may defer a legitimate repeated-property receipt, while preserving the actual inquiry for a human. They are not a complete bot defense or proof of mailbox ownership.
- A conditional D1 `UPDATE ... RETURNING` grants a 60-second lease to one dispatcher. Fetch has a 10-second timeout. A crashed worker's expired lease can be recovered with the same key and bytes.
- Resend receives `Idempotency-Key: obx-receipt/<submission UUID>`. Disconnects, 408, 5xx, malformed success responses, 429 and concurrent-key 409 are retried with that same key/body. Other HTTP errors and redirects become terminal failures. Manual redirect mode is required by the Workers runtime and prevents forwarding credentials or request content to another location. Provider response bodies are not stored or logged.
- At most five attempts; backoff and `Retry-After` respected. No send occurs once the row or first attempt is 23 hours old. Remaining ambiguous/stale work becomes `review`. Resend's key retention is 24 hours, so never create a fresh key merely to retry an uncertain send after expiration.
- `accepted`, `failed`, `review` and `suppressed` remain terminal. Retain their idempotency tombstones while those submission IDs can be retried; deleting rows removes duplicate protection. A retention policy must address the PII in `request_json` without discarding the deduplication record prematurely.
- The shared module recognizes structured choices and common explicit restrictions; it does not understand every possible free-text instruction. Unknown or complex requests need human review. There is no AI call here, no claim of a licensed assignment, no promised response time, and no automatic call/text.

Email bodies contain a short personalized receipt and relevant known timing/preparation, not raw notes or full addresses. The approved coastal HTML design includes the Piper / OBXNC Insurance wordmark, painting, escaped personalization and a matching plain-text alternative. Both representations are frozen together on first enqueue; preexisting plain-text requests keep their original payload on retry. Versioned public assets have no tracking parameters. Georgia is the fallback when Fraunces is unsupported. No CC/BCC, attachments, open tracking, or marketing enrollment is requested. Configure provider open/click tracking off as well. Reply routing belongs to the verified domain inbox; existing FormSubmit operator delivery remains untouched.

## Verification

`npm test`

Tests use an in-memory SQLite-backed D1 mock and injected fake fetch responses. They exercise actual migration/SQL syntax, duplicate and concurrent attempts, changed-input collisions, no-send gates, uncertain acceptance and persistence failures, retry limits/expiry, sender changes and missing tables. Handler integration tests verify that the original lead/admin response survives slow and failing customer delivery, absent gates/schema/IP, and the existing FormSubmit browser fallback. Submission-identity tests cover retry/edit/new-inquiry behavior. They make no network requests and use no real customer data. Production D1 acceptance and controlled real inbox delivery passed; the test evidence is in the rollout record.

Official sources checked October 16, 2026: [Send email API](https://resend.com/docs/api-reference/emails/send-email), [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys), [Error codes](https://resend.com/docs/api-reference/errors).
