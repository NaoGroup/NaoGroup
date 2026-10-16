/* ============================================================
   NaoBudget — import depuis Excel (.xlsx) ou CSV
   Tout se fait dans le navigateur, sans aucune librairie :
   un .xlsx est un zip de fichiers XML, on l'ouvre à la main.
   ============================================================ */

/* ---------- 1. Ouvrir le zip ---------- */
function unzip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Ce fichier n'est pas un classeur Excel lisible (zip introuvable).");
  const n = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  const td = new TextDecoder('utf-8'), entries = {};
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    const method = dv.getUint16(off + 10, true);
    const csize = dv.getUint32(off + 20, true);
    const nameLen = dv.getUint16(off + 28, true);
    const extraLen = dv.getUint16(off + 30, true);
    const cmtLen = dv.getUint16(off + 32, true);
    const lho = dv.getUint32(off + 42, true);
    const name = td.decode(u8.subarray(off + 46, off + 46 + nameLen));
    const nl = dv.getUint16(lho + 26, true), xl = dv.getUint16(lho + 28, true);
    const start = lho + 30 + nl + xl;
    entries[name] = { method, data: u8.subarray(start, start + csize) };
    off += 46 + nameLen + extraLen + cmtLen;
  }
  return entries;
}
async function inflate(entry) {
  if (!entry) return null;
  if (entry.method === 0) return entry.data;
  if (typeof DecompressionStream === 'undefined')
    throw new Error("Ce navigateur ne sait pas décompresser le fichier. Enregistrez le classeur en .csv et réessayez.");
  const s = new Blob([entry.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

/* ---------- 2. Lire les feuilles ---------- */
const colOf = ref => {
  let n = 0;
  for (const ch of ref) { const c = ch.charCodeAt(0); if (c >= 65 && c <= 90) n = n * 26 + (c - 64); else break; }
  return n - 1;
};
async function readXlsx(buf) {
  const files = unzip(new Uint8Array(buf));
  const dec = new TextDecoder('utf-8');
  const xml = async n => {
    const raw = await inflate(files[n]);
    return raw ? new DOMParser().parseFromString(dec.decode(raw), 'application/xml') : null;
  };
  const shared = [];
  const sdoc = await xml('xl/sharedStrings.xml');
  if (sdoc) for (const si of sdoc.getElementsByTagName('si')) {
    let s = ''; for (const t of si.getElementsByTagName('t')) s += t.textContent;
    shared.push(s);
  }
  /* Nom lisible des feuilles, quand le classeur le donne. */
  const noms = [];
  const wdoc = await xml('xl/workbook.xml');
  if (wdoc) for (const sh of wdoc.getElementsByTagName('sheet')) noms.push(sh.getAttribute('name') || '');

  const names = Object.keys(files)
    .filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort((a, b) => (+a.match(/(\d+)/)[1]) - (+b.match(/(\d+)/)[1]));
  const out = [];
  for (let i = 0; i < names.length; i++) {
    const doc = await xml(names[i]); if (!doc) continue;
    const grid = [];
    for (const row of doc.getElementsByTagName('row')) {
      const r = (+row.getAttribute('r') || (grid.length + 1)) - 1;
      const arr = grid[r] = grid[r] || [];
      for (const c of row.getElementsByTagName('c')) {
        const ci = colOf(c.getAttribute('r') || '');
        if (ci < 0) continue;
        const t = c.getAttribute('t');
        let v = '';
        if (t === 's') { const vn = c.getElementsByTagName('v')[0]; v = vn ? (shared[+vn.textContent] || '') : ''; }
        else if (t === 'inlineStr') { for (const tt of c.getElementsByTagName('t')) v += tt.textContent; }
        else { const vn = c.getElementsByTagName('v')[0]; v = vn ? vn.textContent : ''; }
        arr[ci] = v;
      }
    }
    out.push({ name: noms[i] || ('Feuille ' + (i + 1)), grid });
  }
  if (!out.length) throw new Error("Aucune feuille de calcul trouvée dans ce classeur.");
  return out;
}

/* ---------- 3. CSV ---------- */
function parseCSV(txt) {
  txt = txt.replace(/^﻿/, '');
  const head = txt.slice(0, 4000);
  const sep = [';', ',', '\t'].map(s => [s, (head.split(s).length)]).sort((a, b) => b[1] - a[1])[0][0];
  const grid = []; let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) {
      if (ch === '"') { if (txt[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); grid.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); grid.push(row); }
  return grid;
}

/* ---------- 4. Comprendre la grille ---------- */
const CAT_RE = /^(logement|transport|imp[oô]ts?|taxes?|abonnements?|cotisations?|assurances?|sant[ée]|loisirs?|banque|cr[ée]dits?|enfants?|animaux?|alimentation|maison|v[ée]hicule|divers|autres?)/i;
const BLOC_REV = /^revenus?\b|^entr[ée]es?\b|^recettes?\b/;
const BLOC_FIX = /^d[ée]penses? fixes|^charges? fixes|^fixes$/;
const BLOC_VAR = /^d[ée]penses? variables|^charges? variables|^variables$/;
const SKIP_RE = /^(total|sous.total|reste|solde|balance|r[ée]sultat|cumul)/;
const MOIS_RE = [/^janv/, /^f[ée]vr/, /^mars/, /^avr/, /^mai/, /^juin/, /^juil/, /^ao[uû]/, /^sept/, /^octo/, /^nove/, /^d[ée]ce/];

function num(v) {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return Math.round(v * 100) / 100;
  const s = String(v).trim();
  if (!s || /^[-–—\s]+$/.test(s)) return 0;
  return parseNum(s);
}
function analyzeGrid(grid) {
  /* a. trouver la ligne d'en-tête : celle qui aligne le plus de noms de mois */
  let hdr = -1, cols = null, best = 0;
  for (let r = 0; r < Math.min(grid.length, 40); r++) {
    const row = grid[r] || [];
    const found = new Array(12).fill(-1);
    for (let c = 0; c < row.length; c++) {
      const t = noAcc(row[c]).trim();
      if (!t) continue;
      MOIS_RE.forEach((re, m) => { if (found[m] < 0 && re.test(t)) found[m] = c; });
    }
    const n = found.filter(x => x >= 0).length;
    if (n > best) { best = n; hdr = r; cols = found; }
  }
  if (best < 6) throw new Error("Impossible de repérer les colonnes des mois (Janvier, Février…) dans cette feuille.");
  /* les mois manquants sont déduits par continuité */
  const known = cols.map((c, i) => [c, i]).filter(x => x[0] >= 0);
  const pas = known.length > 1 ? Math.round((known[known.length - 1][0] - known[0][0]) / (known[known.length - 1][1] - known[0][1])) : 1;
  for (let m = 0; m < 12; m++) if (cols[m] < 0) cols[m] = known[0][0] + (m - known[0][1]) * pas;

  /* b. colonne « Jour » éventuelle, et colonnes de libellé (à gauche des mois) */
  const hrow = grid[hdr] || [];
  let dayCol = -1;
  for (let c = 0; c < cols[0]; c++) if (/^jour/.test(noAcc(hrow[c]).trim())) dayCol = c;
  const csvNao = /^bloc$/i.test(String((grid[hdr] || [])[0] || '').trim());
  const catCol = csvNao ? 1 : -1;

  /* c. parcourir les lignes */
  const lignes = [];
  let bloc = null, cat = null, cats = new Set();
  for (let r = hdr + 1; r < grid.length; r++) {
    const row = grid[r] || [];
    const vals = cols.map(c => num(row[c]));
    const vide = vals.every(v => !v);
    let label = '', lc = -1;
    for (let c = 0; c < cols[0]; c++) {
      if (c === dayCol) continue;
      const t = String(row[c] === undefined ? '' : row[c]).trim();
      if (t && !/^\d+([.,]\d+)?$/.test(t)) { label = t; lc = c; break; }
    }
    if (csvNao) {
      const b = noAcc(row[0]).trim();
      if (BLOC_REV.test(b)) bloc = 'rev'; else if (BLOC_FIX.test(b)) bloc = 'fix'; else if (BLOC_VAR.test(b)) bloc = 'var';
      const cc = String(row[catCol] || '').trim();
      cat = cc || null; if (cat) cats.add(cat);
      const poste = String(row[2] || '').trim();
      if (!poste) continue;
      lignes.push({ bloc: bloc || 'var', cat, label: poste, day: dayCol >= 0 ? num(row[dayCol]) : 0, vals });
      continue;
    }
    if (!label && vide) continue;
    const L = noAcc(label).trim();
    if (BLOC_REV.test(L) && vide) { bloc = 'rev'; cat = null; continue; }
    if (BLOC_FIX.test(L)) { bloc = 'fix'; cat = null; continue; }
    if (BLOC_VAR.test(L)) { bloc = 'var'; cat = null; continue; }
    if (SKIP_RE.test(L)) continue;
    if (!label) continue;
    if (bloc === 'fix' && vide && CAT_RE.test(label) && label.length < 42) { cat = label; cats.add(cat); continue; }
    if (bloc === null) bloc = 'rev';
    lignes.push({ bloc, cat: bloc === 'fix' ? (cat || 'Divers') : null, label,
      day: dayCol >= 0 ? num(row[dayCol]) : 0, vals });
  }
  const gardees = lignes.filter(l => l.label && (l.vals.some(v => v) || l.label.length > 1));
  if (!gardees.length) throw new Error("Aucune ligne de budget n'a été reconnue dans cette feuille.");
  return { lignes: gardees, cats: [...cats], hdr, cols };
}

/* ---------- 5. Appliquer ---------- */
function applyImport(res, mode) {
  const y = Y();
  const mk = l => {
    const o = ln(l.label, l.day >= 1 && l.day <= 31 ? Math.round(l.day) : null, {});
    o.v = l.vals.map(v => +v || 0);
    return o;
  };
  if (mode === 'replace') { y.revenus = []; y.fixes = []; y.variables = []; }
  const catOf = name => {
    let c = y.fixes.find(x => noAcc(x.name) === noAcc(name));
    if (!c) { c = { id: uid(), name, lines: [] }; y.fixes.push(c); }
    return c;
  };
  res.lignes.forEach(l => {
    const o = mk(l);
    if (l.bloc === 'rev') y.revenus.push(o);
    else if (l.bloc === 'var') y.variables.push(o);
    else catOf(l.cat || 'Divers').lines.push(o);
  });
  if (!y.revenus.length) y.revenus.push(ln('Salaire', 28, {}));
  if (!y.fixes.length) y.fixes.push({ id: uid(), name: 'Logement', lines: [ln('Loyer', 5, {})] });
  if (!y.variables.length) y.variables.push(ln('Courses alimentaires', null, {}));
  save();
}

/* ---------- 6. La fenêtre d'import ---------- */
let impCtx = null;
function closeImport() { const n = el('impbg'); if (n) n.remove(); impCtx = null; }

async function startImport(file) {
  let feuilles;
  try {
    const nm = file.name.toLowerCase();
    if (/\.(csv|txt|tsv)$/.test(nm)) feuilles = [{ name: file.name, grid: parseCSV(await file.text()) }];
    else if (/\.(xlsx|xlsm)$/.test(nm)) feuilles = await readXlsx(await file.arrayBuffer());
    else if (/\.xls$/.test(nm)) throw new Error("Les vieux fichiers .xls ne sont pas lisibles ici. Dans Excel : Fichier → Enregistrer sous → Classeur Excel (.xlsx), puis réessayez.");
    else throw new Error("Format non reconnu. Attendu : .xlsx, .xlsm ou .csv.");
  } catch (e) { alert('⚠️ ' + e.message); return; }

  /* on analyse chaque feuille, on garde celles qui ressemblent à un budget */
  const ok = [];
  feuilles.forEach(f => { try { ok.push({ name: f.name, res: analyzeGrid(f.grid) }); } catch (e) { /* feuille ignorée */ } });
  if (!ok.length) {
    alert("⚠️ Aucune feuille ne ressemble à un tableau de budget.\n\nIl faut une ligne d'en-tête avec les mois (Janvier, Février…) et, à gauche, le nom des postes.");
    return;
  }
  ok.sort((a, b) => b.res.lignes.length - a.res.lignes.length);
  impCtx = { feuilles: ok, i: 0, mode: 'replace' };
  drawImport();
}

function drawImport() {
  if (!impCtx) return;
  const { res, name } = impCtx.feuilles[impCtx.i];
  const nRev = res.lignes.filter(l => l.bloc === 'rev').length;
  const nFix = res.lignes.filter(l => l.bloc === 'fix').length;
  const nVar = res.lignes.filter(l => l.bloc === 'var').length;
  const tot = l => sum(l.vals.map(v => +v || 0));
  const kind = b => b === 'rev' ? '💰 Revenu' : b === 'fix' ? '🏠 Fixe' : '🛍️ Variable';

  let bg = el('impbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'impbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onImportClick);
  }
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>📊</span><span>Importer depuis Excel</span>
      <span class="sub">${esc(name)}</span><span class="right"></span>
      <button class="xclose" data-impclose="1" title="Fermer">✕</button></div>
    <div class="mbd">
      ${impCtx.feuilles.length > 1 ? `<div class="sharebar"><span>Feuille :</span>
        ${impCtx.feuilles.map((f, i) => `<button class="qbtn ${i === impCtx.i ? 'on' : ''}" data-sheet="${i}">${esc(f.name)} (${f.res.lignes.length})</button>`).join('')}</div>` : ''}
      <div class="sharebar">
        <span>Ce que je vais faire de l'année ${state.activeYear} :</span>
        <button class="qbtn ${impCtx.mode === 'replace' ? 'on' : ''}" data-mode="replace">🔄 Remplacer</button>
        <button class="qbtn ${impCtx.mode === 'add' ? 'on' : ''}" data-mode="add">➕ Ajouter à l'existant</button>
      </div>
      <p style="font-size:13.5px;color:var(--ink-2);margin:2px 0 14px">
        <b>${res.lignes.length}</b> ligne(s) reconnue(s) : ${nRev} revenu(s), ${nFix} dépense(s) fixe(s)
        ${res.cats.length ? `dans ${res.cats.length} catégorie(s) — ${esc(res.cats.join(', '))}` : ''}, ${nVar} variable(s).
        Vérifiez la liste, puis importez.</p>
      <table class="dt"><thead><tr><th>Bloc</th><th>Catégorie</th><th>Poste</th>
        <th class="r">Jour</th><th class="r">Total année</th></tr></thead>
        <tbody>${res.lignes.map(l => `<tr>
          <td style="white-space:nowrap">${kind(l.bloc)}</td>
          <td style="color:var(--ink-3)">${esc(l.cat || '—')}</td>
          <td>${esc(l.label)}</td>
          <td class="r" style="color:var(--ink-3)">${l.day >= 1 && l.day <= 31 ? Math.round(l.day) : '–'}</td>
          <td class="r" style="font-variant-numeric:tabular-nums">${money(tot(l))}</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="mft">
      <span class="dtot">⚠️ Les montants du fichier écrasent ce qui est affiché ${impCtx.mode === 'replace' ? '(toutes les lignes actuelles de l’année sont remplacées)' : '(les lignes sont ajoutées)'}.</span>
      <span class="right"></span>
      <button class="btn" data-impclose="1">Annuler</button>
      <button class="btn primary" data-impgo="1">📥 Importer ${res.lignes.length} ligne(s)</button>
    </div></div>`;
}
function onImportClick(e) {
  if (!impCtx) return;
  if (e.target.id === 'impbg') return closeImport();
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.impclose) return closeImport();
  if (b.dataset.sheet) { impCtx.i = +b.dataset.sheet; drawImport(); return; }
  if (b.dataset.mode) { impCtx.mode = b.dataset.mode; drawImport(); return; }
  if (b.dataset.impgo) {
    const { res } = impCtx.feuilles[impCtx.i], mode = impCtx.mode;
    if (mode === 'replace' && !confirm(`Remplacer toutes les lignes de ${state.activeYear} par les ${res.lignes.length} lignes du fichier ?\n\nPensez à avoir exporté une sauvegarde si vous voulez pouvoir revenir en arrière.`)) return;
    applyImport(res, mode);
    closeImport(); view = 'annuel'; render();
    toast(`📥 ${res.lignes.length} ligne(s) importée(s) depuis Excel`);
  }
}
