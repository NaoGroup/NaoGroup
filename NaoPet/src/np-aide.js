'use strict';
/* ============================================================
   NaoPets — « Comment ça marche » : le mode d'emploi
   Même forme que dans NaoAgenda : sommaire à gauche, fiche à
   droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
const AIDE = [
  { id: 'bienvenue', em: '🐾', t: 'Bienvenue dans NaoPets', chapo: 'Leur bien-être, bien organisé : tout le quotidien de vos animaux, au même endroit.',
    b: [
      ['p', 'NaoPets vous aide à <b>organiser</b> la vie de vos compagnons : repas, promenades, soins, rendez-vous, carnet de santé, stock de nourriture, dépenses, vacances et souvenirs. Un seul outil pour tous les animaux du foyer — chien, chat, lapin, cochon d’Inde, hamster, cheval, oiseau…'],
      ['sous', 'Ce que NaoPets ne fait jamais'],
      ['liste', [['Pas de diagnostic', 'NaoPets ne dit jamais ce qu’a votre animal.'],
        ['Pas de traitement', 'il ne recommande aucun soin, aucun vaccin, aucun produit.'],
        ['Pas de dosage', 'une posologie se recopie telle qu’elle est écrite sur l’ordonnance ; NaoPets ne la calcule ni ne la modifie.'],
        ['Pas à la place du vétérinaire', 'pour toute question de santé, c’est lui qu’il faut appeler.']]],
      ['astuce', 'Si une note évoque une inquiétude (« vomit », « boite », « ne mange plus »…), NaoPets vous propose simplement, avec douceur, d’appeler votre vétérinaire.'],
    ] },
  { id: 'demarrer', em: '🚀', t: 'Premiers pas', chapo: 'Trois minutes pour bien démarrer.',
    b: [
      ['etapes', ['Cliquez <b>🐾 Ajouter un animal</b> : un prénom suffit, le reste se complète quand vous voulez.',
        'Ajoutez son <b>vétérinaire</b> et une <b>clinique de garde</b> dans 📇 Contacts.',
        'Planifiez ses <b>repas</b> et créez quelques <b>rappels</b> (promenades, eau, antiparasitaire…).',
        'Notez ses <b>vaccins</b> au carnet de santé, avec la date du prochain rappel indiquée par le vétérinaire.',
        'Chaque jour, cochez ce qui est fait dans <b>☀️ À faire aujourd’hui</b>.']],
      ['p', 'Envie de voir l’outil rempli avant de commencer ? Sur l’écran d’accueil vierge, <b>✨ Découvrir avec un exemple</b> charge Moka, Pixel et Caramel. Un bouton efface l’exemple quand vous êtes prêt·e.'],
      ['sous', 'Le sélecteur « Pour »'],
      ['p', 'Sous les onglets, les pastilles <b>Tous · Moka · Pixel…</b> filtrent toutes les pages sur un animal. Choisissez « Tous » pour revoir l’ensemble du foyer.'],
    ] },
  { id: 'accueil', em: '🏠', t: 'L’accueil', chapo: 'Un coup d’œil, et vous savez ce qui vous attend.',
    b: [
      ['liste', [['Les quatre grands boutons', 'ajouter un animal, un rappel, un rendez-vous ou une dépense, en un clic.'],
        ['Mes animaux', 'une carte par compagnon, avec ses prochaines actions. Cliquez-la pour ouvrir sa fiche.'],
        ['À faire aujourd’hui', 'repas, promenades, soins et médicaments du jour, à cocher.'],
        ['Prochains rendez-vous', 'vétérinaire, toilettage, contrôle…'],
        ['Vaccins et rappels à venir', 'les renouvellements notés au carnet de santé.'],
        ['Stock à renouveler', 'ce qui arrive bientôt au bout.'],
        ['Dépenses du mois', 'le total, le budget et les catégories.'],
        ['Derniers souvenirs', 'vos photos et les dates à fêter.']]],
      ['sous', 'Les alertes douces'],
      ['p', 'En haut de page, quelques bandeaux rassurants rappellent ce qui approche : un vaccin dans quelques jours, un sac de croquettes presque vide, un anniversaire d’adoption. La croix ✕ les masque jusqu’à la prochaine ouverture.'],
    ] },
  { id: 'animaux', em: '🐶', t: 'La fiche d’un animal', chapo: 'Tout ce qu’il faut savoir de lui, sur une seule page.',
    b: [
      ['p', 'Ouvrez <b>🐾 Mes animaux</b> puis choisissez un compagnon. Sa fiche réunit son identité (photo, espèce, race, naissance ou âge estimé, sexe, poids, couleur, adoption), ses <b>informations importantes</b>, ses repas, ses rappels, sa santé récente, son budget et ses dates à fêter.'],
      ['sous', 'Les informations importantes'],
      ['liste', [['Allergies connues', 'telles qu’indiquées par votre vétérinaire.'],
        ['Sensibilités alimentaires', 'rappelées aussi quand vous planifiez un repas.'],
        ['Puce ou tatouage', 'son numéro d’identification.'],
        ['Assurance', 'compagnie, numéro de contrat, téléphone.'],
        ['Contacts utiles', 'vétérinaire, clinique et contacts d’urgence, avec leur numéro à portée de clic.']]],
      ['astuce', 'Saisir un nouveau poids dans la fiche ajoute automatiquement une pesée datée d’aujourd’hui à la courbe.'],
      ['p', 'Quand un compagnon nous quitte, cochez <b>🌈 Il ou elle nous a quittés</b> dans sa fiche : ses souvenirs restent, ses rappels s’arrêtent. Le bouton 🗑️ Supprimer efface, lui, tout ce qui le concerne.'],
    ] },
  { id: 'quotidien', em: '🦴', t: 'Le quotidien : rappels, repas, journal', chapo: 'La routine, sans rien oublier.',
    b: [
      ['sous', 'Les rappels récurrents'],
      ['p', 'Un rappel peut revenir <b>tous les jours</b>, <b>certains jours de la semaine</b>, <b>tous les mois</b>, <b>tous les ans</b> ou <b>une seule fois</b> — tous les 2 jours, toutes les 3 semaines… Vous pouvez lui donner plusieurs heures (« 08:00, 19:30 ») et une date de fin, pratique pour un traitement prescrit sur une durée précise.'],
      ['exemple', 'Balade de Moka : tous les jours à 8 h, 12 h 30 et 19 h. Pipette antiparasitaire : tous les mois, le 3. Brossage : chaque semaine, mercredi et samedi.'],
      ['astuce', 'Pour un médicament, recopiez la posologie de l’ordonnance dans le champ prévu. NaoPets vous rappelle l’heure ; il ne touche jamais au dosage.'],
      ['sous', 'Les repas'],
      ['p', 'Dans 🦴 Quotidien → 🍽️ Repas (ou depuis la fiche), indiquez l’heure, le type d’alimentation, la quantité et vos notes. Chaque repas planifié revient tous les jours dans « À faire aujourd’hui ».'],
      ['sous', 'Aujourd’hui et le journal'],
      ['p', '☀️ <b>Aujourd’hui</b> range les tâches par moment de la journée ; cochez-les au fil de l’eau. 📔 <b>Journal</b> garde les petits moments — promenade, jeu, bain, griffes, apprentissage, garderie — avec un bilan des 7 derniers jours.'],
    ] },
  { id: 'sante', em: '🩺', t: 'Santé et rendez-vous', chapo: 'Le carnet de santé, toujours à jour.',
    b: [
      ['sous', 'Les rendez-vous'],
      ['p', 'Consultation, vaccin, contrôle, stérilisation, toilettage ou autre soin : indiquez la date, l’heure, la durée prévue, le lieu, les questions à poser… puis, après coup, le compte rendu. Les rendez-vous passés forment l’historique.'],
      ['sous', 'Le carnet de santé'],
      ['p', 'Notez chaque <b>vaccin</b>, <b>vermifuge</b>, <b>antiparasitaire</b>, <b>traitement prescrit</b> ou examen, tel qu’il figure sur le carnet ou l’ordonnance. Si le vétérinaire a fixé un <b>prochain rappel</b>, indiquez sa date : elle apparaît dans « Vaccins et rappels à venir » et dans le calendrier.'],
      ['etapes', ['Le jour venu, cliquez <b>✓ Fait</b> à côté du renouvellement.', 'NaoPets ouvre un nouveau soin daté d’aujourd’hui, déjà rempli.', 'Indiquez la nouvelle date de rappel donnée par le vétérinaire, et enregistrez.']],
      ['sous', 'Le poids'],
      ['p', 'Chaque pesée s’ajoute à une courbe simple. Pour savoir quel poids est idéal pour votre compagnon, fiez-vous à votre vétérinaire.'],
    ] },
  { id: 'agenda', em: '📅', t: 'Le lien avec NaoAgenda', chapo: 'Les rendez-vous de vos animaux, aussi dans votre agenda.',
    b: [
      ['p', 'Chaque rendez-vous noté dans NaoPets apparaît automatiquement dans <b>NaoAgenda</b>, dans la catégorie Santé, marqué 🐾 et précédé du nom de l’animal : « Moka — Toilettage ».'],
      ['liste', [['Modifiable des deux côtés', 'titre, date, heures, lieu, notes et « terminé » se mettent à jour dans l’autre outil.'],
        ['En direct', 'si les deux outils sont ouverts, un changement dans l’un apparaît aussitôt dans l’autre.'],
        ['Suppression', 'supprimer le rendez-vous dans NaoAgenda le supprime aussi dans NaoPets (une confirmation vous le rappelle).'],
        ['La durée', 'la durée prévue du rendez-vous donne son heure de fin dans l’agenda.']]],
      ['astuce', 'Les « notes » de l’agenda correspondent au champ « Motif ou questions à poser » de NaoPets. Le compte rendu, lui, reste dans NaoPets.'],
    ] },
  { id: 'calendrier', em: '🗓️', t: 'Le calendrier', chapo: 'Tous les animaux, tous les rendez-vous, sur un mois.',
    b: [
      ['p', 'Le calendrier réunit les rendez-vous, les rappels de soins, les soins effectués, les rappels ponctuels, les anniversaires de naissance et d’adoption, le journal et les vacances. Les couleurs sont expliquées sous la grille.'],
      ['p', 'Cliquez un jour pour voir son détail à droite, avec sa routine (repas, rappels quotidiens) à cocher. Depuis ce panneau, ajoutez directement un rendez-vous ou un moment à cette date.'],
      ['astuce', 'Les rappels quotidiens (repas, balades) ne s’affichent pas dans les cases pour ne pas les encombrer : ils sont dans le détail du jour.'],
    ] },
  { id: 'stock', em: '📦', t: 'Le stock', chapo: 'Racheter au bon moment, sans courir.',
    b: [
      ['p', 'Suivez la nourriture, les friandises, la litière, les accessoires et les produits d’hygiène. Pour chaque article : la quantité restante, la quantité quand c’est plein, un seuil d’alerte et, si vous voulez, la <b>consommation par jour</b> — NaoPets estime alors combien de jours il en reste.'],
      ['liste', [['− et ＋', 'ajustent la quantité restante.'],
        ['🛒 Racheté', 'remet l’article à plein en un clic.'],
        ['Liste de courses', 'en haut de la page, tout ce qui arrive bientôt au bout.']]],
      ['exemple', 'Un sac de 12 kg, 260 g par jour : NaoPets vous prévient doucement quand il reste une semaine.'],
    ] },
  { id: 'depenses', em: '💶', t: 'Dépenses et budget', chapo: 'Savoir ce que coûte le bonheur de vos compagnons.',
    b: [
      ['p', 'Chaque dépense a un montant, une date, une catégorie (alimentation, vétérinaire, assurance, accessoires, toilettage, pension, médicaments, autre) et un animal — ou <b>Tout le foyer</b>.'],
      ['liste', [['🗓️ Mensuel', 'le total du mois, l’anneau du budget, la répartition par catégorie et par animal.'],
        ['📈 Annuel', 'les douze mois en barres, la moyenne et la répartition de l’année.'],
        ['🎯 Budgets mensuels', 'un repère par animal ; le budget annuel se calcule tout seul.']]],
      ['astuce', 'Une dépense « Tout le foyer » (litière commune, par exemple) est partagée à parts égales entre vos animaux quand vous regardez le budget de l’un d’eux.'],
    ] },
  { id: 'vacances', em: '🧳', t: 'Avant les vacances', chapo: 'Partir l’esprit tranquille.',
    b: [
      ['p', 'Indiquez la destination, les dates et qui s’occupe de vos compagnons (ils partent avec vous, pension, pet-sitter, famille ou amis), avec les consignes pour la garde. Quelques jours avant le départ, une alerte douce vous rappelle ce qui reste à préparer.'],
      ['p', 'La checklist est rangée par thème : documents, alimentation, balade, confort, soins et garde. Ajoutez vos propres éléments, cochez-les, puis <b>↺ Tout décocher</b> pour le prochain voyage.'],
    ] },
  { id: 'souvenirs', em: '📸', t: 'Souvenirs et contacts', chapo: 'Les moments qui comptent, et les personnes à appeler.',
    b: [
      ['sous', 'Mes souvenirs'],
      ['p', 'Une photo, une date, un titre, quelques mots : sa première neige, sa sieste au soleil. À droite, les <b>dates importantes</b> — anniversaires de naissance et d’adoption — avec un compte à rebours.'],
      ['sous', 'Contacts'],
      ['p', 'Vétérinaire, clinique de garde, toiletteur, pension, pet-sitter, éducateur, contacts d’urgence : avec téléphone, e-mail, adresse et horaires. Un contact peut concerner tous vos animaux ou seulement certains.'],
      ['astuce', 'Gardez toujours le numéro d’une clinique vétérinaire de garde : en cas de souci, c’est elle qu’il faut appeler.'],
    ] },
  { id: 'donnees', em: '💾', t: 'Vos données', chapo: 'Ce qui est gardé, où, et comment le mettre à l’abri.',
    b: [
      ['p', 'Tout reste dans le navigateur de cet ordinateur. Les photos sont réduites avant d’être gardées, mais prennent de la place.'],
      ['liste', [['💾 Sauvegarder', 'télécharge un fichier de sauvegarde (aussi avec <kbd>Ctrl</kbd> + <kbd>S</kbd>).'],
        ['📂 Ouvrir une sauvegarde', 'recharge un fichier, sur cet ordinateur ou un autre.'],
        ['↺ Réinitialiser', 'efface tout et rend l’outil vierge, comme pour un nouvel utilisateur — NaoPets vous propose de sauvegarder juste avant.'],
        ['🌙 / ☀️', 'le thème sombre ou clair, à votre goût.']]],
      ['astuce', 'Faites une sauvegarde de temps en temps, et toujours avant de changer d’ordinateur ou de nettoyer votre navigateur.'],
    ] },
  { id: 'questions', em: '💬', t: 'Questions fréquentes', chapo: 'Les petites choses qu’on se demande.',
    b: [
      ['liste', [['Mes rappels de traitement ont disparu ?', 'vérifiez leur date de fin, et que l’animal n’est pas marqué comme parti.'],
        ['Un repas n’apparaît pas aujourd’hui ?', 'il compte à partir du jour où il a été planifié.'],
        ['Je ne vois qu’un animal partout ?', 'le sélecteur « Pour » est sur lui : choisissez « Tous ».'],
        ['L’animation d’ouverture est trop longue ?', 'un clic la passe ; elle est sautée si votre ordinateur demande moins d’animations.'],
        ['Un doute sur la santé de mon animal ?', 'appelez votre vétérinaire, ou la clinique de garde en dehors de ses horaires.']]],
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
  const v = fenetre(`<div class="fenetre aide" role="dialog" aria-modal="true" aria-labelledby="t-aide">
    <div class="aide-h">
      <div><h2 id="t-aide">❓ Comment ça marche</h2>
        <p class="chapo" style="margin:2px 0 0">Tout l’outil, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="spacer"></span>
      <input type="search" id="aide-q" placeholder="Chercher : vaccin, stock, budget…" aria-label="Chercher dans l’aide">
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
  /* la recherche : on garde les sujets dont le texte contient les mots tapés */
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
