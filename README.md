# OBXNCInsurance.com

Consumer-facing website for OBXNCInsurance.com, an Outer Banks property insurance shopping and intake site.

The site helps property owners organize coastal home details for licensed local agency review across homeowners, wind and hail, flood, second home, and vacation rental insurance needs.

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
Custom domain: obxncinsurance.com
```

This repository also includes a GitHub Pages workflow in `.github/workflows/deploy.yml`.

The custom domain is:

```text
obxncinsurance.com
```

The `public/CNAME` file ensures GitHub Pages publishes the custom domain if that fallback is used.
