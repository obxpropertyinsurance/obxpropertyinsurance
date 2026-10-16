# OBX customer response flow

Updated October 16, 2026. Internal service design and launch specification.

Phase one is **email automation with a dedicated OBX domain inbox**. A call team has not been established, and text service is not connected. The experience should feel like a kind, capable person has listened: acknowledge the request, remember the details, respect the customer's instructions, and make the next step clear.

An automatic receipt is not a human response, agent review, quote or confirmation of insurance. Advice, eligibility, quotes and binding remain with the licensed professional handling the request.

## Current setup and launch boundary

The user chose **Zoho's free mailbox option** and **Resend for transactional automation**. These services have different jobs: Zoho receives customer replies and supports human correspondence; Resend sends the permitted automated receipt. Neither replaces the existing FormSubmit notification until a separately tested cutover is authorized.

| Component | Current state | Still required |
| --- | --- | --- |
| Zoho account/domain | Free account and `obxncinsurance.com` verified, including DNS/MX/SPF/DKIM | Maintain monitored access |
| Customer mailbox | `hello@obxncinsurance.com` created with the existing user password; controlled send to OBX Proton and reply back to Zoho passed | Assign ongoing inbox coverage |
| Resend | `obxncinsurance.com` verified in the selected `fortismobileapp@proton.me` login; receiving, open tracking and click tracking are off | Website receipt delivered and read in the controlled inbox |
| Cloudflare DNS | Correct `obxpropertyinsurance@proton.me` account used; published mail records resolve publicly and provider checks passed | Preserve existing website records |
| Production email configuration | OBX-restricted sending key and random rate-limit salt saved as secrets; verification/enabled flags and sender/reply address saved | Active in verified production release |
| Existing lead delivery | D1 storage plus FormSubmit notifications to `obxpropertyinsurance@proton.me` | Preserve while the new service is tested |
| One-off receipt outbox | Additive D1 migration applied and verified; existing `leads` table unchanged | Controlled website receipt verified |
| Follow-up automation and reply suppression | Not connected | Remain off; a receipt must not start a drip sequence |
| Call and text service | Unavailable in phase one | Do not promise either or silently replace a requested call/text with email follow-up |

**The website receipt automation is live and verified.** Production release `3eb4e63e-6ab2-49c9-bcef-18d741b833cc` delivered a controlled new Email first submission through Resend to the owned Zoho inbox at 9:20 AM Eastern on October 16. Existing FormSubmit internal notifications remained intact. Full evidence and operating limitations are in `customer-response-rollout.md`. Only the one-time receipt is enabled; continuing follow-up is not automated.

The following mail records are published and resolve through public `dig` checks. Zoho and Resend provider verification passed.

| Published records | Detail |
| --- | --- |
| Zoho MX | Three records with priorities 10, 20 and 50 |
| Zoho SPF | Published |
| Zoho DKIM | `zmail` selector published |
| Resend DKIM | Published |
| Resend CNAMEs | `send` and `rsend`, both DNS-only |
| DMARC | `_dmarc` published with `p=none` |

The Resend login is separate from the Proton Cloudflare DNS account. Its login email is an administrative identity, not the customer-facing sender. The website and D1 hosting remain in the existing Teagan Cloudflare account; this email setup is not a hosting migration.

The saved production sender is `OBXNCInsurance.com <hello@obxncinsurance.com>` and reply-to is `hello@obxncinsurance.com`. `CUSTOMER_EMAIL_ENABLED`, `CUSTOMER_EMAIL_FROM_VERIFIED` and `CUSTOMER_EMAIL_REPLY_TO_VERIFIED` are saved as `true`. The approved OBX-only sending key is held in `CUSTOMER_EMAIL_RESEND_API_KEY`, and a separate random secret is held in `CUSTOMER_EMAIL_RATE_LIMIT_SALT`; no secret values belong in this document. These settings are active in the verified production release.

