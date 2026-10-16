/* ============================================================
   NaoTrip — l'application : navigation, actions, décor animé.
   ============================================================ */
'use strict';
const VUES = [
  ['accueil', 'Accueil', '🏠', vueAccueil],
  ['voyages', 'Mes voyages', '🧭', vueVoyages],
  ['planning', 'Planning', '🗓️', vuePlanning],
  ['reservations', 'Réservations', '🎫', vueReservations],
  ['valise', 'Valise', '🧳', vueValise],
  ['budget', 'Budget', '💶', vueBudget],
  ['preparation', 'Préparation', '✅', vuePreparation],
  ['idees', 'Idées', '💡', vueIdees],
  ['infos', 'Infos utiles', '📇', vueInfos],
  ['souvenirs', 'Carnet souvenir', '📸', vueSouvenirs],
  ['globe', 'Mon globe', '🌍', vueGlobe]];
let vue = (location.hash || '').slice(1) || lire('naotrip.vue', 'accueil');
if (!VUES.some(x => x[0] === vue)) vue = 'accueil';

function rendre() {
  if (S.actif && !voyage()) S.actif = null;
  if (!S.actif && S.voyages.length) S.actif = (prochainVoyage() || S.voyages[S.voyages.length - 1]).id;
  $('#onglets').innerHTML = VUES.map(([id, nom, e]) => `<button type="button" data-act="vue" data-vue="${id}" class="${id === vue ? 'actif' : ''}"><span class="e">${e}</span>${nom}</button>`).join('');
  const sel = $('#selVoyage');
  $('#choixVoyage').hidden = !S.voyages.length;
  sel.innerHTML = [...S.voyages].sort((a, b) => (a.debut || '9').localeCompare(b.debut || '9'))
    .map(v => `<option value="${v.id}"${v.id === S.actif ? ' selected' : ''}>${typeVoyage(v.type)[1]} ${esc(v.nom)}</option>`).join('');
  const f = VUES.find(x => x[0] === vue)[3];
  $('#contenu').innerHTML = `<div class="vue">${f()}</div>`;
  fermerBullePays();
  if (vue === 'globe' && modeGlobe === 'globe') { Globe.rafraichir(); Globe.monter($('#globe'), ouvrirBullePays); }
  tic();
}
function aller(id) {
  vue = id; ecrire('naotrip.vue', id);
  history.replaceState(null, '', '#' + id);
  rendre();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function modifie(message) { sauver(); rendre(); if (message) toast(message); }

/* ---------- le compte à rebours, rafraîchi chaque seconde ---------- */
function tic() {
  $$('[data-decompte]').forEach(el => {
    let d = Math.max(0, +el.dataset.decompte - Date.now()) / 1000;
    const j = Math.floor(d / 86400); d -= j * 86400;
    const h = Math.floor(d / 3600); d -= h * 3600;
    const m = Math.floor(d / 60), s = Math.floor(d - m * 60);
    const put = (u, v) => { const b = el.querySelector(`[data-u="${u}"]`); if (b && b.textContent !== String(v)) b.textContent = v; };
    put('j', j); put('h', pad(h)); put('m', pad(m)); put('s', pad(s));
  });
}
setInterval(tic, 1000);

/* ============================================================
   LES VOYAGES
   ============================================================ */
function champsVoyage() {
  return [
    { k: 'nom', l: 'Nom du voyage', ph: 'Week-end à Lisbonne', req: true, large: true },
    { k: 'destination', l: 'Destination', ph: 'Lisbonne, Portugal' },
    { k: 'type', l: 'Type de voyage', t: 'select', o: TYPES_VOYAGE.map(([id, e, l]) => [id, e + ' ' + l]) },
    { k: 'debut', l: 'Date de départ', t: 'date' },
    { k: 'fin', l: 'Date de retour', t: 'date' },
    { k: 'heureDepart', l: 'Heure de départ', t: 'time', aide: 'Pour un compte à rebours à la seconde' },
    { k: 'devise', l: 'Monnaie du budget', t: 'select', o: DEVISES },
    { k: 'pays', l: 'Pays visités pendant ce voyage', t: 'puces', liste: NOMS_PAYS, ph: 'Tapez un pays puis Entrée…',
      afficher: c => PAYS[c] ? PAYS[c].nom : c, convertir: s => { const p = paysDeNom(s); return p ? p.code : null; }, aide: 'Ils apparaîtront sur votre globe' },
    { k: 'voyageurs', l: 'Voyageurs', t: 'puces', ph: 'Prénom puis Entrée…', afficher: p => p.nom, convertir: s => ({ id: uid(), nom: s }) },
    { k: 'notes', l: 'Notes', t: 'textarea', ph: 'Envies, contraintes, idées générales…' }];
}
ACT['nouveau-voyage'] = () => formulaire({
  titre: 'Créer un voyage', emoji: '✈️', sous: 'Destination, dates et voyageurs — le reste viendra au fil de la préparation.',
  champs: champsVoyage(), valeurs: { type: 'vacances', devise: 'EUR', voyageurs: [{ id: uid(), nom: 'Moi' }] }, bouton: 'Créer le voyage',
  verifier: x => x.debut && x.fin && x.fin < x.debut ? 'La date de retour est avant le départ.' : null,
  enregistrer: x => {
    const v = normaliserVoyage(Object.assign({}, x, { id: uid(), creeLe: auj() }));
    if (v.debut && !v.fin) v.fin = v.debut;
    v.documents = DOCUMENTS_BASE.map(nom => ({ id: uid(), nom, fait: false }));
    v.taches = TACHES_BASE.map(([nom, j]) => ({ id: uid(), nom, jMoins: j, fait: false }));
    S.voyages.push(v); S.actif = v.id;
    vue = 'accueil';
    modifie('Bon voyage en préparation ! ✈️');
  }
});
ACT['editer-voyage'] = el => {
  const v = trouver(S.voyages, el.dataset.id); if (!v) return;
  formulaire({
    titre: 'Modifier le voyage', emoji: '🧭', champs: champsVoyage(), valeurs: v,
    verifier: x => x.debut && x.fin && x.fin < x.debut ? 'La date de retour est avant le départ.' : null,
    enregistrer: x => {
      /* les voyageurs retirés disparaissent aussi des dépenses et de la valise */
      Object.assign(v, x); if (v.debut && !v.fin) v.fin = v.debut;
      modifie('Voyage mis à jour');
    },
    supprimer: () => ACT['suppr-voyage'](el)
  });
};
ACT['suppr-voyage'] = async el => {
  const v = trouver(S.voyages, el.dataset.id); if (!v) return;
  if (!await confirmer(`Supprimer « ${v.nom} » ?`, 'Planning, réservations, valise, budget et carnet souvenir de ce voyage seront effacés.')) return;
  instantane();
  S.voyages = S.voyages.filter(x => x.id !== v.id);
  if (S.actif === v.id) S.actif = null;
  sauver(); rendre(); toast('Voyage supprimé', { annuler: true });
};
ACT['dupliquer-voyage'] = el => {
  const v = trouver(S.voyages, el.dataset.id); if (!v) return;
  const c = normaliserVoyage(JSON.parse(JSON.stringify(v)));
  Object.assign(c, { id: uid(), nom: v.nom + ' (copie)', debut: '', fin: '', creeLe: auj(), depenses: [], reservations: [], planning: [], souvenirs: [] });
  ['valise', 'documents', 'taches'].forEach(k => c[k].forEach(x => { x.id = uid(); x.fait = false; }));
  c.idees.forEach(x => { x.id = uid(); x.jour = ''; x.statut = 'idee'; });
  S.voyages.push(c); S.actif = c.id; modifie('Voyage dupliqué : valise, papiers et idées sont repris');
};
ACT['ouvrir-voyage'] = el => { S.actif = el.dataset.id; sauver(); aller('accueil'); };

/* ============================================================
   RÉSERVATIONS
   ============================================================ */
const estTransport = x => typeResa(x.type)[3] === 'transport';
ACT['ajout-resa'] = el => formResa(null, el);
ACT['editer-resa'] = el => formResa(trouver((voyage() || {}).reservations, el.dataset.id));
function formResa(r, el) {
  const v = voyage(); if (!v) { toast('Créez d’abord un voyage'); return ACT['nouveau-voyage'](); }
  const vals = r ? Object.assign({}, r) : { type: 'vol', debut: v.debut ? v.debut + 'T09:00' : '', depense: true };
  formulaire({
    titre: r ? 'Modifier la réservation' : 'Ajouter une réservation', emoji: '🎫', sous: v.nom,
    champs: [
      { k: 'type', l: 'Type', t: 'select', o: TYPES_RESA.map(([id, e, l]) => [id, e + ' ' + l]) },
      { k: 'titre', l: 'Intitulé', ph: 'Vol AF1024 Paris → Lisbonne', req: true },
      { k: 'debut', t: 'datetime-local', lab: x => x.type === 'hebergement' ? 'Check-in' : estTransport(x) ? 'Départ' : 'Début' },
      { k: 'fin', t: 'datetime-local', lab: x => x.type === 'hebergement' ? 'Check-out' : estTransport(x) ? 'Arrivée' : 'Fin' },
      { k: 'embarquement', l: 'Embarquement', t: 'datetime-local', si: estTransport },
      { k: 'porte', l: 'Terminal, porte, voie', ph: 'Terminal 2E', si: estTransport },
      { k: 'lieu', lab: x => estTransport(x) ? 'Départ de' : 'Lieu', ph: 'Paris-CDG' },
      { k: 'arrivee', l: 'Arrivée à', ph: 'Lisbonne', si: estTransport },
      { k: 'adresse', l: 'Adresse', ph: 'Rua…', large: true, si: x => !estTransport(x) },
      { k: 'reference', l: 'N° de réservation', ph: 'ABC123' },
      { k: 'telephone', l: 'Téléphone', t: 'tel' },
      { k: 'lien', l: 'Lien de la réservation', t: 'url', ph: 'https://…', large: true },
      { k: 'prix', l: `Prix (${v.devise})`, t: 'number' },
      { k: 'depense', l: 'Compter ce prix dans les dépenses du budget', t: 'case', si: x => nombre(x.prix) > 0 },
      { k: 'notes', l: 'Notes', t: 'textarea' }],
    valeurs: vals,
    enregistrer: x => {
      const cible = r || { id: uid() };
      Object.assign(cible, x);
      if (!r) v.reservations.push(cible);
      /* la dépense liée suit la réservation */
      const liee = v.depenses.find(d => d.resaId === cible.id);
      if (cible.depense && nombre(cible.prix) > 0) {
        const cat = { transport: 'transport', hebergement: 'hebergement' }[typeResa(cible.type)[3]] || (cible.type === 'restaurant' ? 'restauration' : 'activites');
        const d = liee || { id: uid(), resaId: cible.id, payePar: (v.voyageurs[0] || {}).id || '', pour: [] };
        Object.assign(d, { libelle: cible.titre, montant: nombre(cible.prix), categorie: cat, date: d.date || (cible.debut || auj()).slice(0, 10) });
        if (!liee) v.depenses.push(d);
      } else if (liee) v.depenses = v.depenses.filter(d => d !== liee);
      modifie(r ? 'Réservation mise à jour' : 'Réservation ajoutée 🎫');
    },
    supprimer: r ? () => { instantane(); v.reservations = v.reservations.filter(x => x !== r); v.depenses = v.depenses.filter(d => d.resaId !== r.id); sauver(); rendre(); toast('Réservation supprimée', { annuler: true }); } : null
  });
}

/* ============================================================
   PLANNING
   ============================================================ */
function formPlan(p, jour) {
  const v = voyage(); if (!v) return;
  const jours = listeJours(v.debut, v.fin);
  formulaire({
    titre: p ? 'Modifier l’activité' : 'Ajouter au planning', emoji: '🗓️', sous: v.nom,
    champs: [
      { k: 'titre', l: 'Activité', ph: 'Visite du château', req: true, large: true },
      { k: 'type', l: 'Type', t: 'select', o: TYPES_PLAN.map(([id, e, l]) => [id, e + ' ' + l]) },
      jours.length ? { k: 'jour', l: 'Jour', t: 'select', o: jours.map((j, i) => [j, `J${i + 1} · ${fmtJour(j)}`]) } : { k: 'jour', l: 'Jour', t: 'date' },
      { k: 'heure', l: 'Heure', t: 'time' },
      { k: 'lieu', l: 'Lieu', ph: 'Adresse ou quartier' },
      { k: 'notes', l: 'Notes', t: 'textarea' }],
    valeurs: p || { type: 'visite', jour: jour || (jours.includes(auj()) ? auj() : jours[0]) },
    enregistrer: x => { if (p) Object.assign(p, x); else v.planning.push(Object.assign({ id: uid(), fait: false }, x)); modifie(p ? 'Planning mis à jour' : 'Ajouté au planning'); },
    supprimer: p ? () => supprimerDe('planning', p.id) : null
  });
}
ACT['ajout-plan'] = el => formPlan(null, el.dataset.jour);
ACT['editer-plan'] = el => formPlan(trouver(voyage().planning, el.dataset.id));

/* ============================================================
   LISTES À COCHER : valise, documents, tâches
   ============================================================ */
ACT['basculer'] = el => {
  const v = voyage(); const x = trouver(v && v[el.dataset.liste], el.dataset.id); if (!x) return;
  x.fait = !x.fait; sauver();
  if (x.fait && el.dataset.liste === 'valise' && v.valise.every(y => y.fait)) toast('Valise bouclée ! 🎉 Bon voyage.');
  rendre();
};
function supprimerDe(liste, id) {
  const v = voyage(); if (!v) return;
  instantane();
  v[liste] = v[liste].filter(x => x.id !== id);
  sauver(); rendre(); toast('Retiré', { annuler: true });
}
ACT['suppr'] = el => supprimerDe(el.dataset.liste, el.dataset.id);

function formValise(x, cat) {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: x ? 'Modifier' : 'Ajouter à la valise', emoji: '🧳',
    champs: [{ k: 'nom', l: 'Affaire', ph: 'Maillot de bain', req: true, large: true },
      { k: 'cat', l: 'Catégorie', t: 'select', o: CATS_VALISE.map(([id, e, l]) => [id, e + ' ' + l]) },
      { k: 'qte', l: 'Quantité', t: 'number' },
      { k: 'qui', l: 'Pour qui', t: 'select', o: [['', 'Tout le monde'], ...v.voyageurs.map(p => [p.id, p.nom])], si: () => v.voyageurs.length > 1 }],
    valeurs: x || { cat: cat || 'vetements', qui: filtreValise !== 'tous' ? filtreValise : '' },
    enregistrer: y => { if (x) Object.assign(x, y); else v.valise.push(Object.assign({ id: uid(), fait: false }, y)); modifie(); },
    supprimer: x ? () => supprimerDe('valise', x.id) : null
  });
}
ACT['ajout-valise'] = el => formValise(null, el.dataset.cat);
ACT['editer-valise'] = el => formValise(trouver(voyage().valise, el.dataset.id));
ACT['filtre-valise'] = el => { filtreValise = el.dataset.qui; rendre(); };
ACT['vider-valise'] = () => { const v = voyage(); instantane(); v.valise.forEach(x => x.fait = false); sauver(); rendre(); toast('Tout est décoché — prêt pour la valise du retour', { annuler: true }); };
ACT['generer-valise'] = () => {
  const v = voyage(); if (!v) return ACT['nouveau-voyage']();
  const nbJ = Math.max(1, listeJours(v.debut, v.fin).length);
  formulaire({
    titre: 'Générer une liste de base', emoji: '✨', sous: `Pour ${pluriel(nbJ, 'jour')} — vous pourrez tout ajuster ensuite.`,
    champs: [{ k: 'climat', l: 'Climat', t: 'select', o: [['tempere', '🌤️ Tempéré'], ['chaud', '☀️ Chaud'], ['froid', '❄️ Froid']] },
      { k: 'opts', l: 'Au programme', t: 'cases', o: [['plage', '🏖️ Plage / piscine'], ['rando', '🥾 Randonnée'], ['soiree', '🌙 Sorties habillées'], ['enfants', '🧸 Enfants'], ['avion', '✈️ Avion'], ['voiture', '🚗 Voiture']] }],
    valeurs: { climat: 'tempere', opts: [v.type === 'famille' ? 'enfants' : '', v.reservations.some(r => r.type === 'vol') ? 'avion' : '', v.reservations.some(r => r.type === 'voiture') ? 'voiture' : ''].filter(Boolean) },
    bouton: 'Générer',
    enregistrer: x => {
      const o = x.opts || [], j = Math.min(nbJ, 7);
      const l = [['documents', "Pièce d'identité / passeport"], ['documents', 'Carte bancaire et un peu d’espèces'], ['documents', 'Billets et réservations'], ['documents', 'Carte d’assurance'],
        ['vetements', `Sous-vêtements (${nbJ + 1})`], ['vetements', `Chaussettes (${nbJ + 1})`], ['vetements', `Hauts / t-shirts (${j})`], ['vetements', 'Pantalons / jupes'], ['vetements', 'Pyjama'], ['vetements', 'Chaussures confortables'], ['vetements', 'Une petite veste'],
        ['toilette', 'Brosse à dents & dentifrice'], ['toilette', 'Gel douche & shampoing'], ['toilette', 'Déodorant'], ['toilette', 'Brosse / peigne'], ['toilette', 'Produits de maquillage / rasage'],
        ['sante', 'Médicaments habituels'], ['sante', 'Petite trousse de secours'], ['sante', 'Mouchoirs'],
        ['electronique', 'Téléphone & chargeur'], ['electronique', 'Batterie externe'], ['electronique', 'Écouteurs'],
        ['divers', 'Gourde'], ['divers', 'Sac pour le linge sale'], ['divers', 'Lunettes de soleil']];
      if (x.climat === 'chaud') l.push(['vetements', 'Shorts'], ['vetements', 'Chapeau / casquette'], ['plage', 'Crème solaire'], ['vetements', 'Sandales']);
      if (x.climat === 'froid') l.push(['vetements', 'Manteau chaud'], ['vetements', 'Bonnet, écharpe, gants'], ['vetements', 'Pull épais'], ['sante', 'Baume à lèvres']);
      if (o.includes('plage')) l.push(['plage', 'Maillot de bain'], ['plage', 'Serviette de plage'], ['plage', 'Crème solaire'], ['plage', 'Tongs'], ['plage', 'Après-soleil']);
      if (o.includes('rando')) l.push(['vetements', 'Chaussures de marche'], ['divers', 'Petit sac à dos'], ['vetements', 'Coupe-vent'], ['sante', 'Pansements ampoules']);
      if (o.includes('soiree')) l.push(['vetements', 'Tenue habillée'], ['vetements', 'Chaussures de soirée']);
      if (o.includes('enfants')) l.push(['enfants', 'Doudou'], ['enfants', 'Couches / lingettes'], ['enfants', 'Jeux et livres pour le trajet'], ['enfants', 'Goûters'], ['enfants', 'Carnet de santé'], ['enfants', 'Vêtements de rechange']);
      if (o.includes('avion')) l.push(['divers', 'Oreiller de voyage'], ['toilette', 'Pochette liquides (100 ml)'], ['electronique', 'Adaptateur de prise']);
      if (o.includes('voiture')) l.push(['documents', 'Permis de conduire'], ['divers', 'Playlist & câble voiture'], ['divers', 'En-cas pour la route']);
      const deja = new Set(v.valise.map(y => sansAccent(y.nom)));
      let n = 0;
      l.forEach(([cat, nom]) => { if (!deja.has(sansAccent(nom))) { deja.add(sansAccent(nom)); v.valise.push({ id: uid(), cat, nom, fait: false }); n++; } });
      if (vue !== 'accueil') vue = 'valise';
      modifie(`${pluriel(n, 'affaire ajoutée', 'affaires ajoutées')} ✨`);
    }
  });
};

