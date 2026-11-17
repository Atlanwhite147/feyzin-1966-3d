import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Éclairage du site : nuit d'hiver, lueur urbaine à l'horizon, lune basse,
   projecteurs halogènes orangés, manche à air animée par le vent. */

function MancheAVent({ vent = [1, 0.35] }) {
  const manche = useRef();
  const angle = Math.atan2(vent[1], vent[0]);
  useFrame((s) => {
    if (!manche.current) return;
    const t = s.clock.elapsedTime;
    manche.current.rotation.z = -0.35 + Math.sin(t * 1.6) * 0.12;
    manche.current.rotation.y = angle + Math.sin(t * 0.7) * 0.15;
  });
  return (
    <group position={[-24, 0, -26]}>
      <mesh position={[0, 6, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 12, 8]} />
        <meshStandardMaterial color="#5c6672" metalness={0.6} roughness={0.5} />
      </mesh>
      <group ref={manche} position={[0, 11.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[1.05, 4.6, 12, 1, true]} />
          <meshStandardMaterial color="#c85a2a" side={THREE.DoubleSide} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function Projecteur({ position, cible, intensite = 60, angle = 0.42 }) {
  const spot = useRef();
  useFrame((s) => {
    if (!spot.current) return;
    const t = s.clock.elapsedTime;
    spot.current.intensity = intensite * (0.94 + Math.sin(t * 7.3 + position[0]) * 0.04);
  });
  return (
    <>
      <spotLight
        ref={spot}
        position={position}
        angle={angle}
        penumbra={0.55}
        intensity={intensite}
        distance={90}
        decay={1.7}
        color="#ffb066"
      />
      <mesh position={position}>
        <boxGeometry args={[1.2, 0.5, 0.7]} />
        <meshStandardMaterial color="#2a2f36" metalness={0.5} roughness={0.6} />
        <pointLight position={[0, -0.4, 0]} intensity={3} distance={9} color="#ffcf9a" />
      </mesh>
      <mesh position={position}>
        <cylinderGeometry args={[0.05, 0.05, 10, 6]} />
        <meshStandardMaterial color="#3b424a" />
      </mesh>
    </>
  );
}

export default function Lighting({ etat }) {
  const vent = etat?.capteurs?.wind_vector || [1, 0.35];

  return (
    <>
      {/* ciel et lueur urbaine */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[420, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{ haut: { value: new THREE.Color("#04060c") }, bas: { value: new THREE.Color("#1a2233") }, lueur: { value: new THREE.Color("#3a2a22") } }}
          vertexShader={"varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"}
          fragmentShader={
            "uniform vec3 haut; uniform vec3 bas; uniform vec3 lueur; varying vec3 vP;" +
            "void main(){ float h = normalize(vP).y; vec3 c = mix(bas, haut, smoothstep(-0.05, 0.85, h));" +
            " float horizon = exp(-abs(h) * 14.0); c += lueur * horizon * 0.55;" +
            " gl_FragColor = vec4(c, 1.0); }"
          }
        />
      </mesh>

      <fogExp2 attach="fog" args={["#0a0f18", 0.0062]} />

      <hemisphereLight args={["#3d527c", "#161513", 0.85]} />
      <ambientLight intensity={0.38} color="#55688c" />

      {/* lune basse */}
      <directionalLight
        position={[-120, 44, -90]}
        intensity={0.95}
        color="#a9c0e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={140}
        shadow-camera-bottom={-140}
        shadow-bias={-0.0006}
      />
      <mesh position={[-220, 60, -180]}>
        <sphereGeometry args={[9, 16, 12]} />
        <meshBasicMaterial color="#dfe8f5" toneMapped={false} />
      </mesh>

      <Projecteur position={[-21, 13, 15]} intensite={130} />
      <Projecteur position={[23, 13, 15]} intensite={105} />
      <Projecteur position={[0, 15, -30]} intensite={90} angle={0.7} />

      {/* éclairage de dégagement du parc, pour la lisibilité en salle */}
      <spotLight position={[0, 46, 30]} angle={0.95} penumbra={1} intensity={140} distance={160} decay={1.6} color="#cfe0ff" />
      <pointLight position={[0, 18, 8]} intensity={45} distance={120} decay={1.8} color="#9db4d8" />

      <MancheAVent vent={vent} />

      {/* lampadaires sodium de la route */}
      {Array.from({ length: 14 }).map((_, i) => (
        <group key={i} position={[-195 + i * 30, -1.5, -37]}>
          <mesh position={[0, 5.6, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 11.2, 6]} />
            <meshStandardMaterial color="#2c323a" metalness={0.5} roughness={0.6} />
          </mesh>
          <mesh position={[0, 11.2, 0]}>
            <boxGeometry args={[2.4, 0.3, 0.9]} />
            <meshStandardMaterial color="#ffb45c" emissive="#ffcf8f" emissiveIntensity={3.2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 10.6, 0]} intensity={48} distance={62} decay={2} color="#ffb45c" />
        </group>
      ))}
    </>
  );
}
