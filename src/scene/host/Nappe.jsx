import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Nappe de propane : une feuille de brouillard rampant au sol, qui part de la
   sphère 443 et coule vers l'A7, plus quelques volutes qui montent.
   Portée, densité et direction viennent des capteurs du serveur. */

const NB = 900;

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTemps;
  uniform float uDensite;
  uniform float uPortee;
  uniform vec2 uVent;

  float bruit(vec2 p) {
    return sin(p.x * 3.1 + uTemps * 0.35) * sin(p.y * 2.7 - uTemps * 0.28)
         + 0.5 * sin(p.x * 7.3 - uTemps * 0.6) * sin(p.y * 6.1 + uTemps * 0.42)
         + 0.25 * sin(p.x * 15.7 + uTemps * 1.1) * sin(p.y * 13.3 - uTemps * 0.9);
  }

  void main() {
    vec2 p = vUv - vec2(0.5, 0.22);
    p.y *= 0.72;
    float d = length(p);
    float portee = 0.08 + uPortee * 0.44;
    float masque = smoothstep(portee, portee * 0.18, d);
    float n = bruit(vUv * 9.0 + uVent * 2.0) * 0.5 + 0.5;
    float epaisseur = masque * (0.35 + n * 0.9) * uDensite;
    vec3 froid = vec3(0.72, 0.79, 0.83);
    vec3 chaud = vec3(0.83, 0.72, 0.58);
    vec3 c = mix(froid, chaud, smoothstep(0.2, 0.9, d));
    float bord = smoothstep(0.0, 0.25, epaisseur);
    gl_FragColor = vec4(c, epaisseur * 0.85 * bord);
  }
`;

export default function Nappe({ capteurs }) {
  const feuille = useRef();
  const volutes = useRef();
  const uniforms = useMemo(
    () => ({
      uTemps: { value: 0 },
      uDensite: { value: 0 },
      uPortee: { value: 0.1 },
      uVent: { value: new THREE.Vector2(0.004, -0.01) }
    }),
    []
  );

  const positions = useMemo(() => {
    const a = new Float32Array(NB * 3);
    for (let i = 0; i < NB; i++) {
      const r = Math.sqrt(Math.random()) * 16;
      const ang = Math.random() * Math.PI * 2;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = 0.3 + Math.random() * 2.2;
      a[i * 3 + 2] = Math.sin(ang) * r * 0.8;
    }
    return a;
  }, []);

  const densite = (capteurs?.cloud_density_a7 ?? 0) / 100;
  const masse = capteurs?.nappe_masse ?? 0;
  const rayon = capteurs?.nappe_rayon ?? 0;
  const vent = capteurs?.wind_vector ?? [1, 0.35];

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = Math.min(1, masse > 0 ? 0.35 + densite * 0.65 : 0.02);
    uniforms.uTemps.value = t;
    uniforms.uDensite.value += (k - uniforms.uDensite.value) * Math.min(1, dt * 1.5);
    const cible = Math.min(1, Math.max(0.08, rayon / 160));
    uniforms.uPortee.value += (cible - uniforms.uPortee.value) * Math.min(1, dt * 0.8);
    uniforms.uVent.value.set(vent[0] * 0.01, -0.014 - Math.abs(vent[1]) * 0.01);

    if (volutes.current) {
      const arr = volutes.current.geometry.attributes.position.array;
      for (let i = 0; i < NB; i++) {
        const base = i * 3;
        arr[base + 2] -= (0.6 + (i % 7) * 0.12) * dt * (0.4 + densite * 2.2);
        arr[base] += vent[0] * dt * 1.6;
        arr[base + 1] += Math.sin(t * 0.6 + i) * dt * 0.4;
        if (arr[base + 2] < -120 || arr[base + 1] > 26) {
          const r = Math.sqrt(Math.random()) * 10;
          const ang = Math.random() * Math.PI * 2;
          arr[base] = Math.cos(ang) * r;
          arr[base + 1] = 0.2 + Math.random() * 1.2;
          arr[base + 2] = Math.sin(ang) * r * 0.7;
        }
      }
      volutes.current.geometry.attributes.position.needsUpdate = true;
      volutes.current.material.opacity = 0.02 + densite * 0.22;
    }
  });

  return (
    <group position={[0, 0.16, -4]}>
      <mesh ref={feuille} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -22]}>
        <planeGeometry args={[240, 190]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      <points ref={volutes}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={2.6}
          color="#c3ced6"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
