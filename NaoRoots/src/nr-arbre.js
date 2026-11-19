'use strict';
/* ============================================================
   NaoRoots — l'arbre dessiné : sablier (la famille autour d'une
   personne), ascendants, descendants, éventail ; vertical ou
   horizontal. Et la carte stylisée des lieux et des migrations.
   Tout est en SVG, pour s'afficher et s'imprimer pareil.
   ============================================================ */

/* ---------- la mise en place ----------
   On calcule d'abord des positions abstraites : g = génération (+1 vers les
   parents), s = position dans la génération (en « cases »). Puis on les
   transforme en pixels selon le sens choisi. */
function planArbre(racine, mode, prof, avecFantomes) {
  const noeuds = new Map(), traits = [], vus = new Set();
  const ajoute = (id, g, s, extra = {}) => { if (!noeuds.has(id)) noeuds.set(id, Object.assign({ id, g, s }, extra)); };
  const parentsAffiches = id => parentsDe(id).sort((a, b) => (a.lien.nature === 'beau') - (b.lien.nature === 'beau')).slice(0, 2);

  /* vers le haut : chaque ancêtre prend la largeur de ses propres ancêtres */
  const largH = new Map();
  function largeurHaut(id, d, pile) {
    if (pile.has(id)) return 1;
    const ps = d < prof ? parentsAffiches(id) : [];
    let w = 0; pile.add(id);
    ps.forEach(x => { w += largeurHaut(x.p.id, d + 1, pile); });
    if (avecFantomes && d < prof && d < 3 && ps.length < 2 && (d < 1 || ps.length === 0) && !enLecture()) w += .9;
    pile.delete(id);
    const r = Math.max(1, w); largH.set(id + ':' + d, r); return r;
  }
  function placeHaut(id, d, gauche, pile) {
    const w = largH.get(id + ':' + d) || 1;
    if (d > 0) ajoute(id, d, gauche + w / 2);
    if (d >= prof || pile.has(id)) return;
    pile.add(id);
    const ps = parentsAffiches(id); let x = gauche, somme = 0;
    ps.forEach(q => { somme += largH.get(q.p.id + ':' + (d + 1)) || 1; });
    const fant = avecFantomes && d < 3 && ps.length < 2 && (d < 1 || ps.length === 0) && !enLecture();
    if (fant) somme += .9;
    x = gauche + (w - somme) / 2;
    ps.forEach(q => {
      const wq = largH.get(q.p.id + ':' + (d + 1)) || 1;
      placeHaut(q.p.id, d + 1, x, pile);
      traits.push({ t: 'parent', de: q.p.id, vers: id, nature: q.lien.nature });
      x += wq;
    });
    if (fant) { const fid = 'fantome-parent-' + id; noeuds.set(fid, { id: fid, g: d + 1, s: x + .45, fantome: 'parent', pour: id }); traits.push({ t: 'fantome', de: fid, vers: id }); }
    pile.delete(id);
  }

  /* vers le bas : une personne et ses conjoints côte à côte, les enfants dessous */
  const largB = new Map();
  const conjAffiches = id => mode === 'lignee' ? [] : conjointsDe(id).sort((a, b) => (a.lien.nature === 'ex') - (b.lien.nature === 'ex'));
  function largeurBas(id, d, pile) {
    if (pile.has(id)) return 1;
    pile.add(id);
    const groupe = 1 + conjAffiches(id).length;
    let w = 0;
    if (d < prof) enfantsDe(id).forEach(x => { w += largeurBas(x.p.id, d + 1, pile); });
    pile.delete(id);
    const r = Math.max(groupe, w); largB.set(id + ':' + d, r); return r;
  }
  function placeBas(id, d, gauche, pile) {
    const w = largB.get(id + ':' + d) || 1, cj = conjAffiches(id), groupe = 1 + cj.length;
    const debut = gauche + (w - groupe) / 2;
    ajoute(id, -d, debut + .5);
    cj.forEach((c, i) => { if (!noeuds.has(c.p.id)) { noeuds.set(c.p.id, { id: c.p.id, g: -d, s: debut + 1.5 + i, conjointDe: id, ex: c.lien.nature === 'ex' }); } traits.push({ t: 'union', de: id, vers: c.p.id, ex: c.lien.nature === 'ex' }); });
    if (d >= prof || pile.has(id)) return;
    pile.add(id);
    const ks = enfantsDe(id); let somme = 0;
    ks.forEach(k => { somme += largB.get(k.p.id + ':' + (d + 1)) || 1; });
    let x = gauche + (w - somme) / 2;
    ks.forEach(k => {
      const wk = largB.get(k.p.id + ':' + (d + 1)) || 1;
      if (!noeuds.has(k.p.id)) placeBas(k.p.id, d + 1, x, pile);
      const autre = parentsDe(k.p.id).map(x => x.p.id).find(pid => pid !== id && cj.some(c => c.p.id === pid));
      traits.push({ t: 'enfant', de: id, avec: autre, vers: k.p.id, nature: k.lien.nature });
      x += wk;
    });
    pile.delete(id);
  }

  if (mode === 'ascendants') {
    const w = largeurHaut(racine, 0, new Set());
    ajoute(racine, 0, w / 2, { focus: true });
    placeHaut(racine, 0, 0, new Set());
  } else if (mode === 'descendants') {
    largeurBas(racine, 0, new Set());
    placeBas(racine, 0, 0, new Set());
    noeuds.get(racine).focus = true;
  } else {
    /* le sablier : ancêtres au-dessus, descendants dessous, frères et sœurs à côté */
    const wb = largeurBas(racine, 0, new Set());
    placeBas(racine, 0, 0, new Set());
    const f = noeuds.get(racine); f.focus = true;
    const wh = largeurHaut(racine, 0, new Set());
    const avant = new Map(noeuds);
    placeHaut(racine, 0, f.s - wh / 2, new Set());
    const fr = mode === 'lignee' ? [] : fratrieDe(racine);
    const minRang0 = Math.min(...Array.from(noeuds.values()).filter(n => n.g === 0).map(n => n.s));
    fr.forEach((x, i) => {
      if (noeuds.has(x.p.id)) return;
      noeuds.set(x.p.id, { id: x.p.id, g: 0, s: minRang0 - 1 - (fr.length - 1 - i) - .15 });
      parentsDe(x.p.id).forEach(q => { if (noeuds.has(q.p.id) && q.p.id !== racine) traits.push({ t: 'parent', de: q.p.id, vers: x.p.id, nature: q.lien.nature }); });
      if (x.direct) traits.push({ t: 'fratrie', de: x.p.id, vers: racine });
    });
    void avant; void wb;
  }
  return { noeuds: Array.from(noeuds.values()), traits };
}

