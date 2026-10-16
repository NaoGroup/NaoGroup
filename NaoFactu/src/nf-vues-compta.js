/* ============================================================
   NaoFactu — le suivi : dépenses, comptabilité, fiches de paie,
   documents, calendrier des échéances, paramètres.
   ============================================================ */
'use strict';

/* Ce qui attend d'être rangé : documents déposés sans dossier, dépenses sans justificatif. */
function aClasser() {
  const docs = mine(S.documents).filter(d => d.aClasser).map(d => ({ titre: d.nom, sous: 'Déposé le ' + fmtDate(d.date) + ' · à ranger dans un dossier', doc: d }));
  const deps = mine(S.depenses).filter(d => !d.justificatif && !d.sansJustif && !(d.prevue && !d.payee))
    .map(d => ({ titre: 'Justificatif manquant · ' + (d.fournisseur || catDep(d.categorie)[2]), sous: fmtDate(d.date) + ' · ' + money(depTTC(d)), dep: d }));
  return [...docs, ...deps];
}

/* ================= Dépenses ================= */
VUES.depenses = (root, p) => {
  const an = p.an || today().slice(0, 4), cat = p.cat || '', m = p.m || '';
  const toutes = mine(S.depenses).filter(d => d.date.slice(0, 4) === an);
  const liste = toutes.filter(d => (!cat || d.categorie === cat) && (!m || d.date.slice(5, 7) === m)).sort((a, b) => b.date.localeCompare(a.date));
  const reelles = liste.filter(d => !(d.prevue && !d.payee));
  const ans = [...new Set([today().slice(0, 4), ...mine(S.depenses).map(d => d.date.slice(0, 4))])].sort().reverse();
  root.innerHTML = entete('🛒', 'Dépenses', 'Vos achats professionnels et leurs justificatifs.', `<button class="btn primary" data-do="ajouterDepense">➕ Ajouter une dépense</button>`) + `
  <div class="filters">
    <select class="in" id="dp-an" style="width:auto">${ans.map(a => `<option ${a === an ? 'selected' : ''}>${a}</option>`).join('')}</select>
    <select class="in" id="dp-m" style="width:auto"><option value="">Toute l'année</option>${MOIS.map((x, i) => `<option value="${pad(i + 1)}" ${pad(i + 1) === m ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <button class="chip ${!cat ? 'on' : ''}" data-go="depenses" data-p="${P({ an, m })}">Toutes</button>
    ${CAT_DEPENSES.map(([k, e, l]) => { const n = toutes.filter(d => d.categorie === k).length; return n ? `<button class="chip ${cat === k ? 'on' : ''}" data-go="depenses" data-p="${P({ an, m, cat: k })}">${e} ${l}<span class="n">${n}</span></button>` : ''; }).join('')}
  </div>
  <div class="kpis"><div class="kpi glass warn"><div class="lab">Total TTC</div><div class="val">${money(sum(reelles, depTTC))}</div><div class="sub">${reelles.length} dépense(s)</div></div>
    <div class="kpi glass"><div class="lab">Total HT</div><div class="val">${money(sum(reelles, depHT))}</div></div>
    <div class="kpi glass blue"><div class="lab">TVA récupérable (indicative)</div><div class="val">${money(sum(reelles, depTVA))}</div></div>
    <div class="kpi glass ${liste.filter(d => !d.justificatif && !d.sansJustif).length ? 'bad' : 'ok'}"><div class="lab">Sans justificatif</div><div class="val">${liste.filter(d => !d.justificatif && !d.sansJustif).length}</div></div></div>
  <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Date</th><th>Fournisseur</th><th>Catégorie</th><th>Moyen</th><th class="r">HT</th><th class="r">TVA</th><th class="r">TTC</th><th class="c">Justif.</th></tr></thead><tbody>
  ${liste.map(d => `<tr class="click" data-do="editerDepense" data-id="${d.id}"><td>${fmtDate(d.date)}${d.prevue && !d.payee ? '<div class="mini">prévue</div>' : ''}</td>
    <td><b>${esc(d.fournisseur || '—')}</b><div class="mini">${esc(d.notes || '')}</div></td><td>${catDep(d.categorie)[1]} ${catDep(d.categorie)[2]}</td><td>${esc(d.moyen || '')}</td>
    <td class="r num">${money(depHT(d))}</td><td class="r num muted">${money(depTVA(d))}</td><td class="r num"><b>${money(depTTC(d))}</b></td>
    <td class="c">${d.justificatif ? `<button class="btn sm" data-do="voirJustif" data-id="${d.id}" title="${esc(d.justificatif.nom)}">📎</button>` : d.sansJustif ? '<span class="mini">—</span>' : '<span class="neg" title="Justificatif manquant">⚠️</span>'}</td></tr>`).join('')
    || '<tr><td colspan="8"><div class="empty">Aucune dépense sur cette période.</div></td></tr>'}</tbody></table></div></div>`;
  el('dp-an').onchange = e => go('depenses', { an: e.target.value, cat, m });
  el('dp-m').onchange = e => go('depenses', { an, cat, m: e.target.value });
};
function formDepense(d) {
  const nouveau = !d; d = d || { id: uid(), activiteId: S.activiteId, date: today(), categorie: 'fournitures', moyen: 'Carte bancaire', ttc: '', tva: '' };
  let fichier = null, retirer = false;
  const fournisseurs = [...new Set(mine(S.depenses).map(x => x.fournisseur).filter(Boolean))];
  modal({ titre: nouveau ? '🛒 Nouvelle dépense' : '🛒 Dépense', corps: `<div class="form">
    ${champ('date', 'Date', d.date, { type: 'date' })}${champ('fournisseur', 'Fournisseur', d.fournisseur, { attrs: 'list="fo-list"', req: true })}
    <datalist id="fo-list">${fournisseurs.map(f => `<option value="${esc(f)}">`).join('')}</datalist>
    ${champ('categorie', 'Catégorie', d.categorie, { type: 'select', options: CAT_DEPENSES.map(([k, e, l]) => [k, e + ' ' + l]) })}
    ${champ('moyen', 'Moyen de paiement', d.moyen, { type: 'select', options: MOYENS })}
    ${champ('ttc', 'Montant TTC (€)', d.ttc, { type: 'number', step: '0.01', num: true, req: true })}
    <label class="fl"><span>Montant de TVA (€) <i>— ou calcul :</i></span><div style="display:flex;gap:6px"><input class="in num" name="tva" data-num="1" type="number" step="0.01" value="${esc(d.tva)}">
      <select class="in" id="dp-taux" style="width:92px"><option value="">taux…</option>${TAUX_TVA.map(t => `<option value="${t}">${t} %</option>`).join('')}</select></div></label>
    ${champ('notes', 'Notes', d.notes, { type: 'textarea', full: true })}
    <div class="fl full"><span>Photo ou fichier justificatif</span><div class="row-acts" id="dp-j"></div></div>
    ${champ('sansJustif', "Pas de justificatif pour cette dépense (ne plus la signaler)", d.sansJustif, { type: 'check', full: true })}
    ${champ('prevue', 'Dépense prévue (à venir, affichée dans le calendrier)', d.prevue, { type: 'check', full: true })}
    ${champ('payee', 'Dépense prévue désormais payée', d.payee, { type: 'check', full: true })}</div>`,
    onOpen: b => {
      const peindreJ = () => { const j = fichier ? { nom: fichier.name } : (!retirer && d.justificatif);
        $('#dp-j', b).innerHTML = (j ? `<span class="tag">📎 ${esc(j.nom)}</span>${!fichier ? '<button class="btn sm" type="button" data-j="voir">Ouvrir</button>' : ''}<button class="btn sm" type="button" data-j="suppr">Retirer</button>` : '')
          + `<button class="btn sm lav" type="button" data-j="ajout">📷 ${j ? 'Remplacer' : 'Joindre une photo / un PDF'}</button>`;
        $$('[data-j]', b).forEach(x => x.onclick = async () => {
          if (x.dataset.j === 'voir') ouvrirFichier(d.justificatif);
          if (x.dataset.j === 'suppr') { fichier = null; retirer = true; peindreJ(); }
          if (x.dataset.j === 'ajout') { const fs = await choisirFichiers({ accept: 'image/*,application/pdf' }); if (fs[0]) { fichier = fs[0]; retirer = false; peindreJ(); } }
        }); };
      peindreJ();
      $('#dp-taux', b).onchange = e => { const t = num(e.target.value), ttc = num($('[name="ttc"]', b).value); if (e.target.value !== '') $('[name="tva"]', b).value = r2(ttc - ttc / (1 + t / 100)); };
    },
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async c => { if (await confirmer('Supprimer cette dépense ?', 'Supprimer', true)) {
      if (d.justificatif) IDB.del(d.justificatif.id); S.depenses = S.depenses.filter(x => x.id !== d.id); sauver(); c(); rendre(); } } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: async (c, b) => {
        if (manque(b)) return; Object.assign(d, lireForm(b));
        if (retirer && d.justificatif) { IDB.del(d.justificatif.id); d.justificatif = null; }
        if (fichier) { if (d.justificatif) IDB.del(d.justificatif.id); d.justificatif = await stockerFichier(fichier); }
        if (nouveau) S.depenses.push(d); sauver(); c(); toast('Dépense enregistrée.'); rendre(); } }].filter(Boolean) });
}
ACT.ajouterDepense = () => formDepense();
ACT.editerDepense = ds => formDepense(byId(S.depenses, ds.id));
ACT.voirJustif = ds => ouvrirFichier(byId(S.depenses, ds.id).justificatif);

/* ================= Comptabilité ================= */
VUES.compta = (root, p) => {
  const t = p.t || 'journal', an = +(p.an || today().slice(0, 4));
  root.innerHTML = entete('📊', 'Comptabilité', 'Recettes, dépenses, trésorerie et exports pour votre expert-comptable.') + `
  <div class="note"><span class="ic">ℹ️</span><div>Ces tableaux sont des <b>outils de suivi</b>, calculés à partir de ce que vous saisissez. Ils ne remplacent ni une comptabilité
    tenue par un professionnel, ni vos déclarations : vérifiez les règles de TVA, vos obligations comptables et vos déclarations sociales avec
    un expert-comptable ou l'administration compétente.</div></div>
  ${onglets([['journal', '📒 Recettes & dépenses'], ['treso', '🏦 Trésorerie'], ['rapports', '📑 Rapports'], ['exports', '📤 Exports']], t)}
  <div id="cp-body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => go('compta', { t: b.dataset.tab, an }));
  const body = el('cp-body');
  if (t === 'journal') comptaJournal(body, an);
  if (t === 'treso') comptaTreso(body);
  if (t === 'rapports') comptaRapports(body, p);
  if (t === 'exports') comptaExports(body);
};
function selAnnee(an, cible) {
  return `<div class="row-acts"><button class="btn sm" data-go="compta" data-p="${P(Object.assign({}, cible, { an: an - 1 }))}">‹</button><b style="font-size:16px">${an}</b>
    <button class="btn sm" data-go="compta" data-p="${P(Object.assign({}, cible, { an: an + 1 }))}">›</button></div>`;
}
function comptaJournal(body, an) {
  const mois = MOIS.map((x, i) => agregat(...periodeBornes(an, 'mois', i))), tot = agregat(...periodeBornes(an, 'annee'));
  body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">📒</span>Tableau des recettes et dépenses</h3>${selAnnee(an, { t: 'journal' })}</div>
    <div class="bd chart">${barres([{ nom: 'Encaissé', valeurs: mois.map(m => m.encaisse) }, { nom: 'Dépenses', valeurs: mois.map(m => m.depTTC) }], MOIS_C, { couleurs: ['var(--accent)', 'var(--warning)'] })}
    <div class="legend"><span><i style="background:var(--accent)"></i>Encaissé</span><span><i style="background:var(--warning)"></i>Dépenses TTC</span></div></div>
    <div class="bd flush tblwrap"><table class="t"><thead><tr><th>Mois</th><th class="r">Facturé HT</th><th class="r">TVA collectée</th><th class="r">Encaissé</th><th class="r">Dépenses TTC</th><th class="r">TVA déductible</th><th class="r">Solde du mois</th></tr></thead><tbody>
    ${mois.map((m, i) => `<tr><td>${MOIS[i]}</td><td class="r num">${money(m.factureHT)}</td><td class="r num muted">${money(m.tvaCollectee)}</td><td class="r num pos">${money(m.encaisse)}</td>
      <td class="r num">${money(m.depTTC)}</td><td class="r num muted">${money(m.tvaDeductible)}</td><td class="r num ${m.encaisse - m.depTTC < 0 ? 'neg' : ''}"><b>${money(m.encaisse - m.depTTC)}</b></td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total ${an}</td><td class="r num">${money(tot.factureHT)}</td><td class="r num">${money(tot.tvaCollectee)}</td><td class="r num">${money(tot.encaisse)}</td><td class="r num">${money(tot.depTTC)}</td>
      <td class="r num">${money(tot.tvaDeductible)}</td><td class="r num">${money(tot.encaisse - tot.depTTC)}</td></tr></tfoot></table></div></div>`;
}
function comptaTreso(body) {
  const a = act(), t = tresorerie(), ae = aEncaisser(), prev = mine(S.depenses).filter(d => d.prevue && !d.payee);
  body.innerHTML = `<div class="kpis">
    <div class="kpi glass ok"><div class="lab">Encaissé</div><div class="val">${money(t.encaisse)}</div><div class="sub">depuis le ${fmtDate(t.depuis)}</div></div>
    <div class="kpi glass blue"><div class="lab">À encaisser</div><div class="val">${money(t.aEncaisser)}</div><div class="sub">${ae.liste.length} facture(s) ouverte(s)</div></div>
    <div class="kpi glass warn"><div class="lab">Dépenses enregistrées</div><div class="val">${money(t.depenses)}</div><div class="sub">+ ${money(t.prevues)} prévues</div></div>
    <div class="kpi glass"><div class="lab">Solde estimé</div><div class="val ${t.solde < 0 ? 'neg' : ''}">${money(t.solde)}</div><div class="sub">projeté : ${money(t.projete)}</div></div></div>
  <div class="grid2"><div class="card glass"><div class="hd"><h3><span class="em">🧮</span>Comment c'est calculé</h3></div><div class="bd"><div class="totals">
    <div class="row"><span>Solde de départ (${fmtDate(t.depuis)})</span><b>${money(t.initial)}</b></div>
    <div class="row"><span>+ Paiements encaissés</span><b class="pos">${money(t.encaisse)}</b></div>
    <div class="row"><span>− Dépenses enregistrées</span><b class="neg">${money(t.depenses)}</b></div>
    <div class="row grand"><span>Solde estimé aujourd'hui</span><b>${money(t.solde)}</b></div>
    <div class="row"><span>+ Reste à encaisser</span><b>${money(t.aEncaisser)}</b></div><div class="row"><span>− Dépenses prévues</span><b>${money(t.prevues)}</b></div>
    <div class="row"><span><b>Solde projeté</b></span><b>${money(t.projete)}</b></div></div>
    <div class="form" style="margin-top:16px" id="tr-f">${champ('soldeInitial', 'Solde de départ du compte pro (€)', a.soldeInitial, { type: 'number', step: '0.01', num: true })}${champ('soldeDate', 'À la date du', a.soldeDate, { type: 'date' })}</div>
    <button class="btn sm" style="margin-top:10px" data-do="majSolde">Mettre à jour</button>
    <p class="mini">Estimation simple, hors charges sociales et impôts non saisis : elle ne remplace pas vos relevés bancaires.</p></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🔮</span>À venir</h3></div><div class="bd flush">
      ${[...ae.liste.map(f => ({ date: f.echeance, t: f.numero + ' · ' + clientNom(f.clientId), m: restantDe(f) })), ...prev.map(d => ({ date: d.date, t: 'Dépense prévue · ' + (d.fournisseur || ''), m: -depTTC(d) }))]
        .sort((x, y) => (x.date || '').localeCompare(y.date || '')).map(x => `<div class="li"><div class="tx"><b>${esc(x.t)}</b><small>${fmtDate(x.date)}</small></div><div class="am ${x.m < 0 ? 'neg' : 'pos'}">${x.m < 0 ? '−' : '+'} ${money(Math.abs(x.m))}</div></div>`).join('')
        || '<div class="empty">Rien de prévu.</div>'}</div></div></div>`;
}
ACT.majSolde = () => { Object.assign(act(), lireForm(el('tr-f'))); sauver(); toast('Solde de départ mis à jour.'); rendre(); };
function comptaRapports(body, p) {
  const an = +(p.an || today().slice(0, 4)), mode = p.mode || 'mois', idx = p.idx != null ? +p.idx : (mode === 'mois' ? new Date().getMonth() : mode === 'trimestre' ? Math.floor(new Date().getMonth() / 3) : 0);
  const [debut, fin] = periodeBornes(an, mode, idx), g = agregat(debut, fin);
  const libelle = mode === 'mois' ? MOIS[idx] + ' ' + an : mode === 'trimestre' ? (idx + 1) + 'ᵉ trimestre ' + an : 'Année ' + an;
  const parClient = {}; g.factures.filter(f => f.type !== 'avoir').forEach(f => parClient[f.clientId] = (parClient[f.clientId] || 0) + totaux(f).ht);
  const tops = Object.entries(parClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
  body.innerHTML = `<div class="filters">${['mois', 'trimestre', 'annee'].map(k => `<button class="chip ${mode === k ? 'on' : ''}" data-go="compta" data-p="${P({ t: 'rapports', mode: k, an })}">${{ mois: 'Mensuel', trimestre: 'Trimestriel', annee: 'Annuel' }[k]}</button>`).join('')}
    ${mode !== 'annee' ? `<select class="in" id="rp-i" style="width:auto">${(mode === 'mois' ? MOIS : ['1ᵉʳ trimestre', '2ᵉ trimestre', '3ᵉ trimestre', '4ᵉ trimestre']).map((x, i) => `<option value="${i}" ${i === idx ? 'selected' : ''}>${x}</option>`).join('')}</select>` : ''}
    <input class="in" id="rp-an" type="number" value="${an}" style="width:100px">
    <div class="right row-acts"><button class="btn" data-do="rapportPdf" data-debut="${debut}" data-fin="${fin}" data-lib="${esc(libelle)}">📄 PDF</button>
    <button class="btn" data-do="exporter" data-fmt="xls" data-debut="${debut}" data-fin="${fin}">📗 Excel</button></div></div>
  <div class="card glass"><div class="hd"><h3><span class="em">📑</span>Rapport — ${esc(libelle)}</h3><span class="hint">du ${fmtDate(debut)} au ${fmtDate(fin)}</span></div><div class="bd">
    <div class="hstat"><div><div class="l">Facturé HT</div><div class="v">${money(g.factureHT)}</div></div><div><div class="l">TVA collectée</div><div class="v">${money(g.tvaCollectee)}</div></div>
      <div><div class="l">Encaissé</div><div class="v pos">${money(g.encaisse)}</div></div><div><div class="l">Dépenses TTC</div><div class="v">${money(g.depTTC)}</div></div>
      <div><div class="l">TVA déductible</div><div class="v">${money(g.tvaDeductible)}</div></div><div><div class="l">Encaissé − dépenses</div><div class="v ${g.encaisse - g.depTTC < 0 ? 'neg' : ''}">${money(g.encaisse - g.depTTC)}</div></div></div></div></div>
  <div class="grid2"><div class="card glass"><div class="hd"><h3><span class="em">🛒</span>Dépenses par catégorie</h3></div><div class="bd">
    ${Object.entries(g.parCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span>${catDep(k)[1]} ${catDep(k)[2]}</span><b>${money(v)}</b></div>
      <div class="bar"><i style="width:${(v / (g.depTTC || 1) * 100).toFixed(1)}%"></i></div></div>`).join('') || '<div class="empty">Aucune dépense.</div>'}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">👥</span>Meilleurs clients (HT facturé)</h3></div><div class="bd flush">
    ${tops.map(([id, v]) => `<div class="li"><div class="tx"><b>${esc(clientNom(id))}</b></div><div class="am">${money(v)}</div></div>`).join('') || '<div class="empty">Aucune facture sur la période.</div>'}</div></div></div>`;
  const ri = el('rp-i'); if (ri) ri.onchange = e => go('compta', { t: 'rapports', mode, an, idx: e.target.value });
  el('rp-an').onchange = e => go('compta', { t: 'rapports', mode, an: e.target.value, idx });
}
function comptaExports(body) {
  const an = today().slice(0, 4);
  body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">📤</span>Préparer un export pour l'expert-comptable</h3></div><div class="bd">
    <div class="form" id="ex-f">${champ('debut', 'Du', an + '-01-01', { type: 'date' })}${champ('fin', 'Au', an + '-12-31', { type: 'date' })}</div>
    <div class="row-acts" style="margin:10px 0 16px">${[['Ce mois', 'mois'], ['Trimestre en cours', 'trim'], ['Cette année', 'an'], ['Année dernière', 'an-1']].map(([l, k]) => `<button class="chip" data-do="exPeriode" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="fsec">Contenu</div><div class="row-acts" id="ex-c">${[['factures', 'Factures & avoirs'], ['paiements', 'Paiements reçus'], ['depenses', 'Dépenses'], ['journal', 'Journal recettes-dépenses']].map(([k, l]) =>
      `<label class="ck"><input type="checkbox" value="${k}" checked> ${l}</label>`).join('')}</div>
    <div class="fsec">Format</div><div class="row-acts">
      <button class="btn" data-do="exporter" data-fmt="csv">🧾 CSV (un fichier par tableau)</button>
      <button class="btn primary" data-do="exporter" data-fmt="xls">📗 Excel (un classeur)</button>
      <button class="btn" data-do="exporter" data-fmt="pdf">📄 PDF</button>
      <button class="btn" data-do="exportJustifs">📎 Liste des justificatifs</button></div>
    <p class="mini" style="margin-top:14px">Chaque export est aussi rangé dans <b>Documents → Exports comptables</b>, pour garder une trace de ce qui a été transmis.
      Les CSV utilisent le point-virgule et l'encodage UTF-8, lus directement par Excel en français.</p></div></div>`;
}
ACT.exPeriode = ds => {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth(); let b;
  if (ds.k === 'mois') b = periodeBornes(y, 'mois', m); if (ds.k === 'trim') b = periodeBornes(y, 'trimestre', Math.floor(m / 3));
  if (ds.k === 'an') b = periodeBornes(y, 'annee'); if (ds.k === 'an-1') b = periodeBornes(y - 1, 'annee');
  $('#ex-f [name="debut"]').value = b[0]; $('#ex-f [name="fin"]').value = b[1];
};
async function archiverExport(nom, contenu, type) {
  const f = new File([contenu], nom, { type });
  const ref = await stockerFichier(f);
  S.documents.push({ id: uid(), activiteId: S.activiteId, categorie: 'exports', nom, date: today(), fichier: ref });
  sauver();
}
ACT.exporter = async ds => {
  const f = el('ex-f') ? lireForm(el('ex-f')) : { debut: ds.debut, fin: ds.fin };
  const debut = ds.debut || f.debut, fin = ds.fin || f.fin;
  const choix = el('ex-c') ? $$('#ex-c input:checked').map(i => i.value) : ['factures', 'paiements', 'depenses', 'journal'];
  if (!choix.length) { toast('Cochez au moins un tableau.'); return; }
  const D = donneesExport(debut, fin), suffixe = `${act().nom}_${debut}_${fin}`.replace(/[^\wÀ-ÿ-]+/g, '_');
  if (ds.fmt === 'csv') {
    for (const k of choix) { const nom = `NaoFactu_${D[k].nom}_${suffixe}.csv`, c = csv(D[k].entetes, D[k].lignes); telecharger(nom, c, 'text/csv;charset=utf-8'); await archiverExport(nom, c, 'text/csv'); }
    toast(choix.length + ' fichier(s) CSV téléchargé(s).');
  } else if (ds.fmt === 'xls') {
    const nom = `NaoFactu_${suffixe}.xls`, x = classeurExcel(choix.map(k => D[k]));
    telecharger(nom, x, 'application/vnd.ms-excel'); await archiverExport(nom, x, 'application/vnd.ms-excel'); toast('Classeur Excel téléchargé.');
  } else {
    imprimer(`<div class="rp"><h1>${esc(act().nom)} — export comptable</h1><div class="sub">Période du ${fmtDate(debut)} au ${fmtDate(fin)} · généré le ${fmtDate(today())}</div>
      ${choix.map(k => tablePrint(D[k])).join('')}<div class="disc">${AVERT_COMPTA}</div></div>`, `NaoFactu export ${suffixe}`);
  }
};
ACT.rapportPdf = ds => {
  const g = agregat(ds.debut, ds.fin), D = donneesExport(ds.debut, ds.fin);
  const resume = { nom: 'Synthèse', entetes: ['Indicateur', 'Montant'], lignes: [['Facturé HT', g.factureHT], ['TVA collectée', g.tvaCollectee], ['Encaissé', g.encaisse], ['Dépenses TTC', g.depTTC], ['TVA déductible', g.tvaDeductible], ['Encaissé − dépenses', r2(g.encaisse - g.depTTC)]] };
  const cats = { nom: 'Dépenses par catégorie', entetes: ['Catégorie', 'Montant TTC'], lignes: Object.entries(g.parCat).map(([k, v]) => [catDep(k)[2], r2(v)]) };
  imprimer(`<div class="rp"><h1>${esc(act().nom)} — rapport ${esc(ds.lib)}</h1><div class="sub">Du ${fmtDate(ds.debut)} au ${fmtDate(ds.fin)} · généré le ${fmtDate(today())} avec NaoFactu</div>
    ${tablePrint(resume)}${tablePrint(cats)}${tablePrint(D.factures)}${tablePrint(D.depenses)}<div class="disc">${AVERT_COMPTA}</div></div>`, 'Rapport ' + ds.lib);
};
ACT.exportJustifs = () => {
  const f = lireForm(el('ex-f')), deps = mine(S.depenses).filter(d => d.date >= f.debut && d.date <= f.fin && !(d.prevue && !d.payee));
  const c = csv(['Date', 'Fournisseur', 'Montant TTC', 'Justificatif'], deps.map(d => [fmtDate(d.date), d.fournisseur || '', depTTC(d), d.justificatif ? d.justificatif.nom : 'MANQUANT']));
  telecharger(`NaoFactu_justificatifs_${f.debut}_${f.fin}.csv`, c, 'text/csv;charset=utf-8'); toast('Liste téléchargée — les fichiers eux-mêmes sont dans Documents → Justificatifs.');
};

/* ================= Fiches de paie ================= */
function devinerMois(nom) {
  const s = nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let m = s.match(/(20\d\d)[-_. ]?(0[1-9]|1[0-2])/); if (m) return m[1] + '-' + m[2];
  m = s.match(/(0[1-9]|1[0-2])[-_. ]?(20\d\d)/); if (m) return m[2] + '-' + m[1];
  const i = MOIS.findIndex(x => s.includes(x.normalize('NFD').replace(/[̀-ͯ]/g, '')));
  const y = (s.match(/20\d\d/) || [])[0];
  if (i >= 0) return (y || today().slice(0, 4)) + '-' + pad(i + 1);
  const d = new Date(); d.setMonth(d.getMonth() - 1); return isoDate(d).slice(0, 7);
}
function formPaie(x, fichier) {
  const nouveau = !x || !S.paies.includes(x);
  const derniers = S.paies.slice(-1)[0] || {};
  x = x || { id: uid(), mois: fichier ? devinerMois(fichier.name) : devinerMois(''), employeur: derniers.employeur || '', net: '', brut: '' };
  let f = fichier || null, retirer = false;
  modal({ titre: nouveau ? '💼 Nouvelle fiche de paie' : '💼 ' + fmtMois(x.mois), corps: `
    <p class="mini" style="margin-top:0">Saisissez les montants tels qu'ils figurent sur votre bulletin — NaoFactu ne les calcule pas.</p><div class="form">
    ${champ('employeur', 'Employeur', x.employeur, { req: true })}${champ('mois', 'Mois concerné', x.mois, { type: 'month', req: true })}
    ${champ('datePaiement', 'Date de paiement', x.datePaiement, { type: 'date' })}
    ${champ('net', 'Montant net (saisi)', x.net, { type: 'number', step: '0.01', num: true })}${champ('brut', 'Montant brut (saisi)', x.brut, { type: 'number', step: '0.01', num: true })}
    ${champ('notes', 'Notes', x.notes, { type: 'textarea', full: true, ph: 'Prime, congés, régularisation…' })}
    <div class="fl full"><span>Document joint</span><div class="row-acts" id="pa-j"></div></div></div>`,
    onOpen: b => { const peindre = () => { const j = f ? { nom: f.name } : (retirer ? null : x.doc);
      $('#pa-j', b).innerHTML = (j ? `<span class="tag">📄 ${esc(j.nom)}</span>` : '') + (j && !f ? '<button class="btn sm" type="button" data-j="voir">Ouvrir</button><button class="btn sm danger" type="button" data-j="suppr">🗑️ Retirer le document</button>' : '') + `<button class="btn sm lav" type="button" data-j="ajout">${j ? 'Remplacer' : '📎 Joindre le bulletin (PDF, photo)'}</button>`;
      $$('[data-j]', b).forEach(y => y.onclick = async () => { if (y.dataset.j === 'voir') ouvrirFichier(x.doc); else if (y.dataset.j === 'suppr') { retirer = true; peindre(); }
        else { const fs = await choisirFichiers({ accept: 'application/pdf,image/*' }); if (fs[0]) { f = fs[0]; peindre(); } } }); }; peindre(); },
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async c => { if (await confirmer('Supprimer cette fiche de paie et son document ?', 'Supprimer', true)) {
      if (x.doc) IDB.del(x.doc.id); S.paies = S.paies.filter(y => y.id !== x.id); sauver(); c(); rendre(); } } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: async (c, b) => {
        if (manque(b)) return; Object.assign(x, lireForm(b));
        if (retirer && x.doc && !f) { IDB.del(x.doc.id); x.doc = null; } if (f) { if (x.doc) IDB.del(x.doc.id); x.doc = await stockerFichier(f); }
        if (nouveau) S.paies.push(x); sauver(); c(); toast('Fiche de paie rangée.'); go('paies', { t: 'classement', an: x.mois.slice(0, 4) }); } }].filter(Boolean) });
}
ACT.importerPaie = async () => {
  const fs = await choisirFichiers({ accept: 'application/pdf,image/*', multiple: true });
  if (!fs.length) return;
  if (fs.length === 1) { formPaie(null, fs[0]); return; }
  const employeur = (S.paies.slice(-1)[0] || {}).employeur || '';
  for (const f of fs) S.paies.push({ id: uid(), mois: devinerMois(f.name), employeur, net: '', brut: '', doc: await stockerFichier(f), notes: 'Importé depuis ' + f.name });
  sauver(); toast(fs.length + ' bulletins importés — complétez les montants si vous le souhaitez.', 4000); go('paies', { t: 'classement' });
};
ACT.editerPaie = ds => formPaie(byId(S.paies, ds.id));
ACT.voirPaie = ds => ouvrirFichier(byId(S.paies, ds.id).doc);
ACT.rappelPaie = () => formRappel(null, { type: 'paie', titre: 'Transmettre les bulletins de paie' });

