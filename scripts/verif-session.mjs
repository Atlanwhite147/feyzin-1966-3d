/* Vérifie qu'une séance entière s'enchaîne sans intervention :
   création, quatre joueurs, lancement, puis cinq phases et le débrief.
   Usage : node scripts/verif-session.mjs [url] */
import { io } from "socket.io-client";

const url = process.argv[2] || "http://127.0.0.1:3100";
const roles = ["OPERATEUR_PURGE", "CHEF_DE_QUART", "POMPIERS_VIENNE_LYON", "GENDARMERIE_A7"];
const noms = ["Claire", "Marc", "Sonia", "Yanis"];

const host = io(url, { transports: ["websocket"] });
const journal = [];
let fini = false;

function noter(txt) {
  const t = ((Date.now() - depart) / 1000).toFixed(1).padStart(5);
  journal.push(t + "s  " + txt);
  console.log(journal.at(-1));
}

const depart = Date.now();

host.on("state", (s) => {
  const cle = s.etat + "/" + s.phase;
  if (journal.at(-1)?.includes(cle)) return;
  noter(cle + (s.revelationDans != null ? " (suite dans " + s.revelationDans + "s)" : ""));
  if (s.etat === "debrief") {
    fini = true;
    noter("débrief atteint · fin " + (s.fin?.id || "?") + " · " + (s.fin?.morts ?? "?") + " morts");
    setTimeout(() => {
      const phases = journal.filter((l) => l.includes("decision/")).length;
      console.log("\n" + (phases >= 5 ? "OK" : "ÉCHEC") + " : " + phases + " phases jouées, débrief " + (fini ? "atteint" : "absent"));
      process.exit(phases >= 5 && fini ? 0 : 1);
    }, 300);
  }
});

host.on("connect", () => {
  host.emit("host:creer", {}, (r) => {
    noter("salle " + r.pin);
    let restant = roles.length;
    const joueurs = roles.map((role, i) => {
      const c = io(url, { transports: ["websocket"] });
      c.on("connect", () => {
        c.emit("play:rejoindre", { pin: r.pin, nom: noms[i], role }, (x) => {
          if (--restant === 0) {
            noter("quatre postes occupés, lancement");
            setTimeout(() => host.emit("host:avancer"), 300);
          }
        });
      });
      c.on("state", (s) => { if (s.etat === "decision") c.emit("play:vote", { choix: 1 }); });
      return c;
    });
    setTimeout(() => { console.log("délai dépassé"); process.exit(1); }, 120000);
  });
});
