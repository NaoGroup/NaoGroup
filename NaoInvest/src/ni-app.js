/* ============================================================
   NaoInvest — les gestes : navigation, quiz, simulation, actualités,
   objectif, thème, réinitialisation, et le décor boursier.
   ============================================================ */
const ACT = {};

function aller(vue) {
  U.vue = vue; U.lecon = null; U.quiz = null; U.mix = null;
  if (location.hash.slice(1) !== vue) history.replaceState(null, '', '#' + vue);
  rendre(); scrollTo({ top: 0, behavior: 'smooth' });
}
function ouvrirLecon(id) {
  const l = lecon(id); if (!l) return;
  U.vue = l.esp; U.lecon = id; U.quiz = null; U.mix = null;
  history.replaceState(null, '', '#' + l.esp);
  rendre(); scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- les clics, en un seul endroit ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-vue],[data-act],[data-lecon],[data-parcours],[data-objectif],[data-attestation],[data-conseil-voir],[data-sim],[data-scenario],[data-fav],[data-cat],[data-vue-actu],[data-type-rep],[data-lettre],[data-mot],[data-journal-suppr],[data-archive-suppr],[data-actu-suppr]');
  if (!t) return;
  const d = t.dataset;
  if (d.vue) { e.preventDefault(); if ($('#modale').classList.contains('ouvert')) fermerModale(); aller(d.vue); return; }
  if (d.lecon) { e.preventDefault(); if ($('#modale').classList.contains('ouvert')) fermerModale(); ouvrirLecon(d.lecon); return; }
  if (d.act && ACT[d.act]) { e.preventDefault(); ACT[d.act](t); return; }
  if (d.parcours) { const p = PARCOURS.find(x => x.id === d.parcours); ouvrirLecon(p.lecons.find(id => !acquise(id)) || p.lecons[0]); return; }
  if (d.objectif) { S.objectif.parcours = d.objectif; sauver(); rendre(); toast('🎯 Objectif enregistré : la leçon du jour suivra ce parcours.'); return; }
  if (d.attestation) { attestation(d.attestation); return; }
  if (d.conseilVoir) { const [th, id] = d.conseilVoir.split('/'); U.themeC = th; aller('conseils'); setTimeout(() => { const el = $(`#c-${th}-${id}`); if (el) { el.querySelector('details').open = true; el.scrollIntoView({ block: 'center' }); el.classList.add('surligne'); } }, 80); return; }
  if (d.sim) { pasSim(+d.sim); return; }
  if (d.scenario) { pasSim(1, d.scenario); return; }
  if (d.fav) { const i = S.favoris.indexOf(d.fav); if (i >= 0) S.favoris.splice(i, 1); else S.favoris.push(d.fav); sauver(); rendre(); return; }
  if (d.cat !== undefined && t.matches('[data-cat]')) { U.cat = d.cat; rendre(); return; }
  if (d.vueActu) { U.vueActu = d.vueActu; rendre(); return; }
  if (d.typeRep !== undefined && t.matches('[data-type-rep]')) { remplirRepartition(REPARTITIONS_TYPES[+d.typeRep].r); return; }
  if (d.lettre !== undefined && t.matches('[data-lettre]')) { U.lettre = d.lettre; rendre(); return; }
  if (d.mot) { U.q = d.mot; U.lettre = ''; if (U.vue !== 'dico' || U.lecon) aller('dico'); else rendre(); const el = $('#dicoQ'); if (el) el.focus(); return; }
  if (d.journalSuppr) { S.sim.journal = S.sim.journal.filter(j => j.id !== d.journalSuppr); sauver(); rendre(); return; }
  if (d.archiveSuppr) { confirmer('Retirer cette simulation ?', 'Elle disparaîtra du tableau de comparaison.', 'Retirer').then(ok => { if (ok) { S.simArchives = S.simArchives.filter(a => a.id !== d.archiveSuppr); sauver(); rendre(); } }); return; }
  if (d.actuSuppr) { confirmer('Supprimer cette actualité ?', 'Elle sera retirée de votre liste.', 'Supprimer').then(ok => { if (ok) { S.actusPerso = S.actusPerso.filter(a => a.id !== d.actuSuppr); S.favoris = S.favoris.filter(f => f !== d.actuSuppr); sauver(); rendre(); } }); return; }
});

