/* Build esbuild : un seul bundle, pas de dépendance à Vite. */
import * as esbuild from "esbuild";
import fs from "node:fs";

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

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("esbuild en veille");
} else {
  await esbuild.build(options);
  console.log("bundle écrit : public/app.js");
}
