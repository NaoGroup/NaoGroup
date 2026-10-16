/* ============================================================
   NaoGroup Cloud — les profils, l'accès outil par outil et la sauvegarde
   propre à chaque profil. Un seul fichier partagé par tout le site.

   Dans un outil : une seule ligne, dans le <head> —
     <script src="../naogroup-cloud.js" data-outil="naobudget"></script>

   À remplir UNE fois, après avoir suivi GUIDE-SUPABASE.html : l'URL du
   projet et la clé « anon public ». Ces deux valeurs ne sont pas secrètes ;
   la vraie protection, ce sont les règles posées dans supabase-schema.sql.
   ============================================================ */
(function () {
'use strict';

/* ---------- À REMPLIR ---------- */
var NAO_SUPABASE_URL = 'https://gikduxruofhkrtykjpgj.supabase.co';
var NAO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpa2R1eHJ1b2Zoa3J0eWtqcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MjI2OTUsImV4cCI6MjEwNzQ5ODY5NX0.0Sun4RyL0FHQugmOLO0uAmWHAKnWNMyUzCcKmLTEHYc';
var NAO_DOMAINE_PROFILS = 'profils.naogroup.fr';   /* adresse fictive derrière chaque identifiant */
var NAO_SUPABASE_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
/* ------------------------------- */

var CONFIGURE = NAO_SUPABASE_URL.indexOf('VOTRE-PROJET') === -1 && NAO_SUPABASE_ANON_KEY.indexOf('VOTRE-CLE') === -1;
var SCRIPT = document.currentScript;
var OUTIL_PAGE = SCRIPT ? (SCRIPT.getAttribute('data-outil') || '') : '';
var RACINE = (function () { try { return new URL('.', SCRIPT.src).href; } catch (e) { return ''; } })();

/* ---------- Le catalogue des outils : une seule source pour tout le site ---------- */
var OUTILS = [
  { id: 'naofi',     nom: 'NaoFi',     role: 'Crédit & financement', desc: "Capacité d'emprunt, échéancier, comparaison d'offres.", chemin: 'NaoFi/analyse-dossier-credit.html', symbole: 'l-fi', prefixes: ['naofi', 'analyse-credit'] },
  { id: 'naobudget', nom: 'NaoBudget', role: 'Budget du foyer',      desc: 'Revenus, dépenses, épargne, mois après mois.',          chemin: 'NaoBudget/NaoBudget.html',           symbole: 'l-bu' },
  { id: 'naoplan',   nom: 'NaoPlan',   role: 'Projet immobilier',    desc: "Le logement qu'on cherche, dessiné et coté.",           chemin: 'NaoPlan/NaoPlan.html',               symbole: 'l-pl' },
  { id: 'naoagenda', nom: 'NaoAgenda', role: 'Rendez-vous & dates',  desc: 'Tâches, échéances et anniversaires, au bon moment.',    chemin: 'NaoAgenda/NaoAgenda.html',           symbole: 'l-ag' },
  { id: 'naoastro',  nom: 'NaoAstro',  role: 'Ciel & horoscope',     desc: 'Thème natal, horoscope, carte du jour.',                chemin: 'NaoAstro/NaoAstro.html',             symbole: 'l-as' },
  { id: 'naolang',   nom: 'NaoLang',   role: 'Langues',              desc: 'Leçons courtes, révision intelligente, A1 à C2.',       chemin: 'NaoLang/NaoLang.html',               symbole: 'l-la' },
  { id: 'naofactu',  nom: 'NaoFactu',  role: 'Factures & activité',  desc: 'Devis, factures, paiements, dépenses, contrats.',       chemin: 'NaoFactu/NaoFactu.html',             symbole: 'l-fa' },
  { id: 'naobaby',   nom: 'NaoBaby',   role: 'Grossesse & bébé',     desc: 'Semaines, rendez-vous, baby shower, naissance et souvenirs.', chemin: 'NaoBaby/NaoBaby.html',       symbole: 'l-ba' },
  { id: 'naowedding', nom: 'NaoWedding', role: 'Mariage',            desc: 'Budget, invités, plan de table, faire-part et jour J.', chemin: 'NaoWedding/NaoWedding.html', symbole: 'l-we' },
  { id: 'naotrip',   nom: 'NaoTrip',   role: 'Voyages & sorties',    desc: 'Planning, réservations, valise, budget partagé et globe des pays visités.', chemin: 'NaoTrip/NaoTrip.html', symbole: 'l-tr' },
  { id: 'naodoc',    nom: 'NaoDoc',    role: 'Documents de la famille', desc: 'Les documents du foyer, triés par personne et par thème.', chemin: 'NaoDoc/NaoDoc.html', symbole: 'l-do' },
  { id: 'naodaily',  nom: 'NaoDaily',  role: 'Organisation du quotidien', desc: 'Listes, menus & courses, cadeaux & occasions, réunis dans « Aujourd’hui ».', chemin: 'NaoDaily/NaoDaily.html', symbole: 'l-da' },
  { id: 'naocv',     nom: 'NaoCV',     role: 'CV & candidatures',    desc: 'CV guidé et personnalisé, version ATS, lettres de motivation et suivi des candidatures.', chemin: 'NaoCV/NaoCV.html', symbole: 'l-cv' },
  { id: 'naosante',  nom: 'NaoSanté',  role: 'Bien-être & santé',    desc: 'Hydratation, sommeil, activité, habitudes, rendez-vous et rappels de santé.', chemin: 'NaoSanté/NaoSante.html', symbole: 'l-sa' },
  { id: 'naopet',    nom: 'NaoPets',    role: 'Animaux de compagnie', desc: 'Repas, rappels, rendez-vous, carnet de santé, stock, budget et souvenirs de vos animaux.', chemin: 'NaoPet/NaoPet.html', symbole: 'l-pe' },
  { id: 'naoinvest', nom: 'NaoInvest', role: 'Éducation financière', desc: 'Budget, épargne, impôts et Bourse expliqués simplement, portefeuille fictif en NaoCoins et réflexes anti-arnaques.', chemin: 'NaoInvest/NaoInvest.html', symbole: 'l-in' },
  { id: 'naostudy',  nom: 'NaoStudy',  role: 'Études & devoirs',     desc: 'Emplois du temps, révisions et devoirs de toute la famille.', chemin: 'NaoStudy/NaoStudy.html', symbole: 'l-st' },
  { id: 'naoroots',  nom: 'NaoRoots',  role: 'Généalogie & mémoire familiale', desc: 'Arbre familial, souvenirs, photos et histoires de génération en génération.', chemin: 'NaoRoots/NaoRoots.html', symbole: 'l-ro' }
];
OUTILS.forEach(function (o) { if (!o.prefixes) o.prefixes = [o.id]; });
function outilParId(id) { for (var i = 0; i < OUTILS.length; i++) if (OUTILS[i].id === id) return OUTILS[i]; return null; }
function outilDeCle(nom) {
  for (var i = 0; i < OUTILS.length; i++) for (var j = 0; j < OUTILS[i].prefixes.length; j++)
    if (nom.indexOf(OUTILS[i].prefixes[j]) === 0) return OUTILS[i].id;
  return '';
}

/* ============================================================
   1. Un stockage par profil
   Tous les outils écrivent dans localStorage. Chaque profil reçoit son
   propre espace : deux personnes sur le même ordinateur ne voient jamais
   les données l'une de l'autre, et un nouveau profil trouve tout vierge.
   L'administratrice garde l'espace d'origine (ses données déjà saisies).
   ============================================================ */
var LS = null, ORI = {};
try {
  LS = window.localStorage;
  ORI.get = Storage.prototype.getItem; ORI.set = Storage.prototype.setItem; ORI.rem = Storage.prototype.removeItem;
  ORI.get.call(LS, 'ng:sonde');
} catch (e) { LS = null; }

function brut(k) { try { return ORI.get.call(LS, k); } catch (e) { return null; } }
function lireCtx() { try { return JSON.parse(brut('ng:ctx') || 'null'); } catch (e) { return null; } }
function uidSession() {
  try {
    for (var i = 0; i < LS.length; i++) {
      var k = LS.key(i);
      if (/^sb-.+-auth-token$/.test(k)) {
        var v = JSON.parse(ORI.get.call(LS, k));
        var u = v && (v.user || (v.currentSession && v.currentSession.user));
        if (u && u.id) return u.id;
      }
    }
  } catch (e) {}
  return null;
}
var UID = CONFIGURE && LS ? uidSession() : null;
var CTX = lireCtx();
var ROLE = (CTX && CTX.uid === UID) ? CTX.role : null;

function prefixe() {
  if (!CONFIGURE || !LS) return null;
  if (!UID) return 'ng:anon:';
  if (ROLE === 'admin') return '';
  return 'ng:' + UID + ':';
}
function reserve(k) { return k.indexOf('ng:') === 0 || k.indexOf('sb-') === 0; }
function cle(k) {
  k = String(k);
  var p = prefixe();
  return (p === null || reserve(k)) ? k : p + k;
}

var IDB_DEL = null;           /* la vraie suppression de base IndexedDB, avant que le stockage par profil ne la préfixe */
var synchroFaite = false;     /* les écritures du démarrage de l'outil ne comptent pas comme des modifications */
var minuteurPush = null;
function noterModif(k) {
  if (!OUTIL_PAGE || !synchroFaite || !UID || reserve(String(k))) return;
  var proprio = outilDeCle(String(k));
  if (!proprio) return;
  try { ORI.set.call(LS, 'ng:dirty:' + UID + ':' + proprio, '1'); } catch (e) {}
  /* un outil qui écrit chez un autre (NaoAgenda qui met à jour un rendez-vous de NaoPets) :
     l'outil propriétaire est marqué « à envoyer » et poussera à sa prochaine ouverture */
  if (proprio !== OUTIL_PAGE) return;
  clearTimeout(minuteurPush);
  minuteurPush = setTimeout(pousser, 2500);
}

if (LS && CONFIGURE) {
  Storage.prototype.getItem = function (k) { return this === LS ? ORI.get.call(this, cle(k)) : ORI.get.call(this, k); };
  Storage.prototype.setItem = function (k, v) { if (this === LS) { noterModif(k); return ORI.set.call(this, cle(k), v); } return ORI.set.call(this, k, v); };
  Storage.prototype.removeItem = function (k) { if (this === LS) { noterModif(k); return ORI.rem.call(this, cle(k)); } return ORI.rem.call(this, k); };
  /* les bases IndexedDB (NaoFi, NaoFactu) suivent le même principe */
  try {
    var pIdb = function (nom) { var p = prefixe(); return (!p) ? nom : p.replace(/:/g, '_') + nom; };
    var idbOpen = IDBFactory.prototype.open, idbDel = IDBFactory.prototype.deleteDatabase;
    IDB_DEL = idbDel;
    IDBFactory.prototype.open = function (nom, v) { return arguments.length > 1 ? idbOpen.call(this, pIdb(nom), v) : idbOpen.call(this, pIdb(nom)); };
    IDBFactory.prototype.deleteDatabase = function (nom) { return idbDel.call(this, pIdb(nom)); };
  } catch (e) {}
}

/* Ce que les outils peuvent lire pour démarrer vierge ou non. */
/* « Vierge » : un profil client, ou n'importe qui après avoir réinitialisé tous ses outils. */
var CLE_VIERGE = 'ng:vierge:' + (UID || 'local');
window.NaoCtx = { configure: CONFIGURE, uid: UID, role: ROLE,
  vierge: !!((CONFIGURE && UID && ROLE !== 'admin') || (LS && ORI.get.call(LS, CLE_VIERGE) === '1')) };

/* ============================================================
   2. Accès au serveur
   ============================================================ */
var _lib = null, _client = null;
function chargerLib() {
  if (_lib) return _lib;
  _lib = new Promise(function (ok, ko) {
    if (window.supabase && window.supabase.createClient) return ok();
    var s = document.createElement('script');
    s.src = NAO_SUPABASE_LIB; s.onload = function () { ok(); };
    s.onerror = function () { ko(new Error('lib')); };
    document.head.appendChild(s);
  });
  return _lib;
}
function client() {
  if (!CONFIGURE) return Promise.resolve(null);
  if (_client) return Promise.resolve(_client);
  return chargerLib().then(function () {
    _client = window.supabase.createClient(NAO_SUPABASE_URL, NAO_SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    return _client;
  });
}
function url(chemin) { return RACINE + (chemin || ''); }

/* ---------- Identifiants : « nom_p », comme dans NaoFi ---------- */
function sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function normIdentifiant(s) { return sansAccent(s).trim().replace(/\s+/g, ''); }
function identifiantPropose(prenom, nom) {
  var n = sansAccent(nom).replace(/[^a-z0-9-]/g, '');
  var p = sansAccent(prenom).replace(/[^a-z0-9]/g, '').charAt(0);
  return n && p ? n + '_' + p : (n || p);
}
function emailDe(identifiant) { return normIdentifiant(identifiant) + '@' + NAO_DOMAINE_PROFILS; }
function motDePasseProvisoire() {
  var a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', v = new Uint32Array(10), r = '';
  (window.crypto || window.msCrypto).getRandomValues(v);
  for (var i = 0; i < v.length; i++) r += a[v[i] % a.length];
  return r;
}

/* ---------- Profil, droits, abonnement ---------- */
function profilDe(c, uid) {
  return c.from('profils').select('*').eq('user_id', uid).maybeSingle().then(function (r) { return r.data || null; });
}
function abonnementExpire(p) {
  if (!p || p.role === 'admin') return false;
  var f = p.abonnement && p.abonnement.fin;
  return !!f && new Date(f + 'T23:59:59') < new Date();
}
function aAcces(p, outilId) {
  if (!p) return false;
  if (p.role === 'admin') return true;
  return p.statut === 'actif' && !abonnementExpire(p) && (p.outils || []).indexOf(outilId) >= 0;
}

/* ---------- Connexion : mêmes règles que NaoFi ---------- */
function attenteRestante() {
  try {
    var t = parseInt(sessionStorage.getItem('ng:attente') || '0', 10);
    return Math.max(0, Math.ceil((t - Date.now()) / 1000));
  } catch (e) { return 0; }
}
function noterEchec() {
  try {
    var n = parseInt(sessionStorage.getItem('ng:echecs') || '0', 10) + 1;
    sessionStorage.setItem('ng:echecs', String(n));
    if (n >= 5) sessionStorage.setItem('ng:attente', String(Date.now() + Math.min(60, (n - 4) * 5) * 1000));
  } catch (e) {}
}
function effacerEchecs() { try { sessionStorage.removeItem('ng:echecs'); sessionStorage.removeItem('ng:attente'); } catch (e) {} }

function connexion(identifiant, mdp) {
  var att = attenteRestante();
  if (att > 0) return Promise.resolve({ ok: false, code: 'attente', secondes: att });
  var c;
  return client().then(function (cl) {
    c = cl;
    return c.auth.signInWithPassword({ email: emailDe(identifiant), password: mdp });
  }).then(function (r) {
    if (r.error || !r.data || !r.data.session) { noterEchec(); return { ok: false, code: 'identifiants' }; }
    effacerEchecs();
    var user = r.data.session.user;
    return profilDe(c, user.id).then(function (p) {
      if (!p) return c.auth.signOut().then(function () { return { ok: false, code: 'inconnu' }; });
      /* le mot de passe est bon : c'est seulement maintenant que le tampon s'abat */
      if (p.statut !== 'actif') {
        return c.auth.signOut().then(function () { return { ok: false, code: 'tampon', statut: p.statut, motif: p.motif || '' }; });
      }
      try { ORI.set.call(LS, 'ng:ctx', JSON.stringify({ uid: user.id, role: p.role })); } catch (e) {}
      c.rpc('maj_ma_connexion', { fin_provisoire: false });
      return { ok: true, profil: p, provisoire: !!p.mdp_provisoire };
    });
  });
}
function changerMotDePasse(nouveau) {
  return client().then(function (c) {
    return c.auth.updateUser({ password: nouveau }).then(function (r) {
      if (r.error) return { ok: false, message: r.error.message };
      return c.rpc('maj_ma_connexion', { fin_provisoire: true }).then(function () { return { ok: true }; });
    });
  });
}
function deconnexion(redirection) {
  return client().then(function (c) { return c ? c.auth.signOut() : null; }).then(function () {
    try { ORI.rem.call(LS, 'ng:ctx'); } catch (e) {}
    if (redirection !== false) location.href = url('connexion.html');
  });
}
function session() {
  return client().then(function (c) { return c ? c.auth.getSession() : { data: { session: null } }; })
    .then(function (r) { return (r.data && r.data.session) || null; });
}
var _profil = null;
function profil() {
  if (_profil) return Promise.resolve(_profil);
  return session().then(function (s) {
    if (!s) return null;
    return client().then(function (c) { return profilDe(c, s.user.id); }).then(function (p) {
      _profil = p;
      if (p) { try { ORI.set.call(LS, 'ng:ctx', JSON.stringify({ uid: p.user_id, role: p.role })); } catch (e) {} }
      return p;
    });
  });
}

/* ============================================================
   3. Synchronisation : la sauvegarde suit le profil, sur tous ses appareils
   ============================================================ */
var TAILLE_MAX = 1500000;
function clesDeLOutil(outilId) {
  var pre = prefixe() || '', res = {}, o = outilParId(outilId);
  if (!o || !LS) return res;
  for (var i = 0; i < LS.length; i++) {
    var k = LS.key(i);
    if (pre && k.indexOf(pre) !== 0) continue;
    var nom = pre ? k.slice(pre.length) : k;
    if (reserve(nom) || outilDeCle(nom) !== outilId) continue;
    var v = ORI.get.call(LS, k);
    if (v != null && v.length <= TAILLE_MAX) res[nom] = v;
  }
  return res;
}
function pousser() {
  if (!OUTIL_PAGE || !UID) return Promise.resolve();
  return client().then(function (c) {
    var maintenant = new Date().toISOString();
    return c.from('donnees_outils').upsert({
      user_id: UID, outil: OUTIL_PAGE, data: { cles: clesDeLOutil(OUTIL_PAGE) }, updated_at: maintenant
    }).then(function (r) {
      if (!r.error) {
        try { ORI.set.call(LS, 'ng:sync:' + UID + ':' + OUTIL_PAGE, maintenant); ORI.rem.call(LS, 'ng:dirty:' + UID + ':' + OUTIL_PAGE); } catch (e) {}
      }
    });
  });
}
function synchroniser(c) {
  var mSync = 'ng:sync:' + UID + ':' + OUTIL_PAGE, mDirty = 'ng:dirty:' + UID + ':' + OUTIL_PAGE;
  return c.from('donnees_outils').select('data,updated_at').eq('user_id', UID).eq('outil', OUTIL_PAGE).maybeSingle()
    .then(function (r) {
      var ligne = r.data, marqueur = brut(mSync), sale = brut(mDirty) === '1';
      var locales = clesDeLOutil(OUTIL_PAGE), aDesDonnees = Object.keys(locales).length > 0;
      if (!ligne) { return aDesDonnees ? pousser() : null; }
      if (sale) return pousser();
      if (marqueur === ligne.updated_at) return null;
      /* le serveur est plus récent : il fait foi */
      var pre = prefixe() || '', cles = (ligne.data && ligne.data.cles) || {};
      Object.keys(locales).forEach(function (n) { ORI.rem.call(LS, pre + n); });
      Object.keys(cles).forEach(function (n) { ORI.set.call(LS, pre + n, cles[n]); });
      ORI.set.call(LS, mSync, ligne.updated_at);
      var garde = 'ng:recharge:' + OUTIL_PAGE, dernier = 0;
      try { dernier = parseInt(sessionStorage.getItem(garde) || '0', 10); sessionStorage.setItem(garde, String(Date.now())); } catch (e) {}
      if (Date.now() - dernier > 10000) { location.reload(); return 'recharge'; }
      return null;
    });
}

/* ============================================================
   4. La garde d'un outil : connexion, statut, droits
   ============================================================ */
var CSS_GARDE =
  '#nao-gate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;' +
  'background:radial-gradient(1200px 820px at 50% 34%,#7564C2 0%,#43358A 42%,#1C1636 100%);color:#F3EFFB;' +
  'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-style:normal}' +
  '#nao-gate .c{max-width:420px;text-align:center;position:relative}' +
  '#nao-gate .j{width:60px;height:60px;border-radius:19px;display:block;margin:0 auto 16px}' +
  '#nao-gate.att .j{animation:nao-pulse 1.4s ease-in-out infinite}' +
  '#nao-gate h2{margin:0 0 8px;font-family:Georgia,serif;font-style:italic;font-size:22px;color:#fff}' +
  '#nao-gate p{margin:0 0 6px;font-size:13.5px;line-height:1.55;color:rgba(243,239,251,.78)}' +
  '#nao-gate .b{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}' +
  '#nao-gate .b a,#nao-gate .b button{font:600 13px -apple-system,"Segoe UI",sans-serif;text-decoration:none;cursor:pointer;color:#fff;' +
  'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:11px 18px}' +
  '#nao-gate .b .p{background:linear-gradient(135deg,#C9B7F5,#EBDFFD);color:#1C1636;border-color:transparent}' +
  '#nao-gate .tampon{display:inline-block;transform:rotate(-6deg);border:3px solid #E58BA0;color:#E58BA0;border-radius:10px;' +
  'padding:6px 16px;font:800 17px -apple-system,"Segoe UI",sans-serif;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 14px}' +
  '#nao-gate .cad{font-size:38px;margin-bottom:10px}' +
  '@keyframes nao-pulse{0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:1;transform:scale(1)}}' +
  '#nao-pastille{position:fixed;right:12px;bottom:12px;z-index:2147482000;display:flex;align-items:center;gap:8px;' +
  'font:600 12px -apple-system,"Segoe UI",sans-serif;font-style:normal;color:#fff;background:rgba(28,22,54,.82);' +
  'border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 8px 6px 12px;backdrop-filter:blur(8px)}' +
  '#nao-pastille a,#nao-pastille button{font:inherit;color:#C9B7F5;background:transparent;border:0;cursor:pointer;text-decoration:none;padding:4px 6px}' +
  '#nao-pastille a:hover,#nao-pastille button:hover{color:#fff}' +
  '@media print{#nao-gate,#nao-pastille{display:none!important}}';
var SVG_JETON = '<svg class="j" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ng-g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#6F55D0"/><stop offset="1" stop-color="#C39BF3"/></linearGradient></defs>' +
  '<rect width="40" height="40" rx="13" fill="url(#ng-g)"/><path d="M12 27V11L28 25V9.5" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<g fill="#fff" opacity=".6"><circle cx="10.5" cy="31.5" r="1.9"/><circle cx="16.3" cy="33.2" r="1.9"/><circle cx="22.4" cy="33.2" r="1.9"/><circle cx="28.2" cy="31.5" r="1.9"/></g></svg>';
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function poserRideau() {
  if (document.getElementById('nao-gate')) return;
  var st = document.createElement('style'); st.id = 'nao-gate-css'; st.textContent = CSS_GARDE;
  (document.head || document.documentElement).appendChild(st);
  var d = document.createElement('div'); d.id = 'nao-gate'; d.className = 'att';
  d.innerHTML = '<div class="c">' + SVG_JETON + '<p>Vérification de votre profil…</p></div>';
  document.documentElement.appendChild(d);
}
function lever() { var d = document.getElementById('nao-gate'); if (d) d.remove(); }
function refuser(opt) {
  var d = document.getElementById('nao-gate'); if (!d) return;
  d.className = '';
  var b = (opt.boutons || []).map(function (x, i) {
    return x.href ? '<a class="' + (i === 0 ? 'p' : '') + '" href="' + esc(x.href) + '">' + esc(x.libelle) + '</a>'
                  : '<button type="button" data-a="' + i + '" class="' + (i === 0 ? 'p' : '') + '">' + esc(x.libelle) + '</button>';
  }).join('');
  d.innerHTML = '<div class="c">' + (opt.tampon ? '<div class="tampon">' + esc(opt.tampon) + '</div>' : '<div class="cad">' + (opt.icone || '🔒') + '</div>') +
    '<h2>' + esc(opt.titre) + '</h2><p>' + esc(opt.texte || '') + '</p><div class="b">' + b + '</div></div>';
  (opt.boutons || []).forEach(function (x, i) {
    var el = d.querySelector('[data-a="' + i + '"]'); if (el && x.fn) el.addEventListener('click', x.fn);
  });
}
function poserPastille(p) {
  if (document.getElementById('nao-pastille')) return;
  var d = document.createElement('div'); d.id = 'nao-pastille';
  d.innerHTML = '<span>' + esc(p.prenom || p.identifiant) + '</span><a href="' + esc(url('NaoGroup.html')) + '">NaoGroup</a><button type="button">Déconnexion</button>';
  d.querySelector('button').addEventListener('click', function () { deconnexion(); });
  document.body.appendChild(d);
}

/* Mesure d'usage : seulement QUAND et COMBIEN DE TEMPS un outil est ouvert — jamais ce qu'on y fait.
   Le temps ne compte que si l'onglet est visible et qu'une action a eu lieu dans la dernière minute.
   L'administratrice n'est pas mesurée. */
function demarrerMesure(c, p) {
  if (!UID || !OUTIL_PAGE || p.role === 'admin') return;
  var sid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); });
  var debut = new Date().toISOString(), actifS = 0, derniere = Date.now(), aEnvoyer = true;
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function (e) {
    window.addEventListener(e, function () { derniere = Date.now(); }, { passive: true, capture: true });
  });
  setInterval(function () {
    if (document.visibilityState === 'visible' && Date.now() - derniere < 60000) { actifS += 5; aEnvoyer = true; }
  }, 5000);
  function envoyer() {
    if (!aEnvoyer || actifS < 5) return;
    aEnvoyer = false;
    c.from('usage_outils').upsert({ user_id: UID, session_id: sid, outil: OUTIL_PAGE, debut: debut, fin: new Date().toISOString(), duree_s: actifS })
      .then(function () {}, function () {});
  }
  setInterval(envoyer, 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') envoyer(); });
  window.addEventListener('pagehide', envoyer);
}

