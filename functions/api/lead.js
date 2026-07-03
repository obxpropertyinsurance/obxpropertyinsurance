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

const createLeadId = () =>
  globalThis.crypto?.randomUUID?.() || `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const normalizeLead = (payload) => ({
  address: clean(payload.address),
  fullName: clean(payload.fullName),
  email: clean(payload.email).toLowerCase(),
  phone: clean(payload.phone),
  preferredContact: clean(payload.preferredContact),
  callbackWindow: clean(payload.callbackWindow),
  searchIntent: clean(payload.searchIntent),
  landingPageTitle: clean(payload.landingPageTitle),
  leadGoal: clean(payload.leadGoal),
  coverageNeededBy: clean(payload.coverageNeededBy),
  currentCarrier: clean(payload.currentCarrier),
  policyExpiration: clean(payload.policyExpiration),
  elevationCertificate: clean(payload.elevationCertificate),
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

const leadRows = (lead, request, leadRecord = {}) => [
  ["Lead ID", leadRecord.leadId],
  ["Database", leadRecord.storage === "d1" ? "Saved in D1" : ""],
  ["Name", lead.fullName],
  ["Email", lead.email],
  ["Phone", lead.phone],
  ["Preferred contact", lead.preferredContact],
  ["Callback window", lead.callbackWindow],
  ["Property address", lead.address],
  ["Search intent", lead.searchIntent],
  ["Landing page title", lead.landingPageTitle],
  ["Insurance timing", lead.leadGoal],
  ["Coverage needed by", lead.coverageNeededBy],
  ["Current carrier", lead.currentCarrier],
  ["Current policy expiration", lead.policyExpiration],
  ["Elevation certificate", lead.elevationCertificate],
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

const formatTextEmail = (lead, request, leadRecord) => {
  const rows = leadRows(lead, request, leadRecord)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return `New OBXNCInsurance.com lead\n\n${rows}\n\nReply directly to this email to contact the visitor. Quotes, advice, binding, and servicing should be handled by a local Outer Banks, NC licensed agent. Do not add the visitor to spam or unrelated marketing.`;
};

const formatHtmlEmail = (lead, request, leadRecord) => {
  const rows = leadRows(lead, request, leadRecord)
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
    <p style="margin-top:18px;color:#5c6980;font-size:13px;">Reply directly to this email to contact the visitor. Quotes, advice, binding, and servicing should be handled by a local Outer Banks, NC licensed agent. Do not add the visitor to spam or unrelated marketing.</p>
  </body>
</html>`;
};

const saveLeadToDatabase = async ({ env, lead, request }) => {
  if (!env.LEADS_DB?.prepare) {
    return { storage: "not-configured", leadId: "" };
  }

  const leadId = createLeadId();
  const createdAt = new Date().toISOString();
  const ipAddress = request.headers.get("cf-connecting-ip") || "";
  const userAgent = request.headers.get("user-agent") || "";
  const payloadJson = JSON.stringify({
    ...lead,
    ipAddress,
    userAgent,
  });

  await env.LEADS_DB.prepare(
    `INSERT INTO leads (
      id,
      created_at,
      submitted_at,
      full_name,
      email,
      phone,
      property_address,
      preferred_contact,
      callback_window,
      search_intent,
      landing_page_title,
      lead_goal,
      coverage_needed_by,
      current_carrier,
      policy_expiration,
      elevation_certificate,
      property_use,
      rental_use,
      wind_exposure,
      flood_zone,
      year_built,
      roof_age,
      selected_coverage,
      source_path,
      ip_address,
      user_agent,
      payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      leadId,
      createdAt,
      lead.submittedAt || createdAt,
      lead.fullName,
      lead.email,
      lead.phone,
      lead.address,
      lead.preferredContact,
      lead.callbackWindow,
      lead.searchIntent,
      lead.landingPageTitle,
      lead.leadGoal,
      lead.coverageNeededBy,
      lead.currentCarrier,
      lead.policyExpiration,
      lead.elevationCertificate,
      lead.propertyUse,
      lead.rentalUse,
      lead.windExposure,
      lead.floodZone,
      lead.yearBuilt,
      lead.roofAge,
      lead.selectedCoverage,
      lead.sourcePath,
      ipAddress,
      userAgent,
      payloadJson,
    )
    .run();

  return { storage: "d1", leadId };
};

const markLeadEmailDelivery = async ({ env, leadId, delivery }) => {
  if (!leadId || !env.LEADS_DB?.prepare) return;
  await env.LEADS_DB.prepare("UPDATE leads SET email_delivery = ? WHERE id = ?").bind(delivery, leadId).run();
};

const sendWithResend = async ({ env, lead, request, toEmail, leadRecord }) => {
  const fromEmail = env.LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const subjectContext = lead.searchIntent || "OBX property review";
  const subject = `New OBX insurance lead: ${subjectContext}${
    lead.address ? ` - ${lead.address}` : ""
  }`;
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
      text: formatTextEmail(lead, request, leadRecord),
      html: formatHtmlEmail(lead, request, leadRecord),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend delivery failed: ${body.slice(0, 240)}`);
  }
};

