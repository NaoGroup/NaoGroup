'use strict';
/* ============================================================
   NaoCar — le cœur : dates, données, échéances, documents, thème, fond, fenêtres
   ============================================================ */
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const pad = n => String(n).padStart(2, '0');
const cle = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lire = k => { if (!k) return null; const [y, m, d] = String(k).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const minuit = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const plus = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const plusMois = (d, n) => { const r = new Date(d.getFullYear(), d.getMonth() + n, d.getDate()); if (r.getDate() !== d.getDate()) r.setDate(0); return r; };
const ecart = (a, b) => Math.round((minuit(b) - minuit(a)) / 864e5);
const auj = () => minuit(new Date());
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const er = n => n === 1 ? '1er' : String(n);
const dateCourte = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]}` : '';
const dateMoy = d => d ? `${er(d.getDate())} ${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const dateNum = d => d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '';
const moisAn = d => d ? `${MOIS[d.getMonth()]} ${d.getFullYear()}` : '';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const nombre = v => { const n = parseFloat(String(v ?? '').replace(',', '.').replace(/[\s  ]/g, '')); return isFinite(n) ? n : NaN; };
const nbFr = (n, d = 0) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });
const euros = n => (Number(n) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: (Number(n) % 1) ? 2 : 0, maximumFractionDigits: 2 });
const kmTxt = n => isFinite(nombre(n)) ? `${nbFr(nombre(n))} km` : '';
const pluriel = (n, un, plus_) => `${n} ${n > 1 ? (plus_ || un + 's') : un}`;
const dansJours = n => n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : n === -1 ? 'hier' : n > 0 ? (n > 60 ? `dans ${Math.round(n / 30.4)} mois` : `dans ${n} jours`) : (n < -60 ? `il y a ${Math.round(-n / 30.4)} mois` : `il y a ${-n} jours`);
const telLien = t => t ? `<a href="tel:${esc(String(t).replace(/[^\d+]/g, ''))}">${esc(t)}</a>` : '';
/* l'âge d'une voiture ou d'une pièce : « 3 ans », « 8 mois » */
function ageDe(k, date = auj()) {
  if (!k) return '';
  const n = lire(k);
  let m = (date.getFullYear() - n.getFullYear()) * 12 + date.getMonth() - n.getMonth();
  if (date.getDate() < n.getDate()) m--;
  if (m < 0) return '';
  if (m < 1) return 'moins d’un mois';
  if (m < 24) return `${m} mois`;
  return `${Math.floor(m / 12)} ans`;
}
const ansDepuis = k => k ? ecart(lire(k), auj()) / 365.25 : NaN;

/* ============================================================
   Les petits dessins au trait (24 × 24)
   ============================================================ */
