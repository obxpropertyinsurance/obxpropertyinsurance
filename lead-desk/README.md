# OBX Lead Desk

A private, working follow-up dashboard for FormSubmit inquiries. It runs on this Mac at http://127.0.0.1:4181. It is separate from the public production build and contains no analytics.

```sh
python3 lead-desk/server.py
python3 -m unittest discover -s lead-desk -p 'test_*.py'
python3 lead-desk/server.py --summary
```

Customer data lives in `~/Library/Application Support/OBX Lead Desk/leads.sqlite3`, outside Git and Vite's public directory. The directory is owner-only; the database is mode 600. SQLite transactions preserve edits and optimistic revisions prevent stale windows from silently overwriting them. This is not an encrypted database: use the Mac's FileVault and normal account protections. Do not expose this local server through a tunnel or public interface.

## What it does

- Searchable queue, due dates, owner, status, next action, internal notes and activity history.
- Draft replies and links to the original Proton message. Copying/opening a draft never marks it sent.
- A prominent requested-follow-up plan uses the same deterministic response rules as the website. It shows the recorded contact channel, requested window, deadline priority, reasons for review and a proposed next action. This is a proposal based on the original submission; check later correspondence before acting.
- The current operational focus is email: eligible email requests show an email draft to copy and an email-thread link. Phone and text preferences remain prominent, with their team/service setup marked pending and no contact launch or draft-copy controls. They are never silently converted into email requests. Contact details remain visible, but there are no generic email/phone shortcuts that invite changing the requested channel. Holds, conflicting instructions, unclear preferences and closed/test records also have no contact launch controls.
- Existing saved drafts remain editable and preserved separately from newly generated suggestions. New imports do not invent an apology for a delayed email response. Generated suggestions do not update saved records, claim that a message was sent, or replace an operator's work.
- Keeps explicit test submissions available under All while excluding them from open counts.
- Requires a follow-up date for every open lead.
- Uses Piper's approved font and art; responsive layout and keyboard-operable controls.
- Binds only to 127.0.0.1, validates Host/Origin, requires a CSRF token for writes, denies framing, and makes no external requests.

## Import email submissions

Imports are idempotent by submitted timestamp and email; they never overwrite follow-up work. Use visible email data obtained with authorized mailbox access. Import files must remain outside the repository.

```sh
python3 lead-desk/server.py --import-mail "$HOME/Library/Application Support/OBX Lead Desk/mail-import.json"
```

The file is a JSON array. Each record has `subject`, `mailUrl` (a Proton message URL) and `fields`, mapping FormSubmit field names to text. Required fields are `name`, `email`, `submitted_at`. Unknown fields are discarded.

This is **not a continuous mailbox connector or a production D1 connection**. The scheduled Codex check can read the authorized Proton inbox, import new records and flag replies or due work while this Mac and its authenticated browser are available. Refresh only reloads saved local records. If authentication expires, the monitor must report that limitation rather than imply there were no new leads.

The shared response module is served only at the explicit `/lead-response.mjs` asset route, with the same Host/Origin restrictions, content-security policy and no-store headers as the rest of this local desk. The server does not expose the repository's `src` directory. An already running desk server needs its normal operator-managed restart to load a changed route; this implementation does not restart the service or modify its schedule.

## Sending and accountability

Record a message as sent only after the mailbox visibly confirms it. Keep the next follow-up date when waiting for a reply. Never invent agent assignments, quotes, binding, eligibility decisions or delivery confirmations. Actual insurance advice and transactions require the appropriate licensed professional. The dashboard's statuses are operational notes, not proof a policy exists.

## Background service

The optional macOS LaunchAgent `com.obxncinsurance.lead-desk` starts this local server at sign-in. Its configuration is stored at `~/Library/LaunchAgents/com.obxncinsurance.lead-desk.plist`; logs remain inside the private data directory. Stop it with `launchctl bootout gui/$(id -u) "$HOME/Library/LaunchAgents/com.obxncinsurance.lead-desk.plist"`. No customer data is removed by stopping the server.
