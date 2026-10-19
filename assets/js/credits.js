/* Crédits et presse : mosaïque d’ouverture, filmographie filtrable, visionneuse, presse, générique. */
(function () {
  const D = window.VH, C = window.VHcore;
  const { $, $$, t, L, grok, ICO } = C;
  const calm = C.calm;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const AC = () => `<span class="a-completer">${L(D.AC)}</span>`;
  const val = (v) => { const x = L(v); return (!x || x === L(D.AC)) ? AC() : esc(x); };
  let filtre = 'tous';

  function mosaique() {
    const box = $('#mosaique');
    const imgs = D.CREDITS.filter(c => c.img).map(c => c.img);
    const all = imgs.concat(imgs).slice(0, 24);
    box.innerHTML = all.map(i => `<img src="assets/img/affiches/${i}-480.webp" alt="" loading="eager" decoding="async">`).join('');
    if (calm) return;
    const els = $$('img', box);
    gsap.from(els, { opacity: 0, scale: .6, rotate: () => gsap.utils.random(-14, 14), x: () => gsap.utils.random(-200, 200), y: () => gsap.utils.random(-160, 160), duration: 1.6, ease: 'expo.out', stagger: { each: .03, from: 'random' } });
    gsap.to(box, { yPercent: -16, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.ouverture-int', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function filtres() {
    const box = $('#filtres-credits');
    const types = ['tous'].concat(Object.keys(D.TYPES).filter(k => D.CREDITS.some(c => c.type === k)));
    box.innerHTML = types.map(k => `<button type="button" class="puce" data-k="${k}" aria-pressed="${k === filtre}">${k === 'tous' ? t('cr.all', 'Tous') : esc(L(D.TYPES[k]))}</button>`).join('');
    $$('.puce', box).forEach(b => b.addEventListener('click', () => { filtre = b.dataset.k; filtres(); apply(); }));
  }

  function grille() {
    const box = $('#grille-credits');
    box.innerHTML = D.CREDITS.map(c => {
      const vis = c.img
        ? `<img src="assets/img/affiches/${c.img}-480.webp" srcset="assets/img/affiches/${c.img}-480.webp 480w, assets/img/affiches/${c.img}-960.webp 960w" sizes="(max-width: 760px) 45vw, 24vw" alt="${C.lang === 'en' ? 'Poster:' : 'Affiche :'} ${esc(L(c.title))}" loading="lazy">`
        : `<img class="logo-seul" src="assets/img/logos/${c.logo}.webp" alt="${esc(L(c.title))}" loading="lazy">`;
      return `<article class="credit" data-id="${c.id}" data-type="${c.type}">
        <button class="ouvrir" type="button" aria-haspopup="dialog" data-curseur="Voir" data-curseur-en="View">${vis}</button>
        <h3>${esc(L(c.title))}</h3>
        <p class="m">${esc(L(D.TYPES[c.type]))}, ${val(c.year)}</p>
        <p class="r">${val(c.role)}</p></article>`;
    }).join('');
    $$('.credit .ouvrir', box).forEach(b => b.addEventListener('click', () => ouvrir(b.closest('.credit').dataset.id, b)));
    apply(true);
    if (!calm) gsap.from('.credit', { opacity: 0, y: 50, duration: .9, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: box, start: 'top 85%' } });
  }
  function apply(first) {
    const items = $$('.credit');
    const st = (!first && !calm && window.Flip) ? Flip.getState(items) : null;
    items.forEach(el => { el.hidden = !(filtre === 'tous' || el.dataset.type === filtre); });
    if (st) Flip.from(st, { duration: .6, ease: 'power3.inOut', scale: true, onEnter: e => gsap.fromTo(e, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .4 }), onLeave: e => gsap.to(e, { opacity: 0, duration: .2 }) });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  let retour = null;
  function ouvrir(id, from) {
    retour = from;
    const c = D.CREDITS.find(x => x.id === id), v = $('#visionneuse');
    $('#v-img').innerHTML = c.img
      ? `<img src="assets/img/affiches/${c.img}-960.webp" alt="${C.lang === 'en' ? 'Poster:' : 'Affiche :'} ${esc(L(c.title))}">`
      : `<img src="assets/img/logos/${c.logo}.webp" alt="${esc(L(c.title))}" style="max-width:360px;background:#fff;padding:20px">`;
    $('#v-txt').innerHTML = `<h2 id="v-titre">${esc(L(c.title))}</h2>
      <dl><dt>${C.lang === 'en' ? 'Type' : 'Type'}</dt><dd>${esc(L(D.TYPES[c.type]))}</dd>
      <dt>${t('cr.by', 'Projet')}</dt><dd>${esc(L(c.by))}</dd>
      <dt>${t('cr.year', 'Année')}</dt><dd>${val(c.year)}</dd>
      <dt>${t('cr.role', 'Rôle')}</dt><dd>${val(c.role)}</dd></dl>
      ${c.note ? `<p class="note-v">${esc(L(c.note))}</p>` : ''}
      ${c.alt ? `<p class="texte" style="margin-top:16px;font-size:14px">${t('cr.alt', 'Autre affiche')} :</p><img src="assets/img/affiches/${c.alt}-480.webp" alt="" style="width:120px;margin-top:8px">` : ''}
      ${c.link ? `<p style="margin-top:20px"><a class="btn" href="${c.link.href}" target="_blank" rel="noopener">${esc(L(c.link.label))}</a></p>` : ''}`;
    v.classList.add('ouvert');
    const l = C.lenis(); if (l) l.stop();
    setTimeout(() => v.focus(), 50);
    if (!calm) gsap.fromTo('#v-img img', { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .7, ease: 'expo.out' });
  }
  function fermer() {
    const v = $('#visionneuse'); if (!v.classList.contains('ouvert')) return;
    v.classList.remove('ouvert'); const l = C.lenis(); if (l) l.start(); if (retour) retour.focus();
  }

  function presse() {
    const box = $('#presse');
    const q = D.QUOTES.filter(x => x.about);
    const render = () => {
      const lg = C.lang;
      box.innerHTML = `<article class="presse-carte"><div class="vis"><img src="assets/img/affiches/city-tales-affiche-480.webp" alt="" loading="lazy"></div>
          ${q.map(x => `<blockquote>${esc(x.lang === lg ? x.text : x.tr)}</blockquote><p class="src">${esc(L(x.src))}${x.lang !== lg ? ` · <span class="etiquette-demo">${t('quotes.tr', 'traduction')}</span>` : ''}</p>`).join('<br>')}
          <p><a class="lien-trace" href="https://open.spotify.com/intl-fr/album/2gXQ4p81KdL2HheDCLF2NX" target="_blank" rel="noopener" style="color:var(--or)">Spotify</a></p></article>
        <article class="presse-carte"><div class="vis"><img class="photo" src="assets/img/photos/apulia-2026-640.webp" alt="Groupe des compositeurs nommés aux Apulia Soundtrack Awards 2026" loading="lazy"></div>
          <blockquote style="font-size:20px">${t('press.apulia', 'En juillet 2026, il fait partie des compositeurs internationaux nommés dans la catégorie compositeur émergent aux Apulia Soundtrack Awards, à Carovigno (Italie).')}</blockquote>
          <p><a class="lien-trace" href="https://apuliasoundtrack.com/emerging-composers/" target="_blank" rel="noopener" style="color:var(--or)">${t('press.more', 'En savoir plus')}</a></p></article>
        <article class="presse-carte"><div class="vis" style="background:#fff"><img src="assets/img/logos/world-soundtrack-awards.webp" alt="World Soundtrack Awards" loading="lazy" style="max-width:70%"></div>
          <blockquote style="font-size:20px">${t('press.wsa', 'Benoît Vanhoffelen est membre votant de la World Soundtrack Academy en tant que compositeur de musique de film et de jeu vidéo.')}</blockquote>
          <p><a class="lien-trace" href="https://www.worldsoundtrackawards.com/persons/benoit-vanhoffelen" target="_blank" rel="noopener" style="color:var(--or)">${t('press.more', 'En savoir plus')}</a></p></article>`;
    };
    render();
    document.addEventListener('vh:lang', render);
    if (!calm) gsap.from('.presse-carte', { opacity: 0, y: 40, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: box, start: 'top 85%' } });
  }

  function kit() {
    if (calm) return;
    const fig = $('.kit .portrait');
    gsap.fromTo(fig, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: fig, start: 'top 82%' } });
    gsap.to($('.balayage', fig), { xPercent: 240, duration: 2, ease: 'power2.inOut', delay: .8, scrollTrigger: { trigger: fig, start: 'top 82%' } });
  }

  document.addEventListener('vh:ready', () => {
    C.beam.intensity = .55;
    $('#fond-cr').innerHTML = grok('credits-ouverture', '', { ph: 'affiche', eager: true });
    if (!calm) {
      gsap.fromTo('#fond-cr', { opacity: 0 }, { opacity: .7, duration: 2 });
      if (window.SplitText) { const sp = SplitText.create('#titre-cr', { type: 'words', mask: 'lines' }); gsap.from(sp.words, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .08, delay: .3 }); }
    }
    mosaique(); filtres(); grille(); C.frise($('#frise')); presse(); kit(); C.generique($('#defilant'), $('#generique'));
    $('#visionneuse .fermer').innerHTML = ICO.close;
    $('#visionneuse .fermer').addEventListener('click', fermer);
    $('#visionneuse').addEventListener('click', (e) => { if (e.target.id === 'visionneuse') fermer(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
    document.addEventListener('vh:lang', () => { filtres(); grille(); });
  });
  C.start();
})();
