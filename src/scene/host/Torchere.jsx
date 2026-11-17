import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Feu de fuite sous la sphère 443, panache de soupape, et boule de feu du BLEVE
   avec onde de choc. Intensités pilotées par l'état, jamais figées. */
export default function Torchere({ capteurs, activate }) {
  const flamme = useRef();
  const halo = useRef();
  const lumiere = useRef();
  const boule = useRef();
  const onde = useRef();
  const panache = useRef();
  const tempsBleve = useRef(0);

  const chaleur = (capteurs?.sphere_443_metal_temp ?? 20) / 650;
  const feu = !!capteurs?.incendie;
  const soupape = (capteurs?.sphere_443_metal_temp ?? 20) > 250 && !activate;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const vacille = 0.72 + Math.sin(t * 13.1) * 0.14 + Math.sin(t * 7.3) * 0.09;

    if (flamme.current) {
      const h = feu ? 5 + chaleur * 6 + Math.sin(t * 5) * 0.7 : 0.4;
      flamme.current.scale.set(1 + Math.sin(t * 9) * 0.07, h, 1 + Math.cos(t * 11) * 0.07);
      flamme.current.visible = feu;
      flamme.current.material.opacity = 0.55 + Math.sin(t * 11) * 0.12;
    }
    if (panache.current) {
      panache.current.visible = soupape;
      const h = soupape ? 9 + Math.sin(t * 2) * 1.6 : 0.001;
      panache.current.scale.set(0.5, h, 0.5);
      panache.current.material.opacity = soupape ? 0.16 : 0;
    }
    if (halo.current) {
      halo.current.scale.setScalar(feu ? 10 + Math.sin(t * 6) * 1.4 : 3);
      halo.current.material.opacity = feu ? 0.26 : 0.05;
    }
    if (lumiere.current) {
      lumiere.current.intensity = (feu ? 140 : 10) * vacille;
      lumiere.current.color.setHSL(0.055, 0.92, feu ? 0.55 : 0.32);
    }

    if (activate) {
      tempsBleve.current = Math.min(3.2, tempsBleve.current + dt);
      const k = Math.min(1, tempsBleve.current / 1.2);
      if (boule.current) {
        boule.current.visible = true;
        const d = 8 + k * 26;
        boule.current.scale.setScalar(d);
        boule.current.material.opacity = Math.max(0, 1 - tempsBleve.current / 3.2) * 0.92;
      }
      if (onde.current) {
        onde.current.visible = true;
        const r = 6 + tempsBleve.current * 70;
        onde.current.scale.setScalar(r);
        onde.current.material.opacity = Math.max(0, 0.7 - tempsBleve.current * 0.35);
      }
      if (lumiere.current) lumiere.current.intensity = 260 * Math.max(0, 1 - tempsBleve.current / 2.6) + 40;
    } else {
      tempsBleve.current = 0;
      if (boule.current) boule.current.visible = false;
      if (onde.current) onde.current.visible = false;
    }
  });

  return (
    <group position={[0, 3.4, 0]}>
      <mesh ref={flamme} position={[0, 3.4, 0]} visible={false}>
        <coneGeometry args={[1.7, 7, 16, 1, true]} />
        <meshBasicMaterial color="#ff7a2a" transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      <mesh ref={panache} position={[0, 12, 0]} visible={false}>
        <cylinderGeometry args={[1.4, 0.3, 12, 12, 1, true]} />
        <meshBasicMaterial color="#dfe9ef" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <mesh ref={halo} position={[0, 3.4, 0]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial color="#ff9a4a" transparent opacity={0.1} toneMapped={false} depthWrite={false} />
      </mesh>

      <pointLight ref={lumiere} position={[0, 4.5, 0]} color="#ff8a3c" intensity={12} distance={110} decay={1.8} />

      {/* boule de feu du BLEVE */}
      <mesh ref={boule} position={[0, 24, 0]} visible={false}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.9} toneMapped={false} />
      </mesh>

      {/* onde de choc au sol */}
      <mesh ref={onde} position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial color="#ffcf9a" transparent opacity={0.6} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
