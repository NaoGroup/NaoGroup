'use strict';
/* ============================================================
   NaoHome — navigation, saisies, sauvegarde & démarrage
   ============================================================ */
const onglets = () => [
  ['accueil', '🏠 Accueil'], ['carnet', '📖 Carnet de famille'],
  ...(aPiscine() ? [['piscine', '🏊 Piscine']] : []),
  ['menage', '🧹 Ménage'], ['sports', '🏅 Sports'], ['copains', '🎒 Copains'], ['annuaire', '📇 Annuaire'],
];
let pageAffichee = '';
function rendre() {
  const choix = !S.logement.type;
  if (choix) V.page = 'accueil';
  if (!onglets().some(o => o[0] === V.page)) V.page = 'accueil';
  $('#pages').hidden = choix;
  $('#pages').innerHTML = onglets().map(([p, l]) => `<button class="${V.page === p ? 'on' : ''}" data-act="go" data-p="${p}">${l}</button>`).join('');
  rendreRappels();
  const vue = $('#vue'), y = scrollY;
  vue.innerHTML = (S.exemple && !choix ? `<div class="note-douce" style="margin-top:0"><span class="em">✨</span><div>Vous découvrez NaoHome avec une <b>famille d’exemple</b> (les Martin, entièrement inventés). Quand vous êtes prêt·e, repartez d’une page blanche pour votre propre foyer.</div>
      <button class="btn petit" style="margin-left:auto;flex:none" data-act="effacer-exemple">🌱 Commencer avec mon foyer</button></div>` : '') + (PAGES[V.page] || PAGES.accueil)();
  /* un changement de page glisse en place ; une simple mise à jour ne fait rien bouger */
  if (pageAffichee !== V.page + V.sous[V.page]) { vue.classList.remove('glisse'); void vue.offsetWidth; vue.classList.add('glisse'); }
  else scrollTo({ top: y });
  pageAffichee = V.page + V.sous[V.page];
  try { localStorage.setItem('naohome.vue', JSON.stringify({ page: V.page, sous: V.sous, piece: V.piece })); } catch (e) {}
}
ACTIONS.go = el => { V.page = el.dataset.p; if (el.dataset.s) V.sous[V.page] = el.dataset.s; fermer(null, true); rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACTIONS.sous = el => { V.sous[el.dataset.p] = el.dataset.s; rendre(); };
ACTIONS.theme = () => appliquerTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
ACTIONS.fermer = () => fermer();
ACTIONS.masquer = el => {
  let m = [];
  try { m = JSON.parse(sessionStorage.getItem('naohome.masques') || '[]'); } catch (e) {}
  m.push(el.dataset.id);
  try { sessionStorage.setItem('naohome.masques', JSON.stringify(m)); } catch (e) {}
  rendreRappels();
};
ACTIONS.devoiler = el => {
  const id = el.dataset.id;
  if (DEVOILES.has(id)) DEVOILES.delete(id); else { DEVOILES.add(id); setTimeout(() => { if (DEVOILES.delete(id)) majOuverte(); }, 30000); }
  majOuverte();
};
/* redessine la page, et la fiche ouverte s'il y en a une */
function majOuverte() {
  const v = [...document.querySelectorAll('.voile:not(.ferme)')].pop();
  rendre();
  if (v && v._redessiner) v._redessiner();
}

/* ============================================================
   Le logement
   ============================================================ */
ACTIONS['logement-type'] = el => {
  const t = el.dataset.t;
  if (t === 'appartement') { Object.assign(S.logement, { type: 'appartement', piscine: false }); V.typeChoisi = ''; sauver(); toast('🏢', 'Un appartement, c’est noté', 'Composez maintenant votre foyer dans le carnet de famille.'); return; }
  V.typeChoisi = 'maison'; rendre(); scrollTo({ top: 0, behavior: 'smooth' });
};
ACTIONS['logement-piscine'] = el => {
  const p = el.dataset.v === '1';
  Object.assign(S.logement, { type: 'maison', piscine: p }); V.typeChoisi = ''; sauver();
  toast(p ? '🏊' : '🏡', p ? 'Une maison avec piscine' : 'Une maison', p ? 'La page Piscine est dans le menu.' : 'Composez maintenant votre foyer dans le carnet de famille.');
};
ACTIONS['logement-retour'] = () => { V.typeChoisi = ''; rendre(); };
ACTIONS.logement = () => {
  const L = S.logement;
  formulaire({
    titre: '🏠 Mon logement', chapo: 'Changer de logement ne supprime rien : les pièces, les tâches et le suivi de la piscine restent gardés.',
    valeurs: { ...L, piscine: L.piscine ? '1' : '0' },
    champs: [
      { k: 'type', lab: 'Nous vivons dans', type: 'choix', large: true, options: [['maison', '🏡 Une maison'], ['appartement', '🏢 Un appartement']] },
      { k: 'piscine', lab: 'Piscine', type: 'choix', large: true, options: [['1', '🏊 Avec piscine'], ['0', 'Sans piscine']] },
      { k: 'nom', lab: 'Nom du logement (facultatif)', place: 'Ex. : La maison des Tilleuls' },
      { k: 'etage', lab: 'Étage', place: 'Ex. : 3e' },
      { k: 'adresse', lab: 'Adresse', large: true },
      { k: 'sp', type: 'sep', lab: 'La piscine' },
      { k: 'volume', lab: 'Volume de la piscine (m³)', type: 'number', min: 0, step: '0.5', aide: 'Longueur × largeur × profondeur moyenne. Sert à calculer le tiers à renouveler chaque année.' },
      { k: 'joursMesure', lab: 'Jours de mesure du pH et du chlore (2 par semaine)', type: 'jours', large: true },
    ],
    apres: f => {
      const maj = () => {
        const appart = (f.querySelector('[name="type"]:checked') || {}).value === 'appartement';
        const pis = (f.querySelector('[name="piscine"]:checked') || {}).value === '1';
        f.querySelector('[data-bloc="etage"]').style.display = appart ? '' : 'none';
        for (const b of ['sp', 'volume', 'joursMesure']) f.querySelector(`[data-bloc="${b}"]`).style.display = pis ? '' : 'none';
      };
      f.addEventListener('change', maj); maj();
    },
    enregistrer: v => {
      if (v.piscine === '1' && v.joursMesure.length !== 2) toast('🧪', 'Deux jours de mesure, c’est l’idéal', v.joursMesure.length ? 'Vous en avez choisi ' + v.joursMesure.length + ' : NaoHome s’en servira tel quel.' : 'Aucun choisi : mercredi et samedi sont gardés.');
      if (!v.joursMesure.length) v.joursMesure = [3, 6];
      const avait = L.piscine;
      Object.assign(L, v, { piscine: v.piscine === '1' });
      if (L.piscine && !avait) toast('🏊', 'La page Piscine est ajoutée', 'Entretien, pH, chlore et filtration.');
    },
  });
};

/* ============================================================
   Le carnet de famille
   ============================================================ */
ACTIONS.membre = el => {
  const id = el && el.dataset.id, m = id ? membre(id) : null, neuf = !m;
  const genre = m ? m.genre : (el && el.dataset.genre) || 'adulte';
  fermer(null, true);
  const animal = genre === 'animal';
  const champs = animal ? [
    { k: 'photo', lab: 'Photo', type: 'photo', large: true },
    { k: 'prenom', lab: 'Nom de l’animal', req: true, place: 'Ex. : Pixel' },
    { k: 'espece', lab: 'Espèce', type: 'select', options: ESPECES },
    { k: 'race', lab: 'Race', place: 'Ex. : européen' },
    { k: 'naissance', lab: 'Date de naissance', type: 'date', aide: 'Même approximative.' },
    { k: 'puce', lab: 'Puce / tatouage', place: 'Numéro d’identification' },
    { k: 'veto', lab: 'Vétérinaire', place: 'Nom et téléphone' },
    { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 },
    { k: 'sp', type: 'sep', lab: 'NaoPets' },
    { k: 'pets', type: 'case', large: true, texte: '🐾 Rattacher à NaoPets pour ses repas, ses soins et son carnet de santé', aide: 'Son nom, son espèce, sa race, sa date de naissance, sa puce, son vétérinaire et sa photo sont préparés pour NaoPets : il y arrive tout seul, rien à retaper. Les notes restent ici.' },
  ] : [
    { k: 'photo', lab: 'Photo du profil', type: 'photo', large: true },
    { k: 'genre', lab: 'C’est', type: 'choix', large: true, options: [['adulte', '👤 Un adulte'], ['enfant', '🧒 Un enfant']] },
    { k: 'prenom', lab: 'Prénom', req: true, auto: 'off' }, { k: 'nom', lab: 'Nom', auto: 'off' },
    { k: 'naissance', lab: 'Date de naissance', type: 'date' },
    { k: 'sexe', lab: 'Sexe', type: 'select', options: [['', '—'], ['femme', '♀ Femme'], ['homme', '♂ Homme']], aide: 'Sert à NaoSanté : IMC, masse grasse, vaccins.' },
    { k: 'lien', lab: 'Place dans le foyer', type: 'select', options: [['', '—'], ...(genre === 'enfant' ? LIENS_ENFANT : LIENS_ADULTE).map(x => [x, x]), ...(genre === 'enfant' ? LIENS_ADULTE : LIENS_ENFANT).map(x => [x, x])] },
    { k: 'st', type: 'sep', lab: 'Le travail' },
    { k: 'entreprise', lab: 'Entreprise' }, { k: 'poste', lab: 'Poste' },
    { k: 'entree', lab: 'Date d’entrée', type: 'date' }, { k: 'matricule', lab: 'Matricule' },
    { k: 'telPro', lab: 'Numéro pro', type: 'tel' }, { k: 'emailPro', lab: 'E-mail pro', type: 'email' },
    { k: 'se', type: 'sep', lab: 'Les études' },
    { k: 'etablissement', lab: 'Nom de l’établissement', large: true, place: 'Ex. : École Jules-Ferry' },
    { k: 'classe', lab: 'Classe', place: 'Ex. : CM2, 4e B' }, { k: 'prof', lab: 'Professeur principal', place: 'Ex. : Mme Bernard' },
    { k: 'telEcole', lab: 'Numéro de l’école', type: 'tel' }, { k: 'adresseEcole', lab: 'Adresse de l’école' },
    { k: 'sc', type: 'sep', lab: 'Coordonnées' },
    { k: 'tel', lab: 'Téléphone', type: 'tel' }, { k: 'email', lab: 'E-mail', type: 'email' },
    { k: 'secu', lab: 'N° de sécurité sociale', large: true, aide: 'Facultatif. Gardé sur cet ordinateur, masqué à l’écran. Mis à jour dans NaoSanté si la personne y est rattachée.' },
    { k: 'ss', type: 'sep', lab: 'NaoSanté' },
    { k: 'moi', type: 'case', large: true, texte: '🙋 C’est moi (la personne qui utilise NaoGroup)', aide: 'Dans NaoSanté, cette personne devient « Moi » : plus de doublon entre « Moi » et votre prénom. Une seule personne peut l’être.' },
    { k: 'sante', type: 'case', large: true, texte: '🩺 Rattacher à NaoSanté pour la fiche médicale', aide: 'Son prénom, son nom, sa date de naissance, son sexe, son n° de sécurité sociale et ses sports sont préparés pour NaoSanté : rien à retaper deux fois. Aucune information de travail ou d’école n’y est transmise.' },
    { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 },
  ];
  const v = formulaire({
    titre: neuf ? (animal ? '🐾 Un animal au foyer' : genre === 'enfant' ? '🧒 Un enfant au foyer' : '👤 Un adulte au foyer') : `✏️ La fiche de ${esc(m.prenom)}`, large: true,
    chapo: neuf ? 'Une fiche, une seule fois : elle sert partout dans NaoHome. Seul le prénom est obligatoire, le reste se complète quand vous voulez.' : '',
    valeurs: m || { genre, espece: 'chat', sante: false },
    champs,
    texteOk: neuf ? '➕ Ajouter au carnet' : 'Enregistrer',
    supprimer: neuf ? null : () => {
      S.membres = S.membres.filter(x => x.id !== id);
      S.sports = S.sports.filter(x => x.membre !== id);
      S.copains = S.copains.filter(x => x.enfant !== id);
      S.taches.forEach(t => { if (t.qui === id) t.qui = ''; });
      S.annuaire.forEach(a => { if (a.membres) a.membres = a.membres.filter(x => x !== id); });
    },
    apres: f => { if (!animal) basculer(f, 'genre', { st: x => x !== 'enfant', entreprise: x => x !== 'enfant', poste: x => x !== 'enfant', entree: x => x !== 'enfant', matricule: x => x !== 'enfant', telPro: x => x !== 'enfant', emailPro: x => x !== 'enfant',
      se: x => x === 'enfant', etablissement: x => x === 'enfant', classe: x => x === 'enfant', prof: x => x === 'enfant', telEcole: x => x === 'enfant', adresseEcole: x => x === 'enfant' }); },
    enregistrer: val => {
      if (animal) val.genre = 'animal';
      if (!val.genre) val.genre = genre;
      const cible = m || { id: uid(), cree: cle(auj()) };
      const avant = m && (animal ? m.pets : m.sante);
      Object.assign(cible, val);
      if (!animal && val.moi) S.membres.forEach(x => { if (x !== cible) x.moi = false; });
      if (neuf) { S.membres.push(cible); toast(animal ? '🐾' : '📖', `${cible.prenom} rejoint le carnet`, val.sante ? 'Rattaché·e à NaoSanté.' : val.pets ? 'Rattaché·e à NaoPets.' : 'Sa fiche est prête.'); }
      else if (animal && val.pets && !avant) toast('🐾', `${cible.prenom} est rattaché·e à NaoPets`, 'Sa fiche est préparée : NaoPets l’accueille à sa prochaine ouverture.');
      else if (!animal && val.sante && !avant) toast('🩺', `${cible.prenom} est rattaché·e à NaoSanté`, 'Son identité et ses sports sont préparés pour NaoSanté.');
    },
  });
  return v;
};
ACTIONS['voir-membre'] = el => {
  const m = membre(el.dataset.id); if (!m) return;
  const contenu = () => {
    const age = ageDe(m.naissance), sp = S.sports.filter(s => s.membre === m.id);
    const ligne = (lab, val) => val ? `<div><span>${lab}</span><b>${val}</b></div>` : '';
    let g = '';
    if (m.genre === 'animal') g = ligne('Espèce', esc((ESPECES.find(e => e[0] === m.espece) || ESPECES[8])[1])) + ligne('Race', esc(m.race)) + ligne('Naissance', m.naissance ? dateMoy(lire(m.naissance)) : '') + ligne('Puce / tatouage', m.puce ? secret(m.puce, 'puce-' + m.id) : '') + ligne('Vétérinaire', esc(m.veto));
    else {
      g = ligne('Naissance', m.naissance ? dateMoy(lire(m.naissance)) : '') + ligne('Sexe', m.sexe === 'femme' ? '♀ Femme' : m.sexe === 'homme' ? '♂ Homme' : '') + ligne('Place dans le foyer', esc(m.lien)) + ligne('Téléphone', telLien(m.tel)) + ligne('E-mail', mailLien(m.email)) + ligne('Sécurité sociale', m.secu ? secret(m.secu, 'secu-' + m.id) : '');
      if (m.genre === 'adulte') g += ligne('Entreprise', esc(m.entreprise)) + ligne('Poste', esc(m.poste)) + ligne('Date d’entrée', m.entree ? dateMoy(lire(m.entree)) : '') + ligne('Matricule', m.matricule ? secret(m.matricule, 'mat-' + m.id) : '') + ligne('Numéro pro', telLien(m.telPro)) + ligne('E-mail pro', mailLien(m.emailPro));
      else g += ligne('Établissement', esc(m.etablissement)) + ligne('Classe', esc(m.classe)) + ligne('Professeur principal', esc(m.prof)) + ligne('Numéro de l’école', telLien(m.telEcole)) + ligne('Adresse de l’école', esc(m.adresseEcole));
    }
    return `<div class="fenetre large" role="dialog" aria-modal="true" aria-labelledby="t-fiche">
      <div class="fiche-tete">${avatar(m)}<div><div class="freq">Carnet de famille</div><h2 id="t-fiche">${esc(nomComplet(m))}</h2>
        <p class="chapo" style="margin:2px 0 6px">${esc(m.lien || (m.genre === 'enfant' ? 'Enfant' : m.genre === 'animal' ? 'Animal du foyer' : 'Adulte'))}${age ? ' · ' + age : ''}</p>
        ${m.moi ? '<span class="pastille sante">🙋 C’est moi</span> ' : ''}${m.genre !== 'animal' ? (m.sante ? '<span class="pastille sante">🩺 Rattaché·e à NaoSanté</span>' : '<span class="pastille">Pas rattaché·e à NaoSanté</span>')
          : (m.pets ? '<span class="pastille sante">🐾 Rattaché·e à NaoPets</span>' : '<span class="pastille">Pas rattaché·e à NaoPets</span>')}</div></div>
      ${g ? `<div class="fiche-grille">${g}</div>` : '<p class="vide">Fiche encore vide : ✏️ Modifier pour la compléter.</p>'}
      ${m.notes ? `<div class="imp" style="margin-top:12px"><div class="t">📝 Notes</div><p>${esc(m.notes)}</p></div>` : ''}
      ${m.genre !== 'animal' ? `<div class="sep" style="margin:18px 0 8px">Les sports</div>${sp.length ? sp.map(carteSport).join('') : '<div class="vide">Aucun sport noté.</div>'}` : ''}
      ${m.genre === 'enfant' ? `<div class="sep" style="margin:18px 0 8px">Les copains</div><div class="vide">${pluriel(S.copains.filter(c => c.enfant === m.id).length, 'copain noté', 'copains notés')}</div>` : ''}
      <div class="pied">${m.genre !== 'animal' ? `<button class="btn" data-act="sport" data-membre="${m.id}">🏅 Un sport</button>` : ''}
        ${m.genre === 'enfant' ? `<button class="btn" data-act="go" data-p="copains">🎒 Ses copains</button>` : ''}
        <div class="spacer"></div><button class="btn" data-act="fermer">Fermer</button><button class="btn plein" data-act="membre" data-id="${m.id}">✏️ Modifier</button></div></div>`;
  };
  const v = fenetre(contenu());
  v._redessiner = () => { v.innerHTML = contenu(); };
};
ACTIONS.confiance = el => {
  const id = el && el.dataset.id, c = id ? S.confiance.find(x => x.id === id) : null;
  if (!c && S.confiance.length >= 2) { toast('🤝', 'Deux personnes de confiance au plus', 'Modifiez l’une d’elles si besoin.'); return; }
  formulaire({
    titre: c ? `🤝 ${esc(nomComplet(c))}` : '🤝 Une personne de confiance',
    chapo: 'Celle qu’on appelle si l’on ne peut pas vous joindre : elle peut venir chercher les enfants, garder la maison, prévenir la famille.',
    valeurs: c || {},
    champs: [
      { k: 'photo', lab: 'Photo', type: 'photo', large: true },
      { k: 'prenom', lab: 'Prénom', req: true }, { k: 'nom', lab: 'Nom' },
      { k: 'lien', lab: 'Lien avec la famille', place: 'Ex. : grand-mère, voisine, marraine' },
      { k: 'tel', lab: 'Téléphone', type: 'tel' }, { k: 'email', lab: 'E-mail', type: 'email' },
      { k: 'adresse', lab: 'Adresse' },
      { k: 'notes', lab: 'Ce qu’elle peut faire', type: 'textarea', large: true, rows: 2, place: 'Ex. : autorisée à récupérer les enfants à l’école, a un double des clés' },
    ],
    supprimer: c ? () => { S.confiance = S.confiance.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (c) Object.assign(c, v); else { S.confiance.push({ id: uid(), ...v }); toast('🤝', `${v.prenom} est une personne de confiance`); } },
  });
};

/* ============================================================
   Sports, copains, annuaire
   ============================================================ */
const optsPersonnes = () => personnes().map(m => [m.id, `${m.genre === 'enfant' ? '🧒' : '👤'} ${nomComplet(m)}`]);
ACTIONS['sport-pour'] = el => { V.sportPour = el.dataset.id; rendre(); };
ACTIONS.sport = el => {
  if (!personnes().length) { toast('📖', 'Ajoutez d’abord quelqu’un au carnet'); return; }
  const id = el && el.dataset.id, s = id ? S.sports.find(x => x.id === id) : null;
  fermer(null, true);
  const an = auj().getFullYear();
  formulaire({
    titre: s ? `${emSport(s.sport)} ${esc(s.sport)}` : '🏅 Un sport', large: true,
    chapo: 'Un sport d’aujourd’hui, ou un sport pratiqué il y a longtemps : laissez « jusqu’en » vide s’il continue.',
    valeurs: s ? { ...s, compet: s.compet ? '1' : '' } : { membre: (el && el.dataset.membre) || V.sportPour || personnes()[0].id, debut: String(an), compet: '' },
    champs: [
      { k: 'membre', lab: 'Qui', type: 'select', options: optsPersonnes() },
      { k: 'sport', lab: 'Sport', req: true, place: 'Ex. : judo, natation, football' },
      { k: 'club', lab: 'Club / association', place: 'Ex. : Judo Club de la Vallée' },
      { k: 'licence', lab: 'N° de licence' },
      { k: 'adresse', lab: 'Adresse du club', large: true },
      { k: 'horaires', lab: 'Jours et horaires', place: 'Ex. : mercredi 14 h – 15 h 30', large: true },
      { k: 'debut', lab: 'Depuis (année)', type: 'number', min: 1900, max: an + 1, step: '1' },
      { k: 'fin', lab: 'Jusqu’en (année, vide = en cours)', type: 'number', min: 1900, max: an + 1, step: '1' },
      { k: 'compet', lab: 'Pratique', type: 'choix', large: true, options: [['', '🙂 Loisir, sans compétition'], ['1', '🏆 Avec compétition']] },
      { k: 'niveau', lab: 'Niveau acquis', place: 'Ex. : ceinture verte, Étoile 2, régional', large: true },
      { k: 'sm', type: 'sep', lab: 'Médailles' },
      { k: 'or', lab: '🥇 Or', type: 'number', min: 0, step: '1' }, { k: 'argent', lab: '🥈 Argent', type: 'number', min: 0, step: '1' },
      { k: 'bronze', lab: '🥉 Bronze', type: 'number', min: 0, step: '1' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : certificat médical à renouveler en septembre' },
    ],
    supprimer: s ? () => { S.sports = S.sports.filter(x => x.id !== id); } : null,
    apres: f => basculer(f, 'compet', { sm: v => v === '1', or: v => v === '1', argent: v => v === '1', bronze: v => v === '1' }),
    enregistrer: v => {
      if (v.fin && v.debut && Number(v.fin) < Number(v.debut)) { toast('📅', 'L’année de fin est avant l’année de début'); return false; }
      v.compet = v.compet === '1';
      if (!v.compet) { v.or = v.argent = v.bronze = ''; }
      if (s) Object.assign(s, v); else { S.sports.push({ id: uid(), ...v }); toast(emSport(v.sport), `${v.sport} noté pour ${prenomDe(v.membre)}`, membre(v.membre)?.sante ? 'Aussi préparé pour NaoSanté.' : ''); }
    },
  });
};
ACTIONS.copain = el => {
  if (!enfants().length) { toast('🧒', 'Ajoutez d’abord un enfant au carnet'); return; }
  const id = el && el.dataset.id, c = id ? S.copains.find(x => x.id === id) : null;
  const e = c ? membre(c.enfant) : membre((el && el.dataset.enfant) || '') || enfants()[0];
  formulaire({
    titre: c ? `🎒 ${esc(c.copain)}` : '🎒 Un copain, une copine',
    valeurs: c || { enfant: e.id, classe: e.classe || '' },
    champs: [
      { k: 'enfant', lab: 'Copain de', type: 'select', options: enfants().map(x => [x.id, x.prenom]) },
      { k: 'copain', lab: 'Prénom du copain / de la copine', req: true },
      { k: 'classe', lab: 'Classe', place: 'Ex. : CM2 B' },
      { k: 'parents', lab: 'Noms des parents', place: 'Ex. : Sophie et Marc Durand', large: true },
      { k: 'tel', lab: 'Téléphone', type: 'tel' }, { k: 'tel2', lab: 'Autre téléphone', type: 'tel' },
      { k: 'email', lab: 'E-mail', type: 'email' }, { k: 'adresse', lab: 'Adresse' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : allergie aux arachides, anniversaire le 12 mai, covoiturage le mercredi' },
    ],
    supprimer: c ? () => { S.copains = S.copains.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (c) Object.assign(c, v); else { S.copains.push({ id: uid(), ...v }); toast('🎒', `${v.copain} ajouté·e aux copains de ${prenomDe(v.enfant)}`); } },
  });
};
ACTIONS['contact-annuaire'] = el => {
  const id = el && el.dataset.id, a = id ? S.annuaire.find(x => x.id === id) : null;
  formulaire({
    titre: a ? `${(T_ANNUAIRE[a.type] || T_ANNUAIRE.autre)[0]} ${esc(a.nom || (T_ANNUAIRE[a.type] || T_ANNUAIRE.autre)[1])}` : '📇 Un contact de l’annuaire', large: true,
    valeurs: a || { type: (el && el.dataset.type) || 'mutuelle', membres: [] },
    champs: [
      { k: 'type', lab: 'Type', type: 'select', options: opts(T_ANNUAIRE) },
      { k: 'nom', lab: 'Nom (compagnie, organisme)', place: 'Ex. : Mutuelle des Familles' },
      { k: 'contrat', lab: 'N° de contrat / d’adhérent', aide: 'Masqué à l’écran.' },
      { k: 'tel', lab: 'Téléphone', type: 'tel' }, { k: 'email', lab: 'E-mail', type: 'email' },
      { k: 'site', lab: 'Site internet', place: 'Ex. : www.exemple.fr' },
      { k: 'adresse', lab: 'Adresse', large: true },
      ...(personnes().length ? [{ k: 'membres', lab: 'Pour qui (aucun coché = toute la famille)', type: 'multi', large: true, options: personnes().map(m => [m.id, esc(m.prenom || m.nom)]) }] : []),
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : échéance en janvier, franchise, conseiller' },
    ],
    supprimer: a ? () => { S.annuaire = S.annuaire.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (a) Object.assign(a, v); else S.annuaire.push({ id: uid(), ...v }); },
  });
};

/* ============================================================
   La piscine
   ============================================================ */
ACTIONS.mesure = el => {
  const id = el && el.dataset.id, m = id ? S.piscine.mesures.find(x => x.id === id) : null;
  const n = new Date();
  const v = formulaire({
    titre: m ? '🧪 La mesure' : '🧪 Noter une mesure',
    chapo: 'Avec une trousse d’analyse ou des bandelettes. pH idéal : <b>7,2 à 7,4</b> · chlore libre idéal : <b>1,5 à 2 mg/L</b>.',
    valeurs: m || { date: cle(auj()), heure: `${pad(n.getHours())}:${pad(n.getMinutes())}`, temp: (derniereMesure('temp') || {}).temp || '' },
    champs: [
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'ph', lab: 'pH', type: 'number', step: '0.1', min: 5, max: 9, place: 'Ex. : 7,3' },
      { k: 'chlore', lab: 'Chlore libre (mg/L)', type: 'number', step: '0.1', min: 0, max: 10, place: 'Ex. : 1,8' },
      { k: 'temp', lab: 'Température de l’eau (°C)', type: 'number', step: '0.5', min: 0, max: 40 },
      { k: 'note', lab: 'Note', place: 'Ex. : après l’orage, pH+ ajouté' },
      { k: 'avis', type: 'html', large: true, html: '<div id="avis-mesure"></div>' },
    ],
    supprimer: m ? () => { S.piscine.mesures = S.piscine.mesures.filter(x => x.id !== id); } : null,
    apres: f => {
      const maj = () => {
        const ph = f.querySelector('[name="ph"]').value, cl = f.querySelector('[name="chlore"]').value, t = f.querySelector('[name="temp"]').value;
        const l = [];
        if (ph !== '') l.push(`<div class="note-douce"><span class="em">${{ ok: '🟢', att: '🟠', mal: '🔴' }[evaluer(ph, PH)] || '•'}</span><div>${avisPh(ph)}</div></div>`);
        if (cl !== '') l.push(`<div class="note-douce"><span class="em">${{ ok: '🟢', att: '🟠', mal: '🔴' }[evaluer(cl, CHLORE)] || '•'}</span><div>${avisChlore(cl)}</div></div>`);
        if (t !== '' && heuresFiltration(t) != null) l.push(`<div class="note-douce"><span class="em">⏱️</span><div>À ${nbFr(nombre(t), 1)} °C : ${heuresFiltration(t) ? `<b>${nbFr(heuresFiltration(t), 1)} h</b> de filtration par jour.` : 'eau froide, période d’hivernage.'}</div></div>`);
        f.querySelector('#avis-mesure').innerHTML = l.join('');
      };
      f.addEventListener('input', maj); maj();
    },
    enregistrer: val => {
      if (val.ph === '' && val.chlore === '' && val.temp === '') { toast('🧪', 'Notez au moins une valeur'); return false; }
      for (const [k, lo, hi, nom] of [['ph', 4, 10, 'Le pH'], ['chlore', 0, 15, 'Le chlore'], ['temp', -2, 45, 'La température']])
        if (val[k] !== '' && !(nombre(val[k]) >= lo && nombre(val[k]) <= hi)) { toast('🧪', `${nom} semble faux`, `Une valeur entre ${lo} et ${hi} est attendue.`); return false; }
      for (const k of ['ph', 'chlore', 'temp']) if (val[k] !== '') val[k] = nombre(val[k]);
      delete val.avis;
      if (m) Object.assign(m, val); else S.piscine.mesures.push({ id: uid(), ...val });
      const e = [evaluer(val.ph, PH), evaluer(val.chlore, CHLORE)].filter(Boolean);
      if (!m) toast(e.includes('mal') ? '⚠️' : e.includes('att') ? '🟠' : '🟢', 'Mesure notée', e.includes('mal') ? 'Une valeur est à corriger : voyez le conseil dans la page Piscine.' : e.includes('att') ? 'Une valeur est à surveiller.' : 'L’eau est bien équilibrée.');
    },
  });
  return v;
};
ACTIONS.entretien = el => {
  const id = el && el.dataset.id, t = id ? S.piscine.entretien.find(x => x.id === id) : null;
  formulaire({
    titre: t ? `${t.em || '🧽'} ${esc(t.texte)}` : '🧽 Une tâche d’entretien',
    valeurs: t || { em: '🧽', tous: 7 },
    champs: [
      { k: 'texte', lab: 'La tâche', req: true, large: true, place: 'Ex. : Nettoyer le filtre' },
      { k: 'em', lab: 'Symbole', place: '🧽' },
      { k: 'tous', lab: 'Tous les … jours', type: 'number', min: 1, max: 730, step: '1', aide: '1 = chaque jour, 7 = chaque semaine, 365 = une fois par an.' },
      { k: 'conseil', lab: 'Conseil', type: 'textarea', large: true, rows: 2 },
    ],
    supprimer: t ? () => { S.piscine.entretien = S.piscine.entretien.filter(x => x.id !== id); delete S.piscine.fait[id]; } : null,
    enregistrer: v => {
      v.tous = Math.max(1, Math.round(nombre(v.tous)) || 7);
      if (t) Object.assign(t, v); else S.piscine.entretien.push({ id: uid(), ...v });
    },
  });
};
ACTIONS['entretien-fait'] = el => {
  const t = S.piscine.entretien.find(x => x.id === el.dataset.id); if (!t) return;
  S.piscine.fait[t.id] = cle(auj()); sauver();
  toast(t.em || '✓', `${t.texte} : fait`, `Prochaine fois ${Number(t.tous) === 365 ? 'dans un an' : dansJours(Number(t.tous) || 7)}.`);
};
document.addEventListener('input', e => {
  if (e.target.dataset.champ === 'temp-filtre') {
    /* on ne redessine que le cadran et la phrase : la case garde le curseur, la page ne bouge pas */
    const t = V.tempFiltre = e.target.value, hrs = heuresFiltration(t);
    const arc = $('#arc-filtre'), C = 2 * Math.PI * 58;
    if (arc) arc.setAttribute('stroke-dashoffset', (C * (1 - (hrs == null ? 0 : hrs / 24))).toFixed(1));
    const v = $('#val-filtre'); if (v) v.textContent = hrs == null ? '—' : nbFr(hrs, 1) + ' h';
    const p = $('#txt-filtre'); if (p) p.innerHTML = texteFiltration(t);
  }
});

/* ============================================================
   Le ménage
   ============================================================ */
function ajouterPiece(type) {
  const [, lib] = T_PIECE[type] || T_PIECE.autre;
  const meme = S.pieces.filter(p => p.type === type).length;
  const p = { id: uid(), type, nom: meme ? `${lib} ${meme + 1}` : lib };
  if (meme === 1) { const premiere = S.pieces.find(x => x.type === type); if (premiere && premiere.nom === lib) premiere.nom = lib + ' 1'; }
  S.pieces.push(p);
  return p;
}
ACTIONS['piece-vite'] = el => { const p = ajouterPiece(el.dataset.t); V.piece = p.id; sauver(); toast((T_PIECE[p.type] || T_PIECE.autre)[0], `${p.nom} ajouté${/e$|Salle|Cuisine|Chambre|Entrée|Buanderie|Cave|Terrasse/.test(p.nom) ? 'e' : ''}`); };
ACTIONS['pieces-proposees'] = () => {
  suggestionsPieces().forEach(ajouterPiece);
  if (aPiscine() && !S.pieces.some(p => p.nom === 'Abords de la piscine')) S.pieces.push({ id: uid(), type: 'terrasse', nom: 'Abords de la piscine' });
  V.piece = S.pieces[0].id; sauver();
  toast('✨', pluriel(S.pieces.length, 'pièce ajoutée', 'pièces ajoutées'), 'Renommez-les ou supprimez celles qui ne vous concernent pas avec ✏️.');
};
ACTIONS['piece-ajout'] = () => {
  formulaire({
    titre: '🚪 Une pièce',
    valeurs: { type: 'chambre' },
    champs: [
      { k: 'type', lab: 'Type de pièce', type: 'select', options: Object.entries(T_PIECE).map(([k, v]) => [k, `${v[0]} ${v[1]}`]) },
      { k: 'nom', lab: 'Son nom', place: 'Ex. : Chambre de Léa', aide: 'Laissez vide pour garder le nom du type.' },
    ],
    enregistrer: v => { const p = ajouterPiece(v.type); if (v.nom) p.nom = v.nom; V.piece = p.id; },
  });
};
ACTIONS.piece = el => {
  const p = S.pieces.find(x => x.id === el.dataset.id); if (!p) return;
  if (!el.dataset.modifier) { V.piece = p.id; rendre(); return; }
  formulaire({
    titre: `${(T_PIECE[p.type] || T_PIECE.autre)[0]} ${esc(p.nom)}`,
    valeurs: p,
    champs: [
      { k: 'nom', lab: 'Nom de la pièce', req: true },
      { k: 'type', lab: 'Type', type: 'select', options: Object.entries(T_PIECE).map(([k, v]) => [k, `${v[0]} ${v[1]}`]) },
    ],
    texteSup: '🗑️ Supprimer la pièce et ses tâches',
    supprimer: () => { S.pieces = S.pieces.filter(x => x.id !== p.id); const ids = S.taches.filter(t => t.piece === p.id).map(t => t.id); S.taches = S.taches.filter(t => t.piece !== p.id); ids.forEach(i => delete S.faits[i]); },
    enregistrer: v => { Object.assign(p, v); },
  });
};
const optsQui = () => [['', '— Personne pour l’instant'], ['tous', '👪 Tout le monde'], ...personnes().map(m => [m.id, `${m.genre === 'enfant' ? '🧒' : '👤'} ${m.prenom || m.nom}`])];
ACTIONS.tache = el => {
  if (!S.pieces.length) { toast('🚪', 'Ajoutez d’abord une pièce'); return; }
  const id = el && el.dataset.id, t = id ? S.taches.find(x => x.id === id) : null;
  formulaire({
    titre: t ? '🧹 La tâche' : '🧹 Une tâche de ménage',
    valeurs: t || { piece: (el && el.dataset.piece) || V.piece || S.pieces[0].id, freq: 'semaine', qui: '' },
    champs: [
      { k: 'texte', lab: 'La tâche', req: true, large: true, place: 'Ex. : Passer l’aspirateur' },
      { k: 'piece', lab: 'Pièce', type: 'select', options: S.pieces.map(p => [p.id, `${(T_PIECE[p.type] || T_PIECE.autre)[0]} ${p.nom}`]) },
      { k: 'qui', lab: 'Qui s’en occupe', type: 'select', options: optsQui() },
      { k: 'freq', lab: 'Combien de fois', type: 'choix', large: true, options: FREQ_MENAGE },
    ],
    supprimer: t ? () => { S.taches = S.taches.filter(x => x.id !== id); delete S.faits[id]; } : null,
    enregistrer: v => { if (t) Object.assign(t, v); else { S.taches.push({ id: uid(), ...v }); V.piece = v.piece; } },
  });
};
ACTIONS['tache-idee'] = el => {
  S.taches.push({ id: uid(), piece: el.dataset.piece, texte: el.dataset.t, freq: /draps|vitres|frigo|détartrer|tailler|trier|dépoussiérer l’écran/i.test(el.dataset.t) ? 'mois' : /vaisselle|lit|cartable|débarrasser|aérer/i.test(el.dataset.t) ? 'jour' : 'semaine', qui: '' });
  sauver();
  toast('🧹', `« ${el.dataset.t} » ajoutée`, 'Cliquez ✏️ pour choisir qui s’en occupe.');
};
ACTIONS['tache-faite'] = el => {
  const t = S.taches.find(x => x.id === el.dataset.id); if (!t) return;
  if (tacheFaite(t)) delete S.faits[t.id]; else S.faits[t.id] = periode(t.freq);
  sauver();
  const p = S.pieces.find(x => x.id === t.piece), l = S.taches.filter(x => x.piece === t.piece);
  if (tacheFaite(t) && l.length > 1 && l.every(tacheFaite)) toast('✨', `${p ? p.nom : 'La pièce'} : tout est fait`, 'Bravo à toute l’équipe !');
};

/* ============================================================
   Sauvegarde, chargement, réinitialisation, exemple
   ============================================================ */
function sauvegarderFichier() {
  telecharger(`naohome-sauvegarde-${cle(auj())}.json`, JSON.stringify({ naohome: 1, data: S }), 'application/json');
  toast('💾', 'Maison sauvegardée', 'Le fichier est dans vos téléchargements : « Ouvrir » permet de le recharger.');
}
ACTIONS.sauvegarde = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>💾 Sauvegarder & recharger</h2>
    <p class="chapo">NaoHome garde tout dans ce navigateur, sur cet ordinateur. Une sauvegarde régulière dans un fichier met le carnet de famille et le reste à l’abri.</p>
    <div class="note-douce"><span class="em">🔒</span><div>Le fichier contient les numéros sensibles (sécurité sociale, contrats, matricules) : rangez-le dans un endroit sûr, ne l’envoyez pas par e-mail.</div></div>
    <div class="pied" style="margin-top:6px"><button class="btn plein" data-x="sauver">💾 Sauvegarder dans un fichier</button><button class="btn" data-x="ouvrir">📂 Ouvrir une sauvegarde</button></div>
    <div class="pied"><div class="spacer"></div><button class="btn" data-act="fermer">Fermer</button></div></div>`);
  v.addEventListener('click', e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'sauver') sauvegarderFichier();
    if (x === 'ouvrir') { fermer(v); ACTIONS.ouvrir(); }
  });
};
/* remet l'outil à neuf, exactement comme à la toute première ouverture */
function reinitialiser() {
  try {
    /* les clés connues (dans NaoGroup, chacune est rangée dans l'espace du profil), puis toute autre clé naohome. */
    for (const k of [CLE_STOCK, CLE_PARTAGE, 'naohome.vue', 'naohome.theme']) localStorage.removeItem(k);
    for (const k of Object.keys(localStorage)) if (k.startsWith('naohome.')) localStorage.removeItem(k);
    sessionStorage.removeItem('naohome.masques');
  } catch (e) {}
  S = completer(vierge());
  Object.assign(V, { page: 'accueil', sous: { piscine: 'suivi', sports: 'liste' }, piece: '', sportPour: '', typeChoisi: '' });
  delete V.tempFiltre;
  DEVOILES.clear();
  enregistrer();
  appliquerTheme('dark');
  $$('.voile').forEach(x => x.remove());
  rendre(); scrollTo({ top: 0 });
  toast('🌱', 'NaoHome est comme neuf', 'Premier choix : dans quoi vivez-vous ?');
}
ACTIONS.reinitialiser = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>↺ Réinitialiser NaoHome</h2>
    <p class="chapo">L’outil redevient <b>vierge, comme pour un nouvel utilisateur</b> : le logement, le carnet de famille, les personnes de confiance, la piscine et ses mesures,
      les sports, les copains, l’annuaire, les pièces et les tâches du ménage seront <b>effacés de cet ordinateur</b>, ainsi que les préférences d’affichage.</p>
    <div class="note-douce"><span class="em">💾</span><div><b>Conseil :</b> gardez d’abord une sauvegarde. Vous pourrez la rouvrir plus tard avec 💾 → 📂 Ouvrir une sauvegarde.</div></div>
    <div class="pied"><button class="btn" data-act="fermer">Annuler</button><div class="spacer"></div>
      <button class="btn danger" data-r="sans">Effacer sans sauvegarder</button>
      <button class="btn plein" data-r="avec">💾 Sauvegarder, puis réinitialiser</button></div></div>`);
  v.addEventListener('click', async e => {
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'avec') { sauvegarderFichier(); fermer(v); setTimeout(reinitialiser, 600); return; }
    if (await confirmer('Tout effacer ?', 'Toutes les données de NaoHome seront <b>définitivement</b> effacées de cet ordinateur. Cette action ne peut pas être annulée.', 'Tout effacer')) reinitialiser();
  });
};
ACTIONS.ouvrir = () => { $('#fichier').value = ''; $('#fichier').click(); };
$('#fichier').addEventListener('change', async () => {
  const f = $('#fichier').files[0]; if (!f) return;
  let j;
  try { j = JSON.parse(await f.text()); } catch (e) { toast('📂', 'Fichier illisible', 'Ce n’est pas une sauvegarde NaoHome.'); return; }
  if (!j || !j.naohome || !j.data || !Array.isArray(j.data.membres)) { toast('📂', 'Fichier non reconnu', 'Ce n’est pas une sauvegarde NaoHome.'); return; }
  if ((S.logement.type || S.membres.length) && !await confirmer('Remplacer la maison ?', 'Les données de cet ordinateur seront remplacées par celles du fichier. <b>Conseil :</b> sauvegardez d’abord si vous voulez les garder.', 'Remplacer')) return;
  S = completer(j.data); V.page = 'accueil'; sauver();
  toast('📂', 'Maison chargée', pluriel(S.membres.length, 'membre') + ' au carnet');
});
ACTIONS['effacer-exemple'] = async () => {
  if (!await confirmer('Commencer avec votre foyer ?', 'La famille d’exemple sera effacée pour laisser place à la vôtre. Premier choix : dans quoi vivez-vous ?', 'C’est parti', false)) return;
  S = completer(vierge()); V.page = 'accueil'; V.typeChoisi = ''; sauver();
};
ACTIONS.exemple = () => {
  const a = auj(), an = a.getFullYear(), j = n => cle(plus(a, n));
  const ne = (ans, mois, jour) => cle(new Date(an - ans, mois, jour));
  const s = completer(vierge());
  s.exemple = true;
  s.logement = { type: 'maison', piscine: true, nom: 'La maison des Tilleuls', adresse: '12 allée des Tilleuls (adresse inventée)', volume: 48, joursMesure: [3, 6], etage: '' };
  const ju = uid() + 'a', ca = uid() + 'b', le = uid() + 'c', hu = uid() + 'd', px = uid() + 'e';
  s.membres = [
    { id: ju, genre: 'adulte', prenom: 'Julien', nom: 'Martin', sexe: 'homme', naissance: ne(38, 3, 14), lien: 'Parent', entreprise: 'Atelier Bois & Co', poste: 'Menuisier', entree: ne(9, 8, 1), matricule: 'AB-00417', telPro: '01 00 00 00 01', tel: '06 00 00 00 01', email: 'julien@exemple.fr', secu: '1 86 04 99 000 000 00', sante: true },
    { id: ca, genre: 'adulte', prenom: 'Camille', nom: 'Martin', sexe: 'femme', naissance: cle(plus(a, 9 - 36 * 365)), lien: 'Parent', entreprise: 'Clinique du Parc', poste: 'Infirmière', entree: ne(6, 1, 15), matricule: 'CP-2231', telPro: '01 00 00 00 02', tel: '06 00 00 00 02', email: 'camille@exemple.fr', secu: '2 88 07 99 000 000 00', sante: true },
    { id: le, genre: 'enfant', prenom: 'Léa', nom: 'Martin', sexe: 'femme', naissance: ne(10, 5, 2), lien: 'Fille', etablissement: 'École Jules-Ferry', classe: 'CM2', prof: 'Mme Bernard', telEcole: '01 00 00 00 10', adresseEcole: '3 rue de l’École', secu: '', sante: true },
    { id: hu, genre: 'enfant', prenom: 'Hugo', nom: 'Martin', sexe: 'homme', naissance: ne(7, 10, 21), lien: 'Fils', etablissement: 'École Jules-Ferry', classe: 'CE1', prof: 'M. Petit', telEcole: '01 00 00 00 10', sante: false },
    { id: px, genre: 'animal', prenom: 'Pixel', espece: 'chat', race: 'Européen tigré', naissance: ne(4, 6, 1), puce: '250 00 00 00 00 001', veto: 'Clinique des Tilleuls' },
  ];
  s.confiance = [{ id: uid(), prenom: 'Odile', nom: 'Martin', lien: 'Grand-mère', tel: '06 00 00 00 09', adresse: 'Rue des Lilas (inventée)', notes: 'Autorisée à récupérer les enfants à l’école. A un double des clés.' }];
  s.sports = [
    { membre: ju, sport: 'Football', club: 'US Vallée', debut: String(an - 30), fin: String(an - 18), compet: true, niveau: 'Régional', or: 2, argent: 1, bronze: 0 },
    { membre: ju, sport: 'Course à pied', club: '', debut: String(an - 5), fin: '', compet: false, niveau: 'Semi-marathon' },
    { membre: ca, sport: 'Danse classique', club: 'Conservatoire', debut: String(an - 30), fin: String(an - 20), compet: false, niveau: 'Fin de 2e cycle' },
    { membre: ca, sport: 'Yoga', club: 'Studio Lotus', adresse: '8 place du Marché', debut: String(an - 3), fin: '', compet: false, horaires: 'Mardi 19 h' },
    { membre: le, sport: 'Natation', club: 'Les Dauphins', adresse: 'Piscine municipale', licence: 'FFN-000123', debut: String(an - 4), fin: '', compet: true, niveau: 'Pass’compétition', or: 1, argent: 2, bronze: 3, horaires: 'Mercredi 14 h, samedi 10 h' },
    { membre: hu, sport: 'Judo', club: 'Judo Club de la Vallée', adresse: 'Gymnase Pasteur', licence: 'FFJ-000456', debut: String(an - 2), fin: '', compet: true, niveau: 'Ceinture jaune-orange', or: 0, argent: 1, bronze: 1, horaires: 'Mercredi 16 h 30' },
  ].map(x => ({ id: uid(), licence: '', adresse: '', horaires: '', notes: '', or: '', argent: '', bronze: '', ...x }));
  s.copains = [
    { enfant: le, copain: 'Inès', classe: 'CM2', parents: 'Sophie et Karim Benali', tel: '06 00 00 00 21', email: 'famille.benali@exemple.fr', adresse: 'Rue des Écoles', notes: 'Anniversaire le 12 mai' },
    { enfant: le, copain: 'Chloé', classe: 'CM2', parents: 'Anne Durand', tel: '06 00 00 00 22', notes: 'Covoiturage natation le samedi' },
    { enfant: hu, copain: 'Noah', classe: 'CE1', parents: 'Marc et Julie Roux', tel: '06 00 00 00 23', notes: 'Allergie aux arachides' },
  ].map(x => ({ id: uid(), tel2: '', email: '', adresse: '', ...x }));
  s.annuaire = [
    { type: 'scolaire', nom: 'Assurance Scolaire Sérénité', contrat: 'SC-000-778', tel: '01 00 00 00 30', membres: [le, hu] },
    { type: 'mutuelle', nom: 'Mutuelle des Familles', contrat: 'MF-001234', tel: '01 00 00 00 31', site: 'www.exemple.fr', membres: [] },
    { type: 'secu', nom: 'CPAM', tel: '36 46', adresse: 'Centre de sécurité sociale (adresse inventée)', membres: [] },
    { type: 'voiture', nom: 'Auto Assur', contrat: 'AA-55-901', tel: '01 00 00 00 32', notes: 'Échéance en mars', membres: [ju] },
    { type: 'maison', nom: 'Habitat Confiance', contrat: 'HC-778812', tel: '01 00 00 00 33', notes: 'Comprend la responsabilité civile', membres: [] },
    { type: 'accident', nom: 'Garantie Vie Sereine', contrat: 'GAV-1209', tel: '01 00 00 00 34', membres: [] },
  ].map(x => ({ id: uid(), email: '', adresse: '', site: '', notes: '', ...x }));
  const P = [['entree', 'Entrée'], ['salon', 'Salon'], ['cuisine', 'Cuisine'], ['chambre', 'Chambre parentale'], ['enfant', 'Chambre de Léa'], ['enfant', 'Chambre de Hugo'], ['sdb', 'Salle de bain'], ['wc', 'Toilettes'], ['jardin', 'Jardin']]
    .map(([t, n]) => ({ id: uid(), type: t, nom: n }));
  s.pieces = P;
  const pi = n => P.find(p => p.nom === n).id;
  s.taches = [
    ['Cuisine', 'Faire la vaisselle', 'jour', 'tous'], ['Cuisine', 'Sortir les poubelles', 'semaine', ju], ['Cuisine', 'Nettoyer le frigo', 'mois', ca],
    ['Salon', 'Passer l’aspirateur', 'semaine', ju], ['Salon', 'Ranger les coussins et plaids', 'jour', le],
    ['Chambre de Léa', 'Faire le lit', 'jour', le], ['Chambre de Léa', 'Préparer le cartable', 'jour', le],
    ['Chambre de Hugo', 'Ranger les jouets', 'jour', hu], ['Chambre de Hugo', 'Faire le lit', 'jour', hu],
    ['Chambre parentale', 'Changer les draps', 'semaine', ca], ['Salle de bain', 'Nettoyer le lavabo', 'semaine', ca],
    ['Toilettes', 'Nettoyer la cuvette', 'semaine', ju], ['Entrée', 'Ranger les chaussures', 'jour', hu], ['Jardin', 'Tondre la pelouse', 'semaine', ju],
  ].map(([p, t, f, q]) => ({ id: uid(), piece: pi(p), texte: t, freq: f, qui: q }));
  s.taches.slice(0, 5).forEach(t => { s.faits[t.id] = periode(t.freq); });
  s.piscine.mesures = [[-20, 7.6, 1.2, 22], [-17, 7.4, 1.6, 23], [-13, 7.3, 1.8, 24], [-10, 7.1, 2.4, 25], [-6, 7.3, 1.9, 26], [-3, 7.5, 1.4, 27]]
    .map(([n, ph, cl, t]) => ({ id: uid(), date: j(n), heure: '19:00', ph, chlore: cl, temp: t, note: n === -10 ? 'Après l’orage' : '' }));
  s.piscine.fait = { feuilles: j(-1), parois: j(-9), ligne: j(-5), tiers: j(-200) };
  S = s; V.page = 'accueil'; sauver();
  toast('✨', 'Voici la famille Martin', 'Une famille inventée pour explorer : tout se modifie, et vous pourrez l’effacer d’un clic.');
};

