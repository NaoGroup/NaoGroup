'use strict';
/* ============================================================
   NaoStudy — les gestes : formulaires, révision progressive, quiz,
   plannings, documents, sauvegarde, réinitialisation, décor animé.
   ============================================================ */

const ACT = {};

/* ---------- petites aides de formulaire ---------- */
const matDefaut = () => U.mat || (matieresDe()[0] || {}).id || '';
function champMat(val, lab = 'Matière', vide = false) {
  const m = matieresDe(), v = val === undefined ? matDefaut() : val;
  return `<div class="champ"><label>${lab}</label><select name="matiere" data-nouvelle>${vide ? `<option value="" ${!v ? 'selected' : ''}>— Aucune —</option>` : ''}${m.map(x => `<option value="${x.id}" ${x.id === v ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}
    <option value="__nouvelle" ${!m.length && !vide ? 'selected' : ''}>＋ Nouvelle matière…</option></select>
    <input name="nouvelleMat" placeholder="Nom de la nouvelle matière" ${m.length || vide ? 'hidden' : ''} style="margin-top:6px"></div>`;
}
function resoudreMat(o) {
  if (o.matiere !== '__nouvelle') return o.matiere || '';
  const nom = (o.nouvelleMat || '').trim(); if (!nom) return '';
  const deja = matieresDe().find(m => sansAccent(m.nom) === sansAccent(nom)); if (deja) return deja.id;
  const m = { id: uid(), profil: pid(), nom, couleur: COULEURS[matieresDe().length % COULEURS.length], coef: 1 };
  S.matieres.push(m); return m.id;
}
const couleursChoix = (nom, val) => `<div class="couleurs">${COULEURS.map(c => `<label style="--c:${c}" title="${c}"><input type="radio" name="${nom}" value="${c}" ${c === val ? 'checked' : ''}></label>`).join('')}</div>`;
const options = (l, v) => l.map(x => `<option value="${esc(x.id)}" ${x.id === v ? 'selected' : ''}>${x.e ? x.e + ' ' : ''}${esc(x.nom)}</option>`).join('');
function brancherForm(f) {
  $$('[data-f="annuler"]', f).forEach(b => b.addEventListener('click', fermerModale));
  $$('select[data-nouvelle]', f).forEach(s => {
    const i = s.parentNode.querySelector('[name="nouvelleMat"]');
    s.addEventListener('change', () => { i.hidden = s.value !== '__nouvelle'; if (!i.hidden) i.focus(); });
  });
}
/* Une fenêtre avec un formulaire : `faire(o, form)` renvoie false pour la garder ouverte. */
function modaleForm(html, faire, large, apres) {
  ouvrirModale(`<form autocomplete="off" novalidate>${html}</form>`, f => {
    brancherForm(f);
    const form = $('form', f);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const r = await faire(lireForm(form), form);
      if (r === false) return;
      sauver(); fermerModale(); rendre(); verifierBadges();
    });
    if (apres) apres(f, form);
  }, large);
}
const piedForm = (suppr, extra = '') => `<div class="pied-fen">${suppr ? `<button type="button" class="btn fin" data-f="suppr" style="color:var(--alerte)">🗑 Supprimer</button>` : ''}${extra}
  <div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="submit" class="btn">Enregistrer</button></div></div>`;
/* Supprimer, avec « Annuler » pendant quelques secondes. */
function supprimer(cle, obj, libelle) {
  const i = S[cle].indexOf(obj); if (i < 0) return;
  S[cle].splice(i, 1); sauver(); fermerModale(); rendre();
  toast(esc(libelle) + ' supprimé·e.', { action: 'Annuler', faire: () => { S[cle].splice(i, 0, obj); sauver(); rendre(); } });
}
function brancherSuppr(f, cle, obj, libelle) { const b = $('[data-f="suppr"]', f); if (b) b.addEventListener('click', () => supprimer(cle, obj, libelle)); }
function exigerProfil() { if (pid()) return true; ACT['profil-nouveau'](); return false; }

/* ============================================================
   Profils, matières et contrôle parental
   ============================================================ */
function formProfil(p) {
  const nouveau = !p; p = p || { prenom: '', niveau: '', etab: '', couleur: COULEURS[S.profils.length % COULEURS.length], emoji: '', partageNotes: false };
  const cyc = cycleDe(p.niveau || '6e');
  modaleForm(`<h3 id="modaleTitre"><span>${nouveau ? '👤' : '✏️'}</span>${nouveau ? 'Nouveau profil' : 'Modifier le profil'}</h3>
    <p class="sous">Un profil par enfant, adolescent ou étudiant. Un prénom ou un pseudo suffit : aucune autre donnée personnelle n’est demandée.</p>
    <div class="champs"><div class="champ"><label>Prénom ou pseudo</label><input name="prenom" value="${esc(p.prenom)}" required maxlength="30"></div>
      <div class="champ"><label>Niveau scolaire</label><select name="niveau" id="fNiveau"><option value="">—</option>${NIVEAUX.map(g => `<optgroup label="${g.g}">${g.l.map(n => `<option ${n === p.niveau ? 'selected' : ''}>${n}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <div class="champ plein"><label>Établissement <small>(facultatif)</small></label><input name="etab" value="${esc(p.etab)}" maxlength="60"></div></div>
    <div class="champ" style="margin-top:12px"><span class="lab">Couleur</span>${couleursChoix('couleur', p.couleur)}</div>
    <div class="champ"><span class="lab">Un symbole <small>(facultatif, sinon l’initiale)</small></span><div class="choix"><label><input type="radio" name="emoji" value="" ${!p.emoji ? 'checked' : ''}> Initiale</label>${EMOJIS.map(e => `<label><input type="radio" name="emoji" value="${e}" ${p.emoji === e ? 'checked' : ''}> ${e}</label>`).join('')}</div></div>
    ${nouveau ? `<div class="champ"><span class="lab">Matières suivies <small>(modifiables ensuite)</small></span><div class="choix" id="fMats">${matsProposees(cyc)}</div></div>` : ''}
    <label class="check" style="padding-left:0"><input type="checkbox" name="partageNotes" ${p.partageNotes ? 'checked' : ''}><span class="lib">Montrer la moyenne indicative dans la vue parent <small style="font-family:var(--ui);color:var(--ink-3)">(les notes détaillées restent privées)</small></span></label>
    ${piedForm(!nouveau)}`, async o => {
    if (!o.prenom) { toast('Indiquez un prénom ou un pseudo.'); return false; }
    Object.assign(p, { prenom: o.prenom, niveau: o.niveau, etab: o.etab, couleur: o.couleur || p.couleur, emoji: o.emoji || '', partageNotes: !!o.partageNotes });
    if (nouveau) {
      p.id = uid(); S.profils.push(p); S.reglages.profil = p.id; U.parent = false; U.vue = 'accueil';
      (o.mats || []).forEach((n, i) => S.matieres.push({ id: uid(), profil: p.id, nom: n, couleur: COULEURS[i % COULEURS.length], coef: 1 }));
      toast(`Bienvenue ${esc(p.prenom)} ✨`);
    }
  }, false, (f) => {
    const n = $('#fNiveau', f), z = $('#fMats', f);
    if (n && z) n.addEventListener('change', () => { z.innerHTML = matsProposees(cycleDe(n.value)); });
    if (!nouveau) $('[data-f="suppr"]', f).addEventListener('click', async () => {
      if (!(await exigerParent('Supprimer un profil demande le code parent.'))) return;
      if (!(await confirmer('Supprimer le profil de ' + p.prenom + ' ?', 'Tout ce qui le concerne est effacé : emploi du temps, devoirs, fiches, notes, documents… Ce geste ne se rattrape pas.', 'Supprimer'))) return;
      ['matieres', 'cours', 'devoirs', 'evals', 'fiches', 'cartes', 'quiz', 'revisions', 'objectifs', 'notes', 'journal', 'orientation', 'sessions'].forEach(k => { S[k] = S[k].filter(x => x.profil !== p.id); });
      S.documents.filter(d => d.profil === p.id).forEach(d => fichierOter(d.id).catch(() => {}));
      S.documents = S.documents.filter(d => d.profil !== p.id);
      S.profils = S.profils.filter(x => x !== p); delete S.defis[p.id]; delete S.badges[p.id];
      S.reglages.profil = (S.profils[0] || {}).id || ''; sauver(); rendre(); toast('Profil supprimé.');
    });
  });
}
const matsProposees = cyc => (MATIERES_TYPE[cyc] || MATIERES_TYPE.Autre).map(n => `<label><input type="checkbox" name="mats" data-multi="1" value="${esc(n)}" checked> ${esc(n)}</label>`).join('');

function formMatiere(m) {
  const nouveau = !m; m = m || { nom: '', couleur: COULEURS[matieresDe().length % COULEURS.length], prof: '', salle: '', coef: 1 };
  modaleForm(`<h3 id="modaleTitre"><span>🎨</span>${nouveau ? 'Nouvelle matière' : esc(m.nom)}</h3>
    <div class="champs"><div class="champ"><label>Nom</label><input name="nom" value="${esc(m.nom)}" required></div>
      <div class="champ"><label>Coefficient <small>(pour la moyenne indicative)</small></label><input name="coef" type="number" min="0" step="0.5" value="${esc(m.coef || 1)}"></div>
      <div class="champ"><label>Enseignant·e <small>(facultatif)</small></label><input name="prof" value="${esc(m.prof)}"></div>
      <div class="champ"><label>Salle habituelle <small>(facultatif)</small></label><input name="salle" value="${esc(m.salle)}"></div></div>
    <div class="champ" style="margin-top:12px"><span class="lab">Couleur</span>${couleursChoix('couleur', m.couleur)}</div>
    ${piedForm(!nouveau)}`, o => {
    if (!o.nom) { toast('Donnez un nom à la matière.'); return false; }
    Object.assign(m, { nom: o.nom, coef: +o.coef || 1, prof: o.prof, salle: o.salle, couleur: o.couleur || m.couleur });
    if (nouveau) { m.id = uid(); m.profil = pid(); S.matieres.push(m); }
  }, false, f => brancherSuppr(f, 'matieres', m, 'La matière'));
}

ACT['profil'] = el => { S.reglages.profil = el.dataset.id; U.parent = false; U.mat = ''; U.q = ''; U.aide = null; sauver(); rendre(); scrollTo(0, 0); };
ACT['profil-nouveau'] = async () => { if (S.profils.length && !(await exigerParent('Créer un profil demande le code parent.'))) return; formProfil(null); };
ACT['vue-parent'] = async () => { if (!(await exigerParent('La vue parent est protégée par le code parent.'))) return; U.parent = true; rendre(); scrollTo(0, 0); };
ACT['reglages'] = () => {
  const p = profil(), c = S.reglages.codeParent;
  ouvrirModale(`<h3 id="modaleTitre"><span>⚙️</span>Profils, matières et contrôle parental</h3>
    <h4 style="margin:10px 0 8px;font-style:italic">Les profils du foyer</h4>
    <div class="lignes">${S.profils.map(x => `<div class="ligne compacte cliquable" data-f="profil" data-id="${x.id}"><span class="pastille-p" style="--c:${x.couleur};width:30px;height:30px;font-size:14px">${x.emoji || initiale(x)}</span><div class="corps"><div class="t">${esc(x.prenom)}</div><div class="s"><span>${esc(x.niveau || 'Niveau non précisé')}</span>${x.etab ? `<span>${esc(x.etab)}</span>` : ''}</div></div><span class="ico-btn">✏️</span></div>`).join('') || '<div class="vide">Aucun profil.</div>'}</div>
    <button type="button" class="btn petit fin" data-f="profil-nouveau" style="margin-top:8px">＋ Ajouter un profil</button>
    ${p ? `<h4 style="margin:20px 0 8px;font-style:italic">Les matières de ${esc(p.prenom)}</h4>
    <div class="puces">${matieresDe().map(m => `<button type="button" class="puce" data-f="matiere" data-id="${m.id}"><span class="mat" style="--c:${m.couleur}"></span>${esc(m.nom)}${+m.coef !== 1 ? ` <small>×${esc(m.coef)}</small>` : ''}</button>`).join('')}
      <button type="button" class="puce" data-f="matiere-nouvelle">＋ Matière</button></div>` : ''}
    <h4 style="margin:20px 0 8px;font-style:italic">👪 Contrôle parental</h4>
    <p class="sous" style="margin-bottom:10px">Un code parent (4 à 8 chiffres) protège la vue parent, la création et la suppression des profils, et la réinitialisation. C’est un rideau de confidentialité entre les membres du foyer, pas un coffre-fort : quelqu’un qui a les droits de l’ordinateur peut toujours lire la mémoire du navigateur.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn petit" data-f="code">${c ? '🔑 Changer le code parent' : '🔑 Créer un code parent'}</button>${c ? '<button type="button" class="btn petit fin" data-f="code-oter">Retirer le code</button>' : ''}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`, f => {
    brancherForm(f);
    $$('[data-f="profil"]', f).forEach(b => b.addEventListener('click', () => formProfil(S.profils.find(x => x.id === b.dataset.id))));
    $$('[data-f="matiere"]', f).forEach(b => b.addEventListener('click', () => formMatiere(matiere(b.dataset.id))));
    const mn = $('[data-f="matiere-nouvelle"]', f); if (mn) mn.addEventListener('click', () => formMatiere(null));
    $('[data-f="profil-nouveau"]', f).addEventListener('click', () => ACT['profil-nouveau']());
    $('[data-f="code"]', f).addEventListener('click', async () => {
      if (!(await exigerParent('Entrez le code actuel pour le changer.'))) return;
      modaleForm(`<h3 id="modaleTitre"><span>🔑</span>Code parent</h3><p class="sous">4 à 8 chiffres. Notez-le quelque part : il ne peut pas être retrouvé.</p>
        <div class="champs"><div class="champ"><label>Nouveau code</label><input name="a" type="password" inputmode="numeric" maxlength="8"></div><div class="champ"><label>Encore une fois</label><input name="b" type="password" inputmode="numeric" maxlength="8"></div></div>${piedForm(false)}`, async o => {
        if (!/^\d{4,8}$/.test(o.a)) { toast('Le code doit faire 4 à 8 chiffres.'); return false; }
        if (o.a !== o.b) { toast('Les deux codes ne sont pas identiques.'); return false; }
        await poserCodeParent(o.a); parentDeverrouille = true; toast('Code parent enregistré 🔑');
      });
    });
    const co = $('[data-f="code-oter"]', f); if (co) co.addEventListener('click', async () => { if (!(await exigerParent('Entrez le code pour le retirer.'))) return; await poserCodeParent(''); toast('Code parent retiré.'); fermerModale(); rendre(); });
  }, true);
};

/* ============================================================
   L'emploi du temps
   ============================================================ */
