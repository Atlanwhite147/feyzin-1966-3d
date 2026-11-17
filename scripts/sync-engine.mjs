/* Copie le moteur de simulation éprouvé du projet 2D vers ce projet 3D.
   Source unique de vérité : ../live-worker/src/engine et ../live-worker/src/data/bundle.js.
   Les tests du moteur restent ceux de live-worker (npm test là-bas). */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ici = path.dirname(fileURLToPath(import.meta.url));
const racine = path.join(ici, "..");
const source = path.join(racine, "..", "live-worker", "src");
const cible = path.join(racine, "src", "sim");

fs.mkdirSync(path.join(cible, "engine"), { recursive: true });
fs.mkdirSync(path.join(cible, "data"), { recursive: true });

/* room.js reste au projet 2D : la salle 3D a sa propre logique de session. */
const fichiers = fs.readdirSync(path.join(source, "engine")).filter((f) => f.endsWith(".js") && f !== "room.js");
for (const f of fichiers) {
  fs.copyFileSync(path.join(source, "engine", f), path.join(cible, "engine", f));
}
fs.copyFileSync(path.join(source, "data", "bundle.js"), path.join(cible, "data", "bundle.js"));

const entete = "/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */\n";
for (const f of fichiers) {
  const p = path.join(cible, "engine", f);
  const contenu = fs.readFileSync(p, "utf8");
  if (!contenu.startsWith("/* GÉNÉRÉ")) fs.writeFileSync(p, entete + contenu);
}
fs.writeFileSync(
  path.join(cible, "README.md"),
  "# Moteur de simulation\n\nCopie automatique de `../../live-worker/src/engine`.\nRelancer `npm run sync:engine` après toute modification du moteur ou des données.\n"
);

console.log(fichiers.length + " fichiers moteur copiés, bundle de données copié");
