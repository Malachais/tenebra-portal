"use strict";
(() => {
  const list = document.querySelector("#loreEntries");
  if (!list) return;

  const categoryNames = {
    "historia-tenebra": "História de Tenebra",
    personagens: "Personagens",
    bestiario: "Bestiário",
    "classes-habilidades": "Classes e Habilidades",
    "sete-veus": "Os Sete Véus",
    "mapas-regioes": "Mapas e Regiões",
    "regras-rpg": "Regras do RPG",
    reliquias: "Relíquias",
    faccoes: "Facções",
    "racas-povos": "Raças e Povos",
    classes: "Classes",
    habilidades: "Habilidades",
    relatos: "Relatos",
    "aventuras-eventos": "Aventuras e Eventos"
  };
  const filters = document.querySelector("#loreFilters");
  const search = document.querySelector("#loreSearch");
  let category = "";
  let timer;

  function renderFilters() {
    filters.innerHTML = `<button class="filter-chip active" type="button" data-category="" aria-pressed="true">Todas</button>${Object.entries(categoryNames).map(([key, label]) => `<button class="filter-chip" type="button" data-category="${key}" aria-pressed="false">${SFA.esc(label)}</button>`).join("")}`;
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      category = button.dataset.category;
      filters.querySelectorAll("button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      load();
    });
  }

  async function load() {
    list.innerHTML = '<p class="empty-state">Consultando as páginas do Grimório…</p>';
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search.value.trim()) params.set("q", search.value.trim());
    try {
      const query = params.toString();
      const { entries } = await SFA.get(`/api/lore${query ? `?${query}` : ""}`);
      if (!entries.length) {
        list.innerHTML = '<p class="empty-state">Nenhuma página publicada corresponde a esta busca. O arquivo ainda aguarda novos registros.</p>';
        return;
      }
      list.innerHTML = entries.map((entry) => `<article class="portal-entry-card">
        <a class="portal-entry-link" href="/grimorio/${encodeURIComponent(entry.slug)}" aria-label="Ler ${SFA.esc(entry.title)}">
          ${SFA.mediaMarkup(entry.image_url, `Imagem de ${entry.title}`, "portal-entry-media", { ...entry, kind: "lore" })}
          <span class="card-category">${SFA.esc(categoryNames[entry.category] || "Página do Grimório")}</span>
          <strong>${SFA.esc(entry.title)}</strong>
          <span class="portal-entry-summary">${SFA.esc(entry.summary)}</span>
          <span class="portal-entry-more">Abrir página <span aria-hidden="true">↗</span></span>
        </a>
      </article>`).join("");
    } catch (error) {
      list.innerHTML = `<p class="empty-state" role="alert">Não foi possível carregar o Grimório. ${SFA.esc(error.message)}</p>`;
    }
  }

  renderFilters();
  search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(load, 180); });
  load();
})();
