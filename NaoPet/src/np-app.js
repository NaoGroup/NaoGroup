'use strict';
/* ============================================================
   NaoPets — navigation, saisies, sauvegarde & démarrage
   ============================================================ */
const ONGLETS = [
  ['accueil', '🏠 Accueil'], ['animaux', '🐾 Mes animaux'], ['calendrier', '📅 Calendrier'], ['sante', '🩺 Santé'],
  ['quotidien', '🦴 Quotidien'], ['stock', '📦 Stock'], ['depenses', '💶 Dépenses'], ['vacances', '🧳 Vacances'],
  ['souvenirs', '📸 Souvenirs'], ['contacts', '📇 Contacts'],
];
function rendre() {
  if (V.animal && !animal(V.animal)) V.animal = '';
  const vierge = !S.animaux.length;
  if (vierge) V.page = 'accueil';
  $('#pages').hidden = vierge;
  $('#pages').innerHTML = ONGLETS.map(([p, l]) => `<button class="${V.page === p ? 'on' : ''}" data-act="go" data-p="${p}">${l}</button>`).join('');
  rendreSelecteur();
  rendreRappels();
  $('#vue').innerHTML = (S.exemple ? `<div class="note-douce" style="margin-top:0"><span class="em">✨</span><div>Vous découvrez NaoPets avec un <b>exemple</b> (Moka, Pixel et Caramel). Quand vous êtes prêt·e, repartez d'une page blanche pour vos propres compagnons.</div>
      <button class="btn petit" style="margin-left:auto;flex:none" data-act="effacer-exemple">🌱 Commencer avec mes animaux</button></div>` : '') + (PAGES[V.page] || PAGES.accueil)();
  try { localStorage.setItem('naopet.vue', JSON.stringify({ page: V.page, animal: V.animal, sous: V.sous })); } catch (e) {}
}
ACTIONS.go = el => {
  V.page = el.dataset.p;
  if (el.dataset.s) V.sous[V.page] = el.dataset.s;
  fermer(); rendre(); scrollTo({ top: 0, behavior: 'smooth' });
};
ACTIONS.sous = el => { V.sous[el.dataset.p] = el.dataset.s; rendre(); };
ACTIONS.choisir = el => { V.animal = el.dataset.id; if (el.dataset.p) V.page = el.dataset.p; rendre(); };
ACTIONS['voir-animal'] = el => { V.animal = el.dataset.id; V.page = 'animaux'; rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACTIONS.theme = () => appliquerTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
ACTIONS.fermer = () => fermer();
ACTIONS.masquer = el => {
  let m = [];
  try { m = JSON.parse(sessionStorage.getItem('naopet.masques') || '[]'); } catch (e) {}
  m.push(el.dataset.id);
  try { sessionStorage.setItem('naopet.masques', JSON.stringify(m)); } catch (e) {}
  rendreRappels();
};
ACTIONS.cocher = el => {
  const d = el.dataset.d, id = el.dataset.id;
  S.coches[d] = S.coches[d] || {};
  if (S.coches[d][id]) delete S.coches[d][id]; else S.coches[d][id] = true;
  sauver();
  const t = tachesDu(lire(d));
  if (d === cle(auj()) && t.length && t.every(x => x.fait)) toast('💜', 'Tout est fait pour aujourd’hui', 'Merci pour eux !');
};
ACTIONS['cal-mois'] = el => {
  const n = Number(el.dataset.n);
  if (!n) { V.calMois = cleMois(auj()); V.calJour = cle(auj()); }
  else { const [y, m] = V.calMois.split('-').map(Number); V.calMois = cleMois(new Date(y, m - 1 + n, 1)); }
  rendre();
};
ACTIONS['cal-jour'] = el => { V.calJour = el.dataset.d; rendre(); };
ACTIONS.mois = el => { const [y, m] = V.mois.split('-').map(Number); V.mois = cleMois(new Date(y, m - 1 + Number(el.dataset.n), 1)); rendre(); };
ACTIONS['filtre-sante'] = el => { V.filtreSante = el.dataset.f; rendre(); };
ACTIONS['filtre-journal'] = el => { V.filtreJournal = el.dataset.f; rendre(); };

/* listes de choix */
const optsAnimaux = (foyer = false) => [...(foyer ? [['', '🏡 Tout le foyer']] : []), ...actifs().map(a => [a.id, `${espece(a.espece)[2]} ${a.nom}`])];
const animalParDefaut = el => (el && el.dataset.animal) || V.animal || (actifs()[0] || {}).id || '';
function exigerAnimal() {
  if (actifs().length) return true;
  toast('🐾', 'Ajoutez d’abord un animal', 'Tout s’organise autour de ses compagnons.');
  setTimeout(() => ACTIONS.animal(), 300);
  return false;
}
function attentionNote(txt) {
  if (txt && MOTS_SOUCI.test(txt)) setTimeout(() => toast('🩺', 'Une petite inquiétude ?', 'Si quelque chose vous préoccupe, appelez votre vétérinaire : lui seul peut vous conseiller.', 9000), 400);
}
/* montre ou cache des blocs de formulaire selon un choix */
function basculer(f, source, regles) {
  const maj = () => {
    const x = f.querySelector(`[name="${source}"]`), v = x ? x.value : '';
    for (const [bloc, test] of Object.entries(regles)) { const b = f.querySelector(`[data-bloc="${bloc}"]`); if (b) b.style.display = test(v) ? '' : 'none'; }
  };
  f.addEventListener('change', e => { if (e.target.name === source) maj(); });
  maj();
}

/* ============================================================
   Animal
   ============================================================ */
ACTIONS.animal = el => {
  const id = el && el.dataset.id, a = id ? animal(id) : null, neuf = !a;
  const val = a ? { ...a, budget: S.budgets[a.id] || '' } : { espece: 'chien' };
  formulaire({
    titre: neuf ? '🐾 Un nouveau compagnon' : `✏️ La fiche de ${esc(a.nom)}`, large: true,
    chapo: neuf ? 'Quelques informations suffisent pour commencer : tout se complète plus tard.' : '',
    valeurs: val,
    champs: [
      { k: 'photo', lab: 'Photo', type: 'photo', large: true },
      { k: 'nom', lab: 'Prénom', req: true, place: 'Ex. : Moka' },
      { k: 'espece', lab: 'Espèce', type: 'select', options: ESPECES.map(e => [e[0], `${e[2]} ${e[1]}`]) },
      { k: 'race', lab: 'Race', place: 'Ex. : Berger australien, européen…' },
      { k: 'sexe', lab: 'Sexe', type: 'choix', options: [['f', '♀ Femelle'], ['m', '♂ Mâle'], ['', 'Je ne sais pas']] },
      { k: 'naissance', lab: 'Date de naissance', type: 'date', aide: 'Même approximative.' },
      { k: 'ageTexte', lab: 'ou âge estimé', place: 'Ex. : environ 3 ans' },
      { k: 'poids', lab: 'Poids actuel (kg)', type: 'number', step: '0.01', min: 0, aide: neuf ? 'Sera la première pesée de la courbe.' : 'Une nouvelle valeur ajoute une pesée datée d’aujourd’hui.' },
      { k: 'couleur', lab: 'Couleur / robe', place: 'Ex. : bleu merle, tigré…' },
      { k: 'adoption', lab: "Date d'adoption", type: 'date' },
      { k: 'sterilise', type: 'case', texte: 'Stérilisé(e)' },
      { k: 's1', type: 'sep', lab: 'Informations importantes' },
      { k: 'allergies', lab: 'Allergies connues', type: 'textarea', rows: 2, place: 'Telles qu’indiquées par votre vétérinaire' },
      { k: 'sensibilites', lab: 'Sensibilités alimentaires', type: 'textarea', rows: 2, place: 'Ex. : ne supporte pas le poulet' },
      { k: 'puce', lab: 'Puce électronique / tatouage', place: 'Numéro d’identification', large: true },
      { k: 'assureur', lab: 'Assurance animale', place: 'Compagnie' }, { k: 'contrat', lab: 'N° de contrat' },
      { k: 'assuranceTel', lab: "Téléphone de l'assurance", type: 'tel' },
      { k: 'budget', lab: 'Budget mensuel (€)', type: 'number', min: 0, step: '1', aide: 'Pour suivre les dépenses du mois.' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Habitudes, caractère, ce qu’il faut savoir pour le garder…' },
      ...(neuf ? [] : [{ k: 's2', type: 'sep', lab: 'Souvenir' },
        { k: 'parti', type: 'case', texte: 'Il ou elle nous a quittés 🌈 — garder sa fiche et ses souvenirs, sans rappels', large: true },
        { k: 'partiLe', lab: 'Date', type: 'date' }]),
    ],
    texteOk: neuf ? '🐾 Ajouter' : 'Enregistrer',
    supprimer: neuf ? null : () => {
      S.animaux = S.animaux.filter(x => x.id !== id);
      for (const k of ['repas', 'rappels', 'rdv', 'sante', 'poids', 'journal', 'souvenirs']) S[k] = S[k].filter(x => x.animal !== id);
      S.depenses = S.depenses.filter(x => x.animal !== id);
      S.stock.forEach(s => { if (s.animal === id) s.animal = ''; });
      S.contacts.forEach(c => { if (c.animaux) c.animaux = c.animaux.filter(x => x !== id); });
      delete S.budgets[id];
      if (V.animal === id) V.animal = '';
    },
    enregistrer: v => {
      const cible = a || { id: uid(), cree: cle(auj()) };
      const poidsAvant = a ? dernierPoids(a) : 0;
      const budget = v.budget; delete v.budget;
      Object.assign(cible, v);
      if (budget !== '') S.budgets[cible.id] = nombre(budget); else delete S.budgets[cible.id];
      if (v.poids && nombre(v.poids) !== poidsAvant) {
        S.poids = S.poids.filter(p => !(p.animal === cible.id && p.date === cle(auj())));
        S.poids.push({ id: uid(), animal: cible.id, date: cle(auj()), kg: nombre(v.poids) });
      }
      if (neuf) {
        S.animaux.push(cible); V.animal = cible.id; V.page = 'animaux';
        toast('🐾', `Bienvenue ${cible.nom} !`, 'Ajoutez ses repas, ses rappels et son vétérinaire depuis sa fiche.');
      }
    },
  });
};

/* ============================================================
   Rappels, repas
   ============================================================ */
ACTIONS.rappel = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, r = id ? S.rappels.find(x => x.id === id) : null;
  const val = r ? { ...r, heures: (r.heures || []).join(', '), intervalle: r.intervalle || 1 } : { animal: animalParDefaut(el), type: 'promenade', freq: 'jour', intervalle: 1, debut: cle(auj()), jours: [] };
  formulaire({
    titre: r ? '🔔 Modifier le rappel' : '🔔 Nouveau rappel',
    chapo: 'Repas, promenades, eau, toilettage, antiparasitaire, médicament prescrit : il apparaîtra dans « À faire aujourd’hui » et dans le calendrier.',
    valeurs: val,
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux(true) },
      { k: 'type', lab: 'Type', type: 'select', options: opts(T_RAPPEL) },
      { k: 'titre', lab: 'Intitulé (facultatif)', place: 'Ex. : Balade du matin', large: true },
      { k: 'freq', lab: 'Répétition', type: 'select', options: FREQ },
      { k: 'intervalle', lab: 'Tous les… (jours, semaines, mois ou ans)', type: 'number', min: 1, step: '1' },
      { k: 'jours', lab: 'Les jours', type: 'jours', large: true },
      { k: 'debut', lab: 'À partir du', type: 'date' },
      { k: 'fin', lab: "Jusqu'au (facultatif)", type: 'date', aide: 'Pour un traitement prescrit sur une durée précise.' },
      { k: 'heures', lab: 'Heure(s)', place: 'Ex. : 08:00, 19:30', large: true, aide: 'Une ou plusieurs heures, séparées par une virgule.' },
      { k: 'posologie', lab: 'Posologie prescrite', place: 'Recopiée de l’ordonnance', large: true },
      { k: 'noteMed', type: 'note', em: '💊', html: 'NaoPets vous rappelle simplement l’heure. <b>La posologie reste celle de l’ordonnance</b> : ne la modifiez jamais sans l’avis de votre vétérinaire.' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 },
    ],
    supprimer: r ? () => { S.rappels = S.rappels.filter(x => x.id !== id); } : null,
    apres: f => {
      basculer(f, 'freq', { jours: v => v === 'semaine', intervalle: v => v !== 'unique', fin: v => v !== 'unique' });
      const med = () => { const m = f.querySelector('[name="type"]').value === 'medicament'; f.querySelector('[data-bloc="posologie"]').style.display = m ? '' : 'none'; f.querySelector('.note-douce').closest('.champ').style.display = m ? '' : 'none'; };
      f.addEventListener('change', e => { if (e.target.name === 'type') med(); }); med();
    },
    enregistrer: v => {
      const hs = v.heures.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      const mauvaise = hs.find(h => !heureOk(h));
      if (mauvaise) { toast('🕘', `« ${mauvaise} » n’est pas une heure`, 'Écrivez par exemple 08:00 ou 18h30.'); return false; }
      if (!v.debut) v.debut = cle(auj());
      if (v.freq === 'semaine' && !v.jours.length) v.jours = [lire(v.debut).getDay()];
      delete v.noteMed;
      const o = Object.assign(r || { id: uid() }, v, { heures: hs.map(heureNorm).sort(), intervalle: Math.max(1, Math.round(nombre(v.intervalle)) || 1) });
      if (v.type !== 'medicament') o.posologie = '';
      if (!r) { S.rappels.push(o); toast('🔔', 'Rappel créé', texteFreq(o)); }
    },
  });
};
ACTIONS.repas = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, r = id ? S.repas.find(x => x.id === id) : null;
  const a = animal(r ? r.animal : animalParDefaut(el));
  formulaire({
    titre: r ? '🍽️ Modifier le repas' : '🍽️ Planifier un repas',
    chapo: 'Chaque repas planifié revient tous les jours dans « À faire aujourd’hui ».',
    valeurs: r || { animal: animalParDefaut(el), heure: '08:00' },
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux() },
      { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'aliment', lab: "Type d'alimentation", place: 'Ex. : croquettes, pâtée, foin, granulés…', req: true },
      { k: 'quantite', lab: 'Quantité', place: 'Ex. : 120 g, 1 sachet' },
      { k: 'notes', lab: 'Notes alimentaires', type: 'textarea', large: true, rows: 2, place: 'Ex. : mélanger avec un peu d’eau tiède' },
      ...(a && (a.sensibilites || a.allergies) ? [{ k: 'n', type: 'note', em: '🥣', html: `À garder en tête pour ${esc(a.nom)} : ${esc([a.sensibilites, a.allergies].filter(Boolean).join(' · '))}` }] : []),
    ],
    supprimer: r ? () => { S.repas = S.repas.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (r) Object.assign(r, v); else S.repas.push({ id: uid(), debut: cle(auj()), ...v }); },
  });
};

