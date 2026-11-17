import React, { useEffect, useState } from "react";
import { clore, avancer, reremplir } from "../net/net.js";

const ROLE_LABEL = {
  OPERATEUR_PURGE: "Opérateur purge",
  CHEF_DE_QUART: "Chef de quart",
  POMPIERS_VIENNE_LYON: "Pompiers",
  GENDARMERIE_A7: "Gendarmerie"
};

function Jauge({ label, valeur, max, unite, alerte }) {
  const pct = Math.max(0, Math.min(100, (valeur / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ width: 108, fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#8f9aa8" }}>{label}</span>
      <span style={{ flex: 1, height: 7, background: "#1b1f27", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: pct + "%", background: alerte ? "#e0492a" : "#c2622c", transition: "width .35s linear" }} />
      </span>
      <span style={{ width: 84, textAlign: "right", fontSize: 11, color: "#e9e4d9", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(valeur)} {unite}
      </span>
    </div>
  );
}

export default function HostHUD({ pin, etat, connecte, son, onSon, rendu }) {
  const [aide, setAide] = useState(false);
  const [discret, setDiscret] = useState(false);
  const [compteur, setCompteur] = useState(false);
  const c = etat?.capteurs;
  const chrono = etat?.chrono ?? 0;

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

  const [fps, setFps] = useState(0);
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

  if (etat?.etat === "debrief" && etat.debrief) {
    return <Debrief etat={etat} fps={fps} />;
  }

  if (discret) {
    return (
      <div style={{ position: "fixed", left: 14, bottom: 12, font: "10px Helvetica", letterSpacing: ".2em", color: "#5b6472" }}>
        panneau masqué · M pour revenir
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "fixed", left: 22, top: 18, pointerEvents: "none" }}>
        <div style={{ font: "10px/1 Helvetica", letterSpacing: ".28em", textTransform: "uppercase", color: "#6f7b8a" }}>Feyzin 1966</div>
        <div style={{ marginTop: 6, font: "600 30px/1 Helvetica", letterSpacing: ".16em", color: "#f0e9dc" }}>{pin || "····"}</div>
        <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ font: "10px Helvetica", letterSpacing: ".14em", textTransform: "uppercase", color: "#c2622c" }}>
            {etat?.etat === "attente" ? "salle en attente" : "phase " + etat?.phase + " · " + etat?.titre}
          </span>
          {etat?.etat === "decision" && (
            <span style={{ font: "600 11px Helvetica", color: chrono <= 10 ? "#e0492a" : "#e9e4d9" }}>{chrono}s</span>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", right: 22, top: 18, width: 300 }}>
        <div style={{ background: "rgba(8,10,14,.72)", border: "1px solid #222834", padding: "10px 12px" }}>
          <div style={{ font: "9px Helvetica", letterSpacing: ".16em", textTransform: "uppercase", color: "#6f7b8a", marginBottom: 7 }}>capteurs du site</div>
          <Jauge label="Paroi 443" valeur={c?.sphere_443_metal_temp ?? 20} max={650} unite="°C" alerte={(c?.sphere_443_metal_temp ?? 0) > 380} />
          <Jauge label="Givre purge" valeur={c?.valve_icing_level ?? 0} max={100} unite="%" alerte={(c?.valve_icing_level ?? 0) > 70} />
          <Jauge label="Nappe vers A7" valeur={c?.cloud_density_a7 ?? 0} max={100} unite="%" alerte={(c?.cloud_density_a7 ?? 0) > 45} />
          <Jauge label="Réserve eau" valeur={c?.water_reserve ?? 100} max={100} unite="%" alerte={(c?.water_reserve ?? 100) < 30} />
          <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
            <span style={{ font: "9px Helvetica", letterSpacing: ".08em", textTransform: "uppercase", padding: "3px 6px", border: "1px solid " + (c?.a7_traffic_blocked ? "#4d7a5c" : "#7a3a2c"), color: c?.a7_traffic_blocked ? "#a7d3b5" : "#e08b7a" }}>
              A7 {c?.a7_traffic_blocked ? "coupée" : "ouverte"}
            </span>
            <span style={{ font: "9px Helvetica", letterSpacing: ".08em", textTransform: "uppercase", padding: "3px 6px", border: "1px solid " + (c?.bleve_triggered ? "#7a3a2c" : "#2b3340"), color: c?.bleve_triggered ? "#e08b7a" : "#8f9aa8" }}>
              {c?.bleve_triggered ? "rupture" : "intègre"}
            </span>
            <span style={{ font: "9px Helvetica", letterSpacing: ".08em", textTransform: "uppercase", padding: "3px 6px", border: "1px solid #2b3340", color: "#8f9aa8" }}>
              secours {c?.secours_distance ?? 0} m
            </span>
          </div>
        </div>

        <div style={{ marginTop: 10, background: "rgba(8,10,14,.72)", border: "1px solid #222834", padding: "10px 12px" }}>
          <div style={{ font: "9px Helvetica", letterSpacing: ".16em", textTransform: "uppercase", color: "#6f7b8a", marginBottom: 6 }}>équipes</div>
          {["OPERATEUR_PURGE", "CHEF_DE_QUART", "POMPIERS_VIENNE_LYON", "GENDARMERIE_A7"].map((role) => {
            const j = (etat?.joueurs || []).find((x) => x.role === role);
            return (
              <div key={role} style={{ display: "flex", justifyContent: "space-between", font: "11px Helvetica", color: j ? "#e9e4d9" : "#55606e", marginBottom: 3 }}>
                <span>{ROLE_LABEL[role]}</span>
                <span>{j ? j.nom : "libre"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "fixed", left: 22, bottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button style={bouton} onClick={clore}>Clore la phase</button>
        <button style={boutonGhost} onClick={avancer}>Phase suivante</button>
        <button style={{ ...boutonGhost, borderColor: son ? "#4d7a5c" : "#2b3340", color: son ? "#a7d3b5" : "#c9c2b4" }} onClick={onSon}>
          {son ? "son actif" : "activer le son"}
        </button>
        <span style={{ font: "9.5px Helvetica", letterSpacing: ".1em", color: "#5f6a78" }}>espace · N · M · ?</span>
        {!connecte && <span style={{ font: "10px Helvetica", color: "#e0492a" }}>hors ligne</span>}
      </div>

      {etat?.etat === "decision" && (
        <div style={{ position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", gap: 10 }}>
          {["A", "B", "C"].map((l, i) => {
            const n = Object.values(etat.votes || {}).filter((v) => v === i).length;
            const actif = n > 0;
            return (
              <div key={l} style={{ minWidth: 74, textAlign: "center", padding: "7px 12px", border: "1px solid " + (actif ? "#c2622c" : "#2b3340"), background: "rgba(8,10,14,.8)", color: actif ? "#f0e9dc" : "#8f9aa8", font: "600 12px Helvetica" }}>
                {l} · {n}
              </div>
            );
          })}
        </div>
      )}

      {compteur && (
        <div style={{ position: "fixed", right: 22, bottom: 16, font: "600 11px Helvetica", color: fps < 45 ? "#e0492a" : "#a7d3b5", background: "rgba(8,10,14,.8)", padding: "5px 9px", border: "1px solid #222834" }}>
          {fps} images par seconde · {rendu ? rendu.slice(0, 46) : "rendu"}
        </div>
      )}

      {aide && (
        <div style={{ position: "fixed", right: 22, bottom: 16, width: 280, background: "rgba(8,10,14,.92)", border: "1px solid #222834", padding: 12, font: "11px Helvetica", color: "#c9c2b4", lineHeight: 1.6 }}>
          <b style={{ color: "#f0e9dc" }}>Raccourcis</b>
          <div>Espace : clore la phase</div>
          <div>N : phase suivante</div>
          <div>R : nouvelle séance</div>
          <div>M : masquer le panneau</div>
          <div>F : compteur d'images</div>
          <div>? : cette aide</div>
        </div>
      )}
    </>
  );
}

const bouton = {
  font: "600 10px Helvetica", letterSpacing: ".12em", textTransform: "uppercase",
  padding: "9px 14px", background: "#c2622c", color: "#120c08", border: "none", cursor: "pointer"
};
const boutonGhost = {
  font: "600 10px Helvetica", letterSpacing: ".12em", textTransform: "uppercase",
  padding: "9px 14px", background: "transparent", color: "#c9c2b4", border: "1px solid #2b3340", cursor: "pointer"
};

function Debrief({ etat, fps }) {
  const fin = etat.fin;
  const d = etat.debrief;
  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 0, background: "linear-gradient(90deg, rgba(4,6,9,.975) 0%, rgba(4,6,9,.93) 52%, rgba(4,6,9,.55) 100%)", pointerEvents: "none" }}>
      <div style={{ padding: "34px 30px", display: "flex", flexDirection: "column" }}>
        <div style={{ font: "9.5px Helvetica", letterSpacing: ".26em", textTransform: "uppercase", color: "#c2622c" }}>débrief · vos décisions face au réel</div>
        <h1 style={{ font: "600 40px/1.05 Georgia, serif", margin: "10px 0 14px", color: "#f4ecdf" }}>{fin?.titre || "Fin de séance"}</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {d.lignes.map((l, i) => (
            <div key={i} onClick={() => window.dispatchEvent(new CustomEvent("feyzin:point", { detail: i }))} style={{ display: "grid", gridTemplateColumns: "64px 150px 1fr", gap: 10, borderBottom: "1px dotted #232a35", padding: "5px 0", font: "11.5px Helvetica", alignItems: "baseline", cursor: "pointer", pointerEvents: "auto" }}>
              <span style={{ color: "#7f8b9a", fontVariantNumeric: "tabular-nums" }}>{l.heure}</span>
              <span style={{ fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap", color: l.ecart === "maitrise" ? "#9dc3aa" : l.ecart === "conforme" ? "#c0a05a" : l.ecart === "retard" ? "#c98b5a" : "#e08b7a" }}>{l.libelle}</span>
              <span style={{ color: "#d7d1c4" }}>{l.titre}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 16, font: "12px Helvetica", color: "#c9c2b4" }}>
          <span style={{ fontSize: 24, color: "#f4ecdf", marginRight: 8 }}>{fin?.morts ?? 0}</span>morts
          <span style={{ margin: "0 10px", color: "#3a424f" }}>|</span>
          <span style={{ fontSize: 24, color: "#f4ecdf", marginRight: 8 }}>{fin?.blesses ?? 0}</span>blessés
          <span style={{ margin: "0 10px", color: "#3a424f" }}>|</span>
          {fin?.tenues ?? 0}/{fin?.total ?? 0} barrières tenues
        </div>
      </div>
      <div style={{ padding: "34px 26px", display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
        <div style={{ border: "1px solid #2b3340", background: "rgba(10,13,18,.92)", padding: "12px 14px" }}>
          <div style={{ font: "9px Helvetica", letterSpacing: ".14em", textTransform: "uppercase", color: "#6f7b8a", marginBottom: 6 }}>barrières</div>
          {(fin?.barrières || []).map((b) => (
            <div key={b.nom} style={{ font: "11.5px Helvetica", color: b.tenu ? "#a7d3b5" : "#e08b7a", marginBottom: 3 }}>
              {b.tenu ? "tenue" : "rompue"} · {b.nom}
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid #2b3340", background: "rgba(10,13,18,.92)", padding: "12px 14px" }}>
          <div style={{ font: "9px Helvetica", letterSpacing: ".14em", textTransform: "uppercase", color: "#6f7b8a", marginBottom: 6 }}>les décisions de la salle</div>
          {d.lignes.map((l, i) => (
            <div key={i} style={{ font: "10.5px Helvetica", color: "#9aa5b3", marginBottom: 5, lineHeight: 1.35 }}>
              <b style={{ color: "#d7d1c4" }}>{l.heure}</b> {l.choix.slice(0, 88)}
              <div style={{ color: l.ecart === "conforme" ? "#8f9aa8" : "#7f8b9a", fontStyle: "italic", marginTop: 1 }}>{l.reel}</div>
            </div>
          ))}
        </div>
        <div style={{ font: "9px Helvetica", letterSpacing: ".1em", color: "#5f6a78" }}>
          cliquez une ligne pour replacer la caméra · {fps} images par seconde
        </div>
      </div>
    </div>
  );
}