function formDoc(x) {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: x ? 'Modifier le document' : 'Ajouter un document', emoji: '🪪',
    champs: [{ k: 'nom', l: 'Document', ph: 'Visa, carte grise…', req: true, large: true },
      { k: 'qui', l: 'Pour qui', t: 'select', o: [['', 'Tout le monde'], ...v.voyageurs.map(p => [p.id, p.nom])] },
      { k: 'expire', l: 'Valable jusqu’au', t: 'date' }, { k: 'note', l: 'Note', ph: 'Rangé dans la pochette bleue', large: true }],
    valeurs: x || {},
    enregistrer: y => {
      if (x) Object.assign(x, y); else v.documents.push(Object.assign({ id: uid(), fait: false }, y));
      modifie(y.expire && v.fin && y.expire < v.fin ? '⚠️ Ce document expire avant la fin du voyage !' : '');
    },
    supprimer: x ? () => supprimerDe('documents', x.id) : null
  });
}
ACT['ajout-documents'] = () => formDoc(null);
ACT['editer-documents'] = el => formDoc(trouver(voyage().documents, el.dataset.id));
function formTache(x) {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: x ? 'Modifier la tâche' : 'Ajouter une tâche', emoji: '✅',
    champs: [{ k: 'nom', l: 'Tâche', ph: 'Réserver le parking', req: true, large: true },
      { k: 'jMoins', l: 'À faire combien de jours avant ?', t: 'number', aide: '0 = le jour du départ' }, { k: 'note', l: 'Note' }],
    valeurs: x || { jMoins: 7 },
    enregistrer: y => { if (x) Object.assign(x, y); else v.taches.push(Object.assign({ id: uid(), fait: false }, y)); modifie(); },
    supprimer: x ? () => supprimerDe('taches', x.id) : null
  });
}
ACT['ajout-taches'] = () => formTache(null);
ACT['editer-taches'] = el => formTache(trouver(voyage().taches, el.dataset.id));

