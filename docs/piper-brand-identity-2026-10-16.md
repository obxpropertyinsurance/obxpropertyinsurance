# Piper brand identity — October 16, 2026

The user requested replacing the old waves and URL-only header with a Piper-incorporated brand logo and favicon. The shared `BrandLogo` component now shows the approved full-body Piper beside **OBXNC Insurance**, set in Fraunces 650 with navy and Piper’s sampled terracotta. It is shared by the homepage, guide headers/footers, and policy headers. At phone widths it stacks the two words beside Piper. Website domains in substantive content and metadata are outside this branding change.

The portable wordmark contains outlined Fraunces lettering and an embedded transparent Piper image, so it does not depend on a recipient having the font installed. Font axes: weight 650, optical size 48, softness 100, wonk 1. Character illustration is the approved existing Piper. Text is native vector artwork, not generated text.

## Assets

- `public/brand/obxnc-insurance-wordmark.svg`: portable horizontal logo.
- `public/brand/piper-mark.png`: transparent 256px approved full-body Piper for the site header.
- `public/brand/piper-face.png`: transparent 512px close-up icon.
- `public/favicon.svg`, `public/favicon-32.png`, `public/favicon.ico`: browser icons, including 16/32/48px ICO sizes.
- `public/apple-touch-icon.png`: 180px home-screen icon.

The favicon character was generated with the built-in ChatGPT image tool from the approved full-body Piper reference. Mechanical resizing and file-format conversion created the browser sizes; no creative image editing was done in Python. Original result: `/Users/user/.codex/generated_images/01a1381d-9583-7941-9384-651233765deb/exec-2509a0eb-60ca-4b85-ac87-ef191ff700e3.png`.

## Favicon generation prompt

Create a new small-format favicon brand icon derived from the supplied Piper bird. Input is the character reference: preserve Piper's recognizable warm ivory face, dark navy crown, friendly large dark eyes, coral-orange long pointed beak and gentle head tilt. Show ONLY the head and a hint of neck, no body or feet. Make it a polished simple graphic emblem designed to be legible at 16–32 pixels: bold clean silhouettes, minimal flat color areas, very few feather details, no fine texture, no shadows or gradients. Palette navy #082d42, warm cream #fff9ef and coral #a34424 with tiny white eye catchlights. Center the close-up head so it fills almost all of a square canvas with safe 8% margins. Transparent background. No letters, words, border, circle, waves, house symbol or extra elements. The result should be cute, memorable and premium, unmistakably the same Piper character.

## Validation and release coordination

The combined work-in-progress production build passed. Browser QA confirmed the shared header/footer mark loads, all icon declarations are present, desktop 1440px and mobile 390px layouts fit, and the Piper dialog stays within a 320px viewport. The enlarged portrait is 180px desktop / 148px mobile, its caption and redundant final sentence are removed, and descriptive alt text is retained. A policy-header underline inherited from generic link styles was removed after visual inspection.

The user explicitly authorized coordination with **Audit OBX insurance SEO**. That chat owns the final combined build, content/redirect/data checks, commit and deployment. No separate obsolete portrait-only package should be deployed. This chat does not alter the email automation, leads database or analytics behavior.

Final release confirmation and storage sizes will be recorded after handoff.

Brand production files total **406,418 bytes** (about 397 KiB) across the paths above. The generated favicon source is 905,828 bytes and remains in the Codex generated-images directory. Portrait file is 2,187,642 bytes, replacing the previous larger image; its generation original remains in Codex. Temporary font tooling, resized intermediate PNG, and the obsolete undeployed portrait-only release ZIP were removed from `/tmp`.

## Owner color refinement

The owner requested that “Insurance” match Piper’s beak and legs. The wordmark now uses **#cc6140**, sampled from a shaded orange-brown tone in the approved Piper beak (source pixel 804, 368 in the 1280px reference). Applied to the shared site logo, outlined SVG logo, and confirmation-email masthead. The darker #a34424 remains for functional links/buttons, keeping their existing contrast. In the browser-rendered screenshot the shared image/text warm terracotta reads as a muted orange-brown.

The owner explicitly approved the final color-matched wordmark on October 16, 2026. Browser inspection confirmed the website wordmark computes to `rgb(204, 97, 64)`; desktop and mobile screenshots were refreshed. All seven confirmation-email HTML tests passed after the matching masthead color update.

## Production confirmation

Deployed October 16, 2026 in the coordinated release **66eb27da-0d55-4962-aed8-e2ec0a9d66e5** at https://www.obxncinsurance.com/. JS `index-B2RRWYQU.js`; CSS `index-C1Xyh0xw.css`. Live browser verification used `?obx_internal=1`: desktop 1440px and mobile 390px fit without horizontal overflow; the Insurance wordmark computes to `rgb(204, 97, 64)`; Piper mark is loaded; all versioned favicon declarations are present. The live portrait loads at 180px desktop (1254px source), with no visible caption or redundant final sentence.

Published logo SVG, Piper header PNG, SVG/PNG/ICO favicon files, Apple touch icon, and matte portrait were fetched over verified HTTPS and their SHA-256 hashes exactly matched canonical production assets. No customer form submission or email send was made for this visual verification. Final screenshot: `docs/audit-evidence/piper-brand/live-homepage.png`.

## Final coordinated publication

Production deployment **cde957b2-d1ca-430a-87be-82799c84c593** includes the approved branding, portrait and compact Piper refinements, SEO content and client hydration. Final client assets: `index-2ZfHcvQC.js`, `index-CdFMcWHH.css`. All 53 live canonical HTML documents and critical assets match the reviewed build. This release predates the separate subsequent request to refine the hero-image trim.
