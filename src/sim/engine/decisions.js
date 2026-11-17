/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* Application d'un choix de salle à l'état, puis avancée de l'horloge jusqu'à l'étape suivante. */

import { parseHeure, heureDe } from "./state.js";
import { advanceTo } from "./simulate.js";

/* Fusionne les effets d'une option dans le plan courant.
   Une fois la fuite colmatée, les effets de fuite des étapes suivantes sont ignorés. */
export function applyDecision(state, etape, indexOption) {
  const opt = etape.options[indexOption];
  if (!opt) throw new Error("Option inconnue : " + indexOption);
  const e = opt.effets || {};
  const fuiteResolue = state.leak.closedAt !== null;

  if (!fuiteResolue) {
    if (typeof e.leak === "number" && e.leak > 0 && state.leak.mass === 0 && state.step === 0) {
      state.leak.active = true;
      state.leak.rate = e.leak;
      state.leak.since = state.clock;
      state.plan.leakRate = e.leak;
      state.log.push({
        t: state.clock,
        h: heureDe(state.clock),
        level: "alerte",
        text: "Le propane jaillit sous la sphère 443. La purge est hors de contrôle."
      });
    }
    if ("closeAfter" in e) {
      state.plan.closeAt = e.closeAfter === null ? null : state.clock + e.closeAfter;
    }
    if ("ignitionAfter" in e && e.ignitionAfter !== null && state.plan.ignitionAt === null) {
      state.plan.ignitionAt = e.ignitionAfter;
    }
  }

  if ("a7" in e) state.plan.a7 = e.a7;
  if ("perimeter" in e) state.plan.perimeter = e.perimeter;
  if ("evacuate" in e) state.plan.evacuate = !!e.evacuate;
  if ("water" in e) state.plan.water = e.water;
  if ("rescue" in e) state.plan.rescue = e.rescue;
  if ("alert" in e) state.plan.alert = e.alert;
  if ("withdraw" in e) state.plan.withdraw = !!e.withdraw;

  state.history.push({
    step: state.step,
    heure: heureDe(state.clock),
    option: opt.lettre,
    texte: opt.texte,
    historique: !!opt.historique
  });

  return state;
}

/* Déroule une étape complète : on applique le choix, puis on avance jusqu'à l'heure de l'étape suivante. */
export function runStep(state, physics, scenario, indexOption) {
  const etape = scenario.etapes[state.step];
  applyDecision(state, etape, indexOption);

  const base = parseHeure(scenario.etapes[0].heure);
  const suivante = scenario.etapes[state.step + 1];

  /* L'étape de synthèse est un vote d'après-coup : elle ne fait pas avancer la simulation. */
  if (etape.synthese) {
    state.step += 1;
    return [];
  }

  const cible = suivante ? parseHeure(suivante.heure) - base : parseHeure(etape.heure) - base + 30;
  const events = advanceTo(state, physics, Math.max(cible, state.clock + 1));
  state.step += 1;
  return events;
}
