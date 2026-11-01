"use strict";

const $ = (s) => document.querySelector(s);
const { esc, CATEGORIES, fmtDate } = SFA;
let records = [];
let tab = "todos";
let editingId = null;
let loreEntries = [];
let editingLoreId = null;
let monsters = [];
let editingMonsterId = null;
let currentAdminId = null;
let users = [];
const LORE_CATEGORIES = {
  "historia-tenebra": "História de Tenebra", personagens: "Personagens", bestiario: "Bestiário",
  "classes-habilidades": "Classes e Habilidades", "sete-veus": "Os Sete Véus",
  "mapas-regioes": "Mapas e Regiões", "regras-rpg": "Regras do RPG", reliquias: "Relíquias",
  faccoes: "Facções", "racas-povos": "Raças e Povos", classes: "Classes",
  habilidades: "Habilidades", relatos: "Relatos", "aventuras-eventos": "Aventuras e Eventos"
};

function flash(msg, type = "ok") {
  const el = $("#flash");
  el.textContent = msg;
  el.className = "flash flash-" + type;
  el.hidden = false;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => { el.hidden = true; }, 5000);
}

function toLogin() { location.replace("login.html"); }
function toLocalDateTime(value) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
async function guarded(fn) {
  try { return await fn(); }
  catch (err) {
    if (err.status === 401) return toLogin();
    flash(err.message, "err");
  }
}

/* ---------- Dados ---------- */
async function reload() {
  const data = await SFA.get("/api/admin/records");
  records = data.records;
  render();
}

async function reloadLore() {
  const data = await SFA.get("/api/admin/lore");
  loreEntries = data.entries;
  const target = $("#loreAdminList");
  target.innerHTML = loreEntries.length ? loreEntries.map((entry) => `
    <article class="admin-lore-card">
      <p class="card-category">${esc(LORE_CATEGORIES[entry.category] || entry.category)} · ${entry.published ? "Publicado" : "Rascunho"}</p>
      <h3>${esc(entry.title)}</h3>
      <p>${esc(entry.summary)}</p>
      <div class="admin-lore-actions">
        ${entry.published ? `<a class="btn" href="/grimorio/${encodeURIComponent(entry.slug)}" target="_blank" rel="noopener">Ver página ↗</a>` : ""}
        <button class="btn" type="button" data-lore-act="edit" data-id="${entry.id}">Editar</button>
        <button class="btn btn-danger" type="button" data-lore-act="delete" data-id="${entry.id}">Remover</button>
      </div>
    </article>`).join("") : '<p class="muted">Ainda não há páginas. Crie a primeira entrada do Grimório.</p>';
}

async function reloadMonsters() {
  const data = await SFA.get("/api/admin/monsters");
  monsters = data.monsters;
  $("#monsterAdminList").innerHTML = monsters.length ? monsters.map((monster) => `
    <article class="admin-lore-card">
      <p class="card-category">${esc(monster.threat_level || "Ameaça não classificada")} · ${monster.published ? "Publicado" : "Rascunho"}</p>
      <h3>${esc(monster.name)}</h3><p>${esc(monster.description)}</p>
      <div class="admin-lore-actions">
        ${monster.published ? `<a class="btn" href="/bestiario/${encodeURIComponent(monster.slug)}" target="_blank" rel="noopener">Ver ficha ↗</a>` : ""}
        <button class="btn" type="button" data-monster-act="edit" data-id="${monster.id}">Editar</button>
        <button class="btn btn-danger" type="button" data-monster-act="delete" data-id="${monster.id}">Remover</button>
      </div>
    </article>`).join("") : '<p class="muted">Ainda não há criaturas catalogadas.</p>';
}

async function reloadDashboard() {
  const { stats } = await SFA.get("/api/admin/dashboard");
  const items = [["Registros publicados", stats.published_records], ["Páginas do Grimório", stats.lore_pages], ["Criaturas", stats.monsters], ["Usuários", stats.users], ["Mensagens", stats.community_messages], ["Personagens", stats.characters], ["Eventos", stats.events]];
  $("#dashboardStats").innerHTML = items.map(([label, value]) => `<article class="dashboard-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></article>`).join("");
}

