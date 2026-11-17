import React, { useMemo } from "react";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import Refinery from "./Refinery.jsx";
import Autoroute from "./Autoroute.jsx";
import Nappe from "./Nappe.jsx";
import Torchere from "./Torchere.jsx";
import Cameras from "./Cameras.jsx";
import Lighting from "./Lighting.jsx";
import Flare from "./Flare.jsx";
import Sol from "./Sol.jsx";

/* Scène principale de l'écran de salle. Tout est animé en continu :
   voitures, manche à air, flammes, nappe, caméra. */
export default function HostScene({ etat, qualite = "haute" }) {
  const capteurs = useMemo(
    () =>
      etat?.capteurs || {
        cloud_density_a7: 0,
        sphere_443_metal_temp: 20,
        valve_icing_level: 0,
        water_reserve: 100,
        bleve_triggered: false,
        a7_traffic_blocked: false,
        wind_vector: [1, 0.35],
        incendie: false,
        nappe_masse: 0,
        nappe_rayon: 0
      },
    [etat]
  );

  return (
    <>
      <color attach="background" args={["#04060b"]} />

      <Lighting etat={etat} />
      <Sol />
      <Refinery etat={etat} />
      <Autoroute etat={etat} />
      <Nappe capteurs={capteurs} />
      <Torchere capteurs={capteurs} activate={capteurs.bleve_triggered} />
      <Flare />

      <Cameras etat={etat} />

      {qualite === "haute" && (
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0005, 0.0008]} radialModulation modulationOffset={0.4} />
        <Vignette eskil={false} offset={0.24} darkness={0.82} />
        <Noise opacity={0.038} premultiply blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
      )}
    </>
  );
}
