/* ============================================================
   NaoCV — le socle : état, enregistrement, dates, fenêtres,
   fichiers (écriture DOCX, lecture DOCX) et petits outils.
   ============================================================ */
'use strict';
const NC = window.NC = {};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'");
const maj1 = s => { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
const min1 = s => { s = String(s || '').trim(); if (!s) return s; if (/^[A-ZÀ-Ý]{2,}/.test(s)) return s; return s.charAt(0).toLowerCase() + s.slice(1); };
function lire(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : v; } catch (e) { return def; } }
function ecrire(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

/* ---------- Dates ---------- */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const JOURS_C = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const aujourdhui = () => iso(new Date());
const moisCourant = () => aujourdhui().slice(0, 7);
function fmtMois(m, court) {
  if (!m) return '';
  const [a, mm] = String(m).split('-');
  if (!mm) return a;
  return (court ? MOIS_C : MOIS)[+mm - 1] + ' ' + a;
}
function fmtDate(d, long) {
  if (!d) return '';
  const [a, m, j] = d.split('-');
  return +j + ' ' + (long ? MOIS : MOIS_C)[+m - 1] + ' ' + a;
}
function plusJours(d, n) { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return iso(x); }
function ecartJours(a, b) { return Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5); }
/* Une période d'expérience ou de formation : « mars 2022 – aujourd'hui ». */
function periode(o, court) {
  const d = fmtMois(o.debut, court), f = o.enCours ? "aujourd'hui" : fmtMois(o.fin, court);
  if (d && f) return d === f ? d : d + ' – ' + f;
  return d || f || '';
}
/* Durée en mois d'une période (fin en cours = ce mois-ci). */
function moisEntre(debut, fin) {
  if (!debut) return 0;
  const [a1, m1] = debut.split('-').map(Number), [a2, m2] = (fin || moisCourant()).split('-').map(Number);
  return Math.max(0, (a2 - a1) * 12 + ((m2 || 12) - (m1 || 1)) + 1);
}
const cleTri = o => (o.enCours ? '9999-99' : (o.fin || o.debut || '0000'));

/* ---------- L'état ---------- */
const CLE = 'naocv.donnees';
function cvVide(nom) {
  return {
    id: uid(), nom: nom || 'Mon CV principal', cree: aujourdhui(), maj: aujourdhui(),
    cible: { poste: '', entreprise: '', offre: '' },
    perso: { prenom: '', nom: '', ville: '', tel: '', email: '', linkedin: '', portfolio: '', permis: '', mobilite: '', dispo: '', photo: '' },
    titre: '', accroche: '',
    experiences: [], formations: [], compTech: [], compRel: [], logiciels: [], langues: [], certifications: [], projets: [], interets: [],
    style: { modele: 'moderne', couleur: '#1F3A68', couleur2: '', marque: '', police: 'Calibri', atsPolice: 'Arial', photo: false, couleursEntreprises: true, ats: false }
  };
}
function etatVide() { const cv = cvVide(); return { version: 1, cvs: [cv], principal: cv.id, lettres: [], candidatures: [], vus: {} }; }
NC.cvVide = cvVide;

function reparer(e) {
  if (!e || !Array.isArray(e.cvs)) e = etatVide();
  if (!e.cvs.length) e.cvs.push(cvVide());
  const modele = cvVide();
  e.cvs = e.cvs.map(cv => {
    const r = Object.assign(clone(modele), cv);
    ['perso', 'style', 'cible'].forEach(k => { r[k] = Object.assign(clone(modele[k]), cv[k] || {}); });
    ['experiences', 'formations', 'compTech', 'compRel', 'logiciels', 'langues', 'certifications', 'projets', 'interets'].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
    r.experiences.forEach(x => { if (!x.id) x.id = uid(); if (!Array.isArray(x.missions)) x.missions = []; });
    r.formations.forEach(x => { if (!x.id) x.id = uid(); });
    return r;
  });
  if (!e.cvs.some(c => c.id === e.principal)) e.principal = e.cvs[0].id;
  ['lettres', 'candidatures'].forEach(k => { if (!Array.isArray(e[k])) e[k] = []; });
  if (!e.vus) e.vus = {};
  return e;
}
function charger() {
  let e = null;
  try { const t = lire(CLE, ''); e = t ? JSON.parse(t) : null; } catch (x) { e = null; }
  NC.ETAT = reparer(e);
}
let minuteurSauve = 0;
function sauver(tout_de_suite) {
  clearTimeout(minuteurSauve);
  const f = () => { if (!ecrire(CLE, JSON.stringify(NC.ETAT))) toast('⚠️ Espace plein : la sauvegarde a échoué. Retirez une photo ou un logo trop lourd, ou faites 💾.', 'alerte'); };
  if (tout_de_suite) f(); else minuteurSauve = setTimeout(f, 250);
}
window.addEventListener('beforeunload', () => sauver(true));

