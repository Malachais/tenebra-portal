"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const crypto = require("node:crypto");

let passwordHash = "";
const savedMessages = [];
const customRolls = [];
const registeredUsers = new Map();
const communityMessages = [];
let merjinRole = "editor";
const loreRows = [{ id: 19, slug: "os-sete-veus", title: "Os Sete Véus", category: "sete-veus", summary: "Camadas ainda não cartografadas.", content: "Cada véu guarda perguntas em aberto.", image_url: null, author: "merjin", published: true, created_at: new Date(), updated_at: new Date() }];
const monsterRows = [{ id: 21, slug: "cervo-de-vidro", name: "Cervo de Vidro", image_url: null, description: "Uma criatura cristalina.", threat_level: null, attributes: {}, skills: "", history: "Imita gestos.", weaknesses: "", author: "Arquivo", published: true, created_at: new Date(), updated_at: new Date() }];
const characterRows = [];
class FakePool {
  async query(sql, values = []) {
    const q = String(sql).toLowerCase();
    if (q.includes("select case category when 'personagens'") && q.includes("from events where status")) return { rows: [{ kind: "Personagem", title: "Malachais", summary: "Registro de lore", href: "/grimorio/malachais" }, { kind: "Evento", title: "Retorno", summary: "Sessão", href: "/eventos/retorno" }], rowCount: 2 };
    if (q.includes("select username,role from users where id=$1")) { const user = [...registeredUsers.values()].find(item => item.id === Number(values[0])); const row = user || (Number(values[0]) === 7 ? { username: "arquivista-teste", role: "admin" } : null); return { rows: row ? [row] : [], rowCount: row ? 1 : 0 }; }
    if (q.includes("select role from users where id=$1")) { const user = [...registeredUsers.values()].find(item => item.id === Number(values[0])); const role = user?.role || (Number(values[0]) === 7 ? "admin" : Number(values[0]) === 8 ? merjinRole : null); return { rows: role ? [{ role }] : [], rowCount: role ? 1 : 0 }; }
    if (q.includes("select id,username,role from users where id=$1")) { const user = [...registeredUsers.values()].find(item => item.id === Number(values[0])); return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }; }
    if (q.includes("select id,role from users where id=$1")) { const user = [...registeredUsers.values()].find(item => item.id === Number(values[0])); const row = user ? { id: user.id, role: user.role } : Number(values[0]) === 7 ? { id: 7, role: "admin" } : null; return { rows: row ? [row] : [], rowCount: row ? 1 : 0 }; }
    if (q.includes("select count(*) as total from users where role='admin'")) return { rows: [{ total: 3 }], rowCount: 1 };
    if (q.includes("update users set role=$1 where id=$2")) { const user = [...registeredUsers.values()].find(item => item.id === Number(values[1])); if (user) user.role = values[0]; return { rows: user ? [{ id: user.id, username: user.username, role: user.role }] : [], rowCount: user ? 1 : 0 }; }
    if (q.includes("where lower(username)")) {
      const registered = registeredUsers.get(String(values[0]||"").toLowerCase());
      if (registered) return q.startsWith("select 1") ? { rows: [{ one: 1 }], rowCount: 1 } : { rows: [registered], rowCount: 1 };
      if (q.startsWith("select 1")) return { rows: [], rowCount: 0 };
      if (values[0]?.toLowerCase() === "merjin") return { rows: [{ id: 8, username: "merjin", role: merjinRole }], rowCount: 1 };
      if (values[0]?.toLowerCase() === "outra-conta") return { rows: [{ id: 9, username: "outra-conta", password_hash: passwordHash, role: "admin" }], rowCount: 1 };
      return values[0]?.toLowerCase() === "arquivista-teste"
        ? { rows: [{ id: 7, username: "arquivista-teste", password_hash: passwordHash, role: "admin" }], rowCount: 1 }
        : { rows: [], rowCount: 0 };
    }
    if (q.includes("insert into users(username,password_hash,role)")) { const row = { id: 50 + registeredUsers.size, username: values[0], password_hash: values[1], role: q.includes("'admin'") ? "admin" : "user" }; registeredUsers.set(row.username, row); return { rows: [row], rowCount: 1 }; }
    if (q.includes("update users set role='admin',password_hash=$1 where id=$2")) { const row = [...registeredUsers.values()].find(item => item.id === Number(values[1])); if (row) { row.role = "admin"; row.password_hash = values[0]; } return { rows: [], rowCount: row ? 1 : 0 }; }
    if (q.includes("update users set role='admin' where id=$1")) { merjinRole = "admin"; return { rows: [], rowCount: 1 }; }
    if (q.includes("from chat_messages where conversation_id")) {
      let rows = savedMessages.filter(row => row.conversation_id === values[0]);
      const limit = Number(q.match(/limit (\d+)/)?.[1]);
      if (limit) rows = rows.slice(-limit);
      if (q.includes("order by id desc")) rows = rows.slice().reverse();
      return { rows: rows.map(({ role, content, author, created_at }) => ({ role, content, author, created_at })), rowCount: rows.length };
    }
    if (q.startsWith("select title,category,summary,content from records where published=true")) return { rows: [{ title: "O Cervo de Vidro", category: "monstros", summary: "Uma criatura cristalina", content: "Imita o último gesto de quem o encara." }], rowCount: 1 };
    if (q.includes("from lore_entries where published=true") && q.includes("and slug=$1")) { const rows = loreRows.filter(row => row.published && row.slug === values[0]); return { rows, rowCount: rows.length }; }
    if (q.includes("from lore_entries where published=true")) return { rows: loreRows.filter(row => row.published), rowCount: loreRows.length };
    if (q.includes("select 1 from lore_entries where slug=$1")) return { rows: [], rowCount: 0 };
    if (q.includes("insert into lore_entries")) { loreRows.push({ id: 20, slug: values[0], title: values[1], category: values[2], summary: values[3], content: values[4], image_url: values[5], author: values[6], published: values[7], created_at: new Date(), updated_at: new Date() }); return { rows: [{ id: 20, slug: values[0] }], rowCount: 1 }; }
    if (q.includes("from lore_entries order by updated_at")) return { rows: loreRows, rowCount: loreRows.length };
    if (q.includes("update lore_entries set")) return { rows: [{ id: values[6], slug: "os-sete-veus" }], rowCount: 1 };
    if (q.includes("delete from lore_entries where id=$1")) return { rows: [], rowCount: 1 };
    if (q.includes("from monsters where published=true") && q.includes("and slug=$1")) return { rows: monsterRows.filter(row => row.slug === values[0]), rowCount: monsterRows.some(row => row.slug === values[0]) ? 1 : 0 };
    if (q.includes("from monsters where published=true")) return { rows: monsterRows.filter(row => row.published), rowCount: monsterRows.length };
    if (q.includes("select 1 from monsters where slug=$1")) return { rows: [], rowCount: 0 };
    if (q.includes("insert into monsters")) { monsterRows.push({ id: 22, slug: values[0], name: values[1], image_url: values[2], description: values[3], threat_level: values[4], attributes: JSON.parse(values[5]), skills: values[6], history: values[7], weaknesses: values[8], author: values[9], published: values[10], created_at: new Date(), updated_at: new Date() }); return { rows: [{ id: 22, slug: values[0] }], rowCount: 1 }; }
    if (q.includes("from monsters order by updated_at")) return { rows: monsterRows, rowCount: monsterRows.length };
    if (q.includes("update monsters set")) return { rows: [{ id: values[9], slug: "cervo-de-vidro" }], rowCount: 1 };
    if (q.includes("delete from monsters where id=$1")) return { rows: [], rowCount: 1 };
    if (q.includes("from characters where id=$1 and user_id=$2")) { const rows = characterRows.filter(row => row.id === Number(values[0]) && row.user_id === Number(values[1])); return { rows, rowCount: rows.length }; }
    if (q.includes("from characters where user_id=$1")) { const rows = characterRows.filter(row => row.user_id === Number(values[0])); return { rows, rowCount: rows.length }; }
    if (q.includes("insert into characters")) { const row = { id: 31, user_id: Number(values[0]), name: values[1], race: values[2], class_name: values[3], st: values[4], dx: values[5], iq: values[6], ht: values[7], san: values[8], life: values[9], inventory: values[10], skills: values[11], backstory: values[12], title: values[14], origin: values[15], veil: values[16], created_at: new Date(), updated_at: new Date() }; characterRows.push(row); return { rows: [{ id: row.id, name: row.name }], rowCount: 1 }; }
    if (q.includes("update characters set")) { const row = characterRows.find(item => item.id === Number(values[16]) && item.user_id === Number(values[17])); return { rows: row ? [{ id: row.id, name: values[0] }] : [], rowCount: row ? 1 : 0 }; }
    if (q.includes("delete from characters where id=$1 and user_id=$2")) { const index = characterRows.findIndex(row => row.id === Number(values[0]) && row.user_id === Number(values[1])); if (index < 0) return { rows: [], rowCount: 0 }; characterRows.splice(index, 1); return { rows: [], rowCount: 1 }; }
    if (q.includes("from community_messages m join users") && q.includes("where ($1::bigint=0")) { const after = BigInt(values[0]), rows = communityMessages.filter(item => after === 0n || BigInt(item.id) > after).sort((a,b) => Number(b.id)-Number(a.id)).slice(0,100).reverse().map(item => ({ ...item, author: [...registeredUsers.values()].find(user => user.id === item.user_id)?.username || "arquivista-teste", role: [...registeredUsers.values()].find(user => user.id === item.user_id)?.role || "admin" })); return { rows, rowCount: rows.length }; }
    if (q.includes("from community_messages m join users") && q.includes("order by m.id desc")) return { rows: communityMessages.slice().reverse().slice(0,100).map(item => ({ ...item, author: [...registeredUsers.values()].find(user => user.id === item.user_id)?.username || "arquivista-teste", role: [...registeredUsers.values()].find(user => user.id === item.user_id)?.role || "admin" })), rowCount: communityMessages.length };
    if (q.includes("insert into community_messages")) { const row = { id: 41 + communityMessages.length, user_id: Number(values[0]), content: values[1], created_at: new Date() }; communityMessages.push(row); return { rows: [row], rowCount: 1 }; }
    if (q.includes("select user_id from community_messages where id=$1")) { const row = communityMessages.find(item => item.id === Number(values[0])); return { rows: row ? [{ user_id: row.user_id }] : [], rowCount: row ? 1 : 0 }; }
    if (q.includes("delete from community_messages where id=$1")) { const index = communityMessages.findIndex(item => item.id === Number(values[0])); if (index < 0) return { rows: [], rowCount: 0 }; communityMessages.splice(index,1); return { rows: [], rowCount: 1 }; }
    if (q.includes("count(*) from records") && q.includes("as published_records")) return { rows: [{ published_records: "20", lore_pages: String(loreRows.length), monsters: String(monsterRows.length), users: String(registeredUsers.size+3), community_messages: String(communityMessages.length), characters: String(characterRows.length) }], rowCount: 1 };
    if (q.includes("select id,username,role,created_at from users order by created_at")) return { rows: [...registeredUsers.values(), { id: 7, username: "arquivista-teste", role: "admin", created_at: new Date() }], rowCount: registeredUsers.size + 1 };
    if (q.includes("insert into chat_messages")) {
      savedMessages.push({ conversation_id: values[0], role: "user", author: "Visitante", content: values[1], created_at: new Date() }, { conversation_id: values[0], role: "assistant", author: "Oráculo de Tenebra", content: values[2], created_at: new Date() });
      return { rows: [], rowCount: 2 };
    }
    if (q.includes("insert into custom_roll_history")) { customRolls.push({ user_id: Number(values[0]), expression: values[1], dice: JSON.parse(values[2]), dice_sum: values[3], modifier: values[4], result: values[5] }); return { rows: [], rowCount: 1 }; }
    if (q.includes("from custom_roll_history h where h.user_id=$1")) { const rows = customRolls.filter(row => row.user_id === Number(values[0])).map((row, index) => ({ id: index + 1, character_id: null, event_id: null, mode: "custom", dice: row.dice, kept: row.dice, discarded: null, result: row.result, created_at: new Date(), character_name: null, event_title: null, event_slug: null, expression: row.expression })); return { rows, rowCount: rows.length }; }
    if (q.includes("select password_hash from users limit 1")) return { rows: [{ password_hash: passwordHash }], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  }
  async connect() { throw new Error("O teste de rota não deve conectar ao banco."); }
  async end() {}
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "pg") return { Pool: FakePool };
  return originalLoad.call(this, request, parent, isMain);
};
const { api, ensureAdmin, roll3d8, validateCharacter, validateEvent, postgresStartupMessage } = require("../server.js");
const { parseDiceExpression, rollDiceExpression } = require("../dice-expression.js");
Module._load = originalLoad;

