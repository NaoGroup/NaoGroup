/* ============================================================
   NaoDaily — le cœur : données, dates, rayons, fenêtres et toasts.
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
const sansAccent = s => String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const pluriel = (n, un, plusieurs) => n + ' ' + (Math.abs(n) > 1 ? (plusieurs || un + 's') : un);
const copie = o => JSON.parse(JSON.stringify(o));

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const isoJour = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const auj = () => isoJour(new Date());
const parseJour = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const ajouteJours = (s, n) => { const d = parseJour(s); d.setDate(d.getDate() + n); return isoJour(d); };
const joursEntre = (a, b) => Math.round((parseJour(b) - parseJour(a)) / 864e5);
const lundiDe = s => { const d = parseJour(s); const j = (d.getDay() + 6) % 7; d.setDate(d.getDate() - j); return isoJour(d); };
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
/* « aujourd'hui », « demain », « dans 5 jours », « il y a 2 jours » */
function quand(s) {
  if (!s) return '';
  const n = joursEntre(auj(), s);
  if (n === 0) return "aujourd'hui";
  if (n === 1) return 'demain';
  if (n === -1) return 'hier';
  if (n > 1) return n < 14 ? `dans ${n} jours` : `le ${fmtJour(s)}`;
  return `il y a ${-n} jours`;
}
function argent(n) {
  const rond = Math.abs((n || 0) - Math.round(n || 0)) < .005;
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: rond ? 0 : 2, minimumFractionDigits: rond ? 0 : 2 }).format(n || 0); }
  catch (e) { return (Math.round((n || 0) * 100) / 100) + ' €'; }
}
const joli = n => { const r = Math.round(n * 100) / 100; return String(r).replace('.', ','); };

/* ============================================================
   LES RÉFÉRENCES
   ============================================================ */
/* Les modèles de listes : [clé, emoji, nom, éléments proposés] */
const MODELES = [
  ['jour', '☀️', 'Tâches du jour', ['Répondre aux messages importants', 'Préparer les affaires de demain', '10 minutes de rangement']],
  ['courses', '🛒', 'Courses', ['Pain', 'Lait', 'Fruits de saison']],
  ['menage', '🧽', 'Ménage', ['Passer l’aspirateur', 'Salle de bain', 'Changer les draps', 'Sortir les poubelles', 'Lancer une lessive']],
  ['valise', '🧳', 'Valise', ['Papiers d’identité', 'Chargeurs', 'Trousse de toilette', 'Pyjama', 'Médicaments']],
  ['voyage', '✈️', 'Voyage', ['Réserver le transport', 'Réserver l’hébergement', 'Vérifier l’assurance', 'Faire garder les plantes']],
  ['demenagement', '📦', 'Déménagement', ['Cartons et scotch', 'Changement d’adresse', 'Transférer électricité et internet', 'Prévenir la banque et la CAF', 'État des lieux']],
  ['rentree', '🎒', 'Rentrée', ['Fournitures scolaires', 'Assurance scolaire', 'Inscriptions aux activités', 'Étiqueter les affaires']],
  ['projet', '🚀', 'Projet', ['Définir l’objectif', 'Lister les étapes', 'Fixer une date']],
  ['achats', '🛍️', 'Achats', []],
  ['documents', '📄', 'Documents', ['Carte d’identité', 'Carte Vitale', 'Attestation d’assurance', 'Avis d’imposition']],
  ['films', '🎬', 'Films & séries', []],
  ['livres', '📚', 'Livres', []],
  ['jeux', '🎲', 'Jeux', []],
  ['idees', '💡', 'Idées', []],
  ['souhaits', '🌠', 'Souhaits', []],
  ['objectifs', '🎯', 'Objectifs', ['Objectif du mois', 'Petit pas de la semaine']],
  ['libre', '📝', 'Liste libre', []]
];
const modele = k => MODELES.find(m => m[0] === k) || MODELES[MODELES.length - 1];
const EMOJIS_LISTE = ['📝', '☀️', '🛒', '🧽', '🧳', '✈️', '📦', '🎒', '🚀', '🛍️', '📄', '🎬', '📚', '🎲', '💡', '🌠', '🎯', '🏡', '🌿', '💪', '🧸', '🐾', '💌', '⭐'];
const PRIORITES = [['haute', 'Importante'], ['normale', 'Normale'], ['basse', 'Quand j’ai le temps']];
const PARTAGES = [['', 'Rien que pour moi'], ['couple', '💞 En couple'], ['famille', '👨‍👩‍👧 En famille'], ['coloc', '🏠 En colocation']];
const partageLib = k => (PARTAGES.find(p => p[0] === k) || PARTAGES[0])[1];

