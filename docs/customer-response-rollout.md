# Customer response implementation — October 16, 2026

## Status: live and verified

Production deployment `3eb4e63e-6ab2-49c9-bcef-18d741b833cc` is live on October 16, 2026. An eligible fictional Email first inquiry through the real website produced a personalized Resend receipt from `OBXNCInsurance.com <hello@obxncinsurance.com>`, with reply-to `hello@obxncinsurance.com`. Resend reported delivered at 9:20 AM Eastern, and the message was opened and read in the destination Zoho inbox. D1 recorded `accepted`, one attempt, and the matching provider ID. Existing FormSubmit delivery to Proton was also verified.

This enables one transactional acknowledgment for eligible new Email first requests. It does not enable a nurture sequence, call/text service, automatic retry scheduler or automatic reply suppression. No historical customer was enrolled.

## What is implemented

- Both regular and Piper confirmations use the accepted submission snapshot. They recap the actual contact preference, window, insurance timing, useful preparation and request reference without claiming email was delivered or insurance is in force.
- Shared rules flag imminent deadlines, invalid dates, conflicting contact instructions and document holds. The private desk shows these flags and preserves the requested channel. Current service is email-only; call/text preferences are not silently converted to email follow-up.
- Internal notifications put requested method, timing and next action before the original request; subject lines no longer contain property addresses. Existing FormSubmit destination, validation, browser fallback and lead-table columns remain intact. The lead JSON also retains an opaque submission ID for the acknowledgment.
- Eligible Email first requests can enqueue one personalized transactional receipt after D1 storage. The initial dispatcher runs in the request's background context. Its failure cannot turn a successfully accepted inquiry into an error or redirect internal notification delivery.
- The receipt outbox freezes the message and sender, deduplicates by stable submission ID, uses provider idempotency, limits recipients/requesters, leases send attempts and bounds retries. A provider-accepted state is not a claim that the message was delivered or read.
- The private local desk was restarted to serve its shared module. Customer records, saved drafts, due dates and existing check schedule were preserved. The desk remains local, not a continuously synchronized cloud CRM.

The service design and customer copy are in `customer-response-flow.md`; technical behavior is in `functions/_lib/customerEmail.md`. Where an earlier technical note describes setup as unapplied, the verified deployment status in this record takes precedence.

## Provider and account verification

| Resource | Verified state |
| --- | --- |
| Zoho | User-selected free mailbox service; `obxncinsurance.com` ownership and DNS/MX/SPF/DKIM verified |
| Customer mailbox | `hello@obxncinsurance.com` created using the existing user password, without setting a new password |
| Controlled mailbox test | Outbound mail from the domain mailbox reached the OBX Proton inbox; a reply reached Zoho |
| Resend | `obxncinsurance.com` verified in the existing `fortismobileapp@proton.me` Resend login; receiving, open tracking and click tracking are off |
| Domain DNS | Correct `obxpropertyinsurance@proton.me` Cloudflare account; public DNS resolves the published records |
| Website and D1 hosting | Existing Teagan Cloudflare account, `1dbb1b29778d5cb32459c281f9b714a5`; project `obxncinsurance` |
| Existing admin notification | FormSubmit to `obxpropertyinsurance@proton.me`, preserved |

Published mail records include three Zoho MX records with priorities 10/20/50, Zoho SPF, `zmail` DKIM, Resend DKIM, DNS-only `send` and `rsend` CNAMEs, and `_dmarc` with `p=none`. This is mail setup, not a website-hosting migration. Resend's administrative login address is not the customer-facing sender.

The mailbox round trip and the subsequent real website receipt independently passed. Provider delivery, actual inbox arrival, sender and reply-to were checked.

## Saved production configuration

The following configuration is active in the verified production deployment:

| Setting | Saved value or handling |
| --- | --- |
| `CUSTOMER_EMAIL_ENABLED` | `true` |
| `CUSTOMER_EMAIL_FROM_VERIFIED` | `true` |
| `CUSTOMER_EMAIL_REPLY_TO_VERIFIED` | `true` |
| `CUSTOMER_EMAIL_FROM` | `OBXNCInsurance.com <hello@obxncinsurance.com>` |
| `CUSTOMER_EMAIL_REPLY_TO` | `hello@obxncinsurance.com` |
| `CUSTOMER_EMAIL_RESEND_API_KEY` | Secret containing the approved OBX-domain-only sending key |
| `CUSTOMER_EMAIL_RATE_LIMIT_SALT` | Separate random secret |
| `LEADS_DB` | Existing production binding retained |

No secret values are recorded here. The dedicated customer key is deliberately separate from `RESEND_API_KEY`, which would change the existing internal notification transport. Do not substitute the customer key into that older variable.

## D1 migration

`migrations/customer-email-outbox-0001.sql` was applied and verified in production. The additive `customer_email_outbox` table and indexes coexist with the unchanged `leads` table.

