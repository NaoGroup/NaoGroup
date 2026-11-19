'use strict';
/* ============================================================
   NaoStudy — le cœur : l'état (profils, matières, cours, devoirs,
   contrôles, révisions, notes…), les dates, les catalogues,
   les fichiers joints, la fenêtre, les messages et le code parent.
   ============================================================ */

const CLE = 'naostudy.donnees';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pluriel = (n, mot, mots) => n + ' ' + (n > 1 ? (mots || mot + 's') : mot);

/* ---------- les dates : toujours « AAAA-MM-JJ », en heure locale ---------- */
const z2 = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + z2(d.getMonth() + 1) + '-' + z2(d.getDate());
const auj = () => iso(new Date());
const dateDe = s => { const [a, m, j] = String(s).split('-').map(Number); return new Date(a, (m || 1) - 1, j || 1); };
const plusJours = (s, n) => { const d = dateDe(s); d.setDate(d.getDate() + n); return iso(d); };
const ecart = s => Math.round((dateDe(s) - dateDe(auj())) / 864e5);
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const JOURS_C = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const Maj = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const jourSemaine = s => { const j = dateDe(s).getDay(); return j === 0 ? 7 : j; };   /* 1 = lundi … 7 = dimanche */
const lundiDe = s => plusJours(s, 1 - jourSemaine(s));
const dateLongue = s => { if (!s) return ''; const d = dateDe(s); return JOURS[d.getDay()] + ' ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()]; };
const dateCourte = s => { if (!s) return ''; const d = dateDe(s); const a = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''; return JOURS_C[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS_C[d.getMonth()] + a; };
function dans(s) {
  const n = ecart(s);
  if (n === 0) return "aujourd'hui";
  if (n === 1) return 'demain';
  if (n === -1) return 'hier';
  const a = Math.abs(n);
  const t = a < 14 ? a + ' jours' : a < 60 ? Math.round(a / 7) + ' semaines' : Math.round(a / 30.4) + ' mois';
  return n > 0 ? 'dans ' + t : 'il y a ' + t;
}
/* une couleur douce selon l'approche : jamais de rouge vif pour ce qui est encore loin */
function etatDate(s, bientot = 3) {
  if (!s) return '';
  const n = ecart(s);
  return n < 0 ? 'passe' : n <= bientot ? 'bientot' : 'ok';
}
const minutes = hm => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const hm = n => z2(Math.floor(n / 60)) + ':' + z2(n % 60);
const heureAff = s => s ? s.replace(':', 'h') : '';
const duree = n => { n = +n || 0; if (n < 60) return n + ' min'; const h = Math.floor(n / 60), m = n % 60; return h + ' h' + (m ? ' ' + z2(m) : ''); };
/* l'année scolaire : elle bascule fin août */
const anneeScolaire = (s = auj()) => { const d = dateDe(s), a = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; return a + '-' + (a + 1); };

/* ---------- les catalogues ---------- */
const NIVEAUX = [
  { g: 'Primaire', l: ['Maternelle', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { g: 'Collège', l: ['6e', '5e', '4e', '3e'] },
  { g: 'Lycée', l: ['2de', '1re', 'Terminale', 'CAP / Bac pro'] },
  { g: 'Études supérieures', l: ['BTS', 'BUT', 'Licence 1', 'Licence 2', 'Licence 3', 'Master', 'Prépa', 'École', 'Doctorat'] },
  { g: 'Autre', l: ['Formation adulte', 'Autodidacte', 'Autre'] }
];
const cycleDe = niv => { for (const c of NIVEAUX) if (c.l.includes(niv)) return c.g; return 'Autre'; };
const MATIERES_TYPE = {
  'Primaire': ['Français', 'Mathématiques', 'Questionner le monde', 'Anglais', 'Arts', 'EPS'],
  'Collège': ['Français', 'Mathématiques', 'Histoire-Géographie', 'Anglais', 'Espagnol', 'SVT', 'Physique-Chimie', 'Technologie', 'EPS', 'Arts plastiques', 'Musique'],
  'Lycée': ['Français', 'Philosophie', 'Mathématiques', 'Histoire-Géographie', 'Anglais', 'Espagnol', 'SES', 'SVT', 'Physique-Chimie', 'Enseignement scientifique', 'EPS'],
  'Études supérieures': ['Cours magistral', 'Travaux dirigés', 'Langue', 'Méthodologie'],
  'Autre': ['Français', 'Mathématiques', 'Anglais']
};
const COULEURS = ['#8E7BD4', '#6F7FEF', '#4FB3D9', '#5FBF9A', '#9BC45A', '#E0B84F', '#F2A65A', '#E0707F', '#E48FB8', '#C9A6F2', '#7A8BA6', '#B28A6E'];
const EMOJIS = ['🦊', '🐼', '🦉', '🐬', '🦋', '🐢', '🦁', '🐱', '🌟', '🚀', '🎨', '⚽', '🎵', '📚'];
const STATUTS = [
  { id: 'a-commencer', nom: 'À commencer', e: '🌱' },
  { id: 'en-cours', nom: 'En cours', e: '✏️' },
  { id: 'termine', nom: 'Terminé', e: '✅' },
  { id: 'rendu', nom: 'Rendu', e: '📬' },
  { id: 'a-revoir', nom: 'À revoir', e: '🔁' }
];
const statut = id => STATUTS.find(s => s.id === id) || STATUTS[0];
const PRIOS = [{ id: 'haute', nom: 'Haute' }, { id: 'moyenne', nom: 'Moyenne' }, { id: 'basse', nom: 'Basse' }];
const TYPES_EVAL = [
  { id: 'controle', nom: 'Contrôle', e: '📝' }, { id: 'interro', nom: 'Interrogation', e: '⚡' }, { id: 'examen', nom: 'Examen', e: '🎓' },
  { id: 'oral', nom: 'Oral', e: '🎤' }, { id: 'date', nom: 'Date importante', e: '📌' }
];
const typeEval = id => TYPES_EVAL.find(t => t.id === id) || TYPES_EVAL[0];
const TYPES_REV = [
  { id: 'relire', nom: 'Relire le cours', e: '📖' }, { id: 'fiche', nom: 'Faire / revoir la fiche', e: '🗂️' }, { id: 'cartes', nom: 'Flashcards', e: '🃏' },
  { id: 'quiz', nom: 'Quiz', e: '❓' }, { id: 'exos', nom: 'Exercices', e: '✍️' }, { id: 'oral', nom: "S'entraîner à l'oral", e: '🎤' }, { id: 'libre', nom: 'Révision libre', e: '⭐' }
];
const typeRev = id => TYPES_REV.find(t => t.id === id) || TYPES_REV[6];
const TYPES_DOC = [
  { id: 'cours', nom: 'Cours', e: '📘' }, { id: 'fiche', nom: 'Fiche', e: '🗂️' }, { id: 'consigne', nom: 'Consigne', e: '📋' },
  { id: 'photo', nom: 'Photo de feuille', e: '📷' }, { id: 'bulletin', nom: 'Bulletin', e: '📊' }, { id: 'autre', nom: 'Autre', e: '📄' }
];
const typeDoc = id => TYPES_DOC.find(t => t.id === id) || TYPES_DOC[5];
const TYPES_ORIENT = [
  { id: 'metier', nom: 'Métiers à découvrir', un: 'Métier', e: '🔭' }, { id: 'formation', nom: 'Idées de formations', un: 'Formation', e: '🏫' },
  { id: 'stage', nom: 'Stages', un: 'Stage', e: '🧑‍🔧' }, { id: 'candidature', nom: 'Dates de candidature', un: 'Candidature', e: '📮' },
  { id: 'cv', nom: 'CV étudiant', un: 'Élément de CV', e: '📄' }, { id: 'lettre', nom: 'Lettre de motivation', un: 'Idée de lettre', e: '✉️' },
  { id: 'projet', nom: 'Projets', un: 'Projet', e: '🌱' }, { id: 'note', nom: 'Notes personnelles', un: 'Note', e: '🗒️' }
];
const typeOrient = id => TYPES_ORIENT.find(t => t.id === id) || TYPES_ORIENT[7];
const RAPPELS = [{ v: '0', n: 'Pas de rappel' }, { v: '1', n: 'La veille' }, { v: '2', n: '2 jours avant' }, { v: '3', n: '3 jours avant' }, { v: '7', n: 'Une semaine avant' }];
/* la révision progressive : plus une carte est sue, plus elle revient tard */
const INTERVALLES = [0, 1, 2, 4, 8, 16];

/* ---------- l'état ---------- */
function vierge() {
  return {
    v: 1, profils: [], matieres: [], cours: [], devoirs: [], evals: [], fiches: [], cartes: [], quiz: [], revisions: [],
    objectifs: [], documents: [], notes: [], journal: [], orientation: [], sessions: [], defis: {}, badges: {},
    reglages: { profil: '', codeParent: null }
  };
}
function charger() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (d && typeof d === 'object') { const s = Object.assign(vierge(), d); s.reglages = Object.assign(vierge().reglages, d.reglages || {}); return s; }
  } catch (e) {}
  return vierge();
}
let S = charger();
function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(S)); }
  catch (e) { toast('⚠️ Impossible d’enregistrer : la mémoire du navigateur est pleine (images trop lourdes ?).'); }
}

