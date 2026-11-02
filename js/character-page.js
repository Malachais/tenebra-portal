"use strict";
(async function loadPublicCharacter() {
  const title = document.querySelector("#characterTitle");
  const summary = document.querySelector("#characterSummary");
  const error = document.querySelector("#characterError");
  const statusLabels = { draft: "Rascunho", private: "Ficha privada", restricted: "Acesso restrito", public: "Personagem público" };
  try {
    const slug = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
    if (!slug) throw new Error("Este endereço não identifica um personagem.");
    const { character } = await SFA.get(`/api/characters/${encodeURIComponent(slug)}`);
    const details = [character.race, character.class_name, character.origin, character.veil].filter(Boolean).map(SFA.esc).join(" · ");
    title.textContent = character.name;
    document.title = `${character.name} — Personagens de Tenebra`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = character.summary || character.title || `Personagem do universo de Tenebra: ${character.name}.`;
    document.querySelector("#characterMeta").innerHTML = `${SFA.esc(statusLabels[character.status] || "Personagem")}${character.published_at ? ` · publicado em ${SFA.esc(SFA.fmtDate(character.published_at, true))}` : ""}`;
    summary.textContent = character.summary || character.title || "";
    summary.hidden = !summary.textContent;
    document.querySelector("#characterMedia").innerHTML = SFA.mediaMarkup(character.image_url, `Imagem de ${character.name}`, "article-media");
    const statLabels = [["ST", "st"], ["DX", "dx"], ["IQ", "iq"], ["HT", "ht"], ["SAN", "san"], ["Vida", "life"]];
    const stats = document.querySelector("#characterStats");
    stats.innerHTML = statLabels.map(([label, key]) => `<div><dt>${label}</dt><dd>${SFA.esc(SFA.numericDisplay(character[key]))}</dd></div>`).join("") + (details ? `<div class="character-details"><dt>Ficha</dt><dd>${details}</dd></div>` : "");
    stats.hidden = false;
    document.querySelector("#characterBackstory").textContent = character.backstory || "A história deste personagem ainda não foi registrada no arquivo.";
    for (const [id, block, value] of [["characterInventory", "characterInventoryBlock", character.inventory], ["characterSkills", "characterSkillsBlock", character.skills]]) {
      document.querySelector(`#${id}`).textContent = value || "";
      document.querySelector(`#${block}`).hidden = !value;
    }
    const actions = document.querySelector("#characterOwnerActions");
    if (character.can_edit) {
      actions.innerHTML = `<a class="text-link" href="/#personagens">Editar esta ficha na minha conta ↗</a>`;
      actions.hidden = false;
    }
    const related = document.querySelector("#characterRelated");
    try {
      const { links } = await SFA.get(`/api/links?type=character-sheet&id=${encodeURIComponent(character.id)}`);
      if (links.length) {
        related.innerHTML = `<h2>Registros relacionados</h2><div class="related-links">${links.map(link => `<a class="related-link" href="${SFA.esc(link.href)}"><span class="card-category">${SFA.esc(link.relation)} · ${SFA.esc(link.kind)}</span><strong>${SFA.esc(link.title)}</strong><span>${SFA.esc(link.summary)}</span></a>`).join("")}</div>`;
        related.hidden = false;
      }
    } catch { related.hidden = true; }
  } catch (err) {
    title.textContent = "Personagem indisponível";
    summary.hidden = true;
    document.querySelector("#characterBackstory").textContent = "";
    document.querySelector("#characterStats").hidden = true;
    error.textContent = err.status === 404 ? "Este personagem não existe, é privado ou ainda não foi publicado." : err.message;
    error.hidden = false;
  }
})();
