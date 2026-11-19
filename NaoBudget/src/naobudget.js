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
   Données de départ (tableau neuf et budget d’exemple fictif)
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
/* Budget de démonstration : montants et libellés inventés, ne correspondent à personne. */
function seed2026() {
  const tous = x => { const o = {}; for (let m = 1; m <= 12; m++) o[m] = x; return o; };
  return {
    revenus: [
      ln('Salaire', 28, { 1: 2150, 2: 2150, 3: 2150, 4: 2150, 5: 2150, 6: 2150, 7: 2150, 8: 2150, 9: 2200, 10: 2200, 11: 2200, 12: 2200 }),
      ln('Primes', null, { 6: 300, 12: 1100 }),
      ln('Remboursements (mutuelle, trop-perçu…)', null, { 3: 24.50, 9: 18 }),
      ln('Ventes d’occasion', null, { 4: 60, 10: 45 })
    ],
    fixes: [
      { id: uid(), name: 'Logement', lines: [
        ln('Loyer et charges', 5, tous(640)),
        ln('Électricité', 15, tous(42)),
        ln('Eau', 20, { 2: 38, 5: 38, 8: 38, 11: 38 }),
        ln('Assurance habitation', 10, tous(15.50))
      ]},
      { id: uid(), name: 'Transport', lines: [
        ln('Assurance auto', 8, tous(48)),
        ln('Carburant', null, { 1: 70, 2: 55, 3: 80, 4: 65, 5: 75, 6: 90, 7: 110, 8: 95, 9: 60, 10: 70, 11: 65, 12: 85 }),
        ln('Transports en commun', 1, { 9: 75, 10: 75, 11: 75, 12: 75 })
      ]},
      { id: uid(), name: 'Impôts', lines: [
        ln('Prélèvement à la source', 15, tous(85)),
        ln('Taxe foncière', 15, { 10: 410 })
      ]},
      { id: uid(), name: 'Abonnements et cotisations', lines: [
        ln('Mutuelle', 5, tous(32)),
        ln('Box internet', 12, tous(29.99)),
        ln('Forfait mobile', 2, tous(12.99)),
        ln('Frais bancaires', 6, tous(2.50)),
        ln('Musique en ligne', 14, tous(10.99)),
        ln('Salle de sport', 3, tous(24.90))
      ]}
    ],
    variables: [
      ln('Courses alimentaires', null, { 1: 310, 2: 285, 3: 320, 4: 295, 5: 330, 6: 300, 7: 350, 8: 340, 9: 305, 10: 315, 11: 290, 12: 380 }),
      ln('Restaurants / sorties', null, { 1: 45, 2: 60, 3: 30, 4: 55, 5: 70, 6: 85, 7: 95, 8: 110, 9: 40, 10: 50, 11: 35, 12: 120 }),
      ln('Vêtements', null, { 1: 80, 4: 45, 9: 95, 11: 60 }),
      ln('Cadeaux', null, { 3: 40, 6: 35, 12: 260 }),
      ln('Frais de santé', null, { 2: 25, 7: 18, 11: 30 }),
      ln('Entretien voiture', null, { 5: 180 }),
      ln('Vacances / voyages', null, { 7: 450, 8: 380 }),
      ln('Livret d’épargne', null, tous(100))
    ]
  };
}

/* ============================================================
   État
   ============================================================ */
let state = load();
let view = 'annuel';
let selMonth = (new Date()).getMonth();
let moisTri = 'montant';   /* ordre d'affichage du récapitulatif imprimé du mois */
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
/* Noms qui disent « épargne » : livrets, PEL, PEA, LEP, LDDS, PER, assurance vie (« ass vie », « AV »)… */
const SAV_RE = /epargne|livret|\bpel\b|\bcel\b|\bpea\b|\blep\b|\bldds?\b|\bper\b|ass(urance)?\.? ?vie|\bav\b|compte a terme|bloque|mise de cote|placement|tirelire/;
const isSavings = l => l.pe ? false : (l.ep === undefined || l.ep === null) ? SAV_RE.test(noAcc(l.label)) : !!l.ep;
function savingsMonths() {
  const y = Y(), t = z12();
  [...y.fixes.flatMap(c => c.lines), ...y.variables].forEach(l => {
    if (isSavings(l)) l.v.forEach((x, i) => t[i] += (+x || 0));
  });
  return t;
}

/* ---------- D'où vient l'argent, où il va ----------
   Chaque ligne dit par où passe l'argent. Revenus : 💼 salaire (par défaut),
   🔁 virement reçu, 🐖 pris sur l'épargne. Dépenses : 💳 payée depuis le
   compte (par défaut), 🐖 mise de côté (l.ep), 🏦 payée avec l'épargne (l.pe :
   le compte courant n'est pas touché, c'est le livret qui baisse). */
const FLUX_REV = {
  sal: { em: '💼', nom: 'Salaire / revenu', court: 'salaire',
    d: 'Ce que vous gagnez : salaire, prime, chômage, pension… Arrive sur le compte courant.' },
  vir: { em: '🔁', nom: 'Virement reçu', court: 'virement',
    d: 'Quelqu’un vous envoie de l’argent : remboursement, aide, CAF, cadeau, participation d’un proche. Arrive sur le compte courant.' },
  epg: { em: '🐖', nom: 'Pris sur l’épargne', court: 'épargne',
    d: 'Vous faites revenir de l’argent du livret vers le compte courant. Ce n’est pas un gain : l’épargne baisse d’autant.' }
};
const FLUX_DEP = {
  cpt: { em: '💳', nom: 'Payé depuis le compte', court: 'compte',
    d: 'Une dépense normale, prélevée sur le compte courant.' },
  vers: { em: '🐖', nom: 'Mis de côté (vers l’épargne)', court: 'mis de côté',
    d: 'Un virement vers un livret : l’argent quitte le compte courant mais reste à vous. Il s’ajoute à l’épargne.' },
  pe: { em: '🏦', nom: 'Payé avec l’épargne', court: 'payé avec l’épargne',
    d: 'Une dépense réglée directement depuis le livret : le compte courant n’est pas touché, l’épargne baisse.' }
};
const REV_EPG_RE = /epargne|livret|\bpel\b|\bcel\b|\bpea\b|\blep\b|\bldds?\b|\bper\b|ass(urance)?\.? ?vie|tirelire/;
const REV_VIR_RE = /virement|rembours|\bcaf\b|\bapl\b|\baide|cadeau|\bdon\b|participation/;
function fluxOf(l, kind) {
  if (kind === 'rev') {
    if (FLUX_REV[l.fl]) return l.fl;
    const n = noAcc(l.label);
    return REV_EPG_RE.test(n) ? 'epg' : REV_VIR_RE.test(n) ? 'vir' : 'sal';
  }
  if (l.pe) return 'pe';
  return isSavings(l) ? 'vers' : 'cpt';
}
const fluxInfo = (l, kind) => (kind === 'rev' ? FLUX_REV : FLUX_DEP)[fluxOf(l, kind)];
function setFlux(l, kind, f) {
  if (kind === 'rev') { l.fl = f; return; }
  if (f === 'pe') l.pe = true; else delete l.pe;
  l.ep = f === 'vers';
}

/* ---------- Les deux comptes ----------
   Compte courant : solde au 1er janvier + tout ce qui rentre − ce qui en sort
   (dépenses payées depuis le compte et virements vers l'épargne).
   Épargne : solde au 1er janvier + ce qui est mis de côté − ce qui est repris
   (rentrées « pris sur l'épargne » et dépenses « payé avec l'épargne »).
   Un « solde réel » saisi pour une fin de mois remplace le calcul : les mois
   suivants repartent de ce chiffre, et l'écart avec le calcul est affiché. */
const r2 = x => Math.round(x * 100) / 100;
const vide = v => v === null || v === undefined || v === '';
function comptes(y) {
  y = y || Y();
  const k = y.comptes || {}, rcc = k.rcc || {}, rep = k.rep || {};
  const rev = { sal: z12(), vir: z12(), epg: z12() }, cpt = z12(), vers = z12(), pe = z12();
  const lig = { sal: [], vir: [], epg: [], cpt: [], vers: [], pe: [] };
  (y.revenus || []).forEach(l => {
    const f = fluxOf(l, 'rev'); lig[f].push(l);
    l.v.forEach((x, i) => rev[f][i] += (+x || 0));
  });
  [...(y.fixes || []).flatMap(c => c.lines), ...(y.variables || [])].forEach(l => {
    const f = fluxOf(l, 'fix'); lig[f].push(l);
    const t = f === 'vers' ? vers : f === 'pe' ? pe : cpt;
    l.v.forEach((x, i) => t[i] += (+x || 0));
  });
  const cc = [], ep = [], ccCalc = [], epCalc = [];
  let a = +k.cc0 || 0, b = +k.ep0 || 0;
  for (let i = 0; i < 12; i++) {
    a = r2(a + rev.sal[i] + rev.vir[i] + rev.epg[i] - cpt[i] - vers[i]);
    b = r2(b + vers[i] - rev.epg[i] - pe[i]);
    ccCalc.push(a); epCalc.push(b);
    if (!vide(rcc[i])) a = +rcc[i];
    if (!vide(rep[i])) b = +rep[i];
    cc.push(a); ep.push(b);
  }
  return { rev, cpt, vers, pe, lig, cc, ep, ccCalc, epCalc, rcc, rep,
    tot: cc.map((x, i) => r2(x + ep[i])),
    cc0: +k.cc0 || 0, ep0: +k.ep0 || 0, aCc0: !vide(k.cc0), aEp0: !vide(k.ep0) };
}
/* Mois de référence : le mois en cours pour l'année en cours, sinon décembre. */
const moisRef = () => { const m = curM(); return m >= 0 ? m : 11; };
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
  v.classList.toggle('calme', rendCalme);
  autoCache = null;   /* mise à jour après saisie : pas d'animation d'entrée */
  if (view === 'annuel') v.innerHTML = viewAnnuel();
  else if (view === 'mois') v.innerHTML = viewMois();
  else if (view === 'graph') v.innerHTML = viewGraph();
  else if (view === 'epargne') v.innerHTML = viewEpargne();
  else if (view === 'agenda') v.innerHTML = viewAgenda();
  else v.innerHTML = viewReglages();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
  if (view === 'annuel' || view === 'mois') formatAllCells();
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
/* Les mêmes tableaux servent aux deux vues : l'année montre les 12 mois,
   « Le mois » n'en montre qu'un. ms = les mois affichés en colonnes. */
const ALLM = MONTHS.map((_, i) => i);

