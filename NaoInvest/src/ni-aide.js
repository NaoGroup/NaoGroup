/* ============================================================
   NaoInvest — « Comment ça marche » : sommaire à gauche, fiche à droite,
   recherche par mot. Même principe que l'aide de NaoBaby et NaoPets.
   Elle explique l'outil lui-même ; les leçons et le guide de l'épargne
   restent là où ils sont, et des boutons « Ouvrir » y mènent.
   blocs : p · sous · etapes · liste · astuce · prudence · aller
   Les fiches sont construites à l'ouverture : les nombres (leçons,
   fiches, mots, badges…) suivent toujours le contenu réel.
   ============================================================ */
function fichesAide() {
  const nSymboles = LINGE.reduce((t, f) => t + f.items.length, 0);
  return [
{ id: 'debut', em: '🚀', t: 'Premiers pas', chapo: 'Ce qu’il faut savoir avant tout le reste.', b: [
  ['p', 'NaoInvest, c’est <b>tout ce qu’on n’apprend pas à l’école</b>, en deux parties : la <b>vie pratique</b> d’un côté, l’<b>argent et l’épargne</b> de l’autre. On y lit, on s’exerce, on se teste — à son rythme, sans rien risquer.'],
  ['etapes', [
    'En haut, trois choix seulement : <b>🏠 Accueil</b>, <b>🧭 Vie pratique</b> et <b>💶 Éducation financière</b>.',
    'Choisissez une partie : sa page d’entrée montre toutes ses fiches en tuiles, et une deuxième rangée d’onglets apparaît juste en dessous.',
    'Ouvrez une fiche ou une leçon. Chaque leçon se termine par un <b>quiz noté sur 100</b>.',
    'Suivez votre chemin dans <b>⭐ Ma progression</b> (en haut à droite), et cherchez un mot dans le <b>📖 Dictionnaire</b>.',
  ]],
  ['liste', [
    ['🧭 Vie pratique', 'fiche de paie, impôts, conseils de vie, câbles, fièvre, symboles du linge, voyants de voiture.'],
    ['💶 Éducation financière', 'mes bases, guide de l’épargne, épargner & investir, la Bourse, portefeuille fictif, actualités, anti-arnaques.'],
    ['⭐ et 📖', 'votre progression (badges, attestations) et le dictionnaire, toujours accessibles dans la barre du haut.'],
  ]],
  ['astuce', 'Chaque fiche porte en haut un <b>bandeau de couleur</b> qui rappelle sa partie : vert d’eau pour la vie pratique, doré pour l’éducation financière. Touchez-le pour revenir à la page d’entrée de la partie.'],
  ['prudence', 'NaoInvest est un <b>outil d’éducation</b> : aucun argent réel, aucune opération, aucun conseil personnalisé. Les NaoCoins du portefeuille sont imaginaires.'],
]},

{ id: 'accueil', em: '🏠', t: 'L’accueil', chapo: 'Deux portes, et ce qui vous attend aujourd’hui.', b: [
  ['liste', [
    ['Les deux portes', 'Vie pratique et Éducation financière, avec un raccourci vers chacune de leurs fiches.'],
    ['💶 Leçon du jour', 'la suite de votre objectif si vous en avez un, sinon une notion à consolider, sinon la prochaine étoile de votre chemin. <b>Commencer →</b> l’ouvre.'],
    ['🧭 Conseil du jour', 'un réflexe de la vie courante ; <b>Pourquoi ? →</b> ouvre le conseil complet dans Conseils de vie.'],
    ['⭐ Ma progression', 'votre étape, le nombre de leçons acquises et de badges.'],
    ['🛡️ Réflexe anti-arnaque', 'une phrase à garder en tête, qui change chaque jour.'],
  ]],
  ['astuce', 'Si vous avez indiqué votre prénom (dans ⭐ Ma progression), l’accueil vous salue par votre prénom.'],
  ['aller', [['accueil', '🏠 Aller à l’accueil']]],
]},

{ id: 'lecons', em: '📚', t: 'Les leçons et leurs quiz', chapo: `${LECONS.length} leçons courtes, chacune avec son quiz.`, b: [
  ['etapes', [
    'Ouvrez une leçon : sa durée (⏱), son étape et votre meilleure note s’affichent en haut.',
    'Lisez les petites sections, l’<b>exemple</b> et l’encadré <b>À retenir</b>.',
    'Touchez <b>✏️ Passer le quiz</b>. Prenez votre temps : il n’y a aucune limite de durée.',
    '<b>Valider mes réponses</b> : chaque question est corrigée, avec son explication. Une question oubliée vous est signalée.',
  ]],
  ['liste', [
    ['La note sur 100', 'à partir de <b>70/100</b>, la leçon est <b>acquise</b> : une étoile s’allume et une petite fête apparaît. En dessous, elle passe « à revoir ».'],
    ['↻ Refaire le quiz', 'autant de fois que vous voulez : c’est votre <b>meilleure</b> note qui compte.'],
    ['Relire la leçon', 'revient au texte sans perdre le quiz.'],
    ['Leçon suivante', 'en bas de chaque leçon, pour enchaîner dans le même espace.'],
    ['Réponses en chiffres', 'certaines questions demandent un nombre : virgule ou point, les deux sont acceptés.'],
  ]],
  ['astuce', 'Une note basse n’est pas un échec : relisez les explications sous chaque erreur, puis refaites le quiz. C’est comme ça qu’on apprend.'],
]},

{ id: 'progression', em: '⭐', t: 'Ma progression', chapo: 'Votre chemin, vos badges, vos attestations.', b: [
  ['p', 'Le bouton <b>⭐</b> en haut à droite ouvre votre progression. Un petit nombre s’y affiche quand des quiz sont à refaire.'],
  ['liste', [
    ['🎯 Mon objectif', `choisissez l’un des ${PARCOURS.length} parcours et votre rythme (de 1 à 7 leçons par semaine) : la leçon du jour suivra ce parcours. Une jauge montre où vous en êtes cette semaine.`],
    ['Le défi de la semaine', 'un petit geste concret à faire dans la vraie vie. Touchez <b>J’ai relevé ce défi</b> quand c’est fait.'],
    ['Mon chemin lumineux', 'quatre étapes (Découverte, Bases, Autonomie, Approfondissement), une étoile par leçon. Une étape s’ouvre quand la précédente est acquise aux <b>deux tiers</b>. Touchez une étoile pour ouvrir sa leçon.'],
    ['Acquises · à revoir · à rafraîchir', 'les notions réussies, les quiz à refaire, et celles acquises il y a plus de deux semaines, à revoir pour ne pas les oublier.'],
    ['✍️ Mon prénom', 'pour être salué·e sur l’accueil et le voir sur vos attestations.'],
  ]],
  ['sous', 'Les parcours'],
  ['liste', PARCOURS.map(p => [`${p.e} ${p.nom}`, `${p.desc} (${p.lecons.length} leçons)`])],
  ['sous', 'Les badges'],
  ['liste', BADGES.map(b => [`${b.e} ${b.nom}`, b.desc])],
  ['sous', 'Les attestations'],
  ['p', 'Un parcours terminé débloque une <b>🎓 attestation</b>, avec vos leçons et votre note moyenne. <b>🖨️ Imprimer ou enregistrer en PDF</b> la garde en fichier. Ce n’est ni un diplôme ni une certification officielle : c’est la trace de votre chemin.'],
  ['aller', [['progression', '⭐ Ouvrir ma progression']]],
]},

{ id: 'paie', em: '💼', t: 'La fiche de paie', chapo: 'Lire une fiche, et décrypter la vôtre.', b: [
  ['liste', [
    ['🧭 Le chemin', 'des barres qui montrent comment on passe du coût pour l’employeur au brut, puis au net, puis à ce qui arrive sur votre compte.'],
    ['🔍 Ligne par ligne', 'une fiche d’exemple : touchez une ligne, son explication s’affiche à côté (en dessous sur téléphone).'],
    ['❓ Les questions qu’on se pose', 'pourquoi le net change, lequel compter, combien de temps garder ses fiches…'],
  ]],
  ['sous', 'Décrypter votre propre fiche'],
  ['etapes', [
    'Touchez <b>Choisir ma fiche de paie</b>, ou glissez le fichier dans le cadre. Un <b>PDF</b> est le plus fiable ; une <b>photo bien nette</b> marche aussi.',
    'NaoInvest repère le brut, le net avant impôt, l’impôt à la source, le net payé, le net imposable… et explique chaque ligne qu’il reconnaît.',
    'Touchez une ligne de votre fiche pour lire son explication. Les lignes en gris ne sont pas encore dans le lexique.',
    'Pas de fichier ? Ouvrez <b>Saisir 3 chiffres</b> (brut, net avant impôt, taux) et touchez <b>Décrypter</b>.',
  ]],
  ['astuce', 'Votre fiche est lue <b>uniquement dans votre navigateur</b> : elle n’est ni envoyée, ni enregistrée, et disparaît quand vous quittez la page. La toute première lecture demande une connexion Internet, pour télécharger le programme de lecture.'],
  ['aller', [['paie', '💼 Ouvrir la fiche de paie']]],
]},

{ id: 'impots', em: '🧾', t: 'Les impôts', chapo: 'Un vrai petit cours, et de quoi s’exercer.', b: [
  ['liste', [
    ['Le cours en 8 chapitres', 'à quoi servent les impôts, le calcul, le quotient familial, le prélèvement à la source, réductions et crédits, l’épargne, le logement, la déclaration. Chaque chapitre a son quiz ; le cours complet donne une attestation. Le bouton du haut reprend là où vous en étiez.'],
    ['📄 Les documents', 'déclaration, avis de situation déclarative, avis d’impôt, dégrèvement, taxe foncière, acomptes : touchez un document pour l’agrandir et savoir quoi en faire.'],
    ['🗓️ Dans quel ordre', 'la frise de l’année, des revenus perçus jusqu’à une éventuelle réclamation.'],
    ['🔍 L’avis zone par zone', 'un avis présenté comme le vrai, avec des informations inventées. Choisissez un exemple, puis touchez une zone — ou ce que vous cherchez (revenu fiscal de référence, parts, taux…) : la zone s’encadre et s’explique.'],
    ['🧮 L’atelier de calcul', 'entrez un revenu et un nombre de parts : le calcul se déroule tranche par tranche, avec le taux marginal et le taux moyen.'],
    ['Calculer mon nombre de parts', 'dans l’atelier : situation, enfants, garde alternée, parent isolé… puis <b>Utiliser ce nombre dans le calcul</b>.'],
    ['📖 Les mots de l’impôt', 'chaque mot ouvre sa définition dans le dictionnaire.'],
  ]],
  ['prudence', 'Un cours, pas un conseil fiscal : le calcul est simplifié et le barème daté. Pour votre situation, le simulateur officiel d’impots.gouv.fr fait foi.'],
  ['aller', [['impots', '🧾 Ouvrir le cours d’impôts']]],
]},

{ id: 'conseils', em: '💡', t: 'Les conseils de vie', chapo: `${tousConseils().length} repères concrets, par âge et par situation.`, b: [
  ['etapes', [
    'Choisissez un thème avec les puces du haut (18–25 ans, 25–35 ans, Famille & enfants, 35–55 ans, Impôts, Coups durs & changements), ou gardez <b>Tous</b>.',
    'Lisez <b>le réflexe</b>, puis ouvrez <b>Pourquoi, le piège, et quoi faire à la place</b>.',
    'Touchez <b>J’ai compris</b> : le compteur « conseils lus » avance. Un second toucher l’annule.',
  ]],
  ['sous', 'L’atelier voiture'],
  ['p', 'Dans le thème 18–25 ans : comparez deux choix de voiture (prix, crédit, assurance, carburant, entretien). Le tableau montre le <b>coût réel par mois</b>, la part du revenu, ce qu’il reste, et l’effet sur un <b>futur prêt immobilier</b>. Toutes les valeurs se modifient : mettez vos propres devis. Le bouton <b>🚗 Faire le calcul</b> d’un conseil y mène directement.'],
  ['aller', [['conseils', '💡 Ouvrir les conseils de vie']]],
]},

{ id: 'pratique', em: '🔌', t: 'Câbles, fièvre, linge, voyants', chapo: 'Les fiches pratiques, et leur petit jeu.', b: [
  ['liste', [
    ['🔌 Câbles & prises', `${CABLES.length} câbles dessinés, rangés par famille, avec leur usage et une astuce.`],
    ['🌡️ Fièvre', 'faites glisser le thermomètre et choisissez pour qui (bébé de moins de 3 mois, enfant, adulte, personne âgée ou fragile) : la zone de température s’affiche avec ce qu’elle veut dire. Puis les signes qui doivent faire appeler le 15, comment bien mesurer, les bons gestes.'],
    ['🧺 Symboles du linge', `${nSymboles} symboles d’étiquette : lavage, blanchiment, séchage, repassage, pressing.`],
    ['🚗 Voyants de voiture', `${VOYANTS.length} voyants classés par couleur : rouge (s’arrêter), orange (faire contrôler), vert et bleu (information).`],
  ]],
  ['sous', 'Teste-toi'],
  ['p', 'Chaque fiche se termine par un petit jeu : un dessin, quatre réponses. La bonne s’affiche avec son explication ; <b>Suivant →</b> passe au dessin d’après. Le score repart de zéro à chaque visite : c’est juste pour s’entraîner.'],
  ['prudence', 'La fiche Fièvre n’est pas un avis médical. En cas de doute, appelez votre médecin ou un pharmacien ; en urgence, le <b>15</b> ou le <b>112</b>.'],
  ['aller', [['cables', '🔌 Câbles'], ['fievre', '🌡️ Fièvre'], ['linge', '🧺 Linge'], ['voyants', '🚗 Voyants']]],
]},

{ id: 'espaces', em: '🧮', t: 'Bases, épargne, Bourse', chapo: 'Les espaces d’apprentissage de l’éducation financière.', b: [
  ['p', 'La page d’entrée <b>💶 Éducation financière</b> propose un chemin <b>« Par où commencer ? »</b> en cinq marches : tenir son budget, connaître les produits d’épargne, comprendre risque et rendement, découvrir la Bourse, s’exercer sans risque.'],
  ['liste', [
    ['🧮 Mes bases', 'revenus, dépenses, budget, épargne de précaution, découvert, crédit, inflation, projet.'],
    ['🌱 Épargner & investir', 'risque, rendement, horizon, liquidité, diversification, perte en capital, enveloppes, frais.'],
    ['📈 La Bourse', 'un escalier de leçons, de l’entreprise cotée à l’ETF, avec des exemples fictifs.'],
    ['🧭 Les parcours', 'en bas de chaque espace : <b>Commencer</b> ou <b>Continuer</b> ouvre la prochaine leçon du parcours, <b>🎯 En faire mon objectif</b> le relie à la leçon du jour.'],
  ]],
  ['aller', [['finance', '💶 Ouvrir l’éducation financière']]],
]},

{ id: 'guide', em: '🏦', t: 'Le guide de l’épargne', chapo: `${GUIDE.length} fiches, un produit par fiche.`, b: [
  ['p', 'Le guide reste votre bibliothèque pour <b>apprendre à épargner et investir</b> : livrets, épargne logement, assurance-vie, PEA, PER, épargne salariale, supports, épargne des enfants… et les placements très risqués dont il faut se méfier.'],
  ['liste', [
    ['🔺 La pyramide', 'l’ordre logique : épargne de précaution, crédits chers, projets à 2–8 ans, puis long terme.'],
    ['🗂️ Les fiches', 'rangées par famille. Touchez une fiche : pour qui, plafond, disponibilité, rémunération, fiscalité, frais, atouts, limites, vigilance et un exemple.'],
    ['📋 Le tableau comparatif', 'tous les produits sur une ligne : risque, disponibilité, plafond, fiscalité. Touchez une ligne pour ouvrir sa fiche.'],
    ['Les besoins', 'les puces filtrent les produits : disponible à tout moment, un projet dans 2 à 8 ans, le long terme, la retraite, pour les enfants.'],
  ]],
  ['astuce', 'Aucun produit n’est « le meilleur » : chacun répond à un besoin. Les montants sont ceux connus à la rédaction ; vérifiez-les sur service-public.fr ou amf-france.org.'],
  ['aller', [['guide', '🏦 Ouvrir le guide de l’épargne']]],
]},

{ id: 'portefeuille', em: '🎮', t: 'Le portefeuille fictif', chapo: `S’exercer avec ${nb(DEPART)} NaoCoins imaginaires.`, b: [
  ['etapes', [
    `Répartissez vos ${nb(DEPART)} NaoCoins entre six supports imaginaires avec les curseurs. Le total doit faire <b>100 %</b> : les espèces s’ajustent toutes seules.`,
    'Pour essayer vite, prenez un exemple : <b>Tout en espèces</b>, <b>Très répartie</b> ou <b>Tout sur une action</b>.',
    'Touchez <b>✦ Démarrer la simulation</b>.',
    'Faites passer le temps (<b>🎲 Une année</b> ou <b>Cinq années</b> au hasard), ou traversez un scénario.',
    'Lisez le <b>journal</b> : chaque étape y est expliquée. Ajoutez vos propres observations avec <b>Noter</b>.',
  ]],
  ['liste', [
    ['Les supports', ACTIFS.map(a => `${a.e} ${a.court}`).join(', ') + '.'],
    ['Les scénarios', SCENARIOS.map(s => `${s.e} ${s.nom}`).join(', ') + '.'],
    ['Les chiffres', 'valeur simulée, évolution depuis le départ, valeur corrigée de l’inflation, et la plus forte baisse traversée.'],
    ['↻ Recommencer', 'garde la simulation (avec un nom si vous voulez) dans <b>⚖️ Comparer mes choix</b>, puis repart de zéro avec une nouvelle répartition.'],
  ]],
  ['astuce', 'Essayez « Tout sur une action », puis la crise sectorielle ; recommencez en « Très répartie » avec le même scénario. La comparaison parle d’elle-même.'],
  ['prudence', 'Un modèle volontairement simplifié : la même répartition donne un autre chemin à chaque fois. Il ne prévoit rien, et aucun ordre n’est passé nulle part.'],
  ['aller', [['portefeuille', '🎮 Ouvrir le portefeuille fictif']]],
]},

{ id: 'actus', em: '📰', t: 'Les actualités', chapo: 'L’économie expliquée, datée et sourcée.', b: [
  ['p', 'NaoInvest fonctionne <b>sans connexion</b> : il ne reçoit pas les nouvelles du jour. Les fiches proposées sont des <b>événements passés</b> vérifiables, avec leurs mots difficiles et ce qu’ils peuvent changer.'],
  ['liste', [
    ['Toutes', 'la liste complète ; les puces filtrent par catégorie.'],
    ['⏱️ L’actualité en 2 minutes', 'les trois repères fiables les plus récents, en résumé.'],
    ['★ Mes favoris', 'touchez ☆ sur une actualité pour la retrouver ici.'],
    ['＋ Ajouter une actualité lue', 'résumez avec vos mots un article lu ailleurs : titre, date, catégorie, source, un mot difficile, pourquoi c’est important. Les vôtres portent « Ajoutée par moi » et peuvent être supprimées.'],
  ]],
  ['astuce', 'Une actualité venue d’un réseau social, d’un forum ou d’une source inconnue est marquée <b>⚠️ Non vérifié</b> et n’apparaît jamais dans « L’actualité en 2 minutes ».'],
  ['aller', [['actus', '📰 Ouvrir les actualités']]],
]},

{ id: 'arnaques', em: '🛡️', t: 'Anti-arnaques', chapo: 'Reconnaître les ficelles, vérifier, prendre le temps.', b: [
  ['liste', [
    ['🚨 Les signaux d’alerte', 'les promesses et les pressions qui doivent mettre la puce à l’oreille.'],
    ['✅ Avant de placer mon argent', `une checklist de ${CHECKLIST.length} questions à cocher. Tout coché, et les deux leçons réussies à 80/100 : badge 🛡️ Anti-arnaques. <b>Décocher tout</b> la remet à zéro pour un autre projet.`],
    ['🔍 À vérifier', 'les registres officiels (ORIAS, REGAFI), les listes noires de l’AMF, les documents et les frais à lire, et les numéros utiles (AMF Épargne Info Service, Info Escroqueries).'],
    ['Les leçons et le parcours', 'deux leçons avec leur quiz, et le parcours Anti-arnaques.'],
  ]],
  ['astuce', 'Le meilleur réflexe, c’est le temps : personne n’a jamais regretté d’avoir attendu une semaine de plus pour vérifier.'],
  ['aller', [['arnaques', '🛡️ Ouvrir l’anti-arnaques']]],
]},

{ id: 'dico', em: '📖', t: 'Le dictionnaire', chapo: `${DICO.length} mots, expliqués simplement.`, b: [
  ['liste', [
    ['🔎 Chercher', 'tapez un mot ou un bout de définition : la liste se filtre à chaque lettre, accents ou pas.'],
    ['L’alphabet', 'touchez une lettre pour ne voir que ses mots ; <b>Tout</b> remet la liste entière.'],
    ['Mots associés', 'sous chaque définition, d’autres mots à explorer d’un toucher.'],
  ]],
  ['astuce', 'Dans le cours d’impôts, les puces « Les mots de l’impôt » ouvrent directement leur définition ici.'],
  ['aller', [['dico', '📖 Ouvrir le dictionnaire']]],
]},

{ id: 'donnees', em: '💾', t: 'Vos données, la sauvegarde', chapo: 'Où est rangé ce que vous faites, et comment le retrouver.', b: [
  ['p', 'Tout s’enregistre <b>tout seul</b>, à chaque geste : notes des quiz, progression, objectif, défis, badges, attestations, conseils lus, checklist, favoris, actualités ajoutées, simulations et journal, prénom.'],
  ['liste', [
    ['Dans ce navigateur', 'vos données sont rangées sur cet appareil, dans ce navigateur. Rien n’est envoyé à personne.'],
    ['Avec votre profil NaoGroup', 'si vous êtes connecté·e à NaoGroup, votre progression est <b>synchronisée avec votre profil</b> : vous la retrouvez sur un autre appareil en vous connectant au même profil. Deux profils sur le même ordinateur ne voient jamais les données l’un de l’autre.'],
    ['En visite (sans compte)', 'l’outil s’ouvre vierge et rien n’est gardé d’une visite à l’autre.'],
    ['Ce qui n’est jamais gardé', 'la fiche de paie que vous importez, et les valeurs des ateliers (voiture, calcul d’impôt, parts) : elles s’effacent en quittant la page.'],
    ['Le thème et la pause des animations', 'mémorisés pour la prochaine fois.'],
    ['Garder une trace', 'les 🎓 attestations s’impriment ou s’enregistrent en PDF.'],
  ]],
  ['astuce', 'Sans profil NaoGroup, nettoyer les données du navigateur efface aussi votre progression. Connectez-vous à NaoGroup pour la garder à l’abri.'],
]},

{ id: 'reinit', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Tout effacer et repartir de zéro.', b: [
  ['p', 'Le bouton <b>♻️ Réinitialiser</b>, en haut à droite, remet NaoInvest à neuf, comme pour une nouvelle personne.'],
  ['etapes', [
    'Touchez <b>♻️ Réinitialiser</b> (sur téléphone, seul le symbole ♻️ s’affiche).',
    'Lisez ce qui sera effacé : notes, progression, badges, attestations, objectif, défis, checklist, favoris, actualités ajoutées, simulations, prénom et réglages.',
    'Pour confirmer, tapez <b>EFFACER</b> : le bouton <b>🗑 Tout effacer</b> se débloque.',
    'NaoInvest revient sur l’accueil, vierge, en thème sombre.',
  ]],
  ['liste', [
    ['Définitif', 'il n’y a pas de retour en arrière.'],
    ['Seulement NaoInvest', 'les autres outils NaoGroup ne sont pas touchés.'],
    ['Changé d’avis ?', '<b>Annuler</b>, Échap ou un toucher à côté de la fenêtre : rien n’est effacé.'],
  ]],
  ['astuce', 'Pour seulement recommencer une simulation, inutile de tout effacer : utilisez <b>↻ Recommencer une simulation</b> dans le portefeuille fictif.'],
]},

{ id: 'astuces', em: '✨', t: 'Astuces & raccourcis', chapo: 'Pour aller plus vite.', b: [
  ['liste', [
    ['F1 ou ?', 'ouvrir cette aide, depuis n’importe quelle page.'],
    ['Échap', 'fermer la fenêtre ouverte (aide, fiche, attestation…).'],
    ['🌙 / ☀️', 'l’interrupteur en haut à droite passe du thème sombre au thème clair.'],
    ['🕊️', 'met en pause les animations du décor ; un second toucher les relance.'],
    ['L’ouverture', 'l’animation d’entrée se passe d’un clic.'],
    ['Le logo', 'en haut à gauche, il ramène à l’accueil NaoGroup.'],
    ['Une page en favori', 'chaque onglet a sa propre adresse (…#guide, …#portefeuille) : ajoutez-la aux favoris de votre navigateur pour y revenir d’un clic.'],
  ]],
  ['astuce', 'Un mot vous échappe pendant une leçon ? Ouvrez 📖 en haut, cherchez-le, puis revenez : votre leçon vous attend dans son espace.'],
]},

{ id: 'limites', em: '🤍', t: 'Ce que NaoInvest ne fait pas', chapo: 'Un outil pour comprendre, pas pour décider à votre place.', b: [
  ['p', 'NaoInvest n’est ni une banque, ni un courtier, ni un conseiller financier ou fiscal. Il ne recommande l’achat, la vente ou la conservation d’<b>aucun</b> titre, ne promet aucun rendement et ne permet aucune opération réelle.'],
  ['prudence', 'Tout investissement comporte des risques, dont un risque de <b>perte en capital</b> ; les performances passées ne préjugent pas des performances futures. Avant une décision importante, consultez une source officielle ou un professionnel compétent.'],
  ['astuce', 'Les fiches de vie pratique donnent des repères généraux : elles ne remplacent ni un médecin, ni un garagiste, ni un électricien, ni votre service paie. En cas d’urgence : <b>15</b> ou <b>112</b>.'],
]},
  ];
}