const DUREES = [[30, '30 min'], [45, '45 min'], [55, '55 min'], [60, '1 h'], [90, '1 h 30'], [110, '2 × 55 min'], [120, '2 h'], [180, '3 h']];
function formCours(c, preset = {}) {
  const nouveau = !c, pr = profil(), ab = pr && pr.semainesAB;
  c = c || Object.assign({ type: 'cours', jour: jourSemaine(U.edtDate) > 6 ? 1 : jourSemaine(U.edtDate), debut: '08:00', fin: '09:00', salle: '', prof: '', titre: '', semaine: 'toutes' }, preset);
  const dureeAct = minutes(c.fin) - minutes(c.debut);
  modaleForm(`<h3 id="modaleTitre"><span>🗓️</span>${nouveau ? 'Ajouter un cours' : 'Modifier le cours'}</h3>
    <p class="sous">${nouveau ? 'Il se répète chaque semaine, le même jour, aux mêmes horaires.' : `${esc(Maj(JOURS[+c.jour % 7]))}, de ${heureAff(c.debut)} à ${heureAff(c.fin)}.`}</p>
    <div class="champ"><div class="choix">${[['cours', '📘 Cours'], ['option', '✨ Option'], ['activite', '⚽ Activité']].map(([k, n]) => `<label><input type="radio" name="type" value="${k}" ${c.type === k ? 'checked' : ''}> ${n}</label>`).join('')}</div></div>
    <div id="zMat">${champMat(c.matiere)}</div>
    <div class="champ" id="zTitre" ${c.type === 'activite' ? '' : 'hidden'}><label>Nom de l’activité</label><input name="titre" value="${esc(c.titre)}" placeholder="Judo, conservatoire, soutien…"></div>
    ${nouveau ? `<div class="champ"><span class="lab">Jour${'s'} <small>(plusieurs si le cours revient dans la semaine)</small></span><div class="choix">${[1, 2, 3, 4, 5, 6, 7].map(j => `<label><input type="checkbox" name="jours" data-multi="1" value="${j}" ${+c.jour === j ? 'checked' : ''}> ${Maj(JOURS_C[j % 7])}</label>`).join('')}</div></div>`
      : `<div class="champ"><label>Jour</label><select name="jour">${[1, 2, 3, 4, 5, 6, 7].map(j => `<option value="${j}" ${+c.jour === j ? 'selected' : ''}>${Maj(JOURS[j % 7])}</option>`).join('')}</select></div>`}
    <div class="champs"><div class="champ"><label>Début</label><input name="debut" type="time" value="${esc(c.debut)}" step="300"></div>
      <div class="champ"><label>Fin</label><input name="fin" type="time" value="${esc(c.fin)}" step="300"></div></div>
    <div class="champ" style="margin-top:8px"><span class="lab">Durée</span><div class="choix" id="zDurees">${DUREES.map(([n, l]) => `<label><input type="radio" name="duree" value="${n}" ${dureeAct === n ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>
    ${ab ? `<div class="champ"><span class="lab">Semaine</span><div class="choix">${[['toutes', 'Toutes les semaines'], ['A', 'Semaine A'], ['B', 'Semaine B']].map(([k, n]) => `<label><input type="radio" name="semaine" value="${k}" ${(c.semaine || 'toutes') === k ? 'checked' : ''}> ${n}</label>`).join('')}</div></div>`
      : `<p style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3);margin:0 0 10px">Ton établissement alterne semaine A et semaine B ? Coche « Semaines A / B » au-dessus de la grille.</p>`}
    <div class="champs"><div class="champ"><label>Salle</label><input name="salle" value="${esc(c.salle)}" placeholder="${esc((matiere(c.matiere) || {}).salle || 'B12')}"></div>
      <div class="champ"><label>Enseignant·e / intervenant·e</label><input name="prof" value="${esc(c.prof)}" placeholder="${esc((matiere(c.matiere) || {}).prof || '')}"></div></div>
    ${nouveau ? `<label class="check" style="padding-left:0;margin-top:8px"><input type="checkbox" name="encore"><span class="lib">Ajouter le cours suivant juste après</span></label>` : ''}
    ${piedForm(!nouveau, nouveau ? '' : '<button type="button" class="btn fin" data-f="dupliquer">⧉ Dupliquer</button>')}`, o => {
    if (minutes(o.fin) <= minutes(o.debut)) { toast('L’heure de fin doit venir après le début.'); return false; }
    const mat = o.type === 'activite' ? (o.matiere === '__nouvelle' && !o.nouvelleMat ? '' : resoudreMat(o)) : resoudreMat(o);
    if (o.type !== 'activite' && !mat) { toast('Choisissez une matière.'); return false; }
    if (o.type === 'activite' && !o.titre) { toast('Donnez un nom à l’activité.'); return false; }
    const jours = nouveau ? (o.jours || []).map(Number) : [+o.jour];
    if (!jours.length) { toast('Choisissez au moins un jour.'); return false; }
    const base = { type: o.type, matiere: o.type === 'activite' ? '' : mat, titre: o.titre, debut: o.debut, fin: o.fin, salle: o.salle, prof: o.prof, semaine: o.semaine || c.semaine || 'toutes' };
    if (nouveau) jours.forEach(j => S.cours.push(Object.assign({}, c, base, { id: uid(), profil: pid(), jour: j })));
    else Object.assign(c, base, { jour: jours[0] });
    if (nouveau && jours.length > 1) toast(`${jours.length} cours ajoutés ✓`);
    if (o.encore) setTimeout(() => formCours(null, { jour: jours[0], debut: o.fin, fin: hm(minutes(o.fin) + minutes(o.fin) - minutes(o.debut)), semaine: base.semaine }), 50);
  }, false, f => {
    brancherSuppr(f, 'cours', c, 'Le cours');
    $$('[name="type"]', f).forEach(r => r.addEventListener('change', () => { const a = r.value === 'activite'; $('#zTitre', f).hidden = !a; $('#zMat', f).hidden = a; }));
    $('#zMat', f).hidden = c.type === 'activite';
    /* la durée et l'heure de fin restent d'accord, dans les deux sens */
    const deb = $('[name="debut"]', f), fin = $('[name="fin"]', f);
    const caler = () => { const n = minutes(fin.value) - minutes(deb.value); $$('[name="duree"]', f).forEach(r => { r.checked = +r.value === n; }); };
    $$('[name="duree"]', f).forEach(r => r.addEventListener('change', () => { fin.value = hm(Math.min(23 * 60 + 55, minutes(deb.value) + +r.value)); }));
    deb.addEventListener('change', () => { const r = $('[name="duree"]:checked', f); if (r) fin.value = hm(Math.min(23 * 60 + 55, minutes(deb.value) + +r.value)); else caler(); });
    fin.addEventListener('change', caler);
    const dup = $('[data-f="dupliquer"]', f);
    if (dup) dup.addEventListener('click', () => { fermerModale(); formCours(null, Object.assign({}, c, { id: undefined })); });
  });
}
ACT['cours-nouveau'] = () => exigerProfil() && formCours(null);
ACT['cours'] = el => { if (glisse.bloquerClic) return; formCours(S.cours.find(c => c.id === el.dataset.id)); };
ACT['edt-mode'] = el => { U.edt = el.dataset.m; rendre(); };
ACT['edt-nav'] = el => { const n = +el.dataset.n, d = dateDe(U.edtDate); if (U.edt === 'mois') { d.setDate(1); d.setMonth(d.getMonth() + n); U.edtDate = iso(d); } else U.edtDate = plusJours(U.edtDate, n * (U.edt === 'jour' ? 1 : 7)); rendre(); };
ACT['edt-auj'] = () => { U.edtDate = auj(); rendre(); };
ACT['edt-jour'] = el => { U.edtDate = el.dataset.d; U.edt = 'jour'; rendre(); };
/* semaine A / B : on indique que la semaine affichée est l'autre lettre, et tout le calendrier suit */
ACT['ab-inverser'] = () => { const p = profil(); p.refA = plusJours(lundiDe(p.refA || auj()), 7); sauver(); rendre(); toast('C’est noté : semaine ' + semaineAB(U.edtDate) + ' ✓'); };
function basculerAB(on) {
  const p = profil(); if (!p) return;
  p.semainesAB = on; if (on && !p.refA) p.refA = lundiDe(auj());
  sauver(); rendre();
  if (on) toast('Semaines A / B activées. Cette semaine est la semaine ' + semaineAB(U.edtDate) + ' — sinon, clique sur « C’est une semaine… ».', { duree: 6500 });
}

/* ---------- la grille, à la main : cliquer une case vide, glisser un cours, tirer sa durée ---------- */
const PAS = 5;    /* tout se cale sur 5 minutes (les cours de 55 min existent) */
const glisse = { el: null, bloquerClic: false };
function infosGrille() { const g = $('#grilleEdt'); return g ? { g, debut: +g.dataset.debut, fin: +g.dataset.fin, hh: parseFloat(getComputedStyle(g).getPropertyValue('--hh')) || 52 } : null; }
const minutesA = (col, y, gi) => gi.debut + Math.round(((y - col.getBoundingClientRect().top) / gi.hh * 60) / PAS) * PAS;
document.addEventListener('pointermove', e => {
  /* le fantôme « ＋ » suit la souris dans les cases vides */
  const col = e.target.closest && e.target.closest('.jourcol');
  $$('.jourcol .fantome.vu').forEach(x => { if (!col || x.parentNode !== col || e.target.closest('.creneau')) x.classList.remove('vu'); });
  if (glisse.el || !col || e.target.closest('.creneau') || e.pointerType === 'touch') return;
  const gi = infosGrille(); if (!gi) return;
  const m = Math.max(gi.debut, Math.min(gi.fin - 60, Math.floor((minutesA(col, e.clientY, gi) - gi.debut) / 30) * 30 + gi.debut));
  const f = $('.fantome', col); f.style.top = ((m - gi.debut) / 60 * gi.hh) + 'px'; f.style.height = (gi.hh - 2) + 'px'; f.dataset.m = m; f.textContent = '＋ ' + heureAff(hm(m)); f.classList.add('vu');
});
document.addEventListener('click', e => {
  const col = e.target.closest && e.target.closest('.jourcol');
  if (!col || e.target.closest('.creneau') || glisse.bloquerClic) return;
  const gi = infosGrille(); if (!gi) return;
  const m = Math.max(gi.debut, Math.floor((minutesA(col, e.clientY, gi) - gi.debut) / 30) * 30 + gi.debut);
  const pr = profil(), ab = semaineAB(U.edtDate);
  formCours(null, { jour: +col.dataset.jour, debut: hm(m), fin: hm(Math.min(23 * 60 + 55, m + 60)), semaine: 'toutes' });
  if (pr && pr.semainesAB && ab) setTimeout(() => toast(`Astuce : ce cours n’a lieu qu’en semaine ${ab} ? Choisis-le dans « Semaine ».`, { duree: 5000 }), 400);
});
document.addEventListener('pointerdown', e => {
  const cr = e.target.closest && e.target.closest('.creneau');
  if (!cr || e.button !== 0) return;
  const c = S.cours.find(x => x.id === cr.dataset.id), gi = infosGrille(); if (!c || !gi) return;
  const redim = !!e.target.closest('[data-poignee]');
  Object.assign(glisse, { el: cr, c, gi, redim, x0: e.clientX, y0: e.clientY, bouge: false, d0: minutes(c.debut), f0: minutes(c.fin), jour: +c.jour, id: e.pointerId });
  if (redim) e.preventDefault();
});
document.addEventListener('pointermove', e => {
  const s = glisse; if (!s.el || e.pointerId !== s.id) return;
  const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
  if (!s.bouge) { if (Math.hypot(dx, dy) < 6) return; s.bouge = true; s.el.classList.add('deplace'); try { s.el.setPointerCapture(e.pointerId); } catch (er) {} }
  e.preventDefault();
  const dm = Math.round(dy / s.gi.hh * 60 / PAS) * PAS;
  if (s.redim) {
    s.f = Math.max(s.d0 + 15, Math.min(23 * 60 + 55, s.f0 + dm)); s.d = s.d0; s.j = s.jour;
  } else {
    const len = s.f0 - s.d0; s.d = Math.max(0, Math.min(23 * 60 + 55 - len, s.d0 + dm)); s.f = s.d + len;
    /* la colonne sous le doigt */
    const cols = $$('#grilleEdt .jourcol'), sous = cols.find(k => { const r = k.getBoundingClientRect(); return e.clientX >= r.left && e.clientX < r.right; });
    s.j = sous ? +sous.dataset.jour : s.jour;
    if (sous && s.el.parentNode !== sous) sous.appendChild(s.el);
  }
  s.el.style.top = ((s.d - s.gi.debut) / 60 * s.gi.hh) + 'px';
  s.el.style.height = Math.max(22, (s.f - s.d) / 60 * s.gi.hh - 2) + 'px';
  s.el.style.left = '3px'; s.el.style.width = 'calc(100% - 6px)';
  const sm = s.el.querySelector('small'); if (sm) sm.textContent = heureAff(hm(s.d)) + ' – ' + heureAff(hm(s.f));
}, { passive: false });
function finGlisse(e) {
  const s = glisse; if (!s.el || (e && e.pointerId !== s.id)) return;
  const el = s.el; s.el = null;
  if (!s.bouge) return;
  el.classList.remove('deplace');
  s.bloquerClic = true; setTimeout(() => { s.bloquerClic = false; }, 60);
  const avant = { debut: s.c.debut, fin: s.c.fin, jour: s.c.jour };
  Object.assign(s.c, { debut: hm(s.d), fin: hm(s.f), jour: s.j });
  sauver(); rendre();
  toast(`${esc(s.c.type === 'activite' ? s.c.titre : nomMat(s.c.matiere))} : ${esc(JOURS[s.j % 7])} ${heureAff(s.c.debut)} – ${heureAff(s.c.fin)}`, { action: 'Annuler', faire: () => { Object.assign(s.c, avant); sauver(); rendre(); } });
}
document.addEventListener('pointerup', finGlisse);
document.addEventListener('pointercancel', e => { if (glisse.el) { glisse.el = null; rendre(); } });

/* ============================================================
   Les devoirs
   ============================================================ */
function formDevoir(d) {
  const nouveau = !d; d = d || { titre: '', consigne: '', pour: plusJours(auj(), 1), duree: 30, prio: 'moyenne', statut: 'a-commencer', rappel: '1', docs: [] };
  const docs = (d.docs || []).map(id => S.documents.find(x => x.id === id)).filter(Boolean);
  modaleForm(`<h3 id="modaleTitre"><span>📚</span>${nouveau ? 'Ajouter un devoir' : 'Le devoir'}</h3>
    <div class="champs">${champMat(d.matiere)}<div class="champ"><label>À rendre le</label><input name="pour" type="date" value="${esc(d.pour)}"></div>
      <div class="champ plein"><label>Titre</label><input name="titre" value="${esc(d.titre)}" placeholder="Exercices 4 à 7 p. 52" required></div>
      <div class="champ plein"><label>Consigne</label><textarea name="consigne" placeholder="Recopiez la consigne telle qu’elle a été donnée.">${esc(d.consigne)}</textarea></div>
      <div class="champ"><label>Temps estimé</label><select name="duree">${[10, 15, 20, 30, 45, 60, 90, 120, 180].map(n => `<option value="${n}" ${+d.duree === n ? 'selected' : ''}>${duree(n)}</option>`).join('')}</select></div>
      <div class="champ"><label>Priorité</label><select name="prio">${options(PRIOS, d.prio)}</select></div>
      <div class="champ"><label>Statut</label><select name="statut">${options(STATUTS, d.statut)}</select></div>
      <div class="champ"><label>Rappel</label><select name="rappel">${RAPPELS.map(r => `<option value="${r.v}" ${String(d.rappel) === r.v ? 'selected' : ''}>${r.n}</option>`).join('')}</select></div></div>
    <div class="champ" style="margin-top:12px"><span class="lab">Documents joints <small>(photo de la consigne, PDF…)</small></span>
      ${docs.length ? `<div class="puces" style="margin-bottom:6px">${docs.map(x => `<button type="button" class="puce" data-f="doc" data-id="${x.id}">📎 ${esc(x.titre)}</button>`).join('')}</div>` : ''}
      <div class="fichier-zone"><input type="file" name="fichiers" multiple accept="image/*,application/pdf" aria-label="Joindre des fichiers"></div></div>
    ${d.notesAide ? `<details class="plus-d"><summary>Mes réflexions (aide pas à pas)</summary><div style="white-space:pre-wrap;color:var(--ink-2);margin-top:6px">${esc(d.notesAide)}</div></details>` : ''}
    ${nouveau ? '' : `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
      <button type="button" class="btn petit" data-f="aide">💡 M’aider pas à pas</button>
      <button type="button" class="btn petit fin" data-f="agenda" title="Copier pour l’ajouter dans NaoAgenda">📅 Vers NaoAgenda${d.liens && d.liens.agenda ? ' ✓' : ''}</button>
      <button type="button" class="btn petit fin" data-f="daily" title="Copier pour en faire une tâche dans NaoDaily">✅ Tâche NaoDaily${d.liens && d.liens.daily ? ' ✓' : ''}</button>
      <button type="button" class="btn petit fin" disabled style="opacity:.5" title="NaoList arrive bientôt">📝 NaoList · bientôt</button></div>`}
    ${piedForm(!nouveau)}`, async (o, form) => {
    const mat = resoudreMat(o);
    if (!o.titre) { toast('Donnez un titre au devoir.'); return false; }
    const avant = d.statut;
    Object.assign(d, { matiere: mat, titre: o.titre, consigne: o.consigne, pour: o.pour, duree: +o.duree, prio: o.prio, statut: o.statut, rappel: o.rappel });
    if (d.statut === 'rendu' && avant !== 'rendu') d.renduLe = auj();
    if (nouveau) { d.id = uid(); d.profil = pid(); d.cree = auj(); d.docs = []; S.devoirs.push(d); }
    await joindreFichiers(form.fichiers.files, { matiere: mat, type: 'consigne', chapitre: '', devoir: d.id }, ids => d.docs.push(...ids));
    if (nouveau) toast('Devoir ajouté 📚');
  }, true, f => {
    brancherSuppr(f, 'devoirs', d, 'Le devoir');
    $$('[data-f="doc"]', f).forEach(b => b.addEventListener('click', () => voirDoc(S.documents.find(x => x.id === b.dataset.id))));
    const a = $('[data-f="aide"]', f); if (a) a.addEventListener('click', () => choisirAide(d));
    const g = $('[data-f="agenda"]', f); if (g) g.addEventListener('click', () => versOutil('agenda', d));
    const y = $('[data-f="daily"]', f); if (y) y.addEventListener('click', () => versOutil('daily', d));
  });
}
async function joindreFichiers(files, base, apres) {
  const ids = [];
  for (const fi of Array.from(files || [])) {
    if (fi.size > 25 * 1048576) { toast(`« ${esc(fi.name)} » dépasse 25 Mo : il n’a pas été joint.`); continue; }
    const id = uid();
    try { await fichierPoser(id, fi); } catch (e) { toast('Ce navigateur ne permet pas de garder des fichiers.'); break; }
    S.documents.push(Object.assign({ id, profil: pid(), titre: fi.name.replace(/\.[^.]+$/, ''), annee: anneeScolaire(), ajout: new Date().toISOString(), fichier: { nom: fi.name, mime: fi.type, taille: fi.size } }, base));
    ids.push(id);
  }
  if (ids.length) apres(ids);
}
ACT['devoir-nouveau'] = () => exigerProfil() && formDevoir(null);
ACT['devoir'] = el => formDevoir(S.devoirs.find(d => d.id === el.dataset.id));
ACT['devoir-statut'] = el => {
  const d = S.devoirs.find(x => x.id === el.dataset.id), i = STATUTS.findIndex(s => s.id === d.statut) + +el.dataset.sens;
  if (i < 0 || i >= STATUTS.length) return;
  d.statut = STATUTS[i].id; if (d.statut === 'rendu') { d.renduLe = auj(); toast('Rendu ! Bravo 📬'); }
  sauver(); rendre(); verifierBadges();
};

/* NaoStudy n'écrit jamais dans un autre outil : il prépare le texte, l'utilisateur le colle. */
function versOutil(outil, x, estEval) {
  const t = estEval ? `${typeEval(x.type).nom} de ${nomMat(x.matiere)}${x.titre ? ' — ' + x.titre : ''} · ${dateLongue(x.date)}${x.heure ? ' à ' + heureAff(x.heure) : ''}`
    : `Devoir de ${nomMat(x.matiere)} — ${x.titre}${x.pour ? ' · à rendre ' + dateLongue(x.pour) : ''}${x.duree ? ' · ' + duree(x.duree) : ''}`;
  const nom = outil === 'agenda' ? 'NaoAgenda' : 'NaoDaily', chemin = outil === 'agenda' ? '../NaoAgenda/NaoAgenda.html' : '../NaoDaily/NaoDaily.html';
  copier(t).then(ok => {
    x.liens = Object.assign({}, x.liens, { [outil]: true }); sauver();
    ouvrirModale(`<h3 id="modaleTitre"><span>${outil === 'agenda' ? '📅' : '✅'}</span>Vers ${nom}</h3>
      <p class="sous">${ok ? 'Le texte est copié : ouvrez ' + nom + ' et collez-le (Ctrl + V) dans une nouvelle ' + (outil === 'agenda' ? 'échéance' : 'tâche') + '.' : 'Copiez ce texte, puis collez-le dans ' + nom + ' :'}</p>
      <div class="note"><span class="e">📋</span><div style="user-select:all">${esc(t)}</div></div>
      <p style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3)">Rien n’est envoyé automatiquement : c’est vous qui choisissez ce qui va dans vos autres outils.</p>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button><a class="btn" href="${chemin}" target="_blank" rel="noopener">Ouvrir ${nom} ↗</a></div></div>`, brancherForm);
  });
}
ACT['vers-agenda'] = el => { const v = S.evals.find(x => x.id === el.dataset.id); if (v) versOutil('agenda', v, true); };