/* ================= Rappels ================= */
function formRappel(r, defaut = {}) {
  const nouveau = !r; r = r || Object.assign({ id: uid(), activiteId: S.activiteId, date: addDays(today(), 7), type: 'admin', titre: '' }, defaut);
  modal({ titre: nouveau ? '⏰ Nouveau rappel' : '⏰ Rappel', taille: 'narrow', corps: `<div class="form">
    ${champ('titre', 'Intitulé', r.titre, { req: true, full: true, ph: 'Déclaration Urssaf, envoyer les relevés au comptable…' })}
    ${champ('date', 'Date', r.date, { type: 'date' })}${champ('type', 'Type', r.type, { type: 'select', options: [['admin', '🏛️ Échéance administrative'], ['document', '📄 Document à transmettre'], ['paie', '💼 Paie'], ['depense', '🛒 Dépense'], ['facture', '🧾 Facture']] })}
    ${champ('notes', 'Notes', r.notes, { type: 'textarea', full: true })}${!nouveau ? champ('fait', 'Fait ✓', r.fait, { type: 'check', full: true }) : ''}</div>`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: c => { S.rappels = S.rappels.filter(x => x.id !== r.id); sauver(); c(); rendre(); } } : null,
      !nouveau && !r.fait ? { lab: '✓ Marquer comme fait', fn: c => { r.fait = true; sauver(); c(); rendre(); } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: (c, b) => { if (manque(b)) return; Object.assign(r, lireForm(b)); if (nouveau) S.rappels.push(r); sauver(); c(); toast('Rappel enregistré.'); rendre(); } }].filter(Boolean) });
}
ACT.nouveauRappel = () => formRappel();
ACT.editerRappel = ds => formRappel(byId(S.rappels, ds.id));

