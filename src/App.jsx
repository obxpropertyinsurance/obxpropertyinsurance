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
import { PrivacyLinks } from "./PrivacyControls.jsx";
import LeadReceipt from "./LeadReceipt.jsx";
import BrandLogo from "./BrandLogo.jsx";
import SiteFooter from "./SiteFooter.jsx";
import SeoLandingContent from "./SeoLandingContent.jsx";
import { getGuideImage } from "./guidePresentation.mjs";
import { trackEvent, trackStep, trackLead } from "./analytics.mjs";
import { leadRoutingRows, leadNotificationSubject, leadNotificationFooter } from "./leadNotification.mjs";
import { createSubmissionIdentity } from "./submissionIdentity.mjs";
import useAccessibleDialog from "./useAccessibleDialog.js";
import homeImage from "./assets/piper/coastal-house-1280.webp";
import homeImageSmall from "./assets/piper/coastal-house-640.webp";
import { HomeCoverage, HomeResources, GuideDirectory } from './HomeContent.jsx';
import { homeMetadata } from './homeContent.mjs';
import { phoneRequired } from './intakeValidation.mjs';
import { getAcquisitionContext } from './acquisition.mjs';
import piperIcon from "./assets/piper/piper-icon-192.webp";
import {
  getSeoPageByPath,
  getSeoPageBySlug,
  homepageImages,
  obxResourceTools,
  officialSourceLinks,
  seoPages,
} from "./seoPages.js";







const coverageOptions = [
  {
    title: "Homeowners + wind review",
    text: "For the structure, belongings, liability, and coastal wind exposure.",
    status: "Core check",
  },
  {
    title: "Flood guidance",
    text: "For NFIP or private flood options when available for the property.",
    status: "Coverage question",
  },
  {
    title: "Rental-use clarity",
    text: "For second homes, weekly rentals, and seasonal occupancy questions.",
    status: "OBX-specific",
  },
];















// Additional channels can be offered after their staffing is verified.
const contactPreferences = ["Email first"];

const callbackWindows = [
  "As soon as available",
  "Morning",
  "Afternoon",
  "Evening",
  "After I send documents",
];















const leadRecipientEmail = "obxpropertyinsurance@proton.me";
const quoteReviewHashPrefix = "#quote-";

const getQuoteReviewHref = (page) =>
  page ? `/${quoteReviewHashPrefix}${encodeURIComponent(page.slug)}` : "/#quote";

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

const getReviewPageFromUrl = () => {
  if (typeof window === "undefined") return null;
  const reviewSlug = new URLSearchParams(window.location.search).get("review");
  if (reviewSlug) return getSeoPageBySlug(reviewSlug);

  const hash = window.location.hash || "";
  if (!hash.startsWith(quoteReviewHashPrefix)) return null;

  try {
    return getSeoPageBySlug(decodeURIComponent(hash.slice(quoteReviewHashPrefix.length)));
  } catch {
    return null;
  }
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const tideAgent = {
  name: "Piper",
  title: "Piper, your OBX insurance guide",
  promise: "Automated guidance. Clear next steps. No spam.",
};

const tideAutoOpenStorageKey = "obxncinsurance:tide-auto-opened";
const tideDismissedStorageKey = "obxncinsurance:tide-dismissed";



const setTideStorageValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Piper still works if a browser blocks localStorage.
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
  preferredContact: "",
  callbackWindow: "",
  companyWebsite: "",
};

