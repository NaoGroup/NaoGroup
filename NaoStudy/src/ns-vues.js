'use strict';
/* ============================================================
   NaoStudy — les écrans
   ============================================================ */

const ONGLETS = [
  { id: 'accueil', nom: 'Accueil', e: '🏠' },
  { id: 'edt', nom: 'Emploi du temps', e: '🗓️' },
  { id: 'devoirs', nom: 'Devoirs', e: '📚' },
  { id: 'controles', nom: 'Contrôles', e: '📝' },
  { id: 'revisions', nom: 'Révisions', e: '🧠' },
  { id: 'documents', nom: 'Documents', e: '📁' },
  { id: 'notes', nom: 'Notes', e: '📊' },
  { id: 'aide', nom: 'Besoin d’aide', e: '💡' },
  { id: 'orientation', nom: 'Orientation', e: '🧭' },
  { id: 'recompenses', nom: 'Récompenses', e: '🏅' },
  { id: 'guide', nom: 'Comment ça marche', e: '❓' }
];

const ENCOURAGEMENTS = [
  'Chaque petit pas compte : tu avances.', 'Se tromper, c’est apprendre. Continue !', 'Dix minutes aujourd’hui valent mieux qu’une heure un jour sur deux.',
  'Tu as le droit de ne pas tout savoir : c’est pour ça qu’on révise.', 'Une chose à la fois, et tout finit par se faire.', 'Ton cerveau travaille même quand tu dors : révise un peu, puis repose-toi.',
  'Demander de l’aide, c’est une force.', 'Bravo pour ta régularité : c’est elle qui fait la différence.'
];
const encouragement = () => ENCOURAGEMENTS[(new Date().getDate() + pid().length) % ENCOURAGEMENTS.length];

/* ---------- la barre des profils et les onglets ---------- */
function rendreProfils() {
  const b = $('#profilsSel');
  if (!S.profils.length) { b.hidden = true; return; }
  b.hidden = false;
  b.innerHTML = S.profils.map(p => `<button type="button" class="${!U.parent && p.id === pid() ? 'actif' : ''}" style="--c:${p.couleur}" data-act="profil" data-id="${p.id}" aria-pressed="${!U.parent && p.id === pid()}">${rondProfil(p)}${esc(p.prenom)}</button>`).join('')
    + `<button type="button" class="ajout" data-act="profil-nouveau" title="Ajouter un profil">＋ Profil</button>`
    + (S.profils.length > 1 || S.reglages.codeParent ? `<button type="button" class="parent ${U.parent ? 'actif' : ''}" data-act="vue-parent" aria-pressed="${U.parent}" title="Voir les échéances de tous les enfants">👪 Vue parent</button>` : '');
}
function rendreOnglets() {
  const n = $('#onglets');
  if (!S.profils.length || U.parent) { n.innerHTML = ''; n.hidden = true; return; }
  n.hidden = false;
  const comptes = { devoirs: devoirsOuverts().filter(d => d.pour && ecart(d.pour) <= 2).length, revisions: revisionsDuJour().filter(r => !r.fait).length + (cartesDues().length ? 1 : 0) };
  n.innerHTML = ONGLETS.map(o => `<a class="onglet ${U.vue === o.id ? 'actif' : ''}" href="#${o.id}" data-vue="${o.id}" ${U.vue === o.id ? 'aria-current="page"' : ''}><span aria-hidden="true">${o.e}</span>${o.nom}${comptes[o.id] ? `<span class="n">${comptes[o.id]}</span>` : ''}</a>`).join('');
}

function rendre() {
  rendreProfils(); rendreOnglets();
  const c = $('#contenu');
  if (!S.profils.length) c.innerHTML = U.vue === 'guide' ? vueGuide() : vueBienvenue();
  else if (U.parent) c.innerHTML = vueParent();
  else {
    const f = { accueil: vueAccueil, edt: vueEdt, devoirs: vueDevoirs, controles: vueControles, revisions: vueRevisions, documents: vueDocuments,
      notes: vueNotes, aide: vueAide, orientation: vueOrientation, recompenses: vueRecompenses, guide: vueGuide }[U.vue] || vueAccueil;
    c.innerHTML = f();
  }
  apercusDocuments();
}

/* ============================================================
   Bienvenue : aucun profil encore
   ============================================================ */
function vueBienvenue() {
  return `<section class="hero">
    <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-st"/></svg>
    <div class="txt"><div class="salut">Bienvenue dans NaoStudy</div>
      <h2>Apprendre, s’organiser, <span>avancer.</span></h2>
      <p>Emplois du temps, révisions et devoirs de toute la famille — pour un élève autonome comme pour un parent qui accompagne plusieurs enfants.</p></div>
  </section>
  <div class="grille">
    <div class="carte"><h3><span class="e">👋</span>Pour commencer</h3>
      <p style="margin:0 0 12px;color:var(--ink-2)">Créez un profil pour chaque enfant, adolescent ou étudiant : un prénom ou un pseudo, un niveau, une couleur. Les matières sont proposées selon le niveau.</p>
      <button type="button" class="btn gros" data-act="profil-nouveau">＋ Créer un premier profil</button>
      <div style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap"><button type="button" class="lien-discret" data-vue-aller="guide">❓ Comment ça marche ?</button><button type="button" class="lien-discret" data-act="exemple">Découvrir avec un exemple</button></div></div>
    <div class="carte"><h3><span class="e">🛡️</span>Nos engagements</h3>
      <div class="promesses">
        <div><b>Rien n’est partagé tout seul</b>Les informations scolaires restent dans ce navigateur (et dans votre profil NaoGroup s’il est connecté).</div>
        <div><b>Des profils séparés</b>Chaque enfant a son espace. La vue parent montre les échéances, pas les contenus privés.</div>
        <div><b>On aide, on ne fait pas à la place</b>L’aide aux devoirs pose des questions et donne des indices, jamais la réponse toute faite.</div>
        <div><b>Sans pression</b>Des encouragements bienveillants, des badges doux, et le droit de souffler.</div>
      </div></div>
  </div>`;
}

/* ============================================================
   L'accueil
   ============================================================ */
function ligneDevoir(d, compacte = true) {
  const e = etatDate(d.pour, 2), st = statut(d.statut);
  return `<div class="ligne teinte cliquable ${compacte ? 'compacte' : ''}" style="--c:${couleurMat(d.matiere)}" data-act="devoir" data-id="${d.id}">
    <span class="pic teinte" aria-hidden="true">${st.e}</span>
    <div class="corps"><div class="t">${esc(d.titre)}</div><div class="s">${puceMat(d.matiere)}${d.duree ? `<span>⏱ ${duree(d.duree)}</span>` : ''}${d.prio === 'haute' ? '<span class="prio haute">Priorité haute</span>' : ''}</div></div>
    <div class="fin-l">${d.pour ? `<span class="badge ${e}">${e === 'passe' ? 'En retard · ' : ''}${esc(Maj(dans(d.pour)))}</span>` : ''}</div></div>`;
}
function ligneEval(v, compacte = true) {
  const t = typeEval(v.type), n = ecart(v.date);
  return `<div class="ligne teinte cliquable ${compacte ? 'compacte' : ''}" style="--c:${couleurMat(v.matiere)}" data-act="eval" data-id="${v.id}">
    <span class="pic teinte" aria-hidden="true">${t.e}</span>
    <div class="corps"><div class="t">${esc(v.titre || t.nom)}</div><div class="s">${puceMat(v.matiere)}<span>${esc(dateCourte(v.date))}${v.heure ? ' · ' + heureAff(v.heure) : ''}</span></div></div>
    <div class="fin-l"><span class="badge ${n <= 3 ? 'bientot' : 'bleu'}">${n < 0 ? 'Passé' : n === 0 ? "Aujourd'hui" : 'J-' + n}</span></div></div>`;
}
function ligneRev(r) {
  const t = typeRev(r.type);
  return `<label class="check ${r.fait ? 'fait' : ''}"><input type="checkbox" data-act="rev-fait" data-id="${r.id}" ${r.fait ? 'checked' : ''}>
    <span class="lib"><b style="font-weight:600">${t.e} ${esc(r.titre || t.nom)}</b><br><span style="font-family:var(--ui);font-size:12px;color:var(--ink-3)">${puceMat(r.matiere)} · ${duree(r.duree || 20)}${r.date < auj() ? ' · prévu ' + esc(dans(r.date)) : ''}</span></span></label>`;
}
function objectifsDuJour() { return duProfil(S.objectifs).filter(o => o.date === auj()); }