const appendFormSubmitField = (formData, key, value) => {
  if (value) formData.set(key, value);
};

const sendWithFormSubmit = async ({ lead, request, toEmail, leadRecord }) => {
  const subjectContext = lead.searchIntent || "OBX property review";
  const subject = `New OBX insurance lead: ${subjectContext}${
    lead.address ? ` - ${lead.address}` : ""
  }`;
  const formData = new FormData();
  formData.set("_subject", subject);
  formData.set("_template", "table");
  formData.set("_captcha", "false");
  formData.set("_replyto", lead.email);

  for (const [label, value] of leadRows(lead, request, leadRecord)) {
    appendFormSubmitField(formData, label.toLowerCase().replaceAll(" ", "_"), value);
  }

  const response = await fetch(`https://formsubmit.co/ajax/${toEmail}`, {
    method: "POST",
    headers: {
      Origin: "https://www.obxncinsurance.com",
      Referer: "https://www.obxncinsurance.com/",
    },
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || String(result.success) !== "true") {
    throw new Error(result.message || "FormSubmit delivery failed.");
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
  let leadRecord;

  try {
    leadRecord = await saveLeadToDatabase({ env, lead, request });
  } catch (error) {
    console.error(error);
    return json(
      {
        ok: false,
        message:
          "Your request could not be saved right now. Please try again or contact us directly.",
      },
      502,
    );
  }

  try {
    if (env.RESEND_API_KEY) {
      await sendWithResend({ env, lead, request, toEmail, leadRecord });
      await markLeadEmailDelivery({ env, leadId: leadRecord.leadId, delivery: "resend" });
      return json({ ok: true, delivery: "resend", storage: leadRecord.storage, leadId: leadRecord.leadId });
    }

    try {
      await sendWithFormSubmit({ lead, request, toEmail, leadRecord });
      await markLeadEmailDelivery({ env, leadId: leadRecord.leadId, delivery: "formsubmit" });
      return json({ ok: true, delivery: "formsubmit", storage: leadRecord.storage, leadId: leadRecord.leadId });
    } catch (error) {
      console.error(error);
      await markLeadEmailDelivery({ env, leadId: leadRecord.leadId, delivery: "formsubmit-browser-pending" });
      return json(
        {
          ok: false,
          fallback: "formsubmit-browser",
          formSubmitEmail: toEmail,
          storage: leadRecord.storage,
          leadId: leadRecord.leadId,
          message: "Email delivery needs browser fallback.",
        },
        424,
      );
    }
  } catch (error) {
    console.error(error);
    await markLeadEmailDelivery({ env, leadId: leadRecord?.leadId, delivery: "failed" }).catch(console.error);
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
