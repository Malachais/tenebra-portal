"use strict";
/* Camada de dados: fala com o servidor (que lê/grava no PostgreSQL). */
window.SFA = (() => {
  const CATEGORIES = {
    registros: { label: "Registros", kind: "Arquivo", title: "Registros", blurb: "Documentos, relatos e acontecimentos preservados pelo arquivo.", symbol: "✎", rune: "ᚨ" },
    regioes: { label: "Regiões Não Registradas", kind: "Atlas vedado", title: "Regiões Não Registradas", blurb: "Territórios sem mapa confiável. A entrada ocorre por conta própria.", symbol: "⌖", rune: "ᛉ" },
    monstros: { label: "Monstros", kind: "Bestiário", title: "Monstros", blurb: "Criaturas observadas nos limites da floresta e além deles.", symbol: "☽", rune: "ᚦ" },
    outros: { label: "Outros", kind: "Miscelânea", title: "Outros registros", blurb: "Artefatos, cultos, fenômenos e nomes que não cabem em outro índice.", symbol: "✶", rune: "ᛟ" }
  };

  let csrf = "";
  const setCsrf = (t) => { csrf = t || ""; };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function mediaMarkup(imageUrl, alt = "", className = "") {
    const url = String(imageUrl ?? "").trim();
    const valid = /^(https?:\/\/|\/[^/])/.test(url);
    const tree = `<svg class="tenebra-placeholder-tree" viewBox="0 0 160 120" aria-hidden="true"><path d="M80 112V44M80 69 48 50M80 78l34-25M80 92 54 77M80 87l27-16"/><path d="m80 8-27 34h16L43 61h24L50 78h60L93 61h24L91 42h16z"/><path d="M20 112h120"/></svg>`;
    return `<span class="tenebra-media ${esc(className)}${valid ? "" : " is-missing"}"><span class="tenebra-placeholder" role="img" aria-label="Publicação sem imagem"><span class="tenebra-placeholder-sigil" aria-hidden="true">ᛟ</span>${tree}<strong aria-hidden="true">?</strong><small>Registro sem imagem</small></span>${valid ? `<img class="tenebra-media-image" data-tenebra-image src="${esc(url)}" alt="${esc(alt)}" loading="lazy">` : ""}</span>`;
  }

  function parseDate(s) { const value = String(s); return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value.replace(" ", "T") + "Z"); }
  function fmtDate(s, long = false) {
    const d = parseDate(s);
    if (isNaN(d)) return "";
    return long
      ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
  }

  function numericDisplay(raw) {
    if (raw === null || raw === undefined || raw === "") return "—";
    const text = String(raw);
    if (!/^(?:\d+|\d+\.\d{1,3}|\.\d{1,3})$/.test(text)) return "—";
    return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
  }

  function illustration(cat) {
    const rune = `<span class="illustration-rune">${esc(CATEGORIES[cat]?.rune || "ᛟ")}</span>`;
    switch (cat) {
      case "monstros": return `<div class="card-illustration illustration-bestiary"><span class="branch branch-a"></span><span class="branch branch-b"></span><span class="eye-mark">◉</span>${rune}</div>`;
      case "regioes": return `<div class="card-illustration illustration-map"><span class="map-line"></span><span class="map-cross">✣</span>${rune}</div>`;
      case "registros": return `<div class="card-illustration illustration-notes"><span class="note-lines"></span><span class="note-seal">SFA</span>${rune}</div>`;
      default:          return `<div class="card-illustration illustration-cosmos"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="orbit-core">✧</span>${rune}</div>`;
    }
  }

  async function call(method, url, body) {
    const opts = { method, headers: {}, credentials: "same-origin", cache: "no-store" };
    if (body !== undefined) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    if (method !== "GET") opts.headers["X-CSRF-Token"] = csrf;
    let res;
    try { res = await fetch(url, opts); }
    catch { throw Object.assign(new Error("Sem conexão com o servidor. Ele está rodando? (npm start)"), { status: 0 }); }
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw Object.assign(new Error(data.error || `Erro ${res.status}`), { status: res.status });
    return data;
  }

  document.addEventListener("error", (event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.hasAttribute("data-tenebra-image")) image.closest(".tenebra-media")?.classList.add("is-missing");
  }, true);

  return { CATEGORIES, esc, fmtDate, numericDisplay, illustration, mediaMarkup, setCsrf, get: (u) => call("GET", u), post: (u, b) => call("POST", u, b ?? {}), put: (u, b) => call("PUT", u, b), del: (u) => call("DELETE", u) };
})();
