'use strict';
/* ============================================================
   NaoHome — « Comment ça marche » : le mode d'emploi
   Même forme que dans les autres outils : sommaire à gauche, fiche à
   droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
const AIDE = [
  { id: 'bienvenue', em: '🏠', t: 'Bienvenue dans NaoHome', chapo: 'Toute la maison, chacun à sa place.',
    b: [
      ['p', 'NaoHome rassemble ce qui fait tourner un foyer : <b>le logement</b>, <b>le carnet de famille</b> (qui vit ici, et les personnes de confiance), <b>la piscine</b> s’il y en a une, <b>les sports</b> de chacun, <b>les copains</b> des enfants, <b>l’annuaire</b> des assurances et <b>le ménage</b>, pièce par pièce.'],
      ['sous', 'Les espaces'],
      ['liste', [['🏠 Accueil', 'la maison d’un coup d’œil : le ménage du jour, la piscine, les anniversaires, les numéros utiles.'],
        ['📖 Carnet de famille', 'une fiche par personne et par animal, avec sa photo.'],
        ['🏊 Piscine', 'apparaît seulement si votre logement en a une.'],
        ['🧹 Ménage', 'votre logement dessiné, ses pièces et leurs tâches, avec qui fait quoi.'],
        ['🏅 Sports', 'les clubs, licences, niveaux et médailles, et le parcours sportif de toute une vie.'],
        ['🎒 Copains', 'le petit annuaire des parents des copains de classe.'],
        ['📇 Annuaire', 'assurances, mutuelle, sécurité sociale et autres numéros utiles.']]],
      ['astuce', 'Un clic sur le logo NaoHome, en haut à gauche, ramène à la page NaoGroup.'],
    ] },
  { id: 'demarrer', em: '🚀', t: 'Premiers pas', chapo: 'Trois choix, et la maison est prête.',
    b: [
      ['etapes', ['<b>Dans quoi vivez-vous ?</b> Une maison ou un appartement.',
        'Pour une maison : <b>avec ou sans piscine ?</b> Avec piscine, la page 🏊 Piscine s’ajoute au menu.',
        '<b>Composez le foyer</b> dans le 📖 carnet de famille : les adultes, les enfants, les animaux, puis une ou deux personnes de confiance.',
        'Dans 🧹 Ménage, ajoutez <b>les pièces</b> de votre logement, puis leurs tâches avec le nom de qui s’en occupe.',
        'Complétez à votre rythme : sports, copains, annuaire.']],
      ['p', 'Envie de voir l’outil rempli avant de commencer ? Sur le tout premier écran, <b>✨ Découvrir avec une famille d’exemple</b> charge les Martin, une famille entièrement inventée. Un bouton l’efface quand vous êtes prêt·e.'],
    ] },
  { id: 'logement', em: '🏡', t: 'Le logement', chapo: 'Maison ou appartement, avec ou sans piscine.',
    b: [
      ['p', 'Le bouton <b>🏠 Mon logement</b> (sur l’accueil) permet de tout changer plus tard : le type, la piscine, le nom de la maison, l’étage, l’adresse, le volume de la piscine et les jours de mesure de l’eau.'],
      ['liste', [['Maison', 'le ménage la dessine avec son toit et sa cheminée ; la piscine apparaît au pied de la maison.'],
        ['Appartement', 'le ménage dessine l’immeuble, votre étage encadré.'],
        ['Piscine', 'la cocher ajoute la page 🏊 Piscine ; la décocher la masque, sans rien effacer.']]],
      ['astuce', 'Changer de type de logement ne supprime ni les pièces ni les tâches.'],
    ] },
  { id: 'carnet', em: '📖', t: 'Le carnet de famille', chapo: 'La composition du foyer, une fiche par personne.',
    b: [
      ['p', 'Le carnet réunit tous ceux qui vivent ici. Chaque fiche se remplit <b>une seule fois</b> et sert partout : dans le ménage (qui fait quoi), les sports, les copains et l’annuaire.'],
      ['sous', 'La fiche d’un adulte'],
      ['liste', [['Identité', 'photo, prénom, nom, date de naissance, place dans le foyer.'],
        ['Le travail', 'entreprise, poste, date d’entrée, matricule, numéro et e-mail professionnels.'],
        ['Coordonnées', 'téléphone, e-mail, numéro de sécurité sociale.']]],
      ['sous', 'La fiche d’un enfant'],
      ['liste', [['Les études', 'à la place du travail : nom de l’établissement, classe, professeur principal, numéro et adresse de l’école.'],
        ['Grandir', 'le choix « Un adulte / Un enfant » se change dans la fiche : le jour venu, l’enfant passe chez les adultes en gardant tout.']]],
      ['sous', 'Les animaux'],
      ['p', 'Nom, espèce, race, naissance, puce et vétérinaire. Pour leurs repas et leur carnet de santé, cochez <b>🐾 Rattacher à NaoPets</b> : l’animal y arrive tout seul.'],
      ['astuce', 'La photo est recadrée en carré et allégée avant d’être gardée : elle s’affiche ronde dans le carnet.'],
    ] },
  { id: 'confiance', em: '🤝', t: 'Les personnes de confiance', chapo: 'Une ou deux personnes à appeler si l’on ne peut pas vous joindre.',
    b: [
      ['p', 'Une grand-mère, un voisin, la nounou, une marraine : quelqu’un qui peut venir chercher les enfants, ouvrir la maison, prévenir la famille. NaoHome en garde <b>deux au plus</b>, pour que le choix reste clair.'],
      ['p', 'Leur fiche : photo, prénom, nom, lien avec la famille, téléphone, e-mail, adresse, et ce qu’elles ont le droit de faire (récupérer les enfants, double des clés…). Elles apparaissent aussi sur l’accueil, sous les numéros utiles.'],
    ] },
  { id: 'naosante', em: '🩺', t: 'Rattacher à NaoSanté', chapo: 'Pour ne pas taper deux fois les mêmes informations.',
    b: [
      ['p', 'Dans la fiche d’une personne, la case <b>🩺 Rattacher à NaoSanté pour la fiche médicale</b> prépare pour NaoSanté son prénom, son nom, sa date de naissance, son sexe, son n° de sécurité sociale, sa place dans le foyer et ses sports (sport, club, années, compétition, niveau). Le n° de sécu changé ici est mis à jour dans sa fiche médicale de NaoSanté.'],
      ['liste', [['Ce qui est partagé', 'l’identité, le n° de sécurité sociale et les sports, rien d’autre.'],
        ['Ce qui ne l’est jamais', 'le travail, l’école, les contrats, les copains, l’annuaire.'],
        ['Décocher', 'retire la personne de ce qui est préparé pour NaoSanté.']]],
      ['astuce', 'Les membres rattachés portent la pastille 🩺 NaoSanté dans le carnet.'],
    ] },
  { id: 'naopets', em: '🐾', t: 'Rattacher à NaoPets', chapo: 'Votre animal entre dans NaoPets sans rien retaper.',
    b: [
      ['p', 'Dans la fiche d’un animal, la case <b>🐾 Rattacher à NaoPets</b> prépare pour NaoPets son nom, son espèce, sa race, sa date de naissance, sa puce, son vétérinaire et sa photo.'],
      ['liste', [['À l’ouverture de NaoPets', 'l’animal y apparaît avec sa fiche ; s’il y était déjà sous le même nom, les deux fiches sont simplement reliées.'],
        ['Le vétérinaire', 'il rejoint les contacts de NaoPets, pour cet animal.'],
        ['Une modification ici', 'nom, race, naissance… est reprise par NaoPets. Ce que vous changez dans NaoPets n’est pas effacé tant que NaoHome ne change pas.'],
        ['Décocher', 'l’animal n’est plus préparé pour NaoPets ; sa fiche NaoPets, ses repas et son carnet de santé restent.']]],
      ['astuce', 'Les animaux rattachés portent la pastille 🐾 NaoPets dans le carnet.'],
    ] },
  { id: 'piscine', em: '🏊', t: 'La piscine : l’entretien', chapo: 'Les gestes réguliers, et quand les refaire.',
    b: [
      ['p', 'L’onglet <b>🧽 Entretien</b> liste les gestes de base, chacun avec sa fréquence. Cliquez <b>✓ Fait</b> : la jauge se remplit, et la tâche redevient « à faire » au bon moment.'],
      ['liste', [['🍂 Feuilles, débris, insectes', 'tous les 2 jours, à l’épuisette, et les paniers des skimmers.'],
        ['🧽 Frotter les parois', 'chaque semaine, pour que les algues ne s’installent pas.'],
        ['〰️ Ligne d’eau', 'toutes les 2 semaines, avec un produit prévu pour elle.'],
        ['💧 Renouveler 1/3 de l’eau', 'une fois par an. Avec le volume de la piscine (🏠 Mon logement), NaoHome calcule combien de m³ renouveler.']]],
      ['p', '➕ Une tâche ajoute vos propres gestes (filtre, robot, hivernage…) avec leur fréquence en jours ; ✏️ les modifie.'],
      ['astuce', 'Suivez toujours la notice de vos produits, ne mélangez jamais deux produits entre eux, et versez-les dans l’eau (jamais l’inverse).'],
    ] },
  { id: 'ph', em: '🧪', t: 'Le pH et le chlore', chapo: 'Deux mesures par semaine, et des couleurs pour comprendre.',
    b: [
      ['p', 'Mesurez avec une trousse d’analyse ou des bandelettes, <b>deux fois par semaine</b> (mercredi et samedi d’office ; les jours se changent dans 🏠 Mon logement). Le jour venu, un bandeau vous le rappelle.'],
      ['sous', 'Les repères'],
      ['liste', [['pH', 'idéal entre <b>7,2 et 7,4</b>. En dessous, l’eau est acide ; au-dessus, le chlore agit moins bien.'],
        ['Chlore libre', 'idéal entre <b>1,5 et 2 mg/L</b> (mg/L et ppm, c’est pareil).'],
        ['🟢 Vert', 'idéal, rien à faire.'], ['🟠 Orange', 'à surveiller.'], ['🔴 Rouge', 'à corriger : un conseil simple s’affiche.']]],
      ['p', 'La page montre la dernière valeur sur une <b>règle colorée</b>, une <b>courbe</b> avec la zone idéale en vert, et le <b>tableau</b> de toutes les mesures (date, pH, chlore, température, filtration conseillée, note).'],
      ['exemple', 'pH 7,6 et chlore 1,2 mg/L : le pH est un peu haut, le chlore un peu faible. On corrige d’abord le pH (un chlore n’agit bien qu’avec un pH juste), puis on remesure.'],
    ] },
  { id: 'filtration', em: '⏱️', t: 'La filtration', chapo: 'La température de l’eau divisée par deux.',
    b: [
      ['p', 'Le temps de filtration par jour se calcule simplement : <b>température de l’eau ÷ 2 = nombre d’heures</b>. À 30 °C, 15 heures ; à 24 °C, 12 heures.'],
      ['p', 'L’onglet <b>⏱️ Filtration</b> reprend la dernière température notée (ou celle que vous tapez) et l’affiche sur un cadran, avec des conseils : filtrer aux heures chaudes, couper en deux plages, ajouter des heures après un orage ou beaucoup de baigneurs.'],
      ['astuce', 'En dessous de 12 °C, l’eau est en hivernage : la filtration se réduit beaucoup.'],
    ] },
  { id: 'menage', em: '🧹', t: 'Le ménage', chapo: 'Une maison dessinée, des petites listes par pièce, et qui fait quoi.',
    b: [
      ['etapes', ['Ajoutez les pièces : <b>✨ Ajouter les pièces habituelles</b> en un clic, ou une par une.',
        'Cliquez sur une pièce du dessin : sa liste de tâches s’ouvre à côté.',
        'Ajoutez des tâches (ou piochez dans les <b>idées</b> proposées pour la pièce) et choisissez <b>qui s’en occupe</b> : un membre du foyer, tout le monde, ou personne pour l’instant.',
        'Cochez ✓ quand c’est fait.']],
      ['liste', [['Chaque jour', 'la tâche revient le lendemain.'], ['Chaque semaine', 'elle revient le lundi.'], ['Chaque mois', 'elle revient le 1er du mois.']]],
      ['p', 'Sur le dessin, chaque pièce montre combien de tâches sont faites, avec une petite barre verte ; elle se borde de vert quand tout est fait. En bas, <b>Qui fait quoi</b> compte les tâches de chacun.'],
      ['astuce', '✏️ à côté du nom d’une pièce : la renommer (« Chambre de Léa ») ou la supprimer avec ses tâches.'],
    ] },
  { id: 'sports', em: '🏅', t: 'Les sports', chapo: 'Aujourd’hui, et tout au long de la vie.',
    b: [
      ['p', 'Pour chaque adulte et chaque enfant : le <b>sport</b>, le <b>club</b> et son adresse, le <b>n° de licence</b> (masqué), les jours et horaires, les années, <b>avec ou sans compétition</b>, le <b>niveau acquis</b> et le nombre de <b>médailles</b> 🥇🥈🥉.'],
      ['liste', [['🏃 En ce moment', 'les sports en cours, par personne.'],
        ['📜 Toute une vie', 'la frise de tous les sports pratiqués, du plus ancien au plus récent — laissez « jusqu’en » vide pour un sport qui continue.']]],
      ['p', 'La case <b>🙋 C’est moi</b> indique la personne qui utilise NaoGroup : dans NaoSanté, elle devient « Moi » (fini le doublon entre « Moi » et votre prénom). Elle est transmise à NaoSanté même sans la case 🩺.'],
      ['astuce', 'Tous les sports du carnet sont répertoriés dans l’onglet 🏃 Activité de NaoSanté. Pour une personne rattachée à NaoSanté, avec son identité ; pour les autres, seulement le prénom et le sport.'],
    ] },
  { id: 'copains', em: '🎒', t: 'Les copains', chapo: 'Le petit annuaire des parents des copains de classe.',
    b: [
      ['p', 'Pour chaque enfant du foyer : le prénom du copain ou de la copine, sa classe, le nom des parents, deux téléphones, l’e-mail, l’adresse, et une note (anniversaire, allergie, covoiturage…). Les numéros s’appellent d’un clic depuis un téléphone.'],
    ] },
  { id: 'annuaire', em: '📇', t: 'L’annuaire', chapo: 'Les numéros qu’on cherche toujours au mauvais moment.',
    b: [
      ['p', 'Assurance scolaire, mutuelle, sécurité sociale (CPAM), assurance voiture, habitation, garantie accidents de la vie, prévoyance, assurance des animaux, banque, autres. Pour chacun : le nom, le <b>n° de contrat</b> (masqué), le téléphone, l’e-mail, le site, l’adresse, pour qui, et une note.'],
      ['p', 'Les <b>numéros de sécurité sociale</b> se notent dans la fiche de chacun au carnet de famille ; l’annuaire les regroupe en bas de page.'],
      ['astuce', 'Les numéros sensibles s’affichent « ••• 123 ». 👁️ les montre pendant 30 secondes, 🙈 les recache.'],
    ] },
  { id: 'sauvegarde', em: '💾', t: 'Sauvegarde et confidentialité', chapo: 'Tout reste sur cet ordinateur.',
    b: [
      ['p', 'NaoHome enregistre tout dans ce navigateur, à chaque modification. <b>💾 Sauvegarder</b> (ou <kbd>Ctrl</kbd> + <kbd>S</kbd>) télécharge un fichier ; <b>📂 Ouvrir une sauvegarde</b> le recharge, sur cet ordinateur ou un autre.'],
      ['p', 'Dans NaoGroup, chaque profil a son propre espace : deux personnes sur le même ordinateur ne voient jamais la maison l’une de l’autre.'],
      ['astuce', 'Le fichier de sauvegarde contient les numéros sensibles : rangez-le dans un endroit sûr et ne l’envoyez pas par e-mail.'],
    ] },
  { id: 'reinitialiser', em: '↺', t: 'Réinitialiser l’outil', chapo: 'Repartir d’une page blanche.',
    b: [
      ['p', 'Le bouton <b>↺ Réinitialiser</b>, en haut, rend NaoHome <b>vierge, comme pour un nouvel utilisateur</b> : le logement, le carnet, la piscine, les sports, les copains, l’annuaire, le ménage et les préférences d’affichage sont effacés de cet ordinateur.'],
      ['etapes', ['Cliquez ↺ Réinitialiser.', 'Choisissez <b>💾 Sauvegarder, puis réinitialiser</b> (conseillé) ou <b>Effacer sans sauvegarder</b>.', 'Sans sauvegarde, une seconde confirmation vous est demandée.', 'NaoHome repart du tout premier choix : dans quoi vivez-vous ?']],
    ] },
  { id: 'confort', em: '✨', t: 'Confort et raccourcis', chapo: 'Les petits plus.',
    b: [
      ['liste', [['🌙 / ☀️', 'thème sombre ou clair.'], ['Échap', 'ferme la fenêtre ouverte, ou passe l’animation d’ouverture.'],
        ['Entrée ou Espace', 'ouvre la carte ou la pièce sélectionnée au clavier.'], ['Ctrl + S', 'sauvegarde dans un fichier.'],
        ['Les bandeaux en haut', 'anniversaires dans la semaine, jour de mesure de la piscine, valeur à corriger. ✕ les masque jusqu’à la prochaine ouverture.']]],
    ] },
];

function ouvrirAide(sec) {
  const bloc = ([type, x]) => {
    switch (type) {
      case 'p': return `<p>${x}</p>`;
      case 'sous': return `<h4>${x}</h4>`;
      case 'etapes': return `<ol class="aide-etapes">${x.map(e => `<li>${e}</li>`).join('')}</ol>`;
      case 'liste': return `<ul class="aide-liste">${x.map(([m, e]) => `<li><b>${m}</b> — ${e}</li>`).join('')}</ul>`;
      case 'astuce': return `<div class="aide-astuce"><span>💡</span><div>${x}</div></div>`;
      case 'exemple': return `<div class="aide-ex"><span>🔎</span><div>${x}</div></div>`;
    }
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  const v = fenetre(`<div class="fenetre aide" role="dialog" aria-modal="true" aria-labelledby="t-aide">
    <div class="aide-h">
      <div><h2 id="t-aide">❓ Comment ça marche</h2>
        <p class="chapo" style="margin:2px 0 0">Tout l’outil, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="spacer"></span>
      <input type="search" id="aide-q" placeholder="Chercher : pH, ménage, licence…" aria-label="Chercher dans l’aide">
      <button type="button" class="btn" data-act="fermer">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div></div>`);
  const nav = v.querySelector('#aide-nav'), pan = v.querySelector('#aide-p'), q = v.querySelector('#aide-q');
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    nav.querySelectorAll('.aide-n').forEach(b => b.classList.toggle('on', b.dataset.s === id));
  };
  montrer(courant);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
  const sansAccents = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const texteDe = s => sansAccents([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const m = sansAccents(q.value.trim());
    let premier = null;
    for (const s of AIDE) {
      const ok = !m || texteDe(s).includes(m);
      nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    if (m && premier && premier !== courant) montrer(premier);
  });
}
ACTIONS.aide = el => ouvrirAide(el && el.dataset.s);
document.addEventListener('keydown', e => {
  if (e.key === 'F1' && !document.querySelector('.voile')) { e.preventDefault(); ouvrirAide(V.page === 'piscine' ? 'ph' : V.page); }
});
