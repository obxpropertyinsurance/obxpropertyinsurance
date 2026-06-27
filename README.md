# OBXNCInsurance.com

Consumer-facing website for OBXNCInsurance.com, an Outer Banks property insurance shopping and coverage-check site.

The site helps property owners prepare coastal home details for local Outer Banks, NC licensed agent review across homeowners, wind and hail, flood, second home, condo, landlord, and vacation rental insurance needs.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Recommended production hosting is Cloudflare Pages connected to this GitHub repository.

Cloudflare Pages settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
Custom domain: www.obxncinsurance.com
```

This repository includes a GitHub Actions build check in `.github/workflows/deploy.yml`.

The custom domain is:

```text
www.obxncinsurance.com
```

The `public/CNAME` file documents the custom domain for static hosting compatibility.

## Lead Form Delivery

The consumer quote form posts to the Cloudflare Pages Function at:

```text
/api/lead
```

By default, leads are sent to:

```text
obxpropertyinsurance@proton.me
```

For the fastest no-secret setup, the function validates the lead and tells the browser to use the FormSubmit fallback. The first live test can trigger a FormSubmit activation email to the Proton inbox. Click that activation link so future form submissions can be delivered.

For the recommended production setup, add a Resend API key to Cloudflare Pages and verify a sending address such as `leads@obxncinsurance.com`.

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name obxncinsurance
npx wrangler pages secret put LEAD_TO_EMAIL --project-name obxncinsurance
npx wrangler pages secret put LEAD_FROM_EMAIL --project-name obxncinsurance
```

Suggested values:

```text
LEAD_TO_EMAIL=obxpropertyinsurance@proton.me
LEAD_FROM_EMAIL=OBXNCInsurance.com <leads@obxncinsurance.com>
```
