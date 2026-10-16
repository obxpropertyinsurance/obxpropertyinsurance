import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import PolicyPage from './PolicyPage.jsx';
import { policyPages } from './policyContent.mjs';

// Static generation uses the production React components, so substantive text,
// links, forms and headings cannot drift from the interactive page.
export function render(pathname) {
  const policy = policyPages.find(page => pathname === `/${page.slug}/`);
  return renderToString(<><a className="skip-link" href="#main-content">Skip to main content</a>{policy ? <PolicyPage page={policy}/> : <App pathname={pathname}/>}</>);
}
