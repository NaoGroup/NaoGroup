/* ============================================================
   NaoFactu — équipe & contrats : recrutements (postes, candidats,
   entretiens) et contrats (clients, fournisseurs, salariés, modèles).
   ============================================================ */
'use strict';

/* ---------- Carte de l'accueil ---------- */
function carteEquipe() {
  const auj = today();
  const entretiens = mine(S.candidats).flatMap(c => (c.entretiens || []).filter(e => !e.fait && e.date >= auj).map(e => ({ c, e }))).sort((x, y) => x.e.date.localeCompare(y.e.date)).slice(0, 4);
  const contrats = mine(S.contrats).filter(c => !['termine', 'resilie'].includes(c.statut) && ((c.fin && c.fin <= addDays(auj, 60)) || c.statut === 'envoye' || (c.finEssai && c.finEssai >= auj && c.finEssai <= addDays(auj, 30)))).slice(0, 4);
  if (!mine(S.candidats).length && !mine(S.contrats).length) return '';
  return `<div class="grid2" style="margin-top:18px">
    <div class="card glass"><div class="hd"><h3><span class="em">🧑‍🤝‍🧑</span>Recrutements</h3><button class="btn sm right" data-go="recrutement">Voir →</button></div><div class="bd flush">
      ${entretiens.map(({ c, e }) => ligneEvenement({ date: e.date, type: 'rh', cible: ['candidat', c.id], titre: 'Entretien · ' + c.nom + (e.heure ? ' à ' + e.heure : '') })).join('')
        || `<div class="empty">${mine(S.candidats).filter(c => !['embauche', 'refuse'].includes(c.etape)).length} candidature(s) en cours, aucun entretien planifié.</div>`}</div></div>
    <div class="card glass"><div class="hd"><h3><span class="em">✍️</span>Contrats à surveiller</h3><button class="btn sm right" data-go="contrats">Voir →</button></div><div class="bd flush">
      ${contrats.map(c => `<div class="li click" data-do="editerContrat" data-id="${c.id}"><div class="thumb-f">${typeContrat(c.type)[1]}</div><div class="tx"><b>${esc(c.titre)}</b>
        <small>${c.statut === 'envoye' ? 'en attente de signature' : c.fin && c.fin <= addDays(auj, 60) ? 'se termine le ' + fmtDate(c.fin) : "fin de période d'essai le " + fmtDate(c.finEssai)}</small></div>${pill(c.statut, STATUTS_CONTRAT)}</div>`).join('')
        || '<div class="empty">Aucun contrat n\'arrive à échéance.</div>'}</div></div></div>`;
}

