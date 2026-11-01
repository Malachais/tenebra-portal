CREATE TABLE IF NOT EXISTS monsters (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  image_url TEXT,
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 4000),
  threat_level TEXT CHECK (threat_level IS NULL OR length(threat_level) <= 80),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  skills TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  weaknesses TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monsters_published_date
  ON monsters(published, created_at DESC);

INSERT INTO monsters(slug,name,description,history,author,published,image_url)
SELECT slug,title,summary,content,COALESCE(author,'Arquivo'),published,image_url
FROM records
WHERE category='monstros'
ON CONFLICT (slug) DO NOTHING;
