'use strict';
/* ============================================================
   NaoPets — le cœur : dates, données, calculs, thème, fond, fenêtres
   ============================================================ */
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const MOIS_C = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const JOURS_C = ['dim','lun','mar','mer','jeu','ven','sam'];
const pad = n => String(n).padStart(2, '0');
const cle = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lire = k => { if (!k) return null; const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d || 1); };
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
const euros = (n, dec = 0) => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: dec, maximumFractionDigits: dec });
const eurosFin = n => euros(n, Math.round(n) === Number(n) ? 0 : 2);
const nombre = v => { const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, '')); return isFinite(n) ? n : 0; };
const nbFr = (n, d = 1) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });
const pluriel = (n, un, plus_) => `${n} ${n > 1 ? (plus_ || un + 's') : un}`;
const dansJours = n => n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : n === -1 ? 'hier' : n > 0 ? `dans ${n} jours` : `il y a ${-n} jours`;
const cleMois = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const heureOk = s => /^([01]?\d|2[0-3])[:h]([0-5]\d)$/.test(String(s).trim());
const heureNorm = s => { const m = String(s).trim().match(/^([01]?\d|2[0-3])[:h]([0-5]\d)$/); return m ? `${pad(m[1])}:${m[2]}` : ''; };

/* âge d'un animal : « 3 ans et 2 mois », « 5 mois », « 3 semaines » */
function ageDe(naissance, date = auj()) {
  if (!naissance) return '';
  const n = lire(naissance), j = ecart(n, date);
  if (j < 0) return '';
  if (j < 60) return j < 14 ? pluriel(j, 'jour') : pluriel(Math.floor(j / 7), 'semaine');
  let m = (date.getFullYear() - n.getFullYear()) * 12 + date.getMonth() - n.getMonth();
  if (date.getDate() < n.getDate()) m--;
  if (m < 24) return `${m} mois`;
  const a = Math.floor(m / 12), mm = m % 12;
  return `${a} ans${mm ? ' et ' + mm + ' mois' : ''}`;
}
/* prochain anniversaire d'une date (naissance, adoption) : { date, ans, dans } */
function prochainAnniv(k, depuis = auj()) {
  if (!k) return null;
  const o = lire(k);
  let d = new Date(depuis.getFullYear(), o.getMonth(), o.getDate());
  if (o.getMonth() === 1 && o.getDate() === 29 && d.getMonth() !== 1) d = new Date(depuis.getFullYear(), 1, 28);
  if (d < depuis) d = new Date(depuis.getFullYear() + 1, o.getMonth(), o.getDate());
  const ans = d.getFullYear() - o.getFullYear();
  return ans > 0 ? { date: d, ans, dans: ecart(depuis, d) } : null;
}

/* ============================================================
   Les espèces, avec leur petit dessin au trait
   ============================================================ */
