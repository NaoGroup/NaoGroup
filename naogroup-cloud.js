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

/* ---------- Le mode visite : essayer un outil sans compte ----------
   On y entre par un lien « …?visite=1 » (section « Essayer sans compte » de l'accueil) et on en sort par
   « ?visite=0 ». L'outil s'ouvre vierge, dans un espace à part (ng:visite:) vidé à chaque nouvelle
   visite : rien n'est envoyé au serveur, rien ne se mélange avec un vrai profil. */
var VISITE = (function () {
  try {
    var q = new URLSearchParams(location.search).get('visite');
    if (q === '1') { sessionStorage.setItem('ng:visite', '1'); return 'neuve'; }
    if (q === '0') { sessionStorage.removeItem('ng:visite'); return false; }
    return sessionStorage.getItem('ng:visite') === '1' ? 'suite' : false;
  } catch (e) { return false; }
})();
/* Une fois la visite commencée, on retire « visite=1 » de l'adresse (le drapeau reste dans sessionStorage) :
   sinon un simple F5 relancerait une visite neuve et effacerait tout ce que le visiteur vient de saisir. */
if (VISITE === 'neuve') {
  try {
    var uv = new URL(location.href); uv.searchParams.delete('visite');
    history.replaceState(history.state, '', uv.pathname + uv.search + uv.hash);
  } catch (e) {}
}

/* ---------- Le catalogue des outils : une seule source pour tout le site ---------- */
var OUTILS = [
  { id: 'naofi',     nom: 'NaoFi',     role: 'Crédit & financement', desc: "Capacité d'emprunt, échéancier, comparaison d'offres.", chemin: 'NaoFi/analyse-dossier-credit.html', symbole: 'l-fi', prefixes: ['naofi', 'analyse-credit'] },
  { id: 'naobudget', nom: 'NaoBudget', role: 'Budget du foyer',      desc: 'Revenus, dépenses, épargne, mois après mois.',          chemin: 'NaoBudget/NaoBudget.html',           symbole: 'l-bu' },
  { id: 'naoplan',   nom: 'NaoPlan',   role: 'Projet immobilier',    desc: "Le logement qu'on cherche, dessiné et coté.",           chemin: 'NaoPlan/NaoPlan.html',               symbole: 'l-pl', maintenance: true },
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
  { id: 'naopet',    nom: 'NaoPets',    role: 'Animaux de compagnie', desc: 'Repas, rappels, rendez-vous, carnet de santé, stock, budget et souvenirs de vos animaux.', chemin: 'NaoPets/NaoPet.html', symbole: 'l-pe' },
  { id: 'naoinvest', nom: 'NaoInvest', role: 'Éducation financière', desc: 'Budget, épargne, impôts et Bourse expliqués simplement, portefeuille fictif en NaoCoins et réflexes anti-arnaques.', chemin: 'NaoInvest/NaoInvest.html', symbole: 'l-in' },
  { id: 'naostudy',  nom: 'NaoStudy',  role: 'Études & devoirs',     desc: 'Emplois du temps, révisions et devoirs de toute la famille.', chemin: 'NaoStudy/NaoStudy.html', symbole: 'l-st' },
  { id: 'naoroots',  nom: 'NaoRoots',  role: 'Généalogie & mémoire familiale', desc: 'Arbre familial, souvenirs, photos et histoires de génération en génération.', chemin: 'NaoRoots/NaoRoots.html', symbole: 'l-ro' }
];
OUTILS.forEach(function (o) { if (!o.prefixes) o.prefixes = [o.id]; });
function outilParId(id) { for (var i = 0; i < OUTILS.length; i++) if (OUTILS[i].id === id) return OUTILS[i]; return null; }
/* Un outil « maintenance: true » est fermé à tout le monde sauf l'administratrice (même en visite, même
   s'il est dans la formule) jusqu'à ce qu'on retire le drapeau. Pour le rouvrir : effacer « maintenance: true ». */
function enMaintenance(id) { var o = outilParId(id); return !!(o && o.maintenance); }
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
/* Seule la session du projet Supabase en service compte : une session laissée par un autre
   projet (essai, changement de projet) ne doit jamais faire ouvrir l'espace d'un autre compte. */
function uidSession() {
  try {
    var ref = String(NAO_SUPABASE_URL).replace(/^https?:\/\//, '').split('.')[0];
    var v = JSON.parse(ORI.get.call(LS, 'sb-' + ref + '-auth-token') || 'null');
    var u = v && (v.user || (v.currentSession && v.currentSession.user));
    if (u && u.id) return u.id;
  } catch (e) {}
  return null;
}
var UID = CONFIGURE && LS && !VISITE ? uidSession() : null;
/* une visite qui commence repart des données d'exemple : on vide l'espace de la visite précédente */
if (VISITE === 'neuve' && LS) {
  try {
    var anciennes = [];
    for (var iv = 0; iv < LS.length; iv++) { var kv = LS.key(iv); if (kv && kv.indexOf('ng:visite:') === 0) anciennes.push(kv); }
    anciennes.forEach(function (k) { ORI.rem.call(LS, k); });
    if (window.indexedDB && indexedDB.databases) indexedDB.databases().then(function (l) {
      l.forEach(function (b) { if (b.name && b.name.indexOf('ng_visite_') === 0) indexedDB.deleteDatabase(b.name); });
    }, function () {});
  } catch (e) {}
}
var CTX = lireCtx();
var ROLE = (CTX && CTX.uid === UID) ? CTX.role : null;

function prefixe() {
  if (VISITE && LS) return 'ng:visite:';
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

if (LS && (CONFIGURE || VISITE)) {
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
window.NaoCtx = { configure: CONFIGURE, uid: UID, role: ROLE, visite: !!VISITE,
  /* en visite, l'outil démarre vierge : les données de départ de certains outils sont personnelles */
  vierge: !!(VISITE || (CONFIGURE && UID && ROLE !== 'admin') || (LS && ORI.get.call(LS, CLE_VIERGE) === '1')) };

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
  if (enMaintenance(outilId)) return false;
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
    /* un client inscrit seul se connecte avec son adresse e-mail ; un profil créé par l'administration, avec son identifiant */
    var id = String(identifiant || '').trim();
    return c.auth.signInWithPassword({ email: id.indexOf('@') > 0 ? id.toLowerCase() : emailDe(id), password: mdp });
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
      /* maintenance générale : seule l'administratrice entre */
      return (p.role === 'admin' ? Promise.resolve({ actif: false }) : maintenance(true)).then(function (m) {
        if (m.actif) return c.auth.signOut().then(function () { return { ok: false, code: 'tampon', statut: 'maintenance', motif: m.motif }; });
        try { ORI.set.call(LS, 'ng:ctx', JSON.stringify({ uid: user.id, role: p.role })); } catch (e) {}
        c.rpc('maj_ma_connexion', { fin_provisoire: false });
        return { ok: true, profil: p, provisoire: !!p.mdp_provisoire };
      });
    });
  });
}
/* ---------- Maintenance générale (Administration → Paramètres) ----------
   Réglage public reglages « maintenance » = { actif, motif, depuis }. Le serveur refuse lui-même les
   données à tout profil sauf l'administratrice (outil_autorise dans supabase-schema.sql) ; ici, on
   l'explique à l'écran. En cas de doute (hors ligne, réglage absent) : pas de maintenance. */
