/* ============================================================
   NaoTrip — le cœur : données, dates, argent, fenêtres et toasts.
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
const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const isoJour = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const auj = () => isoJour(new Date());
const parseJour = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const parseDT = s => { if (!s) return null; const [j, h] = String(s).split('T'); const d = parseJour(j); if (h) { const [hh, mm] = h.split(':').map(Number); d.setHours(hh || 0, mm || 0, 0, 0); } return d; };
const ajouteJours = (s, n) => { const d = parseJour(s); d.setDate(d.getDate() + n); return isoJour(d); };
const joursEntre = (a, b) => Math.round((parseJour(b) - parseJour(a)) / 864e5);
function listeJours(deb, fin) {
  if (!deb) return [];
  const n = Math.max(0, Math.min(90, fin ? joursEntre(deb, fin) : 0));
  return Array.from({ length: n + 1 }, (_, i) => ajouteJours(deb, i));
}
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
const fmtHeure = s => (s && s.includes('T')) ? s.split('T')[1].slice(0, 5).replace(':', 'h') : (s ? String(s).slice(0, 5).replace(':', 'h') : '');
const fmtDT = s => s ? fmtJour(s.slice(0, 10)) + (s.includes('T') ? ' · ' + fmtHeure(s) : '') : '';
function fmtPeriode(v) {
  if (!v.debut) return 'Dates à définir';
  if (!v.fin || v.fin === v.debut) return fmtJour(v.debut, true);
  const a = parseJour(v.debut), b = parseJour(v.fin);
  const memeMois = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return memeMois ? `du ${a.getDate()} au ${b.getDate()} ${MOIS_L[b.getMonth()]} ${b.getFullYear()}`
                  : `du ${a.getDate()} ${MOIS_C[a.getMonth()]} au ${b.getDate()} ${MOIS_C[b.getMonth()]} ${b.getFullYear()}`;
}
const pluriel = (n, un, plusieurs) => n + ' ' + (Math.abs(n) > 1 ? (plusieurs || un + 's') : un);

/* ---------- argent ---------- */
const DEVISES = [['EUR', '€ Euro'], ['USD', '$ Dollar US'], ['GBP', '£ Livre sterling'], ['CHF', 'CHF Franc suisse'], ['CAD', '$ Dollar canadien'],
  ['JPY', '¥ Yen'], ['MAD', 'DH Dirham marocain'], ['TND', 'DT Dinar tunisien'], ['THB', '฿ Baht'], ['AUD', '$ Dollar australien'], ['XPF', 'F CFP'], ['XOF', 'F CFA']];
function argent(n, devise) {
  const rond = Math.abs(n) >= 1000 || Math.abs((n || 0) - Math.round(n || 0)) < .005;
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise || 'EUR', maximumFractionDigits: rond ? 0 : 2, minimumFractionDigits: rond ? 0 : 2 }).format(n || 0); }
  catch (e) { return (Math.round((n || 0) * 100) / 100) + ' ' + (devise || '€'); }
}

/* ---------- les listes de référence ---------- */
const TYPES_VOYAGE = [['vacances', '🏖️', 'Vacances'], ['weekend', '🧳', 'Week-end'], ['couple', '💞', 'En couple'], ['amis', '🥂', 'Entre amis'],
  ['famille', '👨‍👩‍👧', 'En famille'], ['solo', '🎒', 'En solo'], ['sortie', '🎡', 'Sortie'], ['travail', '💼', 'Déplacement']];
const typeVoyage = t => TYPES_VOYAGE.find(x => x[0] === t) || TYPES_VOYAGE[0];
const TYPES_RESA = [
  ['vol', '✈️', 'Vol', 'transport'], ['train', '🚆', 'Train', 'transport'], ['voiture', '🚗', 'Voiture / location', 'transport'],
  ['bus', '🚌', 'Bus / navette', 'transport'], ['bateau', '⛴️', 'Bateau / ferry', 'transport'], ['hebergement', '🏨', 'Hébergement', 'hebergement'],
  ['activite', '🎟️', 'Activité / billet', 'activite'], ['restaurant', '🍽️', 'Restaurant', 'activite'], ['autre', '📌', 'Autre', 'activite']];
