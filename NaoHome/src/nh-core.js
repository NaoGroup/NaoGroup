'use strict';
/* ============================================================
   NaoHome — le cœur : dates, données, repères, thème, fond, fenêtres
   ============================================================ */
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const JOURS_C = ['dim','lun','mar','mer','jeu','ven','sam'];
const pad = n => String(n).padStart(2, '0');
const cle = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lire = k => { if (!k) return null; const [y, m, d] = String(k).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const minuit = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const ecart = (a, b) => Math.round((minuit(b) - minuit(a)) / 864e5);
const auj = () => minuit(new Date());
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const er = n => n === 1 ? '1er' : String(n);
const dateLongue = d => d ? `${JOURS[d.getDay()]} ${er(d.getDate())} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const dateCourte = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]}` : '';
const dateMoy = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const dateNum = d => d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const nombre = v => { const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, '')); return isFinite(n) ? n : NaN; };
const nbFr = (n, d = 1) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });
const pluriel = (n, un, plus_) => `${n} ${n > 1 ? (plus_ || un + 's') : un}`;
const dansJours = n => n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : n === -1 ? 'hier' : n > 0 ? `dans ${n} jours` : `il y a ${-n} jours`;
const cleMois = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const telLien = t => t ? `<a href="tel:${esc(String(t).replace(/[^\d+]/g, ''))}">${esc(t)}</a>` : '';
const mailLien = m => m ? `<a href="mailto:${esc(m)}">${esc(m)}</a>` : '';

/* âge : « 3 ans », « 8 mois », « 2 semaines » */
function ageDe(naissance, date = auj()) {
  if (!naissance) return '';
  const n = lire(naissance), j = ecart(n, date);
  if (j < 0) return '';
  if (j < 60) return j < 14 ? pluriel(j, 'jour') : pluriel(Math.floor(j / 7), 'semaine');
  let m = (date.getFullYear() - n.getFullYear()) * 12 + date.getMonth() - n.getMonth();
  if (date.getDate() < n.getDate()) m--;
  if (m < 24) return `${m} mois`;
  return `${Math.floor(m / 12)} ans`;
}
function prochainAnniv(k, depuis = auj()) {
  if (!k) return null;
  const o = lire(k);
  let d = new Date(depuis.getFullYear(), o.getMonth(), o.getDate());
  if (d < depuis) d = new Date(depuis.getFullYear() + 1, o.getMonth(), o.getDate());
  const ans = d.getFullYear() - o.getFullYear();
  return ans > 0 ? { date: d, ans, dans: ecart(depuis, d) } : null;
}

/* ============================================================
   Les petits dessins au trait (24 × 24)
   ============================================================ */