/* ============================================================
   Les contrôles et leur planning de révisions
   ============================================================ */
function formEval(v) {
  const nouveau = !v; v = v || { type: 'controle', titre: '', date: plusJours(auj(), 7), heure: '', chapitres: '' };
  modaleForm(`<h3 id="modaleTitre"><span>📝</span>${nouveau ? 'Ajouter un contrôle' : 'Le contrôle'}</h3>
    <div class="champ"><div class="choix">${TYPES_EVAL.map(t => `<label><input type="radio" name="type" value="${t.id}" ${v.type === t.id ? 'checked' : ''}> ${t.e} ${t.nom}</label>`).join('')}</div></div>
    <div class="champs">${champMat(v.matiere)}<div class="champ"><label>Titre <small>(facultatif)</small></label><input name="titre" value="${esc(v.titre)}" placeholder="Chapitre 3 — les fractions"></div>
      <div class="champ"><label>Date</label><input name="date" type="date" value="${esc(v.date)}" required></div>
      <div class="champ"><label>Heure <small>(facultatif)</small></label><input name="heure" type="time" value="${esc(v.heure)}"></div>
      <div class="champ plein"><label>Ce qu’il faut revoir</label><textarea name="chapitres" placeholder="Chapitres, leçons, exercices types…">${esc(v.chapitres)}</textarea></div></div>
    ${nouveau ? `<label class="check" style="padding-left:0"><input type="checkbox" name="planning" checked><span class="lib">Me proposer un planning de révisions</span></label>` : ''}
    ${piedForm(!nouveau)}`, o => {
    const mat = resoudreMat(o);
    if (!o.date) { toast('Indiquez une date.'); return false; }
    Object.assign(v, { type: o.type, matiere: mat, titre: o.titre, date: o.date, heure: o.heure, chapitres: o.chapitres });
    if (nouveau) { v.id = uid(); v.profil = pid(); S.evals.push(v); if (o.planning && ecart(v.date) > 0) setTimeout(() => formPlanning(v), 60); }
  }, false, f => brancherSuppr(f, 'evals', v, 'Le contrôle'));
}
ACT['eval-nouveau'] = () => exigerProfil() && formEval(null);
ACT['eval'] = el => formEval(S.evals.find(v => v.id === el.dataset.id));
ACT['planning-eval'] = el => formPlanning(S.evals.find(v => v.id === el.dataset.id));

