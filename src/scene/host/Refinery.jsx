import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

/* Huit sphères de GPL, pieds béton, passerelles, escaliers, soupapes, tuyauteries,
   cuvette givrée, bâtiment de contrôle et racks de pipes. Tout est procédural. */

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

const PIEDS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return [Math.cos(a) * R * 0.74, Math.sin(a) * R * 0.74];
});

function Sphere({ id, x, z, chaleur, givre }) {
  const matiere = useRef();
  const vapeur = useRef();
  const couleur = useMemo(() => new THREE.Color(), []);

  useFrame((s) => {
    if (matiere.current && id === "443") {
      const t = THREE.MathUtils.clamp((chaleur - 20) / 630, 0, 1);
      couleur.setHSL(THREE.MathUtils.lerp(0.58, 0.02, t), THREE.MathUtils.lerp(0.06, 0.85, t), THREE.MathUtils.lerp(0.7, 0.44, t));
      matiere.current.color.lerp(couleur, 0.15);
      matiere.current.emissive.setHSL(0.04, 0.95, 0.22 * t);
      matiere.current.emissiveIntensity = 0.15 + t * 2.2;
    }
    if (vapeur.current) {
      const t = s.clock.elapsedTime;
      const intensite = id === "443" ? THREE.MathUtils.clamp((chaleur - 60) / 500, 0, 1) : 0.12;
      vapeur.current.material.opacity = 0.05 + intensite * 0.22;
      vapeur.current.scale.setScalar(1 + Math.sin(t * 0.9 + x) * 0.04 + intensite * 0.3);
    }
  });

  return (
    <group position={[x, R + 2.8, z]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[R, 32, 22]} />
        <meshStandardMaterial ref={matiere} color="#a7b2c0" roughness={0.38} metalness={0.68} envMapIntensity={0.9} />
      </mesh>

      {/* nervures méridiennes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, (i * Math.PI) / 4, 0]}>
          <torusGeometry args={[R + 0.04, 0.05, 6, 64]} />
          <meshStandardMaterial color="#6f7c8c" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.14, 0.16, 8, 72]} />
        <meshStandardMaterial color="#5d6a79" metalness={0.6} roughness={0.55} />
      </mesh>

      {/* pieds et contreventement */}
      {PIEDS.map(([px, pz], i) => (
        <group key={i}>
          <mesh position={[px, -R * 0.58, pz]} castShadow>
            <cylinderGeometry args={[0.34, 0.46, R * 1.55, 10]} />
            <meshStandardMaterial color="#4e545c" roughness={0.95} metalness={0.06} />
          </mesh>
          <mesh position={[px * 0.55, -R * 0.95, pz * 0.55]} rotation={[0, Math.atan2(pz, px), 0.5]} castShadow>
            <boxGeometry args={[0.16, R * 1.1, 0.16]} />
            <meshStandardMaterial color="#454b53" roughness={0.9} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* socle béton */}
      <mesh position={[0, -R * 0.58 - R * 0.78, 0]} receiveShadow>
        <cylinderGeometry args={[R * 1.05, R * 1.15, 0.9, 24]} />
        <meshStandardMaterial color="#2b2f35" roughness={0.98} />
      </mesh>

      {/* passerelle + garde-corps */}
      <mesh position={[0, -R * 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[R + 0.6, R + 1.9, 56]} />
        <meshStandardMaterial color="#3a414a" roughness={0.92} metalness={0.28} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (R + 1.75), -R * 0.16 + 0.62, Math.sin(a) * (R + 1.75)]}>
            <boxGeometry args={[0.05, 1.15, 0.05]} />
            <meshStandardMaterial color="#59616b" metalness={0.5} roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, -R * 0.16 + 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 1.75, 0.05, 5, 56]} />
        <meshStandardMaterial color="#6b7480" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* escalier d'accès */}
      <group position={[R + 2.2, -R * 0.58, 0]}>
        <mesh rotation={[0, 0, -0.62]} castShadow>
          <boxGeometry args={[1.2, 12.5, 0.22]} />
          <meshStandardMaterial color="#565e68" roughness={0.9} metalness={0.3} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-0.4 + i * 0.12, -4.4 + i * 1.05, 0]} castShadow>
            <boxGeometry args={[1, 0.1, 0.7]} />
            <meshStandardMaterial color="#6a727d" roughness={0.85} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* soupape sommitale, évent, tuyauterie */}
      <mesh position={[0, R + 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.78, 1.5, 14]} />
        <meshStandardMaterial color="#7c8895" roughness={0.45} metalness={0.75} />
      </mesh>
      <mesh position={[0, R + 2.1, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 1.7, 8]} />
        <meshStandardMaterial color="#93a0ae" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[1.6, R - 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 3.4, 10]} />
        <meshStandardMaterial color="#6e7a87" metalness={0.7} roughness={0.45} />
      </mesh>

      {/* givre */}
      <mesh position={[0, -R * 0.76, 0]} visible={givre > 0.15}>
        <sphereGeometry args={[R * 1.01, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color="#d5e6f0" transparent opacity={0.32 * givre} roughness={0.12} metalness={0.05} />
      </mesh>

      {/* buée de la 443 qui chauffe */}
      <mesh ref={vapeur} position={[0, R * 0.7, 0]}>
        <sphereGeometry args={[R * 0.75, 18, 12]} />
        <meshBasicMaterial color="#c8d6de" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {id === "443" && (
        <Html center distanceFactor={110} position={[0, R + 3.6, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ font: "600 12px Helvetica, Arial", letterSpacing: "2.5px", color: "#ffb08a", whiteSpace: "nowrap", textShadow: "0 0 8px #000" }}>443</div>
        </Html>
      )}
    </group>
  );
}

