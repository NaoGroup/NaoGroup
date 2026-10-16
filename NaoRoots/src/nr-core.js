'use strict';
/* ============================================================
   NaoRoots — le cœur : l'état (personnes, liens, arbres, photos,
   histoires, documents, sources), les dates approximatives, les
   niveaux de certitude, les liens de parenté, la protection des
   personnes vivantes, les fichiers, la fenêtre et les messages.
   ============================================================ */

const CLE = 'naoroots.donnees';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const maintenant = () => new Date().toISOString();

/* ============================================================
   Les dates : souvent incomplètes en généalogie.
   On garde « AAAA », « AAAA-MM » ou « AAAA-MM-JJ », avec une précision :
   exacte, vers, avant, après. Rien n'est jamais complété au hasard.
   ============================================================ */
const z2 = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + z2(d.getMonth() + 1) + '-' + z2(d.getDate());
const auj = () => iso(new Date());
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const PRECISIONS = { exacte: { nom: 'Date exacte', p: '' }, vers: { nom: 'Vers', p: 'vers ' }, avant: { nom: 'Avant', p: 'avant ' }, apres: { nom: 'Après', p: 'après ' } };
/* « 12/03/1932 », « 3/1932 », « 1932 », « 1932-03-12 » → valeur normalisée, ou '' si illisible. */
function lireDate(t) {
  t = String(t || '').trim(); if (!t) return '';
  let m = t.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
  if (m) return normaliserDate(m[1], m[2], m[3]);
  m = t.match(/^(\d{1,2})[\/.\- ](\d{1,2})[\/.\- ](\d{4})$/);
  if (m) return normaliserDate(m[3], m[2], m[1]);
  m = t.match(/^(\d{1,2})[\/.\- ](\d{4})$/);
  if (m) return normaliserDate(m[2], m[1]);
  const mo = sansAccent(t).match(/^(?:(\d{1,2})(?:er)? )?([a-z]+)\.? (\d{4})$/);
  if (mo) { const i = MOIS.findIndex(x => sansAccent(x).startsWith(mo[2].slice(0, 3))); if (i >= 0) return normaliserDate(mo[3], i + 1, mo[1]); }
  return null;
}
function normaliserDate(a, m, j) {
  a = +a; m = m ? +m : 0; j = j ? +j : 0;
  if (!a || a < 1000 || a > 2200 || m > 12 || j > 31) return null;
  if (!m) return String(a);
  if (!j) return a + '-' + z2(m);
  const d = new Date(a, m - 1, j); if (d.getMonth() !== m - 1) return null;
  return a + '-' + z2(m) + '-' + z2(j);
}
const annee = v => v ? +String(v).slice(0, 4) : null;
function saisieDate(v) {
  if (!v) return '';
  const [a, m, j] = String(v).split('-');
  return j ? j + '/' + m + '/' + a : m ? m + '/' + a : a;
}
function texteDate(v, q) {
  if (!v) return '';
  const [a, m, j] = String(v).split('-').map(Number);
  const t = j ? j + (j === 1 ? 'er' : '') + ' ' + MOIS[m - 1] + ' ' + a : m ? MOIS[m - 1] + ' ' + a : String(a);
  return ((PRECISIONS[q] || PRECISIONS.exacte).p) + t;
}
function texteAnnee(v, q) { if (!v) return ''; return (q === 'vers' ? 'v. ' : q === 'avant' ? 'av. ' : q === 'apres' ? 'ap. ' : '') + annee(v); }
const dateDe = s => { const [a, m, j] = String(s).split('-').map(Number); return new Date(a, (m || 1) - 1, j || 1); };
const dateComplete = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
function ecart(s) { return Math.round((dateDe(s) - dateDe(auj())) / 864e5); }
function dans(s) {
  const n = ecart(s);
  if (n === 0) return "aujourd'hui"; if (n === 1) return 'demain';
  return n > 0 ? 'dans ' + n + ' jours' : 'il y a ' + (-n) + ' jours';
}

/* ============================================================
   La certitude : chaque information dit d'où elle vient.
   Une information saisie reste « à vérifier » tant qu'on ne l'a pas
   qualifiée : c'est l'utilisatrice qui la dit confirmée, probable, etc.
   ============================================================ */
const CERT = {
  confirme: { nom: 'Confirmé', long: 'Confirmé (je le sais, ou une source le prouve)', e: '✓', c: 'ok' },
  probable: { nom: 'Probable', long: 'Probable', e: '◐', c: 'bleu' },
  verifier: { nom: 'À vérifier', long: 'À vérifier / à confirmer', e: '?', c: 'bientot' },
  approx: { nom: 'Approximatif', long: 'Approximatif', e: '≈', c: 'bleu' },
  tradition: { nom: 'Tradition familiale', long: 'Tradition familiale (transmis à l’oral)', e: '❦', c: 'rose' }
};
const certDe = c => CERT[c] || CERT.verifier;
function badgeCert(c, mini) {
  const x = certDe(c);
  return `<span class="badge ${x.c}${mini ? ' mini' : ''}" title="${esc(x.long)}">${x.e} ${esc(x.nom)}</span>`;
}
function optionsCert(sel) {
  return Object.entries(CERT).map(([k, x]) => `<option value="${k}"${(sel || 'verifier') === k ? ' selected' : ''}>${x.e} ${esc(x.long)}</option>`).join('');
}
const TYPES_SOURCE = {
  temoignage: { nom: 'Témoignage familial', e: '🗣️' },
  officiel: { nom: 'Document officiel', e: '🏛️' },
  archive: { nom: 'Archive', e: '📜' },
  photo: { nom: 'Photo', e: '📷' },
  recherche: { nom: 'Recherche personnelle', e: '🔎' },
  autre: { nom: 'Autre', e: '📌' }
};
const typeSource = t => TYPES_SOURCE[t] || TYPES_SOURCE.autre;
/* Une source officielle ou une archive appuie l'information. */
function aSourceSolide(ids) { return (ids || []).some(id => { const s = source(id); return s && !s.supprime && (s.type === 'officiel' || s.type === 'archive'); }); }
function certAcceptable(c) { return c || 'verifier'; }

/* ============================================================
   Les catalogues
   ============================================================ */
