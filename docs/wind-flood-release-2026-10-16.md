# Dedicated Wind & Flood page — October 16, 2026

Production: https://www.obxncinsurance.com/outer-banks-wind-flood-insurance/

Deployment: **f19fd541-1772-40c0-b16b-04a16be34550**, in the existing obxncinsurance Cloudflare Pages project. Rollback: **9ae115d1-d63f-4947-914a-3be435f4fb73**; no database rollback is required.

The owner requested a dedicated Wind & Flood page in place of the homepage scroll destination. The new combined guide covers coordinating home, wind and flood policies, deductibles, closing dates and preparation. It links to the existing wind/hail and flood guides for deeper coverage questions. Copy was checked against the linked NC DOI wind and flood resources and FloodSmart buying guidance.

Desktop and mobile navigation and the shared footer now point directly to the new URL. A homepage contextual link, atlas listing, sitemap entry and llms.txt listing help discovery. The page has a distinct title, description, canonical, H1, Article, FAQ and BreadcrumbList schema. It uses the approved responsive guide layout and existing attributed coastline photograph. The old homepage anchor remains available for bookmarks.

## Verification

- All 50 existing guide data records and homepage metadata remain identical to the previous release. Existing URLs, redirects, policy content, lead handling, confirmation emails and GA4 code are unchanged.
- All 66 Node tests, the production build, SEO release check and 47-source preservation guard pass. The site now has 54 canonical pages and 55 HTML documents including 404.
- New regression checks require Wind & flood navigation to use the dedicated URL, retain the separate guides, validate internal links and serve the new route through the Worker with HTTP 200.
- The new page passes automated axe checks at 1440×1000 and 390×844 with zero violations or incomplete checks. No horizontal overflow; the hero image loads. These checks are not an accessibility certification.
- Manually verified mobile header navigation from the homepage, the guide menu, Piper opening, and contextual navigation to the existing form. No customer inquiry or email was submitted.
- Compiled the Worker and verified its locally served page exactly matches the production build. The local runtime falls back to its supported compatibility date; the production configuration is unchanged.
- All 54 live canonical pages and 11 shared assets/supporting files match the reviewed build. The live page renders on phone and desktop without browser errors. Sitemap inclusion enables discovery but does not guarantee Google indexing or rankings.

Client: `index-xjvAbWUS.js`. CSS: `index-ykYflMyM.css`. GA4 configuration remains `G-9WE296206T`; incoming events were not separately retested in this page release.

Uploaded archive: 5,359,338 bytes, SHA-256 `dec49f98920f32c18ef5a220c69f665f4a742408fc536bfdf1251dcc0e08a1d4`. Only built site files and the compiled Worker/routes were uploaded. No DNS, credentials, bindings or customer data changed.

Public-page screenshots and verification JSON are kept locally in `docs/audit-evidence/wind-flood-release/` (214,310 bytes). Temporary release files in `/tmp/obx-wind-flood-release/` are removed after verification.