/* L'interface (non enregistrée) */
const U = { vue: 'accueil', edt: 'semaine', edtDate: auj(), rev: 'jour', mat: '', docMat: '', docAnnee: '', q: '', notesMat: '', periode: 'annee', comparer: false, parent: false };

/* ---------- le profil actif ---------- */
const profil = () => S.profils.find(p => p.id === S.reglages.profil) || S.profils[0] || null;
const pid = () => (profil() || {}).id || '';
const duProfil = (liste, p = pid()) => liste.filter(x => x.profil === p);
const matiere = id => S.matieres.find(m => m.id === id) || null;
const matieresDe = (p = pid()) => S.matieres.filter(m => m.profil === p).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
const couleurMat = id => (matiere(id) || {}).couleur || '#8E7BD4';
const nomMat = id => (matiere(id) || {}).nom || 'Sans matière';
const puceMat = id => `<span class="mat" style="--c:${couleurMat(id)}">${esc(nomMat(id))}</span>`;
const initiale = p => esc((p.prenom || '?').trim()[0] || '?').toUpperCase();
const rondProfil = p => `<span class="rond" style="--c:${p.couleur}">${p.emoji ? p.emoji : initiale(p)}</span>`;

/* ---------- les dates de chaque chose ---------- */
const devoirsOuverts = (p = pid()) => duProfil(S.devoirs, p).filter(d => !['rendu', 'termine'].includes(d.statut));
const evalsAVenir = (p = pid()) => duProfil(S.evals, p).filter(e => e.date >= auj()).sort((a, b) => (a.date + (a.heure || '')).localeCompare(b.date + (b.heure || '')));
/* Semaines A et B : un profil peut alterner deux emplois du temps. `refA` est le lundi d'une semaine A. */
const profilDe = p => S.profils.find(x => x.id === p) || null;
function semaineAB(s, p = pid()) {
  const pr = profilDe(p); if (!pr || !pr.semainesAB) return '';
  const n = Math.round((dateDe(lundiDe(s)) - dateDe(lundiDe(pr.refA || auj()))) / (7 * 864e5));
  return ((n % 2) + 2) % 2 === 0 ? 'A' : 'B';
}
/* un cours a lieu cette semaine-là s'il est « toutes les semaines », ou si c'est sa semaine */
const coursDeLaSemaine = (s, p = pid()) => { const ab = semaineAB(s, p); return duProfil(S.cours, p).filter(c => !ab || !c.semaine || c.semaine === 'toutes' || c.semaine === ab); };
const coursDuJour = (s, p = pid()) => coursDeLaSemaine(s, p).filter(c => +c.jour === jourSemaine(s)).sort((a, b) => minutes(a.debut) - minutes(b.debut));
const cartesDues = (p = pid(), mat = '') => duProfil(S.cartes, p).filter(c => (!mat || c.matiere === mat) && (c.prochaine || auj()) <= auj());
const revisionsDuJour = (p = pid()) => duProfil(S.revisions, p).filter(r => r.date === auj() || (r.date < auj() && !r.fait && ecart(r.date) >= -3));
const trierDevoirs = l => l.slice().sort((a, b) => (a.pour || '9').localeCompare(b.pour || '9') || ['haute', 'moyenne', 'basse'].indexOf(a.prio) - ['haute', 'moyenne', 'basse'].indexOf(b.prio));
/* les rappels : un devoir non rendu dont la date approche, selon le rappel choisi */
const rappelsActifs = (p = pid()) => devoirsOuverts(p).filter(d => d.pour && +d.rappel > 0 && ecart(d.pour) >= 0 && ecart(d.pour) <= +d.rappel);

