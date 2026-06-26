import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Home,
  Lock,
  MapPin,
  Menu,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  Umbrella,
  UserCheck,
  Waves,
  Wind,
  X,
} from "lucide-react";
import homeImage from "./assets/obx-coastal-home.png";

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
      "Insurance advice, quotes, binding, and servicing are handled by licensed agency partners. The AI intake simply helps make the conversation faster and more complete.",
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

const heroChecks = [
  { label: "Occupancy", value: "Second home" },
  { label: "Rental use", value: "Weekly / seasonal" },
  { label: "Wind exposure", value: "OBX coast" },
  { label: "Flood zone", value: "Needs review" },
  { label: "Local agency", value: "Ready" },
];

const serviceAreas = [
  "Corolla",
  "Duck",
  "Southern Shores",
  "Kitty Hawk",
  "Kill Devil Hills",
  "Nags Head",
  "Manteo",
  "Wanchese",
  "Rodanthe",
  "Waves",
  "Salvo",
  "Avon",
  "Buxton",
  "Frisco",
  "Hatteras",
  "Ocracoke",
];

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="OBXNCInsurance.com home">
      <span className="logo-mark" aria-hidden="true">
        <Waves size={25} strokeWidth={2.3} />
      </span>
      <span>OBXNCInsurance</span>
      <strong>.com</strong>
    </a>
  );
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [coverage, setCoverage] = useState(750000);
  const [deductible, setDeductible] = useState(2500);
  const [selectedOption, setSelectedOption] = useState("Homeowners + wind review");
  const [openFaq, setOpenFaq] = useState(0);
  const [address, setAddress] = useState("");
  const [quoteStarted, setQuoteStarted] = useState(false);

  const localReadiness = useMemo(() => {
    const coverageScore = coverage >= 800000 ? 4 : coverage >= 600000 ? 3 : 2;
    const deductibleScore = deductible >= 2500 ? 2 : 1;
    return Math.min(94, 72 + coverageScore * 4 + deductibleScore * 3);
  }, [coverage, deductible]);

  const startQuote = (event) => {
    event.preventDefault();
    setQuoteStarted(true);
  };

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
              Answer a few coastal-specific questions and our AI organizes the
              details a local licensed agency needs to shop homeowners, wind,
              flood, and rental-use options.
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
              Insurance advice, quotes, and policy placement are provided by licensed agency partners.
            </p>
          </div>

          <div className="hero-visual" aria-label="OBX property insurance check preview">
            <img src={homeImage} alt="Outer Banks beach house elevated on pilings near dunes" />
            <div className="hero-quote-panel">
              <div className="panel-step">
                <span>1.</span>
                <strong>Where is the property?</strong>
              </div>
              <div className="address-field">
                <MapPin size={18} aria-hidden="true" />
                <span>2417 S Virginia Dare Trl, Nags Head, NC 27959</span>
                <Check size={18} aria-hidden="true" />
              </div>

              <div className="panel-step">
                <span>2.</span>
                <strong>Tell us about the home</strong>
              </div>
              <div className="coastal-check-list">
                {heroChecks.map((item) => (
                  <div className="coastal-check-row" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="assistant-note">
                <span aria-hidden="true">AI</span>
                <p>
                  <strong>OBX coverage assistant</strong>
                  Coastal details are organized for a local insurance review.
                </p>
              </div>

              <div className="panel-step">
                <span>3.</span>
                <strong>Prepare your coverage search</strong>
              </div>
              <div className="hero-rate-list">
                {coverageOptions.map((option) => (
                  <div className="hero-rate-row" key={option.title}>
                    <div>
                      <strong>{option.title}</strong>
                      <span>{option.text}</span>
                    </div>
                    <button type="button">{option.status}</button>
                  </div>
                ))}
              </div>
              <a className="view-options" href="#quote">
                Start your OBX check <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
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
            <h2 id="workflow-title">AI gets your coastal home ready for a local expert</h2>
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
                  We make the intake smarter. Licensed professionals handle quotes,
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
            onSelectOption={setSelectedOption}
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
              <li key={area}>
                <MapPin size={16} aria-hidden="true" />
                {area}
              </li>
            ))}
          </ul>
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
          <form className="quote-form" onSubmit={startQuote}>
            <label className="sr-only" htmlFor="property-address">
              Enter your Outer Banks property address
            </label>
            <div className="quote-input-wrap">
              <MapPin size={23} aria-hidden="true" />
              <input
                id="property-address"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setQuoteStarted(false);
                }}
                placeholder="Enter your Outer Banks property address"
                autoComplete="street-address"
              />
            </div>
            <button className="primary-button" type="submit">
              Start my OBX check
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
          <p className={quoteStarted ? "secure-note success" : "secure-note"}>
            <Lock size={18} aria-hidden="true" />
            {quoteStarted
              ? `Your OBX property check is ready${address ? ` for ${address}` : ""}.`
              : "Your information is encrypted and shared only for insurance review."}
          </p>
        </section>
      </main>

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
          OBXNCInsurance.com is an insurance shopping and intake website.
          Insurance advice, quotes, binding, and servicing are provided by licensed
          agency partners. Availability varies by carrier, location, underwriting,
          and state rules.
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
          Secure intake
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
        <button type="button">Save & continue</button>
      </div>
      <p>No policy is quoted or placed until a licensed agency partner reviews eligibility.</p>
    </aside>
  );
}

export default App;
