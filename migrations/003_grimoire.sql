CREATE TABLE IF NOT EXISTS lore_entries (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  category TEXT NOT NULL CHECK (category IN (
    'historia-tenebra', 'personagens', 'bestiario', 'classes-habilidades',
    'sete-veus', 'mapas-regioes', 'regras-rpg', 'reliquias'
  )),
  summary TEXT NOT NULL CHECK (length(summary) BETWEEN 1 AND 280),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 30000),
  image_url TEXT,
  author TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lore_entries_category_date
  ON lore_entries(category, published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lore_entries_published_date
  ON lore_entries(published, created_at DESC);
