/* ============================================================
   NaoBudget — relevés bancaires
   Lit l'export d'une banque (CSV, OFX/QFX ou JSON), reconnaît de quel
   compte il vient (courant, épargne, joint), rapproche chaque opération
   d'une ligne du budget et l'inscrit dans le détail de la case du mois.
   Les virements entre vos propres comptes sont repérés et laissés de côté,
   pour ne pas compter deux fois le même argent.
   Rien ne part sur internet : tout est lu dans le navigateur.
   ============================================================ */

/* ---------- Lecture du fichier ---------- */
async function texteFichier(file) {
  const buf = await file.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch (e) { return new TextDecoder('windows-1252').decode(buf); }   /* beaucoup d'exports bancaires sont en ISO */
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

/* ---------- Quel compte ? ----------
   Un relevé dit souvent lui-même de quel compte il s'agit : l'OFX donne un
   type (CHECKING, SAVINGS…), un CSV porte l'intitulé du compte dans ses
   premières lignes, le nom du fichier aide aussi. On propose ; la personne
   confirme dans la fenêtre. */
const TYPES_COMPTE = {
  courant: { ico: '💳', nom: 'Compte courant' },
  epargne: { ico: '🐖', nom: "Compte d'épargne" },
  joint:   { ico: '👥', nom: 'Compte joint' }
};
const RE_JOINT = /\bjoint\b|\b(m|mr|mme|mlle|monsieur|madame)\.?\s+(ou|et|&)\s+(m|mr|mme|mlle|monsieur|madame)\b/;
const RE_EPARGNE = /livret|epargne|\bldds?\b|\blep\b|\bpel\b|\bcel\b|\bcsl\b|\bpea\b|assurance.vie|super livret|compte sur livret/;
const RE_COURANT = /compte (courant|de depot|cheques?|bancaire)|\bcpt courant\b|\bcheck/;
function devineTypeCompte(texte, typeOFX) {
  const t = noAcc(texte), o = String(typeOFX || '').toUpperCase();
  if (RE_JOINT.test(t)) return 'joint';
  if (/SAVINGS|MONEYMRKT/.test(o) || RE_EPARGNE.test(t)) return 'epargne';
  if (/CHECKING|CREDITLINE/.test(o) || RE_COURANT.test(t)) return 'courant';
  return '';
}
/* Un numéro de compte (au moins 5 chiffres, parfois suivi d'une lettre clé) */
const numeroCompte = t => { const m = String(t || '').match(/\b\d{5,}[A-Za-z]?\b/); return m ? m[0] : ''; };

function lireCSVReleve(txt) {
  const grid = parseCSV(txt).filter(r => r.some(c => String(c).trim()));
  if (!grid.length) return { ops: [], infos: '' };
  /* Repérage des colonnes : par l'en-tête si elle existe, sinon au flair. */
  let hdr = -1, cDate = -1, cLib = -1, cMont = -1, cDeb = -1, cCred = -1, cCpt = -1;
  for (let r = 0; r < Math.min(grid.length, 12); r++) {
    const row = grid[r].map(c => noAcc(c).trim());
    const iD = row.findIndex(c => /^date/.test(c));
    if (iD < 0) continue;
    hdr = r; cDate = iD;
    row.forEach((c, i) => {
      if (/^(compte|numero de compte|n° de compte|account|iban)/.test(c)) cCpt = i;
      else if (/libell|description|nature|motif|operation|intitul/.test(c)) cLib = i;
      else if (/^montant|^amount/.test(c)) cMont = i;
      else if (/^debit/.test(c)) cDeb = i;
      else if (/^credit/.test(c)) cCred = i;
    });
    break;
  }
  const lignes = [], infos = [];
  /* ce qui précède l'en-tête (intitulé, titulaire, numéro de compte…) */
  if (hdr > 0) grid.slice(0, hdr).forEach(r => infos.push(r.join(' ')));
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
      if (!lib) lib = row.filter((c, i) => i !== cDate && i !== cMont && i !== cCpt && isNaN(parseNum(c)) && String(c).trim())
                         .join(' ').trim();
    } else {
      /* sans en-tête : la 1re colonne datée, le 1er nombre, le reste en texte */
      d = dateFR(row[0]);
      if (!d) { infos.push(row.join(' ')); continue; }
      const textes = [], nombres = [];
      row.slice(1).forEach(c => {
        const t = String(c).trim();
        if (!t) return;
        if (/^-?[\d\s .,]+$/.test(t)) nombres.push(parseNum(t)); else textes.push(t);
      });
      mont = nombres.length ? nombres[0] : 0;
      lib = textes.join(' ');
    }
    if (!d || !mont) { if (!d) infos.push(row.join(' ')); continue; }
    const cpt = cCpt >= 0 ? String(row[cCpt] || '').trim() : '';
    lignes.push({ ...d, lib: lib.replace(/\s+/g, ' ').slice(0, 90), mont, cpt });
  }
  return { ops: lignes, infos: infos.join(' ').slice(0, 600) };
}

