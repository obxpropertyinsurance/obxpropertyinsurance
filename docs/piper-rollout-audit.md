# Piper visual rollout and privacy/accessibility review

Reviewed October 15, 2026; deployed and verified October 16, 2026. The visual release, privacy/accessibility pages and consent-aware GA4 are live. This review does not legally certify the website.

## Scope and content protection

The production React application uses Piper's approved Fraunces typeface, navy/cream palette, painted house, rounded controls and mascot. The same stylesheet covers the homepage, all 52 insurance/guide pages, the existing guided intake, quote form, confirmation dialog and two policy pages. Uppercase styling is removed. At the user’s request, Piper’s bird remains on the launcher while the original human advisor portrait is retained inside the open guide. The user subsequently approved renaming Tide to Piper. Visible copy, accessible names, guide metadata and the intake note label now use Piper; the existing guide URL, storage keys and event identifiers remain unchanged.

No sections, question steps, form fields, answers, CTA destinations, submission handlers, FormSubmit fallback, database binding or delivery recipients were replaced. Changes to App markup are image references, accessibility annotations and the approved name substitution only. The protected-source comparison enforces this boundary.

`node scripts/verify-piper-rollout.mjs` checks:

- All 53 pre-existing generated HTML pages have exactly the same content after normalizing versioned asset filenames and the approved Tide-to-Piper name substitution. This includes their titles, descriptions, canonical links, structured data, headings and static body.
- SEO data, robots, middleware, lead handlers and deployment binding remain locked.
- The built sitemap is byte-for-byte identical to the live site's 53-URL sitemap retrieved on October 15. The earlier undeployed release had included two policy URLs; those pending sitemap additions were removed to honor the current instruction. Policy pages remain reachable from footer and form links.
- App source changes are limited to the explicitly allowed image, accessibility and name substitutions.

CI runs the guard after the production build. The lock is specific to this visual rollout; future intentional content or workflow changes need a separately reviewed update.

## Privacy findings and notice

The published-build notice at `/privacy-policy/` now describes the private lead-management database, correspondence, statuses, reviewer assignments, follow-up dates and internal service notes. It also covers submitted contact/property information, technical request information, FormSubmit, Proton Mail, optional D1/Resend configuration, optional Google Analytics, browser preferences, retention, access/correction/deletion requests and a privacy contact.

Confirmed from source and the existing lead-desk setup: the desk is loopback-only; customer records are outside the repository/public build; the local data directory and SQLite file use restrictive permissions; records are not automatically purged. The notice does not promise an invented deletion period, encryption at rest, a certification, or a verified live D1 binding. The external generative-AI claim is also bounded: the production guide uses prepared responses, with no model-provider conversation endpoint in the inspected code.

The form and guide link to the privacy notice at collection; every public page template exposes Privacy policy, Accessibility and Analytics choices. The policy content is also generated as HTML for users without JavaScript. Optional analytics still requires consent and excludes personal form contents.

Outstanding operational/legal items: confirm the legal operator and licensed review relationship, adopt a documented retention schedule consistent with applicable insurance recordkeeping duties, confirm vendor/account access and production storage settings, and obtain qualified legal review of applicable notices and safeguards. No customer data was deleted and no production storage configuration changed in this work.

## Accessibility verification

Target: WCAG 2.2 Level AA, using axe-core 4.14 WCAG 2.0/2.1/2.2 A/AA tags and best practices, plus selected manual checks. The public accessibility statement describes this as an ongoing target, not full conformance or ADA certification.

- All 55 routes scanned at 1280 × 720 and 390 × 844: zero automated violations after fixes (110 route scans).
- The optional-details quote step also passed at mobile size. The guide opening/review states passed automated checks; keyboard selection, validation, focus containment, Escape and focus return were exercised.
- Reflow inspected across all routes at 320 CSS pixels. Two FAQ layouts with long text initially clipped; wrapping/min-width corrections resolved both. The intentionally hidden honeypot is excluded from visible-content reflow findings.
- The guide address input now exposes required/invalid state and its error description, allowing the existing focus handler to place focus correctly.
- The horizontally scrolling rates table is keyboard focusable and has a distinct accessible region name.
- Named control groups have valid group semantics instead of labels on generic divs.
- Existing reduced-motion and focus-visible styles are retained. Close/minimize touch targets are at least 44 CSS pixels.
- Body text contrast: 7.81:1; heading/navy on cream: 13.69:1; accent text: 5.88:1; active progress number: 7.22:1; progress labels: 6.07:1; inactive numbers: 6.13:1; focus ring on cream: 6.02:1.