/* ============================================================
   Démarrage
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const f = ACTIONS[el.dataset.act];
  if (!f) return;
  if (el.tagName !== 'INPUT') e.preventDefault();
  e.stopPropagation();
  f(el, e);
});
/* les cartes et les pièces dessinées s'ouvrent aussi au clavier */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); sauvegarderFichier(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act][role="button"]:not(button)')) { e.preventDefault(); e.target.click(); }
});
charger();
/* une autre fenêtre a modifié la maison : on relit (dès qu'aucune saisie n'est ouverte) */
let relireAttendu = false;
function relire() {
  if (document.querySelector('.voile')) { relireAttendu = true; return; }
  relireAttendu = false; charger(); rendre();
}
window.addEventListener('storage', e => { if (e.key && e.key.endsWith(CLE_STOCK)) relire(); });
setInterval(() => { if (relireAttendu) relire(); }, 1000);
try {
  const t = JSON.parse(localStorage.getItem('naohome.vue') || 'null');
  if (t && PAGES[t.page]) { V.page = t.page; Object.assign(V.sous, t.sous || {}); V.piece = t.piece || ''; }
} catch (e) {}
appliquerTheme(document.documentElement.dataset.theme || 'dark');
dessinerFond();
rendre();
(window.ngApresVoile || (f => f()))(entree);   /* venu de NaoGroup : l'ouverture attend le lever du voile */