const DESSINS = {
  maison: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.6V20h13V9.6"/><path d="M10 20v-5.2h4V20"/>',
  immeuble: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 7h2M13.5 7h2M8.5 10.5h2M13.5 10.5h2M8.5 14h2M13.5 14h2M10.5 20.5v-3h3v3"/>',
  balai: '<path d="M16 3.5 10.6 12"/><path d="M8.4 10.8l5 3.1-2.4 6.6c-2.5-.5-5.6-2.5-6.7-4.4z"/><path d="M7.6 17.6l1.9-2.1M10.2 19.4l1.3-2.5"/>',
  goutte: '<path d="M12 3.5s6 6.6 6 10.6a6 6 0 0 1-12 0c0-4 6-10.6 6-10.6z"/><path d="M9.2 14.6a2.9 2.9 0 0 0 2.6 2.7"/>',
  vague: '<path d="M3 9.5c1.5 0 1.5-1.3 3-1.3s1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3M3 14.5c1.5 0 1.5-1.3 3-1.3s1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3 1.5-1.3 3-1.3 1.5 1.3 3 1.3"/><path d="M6 19h12"/>',
  medaille: '<path d="M8 3.5l2.6 5.2M16 3.5l-2.6 5.2"/><circle cx="12" cy="14.6" r="5.4"/><path d="M12 12.2v4.8M10.7 13.2 12 12.2"/>',
  cle: '<circle cx="8" cy="15.5" r="4"/><path d="M11 12.6 19.5 4M16.6 6.9l2.1 2.1M14.6 8.9l1.6 1.6"/>',
  coeur: '<path d="M12 20s-7.2-4.5-7.2-10.1A4 4 0 0 1 12 7.4a4 4 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z"/>',
  famille: '<circle cx="8.5" cy="7.4" r="2.6"/><circle cx="16.2" cy="9.2" r="2.1"/><path d="M3.8 19.6c0-3 2.1-5.5 4.7-5.5s4.7 2.5 4.7 5.5M12.8 19.6c.3-2.4 1.7-4.2 3.4-4.2 1.9 0 3.3 2 3.3 4.2"/>',
  livret: '<path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11.5M9 8.5h6M9 11.5h4"/>',
  telephone: '<path d="M6.6 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
  ballon: '<circle cx="12" cy="12" r="8"/><path d="M12 4c2.5 2.3 3.5 5 3.5 8s-1 5.7-3.5 8M12 4C9.5 6.3 8.5 9 8.5 12s1 5.7 3.5 8M4 12h16"/>',
  soleil: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  plante: '<path d="M12 20v-8"/><path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6zM12 14c0-2.8-2-4.8-4.8-4.8 0 2.8 2 4.8 4.8 4.8z"/><path d="M8 20h8"/>',
  ecole: '<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 11.6V16c1.4 1.3 3 2 5 2s3.6-.7 5-2v-4.4M21 9.5v5"/>',
  bouclier: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  seau: '<path d="M5 8.5h14l-1.6 11a1.6 1.6 0 0 1-1.6 1.4H8.2a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M6.5 8.5C7 5.4 9.2 3.5 12 3.5s5 1.9 5.5 5"/>',
  patte: '<ellipse cx="12" cy="15.6" rx="4.3" ry="3.5" fill="currentColor" stroke="none"/><circle cx="6.3" cy="10.4" r="1.9" fill="currentColor" stroke="none"/><circle cx="9.7" cy="6.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="14.3" cy="6.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="17.7" cy="10.4" r="1.9" fill="currentColor" stroke="none"/>',
};
const svgDessin = (k, sw = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DESSINS[k] || DESSINS.maison}</svg>`;

/* ============================================================
   Données
   ============================================================ */
const CLE_STOCK = 'naohome.v1';
const CLE_PARTAGE = 'naohome.foyer';   /* ce que NaoHome prépare pour NaoSanté : les membres qui l'ont accepté */
const CLE_ANIMAUX = 'naohome.animaux'; /* ce que NaoHome prépare pour NaoPets : les animaux rattachés */
let S = null;
function vierge() {
  return {
    v: 1, cree: new Date().toISOString(), exemple: false,
    logement: { type: '', piscine: false, nom: '', adresse: '', volume: '', joursMesure: [3, 6] },
    membres: [], confiance: [], sports: [], copains: [], annuaire: [],
    pieces: [], taches: [], faits: {},
    piscine: { mesures: [], entretien: [], fait: {} },
  };
}
function charger() {
  try { const t = localStorage.getItem(CLE_STOCK); if (t) S = JSON.parse(t); } catch (e) { S = null; }
  if (!S || typeof S !== 'object' || !Array.isArray(S.membres)) S = vierge();
  completer(S);
}
function completer(s) {
  const v = vierge();
  for (const k of Object.keys(v)) if (s[k] === undefined || s[k] === null) s[k] = v[k];
  s.logement = Object.assign(v.logement, s.logement || {});
  if (!Array.isArray(s.logement.joursMesure) || !s.logement.joursMesure.length) s.logement.joursMesure = [3, 6];
  s.piscine = Object.assign(v.piscine, s.piscine || {});
  for (const k of ['mesures', 'entretien']) if (!Array.isArray(s.piscine[k])) s.piscine[k] = [];
  if (!s.piscine.fait || typeof s.piscine.fait !== 'object') s.piscine.fait = {};
  if (!s.piscine.entretien.length) s.piscine.entretien = entretienDefaut();
  for (const k of ['membres', 'confiance', 'sports', 'copains', 'annuaire', 'pieces', 'taches']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.faits || typeof s.faits !== 'object') s.faits = {};
  return s;
}
function enregistrer() {
  try {
    localStorage.setItem(CLE_STOCK, JSON.stringify(S));
    partagerFoyer();
    partagerAnimaux();
    return true;
  } catch (e) {
    toast('💾', 'Enregistrement impossible', "L'espace du navigateur est plein (les photos prennent de la place). Sauvegardez dans un fichier, puis retirez quelques photos.");
    return false;
  }
}
/* Les membres rattachés à NaoSanté : identité, n° de sécurité sociale et sports, rangés à part pour que
   NaoSanté puisse les reprendre sans qu'on ait à tout retaper.
   Les autres personnes du foyer n'envoient que leur prénom et leurs sports, pour que
   l'onglet Activité de NaoSanté répertorie toutes les activités sportives du carnet. Rien d'autre ne sort. */
function partagerFoyer() {
  try {
    const sportsDe = x => S.sports.filter(s => s.membre === x.id).map(s => ({ sport: s.sport, club: s.club, debut: s.debut, fin: s.fin, enCours: !s.fin, competition: !!s.compet, niveau: s.niveau }));
    const m = S.membres.filter(x => (x.sante || x.moi) && x.genre !== 'animal');
    const autres = S.membres.filter(x => !x.sante && !x.moi && x.genre !== 'animal' && S.sports.some(s => s.membre === x.id));
    if (!m.length && !autres.length) { localStorage.removeItem(CLE_PARTAGE); return; }
    localStorage.setItem(CLE_PARTAGE, JSON.stringify({
      source: 'naohome', maj: new Date().toISOString(),
      membres: m.map(x => ({ id: x.id, genre: x.genre, prenom: x.prenom, nom: x.nom, naissance: x.naissance, sexe: x.sexe || '', secu: x.secu || '', lien: x.lien, moi: !!x.moi, sports: sportsDe(x) })),
      sportsAutres: autres.map(x => ({ id: x.id, genre: x.genre, prenom: x.prenom, sports: sportsDe(x) })),
    }));
  } catch (e) {}
}
/* Les animaux rattachés à NaoPets : leur fiche d'identité (nom, espèce, race,
   naissance, puce, vétérinaire, photo), pour que NaoPets les accueille tout seul. */
function partagerAnimaux() {
  try {
    const a = S.membres.filter(x => x.genre === 'animal' && x.pets);
    if (!a.length) { localStorage.removeItem(CLE_ANIMAUX); return; }
    const paquet = photos => JSON.stringify({
      source: 'naohome', maj: new Date().toISOString(),
      animaux: a.map(x => ({ id: x.id, nom: x.prenom, espece: x.espece, race: x.race, naissance: x.naissance, puce: x.puce, veto: x.veto, photo: photos ? x.photo || '' : '' })),
    });
    /* les photos prennent de la place : si le navigateur est plein, on prépare la fiche sans elles */
    try { localStorage.setItem(CLE_ANIMAUX, paquet(true)); } catch (e) { localStorage.setItem(CLE_ANIMAUX, paquet(false)); }
  } catch (e) {}
}
const sauver = () => { enregistrer(); rendre(); };
const membre = id => S.membres.find(m => m.id === id);
const personnes = () => S.membres.filter(m => m.genre !== 'animal');
const adultes = () => S.membres.filter(m => m.genre === 'adulte');
const enfants = () => S.membres.filter(m => m.genre === 'enfant');
const animaux = () => S.membres.filter(m => m.genre === 'animal');
const nomComplet = m => m ? [m.prenom, m.nom].filter(Boolean).join(' ') : '';
const prenomDe = id => { const m = membre(id); return m ? (m.prenom || m.nom || '—') : ''; };
const aPiscine = () => !!S.logement.piscine;
const estAppart = () => S.logement.type === 'appartement';

/* ============================================================
   Les listes de choix
   ============================================================ */
const LIENS_ADULTE = ['Parent', 'Conjoint·e', 'Grand-parent', 'Beau-parent', 'Colocataire', 'Autre adulte'];
const LIENS_ENFANT = ['Fils', 'Fille', 'Enfant', 'Petit-enfant', 'Neveu / nièce', 'Autre enfant'];
const ESPECES = [['chien', '🐶 Chien'], ['chat', '🐱 Chat'], ['lapin', '🐰 Lapin'], ['rongeur', '🐹 Rongeur'], ['oiseau', '🐦 Oiseau'], ['poisson', '🐟 Poisson'], ['cheval', '🐴 Cheval'], ['reptile', '🐢 Reptile'], ['autre', '🐾 Autre']];
const emEspece = k => (ESPECES.find(e => e[0] === k) || ESPECES[ESPECES.length - 1])[1].split(' ')[0];
const T_ANNUAIRE = {
  scolaire: ['🎒', 'Assurance scolaire'], mutuelle: ['💊', 'Mutuelle santé'], secu: ['🩺', 'Sécurité sociale (CPAM)'],
  voiture: ['🚗', 'Assurance voiture'], maison: ['🏠', 'Assurance habitation'], accident: ['🛟', 'Garantie accidents de la vie'],
  prevoyance: ['🤝', 'Prévoyance / décès'], animaux: ['🐾', 'Assurance animaux'], banque: ['🏦', 'Banque'], autre: ['📇', 'Autre contact'],
};
const opts = T => Object.entries(T).map(([k, v]) => [k, `${v[0]} ${v[1]}`]);
/* le sport deviné d'après son nom, pour l'emoji */
const SPORTS_EM = [[/foot/i, '⚽'], [/basket/i, '🏀'], [/hand/i, '🤾'], [/volley/i, '🏐'], [/rugby/i, '🏉'], [/tennis de table|ping/i, '🏓'], [/tennis|padel/i, '🎾'],
  [/natation|nage|piscine|aqua/i, '🏊'], [/judo|karat|taekwon|lutte|boxe|ju-?jits|aïkido|aikido|mma|kung/i, '🥋'], [/danse|ballet|zumba/i, '💃'], [/gym|acrobat|trampo/i, '🤸'],
  [/v[ée]lo|cycl|vtt|bmx/i, '🚴'], [/course|running|athl|marathon|trail/i, '🏃'], [/ski|snow/i, '⛷️'], [/[ée]quitation|cheval|poney/i, '🏇'], [/escalade|grimpe/i, '🧗'],
  [/golf/i, '⛳'], [/escrime/i, '🤺'], [/badminton/i, '🏸'], [/yoga|pilates/i, '🧘'], [/muscu|fitness|crossfit/i, '🏋️'], [/hockey/i, '🏑'], [/patin|roller/i, '⛸️'],
  [/voile|surf|kayak|aviron|cano/i, '🏄'], [/tir|archer/i, '🏹'], [/[ée]checs/i, '♟️']];
const emSport = n => { for (const [r, e] of SPORTS_EM) if (r.test(n || '')) return e; return '🏅'; };

/* ============================================================
   Les pièces et leurs idées de tâches
   ============================================================ */
const T_PIECE = {
  entree: ['🚪', 'Entrée', ['Passer l’aspirateur', 'Ranger les chaussures', 'Vider la boîte aux lettres']],
  salon: ['🛋️', 'Salon', ['Passer l’aspirateur', 'Dépoussiérer les meubles', 'Ranger les coussins et plaids', 'Laver les vitres']],
  sam: ['🍽️', 'Salle à manger', ['Débarrasser la table', 'Essuyer la table', 'Passer la serpillière']],
  cuisine: ['🍳', 'Cuisine', ['Faire la vaisselle', 'Vider le lave-vaisselle', 'Nettoyer le plan de travail', 'Sortir les poubelles', 'Nettoyer le frigo', 'Détartrer la bouilloire']],
  chambre: ['🛏️', 'Chambre', ['Faire le lit', 'Changer les draps', 'Ranger les vêtements', 'Aérer la pièce']],
  enfant: ['🧸', 'Chambre d’enfant', ['Ranger les jouets', 'Faire le lit', 'Préparer le cartable', 'Changer les draps']],
  sdb: ['🛁', 'Salle de bain', ['Nettoyer le lavabo', 'Nettoyer la douche / baignoire', 'Changer les serviettes', 'Détartrer la robinetterie']],
  wc: ['🚽', 'Toilettes', ['Nettoyer la cuvette', 'Remettre du papier', 'Laver le sol']],
  bureau: ['💻', 'Bureau', ['Ranger les papiers', 'Dépoussiérer l’écran', 'Vider la corbeille']],
  buanderie: ['🧺', 'Buanderie', ['Lancer une machine', 'Étendre le linge', 'Repasser', 'Plier et ranger le linge']],
  garage: ['🚗', 'Garage', ['Balayer', 'Ranger les outils', 'Trier les cartons']],
  cave: ['📦', 'Cave / cellier', ['Ranger', 'Vérifier les stocks']],
  grenier: ['🧳', 'Grenier', ['Trier', 'Dépoussiérer']],
  jardin: ['🌳', 'Jardin', ['Tondre la pelouse', 'Arroser les plantes', 'Ramasser les feuilles', 'Tailler la haie']],
  terrasse: ['☀️', 'Terrasse / balcon', ['Balayer', 'Arroser les jardinières', 'Nettoyer le salon de jardin']],
  autre: ['✨', 'Autre pièce', ['Ranger', 'Nettoyer']],
};
const FREQ_MENAGE = [['jour', 'Chaque jour'], ['semaine', 'Chaque semaine'], ['mois', 'Chaque mois']];
const lundi = d => plus(d, -((d.getDay() + 6) % 7));
/* une tâche est « faite » pour la période en cours : le jour, la semaine ou le mois */
const periode = (freq, d = auj()) => freq === 'jour' ? cle(d) : freq === 'mois' ? cleMois(d) : 's' + cle(lundi(d));
const tacheFaite = t => S.faits[t.id] === periode(t.freq);
const texteFreq = f => ({ jour: 'chaque jour', semaine: 'chaque semaine', mois: 'chaque mois' }[f] || '');

/* ============================================================
   La piscine : les repères
   ============================================================ */
function entretienDefaut() {
  return [
    { id: 'feuilles', em: '🍂', texte: 'Retirer les feuilles mortes, débris et insectes', tous: 2, conseil: 'À l’épuisette, à la surface et au fond. Videz aussi les paniers des skimmers.' },
    { id: 'parois', em: '🧽', texte: 'Frotter les parois', tous: 7, conseil: 'Une brosse adaptée à votre revêtement (liner, carrelage, coque) : on évite que les algues s’installent.' },
    { id: 'ligne', em: '〰️', texte: 'Nettoyer la ligne d’eau', tous: 14, conseil: 'Une éponge et un produit prévu pour la ligne d’eau : c’est là que se dépose le gras (crème solaire, pollen).' },
    { id: 'tiers', em: '💧', texte: 'Renouveler 1/3 du volume d’eau', tous: 365, conseil: 'Une fois par an, de préférence au printemps : on vide un tiers et on remplit à nouveau, puis on refait les mesures.' },
  ];
}
/* pH : idéal entre 7,2 et 7,4 */
const PH = { min: 6.6, max: 8.0, a1: 6.8, a2: 7.2, a3: 7.4, a4: 7.8 };
/* chlore libre : idéal entre 1,5 et 2 mg/L */
const CHLORE = { min: 0, max: 4, a1: 1, a2: 1.5, a3: 2, a4: 3 };
function evaluer(val, g) {
  if (val === '' || val == null || !isFinite(nombre(val))) return null;
  const v = nombre(val);
  if (v >= g.a2 && v <= g.a3) return 'ok';
  if (v >= g.a1 && v <= g.a4) return 'att';
  return 'mal';
}
function avisPh(v) {
  const n = nombre(v), e = evaluer(v, PH);
  if (!e) return '';
  if (e === 'ok') return 'Parfait : l’eau est équilibrée, rien à faire.';
  if (n < PH.a2) return `pH trop ${e === 'mal' ? 'bas' : 'un peu bas'} : l’eau est acide (yeux qui piquent, matériel qui s’use). Remontez-le avec un produit « pH plus », en suivant la notice.`;
  return `pH trop ${e === 'mal' ? 'haut' : 'un peu haut'} : le chlore agit moins bien et l’eau peut se troubler. Baissez-le avec un produit « pH moins », en suivant la notice.`;
}
function avisChlore(v) {
  const n = nombre(v), e = evaluer(v, CHLORE);
  if (!e) return '';
  if (e === 'ok') return 'Parfait : l’eau est bien désinfectée.';
  if (n < CHLORE.a2) return `Chlore ${e === 'mal' ? 'trop faible' : 'un peu faible'} : l’eau risque de verdir. Rajoutez du chlore selon la notice${e === 'mal' ? ' (et vérifiez d’abord le pH : il doit être juste pour que le chlore agisse)' : ''}.`;
  return `Chlore ${e === 'mal' ? 'trop fort : attendez qu’il redescende avant de vous baigner' : 'un peu fort : pas de nouvel ajout pour l’instant'}.`;
}
const libelleEval = e => ({ ok: 'Idéal', att: 'À surveiller', mal: 'À corriger' }[e] || '—');
/* filtration : la température de l'eau divisée par deux = le nombre d'heures par jour */
function heuresFiltration(t) {
  const n = nombre(t);
  if (!isFinite(n)) return null;
  if (n < 12) return 0;
  return Math.min(24, Math.round(n / 2 * 2) / 2);
}
const mesuresTriees = () => [...S.piscine.mesures].sort((a, b) => (a.date + (a.heure || '')) < (b.date + (b.heure || '')) ? 1 : -1);
const derniereMesure = k => mesuresTriees().find(m => m[k] !== '' && m[k] != null && isFinite(nombre(m[k])));
/* la prochaine mesure prévue (jours choisis dans le logement, 2 fois par semaine) */
function prochaineMesure() {
  const j = S.logement.joursMesure.map(Number);
  const der = mesuresTriees()[0];
  for (let i = 0; i < 8; i++) {
    const d = plus(auj(), i);
    if (j.includes(d.getDay()) && (!der || der.date < cle(d))) return d;
  }
  return null;
}
function etatEntretien(t) {
  const der = S.piscine.fait[t.id];
  if (!der) return { jours: null, retard: true, reste: 0, part: 0 };
  const j = ecart(lire(der), auj()), tous = Math.max(1, Number(t.tous) || 7);
  return { jours: j, retard: j >= tous, reste: tous - j, part: Math.max(0, Math.min(1, 1 - j / tous)) };
}
const texteTous = n => { n = Number(n) || 1; return n === 1 ? 'tous les jours' : n === 7 ? 'chaque semaine' : n === 14 ? 'toutes les 2 semaines' : n === 30 ? 'chaque mois' : n === 365 ? 'une fois par an' : `tous les ${n} jours`; };

/* ============================================================
   Avatars et numéros masqués
   ============================================================ */
const initiales = m => ((m.prenom || '')[0] || '') + ((m.nom || '')[0] || '') || '?';
function avatar(m, taille = '') {
  if (!m) return `<span class="av ${taille}">${svgDessin('famille')}</span>`;
  const classe = m.genre === 'animal' ? 'animal' : m.genre === 'enfant' ? 'enfant' : m.confiance ? 'confiance' : '';
  if (m.photo) return `<span class="av ${taille} ${classe}" title="${esc(nomComplet(m))}"><img src="${m.photo}" alt=""></span>`;
  if (m.genre === 'animal') return `<span class="av ${taille} animal" title="${esc(m.prenom)}">${emEspece(m.espece)}</span>`;
  return `<span class="av init ${taille} ${classe}" title="${esc(nomComplet(m))}">${esc(initiales(m).toUpperCase())}</span>`;
}
/* un numéro sensible : on n'en montre que la fin, l'œil le dévoile un instant */
const DEVOILES = new Set();
function secret(valeur, id) {
  if (!valeur) return '—';
  const v = String(valeur);
  if (DEVOILES.has(id)) return `<span class="secret">${esc(v)}</span><button type="button" class="oeil" data-act="devoiler" data-id="${esc(id)}" title="Masquer">🙈</button>`;
  const fin = v.replace(/\s/g, '').slice(-3);
  return `<span class="secret">••• ${esc(fin)}</span><button type="button" class="oeil" data-act="devoiler" data-id="${esc(id)}" title="Afficher">👁️</button>`;
}

/* ============================================================
   Thème clair / sombre
   ============================================================ */
function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#pouce').textContent = t === 'light' ? '☀️' : '🌙';
  $('#b-theme').setAttribute('aria-checked', t === 'light');
  try { localStorage.setItem('naohome.theme', t); } catch (e) {}
}

/* ============================================================
   Le fond : un ciel étoilé, les motifs de la maison qui dérivent
   en se balançant, et des bulles de savon qui montent
   ============================================================ */
const MOTIFS = ['maison', 'balai', 'goutte', 'cle', 'coeur', 'plante', 'seau', 'ballon', 'livret', 'immeuble', 'vague', 'medaille', 'soleil', 'famille'];
function dessinerFond() {
  let h = '';
  for (let i = 0; i < 60; i++) {
    const t = Math.random() < .12 ? 2.6 : Math.random() * 1.6 + .6;
    h += `<b class="${t > 2 ? 'gros' : ''}" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;width:${t}px;height:${t}px;animation-duration:${(2.5 + Math.random() * 4).toFixed(1)}s;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></b>`;
  }
  $('#ciel').innerHTML = h;
  let m = '';
  const n = innerWidth < 700 ? 11 : 20;
  for (let i = 0; i < n; i++) {
    const k = MOTIFS[i % MOTIFS.length], taille = 26 + Math.random() * 26, dur = 30 + Math.random() * 32;
    m += `<svg viewBox="0 0 24 24" width="${taille.toFixed(0)}" height="${taille.toFixed(0)}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
      style="left:${(Math.random() * 96).toFixed(1)}%;top:${(8 + Math.random() * 86).toFixed(1)}%;--o:calc(var(--motif-o) * ${(0.6 + Math.random() * .6).toFixed(2)});--r0:${(-14 + Math.random() * 28).toFixed(0)}deg;--r1:${(-20 + Math.random() * 40).toFixed(0)}deg;--dx:${(-60 + Math.random() * 120).toFixed(0)}px;animation-duration:${dur.toFixed(0)}s;animation-delay:-${(Math.random() * dur).toFixed(0)}s"><g style="animation-delay:-${(Math.random() * 3).toFixed(1)}s">${DESSINS[k]}</g></svg>`;
  }
  $('#motifs').innerHTML = m;
  let b = '';
  const nb = innerWidth < 700 ? 7 : 13;
  for (let i = 0; i < nb; i++) {
    const t = 10 + Math.random() * 30, dur = 18 + Math.random() * 22;
    b += `<i style="left:${(Math.random() * 98).toFixed(1)}%;width:${t.toFixed(0)}px;height:${t.toFixed(0)}px;--dx:${(-50 + Math.random() * 100).toFixed(0)}px;animation-duration:${dur.toFixed(0)}s;animation-delay:-${(Math.random() * dur).toFixed(0)}s"></i>`;
  }
  $('#bulles').innerHTML = b;
}

/* ============================================================
   Toasts et fenêtres (qui s'ouvrent et se referment en douceur)
   ============================================================ */
function toast(em, titre, sous = '', ms = 5200) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="em">${em}</span><div><b>${esc(titre)}</b>${sous ? `<span>${esc(sous)}</span>` : ''}</div>`;
  $('#toasts').append(t);
  setTimeout(() => { t.classList.add('sort'); setTimeout(() => t.remove(), 260); }, ms);
}
function fenetre(html, classe = '') {
  const v = document.createElement('div');
  v.className = 'voile ' + classe;
  v.innerHTML = html;
  v._avant = document.activeElement;
  v.addEventListener('mousedown', e => { if (e.target === v) fermer(v); });
  document.body.append(v);
  const f = v.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=search]),textarea,select');
  if (f && matchMedia('(pointer:fine)').matches) setTimeout(() => f.focus(), 60);
  else setTimeout(() => { const b = v.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 60);
  return v;
}
function fermer(v, vite = false) {
  if (!v) v = [...document.querySelectorAll('.voile:not(.ferme)')].pop();
  if (!v || v.classList.contains('ferme')) return;
  const fin = () => { v.remove(); if (v._avant && v._avant.isConnected && v._avant.focus) v._avant.focus({ preventScroll: true }); };
  if (v._surFermer) { const f = v._surFermer; v._surFermer = null; f(); }
  if (vite || matchMedia('(prefers-reduced-motion: reduce)').matches) return fin();
  v.classList.add('ferme');
  setTimeout(fin, 230);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.querySelector('.voile:not(.ferme)')) { e.preventDefault(); fermer(); return; }
  /* Tab reste dans la fenêtre ouverte */
  if (e.key === 'Tab') {
    const v = [...document.querySelectorAll('.voile:not(.ferme)')].pop(); if (!v) return;
    const f = [...v.querySelectorAll('button,input:not([type=hidden]),select,textarea,a[href],[tabindex="0"]')].filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const p = f[0], d = f[f.length - 1];
    if (e.shiftKey && document.activeElement === p) { e.preventDefault(); d.focus(); }
    else if (!e.shiftKey && document.activeElement === d) { e.preventDefault(); p.focus(); }
    else if (!v.contains(document.activeElement)) { e.preventDefault(); p.focus(); }
  }
});
function confirmer(titre, texte, oui = 'Confirmer', danger = true) {
  return new Promise(res => {
    const v = fenetre(`<div class="fenetre etroite" role="alertdialog" aria-modal="true"><h2>${esc(titre)}</h2>
      <p class="chapo">${texte}</p><div class="pied"><div class="spacer"></div>
      <button class="btn" data-r="0">Annuler</button><button class="btn plein ${danger ? 'danger' : ''}" data-r="1">${esc(oui)}</button></div></div>`);
    v.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) { const r = b.dataset.r === '1'; v._surFermer = null; res(r); fermer(v); } });
    v._surFermer = () => res(false);
  });
}

