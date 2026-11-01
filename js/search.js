"use strict";
(() => {
  const input = document.querySelector("#globalSearch");
  const results = document.querySelector("#globalSearchResults");
  if (!input || !results) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const query = input.value.trim();
    if (!query) {
      results.innerHTML = '<p class="muted">Pesquise no Grimório, Bestiário, Atlas, eventos e registros.</p>';
      return;
    }
    results.innerHTML = '<p class="muted">Consultando o arquivo…</p>';
    timer = setTimeout(async () => {
      try {
        const { results: entries } = await SFA.get(`/api/search?q=${encodeURIComponent(query)}`);
        results.innerHTML = entries.length ? entries.map(entry => `<a class="global-search-result" href="${SFA.esc(entry.href)}"><span class="card-category">${SFA.esc(entry.kind)}</span><strong>${SFA.esc(entry.title)}</strong><span>${SFA.esc(entry.summary)}</span></a>`).join("") : '<p class="muted">Nenhum conteúdo publicado corresponde à busca.</p>';
      } catch (error) {
        results.innerHTML = `<p class="muted" role="alert">${SFA.esc(error.message)}</p>`;
      }
    }, 220);
  });
})();