/* ============================================================
   Rendez-vous, soins, poids
   ============================================================ */
ACTIONS.rdv = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, r = id ? S.rdv.find(x => x.id === id) : null;
  const veto = S.contacts.find(c => c.type === 'veterinaire');
  formulaire({
    titre: r ? '📅 Le rendez-vous' : '📅 Nouveau rendez-vous',
    valeurs: r ? { duree: 60, ...r } : { animal: animalParDefaut(el), type: 'consultation', date: (el && el.dataset.date) || cle(plus(auj(), 7)), lieu: veto ? veto.nom : '', duree: 60 },
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux() },
      { k: 'type', lab: 'Type', type: 'select', options: opts(T_RDV) },
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'duree', lab: 'Durée prévue (minutes)', type: 'number', min: 5, step: '5' },
      { k: 'titre', lab: 'Intitulé (facultatif)', place: 'Ex. : Rappel annuel' },
      { k: 'lieu', lab: 'Où / avec qui', place: 'Ex. : Clinique des Tilleuls' },
      { k: 'motif', lab: 'Motif ou questions à poser', type: 'textarea', large: true, rows: 2, place: 'Pour ne rien oublier le jour J' },
      { k: 'notes', lab: 'Compte rendu / notes', type: 'textarea', large: true, rows: 2, place: 'Ce que le vétérinaire a dit ou prescrit' },
      { k: 'fait', type: 'case', texte: 'Rendez-vous passé / effectué', large: true },
      { k: 'n', type: 'note', em: '📅', html: 'Ce rendez-vous apparaît aussi dans <b>NaoAgenda</b>, marqué 🐾 : vous pouvez le modifier dans l’un ou l’autre outil, les deux restent d’accord.' },
    ],
    supprimer: r ? () => { S.rdv = S.rdv.filter(x => x.id !== id); } : null,
    enregistrer: v => {
      v.duree = Math.max(5, Math.round(nombre(v.duree)) || 60);
      if (r) Object.assign(r, v); else { S.rdv.push({ id: uid(), ...v }); toast('📅', 'Rendez-vous noté', `${nomA(v.animal)} · ${dateLongue(lire(v.date))}${v.heure ? ' à ' + fmtH(v.heure) : ''}`); }
      attentionNote(v.motif + ' ' + v.notes);
    },
  });
};
ACTIONS.soin = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, s = id ? S.sante.find(x => x.id === id) : null;
  const pre = el && el.dataset.pre ? JSON.parse(el.dataset.pre) : null;
  formulaire({
    titre: s ? '🩺 Le soin' : '💉 Noter un soin',
    chapo: 'Recopiez ce qui figure sur le carnet de santé ou l’ordonnance. La date de rappel est celle indiquée par votre vétérinaire.',
    valeurs: s || pre || { animal: animalParDefaut(el), type: 'vaccin', date: cle(auj()) },
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux() },
      { k: 'type', lab: 'Type', type: 'select', options: opts(T_SANTE) },
      { k: 'nom', lab: 'Nom (tel qu’écrit sur le carnet)', place: 'Ex. : nom du vaccin ou du produit', large: true },
      { k: 'date', lab: 'Date', type: 'date' },
      { k: 'prochain', lab: 'Prochain rappel / renouvellement', type: 'date', aide: 'Facultatif — apparaîtra dans « Vaccins et rappels à venir ».' },
      { k: 'veto', lab: 'Vétérinaire / lieu', large: true },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : posologie prescrite, n° de lot, remarques du vétérinaire' },
      { k: 'n', type: 'note', em: '🩺', html: 'NaoPets conserve l’historique : <b>il ne recommande ni vaccin, ni traitement, ni dosage.</b> Ces choix appartiennent à votre vétérinaire.' },
    ],
    supprimer: s ? () => { S.sante = S.sante.filter(x => x.id !== id); } : null,
    enregistrer: v => {
      if (s) Object.assign(s, v); else S.sante.push({ id: uid(), ...v });
      if (pre && pre.precedent) { const p = S.sante.find(x => x.id === pre.precedent); if (p) p.renouvele = true; }
      attentionNote(v.notes);
      if (!s) toast('💉', 'Soin ajouté au carnet', v.prochain ? `Prochain rappel : ${dateMoy(lire(v.prochain))}` : nomA(v.animal));
    },
  });
};
/* un rappel de soin a été fait : on l'enregistre comme un nouveau soin daté d'aujourd'hui */
ACTIONS['soin-suivant'] = el => {
  const s = S.sante.find(x => x.id === el.dataset.id); if (!s) return;
  fermer();
  const faux = { dataset: { pre: JSON.stringify({ animal: s.animal, type: s.type, nom: s.nom, veto: s.veto, date: cle(auj()), precedent: s.id }) } };
  ACTIONS.soin(faux);
};
ACTIONS.poids = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, p = id ? S.poids.find(x => x.id === id) : null;
  formulaire({
    titre: p ? '⚖️ La pesée' : '⚖️ Noter un poids', chapo: '',
    valeurs: p || { animal: animalParDefaut(el), date: cle(auj()) },
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux() },
      { k: 'date', lab: 'Date', type: 'date' },
      { k: 'kg', lab: 'Poids (kg)', type: 'number', step: '0.01', min: 0, req: true },
      { k: 'note', lab: 'Note', place: 'Ex. : chez le vétérinaire' },
    ],
    supprimer: p ? () => { S.poids = S.poids.filter(x => x.id !== id); } : null,
    enregistrer: v => {
      if (!(nombre(v.kg) > 0)) { toast('⚖️', 'Indiquez un poids'); return false; }
      v.kg = nombre(v.kg); if (!v.date) v.date = cle(auj());
      if (p) Object.assign(p, v); else S.poids.push({ id: uid(), ...v });
    },
  });
};

