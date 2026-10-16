/* ============================================================
   NaoBudget — recopier une case sur d'autres mois
   L'électricité au même montant, le même jour, partagée en deux :
   on la saisit une fois, on la recopie sur les mois voulus —
   avec son détail et ses parts.
   ============================================================ */

/* Presse-papiers interne : on garde le détail, qu'un copier-coller
   du système ne saurait pas transporter. */
let presse = null;

function contenuCase(l, m) {
  const it = (l.d && l.d[m]) ? l.d[m] : null;
  return {
    v: +l.v[m] || 0,
    s: l.s[m] || '',
    items: it ? JSON.parse(JSON.stringify(it)) : null,
    libelle: l.label
  };
}
function poseCase(l, m, c, opts) {
  if (c.items && c.items.length && (!opts || opts.detail !== false)) {
    if (!l.d) l.d = {};
    l.d[m] = c.items.map(x => ({ ...x, id: uid() }));
    recalcCell(l, m);
  } else {
    if (l.d && l.d[m]) delete l.d[m];
    l.v[m] = c.v;
  }
  if (opts && opts.statut) l.s[m] = c.s;
}
const resumeCase = c => {
  const bouts = [money(c.v)];
  if (c.items && c.items.length) {
    const parts = [...new Set(c.items.map(x => +x.q))];
    bouts.push(`📋 ${c.items.length} ligne(s) de détail`);
    bouts.push(parts.length === 1
      ? (parts[0] === 100 ? 'tout à ma charge' : parts[0] + ' % à ma charge')
      : 'parts variables');
  }
  if (c.s) bouts.push(ST_ICON[c.s] + ' ' + ST_NAME[c.s]);
  return bouts.join(' · ');
};

/* ---------- Copier / coller au clavier ---------- */
function copierCellule(cell) {
  const tr = cell.closest('tr.row'); if (!tr) return false;
  const l = findLine(tr.dataset.path, tr.dataset.id); if (!l) return false;
  const m = +cell.dataset.m;
  if (!+l.v[m] && !(l.d && l.d[m])) { toast('🤷 Cette case est vide, rien à copier'); return false; }
  presse = contenuCase(l, m);
  presse.mois = m;
  toast(`📋 ${MONTHS[m]} copié — ${resumeCase(presse)}`);
  return true;
}
function collerCellule(cell) {
  if (!presse) { toast('🤷 Rien à coller : copiez d’abord une case (Ctrl+C)'); return false; }
  const tr = cell.closest('tr.row'); if (!tr) return false;
  const l = findLine(tr.dataset.path, tr.dataset.id); if (!l) return false;
  const m = +cell.dataset.m;
  poseCase(l, m, presse, { detail: true, statut: false });
  save(); render();
  toast(`✅ Collé sur ${MONTHS[m]} — ${money(l.v[m])}`);
  return true;
}

/* ---------- La fenêtre « recopier sur… » ---------- */
let copCtx = null;
function closeCopie() { const n = el('copbg'); if (n) n.remove(); copCtx = null; }

