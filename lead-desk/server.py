#!/usr/bin/env python3
"""Private, loopback-only lead desk. No customer data belongs in this repository."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
DEFAULT_DATA = Path.home() / 'Library/Application Support/OBX Lead Desk'
STATUSES = ('Needs reply', 'Waiting for customer', 'Ready for agent', 'With agent', 'Closed', 'Test / duplicate')
ALLOWED_FIELDS = ('name', 'email', 'phone', 'preferred_contact', 'callback_window', 'property_address',
                  'search_intent', 'landing_page', 'lead_goal', 'coverage_needed_by', 'current_carrier',
                  'current_policy_expiration', 'elevation_certificate', 'property_use', 'rental_use',
                  'wind_exposure', 'flood_zone', 'year_built', 'roof_age', 'selected_review',
                  'dwelling_coverage', 'wind_deductible', 'notes', 'source', 'submitted_at')


def now():
    return datetime.now(timezone.utc).isoformat()


def database(data_dir):
    data_dir = Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(data_dir, 0o700)
    db = sqlite3.connect(data_dir / 'leads.sqlite3', timeout=10)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript('''
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY, fields TEXT NOT NULL, subject TEXT NOT NULL, mail_url TEXT NOT NULL,
        submitted_at TEXT NOT NULL, imported_at TEXT NOT NULL, status TEXT NOT NULL,
        owner TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL DEFAULT '', due_date TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '', draft TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS activity (
        id INTEGER PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id), at TEXT NOT NULL,
        description TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    ''')
    os.chmod(data_dir / 'leads.sqlite3', 0o600)
    return db


def safe_mail_url(value):
    parsed = urlsplit(value)
    return value if parsed.scheme == 'https' and parsed.netloc == 'mail.proton.me' and parsed.path.startswith('/u/') else ''


def followup_draft(fields):
    first = fields['name'].split()[0] if fields.get('name') else 'there'
    goal = fields.get('lead_goal', '').lower()
    question = 'Are you still looking for help with your Outer Banks insurance?'
    if 'renewal' in goal:
        question = 'Are you still looking for help with your insurance renewal?'
    elif 'buying' in goal:
        question = 'Are you still looking for insurance for your property purchase, or have you already arranged coverage?'
    elif 'research' in goal:
        question = 'Are you still exploring insurance options for your Outer Banks property?'
    return (f'Hi {first},\n\nThank you for reaching out through OBXNCInsurance.com. '
            'I’m sorry we didn’t get back to you sooner.\n\n' + question +
            ' If you still need help, please reply with your current timeline and the main question you’d like us to help with. '
            'If you’re all set, just let us know and we’ll close your request.\n\n'
            'Thank you,\nThe OBXNCInsurance.com team')


def import_records(db, records):
    if not isinstance(records, list) or len(records) > 500:
        raise ValueError('Import must be a list of no more than 500 records.')
    # Validate the entire batch before writing so a malformed email cannot leave a partial import.
    for record in records:
        if not isinstance(record, dict) or not isinstance(record.get('fields'), dict):
            raise ValueError('Each record needs a fields object.')
        required = record['fields']
        if any(not isinstance(required.get(key), str) or not required[key].strip() for key in ('name','email','submitted_at')):
            raise ValueError('Each imported lead needs name, email and submitted_at.')
        try:
            stamp = datetime.fromisoformat(required['submitted_at'].strip().replace('Z','+00:00'))
            if stamp.tzinfo is None:
                raise ValueError('Missing timezone')
        except ValueError:
            raise ValueError('Each submission needs a valid timestamp with a timezone.') from None
    added = 0
    for record in records:
        fields = record.get('fields', {})
        fields = {key: str(fields.get(key, '')).strip()[:5000] for key in ALLOWED_FIELDS}
        if not fields['email'] or not fields['submitted_at'] or not fields['name']:
            raise ValueError('Each imported lead needs name, email and submitted_at.')
        # No financial eligibility scoring. This key only prevents duplicate email imports.
        lead_id = hashlib.sha256((fields['email'].lower() + '\n' + fields['submitted_at']).encode()).hexdigest()[:24]
        is_test = 'do not process' in fields['name'].lower() or 'this is not a real lead' in fields['notes'].lower()
        status = 'Test / duplicate' if is_test else 'Needs reply'
        due = fields['submitted_at'][:10] if not is_test else ''
        result = db.execute('''INSERT OR IGNORE INTO leads
          (id,fields,subject,mail_url,submitted_at,imported_at,status,next_action,due_date,draft)
          VALUES (?,?,?,?,?,?,?,?,?,?)''', (lead_id,json.dumps(fields),str(record.get('subject',''))[:500],
          safe_mail_url(str(record.get('mailUrl',''))), fields['submitted_at'],now(),status,
          'Confirm whether help is still needed' if not is_test else '', due,
          followup_draft(fields) if not is_test else ''))
        if result.rowcount:
            added += 1
            db.execute('INSERT INTO activity(lead_id,at,description) VALUES (?,?,?)',
                       (lead_id, now(), 'Imported from FormSubmit email. No reply has been recorded in this desk.'))
    db.execute('INSERT OR REPLACE INTO metadata VALUES (?,?)', ('last_import', now()))
    db.commit()
    return added


def list_leads(db):
    result = []
    for row in db.execute('SELECT * FROM leads ORDER BY submitted_at DESC'):
        item = dict(row)
        item['fields'] = json.loads(item['fields'])
        item['activity'] = [dict(a) for a in db.execute(
            'SELECT at,description FROM activity WHERE lead_id=? ORDER BY id DESC LIMIT 30', (row['id'],))]
        result.append(item)
    return result


def update_lead(db, lead_id, payload):
    allowed = ('status', 'owner', 'next_action', 'due_date', 'notes', 'draft')
    row = db.execute('SELECT * FROM leads WHERE id=?', (lead_id,)).fetchone()
    if not row:
        raise LookupError('Lead not found.')
    if payload.get('revision') != row['revision']:
        raise RuntimeError('This lead changed in another window. Refresh before saving.')
    if set(payload) - set(allowed) - {'revision'}:
        raise ValueError('Unsupported field.')
    values = {key: str(payload.get(key, row[key])).strip() for key in allowed}
    if values['status'] not in STATUSES:
        raise ValueError('Choose a valid status.')
    if values['due_date']:
        try:
            parsed = datetime.strptime(values['due_date'], '%Y-%m-%d')
            if parsed.date().isoformat() != values['due_date']:
                raise ValueError('Invalid date format')
        except ValueError:
            raise ValueError('Use a valid follow-up date.') from None
    if any(len(value) > (12000 if key in ('notes', 'draft') else 250) for key, value in values.items()):
        raise ValueError('One of the fields is too long.')
    if values['status'] not in ('Closed', 'Test / duplicate') and not values['due_date']:
        raise ValueError('Open leads need a follow-up date.')
    changed = [key for key in allowed if values[key] != row[key]]
    if not changed:
        return
    with db:
        result = db.execute('''UPDATE leads SET status=?,owner=?,next_action=?,due_date=?,notes=?,draft=?,revision=revision+1
          WHERE id=? AND revision=?''', (*(values[key] for key in allowed), lead_id, row['revision']))
        if not result.rowcount:
            raise RuntimeError('This lead changed in another window. Refresh before saving.')
        description = 'Updated ' + ', '.join(key.replace('_',' ') for key in changed) + '.'
        if 'status' in changed:
            description += f' {row["status"]} → {values["status"]}.'
        db.execute('INSERT INTO activity(lead_id,at,description) VALUES (?,?,?)', (lead_id,now(),description))


def make_handler(data_dir, port, csrf):
    origin = f'http://127.0.0.1:{port}'

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass  # Do not write personal request URLs or payloads to logs.

        def respond(self, body, status=200, content_type='application/json'):
            if isinstance(body, (dict, list)):
                body = json.dumps(body).encode()
            elif isinstance(body, str):
                body = body.encode()
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('X-Frame-Options', 'DENY')
            self.send_header('Content-Security-Policy', "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
            self.end_headers()
            self.wfile.write(body)

        def allowed(self, write=False):
            if self.headers.get('Host') != f'127.0.0.1:{port}':
                self.respond({'error':'Use the local dashboard address.'},403)
                return False
            request_origin = self.headers.get('Origin')
            if request_origin and request_origin != origin or self.headers.get('Sec-Fetch-Site') == 'cross-site':
                self.respond({'error':'Cross-site access is blocked.'},403)
                return False
            if write and (request_origin != origin or not secrets.compare_digest(self.headers.get('X-Desk-CSRF',''), csrf)):
                self.respond({'error':'Refresh the dashboard before saving.'},403)
                return False
            return True

        def do_GET(self):
            if not self.allowed():
                return
            path = urlsplit(self.path).path
            if path == '/api/leads':
                with database(data_dir) as db:
                    meta = dict(db.execute('SELECT key,value FROM metadata'))
                    self.respond({'leads':list_leads(db), 'metadata':meta, 'csrf':csrf, 'statuses':STATUSES})
                return
            assets = {'/':('index.html','text/html; charset=utf-8'), '/app.js':('app.js','text/javascript'),
                      '/style.css':('style.css','text/css'), '/piper.png':('assets/piper.png','image/png'),
                      '/fraunces.ttf':('assets/fraunces.ttf','font/ttf')}
            if path not in assets:
                self.respond({'error':'Not found.'},404)
                return
            filename, kind = assets[path]
            self.respond((ROOT / filename).read_bytes(),content_type=kind)

        def do_PATCH(self):
            if not self.allowed(write=True):
                return
            path = urlsplit(self.path).path
            if not path.startswith('/api/leads/'):
                self.respond({'error':'Not found.'},404)
                return
            try:
                length = int(self.headers.get('Content-Length','0'))
                if length > 50000 or length <= 0 or self.headers.get('Content-Type') != 'application/json':
                    raise ValueError('Send a JSON update under 50 KB.')
                payload = json.loads(self.rfile.read(length))
                if not isinstance(payload, dict):
                    raise ValueError('Update must be an object.')
                with database(data_dir) as db:
                    update_lead(db,path.rsplit('/',1)[-1],payload)
                self.respond({'ok':True})
            except LookupError as error:
                self.respond({'error':str(error)},404)
            except RuntimeError as error:
                self.respond({'error':str(error)},409)
            except (ValueError, TypeError) as error:
                self.respond({'error':str(error)},400)
            except Exception:
                self.respond({'error':'The update could not be saved. Your previous record is intact.'},500)

    return Handler


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, default=DEFAULT_DATA)
    parser.add_argument('--port', type=int, default=4181)
    parser.add_argument('--import-mail', type=Path)
    parser.add_argument('--summary', action='store_true')
    args = parser.parse_args()
    with database(args.data_dir) as db:
        if args.import_mail:
            print(json.dumps({'imported':import_records(db,json.loads(args.import_mail.read_text()))}))
            return
        if args.summary:
            leads = list_leads(db)
            today = datetime.now().astimezone().date().isoformat()
            open_leads = [l for l in leads if l['status'] not in ('Closed','Test / duplicate')]
            print(json.dumps({'open':len(open_leads),'needs_reply':sum(l['status']=='Needs reply' for l in open_leads),
                              'due':sum(l['due_date'] <= today for l in open_leads),
                              'last_import':dict(db.execute('SELECT key,value FROM metadata')).get('last_import')}))
            return
    server = ThreadingHTTPServer(('127.0.0.1',args.port),make_handler(args.data_dir,args.port,secrets.token_urlsafe(32)))
    print(f'OBX Lead Desk: http://127.0.0.1:{args.port}',flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
