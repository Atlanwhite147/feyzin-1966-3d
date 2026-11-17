import { useEffect, useState } from "react";
import { abonner, instantane } from "./net.js";

/* S'abonne au magasin temps réel. Le rendu 3D lit les capteurs à chaque image,
   donc on évite un setState par tick : le hook ne re-rend que sur les champs demandés. */
export function useNet(selecteur = (e) => e) {
  const [valeur, setValeur] = useState(() => selecteur(instantane()));
  useEffect(() => {
    const off = abonner((e) => {
      const v = selecteur(e);
      setValeur((ancien) => (Object.is(ancien, v) ? ancien : v));
    });
    return () => off();
  }, [selecteur]);
  return valeur;
}

/* Lecture sans re-rendu, pour les boucles d'animation (useFrame). */
export function lireEtat() {
  return instantane();
}
