/* Tenebra — visualização universal de registros em janela modal */
"use strict";
(() => {
  if (!window.SFA || document.getElementById("tenebraRecordModal")) return;
  const { get, esc, mediaMarkup, fmtDate, numericDisplay } = window.SFA;
  const routes = [
    [/^\/personagens\/([a-z0-9-]+)\/?$/, "character", slug => `/api/characters/${encodeURIComponent(slug)}`, "character"],
    [/^\/bestiario\/([a-z0-9-]+)\/?$/, "monster", slug => `/api/monsters/${encodeURIComponent(slug)}`, "monster"],
    [/^\/grimorio\/([a-z0-9-]+)\/?$/, "lore", slug => `/api/lore/${encodeURIComponent(slug)}`, "entry"],
    [/^\/registro\/([a-z0-9-]+)\/?$/, "record", slug => `/api/records/${encodeURIComponent(slug)}`, "record"],
    [/^\/eventos\/([a-z0-9-]+)\/?$/, "event", slug => `/api/events/${encodeURIComponent(slug)}`, "event"],
    [/^\/mapa\/([a-z0-9-]+)\/?$/, "region", slug => `/api/regions/${encodeURIComponent(slug)}`, "region"],
    [/^\/campanhas\/([a-z0-9-]+)\/?$/, "campaign", slug => `/api/campaigns/${encodeURIComponent(slug)}`, "campaign"]
  ];
  const dialog = document.createElement("dialog");
  dialog.id = "tenebraRecordModal";
  dialog.className = "tenebra-record-modal";
  dialog.setAttribute("aria-labelledby", "tenebraModalTitle");
  dialog.innerHTML = `<div class="tenebra-modal-frame">
    <button class="tenebra-modal-close" type="button" aria-label="Fechar janela">×</button>
    <p class="eyebrow" id="tenebraModalMeta">Arquivo de Tenebra</p>
    <div id="tenebraModalContent"><p class="empty-state">Consultando o arquivo…</p></div>
    <div class="tenebra-modal-actions"><a class="text-link" id="tenebraModalDirect" href="#">Abrir página completa ↗</a></div>
  </div>`;
  document.body.append(dialog);
  const content = dialog.querySelector("#tenebraModalContent");
  const close = () => dialog.close();
  dialog.querySelector(".tenebra-modal-close").addEventListener("click", close);
  dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && dialog.open) close(); });

  const paragraph = value => value ? `<p>${esc(value).replaceAll("\n", "<br>")}</p>` : "";
  const heading = value => `<h2>${esc(value)}</h2>`;
  function render(kind, item) {
    const title = item.name || item.title || "Registro sem título";
    const summary = item.summary || item.description || "";
    let html = "";
    if (item.image_url) html += mediaMarkup(item.image_url, `Imagem de ${title}`, "tenebra-modal-media", { ...item, kind });
    html += `<p class="card-category">${esc(kindLabel(kind))}${item.created_at ? ` · ${esc(fmtDate(item.created_at, true))}` : ""}${item.author ? ` · por ${esc(item.author)}` : ""}</p><h1 id="tenebraModalTitle">${esc(title)}</h1>`;
    if (summary) html += `<p class="article-summary">${esc(summary)}</p>`;
    if (kind === "character") {
      const stats = [["ST","st"],["DX","dx"],["IQ","iq"],["HT","ht"],["SAN","san"],["Vida","life"]];
      html += `<dl class="character-stats character-stats-public">${stats.map(([label,key]) => `<div><dt>${label}</dt><dd>${esc(numericDisplay(item[key]))}</dd></div>`).join("")}</dl>`;
      html += heading("História") + paragraph(item.backstory || "A história deste personagem ainda não foi registrada.");
      if (item.inventory) html += heading("Inventário") + paragraph(item.inventory);
      if (item.skills) html += heading("Habilidades") + paragraph(item.skills);
      html += `<p class="muted">${[item.race,item.class_name,item.origin,item.veil].filter(Boolean).map(esc).join(" · ")}</p>`;
    } else if (kind === "monster") {
      html += heading("Descrição") + paragraph(item.description);
      html += `<p><strong>Nível de ameaça:</strong> ${esc(item.threat_level || "Não classificado")}</p>`;
      for (const [label,value] of [["Atributos", item.attributes],["Habilidades",item.skills],["História",item.history],["Fraquezas",item.weaknesses]]) {
        if (value && (typeof value !== "object" || Object.keys(value).length)) html += heading(label) + (typeof value === "object" ? `<dl>${Object.entries(value).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(typeof v === "string" ? v : JSON.stringify(v))}</dd>`).join("")}</dl>` : paragraph(value));
      }
    } else if (kind === "lore") {
      html += `<p class="card-category">${esc(String(item.category || "Grimório").replaceAll("-", " "))}</p>` + heading("Registro") + paragraph(item.content);
    } else if (kind === "record") {
      html += heading("Conteúdo") + paragraph(item.body || item.content || "Descrição não disponível.");
    } else if (kind === "region") {
      html += heading("História") + paragraph(item.history);
      for (const [label, value] of [["Facções",item.factions],["Criaturas",item.creatures]]) if (Array.isArray(value) && value.length) html += heading(label) + `<ul>${value.map(v=>`<li>${esc(v)}</li>`).join("")}</ul>`;
    } else if (kind === "campaign") {
      html += `<p class="card-category">Campanha · ${esc(item.status || "Em andamento")}</p>`;
      html += paragraph(item.description);
      html += `<p class="muted">${esc(item.participant_count || 0)} participante(s)</p>`;
    } else if (kind === "event") {
      html += `<p>${esc(fmtDate(item.event_date, true))} · ${esc(({planned:"Planejado",open:"Aberto",in_progress:"Em andamento",completed:"Concluído",archived:"Arquivado"})[item.status] || item.status || "Evento")}</p>`;
      html += paragraph(item.description);
      if (item.master) html += `<p><strong>Mestre:</strong> ${esc(item.master)}</p>`;
      if (Array.isArray(item.participants) && item.participants.length) html += heading("Participantes") + `<ul>${item.participants.map(p=>`<li>${esc(p.username || p)}</li>`).join("")}</ul>`;
    }
    return html;
  }
  function kindLabel(kind) {
    return ({character:"Personagem",monster:"Bestiário",lore:"Grimório",record:"Registro",event:"Evento",region:"Região",campaign:"Campanha"})[kind] || "Registro";
  }
  let requestId = 0;
  document.addEventListener("click", async event => {
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("data-open-record") || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.hasAttribute("download")) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    const route = routes.find(([pattern]) => pattern.test(url.pathname));
    if (!route) return;
    const match = url.pathname.match(route[0]);
    if (!match) return;
    event.preventDefault();
    const current = ++requestId;
    dialog.querySelector("#tenebraModalMeta").textContent = "Arquivo de Tenebra · consultando";
    content.innerHTML = `<p class="empty-state" role="status">Consultando o arquivo…</p>`;
    dialog.querySelector("#tenebraModalDirect").href = url.pathname;
    if (!dialog.open) dialog.showModal();
    try {
      const result = await get(route[2](match[1]));
      if (current !== requestId) return;
      const item = result[route[3]];
      if (!item) throw new Error("Registro não encontrado.");
      dialog.querySelector("#tenebraModalMeta").textContent = `${kindLabel(route[1])} · Tenebra`;
      content.innerHTML = render(route[1], item);
      const title = content.querySelector("#tenebraModalTitle");
      if (title) dialog.setAttribute("aria-labelledby", title.id);
    } catch (error) {
      if (current !== requestId) return;
      content.innerHTML = `<p class="empty-state" role="alert">${esc(error.message || "Não foi possível consultar este registro.")}</p>`;
    }
  });
})();
