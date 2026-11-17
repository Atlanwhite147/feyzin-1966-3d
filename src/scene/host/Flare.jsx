import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Torchère de raffinerie : elle brûle en permanence, c'est le repère visuel
   du site depuis l'autoroute. La flamme ondule et la lumière vacille. */
export default function Flare({ position = [58, 0, 34] }) {
  const flamme = useRef();
  const lumiere = useRef();
  const fume = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const battement = 0.78 + Math.sin(t * 9.3) * 0.12 + Math.sin(t * 21.7) * 0.06;
    if (flamme.current) {
      flamme.current.scale.set(1 + Math.sin(t * 7.1) * 0.09, 1.1 + Math.sin(t * 11.3) * 0.18, 1 + Math.cos(t * 8.7) * 0.09);
    }
    if (lumiere.current) lumiere.current.intensity = 120 * battement;
    if (fume.current) {
      fume.current.position.y = 26 + ((t * 2.2) % 20);
      fume.current.material.opacity = 0.12 * (1 - (((t * 2.2) % 20) / 20));
      fume.current.scale.setScalar(2.4 + ((t * 2.2) % 20) * 0.22);
    }
  });

  return (
    <group position={position}>
      {/* mât et structure */}
      <mesh position={[0, 17, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.95, 34, 12]} />
        <meshStandardMaterial color="#3a4048" metalness={0.55} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 6 + i * 9, 0]}>
          <torusGeometry args={[1.5, 0.09, 6, 18]} />
          <meshStandardMaterial color="#4a525c" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {[[-1.2, 0], [1.2, 0], [0, -1.2]].map(([x, z], i) => (
        <mesh key={i} position={[x * 2.2, 3, z * 2.2]} rotation={[0, 0, x ? -0.12 : 0]}>
          <cylinderGeometry args={[0.14, 0.16, 7, 6]} />
          <meshStandardMaterial color="#434a53" metalness={0.5} roughness={0.65} />
        </mesh>
      ))}

      <group position={[0, 34.4, 0]}>
        <mesh ref={flamme}>
          <coneGeometry args={[1.5, 7.5, 14, 1, true]} />
          <meshBasicMaterial color="#ff8a3a" transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[1.1, 14, 10]} />
          <meshBasicMaterial color="#ffb066" transparent opacity={0.22} toneMapped={false} depthWrite={false} />
        </mesh>
        <pointLight ref={lumiere} color="#ff8a3c" intensity={110} distance={140} decay={1.7} position={[0, 2, 0]} />
      </group>

      <mesh ref={fume} position={[0, 32, 0]}>
        <sphereGeometry args={[2.2, 12, 10]} />
        <meshBasicMaterial color="#5b6068" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}
