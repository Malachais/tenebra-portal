"use strict";
(async () => {
  const root = document.querySelector("#relatedLinks");
  if (!root) return;
  const type = root.dataset.entityType;
  const id = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
  try {
    const { links } = await SFA.get(`/api/links?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`);
    if (!links.length) { root.hidden = true; return; }
    root.innerHTML = `<h2>Registros relacionados</h2><div class="related-links">${links.map(link => `<a class="related-link" href="${SFA.esc(link.href)}"><span class="card-category">${SFA.esc(link.relation)} · ${SFA.esc(link.kind)}</span><strong>${SFA.esc(link.title)}</strong><span>${SFA.esc(link.summary)}</span></a>`).join("")}</div>`;
  } catch { root.hidden = true; }
})();
