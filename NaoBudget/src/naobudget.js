/* ============================================================
   NaoBudget — suite Nao
   100 % local : rien ne sort de cet ordinateur.
   ============================================================ */

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MSHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MEMO   = ['❄️','💝','🌱','🌷','🌸','☀️','🏖️','🌻','🍂','🎃','🌧️','🎄'];
const DOW    = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const PALETTE = ['var(--s1)','var(--s2)','var(--s3)','var(--s4)','var(--s5)','var(--s6)','var(--s7)','var(--s8)',
                 'var(--accent-3)','var(--accent-2)','#8fb8a0','#e0c08a','#8aa8d6','#c7a6dd','#79c3bd','#e3a3a3'];
const STORE = 'naobudget.v1';


/* Statuts d'une case. Une dépense se paie ou se fait rejeter ; une rentrée,
   elle, est attendue puis encaissée — elle ne peut pas être « rejetée ». */
const ST_ICON = { '': '○', p: '✅', r: '❌' };
const ST_NAME = { '': 'inscrit', p: 'payé', r: 'rejeté' };
const ST_NEXT = { '': 'p', p: 'r', r: '' };
const ST_ICON_REV = { '': '○', p: '💰', r: '❌' };
const ST_NAME_REV = { '': 'attendu', p: 'encaissé', r: 'non reçu' };
const ST_NEXT_REV = { '': 'p', p: '', r: '' };
const stIcon = (st, rev) => (rev ? ST_ICON_REV : ST_ICON)[st || ''];
const stNom = (st, rev) => (rev ? ST_NAME_REV : ST_NAME)[st || ''];

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const z12 = () => new Array(12).fill(0);
const e12 = () => new Array(12).fill('');
const sum = a => a.reduce((x, y) => x + y, 0);

/* ---------- Format ---------- */
const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const money = n => nf.format(n || 0) + ' €';
const money0 = n => nf0.format(n || 0) + ' €';
function parseNum(s) {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  let t = String(s).replace(/[\s  €]/g, '').replace(/,/g, '.');
  if ((t.match(/\./g) || []).length > 1) { const i = t.lastIndexOf('.'); t = t.slice(0, i).replace(/\./g, '') + t.slice(i); }
  const n = parseFloat(t);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Infobulles des graphiques ----------
   Lire un montant sur l'axe de gauche n'est jamais précis : chaque point,
   chaque barre et chaque part de camembert porte donc son chiffre exact,
   qui s'affiche au survol. Le contenu voyage dans un attribut, séparé par
   deux caractères qu'on retire des libellés pour ne rien casser. */
const tipTxt = s => esc(String(s == null ? '' : s).replace(/[¦§]/g, ' '));
function tipAttr(titre, lignes) {
  return 'data-tip="' + tipTxt(titre)
    + lignes.filter(Boolean).map(l => '¦' + tipTxt(l[0]) + '§' + tipTxt(l[1]) + '§' + (l[2] || '')).join('') + '"';
}

/* ============================================================
   Émojis
   ============================================================ */
const EMOJI_GUESS = [
  [/loyer|logement|appart|maison/, '🏠'], [/electric|edf|energie/, '⚡'], [/gaz|chauffage/, '🔥'],
  [/eau /, '💧'], [/internet|box|wifi|fibre/, '📶'], [/mobile|telephone|forfait/, '📱'],
  [/assurance hab/, '🏡'], [/assurance auto|assurance voiture/, '🚙'], [/assurance/, '🛡️'],
  [/mutuelle|sante|medecin|pharma/, '💊'], [/impot|fisc|taxe|prelevement a la source/, '🏛️'],
  [/carburant|essence|diesel|gazole/, '⛽'], [/parking/, '🅿️'], [/peage/, '🛣️'],
  [/transport|metro|bus|train|navigo/, '🚇'], [/voiture|auto|garage|reparation/, '🚗'],
  [/salaire|paie|paye/, '💰'], [/prime|bonus/, '🎉'], [/rembours|trop.per/, '↩️'],
  [/virement|tiers/, '🔁'], [/epargne|livret|lcl|abondement/, '🐖'], [/credit|pret|emprunt/, '🏦'],
  [/carte|cb |banque|frais banc/, '💳'], [/course|alimentaire|supermarche|drive/, '🛒'],
  [/restaurant|resto|bar |brasserie/, '🍽️'], [/cafe|starbucks/, '☕'], [/cadeau|noel|anniversaire/, '🎁'],
  [/vetement|habit|chaussure/, '👗'], [/esthetique|coiffeur|ongle|beaute/, '💅'], [/sport|salle|gym|fitness/, '🏋️'],
  [/vacance|voyage|hotel|avion|billet/, '✈️'], [/spectacle|concert|cinema|theatre/, '🎭'],
  [/livre|musique|jeu|netflix|spotify|deezer/, '🎵'], [/apple music/, '🎧'], [/icloud|cloud|stockage/, '☁️'],
  [/duolingo/, '🦉'], [/claude|chatgpt|\bia\b|intelligence art/, '🤖'], [/abonnement|souscription/, '🔄'],
  [/amende|contravention|pv /, '⚖️'], [/fraude|litige|arnaque/, '🚨'], [/imprimante|materiel|informatique/, '🖨️'],
  [/belgique|etranger/, '🌍'], [/animal|chat|chien|veto/, '🐾'], [/enfant|bebe|creche|ecole|scolaire/, '🧸'],
  [/casquette|gucci|luxe/, '🧢'], [/don|charite|association/, '💝'], [/menage|entretien|nettoyage/, '🧹']
];
const EMOJI_LIST = ('💰 💶 💵 💳 🏦 🧾 📈 📉 🐖 🎁 🎉 ✨ 🏠 🏡 🔑 ⚡ 🔥 💧 💡 🛋️ 🧹 🛡️ 📄 📌 🚗 🚙 ⛽ 🅿️ 🛣️ 🚇 ' +
  '🚆 ✈️ 🛳️ 🔧 📱 📶 💻 🖨️ ☁️ 🎵 🎧 🎬 🎮 📚 🦉 🤖 🔄 🛒 🥖 🥕 🍽️ ☕ 🍺 🍫 👗 👕 👟 👜 💄 💅 ✂️ 💊 🩺 ❤️‍🩹 🏋️ ⚽ 🏖️ ' +
  '🎭 🎟️ 🐾 🧸 🎓 ⚖️ 🏛️ 📊 💼 🚨 💎 🌿 🎂 📦 🔔 ⭐ 🌍 🧢 💝 ↩️ 🔁 🕯️ 🧴 🪴').split(' ').filter(Boolean);

const noAcc = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function guessEmoji(label, kind) {
  const t = noAcc(label);
  for (const [re, em] of EMOJI_GUESS) if (re.test(t)) return em;
  return kind === 'rev' ? '💶' : kind === 'var' ? '🛍️' : '📄';
}
const emojiOf = (l, kind) => (l.e !== undefined && l.e !== null) ? l.e : guessEmoji(l.label, kind);

/* ============================================================
   Données de départ (reprises du fichier Excel 2026)
   ============================================================ */
function ln(label, day, obj) {
  const v = z12();
  for (const k in obj) v[+k - 1] = obj[k];
  return { id: uid(), label, day: day || null, v, s: e12() };
}
function blankYear() {
  return {
    revenus: [ln('Salaire', 28, {}), ln('Primes', null, {}), ln('Autres revenus', null, {})],
    fixes: [
      { id: uid(), name: 'Logement', lines: [ln('Loyer', 5, {}), ln('Électricité', 15, {}), ln('Assurance habitation', 10, {})] },
      { id: uid(), name: 'Transport', lines: [ln('Assurance auto', 8, {}), ln('Carburant', null, {})] },
      { id: uid(), name: 'Impôts', lines: [ln('Impôt sur le revenu', 15, {})] },
      { id: uid(), name: 'Abonnements et cotisations', lines: [ln('Forfait mobile', 2, {}), ln('Box internet', 12, {})] }
    ],
    variables: [ln('Courses alimentaires', null, {}), ln('Vêtements', null, {}), ln('Loisirs / sorties', null, {})]
  };
}
function seed2026() {
  return {
    revenus: [
      ln('Salaire', 28, { 1: 1973.04, 2: 2086.00, 3: 2242.71, 4: 1801.11, 5: 1977.85, 6: 1843.27, 7: 1822.83, 8: 3268.76 }),
      ln('Virement tiers', null, {}),
      ln('Primes', null, { 2: 156.00, 4: 4705.01, 5: 217.22, 8: 100.00 }),
      ln('Remboursement (fraude, trop-perçu…)', null, { 2: 25.00, 5: 135.00 }),
      ln('Abondement LCL épargne', null, { 4: 655.00 }),
      ln('Casquette GUCCI Naïm', null, { 5: 50, 6: 50, 7: 50, 8: 50 }),
      ln('Amende Sandra', null, { 8: 35.00 }),
      ln('Voiture VEI', null, { 8: 1340.00 })
    ],
    fixes: [
      { id: uid(), name: 'Logement', lines: [
        ln('Loyer (eau chaude/froide et chauffage)', 5, { 1: 518.50, 2: 518.50, 3: 518.50, 4: 518.50, 5: 518.50, 6: 523.50, 7: 521.97, 8: 521.97, 9: 521.97, 10: 521.97, 11: 521.97, 12: 521.97 }),
        ln('Électricité', 15, { 1: 33, 2: 33, 3: 33, 4: 33, 10: 14.58, 11: 23.36, 12: 23.36 }),
        ln('Assurance PJ', 10, { 1: 7.64, 2: 7.64, 3: 7.64, 4: 7.64, 5: 7.64, 6: 7.64, 7: 7.64, 8: 7.90, 9: 7.95, 10: 7.95, 11: 7.95, 12: 7.95 }),
        ln('Assurance habitation', 10, { 1: 13.29, 2: 13.29, 3: 13.29, 4: 13.29, 5: 14.15, 6: 14.15, 7: 14.14, 8: 14.14, 9: 14.14, 10: 14.14, 11: 14.14, 12: 14.14 })
      ]},
      { id: uid(), name: 'Transport', lines: [
        ln('Abonnement parking', 3, { 1: 18, 2: 18, 3: 18, 4: 18.10, 5: 18.10, 6: 18.10, 7: 18.10, 8: 18.10, 9: 18.10, 10: 18.10, 11: 18.10, 12: 18.10 }),
        ln('Assurance auto', 8, { 1: 80.80, 2: 80.80, 3: 87.30, 4: 88.30, 5: 92.09, 6: 92.09, 7: 92.09, 8: 92.09, 9: 92.09, 10: 45.95, 11: 45.95, 12: 45.95 }),
        ln('Carburant', null, { 1: 100, 2: 30, 3: 127.07, 4: 169.47, 5: 20.02, 6: 50.01, 7: 70.10, 9: 30.04 }),
        ln('Péage', null, { 6: 10.50, 7: 70.01 }),
        ln('Transports en commun', 1, { 6: 90.80, 7: 90.80, 9: 90.80, 10: 90.80, 11: 90.80, 12: 90.80 })
      ]},
      { id: uid(), name: 'Impôts', lines: [
        ln('Impôt sur le revenu', 15, { 9: 223, 10: 223, 11: 223, 12: 225 }),
        ln('Prélèvement à la source', 15, { 3: 96.69, 4: 78.44, 5: 85.18, 6: 77.68, 7: 77.68 }),
        ln('Taxe d’habitation / taxe foncière', null, {})
      ]},
      { id: uid(), name: 'Abonnements et cotisations', lines: [
        ln('Mutuelle', 5, { 1: 7.58, 2: 7.73, 3: 7.73, 4: 7.73, 5: 7.73, 6: 7.73, 7: 7.73, 8: 7.73, 9: 7.73, 10: 7.73, 11: 7.73, 12: 7.73 }),
        ln('Box internet TV téléphone', 12, { 1: 35, 2: 45, 3: 45, 4: 35, 5: 35, 6: 35, 7: 35, 8: 35, 9: 35, 10: 35, 11: 35, 12: 35 }),
        ln('Forfait mobile', 2, { 1: 9.99, 2: 9.99, 3: 9.99, 4: 9.99, 5: 9.99, 6: 9.99, 7: 9.99, 8: 9.99, 9: 9.99, 10: 9.99, 11: 9.99, 12: 9.99 }),
        ln('Carte bleue et AMP', 6, { 1: 2.10, 2: 2.10, 3: 2.10, 4: 2.10, 5: 2.10, 6: 2.10, 7: 2.80, 8: 2.80, 9: 2.80, 10: 2.80, 11: 2.80, 12: 2.80 }),
        ln('FLO Appli Règle', 20, { 6: 39.99 }),
        ln('Assurance AAV', 8, { 1: 18.90, 2: 18.90, 3: 18.90, 4: 18.90, 5: 18.90, 6: 18.90, 7: 15.47, 8: 15.47, 9: 15.47, 10: 15.47, 11: 15.47, 12: 15.47 }),
        ln('Assurance ATM', 8, { 1: 8.91, 2: 8.91, 3: 8.91, 4: 8.91, 5: 8.91, 6: 8.91, 7: 8.91, 8: 8.91, 9: 8.91, 10: 9.89, 11: 9.89, 12: 9.89 }),
        ln('Fraude', null, { 2: 25 }),
        ln('iCloud', 21, { 6: 9.99, 7: 9.99, 8: 9.99, 9: 9.99, 10: 9.99, 11: 9.99, 12: 9.99 }),
        ln('Apple Music', 14, { 7: 8.49, 8: 8.49, 9: 8.49, 10: 8.49, 11: 8.49, 12: 8.49 }),
        ln('Duolingo', 25, { 7: 25.99, 8: 25.99, 9: 25.99, 10: 25.99, 11: 25.99, 12: 25.99 }),
        ln('Claude IA', 18, { 8: 21.60 })
      ]}
    ],
    variables: [
      ln('Courses alimentaires', null, { 2: 72.25, 4: 65.00, 8: 43.71, 9: 269.00 }),
      ln('Courses non-alimentaires / matériel', null, { 6: 27.42, 8: 199.98 }),
      ln('Cadeaux', null, { 2: 78.46, 3: 295.00, 6: 140.00, 7: 100.00, 8: 154.94 }),
      ln('Réparation voiture', null, { 6: 31.90, 7: 490.91 }),
      ln('Livres / musique / jeux', null, { 7: 11.60 }),
      ln('Vêtements', null, { 6: 114.99, 7: 69.20 }),
      ln('Frais de santé', null, { 2: 46.11, 4: 32.98, 5: 24.98 }),
      ln('Restaurants / bars', null, { 8: 40.00 }),
      ln('Spectacles / concerts', null, {}),
      ln('Esthétique', null, { 6: 35.00, 7: 99.00 }),
      ln('Sport', null, {}),
      ln('Vacances / voyages', null, { 3: 280.50, 5: 90.00, 6: 95.16, 8: 350.00 }),
      ln('Amendes / factures', null, { 1: 90.00, 2: 35.00, 8: 35.00 }),
      ln('Imprimante', null, {}),
      ln('Épargne bloquée LCL', null, { 4: 5360.01 }),
      ln('Belgique', null, { 6: 221.79 })
    ]
  };
}

/* ============================================================
   État
   ============================================================ */
let state = load();
let view = 'annuel';
let selMonth = (new Date()).getMonth();
let moisTri = 'montant';   /* ordre d'affichage dans la vue « Le mois » */
let saveTimer = null;

function migrate(s) {
  Object.values(s.years || {}).forEach(y => {
    const fix = l => { if (!Array.isArray(l.s) || l.s.length !== 12) l.s = e12(); if (!Array.isArray(l.v) || l.v.length !== 12) l.v = z12(); };
    (y.revenus || []).forEach(fix);
    (y.fixes || []).forEach(c => (c.lines || []).forEach(fix));
    (y.variables || []).forEach(fix);
  });
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) { const s = JSON.parse(raw); if (s && s.years) return migrate(s); }
  } catch (e) { console.warn('Lecture impossible', e); }
  /* Un profil NaoGroup (hors administratrice) démarre sur une année vierge, jamais sur le jeu d'exemple. */
  if (window.NaoCtx && window.NaoCtx.vierge) { const an = new Date().getFullYear(); return { version: 2, activeYear: an, years: { [an]: blankYear() } }; }
  return { version: 2, activeYear: 2026, years: { 2026: seed2026() } };
}
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (e) { toast('💾 Sauvegarde impossible (espace navigateur plein)'); }
  }, 250);
}
function Y() {
  const k = String(state.activeYear);
  if (!state.years[k]) state.years[k] = blankYear();
  return state.years[k];
}
/* Le rechargement est isolé dans sa fonction : on peut ainsi vérifier la
   remise à zéro sans que la page parte se recharger au milieu du test. */
