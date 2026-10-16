import { useEffect } from 'react';
import { PrivacyLinks } from './PrivacyControls.jsx';
import BrandLogo from './BrandLogo.jsx';

export default function PolicyPage({ page }) {
  useEffect(() => {
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://www.obxncinsurance.com/${page.slug}/`);
  }, [page]);
  return <div className="policy-shell">
    <header><BrandLogo /><a href="/#quote">Request insurance help</a></header>
    <main id="main-content" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true"> / </span><span aria-current="page">{page.heading}</span></nav>
      <h1>{page.heading}</h1>
      <p>Updated October 16, 2026</p>
      {page.sections.map(section => <section key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map(text => <p key={text}>{text}</p>)}
      </section>)}
      <p><a href="mailto:obxpropertyinsurance@proton.me">Contact us about privacy or accessibility</a></p>
    </main>
    <footer><PrivacyLinks /></footer>
  </div>;
}
