/* Blocs communes à l’accueil et à la page crédits : frise des distinctions et générique des partenaires. */
(function () {
  const D = window.VH, C = window.VHcore;
  const { $, $$, t, L } = C;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  C.frise = function (box) {
    let st = null;
    const render = () => {
      if (st) { st.scrollTrigger && st.scrollTrigger.kill(); st.kill(); st = null; }
      const today = new Date().toISOString().slice(0, 10);
      const sorted = D.DISTINCTIONS.slice().sort((a, b) => a.date.localeCompare(b.date));
      const avenir = sorted.filter(d => d.date >= today), passees = sorted.filter(d => d.date < today);
      const card = (d) => {
        const img = d.img.kind === 'photos'
          ? `<img class="photo" src="assets/img/photos/${d.img.src}-640.webp" alt="" loading="lazy">`
          : `<img src="assets/img/affiches/${d.img.src}-480.webp" alt="" loading="lazy">`;
        return `<article class="distinction"><span class="date">${esc(L(d.label))}</span><div class="vignette">${img}</div>
          <h4>${esc(L(d.title))}</h4><p>${esc(L(d.text))}</p>${d.href ? `<a class="lien-trace" href="${d.href}" target="_blank" rel="noopener">${t('press.more', 'En savoir plus')}</a>` : ''}</article>`;
      };
      box.innerHTML = `<div class="regle" aria-hidden="true"><span class="tete"></span></div>
        <div class="groupe-frise"><h3>${t('awards.upcoming', 'À venir')}</h3>${avenir.length ? `<div class="distinctions">${avenir.map(card).join('')}</div>` : `<p class="vide-frise">${t('awards.none', 'Aucune date à venir pour l’instant. Les prochaines s’afficheront ici automatiquement.')}</p>`}</div>
        <div class="groupe-frise"><h3>${t('awards.past', 'Passées')}</h3><div class="distinctions">${passees.map(card).join('')}</div></div>
        <p class="wsa-statut"><img src="assets/img/logos/world-soundtrack-awards.webp" alt="World Soundtrack Awards" loading="lazy"><span>${t('awards.wsa', 'Membre votant de la World Soundtrack Academy (date à compléter).')}</span></p>`;
      const cards = $$('.distinction', box);
      if (C.calm) { cards.forEach(c => c.classList.add('allume')); return; }
      st = gsap.to($('.tete', box), { left: '100%', ease: 'none', scrollTrigger: { trigger: box, start: 'top 75%', end: 'bottom 60%', scrub: true,
        onUpdate: (s) => cards.forEach((c, i) => c.classList.toggle('allume', s.progress >= (i + .3) / cards.length)) } });
    };
    render();
    document.addEventListener('vh:lang', render);
  };

  C.generique = function (def, box) {
    const render = () => {
      def.innerHTML = `<div class="ligne-generique"><span class="role">${C.lang === 'en' ? 'Original music' : 'Musique originale'}</span><span class="nom">Benoît Vanhoffelen</span></div>` +
        D.LOGOS.map(([f, n]) => `<div class="ligne-generique"><span class="role">${esc(n)}</span><span class="plaque-logo"><img src="assets/img/logos/${f}.webp" alt="${esc(n)}" loading="lazy"></span></div>`).join('');
    };
    render();
    document.addEventListener('vh:lang', render);
    if (C.calm) return;
    gsap.fromTo(def, { y: 0 }, { y: () => -(def.scrollHeight - box.clientHeight), ease: 'none', scrollTrigger: { trigger: box, start: 'top 85%', end: 'bottom 15%', scrub: .5, invalidateOnRefresh: true } });
  };
})();