const SEXES = { f: 'Femme', m: 'Homme', x: 'Autre / non précisé' };
const NATURES_PARENT = {
  biologique: { nom: 'Parent', d: 'Lien de naissance' },
  adoptif: { nom: 'Parent adoptif', d: 'Adoption' },
  beau: { nom: 'Beau-parent', d: 'Famille recomposée' },
  accueil: { nom: 'Famille d’accueil', d: 'Parent de cœur, tuteur, accueil' }
};
const NATURES_UNION = {
  mariage: { nom: 'Mariage', e: '💍' }, pacs: { nom: 'PACS', e: '🤝' }, union: { nom: 'Union libre', e: '💞' },
  ex: { nom: 'Ex-conjoint·e (séparés ou divorcés)', e: '💔' }
};
const NATURES_AUTRE = { parrainage: { nom: 'Parrain / marraine', e: '🕊️' }, coeur: { nom: 'Lien de cœur', e: '💜' }, fratrie: { nom: 'Frère ou sœur', e: '👫' } };
const TYPES_ARBRE = {
  principal: { nom: 'Arbre familial principal', e: '🌳' }, maternel: { nom: 'Famille maternelle', e: '🌸' }, paternel: { nom: 'Famille paternelle', e: '🌿' },
  couple: { nom: 'Arbre du couple', e: '💞' }, enfant: { nom: 'Arbre d’un enfant', e: '🌱' }, branche: { nom: 'Branche spécifique', e: '🍃' }
};
const TYPES_EVENEMENT = {
  naissance: { nom: 'Naissance', e: '👶' }, bapteme: { nom: 'Baptême / cérémonie', e: '🕊️' }, mariage: { nom: 'Mariage', e: '💍' }, union: { nom: 'Union', e: '💞' },
  divorce: { nom: 'Divorce / séparation', e: '💔' }, demenagement: { nom: 'Déménagement', e: '🏠' }, arrivee: { nom: 'Arrivée dans une région', e: '🧭' },
  migration: { nom: 'Migration', e: '⛵' }, voyage: { nom: 'Voyage', e: '✈️' }, diplome: { nom: 'Diplôme', e: '🎓' }, metier: { nom: 'Métier / travail', e: '🛠️' },
  permis: { nom: 'Permis (de conduire…)', e: '🚗' }, tatouage: { nom: 'Tatouage', e: '🖋️' },
  militaire: { nom: 'Service militaire', e: '🎖️' }, deces: { nom: 'Décès', e: '🕯️' }, autre: { nom: 'Autre événement', e: '✨' }
};
const typeEv = t => TYPES_EVENEMENT[t] || TYPES_EVENEMENT.autre;
const GENRES_HISTOIRE = {
  recit: { nom: 'Récit de famille', e: '📖' }, enfance: { nom: 'Souvenir d’enfance', e: '🧸' }, migration: { nom: 'Histoire de migration', e: '⛵' },
  recette: { nom: 'Recette de famille', e: '🍲' }, tradition: { nom: 'Tradition', e: '🕯️' }, fete: { nom: 'Fête', e: '🎉' },
  chanson: { nom: 'Chanson', e: '🎶' }, expression: { nom: 'Expression, dicton', e: '💬' }, anecdote: { nom: 'Anecdote', e: '😊' }, temoignage: { nom: 'Témoignage', e: '🎙️' }
};
const genreH = g => GENRES_HISTOIRE[g] || GENRES_HISTOIRE.recit;
const TYPES_DOC = {
  livret: { nom: 'Livret de famille', e: '📘', off: true }, naissance: { nom: 'Acte de naissance', e: '📜', off: true }, mariage: { nom: 'Acte de mariage', e: '📜', off: true },
  deces: { nom: 'Acte de décès', e: '📜', off: true }, certificat: { nom: 'Certificat', e: '🏅', off: true }, diplome: { nom: 'Diplôme', e: '🎓', off: true },
  militaire: { nom: 'Livret militaire', e: '🎖️', off: true }, lettre: { nom: 'Lettre', e: '✉️' }, carte: { nom: 'Carte postale', e: '💌' },
  arbre: { nom: 'Arbre dessiné', e: '🌳' }, presse: { nom: 'Coupure de presse', e: '📰' }, ancien: { nom: 'Document ancien', e: '🗞️' }, autre: { nom: 'Autre document', e: '📄' }
};
const typeDoc = t => TYPES_DOC[t] || TYPES_DOC.autre;
const BIO = [
  ['enfance', 'Enfance'], ['etudes', 'Études'], ['metiers', 'Métiers'], ['lieux', 'Lieux de vie'],
  ['passions', 'Passions'], ['habitudes', 'Habitudes'], ['souvenirs', 'Souvenirs'], ['anecdotes', 'Anecdotes']
];
const ALBUMS_SUGGERES = [['Mariages', '💍'], ['Anniversaires', '🎂'], ['Vacances', '🏖️'], ['Enfance', '🧸'], ['Générations', '🌳'], ['Traditions', '🕯️'], ['Martinique', '🌺'], ['Alsace', '🥨']];
const QUESTIONS_PRETES = [
  'Quel était son métier ?', 'Où vivait-elle / vivait-il ?', 'As-tu une photo de cette personne ?', 'Quelle est l’histoire de cette recette ?',
  'Comment se sont-ils rencontrés ?', 'Quel était son surnom, et pourquoi ?', 'Quelle langue parlait-on à la maison ?',
  'Te souviens-tu d’une phrase qu’elle / il disait souvent ?', 'Où est-elle / est-il né·e, exactement ?', 'Pourquoi la famille est-elle partie de là-bas ?',
  'Quelle fête comptait le plus dans la famille ?', 'Qui garde les papiers de famille (livret, actes, lettres) ?'
];
/* Des couleurs discrètes pour les branches : les quatre lignées des grands-parents de la personne au centre. */
const BRANCHES = [
  { c: '#9C8FD8', nom: 'Famille proche' },
  { c: '#8FA8F5', nom: 'Branche 1' }, { c: '#B89CF2', nom: 'Branche 2' },
  { c: '#EFA3C6', nom: 'Branche 3' }, { c: '#EFC08A', nom: 'Branche 4' }
];
const CONFID = {
  prive: { nom: 'Moi seul·e', e: '🔒', d: 'Jamais partagé, même avec les proches invités.' },
  invites: { nom: 'Proches invités', e: '👥', d: 'Visible par les proches que vous invitez explicitement à cet arbre.' }
};
function badgeConfid(x) { const c = CONFID[(x && x.confid) || 'prive']; return `<span class="badge${x && x.confid === 'invites' ? ' bleu' : ''} mini" title="${esc(c.d)}">${c.e} ${esc(c.nom)}</span>`; }

/* ============================================================
   L'état
   ============================================================ */