function ouvrirAide(sec) {
  const AIDE = fichesAide();
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'prudence') return `<div class="aide-prudence"><span>🧭</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${esc(a)}</b> — ${b}</li>`).join('')}</ul>`;
    if (t === 'aller') return `<div class="aide-aller">${v.map(([vue, lib]) => `<button type="button" class="btn petit fin" data-vue="${vue}">${lib} →</button>`).join('')}</div>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  /* la fenêtre de l'outil (#modale), en grand : Échap, le clic à côté et « Fermer » la referment comme les autres */
  const v = $('#modale'), f = $('#modaleFen');
  f.className = 'fen aide';
  f.innerHTML = `<div class="aide-h">
      <div><h2 id="modaleTitre">❓ Comment ça marche</h2>
        <p class="aide-sous">Tout NaoInvest, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="aide-espace"></span>
      <input type="search" id="aide-q" placeholder="Chercher : quiz, badge, scénario…" aria-label="Chercher dans l’aide" autocomplete="off">
      <button type="button" class="btn fin" data-f="annuler">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b aria-hidden="true">${s.em}</b>${s.t}</button>`).join('')}
        <p class="aide-vide" id="aide-vide" hidden>Aucun sujet ne contient ce mot.</p>
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`;
  v.classList.add('ouvert'); document.body.style.overflow = 'hidden';
  $$('[data-f="annuler"]', f).forEach(b => b.addEventListener('click', fermerModale));
  const nav = $('#aide-nav', f), pan = $('#aide-p', f), q = $('#aide-q', f);
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    nav.querySelectorAll('.aide-n').forEach(b => { const on = b.dataset.s === id; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    const b = nav.querySelector('.aide-n.on'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  montrer(courant);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
  /* la recherche garde les sujets dont le texte contient les mots tapés (sans tenir compte des accents) */
  const texteDe = s => Nao_sansAccent([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const m = Nao_sansAccent(q.value.trim());
    let premier = null;
    for (const s of AIDE) {
      const ok = !m || texteDe(s).includes(m);
      nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    $('#aide-vide', f).hidden = !!premier;
    if (m && premier && (premier !== courant && nav.querySelector(`[data-s="${courant}"]`).hidden)) montrer(premier);
  });
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const b = nav.querySelector('.aide-n:not([hidden])'); if (b) montrer(b.dataset.s); } });
  /* sur ordinateur, le curseur va dans la recherche ; sur téléphone, pas de clavier qui surgit */
  setTimeout(() => (matchMedia('(pointer:fine)').matches ? q : pan).focus({ preventScroll: true }), 40);
}
ACT.aide = el => ouvrirAide(el && el.dataset ? el.dataset.s : undefined);
document.addEventListener('keydown', e => {
  const champ = e.target.matches && e.target.matches('input, textarea, select, [contenteditable]');
  if (e.key !== 'F1' && !(e.key === '?' && !champ)) return;
  e.preventDefault();
  if ($('#intro')) return;   /* l'écran d'ouverture est encore là */
  if ($('#modaleFen').classList.contains('aide') && $('#modale').classList.contains('ouvert')) return;
  ouvrirAide();
});
