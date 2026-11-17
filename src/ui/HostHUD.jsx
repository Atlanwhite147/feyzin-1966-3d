import React, { useEffect, useRef, useState } from "react";
import { clore, avancer, reremplir } from "../net/net.js";
import QRCode from "qrcode";
import { useNet } from "../net/useNet.js";

/* Interface de salle : la scène 3D est le fond permanent, tout le reste vient
   s'y superposer en surimpression. Pas de panneaux opaques, seulement des
   filets, des dégradés de bord et de la typographie. */

const ROLE_LABEL = {
  OPERATEUR_PURGE: "Opérateur purge",
  CHEF_DE_QUART: "Chef de quart",
  POMPIERS_VIENNE_LYON: "Pompiers",
  GENDARMERIE_A7: "Gendarmerie"
};

const HEURE = { 1: "06 h 40", 2: "06 h 55", 3: "07 h 15", 4: "07 h 45", 5: "08 h 45" };
const LETTRE = ["A", "B", "C"];

function Capteur({ label, valeur, max, unite, alerte }) {
  const pct = Math.max(0, Math.min(100, (valeur / max) * 100));
  return (
    <div className="cap">
      <div className="cap-haut">
        <span className="cap-label">{label}</span>
        <span className={"cap-val" + (alerte ? " alerte" : "")}>
          {Math.round(valeur)}
          <em>{unite}</em>
        </span>
      </div>
      <div className="cap-rail">
        <span className={"cap-jauge" + (alerte ? " alerte" : "")} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

export default function HostHUD({ pin, etat, connecte, son, onSon, rendu }) {
  const [aide, setAide] = useState(false);
  const [discret, setDiscret] = useState(false);
  const [compteur, setCompteur] = useState(false);
  const [fps, setFps] = useState(0);
  const [carte, setCarte] = useState(null);
  const [qr, setQr] = useState(null);
  const [adresse, setAdresse] = useState(typeof window !== "undefined" ? window.location.origin : "");
  const dernierePhase = useRef(0);

  /* Adresse de la salle : le serveur donne l'IP du réseau quand on est en local. */
  useEffect(() => {
    let vivant = true;
    fetch("/adresse")
      .then((r) => r.json())
      .then((d) => { if (vivant && d?.url) setAdresse(d.url.replace(/\/+$/, "")); })
      .catch(() => {});
    return () => { vivant = false; };
  }, []);

  /* QR d'accès : on le régénère à chaque nouveau code de salle. */
  useEffect(() => {
    if (!pin || typeof window === "undefined") return;
    let vivant = true;
    QRCode.toDataURL(adresse + "/play", { margin: 2, width: 240, color: { dark: "#0b0e13", light: "#f4ecdf" } })
      .then((url) => { if (vivant) setQr(url); })
      .catch(() => setQr(null));
    return () => { vivant = false; };
  }, [pin, adresse]);

  const c = etat?.capteurs || {};
  /* le décompte vient du flux 10 Hz, plus réactif que les changements d'état */
  const tick = useNet((e) => e.tick);
  const chrono =
    tick && tick.etat === etat?.etat && tick.phase + 1 === (etat?.phase ?? 0) ? tick.chrono : (etat?.chrono ?? 0);
  const phase = etat?.phase ?? 0;
  const decision = etat?.etat === "decision";
  const revelation = etat?.etat === "revelation";
  const attente = etat?.etat === "attente" || phase === 0;
  const votes = etat?.votes || {};
  const compte = LETTRE.map((_, i) => Object.values(votes).filter((v) => v === i).length);
  const joueurs = etat?.joueurs || [];

  /* clavier */
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === " ") { e.preventDefault(); clore(); }
      if (k === "n") avancer();
      if (k === "m") setDiscret((d) => !d);
      if (k === "?") setAide((a) => !a);
      if (k === "r") reremplir();
      if (k === "f") setCompteur((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* compteur d'images */
  useEffect(() => {
    let images = 0;
    let dernier = performance.now();
    let stop = false;
    const boucle = () => {
      if (stop) return;
      images += 1;
      const t = performance.now();
      if (t - dernier >= 1000) {
        setFps(Math.round((images * 1000) / (t - dernier)));
        images = 0;
        dernier = t;
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
    return () => { stop = true; };
  }, []);

  /* carte de passage de phase, en surimpression */
  useEffect(() => {
    if (phase > 0 && phase !== dernierePhase.current) {
      dernierePhase.current = phase;
      setCarte({ n: phase, titre: etat?.titre || "", heure: HEURE[phase] || "" });
      window.dispatchEvent(new CustomEvent("feyzin:carte", { detail: true }));
      const t = setTimeout(() => {
        setCarte(null);
        window.dispatchEvent(new CustomEvent("feyzin:carte", { detail: false }));
      }, 4200);
      return () => clearTimeout(t);
    }
  }, [phase, etat?.titre]);

  if (etat?.etat === "debrief" && etat.debrief) {
    return <Debrief etat={etat} fps={fps} />;
  }

  if (discret) {
    return (
      <>
        <style>{CSS}</style>
        <div className="voile-haut" />
        <div className="voile-bas" />
        <div className="discret">panneau masqué · M pour revenir</div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      {/* dégradés de bord : ils rendent le texte lisible sans masquer la scène */}
      <div className="voile-haut" />
      <div className="voile-bas" />

      {/* filet de progression de la phase, collé au bord supérieur */}
      {decision && <div className="progression" style={{ width: Math.max(0, Math.min(100, (chrono / 45) * 100)) + "%" }} />}

      <header className="entete">
        <div className="bloc-marque">
          <div className="marque">Feyzin 1966</div>
          <div className="mention">point sûreté · reconstitution</div>
        </div>

        <div className="bloc-phase">
          {attente ? (
            <>
              <div className="phase-num">séance</div>
              <div className="phase-titre attente-titre">avant la purge</div>
              <div className="phase-heure">4 janvier 1966 · 06 h 30</div>
            </>
          ) : (
            <>
              <div className="phase-num">
                phase {String(phase).padStart(2, "0")}
                <span className="phase-sur">/ 05</span>
              </div>
              <div className="phase-titre">{etat?.titre}</div>
              <div className="phase-heure">{HEURE[phase]}</div>
            </>
          )}
        </div>

        <div className="bloc-droite">
          <div className={"compte-a-rebours" + (chrono <= 10 ? " vif" : "")}>
            {decision ? chrono + "s" : revelation ? "clos" : "—"}
          </div>
          <div className="chrono-note">
            {decision
              ? "clôture automatique à 0 s"
              : revelation
                ? etat?.revelationDans != null
                  ? "phase suivante dans " + etat.revelationDans + " s"
                  : "choix enregistré"
                : "salle en attente"}
          </div>
          <div className="etat-ligne">
            <span className={c.a7_traffic_blocked ? "marqueur ok" : "marqueur"}>A7 {c.a7_traffic_blocked ? "coupée" : "ouverte"}</span>
            <span className={c.bleve_triggered ? "marqueur alerte" : "marqueur"}>{c.bleve_triggered ? "rupture" : "intègre"}</span>
            <span className="marqueur">secours {c.secours_distance ?? 0} m</span>
            {!connecte && <span className="marqueur alerte">hors ligne</span>}
          </div>
        </div>
      </header>

      {/* rail des capteurs, à droite, sans cadre */}
      <aside className="capteurs">
        <div className="capteurs-titre">capteurs du site</div>
        <Capteur label="Paroi 443" valeur={c.sphere_443_metal_temp ?? 20} max={650} unite="°C" alerte={(c.sphere_443_metal_temp ?? 0) > 380} />
        <Capteur label="Givre purge" valeur={c.valve_icing_level ?? 0} max={100} unite="%" alerte={(c.valve_icing_level ?? 0) > 70} />
        <Capteur label="Nappe / A7" valeur={c.cloud_density_a7 ?? 0} max={100} unite="%" alerte={(c.cloud_density_a7 ?? 0) > 45} />
        <Capteur label="Réserve eau" valeur={c.water_reserve ?? 100} max={100} unite="%" alerte={(c.water_reserve ?? 100) < 30} />
      </aside>

      {/* code de la salle, en bas à gauche, tant que la séance n'a pas commencé */}
      {attente && (
        <div className="invitation">
          <div className="invitation-titre">Rejoignez la salle depuis votre téléphone</div>
          <div className="invitation-corps">
            <div>
              <div className="invitation-pin">{pin || "····"}</div>
              <div className="invitation-url">
                {adresse.replace(/^https?:\/\//, "")}/play
                <span> · ou scannez le code</span>
              </div>
            </div>
            {qr && <img className="invitation-qr" src={qr} alt="code d'accès à la salle" />}
          </div>
        </div>
      )}

      {/* résultat du vote, en surimpression au centre */}
      {revelation && etat?.dernierChoix && (
        <div className="verdict">
          <div className="verdict-titre">choix de la salle</div>
          <div className="verdict-lettre">{LETTRE[etat.dernierChoix.choix]}</div>
          <div className="verdict-detail">
            {etat.dernierChoix.total.map((n, i) => (
              <span key={i} className={i === etat.dernierChoix.choix ? "retenu" : ""}>
                {LETTRE[i]} {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <footer className="pied">
        <div className="pied-gauche" />

        <div className="equipes">
          <div className="equipes-titre">
            postes <span>{joueurs.length}/4</span>
            <span className="points">
              {[0, 1, 2, 3].map((i) => <i key={i} className={i < joueurs.length ? "pris" : ""} />)}
            </span>
          </div>
          <div className="equipes-liste">
            {Object.keys(ROLE_LABEL).map((role) => {
              const j = joueurs.find((x) => x.role === role);
              return (
                <span key={role} className={"poste" + (j ? " pris" : "")}>
                  <i />
                  {ROLE_LABEL[role]}
                  {j ? <b>{j.nom}</b> : null}
                </span>
              );
            })}
          </div>
        </div>

        {decision && (
          <div className="salle-vote">
            <div className="salle-vote-titre">votes en cours</div>
            <div className="salle-vote-lignes">
              {compte.map((n, i) => (
                <span key={i}>
                  {LETTRE[i]}
                  <b>{n}</b>
                  <i style={{ width: Math.min(100, n * 33) + "%" }} />
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="commandes">
          <button className="cmd fort" onClick={clore}>clore la phase</button>
          <button className="cmd" onClick={avancer}>phase suivante</button>
          <button className="cmd" onClick={onSon}>{son ? "son actif" : "son coupé"}</button>
          <button className="cmd" onClick={() => setAide((a) => !a)}>?</button>
        </div>
      </footer>

      {carte && (
        <div className="carte">
          <div className="carte-num">phase {String(carte.n).padStart(2, "0")}</div>
          <div className="carte-titre">{carte.titre}</div>
          <div className="carte-heure">{carte.heure}</div>
        </div>
      )}

      {compteur && (
        <div className="compteur">
          {fps} images par seconde · {rendu ? rendu.slice(0, 42) : "rendu"}
        </div>
      )}

      {aide && (
        <div className="aide">
          <b>Raccourcis</b>
          <div>Espace : clore la phase</div>
          <div>N : phase suivante</div>
          <div>R : nouvelle séance</div>
          <div>M : masquer l'interface</div>
          <div>F : compteur d'images</div>
          <div>? : cette aide</div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function Debrief({ etat, fps }) {
  const fin = etat.fin;
  const d = etat.debrief;
  return (
    <div className="debrief">
      <style>{CSS}</style>
      <div className="debrief-voile" />
      <div className="debrief-gauche">
        <div className="debrief-sur">débrief · vos décisions face au réel</div>
        <h1 className="debrief-titre">{fin?.titre || "Fin de séance"}</h1>
        <div className="debrief-lignes">
          {d.lignes.map((l, i) => (
            <div
              key={i}
              className="debrief-ligne"
              onClick={() => window.dispatchEvent(new CustomEvent("feyzin:point", { detail: i }))}
            >
              <span className="debrief-heure">{l.heure}</span>
              <span
                className="debrief-verdict"
                style={{ color: l.ecart === "maitrise" ? "#9dc3aa" : l.ecart === "conforme" ? "#c0a05a" : l.ecart === "retard" ? "#c98b5a" : "#e08b7a" }}
              >
                {l.libelle}
              </span>
              <span className="debrief-sujet">{l.titre}</span>
            </div>
          ))}
        </div>
        <div className="debrief-bilan">
          <span className="gros">{fin?.morts ?? 0}</span><span className="unite">morts</span>
          <span className="sep" />
          <span className="gros">{fin?.blesses ?? 0}</span><span className="unite">blessés</span>
          <span className="sep" />
          <span className="unite">{fin?.tenues ?? 0}/{fin?.total ?? 0} barrières tenues</span>
        </div>
      </div>

      <div className="debrief-droite">
        <div className="debrief-panneau">
          <div className="debrief-panneau-titre">barrières</div>
          {(fin?.barrières || []).map((b) => (
            <div key={b.nom} className={b.tenu ? "barriere tenue" : "barriere"}>
              <i />{b.nom}
            </div>
          ))}
        </div>
        <div className="debrief-panneau">
          <div className="debrief-panneau-titre">ce que la salle a choisi</div>
          {d.lignes.map((l, i) => (
            <div key={i} className="debrief-choix">
              <b>{l.heure}</b> {l.choix.length > 132 ? l.choix.slice(0, 132) + "…" : l.choix}
              <em>{l.reel}</em>
            </div>
          ))}
        </div>
        <div className="debrief-note">cliquez une ligne pour replacer la caméra · {fps} images par seconde</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const CSS = `
  .voile-haut{position:fixed;left:0;right:0;top:0;height:200px;pointer-events:none;
    background:linear-gradient(180deg,rgba(3,5,8,.92) 0%,rgba(3,5,8,.6) 45%,rgba(3,5,8,0) 100%)}
  .voile-bas{position:fixed;left:0;right:0;bottom:0;height:220px;pointer-events:none;
    background:linear-gradient(0deg,rgba(3,5,8,.94) 0%,rgba(3,5,8,.55) 45%,rgba(3,5,8,0) 100%)}
  .progression{position:fixed;top:0;left:0;height:2px;background:#b4451f;box-shadow:0 0 12px #b4451f;transition:width .9s linear;pointer-events:none}

  .entete{position:fixed;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;
    padding:22px 30px 0;pointer-events:none;color:#ece5d8}
  .marque{font:600 11px/1 Helvetica,Arial;letter-spacing:.34em;text-transform:uppercase;color:#e9e2d5}
  .mention{margin-top:7px;font:9px/1 Helvetica;letter-spacing:.18em;text-transform:uppercase;color:#6d7885}

  .bloc-phase{text-align:center;flex:1}
  .phase-num{font:9px/1 Helvetica;letter-spacing:.26em;text-transform:uppercase;color:#c2622c}
  .phase-sur{color:#5d6773;margin-left:6px}
  .phase-titre{margin-top:7px;font:600 27px/1.05 Georgia,'Times New Roman',serif;color:#f4ecdf;text-shadow:0 2px 18px rgba(0,0,0,.8)}
  .attente-titre{color:#d9cfbd}
  .phase-heure{margin-top:5px;font:11px/1 Helvetica;letter-spacing:.14em;color:#8b95a2}

  .bloc-droite{text-align:right;min-width:230px}
  .compte-a-rebours{font:600 26px/1 Helvetica;letter-spacing:.04em;color:#e9e2d5;font-variant-numeric:tabular-nums}
  .compte-a-rebours.vif{color:#e0492a;text-shadow:0 0 18px rgba(224,73,42,.55)}
  .chrono-note{margin-top:4px;font:9px/1 Helvetica;letter-spacing:.14em;text-transform:uppercase;color:#6d7885}
  .etat-ligne{margin-top:7px;display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap}
  .marqueur{font:9px/1 Helvetica;letter-spacing:.12em;text-transform:uppercase;color:#7d8896}
  .marqueur.ok{color:#9dc3aa}
  .marqueur.alerte{color:#e08b7a}

  .capteurs{position:fixed;right:30px;top:96px;width:184px;pointer-events:none}
  .capteurs-titre{font:9px/1 Helvetica;letter-spacing:.2em;text-transform:uppercase;color:#5f6a78;margin-bottom:12px;text-align:right}
  .cap{margin-bottom:11px}
  .cap-haut{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
  .cap-label{font:9px/1 Helvetica;letter-spacing:.1em;text-transform:uppercase;color:#7f8a97}
  .cap-val{font:600 12px/1 Helvetica;color:#e9e2d5;font-variant-numeric:tabular-nums}
  .cap-val em{font-style:normal;font-size:9px;color:#78838f;margin-left:2px}
  .cap-val.alerte{color:#e0492a}
  .cap-rail{height:1px;background:rgba(255,255,255,.13);position:relative;overflow:hidden}
  .cap-jauge{position:absolute;left:0;top:0;height:100%;background:#b4451f;transition:width .6s linear}
  .cap-jauge.alerte{background:#e0492a;box-shadow:0 0 10px #e0492a}

  .invitation{position:fixed;left:30px;bottom:104px;pointer-events:none;padding:14px 0 0}
  .invitation:before{content:"";position:absolute;left:-30px;right:-40px;top:-24px;bottom:-70px;
    background:radial-gradient(70% 90% at 20% 60%,rgba(3,5,8,.86) 0%,rgba(3,5,8,.5) 55%,transparent 100%);z-index:-1}
  .invitation-corps{display:flex;align-items:flex-end;gap:26px}
  .invitation-qr{width:104px;height:104px;display:block;opacity:.95;border:1px solid rgba(244,236,223,.2);margin-left:4px}
  .invitation-titre{font:9.5px/1 Helvetica;letter-spacing:.22em;text-transform:uppercase;color:#7f8a97}
  .invitation-pin{margin:8px 0 6px;font:600 66px/1 Helvetica;letter-spacing:.14em;color:#f4ecdf;text-shadow:0 0 30px rgba(180,69,31,.35)}
  .invitation-url{font:10.5px/1 Helvetica;letter-spacing:.06em;color:#8b95a2}
  .invitation-url span{color:#616b78}

  .verdict{position:fixed;left:50%;top:46%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;animation:apparait .5s ease-out}
  .verdict-titre{font:9px/1 Helvetica;letter-spacing:.26em;text-transform:uppercase;color:#7f8a97}
  .verdict-lettre{margin:6px 0;font:600 78px/1 Georgia,serif;color:#f4ecdf;text-shadow:0 0 40px rgba(180,69,31,.6)}
  .verdict-detail{display:flex;gap:14px;justify-content:center;font:11px/1 Helvetica;letter-spacing:.1em;color:#6f7a87}
  .verdict-detail .retenu{color:#c2622c}

  .pied{position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;
    padding:0 30px 20px;pointer-events:none;gap:20px}
  .equipes-titre{font:9px/1 Helvetica;letter-spacing:.2em;text-transform:uppercase;color:#78838f;margin-bottom:8px}
  .equipes-titre span{color:#c2622c;margin-left:6px}
  .equipes-titre .points{display:inline-flex;gap:4px;margin-left:10px;vertical-align:middle}
  .equipes-titre .points i{width:5px;height:5px;border-radius:50%;background:#39424e;display:inline-block}
  .equipes-titre .points i.pris{background:#c2622c;box-shadow:0 0 8px #c2622c}
  .pied-gauche{flex:1}
  .equipes{text-align:right}
  .equipes-liste{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
  .poste{display:flex;align-items:center;gap:7px;font:10.5px/1 Helvetica;color:#7d8896}
  .poste i{width:4px;height:4px;border-radius:50%;background:#39424e;display:inline-block}
  .poste.pris{color:#d7d1c4}
  .poste.pris i{background:#c2622c;box-shadow:0 0 8px #c2622c}
  .poste b{margin-left:6px;font-weight:600;color:#f0e9dc}

  .salle-vote{text-align:center}
  .salle-vote-titre{font:9px/1 Helvetica;letter-spacing:.2em;text-transform:uppercase;color:#5f6a78;margin-bottom:8px}
  .salle-vote-lignes{display:flex;gap:18px;justify-content:center}
  .salle-vote-lignes span{position:relative;display:block;width:64px;font:9px/1 Helvetica;letter-spacing:.12em;color:#7f8a97;padding-bottom:6px}
  .salle-vote-lignes b{display:block;margin-top:3px;font:600 16px/1 Helvetica;color:#e9e2d5}
  .salle-vote-lignes i{position:absolute;left:0;bottom:0;height:1px;background:#b4451f;transition:width .4s ease}

  .commandes{display:flex;gap:22px;align-items:center;pointer-events:auto}
  .cmd{background:rgba(8,11,16,.55);border:1px solid rgba(255,255,255,.18);padding:9px 13px;cursor:pointer;
    font:600 9.5px/1 Helvetica;letter-spacing:.18em;text-transform:uppercase;color:#cfc8ba}
  .cmd:hover{color:#f4ecdf;border-color:#b4451f}
  .cmd.fort{background:#b4451f;border-color:#b4451f;color:#120b07}
  .cmd.fort:hover{background:#c9561f;border-color:#c9561f;color:#fff}
  .cmd.sourdine{opacity:.72}

  .carte{position:fixed;inset:0;display:grid;place-items:center;pointer-events:none;
    background:radial-gradient(60% 50% at 50% 50%,rgba(3,5,8,.72) 0%,rgba(3,5,8,.2) 70%,transparent 100%);
    animation:carte 4.2s ease-in-out forwards;text-align:center}
  .carte-num{font:9.5px/1 Helvetica;letter-spacing:.34em;text-transform:uppercase;color:#c2622c}
  .carte-titre{margin:14px 0 12px;font:600 52px/1.05 Georgia,serif;color:#f4ecdf;text-shadow:0 4px 40px rgba(0,0,0,.9)}
  .carte-heure{font:11px/1 Helvetica;letter-spacing:.24em;color:#8b95a2}
  .carte:before,.carte:after{content:"";position:absolute;left:calc(50% - 90px);width:180px;height:1px;background:rgba(194,98,44,.55)}
  .carte:before{top:calc(50% - 78px)}
  .carte:after{top:calc(50% + 78px)}

  .compteur{position:fixed;right:30px;bottom:66px;font:600 10px/1 Helvetica;color:#9dc3aa;letter-spacing:.08em}
  .aide{position:fixed;right:30px;bottom:86px;width:210px;padding:12px 14px;border:1px solid rgba(255,255,255,.12);
    background:rgba(6,9,13,.9);font:11px/1.65 Helvetica;color:#c9c2b4;pointer-events:auto}
  .aide b{display:block;margin-bottom:6px;color:#f0e9dc;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  .discret{position:fixed;left:30px;bottom:22px;font:9.5px/1 Helvetica;letter-spacing:.2em;text-transform:uppercase;color:#5b6472}

  /* débrief */
  .debrief{position:fixed;inset:0;pointer-events:none}
  .debrief-voile{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,5,8,.96) 0%,rgba(3,5,8,.88) 46%,rgba(3,5,8,.2) 78%,transparent 100%)}
  .debrief-gauche{position:absolute;left:0;top:0;bottom:0;width:56%;padding:34px 0 30px 34px;box-sizing:border-box;display:flex;flex-direction:column}
  .debrief-sur{font:9.5px/1 Helvetica;letter-spacing:.28em;text-transform:uppercase;color:#c2622c}
  .debrief-titre{margin:12px 0 18px;font:600 42px/1.02 Georgia,serif;color:#f4ecdf}
  .debrief-lignes{display:flex;flex-direction:column}
  .debrief-ligne{display:grid;grid-template-columns:58px 158px 1fr;gap:12px;align-items:baseline;padding:7px 0;
    border-bottom:1px solid rgba(255,255,255,.07);cursor:pointer;pointer-events:auto}
  .debrief-ligne:hover{background:rgba(194,98,44,.08)}
  .debrief-heure{font:11.5px/1 Helvetica;color:#8b95a2;font-variant-numeric:tabular-nums}
  .debrief-verdict{font:9px/1 Helvetica;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
  .debrief-sujet{font:12.5px/1.3 Helvetica;color:#ded7c9}
  .debrief-bilan{margin-top:auto;padding-top:18px;display:flex;align-items:baseline;gap:8px;color:#e6dfd1}
  .debrief-bilan .gros{font:600 26px/1 Helvetica;color:#f4ecdf;font-variant-numeric:tabular-nums}
  .debrief-bilan .unite{font:11px/1 Helvetica;color:#b8b1a3;letter-spacing:.04em}
  .debrief-bilan .sep{width:1px;height:16px;background:rgba(255,255,255,.16);margin:0 8px}
  .debrief-droite{position:absolute;right:0;top:0;bottom:0;width:38%;padding:40px 30px 44px 0;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;justify-content:center}
  .debrief-panneau{padding:12px 14px;border:1px solid rgba(255,255,255,.1);background:rgba(6,9,13,.62);backdrop-filter:blur(3px)}
  .debrief-panneau-titre{font:9px/1 Helvetica;letter-spacing:.18em;text-transform:uppercase;color:#6f7b8a;margin-bottom:8px}
  .barriere{display:flex;align-items:center;gap:8px;font:11px/1.5 Helvetica;color:#e08b7a}
  .barriere i{width:5px;height:5px;border-radius:50%;background:#e08b7a;display:inline-block}
  .barriere.tenue{color:#a7d3b5}
  .barriere.tenue i{background:#a7d3b5}
  .debrief-choix{font:10.5px/1.45 Helvetica;color:#9aa5b3;margin-bottom:7px}
  .debrief-choix b{color:#d7d1c4;margin-right:4px}
  .debrief-choix em{display:block;font-style:italic;color:#8b95a2}
  .debrief-note{font:9px/1 Helvetica;letter-spacing:.1em;color:#7b8694}

  @keyframes carte{0%{opacity:0}12%{opacity:1}72%{opacity:1}100%{opacity:0}}
  @keyframes apparait{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}
`;
