CREATE TABLE IF NOT EXISTS custom_roll_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expression TEXT NOT NULL CHECK (length(expression) BETWEEN 3 AND 80),
  dice JSONB NOT NULL CHECK (jsonb_typeof(dice)='array' AND jsonb_array_length(dice) BETWEEN 1 AND 100),
  dice_sum INTEGER NOT NULL,
  modifier INTEGER NOT NULL CHECK (modifier BETWEEN -100000 AND 100000),
  result INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_custom_roll_history_owner_date ON custom_roll_history(user_id,created_at DESC);
