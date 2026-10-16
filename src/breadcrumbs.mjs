const guideHub = {
  name: 'North Carolina Home Insurance',
  href: '/outer-banks-insurance-atlas/',
};

// Explicit place names avoid inferring towns from guide slugs or image subjects.
// East Lake keeps the county qualification already used in its page copy.
const places = {
  'duck-nc-home-insurance': 'Duck, NC',
  'kitty-hawk-home-insurance': 'Kitty Hawk, NC',
  'kill-devil-hills-home-insurance': 'Kill Devil Hills, NC',
  'nags-head-home-insurance': 'Nags Head, NC',
  'corolla-home-insurance': 'Corolla, NC',
  'southern-shores-home-insurance': 'Southern Shores, NC',
  'carova-home-insurance': 'Carova, NC',
  'manteo-home-insurance': 'Manteo, NC',
  'wanchese-home-insurance': 'Wanchese, NC',
  'hatteras-home-insurance': 'Hatteras, NC',
  'rodanthe-home-insurance': 'Rodanthe, NC',
  'waves-nc-home-insurance': 'Waves, NC',
  'salvo-home-insurance': 'Salvo, NC',
  'avon-nc-home-insurance': 'Avon, NC',
  'buxton-home-insurance': 'Buxton, NC',
  'frisco-home-insurance': 'Frisco, NC',
  'ocracoke-home-insurance': 'Ocracoke, NC',
  'colington-island-home-insurance': 'Colington Island, NC',
  'manns-harbor-home-insurance': 'Manns Harbor, NC',
  'stumpy-point-home-insurance': 'Stumpy Point, NC',
  'east-lake-home-insurance': 'East Lake, Dare County, NC',
};

const policies = {
  'privacy-policy': 'Privacy Policy',
  accessibility: 'Accessibility',
};
const acronyms = new Set(['OBX', 'NC', 'NFIP', 'DOI', 'FEMA', 'AI']);

function initialCapitals(value) {
  return value.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, word =>
    acronyms.has(word.toUpperCase()) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1),
  );
}

/** Shared visible and structured-data breadcrumbs; current page is the last item. */
export function getBreadcrumbs(page) {
  const home = { name: 'Home', href: '/' };
  if (!page?.slug) return [home];

  const href = `/${page.slug}/`;
  if (href === guideHub.href) return [home, { ...guideHub }];
  if (policies[page.slug]) return [home, { name: policies[page.slug], href }];

  const name = places[page.slug]
    ? `${places[page.slug]} Home Insurance`
    : initialCapitals(page.eyebrow || page.heading || page.title || page.slug.replaceAll('-', ' '));
  return [home, { ...guideHub }, { name, href }];
}