function vueAccueil() {
  const p = profil(), a = auj(), cours = coursDuJour(a), maint = new Date(), m = maint.getHours() * 60 + maint.getMinutes();
  const devs = trierDevoirs(devoirsOuverts()).slice(0, 4), revs = revisionsDuJour(), cartes = cartesDues(), evals = evalsAVenir();
  const rappels = rappelsActifs(), serieN = serie();
  const h = maint.getHours(), salut = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
  const evalsProches = evals.filter(v => ecart(v.date) <= 7);

  const journee = `<section class="carte large" aria-labelledby="titreJournee" style="background:linear-gradient(135deg, color-mix(in srgb, ${p.couleur} 20%, transparent), color-mix(in srgb, #CDB4F8 8%, transparent)), var(--verre)">
    <h3 id="titreJournee" style="font-size:22px"><span class="e">☀️</span>Ma journée <span style="font-family:var(--ui);font-style:normal;font-size:13px;color:var(--ink-3);font-weight:500">· ${salut} ${esc(p.prenom)} — ${esc(dateLongue(a))}</span>
      ${serieN > 1 ? `<span class="badge ok plus" title="Jours d’affilée où tu as appris quelque chose">🔥 ${serieN} jours de suite</span>` : ''}</h3>
    ${rappels.length ? `<div class="note douce"><span class="e">⏰</span><div><b>Rappel :</b> ${rappels.map(d => `${esc(d.titre)} (${esc(nomMat(d.matiere))}) à rendre ${esc(dans(d.pour))}`).join(' · ')}</div></div>` : ''}
    <div class="journee">
      <div class="col"><h4>Mes cours du jour</h4>
        ${cours.length ? cours.map(c => `<div class="cours-mini ${m >= minutes(c.debut) && m < minutes(c.fin) ? 'maintenant' : ''}" style="--c:${couleurMat(c.matiere)}"><span class="h">${heureAff(c.debut)} – ${heureAff(c.fin)}</span><b>${esc(c.type === 'activite' ? c.titre || 'Activité' : nomMat(c.matiere))}</b>${c.salle ? `<span style="margin-left:auto;color:var(--ink-3)">${esc(c.salle)}</span>` : ''}</div>`).join('')
          : `<div class="vide">${jourSemaine(a) >= 6 ? 'C’est le week-end : pas de cours aujourd’hui. 🌿' : 'Aucun cours prévu aujourd’hui.'}<br><button type="button" class="voir-tout" data-vue-aller="edt">Compléter mon emploi du temps →</button></div>`}</div>
      <div class="col"><h4>Devoirs prioritaires</h4>
        ${devs.length ? `<div class="lignes">${devs.map(d => ligneDevoir(d)).join('')}</div>` : '<div class="vide">Rien à rendre pour l’instant. ✨</div>'}</div>
      <div class="col"><h4>Révisions à faire</h4>
        ${revs.map(ligneRev).join('')}
        ${cartes.length ? `<button type="button" class="ligne cliquable compacte" data-act="flash-lancer" style="width:100%;text-align:left;font:inherit;color:inherit"><span class="pic" aria-hidden="true">🃏</span><div class="corps"><div class="t">${pluriel(cartes.length, 'flashcard')} à revoir</div><div class="s">Révision progressive</div></div></button>` : ''}
        ${evalsProches.length && !revs.length ? evalsProches.slice(0, 2).map(v => `<div class="note" style="margin:6px 0 0"><span class="e">${typeEval(v.type).e}</span><div>${esc(nomMat(v.matiere))} ${esc(dans(v.date))} : <button type="button" class="voir-tout" style="margin:0" data-act="planning-eval" data-id="${v.id}">préparer un planning</button></div></div>`).join('') : ''}
        ${!revs.length && !cartes.length && !evalsProches.length ? '<div class="vide">Pas de révision prévue aujourd’hui.</div>' : ''}</div>
    </div>
    <p style="margin:14px 0 0;font-style:italic;color:var(--ink-2)">💜 ${esc(encouragement())}</p>
  </section>`;

  const boutons = `<div class="boutons-etude" role="group" aria-label="Actions rapides">
    <button type="button" class="btn" data-act="devoir-nouveau">📚 Ajouter un devoir</button>
    <button type="button" class="btn" data-act="eval-nouveau">📝 Ajouter un contrôle</button>
    <button type="button" class="btn" data-act="fiche-nouveau">🗂️ Créer une fiche</button>
    <button type="button" class="btn" data-act="lancer-revision">🚀 Lancer une révision</button>
    <button type="button" class="btn" data-act="note-nouveau">📊 Ajouter une note</button>
  </div>`;

  /* le prochain jour de cours */
  let jp = a, cp = [];
  for (let i = 1; i <= 7; i++) { jp = plusJours(a, i); cp = coursDuJour(jp); if (cp.length) break; }
  const carteEdt = `<div class="carte"><h3><span class="e">🗓️</span>Mon emploi du temps<button type="button" class="ico-btn plus" data-act="cours-nouveau" title="Ajouter un cours" aria-label="Ajouter un cours">＋</button></h3>
    ${cp.length ? `<p style="margin:0 0 8px;color:var(--ink-2);font-family:var(--ui);font-size:13.5px">${esc(Maj(ecart(jp) === 1 ? 'demain, ' + dateLongue(jp) : dateLongue(jp)))} · ${pluriel(cp.length, 'cours', 'cours')}, de ${heureAff(cp[0].debut)} à ${heureAff(cp[cp.length - 1].fin)}</p>
      ${cp.slice(0, 5).map(c => `<div class="cours-mini" style="--c:${couleurMat(c.matiere)}"><span class="h">${heureAff(c.debut)}</span><b>${esc(c.type === 'activite' ? c.titre || 'Activité' : nomMat(c.matiere))}</b></div>`).join('')}`
      : `<div class="vide">Votre semaine est encore vide. Ajoutez les cours une fois : ils se répètent chaque semaine.<br><button type="button" class="btn petit" data-act="cours-nouveau">＋ Ajouter un cours</button></div>`}
    <button type="button" class="voir-tout" data-vue-aller="edt">Voir la semaine →</button></div>`;

  const ouverts = trierDevoirs(devoirsOuverts());
  const carteDevoirs = `<div class="carte"><h3><span class="e">📚</span>Mes devoirs à rendre<button type="button" class="ico-btn plus" data-act="devoir-nouveau" title="Ajouter un devoir" aria-label="Ajouter un devoir">＋</button></h3>
    ${ouverts.length ? `<div class="lignes">${ouverts.slice(0, 5).map(d => ligneDevoir(d)).join('')}</div>` : '<div class="vide">Aucun devoir en attente.</div>'}
    <button type="button" class="voir-tout" data-vue-aller="devoirs">Tous mes devoirs →</button></div>`;

  const carteEvals = `<div class="carte"><h3><span class="e">📝</span>Mes prochains contrôles<button type="button" class="ico-btn plus" data-act="eval-nouveau" title="Ajouter un contrôle" aria-label="Ajouter un contrôle">＋</button></h3>
    ${evals.length ? `<div class="lignes">${evals.slice(0, 4).map(v => ligneEval(v)).join('')}</div>` : '<div class="vide">Aucun contrôle annoncé.</div>'}
    <button type="button" class="voir-tout" data-vue-aller="controles">Tous les contrôles →</button></div>`;

  const nbC = duProfil(S.cartes).length;
  const carteRev = `<div class="carte"><h3><span class="e">🧠</span>Mes révisions du jour</h3>
    ${revs.length ? revs.map(ligneRev).join('') : '<div class="vide" style="padding-bottom:6px">Aucune séance prévue aujourd’hui.</div>'}
    <div class="boites" style="margin-top:8px">
      <div class="boite"><b>${cartes.length}</b>flashcards à revoir</div>
      <div class="boite"><b>${duProfil(S.fiches).filter(f => f.difficile).length}</b>notions difficiles</div>
      <div class="boite"><b>${duree(minutesSemaine())}</b>cette semaine</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" class="btn petit" data-act="lancer-revision">🚀 Lancer une révision</button>${nbC ? '' : '<button type="button" class="btn petit fin" data-act="carte-nouveau">🃏 Créer des flashcards</button>'}</div></div>`;

  const moy = moyenneGenerale(), dern = duProfil(S.notes).slice().sort((x, y) => (y.date || '').localeCompare(x.date || '')).slice(0, 3), objs = objectifsDuJour();
  const carteNotes = `<div class="carte"><h3><span class="e">📊</span>Mes notes et objectifs<button type="button" class="ico-btn plus" data-act="note-nouveau" title="Ajouter une note" aria-label="Ajouter une note">＋</button></h3>
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px"><span style="font-size:30px;font-weight:700;font-style:italic">${note20(moy)}</span><span style="font-family:var(--ui);font-size:13px;color:var(--ink-3)">/20 · moyenne indicative</span></div>
    ${dern.length ? `<div class="lignes">${dern.map(n => `<div class="ligne compacte teinte" style="--c:${couleurMat(n.matiere)}"><div class="corps"><div class="t">${esc(n.titre || nomMat(n.matiere))}</div><div class="s">${puceMat(n.matiere)}<span>${esc(dateCourte(n.date))}</span></div></div><b>${esc(String(n.valeur).replace('.', ','))}<small style="color:var(--ink-3);font-weight:400">/${esc(n.sur)}</small></b></div>`).join('')}</div>` : '<div class="vide">Aucune note pour l’instant.</div>'}
    <h4 style="margin:12px 0 6px;font-family:var(--ui);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)">Mes objectifs du jour</h4>
    ${objs.length ? objs.map(o => `<label class="check ${o.fait ? 'fait' : ''}"><input type="checkbox" data-act="objectif-fait" data-id="${o.id}" ${o.fait ? 'checked' : ''}><span class="lib">🎯 ${esc(o.libelle)}</span></label>`).join('') : ''}
    <button type="button" class="btn petit fin" data-act="objectif-nouveau">🎯 Fixer un objectif</button>
    <button type="button" class="voir-tout" style="margin-left:8px" data-vue-aller="notes">Mes notes →</button></div>`;

  const docs = duProfil(S.documents).slice().sort((x, y) => (y.ajout || '').localeCompare(x.ajout || '')).slice(0, 4);
  const carteDocs = `<div class="carte"><h3><span class="e">📁</span>Mes documents récents<button type="button" class="ico-btn plus" data-act="doc-nouveau" title="Ajouter un document" aria-label="Ajouter un document">＋</button></h3>
    ${docs.length ? `<div class="lignes">${docs.map(ligneDoc).join('')}</div>` : '<div class="vide">Cours, photos de feuilles, consignes, bulletins… tout se range par matière.</div>'}
    <button type="button" class="voir-tout" data-vue-aller="documents">Tous mes documents →</button></div>`;

  return journee + boutons + `<div class="grille">${carteEdt}${carteDevoirs}${carteEvals}${carteRev}${carteNotes}${carteDocs}${carteDefi()}</div>`;
}

/* ============================================================
   L'emploi du temps : semaine, journée, mois
   ============================================================ */