/* ============================================================
   Journal, stock, dépenses, budgets
   ============================================================ */
ACTIONS.journal = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, j = id ? S.journal.find(x => x.id === id) : null;
  const n = new Date();
  formulaire({
    titre: j ? '📔 Le moment' : '📔 Noter un moment',
    valeurs: j || { animal: animalParDefaut(el), type: (el && el.dataset.type) || 'promenade', date: (el && el.dataset.date) || cle(auj()), heure: `${pad(n.getHours())}:${pad(n.getMinutes())}` },
    champs: [
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux() },
      { k: 'type', lab: 'Moment', type: 'select', options: opts(T_JOURNAL) },
      { k: 'date', lab: 'Date', type: 'date' }, { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'titre', lab: 'Intitulé (facultatif)', place: 'Ex. : Grande balade en forêt' },
      { k: 'duree', lab: 'Durée (minutes)', type: 'number', min: 0, step: '5' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 },
    ],
    supprimer: j ? () => { S.journal = S.journal.filter(x => x.id !== id); } : null,
    enregistrer: v => {
      if (j) Object.assign(j, v); else { S.journal.push({ id: uid(), ...v }); toast(T_JOURNAL[v.type][0], 'Moment noté', nomA(v.animal)); }
      attentionNote(v.notes);
    },
  });
};
ACTIONS.stock = el => {
  const id = el && el.dataset.id, s = id ? S.stock.find(x => x.id === id) : null;
  formulaire({
    titre: s ? `📦 ${esc(s.nom)}` : '📦 Suivre un article',
    chapo: 'Indiquez un seuil ou une consommation par jour : NaoPets vous préviendra doucement quand il faudra racheter.',
    valeurs: s || { categorie: 'nourriture', animal: V.animal, unite: 'kg' },
    champs: [
      { k: 'nom', lab: 'Article', req: true, place: 'Ex. : Croquettes saumon 12 kg', large: true },
      { k: 'categorie', lab: 'Catégorie', type: 'select', options: opts(T_STOCK) },
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux(true) },
      { k: 'quantite', lab: 'Quantité restante', type: 'number', min: 0, step: '0.1', req: true },
      { k: 'unite', lab: 'Unité', place: 'kg, sachets, boîtes, litres…' },
      { k: 'capacite', lab: 'Quantité quand c’est plein', type: 'number', min: 0, step: '0.1', aide: 'Ex. : un sac neuf = 12 kg.' },
      { k: 'seuil', lab: 'Me prévenir sous', type: 'number', min: 0, step: '0.1' },
      { k: 'conso', lab: 'Consommation par jour', type: 'number', min: 0, step: '0.01', aide: 'Facultatif : pour estimer les jours restants.' },
      { k: 'notes', lab: 'Notes', place: 'Ex. : où l’acheter, référence…' },
    ],
    supprimer: s ? () => { S.stock = S.stock.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (s) Object.assign(s, v); else S.stock.push({ id: uid(), ...v }); },
  });
};
const stockPas = s => nombre(s.capacite) >= 20 ? 1 : nombre(s.capacite) >= 5 ? .5 : 1;
ACTIONS['stock-plus'] = el => { const s = S.stock.find(x => x.id === el.dataset.id); s.quantite = +(nombre(s.quantite) + stockPas(s)).toFixed(2); sauver(); };
ACTIONS['stock-moins'] = el => { const s = S.stock.find(x => x.id === el.dataset.id); s.quantite = Math.max(0, +(nombre(s.quantite) - stockPas(s)).toFixed(2)); sauver(); };
ACTIONS['stock-plein'] = el => {
  const s = S.stock.find(x => x.id === el.dataset.id); if (!s) return;
  if (!nombre(s.capacite)) { toast('📦', 'Indiquez la quantité d’un article neuf', 'Et NaoPets remettra le stock à niveau en un clic.'); ACTIONS.stock(el); return; }
  s.quantite = nombre(s.capacite); sauver();
  toast('🛒', `${s.nom} : stock à niveau`, 'Ajoutez l’achat dans vos dépenses si vous le souhaitez.');
};
ACTIONS.depense = el => {
  const id = el && el.dataset.id, d = id ? S.depenses.find(x => x.id === id) : null;
  formulaire({
    titre: d ? '💶 La dépense' : '💶 Nouvelle dépense',
    valeurs: d || { animal: V.animal, categorie: 'alimentation', date: cle(auj()) },
    champs: [
      { k: 'libelle', lab: 'Libellé', place: 'Ex. : Sac de croquettes', large: true },
      { k: 'montant', lab: 'Montant (€)', type: 'number', min: 0, step: '0.01', req: true },
      { k: 'date', lab: 'Date', type: 'date' },
      { k: 'categorie', lab: 'Catégorie', type: 'select', options: opts(T_DEPENSE) },
      { k: 'animal', lab: 'Pour', type: 'select', options: optsAnimaux(true), aide: '« Tout le foyer » est partagé à parts égales entre vos animaux.' },
      { k: 'notes', lab: 'Notes', large: true },
    ],
    supprimer: d ? () => { S.depenses = S.depenses.filter(x => x.id !== id); } : null,
    enregistrer: v => {
      if (!(nombre(v.montant) > 0)) { toast('💶', 'Indiquez un montant'); return false; }
      v.montant = nombre(v.montant); if (!v.date) v.date = cle(auj());
      if (d) Object.assign(d, v); else { S.depenses.push({ id: uid(), ...v }); toast('💶', 'Dépense ajoutée', `${eurosFin(v.montant)} · ${T_DEPENSE[v.categorie][1]}`); }
    },
  });
};
ACTIONS.budgets = () => {
  if (!exigerAnimal()) return;
  formulaire({
    titre: '🎯 Budgets mensuels', chapo: 'Un repère pour chaque animal. Le budget annuel est calculé automatiquement (× 12).',
    valeurs: Object.fromEntries(actifs().map(a => ['b-' + a.id, S.budgets[a.id] || ''])),
    champs: actifs().map(a => ({ k: 'b-' + a.id, lab: `${a.nom} (€ / mois)`, type: 'number', min: 0, step: '1' })),
    enregistrer: v => { for (const a of actifs()) { const x = v['b-' + a.id]; if (x !== '') S.budgets[a.id] = nombre(x); else delete S.budgets[a.id]; } },
  });
};

