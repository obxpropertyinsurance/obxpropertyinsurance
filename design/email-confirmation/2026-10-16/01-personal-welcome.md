# A personal welcome

An elegant letter that makes a new homebuyer feel heard. The cream paper, softly expressive Fraunces, small Piper masthead and generous reading space carry the website’s identity without turning the confirmation into a promotional newsletter.

- **Subject:** We have your request, Jamie
- **Alternative subjects:** Your home insurance request is here; Jamie, thank you for getting in touch
- **Preheader:** Your October 21 timing is noted. We’ll follow up by email, just as you asked.
- **Purpose:** Confirm receipt, reflect the customer’s timing and communication preference, and make a useful reply feel easy.
- **Primary CTA:** Reply with a question → `hello@obxncinsurance.com`
- **Fictional preview:** Jamie is buying a home, prefers email and needs coverage October 21. No real lead information is used.

The first screen gives the answer the customer needs: the request arrived. Timing appears in coral within natural prose. The portrait then explains the human review, clearly separating Piper from the person. The reply button is an invitation, not another hurdle or a request to repeat the original form.

This is my strongest choice for older readers and people juggling a closing. A single reading path, 18–19px body type, strong contrast and a 58px button make it approachable. The other art director and I agree that the coastal postcard has greater visual brand recognition; this letter has the clearest personal reassurance and the least visual effort. A distinctive brand does not require a heavily decorated email.

## Implementation notes

This is a design review artifact, not a live sending template. Core email styles are inline and layout uses presentation tables at a maximum width of 600px. Fraunces previews locally and falls back to Georgia in mail clients without web-font support. Mobile padding reduces to 26px; the human portrait remains readable at 76px. No tracking pixels, scripts, outside fonts, customer addresses or raw intake notes are included. Imagery and font paths are local preview references and must become approved HTTPS asset URLs before sending.

The eventual renderer must escape personalization and conditionally change the date and preference copy. Send only for eligible email-first requests. Do not use this variation for phone/text requests, conflicting instructions or a hold. It makes no response-time, assignment, licensing, quote or coverage guarantee. The footer labels it as an automatic receipt. Client QA must cover Gmail, Apple Mail, Outlook, image blocking and dark mode before release.

Suggested evaluation: helpful customer replies, successful delivery and confusion/support replies. Keep current email open/click tracking disabled. No experiment or production enrollment is authorized by this concept alone.