/* Un planning avant un contrôle : des séances espacées, de plus en plus actives. */
function propositionPlanning(v, nb, min) {
  const jours = ecart(v.date); if (jours <= 0) return [];
  const offs = [14, 10, 7, 5, 3, 2, 1].filter(o => o <= jours).slice(-nb);
  const types = ['relire', 'fiche', 'cartes', 'exos', 'quiz', 'cartes', 'quiz'];
  return offs.map((o, i) => ({ date: plusJours(v.date, -o), type: v.type === 'oral' && i === offs.length - 1 ? 'oral' : types[Math.min(types.length - 1, i + (7 - offs.length))], duree: o === 1 ? Math.min(min, 20) : min }));
}
function formPlanning(v) {
  if (!v) return;
  const existant = duProfil(S.revisions).filter(r => r.evalId === v.id);
  const jours = ecart(v.date);
  if (jours <= 0) { toast('Ce contrôle est aujourd’hui ou déjà passé.'); return; }
  const rendu = (nb, min) => propositionPlanning(v, nb, min).map(s => `<div class="ligne compacte" style="margin-bottom:6px"><span class="pic">${typeRev(s.type).e}</span><div class="corps"><div class="t">${esc(typeRev(s.type).nom)}</div><div class="s"><span>${esc(Maj(dateLongue(s.date)))}</span><span>${duree(s.duree)}</span></div></div><span class="badge">J-${ecart(v.date) - ecart(s.date)}</span></div>`).join('');
  modaleForm(`<h3 id="modaleTitre"><span>🗓️</span>Planning de révisions</h3>
    <p class="sous">${esc(typeEval(v.type).nom)} de ${esc(nomMat(v.matiere))} ${esc(dans(v.date))}. Des séances courtes et espacées : on relit d’abord, on s’entraîne ensuite, et la veille reste légère.</p>
    ${existant.length ? `<div class="note douce"><span class="e">ℹ️</span><div>Un planning existe déjà (${pluriel(existant.length, 'séance')}). Le recréer remplace les séances non faites.</div></div>` : ''}
    <div class="champs"><div class="champ"><label>Nombre de séances</label><select name="nb" id="pNb">${[2, 3, 4, 5, 6, 7].map(n => `<option ${n === Math.min(5, Math.max(2, jours)) ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="champ"><label>Durée d’une séance</label><select name="min" id="pMin">${[15, 20, 25, 30, 45].map(n => `<option value="${n}" ${n === 25 ? 'selected' : ''}>${n} min</option>`).join('')}</select></div></div>
    <div id="pApercu" style="margin-top:12px">${rendu(Math.min(5, Math.max(2, jours)), 25)}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="submit" class="btn">✓ Créer le planning</button></div></div>`, o => {
    S.revisions = S.revisions.filter(r => !(r.evalId === v.id && !r.fait));
    const l = propositionPlanning(v, +o.nb, +o.min);
    l.forEach(s => S.revisions.push({ id: uid(), profil: pid(), matiere: v.matiere, evalId: v.id, date: s.date, type: s.type, duree: s.duree, titre: typeRev(s.type).nom + (v.titre ? ' — ' + v.titre : ''), fait: false }));
    toast(`Planning créé : ${pluriel(l.length, 'séance')} 🗓️`);
  }, false, f => {
    const maj = () => { $('#pApercu', f).innerHTML = rendu(+$('#pNb', f).value, +$('#pMin', f).value); };
    $('#pNb', f).addEventListener('change', maj); $('#pMin', f).addEventListener('change', maj);
  });
}

/* ---------- les séances de révision ---------- */
function formRev(r) {
  const nouveau = !r; r = r || { type: 'relire', titre: '', date: auj(), duree: 20 };
  modaleForm(`<h3 id="modaleTitre"><span>🧠</span>${nouveau ? 'Ajouter une séance' : 'La séance'}</h3>
    <div class="champs">${champMat(r.matiere)}<div class="champ"><label>Type</label><select name="type">${options(TYPES_REV, r.type)}</select></div>
      <div class="champ plein"><label>Ce que je révise <small>(facultatif)</small></label><input name="titre" value="${esc(r.titre)}" placeholder="Le théorème de Pythagore"></div>
      <div class="champ"><label>Date</label><input name="date" type="date" value="${esc(r.date)}"></div>
      <div class="champ"><label>Durée</label><select name="duree">${[10, 15, 20, 25, 30, 45, 60].map(n => `<option value="${n}" ${+r.duree === n ? 'selected' : ''}>${n} min</option>`).join('')}</select></div></div>
    ${piedForm(!nouveau)}`, o => {
    Object.assign(r, { matiere: resoudreMat(o), type: o.type, titre: o.titre, date: o.date || auj(), duree: +o.duree });
    if (nouveau) { r.id = uid(); r.profil = pid(); r.fait = false; S.revisions.push(r); }
  }, false, f => brancherSuppr(f, 'revisions', r, 'La séance'));
}
ACT['rev-nouveau'] = () => exigerProfil() && formRev(null);
ACT['rev-suppr'] = el => { const r = S.revisions.find(x => x.id === el.dataset.id); if (r) supprimer('revisions', r, 'La séance'); };
ACT['rev-sous'] = el => { U.rev = el.dataset.s; U.q = ''; rendre(); };
function cocherRev(id, on) {
  const r = S.revisions.find(x => x.id === id); if (!r) return;
  r.fait = on;
  if (on) { noterSession('revision', r.duree || 20, r.matiere); toast('Séance faite, bravo ! 🌟'); }
  else { const i = S.sessions.findIndex(s => s.quoi === 'revision' && s.date === auj() && s.matiere === r.matiere && s.profil === r.profil); if (i >= 0) S.sessions.splice(i, 1); }
  sauver(); rendre(); verifierBadges();
}

/* ---------- les modèles de planning ---------- */
const MODELES = [
  { id: 'cours', e: '📘', nom: 'Semaine de cours', d: 'Chaque jour d’école, 20 min pour relire les cours du jour.', jours: 7, cible: false },
  { id: 'revisions', e: '🧠', nom: 'Semaine de révisions', d: 'Deux séances par jour en alternant les matières.', jours: 7, parJour: 2, cible: false },
  { id: 'brevet', e: '🎓', nom: 'Brevet', d: 'Français, maths, histoire-géo, sciences, et l’oral — jusqu’à la date.', parJour: 1, cible: true, mats: ['Français', 'Mathématiques', 'Histoire-Géographie', 'SVT', 'Physique-Chimie'] },
  { id: 'bac', e: '🏛️', nom: 'Bac', d: 'Philosophie, spécialités et grand oral, en séances régulières.', parJour: 2, cible: true, mats: ['Philosophie', 'Français'] },
  { id: 'partiels', e: '🎒', nom: 'Partiels', d: 'Chaque matière revient tous les deux ou trois jours.', parJour: 2, cible: true },
  { id: 'concours', e: '🏅', nom: 'Concours', d: 'Une séance chaque jour, et des annales chaque semaine.', parJour: 1, cible: true },
  { id: 'oral', e: '🎤', nom: 'Préparation d’un oral', d: 'Plan, notes, chrono, répétitions, répétition générale.', etapes: [[10, 'fiche', 'Faire le plan'], [7, 'fiche', 'Préparer les notes (mots-clés)'], [5, 'oral', 'Répéter à voix haute, chronométré'], [3, 'oral', 'Répéter devant quelqu’un'], [1, 'oral', 'Répétition générale']], cible: true },
  { id: 'dm', e: '📄', nom: 'Devoir maison', d: 'Découper le DM en étapes jusqu’au rendu.', etapes: [[6, 'relire', 'Lire la consigne et relire le cours'], [5, 'exos', 'Faire le brouillon'], [3, 'exos', 'Rédiger au propre'], [1, 'relire', 'Relire et vérifier']], cible: true }
];
ACT['modeles'] = () => {
  if (!exigerProfil()) return;
  const mats = matieresDe();
  modaleForm(`<h3 id="modaleTitre"><span>🧩</span>Modèles de planning</h3><p class="sous">Choisissez un modèle : NaoStudy prépare les séances, vous les ajustez ensuite.</p>
    <div class="methodes" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">${MODELES.map((m, i) => `<label class="methode" style="display:block"><input type="radio" name="modele" value="${m.id}" ${i ? '' : 'checked'} style="accent-color:#7C6BE0"> <span class="e">${m.e}</span><b>${esc(m.nom)}</b><small>${esc(m.d)}</small></label>`).join('')}</div>
    <div class="champs" style="margin-top:14px"><div class="champ" id="zCible"><label>Date de l’épreuve / du rendu</label><input name="cible" type="date" value="${plusJours(auj(), 14)}"></div>
      <div class="champ"><label>Durée d’une séance</label><select name="min">${[15, 20, 25, 30, 45].map(n => `<option value="${n}" ${n === 25 ? 'selected' : ''}>${n} min</option>`).join('')}</select></div></div>
    ${mats.length ? `<div class="champ"><span class="lab">Matières concernées</span><div class="choix">${mats.map(m => `<label><input type="checkbox" name="mats" data-multi="1" value="${m.id}" checked> ${esc(m.nom)}</label>`).join('')}</div></div>` : '<div class="note douce"><span class="e">ℹ️</span><div>Ajoutez d’abord des matières (⚙️) pour répartir les séances.</div></div>'}
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="submit" class="btn">✓ Créer les séances</button></div></div>`, o => {
    const m = MODELES.find(x => x.id === o.modele), min = +o.min;
    let ids = (o.mats || []).length ? o.mats : mats.map(x => x.id);
    if (m.mats) { const pref = ids.filter(id => m.mats.some(n => sansAccent(nomMat(id)).startsWith(sansAccent(n).slice(0, 5)))); if (pref.length) ids = pref.concat(ids.filter(i => !pref.includes(i))); }
    if (!ids.length && !m.etapes) { toast('Aucune matière à répartir.'); return false; }
    const ajout = [], cible = o.cible;
    if (m.cible && (!cible || ecart(cible) <= 0)) { toast('Choisissez une date à venir.'); return false; }
    if (m.etapes) m.etapes.forEach(([j, t, titre]) => { const d = plusJours(cible, -j); if (d >= auj()) ajout.push({ date: d, type: t, titre, matiere: ids[0] || '' }); });
    else if (m.id === 'cours') for (let i = 0; i < 7; i++) { const d = plusJours(auj(), i), c = coursDuJour(d); if (!c.length) continue; ajout.push({ date: d, type: 'relire', titre: 'Relire les cours du jour : ' + [...new Set(c.map(x => nomMat(x.matiere)))].slice(0, 3).join(', '), matiere: c[0].matiere }); }
    else {
      const n = m.cible ? Math.min(60, ecart(cible)) : m.jours, types = ['relire', 'fiche', 'cartes', 'exos', 'quiz'];
      let k = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < (m.parJour || 1); j++) {
        const d = plusJours(auj(), i), mat = ids[k % ids.length];
        const annales = m.id === 'concours' && jourSemaine(d) === 6;
        ajout.push({ date: d, type: annales ? 'exos' : types[Math.floor(k / ids.length) % types.length], titre: annales ? 'Annales, en conditions réelles' : '', matiere: mat });
        k++;
      }
      if (m.id === 'bac' || m.id === 'brevet') ajout.push({ date: plusJours(cible, -2), type: 'oral', titre: m.id === 'bac' ? 'Grand oral : répétition' : 'Oral du brevet : répétition', matiere: ids[0] });
    }
    ajout.forEach(a => S.revisions.push({ id: uid(), profil: pid(), matiere: a.matiere, date: a.date, type: a.type, titre: a.titre || typeRev(a.type).nom, duree: annalesDuree(a, min), fait: false, modele: m.id }));
    U.vue = 'revisions'; U.rev = 'planning';
    toast(`${m.nom} : ${pluriel(ajout.length, 'séance')} ajoutée${ajout.length > 1 ? 's' : ''} 🗓️`);
  }, true, f => {
    const maj = () => { const m = MODELES.find(x => x.id === ($('[name="modele"]:checked', f) || {}).value); $('#zCible', f).hidden = !(m && m.cible); };
    $$('[name="modele"]', f).forEach(r => r.addEventListener('change', maj)); maj();
  });
};
const annalesDuree = (a, min) => a.titre && a.titre.startsWith('Annales') ? Math.max(min, 60) : min;

/* ============================================================
   Les fiches
   ============================================================ */
function ligneDef(t = '', d = '') { return `<div class="def-ligne"><input data-def="t" value="${esc(t)}" placeholder="Mot ou notion" aria-label="Mot"><input data-def="d" value="${esc(d)}" placeholder="Sa définition" aria-label="Définition"><button type="button" class="ico-btn" data-f="def-oter" aria-label="Retirer">✕</button></div>`; }
function formFiche(fi) {
  const nouveau = !fi; fi = fi || { titre: '', chapitre: '', resume: '', motscles: '', defs: [], exemples: '', difficile: false };
  modaleForm(`<h3 id="modaleTitre"><span>🗂️</span>${nouveau ? 'Créer une fiche' : 'Modifier la fiche'}</h3>
    <div class="champs">${champMat(fi.matiere)}<div class="champ"><label>Chapitre</label><input name="chapitre" value="${esc(fi.chapitre)}" placeholder="Chapitre 4"></div>
      <div class="champ plein"><label>Titre</label><input name="titre" value="${esc(fi.titre)}" required placeholder="La Révolution française"></div>
      <div class="champ plein"><label>Résumé <small>(avec tes mots)</small></label><textarea name="resume" rows="4">${esc(fi.resume)}</textarea></div>
      <div class="champ plein"><label>Mots-clés <small>(séparés par des virgules)</small></label><input name="motscles" value="${esc(fi.motscles)}" placeholder="monarchie, Tiers état, 1789"></div></div>
    <div class="champ" style="margin-top:12px"><span class="lab">Définitions</span><div id="defs">${(fi.defs.length ? fi.defs : [{ t: '', d: '' }]).map(x => ligneDef(x.t, x.d)).join('')}</div>
      <button type="button" class="btn petit fin" data-f="def-plus" style="align-self:flex-start">＋ Une définition</button></div>
    <div class="champ"><label>Exemples</label><textarea name="exemples">${esc(fi.exemples)}</textarea></div>
    <div class="champ"><span class="lab">Image <small>(schéma, carte, photo du cours)</small></span><div class="fichier-zone">${fi.image ? '<span class="nom">🖼️ Une image est jointe.</span><label class="choix"><label><input type="checkbox" name="oterImage"> La retirer</label></label>' : ''}<input type="file" name="image" accept="image/*" aria-label="Joindre une image"></div></div>
    <label class="check" style="padding-left:0"><input type="checkbox" name="difficile" ${fi.difficile ? 'checked' : ''}><span class="lib">🔁 Notion difficile : la faire revenir plus souvent</span></label>
    ${piedForm(!nouveau)}`, async (o, form) => {
    if (!o.titre) { toast('Donnez un titre à la fiche.'); return false; }
    const defs = $$('.def-ligne', form).map(l => ({ t: $('[data-def="t"]', l).value.trim(), d: $('[data-def="d"]', l).value.trim() })).filter(x => x.t || x.d);
    Object.assign(fi, { matiere: resoudreMat(o), chapitre: o.chapitre, titre: o.titre, resume: o.resume, motscles: o.motscles, defs, exemples: o.exemples, difficile: !!o.difficile, maj: new Date().toISOString() });
    if (nouveau) { fi.id = uid(); fi.profil = pid(); fi.cree = auj(); S.fiches.push(fi); noterSession('fiche', 10, fi.matiere); }
    const img = form.image.files[0];
    if (o.oterImage && fi.image) { fichierOter(fi.image).catch(() => {}); fi.image = ''; }
    if (img) { const id = 'img-' + fi.id; try { await fichierPoser(id, img); fi.image = id; } catch (e) { toast('L’image n’a pas pu être gardée.'); } }
    if (nouveau) toast('Fiche créée 🗂️');
  }, true, f => {
    brancherSuppr(f, 'fiches', fi, 'La fiche');
    $('[data-f="def-plus"]', f).addEventListener('click', () => { $('#defs', f).insertAdjacentHTML('beforeend', ligneDef()); $('#defs .def-ligne:last-child input', f).focus(); });
    $('#defs', f).addEventListener('click', e => { if (e.target.closest('[data-f="def-oter"]')) e.target.closest('.def-ligne').remove(); });
  });
}
function voirFiche(fi) {
  const mots = (fi.motscles || '').split(',').map(s => s.trim()).filter(Boolean);
  ouvrirModale(`<h3 id="modaleTitre"><span>🗂️</span>${esc(fi.titre)}</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:var(--ui);font-size:13px;color:var(--ink-3)">${puceMat(fi.matiere)}${fi.chapitre ? `<span>${esc(fi.chapitre)}</span>` : ''}${fi.difficile ? '<span class="badge bientot">🔁 Revient souvent</span>' : ''}</div>
    <div class="fiche-vue">${fi.resume ? `<h4>Résumé</h4><div class="texte">${esc(fi.resume)}</div>` : ''}
      ${mots.length ? `<h4>Mots-clés</h4><div class="mots">${mots.map(m => `<span>${esc(m)}</span>`).join('')}</div>` : ''}
      ${fi.defs.length ? `<h4>Définitions</h4><dl>${fi.defs.map(d => `<dt>${esc(d.t)}</dt><dd>${esc(d.d)}</dd>`).join('')}</dl>` : ''}
      ${fi.exemples ? `<h4>Exemples</h4><div class="texte">${esc(fi.exemples)}</div>` : ''}
      ${fi.image ? '<h4>Image</h4><div id="ficheImg"></div>' : ''}</div>
    <div class="pied-fen">${fi.defs.length ? `<button type="button" class="btn petit fin" data-f="cartes">🃏 Transformer en flashcards</button>` : ''}
      <button type="button" class="btn petit fin" data-f="diff">${fi.difficile ? '✓ Je la maîtrise mieux' : '🔁 Notion difficile'}</button>
      <div class="droite"><button type="button" class="btn fin" data-f="modifier">✏️ Modifier</button><button type="button" class="btn" data-f="lue">✓ Relue</button></div></div>`, f => {
    if (fi.image) fichierLire(fi.image).then(b => { if (b) $('#ficheImg', f).innerHTML = `<img src="${URL.createObjectURL(b)}" alt="Image de la fiche">`; }).catch(() => {});
    $('[data-f="modifier"]', f).addEventListener('click', () => formFiche(fi));
    $('[data-f="lue"]', f).addEventListener('click', () => { noterSession('fiche', 5, fi.matiere); fi.relue = auj(); sauver(); fermerModale(); rendre(); verifierBadges(); toast('Fiche relue ✓'); });
    $('[data-f="diff"]', f).addEventListener('click', () => { fi.difficile = !fi.difficile; sauver(); fermerModale(); rendre(); });
    const c = $('[data-f="cartes"]', f); if (c) c.addEventListener('click', () => {
      let n = 0;
      fi.defs.forEach(d => { if (!d.t || !d.d || S.cartes.some(x => x.profil === pid() && x.recto === d.t && x.matiere === fi.matiere)) return; S.cartes.push({ id: uid(), profil: pid(), matiere: fi.matiere, paquet: fi.chapitre || fi.titre, recto: d.t, verso: d.d, boite: 1, prochaine: auj() }); n++; });
      sauver(); fermerModale(); rendre(); toast(n ? `${pluriel(n, 'flashcard')} créée${n > 1 ? 's' : ''} 🃏` : 'Ces flashcards existent déjà.');
    });
  }, true);
}
ACT['fiche-nouveau'] = () => exigerProfil() && formFiche(null);
ACT['fiche'] = el => voirFiche(S.fiches.find(x => x.id === el.dataset.id));

/* ============================================================
   Les flashcards et la révision progressive
   ============================================================ */
function ligneCarte(r = '', v = '') { return `<div class="def-ligne"><input data-c="r" value="${esc(r)}" placeholder="Recto : la question" aria-label="Recto"><input data-c="v" value="${esc(v)}" placeholder="Verso : la réponse" aria-label="Verso"><button type="button" class="ico-btn" data-f="c-oter" aria-label="Retirer">✕</button></div>`; }
function formCartes(c) {
  const nouveau = !c;
  const paquets = [...new Set(duProfil(S.cartes).map(x => x.paquet).filter(Boolean))];
  modaleForm(`<h3 id="modaleTitre"><span>🃏</span>${nouveau ? 'Créer des flashcards' : 'Modifier la flashcard'}</h3>
    <div class="champs">${champMat(c ? c.matiere : undefined)}<div class="champ"><label>Paquet</label><input name="paquet" list="lPaquets" value="${esc(c ? c.paquet : '')}" placeholder="Vocabulaire unité 3"><datalist id="lPaquets">${paquets.map(p => `<option value="${esc(p)}">`).join('')}</datalist></div></div>
    <div class="champ" style="margin-top:12px"><span class="lab">${nouveau ? 'Les cartes (autant que vous voulez)' : 'La carte'}</span><div id="cartes">${c ? ligneCarte(c.recto, c.verso) : ligneCarte() + ligneCarte() + ligneCarte()}</div>
      ${nouveau ? '<button type="button" class="btn petit fin" data-f="c-plus" style="align-self:flex-start">＋ Une carte</button>' : ''}</div>
    ${c ? `<p style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3)">Boîte ${c.boite || 1} · ${(c.prochaine || auj()) <= auj() ? 'à revoir aujourd’hui' : 'revient ' + esc(dans(c.prochaine))}</p>` : ''}
    ${piedForm(!nouveau)}`, (o, form) => {
    const mat = resoudreMat(o), l = $$('.def-ligne', form).map(x => ({ r: $('[data-c="r"]', x).value.trim(), v: $('[data-c="v"]', x).value.trim() })).filter(x => x.r && x.v);
    if (!l.length) { toast('Remplissez au moins un recto et un verso.'); return false; }
    if (c) Object.assign(c, { matiere: mat, paquet: o.paquet || 'Général', recto: l[0].r, verso: l[0].v });
    else { l.forEach(x => S.cartes.push({ id: uid(), profil: pid(), matiere: mat, paquet: o.paquet || 'Général', recto: x.r, verso: x.v, boite: 1, prochaine: auj() })); toast(`${pluriel(l.length, 'flashcard')} 🃏`); }
  }, true, f => {
    if (c) brancherSuppr(f, 'cartes', c, 'La carte');
    const p = $('[data-f="c-plus"]', f); if (p) p.addEventListener('click', () => { $('#cartes', f).insertAdjacentHTML('beforeend', ligneCarte()); $('#cartes .def-ligne:last-child input', f).focus(); });
    $('#cartes', f).addEventListener('click', e => { if (e.target.closest('[data-f="c-oter"]')) e.target.closest('.def-ligne').remove(); });
  });
}
ACT['carte-nouveau'] = () => exigerProfil() && formCartes(null);
ACT['carte'] = el => formCartes(S.cartes.find(x => x.id === el.dataset.id));

function sessionFlash(cartes, titre) {
  if (!cartes.length) { toast('Aucune carte à revoir pour l’instant. 🎉'); return; }
  const file = cartes.slice().sort(() => Math.random() - .5), debut = Date.now(), vues = new Set();
  let sues = 0;
  const montrer = f => {
    const c = file[0];
    if (!c) {
      const min = Math.max(1, Math.round((Date.now() - debut) / 60000));
      noterSession('cartes', min, cartes[0].matiere, vues.size); sauver(); rendre(); verifierBadges();
      f.innerHTML = `<h3 id="modaleTitre"><span>🎉</span>Séance terminée</h3><p class="sous">${pluriel(vues.size, 'carte revue', 'cartes revues')}, dont ${sues} sue${sues > 1 ? 's' : ''} du premier coup. Les autres reviendront bientôt : c’est comme ça qu’on retient.</p>
        <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`;
      brancherForm(f); return;
    }
    f.innerHTML = `<h3 id="modaleTitre"><span>🃏</span>${esc(titre)}<span class="badge plus" style="margin-left:auto">${file.length} restante${file.length > 1 ? 's' : ''}</span></h3>
      <div style="text-align:center">${puceMat(c.matiere)}</div>
      <div class="carte-flash" style="--c:${couleurMat(c.matiere)}" tabindex="0" role="button" aria-label="Retourner la carte"><div class="interieur">
        <div class="face"><small>Recto · boîte ${c.boite || 1}</small>${esc(c.recto)}</div><div class="face dos"><small>Verso</small>${esc(c.verso)}</div></div></div>
      <p style="text-align:center;font-family:var(--ui);font-size:13px;color:var(--ink-3)" id="fAide">Cherche la réponse dans ta tête, puis clique sur la carte pour la retourner.</p>
      <div class="eval" hidden id="fEval"><button type="button" class="btn fin" data-n="0">😕 Pas encore</button><button type="button" class="btn fin" data-n="1">🤔 Presque</button><button type="button" class="btn" data-n="2">😊 Je savais</button></div>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="stop">Arrêter là</button></div></div>`;
    const cf = $('.carte-flash', f), retourner = () => { cf.classList.toggle('retournee'); $('#fEval', f).hidden = false; $('#fAide', f).hidden = true; };
    cf.addEventListener('click', retourner); cf.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); retourner(); } });
    $$('#fEval button', f).forEach(b => b.addEventListener('click', () => {
      const n = +b.dataset.n, premiere = !vues.has(c.id); vues.add(c.id);
      c.vues = (c.vues || 0) + 1;
      if (n === 2) { c.boite = Math.min(5, (c.boite || 1) + (premiere ? 1 : 0)); if (premiere) sues++; c.prochaine = plusJours(auj(), INTERVALLES[c.boite]); file.shift(); }
      else if (n === 1) { c.prochaine = plusJours(auj(), 1); file.shift(); }
      else { c.boite = 1; c.prochaine = auj(); file.push(file.shift()); }   /* elle revient dans cette séance */
      sauver(); montrer(f);
    }));
    $('[data-f="stop"]', f).addEventListener('click', () => { file.length = 0; montrer(f); });
    setTimeout(() => cf.focus(), 40);
  };
  ouvrirModale('', montrer);
}
ACT['flash-lancer'] = () => sessionFlash(cartesDues(pid(), U.vue === 'revisions' ? U.mat : ''), 'Révision progressive');
ACT['flash-paquet'] = el => sessionFlash(duProfil(S.cartes).filter(c => c.matiere === el.dataset.m && (c.paquet || 'Général') === el.dataset.p), el.dataset.p);

/* ============================================================
   Les quiz
   ============================================================ */
function blocQuestion(q = { q: '', choix: ['', '', '', ''], bonne: 0, expl: '' }, i = 0) {
  const n = 'b' + uid();
  return `<div class="carte" data-question style="padding:12px 14px;margin-bottom:10px">
    <div style="display:flex;gap:8px;align-items:center"><input data-q="q" value="${esc(q.q)}" placeholder="La question" aria-label="Question" style="flex:1;padding:10px 12px;border-radius:12px;border:1px solid var(--bord);background:var(--champ)"><button type="button" class="ico-btn" data-f="q-oter" aria-label="Retirer la question">✕</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">${[0, 1, 2, 3].map(k => `<label style="display:flex;gap:6px;align-items:center"><input type="radio" name="${n}" data-bonne value="${k}" ${+q.bonne === k ? 'checked' : ''} title="Bonne réponse" style="accent-color:#1E7F53"><input data-choix value="${esc(q.choix[k] || '')}" placeholder="Réponse ${'ABCD'[k]}${k < 2 ? '' : ' (facultatif)'}" style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;border:1px solid var(--bord);background:var(--champ)"></label>`).join('')}</div>
    <input data-q="expl" value="${esc(q.expl)}" placeholder="Explication (pourquoi c’est la bonne réponse)" style="width:100%;margin-top:8px;padding:8px 10px;border-radius:10px;border:1px solid var(--bord);background:var(--champ)"></div>`;
}
function formQuiz(z) {
  const nouveau = !z; z = z || { titre: '', questions: [] };
  modaleForm(`<h3 id="modaleTitre"><span>❓</span>${nouveau ? 'Créer un quiz' : 'Modifier le quiz'}</h3>
    <p class="sous">Cochez le rond de la bonne réponse. L’explication s’affiche après chaque question : c’est là qu’on apprend.</p>
    <div class="champs">${champMat(z.matiere)}<div class="champ"><label>Titre</label><input name="titre" value="${esc(z.titre)}" placeholder="Les fractions — entraînement"></div></div>
    <div id="questions" style="margin-top:12px">${(z.questions.length ? z.questions : [undefined]).map(blocQuestion).join('')}</div>
    <button type="button" class="btn petit fin" data-f="q-plus">＋ Une question</button>
    ${piedForm(!nouveau)}`, (o, form) => {
    const qs = $$('[data-question]', form).map(b => {
      const choix = $$('[data-choix]', b).map(i => i.value.trim()), bonne = +(($('[data-bonne]:checked', b) || {}).value || 0);
      return { q: $('[data-q="q"]', b).value.trim(), choix, bonne, expl: $('[data-q="expl"]', b).value.trim() };
    }).filter(q => q.q && q.choix.filter(Boolean).length >= 2 && q.choix[q.bonne]);
    if (!qs.length) { toast('Ajoutez au moins une question avec deux réponses, dont la bonne cochée.'); return false; }
    Object.assign(z, { matiere: resoudreMat(o), titre: o.titre || 'Quiz de ' + nomMat(resoudreMat(o)), questions: qs });
    if (nouveau) { z.id = uid(); z.profil = pid(); z.scores = []; S.quiz.push(z); toast('Quiz créé ❓'); }
  }, true, f => {
    brancherSuppr(f, 'quiz', z, 'Le quiz');
    $('[data-f="q-plus"]', f).addEventListener('click', () => $('#questions', f).insertAdjacentHTML('beforeend', blocQuestion()));
    $('#questions', f).addEventListener('click', e => { if (e.target.closest('[data-f="q-oter"]')) e.target.closest('[data-question]').remove(); });
  });
}
function jouerQuiz(z) {
  const ordre = z.questions.map((q, i) => i).sort(() => Math.random() - .5), debut = Date.now();
  let k = 0, bons = 0;
  const montrer = f => {
    if (k >= ordre.length) {
      const pc = Math.round(bons / ordre.length * 100);
      z.scores = (z.scores || []).concat({ date: auj(), n: bons, sur: ordre.length });
      noterSession('quiz', Math.max(1, Math.round((Date.now() - debut) / 60000)), z.matiere, 1);
      if (pc === 100) (S.badges[pid()] = S.badges[pid()] || {}).parfait = true;
      sauver(); rendre(); verifierBadges();
      f.innerHTML = `<h3 id="modaleTitre"><span>${pc === 100 ? '💯' : pc >= 50 ? '🌟' : '🌱'}</span>${bons} / ${ordre.length}</h3>
        <p class="sous">${pc === 100 ? 'Sans faute, bravo !' : pc >= 50 ? 'Beau travail. Relis les explications des questions manquées, puis refais le quiz dans quelques jours.' : 'C’est en se trompant qu’on repère ce qu’il faut revoir. Relis ta fiche, puis retente ta chance.'}</p>
        <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button><button type="button" class="btn" data-f="encore">↻ Recommencer</button></div></div>`;
      brancherForm(f); $('[data-f="encore"]', f).addEventListener('click', () => jouerQuiz(z)); return;
    }
    const q = z.questions[ordre[k]], choix = q.choix.map((c, i) => ({ c, i })).filter(x => x.c);
    f.innerHTML = `<h3 id="modaleTitre"><span>❓</span>${esc(z.titre)}<span class="badge plus" style="margin-left:auto">${k + 1} / ${ordre.length}</span></h3>
      <div class="prog" style="margin:4px 0 12px"><i style="width:${Math.round(k / ordre.length * 100)}%"></i></div>
      <div class="quiz-q">${esc(q.q)}</div>
      <div class="quiz-choix">${choix.map(x => `<button type="button" data-i="${x.i}">${'ABCD'[x.i]}. ${esc(x.c)}</button>`).join('')}</div>
      <div id="qExpl"></div>
      <div class="pied-fen"><button type="button" class="btn fin" data-f="annuler">Arrêter</button><div class="droite"><button type="button" class="btn" data-f="suivant" hidden>${k === ordre.length - 1 ? 'Voir mon score' : 'Question suivante ▶'}</button></div></div>`;
    brancherForm(f);
    $$('.quiz-choix button', f).forEach(b => b.addEventListener('click', () => {
      const ok = +b.dataset.i === +q.bonne; if (ok) bons++;
      $$('.quiz-choix button', f).forEach(x => { x.disabled = true; if (+x.dataset.i === +q.bonne) x.classList.add('bon'); });
      if (!ok) b.classList.add('faux');
      $('#qExpl', f).innerHTML = `<div class="note ${ok ? 'promesse' : 'douce'}" style="margin-top:12px"><span class="e">${ok ? '✅' : '💡'}</span><div>${ok ? 'Exact !' : 'Pas tout à fait.'}${q.expl ? ' ' + esc(q.expl) : ''}</div></div>`;
      const s = $('[data-f="suivant"]', f); s.hidden = false; s.focus();
      s.onclick = () => { k++; montrer(f); };
    }));
  };
  ouvrirModale('', montrer);
}
ACT['quiz-nouveau'] = () => exigerProfil() && formQuiz(null);
ACT['quiz'] = el => formQuiz(S.quiz.find(z => z.id === el.dataset.id));
ACT['quiz-jouer'] = el => jouerQuiz(S.quiz.find(z => z.id === el.dataset.id));

/* ============================================================
   « Lancer une révision » et le chrono
   ============================================================ */
ACT['lancer-revision'] = () => {
  if (!exigerProfil()) return;
  const dues = cartesDues(), qz = duProfil(S.quiz).filter(z => z.questions.length), fi = duProfil(S.fiches).slice().sort((a, b) => (b.difficile - a.difficile) || (a.relue || '').localeCompare(b.relue || ''));
  ouvrirModale(`<h3 id="modaleTitre"><span>🚀</span>Lancer une révision</h3><p class="sous">Choisis ce qui te fait envie. Même 10 minutes, ça compte.</p>
    <div class="methodes">
      <button type="button" class="methode" data-f="cartes" ${dues.length ? '' : 'disabled style="opacity:.5"'}><span class="e">🃏</span><b>Flashcards du jour</b><small>${dues.length ? pluriel(dues.length, 'carte') + ' à revoir' : 'Rien à revoir aujourd’hui'}</small></button>
      <button type="button" class="methode" data-f="quiz" ${qz.length ? '' : 'disabled style="opacity:.5"'}><span class="e">❓</span><b>Un quiz</b><small>${qz.length ? pluriel(qz.length, 'quiz', 'quiz') + ' disponibles' : 'Aucun quiz encore'}</small></button>
      <button type="button" class="methode" data-f="fiche" ${fi.length ? '' : 'disabled style="opacity:.5"'}><span class="e">🗂️</span><b>Relire une fiche</b><small>${fi.length ? 'En commençant par les notions difficiles' : 'Aucune fiche encore'}</small></button>
      <button type="button" class="methode" data-f="chrono"><span class="e">⏱️</span><b>Chrono de révision</b><small>20 minutes concentrées, puis une pause</small></button>
    </div><div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button></div></div>`, f => {
    brancherForm(f);
    $('[data-f="cartes"]', f).addEventListener('click', () => sessionFlash(dues, 'Révision progressive'));
    $('[data-f="quiz"]', f).addEventListener('click', () => jouerQuiz(qz[Math.floor(Math.random() * qz.length)]));
    $('[data-f="fiche"]', f).addEventListener('click', () => voirFiche(fi[0]));
    $('[data-f="chrono"]', f).addEventListener('click', chrono);
  });
};
let minuteurChrono = null;
function chrono() {
  modaleForm(`<h3 id="modaleTitre"><span>⏱️</span>Chrono de révision</h3>
    <div class="champs">${champMat(undefined, 'Matière', true)}<div class="champ"><label>Durée</label><select name="min">${[10, 15, 20, 25, 30, 45].map(n => `<option value="${n}" ${n === 20 ? 'selected' : ''}>${n} min</option>`).join('')}</select></div></div>
    <p style="font-family:var(--ui);font-size:13px;color:var(--ink-3)">Range ton téléphone, prépare ton cours et une bouteille d’eau. On y va ?</p>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="submit" class="btn">▶ Démarrer</button></div></div>`, o => {
    const mat = resoudreMat(o), total = +o.min * 60, debut = Date.now();
    setTimeout(() => {
      ouvrirModale(`<h3 id="modaleTitre"><span>⏱️</span>${mat ? esc(nomMat(mat)) : 'Révision'}</h3><div class="chrono" id="chrono" aria-live="off"></div>
        <div class="prog"><i id="chronoBarre" style="width:0"></i></div>
        <p style="text-align:center;font-style:italic;color:var(--ink-2)">${esc(encouragement())}</p>
        <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="fin">✓ J’ai fini</button></div></div>`, f => {
        const tic = () => {
          const e = Math.min(total, Math.round((Date.now() - debut) / 1000)), r = total - e;
          $('#chrono', f).textContent = z2(Math.floor(r / 60)) + ':' + z2(r % 60);
          $('#chronoBarre', f).style.width = Math.round(e / total * 100) + '%';
          if (r <= 0) { clearInterval(minuteurChrono); $('#chrono', f).textContent = 'Bravo ! 🎉'; toast('C’est l’heure de la pause : 5 minutes pour souffler. 🌿', { duree: 8000 }); }
        };
        tic(); minuteurChrono = setInterval(tic, 1000);
        apresFermeture = () => {
          clearInterval(minuteurChrono);
          const m = Math.round((Date.now() - debut) / 60000);
          if (m >= 1) { noterSession('chrono', Math.min(m, +o.min), mat); sauver(); rendre(); verifierBadges(); toast(`${duree(Math.min(m, +o.min))} de révision notées ✓`); }
        };
        $('[data-f="fin"]', f).addEventListener('click', fermerModale);
      });
    }, 30);
  });
}

/* ============================================================
   Les objectifs, le défi, le carnet de bord
   ============================================================ */
ACT['objectif-nouveau'] = () => {
  if (!exigerProfil()) return;
  const presets = ['Réviser 20 minutes', 'Terminer une fiche', 'Faire un quiz', 'Revoir un chapitre', 'Apprendre 10 flashcards', 'Finir un devoir'];
  modaleForm(`<h3 id="modaleTitre"><span>🎯</span>Fixer un objectif</h3><p class="sous">Petit, précis, atteignable : c’est le secret.</p>
    <div class="champ"><div class="choix">${presets.map((p, i) => `<label><input type="radio" name="p" value="${esc(p)}" ${i ? '' : 'checked'}> ${esc(p)}</label>`).join('')}<label><input type="radio" name="p" value=""> Autre…</label></div></div>
    <div class="champs"><div class="champ"><label>Précision <small>(facultatif)</small></label><input name="detail" placeholder="en maths, chapitre 5…"></div><div class="champ"><label>Pour le</label><input name="date" type="date" value="${auj()}"></div></div>
    ${piedForm(false)}`, o => {
    const lib = [o.p, o.detail].filter(Boolean).join(' — ');
    if (!lib) { toast('Écrivez votre objectif.'); return false; }
    S.objectifs.push({ id: uid(), profil: pid(), libelle: lib, date: o.date || auj(), fait: false });
  });
};
function cocherObjectif(id, on) { const o = S.objectifs.find(x => x.id === id); if (!o) return; o.fait = on; if (on) toast('Objectif atteint 🎯 Bien joué !'); sauver(); rendre(); verifierBadges(); }
ACT['objectif-suppr'] = el => { const o = S.objectifs.find(x => x.id === el.dataset.id); if (o) supprimer('objectifs', o, 'L’objectif'); };
ACT['defi-choisir'] = () => {
  const d = S.defis[pid()];
  modaleForm(`<h3 id="modaleTitre"><span>🏆</span>Mon défi de la semaine</h3><p class="sous">Il dure jusqu’à dimanche soir. Choisis-le à ta mesure : l’important, c’est d’essayer.</p>
    <div class="choix" style="flex-direction:column;align-items:stretch">${DEFIS.map((x, i) => `<label><input type="radio" name="d" value="${x.id}" ${(d && d.id === x.id) || (!d && !i) ? 'checked' : ''}> ${esc(x.nom)}</label>`).join('')}</div>${piedForm(false)}`, o => {
    S.defis[pid()] = { id: o.d, semaine: lundiDe(auj()) };
  });
};
ACT['journal-nouveau'] = el => {
  const t = el.dataset.t, n = { reussite: '🌟 Une réussite', difficulte: '🧗 Une difficulté', objectif: '🎯 Un objectif' }[t];
  modaleForm(`<h3 id="modaleTitre">${n}</h3>${champMat('', 'Matière', true)}<div class="champ"><label>${t === 'reussite' ? 'Ce dont je suis fier·e' : t === 'difficulte' ? 'Ce qui me bloque (et une idée pour avancer)' : 'Ce que je veux atteindre'}</label><textarea name="texte" required></textarea></div>${piedForm(false)}`, o => {
    if (!o.texte) return false;
    S.journal.push({ id: uid(), profil: pid(), type: t, texte: o.texte, matiere: o.matiere === '__nouvelle' ? resoudreMat(o) : o.matiere, date: auj() });
  });
};
ACT['journal-suppr'] = el => { const j = S.journal.find(x => x.id === el.dataset.id); if (j) supprimer('journal', j, 'La note du carnet'); };

/* ============================================================
   Les notes
   ============================================================ */
function formNote(n) {
  const nouveau = !n; n = n || { titre: '', valeur: '', sur: 20, coef: 1, date: auj() };
  modaleForm(`<h3 id="modaleTitre"><span>📊</span>${nouveau ? 'Ajouter une note' : 'La note'}</h3>
    <div class="champs">${champMat(n.matiere)}<div class="champ"><label>Intitulé <small>(facultatif)</small></label><input name="titre" value="${esc(n.titre)}" placeholder="Contrôle chapitre 2"></div>
      <div class="champ"><label>Note obtenue</label><input name="valeur" type="number" step="0.25" min="0" value="${esc(n.valeur)}" required></div>
      <div class="champ"><label>Sur</label><input name="sur" type="number" step="1" min="1" value="${esc(n.sur)}"></div>
      <div class="champ"><label>Coefficient <small>(facultatif)</small></label><input name="coef" type="number" step="0.5" min="0" value="${esc(n.coef)}"></div>
      <div class="champ"><label>Date</label><input name="date" type="date" value="${esc(n.date)}"></div></div>
    <p style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3)">Sert à calculer une moyenne indicative : le bulletin de l’établissement fait foi.</p>
    ${piedForm(!nouveau)}`, o => {
    const v = parseFloat(String(o.valeur).replace(',', '.')), sur = parseFloat(o.sur) || 20;
    if (isNaN(v) || v < 0 || v > sur) { toast('La note doit être comprise entre 0 et ' + sur + '.'); return false; }
    Object.assign(n, { matiere: resoudreMat(o), titre: o.titre, valeur: v, sur, coef: parseFloat(o.coef) || 1, date: o.date || auj() });
    if (nouveau) { n.id = uid(); n.profil = pid(); S.notes.push(n); }
  }, false, f => brancherSuppr(f, 'notes', n, 'La note'));
}
ACT['note-nouveau'] = () => exigerProfil() && formNote(null);
ACT['note'] = el => formNote(S.notes.find(x => x.id === el.dataset.id));
ACT['notes-mat'] = el => { U.notesMat = U.notesMat === el.dataset.id ? '' : el.dataset.id; rendre(); const d = $('#detailMat'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
ACT['periode'] = el => { U.periode = el.dataset.id; rendre(); };
ACT['guide-quitter'] = () => aller('accueil');

/* ============================================================
   Les documents
   ============================================================ */
function formDoc(d) {
  const nouveau = !d; d = d || { titre: '', type: 'cours', annee: anneeScolaire(), chapitre: '' };
  modaleForm(`<h3 id="modaleTitre"><span>📁</span>${nouveau ? 'Ajouter un document' : 'Modifier le document'}</h3>
    ${nouveau ? `<div class="fichier-zone" style="margin-bottom:12px"><input type="file" name="fichier" accept="image/*,application/pdf" required aria-label="Choisir le fichier"><span class="nom">PDF ou photo · 25 Mo au plus</span></div>` : ''}
    <div class="champs">${champMat(d.matiere)}<div class="champ"><label>Type</label><select name="type">${options(TYPES_DOC, d.type)}</select></div>
      <div class="champ plein"><label>Titre <small>(sinon le nom du fichier)</small></label><input name="titre" value="${esc(d.titre)}"></div>
      <div class="champ"><label>Année scolaire</label><input name="annee" value="${esc(d.annee)}" placeholder="${anneeScolaire()}"></div>
      <div class="champ"><label>Chapitre <small>(facultatif)</small></label><input name="chapitre" value="${esc(d.chapitre)}"></div></div>
    ${piedForm(!nouveau)}`, async (o, form) => {
    if (nouveau) {
      const fi = form.fichier.files[0]; if (!fi) { toast('Choisissez un fichier.'); return false; }
      await joindreFichiers([fi], { matiere: resoudreMat(o), type: o.type, chapitre: o.chapitre, annee: o.annee || anneeScolaire() }, ids => { const x = S.documents.find(y => y.id === ids[0]); if (o.titre) x.titre = o.titre; toast('Document rangé 📁'); });
    } else Object.assign(d, { matiere: resoudreMat(o), type: o.type, titre: o.titre || d.titre, annee: o.annee, chapitre: o.chapitre });
  }, false, f => { if (!nouveau) $('[data-f="suppr"]', f).addEventListener('click', async () => {
    if (!(await confirmer('Supprimer ce document ?', 'Le fichier est effacé de ce navigateur.', 'Supprimer'))) return;
    fichierOter(d.id).catch(() => {}); S.documents = S.documents.filter(x => x !== d); S.devoirs.forEach(v => { if (v.docs) v.docs = v.docs.filter(i => i !== d.id); }); sauver(); rendre(); toast('Document supprimé.');
  }); });
}
function voirDoc(d) {
  if (!d) return;
  ouvrirModale(`<h3 id="modaleTitre"><span>${typeDoc(d.type).e}</span>${esc(d.titre)}</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:var(--ui);font-size:13px;color:var(--ink-3);margin-bottom:12px">${puceMat(d.matiere)}<span>${esc(typeDoc(d.type).nom)}</span>${d.annee ? `<span>${esc(d.annee)}</span>` : ''}${d.chapitre ? `<span>${esc(d.chapitre)}</span>` : ''}</div>
    <div class="visionneuse" id="vis"><p style="padding:20px;color:#555;font-family:var(--ui)">Chargement…</p></div>
    <div class="pied-fen"><a class="btn fin" id="telecharger" download="${esc(d.fichier ? d.fichier.nom : d.titre)}" hidden>⬇ Télécharger</a><div class="droite"><button type="button" class="btn fin" data-f="modifier">✏️ Modifier</button><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`, f => {
    brancherForm(f);
    $('[data-f="modifier"]', f).addEventListener('click', () => formDoc(d));
    fichierLire(d.id).then(b => {
      if (!b) { $('#vis', f).innerHTML = '<p style="padding:20px;color:#555;font-family:var(--ui)">Le fichier n’est pas dans ce navigateur (sauvegarde rechargée sans les fichiers ?).</p>'; return; }
      const u = URL.createObjectURL(b); $('#telecharger', f).href = u; $('#telecharger', f).hidden = false;
      $('#vis', f).innerHTML = /^image\//.test(b.type) ? `<img src="${u}" alt="${esc(d.titre)}">` : b.type === 'application/pdf' ? `<iframe src="${u}" title="${esc(d.titre)}"></iframe>` : '<p style="padding:20px;color:#555">Aperçu indisponible : téléchargez le fichier.</p>';
    }).catch(() => { $('#vis', f).innerHTML = '<p style="padding:20px;color:#555">Impossible de lire le fichier.</p>'; });
  }, true);
}
ACT['doc-nouveau'] = () => exigerProfil() && formDoc(null);
ACT['doc-voir'] = el => voirDoc(S.documents.find(d => d.id === el.dataset.id));

/* ============================================================
   Besoin d'aide
   ============================================================ */
ACT['methode'] = el => {
  const m = METHODES.find(x => x.id === el.dataset.id);
  ouvrirModale(`<h3 id="modaleTitre"><span>${m.e}</span>${esc(m.titre)}</h3><p class="sous">${esc(m.court)}</p>
    <div class="etapes">${m.etapes.map(([t, p]) => `<div class="etape"><b>${esc(t)}</b><p>${esc(p)}</p></div>`).join('')}</div>
    <div class="note douce" style="margin-top:14px"><span class="e">💡</span><div>${esc(m.astuce)}</div></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Merci !</button></div></div>`, brancherForm);
};
function choisirAide(devoir) {
  ouvrirModale(`<h3 id="modaleTitre"><span>💡</span>De quel genre de travail s’agit-il ?</h3>
    <div class="methodes">${AIDES.map(a => `<button type="button" class="methode" data-id="${a.id}"><span class="e">${a.e}</span><b>${esc(a.titre)}</b></button>`).join('')}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button></div></div>`, f => {
    brancherForm(f);
    $$('.methode', f).forEach(b => b.addEventListener('click', () => { fermerModale(); lancerAide(b.dataset.id, devoir); }));
  });
}
function lancerAide(id, devoir) { U.aide = { id, i: 0, ind: 0, rep: [], devoir: devoir ? devoir.id : '', note: false }; U.vue = 'aide'; history.replaceState(null, '', '#aide'); rendre(); scrollTo(0, 0); }
const garderRep = () => { const t = $('#aideRep'); if (t && U.aide) U.aide.rep[U.aide.i] = t.value; };
ACT['aide-lancer'] = el => lancerAide(el.dataset.id);
ACT['aide-indice'] = () => { garderRep(); U.aide.ind++; rendre(); };
ACT['aide-pas'] = el => {
  garderRep(); U.aide.i = Math.max(0, U.aide.i + +el.dataset.n); U.aide.ind = 0;
  const a = AIDES.find(x => x.id === U.aide.id);
  if (U.aide.i >= a.etapes.length && !U.aide.note) { U.aide.note = true; noterSession('aide', 10, '', 1); sauver(); verifierBadges(); }
  rendre(); scrollTo(0, 0);
};
ACT['aide-quitter'] = () => { U.aide = null; rendre(); };
ACT['aide-garder'] = () => {
  const d = S.devoirs.find(x => x.id === U.aide.devoir), a = AIDES.find(x => x.id === U.aide.id);
  if (!d) return;
  d.notesAide = (d.notesAide ? d.notesAide + '\n\n' : '') + a.etapes.map((e, k) => '• ' + e.q + '\n  ' + (U.aide.rep[k] || '—')).join('\n');
  if (d.statut === 'a-commencer') d.statut = 'en-cours';
  sauver(); toast('Tes réflexions sont gardées dans le devoir 📎');
};

/* ============================================================
   L'orientation
   ============================================================ */
function formOrient(o, type) {
  const nouveau = !o; o = o || { type: type || 'metier', titre: '', detail: '', date: '', lien: '', statut: '' };
  modaleForm(`<h3 id="modaleTitre"><span>🧭</span>${nouveau ? 'Ajouter à mon orientation' : esc(o.titre)}</h3>
    <div class="champs"><div class="champ"><label>Rubrique</label><select name="type">${TYPES_ORIENT.map(t => `<option value="${t.id}" ${o.type === t.id ? 'selected' : ''}>${t.e} ${esc(t.un)}</option>`).join('')}</select></div>
      <div class="champ"><label>Titre</label><input name="titre" value="${esc(o.titre)}" required placeholder="Infirmier·e, BUT informatique, stage de 3e…"></div>
      <div class="champ plein"><label>Notes</label><textarea name="detail" placeholder="Ce qui m’attire, ce qu’il faut savoir, les questions à poser…">${esc(o.detail)}</textarea></div>
      <div class="champ"><label>Date importante <small>(candidature, salon, stage)</small></label><input name="date" type="date" value="${esc(o.date)}"></div>
      <div class="champ"><label>Où j’en suis <small>(facultatif)</small></label><input name="statut" value="${esc(o.statut)}" placeholder="À explorer, envoyé, accepté…"></div>
      <div class="champ plein"><label>Lien <small>(facultatif)</small></label><input name="lien" type="url" value="${esc(o.lien)}" placeholder="https://"></div></div>
    ${o.lien && /^https?:\/\//.test(o.lien) ? `<p><a href="${esc(o.lien)}" target="_blank" rel="noopener noreferrer">Ouvrir le lien ↗</a></p>` : ''}
    ${piedForm(!nouveau)}`, x => {
    if (!x.titre) { toast('Donnez un titre.'); return false; }
    Object.assign(o, { type: x.type, titre: x.titre, detail: x.detail, date: x.date, statut: x.statut, lien: /^https?:\/\//.test(x.lien) ? x.lien : '' });
    if (nouveau) { o.id = uid(); o.profil = pid(); S.orientation.push(o); }
  }, false, f => brancherSuppr(f, 'orientation', o, 'L’élément'));
}
ACT['orient-nouveau'] = el => exigerProfil() && formOrient(null, el.dataset.t);
ACT['orient'] = el => formOrient(S.orientation.find(x => x.id === el.dataset.id));

ACT['filtre-mat'] = el => { U.mat = el.dataset.id; rendre(); };

/* ============================================================
   Les badges qui se débloquent
   ============================================================ */
function verifierBadges() {
  const p = pid(); if (!p) return;
  const b = S.badges[p] = S.badges[p] || {};
  const d = defiDe(p); if (d && d.p >= 100) b.defi = true;
  if (minutesSemaine(p) >= 60) b.heure = true;
  b.vus = b.vus || [];
  const nouveaux = badgesDe(p).filter(x => x.ok && !b.vus.includes(x.id));
  if (!nouveaux.length) return;
  nouveaux.forEach(x => b.vus.push(x.id)); sauver();
  nouveaux.slice(0, 2).forEach(x => toast(`${x.e} Nouveau badge : <b>${esc(x.nom)}</b>`, { action: 'Voir', faire: () => aller('recompenses'), duree: 6000 }));
}

/* ============================================================
   Sauvegarder, recharger
   ============================================================ */
ACT['sauvegarder'] = () => {
  ouvrirModale(`<h3 id="modaleTitre"><span>💾</span>Sauvegarder NaoStudy</h3><p class="sous">Un fichier .naostudy, à garder sur une clé ou dans vos documents. Il contient des informations scolaires : ne le partagez qu’avec des personnes de confiance.</p>
    <label class="check" style="padding-left:0"><input type="checkbox" id="avecFichiers" checked><span class="lib">Inclure les documents joints (fichier plus lourd)</span></label>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="button" class="btn" data-f="ok">💾 Télécharger</button></div></div>`, f => {
    brancherForm(f);
    $('[data-f="ok"]', f).addEventListener('click', async () => {
      const j = { app: 'naostudy', v: 1, date: new Date().toISOString(), donnees: S };
      if ($('#avecFichiers', f).checked) { try { j.fichiers = {}; for (const [k, b] of await fichiersTous()) if (b) j.fichiers[k] = await blobEnTexte(b); } catch (e) {} }
      const u = URL.createObjectURL(new Blob([JSON.stringify(j)], { type: 'application/json' })), a = document.createElement('a');
      a.href = u; a.download = 'NaoStudy-' + auj() + '.naostudy'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
      fermerModale(); toast('Sauvegarde téléchargée 💾');
    });
  });
};
ACT['recharger'] = () => $('#fichierSauvegarde').click();
$('#fichierSauvegarde').addEventListener('change', async e => {
  const fi = e.target.files[0]; e.target.value = ''; if (!fi) return;
  let j; try { j = JSON.parse(await fi.text()); } catch (er) { toast('Ce fichier ne ressemble pas à une sauvegarde NaoStudy.'); return; }
  if (!j || j.app !== 'naostudy' || !j.donnees) { toast('Ce fichier ne ressemble pas à une sauvegarde NaoStudy.'); return; }
  if (!(await exigerParent('Recharger une sauvegarde demande le code parent.'))) return;
  if (!(await confirmer('Recharger cette sauvegarde ?', `Du ${esc(dateLongue(iso(new Date(j.date || Date.now()))))}. Elle <b>remplace</b> tout le contenu actuel de NaoStudy.`, 'Remplacer', true))) return;
  S = Object.assign(vierge(), j.donnees); S.reglages = Object.assign(vierge().reglages, j.donnees.reglages || {});
  if (j.fichiers) { await fichiersVider().catch(() => {}); for (const [k, u] of Object.entries(j.fichiers)) { try { await fichierPoser(k, await texteEnBlob(u)); } catch (er) {} } }
  sauver(); U.parent = false; U.vue = 'accueil'; rendre(); toast('Sauvegarde rechargée ✓');
});

/* ============================================================
   Réinitialiser : l'outil redevient vierge, comme pour une nouvelle personne
   ============================================================ */
ACT['reinitialiser'] = async () => {
  if (!(await exigerParent('Réinitialiser NaoStudy demande le code parent.'))) return;
  ouvrirModale(`<h3 id="modaleTitre"><span>♻️</span>Réinitialiser NaoStudy ?</h3>
    <p class="sous">Tout ce qui a été saisi dans NaoStudy est <b>effacé définitivement</b>, pour tous les profils : emplois du temps, devoirs, contrôles, fiches, flashcards, quiz, notes, documents joints, orientation, récompenses, code parent et réglages. L’outil repart vierge.</p>
    <div class="note douce"><span class="e">💾</span><div style="flex:1">Conseil : gardez d’abord une sauvegarde, pour pouvoir la recharger plus tard avec 📂.</div><button type="button" class="btn petit fin" data-f="sauver">Sauvegarder</button></div>
    <div class="champ"><label for="saisieEffacer">Pour confirmer, tapez <b style="color:var(--alerte);letter-spacing:.08em">EFFACER</b></label>
      <input id="saisieEffacer" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER" style="text-align:center;letter-spacing:.12em;font-weight:700"></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn danger" data-f="effacer" disabled style="opacity:.5">🗑 Tout effacer</button></div></div>`, f => {
    brancherForm(f);
    const s = $('#saisieEffacer', f), b = $('[data-f="effacer"]', f);
    $('[data-f="sauver"]', f).addEventListener('click', () => ACT['sauvegarder']());
    s.addEventListener('input', () => { const ok = s.value.trim().toUpperCase() === 'EFFACER'; b.disabled = !ok; b.style.opacity = ok ? 1 : .5; });
    s.addEventListener('keydown', e => { if (e.key === 'Enter' && !b.disabled) b.click(); });
    b.addEventListener('click', async () => {
      await fichiersVider().catch(() => {});
      S = vierge();
      ['naostudy.theme', 'naostudy.calme', 'naostudy.grand'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver(); parentDeverrouille = false;
      const r = document.documentElement; r.dataset.theme = 'dark'; r.classList.remove('calme', 'grand');
      Object.assign(U, { vue: 'accueil', edt: 'semaine', edtDate: auj(), rev: 'jour', mat: '', q: '', docAnnee: '', notesMat: '', parent: false, aide: null });
      history.replaceState(null, '', '#accueil');
      fermerModale(); majBoutons(); decor(); rendre(); scrollTo(0, 0);
      toast('NaoStudy est vierge ✨ Bienvenue !');
    });
  });
};

/* ============================================================
   Thème, taille du texte, animations
   ============================================================ */
function majBoutons() {
  const clair = document.documentElement.dataset.theme === 'light', b = $('#btnTheme');
  b.setAttribute('aria-checked', clair ? 'false' : 'true');
  b.querySelector('.thumb').textContent = clair ? '☀️' : '🌙';
  b.setAttribute('aria-label', clair ? 'Passer en mode sombre' : 'Passer en mode clair');
  b.title = clair ? 'Mode clair — cliquer pour le mode sombre' : 'Mode sombre — cliquer pour le mode clair';
  $('#btnCalme').title = document.documentElement.classList.contains('calme') ? 'Relancer les animations' : 'Mettre les animations en pause';
}
ACT['theme'] = () => {
  const basculer = () => {
    const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('naostudy.theme', r.dataset.theme); } catch (e) {}
    majBoutons(); decor();
  };
  if (document.startViewTransition) document.startViewTransition(basculer); else basculer();
};
ACT['grand'] = () => { const on = document.documentElement.classList.toggle('grand'); try { localStorage.setItem('naostudy.grand', on ? '1' : '0'); } catch (e) {} };
ACT['calme'] = () => { const on = document.documentElement.classList.toggle('calme'); try { localStorage.setItem('naostudy.calme', on ? '1' : '0'); } catch (e) {} majBoutons(); };

/* ============================================================
   Le décor : de petites choses de l'école
   — des livres dont les pages tournent, des crayons qui écrivent,
   des toques qui flottent et s'envolent, des ampoules d'idées qui s'allument,
   des règles et des équerres, des lettres et des chiffres qui montent,
   et le ciel étoilé de la maison.
   ============================================================ */
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const clair = document.documentElement.dataset.theme === 'light';
  const hasard = (a, b) => a + Math.random() * (b - a);
  const place = () => { const x = hasard(0, W); return [x < W * .5 ? hasard(14, W * .18) : hasard(W * .82, W - 14), hasard(30, H - 30)]; };  /* sur les bords, pour ne pas gêner la lecture */
  const k = Math.max(.6, Math.min(1.6, W * H / 1100000)), op = clair ? .3 : .24;
  let h = '';
  /* le ciel */
  for (let i = 0; i < Math.round(38 * k); i++) h += `<circle class="etoile" cx="${hasard(0, W).toFixed(0)}" cy="${hasard(0, H).toFixed(0)}" r="${hasard(.6, 1.7).toFixed(1)}" style="animation-duration:${hasard(2.5, 6).toFixed(1)}s;animation-delay:-${hasard(0, 6).toFixed(1)}s;opacity:${clair ? .35 : .5}"/>`;
  /* les livres dont une page tourne */
  for (let i = 0; i < Math.round(3 * k); i++) {
    const [x, y] = place(), d = hasard(6, 10).toFixed(1), r = hasard(0, 8).toFixed(1), s = hasard(.9, 1.4).toFixed(2);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s})" opacity="${op}"><g class="trace">
      <path d="M0 -1C-4 -4 -9 -4 -13 -3V9C-9 8 -4 8 0 10Z"/><path d="M0 -1C4 -4 9 -4 13 -3V9C9 8 4 8 0 10Z"/><path d="M0 -1V10"/>
      <path class="tourne" style="--d:${d}s;--r:-${r}s" d="M0 -1C4 -4 9 -4 13 -3V9C9 8 4 8 0 10Z"/></g></g>`;
  }
  /* les crayons qui écrivent */
  for (let i = 0; i < Math.round(3 * k); i++) {
    const [x, y] = place(), d = hasard(8, 12).toFixed(1), r = hasard(0, 10).toFixed(1);
    h += `<g transform="translate(${Math.min(x, W - 70).toFixed(0)} ${y.toFixed(0)})" opacity="${op}"><g class="trace" style="--d:${d}s;--r:-${r}s">
      <path class="ecrit" d="M0 2q4.5 -5 9 0t9 0t9 0t9 0"/>
      <g class="mine"><g transform="rotate(-35)"><path d="M0 0L6 -3H26V3H6Z"/><path d="M6 -3V3"/><path d="M21 -3V3"/><path class="plein" d="M0 0L2.4 -1.2V1.2Z"/></g></g></g></g>`;
  }
  /* les toques, règles, équerres et ampoules qui flottent */
  for (let i = 0; i < Math.round(8 * k); i++) {
    const [x, y] = place(), dur = hasard(14, 24).toFixed(1), del = hasard(0, 20).toFixed(1), n = i % 4;
    const forme = n === 0 ? `<path d="M-11 -2L0 -7L11 -2L0 3Z"/><path d="M-6 0.5V5C-3 7.5 3 7.5 6 5V0.5"/><path d="M11 -2V5"/><circle class="plein" cx="11" cy="6" r="1.3"/>`
      : n === 1 ? `<path d="M-14 -3H14V3H-14Z"/><path d="M-10 -3V-.5M-6 -3V-1.5M-2 -3V-.5M2 -3V-1.5M6 -3V-.5M10 -3V-1.5"/>`
      : n === 2 ? `<path d="M-8 7L9 7L-8 -10Z"/><path d="M-5 4L1.5 4L-5 -2.5Z"/>`
      : `<path d="M-5 -3a5 5 0 1 1 10 0c0 2.6 -2 3.6 -2 6.2h-6c0 -2.6 -2 -3.6 -2 -6.2z"/><path d="M-2.6 6.4h5.2"/><g class="idee" style="animation-delay:-${del}s"><path d="M0 -12.5v-3M-7.5 -9l-2 -2M7.5 -9l2 -2M-9.5 -2.5h-3M9.5 -2.5h3"/></g>`;
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" opacity="${op}"><g class="m" style="animation-duration:${dur}s;animation-delay:-${del}s">${forme}</g></g>`;
  }
  /* les toques lancées en l'air, le jour de la remise des diplômes */
  for (let i = 0; i < Math.round(3 * k); i++) {
    const x = hasard(0, W * .7), y = hasard(H * .5, H), dur = hasard(24, 36).toFixed(1), del = hasard(0, 30).toFixed(1);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="lancee" style="animation-duration:${dur}s;animation-delay:-${del}s"><g class="trace">
      <path d="M-8 -1.5L0 -5L8 -1.5L0 2Z"/><path d="M-4.5 .5V3.6C-2 5.4 2 5.4 4.5 3.6V.5"/><path d="M8 -1.5V3.5"/></g></g></g>`;
  }
  /* les lettres, les chiffres et les petits signes qui montent */
  const signes = ['A', 'b', 'c', '1', '2', '3', '+', '×', '=', 'π', 'x²', '½', '?', '✓', 'abc', 'Ω', '√', '∑', 'é'];
  h += '<g class="bulles">';
  for (let i = 0; i < Math.round(12 * k); i++) {
    const x = hasard(0, W), y = H + 16, dur = hasard(18, 30).toFixed(1), del = hasard(0, 30).toFixed(1), s = hasard(11, 18).toFixed(0);
    h += `<g transform="translate(${x.toFixed(0)} ${y})"><g class="bulle" style="animation-duration:${dur}s;animation-delay:-${del}s"><text font-size="${s}" text-anchor="middle" opacity="${clair ? .55 : .65}">${esc(signes[i % signes.length])}</text></g></g>`;
  }
  svg.innerHTML = h + '</g>';
}
let minuteurDecor = null;
addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

/* ============================================================
   Un exemple, pour découvrir (jamais proposé à un profil qui a déjà des données)
   ============================================================ */
ACT['exemple'] = () => {
  const j = n => plusJours(auj(), n), id = uid;
  const lea = id(), tom = id();
  S = vierge();
  S.profils = [{ id: lea, prenom: 'Léa', niveau: '4e', etab: 'Collège Jules-Verne', couleur: '#E48FB8', emoji: '🦊', partageNotes: true },
    { id: tom, prenom: 'Tom', niveau: 'CM1', etab: '', couleur: '#4FB3D9', emoji: '🚀', partageNotes: false }];
  const M = {};
  [['fr', 'Français', '#8E7BD4', 'Mme Durand', 'B12'], ['ma', 'Mathématiques', '#6F7FEF', 'M. Petit', 'A04'], ['hg', 'Histoire-Géographie', '#E0B84F', 'Mme Roux', 'B08'], ['an', 'Anglais', '#E0707F', 'Ms Smith', 'C02'],
    ['sv', 'SVT', '#5FBF9A', 'M. Morel', 'Labo 1'], ['pc', 'Physique-Chimie', '#4FB3D9', 'Mme Faure', 'Labo 2'], ['ep', 'EPS', '#F2A65A', 'M. Blanc', 'Gymnase']]
    .forEach(([k, n, c, p, s]) => { M[k] = id(); S.matieres.push({ id: M[k], profil: lea, nom: n, couleur: c, prof: p, salle: s, coef: k === 'fr' || k === 'ma' ? 2 : 1 }); });
  const T = {}; [['fr', 'Français', '#8E7BD4'], ['ma', 'Mathématiques', '#6F7FEF'], ['qm', 'Questionner le monde', '#5FBF9A']].forEach(([k, n, c]) => { T[k] = id(); S.matieres.push({ id: T[k], profil: tom, nom: n, couleur: c, coef: 1 }); });
  const edt = { 1: [['fr', '08:00', '09:00'], ['ma', '09:00', '10:00'], ['hg', '10:15', '11:15'], ['an', '11:15', '12:10'], ['sv', '13:30', '14:30'], ['ep', '14:30', '16:30']],
    2: [['ma', '08:00', '09:00'], ['pc', '09:00', '10:00'], ['fr', '10:15', '12:10'], ['an', '13:30', '14:30']],
    3: [['hg', '08:00', '09:00'], ['ma', '09:00', '10:00'], ['fr', '10:15', '11:15']],
    4: [['an', '08:00', '09:00'], ['sv', '09:00', '10:00'], ['ma', '10:15', '11:15'], ['fr', '11:15', '12:10'], ['hg', '13:30', '14:30'], ['pc', '14:30', '15:30']],
    5: [['fr', '08:00', '09:00'], ['ep', '09:00', '11:00'], ['ma', '11:15', '12:10'], ['an', '13:30', '14:30']] };
  Object.entries(edt).forEach(([jr, l]) => l.forEach(([k, a, b]) => S.cours.push({ id: id(), profil: lea, type: 'cours', matiere: M[k], jour: +jr, debut: a, fin: b, salle: '', prof: '' })));
  S.cours.push({ id: id(), profil: lea, type: 'activite', titre: 'Conservatoire (piano)', couleur: '#C9A6F2', matiere: '', jour: 3, debut: '14:00', fin: '15:00', salle: '', prof: '' });
  [1, 2, 4, 5].forEach(jr => S.cours.push({ id: id(), profil: tom, type: 'cours', matiere: T.fr, jour: jr, debut: '08:30', fin: '10:00' }, { id: id(), profil: tom, type: 'cours', matiere: T.ma, jour: jr, debut: '10:15', fin: '11:45' }, { id: id(), profil: tom, type: 'cours', matiere: T.qm, jour: jr, debut: '13:30', fin: '15:00' }));
  const dv = (p, m, titre, pour, o = {}) => Object.assign({ id: id(), profil: p, matiere: m, titre, consigne: '', pour, duree: 30, prio: 'moyenne', statut: 'a-commencer', rappel: '1', docs: [], cree: j(-2) }, o);
  S.devoirs.push(dv(lea, M.ma, 'Exercices 12 à 15 p. 84', j(1), { prio: 'haute', consigne: 'Faire les exercices 12, 13, 14 et 15 : calculs avec les fractions.', duree: 45 }),
    dv(lea, M.fr, 'Rédaction : un souvenir d’été', j(4), { statut: 'en-cours', duree: 90, consigne: 'Racontez un souvenir d’été à la première personne, au passé, en 25 lignes.', rappel: '2' }),
    dv(lea, M.an, 'Apprendre le vocabulaire unité 3', j(2), { duree: 20 }),
    dv(lea, M.hg, 'Croquis : les métropoles françaises', j(7), { prio: 'basse', duree: 60 }),
    dv(lea, M.sv, 'Compte rendu de TP', j(-3), { statut: 'rendu', renduLe: j(-3) }),
    dv(tom, T.fr, 'Poésie à apprendre : « Le cancre »', j(3), { duree: 20 }), dv(tom, T.ma, 'Tables de 7 et de 8', j(1), { duree: 15, prio: 'haute' }));
  const ev1 = { id: id(), profil: lea, matiere: M.ma, type: 'controle', titre: 'Les fractions', date: j(6), heure: '09:00', chapitres: 'Chapitre 3 : addition, multiplication et comparaison de fractions.' };
  S.evals.push(ev1, { id: id(), profil: lea, matiere: M.an, type: 'interro', titre: 'Vocabulaire unité 3', date: j(2), heure: '08:00', chapitres: '' },
    { id: id(), profil: lea, matiere: M.hg, type: 'oral', titre: 'Exposé : Jules Verne', date: j(12), heure: '', chapitres: '' },
    { id: id(), profil: tom, matiere: T.fr, type: 'controle', titre: 'Dictée', date: j(4), heure: '', chapitres: 'Les mots de la liste 5' });
  propositionPlanning(ev1, 4, 25).forEach((s, i) => S.revisions.push({ id: id(), profil: lea, matiere: M.ma, evalId: ev1.id, date: s.date, type: s.type, duree: s.duree, titre: typeRev(s.type).nom + ' — Les fractions', fait: false }));
  S.revisions.push({ id: id(), profil: lea, matiere: M.an, date: auj(), type: 'cartes', duree: 15, titre: 'Vocabulaire unité 3', fait: false });
  S.fiches.push({ id: id(), profil: lea, matiere: M.ma, chapitre: 'Chapitre 3', titre: 'Les fractions', resume: 'Une fraction représente un partage : le dénominateur dit en combien de parts on partage, le numérateur combien de parts on prend.\nPour additionner deux fractions, il faut le même dénominateur.',
    motscles: 'numérateur, dénominateur, fraction irréductible', defs: [{ t: 'Numérateur', d: 'Le nombre du haut : combien de parts on prend.' }, { t: 'Dénominateur', d: 'Le nombre du bas : en combien de parts on partage.' }, { t: 'Fraction irréductible', d: 'Une fraction qu’on ne peut plus simplifier.' }],
    exemples: '1/4 + 2/4 = 3/4\n2/3 × 3/5 = 6/15 = 2/5', difficile: true, cree: j(-5), maj: new Date().toISOString() },
    { id: id(), profil: lea, matiere: M.hg, chapitre: 'Thème 1', titre: 'La Révolution française', resume: 'En 1789, la monarchie absolue est remise en cause. Les députés du Tiers état se proclament Assemblée nationale.', motscles: '1789, Tiers état, Déclaration des droits', defs: [{ t: 'Tiers état', d: 'Tous ceux qui ne sont ni nobles ni membres du clergé.' }], exemples: '', difficile: false, cree: j(-9), maj: new Date(Date.now() - 8e8).toISOString() });
  [['to borrow', 'emprunter'], ['to lend', 'prêter'], ['a neighbour', 'un voisin'], ['to be afraid of', 'avoir peur de'], ['a journey', 'un voyage'], ['homework', 'les devoirs']]
    .forEach(([r, v], i) => S.cartes.push({ id: id(), profil: lea, matiere: M.an, paquet: 'Unité 3', recto: r, verso: v, boite: i < 4 ? 1 : 3, prochaine: i < 4 ? auj() : j(2) }));
  S.quiz.push({ id: id(), profil: lea, matiere: M.ma, titre: 'Les fractions — entraînement', scores: [], questions: [
    { q: 'Combien font 1/4 + 2/4 ?', choix: ['3/8', '3/4', '2/4', '1/2'], bonne: 1, expl: 'Même dénominateur : on additionne seulement les numérateurs.' },
    { q: 'Quelle fraction est égale à 1/2 ?', choix: ['2/3', '3/6', '2/5', '4/6'], bonne: 1, expl: '3/6 : on multiplie le numérateur et le dénominateur par 3.' },
    { q: 'Dans 5/8, le dénominateur est…', choix: ['5', '8', '13', '40'], bonne: 1, expl: 'Le dénominateur est le nombre du bas.' }] });
  [[M.ma, 14, 20, 2, -40], [M.ma, 11.5, 20, 1, -25], [M.ma, 15, 20, 2, -8], [M.fr, 12, 20, 1, -35], [M.fr, 13.5, 20, 2, -12], [M.an, 17, 20, 1, -20], [M.an, 16, 20, 1, -5], [M.hg, 10, 20, 1, -30], [M.hg, 12.5, 20, 1, -10], [M.sv, 15, 20, 1, -15]]
    .forEach(([m, v, s, c, d]) => S.notes.push({ id: id(), profil: lea, matiere: m, titre: 'Évaluation', valeur: v, sur: s, coef: c, date: j(d) }));
  S.journal.push({ id: id(), profil: lea, type: 'reussite', texte: 'J’ai enfin compris les fractions équivalentes !', matiere: M.ma, date: j(-3) }, { id: id(), profil: lea, type: 'difficulte', texte: 'Je confonds borrow et lend : faire des flashcards.', matiere: M.an, date: j(-2) });
  S.orientation.push({ id: id(), profil: lea, type: 'metier', titre: 'Vétérinaire', detail: 'J’aime les animaux et la biologie. Demander à la vétérinaire du quartier comment elle a fait.', date: '', statut: 'À explorer', lien: '' },
    { id: id(), profil: lea, type: 'stage', titre: 'Stage d’observation de 3e', detail: 'Chercher une clinique vétérinaire ou un parc animalier.', date: j(45), statut: 'À chercher', lien: '' });
  [-4, -3, -2, -1].forEach(d => S.sessions.push({ id: id(), profil: lea, date: j(d), minutes: 12, quoi: 'revision', matiere: M.ma, n: 0 }));
  S.defis[lea] = { id: 'min60', semaine: lundiDe(auj()) };
  S.objectifs.push({ id: id(), profil: lea, libelle: 'Réviser 20 minutes — les fractions', date: auj(), fait: false });
  S.reglages.profil = lea; S.badges[lea] = { vus: [] }; S.badges[tom] = { vus: [] };
  badgesDe(lea).filter(x => x.ok).forEach(x => S.badges[lea].vus.push(x.id));
  sauver(); U.vue = 'accueil'; rendre(); scrollTo(0, 0);
  toast('Voici un foyer d’exemple : Léa (4e) et Tom (CM1). ♻️ Réinitialiser pour repartir de zéro.', { duree: 7000 });
};

/* ============================================================
   Navigation et branchements
   ============================================================ */
function aller(v) { U.vue = v; U.parent = false; U.q = ''; U.mat = ''; if (v !== 'aide') U.aide = null; history.replaceState(null, '', '#' + v); rendre(); scrollTo(0, 0); $('#contenu').focus({ preventScroll: true }); }
document.addEventListener('click', e => {
  const o = e.target.closest('[data-vue]');
  if (o) { e.preventDefault(); aller(o.dataset.vue); return; }
  const va = e.target.closest('[data-vue-aller]');
  if (va) { aller(va.dataset.vueAller); return; }
  const a = e.target.closest('[data-act]');
  if (!a || a.type === 'checkbox' || a.closest('#modaleFen form') && !ACT[a.dataset.act]) return;
  if (ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a, e); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'rev-fait') cocherRev(t.dataset.id, t.checked);
  else if (t.dataset.act === 'objectif-fait') cocherObjectif(t.dataset.id, t.checked);
  else if (t.dataset.actChange === 'doc-annee') { U.docAnnee = t.value; rendre(); }
  else if (t.dataset.actChange === 'comparer') { U.comparer = t.checked; rendre(); }
  else if (t.dataset.actChange === 'ab') basculerAB(t.checked);
});
let minuteurRech = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'rechFiche' && e.target.id !== 'rechDoc') return;
  const idc = e.target.id; U.q = e.target.value;
  clearTimeout(minuteurRech);
  minuteurRech = setTimeout(() => { rendre(); const i = $('#' + idc); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 200);
});
addEventListener('hashchange', () => { const v = location.hash.slice(1); if (ONGLETS.some(o => o.id === v) && v !== U.vue) aller(v); });

/* ---------- l'entrée : le cahier s'ouvre (un clic pour passer) ---------- */
function entree() {
  const intro = $('#intro'); if (!intro) return;
  const c = COULEURS, grille = [[0, 1, 2, 3, 0], [4, 5, -1, 6, 1], [2, 7, 0, 4, 8], [9, -1, -1, 1, 5]];
  $('#introSemaine').innerHTML = ['L', 'M', 'M', 'J', 'V'].map(j => `<b>${j}</b>`).join('')
    + grille.flat().map((k, i) => k < 0 ? '<i class="vide"></i>' : `<i style="--c:${c[k]};--i:${i}"></i>`).join('');
  $('#introOnglets').innerHTML = [0, 1, 3, 5, 6, 8, 9].map((k, i) => `<i style="--c:${c[k]};--i:${i}"></i>`).join('');
  /* des lettres et des chiffres qui s'envolent autour du cahier, jamais par-dessus */
  const signes = ['A', 'b', 'π', 'x²', '1+1', '✓', '?', 'abc', '½', '∑', 'é', '='];
  $('#introSignes').innerHTML = signes.map((s, i) => {
    const gauche = i % 2 === 0, x = gauche ? 6 + Math.random() * 22 : 72 + Math.random() * 22, y = 25 + Math.random() * 55;
    return `<span style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;font-size:${(16 + Math.random() * 14).toFixed(0)}px;--d:${(.2 + i * .2).toFixed(2)}s">${esc(s)}</span>`;
  }).join('');
  /* la phrase, mot après mot */
  const ph = $('#introPhrase'); let k = 0;
  ph.innerHTML = ph.innerHTML.split(/(<span>.*?<\/span>|\s+)/).filter(Boolean)
    .map(m => /^\s+$/.test(m) ? ' ' : `<span class="mot" style="--d:${(2.15 + (k++) * .16).toFixed(2)}s">${m}</span>`).join('');
  const reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finir = () => { if (intro.isConnected) intro.remove(); document.body.classList.remove('entree'); };
  if (reduit) return finir();
  intro.addEventListener('click', () => { intro.style.animation = 'introSort .4s ease forwards'; $('.page').style.animation = 'emerge .6s ease both'; setTimeout(finir, 420); });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4700);
}

/* ---------- au démarrage ---------- */
(function demarrer() {
  const v = location.hash.slice(1); if (ONGLETS.some(o => o.id === v)) U.vue = v;
  if (innerWidth < 600) U.edt = 'jour';   /* sur téléphone, une journée se lit mieux qu'une semaine */
  majBoutons(); decor(); rendre(); entree();
  const r = rappelsActifs();
  if (r.length) setTimeout(() => toast(`⏰ ${pluriel(r.length, 'devoir')} à rendre bientôt : ${esc(r.slice(0, 2).map(d => d.titre).join(', '))}`, { duree: 6000 }), 3600);
  /* une page ouverte longtemps : on remet l'écran à jour au changement de jour */
  let jour = auj(); setInterval(() => { if (auj() !== jour) { jour = auj(); rendre(); } }, 60000);
})();
