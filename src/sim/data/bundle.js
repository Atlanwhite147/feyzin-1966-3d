/* Fichier généré par scripts/build-data.mjs. Ne pas éditer à la main. */

export const physics = {
  "meta": {
    "source": "Fiche ARIA n°1 (ministère chargé de l'environnement, septembre 2006), rapports d'experts judiciaires, DHYCA du 19 janvier 1966, service des mines de l'Isère n°05460 du 2 janvier 1967.",
    "note": "Constantes de simulation. Unités : minutes, mètres, bars, degrés Celsius, kilogrammes, pourcents de réserve d'eau. Calibrées pour retrouver la chronologie réelle : inflammation à 07 h 15, rupture à 08 h 45."
  },
  "horloge": {
    "depart": "06:30",
    "pas": 1,
    "dureeMax": 300
  },
  "fuite": {
    "debitInitial": 180,
    "decroissance": 0.985,
    "ventMetresParMinute": 24,
    "seuilNappeKg": 900,
    "distanceA7": 180,
    "seuilInflammationKg": 1400
  },
  "sphere443": {
    "pressionInitiale": 8.2,
    "temperatureParoiInitiale": 12,
    "pressionRupture": 20,
    "temperatureRupture": 62,
    "chauffeIncendie": 1.5,
    "chauffeVoisine": 1.2,
    "refroidissementParEau": -0.95,
    "refroidissementNaturel": -0.05,
    "volumeM3": 1200,
    "remplissage": 0.85
  },
  "reserveEau": {
    "stock": 100,
    "coutRefroidissementParMinute": 0.9,
    "coutExtinctionParMinute": 1.8,
    "rechargeParMinute": 0.35
  },
  "perimetre": {
    "rayonInitial": 0,
    "seuilSecurite": 300,
    "evacuationParMinute": 0.25
  },
  "population": {
    "personnelSite": 40,
    "sapeursEngages": 120,
    "distanceSapeursInitiale": 250,
    "distanceSapeursDangereuse": 100,
    "riverainsExposes": 12
  },
  "bilan": {
    "historique": {
      "morts": 18,
      "blesses": 84
    },
    "bleveContenu": {
      "morts": 2,
      "blesses": 9
    },
    "maitrise": {
      "morts": 0,
      "blesses": 1
    },
    "chaine": {
      "morts": 31,
      "blesses": 140
    }
  }
};