const tidePropertyOptions = [
  {
    value: "Primary home",
    label: "Primary home",
    detail: "This is my main residence",
    icon: Home,
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
    detail: "Piper can still organize the basics and explain what matters first.",
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

const getTideSourcePath = () => window.location.pathname;

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
  return {
    text: `From our educational guide: ${matches[0].text} Your policy and property details determine actual coverage.`,
    links: Array.from(new Map(matches.map(item => [item.url, { href: item.url, label: item.title }])).values()),
  };
};

const buildTideNotes = (answers, pageContext) => {
  const notes = [
    "Piper guided intake",
    pageContext?.eyebrow ? `Guide context: ${pageContext.eyebrow}` : "",
    answers.notes ? `Visitor notes: ${answers.notes}` : "",
  ].filter(Boolean);
  return notes.join(". ");
};

const buildTideLeadPayload = ({ answers, pageContext }) => ({
  ...answers,
  ...getAcquisitionContext(),
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
  if (/\b(spam|privacy|sell|selling|marketing)\b/.test(text)) return {
    text: 'We do not sell inquiries to lead marketplaces or add you to unrelated marketing. Our privacy policy explains how requests are stored and delivered. Piper is an automated guide, not a licensed agent.',
    links: [{ href: '/privacy-policy/', label: 'How your information is used' }],
  };
  if (/\b(licensed|license|human|operator)\b/.test(text)) return {
    text: 'OBXNCInsurance.com provides educational guides and collects insurance requests. Insurance advice, available quotes, recommendations and binding must come from a licensed North Carolina professional. Ask for their agency and license details before proceeding.',
    links: [{ href: '/obx-insurance-trust-and-source-standards/', label: 'Site role and licensing boundaries' }],
  };
  if (/am i covered|will (my|this) policy|guarantee|bind coverage|approve (my|the)/.test(text)) return {
    text: 'I cannot determine whether your policy covers a loss or whether a carrier will insure your property. A licensed agent needs the policy wording and property facts. You can include your question with an insurance request.',
    links: [{ href: '/#quote', label: 'Prepare an insurance request' }],
  };
  return getTideKnowledgeReply(text) || {
    text: 'I could not find a reliable answer in the site guides. Try a specific topic such as wind deductibles, flood, roof age or rental use, or contact us with your question. I cannot provide policy-specific advice.',
    links: [{ href: '/outer-banks-insurance-atlas/', label: 'Browse coverage and town guides' }, { href: 'mailto:obxpropertyinsurance@proton.me', label: 'Contact OBXNCInsurance.com' }],
  };
};

const buildLeadFormData = (leadPayload) => {
  const formData = new FormData();
  formData.set("_subject", leadNotificationSubject);
  formData.set("_template", "table");
  formData.set("_captcha", "false");
  formData.set("_replyto", leadPayload.email);
  for (const [label, value] of leadRoutingRows(leadPayload)) {
    if (value) formData.set(label.toLowerCase().replaceAll(" ", "_"), value);
  }
  formData.set("follow_up_instructions", leadNotificationFooter);
  formData.set("name", leadPayload.fullName);
  formData.set("email", leadPayload.email);
  formData.set("phone", leadPayload.phone);
  for (const field of ["acquisitionSource", "originalLandingPath", "requestPath"]) {
    if (leadPayload[field]) formData.set(field, leadPayload[field]);
  }
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

  if (response.ok && String(result.success) === "true" && !/activation/i.test(message)) {
    return {
      ok: true,
      delivery: "formsubmit",
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
  return <BrandLogo />;
}

function App({ pathname = typeof window === "undefined" ? "/" : window.location.pathname }) {
  const quoteSubmission = useRef(createSubmissionIdentity());
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
    propertyUse: "Unsure",
    rentalUse: "Unsure",
    windExposure: "Unsure",
    floodZone: "Needs review",
    fullName: "",
    email: "",
    phone: "",
    preferredContact: "",
    callbackWindow: "",
    leadGoal: "Other / unsure",
    coverageNeededBy: "",
    currentCarrier: "",
    policyExpiration: "",
    elevationCertificate: "Unsure",
    yearBuilt: "",
    roofAge: "",
    notes: "",
    companyWebsite: "",
  });
  const activeSeoPage = getSeoPageByPath(pathname);
  const [reviewSeoPage, setReviewSeoPage] = useState(null);
  useEffect(() => { setReviewSeoPage(getReviewPageFromUrl()); }, []);
  const selectedToolkit =
    obxResourceTools.find((tool) => tool.title === selectedToolkitTitle) || obxResourceTools[0];

  useEffect(() => {
    if (!activeSeoPage) {
      document.title = homeMetadata.title;
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          "content",
          homeMetadata.description,
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

    quoteSubmission.current.reset();
    setSelectedOption(getReviewOptionForPage(reviewSeoPage));
    setQuoteForm((current) => ({
      ...current,
      leadGoal: getLeadGoalForPage(reviewSeoPage),
    }));

    if (window.location.hash.startsWith(quoteReviewHashPrefix)) {
      window.setTimeout(() => {
        document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [reviewSeoPage]);

  const heroCheckRows = useMemo(
    () => [
      { label: "Occupancy", value: quoteForm.propertyUse },
      { label: "Rental use", value: quoteForm.rentalUse },
      { label: "Wind exposure", value: quoteForm.windExposure },
      { label: "Flood zone", value: quoteForm.floodZone },
      { label: "Timing", value: quoteForm.leadGoal },
      { label: "Request", value: "Received; coverage not bound" },
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
    if (!quoteForm.preferredContact) missing.push("contact preference");
    if (phoneRequired(quoteForm.preferredContact) && !quoteForm.phone.trim()) missing.push("phone number");
    return missing;
  };

  const focusFirstMissingStepOneField = () => {
    const missingFieldId = !quoteForm.address.trim()
      ? "property-address"
      : !quoteForm.fullName.trim()
        ? "lead-full-name"
        : !isValidEmail(quoteForm.email)
          ? "lead-email"
          : phoneRequired(quoteForm.preferredContact) && !quoteForm.phone.trim()
            ? "lead-phone"
            : "property-address";

    window.setTimeout(() => document.getElementById(missingFieldId)?.focus(), 80);
  };

  const updateQuoteField = (field) => (event) => {
    quoteSubmission.current.reset();
    trackStep("quote", quoteStep === 1 ? "contact" : "details", quoteStep);
    setQuoteForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setQuoteStarted(false);
  };

  const handleCoverageSelect = (title) => {
    quoteSubmission.current.reset();
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
      trackEvent("funnel_validation_error", { funnel: "quote", step_id: quoteStep === 1 ? "contact" : "details", reason: "invalid_input" });
      return;
    }

    const missing = getStepOneMissing();
    if (missing.length) {
      trackEvent("funnel_validation_error", { funnel: "quote", step_id: "contact", reason: "required_fields" });
      setLeadStatus({
        state: "error",
        message: `Please add ${missing.join(", ")} before continuing.`,
      });
      setQuoteStep(1);
      focusFirstMissingStepOneField();
      return;
    }

    setLeadStatus({ state: "idle", message: "" });
    trackEvent("funnel_step_complete", { funnel: "quote", step_id: "contact", step_index: 1 });
    trackStep("quote", "details", 2);
    setQuoteStep(2);
    window.setTimeout(() => document.getElementById("year-built")?.focus(), 120);
  };

  const startQuote = async (event) => {
    event.preventDefault();

    const missing = getStepOneMissing();
    if (missing.length) {
      trackEvent("funnel_validation_error", { funnel: "quote", step_id: "contact", reason: "required_fields" });
      setLeadStatus({
        state: "error",
        message: `Please add ${missing.join(", ")} before sending your request.`,
      });
      setQuoteStep(1);
      focusFirstMissingStepOneField();
      return;
    }

    if (!event.currentTarget.reportValidity()) {
      trackEvent("funnel_validation_error", { funnel: "quote", step_id: quoteStep === 1 ? "contact" : "details", reason: "invalid_input" });
      return;
    }

    const sourcePath = reviewSeoPage
      ? `/${reviewSeoPage.slug}/`
      : window.location.pathname;
    const leadPayload = {
      ...quoteForm,
      coverage: "",
      deductible: "",
      ...getAcquisitionContext(),
      selectedCoverage: selectedOption,
      sourcePath,
      searchIntent: reviewSeoPage?.eyebrow || selectedOption,
      landingPageTitle: reviewSeoPage?.title || document.title,
      submittedAt: new Date().toISOString(),
    };
    leadPayload.submissionId = quoteSubmission.current.get(leadPayload);

    trackEvent("lead_submit_attempt", { funnel: "quote" });
    setLeadStatus({ state: "submitting", message: "Sending your request..." });

    try {
      const result = await submitLeadPayload(leadPayload);

      // Submitted personal details stay out of persistent browser storage.
      trackLead("quote");
      setQuoteStarted(true);
      setLeadStatus({
        state: "success",
        message: "We received your request, including your contact preference and the details you shared.",
      });
      setConfirmationLead({
        ...leadPayload,
        leadId: result.leadId || "",
        storage: result.storage || "",
        delivery: result.delivery || "",
      });
    } catch (error) {
      trackEvent("lead_submit_error", { funnel: "quote", reason: "delivery_error" });
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
    trackStep("quote", "contact", 1);
    setQuoteStep(1);
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("property-address")?.focus(), 450);
  };

  const quoteTitle = reviewSeoPage ? `Request help with ${reviewSeoPage.eyebrow}` : "Request Outer Banks home insurance help";
  const quoteIntro = "Send your property details to OBXNCInsurance.com. This is a request for help, not an instant price or insurance coverage. Name, email, property address and contact preference are required; other details can be added later.";

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
          <a href="/outer-banks-wind-flood-insurance/">Wind & flood</a>
          <a href="/tide-obx-insurance-guide/">Ask Piper</a>
          <a href="#service-area">OBX towns</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        </nav>

        <a className="header-cta" href="#quote">
          Request insurance help
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
          <a href="/outer-banks-wind-flood-insurance/" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="/tide-obx-insurance-guide/" onClick={() => setMobileNavOpen(false)}>
            Ask Piper
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
            Request a quote
          </a>
        </nav>
      )}

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Outer Banks home insurance for homeowners and rentals
            </h1>
            <p>Buying, renewing, or renting out an Outer Banks home? Get help understanding homeowners insurance, wind and hail, flood, and rental coverage. Share your property details to prepare an insurance request.</p>

            <div className="hero-actions">
              <a className="primary-button" href="#quote">
                Prepare my insurance request
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href="#coverage">
                Explore coverage guides
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="broker-note">
              <ShieldCheck size={34} aria-hidden="true" />
              <div>
                <strong>No Spam Guarantee</strong>
                <span>We use your details to handle your insurance request. We do not sell inquiries to lead marketplaces or add you to unrelated marketing lists. See our privacy policy for processing details.</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" role="group" aria-label="OBX property insurance brief preview">
            <img src={homeImage} srcSet={`${homeImageSmall} 640w, ${homeImage} 1280w`} sizes="(max-width: 760px) 100vw, 50vw" width="1280" height="431" fetchPriority="high" alt="Outer Banks beach house elevated on pilings near dunes" />
            <form className="hero-quote-panel" onSubmit={continueToQuoteForm}>
              <div className="panel-step">
                <span>1.</span>
                <strong>Where is the property?</strong>
              </div>
              <label className="address-field" htmlFor="hero-property-address">
                <span className="sr-only">OBX property address</span>
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
                    <option>Unsure</option><option>Primary home</option>
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
                <div className="coastal-check-row"><span>Insurance request</span><strong>No coverage bound</strong></div>
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
                Request a quote <ArrowRight size={15} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>

        <HomeCoverage />

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
            onInvalid={() => trackEvent("funnel_validation_error", { funnel: "quote", step_id: quoteStep === 1 ? "contact" : "details", reason: "invalid_input" })}
            onSubmit={(event) => event.nativeEvent.submitter?.value === "details" ? continueToOptionalDetails(event) : startQuote(event)}
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

            <div className="quote-progress" role="group" aria-label="Lead form progress">
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
                    <select id="lead-contact-preference" value={quoteForm.preferredContact} onChange={updateQuoteField("preferredContact")} required><option value="">Choose contact preference</option>
                      {contactPreferences.map((preference) => (
                        <option key={preference}>{preference}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Best time
                    <select value={quoteForm.callbackWindow} onChange={updateQuoteField("callbackWindow")}><option value="">No timing preference</option>
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
                    Phone (optional for email follow-up)
                    <input
                      id="lead-phone"
                      type="tel"
                      value={quoteForm.phone}
                      onChange={updateQuoteField("phone")}
                      placeholder="(252) 555-0199"
                      autoComplete="tel"
                      required={phoneRequired(quoteForm.preferredContact)}
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
                    <select value={selectedOption} onChange={(event) => { quoteSubmission.current.reset(); setSelectedOption(event.target.value); }}>
                      {coverageOptions.map((option) => (
                        <option key={option.title}>{option.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Property use
                    <select value={quoteForm.propertyUse} onChange={updateQuoteField("propertyUse")}>
                      <option>Unsure</option><option>Primary home</option>
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
            <p className="form-privacy-note">By sending your request, you ask us to contact you about your insurance needs. <a href="/privacy-policy/">How we use your information</a>.</p>
            <div className="quote-form-actions">
              {quoteStep === 2 && (
                <button className="secondary-button" type="button" onClick={() => setQuoteStep(1)}>
                  Back
                </button>
              )}
              {quoteStep === 1 && <button className="secondary-button" type="submit" value="details">Add optional property details</button>}
              <button className="primary-button" type="submit" value="send" disabled={leadStatus.state === "submitting"}>
                {leadStatus.state === "submitting"
                  ? "Sending your request..."
                  : "Send my insurance request"}
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
        <HomeResources />
      </main>

      <ObxGuideChat onStartCheck={focusQuoteForm} pageContext={reviewSeoPage} />
      <QuickCallBar href="#quote" />

      {confirmationLead && (
        <LeadConfirmationModal
          lead={confirmationLead}
          onClose={() => setConfirmationLead(null)}
          onStartAnother={() => {
            quoteSubmission.current.reset();
            setConfirmationLead(null);
            focusQuoteForm();
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}

function QuickCallBar({ href }) {
  return (
    <aside className="quick-call-sticky" aria-label="Insurance quote request">
      <a href={href} aria-label="Request an insurance quote">
        <PhoneCall size={18} aria-hidden="true" />
        <span>
          <strong>Request a quote</strong>
          <small>Free coverage brief. No spam.</small>
        </span>
        <ArrowRight size={17} aria-hidden="true" />
      </a>
    </aside>
  );
}

function LeadConfirmationModal({ lead, onClose, onStartAnother }) {
  const dialogRef = useRef(null);
  useAccessibleDialog(dialogRef, true, onClose);
  return (
    <div className="confirmation-overlay" role="presentation">
      <section
        className="confirmation-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close confirmation">
          <X size={20} aria-hidden="true" />
        </button>
        <LeadReceipt lead={lead} headingId="confirmation-title" />
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

function ObxGuideChat({ onStartCheck, pageContext, openRequest = 0 }) {
  const guideSubmission = useRef(createSubmissionIdentity());
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(tideInitialAnswers);
  const [askOpen, setAskOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [guideMessages, setGuideMessages] = useState([
    {
      role: "assistant",
      text:
        "I’m Piper, an automated guide to the information on this site. I can point you to coverage guides and help organize a request. I do not provide licensed advice, quotes or coverage decisions.",
    },
  ]);
  const [guideStatus, setGuideStatus] = useState({ state: "idle", message: "" });
  const [submittedLead, setSubmittedLead] = useState(null);
  const messageListRef = useRef(null);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const [launcherOccluded, setLauncherOccluded] = useState(false);

  const openTide = ({ automated = false } = {}) => {
    trackEvent("cta_click", { cta_id: "guide_open", placement: "guide" });
    trackEvent("guide_interaction", { action: "open" });
    setIsOpen(true);
    setAskOpen(false);
    if (!automated) {
      setTideStorageValue(tideAutoOpenStorageKey, new Date().toISOString());
    }
  };

  const tuckTideAway = () => {
    trackEvent("guide_interaction", { action: "close" });
    setIsOpen(false);
    setAskOpen(false);
    setTideStorageValue(tideDismissedStorageKey, new Date().toISOString());
  };

  useEffect(() => {
    if (!openRequest) return;
    openTide();
    setAskOpen(true);
  }, [openRequest]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const visibleRegions = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleRegions.add(entry.target);
        else visibleRegions.delete(entry.target);
      }
      // Keep a keyboard-focused launcher available until focus moves away.
      setLauncherOccluded(visibleRegions.size > 0 && document.activeElement !== launcherRef.current);
    });
    document.querySelectorAll(".guide-hero, [data-piper-inline], .obx-footer").forEach(region => observer.observe(region));
    return () => observer.disconnect();
  }, [pageContext?.slug]);

  useAccessibleDialog(panelRef, isOpen, tuckTideAway);
  const guideStepIds = ["property", "details", "needs", "contact", "review"];
  useEffect(() => {
    if (isOpen && !submittedLead) trackStep("guide", guideStepIds[stepIndex], stepIndex + 1);
  }, [isOpen, stepIndex, submittedLead]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [guideMessages]);

  useEffect(() => {
    if (askOpen) panelRef.current?.querySelector("#tide-question-input")?.focus();
  }, [askOpen]);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (isOpen) {
      const heading = panelRef.current?.querySelector(".tide-main h3");
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
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
    guideSubmission.current.reset();
    setAnswers((current) => ({
      ...current,
      [field]: value,
    }));
    setGuideStatus({ state: "idle", message: "" });
  };

  const chooseOption = (field, value, updates = {}) => {
    guideSubmission.current.reset();
    setAnswers((current) => ({
      ...current,
      [field]: value,
      ...updates,
    }));
    setGuideStatus({ state: "idle", message: "" });
    if (stepIndex < tideSteps.length - 1) {
      trackEvent("funnel_step_complete", { funnel: "guide", step_id: guideStepIds[stepIndex], step_index: stepIndex + 1 });
      setStepIndex((current) => current + 1);
    }
  };

  const getStepError = () => {
    if (stepIndex === 0 && !answers.propertyUse) return "Choose the property type so Piper can tailor the next questions.";
    if (stepIndex === 1 && !answers.address.trim()) return "Add the OBX property address, town, or community.";
    if (stepIndex === 2 && !answers.leadGoal) return "Choose what you want the review to solve first.";
    if (stepIndex === 3) {
      if (!answers.fullName.trim()) return "Add your name so we know who sent the request.";
      if (!isValidEmail(answers.email)) return "Add a valid email address.";
      if (!answers.preferredContact) return "Choose a contact preference.";
      if (phoneRequired(answers.preferredContact) && !answers.phone.trim()) return "Add a phone number for your requested follow-up.";
    }
    if (stepIndex === 4) {
      if (!answers.fullName.trim()) return "Add your name so we know who sent the request.";
      if (!isValidEmail(answers.email)) return "Add a valid email address.";
      if (!answers.preferredContact) return "Choose a contact preference.";
      if (phoneRequired(answers.preferredContact) && !answers.phone.trim()) return "Add a phone number for your requested follow-up.";
    }
    return "";
  };

  useEffect(() => {
    if (guideStatus.state === "error") panelRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [guideStatus]);

  const goNext = () => {
    const error = getStepError();
    if (error) {
      trackEvent("funnel_validation_error", { funnel: "guide", step_id: guideStepIds[stepIndex], reason: "required_fields" });
      setGuideStatus({ state: "error", message: error });
      return;
    }
    setGuideStatus({ state: "idle", message: "" });
    trackEvent("funnel_step_complete", { funnel: "guide", step_id: guideStepIds[stepIndex], step_index: stepIndex + 1 });
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
      { role: "assistant", ...reply },
    ]);
    setQuestionDraft("");
  };

  const submitTideBrief = async () => {
    const error = getStepError();
    if (error) {
      trackEvent("funnel_validation_error", { funnel: "guide", step_id: guideStepIds[stepIndex], reason: "required_fields" });
      setGuideStatus({ state: "error", message: error });
      return;
    }

    trackEvent("lead_submit_attempt", { funnel: "guide" });
    const leadPayload = buildTideLeadPayload({ answers, pageContext });
    leadPayload.submissionId = guideSubmission.current.get(leadPayload);
    setGuideStatus({ state: "submitting", message: "Sending your OBX quote brief to the review team..." });

    try {
      const result = await submitLeadPayload(leadPayload);
      // Submitted personal details stay out of persistent browser storage.
      trackLead("guide");
      setSubmittedLead({
        ...leadPayload,
        leadId: result.leadId || "",
        storage: result.storage || "",
        delivery: result.delivery || "",
      });
      setGuideStatus({
        state: "success",
        message: "Piper received your request, including your contact preference and the details you shared.",
      });
    } catch (error) {
      trackEvent("lead_submit_error", { funnel: "guide", reason: "delivery_error" });
      setGuideStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Piper could not send the brief. You can still use the full form below.",
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
          <LeadReceipt lead={submittedLead} headingId="piper-receipt-title" headingLevel={3} compact />
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
            <figure className="tide-reviewer-portrait">
              <span className="tide-agent-photo">
                <img className="tide-agent-face" src="/allen-illustrative-portrait.png?v=matte-20261016" alt="AI-generated illustrative portrait, not a photograph of Allen" width="420" height="420" />
              </span>
            </figure>
            <div>
              <p>
                <strong>Hi, I'm Allen. Your local Outer Banks insurance guide!</strong>
              </p>
              <p>
                I live in this area, so helping you prepare for an informed insurance conversation is personal to me.
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
          <h3>Tell us the property details Piper should organize.</h3>
          <p>The exact address is best. Town or community is okay if you are still shopping.</p>
          <label className="tide-field">
            OBX property address, town, or community
            <input
              value={answers.address}
              onChange={(event) => updateAnswer("address", event.target.value)}
              placeholder="123 Ocean Trail, Corolla or Nags Head"
              autoComplete="street-address"
              aria-required="true"
              aria-invalid={(guideStatus.state === "error" && !answers.address.trim()) || undefined}
              aria-describedby={guideStatus.state === "error" && !answers.address.trim() ? "tide-step-status" : undefined}
            />
          </label>
          <div className="tide-chip-grid" role="group" aria-label="Rental use">
            {tideRentalOptions.map((option) => (
              <button
                type="button"
                aria-pressed={answers.rentalUse === option}
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
          <h3>How should we follow up about your request?</h3>
          <p>Name, email and contact preference are required. Phone is optional for email follow-up.</p>
          <p>Piper organizes your request. Only a licensed insurance professional can provide advice, quotes or coverage.</p>
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
              aria-required="true"
              aria-invalid={(guideStatus.state === "error" && !answers.fullName.trim()) || undefined}
              aria-describedby={guideStatus.state === "error" && !answers.fullName.trim() ? "tide-step-status" : undefined}
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
                aria-required="true"
                aria-invalid={(guideStatus.state === "error" && !isValidEmail(answers.email)) || undefined}
                aria-describedby={guideStatus.state === "error" && !isValidEmail(answers.email) ? "tide-step-status" : undefined}
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
                aria-required={phoneRequired(answers.preferredContact)}
                aria-invalid={(guideStatus.state === "error" && phoneRequired(answers.preferredContact) && !answers.phone.trim()) || undefined}
                aria-describedby={guideStatus.state === "error" && phoneRequired(answers.preferredContact) && !answers.phone.trim() ? "tide-step-status" : undefined}
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
                aria-required="true"
                aria-invalid={(guideStatus.state === "error" && !answers.preferredContact) || undefined}
                aria-describedby={guideStatus.state === "error" && !answers.preferredContact ? "tide-step-status" : undefined}
                value={answers.preferredContact}
                onChange={(event) => updateAnswer("preferredContact", event.target.value)}
              >
                <option value="">Choose contact preference</option>
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
        <p>These are the details Piper will send with your insurance request. You can go back and edit anything before sending.</p>
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
          role="dialog"
          aria-modal="true"
          aria-label="Piper OBX insurance quote guide"
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
              <button
                className="tide-header-question"
                type="button"
                aria-expanded={askOpen}
                aria-controls="tide-question-panel"
                onClick={() => setAskOpen((value) => !value)}
              >
                {askOpen ? "Hide questions" : "Ask Piper a question"}
              </button>
            </div>
            <div className="tide-window-actions">
              <button type="button" onClick={tuckTideAway} aria-label="Minimize Piper and keep researching">
                <span aria-hidden="true">-</span>
              </button>
              <button type="button" onClick={tuckTideAway} aria-label="Close Piper and keep researching">
                <X size={25} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="tide-progress" role="group"
            style={{ "--tide-progress-width": progressTrackWidth }}
            aria-label={`Piper progress ${progress}%`}
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
              Just researching? Use the top-right controls to tuck Piper away and keep reading.
              Piper will wait in the corner when you want help.
            </span>
          </p>

          <div className="tide-body">
            <div className="tide-main">{renderStep()}</div>
            <aside className="tide-summary" aria-label="Piper quote brief summary">
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
                  <small>Your request is not sold to a lead marketplace or used for unrelated marketing. Our privacy policy explains storage and delivery providers.</small>
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
              id="tide-step-status"
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
              <div className={stepIndex > 0 ? "tide-action-row has-back" : "tide-action-row"}>
                {stepIndex > 0 && (
                  <button type="button" className="tide-secondary-action" onClick={goBack}>
                    Back
                  </button>
                )}
              {!isFinalStep ? (
                <button type="button" className="tide-primary-action" onClick={goNext}>
                  <Lock size={23} aria-hidden="true" />
                  <span>
                    {stepIndex === 0 ? "Start my quote request" : "Continue"}
                    <small>{stepIndex === 0 ? "Go at your own pace" : `Next: ${tideSteps[stepIndex + 1]}`}</small>
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
                    {guideStatus.state === "submitting" ? "Sending your request..." : "Send my quote request"}
                    <small>For licensed review</small>
                  </span>
                  <ArrowRight size={34} aria-hidden="true" />
                </button>
              )}
              </div>
            </div>
          )}

          {askOpen && (
            <div className="tide-ask" id="tide-question-panel">
            <div className="tide-message-list" ref={messageListRef} aria-live="polite">
              {guideMessages.map((message, index) => (
                <div className={`tide-message ${message.role}`} key={`${message.role}-${index}`}>
                  <p>{message.text}</p>
                  {message.links?.map(link => <a className="tide-source-link" key={link.href} href={link.href}>{link.label}</a>)}
                </div>
              ))}
            </div>
            <div className="tide-quick-questions" role="group" aria-label="Ask Piper quick questions">
              {tideQuickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => {
                    const reply = getTideGuideReply(question);
                    setGuideMessages((current) => [
                      ...current.slice(-3),
                      { role: "user", text: question },
                      { role: "assistant", ...reply },
                    ]);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
            <form className="tide-question-form" onSubmit={submitGuideQuestion}>
              <label className="sr-only" htmlFor="tide-question-input">
                Ask Piper an OBX insurance question
              </label>
              <input
                id="tide-question-input"
                value={questionDraft}
                onChange={(event) => setQuestionDraft(event.target.value)}
                placeholder="Ask Piper about wind, flood, rentals..."
              />
              <button type="submit" aria-label="Ask Piper">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            </div>
          )}
        </section>
      )}

      <button
        className="chat-launcher tide-launcher"
        ref={launcherRef}
        hidden={!isOpen && launcherOccluded}
        type="button"
        onClick={() => {
          if (!isOpen) {
            openTide();
            return;
          }
          setAskOpen((value) => !value);
        }}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Ask Piper a question" : "Ask Piper — open OBX insurance guide"}
      >
        <img className="tide-launcher-face" src={piperIcon} alt="" />
        <span className="tide-launcher-copy" aria-hidden="true">
          <strong>Ask Piper</strong>
          <small>OBX advisor. No spam.</small>
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
          <a href="/outer-banks-wind-flood-insurance/">Wind & flood</a>
          <a href="/tide-obx-insurance-guide/">Ask Piper</a>
          <a href="/#service-area">OBX towns</a>
          <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
        </nav>

        <a className="header-cta" href={quoteHref}>
          Request a quote
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
          <a href="/outer-banks-wind-flood-insurance/" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="/tide-obx-insurance-guide/" onClick={() => setMobileNavOpen(false)}>
            Ask Piper
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
            Request a quote
          </a>
        </nav>
      )}
    </>
  );
}

function SeoLandingPage({ page, mobileNavOpen, setMobileNavOpen }) {
  const quoteHref = getQuoteReviewHref(page);
  const [piperOpenRequest, setPiperOpenRequest] = useState(0);
  const goToQuoteForm = () => {
    window.location.href = quoteHref;
  };

  return (
    <div id="top" className="site-shell">
      <SiteHeader mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} quoteHref={quoteHref} />
      <SeoLandingContent page={page} quoteHref={quoteHref} onAskPiper={() => setPiperOpenRequest(value => value + 1)} />
      <SiteFooter image={getGuideImage(page)} />
      <ObxGuideChat onStartCheck={goToQuoteForm} pageContext={page} openRequest={piperOpenRequest} />
      <QuickCallBar href={quoteHref} />
    </div>
  );
}

export default App;
