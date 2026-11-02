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
