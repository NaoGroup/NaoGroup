/* ============================================================
   NaoFactu — les documents : rendu des devis / factures / avoirs,
   PDF (via l'impression du navigateur), e-mails, relances, exports.
   ============================================================ */
'use strict';

function titreDoc(doc, kind) {
  if (kind === 'devis') return 'Devis';
  return TYPES_FACTURE[doc.type || 'facture'];
}
function adresseBloc(o) {
  return [o.adresse, [o.cp, o.ville].filter(Boolean).join(' '), o.pays && o.pays !== 'France' ? o.pays : ''].filter(Boolean).map(esc).join('<br>');
}
function remplir(txt, vars) { return String(txt || '').replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m); }

/* Le document tel qu'il sera imprimé — mise en page A4, toujours sur fond blanc. */
function rendreDoc(doc, kind) {
  const a = byId(S.activites, doc.activiteId) || act(), c = client(doc.clientId) || {};
  const t = totaux(doc), franchise = t.franchise, estDevis = kind === 'devis';
  const numero = doc.numero || 'BROUILLON';
  const statut = estDevis ? null : statutFacture(doc);
  const lignes = (doc.lignes || []).map(l => `<tr>
      <td><b>${esc(l.designation || '')}</b>${l.description ? `<div class="desc">${esc(l.description)}</div>` : ''}</td>
      <td class="r">${NUM.format(num(l.qte))}${l.unite ? ' ' + esc(l.unite) : ''}</td>
      <td class="r">${money(l.pu)}</td>
      ${doc.lignes.some(x => num(x.remise)) ? `<td class="r">${num(l.remise) ? NUM.format(num(l.remise)) + ' %' : '—'}</td>` : ''}
      ${franchise ? '' : `<td class="r">${NUM.format(num(l.tva))} %</td>`}
      <td class="r">${money(ligneHT(l))}</td></tr>`).join('');
  const aRemise = (doc.lignes || []).some(x => num(x.remise));
  const tvaTab = franchise ? `<div class="d-tva"><i>${esc(a.mentionTva)}</i></div>` :
    `<div class="d-tva"><table><tr><th>Taux</th><th>Base HT</th><th>TVA</th></tr>${Object.entries(t.parTaux).map(([k, v]) =>
      `<tr><td>${NUM.format(k)} %</td><td>${money(v.base)}</td><td>${money(v.tva)}</td></tr>`).join('')}</table></div>`;
  let tot = '';
  if (t.remise) tot += `<div class="rw"><span>Total HT avant remise</span><b>${money(t.brut)}</b></div><div class="rw"><span>Remise ${NUM.format(num(doc.remiseGlobale))} %</span><b>− ${money(t.remise)}</b></div>`;
  tot += `<div class="rw"><span>Total HT</span><b>${money(t.ht)}</b></div>`;
  if (!franchise) tot += `<div class="rw"><span>TVA</span><b>${money(t.tva)}</b></div>`;
  tot += `<div class="rw g"><span>${doc.type === 'avoir' ? 'Montant de l\'avoir' : franchise ? 'Net à payer' : 'Total TTC'}</span><span>${money(t.ttc)}</span></div>`;
  if (!estDevis && doc.type !== 'avoir' && doc.numero) {
    const paye = payeDe(doc), av = sum(avoirsDe(doc), x => totaux(x).ttc);
    if (paye) tot += `<div class="rw"><span>Déjà réglé</span><b>− ${money(paye)}</b></div>`;
    if (av) tot += `<div class="rw"><span>Avoirs</span><b>− ${money(av)}</b></div>`;
    if (paye || av) tot += `<div class="rw due"><span>Reste à payer</span><b>${money(restantDe(doc))}</b></div>`;
  }
  const dates = estDevis
    ? `Date : ${fmtDate(doc.date)}<br>Valable jusqu'au : ${fmtDate(addDays(doc.date, doc.validite || 30))}`
    : `Date d'émission : ${fmtDate(doc.date)}${doc.type !== 'avoir' && doc.echeance ? `<br>Échéance : ${fmtDate(doc.echeance)}` : ''}`;
  const lien = doc.type === 'avoir' && doc.factureLieeId ? `<div class="d-objet">Avoir relatif à la facture <b>${esc((byId(S.factures, doc.factureLieeId) || {}).numero || '')}</b></div>` : '';
  const banque = a.iban ? `IBAN : ${esc(a.iban)}${a.bic ? '\nBIC : ' + esc(a.bic) : ''}${a.banque ? '\nBanque : ' + esc(a.banque) : ''}${a.titulaire ? '\nTitulaire : ' + esc(a.titulaire) : ''}` : '';
  const conditions = esc(doc.conditions || (estDevis ? '' : a.conditions));
  const noteDevis = estDevis ? esc(remplir(a.noteDevis, { validite: doc.validite || 30 })) : '';
  const ident = [a.forme, a.siret && 'SIRET ' + a.siret, a.rcs, a.tvaIntra && 'TVA intracom. ' + a.tvaIntra].filter(Boolean).map(esc).join(' · ');
  const mentions = [franchise ? esc(a.mentionTva) : '', !estDevis && doc.type !== 'avoir' ? esc(a.penalites) : '', esc(a.mentions), ident].filter(Boolean).join('\n');
  const tampon = statut === 'payee' ? '<div class="d-stamp">PAYÉE</div>' : !estDevis && !doc.numero ? '<div class="d-stamp draft">BROUILLON</div>' : statut === 'annulee' ? '<div class="d-stamp draft">ANNULÉE</div>' : '';
  return `<div class="doc" style="--dc:${esc(a.couleurDoc || '#5B43AD')}">
    <div class="d-top">
      <div class="d-emet">${a.logo ? `<img src="${a.logo}" alt="">` : ''}<div><div class="nm">${esc(a.nom)}</div>
        <div class="ad">${adresseBloc(a)}${a.email ? '<br>' + esc(a.email) : ''}${a.tel ? '<br>' + esc(a.tel) : ''}${a.site ? '<br>' + esc(a.site) : ''}</div></div></div>
      <div class="d-type"><h1>${titreDoc(doc, kind)}</h1><div class="no">N° ${esc(numero)}</div><div class="dt">${dates}</div>${tampon}</div>
    </div>
    <div class="d-band"></div>
    <div class="d-parties"><div class="d-client"><div class="lb">${estDevis ? 'Devis pour' : 'Facturé à'}</div>
      <b>${esc(c.entreprise || c.nom || '')}</b>${c.entreprise && c.nom ? '<br>' + esc(c.nom) : ''}<br>${adresseBloc(c)}
      ${c.tva ? '<br>TVA : ' + esc(c.tva) : ''}${c.siret ? '<br>SIRET : ' + esc(c.siret) : ''}</div></div>
    ${lien}${doc.objet ? `<div class="d-objet"><b>Objet :</b> ${esc(doc.objet)}</div>` : ''}
    <table class="d-l"><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">Prix unit. HT</th>${aRemise ? '<th class="r">Remise</th>' : ''}${franchise ? '' : '<th class="r">TVA</th>'}<th class="r">Total HT</th></tr></thead>
      <tbody>${lignes || '<tr><td colspan="6" style="color:#999">Aucune ligne</td></tr>'}</tbody></table>
    <div class="d-sum">${tvaTab}<div class="d-tot">${tot}</div></div>
    <div class="d-info">
      <div>${conditions ? `<h4>Conditions</h4><p>${conditions}</p>` : ''}${noteDevis ? `<h4 style="margin-top:8px">Validité</h4><p>${noteDevis}</p>` : ''}</div>
      <div>${!estDevis && banque ? `<h4>Règlement par virement</h4><p>${banque}</p>` : ''}${doc.notes ? `<h4 style="margin-top:8px">Notes</h4><p>${esc(doc.notes)}</p>` : ''}</div>
    </div>
    ${estDevis ? '<div class="d-sign"><div>Bon pour accord — date et signature du client</div></div>' : ''}
    ${mentions ? `<div class="d-mentions">${mentions}</div>` : ''}
  </div>`;
}

