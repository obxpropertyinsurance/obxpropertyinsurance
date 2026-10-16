import { CheckCircle2 } from "lucide-react";
import { buildLeadResponse } from "./leadResponse.mjs";
import "./leadReceipt.css";

export default function LeadReceipt({ lead, headingId, headingLevel = 2, compact = false }) {
  const response = buildLeadResponse(lead, {
    delivery: lead.delivery,
    storage: lead.storage,
    leadId: lead.leadId,
  });
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <div className={`lead-receipt${compact ? " lead-receipt--compact" : ""}`}>
      <span className="lead-receipt-icon" aria-hidden="true">
        <CheckCircle2 size={30} />
      </span>
      <Heading className="lead-receipt-title" id={headingId}>{response.heading}</Heading>
      <p className="lead-receipt-intro">
        <strong>{response.greeting}</strong> {response.requestSummary}
      </p>

      <dl className="lead-receipt-details">
        <div className="lead-receipt-detail">
          <dt>Your contact preference</dt>
          <dd>
            <strong>{response.channelLabel}</strong>
            <span>{response.contactMessage}</span>
            {response.windowMessage && <span>{response.windowMessage}</span>}
          </dd>
        </div>
        <div className="lead-receipt-detail">
          <dt>Your timing</dt>
          <dd>{response.timingMessage}</dd>
        </div>
      </dl>

      <p className="lead-receipt-reassurance">{response.reassurance}</p>
      <p className="lead-receipt-preparation">{response.preparation}</p>
      <p className="lead-receipt-boundary">This confirms receipt of your request. It does not confirm insurance coverage.</p>
      {response.reference && (
        <p className="lead-receipt-reference">
          Request reference: <span>{response.reference}</span>
        </p>
      )}
    </div>
  );
}
