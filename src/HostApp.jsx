import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { creerSalle, rejoindreHost } from "./net/net.js";
import { lireEtat } from "./net/useNet.js";
import { useNet } from "./net/useNet.js";
import HostScene from "./scene/host/HostScene.jsx";
import HostHUD from "./ui/HostHUD.jsx";

export default function HostApp() {
  const publicEtat = useNet((e) => e.public);
  const connecte = useNet((e) => e.connecte);
  const [pin, setPin] = useState(null);
  const [pret, setPret] = useState(false);

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

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Canvas
        dpr={[1, 1.75]}
        shadows
        camera={{ position: [46, 22, 58], fov: 45, near: 0.5, far: 600 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = 4;
          gl.toneMappingExposure = 1.05;
          setPret(true);
        }}
      >
        <HostScene etat={publicEtat} lecture={lireEtat} />
      </Canvas>
      <HostHUD pin={pin} etat={publicEtat} connecte={connecte} />
    </div>
  );
}
