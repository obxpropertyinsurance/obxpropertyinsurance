// Approved SEO + brand release guard. Update the lock only after separately reviewing a new release.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import './check-seo-release.mjs';

const lock = JSON.parse(await readFile(new URL('./piper-content-lock.json', import.meta.url)));
const hash = value => createHash('sha256').update(value).digest('hex');
for (const [file, expected] of Object.entries(lock.protectedFiles)) {
  assert.equal(hash(await readFile(file)), expected, `Reviewed release source changed: ${file}`);
}
assert.equal(hash(await readFile('dist/sitemap.xml')), lock.liveSitemapHash, 'Reviewed sitemap changed');
const files=(await readdir('dist',{recursive:true})).filter(file=>file.endsWith('.html')).sort();
assert.deepEqual(files,Object.keys(lock.pages).sort(),'Generated page inventory changed');
for(const file of files) {
  const html=(await readFile(`dist/${file}`,'utf8')).replace(/\/assets\/[^"\s<>]+/g,'/assets/BUILD_ASSET');
  assert.equal(hash(html),lock.pages[file],`Reviewed HTML changed: ${file}`);
}
console.log(`Reviewed release preserved: ${files.length} HTML documents, ${Object.keys(lock.protectedFiles).length} sources, intake/outbox and approved SEO/brand scope. Production delivery is verified separately.`);
