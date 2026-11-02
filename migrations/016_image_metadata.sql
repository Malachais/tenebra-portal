-- Metadados de imagens para conteúdo editorial. Migração não destrutiva:
-- colunas novas, sem remoção de image_url existente.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['records','lore_entries','monsters','regions','events','characters'] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_source TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_source_url TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_author TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_author_url TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_license TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_license_url TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_attribution_required BOOLEAN NOT NULL DEFAULT FALSE', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_alt TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_description TEXT', table_name);
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS image_updated_at TIMESTAMPTZ', table_name);
  END LOOP;
END $$;