/* ---------- les moyennes indicatives ---------- */
/* `garder` (facultatif) choisit les notes prises en compte : une période, ou « jusqu'à telle date » pour les courbes */
function moyenneMat(mat, p = pid(), garder = null) {
  const l = duProfil(S.notes, p).filter(n => n.matiere === mat && n.valeur !== '' && +n.sur > 0 && (!garder || garder(n)));
  let t = 0, c = 0;
  l.forEach(n => { const k = +n.coef || 1; t += (+n.valeur / +n.sur) * 20 * k; c += k; });
  return c ? t / c : null;
}
function moyenneGenerale(p = pid(), garder = null) {
  let t = 0, c = 0;
  matieresDe(p).forEach(m => { const v = moyenneMat(m.id, p, garder); if (v != null) { const k = +m.coef || 1; t += v * k; c += k; } });
  return c ? t / c : null;
}
/* les périodes de l'année scolaire (indicatives : chaque établissement a son propre découpage) */
function periodesNotes(s = auj()) {
  const a = +anneeScolaire(s).slice(0, 4), b = a + 1;
  return [
    { id: 'annee', nom: 'Toute l’année', du: a + '-08-15', au: b + '-08-14' },
    { id: 't1', nom: '1er trimestre', du: a + '-08-15', au: a + '-12-31' },
    { id: 't2', nom: '2e trimestre', du: b + '-01-01', au: b + '-03-31' },
    { id: 't3', nom: '3e trimestre', du: b + '-04-01', au: b + '-08-14' },
    { id: 's1', nom: '1er semestre', du: a + '-08-15', au: b + '-01-31' },
    { id: 's2', nom: '2e semestre', du: b + '-02-01', au: b + '-08-14' }
  ];
}
const note20 = v => v == null ? '—' : (Math.round(v * 10) / 10).toLocaleString('fr-FR');

