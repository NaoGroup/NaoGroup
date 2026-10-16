'use strict';
/* ============================================================
   NaoBaby — le cœur : dates, données, thème, fond, fenêtres
   ============================================================ */
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const pad = n => String(n).padStart(2, '0');
const cle = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lire = k => { if (!k) return null; const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const minuit = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const ecart = (a, b) => Math.round((minuit(b) - minuit(a)) / 864e5);
const auj = () => minuit(new Date());
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const er = n => n === 1 ? '1er' : String(n);
const dateLongue = d => d ? `${JOURS[d.getDay()]} ${er(d.getDate())} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const dateCourte = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]}` : '';
const dateMoy = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const fmtH = s => s ? s.replace(':', ' h ').replace(/ h 00$/, ' h') : '';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const euros = n => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const nombre = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const pluriel = (n, un, plus_) => `${n} ${n > 1 ? (plus_ || un + 's') : un}`;
const dansJours = n => n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : n === -1 ? 'hier' : n > 0 ? `dans ${n} jours` : `il y a ${-n} jours`;

/* âge d'un enfant à une date donnée : « 3 mois et 12 jours » */
function ageA(naissance, date) {
  if (!naissance || !date) return '';
  const n = lire(naissance), d = lire(date);
  const j = ecart(n, d);
  if (j < 0) return 'avant la naissance';
  if (j === 0) return 'le jour de sa naissance';
  if (j < 31) return j < 14 ? pluriel(j, 'jour') : `${Math.floor(j / 7)} semaines${j % 7 ? ' et ' + pluriel(j % 7, 'jour') : ''}`;
  let m = (d.getFullYear() - n.getFullYear()) * 12 + d.getMonth() - n.getMonth();
  if (d.getDate() < n.getDate()) m--;
  const base = new Date(n.getFullYear(), n.getMonth() + m, n.getDate());
  const r = ecart(base, d);
  if (m < 24) return `${m} mois${r ? ' et ' + pluriel(r, 'jour') : ''}`;
  const a = Math.floor(m / 12), mm = m % 12;
  return `${a} ans${mm ? ' et ' + mm + ' mois' : ''}`;
}
const ageMois = (naissance, date) => naissance && date ? ecart(lire(naissance), lire(date)) / 30.4375 : 0;

/* ============================================================
   Données
   ============================================================ */
const CLE_STOCK = 'naobaby.v1';
let S = null;
function vierge() {
  return {
    v: 1, cree: new Date().toISOString(),
    profil: { parent1: '', parent2: '', nomFamille: '', dpa: '', nb: 1, maternite: '', materniteTel: '', materniteAdresse: '',
      aines: 0, neutre: false, styleRevel: 'tradition', mode: 'grossesse' },
    bebes: [], rdv: [], journal: [], jalons: {}, jalonsPerso: [], demarches: {},
    achats: [], naissance: [], valise: [], prenoms: [],
    chambre: { couleurs: ['#E9E1FB', '#F6EFE6', '#CFE3DD', '#F4D9E4', '#D8E4F6'], style: '', budget: 0, meubles: [], inspis: [] },
    events: {
      shower: { date: '', heure: '', lieu: '', budget: 0, theme: '', deco: '', jeux: '', cadeaux: '', menu: '', invites: [], taches: [], depenses: [], invit: null },
      reveal: { date: '', heure: '', lieu: '', budget: 0, idee: '', deco: '', gateau: '', ballons: '', fumigenes: false, fumiSecurite: false, playlist: '', photos: '', invites: [], taches: [], depenses: [], invit: null },
    },
    accouchement: { preferences: {}, contacts: [], trajet: '', trajetTemps: '', notes: '', contractions: [] },
    croissance: [], repas: [], premieres: [],
    perte: { date: '', nom: '', mots: '', photos: [] },
    archives: [],
  };
}
function bebeVierge(i) {
  return { id: uid(), rang: i, prenom: '', sexe: 'inconnu', source: '', revele: false, etoile: false,
    naissance: { date: '', heure: '', poids: '', taille: '', pc: '', lieu: '', photo: '', souvenirs: '' } };
}
function charger() {
  try { const t = localStorage.getItem(CLE_STOCK); if (t) S = JSON.parse(t); } catch (e) { S = null; }
  if (!S || !S.profil) S = vierge();
  completer(S);
}
/* répare et complète un état venu d'une ancienne version ou d'un fichier */
function completer(s) {
  const v = vierge();
  for (const k of Object.keys(v)) if (s[k] === undefined) s[k] = v[k];
  s.profil = Object.assign(v.profil, s.profil);
  s.chambre = Object.assign(v.chambre, s.chambre);
  s.accouchement = Object.assign(v.accouchement, s.accouchement);
  s.perte = Object.assign(v.perte, s.perte);
  for (const e of ['shower', 'reveal']) s.events[e] = Object.assign(v.events[e], s.events[e] || {});
  s.profil.nb = Math.max(1, Math.min(6, Number(s.profil.nb) || 1));
  while (s.bebes.length < s.profil.nb) s.bebes.push(bebeVierge(s.bebes.length));
  if (s.bebes.length > s.profil.nb) s.bebes.length = s.profil.nb;
  s.bebes.forEach(b => { b.naissance = Object.assign(bebeVierge(0).naissance, b.naissance || {}); });
  return s;
}
function enregistrer() {
  try { localStorage.setItem(CLE_STOCK, JSON.stringify(S)); return true; }
  catch (e) {
    toast('⚠️', 'Enregistrement impossible', "L'espace du navigateur est plein (les photos prennent de la place). Sauvegardez dans un fichier, puis retirez quelques photos.");
    return false;
  }
}
const sauver = () => { enregistrer(); rendre(); };

/* ============================================================
   La grossesse en chiffres
   ============================================================ */
const P = () => S.profil;
const aProfil = () => !!P().dpa;
const debutG = () => plus(lire(P().dpa), -280);
function etatGrossesse(d = auj()) {
  if (!aProfil()) return null;
  const dpa = lire(P().dpa), debut = debutG();
  const jours = ecart(debut, d);
  const sa = Math.floor(jours / 7), j = ((jours % 7) + 7) % 7;
  const semaine = Math.max(1, Math.min(42, sa + 1));
  const restant = ecart(d, dpa);
  const trimestre = sa < 15 ? 1 : sa < 28 ? 2 : 3;
  const mois = Math.max(1, Math.min(9, Math.floor((sa - 2) / 4.345) + 1));
  const pct = Math.max(0, Math.min(100, jours / 280 * 100));
  return { dpa, debut, jours, sa, j, semaine, restant, trimestre, mois, pct };
}
const dateSA = sa => plus(debutG(), sa * 7);

/* les bébés : un, des jumeaux, des triplés… et ceux qui sont devenus étoiles */
const actifs = () => S.bebes.filter(b => !b.etoile);
const etoiles = () => S.bebes.filter(b => b.etoile);
const nes = () => actifs().filter(b => b.naissance.date);
const estNe = () => nes().length > 0 && nes().length === actifs().length;
function motBebe(art = true) {
  const a = actifs(), n = a.length;
  if (n <= 1) return art ? 'bébé' : 'bébé';
  const tousF = a.every(b => b.revele && b.sexe === 'fille');
  const mots = { 2: tousF ? 'jumelles' : 'jumeaux', 3: tousF ? 'triplées' : 'triplés', 4: tousF ? 'quadruplées' : 'quadruplés' };
  return (art ? 'vos ' : '') + (mots[n] || 'bébés');
}
const nomBebe = (b, i) => b.prenom || (actifs().length > 1 ? `Bébé ${String.fromCharCode(65 + (i ?? S.bebes.indexOf(b)))}` : 'Bébé');
const parents = () => [P().parent1, P().parent2].filter(Boolean).join(' & ') || 'Futurs parents';

/* ============================================================
   Thème clair / sombre, et l'accent selon le sexe révélé
   ============================================================ */
function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#pouce').textContent = t === 'light' ? '☀️' : '🌙';
  $('#b-theme').setAttribute('aria-checked', t === 'light');
  try { localStorage.setItem('naobaby.theme', t); } catch (e) {}
}
function majAccent() {
  let a = 'neutre';
  if (!P().neutre && P().mode !== 'perte') {
    const sx = actifs().filter(b => b.revele && (b.sexe === 'fille' || b.sexe === 'garcon')).map(b => b.sexe);
    if (sx.length) a = sx.every(s => s === 'fille') ? 'fille' : sx.every(s => s === 'garcon') ? 'garcon' : 'mixte';
  }
  const r = document.documentElement;
  r.dataset.sexe = a;
  r.dataset.mode = P().mode === 'perte' ? 'perte' : '';
  try { localStorage.setItem('naobaby.accent', a); } catch (e) {}
}

