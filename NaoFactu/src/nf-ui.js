/* ============================================================
   NaoFactu — l'interface : navigation, modales, formulaires, thème.
   ============================================================ */
'use strict';

const el = id => document.getElementById(id);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let _toastT = null;
function toast(msg, ms = 2600) {
  const t = el('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('on'), ms);
}

/* ---------- Modales ---------- */
function modal({ titre, sous = '', corps = '', pied = [], taille = '', onOpen, onClose }) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${taille}" role="dialog" aria-modal="true">
    <div class="mhd"><div>${titre}${sous ? `<div class="sub">${sous}</div>` : ''}</div><button class="xclose" type="button" aria-label="Fermer">✕</button></div>
    <div class="mbd">${corps}</div>
    ${pied.length ? '<div class="mft"></div>' : ''}</div>`;
  document.body.appendChild(bg);
  const box = $('.modal', bg);
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = e => { if (e.key === 'Escape' && document.body.lastElementChild === bg) close(); };
  document.addEventListener('keydown', onKey);
  $('.xclose', bg).onclick = close;
  bg.addEventListener('mousedown', e => { if (e.target === bg) bg._down = true; });
  bg.addEventListener('mouseup', e => { if (e.target === bg && bg._down) close(); bg._down = false; });
  const ft = $('.mft', bg);
  pied.forEach(b => {
    if (b === '|') { const s = document.createElement('span'); s.className = 'spacer'; ft.appendChild(s); return; }
    const x = document.createElement('button'); x.type = 'button'; x.className = 'btn ' + (b.cls || ''); x.innerHTML = b.lab;
    x.onclick = () => b.fn(close, box); ft.appendChild(x);
  });
  const m = { bg, box, close };
  onOpen && onOpen(box, m);
  const first = $('input:not([type=hidden]):not([type=checkbox]),select,textarea', box); if (first) setTimeout(() => first.focus(), 40);
  return m;
}
function confirmer(msg, ok = 'Confirmer', danger = false) {
  return new Promise(res => {
    modal({ titre: 'Confirmation', taille: 'narrow', corps: `<p style="margin:0;font-size:14px;line-height:1.6">${msg}</p>`,
      // on répond AVANT de fermer : la fermeture déclenche onClose, qui répondrait « non »
      pied: ['|', { lab: 'Annuler', fn: c => { res(false); c(); } }, { lab: ok, cls: danger ? 'danger primary' : 'primary', fn: c => { res(true); c(); } }],
      onClose: () => res(false) });
  });
}
function demander(titre, label, val = '', type = 'text') {
  return new Promise(res => {
    modal({ titre, taille: 'narrow', corps: `<label class="fl"><span>${label}</span><input class="in" id="dm-v" type="${type}" value="${esc(val)}"></label>`,
      onOpen: b => $('#dm-v', b).addEventListener('keydown', e => { if (e.key === 'Enter') { const v = e.target.value; $('.xclose', b).click(); res(v); } }),
      pied: ['|', { lab: 'Annuler', fn: c => { c(); res(null); } }, { lab: 'Valider', cls: 'primary', fn: (c, b) => { const v = $('#dm-v', b).value; c(); res(v); } }] });
  });
}
function choisirFichiers({ accept = '', multiple = false } = {}) {
  return new Promise(res => {
    const i = el('file-in'); i.value = ''; i.accept = accept; i.multiple = multiple;
    i.onchange = () => res(Array.from(i.files || [])); i.click();
  });
}

/* ---------- Formulaires : un champ = une ligne de HTML ---------- */
function champ(nom, label, val, o = {}) {
  const v = val == null ? '' : val, cls = 'fl' + (o.full ? ' full' : '') + (o.two ? ' two' : '');
  const lab = `<span>${label}${o.aide ? ` <i>${o.aide}</i>` : ''}</span>`;
  const att = `name="${nom}" ${o.req ? 'required' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.num ? 'data-num="1"' : ''} ${o.attrs || ''}`;
  if (o.type === 'select') {
    const opts = o.options.map(x => { const [k, l] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(k)}" ${String(k) === String(v) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
    return `<label class="${cls}">${lab}<select class="in" ${att}>${opts}</select></label>`;
  }
  if (o.type === 'textarea') return `<label class="${cls}">${lab}<textarea class="in ${o.cls || ''}" ${att}>${esc(v)}</textarea></label>`;
  if (o.type === 'check') return `<label class="ck ${o.full ? 'full' : ''}"><input type="checkbox" name="${nom}" ${v ? 'checked' : ''}> ${label}</label>`;
  return `<label class="${cls}">${lab}<input class="in ${o.num ? 'num' : ''}" type="${o.type || 'text'}" ${o.step ? `step="${o.step}"` : ''} value="${esc(v)}" ${att}></label>`;
}
function lireForm(root) {
  const o = {};
  $$('[name]', root).forEach(i => {
    if (i.type === 'checkbox') o[i.name] = i.checked;
    else if (i.dataset.num) o[i.name] = num(i.value);
    else o[i.name] = i.value.trim();
  });
  return o;
}
function manque(root) {
  const r = $$('[required]', root).find(i => !i.value.trim());
  if (r) { r.focus(); r.style.borderColor = 'var(--danger)'; toast('Merci de remplir les champs obligatoires.'); return true; }
  return false;
}
const optionsClients = (vide = true) => (vide ? [['', '— Choisir un client —']] : [])
  .concat(mine(S.clients).sort((a, b) => clientNom(a.id).localeCompare(clientNom(b.id))).map(c => [c.id, clientNom(c.id)]));

/* ---------- Navigation ---------- */
const VUES = {};
let ROUTE = { v: 'accueil', p: {} };
const MENU = [
  ['accueil', '🏠', 'Tableau de bord'], ['clients', '👥', 'Clients'], ['devis', '📝', 'Devis'], ['factures', '🧾', 'Factures'],
  ['paiements', '💳', 'Paiements'], ['depenses', '🛒', 'Dépenses'], ['compta', '📊', 'Comptabilité'], ['paies', '💼', 'Fiches de paie'],
  ['documents', '🗂️', 'Documents'],
  { grp: 'Équipe & contrats' }, ['recrutement', '🧑‍🤝‍🧑', 'Recrutements'], ['contrats', '✍️', 'Contrats'],
  { grp: 'Outils' }, ['calendrier', '📅', 'Échéances'], ['catalogue', '📦', 'Catalogue'],
  { sep: 1 }, ['reglages', '⚙️', 'Paramètres']
];
function badge(v) {
  if (v === 'factures') return mine(S.factures).filter(f => statutFacture(f) === 'retard').length;
  if (v === 'documents') return aClasser().length;
  if (v === 'calendrier') return evenements(null, today()).filter(e => e.type === 'retard' || e.rappel).length;
  return 0;
}
function peindreMenu() {
  const courant = ROUTE.v === 'editeur' ? (ROUTE.p.kind === 'devis' ? 'devis' : 'factures') : ({ contrat: 'contrats', bulletin: 'paies' })[ROUTE.v] || ROUTE.v;
  el('menu').innerHTML = MENU.map(m => {
    if (m.grp) return `<div class="grp">${m.grp}</div>`;
    if (m.sep) return '<div class="sep"></div>';
    const n = badge(m[0]);
    return `<button type="button" data-go="${m[0]}" class="${courant === m[0] ? 'on' : ''}"><span class="em">${m[1]}</span>${m[2]}${n ? `<span class="nb">${n}</span>` : ''}</button>`;
  }).join('');
  el('act-pick').innerHTML = S.activites.length > 1
    ? `<div class="lab">Activité</div><select class="in" id="act-sel">${S.activites.map(a => `<option value="${a.id}" ${a.id === S.activiteId ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select>`
    : `<div class="lab">Activité</div><button class="btn sm" style="width:100%;justify-content:flex-start" data-go="reglages">🏷️ ${esc(act().nom)}</button>`;
  const s = el('act-sel'); if (s) s.onchange = () => { S.activiteId = s.value; sauver(); toast('Activité : ' + act().nom); rendre(); };
}
function go(v, p = {}) {
  if (typeof QUITTER === 'function' && !QUITTER()) return;
  ROUTE = { v, p }; rendre(); window.scrollTo({ top: 0, behavior: 'smooth' }); el('side').classList.remove('open');
}
let QUITTER = null;
function rendre() {
  QUITTER = null;
  const vue = VUES[ROUTE.v] || VUES.accueil, root = el('view');
  root.innerHTML = '';
  try { vue(root, ROUTE.p || {}); }
  catch (e) { console.error(e); root.innerHTML = `<div class="card"><div class="bd">Oups, cet écran a rencontré un problème : <code>${esc(e.message)}</code></div></div>`; }
  peindreMenu();
}
function entete(em, titre, sous, actions = '') {
  return `<div class="phead"><div><h2><span class="em">${em}</span>${titre}</h2>${sous ? `<div class="sub">${sous}</div>` : ''}</div><div class="acts">${actions}</div></div>`;
}
function onglets(liste, actif, attr = 'data-tab') {
  return `<div class="tabs glass">${liste.map(([k, l]) => `<button type="button" ${attr}="${k}" class="${k === actif ? 'on' : ''}">${l}</button>`).join('')}</div>`;
}

/* Actions déclenchées par data-do="nom" : un seul écouteur pour toute l'application. */
const ACT = {};
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g && !e.target.closest('[data-do]')) { e.preventDefault(); const p = g.dataset.p ? JSON.parse(g.dataset.p) : {}; go(g.dataset.go, p); return; }
  const d = e.target.closest('[data-do]');
  if (d && ACT[d.dataset.do]) { e.preventDefault(); e.stopPropagation(); ACT[d.dataset.do](d.dataset, d, e); }
});
const P = o => esc(JSON.stringify(o)); // pour data-p

