const DEFAULT_TO_EMAIL = "obxpropertyinsurance@proton.me";
const DEFAULT_FROM_EMAIL = "OBXNCInsurance.com <leads@obxncinsurance.com>";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });

const clean = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);

const escapeHtml = (value) =>
  clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizeLead = (payload) => ({
  address: clean(payload.address),
  fullName: clean(payload.fullName),
  email: clean(payload.email).toLowerCase(),
  phone: clean(payload.phone),
  propertyUse: clean(payload.propertyUse),
  rentalUse: clean(payload.rentalUse),
  windExposure: clean(payload.windExposure),
  floodZone: clean(payload.floodZone),
  yearBuilt: clean(payload.yearBuilt),
  roofAge: clean(payload.roofAge),
  notes: clean(payload.notes),
  coverage: clean(payload.coverage),
  deductible: clean(payload.deductible),
  selectedCoverage: clean(payload.selectedCoverage),
  sourcePath: clean(payload.sourcePath || "/"),
  submittedAt: clean(payload.submittedAt || new Date().toISOString()),
  companyWebsite: clean(payload.companyWebsite),
});

const validateLead = (lead) => {
  const missing = [];
  if (!lead.address) missing.push("property address");
  if (!lead.fullName) missing.push("full name");
  if (!lead.email || !isEmail(lead.email)) missing.push("valid email");
  if (!lead.phone) missing.push("phone number");
  return missing;
};

const leadRows = (lead, request) => [
  ["Name", lead.fullName],
  ["Email", lead.email],
  ["Phone", lead.phone],
  ["Property address", lead.address],
  ["Property use", lead.propertyUse],
  ["Rental use", lead.rentalUse],
  ["Wind exposure", lead.windExposure],
  ["Flood zone", lead.floodZone],
  ["Year built", lead.yearBuilt],
  ["Roof age", lead.roofAge],
  ["Selected review", lead.selectedCoverage],
  ["Dwelling coverage", lead.coverage ? `$${Number(lead.coverage).toLocaleString()}` : ""],
  ["Wind deductible", lead.deductible ? `$${Number(lead.deductible).toLocaleString()}` : ""],
  ["Notes", lead.notes],
  ["Submitted from", `https://www.obxncinsurance.com${lead.sourcePath}`],
  ["Submitted at", lead.submittedAt],
  ["Visitor IP", request.headers.get("cf-connecting-ip") || ""],
];

const formatTextEmail = (lead, request) => {
  const rows = leadRows(lead, request)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return `New OBXNCInsurance.com lead\n\n${rows}\n\nReply directly to this email to contact the visitor. Quotes, advice, binding, and servicing should be handled by a licensed agency partner.`;
};

const formatHtmlEmail = (lead, request) => {
  const rows = leadRows(lead, request)
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #dde8f1;color:#5c6980;">${escapeHtml(
          label,
        )}</th><td style="padding:10px 12px;border-bottom:1px solid #dde8f1;color:#07112b;">${escapeHtml(
          value,
        )}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;color:#07112b;line-height:1.5;">
    <h1 style="font-size:22px;margin:0 0 12px;">New OBXNCInsurance.com lead</h1>
    <p style="margin:0 0 18px;color:#5c6980;">A visitor submitted an Outer Banks property insurance check.</p>
    <table style="border-collapse:collapse;width:100%;max-width:720px;border:1px solid #dde8f1;">${rows}</table>
    <p style="margin-top:18px;color:#5c6980;font-size:13px;">Reply directly to this email to contact the visitor. Quotes, advice, binding, and servicing should be handled by a licensed agency partner.</p>
  </body>
</html>`;
};

const sendWithResend = async ({ env, lead, request, toEmail }) => {
  const fromEmail = env.LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const subject = `New OBX insurance lead: ${lead.address || lead.fullName}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: lead.email,
      subject,
      text: formatTextEmail(lead, request),
      html: formatHtmlEmail(lead, request),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend delivery failed: ${body.slice(0, 240)}`);
  }
};

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Please submit the form again." }, 400);
  }

  const lead = normalizeLead(payload);

  if (lead.companyWebsite) {
    return json({ ok: true, delivery: "filtered" });
  }

  const missing = validateLead(lead);
  if (missing.length) {
    return json(
      {
        ok: false,
        message: `Please add ${missing.join(", ")} before sending your request.`,
      },
      400,
    );
  }

  const toEmail = env.LEAD_TO_EMAIL || DEFAULT_TO_EMAIL;

  try {
    if (env.RESEND_API_KEY) {
      await sendWithResend({ env, lead, request, toEmail });
      return json({ ok: true, delivery: "resend" });
    }

    return json(
      {
        ok: false,
        fallback: "formsubmit-browser",
        formSubmitEmail: toEmail,
        message: "Email delivery needs browser fallback or a configured mail provider.",
      },
      424,
    );
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        message:
          "Your request could not be emailed right now. Please try again or contact us directly.",
      },
      502,
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