ACT.commencer = () => {
  if (!S.objectif.parcours && !faites().length) return ACT.objectif(true);
  ouvrirLecon(leconDuJour().l.id);
};
ACT['atelier-voiture'] = () => { if (U.themeC && U.themeC !== 'jeunes') { U.themeC = 'jeunes'; rendre(); } const el = $('#atelierVoiture'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
ACT['paie-effacer'] = () => { U.paie = null; const z = $('#resPaie'); if (z) z.innerHTML = ''; };
ACT.apprendre = () => ouvrirLecon(leconDuJour().l.id);
ACT.retour = () => { const v = U.lecon ? lecon(U.lecon).esp : U.vue; if (U.mix) { U.mix = null; rendre(); return; } aller(v); };
ACT.relire = () => { U.quiz = null; rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACT['quiz-lecon'] = t => { U.quiz = { id: t.dataset.id, rep: {}, resultat: null }; rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACT.refaire = () => {
  if (U.mix) { U.mix = nouveauMix(); rendre(); }
  else { U.quiz = { id: U.lecon, rep: {}, resultat: null }; rendre(); }
  scrollTo({ top: 0, behavior: 'smooth' });
};
ACT.actu2min = () => { U.vueActu = '2min'; U.cat = ''; aller('actus'); };

/* ---------- « Faire un quiz » : un quiz mélangé, les notions à revoir d'abord ---------- */
function nouveauMix() {
  const ratees = aRevoirAujourdhui().ratees, vues = LECONS.filter(l => etatLecon(l.id));
  const source = (ratees.length ? ratees : []).concat(vues.length ? vues : LECONS.filter(l => l.niv <= 2));
  const melange = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const choisies = [], vus = new Set();
  for (const l of source.concat(melange(LECONS))) {
    if (choisies.length >= 6) break;
    const q = melange(l.quiz)[0], cle = l.id + q.q;
    if (vus.has(l.id) || vus.has(cle)) continue;
    vus.add(l.id); vus.add(cle); choisies.push(q);
  }
  return { questions: choisies, rep: {}, resultat: null, revoir: ratees.length > 0 };
}
ACT.quiz = () => {
  const ratees = aRevoirAujourdhui().ratees;
  ouvrirModale(`<h3 id="modaleTitre"><span>✏️</span>Faire un quiz</h3>
    <p class="sous">Un quiz mélangé de 6 questions, ou le quiz d’une leçon précise.</p>
    <button class="btn gros" type="button" data-f="mix" style="width:100%;justify-content:center">🎲 Quiz mélangé${ratees.length ? ' (notions à revoir d’abord)' : ''}</button>
    ${ratees.length ? `<h4 class="petit-titre">🔁 Quiz à refaire</h4><div class="lignes">${ratees.map(l => ligneLecon(l, true)).join('')}</div>` : ''}
    <h4 class="petit-titre">📚 Toutes les leçons</h4>
    <div class="lignes liste-defile">${LECONS.map(l => ligneLecon(l, true)).join('')}</div>
    <div class="pied-fen"><div class="droite"><button class="btn fin" type="button" data-f="annuler">Fermer</button></div></div>`, f => {
    $('[data-f="mix"]', f).addEventListener('click', () => { fermerModale(); U.lecon = null; U.quiz = null; U.mix = nouveauMix(); rendre(); scrollTo({ top: 0, behavior: 'smooth' }); });
  }, true);
};

/* ---------- la validation des quiz ---------- */
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.matches('.quiz')) {
    e.preventDefault();
    const etat = f.dataset.quizLecon ? U.quiz : U.mix, questions = f.dataset.quizLecon ? lecon(f.dataset.quizLecon).quiz : U.mix.questions;
    const rep = {};
    questions.forEach((q, i) => { const el = q.n !== undefined ? f.querySelector(`[name="r${i}"]`) : f.querySelector(`[name="r${i}"]:checked`); rep[i] = el ? el.value : ''; });
    const manque = questions.findIndex((q, i) => String(rep[i]).trim() === '');
    if (manque >= 0) {
      etat.rep = rep; toast(`Il reste une question sans réponse (n° ${manque + 1}).`);
      const fs = f.querySelectorAll('.question')[manque]; fs.classList.add('oubli'); fs.scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    etat.rep = rep; etat.resultat = corriger(questions, rep);
    const score = etat.resultat.score;
    let nouveaux = [];
    if (f.dataset.quizLecon) nouveaux = enregistrerLecon(f.dataset.quizLecon, score);
    else { S.quizMix.push({ date: auj(), score }); S.quizMix = S.quizMix.slice(-20); sauver(); }
    rendre();
    const r = $('.resultat'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (score >= SEUIL) celebrer(score === 100 ? 'Parfait !' : 'Leçon réussie');
    nouveaux.forEach((b, i) => setTimeout(() => { celebrer(`${b.e} Badge « ${b.nom} »`); toast(`🏅 Nouveau badge : « ${b.nom} »`); }, 1400 * (i + 1)));
    const finis = PARCOURS.filter(p => S.attestations[p.id] === auj() && f.dataset.quizLecon && p.lecons.includes(f.dataset.quizLecon) && progressionParcours(p).fini);
    finis.forEach(p => toast(`🎓 Parcours « ${p.nom} » terminé : votre attestation est prête.`, { action: 'Voir', fait: () => attestation(p.id), duree: 9000 }));
    return;
  }
  if (f.id === 'repForm') { e.preventDefault(); demarrerSim(f); return; }
  if (f.id === 'journalForm') {
    e.preventDefault(); const t = $('#journalTexte').value.trim(); if (!t) return;
    S.sim.journal.push({ id: uid(), date: auj(), etape: S.sim.etapes.length, auto: false, texte: t }); sauver(); rendre();
    toast('✍️ Noté dans votre journal.');
  }
});

/* ---------- les cases et curseurs ---------- */
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.check !== undefined) {
    S.checklist[t.dataset.check] = t.checked;
    const nouveaux = verifierBadges(); sauver(); rendre();
    if (CHECKLIST.every((_, i) => S.checklist[i]) && t.checked) toast('✅ Toutes les cases sont cochées. Gardez ce réflexe à chaque décision.');
    nouveaux.forEach(b => { celebrer(`${b.e} Badge « ${b.nom} »`); toast(`🏅 Nouveau badge : « ${b.nom} »`); });
  }
  if (t.name && t.closest('.quiz')) { const fs = t.closest('.question'); if (fs) fs.classList.remove('oubli'); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.closest('#repForm')) majRepartition(t);
  if (t.id === 'dicoQ') { U.q = t.value; U.lettre = ''; const pos = t.selectionStart; rendre(); const n = $('#dicoQ'); n.focus(); n.setSelectionRange(pos, pos); }
});

