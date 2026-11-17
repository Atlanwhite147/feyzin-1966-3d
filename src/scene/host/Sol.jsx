import React, { useMemo } from "react";
import * as THREE from "three";

/* Sol du site : béton et enrobé, plaques de givre, flaques gelées.
   La texture est dessinée une fois sur un canvas, aucune ressource externe. */
function textureSol() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#1a1d22";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const v = 18 + Math.random() * 32;
    g.fillStyle = `rgba(${v},${v + 2},${v + 5},${0.25 + Math.random() * 0.35})`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 70;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(205,222,232,0.16)");
    grad.addColorStop(1, "rgba(205,222,232,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  t.anisotropy = 4;
  return t;
}

export default function Sol() {
  const carte = useMemo(textureSol, []);
  /* Le site est un plateau 1,50 m au-dessus de l'A7 : trois surfaces, pas une.
     Plateau, talus, contrebas routier. */
  return (
    <group>
      {/* plateau du site */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 30]} receiveShadow>
        <planeGeometry args={[520, 104]} />
        <meshStandardMaterial map={carte} color="#464c55" roughness={0.94} metalness={0.05} />
      </mesh>

      {/* talus vers l'autoroute */}
      <mesh rotation={[-Math.PI / 2 + Math.atan(1.5 / 18), 0, 0]} position={[0, -0.76, -30]} receiveShadow>
        <planeGeometry args={[520, 18.1]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.97} />
      </mesh>

      {/* contrebas, de l'autre côté de la chaussée */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, -96]} receiveShadow>
        <planeGeometry args={[520, 100]} />
        <meshStandardMaterial color="#171b20" roughness={0.98} />
      </mesh>
    </group>
  );
}
