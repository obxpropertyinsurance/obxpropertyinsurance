const $ = (selector) => document.querySelector(selector);
let leads = [],
  csrf = "",
  statuses = [],
  selected = null,
  filter = "open",
  dirty = false;
const closed = (l) => ["Closed", "Test / duplicate"].includes(l.status);
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value.length === 10 ? value + "T12:00:00" : value))
    : "Not provided";
const due = (lead) =>
  !closed(lead) && lead.due_date && lead.due_date <= today();
const el = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
const toast = (message, error = false) => {
  const n = $("#toast");
  n.textContent = message;
  n.className = error ? "error" : "success";
};
const button = (text, action, cls = "") => {
  const b = el("button", text, cls);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
};
const link = (text, url, cls = "") => {
  const a = el("a", text, cls);
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer noopener";
  return a;
};

function mayLeave() {
  return (
    !dirty || confirm("You have unsaved changes. Leave without saving them?")
  );
}
async function load(keepSelection = true) {
  const response = await fetch("/api/leads", { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "Could not load leads. Your saved data is still on this Mac.",
    );
  const data = await response.json();
  leads = data.leads;
  csrf = data.csrf;
  statuses = data.statuses;
  $("#sync").textContent =
    `Last email import: ${data.metadata.last_import ? new Date(data.metadata.last_import).toLocaleString() : "not yet imported"}. Email checks run separately; Refresh reloads this desk’s saved records.`;
  if (!keepSelection || !leads.some((l) => l.id === selected))
    selected = leads.find((l) => !closed(l))?.id || leads[0]?.id;
  dirty = false;
  renderStats();
  renderList();
  renderDetail();
}
function renderStats() {
  const open = leads.filter((l) => !closed(l));
  const values = [
    [
      "Need a reply",
      open.filter((l) => l.status === "Needs reply").length,
      "reply",
    ],
    ["Due for follow-up", open.filter(due).length, "due"],
    [
      "In progress",
      open.filter((l) => l.status !== "Needs reply").length,
      "progress",
    ],
    ["Closed", leads.filter((l) => l.status === "Closed").length, "closed"],
  ];
  $("#stats").replaceChildren(
    ...values.map(([label, value, f]) => {
      const b = button("", () => {
        if (!mayLeave()) return;
        dirty = false;
        filter = f;
        renderList();
        renderDetail();
      });
      b.append(el("strong", String(value)), el("span", label));
      return b;
    }),
  );
}
function renderList() {
  const q = $("#search").value.toLowerCase().trim();
  const match = leads.filter((l) => {
    if (filter === "open" && closed(l)) return false;
    if (filter === "due" && !due(l)) return false;
    if (filter === "reply" && l.status !== "Needs reply") return false;
    if (filter === "progress" && (closed(l) || l.status === "Needs reply"))
      return false;
    if (filter === "closed" && l.status !== "Closed") return false;
    return (
      !q ||
      Object.values(l.fields)
        .join(" ")
        .concat(" ", l.notes, " ", l.owner)
        .toLowerCase()
        .includes(q)
    );
  });
  match.sort(
    (a, b) =>
      Number(due(b)) - Number(due(a)) ||
      b.submitted_at.localeCompare(a.submitted_at),
  );
  if (!dirty && !match.some((l) => l.id === selected)) {
    selected = match[0]?.id || null;
    renderDetail();
  }
  $("#count").textContent =
    `${match.length} ${match.length === 1 ? "lead" : "leads"}`;
  document
    .querySelectorAll("[data-filter]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === filter)),
    );
  $("#lead-list").replaceChildren(
    ...match.map((l) => {
      const b = button(
        "",
        () => {
          if (!mayLeave()) return;
          selected = l.id;
          dirty = false;
          renderList();
          renderDetail();
          $("#detail h2")?.focus();
          if (innerWidth < 900) $("#detail").scrollIntoView({ block: "start" });
        },
        "lead" + (l.id === selected ? " selected" : ""),
      );
      b.setAttribute("aria-pressed", String(l.id === selected));
      const top = el("span", undefined, "lead-top");
      top.append(
        el("strong", l.fields.name),
        el("span", date(l.submitted_at), "lead-date"),
      );
      b.append(
        top,
        el("span", l.fields.property_address, "address"),
        el(
          "span",
          l.fields.lead_goal || l.fields.selected_review || "Insurance inquiry",
          "context",
        ),
      );
      const bottom = el("span", undefined, "lead-bottom");
      bottom.append(
        el("span", l.status, "pill"),
        el(
          "span",
          due(l)
            ? "Follow-up overdue"
            : l.due_date
              ? "Follow up " + date(l.due_date)
              : "No follow-up",
          "due" + (due(l) ? " overdue" : ""),
        ),
      );
      b.append(bottom);
      return b;
    }),
  );
  if (!match.length)
    $("#lead-list").append(el("p", "No leads match this view.", "empty"));
}
function field(label, tag, value, type, name) {
  const wrap = el("label", undefined, "field"),
    text = el("span", label),
    input = el(tag);
  input.name = name;
  if (type) input.type = type;
  input.value = value || "";
  input.addEventListener("input", () => {
    dirty = true;
    $("#save-state").textContent = "Unsaved changes";
  });
  wrap.append(text, input);
  return { wrap, input };
}
function renderDetail() {
  const lead = leads.find((l) => l.id === selected);
  const root = $("#detail");
  root.replaceChildren();
  if (!lead) {
    const empty = el("div", undefined, "empty");
    empty.append(
      el("h2", "Nothing in this view"),
      el("p", "Choose another filter or search to find a conversation."),
    );
    root.append(empty);
    return;
  }
  const heading = el("div", undefined, "detail-heading");
  const title = el("h2", lead.fields.name);
  title.tabIndex = -1;
  heading.append(
    el("span", lead.status, "pill"),
    title,
    el("p", lead.fields.property_address, "property"),
  );
  const contact = el("div", undefined, "contact");
  contact.append(
    link(lead.fields.email, "mailto:" + encodeURIComponent(lead.fields.email)),
    link(lead.fields.phone, "tel:" + lead.fields.phone.replace(/[^+\d]/g, "")),
  );
  heading.append(
    contact,
    el(
      "p",
      `Received ${date(lead.submitted_at)} · ${lead.fields.preferred_contact || "Contact preference not provided"}`,
      "muted",
    ),
  );
  if (lead.mail_url)
    heading.append(link("Open original email ↗", lead.mail_url, "source"));
  root.append(heading);
  const summary = el("div", undefined, "summary");
  [
    ["Their request", lead.fields.lead_goal || lead.fields.selected_review],
    [
      "Coverage / question",
      lead.fields.selected_review || lead.fields.search_intent,
    ],
    [
      "Timing",
      lead.fields.coverage_needed_by ||
        lead.fields.current_policy_expiration ||
        "Ask for current timeline",
    ],
    ["Property use", lead.fields.property_use],
    ["Contact window", lead.fields.callback_window],
    ["Owner", lead.owner || "Unassigned"],
  ].forEach(([k, v]) => {
    if (v) {
      const d = el("div");
      d.append(el("span", k), el("strong", v));
      summary.append(d);
    }
  });
  root.append(summary);
  const form = el("form", undefined, "followup");
  form.append(el("h3", "Make the next step clear"));
  const grid = el("div", undefined, "form-grid");
  const status = field("Status", "select", null, null, "status");
  statuses.forEach((s) => status.input.append(new Option(s, s)));
  status.input.value = lead.status;
  const follow = field(
    "Follow-up date",
    "input",
    lead.due_date,
    "date",
    "due_date",
  );
  const owner = field("Assigned to", "input", lead.owner, "text", "owner");
  owner.input.placeholder = "Add an owner";
  const action = field(
    "Next action",
    "input",
    lead.next_action,
    "text",
    "next_action",
  );
  action.input.placeholder = "What needs to happen next?";
  grid.append(status.wrap, follow.wrap, owner.wrap, action.wrap);
  form.append(grid);
  const notes = field("Internal notes", "textarea", lead.notes, null, "notes");
  notes.input.rows = 3;
  notes.input.placeholder = "Calls, replies, handoffs and next steps";
  form.append(notes.wrap);
  const draft = field(
    "Suggested follow-up email",
    "textarea",
    lead.draft,
    null,
    "draft",
  );
  draft.input.rows = 10;
  form.append(
    draft.wrap,
    el(
      "p",
      "Draft only. Opening email or copying this text does not mark the lead as contacted.",
      "muted small",
    ),
  );
  const tools = el("div", undefined, "draft-actions");
  tools.append(
    button(
      "Copy reply",
      async () => {
        try {
          await navigator.clipboard.writeText(draft.input.value);
          toast(
            "Reply copied. Send it from your OBX mailbox, then update the status.",
          );
        } catch {
          draft.input.select();
          toast("Select and copy the reply text.");
        }
      },
      "quiet",
    ),
  );
  if (lead.mail_url)
    tools.append(link("Reply in Proton ↗", lead.mail_url, "quiet"));
  form.append(tools);
  const save = el("div", undefined, "save-bar");
  const saveButton = el("button", "Save follow-up", "primary");
  saveButton.type = "submit";
  const state = el("span", "Saved", "small");
  state.id = "save-state";
  save.append(saveButton, state);
  form.append(save);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    state.textContent = "Saving…";
    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.revision = lead.revision;
      const response = await fetch("/api/leads/" + lead.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Desk-CSRF": csrf },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
      toast("Follow-up saved.");
    } catch (error) {
      state.textContent = "Not saved";
      toast(error.message, true);
    } finally {
      saveButton.disabled = false;
    }
  });
  root.append(form);
  const details = el("details");
  details.append(el("summary", "View the full submission"));
  const dl = el("dl");
  Object.entries(lead.fields)
    .filter(([, v]) => v)
    .forEach(([k, v]) => {
      dl.append(el("dt", k.replaceAll("_", " ")), el("dd", v));
    });
  details.append(dl);
  root.append(details);
  const history = el("div", undefined, "history");
  history.append(el("h3", "Activity"));
  lead.activity.forEach((a) => {
    const p = el("p");
    p.append(
      el("span", new Date(a.at).toLocaleString(), "small muted"),
      el("span", a.description),
    );
    history.append(p);
  });
  root.append(history);
}
$("#today").textContent = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());
$("#search").addEventListener("input", renderList);
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    renderList();
  }),
);
$("#refresh").addEventListener("click", () => {
  if (mayLeave()) load().catch((e) => toast(e.message, true));
});
window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
load().catch((e) => toast(e.message, true));
