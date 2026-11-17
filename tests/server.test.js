import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { creerServeur } from "../server/app.js";
import { io } from "socket.io-client";

let srv, port;

before(async () => {
  port = 3400 + Math.floor(Math.random() * 200);
  srv = creerServeur({ port });
  await new Promise((r) => setTimeout(r, 150));
});

after(() => { srv?.arreter(); });

function client() {
  return io(`http://127.0.0.1:${port}`, { transports: ["websocket"], forceNew: true });
}

function attendre(ms) { return new Promise((r) => setTimeout(r, ms)); }

function appel(socket, evenement, payload) {
  return new Promise((resolve) => socket.emit(evenement, payload, resolve));
}

test("une salle s'ouvre avec un PIN à quatre chiffres", async () => {
  const c = client();
  const r = await appel(c, "host:creer", {});
  assert.equal(r.ok, true);
  assert.match(String(r.pin), /^\d{4}$/);
  assert.equal(r.etat.etat, "attente");
  c.close();
});

test("les quatre rôles peuvent entrer, un rôle déjà pris est refusé", async () => {
  const host = client();
  const { pin } = await appel(host, "host:creer", {});
  const a = client();
  const r1 = await appel(a, "play:rejoindre", { pin, nom: "Claire", role: "OPERATEUR_PURGE" });
  assert.equal(r1.ok, true);
  assert.equal(r1.role, "OPERATEUR_PURGE");

  const b = client();
  const r2 = await appel(b, "play:rejoindre", { pin, nom: "Marc", role: "OPERATEUR_PURGE" });
  assert.equal(r2.ok, false);
  assert.match(r2.erreur, /déjà tenu/);

  const r3 = await appel(b, "play:rejoindre", { pin, nom: "Marc", role: "ROLE_INVENTE" });
  assert.equal(r3.ok, false);

  const r4 = await appel(b, "play:rejoindre", { pin: "0000", nom: "Marc", role: "CHEF_DE_QUART" });
  assert.equal(r4.ok, false);
  host.close(); a.close(); b.close();
});

test("les capteurs sont diffusés à 10 Hz et filtrés par rôle", async () => {
  const host = client();
  const { pin } = await appel(host, "host:creer", {});
  const op = client();
  const gend = client();
  await appel(op, "play:rejoindre", { pin, nom: "Claire", role: "OPERATEUR_PURGE" });
  await appel(gend, "play:rejoindre", { pin, nom: "Yanis", role: "GENDARMERIE_A7" });

  const ticksHost = [];
  const capteursOp = [];
  const capteursGend = [];
  host.on("tick", (t) => ticksHost.push(t));
  op.on("capteurs", (c) => capteursOp.push(c));
  gend.on("capteurs", (c) => capteursGend.push(c));

  await attendre(1200);
  assert.ok(ticksHost.length >= 8, "au moins 8 ticks par seconde, obtenu " + ticksHost.length);
  assert.ok(capteursOp.length >= 8 && capteursGend.length >= 8, "capteurs par rôle à 10 Hz");

  const opDernier = capteursOp.at(-1);
  const gendDernier = capteursGend.at(-1);
  assert.ok("valve_icing_level" in opDernier, "l'opérateur voit son givre");
  assert.equal("cloud_density_a7" in opDernier, false, "l'opérateur ne voit pas la nappe à l'A7");
  assert.ok("cloud_density_a7" in gendDernier, "la gendarmerie voit la nappe sur l'A7");
  assert.equal("valve_icing_level" in gendDernier, false, "la gendarmerie ne voit pas la vanne");
  assert.ok(Array.isArray(gendDernier.wind_vector));

  host.close(); op.close(); gend.close();
});

test("le vote de la salle fait avancer le moteur physique", async () => {
  const host = client();
  const { pin } = await appel(host, "host:creer", {});
  const op = client();
  await appel(op, "play:rejoindre", { pin, nom: "Claire", role: "OPERATEUR_PURGE" });

  let dernier = null;
  host.on("state", (s) => { dernier = s; });

  host.emit("host:avancer");
  await attendre(200);
  assert.equal(dernier.etat, "decision");
  assert.equal(dernier.phase, 1);
  assert.ok(dernier.chrono > 40);

  op.emit("play:vote", { choix: 2 });
  await attendre(200);
  assert.equal(dernier.votes.OPERATEUR_PURGE, 2);

  const nappeAvant = dernier.capteurs.nappe_masse;
  host.emit("host:clore");
  await attendre(300);
  assert.equal(dernier.etat, "revelation");
  assert.ok(dernier.capteurs.nappe_masse > nappeAvant, "la fuite doit produire de la nappe");
  assert.ok(dernier.capteurs.valve_icing_level > 0);

  host.close(); op.close();
});

test("cinq phases mènent au débrief, avec une fin évaluée", async () => {
  const host = client();
  const { pin } = await appel(host, "host:creer", {});
  const roles = ["OPERATEUR_PURGE", "CHEF_DE_QUART", "POMPIERS_VIENNE_LYON", "GENDARMERIE_A7"];
  const joueurs = [];
  for (const r of roles) {
    const c = client();
    await appel(c, "play:rejoindre", { pin, nom: r.slice(0, 6), role: r });
    joueurs.push(c);
  }

  let dernier = null;
  host.on("state", (s) => { dernier = s; });

  for (let p = 0; p < 5; p++) {
    host.emit("host:avancer");
    await attendre(120);
    for (const j of joueurs) j.emit("play:vote", { choix: 0 });
    await attendre(120);
    host.emit("host:clore");
    await attendre(220);
  }

  assert.equal(dernier.etat, "debrief");
  assert.ok(dernier.fin, "une fin doit être évaluée");
  assert.ok(["maitrise", "bleve-contenu", "historique", "chaine"].includes(dernier.fin.id));
  assert.ok(dernier.debrief && dernier.debrief.lignes.length >= 5);

  host.close(); joueurs.forEach((j) => j.close());
});

test("un rôle qui part libère sa place", async () => {
  const host = client();
  const { pin } = await appel(host, "host:creer", {});
  const a = client();
  await appel(a, "play:rejoindre", { pin, nom: "Claire", role: "CHEF_DE_QUART" });
  let dernier = null;
  host.on("state", (s) => { dernier = s; });
  await attendre(150);
  assert.equal(dernier.joueurs.length, 1);
  a.close();
  await attendre(250);
  assert.equal(dernier.joueurs.length, 0);
  const b = client();
  const r = await appel(b, "play:rejoindre", { pin, nom: "Marc", role: "CHEF_DE_QUART" });
  assert.equal(r.ok, true);
  host.close(); b.close();
});