/* ============================================================
   Photos : lues, réduites et compressées avant d'être gardées
   ============================================================ */
function choisirPhoto(max = 640, qualite = .8) {
  return new Promise(res => {
    const inp = $('#photo-in'); inp.value = '';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return res(null);
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          /* recadrée en carré, au centre : c'est un portrait de carnet */
          const c = document.createElement('canvas'), cote = Math.min(img.width, img.height), k = Math.min(1, max / cote);
          c.width = c.height = Math.round(cote * k);
          c.getContext('2d').drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', qualite));
        };
        img.onerror = () => { toast('🖼️', 'Image illisible', 'Essayez une photo au format JPG ou PNG.'); res(null); };
        img.src = r.result;
      };
      r.readAsDataURL(f);
    };
    inp.click();
  });
}

/* ============================================================
   Formulaires génériques
   champs : [{ k, lab, type, options, large, aide, min, max, step, place, req }]
   types  : text date number tel email textarea select choix jours multi case photo note sep html
   ============================================================ */
function champHTML(c, v) {
  const id = 'f-' + c.k;
  const val = v ?? c.def ?? '';
  const lab = c.lab ? `<label for="${id}">${esc(c.lab)}</label>` : '';
  const aide = c.aide ? `<div class="aide">${c.aide}</div>` : '';
  const cls = `champ${c.large ? ' large' : ''}`;
  switch (c.type) {
    case 'note': return `<div class="champ large" data-bloc="${c.k}"><div class="note-douce"><span class="em">${c.em || '💜'}</span><div>${c.html}</div></div></div>`;
    case 'sep': return `<div class="sep" data-bloc="${c.k}">${esc(c.lab)}</div>`;
    case 'html': return `<div class="${cls}" data-bloc="${c.k}">${c.html}</div>`;
    case 'textarea': return `<div class="${cls}" data-bloc="${c.k}">${lab}<textarea id="${id}" name="${c.k}" rows="${c.rows || 3}" placeholder="${esc(c.place || '')}">${esc(val)}</textarea>${aide}</div>`;
    case 'select': return `<div class="${cls}" data-bloc="${c.k}">${lab}<select id="${id}" name="${c.k}">${c.options.map(([o, l]) => `<option value="${esc(o)}" ${String(o) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${aide}</div>`;
    case 'choix': return `<div class="${cls}" data-bloc="${c.k}"><span class="lab">${esc(c.lab || '')}</span><div class="choix">${c.options.map(([o, l]) =>
      `<label><input type="radio" name="${c.k}" value="${esc(o)}" ${String(o) === String(val) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>${aide}</div>`;
    case 'jours': {
      const sel = (Array.isArray(val) ? val : []).map(String);
      return `<div class="${cls}" data-bloc="${c.k}"><span class="lab">${esc(c.lab || '')}</span><div class="choix">${[1, 2, 3, 4, 5, 6, 0].map(j =>
        `<label><input type="checkbox" name="${c.k}" value="${j}" ${sel.includes(String(j)) ? 'checked' : ''}><span>${cap(JOURS_C[j])}</span></label>`).join('')}</div>${aide}</div>`;
    }
    case 'multi': {
      const sel = (Array.isArray(val) ? val : []).map(String);
      return `<div class="${cls}" data-bloc="${c.k}"><span class="lab">${esc(c.lab || '')}</span><div class="choix">${c.options.map(([o, l]) =>
        `<label><input type="checkbox" name="${c.k}" value="${esc(o)}" ${sel.includes(String(o)) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>${aide}</div>`;
    }
    case 'case': return `<div class="${cls}" data-bloc="${c.k}"><label class="case"><input type="checkbox" name="${c.k}" ${val ? 'checked' : ''}> ${c.texte || esc(c.lab)}</label>${aide}</div>`;
    case 'photo': return `<div class="${cls}" data-bloc="${c.k}">${lab}<div class="depot" data-photo="${c.k}" tabindex="0" role="button">
      ${val ? `<img src="${val}" alt="">` : '<span style="font-size:26px">📷</span>'}<span>${val ? 'Changer la photo' : 'Ajouter une photo'}</span>
      ${val ? '<button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>' : ''}</div>
      <input type="hidden" name="${c.k}" value="${esc(val)}">${aide}</div>`;
    default: return `<div class="${cls}" data-bloc="${c.k}">${lab}<input id="${id}" name="${c.k}" type="${c.type || 'text'}" value="${esc(val)}"
      ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''} ${c.step ? `step="${c.step}"` : ''} ${c.type === 'number' ? 'inputmode="decimal"' : ''} ${c.auto ? `autocomplete="${c.auto}"` : 'autocomplete="off"'} placeholder="${esc(c.place || '')}">${aide}</div>`;
  }
}
function lireForm(form, champs) {
  const o = {};
  for (const c of champs) {
    if (!c.k || ['note', 'html', 'sep'].includes(c.type)) continue;
    if (c.type === 'case') { const x = form.querySelector(`[name="${c.k}"]`); o[c.k] = !!(x && x.checked); }
    else if (c.type === 'choix') { const x = form.querySelector(`[name="${c.k}"]:checked`); o[c.k] = x ? x.value : ''; }
    else if (c.type === 'jours') o[c.k] = [...form.querySelectorAll(`[name="${c.k}"]:checked`)].map(x => Number(x.value));
    else if (c.type === 'multi') o[c.k] = [...form.querySelectorAll(`[name="${c.k}"]:checked`)].map(x => x.value);
    else { const x = form.querySelector(`[name="${c.k}"]`); o[c.k] = x ? x.value.trim() : ''; }
  }
  return o;
}
function brancherPhotos(racine) {
  const agir = async e => {
    const ret = e.target.closest('[data-retire-photo]');
    const d = e.target.closest('[data-photo]');
    if (!d) return;
    const hidden = d.parentElement.querySelector(`input[name="${d.dataset.photo}"]`);
    if (ret) { e.stopPropagation(); hidden.value = ''; d.innerHTML = '<span style="font-size:26px">📷</span><span>Ajouter une photo</span>'; return; }
    const p = await choisirPhoto();
    if (!p) return;
    hidden.value = p;
    d.innerHTML = `<img src="${p}" alt=""><span>Changer la photo</span><button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>`;
  };
  racine.addEventListener('click', agir);
  racine.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-photo]')) { e.preventDefault(); agir(e); } });
}
/* montre ou cache des blocs de formulaire selon un choix */
function basculer(f, source, regles) {
  const maj = () => {
    const x = f.querySelector(`[name="${source}"]:checked`) || f.querySelector(`[name="${source}"]`);
    const v = x ? (x.type === 'checkbox' ? x.checked : x.value) : '';
    for (const [bloc, test] of Object.entries(regles)) { const b = f.querySelector(`[data-bloc="${bloc}"]`); if (b) b.style.display = test(v) ? '' : 'none'; }
  };
  f.addEventListener('change', e => { if (e.target.name === source) maj(); });
  maj();
}
/* ouvre une fenêtre de saisie ; enregistrer(vals) renvoie false pour garder la fenêtre ouverte */
function formulaire({ titre, chapo = '', champs, valeurs = {}, enregistrer: ok, supprimer, texteSup = '🗑️ Supprimer', large = false, texteOk = 'Enregistrer', apres }) {
  const v = fenetre(`<form class="fenetre ${large ? 'large' : ''}" role="dialog" aria-modal="true" novalidate>
    <h2>${titre}</h2>${chapo ? `<p class="chapo">${chapo}</p>` : ''}
    <div class="champs">${champs.map(c => champHTML(c, valeurs[c.k])).join('')}</div>
    <div class="pied">${supprimer ? `<button type="button" class="btn danger" data-sup>${texteSup}</button>` : ''}
      <div class="spacer"></div><button type="button" class="btn" data-annule>Annuler</button><button type="submit" class="btn plein">${texteOk}</button></div></form>`);
  const f = v.querySelector('form');
  brancherPhotos(f);
  f.addEventListener('click', async e => {
    if (e.target.closest('[data-annule]')) fermer(v);
    if (e.target.closest('[data-sup]') && await confirmer('Supprimer ?', 'Cette action ne peut pas être annulée.', 'Supprimer')) { supprimer(); fermer(v); sauver(); }
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const vals = lireForm(f, champs);
    const manque = champs.find(c => c.req && !vals[c.k]);
    if (manque) { const x = f.querySelector(`[name="${manque.k}"]`); x && x.focus(); toast('✏️', `« ${manque.lab} » est à remplir`); return; }
    if (ok(vals) === false) return;
    fermer(v); sauver();
  });
  if (apres) apres(f);
  return v;
}
function telecharger(nom, contenu, type = 'application/octet-stream') {
  const blob = contenu instanceof Blob ? contenu : new Blob([contenu], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* registres des pages et des actions : chaque fichier y ajoute les siennes */
const PAGES = {};
const ACTIONS = {};
const V = { page: 'accueil', sous: { piscine: 'suivi', sports: 'liste' }, piece: '', sportPour: '', etape: 1 };