function rechargePage() { location.reload(); }
/* Écriture immédiate : avant un rechargement de page, on ne peut pas
   attendre l'enregistrement différé. */
function saveNow() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
}

/* ---------- Calculs ---------- */
const monthsOf = lines => { const t = z12(); lines.forEach(l => l.v.forEach((x, i) => t[i] += (+x || 0))); return t; };
function calc() {
  const y = Y();
  const inc = monthsOf(y.revenus);
  const cats = y.fixes.map(c => { const m = monthsOf(c.lines); return { id: c.id, name: c.name, m, total: sum(m) }; });
  const fix = z12(); cats.forEach(c => c.m.forEach((x, i) => fix[i] += x));
  const vr = monthsOf(y.variables);
  const rest1 = inc.map((x, i) => x - fix[i]);
  const rest2 = inc.map((x, i) => x - fix[i] - vr[i]);
  return { inc, fix, vr, cats, rest1, rest2,
    tInc: sum(inc), tFix: sum(fix), tVar: sum(vr), tR1: sum(rest1), tR2: sum(rest2) };
}
const lineTotal = l => sum(l.v.map(x => +x || 0));

/* ---------- Détail d'une case ----------
   Une case peut contenir plusieurs dépenses (trois passages au supermarché,
   par exemple). Chacune porte une date, un lieu, un montant et la part qui
   est à ma charge (100 % si j'ai tout payé, 50 % si on a partagé).
   La case vaut alors la somme des parts à ma charge. */
const itemsOf = (l, m) => (l.d && l.d[m]) ? l.d[m] : null;
const itemMine = it => Math.round((+it.amt || 0) * (+it.q || 0)) / 100;
function recalcCell(l, m) {
  const it = itemsOf(l, m);
  if (!it) return;
  if (!it.length) { delete l.d[m]; return; }
  l.v[m] = Math.round(it.reduce((s, x) => s + itemMine(x), 0) * 100) / 100;
}
function allLines(kind) {
  const y = Y();
  if (kind === 'rev') return y.revenus;
  if (kind === 'var') return y.variables;
  if (kind === 'fix') return y.fixes.flatMap(c => c.lines);
  return [...y.revenus, ...y.fixes.flatMap(c => c.lines), ...y.variables];
}
/* ---------- Épargne ----------
   Une ligne peut être marquée « épargne » (🐖) : cet argent n'est pas perdu,
   il est mis de côté. Il est donc réintégré dans la courbe d'épargne cumulée.
   Par défaut la marque est devinée d'après le nom ; le bouton 🐖 de la ligne
   permet de forcer l'un ou l'autre. */
const SAV_RE = /epargne|livret|\bpel\b|\bpea\b|assurance vie|mise de cote|placement|tirelire/;
const isSavings = l => (l.ep === undefined || l.ep === null) ? SAV_RE.test(noAcc(l.label)) : !!l.ep;
function savingsMonths() {
  const y = Y(), t = z12();
  [...y.fixes.flatMap(c => c.lines), ...y.variables].forEach(l => {
    if (isSavings(l)) l.v.forEach((x, i) => t[i] += (+x || 0));
  });
  return t;
}
/* On ne compte que les dépenses : une rentrée ne se « paie » pas. */
function statCount(m) {
  let p = 0, r = 0, tot = 0, encaisse = 0, attendu = 0;
  [...allLines('fix'), ...allLines('var')].forEach(l => {
    if (+l.v[m]) { tot++; if (l.s[m] === 'p') p++; else if (l.s[m] === 'r') r++; }
  });
  allLines('rev').forEach(l => { if (+l.v[m]) { if (l.s[m] === 'p') encaisse++; else attendu++; } });
  return { p, r, tot, encaisse, attendu };
}

/* ============================================================
   Rendu
   ============================================================ */
const el = id => document.getElementById(id);

function render() {
  el('ylab').textContent = state.activeYear;
  renderKpis();
  const v = el('view');
  if (view === 'annuel') v.innerHTML = viewAnnuel();
  else if (view === 'mois') v.innerHTML = viewMois();
  else if (view === 'graph') v.innerHTML = viewGraph();
  else if (view === 'agenda') v.innerHTML = viewAgenda();
  else v.innerHTML = viewReglages();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
  if (view === 'annuel') formatAllCells();
  closePicker();
}

/* Les indicateurs sont construits une seule fois puis mis à jour sur place :
   sans cela, le moindre chiffre saisi faisait « sauter » toute la rangée. */
let kpiBuilt = false;
function renderKpis() {
  const box = el('kpis');
  if (!kpiBuilt) {
    box.innerHTML = `
      <div class="kpi k-in"><div class="lab"><span>💰</span> Total revenus</div>
        <div class="val" id="kv1">–</div><div class="sub" id="ks1"></div></div>
      <div class="kpi k-fix"><div class="lab"><span>🏠</span> Dépenses fixes</div>
        <div class="val" id="kv2">–</div><div class="sub" id="ks2"></div></div>
      <div class="kpi k-var"><div class="lab"><span>🛍️</span> Dépenses variables</div>
        <div class="val" id="kv3">–</div><div class="sub" id="ks3"></div></div>
      <div class="kpi k-res"><div class="lab"><span>🐖</span> Reste au total</div>
        <div class="val" id="kv4">–</div><div class="sub" id="ks4"></div></div>`;
    kpiBuilt = true;
    box.classList.add('intro');
    setTimeout(() => box.classList.remove('intro'), 900);
  }
  const c = calc(), tSav = sum(savingsMonths());
  const done = c.inc.filter(x => x > 0).length || 1;
  const st = statCount(selMonth);
  pose(el('kv1'), money(c.tInc));
  el('ks1').textContent = `≈ ${money0(c.tInc / done)} / mois sur ${done} mois`;
  pose(el('kv2'), money(c.tFix));
  el('ks2').textContent = `${c.tInc ? Math.round(c.tFix / c.tInc * 100) : 0} % des revenus`;
  pose(el('kv3'), money(c.tVar));
  el('ks3').textContent = `${c.tInc ? Math.round(c.tVar / c.tInc * 100) : 0} % des revenus`;
  const v4 = el('kv4');
  pose(v4, money(c.tR2));
  v4.classList.toggle('pos', c.tR2 >= 0);
  v4.classList.toggle('neg', c.tR2 < 0);
  el('ks4').textContent = (tSav ? `🐖 ${money0(tSav)} mis de côté · ` : '')
    + `${MONTHS[selMonth].toLowerCase()} : 💰 ${st.encaisse} encaissé(s) · ✅ ${st.p} payé(s) · ❌ ${st.r}`;
}

/* ============================================================
   VUE ANNUELLE
   ============================================================ */
const curM = () => (new Date()).getFullYear() === +state.activeYear ? (new Date()).getMonth() : -1;

function headRow() {
  const cm = curM();
  return `<tr>
    <th class="c-lab">Poste</th><th class="c-day" title="Jour de prélèvement">📅</th>
    ${MONTHS.map((m, i) => `<th class="${i === cm ? 'cur' : ''}" title="${m}">${MSHORT[i]}</th>`).join('')}
    <th class="c-tot">Total annuel</th></tr>`;
}
function rowHTML(l, path, kind) {
  const cm = curM();
  return `<tr class="row b-${kind}" data-path="${path}" data-id="${l.id}">
    <td class="c-lab"><div class="labwrap">
      <button class="emo" data-act="emoji" title="Changer l'émoji">${emojiOf(l, kind)}</button>
      <input class="lab-in" value="${esc(l.label)}" data-k="label" placeholder="Nom du poste">
      <button class="del" data-act="up" title="Monter">▲</button>
      <button class="del" data-act="down" title="Descendre">▼</button>
      <button class="del" data-act="fill" title="Recopier une case sur d'autres mois — montant, détail et parts compris">📋</button>
      ${kind === 'rev' ? '' : `<button class="del epg ${isSavings(l) ? 'on' : ''}" data-act="epargne"
        title="${isSavings(l) ? 'Compté comme épargne : ce montant remonte dans la courbe d’épargne. Cliquer pour enlever.' : 'Marquer comme épargne (argent mis de côté, pas dépensé)'}">🐖</button>`}
      <button class="del" data-act="delline" title="Supprimer la ligne">✕</button>
    </div></td>
    <td><input class="day-in" data-k="day" value="${l.day || ''}" placeholder="–" maxlength="2" title="Jour de prélèvement"></td>
    ${l.v.map((x, i) => {
      const st = l.s[i] || '';
      const it = itemsOf(l, i), nd = it ? it.length : 0;
      const rev = kind === 'rev';
      return `<td class="mcell ${i === cm ? 'cur' : ''}"><div class="cw ${st ? 'has' : ''}">
        <input class="cell ${rev ? 'entree' : ''} ${st ? 'st-' + st : ''} ${nd ? 'computed' : ''}" data-m="${i}" value="${x ? nf.format(x) : ''}"
          placeholder="–" ${nd ? 'readonly' : ''}
          title="${nd ? nd + (rev ? ' rentrée(s) détaillée(s)' : ' dépense(s) détaillée(s)') + ' — cliquer pour ouvrir le détail'
                     : MONTHS[i] + ' — double-clic pour détailler'}">
        <button class="st" data-st="${i}"
          title="${MONTHS[i]} : ${stNom(st, rev)} — cliquer pour ${rev ? (st ? 'remettre en attente' : 'marquer encaissé') : 'changer'}">${stIcon(st, rev)}</button>
        ${nd ? '<span class="pin">📋</span>' : ''}
      </div></td>`;
    }).join('')}
    <td class="tot ${kind === 'rev' ? 'entree' : ''}" id="rt_${l.id}">${lineTotal(l)
      ? (kind === 'rev' ? '+ ' : '') + money(lineTotal(l)) : '–'}</td></tr>`;
}
function sumRow(label, arr, total, kind, id) {
  return `<tr class="sum ${kind}"><td class="c-lab">${label}</td><td></td>
    ${arr.map((x, i) => `<td id="${id}_${i}">${x ? nf.format(x) : '–'}</td>`).join('')}
    <td class="tot" id="${id}_t">${money(total)}</td></tr>`;
}
function restRow(label, subtitle, arr, total, id) {
  return `<tr class="rest"><td class="c-lab">${label}<small>${subtitle}</small></td><td></td>
    ${arr.map((x, i) => `<td id="${id}_${i}"><span class="${x >= 0 ? 'chip-pos' : 'chip-neg'}">${nf.format(x)}</span></td>`).join('')}
    <td class="tot" id="${id}_t"><span class="${total >= 0 ? 'chip-pos' : 'chip-neg'}">${money(total)}</span></td></tr>`;
}
const colGroup = () => `<colgroup><col class="cl"><col class="cd">${MONTHS.map(() => '<col>').join('')}<col class="ct"></colgroup>`;
function blkOpen(emoji, title, count, clearKey, extra, sens) {
  return `<section class="blk blk-${sens === '+' ? 'in' : 'out'}">
    <div class="blkhd">
      <div class="bh"><span class="em">${emoji}</span><span>${title}</span>
        <span class="sens ${sens === '+' ? 'plus' : 'moins'}">${sens === '+' ? '+ ce qui rentre' : '− ce qui sort'}</span>
        <span class="cnt">${count} ligne${count > 1 ? 's' : ''}</span></div>
      <div class="bha">${extra || ''}
        <button class="mini-btn" data-sort="${clearKey}" title="Classer les lignes dans l'ordre des prélèvements du mois">📅 Trier par jour</button>
        <button class="mini-btn" data-clear="${clearKey}" title="Remettre à zéro tous les montants de ce bloc">🧹 Vider ce bloc</button></div>
    </div>
    <table class="grid">${colGroup()}<thead>${headRow()}</thead><tbody>`;
}
const blkClose = () => `</tbody></table></section>`;
function addRowHTML(path, txt) {
  return `<tr class="addrow"><td class="c-lab" colspan="15">
    <button class="addbtn" data-add="${path}">➕ ${txt}</button></td></tr>`;
}

