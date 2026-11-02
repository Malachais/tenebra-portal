-- Guarda os grupos de dados (ex.: 2d10 + 1d8) de cada rolagem personalizada.
ALTER TABLE custom_roll_history
  ADD COLUMN IF NOT EXISTS groups JSONB NOT NULL DEFAULT '[]'::jsonb;
