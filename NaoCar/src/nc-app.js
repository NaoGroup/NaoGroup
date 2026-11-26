'use strict';
/* ============================================================
   NaoCar — navigation, saisies, sauvegarde & démarrage
   ============================================================ */
const onglets = () => [['accueil', '🏠 Accueil'], ['voitures', '🚗 Mes voitures'], ['entretien', '🔧 Entretien'], ['reparations', '🧾 Réparations'], ['papiers', '📋 Administratif']];
let pageAffichee = '';
function rendre() {
  const vide = !S.voitures.length;
  if (vide) V.page = 'accueil';
  if (V.voiture && !voiture(V.voiture)) V.voiture = '';
  $('#pages').hidden = vide;
  $('#pages').innerHTML = onglets().map(([p, l]) => `<button class="${V.page === p ? 'on' : ''}" data-act="go" data-p="${p}">${l}</button>`).join('');
  rendreChoixVoiture();
  rendreRappels();
  const vue = $('#vue'), y = scrollY;
  vue.innerHTML = (S.exemple && !vide ? `<div class="note-douce" style="margin-top:0"><span class="em">✨</span><div>Vous découvrez NaoCar avec <b>deux voitures d’exemple</b> (plaques et garages inventés). Quand vous êtes prêt·e, repartez d’une page blanche pour votre propre voiture.</div>
      <button class="btn petit" style="margin-left:auto;flex:none" data-act="effacer-exemple">🌱 Commencer avec ma voiture</button></div>` : '') + (PAGES[V.page] || PAGES.accueil)();
  /* un changement de page glisse en place ; une simple mise à jour ne fait rien bouger */
  const ici = V.page + (V.sous[V.page] || '') + V.voiture;
  if (pageAffichee !== ici) { vue.classList.remove('glisse'); void vue.offsetWidth; vue.classList.add('glisse'); }
  else scrollTo({ top: y });
  pageAffichee = ici;
  try { localStorage.setItem('naocar.vue', JSON.stringify({ page: V.page, sous: V.sous, voiture: V.voiture })); } catch (e) {}
}
ACTIONS.go = el => { V.page = el.dataset.p; if (el.dataset.s) V.sous[V.page] = el.dataset.s; fermer(null, true); rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACTIONS.sous = el => { V.sous[el.dataset.p] = el.dataset.s; rendre(); };
ACTIONS.pour = el => { V.voiture = el.dataset.id || ''; rendre(); };
ACTIONS.voir = el => { V.voiture = el.dataset.v || ''; V.page = 'voitures'; rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACTIONS.theme = () => appliquerTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
ACTIONS.fermer = () => fermer();
ACTIONS.trier = el => { const k = el.dataset.k; V.tri = { k, asc: V.tri.k === k ? !V.tri.asc : k !== 'date' && k !== 'montant' && k !== 'km' }; rendre(); };
ACTIONS.masquer = el => {
  let m = [];
  try { m = JSON.parse(sessionStorage.getItem('naocar.masques') || '[]'); } catch (e) {}
  m.push(el.dataset.id);
  try { sessionStorage.setItem('naocar.masques', JSON.stringify(m)); } catch (e) {}
  rendreRappels();
};
ACTIONS['ouvrir-doc'] = el => ouvrirDocument(el.dataset.id);
const optsVoitures = () => S.voitures.map(v => [v.id, `${nomVoiture(v)}${v.plaque ? ' · ' + v.plaque.toUpperCase() : ''}${v.vendue ? ' (vendue)' : ''}`]);
/* la voiture proposée d'office : celle qu'on regarde, sinon la seule, sinon la première */
const voitureParDefaut = el => (el && el.dataset.v) || V.voiture || (S.voitures.find(v => !v.vendue) || S.voitures[0] || {}).id || '';
function exigerVoiture() {
  if (S.voitures.length) return true;
  toast('🚗', 'Ajoutez d’abord une voiture', 'Sa fiche sert ensuite partout dans NaoCar.');
  ACTIONS.voiture();
  return false;
}
const champVoiture = () => S.voitures.length > 1 ? [{ k: 'voiture', lab: 'Voiture', type: 'select', options: optsVoitures(), large: true }] : [];

/* ============================================================
   La fiche d'une voiture
   ============================================================ */
ACTIONS.voiture = el => {
  const id = el && el.dataset.id, v = id ? voiture(id) : null, neuf = !v;
  fermer(null, true);
  const p = (v && v.pneus) || {}, b = (v && v.batterie) || {};
  const val = v ? { ...v, ...Object.fromEntries(Object.entries(p).map(([k, x]) => ['p_' + k, x])), ...Object.fromEntries(Object.entries(b).map(([k, x]) => ['b_' + k, x])) } : { p_saison: 'ete', b_tension: '12' };
  formulaire({
    titre: neuf ? '🚗 Une nouvelle voiture' : `✏️ La fiche de ${esc(nomVoiture(v))}`, large: true,
    chapo: neuf ? 'Une fiche par voiture, comme un profil. Seule la marque est obligatoire : le reste se complète quand vous voulez, la carte grise sous les yeux.' : '',
    valeurs: val,
    champs: [
      { k: 'photo', lab: 'Photo de la voiture', type: 'photo', large: true },
      { k: 'surnom', lab: 'Son petit nom (facultatif)', place: 'Ex. : La Clio de Léa' },
      { k: 'plaque', lab: 'Plaque d’immatriculation', place: 'AB-123-CD', aide: 'Case A de la carte grise.' },
      { k: 'marque', lab: 'Marque', req: true, place: 'Ex. : Renault' }, { k: 'modele', lab: 'Modèle', place: 'Ex. : Clio V' },
      { k: 'finition', lab: 'Finition', place: 'Ex. : Intens, GT Line, Allure' }, { k: 'couleur', lab: 'Couleur', place: 'Ex. : gris titane' },
      { k: 'dateMEC', lab: 'Date de 1re mise en circulation', type: 'date', aide: 'Case B de la carte grise : sert à calculer le premier contrôle technique.' },
      { k: 'carburant', lab: 'Énergie', type: 'select', options: CARBURANTS },
      { k: 'boite', lab: 'Boîte de vitesses', type: 'select', options: BOITES }, { k: 'cv', lab: 'Puissance fiscale (CV)', type: 'number', min: 1, step: '1', aide: 'Case P.6.' },
      { k: 'vin', lab: 'N° d’identification (VIN)', aide: 'Case E, 17 caractères. Utile pour commander une pièce.' },
      { k: 'km', lab: 'Kilométrage aujourd’hui', type: 'number', min: 0, step: '1' },
      { k: 'dateAchat', lab: 'Date d’achat', type: 'date' }, { k: 'kmAchat', lab: 'Kilométrage à l’achat', type: 'number', min: 0, step: '1' },
      { k: 's1', type: 'sep', lab: '🛞 Les pneus' },
      { k: 'p_av', lab: 'Taille des pneus avant', place: '205/55 R16 91V', aide: 'Sur le flanc du pneu, ou sur l’étiquette de la portière conducteur.' },
      { k: 'p_ar', lab: 'Taille des pneus arrière (si différente)', place: 'Vide = comme à l’avant' },
      { k: 'p_pressionAv', lab: 'Pression avant (bar)', type: 'number', min: 0, step: '0.1', place: '2,3' }, { k: 'p_pressionAr', lab: 'Pression arrière (bar)', type: 'number', min: 0, step: '0.1', place: '2,1' },
      { k: 'p_saison', lab: 'Pneus montés', type: 'choix', large: true, options: [['ete', '☀️ Été'], ['hiver', '❄️ Hiver'], ['4s', '🌦️ 4 saisons']] },
      { k: 'p_marque', lab: 'Marque des pneus', place: 'Ex. : Michelin Primacy 4' }, { k: 'p_dot', lab: 'Date DOT (4 chiffres)', place: '2321', aide: 'Semaine puis année de fabrication, sur le flanc : 2321 = semaine 23 de 2021.' },
      { k: 'p_dateMontage', lab: 'Montés le', type: 'date' }, { k: 'p_kmMontage', lab: 'Montés à (km)', type: 'number', min: 0, step: '1' },
      { k: 's2', type: 'sep', lab: '🔋 La batterie' },
      { k: 'b_marque', lab: 'Marque', place: 'Ex. : Varta' }, { k: 'b_ref', lab: 'Référence', place: 'Ex. : E11' },
      { k: 'b_tension', lab: 'Tension (V)', type: 'number', min: 0, step: '1' }, { k: 'b_capacite', lab: 'Capacité (Ah)', type: 'number', min: 0, step: '1', place: '70' },
      { k: 'b_cca', lab: 'Courant de démarrage (A, « CCA » ou « EN »)', type: 'number', min: 0, step: '10', place: '640' },
      { k: 'b_techno', lab: 'Technologie', type: 'select', options: [['', '—'], ['Classique', 'Classique (plomb-acide)'], ['EFB', 'EFB (Start & Stop)'], ['AGM', 'AGM (Start & Stop)'], ['Lithium', 'Lithium (12 V d’un véhicule électrique)']] },
      { k: 'b_date', lab: 'Posée le', type: 'date' }, { k: 'b_garantie', lab: 'Garantie jusqu’au', type: 'date' },
      { k: 's3', type: 'sep', lab: 'Et aussi' },
      { k: 'vendue', type: 'case', large: true, texte: '🤝 Cette voiture a été vendue (on garde sa fiche et son historique, sans rappels)' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : code de l’autoradio, emplacement de la roue de secours, clé de jante antivol dans la boîte à gants' },
    ],
    texteOk: neuf ? '➕ Ajouter au garage' : 'Enregistrer',
    supprimer: neuf ? null : async () => {
      const liees = [...S.ct, ...S.reparations, ...S.papiers].filter(x => x.voiture === id && x.doc);
      for (const x of liees) { try { await Fichiers.oter(x.id); } catch (e) {} }
      for (const k of ['ct', 'taches', 'reparations', 'papiers', 'releves']) S[k] = S[k].filter(x => x.voiture !== id);
      S.voitures = S.voitures.filter(x => x.id !== id);
      if (V.voiture === id) V.voiture = '';
      toast('🗑️', 'Voiture supprimée', 'Les copies de ses documents restent dans NaoDoc.');
    },
    texteSup: '🗑️ Supprimer la voiture',
    enregistrer: x => {
      const pneus = {}, bat = {}, base = {};
      for (const [k, y] of Object.entries(x)) { if (k.startsWith('p_')) pneus[k.slice(2)] = y; else if (k.startsWith('b_')) bat[k.slice(2)] = y; else base[k] = y; }
      base.plaque = (base.plaque || '').toUpperCase();
      const cible = v || { id: uid(), cree: cle(auj()) };
      const kmAvant = v ? v.km : '';
      Object.assign(cible, base, { pneus, batterie: bat });
      if (base.km && String(base.km) !== String(kmAvant)) cible.kmDate = cle(auj());
      if (neuf) { S.voitures.push(cible); V.voiture = S.voitures.length > 1 ? cible.id : ''; V.page = 'voitures'; toast('🚗', `${nomVoiture(cible)} entre au garage`, 'Prochaine étape : son contrôle technique et ses papiers.'); }
    },
  });
};

/* ============================================================
   Le kilométrage
   ============================================================ */
ACTIONS.km = el => {
  if (!exigerVoiture()) return;
  fermer(null, true);
  const vid = voitureParDefaut(el), k = kmActuel(voiture(vid));
  formulaire({
    titre: '📍 Le compteur aujourd’hui', chapo: `Un relevé de temps en temps suffit : NaoCar en déduit les kilomètres par an.${k ? ` Dernier connu : <b>${kmTxt(k.km)}</b>.` : ''}`,
    valeurs: { voiture: vid, date: cle(auj()) },
    champs: [...champVoiture(), { k: 'km', lab: 'Kilométrage', type: 'number', min: 0, step: '1', req: true }, { k: 'date', lab: 'Date', type: 'date' }],
    enregistrer: x => {
      x.voiture = x.voiture || vid;
      const der = kmActuel(voiture(x.voiture));
      if (der && nombre(x.km) < nombre(der.km)) toast('📍', 'Moins que le dernier relevé', `${kmTxt(der.km)} était noté : vérifiez le chiffre si besoin.`);
      S.releves.push({ id: uid(), voiture: x.voiture, km: x.km, date: x.date || cle(auj()) });
      toast('📍', `${kmTxt(x.km)} noté`, nomDe(x.voiture));
    },
  });
};
ACTIONS['km-sup'] = el => { S.releves = S.releves.filter(r => r.id !== el.dataset.id); sauver(); };

/* ============================================================
   Ce qu'il y a à faire
   ============================================================ */
ACTIONS.tache = el => {
  if (!exigerVoiture()) return;
  const id = el && el.dataset.id, t = id ? S.taches.find(x => x.id === id) : null;
  fermer(null, true);
  formulaire({
    titre: t ? '🔧 À faire' : '🔧 Quelque chose à faire',
    chapo: 'Ce que le garagiste a signalé, un voyant allumé, une usure remarquée : notez-le avec son niveau d’urgence.',
    valeurs: t ? { ...t, urgence: String(t.urgence) } : { voiture: voitureParDefaut(el), urgence: (el && el.dataset.u) || '2' },
    champs: [...champVoiture(),
      { k: 'texte', lab: 'Qu’y a-t-il à faire ?', req: true, large: true, place: 'Ex. : changer les plaquettes de frein avant' },
      { k: 'urgence', lab: 'Niveau d’urgence', type: 'choix', large: true, options: Object.entries(URGENCES).map(([k, u]) => [k, `${u[0]} ${u[1]}`]), aide: '🔴 avant de reprendre la route · 🟠 dans les semaines qui viennent · 🟢 à la prochaine occasion' },
      { k: 'echeance', lab: 'À faire avant le', type: 'date' }, { k: 'kmEcheance', lab: 'Ou avant (km)', type: 'number', min: 0, step: '100' },
      { k: 'garage', lab: 'Garage prévu', place: 'Ex. : Garage du Centre' }, { k: 'devis', lab: 'Devis (€)', type: 'number', min: 0, step: '0.01' },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 }],
    supprimer: t ? () => { S.taches = S.taches.filter(x => x.id !== id); } : null,
    enregistrer: x => {
      x.voiture = x.voiture || voitureParDefaut(el); x.urgence = Number(x.urgence) || 2;
      if (t) Object.assign(t, x); else { S.taches.push({ id: uid(), cree: cle(auj()), fait: '', ...x }); toast(URGENCES[x.urgence][0], 'C’est noté', `${URGENCES[x.urgence][1]} · ${nomDe(x.voiture)}`); }
    },
  });
};
ACTIONS['tache-faite'] = async el => {
  const t = S.taches.find(x => x.id === el.dataset.id); if (!t) return;
  if (t.fait) { t.fait = ''; sauver(); return; }
  t.fait = cle(auj()); sauver();
  if (await confirmer('C’est fait 👏', `« ${esc(t.texte)} » est coché. Voulez-vous l’ajouter au <b>tableau des réparations</b>, avec la date, le kilométrage et la facture ?`, '🧾 Noter la réparation', false))
    ACTIONS.reparation(null, { voiture: t.voiture, description: t.texte, garage: t.garage, montant: t.devis, date: cle(auj()) });
};

/* ============================================================
   Les réparations
   ============================================================ */
ACTIONS.reparation = (el, depart) => {
  if (!exigerVoiture()) return;
  const id = el && el.dataset.id, r = id ? S.reparations.find(x => x.id === id) : null;
  fermer(null, true);
  const vid = voitureParDefaut(el);
  formulaire({
    titre: r ? `${(T_REPA[r.nature] || T_REPA.autre)[0]} Une réparation` : '🧾 Une réparation', large: true,
    chapo: r ? '' : 'La date, le kilométrage au compteur ce jour-là, ce qui a été fait et le prix. La facture en PDF part aussi, en copie, dans NaoDoc.',
    valeurs: r || { voiture: vid, date: cle(auj()), nature: 'revision', km: (kmActuel(voiture(vid)) || {}).km || '', ...(depart || {}) },
    champs: [...champVoiture(),
      { k: 'date', lab: 'Date de la réparation', type: 'date', req: true }, { k: 'km', lab: 'Kilométrage à ce moment-là', type: 'number', min: 0, step: '1' },
      { k: 'nature', lab: 'Nature', type: 'select', options: opts(T_REPA) }, { k: 'garage', lab: 'Garage', place: 'Ex. : Garage du Centre' },
      { k: 'description', lab: 'Ce qui a été fait', large: true, place: 'Ex. : vidange + filtre à huile + filtre à air' },
      { k: 'montant', lab: 'Montant (€ TTC)', type: 'number', min: 0, step: '0.01' }, { k: 'garantie', lab: 'Pièces garanties jusqu’au', type: 'date' },
      { k: 'doc', lab: 'La facture', type: 'doc', large: true },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2, place: 'Ex. : prochaine vidange à 105 000 km' }],
    supprimer: r ? async () => { if (r.doc) { try { await Fichiers.oter(r.id); } catch (e) {} } S.reparations = S.reparations.filter(x => x.id !== id); } : null,
    enregistrer: async x => {
      x.voiture = x.voiture || vid;
      const doc = x.doc; delete x.doc;
      const cible = r || { id: uid() };
      Object.assign(cible, x);
      const T = T_REPA[x.nature] || T_REPA.autre, v = voiture(x.voiture);
      await rangerDocument(cible, doc, { titre: `Facture — ${x.description || T[1]} (${nomVoiture(v)}, ${dateNum(lire(x.date))})`, sous: SOUS_NAODOC.repa, organisme: x.garage, reference: v && v.plaque, notes: x.km ? `Kilométrage : ${kmTxt(x.km)}` : '' });
      if (!r) { S.reparations.push(cible); toast(T[0], 'Réparation notée', `${nomVoiture(v)}${x.montant ? ' · ' + euros(nombre(x.montant)) : ''}`); }
    },
  });
};

/* ============================================================
   Le contrôle technique
   ============================================================ */
ACTIONS.ct = el => {
  if (!exigerVoiture()) return;
  const id = el && el.dataset.id, c = id ? S.ct.find(x => x.id === id) : null;
  fermer(null, true);
  const vid = voitureParDefaut(el);
  formulaire({
    titre: '✅ Un contrôle technique', large: true,
    chapo: c ? '' : 'Le dernier passage : NaoCar calcule le suivant (2 ans plus tard, ou 2 mois pour une contre-visite). Le procès-verbal en PDF est rangé, en copie, dans NaoDoc.',
    valeurs: c || { voiture: vid, date: cle(auj()), resultat: 'favorable', km: (kmActuel(voiture(vid)) || {}).km || '' },
    champs: [...champVoiture(),
      { k: 'date', lab: 'Date du contrôle', type: 'date', req: true }, { k: 'km', lab: 'Kilométrage', type: 'number', min: 0, step: '1', aide: 'Il est écrit sur le procès-verbal.' },
      { k: 'centre', lab: 'Centre / garage', large: true, place: 'Ex. : Autosur, Dekra, Sécuritest… et la ville' },
      { k: 'resultat', lab: 'Résultat', type: 'choix', large: true, options: Object.entries(RESULTATS_CT).map(([k, r]) => [k, `${r[0]} ${r[1]}`]) },
      { k: 'defauts', lab: 'Défaillances relevées', type: 'textarea', large: true, rows: 3, place: 'Une par ligne. Ex. : usure des plaquettes avant (mineure)' },
      { k: 'prochaine', lab: 'Prochain contrôle (si écrit sur le PV)', type: 'date', aide: 'Vide : NaoCar compte 2 ans (ou 2 mois pour une contre-visite).' },
      { k: 'prix', lab: 'Prix (€)', type: 'number', min: 0, step: '0.01' },
      { k: 'doc', lab: 'Le procès-verbal', type: 'doc', large: true },
      { k: 'afaire', type: 'case', large: true, texte: '🔧 Ajouter chaque défaillance à « Ce qu’il y a à faire »', aide: 'Une ligne de défaillance = une chose à faire. Majeure ou critique : 🔴 urgent ; sinon 🟠 bientôt.' }],
    supprimer: c ? async () => { if (c.doc) { try { await Fichiers.oter(c.id); } catch (e) {} } S.ct = S.ct.filter(x => x.id !== id); } : null,
    apres: f => { if (c) { const b = f.querySelector('[data-bloc="afaire"]'); if (b) b.style.display = 'none'; } },
    enregistrer: async x => {
      x.voiture = x.voiture || vid;
      const doc = x.doc, ajouter = x.afaire; delete x.doc; delete x.afaire;
      const cible = c || { id: uid() };
      Object.assign(cible, x);
      const v = voiture(x.voiture);
      await rangerDocument(cible, doc, { titre: `Contrôle technique — ${nomVoiture(v)} (${dateNum(lire(x.date))})`, sous: SOUS_NAODOC.ct, organisme: x.centre, reference: v && v.plaque, notes: [x.km && `Kilométrage : ${kmTxt(x.km)}`, (RESULTATS_CT[x.resultat] || [])[1]].filter(Boolean).join(' · ') });
      if (c) return;
      S.ct.push(cible);
      const contre = x.resultat !== 'favorable';
      if (contre) S.taches.push({ id: uid(), cree: cle(auj()), fait: '', voiture: x.voiture, texte: 'Passer la contre-visite du contrôle technique', urgence: 1, echeance: cle(plusMois(lire(x.date), 2)), garage: x.centre || '', devis: '', notes: '' });
      if (ajouter && x.defauts) x.defauts.split('\n').map(s => s.trim()).filter(Boolean).forEach(d =>
        S.taches.push({ id: uid(), cree: cle(auj()), fait: '', voiture: x.voiture, texte: d, urgence: /critique|majeur/i.test(d) || contre ? 1 : 2, echeance: contre ? cle(plusMois(lire(x.date), 2)) : '', garage: '', devis: '', notes: 'Relevé au contrôle technique du ' + dateNum(lire(x.date)) }));
      const p = prochainCT(v);
      toast('✅', 'Contrôle technique noté', p ? `${p.type === 'contre' ? 'Contre-visite avant le' : 'Prochain le'} ${dateMoy(p.date)}` : '');
    },
  });
};

/* ============================================================
   Les papiers
   ============================================================ */
const LIBELLES_PAPIER = {
  assurance: { organisme: 'Assureur', numero: 'N° de contrat', debut: 'Assurée depuis le', fin: 'Date d’échéance', montant: 'Prix par an (€)', tel: 'N° d’assistance' },
  'cg-prov': { organisme: 'Titulaire', numero: 'N° du certificat provisoire', debut: 'Délivré le', fin: 'Valable jusqu’au', montant: 'Prix payé (€)', tel: '' },
  'cg-def': { organisme: 'Titulaire', numero: 'Immatriculation', debut: 'Reçue le', fin: '', montant: 'Prix payé (€)', tel: '' },
  critair: { organisme: '', numero: 'N° de la vignette', debut: 'Obtenue le', fin: '', montant: '', tel: '' },
  financement: { organisme: 'Organisme', numero: 'N° de contrat', debut: 'Début', fin: 'Fin du contrat', montant: 'Mensualité (€)', tel: 'Téléphone' },
  garantie: { organisme: 'Garant (constructeur, vendeur…)', numero: 'N° de contrat', debut: 'Début', fin: 'Fin de garantie', montant: 'Prix (€)', tel: 'Téléphone' },
  cession: { organisme: 'Vendeur / acheteur', numero: 'Référence', debut: 'Date', fin: '', montant: 'Prix (€)', tel: '' },
  autre: { organisme: 'Organisme', numero: 'Numéro', debut: 'Date', fin: 'Fin de validité', montant: 'Montant (€)', tel: 'Téléphone' },
};
ACTIONS.papier = el => {
  if (!exigerVoiture()) return;
  const id = el && el.dataset.id, p = id ? S.papiers.find(x => x.id === id) : null;
  fermer(null, true);
  const vid = voitureParDefaut(el), type0 = p ? p.type : (el && el.dataset.type) || 'assurance';
  const ancien = !p && type0 === 'assurance' ? dernierPapier(vid, 'assurance') : null;   /* nouvelle période : on reprend l'assureur */
  const T = T_PAPIER[type0] || T_PAPIER.autre;
  formulaire({
    titre: p ? `${T[0]} ${T[1]}` : '📋 Un papier de la voiture', large: true,
    chapo: p ? '' : 'Choisissez le papier, puis remplissez ce que vous avez sous les yeux. Le PDF ou la photo du document est rangé, en copie, dans NaoDoc.',
    valeurs: p || { voiture: vid, type: type0, debut: cle(auj()), ...(ancien ? { organisme: ancien.organisme, numero: ancien.numero, formule: ancien.formule, tel: ancien.tel, montant: ancien.montant, debut: ancien.fin || cle(auj()), fin: ancien.fin ? cle(plusMois(lire(ancien.fin), 12)) : '' } : {}),
      ...(type0 === 'cg-def' && !p ? { numero: (voiture(vid) || {}).plaque || '' } : {}) },
    champs: [...champVoiture(),
      { k: 'type', lab: 'Quel papier ?', type: 'select', large: true, options: Object.entries(T_PAPIER).map(([k, t]) => [k, `${t[0]} ${t[1]}`]) },
      { k: 'titre', lab: 'Nom du papier', large: true, place: 'Ex. : Attestation de parking, carte carburant' },
      { k: 'organisme', lab: 'Organisme' }, { k: 'numero', lab: 'Numéro' },
      { k: 'formule', lab: 'Formule', type: 'select', options: FORMULES_ASSU }, { k: 'classe', lab: 'Classe', type: 'select', options: CRITAIR },
      { k: 'debut', lab: 'Date', type: 'date' }, { k: 'fin', lab: 'Fin', type: 'date' },
      { k: 'montant', lab: 'Montant (€)', type: 'number', min: 0, step: '0.01' }, { k: 'tel', lab: 'Téléphone', type: 'tel' },
      { k: 'nCPI', type: 'note', em: '📬', html: 'Le <b>certificat provisoire (CPI)</b> se télécharge à la fin de la démarche ANTS : il permet de rouler <b>1 mois</b> en France. Laissez « Valable jusqu’au » vide, NaoCar compte 1 mois.' },
      { k: 'nCrit', type: 'note', em: '🌿', html: 'La vignette Crit’Air se commande uniquement sur le site officiel du gouvernement, pour un peu moins de 4 €. Méfiez-vous des sites qui la vendent plus cher.' },
      { k: 'doc', lab: 'Le document', type: 'doc', large: true },
      { k: 'notes', lab: 'Notes', type: 'textarea', large: true, rows: 2 }],
    supprimer: p ? async () => { if (p.doc) { try { await Fichiers.oter(p.id); } catch (e) {} } S.papiers = S.papiers.filter(x => x.id !== id); } : null,
    apres: f => {
      const maj = () => {
        const t = f.querySelector('[name="type"]').value, L = LIBELLES_PAPIER[t] || LIBELLES_PAPIER.autre;
        for (const k of ['organisme', 'numero', 'debut', 'fin', 'montant', 'tel']) {
          const b = f.querySelector(`[data-bloc="${k}"]`); b.style.display = L[k] ? '' : 'none';
          if (L[k]) b.querySelector('label').textContent = L[k];
        }
        const vis = (k, ok) => { f.querySelector(`[data-bloc="${k}"]`).style.display = ok ? '' : 'none'; };
        vis('formule', t === 'assurance'); vis('classe', t === 'critair'); vis('titre', t === 'autre'); vis('nCPI', t === 'cg-prov'); vis('nCrit', t === 'critair');
      };
      f.addEventListener('change', e => { if (e.target.name === 'type') maj(); }); maj();
    },
    enregistrer: async x => {
      x.voiture = x.voiture || vid;
      if (x.type === 'cg-prov' && !x.fin && x.debut) x.fin = cle(plusMois(lire(x.debut), 1));
      const doc = x.doc; delete x.doc;
      const cible = p || { id: uid() };
      Object.assign(cible, x);
      const v = voiture(x.voiture), TT = T_PAPIER[x.type] || T_PAPIER.autre;
      if (x.type === 'cg-def' && v && !v.plaque && x.numero) v.plaque = x.numero.toUpperCase();
      await rangerDocument(cible, doc, { titre: `${x.type === 'autre' && x.titre ? x.titre : TT[1]} — ${nomVoiture(v)}${x.debut ? ` (${dateNum(lire(x.debut))})` : ''}`, sous: SOUS_NAODOC[x.type] || '', organisme: x.organisme, reference: x.numero || (v && v.plaque), notes: x.fin ? `Valable jusqu’au ${dateNum(lire(x.fin))}` : '' });
      if (!p) { S.papiers.push(cible); toast(TT[0], `${TT[1]} : c’est noté`, nomVoiture(v)); }
    },
  });
};

/* ============================================================
   Sauvegarde, chargement, réinitialisation, exemple
   ============================================================ */
function sauvegarderFichier() {
  telecharger(`naocar-sauvegarde-${cle(auj())}.json`, JSON.stringify({ naocar: 1, data: S }), 'application/json');
  toast('💾', 'Garage sauvegardé', 'Le fichier est dans vos téléchargements : « Ouvrir » permet de le recharger.');
}
ACTIONS.sauvegarde = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>💾 Sauvegarder & recharger</h2>
    <p class="chapo">NaoCar garde tout dans ce navigateur, sur cet ordinateur. Une sauvegarde régulière dans un fichier met vos voitures, leur entretien et leurs papiers à l’abri.</p>
    <div class="note-douce"><span class="em">📎</span><div>Le fichier garde les fiches, pas les PDF eux-mêmes : ceux-ci restent sur cet ordinateur, et leur copie est rangée dans <b>NaoDoc</b>.</div></div>
    <div class="pied" style="margin-top:6px"><button class="btn plein" data-x="sauver">💾 Sauvegarder dans un fichier</button><button class="btn" data-x="ouvrir">📂 Ouvrir une sauvegarde</button></div>
    <div class="pied"><div class="spacer"></div><button class="btn" data-act="fermer">Fermer</button></div></div>`);
  v.addEventListener('click', e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    if (x === 'sauver') sauvegarderFichier();
    if (x === 'ouvrir') { fermer(v); ACTIONS.ouvrir(); }
  });
};
/* remet l'outil à neuf, exactement comme à la toute première ouverture */
async function reinitialiser() {
  try {
    /* les clés connues (dans NaoGroup, chacune est rangée dans l'espace du profil), puis toute autre clé naocar. */
    for (const k of [CLE_STOCK, 'naocar.vue', 'naocar.theme']) localStorage.removeItem(k);
    for (const k of Object.keys(localStorage)) if (k.startsWith('naocar.')) localStorage.removeItem(k);
    sessionStorage.removeItem('naocar.masques');
  } catch (e) {}
  try { await Fichiers.fermer(); indexedDB.deleteDatabase('naocar-fichiers'); } catch (e) {}
  S = completer(vierge());
  Object.assign(V, { page: 'accueil', voiture: '', sous: { entretien: 'afaire' }, tri: { k: 'date', asc: false } });
  enregistrer();
  appliquerTheme('dark');
  $$('.voile').forEach(x => x.remove());
  rendre(); scrollTo({ top: 0 });
  toast('🌱', 'NaoCar est comme neuf', 'Premier pas : ajoutez votre voiture.');
}
ACTIONS.reinitialiser = () => {
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>↺ Réinitialiser NaoCar</h2>
    <p class="chapo">L’outil redevient <b>vierge, comme pour un nouvel utilisateur</b> : les fiches des voitures, les pneus et batteries, les contrôles techniques, ce qu’il y a à faire,
      les réparations, les papiers, les relevés de kilométrage et les documents joints seront <b>effacés de cet ordinateur</b>, ainsi que les préférences d’affichage.</p>
    <div class="note-douce"><span class="em">🗂️</span><div>Les <b>copies rangées dans NaoDoc</b> ne sont pas touchées : elles appartiennent à votre classeur.</div></div>
    <div class="note-douce"><span class="em">💾</span><div><b>Conseil :</b> gardez d’abord une sauvegarde. Vous pourrez la rouvrir plus tard avec 💾 → 📂 Ouvrir une sauvegarde.</div></div>
    <div class="pied"><button class="btn" data-act="fermer">Annuler</button><div class="spacer"></div>
      <button class="btn danger" data-r="sans">Effacer sans sauvegarder</button>
      <button class="btn plein" data-r="avec">💾 Sauvegarder, puis réinitialiser</button></div></div>`);
  v.addEventListener('click', async e => {
    const b = e.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'avec') { sauvegarderFichier(); fermer(v); setTimeout(reinitialiser, 600); return; }
    if (await confirmer('Tout effacer ?', 'Toutes les données de NaoCar seront <b>définitivement</b> effacées de cet ordinateur. Cette action ne peut pas être annulée.', 'Tout effacer')) reinitialiser();
  });
};
ACTIONS.ouvrir = () => { $('#fichier').value = ''; $('#fichier').click(); };
$('#fichier').addEventListener('change', async () => {
  const f = $('#fichier').files[0]; if (!f) return;
  let j;
  try { j = JSON.parse(await f.text()); } catch (e) { toast('📂', 'Fichier illisible', 'Ce n’est pas une sauvegarde NaoCar.'); return; }
  if (!j || !j.naocar || !j.data || !Array.isArray(j.data.voitures)) { toast('📂', 'Fichier non reconnu', 'Ce n’est pas une sauvegarde NaoCar.'); return; }
  if (S.voitures.length && !await confirmer('Remplacer le garage ?', 'Les données de cet ordinateur seront remplacées par celles du fichier. <b>Conseil :</b> sauvegardez d’abord si vous voulez les garder.', 'Remplacer')) return;
  S = completer(j.data); V.page = 'accueil'; V.voiture = ''; sauver();
  toast('📂', 'Garage chargé', pluriel(S.voitures.length, 'voiture'));
});
ACTIONS['effacer-exemple'] = async () => {
  if (!await confirmer('Commencer avec votre voiture ?', 'Les voitures d’exemple seront effacées pour laisser place à la vôtre.', 'C’est parti', false)) return;
  S = completer(vierge()); V.page = 'accueil'; V.voiture = ''; sauver();
  ACTIONS.voiture();
};
ACTIONS.exemple = () => {
  const a = auj(), j = n => cle(plus(a, n)), m = n => cle(plusMois(a, n));
  const s = completer(vierge());
  s.exemple = true;
  const c = uid() + 'a', p = uid() + 'b';
  s.voitures = [
    { id: c, surnom: 'La Clio', marque: 'Renault', modele: 'Clio V', finition: 'Intens', couleur: 'Gris titane', plaque: 'EX-001-AM', dateMEC: m(-45), carburant: 'essence', boite: 'manuelle', cv: '5', vin: '', km: '', dateAchat: m(-45), kmAchat: '12',
      pneus: { av: '205/45 R17 88V', ar: '', pressionAv: '2.3', pressionAr: '2.1', saison: '4s', marque: 'Michelin CrossClimate 2', dot: '', dateMontage: m(-14), kmMontage: '31200' },
      batterie: { marque: 'Varta', ref: 'E38', tension: '12', capacite: '74', cca: '750', techno: 'EFB', date: m(-45), garantie: '' }, notes: 'Clé de l’antivol de jante dans la boîte à gants.' },
    { id: p, surnom: '', marque: 'Peugeot', modele: '3008', finition: 'Allure', couleur: 'Bleu magnétique', plaque: 'EX-002-AM', dateMEC: m(-98), carburant: 'diesel', boite: 'auto', cv: '7', vin: '', km: '', dateAchat: m(-40), kmAchat: '61400',
      pneus: { av: '225/55 R18 98V', ar: '', pressionAv: '2.5', pressionAr: '2.4', saison: 'ete', marque: 'Continental', dot: '1919', dateMontage: '', kmMontage: '' },
      batterie: { marque: 'Bosch', ref: 'S5 A08', tension: '12', capacite: '70', cca: '760', techno: 'AGM', date: m(-68), garantie: '' }, notes: '' },
  ];
  s.releves = [[c, -40, 24800], [c, -6, 38900], [p, -30, 82100], [p, -3, 97650]].map(([v, n, km]) => ({ id: uid(), voiture: v, date: j(n), km: String(km) }));
  s.ct = [
    { voiture: p, date: m(-25), km: '78400', centre: 'Centre de contrôle des Tilleuls (inventé)', resultat: 'favorable', defauts: '', prix: '78' },
    { voiture: p, date: j(-20), km: '97200', centre: 'Centre de contrôle des Tilleuls (inventé)', resultat: 'contre', defauts: 'Disques et plaquettes de frein avant usés (majeure)\nFeu de plaque arrière défectueux (mineure)', prix: '82' },
  ].map(x => ({ id: uid(), prochaine: '', ...x }));
  s.taches = [
    { voiture: p, texte: 'Passer la contre-visite du contrôle technique', urgence: 1, echeance: cle(plusMois(plus(a, -20), 2)), garage: 'Centre des Tilleuls' },
    { voiture: p, texte: 'Changer disques et plaquettes avant', urgence: 1, echeance: j(10), garage: 'Garage du Centre (inventé)', devis: '340' },
    { voiture: p, texte: 'Remplacer l’ampoule du feu de plaque', urgence: 2, echeance: j(10) },
    { voiture: c, texte: 'Faire la révision des 4 ans', urgence: 2, kmEcheance: '45000', garage: 'Garage du Centre (inventé)' },
    { voiture: c, texte: 'Réparer l’éclat sur le pare-brise', urgence: 3 },
  ].map(x => ({ id: uid(), cree: j(-5), fait: '', echeance: '', kmEcheance: '', garage: '', devis: '', notes: '', ...x }));
  s.reparations = [
    { voiture: c, date: m(-26), km: '24800', nature: 'revision', garage: 'Garage du Centre (inventé)', description: 'Révision des 2 ans : vidange, filtres', montant: '219' },
    { voiture: c, date: m(-14), km: '31200', nature: 'pneus', garage: 'Pneus Express (inventé)', description: '4 pneus 4 saisons + parallélisme', montant: '612' },
    { voiture: p, date: m(-36), km: '64000', nature: 'distribution', garage: 'Garage du Centre (inventé)', description: 'Kit de distribution + pompe à eau', montant: '890' },
    { voiture: p, date: m(-25), km: '78300', nature: 'revision', garage: 'Garage du Centre (inventé)', description: 'Vidange + filtre à huile', montant: '165.5' },
    { voiture: p, date: m(-8), km: '92100', nature: 'clim', garage: 'Clim Auto (inventé)', description: 'Recharge de climatisation', montant: '89' },
  ].map(x => ({ id: uid(), garantie: '', notes: '', ...x }));
  s.papiers = [
    { voiture: c, type: 'assurance', organisme: 'Auto Assur (inventé)', numero: 'AA-000-111', formule: 'tous', debut: m(-9), fin: m(3), montant: '612', tel: '01 00 00 00 32' },
    { voiture: c, type: 'cg-def', organisme: 'Camille Martin', numero: 'EX-001-AM', debut: m(-44) },
    { voiture: c, type: 'critair', classe: '1', numero: '' },
    { voiture: p, type: 'assurance', organisme: 'Mutuelle Route (inventé)', numero: 'MR-22-450', formule: 'tiers+', debut: m(-11), fin: j(18), montant: '540', tel: '01 00 00 00 33' },
    { voiture: p, type: 'cg-prov', organisme: 'Julien Martin', numero: 'CPI-EX-0002', debut: j(-22), fin: j(8) },
    { voiture: p, type: 'financement', organisme: 'Crédit Auto (inventé)', numero: 'CA-778', debut: m(-40), fin: m(8), montant: '289' },
  ].map(x => ({ id: uid(), titre: '', notes: '', ...x }));
  S = s; V.page = 'accueil'; V.voiture = ''; sauver();
  toast('✨', 'Voici deux voitures d’exemple', 'Une Clio en règle, et un 3008 qui a besoin d’attention. Tout se modifie, et s’efface d’un clic.');
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
/* les cartes s'ouvrent aussi au clavier */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); sauvegarderFichier(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act][role="button"]:not(button)')) { e.preventDefault(); e.target.click(); }
});
charger();
/* une autre fenêtre a modifié le garage : on relit (dès qu'aucune saisie n'est ouverte) */
let relireAttendu = false;
function relire() {
  if (document.querySelector('.voile')) { relireAttendu = true; return; }
  relireAttendu = false; charger(); rendre();
}
window.addEventListener('storage', e => { if (e.key && e.key.endsWith(CLE_STOCK)) relire(); });
setInterval(() => { if (relireAttendu) relire(); }, 1000);
try {
  const t = JSON.parse(localStorage.getItem('naocar.vue') || 'null');
  if (t && PAGES[t.page]) { V.page = t.page; Object.assign(V.sous, t.sous || {}); V.voiture = t.voiture || ''; }
} catch (e) {}
appliquerTheme(document.documentElement.dataset.theme || 'dark');
dessinerFond();
rendre();
(window.ngApresVoile || (f => f()))(entree);   /* venu de NaoGroup : l'ouverture attend le lever du voile */