The D1 pre-change Time Travel bookmark is `0000000b-00000002-00005106-e4867cf2785ebed44fcac84a43ee0060`. It records the database state before the additive migration; it is not an instruction to roll back newer leads. The detailed deployment status is in `customer-response-rollout.md`.

FormSubmit documents that `_autoresponse` does not work for AJAX submissions or forms with reCAPTCHA disabled. OBX currently uses its AJAX endpoint with `_captcha=false`; adding `_autoresponse` cannot activate confirmations for this flow. Keep FormSubmit's established internal delivery while the Resend receipt is added separately. [FormSubmit documentation](https://formsubmit.co/documentation)

## Receipt versus follow-up

Every accepted submission receives an on-screen acknowledgment. A **transactional email receipt** is one acknowledgment of that submission. **Email follow-up** starts or continues a service conversation. They need separate event types, eligibility and suppression checks.

The prepared implementation sends only for an eligible **Email first** request with no review/hold conflict. Call/text and unknown preferences receive the on-screen acknowledgment only. The broader receipt-policy options below do not override this stricter implementation or activate additional outreach.

| Customer instruction | One email receipt | Subsequent email follow-up |
| --- | --- | --- |
| Email first | Only under the approved receipt policy and normal suppression checks | Eligible once the domain inbox and responsible operator are ready |
| Phone call or Text first | Only if the disclosed receipt policy and applicable permission support email acknowledgment, with no contrary restriction | Not automatically eligible; require an explicit change to email |
| No preference | Apply the documented receipt policy; review ambiguity | Owner review or an explicitly disclosed email default; do not claim email was requested |
| No email, no contact, opt-out, document hold or conflicting instructions | Suppress or hold for review; no assumed receipt exception | Suppress or hold according to the instruction |

Providing an email address does not erase a channel restriction. Establish and record receipt eligibility before activation. A permitted receipt to a call/text requester must preserve the preference, disclose that the requested service is unavailable, and make no callback promise. It cannot mark the requested human contact complete or enroll the customer in email follow-up.

If the customer replies that email help is welcome, record that instruction and open the email follow-up task. Otherwise keep the unavailable-channel exception visible for operator review. Urgency never cancels a restriction.

## Customer experience and copy

Build the confirmation from an immutable snapshot of the accepted submission. Keep personal details in page memory, outside browser storage, URLs and analytics. Use “saved” only when database storage is confirmed; otherwise use “received.” A failed submission needs an error and recovery path, not a success receipt.

The receipt should show, in order: a warm acknowledgment, the actual goal/property/timing, the contact preference and window, an honest next step, and one helpful preparation suggestion. Do not call a needed-by date a closing date unless the customer said it was. Never claim an agent is reviewing now or promise a response time without operational support.

The following examples are illustrative and contain no customer records. Email templates are for use only after the appropriate eligibility, inbox and sender checks pass.

### On-screen acknowledgment

> Thanks, Alex. We've got your request.
>
> We received your request for help with insurance for your home purchase. We've included October 23 as the date you need coverage.
>
> Your contact preference: Email first. Your questions and preferences are included for review.
>
> If your lender gave you insurance requirements, keep them handy for your review.

For a call request, explain: “We noted your preference for an afternoon call. We're building our call team, so a call has not been scheduled. Your preference remains on your request.” For text first: “Text follow-up isn't available yet. We haven't changed your preference to email.”

For a document hold: “You asked us to wait until you send documents. That instruction is included with your request.” For ambiguity: “Your contact or timing instructions need a human check before follow-up.”

Keep the preparation line relevant and brief:

| Request | Useful preparation |
| --- | --- |
| Buying or closing | Lender's insurance requirements, if provided |
| Renewal | Current declarations page and renewal notice |
| Current policy review | Policy details and the specific question to resolve |
| Vacation rental | How the property is rented |
| Flood question | Existing flood policy or elevation certificate, if available |
| Research | Reassurance that not every property detail is required to begin |

Do not ask for sensitive documents through an unverified destination. The responsible person should provide appropriate sharing instructions when needed.

### Email receipt — email first