const vierge = () => ({
  v: 1, arbres: [], personnes: [], liens: [], evenements: [], photos: [], albums: [], documents: [], sources: [],
  histoires: [], questions: [], lieux: [], invitations: [], recus: [], propositions: [], mediasGed: [], pasDoublons: [], reglages: { arbre: null }
});
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
  catch (e) { toast(/quota/i.test(e && e.name) ? '⚠️ Impossible d’enregistrer : la mémoire du navigateur est pleine.' : '⚠️ Ce navigateur refuse l’enregistrement : vos modifications ne seront pas gardées.'); }
  memo = {};
}

/* L'interface (non enregistrée). U.recu : un arbre reçu d'un proche, affiché en lecture. */
const U = { vue: 'accueil', q: '', filtreBranche: '', albums: '', album: null, docs: 'documents', frise: 'frise', filtreFrise: '',
  mode: 'sablier', sens: 'v', gen: 3, zoom: 1, focus: null, genreH: '', recu: null };

/* Les données affichées : les siennes, ou celles d'un arbre reçu. */
function D() {
  if (U.recu) { const r = S.recus.find(x => x.id === U.recu); if (r) return r.donnees; U.recu = null; }
  return S;
}
const enLecture = () => !!U.recu;
const recuActif = () => U.recu ? S.recus.find(x => x.id === U.recu) : null;
const actifs = k => (D()[k] || []).filter(x => !x.supprime);
const personne = id => (D().personnes || []).find(p => p.id === id && !p.supprime);
const source = id => S.sources.find(s => s.id === id);
const arbre = id => (D().arbres || []).find(a => a.id === id && !a.supprime);
const photo = id => (D().photos || []).find(p => p.id === id && !p.supprime);
const album = id => S.albums.find(a => a.id === id && !a.supprime);
const histoire = id => (D().histoires || []).find(h => h.id === id && !h.supprime);
const documentDe = id => S.documents.find(d => d.id === id && !d.supprime);
function arbreCourant() {
  const l = actifs('arbres'); if (!l.length) return null;
  const id = U.recu ? null : S.reglages.arbre;
  return l.find(a => a.id === id) || l[0];
}

/* ---------- les personnes ---------- */
const prenomDe = p => p ? (p.prenom || p.surnom || 'Sans prénom') : '';
const nomComplet = p => p ? [p.prenom, p.nom].filter(Boolean).join(' ') || p.surnom || 'Personne sans nom' : '';
const initiale = p => (p && (p.prenom || p.nom || p.surnom || '?')).charAt(0).toUpperCase();
const estDecede = p => !!(p && (p.decede || p.dD));
/* Vivante : pas de décès connu, et née il y a moins de 105 ans (ou date inconnue). */
function estVivant(p) {
  if (!p || estDecede(p)) return false;
  const a = annee(p.nD); return !a || new Date().getFullYear() - a < 105;
}
function ageDe(p) {
  if (!p || !p.nD) return null;
  const fin = p.dD ? dateDe(p.dD) : new Date(), d = dateDe(p.nD);
  let a = fin.getFullYear() - d.getFullYear();
  if (dateComplete(p.nD) && (!p.dD || dateComplete(p.dD)) && (fin.getMonth() < d.getMonth() || (fin.getMonth() === d.getMonth() && fin.getDate() < d.getDate()))) a--;
  return a;
}
/* L'anniversaire des vivants : dans combien de jours (0 = aujourd'hui), ou null. */
function anniversaireDans(p) {
  if (!p || p.masque || !estVivant(p) || !dateComplete(p.nD)) return null;
  const d = dateDe(p.nD), a = new Date().getFullYear();
  let x = iso(new Date(a, d.getMonth(), d.getDate())); if (x < auj()) x = iso(new Date(a + 1, d.getMonth(), d.getDate()));
  return ecart(x);
}
/* Le petit gâteau d'anniversaire (en SVG) : bougie qui vacille et étincelles quand c'est aujourd'hui. */
function gateau(anime) {
  return `<g class="gateau${anime ? ' anime' : ''}">
    ${anime ? '<circle class="lueur-f" cx="0" cy="-13.4" r="4.6" fill="#FFD27A"/>' : ''}
    <ellipse cx="0" cy="10.2" rx="11.5" ry="2.1" fill="#FFFFFF" opacity=".55"/>
    <rect x="-9.5" y="1" width="19" height="9" rx="2.6" fill="#F3A6C8"/>
    <path d="M-9.5 5H9.5" stroke="#FFFFFF" stroke-width="1.3" opacity=".85"/>
    <rect x="-7.2" y="-5.2" width="14.4" height="7.2" rx="2.3" fill="#B89CF2"/>
    <path d="M-7.2 -2.9C-7.2 -5.6 7.2 -5.6 7.2 -2.9V-1.6C6.2 -.2 5.4 -1.6 4.4 -.7C3.4 .3 2.6 -1.3 1.4 -.4C.3 .5 -.6 -1.1 -1.7 -.3C-2.8 .6 -3.6 -1 -4.7 -.2C-5.8 .6 -6.5 -.8 -7.2 -1.5Z" fill="#FFFFFF"/>
    <circle cx="-4.6" cy="6.8" r=".8" fill="#FFFFFF" opacity=".9"/><circle cx="0" cy="7.6" r=".8" fill="#FFE08A"/><circle cx="4.6" cy="6.8" r=".8" fill="#FFFFFF" opacity=".9"/>
    <rect x="-.95" y="-11.2" width="1.9" height="6.4" rx=".6" fill="#FFE08A"/>
    <path d="M-.95 -9.6L.95 -10.4M-.95 -7.4L.95 -8.2" stroke="#F3A6C8" stroke-width=".6"/>
    <g class="flamme"><path d="M0 -16.6C2 -14.4 1.8 -12.4 0 -11.5C-1.8 -12.4 -2 -14.4 0 -16.6Z" fill="#FFB347"/><ellipse cx="0" cy="-12.9" rx=".75" ry="1.2" fill="#FFF6D0"/></g>
    ${anime ? '<path class="etincelle" d="M-8 -12L-7.4 -10.6L-6 -10L-7.4 -9.4L-8 -8L-8.6 -9.4L-10 -10L-8.6 -10.6Z" fill="#FFE08A"/><path class="etincelle e2" d="M8.5 -9L8.9 -8L9.9 -7.6L8.9 -7.2L8.5 -6.2L8.1 -7.2L7.1 -7.6L8.1 -8Z" fill="#FFFFFF"/>' : ''}
  </g>`;
}
const gateauIco = (anime, taille = 22, titre = '') => `<svg class="gateau-ico" viewBox="-12 -18 24 30" width="${taille}" height="${Math.round(taille * 1.25)}" role="img" aria-label="${esc(titre || 'Anniversaire')}">${titre ? `<title>${esc(titre)}</title>` : ''}${gateau(anime)}</svg>`;
function phraseAnniv(p, n) {
  const age = ageDe(p) + (n === 0 ? 0 : 1);
  return n === 0 ? `C'est l'anniversaire de ${prenomDe(p)} aujourd'hui : ${age} ans !` : `Anniversaire de ${prenomDe(p)} ${n === 1 ? 'demain' : 'dans ' + n + ' jours'} (${age} ans)`;
}
/* ---------- les doublons ----------
   Même prénom et même nom (sans tenir compte des majuscules ni des accents), et rien qui
   les distingue : années de naissance et de décès compatibles, même sexe, pas parent l'un
   de l'autre, et pas des parents différents. L'utilisatrice décide toujours de fusionner. */