async function reloadEvents() {
  const { events } = await SFA.get("/api/admin/events");
  $("#adminEvents").innerHTML = events.map((e) => `<article class="admin-lore-card"><p class="card-category">${esc(e.status)} · ${esc(fmtDate(e.event_date,true))}</p><h3>${esc(e.title)}</h3><p>${esc(e.participant_count)} participante(s) · Mestre ${esc(e.master)}</p>${e.status!=='archived'?`<button class="btn" data-event-cancel="${e.id}" type="button">Arquivar evento</button>`:''}</article>`).join("") || '<p class="muted">Nenhum evento cadastrado.</p>';
  const select = $("#eventMaster"); select.innerHTML = users.map(u => `<option value="${u.id}">${esc(u.username)}</option>`).join("");
}
async function reloadCampaigns() {
  const { campaigns } = await SFA.get("/api/admin/campaigns");
  const statuses = { planned: "Planejada", open: "Aberta", in_progress: "Em andamento", completed: "Concluída", archived: "Arquivada" };
  $("#adminCampaigns").innerHTML = campaigns.map(c => `<article class="admin-lore-card" data-campaign-id="${c.id}"><p class="card-category">${c.published ? "Publicado" : "Rascunho"}</p><label class="field"><span>Título</span><input data-campaign-title maxlength="160" value="${esc(c.title)}"></label><label class="field"><span>Descrição</span><textarea data-campaign-description maxlength="10000">${esc(c.description)}</textarea></label><label class="field"><span>Status</span><select data-campaign-status>${Object.entries(statuses).map(([key,label])=>`<option value="${key}" ${key===c.status?"selected":""}>${label}</option>`).join("")}</select></label><label class="check"><input data-campaign-published type="checkbox" ${c.published?"checked":""}><span>Publicada</span></label><button class="btn" data-campaign-save type="button">Salvar campanha</button></article>`).join("") || '<p class="muted">Nenhuma campanha cadastrada.</p>';
}
async function reloadRegions() {
 const { regions } = await SFA.get("/api/admin/regions");
 $("#adminRegions").innerHTML = regions.map(r => `<article class="admin-lore-card"><p class="card-category">${r.published?'Publicado':'Rascunho'}</p><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><a class="btn" href="/mapa/${encodeURIComponent(r.slug)}" target="_blank">Ver região ↗</a>${r.published?` <button class="btn btn-danger" type="button" data-region-archive="${r.id}">Arquivar</button>`:''}</article>`).join("") || '<p class="muted">Nenhuma região cadastrada.</p>';
}