function lireOFX(txt) {
  const out = [], comptes = [];
  /* un fichier OFX peut contenir plusieurs comptes : un bloc STMTRS chacun
     (CCSTMTRS pour une carte de crédit) */
  let blocs = txt.split(/<(?:CC)?STMTRS>/i).slice(1);
  if (!blocs.length) blocs = [txt];
  blocs.forEach(bloc => {
    const g1 = re => { const m = bloc.match(re); return m ? m[1].trim() : ''; };
    const id = g1(/<ACCTID>([^<\r\n]+)/i);
    const type = g1(/<ACCTTYPE>([^<\r\n]+)/i);
    const cle = id || 'compte';
    comptes.push({ cle, nom: id ? 'n° ' + id : '', typeOFX: type, infos: g1(/<DESC>([^<\r\n]+)/i) });
    bloc.split(/<STMTTRN>/i).slice(1).forEach(b => {
      const g = re => { const m = b.match(re); return m ? m[1].trim() : ''; };
      const d = dateFR(g(/<DTPOSTED>([^<\r\n]+)/i));
      const mont = parseNum(g(/<TRNAMT>([^<\r\n]+)/i));
      const lib = (g(/<NAME>([^<\r\n]+)/i) + ' ' + g(/<MEMO>([^<\r\n]+)/i)).trim();
      if (d && mont) out.push({ ...d, lib: lib.replace(/\s+/g, ' ').slice(0, 90), mont, cpt: cle });
    });
  });
  return { ops: out, comptes };
}

function lireJSONReleve(txt) {
  const j = JSON.parse(txt);
  const src = Array.isArray(j) ? j : (j.operations || j.transactions || []);
  const cptDefaut = Array.isArray(j) ? '' : String(j.compte || (j.account && (j.account.name || j.account.iban)) || '');
  const ops = src.map(t => {
    const ds = t.date || t.booking_date || t.value_date || t.transaction_date || '';
    const d = dateFR(ds);
    let mont = t.montant !== undefined ? +t.montant
      : (t.transaction_amount ? +t.transaction_amount.amount : (t.amount !== undefined ? +t.amount : 0));
    /* l'open banking donne un montant positif + un sens (DBIT/CRDT) */
    const sens = (t.credit_debit_indicator || t.sens || '').toUpperCase();
    if (sens.startsWith('DB') && mont > 0) mont = -mont;
    const lib = t.libelle || t.lib
      || (Array.isArray(t.remittance_information) ? t.remittance_information.join(' ') : t.remittance_information)
      || (t.creditor && t.creditor.name) || (t.debtor && t.debtor.name) || t.reference || '';
    const cpt = String(t.compte || t.account_name || t.account_id || cptDefaut || '').trim();
    return d && mont ? { ...d, lib: String(lib).replace(/\s+/g, ' ').slice(0, 90), mont, cpt } : null;
  }).filter(Boolean);
  return { ops, infos: cptDefaut };
}