const cleIdentite = p => sansAccent([p.prenom, p.nom].join(' ')).replace(/[^a-z0-9]+/g, ' ').trim();
/* Les prénoms d'une fiche, mot par mot (« Juliana Denise » → juliana, denise). */
const motsDe = t => sansAccent(t).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
/* Premier prénom + nom : « Juliana DESTIN » et « Juliana Denise Destin » ont la même. */
const cleCourte = p => { const pr = motsDe(p.prenom)[0], n = motsDe(p.nom).join(' '); return pr && n ? pr + '|' + n : cleIdentite(p); };
/* Des prénoms qui se prolongent l'un l'autre : « Juliana » et « Juliana Denise » oui, « Juliana Rose » et « Juliana Denise » non. */
function prenomsCompatibles(a, b) {
  const x = motsDe(a.prenom), y = motsDe(b.prenom), [c, l] = x.length <= y.length ? [x, y] : [y, x];
  return c.every((m, i) => l[i] === m);
}
const clePaire = (a, b) => [a, b].sort().join('|');
function memePersonne(a, b) {
  if (a.id === b.id || a.masque || b.masque) return false;
  const k = cleCourte(a); if (!k || k !== cleCourte(b) || !prenomsCompatibles(a, b)) return false;
  const memesPrenoms = cleIdentite(a) === cleIdentite(b);
  if ((S.pasDoublons || []).includes(clePaire(a.id, b.id))) return false;
  if (a.sexe && b.sexe && a.sexe !== b.sexe) return false;
  const ya = annee(a.nD), yb = annee(b.nD), tol = (a.nQ && a.nQ !== 'exacte') || (b.nQ && b.nQ !== 'exacte') ? 3 : 0;
  if (ya && yb && Math.abs(ya - yb) > tol) return false;
  if (a.nD && b.nD && dateComplete(a.nD) && dateComplete(b.nD) && a.nD !== b.nD) return false;
  const da = annee(a.dD), db = annee(b.dD); if (da && db && Math.abs(da - db) > 1) return false;
  if (lienEntre('parent', a.id, b.id) || lienEntre('parent', b.id, a.id) || lienEntre('union', a.id, b.id)) return false;
  /* un parent et son enfant du même nom (Adel père, Adel fils) ne sont jamais la même personne */
  const k2 = cleCourte(a), pereHomonyme = p => enfantsDe(p.id).some(x => cleCourte(x.p) === k2), filsHomonyme = p => parentsDe(p.id).some(x => cleCourte(x.p) === k2);
  if ((pereHomonyme(a) && filsHomonyme(b)) || (filsHomonyme(a) && pereHomonyme(b))) return false;
  const pa = parentsDe(a.id).map(x => cleCourte(x.p)), pb = parentsDe(b.id).map(x => cleCourte(x.p));
  if (pa.length && pb.length && !pa.some(x => pb.includes(x))) return false;
  if (memesPrenoms) return true;
  /* prénoms différents (un deuxième prénom en plus) : il faut une preuve — un parent commun, ou la même année de naissance */
  return (pa.length && pb.length && pa.some(x => pb.includes(x))) || !!(ya && yb && ya === yb);
}
/* Les fichiers GEDCOM d'où vient une fiche (même importée avant que NaoRoots ne les note). */
function fichiersImport(p) {
  const l = new Set(); if (p.gedFichier) l.add(p.gedFichier);
  (p.sources || []).forEach(id => { const s = source(id); if (s && /^Import GEDCOM : /.test(s.titre || '')) l.add(s.titre.replace(/^Import GEDCOM : /, '')); });
  return l;
}
/* Un doublon « évident » : même date de naissance complète, ou deux fiches venues du même fichier GEDCOM
   importé plusieurs fois (et rien qui les distingue — voir memePersonne). */
