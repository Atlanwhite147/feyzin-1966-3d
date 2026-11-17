import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Nappe de propane : particules basses qui rampent depuis la sphère 443 vers l'A7.
   La densité et la portée suivent les capteurs du serveur. */
const NB = 1200;

export default function Nappe({ capteurs }) {
  const points = useRef();
  const densite = (capteurs?.cloud_density_a7 ?? 0) / 100;
  const masse = capteurs?.nappe_masse ?? 0;
  const rayon = capteurs?.nappe_rayon ?? 0;
  const vent = capteurs?.wind_vector ?? [1, 0.35];
  const actif = masse > 0;

  const { positions, graines } = useMemo(() => {
    const positions = new Float32Array(NB * 3);
    const graines = new Float32Array(NB);
    for (let i = 0; i < NB; i++) {
      const r = Math.sqrt(Math.random()) * 10;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.4 + Math.random() * 1.2;
      positions[i * 3 + 2] = Math.sin(a) * r;
      graines[i] = Math.random();
    }
    return { positions, graines };
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const geo = points.current.geometry;
    const arr = geo.attributes.position.array;
    const t = state.clock.elapsedTime;
    const portee = 10 + Math.min(rayon, 150) * 0.55;
    for (let i = 0; i < NB; i++) {
      const g = graines[i];
      const avance = (t * (2.2 + g * 3.4) + g * 40) % (portee * 2);
      arr[i * 3] = -portee + avance + Math.sin(t * 0.6 + g * 9) * 1.6;
      arr[i * 3 + 2] = (g - 0.5) * portee * 1.2 * (0.4 + densite) + vent[0] * 4;
      arr[i * 3 + 1] = 0.3 + Math.sin(t * 0.9 + g * 6.2) * 0.25 + g * 0.5;
    }
    geo.attributes.position.needsUpdate = true;
    points.current.material.opacity = actif ? 0.1 + densite * 0.4 : 0.02;
  });

  return (
    <points ref={points} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={2.4}
        color="#c9d2d8"
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
