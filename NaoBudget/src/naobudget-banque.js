/* ============================================================
   NaoBudget — relevés bancaires
   Lit un relevé LCL (CSV, OFX/QFX) ou le fichier produit par le pont
   NaoBanque (JSON), rapproche chaque opération d'une ligne du budget,
   et l'inscrit dans le détail de la case du mois.
   Rien ne part sur internet : tout est lu dans le navigateur.
   ============================================================ */

/* ---------- Lecture du fichier ---------- */
async function texteFichier(file) {
  const buf = await file.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch (e) { return new TextDecoder('windows-1252').decode(buf); }   /* les exports LCL sont souvent en ISO */
}
const dateFR = s => {
  const m = String(s).trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) { const a = +m[3]; return { j: +m[1], mo: +m[2], an: a < 100 ? 2000 + a : a }; }
  const i = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);       /* ISO */
  if (i) return { j: +i[3], mo: +i[2], an: +i[1] };
  const o = String(s).trim().match(/^(\d{4})(\d{2})(\d{2})/);         /* OFX : 20260901 */
  if (o) return { j: +o[3], mo: +o[2], an: +o[1] };
  return null;
};

function lireCSVReleve(txt) {
  const grid = parseCSV(txt).filter(r => r.some(c => String(c).trim()));
  if (!grid.length) return [];
  /* Repérage des colonnes : par l'en-tête si elle existe, sinon au flair. */
  let hdr = -1, cDate = -1, cLib = -1, cMont = -1, cDeb = -1, cCred = -1;
  for (let r = 0; r < Math.min(grid.length, 8); r++) {
    const row = grid[r].map(c => noAcc(c).trim());
    const iD = row.findIndex(c => /^date/.test(c));
    if (iD < 0) continue;
    hdr = r; cDate = iD;
    row.forEach((c, i) => {
      if (/libell|description|nature|motif|operation|intitul/.test(c)) cLib = i;
      else if (/^montant|^amount/.test(c)) cMont = i;
      else if (/^debit/.test(c)) cDeb = i;
      else if (/^credit/.test(c)) cCred = i;
    });
    break;
  }
  const lignes = [];
  const debut = hdr >= 0 ? hdr + 1 : 0;
  for (let r = debut; r < grid.length; r++) {
    const row = grid[r]; if (!row) continue;
    let d = null, lib = '', mont = 0;
    if (hdr >= 0) {
      d = dateFR(row[cDate]);
      lib = String(row[cLib] !== undefined ? row[cLib] : '').trim();
      if (cMont >= 0) mont = parseNum(row[cMont]);
      else {
        const deb = cDeb >= 0 ? Math.abs(parseNum(row[cDeb])) : 0;
        const cre = cCred >= 0 ? Math.abs(parseNum(row[cCred])) : 0;
        mont = cre ? cre : -deb;
      }
      if (!lib) lib = row.filter((c, i) => i !== cDate && i !== cMont && isNaN(parseNum(c)) && String(c).trim())
                         .join(' ').trim();
    } else {
      /* sans en-tête : la 1re colonne datée, le 1er nombre, le reste en texte */
      d = dateFR(row[0]);
      if (!d) continue;
      const textes = [], nombres = [];
      row.slice(1).forEach(c => {
        const t = String(c).trim();
        if (!t) return;
        if (/^-?[\d\s .,]+$/.test(t)) nombres.push(parseNum(t)); else textes.push(t);
      });
      mont = nombres.length ? nombres[0] : 0;
      lib = textes.join(' ');
    }
    if (!d || !mont) continue;
    lignes.push({ ...d, lib: lib.replace(/\s+/g, ' ').slice(0, 90), mont });
  }
  return lignes;
}

function lireOFX(txt) {
  const out = [];
  const blocs = txt.split(/<STMTTRN>/i).slice(1);
  blocs.forEach(b => {
    const g = re => { const m = b.match(re); return m ? m[1].trim() : ''; };
    const d = dateFR(g(/<DTPOSTED>([^<\r\n]+)/i));
    const mont = parseNum(g(/<TRNAMT>([^<\r\n]+)/i));
    const lib = (g(/<NAME>([^<\r\n]+)/i) + ' ' + g(/<MEMO>([^<\r\n]+)/i)).trim();
    if (d && mont) out.push({ ...d, lib: lib.replace(/\s+/g, ' ').slice(0, 90), mont });
  });
  return out;
}