/* ================= Documents ================= */
VUES.documents = (root, p) => {
  const c = p.c || 'aclasser', docs = mine(S.documents);
  const virtuels = {
    clients: mine(S.factures).filter(f => f.numero).map(f => ({ virt: 'facture', id: f.id, nom: `${TYPES_FACTURE[f.type]} ${f.numero} — ${clientNom(f.clientId)}`, date: f.date })),
    justificatifs: mine(S.depenses).filter(d => d.justificatif).map(d => ({ virt: 'depense', id: d.id, nom: d.justificatif.nom, date: d.date, sous: (d.fournisseur || '') + ' · ' + money(depTTC(d)) }))
  };
  const dossiers = [['aclasser', '📥', 'À classer'], ...CAT_DOCS];
  const compte = k => k === 'aclasser' ? aClasser().length : docs.filter(d => d.categorie === k && !d.aClasser).length + (virtuels[k] || []).length;
  const liste = c === 'aclasser' ? docs.filter(d => d.aClasser) : [...docs.filter(d => d.categorie === c && !d.aClasser), ...(virtuels[c] || [])];
  liste.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  root.innerHTML = entete('🗂️', 'Documents comptables', 'Factures, justificatifs, relevés et exports — rangés au même endroit.') + `
  <div class="folders">${dossiers.map(([k, e, l]) => `<button class="folder glass ${c === k ? 'on' : ''}" data-go="documents" data-p="${P({ c: k })}"><span class="em">${e}</span><b>${l}</b><small>${compte(k)} élément(s)</small></button>`).join('')}</div>
  <div class="drop" id="doc-drop"><b>Déposez vos fichiers ici</b>ou cliquez pour les choisir — ils iront dans « ${esc((dossiers.find(d => d[0] === c) || [])[2])} ».</div>
  <div class="card glass" style="margin-top:18px"><div class="bd flush">
    ${c === 'aclasser' ? aClasser().filter(x => x.dep).map(x => `<div class="li click" data-do="editerDepense" data-id="${x.dep.id}"><div class="thumb-f">⚠️</div><div class="tx"><b>${esc(x.titre)}</b><small>${esc(x.sous)} — cliquez pour joindre le justificatif</small></div></div>`).join('') : ''}
    ${liste.map(d => `<div class="li"><div class="thumb-f">${d.virt === 'facture' ? '🧾' : d.virt === 'depense' ? '📎' : /pdf/.test((d.fichier || {}).type) ? '📕' : /image/.test((d.fichier || {}).type) ? '🖼️' : '📄'}</div>
      <div class="tx"><b>${esc(d.nom)}</b><small>${fmtDate(d.date)}${d.sous ? ' · ' + esc(d.sous) : ''}${d.notes ? ' · ' + esc(d.notes) : ''}</small></div>
      ${d.virt === 'facture' ? `<button class="btn sm" data-do="apercuFacture" data-id="${d.id}">Ouvrir</button>` : d.virt === 'depense' ? `<button class="btn sm" data-do="voirJustif" data-id="${d.id}">Ouvrir</button>`
        : `<button class="btn sm" data-do="ouvrirDoc" data-id="${d.id}">Ouvrir</button><select class="in" data-classer="${d.id}" style="width:auto;padding:5px 8px;font-size:12px">
          <option value="">${d.aClasser ? 'Ranger dans…' : 'Déplacer…'}</option>${CAT_DOCS.map(([k, e, l]) => `<option value="${k}">${e} ${l}</option>`).join('')}</select>
          <button class="btn sm danger" data-do="supprDoc" data-id="${d.id}">🗑️</button>`}</div>`).join('')}
    ${!liste.length && !(c === 'aclasser' && aClasser().length) ? `<div class="empty">${c === 'aclasser' ? 'Rien à classer. ✨' : 'Ce dossier est vide.'}</div>` : ''}
  </div></div>`;
  const drop = el('doc-drop');
  const deposer = async files => { for (const f of files) S.documents.push({ id: uid(), activiteId: S.activiteId, categorie: c === 'aclasser' ? 'autres' : c, aClasser: c === 'aclasser', nom: f.name, date: today(), fichier: await stockerFichier(f) });
    sauver(); toast(files.length + ' document(s) ajouté(s).'); rendre(); };
  drop.onclick = async () => { const fs = await choisirFichiers({ multiple: true }); if (fs.length) deposer(fs); };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); const fs = Array.from(e.dataTransfer.files || []); if (fs.length) deposer(fs); };
  $$('[data-classer]', root).forEach(s => s.onchange = () => { if (!s.value) return; const d = byId(S.documents, s.dataset.classer); d.categorie = s.value; d.aClasser = false; sauver(); toast('Rangé dans ' + catDoc(s.value)[2] + '.'); rendre(); });
};
ACT.ouvrirDoc = ds => ouvrirFichier(byId(S.documents, ds.id).fichier);
ACT.apercuFacture = ds => apercu(byId(S.factures, ds.id), 'facture');
ACT.supprDoc = async ds => { const d = byId(S.documents, ds.id); if (await confirmer('Supprimer « ' + esc(d.nom) + ' » ?', 'Supprimer', true)) { if (d.fichier) IDB.del(d.fichier.id); S.documents = S.documents.filter(x => x.id !== d.id); sauver(); rendre(); } };

