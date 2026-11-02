"use strict";
(() => {
  const roots = [...document.querySelectorAll("#publicCharacterEntries")];
  if (!roots.length) return;
  const search = document.querySelector("#characterSearch");
  const status = document.querySelector("#publicCharactersStatus");
  const { esc, mediaMarkup } = SFA;

  function card(character) {
    const details = [character.race, character.class_name, character.origin].filter(Boolean).map(esc).join(" · ");
    return `<article class="portal-card public-character-card">
      ${mediaMarkup(character.image_url, `Imagem de ${character.name}`, "public-character-media")}
      <p class="card-category">Personagem do universo</p>
      <h3><a href="/personagens/${encodeURIComponent(character.slug)}">${esc(character.name)}</a></h3>
      ${character.title ? `<p class="public-character-title">${esc(character.title)}</p>` : ""}
      ${details ? `<p class="public-character-details">${details}</p>` : ""}
      <p class="public-character-summary">${esc(character.summary || "O arquivo ainda não registrou um resumo para este personagem.")}</p>
      <a class="text-link" href="/personagens/${encodeURIComponent(character.slug)}">Abrir ficha pública ↗</a>
    </article>`;
  }

  async function load(query = "") {
    if (status) { status.hidden = false; status.textContent = "Consultando o elenco do universo…"; }
    try {
      const { characters } = await SFA.get(`/api/characters${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      for (const root of roots) {
        const limit = Number(root.dataset.limit) || characters.length;
        root.innerHTML = characters.length
          ? characters.slice(0, limit).map(card).join("")
          : `<p class="empty-state">${query ? "Nenhum personagem público corresponde a esta busca." : "O elenco público ainda não possui personagens. Fichas privadas permanecem protegidas."}</p>`;
      }
      if (status) status.hidden = characters.length > 0 || !!query;
    } catch (error) {
      for (const root of roots) root.innerHTML = `<p class="empty-state">Não foi possível carregar o elenco agora. ${esc(error.message)}</p>`;
      if (status) status.hidden = true;
    }
  }

  load();
  if (search) {
    let timer;
    search.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => load(search.value.trim()), 250);
    });
  }
})();