/* Les moments du repas */
const MOMENTS = [['petitdej', '🥐', 'Petit-déjeuner'], ['dejeuner', '🍽️', 'Déjeuner'], ['diner', '🌙', 'Dîner'], ['collation', '🍎', 'Collation']];
const moment = k => MOMENTS.find(m => m[0] === k) || MOMENTS[1];
const CATS_RECETTE = [['rapide', '⚡ Rapide'], ['economique', '🪙 Économique'], ['equilibre', '🥗 Équilibré'], ['familial', '👨‍👩‍👧 Familial'],
  ['vegetarien', '🌱 Végétarien'], ['fete', '🎉 Repas de fête'], ['avance', '🫙 À préparer à l’avance'], ['restes', '♻️ Restes à utiliser']];
const catRecette = k => (CATS_RECETTE.find(c => c[0] === k) || ['', k])[1];
const EMOJIS_RECETTE = ['🍝', '🥗', '🍲', '🥘', '🍛', '🍕', '🌮', '🥧', '🍳', '🥞', '🍰', '🍜', '🐟', '🍗', '🥦', '🍚', '🥪', '🍮'];

/* Les rayons, et les mots qui y rangent un article tout seul */
const RAYONS = [['fruits', '🥕', 'Fruits & légumes'], ['frais', '🧀', 'Frais'], ['viandes', '🐟', 'Viandes & poissons'], ['epicerie', '🥫', 'Épicerie'],
  ['surgeles', '🧊', 'Surgelés'], ['boissons', '🧃', 'Boissons'], ['hygiene', '🧴', 'Hygiène & entretien'], ['autre', '🧺', 'Autres']];