export const scenario = {
  "meta": {
    "titre": "Feyzin 1966 — sept décisions avant l'aube",
    "site": "Raffinerie de Feyzin, 4 janvier 1966",
    "source": "Fiche ARIA n°1 ; rapports d'experts judiciaires ; DHYCA 19 janvier 1966."
  },
  "etapes": [
    {
      "id": "etape-1",
      "heure": "06 h 30",
      "titre": "La purge",
      "situation": "La sphère 443 est en remplissage. Il faut prélever un échantillon du produit pour analyse, et pour cela purger la ligne du bas. Les trois prises latérales givrent souvent : on passe par la prise inférieure, entre deux vannes de purge de 50 mm en série, commandées à la clé à carré. Il fait nuit, l'éclairage est réduit.",
      "question": "Comment engagez-vous la purge ?",
      "reel": "L'aide-opérateur ouvre la vanne inférieure à moitié puis largement celle du haut. Le propane jaillit, éclabousse son visage, les lunettes sont arrachées. La clé mobile, dont l'écrou n'était pas fixé, a quitté le carré : impossible de refermer, les vannes givrent.",
      "lecon": "Une purge de GPL sous pression n'est jamais banale : mode opératoire écrit, outil solidaire, protection du visage, et pas de purge sous une sphère en remplissage.",
      "options": [
        {
          "lettre": "A",
          "texte": "Arrêter la coulée, mettre la sphère en sécurité, purger selon un mode opératoire écrit avec un outil adapté.",
          "branche": "La purge se fait vanne par vanne, la clé est solidaire du carré, le visage protégé. Un peu de gaz s'échappe, l'échantillon est prélevé à 6 h 55. À 7 heures, la sphère reprend son remplissage. Personne ne saura jamais qu'une purge banale avait failli tout emporter.",
          "historique": false,
          "effets": {
            "leak": 0,
            "closeAfter": 12,
            "ignitionAfter": null,
            "a7": "open",
            "perimeter": 0,
            "evacuate": false,
            "water": "aucun",
            "rescue": 250,
            "alert": 6
          }
        },
        {
          "lettre": "B",
          "texte": "Faire la purge comme d'habitude : petite vanne puis grande, en contrôlant le débit.",
          "branche": "Le givre apparaît, l'écoulement saccade, mais rien ne jaillit. L'échantillon est pris avec cinq minutes de retard. Le rapport de quart ne mentionne rien : la marge tenait à un écrou qui voulait bien tenir.",
          "historique": false,
          "effets": {
            "leak": 60,
            "closeAfter": 26,
            "ignitionAfter": null,
            "a7": "open",
            "perimeter": 0,
            "evacuate": false,
            "water": "aucun",
            "rescue": 250,
            "alert": 6
          }
        },
        {
          "lettre": "C",
          "texte": "Ouvrir largement pour aller plus vite, la purge est une opération banale.",
          "branche": "À 6 h 40, le propane jaillit. En dix minutes le nuage sort du site, à 7 h 15 il s'allume sur l'autoroute, à 8 h 45 la sphère éclate. C'est la branche réelle, celle du 4 janvier 1966.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 0,
            "evacuate": false,
            "water": "aucun",
            "rescue": 250,
            "alert": 12
          }
        }
      ]
    },
    {
      "id": "etape-2",
      "heure": "06 h 41",
      "titre": "La fuite",
      "situation": "Le propane sort en continu sous la sphère. Vent quasi nul, température basse, dispersion défavorable. Deux cents tonnes de produit dans la sphère.",
      "question": "Que faites-vous dans les premières minutes ?",
      "reel": "Les deux agents renoncent sans refermer la vanne inférieure et donnent l'alerte interne. L'équipe de sécurité tente dix minutes d'interrompre la fuite : vannes givrées, échec. Le nuage sort du site et descend vers l'A7 sur un à un mètre cinquante d'épaisseur.",
      "lecon": "Dans les dix premières minutes, ce qui protège c'est de supprimer les sources d'inflammation et de faire circuler l'alerte, pas de tenter l'impossible au contact.",
      "options": [
        {
          "lettre": "A",
          "texte": "Couper les sources d'inflammation, arrêter la pomperie, alerter, évacuer, puis ne fermer qu'avec un moyen protégé.",
          "branche": "Les moteurs s'arrêtent, le périmètre est balisé, l'alerte part en interne. Le nuage sort du site mais trouve moins de points chauds qu'en 1966. Il se dissipe au-dessus de l'A7 sans s'enflammer. À 8 heures, il n'y a plus de fuite, et personne n'a été blessé.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": null,
            "a7": "closed",
            "perimeter": 200,
            "evacuate": true,
            "water": "aucun",
            "rescue": 250,
            "alert": 3
          }
        },
        {
          "lettre": "B",
          "texte": "Retourner dans le nuage refermer à la main.",
          "branche": "Deux hommes entrent dans le nuage sans masque, avec une clé qui ne prend pas sur des vannes givrées. Ils ressortent vivants, mais leurs vêtements sont imprégnés de propane. La suite tiendra à un point chaud, quelque part sur l'autoroute.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": null,
            "a7": "open",
            "perimeter": 60,
            "evacuate": false,
            "water": "aucun",
            "rescue": 100,
            "alert": 8
          }
        },
        {
          "lettre": "C",
          "texte": "Attendre que la pression baisse d'elle-même.",
          "branche": "Le nuage continue de grossir pendant que le site attend. À 7 h 15, une voiture s'arrête dans le nuage et l'allume. Le chalumeau s'installe sous la sphère 443.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 0,
            "evacuate": false,
            "water": "aucun",
            "rescue": 250,
            "alert": 14
          }
        }
      ]
    },
    {
      "id": "etape-3",
      "heure": "06 h 50",
      "titre": "Le nuage et l'autoroute",
      "situation": "Le nuage franchit la limite du site et atteint l'A7 puis le CD4. Un camion vient de le traverser sans l'enflammer. Une dizaine de personnes stationne sur le CD4.",
      "question": "Votre priorité, maintenant ?",
      "reel": "Poste de garde alerté à 6 h 50, employés qui tentent d'arrêter la circulation. Dix minutes pour joindre la gendarmerie, appel vers 7 h 05. À 7 h 15, une voiture entre dans le nuage malgré le signal d'arrêt d'un garde : le nuage s'allume, la flamme remonte, et le propane s'allume à la source.",
      "lecon": "Couper une voie et prévenir les secours publics sont des actions des toutes premières minutes : un numéro, une astreinte, un exercice.",
      "options": [
        {
          "lettre": "A",
          "texte": "Couper les deux voies par tous moyens et alerter gendarmerie et préfecture sans attendre.",
          "branche": "Appel immédiat, barrage à 6 h 54, l'A7 fermée dans les deux sens. Le nuage traverse la chaussée vide et se dissipe dans les champs. Le camion de 6 h 50 restera le seul véhicule à être entré : il n'a rien allumé.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "closed",
            "perimeter": 250,
            "evacuate": true,
            "water": "aucun",
            "rescue": 250,
            "alert": 4
          }
        },
        {
          "lettre": "B",
          "texte": "Faire signe aux véhicules et compter sur les gardes.",
          "branche": "Un garde se plante sur la bretelle, bras levés. Une voiture s'arrête à 200 mètres, une autre passe. Dix minutes plus tard, le nuage s'allume sur un pot d'échappement. Le chalumeau s'installe.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 120,
            "evacuate": false,
            "water": "aucun",
            "rescue": 250,
            "alert": 9
          }
        },
        {
          "lettre": "C",
          "texte": "Ne pas couper : le gaz brûlera au contact et le nuage se dissipera.",
          "branche": "La circulation continue. À 7 h 15, une voiture entre dans le nuage à 160 mètres de la sphère. La flamme remonte par bonds vers la raffinerie : c'est la branche réelle.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 40,
            "evacuate": false,
            "water": "aucun",
            "rescue": 100,
            "alert": 16
          }
        }
      ]
    },
    {
      "id": "etape-4",
      "heure": "07 h 15",
      "titre": "Le chalumeau",
      "situation": "La fuite brûle à la source sous la sphère 443. Les sphères 442 et 463 sont à portée de rayonnement. Moyens du site : camion poudre de 1500 kg, lances mousse, bassin de 12 000 m³, deux motopompes de 400 m³/h.",
      "question": "Sur quoi portez-vous l'effort ?",
      "reel": "Tentatives d'extinction infructueuses. Sirène à 7 h 20, pompiers extérieurs alertés à 7 h 19, arrosage des sept autres sphères. Les deux motopompes ne peuvent pas fonctionner en parallèle : débit limité à 400 m³/h. Pompiers de Lyon à 7 h 30, cinquante minutes après la fuite.",
      "lecon": "Éteindre un feu de fuite sans couper l'alimentation, c'est préparer un nouveau nuage. Et les moyens d'eau se dimensionnent sur le scénario réel, pas sur le débit nominal.",
      "options": [
        {
          "lettre": "A",
          "texte": "Refroidir les sphères voisines, laisser brûler la fuite, préparer la coupure d'alimentation.",
          "branche": "L'eau part sur les voisines, les 442 et 463 restent sous 60 degrés. La fuite brûle jusqu'à épuisement vers 10 heures. On compte des dégâts, pas des morts : les équipes sont restées à distance et l'incendie n'a pas gagné le parc.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "closed",
            "perimeter": 300,
            "evacuate": true,
            "water": "sphères",
            "rescue": 250,
            "alert": 4
          }
        },
        {
          "lettre": "B",
          "texte": "Éteindre la fuite au plus vite.",
          "branche": "La flamme s'éteint à 7 h 50, le nuage se reforme aussitôt, plus large qu'avant. Il faudra une heure pour le faire brûler proprement, et l'opération aura coûté deux brûlés graves.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 150,
            "evacuate": false,
            "water": "feu",
            "rescue": 180,
            "alert": 8
          }
        },
        {
          "lettre": "C",
          "texte": "Se rapprocher pour fermer la vanne pendant que ça brûle.",
          "branche": "Deux hommes partent avec une lance et une clé. La chaleur les arrête à quarante mètres. La sphère n'est pas refroidie, la soupape s'ouvre à 7 h 45, la torchère monte à dix mètres.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 60,
            "evacuate": false,
            "water": "feu",
            "rescue": 50,
            "alert": 10
          }
        }
      ]
    },
    {
      "id": "etape-5",
      "heure": "07 h 45",
      "titre": "La soupape",
      "situation": "La soupape de la 443 s'ouvre : torchère de dix mètres. À 8 h 15, les flammes montent à quarante mètres au-dessus d'une sphère qui n'a pas pu être refroidie. Cent cinquante-huit sauveteurs dans un rayon de cent à cent vingt mètres, quinze lances en action.",
      "question": "Comment lisez-vous l'ouverture de la soupape ?",
      "reel": "L'ouverture de la soupape est perçue comme positive : maîtrise attendue en deux à trois heures. Dès 8 h 05, amarrage des lances et repli. À 8 h 45, la 443 explose : boule de feu de près de 250 m de diamètre, plus de 400 m de haut. Tous ceux à moins de 50 m sont tués, sauf deux pompiers.",
      "lecon": "Le BLEVE était totalement inattendu. Une torchère à la soupape signale une montée en pression, donc un risque d'éclatement : on ne s'approche pas, on refroidit à distance, on évacue largement.",
      "options": [
        {
          "lettre": "A",
          "texte": "Comme un danger immédiat : évacuer à 250 ou 300 mètres, arroser les voisines à distance, amarrage des lances, retrait des personnels.",
          "branche": "L'ordre tombe à 7 h 50. À 8 h 30, il n'y a plus personne à moins de 250 mètres. À 8 h 45, la 443 éclate : une boule de feu de 250 mètres de diamètre passe au-dessus du périmètre vide. Elle ne tue personne.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "closed",
            "perimeter": 300,
            "evacuate": true,
            "water": "sphères",
            "rescue": 300,
            "alert": 4
          }
        },
        {
          "lettre": "B",
          "texte": "Comme une bonne nouvelle : la pression s'évacue, la situation est maîtrisée en deux ou trois heures.",
          "branche": "On amarre les lances et on se replie sur une ligne à cent vingt mètres. À 8 h 45, l'explosion tue tous ceux qui étaient à moins de cinquante mètres, sauf deux pompiers. C'est la branche réelle.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 120,
            "evacuate": false,
            "water": "sphères",
            "rescue": 150,
            "alert": 6
          }
        },
        {
          "lettre": "C",
          "texte": "Continuer d'arroser la 443 avec les moyens sur place.",
          "branche": "L'eau atteint mal la tôle, la vanne d'arrosage est inaccessible depuis une heure. Les équipes restent exposées à quarante mètres, la chaleur les fait reculer par vagues jusqu'à l'explosion.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "closed",
            "perimeter": 200,
            "evacuate": true,
            "water": "sphères",
            "rescue": 120,
            "alert": 6
          }
        }
      ]
    },
    {
      "id": "etape-6",
      "heure": "08 h 45",
      "titre": "Après l'explosion",
      "situation": "La 443 n'existe plus, un cratère de 35 m sur 15 s'est creusé sous la 442. Sept sphères et deux cylindres restent, plusieurs ouverts par le souffle. L'incendie gagne les bacs voisins.",
      "question": "Quelle conduite adoptez-vous ?",
      "reel": "Arrêt d'urgence à 8 h 55, zone B évacuée. La 442 explose vers 9 h 30 sans nouvelle victime. Les trois sphères de butane s'ouvrent sans exploser à 9 h 40, 9 h 50 et 10 h 30. ORSEC déclenché à 10 h 10. Lutte de plus de 24 h.",
      "lecon": "Évacuer et arroser à distance, c'est accepter de perdre des capacités pour ne pas perdre des hommes.",
      "options": [
        {
          "lettre": "A",
          "texte": "Arrêt d'urgence des unités, évacuation, arrosage à distance des capacités restantes, laisser brûler.",
          "branche": "À 8 h 55 la zone est vide et les unités à l'arrêt. La 442 éclate à 9 h 30 dans un site désert. Les sphères de butane s'ouvrent sans exploser. Le parc est perdu, les équipes sont intactes.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "closed",
            "perimeter": 400,
            "evacuate": true,
            "water": "sphères",
            "rescue": 400,
            "alert": 4
          }
        },
        {
          "lettre": "B",
          "texte": "Poursuivre l'extinction au contact pour sauver le parc.",
          "branche": "Les lances restent en ligne. Deux hommes sont brûlés par le souffle de la 442 à 9 h 30, et le parc brûle quand même : on ne sauve pas une sphère avec une lance.",
          "historique": false,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 150,
            "evacuate": false,
            "water": "feu",
            "rescue": 80,
            "alert": 8
          }
        },
        {
          "lettre": "C",
          "texte": "Attendre les consignes de la direction.",
          "branche": "Quinze minutes passent. Quand l'ordre d'évacuation arrive, la 442 est déjà sous contrainte et les équipes sont toujours dans le périmètre. Le bilan s'alourdit.",
          "historique": true,
          "effets": {
            "leak": 180,
            "closeAfter": null,
            "ignitionAfter": 44,
            "a7": "open",
            "perimeter": 100,
            "evacuate": false,
            "water": "aucun",
            "rescue": 120,
            "alert": 20
          }
        }
      ]
    },
    {
      "id": "etape-7",
      "heure": "09 h 15",
      "titre": "Le retour d'expérience",
      "situation": "Bilan réel : 18 morts dont 11 sapeurs-pompiers, 84 blessés dont 49 hospitalisés, 1 475 habitations touchées hors du site. Quelle mesure unique aurait le plus changé l'issue ?",
      "question": "Votre vote de synthèse",
      "reel": "Aucune des trois réponses n'est fausse. La réglementation de 1967 a traité les deux premières ; la connaissance du phénomène manquait ce matin-là, et ce sont les sauveteurs qui l'ont payée.",
      "lecon": "Un accident n'apprend rien s'il ne change que des textes : les textes et la formation des intervenants doivent avancer ensemble.",
      "options": [
        {
          "lettre": "A",
          "texte": "L'éloignement : distances d'implantation, éloignement de l'autoroute et des habitations.",
          "branche": "La branche de l'urbanisme : les communes passent au Rhône fin 1967, la réglementation impose des distances aux tiers, et l'autoroute cesse d'être un voisin immédiat.",
          "historique": false,
          "effets": {}
        },
        {
          "lettre": "B",
          "texte": "La conception : purges repensées, soupapes dimensionnées à l'incendie généralisé, moyens d'eau calculés sur le réel.",
          "branche": "La branche de l'ingénierie : l'arrêté de septembre 1967 réécrit le stockage, les purges, les soupapes et les moyens de lutte, avec effet rétroactif sur l'existant.",
          "historique": false,
          "effets": {}
        },
        {
          "lettre": "C",
          "texte": "La connaissance : savoir ce qu'est un BLEVE et écrire la doctrine d'intervention qui en découle.",
          "branche": "La branche de la culture : le phénomène entre dans la formation des intervenants, et la doctrine « on ne s'approche pas d'une sphère en feu » devient une évidence.",
          "historique": false,
          "effets": {}
        }
      ],
      "synthese": true
    }
  ]
};