var MOTIF_MAINTENANCE = 'Logiciel en maintenance';
var _maint = null;
/* L'état est rangé à deux endroits par l'administration : une entrée cachée « maintenance » dans le
   réglage des formules (lisible par tous sans rien changer au serveur, comme le tarif « sur-mesure »),
   et le réglage « maintenance » (celui que lit le serveur une fois supabase-schema.sql rejoué). */
function maintenance(frais) {
  if (_maint && !frais) return _maint;
  _maint = client().then(function (c) {
    if (!c) return { actif: false };
    return c.from('reglages').select('cle,valeur').in('cle', ['formules', 'maintenance']).then(function (r) {
      var lignes = (r && r.data) || [], de = function (cle) { return lignes.filter(function (x) { return x.cle === cle; })[0]; };
      var f = de('formules'), m = de('maintenance');
      var e = f && Array.isArray(f.valeur) ? f.valeur.filter(function (x) { return x && x.id === 'maintenance'; })[0] : null;
      var v = (e && e.maintenance) || (m && m.valeur) || {};
      return { actif: !!v.actif, motif: String(v.motif || '').trim() || MOTIF_MAINTENANCE, depuis: v.depuis || null };
    });
  }).catch(function () { return { actif: false }; });
  return _maint;
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
  'background:radial-gradient(1200px 820px at 50% 34%,#7A5AE0 0%,#43309E 42%,#1A1240 100%);color:#F3EFFB;' +
  'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-style:normal}' +
  '#nao-gate .c{max-width:420px;text-align:center;position:relative}' +
  '#nao-gate .j{width:60px;height:60px;border-radius:19px;display:block;margin:0 auto 16px}' +
  '#nao-gate.att .j{animation:nao-pulse 1.4s ease-in-out infinite}' +
  '#nao-gate h2{margin:0 0 8px;font-family:Georgia,serif;font-style:italic;font-size:22px;color:#fff}' +
  '#nao-gate p{margin:0 0 6px;font-size:13.5px;line-height:1.55;color:rgba(243,239,251,.78)}' +
  '#nao-gate .b{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}' +
  '#nao-gate .b a,#nao-gate .b button{font:600 13px -apple-system,"Segoe UI",sans-serif;text-decoration:none;cursor:pointer;color:#fff;' +
  'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:11px 18px}' +
  '#nao-gate .b .p{background:linear-gradient(135deg,#C9B7F5,#8BFFF1);color:#1C1636;border-color:transparent}' +
  '#nao-gate .tampon{display:inline-block;transform:rotate(-6deg);border:3px solid #E58BA0;color:#E58BA0;border-radius:10px;' +
  'padding:6px 16px;font:800 17px -apple-system,"Segoe UI",sans-serif;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 14px}' +
  '#nao-gate .cad{font-size:38px;margin-bottom:10px}' +
  '@keyframes nao-pulse{0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:1;transform:scale(1)}}' +
  '#nao-pastille{position:fixed;right:12px;bottom:12px;z-index:2147482000;display:flex;align-items:center;gap:8px;' +
  'font:600 12px -apple-system,"Segoe UI",sans-serif;font-style:normal;color:#fff;background:rgba(28,22,54,.82);' +
  'border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 8px 6px 12px;backdrop-filter:blur(8px)}' +
  '#nao-pastille a,#nao-pastille button{font:inherit;color:#C9B7F5;background:transparent;border:0;cursor:pointer;text-decoration:none;padding:4px 6px}' +
  '#nao-pastille a:hover,#nao-pastille button:hover{color:#fff}' +
  '#nao-pastille.visite{padding:6px 6px 6px 14px;border-color:rgba(25,240,216,.5);box-shadow:0 10px 30px -10px rgba(25,240,216,.5)}' +
  '#nao-pastille.visite span{color:#8BFFF1}' +
  '#nao-pastille.visite a.p{color:#1A1240;background:linear-gradient(135deg,#6FFFEF,#A77BFF);border-radius:999px;padding:5px 12px}' +
  '#nao-pastille.visite a.p:hover{color:#1A1240;filter:brightness(1.08)}' +
  /* en visite, la pastille se range en bas à gauche : à droite, elle recouvrait le bouton « Enregistrer » des fenêtres ;
     sur un écran étroit ou zoomé, elle se réduit à « ✦ Visite » et ne déplie ses liens qu'au survol ou au clavier */
  '#nao-pastille.visite{right:auto;left:12px}' +
  '#nao-pastille.visite .court{display:none}' +
  '@media (max-width:1100px){#nao-pastille.visite{padding:6px 12px}' +
  '#nao-pastille.visite .court{display:inline}#nao-pastille.visite .long{display:none}' +
  '#nao-pastille.visite:not(:hover):not(:focus-within) a{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}' +
  '@media print{#nao-gate,#nao-pastille{display:none!important}}';
var SVG_JETON = '<svg class="j" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ng-g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#19F0D8"/><stop offset=".48" stop-color="#8A5CFF"/><stop offset="1" stop-color="#E99BFF"/></linearGradient></defs>' +
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
   L'administratrice est mesurée aussi : elle utilise NaoGroup pour elle-même. */
function demarrerMesure(c, p) {
  if (!UID || !OUTIL_PAGE) return;
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

/* la pastille du mode visite : on sait qu'on visite, et on sait comment demander un vrai accès */
function poserPastilleVisite() {
  if (document.getElementById('nao-pastille')) return;
  var st = document.getElementById('nao-gate-css');
  if (!st) { st = document.createElement('style'); st.id = 'nao-gate-css'; st.textContent = CSS_GARDE; (document.head || document.documentElement).appendChild(st); }
  var o = outilParId(OUTIL_PAGE);
  var d = document.createElement('div'); d.id = 'nao-pastille'; d.className = 'visite';
  d.innerHTML = '<span title="Essai libre : rien n\'est enregistré">✦ <span class="long">Mode visite</span><span class="court">Visite</span></span>' +
    '<a class="p" href="' + esc(url('contact.html') + '?objet=' + encodeURIComponent('Accès ' + (o ? o.nom : 'NaoGroup'))) + '">Demander un accès</a>' +
    '<a href="' + esc(url('NaoGroup.html') + '?visite=0') + '">Quitter</a>';
  document.body.appendChild(d);
}

function refuserMaintenance() {
  var o = outilParId(OUTIL_PAGE);
  refuser({ icone: '🛠️', titre: (o ? o.nom : 'Cet outil') + ' est en maintenance',
    texte: 'Il est en cours de préparation et rouvrira très bientôt. Vos données sont conservées.',
    boutons: [{ href: url('NaoGroup.html'), libelle: '← Retour à NaoGroup' }] });
}
/* maintenance générale : le rideau tombe avec le motif choisi par l'administratrice */
function refuserMaintenanceGenerale(m) {
  poserRideau();
  refuser({ tampon: 'Maintenance', titre: 'NaoGroup est en maintenance',
    texte: m.motif + ' — personne ne peut ouvrir les outils pour le moment. Vos données sont conservées : vous retrouverez tout à la réouverture.',
    boutons: [{ libelle: 'Réessayer', fn: function () { location.reload(); } }, { href: url('NaoGroup.html'), libelle: '← Retour à NaoGroup' }] });
}
/* un outil déjà ouvert quand la maintenance commence : on revérifie toutes les 2 minutes et au retour sur l'onglet */
function surveillerMaintenance() {
  var verifier = function () {
    if (document.hidden || document.getElementById('nao-gate')) return;
    maintenance(true).then(function (m) { if (m.actif) refuserMaintenanceGenerale(m); });
  };
  setInterval(verifier, 2 * 60 * 1000);
  document.addEventListener('visibilitychange', verifier);
}
function garde() {
  if (!OUTIL_PAGE) return;
  /* en visite, personne n'est connecté : un outil en maintenance reste fermé */
  if (VISITE && enMaintenance(OUTIL_PAGE)) { poserRideau(); refuserMaintenance(); return; }
  if (VISITE) {                         /* visite : ni connexion, ni droits, ni synchronisation */
    poserPastilleVisite();
    if (CONFIGURE) { maintenance().then(function (m) { if (m.actif) refuserMaintenanceGenerale(m); }); surveillerMaintenance(); }
    return;
  }
  if (!CONFIGURE) return;               /* pas encore branché : l'outil reste en local, comme avant */
  poserRideau();
  var c, p, maint;
  client().then(function (cl) { c = cl; return Promise.all([c.auth.getSession(), maintenance()]); }).then(function (rr) {
    var r = rr[0]; maint = rr[1];
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
      if (maint.actif && p.role !== 'admin') { refuserMaintenanceGenerale(maint); return 'stop'; }
      if (uidSession() !== UID || ROLE !== p.role) {   /* l'espace de stockage choisi au chargement n'était pas le bon */
        try { ORI.set.call(LS, 'ng:ctx', JSON.stringify({ uid: p.user_id, role: p.role })); } catch (e) {}
        var g = 'ng:ctxrecharge'; var dernier = 0;
        try { dernier = parseInt(sessionStorage.getItem(g) || '0', 10); sessionStorage.setItem(g, String(Date.now())); } catch (e) {}
        if (Date.now() - dernier > 8000) { location.reload(); return 'stop'; }
      }
      if (p.mdp_provisoire) { vers('connexion.html'); return 'stop'; }
      if (enMaintenance(OUTIL_PAGE) && p.role !== 'admin') { refuserMaintenance(); return 'stop'; }
      if (!aAcces(p, OUTIL_PAGE)) {
        var o = outilParId(OUTIL_PAGE);
        var exp = abonnementExpire(p);
        var essaiFini = exp && !Number((p.abonnement || {}).prix);
        refuser({ titre: essaiFini ? 'Votre essai gratuit est terminé' : exp ? 'Votre abonnement est arrivé à échéance' : (o ? o.nom : 'Cet outil') + " n'est pas inclus dans votre formule",
          texte: exp ? 'Choisissez une formule pour rouvrir vos outils : vos données sont conservées, vous retrouvez tout.' : 'Il existe bien, il vous attend : changez de formule pour l\'ouvrir, sans rien perdre.',
          boutons: [{ href: url('inscription.html'), libelle: 'Choisir une formule' }, retour, sortir] });
        return 'stop';
      }
      return synchroniser(c).then(function (res) {
        if (res === 'recharge') return 'stop';
        synchroFaite = true;
        /* outil en maintenance : sa page reste invisible (verrou CSS dans son <head>) tant que l'admin n'est pas confirmée */
        if (enMaintenance(OUTIL_PAGE) && p.role === 'admin') document.documentElement.classList.add('ng-admin-ok');
        lever(); poserPastille(p); demarrerMesure(c, p);
        if (p.role !== 'admin') surveillerMaintenance();
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

if (OUTIL_PAGE && ((CONFIGURE && !VISITE) || (VISITE && enMaintenance(OUTIL_PAGE)))) poserRideau();
if (OUTIL_PAGE) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', garde); else garde();
}

/* Les pages du site (accueil, connexion, inscription…) : pendant une maintenance générale, un bandeau
   en haut donne le motif et les cartes d'outils de l'accueil sont grisées. L'administratrice voit, elle,
   un rappel avec le lien pour arrêter la maintenance. (L'administration a son propre rappel.) */
function bandeauMaintenance() {
  if (OUTIL_PAGE || !CONFIGURE || /admin\.html$/i.test(location.pathname)) return;
  maintenance().then(function (m) {
    if (!m.actif) return;
    return profil().catch(function () { return null; }).then(function (p) {
      var admin = !!(p && p.role === 'admin');
      var st = document.createElement('style');
      st.textContent =
        '#ng-maint{position:relative;z-index:55;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;text-align:center;' +
        'padding:11px 18px;font:600 13.5px -apple-system,"Segoe UI",Roboto,sans-serif;font-style:normal;line-height:1.45;color:#2A1606;' +
        'background:linear-gradient(135deg,#FFD58A,#F6A96B);box-shadow:0 10px 30px -14px rgba(0,0,0,.6)}' +
        '#ng-maint b{font-weight:800}#ng-maint span{font-weight:500}' +
        '#ng-maint a{color:#2A1606;background:rgba(255,255,255,.55);border-radius:999px;padding:5px 12px;text-decoration:none;font-weight:700}' +
        '#ng-maint a:hover{background:#fff}' +
        'html.ng-maint-generale .outil[data-outil]{filter:grayscale(1);opacity:.45;pointer-events:none}';
      document.head.appendChild(st);
      var d = document.createElement('div'); d.id = 'ng-maint'; d.setAttribute('role', 'status');
      d.innerHTML = admin
        ? '🛠️ <b>Mode maintenance activé</b><span>« ' + esc(m.motif) + ' » — personne d\'autre que vous n\'a accès aux outils.</span>' +
          '<a href="' + esc(url('admin.html')) + '#parametres">Arrêter la maintenance →</a>'
        : '🛠️ <b>NaoGroup est en maintenance</b><span>' + esc(m.motif) + ' — les outils et les comptes sont fermés pour le moment. Vos données sont conservées.</span>';
      document.body.insertBefore(d, document.body.firstChild);
      if (!admin) document.documentElement.classList.add('ng-maint-generale');
    });
  });
}
if (!OUTIL_PAGE && CONFIGURE) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bandeauMaintenance); else bandeauMaintenance();
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
/* Le sur-mesure : le client choisit ses outils un par un. Le tarif à l'unité est rangé dans le
   même réglage que les formules (lisible sans connexion), sous une entrée cachée « sur-mesure ». */
var TARIF_DEFAUT = { base: 2.99, pro: 4.99, outilsPro: ['naofi', 'naofactu'], plafond: true, moisOfferts: 2 };
function lireFormulesBrutes() {
  return client().then(function (c) {
    if (!c) return FORMULES_DEFAUT;
    return c.from('reglages').select('valeur').eq('cle', 'formules').maybeSingle().then(function (r) {
      var f = r.data && r.data.valeur;
      return Array.isArray(f) && f.length ? f : FORMULES_DEFAUT;
    });
  }).catch(function () { return FORMULES_DEFAUT; });
}
function garderPubliques(l) { return l.filter(function (f) { return f.publique !== false && f.id !== 'sur-mesure'; }); }
function lireTarif(l) {
  var e = (l || []).filter(function (f) { return f.id === 'sur-mesure'; })[0];
  return Object.assign({}, TARIF_DEFAUT, (e && e.tarif) || {});
}
function formulesPubliques() { return lireFormulesBrutes().then(garderPubliques); }
/* { formules, tarif } en une seule lecture */
function catalogue() { return lireFormulesBrutes().then(function (l) { return { formules: garderPubliques(l), tarif: lireTarif(l) }; }); }
function arrondi(n) { return Math.round(n * 100) / 100; }
function prixOutil(id, tarif) { return (tarif.outilsPro || []).indexOf(id) >= 0 ? Number(tarif.pro) : Number(tarif.base); }
/* Le prix d'une sélection d'outils : somme à l'unité, plafonnée au prix de la formule qui
   contient tous les outils (Complet), et la formule la moins chère qui les contient tous,
   si elle revient moins cher. */
function prixSurMesure(outils, tarif, formules) {
  var brut = arrondi(outils.reduce(function (s, id) { return s + prixOutil(id, tarif); }, 0));
  var payantes = (formules || []).filter(function (f) { return Number(f.prix) > 0; });
  var contient = function (f) { return outils.every(function (id) { return (f.outils || []).indexOf(id) >= 0; }); };
  var mensuel = brut, plafond = null;
  if (tarif.plafond) {
    var toutes = payantes.filter(function (f) { return (f.outils || []).length >= OUTILS.length; })
      .sort(function (a, b) { return a.prix - b.prix; })[0];
    if (toutes && brut > Number(toutes.prix)) { mensuel = Number(toutes.prix); plafond = toutes; }
  }
  var suggestion = outils.length ? payantes.filter(contient).filter(function (f) { return Number(f.prix) < mensuel; })
    .sort(function (a, b) { return a.prix - b.prix; })[0] || null : null;
  return { brut: brut, mensuel: arrondi(mensuel), annuel: arrondi(mensuel * (12 - (Number(tarif.moisOfferts) || 0))),
    plafond: plafond, suggestion: suggestion };
}

/* ---------- Inscription autonome (voir « INSCRIPTION AUTONOME » dans supabase-schema.sql) ----------
   Le compte est créé avec la vraie adresse e-mail ; Supabase envoie un lien de confirmation.
   Le profil, la formule (essai 14 jours une seule fois par adresse) et la facture éventuelle
   ne naissent qu'au clic sur ce lien, côté serveur : les prix ne viennent jamais de la page. */
function inscription(d) {
  return client().then(function (c) {
    if (!c) return { ok: false, code: 'non_configure' };
    var email = String(d.email || '').trim().toLowerCase();
    if (email.split('@')[1] === NAO_DOMAINE_PROFILS) return { ok: false, code: 'email' };
    return c.auth.signUp({
      email: email, password: d.mdp,
      options: {
        emailRedirectTo: url('connexion.html') + '?confirme=1',
        data: { prenom: d.prenom || '', nom: d.nom || '', espace: d.espace || 'particulier', entreprise: d.entreprise || '',
                formule: d.formule || '', outils: d.outils || [], periode: d.periode === 'annuel' ? 'annuel' : 'mensuel',
                cgu_acceptees_le: new Date().toISOString() }
      }
    }).then(function (r) {
      if (r.error) {
        var m = String(r.error.message || '');
        if (/password/i.test(m)) return { ok: false, code: 'mdp', message: m };
        if (/rate|seconds/i.test(m)) return { ok: false, code: 'attente', message: m };
        if (/signups? not allowed|disabled/i.test(m)) return { ok: false, code: 'ferme', message: m };
        return { ok: false, code: 'autre', message: m };
      }
      return { ok: true };
    });
  }).catch(function (e) { return { ok: false, code: 'autre', message: String(e && e.message || e) }; });
}
/* Le client connecté choisit ou change sa formule ; le serveur refait le calcul et la facture. */
function choisirFormule(formule, outils, periode) {
  return client().then(function (c) {
    if (!c) return { ok: false, code: 'non_configure' };
    return c.rpc('choisir_ma_formule', { formule: formule, outils: outils || [], periode: periode || 'mensuel' }).then(function (r) {
      if (r.error) return { ok: false, code: 'autre', message: r.error.message };
      _profil = null;
      return r.data || { ok: false, code: 'autre' };
    });
  });
}
/* Les témoignages publiés depuis l'administration (de vrais avis, donnés avec l'accord de la personne). */
function temoignages() {
  return client().then(function (c) {
    if (!c) return [];
    return c.from('reglages').select('valeur').eq('cle', 'temoignages').maybeSingle().then(function (r) {
      var l = r.data && r.data.valeur;
      return Array.isArray(l) ? l.filter(function (x) { return x && x.texte && x.publie !== false; }) : [];
    });
  }).catch(function () { return []; });
}

/* Compte une vue d'une page publique (aujourd'hui : « histoire »), lue dans « 📊 Statistiques » de l'administration.
   Une seule fois par onglet, administratrice comprise ; aucun identifiant, rien de personnel (pas de traceur :
   pas de bannière de consentement). Appel direct, sans charger la bibliothèque du serveur. */
function compterVue(page) {
  if (!CONFIGURE || VISITE || location.protocol.indexOf('http') !== 0 || !window.fetch) return;
  try { if (sessionStorage.getItem('ng:vu:' + page)) return; sessionStorage.setItem('ng:vu:' + page, '1'); } catch (e) {}
  var origine = 'autre';
  try { var r = new URL(document.referrer); if (r.host === location.host && /(\/|NaoGroup\.html|index\.html)$/.test(r.pathname)) origine = 'accueil'; } catch (e) {}
  fetch(NAO_SUPABASE_URL + '/rest/v1/rpc/compter_vue', {
    method: 'POST', keepalive: true,
    headers: { 'apikey': NAO_SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + NAO_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_page: page, p_origine: origine })
  }).catch(function () {});
}

/* Le questionnaire « Votre avis sur NaoGroup » (avis.html) : l'avis arrive dans l'administration. */
function envoyerAvis(d) {
  return client().then(function (c) {
    if (!c) return { ok: false, code: 'non_configure' };
    return c.from('avis').insert(d).then(function (r) {
      if (!r.error) return { ok: true };
      /* La table « avis » n'existe pas sur le serveur (SQL jamais rejoué) : la réponse est rangée dans « demandes »,
         marquée periode = 'avis', le questionnaire complet dans « formules ». L'administration la remet avec les avis. */
      if (!/PGRST205|42P01/.test(r.error.code || '') && !/schema cache|does not exist/i.test(r.error.message || '')) return { ok: false, message: r.error.message };
      var resume = 'Recommandation : ' + (d.recommandation == null ? '—' : d.recommandation + '/10') + ' · Outils : ' + (d.outils || []).join(', ');
      return c.from('demandes').insert({ nom: 'Questionnaire de satisfaction', email: 'questionnaire', type: 'autre', sujet: 'Questionnaire de satisfaction',
        periode: 'avis', formules: d, message: resume.slice(0, 4000) })
        .then(function (r2) { return r2.error ? { ok: false, message: r2.error.message } : { ok: true }; });
    });
  }).catch(function (e) { return { ok: false, message: String(e && e.message || e) }; });
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

/* ============================================================
   Le passage entre l'accueil et l'outil
   L'accueil ouvre un outil en déployant sa carte jusqu'au fond de l'écran
   d'ouverture de l'outil : pour que les deux se rejoignent sans saut, l'outil
   note ici le fond qu'il affiche (clair ou sombre) sous « ng:fond:<outil> ».
   Quand on revient à NaoGroup par un lien, l'outil se referme dans ce même
   fond, puis l'accueil le replie dans la carte de l'outil (NaoGroup.html).
   ============================================================ */
(function () {
  if (!OUTIL_PAGE) return;
  var ACCUEIL = [url('NaoGroup.html'), url('index.html'), url('')];
  var CALME = !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.documentElement.animate;
  var DOUX = 'cubic-bezier(.65,0,.25,1)';
  var vide = function (v) { return !v || v === 'none' || v === 'rgba(0, 0, 0, 0)' || v === 'transparent'; };
  function lireJSON(k) { try { return JSON.parse(brut(k) || 'null'); } catch (e) { return null; } }
  function fondActuel() {
    try {
      var racine = getComputedStyle(document.documentElement);
      var el = document.querySelector('#ouverture, .intro'), s = el ? getComputedStyle(el) : null;
      var img = s && !vide(s.backgroundImage) ? s.backgroundImage : racine.getPropertyValue('--fond').trim();
      var col = s && !vide(s.backgroundColor) ? s.backgroundColor : racine.getPropertyValue('--fond-uni').trim();
      return img ? { img: img, col: vide(col) ? '' : col } : null;
    } catch (e) { return null; }
  }
  function noter() {
    var f = fondActuel();
    if (f && LS) try { ORI.set.call(LS, 'ng:fond:' + OUTIL_PAGE, JSON.stringify(f)); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', noter); else noter();
  addEventListener('pagehide', noter);

  /* Le voile du passage : le fond de l'écran d'ouverture, le jeton de 88 px au centre,
     et la lueur à la couleur de l'outil — la même image que celle de l'accueil. */
  function voile(f, avecHalo) {
    var vis = lireJSON('ng:visuel:' + OUTIL_PAGE) || {};
    f = f || { img: 'radial-gradient(1250px 900px at 50% 16%, #6A59BC 0%, #3E3183 42%, #171230 100%)', col: '#171230' };
    var v = document.createElement('div');
    /* au-dessus des rideaux de vérification (#nao-gate, #ngt-gate) : c'est le voile qui attend à leur place */
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483600;pointer-events:auto;background-size:cover;background-position:center;' +
      'background-color:' + (f.col || '#171230') + ';background-image:' + f.img;
    if (avecHalo && vis.c2) {
      var h = document.createElement('div');
      h.style.cssText = 'position:fixed;left:50%;top:50%;width:360px;height:360px;margin:-180px 0 0 -180px;border-radius:50%;opacity:.5;' +
        'filter:blur(8px);background:radial-gradient(circle,' + vis.c2 + ' 0%,transparent 68%)';
      v.appendChild(h);
    }
    /* le décor de l'attente (arrivée seulement) : il n'apparaît qu'après un court instant, pour que
       l'image reprise de l'accueil reste identique quand l'outil s'ouvre vite */
    if (avecHalo) v.appendChild(decor(vis.c2 || '#C39BF3'));
    if (vis.logo) {
      var i = document.createElement('img');
      i.alt = ''; i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(vis.logo);
      i.style.cssText = 'position:fixed;left:50%;top:50%;width:88px;height:88px;margin:-44px 0 0 -44px;border-radius:29px;' +
        'box-shadow:0 18px 40px -14px rgba(10,6,30,.85),0 0 34px -8px ' + (vis.c2 || '#C39BF3');
      v.appendChild(i);
    }
    document.documentElement.appendChild(v);
    return v;
  }

  /* Le décor du voile : une grille de points qui s'estompe, deux lueurs qui dérivent, un anneau
     qui tourne autour du jeton, le nom de l'outil et ce qu'il fait. Tout en styles en ligne
     (le voile passe avant les styles de la page) ; les mouvements, dans une feuille ajoutée une fois. */
  function styleDecor() {
    if (document.getElementById('ng-voile-style')) return;
    var s = document.createElement('style');
    s.id = 'ng-voile-style';
    s.textContent =
      '@keyframes ngvApparait{from{opacity:0}to{opacity:1}}' +
      '@keyframes ngvMonte{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
      '@keyframes ngvTourne{to{transform:rotate(360deg)}}' +
      '@keyframes ngvDerive1{from{transform:translate(-8%,-6%) scale(1)}to{transform:translate(9%,7%) scale(1.15)}}' +
      '@keyframes ngvDerive2{from{transform:translate(7%,5%) scale(1.1)}to{transform:translate(-9%,-8%) scale(.95)}}' +
      '@keyframes ngvTrait{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}' +
      '@keyframes ngvOnde{from{opacity:.55;transform:scale(1)}to{opacity:0;transform:scale(2.6)}}';
    (document.head || document.documentElement).appendChild(s);
  }
  function decor(c2) {
    styleDecor();
    var o = outilParId(OUTIL_PAGE) || {}, nom = o.nom || '', role = o.role || '';
    var d = document.createElement('div');
    d.setAttribute('data-ngv-decor', '');
    d.style.cssText = 'position:fixed;inset:0;pointer-events:none;animation:ngvApparait .7s .22s ease both';
    var lueur = 'position:absolute;width:62vmax;height:62vmax;border-radius:50%;filter:blur(60px);opacity:.32;';
    var anneau = 'position:fixed;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;';
    var nomHTML = /^Nao/.test(nom) ? 'Nao<span style="color:' + c2 + '">' + esc(nom.slice(3)) + '</span>' : esc(nom);
    d.innerHTML =
      '<div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.16) 1px,transparent 1.6px);background-size:26px 26px;' +
        '-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0,transparent 58%);mask-image:radial-gradient(circle at 50% 50%,#000 0,transparent 58%)"></div>' +
      '<div style="' + lueur + 'left:-14vmax;top:-22vmax;background:' + c2 + ';animation:ngvDerive1 9s ease-in-out infinite alternate"></div>' +
      '<div style="' + lueur + 'right:-18vmax;bottom:-26vmax;background:#19F0D8;opacity:.16;animation:ngvDerive2 11s ease-in-out infinite alternate"></div>' +
      /* l'anneau : une piste fine, et un arc lumineux qui en fait le tour */
      '<div style="' + anneau + 'border:1px solid rgba(255,255,255,.12)"></div>' +
      '<div style="' + anneau + 'background:conic-gradient(from 0deg,transparent 0 58%,' + c2 + ' 88%,#fff 99%,transparent 100%);' +
        '-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));' +
        'animation:ngvTourne 1.6s linear infinite"></div>' +
      (nom ? '<div style="position:fixed;left:0;right:0;top:calc(50% + 92px);text-align:center;font-family:Georgia,\'Times New Roman\',serif;font-style:italic;' +
        'font-size:30px;letter-spacing:-.02em;color:#F3EFFB;text-shadow:0 4px 24px rgba(10,6,30,.6);animation:ngvMonte .7s .32s cubic-bezier(.2,.8,.2,1) both">' + nomHTML + '</div>' : '') +
      (role ? '<div style="position:fixed;left:0;right:0;top:calc(50% + 138px);text-align:center;font:600 11px/1 -apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif;' +
        'letter-spacing:.24em;text-transform:uppercase;color:rgba(243,239,251,.55);animation:ngvMonte .7s .45s cubic-bezier(.2,.8,.2,1) both">' + esc(role) + '</div>' : '') +
      /* un trait de chargement sous le nom */
      '<div style="position:fixed;left:50%;top:calc(50% + 166px);width:120px;height:2px;margin-left:-60px;border-radius:2px;overflow:hidden;' +
        'background:rgba(255,255,255,.1);animation:ngvApparait .6s .6s ease both">' +
        '<div style="width:40%;height:100%;border-radius:2px;background:linear-gradient(90deg,transparent,' + c2 + ',#fff);animation:ngvTrait 1.3s ease-in-out infinite"></div></div>';
    return d;
  }
  /* au départ vers l'accueil : deux ondes partent du jeton quand il se pose au centre */
  function ondes(v, c2, delai) {
    styleDecor();
    for (var k = 0; k < 2; k++) {
      var o = document.createElement('div');
      o.style.cssText = 'position:fixed;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:32px;opacity:0;' +
        'border:1.5px solid ' + c2 + ';box-shadow:0 0 24px -4px ' + c2 + ';animation:ngvOnde .5s ' + (delai + k * 110) + 'ms cubic-bezier(.2,.7,.3,1) forwards';
      v.appendChild(o);
    }
  }

  /* Arrivée depuis l'accueil : l'outil s'ouvre sur la dernière image de l'accueil,
     puis le voile se lève sur l'écran d'ouverture de l'outil et le jeton glisse à sa place
     (ou s'efface, si l'outil ne marque pas de jeton). */
  var arrivee = false;
  try { arrivee = sessionStorage.getItem('ng:arrivee') === OUTIL_PAGE; if (arrivee) sessionStorage.removeItem('ng:arrivee'); } catch (e) {}
  /* la vérification du profil est-elle encore en cours ? (rideau du vrai système ou de la phase de test) */
  function verifEnCours() {
    var g = document.getElementById('nao-gate'), t = document.getElementById('ngt-gate');
    return !!((g && g.classList.contains('att')) || (t && !t.querySelector('h2')));
  }
  /* Un outil peut marquer le jeton de son écran d'ouverture avec data-ng-jeton : le jeton du voile
     y glisse alors au lieu de s'effacer. Pendant le voile, <html> porte « ng-arrivee ng-voile »
     (l'outil peut s'en servir pour mettre son ouverture en pause et poser son jeton d'avance). */
  var apresVoile = [];
  /* ngApresVoile(fn) : l'outil y passe le démarrage de son écran d'ouverture (et ses minuteries),
     qui attend ainsi le lever du voile ; sans voile, fn part tout de suite. */
  window.ngApresVoile = function (fn) {
    if (document.documentElement.classList.contains('ng-voile')) apresVoile.push(fn); else fn();
  };
  if (arrivee && !CALME) {
    document.documentElement.classList.add('ng-arrivee', 'ng-voile');
    /* sous le voile, les animations CSS de la page attendent elles aussi */
    var pause = document.createElement('style');
    pause.textContent = 'html.ng-voile body *,html.ng-voile body *::before,html.ng-voile body *::after{animation-play-state:paused!important}';
    document.head.appendChild(pause);
    var va = voile(lireJSON('ng:fond:' + OUTIL_PAGE), true), souffle = null, debut = Date.now();
    var lever = function () {
      /* tant que l'accès se vérifie, le jeton respire au centre ; le voile se lève ensuite (ou sur un refus) */
      if (verifEnCours() && Date.now() - debut < 10000) {
        var j = va.querySelector('img');
        if (j && !souffle && Date.now() - debut > 250)
          souffle = j.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)', opacity: .8 }, { transform: 'scale(1)' }], { duration: 1400, iterations: Infinity, easing: 'ease-in-out' });
        return setTimeout(lever, 60);
      }
      if (souffle) souffle.cancel();
      setTimeout(function () {
        var jt = va.querySelector('img'), h = va.firstChild !== jt ? va.firstChild : null;
        var racine = document.documentElement;
        racine.classList.remove('ng-voile');
        apresVoile.splice(0).forEach(function (fn) { try { fn(); } catch (e) { setTimeout(function () { throw e; }); } });
        var cible = document.querySelector('[data-ng-jeton]'), rc = cible && cible.getBoundingClientRect();
        if (jt && rc && rc.width) {
          /* le jeton sort du voile et glisse jusqu'à sa place dans l'écran d'ouverture
             (data-ng-cache sur un parent : c'est tout ce groupe qui attend son arrivée) */
          var cache = cible.closest('[data-ng-cache]') || cible;
          cache.style.visibility = 'hidden';
          jt.style.zIndex = '2147483601';
          racine.appendChild(jt);
          /* la place se relit à chaque image : si la page bouge encore un peu en démarrant, le jeton suit */
          var t0 = performance.now();
          var pas = function (now) {
            var p = Math.min(1, (now - t0) / 720), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            var r = cible.getBoundingClientRect();
            var dx = r.left + r.width / 2 - racine.clientWidth / 2, dy = r.top + r.height / 2 - racine.clientHeight / 2;
            jt.style.transform = 'translate(' + dx * e + 'px,' + dy * e + 'px) scale(' + (1 + (r.width / 88 - 1) * e) + ')';
            if (p < 1) return requestAnimationFrame(pas);
            cache.style.visibility = '';
            jt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }).onfinish = function () { jt.remove(); };
          };
          requestAnimationFrame(pas);
        } else if (jt) jt.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.82)', opacity: 0 }], { duration: 380, easing: DOUX, fill: 'forwards' });
        if (h) h.animate([{ opacity: .5 }, { opacity: 0 }], { duration: 380, fill: 'forwards' });
        /* le décor s'efface en s'ouvrant, pendant que le jeton part */
        var dc = va.querySelector('[data-ngv-decor]');
        if (dc) dc.animate([{ opacity: getComputedStyle(dc).opacity, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 340, easing: 'ease', fill: 'forwards' });
        va.style.pointerEvents = 'none';
        va.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, delay: 160, easing: 'ease', fill: 'forwards' }).onfinish = function () { va.remove(); };
      }, 80);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lever); else lever();
  }

  /* Départ vers l'accueil : le fond de l'écran d'ouverture monte sur l'outil et le jeton
     revient au centre ; l'accueil reprend cette image et la replie dans la carte.
     Si l'outil marque son logo (barre du haut…) avec data-ng-logo, le jeton part de là
     et glisse jusqu'au centre au lieu d'y apparaître. */
  var vd = null, vjt = null, vsrc = null;
  function logoVisible() {
    var l = document.querySelectorAll('[data-ng-logo]');
    for (var k = 0; k < l.length; k++) {
      var r = l[k].getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < innerHeight && getComputedStyle(l[k]).visibility !== 'hidden') return { el: l[k], r: r };
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self')) return;
    if (ACCUEIL.indexOf(a.href.split('#')[0].split('?')[0]) === -1) return;
    try { sessionStorage.setItem('ng:passage', OUTIL_PAGE); } catch (x) {}
    noter();
    if (CALME) return;
    e.preventDefault();
    vd = voile(fondActuel(), false);
    var vc2 = (lireJSON('ng:visuel:' + OUTIL_PAGE) || {}).c2 || '#C39BF3';
    vd.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: 'ease', fill: 'forwards' });
    var jt = vd.querySelector('img'), src = jt && logoVisible(), duree = 440;
    if (src) {
      var racine = document.documentElement, rs = src.r;
      var dx = rs.left + rs.width / 2 - racine.clientWidth / 2, dy = rs.top + rs.height / 2 - racine.clientHeight / 2;
      jt.style.zIndex = '2147483601';
      racine.appendChild(jt);
      src.el.style.visibility = 'hidden';
      vjt = jt; vsrc = src.el;
      jt.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + (rs.width / 88) + ')' }, { transform: 'translate(0,0) scale(1)' }],
        { duration: 720, easing: DOUX, fill: 'forwards' });
      duree = 900;
      ondes(vd, vc2, 400);
    } else if (jt) {
      jt.animate([{ transform: 'scale(.82)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: DOUX, fill: 'forwards' });
      ondes(vd, vc2, 200);
      duree = 720;
    }
    var dest = a.href;
    setTimeout(function () { location.href = dest; }, duree);
  });
  /* revenu dans l'outil par le bouton Suivant : on retire le voile resté en place */
  addEventListener('pageshow', function (e) {
    if (e.persisted && vd) { vd.remove(); vd = null; }
    if (e.persisted && vjt) { vjt.remove(); vjt = null; if (vsrc) vsrc.style.visibility = ''; vsrc = null; }
  });
})();

