/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* Évaluation de la fin de partie à partir de l'état, jamais à partir du chemin parcouru. */

const PLAFOND = (v, min, max) => Math.min(max, Math.max(min, v));

export function evaluateEnding(state, physics) {
  const bilan = physics.bilan;
  const fuiteColmatee = state.leak.closedAt !== null;
  const a7Exposee = state.plan.a7 === "open" && state.cloud.drift >= physics.fuite.distanceA7;
  const ctx = state.ruptureContext || null;
  const secoursProches = ctx
    ? !ctx.repli && ctx.secours <= physics.population.distanceSapeursDangereuse + 50
    : !state.rescue.withdrawn && state.rescue.distance <= physics.population.distanceSapeursDangereuse + 50;
  const perimetreSuffisant = ctx ? ctx.evacuated || ctx.perimetre >= physics.perimetre.seuilSecurite
    : state.perimeter.radius >= physics.perimetre.seuilSecurite || state.perimeter.evacuated;

  let id, titre, resume, morts, blesses;

  if (state.ruptures === 0) {
    id = "maitrise";
    titre = "Maîtrise précoce";
    resume = fuiteColmatee
      ? "La fuite est isolée avant toute inflammation. Le nuage se dissipe, le parc est intact."
      : "Aucune capacité n'a cédé. L'incident reste un accident de personnel sans propagation.";
    morts = bilan.maitrise.morts;
    blesses = bilan.maitrise.blesses;
  } else if (state.ruptures >= 2) {
    id = "chaine";
    titre = "Réaction en chaîne";
    resume = "Une première sphère cède, puis ses voisines, faute de refroidissement tenu dans la durée.";
    morts = bilan.chaine.morts;
    blesses = bilan.chaine.blesses;
  } else if (perimetreSuffisant || !secoursProches) {
    id = "bleve-contenu";
    titre = "BLEVE contenu";
    resume = "L'explosion était inévitable, mais le périmètre et le repli des équipes ont limité le bilan humain.";
    morts = bilan.bleveContenu.morts;
    blesses = bilan.bleveContenu.blesses;
  } else {
    id = "historique";
    titre = "Scénario historique";
    resume = "Même enchaînement qu'en janvier 1966 : nuage, inflammation, rupture, secours trop près.";
    morts = bilan.historique.morts;
    blesses = bilan.historique.blesses;
  }

  /* Modificateurs, appliqués hors scénario historique pour ne pas réécrire les faits. */
  if (id !== "historique") {
    if (a7Exposee) {
      morts += 4;
      blesses += 11;
    }
    if (!state.perimeter.evacuated && state.ruptures > 0) {
      morts += 3;
      blesses += 7;
    }
    if (secoursProches && state.ruptures > 0) {
      morts += 5;
      blesses += 10;
    }
  }

  const barrières = [
    { nom: "Isolement de la fuite", tenu: fuiteColmatee },
    { nom: "Coupure de l'autoroute", tenu: state.plan.a7 === "closed" },
    { nom: "Périmètre de sécurité", tenu: perimetreSuffisant },
    { nom: "Refroidissement des sphères", tenu: state.plan.water === "sphères" && !state.water.epuisee },
    { nom: "Repli des secours", tenu: state.rescue.withdrawn || state.rescue.distance > physics.population.distanceSapeursDangereuse }
  ];

  return {
    id,
    titre,
    resume,
    morts: PLAFOND(morts, 0, 999),
    blesses: PLAFOND(blesses, 0, 9999),
    ruptures: state.ruptures,
    fuiteColmatee,
    barrières,
    tenues: barrières.filter((b) => b.tenu).length,
    total: barrières.length
  };
}