/* ---------- PDF : le navigateur imprime la zone #print-root ---------- */
function imprimer(html, nomFichier) {
  const root = el('print-root'), ancien = document.title;
  root.innerHTML = html;
  if (nomFichier) document.title = nomFichier;
  const fin = () => { root.innerHTML = ''; document.title = ancien; window.removeEventListener('afterprint', fin); };
  window.addEventListener('afterprint', fin);
  setTimeout(() => window.print(), 60);
}
function nomPdf(doc, kind) { return (titreDoc(doc, kind) + ' ' + (doc.numero || 'brouillon') + ' - ' + clientNom(doc.clientId)).replace(/[\\/:*?"<>|]/g, '-'); }
function pdfDoc(doc, kind) {
  imprimer(`<div class="paper">${rendreDoc(doc, kind)}</div>`, nomPdf(doc, kind));
  toast('Choisissez « Enregistrer au format PDF » dans la fenêtre d\'impression.', 4200);
}
function apercu(doc, kind) {
  modal({ titre: `${titreDoc(doc, kind)} ${esc(doc.numero || '(brouillon)')}`, sous: esc(clientNom(doc.clientId)) + ' · ' + money(totaux(doc).ttc),
    taille: 'wide', corps: `<div class="paper-wrap"><div class="paper">${rendreDoc(doc, kind)}</div></div>`,
    pied: [{ lab: '✉️ Préparer l\'e-mail', fn: c => { c(); preparerEmail(doc, kind); } }, '|',
      { lab: 'Fermer', fn: c => c() }, { lab: '📄 Télécharger en PDF', cls: 'primary', fn: () => pdfDoc(doc, kind) }] });
}

/* ---------- E-mails ---------- */
function varsDoc(doc, kind) {
  const a = byId(S.activites, doc.activiteId) || act(), c = client(doc.clientId) || {};
  return {
    client: c.nom || c.entreprise || 'Madame, Monsieur', entreprise: c.entreprise || '', numero: doc.numero || '(brouillon)',
    montant: money(totaux(doc).ttc), restant: money(kind === 'devis' ? totaux(doc).ttc : restantDe(doc) || totaux(doc).ttc),
    echeance: fmtDate(doc.echeance), date: fmtDate(doc.date), jours: kind === 'devis' ? 0 : joursRetard(doc),
    validite: fmtDate(addDays(doc.date, doc.validite || 30)), activite: a.nom, signature: a.signature || a.nom
  };
}
function fenetreEmail({ titre, a, sujet, corps, apres, lab = 'Marquer comme envoyé' }) {
  modal({ titre, taille: 'wide', corps: `
    <div class="note lav"><span class="ic">📎</span><div>NaoFactu prépare le message : votre messagerie s'ouvre avec le texte déjà rédigé.
      <b>Pensez à joindre le PDF</b> (bouton « Télécharger en PDF ») avant d'envoyer.</div></div>
    <div class="form">${champ('a', 'Destinataire', a, { type: 'email', full: true })}${champ('sujet', 'Objet', sujet, { full: true })}
    ${champ('corps', 'Message', corps, { type: 'textarea', full: true, cls: 'long' })}</div>`,
    pied: [{ lab: '📋 Copier le texte', fn: (c, b) => { const f = lireForm(b); navigator.clipboard.writeText(f.sujet + '\n\n' + f.corps).then(() => toast('Texte copié.')); } }, '|',
      apres ? { lab: '✓ ' + lab, fn: (c, b) => { apres(lireForm(b)); c(); } } : null,
      { lab: '✉️ Ouvrir dans ma messagerie', cls: 'primary', fn: (c, b) => {
        const f = lireForm(b); location.href = `mailto:${encodeURIComponent(f.a)}?subject=${encodeURIComponent(f.sujet)}&body=${encodeURIComponent(f.corps)}`;
        if (apres) apres(f); c();
      } }].filter(Boolean) });
}
function preparerEmail(doc, kind) {
  const v = varsDoc(doc, kind), c = client(doc.clientId) || {};
  const estDevis = kind === 'devis', nom = titreDoc(doc, kind).toLowerCase();
  const corps = estDevis
    ? `Bonjour ${v.client},\n\nVeuillez trouver ci-joint notre devis n° ${v.numero} d'un montant de ${v.montant}, valable jusqu'au ${v.validite}.\n\nJe reste à votre disposition pour toute question ou ajustement.\n\nBien cordialement,\n${v.signature}`
    : `Bonjour ${v.client},\n\nVeuillez trouver ci-joint la ${nom} n° ${v.numero} d'un montant de ${v.montant}${doc.type !== 'avoir' && doc.echeance ? `, payable avant le ${v.echeance}` : ''}.\n\nMerci pour votre confiance.\n\nBien cordialement,\n${v.signature}`;
  fenetreEmail({ titre: '✉️ E-mail d\'envoi', a: c.email || '', sujet: `${titreDoc(doc, kind)} ${v.numero} — ${v.activite}`, corps,
    apres: () => {
      if (estDevis) { if (doc.statut === 'brouillon') doc.statut = 'envoye'; }
      else { if (!doc.numero) validerFacture(doc); if (['brouillon', 'en_attente'].includes(doc.statut)) doc.statut = 'envoyee'; doc.envoyeLe = today(); }
      sauver(); rendre();
    } });
}
function relancer(f) {
  const v = varsDoc(f, 'facture'), c = client(f.clientId) || {};
  const retard = joursRetard(f), n = (f.relances || []).length;
  const def = retard <= 0 ? S.relances[0] : S.relances[Math.min(n + 1, S.relances.length - 1)] || S.relances[0];
  const hist = (f.relances || []).map(r => `<span class="tag">${fmtDate(r.date)} · ${esc(r.nom)}</span>`).join(' ');
  const m = modal({ titre: '🔔 Relance de paiement', sous: `${esc(f.numero)} · ${esc(clientNom(f.clientId))} · reste ${money(restantDe(f))}${retard ? ` · ${retard} j de retard` : ''}`,
    taille: 'narrow', corps: `${hist ? `<p class="mini">Déjà relancé : ${hist}</p>` : ''}
      <label class="fl"><span>Modèle de relance</span><select class="in" id="rl-m">${S.relances.map(r => `<option value="${r.id}" ${r.id === def.id ? 'selected' : ''}>${esc(r.nom)}</option>`).join('')}</select></label>
      <p class="mini" style="margin-top:12px">Les modèles se personnalisent dans <b>Paramètres → Relances</b>. Le ton reste courtois : c'est souvent un simple oubli.</p>`,
    pied: ['|', { lab: 'Annuler', fn: c => c() }, { lab: 'Rédiger →', cls: 'primary', fn: (cl, b) => {
      const mod = byId(S.relances, $('#rl-m', b).value); cl();
      fenetreEmail({ titre: '🔔 ' + esc(mod.nom), a: c.email || '', sujet: remplir(mod.sujet, v), corps: remplir(mod.corps, v), lab: 'Noter la relance',
        apres: () => { f.relances = f.relances || []; f.relances.push({ date: today(), nom: mod.nom }); sauver(); toast('Relance notée dans l\'historique.'); rendre(); } });
    } }] });
  return m;
}

/* ---------- Validation d'une facture : c'est là qu'elle reçoit son numéro ---------- */
function validerFacture(f) {
  if (f.numero) return;
  const a = byId(S.activites, f.activiteId) || act();
  f.numero = attribuerNumero(f.type === 'avoir' ? 'avoir' : 'facture', f.date, a);
  if (f.statut === 'brouillon') f.statut = 'en_attente';
  f.valideLe = today();
}

/* ---------- Exports ---------- */
function csv(entetes, lignes) {
  const q = v => { const s = v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [entetes, ...lignes].map(l => l.map(q).join(';')).join('\r\n');
}
/* Un classeur Excel (format XML 2003) : plusieurs feuilles, ouvert tel quel par Excel et LibreOffice. */
function classeurExcel(feuilles) {
  const x = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cell = v => typeof v === 'number' ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell><Data ss:Type="String">${x(v)}</Data></Cell>`;
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A4FD0" ss:Pattern="Solid"/></Style></Styles>
${feuilles.map(f => `<Worksheet ss:Name="${x(f.nom.slice(0, 31))}"><Table>
<Row>${f.entetes.map(h => `<Cell ss:StyleID="h"><Data ss:Type="String">${x(h)}</Data></Cell>`).join('')}</Row>
${f.lignes.map(l => `<Row>${l.map(cell).join('')}</Row>`).join('\n')}
</Table></Worksheet>`).join('\n')}</Workbook>`;
}
function donneesExport(debut, fin) {
  const dans = d => d >= debut && d <= fin;
  const facts = mine(S.factures).filter(f => f.numero && dans(f.date)).sort((a, b) => a.date.localeCompare(b.date));
  const factures = { nom: 'Factures', entetes: ['Numéro', 'Type', 'Date', 'Échéance', 'Client', 'Total HT', 'TVA', 'Total TTC', 'Payé', 'Reste dû', 'Statut'],
    lignes: facts.map(f => { const t = totaux(f), s = f.type === 'avoir' ? -1 : 1;
      return [f.numero, TYPES_FACTURE[f.type || 'facture'], fmtDate(f.date), fmtDate(f.echeance), clientNom(f.clientId), r2(s * t.ht), r2(s * t.tva), r2(s * t.ttc), payeDe(f), restantDe(f), STATUTS_FACTURE[statutFacture(f)]]; }) };
  const ids = new Set(mine(S.factures).map(f => f.id));
  const pays = S.paiements.filter(p => ids.has(p.factureId) && dans(p.date)).sort((a, b) => a.date.localeCompare(b.date));
  const paiements = { nom: 'Paiements', entetes: ['Date', 'Facture', 'Client', 'Montant', 'Moyen', 'Référence', 'Notes'],
    lignes: pays.map(p => { const f = byId(S.factures, p.factureId) || {}; return [fmtDate(p.date), f.numero || '', clientNom(f.clientId), num(p.montant), p.moyen, p.reference || '', p.notes || '']; }) };
  const deps = mine(S.depenses).filter(d => dans(d.date) && !(d.prevue && !d.payee)).sort((a, b) => a.date.localeCompare(b.date));
  const depenses = { nom: 'Dépenses', entetes: ['Date', 'Fournisseur', 'Catégorie', 'HT', 'TVA', 'TTC', 'Moyen de paiement', 'Justificatif', 'Notes'],
    lignes: deps.map(d => [fmtDate(d.date), d.fournisseur || '', catDep(d.categorie)[2], depHT(d), depTVA(d), depTTC(d), d.moyen || '', d.justificatif ? d.justificatif.nom : 'manquant', d.notes || '']) };
  const journal = { nom: 'Recettes-Dépenses', entetes: ['Date', 'Nature', 'Libellé', 'Recette', 'Dépense'],
    lignes: [...paiements.lignes.map(p => [p[0], 'Recette', `${p[1]} — ${p[2]}`, p[3], '']), ...depenses.lignes.map(d => [d[0], 'Dépense', `${d[1]} — ${d[2]}`, '', d[5]])]
      .sort((a, b) => a[0].split('/').reverse().join('').localeCompare(b[0].split('/').reverse().join(''))) };
  return { factures, paiements, depenses, journal };
}
function tablePrint(f) {
  return `<h2>${esc(f.nom)}</h2><table><thead><tr>${f.entetes.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
    f.lignes.map(l => `<tr>${l.map(v => typeof v === 'number' ? `<td class="r">${money(v)}</td>` : `<td>${esc(v)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${f.entetes.length}">Aucune donnée sur la période.</td></tr>`}</tbody></table>`;
}
const AVERT_COMPTA = 'Document de suivi généré par NaoFactu, outil d\'organisation personnel. Il ne constitue ni une comptabilité certifiée, ni un conseil fiscal, social ou juridique : à vérifier avec votre expert-comptable ou l\'administration compétente.';

