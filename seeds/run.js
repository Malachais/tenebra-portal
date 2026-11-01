"use strict";
const { Pool } = require("pg");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { entries, rules, regions } = require("./lore");

if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL no .env antes de importar o conteúdo.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: true } : undefined, connectionTimeoutMillis: 5000 });
const legacyCategory = { mundo: "historia-tenebra", criaturas: "bestiario", lugares: "mapas-regioes", relatos: "relatos" };

async function insertLore(client, entry) {
  const { rowCount } = await client.query(
    `INSERT INTO lore_entries(slug,title,category,summary,content,author,published,source_system,source_id)
     SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
     WHERE NOT EXISTS (SELECT 1 FROM lore_entries WHERE slug=$1 OR lower(title)=lower($2)
       OR (source_system=$8 AND source_id=$9))
     ON CONFLICT DO NOTHING`,
    [entry.slug, entry.title, entry.category, entry.summary.slice(0, 280), entry.content.slice(0, 30000), entry.author, entry.published, entry.source_system, entry.source_id]
  );
  return rowCount;
}

async function run() {
  const client = await pool.connect();
  let inserted = 0, skipped = 0, imported = 0, regionsAdded = 0;
  try {
    const migration = await client.query("SELECT 1 FROM schema_migrations WHERE version='011_lore_imports'");
    if (!migration.rowCount) throw new Error("Migration 011 ainda não aplicada. Inicie o servidor após habilitar o PostgreSQL e rode este seed novamente.");
    let legacy = [];
    try {
      legacy = JSON.parse(execFileSync("python3", [path.join(__dirname, "export-legacy-sqlite.py")], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));
    } catch (error) {
      throw new Error(`Não foi possível ler apenas os posts do SQLite legado: ${error.message}`);
    }
    await client.query("BEGIN");
    for (const entry of [...entries, ...rules]) {
      const count = await insertLore(client, entry);
      inserted += count; skipped += 1 - count;
    }
    for (const row of legacy) {
      const category = legacyCategory[row.category];
      if (!category) { skipped++; continue; }
      const entry = {
        slug: row.slug, title: row.title, category,
        summary: String(row.summary || "Conteúdo migrado do SQLite legado.").slice(0, 280),
        content: String(row.body || "Informação ainda desconhecida."),
        author: "Arquivo SQLite legado",
        published: false, source_system: "legacy-sqlite", source_id: String(row.id)
      };
      const count = await insertLore(client, entry);
      imported += count; skipped += 1 - count;
    }
    for (const region of regions) {
      const result = await client.query(
        `INSERT INTO regions(slug,name,description,history,factions,creatures,related_events,published)
         SELECT $1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8
         WHERE NOT EXISTS (SELECT 1 FROM regions WHERE slug=$1 OR lower(name)=lower($2))
         ON CONFLICT DO NOTHING`,
        [region.slug, region.name, region.description, region.history, JSON.stringify(region.factions), JSON.stringify(region.creatures), JSON.stringify(region.related_events), region.published]
      );
      regionsAdded += result.rowCount;
    }
    await client.query("COMMIT");
    console.log(`Seed concluído: ${inserted} entradas de referência (${rules.length} regras verificadas), ${imported} posts legados em rascunho, ${regionsAdded} região(ões), ${skipped} itens já existentes ignorados.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) run().catch(error => {
  const code = error.code || error.errors?.find(item => item.code)?.code;
  const safeMessage = error.message || "Falha no seed.";
  console.error(code ? `${safeMessage} (${code})` : safeMessage);
  process.exitCode = 1;
});
module.exports = { insertLore, run };
