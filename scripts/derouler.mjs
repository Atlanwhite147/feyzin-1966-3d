/* Déroule une séance entière depuis la ligne de commande, pour les répétitions.
   Usage : node scripts/derouler.mjs <PIN> [choix] */
import { io } from "socket.io-client";

const pin = process.argv[2];
const choix = Number(process.argv[3] || 0);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

if (!pin) { console.log("PIN manquant"); process.exit(1); }

const c = io("http://127.0.0.1:3100", { transports: ["websocket"] });
c.on("connect", async () => {
  c.emit("host:rejoindre", { pin }, async (r) => {
    if (!r?.ok) { console.log("salle refusée", r); process.exit(1); }
    console.log("salle", pin, "prise en main");
    for (let phase = 0; phase < 6; phase++) {
      c.emit("host:avancer");
      await pause(1500);
      c.emit("host:clore");
      await pause(1500);
      console.log("phase", phase + 1, "close");
    }
    await pause(1200);
    console.log("séance terminée");
    process.exit(0);
  });
});
c.on("connect_error", (e) => { console.log("erreur", e.message); process.exit(1); });
