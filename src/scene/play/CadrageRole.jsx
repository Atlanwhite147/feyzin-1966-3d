import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Chaque poste a son point de vue : on se place à hauteur d'œil, cadré sur
   ce que le joueur doit voir et décrire aux autres. */
const CADRAGES = {
  OPERATEUR_PURGE: { pos: [0.45, 1.6, 5.9], cible: [-0.1, 1.25, -1.5] },
  CHEF_DE_QUART: { pos: [0, 2.05, 3.1], cible: [0, 1.1, -1.6] },
  POMPIERS_VIENNE_LYON: { pos: [0, 1.75, 7], cible: [0, 5.5, -20] },
  GENDARMERIE_A7: { pos: [0, 1.7, 5.5], cible: [0, 1.1, -18] }
};

export default function CadrageRole({ role }) {
  const { camera } = useThree();

  useEffect(() => {
    const c = CADRAGES[role] || CADRAGES.OPERATEUR_PURGE;
    camera.position.set(c.pos[0], c.pos[1], c.pos[2]);
    camera.lookAt(new THREE.Vector3(c.cible[0], c.cible[1], c.cible[2]));
    camera.updateProjectionMatrix();
  }, [role, camera]);

  return null;
}
