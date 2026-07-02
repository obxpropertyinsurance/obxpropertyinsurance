import { seoPages } from "../src/seoPages.js";

const canonicalHost = "www.obxncinsurance.com";
const redirectHosts = new Set(["obxncinsurance.com", "obxncinsurance.pages.dev"]);
const allowedSlugs = new Set(seoPages.map((page) => page.slug));
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
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #07112b;
        background: #ffffff;
      }
      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 48px 24px;
      }
      section {
        width: min(720px, 100%);
      }
      h1 {
        margin: 0 0 18px;
        font-size: clamp(42px, 7vw, 78px);
        line-height: 0.98;
        letter-spacing: 0;
      }
      p {
        margin: 0 0 28px;
        max-width: 620px;
        color: #5c6980;
        font-size: 20px;
        line-height: 1.55;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }
      a {
        color: #007f83;
        font-weight: 800;
        text-decoration: none;
      }
      a.primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 20px;
        border-radius: 8px;
        color: #ffffff;
        background: #ff4b43;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
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
      </section>
    </main>
  </body>
</html>`;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  if (redirectHosts.has(url.hostname)) {
    url.hostname = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next();
  }

  if (
    passthroughFiles.has(url.pathname) ||
    passthroughPrefixes.some((prefix) => url.pathname.startsWith(prefix)) ||
    hasFileExtension(url.pathname)
  ) {
    return next();
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