/* ---------- le temps passé à apprendre (séries, défis, récompenses) ---------- */
function noterSession(quoi, min, mat = '', n = 0) {
  if (!pid()) return;
  S.sessions.push({ id: uid(), profil: pid(), date: auj(), minutes: Math.max(0, Math.round(+min || 0)), quoi, matiere: mat, n });
}
const joursActifs = (p = pid()) => new Set(duProfil(S.sessions, p).map(s => s.date));
function serie(p = pid()) {
  const j = joursActifs(p); let n = 0, d = auj();
  if (!j.has(d)) d = plusJours(d, -1);
  while (j.has(d)) { n++; d = plusJours(d, -1); }
  return n;
}
const minutesSemaine = (p = pid(), lundi = lundiDe(auj())) => duProfil(S.sessions, p).filter(s => s.date >= lundi && s.date <= plusJours(lundi, 6)).reduce((t, s) => t + s.minutes, 0);

/* ---------- les fichiers joints : dans ce navigateur (IndexedDB), jamais envoyés ---------- */
let _bd = null;
function bd() {
  if (_bd) return _bd;
  _bd = new Promise((ok, ko) => {
    if (!window.indexedDB) return ko(new Error('IndexedDB indisponible'));
    const r = indexedDB.open('naostudy-fichiers', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('f');
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  });
  return _bd;
}
const tx = (mode, f) => bd().then(b => new Promise((ok, ko) => { const t = b.transaction('f', mode), s = t.objectStore('f'), r = f(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); }));
const fichierPoser = (id, blob) => tx('readwrite', s => s.put(blob, id));
const fichierLire = id => tx('readonly', s => s.get(id));
const fichierOter = id => tx('readwrite', s => s.delete(id));
const fichiersVider = () => tx('readwrite', s => s.clear());
const fichiersTous = () => tx('readonly', s => s.getAllKeys()).then(ks => Promise.all((ks || []).map(k => fichierLire(k).then(b => [k, b]))));
const taille = o => o < 1024 ? o + ' o' : o < 1048576 ? Math.round(o / 1024) + ' Ko' : (o / 1048576).toFixed(1).replace('.', ',') + ' Mo';
const blobEnTexte = b => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
const texteEnBlob = u => fetch(u).then(r => r.blob());

/* ---------- messages ---------- */
function toast(texte, o = {}) {
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = `<span>${texte}</span>` + (o.action ? `<button type="button">${esc(o.action)}</button>` : '');
  if (o.action) t.querySelector('button').addEventListener('click', () => { o.faire && o.faire(); t.remove(); });
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), o.duree || (o.action ? 7000 : 3600));
}