function doublonEvident(a, b) {
  if (dateComplete(a.nD) && a.nD === b.nD) return true;
  /* enfants du même parent, avec la même année de naissance (ou une seule connue) */
  const pa = parentsDe(a.id).map(x => x.p.id), commun = parentsDe(b.id).some(x => pa.includes(x.p.id));
  if (commun && (!annee(a.nD) || !annee(b.nD) || annee(a.nD) === annee(b.nD))) return true;
  const fa = fichiersImport(a); return Array.from(fichiersImport(b)).some(f => fa.has(f));
}
function groupesDoublons() {
  if (memo.doublons && memo.src === D()) return memo.doublons;
  const parCle = new Map();
  actifs('personnes').forEach(p => { const k = cleCourte(p); if (!k || p.masque) return; if (!parCle.has(k)) parCle.set(k, []); parCle.get(k).push(p); });
  const groupes = [];
  parCle.forEach(l => {
    if (l.length < 2) return;
    const vus = new Set();
    l.forEach(p => {
      if (vus.has(p.id)) return;
      const g = [p]; vus.add(p.id);
      l.forEach(q => { if (!vus.has(q.id) && g.every(x => memePersonne(x, q))) { vus.add(q.id); g.push(q); } });
      if (g.length > 1) groupes.push(g);
    });
  });
  memo.doublons = groupes; return groupes;
}
/* Garder une fiche, y verser ce que les autres savent, et rediriger vers elle tout ce qui les citait. */
function fusionner(garder, autres) {
  const champs = ['prenom', 'nom', 'nomUsage', 'surnom', 'sexe', 'profession', 'photo', 'couleur', 'nD', 'nQ', 'nLieu', 'dD', 'dQ', 'dLieu'];
  const rang = c => ({ confirme: 5, probable: 4, approx: 3, tradition: 2, verifier: 1 }[c] || 0);
  autres.forEach(x => {
    champs.forEach(c => { if (!garder[c] && x[c]) garder[c] = x[c]; });
    /* garder le prénom le plus complet (« Juliana » → « Juliana Denise ») */
    if (motsDe(x.prenom).length > motsDe(garder.prenom).length && prenomsCompatibles(x, garder)) garder.prenom = x.prenom;
    if (rang(x.nCert) > rang(garder.nCert) && (!garder.nD || garder.nD === x.nD)) garder.nCert = x.nCert;
    if (rang(x.dCert) > rang(garder.dCert) && (!garder.dD || garder.dD === x.dD)) garder.dCert = x.dCert;
    if (x.decede) garder.decede = true;
    if (x.notes && !(garder.notes || '').includes(x.notes)) garder.notes = [garder.notes, x.notes].filter(Boolean).join('\n\n');
    garder.bio = garder.bio || {}; Object.entries(x.bio || {}).forEach(([k, v]) => { if (v && !garder.bio[k]) garder.bio[k] = v; });
    garder.citations = (garder.citations || []).concat((x.citations || []).filter(c => !(garder.citations || []).some(d => d.t === c.t)));
    garder.sources = Array.from(new Set([...(garder.sources || []), ...(x.sources || [])]));
    if (!garder.gedRef && x.gedRef) { garder.gedRef = x.gedRef; garder.gedFichier = x.gedFichier; }
  });
  const ids = new Set(autres.map(x => x.id)), vers = id => ids.has(id) ? garder.id : id;
  S.liens.forEach(l => { l.a = vers(l.a); l.b = vers(l.b); });
  const rangL = l => rang(l.cert) * 10 + (l.supprime ? 0 : 1), garde = new Map();
  S.liens.filter(l => l.a !== l.b).forEach(l => {
    const k = l.t + ':' + (l.t === 'parent' ? l.a + '>' + l.b : clePaire(l.a, l.b));
    const d = garde.get(k);
    if (!d) garde.set(k, l);
    else { d.sources = Array.from(new Set([...(d.sources || []), ...(l.sources || [])])); if (rangL(l) > rangL(d)) { l.sources = d.sources; garde.set(k, l); } }
  });
  S.liens = Array.from(garde.values());
  ['photos', 'histoires', 'documents', 'evenements', 'mediasGed'].forEach(k => (S[k] || []).forEach(y => { if (y.personnes) y.personnes = Array.from(new Set(y.personnes.map(vers))); if (y.principalDe) y.principalDe = Array.from(new Set(y.principalDe.map(vers))); }));
  S.questions.forEach(q => { q.pour = vers(q.pour); });
  S.arbres.forEach(a => { a.racine = vers(a.racine); });
  S.propositions.forEach(p => { if (p.data && p.data.pour) p.data.pour = vers(p.data.pour); });
  S.personnes = S.personnes.filter(p => !ids.has(p.id));
  if (ids.has(U.focus)) U.focus = garder.id; if (ids.has(U.pid)) U.pid = garder.id;
  memo = {};
}
function estMineur(p) { if (!estVivant(p)) return false; const a = ageDe(p); return a != null ? a < 18 : !!p.mineur; }
function periode(p) {
  const n = p.nD ? texteAnnee(p.nD, p.nQ) : '', d = p.dD ? texteAnnee(p.dD, p.dQ) : (p.decede ? '†' : '');
  if (!n && !d) return estVivant(p) ? '' : '';
  return n + (d ? ' – ' + d : '');
}
/* Protéger les vivants et les mineurs : dans un export ou une invitation, on ne garde qu'un prénom (ou rien). */
function masquer(p, o) {
  if (!estVivant(p)) return p;
  if (estMineur(p) && !o.mineurs) return { id: p.id, prenom: 'Enfant', nom: '', masque: true, sexe: '', confid: p.confid };
  if (!o.vivants) return { id: p.id, prenom: p.prenom || 'Personne vivante', nom: '', masque: true, sexe: p.sexe, confid: p.confid };
  return p;
}

/* ============================================================
   Les liens de parenté
   parent : a = le parent, b = l'enfant · union : a et b · autre : parrainage, lien de cœur, fratrie
   ============================================================ */
let memo = {};
function liensActifs() {
  if (memo.liens && memo.src === D()) return memo.liens;
  memo = { src: D(), liens: (D().liens || []).filter(l => !l.supprime && personne(l.a) && personne(l.b)) };
  return memo.liens;
}
function parentsDe(id) { return liensActifs().filter(l => l.t === 'parent' && l.b === id).sort((x, y) => (x.ordre || 0) - (y.ordre || 0) || String(x.cree).localeCompare(y.cree)).map(l => ({ p: personne(l.a), lien: l })); }
function enfantsDe(id) {
  return liensActifs().filter(l => l.t === 'parent' && l.a === id).map(l => ({ p: personne(l.b), lien: l }))
    .sort((x, y) => String(x.p.nD || '9999').localeCompare(String(y.p.nD || '9999')));
}
function conjointsDe(id) { return liensActifs().filter(l => l.t === 'union' && (l.a === id || l.b === id)).map(l => ({ p: personne(l.a === id ? l.b : l.a), lien: l })); }
function autresLiensDe(id) { return liensActifs().filter(l => l.t === 'autre' && l.nature !== 'fratrie' && (l.a === id || l.b === id)).map(l => ({ p: personne(l.a === id ? l.b : l.a), lien: l, sens: l.a === id ? 'donne' : 'recoit' })); }
/* Frères et sœurs : au moins un parent en commun (demi si un seul), ou un lien « fratrie » posé à la main. */
function fratrieDe(id) {
  const mes = new Set(parentsDe(id).map(x => x.p.id)), out = new Map();
  mes.forEach(pid => enfantsDe(pid).forEach(({ p }) => {
    if (p.id === id) return;
    const communs = parentsDe(p.id).filter(x => mes.has(x.p.id)).length;
    out.set(p.id, { p, demi: communs < mes.size || parentsDe(p.id).length > communs });
  }));
  liensActifs().filter(l => l.t === 'autre' && l.nature === 'fratrie' && (l.a === id || l.b === id)).forEach(l => { const o = personne(l.a === id ? l.b : l.a); if (o && !out.has(o.id)) out.set(o.id, { p: o, demi: false, direct: l }); });
  return Array.from(out.values()).sort((x, y) => String(x.p.nD || '9999').localeCompare(String(y.p.nD || '9999')));
}
const lienEntre = (t, a, b) => liensActifs().find(l => l.t === t && ((l.a === a && l.b === b) || (t !== 'parent' && l.a === b && l.b === a)));

