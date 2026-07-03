import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  Home,
  Layers3,
  ListChecks,
  Lock,
  MapPin,
  Menu,
  PhoneCall,
  SearchCheck,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Umbrella,
  UserCheck,
  Waves,
  Wind,
  X,
} from "lucide-react";
import homeImage from "./assets/obx-coastal-home-1280.jpg";
import {
  getSeoPageByPath,
  getSeoPageBySlug,
  homepageImages,
  obxResourceTools,
  officialSourceLinks,
  seoPages,
} from "./seoPages.js";

const steps = [
  {
    icon: MapPin,
    label: "Start with your OBX address",
    text: "Tell us where the property is and how it is used.",
  },
  {
    icon: Wind,
    label: "Answer coastal questions",
    text: "We ask about wind, flood, roof, elevation, and rental use up front.",
  },
  {
    icon: SearchCheck,
    label: "Get matched to options",
    text: "Your details are organized for a local Outer Banks, NC licensed agent to review.",
  },
  {
    icon: ShieldCheck,
    label: "Choose with local help",
    text: "A local Outer Banks, NC licensed agent reviews your choices before you buy.",
  },
];

const workflow = [
  {
    icon: MapPin,
    label: "Property address",
    text: "We identify the town, county, and coastal rating details.",
  },
  {
    icon: Home,
    label: "Home use",
    text: "Primary home, second home, weekly rental, or investment property.",
  },
  {
    icon: ClipboardCheck,
    label: "Roof & construction",
    text: "Year built, roof age, siding, openings, and updates.",
  },
  {
    icon: Waves,
    label: "Wind & flood",
    text: "Coastal exposure, flood zone, elevation notes, and deductibles.",
  },
  {
    icon: UserCheck,
    label: "Local agent review",
    text: "Our local Outer Banks, NC licensed agent reviews and explains the actual insurance options.",
  },
];

const faqs = [
  {
    question: "Do I get real quotes?",
    answer:
      "Yes. OBXNCInsurance.com organizes your property details, then our local Outer Banks, NC licensed agent reviews eligibility and shops carrier-backed options when available.",
  },
  {
    question: "Why do you ask about wind, flood, and rental use?",
    answer:
      "Outer Banks property insurance is different. Carriers often need to know coastal exposure, flood zone, roof details, elevation information, and whether the home is rented weekly or seasonally.",
  },
  {
    question: "Who helps me choose a policy?",
    answer:
      "Insurance advice, quotes, binding, and servicing are handled by our local Outer Banks, NC licensed agent. Your details are used only for your OBX insurance request. No spam.",
  },
];

const coverageOptions = [
  {
    title: "Homeowners + wind review",
    text: "For the structure, belongings, liability, and coastal wind exposure.",
    status: "Core check",
  },
  {
    title: "Flood guidance",
    text: "For NFIP or private flood options when available for the property.",
    status: "Coastal must-have",
  },
  {
    title: "Rental-use clarity",
    text: "For second homes, weekly rentals, and seasonal occupancy questions.",
    status: "OBX-specific",
  },
];

const insuranceNeeds = [
  {
    icon: Home,
    title: "Outer Banks homeowners insurance",
    text: "For year-round homes, coastal cottages, and beach houses that need property, liability, and wind review.",
  },
  {
    icon: Wind,
    title: "OBX wind and hail insurance",
    text: "For homes where wind exposure, roof age, openings, and deductibles can affect available options.",
  },
  {
    icon: Waves,
    title: "Outer Banks flood insurance",
    text: "For flood zone, elevation, lender, NFIP, and private flood questions tied to a specific address.",
  },
  {
    icon: Umbrella,
    title: "OBX vacation rental insurance",
    text: "For weekly rentals, second homes, and properties with seasonal guests or rental income.",
  },
];

const trustSignals = [
  {
    icon: BadgeCheck,
    title: "Free coverage brief",
    text: "Organize the details a licensed Outer Banks agent will ask for first.",
  },
  {
    icon: PhoneCall,
    title: "Quick OBX expert review",
    text: "Send the basics first so your review starts with the right property facts.",
  },
  {
    icon: Layers3,
    title: "Home + wind + flood",
    text: "The coastal questions are reviewed together, not in isolation.",
  },
  {
    icon: ShieldCheck,
    title: "No Spam Guarantee",
    text: "We do not sell leads or send your details to an agent network.",
  },
];

const obxRateChangeRows = [
  {
    territory: "Territory 110",
    area: "Beach areas in Currituck, Dare, and Hyde counties",
    requested: 45.1,
    approved2025: 5.1,
    approved2026: 4.8,
  },
  {
    territory: "Territory 130",
    area: "Coastal areas in Currituck, Dare, Hyde, and Pamlico counties",
    requested: 33.9,
    approved2025: 2.8,
    approved2026: 2.8,
  },
];

const rateChartMax = 50;

const rateSourceLinks = [
  {
    name: "NC DOI homeowners settlement",
    url: "https://www.ncdoi.gov/news/press-releases/2025/01/17/commissioner-causey-negotiates-settlement-rate-bureaus-homeowners-insurance-request",
    text: "January 2025 settlement for North Carolina homeowners insurance base-rate changes.",
  },
  {
    name: "NC DOI settlement table",
    url: "https://www.ncdoi.gov/2024-proposed-homeowners-insurance-increase-settlement-table/open",
    text: "Territory-level requested and approved homeowners rate changes.",
  },
  {
    name: "NC DOI dwelling settlement",
    url: "https://www.ncdoi.gov/news/press-releases/2026/04/22/commissioner-causey-negotiates-dwelling-rate-settlement-insurance-companies",
    text: "Dwelling-policy context for rentals and non-owner-occupied homes.",
  },
];

const informationHubCards = [
  {
    icon: Home,
    title: "Understand the property",
    text:
      "Address, distance to water, roof age, construction, occupancy, rental use, flood zone, and elevation documents can all change the conversation.",
  },
  {
    icon: Clock3,
    title: "Plan renewals early",
    text:
      "A renewal review should start before the last-minute notice, especially if roof age, rental income, or carrier appetite has changed.",
  },
  {
    icon: Layers3,
    title: "Grow into multiple properties",
    text:
      "Second homes, rental homes, primary homes, autos, umbrella, and other lines need a clean inventory so gaps and duplicate assumptions are easier to spot.",
  },
  {
    icon: BookOpenCheck,
    title: "Clear answers before the quote",
    text:
      "Learn what matters for your property, then start a licensed review with us when you are ready.",
  },
];

const atlasFeatureLinks = [
  {
    title: "Oceanfront homes",
    text: "Wind, flood, elevation, rental use, dune exposure, and deductible questions.",
    href: "/outer-banks-oceanfront-home-insurance/",
  },
  {
    title: "Soundside homes",
    text: "Flood zones, docks, outbuildings, wind, shoreline, and property-use details.",
    href: "/outer-banks-soundside-home-insurance/",
  },
  {
    title: "Canalfront homes",
    text: "Bulkheads, docks, other structures, liability, flood, and rental review.",
    href: "/outer-banks-canalfront-home-insurance/",
  },
  {
    title: "4x4 access homes",
    text: "Remote access, replacement logistics, Carova-area questions, wind, flood, and rental use.",
    href: "/outer-banks-4x4-access-home-insurance/",
  },
  {
    title: "Named storm deductibles",
    text: "Wind, hurricane, named storm, percentage deductibles, and renewal comparison.",
    href: "/outer-banks-named-storm-deductible-guide/",
  },
  {
    title: "Nonrenewal or carrier change",
    text: "What to gather when timing, carrier appetite, roof age, or renewal terms change.",
    href: "/outer-banks-insurance-nonrenewal-carrier-change/",
  },
];

const contactPreferences = [
  "Phone call",
  "Text first",
  "Email first",
  "No preference",
];

const callbackWindows = [
  "As soon as available",
  "Morning",
  "Afternoon",
  "Evening",
  "After I send documents",
];

const expertStandardCards = [
  {
    icon: ClipboardCheck,
    title: "Address-specific prep",
    text:
      "We organize property use, timing, roof, wind, flood zone, and document details our licensed review needs first.",
  },
  {
    icon: BookOpenCheck,
    title: "Official resources included",
    text:
      "Homeowners can verify flood, wind, and North Carolina insurance background with DOI, FEMA, and NCJUA/NCIUA links.",
  },
  {
    icon: UserCheck,
    title: "Licensed local review",
    text:
      "OBXNCInsurance.com prepares the brief. Quotes, binding, recommendations, and servicing stay with a licensed North Carolina agent.",
  },
  {
    icon: ShieldCheck,
    title: "No Spam Guarantee",
    text:
      "Your information is used only for this OBX property insurance request. We do not sell your details to an agent network.",
  },
];

const coverageLayers = [
  {
    icon: Home,
    title: "Homeowners / hazard",
    text: "Structure, belongings, liability, occupancy, roof age, updates, and replacement-cost questions.",
  },
  {
    icon: Wind,
    title: "Wind and hail",
    text: "Coastal exposure, roof details, openings, named storm questions, and deductible comfort.",
  },
  {
    icon: Waves,
    title: "Flood",
    text: "Flood zone, elevation certificate status, lender timing, NFIP, and private flood paths when available.",
  },
];

const toolkitIconBySlug = {
  "outer-banks-insurance-renewal-review": Clock3,
  "outer-banks-flood-zone-elevation-certificate": Waves,
  "obx-vacation-rental-insurance": Umbrella,
  "obx-multiple-property-insurance-review": Layers3,
  "obx-roof-age-insurance": Home,
  "outer-banks-home-buyer-insurance-checklist": FileCheck2,
};

const trustFoundationCards = [
  {
    icon: BookOpenCheck,
    title: "Source-backed education",
    text:
      "Major guides link to NC DOI, FEMA, FloodSmart, NCJUA/NCIUA, Dare County, or rate filing context when those sources help homeowners verify the topic.",
    href: "/obx-insurance-trust-and-source-standards/",
  },
  {
    icon: ShieldCheck,
    title: "No lead selling",
    text:
      "Your details are used for your OBX property insurance request. We do not sell your information to an agent network.",
    href: "/obx-insurance-trust-and-source-standards/",
  },
  {
    icon: UserCheck,
    title: "Licensed review boundary",
    text:
      "Education helps you prepare. Quotes, advice, binding, recommendations, and servicing stay with a licensed North Carolina insurance agent.",
    href: "/obx-insurance-trust-and-source-standards/",
  },
];

const alertCards = [
  {
    icon: Clock3,
    title: "Buying soon",
    text: "Start before the closing date gets tight. Wind and flood details can take extra follow-up.",
  },
  {
    icon: FileCheck2,
    title: "Renewal coming up",
    text: "Share your current carrier, expiration date, roof age, and deductible comfort for a cleaner review.",
  },
  {
    icon: ShieldCheck,
    title: "Nonrenewal or carrier change",
    text: "Send the notice, deadline, current declarations page, roof details, and property use so timing is clear.",
  },
  {
    icon: Waves,
    title: "Flood zone unsure",
    text: "Tell us what you know. Our licensed review can help identify what documents may matter next.",
  },
  {
    icon: Umbrella,
    title: "Vacation rental",
    text: "Weekly guests, pools, elevators, rental income, and liability questions deserve early attention.",
  },
];

const expertisePoints = [
  {
    icon: Home,
    title: "Coastal home coverage",
    text: "For primary homes, second homes, condos, cottages, and beach houses across Outer Banks, North Carolina.",
  },
  {
    icon: Wind,
    title: "Wind and hail review",
    text: "For roof age, openings, wind deductibles, named storm questions, and coastal exposure from Corolla to Ocracoke.",
  },
  {
    icon: Waves,
    title: "Flood insurance guidance",
    text: "For flood zones, elevation certificates, lender requirements, NFIP questions, and private flood options when available.",
  },
  {
    icon: Umbrella,
    title: "Rental and liability needs",
    text: "For weekly rentals, second homes, furnished properties, guest exposure, liability, and loss-of-rent conversations.",
  },
];

