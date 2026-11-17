/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* API publique du moteur. Tout est pur : aucun accès disque, réseau ou horloge. */

import { createState, clone, formatHeure, heureDe, parseHeure } from "./state.js";
import { tick, advanceTo, pressureFor } from "./simulate.js";
import { applyDecision, runStep } from "./decisions.js";
import { evaluateEnding } from "./endings.js";
import { projection, tension, avancer, etatPause } from "./clock.js";
import { frise, synthese, conclusionTexte, ecartDe } from "./debrief.js";

export function newGame(physics, scenario) {
  const state = createState(physics);
  return {
    state,
    scenario,
    physics,
    terminee: false,
    fin: null
  };
}

export function etapeCourante(game) {
  return game.scenario.etapes[game.state.step] || null;
}

/* Joue l'étape courante avec l'option donnée, puis évalue la fin si le scénario est terminé. */
export function jouer(game, indexOption) {
  if (game.terminee) return game;
  const etape = etapeCourante(game);
  if (!etape) return game;

  const events = runStep(game.state, game.physics, game.scenario, indexOption);

  if (game.state.ruptures > 0 && game.state.clock >= parseHeure("09:15") - parseHeure(game.scenario.etapes[0].heure)) {
    /* garde : la fin n'est évaluée qu'après la dernière étape, plus bas */
  }

  if (game.state.step >= game.scenario.etapes.length) {
    game.terminee = true;
    game.fin = evaluateEnding(game.state, game.physics);
  }

  return { ...game, events };
}

/* Résumé lisible pour l'écran de salle et le débrief. */
export function resume(game) {
  const s = game.state;
  const p443 = s.spheres[0];
  return {
    heure: heureDe(s.clock),
    pression443: p443.ruptured ? null : pressureFor(p443.wall, game.physics),
    temperature443: p443.ruptured ? null : p443.wall,
    pressionVoisines: s.spheres.slice(1).map((sp) => ({ id: sp.id, wall: sp.ruptured ? null : sp.wall, ruptured: sp.ruptured })),
    nappe: { masse: s.cloud.mass, rayon: s.cloud.radius, derive: s.cloud.drift, enflammee: s.cloud.ignited },
    eau: s.water.stock,
    eauEpuisee: s.water.epuisee,
    perimetre: s.perimeter.radius,
    evacuated: s.perimeter.evacuated,
    a7: s.plan.a7,
    secours: s.rescue.distance,
    replis: s.rescue.withdrawn,
    ruptures: s.ruptures,
    fuiteColmatee: s.leak.closedAt !== null
  };
}

export function debrief(game) {
  const fin = game.fin || evaluateEnding(game.state, game.physics);
  return { fin, lignes: frise(game), synthese: synthese(game, fin), conclusion: conclusionTexte(fin) };
}

export {
  createState, clone, formatHeure, heureDe, parseHeure, tick, advanceTo, pressureFor, applyDecision, evaluateEnding,
  projection, tension, avancer, etatPause, frise, synthese, conclusionTexte, ecartDe
};