const rayon = k => RAYONS.find(r => r[0] === k) || RAYONS[RAYONS.length - 1];
const MOTS_RAYONS = {
  fruits: 'pomme,poire,banane,orange,citron,fraise,framboise,myrtille,cerise,abricot,peche,nectarine,prune,raisin,kiwi,melon,pasteque,mangue,ananas,clementine,mandarine,pamplemousse,fruit,fruits de saison,legume,tomate,carotte,salade,laitue,roquette,mache,courgette,aubergine,poivron,concombre,oignon,echalote,ail,pomme de terre,patate,poireau,champignon,avocat,epinard,brocoli,chou,chou-fleur,haricot vert,petits pois frais,radis,betterave,celeri,fenouil,navet,potiron,courge,butternut,patate douce,gingembre,persil,basilic,menthe,coriandre,ciboulette,thym,romarin,herbes,endive,artichaut,asperge,mais doux',
  frais: 'lait,yaourt,yogourt,fromage,fromage blanc,beurre,creme,creme fraiche,oeuf,oeufs,jambon,lardon,lardons,emmental,mozzarella,parmesan,feta,chevre,comte,gruyere,raclette,camembert,skyr,petit suisse,dessert lacte,pate feuilletee,pate brisee,pate a pizza,tofu,houmous,blanc de poulet,knacki,creme dessert,gnocchi frais,pates fraiches',
  viandes: 'poulet,boeuf,porc,veau,agneau,dinde,viande,steak,steak hache,viande hachee,hache,saumon,thon frais,poisson,cabillaud,colin,lieu,truite,sardine,crevette,crevettes,moule,moules,saucisse,saucisses,merguez,chipolata,escalope,cuisse,roti,magret,canard,lapin,filet mignon,cote de porc,jambon cru,chorizo,bacon',
  epicerie: 'pain,baguette,pain de mie,brioche,biscotte,pates,spaghetti,tagliatelle,coquillettes,riz,farine,sucre,sel,poivre,huile,huile d olive,vinaigre,cafe,the,tisane,chocolat,cacao,biscuit,biscuits,cereales,muesli,flocons d avoine,confiture,miel,pate a tartiner,conserve,thon,sauce,sauce tomate,coulis,tomates concassees,concentre de tomate,moutarde,ketchup,mayonnaise,epice,epices,curry,cumin,paprika,lentilles,pois chiches,haricots rouges,semoule,quinoa,boulgour,levure,bouillon,cube,noix,amandes,noisettes,raisins secs,compote,puree,chips,olive,olives,lait de coco,cornichons,croutons,chapelure,maizena,sucre vanille,vanille,gateau,petit dejeuner,pain d epices,crackers,soupe',
  surgeles: 'surgele,surgeles,glace,glaces,sorbet,frites,poelee,congele,pizza surgelee,legumes surgeles,poisson pane,esquimau',
  boissons: 'eau,eau gazeuse,jus,jus d orange,soda,cola,limonade,sirop,vin,vin rouge,vin blanc,biere,cidre,champagne,prosecco,boisson,the glace,lait vegetal,lait d amande,lait d avoine,kombucha',
  hygiene: 'lessive,adoucissant,papier toilette,essuie-tout,sopalin,mouchoirs,dentifrice,brosse a dents,savon,gel douche,shampoing,shampooing,apres-shampoing,deodorant,eponge,eponges,liquide vaisselle,tablettes lave-vaisselle,pastilles lave-vaisselle,javel,nettoyant,produit menager,sacs poubelle,sac poubelle,coton,cotons,couches,lingettes,rasoir,serviettes hygieniques,tampons,creme solaire,creme hydratante,film alimentaire,papier aluminium,papier cuisson,piles,ampoule'
};
const INDEX_RAYONS = (() => {
  const t = [];
  Object.keys(MOTS_RAYONS).forEach(r => MOTS_RAYONS[r].split(',').forEach(m => { m = m.trim(); if (m) t.push([m, r]); }));
  return t.sort((a, b) => b[0].length - a[0].length)
    .map(([m, r]) => [new RegExp('(^|[^a-z])' + m.split(' ').map(w => w.split('-').join('[- ]?')).join('[ \'’-]+') + '(s|x)?([^a-z]|$)'), r]);
})();
function deviner(nom) {
  const n = sansAccent(nom).replace(/['’]/g, ' ');
  for (const [re, r] of INDEX_RAYONS) if (re.test(n)) return r;
  return 'autre';
}

/* Les cadeaux */
const STATUTS = [['idee', '💡', 'Idée'], ['acheter', '🛒', 'À acheter'], ['achete', '🛍️', 'Acheté'], ['emballe', '🎀', 'Emballé'], ['offert', '🎁', 'Offert']];
const statut = k => STATUTS.find(s => s[0] === k) || STATUTS[0];
const rangStatut = k => Math.max(0, STATUTS.findIndex(s => s[0] === k));
const TYPES_OCCASION = [['anniversaire', '🎂', 'Anniversaire'], ['noel', '🎄', 'Noël'], ['fete', '🎉', 'Fête'], ['naissance', '👶', 'Naissance'],
  ['mariage', '💍', 'Mariage'], ['cremaillere', '🏡', 'Crémaillère'], ['merci', '💐', 'Remerciement'], ['autre', '✨', 'Autre']];
const typeOcc = k => TYPES_OCCASION.find(t => t[0] === k) || TYPES_OCCASION[TYPES_OCCASION.length - 1];
const CATS_CADEAU = [['', '—'], ['experience', '🎟️ Expérience'], ['livre', '📚 Livre'], ['mode', '👗 Mode & accessoires'], ['beaute', '🌸 Beauté & bien-être'],
  ['maison', '🏡 Maison & déco'], ['tech', '🎧 High-tech'], ['jeu', '🧸 Jeux & jouets'], ['gourmand', '🍫 Gourmand'], ['fait-main', '🧶 Fait main'], ['autre', '✨ Autre']];
const catCadeau = k => (CATS_CADEAU.find(c => c[0] === k) || ['', ''])[1];
const RAPPELS_OCC = [[30, 'Un mois avant'], [14, 'Deux semaines avant'], [7, 'Une semaine avant'], [3, 'Trois jours avant'], [1, 'La veille']];
const LIENS = ['Conjoint·e', 'Enfant', 'Parent', 'Frère / sœur', 'Grand-parent', 'Ami·e', 'Collègue', 'Famille', 'Voisin·e', 'Autre'];
const EMOJIS_PERSONNE = ['🌸', '🌻', '🌙', '⭐', '🦋', '🐻', '🦊', '🐱', '🌈', '🍀', '🎈', '💜', '🧁', '⚽', '🎸', '📚'];

/* ============================================================
   L'ÉTAT
   ============================================================ */
const CLE = 'naodaily.donnees';
const vierge = () => ({
  version: 1, listes: [], recettes: [], repas: [], courses: [], habituels: [], aConsommer: [],
  personnes: [], occasions: [], cadeaux: [], envies: [], rappels: [], ideesRepas: [], budgetCadeaux: { mois: 0, annee: 0 }, masques: [], allergies: { personnes: [], remplacer: true }
});
function normaliser(d) {
  const s = Object.assign(vierge(), d || {});
  ['listes', 'recettes', 'repas', 'courses', 'habituels', 'aConsommer', 'personnes', 'occasions', 'cadeaux', 'envies', 'rappels', 'ideesRepas', 'masques'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  s.listes.forEach(l => { if (!Array.isArray(l.elements)) l.elements = []; });
  s.recettes.forEach(r => { if (!Array.isArray(r.ingredients)) r.ingredients = []; if (!Array.isArray(r.categories)) r.categories = []; });
  s.occasions.forEach(o => { if (!Array.isArray(o.rappels)) o.rappels = []; });
  if (!s.budgetCadeaux || typeof s.budgetCadeaux !== 'object') s.budgetCadeaux = { mois: 0, annee: 0 };
  if (!s.allergies || typeof s.allergies !== 'object') s.allergies = { personnes: [], remplacer: true };
  if (!Array.isArray(s.allergies.personnes)) s.allergies.personnes = [];
  s.allergies.personnes.forEach(p => { if (!p.allergenes || typeof p.allergenes !== 'object') p.allergenes = {}; if (!Array.isArray(p.eviter)) p.eviter = []; });
  return s;
}
function charger() {
  try { const d = JSON.parse(localStorage.getItem(CLE) || 'null'); if (d && typeof d === 'object') return normaliser(d); } catch (e) {}
  return vierge();
}
let S = charger();
let dejaPrevenu = false;
function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(S)); return true; }
  catch (e) {
    const plein = /quota/i.test(e.name + e.message);
    if (!plein && dejaPrevenu) return false;
    dejaPrevenu = true;
    toast(plein ? 'La mémoire du navigateur est pleine : retirez quelques photos de cadeaux, puis réessayez.'
                : 'Ce navigateur refuse d’enregistrer : pensez à 💾 sauvegarder votre quotidien dans un fichier.', { alerte: true, duree: 7000 });
    return false;
  }
}
let annulation = null;
function instantane() { annulation = JSON.stringify(S); }
function annuler() { if (!annulation) return; S = normaliser(JSON.parse(annulation)); annulation = null; sauver(); rendre(); }
const trouver = (liste, id) => (liste || []).find(x => x.id === id);
const retirer = (liste, id) => { const i = liste.findIndex(x => x.id === id); if (i >= 0) liste.splice(i, 1); };

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
  if (o.action) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = o.action[0];
    b.addEventListener('click', () => { o.action[1](); t.remove(); });
    t.appendChild(b);
  }
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 420); }, o.duree || (o.annuler || o.action ? 6500 : 3000));
}
/* un petit éclat quand on coche */
function eclat(x, y) {
  if (document.documentElement.classList.contains('calme')) return;
  ['✦', '✧', '·', '✦', '✧'].forEach((c, i) => {
    const s = document.createElement('span'); s.className = 'eclat'; s.textContent = c;
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = i % 2 ? 'var(--accent)' : 'var(--or)';
    s.style.setProperty('--x', Math.cos(a) * 34 + 'px'); s.style.setProperty('--y', Math.sin(a) * 34 + 'px');
    document.body.appendChild(s); setTimeout(() => s.remove(), 950);
  });
}

