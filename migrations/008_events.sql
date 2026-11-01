CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 140),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 5000),
  event_date TIMESTAMPTZ NOT NULL,
  master_id BIGINT NOT NULL REFERENCES users(id),
  player_limit INTEGER CHECK (player_limit IS NULL OR player_limit BETWEEN 1 AND 200),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_participants (
  event_id BIGINT NOT NULL REFERENCES events(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_date_status
  ON events(status, event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_user
  ON event_participants(user_id, joined_at DESC);