function openCopie(path, id, mDepart) {
  const l = findLine(path, id); if (!l) return;
  const remplis = l.v.map((x, i) => (+x || (l.d && l.d[i] && l.d[i].length)) ? i : -1).filter(i => i >= 0);
  if (!remplis.length) { toast('✋ Remplissez d’abord une case de cette ligne'); return; }
  const src = (mDepart !== undefined && remplis.includes(mDepart)) ? mDepart
    : (remplis.includes(selMonth) ? selMonth : remplis[0]);
  copCtx = {
    path, id, src,
    cibles: new Set(),
    detail: true,
    statut: false
  };
  drawCopie();
}
function drawCopie() {
  if (!copCtx) return;
  const l = findLine(copCtx.path, copCtx.id); if (!l) return closeCopie();
  const c = contenuCase(l, copCtx.src);
  const rempli = i => !!(+l.v[i] || (l.d && l.d[i] && l.d[i].length));
  let bg = el('copbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'copbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onCopieClick);
    bg.addEventListener('change', e => {
      const k = e.target.dataset.cop;
      if (k) { copCtx[k] = e.target.checked; drawCopie(); }
    });
  }
  const n = copCtx.cibles.size;
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>📋</span><span>Recopier une case</span>
      <span class="sub">${esc(l.label)}</span><span class="right"></span>
      <button class="xclose" data-copclose="1" title="Fermer">✕</button></div>
    <div class="mbd">
      <p class="razlab">La case à recopier</p>
      <div class="moisgrille">
        ${MONTHS.map((nom, i) => `<button class="mbtn ${i === copCtx.src ? 'src' : ''} ${rempli(i) ? 'plein' : ''}"
          data-copsrc="${i}" title="${rempli(i) ? money(l.v[i]) : 'vide'}">${MSHORT[i]}</button>`).join('')}
      </div>
      <div class="copresume"><b>${MONTHS[copCtx.src]}</b> — ${resumeCase(c)}</div>

      <p class="razlab">Vers quels mois ?</p>
      <div class="sharebar">
        <button class="qbtn" data-coptout="1">Toute l'année</button>
        <button class="qbtn" data-coptsuite="1">Les mois suivants</button>
        <button class="qbtn" data-coptvides="1">Les mois vides</button>
        <button class="qbtn" data-coptrien="1">Aucun</button>
      </div>
      <div class="moisgrille grande">
        ${MONTHS.map((nom, i) => `<button class="mbtn ${copCtx.cibles.has(i) ? 'on' : ''} ${i === copCtx.src ? 'src' : ''}"
          data-copcible="${i}" ${i === copCtx.src ? 'disabled' : ''}
          title="${i === copCtx.src ? 'C’est la case de départ' : (rempli(i) ? 'déjà rempli : ' + money(l.v[i]) : 'vide')}">
          ${MSHORT[i]}${rempli(i) && i !== copCtx.src ? '<i class="pt"></i>' : ''}</button>`).join('')}
      </div>

      <p class="razlab">On recopie aussi…</p>
      ${c.items && c.items.length ? `<label class="chk"><input type="checkbox" data-cop="detail" ${copCtx.detail ? 'checked' : ''}>
        <span>📋 <b>Le détail</b> — les ${c.items.length} ligne(s) et leurs parts (moitié-moitié comprise)</span></label>`
      : '<p class="raznote">Cette case n’a pas de détail : seul le montant sera recopié.</p>'}
      <label class="chk"><input type="checkbox" data-cop="statut" ${copCtx.statut ? 'checked' : ''}>
        <span>${c.s ? ST_ICON[c.s] : '○'} <b>Le statut</b> — ${c.s ? ST_NAME[c.s] : 'aucun pour l’instant'}</span></label>
      ${[...copCtx.cibles].some(i => rempli(i))
        ? '<p class="raznote">⚠️ Certains mois choisis contiennent déjà un montant : il sera remplacé.</p>' : ''}
    </div>
    <div class="mft">
      <span class="dtot">${n ? `${n} mois recevront <b>${money(c.v)}</b>` : 'Choisissez au moins un mois'}</span>
      <span class="right"></span>
      <button class="btn" data-copclose="1">Annuler</button>
      <button class="btn primary" data-copgo="1" ${n ? '' : 'disabled'}>📋 Recopier sur ${n} mois</button>
    </div></div>`;
}
function onCopieClick(e) {
  if (!copCtx) return;
  if (e.target.id === 'copbg') return closeCopie();
  const b = e.target.closest('button'); if (!b) return;
  const l = findLine(copCtx.path, copCtx.id); if (!l) return;
  const rempli = i => !!(+l.v[i] || (l.d && l.d[i] && l.d[i].length));
  if (b.dataset.copclose) return closeCopie();
  if (b.dataset.copsrc) { copCtx.src = +b.dataset.copsrc; copCtx.cibles.delete(copCtx.src); drawCopie(); return; }
  if (b.dataset.copcible) {
    const i = +b.dataset.copcible;
    if (copCtx.cibles.has(i)) copCtx.cibles.delete(i); else copCtx.cibles.add(i);
    drawCopie(); return;
  }
  if (b.dataset.coptout) { copCtx.cibles = new Set(MONTHS.map((x, i) => i).filter(i => i !== copCtx.src)); drawCopie(); return; }
  if (b.dataset.coptsuite) { copCtx.cibles = new Set(MONTHS.map((x, i) => i).filter(i => i > copCtx.src)); drawCopie(); return; }
  if (b.dataset.coptvides) { copCtx.cibles = new Set(MONTHS.map((x, i) => i).filter(i => i !== copCtx.src && !rempli(i))); drawCopie(); return; }
  if (b.dataset.coptrien) { copCtx.cibles = new Set(); drawCopie(); return; }
  if (b.dataset.copgo) appliqueCopie();
}
function appliqueCopie() {
  const l = findLine(copCtx.path, copCtx.id); if (!l) return;
  const c = contenuCase(l, copCtx.src);
  const cibles = [...copCtx.cibles].sort((a, b) => a - b);
  cibles.forEach(m => poseCase(l, m, c, { detail: copCtx.detail, statut: copCtx.statut }));
  save(); closeCopie(); render();
  toast(`📋 ${esc(l.label)} recopié sur ${cibles.length} mois — ${money(c.v)} chacun`);
}
