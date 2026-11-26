/* ============================================================
   NaoTrip — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoFi, NaoBaby et NaoPets : sommaire à gauche,
   fiche à droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
'use strict';
const AIDE = [
  { id: 'bienvenue', em: '🧭', t: 'Bienvenue dans NaoTrip', chapo: 'Préparez le départ, profitez du voyage.',
    b: [
      ['p', 'NaoTrip organise vos <b>voyages</b> : un week-end, une sortie, des vacances en couple, entre amis ou en famille, un déplacement. Il tient le <b>planning</b> des journées, les <b>réservations</b>, la <b>valise</b>, le <b>budget partagé</b>, les <b>papiers</b> et les idées de visites — puis garde les <b>souvenirs</b> au retour et colorie votre <b>globe</b> des pays visités.'],
      ['sous', 'Les onglets'],
      ['liste', [['🏠 Accueil', 'le voyage affiché d’un coup d’œil : compte à rebours, budget, valise, réservations, planning, ce qu’il ne faut pas oublier.'],
        ['🧭 Mes voyages', 'tous vos départs : à venir, en projet, passés.'],
        ['🗓️ Planning', 'jour par jour, les activités, les réservations et les idées programmées.'],
        ['🎫 Réservations', 'vols, trains, hôtels, billets… et leur vue chronologique.'],
        ['🧳 Valise', 'la liste des affaires, par catégorie et par voyageur.'],
        ['💶 Budget', 'le prévu, le dépensé, et qui rembourse qui.'],
        ['✅ Préparation', 'les documents, les tâches à faire avant le départ et les horaires clés.'],
        ['💡 Idées', 'visites, restaurants et activités à ne pas manquer.'],
        ['📇 Infos utiles', 'adresses, numéros et liens.'],
        ['📸 Carnet souvenir', 'photos, notes et lieux préférés.'],
        ['🌍 Mon globe', 'les pays visités, à venir et rêvés.']]],
      ['astuce', 'Tout reste dans le navigateur de cet ordinateur, et le globe fonctionne même sans connexion. Le sélecteur 🧭 en haut de page choisit le voyage affiché dans tous les onglets.'],
    ] },
  { id: 'premiers-pas', em: '🚀', t: 'Premiers pas', chapo: 'Cinq minutes pour préparer votre premier départ.',
    b: [
      ['etapes', ['Cliquez <b>✈️ Créer un voyage</b>. Seul le <b>nom</b> est obligatoire ; ajoutez si vous voulez la destination, le type de voyage, les dates de départ et de retour et l’<b>heure de départ</b>.',
        'Tapez les <b>pays</b> visités et les <b>voyageurs</b> : un nom puis <kbd>Entrée</kbd> pour chacun. « Moi » est déjà là, vous pouvez le renommer ou le retirer avec ✕.',
        'Choisissez la <b>monnaie</b> du budget, puis <b>Créer le voyage</b>. NaoTrip ajoute tout seul une liste de <b>documents</b> à vérifier et de <b>tâches</b> à faire avant le départ.',
        'Ajoutez vos <b>réservations</b> (🎫) : elles se placent dans le planning, la chronologie et, si vous le voulez, dans le budget.',
        'Préparez la <b>valise</b> avec ✨ Liste de base, notez les <b>idées</b> de visites, puis cochez au fil des jours.']],
      ['sous', 'Voir un exemple'],
      ['p', 'Tant que vous n’avez aucun voyage, le bouton <b>🗺️ Voir un exemple</b> charge un week-end à Lisbonne (vol, hôtel, planning, budget partagé entre Camille et Alex…), un été en Grèce déjà passé et quelques pays sur le globe. Ce sont des voyages comme les autres : supprimez-les dans 🧭 Mes voyages (🗑) quand vous avez fait le tour, ou repartez de zéro avec 🧹.'],
      ['astuce', 'Pour revoir cette aide à tout moment : le bouton ❓ en haut de page, ou la touche <kbd>F1</kbd>.'],
    ] },
  { id: 'accueil', em: '🏠', t: 'L’accueil', chapo: 'Votre voyage, d’un seul coup d’œil.',
    b: [
      ['p', 'En haut, trois raccourcis : <b>✈️ Créer un voyage</b>, <b>🎫 Ajouter une réservation</b> et <b>🧳 Préparer ma valise</b>. En dessous, les cartes du voyage affiché :'],
      ['liste', [['Mon prochain voyage', 'son type, ses dates, sa destination, ses voyageurs et ses pays. Une étiquette dit où il en est : J-12, Demain, En cours, Terminé ou En projet (sans dates). Le crayon ✎ le modifie.'],
        ['Le compte à rebours', 'jours, heures, minutes et secondes jusqu’au départ — à la seconde près si vous avez indiqué l’heure de départ. Pendant le voyage : « Jour 2 sur 4 ». Après : un raccourci vers le carnet souvenir.'],
        ['Le petit avion', 'il avance sur sa ligne entre le jour où vous avez créé le voyage et le départ.'],
        ['Mon budget voyage', 'prévu, dépensé, la jauge, ce qui reste et la part par personne ; ＋ Dépense pour en noter une.'],
        ['Ma valise', 'le pourcentage prêt et les prochaines affaires à cocher, directement depuis l’accueil.'],
        ['Mes réservations', 'les prochains horaires (départ, embarquement, check-in…) ; touchez-en un pour le modifier.'],
        ['Ma carte du monde', 'vos pays en couleur ; cliquez un pays pour le marquer.'],
        ['Le planning des journées', 'une colonne par jour (J1, J2…) avec ＋ pour ajouter une activité ; aujourd’hui est mis en avant.'],
        ['À ne pas oublier avant le départ', 'les documents et les tâches pas encore cochés, et les horaires importants à venir, avec le pourcentage de préparation (valise, documents et tâches réunis).']]],
    ] },
  { id: 'voyages', em: '✈️', t: 'Mes voyages', chapo: 'Tous vos départs au même endroit.',
    b: [
      ['p', 'L’onglet <b>🧭 Mes voyages</b> range vos voyages en trois groupes : <b>En cours & à venir</b>, <b>En projet</b> (pas encore de dates) et <b>Mes voyages passés</b>. Chaque carte rappelle les dates, les voyageurs, le nombre de réservations, le budget et les pays.'],
      ['liste', [['Ouvrir', 'affiche ce voyage dans tous les onglets.'],
        ['✎ Modifier', 'nom, destination, type, dates, heure de départ, monnaie, pays, voyageurs et notes.'],
        ['⧉ Dupliquer', 'repart d’un voyage existant : la valise, les documents et les tâches sont repris tout décochés, les idées remises « à programmer ». Les dates, réservations, dépenses, planning et souvenirs repartent à vide.'],
        ['🗑 Supprimer', 'efface le voyage et tout son contenu, après confirmation. Un bouton <b>Annuler</b> apparaît quelques secondes en bas de l’écran.']]],
      ['sous', 'Le voyage affiché'],
      ['p', 'Le menu <b>🧭</b> en haut de page passe d’un voyage à l’autre. À l’ouverture, NaoTrip affiche de lui-même le prochain voyage (ou celui en cours).'],
      ['sous', 'Les types de voyage'],
      ['p', '🏖️ Vacances · 🧳 Week-end · 💞 En couple · 🥂 Entre amis · 👨‍👩‍👧 En famille · 🎒 En solo · 🎡 Sortie · 💼 Déplacement. Le type donne son emoji au voyage et, pour « En famille », coche d’avance l’option Enfants de la liste de valise.'],
      ['astuce', 'Une seule date (ou la même au départ et au retour) fait un voyage d’une journée : parfait pour une sortie. Le planning affiche au plus trois mois de journées.'],
    ] },
  { id: 'planning', em: '🗓️', t: 'Le planning', chapo: 'Jour par jour, sans rien oublier.',
    b: [
      ['p', 'Dès que le voyage a des dates, le planning montre une carte par journée : <b>J1</b>, <b>J2</b>… Tout s’y range par heure, et la journée d’aujourd’hui est signalée.'],
      ['liste', [['Vos activités', 'avec <b>＋ Ajouter au planning</b> (ou le ＋ d’une journée) : un titre, un type (🏛️ visite, 🍽️ repas, 🎈 activité, 🚆 trajet, 🌿 détente, 🌙 soirée, 📌 autre), le jour, l’heure, le lieu et des notes. Cochez-les une fois faites.'],
        ['Les réservations', 'elles apparaissent toutes seules au bon jour, marquées 🎫 — y compris le check-in et le check-out de l’hébergement.'],
        ['Les idées programmées', 'une idée à laquelle vous donnez un jour s’y ajoute, marquée 💡.']]],
      ['p', 'En bas de page, <b>Idées pas encore programmées</b> liste vos envies sans date : <b>Programmer</b> leur choisit un jour et une heure.'],
      ['astuce', 'Une journée vide affiche « Journée libre » : flâner compte aussi ☀️. Pas encore de dates ? Le bouton <b>Choisir les dates</b> ouvre le voyage.'],
    ] },
  { id: 'reservations', em: '🎫', t: 'Les réservations', chapo: 'Billets, hôtels et horaires, rangés et à portée de main.',
    b: [
      ['p', 'Cliquez <b>＋ Ajouter une réservation</b> et choisissez le type : ✈️ vol, 🚆 train, 🚗 voiture / location, 🚌 bus / navette, ⛴️ bateau / ferry, 🏨 hébergement, 🎟️ activité / billet, 🍽️ restaurant ou 📌 autre. Le formulaire s’adapte :'],
      ['liste', [['Transports', 'départ, arrivée, embarquement, terminal / porte / voie, lieu de départ et d’arrivée.'],
        ['Hébergement', 'check-in, check-out et adresse.'],
        ['Pour tous', 'n° de réservation, téléphone, lien vers la réservation, prix et notes.']]],
      ['sous', 'Le lien avec le budget'],
      ['p', 'Quand une réservation a un prix, la case <b>« Compter ce prix dans les dépenses du budget »</b> (cochée d’office) crée une dépense liée, dans la bonne catégorie, payée par le premier voyageur. Changer le prix d’un côté le change de l’autre ; décocher la case retire la dépense.'],
      ['sous', 'La vue chronologique'],
      ['p', 'À droite, tous les horaires dans l’ordre, jour par jour : départs, 🛫 embarquements, 🛬 arrivées, check-in et 🔑 check-out. Le prochain est marqué <b>Prochain</b>, ceux déjà passés s’estompent. Touchez une ligne pour modifier la réservation.'],
      ['astuce', 'Collez le lien de votre réservation : « Ouvrir la réservation ↗ » la retrouve en un clic. Son adresse, son téléphone et son lien sont aussi repris dans 📇 Infos utiles.'],
    ] },
  { id: 'valise', em: '🧳', t: 'La valise', chapo: 'Partir sans rien oublier, revenir sans rien laisser.',
    b: [
      ['p', 'Les affaires sont rangées par catégorie : 🪪 papiers & argent, 👕 vêtements, 🧴 toilette, 💊 santé, 🔌 électronique, 🏖️ plage & soleil, 🧸 enfants, 🎒 divers. L’anneau montre le pourcentage prêt ; cochez au fur et à mesure.'],
      ['sous', '✨ La liste de base'],
      ['etapes', ['Cliquez <b>✨ Liste de base</b>.', 'Choisissez le <b>climat</b> (tempéré, chaud, froid) et ce qui est <b>au programme</b> : plage / piscine, randonnée, sorties habillées, enfants, avion, voiture.', 'NaoTrip ajoute une liste adaptée à la durée du voyage (le nombre de sous-vêtements, de hauts…), sans jamais créer de doublon. Ajustez-la ensuite à votre goût.']],
      ['liste', [['＋ Ajouter', 'une affaire, sa catégorie, une quantité et, s’il y a plusieurs voyageurs, pour qui.'],
        ['Pour qui', 'les boutons à gauche n’affichent que la valise d’un voyageur (plus ce qui est pour tout le monde).'],
        ['↺ Tout décocher', 'remet tout à zéro pour préparer la valise du retour.']]],
      ['astuce', 'Les options Avion et Voiture sont cochées d’avance si le voyage a un vol ou une location de voiture, et Enfants pour un voyage en famille. Quand tout est coché : « Valise bouclée ! 🎉 ».'],
    ] },
  { id: 'budget', em: '💶', t: 'Le budget et les dépenses', chapo: 'Ce qu’on prévoit, ce qu’on dépense, et comment être quittes.',
    b: [
      ['p', 'Tout le budget d’un voyage se compte dans <b>sa monnaie</b>, choisie à la création (euro, dollar, livre, franc suisse, yen, dirham…). NaoTrip ne convertit pas les monnaies.'],
      ['liste', [['✎ Budget prévisionnel', 'combien prévoir pour chaque poste : 🚆 transport, 🏨 hébergement, 🍽️ restauration, 🎟️ activités & visites, 🛍️ shopping & souvenirs, ✨ divers.'],
        ['＋ Ajouter une dépense', 'son libellé, son montant, sa date, sa catégorie, qui l’a payée et entre qui elle est partagée.'],
        ['Les chiffres clés', 'le budget prévu, le dépensé, ce qui reste (ou le dépassement), la dépense par jour et par personne.'],
        ['Prévu et dépensé', 'une jauge par catégorie ; elle passe en alerte quand le prévu est dépassé.'],
        ['Les dépenses', 'le tableau complet ; touchez une ligne pour la modifier. Celles qui viennent d’une réservation portent l’étiquette 🎫.']]],
      ['sous', 'Répartition entre voyageurs'],
      ['p', 'Avec au moins deux voyageurs, NaoTrip calcule pour chacun ce qu’il a <b>payé</b>, sa <b>part</b> et son <b>solde</b> (+ on lui doit, − il doit). « <b>Pour être quittes</b> » donne les remboursements à faire, avec le moins de virements possible.'],
      ['exemple', 'Camille paie le vol (298 €), Alex l’hôtel (405 €), tout est partagé à deux : Camille rembourse 53,50 € à Alex, et tout le monde est quitte.'],
      ['astuce', 'Une dépense qui ne concerne que certains voyageurs (un musée, un cadeau) : décochez les autres dans « Partagé entre ».'],
    ] },
  { id: 'preparation', em: '✅', t: 'La préparation', chapo: 'Les papiers, les tâches, les horaires : prêt·e le jour J.',
    b: [
      ['sous', '🪪 Documents importants'],
      ['p', 'Chaque nouveau voyage part avec une liste : carte d’identité, passeport, assurance voyage, billets, permis de conduire, réservation de l’hébergement, carte européenne d’assurance maladie, carte bancaire. Cochez ce qui est vérifié, retirez ce qui ne sert pas (✕), ajoutez le reste (visa, carte grise…).'],
      ['p', 'Pour un document, vous pouvez préciser <b>pour qui</b>, sa <b>date de validité</b> et une note (« rangé dans la pochette bleue »). S’il expire avant la fin du voyage, NaoTrip vous prévient ⚠️.'],
      ['sous', '✅ Tâches de préparation'],
      ['p', 'Elles se placent <b>J-x</b> avant le départ : vérifier les papiers (J-30), l’assurance (J-21), prévenir la banque et faire garder les animaux (J-7), télécharger les cartes hors-ligne (J-3), s’enregistrer en ligne et préparer les billets (J-1). Leur date se calcule toute seule, avec « aujourd’hui » ou « en retard » si besoin. 0 = le jour du départ.'],
      ['sous', '⏰ Horaires importants'],
      ['p', 'Le départ de la maison (date et heure du voyage), puis tous les horaires des réservations dans l’ordre. Touchez-en un pour le modifier.'],
    ] },
  { id: 'idees', em: '💡', t: 'Les idées', chapo: 'Les envies d’abord, le programme ensuite.',
    b: [
      ['p', 'Trois colonnes : 🏛️ <b>visites</b>, 🍽️ <b>restaurants</b>, 🎈 <b>activités</b>. Pour chaque idée : un nom, une adresse, un lien, un prix indicatif, pourquoi on veut y aller, et ❤️ <b>coup de cœur</b> pour celles à ne pas manquer (elles passent en tête).'],
      ['liste', [['💭 Idée', 'une envie, pas encore datée.'],
        ['🗓️ Prévu', 'vous lui avez donné un jour (bouton 🗓️) : elle entre dans le planning.'],
        ['✓ Fait', 'c’est fait ! Le bouton ↺ la remet en idée.']]],
      ['astuce', 'Notez les idées au fil des lectures et des conseils, sans vous soucier du jour : le planning vous montrera ensuite celles qui attendent encore une place.'],
    ] },
  { id: 'infos', em: '📇', t: 'Les infos utiles', chapo: 'Les adresses et les numéros, au bon endroit le moment venu.',
    b: [
      ['liste', [['📍 Adresses', 'hôtel, gare, restaurants… Un clic ouvre l’adresse sur une carte en ligne.'],
        ['☎️ Numéros utiles', 'urgences, hôtel, taxi, ambassade… Sur téléphone, un clic appelle.'],
        ['🔗 Liens', 'sites de réservation, billets, applis de transport…']]],
      ['p', 'Le bloc <b>Depuis les réservations</b> reprend tout seul l’adresse, le téléphone et le lien de vos réservations : inutile de les recopier. En bas, un rappel des <b>numéros d’urgence</b> (112 partout en Europe ; en France 15, 17, 18).'],
    ] },
  { id: 'souvenirs', em: '📸', t: 'Le carnet souvenir', chapo: 'Une page par moment, pour le relire avec plaisir.',
    b: [
      ['etapes', ['Cliquez <b>＋ Nouvelle page</b> : un titre, une date, une humeur (😍 🤩 😌…), un lieu et ce que vous voulez vous rappeler.',
        'Enregistrez : NaoTrip vous propose aussitôt d’ajouter des <b>photos</b> (jusqu’à 8 à la fois). Elles sont réduites avant d’être gardées.',
        'Cochez <b>❤️ Un de nos lieux préférés</b> : le lieu rejoint « Nos lieux préférés » en haut du carnet.']],
      ['liste', [['📷 Photos', 'ajoute des photos à une page ; s’il y en a déjà, propose aussi de toutes les retirer.'],
        ['Agrandir', 'cliquez une photo pour la voir en grand, et encore une fois (ou <kbd>Échap</kbd>) pour la fermer.'],
        ['✎ Modifier', 'change le texte, la date, l’humeur ou le lieu, ou supprime la page.']]],
      ['astuce', 'Les photos prennent de la place dans le navigateur. Si NaoTrip annonce que la mémoire est pleine, retirez quelques photos et pensez à 💾 sauvegarder.'],
    ] },
  { id: 'globe', em: '🌍', t: 'Mon globe', chapo: 'Le monde que vous avez vu, et celui qui vous attend.',
    b: [
      ['p', 'Le globe tourne tout seul. <b>Glissez</b> pour le faire tourner, utilisez la <b>molette</b> ou les boutons ＋ / － pour zoomer, ⟳ pour lancer ou arrêter la rotation. La bascule <b>🗺️ Carte à plat</b> montre le monde entier d’un coup.'],
      ['sous', 'Marquer un pays'],
      ['p', 'Cliquez un pays (sur le globe, la carte ou celle de l’accueil) : une bulle propose <b>✓ Visité</b>, <b>📍 À venir</b>, <b>♡ En rêve</b> ou <b>○ Pas encore</b>. Vous pouvez aussi taper son nom dans <b>Chercher un pays…</b> puis choisir ✓ Visité ou 📍 À venir.'],
      ['sous', 'Les pays de vos voyages'],
      ['p', 'Les pays notés dans un voyage se placent tout seuls : <b>à venir</b> avant le départ, <b>visités</b> dès qu’il commence, <b>en rêve</b> tant qu’il n’a pas de dates. Leur bulle indique « Ajouté par le voyage … ». Le statut le plus avancé l’emporte ; choisissez <b>○ Pas encore</b> pour en retirer un.'],
      ['liste', [['Les chiffres', 'pays visités, à venir, en rêve, et le pourcentage du monde exploré (sur 195 pays).'],
        ['Les listes', 'touchez un pays pour que le globe se tourne vers lui ; ✕ le retire.'],
        ['Continents explorés', 'combien de pays vus sur chaque continent.']]],
    ] },
  { id: 'donnees', em: '💾', t: 'Sauvegarde et synchronisation', chapo: 'Où sont vos voyages, et comment les mettre à l’abri.',
    b: [
      ['p', 'Vos voyages, photos comprises, sont enregistrés <b>dans le navigateur de cet ordinateur</b>, au fil de vos modifications : rien à faire pour les garder d’une fois sur l’autre.'],
      ['liste', [['💾 Sauvegarder', 'télécharge un fichier <b>NaoTrip-sauvegarde-(date).json</b> avec tous vos voyages, votre globe et vos photos. C’est aussi votre export : gardez-le en lieu sûr (clé USB, autre ordinateur).'],
        ['📂 Recharger', 'rouvre un fichier de sauvegarde, sur cet ordinateur ou un autre. Après confirmation, il <b>remplace</b> les voyages actuels ; un bouton Annuler permet de revenir en arrière quelques secondes.'],
        ['Avec votre compte NaoGroup', 'quand vous ouvrez NaoTrip depuis NaoGroup en étant connecté·e, vos voyages sont aussi enregistrés sur votre compte : vous les retrouvez sur un autre appareil.'],
        ['En mode visite', 'l’essai libre de NaoGroup n’enregistre rien : ce que vous saisissez disparaît en partant.']]],
      ['astuce', 'Faites une sauvegarde de temps en temps, et toujours avant de changer d’ordinateur, de nettoyer votre navigateur ou de réinitialiser l’outil.'],
    ] },
  { id: 'reinitialiser', em: '🧹', t: 'Réinitialiser l’outil', chapo: 'Repartir d’une page blanche, comme au premier jour.',
    b: [
      ['p', 'Le bouton <b>🧹</b> en haut de page rend NaoTrip vierge, comme pour un nouvel utilisateur. Une fenêtre vous dit exactement ce qui va partir :'],
      ['liste', [['Tous vos voyages', 'avec leur planning, leurs réservations, leur valise, leur budget, leur carnet souvenir et leurs photos.'],
        ['Votre globe', 'les pays marqués à la main.'],
        ['Vos préférences', 'le thème clair / sombre et la pause des animations.']]],
      ['etapes', ['Cliquez <b>💾 Sauvegarder d’abord</b> si vous voulez pouvoir tout retrouver plus tard : le fichier se télécharge et la fenêtre reste ouverte.',
        'Cliquez <b>Tout effacer</b> (ou Annuler pour ne rien changer).',
        'NaoTrip revient à l’accueil, vierge. Un bouton <b>Annuler</b> reste quelques secondes en bas de l’écran pour rattraper une fausse manœuvre (le thème, lui, est à rechoisir).']],
      ['astuce', 'Pour retirer un seul voyage (par exemple l’exemple de Lisbonne), inutile de tout réinitialiser : 🧭 Mes voyages → 🗑 sur sa carte.'],
    ] },
  { id: 'affichage', em: '🎨', t: 'Affichage et animations', chapo: 'NaoTrip à votre goût.',
    b: [
      ['liste', [['☾ / ☀', 'l’interrupteur en haut à droite bascule entre le thème sombre et le thème clair ; NaoTrip s’en souvient.'],
        ['🕊️', 'met en pause les animations : motifs et avions du décor, rotation du globe, et l’écran d’ouverture est sauté. Un second clic les relance.'],
        ['L’écran d’ouverture', 'la carte d’embarquement tamponnée dure environ trois secondes ; un clic la passe.'],
        ['Retour à NaoGroup', 'le logo NaoTrip ou la pastille NaoGroup ramènent à l’accueil de la suite.']]],
      ['astuce', 'Si votre ordinateur demande moins d’animations (réglage d’accessibilité), NaoTrip le respecte de lui-même.'],
    ] },
  { id: 'astuces', em: '✨', t: 'Astuces', chapo: 'Les petits gestes qui font gagner du temps.',
    b: [
      ['liste', [['<kbd>F1</kbd> ou <kbd>?</kbd>', 'ouvre cette aide ; <kbd>Échap</kbd> ferme une fenêtre, une photo agrandie ou la bulle d’un pays.'],
        ['Plusieurs voyageurs ou pays d’un coup', 'séparez-les par des virgules : « Camille, Alex, Inès ». <kbd>Retour arrière</kbd> dans un champ vide retire le dernier.'],
        ['Annuler', 'après une suppression, le bouton Annuler du message en bas de l’écran rattrape l’erreur.'],
        ['Un voyage qui revient', 'chaque année au même endroit ? ⧉ Dupliquez-le : valise, papiers et idées sont prêts.'],
        ['L’heure de départ', 'indiquez-la dans le voyage pour un compte à rebours à la seconde.'],
        ['Réservations d’abord', 'elles remplissent le planning, la chronologie, le budget et les infos utiles en une seule saisie.'],
        ['Cliquer partout', 'presque tout se modifie d’un clic : une ligne de dépense, un horaire, une activité du planning.']]],
    ] },
  { id: 'questions', em: '💬', t: 'Questions fréquentes', chapo: 'Les petites choses qu’on se demande.',
    b: [
      ['liste', [['Le compte à rebours n’apparaît pas ?', 'le voyage n’a pas encore de date de départ : ✎ Modifier pour en choisir une.'],
        ['Mes journées ne s’affichent pas dans le planning ?', 'même réponse : le planning a besoin des dates du voyage.'],
        ['Je ne vois pas le bon voyage ?', 'choisissez-le dans le menu 🧭 en haut de page.'],
        ['Le prix d’une réservation n’est pas dans le budget ?', 'ouvrez la réservation et cochez « Compter ce prix dans les dépenses du budget ».'],
        ['La répartition entre voyageurs est vide ?', 'il faut au moins deux voyageurs dans le voyage (✎ Modifier).'],
        ['Un pays est sur mon globe sans que je l’aie marqué ?', 'il vient d’un de vos voyages. Choisissez ○ Pas encore dans sa bulle pour le retirer.'],
        ['Mes dépenses sont dans une autre monnaie ?', 'chaque voyage a une seule monnaie, sans conversion : changez-la dans ✎ Modifier si besoin.'],
        ['« La mémoire du navigateur est pleine » ?', 'les photos prennent de la place : retirez-en quelques-unes du carnet, puis réessayez.']]],
    ] },
];

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🧩</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  const fen = $('#modaleFen');
  fen.classList.add('aide');
  ouvrirModale(`<div class="aide-h">
      <div><h2 id="modaleTitre">❓ Comment ça marche</h2>
        <p class="aide-sous">Tout NaoTrip, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <input type="search" id="aide-q" placeholder="Chercher : valise, budget, globe…" aria-label="Chercher dans l’aide" autocomplete="off">
      <button type="button" class="btn petit" data-act="fermer-aide">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`);
  /* la fenêtre d'aide est plus large que les formulaires : la classe part à la fermeture */
  fermetureModale = () => fen.classList.remove('aide');
  const nav = fen.querySelector('#aide-nav'), pan = fen.querySelector('#aide-p'), q = fen.querySelector('#aide-q');
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    nav.querySelectorAll('.aide-n').forEach(b => b.classList.toggle('on', b.dataset.s === id));
    const actif = nav.querySelector('.aide-n.on');
    if (actif && actif.scrollIntoView) actif.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  montrer(courant);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
  /* la recherche garde les sujets dont le texte contient les mots tapés */
  const texteDe = s => sansAccent([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const m = sansAccent(q.value);
    let premier = null;
    for (const s of AIDE) {
      const ok = !m || texteDe(s).includes(m);
      nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    nav.classList.toggle('rien', !premier);
    if (m && premier && premier !== courant) montrer(premier);
  });
}
ACT['aide'] = el => { fermerBullePays(); ouvrirAide(el && el.dataset ? el.dataset.s : undefined); };
ACT['fermer-aide'] = () => fermerModale();
document.addEventListener('keydown', e => {
  if (document.getElementById('intro')) return;
  const saisie = e.target.matches && e.target.matches('input, textarea, select, [contenteditable]');
  if (e.key === 'F1' || (e.key === '?' && !saisie)) {
    e.preventDefault();
    if ($('#modale').classList.contains('ouvert') && $('#modaleFen').classList.contains('aide')) return;
    if ($('#modale').classList.contains('ouvert')) fermerModale();
    ouvrirAide();
  }
});
