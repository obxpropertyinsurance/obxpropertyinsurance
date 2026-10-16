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

## Sending and accountability

Record a message as sent only after the mailbox visibly confirms it. Keep the next follow-up date when waiting for a reply. Never invent agent assignments, quotes, binding, eligibility decisions or delivery confirmations. Actual insurance advice and transactions require the appropriate licensed professional. The dashboard's statuses are operational notes, not proof a policy exists.

## Background service

The optional macOS LaunchAgent `com.obxncinsurance.lead-desk` starts this local server at sign-in. Its configuration is stored at `~/Library/LaunchAgents/com.obxncinsurance.lead-desk.plist`; logs remain inside the private data directory. Stop it with `launchctl bootout gui/$(id -u) "$HOME/Library/LaunchAgents/com.obxncinsurance.lead-desk.plist"`. No customer data is removed by stopping the server.
