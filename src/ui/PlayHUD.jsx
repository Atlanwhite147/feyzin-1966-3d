import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Décisions en HUD translucide sur la scène 3D, chronomètre de 45 s. */
export default function PlayHUD({ role, etat, scenario, voter }) {
  const [choix, setChoix] = useState(null);
  const phase = (etat?.phase ?? 1) - 1;
  const etape = scenario.etapes[Math.min(Math.max(phase, 0), scenario.etapes.length - 1)];
  const decision = etat?.etat === "decision";
  const chrono = etat?.chrono ?? 0;

  useEffect(() => setChoix(null), [etat?.phase, etat?.etat]);

  const capteurs = etat?.capteurs || {};
  const lignes = [];

  if (role === "OPERATEUR_PURGE") {
    lignes.push(["Givre sur la purge", (capteurs.valve_icing_level ?? 0) + " %"]);
    lignes.push(["Jauge de pression", (capteurs.pression ?? "—") + " bar"]);
    lignes.push(["Paroi de la sphère", (capteurs.sphere_443_metal_temp ?? 20) + " °C"]);
    lignes.push(["Écoulement", capteurs.fuite_active ? "continu" : "arrêté"]);
  } else if (role === "CHEF_DE_QUART") {
    lignes.push(["Paroi 443", (capteurs.sphere_443_metal_temp ?? 20) + " °C"]);
    lignes.push(["Réserve eau", (capteurs.water_reserve ?? 100) + " %"]);
    lignes.push(["Nappe vers l'A7", (capteurs.cloud_density_a7 ?? 0) + " %"]);
    lignes.push(["Incendie", capteurs.incendie ? "déclaré" : "non"]);
  } else if (role === "POMPIERS_VIENNE_LYON") {
    lignes.push(["Chaleur ressentie", (capteurs.sphere_443_metal_temp ?? 20) + " °C"]);
    lignes.push(["Réserve eau", (capteurs.water_reserve ?? 100) + " %"]);
    lignes.push(["Engagement", capteurs.firefighters_deployed ? "lances en action" : "en attente"]);
    lignes.push(["Rupture", capteurs.bleve_triggered ? "une sphère a cédé" : "aucune"]);
  } else {
    lignes.push(["Densité sur l'A7", (capteurs.cloud_density_a7 ?? 0) + " %"]);
    lignes.push(["Vent", (capteurs.wind_vector || [1, 0]).map((v) => v.toFixed(2)).join(" · ")]);
    lignes.push(["Circulation", capteurs.a7_traffic_blocked ? "coupée" : "ouverte"]);
  }

  return (
    <>
      <div style={{ position: "fixed", left: 14, top: 14, right: 14, display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
        <div>
          <div style={{ font: "9px Helvetica", letterSpacing: ".22em", textTransform: "uppercase", color: "#7f8b9a" }}>{role.replace(/_/g, " ")}</div>
          <div style={{ font: "600 13px Helvetica", color: "#e9e4d9", marginTop: 3 }}>
            {etat?.etat === "attente" ? "attente du départ" : "phase " + etat?.phase + " · " + etat?.titre}
          </div>
        </div>
        {decision && (
          <div style={{ font: "600 20px Helvetica", color: chrono <= 10 ? "#e0492a" : "#e9e4d9" }}>{chrono}s</div>
        )}
      </div>

      <div style={{ position: "fixed", left: 14, bottom: 14, background: "rgba(8,10,14,.66)", border: "1px solid #222834", padding: "9px 11px", backdropFilter: "blur(6px)" }}>
        {lignes.map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 12, justifyContent: "space-between", font: "10.5px Helvetica", color: "#9aa5b3", marginBottom: 3 }}>
            <span>{l}</span>
            <span style={{ color: "#e9e4d9" }}>{v}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {decision && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ position: "fixed", left: 12, right: 12, bottom: 12, maxWidth: 520, margin: "0 auto" }}
          >
            <div style={{ background: "rgba(10,12,17,.82)", border: "1px solid #2b3340", padding: 12, backdropFilter: "blur(8px)" }}>
              <div style={{ font: "600 12.5px Helvetica", color: "#f0e9dc", marginBottom: 8 }}>{etape.question}</div>
              <div style={{ display: "grid", gap: 7 }}>
                {etape.options.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setChoix(i); voter(i); }}
                    style={{
                      textAlign: "left", padding: "10px 11px", font: "12px Helvetica", lineHeight: 1.35,
                      background: choix === i ? "rgba(194,98,44,.22)" : "rgba(255,255,255,.03)",
                      border: "1px solid " + (choix === i ? "#c2622c" : "#2b3340"),
                      color: choix === i ? "#ffd9b8" : "#cdd4dd", cursor: "pointer"
                    }}
                  >
                    <b style={{ marginRight: 7 }}>{"ABC"[i]}</b>{t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