From and reply-to after verification: `OBXNCInsurance.com <hello@obxncinsurance.com>`.

Subject: We received your OBX insurance request

> Hi Alex,
>
> Thank you for reaching out. We received your request for help with your home purchase and noted the date you need coverage. We'll follow up by email, just as you asked.
>
> If your lender provided insurance requirements, keep them handy for your review. You don't need to start your request over.
>
> Thank you,
> The OBXNCInsurance.com team

### Receipt only — call/text requested, only when email receipt is permitted

Subject: Your OBX insurance request was received

> Hi Alex,
>
> Thank you for reaching out. This email confirms that we received your insurance request and noted your preference for a phone call. It doesn't change that preference.
>
> We're currently providing help by email while we build our call team, so a call has not been scheduled. If you'd like help by email instead, reply and let us know. We won't start email follow-up unless you choose it.
>
> Thank you,
> The OBXNCInsurance.com team

For text first, replace the channel-specific sentences with: “We noted your preference for text first. Text follow-up isn't available yet.” Do not send this template if receipt eligibility is unresolved or email is restricted. Do not schedule another message merely because the customer does not reply.

### Human email follow-up — one missing item

> Hi Alex, I'm following up on your request. The next helpful detail is [specific missing item]. If your timing has changed, please let me know so we can keep the review focused on what you need now.

Only use this for email-eligible requests. A closing response can say: “Thank you for letting us know. I'll close this request so you won't receive further follow-up about it.” Do not imply a policy exists unless that outcome is actually confirmed.

## Preference and timing rules

- Phone/text selections become unavailable-channel exceptions, not promised appointments. Keep their original preference until the customer explicitly changes it.
- Email first permits email handling within the applicable request, window and suppression rules; it does not authorize unrelated marketing.
- “After I send documents” holds proactive outreach. A nearby deadline may alert the owner internally but cannot override the hold.
- Respect the requested window and clarify its time zone when unknown. Eastern time is the proposed OBX operating zone, not proof of the customer's location.
- Contradictory notes, unknown choices or conflicting channel/window values require review before outreach. Read the original request; heuristic flags are not a complete understanding of free text.
- The current default “Phone call” plus “As soon as available” is not evidence of affirmative consent. The guide's “Email first” contact-window value can contradict its contact-method value.

The shared builder in `src/leadResponse.mjs` returns plain-text copy, channel, priority, review/hold flags, reasons and a next action. Draft helpers do not prove that a provider is connected. Phase-one delivery must apply the email eligibility rules above and keep call/text sending disabled.

The standard form accepts a structured needed-by date; Piper also accepts free text. The current routing contract is:

| Input | Routing |
| --- | --- |
| Valid needed-by or policy-expiration date today or within the next two New York calendar days | `urgent` |
| Either valid date three to seven calendar days away | `soon` |
| Valid later date, or no date and no ambiguity | `standard` |
| Past date | Urgent plus human review of the current timeline |
| Free text, invalid date, missing/unrecognized channel or conflicting restriction | Human review; never invent a date |

The earlier valid deadline controls urgency. A hold or review flag does not erase an urgent/soon flag; it restricts outreach while preserving the internal priority. Without an urgent/soon date, an unresolved instruction produces `review`. “Friday,” “ASAP” and ambiguous numeric dates must not be converted into guessed deadlines.

## Operational stages and accountability

Every open request needs an actual owner, next action and due timestamp. A backup owns overdue or unassigned work. In phase one these roles cover email and capability exceptions, not an unstaffed call service. Record the people, hours, holidays and escalation destination before making service-time promises.

| State | Required action | Exit condition |
| --- | --- | --- |
| Receipt | Confirm acceptance and create one routing record | Routing record exists |
| Needs assignment | Assign an available owner or alert the backup | A real owner accepts responsibility |
| Contact due | For email-eligible requests, send the human response at the permitted time | Attempt and outcome recorded |
| Waiting for customer | Record the exact reply/document awaited and any permitted follow-up time | Customer replies, supplies it or changes instructions |
| Review | Handle the request or coordinate licensed review; record the next step | More information needed or explicit outcome reached |
| Closed | Stop pending contact and record the reason | Only a new or explicitly reopened request restarts service |

