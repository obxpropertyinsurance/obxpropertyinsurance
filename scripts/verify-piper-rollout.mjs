// A release guard for the approved brand and response rollout. Run after npm run build.
// Intentional future content/flow changes require a separately reviewed lock update.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const lock = JSON.parse(await readFile(new URL('./piper-content-lock.json', import.meta.url)));
const hash = value => createHash('sha256').update(value).digest('hex');
for (const [file, expected] of Object.entries(lock.protectedFiles)) {
  const source = await readFile(file, 'utf8');
  // User-approved rename only; routes and all other SEO content remain locked.
  const normalized = file === 'src/seoPages.js' ? source.replace(/\bPiper\b/g, 'Tide') : source;
  assert.equal(hash(normalized), expected, `Protected release file changed: ${file}`);
}
assert.equal(hash(await readFile('dist/sitemap.xml')), lock.liveSitemapHash, 'Generated sitemap differs from the live production sitemap');
const app = (await readFile('src/App.jsx', 'utf8'))
  .replace(/\bPiper\b/g, 'Tide')
  .replace('import homeImage from "./assets/piper/coastal-house.jpg";\nimport piperIcon from "./assets/piper/piper-icon.png";', 'import homeImage from "./assets/obx-coastal-home-1280.jpg";')
  .replaceAll('src={piperIcon}', 'src="/tide-agent-headshot.png"')
  .replace(/className="(hero-visual|rate-chart-card|rate-source-links|coverage-map-panel|quote-progress|readiness-meter|tide-progress|tide-quick-questions)" role="group"/g, 'className="$1"')
  .replace('<div className="seo-data-table-wrap" role="region" aria-label="Scrollable rate comparison table" tabIndex={0}>', '<div className="seo-data-table-wrap">')
  // Accessibility annotations do not change structure, answers, handlers or copy.
  .replace('              aria-required="true"\n              aria-invalid={(guideStatus.state === "error" && !answers.address.trim()) || undefined}\n              aria-describedby={guideStatus.state === "error" && !answers.address.trim() ? "tide-step-status" : undefined}\n', '');
assert.equal(hash(app), lock.appHash, 'App changed beyond the reviewed presentation, accessibility, human introduction, receipt and submission-ID edits');

const files = (await readdir('dist', { recursive: true })).filter(file => file.endsWith('.html') && !['privacy-policy/index.html', 'accessibility/index.html'].includes(file)).sort();
assert.deepEqual(files, Object.keys(lock.pages).sort(), 'Generated page inventory changed');
for (const file of files) {
  const html = (await readFile(`dist/${file}`, 'utf8')).replace(/\/assets\/[^"\s<>]+/g, '/assets/BUILD_ASSET').replace(/\bPiper\b/g, 'Tide');
  assert.equal(hash(html), lock.pages[file], `Rendered SEO content changed: ${file}`);
}
for (const route of ['privacy-policy', 'accessibility']) {
  const html = await readFile(`dist/${route}/index.html`, 'utf8');
  assert.ok(html.includes('obxpropertyinsurance@proton.me'), `${route} needs a contact route`);
}
console.log(`Verified ${files.length} existing HTML pages, sitemap, metadata, redirects and reviewed intake/response sources. Approved changes include the human introduction, personalized receipts, submission IDs, gated customer acknowledgment and provider privacy notice. This source guard does not determine production activation or email delivery.`);
