/* Les trois options de chaque phase, côté client.
   Texte figé ici pour l'affichage ; l'autorité reste le scénario du serveur. */
export const SCENARIO = {
  etapes: [
    {
      heure: "06 h 40",
      question: "Comment engagez-vous la purge ?",
      options: [
        "Arrêter la coulée, purger selon un mode opératoire écrit, avec un outil adapté.",
        "Faire la purge comme d'habitude : petite vanne puis grande, en contrôlant le débit.",
        "Ouvrir largement pour aller plus vite : la purge est une opération banale."
      ]
    },
    {
      heure: "06 h 55",
      question: "Que faites-vous dans les premières minutes de la fuite ?",
      options: [
        "Couper les sources d'inflammation, alerter, évacuer, couper l'A7.",
        "Retourner dans le nuage refermer la vanne à la main.",
        "Attendre que la pression baisse d'elle-même."
      ]
    },
    {
      heure: "07 h 15",
      question: "Sur quoi portez-vous l'effort quand le gaz s'enflamme ?",
      options: [
        "Refroidir les sphères voisines, laisser brûler la fuite, tenir le périmètre.",
        "Éteindre la fuite au plus vite, au plus près.",
        "Se rapprocher pour fermer la vanne pendant que ça brûle."
      ]
    },
    {
      heure: "07 h 45",
      question: "Comment lisez-vous l'ouverture de la soupape ?",
      options: [
        "Comme un danger immédiat : reculer à 250 ou 300 mètres et arroser les voisines.",
        "Comme une bonne nouvelle : la pression s'évacue, c'est maîtrisé.",
        "Continuer d'arroser la 443 avec les moyens sur place."
      ]
    },
    {
      heure: "08 h 45",
      question: "Après l'explosion, quelle conduite adoptez-vous ?",
      options: [
        "Arrêt d'urgence, évacuation, arrosage à distance des capacités restantes.",
        "Poursuivre l'extinction au contact pour sauver le parc.",
        "Attendre les consignes de la direction."
      ]
    }
  ]
};
