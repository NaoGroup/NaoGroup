'use strict';
/* ============================================================
   NaoCar — « Comment ça marche » : le mode d'emploi
   Même forme que dans les autres outils : sommaire à gauche, fiche à
   droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
const AIDE = [
  { id: 'bienvenue', em: '🚗', t: 'Bienvenue dans NaoCar', chapo: 'Votre voiture, toujours en règle.',
    b: [
      ['p', 'NaoCar tient le carnet de vos voitures : <b>une fiche par voiture</b> (plaque, pneus, batterie), le <b>contrôle technique</b> et ce qu’il reste <b>à faire</b>, le <b>tableau des réparations</b> avec leurs factures, et les <b>papiers</b> : assurance, carte grise, Crit’Air.'],
      ['sous', 'Les espaces'],
      ['liste', [['🏠 Accueil', 'le garage d’un coup d’œil : chaque voiture et son état, ce qui est à faire, les échéances, les dernières réparations.'],
        ['🚗 Mes voitures', 'la fiche complète de chaque voiture.'],
        ['🔧 Entretien', 'ce qu’il y a à faire, par niveau d’urgence, et le contrôle technique.'],
        ['🧾 Réparations', 'le tableau de tout ce qui a été fait, avec le kilométrage et la facture.'],
        ['📋 Administratif', 'l’assurance, la carte grise provisoire puis définitive, la vignette Crit’Air et les autres papiers.']]],
      ['astuce', 'Un clic sur le logo NaoCar, en haut à gauche, ramène à la page NaoGroup.'],
    ] },
  { id: 'demarrer', em: '🚀', t: 'Premiers pas', chapo: 'La carte grise sous les yeux, cinq minutes suffisent.',
    b: [
      ['etapes', ['<b>➕ Ajouter ma voiture</b> : la marque (seule obligatoire), le modèle, la finition, la couleur, la plaque et la date de 1re mise en circulation.',
        'Complétez <b>les pneus</b> et <b>la batterie</b> : leurs tailles et références sont écrites dessus.',
        'Notez votre <b>dernier contrôle technique</b> : NaoCar calcule le suivant.',
        'Dans 📋 Administratif, notez <b>l’assurance</b> et <b>la carte grise</b>.',
        'Au fil du temps : ce qu’il y a à faire, les réparations et un relevé du compteur de temps en temps.']],
      ['p', 'Envie de voir l’outil rempli avant de commencer ? Sur le premier écran, <b>✨ Découvrir avec un exemple</b> charge deux voitures inventées. Un bouton les efface quand vous êtes prêt·e.'],
    ] },
  { id: 'fiche', em: '🪪', t: 'La fiche d’une voiture', chapo: 'Comme un profil : une fiche par voiture.',
    b: [
      ['liste', [['Identité', 'photo, petit nom, marque, modèle, finition, couleur, plaque (case A), 1re mise en circulation (case B), énergie, boîte, puissance fiscale (case P.6), numéro VIN (case E).'],
        ['Kilométrage', 'celui d’aujourd’hui, et celui à l’achat. NaoCar prend toujours le plus haut qu’il connaît (fiche, relevés, contrôles, réparations).'],
        ['Vendue', 'la case « vendue » garde la fiche et tout son historique, sans plus aucun rappel.']]],
      ['p', 'Avec plusieurs voitures, une rangée de boutons apparaît en haut des pages : choisissez une voiture, ou « Toutes ».'],
      ['astuce', 'Sans photo, la vignette dessine une petite voiture à la couleur notée (« gris titane », « bleu nuit »…).'],
    ] },
  { id: 'pneus', em: '🛞', t: 'Les pneus', chapo: 'La taille, lue en clair.',
    b: [
      ['p', 'La taille est écrite sur le flanc du pneu et sur l’étiquette de la portière conducteur, par exemple <b>205/55 R16 91V</b>. NaoCar la traduit :'],
      ['liste', [['205', 'la largeur, en millimètres.'], ['55', 'la hauteur du flanc, en % de la largeur.'], ['R16', 'pneu radial, pour une jante de 16 pouces.'],
        ['91', 'l’indice de charge : 615 kg par pneu.'], ['V', 'l’indice de vitesse : 240 km/h au plus.']]],
      ['p', 'Notez aussi la pression conseillée (avant et arrière, en bar), la saison (été, hiver, 4 saisons), la marque, la date et le kilométrage de montage, et la <b>date DOT</b> : 4 chiffres sur le flanc, la semaine puis l’année de fabrication.'],
      ['exemple', 'DOT 2321 = pneu fabriqué la 23e semaine de 2021. Au-delà de 5 ans, NaoCar conseille de faire vérifier le caoutchouc, même peu usé.'],
    ] },
  { id: 'batterie', em: '🔋', t: 'La batterie', chapo: 'Tout est écrit sur son étiquette.',
    b: [
      ['liste', [['Tension', '12 V pour presque toutes les voitures.'], ['Capacité', 'en Ah (ampères-heures), par exemple 70 Ah.'],
        ['Courant de démarrage', 'en A, noté « CCA » ou « EN », par exemple 640 A.'], ['Technologie', 'classique, EFB ou AGM (les voitures Start & Stop demandent une EFB ou une AGM).'],
        ['Date de pose et garantie', 'pour savoir son âge.']]],
      ['astuce', 'Une batterie dure en général 4 à 6 ans : à 5 ans, NaoCar vous propose de la faire tester avant l’hiver.'],
    ] },
  { id: 'ct', em: '✅', t: 'Le contrôle technique', chapo: 'NaoCar compte pour vous.',
    b: [
      ['liste', [['Le premier', 'dans les 6 mois avant les 4 ans de la voiture, comptés depuis la 1re mise en circulation.'],
        ['Ensuite', 'tous les 2 ans.'],
        ['Contre-visite', 'si des défaillances majeures ou critiques sont relevées, on a 2 mois pour la faire. Avec des défaillances critiques, la voiture ne peut rouler que le jour du contrôle.']]],
      ['etapes', ['🔧 Entretien → ✅ Contrôle technique → <b>Noter un passage</b>.', 'La date, le kilométrage, le centre, le résultat et les défaillances relevées.',
        'Joignez le <b>procès-verbal en PDF</b> : il est gardé dans NaoCar et une copie part dans NaoDoc.',
        'Cochez « Ajouter chaque défaillance à Ce qu’il y a à faire » : une ligne = une chose à faire, avec son urgence.']],
      ['p', 'Le cadran montre le temps qui reste : vert, orange à moins de 2 mois, rose une fois dépassé. Si le procès-verbal indique une autre date, notez-la dans « Prochain contrôle ».'],
    ] },
  { id: 'afaire', em: '🔧', t: 'Ce qu’il y a à faire', chapo: 'Avec un niveau d’urgence.',
    b: [
      ['liste', [['🔴 Urgent', 'avant de reprendre la route : freins, pneu abîmé, voyant rouge, contre-visite.'],
        ['🟠 Bientôt', 'dans les semaines qui viennent : une révision, une usure signalée.'],
        ['🟢 Quand possible', 'à la prochaine occasion : un éclat de pare-brise, une rayure.']]],
      ['p', 'Chaque chose peut avoir une date limite, un kilométrage limite, le garage prévu et le montant du devis. Cochez ✓ quand c’est fait : NaoCar propose de l’ajouter au <b>tableau des réparations</b> avec la facture.'],
      ['astuce', 'Les choses urgentes apparaissent aussi sur l’accueil et dans le bandeau en haut de page.'],
    ] },
  { id: 'reparations', em: '🧾', t: 'Le tableau des réparations', chapo: 'Tout ce qui a été fait, et combien.',
    b: [
      ['p', 'Une ligne par passage au garage : la <b>date</b>, le <b>kilométrage à ce moment-là</b>, la nature (révision, freins, pneus, distribution…), ce qui a été fait, le garage, le montant, la garantie des pièces et la <b>facture en PDF</b>.'],
      ['liste', [['Trier', 'cliquez sur le titre d’une colonne (date, kilométrage, nature, garage, montant) ; un second clic inverse.'],
        ['Ouvrir la facture', 'le bouton 📎 PDF de la ligne.'], ['Les totaux', 'en haut et en bas du tableau, et « Où part l’argent » par nature.']]],
      ['astuce', 'Un historique complet, factures à l’appui, rassure l’acheteur le jour où vous vendez la voiture.'],
    ] },
  { id: 'papiers', em: '📋', t: 'L’administratif', chapo: 'Assurance, carte grise, Crit’Air.',
    b: [
      ['liste', [['🛡️ Assurance', 'l’assureur, le n° de contrat, la formule (tiers, tiers étendu, tous risques), l’échéance, le prix, le n° d’assistance et l’attestation. « Nouvelle période » reprend l’assureur pour l’année suivante.'],
        ['📄 Carte grise provisoire (CPI)', 'remise à la fin de la démarche sur le site de l’ANTS : elle permet de rouler 1 mois en France. NaoCar vous prévient avant la fin, tant que la définitive n’est pas notée.'],
        ['🪪 Carte grise définitive', 'reçue par courrier : notez-la (avec son PDF) et les rappels s’arrêtent.'],
        ['🌿 Crit’Air', 'la vignette de pollution, obligatoire dans les zones à faibles émissions.'],
        ['Et aussi', 'crédit, LOA ou LLD, garantie, certificat de cession, tout autre papier.']]],
      ['astuce', 'Une voiture doit toujours être assurée, même si elle ne roule pas mais peut rouler : NaoCar signale une voiture sans assurance notée.'],
    ] },
  { id: 'naodoc', em: '🗂️', t: 'Les PDF et NaoDoc', chapo: 'Un document joint ici est aussi rangé dans NaoDoc.',
    b: [
      ['p', 'Le procès-verbal du contrôle technique, une facture de réparation, l’attestation d’assurance, la carte grise : joignez le PDF (ou une photo) dans sa fiche, d’un clic ou en le glissant.'],
      ['liste', [['Dans NaoCar', 'le document reste attaché à sa ligne : le bouton 📎 l’ouvre.'],
        ['Dans NaoDoc', 'une <b>copie</b> est rangée dans le classeur du <b>Foyer</b>, thème <b>🚗 Véhicule</b>, sous-thème Contrôle technique, Entretien, Assurance ou Carte grise, avec le garage et la plaque.'],
        ['Supprimer', 'retirer un document de NaoCar ne touche pas à sa copie dans NaoDoc, et inversement.']]],
      ['astuce', '25 Mo au plus par document. Les fichiers restent sur cet ordinateur : la 💾 sauvegarde garde les fiches, pas les PDF.'],
    ] },
  { id: 'km', em: '📍', t: 'Le kilométrage', chapo: 'Un relevé de temps en temps.',
    b: [
      ['p', 'Le bouton <b>📍 Kilométrage</b> note le compteur du jour. Les contrôles techniques et les réparations comptent aussi comme relevés. Avec deux relevés éloignés d’au moins 2 mois, la fiche affiche les <b>kilomètres par an</b>.'],
    ] },
  { id: 'sauvegarde', em: '💾', t: 'Sauvegarde et confidentialité', chapo: 'Tout reste sur cet ordinateur.',
    b: [
      ['p', 'NaoCar enregistre tout dans ce navigateur, à chaque modification. <b>💾 Sauvegarder</b> (ou <kbd>Ctrl</kbd> + <kbd>S</kbd>) télécharge un fichier ; <b>📂 Ouvrir une sauvegarde</b> le recharge, sur cet ordinateur ou un autre.'],
      ['p', 'Dans NaoGroup, chaque profil a son propre espace : deux personnes sur le même ordinateur ne voient jamais le garage l’une de l’autre.'],
    ] },
  { id: 'reinitialiser', em: '↺', t: 'Réinitialiser l’outil', chapo: 'Repartir d’une page blanche.',
    b: [
      ['p', 'Le bouton <b>↺ Réinitialiser</b>, en haut, rend NaoCar <b>vierge, comme pour un nouvel utilisateur</b> : les voitures, l’entretien, les réparations, les papiers, les relevés, les documents joints et les préférences d’affichage sont effacés de cet ordinateur.'],
      ['etapes', ['Cliquez ↺ Réinitialiser.', 'Choisissez <b>💾 Sauvegarder, puis réinitialiser</b> (conseillé) ou <b>Effacer sans sauvegarder</b>.', 'Sans sauvegarde, une seconde confirmation vous est demandée.', 'NaoCar repart du tout premier écran : ajoutez votre voiture.']],
      ['astuce', 'Les copies déjà rangées dans NaoDoc ne sont pas effacées.'],
    ] },
  { id: 'confort', em: '✨', t: 'Confort et raccourcis', chapo: 'Les petits plus.',
    b: [
      ['liste', [['🌙 / ☀️', 'thème sombre ou clair.'], ['Échap', 'ferme la fenêtre ouverte, ou passe l’animation d’ouverture.'],
        ['Entrée ou Espace', 'ouvre la carte sélectionnée au clavier.'], ['Ctrl + S', 'sauvegarde dans un fichier.'], ['F1', 'ouvre cette aide sur la page où vous êtes.'],
        ['Les bandeaux en haut', 'ce qui est urgent (contrôle technique, assurance, carte grise provisoire). ✕ les masque jusqu’à la prochaine ouverture.']]],
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
      <input type="search" id="aide-q" placeholder="Chercher : pneus, CT, facture…" aria-label="Chercher dans l’aide">
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
  if (e.key === 'F1' && !document.querySelector('.voile')) {
    e.preventDefault();
    ouvrirAide({ accueil: 'bienvenue', voitures: 'fiche', entretien: V.sous.entretien === 'ct' ? 'ct' : 'afaire', reparations: 'reparations', papiers: 'papiers' }[V.page]);
  }
});