function makeResponse() {
  return {
    status: 0, headers: {}, body: "",
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { this.body = String(body ?? ""); }
  };
}
async function callApi(method, path, body, headers = {}) {
  const req = new (require("node:events").EventEmitter)();
  req.method = method;
  req.headers = headers;
  req.socket = { remoteAddress: `test-${path}` };
  const res = makeResponse();
  const pending = api(req, res, new URL(path, "http://localhost"));
  if (body !== undefined) {
    process.nextTick(() => { req.emit("data", Buffer.from(typeof body === "string" ? body : JSON.stringify(body))); req.emit("end"); });
  }
  await pending;
  return { ...res, json: JSON.parse(res.body || "{}") };
}
async function login() {
  return callApi("POST", "/api/login", { username: "arquivista-teste", password: "senha-correta-para-teste" });
}
const conversationId = "123e4567-e89b-42d3-a456-426614174000";

// Password hash compatible with the application's scrypt format.
test.before(async () => {
  const salt = Buffer.alloc(16, 9);
  const derived = await new Promise((resolve, reject) => crypto.scrypt("senha-correta-para-teste", salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => err ? reject(err) : resolve(key)));
  passwordHash = `${salt.toString("hex")}:${derived.toString("hex")}`;
});

test("Login 1/3: credenciais válidas criam sessão HttpOnly e token CSRF", async () => {
  const response = await login();
  assert.equal(response.status, 200);
  assert.equal(response.json.user, "arquivista-teste");
  assert.equal(response.json.role, "admin");
  assert.ok(response.json.csrf);
  assert.match(response.headers["Set-Cookie"], /HttpOnly/);
});