const typeResa = t => TYPES_RESA.find(x => x[0] === t) || TYPES_RESA[TYPES_RESA.length - 1];
const CATS_BUDGET = [['transport', '🚆', 'Transport'], ['hebergement', '🏨', 'Hébergement'], ['restauration', '🍽️', 'Restauration'],
  ['activites', '🎟️', 'Activités & visites'], ['shopping', '🛍️', 'Shopping & souvenirs'], ['divers', '✨', 'Divers']];
const catBudget = c => CATS_BUDGET.find(x => x[0] === c) || CATS_BUDGET[CATS_BUDGET.length - 1];
const TYPES_PLAN = [['visite', '🏛️', 'Visite'], ['repas', '🍽️', 'Repas'], ['activite', '🎈', 'Activité'], ['transport', '🚆', 'Trajet'],
  ['detente', '🌿', 'Détente'], ['soiree', '🌙', 'Soirée'], ['autre', '📌', 'Autre']];
const typePlan = t => TYPES_PLAN.find(x => x[0] === t) || TYPES_PLAN[TYPES_PLAN.length - 1];
const TYPES_IDEE = [['visite', '🏛️', 'Visites'], ['restaurant', '🍽️', 'Restaurants'], ['activite', '🎈', 'Activités']];
const CATS_VALISE = [['documents', '🪪', 'Papiers & argent'], ['vetements', '👕', 'Vêtements'], ['toilette', '🧴', 'Toilette'], ['sante', '💊', 'Santé'],
  ['electronique', '🔌', 'Électronique'], ['plage', '🏖️', 'Plage & soleil'], ['enfants', '🧸', 'Enfants'], ['divers', '🎒', 'Divers']];
const catValise = c => CATS_VALISE.find(x => x[0] === c) || CATS_VALISE[CATS_VALISE.length - 1];
const TYPES_INFO = [['adresse', '📍', 'Adresses'], ['numero', '☎️', 'Numéros utiles'], ['lien', '🔗', 'Liens']];

const DOCUMENTS_BASE = ["Carte d'identité", 'Passeport', 'Assurance voyage', 'Billets de transport', 'Permis de conduire',
  "Réservation de l'hébergement", "Carte européenne d'assurance maladie", 'Carte bancaire'];
const TACHES_BASE = [['Vérifier la validité des papiers', 30], ["Souscrire ou vérifier l'assurance voyage", 21], ['Prévenir la banque du voyage', 7],
  ['Faire garder les animaux / arroser les plantes', 7], ['Télécharger les cartes hors-ligne', 3], ["S'enregistrer en ligne", 1], ['Imprimer ou télécharger les billets', 1]];

/* ---------- l'état ---------- */
const CLE = 'naotrip.donnees';
const vierge = () => ({ version: 1, voyages: [], actif: null, monde: {} });
function normaliserVoyage(v) {
  const base = { id: uid(), nom: 'Mon voyage', destination: '', pays: [], debut: '', fin: '', heureDepart: '', type: 'vacances', voyageurs: [],
    devise: 'EUR', notes: '', budget: {}, depenses: [], reservations: [], planning: [], valise: [], documents: [], taches: [], idees: [], infos: [], souvenirs: [] };
  const r = Object.assign(base, v || {});
  ['pays', 'voyageurs', 'depenses', 'reservations', 'planning', 'valise', 'documents', 'taches', 'idees', 'infos', 'souvenirs'].forEach(k => { if (!Array.isArray(r[k])) r[k] = []; });
  if (!r.budget || typeof r.budget !== 'object') r.budget = {};
  r.voyageurs = r.voyageurs.map(x => typeof x === 'string' ? { id: uid(), nom: x } : x).filter(x => x && x.nom);
  return r;
}
function charger() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (d && typeof d === 'object') {
      const s = Object.assign(vierge(), d);
      s.voyages = (s.voyages || []).map(normaliserVoyage);
      if (!s.monde || typeof s.monde !== 'object') s.monde = {};
      return s;
    }
  } catch (e) {}
  return vierge();
}
let S = charger();
function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(S)); return true; }
  catch (e) {
    const plein = /quota/i.test(e.name + e.message);
    toast(plein ? 'La mémoire du navigateur est pleine : retirez quelques photos du carnet, puis réessayez.'
                : 'Ce navigateur refuse d’enregistrer : pensez à 💾 sauvegarder vos voyages dans un fichier.', { alerte: true, duree: 7000 });
    return false;
  }
}
let annulation = null;
function instantane() { annulation = JSON.stringify(S); }
function annuler() { if (!annulation) return; S = JSON.parse(annulation); S.voyages = S.voyages.map(normaliserVoyage); annulation = null; sauver(); rendre(); }

