/* ============================================================
   NaoFactu — la paie : salariés, édition de bulletins de paie
   (bulletin clarifié), grille de cotisations, classement.
   Les calculs suivent la structure légale du bulletin ; les taux
   de la grille sont indicatifs et doivent être vérifiés.
   ============================================================ */
'use strict';

/* ---------- Le calcul d'un bulletin ---------- */
const aValeur = v => v !== undefined && v !== null && String(v).trim() !== '';
function calcBulletin(b) {
  const PASS = num(b.pass || S.reglages.pass || 4005);
  const remu = (b.remu || []).map(l => Object.assign({}, l, { m: aValeur(l.base) && aValeur(l.taux) ? r2(num(l.base) * num(l.taux)) : r2(num(l.montant)) }));
  const brut = r2(sum(remu, l => l.m));
  const T1 = Math.min(Math.max(brut, 0), PASS), T2 = Math.max(0, Math.min(brut, 8 * PASS) - PASS);
  const cot = (b.cotis || []).filter(c => c.actif !== false).map(c => Object.assign({}, c));
  const patSante = r2(sum(cot.filter(c => c.base === 'forfait' && c.mutuelle), c => num(c.montantPat)));
  const bases = { brut, T1, T2, T1T2: T1 + T2, csg: r2(brut * 0.9825 + patSante) };
  cot.forEach(c => {
    if (c.base === 'forfait') { c.b = null; c.ms = r2(num(c.montantSal)); c.mp = r2(num(c.montantPat)); }
    else { c.b = r2(bases[c.base] || 0); c.ms = r2(c.b * num(c.sal) / 100); c.mp = r2(c.b * num(c.pat) / 100); }
  });
  const cotSal = r2(sum(cot, c => c.ms)), cotPat = r2(sum(cot, c => c.mp));
  const netAvantImpot = r2(brut - cotSal);
  const nonDed = r2(sum(cot.filter(c => c.nonDed), c => c.ms));
  const netImposable = r2(Math.max(0, netAvantImpot + nonDed + patSante - num(b.exoIR)));
  const pas = r2(netImposable * num(b.pasTaux) / 100);
  const autres = (b.autres || []).map(l => Object.assign({}, l, { m: r2(num(l.montant)) }));
  const totAutres = r2(sum(autres, l => l.m));
  const netPaye = r2(netAvantImpot - pas + totAutres);
  return { PASS, remu, brut, cot, bases, cotSal, cotPat, netAvantImpot, netSocial: netAvantImpot, nonDed, patSante, netImposable, pas, autres, totAutres, netPaye, cout: r2(brut + cotPat) };
}
const salarie = id => byId(S.salaries, id);
const nomSalarie = s => s ? [s.prenom, s.nom].filter(Boolean).join(' ') : 'Salarié supprimé';
function cumuls(b) {
  const an = (b.mois || '').slice(0, 4);
  const liste = S.bulletins.filter(x => x.salarieId === b.salarieId && (x.mois || '').slice(0, 4) === an && x.mois <= b.mois && (x.statut === 'valide' || x.id === b.id));
  if (!liste.some(x => x.id === b.id)) liste.push(b);
  const cs = liste.map(calcBulletin);
  return { brut: r2(sum(cs, c => c.brut)), netImposable: r2(sum(cs, c => c.netImposable)), pas: r2(sum(cs, c => c.pas)), heures: r2(sum(liste, x => num(x.heures))), cout: r2(sum(cs, c => c.cout)) };
}

/* ---------- Création d'un bulletin ---------- */
function nouveauBulletin(salarieId, mois) {
  const s = salarie(salarieId), a = act();
  const prec = S.bulletins.filter(x => x.salarieId === salarieId && x.mois < mois).sort((x, y) => y.mois.localeCompare(x.mois))[0];
  const [y, m] = mois.split('-').map(Number), fin = isoDate(new Date(y, m, 0));
  const b = { id: uid(), activiteId: a.id, salarieId, mois, debut: mois + '-01', fin, datePaiement: fin, statut: 'brouillon',
    heures: s.heuresMensuelles || 151.67, pasTaux: s.pasTaux || 0, moyen: 'Virement', exoIR: 0, notes: '' };
  if (prec) {
    Object.assign(b, { remu: clone(prec.remu).filter(l => l.fixe !== false), cotis: clone(prec.cotis), autres: clone(prec.autres || []).filter(l => l.recurrent) });
    b.cpN1Acquis = prec.cpN1Acquis; b.cpN1Pris = prec.cpN1Pris; b.cpNAcquis = r2(num(prec.cpNAcquis) + 2.5); b.cpNPris = prec.cpNPris;
  } else {
    b.remu = [num(s.tauxHoraire) ? { libelle: 'Salaire de base', base: s.heuresMensuelles || 151.67, taux: num(s.tauxHoraire), fixe: true }
      : { libelle: 'Salaire de base', base: '', taux: '', montant: num(s.salaireBase), fixe: true }];
    b.cotis = S.reglages.cotisations.filter(c => c.actif !== false && (!c.cadre || s.statut === 'cadre')).map(c => Object.assign(clone(c), c.mutuelle ? { montantSal: num(s.mutuelleSal), montantPat: num(s.mutuellePat) } : {}));
    b.autres = num(s.transport) ? [{ libelle: 'Remboursement des frais de transport (50 %)', montant: num(s.transport), recurrent: true }] : [];
    b.cpN1Acquis = 0; b.cpN1Pris = 0; b.cpNAcquis = 2.5; b.cpNPris = 0;
  }
  return b;
}

