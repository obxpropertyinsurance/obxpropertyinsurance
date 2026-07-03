CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_address TEXT NOT NULL,
  preferred_contact TEXT,
  callback_window TEXT,
  search_intent TEXT,
  landing_page_title TEXT,
  lead_goal TEXT,
  coverage_needed_by TEXT,
  current_carrier TEXT,
  policy_expiration TEXT,
  elevation_certificate TEXT,
  property_use TEXT,
  rental_use TEXT,
  wind_exposure TEXT,
  flood_zone TEXT,
  year_built TEXT,
  roof_age TEXT,
  selected_coverage TEXT,
  source_path TEXT,
  ip_address TEXT,
  user_agent TEXT,
  email_delivery TEXT NOT NULL DEFAULT 'pending',
  payload_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_source_path ON leads (source_path);