/* ============================================================
   L'envol de sortie : quand l'écran d'ouverture d'un outil s'en va (son animation
   « …Sort » démarre, au bout du temps ou au clic), son jeton glisse jusqu'au logo
   de l'en-tête, et les textes de l'intro qu'on retrouve à l'identique dans l'en-tête
   (le nom de l'outil, sa phrase) glissent jusqu'à leur place. Rien à ajouter dans
   les outils : l'intro est #intro (ou #nf-intro), le jeton [data-ng-jeton], le logo
   [data-ng-logo]. Les outils qui font déjà voler leur jeton (NaoDaily, NaoLang, NaoPets)
   ne sortent pas par une animation « …Sort » et ne sont donc pas concernés.
   ============================================================ */
(function () {
  if (!OUTIL_PAGE || !document.documentElement.animate) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var INTRO = '#intro, #nf-intro';
  var SAUF = /^(animation|transition|transform|translate|rotate|scale|position|top|left|right|bottom|inset|margin|z-index|will-change|offset|visibility|perspective|contain|content-visibility|cursor|pointer-events|view-transition)/;
  function norm(t) { return (t || '').replace(/\s+/g, ' ').trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none';
  }
  /* la copie garde l'apparence exacte (styles calculés), sans dépendre des règles « .intro … » */
  function copier(src) {
    var c = src.cloneNode(true);
    (function suivre(s, d, haut) {
      if (!s || !d || s.nodeType !== 1) return;
      var cs = getComputedStyle(s);
      for (var i = 0; i < cs.length; i++) {
        var p = cs[i];
        if (SAUF.test(p) || (haut && p === 'opacity')) continue;
        try { d.style.setProperty(p, cs.getPropertyValue(p)); } catch (e) {}
      }
      d.style.animation = 'none'; d.style.transition = 'none';
      if (!haut) d.style.transform = cs.transform;
      ['id', 'data-ng-jeton', 'data-ng-logo', 'data-ng-cache'].forEach(function (a) { d.removeAttribute(a); });
      for (var k = 0; k < s.children.length; k++) suivre(s.children[k], d.children[k], false);
    })(src, c, true);
    c.setAttribute('aria-hidden', 'true');
    return c;
  }
  var doux = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };

  /* un vol : la copie (du logo de l'en-tête pour le jeton, du texte de l'intro sinon) part de la place
     de « depart » et rejoint « cible », dont la place est relue à chaque image (l'en-tête monte encore) */
  function voler(depart, cachee, cible, o) {
    var a = depart.getBoundingClientRect();
    if (!a.width) return;
    var modele = o.jeton ? cible : depart, m = modele.getBoundingClientRect();
    var c = copier(modele);
    var w = m.width, h = m.height;
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var s0 = o.jeton ? a.width / w : 1;
    var s1 = o.jeton ? 1 : (parseFloat(getComputedStyle(cible).fontSize) / parseFloat(getComputedStyle(depart).fontSize) || 1);
    var st = c.style;
    st.position = 'fixed'; st.margin = '0'; st.zIndex = '2147483000'; st.pointerEvents = 'none';
    st.boxSizing = 'border-box'; st.width = w + 'px'; st.height = h + 'px';
    st.left = (o.texte ? a.left : ax - w / 2) + 'px'; st.top = (ay - h / 2) + 'px';
    st.transformOrigin = o.texte ? 'left center' : 'center';
    if (o.texte) st.whiteSpace = 'nowrap';
    st.transform = 'scale(' + s0 + ')';
    st.willChange = 'transform, opacity';
    document.documentElement.appendChild(c);
    if (cachee) cachee.style.visibility = 'hidden';
    cible.style.visibility = 'hidden';
    /* pas de jeton dans l'intro : le logo naît à côté du titre et part aussitôt */
    if (o.apparait) c.animate([{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: o.duree * .35, easing: 'ease-out', fill: 'backwards' });
    var fin = false;
    var ranger = function () { if (fin) return; fin = true; c.remove(); cible.style.visibility = ''; };
    setTimeout(ranger, o.duree + o.delai + 1600);          /* filet : onglet en arrière-plan, images gelées */
    var t0 = performance.now() + o.delai;
    var pas = function (now) {
      if (fin) return;
      var p = Math.max(0, Math.min(1, (now - t0) / o.duree)), e = doux(p);
      var b = cible.getBoundingClientRect(), dx, dy;
      if (o.texte) dx = b.left - a.left; else dx = b.left + b.width / 2 - ax;
      dy = b.top + b.height / 2 - ay;
      var s = o.jeton ? s0 + (b.width / w - s0) * e : 1 + (s1 - 1) * e;
      st.transform = 'translate(' + dx * e + 'px,' + (dy * e - o.arc * Math.sin(Math.PI * e)) + 'px) scale(' + s + ')';
      if (p < 1) return requestAnimationFrame(pas);
      /* posé : l'original apparaît sous la copie, qui s'efface */
      cible.style.visibility = '';
      cible.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease' });
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = ranger;
    };
    requestAnimationFrame(pas);
  }

  /* l'en-tête : le plus grand parent du logo qui reste une bande (pas la page entière) */
  function enTete(logo) {
    var z = logo, p = logo.parentElement, max = Math.max(innerHeight * .4, 240);
    for (var k = 0; k < 6 && p && p !== document.body; k++, p = p.parentElement) {
      if (p.getBoundingClientRect().height > max) break;
      z = p;
    }
    return z;
  }
  /* les textes de l'intro qu'on retrouve, mot pour mot, dans l'en-tête (le nom, la phrase) */
  function paires(intro, zone, jeton) {
    var cibles = [], tous = zone.querySelectorAll('*'), i, k;
    for (i = 0; i < tous.length; i++) {
      var t = norm(tous[i].textContent), el = tous[i];
      /* tous les éléments, parents compris : pour un même texte, le premier (le plus englobant) gagne */
      if (t.length < 4 || t.length > 90 || el.closest('svg') || !visible(el)) continue;
      cibles.push({ el: el, t: t });
    }
    var res = [], pris = [], src = intro.querySelectorAll('*');
    for (i = 0; i < src.length && res.length < 3; i++) {
      var s = src[i];
      if (s.closest('svg') || (jeton && s.contains(jeton)) || pris.some(function (x) { return x.contains(s); })) continue;
      var ts = norm(s.textContent);
      if (ts.length < 4 || ts.length > 90) continue;
      for (k = 0; k < cibles.length; k++) {
        if (!cibles[k].pris && cibles[k].t === ts && visible(s) && opaque(s, intro) &&
            !res.some(function (x) { return x.dst.contains(cibles[k].el) || cibles[k].el.contains(x.dst); })) {
          cibles[k].pris = true; pris.push(s); res.push({ src: affiner(s), dst: affiner(cibles[k].el) });
          break;
        }
      }
    }
    return res;
  }
  /* l'élément qui porte vraiment le texte : on descend tant qu'un seul enfant le contient tout entier
     (le nom dans une feuille de CV, plutôt que la feuille et ses lignes vides) */
  function affiner(el) {
    for (var t = norm(el.textContent), k = 0; k < 8; k++) {
      var suivant = null;
      for (var i = 0; i < el.children.length; i++) if (norm(el.children[i].textContent) === t) { suivant = el.children[i]; break; }
      if (!suivant || !visible(suivant)) break;
      el = suivant;
    }
    return el;
  }
  /* vraiment à l'écran : ni lui ni un de ses parents (jusqu'à l'intro) n'est transparent */
  function opaque(el, haut) {
    for (var x = el; x && x !== haut; x = x.parentElement) if (+getComputedStyle(x).opacity < .05) return false;
    return true;
  }
  function premierVisible(sel, sauf) {
    var l = document.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) if (!sauf.contains(l[i]) && visible(l[i])) return l[i];
    return null;
  }

  function envol(intro, vite) {
    if (!intro || intro.__ngEnvol) return;
    intro.__ngEnvol = true;
    var logo = premierVisible('[data-ng-logo]', intro);
    if (!logo) return;
    var d = vite ? 560 : 860;
    var j = intro.querySelector('[data-ng-jeton]');
    if (j && visible(j)) {
      /* ce qu'on cache pendant le vol : le groupe qui attendait le jeton, ou le dessin qui le contient */
      var cache = j.closest('[data-ng-cache]') || (j.tagName.toLowerCase() !== 'svg' && j.ownerSVGElement) || j;
      voler(j, cache, logo, { jeton: true, duree: d, delai: 0, arc: 26 });
    } else j = null;
    var pp = paires(intro, enTete(logo), j);
    if (!j) {
      /* pas de jeton dans l'intro : le logo apparaît juste à gauche du nom de l'outil (comme dans l'en-tête),
         ou au centre de l'écran, et glisse lui aussi jusqu'à sa place */
      var t = pp[0] && pp[0].src.getBoundingClientRect(), cote, cx, cy;
      if (t) { cote = Math.max(44, Math.min(84, t.height * 1.5)); cx = t.left - cote * .75; cy = t.top + t.height / 2; }
      else { cote = 84; cx = innerWidth / 2; cy = innerHeight / 2; }
      var place = { left: cx - cote / 2, top: cy - cote / 2, width: cote, height: cote };
      voler({ getBoundingClientRect: function () { return place; } }, null, logo, { jeton: true, apparait: true, duree: d, delai: 0, arc: 26 });
    }
    pp.forEach(function (p, k) {
      voler(p.src, p.src, p.dst, { texte: true, duree: d, delai: 50 * (k + 1), arc: Math.max(0, 14 - 6 * k) });
    });
  }
  document.addEventListener('animationstart', function (e) {
    var it = e.target;
    if (!it || !it.matches || !it.matches(INTRO) || !/sort/i.test(e.animationName)) return;
    envol(it, (parseFloat(getComputedStyle(it).animationDuration) || .8) < .6);
  }, true);
  window.ngEnvol = envol;
})();

