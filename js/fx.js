"use strict";
/* Utilitários de movimento compartilhados (site e painel). */
window.FX = (() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let revealObserver = null;
  function observeReveal(els) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    revealObserver ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => revealObserver.observe(el));
  }

  function runCounter(el, duration = 1100) {
    const target = Number(el.dataset.count) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    const start = performance.now();
    el.textContent = "0";
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function observeCounters(els) {
    if (!("IntersectionObserver" in window)) { els.forEach((el) => runCounter(el)); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  function startFireflies(cv, count = 28) {
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const flies = [];
    let w = 0, h = 0, raf = 0, onScreen = true;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = () => ({ x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.2, a: Math.random() * 6.28, s: 0.12 + Math.random() * 0.35, t: Math.random() * 6.28, ts: 0.01 + Math.random() * 0.02 });

    resize();
    for (let i = 0; i < count; i++) flies.push(spawn());
    window.addEventListener("resize", resize);

    const frame = () => {
      if (!onScreen || document.hidden) { raf = 0; return; }
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        f.a += (Math.random() - 0.5) * 0.15;
        f.x += Math.cos(f.a) * f.s; f.y += Math.sin(f.a) * f.s - 0.04; f.t += f.ts;
        if (f.x < -10) f.x = w + 10;
        if (f.x > w + 10) f.x = -10;
        if (f.y < -10) f.y = h + 10;
        if (f.y > h + 10) f.y = -10;
        const glow = 0.35 + 0.65 * Math.abs(Math.sin(f.t));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
        g.addColorStop(0, `rgba(204,160,70,${(0.85 * glow).toFixed(3)})`);
        g.addColorStop(1, "rgba(204,160,70,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const resume = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; resume(); }).observe(cv);
    document.addEventListener("visibilitychange", resume);
    raf = requestAnimationFrame(frame);
  }

  return { reduceMotion, finePointer, observeReveal, observeCounters, runCounter, startFireflies };
})();
