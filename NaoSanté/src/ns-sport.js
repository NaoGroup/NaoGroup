/* ============================================================
   NaoSanté — les séances chronométrées.
   Des séries d'exercices avec un temps d'effort (ou un nombre de
   répétitions), des pauses entre les séries et entre les exercices,
   un lecteur guidé avec bips, et un minuteur de fractionné express.
   Rien de médical : on bouge à son rythme et on s'arrête en cas de gêne.
   ============================================================ */

/* Les séances proposées : [emoji, nom, activité, repos entre exercices, préparation, exercices]
   exercice : [emoji, nom, mode ('temps' | 'reps'), valeur (secondes ou répétitions), séries, repos entre séries (s)] */
const SEANCES_PROPOSEES = [
  ['🌅', 'Réveil musculaire', 'gym', 30, 10, [
    ['🦵', 'Montées de genoux', 'temps', 30, 2, 15], ['🙆', 'Cercles de bras', 'temps', 30, 2, 15],
    ['🏋️', 'Squats', 'reps', 10, 2, 30], ['🚶', 'Fentes alternées', 'reps', 10, 2, 30], ['🧱', 'Gainage', 'temps', 20, 2, 20]]],
  ['💪', 'Renforcement maison', 'muscu', 60, 10, [
    ['💪', 'Pompes (sur les genoux si besoin)', 'reps', 8, 3, 45], ['🏋️', 'Squats', 'reps', 12, 3, 45],
    ['🌉', 'Pont fessier', 'reps', 12, 3, 40], ['🧱', 'Gainage', 'temps', 30, 3, 30], ['🦸', 'Superman', 'temps', 20, 2, 30]]],
  ['🔥', 'Fractionné doux', 'course', 30, 10, [
    ['🚶', 'Échauffement en marchant', 'temps', 180, 1, 0], ['🏃', 'Course légère', 'temps', 60, 6, 60], ['🌿', 'Retour au calme en marchant', 'temps', 180, 1, 0]]],
  ['🧱', 'Gainage express', 'gym', 30, 10, [
    ['🧱', 'Planche', 'temps', 30, 3, 20], ['↖️', 'Gainage latéral gauche', 'temps', 20, 2, 20],
    ['↗️', 'Gainage latéral droit', 'temps', 20, 2, 20], ['🪲', 'Dead bug', 'temps', 30, 2, 20]]],
  ['🚶', 'Marche active', 'marche', 0, 10, [
    ['🚶', 'Marche rapide', 'temps', 120, 5, 60]]]
];
const EMOJIS_SEANCE = ['💪', '🔥', '🌅', '🧱', '🏃', '🚶', '🚴', '🤸', '🧘', '💃', '🏊', '⚡', '🎯', '🌿'];
const EMOJIS_EXO = ['💪', '🏋️', '🦵', '🧱', '🌉', '🦸', '🏃', '🚶', '🙆', '🤸', '🪲', '🚴', '🧘', '⚡', '🌬️', '↖️', '↗️'];

