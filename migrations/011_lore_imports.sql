-- Categorias adicionais para organizar o material legado sem alterar textos existentes.
ALTER TABLE lore_entries DROP CONSTRAINT IF EXISTS lore_entries_category_check;
ALTER TABLE lore_entries ADD CONSTRAINT lore_entries_category_check CHECK (category IN (
  'historia-tenebra', 'personagens', 'bestiario', 'classes-habilidades',
  'sete-veus', 'mapas-regioes', 'regras-rpg', 'reliquias',
  'faccoes', 'racas-povos', 'classes', 'habilidades', 'relatos', 'aventuras-eventos'
));

ALTER TABLE lore_entries ADD COLUMN IF NOT EXISTS source_system TEXT;
ALTER TABLE lore_entries ADD COLUMN IF NOT EXISTS source_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_lore_entries_source
  ON lore_entries(source_system, source_id)
  WHERE source_system IS NOT NULL AND source_id IS NOT NULL;

ALTER TABLE regions ADD COLUMN IF NOT EXISTS source_record_id BIGINT UNIQUE REFERENCES records(id) ON DELETE SET NULL;

-- Os registros de regiões já publicados no arquivo são preservados nele e
-- relacionados ao Atlas como rascunhos editoriais para revisão canônica.
INSERT INTO regions(slug, name, description, history, published, source_record_id)
SELECT r.slug, r.title, r.summary, r.content, false, r.id
FROM records r
WHERE r.category='regioes'
  AND NOT EXISTS (
    SELECT 1 FROM regions target
    WHERE target.source_record_id=r.id OR target.slug=r.slug OR lower(target.name)=lower(r.title)
  )
ON CONFLICT DO NOTHING;

-- Itens de arquivo já existentes são ligados ao Grimório como rascunhos;
-- sua página original não é alterada nem removida.
INSERT INTO lore_entries(slug,title,category,summary,content,author,published,source_system,source_id)
SELECT r.slug, r.title,
  CASE
    WHEN r.category='registros' THEN 'relatos'
    WHEN r.slug='chave-de-osso-negro' THEN 'reliquias'
    WHEN r.slug='confraria-da-luz-velada' THEN 'faccoes'
    ELSE 'relatos'
  END,
  left(r.summary,280), r.content, coalesce(r.author,'Arquivo legado'), false,
  'postgres-records', r.id::text
FROM records r
WHERE r.category IN ('registros','outros')
  AND NOT EXISTS (
    SELECT 1 FROM lore_entries target
    WHERE target.source_system='postgres-records' AND target.source_id=r.id::text
       OR target.slug=r.slug OR lower(target.title)=lower(r.title)
  )
ON CONFLICT DO NOTHING;

-- Não inventa estatísticas para fichas incompletas; torna explícito o que falta.
UPDATE monsters
SET attributes=CASE WHEN attributes='{}'::jsonb THEN '{"status":"Informação ainda desconhecida"}'::jsonb ELSE attributes END,
    skills=CASE WHEN btrim(skills)='' THEN 'Informação ainda desconhecida.' ELSE skills END,
    weaknesses=CASE WHEN btrim(weaknesses)='' THEN 'Informação ainda desconhecida.' ELSE weaknesses END,
    threat_level=COALESCE(
      NULLIF(btrim(monsters.threat_level), ''),
      NULLIF(btrim((SELECT substring(r.content FROM 'Perigo:[[:space:]]*([^—.]*)') FROM records r WHERE r.slug=monsters.slug)), ''),
      'Informação ainda desconhecida'
    ),
    updated_at=now()
WHERE attributes='{}'::jsonb OR btrim(skills)='' OR btrim(weaknesses)=''
   OR threat_level IS NULL OR btrim(threat_level)='';
