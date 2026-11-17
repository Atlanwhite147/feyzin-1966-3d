/* Quatre joueurs automatiques, pour les essais de bout en bout.
   Usage : node scripts/joueurs-auto.mjs <PIN> [nombre] [choix] */
import { io } from "socket.io-client";

const pin = process.argv[2];
const nombre = Number(process.argv[3] || 4);
const choix = Number(process.argv[4] || 0);
const roles = ["OPERATEUR_PURGE", "CHEF_DE_QUART", "POMPIERS_VIENNE_LYON", "GENDARMERIE_A7"];
const noms = ["Claire", "Marc", "Sonia", "Yanis"];

if (!pin) {
  console.log("PIN manquant");
  process.exit(1);
}

for (let i = 0; i < Math.min(nombre, 4); i++) {
  const c = io("http://127.0.0.1:3100", { transports: ["websocket"] });
  c.on("connect", () => {
    c.emit("play:rejoindre", { pin, nom: noms[i], role: roles[i] }, (r) => {
      console.log(noms[i], roles[i], r.ok ? "entré" : "refusé " + r.erreur);
    });
  });
  c.on("state", (s) => {
    if (s.etat === "decision") c.emit("play:vote", { choix });
  });
  c.on("disconnect", () => console.log(noms[i], "déconnecté"));
}
console.log("joueurs automatiques prêts sur le PIN " + pin);
