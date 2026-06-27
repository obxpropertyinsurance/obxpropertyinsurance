import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Home,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
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
import homeImage from "./assets/obx-coastal-home.png";
import { getSeoPageByPath, homepageImages, seoPages } from "./seoPages.js";

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
    text: "Your details are organized for a local licensed agency to shop carriers.",
  },
  {
    icon: ShieldCheck,
    label: "Choose with local help",
    text: "A licensed OBX insurance expert reviews your choices before you buy.",
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
    text: "A licensed partner shops and explains the actual insurance options.",
  },
];

const faqs = [
  {
    question: "Do I get real quotes?",
    answer:
      "Yes. OBXNCInsurance.com organizes your property details, then a licensed local agency partner reviews eligibility and shops carrier-backed options for you.",
  },
  {
    question: "Why do you ask about wind, flood, and rental use?",
    answer:
      "Outer Banks property insurance is different. Carriers often need to know coastal exposure, flood zone, roof details, elevation information, and whether the home is rented weekly or seasonally.",
  },
  {
    question: "Who helps me choose a policy?",
    answer:
      "Insurance advice, quotes, binding, and servicing are handled by licensed agency partners. The guided coverage check helps make the conversation faster and more complete.",
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

const initialChatMessages = [
  {
    role: "assistant",
    text:
      "Hi, I can help you prepare an Outer Banks property insurance request. Share the basics in the form, and a licensed local agency partner can review homeowners, wind, flood, and rental-use options.",
  },
];

const chatQuickActions = [
  "Start my property check",
  "What details do I need?",
  "Wind and flood questions",
  "Vacation rental help",
];

const getObxGuideReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("start") || text.includes("submit") || text.includes("form")) {
    return {
      text:
        "Absolutely. I will take you to the secure OBX property check. The most helpful details are the property address, how the home is used, rental use, roof age, flood zone, and your contact information.",
      shouldFocusForm: true,
    };
  }

  if (text.includes("detail") || text.includes("need") || text.includes("prepare")) {
    return {
      text:
        "A strong OBX insurance request usually includes the exact address, occupancy, weekly or seasonal rental use, year built, roof age, wind exposure, flood zone, elevation certificate status, current carrier, and closing or renewal timing.",
    };
  }

  if (text.includes("flood") || text.includes("wind") || text.includes("hail")) {
    return {
      text:
        "Outer Banks homes often need separate attention for wind and flood. Homeowners coverage may not include flood from rising water or storm surge. A licensed agency partner can review wind deductibles, named storm questions, flood zone details, and NFIP or private flood options when available.",
    };
  }

  if (text.includes("rental") || text.includes("vacation") || text.includes("airbnb")) {
    return {
      text:
        "Vacation rental use matters in the OBX. Weekly guests, furnished contents, liability, loss of rent, pools, elevators, property managers, and seasonal occupancy can all change what a licensed agency partner needs to review.",
    };
  }

  if (text.includes("broker") || text.includes("quote") || text.includes("carrier")) {
    return {
      text:
        "The website prepares your request for licensed agency review. A licensed Outer Banks insurance expert handles carrier availability, quotes, advice, binding, and policy servicing after your details are submitted.",
    };
  }

  if (text.includes("town") || text.includes("nags") || text.includes("corolla") || text.includes("duck") || text.includes("hatteras")) {
    return {
      text:
        "Location matters across the Outer Banks. Corolla, Duck, Southern Shores, Kitty Hawk, Kill Devil Hills, Nags Head, Manteo, Hatteras Island, and Ocracoke can all raise different questions around wind exposure, flood zone, rental use, and access.",
    };
  }

  return {
    text:
      "That is a good question for an OBX property review. The safest next step is to submit the property details so a licensed local agency partner can look at the address, home use, wind exposure, flood zone, and rental details together.",
  };
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
  const [openFaq, setOpenFaq] = useState(0);
  const [quoteStarted, setQuoteStarted] = useState(false);
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
    yearBuilt: "",
    roofAge: "",
    notes: "",
    companyWebsite: "",
  });
  const activeSeoPage = getSeoPageByPath(window.location.pathname);

  useEffect(() => {
    if (!activeSeoPage) {
      document.title = "OBXNCInsurance.com | Outer Banks, NC Property Insurance";
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          "content",
          "Compare Outer Banks, NC property insurance for homes, wind and hail, flood, second homes, vacation rentals, and licensed local agency review.",
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
      { label: "Local agency", value: "Ready" },
    ],
    [quoteForm.floodZone, quoteForm.propertyUse, quoteForm.rentalUse, quoteForm.windExposure],
  );

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

  const startQuote = async (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const leadPayload = {
      ...quoteForm,
      coverage,
      deductible,
      selectedCoverage: selectedOption,
      sourcePath: window.location.pathname,
      submittedAt: new Date().toISOString(),
    };

    setLeadStatus({ state: "submitting", message: "Sending your OBX property check..." });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadPayload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Your request could not be sent.");
      }

      window.localStorage.setItem("obxncinsurance:lastLead", JSON.stringify(leadPayload));
      setQuoteStarted(true);
      setLeadStatus({
        state: "success",
        message: "Your request has been submitted for local agency review.",
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
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("property-address")?.focus(), 450);
  };

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
          <a href="#coverage">Home coverage</a>
          <a href="#wind-flood">Wind & flood</a>
          <a href="#how-it-works">How it works</a>
          <a href="#service-area">OBX towns</a>
          <a href="#local-agents">Local agents</a>
        </nav>

        <a className="header-cta" href="#quote">
          Check my OBX property
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
          <a href="#coverage" onClick={() => setMobileNavOpen(false)}>
            Home coverage
          </a>
          <a href="#wind-flood" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>
            How it works
          </a>
          <a href="#service-area" onClick={() => setMobileNavOpen(false)}>
            OBX towns
          </a>
          <a href="#local-agents" onClick={() => setMobileNavOpen(false)}>
            Local agents
          </a>
          <a className="mobile-nav-cta" href="#quote" onClick={() => setMobileNavOpen(false)}>
            Check my OBX property
          </a>
        </nav>
      )}

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Find Outer Banks property insurance for your coastal home</h1>
            <p>
              Tell us about your Outer Banks property, and we'll prepare the details
              a licensed Outer Banks insurance expert needs to review homeowners,
              wind, flood, and rental coverage options.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#quote">
                Check my OBX property
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href="#how-it-works">
                See how it works
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

            <div className="broker-note">
              <ShieldCheck size={34} aria-hidden="true" />
              <div>
                <strong>Reviewed by licensed local agency partners</strong>
                <span>Built for OBX homes, second homes, and vacation rentals.</span>
              </div>
            </div>
            <p className="legal-line">
              Quotes, advice, and policy placement are provided by licensed agency partners.
            </p>
          </div>

          <div className="hero-visual" aria-label="OBX property insurance check preview">
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
                  <span>Local agency</span>
                  <strong>Ready</strong>
                </div>
              </div>

              <div className="panel-step">
                <span>3.</span>
                <strong>Prepare your coverage search</strong>
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
                Continue to secure form <ArrowRight size={15} aria-hidden="true" />
              </button>
            </form>
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
            <h2 id="workflow-title">Your coastal home details, ready for a local expert</h2>
            <p>
              Outer Banks insurance can involve homeowners coverage, wind and hail,
              flood, and rental-use questions. We help collect the right details
              before a licensed local agency shops your options.
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
                <strong>A licensed agency partner reviews your options.</strong>
                <span>
                  We make the first step smarter. Licensed professionals handle quotes,
                  advice, binding, and policy servicing.
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
              we help organize the details local agents and carriers need to find
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
            <h2 id="search-intent-title">Insurance help for the way OBX owners actually search</h2>
            <p>
              Outer Banks property insurance often involves homeowners coverage,
              wind and hail, flood, and rental-use questions. OBXNCInsurance.com
              helps organize those details for review by a licensed local agency partner.
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

        <section className="expertise-section" aria-labelledby="expertise-title">
          <div className="expertise-copy">
            <span>Outer Banks, North Carolina insurance expertise</span>
            <h2 id="expertise-title">Built around the coverage questions OBX owners actually face</h2>
            <p>
              From Carova and Corolla down through Hatteras Island and Ocracoke,
              coastal insurance can change block by block. We help you prepare
              the details a licensed local agency partner needs for homeowners,
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
              help prepare the details for a licensed local insurance expert.
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
              County, Hyde County, and the barrier island communities buyers search
              for every day.
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
            <h2 id="seo-links-title">Popular OBX insurance searches</h2>
            <p>
              Explore dedicated pages for the local property insurance questions
              Outer Banks owners search before they talk with a licensed agency.
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
          <h2 id="quote-title">Check your OBX property</h2>
          <p className="quote-cta-intro">
            Send your property details to OBXNCInsurance.com. We will prepare the
            request for review by a licensed Outer Banks insurance expert.
          </p>
          <form className="quote-form quote-review-form" onSubmit={startQuote}>
            <label className="honeypot-field" aria-hidden="true">
              Company website
              <input
                name="companyWebsite"
                tabIndex={-1}
                autoComplete="off"
                onChange={updateQuoteField("companyWebsite")}
              />
            </label>
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
            <div className="quote-field-grid">
              <label>
                Full name
                <input
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
                  type="tel"
                  value={quoteForm.phone}
                  onChange={updateQuoteField("phone")}
                  placeholder="(252) 555-0199"
                  autoComplete="tel"
                  required
                />
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
                Year built
                <input
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
                  placeholder="Closing date, current carrier, wind mitigation, elevation certificate, or rental details"
                  rows="4"
                />
              </label>
            </div>
            {leadStatus.state === "error" && (
              <p className="form-error" role="alert">
                {leadStatus.message} You can also email{" "}
                <a href={`mailto:${leadRecipientEmail}`}>{leadRecipientEmail}</a>.
              </p>
            )}
            <button className="primary-button" type="submit" disabled={leadStatus.state === "submitting"}>
              {leadStatus.state === "submitting" ? "Sending your OBX check..." : "Send my OBX check"}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
          <p className={quoteStarted ? "secure-note success" : "secure-note"}>
            <Lock size={18} aria-hidden="true" />
            {quoteStarted
              ? `Your OBX property check was submitted${quoteForm.address ? ` for ${quoteForm.address}` : ""}.`
              : "Your information is encrypted and shared only for insurance review."}
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

      <ObxGuideChat onStartCheck={focusQuoteForm} />

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
          <a href="mailto:obxpropertyinsurance@proton.me">Contact</a>
          <a href="#quote">Privacy</a>
          <a href="#local-agents">Licensing</a>
        </nav>
        <p>
          OBXNCInsurance.com helps Outer Banks property owners prepare a coverage
          request for licensed local agency review. Quotes, advice, binding, and
          service are provided by licensed agency partners. Options vary by
          property and carrier.
        </p>
      </footer>
    </div>
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
          <span>Adjust the basics before local agency review.</span>
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
      <p>No policy is quoted or placed until a licensed agency partner reviews eligibility.</p>
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
        <h2 id="confirmation-title">Your OBX property check is on its way</h2>
        <p>
          Thanks{lead.name ? `, ${lead.name}` : ""}. We received the details
          {lead.address ? ` for ${lead.address}` : ""} and will prepare them for
          review by a licensed Outer Banks insurance expert.
        </p>
        <div className="confirmation-next">
          <strong>What happens next</strong>
          <ul>
            <li>Your request is sent to the OBXNCInsurance.com lead inbox.</li>
            <li>A licensed agency partner can review the property details.</li>
            <li>They may follow up for items like an elevation certificate, closing date, or current policy.</li>
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