function vers(page) { location.replace(url(page) + '?retour=' + encodeURIComponent(location.href)); }

function garde() {
  if (!OUTIL_PAGE) return;
  if (!CONFIGURE) return;               /* pas encore branché : l'outil reste en local, comme avant */
  poserRideau();
  var c, p;
  client().then(function (cl) { c = cl; return c.auth.getSession(); }).then(function (r) {
    var s = r.data && r.data.session;
    if (!s) { vers('connexion.html'); return 'stop'; }
    return profilDe(c, s.user.id).then(function (pr) {
      p = pr; _profil = pr;
      var retour = { href: url('NaoGroup.html'), libelle: '← Retour à NaoGroup' };
      var sortir = { libelle: 'Se connecter avec un autre profil', fn: function () { deconnexion(); } };
      if (!p) { refuser({ titre: 'Profil introuvable', texte: "Ce compte n'est pas rattaché à un profil NaoGroup. Contactez NaoGroup.", boutons: [retour, sortir] }); return 'stop'; }
      if (p.statut !== 'actif') {
        refuser({ tampon: p.statut === 'bloque' ? 'Accès bloqué' : 'Accès suspendu', titre: p.statut === 'bloque' ? 'Votre accès est bloqué' : 'Votre accès est suspendu',
          texte: p.motif || 'Contactez NaoGroup pour le rétablir.', boutons: [{ href: url('contact.html'), libelle: 'Contacter NaoGroup' }, sortir] });
        return 'stop';
      }
      if (uidSession() !== UID || ROLE !== p.role) {   /* l'espace de stockage choisi au chargement n'était pas le bon */
        try { ORI.set.call(LS, 'ng:ctx', JSON.stringify({ uid: p.user_id, role: p.role })); } catch (e) {}
        var g = 'ng:ctxrecharge'; var dernier = 0;
        try { dernier = parseInt(sessionStorage.getItem(g) || '0', 10); sessionStorage.setItem(g, String(Date.now())); } catch (e) {}
        if (Date.now() - dernier > 8000) { location.reload(); return 'stop'; }
      }
      if (p.mdp_provisoire) { vers('connexion.html'); return 'stop'; }
      if (!aAcces(p, OUTIL_PAGE)) {
        var o = outilParId(OUTIL_PAGE);
        var exp = abonnementExpire(p);
        refuser({ titre: exp ? 'Votre abonnement est arrivé à échéance' : (o ? o.nom : 'Cet outil') + " n'est pas inclus dans votre abonnement",
          texte: exp ? 'Contactez NaoGroup pour le renouveler : vos données sont conservées.' : 'Il existe bien, il vous attend : demandez son ouverture à NaoGroup.',
          boutons: [{ href: url('contact.html') + '?objet=' + encodeURIComponent('Accès ' + (o ? o.nom : OUTIL_PAGE)), libelle: "Demander l'accès" }, retour, sortir] });
        return 'stop';
      }
      return synchroniser(c).then(function (res) {
        if (res === 'recharge') return 'stop';
        synchroFaite = true;
        lever(); poserPastille(p); demarrerMesure(c, p);
      });
    });
  }).catch(function (e) {
    console.warn('NaoGroup : vérification impossible', e);
    refuser({ icone: '📡', titre: 'Connexion impossible', texte: 'NaoGroup ne parvient pas à vérifier votre profil. Vérifiez votre connexion internet, puis réessayez.',
      boutons: [{ libelle: 'Réessayer', fn: function () { location.reload(); } }, { href: url('NaoGroup.html'), libelle: 'Retour à NaoGroup' }] });
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && synchroFaite && UID && brut('ng:dirty:' + UID + ':' + OUTIL_PAGE) === '1') pousser();
  });
}