/* ================= Calendrier des échéances ================= */
VUES.calendrier = (root, p) => {
  const base = p.m ? parseISO(p.m + '-01') : parseISO(today().slice(0, 7) + '-01');
  const y = base.getFullYear(), m = base.getMonth(), premier = new Date(y, m, 1), decal = (premier.getDay() + 6) % 7;
  const debut = new Date(y, m, 1 - decal), fin = new Date(debut); fin.setDate(fin.getDate() + 41);
  const ev = evenements(isoDate(debut), isoDate(fin)), auj = today();
  const prec = isoDate(new Date(y, m - 1, 1)).slice(0, 7), suiv = isoDate(new Date(y, m + 1, 1)).slice(0, 7);
  let cases = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(debut); d.setDate(d.getDate() + i); const s = isoDate(d), du = ev.filter(e => e.date === s);
    cases += `<div class="day ${d.getMonth() !== m ? 'out' : ''} ${s === auj ? 'today' : ''}"><span class="n">${d.getDate()}</span>${du.slice(0, 4).map(e => `<div class="ev ${e.type}" data-ev="${ev.indexOf(e)}" title="${esc(e.titre)}">${esc(e.titre)}</div>`).join('')}${du.length > 4 ? `<span class="mini">+${du.length - 4}</span>` : ''}</div>`;
  }
  const retards = evenements(null, addDays(auj, -1)).filter(e => e.type === 'retard' || e.rappel);
  const avenir = evenements(auj, addDays(auj, 45));
  root.innerHTML = entete('📅', 'Calendrier des échéances', 'Factures à relancer, paiements attendus, dépenses prévues, contrats et documents à transmettre.', '<button class="btn primary" data-do="nouveauRappel">➕ Ajouter un rappel</button>') + `
  <div class="card glass"><div class="hd"><button class="btn sm" data-go="calendrier" data-p="${P({ m: prec })}">‹</button><h3 style="min-width:170px;justify-content:center">${MOIS[m].replace(/^./, c => c.toUpperCase())} ${y}</h3>
    <button class="btn sm" data-go="calendrier" data-p="${P({ m: suiv })}">›</button><button class="btn sm" data-go="calendrier">Aujourd'hui</button></div>
    <div class="bd"><div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => `<div class="dow">${d}</div>`).join('')}${cases}</div>
    <div class="legend"><span><i style="background:var(--info)"></i>Paiement attendu</span><span><i style="background:var(--danger)"></i>Retard / relance</span><span><i style="background:var(--warning)"></i>Dépense prévue</span>
      <span><i style="background:var(--success)"></i>Facture récurrente</span><span><i style="background:var(--accent-3)"></i>Entretien</span><span><i style="background:var(--danger);opacity:.5"></i>Contrat</span><span><i style="background:var(--ink-3)"></i>Rappel &amp; administratif</span></div></div></div>
  <div class="grid2">
    <div class="card glass"><div class="hd"><h3><span class="em">🚨</span>En retard / à traiter</h3></div><div class="bd flush">${retards.map(ligneEvenement).join('') || '<div class="empty">Rien en retard.</div>'}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🔮</span>45 prochains jours</h3></div><div class="bd flush">${avenir.map(ligneEvenement).join('') || '<div class="empty">Rien de prévu.</div>'}</div></div></div>`;
  $$('[data-ev]', root).forEach(x => x.onclick = () => { const e = ev[+x.dataset.ev], tmp = document.createElement('div'); tmp.innerHTML = ligneEvenement(e); tmp.firstElementChild.style.display = 'none'; root.appendChild(tmp); tmp.firstElementChild.click(); tmp.remove(); });
};

