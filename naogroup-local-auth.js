/* ============================================================
   NaoGroup — comptes de test LOCAUX, pour la phase bêta seulement.

   Reprend exactement la mécanique de NaoFi : identifiant + mot de passe,
   empreinte PBKDF2-SHA-256 salée (jamais le mot de passe en clair), code
   de secours pour la créatrice, mot de passe provisoire pour chaque
   testeuse, tampon « Accès suspendu / bloqué ». Tout reste dans ce
   navigateur (localStorage) : AUCUN serveur, contrairement au vrai
   système de profils NaoGroup (naogroup-cloud.js + Supabase).

   À RETIRER quand Supabase sera en service : supprimer ce fichier,
   connexion-test.html, admin-test.html, et la ligne
   <script src="../naogroup-local-auth.js" data-outil="...">
   dans le <head> de chaque outil. Ce fichier s'efface tout seul si
   naogroup-cloud.js signale que le vrai système est déjà branché
   (Nao.configure === true) : les deux ne se marchent jamais dessus.

   Dans un outil : une seule ligne, dans le <head> —
     <script src="../naogroup-local-auth.js" data-outil="naofactu"></script>
   ============================================================ */
(function () {
'use strict';

/* Le vrai système a priorité : s'il est branché, ce module de test se tait. */
if (window.Nao && window.Nao.configure) return;

var SCRIPT = document.currentScript;
var OUTIL_PAGE = SCRIPT ? (SCRIPT.getAttribute('data-outil') || '') : '';
var RACINE = (function () { try { return new URL('.', SCRIPT.src).href; } catch (e) { return ''; } })();
function url(chemin) { return RACINE + (chemin || ''); }

var CLE_COMPTES = 'ng-test-comptes';
var CLE_SESSION = 'ng-test-session';
var PBKDF2_TOURS = 150000;
var SECRET_LEURRE = { sel: 'AAAAAAAAAAAAAAAAAAAAAA==', empreinte: '-', tours: PBKDF2_TOURS };

/* ---------- Le catalogue des outils couverts par les comptes de test : tous les
   outils de NaoGroup, dans le même ordre que sur la page d'accueil. ---------- */
var OUTILS_TEST = [
  { id: 'naofi', nom: 'NaoFi' },
  { id: 'naobudget', nom: 'NaoBudget' },
  { id: 'naoplan', nom: 'NaoPlan' },
  { id: 'naoagenda', nom: 'NaoAgenda' },
  { id: 'naoastro', nom: 'NaoAstro' },
  { id: 'naolang', nom: 'NaoLang' },
  { id: 'naofactu', nom: 'NaoFactu' },
  { id: 'naobaby', nom: 'NaoBaby' },
  { id: 'naowedding', nom: 'NaoWedding' },
  { id: 'naotrip', nom: 'NaoTrip' },
  { id: 'naodoc', nom: 'NaoDoc' },
  { id: 'naodaily', nom: 'NaoDaily' },
  { id: 'naocv', nom: 'NaoCV' },
  { id: 'naosante', nom: 'NaoSanté' },
  { id: 'naopet', nom: 'NaoPet' },
  { id: 'naoinvest', nom: 'NaoInvest' },
  { id: 'naostudy', nom: 'NaoStudy' },
  { id: 'naoroots', nom: 'NaoRoots' }
];

/* ---------- Identifiants et mots de passe, comme dans NaoFi ---------- */
function sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function normIdentifiant(s) { return sansAccent(s).trim(); }
function identifiantPropose(prenom, nom) {
  var n = sansAccent(nom).replace(/[^a-z0-9-]/g, '');
  var p = sansAccent(prenom).replace(/[^a-z0-9]/g, '').charAt(0);
  return n && p ? n + '_' + p : (n || p);
}
function tirage(alphabet, n) {
  var v = new Uint32Array(n);
  (window.crypto || window.msCrypto).getRandomValues(v);
  return Array.from(v, function (x) { return alphabet[x % alphabet.length]; }).join('');
}
function motDePasseProvisoire() { return tirage('abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10); }
function codeSecours() { return (tirage('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 16).match(/.{4}/g) || []).join('-'); }
function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

/* ---------- Empreintes : jamais le mot de passe lui-même, seulement son empreinte ---------- */
function chiffrementDisponible() { return !!(window.crypto && crypto.subtle && crypto.getRandomValues && window.TextEncoder); }
function versB64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
function depuisB64(s) { return Uint8Array.from(atob(s), function (ch) { return ch.charCodeAt(0); }); }
function empreinteMdp(mdp, sel, tours) {
  if (!chiffrementDisponible()) return Promise.reject(new Error('crypto'));
  return crypto.subtle.importKey('raw', new TextEncoder().encode(String(mdp)), 'PBKDF2', false, ['deriveBits'])
    .then(function (cle) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: depuisB64(sel), iterations: tours || PBKDF2_TOURS }, cle, 256); })
    .then(versB64);
}
function protegerMdp(mdp) {
  var s = new Uint8Array(16);
  crypto.getRandomValues(s);
  var sel = versB64(s);
  return empreinteMdp(mdp, sel, PBKDF2_TOURS).then(function (empreinte) { return { sel: sel, empreinte: empreinte, tours: PBKDF2_TOURS }; });
}
function egalConstant(a, b) {
  a = String(a); b = String(b);
  var r = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return r === 0;
}
function verifierMdp(mdp, secret) { return empreinteMdp(mdp, secret.sel, secret.tours).then(function (e) { return egalConstant(e, secret.empreinte); }); }

/* ---------- Les comptes ---------- */
function lireComptes() {
  try { var x = JSON.parse(localStorage.getItem(CLE_COMPTES) || '[]'); return Array.isArray(x) ? x : []; }
  catch (e) { return []; }
}
function ecrireComptes(liste) {
  try { localStorage.setItem(CLE_COMPTES, JSON.stringify(liste)); return true; } catch (e) { return false; }
}
function compteParId(id, liste) { return id ? ((liste || lireComptes()).find(function (c) { return c.id === id; }) || null) : null; }
function nouvelId() { return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

function session() {
  try { return JSON.parse(sessionStorage.getItem(CLE_SESSION) || localStorage.getItem(CLE_SESSION) || 'null'); }
  catch (e) { return null; }
}
function poserSession(id, seSouvenir) {
  var v = JSON.stringify({ id: id });
  try { if (seSouvenir) localStorage.setItem(CLE_SESSION, v); else sessionStorage.setItem(CLE_SESSION, v); } catch (e) {}
}
function effacerSession() {
  try { localStorage.removeItem(CLE_SESSION); sessionStorage.removeItem(CLE_SESSION); } catch (e) {}
}

/* ---------- Droits ---------- */
function etatAcces(c) {
  if (c.statut === 'bloque') return { ok: false, tampon: 'Accès bloqué', motif: c.motif || 'Votre accès est bloqué : contactez NaoGroup.' };
  if (c.statut === 'suspendu') return { ok: false, tampon: 'Accès suspendu', motif: c.motif || 'Votre accès est suspendu : contactez NaoGroup.' };
  return { ok: true };
}
function aAcces(c, outilId) { return c.role === 'directrice' || (c.outils || []).indexOf(outilId) >= 0; }

/* ---------- Isolation des données : chaque profil de test a son propre tiroir,
   exactement comme le vrai système, mais à partir de la session locale plutôt
   que d'un compte Supabase. La directrice garde l'espace d'origine. ---------- */
var LS = window.localStorage, ORI = {};
try { ORI.get = Storage.prototype.getItem; ORI.set = Storage.prototype.setItem; ORI.rem = Storage.prototype.removeItem; } catch (e) { LS = null; }
var SESSION_ACTUELLE = session();
var COMPTE_ACTUEL = SESSION_ACTUELLE ? compteParId(SESSION_ACTUELLE.id) : null;
function reserve(k) { return k.indexOf('ng-test-') === 0 || k.indexOf('ngt:') === 0 || k.indexOf('ng:') === 0 || k.indexOf('sb-') === 0; }
function prefixe() { return (!COMPTE_ACTUEL || COMPTE_ACTUEL.role === 'directrice') ? '' : 'ngt:' + COMPTE_ACTUEL.id + ':'; }
function cle(k) { k = String(k); var p = prefixe(); return (!p || reserve(k)) ? k : p + k; }

if (LS && OUTIL_PAGE) {
  Storage.prototype.getItem = function (k) { return this === LS ? ORI.get.call(this, cle(k)) : ORI.get.call(this, k); };
  Storage.prototype.setItem = function (k, v) { return this === LS ? ORI.set.call(this, cle(k), v) : ORI.set.call(this, k, v); };
  Storage.prototype.removeItem = function (k) { return this === LS ? ORI.rem.call(this, cle(k)) : ORI.rem.call(this, k); };
}

/* Ce que les outils et les pages de test peuvent lire. */
window.NaoTestCtx = { compte: COMPTE_ACTUEL, vierge: !!(COMPTE_ACTUEL && COMPTE_ACTUEL.role !== 'directrice') };

/* ============================================================
   La garde d'un outil de test — même esprit visuel que le vrai système.
   ============================================================ */
var CSS_GARDE =
  '#ngt-gate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;' +
  'background:radial-gradient(1200px 820px at 50% 34%,#7564C2 0%,#43358A 42%,#1C1636 100%);color:#F3EFFB;' +
  'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-style:normal}' +
  '#ngt-gate .c{max-width:400px;text-align:center}' +
  '#ngt-gate .badge{display:inline-block;font:800 10px/1 -apple-system,sans-serif;letter-spacing:.1em;text-transform:uppercase;' +
  'color:#C9B7F5;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:5px 12px;margin-bottom:14px}' +
  '#ngt-gate h2{margin:0 0 8px;font-family:Georgia,serif;font-style:italic;font-size:21px;color:#fff}' +
  '#ngt-gate p{margin:0 0 6px;font-size:13.5px;line-height:1.55;color:rgba(243,239,251,.78)}' +
  '#ngt-gate .tampon{display:inline-block;transform:rotate(-6deg);border:3px solid #E58BA0;color:#E58BA0;border-radius:10px;' +
  'padding:6px 16px;font:800 17px -apple-system,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 14px}' +
  '#ngt-gate .b{margin-top:18px}' +
  '#ngt-gate .b a{font:600 13px -apple-system,sans-serif;text-decoration:none;color:#1C1636;' +
  'background:linear-gradient(135deg,#C9B7F5,#EBDFFD);border-radius:999px;padding:11px 20px;display:inline-block}' +
  '#ngt-pastille{position:fixed;right:12px;bottom:12px;z-index:2147482000;display:flex;align-items:center;gap:8px;' +
  'font:600 12px -apple-system,sans-serif;font-style:normal;color:#fff;background:rgba(28,22,54,.82);' +
  'border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 8px 6px 12px;backdrop-filter:blur(8px)}' +
  '#ngt-pastille button{font:inherit;color:#C9B7F5;background:transparent;border:0;cursor:pointer;padding:4px 6px}' +
  '#ngt-pastille button:hover{color:#fff}' +
  '@media print{#ngt-gate,#ngt-pastille{display:none!important}}';

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function poserStyle() { if (!document.getElementById('ngt-gate-css')) { var st = document.createElement('style'); st.id = 'ngt-gate-css'; st.textContent = CSS_GARDE; (document.head || document.documentElement).appendChild(st); } }

/* Le rideau : posé tout de suite, avant même que le reste de la page ne s'affiche,
   pour qu'un profil refusé ne voie jamais un aperçu de l'outil, même bref. */
function poserRideau() {
  if (document.getElementById('ngt-gate')) return;
  poserStyle();
  var d = document.createElement('div'); d.id = 'ngt-gate';
  d.innerHTML = '<div class="c"><div class="badge">Phase de test NaoGroup</div><p>Vérification de votre profil…</p></div>';
  document.documentElement.appendChild(d);
}
function afficherRefus(opt) {
  poserStyle();
  var d = document.getElementById('ngt-gate');
  if (!d) { d = document.createElement('div'); d.id = 'ngt-gate'; document.documentElement.appendChild(d); }
  d.innerHTML = '<div class="c"><div class="badge">Phase de test NaoGroup</div>' +
    (opt.tampon ? '<div class="tampon">' + esc(opt.tampon) + '</div>' : '') +
    '<h2>' + esc(opt.titre) + '</h2><p>' + esc(opt.texte || '') + '</p>' +
    '<div class="b"><a href="' + esc(opt.lien || url('connexion-test.html')) + '">' + esc(opt.libelleLien || 'Se connecter') + '</a></div></div>';
}
function leverRideau() { var d = document.getElementById('ngt-gate'); if (d) d.remove(); }
if (OUTIL_PAGE) poserRideau();
function poserPastille(c) {
  if (document.getElementById('ngt-pastille')) return;
  poserStyle();
  var d = document.createElement('div'); d.id = 'ngt-pastille';
  d.innerHTML = '<span>' + esc(c.prenom || c.identifiant) + ' <i style="opacity:.6;font-style:normal">(test)</i></span><button type="button">Déconnexion</button>';
  d.querySelector('button').addEventListener('click', function () { effacerSession(); location.href = url('connexion-test.html'); });
  document.body ? document.body.appendChild(d) : document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(d); });
}

function garde() {
  if (!OUTIL_PAGE) return;
  var retour = encodeURIComponent(location.href);
  var s = session();
  if (!s) { location.replace(url('connexion-test.html') + '?retour=' + retour); return; }
  var c = compteParId(s.id);
  if (!c) { effacerSession(); location.replace(url('connexion-test.html') + '?retour=' + retour); return; }
  var acc = etatAcces(c);
  if (!acc.ok) { afficherRefus({ tampon: acc.tampon, titre: acc.tampon === 'Accès bloqué' ? 'Votre accès est bloqué' : 'Votre accès est suspendu', texte: acc.motif, libelleLien: 'Se connecter avec un autre profil' }); return; }
  if (c.role !== 'directrice' && c.changerMdp) { location.replace(url('connexion-test.html') + '?retour=' + retour); return; }
  if (!aAcces(c, OUTIL_PAGE)) {
    var o = OUTILS_TEST.filter(function (x) { return x.id === OUTIL_PAGE; })[0];
    afficherRefus({ titre: (o ? o.nom : 'Cet outil') + " n'est pas ouvert à votre profil de test", texte: "Contactez NaoGroup si vous pensez qu'il devrait l'être.", lien: url('connexion-test.html'), libelleLien: '← Choisir un autre profil' });
    return;
  }
  c.derniereConnexion = new Date().toISOString();
  var liste = lireComptes(); var i = liste.findIndex(function (x) { return x.id === c.id; }); if (i >= 0) { liste[i] = c; ecrireComptes(liste); }
  leverRideau();
  poserPastille(c);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', garde); else garde();

/* ============================================================
   Invitations : sans serveur, un compte créé sur l'ordinateur de la créatrice n'existe
   pas sur l'appareil de la personne invitée. Le compte voyage donc dans un lien
   personnel (#invitation=…) que la personne ouvre sur SON appareil.
   - « inv » : crée (ou renouvelle) le compte, avec l'empreinte salée du mot de passe
     provisoire — jamais le mot de passe lui-même ;
   - « maj » : met à jour les outils ouverts et le statut (suspendu/bloqué) d'un compte
     déjà présent sur l'appareil. Un blocage ne prend donc effet que lorsque la personne
     ouvre ce lien : sans serveur, rien ne peut être coupé à distance.
   ============================================================ */
function versB64Url(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function depuisB64Url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }

function lienInvitation(c, avecMotDePasse) {
  var p = avecMotDePasse
    ? { v: 1, t: 'inv', i: c.identifiant, p: c.prenom || '', n: c.nom || '', o: c.outils || [], s: c.statut || 'actif', m: c.motif || '', h: c.mdp, d: c.mdpLe || 0 }
    : { v: 1, t: 'maj', i: c.identifiant, o: c.outils || [], s: c.statut || 'actif', m: c.motif || '' };
  return url('connexion-test.html') + '#invitation=' + versB64Url(JSON.stringify(p));
}

function lireInvitation(hash) {
  var m = /^#invitation=([A-Za-z0-9_-]+)$/.exec(hash || '');
  if (!m) return null;
  var p; try { p = JSON.parse(depuisB64Url(m[1])); } catch (e) { return null; }
  if (!p || p.v !== 1 || (p.t !== 'inv' && p.t !== 'maj')) return null;
  var id = normIdentifiant(p.i);
  if (!/^[a-z0-9._-]{3,40}$/.test(id)) return null;
  var valides = OUTILS_TEST.map(function (o) { return o.id; });
  var inv = {
    type: p.t, identifiant: id,
    outils: Array.isArray(p.o) ? p.o.filter(function (x) { return valides.indexOf(x) >= 0; }) : [],
    statut: ['actif', 'suspendu', 'bloque'].indexOf(p.s) >= 0 ? p.s : 'actif',
    motif: String(p.m || '').slice(0, 300)
  };
  if (p.t === 'inv') {
    var h = p.h;
    if (!h || typeof h.sel !== 'string' || typeof h.empreinte !== 'string' || h.tours !== PBKDF2_TOURS) return null;
    inv.prenom = String(p.p || '').slice(0, 60); inv.nom = String(p.n || '').slice(0, 60);
    inv.mdp = { sel: h.sel, empreinte: h.empreinte, tours: h.tours }; inv.mdpLe = Number(p.d) || 0;
  }
  return inv;
}

/* Applique une invitation lue sur cet appareil. Ne touche jamais au compte de la créatrice. */
function appliquerInvitation(inv) {
  var liste = lireComptes();
  var i = liste.findIndex(function (c) { return normIdentifiant(c.identifiant) === inv.identifiant; });
  if (i >= 0 && liste[i].role === 'directrice') return { ok: false, code: 'directrice' };
  var remis = true;
  if (inv.type === 'maj') {
    if (i < 0) return { ok: false, code: 'inconnu' };
    liste[i].outils = inv.outils; liste[i].statut = inv.statut; liste[i].motif = inv.motif;
  } else if (i < 0) {
    liste.push({ id: nouvelId(), role: 'testeuse', identifiant: inv.identifiant, prenom: inv.prenom, nom: inv.nom,
      statut: inv.statut, motif: inv.motif, outils: inv.outils, mdp: inv.mdp, mdpLe: inv.mdpLe, changerMdp: true,
      creeLe: new Date().toISOString(), derniereConnexion: null });
  } else {
    /* Compte déjà présent : on ne remet le mot de passe provisoire que si ce lien est PLUS RÉCENT que
       celui déjà appliqué — rouvrir par erreur l'ancien e-mail ne doit pas écraser le mot de passe choisi. */
    var c = liste[i];
    c.outils = inv.outils; c.statut = inv.statut; c.motif = inv.motif; c.prenom = inv.prenom; c.nom = inv.nom;
    if (inv.mdpLe > (c.mdpLe || 0)) { c.mdp = inv.mdp; c.mdpLe = inv.mdpLe; c.changerMdp = true; }
    else remis = false;
  }
  return ecrireComptes(liste) ? { ok: true, type: inv.type, identifiant: inv.identifiant, remis: remis } : { ok: false, code: 'stockage' };
}

/* ---------- Ce que connexion-test.html et admin-test.html utilisent ---------- */
window.NaoTest = {
  lienInvitation: lienInvitation, lireInvitation: lireInvitation, appliquerInvitation: appliquerInvitation,
  outils: OUTILS_TEST, url: url,
  lireComptes: lireComptes, ecrireComptes: ecrireComptes, compteParId: compteParId, nouvelId: nouvelId,
  normIdentifiant: normIdentifiant, identifiantPropose: identifiantPropose,
  motDePasseProvisoire: motDePasseProvisoire, codeSecours: codeSecours, normCode: normCode,
  chiffrementDisponible: chiffrementDisponible, protegerMdp: protegerMdp, verifierMdp: verifierMdp,
  session: session, poserSession: poserSession, effacerSession: effacerSession,
  etatAcces: etatAcces, aAcces: aAcces, esc: esc,
  SECRET_LEURRE: SECRET_LEURRE
};
})();