/* ============================================================
   BUDGET
   ============================================================ */
function formDepense(d) {
  const v = voyage(); if (!v) return ACT['nouveau-voyage']();
  const tous = v.voyageurs.map(p => p.id);
  formulaire({
    titre: d ? 'Modifier la dépense' : 'Ajouter une dépense', emoji: '💶', sous: v.nom,
    champs: [{ k: 'libelle', l: 'Dépense', ph: 'Dîner au port', req: true, large: true },
      { k: 'montant', l: `Montant (${v.devise})`, t: 'number', req: true },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'categorie', l: 'Catégorie', t: 'select', o: CATS_BUDGET.map(([id, e, l]) => [id, e + ' ' + l]) },
      { k: 'payePar', l: 'Payé par', t: 'select', o: v.voyageurs.map(p => [p.id, p.nom]), si: () => v.voyageurs.length > 0 },
      { k: 'pour', l: 'Partagé entre', t: 'cases', o: v.voyageurs.map(p => [p.id, p.nom]), si: () => v.voyageurs.length > 1 }],
    valeurs: d ? Object.assign({}, d, { pour: d.pour && d.pour.length ? d.pour : tous }) : { date: auj() >= (v.debut || '') && auj() <= (v.fin || '') ? auj() : (v.debut || auj()), categorie: 'restauration', payePar: tous[0] || '', pour: tous },
    verifier: y => v.voyageurs.length > 1 && !y.pour.length ? 'Choisissez au moins une personne pour le partage.' : null,
    enregistrer: y => {
      if (y.pour && y.pour.length === tous.length) y.pour = [];
      if (d) { Object.assign(d, y); if (d.resaId) { const r = trouver(v.reservations, d.resaId); if (r) r.prix = d.montant; } }
      else v.depenses.push(Object.assign({ id: uid() }, y));
      modifie(d ? 'Dépense mise à jour' : 'Dépense ajoutée 💶');
    },
    supprimer: d ? () => { const r = d.resaId && trouver(v.reservations, d.resaId); if (r) r.depense = false; supprimerDe('depenses', d.id); } : null
  });
}
ACT['ajout-depense'] = () => formDepense(null);
ACT['editer-depense'] = el => formDepense(trouver(voyage().depenses, el.dataset.id));
ACT['budget-prevu'] = () => {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: 'Budget prévisionnel', emoji: '📊', sous: `Combien prévoir pour chaque poste (${v.devise}) ?`,
    champs: CATS_BUDGET.map(([id, e, l]) => ({ k: id, l: e + ' ' + l, t: 'number', ph: '0' })),
    valeurs: v.budget,
    enregistrer: y => { Object.keys(y).forEach(k => y[k] = y[k] === '' ? 0 : y[k]); v.budget = y; modifie('Budget prévisionnel enregistré'); }
  });
};

