import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* L'A7 au sud du site : deux fois deux voies, trafic instancié, phares et feux arrière.
   Quand la route est coupée, les voitures s'arrêtent et s'accumulent. */
const NB = 26;
const LONGUEUR = 420;

export default function Autoroute({ etat }) {
  const bloquee = !!etat?.capteurs?.a7_traffic_blocked;
  const corps = useRef();
  const phares = useRef();
  const feux = useRef();
  const voitures = useMemo(
    () =>
      Array.from({ length: NB }, (_, i) => ({
        x: (i / NB) * LONGUEUR - LONGUEUR / 2,
        voie: i % 4,
        vitesse: 14 + ((i * 7) % 11),
        stop: Math.random() * 0.1
      })),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glow = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    if (!corps.current) return;
    for (let i = 0; i < NB; i++) {
      const v = voitures[i];
      if (!bloquee) v.x += v.vitesse * dt;
      else v.stop = Math.min(1, v.stop + dt * 0.9);
      if (v.x > LONGUEUR / 2) v.x = -LONGUEUR / 2;

      const z = -52 + (v.voie % 2) * 5.4 + (v.voie > 1 ? 5.4 : 0);
      const avance = bloquee ? v.x - v.stop * 6 : v.x;

      dummy.position.set(avance, 1.05, z);
      dummy.rotation.set(0, v.voie > 1 ? Math.PI : 0, 0);
      dummy.updateMatrix();
      corps.current.setMatrixAt(i, dummy.matrix);

      glow.position.set(avance + (v.voie > 1 ? -2.4 : 2.4), 0.95, z);
      glow.scale.set(v.voie > 1 ? 0.5 : 1, 1, 1);
      glow.updateMatrix();
      phares.current.setMatrixAt(i, glow.matrix);
      feux.current.setMatrixAt(i, glow.matrix);
    }
    corps.current.instanceMatrix.needsUpdate = true;
    phares.current.instanceMatrix.needsUpdate = true;
    feux.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* chaussée */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -50]} receiveShadow>
        <planeGeometry args={[LONGUEUR, 22]} />
        <meshStandardMaterial color="#11141a" roughness={0.95} />
      </mesh>
      {/* bandes et glissières */}
      {[-61, -50, -39].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, z]}>
          <planeGeometry args={[LONGUEUR, 0.18]} />
          <meshStandardMaterial color="#5b5f66" roughness={0.8} />
        </mesh>
      ))}
      {[-62.5, -37.5].map((z) => (
        <mesh key={z} position={[0, 0.7, z]}>
          <boxGeometry args={[LONGUEUR, 0.16, 0.3]} />
          <meshStandardMaterial color="#3c424a" metalness={0.6} roughness={0.6} />
        </mesh>
      ))}

      <instancedMesh ref={corps} args={[null, null, NB]} castShadow>
        <boxGeometry args={[4.2, 1.5, 1.9]} />
        <meshStandardMaterial color="#1b1f26" roughness={0.55} metalness={0.4} />
      </instancedMesh>

      <instancedMesh ref={phares} args={[null, null, NB]}>
        <sphereGeometry args={[0.34, 8, 8]} />
        <meshBasicMaterial color="#ffe9c4" toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={feux} args={[null, null, NB]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshBasicMaterial color="#ff3a1e" toneMapped={false} />
      </instancedMesh>

      <pointLight position={[0, 5, -50]} color="#8fa8d8" intensity={12} distance={90} decay={2} />
    </group>
  );
}