const serviceAreas = [
  { name: "Carova", slug: "carova-home-insurance" },
  { name: "Corolla", slug: "corolla-home-insurance" },
  { name: "Duck", slug: "duck-nc-home-insurance" },
  { name: "Southern Shores", slug: "southern-shores-home-insurance" },
  { name: "Kitty Hawk", slug: "kitty-hawk-home-insurance" },
  { name: "Kill Devil Hills", slug: "kill-devil-hills-home-insurance" },
  { name: "Nags Head", slug: "nags-head-home-insurance" },
  { name: "Manteo", slug: "manteo-home-insurance" },
  { name: "Wanchese", slug: "wanchese-home-insurance" },
  { name: "Rodanthe", slug: "rodanthe-home-insurance" },
  { name: "Waves", slug: "waves-nc-home-insurance" },
  { name: "Salvo", slug: "salvo-home-insurance" },
  { name: "Avon", slug: "avon-nc-home-insurance" },
  { name: "Buxton", slug: "buxton-home-insurance" },
  { name: "Frisco", slug: "frisco-home-insurance" },
  { name: "Hatteras", slug: "hatteras-home-insurance" },
  { name: "Ocracoke", slug: "ocracoke-home-insurance" },
];

const leadRecipientEmail = "obxpropertyinsurance@proton.me";

const getQuoteReviewHref = (page) =>
  page ? `/?review=${encodeURIComponent(page.slug)}#quote` : "/#quote";

const getReviewOptionForPage = (page) => {
  const slug = page?.slug || "";
  if (slug.includes("flood")) return "Flood guidance";
  if (slug.includes("rental")) return "Rental-use clarity";
  if (slug.includes("wind") || slug.includes("storm") || slug.includes("deductible")) {
    return "Homeowners + wind review";
  }
  return "Homeowners + wind review";
};

const getLeadGoalForPage = (page) => {
  const slug = page?.slug || "";
  if (slug.includes("renewal") || slug.includes("nonrenewal") || slug.includes("carrier-change")) {
    return "Renewal review";
  }
  if (slug.includes("multiple-property") || slug.includes("toolkit")) return "Current policy review";
  if (slug.includes("vacation-rental")) return "Current policy review";
  return "Buying / closing soon";
};

const getReviewPageFromSearch = () => {
  const reviewSlug = new URLSearchParams(window.location.search).get("review");
  return reviewSlug ? getSeoPageBySlug(reviewSlug) : null;
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const tideAgent = {
  name: "Tide",
  title: "Tide, your OBX Insurance Advisor",
  promise: "Save time. Avoid costly surprises. No spam.",
};

const tideAutoOpenStorageKey = "obxncinsurance:tide-auto-opened";
const tideDismissedStorageKey = "obxncinsurance:tide-dismissed";

const getTideStorageValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setTideStorageValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Tide still works if a browser blocks localStorage.
  }
};

const tideInitialAnswers = {
  address: "",
  propertyUse: "",
  rentalUse: "",
  leadGoal: "",
  windExposure: "Needs review",
  floodZone: "Needs review",
  elevationCertificate: "Unsure",
  roofAge: "",
  yearBuilt: "",
  currentCarrier: "",
  policyExpiration: "",
  coverageNeededBy: "",
  notes: "",
  fullName: "",
  email: "",
  phone: "",
  preferredContact: "Phone call",
  callbackWindow: "As soon as available",
  companyWebsite: "",
};

const tidePropertyOptions = [
  {
    value: "Primary home",
    label: "Primary home",
    detail: "This is my main residence",
    icon: Home,
    updates: { rentalUse: "Not rented" },
  },
  {
    value: "Second home",
    label: "Second home",
    detail: "I use this home part-time",
    icon: Home,
  },
  {
    value: "Vacation rental",
    label: "Vacation rental",
    detail: "I rent this property to guests",
    icon: Umbrella,
    updates: { rentalUse: "Weekly / seasonal" },
  },
  {
    value: "Condo",
    label: "Condo",
    detail: "Condo or townhome",
    icon: Layers3,
  },
  {
    value: "Buying / closing soon",
    label: "Buying soon",
    detail: "I am under contract or shopping",
    icon: ClipboardCheck,
    updates: { leadGoal: "Buying / closing soon" },
  },
];

const tideGoalOptions = [
  {
    value: "Buying / closing soon",
    label: "Buying or closing soon",
    detail: "We will flag lender timing, address details, and flood documents early.",
  },
  {
    value: "Renewal review",
    label: "Renewal review",
    detail: "We will organize current carrier, expiration date, roof, wind, and flood details.",
  },
  {
    value: "Current policy review",
    label: "Review my current policy",
    detail: "Useful if premium, deductibles, rental use, or property facts changed.",
  },
  {
    value: "Adding another property",
    label: "Adding another property",
    detail: "Helpful for owners with multiple OBX homes or related lines.",
  },
  {
    value: "Just researching",
    label: "Just researching",
    detail: "Tide can still organize the basics and explain what matters first.",
  },
];

const tideRentalOptions = [
  "Not rented",
  "Weekly / seasonal",
  "Long term rental",
  "Family and friends only",
  "Unsure",
];

const tideWindOptions = [
  "Oceanfront or near ocean",
  "Soundside or canalfront",
  "In an OBX town, not sure",
  "4x4 or remote access",
  "Needs review",
];

const tideFloodOptions = [
  "Have flood policy",
  "Have elevation certificate",
  "Lender requires flood",
  "Not sure",
  "Needs review",
];

const tideContactWindows = [
  "As soon as available",
  "Morning",
  "Afternoon",
  "Evening",
  "Email first",
];

const tideQuickQuestions = [
  "Will I get spammed?",
  "Do I have to take a sales call?",
  "Why do wind and flood matter?",
  "What if it is a weekly rental?",
  "What documents help most?",
  "What if my renewal jumped?",
];

const tideSteps = [
  "Property",
  "Details",
  "Coverage",
  "You",
  "Review",
];

const getTideSelectedCoverage = (answers) => {
  const combined = `${answers.propertyUse} ${answers.rentalUse} ${answers.leadGoal}`.toLowerCase();
  if (combined.includes("rental")) return "Rental-use clarity";
  if (combined.includes("flood")) return "Flood guidance";
  return "Homeowners + wind review";
};

const getTideSourcePath = () => `${window.location.pathname}${window.location.search}`;

const tideStopWords = new Set([
  "about",
  "after",
  "also",
  "because",
  "before",
  "being",
  "between",
  "could",
  "does",
  "from",
  "have",
  "help",
  "home",
  "homes",
  "insurance",
  "outer",
  "banks",
  "obx",
  "policy",
  "property",
  "question",
  "review",
  "should",
  "that",
  "their",
  "there",
  "they",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
  "would",
  "your",
]);

const tideKnowledgeBase = [
  ...seoPages.flatMap((page) => {
    const pageUrl = `/${page.slug}/`;
    return [
      {
        title: page.h1 || page.eyebrow,
        text: [page.eyebrow, page.intro, page.support, page.intent, ...(page.checklist || [])].join(" "),
        url: pageUrl,
      },
      ...(page.sections || []).map((section) => ({
        title: `${page.eyebrow}: ${section.heading}`,
        text: section.body,
        url: pageUrl,
      })),
      ...(page.localInsights || []).map((insight) => ({
        title: `${page.eyebrow}: local note`,
        text: insight,
        url: pageUrl,
      })),
      ...(page.faqs || []).map((faq) => ({
        title: faq.question,
        text: faq.answer,
        url: pageUrl,
      })),
    ];
  }),
  ...obxResourceTools.map((tool) => ({
    title: tool.title,
    text: `${tool.summary} Helpful items include ${tool.items.join(", ")}.`,
    url: `/${tool.slug}/`,
  })),
  ...officialSourceLinks.map((source) => ({
    title: source.name,
    text: source.text,
    url: source.url,
  })),
];

const getTideTerms = (message) =>
  Array.from(
    new Set(
      message
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 3 && !tideStopWords.has(term)),
    ),
  );

const getTideKnowledgeMatches = (message, limit = 2) => {
  const terms = getTideTerms(message);
  if (!terms.length) return [];

  return tideKnowledgeBase
    .map((item) => {
      const title = item.title.toLowerCase();
      const text = item.text.toLowerCase();
      const score = terms.reduce((total, term) => {
        if (title.includes(term)) return total + 5;
        if (text.includes(term)) return total + 2;
        return total;
      }, 0);
      return { item, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((match) => match.item);
};

const getTideKnowledgeReply = (message) => {
  const matches = getTideKnowledgeMatches(message);
  if (!matches.length) return null;
  const [primary, secondary] = matches;
  const related = secondary ? ` Related guide: ${secondary.title}.` : "";
  return {
    text:
      `Tide take: ${primary.text} Tide can add this context to your quote brief so the licensed Outer Banks review starts with better facts. Helpful guide: ${primary.title}.${related}`,
  };
};

const buildTideNotes = (answers, pageContext) => {
  const notes = [
    "Tide guided intake",
    pageContext?.eyebrow ? `Guide context: ${pageContext.eyebrow}` : "",
    answers.notes ? `Visitor notes: ${answers.notes}` : "",
  ].filter(Boolean);
  return notes.join(". ");
};

const buildTideLeadPayload = ({ answers, pageContext }) => ({
  ...answers,
  address: answers.address,
  fullName: answers.fullName,
  email: answers.email,
  phone: answers.phone,
  propertyUse: answers.propertyUse || "Needs review",
  rentalUse: answers.rentalUse || "Unsure",
  windExposure: answers.windExposure || "Needs review",
  floodZone: answers.floodZone || "Needs review",
  elevationCertificate: answers.elevationCertificate || "Unsure",
  leadGoal: answers.leadGoal || "Coverage review",
  selectedCoverage: getTideSelectedCoverage(answers),
  coverage: "",
  deductible: "",
  searchIntent: `${tideAgent.name} OBX guide`,
  landingPageTitle: pageContext?.title || document.title,
  sourcePath: getTideSourcePath(),
  notes: buildTideNotes(answers, pageContext),
  submittedAt: new Date().toISOString(),
});

const submitLeadPayload = async (leadPayload) => {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadPayload),
  });
  const result = await response.json().catch(() => ({}));

  if ((!response.ok || !result.ok) && result.fallback === "formsubmit-browser") {
    const fallback = await sendLeadWithFormSubmit(
      leadPayload,
      result.formSubmitEmail || leadRecipientEmail,
    );
    if (fallback.ok) {
      await markLeadDelivery({
        leadId: result.leadId,
        delivery: fallback.delivery === "formsubmit" ? "formsubmit-browser" : fallback.delivery,
      });
    }
    return {
      ...result,
      ok: fallback.ok,
      delivery: fallback.delivery,
    };
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "Your request could not be sent.");
  }

  return result;
};

const getTideGuideReply = (message) => {
  const text = message.toLowerCase();

  if (
    text.includes("spam") ||
    text.includes("sell") ||
    text.includes("lead") ||
    text.includes("marketing") ||
    text.includes("bombard")
  ) {
    return {
      text:
        "No spam means no lead marketplace, no unrelated marketing list, and no mystery phone parade. Your details are used for this OBX insurance request with OBXNCInsurance.com and our licensed review team.",
    };
  }

  if (text.includes("phone") || text.includes("call") || text.includes("sales") || text.includes("pressure")) {
    return {
      text:
        "Tide is built for people who want answers before a call. You can ask questions, build the brief, and choose your preferred follow-up. A licensed Outer Banks insurance agent follows up about this request, not to pressure you into a phone marathon.",
    };
  }

  if (text.includes("agent") || text.includes("licensed") || text.includes("human")) {
    return {
      text:
        "Tide organizes the details and explains what matters. Quotes, advice, binding, recommendations, and policy service come from a licensed North Carolina insurance agent after your brief is submitted.",
    };
  }

  if (text.includes("detail") || text.includes("need") || text.includes("document") || text.includes("prepare")) {
    return {
      text:
        "The most useful details are the property address, occupancy, rental use, roof age, year built, flood zone, elevation certificate status, current carrier, policy expiration, and closing or renewal timing.",
    };
  }

  if (text.includes("flood") || text.includes("wind") || text.includes("hail")) {
    return {
      text:
        "Outer Banks homes often need separate attention for wind and flood. Homeowners coverage may not include flood from rising water or storm surge. Our local Outer Banks, NC licensed agent can review wind deductibles, named storm questions, flood zone details, and NFIP or private flood options when available.",
    };
  }

  if (text.includes("rental") || text.includes("vacation") || text.includes("airbnb")) {
    return {
      text:
        "Vacation rental use matters in the OBX. Weekly guests, furnished contents, liability, loss of rent, pools, hot tubs, elevators, decks, property managers, and seasonal occupancy can all change what a licensed review needs.",
    };
  }

  if (text.includes("broker") || text.includes("quote") || text.includes("carrier")) {
    return {
      text:
        "The website prepares your request for our local Outer Banks, NC licensed agent. That licensed agent handles carrier availability, quotes, advice, binding, and policy servicing after your details are submitted. No spam or unrelated marketing.",
    };
  }

  if (text.includes("town") || text.includes("nags") || text.includes("corolla") || text.includes("duck") || text.includes("hatteras")) {
    return {
      text:
        "Location matters across the Outer Banks. Corolla, Duck, Southern Shores, Kitty Hawk, Kill Devil Hills, Nags Head, Manteo, Hatteras Island, and Ocracoke can all raise different questions around wind exposure, flood zone, rental use, and access.",
    };
  }

  const knowledgeReply = getTideKnowledgeReply(text);
  if (knowledgeReply) return knowledgeReply;

  return {
    text:
      "That is a very OBX insurance question, which is exactly why Tide exists. Share the property type, address, use, wind, flood, roof, timing, or renewal concern you are thinking about, and Tide will organize it into a cleaner brief for licensed review.",
  };
};