/* La génération de chaque personne par rapport à celle du centre (+1 parents, −1 enfants). */
function generations(racine) {
  const k = 'gen:' + racine; if (memo[k] && memo.src === D()) return memo[k];
  liensActifs();
  const g = new Map(); if (!racine) return g;
  g.set(racine, 0); const file = [racine];
  while (file.length) {
    const id = file.shift(), n = g.get(id);
    const voisins = [...parentsDe(id).map(x => [x.p.id, n + 1]), ...enfantsDe(id).map(x => [x.p.id, n - 1]), ...conjointsDe(id).map(x => [x.p.id, n]), ...fratrieDe(id).map(x => [x.p.id, n])];
    voisins.forEach(([v, gv]) => { if (!g.has(v)) { g.set(v, gv); file.push(v); } });
  }
  memo[k] = g; return g;
}
/* Les branches : chaque ancêtre prend la couleur de la lignée d'un des quatre grands-parents. */
function branches(racine) {
  const k = 'br:' + racine; if (memo[k] && memo.src === D()) return memo[k];
  liensActifs();
  const b = new Map(); if (!racine) return b;
  const parents = parentsDe(racine).filter(x => x.lien.nature !== 'beau').map(x => x.p);
  parents.slice(0, 2).forEach((p, i) => {
    const gp = parentsDe(p.id).filter(x => x.lien.nature !== 'beau').map(x => x.p);
    b.set(p.id, 1 + i * 2);
    gp.slice(0, 2).forEach((q, j) => {
      const n = 1 + i * 2 + j, pile = [q.id];
      while (pile.length) { const id = pile.pop(); if (b.has(id) && id !== q.id) continue; b.set(id, n); parentsDe(id).forEach(x => pile.push(x.p.id)); }
    });
  });
  memo[k] = b; return b;
}
function couleurBranche(racine, id) {
  const p = personne(id); if (p && p.couleur) return p.couleur;
  return BRANCHES[branches(racine).get(id) || 0].c;
}
function nomBranche(a, i) { return (a && a.branches && a.branches[i]) || BRANCHES[i].nom; }

/* « Grand-mère », « oncle », « cousine »… par rapport à la personne au centre. Neutre quand le sexe n'est pas indiqué. */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function genre(p, f, m, n) { return p && p.sexe === 'f' ? f : p && p.sexe === 'm' ? m : n; }
function parente(racine, id) {
  if (!racine || !id) return '';
  if (racine === id) return 'Au centre de l’arbre';
  const p = personne(id);
  const anc = new Map(), pile = [[racine, 0]];
  while (pile.length) { const [x, n] = pile.pop(); parentsDe(x).forEach(({ p: q, lien }) => { if (!anc.has(q.id) || anc.get(q.id).n > n + 1) { anc.set(q.id, { n: n + 1, beau: lien.nature === 'beau', adopt: lien.nature === 'adoptif' }); pile.push([q.id, n + 1]); } }); }
  const arriere = n => n <= 2 ? '' : 'arrière-'.repeat(n - 2);
  if (anc.has(id)) {
    const { n, beau, adopt } = anc.get(id);
    if (n === 1) return beau ? genre(p, 'Belle-mère', 'Beau-père', 'Beau-parent') : (genre(p, 'Mère', 'Père', 'Parent') + (adopt ? ' adoptif' + (p.sexe === 'f' ? 've' : '') : ''));
    return cap(arriere(n) + genre(p, 'grand-mère', 'grand-père', 'grand-parent'));
  }
  const desc = new Map(), pile2 = [[racine, 0]];
  while (pile2.length) { const [x, n] = pile2.pop(); enfantsDe(x).forEach(({ p: q }) => { if (!desc.has(q.id)) { desc.set(q.id, n + 1); pile2.push([q.id, n + 1]); } }); }
  if (desc.has(id)) { const n = desc.get(id); return n === 1 ? genre(p, 'Fille', 'Fils', 'Enfant') : cap(arriere(n) + genre(p, 'petite-fille', 'petit-fils', 'petit-enfant')); }
  if (conjointsDe(racine).some(x => x.p.id === id)) { const l = conjointsDe(racine).find(x => x.p.id === id).lien; return l.nature === 'ex' ? genre(p, 'Ex-conjointe', 'Ex-conjoint', 'Ex-conjoint·e') : genre(p, 'Conjointe', 'Conjoint', 'Conjoint·e'); }
  const fr = fratrieDe(racine).find(x => x.p.id === id);
  if (fr) return (fr.demi ? genre(p, 'Demi-sœur', 'Demi-frère', 'Demi-frère ou sœur') : genre(p, 'Sœur', 'Frère', 'Frère ou sœur'));
  for (const [a, { n }] of anc) {
    if (fratrieDe(a).some(x => x.p.id === id)) return n === 1 ? genre(p, 'Tante', 'Oncle', 'Oncle ou tante') : cap(arriere(n) + genre(p, 'grand-tante', 'grand-oncle', 'grand-oncle ou tante'));
    for (const f of fratrieDe(a)) if (n === 1 && enfantsDe(f.p.id).some(x => x.p.id === id)) return genre(p, 'Cousine', 'Cousin', 'Cousin·e');
  }
  for (const f of fratrieDe(racine)) if (enfantsDe(f.p.id).some(x => x.p.id === id)) return genre(p, 'Nièce', 'Neveu', 'Neveu ou nièce');
  for (const c of conjointsDe(racine)) if (parentsDe(c.p.id).some(x => x.p.id === id)) return genre(p, 'Belle-mère', 'Beau-père', 'Beau-parent');
  const g = generations(racine).get(id);
  return g == null ? 'Hors de cet arbre' : g > 0 ? 'Génération des ' + (g === 1 ? 'parents' : g === 2 ? 'grands-parents' : 'ancêtres') : g < 0 ? 'Génération des descendants' : 'Même génération';
}
/* Qui est dans un arbre (les arbres sont des regards sur la même famille). */
function membresArbre(a) {
  if (!a) return actifs('personnes');
  const k = 'm:' + a.id + ':' + a.portee + ':' + a.racine; if (memo[k] && memo.src === D()) return memo[k];
  let l;
  if (a.portee === 'ascendants' || a.portee === 'descendants') {
    const vus = new Set([a.racine]), pile = [a.racine];
    while (pile.length) { const id = pile.pop(); (a.portee === 'ascendants' ? parentsDe(id) : enfantsDe(id)).forEach(x => { if (!vus.has(x.p.id)) { vus.add(x.p.id); pile.push(x.p.id); } }); if (a.portee === 'descendants') conjointsDe(id).forEach(x => vus.add(x.p.id)); }
    l = actifs('personnes').filter(p => vus.has(p.id));
  } else {
    const g = generations(a.racine);
    l = actifs('personnes').filter(p => g.has(p.id) || !a.racine);
  }
  memo[k] = l; return l;
}

