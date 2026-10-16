import { mkdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { build } from 'vite';
import { seoPages } from '../src/seoPages.js';
import { policyPages } from '../src/policyContent.mjs';
import { homeMetadata, homeFaqs } from '../src/homeContent.mjs';
import { pageSchema } from '../src/pageSchema.mjs';

const siteUrl='https://www.obxncinsurance.com';
const distDir=fileURLToPath(new URL('../dist/',import.meta.url));
const template=await readFile(join(distDir,'index.html'),'utf8');
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const jsonForHtml=value=>JSON.stringify(value).replaceAll('<','\\u003c');
const pages=[{...homeMetadata,slug:'',faqs:homeFaqs,lastReviewed:'2026-10-16'},...seoPages,...policyPages.map(p=>({...p,lastReviewed:'2026-10-16'}))];
const ssrDir=await mkdtemp(join(tmpdir(),'obx-seo-ssr-'));
try {
  await build({ssr:{noExternal:true},build:{ssr:'src/entry-server.jsx',outDir:ssrDir,emptyOutDir:true,copyPublicDir:false,minify:true,rollupOptions:{output:{entryFileNames:'entry-server.mjs'}}},logLevel:'warn'});
  const {render}=await import(pathToFileURL(join(ssrDir,'entry-server.mjs')).href);
  for(const page of pages){
    const path=page.slug?`/${page.slug}/`:'/';
    const canonical=siteUrl+path;
    let html=template.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
    html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escapeHtml(page.title)}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,(_,a,b)=>a+escapeHtml(page.description)+b)
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/,(_,a,b)=>a+canonical+b)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/,(_,a,b)=>a+canonical+b)
      .replace(/(<meta\s+(?:property="og:title"|name="twitter:title")\s+content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escapeHtml(page.title)+b)
      .replace(/(<meta\s+(?:property="og:description"|name="twitter:description")\s+content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escapeHtml(page.description)+b);
    if(page.image) html=html.replace(/(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escapeHtml(new URL(page.image.url,siteUrl).href)+b).replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*("\s*\/?>)/,(_,a,b)=>a+escapeHtml(page.image.alt)+b);
    html=html.replace('</head>',`<script type="application/ld+json">${jsonForHtml(pageSchema(page))}</script>\n</head>`)
      .replace('<div id="root"></div>',`<div id="root">${render(path)}</div><noscript><p>To send an insurance request, enable JavaScript or email <a href="mailto:obxpropertyinsurance@proton.me">obxpropertyinsurance@proton.me</a>. The coverage guides remain available below.</p></noscript>`);
    const dir=join(distDir,page.slug); await mkdir(dir,{recursive:true}); await writeFile(join(dir,'index.html'),html);
  }
} finally {await rm(ssrDir,{recursive:true,force:true});}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p=>`  <url><loc>${siteUrl}${p.slug?`/${p.slug}/`:'/'}</loc><lastmod>${p.lastReviewed}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(distDir,'sitemap.xml'),sitemap);
await writeFile('public/sitemap.xml',sitemap);
// A real static 404 prevents the host's SPA fallback for missing assets/catalogs.
const notFoundStylesheets = [...template.matchAll(/<link\b(?=[^>]*\brel="stylesheet")[^>]*>/g)].map(([link]) => link).join('\n');
await writeFile(join(distDir,'404.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Page not found | OBXNCInsurance.com</title>
  <link rel="icon" href="/favicon.svg?v=piper-20261016" type="image/svg+xml">
  ${notFoundStylesheets}
  <style>
    .not-found-page{margin:0;min-height:100vh;min-height:100dvh;background:#fff9ef;color:#082d42;font-family:Fraunces,Georgia,serif}
    .not-found-wrap{width:min(100% - 48px,960px);margin-inline:auto}
    .not-found-brand{padding-block:32px}
    .not-found-brand a{display:inline-flex;align-items:center;min-height:44px}
    .not-found-brand img{display:block;width:min(340px,100%);height:auto}
    .not-found-card{display:grid;grid-template-columns:minmax(0,1fr) 180px;align-items:center;gap:40px;padding:64px;border:1px solid #c5d1d0;border-radius:28px;background:#f5e8d5}
    .not-found-code{margin:0 0 12px;color:#88351a;font-size:18px;line-height:1.4}
    .not-found-card h1{margin:0;font-size:clamp(36px,5vw,56px);line-height:1.15;letter-spacing:-.035em}
    .not-found-card p:not(.not-found-code){margin:22px 0 28px;font-size:20px;line-height:1.6;color:#365361}
    .not-found-home{display:inline-flex;align-items:center;justify-content:center;min-height:56px;padding:16px 24px;border-radius:999px;background:#082d42;color:#fff9ef;font-size:17px;font-weight:650;line-height:1.4;text-align:center;text-decoration:none}
    .not-found-home:hover{background:#194858;color:#fff9ef}
    .not-found-piper{display:block;width:100%;height:auto}
    .not-found-footer{display:flex;flex-wrap:wrap;gap:8px 28px;padding-block:24px 36px}
    .not-found-footer a{display:inline-flex;align-items:center;min-height:44px;color:#082d42;font-size:16px;line-height:1.5;text-underline-offset:4px}
    .not-found-page a:focus-visible{outline:3px solid #0a6885;outline-offset:5px}
    @media(max-width:600px){.not-found-wrap{width:calc(100% - 32px)}.not-found-brand{padding-block:24px}.not-found-brand img{width:280px;max-width:100%}.not-found-card{grid-template-columns:minmax(0,1fr);gap:28px;padding:32px 24px;border-radius:22px}.not-found-piper{width:120px;justify-self:center}.not-found-home{width:100%;font-size:16px}.not-found-card p:not(.not-found-code){font-size:18px}.not-found-footer{gap:8px 24px}}
  </style>
</head>
<body class="not-found-page">
  <div class="not-found-wrap">
    <header class="not-found-brand"><a href="/" aria-label="OBXNC Insurance home"><img src="/brand/obxnc-insurance-wordmark.svg" width="868" height="180" alt="OBXNC Insurance"></a></header>
    <main class="not-found-card">
      <div><p class="not-found-code" aria-hidden="true">404</p><h1>Page not found</h1><p>This resource is unavailable.</p><a class="not-found-home" href="/">Outer Banks home insurance</a></div>
      <img class="not-found-piper" src="/brand/piper-mark.png" width="256" height="256" alt="">
    </main>
    <footer class="not-found-footer"><a href="/privacy-policy/">Privacy policy</a><a href="/accessibility/">Accessibility</a></footer>
  </div>
</body>
</html>`);
console.log(`Generated ${pages.length} canonical pages from production React components, page-specific schema, sitemap and 404.`);