Normal progression: receipt → needs assignment → contact due → waiting for customer or review → closed. Review can return to waiting for customer. A reply requires owner attention before another scheduled message; a stop request can close the case at any stage.

Call/text requests without an explicit switch to email stay in review with an unavailable-channel flag. A receipt-only email does not advance them to contact due or count as completed service.

Delivery status is separate: queued, provider accepted, delivered, failed, human responded and customer replied are distinct facts. An automatic receipt never resets the first-human-response clock.

The private desk is local SQLite on the operator's Mac, separate from production D1. Its daily browser monitor is a secondary safeguard, not continuous cloud assignment or reply detection. Do not describe its refresh or a prepared outbox as an always-on CRM.

The initial receipt dispatcher uses the accepted request's background context. **There is no retry scheduler.** A repeat of the same submission can retry its eligible outbox record; a future trusted consumer could do so as well. A crash between saving a lead and enqueueing the receipt can leave a saved request without an acknowledgment. There is no atomic save-and-enqueue or reconciliation worker yet. The outbox deduplicates receipt attempts, not the original `leads` table or internal notifications. Do not promise exactly-once delivery or guaranteed instant service.

## Proposed service targets and escalation

These are proposed measures to validate with actual staffing, not industry benchmarks, active guarantees or public promises.

| Measure | Proposed target |
| --- | --- |
| On-screen acknowledgment | Within one second after confirmed acceptance; measure total submission latency separately |
| Eligible transactional email receipt | Within 60 seconds after acceptance once Resend is connected |
| Assignment | Within two minutes during staffed hours; completed only when an owner accepts |
| Urgent first human email | Within five minutes during staffed/permitted hours for email-eligible requests |
| Standard first human email | Within 15 minutes during staffed/permitted hours for email-eligible requests |
| Restricted or after-hours request | First eligible staffed window, or the customer's later condition |
| Unavailable requested channel | Prompt owner review at the same urgency level, without a call/text promise |

At a target breach, alert the owner and backup with the request ID, urgency reason, restriction and due time. Require an acknowledged takeover. If nobody is available, surface the exception instead of sending reassurance that conceals the delay.

For email-eligible requests after a first human response, propose one later follow-up inside the allowed window and one on the next eligible business day, subject to owner review. Receipt-only messages have no sequence. Do not mark a silent customer resolved or create an endless nurture campaign. Automated follow-up remains off until reply and stop handling are connected.

## Stop rules and delivery safeguards

1. **Reply:** Pause pending follow-up and create owner review. A reply is not an instruction to advance to the next template.
2. **Stop or changed preference:** Suppress the relevant contact immediately, review wider restrictions and retain a minimal suppression record so reimports cannot restart contact. Invalidate tasks using old preferences.
3. **Hold or closure:** Recheck document holds and closure before sending. Closed, test, honeypot and confirmed duplicate requests cannot enter a sequence.
4. **Failure:** A bounce or provider failure creates an internal exception. Do not switch channels, claim contact occurred or repeatedly ask the customer to resubmit.
5. **Stable identity:** Use a stable request ID and submission idempotency key. A retry must not create another service case or receipt.
6. **Durable outbox:** Store acceptance and its intended event transactionally, or reconcile interrupted writes. A background callback alone is not a reliable retry queue.
7. **Deduplication:** Use unique event keys and distinct receipt/follow-up events. Pin the template version at event creation; a copy update cannot generate another acknowledgment. Deduplicate provider events too.
8. **Verified delivery:** Provider evidence determines delivery status. The browser-reported `/api/lead-delivery` flag cannot authorize customer messaging or prove receipt.
9. **Bounded retry:** Retry transient errors with backoff. A timeout after provider acceptance is ambiguous; check the provider's idempotency/message record before resending. Permanent failures require owner attention.
10. **Send-time eligibility:** Recheck receipt/follow-up permission, suppression, reply, channel, window, hold, closure and deduplication immediately before sending. A receipt never grants follow-up eligibility.