const cvParId = id => NC.ETAT.cvs.find(c => c.id === id) || null;
const cvPrincipal = () => cvParId(NC.ETAT.principal) || NC.ETAT.cvs[0];
const lettreParId = id => NC.ETAT.lettres.find(l => l.id === id) || null;
const nomComplet = cv => [cv.perso.prenom, cv.perso.nom].filter(Boolean).join(' ');

/* ---------- Petits messages et fenêtres ---------- */
function toast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.innerHTML = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('part'), 3400);
  setTimeout(() => t.remove(), 3900);
}
function ouvrirModale(html, taille) {
  const v = $('#modale'), f = $('#modaleFen');
  f.className = 'fen' + (taille ? ' ' + taille : '');
  f.innerHTML = html;
  v.classList.add('ouvert');
  document.body.classList.add('fige');
  const p = f.querySelector('[autofocus],input:not([type=hidden]):not([type=file]),textarea,select');
  if (p) setTimeout(() => p.focus(), 60);
}
function fermerModale() { $('#modale').classList.remove('ouvert'); document.body.classList.remove('fige'); NC.surFermeture && NC.surFermeture(); NC.surFermeture = null; }
function confirmer(message, action, libelle) {
  NC._confirme = action;
  ouvrirModale(`<h3 id="modaleTitre">Confirmer</h3><p class="muted">${message}</p>
    <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn danger" data-act="confirme">${libelle || 'Supprimer'}</button></div>`, 'petite');
}

/* ---------- Fichiers ---------- */
function telecharger(blob, nom) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nom;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
/* « CV_Naomie_Lechner_Assistante-commerciale » : sans accents ni espaces. */
function morceauFichier(s, liaison) {
  return norm(s).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(liaison || '');
}
function nomFichier(prefixe, cv, suite) {
  const parts = [prefixe, morceauFichier(cv.perso.prenom, '-'), morceauFichier(cv.perso.nom, '-')];
  const s = morceauFichier(suite || '', '-');
  if (s) parts.push(s.charAt(0) + s.slice(1).toLowerCase().replace(/-([a-z])/g, (m, c) => '-' + c));
  return parts.filter(Boolean).join('_') || prefixe;
}

/* Réduit une image (photo, logo) pour qu'elle tienne dans l'enregistrement. */
function reduireImage(fichier, cote, format) {
  return new Promise((ok, ko) => {
    const lecteur = new FileReader();
    lecteur.onerror = ko;
    lecteur.onload = () => {
      const img = new Image();
      img.onerror = ko;
      img.onload = () => {
        const k = Math.min(1, cote / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d');
        if (format === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
        g.drawImage(img, 0, 0, c.width, c.height);
        ok({ url: c.toDataURL(format || 'image/png', .86), canvas: c });
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  });
}

/* ---------- ZIP : écrire (DOCX) et lire (import DOCX) ---------- */
const TABLE_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = TABLE_CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function creerZip(fichiers, type) {
  const enc = new TextEncoder(), parts = [], central = [];
  let pos = 0;
  const d = new Date();
  const heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const jour = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  fichiers.forEach(f => {
    const nom = enc.encode(f.nom), data = typeof f.contenu === 'string' ? enc.encode(f.contenu) : f.contenu, crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, heure, true); h.setUint16(12, jour, true); h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nom.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), nom, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, heure, true); c.setUint16(14, jour, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, nom.length, true); c.setUint32(42, pos, true);
    central.push(new Uint8Array(c.buffer), nom);
    pos += 30 + nom.length + data.length;
  });
  const tailleC = central.reduce((s, p) => s + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, fichiers.length, true); e.setUint16(10, fichiers.length, true);
  e.setUint32(12, tailleC, true); e.setUint32(16, pos, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: type || 'application/zip' });
}
async function lireDansZip(buf, cible) {
  const v = new DataView(buf), dec = new TextDecoder();
  let fin = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  if (fin < 0) throw new Error('Ce fichier n\'est pas un document Word (.docx).');
  const n = v.getUint16(fin + 10, true);
  let p = v.getUint32(fin + 16, true);
  for (let k = 0; k < n; k++) {
    const meth = v.getUint16(p + 10, true), taille = v.getUint32(p + 20, true);
    const ln = v.getUint16(p + 28, true), lx = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
    const nom = dec.decode(new Uint8Array(buf, p + 46, ln));
    if (nom === cible) {
      const l1 = v.getUint16(off + 26, true), l2 = v.getUint16(off + 28, true);
      const data = new Uint8Array(buf, off + 30 + l1 + l2, taille);
      if (meth === 0) return dec.decode(data);
      if (meth === 8 && 'DecompressionStream' in window) {
        const flux = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return await new Response(flux).text();
      }
      throw new Error('Ce navigateur ne sait pas ouvrir ce .docx : copiez-collez plutôt le texte.');
    }
    p += 46 + ln + lx + lc;
  }
  throw new Error('Aucun texte trouvé dans ce document.');
}

