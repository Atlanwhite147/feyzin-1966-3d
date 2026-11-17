/* Client temps réel : une seule connexion, un petit magasin observable.
   Aucun rendu ici : les composants lisent l'état via useNet(). */

import { io } from "socket.io-client";

/* On garde la trace de la session pour se réinscrire automatiquement après une
   coupure réseau : sans cela, l'écran de salle se fige au premier incident. */
const session = { type: null, pin: null, role: null, nom: null };

const socket = io({ autoConnect: true, transports: ["websocket", "polling"] });

let etat = {
  connecte: false,
  pin: null,
  role: null,
  public: null,
  capteurs: null,
  tick: null,
  erreur: null
};

const abonnes = new Set();

function publier(patch) {
  etat = { ...etat, ...patch };
  for (const f of abonnes) f(etat);
}

socket.on("connect", () => {
  if (typeof window !== "undefined") window.__net = { connecte: true, id: socket.id, depuis: Date.now() };
  publier({ connecte: true, erreur: null });
  if (!session.pin) return;
  if (session.type === "host") {
    socket.emit("host:rejoindre", { pin: session.pin }, (r) => {
      if (r?.ok) { publier({ public: r.etat }); return; }
      /* la salle a disparu (redémarrage du serveur) : on en ouvre une neuve */
      socket.emit("host:creer", {}, (n) => {
        if (n?.ok) { session.pin = n.pin; publier({ pin: n.pin, public: n.etat }); }
      });
    });
  } else if (session.type === "play") {
    socket.emit("play:rejoindre", { pin: session.pin, nom: session.nom, role: session.role }, (r) => {
      if (r?.ok) publier({ public: r.etat, role: r.role });
    });
  }
});
socket.on("disconnect", (raison) => {
  if (typeof window !== "undefined") window.__net = { connecte: false, raison, depuis: Date.now() };
  publier({ connecte: false });
});
socket.on("connect_error", (e) => {
  if (typeof window !== "undefined") window.__net = { connecte: false, raison: "connect_error: " + e.message, depuis: Date.now() };
});
socket.on("state", (p) => publier({ public: p }));
socket.on("tick", (t) => publier({ tick: t }));
socket.on("capteurs", (c) => publier({ capteurs: c }));

export function abonner(f) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

export function instantane() {
  return etat;
}

export function creerSalle() {
  return new Promise((resolve) => {
    socket.emit("host:creer", {}, (r) => {
      if (r?.ok) {
        session.type = "host";
        session.pin = r.pin;
        publier({ pin: r.pin, public: r.etat });
      }
      resolve(r);
    });
  });
}

export function rejoindreHost(pin) {
  return new Promise((resolve) => {
    socket.emit("host:rejoindre", { pin }, (r) => {
      if (r?.ok) {
        session.type = "host";
        session.pin = r.pin;
        publier({ pin: r.pin, public: r.etat });
      }
      resolve(r);
    });
  });
}

export function rejoindrePlay(pin, nom, role) {
  return new Promise((resolve) => {
    socket.emit("play:rejoindre", { pin, nom, role }, (r) => {
      if (r?.ok) {
        session.type = "play";
        session.pin = r.pin;
        session.role = r.role;
        session.nom = nom;
        publier({ pin: r.pin, role: r.role, public: r.etat });
      } else publier({ erreur: r?.erreur || "refus" });
      resolve(r);
    });
  });
}

export function voter(choix) {
  socket.emit("play:vote", { choix });
}

export function avancer() {
  socket.emit("host:avancer");
}

export function clore() {
  socket.emit("host:clore");
}

export function reremplir() {
  socket.emit("host:reremplir");
}

export { socket, session };