async function reloadUsers() {
  const data = await SFA.get("/api/admin/users");
  users = data.users;
  const labels = { user: "Usuário", moderator: "Moderador", admin: "Administrador", editor: "Arquivista" };
  $("#usersBody").innerHTML = users.map((user) => `<tr>
    <td><strong>${esc(user.username)}</strong></td>
    <td><select aria-label="Função de ${esc(user.username)}" data-user-role="${user.id}" ${Number(user.id) === Number(currentAdminId) ? "disabled" : ""}>${Object.entries(labels).map(([role, label]) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${label}</option>`).join("")}</select></td>
    <td>${esc(fmtDate(user.created_at))}</td>
    <td><button class="btn" type="button" data-save-role="${user.id}" ${Number(user.id) === Number(currentAdminId) ? "disabled" : ""}>Salvar função</button></td>
  </tr>`).join("");
}

async function reloadAchievements() {
 const [{achievements},userData]=await Promise.all([SFA.get("/api/admin/achievements"),SFA.get("/api/admin/users")]);
 $("#achievementList").innerHTML=achievements.map(a=>`<article class="admin-lore-card"><h3>${esc(a.name)}</h3><p>${esc(a.description)}</p></article>`).join("")||'<p class="muted">Nenhuma conquista cadastrada.</p>';
 $("#awardUser").innerHTML=userData.users.map(u=>`<option value="${u.id}">${esc(u.username)}</option>`).join("");
 $("#awardAchievement").innerHTML=achievements.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join("");
}
$("#achievementForm").addEventListener("submit",async e=>{e.preventDefault();try{await SFA.post("/api/admin/achievements",{name:$("#achievementName").value,description:$("#achievementDescription").value});e.target.reset();await reloadAchievements();flash("Conquista cadastrada.")}catch(err){flash(err.message,"err")}});
$("#awardForm").addEventListener("submit",async e=>{e.preventDefault();try{await SFA.post("/api/admin/achievements/award",{user_id:Number($("#awardUser").value),achievement_id:Number($("#awardAchievement").value)});flash("Conquista concedida ao perfil.")}catch(err){flash(err.message,"err")}});

async function reloadCommunity() {
  const { messages } = await SFA.get("/api/admin/community/messages");
  $("#adminCommunityMessages").innerHTML = messages.length ? messages.map((message) => `<article class="admin-community-item" data-message-id="${message.id}">
    <header><strong>${esc(message.author)}</strong><span class="community-role">${esc(message.role)}</span><time>${esc(fmtDate(message.created_at, true))}</time></header>
    <p>${esc(message.content)}</p><button class="btn btn-danger" type="button" data-remove-message="${message.id}">Remover</button>
  </article>`).join("") : '<p class="muted">Ainda não há mensagens comunitárias.</p>';
}

function render() {
  /* cartões por categoria */
  $("#catStats").innerHTML = Object.entries(CATEGORIES).map(([k, c]) => {
    const list = records.filter((r) => r.category === k);
    const pub = list.filter((r) => r.published).length;
    return `<button class="stat-box stat-cat ${tab === k ? "on" : ""}" data-tab="${esc(k)}" type="button">
      <span class="stat-sym">${esc(c.symbol)}</span>
      <span class="stat-number">${list.length}</span>
      <span class="stat-label">${esc(c.label)} · ${pub} publicado${pub === 1 ? "" : "s"}</span>
    </button>`;
  }).join("");

  /* abas */
  const tabs = [["todos", "Todos", records.length], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.label, records.filter((r) => r.category === k).length])];
  $("#tabs").innerHTML = tabs.map(([k, label, n]) =>
    `<button class="tab ${tab === k ? "active" : ""}" role="tab" aria-selected="${tab === k}" data-tab="${esc(k)}" type="button">${esc(label)} <b>${n}</b></button>`).join("");

  /* tabela */
  const list = tab === "todos" ? records : records.filter((r) => r.category === tab);
  $("#recordsBody").innerHTML = list.length ? list.map((r) => `
    <tr>
      <td class="nowrap">${esc(fmtDate(r.created_at))}</td>
      <td><strong>${esc(r.title)}</strong><small>${esc(r.summary)}</small></td>
      <td>${esc(CATEGORIES[r.category]?.label || r.category)}</td>
      <td><span class="badge ${r.published ? "badge-on" : "badge-off"}">${r.published ? "Publicado" : "Rascunho"}</span></td>
      <td class="right actions">
        <button class="btn" data-act="edit" data-id="${r.id}">Editar</button>
        <button class="btn" data-act="toggle" data-id="${r.id}">${r.published ? "Ocultar" : "Publicar"}</button>
        <button class="btn btn-danger" data-act="delete" data-id="${r.id}">Remover</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="5" class="muted">Nenhum registro${tab === "todos" ? "" : " nesta categoria"} ainda. Use “Novo registro”.</td></tr>`;
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-tab]");
  if (t) { tab = t.dataset.tab; render(); }
});

$("#recordsBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const rec = records.find((r) => Number(r.id) === id);
  if (!rec) return;

  if (btn.dataset.act === "edit") openEditor(rec);
  if (btn.dataset.act === "toggle") guarded(async () => {
    await SFA.post(`/api/admin/records/${id}/toggle`);
    await reload();
    flash(rec.published ? "Registro ocultado do site." : "Registro publicado no site.");
  });
  if (btn.dataset.act === "delete" && confirm(`Remover “${rec.title}” definitivamente? Isso apaga do banco e do site.`)) guarded(async () => {
    await SFA.del(`/api/admin/records/${id}`);
    await reload();
    flash("Registro removido.");
  });
});

/* ---------- Grimório digital ---------- */
const loreDialog = $("#loreEditDialog");
$("#loreCategoryField").innerHTML = Object.entries(LORE_CATEGORIES).map(([key, label]) => `<option value="${esc(key)}">${esc(label)}</option>`).join("");

function openLoreEditor(entry = null) {
  editingLoreId = entry?.id ?? null;
  $("#loreEditEyebrow").textContent = entry ? "Editar página" : "Nova página";
  $("#loreEditHeading").textContent = entry ? "Editar página do Grimório" : "Nova página do Grimório";
  $("#loreTitleField").value = entry?.title ?? "";
  $("#loreCategoryField").value = entry?.category ?? "historia-tenebra";
  $("#loreSummaryField").value = entry?.summary ?? "";
  $("#loreImageField").value = entry?.image_url ?? "";
  $("#loreTimelineField").value = toLocalDateTime(entry?.timeline_at);
  $("#loreContentField").value = entry?.content ?? "";
  $("#lorePublishedField").checked = !!entry?.published;
  $("#loreEditError").hidden = true;
  loreDialog.showModal();
  $("#loreTitleField").focus();
}

$("#newLoreBtn").addEventListener("click", () => openLoreEditor());
$("#loreEditClose").addEventListener("click", () => loreDialog.close());
$("#loreEditCancel").addEventListener("click", () => loreDialog.close());
$("#loreAdminList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lore-act]");
  if (!button) return;
  const entry = loreEntries.find((item) => Number(item.id) === Number(button.dataset.id));
  if (!entry) return;
  if (button.dataset.loreAct === "edit") openLoreEditor(entry);
  if (button.dataset.loreAct === "delete" && confirm(`Remover “${entry.title}” do Grimório? Esta ação não pode ser desfeita.`)) guarded(async () => {
    await SFA.del(`/api/admin/lore/${entry.id}`);
    await reloadLore();
    flash("Página removida do Grimório.");
  });
});

$("#loreEditForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: $("#loreTitleField").value, category: $("#loreCategoryField").value,
    summary: $("#loreSummaryField").value, image_url: $("#loreImageField").value, timeline_at: $("#loreTimelineField").value || null,
    content: $("#loreContentField").value, published: $("#lorePublishedField").checked
  };
  try {
    if (editingLoreId) await SFA.put(`/api/admin/lore/${editingLoreId}`, payload);
    else await SFA.post("/api/admin/lore", payload);
    loreDialog.close();
    await reloadLore();
    flash(editingLoreId ? "Página do Grimório atualizada." : "Página adicionada ao Grimório.");
  } catch (error) {
    if (error.status === 401) return toLogin();
    $("#loreEditError").textContent = error.message;
    $("#loreEditError").hidden = false;
  }
});

/* ---------- Bestiário ---------- */
const monsterDialog = $("#monsterEditDialog");
function openMonsterEditor(monster = null) {
  editingMonsterId = monster?.id ?? null;
  $("#monsterEditHeading").textContent = monster ? "Editar criatura" : "Nova criatura";
  $("#monsterNameField").value = monster?.name ?? "";
  $("#monsterThreatField").value = monster?.threat_level ?? "";
  $("#monsterImageField").value = monster?.image_url ?? "";
  $("#monsterDescriptionField").value = monster?.description ?? "";
  $("#monsterAttributesField").value = JSON.stringify(monster?.attributes ?? {}, null, 2);
  $("#monsterSkillsField").value = monster?.skills ?? "";
  $("#monsterHistoryField").value = monster?.history ?? "";
  $("#monsterWeaknessesField").value = monster?.weaknesses ?? "";
  $("#monsterPublishedField").checked = !!monster?.published;
  $("#monsterEditError").hidden = true;
  monsterDialog.showModal();
  $("#monsterNameField").focus();
}

$("#newMonsterBtn").addEventListener("click", () => openMonsterEditor());
$("#monsterEditClose").addEventListener("click", () => monsterDialog.close());
$("#monsterEditCancel").addEventListener("click", () => monsterDialog.close());
$("#monsterAdminList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-monster-act]");
  if (!button) return;
  const monster = monsters.find((item) => Number(item.id) === Number(button.dataset.id));
  if (!monster) return;
  if (button.dataset.monsterAct === "edit") openMonsterEditor(monster);
  if (button.dataset.monsterAct === "delete" && confirm(`Remover “${monster.name}” do Bestiário? Esta ação não pode ser desfeita.`)) guarded(async () => {
    await SFA.del(`/api/admin/monsters/${monster.id}`);
    await reloadMonsters();
    flash("Criatura removida do Bestiário.");
  });
});

$("#monsterEditForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    name: $("#monsterNameField").value, threat_level: $("#monsterThreatField").value,
    image_url: $("#monsterImageField").value, description: $("#monsterDescriptionField").value,
    attributes: $("#monsterAttributesField").value, skills: $("#monsterSkillsField").value,
    history: $("#monsterHistoryField").value, weaknesses: $("#monsterWeaknessesField").value,
    published: $("#monsterPublishedField").checked
  };
  try {
    if (editingMonsterId) await SFA.put(`/api/admin/monsters/${editingMonsterId}`, payload);
    else await SFA.post("/api/admin/monsters", payload);
    monsterDialog.close();
    await reloadMonsters();
    flash(editingMonsterId ? "Ficha atualizada." : "Criatura adicionada ao Bestiário.");
  } catch (error) {
    if (error.status === 401) return toLogin();
    $("#monsterEditError").textContent = error.message;
    $("#monsterEditError").hidden = false;
  }
});

/* ---------- Usuários e moderação ---------- */
$("#usersBody").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-save-role]");
  if (!button) return;
  const id = Number(button.dataset.saveRole), select = document.querySelector(`[data-user-role="${id}"]`);
  guarded(async () => {
    await SFA.put(`/api/admin/users/${id}/role`, { role: select.value });
    await reloadUsers();
    flash("Função do usuário atualizada.");
  });
});

$("#eventForm").addEventListener("submit", async e => { e.preventDefault(); try { await SFA.post("/api/admin/events", {title:$("#eventTitle").value,description:$("#eventDescription").value,event_date:new Date($("#eventDate").value).toISOString(),master_id:Number($("#eventMaster").value),player_limit:$("#eventLimit").value||null,status:$("#eventStatus").value}); e.target.reset(); await reloadEvents(); await reloadDashboard(); flash("Evento criado."); } catch(err) { flash(err.message,"err"); } });
$("#campaignForm").addEventListener("submit",async e=>{e.preventDefault();try{await SFA.post("/api/admin/campaigns",{title:$("#campaignTitle").value,description:$("#campaignDescription").value,status:$("#campaignStatus").value,published:$("#campaignPublished").checked});e.target.reset();await reloadCampaigns();flash("Campanha criada.")}catch(err){flash(err.message,"err")}});
$("#adminCampaigns").addEventListener("click",async e=>{const button=e.target.closest("[data-campaign-save]");if(!button)return;const card=button.closest("[data-campaign-id]");try{await SFA.put(`/api/admin/campaigns/${card.dataset.campaignId}`,{title:card.querySelector("[data-campaign-title]").value,description:card.querySelector("[data-campaign-description]").value,status:card.querySelector("[data-campaign-status]").value,published:card.querySelector("[data-campaign-published]").checked});await reloadCampaigns();flash("Campanha atualizada.")}catch(err){flash(err.message,"err")}});
$("#universeLinkForm").addEventListener("submit",async e=>{e.preventDefault();try{await SFA.post("/api/admin/links",{source_type:$("#linkSourceType").value,source_id:$("#linkSourceId").value.trim(),relation:$("#linkRelation").value.trim(),target_type:$("#linkTargetType").value,target_id:$("#linkTargetId").value.trim()});e.target.reset();flash("Relação entre registros salva.")}catch(err){flash(err.message,"err")}});
$("#adminEvents").addEventListener("click",async e=>{const b=e.target.closest("[data-event-cancel]");if(!b)return;const event=await SFA.get("/api/admin/events").then(d=>d.events.find(x=>Number(x.id)===Number(b.dataset.eventCancel)));if(!event||!confirm(`Arquivar “${event.title}”?`))return;try{await SFA.put(`/api/admin/events/${event.id}`,{title:event.title,description:event.description,event_date:event.event_date,master_id:event.master_id,player_limit:event.player_limit,status:"archived"});await reloadEvents();await reloadDashboard();flash("Evento arquivado.")}catch(err){flash(err.message,"err")}});
$("#regionForm").addEventListener("submit",async e=>{e.preventDefault();try{await SFA.post("/api/admin/regions",{name:$("#regionName").value,description:$("#regionDescription").value,history:$("#regionHistory").value,factions:$("#regionFactions").value,creatures:$("#regionCreatures").value,related_events:$("#regionEvents").value,published:$("#regionPublished").value==="true"});e.target.reset();["regionFactions","regionCreatures","regionEvents"].forEach(id=>$("#"+id).value="[]");await reloadRegions();flash("Região registrada.")}catch(err){flash(err.message,"err")}});
$("#adminRegions").addEventListener("click",async e=>{const b=e.target.closest("[data-region-archive]");if(!b||!confirm("Arquivar esta região?"))return;try{await SFA.del(`/api/admin/regions/${b.dataset.regionArchive}`);await reloadRegions();flash("Região arquivada.")}catch(err){flash(err.message,"err")}});

$("#adminCommunityMessages").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-message]");
  if (!button || !confirm("Remover esta mensagem da comunidade?")) return;
  guarded(async () => {
    await SFA.del(`/api/community/messages/${button.dataset.removeMessage}`);
    await reloadCommunity();
    flash("Mensagem removida.");
  });
});

/* ---------- Editor ---------- */
const dlg = $("#editDialog");
$("#fCategory").innerHTML = Object.entries(CATEGORIES).map(([k, c]) => `<option value="${esc(k)}">${esc(c.label)}</option>`).join("");

function openEditor(rec) {
  editingId = rec ? rec.id : null;
  $("#editEyebrow").textContent = rec ? "Editar" : "Criar";
  $("#editHeading").textContent = rec ? "Editar registro" : "Novo registro";
  $("#fTitle").value = rec?.title ?? "";
  $("#fCategory").value = rec?.category ?? (tab !== "todos" ? tab : "registros");
  $("#fSummary").value = rec?.summary ?? "";
  $("#fImage").value = rec?.image_url ?? "";
  $("#fBody").value = rec?.body ?? "";
  $("#fPub").checked = rec ? !!rec.published : true;
  $("#editError").hidden = true;
  dlg.showModal();
  $("#fTitle").focus();
}
$("#newBtn").addEventListener("click", () => openEditor(null));
$("#editClose").addEventListener("click", () => dlg.close());
$("#editCancel").addEventListener("click", () => dlg.close());

$("#editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    title: $("#fTitle").value, category: $("#fCategory").value, summary: $("#fSummary").value,
    body: $("#fBody").value, image_url: $("#fImage").value, published: $("#fPub").checked
  };
  try {
    if (editingId) await SFA.put(`/api/admin/records/${editingId}`, payload);
    else await SFA.post("/api/admin/records", payload);
    dlg.close();
    tab = payload.category;
    await reload();
    flash(editingId ? "Registro atualizado." : "Registro criado e publicado no banco.");
  } catch (err) {
    if (err.status === 401) return toLogin();
    const eb = $("#editError");
    eb.textContent = err.message;
    eb.hidden = false;
  }
});

/* ---------- Senha ---------- */
$("#passForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const current = $("#pAtual").value, next = $("#pNova").value, conf = $("#pConf").value;
  if (next !== conf) return flash("A confirmação não confere com a nova senha.", "err");
  guarded(async () => {
    await SFA.post("/api/admin/password", { current, next });
    e.target.reset();
    flash("Senha alterada com sucesso.");
  });
});

$("#logoutBtn").addEventListener("click", async () => {
  try { await SFA.post("/api/logout"); } catch (_) {}
  location.replace("index.html");
});

/* ---------- Boot ---------- */
(async function boot() {
  try {
    const me = await SFA.get("/api/me");
    currentAdminId = me.id;
    SFA.setCsrf(me.csrf);
    $("#whoami").textContent = me.user;
    document.body.hidden = false;
    FX.observeReveal([...document.querySelectorAll("[data-reveal]")]);
    await reload();
    await reloadLore();
    await reloadMonsters();
    await reloadDashboard();
    await reloadUsers();
    await reloadEvents();
    await reloadCampaigns();
    await reloadRegions();
    await reloadAchievements();
    await reloadCommunity();
  } catch (err) {
    if (err.status === 401) return toLogin();
    document.body.hidden = false;
    flash(err.message, "err");
  }
})();
