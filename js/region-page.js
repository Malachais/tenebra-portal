"use strict";
(async () => {
  const { get, esc, mediaMarkup } = SFA;
  const slug = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
  const target = document.querySelector("#regionDetail");
  try {
    const { region } = await get(`/api/regions/${encodeURIComponent(slug)}`);
    document.title = `${region.name} · Atlas de Tenebra`;
    target.innerHTML = `${mediaMarkup(region.image_url, `Imagem de ${region.name}`, "article-media")}<p class="card-category">Atlas de Tenebra · ᛉ</p><h1>${esc(region.name)}</h1><p>${esc(region.description)}</p><h2>História</h2><p>${esc(region.history || "Ainda não há registros históricos.")}</p><h2>Facções</h2><ul>${(region.factions || []).map(item => `<li>${esc(item)}</li>`).join("") || "<li>Sem facções catalogadas.</li>"}</ul><h2>Criaturas</h2><ul>${(region.creatures || []).map(item => `<li>${esc(item)}</li>`).join("") || "<li>Sem criaturas associadas.</li>"}</ul>`;
  } catch (error) { target.innerHTML = `<p>${esc(error.message)}</p>`; }
})();
