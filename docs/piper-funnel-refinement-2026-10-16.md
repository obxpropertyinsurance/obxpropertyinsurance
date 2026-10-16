# Piper funnel refinement — October 16, 2026

The owner requested a shorter human introduction, one prominent start action, and a simpler floating Piper launcher.

## Changes

- Allen's introduction retains the portrait, name and local introduction. The additional paragraph about reviewing the request is removed. Card padding and text spacing are tighter; the approved portrait remains 180px on desktop and 148px on mobile.
- The funnel footer centers the shield and “No spam. No lead selling. No pressure parade. Just local guidance.” above the primary action.
- Removed the footer's privacy link, full-form alternative, question toggle, opening-step “Keep researching” action and repeated automated-tool disclaimer. The header still identifies automated guidance; privacy information remains in the main form and site footer. Minimize/close controls and the desktop question launcher remain available. A compact mobile header link preserves question access without adding another footer action; opening it focuses the question field.
- Later steps retain Back and Continue. Submission handling, validation and the five-step sequence are unchanged by this refinement.
- The floating launcher no longer contains the waves badge. Piper sits beside centered title/tagline text.

## Verification

Manual browser QA at 1440×1000, 390×844 and 320×740 confirmed no horizontal page overflow. The desktop introduction and single-action footer fit; the phone footer and Back action remain reachable by scrolling and keyboard focus. Property selection, start CTA advancement, Back and close were exercised. The mobile question link opens the input, transfers focus and can be closed using Enter. No submission was sent.

Public UI screenshots: `docs/audit-evidence/piper-brand/funnel-desktop.png` and `funnel-mobile.png`. This is a coordinated release with the SEO chat; production confirmation follows deployment.

## Final coordinated publication

Production deployment **cde957b2-d1ca-430a-87be-82799c84c593** includes the approved branding, portrait and compact Piper refinements, SEO content and client hydration. Final client assets: `index-2ZfHcvQC.js`, `index-CdFMcWHH.css`. All 53 live canonical HTML documents and critical assets match the reviewed build. This release predates the separate subsequent request to refine the hero-image trim.
