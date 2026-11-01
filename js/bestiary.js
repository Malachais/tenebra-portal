"use strict";
(() => {
  const target = document.querySelector("#monsterEntries");
  if (!target) return;
  const search = document.querySelector("#monsterSearch");
  let timer;

  async function load() {
    target.innerHTML = '<p class="empty-state">Consultando os relatos de campo…</p>';
    const query = new URLSearchParams({ q: search.value.trim() }).toString();
    try {
      const { monsters } = await SFA.get(`/api/monsters${query ? `?${query}` : ""}`);
      if (!monsters.length) {
        target.innerHTML = '<p class="empty-state">Nenhuma criatura corresponde à busca. Há mais sombras por catalogar.</p>';
        return;
      }
      target.innerHTML = monsters.map((monster) => `<article class="monster-card">
        <a href="/bestiario/${encodeURIComponent(monster.slug)}" class="monster-card-link" aria-label="Abrir ficha de ${SFA.esc(monster.name)}">
          ${SFA.mediaMarkup(monster.image_url, `Imagem de ${monster.name}`, "monster-media")}
          <span class="monster-threat">Ameaça · ${SFA.esc(monster.threat_level || "não classificada")}</span>
          <strong>${SFA.esc(monster.name)}</strong>
          <span class="monster-description">${SFA.esc(monster.description)}</span>
          <span class="portal-entry-more">Ler observação <span aria-hidden="true">↗</span></span>
        </a>
      </article>`).join("");
    } catch (error) {
      target.innerHTML = `<p class="empty-state" role="alert">Não foi possível carregar o Bestiário. ${SFA.esc(error.message)}</p>`;
    }
  }

  search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(load, 180); });
  load();
})();