/* ============================================================
   Les lieux : un petit répertoire intégré (sans connexion) pour les
   poser sur la carte ; les autres, on les place d'un clic.
   ============================================================ */
const REPERTOIRE_LIEUX = [
  ['Fort-de-France', 14.6, -61.07], ['Le Lamentin', 14.61, -61], ['Schœlcher', 14.61, -61.09], ['Saint-Pierre (Martinique)', 14.74, -61.18], ['Le Robert', 14.68, -60.94],
  ['Le François', 14.62, -60.9], ['La Trinité', 14.74, -60.96], ['Le Marin', 14.47, -60.87], ['Sainte-Marie', 14.78, -60.99], ['Le Lorrain', 14.83, -61.06], ['Martinique', 14.64, -61.02],
  ['Pointe-à-Pitre', 16.24, -61.53], ['Basse-Terre', 16, -61.73], ['Guadeloupe', 16.25, -61.58], ['Cayenne', 4.94, -52.33], ['Guyane', 4, -53], ['Saint-Denis (Réunion)', -20.88, 55.45],
  ['La Réunion', -21.1, 55.5], ['Mayotte', -12.8, 45.15], ['Haïti', 18.9, -72.3], ['Sainte-Lucie', 13.9, -60.97], ['Dominique', 15.41, -61.37],
  ['Strasbourg', 48.58, 7.75], ['Colmar', 48.08, 7.36], ['Mulhouse', 47.75, 7.34], ['Haguenau', 48.82, 7.79], ['Sélestat', 48.26, 7.45], ['Saverne', 48.74, 7.36], ['Alsace', 48.3, 7.5],
  ['Metz', 49.12, 6.18], ['Nancy', 48.69, 6.18], ['Lorraine', 48.9, 6.2], ['Paris', 48.86, 2.35], ['Île-de-France', 48.7, 2.5], ['Lyon', 45.76, 4.84], ['Marseille', 43.3, 5.37],
  ['Bordeaux', 44.84, -.58], ['Toulouse', 43.6, 1.44], ['Nantes', 47.22, -1.55], ['Lille', 50.63, 3.06], ['Nice', 43.7, 7.27], ['Montpellier', 43.61, 3.88], ['Rennes', 48.11, -1.68],
  ['Brest', 48.39, -4.49], ['Le Havre', 49.49, .11], ['Rouen', 49.44, 1.1], ['Reims', 49.26, 4.03], ['Dijon', 47.32, 5.04], ['Besançon', 47.24, 6.02], ['Grenoble', 45.19, 5.72],
  ['Clermont-Ferrand', 45.78, 3.08], ['Limoges', 45.83, 1.26], ['Tours', 47.39, .69], ['Orléans', 47.9, 1.9], ['Caen', 49.18, -.37], ['Perpignan', 42.69, 2.9], ['Ajaccio', 41.92, 8.74],
  ['Bastia', 42.7, 9.45], ['Corse', 42.15, 9.1], ['Bretagne', 48.2, -2.9], ['Normandie', 49.1, -.3], ['Provence', 43.9, 5.9], ['Bourgogne', 47.1, 4.6], ['Auvergne', 45.6, 3.1],
  ['Belgique', 50.6, 4.6], ['Bruxelles', 50.85, 4.35], ['Suisse', 46.8, 8.2], ['Genève', 46.2, 6.14], ['Bâle', 47.56, 7.59], ['Luxembourg', 49.61, 6.13], ['Allemagne', 51, 10.3],
  ['Fribourg-en-Brisgau', 48, 7.85], ['Karlsruhe', 49, 8.4], ['Stuttgart', 48.78, 9.18], ['Berlin', 52.52, 13.4], ['Italie', 42.8, 12.5], ['Rome', 41.9, 12.5], ['Naples', 40.85, 14.27],
  ['Espagne', 40.2, -3.7], ['Madrid', 40.42, -3.7], ['Barcelone', 41.39, 2.17], ['Portugal', 39.6, -8], ['Lisbonne', 38.72, -9.14], ['Royaume-Uni', 52.8, -1.5], ['Londres', 51.51, -.13],
  ['Irlande', 53.3, -8], ['Pologne', 52, 19.4], ['Varsovie', 52.23, 21.01], ['Ukraine', 49, 31.4], ['Russie', 56, 38], ['Arménie', 40.2, 44.9], ['Turquie', 39, 35], ['Grèce', 39.3, 22],
  ['Liban', 33.9, 35.8], ['Algérie', 35, 3], ['Alger', 36.75, 3.06], ['Oran', 35.7, -.63], ['Maroc', 32, -6.5], ['Casablanca', 33.57, -7.59], ['Tunisie', 35.5, 9.8], ['Tunis', 36.8, 10.18],
  ['Sénégal', 14.5, -14.5], ['Dakar', 14.72, -17.47], ['Mali', 14, -4], ['Côte d’Ivoire', 7.6, -5.5], ['Cameroun', 5.7, 12.4], ['Congo', -1, 15.5], ['Bénin', 9.3, 2.3],
  ['Madagascar', -19, 46.7], ['Comores', -11.7, 43.3], ['Inde', 22, 79], ['Pondichéry', 11.94, 79.83], ['Chine', 35, 104], ['Viêt Nam', 16, 107.8], ['Cambodge', 12.5, 105],
  ['Japon', 36.2, 138.2], ['Canada', 56, -100], ['Québec', 46.81, -71.21], ['Montréal', 45.5, -73.57], ['États-Unis', 39.5, -98.5], ['New York', 40.71, -74], ['Brésil', -10, -52],
  ['Argentine', -34.6, -64], ['Mexique', 23.6, -102.5], ['Australie', -25.3, 133.8], ['Nouvelle-Calédonie', -21.3, 165.5], ['Tahiti', -17.65, -149.43], ['France', 46.6, 2.4]
];
function trouverLieu(texte) {
  const t = sansAccent(texte).replace(/[’']/g, ' ');
  if (!t) return null;
  const perso = S.lieux.find(l => sansAccent(l.nom) === t);
  if (perso) return { nom: perso.nom, lat: perso.lat, lon: perso.lon, perso: true };
  let meilleur = null;
  REPERTOIRE_LIEUX.forEach(([nom, lat, lon]) => {
    const n = sansAccent(nom).replace(/[’']/g, ' ').replace(/ \(.*\)$/, '');
    if (new RegExp('(^|[^a-z])' + n.replace(/[-]/g, '[- ]') + '([^a-z]|$)').test(t) && (!meilleur || n.length > meilleur.n)) meilleur = { nom, lat, lon, n: n.length };
  });
  if (meilleur) return meilleur;
  const perso2 = S.lieux.find(l => t.includes(sansAccent(l.nom)));
  return perso2 ? { nom: perso2.nom, lat: perso2.lat, lon: perso2.lon, perso: true } : null;
}

/* ============================================================
   Les fichiers (photos, documents, voix) : dans la base du navigateur
   (IndexedDB), jamais envoyés ailleurs.
   ============================================================ */
const BASE = 'naoroots-fichiers';
let baseP = null;
function base() {
  if (!baseP) baseP = new Promise((ok, ko) => {
    try { const r = indexedDB.open(BASE, 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }
    catch (e) { ko(e); }
  });
  return baseP;
}
function tx(mode, fn) { return base().then(db => new Promise((ok, ko) => { const t = db.transaction('f', mode); const st = t.objectStore('f'); const r = fn(st); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); })); }
const fichierMettre = (id, v) => tx('readwrite', st => st.put(v, id));
const fichierLire = id => tx('readonly', st => st.get(id));
const fichierSuppr = id => tx('readwrite', st => st.delete(id));
const fichiersVider = () => tx('readwrite', st => st.clear());
const blobEnTexte = b => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(b); });
const texteEnBlob = u => fetch(u).then(r => r.blob());
const taille = n => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';

/* Les images affichées à partir de la base : <img data-idb="clé">, remplies après chaque rendu. */
const URLS = new Map();
async function urlDe(cle) {
  if (URLS.has(cle)) return URLS.get(cle);
  const v = await fichierLire(cle).catch(() => null);
  if (!v || !v.blob) return null;
  const u = URL.createObjectURL(v.blob); URLS.set(cle, u); return u;
}
function oublierUrl(cle) { if (URLS.has(cle)) { URL.revokeObjectURL(URLS.get(cle)); URLS.delete(cle); } }
function hydrater(racine = document) {
  $$('img[data-idb]', racine).forEach(async img => {
    const u = await urlDe(img.dataset.idb);
    if (u) img.src = u; else img.replaceWith(Object.assign(document.createElement('span'), { textContent: '🖼️' }));
  });
}
/* L'image d'une photo : dans la base (chez soi) ou déjà intégrée (arbre reçu). */
function imgPhoto(ph, grande) {
  if (!ph) return '🖼️';
  if (ph.vignetteData) return `<img src="${ph.vignetteData}" alt="${esc(ph.legende || '')}" loading="lazy">`;
  const cle = grande ? (ph.amelioree && ph.voirAmelioree !== false ? ph.amelioree : ph.fichier) : (ph.amelioree && ph.voirAmelioree !== false ? ph.amelioree + '-v' : ph.fichier + '-v');
  return `<img data-idb="${esc(cle)}" alt="${esc(ph.legende || '')}" loading="lazy">`;
}
/* Réduire une image : une grande version (1800 px) et une vignette (360 px), en JPEG. */
function chargerImage(src) { return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('image')); i.src = src; }); }
function versCanvas(img, max) {
  const r = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round((img.naturalWidth || img.width) * r)); c.height = Math.max(1, Math.round((img.naturalHeight || img.height) * r));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c;
}
const canvasBlob = (c, q = .86) => new Promise(ok => c.toBlob(ok, 'image/jpeg', q));
async function preparerImage(fichier) {
  const u = URL.createObjectURL(fichier);
  try { const img = await chargerImage(u); return { grande: await canvasBlob(versCanvas(img, 1800)), vignette: await canvasBlob(versCanvas(img, 360), .8), l: img.naturalWidth, h: img.naturalHeight }; }
  finally { URL.revokeObjectURL(u); }
}
/* Un portrait carré de 180 px, gardé dans la fiche. */
async function portrait(fichier) {
  const u = URL.createObjectURL(fichier);
  try {
    const img = await chargerImage(u), c = document.createElement('canvas'), s = Math.min(img.width, img.height);
    c.width = c.height = 180; c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 180, 180);
    return c.toDataURL('image/jpeg', .82);
  } finally { URL.revokeObjectURL(u); }
}

