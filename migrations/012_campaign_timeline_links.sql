-- Estruturas extensíveis para campanhas, diário, linha do tempo e relações do lore.
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
UPDATE events SET status=CASE status WHEN 'upcoming' THEN 'planned' WHEN 'cancelled' THEN 'archived' ELSE status END;
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'planned';
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('planned','open','in_progress','completed','archived'));
ALTER TABLE characters ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT '';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS veil TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 10000),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','open','in_progress','completed','archived')),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_participants (
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(campaign_id,user_id)
);

CREATE TABLE IF NOT EXISTS campaign_diary (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 20000),
  in_world_at TIMESTAMPTZ,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','campaign','public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS character_roll_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id BIGINT REFERENCES characters(id) ON DELETE SET NULL,
  event_id BIGINT REFERENCES events(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('normal')),
  dice JSONB NOT NULL CHECK (jsonb_typeof(dice)='array' AND jsonb_array_length(dice)=3),
  kept JSONB NOT NULL CHECK (jsonb_typeof(kept)='array' AND jsonb_array_length(kept)=2),
  discarded INTEGER NOT NULL CHECK (discarded BETWEEN 1 AND 8),
  result INTEGER NOT NULL CHECK (result BETWEEN 2 AND 16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relações polimórficas permitem conectar novos tipos sem novas colunas/tabelas.
CREATE TABLE IF NOT EXISTS universe_links (
  id BIGSERIAL PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('record','lore','monster','region','event','campaign','character-sheet')),
  source_id TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (length(relation) BETWEEN 1 AND 80),
  target_type TEXT NOT NULL CHECK (target_type IN ('record','lore','monster','region','event','campaign','character-sheet')),
  target_id TEXT NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_type,source_id,relation,target_type,target_id)
);

ALTER TABLE lore_entries ADD COLUMN IF NOT EXISTS timeline_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_campaign_diary_campaign_time ON campaign_diary(campaign_id,in_world_at,created_at);
CREATE INDEX IF NOT EXISTS idx_roll_history_owner_date ON character_roll_history(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_universe_links_source ON universe_links(source_type,source_id);
CREATE INDEX IF NOT EXISTS idx_universe_links_target ON universe_links(target_type,target_id);
