"use strict";
(async function () {
  const { esc, fmtDate, get, mediaMarkup } = SFA;
  const labels = { planned: "Planejado", open: "Aberto", in_progress: "Em andamento", completed: "Concluído", archived: "Arquivado" };
  const card = event => `<article class="portal-card">${mediaMarkup(event.image_url, `Imagem de ${event.title}`, "event-media")}<p class="card-category">${esc(labels[event.status] || "Sessão")} · ${esc(fmtDate(event.event_date, true))}</p><h3><a href="/eventos/${encodeURIComponent(event.slug)}">${esc(event.title)}</a></h3><p>${esc(event.description)}</p><p class="muted">Mestre: ${esc(event.master)} · ${esc(event.participant_count)} participante(s)${event.player_limit ? ` / ${esc(event.player_limit)} vagas` : ""}</p><a class="text-link" href="/eventos/${encodeURIComponent(event.slug)}">Ver encontro ↗</a></article>`;
  try {
    const [upcoming, past, regions] = await Promise.all([get("/api/events?scope=upcoming"), get("/api/events?scope=past"), get("/api/regions")]);
    document.querySelector("#upcomingEvents").innerHTML = upcoming.events.length ? upcoming.events.map(card).join("") : '<p class="empty-state">Nenhum evento futuro publicado.</p>';
    document.querySelector("#pastEvents").innerHTML = past.events.length ? past.events.map(card).join("") : '<p class="empty-state">Ainda não há eventos passados no arquivo.</p>';
    document.querySelector("#regionEntries").innerHTML = regions.regions.length ? regions.regions.map(region => `<article class="portal-card">${mediaMarkup(region.image_url, `Imagem de ${region.name}`, "region-media")}<p class="card-category">Atlas de Tenebra</p><h3>${esc(region.name)}</h3><p>${esc(region.description)}</p><a class="text-link" href="/mapa/${encodeURIComponent(region.slug)}">Explorar região ↗</a></article>`).join("") : '<p class="empty-state">O mapa aguarda os primeiros registros de regiões.</p>';
  } catch (error) {
    for (const id of ["upcomingEvents", "pastEvents", "regionEntries"]) document.getElementById(id).innerHTML = `<p class="empty-state">${esc(error.message)}</p>`;
  }
})();
