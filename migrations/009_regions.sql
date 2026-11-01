CREATE TABLE IF NOT EXISTS regions (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 5000),
  history TEXT NOT NULL DEFAULT '',
  factions JSONB NOT NULL DEFAULT '[]'::jsonb,
  creatures JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_regions_published ON regions(published, name);