/* ---------- Le bulletin imprimé ---------- */
function rendreBulletin(b) {
  const a = byId(S.activites, b.activiteId) || act(), s = salarie(b.salarieId) || {}, k = calcBulletin(b), cu = cumuls(b);
  const N3 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }), tx = v => aValeur(v) && num(v) ? N3.format(num(v)) : '';
  const N2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), eur = v => v ? N2.format(r2(v)) : '';
  const cotVis = k.cot.filter(c => c.ms || c.mp), cats = [...new Set(cotVis.map(c => c.cat))];
  const lignesCot = cats.map(cat => `<tr class="cat"><td colspan="6">${esc(cat)}</td></tr>` + cotVis.filter(c => c.cat === cat).map(c =>
    `<tr><td>${esc(c.libelle)}</td><td>${c.b === null ? '' : eur(c.b)}</td><td>${c.base === 'forfait' ? '' : tx(c.sal)}</td><td>${eur(c.ms)}</td><td>${c.base === 'forfait' ? '' : tx(c.pat)}</td><td>${eur(c.mp)}</td></tr>`).join('')).join('');
  return `<div class="bul" style="--dc:${esc(a.couleurDoc || '#5B43AD')}">
    <div class="b-top"><div><h1>Bulletin de paie</h1><div style="color:#6a6480">Période du ${fmtDate(b.debut)} au ${fmtDate(b.fin)}</div></div>
      <div class="per"><b>${esc(fmtMois(b.mois))}</b><br>Paiement le ${fmtDate(b.datePaiement)} par ${esc((b.moyen || 'virement').toLowerCase())}</div></div>
    <div class="b-id">
      <div>${a.logo ? `<img src="${a.logo}" alt="">` : ''}<div class="lb">Employeur</div><div class="nm">${esc(a.nom)}</div>${adresseBloc(a)}
        ${a.siret ? '<br>SIRET : ' + esc(a.siret) : ''}${a.ape ? ' · Code APE : ' + esc(a.ape) : ''}${a.urssaf ? '<br>N° Urssaf : ' + esc(a.urssaf) : ''}
        <br>Convention collective : ${esc(a.convention || 'aucune')}</div>
      <div><div class="lb">Salarié(e)</div><div class="nm">${esc([s.civilite, nomSalarie(s)].filter(Boolean).join(' '))}</div>${adresseBloc(s)}
        ${s.nss ? '<br>N° de sécurité sociale : ' + esc(s.nss) : ''}${s.matricule ? ' · Matricule : ' + esc(s.matricule) : ''}
        <br>Emploi : ${esc(s.emploi || '')}${s.classification ? ' · Classification : ' + esc(s.classification) : ''}
        <br>Statut : ${esc(s.statut || 'non-cadre')} · ${esc(s.contrat || 'CDI')} · Entrée le ${fmtDate(s.dateEntree)}${b.heures ? ' · ' + eur(num(b.heures)) + ' h' : ''}</div>
    </div>
    <table class="b-l"><thead><tr><th>Éléments de paie</th><th>Base</th><th>Taux sal.</th><th>Part salarié</th><th>Taux empl.</th><th>Part employeur</th></tr></thead><tbody>
      ${k.remu.map(l => `<tr><td>${esc(l.libelle)}</td><td>${aValeur(l.base) ? eur(num(l.base)) : ''}</td><td>${aValeur(l.taux) ? tx(l.taux) : ''}</td><td>${eur(l.m)}</td><td></td><td></td></tr>`).join('')}
      <tr class="gros"><td>Salaire brut</td><td></td><td></td><td>${eur(k.brut)}</td><td></td><td></td></tr>
      ${lignesCot}
      <tr class="tot"><td>Total des cotisations et contributions</td><td></td><td></td><td>${eur(k.cotSal)}</td><td></td><td>${eur(k.cotPat)}</td></tr>
      <tr class="gros"><td>Net à payer avant impôt sur le revenu</td><td></td><td></td><td>${eur(k.netAvantImpot)}</td><td></td><td></td></tr>
      <tr class="cat"><td colspan="6">Impôt sur le revenu</td></tr>
      <tr><td>Net imposable</td><td></td><td></td><td>${eur(k.netImposable)}</td><td></td><td></td></tr>
      <tr><td>Impôt sur le revenu prélevé à la source (taux ${b.pasTaux ? eur(num(b.pasTaux)) + ' %' : 'non personnalisé'})</td><td>${eur(k.netImposable)}</td><td>${eur(num(b.pasTaux))}</td><td>${eur(k.pas)}</td><td></td><td></td></tr>
      ${k.autres.length ? `<tr class="cat"><td colspan="6">Autres éléments (non soumis à cotisations)</td></tr>` + k.autres.map(l => `<tr><td>${esc(l.libelle)}</td><td></td><td></td><td>${eur(l.m)}</td><td></td><td></td></tr>`).join('') : ''}
    </tbody></table>
    <div class="b-net">
      <div><div class="l">Net à payer avant impôt</div><div class="v">${money(k.netAvantImpot)}</div></div>
      <div><div class="l">Montant net social</div><div class="v">${money(k.netSocial)}</div></div>
      <div class="paye"><div class="l">Net payé</div><div class="v">${money(k.netPaye)}</div></div>
    </div>
    <div class="b-bas">
      <table><tr><th>Cumuls ${esc(b.mois.slice(0, 4))}</th><th>Salaire brut</th><th>Net imposable</th><th>Impôt prélevé</th><th>Heures</th></tr>
        <tr><td>Depuis janvier</td><td>${eur(cu.brut)}</td><td>${eur(cu.netImposable)}</td><td>${eur(cu.pas)}</td><td>${eur(cu.heures)}</td></tr></table>
      <table><tr><th>Congés payés (jours)</th><th>Acquis</th><th>Pris</th><th>Solde</th></tr>
        <tr><td>N-1</td><td>${eur(num(b.cpN1Acquis))}</td><td>${eur(num(b.cpN1Pris))}</td><td>${eur(num(b.cpN1Acquis) - num(b.cpN1Pris))}</td></tr>
        <tr><td>N</td><td>${eur(num(b.cpNAcquis))}</td><td>${eur(num(b.cpNPris))}</td><td>${eur(num(b.cpNAcquis) - num(b.cpNPris))}</td></tr></table>
    </div>
    <div class="b-mentions">Coût total pour l'employeur : <b>${money(k.cout)}</b> (salaire brut ${money(k.brut)} + cotisations patronales ${money(k.cotPat)}).
      Plafond mensuel de la sécurité sociale retenu : ${money(k.PASS)}.${b.notes ? '<br>' + esc(b.notes) : ''}
      <br><b>Dans votre intérêt et pour vous aider à faire valoir vos droits, conservez ce bulletin de paie sans limitation de durée.</b>
      <br>Pour plus d'informations sur le bulletin de paie, consultez la rubrique dédiée sur le portail www.service-public.fr.</div>
  </div>`;
}
const nomBulletin = b => ('Bulletin ' + b.mois + ' - ' + nomSalarie(salarie(b.salarieId))).replace(/[\\/:*?"<>|]/g, '-');
function apercuBulletin(b) {
  modal({ titre: '💼 Bulletin — ' + esc(nomSalarie(salarie(b.salarieId))), sous: fmtMois(b.mois) + (b.statut === 'valide' ? ' · validé' : ' · brouillon'), taille: 'wide',
    corps: `<div class="paper-wrap"><div class="paper">${rendreBulletin(b)}</div></div>`,
    pied: ['|', { lab: 'Fermer', fn: x => x() }, { lab: '📄 Télécharger en PDF', cls: 'primary', fn: () => imprimer(`<div class="paper">${rendreBulletin(b)}</div>`, nomBulletin(b)) }] });
}

/* ================= La rubrique ================= */
VUES.paies = (root, p) => {
  const t = p.t || 'bulletins';
  root.innerHTML = entete('💼', 'Fiches de paie & salaires', 'Éditer vos bulletins, ranger ceux que vous recevez, suivre vos salariés.',
    '<button class="btn" data-do="rappelPaie">⏰ Rappel</button><button class="btn" data-do="importerPaie">📥 Importer une fiche de paie</button><button class="btn primary" data-do="nouveauBulletin">➕ Nouveau bulletin</button>') + `
  <div class="note warn"><span class="ic">⚠️</span><div><b>Édition de bulletins :</b> NaoFactu met en forme un bulletin selon la structure légale (bulletin « clarifié ») et fait les calculs
    à partir de la <b>grille de cotisations</b>. Les taux fournis sont <b>indicatifs</b> : ils changent chaque année et dépendent de votre effectif, de votre taux accident
    du travail, de votre convention collective, des réductions applicables (réduction générale…). Vérifiez-les sur urssaf.fr ou avec votre expert-comptable avant de remettre
    un bulletin. L'outil ne fait ni la <b>DSN</b>, ni le paiement des cotisations.</div></div>
  ${onglets([['bulletins', '🧾 Bulletins édités'], ['classement', '🗂️ Classement des fiches'], ['salaries', '👤 Salariés'], ['grille', '🧮 Grille de cotisations']], t)}
  <div id="pa-body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => go('paies', { t: b.dataset.tab }));
  const body = el('pa-body');
  if (t === 'bulletins') vueBulletins(body, p);
  if (t === 'classement') vueClassement(body, p);
  if (t === 'salaries') vueSalaries(body);
  if (t === 'grille') vueGrille(body);
};
function vueBulletins(body, p) {
  const an = p.an || today().slice(0, 4), liste = mine(S.bulletins).filter(b => b.mois.slice(0, 4) === an).sort((a, b) => b.mois.localeCompare(a.mois) || nomSalarie(salarie(a.salarieId)).localeCompare(nomSalarie(salarie(b.salarieId))));
  const ans = [...new Set([today().slice(0, 4), ...mine(S.bulletins).map(b => b.mois.slice(0, 4))])].sort().reverse();
  const cs = liste.map(calcBulletin);
  body.innerHTML = `<div class="filters">${ans.map(a => `<button class="chip ${a === an ? 'on' : ''}" data-go="paies" data-p="${P({ t: 'bulletins', an: a })}">${a}</button>`).join('')}</div>
    <div class="kpis"><div class="kpi glass"><div class="lab">Bulletins ${an}</div><div class="val">${liste.length}</div><div class="sub">${liste.filter(b => b.statut === 'valide').length} validé(s)</div></div>
      <div class="kpi glass ok"><div class="lab">Total net payé</div><div class="val">${money(sum(cs, c => c.netPaye))}</div></div>
      <div class="kpi glass blue"><div class="lab">Total brut</div><div class="val">${money(sum(cs, c => c.brut))}</div></div>
      <div class="kpi glass warn"><div class="lab">Coût employeur</div><div class="val">${money(sum(cs, c => c.cout))}</div></div></div>
    ${!mine(S.salaries).length ? `<div class="note lav"><span class="ic">👤</span><div>Pour éditer un bulletin, commencez par créer la fiche d'un salarié.
      <button class="btn sm primary" data-do="nouveauSalarie" style="margin-left:6px">Créer un salarié</button></div></div>` : ''}
    <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Mois</th><th>Salarié</th><th class="r">Brut</th><th class="r">Net payé</th><th class="r">Coût employeur</th><th>État</th><th></th></tr></thead><tbody>
    ${liste.map((b, i) => `<tr class="click" data-do="ouvrirBulletin" data-id="${b.id}"><td><b>${fmtMois(b.mois)}</b></td><td>${esc(nomSalarie(salarie(b.salarieId)))}</td>
      <td class="r num">${money(cs[i].brut)}</td><td class="r num"><b>${money(cs[i].netPaye)}</b></td><td class="r num muted">${money(cs[i].cout)}</td>
      <td>${b.statut === 'valide' ? '<span class="pill payee">Validé</span>' : '<span class="pill brouillon">Brouillon</span>'}</td>
      <td class="acts"><button class="btn sm" data-do="pdfBulletin" data-id="${b.id}" title="PDF">📄</button><button class="btn sm danger" data-do="supprBulletin" data-id="${b.id}" title="Supprimer">🗑️</button></td></tr>`).join('')
      || '<tr><td colspan="7"><div class="empty">Aucun bulletin édité pour ' + an + '.</div></td></tr>'}</tbody></table></div></div>`;
}
function vueClassement(body, p) {
  const an = p.an || today().slice(0, 4), toutes = S.paies;
  const ans = [...new Set([today().slice(0, 4), ...toutes.map(x => (x.mois || '').slice(0, 4)).filter(Boolean)])].sort().reverse();
  const liste = toutes.filter(x => (x.mois || '').slice(0, 4) === an).sort((a, b) => b.mois.localeCompare(a.mois));
  const rappels = S.rappels.filter(r => r.type === 'paie' && !r.fait).sort((a, b) => a.date.localeCompare(b.date));
  body.innerHTML = `<div class="filters">${ans.map(a => `<button class="chip ${a === an ? 'on' : ''}" data-go="paies" data-p="${P({ t: 'classement', an: a })}">${a}</button>`).join('')}
    <div class="right row-acts"><button class="btn sm danger" id="pc-sel" disabled>🗑️ Supprimer la sélection</button></div></div>
  <div class="kpis"><div class="kpi glass"><div class="lab">Fiches ${an}</div><div class="val">${liste.length}</div></div>
    <div class="kpi glass ok"><div class="lab">Total net</div><div class="val">${money(sum(liste, x => num(x.net)))}</div></div>
    <div class="kpi glass blue"><div class="lab">Total brut</div><div class="val">${money(sum(liste, x => num(x.brut)))}</div></div></div>
  <div class="grid2" style="grid-template-columns:2fr 1fr">
    <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th style="width:34px"><input type="checkbox" id="pc-all" title="Tout sélectionner" style="width:16px;height:16px;accent-color:var(--accent)"></th>
      <th>Mois</th><th>Employeur</th><th>Payé le</th><th class="r">Net</th><th class="r">Brut</th><th class="c">Document</th><th></th></tr></thead><tbody>
    ${liste.map(x => `<tr><td><input type="checkbox" class="pc-ck" value="${x.id}" style="width:16px;height:16px;accent-color:var(--accent)"></td>
      <td class="click" data-do="editerPaie" data-id="${x.id}" style="cursor:pointer"><b>${fmtMois(x.mois)}</b>${x.notes ? `<div class="mini">${esc(x.notes)}</div>` : ''}</td><td>${esc(x.employeur || '')}</td>
      <td>${fmtDate(x.datePaiement)}</td><td class="r num">${aValeur(x.net) ? money(x.net) : '<span class="muted">—</span>'}</td><td class="r num muted">${x.brut ? money(x.brut) : '—'}</td>
      <td class="c">${x.doc || x.bulletinId ? `<button class="btn sm" data-do="voirPaie" data-id="${x.id}" title="Ouvrir">📄</button>` : '<span class="mini">—</span>'}</td>
      <td class="acts"><button class="btn sm" data-do="editerPaie" data-id="${x.id}" title="Modifier">✏️</button><button class="btn sm danger" data-do="supprPaie" data-id="${x.id}" title="Supprimer la fiche et son document">🗑️</button></td></tr>`).join('')
      || '<tr><td colspan="8"><div class="empty">Aucune fiche rangée pour ' + an + '.</div></td></tr>'}</tbody></table></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">⏰</span>Rappels</h3></div><div class="bd flush">
      ${rappels.map(r => ligneEvenement({ date: r.date, type: 'paie', cible: ['rappel', r.id], titre: r.titre })).join('') || '<div class="empty">Aucun rappel.</div>'}</div></div></div>`;
  const maj = () => { const n = $$('.pc-ck:checked', body).length, b = el('pc-sel'); b.disabled = !n; b.textContent = n ? `🗑️ Supprimer la sélection (${n})` : '🗑️ Supprimer la sélection'; };
  $$('.pc-ck', body).forEach(c => c.onchange = maj);
  el('pc-all').onchange = e => { $$('.pc-ck', body).forEach(c => c.checked = e.target.checked); maj(); };
  el('pc-sel').onclick = async () => { const ids = $$('.pc-ck:checked', body).map(c => c.value);
    if (!await confirmer(`Supprimer ${ids.length} fiche(s) de paie et leurs documents joints ? Cette action est définitive.`, 'Supprimer', true)) return;
    supprimerPaies(ids); toast(ids.length + ' fiche(s) supprimée(s).'); rendre(); };
}
function supprimerPaies(ids) {
  for (const id of ids) { const x = byId(S.paies, id); if (x && x.doc) IDB.del(x.doc.id); }
  S.paies = S.paies.filter(x => !ids.includes(x.id)); sauver();
}
ACT.supprPaie = async ds => { const x = byId(S.paies, ds.id);
  if (await confirmer(`Supprimer la fiche de ${esc(fmtMois(x.mois))}${x.doc ? ' et son document « ' + esc(x.doc.nom) + ' »' : ''} ?`, 'Supprimer', true)) { supprimerPaies([x.id]); toast('Fiche supprimée.'); rendre(); } };
ACT.voirPaie = ds => { const x = byId(S.paies, ds.id), b = x.bulletinId && byId(S.bulletins, x.bulletinId); if (b) apercuBulletin(b); else ouvrirFichier(x.doc); };

/* ---------- Salariés ---------- */
function vueSalaries(body) {
  const liste = mine(S.salaries).sort((a, b) => nomSalarie(a).localeCompare(nomSalarie(b)));
  body.innerHTML = `<div class="row-acts" style="margin-bottom:14px"><button class="btn primary" data-do="nouveauSalarie">➕ Nouveau salarié</button></div>
    <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Salarié</th><th>Emploi</th><th>Contrat</th><th>Entrée</th><th class="r">Salaire de base</th><th>État</th></tr></thead><tbody>
    ${liste.map(s => `<tr class="click" data-do="editerSalarie" data-id="${s.id}"><td><b>${esc(nomSalarie(s))}</b><div class="mini">${esc(s.matricule || '')}</div></td><td>${esc(s.emploi || '')}<div class="mini">${esc(s.statut || '')}</div></td>
      <td>${esc(s.contrat || '')}</td><td>${fmtDate(s.dateEntree)}</td><td class="r num">${num(s.tauxHoraire) ? NUM.format(num(s.tauxHoraire)) + ' €/h' : money(s.salaireBase)}</td>
      <td>${s.dateSortie && s.dateSortie < today() ? '<span class="pill brouillon">Sorti</span>' : '<span class="pill payee">Actif</span>'}</td></tr>`).join('')
      || '<tr><td colspan="6"><div class="empty">Aucun salarié.</div></td></tr>'}</tbody></table></div></div>`;
}
function formSalarie(s, apres) {
  const nouveau = !s; s = s || { id: uid(), activiteId: S.activiteId, statut: 'non-cadre', contrat: 'CDI', heuresMensuelles: 151.67, dateEntree: today(), civilite: 'Mme' };
  modal({ titre: nouveau ? '👤 Nouveau salarié' : '👤 ' + esc(nomSalarie(s)), taille: 'wide', corps: `<div class="fsec">Identité</div><div class="form">
    ${champ('civilite', 'Civilité', s.civilite, { type: 'select', options: ['Mme', 'M.', ''] })}${champ('prenom', 'Prénom', s.prenom, { req: true })}${champ('nom', 'Nom', s.nom, { req: true })}
    ${champ('matricule', 'Matricule', s.matricule)}${champ('nss', 'N° de sécurité sociale', s.nss)}${champ('dateNaissance', 'Date de naissance', s.dateNaissance, { type: 'date' })}
    ${champ('adresse', 'Adresse', s.adresse, { two: true })}${champ('cp', 'Code postal', s.cp)}${champ('ville', 'Ville', s.ville)}${champ('email', 'E-mail', s.email, { type: 'email' })}</div>
    <div class="fsec">Emploi</div><div class="form">
    ${champ('emploi', 'Emploi', s.emploi, { req: true })}${champ('classification', 'Classification / coefficient', s.classification)}
    ${champ('statut', 'Statut', s.statut, { type: 'select', options: ['non-cadre', 'agent de maîtrise', 'cadre'] })}${champ('contrat', 'Contrat', s.contrat, { type: 'select', options: ['CDI', 'CDD', 'Apprentissage', 'Professionnalisation', 'Autre'] })}
    ${champ('dateEntree', "Date d'entrée", s.dateEntree, { type: 'date' })}${champ('dateSortie', 'Date de sortie', s.dateSortie, { type: 'date' })}</div>
    <div class="fsec">Rémunération par défaut</div><div class="form">
    ${champ('heuresMensuelles', 'Heures mensuelles', s.heuresMensuelles, { type: 'number', step: '0.01', num: true, aide: '(151,67 = 35 h/sem.)' })}
    ${champ('tauxHoraire', 'Taux horaire brut (€)', s.tauxHoraire, { type: 'number', step: '0.0001', num: true, aide: '— ou —' })}
    ${champ('salaireBase', 'Salaire mensuel brut (€)', s.salaireBase, { type: 'number', step: '0.01', num: true })}
    ${champ('pasTaux', 'Taux de prélèvement à la source (%)', s.pasTaux, { type: 'number', step: '0.1', num: true, aide: '(transmis par l\'administration)' })}
    ${champ('mutuelleSal', 'Mutuelle — part salarié (€)', s.mutuelleSal, { type: 'number', step: '0.01', num: true })}${champ('mutuellePat', 'Mutuelle — part employeur (€)', s.mutuellePat, { type: 'number', step: '0.01', num: true })}
    ${champ('transport', 'Remboursement transport / mois (€)', s.transport, { type: 'number', step: '0.01', num: true })}
    ${champ('notes', 'Notes', s.notes, { type: 'textarea', full: true })}</div>`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async c => {
      const n = S.bulletins.filter(b => b.salarieId === s.id).length;
      if (await confirmer(`Supprimer la fiche de ${esc(nomSalarie(s))}${n ? ` et ses ${n} bulletin(s)` : ''} ?`, 'Supprimer', true)) {
        S.bulletins = S.bulletins.filter(b => b.salarieId !== s.id); S.salaries = S.salaries.filter(x => x.id !== s.id); sauver(); c(); rendre(); } } } : null,
      !nouveau ? { lab: '🧾 Nouveau bulletin', fn: c => { c(); choisirMoisBulletin(s.id); } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: (c, b) => { if (manque(b)) return; Object.assign(s, lireForm(b));
        if (nouveau) S.salaries.push(s); sauver(); c(); toast('Salarié enregistré.'); if (apres) apres(s); else rendre(); } }].filter(Boolean) });
}
ACT.nouveauSalarie = () => formSalarie();
ACT.editerSalarie = ds => formSalarie(salarie(ds.id));
function salarieDepuisContrat(c) {
  const [prenom, ...reste] = (c.partie || '').split(' ');
  const existe = mine(S.salaries).find(s => nomSalarie(s).toLowerCase() === (c.partie || '').toLowerCase());
  if (existe) { toast('Ce salarié existe déjà — fiche ouverte.'); formSalarie(existe); return; }
  const mensuel = c.periodicite !== 'horaire';
  formSalarie(null);
  setTimeout(() => { const b = $('.modal-bg:last-child'); if (!b) return;
    const set = (n, v) => { const i = $(`[name="${n}"]`, b); if (i && v != null && v !== '') i.value = v; };
    set('prenom', prenom); set('nom', reste.join(' ')); set('emploi', c.emploi || c.objet); set('classification', c.classification); set('statut', c.statutSal);
    set('contrat', c.type === 'cdd' ? 'CDD' : c.type === 'alternance' ? 'Apprentissage' : 'CDI'); set('dateEntree', c.debut); set('dateSortie', c.fin); set('nss', c.partieNss);
    set('dateNaissance', c.partieNaissance); set('adresse', c.partieAdresse); set('email', c.partieEmail);
    if (c.horaire) set('heuresMensuelles', r2(num(c.horaire) * 52 / 12));
    if (c.montant) set(mensuel ? 'salaireBase' : 'tauxHoraire', c.montant);
  }, 60);
}

/* ---------- Grille de cotisations ---------- */
function vueGrille(body) {
  const g = S.reglages.cotisations;
  body.innerHTML = `<div class="card glass"><div class="hd"><h3><span class="em">🧮</span>Grille de cotisations</h3>
    <span class="hint">Utilisée pour chaque nouveau bulletin (les bulletins existants gardent leurs taux).</span>
    <div class="right row-acts"><button class="btn sm" data-do="ajoutCotis">➕ Ligne</button><button class="btn sm" data-do="grilleDefaut">↺ Grille d'origine</button></div></div>
    <div class="bd"><div class="form" style="max-width:520px" id="gr-p">${champ('pass', 'Plafond mensuel de la sécurité sociale (€)', S.reglages.pass, { type: 'number', step: '1', num: true, aide: '(à vérifier chaque 1er janvier)' })}</div>
    <div class="note" style="margin:14px 0"><span class="ic">ℹ️</span><div>Taux en % de la base. <b>Base</b> : brut, tranche 1 (jusqu'au plafond), tranche 2 (de 1 à 8 plafonds),
      CSG (98,25 % du brut + part patronale santé) ou montant fixe. Taux indicatifs pour une entreprise de moins de 11 salariés :
      <b>vérifiez-les</b> (taux AT/MP notifié, réduction générale, effectif, convention collective) sur urssaf.fr ou avec votre expert-comptable.</div></div></div>
    <div class="bd flush tblwrap"><table class="t" id="gr-t"><thead><tr><th>Actif</th><th>Catégorie</th><th>Libellé</th><th>Base</th><th class="r">Taux salarié %</th><th class="r">Taux employeur %</th><th>Cadres seulement</th><th>Non déductible IR</th><th></th></tr></thead><tbody>
    ${g.map((c, i) => `<tr data-gi="${i}"><td><input type="checkbox" data-k="actif" ${c.actif !== false ? 'checked' : ''}></td>
      <td><input class="in" data-k="cat" value="${esc(c.cat)}" style="min-width:130px"></td><td><input class="in" data-k="libelle" value="${esc(c.libelle)}" style="min-width:240px"></td>
      <td><select class="in" data-k="base">${[['brut', 'Brut'], ['T1', 'Tranche 1'], ['T2', 'Tranche 2'], ['T1T2', 'T1 + T2'], ['csg', 'Base CSG'], ['forfait', 'Montant fixe']].map(([k, l]) => `<option value="${k}" ${c.base === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
      <td><input class="in num" data-k="sal" type="number" step="0.001" value="${c.sal}" style="width:90px"></td><td><input class="in num" data-k="pat" type="number" step="0.001" value="${c.pat}" style="width:90px"></td>
      <td class="c"><input type="checkbox" data-k="cadre" ${c.cadre ? 'checked' : ''}></td><td class="c"><input type="checkbox" data-k="nonDed" ${c.nonDed ? 'checked' : ''}></td>
      <td><button class="btn sm danger" data-do="supprCotis" data-i="${i}">✕</button></td></tr>`).join('')}</tbody></table></div>
    <div class="bd"><button class="btn primary" data-do="sauverGrille">💾 Enregistrer la grille</button></div></div>`;
}
function lireGrille() {
  $$('#gr-t tr[data-gi]').forEach(tr => { const c = S.reglages.cotisations[+tr.dataset.gi];
    $$('[data-k]', tr).forEach(i => { c[i.dataset.k] = i.type === 'checkbox' ? i.checked : ['sal', 'pat'].includes(i.dataset.k) ? num(i.value) : i.value; }); });
  S.reglages.pass = num($('#gr-p [name="pass"]').value) || S.reglages.pass;
}
ACT.sauverGrille = () => { lireGrille(); sauver(); toast('Grille enregistrée.'); };
ACT.ajoutCotis = () => { lireGrille(); S.reglages.cotisations.push({ id: uid(), cat: 'Autres', libelle: 'Nouvelle ligne', base: 'brut', sal: 0, pat: 0, actif: true }); sauver(); rendre(); };
ACT.supprCotis = ds => { lireGrille(); S.reglages.cotisations.splice(+ds.i, 1); sauver(); rendre(); };
ACT.grilleDefaut = async () => { if (await confirmer("Remplacer la grille par la grille d'origine de NaoFactu ?", 'Remplacer')) { S.reglages.cotisations = grilleDefaut(); sauver(); rendre(); } };

/* ================= L'éditeur de bulletin ================= */
let BED = null;
function choisirMoisBulletin(salarieId) {
  const sals = mine(S.salaries).filter(s => !s.dateSortie || s.dateSortie >= today().slice(0, 7) + '-01');
  if (!sals.length) { toast('Créez d\'abord la fiche d\'un salarié.'); formSalarie(); return; }
  const d = new Date(); const moisDefaut = isoDate(d).slice(0, 7);
  modal({ titre: '🧾 Nouveau bulletin', taille: 'narrow', corps: `<div class="form">${champ('salarieId', 'Salarié', salarieId || sals[0].id, { type: 'select', full: true, options: sals.map(s => [s.id, nomSalarie(s)]) })}
    ${champ('mois', 'Mois', moisDefaut, { type: 'month', full: true })}</div>
    <p class="mini">S'il existe un bulletin du mois précédent, ses éléments sont repris (salaire, cotisations, congés).</p>`,
    pied: ['|', { lab: 'Annuler', fn: x => x() }, { lab: 'Créer →', cls: 'primary', fn: (x, b) => { const f = lireForm(b); if (!f.mois) return;
      const deja = S.bulletins.find(k => k.salarieId === f.salarieId && k.mois === f.mois);
      if (deja) { x(); toast('Un bulletin existe déjà pour ce mois — il est ouvert.'); BED = { b: clone(deja), nouveau: false, sale: false }; go('bulletin'); return; }
      x(); BED = { b: nouveauBulletin(f.salarieId, f.mois), nouveau: true, sale: true }; go('bulletin'); } }] });
}
ACT.nouveauBulletin = () => choisirMoisBulletin();
ACT.ouvrirBulletin = ds => { BED = { b: clone(byId(S.bulletins, ds.id)), nouveau: false, sale: false }; go('bulletin'); };
ACT.pdfBulletin = ds => { const b = byId(S.bulletins, ds.id); imprimer(`<div class="paper">${rendreBulletin(b)}</div>`, nomBulletin(b)); };
ACT.supprBulletin = async ds => { const b = byId(S.bulletins, ds.id);
  if (!await confirmer(`Supprimer le bulletin de ${esc(fmtMois(b.mois))} de ${esc(nomSalarie(salarie(b.salarieId)))} ?`, 'Supprimer', true)) return;
  S.bulletins = S.bulletins.filter(x => x.id !== b.id); S.paies = S.paies.filter(x => x.bulletinId !== b.id); sauver(); rendre(); };

VUES.bulletin = root => {
  if (!BED) { go('paies'); return; }
  const b = BED.b, s = salarie(b.salarieId) || {};
  root.innerHTML = entete('🧾', 'Bulletin de ' + esc(fmtMois(b.mois)), esc(nomSalarie(s)) + ' · ' + esc(s.emploi || '') + ' · ' + (b.statut === 'valide' ? '<span class="pill payee">Validé</span>' : '<span class="pill brouillon">Brouillon</span>'),
    '<button class="btn" data-go="paies">← Bulletins</button>') + `
  <div class="ed-grid"><div id="bf">
    <div class="card glass"><div class="hd"><h3><span class="em">📅</span>Période et paiement</h3></div><div class="bd"><div class="form" id="bf-tete">
      ${champ('debut', 'Période du', b.debut, { type: 'date' })}${champ('fin', 'au', b.fin, { type: 'date' })}${champ('datePaiement', 'Payé le', b.datePaiement, { type: 'date' })}
      ${champ('moyen', 'Moyen de paiement', b.moyen, { type: 'select', options: ['Virement', 'Chèque', 'Espèces'] })}
      ${champ('heures', 'Heures payées', b.heures, { type: 'number', step: '0.01' })}${champ('pasTaux', 'Taux PAS (%)', b.pasTaux, { type: 'number', step: '0.1' })}
      ${champ('exoIR', "Montant exonéré d'impôt (€)", b.exoIR, { type: 'number', step: '0.01', aide: '(heures sup…)' })}${champ('pass', 'Plafond SS (€)', b.pass || S.reglages.pass, { type: 'number' })}</div></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">💶</span>Éléments de rémunération</h3>
      <div class="right row-acts">${[['hs25', '+ Heures sup. 25 %'], ['hs50', '+ Heures sup. 50 %'], ['prime', '+ Prime'], ['absence', '+ Absence'], ['libre', '+ Ligne']].map(([k, l]) => `<button class="btn sm" data-do="bRemu" data-k="${k}">${l}</button>`).join('')}</div></div>
      <div class="bd tblwrap"><table class="lines" id="bf-remu"></table><p class="mini">Remplissez « Nombre/base » et « Taux » pour un calcul automatique, ou seulement « Montant ». Une absence se saisit en montant négatif.</p></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🏛️</span>Cotisations et contributions</h3><span class="hint">Taux modifiables pour ce bulletin</span>
      <div class="right row-acts"><button class="btn sm" data-do="bCotisLigne">+ Ligne (réduction, prévoyance…)</button><button class="btn sm" data-do="bGrille">↺ Recharger la grille</button></div></div>
      <div class="bd tblwrap"><table class="lines" id="bf-cot"></table></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">➕</span>Autres éléments (non soumis à cotisations)</h3><button class="btn sm right" data-do="bAutre">+ Ligne</button></div>
      <div class="bd tblwrap"><table class="lines" id="bf-aut"></table><p class="mini">Remboursement de transport, frais professionnels, acompte déjà versé (en négatif)…</p></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🌴</span>Congés payés et notes</h3></div><div class="bd"><div class="form" id="bf-cp">
      ${champ('cpN1Acquis', 'N-1 acquis', b.cpN1Acquis, { type: 'number', step: '0.5' })}${champ('cpN1Pris', 'N-1 pris', b.cpN1Pris, { type: 'number', step: '0.5' })}
      ${champ('cpNAcquis', 'N acquis', b.cpNAcquis, { type: 'number', step: '0.5' })}${champ('cpNPris', 'N pris', b.cpNPris, { type: 'number', step: '0.5' })}
      ${champ('notes', 'Mention libre en bas du bulletin', b.notes, { type: 'textarea', full: true })}</div></div></div>
  </div>
  <div style="position:sticky;top:18px">
    <div class="card glass"><div class="hd"><h3><span class="em">🧮</span>Résultat</h3></div><div class="bd"><div class="totals" id="bf-tot"></div></div></div>
    <div class="card glass"><div class="bd"><div class="stack" style="gap:8px">
      <button class="btn primary big" data-do="bEnregistrer">💾 Enregistrer</button>
      ${b.statut !== 'valide' ? '<button class="btn lav" data-do="bValider">✅ Valider et ranger</button>' : '<button class="btn" data-do="bRouvrir">↩︎ Repasser en brouillon</button>'}
      <button class="btn" data-do="bApercu">👁️ Aperçu &amp; PDF</button>
      <button class="btn" data-do="bSuivant">➡️ Préparer le mois suivant</button>
      ${!BED.nouveau ? '<button class="btn danger" data-do="bSupprimer">🗑️ Supprimer</button>' : ''}</div></div></div>
    <div class="note warn"><span class="ic">⚠️</span><div>Vérifiez les taux, bases et montants avant de remettre ce bulletin. La responsabilité de son exactitude incombe à l'employeur.</div></div>
  </div></div>`;
  peindreRemu(); peindreCot(); peindreAutres(); peindreTotBul();
  $$('#bf-tete [name], #bf-cp [name]').forEach(i => i.addEventListener('input', () => { lireTeteBul(); peindreTotBul(); }));
  QUITTER = () => !BED || !BED.sale || window.confirm('Des modifications du bulletin ne sont pas enregistrées. Quitter quand même ?');
};
function lireTeteBul() {
  const b = BED.b, f = Object.assign(lireForm(el('bf-tete')), lireForm(el('bf-cp')));
  ['heures', 'pasTaux', 'exoIR', 'pass', 'cpN1Acquis', 'cpN1Pris', 'cpNAcquis', 'cpNPris'].forEach(k => f[k] = num(f[k]));
  Object.assign(b, f); BED.sale = true;
}
function lignesEditables(id, arr, cols, apres) {
  const t = el(id);
  t.innerHTML = `<thead><tr>${cols.map(c => `<th class="${c.r ? 'r' : ''}" style="${c.w ? 'width:' + c.w : ''}">${c.t}</th>`).join('')}<th></th></tr></thead><tbody>${arr.map((l, i) => `<tr data-i="${i}">${cols.map(c =>
    c.calc ? `<td class="tot" data-calc="${c.k}"></td>` : c.sel ? `<td><select class="in" data-k="${c.k}">${c.sel.map(([k, lb]) => `<option value="${k}" ${String(l[c.k]) === k ? 'selected' : ''}>${lb}</option>`).join('')}</select></td>`
    : c.ck ? `<td class="c"><input type="checkbox" data-k="${c.k}" ${l[c.k] !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent)"></td>`
    : `<td><input class="in ${c.r ? 'num' : ''}" data-k="${c.k}" ${c.n ? 'type="number" step="any"' : ''} value="${esc(l[c.k] == null ? '' : l[c.k])}" ${c.ph ? `placeholder="${c.ph}"` : ''}></td>`).join('')}
    <td><button class="x" type="button" data-rm="${i}">✕</button></td></tr>`).join('')}</tbody>`;
  $$('tr[data-i]', t).forEach(tr => $$('[data-k]', tr).forEach(inp => { const h = () => { const l = arr[+tr.dataset.i];
    l[inp.dataset.k] = inp.type === 'checkbox' ? inp.checked : inp.value; BED.sale = true; peindreTotBul(); if (apres) apres(tr, l); };
    inp.addEventListener('input', h); inp.addEventListener('change', h); }));
  $$('[data-rm]', t).forEach(x => x.onclick = () => { arr.splice(+x.dataset.rm, 1); BED.sale = true; lignesEditables(id, arr, cols, apres); peindreTotBul(); });
}
const peindreRemu = () => lignesEditables('bf-remu', BED.b.remu, [{ k: 'libelle', t: 'Libellé', w: '44%' }, { k: 'base', t: 'Nombre / base', r: 1, n: 1 }, { k: 'taux', t: 'Taux', r: 1, n: 1 },
  { k: 'montant', t: 'Montant (si fixe)', r: 1, n: 1 }, { k: 'm', t: 'Total', r: 1, calc: 1 }]);
const peindreAutres = () => lignesEditables('bf-aut', BED.b.autres, [{ k: 'libelle', t: 'Libellé', w: '60%' }, { k: 'montant', t: 'Montant (€)', r: 1, n: 1 }, { k: 'recurrent', t: 'Chaque mois', ck: 1 }]);
function peindreCot() {
  const cols = [{ k: 'actif', t: '', ck: 1 }, { k: 'libelle', t: 'Libellé', w: '34%' },
    { k: 'base', t: 'Base', sel: [['brut', 'Brut'], ['T1', 'T1'], ['T2', 'T2'], ['T1T2', 'T1+T2'], ['csg', 'CSG'], ['forfait', 'Fixe']] },
    { k: 'sal', t: 'Taux sal. % / € fixe', r: 1, n: 1 }, { k: 'pat', t: 'Taux empl. % / € fixe', r: 1, n: 1 }, { k: 'ms', t: 'Part sal.', r: 1, calc: 1 }, { k: 'mp', t: 'Part empl.', r: 1, calc: 1 }];
  // Pour une ligne à montant fixe, les colonnes « taux » servent à saisir les montants.
  BED.b.cotis.forEach(c => { if (c.base === 'forfait') { if (c.montantSal !== undefined) c.sal = c.montantSal; if (c.montantPat !== undefined) c.pat = c.montantPat; } });
  lignesEditables('bf-cot', BED.b.cotis, cols, (tr, l) => { if (l.base === 'forfait') { l.montantSal = num(l.sal); l.montantPat = num(l.pat); } });
}
function peindreTotBul() {
  const b = BED.b, k = calcBulletin(b);
  $$('#bf-remu tr[data-i]').forEach(tr => { const l = k.remu[+tr.dataset.i]; if (l) $('[data-calc="m"]', tr).textContent = money(l.m); });
  const actifs = b.cotis.map((c, i) => c.actif !== false ? i : -1).filter(i => i >= 0);
  $$('#bf-cot tr[data-i]').forEach(tr => { const i = +tr.dataset.i, j = actifs.indexOf(i), c = j >= 0 ? k.cot[j] : null;
    $('[data-calc="ms"]', tr).textContent = c ? money(c.ms) : '—'; $('[data-calc="mp"]', tr).textContent = c ? money(c.mp) : '—'; tr.style.opacity = c ? '' : '.5'; });
  el('bf-tot').innerHTML = `<div class="row"><span>Salaire brut</span><b>${money(k.brut)}</b></div>
    <div class="row"><span>− Cotisations salariales</span><b>${money(k.cotSal)}</b></div>
    <div class="row"><span>Net à payer avant impôt</span><b>${money(k.netAvantImpot)}</b></div>
    <div class="row"><span>Net imposable</span><b>${money(k.netImposable)}</b></div>
    <div class="row"><span>− Prélèvement à la source (${NUM.format(num(b.pasTaux))} %)</span><b>${money(k.pas)}</b></div>
    ${k.totAutres ? `<div class="row"><span>± Autres éléments</span><b>${money(k.totAutres)}</b></div>` : ''}
    <div class="row grand"><span>Net payé</span><b>${money(k.netPaye)}</b></div>
    <div class="row"><span>Cotisations patronales</span><b>${money(k.cotPat)}</b></div>
    <div class="row"><span><b>Coût employeur</b></span><b>${money(k.cout)}</b></div>`;
}
ACT.bRemu = ds => {
  const s = salarie(BED.b.salarieId) || {}, th = num(s.tauxHoraire) || (num(s.salaireBase) && num(s.heuresMensuelles) ? r2(num(s.salaireBase) / num(s.heuresMensuelles)) : 0);
  const L = { hs25: { libelle: 'Heures supplémentaires à 25 %', base: 1, taux: r2(th * 1.25) }, hs50: { libelle: 'Heures supplémentaires à 50 %', base: 1, taux: r2(th * 1.5) },
    prime: { libelle: 'Prime', base: '', taux: '', montant: 0, fixe: false }, absence: { libelle: 'Absence non rémunérée', base: 1, taux: -th, fixe: false }, libre: { libelle: '', base: '', taux: '', montant: 0 } }[ds.k];
  if (ds.k === 'hs25' || ds.k === 'hs50') L.fixe = false;
  BED.b.remu.push(L); BED.sale = true; peindreRemu(); peindreTotBul();
};
ACT.bAutre = () => { BED.b.autres.push({ libelle: '', montant: 0 }); BED.sale = true; peindreAutres(); peindreTotBul(); };
ACT.bCotisLigne = () => { BED.b.cotis.push({ id: uid(), cat: 'Allègements et autres', libelle: 'Réduction générale des cotisations patronales', base: 'forfait', sal: 0, pat: 0, montantSal: 0, montantPat: 0, actif: true }); BED.sale = true; peindreCot(); peindreTotBul(); };
ACT.bGrille = async () => {
  if (!await confirmer('Remplacer les cotisations de ce bulletin par la grille actuelle ?', 'Recharger')) return;
  const s = salarie(BED.b.salarieId) || {};
  BED.b.cotis = S.reglages.cotisations.filter(c => c.actif !== false && (!c.cadre || s.statut === 'cadre')).map(c => Object.assign(clone(c), c.mutuelle ? { montantSal: num(s.mutuelleSal), montantPat: num(s.mutuellePat) } : {}));
  BED.sale = true; peindreCot(); peindreTotBul();
};
function enregistrerBulletin(silencieux) {
  lireTeteBul(); const b = BED.b;
  b.remu = b.remu.filter(l => l.libelle || num(l.montant) || num(l.base));
  const i = S.bulletins.findIndex(x => x.id === b.id);
  if (i >= 0) S.bulletins[i] = clone(b); else S.bulletins.push(clone(b));
  if (b.statut === 'valide') rangerBulletin(b);
  BED.nouveau = false; BED.sale = false; sauver(); if (!silencieux) toast('Bulletin enregistré.'); return true;
}
function rangerBulletin(b) {
  const k = calcBulletin(b), a = byId(S.activites, b.activiteId) || act();
  let x = S.paies.find(p => p.bulletinId === b.id);
  if (!x) { x = { id: uid(), bulletinId: b.id }; S.paies.push(x); }
  Object.assign(x, { mois: b.mois, employeur: a.nom, datePaiement: b.datePaiement, net: k.netPaye, brut: k.brut, notes: 'Bulletin édité avec NaoFactu — ' + nomSalarie(salarie(b.salarieId)) });
}
ACT.bEnregistrer = () => { if (enregistrerBulletin()) rendre(); };
ACT.bApercu = () => { lireTeteBul(); apercuBulletin(BED.b); };
ACT.bValider = async () => {
  lireTeteBul();
  if (!await confirmer('Valider ce bulletin ? Il sera rangé dans « Classement des fiches » et compté dans les cumuls annuels.<br><br>Avez-vous vérifié les taux de cotisation ?', 'Valider')) return;
  BED.b.statut = 'valide'; enregistrerBulletin(true); toast('Bulletin validé et rangé.'); rendre();
};
ACT.bRouvrir = () => { BED.b.statut = 'brouillon'; S.paies = S.paies.filter(p => p.bulletinId !== BED.b.id); enregistrerBulletin(true); rendre(); };
ACT.bSuivant = () => {
  if (BED.sale) enregistrerBulletin(true);
  const [y, m] = BED.b.mois.split('-').map(Number), mois = isoDate(new Date(y, m, 1)).slice(0, 7);
  const deja = S.bulletins.find(k => k.salarieId === BED.b.salarieId && k.mois === mois);
  BED = deja ? { b: clone(deja), nouveau: false, sale: false } : { b: nouveauBulletin(BED.b.salarieId, mois), nouveau: true, sale: true };
  toast(deja ? 'Bulletin de ' + fmtMois(mois) + ' ouvert.' : 'Bulletin de ' + fmtMois(mois) + ' préparé.'); rendre();
};
ACT.bSupprimer = async () => { if (!await confirmer('Supprimer ce bulletin ?', 'Supprimer', true)) return;
  S.bulletins = S.bulletins.filter(x => x.id !== BED.b.id); S.paies = S.paies.filter(x => x.bulletinId !== BED.b.id); sauver(); BED = null; go('paies'); };