/* ============================================================
   Souvenirs, contacts, vacances
   ============================================================ */
ACTIONS.souvenir = el => {
  if (!exigerAnimal()) return;
  const id = el && el.dataset.id, s = id ? S.souvenirs.find(x => x.id === id) : null;
  fermer();
  formulaire({
    titre: s ? '📸 Le souvenir' : '📸 Nouveau souvenir',
    valeurs: s || { animal: animalParDefaut(el), date: cle(auj()) },
    champs: [
      { k: 'photo', lab: 'Photo', type: 'photo', large: true },
      { k: 'animal', lab: 'Qui', type: 'select', options: optsAnimaux(true) },
      { k: 'date', lab: 'Date', type: 'date' },
      { k: 'titre', lab: 'Titre', place: 'Ex. : Sa première neige', large: true },
      { k: 'texte', lab: 'Le souvenir', type: 'textarea', large: true, rows: 3 },
    ],
    supprimer: s ? () => { S.souvenirs = S.souvenirs.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (s) Object.assign(s, v); else { S.souvenirs.push({ id: uid(), ...v }); toast('📸', 'Souvenir gardé', v.titre || ''); } },
  });
};
ACTIONS['souvenir-voir'] = el => {
  const s = S.souvenirs.find(x => x.id === el.dataset.id); if (!s) return;
  fenetre(`<div class="fenetre large" role="dialog" aria-modal="true">
    ${s.photo ? `<img class="photo-grande" src="${s.photo}" alt="">` : ''}
    <h2>${esc(s.titre || 'Souvenir')}</h2><p class="chapo">${s.animal ? esc(nomA(s.animal)) + ' · ' : ''}${s.date ? dateLongue(lire(s.date)) : ''}</p>
    ${s.texte ? `<p style="white-space:pre-wrap;margin:0">${esc(s.texte)}</p>` : ''}
    <div class="pied"><div class="spacer"></div><button class="btn" data-act="souvenir" data-id="${s.id}">✏️ Modifier</button><button class="btn plein" data-act="fermer">Fermer</button></div></div>`);
};
ACTIONS.contact = el => {
  const id = el && el.dataset.id, c = id ? S.contacts.find(x => x.id === id) : null;
  formulaire({
    titre: c ? `📇 ${esc(c.nom)}` : '📇 Nouveau contact',
    valeurs: c || { type: 'veterinaire', animaux: [] },
    champs: [
      { k: 'type', lab: 'Type', type: 'select', options: opts(T_CONTACT) },
      { k: 'nom', lab: 'Nom', req: true, place: 'Ex. : Dr Martin — Clinique des Tilleuls' },
      { k: 'tel', lab: 'Téléphone', type: 'tel' }, { k: 'email', lab: 'E-mail', type: 'email' },
      { k: 'adresse', lab: 'Adresse', large: true },
      { k: 'horaires', lab: 'Horaires', place: 'Ex. : lun–sam 9 h–19 h', large: true },
      ...(actifs().length ? [{ k: 'animaux', lab: 'Pour (aucun coché = tous)', type: 'multi', large: true, options: actifs().map(a => [a.id, `${espece(a.espece)[2]} ${esc(a.nom)}`]) }] : []),
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 },
    ],
    supprimer: c ? () => { S.contacts = S.contacts.filter(x => x.id !== id); } : null,
    enregistrer: v => { if (c) Object.assign(c, v); else S.contacts.push({ id: uid(), ...v }); },
  });
};
ACTIONS.vacances = () => {
  formulaire({
    titre: '🧳 Le prochain séjour', valeurs: S.vacances,
    champs: [
      { k: 'destination', lab: 'Destination', large: true, place: 'Ex. : Bretagne' },
      { k: 'depart', lab: 'Départ', type: 'date' }, { k: 'retour', lab: 'Retour', type: 'date' },
      { k: 'garde', lab: 'Pendant ce temps', type: 'choix', large: true, options: [['emmene', '🚗 Il part avec nous'], ['pension', '🏡 Pension'], ['petsitter', '🤝 Pet-sitter'], ['famille', '💜 Famille ou amis']] },
      { k: 'gardeNom', lab: 'Qui s’en occupe', place: 'Nom de la pension ou de la personne' }, { k: 'gardeTel', lab: 'Téléphone', type: 'tel' },
      { k: 'consignes', lab: 'Consignes pour la garde', type: 'textarea', large: true, rows: 3, place: 'Repas, habitudes, médicaments prescrits, contact du vétérinaire…' },
    ],
    enregistrer: v => { Object.assign(S.vacances, v); },
  });
};
ACTIONS['vac-cocher'] = el => { const i = S.vacances.items.find(x => x.id === el.dataset.id); i.fait = !i.fait; sauver(); };
ACTIONS['vac-suppr'] = el => { S.vacances.items = S.vacances.items.filter(x => x.id !== el.dataset.id); sauver(); };
ACTIONS['vac-reinit'] = () => { S.vacances.items.forEach(i => { i.fait = false; }); sauver(); };
ACTIONS['vac-defaut'] = async () => { if (await confirmer('Revenir à la liste d’origine ?', 'Vos ajouts seront retirés de la checklist.', 'Revenir', false)) { S.vacances.items = checklistDefaut(); sauver(); } };
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form="vac-ajout"]'); if (!f) return;
  e.preventDefault();
  const t = f.texte.value.trim(); if (!t) return;
  S.vacances.items.push({ id: uid(), cat: f.cat.value, texte: t, fait: false }); sauver();
});