function viewAnnuel() {
  const y = Y(), c = calc();
  const nFix = y.fixes.reduce((n, k) => n + k.lines.length, 0);
  let h = `<div class="card"><div class="hd">
      <h2><span>📊</span> Tableau ${state.activeYear}</h2>
      <span class="legend-st"><b>− Dépenses :</b> ✅ payé · rien = inscrit · ❌ rejeté
        &nbsp;·&nbsp; <b>+ Revenus :</b> 💰 encaissé · rien = attendu
        &nbsp;·&nbsp; clic sur la pastille ou clic droit dans la case
        &nbsp;·&nbsp; <b>📋 double-clic</b> = détailler</span>
      <span class="right"></span>
      <button class="mini-btn" data-addcat="1">➕ Catégorie</button>
      <button class="mini-btn" data-sort="all" title="Classer toutes les lignes du tableau par jour de prélèvement">📅 Trier tout par jour</button>
      <button class="mini-btn" data-clear="all">🧹 Vider toute l'année</button>
    </div></div><div class="tblwrap">`;

  h += blkOpen('💰', 'Revenus', y.revenus.length, 'rev', '', '+');
  y.revenus.forEach(l => h += rowHTML(l, 'rev', 'rev'));
  h += addRowHTML('rev', 'Ajouter un revenu');
  h += sumRow('Total revenus', c.inc, c.tInc, 'rev', 'sm_rev');
  h += blkClose();

  h += blkOpen('🏠', 'Dépenses fixes', nFix, 'fix', '<button class="mini-btn" data-addcat="1">➕ Catégorie</button>', '−');
  y.fixes.forEach(cat => {
    h += `<tr class="cathd"><td colspan="15"><div class="catrow">
        <input class="cat-in" value="${esc(cat.name)}" data-cat="${cat.id}" placeholder="Nom de la catégorie">
        <button class="mini-btn" data-sortcat="${cat.id}" title="Classer cette catégorie par jour de prélèvement">📅 Trier</button>
        <button class="mini-btn" data-clearcat="${cat.id}" title="Remettre à zéro les montants de cette catégorie">🧹 Vider</button>
        <button class="mini-btn" data-delcat="${cat.id}" title="Supprimer la catégorie">🗑️ Supprimer</button>
      </div></td></tr>`;
    cat.lines.forEach(l => h += rowHTML(l, 'fix:' + cat.id, 'fix'));
    h += addRowHTML('fix:' + cat.id, 'Ajouter une ligne dans « ' + esc(cat.name) + ' »');
  });
  h += sumRow('Total dépenses fixes', c.fix, c.tFix, '', 'sm_fix');
  h += restRow('Reste', 'pour les dépenses variables', c.rest1, c.tR1, 'rs1');
  h += blkClose();

  h += blkOpen('🛍️', 'Dépenses variables', y.variables.length, 'var', '', '−');
  y.variables.forEach(l => h += rowHTML(l, 'var', 'var'));
  h += addRowHTML('var', 'Ajouter une dépense variable');
  h += sumRow('Total dépenses variables', c.vr, c.tVar, 'varb', 'sm_var');
  h += restRow('Reste au total', 'pour épargner ou les dépenses exceptionnelles', c.rest2, c.tR2, 'rs2');
  h += blkClose();

  h += `</div>`;
  return h;
}

/* Mise à jour des totaux sans re-rendre le tableau (pour ne pas perdre le focus) */
/* Un chiffre qui change sans bouger passe inaperçu : on le fait cligner. */
function pose(node, txt) {
  if (!node || node.textContent === txt) return;
  node.textContent = txt;
  node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump');
  clearTimeout(node._b); node._b = setTimeout(() => node.classList.remove('bump'), 700);
}
function refreshTotals() {
  const c = calc();
  allLines().forEach(l => { const n = el('rt_' + l.id); if (n) { const t = lineTotal(l); pose(n, t ? money(t) : '–'); } });
  const put = (id, arr, tot) => {
    arr.forEach((x, i) => { const n = el(id + '_' + i); if (n) n.textContent = x ? nf.format(x) : '–'; });
    const t = el(id + '_t'); if (t) t.textContent = money(tot);
  };
  put('sm_rev', c.inc, c.tInc); put('sm_fix', c.fix, c.tFix); put('sm_var', c.vr, c.tVar);
  const putR = (id, arr, tot) => {
    arr.forEach((x, i) => { const n = el(id + '_' + i); if (n) n.innerHTML = `<span class="${x >= 0 ? 'chip-pos' : 'chip-neg'}">${nf.format(x)}</span>`; });
    const t = el(id + '_t'); if (t) t.innerHTML = `<span class="${tot >= 0 ? 'chip-pos' : 'chip-neg'}">${money(tot)}</span>`;
  };
  putR('rs1', c.rest1, c.tR1); putR('rs2', c.rest2, c.tR2);
  renderKpis();
}
function formatAllCells() {
  document.querySelectorAll('.cell').forEach(inp => {
    if (document.activeElement === inp) return;
    const n = parseNum(inp.value);
    inp.value = n ? nf.format(n) : '';
  });
}
/* Fait entrer les lignes une par une — après un tri, on voit ce qui a bougé. */
function animeLignes(sel) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll(sel).forEach((tr, i) => {
    const d = (i * 0.022).toFixed(3) + 's';
    tr.classList.add('arrive');
    tr.querySelectorAll('td').forEach(td => td.style.animationDelay = d);
    setTimeout(() => {
      tr.classList.remove('arrive');
      tr.querySelectorAll('td').forEach(td => td.style.animationDelay = '');
    }, 500 + i * 22);
  });
}

/* ---------- Tri par jour de prélèvement ----------
   L'ordre du tableau suit alors l'ordre dans lequel l'argent part du compte.
   Les lignes sans date restent à la fin, dans leur ordre d'origine. */
function sortByDay(lines) {
  lines.sort((a, b) => {
    const da = (a.day >= 1 && a.day <= 31) ? +a.day : 99;
    const db = (b.day >= 1 && b.day <= 31) ? +b.day : 99;
    return da - db;
  });
}
function bucket(path) {
  const y = Y();
  if (path === 'rev') return y.revenus;
  if (path === 'var') return y.variables;
  const cat = y.fixes.find(c => c.id === path.slice(4));
  return cat ? cat.lines : null;
}
function findLine(path, id) { const b = bucket(path); return b ? b.find(l => l.id === id) : null; }

/* ============================================================
   VUE MOIS
   ============================================================ */
function viewMois() {
  const y = Y(), c = calc(), m = selMonth;
  const inc = c.inc[m], fx = c.fix[m], vr = c.vr[m], rest = c.rest2[m];
  const st = statCount(m);
  const listOf = lines => lines.filter(l => l.v[m]).sort((a, b) => {
    if (moisTri === 'jour') {
      const da = (a.day >= 1 && a.day <= 31) ? +a.day : 99;
      const db = (b.day >= 1 && b.day <= 31) ? +b.day : 99;
      if (da !== db) return da - db;
    }
    return b.v[m] - a.v[m];
  });
  const rows = (lines, kind) => listOf(lines).map(l => {
    const s = l.s[m] || '', it = itemsOf(l, m);
    const det = it && it.length ? ` <span class="pill" title="${it.map(x => (x.lib || 'dépense') + ' ' + money(x.amt)).join(' · ')}">📋 ${it.length}</span>` : '';
    const epg = isSavings(l) ? ' <span class="pill" title="Compté comme épargne">🐖</span>' : '';
    return `<div class="mrow ${s === 'r' ? 'rej' : ''}"><span class="n">${emojiOf(l, kind)} ${esc(l.label)}${l.day ? ' <span class="pill">le ' + l.day + '</span>' : ''}${det}${epg} ${s ? stIcon(s, kind === 'rev') : ''}</span>
      <span class="v ${kind === 'rev' ? 'entree' : ''}">${kind === 'rev' ? '+ ' : ''}${money(l.v[m])}</span></div>`;
  }).join('') || '<div class="empty-note">Rien ce mois-ci 🙂</div>';

  let h = `<div class="msel">${MONTHS.map((n, i) => `<button data-m="${i}" class="${i === m ? 'on' : ''}">${MEMO[i]} ${n}</button>`).join('')}</div>`;
  h += `<div class="sharebar" style="margin:-4px 0 16px">
      <span>Classer les lignes :</span>
      <button class="qbtn ${moisTri === 'montant' ? 'on' : ''}" data-tri="montant">💶 Du plus gros au plus petit</button>
      <button class="qbtn ${moisTri === 'jour' ? 'on' : ''}" data-tri="jour">📅 Dans l'ordre des prélèvements</button>
    </div>`;
  h += `<div class="mgrid">
    <div class="card"><div class="hd"><h2><span>💰</span> Revenus — ${MONTHS[m]}</h2><span class="hint right">${money(inc)}</span></div>
      <div class="bd">${rows(y.revenus, 'rev')}</div></div>
    <div class="card"><div class="hd"><h2><span>🏠</span> Dépenses fixes</h2><span class="hint right">${money(fx)}</span></div>
      <div class="bd">${y.fixes.map(cat => {
        const t = sum(cat.lines.map(l => +l.v[m] || 0));
        if (!t) return '';
        return `<div style="margin-bottom:12px"><div class="catlab">${esc(cat.name)} — ${money(t)}</div>${rows(cat.lines, 'fix')}</div>`;
      }).join('') || '<div class="empty-note">Rien ce mois-ci 🙂</div>'}</div></div>
    <div class="card"><div class="hd"><h2><span>🛍️</span> Dépenses variables</h2><span class="hint right">${money(vr)}</span></div>
      <div class="bd">${rows(y.variables, 'var')}</div></div>
    <div class="card"><div class="hd"><h2><span>🧮</span> Bilan du mois</h2></div><div class="bd">
      <div class="mrow"><span class="n">💰 Revenus</span><span class="v pos">${money(inc)}</span></div>
      <div class="mrow"><span class="n">🏠 – Dépenses fixes</span><span class="v">${money(fx)}</span></div>
      <div class="mrow"><span class="n">🛍️ – Dépenses variables</span><span class="v">${money(vr)}</span></div>
      <div class="mrow" style="border-top:2px solid var(--accent-3);margin-top:6px;padding-top:12px">
        <span class="n" style="font-weight:800;color:var(--ink)">🐖 Reste</span>
        <span class="v ${rest >= 0 ? 'pos' : 'neg'}" style="font-size:19px">${money(rest)}</span></div>
      <div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-family:var(--ui-sans);font-style:normal;font-size:11.5px;color:var(--ink-3);font-weight:600">
          <span>Part des revenus dépensée</span><span>${inc ? Math.round((fx + vr) / inc * 100) : 0} %</span></div>
        <div class="bar"><i style="width:${inc ? Math.min(100, (fx + vr) / inc * 100) : 0}%"></i></div>
      </div>
      <div style="margin-top:16px;font-size:12.5px;color:var(--ink-3);line-height:1.7">
        💰 ${st.encaisse} rentrée(s) encaissée(s) · ⏳ ${st.attendu} attendue(s)<br>
        ✅ ${st.p} dépense(s) payée(s) · ❌ ${st.r} rejetée(s) · ⏳ ${Math.max(0, st.tot - st.p - st.r)} en attente<br>
        📊 Moyenne de l'année : revenus ${money0(c.tInc / 12)} · dépenses ${money0((c.tFix + c.tVar) / 12)}<br>
        🐖 Cumul depuis janvier : <b class="${sum(c.rest2.slice(0, m + 1)) >= 0 ? 'pos' : 'neg'}">${money(sum(c.rest2.slice(0, m + 1)))}</b>
      </div>
    </div></div>
  </div>`;
  return h;
}

