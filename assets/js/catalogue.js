/* Catalogue : filtres, liste animée, fiche morceau, demande de licence (simulée). */
(function () {
  const D = window.VH, C = window.VHcore;
  const { $, $$, t, L, Player, drawWave, grok, pochette, ICO, store } = C;
  const calm = C.calm;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const PRIX = D.LICENCE_PRIX;
  const euro = (n) => C.lang === 'en' ? '€' + n.toLocaleString('en-GB') : n.toLocaleString('fr-FR') + ' €';
  const sec = (mmss) => { const [m, s] = mmss.split(':').map(Number); return m * 60 + s; };

  const state = { q: '', moods: new Set(), genres: new Set(), inst: new Set(), tri: 'defaut' };
  let panier = [];
  try { panier = JSON.parse(store.get('panier') || '[]').filter(s => C.tracksBySlug[s]); } catch (e) { panier = []; }
  const savePanier = () => { store.set('panier', JSON.stringify(panier)); $('#nb-panier').textContent = panier.length; };

  const INSTS = (() => {
    const c = {}; D.TRACKS.forEach(tr => tr.inst.forEach(i => { c[i] = (c[i] || 0) + 1; }));
    return Object.keys(c).sort((a, b) => c[b] - c[a]);
  })();

  /* ---------- Filtres ---------- */
  function puces() {
    const mk = (box, entries, set) => {
      box.innerHTML = entries.map(([k, label]) => `<button type="button" class="puce" data-k="${esc(k)}" aria-pressed="${set.has(k)}">${esc(label)}</button>`).join('');
      $$('.puce', box).forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k; set.has(k) ? set.delete(k) : set.add(k);
        b.setAttribute('aria-pressed', String(set.has(k))); apply();
      }));
    };
    mk($('#f-humeur'), Object.entries(D.MOODS).map(([k, v]) => [k, L(v)]), state.moods);
    mk($('#f-genre'), Object.entries(D.GENRES).map(([k, v]) => [k, L(v)]), state.genres);
    mk($('#f-inst'), INSTS.map(i => [i, i]), state.inst);
  }

  /* ---------- Liste ---------- */
  const list = $('#morceaux');
  function rowHTML(tr, i) {
    const pk = window.VH_PEAKS[tr.slug];
    const dans = panier.includes(tr.slug);
    return `<li class="morceau" data-slug="${tr.slug}" data-i="${i}">
      <div class="pochette" aria-hidden="true">${pochette(tr, 'vignette')}</div>
      <div class="col-lecture"><button class="lecture" type="button" ${tr.audio ? '' : 'disabled'} aria-label="${esc(t('player.play', 'Lecture'))} : ${esc(tr.title)}">${ICO.play}</button></div>
      <div class="col-titre"><button class="titre-btn" type="button" aria-haspopup="dialog">${esc(tr.title)}</button>
        <span class="sous">${esc(L(D.GENRES[tr.genre]))}${tr.audio ? '' : ` · <span class="manque">${t('excerpt.missing', 'Extrait à fournir')}</span>`}</span></div>
      <div class="tags"><span class="humeur">${esc(L(D.MOODS[tr.mood]))}</span><br>${esc(tr.inst.join(', '))}</div>
      <div class="col-onde"><canvas aria-hidden="true"></canvas></div>
      <span class="duree-t" title="${esc(t('cat.total', 'Durée totale'))}">${tr.total}</span>
      <div class="col-ajout"><button class="btn ajout" type="button" aria-pressed="${dans}">${dans ? t('cat.added', 'Ajouté') : t('cat.add', 'Ajouter') + ' · ' + euro(PRIX)}</button></div>
    </li>`;
  }
  function renderList() {
    list.innerHTML = D.TRACKS.map(rowHTML).join('');
    $$('.morceau', list).forEach(li => {
      const slug = li.dataset.slug;
      $('.lecture', li).addEventListener('click', () => { Player.setQueue(visibleSlugs()); Player.toggle(slug); });
      $('.titre-btn', li).addEventListener('click', (e) => openFiche(slug, e.currentTarget));
      $('.ajout', li).addEventListener('click', (e) => toggleAjout(slug, e.currentTarget, li));
    });
    apply(true);
  }
  const visibleSlugs = () => $$('.morceau', list).filter(li => !li.hidden).map(li => li.dataset.slug);
  function match(tr) {
    const q = state.q.trim().toLowerCase();
    if (q && !(tr.title.toLowerCase().includes(q) || tr.inst.join(' ').toLowerCase().includes(q) || L(D.MOODS[tr.mood]).toLowerCase().includes(q))) return false;
    if (state.moods.size && !state.moods.has(tr.mood)) return false;
    if (state.genres.size && !state.genres.has(tr.genre)) return false;
    if (state.inst.size && ![...state.inst].every(i => tr.inst.includes(i))) return false;
    return true;
  }
  function apply(first) {
    const items = $$('.morceau', list);
    const fstate = (!first && !calm && window.Flip) ? Flip.getState(items) : null;
    let n = 0;
    items.forEach(li => { const ok = match(C.tracksBySlug[li.dataset.slug]); li.hidden = !ok; if (ok) n++; });
    const sorted = items.slice().sort((a, b) => {
      const A = C.tracksBySlug[a.dataset.slug], B = C.tracksBySlug[b.dataset.slug];
      if (state.tri === 'titre') return A.title.localeCompare(B.title);
      if (state.tri === 'duree') return sec(A.total) - sec(B.total);
      return a.dataset.i - b.dataset.i;
    });
    sorted.forEach(li => list.appendChild(li));
    $('#resume').textContent = `${n} ${t('cat.count', 'morceaux')}`;
    $('#vide').hidden = n > 0;
    $('#n-inst').textContent = state.inst.size ? `(${state.inst.size})` : '';
    if (fstate) Flip.from(fstate, { duration: .6, ease: 'power3.inOut', absolute: false, nested: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .45 }),
      onLeave: els => gsap.to(els, { opacity: 0, duration: .25 }) });
    drawAll();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function drawAll() {
    $$('.morceau', list).forEach(li => {
      if (li.hidden) return;
      const slug = li.dataset.slug, pk = window.VH_PEAKS[slug];
      const p = Player.current === slug && Player.audio.duration ? Player.audio.currentTime / Player.audio.duration : 0;
      drawWave($('canvas', li), pk && pk.p, p, { step: 3 });
    });
  }
  function syncPlay() {
    $$('.morceau', list).forEach(li => {
      const on = li.dataset.slug === Player.current && Player.playing();
      li.classList.toggle('actif', on);
      const b = $('.lecture', li); if (!b.disabled) b.innerHTML = on ? ICO.pause : ICO.play;
    });
    const f = $('#panneau-fiche');
    if (f.classList.contains('ouvert')) { const b = $('.fiche-lecture', f); if (b) b.innerHTML = (Player.playing() && Player.current === f.dataset.slug ? ICO.pause : ICO.play) + `<span>${Player.playing() && Player.current === f.dataset.slug ? t('player.pause', 'Pause') : t('player.play', 'Lecture')}</span>`; }
  }

  /* ---------- Panier ---------- */
  function toggleAjout(slug, btn, li) {
    const i = panier.indexOf(slug);
    if (i >= 0) panier.splice(i, 1); else { panier.push(slug); if (li) envol(li); }
    savePanier();
    $$(`.morceau[data-slug="${slug}"] .ajout`).forEach(b => { const d = panier.includes(slug); b.setAttribute('aria-pressed', String(d)); b.textContent = d ? t('cat.added', 'Ajouté') : t('cat.add', 'Ajouter') + ' · ' + euro(PRIX); });
    renderFiche(); renderPanier();
  }
  function envol(li) {
    if (calm) return;
    const src = $('.pochette', li).getBoundingClientRect(), dst = $('#btn-panier').getBoundingClientRect();
    const v = document.createElement('div'); v.className = 'vol'; v.innerHTML = $('.pochette', li).innerHTML; document.body.appendChild(v);
    gsap.set(v, { left: src.left, top: src.top, width: src.width, height: src.height });
    gsap.timeline({ onComplete: () => { v.remove(); gsap.fromTo('#btn-panier', { scale: 1.12 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)' }); } })
      .to(v, { left: dst.left + dst.width / 2 - 14, width: 28, height: 28, rotate: -12, duration: .75, ease: 'power2.inOut' }, 0)
      .to(v, { top: Math.min(src.top, dst.top) - 120, duration: .35, ease: 'power2.out' }, 0)
      .to(v, { top: dst.top + dst.height / 2 - 14, duration: .4, ease: 'power2.in' }, .35)
      .to(v, { opacity: 0, duration: .15 }, .65);
  }
  function renderPanier() {
    const box = $('#panier-corps');
    if (box.dataset.done === '1') return;
    if (!panier.length) { box.innerHTML = `<p class="texte">${t('cart.empty', 'Votre demande est vide. Ajoutez des morceaux depuis le catalogue.')}</p>`; return; }
    box.innerHTML = `<ul class="panier-liste">${panier.map(s => `<li><span class="oeuvre">${esc(C.tracksBySlug[s].title)}</span><span>${euro(PRIX)} <button type="button" data-s="${s}">${t('cart.remove', 'Retirer')}</button></span></li>`).join('')}</ul>
      <p class="total"><span>${t('cart.total', 'Total (régime de TVA à compléter)')}</span><b>${euro(PRIX * panier.length)}</b></p>
      <p class="texte" style="font-size:14px">${t('sheet.terms', 'Un projet · monde entier · perpétuelle · non exclusive')}</p>
      <form id="form-licence" novalidate>
        <div class="champ"><label for="l-nom">${t('cart.name', 'Nom')}</label><input id="l-nom" autocomplete="name" required></div>
        <div class="champ"><label for="l-email">${t('cart.email', 'E-mail')}</label><input id="l-email" type="email" autocomplete="email" required></div>
        <div class="champ"><label for="l-projet">${t('cart.project', 'Titre du projet')}</label><input id="l-projet"></div>
        <p class="erreur" id="l-err"></p>
        <button class="btn rec" type="submit">${t('cart.send', 'Envoyer la demande de licence')}</button>
      </form>`;
    $$('button[data-s]', box).forEach(b => b.addEventListener('click', () => toggleAjout(b.dataset.s)));
    $('#form-licence', box).addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('#l-err', box); err.textContent = '';
      if (!$('#l-nom', box).value.trim()) { err.textContent = C.lang === 'en' ? 'Enter your name.' : 'Indiquez votre nom.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#l-email', box).value.trim())) { err.textContent = C.lang === 'en' ? 'Enter a valid email address, for example name@domain.com.' : 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.'; return; }
      box.dataset.done = '1';
      box.innerHTML = `<p class="titre-m" style="margin-bottom:12px">✓</p><p class="texte" role="status">${t('cart.done', 'Demande prête. Dans cette maquette, rien n’est envoyé et rien n’est facturé.')}</p>`;
      panier = []; savePanier();
      $$('.ajout').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.textContent = t('cat.add', 'Ajouter') + ' · ' + euro(PRIX); });
    });
  }

  /* ---------- Panneaux ---------- */
  let retour = null;
  function ouvrir(p) {
    retour = document.activeElement;
    $$('.panneau.ouvert').forEach(x => x !== p && x.classList.remove('ouvert'));
    p.classList.add('ouvert'); $('#fond-panneau').classList.add('ouvert');
    const l = C.lenis(); if (l) l.stop();
    setTimeout(() => p.focus(), 50);
  }
  function fermer() {
    $$('.panneau.ouvert').forEach(x => x.classList.remove('ouvert'));
    $('#fond-panneau').classList.remove('ouvert');
    const l = C.lenis(); if (l) l.start();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (retour) retour.focus();
  }
  $$('.panneau .fermer').forEach(b => { b.innerHTML = ICO.close; b.addEventListener('click', fermer); });
  $('#fond-panneau').addEventListener('click', fermer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermer();
    if (e.key === 'Tab') {
      const p = $('.panneau.ouvert'); if (!p) return;
      const f = $$('button, a[href], input, select, textarea, canvas[tabindex]', p).filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#btn-panier').addEventListener('click', () => { const b = $('#panier-corps'); if (b.dataset.done === '1' && panier.length) b.dataset.done = ''; renderPanier(); ouvrir($('#panneau-panier')); });

  function openFiche(slug) {
    const p = $('#panneau-fiche'); p.dataset.slug = slug; renderFiche(); ouvrir(p); syncPlay();
    history.replaceState(null, '', '#' + slug);
  }
  function renderFiche() {
    const p = $('#panneau-fiche'), slug = p.dataset.slug; if (!slug) return;
    const tr = C.tracksBySlug[slug], pk = window.VH_PEAKS[slug], dans = panier.includes(slug);
    const ref = 'index.html?ref=' + slug + (C.lang === 'en' ? '&lang=en' : '') + '#projet';
    $('#fiche-corps').innerHTML = `<div class="grande-pochette">${pochette(tr, 'carre')}</div>
      <h3 id="fiche-titre">${esc(tr.title)}</h3>
      <dl><dt>${t('cat.genre', 'Genre')}</dt><dd>${esc(L(D.GENRES[tr.genre]))}</dd>
        <dt>${t('cat.mood', 'Humeur')}</dt><dd>${esc(L(D.MOODS[tr.mood]))}</dd>
        <dt>${t('cat.inst', 'Instruments')}</dt><dd>${esc(tr.inst.join(', '))}</dd>
        <dt>${t('cat.total', 'Durée totale')}</dt><dd>${tr.total}${pk ? ` · ${t('excerpt', 'extrait')} ${Math.round(pk.d)} s` : ''}</dd></dl>
      ${tr.audio ? `<button class="btn fiche-lecture" type="button">${ICO.play}<span>${t('player.play', 'Lecture')}</span></button><canvas id="fiche-onde" tabindex="0" aria-label="Position de lecture"></canvas>`
        : `<p class="etiquette-demo">${t('excerpt.missing', 'Extrait à fournir')}</p><p class="texte" style="font-size:14px;margin-top:8px">${C.lang === 'en' ? 'On the current site this track plays the same file as another one.' : 'Sur le site actuel, ce morceau joue le même fichier qu’un autre morceau.'}</p>`}
      <div class="bloc-licence"><span class="texte" style="font-size:14px">${t('sheet.licence', 'Licence professionnelle')}</span>
        <div class="prix">${euro(PRIX)}</div><p>${t('sheet.terms', 'Un projet · monde entier · perpétuelle · non exclusive')}</p>
        <button class="btn ${dans ? 'clair' : 'rec'}" type="button" id="fiche-ajout" aria-pressed="${dans}">${dans ? t('cat.added', 'Ajouté') : t('sheet.add', 'Ajouter à ma demande de licence')}</button></div>
      <a class="btn" href="${ref}">${t('sheet.custom', 'Demander une composition dans cet esprit')}</a>`;
    const b = $('.fiche-lecture'); if (b) b.addEventListener('click', () => Player.toggle(slug));
    $('#fiche-ajout').addEventListener('click', () => toggleAjout(slug, null, $(`.morceau[data-slug="${slug}"]`)));
    const cv = $('#fiche-onde');
    if (cv) {
      const seek = (frac) => { if (Player.current !== slug) { Player.play(slug); Player.audio.addEventListener('loadedmetadata', () => { Player.audio.currentTime = frac * Player.audio.duration; }, { once: true }); } else if (Player.audio.duration) Player.audio.currentTime = frac * Player.audio.duration; };
      cv.addEventListener('click', (e) => { const r = cv.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); });
      cv.addEventListener('keydown', (e) => { if (Player.current === slug && Player.audio.duration && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { Player.audio.currentTime += e.key === 'ArrowRight' ? 5 : -5; } });
      requestAnimationFrame(drawFiche);
    }
    syncPlay();
  }
  function drawFiche() {
    const p = $('#panneau-fiche'), slug = p.dataset.slug, cv = $('#fiche-onde');
    if (!cv || !slug) return;
    const pk = window.VH_PEAKS[slug];
    drawWave(cv, pk && pk.p, Player.current === slug && Player.audio.duration ? Player.audio.currentTime / Player.audio.duration : 0, { step: 4 });
  }

  /* ---------- Ouverture de page ---------- */
  function intro() {
    $('#fond-cat').innerHTML = grok('catalogue-ouverture', '', { ph: 'affiche', eager: true });
    $('#fond-sm').innerHTML = grok('catalogue-sur-mesure', '', { ph: 'piano-mains' });
    if (calm) return;
    const h = $('#titre-cat');
    if (window.SplitText) { const sp = SplitText.create(h, { type: 'chars', mask: 'lines' }); gsap.from(sp.chars, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .05, delay: .2 }); }
    gsap.fromTo('#fond-cat', { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'expo.out' });
    gsap.to('#fond-cat', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.ouverture-int', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.ouverture-int .chapeau, .ouverture-int .texte', { opacity: 0, y: 24, duration: 1, delay: .6, stagger: .12 });
    gsap.from('.morceau', { opacity: 0, y: 26, duration: .7, ease: 'power3.out', stagger: .035, scrollTrigger: { trigger: '#morceaux', start: 'top 85%' } });
    gsap.fromTo('#fond-sm', { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.sur-mesure', start: 'top bottom', end: 'bottom top', scrub: true } });
    C.beam.target = [.75, .62];
    gsap.delayedCall(1.8, () => { C.beam.target = null; });
  }

  document.addEventListener('vh:ready', () => {
    C.beam.intensity = .6;
    puces(); renderList(); savePanier(); intro();
    $('#recherche').addEventListener('input', (e) => { state.q = e.target.value; apply(); });
    $('#tri').addEventListener('change', (e) => { state.tri = e.target.value; apply(); });
    $('#reset').addEventListener('click', () => { state.q = ''; $('#recherche').value = ''; state.moods.clear(); state.genres.clear(); state.inst.clear(); puces(); apply(); });
    document.addEventListener('vh:track', syncPlay);
    Player.audio.addEventListener('timeupdate', () => { drawAll(); drawFiche(); });
    window.addEventListener('resize', drawAll);
    document.addEventListener('vh:lang', () => { puces(); renderList(); renderFiche(); renderPanier(); });
    const h = location.hash.slice(1);
    if (h && C.tracksBySlug[h]) setTimeout(() => openFiche(h), 400);
    Player.setQueue(D.TRACKS.map(x => x.slug));
  });
  C.start();
})();
