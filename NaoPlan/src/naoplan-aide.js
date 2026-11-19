/* ============================================================
   NaoPlan — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoFi, NaoBaby, NaoPets ou NaoTrip : sommaire
   à gauche, fiche à droite, et une recherche qui garde les sujets
   contenant le mot tapé. La fenêtre s'ouvre dans la zone #modale de
   la page (celle de l'import et de la comparaison).
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
(function () {
  'use strict';

  const AIDE = [
    { id: 'bienvenue', em: '🏡', t: 'Bienvenue dans NaoPlan', chapo: 'Le logement que vous cherchez, dessiné, coté et meublé.',
      b: [
        ['p', 'NaoPlan transforme une description — type de bien, surface, chambres, jardin, piscine… — en <b>plans cotés</b>. Vous choisissez la variante qui vous plaît, vous la retouchez pièce par pièce, vous la meublez, vous choisissez les matières, puis vous imprimez tout en <b>PDF</b> pour en parler avec un professionnel.'],
        ['sous', 'Six étapes'],
        ['liste', [['1 · Le projet', 'son nom, le type d’opération, le calendrier, le foyer, le budget, vos envies.'],
          ['2 · Les critères', 'tout ce que vous voulez dans le détail : pièces, équipements, extérieurs, piscine, stationnement, technique.'],
          ['3 · Les plans', 'plusieurs variantes proposées, à regarder, comparer et imprimer.'],
          ['4 · Personnalisation', '<i>facultative</i> : déplacer et étirer les pièces, tirer les murs, poser portes et fenêtres, ajouter un niveau.'],
          ['5 · Aménagement', '<i>facultatif</i> : poser les meubles.'],
          ['6 · Ambiances', '<i>facultatives</i> : sols, murs, couleurs pièce par pièce, puis le récapitulatif de tout le projet.']]],
        ['p', 'Le <b>rail</b> à gauche montre où vous en êtes et mène à n’importe quelle étape d’un clic ; le <b>dock</b> en bas (Précédent / Suivant) avance pas à pas. À droite, la <b>gouttière</b> range les plans que vous gardez.'],
        ['sous', 'La barre du haut'],
        ['liste', [['↶ ↷', 'annuler la dernière modification, ou la rétablir.'],
          ['m²', 'afficher ou cacher les surfaces sur le plan.'],
          ['☀️ / 🌙', 'thème clair ou sombre.'],
          ['❓', 'cette aide.'],
          ['💾 Enregistrer · 📂 Charger', 'sauvegarder le projet dans un fichier, ou le rouvrir.'],
          ['♻️', 'réinitialiser l’outil.'],
          ['📄 Télécharger le PDF', 'imprimer le dossier ou l’enregistrer en PDF.']]],
        ['astuce', 'Tout reste dans le navigateur de cet ordinateur : rien n’est envoyé nulle part. Les plans sont <b>indicatifs</b> : la structure, les réseaux et les règles d’urbanisme restent à valider par un professionnel.'],
      ] },
    { id: 'premiers-pas', em: '🚀', t: 'Premiers pas', chapo: 'Votre premier plan en cinq minutes.',
      b: [
        ['etapes', ['<b>Étape 1 — Le projet</b> : donnez un nom (« Maison de Lucie à Nantes »), choisissez le type d’opération, et si vous voulez la date d’emménagement et la taille du foyer. Rien n’est obligatoire.',
          '<b>Étape 2 — Les critères</b> : choisissez maison, appartement ou duplex, la surface, le nombre de niveaux, de chambres, de salles de bain, puis les options (cuisine ouverte, cellier, garage, terrasse, jardin, piscine…).',
          '<b>Étape 3 — Les plans</b> : NaoPlan propose plusieurs variantes. Cliquez celle qui vous plaît : elle devient « ✓ Choisie ».',
          'Elle vous convient telle quelle ? <b>🖨️ Imprimer</b> ou <b>📄 Télécharger le PDF</b>. Vous voulez aller plus loin ? <b>✏️ Personnaliser ce plan</b> (étape 4) ou <b>🛋️ Aménager directement</b> (étape 5).',
          'Pensez à <b>💾 Enregistrer</b> de temps en temps : vous gardez une copie de votre projet dans un fichier.']],
        ['astuce', 'Vous avez déjà le plan d’un logement (une annonce, un plan d’architecte) ? À l’étape 3, <b>🖼️ J’ai déjà un plan (image)</b> le reprend pour vous — voir la fiche « Reprendre un plan existant ».'],
        ['astuce', 'Pour revoir cette aide : le bouton <b>❓</b> en haut, le lien du rail à gauche, ou la touche <kbd>F1</kbd>.'],
      ] },
    { id: 'projet', em: '🏷️', t: 'Étape 1 : le projet', chapo: 'Le cadre, avant les murs.',
      b: [
        ['liste', [['🏷️ Le projet', 'son nom (repris sur le PDF et dans la gouttière), le type d’opération — construction neuve, achat sur plan (VEFA), achat dans l’ancien, rénovation, extension — et la commune.'],
          ['📅 Le calendrier', 'le début du projet et l’emménagement souhaité ; la durée se calcule toute seule d’après les deux dates, et vous pouvez la corriger.'],
          ['👨‍👩‍👧 Le foyer', 'adultes, enfants (et leur âge), postes de télétravail, animaux, invités fréquents, besoin d’accessibilité.'],
          ['💶 Le budget', 'budget global et part travaux, à titre indicatif.'],
          ['📝 Vos envies', 'en quelques mots : « une grande pièce de vie lumineuse, une suite parentale au calme… ».']]],
        ['p', 'Ces informations ne dessinent rien : elles cadrent le projet et partent dans le <b>récapitulatif</b> (étape 6) et dans le PDF, pour la personne qui le lira.'],
        ['astuce', 'Pour étudier le financement, ouvrez NaoFi depuis NaoGroup.'],
      ] },
    { id: 'criteres', em: '📋', t: 'Étape 2 : les critères', chapo: 'Tout ce que vous voulez, dans le détail.',
      b: [
        ['p', 'Les critères sont rangés par cartes. Ceux qui changent la <b>découpe</b> du logement refont aussitôt les plans proposés ; les autres (style, matériaux, chauffage…) vont au récapitulatif.'],
        ['liste', [['🏠 Le bien', 'appartement, maison ou duplex ; surface habitable (20 à 500 m²) ; niveaux (2 pour un duplex, 1 pour un appartement) ; style, toiture, hauteur sous plafond, orientation de la pièce de vie.'],
          ['🛏️ Les chambres', 'leur nombre, la suite parentale (chambre seule, avec salle d’eau, ou avec salle d’eau et dressing — au rez ou à l’étage), dressing indépendant, chambre d’amis, placards.'],
          ['🛁 Les pièces d’eau', 'salles de bain, douche ou baignoire, WC séparé, double vasque, WC à l’étage.'],
          ['🍳 Les pièces de vie', 'forme de la cuisine, cuisine ouverte, cellier, buanderie, bureau, poêle ou cheminée, autres pièces souhaitées.'],
          ['🌳 Les extérieurs', 'terrasse et son matériau, jardin, clôture, abri, potager, arrosage (balcon pour un appartement).'],
          ['🏊 La piscine', 'forme (rectangulaire, carrée, ronde, ovale, haricot), pose (creusée, semi-enterrée, hors-sol), dimensions, profondeur, chauffage, couverture, margelle, traitement, local technique, éclairage.'],
          ['🚗 Le stationnement', 'garage (simple ou double), carport, borne de recharge, places extérieures.'],
          ['⚙️ Technique et confort', 'chauffage, menuiseries, volets, plancher chauffant, climatisation, domotique, panneaux solaires, récupérateur d’eau.'],
          ['✏️ Le dessin', 'symboles de mobilier, cotes d’ensemble, autre niveau en transparence, direction du nord.']]],
        ['p', 'Le bouton <b>↺ Repartir du programme automatique</b>, en bas, efface les pièces ajoutées et les réglages d’ouvertures faits sur les plans proposés.'],
        ['astuce', 'Changer un critère refait les propositions, mais ne touche jamais à « Mon plan » : vos retouches sont à l’abri.'],
      ] },
    { id: 'plans', em: '🧭', t: 'Étape 3 : les plans proposés', chapo: 'Regarder, comparer, choisir.',
      b: [
        ['p', 'NaoPlan essaie des centaines d’agencements et garde les meilleurs qui ne se ressemblent pas. Chaque carte montre une miniature, le nom de la variante et ce qui la distingue. Cliquez-en une pour l’afficher en grand : elle devient « <b>✓ Choisie</b> ».'],
        ['p', 'En haut, les chiffres clés : surface <b>habitable</b>, espace <b>nuit</b>, <b>emprise</b> au sol, terrasse et terrain. En dessous, le tableau des <b>surfaces</b> pièce par pièce.'],
        ['sous', 'Ce plan me convient'],
        ['liste', [['🖨️ Imprimer · 📄 Télécharger le PDF', 'tout le dossier, voir la fiche « Imprimer et PDF ».'],
          ['💾 Enregistrer le projet', 'un fichier de sauvegarde.'],
          ['📌 Garder pour comparer', 'range une copie dans la gouttière, à droite.']]],
        ['sous', 'Je veux aller plus loin'],
        ['liste', [['✏️ Personnaliser ce plan', 'passe à l’étape 4 avec cette variante.'],
          ['🛋️ Aménager directement', 'passe à l’étape 5 pour poser les meubles.'],
          ['🖼️ J’ai déjà un plan (image)', 'reprend un plan existant.']]],
        ['astuce', 'Ici, les plans se regardent sans se modifier. Les retouches se font à l’étape 4, sur une copie : « Mon plan ». Si vous en avez déjà un d’après une autre variante, NaoPlan vous demande avant de le remplacer.'],
      ] },
    { id: 'vues', em: '🧊', t: 'Plan, maquette 3D et façades', chapo: 'Trois façons de regarder la même maison.',
      b: [
        ['liste', [['📐 Plan', 'le plan coté, vu de dessus, niveau par niveau. Les couleurs disent l’usage : jour, nuit, eau, service, extérieur.'],
          ['🧊 Maquette 3D', 'la maison en volume, vue de trois quarts, avec ses meubles. Les murs sont coupés à 1,25 m pour qu’on voie l’intérieur de toutes les pièces, comme une maquette en carton.'],
          ['🏠 Façade', 'la maison vue de face, côté sud, est, nord ou ouest, avec ses fenêtres, ses portes et son toit.']]],
        ['p', 'Quand le logement a plusieurs niveaux, les onglets <b>Rez-de-chaussée</b> / <b>Étage</b> passent de l’un à l’autre.'],
        ['liste', [['L’interrupteur m²', 'en haut de la page : affiche la surface de chaque pièce sur le plan (et dans la liste des pièces).'],
          ['Le nord', 'la flèche N du plan suit le réglage « Le nord est… » de l’étape 2.'],
          ['Le jardin', 'un grand terrain est dessiné réduit autour de la maison, pour que le logement reste lisible ; sa vraie surface est écrite à côté.']]],
      ] },
    { id: 'personnaliser', em: '✏️', t: 'Étape 4 : personnaliser', chapo: 'Votre plan, retouché à la main.',
      b: [
        ['p', 'En entrant à l’étape 4, la variante choisie est <b>figée dans « Mon plan »</b>. Désormais, seule la pièce que vous touchez bouge : le reste ne se recalcule plus. Une étiquette au-dessus du plan rappelle d’où il vient (« d’après la variante A », « d’après votre image », « d’après un plan vierge »).'],
        ['sous', 'La palette d’outils'],
        ['liste', [['✋ Déplacer', 'l’outil de base : choisir, déplacer et étirer les pièces, tirer les murs, glisser portes et fenêtres.'],
          ['➕ Nouvelle pièce', 'choisissez son type, puis tirez un rectangle sur le plan.'],
          ['🧱 Tracer un mur', 'coupe une pièce en deux.'],
          ['🧽 Effacer', 'retire ce que vous visez : mur, porte, fenêtre, annexe ou meuble.'],
          ['🚪 Porte · 🪟 Fenêtre · 🌅 Baie vitrée · 🚗 Porte de garage', 'un clic sur un mur pour la poser.']]],
        ['sous', 'Sous le plan : la liste des pièces'],
        ['liste', [['Le nom', 'tapez-en un autre pour renommer la pièce.'],
          ['Le type', 'séjour, chambre, salle d’eau, escalier… Le nom suit s’il n’avait pas été changé. Un escalier peut être droit, quart tournant, demi-tournant ou en colimaçon.'],
          ['⇅', 'envoie la pièce à l’autre niveau.'],
          ['✕', 'supprime la pièce : sa place revient à une voisine quand c’est possible.'],
          ['＋ Ajouter', 'découpe une nouvelle pièce dans la pièce sélectionnée (ou l’ajoute au niveau).'],
          ['📏 Emprise du logement', 'tapez la largeur et la profondeur exactes : tous les niveaux suivent.']]],
        ['p', 'Une pièce plus étroite que l’usage courant porte la mention « étroite » : c’est un signal, jamais une interdiction. « porte sur … » indique une pièce qui s’ouvre sur une autre pièce plutôt que sur le couloir.'],
        ['sous', 'Les boutons sous la palette'],
        ['liste', [['🖼️ Importer un plan', 'reprendre un plan existant à partir d’une image.'],
          ['🧹 Plan vierge', 'repartir d’une emprise vide et tracer ses murs soi-même.'],
          ['💾 Garder ce plan', 'une copie dans la gouttière.'],
          ['＋ Dehors', 'ajouter un garage, une terrasse, un balcon, un abri, un carport ou une piscine.'],
          ['🗑️ Supprimer Mon plan', 'revenir aux plans proposés.']]],
      ] },
    { id: 'edition-libre', em: '🧩', t: 'Déplacer et étirer les pièces', chapo: 'Comme un jeu de construction : on prend, on pose, on étire.',
      b: [
        ['p', 'Avec l’outil <b>✋ Déplacer</b>, cliquez une pièce : elle se sélectionne, avec <b>huit poignées</b> sur ses bords et ses coins, et une barre apparaît sous le plan.'],
        ['liste', [['Glisser la pièce', 'prenez-la par son sol et posez-la où vous voulez sur le terrain. Les meubles que vous y avez posés la suivent. Une bulle donne sa position et ses cotes pendant le geste.'],
          ['Étirer', 'tirez une poignée : un bord pour l’allonger ou la raccourcir, un coin pour les deux à la fois. La bulle donne les cotes et la surface.'],
          ['L’aimant', 'une pièce qui approche d’un mur voisin ou du bord du terrain vient s’y coller, bord à bord, et le mur devient commun. Maintenez <kbd>Alt</kbd> pour poser librement.'],
          ['La trame', 'tout se cale sur une trame de 5 cm. Le quadrillage du terrain, tous les mètres, aide à viser ; il ne s’imprime pas.'],
          ['Les flèches', '<kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> poussent la pièce choisie de 5 cm, 50 cm avec <kbd>Maj</kbd>.']]],
        ['sous', 'La barre de la pièce'],
        ['liste', [['Le type', 'à changer dans la liste.'],
          ['L et P', 'largeur et profondeur à taper au centimètre (pour une pièce rectangulaire).'],
          ['⧉ Dupliquer', 'une copie posée juste à côté (<kbd>Ctrl</kbd>+<kbd>D</kbd>).'],
          ['⇅ Niveau', 'l’envoyer à l’autre niveau.'],
          ['✕ Enlever', 'la retirer (<kbd>Suppr</kbd>) : le vide reste, à combler avec une autre pièce ou en étirant une voisine.']]],
        ['sous', 'Dessiner une pièce neuve'],
        ['etapes', ['Choisissez l’outil <b>➕ Nouvelle pièce</b>.', 'Dans la petite liste, choisissez son type (bureau, cellier, chambre…).', 'Tirez un rectangle sur le terrain, d’au moins 80 cm de côté : la pièce se colle aux murs voisins.']],
        ['p', 'Deux pièces ne se chevauchent jamais : si la place est prise, la bulle affiche « ⛔ une pièce est déjà là ». Un <b>vide</b> entre deux pièces est permis — à vous de décider si vous le comblez. Et le <b>terrain s’agrandit</b> tout seul pour contenir ce que vous posez.'],
        ['astuce', 'Une pièce bien meublée laisse peu de sol libre à saisir. Visez un coin de sol, ou prenez sa carte dans la liste des pièces sous le plan : elle se glisse de la même façon.'],
      ] },
    { id: 'murs', em: '🧱', t: 'Les murs', chapo: 'Tirer, tracer, effacer — au millimètre si besoin.',
      b: [
        ['liste', [['Tirer un mur', 'avec ✋, survolez un mur : le curseur change. Tirez-le, la cloison se déplace comme le bord d’une fenêtre d’ordinateur. Les murs à moins de 4 cm se rejoignent d’eux-mêmes.'],
          ['Tirer une façade', 'la maison s’agrandit — à tous les niveaux à la fois, pour que les étages restent superposés.'],
          ['Un mur au millimètre', 'un clic sur un mur, sans tirer, le sélectionne : sa barre donne sa position exacte, à taper (3,245 m) ou à régler par pas de ±1 mm, ±1 cm, ±10 cm. Sur une façade, on tape directement la largeur ou la profondeur de la maison.'],
          ['🧱 Tracer un mur', 'tirez un trait dans une pièce : elle se coupe en deux, et la « Nouvelle pièce » a déjà sa porte. Un simple clic coupe la pièce dans sa longueur. Laissez au moins 30 cm de chaque côté.'],
          ['🧽 Effacer un mur', 'les deux pièces n’en font plus qu’une, quelle que soit la forme obtenue (L, T, U…). Sur une façade, le mur s’ouvre sur l’extérieur ; cliquez l’ouverture puis « 🧱 Rebâtir le mur » pour le remettre.']]],
        ['astuce', 'Le mur sélectionné s’efface aussi avec <kbd>Suppr</kbd> ou « ✕ Effacer le mur » dans sa barre.'],
      ] },
    { id: 'ouvertures', em: '🚪', t: 'Portes, fenêtres et baies', chapo: 'Les poser, les faire glisser, les retourner.',
      b: [
        ['etapes', ['Choisissez <b>🚪 Porte</b>, <b>🪟 Fenêtre</b>, <b>🌅 Baie vitrée</b> ou <b>🚗 Porte de garage</b> dans la palette.', 'Cliquez sur un mur : l’ouverture s’y pose. Recommencez autant de fois que vous voulez ; <kbd>Échap</kbd> revient à ✋.']],
        ['p', 'Avec ✋, un clic sur une ouverture la sélectionne. Glissez-la le long de son mur, ou jusqu’à un autre mur. Sa barre propose :'],
        ['liste', [['Le type', 'porte, porte d’entrée, fenêtre, baie, porte de garage, passage.'],
          ['↻ Tourner', 'quatre positions pour une porte (<kbd>R</kbd>).'],
          ['🔁 Charnière · ↔️ Sens', 'la charnière de l’autre côté, ou l’ouverture de l’autre côté du mur.'],
          ['− large · + large', 'sa largeur.'],
          ['✕ Supprimer', 'ou <kbd>Suppr</kbd>, ou la petite croix rouge sur le plan, ou l’outil 🧽.']]],
        ['astuce', 'Sur les plans proposés, NaoPlan place lui-même portes, fenêtres et baie côté terrasse. Dès que vous en touchez une, le plan est figé dans « Mon plan ».'],
      ] },
    { id: 'dehors', em: '🌳', t: 'Garage, terrasse et piscine', chapo: 'Les annexes, posées autour de la maison.',
      b: [
        ['p', 'Le garage, la terrasse, le balcon, l’abri de jardin, le carport et la piscine sont des <b>objets à part</b>, posés contre la maison ou dans le jardin.'],
        ['liste', [['＋ Dehors', 'à l’étape 4 : choisissez l’annexe dans la liste puis cliquez « ＋ Dehors » : elle se pose contre la maison.'],
          ['Déplacer', 'prenez-la par le milieu : elle s’aimante aux façades.'],
          ['Étirer', 'tirez ses bords, ou tapez ses cotes dans sa barre.'],
          ['Pivoter', '↻ Pivoter ou <kbd>R</kbd>.'],
          ['Sa barre', 'le type d’annexe ; pour un garage, le côté de sa porte ; pour une piscine, sa forme et sa pose.'],
          ['✕ Supprimer', 'ou <kbd>Suppr</kbd>.']]],
        ['p', 'La <b>piscine</b> peut être rectangulaire, carrée, ronde, ovale ou haricot, creusée, semi-enterrée ou hors-sol (la cuve, avec son échelle, apparaît en relief dans la maquette 3D). On en ajoute aussi depuis le rayon Extérieur du catalogue de meubles.'],
      ] },
    { id: 'niveaux', em: '🪜', t: 'Les niveaux et l’escalier', chapo: 'Monter d’un étage, sans rien perdre.',
      b: [
        ['liste', [['＋ Niveau', 'à l’étape 4 : ajoute un niveau au-dessus, de la même emprise. S’il y a un escalier en dessous, il arrive exactement au même endroit, et le reste forme une grande pièce à découper ensuite (avec 🧱 ou ➕). Quatre niveaux au plus.'],
          ['− Niveau', 'supprime le niveau affiché.'],
          ['⇅', 'envoie une pièce à l’autre niveau.'],
          ['La forme de l’escalier', 'droit, quart tournant, demi-tournant ou en colimaçon, dans la liste des pièces : le plan et la maquette suivent.']]],
        ['p', 'Pour un duplex, les deux niveaux partagent la même emprise : l’étage se superpose au rez, il ne flotte pas. Si les escaliers de deux niveaux ne tombent pas l’un au-dessus de l’autre, un bandeau le signale.'],
        ['astuce', 'À l’étape 2, « Voir l’autre niveau en transparence » dessine le niveau du dessous en filigrane : pratique pour aligner les murs.'],
      ] },
    { id: 'amenagement', em: '🛋️', t: 'Étape 5 : les meubles', chapo: 'Se projeter : où va le lit, la table, le canapé ?',
      b: [
        ['p', 'Au-dessus du plan, un <b>catalogue par rayon</b> : 🛏️ Chambre, 🛁 Salle d’eau, 🍳 Cuisine, 🛋️ Séjour, 🧥 Rangement, 🧺 Buanderie, 🌴 Extérieur. Chaque meuble indique ses dimensions.'],
        ['etapes', ['<b>Glissez</b> un meuble sur le plan : il se tourne dos au mur le plus proche et s’y plaque.', 'Ou <b>cliquez</b>-le dans le catalogue, puis chaque clic sur le plan en pose un ; <kbd>Échap</kbd> pour arrêter.']],
        ['sous', 'Un meuble posé'],
        ['liste', [['Glisser', 'pour le déplacer (<kbd>Alt</kbd> : sans aimant).'],
          ['Les poignées', 'pour l’étirer.'],
          ['Sa barre', 'largeur, profondeur en centimètres, angle libre en degrés.'],
          ['↻ Pivoter', 'un quart de tour (<kbd>R</kbd>).'],
          ['Les flèches', 'l’ajustent de 1 cm, 10 cm avec <kbd>Maj</kbd>.'],
          ['⧉ Dupliquer · ✕ Enlever', '<kbd>Ctrl</kbd>+<kbd>D</kbd> · <kbd>Suppr</kbd>.']]],
        ['liste', [['✨ Meubler automatiquement', 'pose un premier jeu dans chaque pièce encore vide.'],
          ['🧹 Tout enlever', 'vide le niveau de ses meubles, après confirmation.']]],
        ['p', 'Les meubles apparaissent aussi dans la maquette 3D et au PDF. Ils suivent leur pièce quand on la déplace ; quand deux pièces échangent leur place, ils déménagent avec elles. Une pièce meublée à la main perd ses symboles de mobilier automatiques.'],
        ['astuce', 'À l’étape 5, les pièces et les murs ne bougent pas : on ne déplace que ce qu’on pose (meubles, piscine, terrasse…). Pour bouger une pièce, revenez à l’étape 4 — les meubles y restent saisissables.'],
      ] },
    { id: 'ambiances', em: '🎨', t: 'Étape 6 : ambiances et récapitulatif', chapo: 'Les matières et les couleurs, puis tout le projet sur une page.',
      b: [
        ['sous', 'L’ambiance générale'],
        ['p', 'Un fil conducteur pour toute la maison : un <b>style</b>, une <b>palette</b> de couleurs et quelques mots. <b>🪄 Appliquer à toutes les pièces encore vides</b> recopie ce choix partout où rien n’est encore décidé.'],
        ['sous', 'Pièce par pièce'],
        ['p', 'Chaque pièce a sa carte, avec un <b>aperçu</b> (le sol, le mur, la palette) : style, <b>sol</b> (matière, teinte, pose), <b>murs</b> (matière, couleur, motif), plafond, palette, matières d’accent et vos mots. Les <b>inspirations</b> remplissent la carte en un clic ; <b>↺</b> efface les choix de la pièce.'],
        ['sous', 'Le récapitulatif'],
        ['p', 'En bas de l’étape 6 : tout le projet réuni — le cadre, les critères, le plan, les surfaces, l’aménagement et les ambiances. Il part aussi dans le PDF, pour l’architecte, le constructeur ou l’artisan qui le lira.'],
      ] },
    { id: 'importer', em: '🖼️', t: 'Reprendre un plan existant', chapo: 'D’une image à un plan qu’on peut retoucher.',
      b: [
        ['etapes', ['Cliquez <b>🖼️ J’ai déjà un plan (image)</b> (étape 3) ou <b>🖼️ Importer un plan</b> (étape 4), et choisissez une image par niveau (PNG, JPG…).',
          'NaoPlan lit l’image dans le navigateur : murs, pièces (une pièce en L reste une seule pièce), portes et fenêtres et, si la case est cochée, les noms écrits sur le plan.',
          'Tapez la <b>largeur réelle</b> du rez-de-chaussée : tout se cale dessus. Les autres niveaux prennent la même échelle, sauf si vous tapez la leur. La fenêtre annonce la précision (« 1 pixel ≈ 1,2 cm »).',
          'Cliquez <b>✨ Reprendre ce plan</b> : il devient « Mon plan », entièrement modifiable.']],
        ['p', 'L’image d’origine reste <b>en transparence</b> sous le plan pour vérifier : réglez son opacité, sa largeur réelle et sa position dans la barre du calque, ou cachez-la (🙈 / 👁️). « ✕ Retirer » l’enlève.'],
        ['astuce', 'La lecture vise les plans d’annonce aux murs noirs épais. Murs en biais, pièces rondes et croquis au trait fin ne sont pas lus. Une petite case en trop s’efface d’un clic avec 🧽, et chaque mur se règle ensuite au millimètre.'],
        ['p', 'La lecture des noms télécharge son moteur la première fois (il faut une connexion ce jour-là). Votre image, elle, n’est envoyée nulle part.'],
      ] },
    { id: 'gouttiere', em: '🗂️', t: 'Les plans gardés', chapo: 'Garder plusieurs idées, et les comparer.',
      b: [
        ['p', 'La <b>gouttière</b>, à droite (sous le plan sur un petit écran), range des copies de vos plans, projet par projet.'],
        ['liste', [['💾 Garder le plan affiché', 'une copie de la variante ou de « Mon plan », à l’instant. Renommez-la en cliquant son nom.'],
          ['↗ Ouvrir', 'la rouvre dans « Mon plan » (NaoPlan demande avant de remplacer le plan en cours).'],
          ['comparer', 'cochez deux plans ou plus, puis <b>⚖️ Comparer</b> : miniatures côte à côte, surface, emprise, niveaux, pièces, chambres, portes et fenêtres. 🏆 marque la plus grande surface.'],
          ['✕', 'supprime la copie de la gouttière.'],
          ['Le filtre', 'les plans de ce projet, ou de tous vos projets.']]],
        ['astuce', 'Avant un gros changement (plan vierge, nouvelle variante, import), gardez le plan actuel : il vous attendra dans la gouttière.'],
      ] },
    { id: 'imprimer', em: '📄', t: 'Imprimer et PDF', chapo: 'Un dossier propre, à emporter au rendez-vous.',
      b: [
        ['p', 'Le bouton <b>📄 Télécharger le PDF</b> ouvre la fenêtre d’impression du navigateur : choisissez <b>« Enregistrer au format PDF »</b> comme imprimante, ou votre imprimante pour du papier.'],
        ['liste', [['Les plans', 'une feuille A4 paysage par niveau, cotée, sur fond blanc.'],
          ['La maquette 3D', 'une feuille par niveau.'],
          ['La façade', 'celle que vous avez choisie dans la vue Façade.'],
          ['Surfaces et critères', 'le tableau des surfaces et vos critères.'],
          ['Le récapitulatif', 'tout le projet, ambiances comprises.']]],
        ['p', 'Le dossier reprend le plan affiché : la variante choisie à l’étape 3, « Mon plan » à partir de l’étape 4. La trame du terrain, les poignées, la gouttière et les boutons ne s’impriment pas.'],
        ['astuce', 'Chaque feuille rappelle que le plan est indicatif : surfaces mesurées d’axe en axe, hors épaisseur des cloisons et hors normes réglementaires.'],
      ] },
    { id: 'donnees', em: '💾', t: 'Sauvegarde et synchronisation', chapo: 'Où est votre projet, et comment le mettre à l’abri.',
      b: [
        ['p', 'Votre projet est enregistré <b>dans le navigateur de cet ordinateur</b>, au fil de vos modifications : vous le retrouvez à la prochaine ouverture, à la même étape.'],
        ['liste', [['💾 Enregistrer', 'télécharge un fichier <b>naoplan-(nom du projet).json</b> : critères, projet, « Mon plan » avec ses meubles, ambiances. C’est aussi votre export, à ranger en lieu sûr ou à envoyer.'],
          ['📂 Charger', 'rouvre un fichier enregistré, sur cet ordinateur ou un autre. Il <b>remplace</b> le projet en cours : enregistrez d’abord le vôtre si vous voulez le garder.'],
          ['Avec votre compte NaoGroup', 'quand vous ouvrez NaoPlan depuis NaoGroup en étant connecté·e, votre travail est aussi enregistré sur votre compte : vous le retrouvez sur un autre appareil.'],
          ['En mode visite', 'l’essai libre de NaoGroup n’enregistre rien : ce que vous dessinez disparaît en partant.']]],
        ['astuce', 'Le fichier .json ne contient ni les plans de la gouttière, ni les images importées : ceux-là restent dans le navigateur. Enregistrez avant de changer d’ordinateur, de nettoyer votre navigateur ou de réinitialiser l’outil.'],
      ] },
    { id: 'reinitialiser', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Repartir d’une page blanche, comme au premier jour.',
      b: [
        ['p', 'Le bouton <b>♻️</b> de la barre du haut rend NaoPlan <b>vierge</b>, comme pour une nouvelle personne. Une fenêtre dit d’abord exactement ce qui va disparaître :'],
        ['liste', [['🏷️ Le projet et les critères', 'nom, calendrier, foyer, budget, envies.'],
          ['✏️ Mon plan', 'ses pièces, ses niveaux et ses meubles.'],
          ['🗂️ Les plans gardés', 'toute la gouttière, tous projets confondus.'],
          ['🖼️ Les images importées', 'les calques.'],
          ['🎨 Les ambiances', 'les choix de matières.'],
          ['⚙️ Les réglages', 'le thème et l’affichage des m² reviennent par défaut.']]],
        ['etapes', ['Cliquez <b>Enregistrer le projet</b> si vous voulez pouvoir le recharger plus tard avec 📂 Charger : le fichier se télécharge et la fenêtre reste ouverte.',
          'Tapez le mot <b>EFFACER</b> : le bouton se déverrouille.',
          'Cliquez <b>♻️ Tout effacer</b> (ou Annuler pour ne rien changer). NaoPlan repart de l’étape 1.']],
        ['astuce', 'C’est définitif : la flèche ↶ ne le rattrape pas. Pour seulement revenir aux plans proposés, « 🗑️ Supprimer Mon plan » à l’étape 4 suffit.'],
      ] },
    { id: 'astuces', em: '⌨️', t: 'Astuces et raccourcis', chapo: 'Les gestes d’un logiciel de dessin.',
      b: [
        ['liste', [['<kbd>F1</kbd> ou <kbd>?</kbd>', 'ouvre cette aide ; <kbd>Échap</kbd> la ferme.'],
          ['<kbd>Ctrl</kbd>+<kbd>Z</kbd> · <kbd>Ctrl</kbd>+<kbd>Y</kbd>', 'annuler · rétablir (aussi <kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>Z</kbd>) — plan, meubles, critères, ambiances.'],
          ['<kbd>Échap</kbd>', 'arrête de poser un meuble, désélectionne, revient à l’outil ✋.'],
          ['<kbd>Suppr</kbd>', 'enlève ce qui est sélectionné : pièce, meuble, porte, fenêtre, annexe ou mur.'],
          ['<kbd>R</kbd>', 'fait tourner la porte, le meuble ou l’annexe sélectionnés.'],
          ['<kbd>Ctrl</kbd>+<kbd>D</kbd>', 'duplique la pièce ou le meuble sélectionnés.'],
          ['Les flèches', 'une pièce : 5 cm (50 cm avec <kbd>Maj</kbd>) · un meuble : 1 cm (10 cm avec <kbd>Maj</kbd>).'],
          ['<kbd>Alt</kbd> en glissant', 'pose sans aimant, au plus près de la souris.'],
          ['<kbd>Entrée</kbd>', 'valide une cote tapée dans une barre.']]],
        ['sous', 'Petits conseils'],
        ['liste', [['Commencez par les critères', 'une bonne variante de départ fait gagner beaucoup de retouches.'],
          ['Gardez souvent', '💾 Garder ce plan avant d’essayer une idée : on compare ensuite avec ⚖️.'],
          ['Les m²', 'allumez l’interrupteur m² pendant les retouches : chaque surface se met à jour en direct.'],
          ['L’écran d’ouverture', 'la feuille de calque se déroule environ trois secondes ; un clic la passe.']]],
      ] },
    { id: 'limites', em: '💬', t: 'Questions et limites', chapo: 'Ce que NaoPlan fait, et ce qu’il ne prétend pas faire.',
      b: [
        ['liste', [['Les surfaces sont-elles exactes ?', 'elles sont mesurées d’axe en axe, sans l’épaisseur réelle des cloisons : elles ne valent pas mesurage Carrez.'],
          ['Le plan est-il constructible ?', 'structure, murs porteurs, réseaux, règles d’urbanisme, accessibilité : rien de tout cela n’est vérifié. C’est une intention de programme, à valider par un professionnel.'],
          ['Mon programme ne tient pas dans la surface ?', 'NaoPlan le dit sans rien bloquer : les pièces concernées portent la mention « étroite ».'],
          ['Une pièce s’ouvre sur une autre pièce ?', 'certains programmes serrés le demandent ; c’est écrit sur sa carte (« porte sur … »). Déplacez-la ou ajoutez un passage.'],
          ['Je ne peux pas modifier le plan ?', 'à l’étape 3, les plans proposés se regardent seulement : passez à l’étape 4 (✏️ Personnaliser).'],
          ['Ma pièce ne bouge pas ?', 'une autre pièce est sans doute sur le chemin (« ⛔ une pièce est déjà là ») : déplacez-la d’abord, ou passez par un vide.'],
          ['Mes retouches ont disparu après un changement de critère ?', 'non : les critères refont les propositions, pas « Mon plan ». Revenez à l’étape 4 pour le retrouver.'],
          ['« Mémoire pleine » ?', 'les images importées prennent de la place dans le navigateur : retirez un calque, et pensez à 💾 Enregistrer.']]],
      ] },
  ];

  const $ = s => document.querySelector(s);
  const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const zone = () => document.getElementById('modale');
  const ouverte = () => { const z = zone(); return !!(z && z.classList.contains('on') && z.querySelector('.modale.aide')); };

  function bloc([t, v]) {
    if (t === 'p') return '<p>' + v + '</p>';
    if (t === 'sous') return '<h4>' + v + '</h4>';
    if (t === 'astuce') return '<div class="aide-astuce"><span>💡</span><div>' + v + '</div></div>';
    if (t === 'exemple') return '<div class="aide-ex"><span>🧩</span><div>' + v + '</div></div>';
    if (t === 'etapes') return '<ol class="aide-etapes">' + v.map(x => '<li>' + x + '</li>').join('') + '</ol>';
    if (t === 'liste') return '<ul class="aide-liste">' + v.map(([a, b]) => '<li><b>' + a + '</b> — ' + b + '</li>').join('') + '</ul>';
    return '';
  }
  const fiche = s => '<article class="aide-fiche"><h3><span class="aide-em">' + s.em + '</span>' + s.t + '</h3>' +
    '<p class="aide-chapo">' + s.chapo + '</p>' + s.b.map(bloc).join('') + '</article>';
  const texteDe = s => sansAccent([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));

  let retour = null;   // l'élément qui avait la main, pour la lui rendre à la fermeture

  function ouvrirAide(sec) {
    const z = zone();
    if (!z) return;
    /* Une autre fenêtre est ouverte (import, comparaison, réinitialisation) :
       on ne l'écrase pas, son travail serait perdu. */
    if (z.classList.contains('on') && !ouverte()) return;
    retour = document.activeElement;
    z.innerHTML = '<div class="modale-fond"><div class="modale aide" role="dialog" aria-modal="true" aria-labelledby="aide-titre">' +
      '<div class="aide-h"><div><h2 id="aide-titre">❓ Comment ça marche</h2>' +
      '<p class="aide-sous">Tout NaoPlan, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>' +
      '<input type="search" id="aide-q" placeholder="Chercher : mur, meuble, PDF…" aria-label="Chercher dans l’aide" autocomplete="off">' +
      '<button type="button" class="btn" data-aide-fermer>Fermer</button></div>' +
      '<div class="aide-corps"><nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">' +
      AIDE.map(s => '<button type="button" class="aide-n" data-s="' + s.id + '"><b>' + s.em + '</b>' + s.t + '</button>').join('') +
      '</nav><div class="aide-p" id="aide-p" tabindex="0"></div></div></div></div>';
    z.classList.add('on');
    const nav = z.querySelector('#aide-nav'), pan = z.querySelector('#aide-p'), q = z.querySelector('#aide-q');
    let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
    const montrer = id => {
      courant = id;
      pan.innerHTML = fiche(AIDE.find(x => x.id === id));
      pan.scrollTop = 0;
      nav.querySelectorAll('.aide-n').forEach(b => b.classList.toggle('on', b.dataset.s === id));
      const actif = nav.querySelector('.aide-n.on');
      if (actif && actif.scrollIntoView) actif.scrollIntoView({block: 'nearest', inline: 'nearest'});
    };
    montrer(courant);
    nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
    /* La recherche garde les sujets dont le texte contient les mots tapés. */
    q.addEventListener('input', () => {
      const m = sansAccent(q.value);
      let premier = null;
      AIDE.forEach(s => {
        const ok = !m || texteDe(s).includes(m);
        nav.querySelector('[data-s="' + s.id + '"]').hidden = !ok;
        if (ok && !premier) premier = s.id;
      });
      nav.classList.toggle('rien', !premier);
      if (m && premier && premier !== courant) montrer(premier);
    });
    setTimeout(() => { if (window.matchMedia('(min-width: 761px)').matches) q.focus(); else pan.focus(); }, 60);
  }

  function fermerAide() {
    const z = zone();
    if (!ouverte()) return;
    z.classList.remove('on');
    z.innerHTML = '';
    if (retour && retour.focus && document.contains(retour)) retour.focus();
    retour = null;
  }

  /* Le bouton ❓, le lien du rail, et la fermeture. Le clic sur le fond
     sombre est déjà pris en charge par la page (il vide #modale). */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-aide]');
    if (a) { e.preventDefault(); ouvrirAide(a.getAttribute('data-aide') || undefined); return; }
    if (e.target.closest('[data-aide-fermer]')) fermerAide();
  });

  /* Le clavier. Écouté en premier (phase de capture) : tant que l'aide est
     ouverte, les raccourcis du plan (Suppr, flèches, R, Ctrl+Z…) ne doivent
     pas agir sur la pièce sélectionnée derrière la fenêtre. */
  window.addEventListener('keydown', e => {
    if (ouverte()) {
      if (e.key === 'Escape') { e.preventDefault(); fermerAide(); }
      else if (e.key === 'F1') e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (document.getElementById('intro')) return;
    const saisie = e.target.matches && e.target.matches('input, textarea, select, [contenteditable]');
    if (e.key === 'F1' || (e.key === '?' && !saisie && !e.ctrlKey && !e.metaKey && !e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      ouvrirAide();
    }
  }, true);

  window.NaoPlanAide = {ouvrir: ouvrirAide, fermer: fermerAide};
})();