/* ============================================================
   GRAPHIQUES (SVG maison, aucune librairie)
   ============================================================ */
function niceMax(v) {
  if (v <= 0) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  const s = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return s * p;
}
function barsChart(c) {
  const W = 960, H = 330, P = { l: 62, r: 16, t: 14, b: 40 };
  const top = niceMax(Math.max(...c.inc, ...c.inc.map((x, i) => c.fix[i] + c.vr[i]), 1));
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const yy = v => P.t + ph - (v / top) * ph;
  const bw = pw / 12, gw = bw * 0.34;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = top * i / 4, y = yy(v);
    g += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="var(--border)" stroke-width="1"/>
          <text x="${P.l - 9}" y="${y + 4}" font-size="10.5" fill="var(--ink-3)" text-anchor="end">${nf0.format(v)}</text>`;
  }
  let b = '', zones = '';
  for (let i = 0; i < 12; i++) {
    const dl = (i * 0.045).toFixed(3) + 's';
    const x0 = P.l + i * bw + bw * 0.1;
    const hi = (c.inc[i] / top) * ph, hf = (c.fix[i] / top) * ph, hv = (c.vr[i] / top) * ph;
    b += `<rect class="seg gbar" style="animation-delay:${dl}" x="${x0}" y="${P.t + ph - hi}" width="${gw}" height="${Math.max(0, hi)}" rx="5" fill="url(#gIn)"/>`;
    const x1 = x0 + gw + bw * 0.08;
    b += `<rect class="seg gbar" style="animation-delay:${dl}" x="${x1}" y="${P.t + ph - hf}" width="${gw}" height="${Math.max(0, hf)}" rx="5" fill="url(#gFix)"/>`;
    b += `<rect class="seg gbar" style="animation-delay:${dl}" x="${x1}" y="${P.t + ph - hf - hv}" width="${gw}" height="${Math.max(0, hv)}" rx="5" fill="var(--var)"/>`;
    b += `<text x="${P.l + i * bw + bw / 2}" y="${H - 14}" font-size="11" fill="var(--ink-2)" text-anchor="middle">${MSHORT[i]}</text>`;
    const r = c.rest2[i];
    zones += `<g class="hov" ${tipAttr(MONTHS[i] + ' ' + state.activeYear, [
      ['💰 Revenus', money(c.inc[i]), 'rev'],
      ['🏠 Dépenses fixes', money(c.fix[i]), 'accent'],
      ['🛍️ Dépenses variables', money(c.vr[i]), 'varc'],
      ['= Reste du mois', (r >= 0 ? '+ ' : '– ') + money(Math.abs(r)), r >= 0 ? 'ok' : 'ko']
    ])}>
      <rect x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${ph}" fill="transparent"/>
      <rect class="gd" x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${ph}" fill="var(--accent)" opacity=".07"/>
    </g>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--rev)" stop-opacity=".7"/><stop offset="1" stop-color="var(--rev)"/></linearGradient>
      <linearGradient id="gFix" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent-3)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient>
    </defs>${g}${b}${zones}</svg>
    <div class="chartlegend"><span><i style="background:var(--rev)"></i>💰 Revenus</span>
      <span><i style="background:var(--accent)"></i>🏠 Dépenses fixes</span>
      <span><i style="background:var(--var)"></i>🛍️ Dépenses variables</span></div>`;
}
/* Épargne cumulée = ce qui reste sur le compte + ce qui a été mis de côté
   (les lignes marquées 🐖, qui sont des dépenses au sens du budget mais pas
   de l'argent perdu). Les deux bandes s'empilent, la ligne du haut est le total. */
function cumulChart(c) {
  const W = 980, H = 300, P = { l: 62, r: 154, t: 18, b: 34 };
  const sav = savingsMonths();
  const rest = [], tot = []; let a = 0, b = 0;
  c.rest2.forEach((v, i) => { a += v; b += sav[i]; rest.push(a); tot.push(a + b); });
  const mx = Math.max(...tot, ...rest, 0), mn = Math.min(...tot, ...rest, 0);
  const top = niceMax(mx || 100), bot = mn < 0 ? -niceMax(-mn) : 0;
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const yy = v => P.t + ph - ((v - bot) / (top - bot)) * ph;
  const xx = i => P.l + (pw / 11) * i;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = bot + (top - bot) * i / 4, y = yy(v);
    g += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="var(--border)"/>
          <text x="${P.l - 9}" y="${y + 4}" font-size="10.5" fill="var(--ink-3)" text-anchor="end">${nf0.format(v)}</text>`;
  }
  g += `<line x1="${P.l}" y1="${yy(0)}" x2="${W - P.r}" y2="${yy(0)}" stroke="var(--accent-2)" stroke-dasharray="4 4"/>`;

  const ptsR = rest.map((v, i) => `${xx(i)},${yy(v)}`).join(' ');
  const ptsT = tot.map((v, i) => `${xx(i)},${yy(v)}`).join(' ');
  const areaR = `${P.l},${yy(0)} ${ptsR} ${xx(11)},${yy(0)}`;
  const areaS = `${ptsT} ${rest.map((v, i) => `${xx(11 - i)},${yy(rest[11 - i])}`).join(' ')}`;
  const hasSav = sum(sav) > 0;
  const dots = tot.map((v, i) => `<circle class="seg gdot" style="animation-delay:${(0.5 + i * 0.05).toFixed(2)}s"
      cx="${xx(i)}" cy="${yy(v)}" r="4.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5"/>`).join('');

  /* Zones de survol : une bande par mois, bien plus facile à viser qu'un point
     de 4 px. Elles portent le contenu de l'infobulle et allument un repère. */
  const demi = pw / 22;
  const zones = tot.map((v, i) => {
    const x0 = Math.max(P.l, xx(i) - demi);
    const x1 = Math.min(W - P.r, xx(i) + demi);
    const lignes = [
      ['💳 Sur le compte', money(rest[i]), 'accent-2'],
      hasSav ? ['🐖 Mis de côté', money(v - rest[i]), 's4'] : null,
      ['= Total conservé', money(v), 'accent'],
      ['📈 Ce mois-là', (c.rest2[i] >= 0 ? '+ ' : '– ') + money(Math.abs(c.rest2[i])), c.rest2[i] >= 0 ? 'ok' : 'ko']
    ].filter(Boolean);
    return `<g class="hov" ${tipAttr('Fin ' + MONTHS[i] + ' ' + state.activeYear, lignes)}>
      <rect x="${x0}" y="${P.t}" width="${x1 - x0}" height="${ph}" fill="transparent"/>
      <line class="gd" x1="${xx(i)}" y1="${P.t}" x2="${xx(i)}" y2="${P.t + ph}"
        stroke="var(--accent-2)" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle class="gd" cx="${xx(i)}" cy="${yy(v)}" r="7.5" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
      ${hasSav ? `<circle class="gd" cx="${xx(i)}" cy="${yy(rest[i])}" r="6" fill="var(--surface)" stroke="var(--s4)" stroke-width="2.5"/>` : ''}
    </g>`;
  }).join('');
  const labs = MSHORT.map((m, i) => `<text x="${xx(i)}" y="${H - 12}" font-size="11" fill="var(--ink-2)" text-anchor="middle">${m}</text>`).join('');

  /* Les montants écrits en toutes lettres au bout des courbes : sans eux,
     une bande colorée ne dit pas combien on a de côté. */
  const xEnd = xx(11), xLab = W - P.r + 14;
  const yTot = yy(tot[11]), yRest = yy(rest[11]);
  let reperes = `
    <line x1="${xEnd}" y1="${yTot}" x2="${xLab - 6}" y2="${yTot}" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".55"/>
    <text x="${xLab}" y="${yTot - 3}" font-size="13" font-weight="700" fill="var(--accent)">${money0(tot[11])}</text>
    <text x="${xLab}" y="${yTot + 12}" font-size="10.5" fill="var(--ink-3)">conservé au total</text>`;
  if (hasSav) {
    reperes += `
      <line x1="${xEnd}" y1="${yRest}" x2="${xLab - 6}" y2="${yRest}" stroke="var(--s4)" stroke-dasharray="3 3" opacity=".7"/>
      <text x="${xLab}" y="${yRest - 3}" font-size="13" font-weight="700" fill="var(--accent-2)">${money0(rest[11])}</text>
      <text x="${xLab}" y="${yRest + 12}" font-size="10.5" fill="var(--ink-3)">sur le compte</text>`;
    if (Math.abs(yRest - yTot) > 30) {
      reperes += `<text x="${xEnd - 14}" y="${(yTot + yRest) / 2 + 4}" font-size="12.5" font-weight="700"
        fill="var(--s4)" text-anchor="end">🐖 ${money0(tot[11] - rest[11])} de côté</text>`;
    }
  }

  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity=".38"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>
      <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--s4)" stop-opacity=".62"/><stop offset="1" stop-color="var(--s4)" stop-opacity=".22"/></linearGradient>
    </defs>
    ${g}
    <polygon points="${areaR}" fill="url(#gArea)" opacity=".9"/>
    ${hasSav ? `<polygon points="${areaS}" fill="url(#gSav)"/>
      <polyline points="${ptsR}" fill="none" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="6 4" opacity=".95"/>` : ''}
    <polyline class="gline" pathLength="1" points="${ptsT}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labs}${reperes}${zones}</svg>`;

  const recap = `<div class="recap">
    <div class="rc"><span class="rd" style="background:var(--accent-2)"></span>
      <div><b>${money(rest[11])}</b><span>💳 encore sur le compte fin décembre
        <em>— le trait en pointillés</em></span></div></div>
    ${hasSav ? `<div class="rc"><span class="rd" style="background:var(--s4)"></span>
      <div><b>${money(tot[11] - rest[11])}</b><span>🐖 mis de côté dans l'année
        <em>— la bande verte, c'est la hauteur de cette somme</em></span></div></div>` : ''}
    <div class="rc som"><span class="rd" style="background:var(--accent)"></span>
      <div><b>${money(tot[11])}</b><span>= tout ce que vous avez gardé <em>— le trait plein du haut</em></span></div></div>
  </div>`;
  return svg + recap;
}
function donut(items, size) {
  const S = size || 230, R = S / 2, r0 = R * 0.58, cx = R, cy = R;
  const tot = sum(items.map(i => i.value));
  if (!tot) return `<div class="empty-note">Aucun montant saisi 🤷</div>`;
  let a = -Math.PI / 2, paths = '';
  items.forEach((it, i) => {
    const frac = it.value / tot, a2 = a + frac * Math.PI * 2;
    const big = frac > 0.5 ? 1 : 0;
    const p = (ang, rad) => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)];
    const [x1, y1] = p(a, R - 2), [x2, y2] = p(a2, R - 2), [x3, y3] = p(a2, r0), [x4, y4] = p(a, r0);
    const col = it.color || PALETTE[i % PALETTE.length];
    const tp = tipAttr((it.em ? it.em + ' ' : '') + it.name, [
      ['Montant', money(it.value), 'accent'],
      ['Part', Math.round(frac * 100) + ' %', ''],
      ['Sur un total de', money(tot), '']
    ]);
    if (frac > 0.9999) {
      paths += `<circle ${tp} cx="${cx}" cy="${cy}" r="${(R - 2 + r0) / 2}" fill="none" stroke="${col}" stroke-width="${R - 2 - r0}"/>`;
    } else {
      paths += `<path class="seg" ${tp} d="M${x1} ${y1} A${R - 2} ${R - 2} 0 ${big} 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 ${big} 0 ${x4} ${y4} Z" fill="${col}" stroke="var(--surface)" stroke-width="1.5"/>`;
    }
    a = a2;
  });
  return `<div class="donut"><svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">${paths}
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="16" font-weight="600" fill="var(--ink)">${nf0.format(tot)} €</text>
    <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">sur l'année</text></svg></div>`;
}
function legendOf(items) {
  const tot = sum(items.map(i => i.value)) || 1;
  return `<div class="legend">${items.map((it, i) => `<div class="li">
      <span class="dot" style="background:${it.color || PALETTE[i % PALETTE.length]}"></span>
      <span class="nm" title="${esc(it.name)}">${it.em || ''} ${esc(it.name)}</span>
      <span class="vl">${money0(it.value)}</span>
      <span class="pc">${Math.round(it.value / tot * 100)} %</span></div>`).join('')}</div>`;
}
function pieCard(emoji, title, items) {
  const its = items.filter(i => i.value > 0).sort((a, b) => b.value - a.value);
  return `<div class="card"><div class="hd"><h2><span>${emoji}</span> ${title}</h2>
    <span class="hint right">${money(sum(its.map(i => i.value)))}</span></div>
    <div class="bd"><div class="donutwrap">${donut(its)}${its.length ? legendOf(its) : ''}</div></div></div>`;
}
function viewGraph() {
  const y = Y(), c = calc();
  let h = `<div class="card"><div class="hd"><h2><span>📊</span> Revenus et dépenses mois par mois</h2>
      <span class="hint right">${state.activeYear}</span></div><div class="bd"><div class="chartbox">${barsChart(c)}</div></div></div>`;
  const tSav = sum(savingsMonths());
  h += `<div class="card"><div class="hd"><h2><span>🐖</span> Épargne cumulée au fil de l'année</h2>
      <span class="hint">survolez un point pour le détail du mois</span></div>
      <div class="bd"><div class="chartbox">${cumulChart(c)}</div></div></div>`;
  h += `<div class="gridtwo">`;
  h += pieCard('🥧', 'Répartition globale', [
    { name: 'Dépenses fixes', em: '🏠', value: c.tFix, color: 'var(--accent)' },
    { name: 'Dépenses variables', em: '🛍️', value: Math.max(0, c.tVar - tSav), color: 'var(--var)' },
    { name: 'Mis de côté', em: '🐖', value: tSav, color: 'var(--s4)' },
    { name: 'Reste sur le compte', em: '💳', value: Math.max(0, c.tR2), color: 'var(--s2)' }
  ]);
  h += pieCard('🏠', 'Dépenses fixes par catégorie', c.cats.map(k => ({ name: k.name, value: k.total })));
  y.fixes.forEach(cat => h += pieCard('📂', esc(cat.name),
    cat.lines.map(l => ({ name: l.label, em: emojiOf(l, 'fix'), value: lineTotal(l) }))));
  h += pieCard('🛍️', 'Dépenses variables', y.variables.map(l => ({ name: l.label, em: emojiOf(l, 'var'), value: lineTotal(l) })));
  h += pieCard('💰', 'Revenus', y.revenus.map(l => ({ name: l.label, em: emojiOf(l, 'rev'), value: lineTotal(l) })));
  h += `</div>`;
  return h;
}