/* ============================================================
   IDÉES, INFOS, SOUVENIRS
   ============================================================ */
function formIdee(x, type, programmer) {
  const v = voyage(); if (!v) return;
  const jours = listeJours(v.debut, v.fin);
  formulaire({
    titre: programmer ? 'Programmer dans le planning' : x ? 'Modifier l’idée' : 'Ajouter une idée', emoji: '💡',
    champs: [{ k: 'nom', l: 'Nom', ph: 'Time Out Market', req: true, large: true },
      { k: 'type', l: 'Type', t: 'select', o: TYPES_IDEE.map(([id, e, l]) => [id, e + ' ' + l]) },
      { k: 'jour', l: 'Jour prévu', t: 'select', o: [['', '— Pas encore —'], ...jours.map((j, i) => [j, `J${i + 1} · ${fmtJour(j)}`])] },
      { k: 'heure', l: 'Heure', t: 'time', si: y => !!y.jour },
      { k: 'adresse', l: 'Adresse', large: true }, { k: 'lien', l: 'Lien', t: 'url', ph: 'https://…' }, { k: 'prix', l: `Prix indicatif (${v.devise})`, t: 'number' },
      { k: 'note', l: 'Pourquoi on veut y aller', t: 'textarea' }, { k: 'coeur', l: '❤️ Coup de cœur, à ne pas manquer', t: 'case' }],
    valeurs: x || { type: type || 'visite', statut: 'idee' },
    enregistrer: y => { if (x) Object.assign(x, y); else v.idees.push(Object.assign({ id: uid(), statut: 'idee' }, y)); modifie(y.jour ? 'Programmé dans le planning 🗓️' : 'Idée notée 💡'); },
    supprimer: x ? () => supprimerDe('idees', x.id) : null
  });
}
ACT['ajout-idee'] = el => formIdee(null, el.dataset.type);
ACT['editer-idee'] = el => formIdee(trouver(voyage().idees, el.dataset.id));
ACT['programmer-idee'] = el => formIdee(trouver(voyage().idees, el.dataset.id), null, true);
ACT['idee-faite'] = el => { const x = trouver(voyage().idees, el.dataset.id); if (!x) return; x.statut = x.statut === 'fait' ? 'idee' : 'fait'; modifie(x.statut === 'fait' ? 'Fait ✓' : ''); };