const DESSINS = {
  chien: '<path d="M7.5 8.4C7.5 6.1 9.5 4.8 12 4.8s4.5 1.3 4.5 3.6V14c0 3.4-2 5.6-4.5 5.6S7.5 17.4 7.5 14z"/><path d="M7.6 7.4C5.2 6.6 3.4 8 3.2 10.4c-.2 2.2.8 3.8 2.4 4.2.9.2 1.6-.4 1.9-1.4M16.4 7.4c2.4-.8 4.2.6 4.4 3 .2 2.2-.8 3.8-2.4 4.2-.9.2-1.6-.4-1.9-1.4"/><circle cx="10.1" cy="10.8" r=".9" fill="currentColor" stroke="none"/><circle cx="13.9" cy="10.8" r=".9" fill="currentColor" stroke="none"/><path d="M10.9 14h2.2L12 15.1zM12 15.1v1.1M10.7 17c.5.35.9.45 1.3.45s.8-.1 1.3-.45"/>',
  chat: '<path d="M5.2 9.4 5.7 3.9l4 3.1a8 8 0 0 1 4.6 0l4-3.1.5 5.5a7.4 7.4 0 0 1 1.2 3.9c0 4.1-3.6 7.1-8 7.1s-8-3-8-7.1a7.4 7.4 0 0 1 1.2-3.9z"/><circle cx="9.3" cy="12.4" r=".95" fill="currentColor" stroke="none"/><circle cx="14.7" cy="12.4" r=".95" fill="currentColor" stroke="none"/><path d="M11.1 14.8h1.8L12 15.8zM12 15.8c-.3.9-1 1.2-1.7 1M12 15.8c.3.9 1 1.2 1.7 1M2.6 13.8l3.4.5M2.9 16.6l3.2-.7M21.4 13.8l-3.4.5M21.1 16.6l-3.2-.7"/>',
  lapin: '<path d="M10.2 9.6C8.7 7.6 8.2 3.4 9.6 2.9s2.6 3.3 2.4 6.3M13.8 9.6c1.5-2 2-6.2.6-6.7s-2.6 3.3-2.4 6.3"/><circle cx="12" cy="14.6" r="5.6"/><circle cx="9.9" cy="13.8" r=".85" fill="currentColor" stroke="none"/><circle cx="14.1" cy="13.8" r=".85" fill="currentColor" stroke="none"/><path d="M11.3 15.9h1.4l-.7.7zM12 16.6v.9M4.2 15.2l2.8.2M4.6 17.6l2.6-.6M19.8 15.2l-2.8.2M19.4 17.6l-2.6-.6"/>',
  hamster: '<path d="M4.4 14.6c0-4.6 3.4-8.1 7.6-8.1s7.6 3.5 7.6 8.1c0 3.2-3.3 5-7.6 5s-7.6-1.8-7.6-5z"/><path d="M6.3 9.1a2.3 2.3 0 1 1 3.1-2.3M17.7 9.1a2.3 2.3 0 1 0-3.1-2.3"/><circle cx="9.6" cy="12.3" r=".9" fill="currentColor" stroke="none"/><circle cx="14.4" cy="12.3" r=".9" fill="currentColor" stroke="none"/><path d="M11.4 14.2h1.2l-.6.6zM6.6 15.5c.9.6 1.9.8 2.7.5M17.4 15.5c-.9.6-1.9.8-2.7.5M10 19.5v.9M14 19.5v.9"/>',
  cochon: '<path d="M3.4 15.1c0-4 3.9-7.1 9.1-7.1 4.6 0 8.1 2.6 8.1 6.4 0 2.8-2.2 4.5-5 4.5H7c-2.3 0-3.6-1.4-3.6-3.8z"/><path d="M15.4 8.5c.6-1.5 2.1-1.9 3-.9M7.6 11.3c1-.9 2.3-1.1 3.5-.6M6.6 13.8c.9-.6 1.9-.7 2.8-.4"/><circle cx="17.2" cy="11.8" r=".9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="14" r=".55" fill="currentColor" stroke="none"/><path d="M8 18.9v1.3M15 18.9v1.3"/>',
  cheval: '<path d="M7.2 21v-6.3c0-4.6 1.5-8 4.3-10l.6-2.2 1.5 1.9c3 1 5 3.4 6.2 6.6l1.4 3.8c.3.9-.1 1.8-1 2.1l-1.2.4c-.8.3-1.6 0-2-.7l-1.6-2.6c-.9.6-1.9 1-3 1.2L11.2 21"/><path d="M11.5 4.7C9.7 6 8.5 8 8.1 10.5M10.1 6.3C8.7 7 7.6 8.2 7.1 9.8"/><circle cx="14.6" cy="8.9" r=".9" fill="currentColor" stroke="none"/><circle cx="19.4" cy="14.1" r=".55" fill="currentColor" stroke="none"/>',
  oiseau: '<path d="M4 14.2c1.6-4 5.4-6.4 9.4-5.6l2.8-2.8 1.3 2.6 2.9.9-2.9 1.2c.2 4.4-2.9 7.6-7.7 7.6-2.8 0-4.9-1.5-5.8-3.9z"/><path d="M8.2 13.4c1.6 1.3 3.8 1.5 5.8.5M9.6 17.8 8.8 21M12.2 17.9l.2 3.1"/><circle cx="15.6" cy="10" r=".8" fill="currentColor" stroke="none"/>',
  poisson: '<path d="M2.8 12c3-4 7.2-5.2 11.3-4.1 2 .5 3.5 1.7 4.4 3l3-2.8v7.8l-3-2.8c-.9 1.4-2.4 2.5-4.4 3C10 17.2 5.8 16 2.8 12z"/><circle cx="7.6" cy="11.3" r=".9" fill="currentColor" stroke="none"/><path d="M11.4 9.2c.9 1.8.9 3.8 0 5.6"/>',
  tortue: '<path d="M4.5 15.5a7.5 6.5 0 0 1 15 0z"/><path d="M9.5 9.5 12 12.4l2.5-2.9M12 12.4v3.1M7.2 12.6l2.6.2M16.8 12.6l-2.6.2"/><path d="M19.5 15.5h1.4a1.8 1.8 0 0 0 0-3.6c-.8 0-1.3.4-1.6 1M6.5 15.5v2.4M17.5 15.5v2.4M3 15.5h1.5"/>',
  furet: '<path d="M3 15.5c2.2-3.6 5.8-5 9.8-4.6 2.4.2 3.8-.8 4.9-2.3a3 3 0 0 1 3.6 1.1c.6 1-.1 2.4-1.3 2.4-1.8 0-2.6 1.1-3.6 2.6-1.6 2.3-4 3.1-7 3.1-2.6 0-4.7-.8-6.4-2.3z"/><path d="M18.4 7.8l.4-1.5 1 1.2"/><circle cx="19.3" cy="9.7" r=".7" fill="currentColor" stroke="none"/><path d="M6.4 17.3l-.6 2.2M12.4 17.6l.3 2.1"/>',
  patte: '<ellipse cx="12" cy="15.6" rx="4.3" ry="3.5" fill="currentColor" stroke="none"/><circle cx="6.3" cy="10.4" r="1.9" fill="currentColor" stroke="none"/><circle cx="9.7" cy="6.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="14.3" cy="6.6" r="1.9" fill="currentColor" stroke="none"/><circle cx="17.7" cy="10.4" r="1.9" fill="currentColor" stroke="none"/>',
  coeur: '<path d="M12 20s-7.2-4.5-7.2-10.1A4 4 0 0 1 12 7.4a4 4 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z"/>',
  os: '<path d="M8.6 10.2 13.8 15.4M6.5 11.4a2 2 0 1 1-1.1-3.3 2 2 0 1 1 3.3-1.1l6.9 6.9a2 2 0 1 1 3.3 1.1 2 2 0 1 1-1.1 3.3z"/>',
};
const ESPECES = [
  ['chien', 'Chien', '🐶'], ['chat', 'Chat', '🐱'], ['lapin', 'Lapin', '🐰'], ['cochon', "Cochon d'Inde", '🐹'],
  ['hamster', 'Hamster', '🐹'], ['cheval', 'Cheval', '🐴'], ['oiseau', 'Oiseau', '🐦'], ['poisson', 'Poisson', '🐟'],
  ['tortue', 'Tortue / reptile', '🐢'], ['furet', 'Furet', '🦦'], ['autre', 'Autre compagnon', '🐾'],
];
const espece = k => ESPECES.find(e => e[0] === k) || ESPECES[ESPECES.length - 1];
const dessin = k => DESSINS[k] || DESSINS.patte;
const svgDessin = (k, sw = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dessin(k)}</svg>`;
function avatar(a, taille = '') {
  if (!a) return `<span class="av ${taille}">${svgDessin('patte')}</span>`;
  return `<span class="av ${taille}" title="${esc(a.nom)}">${a.photo ? `<img src="${a.photo}" alt="">` : svgDessin(a.espece)}</span>`;
}

/* ============================================================
   Données
   ============================================================ */
const CLE_STOCK = 'naopet.v1';
let S = null;
function vierge() {
  return {
    v: 1, cree: new Date().toISOString(), exemple: false,
    animaux: [], contacts: [], repas: [], rappels: [], rdv: [], sante: [], poids: [], journal: [],
    stock: [], depenses: [], budgets: {}, souvenirs: [], coches: {},
    vacances: { destination: '', depart: '', retour: '', garde: 'emmene', gardeNom: '', gardeTel: '', consignes: '', items: [] },
  };
}
function charger() {
  try { const t = localStorage.getItem(CLE_STOCK); if (t) S = JSON.parse(t); } catch (e) { S = null; }
  if (!S || !Array.isArray(S.animaux)) S = vierge();
  completer(S);
}
function completer(s) {
  const v = vierge();
  for (const k of Object.keys(v)) if (s[k] === undefined) s[k] = v[k];
  s.vacances = Object.assign(v.vacances, s.vacances || {});
  if (!s.vacances.items.length) s.vacances.items = checklistDefaut();
  /* on ne garde les cases cochées que sur deux mois */
  const limite = cle(plus(auj(), -62));
  for (const d of Object.keys(s.coches)) if (d < limite) delete s.coches[d];
  return s;
}
function enregistrer() {
  try { localStorage.setItem(CLE_STOCK, JSON.stringify(S)); return true; }
  catch (e) {
    toast('💾', 'Enregistrement impossible', "L'espace du navigateur est plein (les photos prennent de la place). Sauvegardez dans un fichier, puis retirez quelques photos.");
    return false;
  }
}
const sauver = () => { enregistrer(); rendre(); };
const animal = id => S.animaux.find(a => a.id === id);
const actifs = () => S.animaux.filter(a => !a.parti);
const nomA = id => (animal(id) || {}).nom || 'Tout le foyer';
/* l'animal choisi dans le sélecteur ('' = tous) : filtre commun à toutes les pages */
const pourAnimal = x => !V.animal || !x.animal || x.animal === V.animal;
const pourAnimalStrict = x => !V.animal || x.animal === V.animal;
const vivant = id => !id || (animal(id) && !animal(id).parti);

/* ============================================================
   Les types — rappels, rendez-vous, santé, journal, stock, dépenses, contacts
   ============================================================ */
const T_RAPPEL = {
  repas: ['🍽️', 'Repas'], promenade: ['🦮', 'Promenade'], eau: ['💧', "Changer l'eau"], toilettage: ['✂️', 'Toilettage / brossage'],
  antiparasitaire: ['🛡️', 'Antiparasitaire'], vermifuge: ['🌿', 'Vermifuge'], medicament: ['💊', 'Médicament prescrit'],
  litiere: ['🧺', 'Litière / cage'], autre: ['🔔', 'Autre rappel'],
};
const T_RDV = {
  consultation: ['🩺', 'Consultation'], vaccin: ['💉', 'Vaccin'], controle: ['📋', 'Visite de contrôle'],
  sterilisation: ['🎗️', 'Stérilisation'], toilettage: ['✂️', 'Toilettage'], autre: ['📍', 'Autre soin'],
};
const T_SANTE = {
  vaccin: ['💉', 'Vaccin'], vermifuge: ['🌿', 'Vermifuge'], antiparasitaire: ['🛡️', 'Antiparasitaire'],
  traitement: ['💊', 'Traitement prescrit'], examen: ['🔬', 'Examen / analyse'], autre: ['📋', 'Autre soin'],
};
const T_JOURNAL = {
  promenade: ['🦮', 'Promenade'], jeu: ['🎾', 'Jeu'], toilettage: ['✂️', 'Toilettage'], bain: ['🛁', 'Bain'],
  griffes: ['💅', 'Coupe des griffes'], apprentissage: ['🎓', 'Apprentissage'], garderie: ['🏡', 'Garderie'], autre: ['✨', 'Autre moment'],
};
const T_STOCK = {
  nourriture: ['🥣', 'Nourriture'], friandises: ['🦴', 'Friandises'], litiere: ['🧺', 'Litière'],
  accessoires: ['🧸', 'Accessoires'], hygiene: ['🧴', 'Hygiène & soins'], autre: ['📦', 'Autre'],
};
const T_DEPENSE = {
  alimentation: ['🥣', 'Alimentation', '#B9A8F0'], veterinaire: ['🩺', 'Vétérinaire', '#8C93F2'], assurance: ['🛡️', 'Assurance', '#9FC3F2'],
  accessoires: ['🧸', 'Accessoires', '#D9A8E8'], toilettage: ['✂️', 'Toilettage', '#F0B8D0'], pension: ['🏡', 'Pension / garde', '#A8E0D6'],
  medicaments: ['💊', 'Médicaments', '#F3C969'], autre: ['📦', 'Autre', '#C7C0DC'],
};
const T_CONTACT = {
  veterinaire: ['🩺', 'Vétérinaire'], clinique: ['🏥', 'Clinique / urgences vétérinaires'], toiletteur: ['✂️', 'Toiletteur'],
  pension: ['🏡', 'Pension'], petsitter: ['🤝', 'Pet-sitter'], urgence: ['📞', "Contact d'urgence"], educateur: ['🎓', 'Éducateur'], autre: ['📇', 'Autre'],
};
const opts = T => Object.entries(T).map(([k, v]) => [k, `${v[0]} ${v[1]}`]);
const FREQ = [['jour', 'Tous les jours'], ['semaine', 'Certains jours de la semaine'], ['mois', 'Tous les mois'], ['an', 'Tous les ans'], ['unique', 'Une seule fois']];

/* ============================================================
   Les rappels récurrents
   ============================================================ */
const lundi = d => plus(d, -((d.getDay() + 6) % 7));
function actifLe(r, d) {
  const deb = lire(r.debut) || auj();
  if (d < deb) return false;
  if (r.fin && d > lire(r.fin)) return false;
  const n = Math.max(1, Number(r.intervalle) || 1);
  switch (r.freq) {
    case 'unique': return ecart(deb, d) === 0;
    case 'jour': return ecart(deb, d) % n === 0;
    case 'semaine': {
      const jours = (r.jours && r.jours.length) ? r.jours.map(Number) : [deb.getDay()];
      if (!jours.includes(d.getDay())) return false;
      return Math.round(ecart(lundi(deb), lundi(d)) / 7) % n === 0;
    }
    case 'mois': {
      const m = (d.getFullYear() - deb.getFullYear()) * 12 + d.getMonth() - deb.getMonth();
      if (m % n) return false;
      const dernier = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return d.getDate() === Math.min(deb.getDate(), dernier);
    }
    case 'an': {
      if ((d.getFullYear() - deb.getFullYear()) % n) return false;
      if (deb.getMonth() === 1 && deb.getDate() === 29) return d.getMonth() === 1 && d.getDate() === new Date(d.getFullYear(), 2, 0).getDate();
      return d.getMonth() === deb.getMonth() && d.getDate() === deb.getDate();
    }
  }
  return false;
}
function prochaineFois(r, depuis = auj(), max = 800) {
  for (let i = 0; i <= max; i++) { const d = plus(depuis, i); if (actifLe(r, d)) return d; }
  return null;
}
function texteFreq(r) {
  const n = Math.max(1, Number(r.intervalle) || 1);
  switch (r.freq) {
    case 'jour': return n === 1 ? 'Tous les jours' : `Tous les ${n} jours`;
    case 'semaine': {
      const j = (r.jours && r.jours.length ? r.jours : [lire(r.debut || cle(auj())).getDay()]).map(Number).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
      const t = j.length === 7 ? 'tous les jours' : j.map(x => JOURS_C[x]).join(', ');
      return (n === 1 ? 'Chaque semaine' : `Toutes les ${n} semaines`) + ' · ' + t;
    }
    case 'mois': return (n === 1 ? 'Tous les mois' : `Tous les ${n} mois`) + ` · le ${er(lire(r.debut).getDate())}`;
    case 'an': return (n === 1 ? 'Tous les ans' : `Tous les ${n} ans`) + ` · le ${dateCourte(lire(r.debut))}`;
    case 'unique': return `Le ${dateMoy(lire(r.debut))}`;
  }
  return '';
}
const heuresDe = r => (r.heures && r.heures.length ? r.heures : ['']);

/* les tâches d'un jour : repas planifiés, rappels, rendez-vous et soins datés */
function tachesDu(d, filtre = true) {
  const k = cle(d), coches = S.coches[k] || {}, t = [];
  const ok = x => (!filtre || pourAnimal(x)) && vivant(x.animal);
  for (const r of S.repas) if (ok(r) && r.animal && (!r.debut || lire(r.debut) <= d))
    t.push({ id: 'r:' + r.id, em: '🍽️', titre: r.aliment || 'Repas', sous: [r.quantite, r.notes].filter(Boolean).join(' · '), heure: r.heure, animal: r.animal, type: 'repas' });
  for (const r of S.rappels) if (ok(r) && actifLe(r, d))
    for (const h of heuresDe(r))
      t.push({ id: `p:${r.id}:${h}`, em: T_RAPPEL[r.type]?.[0] || '🔔', titre: r.titre || T_RAPPEL[r.type]?.[1], sous: r.type === 'medicament' ? [r.posologie && 'Selon la prescription : ' + r.posologie, r.notes].filter(Boolean).join(' · ') : r.notes || '', heure: h, animal: r.animal, type: 'rappel', ref: r });
  for (const r of S.rdv) if (ok(r) && r.date === k)
    t.push({ id: 'v:' + r.id, em: T_RDV[r.type]?.[0] || '📍', titre: r.titre || T_RDV[r.type]?.[1], sous: [r.lieu, r.motif].filter(Boolean).join(' · '), heure: r.heure, animal: r.animal, type: 'rdv' });
  for (const s of S.sante) if (ok(s) && s.prochain === k)
    t.push({ id: 's:' + s.id, em: T_SANTE[s.type]?.[0] || '📋', titre: `${T_SANTE[s.type]?.[1] || 'Soin'} à renouveler`, sous: s.nom, heure: '', animal: s.animal, type: 'sante' });
  t.forEach(x => { x.fait = !!coches[x.id]; });
  return t.sort((a, b) => (a.heure || '99') < (b.heure || '99') ? -1 : (a.heure || '99') > (b.heure || '99') ? 1 : 0);
}
/* ce qui arrive : rendez-vous, rappels de santé, rappels ponctuels (non quotidiens) */
function aVenir(jours = 60, filtre = true) {
  const a = auj(), fin = plus(a, jours), l = [];
  const ok = x => (!filtre || pourAnimal(x)) && vivant(x.animal);
  for (const r of S.rdv) if (ok(r) && r.date && !r.fait) { const d = lire(r.date); if (d >= a && d <= fin) l.push({ genre: 'rdv', d, x: r }); }
  for (const s of S.sante) if (ok(s) && s.prochain && !s.renouvele) { const d = lire(s.prochain); if (d >= plus(a, -45) && d <= fin) l.push({ genre: 'sante', d, x: s }); }
  /* un rappel déjà couvert par une date de renouvellement du carnet n'est pas montré deux fois */
  const couvert = (r, d) => S.sante.some(s => s.animal === r.animal && s.type === r.type && s.prochain && !s.renouvele && Math.abs(ecart(lire(s.prochain), d)) <= 10);
  for (const r of S.rappels) if (ok(r) && ['mois', 'an', 'unique'].includes(r.freq)) { const d = prochaineFois(r, a, jours); if (d && !couvert(r, d)) l.push({ genre: 'rappel', d, x: r }); }
  return l.sort((x, y) => x.d - y.d);
}

/* ============================================================
   Stock, poids, dépenses
   ============================================================ */
function joursRestants(s) { const c = nombre(s.conso); return c > 0 ? Math.floor(nombre(s.quantite) / c) : null; }
function stockBas(s) {
  const q = nombre(s.quantite), j = joursRestants(s);
  return (s.seuil !== '' && s.seuil != null && q <= nombre(s.seuil)) || (j != null && j <= 7);
}
const poidsDe = id => S.poids.filter(p => p.animal === id).sort((a, b) => a.date < b.date ? -1 : 1);
function dernierPoids(a) { const p = poidsDe(a.id); return p.length ? nombre(p[p.length - 1].kg) : nombre(a.poids); }
/* part d'une dépense pour un animal : ses dépenses + une part égale des dépenses communes */
function partPour(d, id) {
  if (d.animal) return d.animal === id ? nombre(d.montant) : 0;
  const n = actifs().length || 1;
  return actifs().some(a => a.id === id) ? nombre(d.montant) / n : 0;
}
function totalPeriode(filtreDate, id = V.animal) {
  return S.depenses.filter(d => filtreDate(d.date || '')).reduce((s, d) => s + (id ? partPour(d, id) : nombre(d.montant)), 0);
}
const budgetMensuel = (id = V.animal) => id ? nombre(S.budgets[id]) : actifs().reduce((s, a) => s + nombre(S.budgets[a.id]), 0);

/* ============================================================
   Thème clair / sombre
   ============================================================ */
function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#pouce').textContent = t === 'light' ? '☀️' : '🌙';
  $('#b-theme').setAttribute('aria-checked', t === 'light');
  try { localStorage.setItem('naopet.theme', t); } catch (e) {}
}

/* ============================================================
   Le fond : un ciel étoilé, de petits animaux au trait qui dérivent
   doucement en hochant la tête, et des traces de pattes qui passent
   ============================================================ */
const MOTIFS = ['chien', 'chat', 'cheval', 'hamster', 'cochon', 'lapin', 'patte', 'coeur', 'os', 'chien', 'chat', 'lapin'];
function dessinerFond() {
  const ciel = $('#ciel'); let h = '';
  for (let i = 0; i < 60; i++) {
    const t = Math.random() < .12 ? 2.6 : Math.random() * 1.6 + .6;
    h += `<b class="${t > 2 ? 'gros' : ''}" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;width:${t}px;height:${t}px;animation-duration:${(2.5 + Math.random() * 4).toFixed(1)}s;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></b>`;
  }
  ciel.innerHTML = h;
  let m = '';
  const n = innerWidth < 700 ? 11 : 20;
  for (let i = 0; i < n; i++) {
    const k = MOTIFS[i % MOTIFS.length], taille = 26 + Math.random() * 26, dur = 30 + Math.random() * 32;
    m += `<svg viewBox="0 0 24 24" width="${taille.toFixed(0)}" height="${taille.toFixed(0)}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
      style="left:${(Math.random() * 96).toFixed(1)}%;top:${(8 + Math.random() * 86).toFixed(1)}%;--o:calc(var(--motif-o) * ${(0.6 + Math.random() * .6).toFixed(2)});--r0:${(-14 + Math.random() * 28).toFixed(0)}deg;--r1:${(-20 + Math.random() * 40).toFixed(0)}deg;--dx:${(-60 + Math.random() * 120).toFixed(0)}px;animation-duration:${dur.toFixed(0)}s;animation-delay:-${(Math.random() * dur).toFixed(0)}s"><g style="animation-delay:-${(Math.random() * 3).toFixed(1)}s">${dessin(k)}</g></svg>`;
  }
  $('#motifs').innerHTML = m;
  /* trois chemins de traces : une patte après l'autre, en diagonale douce */
  const patte = `<svg viewBox="0 0 24 24" fill="currentColor">${DESSINS.patte.replace(/ fill="currentColor" stroke="none"/g, '')}</svg>`;
  let t = '';
  const chemins = innerWidth < 700 ? 2 : 3;
  for (let c = 0; c < chemins; c++) {
    const x0 = 6 + Math.random() * 70, y0 = 20 + Math.random() * 60, ang = (-35 + Math.random() * 70) * Math.PI / 180, delai = c * 3;
    t += `<div class="trace" style="left:${x0.toFixed(1)}%;top:${y0.toFixed(1)}%">`;
    for (let p = 0; p < 8; p++) {
      const d = p * 26, cote = p % 2 ? 9 : -9;
      const x = Math.cos(ang) * d - Math.sin(ang) * cote, y = Math.sin(ang) * d + Math.cos(ang) * cote;
      t += `<span style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;transform:rotate(${(ang * 180 / Math.PI + 90).toFixed(0)}deg)">${patte.replace('<svg', `<svg style="animation-delay:${(delai + p * .45).toFixed(2)}s"`)}</span>`;
    }
    t += '</div>';
  }
  $('#traces').innerHTML = t;
}