/* ============================================================
   Sauvegarde, chargement, exemple
   ============================================================ */
function sauvegarderFichier() {
  telecharger(`naopet-sauvegarde-${cle(auj())}.json`, JSON.stringify({ naopet: 1, data: S }), 'application/json');
  toast('💾', 'Carnet sauvegardé', 'Le fichier est dans vos téléchargements : « Ouvrir » permet de le recharger.');
}
ACTIONS.sauvegarde = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>💾 Sauvegarder & recharger</h2>
    <p class="chapo">NaoPets garde tout dans ce navigateur, sur cet ordinateur. Une sauvegarde régulière dans un fichier met vos informations à l’abri.</p>
    <div class="pied" style="margin-top:0"><button class="btn plein" data-x="sauver">💾 Sauvegarder dans un fichier</button><button class="btn" data-x="ouvrir">📂 Ouvrir une sauvegarde</button></div>
    ${S.animaux.length ? `<div class="note-douce" style="margin-top:18px;background:var(--creux);border-color:var(--bord)"><span class="em">🌱</span><div>Envie de repartir de zéro ? Vous pouvez effacer le carnet de cet ordinateur (pensez à le sauvegarder juste avant).
      <div style="margin-top:8px"><button class="btn petit danger" data-x="effacer">🌱 Tout effacer et recommencer</button></div></div></div>` : ''}
    <div class="pied"><div class="spacer"></div><button class="btn" data-act="fermer">Fermer</button></div></div>`);
  v.addEventListener('click', async e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'sauver') sauvegarderFichier();
    if (x === 'ouvrir') { fermer(v); ACTIONS.ouvrir(); }
    if (x === 'effacer') { fermer(v); ACTIONS.reinitialiser(); }
  });
};
/* remet l'outil à neuf, exactement comme à la toute première ouverture */
function reinitialiser() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('naopet.')) localStorage.removeItem(k);
    sessionStorage.removeItem('naopet.masques');
  } catch (e) {}
  S = completer(vierge());
  Object.assign(V, { page: 'accueil', animal: '', sous: { sante: 'rdv', quotidien: 'aujourdhui', depenses: 'mois' }, mois: cleMois(auj()),
    calMois: cleMois(auj()), calJour: cle(auj()), filtreSante: 'tout', filtreJournal: 'tout' });
  enregistrer();
  appliquerTheme('dark');
  $$('.voile').forEach(x => x.remove());
  rendre(); scrollTo({ top: 0 });
  toast('🌱', 'NaoPets est comme neuf', 'Une page blanche vous attend.');
}
ACTIONS.reinitialiser = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>↺ Réinitialiser NaoPets</h2>
    <p class="chapo">L’outil redevient <b>vierge, comme pour un nouvel utilisateur</b> : animaux, repas, rappels, rendez-vous, carnet de santé, poids, journal, stock,
      dépenses, budgets, vacances, souvenirs, contacts et préférences d’affichage seront <b>effacés de cet ordinateur</b>.</p>
    <div class="note-douce"><span class="em">💾</span><div><b>Conseil :</b> gardez d’abord une sauvegarde. Vous pourrez la rouvrir plus tard avec 💾 → 📂 Ouvrir une sauvegarde.</div></div>
    <div class="pied"><button class="btn" data-act="fermer">Annuler</button><div class="spacer"></div>
      <button class="btn danger" data-r="sans">Effacer sans sauvegarder</button>
      <button class="btn plein" data-r="avec">💾 Sauvegarder, puis réinitialiser</button></div></div>`);
  v.addEventListener('click', async e => {
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'avec') { sauvegarderFichier(); fermer(v); setTimeout(reinitialiser, 600); return; }
    if (await confirmer('Tout effacer ?', 'Toutes les données de NaoPets seront <b>définitivement</b> effacées de cet ordinateur. Cette action ne peut pas être annulée.', 'Tout effacer')) reinitialiser();
  });
};
ACTIONS.ouvrir = () => { $('#fichier').value = ''; $('#fichier').click(); };
$('#fichier').addEventListener('change', async () => {
  const f = $('#fichier').files[0]; if (!f) return;
  let j;
  try { j = JSON.parse(await f.text()); } catch (e) { toast('📂', 'Fichier illisible', 'Ce n’est pas une sauvegarde NaoPets.'); return; }
  if (!j || !j.naopet || !j.data || !Array.isArray(j.data.animaux)) { toast('📂', 'Fichier non reconnu', 'Ce n’est pas une sauvegarde NaoPets.'); return; }
  if (S.animaux.length && !await confirmer('Remplacer le carnet ?', 'Le carnet de cet ordinateur sera remplacé par celui du fichier. <b>Conseil :</b> sauvegardez d’abord le carnet actuel si vous voulez le garder.', 'Remplacer')) return;
  S = completer(j.data); V.animal = ''; V.page = 'accueil'; sauver();
  toast('📂', 'Carnet chargé', pluriel(S.animaux.length, 'animal', 'animaux'));
});
ACTIONS['effacer-exemple'] = async () => {
  if (!await confirmer('Commencer avec vos animaux ?', 'L’exemple (Moka, Pixel et Caramel) sera effacé pour laisser place à vos propres compagnons.', 'C’est parti', false)) return;
  S = completer(vierge()); V.animal = ''; V.page = 'accueil'; sauver();
  setTimeout(() => ACTIONS.animal(), 300);
};
ACTIONS.exemple = () => {
  const a = auj(), j = n => cle(plus(a, n)), an = a.getFullYear();
  const moka = uid(), pixel = uid() + 'p', caramel = uid() + 'c', veto = uid() + 'v';
  const ilYa = (ans, n) => plus(new Date(an - ans, a.getMonth(), a.getDate()), n);
  const nMoka = cle(ilYa(4, 9)), nPixel = cle(ilYa(2, -150));
  const s = completer(vierge());
  s.exemple = true;
  s.animaux = [
    { id: moka, nom: 'Moka', espece: 'chien', race: 'Berger australien', sexe: 'f', sterilise: true, naissance: nMoka, couleur: 'Bleu merle', adoption: cle(plus(lire(nMoka), 70)),
      allergies: '', sensibilites: 'Digère mal le poulet', puce: '250 26 98 12 345 678', assureur: 'Assurance Compagnons', contrat: 'AC-44821', assuranceTel: '01 23 45 67 89', notes: 'Adore les balles, a peur de l’orage.' },
    { id: pixel, nom: 'Pixel', espece: 'chat', race: 'Européen', sexe: 'm', sterilise: true, naissance: nPixel, couleur: 'Tigré roux', adoption: cle(ilYa(2, 2)),
      allergies: 'Allergie aux piqûres de puces (selon le vétérinaire)', sensibilites: '', puce: '250 26 98 12 876 543', notes: 'Chat d’intérieur, très câlin le soir.' },
    { id: caramel, nom: 'Caramel', espece: 'lapin', race: 'Bélier nain', sexe: 'm', naissance: cle(ilYa(1, -110)), couleur: 'Fauve', adoption: cle(ilYa(1, -30)), sensibilites: 'Pas de fruits sucrés en grande quantité', notes: 'Sort dans le salon le matin.' },
  ];
  s.budgets = { [moka]: 90, [pixel]: 45, [caramel]: 30 };
  s.poids = [[moka, -300, 17.2], [moka, -200, 17.8], [moka, -120, 18.1], [moka, -60, 17.9], [moka, -10, 18.3], [pixel, -240, 4.6], [pixel, -130, 4.9], [pixel, -30, 5.1], [caramel, -90, 1.7], [caramel, -20, 1.9]]
    .map(([id, n, kg]) => ({ id: uid(), animal: id, date: j(n), kg }));
  s.repas = [
    { id: uid(), animal: moka, heure: '07:30', aliment: 'Croquettes saumon', quantite: '130 g', notes: 'Avec un peu d’eau tiède' },
    { id: uid(), animal: moka, heure: '18:30', aliment: 'Croquettes saumon', quantite: '130 g', notes: '' },
    { id: uid(), animal: pixel, heure: '08:00', aliment: 'Pâtée', quantite: '½ sachet', notes: '' },
    { id: uid(), animal: pixel, heure: '19:00', aliment: 'Croquettes', quantite: '30 g', notes: 'Dans la balle distributrice' },
    { id: uid(), animal: caramel, heure: '08:30', aliment: 'Foin à volonté + granulés', quantite: '1 cuillère de granulés', notes: 'Légumes verts le soir' },
  ].map(r => ({ ...r, debut: j(-30) }));
  s.rappels = [
    { animal: moka, type: 'promenade', titre: 'Balade', freq: 'jour', heures: ['08:00', '12:30', '19:00'] },
    { animal: '', type: 'eau', titre: 'Changer l’eau des gamelles', freq: 'jour', heures: ['09:00'] },
    { animal: moka, type: 'toilettage', titre: 'Brossage', freq: 'semaine', jours: [3, 6], heures: ['20:00'] },
    { animal: pixel, type: 'litiere', titre: 'Changer la litière', freq: 'semaine', jours: [0], heures: ['10:00'] },
    { animal: moka, type: 'antiparasitaire', titre: 'Pipette antiparasitaire', freq: 'mois', debut: j(-26), heures: ['09:00'] },
    { animal: pixel, type: 'vermifuge', titre: 'Vermifuge', freq: 'mois', intervalle: 3, debut: j(-85), heures: [] },
  ].map(r => ({ id: uid(), intervalle: 1, debut: j(-40), notes: '', jours: [], posologie: '', ...r }));
  s.rdv = [
    { animal: pixel, type: 'vaccin', titre: 'Rappel de vaccin annuel', date: j(12), heure: '17:30', lieu: 'Clinique des Tilleuls', motif: 'Demander pour ses griffures d’oreille' },
    { animal: moka, type: 'toilettage', titre: 'Toilettage complet', date: j(5), heure: '10:00', lieu: 'Salon Patte de Velours' },
    { animal: caramel, type: 'controle', titre: 'Contrôle des dents', date: j(26), heure: '14:15', lieu: 'Clinique des Tilleuls' },
    { animal: moka, type: 'consultation', titre: 'Consultation', date: j(-48), heure: '18:00', lieu: 'Clinique des Tilleuls', notes: 'Tout va bien, revoir dans un an.', fait: true },
  ].map(r => ({ id: uid(), notes: '', motif: '', fait: false, ...r }));
  s.sante = [
    { animal: moka, type: 'vaccin', nom: 'Vaccin annuel (voir carnet)', date: j(-340), prochain: j(25), veto: 'Clinique des Tilleuls' },
    { animal: pixel, type: 'vaccin', nom: 'Vaccin annuel (voir carnet)', date: j(-353), prochain: j(12), veto: 'Clinique des Tilleuls' },
    { animal: pixel, type: 'vermifuge', nom: 'Vermifuge', date: j(-85), prochain: j(5) },
    { animal: moka, type: 'antiparasitaire', nom: 'Pipette antiparasitaire', date: j(-26), prochain: j(4) },
    { animal: caramel, type: 'vaccin', nom: 'Vaccin (voir carnet)', date: j(-200), prochain: j(165), veto: 'Clinique des Tilleuls' },
  ].map(x => ({ id: uid(), notes: '', ...x }));
  s.journal = [[moka, 'promenade', -1, 45], [moka, 'jeu', -1, 20], [moka, 'promenade', -2, 60], [pixel, 'jeu', -2, 15], [caramel, 'autre', -3, 30], [moka, 'bain', -6, 0], [pixel, 'griffes', -9, 0], [moka, 'apprentissage', -4, 15]]
    .map(([id, t, n, d]) => ({ id: uid(), animal: id, type: t, date: j(n), heure: '17:00', duree: d ? String(d) : '', titre: '', notes: t === 'apprentissage' ? 'Le « reste » tient 20 secondes !' : '' }));
  s.stock = [
    { nom: 'Croquettes saumon', categorie: 'nourriture', animal: moka, quantite: 2.6, unite: 'kg', capacite: 12, seuil: 3, conso: .26 },
    { nom: 'Pâtée en sachets', categorie: 'nourriture', animal: pixel, quantite: 18, unite: 'sachets', capacite: 48, seuil: 8, conso: 1 },
    { nom: 'Litière végétale', categorie: 'litiere', animal: pixel, quantite: 7, unite: 'L', capacite: 30, seuil: 8, conso: '' },
    { nom: 'Foin de Crau', categorie: 'nourriture', animal: caramel, quantite: 1.8, unite: 'kg', capacite: 2.5, seuil: .5, conso: .06 },
    { nom: 'Friandises à mâcher', categorie: 'friandises', animal: moka, quantite: 9, unite: 'pièces', capacite: 20, seuil: 3, conso: '' },
  ].map(x => ({ id: uid(), notes: '', ...x }));
  const dep = [];
  for (let m = 0; m < 9; m++) {
    const d = n => cle(new Date(a.getFullYear(), a.getMonth() - m, Math.min(n, 28)));
    if (m % 2 === 0) dep.push({ libelle: 'Croquettes 12 kg', montant: 64.9, categorie: 'alimentation', animal: moka, date: d(4) });
    dep.push({ libelle: 'Pâtée & croquettes', montant: 32.5, categorie: 'alimentation', animal: pixel, date: d(8) });
    dep.push({ libelle: 'Foin et granulés', montant: 14.9, categorie: 'alimentation', animal: caramel, date: d(11) });
    dep.push({ libelle: 'Assurance', montant: 21.4, categorie: 'assurance', animal: moka, date: d(2) });
    if (m % 3 === 1) dep.push({ libelle: 'Litière', montant: 18, categorie: 'accessoires', animal: '', date: d(15) });
  }
  dep.push({ libelle: 'Consultation', montant: 55, categorie: 'veterinaire', animal: moka, date: j(-48) });
  dep.push({ libelle: 'Toilettage', montant: 48, categorie: 'toilettage', animal: moka, date: j(-70) });
  dep.push({ libelle: 'Arbre à chat', montant: 79, categorie: 'accessoires', animal: pixel, date: j(-100) });
  dep.push({ libelle: 'Pension (week-end)', montant: 60, categorie: 'pension', animal: moka, date: j(-130) });
  s.depenses = dep.filter(x => x.date <= cle(a)).map(x => ({ id: uid(), notes: '', ...x }));
  s.souvenirs = [
    { animal: moka, date: j(-400), titre: 'Sa première neige', texte: 'Elle a couru partout en essayant d’attraper les flocons.' },
    { animal: pixel, date: j(-60), titre: 'La sieste au soleil', texte: 'Toute l’après-midi sur le rebord de la fenêtre.' },
    { animal: caramel, date: j(-30), titre: 'Premier « binky »', texte: 'Un grand saut de joie dans le salon !' },
  ].map(x => ({ id: uid(), photo: '', ...x }));
  s.contacts = [
    { id: veto, type: 'veterinaire', nom: 'Dr Martin — Clinique des Tilleuls', tel: '01 11 22 33 44', email: '', adresse: '12 rue des Tilleuls', horaires: 'Lun–sam 9 h–19 h', animaux: [], notes: '' },
    { id: uid(), type: 'clinique', nom: 'Urgences vétérinaires de garde', tel: '01 99 88 77 66', adresse: '', horaires: '24 h / 24', animaux: [], notes: 'À appeler la nuit et le week-end' },
    { id: uid(), type: 'toiletteur', nom: 'Salon Patte de Velours', tel: '01 55 44 33 22', animaux: [moka], notes: '' },
    { id: uid(), type: 'petsitter', nom: 'Camille (voisine)', tel: '06 12 34 56 78', animaux: [], notes: 'A les clés' },
  ];
  s.vacances = Object.assign(s.vacances, { destination: 'Bretagne', depart: j(34), retour: j(44), garde: 'emmene', consignes: 'Pixel et Caramel restent : Camille passe matin et soir.' });
  s.vacances.items.slice(0, 3).forEach(i => { i.fait = true; });
  S = s; V.animal = ''; V.page = 'accueil'; sauver();
  toast('✨', 'Voici Moka, Pixel et Caramel', 'Explorez librement : tout se modifie, et vous pourrez effacer l’exemple d’un clic.');
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
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); sauvegarderFichier(); }
});
charger();
/* NaoAgenda peut modifier un rendez-vous dans une autre fenêtre : on relit alors le carnet
   (dès qu'aucune fenêtre de saisie n'est ouverte, pour ne rien perdre de ce qu'on tape). */
