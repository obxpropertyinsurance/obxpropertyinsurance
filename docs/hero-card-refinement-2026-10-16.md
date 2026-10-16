# Painting and quote card refinement — October 16, 2026

The owner requested that the painting fill the hero card and meet the form without exposed side/bottom trim, with consistent form spacing.

## Implementation

The old image used an inflated width and negative left margin to offset an inset card. A later responsive rule set its width to 100%, leaving the negative margin and producing the exposed strip. The card now has no outer padding; its image is a block with 100% width and no margin. One rounded outer container clips the painting and form together. The form starts immediately below the image, with no separate rounded inset or gap.

Address and select controls have consistent spacing and usable heights. Coverage choices use separate, evenly spaced cards with readable descriptions. The quote CTA spans the form width. Mobile fields stack and text wraps without horizontal clipping.

Only `src/piper.css` and its reviewed hash in `scripts/piper-content-lock.json` changed in production source. Copy, SEO metadata, page inventory, sitemap, Piper steps, analytics and submission handling were preserved.

## Verification and deployment

- Local visual checks at 1440px, 900px, 390px and 320px: image edges match the card and image/form seam is 0px; no horizontal page overflow. Narrow-screen inputs, selects and buttons do not overflow.
- Production build, Worker compilation and the release guard passed: 54 HTML documents, 42 protected source files, all 53 canonical pages and 21 towns preserved.
- The packaged Worker served the expected homepage, CSS, JS and sitemap.
- Cloudflare production deployment **7148d7da-c271-4eff-b4fa-6f6e3df675c4** is live at https://www.obxncinsurance.com/. JS `index-Cc-NTtKZ.js`; CSS `index-r128VT4I.css`.
- Live homepage, sitemap, JS, CSS, privacy policy and Duck page SHA-256 hashes match the build. Live desktop and phone browser inspection confirms the seamless card; no browser errors were recorded. The earlier Allen/Piper footer/launcher refinements are also present.
- No customer submission or email was sent. Production bindings and secrets were not modified.

Public UI evidence: `docs/audit-evidence/piper-brand/hero-card-desktop.png` and `hero-card-mobile.png`. The temporary 5,310,945-byte release archive has SHA-256 `504048516d601e4767d444df1671531c81263d3f8349a7311f139235dc534105`; it and temporary upload/Worker files are removed after verification. Existing build dependencies and unrelated work are retained.

Rollback is available to the preceding production deployment, **cde957b2-d1ca-430a-87be-82799c84c593**. No database rollback is involved.
