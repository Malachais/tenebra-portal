"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { entries, rules, regions } = require("../seeds/lore");

const root = path.join(__dirname, "..");

test("Seeds: os sete Véus ficam como rascunhos sem lore inventado", () => {
  const names = ["Véu Material", "Véu Neutral", "Véu Silvestre", "Véu Caótico", "Véu Rubro", "Véu da Névoa", "Véu dos Ancestrais"];
  for (const name of names) {
    const entry = entries.find(item => item.title === name);
    assert.ok(entry, `${name} deve ter página inicial`);
    assert.equal(entry.category, "sete-veus");
    assert.equal(entry.published, false);
    assert.match(entry.content, /Informação ainda desconhecida/);
    assert.match(entry.content, /RASCUNHO/);
  }
});

test("Seeds: apenas regras declaradas pelo criador são publicadas", () => {
  const roll = rules.find(entry => entry.slug === "regra-base-3d8");
  const attrs = rules.find(entry => entry.slug === "atributos-base");
  assert.equal(roll.published, true);
  assert.match(roll.content, /3d8/);
  assert.match(roll.content, /descarta 2/);
  assert.match(roll.content, /vantagem, desvantagem e Saque Rápido não estão definidos/);
  assert.match(attrs.content, /ST — Força/);
  assert.match(attrs.content, /SAN — Sanidade/);
  assert.ok(regions[0].description.includes("arquipélago"));
  assert.equal(regions[0].published, true);
});

test("Importação SQLite: somente posts são exportados, sem consultar contas", () => {
  const script = path.join(root, "seeds", "export-legacy-sqlite.py");
  const text = fs.readFileSync(script, "utf8");
  assert.match(text, /mode=ro/);
  assert.match(text, /SELECT id, slug, category, title, summary, body, author, published/);
  assert.doesNotMatch(text, /SELECT .*password|FROM users/i);
  assert.match(text, /FROM records ORDER BY id/);
  assert.doesNotMatch(text, /password_hash|password\s*,/i);
});

test("Migration e seed: import idempotente, preserva registros e não remove tabelas", () => {
  const sql = fs.readFileSync(path.join(root, "migrations", "011_lore_imports.sql"), "utf8");
  const runner = fs.readFileSync(path.join(root, "seeds", "run.js"), "utf8");
  assert.doesNotMatch(sql, /DROP\s+(DATABASE|TABLE)/i);
  assert.match(sql, /ON CONFLICT DO NOTHING/i);
  assert.match(sql, /published, source_record_id/);
  assert.match(runner, /WHERE NOT EXISTS/);
  assert.match(runner, /ON CONFLICT DO NOTHING/);
  assert.match(runner, /published: false/);
});
