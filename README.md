# Feyzin 1966 · expérience 3D

Transposition en 3D temps réel du jeu de crise Feyzin 1966 : un écran de salle projeté (`/host`),
quatre postes de joueurs (`/play`) qui voient chacun une partie du site, et un moteur de simulation
déterministe hérité du projet 2D.

## Démarrage

    npm install
    npm run sync:engine      # copie le moteur éprouvé depuis ../live-worker
    node scripts/build.mjs   # bundle esbuild vers public/app.js
    npm start                # http://localhost:3100/host

Le serveur sert la page, le bundle, les données historiques, et tient les salles en mémoire.

## Écrans

- `/host` : écran de salle. Un code PIN à quatre chiffres s'affiche, les équipes le saisissent sur leur téléphone.
  Raccourcis : espace pour clore la phase, N pour passer à la suivante, R pour une nouvelle séance,
  M pour masquer le panneau, ? pour l'aide.
- `/play?pin=1234` : choix d'un des quatre rôles, puis scène 3D subjective et décisions en HUD.

## Rôles et brouillard d'information

| Rôle | Ce qu'il voit |
|---|---|
| Opérateur purge | givre de la vanne, pression, température de paroi, écoulement |
| Chef de quart | pression, jauge de paroi, réserve d'eau, densité approximative de la nappe, état de l'A7 |
| Pompiers | chaleur, réserve d'eau, engagement des lances, rupture |
| Gendarmerie | densité de la nappe sur l'A7, vent, circulation |

Chaque rôle ne reçoit que ses propres capteurs : le serveur filtre, les joueurs doivent se parler.
Diffusion à 10 Hz.

## Architecture

```
server/app.js         salles, PIN, rôles, phases de 45 s, diffusion 10 Hz, brouillard d'information
src/net/              client socket.io et petit magasin observable
src/scene/host/       scène projetée : raffinerie, A7, nappe, torchère, caméra
src/scene/play/       quatre scènes subjectives
src/cinema/           séquence BLEVE et débrief 3D
src/audio/            moteur Web Audio procédural
src/sim/              moteur de simulation, copié depuis ../live-worker (npm run sync:engine)
tests/                tests du serveur temps réel (npm test)
```

## Simulation

Le moteur est celui du jeu 2D, déjà couvert par trente-trois tests là-bas : pression de vapeur,
paroi chauffée, nappe et dérive, réserve d'eau, ruptures, quatre fins. Ici, il est piloté par les votes
de la salle : chaque phase close applique la majorité et avance l'horloge jusqu'à la phase suivante.

Ne pas éditer `src/sim` à la main : modifier `../live-worker/src/engine` puis relancer `npm run sync:engine`.

## Tests

    npm test

Six tests couvrent l'ouverture de salle, les rôles, le débit de 10 Hz, le filtrage par rôle,
l'avancement du moteur après un vote et le débrief final.
