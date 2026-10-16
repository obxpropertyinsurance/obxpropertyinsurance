-- Additive groundwork only. Apply deliberately after backing up/verifying D1.
-- Never purge terminal rows while their submission IDs could be retried.
CREATE TABLE IF NOT EXISTS customer_email_outbox (
  submission_id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  input_hash TEXT NOT NULL,
  recipient_hash TEXT NOT NULL,
  requester_hash TEXT,
  request_json TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'queued'
    CHECK (state IN ('queued','sending','retry','accepted','failed','review','suppressed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  next_attempt_at INTEGER NOT NULL,
  first_attempt_at INTEGER,
  lease_token TEXT,
  lease_expires_at INTEGER,
  provider_id TEXT,
  error_code TEXT
);
CREATE INDEX IF NOT EXISTS idx_customer_email_outbox_due
  ON customer_email_outbox(state, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_customer_email_outbox_recipient
  ON customer_email_outbox(recipient_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_customer_email_outbox_requester
  ON customer_email_outbox(requester_hash, created_at);