/* ---------- Couleurs ---------- */
function hexRvb(h) { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const rvbHex = (r, v, b) => '#' + [r, v, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase();
function luminance(h) { const c = hexRvb(h).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
const contraste = (a, b) => { const l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
/* Une couleur de marque trop claire (jaune, orange vif) est assombrie pour rester lisible sur blanc. */
function lisible(h, fond) {
  fond = fond || '#FFFFFF';
  let [r, v, b] = hexRvb(h), x = rvbHex(r, v, b), n = 0;
  while (contraste(x, fond) < 4.5 && n < 40) { r *= .92; v *= .92; b *= .92; x = rvbHex(r, v, b); n++; }
  return x;
}
function melange(h, avec, t) { const a = hexRvb(h), b = hexRvb(avec); return rvbHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
/* Extrait les deux couleurs dominantes d'un logo (on ignore le blanc et la transparence). */
function couleursDuLogo(canvas) {
  const g = canvas.getContext('2d'), { width: w, height: h } = canvas;
  const d = g.getImageData(0, 0, w, h).data, seaux = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 180) continue;
    const r = d[i], v = d[i + 1], b = d[i + 2];
    const max = Math.max(r, v, b), min = Math.min(r, v, b);
    if (min > 232) continue;                           /* le fond blanc */
    const sat = max ? (max - min) / max : 0;
    const k = (r >> 4) + ',' + (v >> 4) + ',' + (b >> 4);
    if (!seaux[k]) seaux[k] = { n: 0, r: 0, v: 0, b: 0, poids: 0 };
    const s = seaux[k]; s.n++; s.r += r; s.v += v; s.b += b; s.poids += 1 + sat * 3;
  }
  const liste = Object.values(seaux).sort((a, b) => b.poids - a.poids).map(s => rvbHex(s.r / s.n, s.v / s.n, s.b / s.n));
  const choisis = [];
  liste.forEach(c => { if (choisis.length < 2 && choisis.every(x => distance(x, c) > 90)) choisis.push(c); });
  return choisis;
}
function distance(a, b) { const x = hexRvb(a), y = hexRvb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }

/* Texte blanc ou foncé, selon ce qui se lit le mieux sur une couleur. */
const texteSur = c => contraste(c || '#333333', '#FFFFFF') < 3 ? '#1A1A1A' : '#FFFFFF';

/* Les couleurs connues d'une entreprise, à partir de son nom. */
function trouverEntreprise(nom) {
  const n = ' ' + norm(nom).replace(/[^a-z0-9&]+/g, ' ').trim() + ' ';
  if (n.trim().length < 2) return null;
  let meilleur = null, long = 0;
  (NC.ENTREPRISES || []).forEach(e => {
    [e[0]].concat(e.slice(3)).forEach(a => {
      const cle = ' ' + norm(a).replace(/[^a-z0-9&]+/g, ' ').trim() + ' ';
      if (n.indexOf(cle) !== -1 && cle.length > long) { meilleur = e; long = cle.length; }
    });
  });
  return meilleur ? { nom: meilleur[0], c1: meilleur[1], c2: meilleur[2] } : null;
}
/* Les initiales d'une entreprise, pour son monogramme. */
function initiales(nom) {
  const mots = String(nom || '').replace(/[’']/g, ' ').split(/[\s\-.&]+/).filter(m => m && !/^(de|du|des|la|le|les|et|d|l|sa|sas|sarl)$/i.test(m));
  if (!mots.length) return '•';
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();
  return (mots[0][0] + mots[1][0]).toUpperCase();
}

Object.assign(NC, {
  $, $$, esc, uid, clone, norm, maj1, min1, lire, ecrire, MOIS, MOIS_C, JOURS_C, iso, aujourdhui, moisCourant, fmtMois, fmtDate, plusJours, ecartJours,
  periode, moisEntre, cleTri, charger, sauver, cvParId, cvPrincipal, lettreParId, nomComplet, toast, ouvrirModale, fermerModale, confirmer,
  telecharger, nomFichier, morceauFichier, reduireImage, creerZip, lireDansZip, hexRvb, rvbHex, luminance, contraste, lisible, melange,
  couleursDuLogo, trouverEntreprise, initiales, reparer, texteSur
});
