import { pageSeeds as seoPages } from "../src/pageSeeds.mjs";
import { policyPages } from "../src/policyContent.mjs";
import { seoRedirects } from "../src/redirects.mjs";

const canonicalHost = "www.obxncinsurance.com";
const redirectHosts = new Set(["obxncinsurance.com", "obxncinsurance.pages.dev"]);
const allowedSlugs = new Set([...seoPages, ...policyPages].map((page) => page.slug));
const passthroughPrefixes = ["/api/", "/assets/", "/.well-known/"];
const passthroughFiles = new Set([
  "/favicon.svg",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/CNAME",
]);

const hasFileExtension = (pathname) => /\/[^/]+\.[^/]+$/.test(pathname);

const notFoundHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Page Not Found | OBXNCInsurance.com</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        min-height: 100dvh;
        font-family: Georgia, "Times New Roman", serif;
        color: #082d42;
        background: #fff9ef;
      }
      .not-found-wrap { width: min(100% - 48px, 960px); margin-inline: auto; }
      header { padding-block: 32px; }
      header a { display: inline-flex; align-items: center; min-height: 44px; }
      header img { display: block; width: min(340px, 100%); height: auto; }
      section {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 160px;
        align-items: center;
        gap: 36px;
        padding: 56px;
        border: 1px solid #c5d1d0;
        border-radius: 28px;
        background: #f5e8d5;
      }
      .not-found-code { margin: 0 0 12px; color: #88351a; font-size: 18px; }
      .not-found-piper { display: block; width: 100%; height: auto; }
      h1 {
        margin: 0 0 22px;
        font-size: clamp(36px, 5vw, 56px);
        line-height: 1.15;
        letter-spacing: -.035em;
      }
      p {
        margin: 0 0 28px;
        max-width: 620px;
        color: #365361;
        font-size: 20px;
        line-height: 1.6;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 24px;
      }
      a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        color: #082d42;
        font-size: 17px;
        font-weight: 600;
        line-height: 1.5;
        text-underline-offset: 4px;
      }
      a.primary {
        justify-content: center;
        min-height: 56px;
        padding: 16px 24px;
        border-radius: 999px;
        color: #fff9ef;
        background: #082d42;
        text-decoration: none;
        text-align: center;
      }
      a.primary:hover { background: #194858; }
      a:focus-visible { outline: 3px solid #0a6885; outline-offset: 5px; }
      footer { display: flex; flex-wrap: wrap; gap: 8px 28px; padding-block: 24px 36px; }
      footer a { font-size: 16px; font-weight: 400; }
      @media (max-width: 650px) {
        .not-found-wrap { width: calc(100% - 32px); }
        header { padding-block: 24px; }
        header img { width: 280px; max-width: 100%; }
        section { grid-template-columns: minmax(0, 1fr); gap: 28px; padding: 32px 24px; border-radius: 22px; }
        .not-found-piper { width: 120px; justify-self: center; }
        p { font-size: 18px; }
        nav { align-items: stretch; flex-direction: column; gap: 8px; }
        a { font-size: 16px; }
        a.primary { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="not-found-wrap">
    <header><a href="/" aria-label="OBXNC Insurance home"><img src="/brand/obxnc-insurance-wordmark.svg" width="868" height="180" alt="OBXNC Insurance"></a></header>
    <main>
      <section>
        <div>
        <p class="not-found-code" aria-hidden="true">404</p>
        <h1>Page not found</h1>
        <p>
          This OBX insurance page is not available. Start with the main guide, homeowners insurance page, or insurance atlas to find the right local resource.
        </p>
        <nav aria-label="Helpful pages">
          <a class="primary" href="/">Go to homepage</a>
          <a href="/outer-banks-insurance/">Outer Banks insurance</a>
          <a href="/outer-banks-homeowners-insurance/">Homeowners insurance</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        </nav>
        </div>
        <img class="not-found-piper" src="/brand/piper-mark.png" width="256" height="256" alt="">
      </section>
    </main>
    <footer><a href="/privacy-policy/">Privacy policy</a><a href="/accessibility/">Accessibility</a></footer>
    </div>
  </body>
</html>`;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  const requestedSlug = url.pathname.replace(/^\/+|\/+$/g, "");
  if (Object.hasOwn(seoRedirects, requestedSlug)) {
    url.pathname = `/${seoRedirects[requestedSlug]}/`;
    if (redirectHosts.has(url.hostname)) url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  if (redirectHosts.has(url.hostname)) {
    url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  const legacyReviewSlug = url.searchParams.get("review");
  if (url.pathname === "/" && legacyReviewSlug && allowedSlugs.has(legacyReviewSlug)) {
    url.search = "";
    url.hash = `quote-${legacyReviewSlug}`;
    return Response.redirect(url.toString(), 301);
  }

  if (
    passthroughFiles.has(url.pathname) ||
    passthroughPrefixes.some((prefix) => url.pathname.startsWith(prefix)) ||
    hasFileExtension(url.pathname)
  ) {
    const response = await next();
    const isHtml = response.headers.get('content-type')?.includes('text/html');
    const htmlSlug = url.pathname.replace(/^\/+|\/index\.html$/g, '');
    const isKnownHtml = url.pathname === '/index.html' || (url.pathname.endsWith('/index.html') && allowedSlugs.has(htmlSlug));
    if (!isHtml || isKnownHtml || url.pathname.startsWith('/api/')) return response;
    // A missing .json/image/file must never masquerade as the homepage.
    return new Response(request.method === 'HEAD' ? null : notFoundHtml, {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
    });
  }

  if (url.pathname !== "/" && url.pathname.includes("//")) {
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return Response.redirect(url.toString(), 301);
  }

  const slug = url.pathname.replace(/^\/+|\/+$/g, "");

  if (!slug) {
    return next();
  }

  if (allowedSlugs.has(slug)) {
    if (!url.pathname.endsWith("/")) {
      url.pathname = `/${slug}/`;
      return Response.redirect(url.toString(), 301);
    }

    return next();
  }

  return new Response(request.method === "HEAD" ? null : notFoundHtml, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-robots-tag": "noindex",
    },
  });
}
