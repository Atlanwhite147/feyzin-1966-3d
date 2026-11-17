/* Client temps réel : une seule connexion, un petit magasin observable.
   Aucun rendu ici : les composants lisent l'état via useNet(). */

import { io } from "socket.io-client";

const socket = io({ transports: ["websocket"], autoConnect: true });

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

socket.on("connect", () => publier({ connecte: true, erreur: null }));
socket.on("disconnect", () => publier({ connecte: false }));
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
      if (r?.ok) publier({ pin: r.pin, public: r.etat });
      resolve(r);
    });
  });
}

export function rejoindreHost(pin) {
  return new Promise((resolve) => {
    socket.emit("host:rejoindre", { pin }, (r) => {
      if (r?.ok) publier({ pin: r.pin, public: r.etat });
      resolve(r);
    });
  });
}

export function rejoindrePlay(pin, nom, role) {
  return new Promise((resolve) => {
    socket.emit("play:rejoindre", { pin, nom, role }, (r) => {
      if (r?.ok) publier({ pin: r.pin, role: r.role, public: r.etat });
      else publier({ erreur: r?.erreur || "refus" });
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

export { socket };