/* l'entrée : le tableau de bord s'allume — compteur, aiguille, voyant, plaque, et une voiture qui passe */
function entree() {
  const intro = $('#intro');
  if (!intro) return;
  const corps = document.body;
  const finir = () => { if (intro.isConnected) intro.remove(); corps.classList.remove('entree', 'revele'); };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
  /* (la deuxième ouverture dans la session, et Échap / Entrée / Espace : naogroup-cloud.js passe l'intro) */
  corps.classList.add('entree');
  /* les graduations du compteur : 25 traits sur 240°, un gros tous les 4, les trois derniers en zone rouge */
  let g = '';
  for (let i = 0; i <= 24; i++) {
    const a = (-120 + i * 10) * Math.PI / 180, gros = i % 4 === 0, r1 = gros ? 104 : 110, r2 = 118;
    const x1 = 150 + Math.sin(a) * r1, y1 = 150 - Math.cos(a) * r1, x2 = 150 + Math.sin(a) * r2, y2 = 150 - Math.cos(a) * r2;
    g += `<line class="${gros ? 'gros' : ''} ${i >= 21 ? 'rouge' : ''}" style="--i:${i}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  $('#introGrad').innerHTML = g;
  /* le nom sur la plaque, une lettre après l'autre : NAO-CAR */
  $('#introNom').innerHTML = [...'NAO-CAR'].map((c, i) => `<b class="${c === '-' ? 'tiret' : i > 3 ? 'acc' : ''}" style="--i:${i}">${c}</b>`).join('');

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
/* à minuit, la journée change : les échéances se recalculent */
let jourAffiche = cle(auj());
setInterval(() => { if (cle(auj()) !== jourAffiche) { jourAffiche = cle(auj()); if (!document.querySelector('.voile')) rendre(); } }, 60 * 1000);
