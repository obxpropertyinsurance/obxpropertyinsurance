# Site-wide guide design release — October 16, 2026

Production deployment **9ae115d1-d63f-4947-914a-3be435f4fb73** publishes the owner-approved Duck design across all 50 town and guide pages. All 53 canonical pages use the shared full-width footer. Policy content remains in a responsive frame. Static and Worker 404 pages also use the cream, navy and Piper branding.

Breadcrumbs now follow **Home > North Carolina Home Insurance > Duck, NC Home Insurance**. All 21 locations have explicit place names and initial capitals. Other guides preserve acronyms. Visible breadcrumbs and BreadcrumbList JSON-LD share one helper. The middle link keeps its existing atlas destination; URLs and the sitemap remain unchanged.

## Design

The layout adds larger photography, an early quote CTA, a contrasting navy Piper panel, an optional preparation checklist, compact editorial sections, FAQ disclosures, official resources and grouped footer links. Duck uses a 1280px Wikimedia image by Watts, CC BY 4.0, with attribution, license and crop disclosure. Other pages retain their images.

The floating Piper launcher hides while the hero, inline Piper panel or footer is visible. Desktop question access is restored. The inline Piper button opens the existing guide with questions available. The mobile wordmark is larger while retaining its approved terracotta.

## Preservation and verification

- Compared all 54 generated HTML documents against the previous release. Titles, metadata, H1/H2/H3 content, substantive paragraphs and homepage form attributes match. Previous link destinations remain, except the approved Duck photo attribution replacement.
- The 53-page sitemap hash is unchanged. SEO data, policy text, analytics, intake validation, lead API, outbox and emails are unchanged. Middleware edits are limited to the 404 template; all code outside it is byte-identical.
- All 66 Node tests and 10 Lead Desk fixture tests passed. Production build, Worker compilation, SEO checks and the updated 47-source preservation guard passed.
- Audited all 53 routes at 1440×1000 and 390×844: zero axe A/AA violations and zero horizontal page overflow. Main images loaded, each page has one H1, and all footers span the viewport. Ten additional checks at 320px and 900px passed.
- One contrast check was incomplete because the development audit panel overlapped the trust-page heading. Its actual text is navy on cream. These automated checks are not an ADA or WCAG certification; assistive-technology user testing was not performed.
- Manually checked desktop and phone layouts, Piper questions and answer links, Escape and focus return, and contextual quote navigation. No customer lead or email was submitted.
- The compiled Worker package served exact build HTML and sitemap locally and returned branded 404s. The installed local Wrangler runtime uses an older compatibility date; production retains the configured 2026-07-03 date.
- All 53 live HTML pages and 10 shared assets match the local build. Live Duck and Kitty Hawk breadcrumbs, mobile Piper, footer width and browser console were checked. Missing pages and JSON resources return branded 404 responses with noindex.

## Release and rollback

Client: `index-Balxh5Dj.js`. CSS: `index-ykYflMyM.css`. GA4 configuration `G-9WE296206T` and consent controls remain unchanged. Incoming Analytics reports were not independently revalidated in this design release.

The uploaded archive was 5,351,371 bytes, SHA-256 `8e416c8677a8a10a0db8d04232b4d6f1fa88f01d9949641c262f6161238d9a15`. It was uploaded to the existing obxncinsurance Pages project after verifying its production domains. No DNS, binding, credential, database or customer-record changes were made.

Rollback: deployment **7148d7da-c271-4eff-b4fa-6f6e3df675c4**. No database rollback is needed.

Public UI evidence and audit JSON are local in `docs/audit-evidence/guide-rollout/`. Temporary upload, compile, archive and test-state files under `/tmp/obx-guide-rollout/` are removed after verification. Existing dependencies, approved assets and unrelated work are retained.