/* ============================================================
   AGENDA DES PRÉLÈVEMENTS
   ============================================================ */
function eventsOfMonth(m) {
  const y = Y(), out = [];
  const push = (l, cat, kind) => {
    if (!l.day) return;
    const amt = +l.v[m] || 0;
    if (!amt) return;
    out.push({ day: Math.min(31, Math.max(1, parseInt(l.day, 10) || 1)), label: l.label, em: emojiOf(l, kind),
      cat, amt, kind, st: l.s[m] || '' });
  };
  y.revenus.forEach(l => push(l, 'Revenu', 'rev'));
  y.fixes.forEach(c => c.lines.forEach(l => push(l, c.name, 'fix')));
  y.variables.forEach(l => push(l, 'Dépense variable', 'var'));
  return out.sort((a, b) => a.day - b.day || b.amt - a.amt);
}
function viewAgenda() {
  const m = selMonth, yr = +state.activeYear;
  const evs = eventsOfMonth(m);
  const nDays = new Date(yr, m + 1, 0).getDate();
  const first = (new Date(yr, m, 1).getDay() + 6) % 7;   // lundi = 0
  const today = new Date();
  const isCur = today.getFullYear() === yr && today.getMonth() === m;
  const byDay = {};
  evs.forEach(e => { const d = Math.min(e.day, nDays); (byDay[d] = byDay[d] || []).push(e); });

  let cells = '';
  for (let i = 0; i < first; i++) cells += `<div class="day empty"></div>`;
  for (let d = 1; d <= nDays; d++) {
    const list = byDay[d] || [];
    cells += `<div class="day ${list.length ? 'has' : ''} ${isCur && today.getDate() === d ? 'today' : ''}" style="animation-delay:${(d * 0.012).toFixed(3)}s">
      <div class="n">${d}</div>
      ${list.slice(0, 4).map(e => `<div class="ev ${e.kind === 'rev' ? 'in' : e.kind === 'var' ? 'var' : ''} ${e.st === 'p' ? 'paid' : e.st === 'r' ? 'rej' : ''}" title="${esc(e.label)} — ${e.kind === 'rev' ? '+ ' : '− '}${money(e.amt)} (${stNom(e.st, e.kind === 'rev')})">
          <span>${e.em} ${esc(e.label)}</span><b>${nf0.format(e.amt)} €</b></div>`).join('')}
      ${list.length > 4 ? `<div class="ev">+ ${list.length - 4} autre(s)</div>` : ''}
    </div>`;
  }
  const out = sum(evs.filter(e => e.kind !== 'rev').map(e => e.amt));
  const inn = sum(evs.filter(e => e.kind === 'rev').map(e => e.amt));
  const noDay = [];
  const y = Y();
  y.fixes.forEach(c => c.lines.forEach(l => { if (!l.day && l.v[m]) noDay.push({ label: l.label, em: emojiOf(l, 'fix'), cat: c.name, amt: l.v[m] }); }));
  y.variables.forEach(l => { if (!l.day && l.v[m]) noDay.push({ label: l.label, em: emojiOf(l, 'var'), cat: 'Dépense variable', amt: l.v[m] }); });

  let h = `<div class="msel">${MONTHS.map((n, i) => `<button data-m="${i}" class="${i === m ? 'on' : ''}">${MEMO[i]} ${n}</button>`).join('')}</div>`;
  h += `<div class="card"><div class="hd"><h2><span>📅</span> ${MONTHS[m]} ${yr}</h2>
    <span class="hint">le jour se règle dans la colonne 📅 du tableau annuel</span>
    <span class="hint right">🔻 <b class="neg">${money(out)}</b> prélevés &nbsp;·&nbsp; 🔺 <b class="pos">${money(inn)}</b> encaissés</span></div>
    <div class="bd"><div class="cal">${DOW.map(d => `<div class="dow">${d}</div>`).join('')}${cells}</div></div></div>`;

  h += `<div class="gridtwo"><div class="card"><div class="hd"><h2><span>⏳</span> Échéances du mois, dans l'ordre</h2></div><div class="bd">
    <div class="agenda-list">${evs.length ? evs.map((e, i) => `<div class="ag-item ${e.kind === 'rev' ? 'in' : e.kind} ${e.st === 'r' ? 'rej' : ''}" style="animation-delay:${(i * 0.03).toFixed(2)}s">
        <div class="dd">${e.day}</div>
        <div class="nm">${e.em} ${esc(e.label)} ${e.st ? stIcon(e.st, e.kind === 'rev') : ''}<div class="cat">${esc(e.cat)}</div></div>
        <div class="amt ${e.kind === 'rev' ? 'pos' : ''}">${e.kind === 'rev' ? '+' : '–'} ${money(e.amt)}</div>
      </div>`).join('') : '<div class="empty-note">Aucune date renseignée pour ce mois 📭</div>'}</div></div></div>`;

  h += `<div class="card"><div class="hd"><h2><span>❓</span> Sans date de prélèvement</h2>
      <span class="hint">à compléter dans le tableau annuel</span></div><div class="bd">
    <div class="agenda-list">${noDay.length ? noDay.map((e, i) => `<div class="ag-item" style="animation-delay:${(i * 0.03).toFixed(2)}s">
        <div class="dd">?</div><div class="nm">${e.em} ${esc(e.label)}<div class="cat">${esc(e.cat)}</div></div>
        <div class="amt">${money(e.amt)}</div></div>`).join('') : '<div class="empty-note">Tout est daté 👏</div>'}</div>
    </div></div></div>`;
  return h;
}

/* ============================================================
   RÉGLAGES
   ============================================================ */
function viewReglages() {
  const years = Object.keys(state.years).sort();
  return `<div class="gridtwo">
    <div class="card"><div class="hd"><h2><span>📆</span> Mes années</h2></div><div class="bd">
      <div class="agenda-list">${years.map(y => `<div class="ag-item">
        <div class="dd">${String(y).slice(2)}</div>
        <div class="nm">Budget ${y}<div class="cat">${money(sumYear(y))} de revenus</div></div>
        <button class="mini-btn" data-goyear="${y}">Ouvrir</button>
        ${years.length > 1 ? `<button class="mini-btn" data-delyear="${y}">🗑️</button>` : ''}
      </div>`).join('')}</div>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn primary" data-newyear="empty">✨ Nouvelle année vide</button>
        <button class="btn" data-newyear="copy">📋 Dupliquer ${state.activeYear}</button>
      </div>
      <p style="font-size:12.5px;color:var(--ink-3);line-height:1.6;margin-top:12px">
        « Dupliquer » recrée toutes vos lignes et catégories pour l'année suivante en recopiant les dépenses fixes
        (loyer, abonnements, assurances) et en laissant les revenus et dépenses variables à zéro.</p>
    </div></div>

    <div class="card"><div class="hd"><h2><span>💾</span> Sauvegardes</h2></div><div class="bd">
      <p style="font-size:13.5px;color:var(--ink-2);line-height:1.7;margin-top:0">
        Vos données sont enregistrées automatiquement dans ce navigateur, sur cet ordinateur.
        Exportez un fichier de temps en temps : c'est votre filet de sécurité, et il permet de
        transférer le budget sur un autre PC.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn primary" id="btnExport2">⬇️ Exporter (.json)</button>
        <button class="btn" id="btnCsv">📊 Exporter pour Excel (.csv)</button>
        <button class="btn" id="btnImport2">⬆️ Charger une sauvegarde</button>
      </div>
      <hr style="border:0;border-top:1px solid var(--border);margin:18px 0">
      <p style="font-size:13.5px;color:var(--ink-2);line-height:1.7;margin:0 0 10px">
        <b>🏦 Relevé bancaire.</b> Déposez l'export de votre banque — <code>.csv</code> ou
        <code>.ofx</code> depuis l'espace client LCL, ou le fichier produit par le pont
        <b>NaoBanque</b>. NaoBudget devine à quelle ligne du budget chaque opération se rattache,
        vous corrigez ce qu'il faut, et tout s'inscrit dans le détail 📋 du mois.</p>
      <button class="btn" id="btnBanque">🏦 Importer un relevé bancaire</button>
      <hr style="border:0;border-top:1px solid var(--border);margin:18px 0">
      <p style="font-size:13.5px;color:var(--ink-2);line-height:1.7;margin:0 0 10px">
        <b>📊 Reprendre un tableau Excel.</b> NaoBudget sait lire un classeur <code>.xlsx</code> ou un
        <code>.csv</code> : il repère la ligne des mois (Janvier, Février…), les blocs
        Revenus / Dépenses fixes / Dépenses variables, les catégories, et vous montre ce qu'il a compris
        avant d'importer quoi que ce soit.</p>
      <button class="btn" id="btnXlsx">📊 Importer un tableau Excel (.xlsx / .csv)</button>
      <hr style="border:0;border-top:1px solid var(--border);margin:18px 0">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-clear="all">🧹 Vider les montants de ${state.activeYear}</button>
        <button class="btn danger" data-reset="1">🧨 Réinitialiser l'outil (le rendre vierge)</button>
      </div>
    </div></div>

    <div class="card"><div class="hd"><h2><span>😄</span> Le ton</h2></div><div class="bd">
      <p style="font-size:13.5px;color:var(--ink-2);line-height:1.7;margin:0 0 12px">
        NaoBudget glisse une petite réplique quand un prélèvement est rejeté, quand une amende
        tombe, quand le mois est entièrement payé ou qu'il part dans le rouge. Si vous préférez
        le silence, ça se coupe ici — et ça ne touche à aucun chiffre.</p>
      <button class="btn" id="btnHumour">${humourOn ? '😄 Petites blagues : activées' : '😐 Petites blagues : coupées'}</button>
    </div></div>

    <div class="card"><div class="hd"><h2><span>💡</span> Comment ça marche</h2></div><div class="bd">
      <ul style="font-size:13.5px;color:var(--ink-2);line-height:1.9;padding-left:18px;margin:0">
        <li>Tout se saisit dans <b>Vue annuelle</b> : cliquez dans une case, tapez le montant,
            passez à la suivante avec <b>Tab</b> ou les <b>flèches</b>.</li>
        <li><b>Couleur des cases</b> : ✅ vert = payé, rien = simplement inscrit, ❌ rouge = rejeté.
            Cliquez la pastille à gauche de la case, ou faites un <b>clic droit</b> dedans.</li>
        <li><b>📋 Détail d'une case</b> : double-cliquez dans une case pour lister plusieurs dépenses
            (trois passages au supermarché : date, lieu, montant). La case affiche automatiquement le total.</li>
        <li><b>Part payée</b> : dans ce détail, chaque ligne a une part à votre charge — <b>Tout</b> (100 %)
            si vous avez tout réglé, <b>½</b> si votre chéri a payé la moitié, ou un pourcentage libre.
            Seule votre part est comptée dans le budget.</li>
        <li><b>⇥</b> recopie le premier montant de la ligne sur tous les mois vides — idéal pour un abonnement.</li>
        <li><b>▲ ▼</b> déplacent une ligne, <b>✕</b> la supprime, <b>l'émoji</b> se change en cliquant dessus.</li>
        <li><b>🧹 Vider</b> existe pour un bloc entier, pour une catégorie, ou pour l'année complète :
            les lignes restent, seuls les montants repartent à zéro.</li>
        <li>La colonne <b>📅</b> alimente l'agenda : mettez 5 pour un prélèvement le 5 de chaque mois.</li>
      </ul>
    </div></div>
  </div>`;
}
function sumYear(y) {
  const d = state.years[y]; if (!d) return 0;
  return sum(d.revenus.map(l => sum(l.v.map(x => +x || 0))));
}