/* ================= Recrutements ================= */
VUES.recrutement = (root, p) => {
  const t = p.t || 'suivi', posteId = p.poste || '';
  const postes = mine(S.postes), cands = mine(S.candidats).filter(c => !posteId || c.posteId === posteId);
  const ouverts = postes.filter(x => x.statut === 'ouvert').length;
  root.innerHTML = entete('🧑‍🤝‍🧑', 'Recrutements', `${ouverts} poste${ouverts > 1 ? 's' : ''} ouvert${ouverts > 1 ? 's' : ''} · ${mine(S.candidats).filter(c => !['embauche', 'refuse'].includes(c.etape)).length} candidature(s) en cours`,
    '<button class="btn" data-do="nouveauPoste">➕ Poste</button><button class="btn primary" data-do="nouveauCandidat">➕ Candidat</button>') + `
  <div class="note"><span class="ic">⚖️</span><div>Un outil pour <b>organiser</b> vos recrutements. Pensez aux règles essentielles : critères de sélection liés
    uniquement aux compétences (aucune discrimination), information des candidats sur l'usage de leurs données, et suppression des dossiers
    non retenus au bout d'un délai raisonnable (RGPD). Pour la rédaction d'une offre ou d'un contrat de travail, rapprochez-vous d'un professionnel du droit social.</div></div>
  ${onglets([['suivi', '🧭 Suivi des candidatures'], ['postes', '📌 Postes'], ['candidats', '👤 Tous les candidats']], t)}
  <div id="rc-body"></div>`;
  $$('[data-tab]', root).forEach(b => b.onclick = () => go('recrutement', { t: b.dataset.tab, poste: posteId }));
  const body = el('rc-body');
  const filtrePoste = `<div class="filters"><button class="chip ${!posteId ? 'on' : ''}" data-go="recrutement" data-p="${P({ t })}">Tous les postes</button>${postes.map(x =>
    `<button class="chip ${posteId === x.id ? 'on' : ''}" data-go="recrutement" data-p="${P({ t, poste: x.id })}">${esc(x.titre)}<span class="n">${mine(S.candidats).filter(c => c.posteId === x.id).length}</span></button>`).join('')}</div>`;
  if (t === 'suivi') {
    body.innerHTML = filtrePoste + `<div class="pipe">${ETAPES_CANDIDAT.map(([k, e, l]) => { const cs = cands.filter(c => c.etape === k);
      return `<div class="col glass" data-etape="${k}"><h4>${e} ${l}<span class="n">${cs.length}</span></h4>${cs.map(c => `<div class="cand" draggable="true" data-cand="${c.id}">
        <b>${esc(c.nom)}</b><small>${esc((byId(S.postes, c.posteId) || {}).titre || 'Candidature spontanée')}</small>
        ${c.note ? `<span class="stars">${'★'.repeat(c.note)}${'☆'.repeat(5 - c.note)}</span>` : ''}
        ${(c.entretiens || []).filter(x => !x.fait).slice(0, 1).map(x => `<small>🗣️ ${fmtDate(x.date)}${x.heure ? ' · ' + esc(x.heure) : ''}</small>`).join('')}</div>`).join('')}</div>`; }).join('')}</div>
      <p class="mini">Glissez une carte d'une colonne à l'autre pour faire avancer une candidature, ou cliquez dessus pour ouvrir la fiche.</p>`;
    $$('.cand', body).forEach(c => { c.ondragstart = e => e.dataTransfer.setData('text/plain', c.dataset.cand); c.onclick = () => formCandidat(byId(S.candidats, c.dataset.cand)); });
    $$('.col', body).forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('over'); }; col.ondragleave = () => col.classList.remove('over');
      col.ondrop = e => { e.preventDefault(); const c = byId(S.candidats, e.dataTransfer.getData('text/plain')); if (!c) return;
        c.etape = col.dataset.etape; sauver(); rendre(); toast(c.nom + ' → ' + etape(c.etape)[2]);
        if (c.etape === 'embauche') proposerContrat(c); };
    });
  }
  if (t === 'postes') {
    body.innerHTML = `<div class="grid3">${postes.map(x => { const cs = mine(S.candidats).filter(c => c.posteId === x.id);
      return `<div class="card glass"><div class="hd"><h3>${esc(x.titre)}</h3><span class="pill ${x.statut === 'ouvert' ? 'payee' : x.statut === 'pourvu' ? 'envoyee' : 'brouillon'} right">${STATUTS_POSTE[x.statut]}</span></div>
        <div class="bd"><div class="mini">${esc(typeContrat(x.type)[2])}${x.lieu ? ' · ' + esc(x.lieu) : ''}${x.remuneration ? ' · ' + esc(x.remuneration) : ''}</div>
        <p style="font-size:13px;color:var(--ink-2);white-space:pre-line;max-height:90px;overflow:hidden">${esc(x.description || '')}</p>
        <div class="hstat"><div><div class="l">Candidats</div><div class="v">${cs.length}</div></div><div><div class="l">En entretien</div><div class="v">${cs.filter(c => ['entretien', 'test', 'offre'].includes(c.etape)).length}</div></div></div>
        <div class="row-acts" style="margin-top:12px"><button class="btn sm" data-do="editerPoste" data-id="${x.id}">✏️ Modifier</button><button class="btn sm" data-do="pdfPoste" data-id="${x.id}">📄 Fiche de poste</button>
          <button class="btn sm" data-go="recrutement" data-p="${P({ t: 'suivi', poste: x.id })}">🧭 Suivi</button></div></div></div>`; }).join('')
      || '<div class="card glass"><div class="empty">Aucun poste. Créez une fiche de poste pour y rattacher des candidatures.</div></div>'}</div>`;
  }
  if (t === 'candidats') {
    body.innerHTML = filtrePoste + `<div class="card glass"><div class="bd flush tblwrap"><table class="t"><thead><tr><th>Candidat</th><th>Poste</th><th>Source</th><th>Reçue le</th><th>Étape</th><th>Note</th><th class="c">CV</th></tr></thead><tbody>
      ${cands.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(c => `<tr class="click" data-do="ficheCandidat" data-id="${c.id}"><td><b>${esc(c.nom)}</b><div class="mini">${esc(c.email || '')} ${esc(c.tel || '')}</div></td>
        <td>${esc((byId(S.postes, c.posteId) || {}).titre || 'Spontanée')}</td><td>${esc(c.source || '')}</td><td>${fmtDate(c.date)}</td><td>${etape(c.etape)[1]} ${etape(c.etape)[2]}</td>
        <td class="stars">${c.note ? '★'.repeat(c.note) : ''}</td><td class="c">${c.cv ? `<button class="btn sm" data-do="voirCv" data-id="${c.id}">📄</button>` : ''}</td></tr>`).join('')
      || '<tr><td colspan="7"><div class="empty">Aucun candidat.</div></td></tr>'}</tbody></table></div></div>`;
  }
};