/* ---------- du plan aux pixels ---------- */
const DIM = { v: { W: 164, H: 64, pasS: 180, pasG: 118 }, h: { W: 184, H: 58, pasS: 70, pasG: 236 } };
function dessinerArbre(racine, o = {}) {
  const mode = o.mode || 'sablier', sens = o.sens || 'v', prof = o.gen || 3;
  if (!personne(racine)) return '';
  if (mode === 'eventail') return dessinerEventail(racine, Math.min(prof, 6), o);
  const plan = planArbre(racine, mode, prof, !o.mini && !o.impression);
  const d = DIM[sens], vers = mode === 'ascendants' && sens === 'h' ? 1 : -1;
  const pos = new Map();
  plan.noeuds.forEach(n => {
    const x = sens === 'v' ? n.s * d.pasS : vers * n.g * d.pasG;
    const y = sens === 'v' ? -n.g * d.pasG : n.s * d.pasS;
    pos.set(n.id, { x, y, n });
  });
  const xs = Array.from(pos.values()), marge = 26;
  const minX = Math.min(...xs.map(p => p.x - d.W / 2)) - marge, maxX = Math.max(...xs.map(p => p.x + d.W / 2)) + marge;
  const minY = Math.min(...xs.map(p => p.y - d.H / 2)) - marge, maxY = Math.max(...xs.map(p => p.y + d.H / 2)) + marge;
  const L = maxX - minX, H = maxY - minY, z = o.zoom || 1;
  let traits = '';
  const bord = (p, cote) => sens === 'v'
    ? { x: p.x, y: p.y + (cote === 'haut' ? -d.H / 2 : d.H / 2) }
    : { x: p.x + (cote === 'haut' ? vers * -1 : vers) * -d.W / 2 * (mode === 'ascendants' ? -1 : 1), y: p.y };
  const coude = (a, b) => sens === 'v'
    ? `M${a.x} ${a.y}V${(a.y + b.y) / 2}H${b.x}V${b.y}`
    : `M${a.x} ${a.y}H${(a.x + b.x) / 2}V${b.y}H${b.x}`;
  /* côté « vers les parents » et côté « vers les enfants » d'une carte */
  const cotePar = p => sens === 'v' ? { x: p.x, y: p.y - d.H / 2 } : { x: p.x + (mode === 'ascendants' ? d.W / 2 : -d.W / 2), y: p.y };
  const coteEnf = p => sens === 'v' ? { x: p.x, y: p.y + d.H / 2 } : { x: p.x + (mode === 'ascendants' ? -d.W / 2 : d.W / 2), y: p.y };
  void bord;
  plan.traits.forEach(t => {
    const a = pos.get(t.de), b = pos.get(t.vers); if (!a || !b) return;
    if (t.t === 'union') {
      traits += sens === 'v' ? `<path class="trait union${t.ex ? ' ex' : ''}" d="M${a.x + d.W / 2} ${a.y}H${b.x - d.W / 2}"/>` : `<path class="trait union${t.ex ? ' ex' : ''}" d="M${a.x} ${a.y + d.H / 2}V${b.y - d.H / 2}"/>`;
    } else if (t.t === 'enfant') {
      let dep = coteEnf(a);
      const c = t.avec && pos.get(t.avec);
      if (c) dep = sens === 'v' ? { x: (a.x + c.x) / 2, y: a.y } : { x: a.x, y: (a.y + c.y) / 2 };
      traits += `<path class="trait${t.nature === 'adoptif' || t.nature === 'beau' || t.nature === 'accueil' ? ' adoptif' : ''}" d="${coude(dep, cotePar(b))}"/>`;
    } else if (t.t === 'parent' || t.t === 'fantome') {
      traits += `<path class="trait${t.nature && t.nature !== 'biologique' ? ' adoptif' : ''}" d="${coude(cotePar(b), coteEnf(a))}"${t.t === 'fantome' ? ' opacity=".5"' : ''}/>`;
    } else if (t.t === 'fratrie') {
      traits += sens === 'v' ? `<path class="trait adoptif" d="M${a.x} ${a.y - d.H / 2}V${a.y - d.H / 2 - 16}H${b.x}V${b.y - d.H / 2}"/>` : `<path class="trait adoptif" d="M${a.x - d.W / 2} ${a.y}H${a.x - d.W / 2 - 16}V${b.y}H${b.x - d.W / 2}"/>`;
    }
  });
  let cartes = '';
  pos.forEach(({ x, y, n }) => { cartes += n.fantome ? carteFantome(n, x, y, d) : carteNoeud(racine, n, x, y, d, o); });
  const w = o.largeur || Math.round(L * z), h = o.largeur ? Math.round(o.largeur * H / L) : Math.round(H * z);
  return `<svg class="arbre" xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${L} ${H}" width="${w}" height="${h}" role="img" aria-label="Arbre familial de ${esc(nomComplet(personne(racine)))}">${traits}${cartes}</svg>`;
}
const couper = (t, n) => { t = String(t || ''); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
function aVerifier(p) { return (p.nD && (p.nCert || 'verifier') === 'verifier') || (p.dD && (p.dCert || 'verifier') === 'verifier'); }
function carteNoeud(racine, n, x, y, d, o) {
  const p = personne(n.id); if (!p) return '';
  const c = couleurBranche(racine, p.id), l = x - d.W / 2, t = y - d.H / 2, r = 19, cx = l + 30, cy = y;
  const cp = 'cp-' + p.id + '-' + Math.round(x) + '-' + Math.round(y);
  const av = p.photo ? `<clipPath id="${cp}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><image href="${p.photo}" x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" clip-path="url(#${cp})" preserveAspectRatio="xMidYMid slice"/>`
    : `<text class="ini" x="${cx}" y="${cy + 5}" text-anchor="middle">${esc(initiale(p))}</text>`;
  const nom = p.masque ? '' : (p.nom || '');
  const dates = p.masque ? 'Personne vivante' : (periode(p) || (estVivant(p) ? '' : ''));
  return `<g class="noeud${n.focus ? ' focus' : ''}${n.ex ? ' ex' : ''}" data-noeud="${p.id}" tabindex="0" role="button" aria-label="${esc(nomComplet(p))}">
    <title>${esc(nomComplet(p) + (p.surnom ? ' « ' + p.surnom + ' »' : '') + (periode(p) ? ' · ' + periode(p) : ''))}</title>
    <rect class="fond" x="${l}" y="${t}" width="${d.W}" height="${d.H}" rx="14"/>
    <rect x="${l + 4}" y="${t + 12}" width="4" height="${d.H - 24}" rx="2" fill="${c}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>${av}
    <text class="nom" x="${l + 56}" y="${t + (nom ? 22 : 28)}">${esc(couper(p.prenom || p.surnom || '?', 15))}</text>
    ${nom ? `<text class="nom2" x="${l + 56}" y="${t + 38}">${esc(couper(nom, 16))}</text>` : ''}
    <text class="dates" x="${l + 56}" y="${t + (nom ? 54 : 46)}">${esc(dates)}</text>
    ${!o.impression && anniversaireDans(p) != null && anniversaireDans(p) <= 7 ? `<g transform="translate(${cx + 15} ${cy - 11}) scale(${anniversaireDans(p) === 0 ? .78 : .6})"${anniversaireDans(p) === 0 ? '' : ' opacity=".8"'}><title>${esc(phraseAnniv(p, anniversaireDans(p)))}</title>${gateau(anniversaireDans(p) === 0)}</g>` : ''}
    ${!o.impression && aVerifier(p) ? `<circle cx="${l + d.W - 11}" cy="${t + 11}" r="4" fill="#F6C66E"><title>Une date est encore à vérifier</title></circle>` : ''}
  </g>`;
}
function carteFantome(n, x, y, d) {
  return `<g class="fantome" data-fantome="${n.fantome}" data-pour="${n.pour}" tabindex="0" role="button" aria-label="Ajouter un parent">
    <rect x="${x - d.W / 2 + 14}" y="${y - d.H / 2 + 8}" width="${d.W - 28}" height="${d.H - 16}" rx="13"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle">＋ Ajouter un parent</text></g>`;
}

/* ---------- l'éventail : les ancêtres en demi-roue ---------- */
function dessinerEventail(racine, prof, o) {
  const r0 = 62, anneau = 64, debut = -210, etendue = 240, R = r0 + prof * anneau;
  const rad = a => a * Math.PI / 180, pt = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
  const arc = (r1, r2, a1, a2) => {
    const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1), g = a2 - a1 > 180 ? 1 : 0;
    return `M${x1} ${y1}A${r2} ${r2} 0 ${g} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${g} 0 ${x4} ${y4}Z`;
  };
  let h = '';
  const parentsAffiches = id => parentsDe(id).sort((a, b) => (a.lien.nature === 'beau') - (b.lien.nature === 'beau')).slice(0, 2);
  function cellule(id, g, i) {
    if (g > prof) return;
    const n = Math.pow(2, g), a1 = debut + etendue * i / n, a2 = debut + etendue * (i + 1) / n, r1 = r0 + (g - 1) * anneau, r2 = r1 + anneau;
    const p = id && personne(id);
    if (!p) { h += `<path class="ev-vide" d="${arc(r1 + 2, r2 - 2, a1 + .4, a2 - .4)}"${o.mini || o.impression ? '' : ` data-fantome="parent" data-pour="${esc(cellule.enfant || '')}"`}/>`; return; }
    const c = couleurBranche(racine, p.id), m = (a1 + a2) / 2, rm = (r1 + r2) / 2;
    h += `<path class="ev-cell" d="${arc(r1, r2, a1, a2)}" fill="${c}" fill-opacity="${Math.max(.35, .9 - g * .1)}" data-noeud="${p.id}"><title>${esc(nomComplet(p) + (periode(p) ? ' · ' + periode(p) : ''))}</title></path>`;
    const [tx, ty] = pt(rm, m);
    if (g <= 2) {
      let rot = m + 90; if (Math.sin(rad(m)) > 0) rot += 180;
      h += `<g transform="translate(${tx} ${ty}) rotate(${rot})"><text class="ev-txt b" text-anchor="middle" y="-3">${esc(couper(p.prenom || '?', g === 1 ? 16 : 12))}</text><text class="ev-txt" text-anchor="middle" y="10">${esc(couper(p.nom || '', 14))}</text><text class="ev-txt d" text-anchor="middle" y="22">${esc(periode(p))}</text></g>`;
    } else {
      let rot = m; const gauche = Math.cos(rad(m)) < 0; if (gauche) rot += 180;
      h += `<g transform="translate(${tx} ${ty}) rotate(${rot})"><text class="ev-txt${g === 3 ? ' b' : ''}" text-anchor="middle" y="${g === 3 ? -1 : 3}" style="font-size:${g === 3 ? 10.5 : 9}px">${esc(couper(p.prenom || '?', g === 3 ? 10 : 9))}</text>${g === 3 ? `<text class="ev-txt d" text-anchor="middle" y="10">${esc(texteAnnee(p.nD, p.nQ))}</text>` : ''}</g>`;
    }
    const ps = parentsAffiches(p.id);
    [0, 1].forEach(k => { cellule.enfant = p.id; cellule(ps[k] ? ps[k].p.id : null, g + 1, i * 2 + k); });
  }
  const f = personne(racine), ps = parentsAffiches(racine);
  [0, 1].forEach(k => { cellule.enfant = racine; cellule(ps[k] ? ps[k].p.id : null, 1, k); });
  const c = couleurBranche(racine, racine);
  h += `<g class="noeud focus" data-noeud="${racine}"><circle r="${r0 - 3}" fill="${c}" fill-opacity=".9" stroke="var(--accent)" stroke-width="2"/>
    <text class="ev-txt b" text-anchor="middle" y="-2" style="font-size:14px;fill:#fff">${esc(couper(f.prenom || '?', 12))}</text>
    <text class="ev-txt" text-anchor="middle" y="14" style="fill:#fff">${esc(couper(f.nom || '', 12))}</text>
    <text class="ev-txt d" text-anchor="middle" y="28" style="fill:rgba(255,255,255,.85)">${esc(periode(f))}</text></g>`;
  const minY = -R - 10, maxY = Math.max(r0, R * Math.sin(rad(30))) + 12, L = 2 * R + 20, H = maxY - minY, z = o.zoom || 1;
  const w = o.largeur || Math.round(L * z), hh = o.largeur ? Math.round(o.largeur * H / L) : Math.round(H * z);
  return `<svg class="arbre" xmlns="http://www.w3.org/2000/svg" viewBox="${-R - 10} ${minY} ${L} ${H}" width="${w}" height="${hh}" role="img" aria-label="Éventail des ancêtres">${h}</svg>`;
}