test("Login 2/3: senha inválida é recusada sem criar sessão", async () => {
  const response = await callApi("POST", "/api/login", { username: "arquivista-teste", password: "incorreta" });
  assert.equal(response.status, 401);
  assert.equal(response.headers["Set-Cookie"], undefined);
  assert.equal(response.json.error, "Usuário ou senha incorretos.");
});

test("Login 3/3: mutação sem CSRF é bloqueada e logout com token encerra a sessão", async () => {
  const signedIn = await login();
  const cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const blocked = await callApi("POST", "/api/logout", {}, { cookie });
  assert.equal(blocked.status, 403);
  const ended = await callApi("POST", "/api/logout", {}, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(ended.status, 200);
  assert.equal(ended.json.ok, true);
  assert.match(ended.headers["Set-Cookie"], /Max-Age=0/);
});

test("Admin: merjin é promovido sem redefinir a senha existente", async () => {
  const result = await ensureAdmin("merjin");
  assert.deepEqual(result, { username: "merjin", created: false, passwordUpdated: false });
  assert.equal(merjinRole, "admin");
});

test("Admin: malachais é criado ou tem senha redefinida com hash e sem alterar merjin", async () => {
  const created = await ensureAdmin("malachais", "senha-inicial-admin-de-teste");
  assert.equal(created.created, true);
  const account = registeredUsers.get("malachais");
  assert.equal(account.role, "admin");
  assert.notEqual(account.password_hash, "senha-inicial-admin-de-teste");
  const oldHash = account.password_hash;
  const reset = await ensureAdmin("malachais", "senha-redefinida-admin-teste");
  assert.equal(reset.created, false);
  assert.equal(reset.passwordUpdated, true);
  assert.notEqual(account.password_hash, oldHash);
  assert.equal(merjinRole, "admin");
  registeredUsers.delete("malachais");
});

test("Grimório: categorias e páginas públicas são carregadas; admin cria páginas", async () => {
  const published = await callApi("GET", "/api/lore?category=sete-veus&q=véus");
  assert.equal(published.status, 200);
  assert.equal(published.json.entries[0].slug, "os-sete-veus");
  const invalidCategory = await callApi("GET", "/api/lore?category=livre");
  assert.equal(invalidCategory.status, 400);

  const signedIn = await login();
  const cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const payload = { title: "Caminho do Carvalho", category: "mapas-regioes", summary: "Uma rota antiga.", content: "O caminho desaparece ao amanhecer.", published: true };
  const created = await callApi("POST", "/api/admin/lore", payload, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(created.status, 201);
  assert.equal(created.json.slug, "caminho-do-carvalho");
  const draft = await callApi("POST", "/api/admin/lore", { ...payload, title: "Personagem em rascunho", category: "personagens", published: false }, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(draft.status, 201);
  const loreCharacter = await callApi("POST", "/api/admin/lore", { ...payload, title: "Malachais - lore", category: "personagens", published: true }, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(loreCharacter.status, 201);
  assert.equal((await callApi("GET", `/api/lore/${loreCharacter.json.slug}`)).status, 200);
  const publicLore = await callApi("GET", "/api/lore?category=personagens");
  assert.ok(!publicLore.json.entries.some(entry => entry.slug === "personagem-em-rascunho"));
  assert.equal((await callApi("GET", `/api/lore/${draft.json.slug}`)).status, 404);
  assert.equal((await callApi("GET", "/api/lore/os-sete-veus")).status, 200);
  const noCsrf = await callApi("POST", "/api/admin/lore", payload, { cookie });
  assert.equal(noCsrf.status, 403);
});

test("Bestiário: ficha pública e cadastro validado pelo administrador", async () => {
  const publicList = await callApi("GET", "/api/monsters?q=vidro");
  assert.equal(publicList.status, 200);
  assert.equal(publicList.json.monsters[0].name, "Cervo de Vidro");
  const invalid = await callApi("POST", "/api/admin/monsters", { name: "", description: "" });
  assert.equal(invalid.status, 401);

  const signedIn = await login();
  const cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const payload = { name: "Sentinela de Musgo", description: "Avistamento sem classificação.", attributes: "{\"campo\":1}", skills: "", history: "Relato recente.", weaknesses: "", published: true };
  const created = await callApi("POST", "/api/admin/monsters", payload, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(created.status, 201);
  assert.equal(created.json.slug, "sentinela-de-musgo");
  const invalidAttributes = await callApi("POST", "/api/admin/monsters", { ...payload, attributes: "[]" }, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(invalidAttributes.status, 422);
});

test("Personagens: fichas autenticadas ficam restritas ao dono e validam atributos", async () => {
  const unauthorized = await callApi("GET", "/api/me/characters");
  assert.equal(unauthorized.status, 401);
  const signedIn = await login();
  const cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const headers = { cookie, "x-csrf-token": signedIn.json.csrf };
  const payload = { name: "Ari", title: "Viajante", race: "Errante", class_name: "Cartógrafa", origin: "Da'kor", veil: "Material", st: 1, dx: 2, iq: 3, ht: 4, san: 5, life: 6, inventory: "Caderno", skills: "", backstory: "Uma viagem por começar." };
  const invalid = await callApi("POST", "/api/me/characters", { ...payload, san: -1 }, headers);
  assert.equal(invalid.status, 422);
  const created = await callApi("POST", "/api/me/characters", payload, headers);
  assert.equal(created.status, 201);
  assert.equal(created.json.name, "Ari");
  assert.equal((await callApi("GET", "/api/me/characters/31", undefined, { cookie })).status, 200);
  assert.deepEqual([characterRows.at(-1).title, characterRows.at(-1).origin, characterRows.at(-1).veil], ["Viajante", "Da'kor", "Material"]);
  assert.equal((await callApi("GET", "/api/me/characters/31/links", undefined, { cookie })).status, 200);
  for (const value of [1, 5, 10, 20, 100]) {
    const response = await callApi("POST", "/api/me/characters", { ...payload, st: String(value) }, headers);
    assert.equal(response.status, 201);
    assert.equal(characterRows.at(-1).st, value);
  }
  assert.equal((await callApi("POST", "/api/me/characters", { ...payload, st: "10.5" }, headers)).status, 201);
  for (const value of ["10k", "abc", -5]) assert.equal((await callApi("POST", "/api/me/characters", { ...payload, st: value }, headers)).status, 422);
  const otherUser = await callApi("POST", "/api/login", { username: "outra-conta", password: "senha-correta-para-teste" });
  const otherCookie = otherUser.headers["Set-Cookie"].split(";")[0];
  const privateRead = await callApi("GET", "/api/me/characters/31", undefined, { cookie: otherCookie });
  assert.equal(privateRead.status, 404);
  const privateEdit = await callApi("PUT", "/api/me/characters/31", payload, { cookie: otherCookie, "x-csrf-token": otherUser.json.csrf });
  assert.equal(privateEdit.status, 404);
});

test("Busca global: retorna conteúdo publicado por tipo sem exigir sessão", async () => {
  const empty = await callApi("GET", "/api/search?q=");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.json.results, []);
  const response = await callApi("GET", "/api/search?q=malachais");
  assert.equal(response.status, 200);
  assert.deepEqual(response.json.results.map(item => item.kind), ["Personagem", "Evento"]);
  assert.equal(response.json.results[0].href, "/grimorio/malachais");
});

test("Eventos: aceita os cinco status editoriais novos e rejeita status antigos", () => {
  const base = { title: "Sessão", description: "Encontro", event_date: "2026-12-01T20:00:00Z", master_id: 1 };
  for (const status of ["planned", "open", "in_progress", "completed", "archived"]) assert.deepEqual(validateEvent({ ...base, status }).e, []);
  assert.ok(validateEvent({ ...base, status: "upcoming" }).e.length);
});

test("Ficha: valida formato decimal, limites e preserva números sem abreviação", () => {
  for (const raw of ["1", "5", "10", "20", "100", "10.5"]) {
    const { p, e } = validateCharacter({ name: "Teste", race: "Povo", class_name: "Classe", st: raw });
    assert.deepEqual(e, []);
    assert.equal(p.st, Number(raw));
  }
  for (const raw of ["10k", "abc", "-5", "1000000000", "10.1234"]) {
    const { e } = validateCharacter({ name: "Teste", race: "Povo", class_name: "Classe", st: raw });
    assert.ok(e.length, `deveria rejeitar ${raw}`);
  }
});

test("Rolador: o servidor executa 3d8, descarta o menor e rejeita modificadores sem regra", async () => {
  const values = [8, 6, 2];
  assert.deepEqual(roll3d8(() => values.shift()), { dice: [8, 6, 2], discarded: 2, discardedIndex: 2, kept: [8, 6], result: 14 });
  const response = await callApi("POST", "/api/roll", { mode: "normal" });
  assert.equal(response.status, 200);
  assert.equal(response.json.dice.length, 3);
  assert.ok(response.json.dice.every(value => Number.isInteger(value) && value >= 1 && value <= 8));
  assert.equal(response.json.result, response.json.kept[0] + response.json.kept[1]);
  const unsupported = await callApi("POST", "/api/roll", { mode: "advantage" });
  assert.equal(unsupported.status, 422);
});

test("Rolador: empates, extremos e fonte simulada inválida são tratados de forma determinística", () => {
  const tied = [4, 4, 8];
  assert.deepEqual(roll3d8(() => tied.shift()), { dice: [4, 4, 8], discarded: 4, discardedIndex: 0, kept: [4, 8], result: 12 });
  const minimum = [1, 1, 1];
  assert.deepEqual(roll3d8(() => minimum.shift()), { dice: [1, 1, 1], discarded: 1, discardedIndex: 0, kept: [1, 1], result: 2 });
  const maximum = [8, 8, 8];
  assert.deepEqual(roll3d8(() => maximum.shift()), { dice: [8, 8, 8], discarded: 8, discardedIndex: 0, kept: [8, 8], result: 16 });
  assert.throws(() => roll3d8(() => 0), { name: "RangeError" });
  assert.throws(() => roll3d8(() => 9), { name: "RangeError" });
  assert.throws(() => roll3d8(() => NaN), { name: "RangeError" });
});

test("Rolador personalizado: expressões válidas, aleatoriedade reproduzível e entrada hostil rejeitada", async () => {
  for (const expression of ["1d20", "2d6", "3d8", "4d10+5", "2d20-2", "1d100"]) assert.doesNotThrow(() => parseDiceExpression(expression));
  const values = [18, 12];
  assert.deepEqual(rollDiceExpression("2d20 + 5", () => values.shift()), { count: 2, sides: 20, modifier: 5, expression: "2d20+5", dice: [18, 12], diceSum: 30, result: 35 });
  for (const invalid of ["eval()", "<script>", "999999d999999", "texto", "2d6+2;process.exit()", "1d6".repeat(20)]) assert.throws(() => parseDiceExpression(invalid));
  const response = await callApi("POST", "/api/roll/custom", { expression: "4d10 + 5" });
  assert.equal(response.status, 200);
  assert.equal(response.json.dice.length, 4);
  assert.equal(response.json.result, response.json.dice.reduce((sum, value) => sum + value, 5));
  const invalid = await callApi("POST", "/api/roll/custom", { expression: "eval()" });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.json.code, "INVALID_DICE_EXPRESSION");
  const signedIn = await login(), cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const saved = await callApi("POST", "/api/roll/custom", { expression: "2d6" }, { cookie, "x-csrf-token": signedIn.json.csrf });
  assert.equal(saved.status, 200); assert.equal(saved.json.saved, true);
  const history = await callApi("GET", "/api/me/rolls", undefined, { cookie });
  assert.ok(history.json.rolls.some(roll => roll.mode === "custom" && roll.expression === "2d6"));
});

test("Chat da comunidade: cadastro comum, histórico, autoria, validação e moderação própria", async () => {
  const invalidRegistration = await callApi("POST", "/api/register", { username: "x", password: "curta" });
  assert.equal(invalidRegistration.status, 422);
  const first = await callApi("POST", "/api/register", { username: "sombra", password: "senha-comprida-para-chat" });
  assert.equal(first.status, 201);
  assert.equal(first.json.role, "user");
  const firstCookie = first.headers["Set-Cookie"].split(";")[0];
  const me = await callApi("GET", "/api/me", undefined, { cookie: firstCookie });
  const headers = { cookie: firstCookie, "x-csrf-token": me.json.csrf };
  const empty = await callApi("POST", "/api/community/messages", { content: "   " }, headers);
  assert.equal(empty.status, 422);
  const sent = await callApi("POST", "/api/community/messages", { content: "Saudações da mata." }, headers);
  assert.equal(sent.status, 201);
  assert.equal(sent.json.message.author, "sombra");
  assert.equal(sent.json.message.role, "user");
  const second = await callApi("POST", "/api/register", { username: "nevoa", password: "outra-senha-comprida" });
  const secondCookie = second.headers["Set-Cookie"].split(";")[0];
  const secondMe = await callApi("GET", "/api/me", undefined, { cookie: secondCookie });
  const forbidden = await callApi("DELETE", `/api/community/messages/${sent.json.message.id}`, undefined, { cookie: secondCookie, "x-csrf-token": secondMe.json.csrf });
  assert.equal(forbidden.status, 403);
  const history = await callApi("GET", "/api/community/messages?after=0", undefined, { cookie: firstCookie });
  assert.equal(history.json.messages[0].content, "Saudações da mata.");
  assert.equal(history.json.messages[0].author, "sombra");
});

test("Painel: dashboard e gestão de funções exigem administrador; a sessão acompanha mudanças", async () => {
  const signedIn = await login();
  const cookie = signedIn.headers["Set-Cookie"].split(";")[0];
  const headers = { cookie, "x-csrf-token": signedIn.json.csrf };
  const dashboard = await callApi("GET", "/api/admin/dashboard", undefined, { cookie });
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.json.stats.published_records, "20");
  const listing = await callApi("GET", "/api/admin/users", undefined, { cookie });
  assert.equal(listing.status, 200);
  const messages = await callApi("GET", "/api/admin/community/messages", undefined, { cookie });
  assert.equal(messages.status, 200);
  const changed = await callApi("PUT", "/api/admin/users/50/role", { role: "moderator" }, headers);
  assert.equal(changed.status, 200);
  const first = await callApi("POST", "/api/login", { username: "sombra", password: "senha-comprida-para-chat" });
  const firstCookie = first.headers["Set-Cookie"].split(";")[0];
  const me = await callApi("GET", "/api/me", undefined, { cookie: firstCookie });
  assert.equal(me.json.role, "moderator");
  const denied = await callApi("GET", "/api/admin/users", undefined, { cookie: firstCookie });
  assert.equal(denied.status, 403);
  const selfChange = await callApi("PUT", "/api/admin/users/7/role", { role: "user" }, headers);
  assert.equal(selfChange.status, 409);
});

test("Chatbot 1/3: pergunta válida usa o backend e retorna apenas a resposta", async () => {
  const originalFetch = global.fetch;
  let sent;
  global.fetch = async (url, options) => {
    sent = { url, options };
    return new Response(JSON.stringify({ choices: [{ message: { content: "Resposta simulada do Oráculo." } }], usage: { total_tokens: 12 }, secret: "não deve sair" }), { status: 200 });
  };
  try {
    const response = await callApi("POST", "/api/chat", { conversationId, message: "Quais mistérios há no arquivo?" });
    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { reply: "Resposta simulada do Oráculo." });
    assert.equal(sent.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.ok(/^Bearer \S+$/.test(sent.options.headers.Authorization || ""));
    const systemMessage = JSON.parse(sent.options.body).messages[0];
    assert.equal(systemMessage.role, "system");
    assert.match(systemMessage.content, /guia amigável e atento/);
    assert.match(systemMessage.content, /O Cervo de Vidro/);
  } finally { global.fetch = originalFetch; }
});

test("Chatbot 2/3: histórico inválido e mensagem acima do limite retornam 400", async () => {
  const tooLong = await callApi("POST", "/api/chat", { conversationId, message: "x".repeat(1201) });
  const tooMany = await callApi("POST", "/api/chat", { conversationId, messages: Array.from({ length: 13 }, () => ({ role: "user", content: "pergunta" })) });
  assert.equal(tooLong.status, 400);
  assert.equal(tooMany.status, 400);
});

test("Chatbot: falha do provedor vira erro seguro sem detalhes upstream", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: { message: "detalhe privado do provedor" } }), { status: 500 });
  try {
    const response = await callApi("POST", "/api/chat", { conversationId, message: "Uma pergunta" });
    assert.equal(response.status, 502);
    assert.equal(response.json.code, "ORACLE_PROVIDER_FAILURE");
    assert.equal(response.json.error, "Oráculo temporariamente indisponível. Tente novamente mais tarde.");
    assert.doesNotMatch(response.body, /detalhe privado/);
  } finally { global.fetch = originalFetch; }
});