/* ---------- les messages ---------- */
function toast(texte, o = {}) {
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = `<span>${esc(texte)}</span>` + (o.action ? `<button type="button">${esc(o.action)}</button>` : '');
  if (o.action) t.querySelector('button').addEventListener('click', () => { t.remove(); o.fait && o.fait(); });
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), o.duree || (o.action ? 7000 : 3400));
}

/* ---------- la fenêtre ---------- */
let apresFermeture = null;
function ouvrirModale(html, apres, large) {
  const v = $('#modale'), f = $('#modaleFen');
  if (v.classList.contains('ouvert') && apresFermeture) { const a = apresFermeture; apresFermeture = null; a(); }
  f.className = 'fen' + (large ? ' large' : '');
  f.innerHTML = html; v.classList.add('ouvert'); document.body.style.overflow = 'hidden';
  v.scrollTop = 0;
  if (apres) apres(f);
  hydrater(f);
  const p = f.querySelector('[autofocus], input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea');
  if (p) setTimeout(() => p.focus({ preventScroll: true }), 30);
}
function fermerModale() {
  $('#modale').classList.remove('ouvert'); $('#modaleFen').innerHTML = ''; document.body.style.overflow = '';
  if (window.arreterEnregistrement) arreterEnregistrement();
  if (apresFermeture) { const f = apresFermeture; apresFermeture = null; f(); }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) fermerModale(); });
$('#modale').addEventListener('mousedown', e => { if (e.target.id === 'modale') fermerModale(); });

/* Une question claire avant tout geste qui ne se rattrape pas, et avant tout partage ou export. */
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
function telecharger(nom, contenu, type = 'application/json') {
  const b = contenu instanceof Blob ? contenu : new Blob([typeof contenu === 'string' ? contenu : JSON.stringify(contenu)], { type });
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nom; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
const nomFichier = s => sansAccent(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'naoroots';
