-- Separa personagens públicos do universo de fichas privadas de jogadores.
-- status: draft | private | restricted | public
ALTER TABLE characters ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'private';
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_status_check;
ALTER TABLE characters ADD CONSTRAINT characters_status_check
  CHECK (status IN ('draft', 'private', 'restricted', 'public'));
ALTER TABLE characters ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Gera slugs estáveis para fichas já existentes sem publicá-las automaticamente.
UPDATE characters
SET slug = trim(both '-' from regexp_replace(
      translate(lower(name),
        'áàâãäéèêëíìîïóòôõöúùûüçñ',
        'aaaaaeeeeiiiiooooouuuucn'),
      '[^a-z0-9]+', '-', 'g')) || '-' || id
WHERE slug IS NULL OR btrim(slug) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_slug ON characters(slug);
CREATE INDEX IF NOT EXISTS idx_characters_public
  ON characters(status, published_at DESC, name)
  WHERE status = 'public';

-- Acesso explícito para fichas com status "restricted".
CREATE TABLE IF NOT EXISTS character_access (
  character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_character_access_user
  ON character_access(user_id, character_id);

-- Imagens opcionais para Atlas e eventos, com fallback no placeholder do frontend.
ALTER TABLE regions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
