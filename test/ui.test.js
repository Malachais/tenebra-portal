"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("Placeholder HTML: usa árvore SVG e interrogação sem imagem externa", () => {
  let onError;
  class MockImage { hasAttribute(name) { return name === "data-tenebra-image"; } closest() { return { classList: { add: value => { this.fallbackClass = value; } } }; } }
  const context = { window: {}, document: { addEventListener(name, callback, capture) { if (name === "error" && capture) onError = callback; } }, HTMLImageElement: MockImage };
  vm.runInNewContext(fs.readFileSync("js/api.js", "utf8"), context);
  for (const value of [1, 5, 10, 20, 100]) assert.equal(context.window.SFA.numericDisplay(`${value}.000`), String(value));
  assert.equal(context.window.SFA.numericDisplay("10.500"), "10.5");
  assert.equal(context.window.SFA.numericDisplay("10k"), "—");
  const missing = context.window.SFA.mediaMarkup(null, "Imagem de teste", "record-media");
  assert.match(missing, /class="tenebra-placeholder"/);
  assert.match(missing, /tenebra-placeholder-tree/);
  assert.match(missing, />\?<\/strong>/);
  assert.doesNotMatch(missing, /<img\b/);
  const supplied = context.window.SFA.mediaMarkup("https://example.test/cover.jpg", "Capa", "record-media");
  assert.match(supplied, /src="https:\/\/example\.test\/cover\.jpg"/);
  assert.match(supplied, /data-tenebra-image/);
  const invalid = context.window.SFA.mediaMarkup("javascript:alert(1)");
  assert.match(invalid, /is-missing/);
  assert.doesNotMatch(invalid, /<img\b/);
  const broken = new MockImage();
  onError({ target: broken });
  assert.equal(broken.fallbackClass, "is-missing");
});

test("Personagens públicos: index e detalhe têm scripts próprios e leem slug de rota limpa", () => {
  const index = fs.readFileSync("characters.html", "utf8");
  const detail = fs.readFileSync("character.html", "utf8");
  assert.match(index, /js\/public-characters\.js/);
  assert.match(index, /id="publicCharacterEntries"/);
  assert.match(detail, /js\/character-page\.js/);
  assert.match(detail, /id="characterTitle"/);
  for (const file of ["js/character-page.js", "js/article.js", "js/lore.js", "js/monster-page.js"]) {
    const source = fs.readFileSync(file, "utf8");
    assert.match(source, /location\.pathname\.split\("\/"\)/, `${file} deve aceitar rota limpa`);
  }
  const page = fs.readFileSync("js/character-page.js", "utf8");
  assert.match(page, /character\.can_edit/);
  assert.match(page, /\/api\/links\?type=character-sheet/);
});

test("Registros: cards mantêm URL direta e abrem detalhes em dialog acessível", () => {
  const index = fs.readFileSync("index.html", "utf8");
  const script = fs.readFileSync("js/script.js", "utf8");
  const styles = fs.readFileSync("css/style.css", "utf8");
  assert.match(index, /<dialog class="record-dialog" id="recordDialog" aria-labelledby="dialogTitle"/);
  assert.match(index, /id="dialogSummary"/);
  assert.match(index, /id="dialogMedia"/);
  assert.match(index, /id="dialogDirectLink"/);
  assert.match(script, /href="\/registro\/\$\{encodeURIComponent\(r\.slug\)\}" data-open-record=/);
  assert.match(script, /event\.preventDefault\(\)/);
  assert.match(script, /record\.body \|\| "Descrição não disponível\."/);
  assert.match(script, /dialog\.showModal\(\)/);
  assert.match(script, /dialog\?\.addEventListener\("click", \(event\) => \{ if \(event\.target === dialog\) dialog\.close\(\); \}\)/);
  assert.match(script, /document\.body\.style\.overflow = "hidden"/);
  assert.match(script, /dialog\?\.addEventListener\("close"/);
  assert.match(styles, /\.record-dialog-content \{[^}]*overflow-y: auto/s);
});


test("Modal universal: páginas de registros carregam assets pela raiz e o modal compartilhado", () => {
  for (const file of ["character.html", "characters.html", "monster.html", "event.html", "region.html", "article.html", "lore.html", "index.html"]) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /href="\/css\/style\.css"/, `${file} deve carregar CSS pela raiz`);
    assert.match(html, /src="\/js\/record-modal\.js"/, `${file} deve carregar o modal compartilhado`);
    assert.doesNotMatch(html, /(?:href|src)="(?:css|js)\//, `${file} não deve usar caminhos relativos em rotas limpas`);
  }
  const modal = fs.readFileSync("js/record-modal.js", "utf8");
  for (const route of ["personagens", "bestiario", "grimorio", "registro", "eventos", "mapa", "campanhas"]) {
    assert.ok(modal.includes(route), `modal deve reconhecer ${route}`);
  }
  assert.match(modal, /showModal\(\)/);
  assert.match(modal, /data-open-record/);
});
