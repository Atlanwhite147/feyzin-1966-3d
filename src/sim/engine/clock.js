/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* Horloge de crise : projection déterministe du temps restant avant la rupture.
   Aucun minuteur, aucun aléatoire : on rejoue la simulation à plan constant. */

import { clone, heureDe } from "./state.js";
import { tick } from "./simulate.js";

/* Nombre de minutes avant la première rupture si rien ne change.
   Retourne { minutes, heure, sphere } ou null si aucune rupture ne survient dans l'horizon. */
export function projection(state, physics, horizon = 240) {
  const copie = clone(state);
  const dejaRompues = new Set(copie.spheres.filter((s) => s.ruptured).map((s) => s.id));
  const depart = copie.clock;

  for (let i = 0; i < horizon; i++) {
    const ev = tick(copie, physics);
    for (const e of ev) {
      if (e.type === "rupture" && !dejaRompues.has(e.sphere)) {
        return {
          minutes: copie.clock - depart,
          heure: heureDe(copie.clock),
          sphere: e.sphere,
          etat: copie
        };
      }
    }
    if (copie.ruptures > 0 && state.ruptures === 0) break;
  }
  return null;
}

/* Niveau de tension affiché à l'écran de salle : calme, attention, critique, irréversible. */
export function tension(state, physics) {
  if (state.ruptures > 0) return { niveau: "irreversible", texte: "Une capacité a cédé", minutes: 0 };
  const p = projection(state, physics);
  if (!p) {
    if (!state.fire.active) return { niveau: "calme", texte: "Aucune rupture projetée", minutes: null };
    return { niveau: "calme", texte: "Sans rupture projetée dans les quatre heures", minutes: null };
  }
  const niveau = p.minutes <= 20 ? "critique" : p.minutes <= 60 ? "attention" : "calme";
  return { niveau, texte: p.minutes + " minutes avant la rupture", minutes: p.minutes, heure: p.heure, sphere: p.sphere };
}

/* Avance manuelle de l'horloge, pour un animateur qui veut gagner du temps entre deux votes. */
export function avancer(state, physics, minutes) {
  const cible = state.clock + Math.max(0, Math.min(60, minutes));
  const events = [];
  while (state.clock < cible) events.push(...tick(state, physics));
  return events;
}

/* Pause tactique : l'animateur peut geler la simulation entre deux votes.
   L'état ne bouge pas tant qu'aucune étape n'est jouée, la pause est donc portée par la salle. */
export function etatPause(state) {
  if (state.ruptures > 0) return { pause: true, raison: "rupture" };
  if (state.water.epuisee) return { pause: true, raison: "eau-epuisee" };
  return { pause: false, raison: null };
}
