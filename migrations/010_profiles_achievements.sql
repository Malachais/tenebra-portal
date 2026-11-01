CREATE TABLE IF NOT EXISTS user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id),
  display_name TEXT CHECK (display_name IS NULL OR length(display_name) <= 80),
  avatar_url TEXT CHECK (avatar_url IS NULL OR length(avatar_url) <= 1000),
  bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 2000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE characters ADD COLUMN IF NOT EXISTS visible_on_profile BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id BIGINT NOT NULL REFERENCES users(id),
  achievement_id BIGINT NOT NULL REFERENCES achievements(id),
  awarded_by BIGINT REFERENCES users(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, awarded_at DESC);
