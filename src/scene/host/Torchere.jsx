import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Flamme sous la sphère 443 puis boule de feu du BLEVE.
   Intensité et vacillement pilotés par l'état, jamais figés. */
export default function Torchere({ capteurs, activate }) {
  const flamme = useRef();
  const halo = useRef();
  const lumiere = useRef();
  const boule = useRef();
  const chaleur = (capteurs?.sphere_443_metal_temp ?? 20) / 650;
  const feu = !!capteurs?.incendie || activate;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const vacille = 0.75 + Math.sin(t * 13.1) * 0.12 + Math.sin(t * 7.3) * 0.08;

    if (flamme.current) {
      const h = feu ? 4.5 + chaleur * 5 + Math.sin(t * 5) * 0.6 : 0.6;
      flamme.current.scale.set(1 + Math.sin(t * 9) * 0.06, h, 1 + Math.cos(t * 11) * 0.06);
      flamme.current.visible = feu || chaleur > 0.05;
      flamme.current.material.opacity = feu ? 0.85 : 0.25;
    }
    if (halo.current) {
      halo.current.scale.setScalar(feu ? 9 + Math.sin(t * 6) * 1.2 : 2.5);
      halo.current.material.opacity = feu ? 0.28 : 0.06;
    }
    if (lumiere.current) {
      lumiere.current.intensity = (feu ? 120 : 12) * vacille;
      lumiere.current.color.setHSL(0.06, 0.9, feu ? 0.55 : 0.35);
    }
    if (boule.current) {
      const cible = activate ? 34 : 0.001;
      boule.current.scale.lerp(new THREE.Vector3(cible, cible, cible), Math.min(1, dt * (activate ? 1.4 : 0.4)));
      boule.current.visible = activate;
      boule.current.material.opacity = activate ? 0.85 : 0;
    }
  });

  return (
    <group position={[0, 3.2, 0]}>
      <mesh ref={flamme} position={[0, 3, 0]}>
        <coneGeometry args={[1.5, 6, 14, 1, true]} />
        <meshBasicMaterial color="#ff7a2a" transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={halo} position={[0, 3, 0]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ff9a4a" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <pointLight ref={lumiere} position={[0, 4, 0]} color="#ff8a3c" intensity={14} distance={90} decay={2} castShadow={false} />
      <mesh ref={boule} position={[0, 22, 0]} visible={false}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}