if (OUTIL_PAGE && CONFIGURE) poserRideau();
if (OUTIL_PAGE) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', garde); else garde();
}

/* ============================================================
   5. Formules, demandes de contact, réinitialisation
   ============================================================ */
var FORMULES_DEFAUT = [
  { id: 'essai',         nom: 'Essai gratuit', prix: 0,  outils: ['naoagenda'] },
  { id: 'particulier',   nom: 'Particulier',   prix: 5,  outils: ['naobudget', 'naoplan', 'naoagenda', 'naoastro', 'naolang', 'naobaby', 'naowedding', 'naocv', 'naopet', 'naoinvest', 'naostudy', 'naoroots'] },
  { id: 'professionnel', nom: 'Professionnel', prix: 12, outils: ['naofi', 'naofactu', 'naoagenda', 'naolang'] },
  { id: 'complet',       nom: 'Complet',       prix: 15, outils: OUTILS.map(function (o) { return o.id; }) },
  { id: 'offert',        nom: 'Offert',        prix: 0,  outils: [], publique: false }
];
function formulesPubliques() {
  var garder = function (l) { return l.filter(function (f) { return f.publique !== false; }); };
  return client().then(function (c) {
    if (!c) return garder(FORMULES_DEFAUT);
    return c.from('reglages').select('valeur').eq('cle', 'formules').maybeSingle().then(function (r) {
      var f = r.data && r.data.valeur;
      return garder(Array.isArray(f) && f.length ? f : FORMULES_DEFAUT);
    });
  }).catch(function () { return garder(FORMULES_DEFAUT); });
}

