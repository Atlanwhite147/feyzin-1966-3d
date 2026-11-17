/* Feyzin 1966 · 3D — serveur de séance.
   Une salle = un code PIN à quatre chiffres, un écran /host, jusqu'à quatre rôles sur /play.
   Le moteur de simulation est celui du projet 2D (src/sim), éprouvé par ses tests.
   Diffusion à 10 Hz, avec filtrage par rôle (brouillard d'information). */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

import { physics, scenario, history } from "../src/sim/data/bundle.js";
import { newGame, jouer, resume, tension, evaluateEnding, debrief, heureDe } from "../src/sim/engine/index.js";

const PORT = process.env.PORT || 3100;
const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export const ROLES = ["OPERATEUR_PURGE", "CHEF_DE_QUART", "POMPIERS_VIENNE_LYON", "GENDARMERIE_A7"];

/* Cinq phases, de 06 h 40 à 08 h 45. Chaque phase consomme une ou deux étapes du moteur. */
export const PHASES = [
  { n: 1, titre: "La purge", heure: "06 h 40", steps: [0], fin: "06 h 55", duree: 45 },
  { n: 2, titre: "La fuite et le nuage", heure: "06 h 55", steps: [1, 2], fin: "07 h 15", duree: 45 },
  { n: 3, titre: "L'inflammation", heure: "07 h 15", steps: [3], fin: "07 h 45", duree: 45 },
  { n: 4, titre: "La soupape", heure: "07 h 45", steps: [4], fin: "08 h 45", duree: 45 },
  { n: 5, titre: "Le BLEVE", heure: "08 h 45", steps: [5], fin: "09 h 15", duree: 45 }
];

const salles = new Map();

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function pin4() {
  let p = "";
  do {
    p = String(Math.floor(1000 + Math.random() * 9000));
  } while (salles.has(p));
  return p;
}

function salleVide(pin) {
  const sim = newGame(physics, scenario);
  return {
    pin,
    sim,
    phase: 0,
    etat: "attente",
    joueurs: {},
    votes: {},
    debutPhase: null,
    chrono: PHASES[0].duree,
    dernierChoix: null,
    journal: [],
    creee: Date.now()
  };
}

/* ---------- capteurs ---------- */

/* La paroi du moteur va de 12 à 62 °C. L'écran affiche une température de métal
   exposé au feu, de 20 à 650 °C : même variable, autre échelle, plus parlante. */
function metalTemp(wall) {
  const t = clamp(((wall - 12) / 50) * 630 + 20, 20, 650);
  return Math.round(t);
}

function capteurs(salle) {
  const s = salle.sim.state;
  const f = physics.fuite;
  const derive = s.cloud.drift;
  const densite = clamp((derive / f.distanceA7) * 100, 0, 100);
  const icing = s.leak.active ? clamp(30 + s.clock * 0.8, 0, 100) : clamp(20 + s.clock * 0.3, 0, 100);
  const ventAngle = 0.35;
  return {
    clock_min: s.clock,
    valve_icing_level: Math.round(icing),
    sphere_443_metal_temp: s.spheres[0].ruptured ? 650 : metalTemp(s.spheres[0].wall),
    cloud_density_a7: Math.round(densite),
    water_reserve: Math.round(s.water.stock),
    wind_vector: [Math.cos(ventAngle), Math.sin(ventAngle)],
    firefighters_deployed: !s.rescue.withdrawn && s.rescue.distance <= 200,
    a7_traffic_blocked: s.plan.a7 === "closed",
    bleve_triggered: s.ruptures > 0,
    fuite_active: s.leak.active,
    incendie: s.fire.active,
    nappe_masse: Math.round(s.cloud.mass),
    nappe_rayon: s.cloud.radius,
    pression: s.spheres[0].ruptured ? null : Math.round(s.spheres[0].pressure * 10) / 10,
    perimetre: s.perimeter.radius,
    secours_distance: s.rescue.distance
  };
}

