"use strict";
(async function loadLorePage() {
  const title = document.querySelector("#loreTitle");
  const error = document.querySelector("#loreError");
  try {
    const slug = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
    if (!slug) throw new Error("Este endereço não identifica uma página do Grimório.");
    const { entry } = await SFA.get(`/api/lore/${encodeURIComponent(slug)}`);
    title.textContent = entry.title;
    document.title = `${entry.title} — Grimório de Tenebra`;
    document.querySelector('meta[name="description"]').content = entry.summary;
    document.querySelector("#loreMeta").textContent = `${entry.category.replaceAll("-", " ")} · ${SFA.fmtDate(entry.created_at, true)} · por ${entry.author}`;
    document.querySelector("#loreSummary").textContent = entry.summary;
    document.querySelector("#loreContent").textContent = entry.content;
    document.querySelector("#loreMedia").innerHTML = SFA.mediaMarkup(entry.image_url, `Imagem associada a ${entry.title}`, "article-media");
  } catch (err) {
    title.textContent = "Página indisponível";
    document.querySelector("#loreContent").textContent = "";
    error.textContent = err.status === 404 ? "Esta página não existe ou ainda não foi publicada." : err.message;
    error.hidden = false;
  }
})();
