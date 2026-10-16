import { applyTownContentUpdates } from './townContentUpdates.mjs';
import { applyGuideContentUpdates } from './guideContentUpdates.mjs';
import { pageSeeds } from './pageSeeds.mjs';
import { seoRedirects } from './redirects.mjs';

import { localImages, pageImageOverrides } from './photography.mjs';
export { localImages } from './photography.mjs';

export const homepageImages = [
  localImages.nagsHead,
  localImages.corolla,
  localImages.manteo,
  localImages.ocracoke,
];

export const officialSourceLinks = [
  {
    name: "NC DOI homeowners insurance",
    url: "https://www.ncdoi.gov/consumers/homeowners-insurance",
    text:
      "North Carolina Department of Insurance consumer information for homeowners insurance questions.",
  },
  {
    name: "NCJUA / NCIUA",
    url: "https://www.ncjua-nciua.org/",
    text:
      "Official North Carolina joint underwriting and coastal property insurance pool resource.",
  },
  {
    name: "FEMA flood insurance",
    url: "https://www.fema.gov/flood-insurance",
    text:
      "Federal flood insurance information for NFIP and flood-risk questions.",
  },
  {
    name: "Dare County flood information",
    url: "https://www.darenc.gov/departments/planning/flood-information",
    text:
      "Local Dare County flood information and elevation-document starting point.",
  },
];

export const obxResourceTools = [
  {
    title: "Renewal review checklist",
    slug: "outer-banks-insurance-renewal-review",
    summary:
      "Use this when your premium, deductible, carrier, wind treatment, or property use may have changed.",
    items: [
      "Current declarations page",
      "Renewal notice and expiration date",
      "Wind and flood policy details",
      "Roof age and recent updates",
      "Rental or occupancy changes",
    ],
  },
  {
    title: "Flood and elevation prep",
    slug: "outer-banks-flood-zone-elevation-certificate",
    summary:
      "Gather the flood details that can slow down buyers, renewals, refinances, and rental property reviews.",
    items: [
      "Flood zone if known",
      "Elevation certificate status",
      "Foundation type",
      "Lender timing",
      "Current flood policy",
    ],
  },
  {
    title: "Vacation rental risk checklist",
    slug: "obx-vacation-rental-insurance",
    summary:
      "Prepare guest, income, amenity, and liability details for a weekly or seasonal rental review.",
    items: [
      "Guest count and rental schedule",
      "Property manager details",
      "Pools, hot tubs, elevators, and decks",
      "Furnished contents",
      "Loss-of-rent questions",
    ],
  },
  {
    title: "Multi-property inventory",
    slug: "obx-multiple-property-insurance-review",
    summary:
      "Organize more than one OBX property by address, use, renewal timing, and coverage path.",
    items: [
      "Address and town",
      "Current carrier and renewal date",
      "Home use for each property",
      "Wind and flood by address",
      "Umbrella or related lines",
    ],
  },
  {
    title: "Roof-age review guide",
    slug: "obx-roof-age-insurance",
    summary:
      "Prepare roof facts before underwriting, renewal, wind, or purchase timing becomes urgent.",
    items: [
      "Roof age and material",
      "Permits and invoices",
      "Inspection notes",
      "Photos if available",
      "Recent repairs or replacement",
    ],
  },
  {
    title: "Closing insurance checklist",
    slug: "outer-banks-home-buyer-insurance-checklist",
    summary:
      "Use this before closing pressure builds around homeowners, wind, flood, and lender timing.",
    items: [
      "Closing date",
      "Lender requirements",
      "Seller disclosures",
      "Flood and elevation documents",
      "Rental plans after closing",
    ],
  },
];


const pages = pageSeeds.map(({imageKey,...page}) => ({...page,image:pageImageOverrides[page.slug] || localImages[imageKey]}));
export const seoPages = applyTownContentUpdates(applyGuideContentUpdates(pages)).map(page => ({
  ...page,
  category: page.category || 'guide',
  relatedSlugs: [...new Set((page.relatedSlugs || []).map(slug => seoRedirects[slug] || slug))].filter(slug => slug !== page.slug),
  sections: page.sections.map(section => ({...section,links:section.links?.map(link => ({...link,slug:seoRedirects[link.slug] || link.slug}))})),
}));
export function getSeoPageByPath(pathname) { return getSeoPageBySlug(pathname.replace(/^\/+|\/+$/g, '')); }
export function getSeoPageBySlug(slug) { return seoPages.find(page => page.slug === (seoRedirects[slug] || slug)) || null; }