function headRow(ms) {
  const cm = curM(), seul = ms.length === 1;
  return `<tr>
    <th class="c-lab">Poste</th><th class="c-day" title="Jour de prélèvement">📅</th>
    ${ms.map(i => `<th class="${i === cm ? 'cur' : ''}" title="${MONTHS[i]}">${seul ? MONTHS[i] + ' ' + state.activeYear : MSHORT[i]}</th>`).join('')}
    <th class="c-tot">Total annuel</th></tr>`;
}
function rowHTML(l, path, kind, ms) {
  const cm = curM();
  const fl = fluxOf(l, kind), fi = fluxInfo(l, kind);
  return `<tr class="row b-${kind} fx-${fl}" data-path="${path}" data-id="${l.id}">
    <td class="c-lab"><div class="labwrap">
      <button class="emo" data-act="emoji" title="Changer l'émoji">${emojiOf(l, kind)}</button>
      <input class="lab-in" value="${esc(l.label)}" data-k="label" placeholder="Nom du poste">
      <button class="del" data-act="up" title="Monter">▲</button>
      <button class="del" data-act="down" title="Descendre">▼</button>
      <button class="del" data-act="fill" title="Recopier une case sur d'autres mois — montant, détail et parts compris">📋</button>
      <button class="del flux fl-${fl}" data-act="flux"
        title="${esc(fi.em + ' ' + fi.nom + ' — ' + fi.d)} Cliquer pour changer.">${fi.em}</button>
      <button class="del" data-act="delline" title="Supprimer la ligne">✕</button>
    </div></td>
    <td><input class="day-in" data-k="day" value="${l.day || ''}" placeholder="–" maxlength="2" title="Jour de prélèvement"></td>
    ${ms.map(i => {
      const x = l.v[i], st = l.s[i] || '';
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
function sumRow(label, arr, total, kind, id, ms) {
  return `<tr class="sum ${kind}"><td class="c-lab">${label}</td><td></td>
    ${ms.map(i => [arr[i], i]).map(([x, i]) => `<td id="${id}_${i}">${x ? nf.format(x) : '–'}</td>`).join('')}
    <td class="tot" id="${id}_t">${money(total)}</td></tr>`;
}
function restRow(label, subtitle, arr, total, id, ms) {
  return `<tr class="rest"><td class="c-lab">${label}<small>${subtitle}</small></td><td></td>
    ${ms.map(i => [arr[i], i]).map(([x, i]) => `<td id="${id}_${i}"><span class="${x >= 0 ? 'chip-pos' : 'chip-neg'}">${nf.format(x)}</span></td>`).join('')}
    <td class="tot" id="${id}_t"><span class="${total >= 0 ? 'chip-pos' : 'chip-neg'}">${money(total)}</span></td></tr>`;
}
const colGroup = ms => `<colgroup><col class="cl"><col class="cd">${ms.map(() => ms.length === 1 ? '<col class="cm">' : '<col>').join('')}<col class="ct"></colgroup>`;
function blkOpen(emoji, title, count, clearKey, extra, sens, ms) {
  const seul = ms.length === 1;
  return `<section class="blk blk-${sens === '+' ? 'in' : 'out'}${seul ? ' blk-mois' : ''}">
    <div class="blkhd">
      <div class="bh"><span class="em">${emoji}</span><span>${title}</span>
        <span class="sens ${sens === '+' ? 'plus' : 'moins'}">${sens === '+' ? '+ ce qui rentre' : '− ce qui sort'}</span>
        <span class="cnt">${count} ligne${count > 1 ? 's' : ''}</span></div>
      <div class="bha">${extra || ''}
        <button class="mini-btn" data-sort="${clearKey}" title="Classer les lignes dans l'ordre des prélèvements du mois">📅 Trier par jour</button>
        <button class="mini-btn" data-clear="${clearKey}" title="Remettre à zéro ${seul ? 'les montants de ce bloc pour ' + MONTHS[ms[0]].toLowerCase() + ' seulement' : 'tous les montants de ce bloc'}">🧹 Vider ce bloc</button></div>
    </div>
    <table class="grid">${colGroup(ms)}<thead>${headRow(ms)}</thead><tbody>`;
}
const blkClose = () => `</tbody></table></section>`;
function addRowHTML(path, txt, ms) {
  return `<tr class="addrow"><td class="c-lab" colspan="${ms.length + 3}">
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
    </div></div>`;
  if (!y.revenus.length && !nFix && !y.variables.length) {
    h += `<div class="vide-aide"><span class="em">🌱</span><span>Votre tableau est <b>vide</b> : ajoutez une première ligne
      avec ➕ dans chaque bloc.</span><button type="button" class="lien-aide" data-aide="debut">❓ Comment ça marche</button></div>`;
  }
  h += tableBlocs(ALLM);
  return h;
}

/* Les trois blocs (revenus, fixes, variables), pour les mois ms. */
function tableBlocs(ms) {
  const y = Y(), c = calc(), seul = ms.length === 1;
  const nFix = y.fixes.reduce((n, k) => n + k.lines.length, 0);
  let h = `<div class="tblwrap${seul ? ' tbl-mois' : ''}">`;

  h += blkOpen('💰', 'Revenus', y.revenus.length, 'rev', '', '+', ms);
  y.revenus.forEach(l => h += rowHTML(l, 'rev', 'rev', ms));
  h += addRowHTML('rev', 'Ajouter un revenu', ms);
  h += sumRow('Total revenus', c.inc, c.tInc, 'rev', 'sm_rev', ms);
  h += blkClose();

  h += blkOpen('🏠', 'Dépenses fixes', nFix, 'fix', '<button class="mini-btn" data-addcat="1">➕ Catégorie</button>', '−', ms);
  y.fixes.forEach(cat => {
    h += `<tr class="cathd"><td colspan="${ms.length + 3}"><div class="catrow">
        <input class="cat-in" value="${esc(cat.name)}" data-cat="${cat.id}" placeholder="Nom de la catégorie">
        <button class="mini-btn" data-sortcat="${cat.id}" title="Classer cette catégorie par jour de prélèvement">📅 Trier</button>
        <button class="mini-btn" data-clearcat="${cat.id}" title="Remettre à zéro les montants de cette catégorie${seul ? ' pour ' + MONTHS[ms[0]].toLowerCase() + ' seulement' : ''}">🧹 Vider</button>
        <button class="mini-btn" data-delcat="${cat.id}" title="Supprimer la catégorie">🗑️ Supprimer</button>
      </div></td></tr>`;
    cat.lines.forEach(l => h += rowHTML(l, 'fix:' + cat.id, 'fix', ms));
    h += addRowHTML('fix:' + cat.id, 'Ajouter une ligne dans « ' + esc(cat.name) + ' »', ms);
  });
  h += sumRow('Total dépenses fixes', c.fix, c.tFix, '', 'sm_fix', ms);
  h += restRow('Reste', 'pour les dépenses variables', c.rest1, c.tR1, 'rs1', ms);
  h += blkClose();

  h += blkOpen('🛍️', 'Dépenses variables', y.variables.length, 'var', '', '−', ms);
  y.variables.forEach(l => h += rowHTML(l, 'var', 'var', ms));
  h += addRowHTML('var', 'Ajouter une dépense variable', ms);
  h += sumRow('Total dépenses variables', c.vr, c.tVar, 'varb', 'sm_var', ms);
  h += restRow('Reste au total', 'pour épargner ou les dépenses exceptionnelles', c.rest2, c.tR2, 'rs2', ms);
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
  const bil = document.querySelector('.mois-bilan'); if (bil) bil.innerHTML = bilanMois(selMonth);
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
/* « Le mois » : le même tableau modifiable que l'année, réduit au mois choisi,
   avec le bilan du mois à côté. */
function viewMois() {
  const m = selMonth, nom = MONTHS[m].toLowerCase();
  let h = `<div class="msel">${MONTHS.map((n, i) => `<button data-m="${i}" class="${i === m ? 'on' : ''}">${MEMO[i]} ${n}</button>`).join('')}</div>`;
  h += `<div class="card"><div class="hd">
      <h2><span>📆</span> ${MONTHS[m]} ${state.activeYear}</h2>
      <span class="legend-st"><b>− Dépenses :</b> ✅ payé · rien = inscrit · ❌ rejeté
        &nbsp;·&nbsp; <b>+ Revenus :</b> 💰 encaissé · rien = attendu
        &nbsp;·&nbsp; clic sur la pastille ou clic droit dans la case
        &nbsp;·&nbsp; <b>📋 double-clic</b> = détailler</span>
      <span class="right"></span>
      <button class="mini-btn" data-addcat="1">➕ Catégorie</button>
      <button class="mini-btn" data-sort="all" title="Classer toutes les lignes du tableau par jour de prélèvement">📅 Trier tout par jour</button>
      <button class="mini-btn" data-clear="all" title="Remettre à zéro tous les montants de ${nom} — les autres mois ne bougent pas">🧹 Vider tout le mois</button>
    </div></div>`;
  h += `<div class="mois-edit">${tableBlocs([m])}<div class="mois-bilan">${bilanMois(m)}</div></div>`;
  return h;
}
function bilanMois(m) {
  const c = calc(), st = statCount(m);
  const inc = c.inc[m], fx = c.fix[m], vr = c.vr[m], rest = c.rest2[m];
  return `<div class="card"><div class="hd"><h2><span>🧮</span> Bilan du mois</h2></div><div class="bd">
      <div class="mrow"><span class="n">💰 Revenus</span><span class="v pos">${money(inc)}</span></div>
      <div class="mrow"><span class="n">🏠 – Dépenses fixes</span><span class="v">${money(fx)}</span></div>
      <div class="mrow"><span class="n">🛍️ – Dépenses variables</span><span class="v">${money(vr)}</span></div>
      <div class="mrow" style="border-top:2px solid var(--accent-3);margin-top:6px;padding-top:12px">
        <span class="n" style="font-weight:800;color:var(--ink)">🐖 Reste</span>
        <span class="v ${rest >= 0 ? 'pos' : 'neg'}" style="font-size:19px">${money(rest)}</span></div>
      <div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-family:var(--ui-sans);font-style:normal;font-size:12px;color:var(--ink-3);font-weight:600">
          <span>Part des revenus dépensée</span><span>${inc ? Math.round((fx + vr) / inc * 100) : 0} %</span></div>
        <div class="bar"><i style="width:${inc ? Math.min(100, (fx + vr) / inc * 100) : 0}%"></i></div>
      </div>
      <div style="margin-top:16px;font-size:12.5px;color:var(--ink-3);line-height:1.7">
        💰 ${st.encaisse} rentrée(s) encaissée(s) · ⏳ ${st.attendu} attendue(s)<br>
        ✅ ${st.p} dépense(s) payée(s) · ❌ ${st.r} rejetée(s) · ⏳ ${Math.max(0, st.tot - st.p - st.r)} en attente<br>
        📊 Moyenne de l'année : revenus ${money0(c.tInc / 12)} · dépenses ${money0((c.tFix + c.tVar) / 12)}<br>
        🐖 Cumul depuis janvier : <b class="${sum(c.rest2.slice(0, m + 1)) >= 0 ? 'pos' : 'neg'}">${money(sum(c.rest2.slice(0, m + 1)))}</b>
      </div>
    </div></div>`;
}

/* Récapitulatif du mois en lecture seule : sert à l'impression. */
function viewMoisRecap() {
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

  let h = `<div class="mgrid">
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
    ${bilanMois(m)}
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
/* Épargne et compte courant au fil de l'année : deux courbes séparées,
   chacune avec son nom au bout, plutôt que des bandes empilées qu'on ne
   savait pas lire. Le total (les deux comptes ensemble) est un trait fin. */
function cumulChart(c, opt) {
  const k = comptes(), o = opt || {};
  const W = 980, H = 310, P = { l: 62, r: 170, t: 20, b: 34 };
  const cc = k.cc, ep = k.ep, tot = k.tot;
  const hasEp = ep.some(x => x) || k.aEp0;
  const mx = Math.max(...tot, ...cc, ...ep, 0), mn = Math.min(...tot, ...cc, ...ep, 0);
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
  if (bot < 0) g += `<line x1="${P.l}" y1="${yy(0)}" x2="${W - P.r}" y2="${yy(0)}" stroke="var(--danger)" stroke-dasharray="4 4" opacity=".6"/>`;

  const pts = arr => arr.map((v, i) => `${xx(i)},${yy(v)}`).join(' ');
  const base = yy(Math.max(0, bot));
  const areaE = `${P.l},${base} ${pts(ep)} ${xx(11)},${base}`;
  const dots = (arr, col) => arr.map((v, i) => `<circle class="seg gdot" style="animation-delay:${(0.5 + i * 0.05).toFixed(2)}s"
      cx="${xx(i)}" cy="${yy(v)}" r="4.5" fill="var(--surface)" stroke="${col}" stroke-width="2.5"/>`).join('');
  /* Un losange là où un solde réel a été saisi : la courbe y a été recalée. */
  const recal = (obj, arr, col) => Object.keys(obj).filter(i => !vide(obj[i])).map(i => {
    const x = xx(+i), y = yy(arr[+i]);
    return `<path d="M${x} ${y - 8} L${x + 8} ${y} L${x} ${y + 8} L${x - 8} ${y} Z" fill="${col}" stroke="var(--surface)" stroke-width="1.5"/>`;
  }).join('');

  const demi = pw / 22;
  const zones = tot.map((v, i) => {
    const x0 = Math.max(P.l, xx(i) - demi), x1 = Math.min(W - P.r, xx(i) + demi);
    const repris = r2(k.rev.epg[i] + k.pe[i]), dEp = r2(k.vers[i] - repris);
    const lignes = [
      hasEp ? ['🐖 Épargne', money(ep[i]) + (vide(k.rep[i]) ? '' : ' ✓ réel'), 's4'] : null,
      ['💳 Compte courant', money(cc[i]) + (vide(k.rcc[i]) ? '' : ' ✓ réel'), 'accent-2'],
      ['= Les deux ensemble', money(v), 'accent'],
      k.vers[i] ? ['➕ Mis de côté', money(k.vers[i]), 'ok'] : null,
      repris ? ['➖ Repris sur l’épargne', money(repris), 'ko'] : null,
      hasEp ? ['Épargne ce mois-là', (dEp >= 0 ? '+ ' : '– ') + money(Math.abs(dEp)), dEp >= 0 ? 'ok' : 'ko'] : null
    ];
    return `<g class="hov" ${tipAttr('Fin ' + MONTHS[i] + ' ' + state.activeYear, lignes)}>
      <rect x="${x0}" y="${P.t}" width="${x1 - x0}" height="${ph}" fill="transparent"/>
      <line class="gd" x1="${xx(i)}" y1="${P.t}" x2="${xx(i)}" y2="${P.t + ph}"
        stroke="var(--accent-2)" stroke-width="1.5" stroke-dasharray="3 3"/>
      ${hasEp ? `<circle class="gd" cx="${xx(i)}" cy="${yy(ep[i])}" r="7.5" fill="none" stroke="var(--s4)" stroke-width="2.5"/>` : ''}
      <circle class="gd" cx="${xx(i)}" cy="${yy(cc[i])}" r="7.5" fill="none" stroke="var(--accent-2)" stroke-width="2.5"/>
    </g>`;
  }).join('');
  const labs = MSHORT.map((m, i) => `<text x="${xx(i)}" y="${H - 12}" font-size="11" fill="var(--ink-2)" text-anchor="middle">${m}</text>`).join('');

  /* Noms et montants au bout des courbes, écartés pour ne pas se chevaucher. */
  const xEnd = xx(11), xLab = W - P.r + 16;
  const etiq = [
    hasEp ? { v: ep[11], col: 'var(--s4)', t: '🐖 épargne' } : null,
    { v: cc[11], col: 'var(--accent-2)', t: '💳 compte courant' },
    hasEp ? { v: tot[11], col: 'var(--accent)', t: '= les deux ensemble' } : null
  ].filter(Boolean).map(e => Object.assign(e, { y: yy(e.v), ly: yy(e.v) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < etiq.length; i++) if (etiq[i].ly - etiq[i - 1].ly < 32) etiq[i].ly = etiq[i - 1].ly + 32;
  const reperes = etiq.map(e => `
    <polyline points="${xEnd},${e.y} ${xLab - 12},${e.y} ${xLab - 5},${e.ly}" fill="none" stroke="${e.col}" stroke-dasharray="3 3" opacity=".6"/>
    <text x="${xLab}" y="${e.ly - 2}" font-size="13" font-weight="700" fill="${e.col}">${money0(e.v)}</text>
    <text x="${xLab}" y="${e.ly + 12}" font-size="10.5" fill="var(--ink-3)">${e.t}</text>`).join('');

  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="gSav" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--s4)" stop-opacity=".42"/><stop offset="1" stop-color="var(--s4)" stop-opacity=".04"/></linearGradient>
    </defs>
    ${g}
    ${hasEp ? `<polygon points="${areaE}" fill="url(#gSav)"/>
      <polyline points="${pts(tot)}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="2 4" opacity=".8"/>
      <polyline class="gline" pathLength="1" points="${pts(ep)}" fill="none" stroke="var(--s4)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
    <polyline points="${pts(cc)}" fill="none" stroke="var(--accent-2)" stroke-width="2.5" stroke-dasharray="7 4" stroke-linejoin="round"/>
    ${hasEp ? dots(ep, 'var(--s4)') : ''}${dots(cc, 'var(--accent-2)')}
    ${recal(k.rep, ep, 'var(--s4)')}${recal(k.rcc, cc, 'var(--accent-2)')}
    ${labs}${reperes}${zones}</svg>`;

  const legende = `<div class="chartlegend">
    ${hasEp ? '<span><i style="background:var(--s4)"></i>🐖 Épargne (livrets) — trait plein et zone bleue</span>' : ''}
    <span><i style="background:var(--accent-2)"></i>💳 Compte courant — pointillés</span>
    ${hasEp ? '<span><i style="background:var(--accent)"></i>= les deux ensemble — trait fin</span>' : ''}
    <span>◆ solde réel saisi</span></div>`;
  if (o.seul) return svg + legende;

  const m = moisRef();
  const recap = `<div class="recap">
    <div class="rc"><span class="rd" style="background:var(--s4)"></span>
      <div><b>${money(ep[m])}</b><span>🐖 sur l’épargne fin ${MONTHS[m].toLowerCase()}
        <em>— ${k.aEp0 ? 'départ ' + money0(k.ep0) : 'sans solde de départ'} + mis de côté − repris</em></span></div></div>
    <div class="rc"><span class="rd" style="background:var(--accent-2)"></span>
      <div><b>${money(cc[m])}</b><span>💳 sur le compte courant fin ${MONTHS[m].toLowerCase()}
        <em>— ${k.aCc0 ? 'départ ' + money0(k.cc0) : 'sans solde de départ'} + rentrées − sorties</em></span></div></div>
    <div class="rc som"><span class="rd" style="background:var(--accent)"></span>
      <div><b>${money(tot[m])}</b><span>= les deux ensemble
        <button type="button" class="lienbtn" data-goview="epargne">🐖 voir le détail et corriger les soldes →</button></span></div></div>
  </div>`;
  return svg + legende + recap;
}
/* Revenus et dépenses du compte courant, cumulés depuis janvier : si la courbe
   rouge passe au-dessus de la verte, on dépense plus que ce qu'on gagne.
   Gagné = salaires et revenus + virements reçus (l'argent repris sur l'épargne n'est pas un gain).
   Dépensé = toutes les dépenses, sans l'argent mis de côté (il n'est pas perdu). */
function gagneDepChart(k) {
  const W = 980, H = 310, P = { l: 62, r: 190, t: 20, b: 34 };
  const gm = MONTHS.map((_, i) => r2(k.rev.sal[i] + k.rev.vir[i])), dm = MONTHS.map((_, i) => r2(k.cpt[i] + k.pe[i]));
  const G = [], D = []; let g0 = 0, d0 = 0;
  gm.forEach((x, i) => { g0 = r2(g0 + x); d0 = r2(d0 + dm[i]); G.push(g0); D.push(d0); });
  const top = niceMax(Math.max(...G, ...D, 100));
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const yy = v => P.t + ph - (v / top) * ph, xx = i => P.l + (pw / 11) * i;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = top * i / 4, y = yy(v);
    g += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="var(--border)"/>
          <text x="${P.l - 9}" y="${y + 4}" font-size="10.5" fill="var(--ink-3)" text-anchor="end">${nf0.format(v)}</text>`;
  }
  const pts = a => a.map((v, i) => `${xx(i)},${yy(v)}`).join(' ');
  const cm = curM();
  const labs = MSHORT.map((m, i) => `<text x="${xx(i)}" y="${H - 12}" font-size="11" fill="${cm >= 0 && i > cm ? 'var(--ink-3)' : 'var(--ink-2)'}" text-anchor="middle">${m}</text>`).join('');
  /* Un point par mois sur la courbe des dépenses : rouge les mois où l'on a dépensé plus que gagné. */
  const dots = D.map((v, i) => { const trop = dm[i] > gm[i];
    return `<circle class="gdot" cx="${xx(i)}" cy="${yy(v)}" r="${trop ? 6 : 4.5}" fill="${trop ? 'var(--danger)' : 'var(--surface)'}" stroke="var(--danger)" stroke-width="2.5"/>`; }).join('')
    + G.map((v, i) => `<circle class="gdot" cx="${xx(i)}" cy="${yy(v)}" r="4.5" fill="var(--surface)" stroke="var(--success)" stroke-width="2.5"/>`).join('');
  const demi = pw / 22;
  const zones = MONTHS.map((mn, i) => {
    const x0 = Math.max(P.l, xx(i) - demi), x1 = Math.min(W - P.r, xx(i) + demi), dif = r2(gm[i] - dm[i]), cum = r2(G[i] - D[i]);
    return `<g class="hov" ${tipAttr(mn + ' ' + state.activeYear + (cm >= 0 && i > cm ? ' (prévu)' : ''), [
      ['💼 Gagné ce mois', money(gm[i]), 'ok'],
      ['💳 Dépensé ce mois', money(dm[i]), 'ko'],
      ['Ce mois-ci', (dif >= 0 ? 'il reste ' : 'dépassé de ') + money(Math.abs(dif)), dif >= 0 ? 'ok' : 'ko'],
      ['Depuis janvier', (cum >= 0 ? '+ ' : '− ') + money(Math.abs(cum)), cum >= 0 ? 'ok' : 'ko']
    ])}><rect x="${x0}" y="${P.t}" width="${x1 - x0}" height="${ph}" fill="transparent"/>
      <line class="gd" x1="${xx(i)}" y1="${P.t}" x2="${xx(i)}" y2="${P.t + ph}" stroke="var(--accent-2)" stroke-width="1.5" stroke-dasharray="3 3"/></g>`;
  }).join('');
  const xLab = W - P.r + 16;
  const etiq = [{ v: G[11], col: 'var(--success)', t: '💼 gagné sur l’année' }, { v: D[11], col: 'var(--danger)', t: '💳 dépensé sur l’année' }]
    .map(e => Object.assign(e, { y: yy(e.v), ly: yy(e.v) })).sort((a, b) => a.y - b.y);
  if (etiq[1].ly - etiq[0].ly < 34) etiq[1].ly = etiq[0].ly + 34;
  const reperes = etiq.map(e => `
    <polyline points="${xx(11) + 8},${e.y} ${xLab - 12},${e.y} ${xLab - 5},${e.ly}" fill="none" stroke="${e.col}" stroke-dasharray="3 3" opacity=".6"/>
    <text x="${xLab}" y="${e.ly - 2}" font-size="14" font-weight="700" fill="${e.col}">${money0(e.v)}</text>
    <text x="${xLab}" y="${e.ly + 13}" font-size="11" fill="var(--ink-3)">${e.t}</text>`).join('');
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">${g}
    <polygon points="${pts(G)} ${[...D].map((v, i) => `${xx(i)},${yy(v)}`).reverse().join(' ')}" fill="var(--success)" opacity=".08"/>
    <polyline class="gline" pathLength="1" points="${pts(G)}" fill="none" stroke="var(--success)" stroke-width="3" stroke-linejoin="round"/>
    <polyline class="gline" pathLength="1" points="${pts(D)}" fill="none" stroke="var(--danger)" stroke-width="3" stroke-linejoin="round"/>
    ${dots}${labs}${reperes}${zones}</svg>`;
  const legende = `<div class="chartlegend">
    <span><i style="background:var(--success)"></i>💼 Gagné (salaires, revenus, virements reçus)</span>
    <span><i style="background:var(--danger)"></i>💳 Dépensé (sans l’argent mis de côté) — ● rouge plein : ce mois-là, plus dépensé que gagné</span></div>`;
  const m = cm >= 0 ? cm : 11, tG = G[m], tD = D[m], dif = r2(tG - tD);
  const rouges = MONTHS.filter((_, i) => i <= m && dm[i] > gm[i]).map(x => x.toLowerCase());
  const recap = `<div class="recap">
    <div class="rc"><span class="rd" style="background:var(--success)"></span><div><b>${money(tG)}</b><span>💼 gagné de janvier à ${MONTHS[m].toLowerCase()}</span></div></div>
    <div class="rc"><span class="rd" style="background:var(--danger)"></span><div><b>${money(tD)}</b><span>💳 dépensé de janvier à ${MONTHS[m].toLowerCase()}</span></div></div>
    <div class="rc som"><span class="rd" style="background:${dif >= 0 ? 'var(--success)' : 'var(--danger)'}"></span><div><b>${dif >= 0 ? '+ ' : '− '}${money(Math.abs(dif))}</b>
      <span>${dif >= 0 ? '✅ vous dépensez moins que ce que vous gagnez' : '⚠️ vous dépensez plus que ce que vous gagnez'}
      <em>${rouges.length ? ' — mois dépassés : ' + rouges.join(', ') : ' — aucun mois dépassé'}</em></span></div></div>
  </div>`;
  return svg + legende + recap;
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
  const k = comptes();
  h += `<div class="card"><div class="hd"><h2><span>⚖️</span> Ce que je gagne, ce que je dépense</h2>
      <span class="hint">cumulé depuis janvier · survolez un mois pour le détail</span></div>
      <div class="bd"><div class="chartbox">${gagneDepChart(k)}</div></div></div>`;
  h += `<div class="gridtwo">`;
  h += pieCard('💰', 'D’où vient l’argent qui rentre', ['sal', 'vir', 'epg'].map((f, i) => ({
    name: FLUX_REV[f].nom, em: FLUX_REV[f].em, value: sum(k.rev[f]), color: ['var(--rev)', 'var(--s3)', 'var(--s4)'][i] })));
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
   ÉPARGNE : ce qu'il y a sur le livret et sur le compte, et pourquoi
   ============================================================ */
/* Un volet replié/déplié dont on se souvient d'un affichage à l'autre. */
const ouvertEp = (cle, parDefaut) => epOuverts.has(cle) || (parDefaut && !epOuverts.has('f' + cle));

function viewEpargne() {
  const y = Y(), k = comptes(), m = moisRef(), an = +state.activeYear;
  const liv = mesEpargnes().length > 0;
  const sg = x => (x >= 0 ? '+ ' : '− ') + money(Math.abs(x));
  const d = serieEpargne(k);
  const gagne = r2(d.ep[m] - d.ep0), pasEp = r2(d.pot[m] - d.ep[m]);
  const depLab = d.i0 ? 'Depuis le départ (' + MONTHS[d.i0].toLowerCase() + ')' : 'Depuis le 1er janvier';

  /* 1. Trois chiffres */
  let h = `<div class="card ep-hero"><div class="bd">
    <div class="ep-tuiles">
      <div class="ep-t t-ep"><span class="et">🐖 Mon épargne aujourd’hui</span><b>${money(d.ep[m])}</b>
        <small>${liv ? `${mesEpargnes().length} livret(s)` : 'd’après les lignes 🐖 du budget'}</small></div>
      <div class="ep-t t-net"><span class="et">${gagne >= 0 ? '📈' : '📉'} ${depLab}</span><b class="${gagne < 0 ? 'neg' : 'pos'}">${sg(gagne)}</b></div>
      <div class="ep-t t-pot"><span class="et">💡 J’aurais pu être à</span><b>${money(d.pot[m])}</b>
        <small>${pasEp > 0 ? `${money0(pasEp)} pas mis de côté` : 'vous avez tout mis de côté 👏'}</small></div>
    </div>
    ${!liv ? `<div class="ep-alerte">👉 <span>Commencez par <b>ajouter vos livrets</b> plus bas, avec ce qu’il y a dessus aujourd’hui.</span></div>` : ''}
    ${d.ep.slice(0, m + 1).some(x => x < 0) ? `<div class="ep-alerte">🚩 <span><b>L’épargne passe sous zéro</b> en
      ${MONTHS[d.ep.findIndex(x => x < 0)].toLowerCase()} : on reprend plus que ce qu’il y avait.</span></div>` : ''}
    </div></div>`;

  /* 2. La courbe */
  h += `<div class="card"><div class="hd"><h2><span>📈</span> Mon épargne au fil de l’année</h2>
      <span class="hint">survolez un mois pour le détail</span></div>
      <div class="bd"><div class="chartbox">${courbeEpargne(d)}</div>
      <div class="ep-capmode"><span>Pointillés = revenus −</span>
        <button type="button" class="mini-btn ${d.fix ? '' : 'on'}" data-capmode="all">toutes les dépenses</button>
        <button type="button" class="mini-btn ${d.fix ? 'on' : ''}" data-capmode="fix">prélèvements fixes</button></div>
      </div></div>`;

  /* 3. Les livrets, 4. les lignes du budget, 5. la répartition si besoin */
  h += vueLivrets();
  h += vueLignesEp(k, y);
  h += vueRepartir(k);

  /* Sans livret : le solde au 1er janvier reste réglable ici. */
  if (!liv) {
    h += `<div class="card"><div class="bd ep-sanslivret">🐖 Sur l’épargne le 1er janvier ${an} :
      <input class="solde-in" data-solde0="ep" inputmode="decimal" value="${k.aEp0 ? nf.format(k.ep0) : ''}" placeholder="à indiquer" aria-label="Épargne au 1er janvier ${an}"> €
      <small>(inutile dès que vos livrets sont ajoutés)</small></div></div>`;
  }

  /* 6. Le détail mois par mois, replié */
  const cm = curM();
  h += `<details class="card ep-pli" data-ouv="mpm" ${ouvertEp('mpm', false) ? 'open' : ''}><summary class="hd"><h2><span>📒</span> Le détail mois par mois</h2></summary><div class="bd">
    <div class="ep-tblwrap"><table class="ep-tbl"><thead><tr>
      <th>Mois</th><th>➕ Mis de côté</th><th>➖ Repris</th><th class="c-ep">🐖 Épargne<small>fin de mois</small></th><th>Variation</th>
      ${liv ? '' : '<th class="c-ep">🏦 Solde réel<small>de la banque</small></th>'}
      <th class="c-pot">💡 Capacité<small>du mois</small></th><th class="c-pot">💡 J’aurais pu<small>être à</small></th></tr></thead><tbody>
      ${MONTHS.map((mn, i) => {
        const rp = r2(k.rev.epg[i] + k.pe[i]), avant = i < d.i0, va = avant ? 0 : r2(d.ep[i] - (i > d.i0 ? d.ep[i - 1] : d.ep0)), fut = i > d.mFin || avant;
        const reel = liv ? '' : `<td class="c-ep"><input class="solde-in" data-reel="ep" data-m="${i}" inputmode="decimal" value="${vide(k.rep[i]) ? '' : nf.format(+k.rep[i])}" placeholder="–" aria-label="Solde réel fin ${mn}"></td>`;
        return `<tr class="${i === cm ? 'cur' : ''} ${fut ? 'fut' : ''}"><td class="mn">${mn}</td>
          <td class="pos">${k.vers[i] ? '+ ' + money(k.vers[i]) : '–'}</td>
          <td class="neg">${rp ? '− ' + money(rp) : '–'}</td>
          <td class="c-ep"><b>${avant ? '–' : money(d.ep[i])}</b></td>
          <td class="${va > 0 ? 'pos' : va < 0 ? 'neg' : ''}">${va ? sg(va) : '–'}</td>${reel}
          <td class="${d.cap[i] < 0 ? 'neg' : ''}">${money(d.cap[i])}</td>
          <td class="c-pot">${avant ? '–' : money(d.pot[i])}</td></tr>`;
      }).join('')}
    </tbody></table></div></div></details>`;
  return h;
}

/* Les livrets : une ligne chacun (nom, solde, plafond) qui s'ouvre pour noter une opération ou le régler. */
function vueLivrets() {
  const liste = mesEpargnes(), sg = x => (x >= 0 ? '+ ' : '− ') + money(Math.abs(x));
  const num = (attrs, v, lib, ph) => `<input class="solde-in" ${attrs} inputmode="decimal" value="${vide(v) ? '' : nf.format(+v)}" placeholder="${ph || '–'}" aria-label="${esc(lib)}">`;
  let h = `<div class="card ep-mes"><div class="hd"><h2><span>🏦</span> Mes livrets</h2>
      <span class="hint right">${liste.length ? money(sommeEpA(kNow())) + ' en tout' : 'Livret A, LEP, PEA, assurance vie…'}</span></div><div class="bd">`;
  liste.forEach(a => {
    const hh = histoEp(a), t = TYPES_EP[a.type] || TYPES_EP.autre, nom = a.nom || t.nom;
    const sol = soldeEpA(a, kNow(), hh), pl = plafOf(a), pc = pl ? Math.min(100, Math.max(0, sol / pl * 100)) : 0, plein = pl && sol >= pl;
    const manque = vide(a.s0), ouvert = ouvertEp('a:' + a.id, manque);
    h += `<details class="ep-liv" data-accid="${a.id}" data-ouv="a:${a.id}" ${ouvert ? 'open' : ''}>
      <summary class="ep-liv-sum">
        <span class="nm">🏦 ${esc(nom)}${a.banque ? `<small>${esc(a.banque)}</small>` : ''}</span>
        <span class="badges">${manque ? '<em class="b-warn">montant à indiquer</em>' : ''}${plein ? '<em class="b-lock">🔒 au plafond</em>' : ''}${hh.ecarts ? `<em class="b-warn">❓ ${sg(hh.ecarts)} pas expliqué</em>` : ''}</span>
        ${pl ? `<span class="mini-plaf" title="${money(sol)} sur ${money0(pl)} de plafond"><i style="width:${pc.toFixed(1)}%"></i></span>` : '<span class="mini-plaf vide"></span>'}
        <b class="vl">${money(sol)}</b>
      </summary>
      <div class="ep-liv-bd">
        ${manque ? `<div class="ep-acc-actuel manque">💰 Combien y a-t-il sur ce livret aujourd’hui ?
          ${num(`data-acc="${a.id}" data-f="s0"`, a.s0, 'Montant sur le livret aujourd’hui', 'montant')} €</div>` : ''}
        <div class="ep-ajout">
          <div class="ep-types" role="radiogroup" aria-label="Ce qui s’est passé">
            ${[['vers', '➕ J’ai versé'], ['retr', '➖ J’ai retiré'], ['int', '✨ Intérêts reçus'], ['solde', '🏦 Solde de la banque']].map(([v, l], j) =>
              `<label class="ep-type"><input type="radio" name="mvt-${a.id}" value="${v}" ${j ? '' : 'checked'}><span>${l}</span></label>`).join('')}
          </div>
          <div class="ep-ajout-l">
            <input class="solde-in" data-mva="1" inputmode="decimal" placeholder="montant" aria-label="Montant"> <span>€ en</span>
            <input type="month" class="txt-in" data-mvm="1" value="${kNow()}" aria-label="Mois">
            <span class="rep">chaque mois jusqu’à</span>
            <input type="month" class="txt-in" data-mvu="1" value="" aria-label="Répéter chaque mois jusqu’à (facultatif)">
            <button type="button" class="btn primary" data-mvadd="${a.id}">Ajouter</button>
          </div>
        </div>
        <p class="ep-liv-tot">Depuis ${kLab(hh.depart).toLowerCase()} : ➕ ${money0(hh.plus)} versés${hh.plusBudget ? ` (dont ${money0(hh.plusBudget)} du budget)` : ''} · ➖ ${money0(hh.moins)} retirés · ✨ ${money0(hh.interets)} d’intérêts${hh.bloque ? ` · 🔒 ${money0(hh.bloque)} refusés (plafond)` : ''}${pl ? ` · plafond ${money0(pl)}, ${plein ? 'atteint' : `encore ${money0(r2(pl - sol))} possibles`}` : ''}</p>
        ${journalEp(a, hh, sg)}
        <details class="ep-reglages" data-ouv="r:${a.id}" ${ouvertEp('r:' + a.id, false) ? 'open' : ''}><summary>⚙️ Modifier le livret</summary>
          <div class="ep-acc-tete">
            <label class="ch ch-nom"><span>Nom</span><input class="txt-in" data-acc="${a.id}" data-f="nom" value="${esc(a.nom || '')}" placeholder="${esc(t.nom)}"></label>
            <label class="ch"><span>Type</span><select class="txt-in" data-acc="${a.id}" data-f="type">${Object.entries(TYPES_EP).map(([c, x]) =>
              `<option value="${c}" ${c === (a.type || 'autre') ? 'selected' : ''}>${x.nom}</option>`).join('')}</select></label>
            <label class="ch"><span>Banque</span><input class="txt-in" data-acc="${a.id}" data-f="banque" value="${esc(a.banque || '')}" placeholder="ex. LCL"></label>
            <label class="ch"><span>Ouvert le</span><input type="date" class="txt-in" data-acc="${a.id}" data-f="ouv" value="${esc(a.ouv || '')}"></label>
          </div>
          <div class="ep-acc-tete">
            <label class="ch"><span>Montant au départ (${kLab(hh.depart).toLowerCase()})</span>${num(`data-acc="${a.id}" data-f="s0"`, a.s0, 'Montant au départ', 'montant')}</label>
            <label class="ch"><span>Plafond${t.plaf ? ' (légal : ' + money0(t.plaf) + ')' : ''}</span>${num(`data-acc="${a.id}" data-f="plaf"`, a.plaf, 'Plafond du livret', t.plaf ? nf0.format(t.plaf) : 'aucun')}</label>
            <button type="button" class="mini-btn danger" data-accdel="${a.id}">🗑️ Supprimer le livret</button>
          </div>
        </details>
      </div>
    </details>`;
  });
  h += `<div class="ep-acc-add"><button type="button" class="btn primary" data-accadd="1">＋ Ajouter un livret</button></div></div></div>`;
  return h;
}

/* Les lignes 🐖 du budget et le livret où chacune va. Repliée quand tout est relié. */
function vueLignesEp(k, y) {
  const L = mesEpargnes();
  const chemins = new Map();
  y.revenus.forEach(l => chemins.set(l, ['rev', 'rev']));
  y.fixes.forEach(cat => cat.lines.forEach(l => chemins.set(l, ['fix:' + cat.id, 'fix'])));
  y.variables.forEach(l => chemins.set(l, ['var', 'var']));
  const ls = ['vers', 'epg', 'pe'].flatMap(f => k.lig[f].map(l => [l, f]));
  if (!ls.length) return `<div class="card"><div class="bd ep-p" style="margin:0">🐖 Aucune ligne du budget ne va sur l’épargne. Dans le tableau, cliquez sur 💳 à côté du nom d’une ligne pour la passer en 🐖.</div></div>`;
  const aRelier = L.length ? ls.filter(([l]) => !L.some(a => a.id === l.acc)).length : 0;
  const rows = ls.map(([l, f]) => {
    const [path, kind] = chemins.get(l) || ['', 'fix'], fi = (kind === 'rev' ? FLUX_REV : FLUX_DEP)[f];
    const lie = L.find(a => a.id === l.acc);
    return `<div class="ep-ligne b-${kind} ${lie ? '' : 'nonlie'}" data-path="${path}" data-id="${l.id}">
      <span class="nm">${fi.em} ${esc(l.label)}</span>
      <span class="vl">${f === 'vers' ? '' : '− '}${money(lineTotal(l))}</span>
      ${L.length ? `<span class="ep-lien">→ <select class="txt-in" data-lienacc="1" aria-label="Livret de « ${esc(l.label)} »">
        <option value="">quel livret ?</option>
        ${L.map(a => `<option value="${a.id}" ${lie === a ? 'selected' : ''}>${esc(a.nom || (TYPES_EP[a.type] || TYPES_EP.autre).nom)}</option>`).join('')}
      </select></span>` : ''}
      ${lie ? '' : `<button type="button" class="mini-btn" data-creeacc="1" title="Créer le livret « ${esc(nomDepuisLigne(l.label))} » et y relier cette ligne">＋ Créer le livret</button>`}
      <button type="button" class="mini-btn" data-act="flux" title="${esc(fi.nom)} — changer">Changer</button>
      <button type="button" class="mini-btn" data-retire="1" title="Cette ligne ne touche pas l’épargne">✕</button></div>`;
  }).join('');
  return `<details class="card ep-pli" data-ouv="lignes" ${ouvertEp('lignes', aRelier > 0 || !L.length) ? 'open' : ''}>
    <summary class="hd"><h2><span>🔗</span> Les lignes 🐖 du budget</h2>
      <span class="hint right">${aRelier ? `<b class="warn">${aRelier} à relier à un livret</b>` : L.length ? '✓ toutes reliées' : ls.length + ' ligne(s)'}</span></summary>
    <div class="bd"><p class="ep-p">Chaque ligne va sur un livret : son montant y arrive tout seul, le mois où il est dans le budget.</p>${rows}</div></details>`;
}

/* Répartir à la main : seulement s'il reste un montant 🐖 qui n'est relié à aucun livret. */
function vueRepartir(k) {
  const an = +state.activeYear, liste = mesEpargnes();
  if (!liste.length) return '';
  const etat = i => {
    const n = netBudgetMois(k, i), c = mKey(an, i);
    const r = r2(n - liste.reduce((t, a) => t + (+(a.rep || {})[c] || 0), 0));
    return !n && !r ? 'rien' : Math.abs(r) < 0.005 ? 'ok' : 'reste';
  };
  if (epMois === null && MONTHS.every((_, i) => etat(i) !== 'reste')) return '';
  const m = epMois === null ? MONTHS.findIndex((_, i) => etat(i) === 'reste') : epMois, cle = mKey(an, m);
  const net = netBudgetMois(k, m), reste = r2(net - liste.reduce((t, a) => t + (+(a.rep || {})[cle] || 0), 0));
  const num = (attrs, v, lib) => `<input class="solde-in" ${attrs} inputmode="decimal" value="${vide(v) ? '' : nf.format(+v)}" placeholder="0,00" aria-label="${esc(lib)}">`;
  return `<div class="card ep-rep" id="ep-rep"><div class="hd"><h2><span>🧺</span> À répartir à la main</h2>
      <span class="hint right">montants 🐖 reliés à aucun livret</span></div><div class="bd">
    <div class="msel ep-msel" role="group" aria-label="Mois">${MONTHS.map((mn, i) => etat(i) === 'rien' && i !== m ? '' : `<button type="button" data-epmois="${i}"
        class="${i === m ? 'on' : ''} st-${etat(i)}">${mn.length <= 4 ? mn : mn.slice(0, mn.startsWith('Juil') ? 4 : 3)}${etat(i) === 'ok' ? ' ✓' : etat(i) === 'reste' ? ' •' : ''}</button>`).join('')}</div>
    <p class="ep-p">${MONTHS[m]} : <b>${money(net)}</b> à répartir — reste <b class="${Math.abs(reste) < 0.005 ? 'pos' : 'warn'}">${money(reste)}</b>.
      Le plus simple reste de relier la ligne à son livret, juste au-dessus.</p>
    <div class="ep-rep-lignes">${liste.map(a => `<div class="ep-rep-l"><span class="nm">🏦 ${esc(a.nom || (TYPES_EP[a.type] || TYPES_EP.autre).nom)}</span>
        ${num(`data-acc="${a.id}" data-f="rep" data-k="${cle}"`, (a.rep || {})[cle], 'Part pour ce livret en ' + MONTHS[m])}
        ${Math.abs(reste) >= 0.005 ? `<button type="button" class="mini-btn" data-reptout="${a.id}">＋ le reste</button>` : ''}</div>`).join('')}</div>
  </div></div>`;
}

/* La courbe de l'épargne et celle de ce qui aurait pu être épargné.
   Épargne : la somme des épargnes (ou le calcul du budget sans épargne créée).
   Capacité du mois : revenus (salaire + virements reçus) − dépenses (toutes,
   ou seulement les prélèvements fixes), hors argent mis de côté.
   « J'aurais pu être à » : le même point de départ + la capacité, mois après mois. */
function serieEpargne(k) {
  const y = Y(), an = +state.activeYear, fix = !!state.capFix;
  let liv = mesEpargnes().length > 0;
  /* Avec des épargnes créées, la courbe part du premier point de départ (l'avant n'est pas connu). */
  const premier = liv ? mesEpargnes().map(a => histoEp(a).depart).sort()[0] : null;
  if (liv && premier > mKey(an, 11)) liv = false;
  const i0 = liv && premier >= mKey(an, 0) ? +premier.slice(5) - 1 : 0;
  const ep0 = liv ? sommeEpA(kPrec(mKey(an, i0))) : k.ep0;
  const ep = MONTHS.map((_, i) => i < i0 ? null : liv ? sommeEpA(mKey(an, i)) : k.ep[i]);
  const fixes = z12();
  (y.fixes || []).forEach(c => c.lines.forEach(l => { if (fluxOf(l, 'fix') !== 'vers') l.v.forEach((x, i) => fixes[i] += (+x || 0)); }));
  const cap = MONTHS.map((_, i) => r2(k.rev.sal[i] + k.rev.vir[i] - (fix ? fixes[i] : k.cpt[i] + k.pe[i])));
  const pot = []; let p = ep0;
  cap.forEach((c, i) => { if (i < i0) { pot.push(null); return; } p = r2(p + c); pot.push(p); });
  const cm = curM();
  return { ep0, ep, cap, pot, fix, liv, i0, mFin: Math.max(i0, cm >= 0 ? cm : 11) };
}
function courbeEpargne(d) {
  const W = 980, H = 320, P = { l: 62, r: 200, t: 24, b: 34 };
  const n = d.mFin + 1, i0 = d.i0 || 0;
  const E = [d.ep0, ...d.ep.slice(i0, n)], Q = [d.ep0, ...d.pot.slice(i0, n)];
  const mx = Math.max(...E, ...Q, 0), mn = Math.min(...E, ...Q, 0);
  const top = niceMax(mx || 100), bot = mn < 0 ? -niceMax(-mn) : 0;
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const yy = v => P.t + ph - ((v - bot) / (top - bot)) * ph;
  const xx = i => P.l + (pw / 12) * i;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = bot + (top - bot) * i / 4, yv = yy(v);
    g += `<line x1="${P.l}" y1="${yv}" x2="${W - P.r}" y2="${yv}" stroke="var(--border)"/>
          <text x="${P.l - 9}" y="${yv + 4}" font-size="10.5" fill="var(--ink-3)" text-anchor="end">${nf0.format(v)}</text>`;
  }
  if (bot < 0) g += `<line x1="${P.l}" y1="${yy(0)}" x2="${W - P.r}" y2="${yy(0)}" stroke="var(--danger)" stroke-dasharray="4 4" opacity=".6"/>`;
  const pts = a => a.map((v, i) => `${xx(i0 + i)},${yy(v)}`).join(' ');
  const base = yy(Math.max(0, bot));
  const labs = [i0 ? 'départ' : '1er janv', ...MSHORT].map((t, i) => i && i <= i0 - 0 && i < i0 + 1 && false ? '' : `<text x="${i === 0 ? xx(i0) : xx(i)}" y="${H - 12}" font-size="11" fill="${i && (i <= i0 || i > n) ? 'var(--ink-3)' : 'var(--ink-2)'}" text-anchor="middle">${i === 0 && i0 ? '' : t}</text>`).join('')
    + (i0 ? `<text x="${xx(i0)}" y="${P.t + 12}" font-size="11" fill="var(--ink-3)" text-anchor="middle">📍 départ</text>` : '');
  /* Un point par mois : vert si l'épargne monte, rouge si elle baisse (avec le montant). */
  const points = E.map((v, i) => {
    const va = i ? r2(v - E[i - 1]) : 0, col = va > 0 ? 'var(--success)' : va < 0 ? 'var(--danger)' : 'var(--s4)';
    return `<circle class="gdot" style="animation-delay:${(0.4 + i * 0.05).toFixed(2)}s" cx="${xx(i0 + i)}" cy="${yy(v)}" r="5.5" fill="${va ? col : 'var(--surface)'}" stroke="${col}" stroke-width="2.5"/>
      ${va < 0 ? `<text x="${xx(i0 + i)}" y="${yy(v) + 20}" font-size="11" font-weight="700" fill="var(--danger)" text-anchor="middle">− ${nf0.format(-va)} €</text>` : ''}`;
  }).join('');
  const demi = pw / 24;
  const zones = E.map((v, i) => {
    if (!i) return '';
    const mi = i0 + i - 1, va = r2(v - E[i - 1]), xi = xx(i0 + i);
    const x0 = Math.max(P.l, xi - demi), x1 = Math.min(W - P.r, xi + demi);
    return `<g class="hov" ${tipAttr('Fin ' + MONTHS[mi] + ' ' + state.activeYear, [
      ['🐖 Mon épargne', money(v), 's4'],
      ['Ce mois-ci', va ? (va > 0 ? '+ ' : '− ') + money(Math.abs(va)) : 'pas de changement', va > 0 ? 'ok' : va < 0 ? 'ko' : ''],
      ['💡 Capacité du mois', money(d.cap[mi]), d.cap[mi] < 0 ? 'ko' : ''],
      ['💡 J’aurais pu être à', money(Q[i]), 'accent'],
      ['Pas mis de côté', money(Math.max(0, r2(Q[i] - v))), '']
    ])}>
      <rect x="${x0}" y="${P.t}" width="${x1 - x0}" height="${ph}" fill="transparent"/>
      <line class="gd" x1="${xi}" y1="${P.t}" x2="${xi}" y2="${P.t + ph}" stroke="var(--s4)" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle class="gd" cx="${xi}" cy="${yy(v)}" r="9" fill="none" stroke="var(--s4)" stroke-width="2.5"/></g>`;
  }).join('');
  const xEnd = xx(n), xLab = W - P.r + 16;
  const etiq = [
    { v: E[E.length - 1], col: 'var(--s4)', t: '🐖 mon épargne' },
    { v: Q[Q.length - 1], col: 'var(--accent)', t: '💡 j’aurais pu être à' }
  ].map(e => Object.assign(e, { y: yy(e.v), ly: yy(e.v) })).sort((a, b) => a.y - b.y);
  if (etiq[1].ly - etiq[0].ly < 34) etiq[1].ly = etiq[0].ly + 34;
  const reperes = etiq.map(e => `
    <polyline points="${xEnd + 8},${e.y} ${xLab - 12},${e.y} ${xLab - 5},${e.ly}" fill="none" stroke="${e.col}" stroke-dasharray="3 3" opacity=".6"/>
    <text x="${xLab}" y="${e.ly - 2}" font-size="14" font-weight="700" fill="${e.col}">${money0(e.v)}</text>
    <text x="${xLab}" y="${e.ly + 13}" font-size="11" fill="var(--ink-3)">${e.t}</text>`).join('');
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="gSav2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--s4)" stop-opacity=".42"/><stop offset="1" stop-color="var(--s4)" stop-opacity=".04"/></linearGradient></defs>
    ${g}
    <polygon points="${xx(i0)},${base} ${pts(E)} ${xx(n)},${base}" fill="url(#gSav2)"/>
    <polyline points="${pts(Q)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="7 5" stroke-linejoin="round"/>
    <polyline class="gline" pathLength="1" points="${pts(E)}" fill="none" stroke="var(--s4)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${points}${labs}${reperes}${zones}</svg>`;
  const legende = `<div class="chartlegend">
    <span><i style="background:var(--s4)"></i>🐖 Mon épargne — trait plein, un point par mois (vert : elle monte, rouge : elle baisse)</span>
    <span><i style="background:var(--accent)"></i>💡 Ce que j’aurais pu épargner — pointillés</span></div>`;
  return svg + legende;
}
const NOMS_TYPE_EP = [[/\blep\b/, 'lep'], [/\bldds\b|\bldd\b/, 'ldds'], [/livret jeune/, 'lj'], [/livret a\b/, 'la'], [/\bpea\b/, 'pea'],
  [/ass(urance)?\.? ?vie|\bav\b/, 'av'], [/\bpel\b/, 'pel'], [/\bcel\b/, 'cel'], [/bloqu|terme|\bcat\b/, 'cat'], [/livret/, 'liv']];
const typeDepuisLigne = lab => { const t = noAcc(lab); const f = NOMS_TYPE_EP.find(([re]) => re.test(t)); return f ? f[1] : 'autre'; };
const nomDepuisLigne = lab => String(lab || '').replace(/^\s*[ée]pargnes?\s*[-–:]?\s*/i, '').trim() || String(lab || 'Épargne');

/* ============================================================
   MES ÉPARGNES : chaque livret avec sa banque, sa date d'ouverture,
   un point de départ, puis son histoire mois par mois.
   Rangées dans state.epargnes (elles traversent les années du budget) :
   { id, nom, type, banque, ouv:'AAAA-MM-JJ', s0:solde de départ, d0:'AAAA-MM' (début du mois),
     rep:{'AAAA-MM': part du 🐖 du budget}, mv:{…: versé/retiré à la main},
     it:{…: intérêts}, reel:{…: solde de la banque en fin de mois} }
   Fin de mois = début + part du budget + versé/retiré + intérêts ;
   un solde réel saisi remplace le calcul et l'écart est montré.
   ============================================================ */
const TYPES_EP = {
  la:   { nom: 'Livret A', plaf: 22950 },
  ldds: { nom: 'LDDS', plaf: 12000 },
  lep:  { nom: 'LEP', plaf: 10000 },
  lj:   { nom: 'Livret Jeune', plaf: 1600 },
  pel:  { nom: 'PEL', plaf: 61200 },
  cel:  { nom: 'CEL', plaf: 15300 },
  liv:  { nom: 'Livret bancaire' },
  av:   { nom: 'Assurance vie' },
  pea:  { nom: 'PEA' },
  cat:  { nom: 'Compte à terme' },
  autre:{ nom: 'Autre' }
};
const mKey = (an, m) => an + '-' + String(m + 1).padStart(2, '0');
const kSuiv = k => { const [a, m] = k.split('-').map(Number); return m === 12 ? mKey(a + 1, 0) : mKey(a, m); };
const kPrec = k => { const [a, m] = k.split('-').map(Number); return m === 1 ? mKey(a - 1, 11) : mKey(a, m - 2); };
const kLab = k => { const [a, m] = k.split('-').map(Number); return MONTHS[m - 1] + ' ' + a; };
const KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const kNow = () => { const d = new Date(); return mKey(d.getFullYear(), d.getMonth()); };
function mesEpargnes() {
  if (!Array.isArray(state.epargnes)) state.epargnes = [];
  /* Anciennes fiches (avec un historique depuis l'ouverture) : on garde leur solde
     d'aujourd'hui comme point de départ, et on ne compte plus que la suite. */
  state.epargnes.forEach(a => {
    if (a.v2) return;
    const now = kNow(), r = (a.reel || {})[now];
    a.s0 = vide(r) ? soldeEpA(a, now) : +r;
    a.d0 = now; if (a.reel) delete a.reel[now];
    a.v2 = true; save();
  });
  return state.epargnes;
}
let epMois = null;            /* mois affiché dans « Répartir » (null = mois de référence) */
const epOuverts = new Set();  /* volets ouverts, gardés d'un affichage à l'autre */

/* Histoire d'une épargne, du point de départ au mois en cours (ou au dernier mois renseigné). */
/* Plafond d'une épargne : celui saisi, sinon le plafond légal de son type (0 = aucun). */
const plafOf = a => !vide(a.plaf) && +a.plaf > 0 ? +a.plaf : ((TYPES_EP[a.type] || {}).plaf || 0);
function histoEp(a) {
  const auto = autoEp()[a.id] || {}, plaf = plafOf(a);
  const cles = [...['rep', 'mv', 'rt', 'it', 'reel'].flatMap(f => Object.keys(a[f] || {})), ...Object.keys(auto)].filter(k => KEY_RE.test(k)).sort();
  const depart = KEY_RE.test(a.d0 || '') ? a.d0 : a.v2 ? kNow() : (a.ouv && KEY_RE.test(a.ouv.slice(0, 7))) ? a.ouv.slice(0, 7) : (cles[0] || kNow());
  let fin = kNow(); if (cles.length && cles[cles.length - 1] > fin) fin = cles[cles.length - 1];
  const val = (f, k) => { const o = a[f] || {}; return vide(o[k]) ? null : +o[k]; };
  const mois = [];
  let s = +a.s0 || 0, verse = 0, interets = 0, ecarts = 0, budget = 0, bloque = 0;
  for (let k = depart, n = 0; k <= fin && n < 1200; k = kSuiv(k), n++) {
    const rep = k > depart || !a.v2 ? r2((val('rep', k) || 0) + (auto[k] || 0)) : 0, mv = val('mv', k) || 0, rt = val('rt', k) || 0, it = val('it', k) || 0, reel = val('reel', k);
    /* Au plafond, le livret est bloqué : les versements au-delà sont refusés,
       seuls les intérêts (et les retraits) passent encore. */
    let dep = r2(rep + mv - rt), bl = 0;
    if (plaf && dep > 0) { const place = Math.max(0, r2(plaf - s)); if (dep > place) { bl = r2(dep - place); dep = place; } }
    const calc = r2(s + dep + it), ec = reel === null ? 0 : r2(reel - calc);
    const f = reel === null ? calc : reel;
    mois.push({ k, deb: s, rep, mv, rt, it, bl, calc, reel, ec, fin: f });
    budget += rep; verse += mv - rt; interets += it; ecarts += ec; bloque += bl; s = f;
  }
  const ignores = cles.filter(k => k < depart).length;
  return { depart, mois, solde: s, s0: +a.s0 || 0, budget: r2(budget), verse: r2(verse), interets: r2(interets), ecarts: r2(ecarts), bloque: r2(bloque), plaf, ignores,
    plus: r2(sum(mois.map(x => Math.max(0, x.rep) + Math.max(0, x.mv)))), moins: r2(sum(mois.map(x => x.rt - Math.min(0, x.rep) - Math.min(0, x.mv)))),
    plusBudget: r2(sum(mois.map(x => Math.max(0, x.rep)))) };
}
/* Une ligne 🐖 du budget peut être reliée à une épargne (l.acc) : ses montants
   arrivent alors d'eux-mêmes sur cette épargne, le mois où ils sont saisis
   (et en sortent pour une ligne « pris sur l'épargne »). Calculé une fois par affichage. */
let autoCache = null;
function autoEp() {
  if (autoCache) return autoCache;
  const out = {};
  Object.entries(state.years || {}).forEach(([an, y]) => {
    const tout = [...(y.revenus || []).map(l => [l, 'rev']), ...(y.fixes || []).flatMap(c => c.lines).map(l => [l, 'fix']), ...(y.variables || []).map(l => [l, 'fix'])];
    tout.forEach(([l, kind]) => {
      if (!l.acc) return;
      const f = fluxOf(l, kind), sgn = f === 'vers' ? 1 : (f === 'epg' || f === 'pe') ? -1 : 0;
      if (!sgn) return;
      const o = out[l.acc] = out[l.acc] || {};
      l.v.forEach((x, i) => { if (+x) { const c = mKey(+an, i); o[c] = r2((o[c] || 0) + sgn * x); } });
    });
  });
  return autoCache = out;
}
const autoMois = m => { const c = mKey(+state.activeYear, m), A = autoEp(); return r2(mesEpargnes().reduce((t, a) => t + ((A[a.id] || {})[c] || 0), 0)); };
/* Solde d'une épargne en fin de mois k (0 avant son point de départ). */
function soldeEpA(a, k, h) {
  h = h || histoEp(a);
  if (k < h.depart) return k === kPrec(h.depart) ? h.s0 : 0;   /* le point de départ est le solde au début de son mois */
  const m = h.mois.find(x => x.k === k);
  return m ? m.fin : h.solde;
}
const sommeEpA = k => r2(mesEpargnes().reduce((t, a) => t + soldeEpA(a, k), 0));

/* Ce que le budget met de côté (net) un mois donné, moins ce qui va déjà tout seul sur une épargne reliée. */
const netBudgetMois = (k, m) => r2(k.vers[m] - k.rev.epg[m] - k.pe[m] - autoMois(m));

/* Le journal d'une épargne : seulement ce qui s'est passé, année par année. */
function journalEp(a, hh, sg) {
  const parAn = new Map();
  hh.mois.forEach(x => { const an = x.k.slice(0, 4); if (!parAn.has(an)) parAn.set(an, []); parAn.get(an).push(x); });
  const ans = [...parAn.keys()].reverse(), dernier = ans[0];
  const sup = (f, k, lib) => `<button type="button" class="mini-btn danger" data-mvdel="${f}" data-k="${k}" title="Effacer : ${lib}">✕</button>`;
  return ans.map(an => {
    const ms = parAn.get(an), cleO = 'y:' + a.id + ':' + an;
    const ouvert = epOuverts.has(cleO) || (!epOuverts.has('f' + cleO) && an === dernier);
    let lignes = '';
    if (an === hh.depart.slice(0, 4)) lignes += `<tr class="dep"><td class="mn">${MONTHS[+hh.depart.slice(5) - 1]}</td><td>📍 Sur le livret au départ</td><td></td><td><b>${money(hh.s0)}</b></td><td></td></tr>`;
    ms.forEach(x => {
      const mn = MONTHS[+x.k.slice(5) - 1], ev = [];
      if (x.rep) ev.push([x.rep > 0 ? '🐖 Mis de côté (budget)' : '🐖 Repris (budget)', sg(x.rep), x.rep > 0 ? 'pos' : 'neg', '']);
      if (x.bl) ev.push(['🔒 Refusé : livret au plafond', money(x.bl), 'neg', '']);
      if (x.mv) ev.push([x.mv > 0 ? '➕ Versé' : '➖ Retiré', sg(x.mv), x.mv > 0 ? 'pos' : 'neg', sup('mv', x.k, x.mv > 0 ? 'versement' : 'retrait')]);
      if (x.rt) ev.push(['➖ Retiré', '− ' + money(x.rt), 'neg', sup('rt', x.k, 'retrait')]);
      if (x.it) ev.push(['✨ Intérêts', sg(x.it), 'pos', sup('it', x.k, 'intérêts')]);
      if (x.reel !== null) {
        ev.push(['🏦 Solde de la banque', money(x.reel), '', sup('reel', x.k, 'solde de la banque')]);
        if (x.ec) ev.push(['❓ Pas expliqué', sg(x.ec), 'warn', '']);
      }
      ev.forEach((e, j) => {
        lignes += `<tr class="${x.k === kNow() ? 'cur' : ''} ${e[2] === 'warn' ? 'nonexp' : ''}"><td class="mn">${j ? '' : mn}</td><td>${e[0]}</td>
          <td class="${e[2]}">${e[1]}</td><td>${j === ev.length - 1 ? money(x.fin) : ''}</td><td>${e[3]}</td></tr>`;
      });
    });
    const t = f => r2(sum(ms.map(x => x[f])));
    const plus = r2(sum(ms.map(x => Math.max(0, x.rep) + Math.max(0, x.mv)))), moins = -r2(sum(ms.map(x => x.rt - Math.min(0, x.rep) - Math.min(0, x.mv))));
    return `<details class="ep-an" data-ouv="${cleO}" ${ouvert ? 'open' : ''}><summary><b>${an}</b>
        <span>fin d’année : <b>${money(ms[ms.length - 1].fin)}</b></span>
        ${plus ? `<span>➕ ${money0(plus)}</span>` : ''}${moins ? `<span>➖ ${money0(-moins)}</span>` : ''}${t('it') ? `<span>✨ ${money0(t('it'))}</span>` : ''}
        ${t('ec') ? `<span class="warn">❓ ${sg(t('ec'))}</span>` : ''}${lignes ? '' : '<span class="vide">rien de noté</span>'}</summary>
      ${lignes ? `<div class="ep-tblwrap"><table class="ep-tbl ep-jrn"><thead><tr><th>Mois</th><th>Ce qui s’est passé</th><th>Montant</th><th>Solde<small>fin de mois</small></th><th></th></tr></thead>
        <tbody>${lignes}</tbody></table></div>` : ''}</details>`;
  }).join('');
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
        <b>🏦 Relevé bancaire.</b> Déposez le relevé téléchargé depuis l'espace client de votre
        banque — <code>.csv</code>, <code>.ofx</code> ou <code>.json</code>. NaoBudget reconnaît
        le compte (courant, épargne ou joint), devine à quelle ligne du budget chaque opération
        se rattache et écarte les virements entre vos comptes ; vous corrigez ce qu'il faut, et tout
        s'inscrit dans le détail 📋 du mois.</p>
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

    <div class="card"><div class="hd"><h2><span>❓</span> Comment ça marche</h2></div><div class="bd">
      <p style="font-size:13.5px;color:var(--ink-2);line-height:1.7;margin:0 0 12px">
        Tout NaoBudget est expliqué pas à pas : saisir, statuts, détailler et partager une dépense,
        recopier sur plusieurs mois, épargne, relevé bancaire, Excel, sauvegardes, remise à zéro…</p>
      <button class="btn primary" data-aide="">❓ Ouvrir « Comment ça marche »</button>
      <span style="font-size:12.5px;color:var(--ink-3);margin-left:8px">ou touche F1</span>
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

/* ---------- Fenêtres maison, à la place de alert / confirm / prompt du navigateur ----------
   Mêmes couleurs que l'outil, texte lisible, clavier : Entrée valide, Échap annule, Tab reste dans la fenêtre. */
function nbFenetre({ titre = 'NaoBudget', texte = '', ok = 'OK', annuler = 'Annuler', danger = false, seulOk = false, champ = null }) {
  return new Promise(res => {
    const avant = document.activeElement;
    const bg = document.createElement('div');
    bg.className = 'modal-bg nb-fen-bg';
    bg.innerHTML = `<div class="modal nb-fen" role="${seulOk ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="nbFenT" aria-describedby="nbFenX">
      <div class="mhd"><span id="nbFenT">${esc(titre)}</span></div>
      <div class="mbd"><p id="nbFenX" class="nb-fen-txt">${esc(texte)}</p>
        ${champ !== null ? `<input class="nb-fen-champ" id="nbFenC" aria-labelledby="nbFenX" value="${esc(String(champ))}">` : ''}</div>
      <div class="mft"><span class="right"></span>
        ${seulOk ? '' : `<button class="btn" data-fen="0">${esc(annuler)}</button>`}
        <button class="btn ${danger ? 'danger plein' : 'primary'}" data-fen="1">${esc(ok)}</button></div></div>`;
    document.body.appendChild(bg);
    const zone = bg.querySelector('#nbFenC');
    const fin = oui => {
      window.removeEventListener('keydown', clavier, true);
      bg.remove();
      if (avant && avant.isConnected && avant.focus) avant.focus();
      res(champ !== null ? (oui ? zone.value : null) : !!oui);
    };
    const clavier = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); fin(false); }
      else if (e.key === 'Enter' && (e.target === zone || !e.target.closest || !e.target.closest('button'))) {
        e.preventDefault(); e.stopImmediatePropagation(); fin(true);
      }
      else if (e.key === 'Tab') {
        const f = [...bg.querySelectorAll('input,button')];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    };
    window.addEventListener('keydown', clavier, true);
    bg.addEventListener('click', e => {
      if (e.target === bg) return fin(false);
      const b = e.target.closest('button[data-fen]'); if (b) fin(b.dataset.fen === '1');
    });
    if (zone) { zone.focus(); zone.select(); }
    else bg.querySelector(danger ? 'button[data-fen="0"]' : 'button[data-fen="1"]').focus();
  });
}
const nbAvertir = (texte, titre = '⚠️ Impossible de continuer') => nbFenetre({ titre, texte, seulOk: true });
const nbConfirmer = (texte, o = {}) => nbFenetre({ titre: o.titre || 'Êtes-vous sûr(e) ?', texte, ok: o.ok || 'Oui', annuler: o.annuler || 'Annuler', danger: !!o.danger });
const nbDemander = (texte, defaut = '', titre = 'NaoBudget') => nbFenetre({ titre, texte, champ: defaut, ok: 'Valider' });

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
      /* L'étiquette 💳 / 🐖 devinée d'après le nom suit la frappe (tant qu'on ne l'a pas choisie à la main). */
      const fb = tr.querySelector('.del.flux'), kd = tr.classList.contains('b-rev') ? 'rev' : 'fix';
      if (fb) {
        const f = fluxOf(l, kd);
        fb.className = fb.className.replace(/\bfl-\w+/, 'fl-' + f);
        fb.textContent = (kd === 'rev' ? FLUX_REV : FLUX_DEP)[f].em;
        tr.className = tr.className.replace(/\bfx-\w+/, 'fx-' + f);
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
/* Soldes de départ et soldes réels de la vue 🐖 Épargne : enregistrés en
   quittant la case (ou avec Entrée), puis tout est recalculé. */
viewNode.addEventListener('change', e => {
  const t = e.target;
  /* Une date se tape chiffre par chiffre : le navigateur signale un changement dès
     l'an 0002. On attend donc que l'on quitte la case pour enregistrer et redessiner. */
  if (t.dataset.acc && (t.type === 'date' || t.type === 'month') && document.activeElement === t) return;
  if (t.dataset.lienacc) {
    const row = t.closest('.ep-ligne'), l = row && findLine(row.dataset.path, row.dataset.id); if (!l) return;
    if (t.value) l.acc = t.value; else delete l.acc;
    autoCache = null; save(); rendGarde();
    toast(t.value ? '🔗 Ligne reliée : son montant arrive tout seul sur cette épargne' : '🔗 Ligne détachée');
    return;
  }
  if (t.dataset.acc) { changeEpargne(t); return; }
  if (!t.dataset.solde0 && !t.dataset.reel) return;
  const y = Y(); y.comptes = y.comptes || {};
  const v = t.value.trim() === '' ? null : parseNum(t.value);
  if (t.dataset.solde0) {
    if (v === null) delete y.comptes[t.dataset.solde0 + '0']; else y.comptes[t.dataset.solde0 + '0'] = v;
  } else {
    const cle = t.dataset.reel === 'ep' ? 'rep' : 'rcc', o = y.comptes[cle] = y.comptes[cle] || {};
    if (v === null) delete o[t.dataset.m]; else o[t.dataset.m] = v;
  }
  save();
  rendGarde();
  toast(v === null ? '↩️ Solde effacé : le calcul reprend la main' : '🏦 Solde enregistré');
});
viewNode.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && (e.target.classList.contains('solde-in') || e.target.classList.contains('txt-in')) && !e.target.dataset.reg) e.target.blur();
});
/* Volets « mois par mois » : on se souvient de ceux qui sont ouverts ou fermés. */
viewNode.addEventListener('focusout', e => {
  const t = e.target;
  if (t.dataset && t.dataset.acc && (t.type === 'date' || t.type === 'month')) changeEpargne(t);
});
viewNode.addEventListener('toggle', e => {
  const d = e.target, c = d.dataset && d.dataset.ouv; if (!c) return;
  if (d.open) { epOuverts.add(c); epOuverts.delete('f' + c); } else { epOuverts.delete(c); epOuverts.add('f' + c); }
}, true);
/* Après une saisie dans l'onglet Épargne : on recalcule tout, mais sans
   animation, sans bouger la page et en rendant la main à la case où l'on
   était (ou à celle où le Tab nous a menés). Le léger délai laisse le
   focus arriver sur la case suivante avant de redessiner. */
