/* Mesure réelle de la boucle de rendu dans un navigateur, via le protocole CDP.
   À lancer pendant que le serveur tourne : node scripts/mesure-perf.mjs [url] */

import http from "node:http";

const url = process.argv[2] || "http://127.0.0.1:3100/host";
const cible = new URL(url);
const version = await new Promise((resolve, reject) => {
  http.get(`http://${cible.hostname}:${cible.port}/json/version`, (r) => {
    let d = "";
    r.on("data", (c) => (d += c));
    r.on("end", () => resolve(JSON.parse(d)));
  }).on("error", reject);
}).catch(() => null);

if (!version) {
  console.log("Aucun navigateur en écoute sur " + cible.host + ". Lancer d'abord un Chrome avec --remote-debugging-port.");
  process.exit(1);
}
console.log("Navigateur : " + version["Browser"]);
