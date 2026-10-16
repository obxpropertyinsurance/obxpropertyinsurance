import test from 'node:test';
import assert from 'node:assert/strict';
import { getBreadcrumbs } from './breadcrumbs.mjs';
import { pageSchema } from './pageSchema.mjs';
import { seoPages, getSeoPageBySlug } from './seoPages.js';
import { policyPages } from './policyContent.mjs';

const hub = { name: 'North Carolina Home Insurance', href: '/outer-banks-insurance-atlas/' };

test('Duck uses the approved location label and existing guide destination', () => {
  assert.deepEqual(getBreadcrumbs(getSeoPageBySlug('duck-nc-home-insurance')), [
    { name: 'Home', href: '/' },
    hub,
    { name: 'Duck, NC Home Insurance', href: '/duck-nc-home-insurance/' },
  ]);
});

test('all 21 current place pages have explicit, correctly qualified labels', () => {
  const expected = {
    'duck-nc-home-insurance': 'Duck, NC Home Insurance',
    'kitty-hawk-home-insurance': 'Kitty Hawk, NC Home Insurance',
    'kill-devil-hills-home-insurance': 'Kill Devil Hills, NC Home Insurance',
    'nags-head-home-insurance': 'Nags Head, NC Home Insurance',
    'corolla-home-insurance': 'Corolla, NC Home Insurance',
    'southern-shores-home-insurance': 'Southern Shores, NC Home Insurance',
    'carova-home-insurance': 'Carova, NC Home Insurance',
    'manteo-home-insurance': 'Manteo, NC Home Insurance',
    'wanchese-home-insurance': 'Wanchese, NC Home Insurance',
    'hatteras-home-insurance': 'Hatteras, NC Home Insurance',
    'rodanthe-home-insurance': 'Rodanthe, NC Home Insurance',
    'waves-nc-home-insurance': 'Waves, NC Home Insurance',
    'salvo-home-insurance': 'Salvo, NC Home Insurance',
    'avon-nc-home-insurance': 'Avon, NC Home Insurance',
    'buxton-home-insurance': 'Buxton, NC Home Insurance',
    'frisco-home-insurance': 'Frisco, NC Home Insurance',
    'ocracoke-home-insurance': 'Ocracoke, NC Home Insurance',
    'colington-island-home-insurance': 'Colington Island, NC Home Insurance',
    'manns-harbor-home-insurance': 'Manns Harbor, NC Home Insurance',
    'stumpy-point-home-insurance': 'Stumpy Point, NC Home Insurance',
    'east-lake-home-insurance': 'East Lake, Dare County, NC Home Insurance',
  };
  const towns = seoPages.filter(page => page.category === 'town');
  assert.equal(towns.length, 21);
  assert.deepEqual(towns.map(page => page.slug).sort(), Object.keys(expected).sort());
  for (const page of towns) assert.equal(getBreadcrumbs(page).at(-1).name, expected[page.slug], page.slug);
});

test('guide labels use initial capitals while retaining acronyms, geography and 4x4', () => {
  const expected = {
    'obx-wind-hail-insurance': 'OBX Wind And Hail Insurance',
    'outer-banks-wind-flood-insurance': 'Outer Banks Wind And Flood Insurance',
    'nc-coastal-property-insurance-pool-obx': 'NC Coastal Property Insurance Pool OBX',
    'outer-banks-4x4-access-home-insurance': 'Outer Banks 4x4 Access Home Insurance',
    'north-carolina-vacation-home-insurance': 'North Carolina Vacation Home Insurance',
    'tide-obx-insurance-guide': 'Piper Automated OBX Insurance Guide',
  };
  for (const [slug, name] of Object.entries(expected)) {
    assert.equal(getBreadcrumbs(getSeoPageBySlug(slug)).at(-1).name, name);
  }
  assert.equal(getBreadcrumbs({slug: 'nfip-guide', eyebrow: 'nfip flood insurance in NC'}).at(-1).name, 'NFIP Flood Insurance In NC');
});

test('atlas has one current hub crumb; policies have direct concise trails', () => {
  assert.deepEqual(getBreadcrumbs(getSeoPageBySlug('outer-banks-insurance-atlas')), [
    { name: 'Home', href: '/' }, hub,
  ]);
  assert.deepEqual(policyPages.map(page => getBreadcrumbs(page)), [
    [{ name: 'Home', href: '/' }, { name: 'Privacy Policy', href: '/privacy-policy/' }],
    [{ name: 'Home', href: '/' }, { name: 'Accessibility', href: '/accessibility/' }],
  ]);
  assert.deepEqual(getBreadcrumbs({slug: ''}), [{name: 'Home', href: '/'}]);
});

test('every canonical guide and policy has unique canonical destinations and matching JSON-LD', () => {
  const allPages = [...seoPages, ...policyPages];
  const original = JSON.stringify(allPages);
  for (const page of allPages) {
    const crumbs = getBreadcrumbs(page);
    assert.deepEqual(crumbs[0], {name: 'Home', href: '/'}, page.slug);
    assert.equal(crumbs.at(-1).href, `/${page.slug}/`, page.slug);
    assert.equal(new Set(crumbs.map(crumb => crumb.href)).size, crumbs.length, page.slug);
    assert.ok(crumbs.every(crumb => crumb.name && /^\/(?:[a-z0-9-]+\/)?$/.test(crumb.href)), page.slug);
    if (page.image && page.slug !== 'outer-banks-insurance-atlas') assert.deepEqual(crumbs[1], hub, page.slug);

    const schema = pageSchema(page)['@graph'].find(item => item['@type'] === 'BreadcrumbList');
    assert.deepEqual(schema.itemListElement, crumbs.map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.name,
      item: `https://www.obxncinsurance.com${crumb.href}`,
    })), page.slug);
  }
  assert.equal(JSON.stringify(allPages), original, 'Breadcrumb generation must not modify SEO page content');
});
