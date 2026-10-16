/* ============================================================
   NaoFactu — les ventes : accueil, clients, catalogue, devis,
   factures (et l'éditeur commun), paiements.
   ============================================================ */
'use strict';

/* ================= Tableau de bord ================= */
VUES.accueil = root => {
  const a = act(), auj = today(), m0 = auj.slice(0, 7) + '-01', m1 = isoDate(new Date(+auj.slice(0, 4), +auj.slice(5, 7), 0));
  const mois = agregat(m0, m1), ae = aEncaisser(), tr = tresorerie();
  const retards = mine(S.factures).filter(f => statutFacture(f) === 'retard');
  const ev = evenements(null, addDays(auj, 30)).filter(e => e.date >= auj || e.type === 'retard').slice(0, 7);
  const devis = mine(S.devis).sort((x, y) => (y.date || '').localeCompare(x.date || '')).slice(0, 5);
  const ac = aClasser();
  const d = parseISO(auj);
  const bienvenue = S.reglages.bienvenue && !a.adresse && !mine(S.factures).length;
  root.innerHTML = `
  <div class="hero glass">
    <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#nao-logo"/></svg>
    <div><h2>Nao<span>Factu</span></h2>
      <div class="slogan">Vos factures claires, votre activité maîtrisée.</div>
      <div class="date">${['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][d.getDay()]} ${fmtDateLong(auj)} · ${esc(a.nom)}</div></div>
    <button class="btn primary big cta" data-do="nouvelleFacture">🧾 Créer une facture</button>
  </div>
  ${bienvenue ? `<div class="note lav"><span class="ic">✨</span><div><b>Bienvenue dans NaoFactu.</b> Commencez par renseigner le profil de votre activité
    (nom, logo, adresse, coordonnées bancaires, conditions de paiement) : ces informations apparaîtront sur vos devis et factures.
    <div class="row-acts" style="margin-top:8px"><button class="btn sm primary" data-go="reglages">Compléter mon activité</button>
    <button class="btn sm" data-do="masquerBienvenue">Plus tard</button></div></div></div>` : ''}
  <div class="quick">
    <button class="btn lav" data-do="nouveauDevis">📝 Créer un devis</button>
    <button class="btn lav" data-do="nouvelleFacture">🧾 Créer une facture</button>
    <button class="btn lav" data-do="ajouterDepense">🛒 Ajouter une dépense</button>
    <button class="btn lav" data-do="ajouterPaiement">💳 Ajouter un paiement</button>
    <button class="btn lav" data-do="importerPaie">💼 Importer une fiche de paie</button>
  </div>
  <div class="kpis">
    <div class="kpi glass ok" data-go="paiements"><div class="lab">💶 Encaissé ce mois-ci</div><div class="val">${money(mois.encaisse)}</div>
      <div class="sub">${mois.paiements.length} paiement${mois.paiements.length > 1 ? 's' : ''} en ${MOIS[d.getMonth()]}</div></div>
    <div class="kpi glass blue" data-go="factures" data-p="${P({ f: 'ouvertes' })}"><div class="lab">⏳ Factures à encaisser</div><div class="val">${money(ae.total)}</div>
      <div class="sub">${ae.liste.length} facture${ae.liste.length > 1 ? 's' : ''} ouverte${ae.liste.length > 1 ? 's' : ''}</div></div>
    <div class="kpi glass ${retards.length ? 'bad' : 'ok'}" data-go="factures" data-p="${P({ f: 'retard' })}"><div class="lab">🚨 Factures en retard</div>
      <div class="val ${retards.length ? 'neg' : ''}">${retards.length}</div><div class="sub">${retards.length ? money(sum(retards, restantDe)) + ' à relancer' : 'Rien en retard, bravo'}</div></div>
    <div class="kpi glass warn" data-go="depenses"><div class="lab">🛒 Dépenses du mois</div><div class="val">${money(mois.depTTC)}</div>
      <div class="sub">${mois.depenses.length} dépense${mois.depenses.length > 1 ? 's' : ''} · TVA ${money(mois.tvaDeductible)}</div></div>
    <div class="kpi glass" data-go="compta" data-p="${P({ t: 'treso' })}"><div class="lab">🏦 Trésorerie estimée</div>
      <div class="val ${tr.solde < 0 ? 'neg' : ''}">${money(tr.solde)}</div><div class="sub">${money(tr.projete)} une fois tout encaissé</div></div>
  </div>
  <div class="grid3">
    <div class="card glass"><div class="hd"><h3><span class="em">📅</span>Mes prochaines échéances</h3><button class="btn sm right" data-go="calendrier">Calendrier →</button></div>
      <div class="bd flush">${ev.length ? ev.map(ligneEvenement).join('') : '<div class="empty">Aucune échéance dans les 30 prochains jours.</div>'}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">📝</span>Derniers devis</h3><button class="btn sm right" data-go="devis">Tous →</button></div>
      <div class="bd flush">${devis.length ? devis.map(x => `<div class="li click" data-do="ouvrirDevis" data-id="${x.id}">
        <div class="tx"><b>${esc(x.numero)} · ${esc(clientNom(x.clientId))}</b><small>${fmtDate(x.date)}${x.objet ? ' · ' + esc(x.objet) : ''}</small></div>
        <div style="text-align:right"><div class="am">${money(totaux(x).ttc)}</div>${pillD(x)}</div></div>`).join('')
        : '<div class="empty">Pas encore de devis.<br><button class="btn sm" style="margin-top:10px" data-do="nouveauDevis">Créer le premier</button></div>'}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🗂️</span>Documents comptables à classer</h3><button class="btn sm right" data-go="documents">Classer →</button></div>
      <div class="bd flush">${ac.length ? ac.slice(0, 6).map(x => `<div class="li click" ${x.dep ? `data-do="editerDepense" data-id="${x.dep.id}"` : `data-go="documents" data-p="${P({ c: 'aclasser' })}"`}>
        <div class="thumb-f">${x.dep ? '🧾' : '📄'}</div><div class="tx"><b>${esc(x.titre)}</b><small>${esc(x.sous)}</small></div></div>`).join('')
        + (ac.length > 6 ? `<div class="empty" style="padding:10px">… et ${ac.length - 6} autre(s)</div>` : '')
        : '<div class="empty">Tout est rangé. ✨</div>'}</div></div>
  </div>
  ${carteEquipe()}`;
};
function ligneEvenement(e) {
  const d = parseISO(e.date), late = e.date < today(), soon = !late && diffDays(today(), e.date) <= 3;
  const cible = e.cible[0] === 'facture' || e.cible[0] === 'relance' ? `data-do="${e.cible[0] === 'relance' ? 'relancer' : 'actionsFacture'}" data-id="${e.cible[1]}"`
    : e.cible[0] === 'devis' ? `data-do="ouvrirDevis" data-id="${e.cible[1]}"` : e.cible[0] === 'rappel' ? `data-do="editerRappel" data-id="${e.cible[1]}"`
    : e.cible[0] === 'depense' ? `data-do="editerDepense" data-id="${e.cible[1]}"` : e.cible[0] === 'candidat' ? `data-do="ficheCandidat" data-id="${e.cible[1]}"`
    : e.cible[0] === 'contrat' ? `data-do="editerContrat" data-id="${e.cible[1]}"` : `data-go="factures" data-p="${P({ f: 'recurrentes' })}"`;
  return `<div class="li click" ${cible}><div class="dd ${late ? 'late' : soon ? 'soon' : ''}"><b>${d.getDate()}</b><small>${MOIS_C[d.getMonth()]}</small></div>
    <div class="tx"><b>${esc(e.titre)}</b><small>${late ? 'dépassé depuis ' + diffDays(e.date, today()) + ' j' : e.date === today() ? "aujourd'hui" : 'dans ' + diffDays(today(), e.date) + ' j'}</small></div>
    ${e.montant ? `<div class="am ${e.montant < 0 ? 'neg' : ''}">${money(Math.abs(e.montant))}</div>` : ''}</div>`;
}
ACT.masquerBienvenue = () => { S.reglages.bienvenue = false; sauver(); rendre(); };

