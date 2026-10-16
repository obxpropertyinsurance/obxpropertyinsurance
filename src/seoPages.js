import { applyTownContentUpdates } from './townContentUpdates.mjs';
import { applyGuideContentUpdates } from './guideContentUpdates.mjs';
import { pageSeeds } from './pageSeeds.mjs';
import { seoRedirects } from './redirects.mjs';

const localImagesBase = {
  outerBanks: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Outer_Banks_-_Beach.jpg/1920px-Outer_Banks_-_Beach.jpg",
    alt: "Outer Banks North Carolina beach and dunes for coastal property insurance",
    caption: "Outer Banks, North Carolina coastline",
    credit: "Jarek Tuszynski, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Outer_Banks_-_Beach.jpg",
  },
  nagsHead: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nags_Head%2C_North_Carolina_beach_houses.jpg/1920px-Nags_Head%2C_North_Carolina_beach_houses.jpg",
    alt: "Nags Head North Carolina beach houses for Outer Banks home insurance review",
    caption: "Nags Head beach homes",
    credit: "lns1122, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Nags_Head,_North_Carolina_beach_houses.jpg",
  },
  duck: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Duck%2C_North_Carolina_%2814282586360%29.jpg/1920px-Duck%2C_North_Carolina_%2814282586360%29.jpg",
    alt: "Duck North Carolina Outer Banks homes and local setting for coastal insurance",
    caption: "Duck, North Carolina",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Duck,_North_Carolina_(14282586360).jpg",
  },
  corolla: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Currituck_lighthouse.jpg/1920px-Currituck_lighthouse.jpg",
    alt: "Currituck Beach Lighthouse near Corolla North Carolina for OBX property insurance",
    caption: "Currituck Beach Lighthouse near Corolla",
    credit: "Warfieldian, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Currituck_lighthouse.jpg",
  },
  kittyHawk: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Beach_at_Kitty_Hawk%2C_North_Carolina.jpg",
    alt: "Kitty Hawk North Carolina beach for Outer Banks homeowners insurance",
    caption: "Kitty Hawk beach",
    credit: "RJVIII, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Beach_at_Kitty_Hawk,_North_Carolina.jpg",
  },
  killDevilHills: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Panorama_of_Kill_Devil_Hills%2C_Beach_%28day%29.jpg/1920px-Panorama_of_Kill_Devil_Hills%2C_Beach_%28day%29.jpg",
    alt: "Kill Devil Hills North Carolina beach for OBX home insurance and flood review",
    caption: "Kill Devil Hills beach",
    credit: "Tetra09, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Panorama_of_Kill_Devil_Hills,_Beach_(day).jpg",
  },
  manteo: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Waterfront%2C_Manteo%2C_Roanoke_Island%2C_North_Carolina_%2814273919409%29.jpg/1920px-Waterfront%2C_Manteo%2C_Roanoke_Island%2C_North_Carolina_%2814273919409%29.jpg",
    alt: "Manteo Roanoke Island waterfront for Outer Banks North Carolina property insurance",
    caption: "Manteo waterfront on Roanoke Island",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Waterfront,_Manteo,_Roanoke_Island,_North_Carolina_(14273919409).jpg",
  },
  hatteras: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Hatteras%2C_Outer_Banks%2C_North_Carolina_%2814453741494%29.jpg/1920px-Hatteras%2C_Outer_Banks%2C_North_Carolina_%2814453741494%29.jpg",
    alt: "Hatteras Outer Banks North Carolina homes for coastal wind and flood insurance",
    caption: "Hatteras, Outer Banks",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hatteras,_Outer_Banks,_North_Carolina_(14453741494).jpg",
  },
  carova: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Wild_Horses_Outer_Banks_North_Carolina_01.jpg/1920px-Wild_Horses_Outer_Banks_North_Carolina_01.jpg",
    alt: "Carova North Carolina wild horses and 4x4 beach area for Outer Banks insurance",
    caption: "Northern Outer Banks near Carova",
    credit: "Kabongolei, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Wild_Horses_Outer_Banks_North_Carolina_01.jpg",
  },
  southernShores: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Welcome_to_Southern_Shores%2C_North_Carolina_%2814467784552%29.jpg/1920px-Welcome_to_Southern_Shores%2C_North_Carolina_%2814467784552%29.jpg",
    alt: "Southern Shores North Carolina Outer Banks community for home insurance review",
    caption: "Southern Shores, North Carolina",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Welcome_to_Southern_Shores,_North_Carolina_(14467784552).jpg",
  },
  wanchese: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/WancheseHarborEntrance.JPG/1920px-WancheseHarborEntrance.JPG",
    alt: "Wanchese North Carolina harbor and Roanoke Island property insurance review",
    caption: "Wanchese harbor entrance",
    credit: "Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:WancheseHarborEntrance.JPG",
  },
  rodanthe: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Chicamacomico_Life-Saving_Station%2C_Rodanthe%2C_North_Carolina_%2814474723003%29.jpg/1920px-Chicamacomico_Life-Saving_Station%2C_Rodanthe%2C_North_Carolina_%2814474723003%29.jpg",
    alt: "Rodanthe North Carolina Hatteras Island local landmark for coastal home insurance",
    caption: "Rodanthe on Hatteras Island",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Chicamacomico_Life-Saving_Station,_Rodanthe,_North_Carolina_(14474723003).jpg",
  },
  waves: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Waves%2C_North_Carolina%2C_Outer_Banks%2C_Highway_12_%2814268110787%29.jpg/1920px-Waves%2C_North_Carolina%2C_Outer_Banks%2C_Highway_12_%2814268110787%29.jpg",
    alt: "Waves North Carolina Outer Banks Highway 12 area for Hatteras Island insurance",
    caption: "Waves, North Carolina",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Waves,_North_Carolina,_Outer_Banks,_Highway_12_(14268110787).jpg",
  },
  salvo: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Salvo%2C_Outer_Banks%2C_North_Carolina_%2814454910445%29.jpg/1920px-Salvo%2C_Outer_Banks%2C_North_Carolina_%2814454910445%29.jpg",
    alt: "Salvo North Carolina Outer Banks village for Hatteras Island home insurance",
    caption: "Salvo, Outer Banks",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Salvo,_Outer_Banks,_North_Carolina_(14454910445).jpg",
  },
  avon: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Avon%2C_North_Carolina%2C_Outer_Banks_%2814431796146%29.jpg/1920px-Avon%2C_North_Carolina%2C_Outer_Banks_%2814431796146%29.jpg",
    alt: "Avon North Carolina Outer Banks community for Hatteras Island property insurance",
    caption: "Avon, North Carolina",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Avon,_North_Carolina,_Outer_Banks_(14431796146).jpg",
  },
  buxton: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Cape_Hatteras_Lighthouse%2C_North_Carolina%2C_USA.jpg/1920px-Cape_Hatteras_Lighthouse%2C_North_Carolina%2C_USA.jpg",
    alt: "Cape Hatteras Lighthouse near Buxton North Carolina for OBX wind and flood insurance",
    caption: "Cape Hatteras Lighthouse near Buxton",
    credit: "Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Cape_Hatteras_Lighthouse,_North_Carolina,_USA.jpg",
  },
  frisco: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Frisco%2C_Outer_Banks%2C_North_Carolina_%2814453786114%29.jpg/1920px-Frisco%2C_Outer_Banks%2C_North_Carolina_%2814453786114%29.jpg",
    alt: "Frisco North Carolina Outer Banks village for coastal homeowners insurance",
    caption: "Frisco, Outer Banks",
    credit: "Ken Lund, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Frisco,_Outer_Banks,_North_Carolina_(14453786114).jpg",
  },
  ocracoke: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ocracoke_Light_and_Guard_Station%2C_Ocracoke_NC%2C_USA.jpg/1920px-Ocracoke_Light_and_Guard_Station%2C_Ocracoke_NC%2C_USA.jpg",
    alt: "Ocracoke North Carolina lighthouse and village for island home insurance",
    caption: "Ocracoke Lighthouse",
    credit: "Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ocracoke_Light_and_Guard_Station,_Ocracoke_NC,_USA.jpg",
  },
};

export const localImages = Object.fromEntries(
  Object.entries(localImagesBase).map(([key, image]) => [
    key,
    {
      ...image,
      alt: image.alt.split(" for ")[0].replace(/ property insurance review| property insurance/g, ""),
    },
  ]),
);

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


const pages = pageSeeds.map(({imageKey,...page}) => ({...page,image:localImages[imageKey]}));
export const seoPages = applyTownContentUpdates(applyGuideContentUpdates(pages)).map(page => ({
  ...page,
  category: page.category || 'guide',
  relatedSlugs: [...new Set((page.relatedSlugs || []).map(slug => seoRedirects[slug] || slug))].filter(slug => slug !== page.slug),
  sections: page.sections.map(section => ({...section,links:section.links?.map(link => ({...link,slug:seoRedirects[link.slug] || link.slug}))})),
}));
export function getSeoPageByPath(pathname) { return getSeoPageBySlug(pathname.replace(/^\/+|\/+$/g, '')); }
export function getSeoPageBySlug(slug) { return seoPages.find(page => page.slug === (seoRedirects[slug] || slug)) || null; }