Pre-change D1 Time Travel bookmark:

`0000000b-00000002-00005106-e4867cf2785ebed44fcac84a43ee0060`

This records the state before the migration. Restoring it is not an automatic code rollback: doing so after new inquiries arrive could remove newer records. Prefer disabling customer sending or rolling back the application while preserving lead data; any database restoration requires reconciliation of subsequent writes.

## Verification completed

- **49 Node tests passed:** analytics consent/PII safeguards, response rules, stable submission identity, internal notification behavior, actual outbox SQL through an in-memory D1 adapter, and handler integration with no real customer sends.
- **9 Python desk tests passed**, including module-route access controls and preservation of saved drafts.
- **Production build passed.** The preservation guard retained all 53 existing SEO HTML hashes, route inventory and sitemap hash. SEO baseline hashes were not refreshed to hide changes.
- Mocked tests cover duplicate/conflicting submission IDs, send gates, holds, leases, rate limits, retry limits, uncertain provider acceptance, configuration/schema failures and preserved FormSubmit fallback. These do not substitute for production delivery verification.
- Browser confirmation tests used fictional details and a loopback-only mock endpoint. Both intake paths displayed the submitted email preference and dates correctly. No production customer request was used for those tests.
- Piper's receipt fit a 390 × 844 viewport without horizontal overflow. Done worked; the standard confirmation dismissed with Escape. Evidence contains fictional information only: `audit-evidence/customer-response/form-desktop.png` and `piper-mobile.png`.
- Domain mailbox outbound and return-reply checks passed, as recorded above.

## Material operating limits

- **No retry scheduler is installed.** An eligible repeat of the same submission can retry its durable record; a future trusted consumer could process due records. Failed initial sends do not receive unattended scheduled retries today.
- **Lead save and receipt enqueue are not atomic.** A crash between them can leave a saved lead without a receipt. There is no reconciliation worker closing that gap.
- The outbox deduplicates customer receipts, not the existing `leads` table or its admin notifications. A repeated lead POST can still create another lead record. Do not claim exactly-once intake or delivery.
- Reply routing reaches Zoho, but automated reply/opt-out suppression and continuing follow-up are not connected. No nurture sequence is enabled, and receipt-only handling never authorizes a channel change.
- A Resend acceptance response proves provider acceptance only. Inbox arrival requires delivery evidence or the controlled destination check; it does not prove readership.
- Call/text service is unavailable. Only eligible Email first submissions can invoke the prepared automatic receipt. Other preferences, conflicts, holds, missing configuration or rate limits leave the original inquiry flow intact without substituting email.

## Live release evidence

- Initial release `44713309-3300-4ae9-a282-d4ffec591bbb` exposed a Cloudflare runtime incompatibility: `redirect: "error"` is unsupported. The request never reached Resend. The fix uses `manual` and treats 3xx responses as terminal failures without forwarding credentials. Local workerd reproduction and a regression test verified the correction before redeployment.
- Final release `3eb4e63e-6ab2-49c9-bcef-18d741b833cc`; JS `index-D-Sr6Qc1.js`, CSS `index-Q7PVx7R8.css`. Archive SHA-256 `7212c50f926aed957a33a38da8d64a564e33f0e51f34ee53d54f17c418356a18`.
- Final fictional QA lead: `d0a37895-993f-41e3-a936-4084a3f1b74a`; provider receipt: `01a144de-deac-762d-945f-c071d57a12b3`. D1 accepted on attempt 1. Resend delivered, and Zoho inbox arrival/content verified.
- The earlier unsuccessful QA outbox record was marked `suppressed` / `qa_superseded` to prevent a later retry. Both QA inquiries are explicitly excluded from customer follow-up; no real customer data was used.
- Live preservation check fetched all 53 original pages: no mismatches. Sitemap SHA-256 remains `cba15808af93d331ac00973fcfb71a970b81d59b419ea8582304dfb2ec062336`. The runtime-only correction did not change those assets. Existing consent-gated GA4 `G-9WE296206T` remains in the release; its prior Realtime verification remains documented in the original deployment record.
- The human reviewer introduction is live. At 390 × 844, page width was 390, dialog width 378, portrait 112 × 112; no horizontal overflow.
- The daily 9 AM lead watch was updated to check Zoho customer replies as well as original Proton notifications. It stays quiet without actionable changes and depends on this Mac and authenticated sessions. It does not send messages automatically.
- Evidence: `audit-evidence/customer-response/resend-confirmation-delivered.png`, `zoho-confirmation-received.png`, `human-reviewer-mobile.png`, `live-preservation.json`, and `workers-fetch-runtime-2026-10-16.md`.

The three later visual email concepts are review artifacts only. They do not replace the verified plain-text receipt until the user selects a direction.
