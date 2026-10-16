import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { seoPages } from '../src/seoPages.js';
import { policyPages } from '../src/policyContent.mjs';
import { seoRedirects } from '../src/redirects.mjs';
import { homeMetadata, homeFaqs } from '../src/homeContent.mjs';
import { onRequest } from '../functions/_middleware.js';

const site='https://www.obxncinsurance.com';
const all=[{...homeMetadata,slug:'',faqs:homeFaqs},...seoPages,...policyPages];
assert.equal(seoPages.length,51); assert.equal(seoPages.filter(p=>p.category==='town').length,21);
const paths=new Set(all.map(p=>p.slug?`/${p.slug}/`:'/'));
const seenTitles=new Set(); const incoming=new Map([...paths].map(p=>[p,0]));
const sitemap=await readFile('dist/sitemap.xml','utf8');
for(const page of all) {
  const path=page.slug?`/${page.slug}/`:'/';
  const html=await readFile(`dist${path}index.html`,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,path+' single H1');
  assert.ok(html.includes(`<link rel="canonical" href="${site+path}"`),path+' canonical');
  assert.ok(sitemap.includes(`<loc>${site+path}</loc>`),path+' sitemap');
  const windFloodLinks = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Wind &amp; flood<\/a>/g)];
  assert.ok(windFloodLinks.length >= (policyPages.some(p=>p.slug===page.slug)?1:2),path+' shared Wind & flood navigation');
  assert.ok(windFloodLinks.every(match => match[1] === '/outer-banks-wind-flood-insurance/'),path+' dedicated Wind & flood destination');
  assert.ok(!seenTitles.has(page.title),path+' distinct title');seenTitles.add(page.title);
  assert.ok(!/search terms|search demand|queries such as|coverage readiness|our licensed review team|SearchAction/i.test(html),path+' approved copy');
  for(const image of html.matchAll(/<img\b[^>]*>/g))assert.match(image[0],/\balt="[^"]*"/,path+' image alt');
  for(const match of html.matchAll(/href="(\/[^"?]*)"/g)) {
    const target=match[1].split('#')[0]||'/';
    if(/\.[a-z0-9]+$/i.test(target))continue;
    assert.ok(paths.has(target),path+' unresolved internal link '+target);
    if(target!==path) incoming.set(target,incoming.get(target)+1);
  }
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert.equal(schemas.length,1,path+' single page graph');
  const graph=schemas[0]['@graph'];
  if(page.image) {
    const image=page.image;
    assert.ok(image.alt && image.credit && image.creditUrl && image.license && image.licenseUrl,path+' reviewed image attribution');
    assert.ok(image.width > 0 && image.height > 0,path+' intrinsic image dimensions');
    assert.ok(html.includes(`srcSet="${image.srcSet}"`),path+' responsive image variants');
    for(const variant of image.srcSet.split(', ')) {
      const assetPath=variant.split(' ')[0];
      assert.match(assetPath,/^\/images\/places\/[a-z0-9-]+\.webp$/,path+' self-hosted image');
      const bytes=await readFile('dist'+assetPath);
      assert.equal(bytes.toString('ascii',0,4),'RIFF',path+' valid image file');
      assert.equal(bytes.toString('ascii',8,12),'WEBP',path+' WebP image');
    }
    const absoluteImage=new URL(image.url,site).href;
    assert.equal(graph.find(n=>n['@type']==='Article').image,absoluteImage,path+' schema image matches visible image');
    assert.ok(html.includes(`property="og:image"\n      content="${absoluteImage}"`),path+' social image matches visible image');
  }
  assert.equal(graph.filter(n=>n['@type']==='Service').length,page.slug?0:1,path+' no inherited service');
  if(page.faqs?.length) {
    const faqs=graph.filter(n=>n['@type']==='FAQPage'); assert.equal(faqs.length,1,path+' one FAQ');
    assert.deepEqual(faqs[0].mainEntity.map(q=>q.name),page.faqs.map(f=>f.question));
  }
  if(page.slug)assert.equal(graph.filter(n=>n['@type']==='BreadcrumbList').length,1);
}
for(const[path,count]of incoming)assert.ok(count>0,path+' has static incoming links');
const windFloodHtml=await readFile('dist/outer-banks-wind-flood-insurance/index.html','utf8');
for(const slug of ['obx-wind-hail-insurance','outer-banks-flood-insurance']) {
  assert.ok(paths.has(`/${slug}/`),'separate coverage guide retained');
  assert.ok(windFloodHtml.includes(`href="/${slug}/"`),'combined guide links to '+slug);
}
assert.ok(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(windFloodHtml),'new guide is indexable');
const windFloodResponse=await onRequest({request:new Request(site+'/outer-banks-wind-flood-insurance/'),next:async()=>new Response(windFloodHtml,{headers:{'content-type':'text/html'}})});
assert.equal(windFloodResponse.status,200,'dedicated Wind & flood route is served');
for(const[from,to]of Object.entries(seoRedirects)) {
  assert.ok(!sitemap.includes(`<loc>${site}/${from}/</loc>`));
  for(const suffix of ['', '/']) {
    const response=await onRequest({request:new Request(`${site}/${from}${suffix}`),next:()=>{throw new Error('Redirect fell through');}});
    assert.equal(response.status,301);assert.equal(response.headers.get('location'),`${site}/${to}/`);
  }
}
for(const path of ['/ai-catalog.json','/missing.png','/.well-known/missing.json','/not-a-real-page/']) {
  const response=await onRequest({request:new Request(site+path),next:async()=>new Response('<!doctype html><h1>Home</h1>',{headers:{'content-type':'text/html'}})});
  assert.equal(response.status,404,path+' real 404');
}
const asset=await onRequest({request:new Request(site+'/assets/test.webp'),next:async()=>new Response('image',{headers:{'content-type':'image/webp'}})});assert.equal(asset.status,200);
console.log(`Verified ${all.length} canonical pages, 21 towns, titles/H1/alt/schema, all static internal links, 3 direct redirects and missing-file 404s.`);
