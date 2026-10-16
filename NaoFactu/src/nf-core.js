/* ============================================================
   NaoFactu — le moteur : données, stockage, calculs, numérotation.
   Rien ici ne touche à l'écran.
   ============================================================ */
'use strict';

const STORE = 'naofactu.v1';
const THEME_KEY = 'naofactu.theme';

/* ---------- Petits outils ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n, l = 2) => String(n).padStart(l, '0');
const isoDate = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => isoDate(new Date());
function parseISO(s) { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d || 1); }
function addDays(s, n) { const d = parseISO(s); d.setDate(d.getDate() + Number(n || 0)); return isoDate(d); }
function addMonths(s, n) {
  const d = parseISO(s), jour = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + Number(n));
  const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(jour, fin)); return isoDate(d);
}
function diffDays(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); } // b - a
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function fmtDate(s) { if (!s) return '—'; const d = parseISO(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
function fmtDateLong(s) { if (!s) return '—'; const d = parseISO(s); return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtMois(ym) { if (!ym) return '—'; const [y, m] = ym.split('-').map(Number); return MOIS[m - 1].replace(/^./, c => c.toUpperCase()) + ' ' + y; }
const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const NUM = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const money = v => EUR.format(Math.round((Number(v) || 0) * 100) / 100);
const r2 = v => Math.round((Number(v) || 0) * 100) / 100;
function num(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  const n = parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const clone = o => JSON.parse(JSON.stringify(o));
const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);

/* ---------- Référentiels ---------- */
const TAUX_TVA = [20, 10, 5.5, 2.1, 0];
const UNITES = ['unité', 'heure', 'jour', 'forfait', 'mois', 'page', 'mot', 'm²', 'km', 'lot'];
const MOYENS = ['Virement', 'Carte bancaire', 'Chèque', 'Espèces', 'Prélèvement', 'PayPal', 'Autre'];
const CAT_DEPENSES = [
  ['materiel', '🖥️', 'Matériel'], ['logiciels', '💿', 'Logiciels & abonnements'], ['telephone', '📱', 'Téléphone & internet'],
  ['deplacement', '🚆', 'Déplacements'], ['repas', '🍽️', 'Repas professionnels'], ['publicite', '📣', 'Publicité & communication'],
  ['loyer', '🏢', 'Loyer & charges'], ['assurances', '🛡️', 'Assurances'], ['fournitures', '✏️', 'Fournitures'],
  ['formation', '🎓', 'Formation'], ['autre', '📦', 'Autre']
];
const catDep = k => CAT_DEPENSES.find(c => c[0] === k) || CAT_DEPENSES[CAT_DEPENSES.length - 1];
const CAT_DOCS = [
  ['clients', '🧾', 'Factures clients'], ['fournisseurs', '📥', 'Factures fournisseurs'], ['justificatifs', '📎', 'Justificatifs'],
  ['releves', '🏦', 'Relevés bancaires'], ['exports', '📤', 'Exports comptables'], ['admin', '🏛️', 'Administratif & fiscal'],
  ['autres', '🗂️', 'Autres']
];
const catDoc = k => CAT_DOCS.find(c => c[0] === k) || CAT_DOCS[CAT_DOCS.length - 1];

