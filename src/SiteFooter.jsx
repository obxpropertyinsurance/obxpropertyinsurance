import BrandLogo from './BrandLogo.jsx';
import { PrivacyLinks } from './PrivacyControls.jsx';

export default function SiteFooter({ image = null }) {
  return (
    <footer className="obx-footer">
      <div className="guide-wrap">
        <div className="guide-footer-main">
          <div className="guide-footer-brand">
            <BrandLogo />
            <p>
              OBXNCInsurance.com helps Outer Banks property owners prepare a coverage
              request. Insurance advice, quotes, binding and policy service require a licensed North Carolina insurance professional.
              No spam or unrelated marketing. Options vary by property and carrier.
            </p>
          </div>
          <nav aria-label="Footer coverage">
            <h2>Explore coverage</h2>
            <a href="/outer-banks-insurance/">Outer Banks insurance</a>
            <a href="/outer-banks-homeowners-insurance/">Homeowners insurance</a>
            <a href="/#coverage">Home coverage</a>
            <a href="/outer-banks-wind-flood-insurance/">Wind &amp; flood</a>
            <a href="/outer-banks-flood-insurance/">Flood insurance</a>
          </nav>
          <nav aria-label="Footer properties">
            <h2>Your property</h2>
            <a href="/#service-area">OBX towns</a>
            <a href="/outer-banks-property-insurance/">Property insurance</a>
            <a href="/north-carolina-vacation-home-insurance/">Vacation homes</a>
          </nav>
          <nav aria-label="Footer help">
            <h2>A little guidance</h2>
            <a href="/tide-obx-insurance-guide/">Ask Piper</a>
            <a href="/outer-banks-insurance-atlas/">Insurance atlas</a>
            <a href="/obx-insurance-toolkit/">Toolkit</a>
            <a href="/obx-insurance-trust-and-source-standards/">About and licensing</a>
            <a href="mailto:obxpropertyinsurance@proton.me">Contact</a>
          </nav>
        </div>
        <div className="guide-footer-bottom">
          <span>OBXNC Insurance</span>
          <nav aria-label="Privacy and accessibility">
            <PrivacyLinks />
          </nav>
        </div>
        {image?.licenseUrl && (
          <p className="guide-photo-credit">
            {image.caption ? `${image.caption}. ` : ''}
            Photo: <a href={image.creditUrl}>{image.credit}</a>,{' '}
            <a href={image.licenseUrl}>{image.license || 'License'}</a>.
            {image.adaptation ? ` ${image.adaptation}` : ''}
          </p>
        )}
      </div>
    </footer>
  );
}
