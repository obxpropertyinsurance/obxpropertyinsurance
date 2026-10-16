# Customer acknowledgment runtime check

Tested locally with cached Wrangler 4.151.0 / workerd and production compatibility date `2026-07-03`. The test used unauthenticated `GET https://api.resend.com` requests only. No customer information, credentials, production database bindings or email sends were used.

| Fetch options | Result |
| --- | --- |
| `redirect: 'error'`, `AbortSignal.timeout(10000)` | TypeError before network: invalid redirect value; Workers accepts only `follow` or `manual`. |
| `AbortSignal.timeout(10000)` only | HTTP 200, no redirect |
| `redirect: 'manual'`, `AbortSignal.timeout(10000)` | HTTP 200, no redirect |
| No special options | HTTP 200, no redirect |

The runtime error explains the `acceptance_unknown` retry observed in the controlled test of deployment `44713309-3300-4ae9-a282-d4ffec591bbb`. The timeout option is supported. The narrow fix changes the customer sender to manual redirect mode; existing non-retryable HTTP handling rejects 3xx responses without following their destination.

After the fix, the local worker imported the actual `dispatchCustomerAcknowledgment` helper with a mock D1 binding. Its injected fetch transported only the helper's redirect and timeout options into the unauthenticated GET; headers, body and POST method were never sent. The GET returned HTTP 200 and the dispatcher completed with a synthetic provider success response. This checks runtime compatibility, not actual provider acceptance or inbox delivery.

The regression test covers 301, 302, 303, 307 and 308, requires manual redirect mode and an AbortSignal, and verifies terminal failure with exactly one fetch. Production delivery still requires redeployment and the controlled owned-inbox test recorded in the rollout document.