function vueEdt() {
  const d = U.edtDate, mode = U.edt, p = profil(), ab = semaineAB(d);
  let periode = '';
  if (mode === 'semaine') { const l = lundiDe(d); periode = 'Semaine du ' + dateDe(l).getDate() + ' ' + MOIS[dateDe(l).getMonth()]; }
  else if (mode === 'jour') periode = Maj(dateLongue(d));
  else periode = Maj(MOIS[dateDe(d).getMonth()]) + ' ' + dateDe(d).getFullYear();
  const barre = `<div class="section-titre"><h2>Mon emploi <span>du temps</span></h2>
    <div class="droite"><button type="button" class="btn" data-act="cours-nouveau">＋ Ajouter un cours</button><button type="button" class="btn fin" data-act="modeles">🧩 Modèles de planning</button></div></div>
    <div class="edt-barre">
      <div class="sous-onglets" style="margin:0">${[['semaine', 'Semaine'], ['jour', 'Journée'], ['mois', 'Mois']].map(([k, n]) => `<button type="button" class="puce ${mode === k ? 'actif' : ''}" data-act="edt-mode" data-m="${k}">${n}</button>`).join('')}</div>
      <button type="button" class="ico-btn" data-act="edt-nav" data-n="-1" aria-label="Précédent">◀</button>
      <span class="periode">${esc(periode)}</span>
      <button type="button" class="ico-btn" data-act="edt-nav" data-n="1" aria-label="Suivant">▶</button>
      <button type="button" class="btn petit fin" data-act="edt-auj">Aujourd’hui</button>
      <span class="ab-zone">${ab ? `<span class="semaine-ab ${ab === 'B' ? 'b' : ''}" title="Les cours « semaine ${ab} » et « toutes les semaines » sont affichés">Semaine ${ab}</span>
        <button type="button" class="lien-discret" data-act="ab-inverser" title="Si l’établissement a annoncé l’inverse">C’est une semaine ${ab === 'A' ? 'B' : 'A'}</button>` : ''}
        <label class="interrupteur-ab" title="Pour les établissements qui alternent deux emplois du temps"><input type="checkbox" data-act-change="ab" ${p && p.semainesAB ? 'checked' : ''}> Semaines A / B</label></span>
    </div>`;
  if (mode === 'mois') return barre + grilleMois(d);
  const vide = !duProfil(S.cours).length;
  return barre + (vide ? `<div class="note douce"><span class="e">👆</span><div><b>Ton emploi du temps est vide.</b> Clique sur une case de la grille, à l’heure et au jour du cours, pour l’ajouter. Il reviendra chaque semaine.</div></div>` : '')
    + grilleSemaine(mode === 'jour' ? [d] : null) +
    `<p class="chapo" style="margin:14px 0 0;font-family:var(--ui);font-size:13px">👆 Clique sur une case vide pour ajouter un cours · ✋ fais glisser un cours pour le déplacer · ↕ tire son bord du bas pour changer sa durée · clique dessus pour le modifier. Le 📌 signale un devoir à rendre ce jour-là, le 📝 un contrôle.</p>`;
}
/* Les cours qui se chevauchent (semaine A et B affichées ensemble, option et cours…) se rangent côte à côte. */
function enColonnes(l) {
  const t = l.slice().sort((a, b) => minutes(a.debut) - minutes(b.debut) || minutes(b.fin) - minutes(a.fin)), fins = [];
  let groupe = [], finGroupe = -1;
  const fermer = () => { const n = Math.max(1, ...groupe.map(g => g.col + 1)); groupe.forEach(g => { g.n = n; }); groupe = []; fins.length = 0; };
  const res = t.map(c => {
    const d = minutes(c.debut), f = minutes(c.fin);
    if (d >= finGroupe && groupe.length) fermer();
    let col = fins.findIndex(x => x <= d); if (col < 0) { col = fins.length; fins.push(f); } else fins[col] = f;
    const o = { c, col, n: 1 }; groupe.push(o); finGroupe = Math.max(finGroupe, f); return o;
  });
  if (groupe.length) fermer();
  return res;
}
function grilleSemaine(jours) {
  const l = lundiDe(U.edtDate), cours = coursDeLaSemaine(U.edtDate), tous = duProfil(S.cours);
  if (!jours) {
    const maxJ = Math.max(5, ...tous.map(c => +c.jour));
    jours = Array.from({ length: maxJ }, (_, i) => plusJours(l, i));
  }
  let debut = 8 * 60, fin = 17 * 60;
  tous.forEach(c => { debut = Math.min(debut, minutes(c.debut)); fin = Math.max(fin, minutes(c.fin)); });
  debut = Math.floor(debut / 60) * 60; fin = Math.ceil(fin / 60) * 60;
  const hh = 52, H = (fin - debut) / 60 * hh, a = auj(), now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  const devs = duProfil(S.devoirs).filter(x => x.statut !== 'rendu'), evs = duProfil(S.evals);
  let h = `<div class="edt" id="grilleEdt" style="--n:${jours.length};--hh:${hh}px" data-debut="${debut}" data-fin="${fin}"><div class="tete"></div>`;
  h += jours.map(j => `<div class="tete ${j === a ? 'auj' : ''}">${Maj(JOURS_C[dateDe(j).getDay()])} ${dateDe(j).getDate()}</div>`).join('');
  h += `<div class="heures" style="height:${H}px">${Array.from({ length: (fin - debut) / 60 + 1 }, (_, i) => `<span style="top:${i * hh}px">${z2(debut / 60 + i)}h</span>`).join('')}</div>`;
  jours.forEach(j => {
    const cj = enColonnes(cours.filter(c => +c.jour === jourSemaine(j)));
    h += `<div class="jourcol ${j === a ? 'auj' : ''}" style="height:${H}px" data-jour="${jourSemaine(j)}" title="Cliquer pour ajouter un cours">`;
    cj.forEach(({ c, col, n }) => {
      const top = (minutes(c.debut) - debut) / 60 * hh, ht = Math.max(22, (minutes(c.fin) - minutes(c.debut)) / 60 * hh - 2);
      const aDev = c.matiere && devs.some(x => x.matiere === c.matiere && x.pour === j), aEv = c.matiere && evs.some(x => x.matiere === c.matiere && x.date === j);
      const nom = c.type === 'activite' ? c.titre || 'Activité' : nomMat(c.matiere);
      h += `<div class="creneau ${c.type === 'activite' ? 'activite' : ''}" role="button" tabindex="0" style="--c:${c.type === 'activite' ? c.couleur || '#9BC45A' : couleurMat(c.matiere)};top:${top}px;height:${ht}px;left:calc(${(col / n * 100).toFixed(2)}% + 3px);width:calc(${(100 / n).toFixed(2)}% - 6px);right:auto" data-act="cours" data-id="${c.id}"
        title="${esc(nom + ' · ' + heureAff(c.debut) + '–' + heureAff(c.fin) + (c.salle ? ' · ' + c.salle : '') + (c.prof ? ' · ' + c.prof : '') + (c.semaine && c.semaine !== 'toutes' ? ' · semaine ' + c.semaine : ''))}">
        <span class="ptdev">${c.semaine && c.semaine !== 'toutes' ? `<span class="mini-ab">${c.semaine}</span>` : ''}${aEv ? '📝' : ''}${aDev ? '📌' : ''}</span><b>${esc(nom)}${c.type === 'option' ? ' <small style="display:inline">(option)</small>' : ''}</b>
        <small>${heureAff(c.debut)} – ${heureAff(c.fin)}</small>${c.salle || c.prof ? `<small>${esc([c.salle, c.prof].filter(Boolean).join(' · '))}</small>` : ''}
        <span class="poignee" data-poignee="1" title="Tirer pour changer la durée" aria-hidden="true"></span></div>`;
    });
    if (j === a && nm >= debut && nm <= fin) h += `<div class="maintenant-ligne" style="top:${(nm - debut) / 60 * hh}px" aria-hidden="true"></div>`;
    h += '<div class="fantome" aria-hidden="true">＋</div></div>';
  });
  return h + '</div>';
}
function evenementsDu(j) {
  const l = [];
  duProfil(S.evals).filter(v => v.date === j).forEach(v => l.push({ c: couleurMat(v.matiere), t: typeEval(v.type).e + ' ' + (v.titre || nomMat(v.matiere)) }));
  duProfil(S.devoirs).filter(d => d.pour === j && d.statut !== 'rendu').forEach(d => l.push({ c: couleurMat(d.matiere), t: '📌 ' + d.titre }));
  duProfil(S.revisions).filter(r => r.date === j).forEach(r => l.push({ c: couleurMat(r.matiere), t: (r.fait ? '✓ ' : '🧠 ') + (r.titre || typeRev(r.type).nom) }));
  return l;
}
function grilleMois(d) {
  const p = dateDe(d), premier = iso(new Date(p.getFullYear(), p.getMonth(), 1)), debut = lundiDe(premier), a = auj();
  let h = '<div class="mois">' + ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map(j => `<div class="jn">${j}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const j = plusJours(debut, i), dj = dateDe(j);
    if (i === 35 && dj.getMonth() !== p.getMonth()) break;
    const ev = evenementsDu(j), nC = coursDuJour(j).length;
    h += `<button type="button" class="case ${dj.getMonth() !== p.getMonth() ? 'hors' : ''} ${j === a ? 'auj' : ''}" data-act="edt-jour" data-d="${j}" aria-label="${esc(dateLongue(j))}${ev.length ? ', ' + ev.length + ' événement(s)' : ''}">
      <span class="num">${dj.getDate()}</span>${nC ? `<span style="font-family:var(--ui);font-size:10.5px;color:var(--ink-3)"> · ${nC} cours</span>` : ''}
      ${ev.slice(0, 3).map(e => `<span class="ev" style="--c:${e.c}">${esc(e.t)}</span>`).join('')}${ev.length > 3 ? `<span style="font-family:var(--ui);font-size:10.5px;color:var(--ink-3)">+${ev.length - 3}</span>` : ''}</button>`;
  }
  return h + '</div>';
}

/* ============================================================
   Les devoirs
   ============================================================ */
function vueDevoirs() {
  const tous = duProfil(S.devoirs).filter(d => !U.mat || d.matiere === U.mat);
  return `<div class="section-titre"><h2>Mes <span>devoirs</span></h2><div class="droite"><button type="button" class="btn" data-act="devoir-nouveau">＋ Ajouter un devoir</button></div></div>
    ${filtreMatieres()}
    <div class="note"><span class="e">💡</span><div>Pour avancer un devoir, ouvrez-le et changez son statut. Besoin d’un coup de pouce ? Le bouton <b>« M’aider pas à pas »</b> pose des questions et donne des indices — sans faire le travail à votre place.</div></div>
    <div class="statuts">${STATUTS.map(s => {
      const l = trierDevoirs(tous.filter(d => d.statut === s.id));
      return `<div class="statut-col"><h4>${s.e} ${s.nom}<span class="n">${l.length}</span></h4>
        ${l.map(d => { const e = etatDate(d.pour, 2); return `<div class="devoir" role="button" tabindex="0" style="--c:${couleurMat(d.matiere)}" data-act="devoir" data-id="${d.id}">
          <b>${esc(d.titre)}</b><div class="s">${puceMat(d.matiere)}${d.pour ? `<span class="badge ${['rendu', 'termine'].includes(d.statut) ? '' : e}">${esc(dateCourte(d.pour))}</span>` : ''}
          ${d.duree ? `<span>⏱ ${duree(d.duree)}</span>` : ''}<span class="prio ${d.prio}">${esc((PRIOS.find(x => x.id === d.prio) || PRIOS[1]).nom)}</span>${(d.docs || []).length ? '<span>📎</span>' : ''}</div>
          <div style="display:flex;gap:4px;margin-top:6px">${s.id !== 'a-commencer' ? `<button type="button" class="ico-btn" data-act="devoir-statut" data-id="${d.id}" data-sens="-1" title="Étape précédente" aria-label="Étape précédente">◀</button>` : ''}
          ${s.id !== 'a-revoir' ? `<button type="button" class="ico-btn" data-act="devoir-statut" data-id="${d.id}" data-sens="1" title="Étape suivante" aria-label="Étape suivante">▶</button>` : ''}</div></div>`; }).join('') || '<div class="vide" style="font-size:13px">—</div>'}</div>`;
    }).join('')}</div>`;
}
function filtreMatieres() {
  const m = matieresDe();
  if (!m.length) return '';
  return `<div class="puces" style="margin-bottom:14px"><button type="button" class="puce ${!U.mat ? 'actif' : ''}" data-act="filtre-mat" data-id="">Toutes les matières</button>
    ${m.map(x => `<button type="button" class="puce ${U.mat === x.id ? 'actif' : ''}" data-act="filtre-mat" data-id="${x.id}"><span class="mat" style="--c:${x.couleur}"></span>${esc(x.nom)}</button>`).join('')}</div>`;
}

/* ============================================================
   Les contrôles, examens et dates importantes
   ============================================================ */
function vueControles() {
  const l = duProfil(S.evals).filter(v => !U.mat || v.matiere === U.mat);
  const av = l.filter(v => v.date >= auj()).sort((a, b) => a.date.localeCompare(b.date)), pa = l.filter(v => v.date < auj()).sort((a, b) => b.date.localeCompare(a.date));
  return `<div class="section-titre"><h2>Contrôles <span>& examens</span></h2><div class="droite"><button type="button" class="btn" data-act="eval-nouveau">＋ Ajouter un contrôle</button></div></div>
    ${filtreMatieres()}
    ${av.length ? `<div class="grille">${av.map(v => {
      const n = ecart(v.date), plan = duProfil(S.revisions).filter(r => r.evalId === v.id), faits = plan.filter(r => r.fait).length, t = typeEval(v.type);
      return `<div class="carte" style="border-top:4px solid ${couleurMat(v.matiere)}"><h3><span class="e">${t.e}</span>${esc(v.titre || t.nom)}<span class="badge ${n <= 3 ? 'bientot' : 'bleu'} plus">${n === 0 ? "Aujourd'hui" : 'J-' + n}</span></h3>
        <div style="font-family:var(--ui);font-size:13.5px;color:var(--ink-2);display:flex;gap:10px;flex-wrap:wrap">${puceMat(v.matiere)}<span>${esc(Maj(dateLongue(v.date)))}${v.heure ? ' à ' + heureAff(v.heure) : ''}</span></div>
        ${v.chapitres ? `<p style="margin:8px 0 0;color:var(--ink-2);font-size:14.5px"><b>À revoir :</b> ${esc(v.chapitres)}</p>` : ''}
        ${plan.length ? `<div style="margin-top:10px"><div style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3);margin-bottom:4px">Planning de révisions : ${faits}/${plan.length} séances</div><div class="prog"><i style="width:${Math.round(faits / plan.length * 100)}%"></i></div></div>` : ''}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">
          <button type="button" class="btn petit" data-act="planning-eval" data-id="${v.id}">${plan.length ? '🗓️ Revoir le planning' : '🗓️ Créer un planning de révisions'}</button>
          <button type="button" class="btn petit fin" data-act="eval" data-id="${v.id}">Modifier</button>
          <button type="button" class="btn petit fin" data-act="vers-agenda" data-type="eval" data-id="${v.id}" title="Copier pour NaoAgenda">📅 NaoAgenda</button></div></div>`;
    }).join('')}</div>` : `<div class="carte"><div class="calme-vide"><span class="e">🌤️</span>Aucun contrôle annoncé pour l’instant.<br><br><button type="button" class="btn" data-act="eval-nouveau">＋ Ajouter un contrôle</button></div></div>`}
    ${pa.length ? `<h3 style="font-style:italic;margin:26px 0 10px">Déjà passés</h3><div class="lignes">${pa.slice(0, 12).map(v => ligneEval(v, false)).join('')}</div>` : ''}`;
}

/* ============================================================
   Les révisions : aujourd'hui, planning, fiches, flashcards, quiz, objectifs
   ============================================================ */
const SOUS_REV = [['jour', '☀️ Aujourd’hui'], ['planning', '🗓️ Planning'], ['fiches', '🗂️ Fiches'], ['cartes', '🃏 Flashcards'], ['quiz', '❓ Quiz'], ['objectifs', '🎯 Objectifs']];
function vueRevisions() {
  const s = U.rev;
  const corps = { jour: revJour, planning: revPlanning, fiches: revFiches, cartes: revCartes, quiz: revQuiz, objectifs: revObjectifs }[s] || revJour;
  return `<div class="section-titre"><h2>Mes <span>révisions</span></h2><div class="droite"><button type="button" class="btn" data-act="lancer-revision">🚀 Lancer une révision</button></div></div>
    <div class="sous-onglets">${SOUS_REV.map(([k, n]) => `<button type="button" class="puce ${s === k ? 'actif' : ''}" data-act="rev-sous" data-s="${k}">${n}</button>`).join('')}</div>` + corps();
}
function revJour() {
  const revs = revisionsDuJour(), cartes = cartesDues(), diff = duProfil(S.fiches).filter(f => f.difficile), objs = objectifsDuJour();
  return `<div class="grille">
    <div class="carte"><h3><span class="e">🧠</span>Séances du jour</h3>${revs.length ? revs.map(ligneRev).join('') : '<div class="vide">Aucune séance prévue. Créez un planning depuis un contrôle, ou utilisez un modèle.</div>'}
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn petit fin" data-act="rev-nouveau">＋ Ajouter une séance</button><button type="button" class="btn petit fin" data-act="modeles">🧩 Modèles</button></div></div>
    <div class="carte"><h3><span class="e">🃏</span>Révision progressive</h3>
      <p style="margin:0 0 10px;color:var(--ink-2);font-size:14.5px">Les notions difficiles reviennent plus souvent, celles qui sont bien sues s’espacent.</p>
      ${cartes.length ? `<button type="button" class="btn" data-act="flash-lancer">Revoir ${pluriel(cartes.length, 'carte')}</button>` : `<div class="vide">Aucune carte à revoir aujourd’hui. ${duProfil(S.cartes).length ? '🎉' : ''}</div>`}
      ${diff.length ? `<h4 style="margin:14px 0 6px;font-family:var(--ui);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)">Notions difficiles à relire</h4><div class="lignes">${diff.slice(0, 4).map(ligneFiche).join('')}</div>` : ''}</div>
    <div class="carte"><h3><span class="e">🎯</span>Mes objectifs du jour</h3>
      ${objs.map(o => `<label class="check ${o.fait ? 'fait' : ''}"><input type="checkbox" data-act="objectif-fait" data-id="${o.id}" ${o.fait ? 'checked' : ''}><span class="lib">${esc(o.libelle)}</span></label>`).join('') || '<div class="vide">Un petit objectif rend la séance plus facile à commencer.</div>'}
      <button type="button" class="btn petit fin" data-act="objectif-nouveau" style="margin-top:8px">🎯 Fixer un objectif</button></div>
  </div>`;
}
function revPlanning() {
  const l = duProfil(S.revisions).filter(r => r.date >= plusJours(auj(), -7)).sort((a, b) => a.date.localeCompare(b.date));
  const parJour = {}; l.forEach(r => (parJour[r.date] = parJour[r.date] || []).push(r));
  return `<div class="note"><span class="e">🗓️</span><div>Un planning répartit le travail en petites séances. Créez-le depuis un contrôle (<b>Contrôles → Créer un planning</b>), ou partez d’un <button type="button" class="voir-tout" style="margin:0" data-act="modeles">modèle</button> : semaine de cours, semaine de révisions, brevet, bac, partiels, concours, oral ou devoir maison.</div></div>
    <div style="margin-bottom:12px"><button type="button" class="btn petit" data-act="rev-nouveau">＋ Ajouter une séance</button></div>
    ${Object.keys(parJour).length ? Object.keys(parJour).map(j => `<div class="carte" style="margin-bottom:12px;${j === auj() ? 'border-color:var(--accent)' : ''}"><h3 style="font-size:16px"><span class="e">${j === auj() ? '☀️' : '📅'}</span>${esc(Maj(dateLongue(j)))}<span class="badge plus">${esc(dans(j))}</span></h3>
      ${parJour[j].map(r => `<div style="display:flex;align-items:center;gap:6px">${ligneRev(r)}<button type="button" class="ico-btn" style="margin-left:auto" data-act="rev-suppr" data-id="${r.id}" title="Retirer" aria-label="Retirer cette séance">✕</button></div>`).join('')}</div>`).join('')
      : '<div class="carte"><div class="calme-vide"><span class="e">🌱</span>Aucune séance planifiée.</div></div>'}`;
}
function ligneFiche(f) {
  return `<div class="ligne teinte cliquable compacte" style="--c:${couleurMat(f.matiere)}" data-act="fiche" data-id="${f.id}"><span class="pic teinte" aria-hidden="true">🗂️</span>
    <div class="corps"><div class="t">${esc(f.titre)}</div><div class="s">${puceMat(f.matiere)}${f.chapitre ? `<span>${esc(f.chapitre)}</span>` : ''}${f.difficile ? '<span class="badge bientot">À revoir souvent</span>' : ''}</div></div></div>`;
}
function revFiches() {
  const q = sansAccent(U.q);
  const l = duProfil(S.fiches).filter(f => (!U.mat || f.matiere === U.mat) && (!q || sansAccent([f.titre, f.chapitre, f.resume, f.motscles].join(' ')).includes(q)))
    .sort((a, b) => (b.maj || '').localeCompare(a.maj || ''));
  return `${filtreMatieres()}<div class="recherche"><input type="search" id="rechFiche" placeholder="Chercher une fiche (titre, chapitre, mot-clé)…" value="${esc(U.q)}" aria-label="Chercher une fiche"><button type="button" class="btn" data-act="fiche-nouveau">＋ Créer une fiche</button></div>
    ${l.length ? `<div class="lignes">${l.map(ligneFiche).join('')}</div>` : '<div class="carte"><div class="calme-vide"><span class="e">🗂️</span>Une fiche, c’est l’essentiel d’un chapitre : un titre, un résumé, des mots-clés, des définitions, des exemples.<br><br><button type="button" class="btn" data-act="fiche-nouveau">＋ Créer ma première fiche</button></div></div>'}`;
}
function revCartes() {
  const l = duProfil(S.cartes).filter(c => !U.mat || c.matiere === U.mat);
  const paquets = {}; l.forEach(c => { const k = c.matiere + '|' + (c.paquet || 'Général'); (paquets[k] = paquets[k] || []).push(c); });
  return `${filtreMatieres()}
    <div class="carte" style="margin-bottom:14px"><h3><span class="e">📦</span>Mes boîtes de révision</h3>
      <div class="boites">${[1, 2, 3, 4, 5].map(b => `<div class="boite"><b>${l.filter(c => (c.boite || 1) === b).length}</b>Boîte ${b}<br>${b === 1 ? 'chaque jour' : 'tous les ' + INTERVALLES[b] + ' j'}</div>`).join('')}</div>
      <p style="margin:10px 0 0;font-family:var(--ui);font-size:13px;color:var(--ink-3)">Une carte sue monte d’une boîte et revient plus tard. Une carte oubliée retourne dans la boîte 1 : elle reviendra dès demain.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn" data-act="flash-lancer" ${cartesDues(pid(), U.mat).length ? '' : 'disabled style="opacity:.5"'}>▶ Revoir les cartes du jour (${cartesDues(pid(), U.mat).length})</button><button type="button" class="btn fin" data-act="carte-nouveau">＋ Créer des flashcards</button></div></div>
    ${Object.keys(paquets).length ? `<div class="grille">${Object.entries(paquets).map(([k, cs]) => { const [m, p] = k.split('|'); return `<div class="carte" style="border-top:4px solid ${couleurMat(m)}"><h3 style="font-size:16px"><span class="e">🃏</span>${esc(p)}<span class="badge plus">${cs.length}</span></h3>${puceMat(m)}
      <div class="lignes" style="margin-top:10px">${cs.slice(0, 6).map(c => `<div class="ligne compacte cliquable" data-act="carte" data-id="${c.id}"><div class="corps"><div class="t">${esc(c.recto)}</div><div class="s"><span>Boîte ${c.boite || 1}</span><span>${(c.prochaine || auj()) <= auj() ? 'à revoir' : 'revient ' + esc(dans(c.prochaine))}</span></div></div></div>`).join('')}</div>
      ${cs.length > 6 ? `<small style="font-family:var(--ui);color:var(--ink-3)">… et ${cs.length - 6} autres</small>` : ''}
      <div style="margin-top:10px"><button type="button" class="btn petit" data-act="flash-paquet" data-m="${m}" data-p="${esc(p)}">▶ Réviser ce paquet</button></div></div>`; }).join('')}</div>` : ''}`;
}
function revQuiz() {
  const l = duProfil(S.quiz).filter(z => !U.mat || z.matiere === U.mat);
  return `${filtreMatieres()}<div style="margin-bottom:14px"><button type="button" class="btn" data-act="quiz-nouveau">＋ Créer un quiz</button></div>
    ${l.length ? `<div class="grille">${l.map(z => { const der = (z.scores || []).slice(-1)[0]; return `<div class="carte" style="border-top:4px solid ${couleurMat(z.matiere)}"><h3 style="font-size:17px"><span class="e">❓</span>${esc(z.titre)}</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:var(--ui);font-size:13px;color:var(--ink-3)">${puceMat(z.matiere)}<span>${pluriel(z.questions.length, 'question')}</span>${der ? `<span>Dernier essai : ${der.n}/${der.sur}</span>` : ''}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn petit" data-act="quiz-jouer" data-id="${z.id}" ${z.questions.length ? '' : 'disabled style="opacity:.5"'}>▶ Faire le quiz</button><button type="button" class="btn petit fin" data-act="quiz" data-id="${z.id}">Modifier</button></div></div>`; }).join('')}</div>`
      : '<div class="carte"><div class="calme-vide"><span class="e">❓</span>Un quiz, ce sont quelques questions à choix, avec une explication pour chaque réponse. Idéal la veille d’un contrôle.</div></div>'}`;
}
function revObjectifs() {
  const l = duProfil(S.objectifs).slice().sort((a, b) => b.date.localeCompare(a.date));
  return `<div style="margin-bottom:14px"><button type="button" class="btn" data-act="objectif-nouveau">🎯 Fixer un objectif</button></div>
    ${l.length ? `<div class="carte">${l.slice(0, 30).map(o => `<div style="display:flex;align-items:center;gap:6px"><label class="check ${o.fait ? 'fait' : ''}" style="flex:1"><input type="checkbox" data-act="objectif-fait" data-id="${o.id}" ${o.fait ? 'checked' : ''}><span class="lib">${esc(o.libelle)} <small style="font-family:var(--ui);color:var(--ink-3)">· ${esc(dateCourte(o.date))}</small></span></label><button type="button" class="ico-btn" data-act="objectif-suppr" data-id="${o.id}" aria-label="Retirer cet objectif">✕</button></div>`).join('')}</div>`
      : '<div class="carte"><div class="calme-vide"><span class="e">🎯</span>Réviser 20 minutes, terminer une fiche, faire un quiz, revoir un chapitre… Un objectif simple et atteignable.</div></div>'}`;
}

/* ============================================================
   Les documents
   ============================================================ */
function ligneDoc(d) {
  const t = typeDoc(d.type);
  return `<div class="ligne teinte cliquable compacte" style="--c:${couleurMat(d.matiere)}" data-act="doc-voir" data-id="${d.id}"><span class="pic teinte" data-apercu="${d.fichier && /^image\//.test(d.fichier.mime) ? d.id : ''}" aria-hidden="true">${t.e}</span>
    <div class="corps"><div class="t">${esc(d.titre)}</div><div class="s">${puceMat(d.matiere)}<span>${esc(t.nom)}</span>${d.chapitre ? `<span>${esc(d.chapitre)}</span>` : ''}${d.fichier ? `<span>${esc(taille(d.fichier.taille || 0))}</span>` : ''}</div></div></div>`;
}
function vueDocuments() {
  const tous = duProfil(S.documents), annees = [...new Set(tous.map(d => d.annee).filter(Boolean))].sort().reverse(), q = sansAccent(U.q);
  const l = tous.filter(d => (!U.mat || d.matiere === U.mat) && (!U.docAnnee || d.annee === U.docAnnee) && (!q || sansAccent([d.titre, d.chapitre, typeDoc(d.type).nom].join(' ')).includes(q)))
    .sort((a, b) => (b.ajout || '').localeCompare(a.ajout || ''));
  const groupes = {}; l.forEach(d => { const k = d.matiere + '|' + (d.chapitre || ''); (groupes[k] = groupes[k] || []).push(d); });
  return `<div class="section-titre"><h2>Mes <span>documents</span></h2><div class="droite"><button type="button" class="btn" data-act="doc-nouveau">＋ Ajouter un document</button></div></div>
    <div class="note promesse"><span class="e">🔒</span><div>Les fichiers (PDF, photos de feuilles, cours, fiches, bulletins, consignes) restent <b>dans ce navigateur</b> : ils ne partent pas dans le cloud. La sauvegarde 💾 peut les inclure.</div></div>
    ${filtreMatieres()}
    <div class="recherche"><input type="search" id="rechDoc" placeholder="Chercher un document, un chapitre…" value="${esc(U.q)}" aria-label="Chercher un document">
      <select data-act-change="doc-annee" aria-label="Année scolaire"><option value="">Toutes les années</option>${annees.map(a => `<option ${U.docAnnee === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select></div>
    ${Object.keys(groupes).length ? Object.entries(groupes).map(([k, ds]) => { const [m, ch] = k.split('|'); return `<h3 style="font-style:italic;margin:18px 0 8px;display:flex;align-items:center;gap:10px">${puceMat(m)}<span style="font-size:15px">${ch ? '· ' + esc(ch) : ''}</span></h3><div class="lignes">${ds.map(ligneDoc).join('')}</div>`; }).join('')
      : '<div class="carte"><div class="calme-vide"><span class="e">📁</span>Aucun document ici pour l’instant.</div></div>'}`;
}
/* les miniatures des photos */
function apercusDocuments() {
  $$('[data-apercu]').forEach(el => {
    const id = el.dataset.apercu; if (!id) return;
    fichierLire(id).then(b => { if (b && el.isConnected) { const u = URL.createObjectURL(b); el.innerHTML = `<img src="${u}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`; } }).catch(() => {});
  });
}

/* ============================================================
   Les notes (moyennes indicatives), réussites et difficultés
   ============================================================ */
function courbe(points, l = 240, h = 64, c = '#8E7BD4', axes = false) {
  if (!points.length) return '';
  const pad = axes ? 30 : 4, W = l, H = h, x = i => pad + (points.length === 1 ? (W - pad - 8) / 2 : i * (W - pad - 8) / (points.length - 1)), y = v => 6 + (1 - v / 20) * (H - (axes ? 26 : 12));
  let s = '';
  if (axes) [0, 5, 10, 15, 20].forEach(g => { s += `<line x1="${pad}" x2="${W - 4}" y1="${y(g)}" y2="${y(g)}" stroke="var(--bord)" stroke-dasharray="${g === 10 ? '0' : '3 4'}"/><text x="${pad - 6}" y="${y(g) + 4}" text-anchor="end">${g}</text>`; });
  const d = points.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join('');
  s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="${axes ? 2.5 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${axes ? 4.5 : 3}" fill="var(--fond-uni)" stroke="${c}" stroke-width="2"><title>${esc(p.t)} : ${note20(p.v)}/20</title></circle>`).join('');
  if (axes) s += points.map((p, i) => `<text x="${x(i).toFixed(1)}" y="${H - 4}" text-anchor="middle">${esc(p.d)}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution des notes">${s}</svg>`;
}
/* La courbe de la moyenne globale, dans le temps : une ligne principale, et en option les matières en fond.
   L'axe horizontal est le vrai calendrier (pas un point par note), pour lire les progrès d'un trimestre à l'autre. */
function courbeTemps(series, du, au, W = 720, H = 240) {
  const pts = series.flatMap(s => s.points);
  if (!pts.length) return '';
  const t0 = Math.min(dateDe(du), ...pts.map(p => dateDe(p.date))), t1 = Math.max(Math.min(dateDe(au), dateDe(auj())), ...pts.map(p => dateDe(p.date)));
  const gx = 34, gd = 14, gh = 12, gb = 30, x = s => gx + (t1 === t0 ? (W - gx - gd) / 2 : (dateDe(s) - t0) / (t1 - t0) * (W - gx - gd)), y = v => gh + (1 - v / 20) * (H - gh - gb);
  let s = '';
  [0, 5, 10, 15, 20].forEach(g => { s += `<line x1="${gx}" x2="${W - gd}" y1="${y(g)}" y2="${y(g)}" stroke="var(--bord)" stroke-dasharray="${g === 10 ? '0' : '3 4'}"/><text x="${gx - 7}" y="${y(g) + 4}" text-anchor="end">${g}</text>`; });
  /* un repère par mois */
  const m0 = new Date(t0); m0.setDate(1);
  for (let m = new Date(m0); m <= t1; m.setMonth(m.getMonth() + 1)) { if (m < t0) continue; const xi = x(iso(m)); s += `<line x1="${xi}" x2="${xi}" y1="${gh}" y2="${H - gb}" stroke="var(--bord)" stroke-dasharray="1 5"/><text x="${xi}" y="${H - 10}" text-anchor="middle">${MOIS_C[m.getMonth()]}</text>`; }
  series.forEach(se => {
    if (!se.points.length) return;
    const d = se.points.map((p, i) => (i ? 'L' : 'M') + x(p.date).toFixed(1) + ' ' + y(p.v).toFixed(1)).join('');
    if (se.aire) s += `<path d="${d}L${x(se.points[se.points.length - 1].date).toFixed(1)} ${y(0)}L${x(se.points[0].date).toFixed(1)} ${y(0)}Z" fill="${se.couleur}" opacity=".12"/>`;
    s += `<path d="${d}" fill="none" stroke="${se.couleur}" stroke-width="${se.epais || 2}" stroke-linecap="round" stroke-linejoin="round" opacity="${se.opacite || 1}"/>`;
    if (se.epais) s += se.points.map(p => `<circle cx="${x(p.date).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4.5" fill="var(--fond-uni)" stroke="${se.couleur}" stroke-width="2.2"><title>${esc(se.nom)} au ${esc(dateCourte(p.date))} : ${note20(p.v)}/20</title></circle>`).join('');
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de la moyenne globale indicative">${s}</svg>`;
}
/* Les moyennes de chaque matière, en barres, avec le trait de la moyenne globale */
function barresMoyennes(mats, garder, g) {
  const l = mats.map(m => ({ m, v: moyenneMat(m.id, pid(), garder) })).filter(x => x.v != null).sort((a, b) => b.v - a.v);
  if (!l.length) return '<div class="vide">Pas encore de note sur cette période.</div>';
  return `<div class="barres-moy">${l.map(({ m, v }) => `<button type="button" class="barre-moy" data-act="notes-mat" data-id="${m.id}" title="Voir l’évolution en ${esc(m.nom)}">
    <span class="nom"><span class="mat" style="--c:${m.couleur}"></span>${esc(m.nom)}${+m.coef !== 1 ? ` <small>×${esc(String(m.coef).replace('.', ','))}</small>` : ''}</span>
    <span class="piste">${g != null ? `<i class="repere" style="left:${(g / 20 * 100).toFixed(1)}%" title="Moyenne globale : ${note20(g)}"></i>` : ''}<i class="plein" style="width:${(v / 20 * 100).toFixed(1)}%;--c:${m.couleur}"></i></span>
    <b>${note20(v)}</b></button>`).join('')}</div>
    <p class="legende-moy"><i class="repere-leg"></i> le trait clair marque la moyenne globale (${note20(g)}/20)</p>`;
}
const pointsNotes = (mat, garder = null) => duProfil(S.notes).filter(n => n.matiere === mat && +n.sur > 0 && (!garder || garder(n))).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  .map(n => ({ v: +n.valeur / +n.sur * 20, date: n.date || auj(), t: (n.titre || 'Note') + ' · ' + dateCourte(n.date), d: n.date ? dateDe(n.date).getDate() + '/' + (dateDe(n.date).getMonth() + 1) : '' }));
/* la moyenne, recalculée après chaque date de note : c'est elle qu'on voit monter ou descendre */
function pointsMoyenne(garder, mat) {
  const dates = [...new Set(duProfil(S.notes).filter(n => +n.sur > 0 && garder(n) && (!mat || n.matiere === mat)).map(n => n.date || auj()))].sort();
  return dates.map(d => ({ date: d, v: mat ? moyenneMat(mat, pid(), n => garder(n) && (n.date || auj()) <= d) : moyenneGenerale(pid(), n => garder(n) && (n.date || auj()) <= d) })).filter(p => p.v != null);
}
function vueNotes() {
  const mats = matieresDe(), sel = U.notesMat && matiere(U.notesMat) ? U.notesMat : '';
  const pers = [{ id: 'tout', nom: 'Tout', du: '1900-01-01', au: '2999-12-31' }].concat(periodesNotes()), per = pers.find(x => x.id === U.periode) || pers[1];
  const garder = n => (n.date || auj()) >= per.du && (n.date || auj()) <= per.au;
  const g = moyenneGenerale(pid(), garder);
  const notes = duProfil(S.notes).filter(n => garder(n) && (!sel || n.matiere === sel)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const jr = duProfil(S.journal).sort((a, b) => b.date.localeCompare(a.date));
  const colJ = (t, e, nom) => `<div class="carte"><h3><span class="e">${e}</span>${nom}<button type="button" class="ico-btn plus" data-act="journal-nouveau" data-t="${t}" aria-label="Ajouter">＋</button></h3>
    ${jr.filter(j => j.type === t).slice(0, 6).map(j => `<div class="ligne compacte"><div class="corps"><div class="t" style="white-space:normal">${esc(j.texte)}</div><div class="s">${j.matiere ? puceMat(j.matiere) : ''}<span>${esc(dateCourte(j.date))}</span></div></div><button type="button" class="ico-btn" data-act="journal-suppr" data-id="${j.id}" aria-label="Retirer">✕</button></div>`).join('') || '<div class="vide">—</div>'}</div>`;
  /* la tendance : la moyenne d'aujourd'hui comparée à celle d'il y a un mois */
  const pm = pointsMoyenne(garder), avant = pm.filter(p => p.date <= plusJours(auj(), -30)).slice(-1)[0], tend = g != null && avant ? g - avant.v : null;
  const tendance = tend == null ? '' : Math.abs(tend) < .25 ? '<span class="badge">➡️ stable depuis un mois</span>' : tend > 0 ? `<span class="badge ok">↗️ +${note20(tend)} en un mois</span>` : `<span class="badge bientot">↘️ ${note20(tend)} en un mois</span>`;
  const series = [{ nom: 'Moyenne globale', couleur: 'var(--accent)', points: pm, epais: 3, aire: true }]
    .concat(U.comparer ? mats.map(m => ({ nom: m.nom, couleur: m.couleur, points: pointsMoyenne(garder, m.id), opacite: .55 })) : []);
  return `<div class="section-titre"><h2>Mes notes <span>et objectifs</span></h2><div class="droite"><button type="button" class="btn" data-act="note-nouveau">＋ Ajouter une note</button></div></div>
    <div class="note douce"><span class="e">ℹ️</span><div>Les moyennes affichées sont des <b>estimations personnelles</b>, à titre indicatif. Les règles de calcul officielles (coefficients, arrondis, notes prises en compte, dates des trimestres) peuvent varier selon l’établissement : le bulletin fait foi.</div></div>
    <div class="puces" style="margin-bottom:14px">${pers.map(x => `<button type="button" class="puce ${x.id === per.id ? 'actif' : ''}" data-act="periode" data-id="${x.id}">${esc(x.nom)}</button>`).join('')}</div>
    <div class="carte moy-globale">
      <div class="tete-globale"><div><small>Moyenne globale indicative · ${esc(per.nom.toLowerCase())}</small><div class="grand-chiffre">${note20(g)}<span>/20</span></div>${tendance}</div>
        <div class="chiffres" style="margin:0;flex:1;min-width:240px"><div class="chiffre"><small>Notes</small><b>${notes.length && !sel ? notes.length : duProfil(S.notes).filter(garder).length}</b></div><div class="chiffre"><small>Matières notées</small><b>${mats.filter(m => moyenneMat(m.id, pid(), garder) != null).length}</b></div>
          <div class="chiffre"><small>Meilleure matière</small><b style="font-size:16px">${esc((mats.map(m => ({ m, v: moyenneMat(m.id, pid(), garder) })).filter(x => x.v != null).sort((a, b) => b.v - a.v)[0] || { m: { nom: '—' } }).m.nom)}</b></div></div></div>
      <div class="grille-graph">
        <div class="courbe-grande"><h4>📈 Évolution de la moyenne globale <label class="comparer"><input type="checkbox" data-act-change="comparer" ${U.comparer ? 'checked' : ''}> afficher les matières</label></h4>
          ${pm.length ? courbeTemps(series, per.du, per.au) : '<div class="vide">La courbe apparaîtra avec les premières notes.</div>'}
          ${U.comparer && pm.length ? `<div class="legende-courbe">${mats.filter(m => pointsMoyenne(garder, m.id).length).map(m => `<span class="mat" style="--c:${m.couleur}">${esc(m.nom)}</span>`).join('')}</div>` : ''}</div>
        <div><h4>📊 Moyenne par matière</h4>${barresMoyennes(mats, garder, g)}</div>
      </div>
    </div>
    ${mats.length ? `<h3 style="font-style:italic;margin:24px 0 10px">Matière par matière</h3><div class="moyennes">${mats.map(m => { const v = moyenneMat(m.id, pid(), garder), p = pointsNotes(m.id, garder); return `<div class="moy" role="button" tabindex="0" style="--c:${m.couleur}" data-act="notes-mat" data-id="${m.id}" aria-pressed="${sel === m.id}">
      <div class="tete"><b>${esc(m.nom)}</b>${+m.coef !== 1 ? `<small style="font-family:var(--ui);color:var(--ink-3)">coef. ${esc(String(m.coef).replace('.', ','))}</small>` : ''}<span class="val">${note20(v)}<small>/20</small></span></div>
      ${p.length > 1 ? courbe(p, 240, 64, m.couleur) : `<div style="font-family:var(--ui);font-size:12.5px;color:var(--ink-3);margin-top:8px">${p.length ? 'Une note : la courbe apparaîtra à la suivante.' : 'Pas encore de note.'}</div>`}</div>`; }).join('')}</div>` : ''}
    ${sel ? `<div class="carte courbe-grande" id="detailMat" style="margin-top:14px"><h3><span class="e">📈</span>Évolution en ${esc(nomMat(sel))}<button type="button" class="btn petit fin plus" data-act="notes-mat" data-id="">Fermer</button></h3>
      ${courbeTemps([{ nom: 'Notes', couleur: couleurMat(sel), points: pointsNotes(sel, garder).map(x => ({ date: x.date, v: x.v })), opacite: .45 }, { nom: 'Moyenne', couleur: couleurMat(sel), points: pointsMoyenne(garder, sel), epais: 3 }], per.du, per.au) || '<div class="vide">Pas encore de note.</div>'}
      <p class="legende-moy">Trait fin : chaque note · trait épais : la moyenne de la matière au fil du temps.</p></div>` : ''}
    <h3 style="font-style:italic;margin:24px 0 10px">${sel ? 'Notes en ' + esc(nomMat(sel)) : 'Toutes mes notes'} <small style="font-family:var(--ui);font-style:normal;font-size:13px;color:var(--ink-3)">· ${esc(per.nom.toLowerCase())}</small></h3>
    ${notes.length ? `<div class="lignes">${notes.map(n => `<div class="ligne teinte cliquable" style="--c:${couleurMat(n.matiere)}" data-act="note" data-id="${n.id}"><div class="corps"><div class="t">${esc(n.titre || 'Note')}</div><div class="s">${puceMat(n.matiere)}<span>${esc(dateCourte(n.date))}</span>${+n.coef !== 1 ? `<span>coef. ${esc(String(n.coef).replace('.', ','))}</span>` : ''}</div></div><b style="font-size:19px">${esc(String(n.valeur).replace('.', ','))}<small style="color:var(--ink-3);font-weight:400;font-size:13px">/${esc(n.sur)}</small></b></div>`).join('')}</div>` : '<div class="carte"><div class="vide">Aucune note sur cette période.</div></div>'}
    <h3 style="font-style:italic;margin:26px 0 10px">Mon carnet de bord</h3>
    <div class="grille">${colJ('reussite', '🌟', 'Mes réussites')}${colJ('difficulte', '🧗', 'Mes difficultés')}${colJ('objectif', '🎯', 'Mes objectifs')}</div>`;
}

/* ============================================================
   Besoin d'aide : les méthodes, et l'aide aux devoirs pas à pas
   ============================================================ */
const METHODES = [
  { id: 'consigne', e: '🔍', titre: 'Comprendre une consigne', court: 'Savoir exactement ce qu’on attend de toi.',
    etapes: [['Lis la consigne en entier, deux fois', 'La première fois pour découvrir, la seconde pour comprendre. Ne commence pas à répondre avant.'],
      ['Entoure le verbe d’action', 'Décris, explique, compare, justifie, calcule, résume… Chaque verbe demande un travail différent. « Justifier », c’est donner une preuve ; « décrire », c’est dire ce qu’on voit.'],
      ['Souligne les mots importants', 'Le sujet, les limites (« en 10 lignes », « à l’aide du document 2 »), les unités.'],
      ['Reformule avec tes mots', '« On me demande de… » Si tu n’y arrives pas, c’est qu’un mot t’échappe : cherche-le dans le cours ou le dictionnaire.'],
      ['Vérifie à la fin', 'Relis la consigne et coche : ai-je bien fait tout ce qui est demandé ?']],
    astuce: 'Pour les plus jeunes : lire la consigne à voix haute à un adulte, puis la redire sans regarder.' },
  { id: 'lecon', e: '📖', titre: 'Apprendre une leçon', court: 'Comprendre d’abord, retenir ensuite.',
    etapes: [['Relis la leçon le jour même', 'Cinq minutes le soir du cours valent plus qu’une heure la veille du contrôle.'],
      ['Repère le plan et les mots en gras', 'Les titres montrent l’organisation ; les mots en gras sont souvent ceux qu’on te demandera.'],
      ['Cache et redis', 'Cache la leçon et essaie de la raconter, ou de l’écrire au brouillon. Là où tu bloques, c’est ce qu’il faut revoir.'],
      ['Fabrique des questions', 'Transforme la leçon en flashcards : une question au recto, la réponse au verso.'],
      ['Revois plusieurs fois, en espaçant', 'Le lendemain, puis 3 jours après, puis une semaine après. La révision progressive de NaoStudy le fait pour toi.']],
    astuce: 'Apprendre en plusieurs petites fois retient mieux qu’une seule longue séance.' },
  { id: 'fiche', e: '🗂️', titre: 'Faire une fiche', court: 'L’essentiel d’un chapitre sur une page.',
    etapes: [['Un titre clair', 'Le nom du chapitre, et la matière.'], ['Un résumé en quelques lignes', 'L’idée principale, avec tes mots — pas un copier-coller du cours.'],
      ['Les mots-clés et définitions', 'Les notions à connaître par cœur, chacune avec sa définition courte.'], ['Un ou deux exemples', 'Un exemple compris vaut mieux qu’une définition récitée.'],
      ['Des couleurs, avec modération', 'Une couleur pour les définitions, une pour les exemples : ça aide la mémoire visuelle.']],
    astuce: 'Une fiche trop longue n’est plus une fiche : si elle déborde, fais-en deux.' },
  { id: 'oral', e: '🎤', titre: 'Préparer un oral', court: 'Parler avec assurance, sans lire.',
    etapes: [['Écris un plan simple', 'Une introduction, deux ou trois parties, une conclusion.'], ['Mets des mots-clés sur tes notes', 'Pas des phrases entières : tu parleras plus naturellement.'],
      ['Chronomètre-toi', 'Répète à voix haute avec le chrono de NaoStudy. Ajuste pour tenir le temps.'], ['Entraîne-toi devant quelqu’un', 'Un parent, un ami, ou un miroir. Demande-lui une question.'],
      ['Prépare le début par cœur', 'Les deux premières phrases bien sues donnent confiance pour la suite.']],
    astuce: 'Le trac est normal : respire lentement trois fois avant de commencer.' },
  { id: 'organiser', e: '🗓️', titre: 'Organiser ses révisions', court: 'Un plan réaliste, sans tout laisser à la veille.',
    etapes: [['Liste ce qu’il faut revoir', 'Chapitres, fiches, exercices types.'], ['Compte les jours disponibles', 'Et garde des pauses, et du temps libre.'],
      ['Répartis en petites séances', '20 à 30 minutes par séance, en alternant les matières. NaoStudy peut créer le planning pour toi depuis un contrôle.'],
      ['Commence par ce qui est difficile', 'Quand tu es encore frais·che.'], ['La veille : on relit, on dort', 'Pas de nouvelle notion la veille. Un quiz rapide, puis une bonne nuit.']],
    astuce: 'Coche chaque séance faite : voir la barre avancer motive.' },
  { id: 'stress', e: '🌿', titre: 'Gérer le stress avant un contrôle', court: 'Des gestes simples pour rester calme.',
    etapes: [['Respire', 'Inspire 4 secondes, bloque 4 secondes, souffle 6 secondes. Recommence trois fois.'], ['Parle-toi gentiment', '« J’ai révisé, je vais faire de mon mieux. » Pas besoin d’être parfait·e.'],
      ['Prépare tes affaires la veille', 'Trousse, calculatrice, convocation : un souci de moins le matin.'], ['Pendant le contrôle', 'Lis tout le sujet, commence par ce que tu sais faire, garde 5 minutes pour relire.'],
      ['Après', 'C’est fini, quelle que soit la note. Note ce qui a marché dans ton carnet de bord.']],
    astuce: 'Si le stress devient trop lourd ou dure longtemps, parles-en à un adulte de confiance, à l’infirmerie scolaire ou à un professionnel de santé.' }
];
/* L'aide aux devoirs : des questions et des indices, jamais la réponse finale. */
const AIDES = [
  { id: 'probleme', e: '🧮', titre: 'Un problème de maths ou de sciences', etapes: [
    { q: 'Qu’est-ce qu’on te demande de trouver ? Écris-le avec tes mots.', i: ['Cherche la question à la fin de l’énoncé, souvent après « Calcule », « Combien », « Quel est ».', 'Précise l’unité attendue : des euros, des mètres, des minutes ?'] },
    { q: 'Quelles données as-tu ? Recopie les nombres utiles et ce qu’ils représentent.', i: ['Chaque nombre a un sens : « 12 = le nombre de billes de Léo ».', 'Attention aux données inutiles, et aux données cachées dans le texte (« le double », « une douzaine »).'] },
    { q: 'As-tu déjà fait un exercice qui ressemble à celui-ci ? Lequel, et quelle méthode avais-tu utilisée ?', i: ['Regarde dans ton cours ou ton cahier d’exercices du même chapitre.', 'Demande-toi : est-ce une situation d’addition, de partage, de proportion, de formule ?'] },
    { q: 'Écris ton plan de calcul, étape par étape, sans encore calculer.', i: ['Parfois il faut d’abord trouver un résultat intermédiaire.', 'Un petit schéma ou un tableau peut aider à voir la situation.'] },
    { q: 'Fais les calculs, puis vérifie : ton résultat est-il vraisemblable ?', i: ['Un ordre de grandeur : un prix de 3 000 € pour un croissant, c’est suspect !', 'Relis la question : as-tu bien répondu par une phrase, avec l’unité ?'] }] },
  { id: 'redaction', e: '✍️', titre: 'Une rédaction ou une expression écrite', etapes: [
    { q: 'Quel est le sujet exact ? Qui raconte, à quel temps, quelle longueur ?', i: ['Souligne les contraintes : « à la première personne », « au passé », « 20 lignes ».'] },
    { q: 'Note toutes tes idées en vrac, sans te juger (au moins 5).', i: ['Pense aux cinq sens : ce qu’on voit, entend, sent…', 'Qui ? Où ? Quand ? Quoi ? Pourquoi ? Comment ?'] },
    { q: 'Choisis tes meilleures idées et range-les dans un plan : début, milieu, fin.', i: ['Le début présente la situation, le milieu raconte le problème ou l’événement, la fin le résout.'] },
    { q: 'Écris ta première phrase. Comment vas-tu donner envie de lire la suite ?', i: ['Tu peux commencer par une action, une question, un dialogue ou une description.'] },
    { q: 'Relis-toi : ponctuation, accords, répétitions. Qu’as-tu corrigé ?', i: ['Lis à voix haute : on entend les phrases trop longues.', 'Vérifie les accords sujet–verbe et les terminaisons du temps choisi.'] }] },
  { id: 'lecture', e: '📚', titre: 'Des questions sur un texte', etapes: [
    { q: 'Lis le texte une fois pour toi. De quoi parle-t-il, en une phrase ?', i: ['Qui sont les personnages ? Où et quand se passe l’histoire ?'] },
    { q: 'Lis la question. Quel mot de la question peux-tu retrouver dans le texte ?', i: ['Les réponses sont souvent près des mots de la question.', 'Numérote les lignes pour t’y retrouver.'] },
    { q: 'Recopie le passage du texte qui aide à répondre (ou note le numéro de ligne).', i: ['Si la réponse n’est pas écrite telle quelle, c’est une question d’interprétation : il faut déduire.'] },
    { q: 'Rédige ta réponse avec une phrase complète qui reprend la question.', i: ['« Le personnage est triste car… » plutôt que « car… ».', 'Justifie avec une citation entre guillemets si on te le demande.'] }] },
  { id: 'document', e: '🗺️', titre: 'Analyser un document (histoire, géo, SES…)', etapes: [
    { q: 'Présente le document : nature (carte, texte, photo, graphique), auteur, date, source.', i: ['Ces informations sont souvent écrites en petit, sous le document.'] },
    { q: 'Que vois-tu ou que dit-il ? Décris sans interpréter.', i: ['Pour un graphique : que mesure-t-on, sur quelle période, quelle évolution générale ?'] },
    { q: 'Quel lien avec ton cours ? Quelle notion ou quel événement il illustre ?', i: ['Relis le titre du chapitre et les mots-clés de ta fiche.'] },
    { q: 'Quelle est la limite du document ? Qu’est-ce qu’il ne montre pas ?', i: ['Qui l’a produit, et dans quel but ? Est-il complet ?'] }] },
  { id: 'langue', e: '🌍', titre: 'Un exercice de langue étrangère', etapes: [
    { q: 'Quelle règle de grammaire ou quel vocabulaire l’exercice fait-il travailler ?', i: ['Regarde le titre de la leçon du jour dans ton cahier.'] },
    { q: 'Rappelle-toi la règle avec un exemple de ton cours.', i: ['Écris l’exemple du cours à côté : il te servira de modèle.'] },
    { q: 'Fais la première phrase en suivant le modèle, puis explique pourquoi tu as choisi cette forme.', i: ['Vérifie le sujet : il change souvent la forme du verbe.', 'Un mot inconnu ? Cherche-le dans ton lexique ou un dictionnaire.'] },
    { q: 'Relis tes phrases à voix haute. Sonnent-elles juste ?', i: ['Compare avec les phrases du texte ou de la leçon.'] }] },
  { id: 'par-coeur', e: '🧠', titre: 'Une leçon à apprendre par cœur', etapes: [
    { q: 'Découpe la leçon en petits morceaux. Combien y en a-t-il ?', i: ['Un paragraphe, une définition ou 4 vers à la fois.'] },
    { q: 'Apprends le premier morceau, cache-le et récite-le. Qu’as-tu oublié ?', i: ['Invente une image mentale, un geste ou un moyen mnémotechnique pour ce qui résiste.'] },
    { q: 'Ajoute le morceau suivant, puis récite les deux ensemble.', i: ['Répète en marchant, ou en l’enregistrant et en l’écoutant.'] },
    { q: 'Crée 3 flashcards sur ce qui est le plus difficile : NaoStudy te les reposera.', i: ['Une question courte au recto, une réponse courte au verso.'] }] }
];
function vueAide() {
  if (U.aide) return vuePasAPas();
  return `<div class="section-titre"><h2>Besoin <span>d’aide ?</span></h2></div>
    <div class="note promesse"><span class="e">🤝</span><div><b>NaoStudy ne fait pas les devoirs à ta place</b> : il t’aide à trouver toi-même, avec des méthodes, des questions et des indices. Ton enseignant reste la meilleure personne pour expliquer une notion : n’hésite pas à lui poser tes questions.</div></div>
    <h3 style="font-style:italic;margin:4px 0 10px">✨ Aide aux devoirs, pas à pas</h3>
    <div class="methodes">${AIDES.map(a => `<button type="button" class="methode" data-act="aide-lancer" data-id="${a.id}"><span class="e">${a.e}</span><b>${esc(a.titre)}</b><small>${a.etapes.length} étapes · questions et indices</small></button>`).join('')}</div>
    <h3 style="font-style:italic;margin:26px 0 10px">📘 Les méthodes</h3>
    <div class="methodes">${METHODES.map(m => `<button type="button" class="methode" data-act="methode" data-id="${m.id}"><span class="e">${m.e}</span><b>${esc(m.titre)}</b><small>${esc(m.court)}</small></button>`).join('')}</div>`;
}
function vuePasAPas() {
  const a = AIDES.find(x => x.id === U.aide.id), i = U.aide.i, et = a.etapes[i], fini = i >= a.etapes.length;
  const dev = U.aide.devoir ? S.devoirs.find(d => d.id === U.aide.devoir) : null;
  if (fini) return `<div class="section-titre"><h2>${a.e} <span>Bravo !</span></h2></div>
    <div class="pas-a-pas"><p style="margin-top:0">Tu as suivi toutes les étapes. Voici ce que tu as trouvé, avec tes mots :</p>
      <div class="etapes">${a.etapes.map((e, k) => `<div class="etape"><b>${esc(e.q)}</b><p style="white-space:pre-wrap">${esc(U.aide.rep[k] || '—')}</p></div>`).join('')}</div>
      <div class="note douce" style="margin-top:14px"><span class="e">✅</span><div>Relis une dernière fois la consigne : as-tu répondu à tout ? En cas de doute, note ta question pour ton enseignant — c’est une très bonne démarche.</div></div>
      <div class="pied-fen"><button type="button" class="btn fin" data-act="aide-quitter">Revenir aux aides</button><div class="droite">
        ${dev ? `<button type="button" class="btn fin" data-act="aide-garder">📎 Garder dans le devoir</button>` : ''}<button type="button" class="btn" data-act="aide-quitter">Terminer</button></div></div></div>`;
  return `<div class="section-titre"><h2>${a.e} <span>${esc(a.titre)}</span></h2><div class="droite"><button type="button" class="btn fin" data-act="aide-quitter">✕ Quitter</button></div></div>
    ${dev ? `<div class="note"><span class="e">📚</span><div><b>${esc(dev.titre)}</b>${dev.consigne ? ' — ' + esc(dev.consigne) : ''}</div></div>` : ''}
    <div class="pas-a-pas">
      <div class="compteur">Étape ${i + 1} sur ${a.etapes.length}</div><div class="prog" style="margin:6px 0 12px"><i style="width:${Math.round(i / a.etapes.length * 100)}%"></i></div>
      <h4>${esc(et.q)}</h4>
      <textarea id="aideRep" placeholder="Écris ici ce que tu penses — il n’y a pas de mauvaise réponse à cette étape." aria-label="Ta réflexion">${esc(U.aide.rep[i] || '')}</textarea>
      ${et.i.slice(0, U.aide.ind).map(t => `<div class="indice">💡 ${esc(t)}</div>`).join('')}
      <div class="pied-fen">${i ? '<button type="button" class="btn fin" data-act="aide-pas" data-n="-1">◀ Retour</button>' : ''}
        ${U.aide.ind < et.i.length ? `<button type="button" class="btn fin" data-act="aide-indice">💡 Un indice${et.i.length > 1 ? ` (${U.aide.ind + 1}/${et.i.length})` : ''}</button>` : ''}
        <div class="droite"><button type="button" class="btn" data-act="aide-pas" data-n="1">${i === a.etapes.length - 1 ? 'Terminer ✓' : 'Étape suivante ▶'}</button></div></div>
    </div>`;
}

/* ============================================================
   L'orientation
   ============================================================ */
function vueOrientation() {
  const l = duProfil(S.orientation), cand = l.filter(o => o.date && o.date >= auj()).sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="section-titre"><h2>Mon <span>orientation</span></h2><div class="droite"><button type="button" class="btn" data-act="orient-nouveau">＋ Ajouter</button></div></div>
    <p class="chapo">Un carnet pour explorer à ton rythme : des métiers qui t’intriguent, des formations, des stages, des dates à ne pas manquer. Pour choisir, rien ne remplace les conseils des professionnels de l’orientation (Psy-EN, CIO, conseillers de ton établissement).</p>
    ${cand.length ? `<div class="carte" style="margin-bottom:14px"><h3><span class="e">📮</span>Prochaines dates</h3><div class="lignes">${cand.slice(0, 5).map(o => `<div class="ligne compacte cliquable" data-act="orient" data-id="${o.id}"><span class="pic">${typeOrient(o.type).e}</span><div class="corps"><div class="t">${esc(o.titre)}</div><div class="s"><span>${esc(dateCourte(o.date))}</span></div></div><span class="badge ${etatDate(o.date, 14)}">${esc(Maj(dans(o.date)))}</span></div>`).join('')}</div></div>` : ''}
    <div class="grille">${TYPES_ORIENT.map(t => { const it = l.filter(o => o.type === t.id); return `<div class="carte"><h3><span class="e">${t.e}</span>${t.nom}<button type="button" class="ico-btn plus" data-act="orient-nouveau" data-t="${t.id}" aria-label="Ajouter : ${esc(t.un)}">＋</button></h3>
      ${it.length ? `<div class="lignes">${it.map(o => `<div class="ligne compacte cliquable" data-act="orient" data-id="${o.id}"><div class="corps"><div class="t">${esc(o.titre)}</div>${o.detail || o.date ? `<div class="s">${o.date ? `<span>📅 ${esc(dateCourte(o.date))}</span>` : ''}${o.statut ? `<span>${esc(o.statut)}</span>` : ''}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px">${esc(o.detail || '')}</span></div>` : ''}</div></div>`).join('')}</div>` : '<div class="vide">—</div>'}
      ${t.id === 'cv' || t.id === 'lettre' ? `<p style="margin:8px 0 0;font-family:var(--ui);font-size:12.5px;color:var(--ink-3)">Pour mettre en forme ton CV et tes lettres : <a href="../NaoCV/NaoCV.html">NaoCV</a>.</p>` : ''}</div>`; }).join('')}</div>`;
}

/* ============================================================
   Les récompenses : badges, séries, défi de la semaine
   ============================================================ */
const compte = (quoi, p = pid()) => duProfil(S.sessions, p).filter(s => s.quoi === quoi).reduce((t, s) => t + (s.n || 1), 0);
function badgesDe(p = pid()) {
  const b = S.badges[p] || {}, cs = duProfil(S.cartes, p);
  const serieMax = (() => { const j = [...joursActifs(p)].sort(); let m = 0, n = 0, prec = ''; j.forEach(d => { n = prec && plusJours(prec, 1) === d ? n + 1 : 1; m = Math.max(m, n); prec = d; }); return m; })();
  return [
    { id: 'premier', e: '🌱', nom: 'Premier pas', d: 'Une première séance d’apprentissage', ok: duProfil(S.sessions, p).length > 0 },
    { id: 'fiche', e: '🗂️', nom: 'Bien rangé', d: 'Une première fiche de révision', ok: duProfil(S.fiches, p).length >= 1 },
    { id: 'fiches10', e: '📚', nom: 'Bibliothèque', d: '10 fiches créées', ok: duProfil(S.fiches, p).length >= 10 },
    { id: 'cartes', e: '🃏', nom: 'Mémoire en marche', d: '30 flashcards révisées', ok: compte('cartes', p) >= 30 },
    { id: 'ancre', e: '⚓', nom: 'Bien ancré', d: '10 cartes dans la boîte 5', ok: cs.filter(c => c.boite >= 5).length >= 10 },
    { id: 'quiz', e: '❓', nom: 'Curiosité', d: 'Un premier quiz terminé', ok: compte('quiz', p) >= 1 },
    { id: 'parfait', e: '💯', nom: 'Sans faute', d: 'Un quiz réussi à 100 %', ok: !!b.parfait },
    { id: 'serie3', e: '🔥', nom: 'Régularité', d: '3 jours d’affilée', ok: serieMax >= 3 },
    { id: 'serie7', e: '🌟', nom: 'Semaine entière', d: '7 jours d’affilée', ok: serieMax >= 7 },
    { id: 'rendus', e: '📬', nom: 'Ponctualité', d: '5 devoirs rendus', ok: duProfil(S.devoirs, p).filter(d => d.statut === 'rendu').length >= 5 },
    { id: 'heure', e: '⏱️', nom: 'Une belle heure', d: '60 min de révision en une semaine', ok: !!b.heure || minutesSemaine(p) >= 60 },
    { id: 'objectifs', e: '🎯', nom: 'Dans le mille', d: '5 objectifs atteints', ok: duProfil(S.objectifs, p).filter(o => o.fait).length >= 5 },
    { id: 'defi', e: '🏆', nom: 'Défi relevé', d: 'Un défi de la semaine réussi', ok: !!b.defi },
    { id: 'aide', e: '💡', nom: 'Chercheur·se', d: 'Une aide pas à pas menée au bout', ok: compte('aide', p) >= 1 },
    { id: 'orient', e: '🧭', nom: 'Exploration', d: '3 idées d’orientation notées', ok: duProfil(S.orientation, p).length >= 3 }
  ];
}
const DEFIS = [
  { id: 'min60', nom: 'Réviser 1 heure dans la semaine', cible: 60, unite: 'min', mesure: (p, l) => minutesSemaine(p, l) },
  { id: 'jours4', nom: 'Apprendre 4 jours différents', cible: 4, unite: 'jours', mesure: (p, l) => new Set(duProfil(S.sessions, p).filter(s => s.date >= l && s.date <= plusJours(l, 6)).map(s => s.date)).size },
  { id: 'cartes40', nom: 'Réviser 40 flashcards', cible: 40, unite: 'cartes', mesure: (p, l) => duProfil(S.sessions, p).filter(s => s.quoi === 'cartes' && s.date >= l && s.date <= plusJours(l, 6)).reduce((t, s) => t + (s.n || 0), 0) },
  { id: 'quiz3', nom: 'Faire 3 quiz', cible: 3, unite: 'quiz', mesure: (p, l) => duProfil(S.sessions, p).filter(s => s.quoi === 'quiz' && s.date >= l && s.date <= plusJours(l, 6)).length },
  { id: 'fiches2', nom: 'Créer 2 fiches', cible: 2, unite: 'fiches', mesure: (p, l) => duProfil(S.fiches, p).filter(f => (f.cree || '') >= l && (f.cree || '') <= plusJours(l, 6)).length },
  { id: 'devoirs', nom: 'Rendre 3 devoirs à temps', cible: 3, unite: 'devoirs', mesure: (p, l) => duProfil(S.devoirs, p).filter(d => d.statut === 'rendu' && d.renduLe >= l && d.renduLe <= plusJours(l, 6) && (!d.pour || d.renduLe <= d.pour)).length }
];
function defiDe(p = pid()) {
  const l = lundiDe(auj()), d = S.defis[p];
  if (!d || d.semaine !== l) return null;
  const def = DEFIS.find(x => x.id === d.id); if (!def) return null;
  const v = def.mesure(p, l);
  return { def, v, p: Math.min(100, Math.round(v / def.cible * 100)) };
}
function carteDefi() {
  const d = defiDe();
  return `<div class="carte"><h3><span class="e">🏆</span>Mon défi de la semaine</h3>
    ${d ? `<div class="defi"><div class="anneau" style="--p:${d.p}" role="img" aria-label="${d.p} % du défi"><span>${d.p}%</span></div><div style="flex:1;min-width:160px"><b style="font-size:16px">${esc(d.def.nom)}</b>
      <p style="margin:4px 0 0;font-family:var(--ui);font-size:13px;color:var(--ink-3)">${Math.min(d.v, d.def.cible)} / ${d.def.cible} ${d.def.unite}${d.p >= 100 ? ' · Défi relevé, bravo ! 🎉' : ' · encore ' + (d.def.cible - d.v) + ' ' + d.def.unite}</p>
      <button type="button" class="lien-discret" data-act="defi-choisir" style="padding-left:0">Changer de défi</button></div></div>`
      : `<p style="margin:0 0 10px;color:var(--ink-2)">Un petit défi, choisi par toi, pour avancer sans pression.</p><button type="button" class="btn petit" data-act="defi-choisir">🏆 Choisir mon défi</button>`}</div>`;
}
function vueRecompenses() {
  const b = badgesDe(), obtenus = b.filter(x => x.ok).length, j = joursActifs(), s = serie();
  return `<div class="section-titre"><h2>Mes <span>récompenses</span></h2></div>
    <p class="chapo">Ici, on célèbre les efforts, pas seulement les résultats. ${esc(encouragement())}</p>
    <div class="grille" style="margin-bottom:16px">
      <div class="carte"><h3><span class="e">🔥</span>Ma série<span class="badge ok plus">${pluriel(s, 'jour')}</span></h3>
        <div class="serie" aria-label="Les 14 derniers jours">${Array.from({ length: 14 }, (_, i) => { const d = plusJours(auj(), i - 13); return `<span class="${j.has(d) ? 'ok' : ''}" title="${esc(dateLongue(d))}">${dateDe(d).getDate()}</span>`; }).join('')}</div>
        <p style="margin:10px 0 0;font-family:var(--ui);font-size:13px;color:var(--ink-3)">Une séance, un quiz, des flashcards ou une aide pas à pas suffisent pour allumer la journée. Un jour sans ? Ce n’est pas grave : on recommence demain.</p></div>
      ${carteDefi()}
    </div>
    <h3 style="font-style:italic;margin:6px 0 12px">Mes badges <span style="font-family:var(--ui);font-style:normal;font-size:13px;color:var(--ink-3)">· ${obtenus} sur ${b.length}</span></h3>
    <div class="badges">${b.map(x => `<div class="badge-r ${x.ok ? '' : 'pas-encore'}"><div class="med" aria-hidden="true">${x.e}</div><b>${esc(x.nom)}</b><small>${esc(x.d)}</small></div>`).join('')}</div>`;
}

/* ============================================================
   La vue parent : les échéances de chacun, sans les contenus privés
   ============================================================ */
function vueParent() {
  return `<div class="section-titre"><h2>👪 Vue <span>parent</span></h2><div class="droite"><button type="button" class="btn fin" data-act="reglages">⚙️ Profils & contrôle parental</button></div></div>
    <div class="note promesse"><span class="e">🛡️</span><div>Ici, seulement l’essentiel : les échéances, les contrôles et la régularité de chacun. <b>Les fiches, les consignes, le carnet de bord et l’orientation restent privés.</b> Les notes n’apparaissent que si le profil l’a autorisé.</div></div>
    <div class="enfants">${S.profils.map(p => {
      const devs = trierDevoirs(devoirsOuverts(p.id)).slice(0, 5), evs = evalsAVenir(p.id).slice(0, 4), revs = duProfil(S.revisions, p.id).filter(r => r.date >= lundiDe(auj()) && r.date <= plusJours(lundiDe(auj()), 6));
      const retard = devoirsOuverts(p.id).filter(d => d.pour && ecart(d.pour) < 0).length, m = moyenneGenerale(p.id);
      return `<div class="enfant" style="--c:${p.couleur}"><div class="tete">${rondProfil(p)}<div><b style="font-size:17px">${esc(p.prenom)}</b><small>${esc([p.niveau, p.etab].filter(Boolean).join(' · '))}</small></div>
        <button type="button" class="btn petit fin" style="margin-left:auto" data-act="profil" data-id="${p.id}">Ouvrir</button></div>
        <div class="chiffres" style="grid-template-columns:repeat(3,1fr)"><div class="chiffre"><small>À rendre</small><b>${devoirsOuverts(p.id).length}</b></div><div class="chiffre"><small>En retard</small><b style="color:${retard ? 'var(--doux)' : 'inherit'}">${retard}</b></div><div class="chiffre"><small>Série</small><b>${serie(p.id)} j</b></div></div>
        <h4 style="margin:4px 0 6px;font-family:var(--ui);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)">Échéances</h4>
        ${devs.map(d => `<div class="ligne compacte teinte" style="--c:${couleurMat(d.matiere)};margin-bottom:6px"><div class="corps"><div class="t" style="font-size:14px">Devoir de ${esc(nomMat(d.matiere))}</div><div class="s"><span>${statut(d.statut).e} ${esc(statut(d.statut).nom)}</span></div></div>${d.pour ? `<span class="badge ${etatDate(d.pour, 2)}">${esc(dateCourte(d.pour))}</span>` : ''}</div>`).join('') || '<div class="vide" style="font-size:13.5px">Aucun devoir en attente.</div>'}
        ${evs.map(v => `<div class="ligne compacte teinte" style="--c:${couleurMat(v.matiere)};margin-bottom:6px"><div class="corps"><div class="t" style="font-size:14px">${typeEval(v.type).e} ${esc(typeEval(v.type).nom)} de ${esc(nomMat(v.matiere))}</div></div><span class="badge bientot">${esc(dateCourte(v.date))}</span></div>`).join('')}
        <div style="font-family:var(--ui);font-size:13px;color:var(--ink-2);margin-top:8px">🧠 Révisions cette semaine : ${revs.filter(r => r.fait).length}/${revs.length} séances · ${duree(minutesSemaine(p.id))}</div>
        ${p.partageNotes ? `<div style="font-family:var(--ui);font-size:13px;color:var(--ink-2);margin-top:4px">📊 Moyenne indicative : <b>${note20(m)}</b>/20</div>` : ''}
        <div class="prive">🔒 Contenus privés masqués${p.partageNotes ? '' : ' · notes non partagées'}</div></div>`;
    }).join('')}</div>`;
}

/* ============================================================
   Comment ça marche : le mode d'emploi, écrit pour les jeunes
   ============================================================ */
const GUIDE = [
  { e: '👤', titre: 'Crée ton profil', vue: '', texte: 'Un profil par personne : ton prénom ou un pseudo, ta classe, une couleur. Les matières de ta classe sont proposées toutes seules. Dans une famille, chacun a le sien : clique sur ton prénom en haut pour passer de l’un à l’autre.',
    astuces: ['Tu peux ajouter ou modifier tes matières (couleur, professeur, coefficient) avec le bouton ⚙️.'] },
  { e: '🗓️', titre: 'Remplis ton emploi du temps', vue: 'edt', texte: 'Clique sur une case vide de la grille, au bon jour et à la bonne heure : la fenêtre s’ouvre avec l’horaire déjà rempli. Choisis la matière, la durée (1 h, 2 h…), la salle. Le cours revient tout seul chaque semaine.',
    astuces: ['Tu t’es trompé·e d’horaire ? Fais glisser le cours avec la souris ou le doigt.', 'Tire le bord du bas d’un cours pour le rallonger ou le raccourcir.', 'Deux heures de maths d’affilée ? Choisis « 2 h » dans la durée.', 'Ton collège alterne semaine A et semaine B ? Coche « Semaines A / B », puis indique pour chaque cours s’il a lieu toutes les semaines, en A ou en B.'] },
  { e: '📚', titre: 'Note tes devoirs', vue: 'devoirs', texte: 'Dès qu’un devoir est donné, ajoute-le : la matière, ce qu’il faut faire, pour quand. Ensuite, fais-le avancer de colonne en colonne : à commencer → en cours → terminé → rendu.',
    astuces: ['Choisis un rappel (la veille, 2 jours avant…) : il s’affiche dans « Ma journée ».', 'Prends la consigne en photo et joins-la au devoir.'] },
  { e: '📝', titre: 'Prépare tes contrôles', vue: 'controles', texte: 'Ajoute la date du contrôle et ce qu’il faut revoir. NaoStudy te propose un planning : de petites séances réparties sur les jours d’avant, pour ne pas tout réviser la veille.',
    astuces: ['Coche chaque séance faite : la barre avance et ta série de jours grandit.'] },
  { e: '🧠', titre: 'Révise malin', vue: 'revisions', texte: 'Fais une fiche par chapitre (résumé, mots-clés, définitions, exemples). Transforme-la en flashcards : une question d’un côté, la réponse de l’autre. Les cartes que tu sais reviennent moins souvent, celles qui sont difficiles reviennent vite : c’est la révision progressive.',
    astuces: ['Les quiz sont parfaits la veille d’un contrôle.', '« Lancer une révision » choisit pour toi : flashcards du jour, quiz, fiche ou chrono de 20 minutes.'] },
  { e: '📊', titre: 'Suis tes notes', vue: 'notes', texte: 'Ajoute chaque note avec son coefficient. Tu vois ta moyenne par matière, ta moyenne globale et des graphiques qui montrent si tu progresses. Choisis le trimestre ou le semestre en haut de la page.',
    astuces: ['Ce sont des moyennes indicatives : c’est toujours le bulletin qui compte.', 'Note aussi tes réussites et tes difficultés dans ton carnet de bord.'] },
  { e: '💡', titre: 'Demande de l’aide', vue: 'aide', texte: 'Bloqué·e sur un exercice ? L’aide pas à pas te pose des questions et te donne des indices, un par un. Elle ne donne jamais la réponse : c’est toi qui trouves, et c’est comme ça qu’on apprend.',
    astuces: ['Tu y trouveras aussi des méthodes : comprendre une consigne, apprendre une leçon, préparer un oral, gérer le stress.', 'Ton professeur reste la meilleure personne pour t’expliquer une notion : note tes questions pour lui.'] },
  { e: '🏅', titre: 'Gagne des badges', vue: 'recompenses', texte: 'Chaque jour où tu apprends quelque chose allume une case de ta série. Choisis un défi pour la semaine, débloque des badges. Pas de classement, pas de pression : juste tes efforts.',
    astuces: ['Un jour sans ? Ce n’est pas grave, on recommence demain.'] },
  { e: '👪', titre: 'Pour les parents', vue: '', texte: 'La « Vue parent » montre les échéances de chaque enfant (devoirs, contrôles, régularité) sans afficher les fiches, les consignes ni le carnet de bord. Un code parent peut la protéger, ainsi que l’ajout de profils et la réinitialisation.',
    astuces: ['Le code se crée avec le bouton ⚙️.', 'La moyenne d’un enfant n’apparaît dans la vue parent que s’il l’a autorisé dans son profil.'] },
  { e: '🔒', titre: 'Tes informations', vue: '', texte: 'Tout reste dans ce navigateur (et dans ton compte NaoGroup s’il est connecté). Rien n’est partagé tout seul. Le bouton 💾 crée une sauvegarde, 📂 la recharge, ♻️ remet l’outil à zéro.',
    astuces: ['L’interrupteur 🌙 / ☀️ passe du mode sombre au mode clair. A+ agrandit le texte, 🕊️ met les animations en pause.'] }
];
function vueGuide() {
  return `<div class="section-titre"><h2>Comment ça <span>marche ?</span></h2>${S.profils.length ? '' : '<div class="droite"><button type="button" class="btn fin" data-act="guide-quitter">← Retour</button></div>'}</div>
    <p class="chapo">NaoStudy t’aide à t’organiser : ton emploi du temps, tes devoirs, tes révisions et tes notes, au même endroit. Voici comment t’en servir, étape par étape.</p>
    <div class="guide-etapes">${GUIDE.map((g, i) => `<article class="guide-etape" style="--i:${i}">
      <div class="num" aria-hidden="true">${i + 1}</div>
      <div class="corps"><h3><span class="e">${g.e}</span>${esc(g.titre)}</h3><p>${esc(g.texte)}</p>
        ${g.astuces.length ? `<ul>${g.astuces.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        ${g.vue && S.profils.length ? `<button type="button" class="btn petit fin" data-vue-aller="${g.vue}">Y aller →</button>` : ''}</div></article>`).join('')}</div>
    <div class="carte" style="margin-top:18px"><h3><span class="e">🙋</span>Questions fréquentes</h3>
      <details class="plus-d"><summary>Mes informations sont-elles visibles par les autres ?</summary><p>Non. Chaque profil a son espace. Les parents ne voient que les échéances dans la vue parent, jamais tes fiches ni ton carnet de bord.</p></details>
      <details class="plus-d"><summary>J’ai changé d’ordinateur, je retrouve tout ?</summary><p>Si tu es connecté·e à ton compte NaoGroup, oui. Sinon, fais une sauvegarde 💾 sur l’ancien et recharge-la 📂 sur le nouveau. Les documents joints ne sont gardés que dans le navigateur : pense à cocher « inclure les documents » dans la sauvegarde.</p></details>
      <details class="plus-d"><summary>Ma moyenne n’est pas la même que sur mon bulletin.</summary><p>C’est normal : chaque établissement a ses propres règles (coefficients, arrondis, notes prises en compte). NaoStudy donne une estimation pour t’aider à suivre tes progrès.</p></details>
      <details class="plus-d"><summary>Je ne sais pas si on est en semaine A ou B.</summary><p>Regarde le badge à côté de la date dans l’emploi du temps. S’il se trompe, clique sur « C’est une semaine B » (ou A) : toutes les semaines suivantes se remettent dans le bon ordre.</p></details>
      <details class="plus-d"><summary>Je veux tout recommencer.</summary><p>Le bouton ♻️ Réinitialiser efface tout (il faut taper EFFACER). Fais une sauvegarde avant si tu veux pouvoir revenir en arrière.</p></details>
    </div>`;
}
