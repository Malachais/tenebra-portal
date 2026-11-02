"use strict";

const { reduceMotion, finePointer } = FX;
const root = document.documentElement;

/* ============================================================
   Menu responsivo
   ============================================================ */
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});
mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
  });
});

/* Discord */
const discordLink = document.querySelector("#discordBot");
if (discordLink) discordLink.href = SFA_CONFIG.discordInvite;

/* ============================================================
   MOTION (independe do banco)
   ============================================================ */
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
FX.observeReveal([...document.querySelectorAll("[data-reveal]")]);
FX.startFireflies(document.querySelector("#fireflies"), window.innerWidth < 640 ? 8 : 18);

const progressBar = document.querySelector("#scrollProgress");
const siteHeader = document.querySelector("#siteHeader");
const archiveNote = document.querySelector(".archive-note");
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar?.style.setProperty("--p", (max > 0 ? window.scrollY / max : 0).toFixed(4));
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);

  if (!reduceMotion && archiveNote) {
    const rect = archiveNote.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      archiveNote.style.setProperty("--sy", `${(progress - 0.5) * 90}px`);
      archiveNote.style.setProperty("--sr", `${(progress - 0.5) * 24}deg`);
    }
  }
  const probe = window.scrollY + window.innerHeight * 0.35;
  let current = null;
  sections.forEach((sec) => { if (sec.offsetTop <= probe) current = sec; });
  navLinks.forEach((a) => a.classList.toggle("active", !!current && a.getAttribute("href") === `#${current.id}`));
  ticking = false;
}
window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

const hero = document.querySelector(".hero");
const artFrame = document.querySelector("#artFrame");
const cornerNote = document.querySelector(".corner-note");
const moon = document.querySelector(".moon");
if (hero && artFrame && finePointer && !reduceMotion) {
  hero.addEventListener("pointermove", (event) => {
    const r = hero.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    artFrame.style.setProperty("--px", `${(x * -18).toFixed(1)}px`);
    artFrame.style.setProperty("--py", `${(y * -14).toFixed(1)}px`);
    cornerNote?.style.setProperty("--px2", `${(x * 22).toFixed(1)}px`);
    cornerNote?.style.setProperty("--py2", `${(y * 16).toFixed(1)}px`);
    moon?.style.setProperty("--mx", `${(x * 14).toFixed(1)}px`);
    moon?.style.setProperty("--my", `${(y * 10).toFixed(1)}px`);
  });
  hero.addEventListener("pointerleave", () => {
    ["--px", "--py"].forEach((v) => artFrame.style.setProperty(v, "0px"));
    ["--px2", "--py2"].forEach((v) => cornerNote?.style.setProperty(v, "0px"));
    ["--mx", "--my"].forEach((v) => moon?.style.setProperty(v, "0px"));
  });
}

/* ============================================================
   REGISTROS — blog lido do SQLite via API (/api/records)
   ============================================================ */
const postsRoot = document.querySelector("#postsRoot");
const filterRow = document.querySelector("#filterRow");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#recordSearch");
const dialog = document.querySelector("#recordDialog");
let activeFilter = "todos";
let lastSnapshot = "";
let postById = {};

function buildFilters(counts, total) {
  const { esc, CATEGORIES } = SFA;
  filterRow.innerHTML =
    `<button class="filter-chip" data-filter="todos" aria-pressed="false">Todos <b>${total}</b></button>` +
    Object.entries(CATEGORIES).map(([k, c]) =>
      `<button class="filter-chip" data-filter="${esc(k)}" aria-pressed="false">${esc(c.label)} <b>${counts[k] || 0}</b></button>`).join("");
  filterRow.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => { activeFilter = btn.dataset.filter; applyFilters(); });
  });
}