let rendCalme = false;
const CHAMP_ATTRS = ['acc', 'f', 'k', 'solde0', 'reel', 'm', 'reg', 'epmois', 'reptout', 'accdel', 'accreg', 'accadd', 'repprec', 'repannee'];
function cleChamp(n) {
  if (!n || !viewNode.contains(n) || n === viewNode) return null;
  const sel = CHAMP_ATTRS.filter(a => n.dataset[a] !== undefined).map(a => `[data-${a}="${CSS.escape(n.dataset[a])}"]`).join('');
  if (!sel) return null;
  const acc = n.closest('.ep-liv');
  return (acc && n.dataset.acc === undefined ? `.ep-liv[data-accid="${CSS.escape(acc.dataset.accid)}"] ` : '') + n.tagName.toLowerCase() + sel;
}
function rendGarde() {
  setTimeout(() => {
    const a = document.activeElement, cle = cleChamp(a);
    const pos = a && typeof a.selectionStart === 'number' ? [a.selectionStart, a.selectionEnd] : null;
    const sx = window.scrollX, sy = window.scrollY;
    rendCalme = true;
    try { render(); } finally { rendCalme = false; }
    window.scrollTo(sx, sy);
    const n = cle && viewNode.querySelector(cle);
    if (n) {
      n.focus({ preventScroll: true });
      try { if (pos) n.setSelectionRange(pos[0], pos[1]); } catch (e) {}
      window.scrollTo(sx, sy);
    }
  }, 0);
}
function changeEpargne(t) {
  const a = mesEpargnes().find(x => x.id === t.dataset.acc); if (!a) return;
  const f = t.dataset.f, brut = t.value.trim();
  if (['rep', 'mv', 'it', 'reel'].includes(f)) {
    const o = a[f] = a[f] || {}, v = brut === '' ? null : parseNum(brut);
    if (v === null || (v === 0 && f !== 'reel')) delete o[t.dataset.k]; else o[t.dataset.k] = v;
  } else if (f === 's0') { if (brut === '') delete a.s0; else a.s0 = parseNum(brut); }
  else if (f === 'ouv' || f === 'd0') {
    /* Année plausible seulement (1900-2100) ; une date incomplète n'efface rien. */
    const an = parseInt(brut.slice(0, 4), 10), ok = brut && an >= 1900 && an <= 2100;
    if (t.validity && t.validity.badInput) { rendGarde(); return; }
    if (brut && !ok) { toast('📅 Année à vérifier (entre 1900 et 2100)'); rendGarde(); return; }
    if (String(a[f] || '') === brut) return;
    if (f === 'ouv') a.ouv = brut; else if (KEY_RE.test(brut)) a.d0 = brut; else delete a.d0;
  }
  else if (f === 'solact') {   /* le solde actuel est le solde réel du mois en cours */
    a.reel = a.reel || {};
    if (brut === '') delete a.reel[kNow()]; else a.reel[kNow()] = parseNum(brut);
  }
  else if (f === 'plaf') { if (brut === '' || !parseNum(brut)) delete a.plaf; else a.plaf = Math.abs(parseNum(brut)); }
  else a[f] = brut;
  save(); rendGarde();
  if (f === 'reel' || f === 'solact') toast(brut === '' ? '↩️ Solde réel effacé' : '🏦 Solde réel enregistré');
}
viewNode.addEventListener('focusin', e => {
  const t = e.target;
  if (t.classList.contains('cell')) {
    const n = parseNum(t.value);
    t.dataset.av = n;                 /* pour savoir, en sortant, ce qui a changé */
    t.value = n ? String(n).replace('.', ',') : '';
    setTimeout(() => { if (document.activeElement === t) t.select(); }, 0);   /* sinon, au Tab rapide, deux cases se reprennent la main sans fin */
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
    const r0 = rows.indexOf(t.closest('tr')), nc = cells[r0] ? cells[r0].length : 12;
    let r = r0 + dr, c = cells[r0].indexOf(t) + dc;
    if (c < 0) { c = nc - 1; r--; } if (c > nc - 1) { c = 0; r++; }
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
  const input = tr.querySelector(`.cell[data-m="${m}"]`);
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
    const inp = tr.querySelector(`.cell[data-m="${m}"]`);
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

/* --- d'où vient l'argent : petit menu sur le bouton de la ligne --- */
let fluxTarget = null;
const kindOfTr = tr => tr.classList.contains('b-rev') ? 'rev' : tr.classList.contains('b-var') ? 'var' : 'fix';
function closeFlux() { const p = el('fluxpick'); if (p) p.remove(); fluxTarget = null; }
function openFlux(btn, tr) {
  closeFlux();
  const l = findLine(tr.dataset.path, tr.dataset.id); if (!l) return;
  const kind = kindOfTr(tr), cur = fluxOf(l, kind), T = kind === 'rev' ? FLUX_REV : FLUX_DEP;
  fluxTarget = { tr };
  const p = document.createElement('div');
  p.className = 'fluxpick'; p.id = 'fluxpick';
  p.innerHTML = `<div class="fhd">${kind === 'rev' ? 'D’où vient cet argent ?' : 'Avec quel argent est-ce payé ?'}
      <small>« ${esc(l.label)} »</small></div>
    ${Object.entries(T).map(([k, f]) => `<button type="button" class="fopt fl-${k} ${k === cur ? 'on' : ''}" data-fl="${k}">
      <span class="fe">${f.em}</span><span><b>${f.nom}</b><i>${f.d}</i></span></button>`).join('')}
    <div class="fpied">Ça ne change pas les totaux du tableau : ça dit seulement par quel compte passe l’argent,
      pour que 🐖 Épargne sache ce qui est sur le livret et ce qui est sur le compte.</div>`;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect(), h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(window.innerWidth - 348, r.left)) + 'px';
  p.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, r.bottom + 6)) + 'px';
}
document.addEventListener('click', e => {
  const p = el('fluxpick'); if (!p) return;
  const b = e.target.closest('[data-fl]');
  if (b && fluxTarget) {
    const tr = fluxTarget.tr, l = findLine(tr.dataset.path, tr.dataset.id);
    if (l) {
      const kind = kindOfTr(tr);
      setFlux(l, kind, b.dataset.fl);
      save(); render();
      const f = fluxInfo(l, kind);
      toast(`${f.em} « ${l.label} » : ${f.nom.toLowerCase()}`);
    }
    closeFlux(); return;
  }
  if (!e.target.closest('.fluxpick') && !e.target.closest('[data-act="flux"]')) closeFlux();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFlux(); });

