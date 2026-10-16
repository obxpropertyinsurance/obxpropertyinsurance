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
    if(page.image) html=html.replace(/(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")[^"]*("\s*\/?>)/g,(_,a,b)=>a+escapeHtml(page.image.url)+b).replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*("\s*\/?>)/,(_,a,b)=>a+escapeHtml(page.image.alt)+b);
    html=html.replace('</head>',`<script type="application/ld+json">${jsonForHtml(pageSchema(page))}</script>\n</head>`)
      .replace('<div id="root"></div>',`<div id="root">${render(path)}</div><noscript><p>To send an insurance request, enable JavaScript or email <a href="mailto:obxpropertyinsurance@proton.me">obxpropertyinsurance@proton.me</a>. The coverage guides remain available below.</p></noscript>`);
    const dir=join(distDir,page.slug); await mkdir(dir,{recursive:true}); await writeFile(join(dir,'index.html'),html);
  }
} finally {await rm(ssrDir,{recursive:true,force:true});}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p=>`  <url><loc>${siteUrl}${p.slug?`/${p.slug}/`:'/'}</loc><lastmod>${p.lastReviewed}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(distDir,'sitemap.xml'),sitemap);
await writeFile('public/sitemap.xml',sitemap);
// A real static 404 prevents the host's SPA fallback for missing assets/catalogs.
await writeFile(join(distDir,'404.html'),'<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | OBXNCInsurance.com</title></head><body><main><h1>Page not found</h1><p>This resource is unavailable.</p><a href="/">Outer Banks home insurance</a></main></body></html>');
console.log(`Generated ${pages.length} canonical pages from production React components, page-specific schema, sitemap and 404.`);