function formPoste(x) {
  const nouveau = !x; x = x || { id: uid(), activiteId: S.activiteId, statut: 'ouvert', type: 'cdi', date: today() };
  modal({ titre: nouveau ? '📌 Nouveau poste' : '📌 ' + esc(x.titre), taille: 'wide', corps: `<div class="form">
    ${champ('titre', 'Intitulé du poste', x.titre, { req: true, two: true, ph: 'Graphiste junior, assistant·e administratif·ve…' })}
    ${champ('statut', 'Statut', x.statut, { type: 'select', options: Object.entries(STATUTS_POSTE) })}
    ${champ('type', 'Type de contrat envisagé', x.type, { type: 'select', options: TYPES_CONTRAT.filter(t => ['cdi', 'cdd', 'freelance', 'stage', 'alternance', 'autre'].includes(t[0])).map(([k, e, l]) => [k, e + ' ' + l]) })}
    ${champ('lieu', 'Lieu / télétravail', x.lieu)}${champ('remuneration', 'Rémunération envisagée', x.remuneration, { ph: 'Ex. : 2 200 € brut / mois' })}
    ${champ('debut', 'Prise de poste souhaitée', x.debut, { type: 'date' })}${champ('date', "Date d'ouverture", x.date, { type: 'date' })}
    ${champ('description', 'Missions', x.description, { type: 'textarea', full: true })}
    ${champ('profil', 'Profil recherché (compétences, expérience)', x.profil, { type: 'textarea', full: true })}
    ${champ('diffusion', 'Où l\'offre est diffusée', x.diffusion, { full: true, ph: 'France Travail, LinkedIn, site, bouche-à-oreille…' })}</div>`,
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async c => { if (await confirmer('Supprimer ce poste ? Les candidats resteront, sans poste rattaché.', 'Supprimer', true)) {
      S.postes = S.postes.filter(y => y.id !== x.id); S.candidats.forEach(k => { if (k.posteId === x.id) k.posteId = ''; }); sauver(); c(); rendre(); } } } : null,
      '|', { lab: 'Annuler', fn: c => c() }, { lab: 'Enregistrer', cls: 'primary', fn: (c, b) => { if (manque(b)) return; Object.assign(x, lireForm(b)); if (nouveau) S.postes.push(x); sauver(); c(); toast('Poste enregistré.'); rendre(); } }].filter(Boolean) });
}
ACT.nouveauPoste = () => formPoste();
ACT.editerPoste = ds => formPoste(byId(S.postes, ds.id));
ACT.pdfPoste = ds => {
  const x = byId(S.postes, ds.id), a = act();
  imprimer(`<div class="paper"><div class="doc"><div class="d-top"><div class="d-emet">${a.logo ? `<img src="${a.logo}" alt="">` : ''}<div><div class="nm">${esc(a.nom)}</div><div class="ad">${adresseBloc(a)}</div></div></div>
    <div class="d-type"><h1 style="font-size:20px">Offre d'emploi</h1><div class="dt">${fmtDate(x.date)}</div></div></div><div class="d-band"></div>
    <h2 style="font-family:Georgia,serif;font-style:italic;color:#3E2A97;margin:0 0 6px">${esc(x.titre)}</h2>
    <p style="color:#555068">${esc(typeContrat(x.type)[2])}${x.lieu ? ' · ' + esc(x.lieu) : ''}${x.remuneration ? ' · ' + esc(x.remuneration) : ''}${x.debut ? ' · à partir du ' + fmtDate(x.debut) : ''}</p>
    <div class="d-info" style="grid-template-columns:1fr"><div><h4>Vos missions</h4><p>${esc(x.description || '')}</p></div><div><h4>Profil recherché</h4><p>${esc(x.profil || '')}</p></div>
    <div><h4>Pour candidater</h4><p>${esc(a.email || '')}${a.tel ? ' · ' + esc(a.tel) : ''}</p></div></div></div></div>`, 'Offre ' + x.titre);
};

