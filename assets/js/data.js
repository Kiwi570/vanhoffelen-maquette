/* Contenus de la maquette. Tout ce qui vient du site actuel est repris tel quel ;
   ce qui manque est marqué « à compléter ». Images Grok : listez ici celles reçues. */
window.VH = (function () {
  // Images Grok reçues et vérifiées (assets/img/grok/<nom>.webp). Les autres emplacements gardent un visuel provisoire dessiné en code.
  const GROK_RECUES = [
    'accueil-domaine-cinema', 'accueil-domaine-documentaire', 'accueil-domaine-jeu', 'accueil-domaine-animation',
    'accueil-compositeur-bureau', 'accueil-ecoute-studio', 'accueil-citations-ecran',
    'catalogue-ouverture', 'credits-ouverture',
    'catalogue-humeur-emouvant', 'catalogue-humeur-dramatique', 'catalogue-humeur-mysterieux', 'catalogue-humeur-triste',
    'catalogue-humeur-romantique', 'catalogue-humeur-epique', 'catalogue-humeur-magique', 'catalogue-humeur-plein-d-espoir'
  ];

  const MOODS = {
    emouvant: { fr: 'Émouvant', en: 'Moving', hue: 32 },
    dramatique: { fr: 'Dramatique', en: 'Dramatic', hue: 6 },
    mysterieux: { fr: 'Mystérieux', en: 'Mysterious', hue: 205 },
    triste: { fr: 'Triste', en: 'Sad', hue: 220 },
    romantique: { fr: 'Romantique', en: 'Romantic', hue: 345 },
    epique: { fr: 'Épique', en: 'Epic', hue: 18 },
    magique: { fr: 'Magique', en: 'Magical', hue: 48 },
    espoir: { fr: 'Plein d’espoir', en: 'Hopeful', hue: 40 }
  };
  const GENRES = {
    cinematographique: { fr: 'Cinématographique', en: 'Cinematic' },
    classique: { fr: 'Classique', en: 'Classical' },
    ambiant: { fr: 'Ambiant', en: 'Ambient' },
    hybride: { fr: 'Hybride', en: 'Hybrid' }
  };

  // Catalogue relevé sur benvanmusic.com/music-library (30 morceaux). Licence relevée sur les fiches : 150 €.
  const T = (slug, title, genre, mood, inst, total, audio = true) => ({ slug, title, genre, mood, inst, total, audio });
  const TRACKS = [
    T('under-the-old-kingdom', 'Under the Old Kingdom', 'classique', 'emouvant', ['Strings', 'Orchestra', 'Woodwinds'], '05:18'),
    T('letters-never-sent', 'Letters Never Sent', 'cinematographique', 'emouvant', ['Piano', 'Strings', 'Orchestra'], '04:02'),
    T('before-the-fall', 'Before the Fall', 'cinematographique', 'dramatique', ['Strings', 'Brass', 'Percussion', 'Orchestra'], '01:59'),
    T('hesitation', 'Hesitation', 'ambiant', 'mysterieux', ['Viola', 'Pads', 'Strings', 'Guitar'], '04:12'),
    T('beyond-the-forgotten-path', 'Beyond the Forgotten Path', 'cinematographique', 'mysterieux', ['Strings', 'Orchestra', 'Percussion'], '03:40'),
    T('echoes-of-resolve', 'Echoes of Resolve', 'cinematographique', 'emouvant', ['Piano', 'Strings', 'Orchestra'], '03:16'),
    T('explore', 'Explore', 'cinematographique', 'triste', ['Orchestra', 'Pads', 'Horns'], '04:20'),
    T('a-quiet-affection', 'A Quiet Affection', 'cinematographique', 'romantique', ['Piano', 'Strings'], '02:35'),
    T('a-life-remembered', 'A Life Remembered', 'cinematographique', 'triste', ['Piano', 'Strings', 'Orchestra'], '05:52'),
    T('hidden-truths', 'Hidden Truths', 'cinematographique', 'mysterieux', ['Piano', 'Strings', 'Orchestra'], '03:24'),
    T('family-first', 'Family First', 'cinematographique', 'romantique', ['Woods', 'Strings', 'Cello', 'Piano'], '03:30'),
    T('curiosity', 'Curiosity', 'hybride', 'mysterieux', ['Pads', 'Cello', 'Voices', 'Piano'], '04:35'),
    T('tell-me', 'Tell Me', 'cinematographique', 'dramatique', ['Orchestra', 'Horns', 'Strings', 'Clarinet'], '04:23'),
    T('fragile-horizons', 'Fragile Horizons', 'cinematographique', 'emouvant', ['Piano', 'Strings', 'Orchestra'], '03:25'),
    T('into-the-unknown', 'Into the Unknown', 'cinematographique', 'mysterieux', ['Strings', 'Woodwinds', 'Percussion', 'Orchestra'], '04:08'),
    T('a-fleeting-romance', 'A Fleeting Romance', 'classique', 'romantique', ['Piano', 'Strings'], '01:30'),
    T('secrets-of-the-past', 'Secrets of the Past', 'cinematographique', 'dramatique', ['Strings', 'Orchestra'], '04:14'),
    T('shadows-of-history', 'Shadows of History', 'cinematographique', 'dramatique', ['Strings', 'Orchestra', 'Piano'], '04:39'),
    T('silence', 'Silence', 'cinematographique', 'emouvant', ['Piano', 'Small Orchestra', 'Strings'], '05:56'),
    T('the-human-story', 'The Human Story', 'cinematographique', 'dramatique', ['Piano', 'Strings', 'Orchestra'], '04:39', false),
    T('the-lost-chronicle', 'The Lost Chronicle', 'cinematographique', 'emouvant', ['Strings', 'Orchestra'], '04:11'),
    T('towards-the-light', 'Towards the Light', 'cinematographique', 'epique', ['Piano', 'Strings', 'Orchestra', 'Percussion'], '03:41'),
    T('what-remains', 'What Remains', 'cinematographique', 'dramatique', ['Piano', 'Strings', 'Orchestra'], '04:51'),
    T('remember-me-kindly', 'Remember Me Kindly', 'classique', 'emouvant', ['Piano', 'Strings'], '02:31'),
    T('small-beginnings', 'Small Beginnings', 'classique', 'espoir', ['Piano', 'Strings', 'Orchestra'], '03:26'),
    T('the-road-ahead', 'The Road Ahead', 'classique', 'espoir', ['Strings', 'Piano', 'Orchestra'], '01:41'),
    T('the-silent-crown', 'The Silent Crown', 'classique', 'magique', ['Strings', 'Low Percussion', 'Ambient Textures'], '04:07', false),
    T('a-brighter-tomorrow', 'A Brighter Tomorrow', 'hybride', 'espoir', ['Piano', 'Strings', 'Synths'], '02:01'),
    T('where-the-wild-light-grows', 'Where the Wild Light Grows', 'ambiant', 'magique', ['Strings', 'Piano', 'Orchestra'], '04:23'),
    T('rise-of-the-unknown', 'Rise of the Unknown', 'hybride', 'epique', ['Orchestra', 'Percussion', 'Synths'], '02:36')
  ];
  const LICENCE_PRIX = 150;

  // Filmographie : informations lues sur les affiches et sur le site actuel.
  const AC = { fr: 'à compléter', en: 'to be completed' };
  const CREDITS = [
    { id: 'espartes', img: 'espartes', ratio: 0.7128, type: 'documentaire',
      title: { fr: 'Espartes – Chroniques de l’Orque Ibérique', en: 'Espartes – Tales of the Iberian Orca' },
      by: { fr: 'Documentaire Sea Shepherd France, écrit et réalisé par Marc Nieto et Thomas Le Coz', en: 'A Sea Shepherd France documentary, written and directed by Marc Nieto and Thomas Le Coz' },
      year: '2026', role: { fr: 'Musique originale', en: 'Original score' },
      note: { fr: 'Nommé aux Cannes Film Awards 2026, catégories « Best Feature Documentary » et « Best Environmental Documentary »', en: 'Nominated at the Cannes Film Awards 2026, “Best Feature Documentary” and “Best Environmental Documentary”' } },
    { id: 'city-tales', img: 'city-tales-affiche', ratio: 0.707, type: 'jeu',
      title: { fr: 'City Tales – Medieval Era', en: 'City Tales – Medieval Era' },
      by: { fr: 'Jeu PC, Irregular Shapes', en: 'PC game, Irregular Shapes' },
      year: { fr: '2025 ou 2026 (à confirmer)', en: '2025 or 2026 (to be confirmed)' }, role: { fr: 'Bande originale', en: 'Original soundtrack' },
      link: { href: 'https://open.spotify.com/intl-fr/album/2gXQ4p81KdL2HheDCLF2NX', label: { fr: 'Écouter la BO sur Spotify', en: 'Listen on Spotify' } } },
    { id: 'suppliciees', img: 'suppliciees-orleans', alt: 'orleans-cold-case', ratio: 0.7064, type: 'documentaire',
      title: { fr: 'Le Mystère des Suppliciées d’Orléans', en: 'Le Mystère des Suppliciées d’Orléans' },
      by: { fr: 'MDAM Production ; visuel international avec France 3 Centre-Val de Loire (52 min)', en: 'MDAM Production; international poster with France 3 Centre-Val de Loire (52 min)' },
      year: '2026', role: { fr: 'Musique', en: 'Music' } },
    { id: 'heartless', img: 'heartless', ratio: 0.6667, type: 'jeu',
      title: { fr: 'Heartless (Sans Cœur)', en: 'Heartless' },
      by: { fr: 'Jeu de rôle sur table, Empyreal Media', en: 'Tabletop RPG, Empyreal Media' },
      year: '2023', role: { fr: 'Musique originale', en: 'Original score' },
      note: { fr: 'Mention notable aux 11e Reel Music Awards, meilleure musique originale de jeu vidéo ou média interactif', en: 'Notable mention, 11th Reel Music Awards, Original Score for a Video Game or Interactive Media' } },
    { id: 'chant-de-rome', img: 'le-chant-de-rome', ratio: 0.707, type: 'animation',
      title: { fr: 'Le Chant de Rome', en: 'Le Chant de Rome' },
      by: { fr: 'Film d’animation ARTFX : Vincent Bertrand, Blandine Camus, Yoann Dano, Clémence Ellerbach, Rémi Frech, Jules Noye', en: 'ARTFX animated film: Vincent Bertrand, Blandine Camus, Yoann Dano, Clémence Ellerbach, Rémi Frech, Jules Noye' },
      year: '2024', role: { fr: 'Musique originale', en: 'Music' },
      note: { fr: 'Sélections officielles 2024 : Courts sur la Ville Festival, Rookie Awards (Film of the Year), S.F.N Loutraki Animation Festival', en: 'Official selections 2024: Courts sur la Ville Festival, Rookie Awards (Film of the Year), S.F.N Loutraki Animation Festival' } },
    { id: 'qazaqi', img: 'qazaqi', ratio: 0.7073, type: 'film',
      title: { fr: 'Qazaqi', en: 'Qazaqi' },
      by: { fr: 'Un film de Thomas Ferey et Nicolas Perrier', en: 'A film by Thomas Ferey and Nicolas Perrier' },
      year: AC, role: { fr: 'Musique originale', en: 'Original music' } },
    { id: 'novara', img: 'novara', ratio: 0.7128, type: 'animation',
      title: { fr: 'Novara – Quand les destins se croisent', en: 'Novara' },
      by: { fr: 'Un film de Célia Mrika, Master cinéma d’animation ISCID', en: 'A film by Célia Mrika, ISCID animation master' },
      year: '2024-2025', role: AC },
    { id: 'tarte-au-citron', img: 'la-tarte-au-citron', ratio: 0.7032, type: 'film',
      title: { fr: 'La Tarte au citron', en: 'La Tarte au citron' },
      by: { fr: 'Un film de Kamel Abdous, Angelka', en: 'A film by Kamel Abdous, Angelka' },
      year: '2022', role: { fr: 'Musiques', en: 'Music' } },
    { id: 'voyage-eaux-troubles', img: 'voyage-en-eaux-troubles', ratio: 0.7115, type: 'film',
      title: { fr: 'Voyage en eaux troubles', en: 'Voyage en eaux troubles' },
      by: { fr: 'Un film de Kamel Abdous, Angelka', en: 'A film by Kamel Abdous, Angelka' },
      year: '2022', role: { fr: 'Compositeur', en: 'Composer' } },
    { id: 'poulpe', img: 'un-poulpe-pour-la-5', ratio: 0.707, type: 'film',
      title: { fr: '« Un poulpe pour la 5 »', en: '“Un poulpe pour la 5”' },
      by: { fr: 'Un film de Margot Mathelin', en: 'A film by Margot Mathelin' },
      year: AC, role: AC },
    { id: 'sur-les-pas', img: 'sur-les-pas-de-l-histoire', ratio: 0.6672, type: 'autre',
      title: { fr: 'Sur les pas de l’Histoire', en: 'Sur les pas de l’Histoire' },
      by: { fr: 'Société des membres de la Légion d’honneur (type de projet à compléter)', en: 'Société des membres de la Légion d’honneur (project type to be completed)' },
      year: AC, role: { fr: 'Musique originale', en: 'Original music' } },
    { id: 'pico-bogue', img: 'pico-bogue-un-calme-fou', ratio: 0.6797, type: 'autre',
      title: { fr: 'Pico Bogue – Un calme fou', en: 'Pico Bogue – Un calme fou' },
      by: { fr: 'MK2 Cinémas, Dargaud (type de projet à compléter)', en: 'MK2 Cinémas, Dargaud (project type to be completed)' },
      year: AC, role: AC },
    { id: 'painless-player', img: 'the-painless-player', ratio: 0.7688, type: 'autre',
      title: { fr: 'The Painless Player', en: 'The Painless Player' },
      by: { fr: 'Studio et type de projet à compléter', en: 'Studio and project type to be completed' },
      year: AC, role: AC },
    { id: 'knightstones', img: 'knightstones', ratio: 0.7064, type: 'autre',
      title: { fr: 'Knightstones', en: 'Knightstones' },
      by: { fr: 'Studio et type de projet à compléter', en: 'Studio and project type to be completed' },
      year: AC, role: AC },
    { id: 'le-donjon', img: null, logo: 'le-donjon-escape-game', ratio: 0.707, type: 'escape',
      title: { fr: 'Le Donjon', en: 'Le Donjon' },
      by: { fr: 'Escape game, Paris', en: 'Escape game, Paris' },
      year: AC, role: { fr: 'Musiques', en: 'Music' } }
  ];
  const TYPES = {
    film: { fr: 'Film', en: 'Film' }, documentaire: { fr: 'Documentaire', en: 'Documentary' },
    animation: { fr: 'Animation', en: 'Animation' }, jeu: { fr: 'Jeu', en: 'Game' },
    escape: { fr: 'Escape game', en: 'Escape game' }, autre: { fr: 'Type à compléter', en: 'Type to be completed' }
  };

  // Distinctions : triées automatiquement entre « à venir » et « passées » d’après la date du jour.
  const DISTINCTIONS = [
    { date: '2023-12-31', label: '2023', img: { kind: 'affiches', src: 'heartless' },
      title: { fr: '11e Reel Music Awards', en: '11th Reel Music Awards' },
      text: { fr: 'Heartless (Sans Cœur) : mention notable, meilleure musique originale de jeu vidéo ou média interactif.', en: 'Heartless: notable mention, Original Score for a Video Game or Interactive Media.' },
      href: 'https://reelmusic.wordpress.com/2024/06/02/11th-2023-reel-music-awards-the-winners/' },
    { date: '2024-12-31', label: '2024', img: { kind: 'affiches', src: 'le-chant-de-rome' },
      title: { fr: 'Le Chant de Rome, film sélectionné', en: 'Le Chant de Rome, official selections' },
      text: { fr: 'Courts sur la Ville Festival, Rookie Awards (Film of the Year), S.F.N Loutraki Animation Festival.', en: 'Courts sur la Ville Festival, Rookie Awards (Film of the Year), S.F.N Loutraki Animation Festival.' } },
    { date: '2026-06-30', label: '2026', img: { kind: 'affiches', src: 'espartes' },
      title: { fr: 'Cannes Film Awards 2026', en: 'Cannes Film Awards 2026' },
      text: { fr: 'Espartes nommé en « Best Feature Documentary » et « Best Environmental Documentary ».', en: 'Espartes nominated for “Best Feature Documentary” and “Best Environmental Documentary”.' },
      href: 'https://cannesfilmawards.com/2026-nominees' },
    { date: '2026-07-15', label: { fr: 'Juillet 2026', en: 'July 2026' }, img: { kind: 'photos', src: 'apulia-2026' },
      title: { fr: 'Apulia Soundtrack Awards', en: 'Apulia Soundtrack Awards' },
      text: { fr: 'Nommé parmi les compositeurs émergents, à Carovigno (Italie).', en: 'Nominated among the emerging composers, in Carovigno (Italy).' },
      href: 'https://apuliasoundtrack.com/emerging-composers/' }
  ];

  // Citations présentes sur le site actuel. Les traductions sont signalées comme telles.
  const QUOTES = [
    { lang: 'en', src: 'Impulse Gamer', about: 'City Tales – Medieval Era',
      text: 'The soundtrack deserves special recognition here. Composer Benoît Vanhoffelen has crafted a score that feels authentically medieval.',
      tr: 'La bande originale mérite ici une mention spéciale. Le compositeur Benoît Vanhoffelen signe une partition qui sonne authentiquement médiévale.' },
    { lang: 'fr', src: 'Game Only', about: 'City Tales – Medieval Era',
      text: 'Musicalement, City Tales Medieval Era procure une excellente première impression.',
      tr: 'Musically, City Tales Medieval Era makes an excellent first impression.' },
    { lang: 'fr', src: '33bits', about: 'City Tales – Medieval Era',
      text: 'Les morceaux sont entraînants, les mélodies très agréables.',
      tr: 'The pieces are catchy, the melodies very pleasant.' },
    { lang: 'en', src: { fr: 'Recommandation LinkedIn (nom à compléter)', en: 'LinkedIn recommendation (name to be completed)' },
      text: 'His music truly understands the language of emotion, creating moods and vivid aural imagery through carefully crafted melodies and rhythms.',
      tr: 'Sa musique comprend vraiment le langage de l’émotion : elle crée des ambiances et des images sonores vives, avec des mélodies et des rythmes soigneusement travaillés.' },
    { lang: 'en', src: { fr: 'Recommandation LinkedIn (nom à compléter)', en: 'LinkedIn recommendation (name to be completed)' },
      text: 'This rich music and atmospheres he created brought a strong artistic direction to the various projects early on.',
      tr: 'La richesse de la musique et des atmosphères qu’il a créées a très tôt donné une direction artistique forte aux différents projets.' },
    { lang: 'en', src: { fr: 'Recommandation LinkedIn (nom à compléter)', en: 'LinkedIn recommendation (name to be completed)' },
      text: 'The project suddenly took on a whole new dimension. His work comes highly recommended for any musical project. You won’t be disappointed.',
      tr: 'Le projet a soudain pris une tout autre dimension. Je recommande vivement son travail pour tout projet musical. Vous ne serez pas déçu.' }
  ];

  const LOGOS = [
    ['france-3', 'France 3'], ['france-tv', 'France Télévisions'], ['mk2', 'MK2 Cinémas'], ['dargaud', 'Dargaud'], ['mediawan', 'Mediawan'],
    ['sea-shepherd', 'Sea Shepherd'], ['irregular-shapes', 'Irregular Shapes'], ['empyreal', 'Empyreal Media Productions'], ['ttmc', 'TTMC'],
    ['firesquid', 'Firesquid'], ['near-studios', 'NEAR Studios'], ['sleepy-mill-studio', 'Sleepy Mill Studio'], ['x-and-immersion', 'X&Immersion'],
    ['willgreen-studio', 'Willgreen Studio'], ['artfx', 'ARTFX School of Digital Arts'], ['le-donjon-escape-game', 'Le Donjon Escape Game Paris'],
    ['editions-musicales-francois-1er', 'Éditions Musicales François 1er'], ['musique-and-music', 'musique & music'], ['getasound', 'Getasound'],
    ['visuel-sound', 'Visuel Sound'], ['ma-drogue-a-moi', 'Ma drogue à moi'], ['ville-de-lyon', 'Ville de Lyon'], ['ville-de-redon', 'Ville de Redon'],
    ['world-soundtrack-awards', 'World Soundtrack Awards']
  ];

  const LINKS = {
    imdb: 'https://www.imdb.com/fr/name/nm11964990/',
    linkedin: 'https://www.linkedin.com/in/beno%C3%AEt-vanhoffelen-4031861a8/',
    instagram: 'https://www.instagram.com/benoitvanhoffelen/',
    youtube: 'https://www.youtube.com/channel/UC-9TUasuYfueQ5vJlZJ8-1w',
    spotify: 'https://open.spotify.com/intl-fr/artist/47OG9mpI9QMnNH4StfiVls',
    wsa: 'https://www.worldsoundtrackawards.com/persons/benoit-vanhoffelen',
    email: 'benedictus.composer@gmail.com'
  };

  const I18N = {
    en: {
      'skip': 'Skip to content',
      'nav.home': 'Home', 'nav.catalogue': 'Music library', 'nav.credits': 'Credits & press', 'nav.contact': 'Contact',
      'calm.on': 'Calm mode', 'calm.label': 'Calm mode: fewer animations',
      'amorce.role': 'Composer for picture', 'amorce.skip': 'Skip',
      'hero.title': 'Original music for picture',
      'hero.lead': 'Benoît Vanhoffelen writes music for film, documentary, animation and video games. Based in Lyon, France.',
      'hero.listen': 'Listen', 'hero.project': 'Tell me about your project',
      'hero.f1': 'Voting member, World Soundtrack Academy', 'hero.f2': 'Nominated, Apulia Soundtrack Awards 2026',
      'hero.scroll': 'Scroll',
      'reel.title': 'On screen', 'reel.lead': 'A few of the films, documentaries and games he has scored. Posters are shown whole, as they were made.',
      'reel.drag': 'Scroll to unroll the film',
      'dom.title': 'For picture, in every form',
      'dom.cinema': 'Film', 'dom.cinema.t': 'Short and feature films, from first draft to final mix.',
      'dom.doc': 'Documentary', 'dom.doc.t': 'Music that serves the subject: nature, history, investigation.',
      'dom.anim': 'Animation', 'dom.anim.t': 'Scores written frame by frame with the animation teams.',
      'dom.game': 'Video games & escape games', 'dom.game.t': 'Soundtracks for PC games, tabletop RPGs and immersive rooms.',
      'dom.listen': 'Library excerpt',
      'bio.title': 'The composer',
      'bio.p1': 'Born in Orsay in 1991, Benoît Vanhoffelen learned piano and music theory at a very early age.',
      'bio.p2': 'He built his musical world in Paris, Lyon and Montpellier and abroad (Bulgaria, the United States, England), through many collaborations: short and feature films, documentaries, video games, escape games and animated films.',
      'bio.p3': 'His work has notably been praised for the soundtrack of City Tales: Medieval Era, the music of the escape game Le Donjon in Paris and the documentary Le Mystère des Suppliciées d’Orléans.',
      'bio.s1': 'original tracks in the library', 'bio.s2': 'voting member of the World Soundtrack Academy', 'bio.s3': 'based in Lyon, working worldwide',
      'listen.title': 'Six excerpts to start with', 'listen.lead': 'Taken from the library. Sound plays only when you press play.',
      'listen.all': 'Open the full library',
      'awards.title': 'Awards and selections', 'awards.upcoming': 'Upcoming', 'awards.past': 'Past',
      'awards.none': 'No upcoming date yet. New dates will appear here automatically.',
      'awards.wsa': 'Voting member of the World Soundtrack Academy (date to be completed).',
      'quotes.title': 'What they say', 'quotes.tr': 'translation',
      'logos.title': 'They worked with him',
      'form.title': 'Tell me about your project', 'form.lead': 'Four short steps, like a spotting session. Nothing is sent in this mockup.',
      'form.s1': 'Project', 'form.s2': 'Music', 'form.s3': 'Schedule', 'form.s4': 'Contact',
      'form.q1': 'What kind of project?', 'form.q2': 'What do you need?', 'form.q2b': 'Estimated music length', 'form.q2c': 'Where is the project now?',
      'form.q3': 'Delivery date', 'form.q3b': 'Musical references', 'form.q3c': 'Link to images (optional)',
      'form.first': 'First name', 'form.last': 'Last name', 'form.email': 'Email', 'form.company': 'Company or production', 'form.msg': 'A few words about the project',
      'form.next': 'Next', 'form.prev': 'Back', 'form.send': 'Send request',
      'form.done': 'Request ready. In this mockup nothing is sent: on the live site Benoît would receive it by email.',
      'form.direct': 'Or write directly', 'form.minutes': 'min',
      'opt.feature': 'Feature film', 'opt.short': 'Short film', 'opt.doc': 'Documentary', 'opt.tv': 'Series / TV', 'opt.anim': 'Animation', 'opt.game': 'Video game',
      'opt.escape': 'Escape game / immersive', 'opt.ad': 'Advertising / brand', 'opt.other': 'Other',
      'opt.custom': 'Custom score', 'opt.licence': 'License a library track', 'opt.both': 'Both',
      'opt.writing': 'Writing', 'opt.shooting': 'Shooting', 'opt.editing': 'Editing', 'opt.post': 'Post-production',
      'end.fin': 'The End', 'end.legal': 'Legal notice', 'end.mock': 'Mockup: demo data and missing information are marked on the page.',
      'player.empty': 'Play an excerpt', 'player.play': 'Play', 'player.pause': 'Pause', 'player.next': 'Next excerpt', 'player.prev': 'Previous excerpt',
      'excerpt': 'excerpt', 'excerpt.missing': 'Excerpt to be supplied',
      'ph': 'Temporary visual',
      'cat.title': 'Music library',
      'cat.lead': '30 original tracks under license, ready to listen to before you choose.',
      'cat.licence': 'Professional license: €150 per track, one project, worldwide, perpetual, non-exclusive.',
      'cat.search': 'Search a title or an instrument', 'cat.mood': 'Mood', 'cat.genre': 'Genre', 'cat.inst': 'Instruments', 'cat.all': 'All',
      'cat.count': 'tracks', 'cat.reset': 'Clear filters', 'cat.empty': 'No track matches these filters. Clear a filter to see more.',
      'cat.add': 'Add', 'cat.added': 'Added', 'cat.open': 'Details', 'cat.total': 'Full length', 'cat.sort': 'Sort', 'cat.sort.default': 'Library order', 'cat.sort.title': 'Title', 'cat.sort.dur': 'Length',
      'cat.custom.title': 'Need something written for your images?', 'cat.custom.text': 'Every track here started as a cue. Benoît also writes music made to measure for your film, documentary or game.',
      'cat.custom.cta': 'Tell me about your project',
      'cart.title': 'License request', 'cart.empty': 'Your request is empty. Add tracks from the library.',
      'cart.total': 'Total (VAT status to be completed)', 'cart.name': 'Name', 'cart.email': 'Email', 'cart.project': 'Project title',
      'cart.send': 'Send license request', 'cart.done': 'Request ready. In this mockup nothing is sent and nothing is charged.', 'cart.remove': 'Remove',
      'cart.open': 'License request',
      'sheet.licence': 'Professional license', 'sheet.terms': 'One project · worldwide · perpetual · non-exclusive', 'sheet.add': 'Add to my license request',
      'sheet.custom': 'Ask for a custom piece in this spirit', 'sheet.close': 'Close',
      'cr.title': 'Credits and press', 'cr.lead': 'Films, documentaries, animation and games. Information missing from the current site is marked “to be completed”.',
      'cr.all': 'All', 'cr.role': 'Role', 'cr.year': 'Year', 'cr.by': 'Project', 'cr.alt': 'Other poster',
      'press.title': 'Press', 'press.wsa': 'Benoît Vanhoffelen is a voting member of the World Soundtrack Academy as a film and game composer.',
      'press.apulia': 'In July 2026 he was one of the international composers nominated as emerging composer at the Apulia Soundtrack Awards in Carovigno, Italy.',
      'press.more': 'Read more',
      'kit.title': 'For programmers and press', 'kit.bio': 'French composer for film, documentary, animation and video games, based in Lyon. Born in Orsay in 1991.',
      'kit.pack': 'Press kit (HD photos, long bio, technical sheet): to be completed.', 'kit.contact': 'Contact',
      'legal.title': 'Legal notice'
    }
  };

  return { GROK_RECUES, MOODS, GENRES, TRACKS, LICENCE_PRIX, CREDITS, TYPES, DISTINCTIONS, QUOTES, LOGOS, LINKS, I18N, AC };
})();
