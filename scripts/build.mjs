/* Build esbuild : un seul bundle, pas de dépendance à Vite.
   Le numéro de version est écrit dans index.html pour éviter tout cache de bundle. */
import fs from "node:fs";

let esbuild;
try {
  esbuild = await import("esbuild");
} catch (e) {
  console.error("esbuild est absent : lancez d'abord « npm install » dans ce dossier.");
  process.exit(1);
}

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "public/app.js",
  format: "esm",
  target: ["chrome100", "safari15"],
  jsx: "automatic",
  loader: { ".js": "jsx", ".png": "dataurl", ".jpg": "dataurl" },
  minify: !watch,
  sourcemap: watch,
  logLevel: "info",
  define: { "process.env.NODE_ENV": watch ? '"development"' : '"production"' }
};

fs.mkdirSync("public", { recursive: true });

function versionner() {
  const stamp = Date.now().toString(36);
  const html = fs.readFileSync("index.html", "utf8");
  const suivant = html.replace(/\/public\/app\.js(\?v=[a-z0-9]+)?"/, "/public/app.js?v=" + stamp + '"');
  if (suivant !== html) fs.writeFileSync("index.html", suivant);
  console.log("index.html pointe sur app.js?v=" + stamp);
}

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  versionner();
  console.log("esbuild en veille");
} else {
  await esbuild.build(options);
  console.log("bundle écrit : public/app.js");
  versionner();
}