/* ============================================================
   La carte des lieux : des continents en pointillés (tracés simplifiés,
   c'est une carte stylisée, pas un atlas), les lieux de la famille et
   les chemins de vie de chacun.
   ============================================================ */
const TERRES = [
  [[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-80,73],[-65,62],[-60,55],[-55,50],[-66,45],[-70,42],[-75,38],[-76,35],[-81,31],[-80,25],[-82,27],[-85,30],[-90,29],[-97,27],[-97,22],[-92,18],[-88,15],[-83,10],[-79,8],[-78,9],[-83,14],[-87,21],[-90,21],[-95,19],[-105,20],[-110,24],[-112,30],[-115,30],[-117,33],[-121,36],[-124,42],[-124,48],[-130,54],[-140,59],[-150,60],[-158,57],[-165,60],[-168,66]],
  [[-55,60],[-44,60],[-35,66],[-22,70],[-20,78],[-30,83],[-55,82],[-70,78],[-60,75],[-55,70],[-52,65],[-55,60]],
  [[-79,8],[-72,12],[-62,11],[-52,5],[-50,0],[-35,-6],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-66,-47],[-69,-52],[-72,-54],[-75,-50],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-78,2],[-77,7],[-79,8]],
  [[-9.5,36.5],[-9,43],[-2,43.5],[-1.5,46],[-4.5,48.5],[-1.5,49.5],[2,51],[5,53.5],[8,54],[8.5,57],[10.5,57.5],[5.5,58.5],[5,62],[10,64],[15,68],[20,70],[28,71],[40,68],[44,68],[60,70],[70,73],[80,73],[100,78],[112,76],[130,72],[142,72],[160,70],[180,69],[180,65],[170,60],[163,58],[156,51],[157,57],[163,62],[155,60],[142,59],[137,54],[141,48],[135,43],[129,41],[128,35],[126,35],[125,39],[121,40],[122,37],[119,35],[122,31],[121,28],[117,23],[110,21],[108,22],[106,19],[109,15],[109,11],[105,9],[103,10],[100,13],[100,8],[103,1.5],[101,3],[98,8],[98,16],[94,17],[92,22],[88,22],[86,20],[80,15],[80,10],[77,8],[73,16],[72,21],[67,25],[62,25],[57,26],[56,27],[50,30],[48,30],[50,26],[56,24],[59,22],[55,17],[52,16],[45,13],[43,13],[39,21],[35,28],[33,30],[34,32],[35.5,36],[30,36.5],[27,37],[26,40],[29,41],[31,41],[40,41],[41.5,41.5],[38,44.5],[35,45],[33,44.5],[30,46],[28,44],[28,42],[24,40.5],[23,38],[21,39],[19.5,42],[13.5,45.5],[12.5,44],[16,41],[18.5,40],[16,38],[15.7,40],[12,42],[10,44],[8,44],[4,43.5],[3,42],[0,39.5],[-.5,38],[-2,36.7],[-5,36],[-6,37],[-8.8,37],[-9.5,36.5]],
  [[-17,21],[-16,14],[-17,14.7],[-12,7.5],[-8,4.5],[-2,5],[4,6],[9,4],[9.5,1],[12,-5],[13.5,-12],[12,-17],[15,-27],[18,-34],[20,-35],[26,-34],[32,-29],[35,-24],[35.5,-20],[40.5,-15],[40,-10],[39,-5],[42,0],[48,5],[51,11.5],[43.5,11.5],[39,17],[37,21],[35,26],[32.5,30],[29,31],[20,31],[20,32.5],[15,32],[11,33.5],[10,37],[3,37],[-2,35],[-6,35.8],[-9.5,32],[-10,29],[-13,27.5],[-17,21]],
  [[44,-25],[47,-25],[50,-15],[49.5,-12],[47,-15],[44,-18],[44,-25]],
  [[114,-22],[114,-34],[118,-35],[124,-33],[131,-31.5],[138,-35],[141,-38],[147,-38.5],[150,-37],[153,-31],[153,-25],[149,-20],[146,-18],[145,-14],[142,-11],[141,-17],[136,-15],[136,-12],[131,-11],[126,-14],[122,-18],[114,-22]],
  [[-5.5,50],[1.5,51],[1.7,52.7],[0,53.5],[-1.5,55],[-2,57],[-3.5,58.6],[-5,58.6],[-6,56.5],[-5,55],[-3,54],[-4.5,53],[-5,51.7],[-5.5,50]],
  [[-10,51.5],[-6,52],[-6,54],[-7.5,55.3],[-10,54.3],[-10,51.5]],
  [[-24,65.5],[-22,66.5],[-15,66.5],[-13.5,65],[-18,63.4],[-22,63.8],[-24,65.5]],
  [[130,31],[132,34],[135,34],[140,35],[141,38],[142,41],[140.5,41.5],[139.5,38],[137,37],[133,35.5],[130,33.5],[130,31]],
  [[95,5.5],[98,4],[104,-2],[106,-6],[102,-4],[98,0],[95,5.5]], [[109,1.5],[113,-3],[116,-4],[119,1],[117,7],[113,4],[109,1.5]],
  [[105,-6],[114.5,-7],[114.5,-8.5],[106,-7],[105,-6]], [[131,-1],[141,-2.5],[150,-10],[141,-9],[137,-5],[131,-1]],
  [[172.5,-34.5],[178.5,-37.5],[174.5,-41.5],[172,-41],[172.5,-34.5]], [[172,-41],[174,-41.5],[171,-44.5],[167,-46.3],[168,-44],[172,-41]],
  [[-85,22],[-80,23],[-74,20],[-78,20],[-85,22]], [[-74.5,18.5],[-72,20],[-68.5,18.5],[-71.5,17.8],[-74.5,18.5]],
  [[8.6,42.9],[9.4,43],[9.55,42.1],[9.2,41.4],[8.6,41.9],[8.6,42.9]],
  [[-61.23,14.87],[-61,14.88],[-60.82,14.75],[-60.87,14.45],[-60.83,14.4],[-61.08,14.43],[-61.18,14.55],[-61.23,14.87]],
  [[-61.8,16.33],[-61.55,16.35],[-61.55,15.95],[-61.75,16.0],[-61.8,16.33]], [[-61.55,16.25],[-61.2,16.5],[-61.18,16.25],[-61.4,16.2],[-61.55,16.25]],
  [[55.2,-21.0],[55.8,-21.1],[55.7,-21.4],[55.3,-21.3],[55.2,-21.0]], [[-60.95,14.1],[-60.88,13.9],[-61.07,13.72],[-61.08,13.95],[-60.95,14.1]],
  [[-61.48,15.63],[-61.25,15.55],[-61.25,15.23],[-61.4,15.2],[-61.48,15.63]]
];
let nCarte = 0;
function dessinerCarte(lieux, routes, o = {}) {
  nCarte++;
  let x0 = -170, x1 = 180, y0 = -78, y1 = 56;          /* en degrés : x = longitude, y = −latitude */
  if (o.cadre) { [x0, x1] = [o.cadre[0], o.cadre[1]]; [y0, y1] = [-o.cadre[2], -o.cadre[3]]; }
  else if (!o.monde && lieux.length) {
    const lons = lieux.map(l => l.lon), lats = lieux.map(l => -l.lat);
    x0 = Math.min(...lons); x1 = Math.max(...lons); y0 = Math.min(...lats); y1 = Math.max(...lats);
    const mx = Math.max(1.2, (x1 - x0) * .18), my = Math.max(.9, (y1 - y0) * .22);
    x0 -= mx; x1 += mx; y0 -= my; y1 += my;
    const ratio = o.ratio || 2.1;
    if ((x1 - x0) / (y1 - y0) < ratio) { const c = (x0 + x1) / 2, w = (y1 - y0) * ratio; x0 = c - w / 2; x1 = c + w / 2; }
    else { const c = (y0 + y1) / 2, hh = (x1 - x0) / ratio; y0 = c - hh / 2; y1 = c + hh / 2; }
  }
  const W = x1 - x0, H = y1 - y0, k = W / 150, id = 'pc' + nCarte;
  const poly = t => 'M' + t.map(([lo, la]) => lo + ' ' + (-la)).join('L') + 'Z';
  let h = `<defs><pattern id="${id}" width="${k * 1.6}" height="${k * 1.6}" patternUnits="userSpaceOnUse"><circle cx="${k * .8}" cy="${k * .8}" r="${k * .42}" class="pt-carte"/></pattern></defs>`;
  h += `<g>${TERRES.map(t => `<path class="contour" d="${poly(t)}"/><path d="${poly(t)}" fill="url(#${id})"/>`).join('')}</g>`;
  routes.forEach((r, i) => {
    if (r.length < 2) return;
    let d = `M${r[0].lon} ${-r[0].lat}`;
    for (let j = 1; j < r.length; j++) {
      const a = r[j - 1], b = r[j], mx = (a.lon + b.lon) / 2, my = (-a.lat - b.lat) / 2, dist = Math.hypot(b.lon - a.lon, b.lat - a.lat);
      d += `Q${mx} ${my - dist * .28} ${b.lon} ${-b.lat}`;
    }
    h += `<path class="route" d="${d}" style="stroke-width:${k * .55};stroke-dasharray:${k * 1.4} ${k * 1.1};animation-delay:-${i * 2}s"/>`;
  });
  lieux.forEach(l => {
    const r = k * (.9 + Math.min(1.6, (l.n || 1) * .18));
    h += `<g class="lieu"${l.cle ? ` data-lieu="${esc(l.cle)}"` : ''}><title>${esc(l.nom)}${l.n ? ' · ' + l.n + ' mention' + (l.n > 1 ? 's' : '') : ''}</title>
      <circle class="h" cx="${l.lon}" cy="${-l.lat}" r="${r * 2}"/><circle class="c" cx="${l.lon}" cy="${-l.lat}" r="${r}"/>
      ${o.sansNoms ? '' : `<text x="${l.lon + r * 1.6}" y="${-l.lat + k * .7}" style="font-size:${k * 2.1}px;stroke-width:${k * .5}">${esc(l.nom)}</text>`}</g>`;
  });
  return `<svg viewBox="${x0} ${y0} ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte des lieux de la famille"${o.clic ? ' data-clic-carte="1"' : ''} style="aspect-ratio:${(W / H).toFixed(3)}">${h}</svg>`;
}