/* ============================================================
   Interactions
   ============================================================ */
function toast(msg, kind) {
  const t = el('toast');
  t.textContent = msg;
  t.className = 'toast on' + (kind ? ' ' + kind : '');
  clearTimeout(t._t); t._t = setTimeout(() => t.className = 'toast', kind === 'fun' ? 3600 : 2400);
}

/* ---------- L'infobulle ---------- */
function tipNode() {
  let t = el('tip');
  if (!t) { t = document.createElement('div'); t.id = 'tip'; t.className = 'tip'; document.body.appendChild(t); }
  return t;
}
function tipShow(node, ev) {
  const d = node.getAttribute('data-tip'); if (!d) return;
  const p = d.split('¦'), t = tipNode();
  t.innerHTML = `<b>${p[0]}</b>` + p.slice(1).map(r => {
    const [lab, val, cls] = r.split('§');
    return `<i><span>${lab}</span><em class="${cls || ''}">${val}</em></i>`;
  }).join('');
  t.classList.add('on');
  tipMove(ev);
}
function tipMove(ev) {
  const t = el('tip'); if (!t || !t.classList.contains('on')) return;
  const r = t.getBoundingClientRect();
  let x = ev.clientX + 16, y = ev.clientY + 16;
  if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 14;
  if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
  t.style.left = Math.max(8, x) + 'px';
  t.style.top = Math.max(8, y) + 'px';
}
function tipHide() { const t = el('tip'); if (t) t.classList.remove('on'); }
let tipCur = null;
document.addEventListener('mousemove', e => {
  const n = e.target.closest ? e.target.closest('[data-tip]') : null;
  if (!n) { tipCur = null; return tipHide(); }
  if (n !== tipCur) { tipCur = n; tipShow(n, e); } else tipMove(e);
}, { passive: true });
window.addEventListener('blur', tipHide);
window.addEventListener('scroll', tipHide, { passive: true });

el('tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-v]'); if (!b) return;
  view = b.dataset.v; render();
});
el('yprev').onclick = () => { state.activeYear = +state.activeYear - 1; Y(); save(); render(); };
el('ynext').onclick = () => { state.activeYear = +state.activeYear + 1; Y(); save(); render(); };

const viewNode = el('view');

/* --- saisie --- */
viewNode.addEventListener('input', e => {
  const t = e.target, tr = t.closest('tr');
  if (t.classList.contains('cell')) {
    const l = findLine(tr.dataset.path, tr.dataset.id); if (!l) return;
    const m = +t.dataset.m;
    l.v[m] = parseNum(t.value);
    if (!l.v[m] && l.s[m]) { l.s[m] = ''; paintCell(t, ''); }
    refreshTotals(); save();
  } else if (t.dataset.k === 'label') {
    const l = findLine(tr.dataset.path, tr.dataset.id);
    if (l) {
      l.label = t.value;
      if (l.e === undefined) {
        const btn = tr.querySelector('.emo');
        if (btn) btn.textContent = guessEmoji(l.label, tr.classList.contains('b-rev') ? 'rev' : tr.classList.contains('b-var') ? 'var' : 'fix');
      }
      save();
    }
  } else if (t.dataset.k === 'day') {
    const l = findLine(tr.dataset.path, tr.dataset.id);
    if (l) { const d = parseInt(t.value, 10); l.day = (d >= 1 && d <= 31) ? d : null; save(); }
  } else if (t.dataset.cat) {
    const c = Y().fixes.find(x => x.id === t.dataset.cat);
    if (c) { c.name = t.value; save(); }
  }
});
viewNode.addEventListener('focusin', e => {
  const t = e.target;
  if (t.classList.contains('cell')) {
    const n = parseNum(t.value);
    t.dataset.av = n;                 /* pour savoir, en sortant, ce qui a changé */
    t.value = n ? String(n).replace('.', ',') : '';
    setTimeout(() => t.select(), 0);
  }
});
viewNode.addEventListener('focusout', e => {
  const t = e.target;
  if (!t.classList.contains('cell')) return;
  const n = parseNum(t.value);
  t.value = n ? nf.format(n) : '';
  const av = +(t.dataset.av || 0);
  delete t.dataset.av;
  if (n <= 0 || n === av) return;
  const tr = t.closest('tr.row'), l = tr && findLine(tr.dataset.path, tr.dataset.id);
  if (!l) return;
  const m = +t.dataset.m;
  /* Ce qui rentre n'est pas une dépense : ni « grosse sortie », ni mois
     dans le rouge, ni plein d'essence. */
  if (tr.dataset.path === 'rev') {
    if (n >= 500) rire('grosseRentree', n);
    else if (Math.random() < 0.4) rire('rentree', n);
    return;
  }
  if (estAmende(l)) rire('amende', n);
  else if (isSavings(l)) rire('epargne', n);
  else if (estCarburant(l) && n >= 60) rire('carburant', n);
  else if (n >= 500) rire('gros', n);
  else {
    /* le mois vient-il de basculer dans le rouge à cause de cette saisie ? */
    const apres = calc().rest2[m], avant = apres + (n - av);
    if (apres < 0 && avant >= 0) rire('rouge');
  }
});
viewNode.addEventListener('keydown', e => {
  const t = e.target;
  if (!t.classList.contains('cell')) return;
  /* Copier-coller d'une case à l'autre, détail et parts compris. */
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
    const k = e.key.toLowerCase();
    if (k === 'c') { if (copierCellule(t)) e.preventDefault(); return; }
    if (k === 'v') { if (collerCellule(t)) e.preventDefault(); return; }
    if (k === 'd') { e.preventDefault(); openCopie(t.closest('tr').dataset.path, t.closest('tr').dataset.id, +t.dataset.m); return; }
  }
  const move = (dr, dc) => {
    const rows = [...document.querySelectorAll('tr.row')];
    const cells = rows.map(tr => [...tr.querySelectorAll('.cell')]);
    let r = rows.indexOf(t.closest('tr')) + dr, c = (+t.dataset.m) + dc;
    if (c < 0) { c = 11; r--; } if (c > 11) { c = 0; r++; }
    if (r < 0 || r >= cells.length) return;
    const n = cells[r] && cells[r][c];
    if (n) { e.preventDefault(); n.focus(); }
  };
  if (e.key === 'ArrowUp') move(-1, 0);
  else if (e.key === 'ArrowDown' || e.key === 'Enter') move(1, 0);
  else if (e.key === 'ArrowLeft' && t.selectionStart === 0) move(0, -1);
  else if (e.key === 'ArrowRight' && t.selectionStart === t.value.length) move(0, 1);
});

/* --- statuts : pastille ou clic droit --- */
function paintCell(input, st, rev) {
  if (rev === undefined) rev = input.classList.contains('entree');
  input.classList.remove('st-p', 'st-r');
  if (st) input.classList.add('st-' + st);
  const cw = input.closest('.cw'), btn = cw && cw.querySelector('.st');
  if (cw) cw.classList.toggle('has', !!st);
  if (btn) {
    btn.textContent = stIcon(st, rev);
    btn.title = btn.title.replace(/ : .*? —/, ' : ' + stNom(st, rev) + ' —');
  }
}
/* ---------- Petites fêtes ----------
   Marquer « payé » fait sauter quelques confettis sur la case ; « rejeté »
   fait un éclat rouge et secoue la case. Rien ne bouge ailleurs sur la page. */
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function fx(node, ok) {
  if (!node || reducedMotion()) return;
  const r = node.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'fx' + (ok ? '' : ' ko');
  d.style.left = (r.left + r.width / 2) + 'px';
  d.style.top = (r.top + r.height / 2) + 'px';
  let h = '<span class="boum"></span>';
  if (ok) {
    const cols = ['var(--success)', 'var(--accent)', 'var(--s6)', 'var(--s4)', 'var(--s7)', 'var(--accent-3)'];
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, dist = 24 + Math.random() * 48;
      h += `<b style="background:${cols[i % cols.length]};--dx:${(Math.cos(a) * dist).toFixed(1)}px;
        --dy:${(Math.sin(a) * dist - 16).toFixed(1)}px;--rot:${Math.round(Math.random() * 540 - 270)}deg;
        animation-delay:${(Math.random() * 0.12).toFixed(2)}s"></b>`;
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() * 44 - 22).toFixed(1);
      h += `<i style="--dx:${dx}px;--rot:${Math.round(Math.random() * 160 - 80)}deg;
        animation-delay:${(i * 0.045).toFixed(2)}s">${i % 2 ? '❌' : '💸'}</i>`;
    }
  }
  d.innerHTML = h;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1200);
  node.classList.remove('ok', 'ko');
  void node.offsetWidth;
  node.classList.add(ok ? 'ok' : 'ko');
  setTimeout(() => node.classList.remove('ok', 'ko'), 600);
}
function cycleStatus(tr, m, forced) {
  const l = findLine(tr.dataset.path, tr.dataset.id); if (!l) return;
  const rev = tr.classList.contains('b-rev');      /* une rentrée d'argent */
  const now = l.s[m] || '';
  const next = forced !== undefined ? forced : (rev ? ST_NEXT_REV : ST_NEXT)[now];
  l.s[m] = next;
  const input = tr.querySelectorAll('.cell')[m];
  if (input) { paintCell(input, next, rev); if (next) fx(input, next === 'p'); }
  /* toute la ligne réagit, pas seulement la case */
  tr.classList.remove('flash-ko', 'flash-ok');
  void tr.offsetWidth;
  if (next) tr.classList.add(next === 'p' ? 'flash-ok' : 'flash-ko');
  setTimeout(() => tr.classList.remove('flash-ko', 'flash-ok'), 1200);
  renderKpis(); save();
  /* Le petit mot qui va avec — et il n'est pas le même pour ce qui rentre. */
  if (rev) { if (next === 'p') rire('encaisse'); return; }
  if (next === 'r') rire('rejet');
  else if (next === 'p') {
    const st = statCount(m);
    if (estAmende(l)) rire('amendePayee');
    else if (st.tot && st.p === st.tot) rire('moisBoucle');
    else if (Math.random() < 0.35) rire('paye');
  }
}
viewNode.addEventListener('contextmenu', e => {
  const cell = e.target.closest('.cell'); if (!cell) return;
  e.preventDefault();
  cycleStatus(cell.closest('tr'), +cell.dataset.m);
});

/* ============================================================
   Détail d'une case : plusieurs dépenses + part à ma charge
   ============================================================ */
let modalCtx = null;

function openDetail(path, id, m) {
  const l = findLine(path, id); if (!l) return;
  if (!l.d) l.d = {};
  if (!l.d[m]) l.d[m] = (+l.v[m]) ? [{ id: uid(), d: '', lib: '', amt: +l.v[m], q: 100 }] : [];
  modalCtx = { path, id, m };
  drawModal();
}
function closeModal() { const b = el('modalbg'); if (b) b.remove(); modalCtx = null; }

