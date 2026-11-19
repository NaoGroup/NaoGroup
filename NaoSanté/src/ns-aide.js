/* ============================================================
   NaoSanté — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoFi, NaoBaby et NaoPets : sommaire à gauche,
   fiche à droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
const AIDE = [
  { id: 'bienvenue', em: '🌿', t: 'Bienvenue dans NaoSanté', chapo: 'Prenez soin de votre rythme : un compagnon doux pour votre bien-être au quotidien.',
    b: [
      ['p', 'NaoSanté vous aide à <b>vous organiser</b> et à <b>vous suivre</b> : hydratation, sommeil, activité, routine souplesse, séances chronométrées, habitudes, mini-défis, rendez-vous, rappels, humeur, objectifs, notes privées et mémo. Tout est réparti en dix espaces, accessibles par les onglets sous l’en-tête.'],
      ['sous', 'Ce que NaoSanté ne fait jamais'],
      ['liste', [['Pas de diagnostic', 'NaoSanté ne dit jamais ce que vous avez.'],
        ['Pas de traitement', 'il ne recommande aucun médicament, aucune dose, aucun horaire.'],
        ['Pas de promesse', 'les objectifs sont les vôtres ; il n’y a ni bonne ni mauvaise valeur.'],
        ['Pas à la place d’un professionnel', 'pour toute question de santé, parlez-en à votre médecin ou à votre pharmacien.']]],
      ['astuce', 'En cas d’urgence : <b>15</b> (SAMU) ou <b>112</b>. Ce rappel figure aussi en bas de chaque page.'],
    ] },
  { id: 'demarrer', em: '🚀', t: 'Premiers pas', chapo: 'Trois minutes pour bien démarrer.',
    b: [
      ['etapes', ['Ouvrez <b>⚙️ Mes réglages</b> : votre prénom (pour un bonjour personnalisé), vos verres d’eau par jour, vos heures de sommeil, vos minutes d’activité par semaine… Ce sont vos objectifs à vous.',
        'Sur l’accueil, cliquez <b>✨ Commencer avec 5 habitudes douces</b> — ou ajoutez les vôtres avec <b>✅ Ajouter une habitude</b>.',
        'Au fil de la journée, touchez <b>💧 Boire un verre d’eau</b> et cochez vos habitudes.',
        'Le matin, <b>🌙 Noter ma nuit</b> : l’heure de coucher et celle du réveil suffisent.',
        'Notez vos prochains <b>rendez-vous</b> de santé et les <b>rappels</b> à ne pas oublier (renouveler une ordonnance…).']],
      ['p', 'C’est tout : les séries, les moyennes, la progression de vos objectifs et les graphiques se calculent tout seuls.'],
      ['sous', 'Se repérer'],
      ['p', 'Les <b>onglets</b> mènent aux dix espaces ; les liens <b>Détails →</b> et <b>Tous →</b> des cartes de l’accueil aussi. Chaque espace a sa propre adresse (par exemple <code>#sommeil</code>) : vous pouvez la garder en favori.'],
      ['astuce', 'Une hésitation ? Le bouton rond <b>❓</b> en haut (ou la touche <kbd>F1</kbd>) rouvre cette aide à tout moment.'],
    ] },
  { id: 'accueil', em: '🏠', t: 'L’accueil « Aujourd’hui »', chapo: 'Votre journée en un coup d’œil.',
    b: [
      ['liste', [['Le bonjour', 'la date, un salut selon l’heure et une phrase d’encouragement ; le bouton ↻ en propose une autre.'],
        ['Le cercle', 'le pourcentage de vos habitudes du jour déjà cochées.'],
        ['Les quatre grands boutons', 'ajouter une habitude, un rendez-vous, une activité, ou boire un verre d’eau, en un clic.'],
        ['Mon énergie du jour', 'de « Faible » à « Très bonne ». Recliquez pour effacer.'],
        ['Mon hydratation', 'la goutte qui se remplit et les verres à toucher.'],
        ['Mes habitudes du jour', 'les six premières, à cocher.'],
        ['Mon sommeil', 'votre dernière nuit, avec la moyenne sur 7 jours.'],
        ['Mes rendez-vous à venir', 'les trois prochains, et vos rappels en attente.'],
        ['Mon activité de la semaine', 'les minutes de lundi à dimanche, face à votre objectif.'],
        ['Mon objectif en cours', 'celui que vous avez marqué d’une ⭐.'],
        ['Un petit défi', 'le mini-défi du jour.']]],
      ['astuce', 'À minuit, « Aujourd’hui » passe tout seul au jour suivant, même si NaoSanté reste ouvert.'],
    ] },
  { id: 'hydratation', em: '💧', t: 'L’hydratation', chapo: 'Un verre après l’autre, à votre rythme.',
    b: [
      ['p', 'Chaque clic sur <b>💧 Boire un verre d’eau</b> (ou <b>＋ 1 verre</b>) ajoute un verre ; <b>− 1</b> en retire un. Vous pouvez aussi <b>toucher directement un verre</b> de la rangée pour indiquer combien vous en avez bu ; toucher le dernier verre rempli le retire.'],
      ['liste', [['La goutte', 'se remplit au fil des verres, jusqu’à 100 % de votre objectif.'],
        ['En litres', 'calculés avec la taille de votre verre (250 ml par défaut).'],
        ['La série 🔥', 'le nombre de jours d’affilée où l’objectif est atteint.'],
        ['Mes 7 derniers jours', 'la moyenne, la série, les objectifs atteints sur 30 jours et un graphique avec la ligne de l’objectif.']]],
      ['astuce', 'Les besoins varient d’une personne à l’autre : réglez votre nombre de verres et leur taille dans ⚙️, librement.'],
    ] },
  { id: 'sommeil', em: '🌙', t: 'Le sommeil', chapo: 'Le coucher, le réveil, et le rythme qui se dessine.',
    b: [
      ['p', 'Cliquez <b>🌙 Noter ma nuit</b> et indiquez le <b>jour du réveil</b>, l’heure de coucher et l’heure de réveil. Le ressenti au réveil (de « Agitée » à « Excellente ») et une note sont facultatifs. La durée se calcule toute seule, même quand le coucher a lieu avant minuit.'],
      ['exemple', 'Couché·e mardi à 23 h 30, réveillé·e mercredi à 7 h : la nuit se range au mercredi, et compte 7 h 30.'],
      ['liste', [['Mon objectif', 'les heures visées et l’heure de coucher visée (dans ⚙️), avec le nombre de nuits sur 7 qui l’atteignent.'],
        ['Cette semaine', 'la durée moyenne, l’heure de coucher moyenne et la <b>régularité</b> : l’écart moyen, en minutes, entre vos couchers.'],
        ['Mes 14 dernières nuits', 'un graphique en heures, avec la ligne de votre objectif.'],
        ['Mon carnet de nuits', 'les dix dernières ; ✏️ pour corriger ou supprimer.']]],
      ['astuce', 'Une seule nuit par jour : noter de nouveau le même jour de réveil met à jour la nuit existante.'],
    ] },
  { id: 'activite', em: '🏃', t: 'L’activité', chapo: 'Bouger un peu, c’est déjà bouger.',
    b: [
      ['p', 'Dans <b>🏃 Activité & souplesse</b>, l’<b>Ajout rapide</b> propose marche, gymnastique, musculation, course, vélo, yoga, étirements, danse, natation ou autre. Indiquez la date, la durée en minutes, l’intensité ressentie (douce, modérée ou soutenue) et une note si vous voulez.'],
      ['liste', [['Ma semaine', 'le total de lundi à dimanche face à votre objectif hebdomadaire (150 min par défaut), avec le détail par activité.'],
        ['Mes dernières activités', 'les douze plus récentes ; ✏️ pour modifier ou supprimer.']]],
      ['astuce', 'La routine souplesse et les séances chronométrées comptent elles aussi dans vos minutes de la semaine.'],
    ] },
  { id: 'souplesse', em: '🙆', t: 'La routine souplesse', chapo: 'Quelques gestes doux, guidés pas à pas.',
    b: [
      ['p', 'NaoSanté propose une routine de six gestes simples (nuque, épaules, dos, flexion, cuisses, respiration). Elle est entièrement modifiable : ✏️ sur un geste pour changer son nom, sa durée, son symbole ou son conseil, <b>＋ Un geste</b> pour en ajouter.'],
      ['etapes', ['Cliquez <b>▶ Commencer la routine</b>.', 'Un anneau compte les secondes de chaque geste, avec son conseil et le geste suivant.', '<b>⏸ Pause</b>, <b>Passer ›</b> ou <b>Arrêter</b> quand vous voulez.', 'À la fin, la routine est notée pour aujourd’hui.']],
      ['p', 'Vous l’avez faite sans le minuteur ? <b>✓ Marquer faite</b> suffit. La série 🔥 compte les jours d’affilée.'],
      ['astuce', 'Allez-y en douceur, sans forcer ni à-coups, et arrêtez si c’est inconfortable ou douloureux.'],
    ] },
  { id: 'seances', em: '⏱️', t: 'Les séances chronométrées', chapo: 'Des séries, des pauses — le minuteur s’occupe du reste.',
    b: [
      ['p', 'Dans <b>🏃 Activité & souplesse</b>, la carte <b>⏱️ Mes séances chronométrées</b> propose des exemples : Réveil musculaire, Renforcement maison, Fractionné doux, Gainage express, Marche active. <b>▶ Lancer</b> les démarre tels quels ; <b>＋ Garder et adapter</b> les copie dans vos séances pour les modifier.'],
      ['sous', 'Créer sa séance'],
      ['p', 'Avec <b>＋ Créer une séance</b> : un nom, l’activité dans laquelle elle compte, un symbole, un temps de préparation et une pause entre deux exercices. Pour chaque exercice : le nombre de <b>séries</b>, l’effort en <b>secondes</b> ou en <b>répétitions</b>, et la <b>pause</b> entre les séries. Les flèches ↑ ↓ changent l’ordre, ✕ retire un exercice ; la durée estimée s’affiche au fur et à mesure.'],
      ['sous', 'Pendant la séance'],
      ['liste', [['Préparez-vous → Effort → Pause', 'l’anneau décompte chaque étape, avec l’exercice suivant.'],
        ['Les bips', 'trois petits bips avant la fin de chaque étape ; 🔊 / 🔇 pour couper le son. Le téléphone vibre aussi, s’il le permet.'],
        ['En répétitions', 'pas de compte à rebours : faites vos répétitions puis touchez <b>✓ Série terminée</b>.'],
        ['+15 s', 'allonge une pause ou une préparation.'],
        ['⏸ Pause, Passer ⏭, ■ Arrêter', 'à tout moment. L’écran reste allumé pendant la séance, si l’appareil le permet.']]],
      ['p', 'À la fin, la séance est <b>notée dans votre activité</b> et dans « Mes dernières séances ». Arrêtée en route ? <b>Garder ce qui a été fait</b> la note quand même.'],
      ['sous', 'Le minuteur fractionné'],
      ['exemple', 'Effort 30 s, pause 15 s, 8 tours : ▶ Démarrer, et NaoSanté enchaîne les tours après 5 secondes de préparation. Vos derniers réglages sont gardés.'],
      ['astuce', 'Les séances proposées sont des exemples à adapter. Échauffez-vous, bougez à votre rythme et arrêtez-vous en cas de douleur ou de malaise.'],
    ] },
  { id: 'habitudes', em: '✅', t: 'Habitudes et mini-défis', chapo: 'Cochez ce que vous avez fait : les séries se construisent toutes seules.',
    b: [
      ['sous', 'Les habitudes'],
      ['p', 'Une habitude, c’est un nom et un symbole : « Boire un verre d’eau au réveil », « Marcher », « Me coucher plus tôt »… Cochez-la chaque jour où vous l’avez faite ; la série <b>🔥</b> compte les jours consécutifs.'],
      ['liste', [['Les 7 pastilles', 'dans <b>✅ Habitudes & défis</b>, elles montrent vos 7 derniers jours : touchez-en une pour corriger un oubli.'],
        ['Suggestions', 'cinq habitudes douces à ajouter d’un clic.'],
        ['Mettre en pause', 'dans ✏️ : l’habitude ne compte plus dans la journée, mais ses séries sont gardées. Elle reste visible sous « En pause ».'],
        ['Supprimer', 'dans ✏️, avec un bouton <b>Annuler</b> pendant quelques secondes.']]],
      ['astuce', 'Une nouvelle habitude ne compte qu’à partir du jour où vous l’avez créée : vos jours passés ne baissent pas.'],
      ['sous', 'Les mini-défis'],
      ['p', 'Huit petits défis doux (boire un verre d’eau, marcher 15 minutes, s’étirer, respirer calmement, faire une vraie pause, prendre l’air, se coucher plus tôt, relâcher ses épaules). Le <b>défi du jour</b> change chaque matin ; <b>Je le fais</b> le marque relevé. Tous les autres restent disponibles, aucun n’est obligatoire.'],
      ['exemple', 'Relever le défi « Boire un verre d’eau » ajoute aussi un verre à votre hydratation du jour.'],
    ] },
  { id: 'rdv', em: '📅', t: 'Rendez-vous et rappels', chapo: 'Médecin, dentiste, optique, suivi… et tout ce qu’il ne faut pas oublier.',
    b: [
      ['sous', 'Les rendez-vous'],
      ['p', 'Choisissez le type (médecin, dentiste, ophtalmologie / optique, suivi / contrôle, kiné / soins, autre), puis l’intitulé, la date, l’heure, avec qui, le lieu et une note (documents à apporter, questions à poser…). Les rendez-vous <b>à venir</b> sont triés par date ; les <b>passés</b> restent en dessous.'],
      ['sous', 'Les rappels'],
      ['p', 'Renouveler une ordonnance, prendre rendez-vous, effectuer un contrôle, ou tout autre rappel, avec une date « à faire avant le ». Cochez-le quand c’est fait : il passe dans « Faits récemment ». Une date dépassée s’affiche en rose, « à faire ».'],
      ['astuce', 'Les boutons <b>Idées de rappels</b> préremplissent le texte : il ne reste qu’à choisir la date.'],
    ] },
  { id: 'humeur', em: '😊', t: 'Humeur et énergie', chapo: 'Un petit mot pour vous, chaque jour. Personne d’autre ne le lit.',
    b: [
      ['liste', [['Mon énergie', 'quatre niveaux, de 🪫 Faible à ✨ Très bonne (aussi sur l’accueil).'],
        ['Mon humeur', 'cinq niveaux, de 😔 Difficile à 😄 Excellente.'],
        ['Mon ressenti du jour', 'quelques lignes libres : ce qui vous a fait du bien, ce qui vous a pesé… puis <b>Enregistrer</b>.'],
        ['Mon journal', 'les 14 derniers jours, avec l’énergie et l’humeur moyennes sur 7 jours.']]],
      ['p', 'Un clic sur le niveau déjà choisi l’efface.'],
      ['astuce', 'Si vous traversez une période difficile, n’hésitez pas à en parler à un proche ou à un professionnel.'],
    ] },
  { id: 'objectifs', em: '🎯', t: 'Les objectifs', chapo: 'Des objectifs personnels et bienveillants, qui avancent tout seuls.',
    b: [
      ['p', 'Cliquez <b>🎯 Nouvel objectif</b> ou une des <b>Idées d’objectifs</b>, puis ajustez l’intitulé, la cible et, si vous voulez, une date de fin.'],
      ['liste', [['🌙 Mieux dormir', 'nuits sur les 7 derniers jours qui atteignent vos heures cibles.'],
        ['🙆 Améliorer ma souplesse', 'jours d’étirements ou de yoga cette semaine.'],
        ['🏃 Bouger davantage', 'minutes d’activité cette semaine.'],
        ['💧 Boire plus d’eau', 'jours sur 7 où vous avez bu au moins la cible.'],
        ['🎯 Objectif personnel', 'à découper en <b>étapes</b> à cocher ; la progression suit les étapes faites.']]],
      ['p', 'L’étoile <b>⭐</b> choisit l’objectif affiché sur l’accueil. Dans ✏️, <b>Archiver</b> le range sous « Archivés » sans le perdre.'],
      ['astuce', 'Choisissez une cible douce : on peut toujours l’ajuster ensuite.'],
    ] },
  { id: 'progression', em: '📈', t: 'La progression', chapo: 'Regarder le chemin parcouru, sans jugement.',
    b: [
      ['p', 'Choisissez <b>Semaine</b> ou <b>Mois</b>, puis ‹ et › pour remonter dans le temps (<b>Revenir à aujourd’hui</b> vous ramène au présent).'],
      ['liste', [['Les chiffres', 'verres par jour suivi, sommeil moyen, minutes d’activité, habitudes réalisées, énergie moyenne et mini-défis relevés.'],
        ['Les graphiques', 'hydratation, sommeil et activité, jour par jour, avec vos objectifs.'],
        ['Les habitudes', 'en barres sur la semaine ; sur le mois, un calendrier dont la couleur s’intensifie avec la part d’habitudes cochées.']]],
    ] },
  { id: 'notes', em: '🔒', t: 'Notes privées et mémo', chapo: 'Des informations à garder sous la main — rien de plus.',
    b: [
      ['sous', 'Mes notes privées'],
      ['p', 'Elles sont <b>désactivées par défaut</b>. Si vous le souhaitez, <b>Activer mes notes privées</b> permet de noter votre groupe sanguin, vos allergies, les traitements à ne pas oublier, d’autres informations (médecin traitant, mutuelle…) et vos <b>contacts d’urgence</b>, dont le numéro s’appelle d’un toucher sur téléphone.'],
      ['liste', [['Flouter à l’ouverture', 'pour les regards par-dessus l’épaule ; 👁️ Afficher / 🙈 Masquer.'],
        ['Effacer mes notes privées', 'les supprime toutes, après confirmation.']]],
      ['sous', 'Mon mémo médicaments & vitamines'],
      ['p', 'Une liste pour ne pas oublier : le nom tel qu’indiqué sur la boîte ou l’ordonnance, une catégorie (médicament, vitamine / complément, autre), une note et les moments de la journée. Cochez chaque jour ce qui est pris ; tout se décoche le lendemain.'],
      ['astuce', 'Le mémo sert uniquement à ne rien oublier : NaoSanté ne donne aucun conseil sur les médicaments, les doses ou les horaires. Suivez toujours les indications de votre médecin ou de votre pharmacien.'],
    ] },
  { id: 'reglages', em: '⚙️', t: 'Réglages et confort', chapo: 'Un outil à votre mesure.',
    b: [
      ['liste', [['⚙️ Mes réglages', 'prénom, verres d’eau par jour, taille d’un verre, heures de sommeil et heure de coucher visées, minutes d’activité et séances d’étirements par semaine.'],
        ['A+', 'agrandit le texte.'],
        ['🕊️', 'met en pause les animations du décor (et passe l’animation d’ouverture).'],
        ['☾ / ☀', 'bascule entre le thème sombre et le thème clair.']]],
      ['p', 'Ces choix sont gardés pour vos prochaines visites.'],
    ] },
  { id: 'donnees', em: '💾', t: 'Sauvegarde et synchronisation', chapo: 'Ce qui est gardé, où, et comment le mettre à l’abri.',
    b: [
      ['p', 'Tout ce que vous saisissez est enregistré automatiquement dans ce navigateur, sur cet appareil. Il n’y a pas de bouton « Enregistrer » général.'],
      ['liste', [['💾 Sauvegarder', 'télécharge un fichier <code>NaoSante-sauvegarde-…naosante</code> avec tout votre suivi.'],
        ['📂 Recharger', 'ouvre une sauvegarde, sur cet appareil ou un autre. Elle remplace le suivi actuel ; un bouton <b>Annuler</b> permet de revenir en arrière pendant quelques secondes.'],
        ['Avec NaoGroup', 'si vous êtes connecté·e à votre profil NaoGroup, votre suivi y est synchronisé : vous le retrouvez sur vos autres appareils.'],
        ['Plusieurs fenêtres', 'NaoSanté ouvert deux fois se met à jour tout seul de l’une à l’autre.']]],
      ['astuce', 'Faites une sauvegarde de temps en temps, et toujours avant de changer d’ordinateur ou de nettoyer votre navigateur.'],
    ] },
  { id: 'reinitialiser', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Repartir de zéro, comme au premier jour.',
    b: [
      ['p', 'Le bouton <b>♻️</b> en haut efface <b>définitivement</b> tout ce qui a été saisi dans NaoSanté : hydratation, sommeil, activités, routine souplesse, séances, habitudes et séries, rendez-vous, rappels, humeur, objectifs, notes privées, mémo et réglages — ainsi que le thème, le texte agrandi et la pause des animations.'],
      ['etapes', ['Cliquez <b>♻️</b> : une fenêtre explique ce qui sera effacé.',
        'Conseil : cliquez d’abord <b>Sauvegarder</b> pour garder une copie, rechargeable plus tard avec 📂.',
        'Tapez <b>EFFACER</b> dans le champ pour confirmer.',
        'Cliquez <b>🗑 Tout effacer</b> : NaoSanté redevient vierge et vous ramène sur « Aujourd’hui ».']],
      ['astuce', 'Pour effacer seulement vos notes privées, utilisez plutôt <b>Effacer mes notes privées</b> dans 🔒 Notes & mémo. Pour un seul élément, le bouton <b>Supprimer</b> de sa fenêtre ✏️ suffit.'],
    ] },
  { id: 'astuces', em: '💡', t: 'Astuces et questions', chapo: 'Les petites choses qu’on se demande.',
    b: [
      ['sous', 'Raccourcis'],
      ['liste', [['<kbd>F1</kbd> ou <kbd>?</kbd>', 'ouvrir cette aide.'],
        ['<kbd>Échap</kbd>', 'fermer la fenêtre ouverte (un clic à côté aussi).'],
        ['Un clic sur l’écran d’ouverture', 'entrer tout de suite dans l’outil.']]],
      ['sous', 'Questions fréquentes'],
      ['liste', [['J’ai supprimé quelque chose par erreur ?', 'cliquez <b>Annuler</b> dans le message qui apparaît en bas, juste après.'],
        ['J’ai oublié de cocher une habitude hier ?', 'dans ✅ Habitudes & défis, touchez la pastille du jour concerné.'],
        ['Une habitude a disparu de la journée ?', 'elle est peut-être en pause : regardez sous « En pause ».'],
        ['Ma nuit n’apparaît pas « cette nuit » ?', 'vérifiez qu’elle est rangée au jour du réveil.'],
        ['Le son du minuteur ne marche pas ?', 'vérifiez le bouton 🔊 de la carte des séances et le volume de l’appareil.'],
        ['Un doute sur votre santé ?', 'parlez-en à votre médecin ou à votre pharmacien ; en cas d’urgence, le 15 ou le 112.']]],
    ] },
];

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🌱</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3 class="aide-titre"><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  ouvrirModale(`<div class="aide-h">
      <div><h3 id="modaleTitre">❓ Comment ça marche</h3>
        <p class="sous" style="margin:2px 0 0">Tout l’outil, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="spacer"></span>
      <input type="search" id="aide-q" placeholder="Chercher : sommeil, séance, sauvegarde…" aria-label="Chercher dans l’aide">
      <button type="button" class="btn fin petit" data-f="fermer-aide">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`, fen => {
    fen.classList.add('aide');
    const nav = fen.querySelector('#aide-nav'), pan = fen.querySelector('#aide-p'), q = fen.querySelector('#aide-q');
    let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
    const montrer = id => {
      courant = id;
      pan.innerHTML = fiche(AIDE.find(x => x.id === id));
      pan.scrollTop = 0;
      nav.querySelectorAll('.aide-n').forEach(b => b.classList.toggle('on', b.dataset.s === id));
      const actif = nav.querySelector('.aide-n.on');
      if (actif && nav.scrollWidth > nav.clientWidth) actif.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    montrer(courant);
    nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
    fen.querySelector('[data-f="fermer-aide"]').addEventListener('click', fermerModale);
    /* la recherche : on garde les sujets dont le texte contient les mots tapés */
    const sansAccents = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').toLowerCase();
    const texteDe = s => sansAccents([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
    const rien = document.createElement('p');
    rien.className = 'aide-rien'; rien.hidden = true; rien.textContent = 'Aucun sujet ne contient ce mot. Essayez un autre terme.';
    nav.appendChild(rien);
    q.addEventListener('input', () => {
      const m = sansAccents(q.value.trim());
      let premier = null;
      for (const s of AIDE) {
        const ok = !m || texteDe(s).includes(m);
        nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
        if (ok && !premier) premier = s.id;
      }
      rien.hidden = !!premier;
      if (m && premier && (premier !== courant && nav.querySelector(`[data-s="${courant}"]`).hidden)) montrer(premier);
    });
  }, true);
}
ACTIONS.aide = b => ouvrirAide(b && b.dataset && b.dataset.s);
/* F1 (ou « ? » hors d'un champ) ouvre l'aide ; on ne coupe pas une fenêtre déjà ouverte (séance, formulaire…) */
document.addEventListener('keydown', e => {
  const champ = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
  if (e.key !== 'F1' && !(e.key === '?' && !champ)) return;
  e.preventDefault();
  if (!$('#modale').classList.contains('ouvert')) ouvrirAide();
});