/* ---------- Thème clair / sombre ---------- */
function themeSombre() {
  const f = document.documentElement.getAttribute('data-theme');
  if (f) return f === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function peindreTheme() {
  const d = themeSombre(), sw = el('theme-switch');
  sw.setAttribute('aria-checked', d ? 'true' : 'false');
  sw.setAttribute('aria-label', d ? 'Passer en thème clair' : 'Passer en thème sombre');
  el('theme-icon').textContent = d ? '🌙' : '☀️';
  el('theme-lab').textContent = d ? 'Thème sombre' : 'Thème clair';
}
function appliquerTheme(t) {
  if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem(THEME_KEY, t || 'auto'); } catch (e) {}
  peindreTheme();
}
function initTheme() {
  peindreTheme();
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.getAttribute('data-theme')) peindreTheme();
  });
  el('theme-switch').addEventListener('click', () => {
    const n = themeSombre() ? 'light' : 'dark';
    if (document.startViewTransition) document.startViewTransition(() => appliquerTheme(n)); else appliquerTheme(n);
  });
}

/* ---------- Petits graphiques en barres (SVG) ---------- */
function barres(series, labels, { h = 190, couleurs = ['var(--accent)', 'var(--accent-3)', 'var(--danger)'] } = {}) {
  const W = 720, pad = 28, max = Math.max(1, ...series.flatMap(s => s.valeurs.map(v => Math.abs(v))));
  const n = labels.length, grp = (W - pad) / n, bw = Math.min(18, (grp - 8) / series.length);
  let s = `<svg viewBox="0 0 ${W} ${h + 24}" role="img">`;
  for (let k = 0; k <= 3; k++) { const y = 6 + (h - 6) * k / 3;
    s += `<line x1="${pad}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--border)" stroke-dasharray="3 4"/>`; }
  labels.forEach((l, i) => {
    const x0 = pad + i * grp + (grp - bw * series.length) / 2;
    series.forEach((se, j) => {
      const v = Math.abs(se.valeurs[i] || 0), bh = (h - 6) * v / max;
      if (bh > 0) s += `<rect class="gbar" style="animation-delay:${i * 30}ms" x="${x0 + j * bw}" y="${h - bh}" width="${bw - 2}" height="${bh}" rx="4" fill="${couleurs[j]}"><title>${esc(se.nom)} · ${esc(l)} : ${money(se.valeurs[i])}</title></rect>`;
    });
    s += `<text x="${pad + i * grp + grp / 2}" y="${h + 16}" text-anchor="middle">${esc(l)}</text>`;
  });
  return s + '</svg>';
}