const STATUTS_FACTURE = {
  brouillon: 'Brouillon', envoyee: 'Envoyée', vue: 'Vue', en_attente: 'En attente', partielle: 'Partiellement payée',
  payee: 'Payée', retard: 'En retard', annulee: 'Annulée'
};
const STATUTS_DEVIS = { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré' };
const TYPES_FACTURE = { facture: 'Facture', acompte: "Facture d'acompte", solde: 'Facture de solde', avoir: 'Avoir' };

const RELANCES_DEFAUT = [
  { id: 'r1', nom: 'Rappel courtois (avant échéance)', sujet: 'Petit rappel — facture {numero}',
    corps: "Bonjour {client},\n\nJ'espère que vous allez bien. Je me permets un petit rappel : la facture {numero} d'un montant de {montant} arrive à échéance le {echeance}.\n\nVous trouverez les coordonnées bancaires sur la facture. N'hésitez pas à revenir vers moi si besoin.\n\nBelle journée,\n{signature}" },
  { id: 'r2', nom: 'Première relance (quelques jours de retard)', sujet: 'Facture {numero} — échéance dépassée',
    corps: "Bonjour {client},\n\nSauf erreur de ma part, la facture {numero} d'un montant de {restant}, arrivée à échéance le {echeance}, ne semble pas encore réglée.\n\nIl s'agit peut-être d'un simple oubli : pourriez-vous me confirmer la date de règlement prévue ?\n\nSi le paiement a été effectué entre-temps, merci de ne pas tenir compte de ce message.\n\nCordialement,\n{signature}" },
  { id: 'r3', nom: 'Seconde relance (plus ferme)', sujet: 'Seconde relance — facture {numero} en attente de règlement',
    corps: "Bonjour {client},\n\nMalgré mon précédent message, la facture {numero} ({restant} restant dû) reste impayée à ce jour, avec {jours} jours de retard.\n\nJe vous remercie de bien vouloir procéder au règlement dans les meilleurs délais, ou de me contacter pour convenir ensemble d'une solution.\n\nCordialement,\n{signature}" }
];

/* ---------- Recrutements & contrats ---------- */
const ETAPES_CANDIDAT = [
  ['nouveau', '📥', 'Nouvelle candidature'], ['preselection', '🔎', 'Présélection'], ['entretien', '🗣️', 'Entretien'],
  ['test', '🧩', 'Mise en situation'], ['offre', '✉️', 'Proposition faite'], ['embauche', '🤝', 'Recruté·e'], ['refuse', '🚫', 'Non retenu·e']
];
const etape = k => ETAPES_CANDIDAT.find(e => e[0] === k) || ETAPES_CANDIDAT[0];
const STATUTS_POSTE = { ouvert: 'Ouvert', pause: 'En pause', pourvu: 'Pourvu', ferme: 'Fermé' };
const TYPES_CONTRAT = [
  ['prestation', '🤝', 'Contrat de prestation (client)'], ['fournisseur', '📦', 'Contrat fournisseur'],
  ['cdi', '🧑‍💼', 'Salarié — CDI'], ['cdd', '⏳', 'Salarié — CDD'], ['freelance', '💻', 'Sous-traitance / freelance'],
  ['stage', '🎓', 'Convention de stage'], ['alternance', '📚', 'Alternance / apprentissage'],
  ['bail', '🏢', 'Bail / location'], ['nda', '🔒', 'Confidentialité (NDA)'], ['autre', '📄', 'Autre']
];
const typeContrat = k => TYPES_CONTRAT.find(t => t[0] === k) || TYPES_CONTRAT[TYPES_CONTRAT.length - 1];
const STATUTS_CONTRAT = { brouillon: 'Brouillon', envoye: 'Envoyé', signe: 'Signé', actif: 'En cours', termine: 'Terminé', resilie: 'Résilié' };

function activiteDefaut(nom) {
  return {
    id: uid(), nom: nom || 'Mon activité', logo: '', forme: '', adresse: '', cp: '', ville: '', pays: 'France',
    siret: '', tvaIntra: '', rcs: '', email: '', tel: '', site: '',
    iban: '', bic: '', banque: '', titulaire: '',
    tvaNonApplicable: false,
    mentionTva: 'TVA non applicable, art. 293 B du CGI',
    conditions: 'Paiement à 30 jours à réception de facture, par virement bancaire.',
    penalites: "En cas de retard de paiement, des pénalités de retard sont exigibles au taux fixé dans les conditions générales, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 € (clients professionnels). Pas d'escompte pour paiement anticipé.",
    mentions: '', noteDevis: 'Devis valable {validite} jours. Bon pour accord : date, signature et mention « Bon pour accord ».',
    delaiPaiement: 30, validiteDevis: 30,
    numerotation: { devis: 'D-{AAAA}-{NUM}', facture: 'F-{AAAA}-{NUM}', avoir: 'AV-{AAAA}-{NUM}', contrat: 'CT-{AAAA}-{NUM}', chiffres: 3, annuel: true },
    compteurs: { devis: {}, facture: {}, avoir: {}, contrat: {} },
    signature: '', soldeInitial: 0, soldeDate: today().slice(0, 4) + '-01-01',
    representant: '', qualiteRep: 'Gérant(e)', metier: '', ape: '', urssaf: '', convention: '', caisseRetraite: '', mutuelle: '',
    couleurDoc: '#5B43AD', styleDoc: 'classique'
  };
}

function etatDefaut() {
  const a = activiteDefaut();
  return {
    version: 1, activiteId: a.id, activites: [a],
    clients: [], catalogue: [], devis: [], factures: [], paiements: [], recurrences: [],
    depenses: [], paies: [], documents: [], rappels: [], relances: clone(RELANCES_DEFAUT),
    postes: [], candidats: [], contrats: [], modelesContrat: clone(MODELES_CONTRAT_V2),
    salaries: [], bulletins: [],
    reglages: { rappelAvant: 3, relanceApres: 7, bienvenue: true, pass: 4005, cotisations: grilleDefaut() }
  };
}
const grilleDefaut = () => GRILLE_DEFAUT.map((l, i) => Object.assign({ id: 'g' + i, actif: true }, clone(l)));

/* ---------- Stockage : l'état dans localStorage, les fichiers dans IndexedDB ---------- */
let S = etatDefaut();
function charger() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) S = migrer(JSON.parse(raw));
  } catch (e) { console.error(e); }
}
function migrer(o) {
  const d = etatDefaut();
  for (const k of Object.keys(d)) if (o[k] === undefined) o[k] = d[k];
  if (!o.activites.length) { o.activites = d.activites; o.activiteId = d.activiteId; }
  o.activites.forEach(a => {
    const base = activiteDefaut(a.nom);
    for (const k of Object.keys(base)) if (a[k] === undefined) a[k] = base[k];
    a.compteurs = Object.assign({ devis: {}, facture: {}, avoir: {}, contrat: {} }, a.compteurs);
    a.numerotation = Object.assign(base.numerotation, a.numerotation);
  });
  o.reglages = Object.assign({}, d.reglages, o.reglages);
  if (!Array.isArray(o.reglages.cotisations) || !o.reglages.cotisations.length) o.reglages.cotisations = grilleDefaut();
  /* Contrats v1 (un seul bloc de texte) → contrats v2 (articles) */
  const anciens = ['m1', 'm2', 'm3'];
  o.modelesContrat = o.modelesContrat.filter(m => !anciens.includes(m.id)).map(m => m.articles ? m : { id: m.id, nom: m.nom, type: m.type, articles: [{ titre: '', texte: m.corps || '' }] });
  for (const m of MODELES_CONTRAT_V2) if (!o.modelesContrat.some(x => x.id === m.id)) o.modelesContrat.push(clone(m));
  o.contrats.forEach(c => { if (!c.articles) c.articles = c.texte ? [{ id: uid(), titre: '', texte: c.texte, actif: true }] : []; });
  if (!o.activites.some(a => a.id === o.activiteId)) o.activiteId = o.activites[0].id;
  return o;
}
let _saveT = null;
function sauver() {
  clearTimeout(_saveT);
  _saveT = setTimeout(() => {
    try { localStorage.setItem(STORE, JSON.stringify(S)); }
    catch (e) {
      toast(e && e.name === 'QuotaExceededError' ? '⚠️ Stockage plein — téléchargez une sauvegarde et allégez le logo.'
        : '⚠️ Ce navigateur bloque l\'enregistrement : ouvrez NaoFactu.html directement depuis le dossier.', 5000);
    }
  }, 120);
}

