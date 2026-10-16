/* ================================================================
   NaoPlan — l'aménagement
   ----------------------------------------------------------------
   Un catalogue de meubles de base, à poser sur le plan pour se
   projeter : lit, WC, lavabo, double vasque, canapé, cuisine, frigo,
   lave-vaisselle, dressing, buanderie, piscines…
   Chaque meuble est dessiné dans son propre repère : largeur w le
   long du mur, profondeur d, le dos contre le mur en y = 0. On le
   place ensuite par son centre (cx, cy) et un angle (rot, en degrés,
   dans le sens des aiguilles d'une montre). Des symboles d'architecte,
   pas des images : ils disent l'usage et l'encombrement.
   ================================================================ */
const NPM = (function () {
  'use strict';

  const f = v => Math.round(v * 1000) / 1000;
  const R = (x, y, w, h, r, cls) => '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(Math.max(.01, w)) +
    '" height="' + f(Math.max(.01, h)) + '"' + (r ? ' rx="' + f(r) + '"' : '') + ' class="' + (cls || 'mob') + '"/>';
  const P = (x, y, w, h, r) => R(x, y, w, h, r, 'mob-plein');
  const L = (x1, y1, x2, y2) => '<path d="M' + f(x1) + ' ' + f(y1) + 'L' + f(x2) + ' ' + f(y2) + '" class="mob"/>';
  const C = (cx, cy, r) => '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(Math.max(.01, r)) + '" class="mob"/>';
  const E = (cx, cy, rx, ry) => '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(Math.max(.01, rx)) +
    '" ry="' + f(Math.max(.01, ry)) + '" class="mob"/>';
  const D = d => '<path d="' + d + '" class="mob"/>';

  /* ---------- Les dessins ---------- */
  function lit(w, d) {
    let s = R(0, 0, w, d, .06) + P(0, 0, w, d, .06);
    /* un ou deux oreillers, côté tête */
    const n = w >= 1.2 ? 2 : 1, g = .08, lo = (w - g * (n + 1)) / n;
    for (let i = 0; i < n; i++) s += R(g + i * (lo + g), .08, lo, Math.min(.38, d * .2), .08);
    /* le rabat de la couette */
    s += L(0, d * .34, w, d * .34);
    return s;
  }
  function litBebe(w, d) {
    let s = R(0, 0, w, d, .03) + R(.05, .05, w - .1, d - .1, .02);
    for (let x = .12; x < w - .05; x += .1) { s += L(x, 0, x, .05) + L(x, d - .05, x, d); }
    return s;
  }
  function chaises(w, d, n, prof) {
    /* n chaises de chaque côté long d'une table */
    let s = '';
    const pas = w / n;
    for (let i = 0; i < n; i++) {
      const cx = pas * (i + .5);
      s += R(cx - .2, 0, .4, prof - .06, .06) + L(cx - .2, .03, cx + .2, .03);
      s += R(cx - .2, d - prof + .06, .4, prof - .06, .06) + L(cx - .2, d - .03, cx + .2, d - .03);
    }
    return s;
  }
  function table(w, d) {
    const prof = Math.min(.5, d * .28);
    const n = Math.max(1, Math.floor((w + .1) / .62));
    return chaises(w, d, n, prof) + R(0, prof, w, d - 2 * prof, .04) + P(0, prof, w, d - 2 * prof, .04);
  }
  function tableRonde(w, d) {
    const r = Math.max(.25, Math.min(w, d) / 2 - .45);
    const cx = w / 2, cy = d / 2;
    let s = '';
    const n = Math.max(3, Math.min(8, Math.round((2 * Math.PI * r) / .6)));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      s += C(cx + Math.cos(a) * (r + .24), cy + Math.sin(a) * (r + .24), .19);
    }
    return s + C(cx, cy, r) + '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" class="mob-plein"/>';
  }
  function canape(w, d) {
    const b = Math.min(.24, d * .28), a = Math.min(.22, w * .12);
    let s = R(0, 0, w, d, .1) + P(0, 0, w, d, .1) + R(0, 0, w, b, .08) + R(0, 0, a, d, .08) + R(w - a, 0, a, d, .08);
    const n = w > 1.7 ? 3 : w > 1.2 ? 2 : 1;
    for (let i = 1; i < n; i++) { const x = a + (w - 2 * a) * i / n; s += L(x, b, x, d - .04); }
    return s;
  }
  function canapeAngle(w, d) {
    const p = Math.min(.95, w * .45, d * .5), b = .22;
    const contour = 'M0 0H' + f(w) + 'V' + f(p) + 'H' + f(p) + 'V' + f(d) + 'H0Z';
    return D(contour) + '<path d="' + contour + '" class="mob-plein"/>' +
      D('M0 ' + b + 'H' + f(w - .2) + 'M' + b + ' ' + b + 'V' + f(d)) +
      R(w - .22, 0, .22, p, .08) + R(0, d - .22, p, .22, .08) + L(p, b, p, p);
  }
  function fauteuil(w, d) {
    const a = Math.min(.18, w * .2);
    return R(0, 0, w, d, .12) + P(0, 0, w, d, .12) + R(0, 0, w, .2, .08) + R(0, 0, a, d, .08) + R(w - a, 0, a, d, .08);
  }
  function meubleTV(w, d) {
    return R(0, 0, w, d, .03) + P(w * .14, .05, w * .72, .07, .02) + L(w * .14, .09, w * .86, .09);
  }
  function bibliotheque(w, d) {
    let s = R(0, 0, w, d, .02);
    for (let x = .4; x < w - .1; x += .4) s += L(x, 0, x, d);
    return s + L(0, d * .5, w, d * .5);
  }
  function tapis(w, d) {
    return '<rect x="0" y="0" width="' + f(w) + '" height="' + f(d) + '" rx=".05" class="mob" stroke-dasharray=".12 .08"/>' +
      '<rect x=".12" y=".12" width="' + f(Math.max(.01, w - .24)) + '" height="' + f(Math.max(.01, d - .24)) + '" rx=".03" class="mob" opacity=".5"/>';
  }
  function plante(w, d) {
    const cx = w / 2, cy = d / 2, r = Math.min(w, d) / 2;
    let s = C(cx, cy, r * .45);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      s += E(cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6, r * .38, r * .38);
    }
    return s;
  }
  function armoire(w, d) {
    let s = R(0, 0, w, d, .02) + L(0, d * .5, w, d * .5);
    const n = Math.max(1, Math.round(w / .5));
    for (let i = 1; i < n; i++) s += L(w * i / n, d * .5, w * i / n, d);
    return s;
  }
  function dressing(w, d) {
    let s = R(0, 0, w, d, .02) + L(.05, d / 2, w - .05, d / 2);
    for (let x = .12; x < w - .08; x += .16) s += L(x, d / 2 - .14, x + .04, d / 2 + .14);
    return s;
  }
  function placard(w, d) { return R(0, 0, w, d, .02) + L(0, 0, w, d) + L(w, 0, 0, d); }
  function etageres(w, d) {
    let s = R(0, 0, w, d, .02);
    for (let x = .45; x < w - .1; x += .45) s += L(x, 0, x, d);
    return s;
  }
  function commode(w, d) { return R(0, 0, w, d, .03) + L(.04, d - .07, w - .04, d - .07); }
  function chevet(w, d) { return R(0, 0, w, d, .04) + C(w / 2, d / 2, Math.min(w, d) * .22); }
  function bureau(w, d) { return R(0, 0, w, d, .03) + P(0, 0, w, d, .03) + L(w * .3, .1, w * .7, .1); }
  function chaise(w, d) { return R(0, .06, w, d - .06, .06) + L(0, .04, w, .04); }
  function wc(w, d) {
    const r = Math.min(.2, d * .3);
    return R(.02, 0, w - .04, r, .03) + E(w / 2, r + (d - r) / 2, w * .42, (d - r) / 2 * .96) +
      E(w / 2, r + (d - r) / 2 + .02, w * .26, (d - r) / 2 * .6);
  }
  function lavabo(w, d) { return R(0, 0, w, d, .05) + E(w / 2, d * .56, w * .32, d * .3) + C(w / 2, .08, .025); }
  function doubleVasque(w, d) {
    let s = R(0, 0, w, d, .04) + P(0, 0, w, d, .04);
    [w * .27, w * .73].forEach(x => { s += E(x, d * .56, Math.min(.24, w * .17), d * .28) + C(x, .08, .025); });
    return s;
  }
  function douche(w, d) {
    return R(0, 0, w, d, .02) + L(0, 0, w, d) + L(w, 0, 0, d) + C(w / 2, d / 2, .05);
  }
  function doucheItalienne(w, d) {
    return R(0, 0, w, d, .02) + L(.12, .12, w - .12, .12) + L(.12, .16, w - .12, .16) +
      '<path d="M' + f(w * .6) + ' ' + f(d) + 'H' + f(w) + '" class="mob" stroke-width=".07"/>';
  }
  function baignoire(w, d) {
    const r = Math.min(.3, d / 2 - .08, w / 2 - .08);
    return R(0, 0, w, d, .06) + R(.08, .08, w - .16, d - .16, Math.max(.02, r)) + C(.26, d / 2, .035);
  }
  function plan(w, d) { return R(0, 0, w, d, .02) + P(0, 0, w, d, .02) + L(0, d - .05, w, d - .05); }
  function evier(w, d) {
    const deux = w >= 1.1;
    let s = R(0, 0, w, d, .02) + P(0, 0, w, d, .02);
    if (deux) s += R(w * .08, .12, w * .38, d - .2, .05) + R(w * .54, .12, w * .38, d - .2, .05);
    else s += R(w * .12, .12, w * .76, d - .2, .05);
    return s + C(w / 2, .07, .025);
  }
  function plaque(w, d) {
    const r1 = Math.min(w, d) * .17, r2 = Math.min(w, d) * .13;
    return R(0, 0, w, d, .02) + C(w * .3, d * .3, r1) + C(w * .7, d * .3, r2) + C(w * .3, d * .72, r2) + C(w * .7, d * .72, r1);
  }
  function ilot(w, d) { return R(0, 0, w, d, .04) + P(0, 0, w, d, .04) + L(0, d * .5, w, d * .5); }
  function hotte(w, d) { return R(0, 0, w, d, .02) + L(0, 0, w / 2, d) + L(w, 0, w / 2, d); }
  function electro(tag) {
    return (w, d, T) => R(0, 0, w, d, .03) + L(.04, d - .06, w - .04, d - .06) + T(w / 2, d / 2, tag, Math.min(.2, w * .28));
  }
  function tambour(tag) {
    return (w, d, T) => R(0, 0, w, d, .03) + C(w / 2, d / 2 + .02, Math.min(w, d) * .32) + T(w / 2, d / 2 + .02, tag, Math.min(.14, w * .22));
  }
  function bac(w, d) { return R(0, 0, w, d, .03) + R(.07, .1, w - .14, d - .16, .05) + C(w / 2, .06, .02); }
  function rond(tag) { return (w, d, T) => C(w / 2, d / 2, Math.min(w, d) / 2) + T(w / 2, d / 2, tag, Math.min(.14, w * .22)); }
  function etiquette(tag) { return (w, d, T) => R(0, 0, w, d, .03) + T(w / 2, d / 2, tag, Math.min(.14, w * .2)); }
  function etendoir(w, d) {
    let s = '<rect x="0" y="0" width="' + f(w) + '" height="' + f(d) + '" class="mob" stroke-dasharray=".08 .06"/>';
    for (let y = .1; y < d - .05; y += .1) s += L(.05, y, w - .05, y);
    return s;
  }
  function spa(w, d) {
    return R(0, 0, w, d, .3) + P(0, 0, w, d, .3) + R(.15, .15, w - .3, d - .3, .25) + C(w / 2, d / 2, Math.min(w, d) * .12);
  }
  function bainSoleil(w, d) { return R(0, 0, w, d, .08) + L(0, d * .3, w, d * .3) + P(0, 0, w, d * .3, .08); }
  function parasol(w, d) {
    const cx = w / 2, cy = d / 2, r = Math.min(w, d) / 2;
    let s = C(cx, cy, r) + C(cx, cy, .05);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += L(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    return s;
  }
  function barbecue(w, d) {
    let s = R(0, 0, w, d, .04);
    for (let x = .12; x < w - .05; x += .1) s += L(x, .08, x, d - .08);
    return s;
  }
  function poele(w, d) { return R(0, 0, w, d, .06) + C(w / 2, d / 2, Math.min(w, d) * .3) + C(w / 2, .12, .06); }
  function voiture(w, d) {
    return R(0, 0, w, d, .35) + L(.1, d * .28, w - .1, d * .28) + L(.1, d * .5, w - .1, d * .5);
  }

  /* ---------- Le catalogue ----------
     w, d : largeur et profondeur en mètres ; h : hauteur, pour la 3D.
     libre : pas de dos, il ne se tourne pas vers un mur quand on le pose. */
  const CATS = [
    ['chambre', '🛏️', 'Chambre'], ['bain', '🛁', 'Salle d\'eau'], ['cuisine', '🍳', 'Cuisine'],
    ['sejour', '🛋️', 'Séjour'], ['range', '🧥', 'Rangement'], ['buand', '🧺', 'Buanderie'], ['dehors', '🌴', 'Extérieur']
  ];
  const CATALOGUE = {
    lit_double:      {cat: 'chambre', nom: 'Lit double',        w: 1.6,  d: 2.0,  h: .55, dessin: lit},
    lit_simple:      {cat: 'chambre', nom: 'Lit simple',        w: .9,   d: 1.9,  h: .55, dessin: lit},
    lit_bebe:        {cat: 'chambre', nom: 'Lit bébé',          w: .66,  d: 1.26, h: .9,  dessin: litBebe},
    chevet:          {cat: 'chambre', nom: 'Chevet',            w: .45,  d: .4,   h: .5,  dessin: chevet},
    armoire:         {cat: 'chambre', nom: 'Armoire',           w: 1.2,  d: .6,   h: 2.1, dessin: armoire},
    commode:         {cat: 'chambre', nom: 'Commode',           w: 1.0,  d: .5,   h: .85, dessin: commode},
    bureau:          {cat: 'chambre', nom: 'Bureau',            w: 1.2,  d: .6,   h: .75, dessin: bureau},
    chaise:          {cat: 'chambre', nom: 'Chaise',            w: .45,  d: .48,  h: .9,  dessin: chaise},

    wc:              {cat: 'bain', nom: 'WC',                   w: .4,   d: .65,  h: .78, dessin: wc},
    lavabo:          {cat: 'bain', nom: 'Lavabo',               w: .6,   d: .46,  h: .85, dessin: lavabo},
    double_vasque:   {cat: 'bain', nom: 'Double vasque',        w: 1.4,  d: .5,   h: .85, dessin: doubleVasque},
    douche:          {cat: 'bain', nom: 'Douche',               w: .9,   d: .9,   h: .1,  dessin: douche},
    douche_it:       {cat: 'bain', nom: 'Douche à l\'italienne', w: 1.4, d: .9,   h: .05, dessin: doucheItalienne},
    baignoire:       {cat: 'bain', nom: 'Baignoire',            w: 1.7,  d: .75,  h: .55, dessin: baignoire},
    seche_serv:      {cat: 'bain', nom: 'Sèche-serviettes',     w: .5,   d: .1,   h: 1.2, dessin: etiquette('')},

    plan:            {cat: 'cuisine', nom: 'Plan de travail',   w: 1.8,  d: .62,  h: .9,  dessin: plan},
    evier:           {cat: 'cuisine', nom: 'Évier',             w: .9,   d: .62,  h: .9,  dessin: evier},
    plaque:          {cat: 'cuisine', nom: 'Plaque de cuisson', w: .6,   d: .62,  h: .9,  dessin: plaque},
    four:            {cat: 'cuisine', nom: 'Four (colonne)',    w: .6,   d: .62,  h: 2.1, dessin: electro('Four')},
    frigo:           {cat: 'cuisine', nom: 'Réfrigérateur',     w: .6,   d: .65,  h: 1.85, dessin: electro('Frigo')},
    frigo_us:        {cat: 'cuisine', nom: 'Frigo américain',   w: .92,  d: .72,  h: 1.8, dessin: electro('Frigo US')},
    lave_vaisselle:  {cat: 'cuisine', nom: 'Lave-vaisselle',    w: .6,   d: .62,  h: .85, dessin: electro('LV')},
    hotte:           {cat: 'cuisine', nom: 'Hotte',             w: .9,   d: .5,   h: .3,  dessin: hotte},
    ilot:            {cat: 'cuisine', nom: 'Îlot central',      w: 1.8,  d: .9,   h: .9,  dessin: ilot, libre: true},
    table:           {cat: 'cuisine', nom: 'Table + chaises',   w: 1.8,  d: 1.9,  h: .75, dessin: table, libre: true},
    table_ronde:     {cat: 'cuisine', nom: 'Table ronde',       w: 2.0,  d: 2.0,  h: .75, dessin: tableRonde, libre: true},

    canape:          {cat: 'sejour', nom: 'Canapé 3 places',    w: 2.2,  d: .92,  h: .8,  dessin: canape},
    canape_angle:    {cat: 'sejour', nom: 'Canapé d\'angle',    w: 2.7,  d: 1.9,  h: .8,  dessin: canapeAngle},
    fauteuil:        {cat: 'sejour', nom: 'Fauteuil',           w: .85,  d: .85,  h: .8,  dessin: fauteuil},
    table_basse:     {cat: 'sejour', nom: 'Table basse',        w: 1.1,  d: .6,   h: .4,  dessin: (w, d) => R(0, 0, w, d, .06), libre: true},
    meuble_tv:       {cat: 'sejour', nom: 'Meuble TV + écran',  w: 1.8,  d: .45,  h: .55, dessin: meubleTV},
    bibliotheque:    {cat: 'sejour', nom: 'Bibliothèque',       w: 1.2,  d: .35,  h: 2.0, dessin: bibliotheque},
    poele:           {cat: 'sejour', nom: 'Poêle / cheminée',   w: .6,   d: .6,   h: 1.2, dessin: poele},
    tapis:           {cat: 'sejour', nom: 'Tapis',              w: 2.0,  d: 1.4,  h: .01, dessin: tapis, libre: true},
    plante:          {cat: 'sejour', nom: 'Plante',             w: .5,   d: .5,   h: 1.2, dessin: plante, libre: true},

    dressing:        {cat: 'range', nom: 'Dressing (penderie)', w: 2.0,  d: .6,   h: 2.2, dessin: dressing},
    placard:         {cat: 'range', nom: 'Placard',             w: 1.2,  d: .6,   h: 2.2, dessin: placard},
    etageres:        {cat: 'range', nom: 'Étagères',            w: 1.35, d: .4,   h: 2.0, dessin: etageres},

    lave_linge:      {cat: 'buand', nom: 'Lave-linge',          w: .6,   d: .6,   h: .85, dessin: tambour('LL')},
    seche_linge:     {cat: 'buand', nom: 'Sèche-linge',         w: .6,   d: .6,   h: .85, dessin: tambour('SL')},
    bac_laver:       {cat: 'buand', nom: 'Bac à laver',         w: .6,   d: .5,   h: .9,  dessin: bac},
    chauffe_eau:     {cat: 'buand', nom: 'Chauffe-eau',         w: .6,   d: .6,   h: 1.8, dessin: rond('ECS')},
    chaudiere:       {cat: 'buand', nom: 'Chaudière / PAC',     w: .6,   d: .45,  h: .9,  dessin: etiquette('Chaud.')},
    etendoir:        {cat: 'buand', nom: 'Étendoir',            w: 1.0,  d: .55,  h: 1.0, dessin: etendoir, libre: true},

    piscine_rect:    {cat: 'dehors', nom: 'Piscine rectangulaire', w: 8,   d: 4,    annexe: {forme: 'rect',    pose: 'creusee'}},
    piscine_carree:  {cat: 'dehors', nom: 'Piscine carrée',        w: 5,   d: 5,    annexe: {forme: 'carre',   pose: 'creusee'}},
    piscine_haricot: {cat: 'dehors', nom: 'Piscine haricot',       w: 7,   d: 3.8,  annexe: {forme: 'haricot', pose: 'creusee'}},
    piscine_ronde:   {cat: 'dehors', nom: 'Piscine ronde hors-sol', w: 4.6, d: 4.6, annexe: {forme: 'ronde',   pose: 'horssol'}},
    piscine_ovale:   {cat: 'dehors', nom: 'Piscine ovale hors-sol', w: 6.1, d: 3.75, annexe: {forme: 'ovale',  pose: 'horssol'}},
    piscine_hs_rect: {cat: 'dehors', nom: 'Piscine hors-sol rectangulaire', w: 5, d: 3, annexe: {forme: 'rect', pose: 'horssol'}},
    spa:             {cat: 'dehors', nom: 'Spa',                w: 2.0,  d: 2.0,  h: .9,  dessin: spa, libre: true},
    bain_soleil:     {cat: 'dehors', nom: 'Bain de soleil',     w: .7,   d: 1.9,  h: .35, dessin: bainSoleil, libre: true},
    salon_jardin:    {cat: 'dehors', nom: 'Table de jardin',    w: 1.8,  d: 1.9,  h: .75, dessin: table, libre: true},
    parasol:         {cat: 'dehors', nom: 'Parasol',            w: 2.5,  d: 2.5,  h: .1,  dessin: parasol, libre: true},
    barbecue:        {cat: 'dehors', nom: 'Barbecue / plancha', w: 1.0,  d: .55,  h: .9,  dessin: barbecue},
    voiture:         {cat: 'dehors', nom: 'Voiture',            w: 1.8,  d: 4.4,  h: 1.45, dessin: voiture, libre: true}
  };

  /* ---------- Les piscines : leur contour ----------
     Un seul chemin pour toutes les formes : on s'en sert pour la
     margelle, pour l'eau et pour la sélection. */
  function cheminPiscine(x, y, w, h, forme) {
    w = Math.max(.1, w); h = Math.max(.1, h);
    const arrondi = r => {
      r = Math.min(r, w / 2, h / 2);
      return 'M' + f(x + r) + ' ' + f(y) + 'H' + f(x + w - r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + w) + ' ' + f(y + r) +
        'V' + f(y + h - r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + w - r) + ' ' + f(y + h) +
        'H' + f(x + r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x) + ' ' + f(y + h - r) +
        'V' + f(y + r) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + r) + ' ' + f(y) + 'Z';
    };
    if (forme === 'ronde') {
      const rx = w / 2, ry = h / 2, cy = y + ry;
      return 'M' + f(x) + ' ' + f(cy) + 'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(x + w) + ' ' + f(cy) +
        'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(x) + ' ' + f(cy) + 'Z';
    }
    if (forme === 'ovale') return arrondi(Math.min(w, h) / 2);
    if (forme === 'haricot') {
      const u = v => f(x + v * w), v = t => f(y + t * h);
      return 'M' + u(.28) + ' ' + v(0) +
        'C' + u(.42) + ' ' + v(0) + ' ' + u(.48) + ' ' + v(.2) + ' ' + u(.62) + ' ' + v(.2) +
        'C' + u(.76) + ' ' + v(.2) + ' ' + u(.8) + ' ' + v(0) + ' ' + u(.9) + ' ' + v(.05) +
        'C' + u(1) + ' ' + v(.1) + ' ' + u(1) + ' ' + v(.45) + ' ' + u(1) + ' ' + v(.6) +
        'C' + u(1) + ' ' + v(.85) + ' ' + u(.85) + ' ' + v(1) + ' ' + u(.6) + ' ' + v(1) +
        'L' + u(.3) + ' ' + v(1) +
        'C' + u(.1) + ' ' + v(1) + ' ' + u(0) + ' ' + v(.8) + ' ' + u(0) + ' ' + v(.5) +
        'C' + u(0) + ' ' + v(.2) + ' ' + u(.12) + ' ' + v(0) + ' ' + u(.28) + ' ' + v(0) + 'Z';
    }
    return arrondi(forme === 'rect' || forme === 'carre' ? .15 : .15);
  }
  const FORMES_PISCINE = [['rect', 'Rectangulaire'], ['carre', 'Carrée'], ['ronde', 'Ronde'], ['ovale', 'Ovale'], ['haricot', 'Haricot']];
  const POSES_PISCINE = [['creusee', 'Creusée'], ['semi', 'Semi-enterrée'], ['horssol', 'Hors-sol']];

  /* ---------- La géométrie d'un meuble posé ---------- */
  function emprise(m) {
    const a = (m.rot || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    const W = m.w * c + m.d * s, H = m.w * s + m.d * c;
    return {x: m.cx - W / 2, y: m.cy - H / 2, w: W, h: H};
  }
  /* Un point du plan, ramené dans le repère du meuble (centre en 0,0). */
  function versLocal(m, x, y) {
    const a = (m.rot || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const dx = x - m.cx, dy = y - m.cy;
    return {x: dx * c + dy * s, y: -dx * s + dy * c};
  }
  function versPlan(m, lx, ly) {
    const a = (m.rot || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return {x: m.cx + lx * c - ly * s, y: m.cy + lx * s + ly * c};
  }

  /* Le dessin complet d'un meuble posé. */
  function dessiner(m, opts) {
    opts = opts || {};
    const def = CATALOGUE[m.genre];
    if (!def || !def.dessin) return '';
    const rot = m.rot || 0;
    /* Les petites étiquettes (LV, Frigo…) restent lisibles : elles ne tournent pas. */
    const T = (x, y, txt, fs) => txt ? '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + f(fs) +
      '" text-anchor="middle" dominant-baseline="central" class="mob-txt"' +
      (rot ? ' transform="rotate(' + (-rot) + ' ' + f(x) + ' ' + f(y) + ')"' : '') + '>' + txt + '</text>' : '';
    let s = '<g class="meuble' + (opts.sel ? ' sel' : '') + '"' + (opts.interactif ? ' data-meuble="' + m.id + '"' : '') +
      ' transform="translate(' + f(m.cx) + ' ' + f(m.cy) + ') rotate(' + f(rot) + ') translate(' + f(-m.w / 2) + ' ' + f(-m.d / 2) + ')">';
    if (opts.interactif) s += '<rect class="fond-meuble" x="-.04" y="-.04" width="' + f(m.w + .08) + '" height="' + f(m.d + .08) + '" rx=".05"/>';
    s += def.dessin(m.w, m.d, T);
    if (opts.interactif && opts.sel) {
      /* Deux poignées : on étire la largeur (à droite) et la profondeur (devant). */
      s += '<rect class="poignee-meuble pm-e" data-meuble="' + m.id + '" data-cote="e" x="' + f(m.w - .06) + '" y="' + f(m.d / 2 - .22) +
        '" width=".16" height=".44" rx=".06"/>' +
        '<rect class="poignee-meuble pm-s" data-meuble="' + m.id + '" data-cote="s" x="' + f(m.w / 2 - .22) + '" y="' + f(m.d - .06) +
        '" width=".44" height=".16" rx=".06"/>' +
        '<path class="dos-meuble" d="M0 0H' + f(m.w) + '"/>';
    }
    return s + '</g>';
  }

  /* Une petite vignette pour le catalogue. */
  function icone(genre) {
    const def = CATALOGUE[genre];
    if (!def) return '';
    const w = def.w, d = def.d, m = Math.max(w, d) * .08;
    let corps;
    if (def.annexe) {
      const hs = def.annexe.pose === 'horssol';
      corps = '<path d="' + cheminPiscine(0, 0, w, d, def.annexe.forme) + '" class="ic-plage"' + (hs ? ' style="stroke-width:2.5px"' : '') + '/>' +
        (hs ? '' : '<path d="' + cheminPiscine(w * .1, d * .1, w * .8, d * .8, def.annexe.forme) + '" class="ic-eau"/>');
    } else {
      corps = def.dessin(w, d, (x, y, t, fs) => t ? '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + f(fs) +
        '" text-anchor="middle" dominant-baseline="central" class="mob-txt">' + t + '</text>' : '');
    }
    return '<svg viewBox="' + f(-m) + ' ' + f(-m) + ' ' + f(w + 2 * m) + ' ' + f(d + 2 * m) + '" class="cat-ic" aria-hidden="true">' + corps + '</svg>';
  }

  /* ---------- Contre les murs ----------
     Les murs du niveau, avec l'épaisseur de chacun : 30 cm en façade,
     9 cm pour une cloison. Les faces sont ce contre quoi on plaque. */
  function murs(pn) {
    const W = pn.W, H = pn.H, E = .04;
    return NP.mursReels(pn).map(m => {
      const ext = m.axe === 'v' ? (Math.abs(m.pos) < E || Math.abs(m.pos - W) < E) : (Math.abs(m.pos) < E || Math.abs(m.pos - H) < E);
      return {axe: m.axe, pos: m.pos, a: m.a, b: m.b, ep: ext ? .3 : .09};
    });
  }

  /* Plaque le meuble contre le mur le plus proche, s'il en est à moins
     de S : c'est l'aimant qui évite les meubles à 3 cm d'un mur. */
  function plaquer(pn, m, S) {
    S = S == null ? .18 : S;
    const b = emprise(m);
    let mx = null, my = null;
    murs(pn).forEach(w => {
      const e = w.ep / 2;
      if (w.axe === 'v') {
        if (Math.min(b.y + b.h, w.b) - Math.max(b.y, w.a) < .05) return;
        [[b.x, w.pos + e], [b.x + b.w, w.pos - e]].forEach(c => {
          const dx = c[1] - c[0];
          if (Math.abs(dx) < S && (mx === null || Math.abs(dx) < Math.abs(mx))) mx = dx;
        });
      } else {
        if (Math.min(b.x + b.w, w.b) - Math.max(b.x, w.a) < .05) return;
        [[b.y, w.pos + e], [b.y + b.h, w.pos - e]].forEach(c => {
          const dy = c[1] - c[0];
          if (Math.abs(dy) < S && (my === null || Math.abs(dy) < Math.abs(my))) my = dy;
        });
      }
    });
    if (mx !== null) m.cx += mx;
    if (my !== null) m.cy += my;
    m.cx = Math.round(m.cx * 1000) / 1000; m.cy = Math.round(m.cy * 1000) / 1000;
    return m;
  }

  /* Tourne le meuble dos au mur le plus proche du point où on le pose. */
  function orienter(pn, m, portee) {
    portee = portee || 1.3;
    let best = null;
    murs(pn).forEach(w => {
      const le = w.axe === 'v' ? m.cy : m.cx, tr = w.axe === 'v' ? m.cx : m.cy;
      if (le < w.a - .05 || le > w.b + .05) return;
      const dist = Math.abs(tr - w.pos) - w.ep / 2;
      if (dist < portee && (!best || dist < best.dist)) best = {w: w, dist: dist, avant: tr > w.pos};
    });
    if (!best) return m;
    const w = best.w, e = w.ep / 2;
    if (w.axe === 'h') {
      m.rot = best.avant ? 0 : 180;
      m.cy = best.avant ? w.pos + e + m.d / 2 : w.pos - e - m.d / 2;
    } else {
      m.rot = best.avant ? 270 : 90;
      m.cx = best.avant ? w.pos + e + m.d / 2 : w.pos - e - m.d / 2;
    }
    return m;
  }

  /* Les pièces qui ont reçu au moins un meuble : leurs symboles
     automatiques s'effacent, pour ne pas avoir deux lits. */
  function occupees(niv) {
    const out = {};
    (niv.meubles || []).forEach(m => {
      const k = niv.cases.find(c => m.cx >= c.x && m.cx <= c.x + c.w && m.cy >= c.y && m.cy <= c.y + c.h);
      if (k) out[k.id || (k.piece && k.piece.id)] = true;
    });
    return out;
  }

  /* ---------- Meubler d'un coup ----------
     Un jeu de base par pièce, dans son plus grand rectangle, chaque
     meuble dos à un mur. Ensuite tout se déplace à la main. */
  function suggerer(pn, pieces, idNeuf, sauf) {
    const out = [];
    const typeDe = id => { const p = pieces.find(q => q.id === id); return p ? p.type : null; };
    const grands = {};
    pn.cases.forEach(k => { if (!grands[k.id] || k.w * k.h > grands[k.id].w * grands[k.id].h) grands[k.id] = k; });
    const chevauche = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > .02 &&
                                Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > .02;
    Object.keys(grands).forEach(id => {
      if (sauf && sauf[id]) return;
      const c = grands[id], t = typeDe(id);
      const ici = [];
      const horiz = c.w >= c.h;
      /* Pose `genre` dos au mur `cote` (n, s, o, e), centré en `u` le long du mur. */
      const contre = (genre, cote, u, w, d) => {
        const def = CATALOGUE[genre];
        const m = {id: idNeuf(), genre: genre, w: w || def.w, d: d || def.d, rot: 0, cx: 0, cy: 0};
        if (cote === 'n') { m.rot = 0; m.cx = u; m.cy = c.y + m.d / 2; }
        if (cote === 's') { m.rot = 180; m.cx = u; m.cy = c.y + c.h - m.d / 2; }
        if (cote === 'o') { m.rot = 270; m.cx = c.x + m.d / 2; m.cy = u; }
        if (cote === 'e') { m.rot = 90; m.cx = c.x + c.w - m.d / 2; m.cy = u; }
        return poser(m);
      };
      const libre = (genre, cx, cy, rot, w, d) => {
        const def = CATALOGUE[genre];
        return poser({id: idNeuf(), genre: genre, w: w || def.w, d: d || def.d, rot: rot || 0, cx: cx, cy: cy});
      };
      const poser = m => {
        const b = emprise(m);
        if (b.x < c.x - .01 || b.y < c.y - .01 || b.x + b.w > c.x + c.w + .01 || b.y + b.h > c.y + c.h + .01) return null;
        if (ici.some(o => chevauche(emprise(o), b))) return null;
        plaquer(pn, m, .2);
        ici.push(m);
        return m;
      };
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      if (t === 'chambre' || t === 'parentale' || t === 'suite') {
        const large = t !== 'chambre' || Math.min(c.w, c.h) >= 2.7;
        const g = large ? 'lit_double' : 'lit_simple';
        const lw = t === 'chambre' && large ? 1.4 : CATALOGUE[g].w;
        const cote = horiz ? 'o' : 'n', u = horiz ? cy : cx;
        const l = contre(g, cote, u, lw);
        if (l) {
          const ecart = lw / 2 + .3;
          contre('chevet', cote, u - ecart); contre('chevet', cote, u + ecart);
          /* L'armoire, sur le mur d'en face s'il reste la place. */
          if ((horiz ? c.w : c.h) >= 2.0 + .6 + .8) contre('armoire', horiz ? 'e' : 's', u);
        }
      } else if (t === 'cuisine') {
        const cote = horiz ? 'n' : 'o';
        const Lg = (horiz ? c.w : c.h) - .04, x0 = (horiz ? c.x : c.y) + .02;
        let seq = [['frigo', .6], ['evier', .9], ['lave_vaisselle', .6], ['plaque', .6]];
        let reste = Lg - seq.reduce((s, q) => s + q[1], 0);
        if (reste < 0) { seq = seq.filter(q => q[0] !== 'lave_vaisselle'); reste += .6; }
        if (reste < 0) { seq = seq.filter(q => q[0] !== 'frigo'); reste += .6; }
        if (reste < 0) seq = [['plan', Lg]];
        const complet = [];
        if (seq.length === 4) complet.push(seq[0], ['plan', reste * .3], seq[1], seq[2], ['plan', reste * .35], seq[3], ['plan', reste * .35]);
        else if (seq.length === 3) complet.push(seq[0], ['plan', reste * .4], seq[1], ['plan', reste * .3], seq[2], ['plan', reste * .3]);
        else complet.push.apply(complet, seq);
        let pos = x0;
        complet.forEach(q => {
          if (q[1] >= .3) contre(q[0], cote, pos + q[1] / 2, q[0] === 'plan' ? q[1] : undefined);
          pos += q[1];
        });
        /* Un îlot si la cuisine est profonde. */
        if ((horiz ? c.h : c.w) >= 3.4 && (horiz ? c.w : c.h) >= 2.6) {
          libre('ilot', horiz ? cx : c.x + 2.1, horiz ? c.y + 2.1 : cy, horiz ? 0 : 90);
        }
      } else if (t === 'sejour') {
        /* Salon d'un côté ; coin repas de l'autre si la pièce est grande. */
        const repas = c.w * c.h > 26 && Math.max(c.w, c.h) > 5.5;
        const Lz = repas ? (horiz ? c.w : c.h) * .56 : (horiz ? c.w : c.h);
        const u = (horiz ? c.x : c.y) + Lz / 2;
        const tv = horiz ? contre('meuble_tv', 'n', u) : contre('meuble_tv', 'o', u);
        if (tv) {
          const recul = Math.min(3.0, (horiz ? c.h : c.w) - .5);
          if (horiz) { libre('canape', u, c.y + recul, 180); libre('table_basse', u, c.y + recul - 1.1); }
          else { libre('canape', c.x + recul, u, 90); libre('table_basse', c.x + recul - 1.1, u, 90); }
        }
        if (repas) {
          const u2 = (horiz ? c.x + c.w : c.y + c.h) - ((horiz ? c.w : c.h) - Lz) / 2;
          libre('table', horiz ? u2 : cx, horiz ? cy : u2, horiz ? 90 : 0);
        }
      } else if (t === 'salle_manger') {
        libre('table', cx, cy, horiz ? 0 : 90);
      } else if (t === 'sdb' || t === 'salle_eau') {
        const cote = horiz ? 'n' : 'o';
        const Lg = horiz ? c.w : c.h, x0 = horiz ? c.x : c.y;
        const g1 = t === 'sdb' ? 'baignoire' : 'douche';
        const l1 = CATALOGUE[g1].w;
        contre(g1, cote, x0 + l1 / 2 + .02);
        const reste = Lg - l1 - .1;
        if (reste >= 1.5) contre('double_vasque', cote, x0 + Lg - .75 - .02);
        else if (reste >= .65) contre('lavabo', cote, x0 + Lg - .32);
        else contre('lavabo', horiz ? 's' : 'e', x0 + Lg - .35);
      } else if (t === 'wc') {
        if (c.w <= c.h) contre('wc', 'n', cx); else contre('wc', 'o', cy);
      } else if (t === 'bureau') {
        const b = horiz ? contre('bureau', 'n', cx) : contre('bureau', 'o', cy);
        if (b) libre('chaise', horiz ? cx : c.x + 1.0, horiz ? c.y + 1.0 : cy, horiz ? 180 : 90);
      } else if (t === 'dressing') {
        const cote = horiz ? 'n' : 'o', Lg = (horiz ? c.w : c.h) - .1;
        contre('dressing', cote, horiz ? cx : cy, Lg);
        if ((horiz ? c.h : c.w) >= 2.0) contre('dressing', horiz ? 's' : 'e', horiz ? cx : cy, Lg);
      } else if (t === 'buanderie' || t === 'cellier') {
        const cote = horiz ? 'n' : 'o', x0 = (horiz ? c.x : c.y) + .02;
        if (t === 'buanderie') {
          contre('lave_linge', cote, x0 + .3); contre('seche_linge', cote, x0 + .9); contre('bac_laver', cote, x0 + 1.5);
        } else contre('etageres', cote, horiz ? cx : cy, Math.min(2.4, (horiz ? c.w : c.h) - .1));
      }
      out.push.apply(out, ici);
    });
    return out;
  }

  return {
    CATS: CATS, CATALOGUE: CATALOGUE, FORMES_PISCINE: FORMES_PISCINE, POSES_PISCINE: POSES_PISCINE,
    cheminPiscine: cheminPiscine, emprise: emprise, versLocal: versLocal, versPlan: versPlan,
    dessiner: dessiner, icone: icone, plaquer: plaquer, orienter: orienter, occupees: occupees, suggerer: suggerer
  };
})();