/* Brouillard d'information : chaque rôle ne voit que ce que ses yeux ou ses capteurs donnent. */
export function capteursPour(role, tout) {
  const c = tout;
  if (role === "OPERATEUR_PURGE") {
    return {
      clock_min: c.clock_min,
      valve_icing_level: c.valve_icing_level,
      sphere_443_metal_temp: c.sphere_443_metal_temp,
      pression: c.pression,
      fuite_active: c.fuite_active,
      nappe_rayon: c.nappe_rayon
    };
  }
  if (role === "CHEF_DE_QUART") {
    return {
      clock_min: c.clock_min,
      sphere_443_metal_temp: c.sphere_443_metal_temp,
      pression: c.pression,
      water_reserve: c.water_reserve,
      cloud_density_a7: Math.round(c.cloud_density_a7 * 0.6),
      a7_traffic_blocked: c.a7_traffic_blocked,
      incendie: c.incendie,
      nappe_masse: c.nappe_masse
    };
  }
  if (role === "POMPIERS_VIENNE_LYON") {
    return {
      clock_min: c.clock_min,
      sphere_443_metal_temp: c.sphere_443_metal_temp,
      water_reserve: c.water_reserve,
      firefighters_deployed: c.firefighters_deployed,
      incendie: c.incendie,
      bleve_triggered: c.bleve_triggered,
      perimetre: c.perimetre
    };
  }
  return {
    clock_min: c.clock_min,
    cloud_density_a7: c.cloud_density_a7,
    wind_vector: c.wind_vector,
    a7_traffic_blocked: c.a7_traffic_blocked
  };
}

/* ---------- état diffusé ---------- */

function etatPublic(salle) {
  const c = capteurs(salle);
  const fin = salle.sim.fin || (salle.etat === "debrief" ? evaluateEnding(salle.sim.state, physics) : null);
  return {
    pin: salle.pin,
    phase: salle.etat === "attente" ? 0 : PHASES[salle.phase]?.n || 5,
    titre: PHASES[salle.phase]?.titre || "Débrief",
    etat: salle.etat,
    chrono: salle.chrono,
    joueurs: Object.values(salle.joueurs).map((j) => ({ nom: j.nom, role: j.role })),
    votes: salle.votes,
    capteurs: c,
    crise: resume(salle.sim),
    tension: tension(salle.sim.state, physics),
    fin,
    debrief: salle.etat === "debrief" ? debrief(salle.sim) : null,
    journal: salle.journal.slice(-6)
  };
}

function journaliser(salle, texte, niveau = "info") {
  salle.journal.push({ h: heureDe(salle.sim.state.clock), texte, niveau });
}

/* ---------- déroulé ---------- */

function lancerPhase(salle, index) {
  salle.phase = index;
  salle.etat = "decision";
  salle.votes = {};
  salle.dernierChoix = null;
  salle.debutPhase = Date.now();
  salle.chrono = PHASES[index].duree;
  journaliser(salle, "Phase " + PHASES[index].n + " · " + PHASES[index].titre, "phase");
}

export function fermerPhase(salle) {
  if (salle.etat !== "decision") return;
  const phase = PHASES[salle.phase];
  const total = [0, 1, 2].map((j) => Object.values(salle.votes).filter((v) => v === j).length);
  const max = Math.max(...total);
  const choix = max === 0 ? 2 : total.indexOf(max); /* sans vote, la salle suit le réel */
  salle.dernierChoix = { choix, total };

  for (const step of phase.steps) {
    if (salle.sim.state.step > step) continue;
    while (salle.sim.state.step < step) {
      salle.sim = { ...salle.sim, ...jouer(salle.sim, choix) };
    }
    salle.sim = { ...salle.sim, ...jouer(salle.sim, Math.min(choix, (scenario.etapes[step].options.length - 1))) };
  }

  journaliser(salle, "Choix de la salle : " + "ABC"[choix] + " (" + max + " voix)", "vote");

  if (salle.phase >= PHASES.length - 1) {
    salle.etat = "debrief";
    salle.sim.fin = evaluateEnding(salle.sim.state, physics);
    journaliser(salle, "Fin de séance : " + salle.sim.fin.titre, "fin");
  } else {
    salle.etat = "revelation";
  }
}

function avancer(salle) {
  if (salle.etat === "revelation") {
    lancerPhase(salle, salle.phase + 1);
  } else if (salle.etat === "attente") {
    lancerPhase(salle, 0);
  }
}

/* ---------- socket ---------- */