/* ============================================================
   Le fond : un ciel étoilé et de petits motifs de bébé qui dérivent
   ============================================================ */
const MOTIFS = {
  etoile: '<path d="M12 3.2l2.4 5.3 5.8.6-4.4 3.9 1.3 5.7L12 15.8 6.9 18.7l1.3-5.7-4.4-3.9 5.8-.6z"/>',
  lune: '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 14.6A7.3 7.3 0 0 1 15.5 3.5z"/>',
  nuage: '<path d="M7 18.5h10.2a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.4A3.4 3.4 0 0 0 7 18.5z"/>',
  coeur: '<path d="M12 20s-7.2-4.5-7.2-10.1A4 4 0 0 1 12 7.4a4 4 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z"/>',
  biberon: '<path d="M10.2 3.2h3.6l-.5 2.6h-2.6zM8.6 5.8h6.8M9 5.8l-.4 2.6h6.8L15 5.8M8.6 8.4h6.8l.4 10.6a2 2 0 0 1-2 2.1h-3.6a2 2 0 0 1-2-2.1zM9 12.4h2.6M9 15.6h2.6"/>',
  tetine: '<path d="M12 3.5a2.2 2.2 0 0 1 2.2 2.2V9H9.8V5.7A2.2 2.2 0 0 1 12 3.5zM4.8 11.4C4.8 9.7 8 9 12 9s7.2.7 7.2 2.4-3.2 2.8-7.2 2.8-7.2-1.1-7.2-2.8z"/><circle cx="12" cy="18" r="3.2"/>',
  pied: '<path d="M12.4 21c-2.4 0-3.4-2-3.1-4.6.3-2.8 1.3-5.4 3.6-5.4s2.7 2.6 2.4 5.3c-.3 2.7-.6 4.7-2.9 4.7z"/><circle cx="9.4" cy="8.4" r="1.2"/><circle cx="11.6" cy="7.1" r="1.1"/><circle cx="13.9" cy="7.2" r="1"/><circle cx="15.8" cy="8.3" r=".9"/><circle cx="17.1" cy="10" r=".8"/>',
  hochet: '<circle cx="9" cy="8.5" r="5"/><path d="M12.6 12.1l5.2 5.2"/><circle cx="19.2" cy="18.7" r="1.9"/><path d="M6.6 7.4c.5-1 1.3-1.6 2.3-1.8"/>',
  body: '<path d="M8.5 3.8 4.6 6.6l1.9 3 1.9-1v9.8a2 2 0 0 0 2 2h3.2a2 2 0 0 0 2-2V8.6l1.9 1 1.9-3-3.9-2.8a3.5 3.5 0 0 1-7 0z"/>',
  ballon: '<path d="M12 3a6 7 0 0 1 0 14 6 7 0 0 1 0-14zM11 17l1 1.6 1-1.6M12 18.6c-.8 1.4.8 2 0 3.4"/>',
  berceau: '<path d="M4 11h16a8 7 0 0 1-16 0zM7 17.5l-1.5 3M17 17.5l1.5 3M4 11a3.5 3.5 0 0 1 7-1"/>',
  canard: '<path d="M6 14.5c0 3.2 2.7 5.5 6.5 5.5 4.3 0 6.8-2.3 6.8-5.7 0-1.3-.6-2-1.3-2-1 0-1.6 1-3.5 1.1a4 4 0 1 0-6.6-3.6c0 1 .3 1.8.8 2.5C7.4 12.4 6 12.9 6 14.5zM9.3 8.7l-2.4.5 2.2 1"/>',
};
const MOTIFS_DOUX = ['etoile', 'lune', 'nuage', 'coeur'];
function dessinerFond() {
  const ciel = $('#ciel'); let h = '';
  for (let i = 0; i < 70; i++) {
    const t = Math.random() < .12 ? 2.6 : Math.random() * 1.6 + .6;
    h += `<b class="${t > 2 ? 'gros' : ''}" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;width:${t}px;height:${t}px;animation-duration:${(2.5 + Math.random() * 4).toFixed(1)}s;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></b>`;
  }
  ciel.innerHTML = h;
  majMotifs();
}
function majMotifs() {
  const liste = P().mode === 'perte' ? MOTIFS_DOUX : Object.keys(MOTIFS);
  const n = P().mode === 'perte' ? 10 : 18;
  let h = '';
  for (let i = 0; i < n; i++) {
    const k = liste[i % liste.length], taille = 22 + Math.random() * 26, dur = 26 + Math.random() * 30;
    h += `<svg viewBox="0 0 24 24" width="${taille.toFixed(0)}" height="${taille.toFixed(0)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
      style="left:${(Math.random() * 96).toFixed(1)}%;top:${(8 + Math.random() * 86).toFixed(1)}%;--o:calc(var(--motif-o) * ${(0.6 + Math.random() * .6).toFixed(2)});--r0:${(-20 + Math.random() * 40).toFixed(0)}deg;--r1:${(-30 + Math.random() * 60).toFixed(0)}deg;--dx:${(-50 + Math.random() * 100).toFixed(0)}px;animation-duration:${dur.toFixed(0)}s;animation-delay:-${(Math.random() * dur).toFixed(0)}s">${MOTIFS[k]}</svg>`;
  }
  $('#motifs').innerHTML = h;
}