const voyage = () => S.voyages.find(v => v.id === S.actif) || null;
const trouver = (liste, id) => (liste || []).find(x => x.id === id);
function statutVoyage(v, maintenant) {
  const a = maintenant || auj();
  if (!v.debut) return 'projet';
  if (a < v.debut) return 'avenir';
  if (a > (v.fin || v.debut)) return 'passe';
  return 'encours';
}
function prochainVoyage() {
  const a = auj();
  const ok = S.voyages.filter(v => v.debut && (v.fin || v.debut) >= a).sort((x, y) => x.debut.localeCompare(y.debut));
  return ok[0] || null;
}
function departDe(v) { return v.debut ? parseDT(v.debut + 'T' + (v.heureDepart || '00:00')) : null; }
const nomVoyageur = (v, id) => (trouver(v.voyageurs, id) || {}).nom || '—';

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
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 420); }, o.duree || (o.annuler ? 6000 : 3000));
}

/* ============================================================
   La fenêtre-formulaire : un seul constructeur pour tout l'outil.
   champs : { k, l, t, o, ph, req, large, aide, si(vals), lab(vals) }
   types : text, number, date, time, datetime-local, url, tel, textarea,
           select, case, puces (liste libre), cases (choix multiples)
   ============================================================ */
let fermetureModale = null;
function ouvrirModale(html, apres) {
  const voile = $('#modale'), fen = $('#modaleFen');
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
    const lab = esc(c.lab ? c.lab(vals) : c.l);
    const cls = 'champ' + (c.large || c.t === 'textarea' || c.t === 'puces' || c.t === 'cases' ? ' large' : '') + (c.t === 'case' ? ' case large' : '');
    let inner = '';
    if (c.t === 'select') inner = `<select id="${id}" name="${c.k}">${c.o.map(([val, txt]) => `<option value="${esc(val)}"${String(v ?? '') === String(val) ? ' selected' : ''}>${esc(txt)}</option>`).join('')}</select>`;
    else if (c.t === 'textarea') inner = `<textarea id="${id}" name="${c.k}" placeholder="${esc(c.ph || '')}">${esc(v || '')}</textarea>`;
    else if (c.t === 'case') return `<label class="${cls}" data-champ="${c.k}"><input type="checkbox" id="${id}" name="${c.k}"${v ? ' checked' : ''}> ${lab}</label>`;
    else if (c.t === 'puces') { puces[c.k] = (v || []).slice(); inner = `<div class="puces" data-puces="${c.k}"></div>${c.liste ? `<datalist id="dl_${c.k}">${c.liste.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`; }
    else if (c.t === 'cases') inner = `<div class="cases">${c.o.map(([val, txt]) => `<label><input type="checkbox" name="${c.k}" value="${esc(val)}"${(v || []).includes(val) ? ' checked' : ''}> ${esc(txt)}</label>`).join('')}</div>`;
    else inner = `<input id="${id}" name="${c.k}" type="${c.t || 'text'}" value="${esc(v ?? '')}" placeholder="${esc(c.ph || '')}"${c.t === 'number' ? ' step="any" inputmode="decimal"' : ''}${c.req ? ' required' : ''}>`;
    return `<div class="${cls}" data-champ="${c.k}"><label for="${id}">${lab}</label>${inner}${c.aide ? `<div class="aide">${esc(c.aide)}</div>` : ''}</div>`;
  };
  const html = `<form id="formModale" novalidate>
    <h3>${o.emoji ? `<span>${o.emoji}</span>` : ''}${esc(o.titre)}</h3>
    ${o.sous ? `<p class="sous">${esc(o.sous)}</p>` : '<div style="height:12px"></div>'}
    <div class="champs">${o.champs.map(champHTML).join('')}</div>
    <div class="pied-fen">
      ${o.supprimer ? '<button type="button" class="btn fin danger" data-f="suppr">🗑 Supprimer</button>' : ''}
      <div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="submit" class="btn plein">${esc(o.bouton || 'Enregistrer')}</button></div>
    </div></form>`;
  ouvrirModale(html, fen => {
    const form = fen.querySelector('form');
    const lireVals = () => {
      o.champs.forEach(c => {
        if (c.t === 'puces') { vals[c.k] = puces[c.k].slice(); return; }
        if (c.t === 'cases') { vals[c.k] = $$(`input[name="${c.k}"]:checked`, form).map(i => i.value); return; }
        const el = form.elements[c.k]; if (!el) return;
        vals[c.k] = c.t === 'case' ? el.checked : c.t === 'number' ? (el.value === '' ? '' : nombre(el.value)) : el.value.trim();
      });
      return vals;
    };
    const rafraichir = () => {
      lireVals();
      o.champs.forEach(c => {
        const bloc = form.querySelector(`[data-champ="${c.k}"]`); if (!bloc) return;
        if (c.si) bloc.hidden = !c.si(vals);
        if (c.lab) { const l = bloc.querySelector('label'); if (l && c.t !== 'case') l.textContent = c.lab(vals); }
      });
    };
    /* les listes à puces (voyageurs, pays…) */
    const dessinerPuces = k => {
      const c = o.champs.find(x => x.k === k), boite = form.querySelector(`[data-puces="${k}"]`);
      const aff = c.afficher || (x => x);
      boite.innerHTML = puces[k].map((x, i) => `<span class="p">${esc(aff(x))}<button type="button" data-retire="${i}" aria-label="Retirer">✕</button></span>`).join('')
        + `<input type="text" placeholder="${esc(c.ph || 'Ajouter…')}" ${c.liste ? `list="dl_${k}"` : ''} autocomplete="off">`;
      const inp = boite.querySelector('input');
      const ajoute = () => {
        const brut = inp.value.trim(); if (!brut) return;
        brut.split(/[,;]/).map(s => s.trim()).filter(Boolean).forEach(s => {
          const val = c.convertir ? c.convertir(s) : s;
          if (val == null) { toast(`« ${s} » n'a pas été reconnu.`, { alerte: true }); return; }
          if (!puces[k].some(p => (p.nom || p) === (val.nom || val))) puces[k].push(val);
        });
        dessinerPuces(k); boite.querySelector('input').focus();
      };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); ajoute(); } else if (e.key === 'Backspace' && !inp.value && puces[k].length) { puces[k].pop(); dessinerPuces(k); boite.querySelector('input').focus(); } });
      inp.addEventListener('change', () => { if (c.liste && c.liste.includes(inp.value.trim())) ajoute(); });
      inp.addEventListener('blur', () => { if (inp.value.trim()) ajoute(); });
      boite.querySelectorAll('[data-retire]').forEach(b => b.addEventListener('click', () => { puces[k].splice(+b.dataset.retire, 1); dessinerPuces(k); }));
    };
    Object.keys(puces).forEach(dessinerPuces);
    form.addEventListener('input', rafraichir);
    form.addEventListener('change', rafraichir);
    rafraichir();
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    const sup = fen.querySelector('[data-f="suppr"]');
    if (sup) sup.addEventListener('click', () => { fermerModale(); o.supprimer(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      /* une puce en cours de frappe compte aussi */
      $$('.puces input', form).forEach(i => { if (i.value.trim()) i.dispatchEvent(new Event('blur')); });
      lireVals();
      const manque = o.champs.find(c => c.req && (c.si ? c.si(vals) : true) && (vals[c.k] === '' || vals[c.k] == null || (Array.isArray(vals[c.k]) && !vals[c.k].length)));
      if (manque) { toast(`« ${manque.l} » est à remplir.`, { alerte: true }); const el = form.elements[manque.k]; if (el && el.focus) el.focus(); return; }
      if (o.verifier) { const err = o.verifier(vals); if (err) { toast(err, { alerte: true }); return; } }
      if (o.enregistrer(vals) !== false) fermerModale();
    });
  });
}

function confirmer(texte, detail, bouton = 'Supprimer') {
  return new Promise(res => {
    ouvrirModale(`<h3>🧭 ${esc(texte)}</h3><p class="sous">${esc(detail || '')}</p>
      <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-r="0">Annuler</button><button type="button" class="btn plein" data-r="1">${esc(bouton)}</button></div></div>`,
      fen => $$('[data-r]', fen).forEach(b => b.addEventListener('click', () => { fermetureModale = null; fermerModale(); res(b.dataset.r === '1'); })));
    fermetureModale = () => res(false);
  });
}

/* ---------- photos : réduites avant d'être rangées ---------- */
function reduirePhoto(fichier, max = 1100, qualite = .74) {
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