/* ================= Clients ================= */
VUES.clients = (root, p) => {
  const q = (p.q || '').toLowerCase();
  const liste = mine(S.clients).filter(c => !q || [c.nom, c.entreprise, c.email, c.ville].join(' ').toLowerCase().includes(q))
    .sort((a, b) => clientNom(a.id).localeCompare(clientNom(b.id)));
  root.innerHTML = entete('👥', 'Clients', `${mine(S.clients).length} fiche${mine(S.clients).length > 1 ? 's' : ''} client`, '<button class="btn primary" data-do="nouveauClient">➕ Nouveau client</button>') + `
  <div class="filters"><input class="in search" id="cl-q" placeholder="🔎 Rechercher un client…" value="${esc(p.q || '')}"></div>
  <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Client</th><th>Contact</th><th>Ville</th><th class="r">Facturé</th><th class="r">Reste dû</th><th class="c">Docs</th></tr></thead><tbody>
  ${liste.map(c => { const fs = mine(S.factures).filter(f => f.clientId === c.id && f.numero);
      const fact = sum(fs.filter(f => f.type !== 'avoir' && f.statut !== 'annulee'), f => totaux(f).ttc), reste = sum(fs, restantDe);
      return `<tr class="click" data-do="ficheClient" data-id="${c.id}"><td><b>${esc(c.entreprise || c.nom)}</b>${c.entreprise && c.nom ? `<div class="mini">${esc(c.nom)}</div>` : ''}</td>
      <td>${esc(c.email || '')}<div class="mini">${esc(c.tel || '')}</div></td><td>${esc(c.ville || '')}</td>
      <td class="r num">${money(fact)}</td><td class="r num ${reste ? 'neg' : 'muted'}">${money(reste)}</td>
      <td class="c">${fs.length + mine(S.devis).filter(d => d.clientId === c.id).length}</td></tr>`; }).join('')
    || `<tr><td colspan="6"><div class="empty">${q ? 'Aucun client ne correspond.' : 'Aucun client pour le moment.'}</div></td></tr>`}
  </tbody></table></div></div>`;
  const i = el('cl-q'); i.oninput = () => { ROUTE.p.q = i.value; const pos = i.selectionStart; rendre(); const j = el('cl-q'); j.focus(); j.setSelectionRange(pos, pos); };
};
function formClient(c, apres) {
  const nouveau = !c; c = c || { id: uid(), activiteId: S.activiteId, pays: 'France', creeLe: today() };
  const hist = nouveau ? '' : historiqueClient(c);
  modal({ titre: nouveau ? '👤 Nouveau client' : '👤 ' + esc(clientNom(c.id)), taille: 'wide', corps: `
    <div class="form">
      ${champ('nom', 'Nom du contact', c.nom, { req: !c.entreprise, ph: 'Camille Martin' })}${champ('entreprise', 'Entreprise', c.entreprise, { aide: '(facultatif)' })}
      ${champ('email', 'E-mail', c.email, { type: 'email' })}${champ('tel', 'Téléphone', c.tel, { type: 'tel' })}
      ${champ('adresse', 'Adresse', c.adresse, { two: true })}${champ('cp', 'Code postal', c.cp)}${champ('ville', 'Ville', c.ville)}${champ('pays', 'Pays', c.pays)}
      ${champ('tva', 'N° de TVA intracommunautaire', c.tva, { aide: '(si nécessaire)' })}${champ('siret', 'SIRET', c.siret, { aide: '(facultatif)' })}
      ${champ('notes', 'Notes', c.notes, { type: 'textarea', full: true })}
    </div>${hist}`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async cl => {
      if (mine(S.factures).some(f => f.clientId === c.id) || mine(S.devis).some(d => d.clientId === c.id)) { toast('Ce client a des devis ou factures : il ne peut pas être supprimé.'); return; }
      if (await confirmer('Supprimer la fiche de ' + esc(clientNom(c.id)) + ' ?', 'Supprimer', true)) { S.clients = S.clients.filter(x => x.id !== c.id); sauver(); cl(); rendre(); } } } : null,
      !nouveau ? { lab: '📝 Devis', fn: cl => { cl(); creerDoc('devis', { clientId: c.id }); } } : null,
      !nouveau ? { lab: '🧾 Facture', fn: cl => { cl(); creerDoc('facture', { clientId: c.id }); } } : null,
      '|', { lab: 'Annuler', fn: cl => cl() },
      { lab: 'Enregistrer', cls: 'primary', fn: (cl, b) => {
        const f = lireForm($('.form', b)); if (!f.nom && !f.entreprise) { toast('Indiquez au moins un nom ou une entreprise.'); return; }
        Object.assign(c, f); if (nouveau) S.clients.push(c); sauver(); cl(); toast('Client enregistré.');
        if (apres) apres(c); else rendre();
      } }].filter(Boolean) });
}
function historiqueClient(c) {
  const docs = [...mine(S.devis).filter(d => d.clientId === c.id).map(d => ({ d, k: 'devis' })),
    ...mine(S.factures).filter(f => f.clientId === c.id).map(d => ({ d, k: 'facture' }))].sort((x, y) => (y.d.date || '').localeCompare(x.d.date || ''));
  const pays = S.paiements.filter(p => { const f = byId(S.factures, p.factureId); return f && f.clientId === c.id; });
  return `<div class="fsec" style="margin-top:22px">Historique</div>
    <div class="hstat" style="margin-bottom:12px"><div><div class="l">Devis</div><div class="v">${docs.filter(x => x.k === 'devis').length}</div></div>
    <div><div class="l">Factures</div><div class="v">${docs.filter(x => x.k === 'facture').length}</div></div>
    <div><div class="l">Encaissé</div><div class="v pos">${money(sum(pays, p => num(p.montant)))}</div></div>
    <div><div class="l">Reste dû</div><div class="v">${money(sum(docs.filter(x => x.k === 'facture').map(x => x.d), restantDe))}</div></div></div>
    ${docs.length ? `<table class="t"><tbody>${docs.map(({ d, k }) => `<tr><td>${k === 'devis' ? '📝' : '🧾'} <b>${esc(d.numero || 'Brouillon')}</b></td><td>${fmtDate(d.date)}</td><td>${esc(d.objet || '')}</td>
      <td class="r num">${money(totaux(d).ttc)}</td><td>${k === 'devis' ? pillD(d) : pillF(d)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Aucun document pour ce client.</div>'}`;
}
ACT.nouveauClient = () => formClient();
ACT.ficheClient = ds => formClient(client(ds.id));

/* ================= Catalogue ================= */
VUES.catalogue = root => {
  const liste = mine(S.catalogue).sort((a, b) => (a.categorie || '').localeCompare(b.categorie || '') || a.nom.localeCompare(b.nom));
  root.innerHTML = entete('📦', 'Catalogue', 'Vos produits et services, prêts à glisser dans un devis ou une facture.', '<button class="btn primary" data-do="nouvelArticle">➕ Nouvel article</button>') + `
  <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Réf.</th><th>Article</th><th>Catégorie</th><th class="r">Prix unit. HT</th><th>Unité</th><th class="r">TVA</th></tr></thead><tbody>
  ${liste.map(x => `<tr class="click" data-do="editerArticle" data-id="${x.id}"><td class="mini">${esc(x.ref || '')}</td><td><b>${esc(x.nom)}</b><div class="mini">${esc(x.description || '')}</div></td>
    <td>${x.categorie ? `<span class="tag">${esc(x.categorie)}</span>` : ''}</td><td class="r num">${money(x.prix)}</td><td>${esc(x.unite)}</td><td class="r">${NUM.format(num(x.tva))} %</td></tr>`).join('')
    || '<tr><td colspan="6"><div class="empty">Le catalogue est vide. Ajoutez vos prestations habituelles pour gagner du temps.</div></td></tr>'}
  </tbody></table></div></div>`;
};
function formArticle(x) {
  const nouveau = !x; x = x || { id: uid(), activiteId: S.activiteId, unite: 'unité', tva: act().tvaNonApplicable ? 0 : 20 };
  const cats = [...new Set(mine(S.catalogue).map(c => c.categorie).filter(Boolean))];
  modal({ titre: nouveau ? '📦 Nouvel article' : '📦 ' + esc(x.nom), corps: `<div class="form">
    ${champ('nom', 'Nom', x.nom, { req: true, two: true })}${champ('ref', 'Référence', x.ref)}
    ${champ('description', 'Description', x.description, { type: 'textarea', full: true })}
    ${champ('prix', 'Prix unitaire HT (€)', x.prix, { num: true, type: 'number', step: '0.01' })}
    ${champ('unite', 'Unité', x.unite, { type: 'select', options: UNITES })}
    ${champ('tva', 'Taux de TVA', x.tva, { type: 'select', options: TAUX_TVA.map(t => [t, t + ' %']) })}
    ${champ('categorie', 'Catégorie', x.categorie, { attrs: 'list="cat-list"' })}<datalist id="cat-list">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: cl => { S.catalogue = S.catalogue.filter(c => c.id !== x.id); sauver(); cl(); rendre(); } } : null,
      '|', { lab: 'Annuler', fn: cl => cl() }, { lab: 'Enregistrer', cls: 'primary', fn: (cl, b) => {
        if (manque(b)) return; const f = lireForm(b); f.tva = num(f.tva); Object.assign(x, f);
        if (nouveau) S.catalogue.push(x); sauver(); cl(); rendre(); } }].filter(Boolean) });
}
ACT.nouvelArticle = () => formArticle();
ACT.editerArticle = ds => formArticle(byId(S.catalogue, ds.id));

/* ================= Création des documents ================= */
let EDIT = null; // { kind, doc, nouveau, sale }
function nouveauDoc(kind, base = {}) {
  const a = act(), auj = today();
  const d = { id: uid(), activiteId: a.id, numero: '', clientId: '', date: auj, objet: '', lignes: [], remiseGlobale: 0, notes: '', conditions: '', creeLe: auj };
  if (kind === 'devis') Object.assign(d, { statut: 'brouillon', validite: a.validiteDevis || 30 });
  else Object.assign(d, { type: 'facture', statut: 'brouillon', echeance: addDays(auj, a.delaiPaiement || 30), relances: [] });
  Object.assign(d, clone(base));
  if (!d.lignes.length) d.lignes.push(ligneVide());
  return d;
}
const ligneVide = () => ({ designation: '', description: '', qte: 1, unite: 'unité', pu: 0, remise: 0, tva: act().tvaNonApplicable ? 0 : 20 });
function creerDoc(kind, base) {
  const d = nouveauDoc(kind, base);
  if (kind === 'devis') d.numero = prochainNumero('devis', d.date);
  EDIT = { kind, doc: d, nouveau: true, sale: false };
  go('editeur', { kind });
}
function editerDoc(kind, doc) { EDIT = { kind, doc: clone(doc), nouveau: false, sale: false }; go('editeur', { kind }); }
ACT.nouvelleFacture = () => creerDoc('facture');
ACT.nouveauDevis = () => creerDoc('devis');
ACT.ouvrirDevis = ds => editerDoc('devis', byId(S.devis, ds.id));
ACT.ouvrirFacture = ds => editerDoc('facture', byId(S.factures, ds.id));

/* ================= L'éditeur commun devis / facture ================= */
VUES.editeur = root => {
  if (!EDIT) { go('accueil'); return; }
  const { kind, doc } = EDIT, estDevis = kind === 'devis', a = act();
  const verrou = !estDevis && !!doc.numero && !EDIT.deverrouille;
  const titre = estDevis ? (EDIT.nouveau ? 'Nouveau devis' : 'Devis ' + doc.numero) : (doc.numero ? TYPES_FACTURE[doc.type] + ' ' + doc.numero : (EDIT.nouveau ? 'Nouvelle ' : '') + TYPES_FACTURE[doc.type].toLowerCase() + ' (brouillon)');
  const statuts = estDevis ? STATUTS_DEVIS : { brouillon: 'Brouillon', en_attente: 'En attente', envoyee: 'Envoyée', vue: 'Vue par le client', annulee: 'Annulée' };
  root.innerHTML = entete(estDevis ? '📝' : doc.type === 'avoir' ? '↩️' : '🧾', esc(titre.charAt(0).toUpperCase() + titre.slice(1)),
    estDevis ? `Numéro ${esc(doc.numero)} · ${pillD(doc)}` : doc.numero ? pillF(doc) : 'Le numéro définitif est attribué à la validation, dans l\'ordre chronologique.',
    `<button class="btn" data-do="edRetour">← Retour</button>`) + `
  ${verrou ? `<div class="note warn"><span class="ic">🔒</span><div><b>Facture validée.</b> Une facture numérotée ne devrait plus être modifiée :
    pour corriger un montant, créez plutôt un <b>avoir</b>. <button class="btn sm" data-do="edDeverrouiller" style="margin-left:6px">Modifier quand même</button></div></div>` : ''}
  <div class="ed-grid"><div>
    <div class="card glass"><div class="hd"><h3><span class="em">👤</span>Client &amp; dates</h3></div><div class="bd"><fieldset ${verrou ? 'disabled' : ''} style="border:0;padding:0;margin:0"><div class="form" id="ed-tete">
      <label class="fl two"><span>Client</span><div style="display:flex;gap:6px"><select class="in" name="clientId" required>${optionsClients().map(([k, l]) => `<option value="${k}" ${k === doc.clientId ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
        <button class="btn" type="button" data-do="edNouveauClient" title="Nouveau client">➕</button></div></label>
      ${!estDevis && doc.type !== 'avoir' ? champ('type', 'Type', doc.type, { type: 'select', options: [['facture', 'Facture'], ['acompte', "Facture d'acompte"], ['solde', 'Facture de solde']] }) : ''}
      ${champ('objet', 'Objet', doc.objet, { full: true, ph: 'Ex. : Création d\'une identité visuelle' })}
      ${champ('date', estDevis ? 'Date du devis' : "Date d'émission", doc.date, { type: 'date' })}
      ${estDevis ? champ('validite', 'Durée de validité (jours)', doc.validite, { type: 'number', num: true })
        : doc.type !== 'avoir' ? champ('echeance', "Date d'échéance", doc.echeance, { type: 'date' }) : ''}
    </div>${!estDevis && doc.type !== 'avoir' ? `<div class="row-acts" style="margin-top:8px"><span class="mini">Échéance rapide :</span>${[0, 15, 30, 45, 60].map(j => `<button class="chip" type="button" data-do="edEcheance" data-j="${j}">${j ? j + ' jours' : 'À réception'}</button>`).join('')}</div>` : ''}
    </fieldset></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">📋</span>Lignes</h3><span class="hint">Prix hors taxes</span>
      <div class="right row-acts"><button class="btn sm" data-do="edCatalogue" ${verrou ? 'disabled' : ''}>📦 Depuis le catalogue</button><button class="btn sm primary" data-do="edLigne" ${verrou ? 'disabled' : ''}>➕ Ligne</button></div></div>
      <div class="bd tblwrap"><fieldset ${verrou ? 'disabled' : ''} style="border:0;padding:0;margin:0"><table class="lines" id="ed-lignes"></table></fieldset></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🗒️</span>Conditions &amp; notes</h3></div><div class="bd"><fieldset ${verrou ? 'disabled' : ''} style="border:0;padding:0;margin:0"><div class="form" id="ed-pied">
      ${champ('remiseGlobale', 'Remise globale (%)', doc.remiseGlobale, { type: 'number', num: true, step: '0.1' })}
      ${champ('conditions', 'Conditions', doc.conditions, { type: 'textarea', full: true, ph: estDevis ? 'Ex. : 30 % d\'acompte à la commande, solde à la livraison.' : a.conditions })}
      ${champ('notes', 'Notes (visibles sur le document)', doc.notes, { type: 'textarea', full: true, ph: 'Merci pour votre confiance !' })}
    </div></fieldset></div></div>
  </div>
  <div style="position:sticky;top:18px">
    <div class="card glass"><div class="hd"><h3><span class="em">🧮</span>Total</h3></div><div class="bd"><div class="totals" id="ed-tot"></div></div></div>
    <div class="card glass"><div class="bd">
      <label class="fl" style="margin-bottom:12px"><span>Statut</span><select class="in" id="ed-statut">${Object.entries(statuts).map(([k, l]) => `<option value="${k}" ${k === doc.statut ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <div class="stack" style="gap:8px">
        <button class="btn primary big" data-do="edEnregistrer">💾 Enregistrer</button>
        ${!estDevis && !doc.numero ? '<button class="btn lav" data-do="edValider">✅ Valider et numéroter</button>' : ''}
        <button class="btn" data-do="edApercu">👁️ Aperçu &amp; PDF</button>
        <button class="btn" data-do="edEmail">✉️ Préparer l'e-mail</button>
        ${estDevis && !EDIT.nouveau ? '<button class="btn" data-do="edVersFacture">🔁 Transformer en facture</button>' : ''}
      </div></div></div>
    <div class="note"><span class="ic">ℹ️</span><div>Vérifiez les <b>mentions obligatoires</b> et les <b>règles de TVA</b> propres à votre situation
      (régime, franchise, autoliquidation…) avec votre expert-comptable ou l'administration. NaoFactu ne garantit pas la conformité de vos documents.</div></div>
  </div></div>`;
  peindreLignes(); peindreTotaux();
  $$('#ed-tete [name], #ed-pied [name]').forEach(i => i.addEventListener('input', () => { lireEntete(); peindreTotaux(); }));
  $$('#ed-tete [name], #ed-pied [name]').forEach(i => i.addEventListener('change', () => { lireEntete(); peindreTotaux(); }));
  el('ed-statut').onchange = e => { doc.statut = e.target.value; EDIT.sale = true; };
  QUITTER = () => !EDIT || !EDIT.sale || window.confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?');
};
function lireEntete() {
  const d = EDIT.doc, f = Object.assign(lireForm(el('ed-tete')), lireForm(el('ed-pied')));
  const avant = d.date; Object.assign(d, f); EDIT.sale = true;
  if (EDIT.kind === 'devis' && EDIT.nouveau && avant !== d.date) d.numero = prochainNumero('devis', d.date);
}
function peindreLignes() {
  const d = EDIT.doc, franchise = act().tvaNonApplicable, t = el('ed-lignes');
  t.innerHTML = `<thead><tr><th style="width:40%">Désignation</th><th class="r" style="width:74px">Qté</th><th style="width:96px">Unité</th><th class="r" style="width:108px">PU HT</th>
    <th class="r" style="width:74px">Remise %</th>${franchise ? '' : '<th style="width:84px">TVA</th>'}<th class="r" style="width:100px">Total HT</th><th></th></tr></thead><tbody>${
    d.lignes.map((l, i) => `<tr data-i="${i}" class="${ligneHT(l) < 0 ? 'neg' : ''}">
      <td><input class="in" data-k="designation" value="${esc(l.designation)}" placeholder="Prestation ou produit"><textarea class="in" data-k="description" placeholder="Détail (facultatif)">${esc(l.description || '')}</textarea></td>
      <td><input class="in num" data-k="qte" type="number" step="any" value="${l.qte}"></td>
      <td><select class="in" data-k="unite">${[...new Set([...UNITES, l.unite].filter(Boolean))].map(u => `<option ${u === l.unite ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></td>
      <td><input class="in num" data-k="pu" type="number" step="0.01" value="${l.pu}"></td>
      <td><input class="in num" data-k="remise" type="number" step="0.1" value="${l.remise || 0}"></td>
      ${franchise ? '' : `<td><select class="in" data-k="tva">${[...new Set([...TAUX_TVA, num(l.tva)])].map(x => `<option value="${x}" ${x === num(l.tva) ? 'selected' : ''}>${NUM.format(x)} %</option>`).join('')}</select></td>`}
      <td class="tot">${money(ligneHT(l))}</td><td><button class="x" type="button" data-do="edSuppr" data-i="${i}" title="Supprimer la ligne">✕</button></td></tr>`).join('')}</tbody>`;
  $$('tr[data-i]', t).forEach(tr => $$('[data-k]', tr).forEach(inp => {
    const h = () => { const l = d.lignes[+tr.dataset.i], k = inp.dataset.k;
      l[k] = ['qte', 'pu', 'remise', 'tva'].includes(k) ? num(inp.value) : inp.value; EDIT.sale = true;
      $('.tot', tr).textContent = money(ligneHT(l)); tr.classList.toggle('neg', ligneHT(l) < 0); peindreTotaux(); };
    inp.addEventListener('input', h); inp.addEventListener('change', h);
  }));
}
function peindreTotaux() {
  const d = EDIT.doc, t = totaux(d);
  el('ed-tot').innerHTML = `${t.remise ? `<div class="row"><span>Sous-total HT</span><b>${money(t.brut)}</b></div><div class="row"><span>Remise</span><b>− ${money(t.remise)}</b></div>` : ''}
    <div class="row"><span>Total HT</span><b>${money(t.ht)}</b></div>
    ${t.franchise ? `<div class="row"><span class="mini">${esc(act().mentionTva)}</span></div>` : Object.entries(t.parTaux).filter(([, v]) => v.base).map(([k, v]) => `<div class="row"><span>TVA ${NUM.format(k)} %</span><b>${money(v.tva)}</b></div>`).join('')}
    <div class="row grand"><span>${t.franchise ? 'Net à payer' : 'Total TTC'}</span><b>${money(t.ttc)}</b></div>
    ${EDIT.kind !== 'devis' && d.numero && payeDe(d) ? `<div class="row"><span>Déjà réglé</span><b>${money(payeDe(d))}</b></div><div class="row"><span>Reste dû</span><b>${money(restantDe(d))}</b></div>` : ''}`;
}
ACT.edLigne = () => { EDIT.doc.lignes.push(ligneVide()); EDIT.sale = true; peindreLignes(); peindreTotaux(); const r = $$('#ed-lignes [data-k="designation"]').pop(); r && r.focus(); };
ACT.edSuppr = ds => { EDIT.doc.lignes.splice(+ds.i, 1); EDIT.sale = true; peindreLignes(); peindreTotaux(); };
ACT.edEcheance = ds => { const i = $('#ed-tete [name="echeance"]'); i.value = addDays($('#ed-tete [name="date"]').value || today(), +ds.j); lireEntete(); };
ACT.edDeverrouiller = async () => { if (await confirmer('Modifier une facture déjà numérotée peut poser problème si elle a été envoyée. Continuer ?', 'Modifier')) { EDIT.deverrouille = true; rendre(); } };
ACT.edNouveauClient = () => formClient(null, c => { EDIT.doc.clientId = c.id; EDIT.sale = true; rendre(); });
ACT.edCatalogue = () => {
  const liste = mine(S.catalogue);
  if (!liste.length) { toast('Le catalogue est vide — ajoutez des articles dans « Catalogue ».'); return; }
  modal({ titre: '📦 Ajouter depuis le catalogue', corps: `<input class="in" id="cp-q" placeholder="🔎 Filtrer…" style="margin-bottom:10px"><div class="cat-pick" id="cp-l"></div>`,
    onOpen: b => { const peindre = () => { const q = $('#cp-q', b).value.toLowerCase();
      $('#cp-l', b).innerHTML = liste.filter(x => (x.nom + ' ' + (x.ref || '') + ' ' + (x.categorie || '')).toLowerCase().includes(q)).map(x => `<label class="li" style="cursor:pointer">
        <input type="checkbox" value="${x.id}" style="width:17px;height:17px;accent-color:var(--accent)"><div class="tx"><b>${esc(x.nom)}</b><small>${esc(x.categorie || '')} ${esc(x.ref || '')}</small></div>
        <div class="am">${money(x.prix)} / ${esc(x.unite)}</div></label>`).join(''); };
      $('#cp-q', b).oninput = peindre; peindre(); },
    pied: ['|', { lab: 'Annuler', fn: c => c() }, { lab: 'Ajouter', cls: 'primary', fn: (c, b) => {
      const d = EDIT.doc; d.lignes = d.lignes.filter(l => l.designation || num(l.pu));
      $$('input:checked', b).forEach(i => { const x = byId(S.catalogue, i.value);
        d.lignes.push({ designation: x.nom, description: x.description || '', qte: 1, unite: x.unite, pu: num(x.prix), remise: 0, tva: num(x.tva) }); });
      if (!d.lignes.length) d.lignes.push(ligneVide()); EDIT.sale = true; c(); peindreLignes(); peindreTotaux(); } }] });
};
function enregistrerEdit(silencieux) {
  const { kind, doc } = EDIT; lireEntete();
  if (!doc.clientId) { toast('Choisissez un client.'); $('#ed-tete [name="clientId"]').focus(); return false; }
  doc.lignes = doc.lignes.filter(l => l.designation || num(l.pu));
  if (!doc.lignes.length) { toast('Ajoutez au moins une ligne.'); doc.lignes.push(ligneVide()); peindreLignes(); return false; }
  const liste = kind === 'devis' ? S.devis : S.factures;
  if (EDIT.nouveau) { if (kind === 'devis') doc.numero = attribuerNumero('devis', doc.date); liste.push(doc); EDIT.nouveau = false; }
  else { const i = liste.findIndex(x => x.id === doc.id); if (i >= 0) liste[i] = doc; }
  EDIT.doc = doc; EDIT.sale = false; sauver();
  if (!silencieux) toast(kind === 'devis' ? 'Devis enregistré.' : 'Facture enregistrée.');
  return true;
}
const docReel = () => (EDIT.kind === 'devis' ? S.devis : S.factures).find(x => x.id === EDIT.doc.id);
ACT.edEnregistrer = () => { if (enregistrerEdit()) rendre(); };
ACT.edValider = async () => {
  if (!enregistrerEdit(true)) return;
  const f = docReel();
  if (!await confirmer(`La facture va recevoir le numéro <b>${esc(prochainNumero(f.type === 'avoir' ? 'avoir' : 'facture', f.date))}</b>. Une facture numérotée ne se supprime plus : elle s'annule par un avoir. Valider ?`, 'Valider')) return;
  validerFacture(f); sauver(); EDIT = { kind: 'facture', doc: clone(f), nouveau: false, sale: false }; toast('Facture ' + f.numero + ' validée.'); rendre();
};
ACT.edApercu = () => { if (enregistrerEdit(true)) { apercu(docReel(), EDIT.kind); rendre(); } };
ACT.edEmail = () => { if (enregistrerEdit(true)) preparerEmail(docReel(), EDIT.kind); };
ACT.edRetour = () => go(EDIT && EDIT.kind === 'devis' ? 'devis' : 'factures');
ACT.edVersFacture = () => { if (enregistrerEdit(true)) { EDIT.sale = false; devisVersFacture(docReel()); } };

/* ================= Devis ================= */
VUES.devis = (root, p) => {
  const f = p.f || 'tous', q = (p.q || '').toLowerCase();
  const tous = mine(S.devis), cpt = k => tous.filter(d => statutDevis(d) === k).length;
  const liste = tous.filter(d => (f === 'tous' || statutDevis(d) === f) && (!q || (d.numero + ' ' + clientNom(d.clientId) + ' ' + (d.objet || '')).toLowerCase().includes(q)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.numero.localeCompare(a.numero));
  const accepte = sum(tous.filter(d => statutDevis(d) === 'accepte'), d => totaux(d).ht), attente = sum(tous.filter(d => statutDevis(d) === 'envoye'), d => totaux(d).ht);
  root.innerHTML = entete('📝', 'Devis', `${money(attente)} HT en attente de réponse · ${money(accepte)} HT acceptés`, '<button class="btn primary" data-do="nouveauDevis">➕ Nouveau devis</button>') + `
  <div class="filters">${[['tous', 'Tous', tous.length], ...Object.entries(STATUTS_DEVIS).map(([k, l]) => [k, l, cpt(k)])].map(([k, l, n]) =>
    `<button class="chip ${f === k ? 'on' : ''}" data-go="devis" data-p="${P({ f: k, q: p.q })}">${l}<span class="n">${n}</span></button>`).join('')}
    <input class="in search right" id="dv-q" placeholder="🔎 Rechercher…" value="${esc(p.q || '')}" style="max-width:260px"></div>
  <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Numéro</th><th>Date</th><th>Client</th><th>Objet</th><th class="r">Total TTC</th><th>Statut</th><th></th></tr></thead><tbody>
  ${liste.map(d => `<tr class="click" data-do="ouvrirDevis" data-id="${d.id}"><td><b>${esc(d.numero)}</b></td><td>${fmtDate(d.date)}</td><td>${esc(clientNom(d.clientId))}</td>
    <td class="mini">${esc(d.objet || '')}</td><td class="r num">${money(totaux(d).ttc)}</td><td>${pillD(d)}${d.factureId ? ' <span class="tag">facturé</span>' : ''}</td>
    <td class="acts"><button class="btn sm" data-do="actionsDevis" data-id="${d.id}">⋯</button></td></tr>`).join('')
    || '<tr><td colspan="7"><div class="empty">Aucun devis ici.</div></td></tr>'}</tbody></table></div></div>`;
  const i = el('dv-q'); i.oninput = () => { ROUTE.p.q = i.value; const pos = i.selectionStart; rendre(); const j = el('dv-q'); j.focus(); j.setSelectionRange(pos, pos); };
};
ACT.actionsDevis = ds => {
  const d = byId(S.devis, ds.id), acomptes = S.factures.filter(f => f.devisId === d.id && f.type === 'acompte');
  const b = (lab, fn, cls = '') => ({ lab, fn, cls });
  const m = modal({ titre: '📝 Devis ' + esc(d.numero), sous: esc(clientNom(d.clientId)) + ' · ' + money(totaux(d).ttc) + ' · ' + pillD(d), taille: 'narrow', corps: `
    <div class="fsec">Statut</div><div class="row-acts">${Object.entries(STATUTS_DEVIS).filter(([k]) => k !== 'expire').map(([k, l]) =>
      `<button class="chip ${d.statut === k ? 'on' : ''}" data-st="${k}">${l}</button>`).join('')}</div>
    <div class="fsec">Actions</div><div class="stack" style="gap:8px" id="dv-acts"></div>
    ${acomptes.length ? `<p class="mini" style="margin-top:12px">Acomptes liés : ${acomptes.map(a => esc(a.numero || 'brouillon') + ' (' + money(totaux(a).ttc) + ')').join(', ')}</p>` : ''}` });
  $$('[data-st]', m.box).forEach(x => x.onclick = () => { d.statut = x.dataset.st; sauver(); m.close(); rendre(); toast('Devis ' + STATUTS_DEVIS[d.statut].toLowerCase() + '.'); });
  const acts = [
    ['✏️ Ouvrir / modifier', () => editerDoc('devis', d)], ['👁️ Aperçu & PDF', () => apercu(d, 'devis')], ['✉️ Préparer l\'e-mail', () => preparerEmail(d, 'devis')],
    ['🔁 Transformer en facture', () => devisVersFacture(d), 'primary'], ['💶 Facture d\'acompte', () => creerAcompte(d)],
    acomptes.length ? ['🧮 Facture de solde (déduit les acomptes)', () => devisVersFacture(d, true)] : null,
    ['📄 Dupliquer', () => { const n = nouveauDoc('devis', Object.assign(clone(d), { id: uid(), statut: 'brouillon', date: today(), factureId: '', numero: '' }));
      n.numero = attribuerNumero('devis', n.date); S.devis.push(n); sauver(); toast('Devis dupliqué : ' + n.numero); editerDoc('devis', n); }],
    ['🗑️ Supprimer', async () => { if (await confirmer('Supprimer le devis ' + esc(d.numero) + ' ?', 'Supprimer', true)) { S.devis = S.devis.filter(x => x.id !== d.id); sauver(); rendre(); } }, 'danger']
  ].filter(Boolean);
  const box = $('#dv-acts', m.box);
  acts.forEach(([l, fn, cls]) => { const x = document.createElement('button'); x.className = 'btn ' + (cls || ''); x.innerHTML = l; x.onclick = () => { m.close(); fn(); }; box.appendChild(x); });
};
function devisVersFacture(d, solde) {
  const a = byId(S.activites, d.activiteId) || act();
  const acomptes = S.factures.filter(f => f.devisId === d.id && f.type === 'acompte' && f.numero && f.statut !== 'annulee');
  const lignes = clone(d.lignes);
  if (solde || acomptes.length) for (const ac of acomptes) for (const l of ac.lignes)
    lignes.push(Object.assign(clone(l), { qte: -num(l.qte), designation: 'Déduction — ' + (l.designation || 'acompte'), description: 'Facture d\'acompte ' + ac.numero + ' du ' + fmtDate(ac.date) }));
  d.statut = 'accepte';
  const f = nouveauDoc('facture', { clientId: d.clientId, objet: d.objet, lignes, remiseGlobale: d.remiseGlobale, notes: d.notes, conditions: d.conditions,
    devisId: d.id, type: acomptes.length ? 'solde' : 'facture', echeance: addDays(today(), a.delaiPaiement || 30) });
  S.factures.push(f); d.factureId = f.id; sauver();
  toast(acomptes.length ? 'Facture de solde créée (acomptes déduits).' : 'Facture créée à partir du devis ' + d.numero + '.');
  editerDoc('facture', f);
}
async function creerAcompte(d) {
  const v = await demander('💶 Facture d\'acompte', 'Pourcentage du devis à facturer en acompte (%)', '30', 'number');
  const pct = num(v); if (!pct) return;
  const lignes = d.lignes.map(l => Object.assign(clone(l), { designation: `Acompte ${NUM.format(pct)} % — ${l.designation}`, pu: r2(num(l.pu) * pct / 100) }));
  const f = nouveauDoc('facture', { clientId: d.clientId, type: 'acompte', objet: `Acompte sur devis ${d.numero}${d.objet ? ' — ' + d.objet : ''}`, lignes,
    remiseGlobale: d.remiseGlobale, devisId: d.id, conditions: d.conditions });
  S.factures.push(f); if (d.statut !== 'accepte') d.statut = 'accepte'; sauver();
  toast('Facture d\'acompte créée (brouillon).'); editerDoc('facture', f);
}

/* ================= Factures ================= */
VUES.factures = (root, p) => {
  const f = p.f || 'toutes', q = (p.q || '').toLowerCase(), tous = mine(S.factures);
  const filtres = {
    toutes: x => x.type !== 'avoir', brouillon: x => x.statut === 'brouillon', ouvertes: x => ['envoyee', 'vue', 'en_attente', 'partielle'].includes(statutFacture(x)),
    retard: x => statutFacture(x) === 'retard', payee: x => statutFacture(x) === 'payee', avoirs: x => x.type === 'avoir', annulee: x => x.statut === 'annulee'
  };
  const libs = { toutes: 'Toutes', brouillon: 'Brouillons', ouvertes: 'À encaisser', retard: 'En retard', payee: 'Payées', avoirs: 'Avoirs', annulee: 'Annulées', recurrentes: '🔁 Récurrentes' };
  const liste = f === 'recurrentes' ? [] : tous.filter(filtres[f] || filtres.toutes)
    .filter(x => !q || ((x.numero || '') + ' ' + clientNom(x.clientId) + ' ' + (x.objet || '')).toLowerCase().includes(q))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.numero || '').localeCompare(a.numero || ''));
  const ae = aEncaisser();
  root.innerHTML = entete('🧾', 'Factures', `${money(ae.total)} restant à encaisser sur ${ae.liste.length} facture${ae.liste.length > 1 ? 's' : ''}`,
    '<button class="btn primary" data-do="nouvelleFacture">➕ Nouvelle facture</button>') + `
  <div class="filters">${Object.entries(libs).map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-go="factures" data-p="${P({ f: k, q: p.q })}">${l}${k !== 'recurrentes' ? `<span class="n">${tous.filter(filtres[k]).length}</span>` : `<span class="n">${mine(S.recurrences).length}</span>`}</button>`).join('')}
    ${f !== 'recurrentes' ? `<input class="in search right" id="fc-q" placeholder="🔎 Rechercher…" value="${esc(p.q || '')}" style="max-width:260px">` : ''}</div>
  ${f === 'recurrentes' ? vueRecurrences() : `<div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Numéro</th><th>Date</th><th>Échéance</th><th>Client</th><th class="r">Total TTC</th><th class="r">Reste dû</th><th>Statut</th><th></th></tr></thead><tbody>
  ${liste.map(x => { const st = statutFacture(x), reste = restantDe(x);
    return `<tr class="click" data-do="ouvrirFacture" data-id="${x.id}"><td><b>${esc(x.numero || '—')}</b>${x.type !== 'facture' ? `<div class="mini">${TYPES_FACTURE[x.type]}</div>` : ''}${x.recurrenceId ? ' <span title="Récurrente">🔁</span>' : ''}</td>
    <td>${fmtDate(x.date)}</td><td class="${st === 'retard' ? 'neg' : ''}">${x.type === 'avoir' ? '—' : fmtDate(x.echeance)}${st === 'retard' ? `<div class="mini neg">+${joursRetard(x)} j</div>` : ''}</td>
    <td>${esc(clientNom(x.clientId))}<div class="mini">${esc(x.objet || '')}</div></td>
    <td class="r num">${x.type === 'avoir' ? '− ' : ''}${money(totaux(x).ttc)}</td><td class="r num ${reste ? '' : 'muted'}">${x.type === 'avoir' ? '' : money(reste)}</td><td>${pillF(x)}</td>
    <td class="acts">${st === 'retard' ? `<button class="btn sm" data-do="relancer" data-id="${x.id}" title="Relancer">🔔</button>` : ''}${reste ? `<button class="btn sm" data-do="ajouterPaiement" data-id="${x.id}" title="Enregistrer un paiement">💳</button>` : ''}<button class="btn sm" data-do="actionsFacture" data-id="${x.id}">⋯</button></td></tr>`; }).join('')
    || '<tr><td colspan="8"><div class="empty">Aucune facture ici.</div></td></tr>'}</tbody></table></div></div>`}`;
  const i = el('fc-q'); if (i) i.oninput = () => { ROUTE.p.q = i.value; const pos = i.selectionStart; rendre(); const j = el('fc-q'); j.focus(); j.setSelectionRange(pos, pos); };
};
ACT.relancer = ds => relancer(byId(S.factures, ds.id));
ACT.actionsFacture = ds => {
  const f = byId(S.factures, ds.id), st = statutFacture(f), reste = restantDe(f);
  const m = modal({ titre: `${f.type === 'avoir' ? '↩️' : '🧾'} ${TYPES_FACTURE[f.type]} ${esc(f.numero || '(brouillon)')}`,
    sous: esc(clientNom(f.clientId)) + ' · ' + money(totaux(f).ttc) + ' · ' + pillF(f), taille: 'narrow', corps: `
    ${f.numero && f.type !== 'avoir' && st !== 'annulee' ? `<div class="fsec">Suivi d'envoi</div><div class="row-acts">${[['en_attente', 'En attente'], ['envoyee', 'Envoyée'], ['vue', 'Vue par le client']].map(([k, l]) =>
      `<button class="chip ${f.statut === k ? 'on' : ''}" data-st="${k}">${l}</button>`).join('')}</div>` : ''}
    ${f.numero && f.type !== 'avoir' ? `<div class="hstat" style="margin-top:14px"><div><div class="l">Payé</div><div class="v pos">${money(payeDe(f))}</div></div><div><div class="l">Reste</div><div class="v">${money(reste)}</div></div></div>` : ''}
    <div class="fsec">Actions</div><div class="stack" style="gap:8px" id="fc-acts"></div>
    ${(f.relances || []).length ? `<p class="mini" style="margin-top:12px">Relances : ${f.relances.map(r => fmtDate(r.date)).join(', ')}</p>` : ''}` });
  $$('[data-st]', m.box).forEach(x => x.onclick = () => { f.statut = x.dataset.st; if (x.dataset.st === 'vue') f.vueLe = today(); sauver(); m.close(); rendre(); });
  const acts = [
    ['✏️ Ouvrir / modifier', () => editerDoc('facture', f)], ['👁️ Aperçu & PDF', () => apercu(f, 'facture')], ['✉️ Préparer l\'e-mail', () => preparerEmail(f, 'facture')],
    !f.numero ? ['✅ Valider et numéroter', async () => { if (await confirmer(`Attribuer le numéro <b>${esc(prochainNumero(f.type === 'avoir' ? 'avoir' : 'facture', f.date))}</b> ?`, 'Valider')) { validerFacture(f); sauver(); rendre(); } }, 'primary'] : null,
    reste ? ['💳 Enregistrer un paiement', () => formPaiement(null, f.id), 'primary'] : null,
    reste && f.numero ? ['🔔 Relancer le client', () => relancer(f)] : null,
    f.numero && f.type !== 'avoir' && st !== 'annulee' ? ['↩️ Créer un avoir', () => creerAvoir(f)] : null,
    f.type !== 'avoir' && !f.recurrenceId ? ['🔁 Rendre récurrente', () => formRecurrence(f)] : null,
    ['📄 Dupliquer', () => { const n = nouveauDoc('facture', Object.assign(clone(f), { id: uid(), numero: '', statut: 'brouillon', date: today(), echeance: addDays(today(), act().delaiPaiement || 30), relances: [], recurrenceId: '', devisId: '', valideLe: '' }));
      S.factures.push(n); sauver(); toast('Copie créée en brouillon.'); editerDoc('facture', n); }],
    f.numero && st !== 'annulee' ? ['🚫 Annuler la facture', async () => {
      if (await confirmer('Marquer cette facture comme annulée ? Son numéro reste dans la chronologie. Si elle a été envoyée, créez plutôt un avoir.', 'Annuler la facture', true)) { f.statut = 'annulee'; sauver(); rendre(); } }, 'danger'] : null,
    !f.numero ? ['🗑️ Supprimer le brouillon', async () => { if (await confirmer('Supprimer ce brouillon ?', 'Supprimer', true)) {
      S.factures = S.factures.filter(x => x.id !== f.id); S.paiements = S.paiements.filter(p => p.factureId !== f.id); sauver(); rendre(); } }, 'danger'] : null
  ].filter(Boolean);
  const box = $('#fc-acts', m.box);
  acts.forEach(([l, fn, cls]) => { const x = document.createElement('button'); x.className = 'btn ' + (cls || ''); x.innerHTML = l; x.onclick = () => { m.close(); fn(); }; box.appendChild(x); });
};
function creerAvoir(f) {
  const av = nouveauDoc('facture', { type: 'avoir', clientId: f.clientId, factureLieeId: f.id, objet: 'Avoir sur facture ' + f.numero + (f.objet ? ' — ' + f.objet : ''),
    lignes: clone(f.lignes), remiseGlobale: f.remiseGlobale, echeance: '' });
  S.factures.push(av); sauver();
  toast('Avoir créé en brouillon : ajustez les lignes (avoir partiel) puis validez-le.', 4200);
  editerDoc('facture', av);
}

/* ---------- Factures récurrentes ---------- */
function vueRecurrences() {
  const liste = mine(S.recurrences);
  return `<div class="note lav"><span class="ic">🔁</span><div>Une facture récurrente sert de <b>modèle</b> : à chaque échéance, NaoFactu crée automatiquement
    une nouvelle facture en <b>brouillon</b> (à l'ouverture de l'outil). Vous la vérifiez, la validez puis l'envoyez. Pour créer une récurrence,
    ouvrez le menu ⋯ d'une facture et choisissez « Rendre récurrente ».</div></div>
  <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Client</th><th>Modèle</th><th>Fréquence</th><th>Prochaine</th><th class="r">Montant TTC</th><th>État</th><th></th></tr></thead><tbody>
  ${liste.map(r => { const s = byId(S.factures, r.sourceId); if (!s) return '';
    return `<tr><td><b>${esc(clientNom(s.clientId))}</b></td><td>${esc(s.numero || 'brouillon')}<div class="mini">${esc(s.objet || '')}</div></td><td>${esc(r.frequence)}</td>
    <td>${fmtDate(r.prochaine)}</td><td class="r num">${money(totaux(s).ttc)}</td><td>${r.actif ? '<span class="pill payee">Active</span>' : '<span class="pill brouillon">En pause</span>'}</td>
    <td class="acts"><button class="btn sm" data-do="editerRecurrence" data-id="${r.id}">Modifier</button></td></tr>`; }).join('')
    || '<tr><td colspan="7"><div class="empty">Aucune facture récurrente.</div></td></tr>'}</tbody></table></div></div>`;
}
function formRecurrence(f, r) {
  const nouveau = !r; r = r || { id: uid(), activiteId: f.activiteId, sourceId: f.id, frequence: 'mensuelle', prochaine: addMonths(f.date || today(), 1), actif: true };
  modal({ titre: '🔁 Facture récurrente', sous: 'Modèle : ' + esc((f.numero || 'brouillon') + ' · ' + clientNom(f.clientId)), taille: 'narrow', corps: `<div class="form">
    ${champ('frequence', 'Fréquence', r.frequence, { type: 'select', options: Object.keys(FREQ) })}
    ${champ('prochaine', 'Prochaine facture le', r.prochaine, { type: 'date' })}${champ('fin', 'Jusqu\'au', r.fin, { type: 'date', aide: '(facultatif)' })}
    ${champ('actif', 'Récurrence active', r.actif, { type: 'check', full: true })}</div>`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: c => { S.recurrences = S.recurrences.filter(x => x.id !== r.id); S.factures.forEach(x => { if (x.id === r.sourceId) delete x.recurrenceId; }); sauver(); c(); rendre(); } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: (c, b) => {
        Object.assign(r, lireForm(b)); if (nouveau) { S.recurrences.push(r); f.recurrenceId = r.id; }
        const n = genererRecurrences(); sauver(); c(); toast(n ? n + ' facture(s) générée(s).' : 'Récurrence enregistrée.'); rendre(); } }].filter(Boolean) });
}
ACT.editerRecurrence = ds => { const r = byId(S.recurrences, ds.id); formRecurrence(byId(S.factures, r.sourceId), r); };

/* ================= Paiements ================= */
VUES.paiements = root => {
  const auj = today(), ids = new Set(mine(S.factures).map(f => f.id));
  const pays = S.paiements.filter(p => ids.has(p.factureId)).sort((a, b) => b.date.localeCompare(a.date));
  const ae = aEncaisser(), mois = sum(pays.filter(p => p.date.slice(0, 7) === auj.slice(0, 7)), p => num(p.montant)), an = sum(pays.filter(p => p.date.slice(0, 4) === auj.slice(0, 4)), p => num(p.montant));
  root.innerHTML = entete('💳', 'Paiements', 'Les règlements reçus, et ce qu\'il reste à encaisser.', '<button class="btn primary" data-do="ajouterPaiement">➕ Enregistrer un paiement</button>') + `
  <div class="kpis"><div class="kpi glass ok"><div class="lab">Encaissé ce mois</div><div class="val">${money(mois)}</div></div>
    <div class="kpi glass ok"><div class="lab">Encaissé en ${auj.slice(0, 4)}</div><div class="val">${money(an)}</div></div>
    <div class="kpi glass blue"><div class="lab">Reste à encaisser</div><div class="val">${money(ae.total)}</div><div class="sub">${ae.liste.length} facture(s)</div></div></div>
  <div class="grid2">
    <div class="card glass"><div class="hd"><h3><span class="em">⏳</span>À encaisser</h3></div><div class="bd flush">
      ${ae.liste.sort((a, b) => (a.echeance || '').localeCompare(b.echeance || '')).map(f => `<div class="li"><div class="tx"><b>${esc(f.numero)} · ${esc(clientNom(f.clientId))}</b>
        <small>échéance ${fmtDate(f.echeance)} · ${pillF(f)}</small></div><div class="am">${money(restantDe(f))}</div>
        <button class="btn sm" data-do="ajouterPaiement" data-id="${f.id}">💳 Encaisser</button></div>`).join('') || '<div class="empty">Tout est encaissé. 🎉</div>'}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">✅</span>Paiements reçus</h3></div><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Date</th><th>Facture</th><th>Moyen</th><th class="r">Montant</th></tr></thead><tbody>
      ${pays.map(p => { const f = byId(S.factures, p.factureId); return `<tr class="click" data-do="editerPaiement" data-id="${p.id}"><td>${fmtDate(p.date)}</td>
        <td><b>${esc(f.numero)}</b><div class="mini">${esc(clientNom(f.clientId))}${p.reference ? ' · réf. ' + esc(p.reference) : ''}</div></td><td>${esc(p.moyen)}</td><td class="r num pos">${money(p.montant)}</td></tr>`; }).join('')
        || '<tr><td colspan="4"><div class="empty">Aucun paiement enregistré.</div></td></tr>'}</tbody></table></div></div>
  </div>`;
};
function formPaiement(p, factureId) {
  const nouveau = !p;
  const ouvertes = mine(S.factures).filter(f => f.numero && f.type !== 'avoir' && f.statut !== 'annulee' && (restantDe(f) > 0 || (p && p.factureId === f.id)));
  if (nouveau && !ouvertes.length) {
    const brouillon = factureId && byId(S.factures, factureId);
    toast(brouillon && !brouillon.numero ? 'Validez d\'abord la facture pour y enregistrer un paiement.' : 'Aucune facture validée en attente de paiement.', 3600); return;
  }
  p = p || { id: uid(), factureId: factureId || ouvertes[0].id, date: today(), moyen: 'Virement' };
  const f0 = byId(S.factures, p.factureId);
  if (nouveau) p.montant = restantDe(f0);
  modal({ titre: nouveau ? '💳 Enregistrer un paiement' : '💳 Paiement', taille: 'narrow', corps: `<div class="form">
    ${champ('factureId', 'Facture', p.factureId, { type: 'select', full: true, options: ouvertes.map(f => [f.id, `${f.numero} · ${clientNom(f.clientId)} · reste ${money(restantDe(f))}`]) })}
    ${champ('date', 'Date', p.date, { type: 'date' })}${champ('montant', 'Montant (€)', p.montant, { type: 'number', step: '0.01', num: true, req: true })}
    ${champ('moyen', 'Moyen de paiement', p.moyen, { type: 'select', options: MOYENS })}${champ('reference', 'Référence', p.reference, { ph: 'N° de chèque, libellé du virement…' })}
    ${champ('notes', 'Notes', p.notes, { type: 'textarea', full: true })}</div>`,
    onOpen: b => { const s = $('[name="factureId"]', b), mt = $('[name="montant"]', b); if (nouveau) s.onchange = () => { mt.value = restantDe(byId(S.factures, s.value)); }; },
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async c => { if (await confirmer('Supprimer ce paiement ?', 'Supprimer', true)) { S.paiements = S.paiements.filter(x => x.id !== p.id); sauver(); c(); rendre(); } } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: (c, b) => {
        const v = lireForm(b); if (!v.montant) { toast('Indiquez un montant.'); return; }
        Object.assign(p, v); if (nouveau) S.paiements.push(p); sauver(); c();
        const f = byId(S.factures, p.factureId); toast(statutFacture(f) === 'payee' ? `Facture ${f.numero} entièrement payée. 🎉` : `Paiement enregistré — reste ${money(restantDe(f))}.`); rendre(); } }].filter(Boolean) });
}
ACT.ajouterPaiement = ds => formPaiement(null, ds && ds.id);
ACT.editerPaiement = ds => formPaiement(byId(S.paiements, ds.id));