/* ============================================================
   Confort commun à tous les outils (suite du banc d'essai du 18/11/2026)
   1. L'animation d'ouverture ne se joue en entier qu'à la première ouverture de l'outil dans la
      session : ensuite elle se passe d'elle-même, par le même chemin qu'un clic sur l'intro.
      Échap, Entrée ou Espace la passent aussi, à tout moment.
   2. Une étiquette posée juste avant son champ (<label>Prénom</label><input>) lui est reliée :
      cliquer sur l'intitulé place le curseur dans la case, et les lecteurs d'écran l'annoncent.
      Les fenêtres dessinées plus tard sont suivies (MutationObserver).
   ============================================================ */
(function () {
  if (!OUTIL_PAGE) return;
  var INTRO = '#intro, #nf-intro';
  function intro() {
    var el = document.querySelector(INTRO);
    if (!el || !el.isConnected || el.hidden) return null;
    return el.getBoundingClientRect().width ? el : null;
  }
  function passer() { var el = intro(); if (el) el.click(); }
  var deja = false;
  try { var cleIntro = 'ng:intro-vue:' + OUTIL_PAGE; deja = sessionStorage.getItem(cleIntro) === '1'; sessionStorage.setItem(cleIntro, '1'); } catch (e) {}

  var n = 0, prevu = false;
  function relier() {
    prevu = false;
    var ls = document.querySelectorAll('label:not([for])');
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i], c = l.nextElementSibling;
      if (l.querySelector('input,select,textarea,button') || !c || !c.matches('input:not([type=hidden]),select,textarea')) continue;
      if (!c.id) c.id = 'ng-champ-' + (++n);
      l.htmlFor = c.id;
    }
  }
  function bientot() { if (!prevu) { prevu = true; (window.requestAnimationFrame || setTimeout)(relier); } }

  function armer() {
    if (deja) (window.ngApresVoile || function (f) { f(); })(function () {
      setTimeout(passer, 300);
      setTimeout(passer, 1600);   /* filet : un outil qui branche son clic d'intro un peu plus tard */
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && intro()) { e.preventDefault(); passer(); }
    });
    relier();
    try { new MutationObserver(bientot).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armer); else armer();
})();