function ObxGuideChat({ onStartCheck }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialChatMessages);
  const messageListRef = useRef(null);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isOpen]);

  const addMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const reply = getObxGuideReply(trimmed);
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "assistant", text: reply.text },
    ]);
    setDraft("");

    if (reply.shouldFocusForm) {
      window.setTimeout(onStartCheck, 280);
    }
  };

  const submitChat = (event) => {
    event.preventDefault();
    addMessage(draft);
  };

  return (
    <div className={isOpen ? "obx-chat open" : "obx-chat"}>
      {isOpen && (
        <section className="chat-panel" aria-label="OBX insurance guide chat">
          <div className="chat-header">
            <span>
              <Bot size={20} aria-hidden="true" />
            </span>
            <div>
              <strong>OBX coverage guide</strong>
              <small>Helpful prep before licensed agency review</small>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="chat-messages" ref={messageListRef} aria-live="polite">
            {messages.map((message, index) => (
              <p className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </p>
            ))}
          </div>

          <div className="chat-quick-actions" aria-label="Suggested chat questions">
            {chatQuickActions.map((action) => (
              <button type="button" key={action} onClick={() => addMessage(action)}>
                {action}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={submitChat}>
            <label className="sr-only" htmlFor="obx-chat-input">
              Ask the OBX coverage guide
            </label>
            <input
              id="obx-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about wind, flood, rentals..."
            />
            <button type="submit" aria-label="Send chat message">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="chat-disclaimer">
            This guide helps organize your request. Quotes, advice, binding, and servicing come from licensed agency partners.
          </p>
        </section>
      )}

      <button
        className="chat-launcher"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close OBX coverage guide" : "Open OBX coverage guide"}
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
        <span>{isOpen ? "Close" : "Need help?"}</span>
      </button>
    </div>
  );
}

function SiteHeader({ mobileNavOpen, setMobileNavOpen }) {
  return (
    <>
      <header className="site-header">
        <Logo />

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="/#coverage">Home coverage</a>
          <a href="/#wind-flood">Wind & flood</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#service-area">OBX towns</a>
          <a href="/outer-banks-property-insurance/">Insurance guides</a>
        </nav>

        <a className="header-cta" href="/#quote">
          Check my OBX property
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
          <a href="/#coverage" onClick={() => setMobileNavOpen(false)}>
            Home coverage
          </a>
          <a href="/#wind-flood" onClick={() => setMobileNavOpen(false)}>
            Wind & flood
          </a>
          <a href="/#how-it-works" onClick={() => setMobileNavOpen(false)}>
            How it works
          </a>
          <a href="/#service-area" onClick={() => setMobileNavOpen(false)}>
            OBX towns
          </a>
          <a href="/outer-banks-property-insurance/" onClick={() => setMobileNavOpen(false)}>
            Insurance guides
          </a>
          <a className="mobile-nav-cta" href="/#quote" onClick={() => setMobileNavOpen(false)}>
            Check my OBX property
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
        <a href="/#coverage">Home coverage</a>
        <a href="/#wind-flood">Wind & flood</a>
        <a href="/#service-area">OBX towns</a>
        <a href="/outer-banks-property-insurance/">Property insurance</a>
        <a href="/outer-banks-flood-insurance/">Flood insurance</a>
        <a href="mailto:obxpropertyinsurance@proton.me">Contact</a>
      </nav>
      <p>
        OBXNCInsurance.com helps Outer Banks property owners prepare a coverage
        request for licensed local agency review. Quotes, advice, binding, and
        service are provided by licensed agency partners. Options vary by
        property and carrier.
      </p>
    </footer>
  );
}

function SeoLandingPage({ page, mobileNavOpen, setMobileNavOpen }) {
  const goToQuoteForm = () => {
    window.location.href = "/#quote";
  };

  return (
    <div id="top" className="site-shell">
      <SiteHeader mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
      <main className="seo-page">
        <section className="seo-hero" aria-labelledby="seo-title">
          <div>
            <span className="seo-eyebrow">{page.eyebrow}</span>
            <h1 id="seo-title">{page.h1}</h1>
            <p>{page.intro}</p>
            <p>{page.support}</p>
            <div className="hero-actions">
              <a className="primary-button" href="/#quote">
                Start my OBX check
                <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="text-button" href="/outer-banks-property-insurance/">
                View property insurance guide
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

        <section className="seo-topic-section" aria-labelledby="seo-topic-title">
          <h2 id="seo-topic-title">Insurance help for this area</h2>
          <p>
            People often look for {page.keywords.join(", ")}. This page helps
            Outer Banks, North Carolina property owners start with clear details
            before a licensed agency partner reviews available options.
          </p>
        </section>

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
            {seoPages
              .filter((related) => related.slug !== page.slug)
              .slice(0, 6)
              .map((related) => (
                <a href={`/${related.slug}/`} key={related.slug}>
                  {related.eyebrow}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <ObxGuideChat onStartCheck={goToQuoteForm} />
    </div>
  );
}

export default App;
