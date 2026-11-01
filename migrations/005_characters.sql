CREATE TABLE IF NOT EXISTS characters (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  race TEXT NOT NULL CHECK (length(race) BETWEEN 1 AND 80),
  class_name TEXT NOT NULL CHECK (length(class_name) BETWEEN 1 AND 80),
  st NUMERIC(12,3) CHECK (st IS NULL OR st >= 0),
  dx NUMERIC(12,3) CHECK (dx IS NULL OR dx >= 0),
  iq NUMERIC(12,3) CHECK (iq IS NULL OR iq >= 0),
  ht NUMERIC(12,3) CHECK (ht IS NULL OR ht >= 0),
  san NUMERIC(12,3) CHECK (san IS NULL OR san >= 0),
  life NUMERIC(12,3) CHECK (life IS NULL OR life >= 0),
  inventory TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  backstory TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_characters_user_updated
  ON characters(user_id, updated_at DESC);