/* La protection contre la copie (naogroup-protection.js) suit chaque page qui charge ce fichier,
   outils compris, sans avoir à toucher à chaque outil. */
(function () {
  if (window.NaoProtection || document.querySelector('script[src*="naogroup-protection.js"]')) return;
  var s = document.createElement('script'); s.src = url('naogroup-protection.js');
  (document.head || document.documentElement).appendChild(s);
})();

/* ---------- Ce que les pages du site utilisent ---------- */
window.Nao = {
  formulesDefaut: FORMULES_DEFAUT, formulesPubliques: formulesPubliques, catalogue: catalogue, tarifDefaut: TARIF_DEFAUT,
  prixOutil: prixOutil, prixSurMesure: prixSurMesure, lireTarif: lireTarif, envoyerDemande: envoyerDemande, reinitialiserTout: reinitialiserTout,
  inscription: inscription, choisirFormule: choisirFormule, temoignages: temoignages, dureeEssai: 14, envoyerAvis: envoyerAvis, compterVue: compterVue,
  configure: CONFIGURE, outils: OUTILS, outilParId: outilParId, url: url, client: client,
  session: session, profil: profil, connexion: connexion, deconnexion: deconnexion, changerMotDePasse: changerMotDePasse,
  aAcces: aAcces, enMaintenance: enMaintenance, abonnementExpire: abonnementExpire, emailDe: emailDe, normIdentifiant: normIdentifiant,
  identifiantPropose: identifiantPropose, motDePasseProvisoire: motDePasseProvisoire, sansAccent: sansAccent, esc: esc,
  domaine: NAO_DOMAINE_PROFILS, visite: !!VISITE, maintenance: maintenance, motifMaintenance: MOTIF_MAINTENANCE
};
})();
