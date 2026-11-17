import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* L'A7 borde le site, un mètre cinquante plus bas. Deux fois deux voies,
   trafic instancié, phares et feux arrière. Quand la route est coupée, les
   voitures ralentissent, s'arrêtent et s'accumulent en file derrière le barrage. */
const NB = 34;
const LONGUEUR = 460;
const Y_ROUTE = -1.5;
const Z_VOIES = [-59.4, -54.8, -47.2, -42.6];

export default function Autoroute({ etat }) {
  const bloquee = !!etat?.capteurs?.a7_traffic_blocked;
  const corps = useRef();
  const phares = useRef();
  const feux = useRef();
  const barrage = useRef();
  const gyro = useRef();

  const voitures = useMemo(
    () =>
      Array.from({ length: NB }, (_, i) => ({
        x: (i / NB) * LONGUEUR - LONGUEUR / 2,
        voie: i % 4,
        vitesse: 13 + ((i * 7) % 13),
        arret: 0,
        file: 0
      })),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lueur = useMemo(() => new THREE.Object3D(), []);
  const sens = (voie) => (voie < 2 ? 1 : -1);

  useFrame((state, dt) => {
    if (!corps.current) return;
    const t = state.clock.elapsedTime;
    const pas = Math.min(dt, 0.05);

    /* file d'attente : on garde un espacement minimal derrière le barrage */
    const fileGauche = voitures.filter((v) => v.voie < 2).sort((a, b) => b.x - a.x);
    const fileDroite = voitures.filter((v) => v.voie >= 2).sort((a, b) => a.x - b.x);

    for (let i = 0; i < NB; i++) {
      const v = voitures[i];
      const dir = sens(v.voie);
      const rang = (dir > 0 ? fileGauche : fileDroite).indexOf(v);

      if (bloquee) {
        const butin = dir > 0 ? 18 - rang * 6.4 : -18 + rang * 6.4;
        const distance = (butin - v.x) * dir;
        if (distance > 0.5) {
          v.arret = Math.min(1, v.arret + pas * 1.4);
          v.x += dir * Math.max(0, v.vitesse * (1 - v.arret)) * pas;
        } else {
          v.x = butin;
          v.arret = 1;
        }
      } else {
        v.arret = Math.max(0, v.arret - pas * 1.1);
        v.x += dir * v.vitesse * (0.35 + v.arret * 0.65) * pas;
        if (v.x > LONGUEUR / 2) v.x = -LONGUEUR / 2;
        if (v.x < -LONGUEUR / 2) v.x = LONGUEUR / 2;
      }

      const z = Z_VOIES[v.voie];
      dummy.position.set(v.x, Y_ROUTE + 0.75, z);
      dummy.rotation.set(0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
      dummy.updateMatrix();
      corps.current.setMatrixAt(i, dummy.matrix);

      const avant = dir > 0 ? 2.3 : -2.3;
      lueur.position.set(v.x + avant, Y_ROUTE + 0.66, z);
      lueur.scale.set(1, v.arret > 0.8 ? 1.4 : 1, 1);
      lueur.updateMatrix();
      phares.current.setMatrixAt(i, lueur.matrix);

      lueur.position.set(v.x - avant, Y_ROUTE + 0.7, z);
      lueur.scale.set(1, 1, 1);
      lueur.updateMatrix();
      feux.current.setMatrixAt(i, lueur.matrix);
    }

    corps.current.instanceMatrix.needsUpdate = true;
    phares.current.instanceMatrix.needsUpdate = true;
    feux.current.instanceMatrix.needsUpdate = true;

    if (barrage.current) {
      barrage.current.visible = bloquee;
      gyro.current.visible = bloquee;
      if (bloquee) {
        gyro.current.intensity = 8 + Math.abs(Math.sin(t * 5.5)) * 26;
      }
    }
  });

  return (
    <group>
      {/* mur de soutènement entre le plateau et la chaussée */}
      <mesh position={[0, -0.72, -39]} receiveShadow>
        <boxGeometry args={[LONGUEUR, 1.6, 0.5]} />
        <meshStandardMaterial color="#31363d" roughness={0.95} />
      </mesh>

      {/* chaussée */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROUTE + 0.01, -51]} receiveShadow>
        <planeGeometry args={[LONGUEUR, 24]} />
        <meshStandardMaterial color="#20252c" roughness={0.94} metalness={0.06} />
      </mesh>

      {/* marquage */}
      {[-59.4, -54.8, -47.2, -42.6].map((z) => (
        <mesh key={"b" + z} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROUTE + 0.03, z]}>
          <planeGeometry args={[LONGUEUR, 0.16]} />
          <meshStandardMaterial color="#8d9299" roughness={0.9} transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 46 }).map((_, i) => (
        <mesh key={"c" + i} rotation={[-Math.PI / 2, 0, 0]} position={[-LONGUEUR / 2 + i * 10, Y_ROUTE + 0.03, -51]}>
          <planeGeometry args={[4, 0.14]} />
          <meshStandardMaterial color="#c9cdd2" roughness={0.85} transparent opacity={0.42} />
        </mesh>
      ))}

      {/* glissières */}
      {[-63.6, -38.4].map((z) => (
        <group key={"g" + z}>
          <mesh position={[0, Y_ROUTE + 0.72, z]}>
            <boxGeometry args={[LONGUEUR, 0.16, 0.28]} />
            <meshStandardMaterial color="#3c424a" metalness={0.65} roughness={0.55} />
          </mesh>
          {Array.from({ length: 31 }).map((_, i) => (
            <mesh key={i} position={[-LONGUEUR / 2 + i * 15, Y_ROUTE + 0.36, z]}>
              <boxGeometry args={[0.12, 0.72, 0.12]} />
              <meshStandardMaterial color="#2c323a" metalness={0.5} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* éclairage routier, pour que l'A7 se lise depuis le fond de la salle */}
      <pointLight position={[0, 6, -51]} intensity={30} distance={120} decay={1.8} color="#c8d6ee" />
      <pointLight position={[-90, 6, -51]} intensity={18} distance={90} decay={1.8} color="#ffb45c" />
      <pointLight position={[90, 6, -51]} intensity={18} distance={90} decay={1.8} color="#ffb45c" />

      <instancedMesh ref={corps} args={[null, null, NB]} castShadow>
        <boxGeometry args={[4.3, 1.45, 1.85]} />
        <meshStandardMaterial color="#1c2027" roughness={0.5} metalness={0.45} />
      </instancedMesh>

      <instancedMesh ref={phares} args={[null, null, NB]}>
        <sphereGeometry args={[0.42, 8, 8]} />
        <meshBasicMaterial color="#ffe9c4" toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={feux} args={[null, null, NB]}>
        <sphereGeometry args={[0.26, 6, 6]} />
        <meshBasicMaterial color="#ff3a1e" toneMapped={false} />
      </instancedMesh>

      {/* barrage de gendarmerie */}
      <group ref={barrage} visible={false} position={[0, Y_ROUTE, -51]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.5, 1.2, 24]} />
          <meshStandardMaterial color="#d8d2c4" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.6, 0.2, 24]} />
          <meshStandardMaterial color="#b4451f" emissive="#b4451f" emissiveIntensity={1.4} />
        </mesh>
        <pointLight ref={gyro} position={[0, 2.4, -3]} color="#3a6bff" intensity={18} distance={60} decay={2} />
        <mesh position={[0, 2.1, -3]}>
          <sphereGeometry args={[0.34, 10, 8]} />
          <meshBasicMaterial color="#4a7cff" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