/* Envoie une demande de la page Contact : elle arrive dans l'administration. */
function envoyerDemande(d) {
  return client().then(function (c) {
    if (!c) return { ok: false, code: 'non_configure' };
    return c.from('demandes').insert(d).then(function (r) { return r.error ? { ok: false, message: r.error.message } : { ok: true }; });
  }).catch(function (e) { return { ok: false, message: String(e && e.message || e) }; });
}

/* Vide TOUS les outils de la personne connectée (ou de cet ordinateur, hors connexion) :
   ses données locales, ses bases du navigateur et ses sauvegardes dans le compte.
   Ses autres appareils se vident à leur prochaine ouverture. */
function supprimerBases(pre) {
  if (!window.indexedDB || !indexedDB.databases) return Promise.resolve();
  var supp = IDB_DEL || IDBFactory.prototype.deleteDatabase, p = pre ? pre.replace(/:/g, '_') : '';
  return indexedDB.databases().then(function (l) {
    return Promise.all(l.filter(function (b) {
      var n = b.name || '';
      return p ? n.indexOf(p) === 0 : outilDeCle(n) !== '';
    }).map(function (b) {
      return new Promise(function (ok) {
        try { var r = supp.call(indexedDB, b.name); r.onsuccess = r.onerror = r.onblocked = function () { ok(); }; setTimeout(ok, 2500); } catch (e) { ok(); }
      });
    }));
  }).catch(function () {});
}
function reinitialiserTout() {
  var pre = prefixe() || '', uid = UID, retirer = [];
  if (LS) {
    for (var i = 0; i < LS.length; i++) {
      var k = LS.key(i);
      if (pre && k.indexOf(pre) !== 0) continue;
      var nom = pre ? k.slice(pre.length) : k;
      if (!reserve(nom) && outilDeCle(nom)) retirer.push(k);
    }
    retirer.forEach(function (k) { ORI.rem.call(LS, k); });
    if (uid) OUTILS.forEach(function (o) { ORI.rem.call(LS, 'ng:dirty:' + uid + ':' + o.id); });
    ORI.set.call(LS, CLE_VIERGE, '1');    /* les outils repartent d'une page blanche, jamais d'un jeu d'exemple */
  }
  return supprimerBases(pre).then(function () {
    if (!CONFIGURE || !uid) return { ok: true, outils: retirer.length };
    return client().then(function (c) {
      var maintenant = new Date().toISOString();
      return Promise.all(OUTILS.map(function (o) {
        return c.from('donnees_outils').upsert({ user_id: uid, outil: o.id, data: { cles: {} }, updated_at: maintenant })
          .then(function (r) { if (!r.error) ORI.set.call(LS, 'ng:sync:' + uid + ':' + o.id, maintenant); });
      }));
    }).then(function () { return { ok: true, outils: retirer.length }; }, function () { return { ok: true, outils: retirer.length, cloud: false }; });
  });
}

/* ---------- Ce que les pages du site utilisent ---------- */
window.Nao = {
  formulesDefaut: FORMULES_DEFAUT, formulesPubliques: formulesPubliques, envoyerDemande: envoyerDemande, reinitialiserTout: reinitialiserTout,
  configure: CONFIGURE, outils: OUTILS, outilParId: outilParId, url: url, client: client,
  session: session, profil: profil, connexion: connexion, deconnexion: deconnexion, changerMotDePasse: changerMotDePasse,
  aAcces: aAcces, abonnementExpire: abonnementExpire, emailDe: emailDe, normIdentifiant: normIdentifiant,
  identifiantPropose: identifiantPropose, motDePasseProvisoire: motDePasseProvisoire, sansAccent: sansAccent, esc: esc,
  domaine: NAO_DOMAINE_PROFILS
};
})();