function formInfo(x, type) {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: x ? 'Modifier' : 'Ajouter une info utile', emoji: '📇',
    champs: [{ k: 'type', l: 'Type', t: 'select', o: TYPES_INFO.map(([id, e, l]) => [id, e + ' ' + l]) },
      { k: 'nom', l: 'Nom', ph: 'Hôtel, taxi, ambassade…', req: true },
      { k: 'valeur', lab: y => y.type === 'numero' ? 'Numéro' : y.type === 'lien' ? 'Adresse web' : 'Adresse', req: true, large: true },
      { k: 'note', l: 'Note', large: true }],
    valeurs: x || { type: type || 'adresse' },
    enregistrer: y => { if (x) Object.assign(x, y); else v.infos.push(Object.assign({ id: uid() }, y)); modifie(); },
    supprimer: x ? () => supprimerDe('infos', x.id) : null
  });
}
ACT['ajout-info'] = el => formInfo(null, el.dataset.type);
ACT['editer-info'] = el => formInfo(trouver(voyage().infos, el.dataset.id));

function formSouvenir(x) {
  const v = voyage(); if (!v) return;
  formulaire({
    titre: x ? 'Modifier la page' : 'Nouvelle page du carnet', emoji: '📸',
    champs: [{ k: 'titre', l: 'Titre', ph: 'Coucher de soleil à Belém', large: true },
      { k: 'date', l: 'Date', t: 'date' }, { k: 'humeur', l: 'Humeur', t: 'select', o: [['', '—'], ['😍', '😍 Émerveillé·e'], ['😄', '😄 Joyeux·se'], ['😌', '😌 Serein·e'], ['🤩', '🤩 Inoubliable'], ['😅', '😅 Aventure'], ['🥲', '🥲 Émouvant']] },
      { k: 'lieu', l: 'Lieu', ph: 'Miradouro da Graça', large: true },
      { k: 'texte', l: 'Ce qu’on veut se rappeler', t: 'textarea' },
      { k: 'favori', l: '❤️ Un de nos lieux préférés', t: 'case' }],
    valeurs: x || { date: auj() >= (v.debut || '') && auj() <= (v.fin || '9') ? auj() : (v.debut || auj()) },
    bouton: x ? 'Enregistrer' : 'Enregistrer puis ajouter des photos',
    enregistrer: y => {
      if (x) { Object.assign(x, y); modifie(); return; }
      const n = Object.assign({ id: uid(), photos: [] }, y); v.souvenirs.push(n); modifie();
      setTimeout(() => choisirPhotos(n.id), 150);
    },
    supprimer: x ? () => supprimerDe('souvenirs', x.id) : null
  });
}
ACT['ajout-souvenir'] = () => formSouvenir(null);
ACT['editer-souvenir'] = el => formSouvenir(trouver(voyage().souvenirs, el.dataset.id));
ACT['fav-souvenir'] = el => { const x = trouver(voyage().souvenirs, el.dataset.id); if (x) { x.favori = !x.favori; modifie(); } };
let souvenirPhotos = null;
function choisirPhotos(id) { souvenirPhotos = id; $('#fichierPhotos').value = ''; $('#fichierPhotos').click(); }
ACT['photos-souvenir'] = async el => {
  const x = trouver(voyage().souvenirs, el.dataset.id); if (!x) return;
  if (x.photos && x.photos.length && await confirmer('Photos de cette page', 'Ajouter de nouvelles photos, ou retirer celles déjà là ?', 'Tout retirer')) {
    instantane(); x.photos = []; sauver(); rendre(); toast('Photos retirées', { annuler: true }); return;
  }
  choisirPhotos(x.id);
};
$('#fichierPhotos').addEventListener('change', async e => {
  const v = voyage(), x = v && trouver(v.souvenirs, souvenirPhotos);
  const fichiers = Array.from(e.target.files || []).slice(0, 8);
  if (!x || !fichiers.length) return;
  toast('Préparation des photos…');
  for (const f of fichiers) { try { x.photos.push(await reduirePhoto(f)); } catch (err) {} }
  if (!sauver()) { x.photos.splice(-fichiers.length); sauver(); }
  rendre();
});
ACT['agrandir'] = el => {
  const x = trouver(voyage().souvenirs, el.dataset.id); if (!x) return;
  const d = document.createElement('div'); d.className = 'agrand';
  d.innerHTML = `<img src="${x.photos[+el.dataset.i]}" alt="">`;
  d.addEventListener('click', () => d.remove()); document.body.appendChild(d);
};

