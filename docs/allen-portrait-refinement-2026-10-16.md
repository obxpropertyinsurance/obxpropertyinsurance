# Allen portrait refinement — October 16, 2026

User-directed presentation update: remove the visible portrait caption and “Tell us what matters most to you,” increase the portrait from 136 to 180 pixels on desktop and from 120 to 148 pixels on mobile, and soften glare in the image. The descriptive image alternative text remains accurate about the generated placeholder. Allen's introduction and Piper inquiry steps are unchanged.

The production build and the 53-page SEO/sitemap preservation guard passed. Browser inspection confirmed a loaded 148px portrait in a 378px dialog at a 390px viewport, no horizontal overflow, no caption, and no redundant final sentence. No lead submission or email send was needed for this visual change.

The canonical asset is `public/allen-illustrative-portrait.png` (2,187,642 bytes), replaced with the selected built-in ChatGPT image edit. The source is recoverable in Git. The original generated result is retained at `/Users/user/.codex/generated_images/01a1381d-9583-7941-9384-651233765deb/exec-67b97ba8-64fa-4d15-bdb7-a6b7410d4787.png` (same size). The version query in the image URL ensures the revised portrait is requested.

## Generation prompt

Use case: lighting-weather / photographic portrait refinement. Edit target: the supplied existing AI-generated placeholder portrait. Preserve the same face, expression, hairstyle, beard, blue linen shirt, square composition and blurred beach/dune setting. Change the lighting and surface rendering only: reduce bright glare and shiny highlights on the forehead, nose, cheeks and hair; slightly lower the luminous sky and background highlights. Give it a natural, matte editorial headshot finish, as photographed in soft coastal open shade on a real camera. Keep realistic skin pores, fine smile lines, beard hairs and fabric texture. Natural color and restrained contrast; no airbrushing, beauty-filter sheen, HDR halos, painterly strokes, CGI or drawing appearance. Keep catchlights small and believable and teeth naturally off-white. This remains an illustrative generated portrait, not a verified likeness of the real Allen. Do not add text, labels, borders, logos or other elements. Output a square portrait suitable for a larger circular website crop.

## Release package

Archive SHA-256: `fd376b261fb7fb453a40360d593112a1410ce86965649f8b71ca260b9dfd032b`. JS `index-CXnvq2Ca.js`; CSS `index-BI7IO4Fs.css`. Deployment confirmation will be recorded below after publication.

## Combined release

The portrait-only archive above was not deployed. The user approved coordination with the concurrent SEO release, which will include the portrait and Piper brand assets together. Its metadata/content changes are separately authorized in the SEO chat. The final combined deployment supersedes the temporary archive and bundle identifiers above.

## Production confirmation

Deployed October 16, 2026 in the coordinated release **66eb27da-0d55-4962-aed8-e2ec0a9d66e5** at https://www.obxncinsurance.com/. JS `index-B2RRWYQU.js`; CSS `index-C1Xyh0xw.css`. Live browser verification used `?obx_internal=1`: desktop 1440px and mobile 390px fit without horizontal overflow; the Insurance wordmark computes to `rgb(204, 97, 64)`; Piper mark is loaded; all versioned favicon declarations are present. The live portrait loads at 180px desktop (1254px source), with no visible caption or redundant final sentence.

Published logo SVG, Piper header PNG, SVG/PNG/ICO favicon files, Apple touch icon, and matte portrait were fetched over verified HTTPS and their SHA-256 hashes exactly matched canonical production assets. No customer form submission or email send was made for this visual verification. Final screenshot: `docs/audit-evidence/piper-brand/live-homepage.png`.

## Final coordinated publication

Production deployment **cde957b2-d1ca-430a-87be-82799c84c593** includes the approved branding, portrait and compact Piper refinements, SEO content and client hydration. Final client assets: `index-2ZfHcvQC.js`, `index-CdFMcWHH.css`. All 53 live canonical HTML documents and critical assets match the reviewed build. This release predates the separate subsequent request to refine the hero-image trim.