Queue identifiers rather than full customer payloads; fetch only necessary data server-side. Keep PII and message bodies out of public analytics, URLs, logs and build artifacts. Audit the template, factual inputs, sender, provider ID and timestamps separately from human action.

Use tested templates and submitted structured values for personalization. Do not send unrestricted notes to an external generative model or let a model decide contact permission, coverage advice or response promises. Any future model connection needs a separate privacy and operational review.

## Launch checks

### On-screen and operator assistance

- [ ] Both intake paths render the shared receipt only after acceptance, using the submitted snapshot.
- [ ] Email, call, text, no-preference, unknown, conflicting-window and document-hold cases behave honestly.
- [ ] Dates and free-text timing are preserved without invented deadlines or closing-date claims.
- [ ] Receipt rendering and draft generation send no customer messages.
- [ ] Internal notices and desk actions retain preference, urgency and review/hold flags.
- [ ] Existing D1/FormSubmit behavior, validation, intake steps, URLs, SEO and sitemap are preserved.
- [ ] Mobile, keyboard, focus and live-region behavior are verified; personal details remain outside analytics and persistent browser storage.

### One-off receipt activation — not yet complete

- [x] User selected free Zoho mailbox service and Resend automation.
- [x] Zoho account created and `obxncinsurance.com` added; user completed password/terms steps.
- [x] Access the correct Proton Cloudflare DNS account and complete Zoho TXT ownership verification.
- [x] Create `hello@obxncinsurance.com` using the existing user password; no new password set.
- [x] Publish the three Zoho MX records, Zoho SPF and `zmail` DKIM, Resend DKIM, DNS-only `send`/`rsend` CNAMEs, and `_dmarc` with `p=none`; confirm public DNS resolution.
- [x] Complete Zoho DNS/MX/SPF/DKIM and Resend domain verification; Resend receiving/open/click tracking are off.
- [x] Prove the domain mailbox can send to the controlled OBX Proton inbox and receive its reply.
- [x] Save the approved OBX-only Resend key and random salt as Cloudflare secrets; save the verified sender/reply-to and all three activation flags for the next deployment.
- [x] Apply and verify the additive D1 outbox migration beside the unchanged `leads` table; record the pre-change Time Travel bookmark.
- [ ] Keep existing FormSubmit admin delivery intact; any later recipient cutover is separately verified.
- [ ] Finalize and test receipt eligibility, including call/text preferences, no-email notes and document holds.
- [x] Pass 48 Node tests, 9 lead-desk tests, production build and the 53-page SEO/sitemap preservation guard.
- [ ] Deploy the prepared release and verify the actual website receipt through Resend to a controlled test destination, with a reply reaching Zoho.
- [ ] Add future reconciliation/atomic save-and-enqueue, retry scheduling and operational failure alerts; current tests do not make those capabilities live.
- [ ] Assign a monitored inbox owner and backup; update privacy notices to describe only the providers and handling actually activated.
- [ ] Confirm the deployed one-off receipt is live; keep all follow-up automation and call/text sending disabled.

### Later follow-up activation — separate release

- [ ] Connect reliable reply, stop, preference-change and closure events; prove they cancel queued messages and are checked again at send time.
- [ ] Establish continuous authenticated assignment and visibility independent of this Mac/browser.
- [ ] Verify a real owner, backup, staffed windows and escalation process; prove targets before publishing response-time commitments.
- [ ] Keep receipt-only recipients out of email follow-up unless an explicit change or other documented eligibility supports it.
- [ ] Test a full reply-to-suppression cycle before enabling any follow-up sequence.

Track receipt latency, assignment time, first human email, first two-way conversation, overdue urgent requests, unavailable channels, explicit changes to email, delivery failures, contact after a reply and explicit closure outcomes. Show the oldest unattended urgent request prominently. Receipt-only delivery is not a completed human response or resolved insurance need.