/* ============================================================
   Toasts, fenêtres, confettis
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
  v.addEventListener('mousedown', e => { if (e.target === v) fermer(v); });
  document.body.append(v);
  const f = v.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea,select');
  if (f && matchMedia('(pointer:fine)').matches) setTimeout(() => f.focus(), 60);
  return v;
}
function fermer(v) { if (!v) v = [...document.querySelectorAll('.voile')].pop(); if (v) { v.remove(); if (v._surFermer) v._surFermer(); } }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector('.voile')) fermer(); });

function confirmer(titre, texte, oui = 'Confirmer', danger = true) {
  return new Promise(res => {
    const v = fenetre(`<div class="fenetre etroite" role="alertdialog" aria-modal="true"><h2>${esc(titre)}</h2>
      <p class="chapo">${texte}</p><div class="pied"><div class="spacer"></div>
      <button class="btn" data-r="0">Annuler</button><button class="btn plein ${danger ? 'danger' : ''}" data-r="1">${esc(oui)}</button></div></div>`);
    /* on répond avant de fermer : la fermeture, elle, répond « non » à qui n'a pas encore eu de réponse */
    v.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) { res(b.dataset.r === '1'); fermer(v); } });
    v._surFermer = () => res(false);
  });
}

/* confettis doux sur un canevas plein écran — cercles, rubans et petites étoiles */
function confettis(couleurs, duree = 4200, quantite = 140) {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = $('#confettis'); c.hidden = false;
  const ctx = c.getContext('2d'), dpr = devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const parts = Array.from({ length: quantite }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 160, y: innerHeight * .42,
    vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 4,
    r: Math.random() * 5 + 3, rot: Math.random() * 6, vr: (Math.random() - .5) * .2,
    c: couleurs[Math.floor(Math.random() * couleurs.length)], f: Math.floor(Math.random() * 3),
  }));
  const t0 = performance.now();
  (function image(t) {
    const k = (t - t0) / duree;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += .16; p.vx *= .99; p.vy *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * k); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.f === 0) { ctx.beginPath(); ctx.arc(0, 0, p.r * .7, 0, 7); ctx.fill(); }
      else if (p.f === 1) ctx.fillRect(-p.r, -p.r * .35, p.r * 2, p.r * .7);
      else { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? p.r * .4 : p.r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); }
      ctx.restore();
    }
    if (k < 1) requestAnimationFrame(image); else { ctx.clearRect(0, 0, innerWidth, innerHeight); c.hidden = true; }
  })(t0);
}