function detailRows(list) {
  if (!list.length) return `<tr><td colspan="6"><div class="empty-note">Aucune dépense pour l'instant — ajoutez-en une 👇</div></td></tr>`;
  return list.map((it, i) => `<tr data-i="${i}">
    <td><input class="di day" data-f="d" value="${esc(it.d || '')}" placeholder="JJ" maxlength="2"></td>
    <td><input class="di" data-f="lib" value="${esc(it.lib || '')}" placeholder="Lieu ou libellé — Carrefour, pharmacie…"></td>
    <td class="r"><input class="di num" data-f="amt" value="${it.amt ? nf.format(it.amt) : ''}" placeholder="0,00"></td>
    <td><div style="display:flex;gap:5px;align-items:center;justify-content:flex-end">
      <button class="qbtn ${+it.q === 100 ? 'on' : ''}" data-q="100" title="J'ai tout payé">Tout</button>
      <button class="qbtn ${+it.q === 50 ? 'on' : ''}" data-q="50" title="Partagé en deux">½</button>
      <input class="di pct" data-f="q" value="${it.q}" title="Pourcentage à ma charge"><span style="color:var(--ink-3)">%</span>
    </div></td>
    <td class="r" data-mine>${money(itemMine(it))}</td>
    <td><button class="xclose" data-del="${i}" title="Supprimer cette dépense">🗑️</button></td>
  </tr>`).join('');
}
function modalTotals(list) {
  const brut = list.reduce((s, x) => s + (+x.amt || 0), 0);
  const mine = list.reduce((s, x) => s + itemMine(x), 0);
  return { brut, mine };
}
function drawModal() {
  if (!modalCtx) return;
  const { path, id, m } = modalCtx;
  const l = findLine(path, id); if (!l) return closeModal();
  const list = l.d[m] || [];
  const t = modalTotals(list);
  const kind = path === 'rev' ? 'rev' : path === 'var' ? 'var' : 'fix';
  let bg = el('modalbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'modalbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onModalClick);
    bg.addEventListener('input', onModalInput);
  }
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>📋</span>
      <span>${emojiOf(l, kind)} ${esc(l.label)}</span>
      <span class="sub">${MONTHS[m]} ${state.activeYear}</span>
      <span class="right"></span>
      <button class="xclose" data-close="1" title="Fermer">✕</button></div>
    <div class="mbd">
      <div class="sharebar">
        <span>Appliquer à toutes les lignes :</span>
        <button class="qbtn" data-all="100">🙋‍♀️ J'ai tout payé</button>
        <button class="qbtn" data-all="50">💑 Moitié-moitié</button>
        <span class="right"></span>
      </div>
      <table class="dt">
        <thead><tr><th>Jour</th><th>Lieu / libellé</th><th class="r">Montant payé</th>
          <th class="r">À ma charge</th><th class="r">Compté</th><th></th></tr></thead>
        <tbody id="dtbody">${detailRows(list)}</tbody>
      </table>
      <div style="margin-top:12px"><button class="addbtn" data-addit="1">➕ Ajouter une dépense</button></div>
    </div>
    <div class="mft">
      <span class="dtot">Total dépensé <b id="dbrut">${money(t.brut)}</b></span>
      <span class="dtot">· À ma charge <b class="mine" id="dmine">${money(t.mine)}</b></span>
      <span class="dtot">→ la case affiche <b class="mine" id="dcell">${money(t.mine)}</b></span>
      <span class="right"></span>
      <button class="btn primary" data-close="1">✅ Terminé</button>
    </div></div>`;
}
function syncCell() {
  const { path, id, m } = modalCtx;
  const l = findLine(path, id); if (!l) return;
  recalcCell(l, m);
  const tr = document.querySelector(`tr.row[data-path="${path}"][data-id="${id}"]`);
  if (tr) {
    const inp = tr.querySelectorAll('.cell')[m];
    if (inp) {
      inp.value = l.v[m] ? nf.format(l.v[m]) : '';
      const nd = (l.d[m] || []).length;
      inp.classList.toggle('computed', !!nd);
      if (nd) inp.setAttribute('readonly', ''); else inp.removeAttribute('readonly');
      const cw = inp.closest('.cw');
      let pin = cw.querySelector('.pin');
      if (nd && !pin) { pin = document.createElement('span'); pin.className = 'pin'; pin.textContent = '📋'; cw.appendChild(pin); }
      if (!nd && pin) pin.remove();
    }
  }
  refreshTotals(); save();
  const t = modalTotals(l.d[m] || []);
  const b = el('dbrut'), mi = el('dmine'), ce = el('dcell');
  if (b) b.textContent = money(t.brut);
  if (mi) mi.textContent = money(t.mine);
  if (ce) ce.textContent = money(t.mine);
}
function onModalInput(e) {
  const inp = e.target.closest('.di'); if (!inp || !modalCtx) return;
  const tr = inp.closest('tr'), i = +tr.dataset.i;
  const l = findLine(modalCtx.path, modalCtx.id); if (!l) return;
  const it = l.d[modalCtx.m][i]; if (!it) return;
  const f = inp.dataset.f;
  if (f === 'amt') it.amt = parseNum(inp.value);
  else if (f === 'q') { let q = parseNum(inp.value); it.q = Math.max(0, Math.min(100, q)); }
  else if (f === 'd') { const d = parseInt(inp.value, 10); it.d = (d >= 1 && d <= 31) ? String(d) : ''; }
  else it[f] = inp.value;
  const cellMine = tr.querySelector('[data-mine]');
  if (cellMine) cellMine.textContent = money(itemMine(it));
  if (f === 'q') tr.querySelectorAll('.qbtn').forEach(b => b.classList.toggle('on', +b.dataset.q === +it.q));
  syncCell();
}
function onModalClick(e) {
  if (!modalCtx) return;
  if (e.target.id === 'modalbg') return closeModal();
  const btn = e.target.closest('button'); if (!btn) return;
  const l = findLine(modalCtx.path, modalCtx.id); if (!l) return;
  const list = l.d[modalCtx.m];
  if (btn.dataset.close) { syncCell(); closeModal(); render(); return; }
  if (btn.dataset.addit) {
    list.push({ id: uid(), d: '', lib: '', amt: 0, q: 100 });
    drawModal(); syncCell();
    const ins = document.querySelectorAll('#dtbody tr .di[data-f="lib"]');
    if (ins.length) ins[ins.length - 1].focus();
    return;
  }
  if (btn.dataset.del !== undefined) {
    list.splice(+btn.dataset.del, 1);
    syncCell(); drawModal();
    return;
  }
  if (btn.dataset.all) { list.forEach(it => it.q = +btn.dataset.all); syncCell(); drawModal();
    toast(+btn.dataset.all === 50 ? '💑 Moitié-moitié appliqué' : '🙋‍♀️ Tout à ma charge'); return; }
  if (btn.dataset.q) {
    const tr = btn.closest('tr'), it = list[+tr.dataset.i];
    if (it) { it.q = +btn.dataset.q; syncCell(); drawModal(); }
    return;
  }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalCtx) { syncCell(); closeModal(); render(); } });

viewNode.addEventListener('dblclick', e => {
  const c = e.target.closest('.cell'); if (!c) return;
  const tr = c.closest('tr.row'); if (!tr) return;
  openDetail(tr.dataset.path, tr.dataset.id, +c.dataset.m);
});
viewNode.addEventListener('click', e => {
  const c = e.target.closest('.cell.computed'); if (!c) return;
  const tr = c.closest('tr.row'); if (!tr) return;
  openDetail(tr.dataset.path, tr.dataset.id, +c.dataset.m);
});

/* --- sélecteur d'émoji --- */
let pickTarget = null;
function closePicker() { const p = el('emopick'); if (p) p.remove(); pickTarget = null; }
function openPicker(btn, tr) {
  closePicker();
  pickTarget = { tr };
  const p = document.createElement('div');
  p.className = 'emopick'; p.id = 'emopick';
  p.innerHTML = `<div class="ehd"><span>Choisir un émoji</span>
      <button class="mini-btn right" data-em="">Aucun</button>
      <button class="mini-btn" data-em="auto">Auto</button></div>
    <div class="eg">${EMOJI_LIST.map(e => `<button data-em="${e}">${e}</button>`).join('')}</div>`;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect();
  p.style.left = Math.max(8, Math.min(window.innerWidth - 306, r.left)) + 'px';
  p.style.top = Math.min(window.innerHeight - 290, r.bottom + 6) + 'px';
}
document.addEventListener('click', e => {
  const p = el('emopick'); if (!p) return;
  const b = e.target.closest('[data-em]');
  if (b && pickTarget) {
    const tr = pickTarget.tr, l = findLine(tr.dataset.path, tr.dataset.id);
    if (l) {
      const kind = tr.classList.contains('b-rev') ? 'rev' : tr.classList.contains('b-var') ? 'var' : 'fix';
      if (b.dataset.em === 'auto') delete l.e; else l.e = b.dataset.em;
      const btn = tr.querySelector('.emo'); if (btn) btn.textContent = emojiOf(l, kind);
      save();
    }
    closePicker(); return;
  }
  if (!e.target.closest('.emopick') && !e.target.closest('.emo')) closePicker();
});

/* --- clics : ajout / suppression / déplacement / vidage --- */
function clearLines(lines) { lines.forEach(l => { l.v = z12(); l.s = e12(); l.d = {}; }); }
viewNode.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const tr = btn.closest('tr.row');

  if (btn.dataset.m !== undefined && btn.closest('.msel')) { selMonth = +btn.dataset.m; render(); return; }
  if (btn.dataset.tri) { moisTri = btn.dataset.tri; render(); return; }

  if (btn.classList.contains('st') && tr) { cycleStatus(tr, +btn.dataset.st); return; }
  if (btn.dataset.act === 'emoji' && tr) { openPicker(btn, tr); return; }

  if (btn.dataset.add) {
    const b = bucket(btn.dataset.add);
    if (b) {
      b.push(ln('Nouvelle ligne', null, {})); save(); render();
      const rows = document.querySelectorAll(`tr.row[data-path="${btn.dataset.add}"]`);
      const tr = rows[rows.length - 1];
      if (tr) {
        tr.classList.add('neuf');
        setTimeout(() => tr.classList.remove('neuf'), 1700);
        tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        const lab = tr.querySelector('.lab-in');
        if (lab) { lab.focus(); lab.select(); }
      }
      toast('➕ Ligne ajoutée');
    }
    return;
  }
  if (btn.dataset.addcat) {
    Y().fixes.push({ id: uid(), name: 'Nouvelle catégorie', lines: [ln('Nouvelle ligne', null, {})] });
    save(); render(); toast('📂 Catégorie ajoutée'); return;
  }
  if (btn.dataset.delcat) {
    const y = Y(), i = y.fixes.findIndex(c => c.id === btn.dataset.delcat);
    if (i < 0) return;
    if (!confirm(`Supprimer la catégorie « ${y.fixes[i].name} » et ses ${y.fixes[i].lines.length} ligne(s) ?`)) return;
    y.fixes.splice(i, 1); save(); render(); toast('🗑️ Catégorie supprimée'); return;
  }
  if (btn.dataset.clearcat) {
    const cat = Y().fixes.find(c => c.id === btn.dataset.clearcat); if (!cat) return;
    if (!confirm(`Remettre à zéro tous les montants de « ${cat.name} » ? Les lignes restent en place.`)) return;
    clearLines(cat.lines); save(); render(); toast('🧹 ' + cat.name + ' vidée');
    return;
  }
  if (btn.dataset.sortcat) {
    const cat = Y().fixes.find(c => c.id === btn.dataset.sortcat); if (!cat) return;
    sortByDay(cat.lines); save(); render();
    animeLignes(`tr.row[data-path="fix:${cat.id}"]`);
    toast(`📅 « ${cat.name} » classée par jour de prélèvement`);
    return;
  }
  if (btn.dataset.sort) {
    const k = btn.dataset.sort, y = Y();
    if (k === 'all' && !confirm("Classer TOUTES les lignes du tableau par jour de prélèvement ?\n\nL'ordre que vous avez mis à la main sera remplacé. Les lignes sans date passent à la fin de leur bloc.")) return;
    if (k === 'rev') sortByDay(y.revenus);
    else if (k === 'fix') y.fixes.forEach(c => sortByDay(c.lines));
    else if (k === 'var') sortByDay(y.variables);
    else { sortByDay(y.revenus); y.fixes.forEach(c => sortByDay(c.lines)); sortByDay(y.variables); }
    save(); render();
    animeLignes(k === 'all' ? 'tr.row' : (k === 'fix' ? 'tr.row[data-path^="fix:"]' : `tr.row[data-path="${k}"]`));
    toast('📅 Classé dans l’ordre des prélèvements');
    return;
  }
  if (btn.dataset.clear) {
    const k = btn.dataset.clear, y = Y();
    const label = k === 'rev' ? 'du bloc Revenus' : k === 'fix' ? 'du bloc Dépenses fixes'
      : k === 'var' ? 'du bloc Dépenses variables' : `de toute l'année ${state.activeYear}`;
    if (!confirm(`Remettre à zéro tous les montants ${label} ?\n\nLes lignes, catégories et émojis restent en place — seuls les chiffres et les statuts sont effacés.`)) return;
    if (k === 'rev') clearLines(y.revenus);
    else if (k === 'fix') y.fixes.forEach(c => clearLines(c.lines));
    else if (k === 'var') clearLines(y.variables);
    else { clearLines(y.revenus); y.fixes.forEach(c => clearLines(c.lines)); clearLines(y.variables); }
    save(); render(); toast('🧹 Montants remis à zéro');
    return;
  }
  if (tr) {
    const b = bucket(tr.dataset.path); if (!b) return;
    const i = b.findIndex(l => l.id === tr.dataset.id); if (i < 0) return;
    const act = btn.dataset.act;
    if (act === 'epargne') {
      const l = b[i];
      l.ep = !isSavings(l);
      save(); render();
      toast(l.ep ? `🐖 « ${l.label} » compte comme épargne` : `💳 « ${l.label} » redevient une dépense`);
      return;
    }
    if (act === 'delline') {
      if (lineTotal(b[i]) && !confirm(`Supprimer « ${b[i].label} » et ses montants ?`)) return;
      b.splice(i, 1); save(); render(); toast('🗑️ Ligne supprimée');
    } else if (act === 'up' && i > 0) { [b[i - 1], b[i]] = [b[i], b[i - 1]]; save(); render(); }
    else if (act === 'down' && i < b.length - 1) { [b[i + 1], b[i]] = [b[i], b[i + 1]]; save(); render(); }
    else if (act === 'fill') openCopie(tr.dataset.path, tr.dataset.id);
    return;
  }
  if (btn.dataset.goyear) { state.activeYear = +btn.dataset.goyear; view = 'annuel'; save(); render(); return; }
  if (btn.dataset.delyear) {
    const y = btn.dataset.delyear;
    if (!confirm(`Supprimer définitivement le budget ${y} ?`)) return;
    delete state.years[y];
    if (String(state.activeYear) === y) state.activeYear = +Object.keys(state.years).sort()[0];
    save(); render(); toast('🗑️ Budget supprimé'); return;
  }
  if (btn.dataset.newyear) {
    const target = prompt('Année à créer :', +state.activeYear + 1);
    if (!target) return;
    const k = String(parseInt(target, 10));
    if (k === 'NaN') return;
    if (state.years[k] && !confirm(`Le budget ${k} existe déjà. L'écraser ?`)) return;
    if (btn.dataset.newyear === 'copy') {
      const src = JSON.parse(JSON.stringify(Y()));
      src.revenus.forEach(l => { l.id = uid(); l.v = z12(); l.s = e12(); l.d = {}; });
      src.fixes.forEach(c => {
        c.id = uid();
        c.lines.forEach(l => { l.id = uid(); const last = [...l.v].reverse().find(x => +x) || 0; l.v = new Array(12).fill(last); l.s = e12(); l.d = {}; });
      });
      src.variables.forEach(l => { l.id = uid(); l.v = z12(); l.s = e12(); l.d = {}; });
      state.years[k] = src;
    } else state.years[k] = blankYear();
    state.activeYear = +k; view = 'annuel'; save(); render(); toast('✨ Budget ' + k + ' créé');
    return;
  }
  if (btn.dataset.reset) { openRaz(); return; }
  if (btn.id === 'btnExport2') doExport();
  if (btn.id === 'btnImport2') el('fileIn').click();
  if (btn.id === 'btnCsv') doCsv();
  if (btn.id === 'btnXlsx') el('fileIn').click();
  if (btn.id === 'btnBanque') el('fileBank').click();
  if (btn.id === 'btnHumour') {
    setHumour(!humourOn); render();
    toast(humourOn ? '😄 C2019est reparti pour les blagues' : '😐 Blagues coupées — que du sérieux', humourOn ? 'fun' : '');
  }
});

