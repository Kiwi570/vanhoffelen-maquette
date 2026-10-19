/* Accueil : amorce, ouverture, pellicule, domaines, compositeur, écoute, distinctions, sous-titres, générique, fiche projet. */
(function () {
  const D = window.VH, C = window.VHcore;
  const { $, $$, t, L, Player, drawWave, grok, ICO } = C;
  const calm = C.calm;
  const desktop = () => window.matchMedia('(min-width: 861px)').matches;
  const SELECTION = ['letters-never-sent', 'before-the-fall', 'into-the-unknown', 'towards-the-light', 'where-the-wild-light-grows', 'small-beginnings'];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* ---------- Amorce ---------- */
  function amorce(done) {
    const el = $('.amorce');
    const lb = $$('.ouverture .letterbox');
    if (calm) { el.remove(); done(); return; }
    let seen = false;
    try { seen = sessionStorage.getItem('vh-amorce') === '1'; sessionStorage.setItem('vh-amorce', '1'); } catch (e) { /* rien */ }
    const chiffre = $('.chiffre', el), balai = $('.balai', el), tc = $('.tc-amorce', el);
    const arc = (a) => {
      const r = 100, x = Math.sin(a) * r, y = -Math.cos(a) * r, large = a > Math.PI ? 1 : 0;
      return `M0 0 L0 -100 A100 100 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
    };
    gsap.set(lb, { height: '50%' });
    const tl = gsap.timeline({ onComplete: () => { el.remove(); done(); } });
    const finish = () => tl.progress(1);
    $('.passer', el).addEventListener('click', finish);
    window.addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { finish(); window.removeEventListener('keydown', k); } });
    const counts = seen ? [1] : [3, 2, 1];
    const per = seen ? .45 : .62;
    counts.forEach((n, i) => {
      const o = { a: 0 };
      tl.call(() => { chiffre.textContent = n; }, null, i * per)
        .to(o, { a: Math.PI * 2, duration: per, ease: 'none', onUpdate: () => {
          balai.setAttribute('d', arc(Math.min(o.a, Math.PI * 2 - .001)));
          const f = Math.floor((i * per + o.a / (Math.PI * 2) * per) * 24);
          tc.textContent = `00:00:${String(Math.floor(f / 24)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`;
        } }, i * per);
    });
    tl.to(el, { opacity: 0, duration: .35, ease: 'power2.in' });
  }

  /* ---------- Ouverture ---------- */
  function ouverture() {
    const sec = $('.ouverture'), img = $('.fond img', sec), lb = $$('.letterbox', sec);
    const h1 = $('h1', sec);
    $('#btn-ecouter').addEventListener('click', () => { Player.setQueue(SELECTION.concat(D.TRACKS.map(x => x.slug).filter(s => !SELECTION.includes(s)))); Player.toggle(Player.current || SELECTION[0]); });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom 30%', onToggle: (st) => { C.beam.intensity = st.isActive ? 1 : .42; } });
    if (calm) return () => {};
    let sp = null;
    if (window.SplitText) sp = SplitText.create(h1, { type: 'words,lines', mask: 'lines' });
    gsap.set([$('.bas', sec), $('.faits', sec)], { opacity: 0, y: 24 });
    gsap.to(img, { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to($('.contenu', sec), { y: -90, opacity: .2, ease: 'none', scrollTrigger: { trigger: sec, start: 'center center', end: 'bottom top', scrub: true } });
    return () => {
      const tl = gsap.timeline();
      tl.to(lb, { height: 0, duration: 1.3, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.18, filter: 'brightness(.3)' }, { scale: 1, filter: 'brightness(1)', duration: 2, ease: 'expo.out', clearProps: 'filter' }, 0)
        .from(sp ? sp.words : h1, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .06 }, .35)
        .to([$('.bas', sec), $('.faits', sec)], { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12 }, .8);
      C.beam.target = [.18, .2];
      gsap.delayedCall(1.6, () => { C.beam.target = null; });
    };
  }

  /* ---------- 1M2 Pellicule ---------- */
  function pellicule() {
    const strip = $('#pellicule');
    const items = D.CREDITS.filter(c => c.img);
    const render = () => {
      strip.innerHTML = items.map((c, i) => {
        const meta = [L(D.TYPES[c.type]), L(c.year) && L(c.year) !== L(D.AC) ? L(c.year) : null].filter(Boolean).join(', ');
        return `<figure class="image-film" data-curseur="Voir" data-curseur-en="View">
          <span class="num-image" aria-hidden="true">VH ${String(i + 1).padStart(2, '0')}</span>
          <div class="cadre-affiche"><img src="assets/img/affiches/${c.img}-480.webp" srcset="assets/img/affiches/${c.img}-480.webp 480w, assets/img/affiches/${c.img}-960.webp 960w" sizes="(max-width: 860px) 70vw, 26vw" alt="${C.lang === 'en' ? 'Poster:' : 'Affiche :'} ${esc(L(c.title))}" loading="lazy" decoding="async"><span class="ombre" aria-hidden="true"></span></div>
          <figcaption><span class="t">${esc(L(c.title))}</span><span class="m">${esc(meta)}</span></figcaption></figure>`;
      }).join('');
      $$('.image-film', strip).forEach(f => f.addEventListener('click', () => { location.href = 'credits.html' + (C.lang === 'en' ? '?lang=en' : '') + '#filmographie'; }));
    };
    render();
    document.addEventListener('vh:lang', () => { render(); ScrollTrigger.refresh(); });
    const sec = $('.pellicule-scene'), piste = $('.pellicule-piste'), jauge = $('.pellicule-aide .jauge i');
    const light = () => {
      const frames = $$('.image-film', strip); const mid = innerWidth / 2;
      let best = null, bd = 1e9;
      frames.forEach(f => { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = f; } });
      frames.forEach(f => f.classList.toggle('allume', f === best));
      return best;
    };
    if (calm || !desktop()) {
      piste.addEventListener('scroll', () => { light(); jauge.style.width = (piste.scrollLeft / (piste.scrollWidth - piste.clientWidth) * 100) + '%'; }, { passive: true });
      light();
      return;
    }
    const dist = () => strip.scrollWidth - innerWidth;
    gsap.to(strip, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (st) => {
          jauge.style.width = (st.progress * 100) + '%';
          const f = light();
          if (f) { const r = f.getBoundingClientRect(); C.beam.target = [(r.left + r.width / 2) / innerWidth, 1 - (r.top + r.height * .45) / innerHeight]; }
        },
        onToggle: (st) => { if (!st.isActive) C.beam.target = null; else C.beam.intensity = .85; }
      }
    });
    gsap.from('.image-film', { opacity: 0, y: 60, rotate: 2, stagger: .05, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 70%' } });
  }

  /* ---------- 1M3 Domaines ---------- */
  const DOMAINES = [
    { k: 'cinema', img: 'accueil-domaine-cinema', track: 'letters-never-sent', titre: 'Cinéma', texte: 'Courts et longs métrages, de la première version au mixage final.', ex: ['tarte-au-citron', 'voyage-eaux-troubles', 'qazaqi'] },
    { k: 'doc', img: 'accueil-domaine-documentaire', track: 'fragile-horizons', titre: 'Documentaire', texte: 'Une musique au service du sujet : nature, histoire, enquête.', ex: ['espartes', 'suppliciees'] },
    { k: 'anim', img: 'accueil-domaine-animation', track: 'where-the-wild-light-grows', titre: 'Animation', texte: 'Des partitions écrites image par image avec les équipes d’animation.', ex: ['chant-de-rome', 'novara'] },
    { k: 'game', img: 'accueil-domaine-jeu', track: 'under-the-old-kingdom', titre: 'Jeu vidéo et escape game', texte: 'Bandes originales pour jeux PC, jeux de rôle et salles immersives.', ex: ['city-tales', 'heartless', 'le-donjon'] }
  ];
  function domaines() {
    const box = $('#domaines');
    const byId = Object.fromEntries(D.CREDITS.map(c => [c.id, c]));
    const render = () => {
      box.innerHTML = DOMAINES.map(d => {
        const tr = C.tracksBySlug[d.track];
        return `<article class="domaine" data-track="${d.track}">
          <div class="media">${grok(d.img, '', { ph: 'affiche', ratio: '2 / 2.6' })}</div>
          <div class="corps">
            <h3>${t('dom.' + d.k, d.titre)}</h3>
            <p>${t('dom.' + d.k + '.t', d.texte)}</p>
            <p class="projets">${d.ex.map(id => `<span class="oeuvre">${esc(L(byId[id].title))}</span>`).join(', ')}</p>
            <canvas class="onde-carte" aria-hidden="true"></canvas>
            <button class="ecoute" type="button">${ICO.play.replace('class="ico"', 'width="14" height="14"')}<span>${t('dom.listen', 'Extrait du catalogue')} : <i>${esc(tr.title)}</i></span></button>
          </div><span class="reflet" aria-hidden="true"></span></article>`;
      }).join('');
      $$('.domaine', box).forEach(card => {
        const slug = card.dataset.track;
        $('.ecoute', card).addEventListener('click', () => Player.toggle(slug));
        if (!calm && matchMedia('(hover: hover)').matches) {
          const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
          card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            ry((px - .5) * 10); rx((.5 - py) * 8);
            card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%');
          });
          card.addEventListener('pointerleave', () => { rx(0); ry(0); });
        }
      });
      drawCards();
    };
    const drawCards = () => $$('.domaine', box).forEach(card => {
      const slug = card.dataset.track, pk = window.VH_PEAKS[slug];
      const p = Player.current === slug && Player.audio.duration ? Player.audio.currentTime / Player.audio.duration : 0;
      drawWave($('canvas', card), pk && pk.p, p, { step: 4 });
    });
    render();
    document.addEventListener('vh:lang', render);
    Player.audio.addEventListener('timeupdate', drawCards);
    window.addEventListener('resize', drawCards);
    if (!calm) gsap.from('.domaine', { y: 90, rotationX: 14, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: box, start: 'top 82%' } });
  }

  /* ---------- 1M4 Compositeur ---------- */
  function compositeur() {
    $('#fond-bureau').innerHTML = grok('accueil-compositeur-bureau', '', { ph: 'affiche' });
    if (calm) return;
    const fig = $('.portrait');
    gsap.fromTo(fig, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 80%' } });
    gsap.to($('.balayage', fig), { xPercent: 240, duration: 2.2, ease: 'power2.inOut', delay: .9, scrollTrigger: { trigger: fig, start: 'top 80%' } });
    gsap.fromTo($('img', fig), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#fond-bureau', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.compositeur', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('[data-compte]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.compte, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    gsap.from('.chiffres > div', { y: 40, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.chiffres', start: 'top 90%' } });
  }

  /* ---------- 1M5 Écoute ---------- */
  function ecoute() {
    $('#fond-studio').innerHTML = grok('accueil-ecoute-studio', '', { ph: 'affiche' });
    const list = $('#liste-extraits');
    const render = () => {
      list.innerHTML = SELECTION.map((slug, i) => {
        const tr = C.tracksBySlug[slug], pk = window.VH_PEAKS[slug];
        return `<li class="extrait" data-slug="${slug}" data-curseur="${Player.current === slug && Player.playing() ? 'Pause' : 'Écouter'}" data-curseur-en="Listen">
          <button class="lecture" type="button" aria-label="${esc(t('player.play', 'Lecture'))} : ${esc(tr.title)}">${ICO.play}</button>
          <div><span class="t">${esc(tr.title)}</span><span class="m">${esc(L(D.MOODS[tr.mood]))}, ${esc(L(D.GENRES[tr.genre]).toLowerCase())} · ${esc(tr.inst.join(', '))}</span></div>
          <span class="d">${C.fmt(pk ? pk.d : 45)}</span></li>`;
      }).join('');
      $$('.extrait', list).forEach(li => li.addEventListener('click', () => { Player.setQueue(SELECTION); Player.toggle(li.dataset.slug); }));
      sync();
    };
    const sync = () => $$('.extrait', list).forEach(li => {
      const on = li.dataset.slug === Player.current && Player.playing();
      li.classList.toggle('actif', on);
      $('.lecture', li).innerHTML = on ? ICO.pause : ICO.play;
    });
    render();
    document.addEventListener('vh:lang', render);
    document.addEventListener('vh:track', sync);
    if (!calm) gsap.from('.extrait', { y: 24, opacity: 0, stagger: .07, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: list, start: 'top 85%' } });

    // Oscilloscope : onde réelle de l’extrait en cours, ou forme d’onde enregistrée au repos
    const cv = $('#oscillo'), ctx = cv.getContext('2d');
    const hum = $('#oscillo-humeur'), tps = $('#oscillo-temps'), tit = $('#oscillo-titre');
    let visible = false;
    ScrollTrigger.create({ trigger: cv, start: 'top bottom', end: 'bottom top', onToggle: (st) => { visible = st.isActive; } });
    const draw = (time) => {
      if (!visible && !calm) return;
      const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(239,232,218,.07)'; ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += w / 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += h / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const slug = Player.current || SELECTION[0], tr = C.tracksBySlug[slug];
      tit.textContent = tr.title; hum.textContent = L(D.MOODS[tr.mood]);
      tps.textContent = C.fmt(Player.audio.currentTime) + ' / ' + C.fmt((window.VH_PEAKS[slug] || {}).d || 45);
      ctx.lineWidth = 2; ctx.strokeStyle = '#D4A857'; ctx.shadowColor = 'rgba(212,168,87,.8)'; ctx.shadowBlur = 12;
      ctx.beginPath();
      if (Player.playing() && Player.an) {
        Player.an.getByteTimeDomainData(Player.wave);
        const n = Player.wave.length;
        for (let i = 0; i < n; i++) { const x = i / (n - 1) * w, y = h / 2 + ((Player.wave[i] - 128) / 128) * h * .42; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      } else {
        const pk = (window.VH_PEAKS[slug] || {}).p || [];
        const tt = calm ? 0 : time * .0012;
        for (let i = 0; i <= 200; i++) {
          const x = i / 200 * w, v = pk[Math.floor(i / 200 * (pk.length - 1))] || 0;
          const y = h / 2 + Math.sin(i * .35 + tt) * v * h * .3;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    };
    if (calm) { draw(0); document.addEventListener('vh:track', () => draw(0)); Player.audio.addEventListener('timeupdate', () => draw(0)); }
    else gsap.ticker.add(() => draw(performance.now()));
  }

  /* ---------- 1M6 Distinctions ---------- */
  function frise() { C.frise($('#frise')); }

  /* ---------- 1M7 Sous-titres ---------- */
  function sousTitres() {
    $('#fond-ecran').innerHTML = grok('accueil-citations-ecran', '', { ph: 'affiche' });
    const box = $('#sous-titre'), cpt = $('#compteur-st');
    let cur = 0;
    const tc = (s) => { const f = Math.floor((s % 1) * 24); s = Math.floor(s); return `00:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
    const render = () => {
      const lg = C.lang;
      box.innerHTML = D.QUOTES.map((q, i) => {
        const shown = q.lang === lg ? q.text : q.tr;
        const vo = q.lang === lg ? '' : `<p class="vo">${esc(q.text)} <span class="etiquette-demo">${lg === 'fr' ? 'VO, sous-titre : ' + t('quotes.tr', 'traduction') : 'original, subtitle: ' + t('quotes.tr', 'translation')}</span></p>`;
        const tin = 754 + i * 6.4, tout = tin + 4.2 + shown.length / 40;
        return `<div class="st-item${i === cur ? ' on' : ''}" data-i="${i}"><span class="tcio">${tc(tin)} → ${tc(tout)}</span>
          <blockquote>${esc(shown)}</blockquote>${vo}<p class="source">${esc(L(q.src))}${q.about ? ` · <span class="oeuvre">${esc(q.about)}</span>` : ''}</p></div>`;
      }).join('') + `<div class="st-points">${D.QUOTES.map((q, i) => `<button type="button" aria-label="${i + 1}" ${i === cur ? 'aria-current="true"' : ''}></button>`).join('')}</div>`;
      $$('.st-points button', box).forEach((b, i) => b.addEventListener('click', () => show(i)));
      cpt.textContent = `${cur + 1} / ${D.QUOTES.length}`;
    };
    const show = (i) => {
      if (i === cur) return;
      const items = $$('.st-item', box), prev = items[cur], next = items[i];
      cur = i;
      $$('.st-points button', box).forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
      cpt.textContent = `${i + 1} / ${D.QUOTES.length}`;
      if (calm) { prev.classList.remove('on'); next.classList.add('on'); return; }
      gsap.to(prev, { opacity: 0, duration: .25, onComplete: () => { prev.classList.remove('on'); gsap.set(prev, { clearProps: 'opacity' });
        next.classList.add('on'); gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: .35 }); } });
    };
    render();
    document.addEventListener('vh:lang', render);
    const ecran = $('#ecran');
    ScrollTrigger.create({ trigger: ecran, start: 'top 60%', end: 'bottom 40%', onToggle: (st) => { if (st.isActive) { C.beam.intensity = .8; C.beam.target = [.5, .78]; } else C.beam.target = null; } });
    if (calm) return;
    ScrollTrigger.create({ trigger: ecran, start: 'top top', end: () => '+=' + innerHeight * (D.QUOTES.length * .6), pin: true, anticipatePin: 1,
      onUpdate: (st) => show(Math.min(D.QUOTES.length - 1, Math.floor(st.progress * D.QUOTES.length))) });
    gsap.fromTo($('#fond-ecran'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: ecran, start: 'top bottom', end: 'top top', scrub: true } });
  }

  /* ---------- 1M8 Générique ---------- */
  function generique() { C.generique($('#defilant'), $('#generique')); }

  /* ---------- 1M9 Fiche projet ---------- */
  function fiche() {
    const form = $('#form-projet'), fiche = $('#fiche-projet');
    const etapes = $$('.etapes li', fiche), panes = $$('.etape', form);
    const prev = $('#f-prec'), next = $('#f-suiv'), send = $('#f-envoi');
    const duree = $('#duree'), out = $('#duree-out');
    let n = 1;
    const updDuree = () => { out.textContent = duree.value + ' ' + t('form.minutes', 'min'); };
    duree.addEventListener('input', updDuree); document.addEventListener('vh:lang', updDuree); updDuree();
    const msg = (k, fr, en) => C.lang === 'en' ? en : fr;
    const valid = (i) => {
      const err = $(`[data-err="${i}"]`, form); err.textContent = '';
      if (i === 1 && !form.type.value) { err.textContent = msg(1, 'Choisissez un type de projet pour continuer.', 'Choose a project type to continue.'); return false; }
      if (i === 4) {
        if (!form.prenom.value.trim()) { err.textContent = msg(4, 'Indiquez votre prénom.', 'Enter your first name.'); form.prenom.focus(); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) { err.textContent = msg(4, 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.', 'Enter a valid email address, for example name@domain.com.'); form.email.focus(); return false; }
      }
      return true;
    };
    const go = (to) => {
      panes.forEach(p => p.classList.toggle('on', +p.dataset.etape === to));
      etapes.forEach((li, i) => { li.toggleAttribute('aria-current', i + 1 === to); if (i + 1 === to) li.setAttribute('aria-current', 'step'); li.classList.toggle('fait', i + 1 < to); });
      prev.hidden = to === 1; next.hidden = to === 4; send.hidden = to !== 4; n = to;
      const first = $(`.etape[data-etape="${to}"] input, .etape[data-etape="${to}"] textarea`, form);
      if (!calm) gsap.from(`.etape[data-etape="${to}"]`, { x: 30, opacity: 0, duration: .45, ease: 'power3.out' });
      if (first && to > 1) first.focus({ preventScroll: true });
    };
    next.addEventListener('click', () => { if (valid(n)) go(n + 1); });
    prev.addEventListener('click', () => go(n - 1));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid(4)) return;
      fiche.classList.add('envoye');
      if (!calm) gsap.from($('.fin-envoi', fiche), { y: 20, opacity: 0, duration: .6 });
    });
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref && C.tracksBySlug[ref]) {
      form.querySelector('input[name="besoin"][value="sur-mesure"]').checked = true;
      form.message.value = (C.lang === 'en' ? 'In the spirit of “' : 'Dans l’esprit de « ') + C.tracksBySlug[ref].title + (C.lang === 'en' ? '”.' : ' ».');
    }
  }

  document.addEventListener('vh:ready', () => {
    const intro = ouverture();
    pellicule(); domaines(); compositeur(); ecoute(); frise(); sousTitres(); generique(); fiche();
    amorce(() => { intro(); ScrollTrigger.refresh(); });
  });
  C.start();
})();