/* l'entrée : des maisonnettes s'allument en courbe jusqu'au jeton, puis le foyer en cercle */
function entree() {
  const intro = $('#intro');
  if (!intro) return;
  const corps = document.body;
  const finir = () => { if (intro.isConnected) intro.remove(); corps.classList.remove('entree', 'revele'); };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
  /* (la deuxième ouverture dans la session, et Échap / Entrée / Espace : naogroup-cloud.js passe l'intro) */
  corps.classList.add('entree');
  const petit = innerWidth < 560;
  const maisonnette = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5 21 11h-2.4v9.5H5.4V11H3z"/><rect x="10.2" y="14.6" width="3.6" height="5.9" rx="1.2" fill="var(--fond-uni)" opacity=".55"/></svg>';
  const n = 9, R = Math.min(innerWidth * (petit ? .46 : .4), 560);
  let p = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), ang = Math.PI * (1.08 - .6 * t), r = R * (1 - .7 * t);
    const x = Math.cos(ang) * r, y = Math.sin(ang) * r * .5 + 40 * (1 - t);
    p += `<span style="transform:translate(${x.toFixed(0)}px,${y.toFixed(0)}px) scale(${(.7 + .4 * t).toFixed(2)});animation-delay:${(i * .11).toFixed(2)}s">${maisonnette}</span>`;
  }
  $('#introPas').innerHTML = p;
  const formes = [`<svg viewBox="0 0 24 24" fill="currentColor">${DESSINS.coeur}</svg>`, maisonnette,
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2Q13 10 22 12Q13 14 12 22Q11 14 2 12Q11 10 12 2Z"/></svg>'];
  const couleurs = ['var(--acc)', '#E99BFF', '#FFFFFF', 'var(--bleu)', '#F3C969'];
  let e = '';
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2 + Math.random() * .3, d = (petit ? 110 : 165) + Math.random() * 90;
    e += `<i style="--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d).toFixed(0)}px;--r:${(-60 + Math.random() * 120).toFixed(0)}deg;--t:${(13 + Math.random() * 13).toFixed(0)}px;--c:${couleurs[i % couleurs.length]};--d:${(1.62 + Math.random() * .15).toFixed(2)}s">${formes[i % 3]}</i>`;
  }
  $('#introEclats').innerHTML = e;
  $('#introAmis').innerHTML = ['👪', '🏊', '🧹', '🏅', '🎒', '📇']
    .map((k, i) => `<div class="ami" style="--a:${i * 60 - 30}deg;--i:${i}"><span class="av">${k}</span></div>`).join('');
  $('#introNom').innerHTML = [...'NaoHome'].map((c, i) => `<b class="${i > 2 ? 'acc' : ''}" style="--i:${i}">${c}</b>`).join('');

  /* la sortie : le jeton s'envole se poser à sa place, dans l'en-tête, pendant que l'outil apparaît */
  let parti = false;
  const sortir = (vite = false) => {
    if (parti) return;
    parti = true;
    const j = $('#introJeton'), cible = $('.marque svg');
    if (j) [j, ...j.querySelectorAll('*')].forEach(x => x.getAnimations().forEach(a => a.finish()));
    corps.classList.add('revele');
    intro.classList.add('sortie');
    if (j && cible) {
      const a = j.getBoundingClientRect(), b = cible.getBoundingClientRect();
      j.style.animation = 'none';
      j.style.transition = `transform ${vite ? .5 : .85}s cubic-bezier(.65,0,.25,1), box-shadow .5s, border-radius .85s`;
      j.getBoundingClientRect();
      j.style.transform = `translate(${(b.left + b.width / 2 - a.left - a.width / 2).toFixed(1)}px,${(b.top + b.height / 2 - a.top - a.height / 2).toFixed(1)}px) scale(${(b.width / a.width).toFixed(3)})`;
      j.style.boxShadow = '0 0 0 0 transparent';
    }
    setTimeout(finir, vite ? 560 : 920);
  };
  intro.addEventListener('click', () => sortir(true));
  setTimeout(() => sortir(), 3750);
  setTimeout(finir, 6000);
}
/* à minuit, la journée change : les tâches du jour reviennent */
let jourAffiche = cle(auj());
setInterval(() => { if (cle(auj()) !== jourAffiche) { jourAffiche = cle(auj()); if (!document.querySelector('.voile')) rendre(); } }, 60 * 1000);
