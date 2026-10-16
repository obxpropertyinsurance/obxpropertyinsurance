export default function BrandLogo({ href = '/' }) {
  return (
    <a className="logo" href={href} aria-label="OBXNC Insurance home">
      <span className="logo-mark" aria-hidden="true">
        <img src="/brand/piper-mark.png" alt="" width="64" height="64" />
      </span>
      <span className="logo-wordmark">
        <span>OBXNC</span>
        <strong>Insurance</strong>
      </span>
    </a>
  );
}