function lireJSONReleve(txt) {
  const j = JSON.parse(txt);
  const src = Array.isArray(j) ? j : (j.operations || j.transactions || []);
  return src.map(t => {
    const ds = t.date || t.booking_date || t.value_date || t.transaction_date || '';
    const d = dateFR(ds);
    let mont = t.montant !== undefined ? +t.montant
      : (t.transaction_amount ? +t.transaction_amount.amount : (t.amount !== undefined ? +t.amount : 0));
    /* Enable Banking donne un montant positif + un sens (DBIT/CRDT) */
    const sens = (t.credit_debit_indicator || t.sens || '').toUpperCase();
    if (sens.startsWith('DB') && mont > 0) mont = -mont;
    const lib = t.libelle || t.lib
      || (Array.isArray(t.remittance_information) ? t.remittance_information.join(' ') : t.remittance_information)
      || (t.creditor && t.creditor.name) || (t.debtor && t.debtor.name) || t.reference || '';
    return d && mont ? { ...d, lib: String(lib).replace(/\s+/g, ' ').slice(0, 90), mont } : null;
  }).filter(Boolean);
}

async function lireReleve(file) {
  const nom = file.name.toLowerCase();
  const txt = await texteFichier(file);
  let ops;
  if (/\.(ofx|qfx)$/.test(nom) || /<STMTTRN>/i.test(txt)) ops = lireOFX(txt);
  else if (/\.json$/.test(nom) || /^\s*[\[{]/.test(txt)) ops = lireJSONReleve(txt);
  else ops = lireCSVReleve(txt);
  if (!ops.length) throw new Error("Aucune opération datée n'a été trouvée dans ce fichier.\n\nFormats lus : CSV (export LCL), OFX/QFX, ou le JSON du pont NaoBanque.");
  ops.sort((a, b) => (a.an - b.an) || (a.mo - b.mo) || (a.j - b.j));
  return ops;
}

/* ---------- Rapprochement : quelle ligne du budget ? ---------- */
const MOTS_VIDES = /^(le|la|les|de|du|des|un|une|et|pour|par|sur|carte|cb|vir|virement|prlv|prelevement|paiement|achat|facture|sepa|ref|reference|mandat|inst|france|sarl|sas)$/;
const motsDe = s => noAcc(s).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
  .filter(m => m.length >= 4 && !MOTS_VIDES.test(m));

function indexLignes() {
  const y = Y(), idx = [];
  const add = (l, cat, bloc, path) => idx.push({ l, cat, bloc, path, mots: motsDe(l.label) });
  y.revenus.forEach(l => add(l, '', 'rev', 'rev'));
  y.fixes.forEach(c => c.lines.forEach(l => add(l, c.name, 'fix', 'fix:' + c.id)));
  y.variables.forEach(l => add(l, '', 'var', 'var'));
  /* Combien de lignes emploient chaque mot : « duolingo » ne sert qu'une fois
     et vaut donc cher, « abonnement » revient partout et ne prouve rien. */
  idx.df = {};
  idx.forEach(t => new Set(t.mots).forEach(m => idx.df[m] = (idx.df[m] || 0) + 1));
  return idx;
}
function devineLigne(op, idx) {
  const mots = motsDe(op.lib);
  if (!mots.length) return null;
  /* ce qu'on a appris des rapprochements précédents */
  const appris = (state.appris || {});
  for (const m of mots) {
    const id = appris[m];
    if (id) { const t = idx.find(x => x.l.id === id); if (t) return t; }
  }
  const df = idx.df || {};
  let best = null, score = 0;
  idx.forEach(t => {
    if (!t.mots.length) return;
    if ((op.mont > 0) !== (t.bloc === 'rev')) return;      /* un crédit va dans les revenus */
    let s = 0, touches = 0;
    t.mots.forEach(m => {
      const poids = (3 / (df[m] || 1)) * (1 + Math.min(m.length, 10) / 10);
      if (mots.includes(m)) { s += poids; touches++; }
      else if (mots.some(x => x.startsWith(m.slice(0, 5)) || m.startsWith(x.slice(0, 5)))) { s += poids / 2; touches += 0.5; }
    });
    /* une ligne dont TOUS les mots sont retrouvés est bien plus sûre qu'une
       ligne dont un seul mot, très banal, apparaît au passage */
    s *= 0.5 + 0.5 * (touches / t.mots.length);
    if (s > score) { score = s; best = t; }
  });
  return score >= 2.4 ? best : null;
}
function apprendre(op, ligne) {
  if (!ligne) return;
  state.appris = state.appris || {};
  const mots = motsDe(op.lib);
  if (mots.length) state.appris[mots[0]] = ligne.l.id;
}

/* ---------- La fenêtre de rapprochement ---------- */
let banCtx = null;
function closeBanque() { const n = el('banbg'); if (n) n.remove(); banCtx = null; }

async function startBanque(file) {
  let ops;
  try { ops = await lireReleve(file); }
  catch (e) { alert('⚠️ ' + e.message); return; }
  const idx = indexLignes();
  /* le mois le plus représenté devient le mois proposé */
  const compte = {};
  ops.forEach(o => { const k = o.an + '-' + o.mo; compte[k] = (compte[k] || 0) + 1; });
  const k = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0];
  const [an, mo] = k.split('-').map(Number);
  banCtx = {
    nom: file.name, ops, idx, an, mo,
    choix: ops.map(o => {
      const t = devineLigne(o, idx);
      return { on: !!t, id: t ? t.l.id : '' };
    })
  };
  if (an !== +state.activeYear) {
    if (confirm(`Ce relevé concerne ${an}, or vous êtes sur ${state.activeYear}.\n\nBasculer sur ${an} ?`)) {
      state.activeYear = an; Y(); render();
      banCtx.idx = indexLignes();
      banCtx.choix = ops.map(o => { const t = devineLigne(o, banCtx.idx); return { on: !!t, id: t ? t.l.id : '' }; });
    }
  }
  drawBanque();
}

function drawBanque() {
  if (!banCtx) return;
  const { ops, idx, mo, an } = banCtx;
  const duMois = ops.map((o, i) => ({ o, i })).filter(x => x.o.mo === mo && x.o.an === an);
  const m = mo - 1;
  const opts = (sel) => {
    let h = '<option value="">— à classer —</option>';
    ['rev', 'fix', 'var'].forEach(bloc => {
      const nom = bloc === 'rev' ? '💰 Revenus' : bloc === 'fix' ? '🏠 Dépenses fixes' : '🛍️ Dépenses variables';
      h += `<optgroup label="${nom}">`;
      idx.filter(t => t.bloc === bloc).forEach(t => {
        h += `<option value="${t.l.id}" ${sel === t.l.id ? 'selected' : ''}>${esc((t.cat ? t.cat + ' · ' : '') + t.l.label)}</option>`;
      });
      h += '</optgroup>';
    });
    return h;
  };
  const retenus = duMois.filter(x => banCtx.choix[x.i].on && banCtx.choix[x.i].id);
  const totDeb = sum(retenus.filter(x => x.o.mont < 0).map(x => -x.o.mont));
  const totCre = sum(retenus.filter(x => x.o.mont > 0).map(x => x.o.mont));
  const mois = {};
  ops.forEach(o => { const k2 = o.an + '-' + o.mo; mois[k2] = (mois[k2] || 0) + 1; });

  let bg = el('banbg');
  if (!bg) {
    bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'banbg';
    document.body.appendChild(bg);
    bg.addEventListener('click', onBanqueClick);
    bg.addEventListener('change', onBanqueChange);
  }
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="mhd"><span>🏦</span><span>Relevé bancaire</span>
      <span class="sub">${esc(banCtx.nom)} · ${ops.length} opération(s)</span>
      <span class="right"></span>
      <button class="xclose" data-banclose="1" title="Fermer">✕</button></div>
    <div class="mbd">
      <div class="sharebar"><span>Mois à rapprocher :</span>
        ${Object.keys(mois).sort().map(k2 => {
          const [a2, m2] = k2.split('-').map(Number);
          return `<button class="qbtn ${(a2 === an && m2 === mo) ? 'on' : ''}" data-banmois="${k2}">
            ${MONTHS[m2 - 1]} ${a2} (${mois[k2]})</button>`;
        }).join('')}
      </div>
      <div class="sharebar"><span>Tout :</span>
        <button class="qbtn" data-bantout="1">☑️ cocher</button>
        <button class="qbtn" data-bantout="0">☐ décocher</button>
        <span class="right"></span>
      </div>
      <table class="dt"><thead><tr><th style="width:34px"></th><th style="width:52px">Jour</th>
        <th>Libellé de la banque</th><th class="r" style="width:96px">Montant</th>
        <th style="width:270px">Ligne du budget</th></tr></thead>
        <tbody>${duMois.length ? duMois.map(({ o, i }) => {
          const c = banCtx.choix[i];
          return `<tr data-i="${i}" class="${c.on && c.id ? '' : 'off'}">
            <td><input type="checkbox" class="bchk" data-i="${i}" ${c.on ? 'checked' : ''}></td>
            <td class="r" style="color:var(--ink-3)">${o.j}</td>
            <td style="font-size:12.5px">${esc(o.lib || '(sans libellé)')}</td>
            <td class="r" style="font-variant-numeric:tabular-nums;color:${o.mont < 0 ? 'var(--ink)' : 'var(--success)'}">
              ${o.mont > 0 ? '+ ' : '– '}${money(Math.abs(o.mont))}</td>
            <td><select class="di bsel" data-i="${i}">${opts(c.id)}</select></td>
          </tr>`;
        }).join('') : '<tr><td colspan="5"><div class="empty-note">Aucune opération pour ce mois 🤷</div></td></tr>'}
        </tbody></table>
      <p style="font-size:12.5px;color:var(--ink-3);line-height:1.7;margin:14px 0 0">
        Chaque opération cochée est ajoutée au <b>📋 détail</b> de la case correspondante de
        <b>${MONTHS[m]} ${an}</b>, avec sa date et son libellé. Le montant de la case devient la somme
        de son détail. Les lignes « à classer » sont ignorées.</p>
    </div>
    <div class="mft">
      <span class="dtot">À inscrire : <b>${retenus.length}</b> opération(s) ·
        <b class="mine">${money(totDeb)}</b> de dépenses ·
        <b style="color:var(--success)">${money(totCre)}</b> de revenus</span>
      <span class="right"></span>
      <button class="btn" data-banclose="1">Annuler</button>
      <button class="btn primary" data-bango="1" ${retenus.length ? '' : 'disabled'}>📥 Inscrire dans ${MONTHS[m]}</button>
    </div></div>`;
}
function onBanqueChange(e) {
  if (!banCtx) return;
  const t = e.target;
  if (t.classList.contains('bchk')) { banCtx.choix[+t.dataset.i].on = t.checked; drawBanque(); }
  else if (t.classList.contains('bsel')) {
    const i = +t.dataset.i;
    banCtx.choix[i].id = t.value;
    banCtx.choix[i].on = !!t.value;
    drawBanque();
  }
}
function onBanqueClick(e) {
  if (!banCtx) return;
  if (e.target.id === 'banbg') return closeBanque();
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.banclose) return closeBanque();
  if (b.dataset.banmois) {
    const [a2, m2] = b.dataset.banmois.split('-').map(Number);
    banCtx.an = a2; banCtx.mo = m2; drawBanque(); return;
  }
  if (b.dataset.bantout) {
    const on = b.dataset.bantout === '1';
    banCtx.ops.forEach((o, i) => {
      if (o.mo === banCtx.mo && o.an === banCtx.an && banCtx.choix[i].id) banCtx.choix[i].on = on;
    });
    drawBanque(); return;
  }
  if (b.dataset.bango) appliqueBanque();
}

function appliqueBanque() {
  const { ops, idx, mo, an } = banCtx, m = mo - 1;
  let n = 0;
  ops.forEach((o, i) => {
    const c = banCtx.choix[i];
    if (!c.on || !c.id || o.mo !== mo || o.an !== an) return;
    const t = idx.find(x => x.l.id === c.id); if (!t) return;
    const l = t.l;
    if (!l.d) l.d = {};
    /* une case déjà remplie à la main garde son montant, sous forme de première ligne */
    if (!l.d[m]) l.d[m] = (+l.v[m]) ? [{ id: uid(), d: '', lib: 'Saisi à la main', amt: +l.v[m], q: 100 }] : [];
    l.d[m].push({ id: uid(), d: String(o.j), lib: o.lib || 'Opération bancaire', amt: Math.abs(o.mont), q: 100 });
    recalcCell(l, m);
    apprendre(o, t);
    n++;
  });
  save(); closeBanque();
  selMonth = m; view = 'annuel'; render();
  toast(`🏦 ${n} opération(s) inscrite(s) dans ${MONTHS[m]}`);
}