const DESSINS = {
  voiture: '<path d="M3.5 15.5v-3a1.6 1.6 0 0 1 1.2-1.6l1.8-.4 2.1-3.4a2 2 0 0 1 1.7-.9h4.4a2 2 0 0 1 1.7.9l2.1 3.4 1.8.4a1.6 1.6 0 0 1 1.2 1.6v3"/><path d="M3.5 15.5h2M18.5 15.5h2M10 15.5h4"/><circle cx="7.6" cy="16" r="2.1"/><circle cx="16.4" cy="16" r="2.1"/><path d="M8.6 10.5h6.8"/>',
  cle: '<path d="M14.7 3.8a4.6 4.6 0 0 0-4.3 6.1L3.9 16.4a1.8 1.8 0 0 0 2.6 2.6l6.5-6.5a4.6 4.6 0 0 0 6.1-4.3l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  roue: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3"/><path d="M12 3.8V9M12 15v5.2M3.8 12H9M15 12h5.2M6.2 6.2 9.9 9.9M14.1 14.1l3.7 3.7M17.8 6.2l-3.7 3.7M9.9 14.1l-3.7 3.7"/>',
  batterie: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M7 7V5h3v2M14 7V5h3v2M7 12.5h3M8.5 11v3M14 12.5h3"/>',
  goutte: '<path d="M12 3.5s6 6.6 6 10.6a6 6 0 0 1-12 0c0-4 6-10.6 6-10.6z"/><path d="M9.2 14.6a2.9 2.9 0 0 0 2.6 2.7"/>',
  compteur: '<path d="M4.2 16.5a8 8 0 1 1 15.6 0"/><path d="M12 13.5l4-4.5"/><circle cx="12" cy="14" r="1.4"/><path d="M6.6 11.3l1 .5M12 6.5v1.2M17.4 11.3l-1 .5"/>',
  bouclier: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  document: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h3.5"/>',
  panneau: '<path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4.5M12 16.6v.2"/>',
  feu: '<rect x="8" y="3" width="8" height="15" rx="3"/><circle cx="12" cy="6.8" r="1.5"/><circle cx="12" cy="10.5" r="1.5"/><circle cx="12" cy="14.2" r="1.5"/><path d="M12 18v3"/>',
  route: '<path d="M8 3.5 4.5 20.5M16 3.5l3.5 17M12 4.5v2.5M12 10v3M12 16v3.5"/>',
  essence: '<path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v15.5M3.5 20.5h12M7 7h5v3.5H7z"/><path d="M14 9.5h1.6a1.4 1.4 0 0 1 1.4 1.4v5.6a1.5 1.5 0 0 0 3 0V8l-2.5-2.5"/>',
};
const svgDessin = (k, sw = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DESSINS[k] || DESSINS.voiture}</svg>`;

/* ============================================================
   Données
   ============================================================ */
const CLE_STOCK = 'naocar.v1';
let S = null;
function vierge() {
  return { v: 1, cree: new Date().toISOString(), exemple: false, voitures: [], ct: [], taches: [], reparations: [], papiers: [], releves: [] };
}
function charger() {
  try { const t = localStorage.getItem(CLE_STOCK); if (t) S = JSON.parse(t); } catch (e) { S = null; }
  if (!S || typeof S !== 'object' || !Array.isArray(S.voitures)) S = vierge();
  completer(S);
}
function completer(s) {
  const v = vierge();
  for (const k of Object.keys(v)) if (s[k] === undefined || s[k] === null) s[k] = v[k];
  for (const k of ['voitures', 'ct', 'taches', 'reparations', 'papiers', 'releves']) if (!Array.isArray(s[k])) s[k] = [];
  s.voitures.forEach(x => { x.pneus = Object.assign({}, x.pneus || {}); x.batterie = Object.assign({}, x.batterie || {}); });
  return s;
}
function enregistrer() {
  try { localStorage.setItem(CLE_STOCK, JSON.stringify(S)); return true; }
  catch (e) { toast('💾', 'Enregistrement impossible', "L'espace du navigateur est plein (les photos prennent de la place). Sauvegardez dans un fichier, puis retirez quelques photos."); return false; }
}
const sauver = () => { enregistrer(); rendre(); };
const voiture = id => S.voitures.find(v => v.id === id);
const nomVoiture = v => v ? (v.surnom || [v.marque, v.modele].filter(Boolean).join(' ') || 'Ma voiture') : '';
const nomComplet = v => v ? [v.marque, v.modele, v.finition].filter(Boolean).join(' ') : '';
const nomDe = id => nomVoiture(voiture(id));
/* la voiture choisie en haut de page (« Toutes » = '') */
const pourVoiture = x => !V.voiture || x.voiture === V.voiture;
const voituresVues = () => S.voitures.filter(v => !V.voiture || v.id === V.voiture);
const parDate = (a, b) => (b.date || '').localeCompare(a.date || '');

/* le kilométrage connu le plus haut : la fiche, les relevés, le contrôle technique, les réparations */
function kmActuel(v) {
  const l = [{ km: v.km, date: v.kmDate || '' }, ...S.releves.filter(r => r.voiture === v.id), ...S.ct.filter(r => r.voiture === v.id), ...S.reparations.filter(r => r.voiture === v.id)]
    .filter(x => isFinite(nombre(x.km)));
  if (!l.length) return null;
  return l.reduce((m, x) => nombre(x.km) > nombre(m.km) ? x : m);
}
/* les kilomètres par an, d'après le premier et le dernier relevé */
function kmParAn(v) {
  const l = [...S.releves.filter(r => r.voiture === v.id), ...S.ct.filter(r => r.voiture === v.id), ...S.reparations.filter(r => r.voiture === v.id)]
    .filter(x => x.date && isFinite(nombre(x.km))).sort((a, b) => a.date.localeCompare(b.date));
  if (v.dateAchat && isFinite(nombre(v.kmAchat))) l.unshift({ date: v.dateAchat, km: v.kmAchat });
  if (l.length < 2) return null;
  const a = l[0], b = l[l.length - 1], j = ecart(lire(a.date), lire(b.date));
  if (j < 60) return null;
  return Math.round((nombre(b.km) - nombre(a.km)) / j * 365.25 / 100) * 100;
}

/* ============================================================
   Les listes de choix
   ============================================================ */
const CARBURANTS = [['', '—'], ['essence', '⛽ Essence'], ['diesel', '🛢️ Diesel'], ['hybride', '🔌 Hybride'], ['hybride-r', '🔌 Hybride rechargeable'], ['electrique', '⚡ Électrique'], ['gpl', '🔥 GPL'], ['e85', '🌽 Éthanol E85']];
const BOITES = [['', '—'], ['manuelle', 'Manuelle'], ['auto', 'Automatique']];
const COULEURS = { blanc: '#F4F4F6', noir: '#2A2836', gris: '#8C8C9A', argent: '#C7CAD3', bleu: '#3B6BD9', rouge: '#D9434B', vert: '#3E9B6A', jaune: '#E9C443', orange: '#E98A3E', marron: '#8A5A3C', beige: '#D8C3A0', violet: '#7A4FF0', rose: '#E99BFF' };
/* la couleur notée (« gris platine », « Bleu nuit ») → une teinte pour le petit dessin */
function teinte(c) {
  const t = String(c || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [k, h] of Object.entries(COULEURS)) if (t.includes(k.normalize('NFD').replace(/[̀-ͯ]/g, ''))) return h;
  if (/anthracite|titane|graphite|platine/.test(t)) return '#5D5D6B';
  if (/bordeaux|grenat/.test(t)) return '#8E2A3D';
  if (/creme|ivoire|nacre/.test(t)) return '#EFE8DA';
  if (/kaki|olive/.test(t)) return '#6F7448';
  if (/turquoise|cyan/.test(t)) return '#17C9C0';
  return '#A77BFF';
}
const RESULTATS_CT = { favorable: ['✅', 'Favorable', 'ok'], contre: ['🟠', 'Contre-visite (défaillances majeures)', 'att'], critique: ['⛔', 'Contre-visite (défaillances critiques)', 'mal'] };
const URGENCES = { 1: ['🔴', 'Urgent', 'À faire tout de suite, avant de reprendre la route'], 2: ['🟠', 'Bientôt', 'Dans les semaines qui viennent'], 3: ['🟢', 'Quand possible', 'À prévoir à la prochaine occasion'] };
const urgBadge = u => `<span class="urg u${u}">${URGENCES[u] ? URGENCES[u][1] : ''}</span>`;
const T_REPA = {
  revision: ['🛢️', 'Révision / vidange'], freins: ['🛑', 'Freins'], pneus: ['🛞', 'Pneus'], batterie: ['🔋', 'Batterie'],
  distribution: ['⚙️', 'Distribution'], embrayage: ['🦶', 'Embrayage'], carrosserie: ['🚪', 'Carrosserie'], vitrage: ['🪟', 'Pare-brise / vitrage'],
  clim: ['❄️', 'Climatisation'], electrique: ['💡', 'Électricité / éclairage'], moteur: ['🔧', 'Moteur'], echappement: ['💨', 'Échappement'],
  suspension: ['🪝', 'Suspension / direction'], ct: ['✅', 'Contre-visite du CT'], autre: ['🧰', 'Autre'],
};
const opts = T => Object.entries(T).map(([k, v]) => [k, `${v[0]} ${v[1]}`]);
const T_PAPIER = {
  assurance: ['🛡️', 'Assurance', 'Assureur, n° de contrat, formule, échéance'],
  'cg-prov': ['📄', 'Carte grise provisoire (CPI)', 'Le certificat provisoire remis en attendant la carte définitive'],
  'cg-def': ['🪪', 'Carte grise définitive', 'Le certificat d’immatriculation reçu par courrier'],
  critair: ['🌿', 'Vignette Crit’Air', 'La pastille de pollution, de 0 à 5'],
  financement: ['🏦', 'Crédit / LOA / LLD', 'L’organisme, les mensualités, la fin du contrat'],
  garantie: ['🧰', 'Garantie / extension', 'Constructeur, vendeur ou extension'],
  cession: ['🤝', 'Achat / vente', 'Certificat de cession, bon de commande, facture d’achat'],
  autre: ['📎', 'Autre papier', 'Tout autre document de la voiture'],
};
const FORMULES_ASSU = [['', '—'], ['tiers', 'Au tiers'], ['tiers+', 'Tiers étendu (vol, incendie, bris de glace)'], ['tous', 'Tous risques']];
const CRITAIR = [['', '—'], ['0', 'Crit’Air 0 — électrique'], ['1', 'Crit’Air 1'], ['2', 'Crit’Air 2'], ['3', 'Crit’Air 3'], ['4', 'Crit’Air 4'], ['5', 'Crit’Air 5'], ['nc', 'Non classée']];
/* où chaque document part dans NaoDoc (thème « Véhicule », sous-thème) */
const SOUS_NAODOC = { ct: 'Contrôle technique', repa: 'Entretien', assurance: 'Assurance', 'cg-prov': 'Carte grise', 'cg-def': 'Carte grise', critair: 'Carte grise', financement: 'Achat / vente', garantie: 'Achat / vente', cession: 'Achat / vente', autre: '' };

/* ============================================================
   Les pneus : « 205/55 R16 91V », lu en clair
   ============================================================ */
const VITESSES = { L: 120, M: 130, N: 140, P: 150, Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300, Z: 240 };
const CHARGES = { 70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400, 77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600,
  91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800, 101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975, 108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120 };
function lirePneu(t) {
  const m = String(t || '').toUpperCase().replace(/\s+/g, ' ').match(/(\d{3})\s*\/\s*(\d{2})\s*Z?R?\s*F?\s*(\d{2})(?:\s*(\d{2,3})\s*([A-Z]))?/);
  if (!m) return null;
  return { largeur: +m[1], serie: +m[2], jante: +m[3], charge: m[4] ? +m[4] : null, vitesse: m[5] || '', kg: m[4] ? CHARGES[+m[4]] : null, kmh: m[5] ? VITESSES[m[5]] : null };
}
function lecturePneu(t) {
  const p = lirePneu(t); if (!p) return '';
  return `<div class="lecture-pneu"><span>Largeur <b>${p.largeur} mm</b></span><span>Flanc <b>${p.serie} %</b></span><span>Jante <b>${p.jante}″</b></span>
    ${p.charge ? `<span>Charge <b>${p.charge}</b>${p.kg ? ` = ${p.kg} kg` : ''}</span>` : ''}${p.vitesse ? `<span>Vitesse <b>${p.vitesse}</b>${p.kmh ? ` = ${p.kmh} km/h` : ''}</span>` : ''}</div>`;
}
/* la date DOT : 4 chiffres sur le flanc, semaine puis année (« 2321 » = semaine 23 de 2021) */
function dateDot(dot) {
  const m = String(dot || '').match(/^(\d{2})(\d{2})$/); if (!m) return null;
  const sem = +m[1], an = 2000 + +m[2]; if (sem < 1 || sem > 53) return null;
  return plus(new Date(an, 0, 1), (sem - 1) * 7);
}

/* ============================================================
   Les échéances
   ============================================================ */
const ctDe = id => S.ct.filter(c => c.voiture === id).sort(parDate);
/* Le prochain contrôle technique :
   - le premier, dans les 6 mois avant les 4 ans de la 1re mise en circulation ;
   - ensuite tous les 2 ans ;
   - après une contre-visite demandée : 2 mois pour la faire. */
function prochainCT(v) {
  const der = ctDe(v.id)[0];
  if (der) {
    if (der.resultat === 'contre' || der.resultat === 'critique') return { date: plusMois(lire(der.date), 2), type: 'contre', der };
    if (der.prochaine) return { date: lire(der.prochaine), type: 'periodique', der };
    return { date: plusMois(lire(der.date), 24), type: 'periodique', der };
  }
  if (v.dateMEC) return { date: plusMois(lire(v.dateMEC), 48), type: 'premier', der: null };
  return null;
}
const niveau = j => j == null ? '' : j < 0 ? 'mal' : j <= 60 ? 'att' : 'ok';
const papiersDe = id => S.papiers.filter(p => p.voiture === id);
const dernierPapier = (id, type) => papiersDe(id).filter(p => p.type === type).sort((a, b) => (b.debut || b.fin || '').localeCompare(a.debut || a.fin || ''))[0];
function etatCG(v) {
  const d = dernierPapier(v.id, 'cg-def'); if (d) return { etat: 'def', p: d };
  const p = dernierPapier(v.id, 'cg-prov');
  if (p) { const fin = p.fin ? lire(p.fin) : (p.debut ? plusMois(lire(p.debut), 1) : null); return { etat: 'prov', p, fin, dans: fin ? ecart(auj(), fin) : null }; }
  return { etat: 'aucune' };
}
function etatAssu(v) {
  const a = dernierPapier(v.id, 'assurance');
  if (!a) return { etat: 'aucune' };
  const fin = a.fin ? lire(a.fin) : null;
  return { etat: 'ok', p: a, fin, dans: fin ? ecart(auj(), fin) : null };
}
/* Tout ce qui demande de l'attention, voiture par voiture : niveau 1 (urgent), 2 (bientôt), 3 (à prévoir) */
function alertes(v) {
  const a = [], n = nomVoiture(v);
  const ct = prochainCT(v);
  if (ct) {
    const j = ecart(auj(), ct.date);
    const quoi = ct.type === 'contre' ? 'Contre-visite du contrôle technique' : ct.type === 'premier' ? 'Premier contrôle technique' : 'Contrôle technique';
    if (j < 0) a.push({ u: 1, em: '✅', t: `${quoi} dépassé`, s: `${n} · prévu le ${dateMoy(ct.date)} : sans CT valide, la voiture ne peut plus circuler.`, act: 'ct', v: v.id });
    else if (j <= 60) a.push({ u: j <= 30 ? 1 : 2, em: '✅', t: `${quoi} ${dansJours(j)}`, s: `${n} · avant le ${dateMoy(ct.date)}${ct.type === 'premier' ? ' (on peut le faire dès 6 mois avant)' : ''}`, act: 'ct', v: v.id });
  }
  const cg = etatCG(v);
  if (cg.etat === 'prov' && cg.dans != null) {
    if (cg.dans < 0) a.push({ u: 1, em: '📄', t: 'Carte grise provisoire expirée', s: `${n} · la définitive n’est pas notée comme reçue. Suivez la demande sur le site de l’ANTS.`, act: 'papier', type: 'cg-def', v: v.id });
    else if (cg.dans <= 10) a.push({ u: 2, em: '📄', t: `Carte grise provisoire : fin ${dansJours(cg.dans)}`, s: `${n} · la carte définitive est-elle arrivée ? Notez-la dès réception.`, act: 'papier', type: 'cg-def', v: v.id });
  }
  const as = etatAssu(v);
  if (as.etat === 'aucune') a.push({ u: 2, em: '🛡️', t: 'Assurance non notée', s: `${n} · une voiture doit être assurée, même au garage si elle peut rouler.`, act: 'papier', type: 'assurance', v: v.id });
  else if (as.dans != null && as.dans < 0) a.push({ u: 1, em: '🛡️', t: 'Assurance : échéance passée', s: `${n} · échéance du ${dateMoy(as.fin)}. Notez le renouvellement ou la nouvelle assurance.`, act: 'papier', id: as.p.id, v: v.id });
  else if (as.dans != null && as.dans <= 30) a.push({ u: 3, em: '🛡️', t: `Assurance : échéance ${dansJours(as.dans)}`, s: `${n} · le bon moment pour comparer, ou laisser se renouveler.`, act: 'papier', id: as.p.id, v: v.id });
  const b = v.batterie || {};
  if (b.date && ansDepuis(b.date) >= 5) a.push({ u: 3, em: '🔋', t: `Batterie de ${ageDe(b.date)}`, s: `${n} · une batterie dure en général 4 à 6 ans : faites-la tester à la prochaine visite.`, act: 'voir', v: v.id });
  const p = v.pneus || {};
  const dp = p.dateMontage ? lire(p.dateMontage) : dateDot(p.dot);
  if (dp && ecart(dp, auj()) / 365.25 >= 5) a.push({ u: 3, em: '🛞', t: `Pneus de ${ageDe(cle(dp))}`, s: `${n} · au-delà de 5 ans, faites vérifier le caoutchouc (craquelures), même s’ils sont peu usés.`, act: 'voir', v: v.id });
  return a;
}
const toutesAlertes = () => voituresVues().filter(v => !v.vendue).flatMap(alertes).sort((a, b) => a.u - b.u);
const tachesAFaire = () => S.taches.filter(t => !t.fait && pourVoiture(t) && !(voiture(t.voiture) || {}).vendue)
  .sort((a, b) => (a.urgence - b.urgence) || (a.echeance || '9').localeCompare(b.echeance || '9'));

/* ============================================================
   Les documents : gardés ici (IndexedDB), et une copie rangée dans NaoDoc
   ============================================================ */
function baseIDB(nom) {
  let p = null;
  const base = () => p || (p = new Promise((ok, ko) => {
    const r = indexedDB.open(nom, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('f')) r.result.createObjectStore('f'); };
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  }));
  const tx = (mode, fn) => base().then(db => new Promise((ok, ko) => {
    const t = db.transaction('f', mode), req = fn(t.objectStore('f'));
    t.oncomplete = () => ok(req && req.result); t.onerror = () => ko(t.error);
  }));
  return {
    mettre: (k, v) => tx('readwrite', s => s.put(v, k)),
    lire: k => tx('readonly', s => s.get(k)),
    oter: k => tx('readwrite', s => s.delete(k)),
    cles: () => tx('readonly', s => s.getAllKeys()),
    fermer: () => p && p.then(db => db.close()).catch(() => {}),
  };
}
const Fichiers = baseIDB('naocar-fichiers');
/* NaoDoc range ses fichiers dans « naodoc-fichiers » et sa liste dans « naodoc.donnees » :
   dans NaoGroup, naogroup-cloud.js préfixe les deux par le profil, comme pour NaoCar. */
const FichiersNaoDoc = baseIDB('naodoc-fichiers');
const CLE_NAODOC = 'naodoc.donnees';
const FOYER_NAODOC = { id: 'foyer', nom: 'Foyer', role: 'Commun à toute la famille', ico: '🏡', h: 262, fixe: true };
async function copierDansNaoDoc(fichier, { titre, sous = '', organisme = '', reference = '', notes = '' }) {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CLE_NAODOC) || 'null'); } catch (e) {}
  if (!d || !d.v) d = { v: 2, profils: [Object.assign({}, FOYER_NAODOC)], docs: [], cats: [], cachees: [] };
  if (!Array.isArray(d.profils) || !d.profils.some(p => p.id === 'foyer')) d.profils = [Object.assign({}, FOYER_NAODOC), ...(d.profils || [])];
  if (!Array.isArray(d.docs)) d.docs = [];
  /* le thème « Véhicule » a pu être mis de côté dans NaoDoc : il revient, puisqu'un document y entre */
  if (Array.isArray(d.cachees)) d.cachees = d.cachees.filter(c => c !== 'vehicule');
  const doc = { id: uid(), ajoute: new Date().toISOString(), titre, profil: 'foyer', cat: 'vehicule', sous, organisme, reference, emplacement: 'NaoCar', notes, source: 'naocar',
    fichier: { nom: fichier.name || titre, type: fichier.type || 'application/pdf', taille: fichier.size || 0 } };
  await FichiersNaoDoc.mettre(doc.id, fichier);
  d.docs.push(doc);
  localStorage.setItem(CLE_NAODOC, JSON.stringify(d));
  return doc.id;
}
/* enregistre le document d'une fiche (CT, réparation, papier) : ici, puis sa copie dans NaoDoc */
async function rangerDocument(fiche, champ, infos) {
  if (!champ) return;
  if (champ.retirer && fiche.doc) { try { await Fichiers.oter(fiche.id); } catch (e) {} delete fiche.doc; delete fiche.naodoc; }
  const f = champ.fichier;
  if (!f) return;
  if (f.size > 25 * 1024 * 1024) { toast('📎', 'Fichier trop lourd', '25 Mo au maximum : il n’a pas été joint.'); return; }
  try { await Fichiers.mettre(fiche.id, f); fiche.doc = { nom: f.name, type: f.type, taille: f.size }; }
  catch (e) { toast('📎', 'Le fichier n’a pas pu être gardé', 'La mémoire du navigateur est peut-être pleine.'); return; }
  try { fiche.naodoc = await copierDansNaoDoc(f, infos); toast('🗂️', 'Copie rangée dans NaoDoc', `Thème « Véhicule »${infos.sous ? ' › ' + infos.sous : ''}, dans le classeur du Foyer.`); }
  catch (e) { toast('🗂️', 'Copie NaoDoc impossible', 'Le document est bien gardé dans NaoCar.'); }
}
async function ouvrirDocument(id) {
  let b = null;
  try { b = await Fichiers.lire(id); } catch (e) {}
  if (!b) { toast('📎', 'Fichier absent de cet ordinateur', 'La liste suit votre profil, pas les fichiers : rattachez-le à nouveau depuis la fiche.'); return; }
  const url = URL.createObjectURL(b);
  const w = window.open(url, '_blank');
  if (!w) telecharger((b.name || 'document'), b);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
const tailleTxt = o => !o ? '' : o > 1048576 ? `${nbFr(o / 1048576, 1)} Mo` : `${Math.max(1, Math.round(o / 1024))} ko`;
const lienDoc = x => x && x.doc ? `<button type="button" class="doc-lien" data-act="ouvrir-doc" data-id="${x.id}" title="${esc(x.doc.nom)}">📎 ${x.doc.type === 'application/pdf' || /\.pdf$/i.test(x.doc.nom) ? 'PDF' : 'Fichier'}</button>` : '';

/* ============================================================
   Vignettes et dessins de voiture
   ============================================================ */
function vignette(v, taille = '') {
  if (!v) return `<span class="vign ${taille}">${svgDessin('voiture')}</span>`;
  if (v.photo) return `<span class="vign ${taille}" title="${esc(nomVoiture(v))}"><img src="${v.photo}" alt=""></span>`;
  return `<span class="vign ${taille}" title="${esc(nomVoiture(v))}" style="background:linear-gradient(135deg, ${teinte(v.couleur)}, #7A4FF0)">${svgDessin('voiture', 1.8)}</span>`;
}
function dessinVoiture(v) {
  const c = teinte(v && v.couleur);
  return `<svg class="dessin-v" viewBox="0 0 260 110" aria-hidden="true">
    <path class="caisse" fill="${c}" d="M20 78V62q0-9 9-11l26-6 28-24q6-5 14-5h62q9 0 15 6l26 24 26 5q10 2 10 12v15q0 6-6 6H26q-6 0-6-6z"/>
    <path class="vitre" d="M92 46 114 26q3-3 8-3h28v23zM158 46V23h12q6 0 9 3l20 20z"/>
    <rect class="feu" x="228" y="60" width="9" height="6" rx="3"/>
    <circle class="roue" cx="70" cy="84" r="17"/><circle class="jante" cx="70" cy="84" r="7"/>
    <circle class="roue" cx="196" cy="84" r="17"/><circle class="jante" cx="196" cy="84" r="7"/>
    <path class="sol" d="M6 102h248"/></svg>`;
}
const plaqueHTML = p => p ? `<span class="plaque"><b>${esc(String(p).toUpperCase())}</b></span>` : '<span class="plaque vide"><b>— — —</b></span>';

/* ============================================================
   Thème clair / sombre
   ============================================================ */
function appliquerTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#pouce').textContent = t === 'light' ? '☀️' : '🌙';
  $('#b-theme').setAttribute('aria-checked', t === 'light');
  try { localStorage.setItem('naocar.theme', t); } catch (e) {}
}

/* ============================================================
   Le fond : un ciel étoilé, les motifs de la route qui dérivent
   en se balançant, et des traînées de phares qui filent
   ============================================================ */
const MOTIFS = ['voiture', 'cle', 'roue', 'batterie', 'goutte', 'compteur', 'bouclier', 'document', 'panneau', 'feu', 'route', 'essence'];
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
  let p = '';
  const nb = innerWidth < 700 ? 5 : 9;
  for (let i = 0; i < nb; i++) {
    const l = 70 + Math.random() * 120, dur = 9 + Math.random() * 12;
    p += `<i style="top:${(10 + Math.random() * 85).toFixed(1)}%;width:${l.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:-${(Math.random() * dur).toFixed(1)}s"></i>`;
  }
  $('#phares').innerHTML = p;
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
  const f = v.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=search]):not([type=file]),textarea,select');
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
function choisirFichier() {
  return new Promise(res => {
    const inp = $('#doc-in'); inp.value = '';
    inp.onchange = () => res(inp.files[0] || null);
    inp.click();
  });
}

/* ============================================================
   Formulaires génériques
   champs : [{ k, lab, type, options, large, aide, min, max, step, place, req }]
   types  : text date number tel textarea select choix case photo doc note sep html
   ============================================================ */
function champHTML(c, v, valeurs = {}) {
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
    case 'case': return `<div class="${cls}" data-bloc="${c.k}"><label class="case"><input type="checkbox" name="${c.k}" ${val ? 'checked' : ''}> ${c.texte || esc(c.lab)}</label>${aide}</div>`;
    case 'photo': return `<div class="${cls}" data-bloc="${c.k}">${lab}<div class="depot" data-photo="${c.k}" tabindex="0" role="button">
      ${val ? `<img src="${val}" alt="">` : '<span style="font-size:26px">📷</span>'}<span>${val ? 'Changer la photo' : 'Ajouter une photo'}</span>
      ${val ? '<button type="button" class="btn petit" data-retire-photo style="margin-left:auto">Retirer</button>' : ''}</div>
      <input type="hidden" name="${c.k}" value="${esc(val)}">${aide}</div>`;
    case 'doc': {
      const d = valeurs.doc;
      return `<div class="${cls}" data-bloc="${c.k}">${lab}<div class="depot-doc" data-doc="${c.k}" tabindex="0" role="button">${contenuDepot(d ? { nom: d.nom, taille: d.taille, deja: true } : null)}</div>
        <div class="aide">${c.aide || 'PDF ou photo, 25 Mo au maximum. Une copie est rangée dans NaoDoc (thème « Véhicule »).'}</div></div>`;
    }
    default: return `<div class="${cls}" data-bloc="${c.k}">${lab}<input id="${id}" name="${c.k}" type="${c.type || 'text'}" value="${esc(val)}"
      ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''} ${c.step ? `step="${c.step}"` : ''} ${c.type === 'number' ? 'inputmode="decimal"' : ''} ${c.auto ? `autocomplete="${c.auto}"` : 'autocomplete="off"'} placeholder="${esc(c.place || '')}">${aide}</div>`;
  }
}
function contenuDepot(d) {
  if (!d) return '<span class="ic">📎</span><span><b>Joindre le document</b><br>Cliquez, ou glissez le PDF ici.</span>';
  return `<span class="ic">${/\.pdf$/i.test(d.nom) ? '📕' : '🖼️'}</span><span><b>${esc(d.nom)}</b><br>${tailleTxt(d.taille)}${d.deja ? ' · déjà joint' : ' · sera joint à l’enregistrement'}</span>
    <button type="button" class="btn petit" data-retire-doc style="margin-left:auto">Retirer</button>`;
}
function lireForm(form, champs) {
  const o = {};
  for (const c of champs) {
    if (!c.k || ['note', 'html', 'sep'].includes(c.type)) continue;
    if (c.type === 'case') { const x = form.querySelector(`[name="${c.k}"]`); o[c.k] = !!(x && x.checked); }
    else if (c.type === 'choix') { const x = form.querySelector(`[name="${c.k}"]:checked`); o[c.k] = x ? x.value : ''; }
    else if (c.type === 'doc') o[c.k] = { fichier: (form._docs || {})[c.k] || null, retirer: !!(form._retires || {})[c.k] };
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
/* le dépôt d'un document : un clic pour choisir, ou un glisser-déposer */
function brancherDocs(f) {
  f._docs = {}; f._retires = {};
  const poser = (d, fichier) => { f._docs[d.dataset.doc] = fichier; f._retires[d.dataset.doc] = false; d.innerHTML = contenuDepot({ nom: fichier.name, taille: fichier.size }); };
  f.addEventListener('click', async e => {
    const d = e.target.closest('[data-doc]'); if (!d) return;
    if (e.target.closest('[data-retire-doc]')) { e.stopPropagation(); f._docs[d.dataset.doc] = null; f._retires[d.dataset.doc] = true; d.innerHTML = contenuDepot(null); return; }
    const fichier = await choisirFichier(); if (fichier) poser(d, fichier);
  });
  f.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-doc]')) { e.preventDefault(); e.target.click(); } });
  f.querySelectorAll('[data-doc]').forEach(d => {
    d.addEventListener('dragover', e => { e.preventDefault(); d.classList.add('survol'); });
    d.addEventListener('dragleave', () => d.classList.remove('survol'));
    d.addEventListener('drop', e => { e.preventDefault(); d.classList.remove('survol'); const x = e.dataTransfer.files[0]; if (x) poser(d, x); });
  });
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
/* ouvre une fenêtre de saisie ; enregistrer(vals) renvoie false pour garder la fenêtre ouverte (il peut attendre un fichier) */
function formulaire({ titre, chapo = '', champs, valeurs = {}, enregistrer: ok, supprimer, texteSup = '🗑️ Supprimer', large = false, texteOk = 'Enregistrer', apres }) {
  const v = fenetre(`<form class="fenetre ${large ? 'large' : ''}" role="dialog" aria-modal="true" novalidate>
    <h2>${titre}</h2>${chapo ? `<p class="chapo">${chapo}</p>` : ''}
    <div class="champs">${champs.map(c => champHTML(c, valeurs[c.k], valeurs)).join('')}</div>
    <div class="pied">${supprimer ? `<button type="button" class="btn danger" data-sup>${texteSup}</button>` : ''}
      <div class="spacer"></div><button type="button" class="btn" data-annule>Annuler</button><button type="submit" class="btn plein">${texteOk}</button></div></form>`);
  const f = v.querySelector('form');
  brancherPhotos(f);
  brancherDocs(f);
  f.addEventListener('click', async e => {
    if (e.target.closest('[data-annule]')) fermer(v);
    if (e.target.closest('[data-sup]') && await confirmer('Supprimer ?', 'Cette action ne peut pas être annulée.', 'Supprimer')) { await supprimer(); fermer(v); sauver(); }
  });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const vals = lireForm(f, champs);
    const manque = champs.find(c => c.req && !vals[c.k]);
    if (manque) { const x = f.querySelector(`[name="${manque.k}"]`); x && x.focus(); toast('✏️', `« ${manque.lab} » est à remplir`); return; }
    const b = f.querySelector('[type=submit]'); b.disabled = true;
    let r;
    try { r = await ok(vals); } finally { b.disabled = false; }
    if (r === false) return;
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
const V = { page: 'accueil', voiture: '', sous: { entretien: 'afaire' }, tri: { k: 'date', asc: false } };