/* ============================================================
   LE MONDE
   ============================================================ */
ACT['statut-pays'] = (el, e) => {
  e.stopPropagation();
  const code = el.dataset.code, s = el.dataset.statut;
  definirStatutPays(code, s);
  fermerBullePays();
  Globe.rafraichir();
  if (vue === 'globe' && modeGlobe === 'globe') { const y = scrollY; $('#contenu').innerHTML = `<div class="vue" style="animation:none">${vueGlobe()}</div>`; Globe.monter($('#globe'), ouvrirBullePays); scrollTo(0, y); }
  else { const y = scrollY; rendre(); scrollTo(0, y); }
  if (s !== 'aucun') toast(`${PAYS[code].nom} : ${STATUTS_PAYS[s].e} ${STATUTS_PAYS[s].l}`);
};
ACT['viser-pays'] = (el, e) => {
  const code = el.dataset.code;
  if (modeGlobe === 'globe' && $('#globe')) { Globe.tournerVers(code); const r = el.getBoundingClientRect(); ouvrirBullePays(code, r.left + r.width / 2, r.bottom); }
  else { const r = el.getBoundingClientRect(); ouvrirBullePays(code, r.left + r.width / 2, r.bottom); }
};
ACT['marquer-cherche'] = el => {
  const p = paysDeNom($('#chercherPays').value);
  if (!p) { toast('Pays introuvable — choisissez-le dans la liste', { alerte: true }); return; }
  el.dataset.code = p.code;
  ACT['statut-pays'](el, { stopPropagation() {} });
  if (modeGlobe === 'globe') Globe.tournerVers(p.code);
};
ACT['mode-globe'] = el => { modeGlobe = el.dataset.mode; rendre(); };
ACT['globe-zoom'] = el => Globe.zoomer(+el.dataset.f);
ACT['globe-tourne'] = () => { Globe.auto = !Globe.auto; Globe.cible = null; };

/* ============================================================
   RÉGLAGES, SAUVEGARDE, EXEMPLE
   ============================================================ */