const IDB = (() => {
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((ok, ko) => {
      const r = indexedDB.open('naofactu-fichiers', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('f');
      r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await db();
    return new Promise((ok, ko) => {
      const t = d.transaction('f', mode), st = t.objectStore('f'); const req = fn(st);
      t.oncomplete = () => ok(req && req.result); t.onerror = () => ko(t.error);
    });
  }
  return {
    put: (id, v) => tx('readwrite', s => s.put(v, id)),
    get: id => tx('readonly', s => s.get(id)),
    del: id => tx('readwrite', s => s.delete(id)),
    keys: () => tx('readonly', s => s.getAllKeys()),
    clear: () => tx('readwrite', s => s.clear())
  };
})();

function lireFichier(file) {
  return new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok({ nom: file.name, type: file.type || 'application/octet-stream', taille: file.size, data: r.result });
    r.onerror = () => ko(r.error); r.readAsDataURL(file);
  });
}
/* Range un fichier dans IndexedDB et renvoie la petite fiche gardée dans l'état. */
async function stockerFichier(file) {
  const f = await lireFichier(file), id = 'f' + uid();
  await IDB.put(id, f);
  return { id, nom: f.nom, type: f.type, taille: f.taille };
}
async function ouvrirFichier(ref) {
  if (!ref) return;
  const f = await IDB.get(ref.id);
  if (!f) { toast('Fichier introuvable dans ce navigateur.'); return; }
  const blob = await (await fetch(f.data)).blob();
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) telecharger(f.nom, blob);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function telecharger(nom, blobOuTexte, type) {
  const blob = blobOuTexte instanceof Blob ? blobOuTexte : new Blob([blobOuTexte], { type: type || 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------- Activité courante ---------- */
const act = () => S.activites.find(a => a.id === S.activiteId) || S.activites[0];
const mine = list => list.filter(x => x.activiteId === S.activiteId);
const byId = (list, id) => list.find(x => x.id === id);
const client = id => byId(S.clients, id);
const clientNom = id => { const c = client(id); return c ? (c.entreprise || c.nom || 'Client') : 'Client supprimé'; };

/* ---------- Calculs d'un devis / d'une facture ---------- */
function ligneHT(l) { return num(l.qte) * num(l.pu) * (1 - num(l.remise) / 100); }
function totaux(doc) {
  const a = byId(S.activites, doc.activiteId) || act();
  const franchise = !!a.tvaNonApplicable;
  const coef = 1 - num(doc.remiseGlobale) / 100;
  let brut = 0; const parTaux = {};
  for (const l of doc.lignes || []) {
    const b = ligneHT(l); brut += b;
    const taux = franchise ? 0 : num(l.tva);
    const base = b * coef;
    parTaux[taux] = parTaux[taux] || { base: 0, tva: 0 };
    parTaux[taux].base += base; parTaux[taux].tva += base * taux / 100;
  }
  const ht = r2(brut * coef), tva = r2(sum(Object.values(parTaux), t => t.tva));
  return { brut: r2(brut), remise: r2(brut - brut * coef), ht, tva, ttc: r2(ht + tva), parTaux, franchise };
}

/* ---------- Factures : paiements, avoirs, reste dû, statut réel ---------- */
const paiementsDe = f => S.paiements.filter(p => p.factureId === f.id);
const payeDe = f => r2(sum(paiementsDe(f), p => num(p.montant)));
const avoirsDe = f => S.factures.filter(x => x.type === 'avoir' && x.factureLieeId === f.id && x.numero && x.statut !== 'annulee');
function restantDe(f) {
  if (f.type === 'avoir' || f.statut === 'annulee' || f.statut === 'brouillon') return 0;
  return Math.max(0, r2(totaux(f).ttc - payeDe(f) - sum(avoirsDe(f), a => totaux(a).ttc)));
}
function statutFacture(f) {
  if (f.statut === 'annulee') return 'annulee';
  if (f.statut === 'brouillon') return 'brouillon';
  if (f.type === 'avoir') return 'envoyee';
  const t = totaux(f).ttc, reste = restantDe(f);
  if (t > 0 && reste <= 0.004) return 'payee';
  if (f.echeance && f.echeance < today()) return 'retard';
  if (payeDe(f) > 0) return 'partielle';
  return f.statut; // envoyee | vue | en_attente
}
function joursRetard(f) { return f.echeance ? Math.max(0, diffDays(f.echeance, today())) : 0; }
function statutDevis(d) {
  if ((d.statut === 'envoye' || d.statut === 'brouillon') && d.date && addDays(d.date, d.validite || 30) < today()) return 'expire';
  return d.statut;
}
function pill(statut, libelles) { return `<span class="pill ${statut}">${esc(libelles[statut] || statut)}</span>`; }
const pillF = f => pill(statutFacture(f), STATUTS_FACTURE);
const pillD = d => pill(statutDevis(d), STATUTS_DEVIS);

/* ---------- Numérotation chronologique personnalisable ---------- */
function formaterNumero(a, type, date, n) {
  const modele = a.numerotation[type] || '{NUM}', d = parseISO(date || today());
  return modele.replace(/\{AAAA\}/g, d.getFullYear()).replace(/\{AA\}/g, String(d.getFullYear()).slice(2))
    .replace(/\{MM\}/g, pad(d.getMonth() + 1)).replace(/\{NUM\}/g, pad(n, a.numerotation.chiffres || 3));
}
function cleCompteur(a, date) { return a.numerotation.annuel ? String(parseISO(date || today()).getFullYear()) : 'tout'; }
function prochainNumero(type, date, activite) {
  const a = activite || act(), k = cleCompteur(a, date);
  return formaterNumero(a, type, date, (a.compteurs[type][k] || 0) + 1);
}
function attribuerNumero(type, date, activite) {
  const a = activite || act(), k = cleCompteur(a, date);
  a.compteurs[type][k] = (a.compteurs[type][k] || 0) + 1;
  return formaterNumero(a, type, date, a.compteurs[type][k]);
}

/* ---------- Dépenses ---------- */
function depTTC(d) { return num(d.ttc); }
function depTVA(d) { return num(d.tva); }
function depHT(d) { return r2(num(d.ttc) - num(d.tva)); }

/* ---------- Récurrences : génère les factures dues ---------- */
const FREQ = { mensuelle: 1, trimestrielle: 3, semestrielle: 6, annuelle: 12 };
function genererRecurrences() {
  let n = 0; const auj = today();
  for (const r of S.recurrences) {
    if (!r.actif) continue;
    const src = byId(S.factures, r.sourceId);
    if (!src) { r.actif = false; continue; }
    let garde = 0;
    while (r.prochaine && r.prochaine <= auj && (!r.fin || r.prochaine <= r.fin) && garde++ < 24) {
      const a = byId(S.activites, src.activiteId) || act();
      const f = {
        id: uid(), activiteId: src.activiteId, type: 'facture', numero: '', clientId: src.clientId,
        date: r.prochaine, echeance: addDays(r.prochaine, a.delaiPaiement || 30), statut: 'brouillon',
        objet: src.objet, lignes: clone(src.lignes), remiseGlobale: src.remiseGlobale || 0,
        notes: src.notes || '', conditions: src.conditions || '', recurrenceId: r.id, relances: [], creeLe: auj
      };
      S.factures.push(f); n++;
      r.derniere = r.prochaine; r.prochaine = addMonths(r.prochaine, FREQ[r.frequence] || 1);
    }
  }
  if (n) sauver();
  return n;
}

/* ---------- Échéances : tout ce qui a une date à venir ou dépassée ---------- */
function evenements(debut, fin) {
  const ev = [], a = act(), avant = num(S.reglages.rappelAvant);
  for (const f of mine(S.factures)) {
    const st = statutFacture(f);
    if (['brouillon', 'annulee', 'payee'].includes(st) || f.type === 'avoir' || !f.echeance) continue;
    const reste = restantDe(f);
    ev.push({ date: f.echeance, type: st === 'retard' ? 'retard' : 'facture', cible: ['facture', f.id],
      titre: (st === 'retard' ? 'En retard · ' : 'Échéance · ') + (f.numero || 'facture') + ' — ' + clientNom(f.clientId), montant: reste });
    if (st !== 'retard' && avant > 0) {
      const d = addDays(f.echeance, -avant);
      if (d >= today()) ev.push({ date: d, type: 'admin', cible: ['facture', f.id], titre: 'Rappel avant échéance · ' + f.numero });
    }
    if (st === 'retard') {
      const derniere = (f.relances || []).slice(-1)[0];
      const d = derniere ? addDays(derniere.date, num(S.reglages.relanceApres) || 7) : today();
      ev.push({ date: d < today() ? today() : d, type: 'retard', cible: ['relance', f.id], titre: 'Relancer · ' + f.numero + ' — ' + clientNom(f.clientId), montant: reste });
    }
  }
  for (const r of mine(S.recurrences)) if (r.actif && r.prochaine) {
    const src = byId(S.factures, r.sourceId);
    ev.push({ date: r.prochaine, type: 'recur', cible: ['recurrences'], titre: 'Facture récurrente · ' + (src ? clientNom(src.clientId) : '') });
  }
  for (const d of mine(S.depenses)) if (d.prevue && !d.payee) ev.push({ date: d.date, type: 'depense', cible: ['depense', d.id], titre: 'Dépense prévue · ' + (d.fournisseur || catDep(d.categorie)[2]), montant: -depTTC(d) });
  for (const d of mine(S.devis)) if (statutDevis(d) === 'envoye') ev.push({ date: addDays(d.date, d.validite || 30), type: 'admin', cible: ['devis', d.id], titre: 'Fin de validité · devis ' + d.numero });
  for (const c of mine(S.candidats)) for (const e of c.entretiens || []) if (!e.fait)
    ev.push({ date: e.date, type: 'rh', cible: ['candidat', c.id], titre: 'Entretien · ' + c.nom + (e.heure ? ' à ' + e.heure : '') });
  for (const c of mine(S.contrats)) {
    if (['resilie', 'termine'].includes(c.statut)) continue;
    if (c.fin) ev.push({ date: c.fin, type: 'contrat', cible: ['contrat', c.id], titre: 'Fin de contrat · ' + c.titre });
    if (c.finEssai) ev.push({ date: c.finEssai, type: 'contrat', cible: ['contrat', c.id], titre: "Fin de période d'essai · " + c.titre });
    if (c.fin && c.preavisJours) ev.push({ date: addDays(c.fin, -num(c.preavisJours)), type: 'contrat', cible: ['contrat', c.id], titre: 'Préavis à donner · ' + c.titre });
    if (c.statut === 'envoye' && c.date) ev.push({ date: addDays(c.date, 7), type: 'contrat', cible: ['contrat', c.id], titre: 'Signature à relancer · ' + c.titre });
  }
  for (const r of S.rappels) if (!r.fait && (!r.activiteId || r.activiteId === a.id)) ev.push({ date: r.date, type: r.type || 'admin', cible: ['rappel', r.id], titre: r.titre, rappel: r });
  return ev.filter(e => e.date && (!debut || e.date >= debut) && (!fin || e.date <= fin)).sort((x, y) => x.date.localeCompare(y.date));
}

/* ---------- Agrégats pour les rapports ---------- */
function periodeBornes(annee, mode, idx) {
  if (mode === 'mois') return [annee + '-' + pad(idx + 1) + '-01', isoDate(new Date(annee, idx + 1, 0))];
  if (mode === 'trimestre') return [annee + '-' + pad(idx * 3 + 1) + '-01', isoDate(new Date(annee, idx * 3 + 3, 0))];
  return [annee + '-01-01', annee + '-12-31'];
}
function agregat(debut, fin) {
  const dans = d => d && d >= debut && d <= fin;
  const facts = mine(S.factures).filter(f => f.numero && f.statut !== 'annulee' && dans(f.date));
  const ventes = facts.filter(f => f.type !== 'avoir'), avoirs = facts.filter(f => f.type === 'avoir');
  const tv = sum(ventes, f => totaux(f).ht) - sum(avoirs, f => totaux(f).ht);
  const tvaC = sum(ventes, f => totaux(f).tva) - sum(avoirs, f => totaux(f).tva);
  const ids = new Set(mine(S.factures).map(f => f.id));
  const pays = S.paiements.filter(p => ids.has(p.factureId) && dans(p.date));
  const deps = mine(S.depenses).filter(d => dans(d.date) && !(d.prevue && !d.payee));
  const parCat = {};
  for (const d of deps) parCat[d.categorie] = (parCat[d.categorie] || 0) + depTTC(d);
  return {
    factures: facts, paiements: pays, depenses: deps,
    factureHT: r2(tv), tvaCollectee: r2(tvaC), factureTTC: r2(sum(ventes, f => totaux(f).ttc) - sum(avoirs, f => totaux(f).ttc)),
    encaisse: r2(sum(pays, p => num(p.montant))),
    depTTC: r2(sum(deps, depTTC)), depHT: r2(sum(deps, depHT)), tvaDeductible: r2(sum(deps, depTVA)), parCat
  };
}
function aEncaisser() {
  const ouv = mine(S.factures).filter(f => !['brouillon', 'annulee'].includes(f.statut) && f.type !== 'avoir' && restantDe(f) > 0);
  return { liste: ouv, total: r2(sum(ouv, restantDe)) };
}
function tresorerie() {
  const a = act(), dep = a.soldeDate || '1900-01-01';
  const ids = new Set(mine(S.factures).map(f => f.id));
  const enc = r2(sum(S.paiements.filter(p => ids.has(p.factureId) && p.date >= dep && p.date <= today()), p => num(p.montant)));
  const deps = r2(sum(mine(S.depenses).filter(d => d.date >= dep && d.date <= today() && !(d.prevue && !d.payee)), depTTC));
  const prevues = r2(sum(mine(S.depenses).filter(d => d.prevue && !d.payee), depTTC));
  const solde = r2(num(a.soldeInitial) + enc - deps);
  const ae = aEncaisser().total;
  return { initial: num(a.soldeInitial), depuis: dep, encaisse: enc, depenses: deps, solde, aEncaisser: ae, prevues, projete: r2(solde + ae - prevues) };
}
