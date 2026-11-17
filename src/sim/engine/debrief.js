/* GÉNÉRÉ par scripts/sync-engine.mjs depuis live-worker. Ne pas éditer ici. */
/* Débrief : frise comparative entre les choix du joueur et le déroulement réel du 4 janvier 1966.
   Ne dépend que de l'historique de la partie et du scénario, jamais d'un texte figé. */

const ORDRE = ["maitrise", "conforme", "retard", "aggravation"];

/* Écart d'un choix par rapport au réel, lu dans les données puis, à défaut, déduit des effets. */
export function ecartDe(option) {
  if (option.ecart) return option.ecart;
  if (option.historique) return "conforme";
  const e = option.effets || {};
  if (e.leak === 0) return "maitrise";
  if (e.water === "feu" || e.water === "aucun" || e.evacuate === false) return "aggravation";
  if (e.a7 === "closed" || e.evacuate === true) return "maitrise";
  return "retard";
}

const LIBELLE = {
  maitrise: "Plus prudent que le réel",
  conforme: "Conforme au réel",
  retard: "Un temps de retard",
  aggravation: "Plus risqué que le réel"
};

export function frise(game) {
  const { state, scenario } = game;
  return state.history.map((h) => {
    const etape = scenario.etapes[h.step] || {};
    const option = (etape.options || []).find((o) => o.lettre === h.option) || {};
    const ecart = ecartDe(option);
    return {
      step: h.step,
      heure: etape.heure || h.heure,
      titre: etape.titre || "",
      choix: option.texte || h.texte,
      reel: option.historique ? "Choix identique à celui de l'équipe de 1966." : "L'équipe de 1966 a fait un autre choix.",
      ecart,
      libelle: LIBELLE[ecart]
    };
  });
}

/* Synthèse chiffrée, utilisée par l'écran de débrief. */
export function synthese(game, fin) {
  const lignes = frise(game);
  const compte = { maitrise: 0, conforme: 0, retard: 0, aggravation: 0 };
  for (const l of lignes) compte[l.ecart] += 1;
  return {
    decisions: lignes.length,
    ...compte,
    barrièresTenues: fin ? fin.tenues : 0,
    barrièresTotal: fin ? fin.total : 0,
    morts: fin ? fin.morts : 0,
    blesses: fin ? fin.blesses : 0,
    verdict: fin ? fin.titre : "Partie en cours"
  };
}

/* Texte de conclusion, dans l'ordre de gravité, pour l'écran de salle. */
export function conclusionTexte(fin) {
  if (!fin) return "";
  const paires = [
    ["maitrise", "Aucune capacité n'a cédé : la crise s'arrête avant l'irréversible."],
    ["bleve-contenu", "La rupture était inévitable, mais les barrières humaines ont tenu."],
    ["historique", "L'enchaînement du 4 janvier 1966 s'est reproduit presque à l'identique."],
    ["chaine", "Le parc entier a suivi : c'est le scénario que la réglementation de 1967 vise à rendre impossible."]
  ];
  const paire = paires.find((p) => p[0] === fin.id);
  return paire ? paire[1] : "";
}

export { ORDRE };