test("Oráculo: configurações ausentes, timeout e falha de comunicação têm respostas distintas", async () => {
  const originalKey = process.env.OPENROUTER_API_KEY, originalFetch = global.fetch;
  try {
    delete process.env.OPENROUTER_API_KEY;
    const missing = await callApi("POST", "/api/chat", { conversationId, message: "Teste" });
    assert.equal(missing.status, 503);
    assert.equal(missing.json.code, "ORACLE_CONFIG_MISSING");
    if (originalKey) process.env.OPENROUTER_API_KEY = originalKey;
    global.fetch = async () => { const error = new Error("timeout"); error.name = "TimeoutError"; throw error; };
    const timeout = await callApi("POST", "/api/chat", { conversationId, message: "Teste timeout" });
    assert.equal(timeout.status, 504);
    assert.equal(timeout.json.code, "ORACLE_TIMEOUT");
    global.fetch = async () => { throw new TypeError("network unavailable"); };
    const network = await callApi("POST", "/api/chat", { conversationId, message: "Teste rede" });
    assert.equal(network.status, 502);
    assert.equal(network.json.code, "ORACLE_NETWORK_FAILURE");
  } finally { if (originalKey) process.env.OPENROUTER_API_KEY = originalKey; else delete process.env.OPENROUTER_API_KEY; global.fetch = originalFetch; }
});

