/* ============================================================
   NaoSanté — les actions, les fenêtres, la sauvegarde et le décor.
   ============================================================ */
function allerA(v) { U.vue = v; U.decalage = 0; if (location.hash.slice(1) !== v) history.replaceState(null, '', '#' + v); rendre(); scrollTo({ top: 0, behavior: 'smooth' }); }
const optionsDe = t => t.map(x => [x[0], x[1] + ' ' + x[2]]);

/* ---------- hydratation ---------- */
function boire(e) {
  S.eau[auj()] = verres() + 1; maj();
  if (e) eclat(e.clientX, e.clientY, ['💧', '·', '✧', '💧']);
  if (verres() === R().objectifVerres) toast('🎉 Objectif d’hydratation atteint pour aujourd’hui. Bravo !');
  else toast(`💧 ${verres()} / ${R().objectifVerres} verres — un de plus, en douceur.`);
}

/* ---------- les fenêtres ---------- */
function fenHabitude(h) {
  const nouvelle = !h;
  formulaire({
    titre: nouvelle ? '✅ Ajouter une habitude' : '✏️ Modifier l’habitude',
    sous: 'Une habitude quotidienne, simple et atteignable.',
    valeurs: h || { emoji: '💧' },
    champs: [
      { k: 'nom', l: 'Mon habitude', ph: 'Ex. : boire un verre d’eau au réveil', large: true },
      { k: 'emoji', l: 'Son symbole', t: 'emoji', o: EMOJIS_HABITUDE },
      ...(nouvelle ? [] : [{ k: 'archive', l: 'Mettre en pause (elle ne compte plus dans la journée, ses séries sont gardées)', t: 'case' }])
    ],
    supprimer: nouvelle ? null : () => { instantane(); retirer(S.habitudes, h.id); maj(); toast('Habitude supprimée.', { annuler: true }); },
    enregistrer: r => {
      if (!r.nom) { toast('Donnez un nom à votre habitude.', { alerte: true }); return false; }
      if (nouvelle) S.habitudes.push({ id: uid(), nom: r.nom, emoji: r.emoji, cree: auj() });
      else Object.assign(h, r);
      maj(); toast(nouvelle ? '✅ Nouvelle habitude ajoutée. À vous de jouer !' : 'Habitude mise à jour.');
    }
  });
}
function fenRdv(r, type) {
  const nouveau = !r;
  formulaire({
    titre: nouveau ? '📅 Ajouter un rendez-vous' : '✏️ Modifier le rendez-vous',
    sous: 'Médical, dentaire, optique ou de suivi.',
    valeurs: r || { type: type || 'medical', date: ajouteJours(auj(), 7) },
    champs: [
      { k: 'type', l: 'Type', t: 'select', o: optionsDe(TYPES_RDV) },
      { k: 'titre', l: 'Intitulé', ph: 'Ex. : contrôle annuel' },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'heure', l: 'Heure', t: 'time' },
      { k: 'avec', l: 'Avec', ph: 'Dr Martin, cabinet…' },
      { k: 'lieu', l: 'Lieu', ph: 'Adresse, ville…' },
      { k: 'note', l: 'Note', t: 'textarea', ph: 'Documents à apporter, questions à poser…' }
    ],
    supprimer: nouveau ? null : () => { instantane(); retirer(S.rdv, r.id); maj(); toast('Rendez-vous supprimé.', { annuler: true }); },
    enregistrer: v => {
      if (!v.date) { toast('Indiquez la date du rendez-vous.', { alerte: true }); return false; }
      if (nouveau) S.rdv.push(Object.assign({ id: uid() }, v)); else Object.assign(r, v);
      maj(); toast(`📅 Rendez-vous noté ${quand(v.date)}.`);
    }
  });
}
function fenRappel(r, type) {
  const nouveau = !r;
  formulaire({
    titre: nouveau ? '🔔 Ajouter un rappel' : '✏️ Modifier le rappel',
    sous: 'Renouveler une ordonnance, prendre rendez-vous, effectuer un contrôle…',
    valeurs: r || { type: type || 'ordonnance', date: ajouteJours(auj(), 14), texte: type ? typeRappel(type)[2] : '' },
    champs: [
      { k: 'type', l: 'Type', t: 'select', o: optionsDe(TYPES_RAPPEL) },
      { k: 'date', l: 'À faire avant le', t: 'date' },
      { k: 'texte', l: 'Mon rappel', ph: 'Ex. : renouveler l’ordonnance chez le médecin traitant', large: true }
    ],
    supprimer: nouveau ? null : () => { instantane(); retirer(S.rappels, r.id); maj(); toast('Rappel supprimé.', { annuler: true }); },
    enregistrer: v => {
      if (!v.texte) v.texte = typeRappel(v.type)[2];
      if (nouveau) S.rappels.push(Object.assign({ id: uid(), fait: false }, v)); else Object.assign(r, v);
      maj(); toast('🔔 Rappel enregistré.');
    }
  });
}
function fenActivite(a, type) {
  const nouvelle = !a;
  formulaire({
    titre: nouvelle ? `${activite(type || 'marche')[1]} Ajouter une activité` : '✏️ Modifier l’activité',
    sous: 'Chaque minute compte, à votre rythme.',
    valeurs: a || { type: type || 'marche', date: auj(), duree: type === 'etirements' ? 10 : 30, intensite: 'douce' },
    champs: [
      { k: 'type', l: 'Activité', t: 'select', o: optionsDe(ACTIVITES) },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'duree', l: 'Durée (minutes)', t: 'number', pas: 1 },
      { k: 'intensite', l: 'Intensité ressentie', t: 'select', o: INTENSITES },
      { k: 'note', l: 'Note', ph: 'Au parc, avec une amie…', large: true }
    ],
    supprimer: nouvelle ? null : () => { instantane(); retirer(S.activites, a.id); maj(); toast('Activité supprimée.', { annuler: true }); },
    enregistrer: v => {
      if (!v.duree) { toast('Indiquez une durée en minutes.', { alerte: true }); return false; }
      if (nouvelle) S.activites.push(Object.assign({ id: uid() }, v)); else Object.assign(a, v);
      maj(); toast(`${activite(v.type)[1]} ${v.duree} min ajoutées. Bien joué !`);
    }
  });
}
function fenNuit(n) {
  const nouvelle = !n;
  formulaire({
    titre: nouvelle ? '🌙 Noter ma nuit' : '✏️ Modifier la nuit',
    sous: 'La nuit est rangée au jour du réveil.',
    valeurs: n || { date: auj(), coucher: R().coucherCible || '23:00', lever: '07:00', qualite: '' },
    champs: [
      { k: 'date', l: 'Jour du réveil', t: 'date', large: true },
      { k: 'coucher', l: 'Heure de coucher', t: 'time' },
      { k: 'lever', l: 'Heure de réveil', t: 'time' },
      { k: 'qualite', l: 'Mon ressenti au réveil', t: 'select', o: [['', '— Je ne sais pas —'], ...QUALITES] },
      { k: 'note', l: 'Note', ph: 'Réveillé·e une fois, rêve étrange…' }
    ],
    supprimer: nouvelle ? null : () => { instantane(); retirer(S.sommeil, n.id); maj(); toast('Nuit supprimée.', { annuler: true }); },
    enregistrer: v => {
      if (!v.date || !v.coucher || !v.lever) { toast('Indiquez le jour, l’heure de coucher et celle de réveil.', { alerte: true }); return false; }
      v.qualite = Number(v.qualite) || 0;
      const dejaLa = nuitDu(v.date);
      if (nouvelle && dejaLa) Object.assign(dejaLa, v);
      else if (nouvelle) S.sommeil.push(Object.assign({ id: uid() }, v));
      else Object.assign(n, v);
      maj(); toast(`🌙 ${duree(dureeNuit(v))} de sommeil notées.`);
    }
  });
}
function fenObjectif(o, type) {
  const nouveau = !o, t = typeObjectif(o ? o.type : type || 'bouger');
  formulaire({
    titre: nouveau ? '🎯 Nouvel objectif' : '✏️ Modifier l’objectif',
    sous: 'Choisissez une cible douce : on peut toujours l’ajuster ensuite.',
    valeurs: o || { type: t[0], titre: t[2], cible: t[4] || '', debut: auj() },
    champs: [
      { k: 'type', l: 'Type d’objectif', t: 'select', o: TYPES_OBJECTIF.map(x => [x[0], x[1] + ' ' + x[2]]) },
      { k: 'titre', l: 'Intitulé', ph: 'Ex. : mieux dormir' },
      { k: 'cible', l: 'Cible', t: 'number', aide: 'Sommeil : heures par nuit · Souplesse : séances par semaine · Bouger : minutes par semaine · Eau : verres par jour · Personnel : inutile' },
      { k: 'fin', l: 'Jusqu’au (facultatif)', t: 'date' },
      ...(nouveau ? [] : [{ k: 'archive', l: 'Archiver cet objectif', t: 'case' }])
    ],
    apres: fen => {
      const s = fen.querySelector('[name=type]'), ti = fen.querySelector('[name=titre]'), c = fen.querySelector('[name=cible]');
      s.addEventListener('change', () => { const x = typeObjectif(s.value); if (!ti.value || TYPES_OBJECTIF.some(y => y[2] === ti.value)) ti.value = x[2]; c.value = x[4] || ''; });
    },
    supprimer: nouveau ? null : () => { instantane(); retirer(S.objectifs, o.id); maj(); toast('Objectif supprimé.', { annuler: true }); },
    enregistrer: v => {
      if (!v.titre) v.titre = typeObjectif(v.type)[2];
      if (nouveau) { S.objectifs.push(Object.assign({ id: uid(), pas: [], vedette: !objectifsActifs().length }, v)); }
      else Object.assign(o, v);
      maj(); toast(nouveau ? '🎯 Objectif créé. Un pas après l’autre !' : 'Objectif mis à jour.');
    }
  });
}
function fenReglages() {
  formulaire({
    titre: '⚙️ Mes réglages',
    sous: 'Vos objectifs à vous : il n’y a pas de bonne ou de mauvaise valeur.',
    valeurs: R(),
    champs: [
      { k: 'prenom', l: 'Mon prénom (facultatif)', ph: 'Pour un bonjour personnalisé', large: true },
      { k: 'objectifVerres', l: '💧 Verres d’eau par jour', t: 'number', pas: 1 },
      { k: 'verreMl', l: '🥛 Taille d’un verre (ml)', t: 'number', pas: 10 },
      { k: 'objectifSommeil', l: '🌙 Heures de sommeil visées', t: 'number', pas: .5 },
      { k: 'coucherCible', l: '🛏️ Heure de coucher visée', t: 'time' },
      { k: 'objectifMinutes', l: '🏃 Minutes d’activité par semaine', t: 'number', pas: 5 },
      { k: 'objectifEtirements', l: '🙆 Séances d’étirements par semaine', t: 'number', pas: 1 }
    ],
    enregistrer: v => {
      Object.assign(S.reglages, v, {
        objectifVerres: Math.max(1, Math.round(v.objectifVerres) || 8), verreMl: Math.max(50, v.verreMl || 250),
        objectifSommeil: borne(v.objectifSommeil || 8, 3, 14), objectifMinutes: Math.max(10, Math.round(v.objectifMinutes) || 150),
        objectifEtirements: borne(Math.round(v.objectifEtirements) || 4, 1, 7)
      });
      maj(); toast('Réglages enregistrés.');
    }
  });
}
function fenEtirement(e) {
  const nouveau = !e;
  formulaire({
    titre: nouveau ? '🙆 Ajouter un geste' : '✏️ Modifier le geste',
    valeurs: e || { emoji: '🙆', secondes: 40 },
    champs: [
      { k: 'nom', l: 'Le geste', ph: 'Ex. : étirement des poignets', large: true },
      { k: 'secondes', l: 'Durée (secondes)', t: 'number', pas: 5 },
      { k: 'emoji', l: 'Symbole', t: 'emoji', o: ['🙆', '🤷', '🐈', '🙇', '🦵', '🧘', '🤸', '💪', '🌬️', '🖐️'] },
      { k: 'conseil', l: 'Comment le faire', ph: 'Quelques mots pour vous en souvenir', large: true }
    ],
    supprimer: nouveau ? null : () => { instantane(); retirer(S.etirements.routine, e.id); maj(); toast('Geste retiré.', { annuler: true }); },
    enregistrer: v => {
      if (!v.nom) return false;
      v.secondes = Math.max(5, Math.round(v.secondes) || 30);
      if (nouveau) S.etirements.routine.push(Object.assign({ id: uid() }, v)); else Object.assign(e, v);
      maj();
    }
  });
}
function fenMemo(m) {
  const nouveau = !m;
  formulaire({
    titre: nouveau ? '💊 Ajouter au mémo' : '✏️ Modifier',
    sous: 'Seulement pour ne pas oublier — sans conseil médical. Suivez les indications de votre médecin ou pharmacien.',
    valeurs: m || { categorie: 'vitamine', moments: [] },
    champs: [
      { k: 'nom', l: 'Nom', ph: 'Tel qu’indiqué sur la boîte ou l’ordonnance', large: true },
      { k: 'categorie', l: 'Catégorie', t: 'select', o: optionsDe(CATS_MEMO) },
      { k: 'note', l: 'Note personnelle', ph: 'Ex. : selon l’ordonnance du Dr…' },
      { k: 'moments', l: 'Moments de la journée (pour mémoire)', t: 'html', html: `<div class="cases" style="display:flex;gap:6px;flex-wrap:wrap">${MOMENTS.map(([k, l]) => `<label class="etiquette" style="cursor:pointer;padding:7px 12px;font-size:12.5px"><input type="checkbox" name="moments" value="${k}"${(m && m.moments.includes(k)) ? ' checked' : ''} style="accent-color:#8E7BD4"> ${l}</label>`).join('')}</div>` }
    ],
    supprimer: nouveau ? null : () => { instantane(); retirer(S.memo, m.id); maj(); toast('Retiré du mémo.', { annuler: true }); },
    enregistrer: (v, f) => {
      if (!v.nom) { toast('Indiquez un nom.', { alerte: true }); return false; }
      v.moments = $$('[name=moments]:checked', f).map(x => x.value);
      if (nouveau) S.memo.push(Object.assign({ id: uid(), pris: {} }, v)); else Object.assign(m, v);
      maj();
    }
  });
}
function fenNotes() {
  const n = S.notes;
  formulaire({
    titre: '🔒 Mes notes privées',
    sous: 'Remplissez seulement ce que vous voulez. Tout est facultatif.',
    valeurs: n,
    champs: [
      { k: 'groupe', l: '🩸 Groupe sanguin', t: 'select', o: [['', '— Non renseigné —'], ...['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(x => [x, x])] },
      { k: 'masquer', l: 'Flouter mes notes à l’ouverture', t: 'case' },
      { k: 'allergies', l: '⚠️ Allergies', t: 'textarea', ph: 'Ex. : pénicilline, arachides…' },
      { k: 'traitements', l: '💊 Traitements à ne pas oublier', t: 'textarea', ph: 'Tels qu’indiqués par votre médecin' },
      { k: 'infos', l: '📝 Autres informations', t: 'textarea', ph: 'Médecin traitant, mutuelle, numéro de sécurité sociale…' }
    ],
    enregistrer: v => { Object.assign(n, v); maj(); toast('🔒 Notes enregistrées.'); }
  });
}
function fenContact() {
  formulaire({
    titre: '📞 Contact d’urgence',
    champs: [
      { k: 'nom', l: 'Nom', ph: 'Prénom Nom', large: true },
      { k: 'lien', l: 'Lien', ph: 'Conjoint·e, sœur, voisin…' },
      { k: 'tel', l: 'Téléphone', t: 'tel', ph: '06 …' }
    ],
    enregistrer: v => { if (!v.nom) return false; S.notes.urgence.push(Object.assign({ id: uid() }, v)); maj(); }
  });
}

/* ---------- la routine souplesse, guidée pas à pas ---------- */
let minuteur = null;
function lancerRoutine() {
  const rt = S.etirements.routine; if (!rt.length) return;
  let i = 0, reste = nombre(rt[0].secondes), pause = false;
  const c = 2 * Math.PI * 52;
  const dessiner = () => {
    const e = rt[i], tot = nombre(e.secondes);
    $('#modaleFen').innerHTML = `<h3 id="modaleTitre">🙆 Ma routine souplesse</h3><p class="sous">Geste ${i + 1} sur ${rt.length} · respirez calmement, sans forcer.</p>
      <div class="minuteur"><div class="anneau"><svg viewBox="0 0 120 120" class="anneau"><circle class="fondc" cx="60" cy="60" r="52"/>
        <circle class="valc" cx="60" cy="60" r="52" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (reste / tot)).toFixed(1)}" style="transition:stroke-dashoffset 1s linear"/></svg>
        <div class="lab"><div><b>${reste}</b>secondes</div></div></div>
        <div class="etape">${esc(e.emoji)} ${esc(e.nom)}</div>${e.conseil ? `<div class="conseil">${esc(e.conseil)}</div>` : ''}
        ${rt[i + 1] ? `<div class="conseil">Ensuite : ${esc(rt[i + 1].nom)}</div>` : ''}</div>
      <div class="pied-fen"><button class="btn fin" data-r="stop">Arrêter</button><div class="droite">
        <button class="btn fin" data-r="pause">${pause ? '▶ Reprendre' : '⏸ Pause'}</button><button class="btn lavande" data-r="suivant">Passer ›</button></div></div>`;
  };
  const suivant = () => {
    i++;
    if (i >= rt.length) { finir(true); return; }
    reste = nombre(rt[i].secondes); dessiner();
  };
  const finir = complete => {
    clearInterval(minuteur); minuteur = null;
    if (complete) {
      S.etirements.jours[auj()] = Math.max(S.etirements.jours[auj()] || 0, Math.max(1, Math.round(somme(rt, e => nombre(e.secondes)) / 60)));
      sauver();
      $('#modaleFen').innerHTML = `<div class="cadenas"><span class="e">🌸</span><h3 id="modaleTitre" style="justify-content:center">Routine terminée !</h3>
        <p class="ui muet" style="margin:0">Merci d’avoir pris ce moment pour vous. Elle est notée pour aujourd’hui.</p>
        <button class="btn plein" data-r="stop">Fermer</button></div>`;
    } else fermerModale();
  };
  ouvrirModale('', fen => {
    dessiner();
    fen.onclick = e => {
      const b = e.target.closest('[data-r]'); if (!b) return;
      if (b.dataset.r === 'stop') { if (minuteur) finir(false); else fermerModale(); }
      if (b.dataset.r === 'pause') { pause = !pause; dessiner(); }
      if (b.dataset.r === 'suivant') suivant();
    };
  });
  fermetureModale = () => { clearInterval(minuteur); minuteur = null; $('#modaleFen').onclick = null; rendre(); };
  minuteur = setInterval(() => {
    if (pause) return;
    reste--;
    if (reste <= 0) suivant(); else {
      const lab = $('#modaleFen .minuteur .lab b'), cer = $('#modaleFen .minuteur .valc');
      if (lab) lab.textContent = reste;
      if (cer) cer.setAttribute('stroke-dashoffset', (c * (reste / nombre(rt[i].secondes))).toFixed(1));
    }
  }, 1000);
}

/* ---------- sauvegarde & rechargement ---------- */
function sauvegarder() {
  const blob = new Blob([JSON.stringify({ outil: 'naosante', date: new Date().toISOString(), donnees: S }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `NaoSante-sauvegarde-${auj()}.naosante`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('💾 Sauvegarde téléchargée.');
}
$('#fichierSauvegarde').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try {
      const j = JSON.parse(lecteur.result), d = j.donnees || j;
      if (j.outil && j.outil !== 'naosante') throw new Error('autre outil');
      instantane(); S = normaliser(d); maj(); toast('📂 Sauvegarde rechargée.', { annuler: true });
    } catch (err) { toast('Ce fichier n’est pas une sauvegarde NaoSanté.', { alerte: true }); }
  };
  lecteur.readAsText(f); e.target.value = '';
});

/* ============================================================
   LES CLICS : une seule écoute pour tout l'outil
   ============================================================ */
/* Réinitialiser : NaoSanté redevient vierge, comme au premier jour d'un nouvel utilisateur */
function reinitialiser() {
  ouvrirModale(`<h3 id="modaleTitre">♻️ Réinitialiser NaoSanté ?</h3>
    <p class="sous">Tout ce qui a été saisi dans NaoSanté est <b>effacé définitivement</b> : hydratation, sommeil, activités, routine souplesse,
      habitudes et séries, rendez-vous, rappels, humeur, objectifs, notes privées, mémo et réglages. L'outil repart vierge, comme pour une nouvelle personne.</p>
    <p class="note-douce" style="margin:0 0 14px;display:flex;gap:10px;align-items:center">💾 <span style="flex:1">Conseil : gardez d'abord une sauvegarde, rechargeable plus tard avec 📂.</span>
      <button type="button" class="btn petit" data-f="sauver">Sauvegarder</button></p>
    <div class="champ"><label for="saisieEffacer">Pour confirmer, tapez <b style="color:var(--alerte);letter-spacing:.08em">EFFACER</b></label>
      <input id="saisieEffacer" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER" style="text-align:center;letter-spacing:.12em;font-weight:700"></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn danger" data-f="effacer" disabled style="opacity:.5">🗑 Tout effacer</button></div></div>`, fen => {
    const saisie = fen.querySelector('#saisieEffacer'), bouton = fen.querySelector('[data-f="effacer"]');
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    fen.querySelector('[data-f="sauver"]').addEventListener('click', sauvegarder);
    saisie.addEventListener('input', () => { const ok = saisie.value.trim().toUpperCase() === 'EFFACER'; bouton.disabled = !ok; bouton.style.opacity = ok ? 1 : .5; });
    saisie.addEventListener('keydown', e => { if (e.key === 'Enter' && !bouton.disabled) bouton.click(); });
    bouton.addEventListener('click', () => {
      S = normaliser(null); annulation = null;
      ['naosante.theme', 'naosante.calme', 'naosante.grand'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver();
      const r = document.documentElement; r.dataset.theme = 'dark'; r.classList.remove('calme', 'grand');
      Object.assign(U, { vue: 'aujourdhui', periode: 'semaine', decalage: 0, phrase: 0, devoile: false });
      history.replaceState(null, '', '#aujourdhui');
      fermerModale(); rendre(); scrollTo(0, 0);
      toast('NaoSanté est vierge ✨ Bienvenue !');
    });
  });
}

const ACTIONS = {
  vue: b => allerA(b.dataset.vue),
  theme: () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; ecrire('naosante.theme', t); },
  calme: () => { const on = document.documentElement.classList.toggle('calme'); ecrire('naosante.calme', on ? '1' : '0'); toast(on ? '🕊️ Animations en pause.' : 'Animations relancées.'); },
  grand: () => { const on = document.documentElement.classList.toggle('grand'); ecrire('naosante.grand', on ? '1' : '0'); },
  sauvegarder,
  recharger: () => $('#fichierSauvegarde').click(),
  reinitialiser,
  reglages: fenReglages,
  phrase: () => { U.phrase++; maj(); },

  boire: (b, e) => boire(e),
  'retirer-verre': () => { S.eau[auj()] = Math.max(0, verres() - 1); maj(); },
  verres: (b, e) => { const n = Number(b.dataset.n); const plus = n > verres(); S.eau[auj()] = n; maj(); if (plus) eclat(e.clientX, e.clientY, ['💧', '·', '💧']); },

  energie: (b, e) => { const n = Number(b.dataset.n); S.energie[auj()] = S.energie[auj()] === n ? undefined : n; if (S.energie[auj()] == null) delete S.energie[auj()]; maj(); eclat(e.clientX, e.clientY); },
  humeur: (b, e) => { const n = Number(b.dataset.n), h = S.humeur[auj()] || (S.humeur[auj()] = {}); h.h = h.h === n ? 0 : n; maj(); eclat(e.clientX, e.clientY); },

  'ajouter-habitude': () => fenHabitude(),
  'modifier-habitude': b => fenHabitude(trouver(S.habitudes, b.dataset.id)),
  'habitudes-proposees': () => { HABITUDES_PROPOSEES.forEach(([e, n]) => { if (!S.habitudes.some(h => h.nom === n)) S.habitudes.push({ id: uid(), nom: n, emoji: e, cree: auj() }); }); maj(); toast('✨ Cinq habitudes douces ajoutées. Cochez-les au fil de la journée.'); },
  'habitude-proposee': b => { S.habitudes.push({ id: uid(), nom: b.dataset.n, emoji: b.dataset.e, cree: auj() }); maj(); },
  habitude: (b, e) => {
    const d = auj(), l = S.faits[d] || (S.faits[d] = []), i = l.indexOf(b.dataset.id);
    if (i >= 0) l.splice(i, 1); else { l.push(b.dataset.id); eclat(e.clientX, e.clientY); }
    maj();
    const t = tauxHabitudes(d);
    if (i < 0 && t === 1) toast('🌟 Toutes vos habitudes du jour sont cochées. Quelle belle journée !');
  },
  'basculer-jour': b => {
    const l = S.faits[b.dataset.d] || (S.faits[b.dataset.d] = []), i = l.indexOf(b.dataset.id);
    if (i >= 0) l.splice(i, 1); else l.push(b.dataset.id);
    maj();
  },
  defi: (b, e) => {
    const l = S.defis[auj()] || (S.defis[auj()] = []), i = l.indexOf(b.dataset.k);
    if (i >= 0) l.splice(i, 1); else { l.push(b.dataset.k); eclat(e.clientX, e.clientY, ['🌱', '✦', '♡', '✧']); toast(`🌱 Défi relevé : ${defi(b.dataset.k)[2].toLowerCase()}. Bravo !`); }
    if (b.dataset.k === 'eau' && i < 0) S.eau[auj()] = verres() + 1;
    maj();
  },

  'ajouter-rdv': () => fenRdv(),
  'modifier-rdv': b => fenRdv(trouver(S.rdv, b.dataset.id)),
  'ajouter-rappel': b => fenRappel(null, b.dataset.type),
  'modifier-rappel': b => fenRappel(trouver(S.rappels, b.dataset.id)),
  rappel: (b, e) => { const r = trouver(S.rappels, b.dataset.id); r.fait = !r.fait; if (r.fait) eclat(e.clientX, e.clientY); maj(); },

  'ajouter-activite': b => fenActivite(null, b.dataset.type),
  'modifier-activite': b => fenActivite(trouver(S.activites, b.dataset.id)),
  'noter-nuit': b => fenNuit(b.dataset.id ? trouver(S.sommeil, b.dataset.id) : nuitDu(auj())),
  routine: lancerRoutine,
  'etirements-faits': (b, e) => {
    const d = auj();
    if (S.etirements.jours[d]) delete S.etirements.jours[d];
    else { S.etirements.jours[d] = Math.max(1, Math.round(somme(S.etirements.routine, x => nombre(x.secondes)) / 60)); eclat(e.clientX, e.clientY); }
    maj();
  },
  'modifier-etirement': b => fenEtirement(b.dataset.id ? trouver(S.etirements.routine, b.dataset.id) : null),

  'ajouter-objectif': b => fenObjectif(null, b.dataset.type),
  'modifier-objectif': b => fenObjectif(trouver(S.objectifs, b.dataset.id)),
  vedette: b => { S.objectifs.forEach(o => { o.vedette = o.id === b.dataset.id; }); maj(); toast('⭐ Cet objectif s’affiche maintenant sur l’accueil.'); },
  pas: b => { const o = trouver(S.objectifs, b.dataset.id), p = trouver(o.pas, b.dataset.p); p.fait = !p.fait; maj(); },
  'retirer-pas': b => { const o = trouver(S.objectifs, b.dataset.id); retirer(o.pas, b.dataset.p); maj(); },

  periode: b => { U.periode = b.dataset.p; U.decalage = 0; rendre(); },
  decaler: b => { const n = Number(b.dataset.n); U.decalage = n === 0 ? 0 : Math.min(0, U.decalage + n); rendre(); },

  'activer-notes': () => { S.notes.active = true; maj(); fenNotes(); },
  'modifier-notes': fenNotes,
  devoiler: () => { U.devoile = !U.devoile; rendre(); },
  'ajouter-contact': fenContact,
  'retirer-contact': b => { instantane(); retirer(S.notes.urgence, b.dataset.id); maj(); toast('Contact retiré.', { annuler: true }); },
  'desactiver-notes': () => {
    if (!confirm('Effacer toutes vos notes privées (groupe sanguin, allergies, traitements, contacts d’urgence) ?')) return;
    S.notes = normaliser({}).notes; maj(); toast('Notes privées effacées.');
  },
  'ajouter-memo': () => fenMemo(),
  'modifier-memo': b => fenMemo(trouver(S.memo, b.dataset.id)),
  'memo-pris': (b, e) => { const m = trouver(S.memo, b.dataset.id); if (m.pris[auj()]) delete m.pris[auj()]; else { m.pris[auj()] = true; eclat(e.clientX, e.clientY); } maj(); }
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const f = ACTIONS[b.dataset.act]; if (!f) return;
  if (b.tagName === 'A') e.preventDefault();
  f(b, e);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  if (f.dataset.form === 'ressenti') {
    const h = S.humeur[auj()] || (S.humeur[auj()] = {}); h.ressenti = f.t.value.trim(); maj(); toast('📖 Ressenti enregistré. Merci de prendre soin de vous.');
  } else if (f.dataset.form === 'pas') {
    const t = f.t.value.trim(); if (!t) return;
    trouver(S.objectifs, f.dataset.id).pas.push({ id: uid(), texte: t, fait: false }); maj();
    const n = $(`[data-form="pas"][data-id="${f.dataset.id}"] input`); if (n) n.focus();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) fermerModale(); });
$('#modale').addEventListener('mousedown', e => { if (e.target.id === 'modale') fermerModale(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== U.vue && VUES.some(x => x[0] === h)) { U.vue = h; rendre(); } });
/* une autre fenêtre (ou la synchronisation NaoGroup) a modifié les données */
window.addEventListener('storage', e => { if (e.key === CLE) { S = charger(); rendre(); } });
/* à minuit, « Aujourd'hui » change de jour */
let jourAffiche = auj();
setInterval(() => { if (auj() !== jourAffiche) { jourAffiche = auj(); if (!$('#modale').classList.contains('ouvert')) rendre(); } }, 60000);

/* ============================================================
   LE DÉCOR : des gélules qui dérivent, des gouttes qui se remplissent,
   des cœurs qui battent, des croix douces, des feuilles —
   et, de temps en temps, une ligne de pulsation qui traverse le ciel.
   ============================================================ */
const MOTIFS = {
  gelule: '<g transform="rotate(-35 12 12)"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/><path class="demi" d="M12 8h5a4 4 0 0 1 0 8h-5z"/></g>',
  comprime: '<circle cx="12" cy="12" r="8"/><path d="M6.8 17.2L17.2 6.8"/>',
  plaquette: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><circle cx="9" cy="8.5" r="1.9"/><circle cx="15" cy="8.5" r="1.9"/><circle cx="9" cy="13.5" r="1.9"/><circle class="plein" cx="15" cy="13.5" r="1.9"/><circle cx="12" cy="17.6" r="1.2" style="opacity:.5"/>',
  goutte: '<path d="M12 3.2C12 3.2 5.5 10.8 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.8 12 3.2 12 3.2Z"/><path class="demi rempli" d="M6.2 15.5a5.8 5.8 0 0 0 11.6 0c0-.8-.2-1.6-.5-2.5H6.7c-.3.9-.5 1.7-.5 2.5Z"/>',
  coeur: '<g class="bat"><path d="M12 19.5C6.2 15.6 3.8 12.6 3.8 9.3A4 4 0 0 1 12 7.2A4 4 0 0 1 20.2 9.3C20.2 12.6 17.8 15.6 12 19.5Z"/></g><path class="pouls" d="M1 12.5h5l1.6-3 2.4 6 2-4.5 1.2 1.5H23"/>',
  croix: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z" style="stroke-linejoin:round"/>',
  feuille: '<path d="M5 19C5 10 10.5 5 19.5 4.5C19.5 13.5 14 19 5 19Z"/><path d="M5 19L14 10"/>',
  stetho: '<path d="M6 3.5v5a4.5 4.5 0 0 0 9 0v-5"/><path d="M10.5 13v2.5a4.5 4.5 0 0 0 9 0V13"/><circle cx="19.5" cy="11" r="2"/>',
  verre: '<path d="M6 4h12l-1.4 15.2a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6z"/><path class="demi rempli" d="M7 11h10l-.9 8.1a1 1 0 0 1-1 .9H8.9a1 1 0 0 1-1-.9z"/>',
  lune: '<path d="M19 14.5A7.5 7.5 0 1 1 10 5a6 6 0 0 0 9 9.5Z"/>'
};
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const noms = Object.keys(MOTIFS);
  let hasard = 17; const alea = () => (hasard = (hasard * 9301 + 49297) % 233280) / 233280;
  const cols = Math.max(3, Math.round(W / 250)), rangs = Math.max(3, Math.round(H / 220));
  let m = '', k = 0;
  /* une grille jetée au hasard : chaque motif dans sa case, jamais deux collés */
  for (let r = 0; r < rangs; r++) for (let c = 0; c < cols; c++) {
    if (alea() < .36) continue;
    const n = noms[(k++ + Math.floor(alea() * 3)) % noms.length], t = 26 + alea() * 22;
    const x = (c + .15 + alea() * .7) * W / cols, y = (r + .15 + alea() * .7) * H / rangs;
    m += `<g class="m" style="opacity:${(.08 + alea() * .09).toFixed(2)};animation-duration:${(16 + alea() * 16).toFixed(1)}s;animation-delay:-${(alea() * 20).toFixed(1)}s;--d:${(6 + alea() * 6).toFixed(1)}s;--r:-${(alea() * 6).toFixed(1)}s">
      <g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(alea() * 36 - 18).toFixed(0)}) scale(${(t / 24).toFixed(2)}) translate(-12 -12)">${MOTIFS[n]}</g></g>`;
  }
  /* le ciel étoilé */
  for (let i = 0; i < 24; i++) {
    const x = alea() * W, y = alea() * H * .8, s = 1.6 + alea() * 2.6;
    m += `<path class="etoile" style="animation-duration:${(2.5 + alea() * 4).toFixed(1)}s;animation-delay:-${(alea() * 5).toFixed(1)}s" d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z"/>`;
  }
  /* la grande ligne de pulsation, qui passe lentement d'un bord à l'autre */
  const yE = H * (.3 + alea() * .4); let p = `M0 ${yE}`, l = 0, xE = 0;
  while (xE < W) {
    const pas = 120 + alea() * 160; p += `H${(xE + pas).toFixed(0)}`; xE += pas;
    p += `l8 -14l10 34l10 -44l9 30l7 -6h10`; xE += 54;
    l += pas + 150;
  }
  m += `<path class="ecg" style="--l:${Math.round(l)}" d="${p}"/>`;
  /* des gouttes et de petites gélules qui montent doucement, comme des bulles */
  m += '<g class="bulles">';
  for (let i = 0; i < 10; i++) {
    const x = alea() * W, s = .7 + alea() * .6, g = i % 2;
    m += `<g class="bulle" style="animation-duration:${(20 + alea() * 16).toFixed(1)}s;animation-delay:-${(alea() * 30).toFixed(1)}s"><g transform="translate(${x.toFixed(0)} ${H + 20}) scale(${s.toFixed(2)})">${g
      ? '<path d="M0 -9C0 -9 -6 -2 -6 2.5a6 6 0 0 0 12 0C6 -2 0 -9 0 -9Z" fill="none" stroke="var(--motif)" stroke-width="1.4"/>'
      : '<g transform="rotate(40)"><rect x="-9" y="-4" width="18" height="8" rx="4" fill="none" stroke="var(--motif)" stroke-width="1.4"/><path d="M0 -4v8" stroke="var(--motif)" stroke-width="1.4"/></g>'}</g></g>`;
  }
  m += '</g>';
  svg.innerHTML = m;
}
let minuteurDecor = null;
window.addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

{ const h = location.hash.slice(1); if (VUES.some(x => x[0] === h)) U.vue = h; }
/* l'entrée : la pulsation et le cœur, puis l'outil apparaît (un clic pour passer) */
function entree() {
  const intro = $('#intro');
  const finir = () => { if (intro.isConnected) intro.remove(); };
  const passer = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calme');
  if (passer) { document.body.classList.remove('entree'); return finir(); }
  intro.addEventListener('click', () => { intro.style.animation = 'introSort .4s ease forwards'; document.querySelector('.page').style.animation = 'emerge .6s ease both'; setTimeout(finir, 420); });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4200);
}
decor();
rendre();
entree();