function formCandidat(c, defaut = {}) {
  const nouveau = !c; c = c || Object.assign({ id: uid(), activiteId: S.activiteId, etape: 'nouveau', date: today(), note: 0, entretiens: [] }, defaut);
  let cv = null, lireEnt = () => {};
  let ents = clone(c.entretiens || []); // copie de travail : « Annuler » ne garde rien
  const postes = [['', 'Candidature spontanée'], ...mine(S.postes).map(x => [x.id, x.titre])];
  modal({ titre: nouveau ? '👤 Nouveau candidat' : '👤 ' + esc(c.nom), sous: nouveau ? '' : etape(c.etape)[1] + ' ' + etape(c.etape)[2], taille: 'wide', corps: `<div class="form" id="cd-f">
    ${champ('nom', 'Nom et prénom', c.nom, { req: true })}${champ('posteId', 'Poste', c.posteId, { type: 'select', options: postes })}
    ${champ('email', 'E-mail', c.email, { type: 'email' })}${champ('tel', 'Téléphone', c.tel)}
    ${champ('source', 'Source', c.source, { attrs: 'list="src-list"', ph: 'LinkedIn, France Travail, cooptation…' })}<datalist id="src-list">${['LinkedIn', 'France Travail', 'Indeed', 'Welcome to the Jungle', 'Cooptation', 'Candidature spontanée', 'École', 'Site internet'].map(s => `<option value="${s}">`).join('')}</datalist>
    ${champ('date', 'Candidature reçue le', c.date, { type: 'date' })}
    ${champ('etape', 'Étape', c.etape, { type: 'select', options: ETAPES_CANDIDAT.map(([k, e, l]) => [k, e + ' ' + l]) })}
    ${champ('note', 'Appréciation', c.note, { type: 'select', options: [[0, '—'], [1, '★'], [2, '★★'], [3, '★★★'], [4, '★★★★'], [5, '★★★★★']], num: true })}
    ${champ('notes', 'Notes (compétences, disponibilité, prétentions…)', c.notes, { type: 'textarea', full: true })}
    ${champ('motif', 'Motif si non retenu·e', c.motif, { full: true, ph: 'Lié aux compétences ou au poste uniquement' })}
    <div class="fl full"><span>CV / lettre de motivation</span><div class="row-acts" id="cd-cv"></div></div></div>
    <div class="fsec" style="margin-top:20px">Entretiens</div><div id="cd-ent"></div>
    <button class="btn sm" type="button" id="cd-add">➕ Planifier un entretien</button>`,
    onOpen: b => {
      const peindreCv = () => { const j = cv ? { nom: cv.name } : c.cv;
        $('#cd-cv', b).innerHTML = (j ? `<span class="tag">📄 ${esc(j.nom)}</span>` : '') + (c.cv && !cv ? '<button class="btn sm" type="button" data-j="voir">Ouvrir</button>' : '') + `<button class="btn sm lav" type="button" data-j="ajout">${j ? 'Remplacer' : '📎 Joindre le CV'}</button>`;
        $$('[data-j]', b).forEach(y => y.onclick = async () => { if (y.dataset.j === 'voir') ouvrirFichier(c.cv); else { const fs = await choisirFichiers({ accept: 'application/pdf,image/*,.doc,.docx,.odt' }); if (fs[0]) { cv = fs[0]; peindreCv(); } } }); };
      const peindreEnt = () => {
        $('#cd-ent', b).innerHTML = ents.map((e, i) => `<div class="form" data-ent="${i}" style="margin-bottom:12px;padding:12px;border:1px solid var(--border);border-radius:14px">
          ${champ('date', 'Date', e.date, { type: 'date' })}${champ('heure', 'Heure', e.heure, { type: 'time' })}
          ${champ('mode', 'Format', e.mode, { type: 'select', options: ['Présentiel', 'Visio', 'Téléphone'] })}${champ('avec', 'Avec', e.avec)}
          ${champ('compteRendu', 'Compte rendu', e.compteRendu, { type: 'textarea', full: true })}
          <div class="full row-acts">${champ('fait', 'Entretien réalisé', e.fait, { type: 'check' })}<button class="btn sm danger right" type="button" data-sup="${i}">Retirer</button></div></div>`).join('') || '<p class="mini">Aucun entretien planifié.</p>';
        $$('[data-sup]', b).forEach(y => y.onclick = () => { lireEnt(); ents.splice(+y.dataset.sup, 1); peindreEnt(); });
      };
      lireEnt = () => $$('[data-ent]', b).forEach(f => Object.assign(ents[+f.dataset.ent], lireForm(f)));
      $('#cd-add', b).onclick = () => { lireEnt(); ents.push({ id: uid(), date: addDays(today(), 3), heure: '10:00', mode: 'Visio', avec: '', fait: false }); if (c.etape === 'nouveau' || c.etape === 'preselection') $('#cd-f [name="etape"]', b).value = 'entretien'; peindreEnt(); };
      peindreCv(); peindreEnt();
    },
    pied: [!nouveau ? { lab: '🗑️ Supprimer', cls: 'danger', fn: async cl => { if (await confirmer('Supprimer définitivement le dossier de ' + esc(c.nom) + ' (et son CV) ?', 'Supprimer', true)) {
      if (c.cv) IDB.del(c.cv.id); S.candidats = S.candidats.filter(y => y.id !== c.id); sauver(); cl(); rendre(); } } } : null,
      !nouveau ? { lab: '✉️ E-mail', fn: cl => { cl(); emailCandidat(c); } } : null,
      !nouveau ? { lab: '✍️ Créer le contrat', fn: cl => { cl(); contratDepuisCandidat(c); } } : null,
      '|', { lab: 'Annuler', fn: cl => cl() }, { lab: 'Enregistrer', cls: 'primary', fn: async (cl, b) => {
        if (manque($('#cd-f', b))) return; lireEnt(); c.entretiens = ents; const avant = byId(S.candidats, c.id) ? byId(S.candidats, c.id).etape : ''; Object.assign(c, lireForm($('#cd-f', b)));
        if (cv) { if (c.cv) IDB.del(c.cv.id); c.cv = await stockerFichier(cv); }
        if (nouveau) S.candidats.push(c); sauver(); cl(); toast('Dossier enregistré.'); rendre();
        if (c.etape === 'embauche' && avant !== 'embauche') proposerContrat(c); } }].filter(Boolean) });
}
ACT.nouveauCandidat = () => formCandidat(null, ROUTE.p.poste ? { posteId: ROUTE.p.poste } : {});
ACT.ficheCandidat = ds => formCandidat(byId(S.candidats, ds.id));
ACT.voirCv = ds => ouvrirFichier(byId(S.candidats, ds.id).cv);