/* --- clics : ajout / suppression / déplacement / vidage --- */
/* Dans la vue « Le mois », vider ne touche que le mois affiché. */
const moisSeul = () => view === 'mois' ? selMonth : null;
function clearLines(lines, m) {
  lines.forEach(l => {
    if (m === null || m === undefined) { l.v = z12(); l.s = e12(); l.d = {}; return; }
    l.v[m] = 0; l.s[m] = ''; if (l.d) delete l.d[m];
  });
}
viewNode.addEventListener('click', async e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const tr = btn.closest('tr.row');

  if (btn.dataset.m !== undefined && btn.closest('.msel')) { selMonth = +btn.dataset.m; render(); return; }

  if (btn.classList.contains('st') && tr) { cycleStatus(tr, +btn.dataset.st); return; }
  if (btn.dataset.act === 'emoji' && tr) { openPicker(btn, tr); return; }
  if (btn.dataset.act === 'flux' && btn.closest('.ep-ligne')) { openFlux(btn, btn.closest('.ep-ligne')); return; }
  if (btn.dataset.retire) {
    /* La ligne ne touche plus l'épargne : rentrée sur le compte courant
       (virement reçu si son nom en parle, sinon salaire), ou dépense payée depuis le compte. */
    const row = btn.closest('.ep-ligne'), l = row && findLine(row.dataset.path, row.dataset.id); if (!l) return;
    const kind = kindOfTr(row);
    setFlux(l, kind, kind === 'rev' ? (REV_VIR_RE.test(noAcc(l.label)) ? 'vir' : 'sal') : 'cpt');
    save(); render();
    const f = fluxInfo(l, kind);
    toast(`${f.em} « ${l.label} » ne touche plus l’épargne (${f.nom.toLowerCase()})`);
    return;
  }
  if (btn.dataset.capmode) { state.capFix = btn.dataset.capmode === 'fix'; save(); rendGarde(); return; }
  if (btn.dataset.creeacc) {
    const row = btn.closest('.ep-ligne'), l = row && findLine(row.dataset.path, row.dataset.id); if (!l) return;
    const premier = l.v.findIndex(x => +x), nom = nomDepuisLigne(l.label), ty = typeDepuisLigne(l.label);
    /* Une épargne du même nom (ou du même type réglementé) existe déjà : on relie plutôt que de créer un doublon. */
    const deja = mesEpargnes().find(a => noAcc(a.nom || '') === noAcc(nom) || (ty !== 'autre' && ty !== 'liv' && a.type === ty));
    if (deja) { l.acc = deja.id; autoCache = null; save(); rendGarde(); toast(`🔗 Reliée à « ${deja.nom || TYPES_EP[deja.type].nom} », qui existait déjà`); return; }
    const a = { id: uid(), nom: nomDepuisLigne(l.label), type: typeDepuisLigne(l.label), banque: '', ouv: '',
      d0: kNow(), v2: true };
    mesEpargnes().push(a); l.acc = a.id; autoCache = null; save(); rendGarde();
    toast(`🏦 « ${a.nom} » créée et reliée : indiquez ce qu’il y a dessus aujourd’hui`);
    return;
  }
  if (btn.dataset.epmois !== undefined) { epMois = +btn.dataset.epmois; rendGarde(); return; }
  if (btn.dataset.accadd) {
    const a = { id: uid(), nom: '', type: 'la', banque: '', ouv: '', d0: kNow(), v2: true };
    mesEpargnes().push(a); epOuverts.add('a:' + a.id); epOuverts.add('r:' + a.id);
    save(); rendCalme = true; render(); rendCalme = false;
    const i = document.querySelector(`.ep-liv[data-accid="${a.id}"] [data-f="nom"]`);
    if (i) { i.scrollIntoView({ block: 'center', behavior: 'smooth' }); i.focus(); }
    toast('🏦 Livret ajouté : donnez-lui un nom et indiquez ce qu’il y a dessus');
    return;
  }
  if (btn.dataset.accdel) {
    const l = mesEpargnes(), a = l.find(x => x.id === btn.dataset.accdel); if (!a) return;
    if (!await nbConfirmer(`Supprimer « ${a.nom || (TYPES_EP[a.type] || TYPES_EP.autre).nom} » et tout son historique (soldes, versements, répartitions) ?\n\nLes lignes du budget ne bougent pas.`, { titre: '🗑️ Supprimer une épargne', ok: 'Supprimer', danger: true })) return;
    l.splice(l.indexOf(a), 1); save(); rendGarde(); toast('🗑️ Épargne supprimée');
    return;
  }
  if (btn.dataset.mvadd) {
    const a = mesEpargnes().find(x => x.id === btn.dataset.mvadd), box = btn.closest('.ep-ajout'); if (!a || !box) return;
    const typ = (box.querySelector('input[type=radio]:checked') || {}).value || 'vers';
    const mt = Math.abs(parseNum(box.querySelector('[data-mva]').value)), du = box.querySelector('[data-mvm]').value, au = box.querySelector('[data-mvu]').value || du;
    if (!mt && typ !== 'solde') { toast('Indiquez un montant'); box.querySelector('[data-mva]').focus(); return; }
    if (!KEY_RE.test(du) || +du.slice(0, 4) < 1900 || +du.slice(0, 4) > 2100) { toast('📅 Choisissez le mois'); return; }
    const dep = histoEp(a).depart;
    if (du < dep) { toast(`📍 Avant le point de départ (${kLab(dep).toLowerCase()}) : ce n’est pas compté, c’est déjà dans le montant de départ`); return; }
    if (!KEY_RE.test(au) || au < du) { toast('📅 « Jusqu’à » doit venir après le premier mois'); return; }
    let n = 0;
    for (let c = du; c <= (typ === 'solde' ? du : au) && n < 1200; c = kSuiv(c), n++) {
      if (typ === 'solde') { a.reel = a.reel || {}; a.reel[c] = mt; }
      else if (typ === 'int') { a.it = a.it || {}; a.it[c] = r2((+a.it[c] || 0) + mt); }
      else { const f = typ === 'retr' ? 'rt' : 'mv'; a[f] = a[f] || {}; a[f][c] = r2((+a[f][c] || 0) + mt); }
    }
    epOuverts.add('a:' + a.id); epOuverts.add('y:' + a.id + ':' + du.slice(0, 4));
    save(); rendGarde();
    const quoi = { vers: 'Versement', retr: 'Retrait', int: 'Intérêts', solde: 'Solde de la banque' }[typ];
    toast(`✅ ${quoi} de ${money(mt)} noté${n > 1 ? ` sur ${n} mois` : ` en ${kLab(du).toLowerCase()}`}`);
    return;
  }
  if (btn.dataset.mvdel) {
    const acc = btn.closest('.ep-liv'), a = acc && mesEpargnes().find(x => x.id === acc.dataset.accid); if (!a) return;
    if (a[btn.dataset.mvdel]) delete a[btn.dataset.mvdel][btn.dataset.k];
    save(); rendGarde(); toast('🗑️ Effacé');
    return;
  }
  if (btn.dataset.accreg) {
    const a = mesEpargnes().find(x => x.id === btn.dataset.accreg), box = btn.closest('.ep-reg'); if (!a || !box) return;
    const mt = parseNum(box.querySelector('[data-reg="mt"]').value), du = box.querySelector('[data-reg="du"]').value, au = box.querySelector('[data-reg="au"]').value;
    if (!mt || !KEY_RE.test(du) || !KEY_RE.test(au) || du > au) { toast('Indiquez un montant et deux mois dans l’ordre'); return; }
    a.mv = a.mv || {}; let n = 0;
    for (let c = du; c <= au && n < 1200; c = kSuiv(c), n++) a.mv[c] = r2((+a.mv[c] || 0) + mt);
    save(); rendGarde(); toast(`➕ ${money(mt)} ajoutés sur ${n} mois`);
    return;
  }
  if (btn.dataset.reptout || btn.dataset.repprec || btn.dataset.repannee) {
    const k = comptes(), an = +state.activeYear, l = mesEpargnes();
    const m = epMois === null ? moisRef() : epMois;
    const repartis = i => r2(l.reduce((t, a) => t + (+(a.rep || {})[mKey(an, i)] || 0), 0));
    /* Recopie la répartition du mois s sur le mois d, au prorata de ce qui est à répartir. */
    const copie = (s, d) => {
      const ns = repartis(s), nd = netBudgetMois(k, d), cd = mKey(an, d); if (!ns) return false;
      const parts = l.filter(a => +(a.rep || {})[mKey(an, s)]);
      l.forEach(b => { if (b.rep) delete b.rep[cd]; });
      let reste = nd;
      parts.forEach((a, j) => {
        const v = j === parts.length - 1 ? r2(reste) : r2(nd * (+a.rep[mKey(an, s)]) / ns);
        reste = r2(reste - v);
        if (v) a.rep[cd] = v;
      });
      return true;
    };
    if (btn.dataset.reptout) {
      const a = l.find(x => x.id === btn.dataset.reptout); if (!a) return;
      const c = mKey(an, m), r = r2(netBudgetMois(k, m) - repartis(m));
      a.rep = a.rep || {}; a.rep[c] = r2((+a.rep[c] || 0) + r); if (!a.rep[c]) delete a.rep[c];
      toast(`🧺 ${money(r)} sur « ${a.nom || (TYPES_EP[a.type] || TYPES_EP.autre).nom} »`);
    } else if (btn.dataset.repprec) {
      let s = m - 1; while (s >= 0 && !repartis(s)) s--;
      if (s < 0 || !copie(s, m)) { toast('Aucun mois réparti avant celui-ci'); return; }
      toast(`↺ Réparti comme ${MONTHS[s].toLowerCase()}`);
    } else {
      let modele = -1, n = 0;
      for (let i = 0; i < 12; i++) {
        const reste = Math.abs(netBudgetMois(k, i) - repartis(i)) >= 0.005;
        if (!reste && repartis(i)) modele = i;
        else if (reste && modele >= 0 && copie(modele, i)) n++;
      }
      if (!n) { toast(modele < 0 ? 'Répartissez d’abord un mois : il servira de modèle' : 'Rien à répartir'); return; }
      toast(`↻ ${n} mois réparti(s) sur le modèle du mois précédent`);
    }
    save(); rendGarde();
    return;
  }
  if (btn.dataset.ep0somme) {
    const y = Y(); y.comptes = y.comptes || {};
    y.comptes.ep0 = sommeEpA(mKey(+state.activeYear - 1, 11));
    save(); rendGarde(); toast('🏦 Solde de départ = somme de vos épargnes');
    return;
  }
  if (btn.dataset.goview) { view = btn.dataset.goview; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (btn.dataset.reprise) {
    const p = state.years[String(+state.activeYear - 1)]; if (!p) return;
    const kp = comptes(p), y = Y(); y.comptes = y.comptes || {};
    if (vide(y.comptes.cc0)) y.comptes.cc0 = kp.cc[11];
    if (vide(y.comptes.ep0)) y.comptes.ep0 = kp.ep[11];
    save(); render(); toast('📆 Soldes de départ repris de ' + (+state.activeYear - 1));
    return;
  }

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
    const cat = y.fixes[i];
    if (!await nbConfirmer(`Supprimer la catégorie « ${cat.name} » et ses ${cat.lines.length} ligne(s) ?`, { titre: '🗑️ Supprimer une catégorie', ok: 'Supprimer', danger: true })) return;
    const j = y.fixes.indexOf(cat); if (j < 0) return;
    y.fixes.splice(j, 1); save(); render(); toast('🗑️ Catégorie supprimée'); return;
  }
  if (btn.dataset.clearcat) {
    const cat = Y().fixes.find(c => c.id === btn.dataset.clearcat); if (!cat) return;
    const mo = moisSeul();
    if (!await nbConfirmer(`Remettre à zéro tous les montants de « ${cat.name} »${mo === null ? '' : ' pour ' + MONTHS[mo].toLowerCase() + ' ' + state.activeYear} ?\n\nLes lignes restent en place.`, { titre: '🧹 Vider une catégorie', ok: 'Remettre à zéro', danger: true })) return;
    clearLines(cat.lines, mo); save(); render(); toast('🧹 ' + cat.name + ' vidée');
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
    if (k === 'all' && !await nbConfirmer("Classer TOUTES les lignes du tableau par jour de prélèvement ?\n\nL'ordre que vous avez mis à la main sera remplacé. Les lignes sans date passent à la fin de leur bloc.", { titre: '📅 Classer par date', ok: 'Classer' })) return;
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
    const k = btn.dataset.clear, y = Y(), mo = moisSeul();
    const quand = mo === null ? '' : ` pour ${MONTHS[mo].toLowerCase()} ${state.activeYear} (les autres mois ne bougent pas)`;
    const label = (k === 'rev' ? 'du bloc Revenus' : k === 'fix' ? 'du bloc Dépenses fixes'
      : k === 'var' ? 'du bloc Dépenses variables' : mo === null ? `de toute l'année ${state.activeYear}` : 'du mois') + quand;
    if (!await nbConfirmer(`Remettre à zéro tous les montants ${label} ?\n\nLes lignes, catégories et émojis restent en place — seuls les chiffres et les statuts sont effacés.`, { titre: '🧹 Remettre à zéro', ok: 'Remettre à zéro', danger: true })) return;
    if (k === 'rev') clearLines(y.revenus, mo);
    else if (k === 'fix') y.fixes.forEach(c => clearLines(c.lines, mo));
    else if (k === 'var') clearLines(y.variables, mo);
    else { clearLines(y.revenus, mo); y.fixes.forEach(c => clearLines(c.lines, mo)); clearLines(y.variables, mo); }
    save(); render(); toast('🧹 Montants remis à zéro');
    return;
  }
  if (tr) {
    const b = bucket(tr.dataset.path); if (!b) return;
    const i = b.findIndex(l => l.id === tr.dataset.id); if (i < 0) return;
    const act = btn.dataset.act;
    if (act === 'flux') { openFlux(btn, tr); return; }
    if (act === 'delline') {
      const ligne = b[i];
      if (lineTotal(ligne) && !await nbConfirmer(`Supprimer « ${ligne.label} » et ses montants ?`, { titre: '🗑️ Supprimer une ligne', ok: 'Supprimer', danger: true })) return;
      const j = b.indexOf(ligne); if (j < 0) return;
      b.splice(j, 1); save(); render(); toast('🗑️ Ligne supprimée');
    } else if (act === 'up' && i > 0) { [b[i - 1], b[i]] = [b[i], b[i - 1]]; save(); render(); }
    else if (act === 'down' && i < b.length - 1) { [b[i + 1], b[i]] = [b[i], b[i + 1]]; save(); render(); }
    else if (act === 'fill') openCopie(tr.dataset.path, tr.dataset.id);
    return;
  }
  if (btn.dataset.goyear) { state.activeYear = +btn.dataset.goyear; view = 'annuel'; save(); render(); return; }
  if (btn.dataset.delyear) {
    const y = btn.dataset.delyear;
    if (!await nbConfirmer(`Supprimer définitivement le budget ${y} ?\n\nToutes ses lignes et tous ses montants disparaissent. Pensez à exporter une sauvegarde avant.`, { titre: '🗑️ Supprimer une année', ok: 'Supprimer ' + y, danger: true })) return;
    delete state.years[y];
    if (String(state.activeYear) === y) state.activeYear = +Object.keys(state.years).sort()[0];
    save(); render(); toast('🗑️ Budget supprimé'); return;
  }
  if (btn.dataset.newyear) {
    const target = await nbDemander('Quelle année voulez-vous créer ?', String(+state.activeYear + 1), '✨ Nouveau budget');
    if (!target) return;
    const k = String(parseInt(target, 10));
    if (k === 'NaN' || +k < 1900 || +k > 2200) { nbAvertir('Écrivez une année en chiffres, par exemple ' + (+state.activeYear + 1) + '.', '✨ Nouveau budget'); return; }
    if (state.years[k] && !await nbConfirmer(`Le budget ${k} existe déjà.\n\nL'écraser ? Ses lignes et ses montants seront remplacés.`, { titre: '✨ Nouveau budget', ok: 'Écraser ' + k, danger: true })) return;
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
    toast(humourOn ? '😄 C’est reparti pour les blagues' : '😐 Blagues coupées — que du sérieux', humourOn ? 'fun' : '');
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
  r.onload = async () => {
    try {
      const s = JSON.parse(r.result);
      if (!s || !s.years) throw new Error('format');
      if (!await nbConfirmer('Remplacer le budget actuel par cette sauvegarde ?\n\nCe qui est affiché maintenant sera remplacé par le contenu du fichier.', { titre: '📂 Charger une sauvegarde', ok: 'Remplacer', danger: true })) return;
      state = migrate(s);
      if (!state.years[String(state.activeYear)]) state.activeYear = +Object.keys(state.years).sort()[0];
      save(); render(); toast('📂 Sauvegarde chargée');
    } catch (err) { nbAvertir('Ce fichier n’est pas une sauvegarde NaoBudget valide.'); }
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
async function appliqueRaz() {
  const c = razCtx, s = statsRaz();
  const quoi = [c.budgets ? 'tous les budgets' : null,
                c.appris ? 'les rapprochements appris' : null,
                c.reglages ? 'les réglages' : null].filter(Boolean).join(', ');
  if (!await nbConfirmer(`Je vais effacer : ${quoi}.\n`
    + (c.budgets ? `Soit ${s.lignes} ligne(s) et ${s.montants} montant(s) sur ${s.ans} année(s).\n` : '')
    + `\nCette action est définitive. On y va ?`, { titre: '🧨 Dernière vérification', ok: 'Tout effacer', danger: true })) return;
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
(window.ngApresVoile || (f => f()))(entree);   /* venu de NaoGroup : l'ouverture attend le lever du voile */