function renderPosts(records) {
  const { esc, fmtDate, illustration, CATEGORIES } = SFA;
  postById = Object.fromEntries(records.map((r) => [r.id, r]));
  const counts = {};
  records.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });

  postsRoot.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => {
    const list = records.filter((r) => r.category === key);
    const cards = list.map((r, i) => `
      <article class="record-card" data-category="${esc(key)}" data-search="${esc(`${c.label} ${r.title} ${r.summary} ${r.author}`.toLocaleLowerCase("pt-BR"))}" data-reveal style="--d:${i * 80}ms">
        <div class="card-top"><span class="record-number">${esc(fmtDate(r.created_at))}</span><span class="card-symbol">${esc(c.symbol)}</span></div>
        ${SFA.mediaMarkup(r.image_url, `Imagem de ${r.title}`, "record-media", r)}
        <p class="card-category">${esc(c.kind)} · por ${esc(r.author)}</p>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.summary)}</p>
        <a class="card-link" href="/registro/${encodeURIComponent(r.slug)}" data-open-record="${esc(r.id)}" aria-haspopup="dialog" aria-controls="recordDialog">Ler registro <span>↗</span></a>
      </article>`).join("");
    return `
    <section class="cat-section" id="cat-${esc(key)}" data-category="${esc(key)}">
      <header class="cat-head" data-reveal>
        <span class="cat-rune" aria-hidden="true">${esc(c.rune)}</span>
        <div>
          <p class="eyebrow">${esc(c.kind)} · ${list.length} ${list.length === 1 ? "registro" : "registros"}</p>
          <h3>${esc(c.title)}</h3>
          <p class="cat-blurb">${esc(c.blurb)}</p>
        </div>
      </header>
      ${list.length ? `<div class="cat-grid">${cards}</div>` : `<p class="cat-empty">Ainda não há registros publicados nesta categoria.</p>`}
    </section>`;
  }).join("");

  const cards = [...postsRoot.querySelectorAll(".record-card")];
  FX.observeReveal([...postsRoot.querySelectorAll("[data-reveal]")]);

  if (finePointer && !reduceMotion) {
    cards.forEach((card) => card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }));
  }

  const stat = document.querySelector("#statTotal");
  stat.dataset.count = String(records.length);
  FX.observeCounters([stat]);

  buildFilters(counts, records.length);
  applyFilters(false);
}

function applyFilters(animate = true) {
  const term = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
  let visibleCards = 0;

  filterRow.querySelectorAll(".filter-chip").forEach((chip) => {
    const on = chip.dataset.filter === activeFilter;
    chip.classList.toggle("active", on);
    chip.setAttribute("aria-pressed", String(on));
  });

  postsRoot.querySelectorAll(".cat-section").forEach((sec) => {
    const catOk = activeFilter === "todos" || sec.dataset.category === activeFilter;
    let secVisible = 0;
    sec.querySelectorAll(".record-card").forEach((card) => {
      const text = `${card.dataset.search || ""} ${card.textContent || ""}`.toLocaleLowerCase("pt-BR");
      const show = catOk && (!term || text.includes(term));
      const wasHidden = card.hidden;
      card.hidden = !show;
      if (show) {
        secVisible++;
        card.classList.add("is-visible");
        if (animate && wasHidden && !reduceMotion) {
          card.classList.remove("card-in"); void card.offsetWidth; card.classList.add("card-in");
        }
      }
    });
    visibleCards += secVisible;
    const hasCards = sec.querySelector(".record-card");
    /* categoria vazia só aparece sem busca ativa */
    sec.hidden = !catOk || (term && secVisible === 0) || (!hasCards && !!term);
  });

  const none = visibleCards === 0 && (term || postsRoot.querySelector(".record-card"));
  emptyState.hidden = !none;
  emptyState.textContent = "Nenhum registro corresponde à busca.";
}
searchInput?.addEventListener("input", () => applyFilters());

document.querySelector("#dialogClose")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
postsRoot?.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-open-record]");
  if (!link || !dialog?.showModal) return;
  const record = postById[link.dataset.openRecord];
  if (!record) return; // Keep the valid direct URL available if the list snapshot is stale.
  event.preventDefault();
  const category = SFA.CATEGORIES[record.category];
  document.querySelector("#dialogEyebrow").textContent = `${category?.kind || "Registro"} · ${SFA.fmtDate(record.created_at, true)}${record.author ? ` · por ${record.author}` : ""}`;
  document.querySelector("#dialogTitle").textContent = record.title || "Registro sem título";
  document.querySelector("#dialogSummary").textContent = record.summary || "Sem resumo disponível.";
  document.querySelector("#dialogMedia").innerHTML = SFA.mediaMarkup(record.image_url, `Imagem associada ao registro ${record.title || ""}`, "record-dialog-media", { ...record, kind: "record" });
  document.querySelector("#dialogBody").textContent = record.body || "Descrição não disponível.";
  const directLink = document.querySelector("#dialogDirectLink");
  directLink.href = `/registro/${encodeURIComponent(record.slug)}`;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  dialog.showModal();
});
let previousBodyOverflow = "";
dialog?.addEventListener("close", () => {
  document.body.style.overflow = previousBodyOverflow;
});
dialog?.addEventListener("cancel", () => {
  document.body.style.overflow = previousBodyOverflow;
});

async function loadPosts(first = false) {
  try {
    const { records } = await SFA.get("/api/records");
    const snap = JSON.stringify(records);
    if (snap === lastSnapshot) return;
    lastSnapshot = snap;
    renderPosts(records);
    if (first) emptyState.hidden = true;
  } catch (err) {
    console.error(err);
    if (first) { emptyState.hidden = false; emptyState.textContent = "Não foi possível carregar o arquivo. " + err.message; }
  }
}
loadPosts(true);
/* mantém o index em dia quando o visitante volta para a aba */
document.addEventListener("visibilitychange", () => { if (!document.hidden) loadPosts(); });
setInterval(() => { if (!document.hidden) loadPosts(); }, 60000);
