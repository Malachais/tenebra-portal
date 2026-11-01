"use strict";

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("Configure DATABASE_URL no .env antes de publicar os rascunhos.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: true } : undefined,
  connectionTimeoutMillis: 5000
});

const CONTENT_TABLES = ["records", "lore_entries", "monsters", "regions"];

async function publishDrafts() {
  const client = await pool.connect();
  const changes = [];
  try {
    await client.query("BEGIN");
    for (const table of CONTENT_TABLES) {
      const exists = await client.query("SELECT to_regclass($1) AS relation", [`public.${table}`]);
      if (!exists.rows[0].relation) continue;
      const result = await client.query(`UPDATE ${table} SET published = TRUE WHERE published = FALSE`);
      changes.push({ table, published: result.rowCount });
    }
    await client.query("COMMIT");
    const total = changes.reduce((sum, item) => sum + item.published, 0);
    for (const item of changes) console.log(`${item.table}: ${item.published} publicado(s)`);
    console.log(`Total: ${total} rascunho(s) publicado(s).`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

publishDrafts().catch(error => {
  const code = error.code ? ` (${error.code})` : "";
  console.error(`Não foi possível publicar os rascunhos: ${error.message}${code}`);
  process.exitCode = 1;
  pool.end().catch(() => {});
});
