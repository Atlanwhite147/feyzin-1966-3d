import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import Refinery from "./Refinery.jsx";
import Autoroute from "./Autoroute.jsx";
import Nappe from "./Nappe.jsx";
import Torchere from "./Torchere.jsx";
import Cameras from "./Cameras.jsx";

/* Scène principale de l'écran de salle. Tout est animé en continu :
   voitures, manche à air, flammes, nappe, caméra. */
export default function HostScene({ etat, lecture }) {
  const capteurs = etat?.capteurs || {
    cloud_density_a7: 0,
    sphere_443_metal_temp: 20,
    valvle_icing_level: 0,
    valve_icing_level: 0,
    water_reserve: 100,
    bleve_triggered: false,
    a7_traffic_blocked: false,
    wind_vector: [1, 0.35]
  };

  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fogExp2 attach="fog" args={["#070b12", 0.0075]} />

      <Stars radius={260} depth={60} count={1400} factor={4} saturation={0} fade speed={0.4} />

      <ambientLight intensity={0.22} color="#3a4a66" />
      <hemisphereLight args={["#2a3a55", "#050505", 0.5]} />
      <directionalLight
        position={[-60, 70, 40]}
        intensity={0.35}
        color="#7f9ac4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      <Refinery etat={etat} />
      <Autoroute etat={etat} />
      <Nappe capteurs={capteurs} />
      <Torchere capteurs={capteurs} activate={capteurs.bleve_triggered} />

      <Cameras etat={etat} />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom intensity={1.15} luminanceThreshold={0.35} luminanceSmoothing={0.22} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.86} />
        <Noise opacity={0.045} premultiply blendFunction={2} />
      </EffectComposer>
    </>
  );
}
