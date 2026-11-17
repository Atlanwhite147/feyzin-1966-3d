import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { creerSalle, rejoindreHost } from "./net/net.js";
import { lireEtat } from "./net/useNet.js";
import { useNet } from "./net/useNet.js";
import HostScene from "./scene/host/HostScene.jsx";
import HostHUD from "./ui/HostHUD.jsx";
import { creerAudio } from "./audio/Engine.js";

export default function HostApp() {
  const publicEtat = useNet((e) => e.public);
  const connecte = useNet((e) => e.connecte);
  const [pin, setPin] = useState(null);
  const [pret, setPret] = useState(false);
  const audio = useRef(null);
  const [son, setSon] = useState(false);
  const [dprMax, setDprMax] = useState(1.75);
  const [rendu, setRendu] = useState("");
  /* qualité réduite : ?lite=1, ou appareil modeste. Sert aussi aux tests headless. */
  const lite = new URLSearchParams(window.location.search).get("lite") === "1";

  useEffect(() => {
    const url = new URL(window.location.href);
    const demande = url.searchParams.get("pin");
    (async () => {
      if (demande) {
        const r = await rejoindreHost(demande);
        if (r?.ok) return setPin(r.pin);
      }
      const r = await creerSalle();
      if (r?.ok) setPin(r.pin);
    })();
  }, []);

  useEffect(() => {
    /* si la machine peine, on baisse la résolution de rendu plutôt que de sacrifier l'image */
    let images = 0;
    let dernier = performance.now();
    let bas = 0;
    let stop = false;
    const boucle = () => {
      if (stop) return;
      images += 1;
      const t = performance.now();
      if (t - dernier >= 2000) {
        const fps = (images * 1000) / (t - dernier);
        images = 0;
        dernier = t;
        if (fps < 40 && dprMax > 1.05) {
          bas += 1;
          if (bas >= 2) { setDprMax((v) => Math.max(1, v - 0.35)); bas = 0; }
        } else bas = 0;
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
    return () => { stop = true; };
  }, [dprMax]);

  useEffect(() => {
    if (!audio.current) audio.current = creerAudio();
    audio.current.mettreAJour(publicEtat?.capteurs || {}, publicEtat?.phase || 0);
  }, [publicEtat]);

  const basculerSon = () => {
    if (!audio.current) audio.current = creerAudio();
    if (!son) {
      audio.current.demarrer();
      setSon(true);
    } else {
      audio.current.coupure();
      setSon(false);
    }
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Canvas
        dpr={lite ? 0.7 : [1, dprMax]}
        shadows={!lite}
        camera={{ position: [46, 22, 58], fov: 45, near: 0.5, far: 600 }}
        gl={{ antialias: !lite, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = 4;
          gl.toneMappingExposure = 1.15;
          setPret(true);
          const infos = gl.getContext().getExtension("WEBGL_debug_renderer_info");
          const nom = infos ? gl.getContext().getParameter(infos.UNMASKED_RENDERER_WEBGL) : "rendu inconnu";
          setRendu(String(nom));
          window.__rendu = String(nom);
        }}
      >
        <HostScene etat={publicEtat} qualite={lite ? "lite" : "haute"} />
      </Canvas>
      <HostHUD pin={pin} etat={publicEtat} connecte={connecte} son={son} onSon={basculerSon} rendu={rendu} />
    </div>
  );
}