/* ================= Paramètres ================= */
VUES.reglages = (root, p) => {
  const t = p.t || 'activite', a = act();
  root.innerHTML = entete('⚙️', 'Paramètres', 'Votre activité, vos documents, vos sauvegardes.') +
    onglets([['activite', '🏷️ Mon activité'], ['activites', '🗃️ Activités'], ['numerotation', '#️⃣ Numérotation'], ['relances', '🔔 Relances & rappels'], ['donnees', '💾 Sauvegarde'], ['vider', '🧹 Remise à zéro']], t) + '<div id="rg-body"></div>';
  $$('[data-tab]', root).forEach(b => b.onclick = () => go('reglages', { t: b.dataset.tab }));
  const body = el('rg-body');
  if (t === 'activite') {
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">🏷️</span>Profil de l'activité</h3><span class="hint">Ces informations apparaissent sur vos devis et factures.</span></div><div class="bd" id="rg-f">
      <div class="row-acts" style="margin-bottom:16px"><div class="thumb-f" style="width:70px;height:70px;border-radius:16px;overflow:hidden">${a.logo ? `<img src="${a.logo}" style="width:100%;height:100%;object-fit:contain;background:#fff">` : '🖼️'}</div>
        <button class="btn" data-do="logo">📷 ${a.logo ? 'Changer le logo' : 'Ajouter un logo'}</button>${a.logo ? '<button class="btn danger" data-do="logoSuppr">Retirer</button>' : ''}</div>
      <div class="fsec">Identité</div><div class="form">${champ('nom', "Nom de l'activité", a.nom, { req: true })}${champ('forme', 'Forme', a.forme, { ph: 'Entrepreneur individuel, SAS, association…' })}
        ${champ('siret', "Numéro d'identification (SIRET…)", a.siret, { aide: '(si souhaité)' })}${champ('tvaIntra', 'N° de TVA intracommunautaire', a.tvaIntra, { aide: '(si applicable)' })}
        ${champ('rcs', 'RCS / RM / autre immatriculation', a.rcs, { aide: '(facultatif)' })}${champ('metier', 'Métier / activité exercée', a.metier, { ph: 'design graphique, menuiserie…' })}
        ${champ('representant', 'Représentant légal (signataire)', a.representant)}${champ('qualiteRep', 'En qualité de', a.qualiteRep, { ph: 'Gérant(e), Président(e)…' })}</div>
      <div class="fsec">Employeur (contrats de travail, bulletins de paie)</div><div class="form">
        ${champ('ape', 'Code APE / NAF', a.ape)}${champ('urssaf', "N° d'employeur Urssaf", a.urssaf)}${champ('convention', 'Convention collective (nom et IDCC)', a.convention, { two: true })}
        ${champ('caisseRetraite', 'Caisse de retraite complémentaire', a.caisseRetraite)}${champ('mutuelle', 'Organisme de complémentaire santé', a.mutuelle)}</div>
      <div class="fsec">Apparence des documents</div>
      <div class="fl" style="margin-bottom:12px"><span>Couleur des devis, factures, contrats et bulletins</span><div class="swatches" id="rg-coul">${COULEURS_DOC.map(x => `<button type="button" data-c="${x}" class="${a.couleurDoc === x ? 'on' : ''}" style="background:${x}"></button>`).join('')}
        <input type="color" name="couleurDoc" value="${esc(a.couleurDoc || '#5B43AD')}"></div></div>
      <div class="form">${champ('styleDoc', 'Mise en page des contrats', a.styleDoc, { type: 'select', options: [['classique', 'Classique'], ['moderne', 'Moderne'], ['elegant', 'Élégante']] })}</div>
      <div class="fsec">Coordonnées</div><div class="form">${champ('adresse', 'Adresse', a.adresse, { two: true })}${champ('cp', 'Code postal', a.cp)}${champ('ville', 'Ville', a.ville)}
        ${champ('pays', 'Pays', a.pays)}${champ('email', 'E-mail', a.email, { type: 'email' })}${champ('tel', 'Téléphone', a.tel)}${champ('site', 'Site internet', a.site)}</div>
      <div class="fsec">Coordonnées bancaires</div><div class="form">${champ('iban', 'IBAN', a.iban, { two: true })}${champ('bic', 'BIC', a.bic)}${champ('banque', 'Banque', a.banque)}${champ('titulaire', 'Titulaire du compte', a.titulaire)}</div>
      <div class="fsec">TVA</div><div class="form">${champ('tvaNonApplicable', "Je ne facture pas la TVA (franchise en base, association non assujettie…)", a.tvaNonApplicable, { type: 'check', full: true })}
        ${champ('mentionTva', 'Mention affichée dans ce cas', a.mentionTva, { full: true })}</div>
      <div class="note" style="margin-top:12px"><span class="ic">ℹ️</span><div>Le régime de TVA et les mentions à faire figurer dépendent de votre situation : faites-les valider par votre expert-comptable ou le service des impôts.</div></div>
      <div class="fsec">Conditions & mentions</div><div class="form">
        ${champ('delaiPaiement', 'Délai de paiement par défaut (jours)', a.delaiPaiement, { type: 'number', num: true })}${champ('validiteDevis', 'Validité des devis (jours)', a.validiteDevis, { type: 'number', num: true })}
        ${champ('conditions', 'Conditions de paiement', a.conditions, { type: 'textarea', full: true })}
        ${champ('penalites', 'Pénalités de retard & indemnité de recouvrement', a.penalites, { type: 'textarea', full: true })}
        ${champ('noteDevis', 'Mention des devis', a.noteDevis, { type: 'textarea', full: true, aide: '— {validite} = durée en jours' })}
        ${champ('mentions', 'Mentions personnalisées (pied de page)', a.mentions, { type: 'textarea', full: true, ph: 'Assurance professionnelle, dispense d\'immatriculation…' })}
        ${champ('signature', 'Signature des e-mails', a.signature, { type: 'textarea', full: true, ph: a.nom })}</div>
      <button class="btn primary big" style="margin-top:16px" data-do="sauverActivite">💾 Enregistrer le profil</button></div></div>`;
    $$('#rg-coul [data-c]').forEach(b => b.onclick = () => { $('#rg-coul [name="couleurDoc"]').value = b.dataset.c; $$('#rg-coul [data-c]').forEach(x => x.classList.toggle('on', x === b)); });
  }
  if (t === 'activites') {
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">🗃️</span>Mes activités</h3><button class="btn primary right" data-do="ajouterActivite">➕ Ajouter une activité</button></div><div class="bd flush">
      ${S.activites.map(x => `<div class="li"><div class="thumb-f">${x.logo ? `<img src="${x.logo}" style="width:100%;height:100%;object-fit:contain;border-radius:9px;background:#fff">` : '🏷️'}</div>
        <div class="tx"><b>${esc(x.nom)}</b><small>${S.factures.filter(f => f.activiteId === x.id).length} facture(s) · ${S.clients.filter(c => c.activiteId === x.id).length} client(s)</small></div>
        ${x.id === S.activiteId ? '<span class="pill payee">Active</span>' : `<button class="btn sm" data-do="choisirActivite" data-id="${x.id}">Utiliser</button>`}
        ${S.activites.length > 1 ? `<button class="btn sm danger" data-do="supprActivite" data-id="${x.id}">🗑️</button>` : ''}</div>`).join('')}</div></div>
      <p class="mini">Chaque activité a ses propres clients, catalogue, devis, factures, dépenses, contrats et sa propre numérotation. Les fiches de paie sont communes.</p>`;
  }
  if (t === 'numerotation') {
    const n = a.numerotation;
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">#️⃣</span>Numérotation chronologique</h3></div><div class="bd" id="rg-n">
      <p class="mini" style="margin-top:0">Codes disponibles : <kbd>{AAAA}</kbd> année, <kbd>{AA}</kbd> année courte, <kbd>{MM}</kbd> mois, <kbd>{NUM}</kbd> compteur. Les factures reçoivent leur numéro à la validation, sans trou ni doublon.</p>
      <div class="form">${champ('devis', 'Modèle des devis', n.devis)}${champ('facture', 'Modèle des factures', n.facture)}${champ('avoir', 'Modèle des avoirs', n.avoir)}
        ${champ('chiffres', 'Chiffres du compteur', n.chiffres, { type: 'number', num: true })}${champ('annuel', 'Repartir de 1 chaque année', n.annuel, { type: 'check', full: true })}</div>
      <div class="fsec">Prochains numéros</div><div class="hstat" id="rg-prev"></div>
      <div class="fsec">Compteurs de l'année (${today().slice(0, 4)})</div><div class="form">${['devis', 'facture', 'avoir'].map(k => champ('c_' + k, 'Dernier ' + k + ' émis', a.compteurs[k][cleCompteur(a, today())] || 0, { type: 'number', num: true, aide: '(reprise d\'un autre logiciel)' })).join('')}</div>
      <button class="btn primary" style="margin-top:14px" data-do="sauverNumeros">💾 Enregistrer</button></div></div>`;
    const prev = () => { const f = lireForm(el('rg-n')), tmp = Object.assign(clone(a), { numerotation: Object.assign({}, n, f) });
      ['devis', 'facture', 'avoir'].forEach(k => tmp.compteurs[k][cleCompteur(tmp, today())] = f['c_' + k]);
      el('rg-prev').innerHTML = ['devis', 'facture', 'avoir'].map(k => `<div><div class="l">${k}</div><div class="v" style="font-size:15px">${esc(prochainNumero(k, today(), tmp))}</div></div>`).join(''); };
    $$('#rg-n [name]').forEach(i => i.oninput = prev); prev();
  }
  if (t === 'relances') {
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">⏰</span>Rappels automatiques</h3></div><div class="bd"><div class="form" id="rg-r">
      ${champ('rappelAvant', "Me rappeler une facture X jours avant l'échéance", S.reglages.rappelAvant, { type: 'number', num: true })}
      ${champ('relanceApres', 'Proposer une nouvelle relance tous les X jours', S.reglages.relanceApres, { type: 'number', num: true })}</div>
      <button class="btn sm" style="margin-top:10px" data-do="sauverRappels">Enregistrer</button></div></div>
      <div class="card glass"><div class="hd"><h3><span class="em">🔔</span>Modèles de relance</h3><span class="hint">Variables : {client} {numero} {montant} {restant} {echeance} {jours} {activite} {signature}</span>
        <button class="btn sm right" data-do="nouvelleRelance">➕ Modèle</button></div><div class="bd" id="rg-rl">
      ${S.relances.map(r => `<div class="form" data-rl="${r.id}" style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--border)">${champ('nom', 'Nom du modèle', r.nom)}${champ('sujet', 'Objet', r.sujet, { two: true })}
        ${champ('corps', 'Message', r.corps, { type: 'textarea', full: true, cls: 'long' })}<div class="full"><button class="btn sm danger" data-do="supprRelance" data-id="${r.id}">Supprimer ce modèle</button></div></div>`).join('')}
      <button class="btn primary" data-do="sauverRelances">💾 Enregistrer les modèles</button></div></div>`;
  }
  if (t === 'donnees') {
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">💾</span>Sauvegarde</h3></div><div class="bd">
      <p style="margin-top:0">Vos données sont enregistrées dans ce navigateur, sur cet ordinateur — aucun compte, aucun serveur. Faites régulièrement une sauvegarde :
        elle contient tout, <b>documents joints compris</b>, dans un seul fichier <kbd>.json</kbd>.</p>
      <div class="row-acts"><button class="btn primary" data-do="sauvegarder">💾 Télécharger une sauvegarde</button><button class="btn" data-do="restaurer">📂 Restaurer une sauvegarde</button>
        <button class="btn" data-go="reglages" data-p="${P({ t: 'vider' })}">🧹 Remise à zéro…</button></div></div></div>
      <div class="card glass"><div class="hd"><h3><span class="em">♻️</span>Réinitialiser l'outil</h3></div><div class="bd">
      <p style="margin-top:0">Remet NaoFactu à neuf, exactement comme pour un nouvel utilisateur : toutes les données, documents joints, réglages et le thème sont effacés.</p>
      <button class="btn danger" data-do="reinitialiser">♻️ Réinitialiser l'outil</button></div></div>`;
  }
  if (t === 'vider') {
    const cats = RUBRIQUES_VIDABLES.map(r => ({ r, n: r.compte(false), nTout: r.compte(true) }));
    body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">🧹</span>Remettre à zéro</h3><span class="hint">Choisissez ce que vous voulez effacer — le reste est conservé.</span></div><div class="bd" id="vz">
      <div class="note warn"><span class="ic">⚠️</span><div>La suppression est <b>définitive</b> (documents joints compris). Téléchargez une sauvegarde avant si vous voulez pouvoir revenir en arrière.
        <button class="btn sm" data-do="sauvegarder" style="margin-left:6px">💾 Sauvegarder d'abord</button></div></div>
      <div class="row-acts" style="margin-bottom:14px"><label class="ck"><input type="radio" name="vz-portee" value="act" checked> Activité « ${esc(act().nom)} » seulement</label>
        ${S.activites.length > 1 ? '<label class="ck"><input type="radio" name="vz-portee" value="tout"> Toutes les activités</label>' : ''}</div>
      <div class="folders" id="vz-l">${cats.map(({ r, n, nTout }) => `<label class="folder glass" style="cursor:pointer"><input type="checkbox" value="${r.k}" style="float:right;width:17px;height:17px;accent-color:var(--danger)">
        <span class="em">${r.e}</span><b>${r.l}</b><small data-n="${r.k}" data-a="${n}" data-t="${nTout}">${n} élément(s)</small></label>`).join('')}</div>
      <div class="row-acts"><button class="btn sm" id="vz-all">Tout cocher</button>
        <label class="ck"><input type="checkbox" id="vz-cpt"> Remettre aussi les compteurs de numérotation à zéro (devis, factures, avoirs, contrats)</label></div>
      <div class="row-acts" style="margin-top:16px"><button class="btn danger big" data-do="viderSelection">🧹 Effacer la sélection</button>
        <span class="spacer"></span><button class="btn danger" data-do="reinitialiser">♻️ Réinitialiser l'outil (comme un nouvel utilisateur)</button></div></div></div>`;
    $$('[name="vz-portee"]').forEach(x => x.onchange = () => $$('#vz-l [data-n]').forEach(s => s.textContent = (x.value === 'tout' && x.checked ? s.dataset.t : s.dataset.a) + ' élément(s)'));
    el('vz-all').onclick = () => { const cks = $$('#vz-l input'), tous = cks.every(c => c.checked); cks.forEach(c => c.checked = !tous); };
  }
};

