/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* État initial de la simulation. Pur : aucun accès réseau, aucune horloge système. */

export function parseHeure(h) {
  const m = /(\d{1,2})\s*h\s*(\d{2})/.exec(String(h));
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatHeure(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return String(h).padStart(2, "0") + " h " + String(m).padStart(2, "0");
}

/* L'horloge de la simulation démarre à 06 h 30 : clock 0 = 06:30. */
export const DEBUT = 6 * 60 + 30;

export function heureDe(clock) {
  return formatHeure(DEBUT + clock);
}

export function createState(physics) {
  const s = physics.sphere443;
  return {
    clock: 0,
    step: 0,
    plan: {
      leakRate: 0,
      closeAt: null,
      ignitionAt: null,
      a7: "open",
      perimeter: 0,
      evacuate: false,
      water: "aucun",
      rescue: physics.population.distanceSapeursInitiale,
      alert: 0,
      withdraw: false
    },
    leak: { active: false, rate: 0, mass: 0, closedAt: null },
    cloud: { mass: 0, radius: 0, drift: 0, ignited: false },
    fire: { active: false, since: null, cuvette: false },
    spheres: [
      { id: "443", wall: s.temperatureParoiInitiale, pressure: s.pressionInitiale, ruptured: false },
      { id: "442", wall: s.temperatureParoiInitiale, pressure: s.pressionInitiale, ruptured: false },
      { id: "441", wall: s.temperatureParoiInitiale, pressure: s.pressionInitiale, ruptured: false }
    ],
    water: { stock: physics.reserveEau.stock, epuisee: false },
    perimeter: { radius: 0, evacuated: false },
    rescue: { distance: physics.population.distanceSapeursInitiale, withdrawn: false },
    ruptures: 0,
    log: [],
    history: []
  };
}

export function clone(state) {
  return JSON.parse(JSON.stringify(state));
}
