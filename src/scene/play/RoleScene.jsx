import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Quatre points de vue subjectifs, un par rôle. Aucun formulaire : le joueur
   regarde une scène 3D et doit décrire ce qu'il voit aux autres. */

function Brouillard({ densite }) {
  const pts = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      a[i * 3] = (Math.random() - 0.5) * 40;
      a[i * 3 + 1] = Math.random() * 3;
      a[i * 3 + 2] = -Math.random() * 45;
    }
    return a;
  }, []);
  useFrame((s) => {
    if (!pts.current) return;
    const arr = pts.current.geometry.attributes.position.array;
    for (let i = 0; i < 600; i++) arr[i * 3 + 2] += 0.02 + densite * 0.05;
    pts.current.geometry.attributes.position.needsUpdate = true;
    pts.current.material.opacity = 0.05 + densite * 0.25;
  });
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={1.6} color="#cfd8dd" transparent opacity={0.12} depthWrite={false} />
    </points>
  );
}

function Vanne({ givre }) {
  const gauche = useRef();
  const droite = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (gauche.current) gauche.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    if (droite.current) droite.current.rotation.y = Math.cos(t * 0.22) * 0.15;
  });
  return (
    <group position={[0, 1.05, 0.9]}>
      {[[-0.55, gauche], [0.55, droite]].map(([x, ref], i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh ref={ref} castShadow>
            <torusGeometry args={[0.42, 0.07, 10, 28]} />
            <meshStandardMaterial color={i === 0 ? "#b64a35" : "#8a3527"} roughness={0.45} metalness={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.1, 8]} />
            <meshStandardMaterial color="#6f7b87" metalness={0.8} roughness={0.35} />
          </mesh>
          {givre > 0.25 && (
            <mesh>
              <sphereGeometry args={[0.5, 14, 10]} />
              <meshStandardMaterial color="#dbe9f2" transparent opacity={0.18 + givre * 0.25} roughness={0.1} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 2.6, 16]} />
        <meshStandardMaterial color="#65707c" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Manometre({ pression }) {
  const aiguille = useRef();
  const cible = THREE.MathUtils.clamp((pression || 8) / 25, 0, 1);
  useFrame((s, dt) => {
    if (!aiguille.current) return;
    const tremble = Math.sin(s.clock.elapsedTime * 22) * 0.012 * (1 + cible * 3);
    aiguille.current.rotation.z = THREE.MathUtils.lerp(aiguille.current.rotation.z, -Math.PI * 0.75 + cible * Math.PI * 1.5 + tremble, Math.min(1, dt * 4));
  });
  return (
    <group position={[-1.8, 1.75, 0.4]} rotation={[0, 0.4, 0]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
        <meshStandardMaterial color="#1b1f26" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial color="#d8d2c4" />
      </mesh>
      <mesh ref={aiguille} position={[0, 0.07, 0]}>
        <boxGeometry args={[0.02, 0.28, 0.01]} />
        <meshBasicMaterial color="#a33222" />
      </mesh>
    </group>
  );
}

export default function RoleScene({ role, etat }) {
  const c = etat?.capteurs || {};
  const { camera } = useThree();

  if (role === "OPERATEUR_PURGE") {
    return (
      <>
        <color attach="background" args={["#070910"]} />
        <fogExp2 attach="fog" args={["#070910", 0.045]} />
        <ambientLight intensity={0.35} color="#7f8ea6" />
        <spotLight position={[2, 5, 4]} angle={0.7} penumbra={0.8} intensity={40} color="#ffd9a8" castShadow />
        <mesh position={[0, 0, -6]}>
          <sphereGeometry args={[5.4, 36, 24]} />
          <meshStandardMaterial color="#8b98a8" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#14171d" roughness={0.95} />
        </mesh>
        <Vanne givre={(c.valve_icing_level || 0) / 100} />
        <Manometre pression={c.pression} />
      </>
    );
  }

  if (role === "CHEF_DE_QUART") {
    return (
      <>
        <color attach="background" args={["#04060a"]} />
        <ambientLight intensity={0.18} color="#35507a" />
        <pointLight position={[0, 3, 2]} intensity={22} color="#6fa0ff" distance={20} />
        <mesh position={[0, -1.2, -2]} rotation={[-Math.PI / 3, 0, 0]}>
          <planeGeometry args={[10, 7]} />
          <meshStandardMaterial color="#071018" emissive="#0d2033" emissiveIntensity={0.6} metalness={0.4} roughness={0.5} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-3 + (i % 4) * 2, -0.7, -2 + Math.floor(i / 4) * 1.6]}>
            <sphereGeometry args={[0.28, 12, 10]} />
            <meshStandardMaterial color={i === 0 ? "#b64a35" : "#5c7f9a"} emissive={i === 0 ? "#ff4a22" : "#2a5a80"} emissiveIntensity={i === 0 ? 2.4 : 0.8} />
          </mesh>
        ))}
        <mesh position={[2.4, -0.2, 1.4]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.18, 0.28]} />
          <meshStandardMaterial color="#20262e" />
        </mesh>
      </>
    );
  }

  if (role === "POMPIERS_VIENNE_LYON") {
    return (
      <>
        <color attach="background" args={["#0a0604"]} />
        <fogExp2 attach="fog" args={["#120a06", 0.02]} />
        <ambientLight intensity={0.3} color="#a06a4a" />
        <pointLight position={[0, 4, -12]} intensity={90} color="#ff7a30" distance={60} />
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#181310" roughness={0.95} />
        </mesh>
        {[-12, 0, 12].map((x, i) => (
          <mesh key={i} position={[x, 6, -26]} castShadow>
            <sphereGeometry args={[6.4, 28, 20]} />
            <meshStandardMaterial color={i === 1 ? "#b0663a" : "#7c8896"} emissive={i === 1 ? "#ff5a1e" : "#000000"} emissiveIntensity={i === 1 ? 1.6 : 0} metalness={0.5} roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.6, -4]} rotation={[0.1, 0, 0]}>
          <coneGeometry args={[0.5, 12, 10, 1, true]} />
          <meshBasicMaterial color="#9fd8ff" transparent opacity={0.22} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#06080d"]} />
      <fogExp2 attach="fog" args={["#0a0f18", 0.035]} />
      <ambientLight intensity={0.25} color="#6f8bb5" />
      <pointLight position={[0, 6, 4]} intensity={20} color="#9fc0ff" distance={40} />
      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0e1117" roughness={0.9} />
      </mesh>
      {[-7, 0, 7].map((z, i) => (
        <mesh key={i} position={[0, -1.28, z]}>
          <planeGeometry args={[60, 0.2]} />
          <meshBasicMaterial color={i === 1 ? "#4a5462" : "#39424e"} />
        </mesh>
      ))}
      <Brouillard densite={(c.cloud_density_a7 || 0) / 100} />
    </>
  );
}
