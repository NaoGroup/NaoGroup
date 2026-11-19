/* ============================================================
   NaoInvest — le cœur : état, dates, progression, quiz, simulation,
   fenêtre et messages.
   ============================================================ */
const CLE = 'naoinvest.donnees';
const CLE_THEME = 'naoinvest.theme';
const CLE_CALME = 'naoinvest.calme';
const DEPART = 10000;          /* le solde virtuel de départ, en NaoCoins */
const SEUIL = 70;              /* une leçon est « acquise » à partir de 70/100 */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const auj = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
/* une date « AAAA-MM-JJ » ou seulement « AAAA-MM » (quand on ne connaît que le mois) */
function dateLongue(iso) {
  if (!iso) return '';
  const [a, m, j] = iso.split('-').map(Number);
  return j ? `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}` : `${MOIS[m - 1]} ${a}`;
}
const nb = (n, dec = 0) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const nc = n => `${nb(Math.round(n))} NaoCoins`;
const pct = (n, dec = 1) => `${n > 0 ? '+' : ''}${nb(n, dec)} %`;
function joursEntre(a, b) { return Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5); }
function semaineISO(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const j = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - j);
  const debut = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-S${String(Math.ceil(((t - debut) / 864e5 + 1) / 7)).padStart(2, '0')}`;
}
function hachage(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }
const duJour = (liste, sel = '') => liste[hachage(auj() + sel) % liste.length];

/* ============================================================
   L'état
   ============================================================ */
function nouvelleSim() {
  return { id: uid(), cree: new Date().toISOString(), rep: null, etapes: [], journal: [], scenarios: [] };
}
function vierge() {
  return {
    v: 1,
    prenom: '',
    lecons: {},              /* id → { score, date, essais, meilleur } */
    quizMix: [],             /* derniers quiz mélangés : { date, score } */
    favoris: [],
    lues: [],
    actusPerso: [],
    sim: nouvelleSim(),
    simArchives: [],
    objectif: { parcours: '', rythme: 3 },
    defis: {},               /* semaine → true */
    checklist: {},
    attestations: {},        /* parcours → date */
    badges: {},              /* badge → date d'obtention */
    derniere: ''
  };
}
let S = charger();
function charger() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (d && d.v) { const v = vierge(); return Object.assign(v, d, { sim: Object.assign(nouvelleSim(), d.sim || {}) }); }
  } catch (e) {}
  return vierge();
}
function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(S)); }
  catch (e) { toast('Impossible d’enregistrer : la mémoire du navigateur est pleine ou bloquée.'); }
}

/* ============================================================
   Leçons et progression
   ============================================================ */
const lecon = id => LECONS.find(l => l.id === id);
const etatLecon = id => S.lecons[id] || null;
const acquise = id => { const e = etatLecon(id); return !!e && e.meilleur >= SEUIL; };
const aRevoir = id => { const e = etatLecon(id); return !!e && e.score < SEUIL; };
const faites = () => LECONS.filter(l => acquise(l.id));
function progressionParcours(p) {
  const n = p.lecons.filter(acquise).length;
  return { n, total: p.lecons.length, pct: Math.round(n / p.lecons.length * 100), fini: n === p.lecons.length };
}
function progressionNiveau(niv) {
  const l = LECONS.filter(x => x.niv === niv), n = l.filter(x => acquise(x.id)).length;
  return { n, total: l.length, pct: Math.round(n / l.length * 100) };
}
/* le niveau atteint : on franchit une étape quand la précédente est acquise aux deux tiers */
function niveauActuel() {
  let niv = 1;
  for (const N of NIVEAUX) { if (N.n > 1 && progressionNiveau(N.n - 1).pct >= 66) niv = N.n; }
  return NIVEAUX[niv - 1];
}
const niveauOuvert = n => n === 1 || progressionNiveau(n - 1).pct >= 66;
/* à revoir : ratées, puis acquises depuis longtemps (révision espacée) */
function aRevoirAujourdhui() {
  const ratees = LECONS.filter(l => aRevoir(l.id));
  const anciennes = LECONS.filter(l => acquise(l.id) && joursEntre(S.lecons[l.id].date, auj()) >= 14)
    .sort((a, b) => S.lecons[a.id].date.localeCompare(S.lecons[b.id].date));
  return { ratees, anciennes };
}
/* la leçon du jour : la suite de l'objectif, sinon une leçon à revoir, sinon la suite du chemin */
function leconDuJour() {
  const p = PARCOURS.find(x => x.id === S.objectif.parcours);
  if (p) { const s = p.lecons.find(id => !acquise(id)); if (s) return { l: lecon(s), pourquoi: `Suite de votre objectif « ${p.nom} »` }; }
  const r = aRevoirAujourdhui().ratees[0];
  if (r) return { l: r, pourquoi: 'Une notion à consolider' };
  const suite = LECONS.slice().sort((a, b) => a.niv - b.niv).find(l => !acquise(l.id));
  if (suite) return { l: suite, pourquoi: `Prochaine étoile de l’étape « ${NIVEAUX[suite.niv - 1].nom} »` };
  return { l: duJour(LECONS, 'lecon'), pourquoi: 'Tout est acquis : une révision au hasard ✨' };
}

/* ---------- Badges ---------- */
function simEtapesMax() { return Math.max(S.sim.etapes.length, ...S.simArchives.map(a => a.etapes || 0), 0); }
function badgeObtenu(b) {
  if (b.min && faites().length < b.min) return false;
  if (b.defi && Object.keys(S.defis).length < b.defi) return false;
  if (b.sim && simEtapesMax() < b.sim) return false;
  if (b.checklist && CHECKLIST.some((_, i) => !S.checklist[i])) return false;
  return b.lecons.every(id => { const e = etatLecon(id); return e && e.meilleur >= (b.note || SEUIL); });
}
/* note les nouveaux badges ; renvoie ceux qui viennent d'être gagnés */
function verifierBadges() {
  const nouveaux = [];
  BADGES.forEach(b => { if (!S.badges[b.id] && badgeObtenu(b)) { S.badges[b.id] = auj(); nouveaux.push(b); } });
  PARCOURS.forEach(p => { if (!S.attestations[p.id] && progressionParcours(p).fini) S.attestations[p.id] = auj(); });
  return nouveaux;
}

/* ============================================================
   Quiz : une note sur 100, et une explication pour chaque erreur
   ============================================================ */
function lireNombre(v) { return parseFloat(String(v).replace(/\s/g, '').replace(',', '.').replace(/[^\d.+-]/g, '')); }
function corriger(questions, reponses) {
  const det = questions.map((q, i) => {
    const r = reponses[i];
    let juste;
    if (q.n !== undefined) { const v = lireNombre(r); juste = !isNaN(v) && Math.abs(v - q.n) <= (q.tol || 0) + 1e-9; }
    else juste = +r === q.b;
    return { q, r, juste };
  });
  const score = Math.round(det.filter(d => d.juste).length / questions.length * 100);
  return { score, det };
}
function messageNote(score) {
  if (score === 100) return 'Parfait ! Toutes les réponses sont justes. 🌟';
  if (score >= 80) return 'Très bien : la notion est comprise. Un petit détour par les explications ci-dessous, et c’est complet.';
  if (score >= SEUIL) return 'C’est acquis ! Quelques points méritent un second regard : les explications sont juste en dessous.';
  if (score >= 40) return 'Vous êtes sur la bonne voie. Relisez les explications ci-dessous puis refaites le quiz : c’est comme ça qu’on apprend.';
  return 'Pas d’inquiétude : cette notion est nouvelle, c’est normal. Relisez la leçon tranquillement, puis réessayez — chaque essai compte.';
}
function enregistrerLecon(id, score) {
  const e = S.lecons[id] || { essais: 0, meilleur: 0 };
  S.lecons[id] = { score, date: auj(), essais: e.essais + 1, meilleur: Math.max(e.meilleur || 0, score) };
  S.derniere = id;
  const nouveaux = verifierBadges(); sauver();
  return nouveaux;
}

/* ============================================================
   La simulation : un modèle volontairement simple et fictif
   ============================================================ */
function hasardNormal() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const valeurSim = parts => ACTIFS.reduce((t, a) => t + (parts[a.id] || 0), 0);
function etatSim() {
  const sim = S.sim;
  if (!sim.rep) return null;
  const derniere = sim.etapes[sim.etapes.length - 1];
  const parts = derniere ? derniere.parts : Object.fromEntries(ACTIFS.map(a => [a.id, DEPART * (sim.rep[a.id] || 0) / 100]));
  const prix = derniere ? derniere.prix : 1;
  return { parts, prix, valeur: valeurSim(parts), reel: valeurSim(parts) / prix };
}
/* une étape : soit une année « ordinaire » tirée au hasard, soit un scénario choisi */
function avancer(scenarioId) {
  const e = etatSim(); if (!e) return null;
  const sc = SCENARIOS.find(s => s.id === scenarioId);
  const var_ = {}, parts = {};
  ACTIFS.forEach(a => {
    let r = sc ? sc.imp[a.id] / 100 : a.mu + a.sig * hasardNormal();
    r = Math.max(-.6, Math.min(.8, r));
    var_[a.id] = r; parts[a.id] = e.parts[a.id] * (1 + r);
  });
  const infl = sc ? sc.infl : Math.max(0, .02 + .01 * hasardNormal());
  const et = { n: S.sim.etapes.length + 1, sc: sc ? sc.id : '', var: var_, parts, prix: e.prix * (1 + infl), infl, date: auj() };
  S.sim.etapes.push(et);
  if (sc) S.sim.scenarios.push(sc.id);
  S.sim.journal.push({ id: uid(), date: auj(), etape: et.n, auto: true, texte: expliquerEtape(et, e.valeur) });
  return et;
}
/* Une explication pédagogique de ce qui vient de se passer — jamais une consigne. */
function expliquerEtape(et, avant) {
  const apres = valeurSim(et.parts), delta = (apres / avant - 1) * 100;
  const sc = SCENARIOS.find(s => s.id === et.sc);
  const detenus = ACTIFS.filter(a => (S.sim.etapes.length > 1 ? S.sim.etapes[S.sim.etapes.length - 2].parts : etatSim0())[a.id] > 0);
  const tri = detenus.slice().sort((a, b) => et.var[b.id] - et.var[a.id]);
  const hautBas = tri.length > 1 ? ` Le support qui a le plus progressé : ${tri[0].court} (${pct(et.var[tri[0].id] * 100)}) ; celui qui a le plus reculé : ${tri[tri.length - 1].court} (${pct(et.var[tri[tri.length - 1].id] * 100)}).` : '';
  const concentre = detenus.length === 1 && detenus[0].id !== 'cash' ? ' Tout est placé sur un seul support : sa variation est celle de tout le portefeuille — c’est l’inverse de la diversification.' : '';
  const infl = ` Inflation simulée : ${pct(et.infl * 100)} — chaque NaoCoin achète un peu moins.`;
  return `${sc ? `${sc.e} ${sc.nom}. ${sc.txt}` : '🎲 Une année simulée au hasard, dans un modèle volontairement simplifié.'} Votre portefeuille fictif varie de ${pct(delta)}.${hautBas}${concentre}${infl}`;
}
function etatSim0() { return Object.fromEntries(ACTIFS.map(a => [a.id, DEPART * ((S.sim.rep || {})[a.id] || 0) / 100])); }
function statsSim(sim) {
  const vals = [DEPART].concat(sim.etapes.map(e => valeurSim(e.parts)));
  let pic = vals[0], pire = 0;
  vals.forEach(v => { pic = Math.max(pic, v); pire = Math.min(pire, (v / pic - 1) * 100); });
  const fin = vals[vals.length - 1], prix = sim.etapes.length ? sim.etapes[sim.etapes.length - 1].prix : 1;
  return { vals, fin, reel: fin / prix, pire, delta: (fin / DEPART - 1) * 100, bas: Math.min(...vals), haut: Math.max(...vals) };
}

/* ============================================================
   Messages, fenêtre, confirmation
   ============================================================ */
function toast(texte, o = {}) {
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = `<span>${esc(texte)}</span>` + (o.action ? `<button type="button">${esc(o.action)}</button>` : '');
  if (o.action) t.querySelector('button').addEventListener('click', () => { t.remove(); o.fait && o.fait(); });
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), o.duree || (o.action ? 7000 : 3400));
}
let apresFermeture = null;
function ouvrirModale(html, apres, large) {
  const v = $('#modale'), f = $('#modaleFen');
  f.className = 'fen' + (large ? ' large' : '');
  f.innerHTML = html; v.classList.add('ouvert'); document.body.style.overflow = 'hidden';
  $$('[data-f="annuler"]', f).forEach(b => b.addEventListener('click', fermerModale));
  if (apres) apres(f);
  const p = f.querySelector('[autofocus], input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea');
  if (p) setTimeout(() => p.focus(), 30);
}
function fermerModale() {
  $('#modale').classList.remove('ouvert'); $('#modaleFen').innerHTML = ''; document.body.style.overflow = '';
  if (apresFermeture) { const f = apresFermeture; apresFermeture = null; f(); }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) fermerModale(); });
$('#modale').addEventListener('click', e => { if (e.target.id === 'modale') fermerModale(); });
function confirmer(titre, texte, libelle = 'Confirmer', danger = true) {
  return new Promise(ok => {
    let rep = false;
    apresFermeture = () => ok(rep);
    ouvrirModale(`<h3 id="modaleTitre">${esc(titre)}</h3><p class="sous">${texte}</p>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn ${danger ? 'danger' : ''}" data-f="oui">${esc(libelle)}</button></div></div>`, f => {
      f.querySelector('[data-f="oui"]').addEventListener('click', () => { rep = true; fermerModale(); });
    });
  });
}

/* ---------- la petite fête douce, après une leçon réussie ---------- */
function celebrer(texte) {
  const d = document.createElement('div'); d.className = 'fete'; d.setAttribute('aria-hidden', 'true');
  let h = '';
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 170;
    h += `<i style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r - 40).toFixed(0)}px;--d:${(Math.random() * .25).toFixed(2)}s;--s:${(.6 + Math.random() * .9).toFixed(2)}">${['✦', '★', '✧', '•'][i % 4]}</i>`;
  }
  d.innerHTML = h + (texte ? `<b>${esc(texte)}</b>` : '');
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}