const buildLeadFormData = (leadPayload) => {
  const formData = new FormData();
  formData.set(
    "_subject",
    `New OBX insurance lead: ${leadPayload.searchIntent || "OBX property review"}${
      leadPayload.address ? ` - ${leadPayload.address}` : ""
    }`,
  );
  formData.set("_template", "table");
  formData.set("_captcha", "false");
  formData.set("_replyto", leadPayload.email);
  formData.set("name", leadPayload.fullName);
  formData.set("email", leadPayload.email);
  formData.set("phone", leadPayload.phone);
  formData.set("preferred_contact", leadPayload.preferredContact);
  formData.set("callback_window", leadPayload.callbackWindow);
  formData.set("property_address", leadPayload.address);
  formData.set("search_intent", leadPayload.searchIntent);
  formData.set("landing_page", leadPayload.landingPageTitle);
  formData.set("lead_goal", leadPayload.leadGoal);
  formData.set("coverage_needed_by", leadPayload.coverageNeededBy);
  formData.set("current_carrier", leadPayload.currentCarrier);
  formData.set("current_policy_expiration", leadPayload.policyExpiration);
  formData.set("elevation_certificate", leadPayload.elevationCertificate);
  formData.set("property_use", leadPayload.propertyUse);
  formData.set("rental_use", leadPayload.rentalUse);
  formData.set("wind_exposure", leadPayload.windExposure);
  formData.set("flood_zone", leadPayload.floodZone);
  formData.set("year_built", leadPayload.yearBuilt);
  formData.set("roof_age", leadPayload.roofAge);
  formData.set("selected_review", leadPayload.selectedCoverage);
  formData.set("dwelling_coverage", leadPayload.coverage);
  formData.set("wind_deductible", leadPayload.deductible);
  formData.set("notes", leadPayload.notes);
  formData.set("source", `https://www.obxncinsurance.com${leadPayload.sourcePath}`);
  formData.set("submitted_at", leadPayload.submittedAt);
  return formData;
};

const sendLeadWithFormSubmit = async (leadPayload, toEmail = leadRecipientEmail) => {
  const response = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: buildLeadFormData(leadPayload),
  });
  const result = await response.json().catch(() => ({}));
  const message = String(result.message || "");

  if (response.ok && (result.success === "true" || /activation/i.test(message))) {
    return {
      ok: true,
      delivery: /activation/i.test(message) ? "formsubmit-activation" : "formsubmit",
    };
  }

  throw new Error(message || "Your request could not be emailed right now.");
};

