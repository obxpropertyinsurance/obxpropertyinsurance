import { useEffect } from 'react';
import { PrivacyLinks } from './PrivacyControls.jsx';

export default function PolicyPage({ page }) {
  useEffect(() => {
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://www.obxncinsurance.com/${page.slug}/`);
  }, [page]);
  return <div className="policy-shell">
    <header><a href="/">OBXNCInsurance.com</a><a href="/#quote">Request a quote</a></header>
    <main id="main-content" tabIndex={-1}>
      <h1>{page.heading}</h1>
      <p>Updated October 15, 2026</p>
      {page.sections.map(section => <section key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map(text => <p key={text}>{text}</p>)}
      </section>)}
      <p><a href="mailto:obxpropertyinsurance@proton.me">Contact us about privacy or accessibility</a></p>
    </main>
    <footer><PrivacyLinks /></footer>
  </div>;
}
