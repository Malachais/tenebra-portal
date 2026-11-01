"use strict";
(async () => {
  const { esc, fmtDate, get, post, setCsrf, mediaMarkup } = SFA;
  const list = document.querySelector("#campaignEntries");
  const timeline = document.querySelector("#timelineEntries");
  if (list) {
    try {
      const { campaigns } = await get("/api/campaigns");
      list.innerHTML = campaigns.length ? campaigns.map(campaign => `<article class="portal-card">${mediaMarkup(null, `Imagem de ${campaign.title}`, "event-media")}<p class="card-category">Campanha · ${esc(campaign.status)}</p><h3><a href="/campanhas/${encodeURIComponent(campaign.slug)}">${esc(campaign.title)}</a></h3><p>${esc(campaign.description)}</p><p class="muted">${esc(campaign.participant_count)} participante(s)</p><a class="text-link" href="/campanhas/${encodeURIComponent(campaign.slug)}">Abrir campanha ↗</a></article>`).join("") : '<p class="empty-state">Nenhuma campanha publicada está aberta no arquivo.</p>';
    } catch (error) { list.innerHTML = `<p class="empty-state">${esc(error.message)}</p>`; }
  }
  if (timeline) {
    try {
      const { timeline: entries } = await get("/api/timeline");
      timeline.innerHTML = entries.length ? entries.map(entry => `<li><time datetime="${esc(entry.occurred_at)}">${esc(fmtDate(entry.occurred_at, true))} · ${esc(entry.kind)}</time><a href="${esc(entry.href)}">${esc(entry.title)}</a><p>${esc(entry.summary)}</p></li>`).join("") : '<li class="muted">Ainda não há datas canônicas registradas na linha do tempo.</li>';
    } catch (error) { timeline.innerHTML = `<li class="muted">${esc(error.message)}</li>`; }
  }

  const detail = document.querySelector("#campaignDetail");
  if (!detail) return;
  const slug = new URLSearchParams(location.search).get("slug") || location.pathname.split("/").filter(Boolean).at(-1);
  const message = document.querySelector("#campaignMessage");
  try {
    const { campaign } = await get(`/api/campaigns/${encodeURIComponent(slug)}`);
    document.title = `${campaign.title} · Campanha Tenebra`;
    detail.innerHTML = `${mediaMarkup(null, `Imagem de ${campaign.title}`, "article-media")}<p class="card-category">Campanha · ${esc(campaign.status)}</p><h1>${esc(campaign.title)}</h1><p>${esc(campaign.description)}</p><p class="muted">${esc(campaign.participant_count)} participante(s)</p>`;
    const join = document.querySelector("#joinCampaign");
    const diaryForm = document.querySelector("#campaignDiaryForm");
    const diaryList = document.querySelector("#campaignDiaryEntries");
    const loadDiary = async () => {
      const { entries } = await get(`/api/campaigns/${campaign.id}/diary`);
      diaryList.innerHTML = entries.length ? entries.map(entry => `<article class="campaign-diary-entry"><p class="card-category">${esc(entry.author)} · ${esc(entry.visibility)}${entry.in_world_at ? ` · ${esc(fmtDate(entry.in_world_at,true))}` : ""}</p><h3>${esc(entry.title)}</h3><p>${esc(entry.body).replaceAll("\n", "<br>")}</p></article>`).join("") : '<p class="muted">O diário ainda não tem entradas visíveis para você.</p>';
    };
    try {
      const me = await get("/api/me");
      setCsrf(me.csrf);
      join.hidden = campaign.is_participant || !["open", "in_progress"].includes(campaign.status);
      join.addEventListener("click", async () => { try { await post(`/api/campaigns/${campaign.id}/join`); message.textContent = "Você entrou na campanha."; join.hidden = true; diaryForm.hidden = false; await loadDiary(); } catch (error) { message.textContent = error.message; } });
      diaryForm.hidden = !campaign.is_participant;
      const { characters } = await get("/api/me/characters");
      document.querySelector("#diaryCharacter").innerHTML = '<option value="">Sem personagem associado</option>' + characters.map(character => `<option value="${character.id}">${esc(character.name)}</option>`).join("");
    } catch { join.hidden = !["open", "in_progress"].includes(campaign.status); diaryForm.hidden = true; }
    await loadDiary();
    diaryForm.addEventListener("submit", async event => {
      event.preventDefault();
      try {
        await post(`/api/campaigns/${campaign.id}/diary`, { title: document.querySelector("#diaryTitle").value, body: document.querySelector("#diaryBody").value, character_id: document.querySelector("#diaryCharacter").value || null, visibility: document.querySelector("#diaryVisibility").value });
        diaryForm.reset();
        await loadDiary();
        message.textContent = "Entrada salva no diário.";
      } catch (error) { message.textContent = error.message; }
    });
  } catch (error) { detail.textContent = error.message; }
})();