export const history = {
  "frise": [
    {
      "heure": "06 h 30",
      "jeu": "La purge a été engagée : <choix>.",
      "reel": "À 06 h 40, la purge de prélèvement sous la sphère 443 de propane jaillit et les vannes givrent : l'aide-opérateur ouvre la vanne inférieure à moitié puis largement celle du haut, le propane éclabousse son visage, la clé mobile quitte le carré, impossible de refermer.",
      "ecart": "maîtrise"
    },
    {
      "heure": "06 h 41",
      "jeu": "La fuite a été prise en charge : <choix>.",
      "reel": "Les deux agents renoncent sans refermer la vanne inférieure et donnent l'alerte interne. L'équipe de sécurité tente dix minutes d'interrompre la fuite : vannes givrées, échec. Le nuage sort du site et descend vers l'A7 sur un à un mètre cinquante d'épaisseur.",
      "ecart": "retard"
    },
    {
      "heure": "06 h 50",
      "jeu": "Le nuage et l'autoroute ont été traités : <choix>.",
      "reel": "Poste de garde alerté à 06 h 50, employés qui tentent d'arrêter la circulation. Dix minutes pour joindre la gendarmerie, appel vers 07 h 05. À 07 h 15, une voiture entre dans le nuage malgré le signal d'arrêt d'un garde : le nuage s'allume, la flamme remonte, et le propane s'allume à la source.",
      "ecart": "conforme"
    },
    {
      "heure": "07 h 15",
      "jeu": "Le chalumeau a été combattu : <choix>.",
      "reel": "Tentatives d'extinction infructueuses. Sirène à 07 h 20, pompiers extérieurs alertés à 07 h 19, arrosage des sept autres sphères. Les deux motopompes ne peuvent pas fonctionner en parallèle : débit limité à 400 m³/h. Pompiers de Lyon à 07 h 30, cinquante minutes après la fuite.",
      "ecart": "conforme"
    },
    {
      "heure": "07 h 45",
      "jeu": "La soupape a été interprétée : <choix>.",
      "reel": "L'ouverture de la soupape est perçue comme positive : maîtrise attendue en deux à trois heures. Dès 08 h 05, amarrage des lances et repli. À 08 h 45, la 443 explose : boule de feu de près de 250 m de diamètre, plus de 400 m de haut. Tous ceux à moins de 50 m sont tués, sauf deux pompiers.",
      "ecart": "conforme"
    },
    {
      "heure": "08 h 45",
      "jeu": "L'après-explosion a été conduit : <choix>.",
      "reel": "Arrêt d'urgence à 08 h 55, zone B évacuée. La 442 explose vers 09 h 30 sans nouvelle victime. Les trois sphères de butane s'ouvrent sans exploser à 09 h 40, 09 h 50 et 10 h 30. ORSEC déclenché à 10 h 10. Lutte de plus de 24 h.",
      "ecart": "conforme"
    },
    {
      "heure": "09 h 15",
      "jeu": "Le retour d'expérience a été voté : <choix>.",
      "reel": "Aucune des trois réponses n'est fausse. La réglementation de 1967 a traité les deux premières ; la connaissance du phénomène manquait ce matin-là, et ce sont les sauveteurs qui l'ont payée.",
      "ecart": "maîtrise"
    }
  ],
  "glossaire": [
    {
      "titre": "BLEVE",
      "terme": "BLEVE",
      "texte": "BLEVE (Boiling Liquid Expanding Vapour Explosion) : éclatement d'un récipient contenant un liquide sous pression, dont la vaporisation instantanée produit une explosion massive et une boule de feu. À Feyzin, la sphère 443 de propane éclate à 08 h 45 en une boule de feu d'environ 250 m de diamètre. Phénomène alors inconnu des intervenants.",
      "definition": "BLEVE (Boiling Liquid Expanding Vapour Explosion) : éclatement d'un récipient contenant un liquide sous pression, dont la vaporisation instantanée produit une explosion massive et une boule de feu. À Feyzin, la sphère 443 de propane éclate à 08 h 45 en une boule de feu d'environ 250 m de diamètre. Phénomène alors inconnu des intervenants.",
      "notice": "BLEVE (Boiling Liquid Expanding Vapour Explosion) : éclatement d'un récipient contenant un liquide sous pression, dont la vaporisation instantanée produit une explosion massive et une boule de feu. À Feyzin, la sphère 443 de propane éclate à 08 h 45 en une boule de feu d'environ 250 m de diamètre. Phénomène alors inconnu des intervenants."
    },
    {
      "titre": "Cuvette de rétention",
      "terme": "Cuvette de rétention",
      "texte": "Bassin aménagé au pied d'un réservoir pour contenir les liquides en cas de fuite et éviter leur propagation. À Feyzin, la zone de stockage n'était qu'à 22,5 m de la tranchée de l'A7, sans rétention suffisante pour empêcher le nuage de GPL de s'écouler vers la chaussée.",
      "definition": "Bassin aménagé au pied d'un réservoir pour contenir les liquides en cas de fuite et éviter leur propagation. À Feyzin, la zone de stockage n'était qu'à 22,5 m de la tranchée de l'A7, sans rétention suffisante pour empêcher le nuage de GPL de s'écouler vers la chaussée.",
      "notice": "Bassin aménagé au pied d'un réservoir pour contenir les liquides en cas de fuite et éviter leur propagation. À Feyzin, la zone de stockage n'était qu'à 22,5 m de la tranchée de l'A7, sans rétention suffisante pour empêcher le nuage de GPL de s'écouler vers la chaussée."
    },
    {
      "titre": "Soupape de sécurité",
      "terme": "Soupape de sécurité",
      "texte": "Dispositif qui s'ouvre automatiquement lorsque la pression dans un récipient dépasse un seuil, pour évacuer le gaz et éviter l'éclatement. À Feyzin, à 07 h 45, la soupape de la sphère crache une torchère d'une dizaine de mètres, signe de la montée en pression.",
      "definition": "Dispositif qui s'ouvre automatiquement lorsque la pression dans un récipient dépasse un seuil, pour évacuer le gaz et éviter l'éclatement. À Feyzin, à 07 h 45, la soupape de la sphère crache une torchère d'une dizaine de mètres, signe de la montée en pression.",
      "notice": "Dispositif qui s'ouvre automatiquement lorsque la pression dans un récipient dépasse un seuil, pour évacuer le gaz et éviter l'éclatement. À Feyzin, à 07 h 45, la soupape de la sphère crache une torchère d'une dizaine de mètres, signe de la montée en pression."
    },
    {
      "titre": "POI et PPI",
      "terme": "POI et PPI",
      "texte": "Plan d'Opération Interne (POI) pour l'établissement, Plan Particulier d'Intervention (PPI) pour les autorités. Ils organisent la réponse aux accidents majeurs. L'accident de Feyzin a contribué à leur généralisation dans la réglementation française des installations classées, notamment pour les sites à risque industriel majeur.",
      "definition": "Plan d'Opération Interne (POI) pour l'établissement, Plan Particulier d'Intervention (PPI) pour les autorités. Ils organisent la réponse aux accidents majeurs. L'accident de Feyzin a contribué à leur généralisation dans la réglementation française des installations classées, notamment pour les sites à risque industriel majeur.",
      "notice": "Plan d'Opération Interne (POI) pour l'établissement, Plan Particulier d'Intervention (PPI) pour les autorités. Ils organisent la réponse aux accidents majeurs. L'accident de Feyzin a contribué à leur généralisation dans la réglementation française des installations classées, notamment pour les sites à risque industriel majeur."
    },
    {
      "titre": "Défense en profondeur",
      "terme": "Défense en profondeur",
      "texte": "Stratégie de sûreté fondée sur plusieurs barrières successives pour prévenir et limiter les accidents. À Feyzin, l'absence de barrières efficaces entre le stockage de GPL et l'autoroute a permis au nuage de se propager sans obstacle jusqu'à la chaussée voisine.",
      "definition": "Stratégie de sûreté fondée sur plusieurs barrières successives pour prévenir et limiter les accidents. À Feyzin, l'absence de barrières efficaces entre le stockage de GPL et l'autoroute a permis au nuage de se propager sans obstacle jusqu'à la chaussée voisine.",
      "notice": "Stratégie de sûreté fondée sur plusieurs barrières successives pour prévenir et limiter les accidents. À Feyzin, l'absence de barrières efficaces entre le stockage de GPL et l'autoroute a permis au nuage de se propager sans obstacle jusqu'à la chaussée voisine."
    },
    {
      "titre": "Zone des dangers",
      "terme": "Zone des dangers",
      "texte": "Périmètre autour d'une installation industrielle où les effets d'un accident peuvent atteindre les personnes. L'instruction technique de 1966-1967 en définit les modalités de calcul. À Feyzin, la zone de stockage n'était qu'à 22,5 m de l'autoroute, qui passait 1,50 m plus bas.",
      "definition": "Périmètre autour d'une installation industrielle où les effets d'un accident peuvent atteindre les personnes. L'instruction technique de 1966-1967 en définit les modalités de calcul. À Feyzin, la zone de stockage n'était qu'à 22,5 m de l'autoroute, qui passait 1,50 m plus bas.",
      "notice": "Périmètre autour d'une installation industrielle où les effets d'un accident peuvent atteindre les personnes. L'instruction technique de 1966-1967 en définit les modalités de calcul. À Feyzin, la zone de stockage n'était qu'à 22,5 m de l'autoroute, qui passait 1,50 m plus bas."
    }
  ],
  "reglementation": [
    {
      "annee": "1966-1967",
      "texte": "Instruction technique sur les zones de dangers",
      "effet": "Définition des modalités de calcul des zones de dangers autour des installations classées ; mise en place progressive des distances d'implantation par rapport aux tiers (date exacte de publication à confirmer)."
    },
    {
      "annee": "1967",
      "texte": "Arrêté du service des mines de l'Isère n°05460 du 2 janvier 1967",
      "effet": "Prescriptions techniques sur le stockage de GPL : purges, soupapes, moyens d'eau, distances, avec effet rétroactif sur l'existant (selon la fiche ARIA et le service des mines)."
    },
    {
      "annee": "1970",
      "texte": "Circulaire sur les plans de secours",
      "effet": "Généralisation des plans de secours pour les installations dangereuses (date précise à confirmer, valeur à confirmer)."
    },
    {
      "annee": "1976 et 1982",
      "texte": "Renforcement de la réglementation des installations classées (1976), puis directive Seveso (1982)",
      "effet": "Encadrement national et européen des établissements présentant des dangers majeurs ; plans d'opération interne et plans particuliers d'intervention (références exactes à confirmer)."
    },
    {
      "annee": "2012",
      "texte": "Directive Seveso III (transposée en droit français)",
      "effet": "Mise à jour du régime des établissements Seveso : classification des dangers, information du public, participation, plans de secours (référence exacte du texte français à confirmer)."
    }
  ],
  "sources": [
    "Fiche ARIA n°1, ministère chargé de l'environnement, septembre 2006",
    "Rapports d'experts judiciaires sur l'accident de la raffinerie de Feyzin",
    "DHYCA du 19 janvier 1966",
    "Service des mines de l'Isère, rapport n°05460 du 2 janvier 1967"
  ]
};
