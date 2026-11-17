import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

/* Caméra cinématique : orbite lente à l'accueil, travellings par phase,
   secousse au BLEVE. GSAP pilote des cibles, la boucle interpole. */
const CADRAGES = {
  0: { pos: [46, 22, 58], cible: [0, 9, 6] },
  1: { pos: [18, 7, 26], cible: [0, 6, 0] },
  2: { pos: [26, 5, -34], cible: [0, 4, -46] },
  3: { pos: [30, 9, 18], cible: [0, 12, 0] },
  4: { pos: [40, 7, 26], cible: [0, 16, 0] },
  5: { pos: [54, 26, 46], cible: [0, 18, 0] }
};

export default function Cameras({ etat }) {
  const { camera } = useThree();
  const cible = useRef(new THREE.Vector3(0, 9, 6));
  const but = useRef({ pos: new THREE.Vector3(46, 22, 58), cible: new THREE.Vector3(0, 9, 6) });
  const secousse = useRef(0);
  const phase = etat?.phase ?? 0;
  const bleve = !!etat?.capteurs?.bleve_triggered;
  const dernierePhase = useRef(-1);

  useEffect(() => {
    const cadrage = CADRAGES[phase] || CADRAGES[0];
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