async function lireReleve(file) {
  const nom = file.name.toLowerCase();
  const txt = await texteFichier(file);
  let lu, comptesOFX = null;
  if (/\.(ofx|qfx)$/.test(nom) || /<STMTTRN>/i.test(txt)) { lu = lireOFX(txt); comptesOFX = lu.comptes; }
  else if (/\.json$/.test(nom) || /^\s*[\[{]/.test(txt)) lu = lireJSONReleve(txt);
  else lu = lireCSVReleve(txt);
  const ops = lu.ops;
  if (!ops.length) throw new Error("Aucune opération datée n'a été trouvée dans ce fichier.\n\nFormats lus : CSV, OFX/QFX ou JSON, tels que les banques les proposent au téléchargement.");

  /* Les comptes présents dans le fichier, et le type deviné pour chacun */
  const comptes = [];
  const parCle = {};
  const ajoute = (cle, nom, typeOFX, infos) => {
    const texte = [nom, infos, cle, file.name.replace(/[_\-.]+/g, ' ')].join(' ');
    const type = devineTypeCompte(texte, typeOFX);
    const c = { cle, nom: nom || '', type: type || 'courant', devine: !!type, part: 50 };
    parCle[cle] = comptes.length; comptes.push(c);
  };
  if (comptesOFX) comptesOFX.forEach(c => ajoute(c.cle, c.nom, c.typeOFX, c.infos));
  ops.forEach(o => {
    const cle = o.cpt || numeroCompte(lu.infos) || '·';
    o.cpt = cle;
    if (parCle[cle] === undefined) {
      const nom = o.cpt !== '·' ? (/^\d+[A-Za-z]?$/.test(cle) ? 'n° ' + cle : cle) : '';
      ajoute(cle, nom, '', lu.infos || '');
    }
    o.c = parCle[cle];
  });
  ops.sort((a, b) => (a.an - b.an) || (a.mo - b.mo) || (a.j - b.j));
  return { ops, comptes };
}

/* ---------- Virements entre vos propres comptes ----------
   Un virement du compte courant vers le livret apparaît sur les deux
   relevés : une fois en débit, une fois en crédit. Le compter deux fois
   ferait apparaître une dépense et un revenu qui n'existent pas. */
const RE_VIR = /\b(vir|virt|virement|transfert|versement|retrait)\b/;
const RE_VERS_EPARGNE = /livret|epargne|\bldds?\b|\blep\b|\bpel\b|\bcel\b|\bcsl\b|\bpea\b|assurance.vie/;
const RE_INTERNE = /joint|interne|entre (mes )?comptes|mes comptes|compte (courant|cheques?|de depot)|de moi.meme|\bperso\b/;
const RE_INTERETS = /interet|remuneration|prime d.?etat|capitalisation/;
function natureOp(o, type) {
  const t = noAcc(o.lib);
  const vir = RE_VIR.test(t);
  if (type === 'epargne') {
    /* sur un livret, tout ce qui entre ou sort vient d'un autre compte à vous ;
       seuls les intérêts sont un vrai gain */
    if (RE_INTERETS.test(t)) return '';
    return 'interne';
  }
  if (!vir) return '';
  if (RE_VERS_EPARGNE.test(t)) return o.mont < 0 && type === 'courant' ? 'epargne' : 'interne';
  if (RE_INTERNE.test(t)) return 'interne';
  /* sur un compte joint, l'argent qui arrive par virement est la mise de chacun */
  if (type === 'joint' && o.mont > 0) return 'interne';
  return '';
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
/* Pour un versement vers l'épargne : la ligne 🐖 du budget qui lui ressemble le plus */
function ligneEpargne(op, idx) {
  const t = devineLigne(op, idx);
  if (t && t.bloc !== 'rev' && isSavings(t.l)) return t;
  const cand = idx.filter(x => x.bloc !== 'rev' && isSavings(x.l));
  if (!cand.length) return null;
  const mots = motsDe(op.lib);
  return cand.find(x => x.mots.some(m => mots.includes(m))) || cand[0];
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

/* Proposition pour chaque opération, selon le type de son compte.
   Les choix faits à la main dans la fenêtre sont gardés. */
function proposeBanque(seulCompte) {
  const { ops, idx, comptes } = banCtx;
  ops.forEach((o, i) => {
    if (seulCompte !== undefined && o.c !== seulCompte) return;
    const prev = banCtx.choix[i];
    const type = comptes[o.c].type;
    const nat = natureOp(o, type);
    if (prev && prev.manuel) { prev.nat = nat; return; }
    let t = null, on = false;
    if (nat === 'epargne') { t = ligneEpargne(o, idx); on = !!t; }
    else if (nat === '') { t = devineLigne(o, idx); on = !!t; }
    banCtx.choix[i] = { on, id: t ? t.l.id : '', nat, manuel: false };
  });
}

async function startBanque(file) {
  let lu;
  try { lu = await lireReleve(file); }
  catch (e) { nbAvertir(e.message); return; }
  const ops = lu.ops;
  /* le mois le plus représenté devient le mois proposé */
  const compte = {};
  ops.forEach(o => { const k = o.an + '-' + o.mo; compte[k] = (compte[k] || 0) + 1; });
  const k = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0];
  const [an, mo] = k.split('-').map(Number);
  if (an !== +state.activeYear) {
    if (await nbConfirmer(`Ce relevé concerne ${an}, or vous êtes sur ${state.activeYear}.\n\nBasculer sur ${an} ?`, { titre: '🏦 Relevé de banque', ok: 'Aller sur ' + an, annuler: 'Rester sur ' + state.activeYear })) {
      state.activeYear = an; Y(); render();
    }
  }
  banCtx = { nom: file.name, ops, comptes: lu.comptes, idx: indexLignes(), an, mo, choix: [] };
  proposeBanque();
  drawBanque();
}

function drawBanque() {
  if (!banCtx) return;
  const { ops, idx, mo, an, comptes } = banCtx;
  const duMois = ops.map((o, i) => ({ o, i })).filter(x => x.o.mo === mo && x.o.an === an);
  const m = mo - 1;
  const plusieurs = comptes.filter((c, ci) => ops.some(o => o.c === ci)).length > 1;
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
  const part = o => comptes[o.c].type === 'joint' ? (+comptes[o.c].part || 0) / 100 : 1;
  const retenus = duMois.filter(x => banCtx.choix[x.i].on && banCtx.choix[x.i].id);
  const totDeb = sum(retenus.filter(x => x.o.mont < 0).map(x => -x.o.mont * part(x.o)));
  const totCre = sum(retenus.filter(x => x.o.mont > 0).map(x => x.o.mont * part(x.o)));
  const nInternes = duMois.filter(x => banCtx.choix[x.i].nat === 'interne').length;
  const mois = {};
  ops.forEach(o => { const k2 = o.an + '-' + o.mo; mois[k2] = (mois[k2] || 0) + 1; });

  /* une ligne par compte trouvé dans le fichier : son type, et la part si joint */
  const blocComptes = comptes.map((c, ci) => {
    const n = ops.filter(o => o.c === ci).length;
    if (!n) return '';
    const btns = Object.keys(TYPES_COMPTE).map(ty =>
      `<button class="qbtn ${c.type === ty ? 'on' : ''}" data-bantype="${ty}" data-c="${ci}">
        ${TYPES_COMPTE[ty].ico} ${TYPES_COMPTE[ty].nom}</button>`).join('');
    const partHtml = c.type === 'joint' ? `<span style="margin-left:6px">Ma part :</span>
        <button class="qbtn ${+c.part === 50 ? 'on' : ''}" data-banpart="50" data-c="${ci}">½</button>
        <input class="di pct" data-banpartin="${ci}" value="${c.part}" style="width:52px" title="Pourcentage à ma charge"><span style="color:var(--ink-3)">%</span>` : '';
    const note = c.devine
      ? '<span style="color:var(--ink-3);font-size:12px">· reconnu dans le fichier</span>'
      : '<span style="color:var(--ink-3);font-size:12px">· le fichier ne le dit pas, vérifiez</span>';
    return `<div class="sharebar" style="flex-wrap:wrap">
        <span>${plusieurs ? `<b>${esc(c.nom || 'Compte ' + (ci + 1))}</b> (${n}) :` : 'Ce relevé vient d’un :'}</span>
        ${btns}${partHtml}${note}</div>`;
  }).join('');

  const etiquette = (o, c) => {
    if (c.nat === 'interne') return ` <span class="pill" title="Virement entre vos propres comptes : il est déjà compté sur l'autre relevé, il est donc laissé de côté. Cochez-le si cet autre compte n'est pas suivi dans NaoBudget.">↔️ entre vos comptes</span>`;
    if (c.nat === 'epargne') return ` <span class="pill" title="Argent mis de côté : il va dans une ligne 🐖 épargne du budget, pas dans les dépenses.">🐖 vers l'épargne</span>`;
    return '';
  };

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
      ${blocComptes}
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
          const cpt = comptes[o.c];
          const joint = cpt.type === 'joint' && +cpt.part !== 100;
          return `<tr data-i="${i}" class="${c.on && c.id ? '' : 'off'}">
            <td><input type="checkbox" class="bchk" data-i="${i}" ${c.on ? 'checked' : ''}></td>
            <td class="r" style="color:var(--ink-3)">${o.j}</td>
            <td style="font-size:12.5px">${plusieurs ? `<span style="color:var(--ink-3)">${TYPES_COMPTE[cpt.type].ico}</span> ` : ''}${esc(o.lib || '(sans libellé)')}${etiquette(o, c)}</td>
            <td class="r" style="font-variant-numeric:tabular-nums;color:${o.mont < 0 ? 'var(--ink)' : 'var(--success)'}">
              ${o.mont > 0 ? '+ ' : '– '}${money(Math.abs(o.mont))}${joint ? `<div style="font-size:12px;color:var(--ink-3)">ma part ${money(Math.abs(o.mont) * cpt.part / 100)}</div>` : ''}</td>
            <td><select class="di bsel" data-i="${i}">${opts(c.id)}</select></td>
          </tr>`;
        }).join('') : '<tr><td colspan="5"><div class="empty-note">Aucune opération pour ce mois 🤷</div></td></tr>'}
        </tbody></table>
      <p style="font-size:12.5px;color:var(--ink-3);line-height:1.7;margin:14px 0 0">
        Chaque opération cochée est ajoutée au <b>📋 détail</b> de la case correspondante de
        <b>${MONTHS[m]} ${an}</b>, avec sa date et son libellé. Le montant de la case devient la somme
        de son détail. Les lignes « à classer » sont ignorées.
        ${comptes.some(c => c.type === 'joint') ? ' Pour un <b>compte joint</b>, seule votre part est comptée dans le budget.' : ''}
        ${nInternes ? ` <b>${nInternes}</b> virement(s) <b>↔️ entre vos comptes</b> sont laissés de côté : ils sont déjà comptés sur le relevé de l'autre compte.` : ''}</p>
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
  if (t.classList.contains('bchk')) {
    const c = banCtx.choix[+t.dataset.i];
    c.on = t.checked; c.manuel = true; drawBanque();
  }
  else if (t.classList.contains('bsel')) {
    const c = banCtx.choix[+t.dataset.i];
    c.id = t.value; c.on = !!t.value; c.manuel = true;
    drawBanque();
  }
  else if (t.dataset.banpartin !== undefined) {
    const c = banCtx.comptes[+t.dataset.banpartin];
    c.part = Math.max(0, Math.min(100, Math.round(parseNum(t.value) || 0)));
    drawBanque();
  }
}
function onBanqueClick(e) {
  if (!banCtx) return;
  if (e.target.id === 'banbg') return closeBanque();
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.banclose) return closeBanque();
  if (b.dataset.bantype) {
    const ci = +b.dataset.c, c = banCtx.comptes[ci];
    c.type = b.dataset.bantype; c.devine = true;
    proposeBanque(ci); drawBanque(); return;
  }
  if (b.dataset.banpart) { banCtx.comptes[+b.dataset.c].part = +b.dataset.banpart; drawBanque(); return; }
  if (b.dataset.banmois) {
    const [a2, m2] = b.dataset.banmois.split('-').map(Number);
    banCtx.an = a2; banCtx.mo = m2; drawBanque(); return;
  }
  if (b.dataset.bantout) {
    const on = b.dataset.bantout === '1';
    /* « tout cocher » ne reprend pas les virements entre vos comptes */
    banCtx.ops.forEach((o, i) => {
      const c = banCtx.choix[i];
      if (o.mo === banCtx.mo && o.an === banCtx.an && c.id && !(on && c.nat === 'interne')) c.on = on;
    });
    drawBanque(); return;
  }
  if (b.dataset.bango) appliqueBanque();
}

