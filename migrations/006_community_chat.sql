ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_allowed_check
  CHECK (role IN ('admin', 'moderator', 'user', 'editor'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

CREATE TABLE IF NOT EXISTS community_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL CHECK (length(btrim(content)) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_created
  ON community_messages(id DESC);
