# Benoît Vanhoffelen · maquette v1

Maquette du site de Benoît Vanhoffelen, compositeur pour l’image. Direction « Salle obscure ».

Site statique en HTML, CSS et JavaScript, sans étape de construction. Il est prêt pour Vercel : `vercel.json` active les adresses sans `.html`.

## Pages

- `index.html` : l’accueil. Il enchaîne neuf sections numérotées comme des cues de film :
  - 1M1 l’ouverture ;
  - 1M2 la pellicule d’affiches ;
  - 1M3 les domaines ;
  - 1M4 le compositeur ;
  - 1M5 l’écoute ;
  - 1M6 les distinctions ;
  - 1M7 les citations en sous-titres ;
  - 1M8 le générique des partenaires ;
  - 1M9 la fiche projet.
- `catalogue.html` : les 30 morceaux, avec filtres, fiche morceau et demande de licence simulée.
- `credits.html` : la filmographie filtrable, la visionneuse d’affiches, les distinctions, la presse, l’espace programmateurs et le générique.
- `mentions-legales.html` : les informations reprises du site actuel, avec les points à corriger.

## Données

Tous les contenus se trouvent dans `assets/js/data.js` :
- les morceaux ;
- les crédits ;
- les distinctions, triées automatiquement entre passées et à venir ;
- les citations ;
- les logos ;
- les textes anglais.

Ce qui manque sur le site actuel est marqué « à compléter ».

Les formes d’onde (`assets/js/peaks.js`) sont calculées à partir des vrais extraits de 45 s.

## Images Grok

Les images reçues se trouvent dans `assets/img/grok/`. Leur liste est tenue dans `GROK_RECUES`, au début de `data.js`.

Un emplacement absent de cette liste affiche un visuel provisoire dessiné en code. Pour ajouter une image :
1. Déposez `nom.webp` dans `assets/img/grok/`.
2. Ajoutez son nom dans `GROK_RECUES`.

## Accessibilité et confort

- Le son ne démarre jamais seul.
- Le bouton « Mode calme » coupe les animations. Il s’active aussi automatiquement avec le réglage « réduire les animations » du système.
- Une version sans WebGL est prévue.

## Bibliothèques

Toutes sont hébergées avec le site :
- GSAP 3.15 (ScrollTrigger, SplitText, Flip) ;
- Lenis ;
- OGL.

Les polices Instrument Serif, Inter Tight et JetBrains Mono sont sous licence OFL.