test("Chat: bloqueia texto vazio e recupera mensagens salvas com autores", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: "Resposta salva." } }] }), { status: 200 });
  try {
    const empty = await callApi("POST", "/api/chat", { conversationId, message: "   " });
    assert.equal(empty.status, 400);
    const sent = await callApi("POST", "/api/chat", { conversationId, message: "Mensagem persistente" });
    assert.equal(sent.status, 200);
    const loaded = await callApi("GET", `/api/chat?conversationId=${conversationId}`);
    assert.equal(loaded.status, 200);
    assert.deepEqual(loaded.json.messages.slice(-2).map(({ role, author, content }) => ({ role, author, content })), [
      { role: "user", author: "Visitante", content: "Mensagem persistente" },
      { role: "assistant", author: "Oráculo de Tenebra", content: "Resposta salva." }
    ]);
  } finally { global.fetch = originalFetch; }
});

test("Eventos, mapa e perfis: índices públicos e gerenciamento protegido", async () => {
  assert.equal((await callApi("GET", "/api/events?scope=upcoming")).status, 200);
  assert.equal((await callApi("GET", "/api/events?scope=past")).status, 200);
  assert.equal((await callApi("GET", "/api/regions")).status, 200);
  assert.equal((await callApi("GET", "/api/profiles")).status, 200);
  assert.equal((await callApi("GET", "/api/admin/events")).status, 401);
  assert.equal((await callApi("POST", "/api/admin/regions", { name: "X" })).status, 401);
  assert.equal((await callApi("GET", "/api/campaigns")).status, 200);
  assert.equal((await callApi("GET", "/api/timeline")).status, 200);
  assert.equal((await callApi("GET", "/api/links?type=lore&id=os-sete-veus")).status, 200);
  assert.equal((await callApi("POST", "/api/admin/campaigns", { title: "X" })).status, 401);
  assert.equal((await callApi("POST", "/api/admin/links", { source_type: "lore" })).status, 401);
});

test("PostgreSQL: diagnósticos distinguem senha, banco, serviço e migration", () => {
  assert.match(postgresStartupMessage({ code: "28P01" }), /Autenticação PostgreSQL recusada/);
  assert.match(postgresStartupMessage({ code: "3D000" }), /banco informado.*não existe/);
  assert.match(postgresStartupMessage({ code: "ECONNREFUSED" }), /Conexão recusada/);
  assert.match(postgresStartupMessage({ code: "42P01", startupPhase: "migration", migrationVersion: "001_initial" }), /migration 001_initial/);
});