/* ---------- la fenêtre ---------- */
let apresFermeture = null;
function ouvrirModale(html, apres, large) {
  const v = $('#modale'), f = $('#modaleFen');
  f.className = 'fen' + (large ? ' large' : '');
  f.innerHTML = html; v.classList.add('ouvert'); document.body.style.overflow = 'hidden';
  v.scrollTop = 0;
  if (apres) apres(f);
  const p = f.querySelector('[autofocus], input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=color]), select, textarea');
  if (p) setTimeout(() => p.focus({ preventScroll: true }), 30);
}
function fermerModale() {
  $('#modale').classList.remove('ouvert'); $('#modaleFen').innerHTML = ''; document.body.style.overflow = '';
  if (apresFermeture) { const f = apresFermeture; apresFermeture = null; f(); }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) fermerModale(); });
$('#modale').addEventListener('mousedown', e => { if (e.target.id === 'modale') fermerModale(); });

/* Une question claire avant tout geste qui ne se rattrape pas. */
function confirmer(titre, texte, libelle = 'Confirmer', danger = true) {
  return new Promise(ok => {
    let rep = false;
    ouvrirModale(`<h3 id="modaleTitre">${esc(titre)}</h3><p class="sous">${texte}</p>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="non">Annuler</button>
      <button type="button" class="btn ${danger ? 'danger' : ''}" data-f="oui">${esc(libelle)}</button></div></div>`, f => {
      f.querySelector('[data-f="non"]').addEventListener('click', fermerModale);
      f.querySelector('[data-f="oui"]').addEventListener('click', () => { rep = true; fermerModale(); });
      setTimeout(() => f.querySelector('[data-f="non"]').focus(), 40);
    });
    apresFermeture = () => ok(rep);
  });
}

/* Lire un formulaire en objet (cases à cocher multiples → tableaux). */
function lireForm(form) {
  const o = {};
  $$('input, select, textarea', form).forEach(el => {
    if (!el.name) return;
    if (el.type === 'checkbox') { if (el.dataset.multi) { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
    else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else if (el.type !== 'file') o[el.name] = el.value.trim();
  });
  return o;
}

/* ---------- le code parent ----------
   Un code (4 à 8 chiffres) dont on ne garde que l'empreinte (SHA-256 salée).
   C'est un rideau de confidentialité entre les profils du foyer, pas un chiffrement :
   quelqu'un qui a les droits de l'ordinateur peut toujours lire la mémoire du navigateur. */
async function empreinte(code, sel) {
  const b = new TextEncoder().encode(sel + ':' + code);
  if (window.crypto && crypto.subtle) { const h = await crypto.subtle.digest('SHA-256', b); return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join(''); }
  let h = 0; for (const x of b) h = (h * 31 + x) | 0; return 'x' + h;   /* page ouverte hors contexte sécurisé : empreinte simple */
}
async function poserCodeParent(code) { const sel = uid(); S.reglages.codeParent = code ? { sel, h: await empreinte(code, sel) } : null; sauver(); }
async function codeParentJuste(code) { const c = S.reglages.codeParent; return !c || (await empreinte(code, c.sel)) === c.h; }
let parentDeverrouille = false;
/* Demande le code parent s'il existe (une fois par ouverture de NaoStudy). */
function exigerParent(raison) {
  if (!S.reglages.codeParent || parentDeverrouille) return Promise.resolve(true);
  return new Promise(ok => {
    let rep = false;
    ouvrirModale(`<h3 id="modaleTitre"><span>👪</span>Code parent</h3><p class="sous">${esc(raison)}</p>
      <form data-local="1" autocomplete="off"><div class="champ"><input name="code" type="password" inputmode="numeric" maxlength="8" placeholder="• • • •" aria-label="Code parent" style="text-align:center;font-size:22px;letter-spacing:.4em"></div>
      <div class="verrou-err" id="errCode" aria-live="polite"></div>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="non">Annuler</button><button class="btn" type="submit">Valider</button></div></div></form>`, f => {
      $('[data-f="non"]', f).addEventListener('click', fermerModale);
      $('form', f).addEventListener('submit', async e => {
        e.preventDefault();
        if (await codeParentJuste(e.target.code.value)) { parentDeverrouille = true; rep = true; fermerModale(); }
        else { $('#errCode', f).textContent = 'Ce n’est pas le bon code.'; e.target.code.value = ''; }
      });
    });
    apresFermeture = () => ok(rep);
  });
}

/* ---------- copier un texte (pour NaoAgenda, NaoDaily…) ---------- */
function copier(t) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(() => true, () => copierVieux(t));
  return Promise.resolve(copierVieux(t));
}
function copierVieux(t) {
  const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} a.remove(); return ok;
}