/* ============================================================
   La fenêtre-formulaire : un seul constructeur pour tout l'outil.
   champs : { k, l, t, o, ph, req, large, aide, si(vals) }
   types : text, number, date, url, textarea, select, case,
           puces (liste libre), cases (choix multiples), emoji
   ============================================================ */
let fermetureModale = null;
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
function fermerModale() {
  $('#modale').classList.remove('ouvert');
  document.body.style.overflow = '';
  $('#modaleFen').innerHTML = '';
  if (fermetureModale) { const f = fermetureModale; fermetureModale = null; f(); }
}

function formulaire(o) {
  const vals = Object.assign({}, o.valeurs || {});
  const puces = {};
  const champHTML = c => {
    const id = 'f_' + c.k, v = vals[c.k];
    const lab = esc(c.l);
    const cls = 'champ' + (c.large || c.t === 'textarea' || c.t === 'puces' || c.t === 'cases' || c.t === 'emoji' || c.t === 'html' ? ' large' : '');
    let inner = '';
    if (c.t === 'select') inner = `<select id="${id}" name="${c.k}">${c.o.map(([val, txt]) => `<option value="${esc(val)}"${String(v ?? '') === String(val) ? ' selected' : ''}>${esc(txt)}</option>`).join('')}</select>`;
    else if (c.t === 'textarea') inner = `<textarea id="${id}" name="${c.k}" placeholder="${esc(c.ph || '')}">${esc(v || '')}</textarea>`;
    else if (c.t === 'case') return `<label class="champ case large" data-champ="${c.k}"><input type="checkbox" id="${id}" name="${c.k}"${v ? ' checked' : ''}> ${lab}</label>`;
    else if (c.t === 'html') return `<div class="${cls}" data-champ="${c.k}">${c.l ? `<span class="lab">${lab}</span>` : ''}${c.html}</div>`;
    else if (c.t === 'emoji') inner = `<input type="hidden" name="${c.k}" value="${esc(v || c.o[0])}"><div class="choix-emoji">${c.o.map(e => `<button type="button" data-emoji="${e}" class="${(v || c.o[0]) === e ? 'on' : ''}">${e}</button>`).join('')}</div>`;
    else if (c.t === 'puces') { puces[c.k] = (v || []).slice(); inner = `<div class="puces" data-puces="${c.k}"></div>${c.liste ? `<datalist id="dl_${c.k}">${c.liste.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`; }
    else if (c.t === 'cases') inner = `<div class="cases">${c.o.map(([val, txt]) => `<label><input type="checkbox" name="${c.k}" value="${esc(val)}"${(v || []).map(String).includes(String(val)) ? ' checked' : ''}> ${esc(txt)}</label>`).join('')}</div>`;
    else inner = `<input id="${id}" name="${c.k}" type="${c.t || 'text'}" value="${esc(v ?? '')}" placeholder="${esc(c.ph || '')}"${c.t === 'number' ? ' step="any" inputmode="decimal" min="0"' : ''}${c.liste ? ` list="dl_${c.k}"` : ''}>${c.liste ? `<datalist id="dl_${c.k}">${c.liste.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`;
    return `<div class="${cls}" data-champ="${c.k}"><label for="${id}">${lab}</label>${inner}${c.aide ? `<div class="aide">${esc(c.aide)}</div>` : ''}</div>`;
  };
  const html = `<form id="formModale" novalidate>
    <h3 id="modaleTitre">${o.emoji ? `<span>${o.emoji}</span>` : ''}${esc(o.titre)}</h3>
    ${o.sous ? `<p class="sous">${esc(o.sous)}</p>` : '<div style="height:12px"></div>'}
    <div class="champs">${o.champs.map(champHTML).join('')}</div>
    <div class="pied-fen">
      ${o.supprimer ? '<button type="button" class="btn fin danger" data-f="suppr">🗑 Supprimer</button>' : ''}
      ${(o.extra || []).map((x, i) => `<button type="button" class="btn fin" data-extra="${i}">${esc(x[0])}</button>`).join('')}
      <div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="submit" class="btn plein">${esc(o.bouton || 'Enregistrer')}</button></div>
    </div></form>`;
  ouvrirModale(html, fen => {
    const form = fen.querySelector('form');
    const lireVals = () => {
      o.champs.forEach(c => {
        if (c.t === 'html') return;
        if (c.t === 'puces') { vals[c.k] = puces[c.k].slice(); return; }
        if (c.t === 'cases') { vals[c.k] = $$(`input[name="${c.k}"]:checked`, form).map(i => i.value); return; }
        const el = form.elements[c.k]; if (!el) return;
        vals[c.k] = c.t === 'case' ? el.checked : c.t === 'number' ? (el.value === '' ? '' : nombre(el.value)) : el.value.trim();
      });
      return vals;
    };
    const rafraichir = () => {
      lireVals();
      o.champs.forEach(c => { const bloc = form.querySelector(`[data-champ="${c.k}"]`); if (bloc && c.si) bloc.hidden = !c.si(vals); });
      if (o.change) o.change(vals, form);
    };
    const dessinerPuces = k => {
      const c = o.champs.find(x => x.k === k), boite = form.querySelector(`[data-puces="${k}"]`);
      boite.innerHTML = puces[k].map((x, i) => `<span class="p">${esc(x)}<button type="button" data-retire="${i}" aria-label="Retirer">✕</button></span>`).join('')
        + `<input type="text" placeholder="${esc(c.ph || 'Ajouter puis Entrée…')}" ${c.liste ? `list="dl_${k}"` : ''} autocomplete="off">`;
      const inp = boite.querySelector('input');
      const ajoute = () => {
        const brut = inp.value.trim(); if (!brut) return;
        brut.split(/[,;]/).map(s => s.trim()).filter(Boolean).forEach(s => { if (!puces[k].includes(s)) puces[k].push(s); });
        dessinerPuces(k); boite.querySelector('input').focus(); rafraichir();
      };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); ajoute(); } else if (e.key === 'Backspace' && !inp.value && puces[k].length) { puces[k].pop(); dessinerPuces(k); boite.querySelector('input').focus(); } });
      inp.addEventListener('blur', () => { if (inp.value.trim()) ajoute(); });
      boite.querySelectorAll('[data-retire]').forEach(b => b.addEventListener('click', () => { puces[k].splice(+b.dataset.retire, 1); dessinerPuces(k); rafraichir(); }));
    };
    Object.keys(puces).forEach(dessinerPuces);
    $$('.choix-emoji', form).forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('[data-emoji]'); if (!b) return;
      $$('button', g).forEach(x => x.classList.toggle('on', x === b));
      g.previousElementSibling.value = b.dataset.emoji;
    }));
    form.addEventListener('input', rafraichir);
    form.addEventListener('change', rafraichir);
    if (o.apres) o.apres(form, vals);
    rafraichir();
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    const sup = fen.querySelector('[data-f="suppr"]');
    if (sup) sup.addEventListener('click', () => { fermerModale(); o.supprimer(); });
    $$('[data-extra]', fen).forEach(b => b.addEventListener('click', () => { lireVals(); const r = o.extra[+b.dataset.extra][1](vals); if (r !== false) fermerModale(); }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      $$('.puces input', form).forEach(i => { if (i.value.trim()) i.dispatchEvent(new Event('blur')); });
      lireVals();
      const manque = o.champs.find(c => c.req && (c.si ? c.si(vals) : true) && (vals[c.k] === '' || vals[c.k] == null || (Array.isArray(vals[c.k]) && !vals[c.k].length)));
      if (manque) { toast(`« ${manque.l} » est à remplir.`, { alerte: true }); const el = form.elements[manque.k]; if (el && el.focus) el.focus(); return; }
      if (o.verifier) { const err = o.verifier(vals, form); if (err) { toast(err, { alerte: true }); return; } }
      if (o.enregistrer(vals, form) !== false) fermerModale();
    });
  }, o.large);
}