let relireAttendu = false;
function relireCarnet() {
  if (document.querySelector('.voile')) { relireAttendu = true; return; }
  relireAttendu = false;
  charger(); rendre();
}
window.addEventListener('storage', e => { if (e.key && e.key.endsWith(CLE_STOCK)) relireCarnet(); });
setInterval(() => { if (relireAttendu) relireCarnet(); }, 1000);
try {
  const t = JSON.parse(localStorage.getItem('naopet.vue') || 'null');
  if (t && PAGES[t.page]) { V.page = t.page; V.animal = t.animal || ''; Object.assign(V.sous, t.sous || {}); }
} catch (e) {}
appliquerTheme(document.documentElement.dataset.theme || 'dark');
dessinerFond();
rendre();
entree();

/* l'entrée : une piste de pattes jusqu'au jeton, puis les six compagnons en cercle */
function entree() {
  const intro = $('#intro');
  if (!intro) return;
  const corps = document.body;
  const finir = () => { if (intro.isConnected) intro.remove(); corps.classList.remove('entree', 'revele'); };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
  corps.classList.add('entree');
  const petit = innerWidth < 560;
  const plein = k => DESSINS[k].replace(/ fill="currentColor" stroke="none"/g, '');
  const patte = `<svg viewBox="0 0 24 24" fill="currentColor">${plein('patte')}</svg>`;

  /* la promenade : une courbe douce qui part d'en bas à gauche et monte jusqu'au jeton */
  const n = 11, R = Math.min(innerWidth * (petit ? .46 : .4), 560);
  let p = '', prec = null;
  const points = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), ang = Math.PI * (1.08 - .6 * t), r = R * (1 - .7 * t);
    return [Math.cos(ang) * r, Math.sin(ang) * r * .5 + 40 * (1 - t)];
  });
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[Math.min(i + 1, n - 1)], [px, py] = points[Math.max(i - 1, 0)];
    const dx = nx - px, dy = ny - py, l = Math.hypot(dx, dy) || 1;
    const cote = i % 2 ? 12 : -12, ox = -dy / l * cote, oy = dx / l * cote;
    const dir = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    p += `<span style="transform:translate(${(x + ox).toFixed(0)}px,${(y + oy).toFixed(0)}px) rotate(${dir.toFixed(0)}deg);animation-delay:${(i * .1).toFixed(2)}s">${patte}</span>`;
  });
  $('#introPas').innerHTML = p;

  /* la gerbe de cœurs, de pattes et d'éclats, au moment où la patte se pose */
  const formes = [`<svg viewBox="0 0 24 24" fill="currentColor">${DESSINS.coeur}</svg>`, patte,
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2Q13 10 22 12Q13 14 12 22Q11 14 2 12Q11 10 12 2Z"/></svg>'];
  const couleurs = ['var(--acc)', '#F3AEC0', '#FFFFFF', 'var(--bleu)', '#F3C969'];
  let e = '';
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2 + Math.random() * .3, d = (petit ? 110 : 165) + Math.random() * 90;
    e += `<i style="--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d).toFixed(0)}px;--r:${(-60 + Math.random() * 120).toFixed(0)}deg;--t:${(13 + Math.random() * 13).toFixed(0)}px;--c:${couleurs[i % couleurs.length]};--d:${(1.62 + Math.random() * .15).toFixed(2)}s">${formes[i % 3]}</i>`;
  }
  $('#introEclats').innerHTML = e;

  $('#introAmis').innerHTML = ['chien', 'chat', 'cheval', 'hamster', 'cochon', 'lapin']
    .map((k, i) => `<div class="ami" style="--a:${i * 60 - 30}deg;--i:${i}"><span class="av">${svgDessin(k)}</span></div>`).join('');
  $('#introNom').innerHTML = [...'NaoPets'].map((c, i) => `<b class="${i > 2 ? 'acc' : ''}" style="--i:${i}">${c}</b>`).join('');

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
/* à minuit, la journée change : on redessine */
let jourAffiche = cle(auj());
setInterval(() => { if (cle(auj()) !== jourAffiche) { jourAffiche = cle(auj()); V.calJour = jourAffiche; rendre(); } }, 60 * 1000);