export function creerServeur({ port = PORT } = {}) {
  const serveur = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    let p = url.pathname === "/" ? "/index.html" : url.pathname;

    if (p === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, salles: salles.size }));
      return;
    }
    if (p === "/data/history.json") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(history));
      return;
    }
    if (p.startsWith("/assets/")) p = "/public" + p;
    const fichier = path.join(RACINE, p === "/index.html" ? "index.html" : p);
    if (!fichier.startsWith(RACINE) || !fs.existsSync(fichier) || fs.statSync(fichier).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Introuvable");
      return;
    }
    const ext = path.extname(fichier);
    const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webm": "video/webm", ".png": "image/png" };
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(fichier).pipe(res);
  });

  const io = new Server(serveur, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.data.role = null;
    socket.data.pin = null;

    socket.on("host:creer", (_payload, reponse) => {
      const pin = pin4();
      const salle = salleVide(pin);
      salles.set(pin, salle);
      socket.data.pin = pin;
      socket.data.role = "HOST";
      socket.join(pin);
      journaliser(salle, "Salle ouverte, en attente des équipes", "info");
      reponse?.({ ok: true, pin, etat: etatPublic(salle) });
      io.to(pin).emit("state", etatPublic(salle));
    });

    socket.on("host:rejoindre", ({ pin } = {}, reponse) => {
      const salle = salles.get(String(pin));
      if (!salle) return reponse?.({ ok: false, erreur: "PIN inconnu" });
      socket.data.pin = salle.pin;
      socket.data.role = "HOST";
      socket.join(salle.pin);
      reponse?.({ ok: true, pin: salle.pin, etat: etatPublic(salle) });
    });

    socket.on("play:rejoindre", ({ pin, nom, role } = {}, reponse) => {
      const salle = salles.get(String(pin));
      if (!salle) return reponse?.({ ok: false, erreur: "PIN inconnu" });
      if (!ROLES.includes(role)) return reponse?.({ ok: false, erreur: "Rôle inconnu" });
      const pris = Object.values(salle.joueurs).some((j) => j.role === role);
      if (pris) return reponse?.({ ok: false, erreur: "Ce rôle est déjà tenu" });
      const propre = String(nom || "").trim().replace(/[<>]/g, "").slice(0, 20);
      if (!propre) return reponse?.({ ok: false, erreur: "Prénom manquant" });
      salle.joueurs[socket.id] = { nom: propre, role, depuis: Date.now() };
      socket.data.pin = salle.pin;
      socket.data.role = role;
      socket.join(salle.pin);
      journaliser(salle, propre + " prend le rôle " + role, "info");
      reponse?.({ ok: true, pin: salle.pin, role, etat: etatPublic(salle) });
      io.to(salle.pin).emit("state", etatPublic(salle));
    });

    socket.on("play:vote", ({ choix } = {}) => {
      const salle = salles.get(socket.data.pin);
      if (!salle || salle.etat !== "decision") return;
      const role = socket.data.role;
      if (!ROLES.includes(role)) return;
      if (![0, 1, 2].includes(Number(choix))) return;
      salle.votes[role] = Number(choix);
      io.to(salle.pin).emit("state", etatPublic(salle));
    });

    socket.on("host:avancer", () => {
      const salle = salles.get(socket.data.pin);
      if (!salle || socket.data.role !== "HOST") return;
      avancer(salle);
      io.to(salle.pin).emit("state", etatPublic(salle));
    });

    socket.on("host:clore", () => {
      const salle = salles.get(socket.data.pin);
      if (!salle || socket.data.role !== "HOST") return;
      fermerPhase(salle);
      io.to(salle.pin).emit("state", etatPublic(salle));
    });

    socket.on("host:reremplir", () => {
      const salle = salles.get(socket.data.pin);
      if (!salle || socket.data.role !== "HOST") return;
      const neuve = salleVide(salle.pin);
      neuve.joueurs = salle.joueurs;
      salles.set(salle.pin, neuve);
      io.to(salle.pin).emit("state", etatPublic(neuve));
    });

    socket.on("disconnect", () => {
      const salle = salles.get(socket.data.pin);
      if (!salle) return;
      if (salle.joueurs[socket.id]) {
        const j = salle.joueurs[socket.id];
        delete salle.joueurs[socket.id];
        delete salle.votes[j.role];
        io.to(salle.pin).emit("state", etatPublic(salle));
      }
    });
  });

  /* Boucle à 10 Hz : capteurs filtrés par rôle, plus un état complet pour l'écran de salle. */
  const boucle = setInterval(() => {
    for (const salle of salles.values()) {
      const tout = capteurs(salle);
      if (salle.etat === "decision" && salle.debutPhase) {
        const ecoule = (Date.now() - salle.debutPhase) / 1000;
        salle.chrono = Math.max(0, Math.round(PHASES[salle.phase].duree - ecoule));
        if (salle.chrono === 0) fermerPhase(salle);
      }
      io.to(salle.pin).emit("tick", { phase: salle.phase, etat: salle.etat, chrono: salle.chrono, capteurs: tout });
      for (const [id, joueur] of Object.entries(salle.joueurs)) {
        io.to(id).emit("capteurs", capteursPour(joueur.role, tout));
      }
    }
  }, 100);
  boucle.unref?.();

  if (port) serveur.listen(port, () => console.log("Feyzin 3D — salle prête sur le port " + port));

  return { serveur, io, salles, arreter: () => { clearInterval(boucle); io.close(); serveur.close(); } };
}

if (process.argv[1] && process.argv[1].endsWith("app.js")) {
  creerServeur({});
}