ACT['vue'] = (el, e) => { e.preventDefault(); aller(el.dataset.vue); };
ACT['theme'] = () => {
  const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t; ecrire('naotrip.theme', t);
  Globe.rafraichir(); if (vue === 'accueil' || vue === 'globe') { const y = scrollY; rendre(); scrollTo(0, y); }
};
ACT['calme'] = () => {
  const on = document.documentElement.classList.toggle('calme'); ecrire('naotrip.calme', on ? '1' : '0');
  Globe.auto = !on; toast(on ? 'Animations en pause 🕊️' : 'Animations relancées ✈️');
};
ACT['sauvegarder'] = () => {
  const blob = new Blob([JSON.stringify({ outil: 'NaoTrip', date: new Date().toISOString(), donnees: S }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `NaoTrip-sauvegarde-${auj()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Sauvegarde téléchargée 💾');
};
ACT['recharger'] = () => { $('#fichierSauvegarde').value = ''; $('#fichierSauvegarde').click(); };
$('#fichierSauvegarde').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const d = JSON.parse(r.result), s = d.donnees || d;
      if (!s || !Array.isArray(s.voyages)) throw new Error();
      if (!await confirmer('Recharger cette sauvegarde ?', `${pluriel(s.voyages.length, 'voyage')} — les voyages actuels seront remplacés.`, 'Recharger')) return;
      instantane();
      S = Object.assign(vierge(), s); S.voyages = S.voyages.map(normaliserVoyage); if (!S.monde) S.monde = {};
      sauver(); Globe.rafraichir(); rendre(); toast('Sauvegarde rechargée 📂', { annuler: true });
    } catch (err) { toast('Ce fichier n’est pas une sauvegarde NaoTrip.', { alerte: true }); }
  };
  r.readAsText(f);
});
/* Repartir de zéro, comme un nouvel utilisateur : voyages, globe, préférences — tout s'efface. */
ACT['reinitialiser'] = () => {
  const n = S.voyages.length, p = Object.keys(S.monde || {}).length;
  ouvrirModale(`<h3>🧹 Réinitialiser NaoTrip ?</h3>
    <p class="sous">L'outil redeviendra vierge, comme au premier jour :
      ${pluriel(n, 'voyage')} (planning, réservations, valise, budget, carnet souvenir et photos), ${pluriel(p, 'pays marqué', 'pays marqués')} sur le globe,
      et vos préférences (thème, animations) seront effacés.</p>
    <p class="sous" style="color:var(--alerte)">Pensez à 💾 sauvegarder avant si vous voulez pouvoir les retrouver plus tard.</p>
    <div class="pied-fen"><button type="button" class="btn" data-r="sauver">💾 Sauvegarder d'abord</button>
      <div class="droite"><button type="button" class="btn fin" data-r="non">Annuler</button><button type="button" class="btn plein" data-r="oui">Tout effacer</button></div></div>`,
    fen => $$('[data-r]', fen).forEach(b => b.addEventListener('click', () => {
      const r = b.dataset.r;
      if (r === 'sauver') { ACT.sauvegarder(); return; }
      fermerModale();
      if (r !== 'oui') return;
      instantane();
      S = vierge();
      ['naotrip.donnees', 'naotrip.vue', 'naotrip.theme', 'naotrip.calme'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver();
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.classList.remove('calme');
      filtreValise = 'tous'; modeGlobe = 'globe'; souvenirPhotos = null;
      Globe.rafraichir(); Globe.zoom = 1; Globe.auto = true;
      aller('accueil');
      toast('NaoTrip est de nouveau vierge ✨', { annuler: true, duree: 8000 });
    })));
};
ACT['exemple'] = () => {
  const a = auj(), d = ajouteJours(a, 24), f = ajouteJours(d, 3);
  const c = { id: uid(), nom: 'Camille' }, x = { id: uid(), nom: 'Alex' };
  const v = normaliserVoyage({
    id: uid(), creeLe: ajouteJours(a, -12), nom: 'Week-end à Lisbonne', destination: 'Lisbonne, Portugal', pays: ['PT'], debut: d, fin: f, heureDepart: '07:15',
    type: 'couple', voyageurs: [c, x], devise: 'EUR',
    budget: { transport: 320, hebergement: 420, restauration: 280, activites: 120, shopping: 80, divers: 50 },
    reservations: [
      { id: 'r1', type: 'vol', titre: 'Vol TP 433 Paris → Lisbonne', debut: d + 'T09:40', embarquement: d + 'T09:00', fin: d + 'T11:15', lieu: 'Paris-Orly', porte: 'Terminal 1', arrivee: 'Lisbonne Humberto Delgado', reference: 'K7Q2LM', prix: 298, depense: true },
      { id: 'r2', type: 'hebergement', titre: 'Casa do Alfama', debut: d + 'T15:00', fin: f + 'T11:00', lieu: 'Alfama', adresse: 'Rua de São Miguel 12, Lisbonne', reference: 'BK-55812', telephone: '+351 21 000 00 00', prix: 405, depense: true },
      { id: 'r3', type: 'activite', titre: 'Tram 28 & visite guidée d’Alfama', debut: ajouteJours(d, 1) + 'T10:00', lieu: 'Praça Martim Moniz', prix: 36 },
      { id: 'r4', type: 'vol', titre: 'Vol TP 438 Lisbonne → Paris', debut: f + 'T18:20', embarquement: f + 'T17:40', fin: f + 'T21:50', lieu: 'Lisbonne', arrivee: 'Paris-Orly', reference: 'K7Q2LM' }],
    planning: [
      { id: uid(), jour: d, heure: '17:30', titre: 'Balade au Miradouro da Graça', type: 'visite', lieu: 'Graça' },
      { id: uid(), jour: d, heure: '20:30', titre: 'Dîner fado', type: 'soiree', lieu: 'Alfama' },
      { id: uid(), jour: ajouteJours(d, 1), heure: '15:00', titre: 'LX Factory', type: 'activite', lieu: 'Alcântara' },
      { id: uid(), jour: ajouteJours(d, 2), heure: '09:30', titre: 'Tour de Belém & pastéis', type: 'visite', lieu: 'Belém' },
      { id: uid(), jour: ajouteJours(d, 2), heure: '16:00', titre: 'Plage de Cascais', type: 'detente' }],
    idees: [
      { id: uid(), type: 'restaurant', nom: 'Time Out Market', adresse: 'Av. 24 de Julho', note: 'Pour goûter un peu de tout', statut: 'idee', coeur: true },
      { id: uid(), type: 'visite', nom: 'Château Saint-Georges', adresse: 'Castelo', statut: 'idee', prix: 15 },
      { id: uid(), type: 'activite', nom: 'Excursion à Sintra', note: 'Palais de Pena, prévoir une journée', statut: 'idee', coeur: true }],
    infos: [{ id: uid(), type: 'numero', nom: 'Urgences (Europe)', valeur: '112' }, { id: uid(), type: 'lien', nom: 'Métro de Lisbonne', valeur: 'https://www.metrolisboa.pt' }]
  });
  v.documents = DOCUMENTS_BASE.map((nom, i) => ({ id: uid(), nom, fait: i === 0 || i === 3 }));
  v.taches = TACHES_BASE.map(([nom, j], i) => ({ id: uid(), nom, jMoins: j, fait: i < 2 }));
  v.depenses = [{ id: uid(), resaId: 'r1', libelle: v.reservations[0].titre, montant: 298, categorie: 'transport', date: a, payePar: c.id, pour: [] },
    { id: uid(), resaId: 'r2', libelle: 'Casa do Alfama', montant: 405, categorie: 'hebergement', date: a, payePar: x.id, pour: [] },
    { id: uid(), libelle: 'Guide de Lisbonne', montant: 14.9, categorie: 'divers', date: a, payePar: c.id, pour: [] }];
  const passe = normaliserVoyage({ id: uid(), nom: 'Été en Grèce', destination: 'Cyclades', pays: ['GR'], debut: ajouteJours(a, -380), fin: ajouteJours(a, -366), type: 'amis', voyageurs: [c, x, { id: uid(), nom: 'Inès' }],
    souvenirs: [{ id: uid(), date: ajouteJours(a, -372), titre: 'Coucher de soleil à Oia', humeur: '🤩', lieu: 'Oia, Santorin', texte: 'Tout le village applaudit quand le soleil disparaît.', favori: true, photos: [] }] });
  S.voyages.push(v, passe); S.actif = v.id;
  Object.assign(S.monde, { FR: 'visite', IT: 'visite', ES: 'visite', MA: 'visite', GB: 'visite', JP: 'reve', CA: 'avenir', IS: 'reve' });
  sauver(); Globe.rafraichir();
  vue = 'accueil'; rendre();
  toast('Exemple chargé : un week-end à Lisbonne ☀️');
};

/* ============================================================
   LES CLICS, LE CLAVIER
   ============================================================ */
document.addEventListener('click', e => {
  if (e.target.closest('[data-stop]')) return;
  const el = e.target.closest('[data-act]');
  if (!el) { if (!e.target.closest('#bullePays, #globe')) fermerBullePays(); return; }
  const f = ACT[el.dataset.act];
  if (f) f(el, e);
});
/* un clic sur la carte à plat : le statut du pays */
document.addEventListener('click', e => {
  const p = e.target.closest('.carte-monde .pays[data-code]');
  if (!p || !p.dataset.code) return;
  e.stopPropagation();
  ouvrirBullePays(p.dataset.code, e.clientX, e.clientY);
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('.agrand')) $('.agrand').remove(); else if ($('#modale').classList.contains('ouvert')) fermerModale(); else fermerBullePays(); }
  if (e.key === 'Enter' && e.target.matches('[role="button"][data-act]')) e.target.click();
  if (e.key === 'Enter' && e.target.id === 'chercherPays') { e.preventDefault(); const b = $('[data-act="marquer-cherche"][data-statut="visite"]'); if (b) b.click(); }
});
$('#modale').addEventListener('mousedown', e => { if (e.target.id === 'modale') fermerModale(); });
$('#selVoyage').addEventListener('change', e => { S.actif = e.target.value; sauver(); rendre(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== vue && VUES.some(x => x[0] === h)) { vue = h; rendre(); } });
window.addEventListener('resize', () => { if ($('#bullePays').classList.contains('ouverte')) fermerBullePays(); });

/* ============================================================
   LE DÉCOR : motifs de voyage qui dérivent, avions qui traversent le ciel
   ============================================================ */
const ICONES = {
  avion: '<path class="plein" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
  valise: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 7v13M16 7v13"/>',
  billet: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M15 5v2M15 11v2M15 17v2M6.5 10h5M6.5 14h3"/>',
  boussole: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  montgolfiere: '<path d="M12 2a7 7 0 0 0-7 7c0 3.5 3 6 5 8h4c2-2 5-4.5 5-8a7 7 0 0 0-7-7z"/><path d="M12 2c-2 2-2.6 4.5-2.6 7s1.2 5.5 2.6 8M12 2c2 2 2.6 4.5 2.6 7s-1.2 5.5-2.6 8"/><rect x="10" y="18.8" width="4" height="3" rx=".8"/>',
  photo: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  epingle: '<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>',
  palmier: '<path d="M12 21c0-5 .5-8 1.5-11M13.5 10c-1-3-4-4-7-3M13.5 10c1-3 4-4.5 7-3.5M13.5 10c-3-.5-6 1-7 4M13.5 10c3-.2 5.5 1.5 6.5 4.5M8 21h9"/>',
  passeport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10.5" r="3.2"/><path d="M8.8 10.5h6.4M12 7.3c-1 1-1.4 2-1.4 3.2s.4 2.2 1.4 3.2M12 7.3c1 1 1.4 2 1.4 3.2s-.4 2.2-1.4 3.2M9 17h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.6 5.5 3.6 9s-1.1 6.5-3.6 9M12 3c-2.5 2.5-3.6 5.5-3.6 9s1.1 6.5 3.6 9"/>',
  nuage: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z"/>',
  carte: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5zM9 4v13.5M15 6.5V20"/>'
};
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const noms = Object.keys(ICONES);
  let hasard = 7; const alea = () => (hasard = (hasard * 9301 + 49297) % 233280) / 233280;
  const cols = Math.max(3, Math.round(W / 260)), rangs = Math.max(3, Math.round(H / 230));
  let m = '';
  /* une grille jetée au hasard : chaque motif dans sa case, jamais deux collés */
  for (let r = 0; r < rangs; r++) for (let c = 0; c < cols; c++) {
    if (alea() < .38) continue;
    const n = noms[Math.floor(alea() * noms.length)], t = 26 + alea() * 22;
    const x = (c + .15 + alea() * .7) * W / cols, y = (r + .15 + alea() * .7) * H / rangs;
    m += `<g class="m" style="opacity:${(.07 + alea() * .08).toFixed(2)};animation-duration:${(16 + alea() * 16).toFixed(1)}s;animation-delay:-${(alea() * 20).toFixed(1)}s"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(alea() * 40 - 20).toFixed(0)}) scale(${(t / 24).toFixed(2)})">${ICONES[n]}</g></g>`;
  }
  /* le ciel étoilé */
  for (let i = 0; i < 26; i++) {
    const x = alea() * W, y = alea() * H * .75, s = 1.6 + alea() * 2.6;
    m += `<path class="etoile" style="animation-duration:${(2.5 + alea() * 4).toFixed(1)}s;animation-delay:-${(alea() * 5).toFixed(1)}s" d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z"/>`;
  }
  /* les vols : un sillage en pointillés et un petit avion qui le suit */
  const vols = [[-60, H * .28, W * .45, H * .02, W + 60, H * .2, 38, 0], [W + 60, H * .72, W * .5, H * .5, -60, H * .62, 52, 14], [-60, H * .9, W * .35, H * .55, W + 60, H * .45, 64, 30]];
  m += '<g class="vols">' + vols.map(([x1, y1, cx, cy, x2, y2, dur, del], i) => {
    const d = `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
    return `<path id="vol${i}" class="sillage" d="${d}"/><g class="avion"><g transform="rotate(90) scale(.95) translate(-12 -12)">${ICONES.avion.replace('class="plein" ', '')}</g>
      <animateMotion dur="${dur}s" begin="-${del}s" repeatCount="indefinite" rotate="auto"><mpath href="#vol${i}"/></animateMotion></g>`;
  }).join('') + '</g>';
  svg.innerHTML = m;
}
let minuteurDecor = null;
window.addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

decor();
rendre();
