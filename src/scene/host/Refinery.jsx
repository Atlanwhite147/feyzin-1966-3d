import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

/* Huit sphères de GPL, leurs pieds, passerelles, soupapes et tuyauteries.
   La 443 est la seule dont la paroi chauffe : elle rougit avec la température. */
const SPHERES = [
  { id: "443", x: 0, z: 0 },
  { id: "442", x: -16, z: 2 },
  { id: "441", x: 16, z: 2 },
  { id: "445", x: -16, z: 22 },
  { id: "446", x: 0, z: 22 },
  { id: "447", x: 16, z: 22 },
  { id: "448", x: -16, z: -20 },
  { id: "449", x: 16, z: -20 }
];

const R = 7;

function Sphere({ id, x, z, chaleur, givre }) {
  const matiere = useRef();
  const couleur = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!matiere.current) return;
    if (id === "443") {
      const t = THREE.MathUtils.clamp((chaleur - 20) / 630, 0, 1);
      couleur.setHSL(THREE.MathUtils.lerp(0.58, 0.02, t), THREE.MathUtils.lerp(0.05, 0.85, t), THREE.MathUtils.lerp(0.72, 0.42, t));
      matiere.current.color.copy(couleur);
      matiere.current.emissive.setHSL(0.05, 0.9, 0.18 * t);
      matiere.current.emissiveIntensity = 0.2 + t * 1.6;
    } else {
      matiere.current.emissiveIntensity = 0.06;
    }
  });

  const pieds = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pieds.push([Math.cos(a) * (R * 0.72), Math.sin(a) * (R * 0.72)]);
  }

  return (
    <group position={[x, R + 2.6, z]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[R, 40, 28]} />
        <meshStandardMaterial
          ref={matiere}
          color="#9aa7b8"
          roughness={0.42}
          metalness={0.62}
          envMapIntensity={0.7}
        />
      </mesh>

      {/* ceinture équatoriale */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.05, 0.12, 8, 64]} />
        <meshStandardMaterial color="#6c7b8f" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* pieds en béton */}
      {pieds.map(([px, pz], i) => (
        <mesh key={i} position={[px, -R * 0.55, pz]} castShadow>
          <cylinderGeometry args={[0.42, 0.55, R * 1.5, 8]} />
          <meshStandardMaterial color="#4b5057" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {/* passerelle circulaire */}
      <mesh position={[0, -R * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R + 0.5, R + 1.5, 48]} />
        <meshStandardMaterial color="#3d454f" roughness={0.9} metalness={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* rampe et escalier */}
      <mesh position={[R + 1.1, -R * 0.55, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[1.1, 12, 0.25]} />
        <meshStandardMaterial color="#59626d" roughness={0.85} metalness={0.3} />
      </mesh>

      {/* soupape sommitale et tuyauterie */}
      <mesh position={[0, R + 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.7, 1.6, 12]} />
        <meshStandardMaterial color="#788592" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, R + 2.4, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.6, 8]} />
        <meshStandardMaterial color="#8b98a6" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* givre sur la jupe */}
      {givre > 0.2 && (
        <mesh position={[0, -R * 0.72, 0]}>
          <sphereGeometry args={[R * 0.99, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.34]} />
          <meshStandardMaterial color="#cfe0ea" roughness={0.15} metalness={0.1} transparent opacity={0.22 * givre} />
        </mesh>
      )}

      <Html center distanceFactor={70} position={[0, R + 4.2, 0]}>
        <div style={{ font: "600 11px Helvetica, Arial", letterSpacing: "2px", color: id === "443" ? "#ffb08a" : "#8fa0b3", whiteSpace: "nowrap" }}>
          {id}
        </div>
      </Html>
    </group>
  );
}

/* Cuvette de rétention : un socle béton et un merlon autour des sphères. */
function Cuvette() {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0.06, 1]}>
        <boxGeometry args={[62, 0.12, 54]} />
        <meshStandardMaterial color="#22262c" roughness={0.98} />
      </mesh>
      {[
        [0, 1, 27, 0.6, 62, 1.2],
        [0, 1, -25, 0.6, 62, 1.2],
        [-31, 1, 1, 0.6, 1.2, 54],
        [31, 1, 1, 0.6, 1.2, 54]
      ].map(([x, y, z, sx, sz, sy], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[i < 2 ? sx : sy, 1.6, i < 2 ? sy : sz]} />
          <meshStandardMaterial color="#3a3f46" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export default function Refinery({ etat }) {
  const chaleur = etat?.capteurs?.sphere_443_metal_temp ?? 20;
  const givre = THREE.MathUtils.clamp((etat?.capteurs?.valve_icing_level ?? 0) / 100, 0, 1);
  const bleve = !!etat?.capteurs?.bleve_triggered;

  return (
    <group>
      <Cuvette />
      {SPHERES.map((s) => (
        <Sphere
          key={s.id}
          id={s.id}
          x={s.x}
          z={s.z}
          chaleur={bleve && s.id === "443" ? 650 : chaleur}
          givre={s.id === "443" ? givre : 0.2}
        />
      ))}
      {/* torchères et cheminées lointaines */}
      <mesh position={[-70, 26, -80]} castShadow>
        <cylinderGeometry args={[1.4, 2.2, 52, 10]} />
        <meshStandardMaterial color="#2b3037" roughness={0.9} />
      </mesh>
      <mesh position={[76, 18, -70]} castShadow>
        <cylinderGeometry args={[1.1, 1.8, 36, 10]} />
        <meshStandardMaterial color="#2b3037" roughness={0.9} />
      </mesh>

      {/* lampe de mât */}
      <pointLight position={[-20, 14, 16]} color="#ffd9a0" intensity={22} distance={70} decay={2} />
      <pointLight position={[22, 14, 16]} color="#ffd9a0" intensity={18} distance={60} decay={2} />
    </group>
  );
}
