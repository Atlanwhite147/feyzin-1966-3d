import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { rejoindrePlay, voter } from "./net/net.js";
import { useNet } from "./net/useNet.js";
import RoleScene from "./scene/play/RoleScene.jsx";
import PlayHUD from "./ui/PlayHUD.jsx";
import { SCENARIO } from "./data/scenarioClient.js";

const ROLES = [
  { id: "OPERATEUR_PURGE", nom: "Opérateur purge", desc: "Au pied de la sphère 443, la double vanne et le givre." },
  { id: "CHEF_DE_QUART", nom: "Chef de quart", desc: "Salle de contrôle, maquette du site, radio." },
  { id: "POMPIERS_VIENNE_LYON", nom: "Pompiers", desc: "Face au parc des sphères, lances à eau." },
  { id: "GENDARMERIE_A7", nom: "Gendarmerie", desc: "Bord de l'A7, le nuage monte vers les voies." }
];

export default function PlayApp() {
  const publicEtat = useNet((e) => e.public);
  const role = useNet((e) => e.role);
  const erreur = useNet((e) => e.erreur);
  const [pin, setPin] = useState(() => new URLSearchParams(location.search).get("pin") || "");
  const [nom, setNom] = useState(() => localStorage.getItem("feyzin3d.nom") || "");
  const [choisi, setChoisi] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);

  async function entrer(roleId) {
    setEnvoi(true);
    const r = await rejoindrePlay(pin, nom, roleId);
    setEnvoi(false);
    if (!r?.ok) setMessage(r?.erreur || "Impossible d'entrer");
    else localStorage.setItem("feyzin3d.nom", nom);
  }

  if (!role) {
    return (
      <div style={page}>
        <div style={{ maxWidth: 520, width: "100%", padding: 22 }}>
          <div style={{ font: "10px Helvetica", letterSpacing: ".3em", textTransform: "uppercase", color: "#6f7b8a" }}>Feyzin 1966</div>
          <h1 style={{ font: "600 30px/1.1 Georgia, serif", margin: "10px 0 4px" }}>Votre poste</h1>
          <p style={{ color: "#9aa5b3", fontSize: 14, lineHeight: 1.5 }}>
            Choisissez un rôle libre. Chaque poste ne voit qu'une partie du site : il faudra se parler.
          </p>

          <label style={label}>Code de la salle</label>
          <input style={champ} inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" />

          <label style={label}>Votre prénom</label>
          <input style={champ} maxLength={20} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Claire" />

          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {ROLES.map((r) => {
              const pris = (publicEtat?.joueurs || []).some((j) => j.role === r.id);
              return (
                <button
                  key={r.id}
                  disabled={pris || envoi || !pin || !nom}
                  onClick={() => entrer(r.id)}
                  style={{
                    textAlign: "left", padding: "12px 14px", background: pris ? "#0d1015" : "#12161d",
                    border: "1px solid " + (pris ? "#1c222b" : "#2c3542"), color: pris ? "#4d5765" : "#e9e4d9",
                    cursor: pris ? "default" : "pointer"
                  }}
                >
                  <div style={{ font: "600 13px Helvetica" }}>{r.nom}{pris ? " · pris" : ""}</div>
                  <div style={{ font: "11.5px Helvetica", color: pris ? "#404a56" : "#8f9aa8", marginTop: 3 }}>{r.desc}</div>
                </button>
              );
            })}
          </div>
          {(message || erreur) && <p style={{ color: "#e08b7a", fontSize: 12.5 }}>{message || erreur}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.7, 6], fov: 62, near: 0.1, far: 400 }} gl={{ antialias: true }}>
        <RoleScene role={role} etat={publicEtat} />
      </Canvas>
      <PlayHUD role={role} etat={publicEtat} scenario={SCENARIO} voter={voter} />
    </div>
  );
}

const page = { display: "grid", placeItems: "center", minHeight: "100%", background: "radial-gradient(120% 90% at 50% 0%, #10141c 0%, #05070a 60%)" };
const label = { display: "block", font: "9.5px Helvetica", letterSpacing: ".16em", textTransform: "uppercase", color: "#6f7b8a", margin: "14px 0 5px" };
const champ = { width: "100%", boxSizing: "border-box", padding: "11px 12px", background: "#0b0e13", border: "1px solid #2c3542", color: "#e9e4d9", font: "16px Helvetica", outline: "none" };
