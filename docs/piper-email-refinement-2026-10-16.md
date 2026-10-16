# Piper, Allen and approved coastal confirmation — October 16, 2026

## Released

Production deployment `f2a2e9ef-561b-4e4e-9858-828e8ddf8b35` is live on the existing Cloudflare Pages project `obxncinsurance`, in hosting account `1dbb1b29778d5cb32459c281f9b714a5` (Teagan). DNS remains in the separate OBX Proton account. No account migration or credentials change was made.

- Piper launcher uses intrinsic sizing and a non-wrapping “OBX advisor. No spam.” line. Verified at 320px as well as desktop.
- The user's exact Allen introduction is present. The user confirmed Allen is real and the earlier portrait was a placeholder. The generated replacement is visibly captioned “Illustrative portrait”; its alternative text explicitly says it is not a photograph of Allen. Replace it with Allen's genuine photo when supplied.
- Approved email option 2 now has a Piper bird / OBXNC Insurance wordmark in the navy and coral palette, the coastal painting, personalized receipt, relevant preparation, and one reply action. Piper remains the bird tool; human review is described separately.
- HTML and plain text are frozen together at enqueue. Existing stored plain-text payloads are unchanged on retry. Eligibility, channel protections, provider idempotency, rate limits, FormSubmit notifications, and the original form structure remain intact.

## Verification

57 Node tests, production build and preservation guard passed. All 53 live SEO HTML pages matched their locked normalized hashes after deployment; the sitemap hash remains `cba15808af93d331ac00973fcfb71a970b81d59b419ea8582304dfb2ec062336`. GA4 configuration remains `G-9WE296206T`; this release did not change analytics or consent handling.

A single fictional live request to the owned `hello@obxncinsurance.com` inbox generated the branded HTML email. The website accepted request `ce20ac03-2d9a-4742-87db-2638e4bf2a4b`. Resend reported delivered for `01a144fb-e477-74d7-9f2c-b21415ca971e`, and its actual Zoho inbox content and imagery were opened and verified at 9:52 AM Eastern. Sender and reply-to remain the domain mailbox. The test is explicitly marked QA and excluded from customer follow-up; no historical customer was enrolled or emailed.

The controlled inbox displayed the expected wordmark, painting and Georgia font fallback. Zoho also displays “Verified domain. Sender couldn’t be verified” for mail sent through Resend from this same organizational mailbox; its tooltip describes a possible automated sender. This inbox observation is recorded rather than represented as an identity certification. No client-wide Gmail/Outlook, dark-mode or ADA certification is claimed.

Evidence in `audit-evidence/piper-email-refinement/`:
- `allen-live-desktop.png`
- `approved-email.png` — fictional Jamie sample generated from the live renderer
- `zoho-branded-receipt.png` — real delivery to the owned QA inbox
- `live-preservation.json`

Archive SHA-256: `3f92dcc33fe458075ec84ba5058a550e78648923a3d00bbb2db874d1eb8b8744`. JS: `index-Yfg0lup8.js`; CSS: `index-B1QdF9YG.css`. Rollback application target: `3eb4e63e-6ab2-49c9-bcef-18d741b833cc`. Keep the database and subsequent inquiries when rolling back code.

The operating limits in `customer-response-rollout.md` still apply: no unattended retry scheduler/reconciliation, nurture sequence, automated reply suppression or staffed call/text promise has been introduced.

## Portrait provenance and generation brief

Mode: built-in ChatGPT image-generation/edit tool. The available tool does not expose an exact model-version selector. Input edit target: `public/tide-agent-headshot.png`, inspected before editing. Output: `public/allen-illustrative-portrait.png` (2,223,833 bytes), copied unchanged from the generated output. The tool original is retained at `/Users/user/.codex/generated_images/01a1381d-9583-7941-9384-651233765deb/exec-803a6196-e6c4-4fe7-8b2b-6cd880240d5f.png`.

Prompt brief: Transform the existing illustrated headshot into a natural photographic portrait concept, explicitly an AI-generated visual concept rather than a verified documentary likeness. Retain the approximate hair, beard, facial proportions and navy-blue casual shirt. Use realistic pores, smile lines, subtle under-eye texture, flyaway hairs and a relaxed smile. Soft overcast coastal light, softly blurred Outer Banks dune grasses and ocean, eye-level 85mm portrait framing, f/4 appearance, square head-and-shoulders composition with space for a circular crop. Avoid plastic skin, cartoon rendering, glamour retouching, a suit or tie, text, logos and a circular border. Do not borrow another agent's identity.

[Parrish Insurance's team page](https://www.parrishinsure.com/about) was inspected for the casual outdoor coastal agent-photography art direction only. No reference agent's likeness or photograph was copied.

Stable email assets under `public/email/` total 1,961,917 bytes and are exact copies of already approved brand artwork/font, with versioned URLs for sent-mail longevity. The chosen wordmark uses real text beside the approved Piper icon, retaining readable branding with blocked images or a fallback font. These are required production assets, not bulk generated drafts.
