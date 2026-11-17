# Feyzin 1966 · expérience 3D

Transposition en 3D temps réel du jeu de crise Feyzin 1966 : un écran de salle projeté (`/host`),
quatre postes de joueurs (`/play`) qui voient chacun une partie du site, et un moteur de simulation
déterministe hérité du projet 2D.

## Démarrage

    npm install
    npm run sync:engine      # copie le moteur éprouvé depuis ../live-worker
    npm run build            # bundle esbuild vers public/app.js
    npm start                # http://localhost:3100/host

Le serveur sert la page, le bundle, les données historiques, et tient les salles en mémoire.

Ne pas ouvrir `index.html` en double-clic : la page a besoin du serveur (le module JavaScript est
refusé en `file://`, et les salles passent par le réseau). Si la page affiche « chargement du site »,
c'est que le serveur n'est pas lancé.

## Écrans

- `/host` : écran de salle. Un code PIN à quatre chiffres s'affiche, les équipes le saisissent sur leur téléphone.
  Raccourcis : espace pour clore la phase, N pour passer à la phase suivante, R pour une nouvelle séance,
  M pour masquer le panneau, F pour le compteur d'images, ? pour l'aide.
  Le bouton « activer le son » démarre l'audio procédural ; le navigateur exige un clic, c'est normal.
- `/play?pin=1234` : choix d'un des quatre rôles, puis scène 3D subjective et décisions en HUD.

## Qualité et performance

- Par défaut, rendu complet : ombres, Bloom, aberration chromatique, vignette, grain.
- `?lite=1` sur `/host` : pas de post-traitement, résolution réduite, ombres coupées. Pour un vieux
  portable ou une machine sans GPU.
- La résolution de rendu baisse d'elle-même par paliers si la boucle descend sous 40 images par seconde.
- Le compteur (touche F) affiche aussi le nom du moteur de rendu : s'il indique SwiftShader, la machine
  fait le rendu sur le processeur et les performances ne veulent rien dire.

## Déploiement Render

Le dépôt contient `render.yaml` : un service web Node, offre gratuite, qui construit le bundle
puis démarre le serveur.

- Nouveau service : Dashboard Render, « New », « Blueprint », choisir le dépôt `feyzin-1966-3d`.
  Render lit `render.yaml` et propose le service tel quel.
- Réglages manuels, si tu préfères : type Web Service, runtime Node, build
  `npm install && npm run build`, start `npm start`, health check `/health`, `NODE_VERSION=22`.
- L'adresse devient `https://<nom>.onrender.com` : `/host` pour l'écran de salle,
  `/play?pin=XXXX` pour les téléphones. Tout passe par le même domaine, WebSocket compris.
- Sur l'offre gratuite, l'instance s'endort au bout d'un quart d'heure sans visiteur : ouvrir
  `/host` une ou deux minutes avant la séance pour la réveiller, sinon le premier chargement
  prend une trentaine de secondes.

## Rôles et brouillard d'information

| Rôle | Ce qu'il voit |
|---|---|
| Opérateur purge | givre de la vanne, pression au manomètre, température de paroi, écoulement |
| Chef de quart | température de paroi, réserve d'eau, densité de la nappe vers l'A7, incendie |
| Pompiers | chaleur, réserve d'eau, engagement des lances, état de rupture |
| Gendarmerie | densité de la nappe sur l'A7, vent, circulation |

Chaque rôle ne reçoit que ses propres capteurs : le serveur filtre, les joueurs doivent se parler.
Diffusion à 10 Hz.

## Architecture

```
server/app.js         salles, PIN, rôles, phases de 45 s, diffusion 10 Hz, brouillard d'information
src/net/              client socket.io et petit magasin observable
src/scene/host/       scène projetée : raffinerie, A7, nappe, torchère, flare, caméra, sol
src/scene/play/       quatre scènes subjectives et leur cadrage
src/audio/Engine.js   Web Audio procédural : vent, route, radio, soupape, alarme, BLEVE
src/ui/               HUD animateur (jauges, équipes, débrief) et HUD joueur
src/sim/              moteur de simulation, copié depuis ../live-worker (npm run sync:engine)
tests/                tests du serveur temps réel (npm test)
scripts/              build esbuild, synchronisation du moteur, joueurs automatiques
```

## Simulation

Le moteur est celui du jeu 2D, déjà couvert par ses tests là-bas : pression de vapeur, paroi chauffée,
nappe et dérive, réserve d'eau, ruptures, quatre fins. Ici, il est piloté par les votes de la salle :
chaque phase close applique la majorité et avance l'horloge jusqu'à la phase suivante.

Ne pas éditer `src/sim` à la main : modifier `../live-worker/src/engine` puis relancer `npm run sync:engine`.

## Débrief

En fin de séance, l'écran de salle passe au débrief : chronologie comparée des décisions de la salle
et du déroulement réel, barrières tenues ou rompues, bilan humain. Un clic sur une ligne replace la
caméra 3D sur la scène correspondante, ce qui permet de commenter chaque décision en salle.

## Tests et essais

    npm test                                  # six tests du serveur temps réel
    npm run joueurs -- 1234 4 0               # quatre joueurs automatiques sur le PIN 1234

Les joueurs automatiques servent aux répétitions : ils rejoignent les quatre rôles et votent la
première option à chaque phase, ce qui permet de dérouler une séance entière sans téléphones.

## Limites connues

- Le rendu a été vérifié en navigateur sur processeur (SwiftShader) : la justesse visuelle est
  contrôlée, mais la tenue des 60 images par seconde doit être mesurée sur le portable de projection.
- Le débrief utilise sept points de caméra fixes ; il n'y a pas de vol libre à la souris.
- L'audio n'a pas pu être écouté en environnement de test sans carte son : le code est branché et
  démarre au clic, mais le rendu sonore reste à valider à l'oreille.
