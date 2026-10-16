/* ============================================================
   NaoBudget — impression et PDF
   On n'imprime pas l'écran : on fabrique un document à part,
   en paysage, avec un en-tête, un récapitulatif, et seulement
   les parties demandées.
   ============================================================ */

const PR_SECTIONS = [
  { k: 'table',  em: '📊', lib: 'Le tableau annuel complet', def: true },
  { k: 'graph',  em: '🥧', lib: 'Les graphiques (barres, épargne, camemberts)', def: false },
  { k: 'mois',   em: '📆', lib: 'Le détail du mois', def: false },
  { k: 'agenda', em: '📅', lib: 'L’agenda des prélèvements du mois', def: false },
  { k: 'notes',  em: '📝', lib: 'Mes notes', def: false }
];
let prChoix = null;

function closePrint() { const n = el('prbg'); if (n) n.remove(); }

function openPrint() {
  if (!prChoix) { prChoix = {}; PR_SECTIONS.forEach(s => prChoix[s.k] = s.def); }
  let bg = el('prbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'prbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onPrintClick);
    bg.addEventListener('change', e => {
      const c = e.target.closest('[data-pr]'); if (!c) return;
      prChoix[c.dataset.pr] = c.checked;
      const go = el('prgo');
      if (go) go.disabled = !PR_SECTIONS.some(s => prChoix[s.k]);
    });
  }
  const mois = MONTHS[selMonth];
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>🖨️</span><span>Imprimer ou enregistrer en PDF</span>
      <span class="sub">${state.activeYear}</span><span class="right"></span>
      <button class="xclose" data-prclose="1" title="Fermer">✕</button></div>
    <div class="mbd">
      <p style="margin:0 0 14px;font-size:13.5px;color:var(--ink-2)">
        Cochez ce que le document doit contenir. Chaque partie commence sur une nouvelle page.</p>
      ${PR_SECTIONS.map(s => `<label class="chk">
        <input type="checkbox" data-pr="${s.k}" ${prChoix[s.k] ? 'checked' : ''}>
        <span>${s.em} ${s.lib}${(s.k === 'mois' || s.k === 'agenda') ? ` — <b>${mois}</b>` : ''}</span>
      </label>`).join('')}
      <p style="margin:16px 0 0;font-size:12.5px;color:var(--ink-3);line-height:1.7">
        📄 Format paysage, en-tête avec le total de l'année et la date d'édition.<br>
        🎨 Les couleurs des statuts sont conservées — pensez à cocher
        « Graphiques d'arrière-plan » dans la fenêtre d'impression si elles manquent.<br>
        💾 Pour un PDF : choisissez <b>« Enregistrer au format PDF »</b> comme imprimante.</p>
    </div>
    <div class="mft">
      <span class="dtot">Document : <b id="prnb">${PR_SECTIONS.filter(s => prChoix[s.k]).length}</b> partie(s)</span>
      <span class="right"></span>
      <button class="btn" data-prclose="1">Annuler</button>
      <button class="btn primary" id="prgo" data-prgo="1">🖨️ Imprimer</button>
    </div></div>`;
}

function onPrintClick(e) {
  if (e.target.id === 'prbg') return closePrint();
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.prclose) return closePrint();
  if (b.dataset.prgo) { closePrint(); buildAndPrint(); }
}

/* ---------- Fabrication du document ---------- */
function prHead() {
  const c = calc(), tSav = sum(savingsMonths());
  const d = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const kp = (em, lib, val, cls) =>
    `<div class="pk"><span>${em} ${lib}</span><b class="${cls || ''}">${money(val)}</b></div>`;
  return `<div class="pr-head">
      <svg viewBox="0 0 40 40" aria-hidden="true"><use href="#nao-logo"/></svg>
      <div class="pr-ti"><h1>Budget ${state.activeYear}</h1>
        <div class="pr-sub">NaoBudget — édité le ${d}</div></div>
      <div class="pr-leg">✅ vert = payé&nbsp;&nbsp;·&nbsp;&nbsp;❌ rouge = rejeté&nbsp;&nbsp;·&nbsp;&nbsp;
        sans couleur = inscrit&nbsp;&nbsp;·&nbsp;&nbsp;📋 = case détaillée</div>
    </div>
    <div class="pr-kpis">
      ${kp('💰', 'Revenus', c.tInc)}
      ${kp('🏠', 'Dépenses fixes', c.tFix)}
      ${kp('🛍️', 'Dépenses variables', c.tVar)}
      ${tSav ? kp('🐖', 'Mis de côté', tSav) : ''}
      ${kp('💳', 'Reste au total', c.tR2, c.tR2 >= 0 ? 'pos' : 'neg')}
    </div>`;
}
/* Les identifiants des cellules calculées sont neutralisés dans la copie
   imprimée : sans cela, deux éléments porteraient le même id et la mise à
   jour des totaux à l'écran irait écrire dans le document. */
const prClean = h => h.replace(/ id="(rt_[^"]*|sm_[^"]*|rs[12][^"]*)"/g, ' data-pid="$1"');

function buildAndPrint() {
  const vueAvant = view;
  let h = prHead();
  const sec = (titre, contenu) => `<section class="pr-sec"><h2 class="pr-h2">${titre}</h2>${contenu}</section>`;
  if (prChoix.table)  h += sec(`📊 Tableau ${state.activeYear}`, viewAnnuel());
  if (prChoix.graph)  h += sec('🥧 Graphiques', viewGraph());
  if (prChoix.mois)   h += sec(`📆 ${MONTHS[selMonth]} ${state.activeYear} — le détail`, viewMois());
  if (prChoix.agenda) h += sec(`📅 ${MONTHS[selMonth]} ${state.activeYear} — agenda des prélèvements`, viewAgenda());
  if (prChoix.notes && (state.notes || '').trim())
    h += sec('📝 Mes notes', '<pre class="pr-notes">' + esc(state.notes) + '</pre>');
  view = vueAvant;

  const old = el('print-root'); if (old) old.remove();
  const root = document.createElement('div');
  root.id = 'print-root';
  root.innerHTML = prClean(h);
  /* les sélecteurs de mois et les barres d'outils n'ont rien à faire sur papier */
  root.querySelectorAll('.msel, .sharebar, .legend-st, .addrow, .blkhd .bha, .card > .hd .right ~ *')
      .forEach(n => n.remove());
  document.body.appendChild(root);
  document.body.classList.add('printing');
  setTimeout(() => window.print(), 60);
}
function afterPrint() {
  document.body.classList.remove('printing');
  const r = el('print-root'); if (r) r.remove();
}
window.addEventListener('afterprint', afterPrint);