/* ============================================================
   Photos : lues, réduites et compressées avant d'être gardées
   ============================================================ */
function choisirPhoto(max = 900, qualite = .78) {
  return new Promise(res => {
    const inp = $('#photo-in'); inp.value = '';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return res(null);
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', qualite));
        };
        img.onerror = () => { toast('⚠️', 'Image illisible'); res(null); };
        img.src = r.result;
      };
      r.readAsDataURL(f);
    };
    inp.click();
  });
}

/* ============================================================
   Formulaires génériques
   champs : [{ k, lab, type, options, large, aide, min, max, step, place }]
   types  : text date time number tel email url textarea select choix case photo note html
   ============================================================ */
function champHTML(c, v) {
  const id = 'f-' + c.k;
  const val = v ?? c.def ?? '';
  const lab = c.lab ? `<label for="${id}">${esc(c.lab)}</label>` : '';
  const aide = c.aide ? `<div class="aide">${c.aide}</div>` : '';
  const cls = `champ${c.large ? ' large' : ''}`;
  switch (c.type) {
    case 'note': return `<div class="champ large"><div class="note-douce"><span class="em">${c.em || '💜'}</span><div>${c.html}</div></div></div>`;
    case 'html': return `<div class="${cls}">${c.html}</div>`;
    case 'textarea': return `<div class="${cls}">${lab}<textarea id="${id}" name="${c.k}" rows="${c.rows || 3}" placeholder="${esc(c.place || '')}">${esc(val)}</textarea>${aide}</div>`;
    case 'select': return `<div class="${cls}">${lab}<select id="${id}" name="${c.k}">${c.options.map(([o, l]) => `<option value="${esc(o)}" ${String(o) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${aide}</div>`;
    case 'choix': return `<div class="${cls}"><span class="lab">${esc(c.lab || '')}</span><div class="choix">${c.options.map(([o, l]) =>
      `<label><input type="radio" name="${c.k}" value="${esc(o)}" ${String(o) === String(val) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>${aide}</div>`;
    case 'case': return `<div class="${cls}"><label class="case"><input type="checkbox" name="${c.k}" ${val ? 'checked' : ''}> ${c.texte || esc(c.lab)}</label>${aide}</div>`;
    case 'photo': return `<div class="${cls}">${lab}<div class="depot" data-photo="${c.k}" tabindex="0">
      ${val ? `<img src="${val}" alt="">` : '<span style="font-size:26px">📷</span>'}<span>${val ? 'Changer la photo' : 'Ajouter une photo'}</span>
      ${val ? '<button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>' : ''}</div>
      <input type="hidden" name="${c.k}" value="${esc(val)}">${aide}</div>`;
    default: return `<div class="${cls}">${lab}<input id="${id}" name="${c.k}" type="${c.type || 'text'}" value="${esc(val)}"
      ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''} ${c.step ? `step="${c.step}"` : ''} placeholder="${esc(c.place || '')}" ${c.req ? 'required' : ''}>${aide}</div>`;
  }
}
function lireForm(form, champs) {
  const o = {};
  for (const c of champs) {
    if (!c.k || c.type === 'note' || c.type === 'html') continue;
    if (c.type === 'case') o[c.k] = form.querySelector(`[name="${c.k}"]`).checked;
    else if (c.type === 'choix') { const x = form.querySelector(`[name="${c.k}"]:checked`); o[c.k] = x ? x.value : ''; }
    else { const x = form.querySelector(`[name="${c.k}"]`); o[c.k] = x ? x.value.trim() : ''; }
  }
  return o;
}
/* branche les zones photo d'un formulaire */
function brancherPhotos(racine) {
  racine.addEventListener('click', async e => {
    const ret = e.target.closest('[data-retire-photo]');
    const d = e.target.closest('[data-photo]');
    if (!d) return;
    const hidden = d.parentElement.querySelector(`input[name="${d.dataset.photo}"]`);
    if (ret) { e.stopPropagation(); hidden.value = ''; d.innerHTML = '<span style="font-size:26px">📷</span><span>Ajouter une photo</span>'; return; }
    const p = await choisirPhoto();
    if (!p) return;
    hidden.value = p;
    d.innerHTML = `<img src="${p}" alt=""><span>Changer la photo</span><button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>`;
  });
}
/* ouvre une fenêtre de saisie ; enregistrer(vals) renvoie false pour garder la fenêtre ouverte */
function formulaire({ titre, chapo = '', champs, valeurs = {}, enregistrer: ok, supprimer, large = false, texteOk = 'Enregistrer', apres }) {
  const v = fenetre(`<form class="fenetre ${large ? 'large' : ''}" role="dialog" aria-modal="true" novalidate>
    <h2>${titre}</h2>${chapo ? `<p class="chapo">${chapo}</p>` : ''}
    <div class="champs">${champs.map(c => champHTML(c, valeurs[c.k])).join('')}</div>
    <div class="pied">${supprimer ? '<button type="button" class="btn danger" data-sup>🗑️ Supprimer</button>' : ''}
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

/* télécharge un fichier généré ici même (sauvegarde, invitation, image…) */
function telecharger(nom, contenu, type = 'application/octet-stream') {
  const blob = contenu instanceof Blob ? contenu : new Blob([contenu], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const nomFichier = s => String(s || 'naobaby').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

/* mots qui, dans une note, appellent un simple rappel bienveillant */
const MOTS_SOUCI = /(inqui|douleur|mal au|saign|sang|fièvre|fievre|contraction|ne bouge|bouge (plus|moins)|perte|malaise|vertige|chute|urgence|peur|angoiss)/i;
const NOTE_SANTE = `<b>Si quelque chose vous inquiète</b>, n'hésitez jamais à appeler votre sage-femme, votre médecin ou la maternité : ils sont là pour ça, même pour une petite question.
  En cas d'urgence, composez le <b>15</b> ou le <b>112</b>. NaoBaby ne peut pas évaluer une situation de santé.`;

/* registres des pages et des actions : chaque fichier y ajoute les siennes */
const PAGES = {};
const ACTIONS = {};
const V = { page: 'accueil', sous: { grossesse: 'suivi', accouchement: 'preparer', bebe: 'naissance' }, bebe: null, ev: 'shower', filtreListe: 'achats' };