function appliqueBanque() {
  const { ops, idx, mo, an, comptes } = banCtx, m = mo - 1;
  let n = 0;
  ops.forEach((o, i) => {
    const c = banCtx.choix[i];
    if (!c.on || !c.id || o.mo !== mo || o.an !== an) return;
    const t = idx.find(x => x.l.id === c.id); if (!t) return;
    const l = t.l;
    const cpt = comptes[o.c];
    /* compte joint : le montant entier est noté, avec la part qui est la mienne */
    const q = cpt.type === 'joint' ? Math.max(0, Math.min(100, +cpt.part || 0)) : 100;
    if (!l.d) l.d = {};
    /* une case déjà remplie à la main garde son montant, sous forme de première ligne */
    if (!l.d[m]) l.d[m] = (+l.v[m]) ? [{ id: uid(), d: '', lib: 'Saisi à la main', amt: +l.v[m], q: 100 }] : [];
    l.d[m].push({ id: uid(), d: String(o.j), lib: (cpt.type === 'joint' ? '👥 ' : '') + (o.lib || 'Opération bancaire'), amt: Math.abs(o.mont), q });
    recalcCell(l, m);
    apprendre(o, t);
    n++;
  });
  save(); closeBanque();
  selMonth = m; view = 'annuel'; render();
  toast(`🏦 ${n} opération(s) inscrite(s) dans ${MONTHS[m]}`);
}
