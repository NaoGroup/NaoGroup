/* ============================================================
   NaoSanté — le cœur : données, dates, références, calculs,
   fenêtres et toasts.
   Rappel de la maison : NaoSanté organise et encourage. Il ne pose
   jamais de diagnostic et ne donne aucun conseil médical.
   ============================================================ */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const lire = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const nombre = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/\s/g, '')); return isFinite(n) ? n : 0; };
const somme = (arr, f) => arr.reduce((t, x) => t + (f ? f(x) : x), 0);
const initiales = nom => String(nom || '?').trim().split(/\s+/).map(m => m[0]).join('').slice(0, 2).toUpperCase();
const pluriel = (n, un, plusieurs) => n + ' ' + (Math.abs(n) > 1 ? (plusieurs || un + 's') : un);
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const joli = n => String(Math.round(n * 10) / 10).replace('.', ',');

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const isoJour = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const auj = () => isoJour(new Date());
const parseJour = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const ajouteJours = (s, n) => { const d = parseJour(s); d.setDate(d.getDate() + n); return isoJour(d); };
const joursEntre = (a, b) => Math.round((parseJour(b) - parseJour(a)) / 864e5);
const lundiDe = s => { const d = parseJour(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return isoJour(d); };
const derniersJours = n => Array.from({ length: n }, (_, i) => ajouteJours(auj(), i - n + 1));
const joursSemaine = lundi => Array.from({ length: 7 }, (_, i) => ajouteJours(lundi, i));
const JOURS_C = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const JOURS_L = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS_L = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function fmtJour(s, long) {
  if (!s) return '';
  const d = parseJour(s);
  return long ? `${JOURS_L[d.getDay()]} ${d.getDate()} ${MOIS_L[d.getMonth()]} ${d.getFullYear()}`
              : `${JOURS_C[d.getDay()]} ${d.getDate()} ${MOIS_C[d.getMonth()]}`;
}
function quand(s) {
  if (!s) return '';
  const n = joursEntre(auj(), s);
  if (n === 0) return "aujourd'hui";
  if (n === 1) return 'demain';
  if (n === -1) return 'hier';
  if (n > 1) return n < 14 ? `dans ${n} jours` : `le ${fmtJour(s)}`;
  return `il y a ${-n} jours`;
}
/* 07:30 → 450 minutes ; 450 → « 7 h 30 » */
const enMinutes = h => { const [a, b] = String(h || '0:0').split(':').map(Number); return (a || 0) * 60 + (b || 0); };
const duree = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${pad(r)}` : `${h} h`) : `${r} min`; };

/* ============================================================
   LES RÉFÉRENCES
   ============================================================ */
const ACTIVITES = [
  ['marche', '🚶', 'Marche'], ['gym', '🤸', 'Gymnastique'], ['muscu', '🏋️', 'Musculation'], ['course', '🏃', 'Course'],
  ['velo', '🚴', 'Vélo'], ['yoga', '🧘', 'Yoga'], ['etirements', '🙆', 'Étirements'], ['danse', '💃', 'Danse'],
  ['natation', '🏊', 'Natation'], ['autre', '✨', 'Autre']
];
const activite = k => ACTIVITES.find(a => a[0] === k) || ACTIVITES[ACTIVITES.length - 1];
const INTENSITES = [['douce', '🌱 Douce'], ['moderee', '🌿 Modérée'], ['soutenue', '🔥 Soutenue']];
const intensite = k => (INTENSITES.find(i => i[0] === k) || INTENSITES[0])[1];

const HABITUDES_PROPOSEES = [
  ['💧', 'Boire de l’eau'], ['🚶', 'Marcher'], ['☕', 'Prendre une pause'], ['🙆', 'M’étirer'], ['🌙', 'Me coucher plus tôt']
];
const EMOJIS_HABITUDE = ['💧', '🚶', '☕', '🙆', '🌙', '🧘', '🌿', '🍎', '📖', '🌤️', '🛁', '🎧', '✍️', '🌬️', '😴', '💪', '🫖', '🌸', '🚲', '⭐'];

const DEFIS = [
  ['eau', '💧', 'Boire un verre d’eau', 'Un grand verre, tranquillement.'],
  ['marche', '🚶', 'Marcher 15 minutes', 'Dehors ou chez soi, à son rythme.'],
  ['etire', '🙆', '5 minutes d’étirements', 'En douceur, sans forcer.'],
  ['respire', '🌬️', 'Respirer calmement quelques minutes', 'Inspirer sur 4 temps, expirer sur 6.'],
  ['pause', '☕', 'Faire une vraie pause', 'Quelques minutes loin des écrans.'],
  ['air', '🌤️', 'Prendre l’air 10 minutes', 'Une fenêtre, un balcon, un tour du pâté.'],
  ['coucher', '🌙', 'Se coucher 15 minutes plus tôt', 'Un petit pas vers un meilleur rythme.'],
  ['epaules', '🤷', 'Relâcher ses épaules', 'Trois grands cercles lents, vers l’arrière.']
];
const defi = k => DEFIS.find(d => d[0] === k) || DEFIS[0];
/* le défi du jour change chaque jour, tout seul */
const defiDuJour = (d = auj()) => DEFIS[Math.abs(joursEntre('2024-01-01', d)) % DEFIS.length];

const ENCOURAGEMENTS = [
  'Chaque petit pas compte, même ceux qu’on ne voit pas.',
  'Aujourd’hui, vous faites de votre mieux — et c’est déjà beaucoup.',
  'Prendre soin de soi n’est pas une course : c’est un rythme.',
  'Un verre d’eau, une respiration, un sourire : c’est un bon début.',
  'Soyez aussi doux·ce avec vous qu’avec les gens que vous aimez.',
  'Les bonnes habitudes poussent lentement, comme les plantes.',
  'Une journée imparfaite reste une journée qui compte.',
  'Vous avez le droit de ralentir.',
  'Bouger un peu, c’est déjà bouger.',
  'Le repos fait aussi partie du progrès.',
  'Écoutez votre rythme : il a souvent raison.',
  'Ce que vous faites régulièrement compte plus que ce que vous faites parfois.',
  'Un jour sans ? Demain est une nouvelle page.',
  'Votre énergie d’aujourd’hui n’est pas celle de demain : accueillez-la.',
  'Petit à petit, l’oiseau fait son nid.',
  'Merci de prendre ce moment pour vous.',
  'Respirez. Vous êtes exactement là où vous devez être.',
  'La régularité est une forme de tendresse envers soi.'
];
const encouragementDuJour = (decalage = 0) => ENCOURAGEMENTS[(Math.abs(joursEntre('2024-01-01', auj())) + decalage) % ENCOURAGEMENTS.length];

const ENERGIES = [[1, '🪫', 'Faible'], [2, '🔋', 'Moyenne'], [3, '⚡', 'Bonne'], [4, '✨', 'Très bonne']];
const energie = n => ENERGIES.find(e => e[0] === n);
const HUMEURS = [[1, '😔', 'Difficile'], [2, '😕', 'Mitigée'], [3, '🙂', 'Correcte'], [4, '😊', 'Bonne'], [5, '😄', 'Excellente']];
const humeur = n => HUMEURS.find(h => h[0] === n);
const QUALITES = [[1, '😣 Agitée'], [2, '😕 Moyenne'], [3, '🙂 Correcte'], [4, '😌 Bonne'], [5, '🌟 Excellente']];

const TYPES_RDV = [
  ['medical', '🩺', 'Médecin'], ['dentaire', '🦷', 'Dentiste'], ['optique', '👓', 'Ophtalmologie / optique'],
  ['suivi', '📋', 'Suivi / contrôle'], ['soins', '🤲', 'Kiné / soins'], ['autre', '📅', 'Autre rendez-vous']
];
const typeRdv = k => TYPES_RDV.find(t => t[0] === k) || TYPES_RDV[TYPES_RDV.length - 1];
const TYPES_RAPPEL = [
  ['ordonnance', '💊', 'Renouveler une ordonnance'], ['rdv', '📞', 'Prendre rendez-vous'],
  ['controle', '🔍', 'Effectuer un contrôle'], ['autre', '🔔', 'Autre rappel']
];
const typeRappel = k => TYPES_RAPPEL.find(t => t[0] === k) || TYPES_RAPPEL[TYPES_RAPPEL.length - 1];

const TYPES_OBJECTIF = [
  ['sommeil', '🌙', 'Mieux dormir', 'heures par nuit', 8],
  ['souplesse', '🙆', 'Améliorer ma souplesse', 'séances d’étirements par semaine', 4],
  ['bouger', '🏃', 'Bouger davantage', 'minutes d’activité par semaine', 150],
  ['eau', '💧', 'Boire plus d’eau', 'verres par jour', 8],
  ['libre', '🎯', 'Objectif personnel', 'étapes', 0]
];
const typeObjectif = k => TYPES_OBJECTIF.find(t => t[0] === k) || TYPES_OBJECTIF[TYPES_OBJECTIF.length - 1];

const CATS_MEMO = [['medicament', '💊', 'Médicament'], ['vitamine', '🌿', 'Vitamine / complément'], ['autre', '🧴', 'Autre']];
const catMemo = k => CATS_MEMO.find(c => c[0] === k) || CATS_MEMO[0];
const MOMENTS = [['matin', '🌅 Matin'], ['midi', '☀️ Midi'], ['soir', '🌆 Soir'], ['coucher', '🌙 Coucher']];

/* La routine de souplesse proposée : des gestes simples, sans aucune prétention médicale. */
const ROUTINE_PROPOSEE = [
  ['🙆', 'Nuque : inclinaisons douces', 40, 'Oreille vers l’épaule, d’un côté puis de l’autre.'],
  ['🤷', 'Épaules : grands cercles lents', 40, 'Vers l’arrière, en respirant.'],
  ['🐈', 'Dos : le chat et la vache', 60, 'À quatre pattes, on arrondit puis on creuse le dos.'],
  ['🙇', 'Flexion avant, genoux souples', 45, 'On laisse pendre la tête et les bras, sans chercher à toucher le sol.'],
  ['🦵', 'Cuisses : étirement debout', 60, 'Une main au mur, 30 secondes par jambe.'],
  ['🧘', 'Respiration calme', 60, 'Assis·e confortablement, épaules relâchées.']
];

/* ============================================================
   L'ÉTAT
   ============================================================ */
const CLE = 'naosante.donnees';
const reglagesVierges = () => ({ prenom: '', verreMl: 250, objectifVerres: 8, objectifSommeil: 8, coucherCible: '23:00', objectifMinutes: 150, objectifEtirements: 4 });
const vierge = () => ({
  version: 1, reglages: reglagesVierges(),
  eau: {}, energie: {}, humeur: {}, sommeil: [], activites: [],
  etirements: { routine: [], jours: {} },
  habitudes: [], faits: {}, rdv: [], rappels: [], objectifs: [],
  notes: { active: false, masquer: true, groupe: '', allergies: '', traitements: '', infos: '', urgence: [] },
  memo: [], defis: {},
  programmes: [], seances: [], fractionne: { effort: 30, pause: 15, tours: 8 }
});
function normaliser(d) {
  const s = Object.assign(vierge(), d || {});
  s.reglages = Object.assign(reglagesVierges(), s.reglages || {});
  ['sommeil', 'activites', 'habitudes', 'rdv', 'rappels', 'objectifs', 'memo', 'programmes', 'seances'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  ['eau', 'energie', 'humeur', 'faits', 'defis'].forEach(k => { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; });
  if (!s.etirements || typeof s.etirements !== 'object') s.etirements = { routine: [], jours: {} };
  if (!Array.isArray(s.etirements.routine)) s.etirements.routine = [];
  if (!s.etirements.jours || typeof s.etirements.jours !== 'object') s.etirements.jours = {};
  if (!s.etirements.routine.length) s.etirements.routine = ROUTINE_PROPOSEE.map(([e, n, sec, c]) => ({ id: uid(), emoji: e, nom: n, secondes: sec, conseil: c }));
  s.notes = Object.assign(vierge().notes, s.notes || {});
  if (!Array.isArray(s.notes.urgence)) s.notes.urgence = [];
  s.programmes.forEach(p => { if (!Array.isArray(p.exercices)) p.exercices = []; });
  s.fractionne = Object.assign(vierge().fractionne, s.fractionne || {});
  s.objectifs.forEach(o => { if (!Array.isArray(o.pas)) o.pas = []; });
  s.memo.forEach(m => { if (!Array.isArray(m.moments)) m.moments = []; if (!m.pris || typeof m.pris !== 'object') m.pris = {}; });
  return s;
}
function charger() {
  try { const d = JSON.parse(localStorage.getItem(CLE) || 'null'); if (d && typeof d === 'object') return normaliser(d); } catch (e) {}
  return normaliser(null);
}
let S = charger();
let dejaPrevenu = false;
function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(S)); return true; }
  catch (e) {
    if (dejaPrevenu) return false;
    dejaPrevenu = true;
    toast('Ce navigateur refuse d’enregistrer : pensez à 💾 sauvegarder votre suivi dans un fichier.', { alerte: true, duree: 7000 });
    return false;
  }
}
let annulation = null;
function instantane() { annulation = JSON.stringify(S); }
function annuler() { if (!annulation) return; S = normaliser(JSON.parse(annulation)); annulation = null; sauver(); rendre(); }
const trouver = (liste, id) => (liste || []).find(x => x.id === id);
const retirer = (liste, id) => { const i = liste.findIndex(x => x.id === id); if (i >= 0) liste.splice(i, 1); };
const R = () => S.reglages;

/* ============================================================
   LES CALCULS
   ============================================================ */
/* hydratation */
const verres = (d = auj()) => S.eau[d] || 0;
const pctEau = (d = auj()) => borne(verres(d) / Math.max(1, R().objectifVerres), 0, 1);
const litres = n => joli(n * R().verreMl / 1000).replace(/,0$/, '') + ' L';

/* sommeil : une nuit est rangée au jour du réveil */
const dureeNuit = n => { let m = enMinutes(n.lever) - enMinutes(n.coucher); if (m <= 0) m += 1440; return m; };
const nuitDu = d => S.sommeil.find(n => n.date === d);
const nuitsTriees = () => S.sommeil.slice().sort((a, b) => b.date.localeCompare(a.date));
function moyenneSommeil(jours) {
  const n = jours.map(nuitDu).filter(Boolean);
  return n.length ? somme(n, dureeNuit) / n.length : 0;
}

/* activité */
const activitesDu = d => S.activites.filter(a => a.date === d);
const minutesDu = d => somme(activitesDu(d), a => nombre(a.duree)) + (S.etirements.jours[d] || 0);
const minutesSemaine = (lundi = lundiDe(auj())) => somme(joursSemaine(lundi), minutesDu);
const seancesEtirementSemaine = (lundi = lundiDe(auj())) =>
  joursSemaine(lundi).filter(d => S.etirements.jours[d] || activitesDu(d).some(a => a.type === 'etirements' || a.type === 'yoga')).length;

/* habitudes & séries */
const faitsDu = d => S.faits[d] || [];
const estFaite = (h, d = auj()) => faitsDu(d).includes(h.id);
const habitudesDu = d => S.habitudes.filter(h => !h.archive && (!h.cree || h.cree <= d));
function serie(test) {
  let d = auj(), n = 0;
  if (!test(d)) d = ajouteJours(d, -1);
  while (test(d) && n < 3660) { n++; d = ajouteJours(d, -1); }
  return n;
}
const serieHabitude = h => serie(d => faitsDu(d).includes(h.id));
function tauxHabitudes(d) {
  const hs = habitudesDu(d); if (!hs.length) return null;
  return hs.filter(h => faitsDu(d).includes(h.id)).length / hs.length;
}
const serieEau = () => serie(d => verres(d) >= R().objectifVerres);
const serieEtirements = () => serie(d => !!S.etirements.jours[d]);
function meilleureSerie(test, depuis) {
  let meilleure = 0, cours = 0;
  for (let d = depuis; d <= auj(); d = ajouteJours(d, 1)) { if (test(d)) { cours++; meilleure = Math.max(meilleure, cours); } else cours = 0; }
  return meilleure;
}

/* rendez-vous & rappels */
const rdvAVenir = () => S.rdv.filter(r => r.date >= auj()).sort((a, b) => (a.date + (a.heure || '')).localeCompare(b.date + (b.heure || '')));
const rdvPasses = () => S.rdv.filter(r => r.date < auj()).sort((a, b) => b.date.localeCompare(a.date));
const rappelsOuverts = () => S.rappels.filter(r => !r.fait).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

/* objectifs : la progression se calcule toute seule à partir du suivi */
function progresObjectif(o) {
  const c = nombre(o.cible) || typeObjectif(o.type)[4] || 1;
  if (o.type === 'eau') {
    const j = derniersJours(7).filter(d => verres(d) >= c).length;
    return { pct: j / 7, texte: `${j} jour${j > 1 ? 's' : ''} sur 7 à ${c} verres ou plus` };
  }
  if (o.type === 'sommeil') {
    const j = derniersJours(7).filter(d => { const n = nuitDu(d); return n && dureeNuit(n) >= c * 60 - 10; }).length;
    return { pct: j / 7, texte: `${j} nuit${j > 1 ? 's' : ''} sur 7 d’au moins ${joli(c)} h` };
  }
  if (o.type === 'bouger') {
    const m = minutesSemaine();
    return { pct: borne(m / c, 0, 1), texte: `${m} min sur ${c} min cette semaine` };
  }
  if (o.type === 'souplesse') {
    const s = seancesEtirementSemaine();
    return { pct: borne(s / c, 0, 1), texte: `${s} séance${s > 1 ? 's' : ''} sur ${c} cette semaine` };
  }
  const t = o.pas.length, f = o.pas.filter(p => p.fait).length;
  return t ? { pct: f / t, texte: `${f} étape${f > 1 ? 's' : ''} sur ${t}` } : { pct: o.fait ? 1 : 0, texte: o.fait ? 'Atteint 🎉' : 'Ajoutez des étapes pour suivre votre avancée' };
}
const objectifsActifs = () => S.objectifs.filter(o => !o.archive);
const objectifVedette = () => objectifsActifs().find(o => o.vedette) || objectifsActifs()[0];

/* ---------- toasts ---------- */
function toast(texte, o = {}) {
  const t = document.createElement('div');
  t.className = 'toast' + (o.alerte ? ' alerte' : '');
  t.innerHTML = `<span>${esc(texte)}</span>`;
  if (o.annuler) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Annuler';
    b.addEventListener('click', () => { annuler(); t.remove(); });
    t.appendChild(b);
  }
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 420); }, o.duree || (o.annuler ? 6500 : 3200));
}
function eclat(x, y, signes) {
  if (document.documentElement.classList.contains('calme')) return;
  (signes || ['✦', '♡', '·', '✧', '♡']).forEach((c, i, t) => {
    const s = document.createElement('span'); s.className = 'eclat'; s.textContent = c;
    const a = (i / t.length) * Math.PI * 2 - Math.PI / 2;
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = i % 2 ? 'var(--ciel)' : 'var(--accent)';
    s.style.setProperty('--x', Math.cos(a) * 36 + 'px'); s.style.setProperty('--y', Math.sin(a) * 36 + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 950);
  });
}

/* ============================================================
   La fenêtre-formulaire : un seul constructeur pour tout l'outil.
   champs : { k, l, t, o, ph, large, aide }
   types : text, number, date, time, tel, textarea, select, case, emoji, html
   ============================================================ */
function ouvrirModale(html, apres, large) {
  const voile = $('#modale'), fen = $('#modaleFen');
  fen.className = 'fen' + (large ? ' large' : '');
  fen.innerHTML = html;
  voile.classList.add('ouvert');
  document.body.style.overflow = 'hidden';
  if (apres) apres(fen);
  const f = fen.querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea');
  if (f && window.matchMedia('(pointer:fine)').matches) setTimeout(() => f.focus(), 60);
}
let fermetureModale = null;
function fermerModale() {
  $('#modale').classList.remove('ouvert');
  document.body.style.overflow = '';
  $('#modaleFen').innerHTML = '';
  if (fermetureModale) { const f = fermetureModale; fermetureModale = null; f(); }
}
function formulaire(o) {
  const v = o.valeurs || {};
  const champ = c => {
    const id = 'f_' + c.k, val = v[c.k], lab = esc(c.l);
    const cls = 'champ' + (c.large || c.t === 'textarea' || c.t === 'emoji' || c.t === 'html' ? ' large' : '');
    let inner;
    if (c.t === 'select') inner = `<select id="${id}" name="${c.k}">${c.o.map(([a, b]) => `<option value="${esc(a)}"${String(val ?? '') === String(a) ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
    else if (c.t === 'textarea') inner = `<textarea id="${id}" name="${c.k}" placeholder="${esc(c.ph || '')}">${esc(val || '')}</textarea>`;
    else if (c.t === 'case') return `<label class="champ case large"><input type="checkbox" name="${c.k}"${val ? ' checked' : ''}> ${lab}</label>`;
    else if (c.t === 'html') return `<div class="${cls}">${c.l ? `<span class="lab">${lab}</span>` : ''}${c.html}</div>`;
    else if (c.t === 'emoji') inner = `<input type="hidden" name="${c.k}" value="${esc(val || c.o[0])}"><div class="choix-emoji">${c.o.map(e => `<button type="button" data-emoji="${e}" class="${(val || c.o[0]) === e ? 'on' : ''}">${e}</button>`).join('')}</div>`;
    else inner = `<input id="${id}" name="${c.k}" type="${c.t || 'text'}" value="${esc(val ?? '')}" placeholder="${esc(c.ph || '')}"${c.t === 'number' ? ` step="${c.pas || 'any'}" inputmode="decimal" min="0"` : ''}>`;
    return `<div class="${cls}"><label for="${id}">${lab}</label>${inner}${c.aide ? `<div class="aide">${esc(c.aide)}</div>` : ''}</div>`;
  };
  ouvrirModale(`<form id="formModale" novalidate>
      <h3 id="modaleTitre">${o.titre}</h3>${o.sous ? `<p class="sous">${o.sous}</p>` : ''}
      <div class="champs">${o.champs.map(champ).join('')}</div>
      <div class="pied-fen">${o.supprimer ? '<button type="button" class="btn fin danger" data-f="supprimer">Supprimer</button>' : ''}
        <div class="droite"><button type="button" class="btn fin" data-f="fermer">Annuler</button><button type="submit" class="btn plein">${o.valider || 'Enregistrer'}</button></div></div>
    </form>`, fen => {
    const f = fen.querySelector('form');
    fen.querySelectorAll('.choix-emoji').forEach(ce => ce.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      ce.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      ce.previousElementSibling.value = b.dataset.emoji;
    }));
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    const sup = fen.querySelector('[data-f="supprimer"]');
    if (sup) sup.addEventListener('click', () => { o.supprimer(); fermerModale(); });
    f.addEventListener('submit', e => {
      e.preventDefault();
      const r = {};
      o.champs.forEach(c => {
        if (c.t === 'html') return;
        const el = f.elements[c.k]; if (!el) return;
        r[c.k] = c.t === 'case' ? el.checked : (c.t === 'number' ? nombre(el.value) : el.value.trim());
      });
      if (o.valider_si && !o.valider_si(r, f)) return;
      if (o.enregistrer(r, f) !== false) fermerModale();
    });
    if (o.apres) o.apres(fen);
  }, o.large);
}