/* ---------- Remise à zéro sélective ---------- */
const RUBRIQUES_VIDABLES = [
  { k: 'devis', e: '📝', l: 'Devis', listes: ['devis'] },
  { k: 'factures', e: '🧾', l: 'Factures, avoirs, paiements & récurrences', listes: ['factures', 'recurrences'], paiements: true },
  { k: 'clients', e: '👥', l: 'Clients', listes: ['clients'] },
  { k: 'catalogue', e: '📦', l: 'Catalogue', listes: ['catalogue'] },
  { k: 'depenses', e: '🛒', l: 'Dépenses & justificatifs', listes: ['depenses'], fichiers: ['justificatif'] },
  { k: 'contrats', e: '✍️', l: 'Contrats', listes: ['contrats'], fichiers: ['signe'] },
  { k: 'recrutement', e: '🧑‍🤝‍🧑', l: 'Recrutements (postes & candidats)', listes: ['postes', 'candidats'], fichiers: ['cv'] },
  { k: 'documents', e: '🗂️', l: 'Documents comptables', listes: ['documents'], fichiers: ['fichier'] },
  { k: 'bulletins', e: '💼', l: 'Bulletins édités & salariés', listes: ['bulletins', 'salaries'] },
  { k: 'paies', e: '📥', l: 'Fiches de paie rangées', listes: ['paies'], fichiers: ['doc'], global: true },
  { k: 'rappels', e: '⏰', l: 'Rappels', listes: ['rappels'], global: true }
].map(r => Object.assign(r, {
  filtre(tout) { return x => tout || r.global || !x.activiteId || x.activiteId === S.activiteId; },
  compte(tout) { return sum(r.listes, k => S[k].filter(r.filtre(tout)).length); }
}));
ACT.viderSelection = async () => {
  const choix = $$('#vz-l input:checked').map(c => c.value), tout = ($('[name="vz-portee"]:checked') || {}).value === 'tout', cpt = el('vz-cpt').checked;
  if (!choix.length && !cpt) { toast('Cochez au moins une rubrique.'); return; }
  const rubs = RUBRIQUES_VIDABLES.filter(r => choix.includes(r.k)), total = sum(rubs, r => r.compte(tout));
  if (!await confirmer(`Effacer définitivement <b>${total} élément(s)</b> : ${rubs.map(r => r.l.toLowerCase()).join(', ') || 'aucune rubrique'}${cpt ? ', et remettre les compteurs à zéro' : ''} ?`, 'Effacer', true)) return;
  for (const r of rubs) for (const k of r.listes) {
    const garder = [], f = r.filtre(tout);
    for (const x of S[k]) {
      if (!f(x)) { garder.push(x); continue; }
      for (const champF of r.fichiers || []) if (x[champF] && x[champF].id) IDB.del(x[champF].id);
      if (r.paiements) S.paiements = S.paiements.filter(p => p.factureId !== x.id);
      if (k === 'bulletins') S.paies = S.paies.filter(p => p.bulletinId !== x.id);
    }
    S[k] = garder;
  }
  if (cpt) (tout ? S.activites : [act()]).forEach(a => { a.compteurs = { devis: {}, facture: {}, avoir: {}, contrat: {} }; });
  EDIT = null; CED = null; BED = null; sauver(); toast('Remise à zéro effectuée.'); rendre();
};
ACT.logo = async () => {
  const [f] = await choisirFichiers({ accept: 'image/*' }); if (!f) return;
  const img = new Image(), url = URL.createObjectURL(f);
  img.onload = () => { const k = Math.min(1, 360 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    act().logo = c.toDataURL(/png|svg/.test(f.type) ? 'image/png' : 'image/jpeg', .9); URL.revokeObjectURL(url); sauver(); toast('Logo ajouté.'); rendre(); };
  img.src = url;
};
ACT.logoSuppr = () => { act().logo = ''; sauver(); rendre(); };
ACT.sauverActivite = () => { const b = el('rg-f'); if (manque(b)) return; Object.assign(act(), lireForm(b)); S.reglages.bienvenue = false; sauver(); toast('Profil enregistré.'); rendre(); };
ACT.ajouterActivite = async () => { const n = await demander('Nouvelle activité', "Nom de l'activité"); if (!n) return;
  const a = activiteDefaut(n); S.activites.push(a); S.activiteId = a.id; sauver(); toast('Activité créée — complétez son profil.'); go('reglages', { t: 'activite' }); };
ACT.choisirActivite = ds => { S.activiteId = ds.id; sauver(); rendre(); };
ACT.supprActivite = async ds => {
  const a = byId(S.activites, ds.id), n = ['clients', 'devis', 'factures', 'depenses', 'contrats', 'candidats'].reduce((t, k) => t + S[k].filter(x => x.activiteId === a.id).length, 0);
  if (n) { toast('Cette activité contient encore des données : elle ne peut pas être supprimée.'); return; }
  if (await confirmer('Supprimer l\'activité « ' + esc(a.nom) + ' » ?', 'Supprimer', true)) { S.activites = S.activites.filter(x => x.id !== a.id); if (S.activiteId === a.id) S.activiteId = S.activites[0].id; sauver(); rendre(); }
};
ACT.sauverNumeros = () => { const a = act(), f = lireForm(el('rg-n'));
  ['devis', 'facture', 'avoir', 'chiffres', 'annuel'].forEach(k => a.numerotation[k] = f[k]);
  ['devis', 'facture', 'avoir'].forEach(k => a.compteurs[k][cleCompteur(a, today())] = f['c_' + k]); sauver(); toast('Numérotation enregistrée.'); rendre(); };
ACT.sauverRappels = () => { Object.assign(S.reglages, lireForm(el('rg-r'))); sauver(); toast('Enregistré.'); };
ACT.sauverRelances = () => { $$('[data-rl]').forEach(f => Object.assign(byId(S.relances, f.dataset.rl), lireForm(f))); sauver(); toast('Modèles enregistrés.'); };
ACT.nouvelleRelance = () => { S.relances.push({ id: uid(), nom: 'Nouveau modèle', sujet: 'Facture {numero}', corps: 'Bonjour {client},\n\n\n{signature}' }); sauver(); rendre(); };
ACT.supprRelance = ds => { if (S.relances.length < 2) { toast('Gardez au moins un modèle.'); return; } S.relances = S.relances.filter(r => r.id !== ds.id); sauver(); rendre(); };
ACT.sauvegarder = async () => {
  const fichiers = {}; for (const k of await IDB.keys()) fichiers[k] = await IDB.get(k);
  telecharger(`NaoFactu_sauvegarde_${today()}.json`, JSON.stringify({ naofactu: 1, date: new Date().toISOString(), etat: S, fichiers }), 'application/json');
  toast('Sauvegarde téléchargée.');
};
ACT.restaurer = async () => {
  const [f] = await choisirFichiers({ accept: '.json,application/json' }); if (!f) return;
  try {
    const o = JSON.parse(await f.text()); if (!o.naofactu || !o.etat) throw new Error('format');
    if (!await confirmer('Remplacer toutes les données actuelles par cette sauvegarde du ' + fmtDate((o.date || '').slice(0, 10)) + ' ?', 'Restaurer', true)) return;
    await IDB.clear(); for (const [k, v] of Object.entries(o.fichiers || {})) await IDB.put(k, v);
    S = migrer(o.etat); localStorage.setItem(STORE, JSON.stringify(S)); toast('Sauvegarde restaurée.'); go('accueil');
  } catch (e) { toast('Ce fichier n\'est pas une sauvegarde NaoFactu valide.'); }
};
/* ---------- Réinitialiser : NaoFactu redevient exactement ce qu'un nouvel utilisateur découvre ----------
   Rien n'est gardé : activités, données, documents joints, modèles personnalisés, réglages, thème. */
ACT.reinitialiser = () => {
  modal({ titre: '♻️ Réinitialiser NaoFactu', taille: 'narrow', corps: `
    <p style="margin-top:0;line-height:1.6">L'outil sera remis à neuf, <b>comme pour un nouvel utilisateur</b>. Tout sera effacé :
      profil et logo des activités, clients, catalogue, devis, factures, paiements, dépenses, documents joints, fiches de paie, bulletins et salariés,
      recrutements, contrats et modèles personnalisés, rappels, réglages et thème.</p>
    <div class="note warn"><span class="ic">💾</span><div><b>Conseil :</b> téléchargez d'abord une sauvegarde — vous pourrez tout retrouver avec
      Paramètres → Sauvegarde → Restaurer.</div></div>
    <label class="fl"><span>Pour confirmer, écrivez <b>EFFACER</b></span><input class="in" id="ri-mot" autocomplete="off"></label>`,
    pied: ['|', { lab: 'Annuler', fn: c => c() },
      { lab: '💾 Sauvegarder, puis réinitialiser', fn: (c, b) => reinitialiserOutil(c, b, true) },
      { lab: '♻️ Réinitialiser', cls: 'danger primary', fn: (c, b) => reinitialiserOutil(c, b, false) }] });
};
ACT.toutEffacer = ACT.reinitialiser;
async function reinitialiserOutil(fermer, box, sauvegarderAvant) {
  const mot = $('#ri-mot', box);
  if (mot.value.trim().toUpperCase() !== 'EFFACER') { toast('✏️ Écrivez EFFACER pour confirmer.'); mot.focus(); return; }
  if (sauvegarderAvant) { try { await ACT.sauvegarder(); } catch (e) {} }
  fermer();
  clearTimeout(_saveT); EDIT = null; CED = null; BED = null; QUITTER = null;
  try { await IDB.clear(); } catch (e) {}
  try { localStorage.removeItem(STORE); localStorage.removeItem(THEME_KEY); } catch (e) {}
  document.documentElement.removeAttribute('data-theme');
  S = etatDefaut();
  toast('♻️ NaoFactu est remis à neuf.');
  // on recharge : l'outil s'ouvre exactement comme à la première visite (accueil de bienvenue compris)
  setTimeout(() => location.reload(), sauvegarderAvant ? 1200 : 600);
}