function confirmer(texte, detail, bouton = 'Supprimer') {
  return new Promise(res => {
    ouvrirModale(`<h3 id="modaleTitre">🌙 ${esc(texte)}</h3><p class="sous">${esc(detail || '')}</p>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-r="0">Annuler</button><button type="button" class="btn plein" data-r="1">${esc(bouton)}</button></div></div>`,
      fen => $$('[data-r]', fen).forEach(b => b.addEventListener('click', () => { fermetureModale = null; fermerModale(); res(b.dataset.r === '1'); })));
    fermetureModale = () => res(false);
  });
}

/* ---------- photos : réduites avant d'être rangées ---------- */
function reduirePhoto(fichier, max = 720, qualite = .72) {
  return new Promise((res, rej) => {
    const lecteur = new FileReader();
    lecteur.onerror = rej;
    lecteur.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', qualite));
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  });
}
function telecharger(nom, contenu, type) {
  const blob = new Blob([contenu], { type: type || 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function copierTexte(t) {
  const ok = () => toast('Copié : il ne reste qu’à le coller dans un message 💌');
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, () => secours());
  else secours();
  function secours() {
    const z = document.createElement('textarea'); z.value = t; z.style.position = 'fixed'; z.style.opacity = '0';
    document.body.appendChild(z); z.select();
    try { document.execCommand('copy'); ok(); } catch (e) { toast('La copie a été refusée par le navigateur.', { alerte: true }); }
    z.remove();
  }
}

/* ============================================================
   LES CALCULS PARTAGÉS PAR LES ESPACES
   ============================================================ */
/* listes */
const listesActives = () => S.listes.filter(l => !l.archivee);
const avancement = l => { const n = l.elements.length, f = l.elements.filter(e => e.fait).length; return { n, f, pct: n ? Math.round(f / n * 100) : 0 }; };
function listeAAcheter() {
  let l = S.listes.find(x => x.systeme === 'aacheter');
  if (!l) { l = { id: uid(), nom: 'À acheter', emoji: '🛍️', modele: 'achats', systeme: 'aacheter', favori: false, archivee: false, partage: '', creeLe: auj(), elements: [] }; S.listes.unshift(l); }
  if (l.archivee) l.archivee = false;
  return l;
}

/* anniversaires et occasions : la prochaine date d'un jour-mois */
function prochaineDate(iso, depuis) {
  if (!iso) return '';
  const a = depuis || auj(), m = iso.slice(5, 7), j = iso.slice(8, 10);
  let y = +a.slice(0, 4);
  let d = `${y}-${m}-${j}`;
  if (m === '02' && j === '29' && !(y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0))) d = `${y}-02-28`;
  if (d < a) { y++; d = `${y}-${m}-${j}`; if (m === '02' && j === '29' && !(y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0))) d = `${y}-02-28`; }
  return d;
}
function ageA(naissance, date) {
  if (!naissance || !/^\d{4}/.test(naissance) || naissance.startsWith('1900')) return null;
  return +date.slice(0, 4) - +naissance.slice(0, 4);
}
/* toutes les occasions à venir : les anniversaires des fiches, les fêtes du calendrier, et celles saisies */
function occasionsAVenir(jours = 400) {
  const a = auj(), fin = ajouteJours(a, jours), r = [];
  S.personnes.forEach(p => {
    if (!p.anniversaire) return;
    const d = prochaineDate(p.anniversaire);
    if (d <= fin) {
      const age = p.anneeConnue ? ageA(p.anniversaire, d) : null;
      r.push({ cle: 'anniv-' + p.id, auto: true, type: 'anniversaire', titre: `Anniversaire de ${p.prenom}` + (age ? ` · ${age} ans` : ''), date: d, personneId: p.id, rappels: p.rappels || [7, 1] });
    }
  });
  const y = +a.slice(0, 4);
  [[`${y}-12-25`, 'noel', 'Noël'], [`${y + 1}-12-25`, 'noel', 'Noël'], [`${y}-02-14`, 'fete', 'Saint-Valentin'], [`${y + 1}-02-14`, 'fete', 'Saint-Valentin']].forEach(([d, t, n]) => {
    if (d >= a && d <= fin && !S.masques.includes('fixe-' + t + d.slice(0, 4))) r.push({ cle: 'fixe-' + t + d.slice(0, 4), auto: true, fixe: true, type: t, titre: n, date: d, rappels: t === 'noel' ? [30, 14] : [7] });
  });
  S.occasions.forEach(o => {
    const d = o.annuelle ? prochaineDate(o.date) : o.date;
    if (d && d >= a && d <= fin) r.push(Object.assign({}, o, { cle: o.id, date: d }));
  });
  return r.sort((x, y2) => x.date.localeCompare(y2.date));
}
/* les rappels d'occasion qui tombent aujourd'hui (ou sont passés, jusqu'à la date) */
function rappelsOccasions() {
  const a = auj(), r = [];
  occasionsAVenir(40).forEach(o => {
    const n = joursEntre(a, o.date);
    const seuils = (o.rappels || []).map(Number).filter(x => x >= n).sort((x, y) => x - y);
    if (seuils.length) r.push({ occ: o, n });
  });
  return r;
}
const nomPersonne = id => (trouver(S.personnes, id) || {}).prenom || '';

