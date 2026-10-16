'use strict';
/* ============================================================
   NaoBaby — « Comment ça marche » : sommaire à gauche, fiche à droite,
   recherche par mot. Même principe que l'aide de NaoAgenda.
   blocs : p · sous · etapes · liste · astuce · exemple
   ============================================================ */
const AIDE = [
{ id: 'debut', em: '🚀', t: 'Premiers pas', chapo: 'Ce qu’il faut savoir avant tout le reste.', b: [
  ['p', 'NaoBaby est votre <b>carnet de grossesse</b>, puis le carnet des premiers mois de bébé. Il vit <b>dans votre navigateur, sur cet ordinateur</b> : rien ne part sur Internet, rien n’est envoyé à personne.'],
  ['etapes', [
    'Cliquez <b>✨ Créer notre carnet</b> (ou ⚙️ en haut à droite).',
    'Indiquez vos prénoms, la <b>date prévue d’accouchement</b> — ou, à défaut, la date des dernières règles : NaoBaby l’estime (+ 280 jours).',
    'Choisissez <b>un bébé, des jumeaux, des triplés…</b> : tout le carnet s’adapte.',
    '<b>✨ Commencer</b>. L’accueil affiche aussitôt votre semaine, le compte à rebours et les premières listes.',
  ]],
  ['liste', [
    ['🏠 Accueil', 'le résumé de la semaine : calendrier de grossesse, prochains rendez-vous, souvenirs, listes, événements, prénoms.'],
    ['🤰 Grossesse', 'le suivi au quotidien : semaines, rendez-vous, planning & démarches, journal, listes, prénoms, chambre, événements.'],
    ['🏥 Accouchement', 'le projet de naissance, les numéros utiles, le trajet, la valise, le chronomètre et le grand jour.'],
    ['👶 Bébé', 'après la naissance : fiche de naissance, carte, poids & taille, repas, premières fois, livre souvenir.'],
  ]],
  ['astuce', 'Tout se corrige : cliquez sur un élément pour le rouvrir et le modifier. Pensez à <b>💞 Partager & sauvegarder → 💾</b> de temps en temps.'],
]},

{ id: 'accueil', em: '🗓️', t: 'Le calendrier de grossesse', chapo: 'Votre semaine, en un coup d’œil.', b: [
  ['liste', [
    ['Semaine X sur 40', 'calculée chaque jour à partir de la date prévue. En dessous : les semaines d’aménorrhée (SA), le mois et le trimestre.'],
    ['Les 40 perles', 'une par semaine : celles déjà vécues sont allumées, celle de la semaine bat doucement.'],
    ['Le compte à rebours', 'les jours restants, en semaines + jours, et le pourcentage du chemin parcouru.'],
    ['La taille de bébé', 'une comparaison tendre avec un fruit, chaque semaine, et une petite idée d’organisation du moment.'],
  ]],
  ['p', 'Dans <b>🤰 Grossesse → 🌙 Semaine après semaine</b>, touchez n’importe quelle perle pour revoir une semaine passée ou découvrir une semaine à venir, avec les souvenirs, jalons et étapes qui s’y rattachent.'],
  ['astuce', 'Les comparaisons de taille sont des repères doux et approximatifs, pas une information médicale.'],
]},

{ id: 'rdv', em: '🩺', t: 'Rendez-vous & rappels', chapo: 'Sage-femme, échographies, préparation à la naissance…', b: [
  ['etapes', [
    'Cliquez <b>＋ Ajouter un rendez-vous</b> (accueil ou 🤰 Grossesse → 🩺 Rendez-vous).',
    'Choisissez le <b>type</b>, la date, l’heure, avec qui et où.',
    'Choisissez un <b>rappel</b> : le jour même, la veille, deux jours ou une semaine avant.',
    'Notez à l’avance <b>vos questions à poser</b>, puis, après le rendez-vous, <b>vos notes privées</b>.',
  ]],
  ['liste', [
    ['Les rappels', 'ils s’affichent en bandeau en haut de l’outil. Le ✕ les masque pour aujourd’hui.'],
    ['🔔 Rappels du navigateur', 'un bouton dans Rendez-vous les active : une notification apparaît même si l’onglet est en arrière-plan.'],
    ['📲 Calendrier du téléphone', 'chaque rendez-vous (ou tous d’un coup) s’exporte en fichier <b>.ics</b>, avec son rappel, à ouvrir sur votre téléphone ou dans votre agenda.'],
    ['🔒 Notes privées', 'elles ne sont jamais incluses dans un partage, sauf si vous le choisissez.'],
  ]],
]},

{ id: 'planning', em: '🧭', t: 'Planning & démarches', chapo: 'Quoi faire, et quand — placé automatiquement selon votre date prévue.', b: [
  ['p', 'Dans <b>🤰 Grossesse → 🧭 Planning & démarches</b>, deux frises : <b>pendant la grossesse</b> (suivi, inscription à la maternité, déclaration de grossesse, employeur, mode de garde, préparation à la naissance, prime CAF…) et <b>après la naissance</b> (mairie dans les 5 jours, CAF, Assurance Maladie, mutuelle, impôts dans les 60 jours…).'],
  ['liste', [
    ['✓ Cocher', 'la petite case marque une étape comme faite.'],
    ['Les filtres', 'Suivi, Démarches, Préparation, Pour bébé.'],
    ['Les congés', 'le congé maternité est calculé selon le nombre de bébés et d’enfants déjà à charge ; le congé du second parent aussi.'],
    ['Les liens', 'service-public.fr, ameli.fr, caf.fr, impots.gouv.fr pour vérifier votre situation.'],
  ]],
  ['astuce', 'Les dates d’après la naissance sont d’abord estimées sur la date prévue, puis se recalent dès que la naissance est enregistrée.'],
  ['exemple', 'Ces informations sont générales (France) et indicatives. Le calendrier des examens est toujours fixé avec votre professionnel de santé.'],
]},

{ id: 'journal', em: '💭', t: 'Journal & jalons', chapo: 'L’histoire de votre grossesse, écrite au fil des semaines.', b: [
  ['etapes', [
    'Cliquez <b>＋ Ajouter un souvenir</b>.',
    'Un titre, la date, <b>votre émotion</b>, ce que vous voulez garder, <b>l’envie du moment</b>, et une photo si vous voulez.',
    'Cochez <b>⭐ moment important</b> pour le mettre en avant, et <b>🔒 privé</b> pour qu’il ne soit jamais partagé.',
  ]],
  ['liste', [
    ['✨ Les jalons', 'première échographie, premiers mouvements, choix du prénom, valise bouclée… Touchez un jalon pour noter sa date, un mot et une photo. <b>Ajouter un jalon</b> crée les vôtres.'],
    ['Automatiques', 'certains jalons se remplissent tout seuls : sexe découvert, prénom choisi, valise complète.'],
  ]],
  ['astuce', 'Si un souvenir évoque une inquiétude, NaoBaby vous rappelle simplement de contacter votre sage-femme, votre médecin ou la maternité.'],
]},

{ id: 'listes', em: '🧺', t: 'Achats, liste de naissance & valise', chapo: 'Trois listes, au même endroit.', b: [
  ['liste', [
    ['🛍️ Achats pour bébé', 'rangés par catégorie (vêtements, sommeil, balade, voiture, repas, bain, change, soins, chambre). Quantités et prix ; la jauge suit vos achats. Une liste de départ est proposée.'],
    ['🎁 Liste de naissance', 'vos idées avec prix et lien. Touchez le statut pour passer de <b>Souhaité</b> à <b>Réservé</b> puis <b>Reçu</b>. <b>📋 Copier la liste</b> prépare un message à envoyer à vos proches.'],
    ['🧳 Valise maternité', 'documents, pour la maman, pour bébé, pour l’accompagnant·e. Quand tout est coché : petits confettis et jalon « valise bouclée ».'],
  ]],
  ['astuce', 'Pour des jumeaux ou des triplés, les quantités de départ sont multipliées (bodies, sièges auto, lits…).'],
]},

{ id: 'prenoms', em: '✍️', t: 'Prénoms & chambre', chapo: 'Choisir à deux, préparer le nid.', b: [
  ['sous', 'Les prénoms'],
  ['liste', [
    ['★ Les notes', 'chaque parent note de 1 à 5 étoiles : le classement se fait tout seul.'],
    ['💜 Coups de cœur', 'ils s’affichent côte à côte, avec le nom de famille pour entendre l’ensemble.'],
    ['C’est lui / c’est elle', 'attribue le prénom à bébé (ou à l’un des bébés) et crée le jalon.'],
  ]],
  ['sous', 'La chambre'],
  ['liste', [
    ['🎨 Palette', 'cinq couleurs à choisir, une ambiance en quelques mots.'],
    ['🪑 Meubles & budget', 'chaque meuble avec son prix ; la jauge compare au budget.'],
    ['✨ Inspirations', 'des photos qui vous plaisent, avec un mot.'],
  ]],
]},

{ id: 'evenements', em: '🎉', t: 'Baby shower & gender reveal', chapo: 'Organiser la fête, de A à Z.', b: [
  ['p', 'Dans <b>🤰 Grossesse → 🎉 Événements & invitations</b>, choisissez la <b>baby shower</b> ou la <b>gender reveal</b>.'],
  ['liste', [
    ['📅 Le jour J', 'date, heure, lieu, budget, thème. Le compte à rebours s’affiche aussi sur l’accueil.'],
    ['💌 Les invités', 'nom et contact ; touchez la réponse pour passer de ⏳ En attente à ✓ Vient ou ✕ Ne vient pas.'],
    ['✅ À faire', 'les tâches, avec une liste de départ proposée.'],
    ['💶 Le budget', 'chaque dépense, comparée au budget prévu.'],
    ['Idées', 'décoration, jeux, cadeaux, menu, idée de révélation, gâteau, ballons, playlist : touchez une idée pour l’ajouter.'],
  ]],
  ['astuce', 'Fumigènes : uniquement si vous les gérez en toute sécurité et selon les règles du lieu, à distance des invités, de la future maman et des enfants.'],
]},

{ id: 'invitations', em: '💌', t: 'Les invitations numériques', chapo: 'Une invitation animée, à envoyer à chaque invité.', b: [
  ['etapes', [
    'Choisissez un <b>modèle</b> dans la galerie : Classique, Arche, Nuages, Polaroïd, Ruban, Clair de lune, Bouquet, Guirlande, Petits pois, Épuré.',
    'Prenez une <b>idée de texte</b> ou écrivez le vôtre ; choisissez un emoji ou ajoutez une photo.',
    'Choisissez les <b>couleurs</b> et l’<b>animation</b> (étoiles, confettis, ballons, bulles, nuages, cœurs, paillettes, papillons).',
    'Choisissez <b>pour qui</b> : l’invitation porte alors son prénom.',
    'Téléchargez-la.',
  ]],
  ['liste', [
    ['✨ Invitation animée', 'une page qui s’ouvre et s’anime sur n’importe quel téléphone ou ordinateur.'],
    ['🖼️ En image', 'un PNG, pour les messageries.'],
    ['📋 Copier le texte', 'pour un SMS ou un message.'],
    ['✉️ / 💬', 'si l’invité a un e-mail ou un téléphone, un bouton prépare le message — c’est vous qui l’envoyez.'],
    ['📦 Une par invité', 'une invitation personnalisée pour chaque invité, d’un coup.'],
    ['🎲 Me surprendre', 'tire au hasard un modèle, des couleurs, une animation et un emoji.'],
  ]],
]},

{ id: 'sexe', em: '🎀', t: 'Découvrir le sexe de bébé', chapo: 'Un moment doux, quand vous êtes prêts.', b: [
  ['p', 'Le sexe de bébé ne se saisit que s’il vous a été <b>communiqué par un professionnel de santé</b>, ou si vous choisissez de l’indiquer vous-mêmes. Vous pouvez aussi garder la surprise jusqu’à la naissance.'],
  ['etapes', [
    'Touchez <b>🎀 Découvrir le sexe de bébé</b> (accueil, gender reveal ou ⚙️).',
    'Indiquez d’où vient l’information et la réponse — un proche peut le faire pour vous, en secret.',
    'Laissez cochée <b>🔒 Garder le secret</b> pour ouvrir l’enveloppe plus tard, tous ensemble.',
    'Le jour venu, touchez l’enveloppe : confettis doux, ruban, et la réponse. <b>⛶ Plein écran</b> pour la fête.',
  ]],
  ['liste', [
    ['Les couleurs de l’outil', 'une fois révélé, NaoBaby prend des touches de <b>rose</b> (fille), de <b>bleu</b> (garçon), ou des deux (jumeaux mixtes).'],
    ['Thème neutre', 'dans ⚙️, cochez « Garder un thème neutre » pour rester en lavande.'],
    ['Style de la révélation', 'rose ou bleu, violet, ou doré & crème.'],
  ]],
]},

{ id: 'accouchement', em: '🏥', t: 'Préparer l’accouchement', chapo: 'Aborder le grand jour l’esprit plus léger.', b: [
  ['liste', [
    ['🌿 Projet de naissance', 'vos souhaits (ambiance, personnes présentes, premiers instants…), à imprimer et à discuter avec votre sage-femme ou la maternité.'],
    ['📞 Numéros utiles', 'la maternité, vos contacts, et les urgences (15, 112), à appeler d’un clic.'],
    ['🗺️ Le trajet', 'l’adresse, le temps de trajet, ce qu’il faut savoir (entrée de nuit, parking) et l’itinéraire.'],
    ['⏱️ Chronomètre', 'notez le début et la fin de chaque contraction : durée et écart s’affichent, pour les donner à la maternité.'],
    ['👶 Le grand jour', 'enregistrez la naissance : l’espace Bébé s’ouvre.'],
  ]],
  ['astuce', 'Le chronomètre sert seulement à noter : il ne dit jamais quand partir. C’est la maternité qui vous guide — en cas de doute, appelez-la.'],
]},

{ id: 'bebe', em: '👶', t: 'L’espace Bébé', chapo: 'Après la naissance, les premiers mois.', b: [
  ['liste', [
    ['🌟 Naissance', 'prénom, date, heure, poids, taille, lieu, photo et premiers souvenirs.'],
    ['💌 Carte de naissance', 'une jolie carte en image avec la photo et les infos, avec les mêmes modèles et couleurs que les invitations. Téléchargez, partagez ou copiez l’annonce.'],
    ['📈 Poids & taille', 'chaque mesure relevée en rendez-vous ; les courbes se dessinent au fil des mois.'],
    ['🥄 Repas & découvertes', 'chaque aliment goûté, sa texture et l’avis de bébé (😍 🙂 😐 🙅), avec des idées à découvrir.'],
    ['✨ Premières fois', 'premier sourire, première dent, premiers pas… notez la date : l’âge se calcule tout seul.'],
    ['📖 Livre souvenir', 'un livret PDF : grossesse, naissance, premières fois, croissance, repas. Choisissez « Enregistrer au format PDF » à l’impression.'],
  ]],
  ['astuce', 'Les courbes de référence sont dans le carnet de santé : c’est votre médecin qui les interprète avec vous. La diversification se fait selon ses conseils.'],
]},

{ id: 'multiples', em: '💞', t: 'Jumeaux, triplés et plus', chapo: 'Un carnet pour chacun, une histoire commune.', b: [
  ['liste', [
    ['Une fiche par bébé', 'chacun son prénom, son sexe, sa naissance, ses mesures, ses repas, ses premières fois. Un sélecteur en haut de l’espace Bébé passe de l’un à l’autre.'],
    ['Ce qui s’adapte', 'le congé maternité, les quantités des listes, les textes (« vos jumeaux », « vos triplées »…), la carte de naissance commune.'],
    ['Changer', 'dans ⚙️, à tout moment.'],
  ]],
]},

{ id: 'perte', em: '🕊️', t: 'Quand la grossesse s’arrête', chapo: 'Un espace doux, à votre rythme.', b: [
  ['p', 'Dans ⚙️, <b>« Notre grossesse s’est arrêtée »</b>. NaoBaby se fait plus doux : plus de compte à rebours, de listes ni de fêtes, mais un espace souvenir avec une bougie, vos mots, vos photos et votre journal.'],
  ['liste', [
    ['Pour des jumeaux', 'vous pouvez ne choisir qu’un bébé : il devient « étoile », reste nommé dans le carnet, et le suivi continue pour les autres.'],
    ['Vous n’êtes pas seuls', 'des associations (Agapa, Petite Émilie, SPAMA) et le 3114, jour et nuit.'],
    ['Revenir en arrière', 'tout est réversible depuis l’espace souvenir. Un nouveau carnet peut commencer un jour, en gardant celui-ci dans « Nos carnets gardés ».'],
  ]],
]},

{ id: 'partage', em: '💾', t: 'Partager, sauvegarder, recommencer', chapo: 'Garder son carnet à l’abri, le partager avec son ou sa partenaire.', b: [
  ['liste', [
    ['💞 Partager', 'crée un fichier protégé par un mot de passe, à envoyer à votre partenaire. Il ou elle l’ouvre avec 📂 Ouvrir un fichier. Les éléments privés n’y sont pas, sauf choix contraire.'],
    ['💾 Sauvegarder', 'un fichier de tout le carnet, à garder en lieu sûr (clé USB, autre ordinateur).'],
    ['📂 Ouvrir un fichier', 'remet un carnet sauvegardé ou partagé.'],
    ['🌱 Nouveau carnet', 'efface ce carnet pour en commencer un nouveau, en gardant si vous voulez vos prénoms et la maternité.'],
    ['♻️ Réinitialiser l’outil', 'tout effacer, comme pour un nouvel utilisateur : il faut écrire <b>EFFACER</b>. Une sauvegarde est proposée juste avant.'],
  ]],
  ['astuce', 'Le carnet est rangé dans ce navigateur, pour cette adresse. Avant de changer d’ordinateur ou de nettoyer le navigateur, faites une sauvegarde. Les photos prennent de la place : sauvegardez régulièrement.'],
]},

{ id: 'sante', em: '🤍', t: 'Ce que NaoBaby ne fait pas', chapo: 'Un carnet d’organisation et de souvenirs, pas un avis médical.', b: [
  ['p', 'NaoBaby ne pose <b>aucun diagnostic</b>, n’interprète <b>aucun symptôme</b> et ne remplace jamais une sage-femme, un médecin ou la maternité.'],
  ['astuce', 'Si quelque chose vous inquiète, appelez votre sage-femme, votre médecin ou la maternité, même pour une petite question. En cas d’urgence : <b>15</b> ou <b>112</b>.'],
]},

{ id: 'clavier', em: '⌨️', t: 'Raccourcis & réglages', chapo: 'Pour aller vite.', b: [
  ['liste', [
    ['F1 ou ?', 'ouvrir cette aide'],
    ['Ctrl + S', 'partager & sauvegarder'],
    ['Échap', 'fermer la fenêtre ouverte'],
    ['🌙 / ☀️', 'le bouton en haut à droite passe du thème sombre au thème clair.'],
    ['L’ouverture', 'l’animation d’entrée se passe d’un clic, ou avec Entrée / Échap.'],
  ]],
]},
];

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🤍</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  $$('.voile').forEach(x => x.remove());
  const v = fenetre(`<div class="fenetre aide" role="dialog" aria-modal="true" aria-labelledby="t-aide">
    <div class="aide-h">
      <div><h2 id="t-aide">❓ Comment ça marche</h2>
        <p class="chapo" style="margin:2px 0 0">Tout NaoBaby, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span style="flex:1"></span>
      <input type="search" id="aide-q" placeholder="Chercher : rappel, invitation, jumeaux…" aria-label="Chercher dans l’aide">
      <button type="button" class="btn" data-act="fermer">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>
  </div>`, 'aide');
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
  /* la recherche garde les sujets dont le texte contient les mots tapés */
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
  if (matchMedia('(pointer:fine)').matches) setTimeout(() => q.focus(), 60);
}
ACTIONS.aide = el => ouvrirAide(el && el.dataset ? el.dataset.s : undefined);
document.addEventListener('keydown', e => {
  if (document.getElementById('intro')) return;
  if (e.key === 'F1' || (e.key === '?' && !e.target.matches('input, textarea, select'))) { e.preventDefault(); ouvrirAide(); }
});
