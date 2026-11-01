"use strict";
(async function loadMonster() {
  const title = document.querySelector("#monsterTitle");
  const error = document.querySelector("#monsterError");
  try {
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) throw new Error("Este endereço não identifica uma criatura.");
    const { monster } = await SFA.get(`/api/monsters/${encodeURIComponent(slug)}`);
    title.textContent = monster.name;
    document.title = `${monster.name} — Bestiário de Tenebra`;
    document.querySelector('meta[name="description"]').content = monster.description;
    document.querySelector("#monsterMeta").textContent = `Observação de campo · ${SFA.fmtDate(monster.created_at, true)} · por ${monster.author}`;
    document.querySelector("#monsterDescription").textContent = monster.description;
    document.querySelector("#monsterThreat").textContent = `Nível de ameaça: ${monster.threat_level || "não classificado"}`;
    for (const [id, value] of [["monsterSkills", monster.skills], ["monsterHistory", monster.history], ["monsterWeaknesses", monster.weaknesses]]) {
      document.querySelector(`#${id}`).textContent = value || "Ainda não registrado no arquivo.";
    }
    const attributes = monster.attributes && typeof monster.attributes === "object" && !Array.isArray(monster.attributes) ? monster.attributes : {};
    const list = document.querySelector("#monsterAttributes");
    const pairs = Object.entries(attributes);
    list.innerHTML = pairs.length ? pairs.map(([name, value]) => `<dt>${SFA.esc(name)}</dt><dd>${SFA.esc(typeof value === "string" ? value : JSON.stringify(value))}</dd>`).join("") : "<dt>Atributos</dt><dd>Ainda não registrados.</dd>";
    document.querySelector("#monsterMedia").innerHTML = SFA.mediaMarkup(monster.image_url, `Imagem de ${monster.name}`, "article-media");
  } catch (err) {
    title.textContent = "Criatura indisponível";
    error.textContent = err.status === 404 ? "Esta criatura não existe ou ainda não foi publicada." : err.message;
    error.hidden = false;
  }
})();