/* --- sauvegardes --- */
function download(name, content, type) {
  const b = new Blob([content], { type: type || 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function doExport() {
  download(`NaoBudget-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 1));
  toast('💾 Sauvegarde téléchargée');
}
function doCsv() {
  const y = Y(), rows = [];
  rows.push(['Bloc', 'Catégorie', 'Poste', 'Jour', ...MONTHS, 'Total annuel']);
  const add = (bloc, cat, l) => rows.push([bloc, cat, l.label, l.day || '',
    ...l.v.map((x, i) => (String(x || 0).replace('.', ',')) + (l.s[i] === 'p' ? ' (payé)' : l.s[i] === 'r' ? ' (rejeté)' : '')),
    String(lineTotal(l)).replace('.', ',')]);
  y.revenus.forEach(l => add('Revenus', '', l));
  y.fixes.forEach(c => c.lines.forEach(l => add('Dépenses fixes', c.name, l)));
  y.variables.forEach(l => add('Dépenses variables', '', l));
  const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  download(`NaoBudget-${state.activeYear}.csv`, csv, 'text/csv;charset=utf-8');
  toast('📊 Fichier Excel téléchargé');
}
el('btnExport').onclick = doExport;
el('btnImport').onclick = () => el('fileIn').click();
el('btnPrint').onclick = openPrint;
el('fileIn').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  /* .ofx : c'est un relevé de banque ; .xlsx / .csv : un tableau ; .json : une sauvegarde. */
  if (/\.(ofx|qfx)$/i.test(f.name)) { startBanque(f); e.target.value = ''; return; }
  if (/\.(xlsx|xlsm|xls|csv|tsv|txt)$/i.test(f.name)) { startImport(f); e.target.value = ''; return; }
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!s || !s.years) throw new Error('format');
      if (!confirm('Remplacer le budget actuel par cette sauvegarde ?')) return;
      state = migrate(s);
      if (!state.years[String(state.activeYear)]) state.activeYear = +Object.keys(state.years).sort()[0];
      save(); render(); toast('📂 Sauvegarde chargée');
    } catch (err) { alert('Ce fichier n’est pas une sauvegarde NaoBudget valide.'); }
  };
  r.readAsText(f); e.target.value = '';
};

/* ============================================================
   Réinitialisation — rendre l'outil vierge
   Trois états d'arrivée, et on dit clairement ce qu'on efface.
   ============================================================ */
let razCtx = null;
function closeRaz() { const n = el('razbg'); if (n) n.remove(); razCtx = null; }

function statsRaz() {
  const ans = Object.keys(state.years || {});
  let lignes = 0, montants = 0, details = 0;
  ans.forEach(a => {
    const y = state.years[a] || {};
    const tout = [...(y.revenus || []), ...(y.fixes || []).flatMap(c => c.lines || []), ...(y.variables || [])];
    lignes += tout.length;
    tout.forEach(l => {
      montants += (l.v || []).filter(x => +x).length;
      if (l.d) details += Object.keys(l.d).reduce((s, k) => s + (l.d[k] || []).length, 0);
    });
  });
  return { ans: ans.length, lignes, montants, details, appris: Object.keys(state.appris || {}).length };
}

function openRaz() {
  razCtx = { budgets: true, appris: true, reglages: false, mode: 'neuf' };
  drawRaz();
}
function drawRaz() {
  if (!razCtx) return;
  const s = statsRaz(), c = razCtx;
  const modes = [
    ['neuf', '🌱', 'Un tableau neuf', 'Quelques lignes types pour démarrer : salaire, loyer, électricité, courses…'],
    ['vide', '🗑️', 'Complètement vide', 'Aucune ligne. Les trois blocs, et rien dedans : tout est à écrire.'],
    ['exemple', '🎁', 'L’exemple 2026', 'Remet le budget de démonstration livré avec l’outil.']
  ];
  let bg = el('razbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'razbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onRazClick);
    bg.addEventListener('change', e => {
      const k = e.target.dataset.raz;
      if (k) { razCtx[k] = e.target.checked; drawRaz(); }
    });
  }
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>🧨</span><span>Réinitialiser NaoBudget</span>
      <span class="sub">rendre l'outil vierge</span><span class="right"></span>
      <button class="xclose" data-razclose="1" title="Fermer">✕</button></div>
    <div class="mbd">
      <div class="razalerte">
        <b>⚠️ Ce qui va disparaître, définitivement</b>
        <div class="razchiffres">
          <span><b>${s.ans}</b> année(s)</span>
          <span><b>${s.lignes}</b> ligne(s)</span>
          <span><b>${s.montants}</b> montant(s) saisi(s)</span>
          <span><b>${s.details}</b> dépense(s) détaillée(s)</span>
        </div>
        <p>Il n'y a pas de retour en arrière. Prenez une sauvegarde d'abord : c'est un fichier,
          vous pourrez le recharger à tout moment.</p>
        <button class="btn primary" id="razExport">💾 Exporter une sauvegarde maintenant</button>
      </div>

      <p class="razlab">Après la remise à zéro, je veux…</p>
      <div class="razmodes">
        ${modes.map(([k, em, titre, txt]) => `<button class="razmode ${c.mode === k ? 'on' : ''}" data-razmode="${k}">
          <span class="em">${em}</span><b>${titre}</b><span class="d">${txt}</span></button>`).join('')}
      </div>

      <p class="razlab">Et j'efface aussi…</p>
      <label class="chk"><input type="checkbox" data-raz="budgets" ${c.budgets ? 'checked' : ''}>
        <span>📊 <b>Les budgets</b> — toutes les années, lignes, montants, détails et vos notes</span></label>
      <label class="chk"><input type="checkbox" data-raz="appris" ${c.appris ? 'checked' : ''}>
        <span>🏦 <b>Les rapprochements appris</b> — les ${s.appris} association(s) libellé bancaire → ligne</span></label>
      <label class="chk"><input type="checkbox" data-raz="reglages" ${c.reglages ? 'checked' : ''}>
        <span>⚙️ <b>Les réglages</b> — thème clair/sombre et petites blagues reviennent par défaut</span></label>
      ${!c.budgets ? '<p class="raznote">Les budgets sont conservés : seul ce qui est coché ci-dessus sera effacé.</p>' : ''}
    </div>
    <div class="mft">
      <span class="dtot">L'outil se rechargera comme au premier jour.</span>
      <span class="right"></span>
      <button class="btn" data-razclose="1">Annuler</button>
      <button class="btn danger" data-razgo="1" ${(c.budgets || c.appris || c.reglages) ? '' : 'disabled'}>
        🧨 Réinitialiser</button>
    </div></div>`;
}
function onRazClick(e) {
  if (!razCtx) return;
  if (e.target.id === 'razbg') return closeRaz();
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.razclose) return closeRaz();
  if (b.id === 'razExport') { doExport(); return; }
  if (b.dataset.razmode) { razCtx.mode = b.dataset.razmode; razCtx.budgets = true; drawRaz(); return; }
  if (b.dataset.razgo) appliqueRaz();
}
function appliqueRaz() {
  const c = razCtx, s = statsRaz();
  const quoi = [c.budgets ? 'tous les budgets' : null,
                c.appris ? 'les rapprochements appris' : null,
                c.reglages ? 'les réglages' : null].filter(Boolean).join(', ');
  if (!confirm(`Dernière vérification.\n\nJe vais effacer : ${quoi}.\n`
    + (c.budgets ? `Soit ${s.lignes} ligne(s) et ${s.montants} montant(s) sur ${s.ans} année(s).\n` : '')
    + `\nCette action est définitive. On y va ?`)) return;
  if (c.budgets) {
    const an = (new Date()).getFullYear();
    const garde = c.appris ? {} : { appris: state.appris };
    state = { version: 2, activeYear: an, years: {}, ...garde };
    if (c.mode === 'exemple') { state.activeYear = 2026; state.years[2026] = seed2026(); }
    else if (c.mode === 'vide') state.years[an] = { revenus: [], fixes: [], variables: [] };
    else state.years[an] = blankYear();
  }
  if (c.appris) delete state.appris;
  if (c.reglages) {
    try { localStorage.removeItem(THEME_KEY); } catch (e) {}
    document.documentElement.removeAttribute('data-theme');
    setHumour(true);
  }
  saveNow();
  closeRaz();
  rechargePage();
}

/* ============================================================
   Thème clair / sombre
   ============================================================ */
const THEME_KEY = 'naobudget.theme';
function themeIsDark() {
  const forced = document.documentElement.getAttribute('data-theme');
  if (forced) return forced === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function paintThemeSwitch() {
  const dark = themeIsDark(), sw = el('theme-switch');
  sw.setAttribute('aria-checked', dark ? 'true' : 'false');
  sw.setAttribute('aria-label', dark ? 'Passer en thème clair' : 'Passer en thème sombre');
  sw.title = dark ? 'Thème sombre — cliquer pour le thème clair' : 'Thème clair — cliquer pour le thème sombre';
  el('theme-icon').textContent = dark ? '🌙' : '☀️';
}
function applyTheme(t) {
  if (t) document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem(THEME_KEY, t || 'auto'); } catch (e) {}
  paintThemeSwitch();
}
(function initTheme() {
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (stored === 'dark' || stored === 'light') document.documentElement.setAttribute('data-theme', stored);
  paintThemeSwitch();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!document.documentElement.getAttribute('data-theme')) paintThemeSwitch();
    });
  }
})();
el('theme-switch').addEventListener('click', () => {
  const next = themeIsDark() ? 'light' : 'dark';
  if (document.startViewTransition) document.startViewTransition(() => applyTheme(next));
  else applyTheme(next);
});

render();

/* ---------- Relevé bancaire ---------- */
el('fileBank').onchange = e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (f) startBanque(f);
};

/* ---------- L'entrée dans l'outil ---------- */
function entree() {
  const intro = el('intro'); if (!intro) return;
  const finir = () => { if (intro.isConnected) intro.remove(); document.body.classList.remove('entree'); };
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
  document.body.classList.add('entree');
  intro.addEventListener('click', () => {
    intro.style.animation = 'introSort .38s ease forwards';
    const sh = document.querySelector('.shell');
    if (sh) sh.style.animation = 'emergeApp .5s ease both';
    setTimeout(finir, 400);
  });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4200);            /* filet de sécurité */
}

notesInit();
entree();