Automated results include incomplete contrast checks around chart/progress pseudo-elements, gradients and floating overlaps; these are not passes. The progress foreground/background combinations were calculated manually. Remaining assistive-technology and browser coverage must include actual VoiceOver/NVDA speech, text-only enlargement, forced-colors behavior, complete submission/confirmation and third-party delivery failure states. A clean scan cannot certify ADA compliance. No new live lead was submitted during QA; the unchanged delivery code is protected by the source guard.

Evidence: `docs/audit-evidence/piper-rollout/accessibility.json`, `home-desktop.png`, `home-mobile.png`, `privacy-mobile.png`. Earlier failing/recheck entries are labeled separately in the JSON; final route results are under `finalRouteScans`.

## CTA spacing and name follow-up

The quote-card CTA inherited zero horizontal padding from its original text-link rule. The shared button treatment now includes 28 px side padding on desktop, 24 px on narrow screens, a 12 px icon gap and a minimum 54 px height. Navigation and guide buttons retain purpose-specific sizing. Long labels wrap; SVG arrows do not shrink; action groups have a 16 px gap. The mobile quote-card CTA and form actions use the available width.

Verified the homepage, homeowners landing-page CTAs and Piper guide at desktop and 320/390 px mobile widths: no CTA horizontal overflow. The build and seven analytics tests pass. The protected source/HTML/sitemap guard passes while allowing only the approved brand-name substitution. Fresh 320 px homepage and open-guide axe checks report zero violations, with pre-existing contrast items still needing manual review. No production test lead was sent.

Evidence: `cta-desktop.png`, `cta-mobile.png`, `cta-accessibility.json` in the same evidence directory.

## Deployment and analytics status

The release was deployed on October 16, 2026 to the existing Cloudflare Pages project in Teagan@courtsideviewapp.com's account. The domain's DNS remains in the separate obxpropertyinsurance@proton.me account. The existing production D1 binding was verified and preserved; no DNS, database schema, hosting migration or lead endpoint change was made.

Production deployment `48f251f2-4793-4975-994c-90bd3dc0bf81` serves `index-DXX1hwnt.js`. All 55 public HTML pages match the approved build exactly, and the live 53-URL sitemap remains byte-for-byte identical. Live canonical/trailing-slash redirects, unknown-route 404s, API OPTIONS and empty-payload lead validation passed. No valid test lead or synthetic conversion was submitted.

GA4 `G-9WE296206T` is live: the OBX property's Realtime report showed the consented verification visit, CTA/UI clicks, `funnel_start`, `funnel_step_view` and `funnel_step_complete`. Live checks confirmed no Google analytics script before consent or after declining, loading of the correct measurement tag after grant, and no tag after withdrawing consent and navigating to another page. Piper's original human advisor portrait loaded successfully. See [the deployment record](deployment-record-2026-10-16.md) for account identifiers, rollback reference and evidence.

## Primary references checked

- [DOJ web accessibility guidance](https://www.ada.gov/resources/web-guidance/) — business accessibility obligations, practical guidance and limits of automated checks.
- [W3C WCAG overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — technical accessibility standard.
- [FTC guide to protecting personal information](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business-0) — inventory, access, minimization, retention and disposal practices.
- [North Carolina Chapter 58, Article 39](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_58/Article_39.html) — insurance privacy and safeguard obligations whose application requires the operator's legal context.
- [FormSubmit documentation](https://formsubmit.co/documentation) and [privacy terms](https://formsubmit.co/privacy.pdf) — delivery and vendor-held submission copies. Vendor retention does not delete the operator's separate email/database copies.