function Cuvette() {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.05, 1]}>
        <boxGeometry args={[64, 0.1, 56]} />
        <meshStandardMaterial color="#1e2228" roughness={0.99} metalness={0.02} />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[-28 + (i % 8) * 8, 0.11, -22 + Math.floor(i / 8) * 40]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.2 + (i % 3), 10]} />
          <meshStandardMaterial color="#cfdce6" transparent opacity={0.08} roughness={0.2} />
        </mesh>
      ))}
      {[
        [0, 28.5, 64, 1.4],
        [0, -26.5, 64, 1.4],
        [-32.5, 1, 1.4, 56],
        [32.5, 1, 1.4, 56]
      ].map(([x, z, sx, sz], i) => (
        <mesh key={i} position={[x, 0.9, z]} castShadow receiveShadow>
          <boxGeometry args={[sx, 1.8, sz]} />
          <meshStandardMaterial color="#33383f" roughness={0.96} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 26]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 1.2]} />
        <meshStandardMaterial color="#0d1014" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* Racks de tuyauteries, bâtiment de contrôle, cheminées : l'échelle industrielle. */
function Annexes() {
  const racks = useMemo(() => {
    const l = [];
    for (let i = 0; i < 12; i++) l.push({ x: -46, y: 2.2 + (i % 3) * 1.3, z: -34 + i * 5.5, r: 0.28 + (i % 3) * 0.1 });
    for (let i = 0; i < 10; i++) l.push({ x: 44 + (i % 2) * 1.4, y: 1.8 + (i % 4) * 1.1, z: -30 + i * 6, r: 0.24 });
    return l;
  }, []);

  return (
    <group>
      {racks.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[p.r, p.r, 58, 8]} />
          <meshStandardMaterial color="#5a636e" metalness={0.65} roughness={0.55} />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i} position={[-46, 0, -34 + i * 9]}>
          <mesh position={[0, 3, 0]} castShadow>
            <boxGeometry args={[0.3, 6, 0.3]} />
            <meshStandardMaterial color="#464e58" metalness={0.4} roughness={0.7} />
          </mesh>
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[0.3, 0.25, 5.5]} />
            <meshStandardMaterial color="#464e58" metalness={0.4} roughness={0.7} />
          </mesh>
        </group>
      ))}

      <group position={[-40, 0, 24]}>
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 7, 10]} />
          <meshStandardMaterial color="#23272d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.2, 5.06]}>
          <planeGeometry args={[12, 1.6]} />
          <meshStandardMaterial color="#ffca8a" emissive="#ffca8a" emissiveIntensity={0.9} />
        </mesh>
        <pointLight position={[0, 5.6, 6]} intensity={10} distance={26} color="#ffc98a" decay={2} />
        <mesh position={[0, 7.2, 0]} castShadow>
          <boxGeometry args={[14.4, 0.4, 10.4]} />
          <meshStandardMaterial color="#1b1f24" roughness={0.95} />
        </mesh>
      </group>

      {[[-82, -96, 54], [88, -84, 40], [66, 62, 30]].map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[1.3, 2, h, 10]} />
            <meshStandardMaterial color="#262b31" roughness={0.95} />
          </mesh>
          <mesh position={[0, h + 0.6, 0]}>
            <cylinderGeometry args={[0.5, 0.9, 1.6, 8]} />
            <meshStandardMaterial color="#6a3a22" emissive="#ff5a1e" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, h + 1.4, 0]} intensity={7} distance={26} color="#ff7a3a" />
        </group>
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
      <Annexes />
      {SPHERES.map((s) => (
        <Sphere key={s.id} id={s.id} x={s.x} z={s.z} chaleur={bleve && s.id === "443" ? 650 : chaleur} givre={s.id === "443" ? givre : 0.25} />
      ))}
    </group>
  );
}
