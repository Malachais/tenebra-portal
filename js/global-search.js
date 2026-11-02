"use strict";
/* Busca global do Portal de Tenebra: NAV, Ctrl+K, debounce e resultados agrupados. */
(() => {
  const nav = document.querySelector(".main-nav");
  const header = document.querySelector(".site-header");
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  if (!nav && !header) return;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "nav-search-trigger";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", "globalSearchDialog");
  trigger.innerHTML = '<span aria-hidden="true">⌕</span><span class="nav-search-label">Buscar</span><kbd aria-hidden="true">Ctrl K</kbd>';
  trigger.setAttribute("aria-label", "Abrir busca global (Ctrl+K)");
  if (nav) {
    const stamp = nav.querySelector(".nav-stamp");
    nav.insertBefore(trigger, stamp || null);
  } else {
    trigger.classList.add("global-search-fab");
    document.body.append(trigger);
  }

  const dialog = document.createElement("dialog");
  dialog.id = "globalSearchDialog";
  dialog.className = "global-search-dialog";
  dialog.setAttribute("aria-labelledby", "globalSearchDialogTitle");
  dialog.innerHTML = `
    <div class="gs-head">
      <div><p class="eyebrow">Índice transversal · ᛟ</p><h2 id="globalSearchDialogTitle">Buscar no <em>arquivo</em></h2></div>
      <form method="dialog"><button class="gs-close" aria-label="Fechar busca">✕</button></form>
    </div>
    <label class="gs-field"><span aria-hidden="true">⌕</span><input id="globalSearchInput" type="search" maxlength="100" autocomplete="off" spellcheck="false" placeholder="Personagem, criatura, região, regra, evento…" aria-label="Buscar em todo o portal" role="combobox" aria-expanded="false" aria-controls="globalSearchDialogResults"></label>
    <p class="gs-hint" id="globalSearchHint">Digite pelo menos dois caracteres. A busca consulta registros, Grimório, criaturas, personagens, regiões, eventos e páginas do portal.</p>
    <div id="globalSearchDialogResults" class="gs-results" role="listbox" aria-live="polite"></div>
    <div class="gs-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Esc</kbd> fechar</span><span>Conteúdo publicado apenas</span></div>`;
  document.body.append(dialog);

  const input = dialog.querySelector("#globalSearchInput");
  const results = dialog.querySelector("#globalSearchDialogResults");
  const hint = dialog.querySelector("#globalSearchHint");
  let timer = null;
  let controller = null;
  let requestId = 0;
  let lastFocused = null;

  const accent = { a: "[aáàâãä]", e: "[eéèêë]", i: "[iíìîï]", o: "[oóòôõö]", u: "[uúùûü]", c: "[cç]", n: "[nñ]" };
  function highlight(text, query) {
    const safe = esc(text);
    const tokens = String(query).trim().split(/\s+/).filter(Boolean).slice(0, 8);
    if (!tokens.length) return safe;
    const patterns = tokens.map((token) => [...token].map((char) => {
      const lower = char.toLowerCase();
      if (accent[lower]) return accent[lower];
      return lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("")).filter(Boolean);
    if (!patterns.length) return safe;
    try { return safe.replace(new RegExp(`(${patterns.join("|")})`, "gi"), "<mark>$1</mark>"); }
    catch { return safe; }
  }

  function renderMessage(message, isError = false) {
    results.innerHTML = `<p class="gs-message${isError ? " is-error" : ""}" role="${isError ? "alert" : "status"}">${esc(message)}</p>`;
    input.setAttribute("aria-expanded", "false");
  }

  function renderResults(entries, query, hasMore) {
    if (!entries.length) {
      renderMessage(`Nenhum conteúdo publicado corresponde a “${query}”. Tente outro termo ou confira os registros e o Grimório.`);
      return;
    }
    const groups = new Map();
    entries.forEach((entry) => {
      const kind = entry.kind || "Conteúdo";
      if (!groups.has(kind)) groups.set(kind, []);
      groups.get(kind).push(entry);
    });
    const total = entries.length;
    hint.textContent = `${total} resultado${total === 1 ? "" : "s"}${hasMore ? " (há mais resultados; refine a busca)" : ""}.`;
    results.innerHTML = [...groups.entries()].map(([kind, items]) => `
      <section class="gs-group" aria-label="${esc(kind)}">
        <h3 class="gs-group-title">${esc(kind)} <span>${items.length}</span></h3>
        ${items.map((entry) => `<a class="gs-result" role="option" href="${esc(entry.href)}">
          <span class="gs-result-copy"><strong>${highlight(entry.title, query)}</strong><span>${highlight(entry.summary, query)}</span></span>
          <span class="gs-result-arrow" aria-hidden="true">↗</span>
        </a>`).join("")}
      </section>`).join("");
    input.setAttribute("aria-expanded", "true");
  }

  async function run(query) {
    const id = ++requestId;
    if (controller) controller.abort();
    controller = new AbortController();
    results.innerHTML = '<p class="gs-message" role="status">Consultando o arquivo…</p>';
    input.setAttribute("aria-expanded", "false");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=24`, {
        signal: controller.signal, credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Não foi possível consultar o arquivo agora.");
      const data = await response.json();
      if (id !== requestId) return;
      renderResults(Array.isArray(data.results) ? data.results : [], query, !!data.hasMore);
    } catch (error) {
      if (error.name === "AbortError") return;
      if (id !== requestId) return;
      renderMessage(error.message || "Falha ao consultar a busca.", true);
    }
  }

  function scheduleSearch() {
    clearTimeout(timer);
    const query = input.value.trim();
    if (query.length < 2) {
      requestId += 1;
      if (controller) controller.abort();
      hint.textContent = "Digite pelo menos dois caracteres. A busca consulta registros, Grimório, criaturas, personagens, regiões, eventos e páginas do portal.";
      renderMessage("O arquivo aguarda um termo de busca.");
      return;
    }
    timer = setTimeout(() => run(query), 180);
  }

  function openSearch() {
    lastFocused = document.activeElement;
    if (!dialog.open) dialog.showModal();
    const selection = String(window.getSelection?.() || "").trim();
    if (selection && selection.length <= 100) input.value = selection;
    input.focus();
    input.select();
    scheduleSearch();
  }

  trigger.addEventListener("click", openSearch);
  input.addEventListener("input", scheduleSearch);
  input.addEventListener("keydown", (event) => {
    const items = [...results.querySelectorAll(".gs-result")];
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") { event.preventDefault(); (items[index + 1] || items[0]).focus(); }
    if (event.key === "ArrowUp") { event.preventDefault(); (items[index - 1] || items.at(-1)).focus(); }
  });
  results.addEventListener("click", (event) => { if (event.target.closest(".gs-result")) dialog.close(); });
  dialog.addEventListener("close", () => { if (lastFocused instanceof HTMLElement) lastFocused.focus(); });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
  });

  window.SFA = window.SFA || {};
  window.SFA.openSearch = openSearch;
})();