/* ============================================================
   La simulation
   ============================================================ */
/* la répartition garde toujours un total de 100 % : c'est la réserve d'espèces qui s'ajuste */
function lireRep() { return Object.fromEntries(ACTIFS.map(a => [a.id, +($(`#rep-${a.id}`) || { value: 0 }).value])); }
function remplirRepartition(r) { ACTIFS.forEach(a => { const el = $(`#rep-${a.id}`); if (el) el.value = r[a.id] || 0; }); majRepartition(); }
function majRepartition(bouge) {
  const r = lireRep();
  if (bouge && bouge.type === 'range') {
    const autre = bouge.name === 'cash' ? null : 'cash';
    const tot = Object.values(r).reduce((a, b) => a + b, 0);
    if (autre && tot !== 100) { const c = Math.max(0, r.cash - (tot - 100)); r.cash = c; $('#rep-cash').value = c; }
    const tot2 = ACTIFS.reduce((t, a) => t + r[a.id], 0);
    if (tot2 > 100) { const v = +bouge.value - (tot2 - 100); bouge.value = v; r[bouge.name] = v; }
  }
  ACTIFS.forEach(a => { const o = $(`#rep-${a.id}`); if (o) o.nextElementSibling.textContent = `${r[a.id]} %`; });
  const tot = ACTIFS.reduce((t, a) => t + r[a.id], 0), el = $('#totalRep'), b = $('#repValider');
  if (!el) return;
  const nSupports = ACTIFS.filter(a => r[a.id] > 0).length;
  el.innerHTML = `${barreRepartition(Object.fromEntries(ACTIFS.map(a => [a.id, r[a.id]])))}
    <p><b>Total : ${tot} %</b> — ${tot === 100 ? `soit ${nb(DEPART)} NaoCoins répartis sur ${nSupports} support${nSupports > 1 ? 's' : ''}.` : tot < 100 ? `il reste ${100 - tot} % à répartir.` : `${tot - 100} % de trop.`}
    ${tot === 100 && nSupports === 1 && r.cash !== 100 ? ' <span class="badge bientot">Tout sur un seul support : observez bien ce qui se passe en scénario de crise.</span>' : ''}</p>`;
  b.disabled = tot !== 100; b.style.opacity = tot === 100 ? 1 : .5;
}
function demarrerSim(f) {
  const r = lireRep();
  if (ACTIFS.reduce((t, a) => t + r[a.id], 0) !== 100) return toast('La répartition doit faire 100 %.');
  S.sim = Object.assign(nouvelleSim(), { rep: r });
  S.sim.journal.push({ id: uid(), date: auj(), etape: 0, auto: true, texte: `Départ : ${nb(DEPART)} NaoCoins répartis ainsi — ${ACTIFS.filter(a => r[a.id]).map(a => `${a.court} ${r[a.id]} %`).join(', ')}. Aucun argent réel n’est en jeu.` });
  sauver(); rendre(); scrollTo({ top: 0, behavior: 'smooth' });
  toast('✦ Simulation lancée. Faites passer le temps ou choisissez un scénario.');
}
function pasSim(n, scenario) {
  if (!S.sim.rep) return;
  for (let i = 0; i < n; i++) avancer(scenario);
  const nouveaux = verifierBadges(); sauver(); rendre();
  const j = $('.journal .entree'); if (j) j.classList.add('neuve');
  nouveaux.forEach(b => { celebrer(`${b.e} Badge « ${b.nom} »`); toast(`🏅 Nouveau badge : « ${b.nom} »`); });
  if (scenario) { const sc = SCENARIOS.find(s => s.id === scenario); toast(`${sc.e} Scénario « ${sc.nom} » appliqué : l’explication est dans votre journal.`); }
}
ACT['sim-recommencer'] = () => {
  const sim = S.sim;
  ouvrirModale(`<h3 id="modaleTitre"><span>↻</span>Recommencer une simulation</h3>
    <p class="sous">Cette simulation est gardée dans « Comparer mes choix ». Vous repartirez avec ${nb(DEPART)} NaoCoins virtuels et une nouvelle répartition.</p>
    <div class="champ"><label for="nomSim">Un nom pour vous en souvenir <small>(facultatif)</small></label><input id="nomSim" maxlength="60" placeholder="Ex. : « Très répartie » ou « Tout sur l’action »"></div>
    <div class="pied-fen"><div class="droite"><button class="btn fin" type="button" data-f="annuler">Annuler</button><button class="btn" type="button" data-f="ok">Garder et recommencer</button></div></div>`, f => {
    $('[data-f="ok"]', f).addEventListener('click', () => {
      if (sim.etapes.length) {
        const st = statsSim(sim);
        S.simArchives.push({ id: sim.id, nom: $('#nomSim', f).value.trim() || `Simulation n° ${S.simArchives.length + 1}`, date: auj(), rep: sim.rep, etapes: sim.etapes.length, scenarios: sim.scenarios, fin: st.fin, pire: st.pire });
      }
      const rep = sim.rep; S.sim = nouvelleSim(); S.sim.rep = null; sauver(); fermerModale(); rendre(); remplirRepartition(rep); scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   Actualités, objectif, prénom, défi, checklist
   ============================================================ */
ACT['actu-ajouter'] = () => {
  ouvrirModale(`<h3 id="modaleTitre"><span>📰</span>Ajouter une actualité lue</h3>
    <p class="sous">Résumez avec vos mots un article que vous avez lu. Une actualité sans source fiable sera marquée « non vérifiée ».</p>
    <form id="actuForm" autocomplete="off">
      <div class="champ"><label for="aTitre">Titre</label><input id="aTitre" required maxlength="140"></div>
      <div class="champs">
        <div class="champ"><label for="aDate">Date de l’information</label><input id="aDate" type="date" required value="${auj()}"></div>
        <div class="champ"><label for="aCat">Catégorie</label><select id="aCat">${CATEGORIES_ACTU.map(c => `<option value="${c.id}">${c.e} ${esc(c.nom)}</option>`).join('')}</select></div>
      </div>
      <div class="champs">
        <div class="champ"><label for="aSource">Source (nom)</label><input id="aSource" required maxlength="100" placeholder="Ex. : Insee, Banque de France, AMF, un quotidien…"></div>
        <div class="champ"><label for="aUrl">Adresse <small>(facultatif)</small></label><input id="aUrl" type="url" maxlength="300" placeholder="https://…"></div>
      </div>
      <div class="champ"><span class="lab">Type de source</span><div class="choix">
        <label><input type="radio" name="aType" value="officielle" checked> Institution, régulateur, statistique publique</label>
        <label><input type="radio" name="aType" value="media"> Média d’information identifié</label>
        <label><input type="radio" name="aType" value="social"> Réseau social, influenceur, forum</label>
        <label><input type="radio" name="aType" value="inconnue"> Je ne sais pas</label></div></div>
      <div class="champ"><label for="aResume">Résumé simple</label><textarea id="aResume" required maxlength="700"></textarea></div>
      <div class="champs">
        <div class="champ"><label for="aMot">Un mot difficile <small>(facultatif)</small></label><input id="aMot" maxlength="60"></div>
        <div class="champ"><label for="aDef">Son explication</label><input id="aDef" maxlength="240"></div>
      </div>
      <div class="champ"><label for="aPourquoi">Pourquoi cette actualité peut compter ? <small>(sans conseil d’achat ou de vente)</small></label><textarea id="aPourquoi" maxlength="500"></textarea></div>
      <div class="pied-fen"><div class="droite"><button class="btn fin" type="button" data-f="annuler">Annuler</button><button class="btn" type="submit">Ajouter</button></div></div>
    </form>`, f => {
    $('#actuForm', f).addEventListener('submit', e => {
      e.preventDefault();
      const type = $('[name="aType"]:checked', f).value, url = $('#aUrl', f).value.trim();
      const a = { id: 'p-' + uid(), cat: $('#aCat', f).value, date: $('#aDate', f).value, titre: $('#aTitre', f).value.trim(), source: $('#aSource', f).value.trim(),
        url: /^https?:\/\//i.test(url) ? url : '', resume: $('#aResume', f).value.trim(), pourquoi: $('#aPourquoi', f).value.trim(),
        mots: $('#aMot', f).value.trim() ? [[$('#aMot', f).value.trim(), $('#aDef', f).value.trim() || '—']] : [], type, fiable: type === 'officielle' || type === 'media', nao: false };
      S.actusPerso.push(a); sauver(); fermerModale(); U.vueActu = 'toutes'; U.cat = ''; rendre();
      toast(a.fiable ? '📰 Actualité ajoutée.' : '⚠️ Ajoutée comme « non vérifiée » : elle n’apparaîtra pas dans « L’actualité en 2 minutes ».', { duree: 5000 });
    });
  }, true);
};
ACT.objectif = (premier) => {
  ouvrirModale(`<h3 id="modaleTitre"><span>🎯</span>${premier === true ? 'Par où commencer ?' : 'Mon objectif d’apprentissage'}</h3>
    <p class="sous">Choisissez le parcours qui vous ressemble aujourd’hui. Vous pourrez en changer à tout moment.</p>
    <div class="choix-parcours">${PARCOURS.map(p => { const pp = progressionParcours(p); return `<label class="${S.objectif.parcours === p.id ? 'actif' : ''}"><input type="radio" name="oParcours" value="${p.id}" ${S.objectif.parcours === p.id || (!S.objectif.parcours && p.id === 'debute') ? 'checked' : ''}>
      <span class="e">${p.e}</span><span><b>${esc(p.nom)}</b><small>${esc(p.desc)} · ${pp.n}/${pp.total}</small></span></label>`; }).join('')}</div>
    <div class="champ" style="margin-top:14px"><label for="oRythme">Mon rythme : <b id="oRythmeLib">${S.objectif.rythme}</b> leçon(s) par semaine</label>
      <input type="range" id="oRythme" min="1" max="7" value="${S.objectif.rythme}"></div>
    <div class="pied-fen"><div class="droite"><button class="btn fin" type="button" data-f="annuler">Plus tard</button><button class="btn" type="button" data-f="ok">${premier === true ? 'C’est parti ✦' : 'Enregistrer'}</button></div></div>`, f => {
    $('#oRythme', f).addEventListener('input', e => { $('#oRythmeLib', f).textContent = e.target.value; });
    $('[data-f="ok"]', f).addEventListener('click', () => {
      S.objectif = { parcours: $('[name="oParcours"]:checked', f).value, rythme: +$('#oRythme', f).value }; sauver(); fermerModale();
      if (premier === true) ouvrirLecon(leconDuJour().l.id); else rendre();
      toast('🎯 Objectif enregistré.');
    });
  }, true);
};
ACT.prenom = () => {
  ouvrirModale(`<h3 id="modaleTitre"><span>✍️</span>Mon prénom</h3>
    <p class="sous">Il sert à vous saluer et à personnaliser vos attestations. Il reste dans ce navigateur (ou votre profil NaoGroup).</p>
    <form id="prenomForm"><div class="champ"><label for="prenomIn">Prénom</label><input id="prenomIn" maxlength="40" value="${esc(S.prenom)}"></div>
    <div class="pied-fen"><div class="droite"><button class="btn fin" type="button" data-f="annuler">Annuler</button><button class="btn" type="submit">Enregistrer</button></div></div></form>`, f => {
    $('#prenomForm', f).addEventListener('submit', e => { e.preventDefault(); S.prenom = $('#prenomIn', f).value.trim(); sauver(); fermerModale(); rendre(); });
  });
};
ACT.defi = () => {
  const s = semaineISO();
  if (S.defis[s]) delete S.defis[s]; else { S.defis[s] = true; celebrer('Défi relevé !'); }
  const nouveaux = verifierBadges(); sauver(); rendre();
  nouveaux.forEach(b => toast(`🏅 Nouveau badge : « ${b.nom} »`));
};
ACT['checklist-vider'] = () => { S.checklist = {}; sauver(); rendre(); };

/* ============================================================
   Réinitialiser NaoInvest
   ============================================================ */
ACT.reinitialiser = () => {
  const n = Object.keys(S.lecons).length;
  ouvrirModale(`<h3 id="modaleTitre"><span>♻️</span>Réinitialiser NaoInvest ?</h3>
    <p class="sous">Tout ce que vous avez fait dans NaoInvest est <b>effacé définitivement</b> : notes des quiz, progression, badges, attestations, objectif, défis,
      checklist, favoris, actualités ajoutées, simulations et journal, prénom et réglages. L’outil repart vierge, comme pour une nouvelle personne.${n ? '' : ' (Il est déjà presque vide.)'}</p>
    <p class="sous">Les autres outils NaoGroup ne sont pas touchés.</p>
    <div class="champ"><label for="saisieEffacer">Pour confirmer, tapez <b style="color:var(--alerte);letter-spacing:.08em">EFFACER</b></label>
      <input id="saisieEffacer" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER" style="text-align:center;letter-spacing:.12em;font-weight:700"></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn danger" data-f="effacer" disabled style="opacity:.5">🗑 Tout effacer</button></div></div>`, f => {
    const s = $('#saisieEffacer', f), b = $('[data-f="effacer"]', f);
    s.addEventListener('input', () => { const ok = s.value.trim().toUpperCase() === 'EFFACER'; b.disabled = !ok; b.style.opacity = ok ? 1 : .5; });
    s.addEventListener('keydown', e => { if (e.key === 'Enter' && !b.disabled) b.click(); });
    b.addEventListener('click', () => {
      S = vierge();
      [CLE_THEME, CLE_CALME].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver();
      const r = document.documentElement; r.dataset.theme = 'dark'; r.classList.remove('calme');
      Object.assign(U, { vue: 'accueil', lecon: null, quiz: null, cat: '', vueActu: 'toutes', q: '', lettre: '', mix: null, themeC: '', besoin: '', guideMode: 'fiches', voiture: null, paie: null, lignePaie: null, ligneImp: null, zoneAvis: null, casAvis: null, partsAide: null, partsOuvert: false, temp: null, ageTemp: null });
      history.replaceState(null, '', '#accueil');
      fermerModale(); majBoutons(); rendre(); decor(); scrollTo(0, 0);
      toast('NaoInvest est vierge ✨ Bienvenue !');
    });
  });
};

/* ============================================================
   Thème et animations
   ============================================================ */
function majBoutons() {
  const clair = document.documentElement.dataset.theme === 'light', b = $('#btnTheme');
  b.setAttribute('aria-checked', clair ? 'false' : 'true');
  b.setAttribute('aria-label', clair ? 'Passer en thème sombre' : 'Passer en thème clair');
  b.title = clair ? 'Thème clair — cliquer pour le thème sombre' : 'Thème sombre — cliquer pour le thème clair';
  $('#themeIcone').textContent = clair ? '☀️' : '🌙';
  $('#btnCalme').title = document.documentElement.classList.contains('calme') ? 'Relancer les animations' : 'Mettre les animations en pause';
}
ACT.theme = () => {
  const r = document.documentElement, suivant = r.dataset.theme === 'light' ? 'dark' : 'light';
  const appliquer = () => { r.dataset.theme = suivant; try { localStorage.setItem(CLE_THEME, suivant); } catch (e) {} majBoutons(); decor(); };
  if (document.startViewTransition) document.startViewTransition(appliquer); else appliquer();
};
ACT.calme = () => { const on = document.documentElement.classList.toggle('calme'); try { localStorage.setItem(CLE_CALME, on ? '1' : '0'); } catch (e) {} majBoutons(); };

/* ============================================================
   Le décor : la Bourse, en douceur
   — des chandeliers qui respirent, des courbes qui se tracent puis s'effacent,
   des pièces qui tournent sur elles-mêmes, de petits histogrammes qui poussent,
   des camemberts qui pivotent, des pièces qui montent comme des bulles,
   et le ciel étoilé de la maison. Aucune flèche, rien qui presse.
   ============================================================ */
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const clair = document.documentElement.dataset.theme === 'light';
  const hasard = (a, b) => a + Math.random() * (b - a);
  const place = () => [Math.random() < .5 ? hasard(12, W * .16) : hasard(W * .84, W - 12), hasard(30, H - 30)];  /* sur les bords, pour ne pas gêner la lecture */
  const k = Math.max(.6, Math.min(1.6, W * H / 1100000)), op = clair ? .3 : .24;
  let h = '';
  /* le ciel */
  for (let i = 0; i < Math.round(38 * k); i++) h += `<circle class="etoile" cx="${hasard(0, W).toFixed(0)}" cy="${hasard(0, H).toFixed(0)}" r="${hasard(.6, 1.7).toFixed(1)}" style="animation-duration:${hasard(2.5, 6).toFixed(1)}s;animation-delay:-${hasard(0, 6).toFixed(1)}s;opacity:${clair ? .35 : .5}"/>`;
  /* les chandeliers qui respirent */
  for (let i = 0; i < Math.round(4 * k); i++) {
    const [x, y] = place(), s = hasard(.8, 1.25).toFixed(2);
    let c = '';
    for (let j = 0; j < 5; j++) {
      const hC = hasard(8, 20), plein = Math.random() < .5, dy = hasard(-6, 6);
      c += `<g transform="translate(${j * 9} ${dy.toFixed(1)})"><path d="M0 ${(-hC / 2 - 5).toFixed(1)}V${(hC / 2 + 5).toFixed(1)}" class="meche"/>
        <rect class="corps-c ${plein ? 'plein-c' : ''}" x="-2.8" y="${(-hC / 2).toFixed(1)}" width="5.6" height="${hC.toFixed(1)}" rx="1.2" style="animation-delay:-${hasard(0, 6).toFixed(1)}s;animation-duration:${hasard(4, 7).toFixed(1)}s"/></g>`;
    }
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s})" opacity="${op}"><g class="m" style="animation-duration:${hasard(16, 24).toFixed(1)}s;animation-delay:-${hasard(0, 20).toFixed(1)}s">${c}</g></g>`;
  }
  /* les courbes qui se tracent doucement, puis s'effacent */
  for (let i = 0; i < Math.round(4 * k); i++) {
    const [x, y] = place(), n = 7, pas = hasard(9, 13);
    let yy = 0, d = 'M0 0';
    for (let j = 1; j <= n; j++) { yy += hasard(-9, 6); d += ` L${(j * pas).toFixed(1)} ${yy.toFixed(1)}`; }
    h += `<g transform="translate(${(x - 30).toFixed(0)} ${y.toFixed(0)})" opacity="${op + .04}"><path class="trace" d="${d}" style="--d:${hasard(9, 14).toFixed(1)}s;--r:-${hasard(0, 10).toFixed(1)}s"/>
      <circle class="point-fin" cx="${(n * pas).toFixed(1)}" cy="${yy.toFixed(1)}" r="2.2" style="--d:${hasard(9, 14).toFixed(1)}s"/></g>`;
  }
  /* les pièces qui tournent sur elles-mêmes */
  for (let i = 0; i < Math.round(4 * k); i++) {
    const [x, y] = place(), r = hasard(8, 12);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" opacity="${op}"><g class="m" style="animation-duration:${hasard(18, 26).toFixed(1)}s;animation-delay:-${hasard(0, 20).toFixed(1)}s">
      <g class="piece" style="animation-duration:${hasard(5, 8).toFixed(1)}s;animation-delay:-${hasard(0, 6).toFixed(1)}s"><circle r="${r.toFixed(1)}"/><circle r="${(r * .68).toFixed(1)}"/>
      <path d="M${(-r * .28).toFixed(1)} ${(r * .34).toFixed(1)}V${(-r * .34).toFixed(1)}L${(r * .28).toFixed(1)} ${(r * .34).toFixed(1)}V${(-r * .34).toFixed(1)}"/></g></g></g>`;
  }
  /* les petits histogrammes qui poussent */
  for (let i = 0; i < Math.round(3 * k); i++) {
    const [x, y] = place();
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" opacity="${op}"><path d="M-3 0H38" class="socle"/>${[10, 16, 13, 22].map((b, j) => `<rect class="barre" x="${j * 9}" y="${-b}" width="6" height="${b}" rx="1.4" style="animation-delay:${(j * .35 - hasard(0, 8)).toFixed(2)}s"/>`).join('')}</g>`;
  }
  /* les camemberts qui pivotent lentement */
  for (let i = 0; i < Math.round(3 * k); i++) {
    const [x, y] = place(), r = hasard(10, 14);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" opacity="${op}"><g class="tourne" style="animation-duration:${hasard(40, 70).toFixed(0)}s"><circle r="${r.toFixed(1)}"/>
      <path class="plein" d="M0 0V${(-r).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(r * .95).toFixed(1)} ${(-r * .31).toFixed(1)}Z" opacity=".55"/><path d="M0 0L${(-r * .59).toFixed(1)} ${(r * .81).toFixed(1)}"/></g></g>`;
  }
  /* des petites pièces qui montent comme des bulles */
  h += '<g class="bulles">';
  for (let i = 0; i < Math.round(9 * k); i++) {
    const x = hasard(0, W), s = hasard(2.5, 4.5);
    h += `<g transform="translate(${x.toFixed(0)} ${H + 10})"><g class="bulle" style="animation-duration:${hasard(18, 30).toFixed(1)}s;animation-delay:-${hasard(0, 30).toFixed(1)}s"><circle r="${s.toFixed(1)}" class="bulle-p" opacity="${clair ? .45 : .55}"/><circle r="${(s * .55).toFixed(1)}" class="bulle-i"/></g></g>`;
  }
  svg.innerHTML = h + '</g>';
}
let minuteurDecor = null;
addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

/* ---------- après chaque rendu ---------- */
function apresRendu() {
  if ($('#repForm')) majRepartition();
}

/* ============================================================
   Au démarrage
   ============================================================ */
addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ONGLETS.some(o => o.id === h) && (h !== U.vue || U.lecon || U.mix)) aller(h); });
(function demarrer() {
  const h = location.hash.slice(1); if (ONGLETS.some(o => o.id === h)) U.vue = h;
  verifierBadges(); majBoutons(); rendre(); decor(); entree();
})();

/* ---------- l'entrée dans l'outil : un clic permet de passer ---------- */
function entree() {
  const intro = $('#intro'); if (!intro) return;
  const finir = () => { if (intro.isConnected) intro.remove(); };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { document.body.classList.remove('ouverture'); return finir(); }
  intro.addEventListener('click', () => { intro.style.animation = 'introSort .4s ease forwards'; $('.page').style.animation = 'emerge .6s ease both'; setTimeout(finir, 420); });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4300);
}