function emailCandidat(c) {
  const a = act(), poste = (byId(S.postes, c.posteId) || {}).titre || 'votre candidature spontanée';
  const e = (c.entretiens || []).find(x => !x.fait);
  const modeles = {
    accuse: ['Accusé de réception', `Votre candidature — ${poste}`, `Bonjour ${c.nom},\n\nNous avons bien reçu votre candidature pour le poste de ${poste} et vous en remercions. Nous l'étudions avec attention et reviendrons vers vous rapidement.\n\nBien cordialement,\n${a.signature || a.nom}`],
    entretien: ["Invitation à un entretien", `Entretien — ${poste}`, `Bonjour ${c.nom},\n\nVotre candidature pour le poste de ${poste} a retenu notre attention. Nous vous proposons un entretien${e ? ` le ${fmtDateLong(e.date)}${e.heure ? ' à ' + e.heure : ''} (${(e.mode || '').toLowerCase()})` : ''}.\n\nMerci de nous confirmer votre disponibilité.\n\nBien cordialement,\n${a.signature || a.nom}`],
    refus: ['Réponse négative (courtoise)', `Votre candidature — ${poste}`, `Bonjour ${c.nom},\n\nNous vous remercions pour l'intérêt que vous portez à ${a.nom} et pour le temps consacré à votre candidature. Après examen, nous ne sommes pas en mesure d'y donner une suite favorable pour le poste de ${poste}.\n\nNous vous souhaitons pleine réussite dans vos recherches.\n\nBien cordialement,\n${a.signature || a.nom}`],
    offre: ['Proposition', `Proposition — ${poste}`, `Bonjour ${c.nom},\n\nNous avons le plaisir de vous proposer de nous rejoindre au poste de ${poste}. Vous trouverez ci-joint notre proposition détaillée.\n\nNous restons à votre disposition pour en échanger.\n\nBien cordialement,\n${a.signature || a.nom}`]
  };
  modal({ titre: '✉️ Écrire à ' + esc(c.nom), taille: 'narrow', corps: `<div class="stack" style="gap:8px">${Object.entries(modeles).map(([k, [l]]) => `<button class="btn" data-m="${k}">${l}</button>`).join('')}</div>`,
    onOpen: (b, mm) => $$('[data-m]', b).forEach(x => x.onclick = () => { const [, sujet, corps] = modeles[x.dataset.m]; mm.close();
      fenetreEmail({ titre: '✉️ ' + esc(c.nom), a: c.email || '', sujet, corps, lab: 'Noter dans le dossier', apres: () => { c.notes = (c.notes ? c.notes + '\n' : '') + fmtDate(today()) + ' — e-mail : ' + modeles[x.dataset.m][0]; sauver(); } }); }) });
}
async function proposerContrat(c) {
  if (mine(S.contrats).some(k => k.candidatId === c.id)) return;
  if (await confirmer(`🎉 ${esc(c.nom)} est recruté·e ! Préparer maintenant son contrat ?`, 'Préparer le contrat')) contratDepuisCandidat(c);
}