/* courses */
const coursesRestantes = () => S.courses.filter(c => !c.fait);
function ajouterCourse(nom, o = {}) {
  nom = String(nom || '').trim(); if (!nom) return null;
  const cle = sansAccent(nom);
  const deja = S.courses.find(c => !c.fait && sansAccent(c.nom) === cle && (c.unite || '') === (o.unite || ''));
  if (deja) {
    if (o.qte && deja.qte !== '' && deja.qte != null) deja.qte = Math.round((nombre(deja.qte) + nombre(o.qte)) * 100) / 100;
    else if (o.qte && (deja.qte === '' || deja.qte == null)) deja.qte = o.qte;
    if (o.prix && !deja.prix) deja.prix = o.prix;
    return deja;
  }
  const hab = S.habituels.find(h => sansAccent(h.nom) === cle);
  const c = { id: uid(), nom, qte: o.qte ?? '', unite: o.unite || '', rayon: o.rayon || (hab && hab.rayon) || deviner(nom), fait: false,
    prix: o.prix || (hab && hab.prix) || '', origine: o.origine || 'manuel', note: o.note || '', ajouteLe: auj() };
  S.courses.push(c);
  return c;
}
const qteTexte = c => (c.qte !== '' && c.qte != null ? joli(nombre(c.qte)) + (c.unite ? ' ' + c.unite : '') : (c.unite || ''));
const estimationCourses = () => {
  const r = coursesRestantes();
  const connus = r.filter(c => nombre(c.prix) > 0);
  return { total: somme(connus, c => nombre(c.prix)), connus: connus.length, n: r.length };
};