function seanceDepuisModele(m) {
  const [emoji, nom, type, reposExercice, preparation, exos] = m;
  return { id: uid(), emoji, nom, type, reposExercice, preparation,
    exercices: exos.map(([e, n, mode, valeur, series, repos]) => ({ id: uid(), emoji: e, nom: n, mode, valeur, series, repos })) };
}
/* une répétition compte pour environ 3 secondes dans les estimations */
const effortExo = x => x.mode === 'reps' ? nombre(x.valeur) * 3 : nombre(x.valeur);
function dureeSeance(p) {
  const ex = p.exercices || [];
  return nombre(p.preparation) + somme(ex, x => nombre(x.series) * effortExo(x) + Math.max(0, nombre(x.series) - 1) * nombre(x.repos))
    + Math.max(0, ex.length - 1) * nombre(p.reposExercice);
}
const totalSeries = p => somme(p.exercices || [], x => nombre(x.series));
const fmtSec = s => { s = Math.max(0, Math.round(s)); return s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)}` : `${s} s`; };
const fmtChrono = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
const descExo = x => `${nombre(x.series)} × ${x.mode === 'reps' ? nombre(x.valeur) + ' répét.' : fmtSec(x.valeur)}${nombre(x.series) > 1 && nombre(x.repos) ? ` · pause ${fmtSec(x.repos)}` : ''}`;

/* ============================================================
   L'ÉCRAN : la section « séances » de la page Activité
   ============================================================ */
function sectionSport() {
  const mes = S.programmes, proposees = SEANCES_PROPOSEES.filter(m => !mes.some(p => p.nom === m[1]));
  const lundi = lundiDe(auj()), semaine = S.seances.filter(s => s.date >= lundi);
  const f = S.fractionne;
  const carte = (p, i, propose) => `<div class="seance${propose ? ' proposee' : ''}">
      <div class="tete"><span class="emo">${esc(p.emoji)}</span><div style="min-width:0;flex:1"><div class="n">${esc(p.nom)}</div>
        <div class="s">${pluriel(p.exercices.length, 'exercice')} · ${pluriel(totalSeries(p), 'série')} · ≈ ${Math.max(1, Math.round(dureeSeance(p) / 60))} min</div></div>
        ${propose ? '<span class="etiquette ciel">proposée</span>' : `<button class="btn-rond" data-sp="modifier" data-id="${p.id}" title="Modifier la séance">✏️</button>`}</div>
      <div class="exos">${p.exercices.slice(0, 4).map(x => `<span>${esc(x.emoji)} ${esc(x.nom)} <small>${descExo(x)}</small></span>`).join('')}${p.exercices.length > 4 ? `<span class="muet">+ ${p.exercices.length - 4} autres…</span>` : ''}</div>
      <div class="actions"><button class="btn plein petit" data-sp="lancer" ${propose ? `data-modele="${i}"` : `data-id="${p.id}"`}>▶ Lancer</button>
        ${propose ? `<button class="btn fin petit" data-sp="adopter" data-modele="${i}">＋ Garder et adapter</button>` : ''}</div></div>`;
  return `<section class="carte pleine sport">
    <h3><span class="e">⏱️</span> Mes séances chronométrées
      <span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap"><button class="btn petit fin" data-sp="son" title="Bips du minuteur">${S.reglages.son === false ? '🔇 Son coupé' : '🔊 Son activé'}</button>
      <button class="btn petit plein" data-sp="creer">＋ Créer une séance</button></span></h3>
    <p class="chapo">Des séries d’exercices avec leur temps d’effort et leurs pauses : lancez, le minuteur vous guide et note la séance dans votre activité.</p>
    <div class="chiffres" style="margin-bottom:14px">
      <div><b>${semaine.length}</b><small>séance${semaine.length > 1 ? 's' : ''} cette semaine</small></div>
      <div><b>${somme(semaine, s => nombre(s.series))}</b><small>séries réalisées</small></div>
      <div><b>${fmtChrono(somme(semaine, s => nombre(s.effort)))}</b><small>temps d’effort</small></div>
      <div><b>${fmtChrono(somme(semaine, s => nombre(s.duree)))}</b><small>durée totale, pauses comprises</small></div>
    </div>
    <div class="seances">
      ${mes.map(p => carte(p, 0, false)).join('')}
      ${proposees.map(m => carte(seanceDepuisModele(m), SEANCES_PROPOSEES.indexOf(m), true)).join('')}
      <form class="seance fractionne" data-sp-form="fractionne">
        <div class="tete"><span class="emo">⚡</span><div><div class="n">Minuteur fractionné</div><div class="s">Effort / pause, répété autant de fois que vous voulez</div></div></div>
        <div class="reglage-fr">
          <label>Effort<input type="number" name="effort" min="5" step="5" value="${nombre(f.effort)}"><small>sec.</small></label>
          <label>Pause<input type="number" name="pause" min="0" step="5" value="${nombre(f.pause)}"><small>sec.</small></label>
          <label>Tours<input type="number" name="tours" min="1" step="1" value="${nombre(f.tours)}"><small>fois</small></label>
        </div>
        <div class="actions"><button class="btn plein petit" type="submit">▶ Démarrer</button><span class="ui muet" style="font-size:12px">≈ ${fmtChrono(nombre(f.tours) * nombre(f.effort) + Math.max(0, nombre(f.tours) - 1) * nombre(f.pause) + 5)}</span></div>
      </form>
    </div>
    ${S.seances.length ? `<div class="sous-titre" style="margin-top:16px">Mes dernières séances</div>
      <div class="historique">${S.seances.slice(-5).reverse().map(s => `<div class="ligne"><span class="emo">${esc(s.emoji || '⏱️')}</span>
        <div class="corps"><div class="texte"><b>${esc(s.nom)}</b> · ${fmtChrono(s.duree)}</div>
        <div class="meta"><span>${quand(s.date)}</span><span>· ${pluriel(nombre(s.series), 'série')}</span><span>· ${fmtChrono(s.effort)} d’effort</span>${s.complete ? '' : '<span class="etiquette">arrêtée avant la fin</span>'}</div></div></div>`).join('')}</div>` : ''}
    <p class="note-douce">⏱️ Les séances proposées sont des exemples à adapter librement. Échauffez-vous, <b>bougez à votre rythme</b> et arrêtez-vous en cas de douleur ou de malaise.</p>
  </section>`;
}

/* ============================================================
   L'ÉDITEUR DE SÉANCE
   ============================================================ */
function fenSeance(p) {
  const nouvelle = !p;
  const brouillon = JSON.parse(JSON.stringify(p || { id: uid(), emoji: '💪', nom: '', type: 'gym', reposExercice: 30, preparation: 10,
    exercices: [{ id: uid(), emoji: '💪', nom: '', mode: 'temps', valeur: 30, series: 3, repos: 30 }] }));
  const lignes = () => brouillon.exercices.map((x, i) => `<div class="exo-ligne" data-i="${i}">
      <select data-k="emoji" aria-label="Symbole">${EMOJIS_EXO.map(e => `<option${e === x.emoji ? ' selected' : ''}>${e}</option>`).join('')}</select>
      <input data-k="nom" value="${esc(x.nom)}" placeholder="Exercice (ex. : squats)" aria-label="Nom de l’exercice">
      <label><span>Séries</span><input data-k="series" type="number" min="1" step="1" value="${nombre(x.series)}"></label>
      <label><span>Effort</span><select data-k="mode"><option value="temps"${x.mode === 'temps' ? ' selected' : ''}>secondes</option><option value="reps"${x.mode === 'reps' ? ' selected' : ''}>répétitions</option></select></label>
      <label><span>${x.mode === 'reps' ? 'Répét.' : 'Durée (s)'}</span><input data-k="valeur" type="number" min="1" step="${x.mode === 'reps' ? 1 : 5}" value="${nombre(x.valeur)}"></label>
      <label><span>Pause (s)</span><input data-k="repos" type="number" min="0" step="5" value="${nombre(x.repos)}"></label>
      <div class="fl"><button type="button" class="btn-rond" data-e="haut" title="Monter"${i ? '' : ' disabled'}>↑</button><button type="button" class="btn-rond" data-e="bas" title="Descendre"${i < brouillon.exercices.length - 1 ? '' : ' disabled'}>↓</button><button type="button" class="btn-rond" data-e="retirer" title="Retirer">✕</button></div>
    </div>`).join('');
  ouvrirModale(`<form id="formSeance" novalidate>
    <h3 id="modaleTitre">${nouvelle ? '⏱️ Créer une séance' : '✏️ Modifier la séance'}</h3>
    <p class="sous">Chaque exercice : un nombre de séries, un temps d’effort (ou des répétitions) et une pause entre les séries.</p>
    <div class="champs">
      <div class="champ large"><label for="sNom">Nom de la séance</label><input id="sNom" name="nom" value="${esc(brouillon.nom)}" placeholder="Ex. : mon renfo du matin"></div>
      <div class="champ"><label for="sType">Compte comme</label><select id="sType" name="type">${ACTIVITES.map(a => `<option value="${a[0]}"${a[0] === brouillon.type ? ' selected' : ''}>${a[1]} ${a[2]}</option>`).join('')}</select></div>
      <div class="champ"><label for="sEmoji">Symbole</label><select id="sEmoji" name="emoji">${EMOJIS_SEANCE.map(e => `<option${e === brouillon.emoji ? ' selected' : ''}>${e}</option>`).join('')}</select></div>
      <div class="champ"><label for="sPrep">Préparation avant de commencer (s)</label><input id="sPrep" name="preparation" type="number" min="0" step="5" value="${nombre(brouillon.preparation)}"></div>
      <div class="champ"><label for="sRepos">Pause entre deux exercices (s)</label><input id="sRepos" name="reposExercice" type="number" min="0" step="5" value="${nombre(brouillon.reposExercice)}"></div>
    </div>
    <div class="sous-titre" style="margin-top:16px">Les exercices <span class="muet" id="sEstim" style="text-transform:none;letter-spacing:0;font-weight:600"></span></div>
    <div id="sExos"></div>
    <button type="button" class="btn fin petit" data-e="ajouter" style="margin-top:8px">＋ Ajouter un exercice</button>
    <div class="pied-fen">${nouvelle ? '' : '<button type="button" class="btn fin danger" data-e="supprimer">Supprimer</button>'}
      <div class="droite"><button type="button" class="btn fin" data-e="fermer">Annuler</button><button type="submit" class="btn plein">Enregistrer</button></div></div>
  </form>`, fen => {
    const f = fen.querySelector('form'), zone = fen.querySelector('#sExos');
    const lireEntete = () => { ['nom', 'type', 'emoji'].forEach(k => brouillon[k] = f.elements[k].value.trim()); ['preparation', 'reposExercice'].forEach(k => brouillon[k] = Math.max(0, Math.round(nombre(f.elements[k].value)))); };
    const estimer = () => { lireEntete(); fen.querySelector('#sEstim').textContent = `· ${pluriel(totalSeries(brouillon), 'série')} · ≈ ${Math.max(1, Math.round(dureeSeance(brouillon) / 60))} min`; };
    const dessiner = () => { zone.innerHTML = lignes(); estimer(); };
    dessiner();
    f.addEventListener('input', e => {
      const l = e.target.closest('.exo-ligne');
      if (l) { const x = brouillon.exercices[l.dataset.i], k = e.target.dataset.k; x[k] = ['series', 'valeur', 'repos'].includes(k) ? Math.max(k === 'repos' ? 0 : 1, Math.round(nombre(e.target.value))) : e.target.value; }
      estimer();
    });
    f.addEventListener('change', e => { if (e.target.dataset.k === 'mode') { const x = brouillon.exercices[e.target.closest('.exo-ligne').dataset.i]; x.mode = e.target.value; x.valeur = x.mode === 'reps' ? 10 : 30; dessiner(); } });
    f.addEventListener('click', e => {
      const b = e.target.closest('[data-e]'); if (!b) return;
      const l = b.closest('.exo-ligne'), i = l ? Number(l.dataset.i) : -1, ex = brouillon.exercices;
      if (b.dataset.e === 'ajouter') { const der = ex[ex.length - 1]; ex.push({ id: uid(), emoji: '💪', nom: '', mode: 'temps', valeur: 30, series: der ? der.series : 3, repos: der ? der.repos : 30 }); dessiner(); zone.querySelector('.exo-ligne:last-child input[data-k=nom]').focus(); }
      if (b.dataset.e === 'retirer') { ex.splice(i, 1); dessiner(); }
      if (b.dataset.e === 'haut' && i > 0) { [ex[i - 1], ex[i]] = [ex[i], ex[i - 1]]; dessiner(); }
      if (b.dataset.e === 'bas' && i < ex.length - 1) { [ex[i + 1], ex[i]] = [ex[i], ex[i + 1]]; dessiner(); }
      if (b.dataset.e === 'fermer') fermerModale();
      if (b.dataset.e === 'supprimer') { instantane(); retirer(S.programmes, p.id); fermerModale(); maj(); toast('Séance supprimée.', { annuler: true }); }
    });
    f.addEventListener('submit', e => {
      e.preventDefault(); lireEntete();
      brouillon.exercices = brouillon.exercices.filter(x => x.nom.trim());
      if (!brouillon.nom) { toast('Donnez un nom à votre séance.', { alerte: true }); f.elements.nom.focus(); return; }
      if (!brouillon.exercices.length) { toast('Ajoutez au moins un exercice avec un nom.', { alerte: true }); dessiner(); return; }
      if (nouvelle) S.programmes.push(brouillon); else Object.assign(p, brouillon);
      fermerModale(); maj(); toast(`⏱️ Séance « ${brouillon.nom} » enregistrée.`);
    });
  }, true);
}

/* ============================================================
   LE SON : de petits bips, sans aucun fichier
   ============================================================ */
let audio = null;
function bip(freq = 880, duree = .12, volume = .18) {
  if (S.reglages.son === false) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + duree + .02);
  } catch (e) {}
}
const vibrer = m => { try { if (navigator.vibrate) navigator.vibrate(m); } catch (e) {} };

/* ============================================================
   LE LECTEUR : préparation → effort → pause → … → bravo
   ============================================================ */
function etapesDe(p) {
  const et = [], ex = p.exercices;
  if (nombre(p.preparation)) et.push({ phase: 'pret', duree: nombre(p.preparation), x: ex[0], serie: 1 });
  ex.forEach((x, i) => {
    const n = Math.max(1, nombre(x.series));
    for (let s = 1; s <= n; s++) {
      et.push({ phase: 'effort', duree: x.mode === 'reps' ? 0 : nombre(x.valeur), x, i, serie: s, n });
      if (s < n && nombre(x.repos)) et.push({ phase: 'repos', duree: nombre(x.repos), x, i, serie: s + 1, n });
    }
    if (i < ex.length - 1 && nombre(p.reposExercice)) et.push({ phase: 'transition', duree: nombre(p.reposExercice), x: ex[i + 1], i: i + 1, serie: 1, n: Math.max(1, nombre(ex[i + 1].series)) });
  });
  return et;
}
let lecteur = null;
function lancerSeance(p) {
  if (!p || !p.exercices.length) return;
  const etapes = etapesDe(p), C = 2 * Math.PI * 52;
  const L = lecteur = { p, etapes, k: 0, reste: etapes[0].duree, ecoule: 0, total: 0, effort: 0, series: 0, pause: false, minuteur: null, verrou: null };
  const LIB = { pret: 'Préparez-vous', effort: 'Effort', repos: 'Pause', transition: 'Pause — exercice suivant' };
  const suivante = () => etapes.slice(L.k + 1).find(e => e.phase === 'effort');
  const dessiner = () => {
    const e = etapes[L.k], reps = e.phase === 'effort' && !e.duree, nx = suivante();
    const pct = reps ? 1 : e.duree ? L.reste / e.duree : 0;
    const fini = etapes.filter((x, j) => j < L.k && x.phase === 'effort').length, tot = etapes.filter(x => x.phase === 'effort').length;
    $('#modaleFen').innerHTML = `<div class="lecteur phase-${e.phase}${L.pause ? ' en-pause' : ''}">
      <div class="haut-l"><span class="emo">${esc(p.emoji)}</span><div style="flex:1;min-width:0"><b id="modaleTitre">${esc(p.nom)}</b>
        <div class="ui muet" style="font-size:12px">Série ${fini + (e.phase === 'effort' ? 1 : 0)} / ${tot} · écoulé <span data-l="total">${fmtChrono(L.total)}</span></div></div>
        <button class="btn-rond" data-l="son" title="Son">${S.reglages.son === false ? '🔇' : '🔊'}</button></div>
      <div class="progres-l"><i style="width:${(fini / tot * 100).toFixed(1)}%"></i></div>
      <div class="phase-l">${LIB[e.phase]}</div>
      <div class="cadran"><svg viewBox="0 0 120 120"><circle class="fondc" cx="60" cy="60" r="52"/>
          <circle class="valc" cx="60" cy="60" r="52" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/></svg>
        <div class="lab">${reps ? `<b>${nombre(e.x.valeur)}</b><span>répétitions</span><small data-l="ecoule">${fmtChrono(L.ecoule)}</small>` : `<b data-l="reste">${fmtChrono(L.reste)}</b><span>${e.phase === 'effort' ? 'on tient bon' : e.phase === 'pret' ? 'on se met en place' : 'on respire'}</span>`}</div></div>
      <div class="exo-l"><span class="e">${esc(e.x.emoji)}</span>${esc(e.x.nom)}</div>
      <div class="ui muet serie-l">${e.phase === 'pret' ? `Premier exercice · ${descExo(e.x)}` : `Série ${e.serie} sur ${e.n}${e.phase === 'effort' ? '' : ' à venir'}`}</div>
      ${nx && e.phase === 'effort' ? `<div class="ensuite">Ensuite : ${nx.x === e.x ? `pause ${fmtSec(e.x.repos)}, puis série ${nx.serie}` : `${esc(nx.x.emoji)} ${esc(nx.x.nom)}`}</div>` : ''}
      <div class="commandes">
        <button class="btn fin" data-l="stop">■ Arrêter</button>
        ${e.phase !== 'effort' ? '<button class="btn fin" data-l="plus">+15 s</button>' : ''}
        ${reps ? '<button class="btn plein grand-btn" data-l="suivant">✓ Série terminée</button>'
               : `<button class="btn ${L.pause ? 'plein' : 'lavande'}" data-l="pause">${L.pause ? '▶ Reprendre' : '⏸ Pause'}</button><button class="btn fin" data-l="suivant">Passer ⏭</button>`}
      </div></div>`;
  };
  const entrer = () => {
    const e = etapes[L.k];
    L.reste = e.duree; L.ecoule = 0;
    if (e.phase === 'effort') { bip(1046, .25, .22); vibrer(200); } else { bip(660, .2); vibrer([80, 60, 80]); }
    dessiner();
  };
  const avancer = () => {
    const e = etapes[L.k];
    if (e.phase === 'effort') { L.series++; L.effort += e.duree || L.ecoule; }
    L.k++;
    if (L.k >= etapes.length) return terminer(true);
    entrer();
  };
  const terminer = complete => {
    clearInterval(L.minuteur); L.minuteur = null;
    try { if (L.verrou) L.verrou.release(); } catch (e) {}
    if (complete) { bip(784, .15); setTimeout(() => bip(988, .15), 170); setTimeout(() => bip(1318, .35), 340); vibrer([120, 80, 120, 80, 240]); }
    const assez = L.effort >= 30 || L.series >= 1;
    $('#modaleFen').innerHTML = `<div class="cadenas"><span class="e">${complete ? '🏅' : '🌿'}</span>
      <h3 id="modaleTitre" style="justify-content:center">${complete ? 'Séance terminée, bravo !' : 'Séance arrêtée'}</h3>
      <div class="chiffres" style="width:100%;max-width:440px">
        <div><b>${fmtChrono(L.total)}</b><small>durée totale</small></div><div><b>${L.series}</b><small>série${L.series > 1 ? 's' : ''}</small></div><div><b>${fmtChrono(L.effort)}</b><small>d’effort</small></div></div>
      <p class="ui muet" style="margin:0;font-size:13px">${complete ? 'Prenez le temps de boire un verre d’eau et de vous étirer doucement.' : assez ? 'Chaque série compte. Voulez-vous garder ce qui a été fait ?' : 'Pas de souci : on recommencera quand vous voudrez.'}</p>
      <div class="actions" style="justify-content:center">${assez ? `<button class="btn plein" data-l="noter">✓ ${complete ? 'Noter dans mon activité' : 'Garder ce qui a été fait'}</button>` : ''}<button class="btn fin" data-l="fermer">Fermer</button></div></div>`;
    L.fin = complete;
    if (complete) noter();
  };
  const noter = () => {
    if (L.note) return; L.note = true;
    const min = Math.max(1, Math.round(L.total / 60));
    S.activites.push({ id: uid(), date: auj(), type: p.type || 'gym', duree: min, intensite: 'moderee', note: `Séance « ${p.nom} » · ${pluriel(L.series, 'série')}` });
    S.seances.push({ id: uid(), date: auj(), nom: p.nom, emoji: p.emoji, duree: Math.round(L.total), effort: Math.round(L.effort), series: L.series, complete: !!L.fin });
    sauver();
    const b = $('#modaleFen [data-l="noter"]'); if (b) { b.disabled = true; b.textContent = `✓ ${min} min ajoutées à votre activité`; }
  };
  ouvrirModale('', fen => {
    fen.classList.add('large');
    entrer();
    fen.onclick = ev => {
      const b = ev.target.closest('[data-l]'); if (!b) return;
      const a = b.dataset.l;
      if (a === 'pause') { L.pause = !L.pause; dessiner(); }
      if (a === 'suivant') avancer();
      if (a === 'plus') { L.reste += 15; etapes[L.k].duree += 15; dessiner(); }
      if (a === 'son') { S.reglages.son = S.reglages.son === false; sauver(); dessiner(); if (S.reglages.son) bip(); }
      if (a === 'stop') { if (L.minuteur) terminer(false); else fermerModale(); }
      if (a === 'noter') noter();
      if (a === 'fermer') fermerModale();
    };
  });
  fermetureModale = () => { clearInterval(L.minuteur); try { if (L.verrou) L.verrou.release(); } catch (e) {} $('#modaleFen').onclick = null; lecteur = null; rendre(); };
  /* garder l'écran allumé pendant la séance, si le navigateur le permet */
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(v => { L.verrou = v; }).catch(() => {}); } catch (e) {}
  L.minuteur = setInterval(() => {
    if (L.pause || !$('#modale').classList.contains('ouvert')) return;
    const e = etapes[L.k];
    L.total++;
    const t = $('#modaleFen [data-l="total"]'); if (t) t.textContent = fmtChrono(L.total);
    if (e.phase === 'effort' && !e.duree) { L.ecoule++; const z = $('#modaleFen [data-l="ecoule"]'); if (z) z.textContent = fmtChrono(L.ecoule); return; }
    L.reste--;
    if (L.reste <= 0) return avancer();
    if (L.reste <= 3) bip(L.reste === 1 ? 740 : 620, .09, .15);
    const r = $('#modaleFen [data-l="reste"]'), c = $('#modaleFen .cadran .valc');
    if (r) r.textContent = fmtChrono(L.reste);
    if (c) c.setAttribute('stroke-dashoffset', (C * (1 - L.reste / e.duree)).toFixed(1));
  }, 1000);
}

/* ============================================================
   LES CLICS DE LA SECTION
   ============================================================ */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-sp]'); if (!b || b.disabled) return;
  const a = b.dataset.sp;
  const prog = () => b.dataset.id ? trouver(S.programmes, b.dataset.id) : seanceDepuisModele(SEANCES_PROPOSEES[Number(b.dataset.modele)]);
  if (a === 'lancer') { bip(0, .001, 0); lancerSeance(prog()); }
  if (a === 'modifier') fenSeance(trouver(S.programmes, b.dataset.id));
  if (a === 'creer') fenSeance();
  if (a === 'adopter') { const p = prog(); S.programmes.push(p); maj(); fenSeance(p); }
  if (a === 'son') { S.reglages.son = S.reglages.son === false; maj(); if (S.reglages.son) bip(); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-sp-form="fractionne"]'); if (!f) return;
  e.preventDefault();
  const effort = Math.max(5, Math.round(nombre(f.effort.value))), pause = Math.max(0, Math.round(nombre(f.pause.value))), tours = Math.max(1, Math.round(nombre(f.tours.value)));
  S.fractionne = { effort, pause, tours }; sauver();
  lancerSeance({ id: 'fractionne', emoji: '⚡', nom: `Fractionné ${fmtSec(effort)} / ${fmtSec(pause)}`, type: 'gym', reposExercice: 0, preparation: 5,
    exercices: [{ id: 'fr', emoji: '⚡', nom: 'Effort', mode: 'temps', valeur: effort, series: tours, repos: pause }] });
});
