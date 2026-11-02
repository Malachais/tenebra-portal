"use strict";
(async function loadArticle() {
  const title = document.querySelector("#articleTitle");
  const error = document.querySelector("#articleError");
  try {
    const slug = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
    if (!slug) throw new Error("Este endereço não identifica um registro.");
    const { record } = await SFA.get(`/api/records/${encodeURIComponent(slug)}`);
    const category = SFA.CATEGORIES[record.category];
    title.textContent = record.title;
    document.title = `${record.title} — Arquivo de Tenebra`;
    document.querySelector('meta[name="description"]').content = record.summary;
    document.querySelector("#articleMeta").textContent = `${category?.kind || "Registro"} · ${SFA.fmtDate(record.created_at, true)}${record.author ? ` · por ${record.author}` : ""}`;
    document.querySelector("#articleSummary").textContent = record.summary;
    document.querySelector("#articleContent").textContent = record.body;
    document.querySelector("#articleMedia").innerHTML = SFA.mediaMarkup(record.image_url, `Imagem associada ao registro ${record.title}`, "article-media");
  } catch (err) {
    title.textContent = "Registro indisponível";
    document.querySelector("#articleContent").textContent = "";
    error.textContent = err.status === 404 ? "Este registro não existe ou não está publicado." : err.message;
    error.hidden = false;
  }
})();
