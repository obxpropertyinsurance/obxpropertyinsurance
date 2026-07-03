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
    .slice(0, 120);

const allowedDeliveries = new Set(["formsubmit-browser", "formsubmit-activation"]);

export async function onRequestPost({ request, env }) {
  if (!env.LEADS_DB?.prepare) {
    return json({ ok: false, message: "Lead database is not configured." }, 501);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Please submit the request again." }, 400);
  }

  const leadId = clean(payload.leadId);
  const delivery = clean(payload.delivery);

  if (!leadId || !allowedDeliveries.has(delivery)) {
    return json({ ok: false, message: "Invalid lead delivery update." }, 400);
  }

  await env.LEADS_DB.prepare("UPDATE leads SET email_delivery = ? WHERE id = ?").bind(delivery, leadId).run();
  return json({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
