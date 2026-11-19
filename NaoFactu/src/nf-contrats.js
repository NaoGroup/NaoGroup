/* ============================================================
   NaoFactu — les contrats : rendu professionnel (article par
   article), éditeur détaillé, modèles, bibliothèque de clauses.
   ============================================================ */
'use strict';

/* ---------- Variables disponibles dans les textes ---------- */
const AC = '[à compléter]';
const maj = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
/* « à le Prestataire » → « au Prestataire », « de le Client » → « du Client »… */
const contracter = t => t.replace(/(^|[\s(])à le /g, '$1au ').replace(/(^|[\s(])À le /g, '$1Au ').replace(/(^|[\s(])à les /g, '$1aux ')
  .replace(/(^|[\s(])([dD])e le /g, '$1$2u ').replace(/(^|[\s(])([dD])e les /g, '$1$2es ');
function rolesDe(c) { const r = ROLES_CONTRAT[c.type] || ROLES_CONTRAT.autre; return [c.roleA || r[0], c.roleB || r[1]]; }
const salarieType = c => ['cdi', 'cdd', 'stage', 'alternance'].includes(c.type);
function varsContrat(c) {
  const a = byId(S.activites, c.activiteId) || act(), [A, B] = rolesDe(c);
  const prestEstB = ['freelance', 'fournisseur'].includes(c.type), Pr = prestEstB ? B : A, Cl = prestEstB ? A : B;
  const per = { forfait: 'à titre forfaitaire', mensuel: 'par mois', horaire: 'par heure', journalier: 'par jour', annuel: 'par an' };
  const preavis = c.preavisJours ? c.preavisJours + ' jours' : 'un (1) mois';
  const ou = (v, d = AC) => (v === undefined || v === null || String(v).trim() === '') ? d : v;
  const adrA = [a.adresse, a.cp, a.ville].filter(Boolean).join(' ');
  return {
    A, B, A_maj: maj(A), B_maj: maj(B), P: Pr, C: Cl, P_maj: maj(Pr), C_maj: maj(Cl),
    activite: a.nom, activite_forme: a.forme || '', activite_siret: a.siret ? 'SIRET ' + a.siret : '', activite_metier: ou(a.metier),
    activite_adresse: adrA, activite_rep: ou(c.repA || a.representant), activite_qualite: ou(c.qualiteA || a.qualiteRep),
    partie: ou(c.partie), partie_forme: c.partieForme || '', partie_siret: c.partieSiret ? 'SIRET ' + c.partieSiret : '', partie_adresse: ou(c.partieAdresse),
    partie_rep: ou(c.partieRep), partie_qualite: ou(c.partieQualite),
    objet: ou(c.objet), description: ou(c.description), livrables: ou(c.livrables),
    debut: c.debut ? fmtDateLong(c.debut) : AC, fin: c.fin ? fmtDateLong(c.fin) : AC,
    fin_phrase: c.fin ? ` et prendra fin le ${fmtDateLong(c.fin)}` : ' pour une durée indéterminée',
    reconduction_phrase: c.reconduction ? ` À son terme, il sera reconduit tacitement par périodes successives de même durée, sauf dénonciation par l'une des Parties moyennant un préavis de ${preavis}.` : '',
    essai: ou(c.essai), essai_renouv: c.essaiRenouv ? " La période d'essai pourra être renouvelée une fois, d'un commun accord et par écrit, dans les limites prévues par la loi et la convention collective." : '',
    renouv_cdd: c.renouvCdd ? ' Il pourra être renouvelé dans les conditions prévues par la loi, par avenant signé avant son terme.' : '',
    preavis, montant: c.montant ? money(c.montant) : AC, montant_lettres: c.montant ? nombreEnLettres(c.montant) : AC,
    periodicite: c.periodicite || '', periodicite_phrase: ((salarieType(c) || a.tvaNonApplicable ? '' : 'HT ') + (per[c.periodicite] || c.periodicite || '')).trim(),
    tva_phrase: a.tvaNonApplicable ? a.mentionTva + '.' : "Ce montant s'entend hors taxes ; la TVA au taux en vigueur s'y ajoute.",
    acompte_phrase: num(c.acomptePct) ? `\nUn acompte de ${NUM.format(num(c.acomptePct))} % du prix est versé à la signature du présent contrat.` : '',
    frais_phrase: c.frais ? '\n' + c.frais : '', revision: c.revision || 'Les prix sont fermes et non révisables pendant la durée du contrat.',
    modalites: c.modalites || a.conditions, penalites: a.penalites,
    usages: ou(c.usages, "l'ensemble des usages liés à l'activité de " + Cl + ', sur tous supports connus à ce jour'),
    territoire: ou(c.territoire, 'le monde entier'), duree_cession: ou(c.dureeCession, "la durée légale de protection des droits d'auteur"),
    duree_conf: ou(c.dureeConf, 'cinq (5) ans'), perimetre_exclu: ou(c.perimetreExclu), nc_duree: ou(c.ncDuree), nc_territoire: ou(c.ncTerritoire), nc_contrepartie: ou(c.ncContrepartie),
    tt_jours: ou(c.ttJours), zone_mobilite: ou(c.zoneMobilite),
    emploi: ou(c.emploi || c.objet), classification: ou(c.classification), statut_salarie: ou(c.statutSal, 'non-cadre'), horaire: ou(c.horaire, '35'),
    remuneration: c.montant ? money(c.montant) : AC, remuneration_lettres: c.montant ? nombreEnLettres(c.montant) : AC, avantages: c.avantages || '',
    lieu: ou(c.lieu || adrA), convention: ou(c.convention || a.convention), caisse_retraite: ou(a.caisseRetraite), mutuelle: ou(a.mutuelle),
    motif: ou(c.motif), remplace: ou(c.remplace, 'sans objet'), juridiction: ou(c.juridiction, 'les tribunaux compétents du ressort du siège de ' + a.nom),
    date: fmtDateLong(c.date || today()), lieu_signature: ou(c.lieuSignature || a.ville), exemplaires: c.exemplaires || 2, signature: a.signature || a.nom
  };
}
const VARS_AIDE = ['A', 'B', 'A_maj', 'B_maj', 'activite', 'activite_rep', 'partie', 'partie_adresse', 'objet', 'description', 'livrables', 'debut', 'fin', 'fin_phrase',
  'essai', 'preavis', 'montant', 'montant_lettres', 'periodicite_phrase', 'modalites', 'emploi', 'classification', 'horaire', 'remuneration', 'lieu', 'convention', 'motif', 'juridiction', 'date'];

/* ---------- Rendu imprimable ---------- */
function rendreContrat(c) {
  const a = byId(S.activites, c.activiteId) || act(), v = varsContrat(c), [A, B] = rolesDe(c);
  const f = t => esc(contracter(remplir(t, v))).split(AC).join('<mark class="ac">' + AC + '</mark>');
  const style = c.style || a.styleDoc || 'classique', couleur = c.couleur || a.couleurDoc || '#5B43AD';
  const titre = c.titreDoc || TITRES_CONTRAT[c.type] || 'Contrat';
  const repA = c.repA || a.representant, qualA = c.qualiteA || a.qualiteRep;
  const pA = `<div class="c-partie"><div class="c-sec">Première partie</div><div class="nm">${esc(a.nom)}</div>
    <div class="id">${[a.forme, a.siret && 'SIRET ' + a.siret, a.rcs].filter(Boolean).map(esc).join(' · ')}${a.forme || a.siret || a.rcs ? '<br>' : ''}${adresseBloc(a)}
    ${repA ? `<br>Représentée par ${esc(repA)}${qualA ? ', ' + esc(qualA) : ''}` : ''}</div>
    <div class="role">ci-après dénommée « ${esc(maj(A))} »</div></div>`;
  const ident = salarieType(c)
    ? [c.partieNaissance && 'Né(e) le ' + fmtDate(c.partieNaissance) + (c.partieLieuNaissance ? ' à ' + c.partieLieuNaissance : ''), c.partieNationalite && 'Nationalité : ' + c.partieNationalite, c.partieNss && 'N° de sécurité sociale : ' + c.partieNss]
    : [c.partieForme, c.partieSiret && 'SIRET ' + c.partieSiret];
  const pB = `<div class="c-partie"><div class="c-sec">Seconde partie</div><div class="nm">${c.partie ? esc(c.partie) : '<mark class="ac">' + AC + '</mark>'}</div>
    <div class="id">${ident.filter(Boolean).map(esc).join('<br>')}${ident.some(Boolean) ? '<br>' : ''}${esc(c.partieAdresse || '')}
    ${c.partieRep ? `<br>Représentée par ${esc(c.partieRep)}${c.partieQualite ? ', ' + esc(c.partieQualite) : ''}` : ''}</div>
    <div class="role">ci-après dénommé(e) « ${esc(maj(B))} »</div></div>`;
  const arts = (c.articles || []).filter(x => x.actif !== false);
  return `<div class="ctr ${esc(style)}" style="--dc:${esc(couleur)}">
    <div class="c-head"><div style="display:flex;gap:12px;align-items:center">${a.logo && c.logo !== false ? `<img src="${a.logo}" alt="">` : ''}
      <div class="emet"><b>${esc(a.nom)}</b>${adresseBloc(a)}${a.email ? '<br>' + esc(a.email) : ''}</div></div>
      <div class="ref">${c.reference ? `<b>Réf. ${esc(c.reference)}</b>` : ''}Établi le ${fmtDate(c.date || today())}</div></div>
    <div class="c-title"><div class="kind">${esc(typeContrat(c.type)[2])}</div><h1>${esc(titre)}</h1>
      <div class="orn"><i></i><b></b><i></i></div>${c.objet ? `<div class="obj">${esc(c.objet)}</div>` : ''}</div>
    <div class="c-sec">Entre les soussignés</div>
    <div class="c-parties">${pA}<div class="c-et">ET</div>${pB}</div>
    <div class="c-ens">ci-après désignées ensemble « les Parties » et individuellement « une Partie ».</div>
    ${c.preambule ? `<div class="c-sec">Préambule</div><div class="c-pre">${f(c.preambule)}</div>` : ''}
    <div class="c-conv">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :</div>
    ${arts.map((x, i) => `<div class="c-art"><h3><span class="n">${i + 1}</span>${x.titre ? 'Article ' + (i + 1) + ' — ' + esc(x.titre) : 'Article ' + (i + 1)}</h3><p>${f(x.texte)}</p></div>`).join('')}
    ${c.annexes ? `<div class="c-annexes"><div class="c-sec">Annexes</div><p style="white-space:pre-line;margin:0">${f(c.annexes)}</p></div>` : ''}
    <div class="c-fait">Fait à ${f('{lieu_signature}')}, le ${esc(v.date)}, en ${esc(String(v.exemplaires))} exemplaires originaux, dont un remis à chacune des Parties.</div>
    <div class="c-sign">
      <div><span class="pour">Pour ${esc(A)}</span><span class="qui">${esc(repA || a.nom)}</span><span style="color:#6a6480">${esc(qualA || '')}</span>
        <span class="mention">Date et signature, précédées de la mention manuscrite « Lu et approuvé »</span></div>
      <div><span class="pour">Pour ${esc(B)}</span><span class="qui">${esc(c.partieRep || c.partie || '')}</span><span style="color:#6a6480">${esc(c.partieRep ? c.partieQualite || '' : '')}</span>
        <span class="mention">Date et signature, précédées de la mention manuscrite « Lu et approuvé »</span></div>
    </div>
    ${c.paraphes !== false ? '<div class="c-paraphe">Paraphes : ________ / ________</div>' : ''}
  </div>`;
}
const nomContrat = c => ((c.reference ? c.reference + ' - ' : '') + (c.titre || 'Contrat')).replace(/[\\/:*?"<>|]/g, '-');
function pdfContrat(c) { imprimer(`<div class="paper">${rendreContrat(c)}</div>`, nomContrat(c)); toast('Choisissez « Enregistrer au format PDF » dans la fenêtre d\'impression.', 4200); }
function apercuContrat(c) {
  const manquants = (rendreContrat(c).match(/class="ac"/g) || []).length;
  modal({ titre: '📄 ' + esc(c.titre || 'Contrat'), sous: manquants ? `⚠️ ${manquants} élément(s) à compléter, surlignés en jaune` : 'Prêt à imprimer', taille: 'wide',
    corps: `<div class="paper-wrap"><div class="paper">${rendreContrat(c)}</div></div>`,
    pied: ['|', { lab: 'Fermer', fn: x => x() }, { lab: '📄 Télécharger en PDF', cls: 'primary', fn: () => pdfContrat(c) }] });
}

/* ---------- Création ---------- */
function nouveauContratDepuis(type, modeleId, base = {}) {
  const a = act(), m = byId(S.modelesContrat, modeleId);
  const c = Object.assign({ id: uid(), activiteId: a.id, type, statut: 'brouillon', date: today(), debut: today(), periodicite: salarieType({ type }) ? 'mensuel' : 'forfait',
    titre: TITRES_CONTRAT[type] || 'Contrat', exemplaires: 2, paraphes: true, horaire: '35', preambule: m ? m.preambule || '' : '',
    articles: m ? clone(m.articles).map(x => Object.assign({ id: uid(), actif: true }, x)) : [], repA: a.representant, qualiteA: a.qualiteRep, convention: a.convention }, base);
  CED = { c, nouveau: true, sale: true }; go('contrat');
}
ACT.nouveauContrat = () => {
  let type = 'prestation';
  const m = modal({ titre: '✍️ Nouveau contrat', taille: 'wide', corps: `<div class="fsec">1. Type de contrat</div>
    <div class="folders" id="nc-types">${TYPES_CONTRAT.map(([k, e, l]) => `<button type="button" class="folder glass ${k === type ? 'on' : ''}" data-t="${k}"><span class="em">${e}</span><b>${l}</b></button>`).join('')}</div>
    <div class="fsec">2. Point de départ</div><div class="form"><label class="fl two"><span>Modèle</span><select class="in" id="nc-mod"></select></label>
    ${champ('clientId', 'Client lié', '', { type: 'select', options: [['', '— aucun —'], ...optionsClients(false)] })}</div>`,
    onOpen: b => {
      const peindre = () => { $$('#nc-types .folder', b).forEach(x => x.classList.toggle('on', x.dataset.t === type));
        const mods = S.modelesContrat.filter(x => x.type === type);
        $('#nc-mod', b).innerHTML = mods.map(x => `<option value="${x.id}">${esc(x.nom)} (${x.articles.length} articles)</option>`).join('') + '<option value="">Document vierge</option>'; };
      $$('#nc-types .folder', b).forEach(x => x.onclick = () => { type = x.dataset.t; peindre(); }); peindre();
    },
    pied: ['|', { lab: 'Annuler', fn: c => c() }, { lab: 'Créer le contrat →', cls: 'primary', fn: (c, b) => {
      const cid = $('[name="clientId"]', b).value, k = client(cid), base = {};
      if (k) Object.assign(base, { clientId: cid, partie: k.entreprise || k.nom, partieRep: k.entreprise ? k.nom : '', partieAdresse: [k.adresse, k.cp, k.ville].filter(Boolean).join(' '), partieEmail: k.email, partieSiret: k.siret });
      c(); nouveauContratDepuis(type, $('#nc-mod', b).value, base); } }] });
  return m;
};
function contratDepuisCandidat(cd) {
  const poste = byId(S.postes, cd.posteId) || {}, type = poste.type || 'cdi';
  const mod = S.modelesContrat.find(x => x.type === type) || S.modelesContrat.find(x => x.type === 'cdi');
  const montant = num(String(poste.remuneration || '').replace(/[^\d,.]/g, ''));
  nouveauContratDepuis(type, mod && mod.id, { titre: (poste.titre || 'Contrat') + ' — ' + cd.nom, partie: cd.nom, partieEmail: cd.email, objet: poste.titre || '',
    emploi: poste.titre || '', description: poste.description || '', debut: poste.debut || addDays(today(), 14), lieu: poste.lieu || '', candidatId: cd.id, montant: montant || '' });
}

/* ================= Liste ================= */
VUES.contrats = (root, p) => {
  const t = p.t || 'liste', f = p.f || 'tous', auj = today(), tous = mine(S.contrats);
  const actifs = tous.filter(c => ['signe', 'actif'].includes(c.statut)), aSigner = tous.filter(c => ['brouillon', 'envoye'].includes(c.statut));
  const bientot = tous.filter(c => !['termine', 'resilie'].includes(c.statut) && c.fin && c.fin >= auj && c.fin <= addDays(auj, 60));
  root.innerHTML = entete('✍️', 'Contrats', 'Prestations, fournisseurs, salariés : rédigés article par article, suivis jusqu\'à leur échéance.', '<button class="btn primary" data-do="nouveauContrat">➕ Nouveau contrat</button>') + `
  <div class="note warn"><span class="ic">⚖️</span><div>Les modèles fournis sont des <b>bases de travail</b> rédigées avec soin, mais un contrat — et tout particulièrement un contrat de travail —
    doit respecter des règles précises (Code du travail, convention collective, droit de la consommation…). Faites-le relire par un professionnel du droit avant signature.</div></div>
  <div class="kpis"><div class="kpi glass ok" data-go="contrats" data-p="${P({ f: 'actifs' })}"><div class="lab">En cours</div><div class="val">${actifs.length}</div><div class="sub">${money(sum(actifs.filter(c => c.periodicite === 'mensuel'), c => num(c.montant)))} / mois</div></div>
    <div class="kpi glass blue" data-go="contrats" data-p="${P({ f: 'asigner' })}"><div class="lab">À finaliser / signer</div><div class="val">${aSigner.length}</div></div>
    <div class="kpi glass ${bientot.length ? 'warn' : ''}" data-go="contrats" data-p="${P({ f: 'bientot' })}"><div class="lab">Finissent sous 60 j</div><div class="val">${bientot.length}</div></div></div>
  ${onglets([['liste', '📄 Mes contrats'], ['modeles', '📐 Modèles'], ['clauses', '🧩 Bibliothèque de clauses']], t)}<div id="ct-body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => go('contrats', { t: b.dataset.tab }));
  const body = el('ct-body');
  if (t === 'liste') {
    const filtres = { tous: () => true, actifs: c => ['signe', 'actif'].includes(c.statut), asigner: c => ['brouillon', 'envoye'].includes(c.statut), bientot: c => bientot.includes(c), termines: c => ['termine', 'resilie'].includes(c.statut) };
    const liste = tous.filter(filtres[f] || filtres.tous).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    body.innerHTML = `<div class="filters">${[['tous', 'Tous'], ['actifs', 'En cours'], ['asigner', 'À signer'], ['bientot', 'Bientôt terminés'], ['termines', 'Terminés']].map(([k, l]) =>
      `<button class="chip ${f === k ? 'on' : ''}" data-go="contrats" data-p="${P({ f: k })}">${l}<span class="n">${tous.filter(filtres[k]).length}</span></button>`).join('')}</div>
    <div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Contrat</th><th>Type</th><th>Avec</th><th>Début</th><th>Fin</th><th class="r">Montant</th><th>Statut</th><th></th></tr></thead><tbody>
    ${liste.map(c => `<tr class="click" data-do="editerContrat" data-id="${c.id}"><td><b>${esc(c.titre)}</b><div class="mini">${esc(c.reference || 'brouillon')}</div></td><td>${typeContrat(c.type)[1]} ${esc(typeContrat(c.type)[2])}</td>
      <td>${esc(c.partie || '')}</td><td>${fmtDate(c.debut)}</td><td class="${c.fin && c.fin <= addDays(auj, 60) && !['termine', 'resilie'].includes(c.statut) ? 'neg' : ''}">${c.fin ? fmtDate(c.fin) : '<span class="muted">indéterminée</span>'}</td>
      <td class="r num">${c.montant ? money(c.montant) + `<div class="mini">${esc(c.periodicite || '')}</div>` : ''}</td><td>${pill(c.statut, STATUTS_CONTRAT)}</td>
      <td class="acts">${c.signe ? `<button class="btn sm" data-do="voirSigne" data-id="${c.id}" title="Exemplaire signé">📎</button>` : ''}<button class="btn sm" data-do="pdfContratListe" data-id="${c.id}" title="PDF">📄</button>
        <button class="btn sm danger" data-do="supprContrat" data-id="${c.id}" title="Supprimer">🗑️</button></td></tr>`).join('')
      || '<tr><td colspan="8"><div class="empty">Aucun contrat ici.</div></td></tr>'}</tbody></table></div></div>`;
  }
  if (t === 'modeles') {
    body.innerHTML = `<div class="row-acts" style="margin-bottom:14px"><button class="btn primary" data-do="nouveauModele">➕ Nouveau modèle</button>
      <button class="btn" data-do="restaurerModeles">↺ Restaurer les modèles d'origine</button></div>
      <div class="grid3">${S.modelesContrat.map(x => `<div class="card glass"><div class="hd"><h3><span class="em">${typeContrat(x.type)[1]}</span>${esc(x.nom)}</h3></div>
        <div class="bd"><div class="mini">${esc(typeContrat(x.type)[2])} · ${x.articles.length} article(s)</div>
        <p class="mini" style="margin:8px 0 12px">${x.articles.slice(0, 6).map(a => esc(a.titre || 'Texte')).join(' · ')}${x.articles.length > 6 ? '…' : ''}</p>
        <div class="row-acts"><button class="btn sm" data-do="editerModele" data-id="${x.id}">✏️ Modifier</button><button class="btn sm" data-do="utiliserModele" data-id="${x.id}">✍️ Utiliser</button>
        <button class="btn sm danger" data-do="supprModele" data-id="${x.id}">🗑️</button></div></div></div>`).join('') || '<div class="empty">Aucun modèle.</div>'}</div>`;
  }
  if (t === 'clauses') {
    body.innerHTML = `<p class="mini" style="margin-top:0">Ces clauses s'ajoutent en un clic depuis l'éditeur d'un contrat (bouton « ➕ Clause »). Les mots entre accolades sont remplacés automatiquement.</p>
      ${CLAUSES.map(x => `<div class="card glass"><div class="hd"><h3>${esc(x.titre)}</h3></div><div class="bd"><div class="contract-text">${esc(x.texte)}</div>
        ${x.note ? `<div class="note warn" style="margin:12px 0 0"><span class="ic">⚠️</span><div>${esc(x.note)}</div></div>` : ''}</div></div>`).join('')}`;
  }
};
ACT.editerContrat = ds => { const c = byId(S.contrats, ds.id); CED = { c: clone(c), nouveau: false, sale: false }; go('contrat'); };
ACT.voirSigne = ds => ouvrirFichier(byId(S.contrats, ds.id).signe);
ACT.pdfContratListe = ds => pdfContrat(byId(S.contrats, ds.id));
ACT.supprContrat = async ds => {
  const c = byId(S.contrats, ds.id);
  if (!await confirmer('Supprimer le contrat « ' + esc(c.titre) + ' »' + (c.signe ? ' et son exemplaire signé' : '') + ' ?', 'Supprimer', true)) return;
  if (c.signe) IDB.del(c.signe.id); S.contrats = S.contrats.filter(x => x.id !== c.id); sauver(); toast('Contrat supprimé.'); rendre();
};

/* ================= Éditeur détaillé ================= */
let CED = null;
const COULEURS_DOC = ['#5B43AD', '#3E4BB8', '#1F6F8B', '#2F7A5B', '#8A3B5C', '#B0562B', '#2B2B3A', '#7A6A3A'];
VUES.contrat = root => {
  if (!CED) { go('contrats'); return; }
  const c = CED.c, a = act(), sal = salarieType(c), [A, B] = rolesDe(c), cdd = c.type === 'cdd';
  const sec = (em, t, html, id = '') => `<div class="card glass"><div class="hd"><h3><span class="em">${em}</span>${t}</h3></div><div class="bd"${id ? ` id="${id}"` : ''}>${html}</div></div>`;
  root.innerHTML = entete(typeContrat(c.type)[1], esc(c.titre || 'Contrat'), `${esc(typeContrat(c.type)[2])} · ${c.reference ? 'Réf. ' + esc(c.reference) : 'référence attribuée à l\'enregistrement'} · ${pill(c.statut, STATUTS_CONTRAT)}`,
    '<button class="btn" data-do="ctRetour">← Contrats</button>') + `
  <div class="ed-grid"><div id="ctf">
    ${sec('📄', 'Le contrat', `<div class="form">
      ${champ('titre', 'Nom interne', c.titre, { req: true, two: true })}${champ('statut', 'Statut', c.statut, { type: 'select', options: Object.entries(STATUTS_CONTRAT) })}
      ${champ('titreDoc', 'Titre imprimé', c.titreDoc, { two: true, ph: TITRES_CONTRAT[c.type] })}${champ('type', 'Type', c.type, { type: 'select', options: TYPES_CONTRAT.map(([k, e, l]) => [k, e + ' ' + l]) })}
      ${champ('date', 'Date du contrat', c.date, { type: 'date' })}${champ('clientId', 'Client lié', c.clientId, { type: 'select', options: [['', '— aucun —'], ...optionsClients(false)] })}</div>`)}
    ${sec('👥', 'Les parties', `<div class="fsec">Première partie — ${esc(a.nom)}</div><div class="form">
      ${champ('repA', 'Représentée par', c.repA, { ph: a.representant || 'Nom du signataire' })}${champ('qualiteA', 'En qualité de', c.qualiteA, { ph: a.qualiteRep })}
      ${champ('roleA', 'Désignation', c.roleA, { ph: A })}</div>
      <p class="mini">Coordonnées, SIRET et logo : repris du profil de l'activité (Paramètres).</p>
      <div class="fsec">Seconde partie</div><div class="form">
      ${champ('partie', sal ? 'Nom et prénom du salarié' : 'Nom ou raison sociale', c.partie, { req: true, two: !sal })}
      ${sal ? champ('partieNaissance', 'Date de naissance', c.partieNaissance, { type: 'date' }) + champ('partieLieuNaissance', 'Lieu de naissance', c.partieLieuNaissance)
          + champ('partieNationalite', 'Nationalité', c.partieNationalite) + champ('partieNss', 'N° de sécurité sociale', c.partieNss)
        : champ('partieForme', 'Forme juridique', c.partieForme, { ph: 'SAS, SARL, EI, association…' }) + champ('partieSiret', 'SIRET', c.partieSiret)
          + champ('partieRep', 'Représentée par', c.partieRep) + champ('partieQualite', 'En qualité de', c.partieQualite)}
      ${champ('partieAdresse', 'Adresse complète', c.partieAdresse, { full: true })}
      ${champ('partieEmail', 'E-mail', c.partieEmail, { type: 'email' })}${champ('partieTel', 'Téléphone', c.partieTel)}${champ('roleB', 'Désignation', c.roleB, { ph: B })}</div>`)}
    ${sec('🎯', sal ? 'Le poste' : 'Objet et mission', sal ? `<div class="form">
      ${champ('emploi', 'Emploi', c.emploi, { req: true })}${champ('statutSal', 'Statut', c.statutSal || 'non-cadre', { type: 'select', options: ['non-cadre', 'agent de maîtrise', 'cadre'] })}
      ${champ('classification', 'Classification / coefficient', c.classification)}${champ('convention', 'Convention collective', c.convention, { ph: a.convention || 'Nom et IDCC' })}
      ${champ('horaire', 'Heures par semaine', c.horaire, { type: 'number', step: '0.5' })}${champ('lieu', 'Lieu de travail', c.lieu, { two: true })}
      ${cdd ? champ('motif', 'Motif du recours au CDD', c.motif, { full: true, req: true, ph: 'Remplacement d\'un salarié absent, accroissement temporaire d\'activité…' }) + champ('remplace', 'Personne remplacée (nom, qualification)', c.remplace, { full: true }) : ''}
      ${champ('objet', 'Intitulé affiché sous le titre', c.objet, { full: true })}
      ${champ('description', 'Missions principales', c.description, { type: 'textarea', full: true })}</div>`
    : `<div class="form">${champ('objet', 'Objet', c.objet, { full: true, req: true, ph: 'Refonte du site internet de la boulangerie' })}
      ${champ('description', 'Description détaillée de la mission', c.description, { type: 'textarea', full: true })}
      ${champ('livrables', 'Livrables / périmètre (un par ligne)', c.livrables, { type: 'textarea', full: true, ph: '– Maquettes de 5 pages\n– Intégration responsive\n– Formation d\'une heure' })}
      ${champ('lieu', 'Lieu d\'exécution / de livraison', c.lieu, { full: true })}</div>`)}
    ${sec('📅', 'Durée', `<div class="form">
      ${champ('debut', 'Date de début', c.debut, { type: 'date' })}${champ('fin', 'Date de fin', c.fin, { type: 'date', aide: cdd ? '(obligatoire)' : '(vide = indéterminée)' })}
      ${sal ? champ('essai', "Durée de la période d'essai", c.essai, { ph: 'deux (2) mois' }) + champ('finEssai', "Fin de la période d'essai (alerte)", c.finEssai, { type: 'date' })
          + champ('essaiRenouv', "Période d'essai renouvelable", c.essaiRenouv, { type: 'check', full: true }) + (cdd ? champ('renouvCdd', 'CDD renouvelable', c.renouvCdd, { type: 'check', full: true }) : '')
        : champ('reconduction', 'Reconduction tacite', c.reconduction, { type: 'check', full: true })}
      ${champ('preavisJours', 'Préavis (jours)', c.preavisJours, { type: 'number' })}</div>`)}
    ${sec('💶', sal ? 'Rémunération' : 'Conditions financières', `<div class="form">
      ${champ('montant', sal ? 'Salaire brut (€)' : 'Montant (€)', c.montant, { type: 'number', step: '0.01', num: true })}
      ${champ('periodicite', 'Périodicité', c.periodicite, { type: 'select', options: ['forfait', 'mensuel', 'horaire', 'journalier', 'annuel'] })}
      ${sal ? champ('avantages', 'Primes, avantages, remboursements', c.avantages, { type: 'textarea', full: true, ph: 'Prime annuelle, titres-restaurant, remboursement de 50 % du titre de transport…' })
        : champ('acomptePct', 'Acompte à la signature (%)', c.acomptePct, { type: 'number' })
          + champ('modalites', 'Modalités de paiement', c.modalites, { type: 'textarea', full: true, ph: a.conditions })
          + champ('revision', 'Révision / indexation du prix', c.revision, { type: 'textarea', full: true, ph: 'Les prix sont fermes et non révisables pendant la durée du contrat.' })
          + champ('frais', 'Frais annexes', c.frais, { full: true, ph: 'Frais de déplacement refacturés au réel sur justificatifs…' })}</div>`)}
    <div class="card glass"><div class="hd"><h3><span class="em">📜</span>Articles</h3><span class="hint">${(c.articles || []).filter(x => x.actif !== false).length} article(s) actif(s)</span>
      <div class="right row-acts"><select class="in" id="ct-clause" style="width:auto;padding:6px 10px"><option value="">➕ Clause…</option>${CLAUSES.map(x => `<option value="${x.id}">${esc(x.titre)}</option>`).join('')}</select>
      <button class="btn sm" data-do="ctArticle">➕ Article vierge</button><button class="btn sm" data-do="ctModele">↺ Modèle</button></div></div>
      <div class="bd">${champ('preambule', 'Préambule (facultatif)', c.preambule, { type: 'textarea', full: true, ph: 'Le contexte : qui sont les parties, pourquoi elles s\'engagent…' })}
      <div id="ct-arts" style="margin-top:12px"></div>
      <details style="margin-top:10px"><summary class="mini" style="cursor:pointer">⚙️ Paramètres des clauses (propriété intellectuelle, confidentialité, non-concurrence…)</summary><div class="form" style="margin-top:10px">
        ${champ('usages', 'Usages cédés (PI)', c.usages, { two: true })}${champ('territoire', 'Territoire (PI)', c.territoire)}${champ('dureeCession', 'Durée de la cession', c.dureeCession)}
        ${champ('dureeConf', 'Durée de confidentialité après la fin', c.dureeConf, { ph: 'cinq (5) ans' })}${champ('perimetreExclu', "Périmètre d'exclusivité", c.perimetreExclu)}
        ${champ('ncDuree', 'Non-concurrence : durée', c.ncDuree)}${champ('ncTerritoire', 'Non-concurrence : territoire', c.ncTerritoire)}${champ('ncContrepartie', 'Non-concurrence : contrepartie', c.ncContrepartie, { ph: '30 %' })}
        ${champ('ttJours', 'Télétravail : jours', c.ttJours, { ph: 'deux jours' })}${champ('zoneMobilite', 'Zone de mobilité', c.zoneMobilite)}
        ${champ('juridiction', 'Juridiction compétente', c.juridiction, { full: true, ph: 'les tribunaux compétents du ressort du siège de ' + a.nom })}</div></details></div></div>
    ${sec('🖊️', 'Signature et annexes', `<div class="form">
      ${champ('lieuSignature', 'Fait à', c.lieuSignature, { ph: a.ville })}${champ('exemplaires', "Nombre d'exemplaires", c.exemplaires, { type: 'number' })}
      ${champ('annexes', 'Annexes (une par ligne)', c.annexes, { type: 'textarea', full: true, ph: 'Annexe 1 — Devis n° D-2026-004\nAnnexe 2 — Cahier des charges' })}
      ${champ('paraphes', 'Zone de paraphes en bas de chaque page', c.paraphes !== false, { type: 'check' })}${champ('logo', 'Afficher le logo', c.logo !== false, { type: 'check' })}
      ${champ('notes', 'Notes internes (non imprimées)', c.notes, { type: 'textarea', full: true })}</div>
      <div class="fsec">Exemplaire signé</div><div class="row-acts" id="ct-sg"></div>`)}
  </div>
  <div style="position:sticky;top:18px">
    <div class="card glass"><div class="hd"><h3><span class="em">🎨</span>Apparence</h3></div><div class="bd">
      <div class="fl" style="margin-bottom:12px"><span>Couleur</span><div class="swatches">${COULEURS_DOC.map(x => `<button type="button" data-coul="${x}" class="${(c.couleur || a.couleurDoc) === x ? 'on' : ''}" style="background:${x}" title="${x}"></button>`).join('')}
        <input type="color" id="ct-coul" value="${esc(c.couleur || a.couleurDoc || '#5B43AD')}" title="Couleur personnalisée"></div></div>
      <div class="fl"><span>Mise en page</span><div class="style-pick">${[['classique', 'Classique'], ['moderne', 'Moderne'], ['elegant', 'Élégante']].map(([k, l]) => `<button type="button" data-sty="${k}" class="${(c.style || a.styleDoc || 'classique') === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    </div></div>
    <div class="card glass"><div class="bd"><div class="stack" style="gap:8px">
      <button class="btn primary big" data-do="ctEnregistrer">💾 Enregistrer</button>
      <button class="btn" data-do="ctApercu">👁️ Aperçu</button><button class="btn" data-do="ctPdf">📄 Télécharger en PDF</button>
      <button class="btn" data-do="ctEmail">✉️ Envoyer par e-mail</button>
      ${sal ? '<button class="btn" data-do="ctSalarie">👤 Créer la fiche salarié (paie)</button>' : ''}
      <button class="btn" data-do="ctCommeModele">📐 Enregistrer comme modèle</button>
      <button class="btn" data-do="ctDupliquer">📄 Dupliquer</button>
      ${!CED.nouveau ? '<button class="btn danger" data-do="ctSupprimer">🗑️ Supprimer</button>' : ''}</div></div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">🔤</span>Variables</h3></div><div class="bd"><p class="mini" style="margin-top:0">Cliquez pour copier, puis collez dans un article :</p>
      <div class="var-list">${VARS_AIDE.map(v => `<code data-var="${v}">{${v}}</code>`).join('')}</div></div></div>
    <div class="note warn"><span class="ic">⚖️</span><div>Base de travail à faire relire par un professionnel du droit avant signature. Les éléments manquants apparaissent <mark class="ac" style="background:#FFF1B8;border-radius:3px;padding:0 3px">[à compléter]</mark> dans l'aperçu.</div></div>
  </div></div>`;
  const lire = () => { const f = lireForm(el('ctf')); delete f.titreClause;
    ['exemplaires', 'preavisJours'].forEach(k => f[k] = f[k] === '' ? '' : num(f[k]));
    $$('#ct-arts [name]').forEach(() => {}); // les articles sont lus à part
    const typeAvant = c.type; Object.assign(c, f); lireArticles(); CED.sale = true; return typeAvant !== c.type; };
  $$('#ctf > .card [name]').forEach(i => { if (i.closest('#ct-arts')) return;
    i.addEventListener('change', () => { if (lire()) { toast('Type modifié : les champs affichés s\'adaptent.'); rendre(); } }); i.addEventListener('input', () => { CED.sale = true; }); });
  peindreArticles();
  peindreSigne();
  $$('[data-coul]', root).forEach(b => b.onclick = () => { c.couleur = b.dataset.coul; CED.sale = true; $$('[data-coul]', root).forEach(x => x.classList.toggle('on', x === b)); el('ct-coul').value = b.dataset.coul; });
  el('ct-coul').oninput = e => { c.couleur = e.target.value; CED.sale = true; $$('[data-coul]', root).forEach(x => x.classList.remove('on')); };
  $$('[data-sty]', root).forEach(b => b.onclick = () => { c.style = b.dataset.sty; CED.sale = true; $$('[data-sty]', root).forEach(x => x.classList.toggle('on', x === b)); });
  $$('[data-var]', root).forEach(x => x.onclick = () => navigator.clipboard.writeText('{' + x.dataset.var + '}').then(() => toast('{' + x.dataset.var + '} copié.')));
  el('ct-clause').onchange = e => { const x = CLAUSES.find(k => k.id === e.target.value); if (!x) return; lireArticles();
    c.articles.push({ id: uid(), titre: x.titre, texte: x.texte, actif: true }); CED.sale = true; e.target.value = ''; peindreArticles(); toast('Clause « ' + x.titre + ' » ajoutée en fin de contrat.');
    if (x.note) toast('⚠️ ' + x.note, 6000); };
  QUITTER = () => !CED || !CED.sale || window.confirm('Des modifications du contrat ne sont pas enregistrées. Quitter quand même ?');
};
function lireArticles() {
  const c = CED.c;
  $$('#ct-arts .art-ed').forEach(d => { const x = c.articles[+d.dataset.ai]; if (!x) return;
    x.titre = $('[data-k="titre"]', d).value; x.texte = $('[data-k="texte"]', d).value; x.actif = $('[data-k="actif"]', d).checked; });
}
function peindreArticles() {
  const c = CED.c; let n = 0;
  el('ct-arts').innerHTML = (c.articles || []).map((x, i) => { const on = x.actif !== false; if (on) n++;
    return `<div class="art-ed ${on ? '' : 'off'}" data-ai="${i}"><div class="ah"><input type="checkbox" data-k="actif" ${on ? 'checked' : ''} title="Inclure cet article" style="width:17px;height:17px;accent-color:var(--accent)">
      <span class="no">${on ? n : '–'}</span><input class="in" data-k="titre" value="${esc(x.titre)}" placeholder="Titre de l'article">
      <button class="btn sm" type="button" data-mv="-1" title="Monter">↑</button><button class="btn sm" type="button" data-mv="1" title="Descendre">↓</button>
      <button class="btn sm danger" type="button" data-rm title="Supprimer">✕</button></div>
      <textarea class="in" data-k="texte" rows="${Math.min(14, Math.max(4, Math.ceil((x.texte || '').length / 95) + (x.texte || '').split('\n').length))}">${esc(x.texte)}</textarea></div>`; }).join('')
    || '<div class="empty">Aucun article. Ajoutez un article vierge, une clause, ou repartez d\'un modèle.</div>';
  $$('#ct-arts .art-ed').forEach(d => {
    const i = +d.dataset.ai;
    $$('[data-k]', d).forEach(inp => inp.addEventListener('input', () => { CED.sale = true; }));
    $('[data-k="actif"]', d).onchange = () => { lireArticles(); peindreArticles(); };
    $$('[data-mv]', d).forEach(b => b.onclick = () => { lireArticles(); const j = i + +b.dataset.mv; if (j < 0 || j >= c.articles.length) return;
      [c.articles[i], c.articles[j]] = [c.articles[j], c.articles[i]]; CED.sale = true; peindreArticles(); });
    $('[data-rm]', d).onclick = async () => { lireArticles(); if (await confirmer('Retirer l\'article « ' + esc(c.articles[i].titre || 'sans titre') + ' » ?', 'Retirer', true)) { c.articles.splice(i, 1); CED.sale = true; peindreArticles(); } };
  });
}
function peindreSigne() {
  const c = CED.c, j = CED.signeFichier ? { nom: CED.signeFichier.name } : c.signe, box = el('ct-sg');
  box.innerHTML = (j ? `<span class="tag">📎 ${esc(j.nom)}</span>` : '<span class="mini">Aucun exemplaire signé joint.</span>')
    + (c.signe && !CED.signeFichier ? '<button class="btn sm" type="button" data-j="voir">Ouvrir</button><button class="btn sm danger" type="button" data-j="suppr">Retirer</button>' : '')
    + `<button class="btn sm lav" type="button" data-j="ajout">📎 ${j ? 'Remplacer' : 'Joindre le contrat signé (PDF, photo)'}</button>`;
  $$('[data-j]', box).forEach(y => y.onclick = async () => {
    if (y.dataset.j === 'voir') ouvrirFichier(c.signe);
    if (y.dataset.j === 'suppr') { CED.retirerSigne = true; c.signe = null; CED.sale = true; peindreSigne(); }
    if (y.dataset.j === 'ajout') { const fs = await choisirFichiers({ accept: 'application/pdf,image/*' });
      if (fs[0]) { CED.signeFichier = fs[0]; CED.sale = true; const st = $('#ctf [name="statut"]'); if (['brouillon', 'envoye'].includes(st.value)) { st.value = 'signe'; c.statut = 'signe'; } peindreSigne(); } }
  });
}
function lireContratEcran() {
  const f = lireForm(el('ctf')); ['exemplaires', 'preavisJours'].forEach(k => f[k] = f[k] === '' ? '' : num(f[k]));
  Object.assign(CED.c, f); lireArticles();
}
async function enregistrerContrat(silencieux) {
  lireContratEcran(); const c = CED.c;
  if (!c.titre) { toast('Donnez un nom au contrat.'); return false; }
  if (!c.reference) c.reference = attribuerNumero('contrat', c.date);
  const ancien = byId(S.contrats, c.id);
  if (CED.signeFichier) { if (ancien && ancien.signe) IDB.del(ancien.signe.id); c.signe = await stockerFichier(CED.signeFichier); CED.signeFichier = null; }
  else if (CED.retirerSigne && ancien && ancien.signe) IDB.del(ancien.signe.id);
  CED.retirerSigne = false;
  if (ancien) S.contrats[S.contrats.indexOf(ancien)] = clone(c); else S.contrats.push(clone(c));
  CED.nouveau = false; CED.sale = false; sauver();
  if (!silencieux) toast('Contrat enregistré — réf. ' + c.reference + '.');
  return true;
}
ACT.ctEnregistrer = async () => { if (await enregistrerContrat()) rendre(); };
ACT.ctApercu = () => { lireContratEcran(); apercuContrat(CED.c); };
ACT.ctPdf = async () => { if (await enregistrerContrat(true)) { rendre(); pdfContrat(CED.c); } };
ACT.ctRetour = () => go('contrats');
ACT.ctArticle = () => { lireArticles(); CED.c.articles.push({ id: uid(), titre: '', texte: '', actif: true }); CED.sale = true; peindreArticles(); const t = $$('#ct-arts [data-k="titre"]').pop(); t && t.focus(); };
ACT.ctModele = () => {
  lireContratEcran(); const c = CED.c;
  modal({ titre: '↺ Repartir d\'un modèle', taille: 'narrow', corps: `<label class="fl"><span>Modèle</span><select class="in" id="rm-m">${S.modelesContrat.map(x => `<option value="${x.id}" ${x.type === c.type ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}</select></label>
    <div class="row-acts" style="margin-top:12px"><label class="ck"><input type="radio" name="rm-mode" value="remplacer" checked> Remplacer les articles</label><label class="ck"><input type="radio" name="rm-mode" value="ajouter"> Ajouter à la suite</label></div>`,
    pied: ['|', { lab: 'Annuler', fn: x => x() }, { lab: 'Appliquer', cls: 'primary', fn: (x, b) => { const m = byId(S.modelesContrat, $('#rm-m', b).value), arts = clone(m.articles).map(y => Object.assign({ id: uid(), actif: true }, y));
      if ($('[name="rm-mode"]:checked', b).value === 'remplacer') { c.articles = arts; if (m.preambule) c.preambule = m.preambule; } else c.articles.push(...arts);
      CED.sale = true; x(); rendre(); } }] });
};
ACT.ctEmail = async () => {
  if (!await enregistrerContrat(true)) return; const c = CED.c, a = act();
  fenetreEmail({ titre: '✉️ Envoi du contrat', a: c.partieEmail || (client(c.clientId) || {}).email || '', sujet: `${c.titreDoc || TITRES_CONTRAT[c.type]} — réf. ${c.reference}`,
    corps: `Bonjour,\n\nVeuillez trouver ci-joint le contrat « ${c.titreDoc || TITRES_CONTRAT[c.type]} » (réf. ${c.reference}).\n\nMerci de le relire et, s'il vous convient, de me le retourner paraphé et signé, précédé de la mention « Lu et approuvé ». Je reste disponible pour en échanger.\n\nBien cordialement,\n${a.signature || a.nom}`,
    apres: () => { const k = byId(S.contrats, c.id); if (k.statut === 'brouillon') { k.statut = 'envoye'; c.statut = 'envoye'; } sauver(); rendre(); } });
};
ACT.ctDupliquer = async () => {
  lireContratEcran();
  const n = Object.assign(clone(CED.c), { id: uid(), reference: '', statut: 'brouillon', signe: null, date: today(), titre: CED.c.titre + ' (copie)' });
  n.articles.forEach(x => x.id = uid()); CED = { c: n, nouveau: true, sale: true }; toast('Copie créée — pensez à l\'enregistrer.'); rendre();
};
ACT.ctSupprimer = async () => { const c = byId(S.contrats, CED.c.id); if (!c) return;
  if (!await confirmer('Supprimer définitivement ce contrat ?', 'Supprimer', true)) return;
  if (c.signe) IDB.del(c.signe.id); S.contrats = S.contrats.filter(x => x.id !== c.id); sauver(); CED = null; toast('Contrat supprimé.'); go('contrats'); };
ACT.ctCommeModele = async () => {
  lireContratEcran(); const nom = await demander('📐 Enregistrer comme modèle', 'Nom du modèle', CED.c.titreDoc || TITRES_CONTRAT[CED.c.type]); if (!nom) return;
  S.modelesContrat.push({ id: uid(), nom, type: CED.c.type, preambule: CED.c.preambule || '', articles: CED.c.articles.filter(x => x.actif !== false).map(x => ({ titre: x.titre, texte: x.texte })) });
  sauver(); toast('Modèle « ' + nom + ' » enregistré.');
};
ACT.ctSalarie = async () => { if (!await enregistrerContrat(true)) return; salarieDepuisContrat(CED.c); };

/* ================= Modèles ================= */
function formModele(m) {
  const nouveau = !m; m = m ? clone(m) : { id: uid(), nom: 'Nouveau modèle', type: 'prestation', preambule: '', articles: [{ titre: 'Objet', texte: '' }] };
  const peindre = b => { $('#md-arts', b).innerHTML = m.articles.map((x, i) => `<div class="art-ed" data-mi="${i}"><div class="ah"><span class="no">${i + 1}</span>
      <input class="in" data-k="titre" value="${esc(x.titre)}" placeholder="Titre"><button class="btn sm" type="button" data-mv="-1">↑</button><button class="btn sm" type="button" data-mv="1">↓</button>
      <button class="btn sm danger" type="button" data-rm>✕</button></div><textarea class="in" data-k="texte" rows="5">${esc(x.texte)}</textarea></div>`).join('');
    $$('[data-mi]', b).forEach(d => { const i = +d.dataset.mi;
      $$('[data-mv]', d).forEach(y => y.onclick = () => { lire(b); const j = i + +y.dataset.mv; if (j < 0 || j >= m.articles.length) return; [m.articles[i], m.articles[j]] = [m.articles[j], m.articles[i]]; peindre(b); });
      $('[data-rm]', d).onclick = () => { lire(b); m.articles.splice(i, 1); peindre(b); }; }); };
  const lire = b => { $$('[data-mi]', b).forEach(d => { const x = m.articles[+d.dataset.mi]; x.titre = $('[data-k="titre"]', d).value; x.texte = $('[data-k="texte"]', d).value; });
    Object.assign(m, lireForm($('#md-f', b))); };
  modal({ titre: '📐 ' + (nouveau ? 'Nouveau modèle' : esc(m.nom)), taille: 'wide', corps: `<div class="form" id="md-f">${champ('nom', 'Nom', m.nom, { two: true, req: true })}
      ${champ('type', 'Type', m.type, { type: 'select', options: TYPES_CONTRAT.map(([k, e, l]) => [k, e + ' ' + l]) })}${champ('preambule', 'Préambule', m.preambule, { type: 'textarea', full: true })}</div>
      <div class="fsec" style="margin-top:16px">Articles</div><div id="md-arts"></div>
      <div class="row-acts"><button class="btn sm" type="button" id="md-add">➕ Article</button><select class="in" id="md-cl" style="width:auto"><option value="">➕ Clause…</option>${CLAUSES.map(x => `<option value="${x.id}">${esc(x.titre)}</option>`).join('')}</select></div>`,
    onOpen: b => { peindre(b); $('#md-add', b).onclick = () => { lire(b); m.articles.push({ titre: '', texte: '' }); peindre(b); };
      $('#md-cl', b).onchange = e => { const x = CLAUSES.find(k => k.id === e.target.value); if (!x) return; lire(b); m.articles.push({ titre: x.titre, texte: x.texte }); e.target.value = ''; peindre(b); }; },
    pied: ['|', { lab: 'Annuler', fn: x => x() }, { lab: 'Enregistrer', cls: 'primary', fn: (x, b) => { lire(b); const i = S.modelesContrat.findIndex(k => k.id === m.id);
      if (i >= 0) S.modelesContrat[i] = m; else S.modelesContrat.push(m); sauver(); x(); toast('Modèle enregistré.'); rendre(); } }] });
}
ACT.nouveauModele = () => formModele();
ACT.editerModele = ds => formModele(byId(S.modelesContrat, ds.id));
ACT.utiliserModele = ds => { const m = byId(S.modelesContrat, ds.id); nouveauContratDepuis(m.type, m.id); };
ACT.supprModele = async ds => { const m = byId(S.modelesContrat, ds.id);
  if (await confirmer('Supprimer le modèle « ' + esc(m.nom) + ' » ? Les contrats déjà créés ne sont pas touchés.', 'Supprimer', true)) { S.modelesContrat = S.modelesContrat.filter(x => x.id !== m.id); sauver(); rendre(); } };
ACT.restaurerModeles = async () => {
  if (!await confirmer("Remettre les modèles d'origine de NaoFactu ? Vos modèles personnels sont conservés ; les modèles d'origine modifiés sont réinitialisés.", 'Restaurer')) return;
  const ids = MODELES_CONTRAT_V2.map(x => x.id); S.modelesContrat = [...S.modelesContrat.filter(x => !ids.includes(x.id)), ...clone(MODELES_CONTRAT_V2)]; sauver(); rendre();
};
