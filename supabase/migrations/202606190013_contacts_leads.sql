-- Contacts & Leads CRM table
-- Stores pre-conversion contacts and leads before they become participants or profiles.

CREATE TABLE IF NOT EXISTS contacts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                     TEXT NOT NULL DEFAULT 'contact' CHECK (type IN ('contact', 'lead')),
  status                   TEXT NOT NULL DEFAULT 'active'  CHECK (status IN ('active', 'inactive', 'converted', 'archived')),

  -- Identity
  first_name               TEXT,
  last_name                TEXT,
  email                    TEXT,
  phone                    TEXT,
  profile_photo_url        TEXT,

  -- Professional
  company                  TEXT,
  website                  TEXT,

  -- Church / ministry context
  church                   TEXT,

  -- Address
  address_line_1           TEXT,
  address_line_2           TEXT,
  city                     TEXT,
  state                    TEXT,
  zip_code                 TEXT,

  -- CRM categorisation
  source                   TEXT,
  list                     TEXT,
  tags                     TEXT[]   NOT NULL DEFAULT '{}',

  -- Free-form notes
  notes                    TEXT,

  -- Arbitrary extra fields set per organisation
  custom_fields            JSONB    NOT NULL DEFAULT '{}',

  -- Conversion tracking
  converted_to_participant_id  UUID REFERENCES participants(id) ON DELETE SET NULL,
  converted_to_profile_id      UUID REFERENCES profiles(id)    ON DELETE SET NULL,
  converted_at                 TIMESTAMPTZ,

  -- Opt-in tracking (mirrors the SMS/email flags on participants/profiles)
  sms_opt_in               BOOLEAN  NOT NULL DEFAULT false,
  email_opt_in             BOOLEAN  NOT NULL DEFAULT true,

  -- Audit
  created_by               UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_type_idx    ON contacts (type);
CREATE INDEX IF NOT EXISTS contacts_status_idx  ON contacts (status);
CREATE INDEX IF NOT EXISTS contacts_email_idx   ON contacts (email);
CREATE INDEX IF NOT EXISTS contacts_phone_idx   ON contacts (phone);
CREATE INDEX IF NOT EXISTS contacts_tags_idx    ON contacts USING GIN (tags);

-- Custom field definitions (schema declared per-org)
CREATE TABLE IF NOT EXISTS contact_field_definitions (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key      TEXT  NOT NULL UNIQUE,
  field_label    TEXT  NOT NULL,
  field_type     TEXT  NOT NULL DEFAULT 'text'
                       CHECK (field_type IN ('text','email','phone','url','textarea','select','date','number','checkbox')),
  field_options  JSONB NOT NULL DEFAULT '[]',   -- string array for select type
  is_required    BOOLEAN NOT NULL DEFAULT false,
  applies_to     TEXT[]  NOT NULL DEFAULT '{"contact","lead"}',
  display_order  INT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_contacts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_contacts_updated_at();

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_field_definitions ENABLE ROW LEVEL SECURITY;

-- Dashboard staff can read all contacts
CREATE POLICY "contacts_dashboard_read" ON contacts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin','admin','team_member','content_reviewer','pastor_elder_reviewer')
        AND p.status = 'active'
    )
  );

-- Team members and above can write
CREATE POLICY "contacts_team_write" ON contacts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin','admin','team_member')
        AND p.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin','admin','team_member')
        AND p.status = 'active'
    )
  );

-- Field definitions: read for all dashboard staff, write for admins
CREATE POLICY "contact_fields_read" ON contact_field_definitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "contact_fields_admin_write" ON contact_field_definitions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin','admin')
        AND p.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin','admin')
        AND p.status = 'active'
    )
  );