/* repas et recettes */
const repasDu = jour => S.repas.filter(r => r.date === jour).sort((a, b) => MOMENTS.findIndex(m => m[0] === a.moment) - MOMENTS.findIndex(m => m[0] === b.moment));
const nomRepas = r => { const rec = trouver(S.recettes, r.recetteId); return rec ? rec.nom : (r.titre || 'Repas'); };
const emojiRepas = r => { const rec = trouver(S.recettes, r.recetteId); return rec ? (rec.emoji || '🍽️') : moment(r.moment)[1]; };
/* les ingrédients d'un repas, ajustés au nombre de personnes */
function ingredientsRepas(r) {
  const rec = trouver(S.recettes, r.recetteId); if (!rec) return [];
  const k = rec.personnes && r.personnes ? r.personnes / rec.personnes : 1;
  return rec.ingredients.filter(i => i.nom).map(i => ({ nom: i.nom, qte: i.qte === '' || i.qte == null ? '' : Math.round(nombre(i.qte) * k * 100) / 100, unite: i.unite || '', rayon: i.rayon || deviner(i.nom), prix: i.prix ? Math.round(nombre(i.prix) * k * 100) / 100 : '' }));
}
function ajouterIngredients(repasListe) {
  let n = 0;
  repasListe.forEach(r => ingredientsRepas(r).forEach(i => {
    const a = typeof adapterPourCourses === 'function' ? adapterPourCourses(i) : i;   /* allergies : remplacé si besoin */
    if (ajouterCourse(a.nom, Object.assign({ origine: 'recette' }, a))) n++;
  }));
  return n;
}
