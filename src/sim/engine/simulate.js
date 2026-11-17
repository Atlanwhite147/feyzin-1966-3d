/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* Moteur de simulation : un pas de temps = une minute, entièrement déterministe.
   Aucun appel réseau, aucun aléatoire : deux parties identiques donnent le même état. */

import { heureDe } from "./state.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const r1 = (v) => Math.round(v * 10) / 10;

function log(state, level, text) {
  state.log.push({ t: state.clock, h: heureDe(state.clock), level, text });
}

/* Tension de vapeur du propane : croissance exponentielle avec la température (loi d'Antoine simplifiée).
   Calibrée pour donner 8,2 bar à 12 °C et une vingtaine de bars à 62 °C. */
export function pressureFor(wall, physics) {
  const s = physics.sphere443;
  const t0 = s.temperatureParoiInitiale + 273.15;
  const t = wall + 273.15;
  const p = s.pressionInitiale * Math.exp(1797 * (1 / t0 - 1 / t));
  return r1(Math.min(p, 60));
}

/* Un pas d'une minute. Retourne l'événement majeur éventuel. */
export function tick(state, physics) {
  state.clock += 1;
  const f = physics.fuite;
  const r = physics.reserveEau;
  const ev = [];

  /* 1. fuite de propane */
  if (state.leak.active) {
    if (state.plan.closeAt !== null && state.clock >= state.plan.closeAt) {
      state.leak.active = false;
      state.leak.closedAt = state.clock;
      state.leak.rate = 0;
      log(state, "info", "Fuite colmatée, la purge est isolée.");
      ev.push({ type: "fuite-colmatee" });
    } else {
      state.leak.mass = r1(state.leak.mass + state.leak.rate);
      state.leak.rate = r1(state.leak.rate * f.decroissance);
      state.cloud.mass = state.leak.mass;
      state.cloud.radius = Math.round(15 + state.leak.mass / 95);
      state.cloud.drift = Math.round((state.clock - (state.leak.since || 0)) * f.ventMetresParMinute);
    }
  }

  /* 2. inflammation du nuage */
  if (
    state.plan.ignitionAt !== null &&
    !state.fire.active &&
    state.clock >= state.plan.ignitionAt &&
    state.cloud.mass > 0
  ) {
    state.fire.active = true;
    state.fire.since = state.clock;
    state.fire.cuvette = true;
    state.cloud.ignited = true;
    log(state, "alerte", "Le nuage s'allume à l'air libre. Feu de fuite en cuvette.");
    ev.push({ type: "inflammation" });
  }

  /* 3. réserve d'eau et allocation */
  const allocation = state.plan.water;
  if (allocation === "sphères" && !state.water.epuisee) {
    state.water.stock = r1(state.water.stock - r.coutRefroidissementParMinute);
  } else if (allocation === "feu" && !state.water.epuisee) {
    state.water.stock = r1(state.water.stock - r.coutExtinctionParMinute);
  } else if (!state.water.epuisee) {
    state.water.stock = r1(Math.min(physics.reserveEau.stock, state.water.stock + r.rechargeParMinute));
  }
  if (state.water.stock <= 0 && !state.water.epuisee) {
    state.water.stock = 0;
    state.water.epuisee = true;
    log(state, "critique", "Réserve d'eau épuisée. Plus aucun arrosage possible.");
    ev.push({ type: "eau-epuisee" });
  }

  /* 4. thermique de la sphère 443 puis des voisines */
  const s = physics.sphere443;
  const cooling =
    state.plan.water === "sphères" && !state.water.epuisee ? s.refroidissementParEau : s.refroidissementNaturel;

  for (const sp of state.spheres) {
    if (sp.ruptured) continue;
    let heat = 0;
    if (state.fire.active && sp.id === "443") heat = s.chauffeIncendie;
    else if (state.fire.active && sp.id !== "443" && state.spheres[0].ruptured) heat = s.chauffeVoisine;
    else if (state.cloud.ignited) heat = s.chauffeVoisine * 0.5;

    /* sans incendie, la paroi revient simplement vers l'ambiant : elle ne descend pas en dessous */
    let cool = cooling;
    if (!state.fire.active && !state.cloud.ignited) {
      cool = sp.wall > s.temperatureParoiInitiale ? -0.3 : 0;
    }

    sp.wall = r1(clamp(sp.wall + heat + cool, -20, 400));
    sp.pressure = pressureFor(sp.wall, physics);

    const rupture = sp.pressure >= s.pressionRupture || sp.wall >= s.temperatureRupture;
    if (rupture) {
      sp.ruptured = true;
      state.ruptures += 1;
      log(
        state,
        "critique",
        sp.id === "443"
          ? "La sphère 443 éclate. Boule de feu, effet de souffle sur tout le parc."
          : "Une sphère voisine éclate à son tour. Propagation en chaîne."
      );
      ev.push({ type: "rupture", sphere: sp.id });
      if (sp.id === "443") {
        state.fire.active = true;
        state.ruptureContext = {
          t: state.clock,
          heure: heureDe(state.clock),
          secours: state.rescue.distance,
          repli: state.rescue.withdrawn,
          evacuated: state.perimeter.evacuated,
          perimetre: state.perimeter.radius,
          a7: state.plan.a7
        };
      }
    }
  }

  /* 5. périmètre et secours */
  if (state.plan.perimeter !== state.perimeter.radius) {
    state.perimeter.radius = state.plan.perimeter;
  }
  state.perimeter.evacuated = state.plan.evacuate;
  state.rescue.distance = state.plan.rescue;
  state.rescue.withdrawn = state.plan.withdraw;

  return ev;
}

/* Avance jusqu'à une minute cible incluse. */
export function advanceTo(state, physics, target) {
  const events = [];
  while (state.clock < target) {
    events.push(...tick(state, physics));
  }
  return events;
}