/* ============================================================
   Toasts et fenêtres
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
    v.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) { res(b.dataset.r === '1'); fermer(v); } });
    v._surFermer = () => res(false);
  });
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
   types  : text date time number tel email textarea select choix jours case photo note sep html
   ============================================================ */
function champHTML(c, v) {
  const id = 'f-' + c.k;
  const val = v ?? c.def ?? '';
  const lab = c.lab ? `<label for="${id}">${esc(c.lab)}</label>` : '';
  const aide = c.aide ? `<div class="aide">${c.aide}</div>` : '';
  const cls = `champ${c.large ? ' large' : ''}`;
  switch (c.type) {
    case 'note': return `<div class="champ large"><div class="note-douce"><span class="em">${c.em || '💜'}</span><div>${c.html}</div></div></div>`;
    case 'sep': return `<div class="sep">${esc(c.lab)}</div>`;
    case 'html': return `<div class="${cls}">${c.html}</div>`;
    case 'textarea': return `<div class="${cls}" data-bloc="${c.k}">${lab}<textarea id="${id}" name="${c.k}" rows="${c.rows || 3}" placeholder="${esc(c.place || '')}">${esc(val)}</textarea>${aide}</div>`;
    case 'select': return `<div class="${cls}" data-bloc="${c.k}">${lab}<select id="${id}" name="${c.k}">${c.options.map(([o, l]) => `<option value="${esc(o)}" ${String(o) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>${aide}</div>`;
    case 'choix': return `<div class="${cls}"><span class="lab">${esc(c.lab || '')}</span><div class="choix">${c.options.map(([o, l]) =>
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
    case 'photo': return `<div class="${cls}">${lab}<div class="depot" data-photo="${c.k}" tabindex="0">
      ${val ? `<img src="${val}" alt="">` : '<span style="font-size:26px">📷</span>'}<span>${val ? 'Changer la photo' : 'Ajouter une photo'}</span>
      ${val ? '<button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>' : ''}</div>
      <input type="hidden" name="${c.k}" value="${esc(val)}">${aide}</div>`;
    default: return `<div class="${cls}" data-bloc="${c.k}">${lab}<input id="${id}" name="${c.k}" type="${c.type || 'text'}" value="${esc(val)}"
      ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''} ${c.step ? `step="${c.step}"` : ''} ${c.type === 'number' ? 'inputmode="decimal"' : ''} placeholder="${esc(c.place || '')}">${aide}</div>`;
  }
}
function lireForm(form, champs) {
  const o = {};
  for (const c of champs) {
    if (!c.k || ['note', 'html', 'sep'].includes(c.type)) continue;
    if (c.type === 'case') o[c.k] = form.querySelector(`[name="${c.k}"]`).checked;
    else if (c.type === 'choix') { const x = form.querySelector(`[name="${c.k}"]:checked`); o[c.k] = x ? x.value : ''; }
    else if (c.type === 'jours') o[c.k] = [...form.querySelectorAll(`[name="${c.k}"]:checked`)].map(x => Number(x.value));
    else if (c.type === 'multi') o[c.k] = [...form.querySelectorAll(`[name="${c.k}"]:checked`)].map(x => x.value);
    else { const x = form.querySelector(`[name="${c.k}"]`); o[c.k] = x ? x.value.trim() : ''; }
  }
  return o;
}
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
function telecharger(nom, contenu, type = 'application/octet-stream') {
  const blob = contenu instanceof Blob ? contenu : new Blob([contenu], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* mots qui, dans une note, appellent un simple rappel bienveillant — jamais un avis */
const MOTS_SOUCI = /(vomi|diarrh|sang|saign|boite|boîte|fièvre|fievre|mange plus|ne mange|abattu|toux|tousse|gratte beaucoup|convuls|respire mal|essouffl|gonfl|bless|douleur|mal au|urgence|inqui)/i;
const NOTE_VETO = `<b>Si quelque chose vous inquiète</b>, le plus sûr est d'appeler votre vétérinaire : il saura vous conseiller, même pour une petite question.
  NaoPets garde vos notes, mais ne peut pas évaluer l'état de santé de votre compagnon.`;

/* listes par défaut */
function checklistDefaut() {
  const l = [
    ['Documents', ['Carnet de santé', "Passeport européen / carte d'identification", "Attestation d'assurance", 'Ordonnances en cours']],
    ['Alimentation', ['Nourriture pour tout le séjour (et un peu plus)', 'Friandises', 'Gamelles et bouteille d’eau']],
    ['Balade', ['Laisse', 'Harnais', 'Collier avec médaille']],
    ['Confort', ['Panier ou couverture', 'Jouets préférés', 'Litière et bac']],
    ['Soins', ['Médicaments prescrits', 'Petite trousse (brosse, sacs, lingettes)']],
    ['Garde', ['Réserver la pension ou le pet-sitter', 'Laisser les consignes et le contact du vétérinaire']],
  ];
  return l.flatMap(([cat, items]) => items.map(t => ({ id: uid(), cat, texte: t, fait: false })));
}

/* registres des pages et des actions : chaque fichier y ajoute les siennes */
const PAGES = {};
const ACTIONS = {};
const V = { page: 'accueil', animal: '', sous: { sante: 'rdv', quotidien: 'aujourdhui', depenses: 'mois' }, mois: cleMois(auj()), calMois: cleMois(auj()), calJour: cle(auj()), filtreSante: 'tout', filtreJournal: 'tout', ficheOnglet: 'profil' };