const markLeadDelivery = async ({ leadId, delivery }) => {
  if (!leadId || !delivery) return;
  await fetch("/api/lead-delivery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ leadId, delivery }),
  }).catch(() => {});
};

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="OBXNCInsurance.com home">
      <span className="logo-mark" aria-hidden="true">
        <Waves size={25} strokeWidth={2.3} />
      </span>
      <span className="logo-wordmark">
        <span>OBXNCInsurance</span>
        <strong>.com</strong>
      </span>
    </a>
  );
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [coverage, setCoverage] = useState(750000);
  const [deductible, setDeductible] = useState(2500);
  const [selectedOption, setSelectedOption] = useState("Homeowners + wind review");
  const [selectedToolkitTitle, setSelectedToolkitTitle] = useState(obxResourceTools[0].title);
  const [openFaq, setOpenFaq] = useState(0);
  const [quoteStarted, setQuoteStarted] = useState(false);
  const [quoteStep, setQuoteStep] = useState(1);
  const [leadStatus, setLeadStatus] = useState({ state: "idle", message: "" });
  const [confirmationLead, setConfirmationLead] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    address: "",
    propertyUse: "Second home",
    rentalUse: "Weekly / seasonal",
    windExposure: "OBX coast",
    floodZone: "Needs review",
    fullName: "",
    email: "",
    phone: "",
    preferredContact: "Phone call",
    callbackWindow: "As soon as available",
    leadGoal: "Buying / closing soon",
    coverageNeededBy: "",
    currentCarrier: "",
    policyExpiration: "",
    elevationCertificate: "Unsure",
    yearBuilt: "",
    roofAge: "",
    notes: "",
    companyWebsite: "",
  });
  const activeSeoPage = getSeoPageByPath(window.location.pathname);
  const reviewSeoPage = useMemo(getReviewPageFromSearch, []);
  const selectedToolkit =
    obxResourceTools.find((tool) => tool.title === selectedToolkitTitle) || obxResourceTools[0];

  useEffect(() => {
    if (!activeSeoPage) {
      document.title = "Outer Banks Homeowners Insurance | OBXNCInsurance.com";
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          "content",
          "Create a free Outer Banks homeowners and property insurance brief for coastal homes, wind, flood, second homes, vacation rentals, and local licensed review.",
        );
      document
        .querySelector('link[rel="canonical"]')
        ?.setAttribute("href", "https://www.obxncinsurance.com/");
      return;
    }

    document.title = activeSeoPage.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", activeSeoPage.description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", `https://www.obxncinsurance.com/${activeSeoPage.slug}/`);
  }, [activeSeoPage]);

  useEffect(() => {
    if (!reviewSeoPage) return;

    setSelectedOption(getReviewOptionForPage(reviewSeoPage));
    setQuoteForm((current) => ({
      ...current,
      leadGoal: getLeadGoalForPage(reviewSeoPage),
    }));
  }, [reviewSeoPage]);

  const localReadiness = useMemo(() => {
    const coverageScore = coverage >= 800000 ? 4 : coverage >= 600000 ? 3 : 2;
    const deductibleScore = deductible >= 2500 ? 2 : 1;
    return Math.min(94, 72 + coverageScore * 4 + deductibleScore * 3);
  }, [coverage, deductible]);

  const heroCheckRows = useMemo(
    () => [
      { label: "Occupancy", value: quoteForm.propertyUse },
      { label: "Rental use", value: quoteForm.rentalUse },
      { label: "Wind exposure", value: quoteForm.windExposure },
      { label: "Flood zone", value: quoteForm.floodZone },
      { label: "Timing", value: quoteForm.leadGoal },
      { label: "Local agency", value: "Ready" },
    ],
    [
      quoteForm.floodZone,
      quoteForm.leadGoal,
      quoteForm.propertyUse,
      quoteForm.rentalUse,
      quoteForm.windExposure,
    ],
  );

  const getStepOneMissing = () => {
    const missing = [];
    if (!quoteForm.address.trim()) missing.push("property address");
    if (!quoteForm.fullName.trim()) missing.push("full name");
    if (!isValidEmail(quoteForm.email)) missing.push("valid email");
    if (!quoteForm.phone.trim()) missing.push("phone number");
    return missing;
  };

  const focusFirstMissingStepOneField = () => {
    const missingFieldId = !quoteForm.address.trim()
      ? "property-address"
      : !quoteForm.fullName.trim()
        ? "lead-full-name"
        : !isValidEmail(quoteForm.email)
          ? "lead-email"
          : !quoteForm.phone.trim()
            ? "lead-phone"
            : "property-address";

    window.setTimeout(() => document.getElementById(missingFieldId)?.focus(), 80);
  };

  const updateQuoteField = (field) => (event) => {
    setQuoteForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setQuoteStarted(false);
  };

  const handleCoverageSelect = (title) => {
    setSelectedOption(title);
    setQuoteStarted(false);
  };

  const continueToQuoteForm = (event) => {
    event.preventDefault();
    focusQuoteForm();
  };

  const continueToOptionalDetails = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const missing = getStepOneMissing();
    if (missing.length) {
      setLeadStatus({
        state: "error",
        message: `Please add ${missing.join(", ")} before continuing.`,
      });
      setQuoteStep(1);
      focusFirstMissingStepOneField();
      return;
    }

    setLeadStatus({ state: "idle", message: "" });
    setQuoteStep(2);
    window.setTimeout(() => document.getElementById("year-built")?.focus(), 120);
  };

  const startQuote = async (event) => {
    event.preventDefault();

    const missing = getStepOneMissing();
    if (missing.length) {
      setLeadStatus({
        state: "error",
        message: `Please add ${missing.join(", ")} before sending your request.`,
      });
      setQuoteStep(1);
      focusFirstMissingStepOneField();
      return;
    }

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const sourcePath = reviewSeoPage
      ? `/${reviewSeoPage.slug}/`
      : `${window.location.pathname}${window.location.search}`;
    const leadPayload = {
      ...quoteForm,
      coverage,
      deductible,
      selectedCoverage: selectedOption,
      sourcePath,
      searchIntent: reviewSeoPage?.eyebrow || selectedOption,
      landingPageTitle: reviewSeoPage?.title || document.title,
      submittedAt: new Date().toISOString(),
    };

    setLeadStatus({ state: "submitting", message: "Sending your OBX coverage brief..." });

    try {
      const result = await submitLeadPayload(leadPayload);

      window.localStorage.setItem("obxncinsurance:lastLead", JSON.stringify(leadPayload));
      setQuoteStarted(true);
      setLeadStatus({
        state: "success",
        message: "Your request has been submitted for local Outer Banks, NC licensed agent review.",
      });
      setConfirmationLead({
        address: quoteForm.address,
        name: quoteForm.fullName,
        delivery: result.delivery || "email",
      });
    } catch (error) {
      setQuoteStarted(false);
      setLeadStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your request could not be sent. Please try again or email us directly.",
      });
    }
  };

  const focusQuoteForm = () => {
    setQuoteStep(1);
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("property-address")?.focus(), 450);
  };

  const quoteTitle = reviewSeoPage
    ? `Create your ${reviewSeoPage.eyebrow} brief`
    : "Create your Outer Banks homeowners insurance brief";
  const quoteIntro = reviewSeoPage
    ? `You came from our ${reviewSeoPage.eyebrow} guide. Send the property details below and we will preserve that context for local Outer Banks, NC licensed agent review.`
    : "Send the essentials first. We will prepare a no-spam coverage brief for review by a local Outer Banks, NC licensed agent.";

  if (activeSeoPage) {
    return (
      <SeoLandingPage
        page={activeSeoPage}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />
    );
  }

  return (
    <div id="top" className="site-shell">
      <header className="site-header">
        <Logo />

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/outer-banks-insurance/">OBX insurance</a>
          <a href="/outer-banks-homeowners-insurance/">Homeowners</a>
          <a href="/#wind-flood">Wind & flood</a>
          <a href="/tide-obx-insurance-guide/">Ask Tide</a>
          <a href="#service-area">OBX towns</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        </nav>

        <a className="header-cta" href="#quote">
          Get my OBX brief
        </a>

        <button
          className="icon-button mobile-menu-button"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((value) => !value)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileNavOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="/outer-banks-insurance/" onClick={() => setMobileNavOpen(false)}>
            OBX insurance
          </a>
          <a href="/outer-banks-homeowners-insurance/" onClick={() => setMobileNavOpen(false)}>
            Homeowners
          </a>
          <a href="/#wind-flood" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="/tide-obx-insurance-guide/" onClick={() => setMobileNavOpen(false)}>
            Ask Tide
          </a>
          <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>
            How it works
          </a>
          <a href="#service-area" onClick={() => setMobileNavOpen(false)}>
            OBX towns
          </a>
          <a href="/outer-banks-insurance-atlas/" onClick={() => setMobileNavOpen(false)}>
            Insurance atlas
          </a>
          <a className="mobile-nav-cta" href="#quote" onClick={() => setMobileNavOpen(false)}>
            Get my OBX brief
          </a>
        </nav>
      )}

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span>Outer Banks</span>
              <span>homeowners insurance</span>
              <span>for coastal homes</span>
            </h1>
            <p>
              Get clear, no-spam help for your Outer Banks home, second home, or
              vacation rental. We help you understand the property details that
              shape homeowners insurance, property insurance, wind, flood,
              rental use, roof age, renewals, and your quote review with our
              licensed North Carolina insurance team.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#quote">
                Create my free coverage brief
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href="#how-it-works">
                See what is included
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="broker-note">
              <ShieldCheck size={34} aria-hidden="true" />
              <div>
                <strong>No Spam Guarantee</strong>
                <span>Your property details stay with OBXNCInsurance.com and our licensed agent reviewing your request. We do not sell leads or share your information with a marketing list.</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="OBX property insurance brief preview">
            <img src={homeImage} alt="Outer Banks beach house elevated on pilings near dunes" />
            <form className="hero-quote-panel" onSubmit={continueToQuoteForm}>
              <div className="panel-step">
                <span>1.</span>
                <strong>Where is the property?</strong>
              </div>
              <label className="address-field" htmlFor="hero-property-address">
                <MapPin size={18} aria-hidden="true" />
                <input
                  id="hero-property-address"
                  value={quoteForm.address}
                  onChange={updateQuoteField("address")}
                  placeholder="OBX property address"
                  autoComplete="street-address"
                />
                {quoteForm.address && <Check className="address-check-icon" size={18} aria-hidden="true" />}
              </label>

              <div className="panel-step">
                <span>2.</span>
                <strong>Tell us about the home</strong>
              </div>
              <div className="coastal-check-list">
                <label className="coastal-check-row">
                  <span>Occupancy</span>
                  <select value={quoteForm.propertyUse} onChange={updateQuoteField("propertyUse")}>
                    <option>Primary home</option>
                    <option>Second home</option>
                    <option>Vacation rental</option>
                    <option>Investment property</option>
                  </select>
                </label>
                <label className="coastal-check-row">
                  <span>Rental use</span>
                  <select value={quoteForm.rentalUse} onChange={updateQuoteField("rentalUse")}>
                    <option>Not rented</option>
                    <option>Weekly / seasonal</option>
                    <option>Long term rental</option>
                    <option>Unsure</option>
                  </select>
                </label>
                <label className="coastal-check-row">
                  <span>Wind exposure</span>
                  <select value={quoteForm.windExposure} onChange={updateQuoteField("windExposure")}>
                    <option>OBX coast</option>
                    <option>Soundside</option>
                    <option>Oceanside</option>
                    <option>Unsure</option>
                  </select>
                </label>
                <label className="coastal-check-row">
                  <span>Flood zone</span>
                  <select value={quoteForm.floodZone} onChange={updateQuoteField("floodZone")}>
                    <option>Needs review</option>
                    <option>AE</option>
                    <option>VE</option>
                    <option>X</option>
                    <option>Unsure</option>
                  </select>
                </label>
                <div className="coastal-check-row">
                  <span>Licensed review</span>
                  <strong>Ready</strong>
                </div>
              </div>

              <div className="panel-step">
                <span>3.</span>
                <strong>Build the coverage brief</strong>
              </div>
              <div className="hero-rate-list">
                {coverageOptions.map((option) => (
                  <button
                    className={selectedOption === option.title ? "hero-rate-row selected" : "hero-rate-row"}
                    key={option.title}
                    type="button"
                    aria-pressed={selectedOption === option.title}
                    onClick={() => handleCoverageSelect(option.title)}
                  >
                    <div>
                      <strong>{option.title}</strong>
                      <span>{option.text}</span>
                    </div>
                    <span>{option.status}</span>
                  </button>
                ))}
              </div>
              <button className="view-options" type="submit">
                Create my coverage brief <ArrowRight size={15} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>

        <section className="trust-signal-strip" aria-label="OBXNCInsurance.com trust promises">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <article key={signal.title}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <strong>{signal.title}</strong>
                  <span>{signal.text}</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="expert-standard-section" aria-labelledby="expert-standard-title">
          <div className="expert-standard-copy">
            <span>What your free brief clarifies</span>
            <h2 id="expert-standard-title">
              Prepare the coastal insurance questions before you request a quote
            </h2>
            <p>
              Outer Banks homeowners insurance can involve wind, flood, rental
              use, roof age, elevation certificates, and closing or renewal
              timing. We turn those details into a cleaner request for a licensed
              review with OBXNCInsurance.com.
            </p>
          </div>
          <div className="expert-standard-grid">
            {expertStandardCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title}>
                  <Icon size={27} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
          <aside className="official-resource-panel" aria-label="Official insurance resources">
            <div>
              <BookOpenCheck size={28} aria-hidden="true" />
              <h3>Official resources homeowners can verify</h3>
              <p>
                These links support the educational guides. A licensed North Carolina
                agent still handles advice, quotes, binding, and policy service.
              </p>
            </div>
            <div className="official-resource-links">
              {officialSourceLinks.map((source) => (
                <a href={source.url} key={source.name} target="_blank" rel="noreferrer">
                  <span>
                    <strong>{source.name}</strong>
                    <small>{source.text}</small>
                  </span>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="rate-intelligence-section" aria-labelledby="rate-intelligence-title">
          <div className="rate-intelligence-layout">
            <div className="rate-intelligence-copy">
              <span>OBX insurance education hub</span>
              <h2 id="rate-intelligence-title">
                Outer Banks property insurance rates are moving. Your details matter.
              </h2>
              <p>
                Public North Carolina rate filings show why the first step should
                be education, not pressure. Base rates are only part of a premium,
                but the trend is clear: coastal property owners need clean facts
                before renewal, buying, adding rental use, or shopping multiple
                properties and lines. By the time you are ready for a quote, you
                should already know what matters and feel comfortable starting here.
              </p>
              <div className="motto-panel">
                <ShieldCheck size={30} aria-hidden="true" />
                <div>
                  <strong>Clear guidance before you request a quote</strong>
                  <span>
                    Understand your property, renewal timing, wind, flood,
                    rental use, and the details that help our licensed team
                    review your request.
                  </span>
                </div>
              </div>
            </div>

            <div className="rate-chart-card" aria-label="Outer Banks homeowners insurance base-rate change chart">
              <div className="rate-chart-header">
                <div>
                  <strong>NC homeowners base-rate changes</strong>
                  <span>OBX-related territories from NC DOI settlement data</span>
                </div>
                <small>Requested vs. approved</small>
              </div>

              <div className="rate-chart" role="img" aria-label="The Rate Bureau requested 45.1 percent for beach areas in Territory 110, with approved increases of 5.1 percent in 2025 and 4.8 percent in 2026. It requested 33.9 percent for Territory 130 coastal areas, with approved increases of 2.8 percent in both 2025 and 2026.">
                {obxRateChangeRows.map((row) => (
                  <article className="rate-chart-row" key={row.territory}>
                    <div className="rate-row-label">
                      <strong>{row.territory}</strong>
                      <span>{row.area}</span>
                    </div>
                    <div className="rate-bars">
                      <div className="rate-bar-line">
                        <span>NCRB request</span>
                        <div className="rate-bar-track">
                          <i
                            className="rate-bar requested"
                            style={{ "--rate-width": `${(row.requested / rateChartMax) * 100}%` }}
                          />
                          <strong>{row.requested}%</strong>
                        </div>
                      </div>
                      <div className="rate-bar-line">
                        <span>Approved 2025</span>
                        <div className="rate-bar-track">
                          <i
                            className="rate-bar approved"
                            style={{ "--rate-width": `${(row.approved2025 / rateChartMax) * 100}%` }}
                          />
                          <strong>{row.approved2025}%</strong>
                        </div>
                      </div>
                      <div className="rate-bar-line">
                        <span>Approved 2026</span>
                        <div className="rate-bar-track">
                          <i
                            className="rate-bar followup"
                            style={{ "--rate-width": `${(row.approved2026 / rateChartMax) * 100}%` }}
                          />
                          <strong>{row.approved2026}%</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <table className="rate-data-table">
                <caption>Outer Banks-related homeowners insurance base-rate data</caption>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>NCRB request</th>
                    <th>Approved 2025</th>
                    <th>Approved 2026</th>
                  </tr>
                </thead>
                <tbody>
                  {obxRateChangeRows.map((row) => (
                    <tr key={row.territory}>
                      <td>{row.territory}</td>
                      <td>{row.requested}%</td>
                      <td>{row.approved2025}%</td>
                      <td>{row.approved2026}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="rate-chart-note">
                These are homeowners base-rate changes, not quotes. A real premium
                can change because of coverage limits, wind and hail treatment,
                flood insurance, deductibles, roof age, rental use, carrier filings,
                underwriting, fees, and property-specific details.
              </p>
            </div>
          </div>

          <div className="rate-education-grid">
            {informationHubCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title}>
                  <Icon size={27} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>

          <aside className="dwelling-context-panel">
            <FileCheck2 size={29} aria-hidden="true" />
            <div>
              <strong>Rental and non-owner-occupied homes need extra context.</strong>
              <p>
                NC DOI also reported a dwelling-policy settlement after insurers
                requested a statewide average 68.3% increase over two years. The
                settlement approved 5% on October 1, 2026 and another 5% on
                October 1, 2027. Vacation rental and investment properties should
                be reviewed with the right form, occupancy, rental, and wind/flood
                assumptions.
              </p>
            </div>
          </aside>

          <div className="rate-source-links" aria-label="Rate change sources">
            {rateSourceLinks.map((source) => (
              <a href={source.url} key={source.name} target="_blank" rel="noreferrer">
                <span>
                  <strong>{source.name}</strong>
                  <small>{source.text}</small>
                </span>
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="atlas-section" aria-labelledby="atlas-title">
          <div className="atlas-copy">
            <span>OBX Insurance Atlas</span>
            <h2 id="atlas-title">Find the guide that matches your property</h2>
            <p>
              Outer Banks insurance questions change by setting, use, and timing.
              Start with the scenario closest to your home, then create a coverage
              brief when you are ready for licensed review.
            </p>
            <a className="primary-button" href="/outer-banks-insurance-atlas/">
              Open the full atlas
              <ArrowRight size={19} aria-hidden="true" />
            </a>
          </div>
          <div className="atlas-link-grid">
            {atlasFeatureLinks.map((item) => (
              <a href={item.href} key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="intelligence-section" aria-labelledby="intelligence-title">
          <div className="intelligence-copy">
            <span>Free Outer Banks insurance intelligence</span>
            <h2 id="intelligence-title">
              OBX home insurance is confusing. We make the first step clear and free.
            </h2>
            <p>
              Older local agencies can point to decades of history. OBXNCInsurance.com
              is built to be the free place homeowners use to
              understand the coastal details that actually shape a quote review.
            </p>
            <div className="quick-call-promise">
              <PhoneCall size={32} aria-hidden="true" />
              <div>
                <strong>Prepared for a quick, focused OBX quote review</strong>
                <span>
                  Your address, timing, wind, flood, roof, and rental details help
                  our licensed North Carolina insurance team get to the right
                  questions faster.
                </span>
              </div>
            </div>
          </div>

          <div className="coverage-map-panel" aria-label="Three layers of OBX insurance review">
            <div className="coverage-map-topline">
              <Layers3 size={24} aria-hidden="true" />
              <strong>The OBX 3-layer coverage map</strong>
            </div>
            <div className="coverage-layer-list">
              {coverageLayers.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <article key={layer.title}>
                    <span className="layer-number">{index + 1}</span>
                    <Icon size={26} aria-hidden="true" />
                    <div>
                      <h3>{layer.title}</h3>
                      <p>{layer.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="homeowner-toolkit-section" aria-labelledby="toolkit-title">
          <div className="toolkit-card">
            <div>
              <ListChecks size={31} aria-hidden="true" />
              <h2 id="toolkit-title">Free OBX insurance prep toolkit</h2>
              <p>
                Choose the situation that matches your property, then gather the
                details that help a licensed review start cleaner.
              </p>
            </div>
            <div className="toolkit-selector" role="tablist" aria-label="OBX insurance prep tools">
              {obxResourceTools.map((tool) => {
                const isSelected = selectedToolkit.title === tool.title;
                return (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={isSelected ? "selected" : ""}
                    key={tool.title}
                    onClick={() => setSelectedToolkitTitle(tool.title)}
                  >
                    {tool.title}
                  </button>
                );
              })}
            </div>
            <article className="toolkit-detail" aria-live="polite">
              {(() => {
                const Icon = toolkitIconBySlug[selectedToolkit.slug] || ListChecks;
                return <Icon size={28} aria-hidden="true" />;
              })()}
              <div>
                <h3>{selectedToolkit.title}</h3>
                <p>{selectedToolkit.summary}</p>
              </div>
            </article>
            <ul>
              {selectedToolkit.items.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="toolkit-actions">
              <a className="primary-button" href="#quote">
                Start my coverage brief
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href={`/${selectedToolkit.slug}/`}>
                Open this guide
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <a className="toolkit-library-link" href="/obx-insurance-toolkit/">
              View the full OBX insurance toolkit
              <ArrowRight size={19} aria-hidden="true" />
            </a>
          </div>

          <div className="trust-ledger">
            {trustFoundationCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title}>
                  <Icon size={30} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <a href={card.href}>
                    Review our trust standards
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section id="coverage" className="steps-section" aria-labelledby="steps-title">
            <h2 id="steps-title">Built for Outer Banks property insurance</h2>
          <div className="step-rail">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-item" key={step.label}>
                  <span className="step-number">{index + 1}</span>
                  <Icon size={36} aria-hidden="true" />
                  <div>
                    <h3>{step.label}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="wind-flood" className="workflow-section" aria-labelledby="workflow-title">
          <div className="workflow-copy">
            <h2 id="workflow-title">Your coastal home details, ready for our licensed review</h2>
            <p>
              Outer Banks insurance can involve homeowners coverage, wind and hail,
              flood, and rental-use questions. We help collect the right details
              before our local Outer Banks, NC licensed agent shops your options.
            </p>

            <div className="workflow-chain">
              {workflow.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="workflow-item" key={item.label}>
                    <span>
                      <Icon size={28} aria-hidden="true" />
                    </span>
                    <h3>{item.label}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>

            <div className="accountability-note">
              <ShieldCheck size={34} aria-hidden="true" />
              <div>
                <strong>A local Outer Banks, NC licensed agent reviews your options.</strong>
                <span>
                  They will work to find you the best possible quote options available
                  for your property and guide you through your policy needs.
                </span>
              </div>
            </div>
          </div>

          <CoverageConsole
            coverage={coverage}
            deductible={deductible}
            readiness={localReadiness}
            selectedOption={selectedOption}
            onCoverageChange={setCoverage}
            onDeductibleChange={setDeductible}
            onSelectOption={handleCoverageSelect}
            onContinue={focusQuoteForm}
          />
        </section>

        <section id="how-it-works" className="trust-section" aria-labelledby="trust-title">
          <div className="trust-intro">
            <h2 id="trust-title">One place to start your OBX insurance search</h2>
            <p>
              Whether your property is a primary home, second home, or weekly rental,
              we help organize the details our team and carriers need to find
              fitting options.
            </p>
          </div>

          <div className="proof-list">
            <article>
              <span>
                <Wind size={34} aria-hidden="true" />
              </span>
              <div>
                <h3>Homeowners + wind</h3>
                <p>
                  We help collect the coastal home details that matter for structure,
                  contents, liability, and wind review.
                </p>
              </div>
            </article>
            <article>
              <span>
                <Waves size={34} aria-hidden="true" />
              </span>
              <div>
                <h3>Flood guidance</h3>
                <p>
                  Flood zone, elevation, and lender questions are surfaced early so a
                  licensed agent can explain available paths.
                </p>
              </div>
            </article>
            <article>
              <span>
                <Umbrella size={34} aria-hidden="true" />
              </span>
              <div>
                <h3>Rental use clarity</h3>
                <p>
                  Weekly rentals and second homes are flagged clearly so carriers can
                  evaluate the property correctly.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="search-intent-section" aria-labelledby="search-intent-title">
          <div className="search-intent-copy">
            <h2 id="search-intent-title">Insurance help for the questions OBX owners actually ask</h2>
            <p>
              Outer Banks property insurance often involves homeowners coverage,
              wind and hail, flood, and rental-use questions. OBXNCInsurance.com
              helps organize those details for review by a local Outer Banks, NC licensed agent.
            </p>
          </div>
          <div className="need-grid">
            {insuranceNeeds.map((need) => {
              const Icon = need.icon;
              return (
                <article key={need.title}>
                  <span>
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <h3>{need.title}</h3>
                  <p>{need.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="alert-center-section" aria-labelledby="alert-center-title">
          <div className="alert-center-copy">
            <span>OBX homeowner alert center</span>
            <h2 id="alert-center-title">Clear next steps for the moments that make insurance urgent</h2>
            <p>
              Outer Banks owners often need help when timing is tight. These quick
              paths help homeowners, buyers, and rental owners understand what a
              licensed review may need first.
            </p>
          </div>
          <div className="alert-card-grid">
            {alertCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title}>
                  <Icon size={27} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="expertise-section" aria-labelledby="expertise-title">
          <div className="expertise-copy">
            <span>Outer Banks, North Carolina insurance expertise</span>
            <h2 id="expertise-title">Built around the coverage questions OBX owners actually face</h2>
            <p>
              From Carova and Corolla down through Hatteras Island and Ocracoke,
              coastal insurance can change block by block. We help you prepare
              the details a local Outer Banks, NC licensed agent needs for homeowners,
              wind and hail, flood, vacation rental, second home, condo, landlord,
              and liability conversations.
            </p>
          </div>
          <div className="expertise-grid">
            {expertisePoints.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.title}>
                  <Icon size={28} aria-hidden="true" />
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="local-image-section" aria-labelledby="local-image-title">
          <div className="local-image-copy">
            <h2 id="local-image-title">Outer Banks insurance guidance from Corolla to Ocracoke</h2>
            <p>
              Every OBX home sits in a slightly different coastal setting. Dunes,
              soundside water, rental use, roof age, flood zone, and wind exposure
              can all matter. Start with your town or property address and we will
              help prepare the details for a local Outer Banks, NC licensed agent.
            </p>
          </div>
          <div className="local-image-grid">
            {homepageImages.map((image) => (
              <figure key={image.caption}>
                <img src={image.url} alt={image.alt} loading="lazy" />
                <figcaption>
                  <strong>{image.caption}</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="service-area" className="service-area-section" aria-labelledby="service-title">
          <div>
            <h2 id="service-title">Outer Banks insurance help by town</h2>
            <p>
              Start one OBX insurance check for homes across Dare County, Currituck
              County, Hyde County, and the barrier island communities buyers ask
              about every day.
            </p>
          </div>
          <ul aria-label="Outer Banks service areas">
            {serviceAreas.map((area) => (
              <li key={area.slug}>
                <a
                  href={`/${area.slug}/`}
                  aria-label={`${area.name} home insurance guide`}
                >
                  <MapPin size={16} aria-hidden="true" />
                  {area.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="seo-links-section" aria-labelledby="seo-links-title">
          <div>
            <h2 id="seo-links-title">Popular OBX insurance questions</h2>
            <p>
              Explore dedicated pages for the local property insurance questions
              Outer Banks owners ask before they talk with a licensed Outer Banks, NC agent.
            </p>
          </div>
          <div className="seo-link-grid">
            {seoPages.map((page) => (
              <a href={`/${page.slug}/`} key={page.slug}>
                <span>{page.eyebrow}</span>
                <strong>{page.h1}</strong>
                <em>Start this review</em>
              </a>
            ))}
          </div>
        </section>

        <section id="local-agents" className="faq-section" aria-label="Frequently asked questions">
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article className="faq-item" key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={23} aria-hidden="true" />
                  </button>
                  {isOpen && <p>{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </section>

        <section id="quote" className="quote-cta-section" aria-labelledby="quote-title">
          <h2 id="quote-title">{quoteTitle}</h2>
          <p className="quote-cta-intro">{quoteIntro}</p>
          {reviewSeoPage && (
            <div className="quote-intent-banner">
              <SearchCheck size={20} aria-hidden="true" />
              <span>
                Review topic saved:
                <strong> {reviewSeoPage.eyebrow}</strong>
              </span>
            </div>
          )}
          <form
            className="quote-form quote-review-form"
            onSubmit={quoteStep === 1 ? continueToOptionalDetails : startQuote}
          >
            <label className="honeypot-field" aria-hidden="true">
              Company website
              <input
                name="companyWebsite"
                tabIndex={-1}
                autoComplete="off"
                onChange={updateQuoteField("companyWebsite")}
              />
            </label>

            <div className="quote-progress" aria-label="Lead form progress">
              <span className={quoteStep === 1 ? "active" : "complete"}>1. Brief basics</span>
              <span className={quoteStep === 2 ? "active" : ""}>2. Optional OBX details</span>
            </div>

            {quoteStep === 1 ? (
              <div className="quote-step-panel">
                <div className="quote-step-copy">
                  <span>Step 1 of 2</span>
                  <h3>Create your free OBX coverage brief</h3>
                  <p>
                    Send the essentials first. We will preserve your property use,
                    timing, review topic, and contact preference so the review
                    starts with context.
                  </p>
                </div>
                <label className="sr-only" htmlFor="property-address">
                  Enter your Outer Banks property address
                </label>
                <div className="quote-input-wrap">
                  <MapPin size={23} aria-hidden="true" />
                  <input
                    id="property-address"
                    value={quoteForm.address}
                    onChange={updateQuoteField("address")}
                    placeholder="OBX property address"
                    autoComplete="street-address"
                    required
                  />
                </div>
                <div className="quote-field-grid compact">
                  <label>
                    Insurance timing
                    <select value={quoteForm.leadGoal} onChange={updateQuoteField("leadGoal")}>
                      <option>Buying / closing soon</option>
                      <option>Renewal review</option>
                      <option>Current policy review</option>
                      <option>New policy for owned property</option>
                      <option>Other / unsure</option>
                    </select>
                  </label>
                  <label>
                    Coverage needed by
                    <input
                      type="date"
                      value={quoteForm.coverageNeededBy}
                      onChange={updateQuoteField("coverageNeededBy")}
                    />
                  </label>
                  <label>
                    Preferred follow-up
                    <select value={quoteForm.preferredContact} onChange={updateQuoteField("preferredContact")}>
                      {contactPreferences.map((preference) => (
                        <option key={preference}>{preference}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Best time
                    <select value={quoteForm.callbackWindow} onChange={updateQuoteField("callbackWindow")}>
                      {callbackWindows.map((windowLabel) => (
                        <option key={windowLabel}>{windowLabel}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Full name
                    <input
                      id="lead-full-name"
                      value={quoteForm.fullName}
                      onChange={updateQuoteField("fullName")}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      id="lead-email"
                      type="email"
                      value={quoteForm.email}
                      onChange={updateQuoteField("email")}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      id="lead-phone"
                      type="tel"
                      value={quoteForm.phone}
                      onChange={updateQuoteField("phone")}
                      placeholder="(252) 555-0199"
                      autoComplete="tel"
                      required
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="quote-step-panel">
                <div className="quote-step-copy">
                  <span>Step 2 of 2</span>
                  <h3>Add OBX details if you have them</h3>
                  <p>
                    These are optional, but they can make the licensed review
                    faster for wind, flood, roof, rental, and renewal questions.
                  </p>
                </div>
                <div className="quote-field-grid">
                  <label>
                    Review type
                    <select value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)}>
                      {coverageOptions.map((option) => (
                        <option key={option.title}>{option.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Property use
                    <select value={quoteForm.propertyUse} onChange={updateQuoteField("propertyUse")}>
                      <option>Primary home</option>
                      <option>Second home</option>
                      <option>Vacation rental</option>
                      <option>Investment property</option>
                    </select>
                  </label>
                  <label>
                    Rental use
                    <select value={quoteForm.rentalUse} onChange={updateQuoteField("rentalUse")}>
                      <option>Not rented</option>
                      <option>Weekly / seasonal</option>
                      <option>Long term rental</option>
                      <option>Unsure</option>
                    </select>
                  </label>
                  <label>
                    Flood zone
                    <select value={quoteForm.floodZone} onChange={updateQuoteField("floodZone")}>
                      <option>Needs review</option>
                      <option>AE</option>
                      <option>VE</option>
                      <option>X</option>
                      <option>Unsure</option>
                    </select>
                  </label>
                  <label>
                    Current carrier
                    <input
                      value={quoteForm.currentCarrier}
                      onChange={updateQuoteField("currentCarrier")}
                      placeholder="Carrier or none"
                      autoComplete="organization"
                    />
                  </label>
                  <label>
                    Current policy expiration
                    <input
                      type="date"
                      value={quoteForm.policyExpiration}
                      onChange={updateQuoteField("policyExpiration")}
                    />
                  </label>
                  <label>
                    Elevation certificate
                    <select
                      value={quoteForm.elevationCertificate}
                      onChange={updateQuoteField("elevationCertificate")}
                    >
                      <option>Unsure</option>
                      <option>Yes, available</option>
                      <option>No</option>
                      <option>Requested / in progress</option>
                    </select>
                  </label>
                  <label>
                    Year built
                    <input
                      id="year-built"
                      value={quoteForm.yearBuilt}
                      onChange={updateQuoteField("yearBuilt")}
                      placeholder="2006"
                      inputMode="numeric"
                    />
                  </label>
                  <label>
                    Roof age
                    <input
                      value={quoteForm.roofAge}
                      onChange={updateQuoteField("roofAge")}
                      placeholder="About 8 years"
                    />
                  </label>
                  <label className="quote-notes">
                    Anything we should know?
                    <textarea
                      value={quoteForm.notes}
                      onChange={updateQuoteField("notes")}
                      placeholder="Closing date, current carrier, wind mitigation, elevation certificate, rental details, or preferred follow-up timing"
                      rows="4"
                    />
                  </label>
                </div>
              </div>
            )}
            {leadStatus.state === "error" && (
              <p className="form-error" role="alert">
                {leadStatus.message} You can also email{" "}
                <a href={`mailto:${leadRecipientEmail}`}>{leadRecipientEmail}</a>.
              </p>
            )}
            <div className="quote-form-actions">
              {quoteStep === 2 && (
                <button className="secondary-button" type="button" onClick={() => setQuoteStep(1)}>
                  Back
                </button>
              )}
              <button className="primary-button" type="submit" disabled={leadStatus.state === "submitting"}>
                {leadStatus.state === "submitting"
                  ? "Sending your OBX brief..."
                  : quoteStep === 1
                    ? "Continue to optional details"
                    : "Send my coverage brief"}
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
          </form>
          <p className={quoteStarted ? "secure-note success" : "secure-note"}>
            <Lock size={18} aria-hidden="true" />
            {quoteStarted
              ? `Your OBX coverage brief was submitted${quoteForm.address ? ` for ${quoteForm.address}` : ""}.`
              : "No Spam Guarantee: your information is used only for this OBX property insurance request."}
          </p>
          {quoteStarted && (
            <div className="quote-summary" aria-live="polite">
              {heroCheckRows.map((item) => (
                <span key={item.label}>
                  <strong>{item.label}:</strong> {item.value}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>

      <ObxGuideChat onStartCheck={focusQuoteForm} pageContext={reviewSeoPage} />
      <QuickCallBar href="#quote" />

      {confirmationLead && (
        <LeadConfirmationModal
          lead={confirmationLead}
          onClose={() => setConfirmationLead(null)}
          onStartAnother={() => {
            setConfirmationLead(null);
            focusQuoteForm();
          }}
        />
      )}

      <footer className="site-footer">
        <Logo />
        <nav aria-label="Footer navigation">
          <a href="#coverage">Home coverage</a>
          <a href="#wind-flood">Wind & flood</a>
          <a href="#service-area">OBX towns</a>
          <a href="/tide-obx-insurance-guide/">Ask Tide</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
          <a href="/obx-insurance-toolkit/">Toolkit</a>
          <a href="mailto:obxpropertyinsurance@proton.me">Contact</a>
          <a href="#quote">Privacy</a>
          <a href="#local-agents">Licensing</a>
        </nav>
        <p>
          OBXNCInsurance.com helps Outer Banks property owners prepare a coverage
          request for local Outer Banks, NC licensed agent review. Quotes, advice, binding, and
          service are provided by our local Outer Banks, NC licensed agent.
          No spam or unrelated marketing. Options vary by property and carrier.
        </p>
      </footer>
    </div>
  );
}

function QuickCallBar({ href }) {
  return (
    <aside className="quick-call-sticky" aria-label="Quick OBX expert review request">
      <a href={href} aria-label="Request a quick OBX expert review">
        <PhoneCall size={18} aria-hidden="true" />
        <span>
          <strong>Quick OBX review</strong>
          <small>Free coverage brief. No spam.</small>
        </span>
        <ArrowRight size={17} aria-hidden="true" />
      </a>
    </aside>
  );
}

function CoverageConsole({
  coverage,
  deductible,
  readiness,
  selectedOption,
  onCoverageChange,
  onDeductibleChange,
  onSelectOption,
  onContinue,
}) {
  return (
    <aside className="quote-console" aria-label="Interactive OBX coverage check">
      <div className="console-topline">
        <div>
          <strong>Your OBX coverage check</strong>
          <span>Adjust the basics before local Outer Banks, NC licensed agent review.</span>
        </div>
        <span className="secure-session">
          <Lock size={14} aria-hidden="true" />
          Secure review
        </span>
      </div>

      <div className="quote-controls">
        <label>
          <span>
            <SlidersHorizontal size={17} aria-hidden="true" />
            Dwelling coverage
          </span>
          <strong>${coverage.toLocaleString()}</strong>
          <input
            type="range"
            min="400000"
            max="1500000"
            step="50000"
            value={coverage}
            onChange={(event) => onCoverageChange(Number(event.target.value))}
          />
        </label>

        <label>
          <span>Wind deductible</span>
          <select
            value={deductible}
            onChange={(event) => onDeductibleChange(Number(event.target.value))}
          >
            <option value="1000">$1,000</option>
            <option value="2500">$2,500</option>
            <option value="5000">$5,000</option>
          </select>
        </label>
      </div>

      <div className="readiness-meter" aria-label={`Coverage readiness ${readiness}%`}>
        <div>
          <span>Coverage readiness</span>
          <strong>{readiness}%</strong>
        </div>
        <meter min="0" max="100" value={readiness} />
      </div>

      <div className="quote-list">
        {coverageOptions.map((option) => {
          const selected = selectedOption === option.title;
          return (
            <button
              type="button"
              className={selected ? "quote-option selected" : "quote-option"}
              key={option.title}
              onClick={() => onSelectOption(option.title)}
            >
              <span className="quote-copy">
                <strong>{option.title}</strong>
                <span>{option.text}</span>
                <em>{option.status}</em>
              </span>
              <CheckCircle2 size={22} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="console-footer">
        <span>Ready for a licensed OBX insurance review.</span>
        <button type="button" onClick={onContinue}>Save & continue</button>
      </div>
      <p>No policy is quoted or placed until our local Outer Banks, NC licensed agent reviews eligibility.</p>
    </aside>
  );
}

function LeadConfirmationModal({ lead, onClose, onStartAnother }) {
  return (
    <div className="confirmation-overlay" role="presentation">
      <section
        className="confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close confirmation">
          <X size={20} aria-hidden="true" />
        </button>
        <span className="confirmation-icon">
          <CheckCircle2 size={32} aria-hidden="true" />
        </span>
        <h2 id="confirmation-title">Your OBX coverage brief is on its way</h2>
        <p>
          Thanks{lead.name ? `, ${lead.name}` : ""}. We received the details
          {lead.address ? ` for ${lead.address}` : ""} and will prepare them for
          review by a local Outer Banks, NC licensed agent.
        </p>
        <div className="confirmation-next">
          <strong>What happens next</strong>
          <ul>
            <li>Your request is sent to OBXNCInsurance.com.</li>
            <li>A local Outer Banks, NC licensed agent can review the property details.</li>
            <li>No spam. Follow-up is only about your OBX insurance request, such as an elevation certificate, closing date, or current policy.</li>
          </ul>
        </div>
        <div className="confirmation-actions">
          <button className="primary-button" type="button" onClick={onClose}>
            Done
          </button>
          <button className="secondary-button" type="button" onClick={onStartAnother}>
            Add another property
          </button>
        </div>
      </section>
    </div>
  );
}

function ObxGuideChat({ onStartCheck, pageContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(tideInitialAnswers);
  const [askOpen, setAskOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [guideMessages, setGuideMessages] = useState([
    {
      role: "assistant",
      text:
        "Ask me anything about OBX insurance before you talk to anyone. I can save you time, explain what matters, and build a no-spam brief for a licensed Outer Banks agent.",
    },
  ]);
  const [guideStatus, setGuideStatus] = useState({ state: "idle", message: "" });
  const [submittedLead, setSubmittedLead] = useState(null);
  const messageListRef = useRef(null);
  const panelRef = useRef(null);

  const openTide = ({ automated = false } = {}) => {
    setIsOpen(true);
    setAskOpen(false);
    if (!automated) {
      setTideStorageValue(tideAutoOpenStorageKey, new Date().toISOString());
    }
  };

  const tuckTideAway = () => {
    setIsOpen(false);
    setAskOpen(false);
    setTideStorageValue(tideDismissedStorageKey, new Date().toISOString());
  };

  useEffect(() => {
    if (getTideStorageValue(tideAutoOpenStorageKey) || getTideStorageValue(tideDismissedStorageKey)) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (getTideStorageValue(tideAutoOpenStorageKey) || getTideStorageValue(tideDismissedStorageKey)) {
        return;
      }
      setTideStorageValue(tideAutoOpenStorageKey, new Date().toISOString());
      openTide({ automated: true });
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [guideMessages]);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [stepIndex, submittedLead]);

  const isFinalStep = stepIndex === tideSteps.length - 1;
  const getCurrentStepCompletion = () => {
    if (submittedLead || isFinalStep) return 1;
    if (stepIndex === 0) return answers.propertyUse ? 1 : 0;
    if (stepIndex === 1) {
      const completed = [
        answers.address.trim(),
        answers.rentalUse && answers.rentalUse !== "Unsure",
        answers.yearBuilt || answers.roofAge,
        answers.floodZone !== "Needs review" || answers.elevationCertificate !== "Unsure",
      ].filter(Boolean).length;
      return completed / 4;
    }
    if (stepIndex === 2) {
      const completed = [
        answers.leadGoal,
        answers.windExposure !== "Needs review",
        answers.currentCarrier || answers.policyExpiration || answers.coverageNeededBy,
        answers.notes,
      ].filter(Boolean).length;
      return completed / 4;
    }
    if (stepIndex === 3) {
      const completed = [
        answers.fullName.trim(),
        isValidEmail(answers.email),
        answers.phone.trim(),
        answers.preferredContact,
      ].filter(Boolean).length;
      return completed / 4;
    }
    return 0;
  };
  const progress = submittedLead
    ? 100
    : Math.min(
        100,
        Math.round(((stepIndex + getCurrentStepCompletion()) / (tideSteps.length - 1)) * 100),
      );
  const progressTrackWidth = `${progress * 0.8}%`;

  const updateAnswer = (field, value) => {
    setAnswers((current) => ({
      ...current,
      [field]: value,
    }));
    setGuideStatus({ state: "idle", message: "" });
  };

  const chooseOption = (field, value, updates = {}) => {
    setAnswers((current) => ({
      ...current,
      [field]: value,
      ...updates,
    }));
    setGuideStatus({ state: "idle", message: "" });
    if (stepIndex < tideSteps.length - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const getStepError = () => {
    if (stepIndex === 0 && !answers.propertyUse) return "Choose the property type so Tide can tailor the next questions.";
    if (stepIndex === 1 && !answers.address.trim()) return "Add the OBX property address, town, or community.";
    if (stepIndex === 2 && !answers.leadGoal) return "Choose what you want the review to solve first.";
    if (stepIndex === 3) {
      if (!answers.fullName.trim()) return "Add your name so the licensed agent knows who to follow up with.";
      if (!isValidEmail(answers.email)) return "Add a valid email address.";
      if (!answers.phone.trim()) return "Add a phone number for quick follow-up.";
    }
    if (stepIndex === 4) {
      if (!answers.fullName.trim()) return "Add your name so the licensed agent knows who to follow up with.";
      if (!isValidEmail(answers.email)) return "Add a valid email address.";
      if (!answers.phone.trim()) return "Add a phone number for quick follow-up.";
    }
    return "";
  };

  const goNext = () => {
    const error = getStepError();
    if (error) {
      setGuideStatus({ state: "error", message: error });
      return;
    }
    setGuideStatus({ state: "idle", message: "" });
    setStepIndex((current) => Math.min(tideSteps.length - 1, current + 1));
  };

  const goBack = () => {
    setGuideStatus({ state: "idle", message: "" });
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const submitGuideQuestion = (event) => {
    event.preventDefault();
    const trimmed = questionDraft.trim();
    if (!trimmed) return;
    const reply = getTideGuideReply(trimmed);
    setGuideMessages((current) => [
      ...current.slice(-3),
      { role: "user", text: trimmed },
      { role: "assistant", text: reply.text },
    ]);
    setQuestionDraft("");
  };

  const submitTideBrief = async () => {
    const error = getStepError();
    if (error) {
      setGuideStatus({ state: "error", message: error });
      return;
    }

    const leadPayload = buildTideLeadPayload({ answers, pageContext });
    setGuideStatus({ state: "submitting", message: "Sending your OBX quote brief to the review team..." });

    try {
      const result = await submitLeadPayload(leadPayload);
      window.localStorage.setItem("obxncinsurance:lastTideLead", JSON.stringify(leadPayload));
      setSubmittedLead({
        address: answers.address,
        name: answers.fullName,
        delivery: result.delivery || "email",
      });
      setGuideStatus({
        state: "success",
        message: "Tide sent your brief. A real licensed North Carolina insurance agent can review the details.",
      });
    } catch (error) {
      setGuideStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Tide could not send the brief. You can still use the full form below.",
      });
    }
  };

  const briefRows = [
    { label: "Property type", value: answers.propertyUse, icon: Home },
    { label: "Location", value: answers.address, icon: MapPin },
    { label: "Use", value: answers.rentalUse, icon: Umbrella },
    { label: "Construction", value: answers.yearBuilt, icon: ClipboardCheck },
    { label: "Roof age", value: answers.roofAge, icon: Home },
    {
      label: "Flood zone",
      value: answers.floodZone === "Needs review" ? "" : answers.floodZone,
      icon: Waves,
    },
    { label: "Coverage", value: answers.leadGoal, icon: ShieldCheck },
  ];

  const reviewRows = [
    { label: "Property", value: answers.propertyUse },
    { label: "Address", value: answers.address },
    { label: "Use", value: answers.rentalUse || "Needs review" },
    { label: "Goal", value: answers.leadGoal || "Coverage review" },
    { label: "Wind", value: answers.windExposure || "Needs review" },
    { label: "Flood", value: answers.floodZone || "Needs review" },
    { label: "Elevation certificate", value: answers.elevationCertificate || "Unsure" },
    { label: "Year built", value: answers.yearBuilt || "Not provided" },
    { label: "Roof age", value: answers.roofAge || "Not provided" },
    { label: "Name", value: answers.fullName || "Not provided" },
    { label: "Preferred contact", value: answers.preferredContact },
  ];

  const renderOptionCards = (options, field) => (
    <div className="tide-option-grid">
      {options.map((option) => (
        <button
          type="button"
          className={answers[field] === option.value ? "tide-option selected" : "tide-option"}
          key={option.value}
          onClick={() => chooseOption(field, option.value, option.updates)}
        >
          <span className="tide-option-icon" aria-hidden="true">
            {option.icon ? <option.icon size={24} /> : <CheckCircle2 size={24} />}
          </span>
          <span>
            <strong>{option.label}</strong>
            <small>{option.detail}</small>
          </span>
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      ))}
    </div>
  );

  const renderStep = () => {
    if (submittedLead) {
      return (
        <div className="tide-success-card" aria-live="polite">
          <CheckCircle2 size={34} aria-hidden="true" />
          <h3>Thanks{submittedLead.name ? `, ${submittedLead.name}` : ""}. Tide sent your OBX brief.</h3>
          <p>
            We received the details{submittedLead.address ? ` for ${submittedLead.address}` : ""}.
            A licensed Outer Banks insurance agent will be in touch about this request. No spam, no lead selling.
          </p>
          <button type="button" className="tide-secondary-action" onClick={tuckTideAway}>
            Done
          </button>
        </div>
      );
    }

    if (stepIndex === 0) {
      return (
        <>
          <div className="tide-agent-note">
            <span className="tide-agent-photo" aria-hidden="true">
              <img className="tide-agent-face" src="/tide-agent-headshot.png" alt="" />
            </span>
            <div>
              <p>
                <strong>Hey there. I am Tide, your OBX Insurance Advisor.</strong>
              </p>
              <p>
                I am here to save you time, help you avoid costly surprises, and protect you from spam.
                I ask the questions that matter and help build a quote brief without the spam circus.
              </p>
              <p>
                <strong>Ready? Let's get the mystery out of this.</strong>
              </p>
            </div>
          </div>
          <h3>What kind of OBX property are we helping with?</h3>
          {renderOptionCards(tidePropertyOptions, "propertyUse")}
        </>
      );
    }

    if (stepIndex === 1) {
      return (
        <>
          <h3>Tell us the property details Tide should organize.</h3>
          <p>The exact address is best. Town or community is okay if you are still shopping.</p>
          <label className="tide-field">
            OBX property address, town, or community
            <input
              value={answers.address}
              onChange={(event) => updateAnswer("address", event.target.value)}
              placeholder="123 Ocean Trail, Corolla or Nags Head"
              autoComplete="street-address"
            />
          </label>
          <div className="tide-chip-grid" role="group" aria-label="Rental use">
            {tideRentalOptions.map((option) => (
              <button
                type="button"
                className={answers.rentalUse === option ? "selected" : ""}
                key={option}
                onClick={() => updateAnswer("rentalUse", option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="tide-field-row">
            <label className="tide-field">
              Year built
              <input
                value={answers.yearBuilt}
                onChange={(event) => updateAnswer("yearBuilt", event.target.value)}
                placeholder="2006"
                inputMode="numeric"
              />
            </label>
            <label className="tide-field">
              Roof age
              <input
                value={answers.roofAge}
                onChange={(event) => updateAnswer("roofAge", event.target.value)}
                placeholder="About 8 years"
              />
            </label>
          </div>
          <div className="tide-field-row">
            <label className="tide-field">
              Flood details
              <select value={answers.floodZone} onChange={(event) => updateAnswer("floodZone", event.target.value)}>
                {tideFloodOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="tide-field">
              Elevation certificate
              <select
                value={answers.elevationCertificate}
                onChange={(event) => updateAnswer("elevationCertificate", event.target.value)}
              >
                <option>Unsure</option>
                <option>Yes, available</option>
                <option>No</option>
                <option>Requested / in progress</option>
              </select>
            </label>
          </div>
        </>
      );
    }

    if (stepIndex === 2) {
      return (
        <>
          <h3>What should the coverage review solve first?</h3>
          <p>This helps the licensed agent understand the clock, lender pressure, renewal need, or policy question.</p>
          {renderOptionCards(tideGoalOptions, "leadGoal")}
          <label className="tide-field">
            Wind exposure
            <select value={answers.windExposure} onChange={(event) => updateAnswer("windExposure", event.target.value)}>
              {tideWindOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <div className="tide-field-row">
            <label className="tide-field">
              Current carrier
              <input
                value={answers.currentCarrier}
                onChange={(event) => updateAnswer("currentCarrier", event.target.value)}
                placeholder="Carrier or none"
              />
            </label>
            <label className="tide-field">
              Policy expiration
              <input
                type="date"
                value={answers.policyExpiration}
                onChange={(event) => updateAnswer("policyExpiration", event.target.value)}
              />
            </label>
          </div>
          <label className="tide-field">
            Coverage needed by
            <input
              value={answers.coverageNeededBy}
              onChange={(event) => updateAnswer("coverageNeededBy", event.target.value)}
              placeholder="Closing date, renewal date, or flexible"
            />
          </label>
          <label className="tide-field">
            Notes for the agent
            <textarea
              value={answers.notes}
              onChange={(event) => updateAnswer("notes", event.target.value)}
              placeholder="Flood zone, elevation certificate, roof updates, lender deadline, rental manager, or anything unusual"
              rows="3"
            />
          </label>
        </>
      );
    }

    if (stepIndex === 3) {
      return (
        <>
          <h3>Where should the real agent follow up?</h3>
          <p>Tide sends this as a no-spam quote brief for licensed review.</p>
          <label className="honeypot-field" aria-hidden="true">
            Company website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={answers.companyWebsite}
              onChange={(event) => updateAnswer("companyWebsite", event.target.value)}
            />
          </label>
          <label className="tide-field">
            Full name
            <input
              value={answers.fullName}
              onChange={(event) => updateAnswer("fullName", event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <div className="tide-field-row">
            <label className="tide-field">
              Email
              <input
                type="email"
                value={answers.email}
                onChange={(event) => updateAnswer("email", event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="tide-field">
              Phone
              <input
                type="tel"
                value={answers.phone}
                onChange={(event) => updateAnswer("phone", event.target.value)}
                placeholder="(252) 555-0199"
                autoComplete="tel"
              />
            </label>
          </div>
          <div className="tide-field-row">
            <label className="tide-field">
              Preferred contact
              <select
                value={answers.preferredContact}
                onChange={(event) => updateAnswer("preferredContact", event.target.value)}
              >
                <option>Phone call</option>
                <option>Text first</option>
                <option>Email first</option>
              </select>
            </label>
            <label className="tide-field">
              Best time
              <select
                value={answers.callbackWindow}
                onChange={(event) => updateAnswer("callbackWindow", event.target.value)}
              >
                {tideContactWindows.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
        </>
      );
    }

    return (
      <>
        <h3>Review your quote brief.</h3>
        <p>These are the details Tide will send for licensed review. You can go back and edit anything before sending.</p>
        <div className="tide-review-list">
          {reviewRows.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={isOpen ? "obx-chat tide-guide open" : "obx-chat tide-guide"}>
      {isOpen && (
        <section
          className="tide-panel"
          data-step={submittedLead ? "submitted" : stepIndex}
          ref={panelRef}
          aria-label="Tide OBX insurance quote guide"
        >
          <div className="tide-header">
            <span className="tide-crest" aria-hidden="true">
              <Waves size={28} />
              <Home size={16} />
            </span>
            <div>
              <strong>{tideAgent.title}</strong>
              <small>
                <ShieldCheck size={17} aria-hidden="true" />
                {tideAgent.promise}
              </small>
            </div>
            <div className="tide-window-actions">
              <button type="button" onClick={tuckTideAway} aria-label="Minimize Tide and keep researching">
                <span aria-hidden="true">-</span>
              </button>
              <button type="button" onClick={tuckTideAway} aria-label="Close Tide and keep researching">
                <X size={25} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="tide-progress"
            style={{ "--tide-progress-width": progressTrackWidth }}
            aria-label={`Tide progress ${progress}%`}
          >
            <span className="tide-progress-fill" aria-hidden="true" />
            {tideSteps.map((label, index) => (
              <div
                className={
                  index < stepIndex ? "tide-progress-step complete" : index === stepIndex ? "tide-progress-step active" : "tide-progress-step"
                }
                key={label}
              >
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>

          <p className="tide-research-note">
            <Waves size={18} aria-hidden="true" />
            <span>
              Just researching? Use the top-right controls to tuck Tide away and keep reading.
              Tide will wait in the corner when you want help.
            </span>
          </p>

          <div className="tide-body">
            <div className="tide-main">{renderStep()}</div>
            <aside className="tide-summary" aria-label="Tide quote brief summary">
              <div className="tide-summary-title">
                <ClipboardCheck size={30} aria-hidden="true" />
                <span>
                  <strong>Your quote brief</strong>
                  <small>We will capture what matters.</small>
                </span>
              </div>
              <div className="tide-summary-list">
                {briefRows.map((item) => (
                  <div key={item.label}>
                    <item.icon size={25} aria-hidden="true" />
                    <span>{item.label}</span>
                    <strong>{item.value || "Not set"}</strong>
                  </div>
                ))}
              </div>
              <div className="tide-promise-card">
                <ShieldCheck size={30} aria-hidden="true" />
                <span>
                  <strong>Our promise</strong>
                  <small>Your information is private, never sold, and never sent into a phone-call swarm.</small>
                </span>
              </div>
            </aside>
          </div>

          {guideStatus.message && (
            <p
              className={
                guideStatus.state === "error"
                  ? "tide-status error"
                  : guideStatus.state === "success"
                    ? "tide-status success"
                    : "tide-status"
              }
              role={guideStatus.state === "error" ? "alert" : "status"}
            >
              {guideStatus.message}
            </p>
          )}

          {!submittedLead && (
            <div className="tide-actions">
              <p>
                <ShieldCheck size={20} aria-hidden="true" />
                No spam. No lead selling. No pressure parade. Just local guidance.
              </p>
              <button type="button" className="tide-secondary-action" onClick={goBack} disabled={stepIndex === 0}>
                Back
              </button>
              {!isFinalStep ? (
                <button type="button" className="tide-primary-action" onClick={goNext}>
                  <Lock size={23} aria-hidden="true" />
                  <span>
                    {stepIndex === 0 ? "Build my quote brief" : "Continue"}
                    <small>{stepIndex === 0 ? "Takes about 60 seconds" : `Next: ${tideSteps[stepIndex + 1]}`}</small>
                  </span>
                  <ArrowRight size={34} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="tide-primary-action"
                  onClick={submitTideBrief}
                  disabled={guideStatus.state === "submitting"}
                >
                  <Lock size={23} aria-hidden="true" />
                  <span>
                    {guideStatus.state === "submitting" ? "Sending brief..." : "Send my quote brief"}
                    <small>For licensed review</small>
                  </span>
                  <ArrowRight size={34} aria-hidden="true" />
                </button>
              )}
              <button type="button" className="tide-ask-toggle" onClick={() => setAskOpen((value) => !value)}>
                <Waves size={18} aria-hidden="true" />
                {askOpen ? "Hide Tide questions" : "Ask Tide a question"}
              </button>
              <button
                type="button"
                className="tide-full-form-link"
                onClick={() => {
                  onStartCheck?.();
                  tuckTideAway();
                }}
              >
                Use the full form instead
              </button>
              <small>Ask Tide anything. When your brief is ready, a licensed Outer Banks insurance agent will be in touch.</small>
            </div>
          )}

          {askOpen && (
            <div className="tide-ask">
            <div className="tide-message-list" ref={messageListRef} aria-live="polite">
              {guideMessages.map((message, index) => (
                <p className={`tide-message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.text}
                </p>
              ))}
            </div>
            <div className="tide-quick-questions" aria-label="Ask Tide quick questions">
              {tideQuickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => {
                    const reply = getTideGuideReply(question);
                    setGuideMessages((current) => [
                      ...current.slice(-3),
                      { role: "user", text: question },
                      { role: "assistant", text: reply.text },
                    ]);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
            <form className="tide-question-form" onSubmit={submitGuideQuestion}>
              <label className="sr-only" htmlFor="tide-question-input">
                Ask Tide an OBX insurance question
              </label>
              <input
                id="tide-question-input"
                value={questionDraft}
                onChange={(event) => setQuestionDraft(event.target.value)}
                placeholder="Ask Tide about wind, flood, rentals..."
              />
              <button type="submit" aria-label="Ask Tide">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            </div>
          )}
        </section>
      )}

      <button
        className="chat-launcher tide-launcher"
        type="button"
        onClick={() => {
          if (!isOpen) {
            openTide();
            return;
          }
          setAskOpen((value) => !value);
        }}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Ask Tide a question" : "Open Tide OBX guide"}
      >
        <img className="tide-launcher-face" src="/tide-agent-headshot.png" alt="" />
        <span className="tide-launcher-copy" aria-hidden="true">
          <strong>Ask Tide</strong>
          <small>OBX advisor. No spam.</small>
        </span>
        <span className="tide-launcher-wave" aria-hidden="true">
          <Waves size={20} />
        </span>
      </button>
    </div>
  );
}

function SiteHeader({ mobileNavOpen, setMobileNavOpen, quoteHref = "/#quote" }) {
  return (
    <>
      <header className="site-header">
        <Logo />

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/outer-banks-insurance/">OBX insurance</a>
          <a href="/outer-banks-homeowners-insurance/">Homeowners</a>
          <a href="/#wind-flood">Wind & flood</a>
          <a href="/tide-obx-insurance-guide/">Ask Tide</a>
          <a href="/#service-area">OBX towns</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        </nav>

        <a className="header-cta" href={quoteHref}>
          Get my OBX brief
        </a>

        <button
          className="icon-button mobile-menu-button"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((value) => !value)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileNavOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="/outer-banks-insurance/" onClick={() => setMobileNavOpen(false)}>
            OBX insurance
          </a>
          <a href="/outer-banks-homeowners-insurance/" onClick={() => setMobileNavOpen(false)}>
            Homeowners
          </a>
          <a href="/#wind-flood" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="/tide-obx-insurance-guide/" onClick={() => setMobileNavOpen(false)}>
            Ask Tide
          </a>
          <a href="/#how-it-works" onClick={() => setMobileNavOpen(false)}>
            How it works
          </a>
          <a href="/#service-area" onClick={() => setMobileNavOpen(false)}>
            OBX towns
          </a>
          <a href="/outer-banks-insurance-atlas/" onClick={() => setMobileNavOpen(false)}>
            Insurance atlas
          </a>
          <a className="mobile-nav-cta" href={quoteHref} onClick={() => setMobileNavOpen(false)}>
            Get my OBX brief
          </a>
        </nav>
      )}
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <nav aria-label="Footer navigation">
        <a href="/outer-banks-insurance/">Outer Banks insurance</a>
        <a href="/outer-banks-homeowners-insurance/">Homeowners insurance</a>
        <a href="/#wind-flood">Wind & flood</a>
        <a href="/#service-area">OBX towns</a>
        <a href="/outer-banks-property-insurance/">Property insurance</a>
        <a href="/north-carolina-vacation-home-insurance/">Vacation homes</a>
        <a href="/outer-banks-flood-insurance/">Flood insurance</a>
        <a href="/tide-obx-insurance-guide/">Ask Tide</a>
        <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        <a href="/obx-insurance-toolkit/">Toolkit</a>
        <a href="mailto:obxpropertyinsurance@proton.me">Contact</a>
      </nav>
      <p>
        OBXNCInsurance.com helps Outer Banks property owners prepare a coverage
        request for local Outer Banks, NC licensed agent review. Quotes, advice, binding, and
        service are provided by our local Outer Banks, NC licensed agent.
        No spam or unrelated marketing. Options vary by property and carrier.
      </p>
    </footer>
  );
}

function SeoLandingPage({ page, mobileNavOpen, setMobileNavOpen }) {
  const quoteHref = getQuoteReviewHref(page);
  const relatedPages = page.relatedSlugs?.length
    ? page.relatedSlugs
        .map((slug) => getSeoPageBySlug(slug))
        .filter(Boolean)
        .filter((related) => related.slug !== page.slug)
    : seoPages.filter((related) => related.slug !== page.slug).slice(0, 6);
  const goToQuoteForm = () => {
    window.location.href = quoteHref;
  };

  return (
    <div id="top" className="site-shell">
      <SiteHeader
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        quoteHref={quoteHref}
      />
      <main className="seo-page">
        <section className="seo-hero" aria-labelledby="seo-title">
          <div>
            <span className="seo-eyebrow">{page.eyebrow}</span>
            <h1 id="seo-title">{page.h1}</h1>
            <p>{page.intro}</p>
            <p>{page.support}</p>
            <div className="hero-actions">
              <a className="primary-button" href={quoteHref}>
                Start my OBX check
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href="/outer-banks-insurance-atlas/">
                View insurance atlas
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="seo-side">
            <figure className="seo-local-image">
              <img src={page.image.url} alt={page.image.alt} loading="eager" />
              <figcaption>
                <strong>{page.image.caption}</strong>
              </figcaption>
            </figure>
            <aside className="seo-summary-card" aria-label="Page summary">
              <strong>{page.intent}</strong>
              <ul>
                {page.checklist.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="seo-content-grid" aria-label={`${page.eyebrow} guide`}>
          {page.sections.map((section) => (
            <article key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        {page.dataTable && (
          <section className="seo-data-section" aria-labelledby="seo-data-title">
            <div className="seo-data-copy">
              <span className="seo-eyebrow">{page.dataTable.eyebrow}</span>
              <h2 id="seo-data-title">{page.dataTable.title}</h2>
              <p>{page.dataTable.intro}</p>
            </div>
            <div className="seo-data-table-wrap">
              <table>
                <thead>
                  <tr>
                    {page.dataTable.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.dataTable.rows.map((row) => (
                    <tr key={row.territory || JSON.stringify(row)}>
                      {page.dataTable.columns.map((column) => (
                        <td key={column.key}>{row[column.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {page.dataTable.note && <p className="seo-data-note">{page.dataTable.note}</p>}
          </section>
        )}

        {page.localInsights.length > 0 && (
          <section className="seo-local-details-section" aria-labelledby="seo-local-details-title">
            <div>
              <span className="seo-eyebrow">OBX agent notes</span>
              <h2 id="seo-local-details-title">What matters for {page.eyebrow}</h2>
              <p>
                A local Outer Banks review starts with the practical details that
                can change follow-up, timing, and available paths for this property.
              </p>
              <a className="primary-button" href={quoteHref}>
                Start this review
                <ArrowRight size={19} aria-hidden="true" />
              </a>
            </div>
            <div className="seo-local-detail-list">
              {page.localInsights.map((insight) => (
                <article key={insight}>
                  <CheckCircle2 size={22} aria-hidden="true" />
                  <p>{insight}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="seo-topic-section" aria-labelledby="seo-topic-title">
          <h2 id="seo-topic-title">Insurance help for this area</h2>
          <p>
            {page.topicHelpText ||
              `Use this guide when you are trying to understand ${page.eyebrow}. Start with the property facts that can shape the review: address, occupancy, rental use, roof age, wind exposure, flood questions, current coverage, and timing.`}
          </p>
        </section>

        {page.sources?.length > 0 && (
          <section className="seo-source-section" aria-labelledby="seo-source-title">
            <div>
              <span className="seo-eyebrow">Official-source context</span>
              <h2 id="seo-source-title">Resources to verify while you prepare</h2>
              <p>
                These official resources support the educational side of the guide.
                Your property-specific quotes, advice, binding, and servicing still
                come from a licensed North Carolina insurance agent.
              </p>
              {page.lastReviewed && (
                <p className="seo-reviewed-note">Last reviewed: {page.lastReviewed}</p>
              )}
            </div>
            <div className="official-resource-links">
              {page.sources.map((source) => (
                <a href={source.url} key={source.name} target="_blank" rel="noreferrer">
                  <span>
                    <strong>{source.name}</strong>
                    <small>{source.text}</small>
                  </span>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="seo-faq-section" aria-labelledby="seo-faq-title">
          <h2 id="seo-faq-title">Questions about {page.eyebrow}</h2>
          <div>
            {page.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="seo-related-section" aria-labelledby="related-title">
          <h2 id="related-title">Related OBX insurance pages</h2>
          <div className="seo-related-links">
            {relatedPages.slice(0, 6).map((related) => (
              <a href={`/${related.slug}/`} key={related.slug}>
                {related.eyebrow}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <ObxGuideChat onStartCheck={goToQuoteForm} pageContext={page} />
      <QuickCallBar href={quoteHref} />
    </div>
  );
}

export default App;
