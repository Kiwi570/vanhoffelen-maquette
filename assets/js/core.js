/* Noyau commun : langue, mode calme, défilement, en-tête et timecode, curseur, transitions, lecteur audio, formes d’onde. */
(function () {
  const D = window.VH;
  const html = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem('vh-' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('vh-' + k, v); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Langue ---------- */
  const urlLang = new URLSearchParams(location.search).get('lang');
  let lang = (urlLang === 'en' || urlLang === 'fr') ? urlLang : (store.get('lang') || 'fr');
  const L = (v) => (v && typeof v === 'object' && ('fr' in v || 'en' in v)) ? (v[lang] || v.fr) : v;
  function t(key, fr) { return lang === 'en' ? (D.I18N.en[key] || fr || '') : (fr || ''); }
  function applyLang() {
    html.lang = lang;
    $$('[data-i18n]').forEach(el => {
      if (!el.dataset.fr) el.dataset.fr = el.innerHTML;
      const k = el.dataset.i18n;
      el.innerHTML = lang === 'en' && D.I18N.en[k] ? D.I18N.en[k] : el.dataset.fr;
    });
    $$('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        const store = 'fr' + attr.replace(/[^a-z]/gi, '');
        if (!el.dataset[store]) el.dataset[store] = el.getAttribute(attr) || '';
        el.setAttribute(attr, lang === 'en' && D.I18N.en[key] ? D.I18N.en[key] : el.dataset[store]);
      });
    });
    $$('.langue button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $$('a[data-lang-link]').forEach(a => {
      const u = new URL(a.getAttribute('href'), location.href);
      if (lang === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
    });
    document.dispatchEvent(new CustomEvent('vh:lang', { detail: lang }));
  }
  function setLang(l) { lang = l; store.set('lang', l); applyLang(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }

  /* ---------- Mode calme ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const savedCalm = store.get('calme');
  let calm = savedCalm === null ? prefersReduced : savedCalm === '1';
  html.classList.toggle('calme', calm);
  function setCalm(v) {
    store.set('calme', v ? '1' : '0');
    // Recharge pour reconstruire proprement les scènes épinglées
    location.reload();
  }

  /* ---------- Utilitaires d’images ---------- */
  const grokOK = (n) => D.GROK_RECUES.includes(n);
  const SVGPH = {
    'piano-mains': '<g stroke="#D4A857" stroke-opacity=".5" fill="none" stroke-width="1.2"><rect x="60" y="250" width="680" height="120" rx="4"/>' +
      Array.from({ length: 34 }, (_, i) => `<line x1="${60 + i * 20}" y1="250" x2="${60 + i * 20}" y2="370"/>`).join('') +
      Array.from({ length: 34 }, (_, i) => [1, 2, 4, 5, 6].includes(i % 7) ? `<rect x="${73 + i * 20}" y="250" width="12" height="70" fill="#D4A857" fill-opacity=".25"/>` : '').join('') +
      '</g><path d="M330 120 C 360 180, 380 210, 400 248 M420 110 C 430 170, 440 210, 446 248 M470 120 C 470 170, 476 210, 488 248" stroke="#EBD39B" stroke-opacity=".35" fill="none" stroke-width="2"/>',
    'affiche': '<g stroke="#D4A857" stroke-opacity=".4" fill="none"><rect x="230" y="40" width="340" height="480" rx="2"/><line x1="270" y1="430" x2="530" y2="430"/><line x1="300" y1="460" x2="500" y2="460"/></g>'
  };
  function provisoire(kind, ratio = '16 / 9') {
    const body = SVGPH[kind] || SVGPH.affiche;
    return `<div class="provisoire" style="aspect-ratio:${ratio}" role="img" aria-label="${t('ph', 'Visuel provisoire')}">
      <svg class="scene-ph" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><radialGradient id="ph-l" cx="35%" cy="0%" r="80%"><stop offset="0" stop-color="#EBD39B" stop-opacity=".28"/><stop offset="1" stop-color="#EBD39B" stop-opacity="0"/></radialGradient></defs>
        <rect width="800" height="560" fill="url(#ph-l)"/>${body}</svg>
      <span class="tag-ph">${t('ph', 'Visuel provisoire')}</span></div>`;
  }
  function grok(name, alt, opts = {}) {
    if (grokOK(name)) return `<img src="assets/img/grok/${name}${opts.suffix || ''}.webp" alt="${alt || ''}" loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async"${opts.cls ? ` class="${opts.cls}"` : ''}>`;
    return provisoire(opts.ph || 'affiche', opts.ratio);
  }
  const moodImg = (mood) => 'catalogue-humeur-' + (mood === 'espoir' ? 'plein-d-espoir' : mood);
  function pochette(track, size = 'vignette') {
    const n = moodImg(track.mood);
    if (grokOK(n)) return `<img src="assets/img/grok/${n}-${size}.webp" alt="" loading="lazy" decoding="async">`;
    const h = (D.MOODS[track.mood] || {}).hue || 36;
    return `<div class="provisoire" style="background:radial-gradient(circle at 30% 20%, hsl(${h} 55% 40%), #0a0908 75%)"></div>`;
  }

  /* ---------- Formes d’onde ---------- */
  function drawWave(canvas, peaks, progress = 0, opts = {}) {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    if (!peaks || !peaks.length) {
      c.strokeStyle = 'rgba(239,232,218,.25)'; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); c.setLineDash([]);
      return;
    }
    const bars = Math.max(12, Math.floor(w / (opts.step || 4)));
    const bw = Math.max(1, (w / bars) * 0.55);
    for (let i = 0; i < bars; i++) {
      const v = peaks[Math.floor(i / bars * peaks.length)] || 0;
      const bh = Math.max(1.5, v * (h - 4));
      const x = i * (w / bars);
      const played = (i / bars) < progress;
      c.fillStyle = played ? (opts.on || '#D4A857') : (opts.off || 'rgba(239,232,218,.28)');
      c.fillRect(x, (h - bh) / 2, bw, bh);
    }
  }
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  /* ---------- Lecteur audio ---------- */
  const tracksBySlug = Object.fromEntries(D.TRACKS.map(tr => [tr.slug, tr]));
  const Player = {
    audio: new Audio(), queue: D.TRACKS.filter(x => x.audio).map(x => x.slug), current: null, ctx: null, an: null, buf: null, level: 0,
    ensureCtx() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        const src = this.ctx.createMediaElementSource(this.audio);
        this.an = this.ctx.createAnalyser(); this.an.fftSize = 1024; this.an.smoothingTimeConstant = .82;
        src.connect(this.an); this.an.connect(this.ctx.destination);
        this.buf = new Uint8Array(this.an.frequencyBinCount);
        this.wave = new Uint8Array(this.an.fftSize);
      } catch (e) { this.ctx = null; }
    },
    setQueue(list) { if (list && list.length) this.queue = list.filter(s => tracksBySlug[s] && tracksBySlug[s].audio); },
    play(slug) {
      const tr = tracksBySlug[slug];
      if (!tr || !tr.audio) return;
      this.ensureCtx();
      if (this.current !== slug) {
        this.current = slug;
        this.audio.src = 'assets/audio/' + slug + '.mp3';
      }
      this.audio.play().catch(() => {});
    },
    toggle(slug) {
      if (slug && slug !== this.current) return this.play(slug);
      if (!this.current) return this.play(this.queue[0]);
      if (this.audio.paused) this.play(this.current); else this.audio.pause();
    },
    step(d) {
      const i = this.queue.indexOf(this.current);
      const n = this.queue[(i + d + this.queue.length) % this.queue.length];
      this.play(n);
    },
    playing() { return !!this.current && !this.audio.paused; },
    sample() {
      if (!this.an || this.audio.paused) { this.level += (0 - this.level) * .08; return this.level; }
      this.an.getByteFrequencyData(this.buf);
      let s = 0; for (let i = 2; i < 160; i++) s += this.buf[i];
      const v = Math.min(1, s / (158 * 170));
      this.level += (v - this.level) * .25;
      return this.level;
    }
  };
  Player.audio.preload = 'none';
  Player.audio.addEventListener('ended', () => Player.step(1));
  ['play', 'pause', 'ended'].forEach(ev => Player.audio.addEventListener(ev, () => {
    html.classList.toggle('joue', Player.playing());
    document.dispatchEvent(new CustomEvent('vh:track', { detail: { slug: Player.current, playing: Player.playing() } }));
  }));

  const ICO = {
    play: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
    pause: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/></svg>',
    next: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path d="M5 5v14l10-7zM16 5h3v14h-3z" fill="currentColor"/></svg>',
    prev: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path d="M19 5v14L9 12zM5 5h3v14H5z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.6"/></svg>'
  };

  function buildChrome() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="grain" aria-hidden="true"></div>
      <div class="faisceau-repli" aria-hidden="true"></div>
      <canvas id="faisceau" aria-hidden="true"></canvas>
      <div class="curseur" aria-hidden="true"><b></b></div>
      <div class="streamer" aria-hidden="true"><i></i><b></b></div>
      <div class="voile" aria-hidden="true"></div>
      <div class="lecteur repos" role="region" aria-label="Lecteur" data-i18n-attr="aria-label:player.empty">
        <button class="b-mini prec" type="button" aria-label="Extrait précédent" data-i18n-attr="aria-label:player.prev">${ICO.prev}</button>
        <button class="b-lecture" type="button" aria-label="Lecture" data-i18n-attr="aria-label:player.play">${ICO.play}</button>
        <button class="b-mini suiv" type="button" aria-label="Extrait suivant" data-i18n-attr="aria-label:player.next">${ICO.next}</button>
        <div class="meta"><span class="t" data-i18n="player.empty">Écouter un extrait</span><span class="m"></span></div>
        <canvas class="onde-lecteur" aria-hidden="true"></canvas>
        <span class="temps">0:00</span>
      </div>`);
    const bar = $('.lecteur');
    const btn = $('.b-lecture', bar), cv = $('.onde-lecteur', bar);
    btn.addEventListener('click', () => Player.toggle());
    $('.suiv', bar).addEventListener('click', () => Player.step(1));
    $('.prec', bar).addEventListener('click', () => Player.step(-1));
    cv.addEventListener('click', (e) => {
      if (!Player.current || !Player.audio.duration) return;
      const r = cv.getBoundingClientRect();
      Player.audio.currentTime = ((e.clientX - r.left) / r.width) * Player.audio.duration;
    });
    const refresh = () => {
      const tr = tracksBySlug[Player.current];
      btn.innerHTML = Player.playing() ? ICO.pause : ICO.play;
      btn.setAttribute('aria-label', Player.playing() ? t('player.pause', 'Pause') : t('player.play', 'Lecture'));
      if (tr) {
        bar.classList.remove('repos');
        $('.meta .t', bar).textContent = tr.title;
        $('.meta .t', bar).removeAttribute('data-i18n');
        $('.meta .m', bar).textContent = `${L(D.MOODS[tr.mood])} · ${t('excerpt', 'extrait')}`;
      }
    };
    document.addEventListener('vh:track', refresh);
    document.addEventListener('vh:lang', refresh);
    const tick = () => {
      const p = Player.audio.duration ? Player.audio.currentTime / Player.audio.duration : 0;
      const pk = Player.current && window.VH_PEAKS[Player.current];
      drawWave(cv, pk ? pk.p : null, p, { step: 3 });
      $('.temps', bar).textContent = fmt(Player.audio.currentTime) + ' / ' + fmt(pk ? pk.d : 0);
    };
    Player.audio.addEventListener('timeupdate', tick);
    window.addEventListener('resize', tick);
    requestAnimationFrame(tick);
  }

  /* ---------- Défilement, en-tête, timecode ---------- */
  let lenis = null;
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Flip) gsap.registerPlugin(Flip);
    if (!calm && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -10, duration: 1.6 }); history.replaceState(null, '', id); }
      }));
    }
    const head = $('.entete');
    const tcEl = $('.tc .code'), cueEl = $('.tc .cue');
    const total = parseFloat(document.body.dataset.duree || '252');
    const upd = () => {
      const y = window.scrollY;
      head.classList.toggle('opaque', y > 40);
      const max = document.documentElement.scrollHeight - innerHeight;
      const s = (max > 0 ? y / max : 0) * total;
      const fr = Math.floor((s % 1) * 24), ss = Math.floor(s) % 60, mm = Math.floor(s / 60) % 60;
      if (tcEl) tcEl.textContent = `00:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
    };
    if (lenis) lenis.on('scroll', upd); else window.addEventListener('scroll', upd, { passive: true });
    upd();
    $$('[data-cue]').forEach(sec => {
      ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', refreshPriority: -10, onToggle: (st) => { if (st.isActive && cueEl) cueEl.textContent = sec.dataset.cue; } });
    });
    const mb = $('.menu-btn'), nav = $('.nav');
    if (mb) mb.addEventListener('click', () => { const o = nav.classList.toggle('ouvert'); mb.setAttribute('aria-expanded', String(o)); });
    $$('.nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('ouvert'); if (mb) mb.setAttribute('aria-expanded', 'false'); }));
  }

  /* ---------- Curseur et boutons magnétiques ---------- */
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cur = $('.curseur'); if (!cur) return;
    html.classList.add('curseur-on');
    const label = $('b', cur);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; VHcore.pointer.x = x / innerWidth; VHcore.pointer.y = y / innerHeight; }, { passive: true });
    gsap.ticker.add(() => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; });
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-curseur]');
      if (el) { cur.classList.add('grand'); label.textContent = lang === 'en' ? (el.dataset.curseurEn || el.dataset.curseur) : el.dataset.curseur; }
    });
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest('[data-curseur]');
      if (el && !el.contains(e.relatedTarget)) cur.classList.remove('grand');
    });
    if (calm) return;
    $$('.magnet').forEach(m => {
      const xTo = gsap.quickTo(m, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(m, 'y', { duration: .5, ease: 'power3' });
      m.addEventListener('pointermove', (e) => { const r = m.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .28); yTo((e.clientY - r.top - r.height / 2) * .38); });
      m.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Transitions : streamer et punch ---------- */
  function initTransitions() {
    const voile = $('.voile');
    gsap.fromTo(voile, { opacity: 1 }, { opacity: 0, duration: calm ? .2 : .7, ease: 'power2.out', delay: .05 });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href)) return;
      const u = new URL(href, location.href);
      if (u.pathname === location.pathname && u.hash) return;
      e.preventDefault();
      if (calm) { location.href = u.href; return; }
      const s = $('.streamer'), bar = $('i', s), punch = $('b', s);
      gsap.timeline({ onComplete: () => { location.href = u.href; } })
        .set(bar, { left: 0, opacity: 1 })
        .to(bar, { left: '100%', duration: .62, ease: 'none' })
        .set(bar, { opacity: 0 })
        .fromTo(punch, { opacity: 0, scale: .6 }, { opacity: .55, scale: 1, duration: .09, ease: 'power1.out' })
        .to(punch, { opacity: 0, duration: .22 })
        .to(voile, { opacity: 1, duration: .25 }, '-=.2');
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(voile, { opacity: 0 }); });
  }

  /* ---------- Faisceau ---------- */
  const VHcore = window.VHcore = { pointer: { x: .72, y: .35 }, beam: { intensity: 1, target: null }, Player, drawWave, provisoire, grok, pochette, moodImg, t, L, ICO, fmt, store, $, $$, get lang() { return lang; }, get calm() { return calm; }, tracksBySlug };
  function initBeam() {
    const cv = $('#faisceau');
    import('./beam.mjs').then(m => m.initBeam(cv, VHcore)).catch(() => { cv.remove(); });
  }

  /* ---------- Révélations communes ---------- */
  function initReveals() {
    if (calm) return;
    $$('[data-split]').forEach(el => {
      if (!window.SplitText) return;
      const sp = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ligne-split' });
      gsap.from(sp.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('.repere .trait').forEach(tr => gsap.from(tr, { scaleX: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: tr, start: 'top 90%' } }));
    $$('[data-reveal]').forEach(el => gsap.from(el, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  }

  function start() {
    buildChrome();
    applyLang();
    $$('.langue button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
    const bc = $('.btn-calme');
    if (bc) { bc.setAttribute('aria-pressed', String(calm)); bc.addEventListener('click', () => setCalm(!calm)); }
    initScroll();
    initCursor();
    initTransitions();
    initBeam();
    document.dispatchEvent(new CustomEvent('vh:ready'));
    initReveals();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
  VHcore.start = start;
  VHcore.lenis = () => lenis;
})();
