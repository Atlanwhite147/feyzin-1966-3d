import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

/* Caméra cinématique : orbite lente à l'accueil, travellings par phase,
   secousse au BLEVE. GSAP pilote des cibles, la boucle interpole. */
const PLAN = new URLSearchParams(window.location.search).get("vue") === "plan";
const CADRAGES = {
  99: { pos: [0, 240, 30], cible: [0, 0, -32] },
  0: { pos: [70, 70, 65], cible: [0, 2, -20] },
  1: { pos: [16, 6, 24], cible: [0, 5, -2] },
  2: { pos: [26, 5, -34], cible: [0, 4, -46] },
  3: { pos: [34, 10, 16], cible: [0, 11, -6] },
  4: { pos: [40, 7, 26], cible: [0, 16, 0] },
  5: { pos: [74, 44, 64], cible: [0, 8, -14] }
};

/* Sept points de la chronologie, pour le débriefing : l'animateur clique une
   ligne du bilan et la caméra se replace sur la scène correspondante. */
const POINTS_DEBRIEF = [
  { pos: [16, 6, 22], cible: [0, 4, 0] },
  { pos: [9, 5, 12], cible: [0, 3, 2] },
  { pos: [40, 14, -8], cible: [0, 2, -34] },
  { pos: [34, 16, 10], cible: [0, 8, -6] },
  { pos: [30, 10, 22], cible: [0, 16, 2] },
  { pos: [74, 44, 64], cible: [0, 8, -14] },
  { pos: [24, 20, 30], cible: [0, 10, -4] }
];

export default function Cameras({ etat }) {
  const { camera } = useThree();
  const cible = useRef(new THREE.Vector3(0, 9, 6));
  const but = useRef({ pos: new THREE.Vector3(46, 22, 58), cible: new THREE.Vector3(0, 9, 6) });
  const secousse = useRef(0);
  const phase = PLAN ? 99 : etat?.phase ?? 0;
  const bleve = !!etat?.capteurs?.bleve_triggered;
  const dernierePhase = useRef(-1);

  useEffect(() => {
    const cadrage = CADRAGES[phase] || CADRAGES[0];
    /* au premier montage, on se place directement : pas de travelling depuis
       un cadrage qui n'a rien à voir avec la scène. */
    if (dernierePhase.current === -1) {
      camera.position.set(cadrage.pos[0], cadrage.pos[1], cadrage.pos[2]);
      cible.current.set(cadrage.cible[0], cadrage.cible[1], cadrage.cible[2]);
      but.current.pos.set(cadrage.pos[0], cadrage.pos[1], cadrage.pos[2]);
      but.current.cible.set(cadrage.cible[0], cadrage.cible[1], cadrage.cible[2]);
      camera.lookAt(cible.current);
      dernierePhase.current = phase;
      return;
    }
    const tl = gsap.timeline();
    tl.to(but.current.pos, { x: cadrage.pos[0], y: cadrage.pos[1], z: cadrage.pos[2], duration: 2.6, ease: "power2.inOut" }, 0);
    tl.to(but.current.cible, { x: cadrage.cible[0], y: cadrage.cible[1], z: cadrage.cible[2], duration: 2.6, ease: "power2.inOut" }, 0);
    dernierePhase.current = phase;
    return () => tl.kill();
  }, [phase]);

  useEffect(() => {
    if (!bleve) return;
    secousse.current = 1;
    gsap.fromTo(secousse, { current: 1 }, { current: 0, duration: 2.4, ease: "power3.out" });
  }, [bleve]);

  useEffect(() => {
    const surPoint = (e) => {
      const i = e.detail;
      const p = POINTS_DEBRIEF[i];
      if (!p) return;
      const tl = gsap.timeline();
      tl.to(but.current.pos, { x: p.pos[0], y: p.pos[1], z: p.pos[2], duration: 1.6, ease: "power2.inOut" }, 0);
      tl.to(but.current.cible, { x: p.cible[0], y: p.cible[1], z: p.cible[2], duration: 1.6, ease: "power2.inOut" }, 0);
    };
    window.addEventListener("feyzin:point", surPoint);
    return () => window.removeEventListener("feyzin:point", surPoint);
  }, []);

  useEffect(() => {
    /* point d'appui pour les tests de cadrage */
    window.__cam = () => ({ pos: camera.position.toArray().map((v) => Math.round(v)), cible: cible.current.toArray().map((v) => Math.round(v)), plan: PLAN, phase });
  }, [camera, phase]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const k = Math.min(1, dt * 1.6);
    camera.position.lerp(but.current.pos, k);
    cible.current.lerp(but.current.cible, k);

    /* respiration d'orbite quand la séance n'a pas commencé */
    if ((etat?.etat === "attente" || !etat?.public) && phase === 0) {
      const angle = t * 0.045;
      camera.position.x += Math.sin(angle) * 0.06;
      camera.position.z += Math.cos(angle) * 0.06;
    }

    if (secousse.current > 0.001) {
      const a = secousse.current * 1.4;
      camera.position.x += (Math.random() - 0.5) * a;
      camera.position.y += (Math.random() - 0.5) * a;
      camera.position.z += (Math.random() - 0.5) * a;
    }

    camera.lookAt(cible.current);
  });

  return null;
}
