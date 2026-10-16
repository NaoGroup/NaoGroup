/* ============================================================
   NaoPlan — le dessin et l'interface
   ------------------------------------------------------------
   Le moteur (naoplan-moteur.js) rend des rectangles en mètres.
   Ici on les met au propre : murs, portes, fenêtres, mobilier,
   cotes, puis on branche les réglages, le glisser-déposer et
   l'impression.
   ============================================================ */
(function () {
  'use strict';

  const el = id => document.getElementById(id);
  const CLE = 'naoplan.projet.v1';
  const CLE_THEME = 'naoplan.theme';

  let etat = {
    criteres: NP.defauts(),
    pieces: null,      // null = le programme est à reconstruire
    ouv: {},           // retouches d'ouvertures, par nom stable
    res: null,
    iv: 0,             // variante affichée
    iniv: 0,           // niveau affiché
    vue: '2d',         // 2d = le plan, 3d = la maquette
    sel: null,         // pièce sélectionnée
    selOuv: null,      // ouverture sélectionnée
    selAnnexe: null,   // annexe sélectionnée (garage, terrasse…)
    selMur: null,      // mur sélectionné, réglable au millimètre
    selMeuble: null,   // meuble sélectionné (mode Aménager)
    cat: 'chambre',    // rayon ouvert du catalogue de meubles
    arme: null,        // meuble choisi dans le catalogue, prêt à poser
    m2: false,         // les surfaces s'affichent-elles sur le plan ?
    perso: null,       // « Mon plan » : le plan figé qu'on retouche à la main
    fonds: {},         // une image à calquer, par niveau
    outil: 'main'
  };

  /* ---------- Le plan affiché ----------
     etat.iv vaut -1 pour « Mon plan », sinon l'indice de la variante.
     Tout l'outil passe par ici : la liste, les surfaces, la 3D, la
     façade et le PDF ne savent pas s'ils montrent une proposition du
     moteur ou un plan retouché à la main. */
  let monteCache = null;
  function planCourant() {
    const r = etat.res;
    if (etat.iv === -1 && etat.perso) {
      if (!monteCache) monteCache = NP.monter(etat.perso, etat.criteres, etat.ouv);
      return monteCache;
    }
    if (etat.iv < 0) etat.iv = 0;
    return r.variantes[Math.min(etat.iv, r.variantes.length - 1)];
  }
  const perime = () => { monteCache = null; };
  const nbNiv = () => planCourant().niveaux.length;
  const enPerso = () => etat.iv === -1 && !!etat.perso;
  /* Redessiner après une retouche d'ouverture : « Mon plan » se remonte,
     une variante se recalcule (ses pièces ne bougent pas pour autant). */
  const rafraichir = (rapide) => enPerso() ? majPerso(rapide) : recalculer(rapide);

  /* Toute retouche passe par ici : si l'on regarde une proposition, on
     la fige d'abord en « Mon plan » — c'est lui qu'on modifie, et les
     variantes restent intactes. */
  function assurerPerso() {
    if (enPerso()) return etat.perso;
    const v = planCourant();
    etat.perso = NP.figer(v, etat.pieces);
    etat.iv = -1;
    perime();
    toast('Plan figé dans « Mon plan » : désormais, seule la pièce que vous touchez bouge.');
    return etat.perso;
  }
  const niveauPerso = () => etat.perso.niveaux[Math.min(etat.iniv, etat.perso.niveaux.length - 1)];
  const piecesAffichees = () => enPerso() ? etat.perso.pieces : etat.pieces;

  /* ---------- Petits utilitaires ---------- */
  const n2 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
  const n1 = v => Math.round(v * 1000) / 1000;          /* coordonnée SVG : point décimal */
  const nd = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',');  /* affichage */
  const m2 = v => n2(v) + ' m²';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const aire = c => c.w * c.h;
  /* Les rectangles d'un niveau, regroupés par pièce : une pièce en L en
     compte deux. On garde le plus grand pour y poser nom et meubles. */
  function parPiece(niv) {
    const m = new Map();
    niv.cases.forEach(cs => {
      const id = cs.piece.id;
      if (!m.has(id)) m.set(id, {piece: cs.piece, cases: [], aire: 0, grand: cs});
      const g = m.get(id);
      g.cases.push(cs); g.aire += aire(cs);
      if (aire(cs) > aire(g.grand)) g.grand = cs;
    });
    return Array.from(m.values());
  }

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('on'), 3200);
  }

  /* ============================================================
     LES COULEURS
     À l'écran elles suivent le thème ; sur le papier elles sont
     figées en clair, sinon un plan imprimé depuis le thème sombre
     sortirait noir.
     ============================================================ */
  const ECRAN = {
    jour: 'var(--p-jour)', jourL: 'var(--p-jour-l)',
    nuit: 'var(--p-nuit)', nuitL: 'var(--p-nuit-l)',
    eau: 'var(--p-eau)', eauL: 'var(--p-eau-l)',
    serv: 'var(--p-serv)', servL: 'var(--p-serv-l)',
    circ: 'var(--p-circ)', circL: 'var(--p-circ-l)',
    ext: 'var(--p-ext)', extL: 'var(--p-ext-l)',
    terr: 'var(--p-terr)', terrL: 'var(--p-terr-l)',
    mur: 'var(--mur)', murFin: 'var(--mur-fin)', sol: 'var(--sol)',
    ink: 'var(--ink)', ink3: 'var(--ink-3)', cote: 'var(--cote)', accent: 'var(--accent)'
  };
  const PAPIER = {
    jour: '#EFE8FD', jourL: '#C7B4F0', nuit: '#E6E8FB', nuitL: '#AEB6EE',
    eau: '#DFF2F0', eauL: '#93CFC8', serv: '#F0EDF6', servL: '#BDB3D4',
    circ: '#F7F3FD', circL: '#CFC3EB', ext: '#E9F3E8', extL: '#9BC79A',
    terr: '#F4EDE0', terrL: '#CDB98E',
    mur: '#241F33', murFin: '#6C6192', sol: '#FFFFFF',
    ink: '#241F33', ink3: '#8B82A6', cote: '#8F86AB', accent: '#5B45A8'
  };
  const ZONE_COUL = {jour: 'jour', nuit: 'nuit', eau: 'eau', serv: 'serv', circ: 'circ'};
  /* Tous les types qu'on peut donner à une pièce, dans la liste. */
  const TYPES_PIECES = Object.keys(NP.CAT);

  /* La maquette 3D a besoin de vraies valeurs hexadécimales (elle
     éclaircit et assombrit chaque face) : à l'écran on va donc lire
     les variables du thème telles que le navigateur les calcule. */
  function couleurs3d(mode) {
    if (mode === 'papier') {
      return {ext: PAPIER.ext, terr: PAPIER.terr, serv: PAPIER.serv,
              murExt: '#BDB3D4', murInt: '#E3DCF2', vitre: '#93CFC8', meuble: '#D8CCF0',
              trait: '#6C6192', ink: '#241F33'};
    }
    const cs = getComputedStyle(document.documentElement);
    const v = n => (cs.getPropertyValue('--' + n) || '').trim() || '#888888';
    return {ext: v('p-ext'), terr: v('p-terr'), serv: v('p-serv'),
            murExt: v('p-serv-l'), murInt: v('surface-2'), vitre: v('p-eau-l'),
            meuble: v('border-2'), trait: v('mur-fin'), ink: v('ink')};
  }

  /* ============================================================
     LE MOBILIER
     Des symboles, pas des meubles : ils disent l'usage et
     l'encombrement. Chacun s'efface si la pièce est trop petite.
     ============================================================ */
  function rect(x, y, w, h, r, cls) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      (r ? '" rx="' + r : '') + '" class="' + (cls || 'mob') + '"/>';
  }
  function ligne(x1, y1, x2, y2) {
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="mob"/>';
  }
  function cercle(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="mob"/>';
  }

  function mobLit(c, L, lg) {
    const horiz = c.w >= c.h;
    const m = .3;
    let x, y, w, h;
    if (horiz) { w = L; h = lg; x = c.x + m; y = c.y + (c.h - h) / 2; }
    else { w = lg; h = L; x = c.x + (c.w - w) / 2; y = c.y + m; }
    if (w > c.w - .5 || h > c.h - .5) return '';
    let s = rect(x, y, w, h, .08) + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="mob-plein"/>';
    /* L'oreiller, côté tête */
    s += horiz ? ligne(x + .32, y + .1, x + .32, y + h - .1)
               : ligne(x + .1, y + .32, x + w - .1, y + .32);
    /* Les tables de chevet */
    if (horiz && c.h - h > .9) {
      s += rect(x, y - .55, .45, .45, .05) + rect(x, y + h + .1, .45, .45, .05);
    } else if (!horiz && c.w - w > .9) {
      s += rect(x - .55, y, .45, .45, .05) + rect(x + w + .1, y, .45, .45, .05);
    }
    return s;
  }

  function mobCuisine(c) {
    if (Math.min(c.w, c.h) < 1.6) return '';
    const p = .6;
    let s = '';
    if (c.w >= c.h) {
      s += rect(c.x + .1, c.y + .1, c.w - .2, p, .04);
      s += cercle(c.x + .55, c.y + .1 + p / 2, .13) + cercle(c.x + .95, c.y + .1 + p / 2, .13);
      s += rect(c.x + c.w - .75, c.y + .1, .65, p, .04);            // évier
      if (c.h > 2.6) s += rect(c.x + .1, c.y + c.h - .1 - p, Math.min(2.2, c.w - .4), p, .04);
    } else {
      s += rect(c.x + .1, c.y + .1, p, c.h - .2, .04);
      s += cercle(c.x + .1 + p / 2, c.y + .55, .13) + cercle(c.x + .1 + p / 2, c.y + .95, .13);
      s += rect(c.x + .1, c.y + c.h - .75, p, .65, .04);
      if (c.w > 2.6) s += rect(c.x + c.w - .1 - p, c.y + .1, p, Math.min(2.2, c.h - .4), .04);
    }
    return s;
  }

  function mobSejour(c) {
    if (Math.min(c.w, c.h) < 2.4) return '';
    const horiz = c.w >= c.h;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    let s = '';
    if (horiz) {
      s += rect(cx - 1.05, cy - .9, 2.1, .85, .12) + ligne(cx - 1.05, cy - .68, cx + 1.05, cy - .68);
      s += rect(cx - .55, cy + .15, 1.1, .6, .08);                  // table basse
      s += ligne(cx - .7, cy + 1.25, cx + .7, cy + 1.25);           // meuble TV
    } else {
      s += rect(cx - .9, cy - 1.05, .85, 2.1, .12) + ligne(cx - .68, cy - 1.05, cx - .68, cy + 1.05);
      s += rect(cx + .15, cy - .55, .6, 1.1, .08);
      s += ligne(cx + 1.25, cy - .7, cx + 1.25, cy + .7);
    }
    return s;
  }

  function mobTable(c) {
    if (Math.min(c.w, c.h) < 2.2) return '';
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    const w = c.w >= c.h ? 1.6 : .9, h = c.w >= c.h ? .9 : 1.6;
    let s = rect(cx - w / 2, cy - h / 2, w, h, .06);
    const d = .34;
    s += cercle(cx - w / 2 - d, cy - .25, .2) + cercle(cx - w / 2 - d, cy + .25, .2);
    s += cercle(cx + w / 2 + d, cy - .25, .2) + cercle(cx + w / 2 + d, cy + .25, .2);
    return s;
  }

  function mobBain(c, avecBaignoire) {
    if (Math.min(c.w, c.h) < 1.3) return '';
    const horiz = c.w >= c.h;
    let s = '';
    if (avecBaignoire && Math.max(c.w, c.h) > 2.2) {
      s += horiz ? rect(c.x + .08, c.y + .08, 1.7, Math.min(.72, c.h - .16), .09)
                 : rect(c.x + .08, c.y + .08, Math.min(.72, c.w - .16), 1.7, .09);
    } else {
      const t = Math.min(.9, Math.min(c.w, c.h) - .2);
      s += rect(c.x + .08, c.y + .08, t, t, .05) +
        '<path d="M' + (c.x + .08) + ' ' + (c.y + .08) + 'L' + (c.x + .08 + t) + ' ' + (c.y + .08 + t) +
        'M' + (c.x + .08 + t) + ' ' + (c.y + .08) + 'L' + (c.x + .08) + ' ' + (c.y + .08 + t) + '" class="mob"/>';
    }
    /* La vasque */
    if (horiz && c.w > 2.3) s += rect(c.x + c.w - .68, c.y + .12, .55, .42, .06);
    else if (!horiz && c.h > 2.3) s += rect(c.x + .12, c.y + c.h - .68, .42, .55, .06);
    return s;
  }

  function mobWC(c) {
    if (Math.min(c.w, c.h) < .75) return '';
    const cx = c.x + c.w / 2;
    const horiz = c.w >= c.h;
    if (horiz) return rect(c.x + .12, c.y + c.h / 2 - .19, .58, .38, .16) + ligne(c.x + .12, c.y + c.h / 2 - .22, c.x + .12, c.y + c.h / 2 + .22);
    return rect(cx - .19, c.y + .12, .38, .58, .16) + ligne(cx - .22, c.y + .12, cx + .22, c.y + .12);
  }

  /* L'escalier se dessine selon sa forme : droit, quart tournant,
     demi-tournant ou colimaçon. */
  function mobEscalier(c) {
    const forme = c.piece.forme || 'droit';
    if (forme === 'colimacon') {
      /* Le colimaçon : un cercle, un fût au centre, des marches en
         éventail et la flèche qui tourne. */
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2, R = Math.max(.3, Math.min(c.w, c.h) / 2 - .08);
      let s = cercle(cx, cy, R) + cercle(cx, cy, Math.min(.12, R * .2));
      const n = 12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        s += ligne(cx + Math.cos(a) * R * .2, cy + Math.sin(a) * R * .2, cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      }
      const r2 = R * .62;
      return s + '<path d="M' + (cx + r2) + ' ' + cy + 'A' + r2 + ' ' + r2 + ' 0 1 1 ' + cx + ' ' + (cy - r2) +
        '" class="mob" marker-end="url(#fl)"/>';
    }
    if (forme === 'demi') {
      /* Demi-tournant : deux volées côte à côte, reliées par un palier. */
      const horiz2 = c.w >= c.h;
      const L = horiz2 ? c.w : c.h, P = horiz2 ? c.h : c.w;
      const pal = Math.min(L * .3, P * .55);
      const n = Math.max(3, Math.min(9, Math.round((L - pal) / .27)));
      let s = rect(c.x + .06, c.y + .06, c.w - .12, c.h - .12, .03);
      s += horiz2 ? ligne(c.x + .06, c.y + c.h / 2, c.x + c.w - pal, c.y + c.h / 2)
                  : ligne(c.x + c.w / 2, c.y + pal, c.x + c.w / 2, c.y + c.h - .06);
      for (let i = 1; i < n; i++) {
        const t = (L - pal) * i / n;
        s += horiz2 ? ligne(c.x + t, c.y + .06, c.x + t, c.y + c.h - .06)
                    : ligne(c.x + .06, c.y + c.h - t, c.x + c.w - .06, c.y + c.h - t);
      }
      s += horiz2 ? ligne(c.x + c.w - pal, c.y + .06, c.x + c.w - pal, c.y + c.h - .06)
                  : ligne(c.x + .06, c.y + pal, c.x + c.w - .06, c.y + pal);
      const a = horiz2
        ? 'M' + (c.x + .3) + ' ' + (c.y + c.h * .75) + 'H' + (c.x + c.w - pal * .5) + 'V' + (c.y + c.h * .25) + 'H' + (c.x + .3)
        : 'M' + (c.x + c.w * .25) + ' ' + (c.y + c.h - .3) + 'V' + (c.y + pal * .5) + 'H' + (c.x + c.w * .75) + 'V' + (c.y + c.h - .3);
      return s + '<path d="' + a + '" class="mob" fill="none" marker-end="url(#fl)"/>';
    }
    if (forme === 'quart') {
      /* Quart tournant : une volée droite, puis des marches en éventail
         dans le dernier carré. */
      const horiz2 = c.w >= c.h;
      const P = horiz2 ? c.h : c.w, L = horiz2 ? c.w : c.h;
      const carre = Math.min(P, L * .45);
      const n = Math.max(3, Math.min(10, Math.round((L - carre) / .27)));
      let s = rect(c.x + .06, c.y + .06, c.w - .12, c.h - .12, .03);
      for (let i = 1; i <= n; i++) {
        const t = (L - carre) * i / n;
        s += horiz2 ? ligne(c.x + t, c.y + .06, c.x + t, c.y + c.h - .06)
                    : ligne(c.x + .06, c.y + c.h - t, c.x + c.w - .06, c.y + c.h - t);
      }
      /* L'éventail, depuis le coin intérieur du carré. */
      const ox = horiz2 ? c.x + c.w - carre : c.x, oy = horiz2 ? c.y + c.h : c.y + carre;
      for (let i = 1; i < 4; i++) {
        const a = (i / 4) * Math.PI / 2;
        s += horiz2 ? ligne(ox, oy, ox + Math.sin(a) * carre * 1.3, oy - Math.cos(a) * carre * 1.3)
                    : ligne(ox, oy, ox + Math.sin(a) * carre * 1.3, oy - Math.cos(a) * carre * 1.3);
      }
      const a = horiz2
        ? 'M' + (c.x + .3) + ' ' + (c.y + c.h / 2) + 'H' + (c.x + c.w - carre / 2) + 'V' + (c.y + .3)
        : 'M' + (c.x + c.w / 2) + ' ' + (c.y + c.h - .3) + 'V' + (c.y + carre / 2) + 'H' + (c.x + c.w - .3);
      return s + '<path d="' + a + '" class="mob" fill="none" marker-end="url(#fl)"/>';
    }
    const horiz = c.w >= c.h;
    const L = horiz ? c.w : c.h;
    const n = Math.max(3, Math.min(14, Math.round(L / .27)));
    let s = rect(c.x + .06, c.y + .06, c.w - .12, c.h - .12, .03);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      s += horiz ? ligne(c.x + .06 + (c.w - .12) * t, c.y + .06, c.x + .06 + (c.w - .12) * t, c.y + c.h - .06)
                 : ligne(c.x + .06, c.y + .06 + (c.h - .12) * t, c.x + c.w - .06, c.y + .06 + (c.h - .12) * t);
    }
    /* La flèche de montée */
    const a = horiz ? 'M' + (c.x + .3) + ' ' + (c.y + c.h / 2) + 'L' + (c.x + c.w - .3) + ' ' + (c.y + c.h / 2)
                    : 'M' + (c.x + c.w / 2) + ' ' + (c.y + c.h - .3) + 'L' + (c.x + c.w / 2) + ' ' + (c.y + .3);
    return s + '<path d="' + a + '" class="mob" marker-end="url(#fl)"/>';
  }

  function mobBureau(c) {
    if (Math.min(c.w, c.h) < 1.6) return '';
    const horiz = c.w >= c.h;
    if (horiz) return rect(c.x + .15, c.y + .15, Math.min(1.5, c.w - .3), .62, .04) + cercle(c.x + .15 + Math.min(1.5, c.w - .3) / 2, c.y + 1.15, .25);
    return rect(c.x + .15, c.y + .15, .62, Math.min(1.5, c.h - .3), .04) + cercle(c.x + 1.15, c.y + .15 + Math.min(1.5, c.h - .3) / 2, .25);
  }

  function mobRangement(c) {
    if (Math.min(c.w, c.h) < .8) return '';
    const horiz = c.w >= c.h;
    const p = Math.min(.6, Math.min(c.w, c.h) * .45);
    let s = horiz ? rect(c.x + .06, c.y + .06, c.w - .12, p, .03)
                  : rect(c.x + .06, c.y + .06, p, c.h - .12, .03);
    if (horiz && c.h > 1.5) s += rect(c.x + .06, c.y + c.h - .06 - p, c.w - .12, p, .03);
    else if (!horiz && c.w > 1.5) s += rect(c.x + c.w - .06 - p, c.y + .06, p, c.h - .12, .03);
    return s;
  }

  function mobVoiture(c) {
    const horiz = c.w >= c.h;
    const L = 4.3, lg = 1.75;
    const w = horiz ? L : lg, h = horiz ? lg : L;
    if (w > c.w - .5 || h > c.h - .5) return '';
    const x = c.x + (c.w - w) / 2, y = c.y + (c.h - h) / 2;
    let s = rect(x, y, w, h, .35);
    s += horiz ? ligne(x + 1.2, y + .1, x + 1.2, y + h - .1) + ligne(x + 2.1, y + .1, x + 2.1, y + h - .1)
               : ligne(x + .1, y + 1.2, x + w - .1, y + 1.2) + ligne(x + .1, y + 2.1, x + w - .1, y + 2.1);
    return s;
  }

  /* Une piscine, selon sa forme et sa pose : creusée, elle a sa plage
     (la margelle) autour de l'eau ; hors-sol, c'est une cuve à paroi
     épaisse, avec son échelle. */
  function piscineSvg(e, C, sel) {
    const forme = e.forme || 'rect', pose = e.pose || 'creusee';
    const ch = NPM.cheminPiscine(e.x, e.y, e.w, e.h, forme);
    const trait = sel ? C.accent : null;
    if (pose === 'horssol') {
      const ex = forme === 'ronde' ? e.x + e.w / 2 : e.x + e.w * .5, ey = e.y + e.h;
      return '<path class="fond-annexe" d="' + ch + '" fill="' + C.eau + '" stroke="' + (trait || C.servL) + '" stroke-width="' + (sel ? .2 : .16) + '"/>' +
        '<path d="' + NPM.cheminPiscine(e.x + .25, e.y + .25, e.w - .5, e.h - .5, forme) + '" fill="none" stroke="' + C.eauL + '" stroke-width=".04" stroke-dasharray=".2 .15"/>' +
        '<path d="M' + n1(ex - .25) + ' ' + n1(ey - .1) + 'v.5M' + n1(ex + .25) + ' ' + n1(ey - .1) + 'v.5M' + n1(ex - .25) + ' ' + n1(ey + .12) +
        'h.5M' + n1(ex - .25) + ' ' + n1(ey + .3) + 'h.5" stroke="' + C.servL + '" stroke-width=".05" fill="none"/>';
    }
    const plage = pose === 'semi' ? .18 : .4;
    return '<path class="fond-annexe" d="' + ch + '" fill="' + C.terr + '" stroke="' + (trait || C.terrL) + '" stroke-width="' + (sel ? .12 : .05) + '"/>' +
      '<path d="' + NPM.cheminPiscine(e.x + plage, e.y + plage, e.w - 2 * plage, e.h - 2 * plage, forme) + '" fill="' + C.eau +
      '" stroke="' + C.eauL + '" stroke-width=".06"/>';
  }

  function mobilier(c) {
    const t = c.piece.type;
    switch (t) {
      case 'chambre': return mobLit(c, 2.0, 1.4);
      case 'parentale': case 'suite': return mobLit(c, 2.05, 1.65);
      case 'cuisine': return mobCuisine(c);
      case 'sejour': return mobSejour(c) + (c.piece.ouverte ? '' : '') + (aire(c) > 26 ? mobTable(c) : '');
      case 'salle_manger': return mobTable(c);
      case 'sdb': return mobBain(c, true);
      case 'salle_eau': return mobBain(c, false);
      case 'wc': return mobWC(c);
      case 'escalier': return mobEscalier(c);
      case 'bureau': return mobBureau(c);
      case 'dressing': case 'cellier': case 'buanderie': return mobRangement(c);
      default: return '';
    }
  }

  /* ============================================================
     LE DESSIN D'UN NIVEAU
     ============================================================ */
  const EP_EXT = .3, EP_INT = .09;

  function dessin(niv, mode, opts) {
    opts = opts || {};
    const C = mode === 'papier' ? PAPIER : ECRAN;
    const c = etat.criteres;
    const W = niv.W, H = niv.H;
    const ext = niv.ext || [];

    /* --- l'étendue à cadrer --- */
    let x0 = 0, y0 = 0, x1 = W, y1 = H;
    ext.forEach(e => {
      x0 = Math.min(x0, e.x); y0 = Math.min(y0, e.y);
      x1 = Math.max(x1, e.x + e.w); y1 = Math.max(y1, e.y + e.h);
    });
    const mg = {g: 1.9, d: .9, h: 1.0, b: 2.4};
    const vx = x0 - mg.g, vy = y0 - mg.h;
    const vw = (x1 - x0) + mg.g + mg.d, vh = (y1 - y0) + mg.h + mg.b;
    const fs = Math.max(.16, vw / 74);          // corps du texte, en mètres
    const uid = 'n' + niv.niveau + (mode === 'papier' ? 'p' : 'e') + (opts.uid || '');

    let s = '<svg viewBox="' + n1(vx) + ' ' + n1(vy) + ' ' + n1(vw) + ' ' + n1(vh) +
      '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"' +
      (mode === 'papier' ? '' : ' data-niveau="' + niv.niveau + '"') + '>';

    /* --- le masque des ouvertures : il « perce » les murs --- */
    s += '<defs><marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">' +
      '<path d="M0 1L9 5L0 9" fill="none" stroke="' + C.murFin + '" stroke-width="1.6"/></marker>';
    s += '<mask id="mo' + uid + '"><rect x="' + n1(vx) + '" y="' + n1(vy) + '" width="' + n1(vw) +
      '" height="' + n1(vh) + '" fill="#fff"/>';
    (niv.portes || []).concat(niv.fenetres || []).forEach(o => {
      const t = EP_EXT + .1;
      s += o.axe === 'h'
        ? '<rect x="' + n1(o.c - o.l / 2) + '" y="' + n1(o.pos - t / 2) + '" width="' + n1(o.l) + '" height="' + n1(t) + '" fill="#000"/>'
        : '<rect x="' + n1(o.pos - t / 2) + '" y="' + n1(o.c - o.l / 2) + '" width="' + n1(t) + '" height="' + n1(o.l) + '" fill="#000"/>';
    });
    s += '</mask></defs>';

    /* --- les extérieurs --- */
    /* Les couleurs d'une annexe disent ce qu'elle est : bâti, sol, eau. */
    const bati = g => g === 'garage' || g === 'abri' || g === 'carport';
    const coulExt = g => g === 'jardin' ? [C.ext, C.extL] : bati(g) ? [C.serv, C.servL]
      : g === 'piscine' ? [C.eau, C.eauL] : [C.terr, C.terrL];
    ext.forEach(e => {
      const k = coulExt(e.genre);
      const sel = e.annexe && etat.selAnnexe === e.id && mode !== 'papier';
      const corps = e.genre === 'piscine' ? piscineSvg(e, C, sel) : '<rect class="fond-annexe" x="' + n1(e.x) + '" y="' + n1(e.y) + '" width="' + n1(e.w) + '" height="' + n1(e.h) +
        '" rx="' + (e.genre === 'jardin' ? .35 : .12) + '" fill="' + k[0] + '" stroke="' + (sel ? C.accent : k[1]) +
        '" stroke-width="' + (sel ? .12 : bati(e.genre) ? .12 : .06) + '"' +
        (e.genre === 'jardin' ? ' stroke-dasharray="0.5 0.3"' : e.genre === 'carport' ? ' stroke-dasharray="0.25 0.15"' : '') + '/>';
      s += e.annexe && mode !== 'papier'
        ? '<g class="annexe' + (sel ? ' sel' : '') + '" data-annexe="' + e.id + '">' + corps + '</g>'
        : corps;
    });
    /* Le jardin est dessous : on le légende dans un coin, pas au centre. */
    ext.forEach(e => {
      if (e.genre === 'jardin') {
        s += '<text x="' + n1(e.x + .45) + '" y="' + n1(e.y + fs * 1.5) + '" font-size="' + n1(fs * .92) +
          '" fill="' + C.extL + '" class="etq" font-weight="600">' + e.emoji + ' ' + esc(e.nom) + ' · ' +
          Math.round(e.aire) + ' m²' + (e.reduit ? ' (représenté réduit)' : '') + '</text>';
      } else {
        s += etiquette(e.x, e.y, e.w, e.h, e.nom, etat.m2 ? e.aire : null, etat.m2 && e.annexe ? nd(e.w) + ' × ' + nd(e.h) + ' m' : null,
          fs, C, bati(e.genre) ? C.ink : coulExt(e.genre)[1]);
        if ((e.genre === 'garage' || e.genre === 'carport') && c.mobilier) s += mobVoiture(e);
        if (e.genre === 'garage') s += porteAnnexe(e, W, H, C);
      }
    });

    /* --- le sol du logement --- */
    s += '<rect x="0" y="0" width="' + n1(W) + '" height="' + n1(H) + '" fill="' + C.sol + '"/>';

    /* --- les pièces --- */
    niv.cases.forEach(cs => {
      const z = ZONE_COUL[NP.CAT[cs.piece.type].zone] || 'serv';
      const sel = etat.sel === cs.piece.id && mode !== 'papier';
      s += '<g class="piece' + (sel ? ' sel' : '') + '" data-id="' + cs.piece.id + '">';
      s += '<rect class="fond-piece" x="' + n1(cs.x) + '" y="' + n1(cs.y) + '" width="' + n1(cs.w) +
        '" height="' + n1(cs.h) + '" fill="' + C[z] + '" stroke="' + (sel ? C.accent : C[z + 'L']) +
        '" stroke-width="' + (sel ? .09 : .02) + '"/>';
      s += '</g>';
    });

    /* --- le mobilier --- */
    if (c.mobilier) {
      s += '<g stroke="' + C.murFin + '" fill="none">';
      /* Un seul jeu de meubles par pièce, dans son plus grand morceau —
         sauf dans les pièces qu'on a meublées soi-même. */
      const occ = NPM.occupees(niv);
      parPiece(niv).forEach(g => { if (!occ[g.piece.id] || g.piece.type === 'escalier') s += mobilier(g.grand); });
      s += '</g>';
    }

    /* --- le calque d'image ---
       Un plan existant (photo, scan, capture d'annonce) posé en
       transparence sous les murs : on redessine par-dessus, en tirant
       les cloisons jusqu'à ce qu'elles tombent sur celles de l'image.
       Jamais imprimé : c'est un gabarit, pas le plan. */
    const fond = mode !== 'papier' && etat.fonds[niv.niveau];
    if (fond && fond.src && !fond.cache) {
      s += '<image href="' + fond.src + '" x="' + n1(fond.dx || 0) + '" y="' + n1(fond.dy || 0) +
        '" width="' + n1(fond.largeur) + '" height="' + n1(fond.largeur * fond.ratio) +
        '" opacity="' + (fond.opacite || .5) + '" preserveAspectRatio="none"/>';
    }

    /* --- les murs, percés par le masque --- */
    /* Seuls les vrais murs sont tracés : entre deux morceaux d'une même
       pièce (une pièce en L), il n'y a rien. Les murs de façade sont
       épais, les cloisons fines. */
    s += '<g mask="url(#mo' + uid + ')" fill="none" stroke-linecap="square">';
    const facade = m => (m.axe === 'v' && (Math.abs(m.pos) < .04 || Math.abs(m.pos - W) < .04)) ||
                        (m.axe === 'h' && (Math.abs(m.pos) < .04 || Math.abs(m.pos - H) < .04));
    const vus = {};
    NP.mursReels(niv).forEach(m => {
      const cle = m.axe + n1(m.pos) + ':' + n1(m.a) + ':' + n1(m.b);
      if (vus[cle]) return;
      vus[cle] = 1;
      const ep = facade(m) ? EP_EXT : EP_INT;
      s += m.axe === 'h'
        ? '<path d="M' + n1(m.a) + ' ' + n1(m.pos) + 'H' + n1(m.b) + '" stroke="' + C.mur + '" stroke-width="' + ep + '"/>'
        : '<path d="M' + n1(m.pos) + ' ' + n1(m.a) + 'V' + n1(m.b) + '" stroke="' + C.mur + '" stroke-width="' + ep + '"/>';
    });
    s += '</g>';

    /* --- les meubles posés à la main ---
       Au-dessus des murs pour qu'on les attrape même plaqués contre une
       cloison ; sous les poignées de mur et les ouvertures. */
    if ((niv.meubles || []).length) {
      s += '<g class="meubles" stroke="' + C.murFin + '" fill="none">';
      niv.meubles.forEach(m => {
        s += NPM.dessiner(m, {interactif: mode !== 'papier', sel: mode !== 'papier' && etat.selMeuble === m.id});
      });
      s += '</g>';
    }

    /* --- les poignées de mur ---
       Chaque tronçon de mur se saisit, comme le bord d'une fenêtre
       d'ordinateur : on tire, la cloison suit. Invisibles au repos,
       elles s'éclairent au survol. Dessinées sous les portes et les
       fenêtres, pour que celles-ci restent prioritaires. */
    if (mode !== 'papier') {
      const W0 = niv.W, H0 = niv.H;
      NP.tronconsMurs({cases: niv.cases, W: W0, H: H0}).forEach(t => {
        const ext = t.axe === 'v' ? (Math.abs(t.pos) < .04 || Math.abs(t.pos - W0) < .04)
                                  : (Math.abs(t.pos) < .04 || Math.abs(t.pos - H0) < .04);
        const e = ext ? .42 : .3;
        const r = t.axe === 'v'
          ? {x: t.pos - e / 2, y: t.a + .12, w: e, h: t.b - t.a - .24}
          : {x: t.a + .12, y: t.pos - e / 2, w: t.b - t.a - .24, h: e};
        if (r.w <= 0 || r.h <= 0) return;
        const m = etat.selMur;
        const choisi = m && mode === 'ecran' && !etat.sel && !etat.selOuv && !etat.selAnnexe && !etat.selMeuble && m.niv === niv.niveau && m.axe === t.axe &&
          Math.abs(m.pos - t.pos) < .004 && t.a < m.b - .01 && t.b > m.a + .01;
        s += '<rect class="poignee ' + (t.axe === 'v' ? 'pv' : 'ph') + (ext ? ' facade' : '') + (choisi ? ' sel' : '') +
          '" data-axe="' + t.axe + '" data-pos="' + n1(t.pos) + '" data-a="' + n1(t.a) + '" data-b="' + n1(t.b) +
          '" x="' + n1(r.x) + '" y="' + n1(r.y) + '" width="' + n1(r.w) + '" height="' + n1(r.h) + '" rx="0.06"/>';
      });
    }

    /* --- les fenêtres --- */
    (niv.fenetres || []).forEach(f => {
      const t = EP_EXT;
      let d = '';
      if (f.axe === 'h') {
        d += '<rect x="' + n1(f.c - f.l / 2) + '" y="' + n1(f.pos - t / 2) + '" width="' + n1(f.l) +
          '" height="' + n1(t) + '" fill="' + C.sol + '" stroke="' + C.mur + '" stroke-width="0.045"/>';
        d += '<path d="M' + n1(f.c - f.l / 2) + ' ' + n1(f.pos) + 'h' + n1(f.l) + '" stroke="' + C.murFin +
          '" stroke-width="' + (f.type === 'baie' ? .07 : .045) + '" fill="none"/>';
      } else {
        d += '<rect x="' + n1(f.pos - t / 2) + '" y="' + n1(f.c - f.l / 2) + '" width="' + n1(t) +
          '" height="' + n1(f.l) + '" fill="' + C.sol + '" stroke="' + C.mur + '" stroke-width="0.045"/>';
        d += '<path d="M' + n1(f.pos) + ' ' + n1(f.c - f.l / 2) + 'v' + n1(f.l) + '" stroke="' + C.murFin +
          '" stroke-width="' + (f.type === 'baie' ? .07 : .045) + '" fill="none"/>';
      }
      s += enveloppeOuverture(f, d, C, mode, .45);
    });

    /* --- les portes --- */
    (niv.portes || []).forEach(p => {
      /* Cuisine ouverte : le passage n'a pas de vantail, mais il reste
         saisissable pour être déplacé ou élargi. */
      s += enveloppeOuverture(p, (p.type === 'passage' || p.type === 'vide') ? '' : p.type === 'garage' ? dessinGarage(p, C) : dessinPorte(p, C), C, mode,
        p.type === 'passage' ? .3 : p.type === 'garage' ? .6 : p.l);
    });

    /* --- le calque de l'autre niveau ---
       Les murs du niveau voisin, en pointillé : c'est ce qui permet
       de voir si les deux étages coïncident — refends alignés,
       escalier au même endroit, fenêtres superposées. */
    if (opts.calque) {
      s += '<g fill="none" stroke="' + C.cote + '" stroke-width="0.06" stroke-dasharray="0.3 0.22" opacity=".6">';
      opts.calque.cases.forEach(cs => {
        s += '<rect x="' + n1(cs.x) + '" y="' + n1(cs.y) + '" width="' + n1(cs.w) + '" height="' + n1(cs.h) + '"/>';
      });
      s += '</g>';
    }

    /* --- les étiquettes --- */
    /* Une étiquette par pièce — même faite de plusieurs rectangles —,
       posée dans son plus grand morceau, avec sa surface totale. */
    parPiece(niv).forEach(g => {
      const cs = g.grand;
      const z = ZONE_COUL[NP.CAT[cs.piece.type].zone] || 'serv';
      const dims = g.cases.length > 1 ? (g.cases.length === 2 ? 'forme en L' : 'forme libre') : nd(cs.w) + ' × ' + nd(cs.h) + ' m';
      s += etiquette(cs.x, cs.y, cs.w, cs.h, cs.piece.nom, etat.m2 ? g.aire : null,
        etat.m2 ? dims : null, fs, C, C.ink, C[z]);
    });

    /* --- les poignées des annexes : on les étire par leurs bords --- */
    if (mode !== 'papier') {
      ext.filter(e => e.annexe).forEach(e => {
        const t = .34, m = .15;
        const bords = [
          ['n', e.x + m, e.y - t / 2, e.w - 2 * m, t], ['s', e.x + m, e.y + e.h - t / 2, e.w - 2 * m, t],
          ['o', e.x - t / 2, e.y + m, t, e.h - 2 * m], ['e', e.x + e.w - t / 2, e.y + m, t, e.h - 2 * m]
        ];
        bords.forEach(b => {
          if (b[3] <= 0 || b[4] <= 0) return;
          s += '<rect class="poignee-annexe ' + (b[0] === 'n' || b[0] === 's' ? 'ph' : 'pv') + '" data-annexe="' + e.id +
            '" data-cote="' + b[0] + '" x="' + n1(b[1]) + '" y="' + n1(b[2]) + '" width="' + n1(b[3]) + '" height="' + n1(b[4]) + '" rx="0.06"/>';
        });
      });
    }

    /* --- cotes, nord, échelle --- */
    if (c.cotes) s += cotes(W, H, fs, C);
    s += rose(vx + vw - 1.1, vy + .95, fs, C, c.nord);
    /* L'échelle se cale sous le logement, pas dans le coin du cadre :
       accolée au jardin, elle aurait l'air de flotter. */
    s += echelle(0, vy + vh - .45, fs, C);

    return s + '</svg>';
  }

  /* ============================================================
     LA MAQUETTE 3D
     Le module NP3D rend la scène ; ici on l'habille aux couleurs
     du thème et on la cadre.
     ============================================================ */
  function vue3d(niv, mode) {
    const C3 = couleurs3d(mode);
    const CC = mode === 'papier' ? PAPIER : ECRAN;
    const zoneHex = mode === 'papier'
      ? cs => PAPIER[ZONE_COUL[NP.CAT[cs.piece.type].zone] || 'serv']
      : (() => {
        const g = getComputedStyle(document.documentElement);
        return cs => (g.getPropertyValue('--p-' + (ZONE_COUL[NP.CAT[cs.piece.type].zone] || 'serv')) || '').trim() || '#EEE';
      })();
    const r = NP3D.scene(niv, C3, zoneHex, {
      mobilier: etat.criteres.mobilier, esc: esc, abrege: abrege, fs: .34
    });
    const b = r.boite, m = Math.max(.6, b.w * .04);
    void CC;
    return '<svg viewBox="' + n1(b.x - m) + ' ' + n1(b.y - m) + ' ' + n1(b.w + m * 2) + ' ' +
      n1(b.h + m * 2) + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      r.svg + '</svg>';
  }

  /* Chaque ouverture est un petit objet saisissable : on la fait
     glisser le long de son mur, on la sélectionne d'un clic.
     `prof` est la profondeur de la zone de préhension, du côté où
     la porte bat — sinon on ne pourrait attraper qu'un trait. */
  function enveloppeOuverture(o, dessin, C, mode, prof) {
    if (mode === 'papier') return dessin;
    const sel = etat.selOuv === o.cle;
    const dir = o.sens || 0;
    const mrg = .22;
    let hx, hy, hw, hh;
    if (o.axe === 'h') {
      hx = o.c - o.l / 2 - mrg; hw = o.l + mrg * 2;
      hy = dir >= 0 ? o.pos - mrg : o.pos - prof - mrg;
      hh = prof + mrg * 2;
    } else {
      hy = o.c - o.l / 2 - mrg; hh = o.l + mrg * 2;
      hx = dir >= 0 ? o.pos - mrg : o.pos - prof - mrg;
      hw = prof + mrg * 2;
    }
    let s = '<g class="ouv' + (sel ? ' sel' : '') + '" data-ouv="' + o.cle + '">';
    if (sel) {
      s += '<rect x="' + n1(hx) + '" y="' + n1(hy) + '" width="' + n1(hw) + '" height="' + n1(hh) +
        '" rx="0.12" fill="' + C.accent + '" opacity=".14"/>';
      /* Le trait du mur sur lequel elle peut coulisser. */
      s += o.axe === 'h'
        ? '<path d="M' + n1(o.a) + ' ' + n1(o.pos) + 'H' + n1(o.b) + '" stroke="' + C.accent +
          '" stroke-width="0.05" stroke-dasharray="0.14 0.12" fill="none" opacity=".8"/>'
        : '<path d="M' + n1(o.pos) + ' ' + n1(o.a) + 'V' + n1(o.b) + '" stroke="' + C.accent +
          '" stroke-width="0.05" stroke-dasharray="0.14 0.12" fill="none" opacity=".8"/>';
    }
    s += dessin;
    s += '<rect x="' + n1(hx) + '" y="' + n1(hy) + '" width="' + n1(hw) + '" height="' + n1(hh) +
      '" fill="transparent"/>';
    s += '</g>';
    /* Sélectionnée, elle porte sa croix de suppression, posée à côté
       d'elle sur le plan : un clic, et elle disparaît. */
    if (false && sel) {   // la croix rouge est retirée : on supprime par la barre, Suppr ou l'outil Effacer
      const d = .55, r = .24;
      const bx = o.axe === 'h' ? o.c + o.l / 2 + .15 : o.pos + (dir >= 0 ? -d : d);
      const by = o.axe === 'h' ? o.pos + (dir >= 0 ? -d : d) : o.c + o.l / 2 + .15;
      s += '<g class="sup-ouv" data-ouv="' + o.cle + '"><title>Supprimer</title>' +
        '<circle cx="' + n1(bx) + '" cy="' + n1(by) + '" r="' + r + '" fill="var(--danger)"/>' +
        '<path d="M' + n1(bx - .09) + ' ' + n1(by - .09) + 'L' + n1(bx + .09) + ' ' + n1(by + .09) +
        'M' + n1(bx + .09) + ' ' + n1(by - .09) + 'L' + n1(bx - .09) + ' ' + n1(by + .09) +
        '" stroke="#fff" stroke-width=".06" stroke-linecap="round"/></g>';
    }
    return s;
  }

  /* La porte d'un garage posé contre la maison : sur le côté choisi,
     sinon sur celui qui tourne le dos à la maison (le côté rue). */
  function porteAnnexe(e, W, H, C) {
    let cote = e.porte && e.porte !== 'auto' ? e.porte : null;
    if (cote === 'aucune') return '';
    if (!cote) {
      const E = .06;
      cote = Math.abs(e.x - W) < E ? 'e' : Math.abs(e.x + e.w) < E ? 'o' : Math.abs(e.y - H) < E ? 's' : Math.abs(e.y + e.h) < E ? 'n' : 's';
      /* Collé à droite, la porte est au bout le plus long, face à la rue : on garde le petit côté. */
      if ((cote === 'e' || cote === 'o') && e.h > e.w) cote = 's';
      else if ((cote === 'n' || cote === 's') && e.w > e.h) cote = cote === 's' ? 's' : 'n';
    }
    const horiz = cote === 'n' || cote === 's';
    const long = horiz ? e.w : e.h;
    const l = Math.min(long - .3, long > 5 ? 4.8 : 2.4);
    const p = {axe: horiz ? 'h' : 'v', pos: cote === 'n' ? e.y : cote === 's' ? e.y + e.h : cote === 'o' ? e.x : e.x + e.w,
      c: horiz ? e.x + e.w / 2 : e.y + e.h / 2, l: l, sens: (cote === 'n' || cote === 'o') ? 1 : -1};
    return dessinGarage(p, C);
  }

  /* La porte de garage sectionnelle : son tablier dans le mur, et en
     pointillés, le rail où elle se range au plafond, côté intérieur. */
  function dessinGarage(p, C) {
    const l = p.l, dir = p.sens || 1, prof = Math.min(2.4, l);
    const x0 = p.axe === 'h' ? p.c - l / 2 : p.pos, y0 = p.axe === 'h' ? p.pos : p.c - l / 2;
    const tab = p.axe === 'h' ? 'M' + n1(x0) + ' ' + n1(y0) + 'h' + n1(l) : 'M' + n1(x0) + ' ' + n1(y0) + 'v' + n1(l);
    const rail = p.axe === 'h'
      ? '<rect x="' + n1(x0 + .05) + '" y="' + n1(dir > 0 ? y0 : y0 - prof) + '" width="' + n1(l - .1) + '" height="' + n1(prof) + '"'
      : '<rect x="' + n1(dir > 0 ? x0 : x0 - prof) + '" y="' + n1(y0 + .05) + '" width="' + n1(prof) + '" height="' + n1(l - .1) + '"';
    return '<path d="' + tab + '" stroke="' + C.murFin + '" stroke-width=".11" stroke-linecap="butt" fill="none"/>' +
      rail + ' fill="none" stroke="' + C.murFin + '" stroke-width=".035" stroke-dasharray=".18 .12" opacity=".8"/>';
  }

  function dessinPorte(p, C) {
    const l = p.l, dir = p.sens;
    const c1 = p.charn ? 1 : -1;          // de quel côté est la charnière
    let hx, hy, lx, ly, jx, jy;
    if (p.axe === 'h') {
      hx = p.c + c1 * l / 2; hy = p.pos; jx = p.c - c1 * l / 2; jy = p.pos;
      lx = hx; ly = hy + dir * l;
    } else {
      hx = p.pos; hy = p.c + c1 * l / 2; jx = p.pos; jy = p.c - c1 * l / 2;
      lx = hx + dir * l; ly = hy;
    }
    const cross = (lx - hx) * (jy - hy) - (ly - hy) * (jx - hx);
    const sweep = cross > 0 ? 1 : 0;
    const ep = p.type === 'entree' ? .07 : .05;
    return '<path d="M' + n1(hx) + ' ' + n1(hy) + 'L' + n1(lx) + ' ' + n1(ly) +
      'A' + n1(l) + ' ' + n1(l) + ' 0 0 ' + sweep + ' ' + n1(jx) + ' ' + n1(jy) +
      '" fill="none" stroke="' + C.murFin + '" stroke-width="' + ep + '" stroke-linecap="round" opacity=".85"/>';
  }

  function etiquette(x, y, w, h, nom, a, dims, fs, C, couleur, halo) {
    const cx = x + w / 2, cy = y + h / 2;
    const vertical = w < fs * 7 && h > w * 1.25;
    const place = vertical ? h : w;
    if (place < fs * 3.2) return '';                     // trop petit : on n'écrit rien
    const court = place < fs * 9;
    const lignes = [];
    lignes.push({t: court ? abrege(nom) : nom, w: 600, s: fs * .95, c: couleur});
    /* Les m² ne s'affichent que si on les demande (a vaut alors un nombre). */
    if (typeof a === 'number' && (vertical ? w : h) > fs * 2.4) {
      lignes.push({t: m2(a), w: 400, s: fs * .78, c: C.ink3, cls: 'm2-val', v: a});
    }
    if (dims && (vertical ? w : h) > fs * 3.6 && place > fs * 9) {
      lignes.push({t: dims, w: 400, s: fs * .68, c: C.ink3, cls: 'm2-dim'});
    }
    const ht = lignes.reduce((s2, L) => s2 + L.s * 1.22, 0);
    let yy = cy - ht / 2 + lignes[0].s * .92;
    /* Un liseré de la couleur du sol derrière le texte : le nom de la
       pièce reste lisible même posé sur un meuble ou une porte. */
    const liseré = halo ? ' paint-order="stroke" stroke="' + halo + '" stroke-width="' + n1(fs * .3) +
      '" stroke-linejoin="round"' : '';
    let out = '<g class="etq"' + (vertical ? ' transform="rotate(-90 ' + n1(cx) + ' ' + n1(cy) + ')"' : '') + '>';
    lignes.forEach(L => {
      out += '<text x="' + n1(cx) + '" y="' + n1(yy) + '" font-size="' + n1(L.s) + '" fill="' + L.c +
        '" font-weight="' + L.w + '" text-anchor="middle"' + liseré +
        (L.cls ? ' class="' + L.cls + '"' + (L.v !== undefined ? ' data-v="' + L.v.toFixed(2) + '"' : '') : '') +
        '>' + esc(L.t) + '</text>';
      yy += L.s * 1.22;
    });
    return out + '</g>';
  }

  const ABREGES = {'Salle de bain': 'S. de bain', 'Chambre parentale': 'Ch. parentale',
    "Salle d'eau parentale": "S. d'eau", 'Séjour · cuisine ouverte': 'Séjour', 'Palier · dégagement': 'Palier',
    'Salle à manger': 'S. à manger', 'Cuisine ouverte': 'Cuisine'};
  const abrege = n => ABREGES[n] || n;

  /* Les cotes d'ensemble : en bas la largeur, à gauche la longueur. */
  function cotes(W, H, fs, C) {
    const d = .95, t = .16;
    let s = '<g class="cotation" stroke="' + C.cote + '" stroke-width="0.022" fill="none">';
    s += '<path d="M0 ' + n1(H + d) + 'H' + n1(W) + 'M0 ' + n1(H + d - t) + 'v' + n1(t * 2) +
      'M' + n1(W) + ' ' + n1(H + d - t) + 'v' + n1(t * 2) + '"/>';
    s += '<path d="M' + n1(-d) + ' 0V' + n1(H) + 'M' + n1(-d - t) + ' 0h' + n1(t * 2) +
      'M' + n1(-d - t) + ' ' + n1(H) + 'h' + n1(t * 2) + '"/></g>';
    s += '<text x="' + n1(W / 2) + '" y="' + n1(H + d - .12) + '" font-size="' + n1(fs * .8) +
      '" fill="' + C.cote + '" text-anchor="middle" class="etq">' + nd(W) + ' m</text>';
    s += '<text x="' + n1(-d - .12) + '" y="' + n1(H / 2) + '" font-size="' + n1(fs * .8) + '" fill="' + C.cote +
      '" text-anchor="middle" class="etq" transform="rotate(-90 ' + n1(-d - .12) + ' ' + n1(H / 2) + ')">' +
      nd(H) + ' m</text>';
    return s;
  }

  const ANGLE_NORD = {haut: 0, droite: 90, bas: 180, gauche: 270};
  function rose(x, y, fs, C, nord) {
    const a = ANGLE_NORD[nord] || 0;
    return '<g transform="translate(' + n1(x) + ' ' + n1(y) + ') rotate(' + a + ')" opacity=".85">' +
      '<path d="M0 -.62L.26 .3L0 .12L-.26 .3Z" fill="' + C.accent + '"/>' +
      '<text x="0" y="' + n1(-.78) + '" font-size="' + n1(fs * .8) + '" fill="' + C.accent +
      '" text-anchor="middle" font-weight="700" class="etq" transform="rotate(' + (-a) + ')">N</text></g>';
  }

  function echelle(x, y, fs, C) {
    const L = 5;
    return '<g opacity=".8"><path d="M' + n1(x) + ' ' + n1(y) + 'h' + L + 'M' + n1(x) + ' ' + n1(y - .13) +
      'v.26M' + n1(x + L) + ' ' + n1(y - .13) + 'v.26M' + n1(x + L / 2) + ' ' + n1(y - .09) + 'v.18" stroke="' +
      C.cote + '" stroke-width="0.03" fill="none"/>' +
      '<text x="' + n1(x + L / 2) + '" y="' + n1(y - .24) + '" font-size="' + n1(fs * .72) + '" fill="' + C.cote +
      '" text-anchor="middle" class="etq">5 m — échelle</text></g>';
  }

  /* ============================================================
     L'INTERFACE
     ============================================================ */
  const TYPES = [
    {cle: 'appartement', nom: 'Appartement', em: '🏢'},
    {cle: 'maison', nom: 'Maison', em: '🏡'},
    {cle: 'duplex', nom: 'Duplex', em: '🏘️'}
  ];

  /* ---------- Étape 2 : les critères, en détail ----------
     Des cartes par thème. Ce qui change la découpe (pièces, piscine,
     garage…) refait les plans ; le reste (style, matériaux, chauffage…)
     va au récapitulatif. */
  function selC(cle, liste) {
    return '<select data-c="' + cle + '">' + liste.map(o => '<option value="' + esc(o[0]) + '"' +
      (etat.criteres[cle] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
  }
  function ligC(label, champ, aide) {
    return '<div class="lig"><label>' + label + '</label>' + champ + (aide ? '<div class="aide">' + aide + '</div>' : '') + '</div>';
  }
  function numC(cle, min, max, pas, attrs) {
    return '<input type="number" data-cnum="' + cle + '" min="' + min + '" max="' + max + '" step="' + pas + '" value="' + (etat.criteres[cle] == null ? '' : etat.criteres[cle]) + '"' + (attrs || '') + '>';
  }
  function puces(cle, liste) {
    return '<div class="puces">' + liste.map(o => '<button type="button" class="puce' + (etat.criteres[cle] === o[0] ? ' on' : '') +
      '" data-cchip="' + cle + '" data-val="' + esc(o[0]) + '">' + (o[2] ? '<span>' + o[2] + '</span>' : '') + esc(o[1]) + '</button>').join('') + '</div>';
  }
  const carte = (titre, hint, corps, large) => '<div class="card' + (large ? ' large' : '') + '"><div class="hd"><h2>' + titre + '</h2>' +
    (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div><div class="bd"><div class="champs">' + corps + '</div></div></div>';

  function formulaire() {
    const c = etat.criteres;
    const maison = c.type !== 'appartement';
    let s = '';

    s += carte('🏠 Le bien', 'La base de tout',
      '<div class="lig"><label>Type de bien</label><div class="typos">' +
      TYPES.map(t => '<button type="button" class="typo' + (c.type === t.cle ? ' on' : '') +
        '" data-typo="' + t.cle + '"><span class="em">' + t.em + '</span><b>' + t.nom + '</b></button>').join('') + '</div></div>' +
      '<div class="duo">' +
      '<div class="lig"><label>Surface habitable</label><input type="number" id="f-surface" min="20" max="500" step="1" value="' + Math.round(c.surface) + '"><div class="aide">m² au total</div></div>' +
      '<div class="lig"><label>Niveaux</label>' + compteur('niveaux', c.niveaux, c.type === 'duplex') + '</div></div>' +
      '<div class="duo">' + ligC('Style de la maison', selC('style', OPTIONS.style)) + ligC('Toiture', selC('toiture', OPTIONS.toiture)) + '</div>' +
      '<div class="duo">' + ligC('Hauteur sous plafond', selC('hsp', OPTIONS.hsp)) + ligC('Pièce de vie orientée', selC('orientation', OPTIONS.orientation)) + '</div>');

    /* La suite parentale : trois formules, cochées d'un clic. */
    const suite = c.suiteType || 'simple';
    const choix = [['simple', '🛏️', 'Chambre seule'], ['sde', '🚿', 'Suite + salle d\'eau'],
                   ['complete', '👕', 'Suite + salle d\'eau + dressing']];
    s += carte('🛏️ Les chambres', 'La partie nuit',
      '<div class="duo"><div class="lig"><label>Chambres</label>' + compteur('chambres', c.chambres) + '</div><div></div></div>' +
      '<div class="lig"><label>La suite parentale</label><div class="radios">' +
      choix.map(x => '<label class="radio' + (suite === x[0] ? ' on' : '') + '">' +
        '<input type="radio" name="suite" value="' + x[0] + '"' + (suite === x[0] ? ' checked' : '') + '>' +
        '<span class="em">' + x[1] + '</span><span>' + x[2] + '</span></label>').join('') + '</div>' +
      (c.niveaux === 2 ? '<select id="f-suitelvl" style="margin-top:6px">' +
        '<option value="0"' + (c.parentaleRdc ? ' selected' : '') + '>… au rez-de-chaussée</option>' +
        '<option value="1"' + (c.parentaleRdc ? '' : ' selected') + '>… à l\'étage</option></select>' : '') + '</div>' +
      '<div class="opts">' + inter('dressing', 'Dressing indépendant', c.dressing) + inter('chambreAmis', 'Une des chambres sert de chambre d\'amis', c.chambreAmis) +
      inter('placards', 'Placards intégrés dans les chambres', c.placards) + '</div>');

    s += carte('🛁 Les pièces d\'eau', '',
      '<div class="duo"><div class="lig"><label>Salles de bain</label>' + compteur('sdb', c.sdb) + '</div>' +
      ligC('Douche ou baignoire ?', selC('doucheBain', OPTIONS.doucheBain)) + '</div>' +
      '<div class="opts">' + inter('wcSepare', 'WC séparé', c.wcSepare) + inter('doubleVasque', 'Double vasque', c.doubleVasque) +
      (c.niveaux === 2 ? inter('wcEtage', 'Un WC aussi à l\'étage', c.wcEtage) : '') + '</div>');

    s += carte('🍳 Les pièces de vie', '',
      '<div class="duo">' + ligC('Forme de la cuisine', selC('cuisineForme', OPTIONS.cuisineForme)) + ligC('Poêle ou cheminée', selC('cheminee', OPTIONS.cheminee)) + '</div>' +
      '<div class="opts">' + inter('cuisineOuverte', 'Cuisine ouverte sur le séjour', c.cuisineOuverte) + inter('cellier', 'Cellier', c.cellier) +
      inter('buanderie', 'Buanderie', c.buanderie) + inter('bureau', 'Bureau', c.bureau) + '</div>' +
      ligC('Autres pièces souhaitées', '<input type="text" data-ctxt="autresPieces" value="' + esc(c.autresPieces || '') + '" placeholder="Ex. salle de jeux, atelier, home cinéma…">',
        'Noté au récapitulatif ; ajoutez-les ensuite à l\'étape 4.'));

    if (maison) {
      s += carte('🌳 Les extérieurs', '',
        '<div class="duo"><div class="lig"><label>Terrasse</label><input type="number" id="f-terrasse" min="0" max="200" step="1" value="' + Math.round(c.terrasse) + '"><div class="aide">m², 0 = aucune</div></div>' +
        ligC('Matériau de la terrasse', selC('terrasseMat', OPTIONS.terrasseMat)) + '</div>' +
        '<div class="duo"><div class="lig"><label>Jardin</label><input type="number" id="f-jardin" min="0" max="5000" step="10" value="' + Math.round(c.jardin) + '"><div class="aide">m² de terrain</div></div>' +
        ligC('Clôture et portail', selC('cloture', OPTIONS.cloture)) + '</div>' +
        '<div class="opts">' + inter('terrasseCouverte', 'Terrasse couverte (pergola, auvent)', c.terrasseCouverte) +
        inter('abri', 'Abri de jardin', c.abri) + inter('potager', 'Potager', c.potager) + inter('arrosage', 'Arrosage automatique', c.arrosage) + '</div>');

      s += carte('🏊 La piscine', c.piscine ? 'Elle apparaît sur les plans, au fond du jardin' : '',
        '<div class="opts">' + inter('piscine', 'Je veux une piscine', c.piscine) + '</div>' +
        (c.piscine ?
          ligC('Forme', puces('piscineForme', [['rect', 'Rectangulaire', '▭'], ['carre', 'Carrée', '◻'], ['ronde', 'Ronde', '◯'], ['ovale', 'Ovale', '⬭'], ['haricot', 'Haricot', '🫘']])) +
          ligC('Pose', puces('piscinePose', [['creusee', 'Creusée', '⬇️'], ['semi', 'Semi-enterrée', '↕️'], ['horssol', 'Hors-sol', '⬆️']])) +
          '<div class="duo">' + ligC(c.piscineForme === 'ronde' || c.piscineForme === 'carre' ? 'Diamètre / côté' : 'Longueur', numC('piscineL', 2, 25, .1), 'mètres') +
          (c.piscineForme === 'ronde' || c.piscineForme === 'carre' ? '<div></div>' : ligC('Largeur', numC('piscineW', 1.5, 15, .1), 'mètres')) + '</div>' +
          '<div class="duo">' + ligC('Profondeur', selC('piscineProf', OPTIONS.piscineProf)) + ligC('Chauffage', selC('piscineChauffage', OPTIONS.piscineChauffage)) + '</div>' +
          '<div class="duo">' + ligC('Couverture / sécurité', selC('piscineCouverture', OPTIONS.piscineCouverture)) + ligC('Margelle', selC('piscineMargelle', OPTIONS.piscineMargelle)) + '</div>' +
          '<div class="duo">' + ligC('Traitement de l\'eau', selC('piscineTraitement', OPTIONS.piscineTraitement)) + '<div></div></div>' +
          '<div class="opts">' + inter('piscineLocal', 'Local technique', c.piscineLocal) + inter('piscineEclairage', 'Éclairage', c.piscineEclairage) + '</div>'
          : ''));

      s += carte('🚗 Le stationnement', '',
        '<div class="opts">' + inter('garage', 'Garage', c.garage) + (c.garage ? inter('garageDouble', 'Garage double', c.garageDouble) : '') +
        inter('carport', 'Carport', c.carport) + inter('borneRecharge', 'Borne de recharge', c.borneRecharge) + '</div>' +
        '<div class="duo"><div class="lig"><label>Places extérieures</label>' + compteur('placesExt', c.placesExt || 0) + '</div><div></div></div>');
    } else {
      s += carte('🌿 Balcon ou terrasse', '',
        '<div class="duo"><div class="lig"><label>Surface</label><input type="number" id="f-terrasse" min="0" max="200" step="1" value="' + Math.round(c.terrasse) + '"><div class="aide">m², 0 = aucun</div></div>' +
        ligC('Revêtement', selC('terrasseMat', OPTIONS.terrasseMat)) + '</div>' +
        '<div class="opts">' + inter('garage', 'Place de parking / box', c.garage) + '</div>');
    }

    s += carte('⚙️ Technique et confort', 'Pour le récapitulatif',
      '<div class="duo">' + ligC('Chauffage', selC('chauffage', OPTIONS.chauffage)) + ligC('Menuiseries', selC('menuiseries', OPTIONS.menuiseries)) + '</div>' +
      '<div class="duo">' + ligC('Volets', selC('volets', OPTIONS.volets)) + '<div></div></div>' +
      '<div class="opts">' + inter('plancherChauffant', 'Plancher chauffant', c.plancherChauffant) + inter('clim', 'Climatisation', c.clim) +
      inter('domotique', 'Domotique', c.domotique) + inter('solaire', 'Panneaux solaires', c.solaire) + inter('recupEau', 'Récupérateur d\'eau de pluie', c.recupEau) + '</div>');

    s += carte('✏️ Le dessin', 'Comment les plans sont présentés',
      '<div class="opts">' + inter('mobilier', 'Symboles de mobilier', c.mobilier) + inter('cotes', 'Cotes d\'ensemble', c.cotes) +
      (c.niveaux === 2 ? inter('calque', 'Voir l\'autre niveau en transparence', c.calque) : '') + '</div>' +
      '<div class="lig"><label>Le nord est</label><select id="f-nord">' +
      ['haut', 'droite', 'bas', 'gauche'].map(o => '<option value="' + o + '"' + (c.nord === o ? ' selected' : '') + '>vers le ' + o + '</option>').join('') + '</select></div>' +
      '<button class="addbtn" id="f-regen" style="width:100%;justify-content:center">↺ Repartir du programme automatique</button>' +
      '<div class="aide" style="text-align:center">Efface les pièces ajoutées et les réglages d\'ouvertures faits à la main.</div>');
    return s;
  }

  function compteur(cle, val, fige) {
    return '<div class="compteur"' + (fige ? ' style="opacity:.5;pointer-events:none"' : '') + '>' +
      '<button type="button" data-cpt="' + cle + '" data-pas="-1">−</button>' +
      '<span>' + val + '</span>' +
      '<button type="button" data-cpt="' + cle + '" data-pas="1">+</button></div>';
  }
  function inter(cle, label, val) {
    return '<label class="opt"><span>' + label + '</span>' +
      '<input type="checkbox" data-opt="' + cle + '"' + (val ? ' checked' : '') + '></label>';
  }

  /* ---------- Les chiffres du haut ---------- */
  function kpis() {
    const r = etat.res, c = etat.criteres;
    if (!r || !r.variantes.length) return '';
    const v = planCourant();
    const toutes = [];
    v.niveaux.forEach(n => n.cases.forEach(cs => toutes.push(cs)));
    const hab = toutes.reduce((s, cs) => s + aire(cs), 0);
    const nbCh = new Set(toutes.filter(cs => ['chambre', 'parentale', 'suite'].indexOf(cs.piece.type) >= 0).map(cs => cs.piece.id)).size;
    const nuit = toutes.filter(cs => ['chambre', 'parentale', 'suite', 'sdb', 'salle_eau', 'dressing'].indexOf(cs.piece.type) >= 0)
      .reduce((s, cs) => s + aire(cs), 0);
    const niv0 = v.niveaux[0];
    const K = (cls, lab, val, sub) => '<div class="kpi ' + cls + '"><div class="lab">' + lab + '</div>' +
      '<div class="val">' + val + '</div><div class="sub">' + sub + '</div></div>';
    let s = K('', '📐 Habitable', m2(hab), Math.round(hab / Math.max(1, nbNiv())) + ' m² par niveau');
    s += K('k-nuit', '🛏️ Nuit', nbCh + (nbCh > 1 ? ' chambres' : ' chambre'), m2(nuit) + ' d\'espace nuit');
    s += K('', '🏠 Emprise', nd(niv0.W) + ' × ' + nd(niv0.H) + ' m', nbNiv() > 1 ? nbNiv() + ' niveaux superposés' : 'de plain-pied');
    if (c.terrasse > 0) s += K('k-eau', '⛱️ Terrasse', m2(c.terrasse), 'accolée au séjour');
    if (c.jardin > 0 && c.type !== 'appartement') s += K('k-ext', '🌳 Terrain', Math.round(c.jardin + niv0.W * niv0.H) + ' m²', Math.round(c.jardin) + ' m² de jardin');
    return s;
  }

  /* ---------- Les variantes et les niveaux ---------- */
  const VUES = [['2d', '📐', 'Plan'], ['3d', '🧊', 'Maquette 3D'], ['fa', '🏠', 'Façade']];

  function facadeSvg(mode) {
    const r = etat.res;
    const v = planCourant();
    const C3 = couleurs3d(mode);
    const C = Object.assign({}, C3, {
      mur: mode === 'papier' ? '#F3EFFB' : C3.murInt,
      toit: mode === 'papier' ? '#C7B4F0' : C3.murExt,
      porte: mode === 'papier' ? '#BDB3D4' : C3.meuble,
      cote: mode === 'papier' ? PAPIER.cote : ECRAN.cote
    });
    const f = NP3D.facade(v.niveaux, etat.criteres.facade || 'S', C,
      {toit: etat.criteres.type === 'appartement' ? 'plat' : 'pente'});
    const b = f.boite;
    return '<svg viewBox="' + n1(b.x) + ' ' + n1(b.y) + ' ' + n1(b.w) + ' ' + n1(b.h) +
      '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + f.svg + '</svg>';
  }

  /* Le nom d'un niveau : rez, étage, 2e étage… */
  const nomNiveau = (i, n) => i === 0 ? 'Rez-de-chaussée' : (n > 2 ? (i === 1 ? '1er étage' : i + 'e étage') : 'Étage');

  /* La barre au-dessus du plan dépend de l'étape :
       3 — niveaux et vues seulement (les variantes se choisissent dans leurs cartes)
       4 — la palette de construction, les niveaux (qu'on peut ajouter), les actions
       5 — le catalogue de meubles */
  function barrePlan() {
    const r = etat.res;
    if (!r) return '';
    const E = etat.etape;
    let s = '';
    if ((E === 4 || E === 5) && etat.perso) {
      s += '<div class="tabs"><span class="etiq-plan"><span class="em">✏️</span> Mon plan <small>· d\'après ' +
        (etat.perso.base === 'image' ? 'votre image' : etat.perso.base === 'vierge' ? 'un plan vierge' : 'la variante ' + esc(etat.perso.base)) + '</small></span></div>';
    }
    if ((nbNiv() > 1 || E === 4) && etat.vue !== 'fa') {
      s += '<div class="tabs" id="tabs-niv">';
      for (let i = 0; i < nbNiv(); i++) {
        s += '<button type="button" data-niv="' + i + '" class="' + (i === etat.iniv ? 'on' : '') + '">' +
          '<span class="em">' + (i === 0 ? '🪟' : '🪜') + '</span> ' + nomNiveau(i, nbNiv()) + '</button>';
      }
      if (E === 4) {
        s += '<button type="button" data-niveau-act="ajouter" class="plus-niv" title="Ajouter un niveau au-dessus, de la même emprise">＋ Niveau</button>';
        if (nbNiv() > 1) s += '<button type="button" data-niveau-act="retirer" class="moins-niv" title="Supprimer le niveau affiché">− Niveau</button>';
      }
      s += '</div>';
    }
    s += '<div class="tabs right" id="tabs-vue">' +
      VUES.filter(v => E !== 5 || v[0] === '2d' || v[0] === '3d').map(v => '<button type="button" data-vue="' + v[0] + '" class="' + (etat.vue === v[0] ? 'on' : '') +
        '"><span class="em">' + v[1] + '</span> ' + v[2] + '</button>').join('') + '</div>';
    if (etat.vue === 'fa') {
      s += '<div class="tabs" id="tabs-cote">' +
        ['S', 'E', 'N', 'O'].map(k => '<button type="button" data-cote="' + k + '" class="' +
          ((etat.criteres.facade || 'S') === k ? 'on' : '') + '">' + NP3D.COTES[k].nom + '</button>').join('') +
        '</div>';
    }
    if (E === 4 && etat.vue === '2d') {
      s += '<div class="palette" role="toolbar" aria-label="Outils de construction">' +
        OUTILS.filter(o => o[0] !== 'meubler').map(o => '<button type="button" data-outil="' + o[0] + '" class="' + (etat.outil === o[0] ? 'on' : '') +
          '" title="' + o[2] + '"><span class="em">' + o[1] + '</span><small>' + o[2] + '</small></button>').join('') +
        '</div>';
    }
    if (E === 5 && etat.vue === '2d') s += catalogue();
    if (E === 4) {
      s += '<div class="actions-plan">' +
        '<button class="btn" type="button" data-plan="importer" title="Reprendre un plan existant à partir d\'une ou deux images">🖼️ Importer un plan</button>' +
        '<button class="btn" type="button" data-plan="vierge" title="Partir d\'une emprise vide et tracer ses murs">🧹 Plan vierge</button>' +
        '<button class="btn" type="button" data-plan="garder" title="Ranger une copie de ce plan dans la gouttière, pour comparer">💾 Garder ce plan</button>' +
        (etat.vue === '2d' ? '<span class="ajout-ext"><select class="mini-sel" id="annexe-type" title="Ajouter dehors">' +
          TYPES_ANNEXES().map(k => '<option value="' + k + '">' + NP.ANNEXES[k].emoji + ' ' + NP.ANNEXES[k].nom + '</option>').join('') +
          '</select><button class="btn" type="button" data-plan="annexe" title="Ajouter cette annexe contre la maison">＋ Dehors</button></span>' : '') +
        (etat.perso ? '<button class="btn danger" type="button" data-plan="supprimer" title="Supprimer « Mon plan » et revenir aux propositions">🗑️ Supprimer Mon plan</button>' : '') +
        (etat.fonds[etat.iniv] && etat.vue === '2d'
          ? '<button class="btn" type="button" data-plan="image" title="Voir ou cacher l\'image d\'origine sous le plan">' +
            (etat.fonds[etat.iniv].cache ? '👁️ Voir l\'image d\'origine' : '🙈 Cacher l\'image d\'origine') + '</button>' : '') +
        '</div>';
    }
    return s;
  }

  /* La barre qui apparaît quand une ouverture est sélectionnée :
     on la fait coulisser à la souris, et ici on la retourne,
     on l'élargit, ou on l'enlève. */
  function barreOuverture() {
    if (!etat.selOuv || etat.vue !== '2d') return '';
    const o = ouvertureSel();
    if (!o) return '';
    const est = o.type === 'entree' ? 'Porte d\'entrée' : o.type === 'porte' ? 'Porte'
      : o.type === 'passage' ? 'Passage' : o.type === 'baie' ? 'Baie vitrée' : o.type === 'garage' ? 'Porte de garage' : 'Fenêtre';
    if (o.type === 'vide') {
      return '<div class="barre-ouv">' +
        '<span class="qui"><b>Mur supprimé</b> — ' + esc(o.piece) + (o.vers ? ' → ' + esc(o.vers) : '') + ' · ' + nd(o.l) + ' m</span>' +
        '<button class="mini-btn" data-ouvact="sup" title="Remettre le mur">🧱 Rebâtir le mur</button>' +
        '</div>';
    }
    const porte = o.type === 'porte' || o.type === 'entree';
    return '<div class="barre-ouv">' +
      '<span class="qui"><b>' + esc(est) + '</b> — ' + esc(o.piece) +
      (o.vers ? ' → ' + esc(o.vers) : '') + ' · ' + nd(o.l) + ' m</span>' +
      '<select class="mini-sel" data-ouvtype title="Changer le type">' +
      TYPES_OUV.map(t => '<option value="' + t[0] + '"' + (t[0] === o.type ? ' selected' : '') + '>' + t[1] + '</option>').join('') +
      '</select>' +
      (porte ? '<button class="mini-btn" data-ouvact="tourner" title="Faire tourner la porte (R) : quatre positions">↻ Tourner</button>' : '') +
      (porte ? '<button class="mini-btn" data-ouvact="charn" title="Charnière de l\'autre côté">🔁 Charnière</button>' : '') +
      (porte || o.type === 'garage' ? '<button class="mini-btn" data-ouvact="sens" title="Ouvrir de l\'autre côté du mur">↔️ Sens</button>' : '') +
      '<button class="mini-btn" data-ouvact="moins">− large</button>' +
      '<button class="mini-btn" data-ouvact="plus">+ large</button>' +
      '<button class="mini-btn danger" data-ouvact="sup" title="Supprimer (Suppr)">✕ Supprimer</button>' +
      '<span class="aide">Glissez-la le long d\'un mur, ou jusqu\'à un autre mur.</span>' +
      '</div>';
  }

  /* Les réglages du calque d'image, sous le plan. */
  function barreFond() {
    if (etat.vue !== '2d') return '';
    const f = etat.fonds[etat.iniv];
    if (!f) return '';
    return '<div class="barre-ouv barre-fond">' +
      '<span class="qui"><b>🖼️ Calque</b> — plan d\'origine en transparence</span>' +
      '<label>Opacité <input type="range" min="0.1" max="1" step="0.05" value="' + f.opacite + '" data-fond="opacite"></label>' +
      '<label>Largeur réelle <input type="text" inputmode="decimal" value="' + nd(f.largeur) + '" data-fond="largeur" class="petit"> m</label>' +
      '<label>← → <input type="range" min="-6" max="6" step="0.05" value="' + (f.dx || 0) + '" data-fond="dx"></label>' +
      '<label>↑ ↓ <input type="range" min="-6" max="6" step="0.05" value="' + (f.dy || 0) + '" data-fond="dy"></label>' +
      '<button class="mini-btn danger" data-fond-act="retirer">✕ Retirer</button>' +
      '<span class="aide">Réglez la largeur réelle pour que l\'image tombe à l\'échelle, puis tirez les murs dessus.</span>' +
      '</div>';
  }

  /* Charge une image, la réduit (1600 px suffisent pour calquer) et la
     pose au niveau affiché, à la largeur de l'emprise. */
  function chargerFond(fichier) {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const niv = planCourant().niveaux[Math.min(etat.iniv, nbNiv() - 1)];
        etat.fonds[etat.iniv] = {src: cv.toDataURL('image/jpeg', .85), ratio: cv.height / cv.width,
                                 largeur: niv.W, dx: 0, dy: 0, opacite: .5};
        etat.vue = '2d';
        sauverFonds();
        rendre();
        toast('Image posée en calque. Réglez sa largeur réelle, puis tirez les murs pour la suivre.');
      };
      img.onerror = () => toast('Cette image n\'a pas pu être lue.');
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  }

  function ouvertureSel() {
    const r = etat.res;
    if (!r || !etat.selOuv) return null;
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    return (niv.portes || []).concat(niv.fenetres || []).find(o => o.cle === etat.selOuv) || null;
  }

  /* ---------- La liste des pièces ---------- */
  function listePieces() {
    const r = etat.res;
    if (!r) return '';
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    let s = '<div class="pieces">';
    parPiece(niv).sort((a, b) => b.aire - a.aire).forEach(gp => {
      const cs = gp.grand;
      const p = cs.piece, d = NP.CAT[p.type];
      const z = NP.CAT[p.type].zone;
      const etroit = Math.min(cs.w, cs.h) < d.cote - .06;
      s += '<div class="pc' + (etat.sel === p.id ? ' sel' : '') + '" data-id="' + p.id + '" data-glisse="1">' +
        '<div class="t"><span class="em">' + d.emoji + '</span>' +
        '<input type="text" value="' + esc(p.nom) + '" data-nom="' + p.id + '" title="Renommer">' +
        (v.niveaux.length > 1 ? '<button class="sup mv" data-mv="' + p.id + '" title="Envoyer à l\'autre niveau">⇅</button>' : '') +
        '<button class="sup" data-sup="' + p.id + '" title="Supprimer">✕</button></div>' +
        (etat.m2 ? '<div class="m"><b class="surf-pc">' + m2(gp.aire) + '</b>' +
          '<span class="dims">' + (gp.cases.length > 1 ? (gp.cases.length === 2 ? 'forme en L' : 'forme libre') : nd(cs.w) + ' × ' + nd(cs.h) + ' m') + '</span></div>' : '') +
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
        '<select class="mini-sel z-' + z + '" data-type="' + p.id + '" title="Type de pièce">' +
        TYPES_PIECES.map(t => '<option value="' + t + '"' + (t === p.type ? ' selected' : '') + '>' +
          NP.CAT[t].emoji + ' ' + NP.CAT[t].nom + '</option>').join('') + '</select>' +
        (p.type === 'escalier'
          ? '<select class="mini-sel" data-forme="' + p.id + '" title="Forme de l\'escalier">' +
            Object.keys(NP.ESCALIERS).map(f => '<option value="' + f + '"' + ((p.forme || 'droit') === f ? ' selected' : '') + '>' +
              NP.ESCALIERS[f].emoji + ' ' + NP.ESCALIERS[f].nom + '</option>').join('') + '</select>'
          : '') +
        (etroit ? '<span class="info-etroit" title="Plus étroite que l\'usage courant — c\'est faisable, à vérifier">étroite</span>' : '') +
        (cs.dessertie === 'hote'
          ? '<span class="z" style="background:transparent;color:var(--ink-3);letter-spacing:0;text-transform:none;font-weight:400">ouvre sur ' + esc(cs.hote) + '</span>'
          : (cs.dessertie && cs.dessertie !== 'circ'
            ? '<span class="alerte">porte sur ' + esc(cs.dessertie) + '</span>' : '')) +
        '</div></div>';
    });
    s += '</div>';
    const hote = etat.sel && niv.cases.find(k => k.piece.id === etat.sel);
    s += '<div class="ajout" style="margin-top:14px"><select id="add-type">' +
      NP.AJOUTABLES.map(t => '<option value="' + t + '">' + NP.CAT[t].emoji + ' ' + NP.CAT[t].nom + '</option>').join('') +
      '</select><button class="addbtn" id="add-go">+ Ajouter ' +
      (hote ? 'en la prenant sur « ' + esc(hote.piece.nom) + ' »' : 'à ce niveau') + '</button>' +
      '<span class="aide">Sélectionnez d\'abord une pièce pour y découper la nouvelle.</span></div>';
    /* L'emprise, au centimètre : pour reprendre une maison existante. */
    s += '<div class="emprise"><span class="lab">📏 Emprise du logement</span>' +
      '<input type="text" inputmode="decimal" id="emp-l" value="' + nd(niv.W) + '"> m <span>×</span> ' +
      '<input type="text" inputmode="decimal" id="emp-p" value="' + nd(niv.H) + '"> m' +
      '<span class="aide">Tapez des cotes exactes, ou tirez directement les façades sur le plan. ' +
      'Tous les niveaux suivent.</span></div>';
    return s;
  }

  /* ---------- Le tableau des surfaces ---------- */
  function tableauSurfaces(v, papier) {
    const c = etat.criteres;
    let s = '<table class="surf"><thead><tr><th>Pièce</th><th>Niveau</th><th class="n">Dimensions</th><th class="n">Surface</th></tr></thead><tbody>';
    let tot = 0;
    v.niveaux.forEach(niv => {
      parPiece(niv).sort((a, b) => b.aire - a.aire).forEach(gp => {
        const cs = gp.grand;
        const z = NP.CAT[cs.piece.type].zone;
        const coul = (papier ? PAPIER : ECRAN)[ZONE_COUL[z] || 'serv'];
        tot += gp.aire;
        s += '<tr><td><span class="pastille" style="background:' + coul + '"></span>' +
          NP.CAT[cs.piece.type].emoji + ' ' + esc(cs.piece.nom) + '</td>' +
          '<td>' + (v.niveaux.length > 1 ? nomNiveau(niv.niveau, v.niveaux.length) : '—') + '</td>' +
          '<td class="n">' + (gp.cases.length > 1 ? (gp.cases.length === 2 ? 'forme en L' : 'forme libre') : nd(cs.w) + ' × ' + nd(cs.h) + ' m') + '</td>' +
          '<td class="n">' + m2(gp.aire) + '</td></tr>';
      });
    });
    s += '<tr class="tot"><td>Surface habitable</td><td></td><td class="n"></td><td class="n">' + m2(tot) + '</td></tr>';
    const ext = [];
    /* Les annexes réellement dessinées (garage, terrasse…), avec leurs cotes. */
    v.niveaux.forEach(niv => (niv.ext || []).filter(e => e.genre !== 'jardin').forEach(e => {
      ext.push([(e.emoji || '') + ' ' + esc(e.nom), e.w * e.h, nd(e.w) + ' × ' + nd(e.h) + ' m']);
    }));
    if (c.jardin > 0 && c.type !== 'appartement') ext.push(['🌳 Jardin', c.jardin]);
    ext.forEach(e => {
      s += '<tr><td>' + e[0] + '</td><td>extérieur</td><td class="n">' + (e[2] || '') + '</td><td class="n">' + m2(e[1]) + '</td></tr>';
    });
    return s + '</tbody></table>';
  }

  /* ---------- Les feuilles imprimées ---------- */
  function feuilles() {
    const r = etat.res, c = etat.criteres;
    if (!r || !r.variantes.length) return '';
    const v = planCourant();
    const date = new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: 'long', year: 'numeric'});
    const titre = c.nom || 'Projet sans nom';
    const entete = (sous) => '<div class="fhd"><div><div class="ft">Nao<span style="color:#5B45A8">Plan</span> — ' +
      esc(titre) + '</div><div class="fs">' + sous + '</div></div>' +
      '<div class="fr">Variante ' + v.cle + ' · ' + esc(v.nom) + '<br>' + date + '</div></div>';
    const pied = '<div class="pied-feuille"><span>Plan indicatif — surfaces mesurées d\'axe en axe, ' +
      'hors épaisseur des cloisons et hors normes réglementaires.</span>' +
      '<span class="r">NaoPlan · NaoGroup</span></div>';

    let s = '';
    v.niveaux.forEach(niv => {
      s += '<div class="feuille">' + entete(
        (nbNiv() > 1 ? nomNiveau(niv.niveau, nbNiv()) + ' — ' : '') +
        TYPES.filter(t => t.cle === c.type)[0].nom + ' · ' + Math.round(c.surface) + ' m² · ' +
        c.chambres + (c.chambres > 1 ? ' chambres' : ' chambre')) +
        '<div class="fbd">' + dessin(niv, 'papier', {uid: 'f'}) + '</div>' + pied + '</div>';
    });

    /* La maquette, niveau par niveau, puis la façade choisie. */
    v.niveaux.forEach(niv => {
      s += '<div class="feuille">' + entete('Maquette 3D' +
        (nbNiv() > 1 ? ' — ' + nomNiveau(niv.niveau, nbNiv()) : '')) +
        '<div class="fbd">' + vue3d(niv, 'papier') + '</div>' + pied + '</div>';
    });
    s += '<div class="feuille">' + entete('Façade ' + NP3D.COTES[c.facade || 'S'].nom) +
      '<div class="fbd">' + facadeSvg('papier') + '</div>' + pied + '</div>';

    s += '<div class="feuille">' + entete('Surfaces et critères') + '<div class="deux" style="flex:1">' +
      '<div>' + tableauSurfaces(v, true) + '</div>' +
      '<div class="rec">' + recap() + '</div></div>' + pied + '</div>';
    /* Le récapitulatif complet : projet, critères détaillés, aménagement, ambiances. */
    s += '<div class="feuille">' + entete('Récapitulatif du projet') + '<div class="recap" style="flex:1">' + recapHtml(true) + '</div>' + pied + '</div>';
    return s;
  }

  function recap() {
    const c = etat.criteres, r = etat.res;
    const oui = b => b ? 'oui' : 'non';
    let s = '<b>Le programme demandé</b><br>';
    s += 'Type : <b>' + TYPES.filter(t => t.cle === c.type)[0].nom + '</b><br>';
    s += 'Surface habitable : <b>' + Math.round(c.surface) + ' m²</b> sur <b>' + nbNiv() +
      (nbNiv() > 1 ? ' niveaux' : ' niveau') + '</b><br>';
    s += 'Chambres : <b>' + c.chambres + '</b> · Salles de bain : <b>' + c.sdb + '</b><br>';
    s += 'Cuisine ouverte : <b>' + oui(c.cuisineOuverte) + '</b> · WC séparé : <b>' + oui(c.wcSepare) + '</b><br>';
    s += 'Cellier : <b>' + oui(c.cellier) + '</b> · Buanderie : <b>' + oui(c.buanderie) +
      '</b> · Bureau : <b>' + oui(c.bureau) + '</b><br>';
    if (c.terrasse > 0) s += 'Terrasse : <b>' + Math.round(c.terrasse) + ' m²</b><br>';
    if (c.jardin > 0 && c.type !== 'appartement') s += 'Jardin : <b>' + Math.round(c.jardin) + ' m²</b><br>';
    if (c.garage) s += 'Garage : <b>' + (c.garageDouble ? 'double' : 'simple') + '</b><br>';
    s += '<br><b>Comment lire ce plan</b><br>' +
      'Les surfaces sont mesurées d\'axe en axe : elles ne tiennent pas compte de l\'épaisseur ' +
      'réelle des cloisons, et ne valent pas mesurage Carrez. Les murs porteurs, la structure, ' +
      'les réseaux et les règles d\'urbanisme restent à valider par un professionnel.<br><br>' +
      '<b>Les variantes</b><br>';
    r.variantes.forEach(v => { s += 'Variante <b>' + v.cle + '</b> — ' + esc(v.nom) + ' : ' + esc(v.note) + '<br>'; });
    return s;
  }

  /* ============================================================
     LE RENDU COMPLET
     ============================================================ */
  /* Redessine le seul plan, sans toucher aux barres : utile quand on
     tient un curseur de réglage qu'il ne faut pas reconstruire. */
  function sceneSeule() {
    const v0 = planCourant();
    const nv = v0.niveaux[Math.min(etat.iniv, v0.niveaux.length - 1)];
    el('scene').innerHTML = dessin(nv, 'ecran', {calque: calque(v0, etat.iniv)});
    brancherPlan();
  }

  function rendre(rapide) {
    /* La scène porte l'outil en cours : c'est lui qui choisit le curseur. */
    el('scene').className = 'scene outil-' + (etat.vue === '2d' ? etat.outil : 'vue');
    const r = etat.res;
    if (rapide) {
      const v0 = planCourant();
      const nv = v0.niveaux[Math.min(etat.iniv, v0.niveaux.length - 1)];
      el('scene').innerHTML = etat.vue === '3d' ? vue3d(nv, 'ecran')
        : etat.vue === 'fa' ? facadeSvg('ecran')
        : dessin(nv, 'ecran', {calque: calque(v0, etat.iniv)});
      el('barre-ouv').innerHTML = barreOuverture() + barreAnnexe() + barreMur() + barreMeuble();
      brancherPlan();
      return;
    }
    el('kpis').innerHTML = kpis();
    el('choix-plan').innerHTML = choixPlan();
    el('barre-plan').innerHTML = barrePlan();

    let av = '';
    const vc = planCourant();
    if (vc && vc.niveaux.some(n => n.decale)) {
      av += '<div class="avert"><span>🪜</span><div>Dans cette variante, les escaliers des deux niveaux ' +
        'ne tombent pas exactement l\'un au-dessus de l\'autre. Essayez une autre variante, ou remettez ' +
        'des pièces de service (WC, palier, cellier) dans la bande de circulation.</div></div>';
    }
    (r.diagnostics || []).forEach(d => {
      av += '<div class="avert"><span>' + (d.genre === 'alerte' ? '⚠️' : 'ℹ️') + '</span><div>' + esc(d.texte) + '</div></div>';
    });
    el('avertissements').innerHTML = av;

    if (!r.variantes.length) { el('scene').innerHTML = ''; return; }
    etat.iv = Math.min(etat.iv, r.variantes.length - 1);
    const v = planCourant();
    etat.iniv = Math.min(etat.iniv, v.niveaux.length - 1);
    const niv = v.niveaux[etat.iniv];

    el('scene').innerHTML =
      etat.vue === '3d' ? vue3d(niv, 'ecran')
      : etat.vue === 'fa' ? facadeSvg('ecran')
      : dessin(niv, 'ecran', {calque: calque(v, etat.iniv)});
    el('barre-ouv').innerHTML = barreOuverture() + barreAnnexe() + barreMur() + barreMeuble();
    el('legende').innerHTML = legende();
    el('liste-pieces').innerHTML = listePieces();
    el('surfaces').innerHTML = tableauSurfaces(v, false);
    rendreGouttiere();
    el('feuilles').innerHTML = feuilles();
    brancherPlan();
  }

  /* Le niveau voisin, à montrer en transparence sous le niveau
     affiché — seulement si l'utilisateur le demande. */
  function calque(v, i) {
    if (!etat.criteres.calque || v.niveaux.length < 2) return null;
    return v.niveaux[i === 0 ? 1 : 0] || null;
  }

  function legende() {
    const L = [['jour', 'Jour'], ['nuit', 'Nuit'], ['eau', 'Salles d\'eau'], ['circ', 'Circulation'],
               ['serv', 'Service'], ['ext', 'Extérieur']];
    const aide = etat.etape === 3 && etat.vue === '2d' ? 'Plan en lecture seule — choisissez une variante ci-dessus, ou personnalisez-la (étape 4)'
      : etat.etape === 5 && etat.vue === '2d' ? 'Glissez un meuble du catalogue sur le plan · R pour pivoter · Suppr pour l\'enlever'
      : etat.vue === '2d'
      ? 'Glissez une pièce sur une autre pour les échanger · tirez un mur pour le déplacer · cliquez une porte pour la régler'
      : etat.vue === '3d' ? 'Murs coupés à 1,25 m pour voir l\'intérieur — revenez au plan pour modifier'
      : 'Élévation : hauteurs d\'allège et de faîtage — revenez au plan pour modifier';
    return L.map(x => '<span><i style="background:var(--p-' + x[0] + ')"></i>' + x[1] + '</span>').join('') +
      '<span class="right" style="margin-left:auto">' + aide + '</span>';
  }

  /* ============================================================
     LE MODE CONSTRUCTION
     ------------------------------------------------------------
     Comme dans un jeu de construction : on choisit un outil, puis on
     agit sur le plan.
       ✋ Déplacer      — glisser une pièce sur une autre (elles
                          s'échangent), tirer un mur, faire glisser
                          une porte ou une fenêtre, même sur un autre mur
       🧱 Tracer un mur — tirer un trait dans une pièce : elle se coupe
       🧽 Effacer un mur — cliquer un mur : les deux pièces fusionnent
       🚪 🪟 🌅          — cliquer un mur pour y poser une porte, une
                          fenêtre, une baie vitrée
     Échap revient à ✋ ; Suppr enlève l'ouverture sélectionnée ; R la
     fait tourner.
     ============================================================ */
  const OUTILS = [
    ['main', '✋', 'Déplacer'], ['mur', '🧱', 'Tracer un mur'], ['gomme', '🧽', 'Effacer'],
    ['porte', '🚪', 'Porte'], ['fenetre', '🪟', 'Fenêtre'], ['baie', '🌅', 'Baie vitrée'], ['garage', '🚗', 'Porte de garage'], ['meubler', '🛋️', 'Aménager']
  ];
  etat.outil = 'main';
  let glisse = null;

  /* Convertit un point de l'écran en mètres, dans le repère du plan. */
  function versPlan(e) {
    const svg = document.querySelector('#scene svg');
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const vb = svg.getAttribute('viewBox').split(/\s+/).map(parseFloat);
    /* preserveAspectRatio="xMidYMid meet" : on retrouve l'échelle réelle. */
    const k = Math.min(r.width / vb[2], r.height / vb[3]);
    const ox = r.left + (r.width - vb[2] * k) / 2;
    const oy = r.top + (r.height - vb[3] * k) / 2;
    return {x: vb[0] + (e.clientX - ox) / k, y: vb[1] + (e.clientY - oy) / k, k: k, ox: ox, oy: oy, vb: vb};
  }
  /* Et l'inverse : des mètres vers l'écran (pour les effets). */
  function versEcran(x, y) {
    const svg = document.querySelector('#scene svg');
    if (!svg) return {x: 0, y: 0};
    const r = svg.getBoundingClientRect();
    const vb = svg.getAttribute('viewBox').split(/\s+/).map(parseFloat);
    const k = Math.min(r.width / vb[2], r.height / vb[3]);
    return {x: r.left + (r.width - vb[2] * k) / 2 + (x - vb[0]) * k, y: r.top + (r.height - vb[3] * k) / 2 + (y - vb[1]) * k};
  }

  /* Anciens branchements par élément : tout passe désormais par une
     délégation posée une fois sur la scène (voir brancher()). */
  function brancherPlan() { /* rien à rebrancher après un rendu */ }

  /* ============================================================
     LES ANIMATIONS
     Chaque retouche se voit : les pièces glissent de leur ancienne
     place vers la nouvelle (on les « morphe »), les murs réapparaissent
     en fondu, et une gerbe d'étincelles lilas salue le geste — des
     étoiles et une onde, pas des confettis.
     ============================================================ */
  const calme = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Photographie des rectangles affichés, avant une retouche. */
  function photo() {
    const out = {}, cpt = {};
    document.querySelectorAll('#scene .piece').forEach(g => {
      const r = g.querySelector('.fond-piece');
      if (!r) return;
      const id = g.getAttribute('data-id'); cpt[id] = (cpt[id] || 0) + 1;
      out[id + '#' + cpt[id]] = {x: +r.getAttribute('x'), y: +r.getAttribute('y'),
                                        w: +r.getAttribute('width'), h: +r.getAttribute('height')};
    });
    return out;
  }

  /* Après le rendu : chaque pièce part de son ancienne place. */
  function animer(avant, opts) {
    if (calme() || !avant) return;
    opts = opts || {};
    const svg = document.querySelector('#scene svg');
    if (!svg) return;
    let bouge = 0;
    const cpt = {};
    svg.querySelectorAll('.piece').forEach(g => {
      const id = g.getAttribute('data-id');
      const r = g.querySelector('.fond-piece');
      if (!r) return;
      const n = {x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height')};
      cpt[id] = (cpt[id] || 0) + 1;
      const a = avant[id + '#' + cpt[id]];
      let de = null;
      if (opts.depuis && opts.depuis.id === id) {
        /* La pièce qu'on vient de lâcher renaît du point de dépôt. */
        const s = .1, p = opts.depuis;
        de = 'translate(' + (p.x - n.x - n.w * s / 2) + 'px,' + (p.y - n.y - n.h * s / 2) + 'px) scale(' + s + ')';
      } else if (!a) {
        de = 'translate(' + (n.w * .2) + 'px,' + (n.h * .2) + 'px) scale(.6)';
      } else if (Math.abs(a.x - n.x) + Math.abs(a.y - n.y) + Math.abs(a.w - n.w) + Math.abs(a.h - n.h) > .01) {
        de = 'translate(' + (a.x - n.x) + 'px,' + (a.y - n.y) + 'px) scale(' + (a.w / n.w) + ',' + (a.h / n.h) + ')';
      }
      if (!de) return;
      bouge++;
      r.animate([{transform: de, opacity: .55}, {transform: 'none', opacity: 1}],
        {duration: opts.depuis && opts.depuis.id === id ? 560 : 460, easing: 'cubic-bezier(.2,.9,.25,1.12)'});
      g.animate([{filter: 'brightness(1.08)'}, {filter: 'none'}], {duration: 700});
    });
    if (bouge) {
      /* Les murs, le mobilier et les noms reviennent en fondu, une fois
         les pièces en place : sinon ils sauteraient avant elles. */
      Array.from(svg.children).forEach(n => {
        if (n.classList && n.classList.contains('piece')) return;
        if (n.tagName === 'defs') return;
        n.animate([{opacity: .15}, {opacity: .15, offset: .45}, {opacity: 1}], {duration: 520, easing: 'ease-out'});
      });
    }
  }

  /* La gerbe : une onde qui s'élargit et une dizaine d'étoiles. */
  function etincelles(x, y, force) {
    if (calme()) return;
    const n = Math.round(10 * (force || 1));
    const box = document.createElement('div');
    box.className = 'etincelles';
    box.style.left = x + 'px'; box.style.top = y + 'px';
    const onde = document.createElement('i');
    onde.className = 'onde';
    box.appendChild(onde);
    onde.animate([{transform: 'translate(-50%,-50%) scale(.2)', opacity: .9},
                  {transform: 'translate(-50%,-50%) scale(' + (2.2 * (force || 1)) + ')', opacity: 0}],
      {duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)'});
    for (let i = 0; i < n; i++) {
      const s = document.createElement('b');
      s.textContent = i % 3 ? '✦' : '✧';
      s.style.color = ['var(--accent)', 'var(--accent-2)', '#fff', 'var(--halo-2)'][i % 4];
      s.style.fontSize = (9 + Math.random() * 9) + 'px';
      box.appendChild(s);
      const ang = (i / n) * Math.PI * 2 + Math.random() * .5;
      const d = (38 + Math.random() * 34) * (force || 1);
      s.animate([
        {transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 0},
        {transform: 'translate(calc(-50% + ' + Math.cos(ang) * d * .55 + 'px), calc(-50% + ' + Math.sin(ang) * d * .55 + 'px)) scale(1.1) rotate(90deg)', opacity: 1, offset: .35},
        {transform: 'translate(calc(-50% + ' + Math.cos(ang) * d + 'px), calc(-50% + ' + (Math.sin(ang) * d - 10) + 'px)) scale(.4) rotate(200deg)', opacity: 0}
      ], {duration: 700 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.3,1)'});
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1100);
  }
  const etincellesPlan = (x, y, f) => { const p = versEcran(x, y); etincelles(p.x, p.y, f); };

  /* Une retouche de « Mon plan » avec son animation. */
  function appliquer(action, opts) {
    const avant = photo();
    const r = action();
    if (r === false) return false;
    perime();
    sauver();
    rendre();
    animer(avant, opts);
    return r;
  }

  /* Après toute retouche de « Mon plan » : on remonte et on redessine. */
  function majPerso(rapide) {
    perime();
    if (!rapide) sauver();
    rendre(rapide);
  }

  function selectionner(id) {
    etat.sel = (etat.sel === id) ? null : id;
    etat.selOuv = etat.selAnnexe = etat.selMeuble = null;
    rendre();
  }

  /* ============================================================
     LE POINTEUR SUR LA SCÈNE — une seule entrée, qui aiguille selon
     l'outil et ce qu'on touche.
     ============================================================ */
  function surScene(e) {
    if (etat.vue !== '2d' || e.button > 0) return;
    /* Étape 3 : les plans proposés se regardent, ils ne se modifient pas. */
    if (etat.etape === 3 || etat.etape === 6) return;
    const t = e.target;
    const p = versPlan(e);
    if (!p) return;
    const outil = etat.outil;
    /* La croix rouge d'une ouverture sélectionnée : suppression immédiate. */
    const sx = t.closest && t.closest('.sup-ouv');
    if (sx) { e.preventDefault(); e.stopPropagation(); effacerOuverture(sx.getAttribute('data-ouv'), e); return; }
    if (outil === 'porte' || outil === 'fenetre' || outil === 'baie' || outil === 'garage') { e.preventDefault(); poser(outil, p); return; }
    if (outil === 'gomme') {
      /* L'outil « Effacer » : porte, fenêtre, annexe ou mur — ce qu'on vise. */
      e.preventDefault();
      const mx = t.closest && t.closest('.meuble[data-meuble]');
      if (mx) {
        etat.selMeuble = mx.getAttribute('data-meuble');
        actionMeuble('sup');
        etincelles(e.clientX, e.clientY, .5);
        return;
      }
      const ov = t.closest && t.closest('.ouv');
      if (ov) { effacerOuverture(ov.getAttribute('data-ouv'), e); return; }
      const an = t.closest && t.closest('.annexe');
      if (an) {
        etat.selAnnexe = an.getAttribute('data-annexe');
        actionAnnexe('sup');
        etincelles(e.clientX, e.clientY, .6);
        return;
      }
      const h = t.closest && t.closest('.poignee');
      if (h) gommer(h, p); else toast('Visez une porte, une fenêtre, un garage ou un mur : il se colore en rouge sous l\'outil.');
      return;
    }
    if (outil === 'mur') { e.preventDefault(); debutTrace(e, p); return; }
    /* Les meubles posés : on les saisit avec la main comme en mode Aménager. */
    const pm = t.closest && t.closest('.poignee-meuble');
    if (pm) { debutMeuble(e, pm.getAttribute('data-meuble'), pm.getAttribute('data-cote')); return; }
    const mb = t.closest && t.closest('.meuble[data-meuble]');
    if (mb) { debutMeuble(e, mb.getAttribute('data-meuble'), null); return; }
    if (outil === 'meubler') {
      /* En mode Aménager, les pièces et les murs ne bougent pas : on ne
         déplace que ce qu'on pose (meubles, piscine, terrasse…). */
      e.preventDefault();
      if (etat.arme) { placerNouveau(etat.arme, p); return; }
      const pa2 = t.closest && t.closest('.poignee-annexe');
      if (pa2) { debutAnnexe(e, pa2.getAttribute('data-annexe'), pa2.getAttribute('data-cote')); return; }
      const an2 = t.closest && t.closest('.annexe');
      if (an2) { debutAnnexe(e, an2.getAttribute('data-annexe'), null); return; }
      if (etat.selMeuble || etat.selAnnexe) { etat.selMeuble = etat.selAnnexe = null; rendre(); }
      return;
    }
    const pa = t.closest && t.closest('.poignee-annexe');
    if (pa) { debutAnnexe(e, pa.getAttribute('data-annexe'), pa.getAttribute('data-cote')); return; }
    const an = t.closest && t.closest('.annexe');
    if (an) { debutAnnexe(e, an.getAttribute('data-annexe'), null); return; }
    const o = t.closest && t.closest('.ouv');
    if (o) { debutGlisseOuv(e, o); return; }
    const h = t.closest && t.closest('.poignee');
    if (h) { debutGlisseMur(e, h); return; }
    const pc = t.closest && t.closest('.piece');
    if (pc) { debutGlisse(e, pc); return; }
    if (etat.sel || etat.selOuv || etat.selAnnexe || etat.selMur || etat.selMeuble) { etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = etat.selMeuble = null; rendre(); }
  }

  /* ---------- Poser une porte, une fenêtre, une baie ---------- */
  function poser(type, p) {
    assurerPerso();
    const pn = niveauPerso();
    let o = null;
    const ok = appliquer(() => {
      o = NP.poserOuverture(pn, type, p.x, p.y);
      if (!o) return false;
      etat.selOuv = o.id;
      etat.sel = null;
      return true;
    });
    if (!ok) { toast('Cliquez plus près d\'un mur pour y poser ' + (type === 'porte' ? 'la porte.' : 'l\'ouverture.')); return; }
    etincellesPlan(o.axe === 'v' ? o.pos : o.c, o.axe === 'v' ? o.c : o.pos, .8);
  }

  /* ---------- Effacer un mur ---------- */
  function gommer(h, p) {
    const axe = h.getAttribute('data-axe'), pos = +h.getAttribute('data-pos');
    assurerPerso();
    const pn = niveauPerso();
    let res = null;
    appliquer(() => {
      res = NP.effacerMur(pn, axe, pos, axe === 'v' ? p.y : p.x);
      if (res.erreur) return false;
      const i = etat.perso.pieces.findIndex(x => x.id === res.retire);
      const nom = i >= 0 ? etat.perso.pieces[i].nom : '';
      if (i >= 0) etat.perso.pieces.splice(i, 1);
      res.nom = nom;
      return true;
    });
    if (res && res.erreur) { toast(res.erreur); return; }
    etincellesPlan(p.x, p.y, 1.1);
    if (res.facade) toast('Mur de façade ouvert sur l\'extérieur. Cliquez l\'ouverture pour le rebâtir.');
    else toast('Mur effacé' + (res.nom ? ' — « ' + res.nom + ' » ne fait plus qu\'une pièce avec sa voisine.' : '.'));
  }

  /* ---------- Tracer un mur ---------- */
  function caseSous(pn, p) {
    return pn.cases.find(k => p.x >= k.x && p.x <= k.x + k.w && p.y >= k.y && p.y <= k.y + k.h);
  }
  function debutTrace(e, p) {
    assurerPerso();
    const pn = niveauPerso();
    const k = caseSous(pn, p);
    if (!k) { toast('Commencez le trait à l\'intérieur d\'une pièce.'); return; }
    glisse = {quoi: 'trace', k: {x: k.x, y: k.y, w: k.w, h: k.h}, id: k.id, p0: p, x: e.clientX, y: e.clientY, axe: null, pos: null};
    window.addEventListener('pointermove', pendantTrace);
    window.addEventListener('pointerup', finTrace);
    pendantTrace(e);
  }
  function pendantTrace(e) {
    if (!glisse || glisse.quoi !== 'trace') return;
    const p = versPlan(e);
    if (!p) return;
    const g = glisse, k = g.k;
    const dx = p.x - g.p0.x, dy = p.y - g.p0.y;
    /* Le sens du geste dit le sens du mur ; un simple clic coupe la
       pièce dans sa longueur. */
    if (Math.abs(dx) + Math.abs(dy) < .25) g.axe = k.w >= k.h ? 'v' : 'h';
    else g.axe = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    g.pos = Math.round((g.axe === 'v' ? g.p0.x : g.p0.y) * 20) / 20;
    const svg = document.querySelector('#scene svg');
    let l = svg && svg.querySelector('.trace-mur');
    if (svg && !l) {
      l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      l.setAttribute('class', 'trace-mur');
      svg.appendChild(l);
    }
    if (l) {
      l.setAttribute('d', g.axe === 'v'
        ? 'M' + g.pos + ' ' + k.y + 'V' + (k.y + k.h)
        : 'M' + k.x + ' ' + g.pos + 'H' + (k.x + k.w));
    }
  }
  function finTrace() {
    window.removeEventListener('pointermove', pendantTrace);
    window.removeEventListener('pointerup', finTrace);
    if (!glisse || glisse.quoi !== 'trace') return;
    const g = glisse; glisse = null;
    const pn = niveauPerso();
    const neuve = NP.nouvellePiece('piece', {niveau: pn.niveau, nom: 'Nouvelle pièce'});
    const ok = appliquer(() => {
      if (!NP.scinder(pn, g.id, neuve.id, g.axe, g.pos, g.p0)) return false;
      etat.perso.pieces.push(neuve);
      etat.sel = neuve.id;
      return true;
    });
    if (!ok) { rendre(); toast('Trop près d\'un mur existant : laissez au moins 30 cm de chaque côté.'); return; }
    const c = g.k;
    etincellesPlan(g.axe === 'v' ? g.pos : c.x + c.w / 2, g.axe === 'v' ? c.y + c.h / 2 : g.pos, 1);
    toast('Mur tracé : une « Nouvelle pièce » est née, avec sa porte. Donnez-lui un type dans la liste.');
  }

  /* ---------- Tirer un mur ----------
     On repart à chaque mouvement de l'état du début du geste : on peut
     donc revenir en arrière en ramenant la souris, sans accumuler
     d'erreur. Aimantation au 5 cm. */
  function debutGlisseMur(e, n) {
    e.stopPropagation();
    e.preventDefault();
    const t = {axe: n.getAttribute('data-axe'), pos: +n.getAttribute('data-pos'),
               a: +n.getAttribute('data-a'), b: +n.getAttribute('data-b')};
    const perso = assurerPerso();
    const pn = niveauPerso();
    const L = t.axe === 'v' ? pn.W : pn.H;
    t.facade = Math.abs(t.pos) < .04 ? 'debut' : (Math.abs(t.pos - L) < .04 ? 'fin' : null);
    glisse = {quoi: 'mur', t: t, depart: NP.copie(perso), actif: false, x: e.clientX, y: e.clientY};
    document.body.classList.add('en-glisse', t.axe === 'v' ? 'glisse-v' : 'glisse-h');
    window.addEventListener('pointermove', pendantGlisseMur);
    window.addEventListener('pointerup', finGlisseMur);
  }

  function pendantGlisseMur(e) {
    if (!glisse || glisse.quoi !== 'mur') return;
    if (!glisse.actif && Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 3) return;
    glisse.actif = true;
    const p = versPlan(e);
    if (!p) return;
    const t = glisse.t;
    const nouv = Math.round((t.axe === 'v' ? p.x : p.y) * 20) / 20;
    etat.perso = NP.copie(glisse.depart);
    const pn = niveauPerso();
    const atteint = t.facade ? NP.deplacerFacade(etat.perso, t.axe, t.facade, nouv, Math.min(etat.iniv, etat.perso.niveaux.length - 1))
                             : NP.deplacerMur(pn, t.axe, t.pos, t.a, t.b, nouv);
    glisse.atteint = atteint;
    majPerso(true);
    /* Pendant le geste, la cote bouge avec la souris. */
    const bulle = el('bulle-mur');
    if (bulle) {
      const pn2 = niveauPerso();
      bulle.textContent = t.facade
        ? 'Emprise : ' + nd(pn2.W) + ' × ' + nd(pn2.H) + ' m'
        : (t.axe === 'v' ? 'x' : 'y') + ' = ' + nd(atteint) + ' m';
      bulle.style.left = (e.clientX + 14) + 'px';
      bulle.style.top = (e.clientY + 14) + 'px';
      bulle.classList.add('on');
    }
  }

  function finGlisseMur(e) {
    window.removeEventListener('pointermove', pendantGlisseMur);
    window.removeEventListener('pointerup', finGlisseMur);
    document.body.classList.remove('en-glisse', 'glisse-v', 'glisse-h');
    const b = el('bulle-mur');
    if (b) b.classList.remove('on');
    if (!glisse) return;
    const g = glisse; glisse = null;
    /* Un clic sans tirer, ou la fin d'un geste : le mur reste choisi, et
       sa barre permet de taper sa position exacte, au millimètre. */
    const t = g.t;
    const pn = niveauPerso();
    const pos = !g.actif ? t.pos : t.facade === 'fin' ? (t.axe === 'v' ? pn.W : pn.H) : t.facade ? 0 : (g.atteint != null ? g.atteint : t.pos);
    etat.selMur = {axe: t.axe, pos: pos, a: t.a, b: t.b, niv: pn.niveau};
    etat.sel = etat.selOuv = etat.selAnnexe = etat.selMeuble = null;
    majPerso();
    if (g.actif && e) etincelles(e.clientX, e.clientY, .6);
  }

  /* La barre du mur choisi : sa position exacte, des pas de 1 mm à 10 cm,
     et l'effacer. Aucune limite de principe : la cloison va où on la tape. */
  function barreMur() {
    const m = etat.selMur;
    if (!m || etat.vue !== '2d' || etat.sel || etat.selOuv || etat.selAnnexe || etat.selMeuble || !etat.perso) return '';
    const pn = niveauPerso();
    if (!pn || pn.niveau !== m.niv) return '';
    const L = m.axe === 'v' ? pn.W : pn.H;
    const facade = m.pos < .004 || Math.abs(m.pos - L) < .004;
    const mm = v => (Math.round(v * 1000) / 1000).toFixed(3).replace('.', ',');
    return '<div class="barre-ouv barre-mur">' +
      '<span class="qui"><b>🧱 ' + (facade ? 'Mur de façade' : m.axe === 'v' ? 'Cloison verticale' : 'Cloison horizontale') + '</b> — ' +
        'longueur ' + nd(m.b - m.a) + ' m</span>' +
      (facade
        ? '<label class="dim">' + (m.axe === 'v' ? 'Largeur' : 'Profondeur') + ' <input class="mm" type="text" inputmode="decimal" data-murval="emprise" value="' + mm(L) + '"> m</label>'
        : '<label class="dim">' + (m.axe === 'v' ? 'À ' : 'À ') + '<input class="mm" type="text" inputmode="decimal" data-murval="pos" value="' + mm(m.pos) + '"> m ' +
          (m.axe === 'v' ? 'du mur de gauche' : 'du mur du haut') + '</label>') +
      '<span class="pas">' +
        '<button class="mini-btn" data-muract="-0.1">−10 cm</button><button class="mini-btn" data-muract="-0.01">−1 cm</button>' +
        '<button class="mini-btn" data-muract="-0.001">−1 mm</button><button class="mini-btn" data-muract="0.001">+1 mm</button>' +
        '<button class="mini-btn" data-muract="0.01">+1 cm</button><button class="mini-btn" data-muract="0.1">+10 cm</button></span>' +
      '<button class="mini-btn danger" data-muract="sup" title="Effacer ce mur (Suppr)">✕ Effacer le mur</button>' +
      '</div>';
  }

  /* Place le mur choisi à une valeur exacte (en mètres). */
  function placerMur(nouv) {
    const m = etat.selMur;
    if (!m || !(nouv >= 0)) return;
    assurerPerso();
    const pn = niveauPerso();
    const L = m.axe === 'v' ? pn.W : pn.H;
    const facade = m.pos < .004 ? 'debut' : Math.abs(m.pos - L) < .004 ? 'fin' : null;
    nouv = Math.round(nouv * 1000) / 1000;
    appliquer(() => {
      if (facade) {
        NP.deplacerFacade(etat.perso, m.axe, facade, nouv, Math.min(etat.iniv, etat.perso.niveaux.length - 1));
        const p2 = niveauPerso();
        m.pos = facade === 'fin' ? (m.axe === 'v' ? p2.W : p2.H) : 0;
      } else {
        m.pos = NP.deplacerMur(pn, m.axe, m.pos, m.a, m.b, nouv);
      }
      return true;
    });
    if (!facade && Math.abs(m.pos - nouv) > .0005) toast('Le mur s\'est arrêté à ' + nd(m.pos) + ' m : une pièce serait passée sous 30 cm.');
  }

  function actionMur(act) {
    const m = etat.selMur;
    if (!m) return;
    if (act === 'sup') {
      const u = (m.a + m.b) / 2;
      const p = m.axe === 'v' ? {x: m.pos, y: u} : {x: u, y: m.pos};
      const h = {getAttribute: k => k === 'data-axe' ? m.axe : String(m.pos)};
      etat.selMur = null;
      gommer(h, p);
      return;
    }
    const pn = niveauPerso();
    const L = m.axe === 'v' ? pn.W : pn.H;
    const facade = m.pos < .004 || Math.abs(m.pos - L) < .004;
    const d = parseFloat(act);
    /* Pour une façade, les pas agissent sur la largeur (le mur du bas
       ou de droite s'éloigne) ; sinon sur la position de la cloison. */
    if (facade) placerMur(m.pos < .004 ? m.pos - d : L + d);
    else placerMur(m.pos + d);
  }

  /* ---------- Déplacer une pièce ----------
     Dès qu'on la saisit, la pièce se réduit en miniature sous le
     curseur ; lâchée sur une autre, elle y reprend sa taille en
     grandissant depuis le point de dépôt. */
  function debutGlisse(e, noeud) {
    if (e.target.closest && e.target.closest('input,button,select,textarea')) return;
    glisse = {quoi: 'piece', id: noeud.getAttribute('data-id'), x: e.clientX, y: e.clientY,
              actif: false, src: noeud, cible: null};
    window.addEventListener('pointermove', pendantGlisse);
    window.addEventListener('pointerup', finGlisse);
  }

  function fantome(id, src, e) {
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    const cs = niv.cases.find(k => k.piece.id === id);
    if (!cs) return null;
    const z = ZONE_COUL[NP.CAT[cs.piece.type].zone] || 'serv';
    const r = src.getBoundingClientRect();
    const ratio = cs.h / cs.w;
    const w = Math.max(70, Math.min(150, r.width * .38)), h = Math.max(46, Math.min(130, w * ratio));
    const f = document.createElement('div');
    f.className = 'fantome';
    f.style.width = w + 'px'; f.style.height = h + 'px';
    f.style.background = 'var(--p-' + z + ')';
    f.style.borderColor = 'var(--p-' + z + '-l)';
    f.innerHTML = '<span>' + NP.CAT[cs.piece.type].emoji + '</span><b>' + esc(cs.piece.nom) + '</b>';
    f.style.left = e.clientX + 'px'; f.style.top = e.clientY + 'px';
    document.body.appendChild(f);
    /* La miniature naît de la pièce elle-même : elle rétrécit vers le curseur. */
    if (!calme()) {
      f.animate([{transform: 'translate(-50%,-50%) scale(' + (r.width / w) + ',' + (r.height / h) + ')', opacity: .4},
                 {transform: 'translate(-50%,-50%) scale(1)', opacity: 1}], {duration: 260, easing: 'cubic-bezier(.2,.9,.3,1)'});
    }
    return f;
  }

  function pendantGlisse(e) {
    if (!glisse || glisse.quoi !== 'piece') return;
    if (!glisse.actif) {
      if (Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 7) return;
      glisse.actif = true;
      document.querySelectorAll('[data-id="' + glisse.id + '"]').forEach(n => n.classList.add('glisse'));
      document.body.classList.add('en-glisse');
      glisse.fantome = fantome(glisse.id, glisse.src, e);
    }
    if (glisse.fantome) {
      glisse.fantome.style.left = e.clientX + 'px';
      glisse.fantome.style.top = e.clientY + 'px';
    }
    const sous = document.elementFromPoint(e.clientX, e.clientY);
    const c = sous && sous.closest ? sous.closest('.piece,.pc') : null;
    const id = c && c.getAttribute('data-id');
    const ok = id && id !== glisse.id;
    if (glisse.cible !== (ok ? id : null)) {
      document.querySelectorAll('.cible').forEach(n => n.classList.remove('cible'));
      glisse.cible = ok ? id : null;
      if (glisse.cible) document.querySelectorAll('[data-id="' + glisse.cible + '"]').forEach(n => n.classList.add('cible'));
      if (glisse.fantome) glisse.fantome.classList.toggle('au-dessus', !!glisse.cible);
    }
  }

  function finGlisse(e) {
    window.removeEventListener('pointermove', pendantGlisse);
    window.removeEventListener('pointerup', finGlisse);
    document.querySelectorAll('.cible').forEach(n => n.classList.remove('cible'));
    document.body.classList.remove('en-glisse');
    if (!glisse) return;
    const g = glisse; glisse = null;
    document.querySelectorAll('.glisse').forEach(n => n.classList.remove('glisse'));
    if (g.fantome) {
      const f = g.fantome;
      if (!calme()) f.animate([{opacity: 1, transform: 'translate(-50%,-50%) scale(1)'},
                              {opacity: 0, transform: 'translate(-50%,-50%) scale(.3)'}], {duration: 180});
      setTimeout(() => f.remove(), 170);
    }
    if (!g.actif) { selectionner(g.id); return; }
    if (!g.cible) { toast('Lâchez la pièce sur une autre pour qu\'elles échangent leur place.'); return; }
    const perso = assurerPerso();
    const a = perso.pieces.find(p => p.id === g.id);
    const b = perso.pieces.find(p => p.id === g.cible);
    if (!a || !b) { rendre(); return; }
    /* Où a-t-on lâché ? C'est de là que la pièce renaît. */
    const p = e && versPlan(e);
    const pnS = niveauPerso();
    const mA = meublesDe(pnS, a.id), mB = meublesDe(pnS, b.id);
    const gA = grandeCase(pnS, a.id), gB = grandeCase(pnS, b.id);
    const cA = gA && {x: gA.x, y: gA.y, w: gA.w, h: gA.h}, cB = gB && {x: gB.x, y: gB.y, w: gB.w, h: gB.h};
    const ok = appliquer(() => {
      const r = NP.echangerCases(pnS, a.id, b.id);
      if (r) { demenager(pnS, mA, cA, cB); demenager(pnS, mB, cB, cA); }
      return r;
    },
      {depuis: p ? {id: a.id, x: p.x, y: p.y} : null});
    if (!ok) { rendre(); return; }
    if (e) etincelles(e.clientX, e.clientY, 1);
    toast('« ' + a.nom + ' » et « ' + b.nom + ' » ont échangé leur place — rien d\'autre n\'a bougé.');
  }

  /* ---------- Les portes et fenêtres ----------
     Dans une proposition, une ouverture est calculée ; pour la bouger,
     on fige d'abord le plan — elle devient alors un objet à part
     entière, qu'on peut porter sur n'importe quel mur. */
  function ouvertureFigee(cle) {
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    const o = (niv.portes || []).concat(niv.fenetres || []).find(x => x.cle === cle);
    assurerPerso();
    const pn = niveauPerso();
    if (!pn.ouvertures) pn.ouvertures = [];
    let f = pn.ouvertures.find(x => x.id === cle);
    if (!f && o) {
      f = pn.ouvertures.find(x => x.axe === o.axe && Math.abs(x.pos - o.pos) < .06 && Math.abs(x.c - o.c) < .06);
    }
    if (f) etat.selOuv = f.id;
    return f || null;
  }

  function debutGlisseOuv(e, noeud) {
    e.stopPropagation();
    e.preventDefault();
    glisse = {quoi: 'ouv', cle: noeud.getAttribute('data-ouv'), x: e.clientX, y: e.clientY, actif: false};
    window.addEventListener('pointermove', pendantGlisseOuv);
    window.addEventListener('pointerup', finGlisseOuv);
  }

  function pendantGlisseOuv(e) {
    if (!glisse || glisse.quoi !== 'ouv') return;
    if (!glisse.actif) {
      if (Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 5) return;
      glisse.actif = true;
      const f = ouvertureFigee(glisse.cle);
      if (!f) { glisse = null; return; }
      glisse.cle = f.id;
      document.body.classList.add('en-glisse');
    }
    const p = versPlan(e);
    if (!p) return;
    NP.deplacerOuverture(niveauPerso(), glisse.cle, p.x, p.y);
    etat.selOuv = glisse.cle;
    majPerso(true);
  }

  function finGlisseOuv(e) {
    window.removeEventListener('pointermove', pendantGlisseOuv);
    window.removeEventListener('pointerup', finGlisseOuv);
    document.body.classList.remove('en-glisse');
    if (!glisse) return;
    const g = glisse; glisse = null;
    if (!g.actif) { etat.selOuv = (etat.selOuv === g.cle) ? null : g.cle; etat.sel = null; rendre(); return; }
    majPerso();
    if (e) etincelles(e.clientX, e.clientY, .5);
  }

  /* ---------- Les annexes : garage, terrasse, abri… ----------
     On les attrape par le milieu pour les déplacer (elles s'aimantent
     aux façades), par un bord pour les étirer. Un clic les sélectionne. */
  function annexeFigee(id) {
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    const e = (niv.ext || []).find(x => x.id === id);
    assurerPerso();
    const pn = niveauPerso();
    if (!pn.annexes) pn.annexes = [];
    let a = pn.annexes.find(x => x.id === id);
    if (!a && e) a = pn.annexes.find(x => x.genre === e.genre && Math.abs(x.x - e.x) < .06 && Math.abs(x.y - e.y) < .06) ||
                     pn.annexes.find(x => x.genre === e.genre);
    /* Pas encore d'annexe correspondante : on la crée à partir de ce qui
       est dessiné, pour qu'aucune terrasse ni aucun garage ne reste figé. */
    if (!a && e) {
      a = {id: NP.idOuv(), genre: e.genre, nom: e.nom, x: e.x, y: e.y, w: e.w, h: e.h, forme: e.forme, pose: e.pose, porte: e.porte};
      pn.annexes.push(a);
      perime();
    }
    if (a) etat.selAnnexe = a.id;
    return a || null;
  }

  function debutAnnexe(e, id, cote) {
    e.stopPropagation();
    e.preventDefault();
    glisse = {quoi: 'annexe', id: id, cote: cote, x: e.clientX, y: e.clientY, actif: false};
    if (cote) document.body.classList.add('en-glisse', cote === 'e' || cote === 'o' ? 'glisse-v' : 'glisse-h');
    window.addEventListener('pointermove', pendantAnnexe);
    window.addEventListener('pointerup', finAnnexe);
  }

  function pendantAnnexe(e) {
    if (!glisse || glisse.quoi !== 'annexe') return;
    const p = versPlan(e);
    if (!p) return;
    if (!glisse.actif) {
      if (Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 5) return;
      glisse.actif = true;
      const a = annexeFigee(glisse.id);
      if (!a) { glisse = null; return; }
      glisse.id = a.id;
      glisse.dx = p.x - a.x; glisse.dy = p.y - a.y;
      etat.sel = etat.selOuv = etat.selMeuble = null;
      if (!glisse.cote) document.body.classList.add('en-glisse');
    }
    const pn = niveauPerso();
    let a;
    if (glisse.cote) a = NP.etirerAnnexe(pn, glisse.id, glisse.cote, glisse.cote === 'e' || glisse.cote === 'o' ? p.x : p.y);
    else a = NP.deplacerAnnexe(pn, glisse.id, p.x - glisse.dx, p.y - glisse.dy);
    majPerso(true);
    const bulle = el('bulle-mur');
    if (bulle && a) {
      bulle.textContent = a.nom + ' : ' + nd(a.w) + ' × ' + nd(a.h) + ' m';
      bulle.style.left = (e.clientX + 14) + 'px';
      bulle.style.top = (e.clientY + 14) + 'px';
      bulle.classList.add('on');
    }
  }

  function finAnnexe(e) {
    window.removeEventListener('pointermove', pendantAnnexe);
    window.removeEventListener('pointerup', finAnnexe);
    document.body.classList.remove('en-glisse', 'glisse-v', 'glisse-h');
    const b = el('bulle-mur');
    if (b) b.classList.remove('on');
    if (!glisse) return;
    const g = glisse; glisse = null;
    if (!g.actif) {
      /* Un simple clic : on sélectionne (dans une proposition, il faut
         d'abord la figer pour pouvoir agir dessus). */
      etat.selAnnexe = g.id;
      etat.sel = etat.selOuv = etat.selMeuble = null;
      rendre();
      return;
    }
    majPerso();
    if (e) etincelles(e.clientX, e.clientY, .7);
  }

  /* ============================================================
     L'AMÉNAGEMENT — les meubles qu'on pose soi-même
     ------------------------------------------------------------
     Un catalogue de meubles de base. On en glisse un sur le plan : il
     se tourne dos au mur le plus proche et s'y plaque. Ensuite on le
     déplace, on l'étire par ses poignées, on le fait pivoter (R), on
     l'ajuste au centimètre avec les flèches, on l'enlève (Suppr).
     ============================================================ */
  const cm = v => Math.round(v * 100);

  function catalogue() {
    let s = '<div class="catalogue" role="region" aria-label="Catalogue de meubles">' +
      '<div class="cat-rayons">' +
      NPM.CATS.map(c => '<button type="button" data-cat="' + c[0] + '" class="' + (c[0] === etat.cat ? 'on' : '') +
        '"><span class="em">' + c[1] + '</span> ' + c[2] + '</button>').join('') +
      '<span class="cat-actions">' +
      '<button type="button" class="mini-btn" data-meubact="auto" title="Un premier jet de meubles dans chaque pièce encore vide">✨ Meubler automatiquement</button>' +
      '<button type="button" class="mini-btn danger" data-meubact="vider" title="Retirer tous les meubles de ce niveau">🧹 Tout enlever</button>' +
      '</span></div><div class="cat-grille">';
    Object.keys(NPM.CATALOGUE).forEach(k => {
      const d = NPM.CATALOGUE[k];
      if (d.cat !== etat.cat) return;
      const dims = d.annexe ? nd(d.w) + ' × ' + nd(d.d) + ' m' : cm(d.w) + ' × ' + cm(d.d) + ' cm';
      s += '<button type="button" class="cat-item' + (etat.arme === k ? ' on' : '') + '" data-meuble-cat="' + k +
        '" title="' + esc(d.nom) + ' — ' + dims + '. Glissez-le sur le plan, ou cliquez-le puis cliquez sur le plan.">' +
        NPM.icone(k) + '<span>' + esc(d.nom) + '</span><small>' + dims + '</small></button>';
    });
    return s + '</div><div class="cat-aide">Glissez un meuble sur le plan : il se tourne dos au mur le plus proche et s\'y plaque. ' +
      'Ensuite : glisser pour déplacer (Alt : sans aimant), poignées pour étirer, R pour pivoter, flèches pour ajuster au centimètre, Suppr pour enlever.</div></div>';
  }

  function meubleSel() {
    const pn = etat.perso && niveauPerso();
    return pn ? (pn.meubles || []).find(m => m.id === etat.selMeuble) || null : null;
  }

  /* Pose un meuble (ou une piscine) du catalogue au point p du plan. */
  function placerNouveau(genre, p) {
    const def = NPM.CATALOGUE[genre];
    if (!def || !p) return;
    assurerPerso();
    const pn = niveauPerso();
    if (def.annexe) {
      let a = null;
      appliquer(() => {
        if (!pn.annexes) pn.annexes = [];
        a = {id: NP.idOuv(), genre: 'piscine', nom: def.nom, forme: def.annexe.forme, pose: def.annexe.pose,
             x: Math.round((p.x - def.w / 2) * 20) / 20, y: Math.round((p.y - def.d / 2) * 20) / 20, w: def.w, h: def.d};
        pn.annexes.push(a);
        etat.selAnnexe = a.id; etat.sel = etat.selOuv = etat.selMeuble = etat.selMur = null;
        return true;
      });
      etincellesPlan(p.x, p.y, 1.2);
      toast('« ' + def.nom + ' » posée. Choisissez sa forme et sa pose dans la barre, étirez-la par ses bords.');
      return;
    }
    let m = null;
    appliquer(() => {
      if (!pn.meubles) pn.meubles = [];
      m = {id: NP.idOuv(), genre: genre, cx: p.x, cy: p.y, w: def.w, d: def.d, rot: 0};
      if (!def.libre) NPM.orienter(pn, m);
      NPM.plaquer(pn, m, .2);
      pn.meubles.push(m);
      etat.selMeuble = m.id; etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = null;
      return true;
    });
    if (m) etincellesPlan(m.cx, m.cy, .8);
  }

  function actionMeuble(act, val) {
    const pn = etat.perso && niveauPerso();
    const m = meubleSel();
    if (!pn || !m) return;
    if (act === 'pousser') {
      m.cx = Math.round((m.cx + val[0]) * 1000) / 1000;
      m.cy = Math.round((m.cy + val[1]) * 1000) / 1000;
      majPerso();
      return;
    }
    appliquer(() => {
      if (act === 'sup') { pn.meubles.splice(pn.meubles.indexOf(m), 1); etat.selMeuble = null; }
      else if (act === 'pivoter') { m.rot = ((m.rot || 0) + 90) % 360; NPM.plaquer(pn, m, .2); }
      else if (act === 'dupliquer') {
        const c = Object.assign({}, m, {id: NP.idOuv(), cx: m.cx + .35, cy: m.cy + .35});
        pn.meubles.push(c);
        etat.selMeuble = c.id;
      } else if (act === 'w' || act === 'd') {
        const v = parseFloat(String(val).replace(',', '.')) / 100;
        if (!(v >= .05)) return false;
        m[act] = v;
      } else if (act === 'angle') {
        const v = parseFloat(String(val).replace(',', '.'));
        if (isNaN(v)) return false;
        m.rot = ((v % 360) + 360) % 360;
      }
      return true;
    });
    if (act === 'sup') toast('Meuble enlevé.');
    else if (act === 'dupliquer') { const c = meubleSel(); if (c) etincellesPlan(c.cx, c.cy, .6); }
  }

  function barreMeuble() {
    if (!etat.selMeuble || etat.vue !== '2d') return '';
    const m = meubleSel();
    if (!m) return '';
    const def = NPM.CATALOGUE[m.genre] || {nom: 'Meuble'};
    return '<div class="barre-ouv barre-meuble">' +
      '<span class="qui">' + NPM.icone(m.genre) + '<b>' + esc(def.nom) + '</b></span>' +
      '<label class="dim">L <input type="text" inputmode="decimal" data-meubdim="w" value="' + cm(m.w) + '"> cm</label>' +
      '<label class="dim">P <input type="text" inputmode="decimal" data-meubdim="d" value="' + cm(m.d) + '"> cm</label>' +
      '<label class="dim">∠ <input type="text" inputmode="decimal" data-meubdim="angle" value="' + Math.round(m.rot || 0) + '"> °</label>' +
      '<button class="mini-btn" data-meubact="pivoter" title="Un quart de tour (R)">↻ Pivoter</button>' +
      '<button class="mini-btn" data-meubact="dupliquer" title="Dupliquer (Ctrl+D)">⧉ Dupliquer</button>' +
      '<button class="mini-btn danger" data-meubact="sup" title="Enlever (Suppr)">✕ Enlever</button>' +
      '<span class="aide">Glissez-le (Alt : sans aimant) · poignées pour étirer · flèches : 1 cm, Maj : 10 cm</span>' +
      '</div>';
  }

  /* ---------- Déplacer, étirer un meuble posé ---------- */
  function debutMeuble(e, id, cote) {
    e.stopPropagation();
    e.preventDefault();
    const pn = etat.perso && niveauPerso();
    const m = pn && (pn.meubles || []).find(x => x.id === id);
    if (!m) return;
    const p = versPlan(e);
    glisse = {quoi: 'meuble', id: id, cote: cote, x: e.clientX, y: e.clientY, actif: false,
              dep: Object.assign({}, m), dx: p ? p.x - m.cx : 0, dy: p ? p.y - m.cy : 0};
    window.addEventListener('pointermove', pendantMeuble);
    window.addEventListener('pointerup', finMeuble);
  }

  function pendantMeuble(e) {
    if (!glisse || glisse.quoi !== 'meuble') return;
    if (!glisse.actif) {
      if (Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 4) return;
      glisse.actif = true;
      etat.selMeuble = glisse.id;
      etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = null;
      document.body.classList.add('en-glisse');
    }
    const p = versPlan(e);
    if (!p) return;
    const pn = niveauPerso();
    const m = (pn.meubles || []).find(x => x.id === glisse.id);
    if (!m) return;
    const g = glisse, d0 = g.dep;
    if (!g.cote) {
      m.cx = Math.round((p.x - g.dx) * 1000) / 1000;
      m.cy = Math.round((p.y - g.dy) * 1000) / 1000;
      if (!e.altKey) NPM.plaquer(pn, m, .15);
    } else {
      /* On étire depuis le bord opposé, qui reste en place. */
      const l = NPM.versLocal(d0, p.x, p.y);
      if (g.cote === 'e') {
        const w = Math.max(.1, Math.round((l.x + d0.w / 2) * 100) / 100);
        const c = NPM.versPlan(d0, (w - d0.w) / 2, 0);
        m.w = w; m.cx = c.x; m.cy = c.y;
      } else {
        const d = Math.max(.05, Math.round((l.y + d0.d / 2) * 100) / 100);
        const c = NPM.versPlan(d0, 0, (d - d0.d) / 2);
        m.d = d; m.cx = c.x; m.cy = c.y;
      }
    }
    majPerso(true);
    const bulle = el('bulle-mur');
    if (bulle) {
      bulle.textContent = (NPM.CATALOGUE[m.genre] || {nom: ''}).nom + ' : ' + cm(m.w) + ' × ' + cm(m.d) + ' cm';
      bulle.style.left = (e.clientX + 14) + 'px';
      bulle.style.top = (e.clientY + 14) + 'px';
      bulle.classList.add('on');
    }
  }

  function finMeuble(e) {
    window.removeEventListener('pointermove', pendantMeuble);
    window.removeEventListener('pointerup', finMeuble);
    document.body.classList.remove('en-glisse');
    const b = el('bulle-mur');
    if (b) b.classList.remove('on');
    if (!glisse || glisse.quoi !== 'meuble') return;
    const g = glisse; glisse = null;
    if (!g.actif) {
      etat.selMeuble = g.id;
      etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = null;
      rendre();
      return;
    }
    majPerso();
    if (e) etincelles(e.clientX, e.clientY, .5);
  }

  /* ---------- Du catalogue au plan ----------
     Glisser : une vignette suit le curseur, le meuble naît où on le
     lâche. Cliquer : le meuble est « armé », chaque clic sur le plan
     en pose un (Échap pour arrêter). */
  function surLePlan(e) {
    const svg = document.querySelector('#scene svg');
    if (!svg) return false;
    const r = svg.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }

  function debutCatalogue(e, genre) {
    e.preventDefault();
    glisse = {quoi: 'catalogue', genre: genre, x: e.clientX, y: e.clientY, actif: false};
    window.addEventListener('pointermove', pendantCatalogue);
    window.addEventListener('pointerup', finCatalogue);
  }

  function pendantCatalogue(e) {
    if (!glisse || glisse.quoi !== 'catalogue') return;
    if (!glisse.actif) {
      if (Math.abs(e.clientX - glisse.x) + Math.abs(e.clientY - glisse.y) < 5) return;
      glisse.actif = true;
      const f = document.createElement('div');
      f.className = 'fantome-meuble';
      f.innerHTML = NPM.icone(glisse.genre);
      document.body.appendChild(f);
      glisse.fantome = f;
      document.body.classList.add('en-glisse');
    }
    const f = glisse.fantome;
    f.style.left = e.clientX + 'px';
    f.style.top = e.clientY + 'px';
    f.classList.toggle('au-dessus', surLePlan(e));
  }

  function finCatalogue(e) {
    window.removeEventListener('pointermove', pendantCatalogue);
    window.removeEventListener('pointerup', finCatalogue);
    document.body.classList.remove('en-glisse');
    if (!glisse || glisse.quoi !== 'catalogue') return;
    const g = glisse; glisse = null;
    if (g.fantome) {
      const f = g.fantome;
      f.classList.add('pose');
      setTimeout(() => f.remove(), 180);
    }
    const def = NPM.CATALOGUE[g.genre];
    if (!g.actif) {
      etat.arme = etat.arme === g.genre ? null : g.genre;
      rendre();
      if (etat.arme) toast('« ' + def.nom + ' » en main : cliquez sur le plan pour le poser, autant de fois que voulu (Échap pour arrêter).');
      return;
    }
    if (etat.vue === '2d' && surLePlan(e)) placerNouveau(g.genre, versPlan(e));
    else toast('Lâchez le meuble sur le plan.');
  }

  /* ---------- Meubler d'un coup, tout enlever ---------- */
  function meublerAuto() {
    assurerPerso();
    const pn = niveauPerso();
    let nb = 0;
    appliquer(() => {
      if (!pn.meubles) pn.meubles = [];
      const neufs = NPM.suggerer(pn, etat.perso.pieces, NP.idOuv, NPM.occupees(pn));
      pn.meubles.push.apply(pn.meubles, neufs);
      nb = neufs.length;
      etat.selMeuble = null;
      return nb > 0;
    });
    if (!nb) { toast('Chaque pièce a déjà ses meubles — ou elles sont trop petites pour le jeu de base.'); return; }
    const s = document.querySelector('#scene svg');
    if (s) { const r = s.getBoundingClientRect(); etincelles(r.left + r.width / 2, r.top + r.height / 2, 1.6); }
    /* Chaque meuble arrive l'un après l'autre. */
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      document.querySelectorAll('#scene .meuble').forEach((g, i) => {
        g.animate([{opacity: 0}, {opacity: 1}], {duration: 320, delay: i * 45, easing: 'ease-out', fill: 'backwards'});
      });
    }
    toast(nb + ' meubles posés, pièce par pièce. Tout se déplace, s\'étire, pivote ou s\'enlève.');
  }

  function viderMeubles() {
    const pn = etat.perso && niveauPerso();
    if (!pn || !(pn.meubles || []).length) { toast('Aucun meuble posé sur ce niveau.'); return; }
    if (!confirm('Enlever les ' + pn.meubles.length + ' meubles de ce niveau ?')) return;
    appliquer(() => { pn.meubles = []; etat.selMeuble = null; return true; });
    toast('Niveau vidé de ses meubles.');
  }

  /* Quand deux pièces échangent leur place, leurs meubles déménagent avec elles. */
  function meublesDe(pn, id) {
    return (pn.meubles || []).filter(m => pn.cases.some(k => k.id === id &&
      m.cx >= k.x && m.cx <= k.x + k.w && m.cy >= k.y && m.cy <= k.y + k.h));
  }
  function grandeCase(pn, id) {
    return pn.cases.filter(k => k.id === id).sort((a, b) => b.w * b.h - a.w * a.h)[0];
  }
  function demenager(pn, liste, de, vers) {
    if (!de || !vers) return;
    const dx = (vers.x + vers.w / 2) - (de.x + de.w / 2), dy = (vers.y + vers.h / 2) - (de.y + de.h / 2);
    liste.forEach(m => {
      m.cx += dx; m.cy += dy;
      /* On le garde dans sa nouvelle pièce, puis on le recolle au mur. */
      const b = NPM.emprise(m);
      m.cx += Math.max(0, vers.x - b.x) - Math.max(0, b.x + b.w - (vers.x + vers.w));
      m.cy += Math.max(0, vers.y - b.y) - Math.max(0, b.y + b.h - (vers.y + vers.h));
      NPM.plaquer(pn, m, .25);
    });
  }

  const TYPES_ANNEXES = () => Object.keys(NP.ANNEXES);

  function ajouterAnnexe(genre) {
    assurerPerso();
    const pn = niveauPerso();
    let a = null;
    appliquer(() => { a = NP.ajouterAnnexe(pn, genre); etat.selAnnexe = a.id; etat.sel = etat.selOuv = etat.selMeuble = null; return true; });
    if (a) etincellesPlan(a.x + a.w / 2, a.y + a.h / 2, 1);
    toast('« ' + a.nom + ' » ajouté contre la maison. Déplacez-le par le milieu, étirez-le par ses bords.');
  }

  function actionAnnexe(act, valeur) {
    if (!etat.selAnnexe) return;
    const a = annexeFigee(etat.selAnnexe);
    if (!a) return;
    const pn = niveauPerso();
    appliquer(() => {
      if (act === 'pivoter') NP.pivoterAnnexe(pn, a.id);
      else if (act === 'sup') { pn.annexes.splice(pn.annexes.indexOf(a), 1); etat.selAnnexe = null; }
      else if (act === 'genre') {
        const ancien = (NP.ANNEXES[a.genre] || {}).nom;
        if (!a.nom || a.nom === ancien) a.nom = NP.ANNEXES[valeur].nom;
        a.genre = valeur;
      } else if (act === 'nom') a.nom = valeur;
      else if (act === 'porte') a.porte = valeur;
      else if (act === 'forme' || act === 'pose') {
        /* Le nom suit, s'il n'a pas été personnalisé. */
        const auto = !a.nom || /^Piscine/.test(a.nom);
        a[act] = valeur;
        if (act === 'forme' && (valeur === 'ronde' || valeur === 'carre')) { const c = Math.max(a.w, a.h); a.w = a.h = c; }
        if (auto) {
          const fo = NPM.FORMES_PISCINE.find(k => k[0] === (a.forme || 'rect'))[1].toLowerCase();
          const po = NPM.POSES_PISCINE.find(k => k[0] === (a.pose || 'creusee'))[1].toLowerCase();
          a.nom = 'Piscine ' + fo + ' ' + po;
        }
      }
      else if (act === 'w' || act === 'h') {
        const v = parseFloat(String(valeur).replace(',', '.'));
        if (v > .5) { a[act] = v; if (a.forme === 'ronde' || a.forme === 'carre') a.w = a.h = v; }
      }
      return true;
    });
    if (act !== 'sup' && act !== 'nom') etincellesPlan(a.x + a.w / 2, a.y + a.h / 2, .6);
  }

  function barreAnnexe() {
    if (!etat.selAnnexe || etat.vue !== '2d') return '';
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    const a = (niv.ext || []).find(x => x.id === etat.selAnnexe);
    if (!a) return '';
    return '<div class="barre-ouv">' +
      '<span class="qui"><b>' + (a.emoji || '🏠') + ' ' + esc(a.nom) + '</b></span>' +
      '<select class="mini-sel" data-anngenre title="Type d\'annexe">' +
      TYPES_ANNEXES().map(k => '<option value="' + k + '"' + (k === a.genre ? ' selected' : '') + '>' +
        NP.ANNEXES[k].emoji + ' ' + NP.ANNEXES[k].nom + '</option>').join('') + '</select>' +
      (a.genre === 'garage' ? '<label class="dim">Porte <select class="mini-sel" data-annporte title="Côté de la porte de garage">' + [['auto', 'côté rue (auto)'], ['n', 'au nord (haut)'], ['s', 'au sud (bas)'], ['e', 'à l\'est (droite)'], ['o', 'à l\'ouest (gauche)'], ['aucune', 'aucune']].map(k => '<option value="' + k[0] + '"' + (k[0] === (a.porte || 'auto') ? ' selected' : '') + '>' + k[1] + '</option>').join('') + '</select></label>' : '') +
      (a.genre === 'piscine' ? '<select class="mini-sel" data-annforme title="Forme">' + NPM.FORMES_PISCINE.map(k => '<option value="' + k[0] + '"' + (k[0] === (a.forme || 'rect') ? ' selected' : '') + '>' + k[1] + '</option>').join('') + '</select>' +
        '<select class="mini-sel" data-annpose title="Pose">' + NPM.POSES_PISCINE.map(k => '<option value="' + k[0] + '"' + (k[0] === (a.pose || 'creusee') ? ' selected' : '') + '>' + k[1] + '</option>').join('') + '</select>' : '') +
      '<label class="dim">L <input type="text" inputmode="decimal" data-anndim="w" value="' + nd(a.w) + '"> m</label>' +
      '<label class="dim">P <input type="text" inputmode="decimal" data-anndim="h" value="' + nd(a.h) + '"> m</label>' +
      '<button class="mini-btn" data-annact="pivoter" title="Faire pivoter d\'un quart de tour (R)">↻ Pivoter</button>' +
      '<button class="mini-btn danger" data-annact="sup" title="Supprimer (Suppr)">✕ Supprimer</button>' +
      '<span class="aide">Glissez-le par le milieu, étirez-le par ses bords — il s\'aimante aux façades.</span>' +
      '</div>';
  }

  /* Supprimer une porte ou une fenêtre, d'où qu'on vienne (croix rouge,
     outil Effacer, bouton, touche Suppr). */
  function effacerOuverture(cle, e) {
    const v = planCourant();
    const niv = v.niveaux[Math.min(etat.iniv, v.niveaux.length - 1)];
    const o = (niv.portes || []).concat(niv.fenetres || []).find(x => x.cle === cle);
    const nom = o ? ({porte: 'Porte supprimée', entree: 'Porte d\'entrée supprimée', fenetre: 'Fenêtre supprimée',
      baie: 'Baie vitrée supprimée', passage: 'Passage supprimé', vide: 'Mur rebâti'}[o.type] || 'Ouverture supprimée') : 'Ouverture supprimée';
    etat.selOuv = cle;
    actionOuverture('sup');
    if (e) etincelles(e.clientX, e.clientY, .6);
    toast(nom + '.');
  }

  /* Les boutons de la barre d'ouverture. */
  const TYPES_OUV = [['porte', '🚪 Porte'], ['entree', '🏠 Porte d\'entrée'], ['fenetre', '🪟 Fenêtre'],
                     ['baie', '🌅 Baie vitrée'], ['garage', '🚗 Porte de garage'], ['passage', '⬜ Passage']];
  function actionOuverture(act, valeur) {
    const cle = etat.selOuv;
    if (!cle) return;
    const f = ouvertureFigee(cle);
    if (!f) return;
    const pn = niveauPerso();
    appliquer(() => {
      if (act === 'tourner') NP.tournerOuverture(f);
      else if (act === 'charn') f.charn = f.charn ? 0 : 1;
      else if (act === 'sens') f.sens = -(f.sens || 1);
      else if (act === 'plus') f.l = Math.round((f.l + .1) * 100) / 100;
      else if (act === 'moins') f.l = Math.max(.4, Math.round((f.l - .1) * 100) / 100);
      else if (act === 'type') { f.type = valeur; f.l = NP.LARGEURS[valeur] || f.l; }
      else if (act === 'sup') { pn.ouvertures.splice(pn.ouvertures.indexOf(f), 1); etat.selOuv = null; }
      NP.nettoyerOuvertures(pn);
      return true;
    });
    const o = pn.ouvertures.find(x => x.id === f.id);
    if (o && act !== 'sup') etincellesPlan(o.axe === 'v' ? o.pos : o.c, o.axe === 'v' ? o.c : o.pos, .5);
  }

  /* ============================================================
     LES ACTIONS
     ============================================================ */
  /* `rapide` : pendant un glissement, on ne refait que le dessin —
     pas la liste des pièces ni les feuilles d'impression. */
  /* Les propositions du moteur se recalculent ; « Mon plan », lui, ne
     bouge pas quand les critères changent. `rapide` : pendant un
     glissement, on ne refait que le dessin. */
  function recalculer(rapide) {
    etat.res = NP.generer(etat.criteres, etat.pieces, etat.ouv);
    etat.pieces = etat.res.pieces;
    perime();
    if (!rapide) sauver();
    rendre(rapide);
  }

  /* Repartir de zéro : programme automatique, plus de « Mon plan ». */
  function regenerer(garderPerso) {
    etat.pieces = null;
    etat.sel = null;
    etat.selOuv = null;
    if (!garderPerso) { etat.ouv = {}; etat.perso = null; if (etat.iv === -1) etat.iv = 0; }
    etat.res = NP.generer(etat.criteres, null, etat.ouv);
    etat.pieces = etat.res.pieces;
    perime();
    sauver();
    el('colg').innerHTML = formulaire();
    rendre();
  }

  /* Un critère qui change le programme oblige à reconstruire les
     propositions ; « Mon plan » est conservé tel quel. */
  const REBATIR = ['type', 'chambres', 'sdb', 'niveaux', 'wcSepare', 'cellier', 'buanderie', 'bureau',
                   'suiteType', 'dressing', 'parentaleRdc'];

  function majCritere(cle, val) {
    if (etat.criteres[cle] === val) return;
    etat.criteres[cle] = val;
    if (cle === 'type') {
      etat.criteres.niveaux = val === 'duplex' ? 2 : (val === 'appartement' ? 1 : etat.criteres.niveaux);
      if (val === 'appartement') { etat.criteres.jardin = 0; etat.criteres.garage = false; }
    }
    if (REBATIR.indexOf(cle) >= 0) {
      /* On regarde « Mon plan » : on bascule sur la nouvelle variante A,
         pour que le changement de critère se voie. Mon plan reste
         disponible dans son onglet. */
      if (etat.iv === -1) etat.iv = 0;
      regenerer(true);
      if (etat.perso) toast('Propositions refaites. « Mon plan » est gardé tel quel dans son onglet.');
    } else { el('colg').innerHTML = formulaire(); recalculer(); }
  }

  /* Ajouter une pièce : dans « Mon plan », elle est prise sur la pièce
     sélectionnée (ou la plus grande du niveau). Les autres ne bougent pas. */
  function ajouterPiece(type) {
    const perso = assurerPerso();
    const pn = niveauPerso();
    const d = NP.CAT[type];
    const p = NP.nouvellePiece(type, {niveau: pn.niveau});
    const hote = etat.sel && pn.cases.some(k => k.id === etat.sel) ? etat.sel : null;
    const nomHote = hote ? (perso.pieces.find(x => x.id === hote) || {}).nom : 'la plus grande pièce';
    if (!NP.ajouterCase(pn, p.id, hote, d.fixe || Math.max(d.min, d.part * etat.criteres.surface))) {
      toast('Plus aucune pièce assez grande pour y en découper une autre — agrandissez d\'abord le plan.');
      return;
    }
    perso.pieces.push(p);
    etat.sel = p.id;
    toast('« ' + p.nom + ' » ajoutée, prise sur ' + nomHote + '. Tirez ses murs pour l\'ajuster.');
    majPerso();
  }

  /* Retirer une pièce d'un niveau figé. Sa place revient à une voisine,
     ou devient un dégagement si aucune ne peut la reprendre proprement. */
  function retirerDePerso(pn, id) {
    const r = NP.retirerCase(pn, id);
    if (r.libre) {
      const deg = NP.nouvellePiece('degagement', {niveau: pn.niveau, nom: 'Espace libre'});
      etat.perso.pieces.push(deg);
      pn.cases.push(Object.assign({id: deg.id}, r.libre));
    }
    return r;
  }

  /* Envoyer une pièce à l'autre niveau : elle quitte celui-ci (sa place
     revient à une voisine) et se prend sur la plus grande pièce là-bas. */
  function changerNiveau(id) {
    const perso = assurerPerso();
    if (perso.niveaux.length < 2) return;
    const p = perso.pieces.find(x => x.id === id);
    const pn = niveauPerso();
    if (!p || pn.cases.length <= 1) { toast('Il faut au moins une pièce par niveau.'); return; }
    const vers = perso.niveaux.find(n => n !== pn);
    const k = null;
    const aire = NP.aireDe(pn, id) || 9;
    if (!NP.ajouterCase(NP.copie(vers), id, null, aire)) {
      toast('Pas de place à l\'autre niveau pour l\'y découper.'); return;
    }
    retirerDePerso(pn, id);
    NP.ajouterCase(vers, id, null, aire);
    p.niveau = vers.niveau;
    etat.iniv = vers.niveau;
    etat.sel = id;
    toast('« ' + p.nom + ' » déplacée ' + (vers.niveau === 0 ? 'au rez-de-chaussée' : 'à l\'étage') + '.');
    majPerso();
  }

  function supprimerPiece(id) {
    const perso = assurerPerso();
    const pn = niveauPerso();
    const p = perso.pieces.find(x => x.id === id);
    if (!p) return;
    if (pn.cases.length <= 1) { toast('Il faut au moins une pièce par niveau.'); return; }
    const r = retirerDePerso(pn, id);
    perso.pieces.splice(perso.pieces.indexOf(p), 1);
    if (etat.sel === id) etat.sel = null;
    const voisine = r.fusion ? (perso.pieces.find(x => x.id === r.fusion) || {}).nom : null;
    toast('« ' + p.nom + ' » supprimée' + (voisine ? ' — sa place revient à « ' + voisine + ' ».' : ' — sa place devient un espace libre.'));
    majPerso();
  }

  /* ============================================================
     REPARTIR DE ZÉRO
     ============================================================ */
  /* Un plan vierge : l'emprise actuelle, vide, à découper soi-même. */
  function planVierge() {
    const v = planCourant();
    const n0 = v.niveaux[0];
    if (etat.perso && !confirm('Remplacer « Mon plan » par un plan vierge de ' + nd(n0.W) + ' × ' + nd(n0.H) +
        ' m ?\n\nPensez à le « Garder » dans la gouttière si vous voulez le retrouver.')) return;
    const avant = photo();
    etat.perso = NP.planVierge(n0.W, n0.H, v.niveaux.length);
    etat.iv = -1; etat.iniv = 0; etat.sel = etat.selOuv = etat.selMeuble = null;
    etat.outil = 'mur';
    perime(); sauver(); rendre(); animer(avant);
    const s = document.querySelector('#scene svg');
    if (s) { const r = s.getBoundingClientRect(); etincelles(r.left + r.width / 2, r.top + r.height / 2, 1.6); }
    toast('Plan vierge ✨ L\'outil « Tracer un mur » est prêt : tirez un trait dans la pièce pour la couper.');
  }

  /* ---------- Ajouter ou retirer un niveau ----------
     Le nouveau niveau prend l'emprise de celui du dessous. S'il y a un
     escalier en dessous, il arrive exactement au même endroit, et le
     reste du niveau forme une grande pièce, à découper ensuite. */
  function ajouterNiveau() {
    const perso = assurerPerso();
    const bas = perso.niveaux[perso.niveaux.length - 1];
    const n = perso.niveaux.length;
    if (n >= 4) { toast('Quatre niveaux, c\'est le maximum ici.'); return; }
    const W = bas.W, H = bas.H;
    const grande = NP.nouvellePiece('piece', {niveau: n, nom: nomNiveau(n, n + 1)});
    const pieces = [grande];
    const cases = [], ouvertures = [];
    const escB = bas.cases.find(k => { const p = perso.pieces.find(x => x.id === k.id); return p && p.type === 'escalier'; });
    if (escB) {
      const pB = perso.pieces.find(x => x.id === escB.id);
      const esc = NP.nouvellePiece('escalier', {niveau: n, nom: 'Escalier', forme: pB.forme});
      pieces.push(esc);
      const S = escB;
      cases.push({id: esc.id, x: S.x, y: S.y, w: S.w, h: S.h});
      [[0, 0, W, S.y], [0, S.y + S.h, W, H - S.y - S.h], [0, S.y, S.x, S.h], [S.x + S.w, S.y, W - S.x - S.w, S.h]]
        .forEach(r => { if (r[2] > .05 && r[3] > .05) cases.push({id: grande.id, x: r[0], y: r[1], w: r[2], h: r[3]}); });
      /* Un passage entre l'escalier et le palier, sur son plus long côté libre. */
      const cotes = [];
      if (S.y + S.h < H - .05) cotes.push({axe: 'h', pos: S.y + S.h, c: S.x + S.w / 2, l: Math.min(.9, S.w - .1)});
      if (S.y > .05) cotes.push({axe: 'h', pos: S.y, c: S.x + S.w / 2, l: Math.min(.9, S.w - .1)});
      if (S.x + S.w < W - .05) cotes.push({axe: 'v', pos: S.x + S.w, c: S.y + S.h / 2, l: Math.min(.9, S.h - .1)});
      if (S.x > .05) cotes.push({axe: 'v', pos: S.x, c: S.y + S.h / 2, l: Math.min(.9, S.h - .1)});
      if (cotes[0]) ouvertures.push(Object.assign({id: NP.idOuv(), type: 'passage', sens: 1, charn: 0}, cotes[0]));
    } else cases.push({id: grande.id, x: 0, y: 0, w: W, h: H});
    const avant = photo();
    perso.pieces.push.apply(perso.pieces, pieces);
    perso.niveaux.push({niveau: n, W: W, H: H, cases: cases, ouvertures: ouvertures, annexes: [], meubles: []});
    etat.iniv = n; etat.iv = -1;
    etat.sel = etat.selOuv = etat.selMeuble = etat.selAnnexe = etat.selMur = null;
    perime(); sauver(); rendre(); animer(avant);
    const s = document.querySelector('#scene svg');
    if (s) { const r = s.getBoundingClientRect(); etincelles(r.left + r.width / 2, r.top + r.height / 2, 1.4); }
    toast(escB ? 'Niveau ajouté, l\'escalier tombe pile au-dessus de celui du dessous. Tracez les murs avec 🧱.'
      : 'Niveau ajouté. Pour monter, donnez le type « Escalier » à une pièce, au même endroit sur les deux niveaux.');
  }

  function retirerNiveau() {
    const perso = etat.perso;
    if (!perso || perso.niveaux.length < 2) return;
    const i = Math.min(etat.iniv, perso.niveaux.length - 1);
    if (!confirm('Supprimer le niveau « ' + nomNiveau(i, perso.niveaux.length) + ' » et tout ce qu\'il contient ?')) return;
    const avant = photo();
    const ids = {};
    perso.niveaux[i].cases.forEach(k => { ids[k.id] = true; });
    perso.pieces = perso.pieces.filter(p => !ids[p.id]);
    perso.niveaux.splice(i, 1);
    perso.niveaux.forEach((n, k) => { n.niveau = k; });
    perso.pieces.forEach(p => {
      const k = perso.niveaux.findIndex(n => n.cases.some(c => c.id === p.id));
      if (k >= 0) p.niveau = k;
    });
    etat.iniv = Math.max(0, i - 1);
    perime(); sauver(); rendre(); animer(avant);
    toast('Niveau supprimé.');
  }

  function supprimerMonPlan() {
    if (!etat.perso) return;
    if (!confirm('Supprimer « Mon plan » ? Les propositions A, B, C restent disponibles.')) return;
    etat.perso = null; etat.iv = 0; etat.sel = etat.selOuv = etat.selMeuble = null;
    perime(); sauver(); afficherEtape(3);
    toast('« Mon plan » supprimé. Vous voilà revenu(e) aux propositions.');
  }

  /* ============================================================
     IMPORTER UN PLAN EXISTANT (une image par niveau)
     ------------------------------------------------------------
     On lit chaque image (voir naoplan-lecture.js), on demande la
     largeur réelle de la maison — une image n'a pas d'échelle — et on
     en fait un « Mon plan » entièrement modifiable : pièces, murs,
     portes, fenêtres. L'image reste en transparence dessous, pour
     vérifier la lecture ; on peut la cacher.
     ============================================================ */
  let importEnCours = null;

  function chargerImage(fichier) {
    return new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onload = () => {
        const img = new Image();
        img.onload = () => ok({img: img, src: lecteur.result, nom: fichier.name});
        img.onerror = () => ko(new Error('illisible'));
        img.src = lecteur.result;
      };
      lecteur.onerror = () => ko(new Error('illisible'));
      lecteur.readAsDataURL(fichier);
    });
  }

  /* Un aperçu de ce qui a été lu : les pièces en couleur, les ouvertures en trait. */
  function apercuLecture(a) {
    if (a.erreur) return '<div class="apercu-err">⚠️ ' + esc(a.erreur) + '</div>';
    const cols = ['#EFE8FD', '#DFF2F0', '#E6E8FB', '#FCF2DE', '#FDE9EE', '#E3F1E2', '#F1EBFC', '#E4E4FC'];
    let s = '<svg viewBox="-0.3 -0.3 ' + (a.W + .6) + ' ' + (a.H + .6) + '" preserveAspectRatio="xMidYMid meet">';
    a.rects.forEach(r => {
      s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="' + cols[r.region % cols.length] +
        '" stroke="#3A3154" stroke-width="' + (a.W / 120) + '"/>';
    });
    a.ouvertures.forEach(o => {
      const c = o.type === 'porte' ? '#C24B63' : o.type === 'entree' ? '#B57C1E' : '#4FC0B4';
      s += o.axe === 'v'
        ? '<path d="M' + o.pos + ' ' + (o.c - o.l / 2) + 'v' + o.l + '" stroke="' + c + '" stroke-width="' + (a.W / 50) + '"/>'
        : '<path d="M' + (o.c - o.l / 2) + ' ' + o.pos + 'h' + o.l + '" stroke="' + c + '" stroke-width="' + (a.W / 50) + '"/>';
    });
    return s + '</svg>';
  }

  async function ouvrirImport(fichiers) {
    const liste = Array.from(fichiers).filter(f => /^image\//.test(f.type)).slice(0, 3);
    if (!liste.length) { toast('Choisissez une ou deux images de plan (PNG, JPG…).'); return; }
    let images;
    try { images = await Promise.all(liste.map(chargerImage)); }
    catch (e) { toast('Une des images n\'a pas pu être lue.'); return; }
    /* Largeur de chaque emprise, en pixels de l'image d'origine. */
    const epx = images.map(im => {
      const a = NPL.analyser(im.img, 10);
      return a.erreur ? 0 : a.W * a.pxm / a.k;
    });
    const a0 = NPL.analyser(images[0].img, 10);
    /* Largeur proposée pour le rez : celle qui donne la surface annoncée
       dans les critères, avec les proportions lues sur l'image. */
    const ratio = a0.erreur ? 1.3 : a0.W / a0.H;
    const aireNiv = etat.criteres.surface / Math.max(1, images.length);
    const l0 = Math.round(Math.sqrt(aireNiv * ratio) * 100) / 100;
    importEnCours = {images: images, epx: epx, largeurs: [], manuel: []};
    fixerEchelle(l0);
    afficherImport();
  }

  /* L'échelle vient du rez : les autres niveaux, dessinés d'ordinaire à la
     même échelle sur les annonces, en déduisent leur propre largeur —
     sauf si on l'a tapée soi-même. */
  function fixerEchelle(l0) {
    const I = importEnCours;
    I.largeurs[0] = l0;
    const pxParM = I.epx[0] / l0;
    I.images.forEach((_, i) => {
      if (i > 0 && !I.manuel[i]) I.largeurs[i] = Math.round((I.epx[i] / pxParM) * 100) / 100;
    });
    I.pxParM = pxParM;
  }

  function afficherImport() {
    const I = importEnCours;
    if (!I) return;
    const analyses = I.images.map((im, i) => NPL.analyser(im.img, I.largeurs[i] || I.largeurs[0]));
    I.analyses = analyses;
    const noms = ['Rez-de-chaussée', 'Étage', 'Combles'];
    const cmParPx = I.pxParM ? 100 / I.pxParM : 0;
    let s = '<div class="modale-fond"><div class="modale" role="dialog" aria-label="Importer un plan">' +
      '<div class="modale-hd"><h2>🖼️ Reprendre un plan existant</h2>' +
      '<button class="mini-btn" data-imp="fermer" aria-label="Fermer">✕</button></div>' +
      '<p class="modale-intro">Voici ce qui a été lu. Une image n\'a pas d\'échelle : tapez la <b>largeur réelle</b> ' +
      'du rez-de-chaussée (d\'un mur de façade à l\'autre) — tout le plan se cale dessus, au centimètre près.</p>' +
      '<div class="imp-grille">';
    I.images.forEach((im, i) => {
      const a = analyses[i];
      s += '<div class="imp-niv">' +
        '<div class="imp-tete"><select class="mini-sel" data-impniv="' + i + '">' +
        noms.slice(0, Math.max(2, I.images.length)).map((n, k) => '<option value="' + k + '"' + (k === i ? ' selected' : '') + '>' + n + '</option>').join('') +
        '</select><span class="imp-fic">' + esc(im.nom) + '</span></div>' +
        '<div class="imp-duo"><img src="' + im.src + '" alt="">' + apercuLecture(a) + '</div>' +
        '<div class="imp-larg"><label>Largeur réelle <input type="text" inputmode="decimal" data-imp="largeur" data-i="' + i +
          '" value="' + nd(I.largeurs[i]) + '"> m</label>' +
          (a.erreur ? '' : '<span>× ' + nd(a.H) + ' m de profondeur</span>') +
          (i > 0 && !I.manuel[i] ? '<span class="aide">même échelle que le rez</span>' : '') + '</div>' +
        '<div class="imp-stat">' + (a.erreur ? '' : Object.keys(NPL.nommer(a, [])).length + ' pièces · ' + a.ouvertures.length + ' ouvertures') + '</div></div>';
    });
    s += '</div>' +
      '<div class="imp-reglages">' +
      (cmParPx ? '<div class="imp-precision">📏 Précision de lecture : 1 pixel de votre image ≈ <b>' + cmParPx.toFixed(1).replace('.', ',') +
        ' cm</b>. Pour aller plus loin, chaque mur se règle ensuite à la main au millimètre (cliquez-le).</div>' : '') +
      '<label class="opt"><span>Lire les noms des pièces (lecture de texte dans le navigateur — son moteur se télécharge une fois ; l\'image n\'est envoyée nulle part)</span>' +
      '<input type="checkbox" data-imp="noms" checked></label>' +
      '</div>' +
      '<div class="modale-pied"><span class="imp-etat" id="imp-etat"></span>' +
      '<button class="btn" data-imp="fermer">Annuler</button>' +
      '<button class="btn primary" data-imp="valider">✨ Reprendre ce plan</button></div>' +
      '</div></div>';
    el('modale').innerHTML = s;
    el('modale').classList.add('on');
  }

  function fermerImport() {
    el('modale').classList.remove('on');
    el('modale').innerHTML = '';
    importEnCours = null;
  }

  async function validerImport() {
    const I = importEnCours;
    if (!I || !I.analyses) return;
    /* L'ordre des niveaux, tel que choisi dans les listes. */
    const ordre = I.images.map((_, i) => {
      const s = document.querySelector('[data-impniv="' + i + '"]');
      return {i: i, niv: s ? +s.value : i};
    }).sort((a, b) => a.niv - b.niv);
    const valides = ordre.filter(o => !I.analyses[o.i].erreur);
    if (!valides.length) { toast('Aucune de ces images n\'a pu être lue comme un plan.'); return; }
    const lireNoms = document.querySelector('[data-imp="noms"]') && document.querySelector('[data-imp="noms"]').checked;
    const etatEl = el('imp-etat');
    const bouton = document.querySelector('[data-imp="valider"]');
    if (bouton) bouton.disabled = true;

    const perso = {base: 'image', pieces: [], niveaux: []};
    const fonds = {};
    for (let n = 0; n < valides.length; n++) {
      const a = I.analyses[valides[n].i];
      let mots = [];
      if (lireNoms) {
        if (etatEl) etatEl.textContent = '🔎 Lecture des noms — ' + (n === 0 ? 'rez-de-chaussée' : 'étage') + '…';
        try { mots = await NPL.lireMots(a, 25000); }
        catch (e) {
          if (etatEl) etatEl.textContent = 'Lecture des noms impossible (hors ligne ?) — les pièces seront numérotées.';
        }
      }
      const noms = NPL.nommer(a, mots);
      /* Chaque niveau garde ses vraies dimensions : pas d'étirement. */
      const pn = {niveau: n, W: a.W, H: a.H, cases: [], ouvertures: []};
      /* Une région lue = une pièce, même si elle a une forme en L : ses
         rectangles partagent la même pièce, sans cloison entre eux. */
      const pieceDe = {};
      a.rects.forEach(q => {
        if (!pieceDe[q.region]) {
          const nm = noms[q.region] || {type: 'piece', nom: 'Pièce'};
          pieceDe[q.region] = NP.nouvellePiece(nm.type, {niveau: n, nom: nm.nom});
          perso.pieces.push(pieceDe[q.region]);
        }
        pn.cases.push({id: pieceDe[q.region].id, x: q.x, y: q.y, w: q.w, h: q.h});
      });
      a.ouvertures.forEach(o => {
        pn.ouvertures.push({id: NP.idOuv(), type: o.type, axe: o.axe,
          pos: o.pos, c: o.c,
          l: o.l, sens: 1, charn: 0});
      });
      NP.aligner(pn);
      perso.niveaux.push(pn);
      /* L'image d'origine, recalée sur l'emprise, reste dessous pour vérifier. */
      const R = a.repere, im = I.images[valides[n].i].img;
      const iw = im.naturalWidth, ih = im.naturalHeight;
      const lpx = (iw * a.k) / R.pxm;                 // largeur de l'image, en mètres
      fonds[n] = {src: I.images[valides[n].i].src, ratio: ih / iw,
        largeur: lpx, dx: -R.xa / R.pxm, dy: -R.ya / R.pxm, opacite: .35};
    }
    const avant = photo();
    etat.perso = perso;
    etat.iv = -1; etat.iniv = 0; etat.sel = etat.selOuv = etat.selMeuble = null;
    etat.vue = '2d'; etat.outil = 'main';
    etat.fonds = fonds;
    sauverFonds();
    fermerImport();
    perime(); sauver(); rendre(); animer(avant);
    const s = document.querySelector('#scene svg');
    if (s) { const r = s.getBoundingClientRect(); etincelles(r.left + r.width / 2, r.top + r.height / 2, 1.8); }
    const nb = perso.pieces.length;
    afficherEtape(4, {calme: true});
    toast('Plan repris : ' + nb + ' pièces sur ' + perso.niveaux.length + (perso.niveaux.length > 1 ? ' niveaux' : ' niveau') +
      '. Vérifiez sur l\'image en transparence, corrigez ce qui doit l\'être.');
  }

  /* ============================================================
     LA GOUTTIÈRE — les plans gardés, pour comparer
     ------------------------------------------------------------
     À droite, une colonne où l'on range des copies de plans. Chacune
     garde ses critères, ses pièces, ses murs et ses ouvertures ; on la
     rouvre d'un clic, on en coche plusieurs pour les comparer côte à
     côte. Rangées par projet (le « nom du projet » des critères).
     ============================================================ */
  const CLE_GOUTTIERE = 'naoplan.gouttiere.v1';
  let gouttiere = [];
  let filtreProjet = 'courant';
  const aComparer = {};

  function chargerGouttiere() {
    try { gouttiere = JSON.parse(localStorage.getItem(CLE_GOUTTIERE) || '[]') || []; } catch (e) { gouttiere = []; }
  }
  function sauverGouttiere() {
    try { localStorage.setItem(CLE_GOUTTIERE, JSON.stringify(gouttiere)); return true; }
    catch (e) { toast('Le navigateur n\'a pas pu garder ce plan (mémoire pleine ou désactivée) — pensez à « Enregistrer » le projet.'); return false; }
  }
  const nomProjet = () => (etat.criteres.nom || '').trim() || 'Projet sans nom';

  /* Les chiffres qui comptent pour comparer deux plans. */
  function statsPlan(perso) {
    let hab = 0, ch = 0, pieces = 0;
    const vues = {};
    perso.niveaux.forEach(n => n.cases.forEach(k => {
      const p = perso.pieces.find(x => x.id === k.id);
      if (!p) return;
      hab += k.w * k.h;
      if (vues[k.id]) return;                 // une pièce en plusieurs morceaux compte une fois
      vues[k.id] = 1;
      pieces++;
      if (['chambre', 'parentale', 'suite'].indexOf(p.type) >= 0) ch++;
    }));
    const n0 = perso.niveaux[0];
    return {hab: hab, ch: ch, pieces: pieces, W: n0.W, H: n0.H, niveaux: perso.niveaux.length,
            ouv: perso.niveaux.reduce((t, n) => t + (n.ouvertures || []).length, 0)};
  }

  function garderPlan() {
    const v = planCourant();
    const perso = enPerso() ? NP.copie(etat.perso) : NP.figer(v, etat.pieces);
    const deJa = gouttiere.filter(g => g.projet === nomProjet()).length;
    const g = {id: 'g' + Date.now().toString(36), projet: nomProjet(),
      nom: (enPerso() ? 'Mon plan' : 'Variante ' + v.cle) + ' · ' + (deJa + 1),
      date: new Date().toISOString(), criteres: NP.copie(etat.criteres), perso: perso};
    gouttiere.unshift(g);
    if (!sauverGouttiere()) { gouttiere.shift(); return; }
    filtreProjet = 'courant';
    rendreGouttiere();
    const carte = document.querySelector('.gt-carte[data-gt="' + g.id + '"]');
    if (carte) {
      if (!calme()) carte.animate([{transform: 'translateX(40px) scale(.9)', opacity: 0}, {transform: 'none', opacity: 1}],
        {duration: 420, easing: 'cubic-bezier(.2,.9,.25,1.15)'});
      const r = carte.getBoundingClientRect();
      etincelles(r.left + r.width / 2, r.top + 30, .9);
    }
    toast('Plan gardé dans la gouttière : « ' + g.nom + ' ».');
  }

  function ouvrirGarde(id) {
    const g = gouttiere.find(x => x.id === id);
    if (!g) return;
    if (etat.perso && !confirm('Ouvrir « ' + g.nom + ' » à la place de « Mon plan » actuel ?\n\n' +
        'Gardez d\'abord le plan actuel si vous voulez le retrouver.')) return;
    const avant = photo();
    etat.perso = NP.copie(g.perso);
    etat.criteres = Object.assign({}, CRIT_PLUS, NP.defauts(), g.criteres);
    etat.iv = -1; etat.iniv = 0; etat.sel = etat.selOuv = etat.selMeuble = null;
    el('colg').innerHTML = formulaire();
    etat.res = NP.generer(etat.criteres, null, {});
    etat.pieces = etat.res.pieces;
    perime(); sauver(); rendre(); animer(avant);
    toast('« ' + g.nom + ' » ouvert dans « Mon plan ».');
    if (etat.etape < 4) afficherEtape(4, {calme: true});
  }

  function supprimerGarde(id) {
    const g = gouttiere.find(x => x.id === id);
    if (!g || !confirm('Supprimer « ' + g.nom + ' » de la gouttière ?')) return;
    gouttiere = gouttiere.filter(x => x.id !== id);
    delete aComparer[id];
    sauverGouttiere();
    rendreGouttiere();
  }

  /* Une miniature légère : les pièces en couleur et le contour. */
  function miniature(perso, niveau) {
    const n = perso.niveaux[niveau || 0];
    if (!n) return '';
    let s = '<svg viewBox="-0.4 -0.4 ' + (n.W + .8) + ' ' + (n.H + .8) + '" preserveAspectRatio="xMidYMid meet">';
    n.cases.forEach(k => {
      const p = perso.pieces.find(x => x.id === k.id);
      const z = p ? (ZONE_COUL[NP.CAT[p.type].zone] || 'serv') : 'serv';
      s += '<rect x="' + k.x + '" y="' + k.y + '" width="' + k.w + '" height="' + k.h + '" fill="var(--p-' + z +
        ')" stroke="var(--mur-fin)" stroke-width="' + (n.W / 150) + '"/>';
    });
    s += '<rect x="0" y="0" width="' + n.W + '" height="' + n.H + '" fill="none" stroke="var(--mur)" stroke-width="' + (n.W / 60) + '"/>';
    return s + '</svg>';
  }

  function rendreGouttiere() {
    const zone = el('gouttiere');
    if (!zone) return;
    const projets = Array.from(new Set(gouttiere.map(g => g.projet)));
    const liste = filtreProjet === 'tous' ? gouttiere : gouttiere.filter(g => g.projet === nomProjet());
    const nbComp = Object.keys(aComparer).filter(k => aComparer[k] && gouttiere.some(g => g.id === k)).length;
    let s = '<div class="gt-hd"><h2>🗂️ Plans gardés</h2>' +
      '<select class="mini-sel" data-gt-filtre>' +
      '<option value="courant"' + (filtreProjet === 'courant' ? ' selected' : '') + '>' + esc(nomProjet()) + '</option>' +
      '<option value="tous"' + (filtreProjet === 'tous' ? ' selected' : '') + '>Tous les projets (' + projets.length + ')</option>' +
      '</select></div>' +
      '<button class="btn primary gt-garder" data-plan="garder">💾 Garder le plan affiché</button>' +
      (nbComp >= 2 ? '<button class="btn gt-comparer" data-gt-comparer>⚖️ Comparer les ' + nbComp + ' plans cochés</button>' : '') +
      '<div class="gt-liste">';
    if (!liste.length) {
      s += '<div class="gt-vide">Aucun plan gardé pour ce projet.<br>Chaque « 💾 Garder » range ici une copie, ' +
        'que vous pourrez rouvrir ou comparer.</div>';
    }
    liste.forEach(g => {
      const st = statsPlan(g.perso);
      const d = new Date(g.date);
      s += '<div class="gt-carte" data-gt="' + g.id + '">' +
        '<div class="gt-mini" data-gt-ouvrir="' + g.id + '" title="Ouvrir ce plan">' + miniature(g.perso, 0) + '</div>' +
        '<input type="text" class="gt-nom" data-gt-nom="' + g.id + '" value="' + esc(g.nom) + '">' +
        '<div class="gt-meta">' + m2(st.hab) + ' · ' + st.ch + (st.ch > 1 ? ' ch.' : ' ch.') + ' · ' + st.pieces + ' pièces' +
        (st.niveaux > 1 ? ' · ' + st.niveaux + ' niv.' : '') + '<br>' +
        (filtreProjet === 'tous' ? esc(g.projet) + ' · ' : '') +
        d.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'}) + ' ' + d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) + '</div>' +
        '<div class="gt-act">' +
        '<button class="mini-btn" data-gt-ouvrir="' + g.id + '">↗ Ouvrir</button>' +
        '<label class="gt-cmp"><input type="checkbox" data-gt-cmp="' + g.id + '"' + (aComparer[g.id] ? ' checked' : '') + '> comparer</label>' +
        '<button class="mini-btn danger" data-gt-sup="' + g.id + '" title="Supprimer">✕</button>' +
        '</div></div>';
    });
    s += '</div>';
    zone.innerHTML = s;
  }

  /* La comparaison, côte à côte : miniatures en grand et chiffres clés. */
  function comparer() {
    const choix = gouttiere.filter(g => aComparer[g.id]);
    if (choix.length < 2) return;
    const st = choix.map(g => statsPlan(g.perso));
    const ligne = (lab, f) => '<tr><th>' + lab + '</th>' + st.map((x, i) => '<td>' + f(x, choix[i]) + '</td>').join('') + '</tr>';
    const meilleur = (vals, plusGrand) => {
      const m = plusGrand ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      return vals.map(v => Math.abs(v - m) < 1e-6);
    };
    const bHab = meilleur(st.map(x => x.hab), true);
    let s = '<div class="modale-fond"><div class="modale large" role="dialog" aria-label="Comparer des plans">' +
      '<div class="modale-hd"><h2>⚖️ Comparer ' + choix.length + ' plans</h2>' +
      '<button class="mini-btn" data-cmp-fermer aria-label="Fermer">✕</button></div>' +
      '<div class="cmp-grille" style="grid-template-columns:repeat(' + choix.length + ',minmax(0,1fr))">';
    choix.forEach(g => {
      s += '<div class="cmp-col"><h3>' + esc(g.nom) + '</h3>' +
        g.perso.niveaux.map((n, i) => '<div class="cmp-mini">' + miniature(g.perso, i) +
          (g.perso.niveaux.length > 1 ? '<small>' + nomNiveau(i, g.perso.niveaux.length) + '</small>' : '') + '</div>').join('') +
        '<button class="mini-btn" data-gt-ouvrir="' + g.id + '">↗ Ouvrir ce plan</button></div>';
    });
    s += '</div><table class="surf cmp-tab"><tbody>' +
      ligne('Surface habitable', (x, g) => m2(x.hab) + (bHab[choix.indexOf(g)] ? ' 🏆' : '')) +
      ligne('Emprise', x => nd(x.W) + ' × ' + nd(x.H) + ' m') +
      ligne('Niveaux', x => x.niveaux) +
      ligne('Pièces', x => x.pieces) +
      ligne('Chambres', x => x.ch) +
      ligne('Portes et fenêtres', x => x.ouv) +
      ligne('Projet', (x, g) => esc(g.projet)) +
      '</tbody></table></div></div>';
    el('modale').innerHTML = s;
    el('modale').classList.add('on');
  }

  /* ============================================================
     LA MÉMOIRE (rien ne sort de cet ordinateur)
     ============================================================ */
  const CLE_FONDS = 'naoplan.fonds.v1';
  function sauver() {
    try {
      localStorage.setItem(CLE, JSON.stringify({criteres: etat.criteres, pieces: etat.pieces,
        ouv: etat.ouv, perso: etat.perso, iv: etat.iv, iniv: etat.iniv, vue: etat.vue,
        projet: etat.projet, ambiances: etat.ambiances, etape: etat.etape, choix: etat.choix}));
    } catch (e) { /* navigation privée : tant pis, on continue */ }
    photographier();
  }
  /* Les images de calque vivent à part : lourdes, elles pourraient
     dépasser la place du navigateur — et ne doivent pas empêcher
     d'enregistrer le projet lui-même. */
  function sauverFonds() {
    try { localStorage.setItem(CLE_FONDS, JSON.stringify(etat.fonds)); }
    catch (e) { toast('L\'image reste affichée, mais le navigateur n\'a pas pu la garder pour la prochaine fois (mémoire pleine ou désactivée).'); }
  }
  function charger() {
    try {
      const d = JSON.parse(localStorage.getItem(CLE) || 'null');
      if (d && d.criteres) {
        etat.criteres = Object.assign({}, CRIT_PLUS, NP.defauts(), d.criteres);
        etat.projet = Object.assign({}, PROJET_DEFAUT, d.projet || {});
        etat.ambiances = d.ambiances || {general: {}, pieces: {}};
        if (!etat.ambiances.pieces) etat.ambiances.pieces = {};
        etat.etape = d.etape || 1; etat.choix = d.choix || 0;
        etat.pieces = d.pieces || null;
        etat.ouv = d.ouv || {};
        etat.perso = d.perso || null;
        etat.iv = typeof d.iv === 'number' ? d.iv : 0; etat.iniv = d.iniv || 0;
        if (etat.iv === -1 && !etat.perso) etat.iv = 0;
        etat.vue = d.vue || '2d';
      }
    } catch (e) { /* mémoire illisible : on repart des valeurs par défaut */ }
    try { etat.fonds = JSON.parse(localStorage.getItem(CLE_FONDS) || '{}') || {}; } catch (e) { etat.fonds = {}; }
  }

  function exporter() {
    const blob = new Blob([JSON.stringify({criteres: etat.criteres, pieces: etat.pieces,
      ouv: etat.ouv, perso: etat.perso, projet: etat.projet, ambiances: etat.ambiances, choix: etat.choix}, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'naoplan-' + (etat.criteres.nom || 'projet').replace(/[^\w-]+/g, '-').toLowerCase() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Projet enregistré.');
  }

  function importer(f) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d.criteres) throw 0;
        etat.criteres = Object.assign({}, CRIT_PLUS, NP.defauts(), d.criteres);
        etat.projet = Object.assign({}, PROJET_DEFAUT, d.projet || {});
        etat.ambiances = d.ambiances || {general: {}, pieces: {}};
        if (!etat.ambiances.pieces) etat.ambiances.pieces = {};
        etat.pieces = d.pieces || null;
        etat.ouv = d.ouv || {};
        etat.perso = d.perso || null;
        etat.iv = etat.perso ? -1 : 0;
        etat.sel = etat.selOuv = etat.selMeuble = null;
        etat.choix = d.choix || 0;
        etat.res = NP.generer(etat.criteres, etat.pieces, etat.ouv);
        etat.pieces = etat.res.pieces;
        perime();
        afficherEtape(etat.perso ? 4 : 3);
        toast('Projet chargé.');
      } catch (e) { toast('Ce fichier n\'est pas un projet NaoPlan.'); }
    };
    r.readAsText(f);
  }

  /* ============================================================
     LES m² À LA DEMANDE
     Un interrupteur, jumeau de celui du thème. Allumé, les surfaces
     arrivent une à une, pièce après pièce, dans l'ordre de lecture :
     chaque nombre part de zéro et compte jusqu'à sa valeur, avec un
     petit bond et une étincelle quand il atteint son but.
     ============================================================ */
  const CLE_M2 = 'naoplan.m2';

  function majInterrupteurM2() {
    const b = el('m2-switch');
    if (!b) return;
    b.setAttribute('aria-checked', etat.m2 ? 'true' : 'false');
  }

  function basculerM2() {
    etat.m2 = !etat.m2;
    try { localStorage.setItem(CLE_M2, etat.m2 ? '1' : '0'); } catch (e) {}
    majInterrupteurM2();
    rendre();
    if (etat.m2) animerM2();
    else toast('Surfaces masquées.');
  }

  function animerM2() {
    /* Dans l'ordre de lecture : de haut en bas, puis de gauche à droite. */
    const vals = Array.from(document.querySelectorAll('#scene .m2-val'));
    const dims = Array.from(document.querySelectorAll('#scene .m2-dim'));
    const cartes = Array.from(document.querySelectorAll('#liste-pieces .surf-pc'));
    const lig = n => { const r = n.getBoundingClientRect(); return {n: n, y: Math.round(r.top / 20), x: r.left, r: r}; };
    const ordre = vals.map(lig).sort((a, b) => a.y - b.y || a.x - b.x);
    if (calme()) return;
    const pas = Math.max(90, Math.min(220, 2400 / Math.max(1, ordre.length)));
    [].concat(dims, cartes).forEach(n => { n.style.opacity = 0; });
    ordre.forEach((o, i) => {
      const n = o.n, v = +n.getAttribute('data-v') || 0;
      n.style.opacity = 0;
      setTimeout(() => {
        n.style.opacity = 1;
        n.animate([{transform: 'scale(.4)', opacity: 0}, {transform: 'scale(1.25)', opacity: 1, offset: .6},
                   {transform: 'scale(1)'}], {duration: 520, easing: 'cubic-bezier(.2,.9,.3,1.3)'});
        /* Le compteur : de 0 à la surface, en un peu plus d'une demi-seconde. */
        const t0 = performance.now(), D = 620;
        const tic = t => {
          const f = Math.min(1, (t - t0) / D);
          const e = 1 - Math.pow(1 - f, 3);
          n.textContent = m2(v * e);
          if (f < 1) requestAnimationFrame(tic);
          else {
            n.textContent = m2(v);
            etincelles(o.r.left + o.r.width / 2, o.r.top + o.r.height / 2, .35);
          }
        };
        requestAnimationFrame(tic);
      }, i * pas);
    });
    /* Les dimensions et les cartes suivent, une fois tous les nombres posés. */
    const fin = ordre.length * pas + 300;
    setTimeout(() => {
      dims.forEach((n, i) => setTimeout(() => {
        n.style.opacity = 1;
        n.animate([{opacity: 0}, {opacity: 1}], {duration: 350});
      }, i * 40));
      cartes.forEach((n, i) => setTimeout(() => {
        n.style.opacity = 1;
        n.animate([{opacity: 0, transform: 'translateY(6px)'}, {opacity: 1, transform: 'none'}], {duration: 320});
      }, i * 60));
    }, fin);
  }

  /* ============================================================
     LE THÈME
     ============================================================ */
  /* ============================================================
     ♻️ REMETTRE L'OUTIL À NEUF
     ------------------------------------------------------------
     NaoPlan redevient vierge, comme au premier jour d'une nouvelle
     personne : plus de projet, plus de plan, plus de plans gardés,
     plus d'images, plus de réglages. C'est définitif — d'où la
     sauvegarde proposée et le mot à taper avant de valider.
     ============================================================ */
  function comptesRaz() {
    let pieces = 0, meubles = 0, niveaux = 0;
    if (etat.perso) {
      pieces = etat.perso.pieces.length;
      niveaux = etat.perso.niveaux.length;
      etat.perso.niveaux.forEach(n => { meubles += (n.meubles || []).length; });
    }
    return {pieces: pieces, meubles: meubles, niveaux: niveaux,
      gardes: gouttiere.length,
      images: Object.keys(etat.fonds || {}).length,
      ambiances: Object.keys((etat.ambiances && etat.ambiances.pieces) || {}).length,
      projet: !!(etat.criteres.nom || etat.projet.lieu || etat.projet.envies || etat.projet.budget)};
  }

  function ouvrirRaz() {
    const c = comptesRaz();
    const ligne = (em, t, d) => '<div class="raz-item"><span class="em">' + em + '</span><div><b>' + t + '</b><small>' + d + '</small></div></div>';
    el('modale').innerHTML = '<div class="modale-fond"><div class="modale" role="dialog" aria-label="Réinitialiser NaoPlan">' +
      '<div class="modale-hd"><h2>♻️ Réinitialiser NaoPlan</h2>' +
      '<button class="mini-btn" data-raz="fermer" aria-label="Fermer">✕</button></div>' +
      '<p class="modale-intro">L\'outil redevient <b>vierge</b>, comme pour une nouvelle personne. ' +
      'Tout ce qui suit est effacé <b>définitivement</b>, sur cet ordinateur : il n\'y a pas de retour en arrière.</p>' +
      '<div class="raz-liste">' +
      ligne('🏷️', 'Le projet et les critères', c.projet ? esc(etat.criteres.nom || 'Projet sans nom') + ' — nom, calendrier, foyer, budget, envies' : 'rien de saisi pour l\'instant') +
      ligne('✏️', 'Mon plan', etat.perso ? c.pieces + ' pièce' + (c.pieces > 1 ? 's' : '') + ' sur ' + c.niveaux + ' niveau' + (c.niveaux > 1 ? 'x' : '') +
        (c.meubles ? ' · ' + c.meubles + ' meuble' + (c.meubles > 1 ? 's' : '') : '') : 'aucun plan personnalisé') +
      ligne('🗂️', 'Les plans gardés', c.gardes ? c.gardes + ' plan' + (c.gardes > 1 ? 's' : '') + ' dans la gouttière' : 'la gouttière est vide') +
      ligne('🖼️', 'Les images de plan importées', c.images ? c.images + ' calque' + (c.images > 1 ? 's' : '') : 'aucune image') +
      ligne('🎨', 'Les ambiances', c.ambiances ? c.ambiances + ' pièce' + (c.ambiances > 1 ? 's' : '') + ' décorée' + (c.ambiances > 1 ? 's' : '') : 'aucun choix de matières') +
      ligne('⚙️', 'Les réglages', 'thème clair/sombre et affichage des m² reviennent par défaut') +
      '</div>' +
      '<div class="raz-conseil"><span class="em">💾</span><div><b>Gardez d\'abord une sauvegarde</b>' +
      '<small>Un fichier <code>.json</code> que vous pourrez recharger plus tard avec 📂 Charger.</small></div>' +
      '<button class="btn" type="button" data-raz="sauver">Enregistrer le projet</button></div>' +
      '<div class="raz-mot"><label for="raz-saisie">Pour confirmer, tapez <b>EFFACER</b></label>' +
      '<input id="raz-saisie" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER"></div>' +
      '<div class="modale-pied"><button class="btn" type="button" data-raz="fermer">Annuler</button>' +
      '<button class="btn danger" type="button" data-raz="go" disabled>♻️ Tout effacer</button></div>' +
      '</div></div>';
    el('modale').classList.add('on');
    const saisie = el('raz-saisie'), go = el('modale').querySelector('[data-raz="go"]');
    const verifier = () => { go.disabled = saisie.value.trim().toUpperCase() !== 'EFFACER'; };
    saisie.addEventListener('input', verifier);
    saisie.addEventListener('keydown', e => { if (e.key === 'Enter' && !go.disabled) go.click(); });
    setTimeout(() => saisie.focus(), 60);
  }

  function reinitialiserOutil() {
    /* La mémoire du navigateur, d'abord : plus rien ne doit revenir au rechargement. */
    [CLE, CLE_FONDS, CLE_GOUTTIERE, CLE_M2, CLE_THEME].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) { /* navigation privée : tant pis */ }
    });
    /* Puis l'état en mémoire : exactement celui d'un premier démarrage. */
    etat.criteres = Object.assign({}, CRIT_PLUS, NP.defauts());
    etat.projet = Object.assign({}, PROJET_DEFAUT);
    etat.ambiances = {general: {}, pieces: {}};
    etat.pieces = null; etat.ouv = {}; etat.perso = null; etat.fonds = {};
    etat.iv = 0; etat.choix = 0; etat.iniv = 0; etat.vue = '2d'; etat.outil = 'main';
    etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = etat.selMeuble = null;
    etat.arme = null; etat.cat = 'chambre'; etat.m2 = false; etat.etape = 1;
    gouttiere = [];
    Object.keys(aComparer).forEach(k => { delete aComparer[k]; });
    Object.keys(etapesQuittees).forEach(k => { delete etapesQuittees[k]; });
    filtreProjet = 'courant';
    histo.pile = []; histo.i = -1;
    fermerImport();
    majInterrupteurM2();
    theme(matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    etat.res = NP.generer(etat.criteres, null, {});
    etat.pieces = etat.res.pieces;
    perime();
    afficherEtape(1);
    rendreGouttiere();
    majFleches();
    const t = el('topbar-raz');
    if (t) t.animate([{transform: 'rotate(0)'}, {transform: 'rotate(-360deg)'}], {duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)'});
    toast('NaoPlan est vierge ✨ On repart de l\'étape 1.');
  }

  function theme(v) {
    const b = el('theme-switch');
    document.documentElement.setAttribute('data-theme', v);
    b.setAttribute('aria-checked', v === 'dark' ? 'true' : 'false');
    el('theme-icon').textContent = v === 'dark' ? '🌙' : '☀️';
    try { localStorage.setItem(CLE_THEME, v); } catch (e) {}
  }

  /* ============================================================
     LE PARCOURS EN SIX ÉTAPES
     ------------------------------------------------------------
     Comme dans NaoFi : un rail à gauche, un bandeau en tête, un dock
     Précédent / Suivant en bas.
       1 Le projet          — nom, calendrier, foyer, budget
       2 Les critères       — tout, dans le détail
       3 Les plans          — des variantes figées : on choisit,
                              on imprime… ou on continue
       4 Personnalisation   — facultatif : pièces, murs, portes, fenêtres
       5 Aménagement        — facultatif : les meubles (accessible
                              directement depuis l'étape 3)
       6 Ambiances          — facultatif : couleurs, matières, motifs,
                              pièce par pièce, puis le récapitulatif
     ============================================================ */
  const ETAPES = [
    {n: 1, nom: 'Le projet', phrase: 'Son nom, pour quand, pour qui : le cadre, avant les murs.',
     icone: '<path d="M4 20V10l8-6 8 6v10"/><path d="M9.5 20v-5.5h5V20"/>'},
    {n: 2, nom: 'Les critères', phrase: 'Tout ce que vous voulez, dans le détail : pièces, équipements, extérieurs, piscine, stationnement.',
     icone: '<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>'},
    {n: 3, nom: 'Les plans', phrase: 'Plusieurs variantes, prêtes à imprimer. Choisissez celle qui vous plaît — ou allez plus loin.',
     icone: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 11h8V4.5M11.5 15v4.5M15 11h5.5"/>'},
    {n: 4, nom: 'Personnalisation', facultatif: true, phrase: 'Déplacez les pièces, tirez les murs, posez et tournez portes et fenêtres.',
     icone: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>'},
    {n: 5, nom: 'Aménagement', facultatif: true, phrase: 'Posez les meubles de base pour vous projeter : lits, cuisine, salle de bain, canapé, piscine…',
     icone: '<path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M3.5 12.5a1.5 1.5 0 0 1 3 0V15h11v-2.5a1.5 1.5 0 0 1 3 0V18h-17z"/><path d="M5.5 18v1.5M18.5 18v1.5"/>'},
    {n: 6, nom: 'Ambiances', facultatif: true, phrase: 'Couleurs, matières et motifs, pièce par pièce — puis le récapitulatif de vos choix.',
     icone: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.4-2l-.3-.8c-.4-1.1.4-2.2 1.6-2.2H17a3.5 3.5 0 0 0 3.5-3.5c0-4.7-3.8-8.5-8.5-8.5z"/><circle cx="7.8" cy="11" r="1.1"/><circle cx="10.5" cy="7.5" r="1.1"/><circle cx="15" cy="7.8" r="1.1"/>'}
  ];

  /* Le projet lui-même : ce qui ne dessine rien mais cadre tout. */
  const PROJET_DEFAUT = {operation: 'neuf', lieu: '', debut: '', emmenagement: '', duree: '',
    adultes: 2, enfants: 0, agesEnfants: '', animaux: false, teletravail: 0, pmr: false, invites: false,
    budget: '', budgetTravaux: '', envies: ''};
  /* Les critères détaillés qui ne changent pas la découpe du plan, mais
     vont au récapitulatif (et au professionnel qui le lira). */
  const CRIT_PLUS = {
    style: 'contemporain', toiture: '2pans', hsp: '2,50 m', orientation: 'sud',
    chambreAmis: false, placards: true,
    doucheBain: 'douche', doubleVasque: false, wcEtage: false,
    cuisineForme: 'L', cheminee: 'aucune', autresPieces: '',
    terrasseMat: 'composite', terrasseCouverte: false, potager: false, arrosage: false, cloture: 'aucune',
    piscineProf: '1,50 m', piscineChauffage: 'aucun', piscineCouverture: 'volet', piscineLocal: true,
    piscineMargelle: 'pierre', piscineTraitement: 'sel', piscineEclairage: true,
    placesExt: 0, borneRecharge: false,
    chauffage: 'pac-eau', plancherChauffant: false, clim: false, menuiseries: 'alu', volets: 'roulants-elec',
    domotique: false, solaire: false, recupEau: false
  };

  const etapesQuittees = {};

  function afficherEtape(n, opts) {
    opts = opts || {};
    n = Math.max(1, Math.min(ETAPES.length, n | 0));
    const avant = etat.etape;
    if (n !== avant) etapesQuittees[avant] = true;
    etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = etat.selMeuble = null;
    etat.arme = null;
    if (n === 3) {
      /* Les plans proposés, figés : on regarde, on choisit. */
      if (etat.iv === -1 || etat.iv == null) etat.iv = etat.choix || 0;
      etat.outil = 'main';
    } else if (n === 4 || n === 5) {
      entrerPerso();
      etat.outil = n === 5 ? 'meubler' : (etat.outil === 'meubler' ? 'main' : etat.outil);
    } else if (n === 6) {
      etat.iv = etat.perso ? -1 : (etat.choix || 0);
    }
    if (n === 5 && etat.vue !== '2d') etat.vue = '2d';
    etat.etape = n;
    perime();
    document.body.setAttribute('data-etape', n);
    let rang = 0;
    document.querySelectorAll('.centre [data-etapes]').forEach(s => {
      const on = s.getAttribute('data-etapes').split(' ').indexOf(String(n)) >= 0;
      s.classList.toggle('etape-off', !on);
      s.classList.remove('etape-entree');
      if (on && !opts.calme) { s.style.animationDelay = (rang++ * 70) + 'ms'; void s.offsetWidth; s.classList.add('etape-entree'); }
    });
    if (n === 1) rendreProjet();
    if (n === 2) el('colg').innerHTML = formulaire();
    rendre();
    if (n === 6) { rendreAmbiances(); rendreRecap(); }
    rendreParcours();
    if (!opts.calme) window.scrollTo({top: 0, behavior: 'smooth'});
    sauver();
  }

  /* Entrer dans « Mon plan » : on fige la variante choisie, sauf si un
     plan personnalisé existe déjà. */
  function entrerPerso() {
    if (!etat.perso) {
      etat.iv = etat.choix || 0;
      perime();
      assurerPerso();
    }
    etat.iv = -1;
  }

  /* Depuis l'étape 3 : personnaliser (4) ou aménager directement (5)
     la variante choisie. Si un « Mon plan » d'une autre variante existe,
     on demande avant de le remplacer. */
  function continuerAvec(n) {
    const v = etat.res.variantes[etat.choix || 0];
    if (etat.perso && v && etat.perso.base !== v.cle) {
      const oui = confirm('Partir de la variante ' + v.cle + ' ?\n\nVotre plan personnalisé actuel (d\'après la variante ' +
        etat.perso.base + ') sera remplacé. Pour le garder, annulez puis « Gardez-le » dans la gouttière.');
      if (oui) { etat.perso = null; perime(); }
    }
    afficherEtape(n);
  }

  function rendreParcours() {
    rendreBanniere();
    rendreRail();
    majDock();
  }

  function rendreBanniere() {
    const e = ETAPES[etat.etape - 1];
    el('etape-banniere').innerHTML = '<div class="eb-icone"><svg viewBox="0 0 24 24" aria-hidden="true">' + e.icone + '</svg></div>' +
      '<div class="eb-texte"><div class="eb-num">Étape ' + e.n + ' sur ' + ETAPES.length + (e.facultatif ? ' · facultative' : '') + '</div>' +
      '<div class="eb-nom">' + esc(e.nom) + '</div><div class="eb-phrase">' + esc(e.phrase) + '</div></div>' +
      '<div class="eb-points" aria-hidden="true">' + ETAPES.map(x => '<i class="' + (x.n <= etat.etape ? 'on' : '') +
        (x.n === etat.etape ? ' ici' : '') + '"></i>').join('') + '</div>';
  }

  function etatEtape(n) {
    if (n === etat.etape) return 'actif';
    if (etapesQuittees[n] || n < etat.etape) return 'faite';
    return 'avenir';
  }

  function rendreRail() {
    const h = new Date().getHours();
    const salut = (h >= 18 || h < 5) ? 'Bonsoir' : 'Bonjour';
    const faites = ETAPES.filter(e => etatEtape(e.n) === 'faite').length;
    const pct = Math.round(faites / ETAPES.length * 100);
    const SIGNES = {faite: '<path d="M4 12.5l5 5L20 6.5"/>', actif: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
                    avenir: '<circle cx="12" cy="12" r="3.5"/>'};
    const c = etat.criteres, p = etat.projet;
    let s = '<div class="rail-accueil"><div class="ra-salut">' + salut + '</div>' +
      '<div class="ra-projet">' + esc(c.nom || 'Nouveau projet') + '</div>' +
      '<div class="ra-date">' + new Date().toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'}) + '</div></div>' +
      '<div class="rail-carte"><div class="rail-titre">Avancement du projet</div>' +
      '<div class="rail-jauge' + (faites === ETAPES.length ? ' complet' : '') + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="rail-pct">' + faites + ' étape' + (faites > 1 ? 's' : '') + ' sur ' + ETAPES.length + ' — ' + pct + ' %</div>' +
      '<ol class="rail-liste">';
    ETAPES.forEach((e, i) => {
      const et = etatEtape(e.n);
      s += '<li><button type="button" class="rail-item ' + et + '" data-aller="' + e.n + '"' + (et === 'actif' ? ' aria-current="step"' : '') + '>' +
        '<span class="rail-pastille"><svg viewBox="0 0 24 24" aria-hidden="true">' + e.icone + '</svg></span>' +
        '<span class="rail-corps"><span class="rail-nom">' + esc(e.nom) + '</span>' +
        (e.facultatif ? '<span class="rail-compte">facultative</span>' : '') + '</span>' +
        '<span class="rail-etat"><svg viewBox="0 0 24 24" aria-hidden="true">' + SIGNES[et] + '</svg></span></button></li>';
      if (i < ETAPES.length - 1) {
        const on = et === 'faite' ? 3 : et === 'actif' ? 1 : 0;
        s += '<li class="rail-liaison" aria-hidden="true">' + [0, 1, 2].map(k => '<i class="' + (k < on ? 'on' : '') + '"></i>').join('') + '</li>';
      }
    });
    s += '</ol></div>';
    /* Le projet d'un coup d'œil. */
    const T = TYPES.filter(t => t.cle === c.type)[0];
    const v = etat.res && etat.res.variantes[etat.choix || 0];
    s += '<div class="rail-carte rail-resume"><div class="rail-titre">En bref</div>' +
      '<div class="rr"><span>' + T.em + '</span>' + T.nom + ' · ' + Math.round(c.surface) + ' m²</div>' +
      '<div class="rr"><span>🛏️</span>' + c.chambres + ' chambre' + (c.chambres > 1 ? 's' : '') + ' · ' + c.niveaux + ' niveau' + (c.niveaux > 1 ? 'x' : '') + '</div>' +
      (c.piscine && c.type !== 'appartement' ? '<div class="rr"><span>🏊</span>Piscine ' + esc(libelle(OPTIONS.piscineForme, c.piscineForme).toLowerCase()) + '</div>' : '') +
      (p.emmenagement ? '<div class="rr"><span>📅</span>Emménagement ' + esc(moisLisible(p.emmenagement)) + '</div>' : '') +
      (v ? '<div class="rr"><span>' + (etat.perso ? '✏️' : v.emoji) + '</span>' + (etat.perso ? 'Mon plan (d\'après ' + esc(etat.perso.base) + ')' : 'Variante ' + v.cle) + '</div>' : '') +
      '</div>';
    el('rail').innerHTML = s;
  }

  function majDock() {
    const n = etat.etape;
    const p = ETAPES[n - 2], s = ETAPES[n];
    el('dock-prec').disabled = !p;
    el('dock-suiv').disabled = !s;
    el('dock-prec-nom').textContent = p ? p.nom : 'Début';
    el('dock-suiv-nom').textContent = s ? s.nom : 'Fin du parcours';
    const num = el('dock-num'), txt = n + ' / ' + ETAPES.length;
    if (num.textContent !== txt) { num.textContent = txt; num.classList.remove('bascule'); void num.offsetWidth; num.classList.add('bascule'); }
    el('dock-jauge').style.width = ((n - 1) / (ETAPES.length - 1) * 100).toFixed(1) + '%';
  }

  const moisLisible = m => {
    if (!m) return '';
    const d = new Date(m + '-01T12:00:00');
    return isNaN(d) ? m : d.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
  };

  /* ---------- Étape 1 : le projet ---------- */
  const OPERATIONS = [['neuf', '🏗️', 'Construction neuve'], ['vefa', '📐', 'Achat sur plan (VEFA)'],
    ['ancien', '🔑', 'Achat dans l\'ancien'], ['renovation', '🛠️', 'Rénovation'], ['extension', '➕', 'Extension']];

  function champP(cle, label, aide, attrs) {
    const v = etat.projet[cle];
    return '<div class="lig"><label>' + label + '</label><input ' + (attrs || 'type="text"') + ' data-proj="' + cle + '" value="' + esc(v == null ? '' : v) + '">' +
      (aide ? '<div class="aide">' + aide + '</div>' : '') + '</div>';
  }
  function interP(cle, label) {
    return '<label class="opt"><span>' + label + '</span><input type="checkbox" data-proj="' + cle + '"' + (etat.projet[cle] ? ' checked' : '') + '></label>';
  }
  function compteurP(cle, label, max) {
    return '<div class="lig"><label>' + label + '</label><div class="compteur">' +
      '<button type="button" data-pcpt="' + cle + '" data-pas="-1" data-max="' + max + '">−</button><span>' + (etat.projet[cle] || 0) + '</span>' +
      '<button type="button" data-pcpt="' + cle + '" data-pas="1" data-max="' + max + '">+</button></div></div>';
  }

  function dureeCalculee() {
    const p = etat.projet;
    if (!p.debut || !p.emmenagement) return '';
    const a = p.debut.split('-').map(Number), b = p.emmenagement.split('-').map(Number);
    const m = (b[0] - a[0]) * 12 + (b[1] - a[1]);
    return m > 0 ? m + ' mois' : '';
  }

  function rendreProjet() {
    const p = etat.projet, c = etat.criteres;
    let s = '<div class="etape-grille">';
    s += '<div class="card"><div class="hd"><h2>🏷️ Le projet</h2></div><div class="bd"><div class="champs">' +
      '<div class="lig"><label>Nom du projet</label><input type="text" id="f-nom" value="' + esc(c.nom || '') + '" placeholder="Ex. Maison de Lucie à Nantes"></div>' +
      '<div class="lig"><label>Type d\'opération</label><div class="puces">' +
      OPERATIONS.map(o => '<button type="button" class="puce' + (p.operation === o[0] ? ' on' : '') + '" data-pchoix="operation" data-val="' + o[0] + '">' +
        '<span>' + o[1] + '</span>' + o[2] + '</button>').join('') + '</div></div>' +
      champP('lieu', 'Commune ou quartier', 'Pour situer le projet — rien n\'est envoyé nulle part.', 'type="text" placeholder="Ex. Saint-Herblain (44)"') +
      '</div></div></div>';
    const duree = dureeCalculee();
    s += '<div class="card"><div class="hd"><h2>📅 Le calendrier</h2><span class="hint">Pour quand ?</span></div><div class="bd"><div class="champs">' +
      '<div class="duo">' + champP('debut', 'Début du projet', 'Achat, dépôt du permis ou premiers travaux', 'type="month"') +
      champP('emmenagement', 'Emménagement souhaité', 'La date qui compte pour vous', 'type="month"') + '</div>' +
      '<div class="lig"><label>Durée du projet</label><input type="text" data-proj="duree" value="' + esc(p.duree || duree) + '" placeholder="' +
        (duree ? duree : 'Ex. 14 mois') + '"><div class="aide">' + (duree ? 'Calculée d\'après vos deux dates : ' + duree + '. Vous pouvez la corriger.' :
        'Remplissez les deux dates pour la calculer, ou tapez-la.') + '</div></div>' +
      '</div></div></div>';
    s += '<div class="card"><div class="hd"><h2>👨‍👩‍👧 Le foyer</h2><span class="hint">Pour qui ?</span></div><div class="bd"><div class="champs">' +
      '<div class="duo">' + compteurP('adultes', 'Adultes', 8) + compteurP('enfants', 'Enfants', 10) + '</div>' +
      (p.enfants > 0 ? champP('agesEnfants', 'Âge des enfants', 'Utile pour penser les chambres et la salle de bain', 'type="text" placeholder="Ex. 4 et 9 ans"') : '') +
      '<div class="duo">' + compteurP('teletravail', 'Postes de télétravail', 4) + '<div></div></div>' +
      '<div class="opts">' + interP('animaux', 'Animaux de compagnie') + interP('invites', 'On reçoit souvent (famille, amis qui dorment)') +
        interP('pmr', 'Besoin d\'accessibilité (plain-pied, personne à mobilité réduite)') + '</div>' +
      '</div></div></div>';
    s += '<div class="card"><div class="hd"><h2>💶 Le budget</h2><span class="hint">Indicatif</span></div><div class="bd"><div class="champs">' +
      '<div class="duo">' + champP('budget', 'Budget global', 'Terrain, bâti, frais — en €', 'type="text" inputmode="numeric" placeholder="Ex. 350 000"') +
      champP('budgetTravaux', 'Dont travaux / aménagement', 'En €', 'type="text" inputmode="numeric" placeholder="Ex. 40 000"') + '</div>' +
      '<div class="aide">Pour étudier le financement, ouvrez NaoFi depuis NaoGroup.</div>' +
      '</div></div></div>';
    s += '<div class="card large"><div class="hd"><h2>📝 Vos envies, en quelques mots</h2></div><div class="bd">' +
      '<textarea data-proj="envies" rows="4" placeholder="Ex. Une grande pièce de vie lumineuse ouverte sur le jardin, une suite parentale au calme, un cellier près de la cuisine…">' +
      esc(p.envies || '') + '</textarea></div></div>';
    el('etape-projet').innerHTML = s + '</div>';
  }

  /* ---------- Étape 3 : choisir une variante ---------- */
  function choixPlan() {
    if (etat.etape !== 3 || !etat.res) return '';
    const r = etat.res;
    let s = '<div class="card choix-card"><div class="hd"><h2>🧭 Quelle variante vous plaît ?</h2>' +
      '<span class="hint">Les plans proposés ne se modifient pas ici : choisissez, imprimez — ou continuez vers la personnalisation.</span></div>' +
      '<div class="bd"><div class="variantes">';
    r.variantes.forEach((v, i) => {
      const f = NP.figer(v, etat.pieces);
      s += '<button type="button" class="variante' + (i === etat.iv ? ' on' : '') + '" data-choix="' + i + '">' +
        '<div class="vr-mini">' + miniature(f, Math.min(etat.iniv, f.niveaux.length - 1)) + '</div>' +
        '<div class="vr-nom"><span>' + v.emoji + '</span> Variante ' + v.cle + '</div>' +
        '<div class="vr-sous">' + esc(v.nom) + '</div><div class="vr-note">' + esc(v.note) + '</div>' +
        (i === etat.iv ? '<span class="vr-coche">✓ Choisie</span>' : '') + '</button>';
    });
    s += '</div><div class="choix-actions">' +
      '<div class="ca-groupe"><div class="ca-titre">Ce plan me convient</div>' +
      '<button class="btn" type="button" data-choixact="imprimer">🖨️ Imprimer</button>' +
      '<button class="btn" type="button" data-choixact="pdf">📄 Télécharger le PDF</button>' +
      '<button class="btn" type="button" data-choixact="enregistrer">💾 Enregistrer le projet</button>' +
      '<button class="btn" type="button" data-choixact="garder">📌 Garder pour comparer</button></div>' +
      '<div class="ca-groupe"><div class="ca-titre">Je veux aller plus loin</div>' +
      '<button class="btn primary" type="button" data-choixact="personnaliser">✏️ Personnaliser ce plan <small>étape 4</small></button>' +
      '<button class="btn primary doux" type="button" data-choixact="amenager">🛋️ Aménager directement <small>étape 5</small></button>' +
      '<button class="btn" type="button" data-choixact="importer">🖼️ J\'ai déjà un plan (image)</button></div>' +
      '</div>' +
      (etat.perso ? '<div class="aide" style="margin-top:10px">✏️ Vous avez déjà un plan personnalisé (d\'après la variante ' + esc(etat.perso.base) +
        ') : il vous attend à l\'étape 4.</div>' : '') +
      '</div></div>';
    return s;
  }

  function actionChoix(act) {
    if (act === 'imprimer' || act === 'pdf') {
      if (act === 'pdf') toast('Dans la fenêtre d\'impression, choisissez « Enregistrer au format PDF ».');
      setTimeout(() => window.print(), act === 'pdf' ? 500 : 0);
    } else if (act === 'enregistrer') exporter();
    else if (act === 'garder') garderPlan();
    else if (act === 'personnaliser') continuerAvec(4);
    else if (act === 'amenager') continuerAvec(5);
    else if (act === 'importer') el('fondIn').click();
  }

  /* ---------- Étape 6 : les ambiances ---------- */
  const OPTIONS = {
    operation: OPERATIONS.map(o => [o[0], o[2]]),
    style: [['contemporain', 'Contemporain'], ['moderne', 'Moderne'], ['traditionnel', 'Traditionnel'], ['bois', 'Maison bois'],
      ['industriel', 'Industriel / loft'], ['mediterraneen', 'Méditerranéen'], ['longere', 'Longère / charme'], ['cubique', 'Cubique, toit plat']],
    toiture: [['2pans', 'Deux pans'], ['4pans', 'Quatre pans'], ['plat', 'Toit plat'], ['monopente', 'Monopente'], ['mixte', 'Mixte']],
    hsp: [['2,50 m', '2,50 m (standard)'], ['2,70 m', '2,70 m'], ['3,00 m', '3,00 m et plus'], ['cathedrale', 'Séjour cathédrale']],
    orientation: [['sud', 'Plein sud'], ['sud-ouest', 'Sud-ouest'], ['sud-est', 'Sud-est'], ['ouest', 'Ouest'], ['est', 'Est'], ['egal', 'Peu importe']],
    doucheBain: [['douche', 'Douche à l\'italienne'], ['baignoire', 'Baignoire'], ['deux', 'Les deux'], ['bain-douche', 'Baignoire-douche']],
    cuisineForme: [['lineaire', 'Linéaire'], ['L', 'En L'], ['U', 'En U'], ['ilot', 'Avec îlot'], ['parallele', 'Deux linéaires face à face']],
    cheminee: [['aucune', 'Aucun'], ['poele-bois', 'Poêle à bois'], ['poele-granules', 'Poêle à granulés'], ['cheminee', 'Cheminée ouverte'], ['insert', 'Insert']],
    terrasseMat: [['composite', 'Composite'], ['bois', 'Bois (ipé, pin…)'], ['carrelage', 'Carrelage'], ['pierre', 'Pierre naturelle'], ['beton', 'Béton désactivé'], ['dalles', 'Dalles sur plots']],
    cloture: [['aucune', 'Rien de prévu'], ['cloture', 'Clôture seule'], ['portail', 'Clôture + portail manuel'], ['portail-motorise', 'Clôture + portail motorisé']],
    piscineForme: [['rect', 'Rectangulaire'], ['carre', 'Carrée'], ['ronde', 'Ronde'], ['ovale', 'Ovale'], ['haricot', 'Haricot']],
    piscinePose: [['creusee', 'Creusée'], ['semi', 'Semi-enterrée'], ['horssol', 'Hors-sol']],
    piscineProf: [['1,20 m', '1,20 m'], ['1,50 m', '1,50 m'], ['variable', 'Fond variable (1,10 → 2,00 m)'], ['plage', 'Avec plage immergée']],
    piscineChauffage: [['aucun', 'Aucun'], ['pac', 'Pompe à chaleur'], ['solaire', 'Solaire'], ['echangeur', 'Échangeur sur le chauffage']],
    piscineCouverture: [['aucune', 'Aucune'], ['bache', 'Bâche à barres'], ['volet', 'Volet roulant'], ['abri-bas', 'Abri bas'], ['abri-haut', 'Abri haut']],
    piscineMargelle: [['pierre', 'Pierre reconstituée'], ['bois', 'Bois / composite'], ['carrelage', 'Carrelage'], ['travertin', 'Travertin'], ['beton', 'Béton']],
    piscineTraitement: [['sel', 'Électrolyse au sel'], ['chlore', 'Chlore'], ['uv', 'UV / ozone'], ['naturel', 'Naturel (biologique)']],
    chauffage: [['pac-eau', 'Pompe à chaleur air-eau'], ['pac-air', 'Pompe à chaleur air-air'], ['granules', 'Chaudière à granulés'],
      ['gaz', 'Gaz'], ['electrique', 'Électrique'], ['geothermie', 'Géothermie']],
    menuiseries: [['alu', 'Aluminium'], ['pvc', 'PVC'], ['bois', 'Bois'], ['mixte', 'Bois-alu']],
    volets: [['roulants-elec', 'Roulants électriques'], ['roulants', 'Roulants manuels'], ['battants', 'Battants'], ['coulissants', 'Coulissants'], ['aucun', 'Aucun']]
  };
  const libelle = (liste, v) => { const o = (liste || []).find(x => x[0] === v); return o ? o[1] : (v || ''); };

  const SOLS = [['carrelage', 'Carrelage', '#E6E1D8'], ['carrelage-bois', 'Carrelage imitation bois', '#C9A27A'], ['parquet', 'Parquet massif', '#C4945F'],
    ['parquet-contre', 'Parquet contrecollé', '#D2AE80'], ['stratifie', 'Stratifié', '#CDB08A'], ['vinyle', 'Vinyle / LVT', '#D6C7AE'],
    ['beton', 'Béton ciré', '#B8B3AC'], ['marbre', 'Marbre', '#EEECE8'], ['pierre', 'Pierre naturelle', '#CFC3AE'], ['terrazzo', 'Terrazzo', '#ECE7E0'],
    ['tomettes', 'Tomettes', '#B4573D'], ['ciment', 'Carreaux de ciment', '#D9D2C5'], ['moquette', 'Moquette', '#CFC6B8'],
    ['jonc', 'Jonc de mer', '#CDBB93'], ['resine', 'Résine', '#DAD7D2']];
  const MURS = [['peinture-mate', 'Peinture mate', '#EDE9E3'], ['peinture-satin', 'Peinture satinée', '#EDE9E3'], ['papier-peint', 'Papier peint', '#E3DCCF'],
    ['faience', 'Faïence', '#F1EFEB'], ['carrelage', 'Carrelage', '#E6E1D8'], ['marbre', 'Marbre', '#F0EEEA'], ['lambris', 'Lambris bois', '#D4B48A'],
    ['tasseaux', 'Tasseaux bois', '#C39A6B'], ['pierre', 'Pierre apparente', '#C9BBA2'], ['brique', 'Brique', '#A85A43'], ['beton', 'Béton ciré', '#BDB8B1'],
    ['chaux', 'Enduit à la chaux', '#E8DFD0'], ['tadelakt', 'Tadelakt', '#D9C6AA'], ['zellige', 'Zellige', '#6F9E97'], ['acoustique', 'Panneaux acoustiques', '#8C8579']];
  const MOTIFS_SOL = ['Pose droite', 'Grand format', 'Chevrons', 'Point de Hongrie', 'Pose à l\'anglaise', 'Mosaïque', 'Damier', 'Opus romain', 'Hexagonal', 'Uni, sans joint'];
  const MOTIFS_MUR = ['Uni', 'Mur d\'accent', 'Soubassement bicolore', 'Rayures', 'Géométrique', 'Floral', 'Panoramique', 'Arche peinte', 'Crédence seule'];
  const PLAFONDS = ['Blanc', 'Même teinte que les murs', 'Poutres apparentes', 'Lambris bois', 'Faux plafond + spots', 'Plafond foncé (effet cocon)'];
  const STYLES_DECO = ['Contemporain', 'Scandinave', 'Japandi', 'Industriel', 'Bohème', 'Classique chic', 'Méditerranéen', 'Campagne chic', 'Minimaliste', 'Art déco'];
  const ACCENTS = ['Bois clair', 'Bois foncé', 'Marbre blanc', 'Marbre noir', 'Travertin', 'Laiton', 'Noir mat', 'Inox', 'Chrome', 'Rotin', 'Lin',
    'Velours', 'Cuir', 'Verre', 'Béton', 'Céramique', 'Pierre', 'Terracotta'];

  /* Des inspirations toutes prêtes, par type de pièce : un clic remplit la carte. */
  const INSPI = {
    eau: [
      {nom: 'Marbre & bois clair', em: '🤍', style: 'Contemporain', sol: {mat: 'carrelage', couleur: '#E9E6E0', motif: 'Grand format'},
       murs: {mat: 'marbre', couleur: '#F2F0EC', motif: 'Uni'}, plafond: 'Blanc', accents: ['Marbre blanc', 'Bois clair', 'Laiton'], palette: ['#F2F0EC', '#D8BE98', '#B8975A']},
      {nom: 'Zen béton', em: '🪨', style: 'Japandi', sol: {mat: 'beton', couleur: '#B5B0A8', motif: 'Uni, sans joint'},
       murs: {mat: 'tadelakt', couleur: '#D8CBB6', motif: 'Uni'}, plafond: 'Blanc', accents: ['Bois clair', 'Noir mat', 'Lin'], palette: ['#D8CBB6', '#8F8A82', '#2F2D2B']},
      {nom: 'Terrazzo joyeux', em: '🍭', style: 'Bohème', sol: {mat: 'terrazzo', couleur: '#EDE6DD', motif: 'Grand format'},
       murs: {mat: 'faience', couleur: '#E9B8A6', motif: 'Soubassement bicolore'}, plafond: 'Blanc', accents: ['Laiton', 'Terracotta', 'Rotin'], palette: ['#E9B8A6', '#7FA7A0', '#F4EDE3']},
      {nom: 'Carreaux de ciment', em: '🔷', style: 'Classique chic', sol: {mat: 'ciment', couleur: '#D8D2C6', motif: 'Damier'},
       murs: {mat: 'zellige', couleur: '#5F8F92', motif: 'Crédence seule'}, plafond: 'Blanc', accents: ['Chrome', 'Céramique'], palette: ['#5F8F92', '#F1EEE8', '#2E3B4E']}
    ],
    cuisine: [
      {nom: 'Bois & blanc', em: '🌿', style: 'Scandinave', sol: {mat: 'parquet-contre', couleur: '#D6B488', motif: 'Pose droite'},
       murs: {mat: 'peinture-mate', couleur: '#F3F0EA', motif: 'Uni'}, plafond: 'Blanc', accents: ['Bois clair', 'Céramique', 'Lin'], palette: ['#F3F0EA', '#D6B488', '#7B8F6A']},
      {nom: 'Noir mat & laiton', em: '🖤', style: 'Art déco', sol: {mat: 'marbre', couleur: '#E9E6E1', motif: 'Chevrons'},
       murs: {mat: 'peinture-mate', couleur: '#2E2D2F', motif: 'Mur d\'accent'}, plafond: 'Blanc', accents: ['Noir mat', 'Laiton', 'Marbre blanc'], palette: ['#2E2D2F', '#C6A15B', '#EDEAE4']},
      {nom: 'Béton & inox', em: '🏭', style: 'Industriel', sol: {mat: 'beton', couleur: '#A9A49C', motif: 'Uni, sans joint'},
       murs: {mat: 'brique', couleur: '#A55E47', motif: 'Mur d\'accent'}, plafond: 'Poutres apparentes', accents: ['Inox', 'Noir mat', 'Bois foncé'], palette: ['#A9A49C', '#A55E47', '#2B2B2B']},
      {nom: 'Provence', em: '🌻', style: 'Méditerranéen', sol: {mat: 'tomettes', couleur: '#B55A3E', motif: 'Hexagonal'},
       murs: {mat: 'chaux', couleur: '#EFE4D2', motif: 'Uni'}, plafond: 'Poutres apparentes', accents: ['Terracotta', 'Bois clair', 'Céramique'], palette: ['#EFE4D2', '#8FA5C2', '#B55A3E']}
    ],
    nuit: [
      {nom: 'Cocon lin & bois', em: '🛏️', style: 'Japandi', sol: {mat: 'parquet', couleur: '#C9A073', motif: 'Pose à l\'anglaise'},
       murs: {mat: 'peinture-mate', couleur: '#D9CBB8', motif: 'Mur d\'accent'}, plafond: 'Même teinte que les murs', accents: ['Lin', 'Bois clair', 'Rotin'], palette: ['#D9CBB8', '#A58A6C', '#F4F0E9']},
      {nom: 'Bleu nuit', em: '🌙', style: 'Contemporain', sol: {mat: 'parquet', couleur: '#8E6B4A', motif: 'Point de Hongrie'},
       murs: {mat: 'peinture-mate', couleur: '#26344A', motif: 'Mur d\'accent'}, plafond: 'Blanc', accents: ['Velours', 'Laiton', 'Bois foncé'], palette: ['#26344A', '#C9A15F', '#EDE9E2']},
      {nom: 'Scandinave doux', em: '☁️', style: 'Scandinave', sol: {mat: 'stratifie', couleur: '#DCC4A0', motif: 'Pose droite'},
       murs: {mat: 'peinture-mate', couleur: '#EEE7DF', motif: 'Soubassement bicolore'}, plafond: 'Blanc', accents: ['Bois clair', 'Lin', 'Céramique'], palette: ['#EEE7DF', '#C9B8A8', '#8FA39A']},
      {nom: 'Terracotta', em: '🧡', style: 'Bohème', sol: {mat: 'jonc', couleur: '#CDB88F', motif: 'Pose droite'},
       murs: {mat: 'chaux', couleur: '#C57B5B', motif: 'Arche peinte'}, plafond: 'Blanc', accents: ['Rotin', 'Terracotta', 'Lin'], palette: ['#C57B5B', '#EAD9C3', '#6E7B5B']}
    ],
    jour: [
      {nom: 'Chaleureux bois & lin', em: '🌾', style: 'Scandinave', sol: {mat: 'parquet', couleur: '#C79C6A', motif: 'Chevrons'},
       murs: {mat: 'peinture-mate', couleur: '#EFE9E0', motif: 'Uni'}, plafond: 'Blanc', accents: ['Bois clair', 'Lin', 'Céramique'], palette: ['#EFE9E0', '#C79C6A', '#6F7F63']},
      {nom: 'Loft industriel', em: '🏙️', style: 'Industriel', sol: {mat: 'beton', couleur: '#A7A29B', motif: 'Uni, sans joint'},
       murs: {mat: 'brique', couleur: '#9E5842', motif: 'Mur d\'accent'}, plafond: 'Poutres apparentes', accents: ['Noir mat', 'Cuir', 'Bois foncé'], palette: ['#A7A29B', '#9E5842', '#262626']},
      {nom: 'Japandi', em: '🎋', style: 'Japandi', sol: {mat: 'parquet-contre', couleur: '#D5B996', motif: 'Pose droite'},
       murs: {mat: 'chaux', couleur: '#E4DBCD', motif: 'Uni'}, plafond: 'Lambris bois', accents: ['Bois clair', 'Pierre', 'Lin'], palette: ['#E4DBCD', '#9C8B76', '#3A3632']},
      {nom: 'Méditerranée', em: '🌊', style: 'Méditerranéen', sol: {mat: 'pierre', couleur: '#D8CCB6', motif: 'Opus romain'},
       murs: {mat: 'chaux', couleur: '#F4EEE3', motif: 'Uni'}, plafond: 'Poutres apparentes', accents: ['Terracotta', 'Rotin', 'Céramique'], palette: ['#F4EEE3', '#3F6F8F', '#C77B4F']}
    ],
    autre: [
      {nom: 'Sobre blanc & bois', em: '🤍', style: 'Minimaliste', sol: {mat: 'carrelage', couleur: '#E5E0D8', motif: 'Grand format'},
       murs: {mat: 'peinture-mate', couleur: '#F2EFEA', motif: 'Uni'}, plafond: 'Blanc', accents: ['Bois clair'], palette: ['#F2EFEA', '#CFB592', '#8C8C8C']},
      {nom: 'Couleur franche', em: '🎨', style: 'Contemporain', sol: {mat: 'vinyle', couleur: '#D4C6AE', motif: 'Pose droite'},
       murs: {mat: 'peinture-mate', couleur: '#5E7F6E', motif: 'Mur d\'accent'}, plafond: 'Blanc', accents: ['Laiton', 'Bois clair'], palette: ['#5E7F6E', '#E8DFD2', '#C69A5C']}
    ]
  };
  const familleInspi = t => ['sdb', 'salle_eau', 'wc'].indexOf(t) >= 0 ? 'eau' : t === 'cuisine' ? 'cuisine'
    : ['chambre', 'parentale', 'suite', 'dressing'].indexOf(t) >= 0 ? 'nuit'
    : ['sejour', 'salle_manger', 'bureau'].indexOf(t) >= 0 ? 'jour' : 'autre';

  /* Le plan retenu : « Mon plan » s'il existe, sinon la variante choisie. */
  function planRetenu() {
    if (etat.perso) return NP.monter(etat.perso, etat.criteres, etat.ouv);
    return etat.res.variantes[Math.min(etat.choix || 0, etat.res.variantes.length - 1)];
  }
  function piecesRetenues() {
    const v = planRetenu();
    const out = [];
    v.niveaux.forEach(n => parPiece(n).forEach(g => out.push({piece: g.piece, aire: g.aire, niveau: n.niveau, nb: v.niveaux.length})));
    return out;
  }
  const ambDe = id => etat.ambiances.pieces[id] || null;

  /* Une texture de matière, en CSS : de quoi reconnaître un marbre d'un parquet. */
  function texture(mat, coul) {
    const c = coul || '#DDD';
    const f = (a) => 'rgba(0,0,0,' + a + ')', b = (a) => 'rgba(255,255,255,' + a + ')';
    switch (mat) {
      case 'marbre':
        return 'linear-gradient(118deg,transparent 38%,' + f(.10) + ' 40%,transparent 43%),linear-gradient(32deg,transparent 58%,' + f(.08) +
          ' 59.5%,transparent 62%),linear-gradient(160deg,transparent 70%,' + f(.06) + ' 71%,transparent 73%),' + c;
      case 'parquet': case 'parquet-contre': case 'stratifie': case 'carrelage-bois': case 'lambris': case 'tasseaux':
        return 'repeating-linear-gradient(90deg,' + f(.16) + ' 0 1px,transparent 1px 16px),repeating-linear-gradient(0deg,' + f(.03) +
          ' 0 1px,transparent 1px 5px),' + c;
      case 'carrelage': case 'faience': case 'ciment':
        return 'linear-gradient(' + b(.7) + ' 1px,transparent 1px) 0 0/18px 18px,linear-gradient(90deg,' + b(.7) + ' 1px,transparent 1px) 0 0/18px 18px,' + c;
      case 'beton': case 'resine': case 'chaux': case 'tadelakt':
        return 'radial-gradient(circle at 20% 30%,' + f(.07) + ' 0 12%,transparent 30%),radial-gradient(circle at 75% 70%,' + b(.18) +
          ' 0 14%,transparent 34%),' + c;
      case 'terrazzo':
        return 'radial-gradient(circle at 20% 25%,#B98E7A 0 2.5px,transparent 3px),radial-gradient(circle at 60% 40%,#8FA3A0 0 2px,transparent 2.5px),' +
          'radial-gradient(circle at 40% 75%,#D4B57E 0 2.5px,transparent 3px),radial-gradient(circle at 85% 80%,#6F6A66 0 1.5px,transparent 2px) 0 0/34px 34px,' + c;
      case 'tomettes':
        return 'radial-gradient(circle,transparent 62%,' + b(.45) + ' 64%) 0 0/16px 16px,' + c;
      case 'brique': case 'pierre':
        return 'linear-gradient(' + b(.55) + ' 1.5px,transparent 1.5px) 0 0/100% 10px,linear-gradient(90deg,' + b(.55) + ' 1.5px,transparent 1.5px) 0 0/22px 10px,' + c;
      case 'zellige':
        return 'linear-gradient(' + b(.6) + ' 1px,transparent 1px) 0 0/12px 12px,linear-gradient(90deg,' + b(.6) + ' 1px,transparent 1px) 0 0/12px 12px,' +
          'linear-gradient(135deg,' + b(.15) + ',' + f(.1) + '),' + c;
      case 'moquette': case 'jonc':
        return 'repeating-linear-gradient(45deg,' + f(.05) + ' 0 2px,transparent 2px 4px),' + c;
      case 'papier-peint':
        return 'radial-gradient(circle at 50% 50%,' + f(.10) + ' 0 3px,transparent 3.5px) 0 0/14px 14px,' + c;
      default: return c;
    }
  }
  const couleurMat = (liste, mat) => { const o = liste.find(x => x[0] === mat); return o ? o[2] : '#DDD'; };

  function selectAmb(id, champ, liste, val, vide) {
    return '<select class="mini-sel" data-amb="' + id + '" data-champ="' + champ + '">' +
      (vide ? '<option value="">' + vide + '</option>' : '') +
      liste.map(o => { const k = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
        return '<option value="' + esc(k) + '"' + (k === val ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>';
  }

  function carteAmbiance(pr) {
    const p = pr.piece, a = ambDe(p.id) || {}, d = NP.CAT[p.type];
    const sol = a.sol || {}, murs = a.murs || {};
    const cs = sol.couleur || (sol.mat ? couleurMat(SOLS, sol.mat) : ''), cm2 = murs.couleur || (murs.mat ? couleurMat(MURS, murs.mat) : '');
    const pal = a.palette || [];
    const rempli = !!(sol.mat || murs.mat || (a.accents || []).length || a.notes || a.style);
    let s = '<div class="card amb-carte' + (rempli ? ' rempli' : '') + '" data-carte-amb="' + p.id + '">' +
      '<div class="amb-tete"><span class="em">' + d.emoji + '</span><div><b>' + esc(p.nom) + '</b><small>' +
      (pr.nb > 1 ? (pr.niveau === 0 ? 'Rez-de-chaussée · ' : 'Étage · ') : '') + m2(pr.aire) + '</small></div>' +
      (rempli ? '<button type="button" class="mini-btn" data-amb-vider="' + p.id + '" title="Effacer les choix de cette pièce">↺</button>' : '') + '</div>';
    /* L'aperçu : le sol, le mur, la palette et les matières d'accent. */
    s += '<div class="amb-apercu">' +
      '<div class="amb-mur" style="background:' + (cm2 ? texture(murs.mat, cm2) : 'var(--surface-2)') + '">' + (murs.mat ? '' : '<span>mur</span>') + '</div>' +
      '<div class="amb-sol" style="background:' + (cs ? texture(sol.mat, cs) : 'var(--surface-2)') + '">' + (sol.mat ? '' : '<span>sol</span>') + '</div>' +
      '<div class="amb-pal">' + [0, 1, 2].map(i => '<i style="background:' + (pal[i] || 'transparent') + '"></i>').join('') + '</div></div>';
    s += '<div class="amb-inspi">' + INSPI[familleInspi(p.type)].map((x, i) =>
      '<button type="button" class="puce petite" data-amb-inspi="' + p.id + '" data-i="' + i + '" data-fam="' + familleInspi(p.type) + '"><span>' + x.em + '</span>' + esc(x.nom) + '</button>').join('') + '</div>';
    s += '<div class="amb-champs">' +
      '<div class="amb-lig"><label>Style</label>' + selectAmb(p.id, 'style', STYLES_DECO, a.style, '—') + '</div>' +
      '<div class="amb-lig"><label>Sol</label>' + selectAmb(p.id, 'sol.mat', SOLS, sol.mat, 'Matière…') +
        '<input type="color" data-amb="' + p.id + '" data-champ="sol.couleur" value="' + (cs || '#DDDDDD') + '" title="Teinte du sol">' +
        selectAmb(p.id, 'sol.motif', MOTIFS_SOL, sol.motif, 'Pose / motif…') + '</div>' +
      '<div class="amb-lig"><label>Murs</label>' + selectAmb(p.id, 'murs.mat', MURS, murs.mat, 'Matière…') +
        '<input type="color" data-amb="' + p.id + '" data-champ="murs.couleur" value="' + (cm2 || '#EEEEEE') + '" title="Couleur des murs">' +
        selectAmb(p.id, 'murs.motif', MOTIFS_MUR, murs.motif, 'Motif…') + '</div>' +
      '<div class="amb-lig"><label>Plafond</label>' + selectAmb(p.id, 'plafond', PLAFONDS, a.plafond, '—') + '</div>' +
      '<div class="amb-lig"><label>Couleurs</label><span class="amb-couls">' + [0, 1, 2].map(i =>
        '<input type="color" data-amb="' + p.id + '" data-champ="palette.' + i + '" value="' + (pal[i] || ['#EEEAE4', '#C9A57A', '#5E7F6E'][i]) + '" title="' +
        ['Couleur principale', 'Couleur secondaire', 'Couleur d\'accent'][i] + '">').join('') + '</span></div>' +
      '<div class="amb-lig haut"><label>Matières</label><div class="amb-acc">' + ACCENTS.map(x =>
        '<button type="button" class="acc' + ((a.accents || []).indexOf(x) >= 0 ? ' on' : '') + '" data-amb-acc="' + p.id + '" data-val="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div></div>' +
      '<textarea data-amb="' + p.id + '" data-champ="notes" rows="2" placeholder="Vos mots : « du marbre blanc avec du bois clair, sol en carrelage »…">' + esc(a.notes || '') + '</textarea>' +
      '</div></div>';
    return s;
  }

  function rendreAmbiances() {
    const g = etat.ambiances.general || {};
    let s = '<div class="card amb-general"><div class="hd"><h2>🎨 L\'ambiance générale</h2>' +
      '<span class="hint">Facultatif — un fil conducteur pour toute la maison ; chaque pièce peut ensuite s\'en écarter.</span></div><div class="bd">' +
      '<div class="lig"><label>Style</label><div class="puces">' + STYLES_DECO.map(x =>
        '<button type="button" class="puce' + (g.style === x ? ' on' : '') + '" data-amb-gstyle="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div></div>' +
      '<div class="amb-ligne-g"><div class="lig"><label>Palette de la maison</label><span class="amb-couls">' + [0, 1, 2].map(i =>
        '<input type="color" data-amb="general" data-champ="palette.' + i + '" value="' + ((g.palette || [])[i] || ['#EEEAE4', '#C9A57A', '#5E7F6E'][i]) + '">').join('') + '</span></div>' +
      '<button type="button" class="btn" data-amb-appliquer="1">🪄 Appliquer à toutes les pièces encore vides</button></div>' +
      '<textarea data-amb="general" data-champ="notes" rows="2" placeholder="Ex. une maison lumineuse, des matières naturelles, peu de couleurs vives…">' + esc(g.notes || '') + '</textarea>' +
      '</div></div>';
    s += '<div class="amb-grille">' + piecesRetenues().filter(pr => ['escalier', 'degagement', 'palier'].indexOf(pr.piece.type) < 0 || true)
      .map(carteAmbiance).join('') + '</div>';
    el('etape-ambiances').innerHTML = s;
  }

  function fixerChamp(obj, champ, val) {
    const k = champ.split('.');
    let o = obj;
    for (let i = 0; i < k.length - 1; i++) {
      if (o[k[i]] == null) o[k[i]] = /^\d+$/.test(k[i + 1]) ? [] : {};
      o = o[k[i]];
    }
    o[k[k.length - 1]] = val;
  }

  function majCarteAmb(id) {
    const n = document.querySelector('[data-carte-amb="' + id + '"]');
    const pr = piecesRetenues().find(x => x.piece.id === id);
    if (n && pr) {
      const tmp = document.createElement('div');
      tmp.innerHTML = carteAmbiance(pr);
      const neuf = tmp.firstChild;
      n.replaceWith(neuf);
      neuf.querySelector('.amb-apercu').animate([{transform: 'scale(.97)', opacity: .6}, {transform: 'none', opacity: 1}], {duration: 260, easing: 'ease-out'});
    }
  }

  /* ---------- Le récapitulatif ---------- */
  function recapHtml(papier) {
    const c = etat.criteres, p = etat.projet;
    const oui = b => b ? 'oui' : 'non';
    const L = (t, v) => v === '' || v == null || v === false ? '' : '<div class="rl"><span>' + t + '</span><b>' + v + '</b></div>';
    const bloc = (titre, corps) => corps ? '<div class="rb"><h3>' + titre + '</h3>' + corps + '</div>' : '';
    const T = TYPES.filter(t => t.cle === c.type)[0];
    let s = '';
    s += bloc('🏷️ Le projet',
      L('Nom', esc(c.nom || 'Projet sans nom')) + L('Opération', libelle(OPTIONS.operation, p.operation)) + L('Lieu', esc(p.lieu)) +
      L('Début', moisLisible(p.debut)) + L('Emménagement souhaité', moisLisible(p.emmenagement)) + L('Durée', esc(p.duree || dureeCalculee())) +
      L('Foyer', (p.adultes || 0) + ' adulte' + (p.adultes > 1 ? 's' : '') + (p.enfants ? ', ' + p.enfants + ' enfant' + (p.enfants > 1 ? 's' : '') + (p.agesEnfants ? ' (' + esc(p.agesEnfants) + ')' : '') : '')) +
      L('Télétravail', p.teletravail ? p.teletravail + ' poste' + (p.teletravail > 1 ? 's' : '') : '') +
      L('Particularités', [p.animaux ? 'animaux' : '', p.invites ? 'reçoit souvent' : '', p.pmr ? 'accessibilité PMR' : ''].filter(Boolean).join(', ')) +
      L('Budget global', p.budget ? esc(p.budget) + ' €' : '') + L('Dont travaux', p.budgetTravaux ? esc(p.budgetTravaux) + ' €' : '') +
      (p.envies ? '<div class="rl col"><span>Envies</span><i>« ' + esc(p.envies) + ' »</i></div>' : ''));
    s += bloc('🏠 Le bien',
      L('Type', T.nom) + L('Surface habitable', Math.round(c.surface) + ' m²') + L('Niveaux', c.niveaux) +
      L('Style', libelle(OPTIONS.style, c.style)) + L('Toiture', libelle(OPTIONS.toiture, c.toiture)) + L('Hauteur sous plafond', libelle(OPTIONS.hsp, c.hsp)) +
      L('Pièce de vie orientée', libelle(OPTIONS.orientation, c.orientation)));
    s += bloc('🛏️ Les pièces',
      L('Chambres', c.chambres + (c.chambreAmis ? ' dont une d\'amis' : '')) +
      L('Suite parentale', {simple: 'chambre seule', sde: 'avec salle d\'eau', complete: 'avec salle d\'eau et dressing'}[c.suiteType || 'simple'] +
        (c.niveaux === 2 ? (c.parentaleRdc ? ', au rez' : ', à l\'étage') : '')) +
      L('Salles de bain', c.sdb + ' — ' + libelle(OPTIONS.doucheBain, c.doucheBain) + (c.doubleVasque ? ', double vasque' : '')) +
      L('WC séparé', oui(c.wcSepare) + (c.wcEtage && c.niveaux === 2 ? ' (+ WC à l\'étage)' : '')) +
      L('Cuisine', (c.cuisineOuverte ? 'ouverte' : 'fermée') + ', ' + libelle(OPTIONS.cuisineForme, c.cuisineForme).toLowerCase()) +
      L('En plus', [c.dressing ? 'dressing' : '', c.cellier ? 'cellier' : '', c.buanderie ? 'buanderie' : '', c.bureau ? 'bureau' : '',
        c.placards ? 'placards dans les chambres' : ''].filter(Boolean).join(', ')) +
      L('Chauffage d\'appoint', c.cheminee !== 'aucune' ? libelle(OPTIONS.cheminee, c.cheminee) : '') +
      L('Autres souhaits', esc(c.autresPieces || '')));
    if (c.type !== 'appartement') {
      s += bloc('🌳 Dehors',
        L('Terrasse', c.terrasse > 0 ? Math.round(c.terrasse) + ' m², ' + libelle(OPTIONS.terrasseMat, c.terrasseMat).toLowerCase() + (c.terrasseCouverte ? ', couverte' : '') : 'non') +
        L('Jardin', c.jardin > 0 ? Math.round(c.jardin) + ' m²' + (c.potager ? ', potager' : '') + (c.arrosage ? ', arrosage automatique' : '') : '') +
        L('Abri de jardin', c.abri ? 'oui' : '') + L('Clôture', libelle(OPTIONS.cloture, c.cloture)) +
        L('Stationnement', [c.garage ? (c.garageDouble ? 'garage double' : 'garage') : '', c.carport ? 'carport' : '',
          c.placesExt ? c.placesExt + ' place' + (c.placesExt > 1 ? 's' : '') + ' extérieure' + (c.placesExt > 1 ? 's' : '') : '',
          c.borneRecharge ? 'borne de recharge' : ''].filter(Boolean).join(', ')));
      if (c.piscine) {
        s += bloc('🏊 La piscine',
          L('Forme', libelle(OPTIONS.piscineForme, c.piscineForme)) + L('Pose', libelle(OPTIONS.piscinePose, c.piscinePose)) +
          L('Dimensions', nd(c.piscineL) + ' × ' + nd(c.piscineW) + ' m') + L('Profondeur', libelle(OPTIONS.piscineProf, c.piscineProf)) +
          L('Chauffage', libelle(OPTIONS.piscineChauffage, c.piscineChauffage)) + L('Couverture', libelle(OPTIONS.piscineCouverture, c.piscineCouverture)) +
          L('Margelle', libelle(OPTIONS.piscineMargelle, c.piscineMargelle)) + L('Traitement', libelle(OPTIONS.piscineTraitement, c.piscineTraitement)) +
          L('Local technique', oui(c.piscineLocal)) + L('Éclairage', oui(c.piscineEclairage)));
      }
    }
    s += bloc('⚙️ Technique et confort',
      L('Chauffage', libelle(OPTIONS.chauffage, c.chauffage) + (c.plancherChauffant ? ', plancher chauffant' : '')) +
      L('Menuiseries', libelle(OPTIONS.menuiseries, c.menuiseries)) + L('Volets', libelle(OPTIONS.volets, c.volets)) +
      L('Équipements', [c.clim ? 'climatisation' : '', c.domotique ? 'domotique' : '', c.solaire ? 'panneaux solaires' : '',
        c.recupEau ? 'récupérateur d\'eau de pluie' : ''].filter(Boolean).join(', ')));

    /* Le plan retenu */
    const v = planRetenu();
    let hab = 0;
    v.niveaux.forEach(n => n.cases.forEach(k => { hab += k.w * k.h; }));
    const retenu = etat.perso ? 'Mon plan personnalisé (d\'après la variante ' + esc(etat.perso.base) + ')' : 'Variante ' + v.cle + ' — ' + esc(v.nom);
    s += bloc('📐 Le plan retenu', L('Plan', retenu) + L('Surface habitable dessinée', m2(hab)) +
      L('Emprise', nd(v.niveaux[0].W) + ' × ' + nd(v.niveaux[0].H) + ' m'));

    /* L'aménagement : les meubles posés, pièce par pièce. */
    const meubles = [];
    if (etat.perso) etat.perso.niveaux.forEach(n => {
      const par = {};
      (n.meubles || []).forEach(m => {
        const k = n.cases.find(q => m.cx >= q.x && m.cx <= q.x + q.w && m.cy >= q.y && m.cy <= q.y + q.h);
        const pi = k && etat.perso.pieces.find(x => x.id === k.id);
        const nom = pi ? pi.nom : 'Dehors';
        (par[nom] = par[nom] || []).push((NPM.CATALOGUE[m.genre] || {nom: m.genre}).nom.toLowerCase());
      });
      Object.keys(par).forEach(nom => {
        const cpt = {};
        par[nom].forEach(x => { cpt[x] = (cpt[x] || 0) + 1; });
        meubles.push(L(esc(nom), Object.keys(cpt).map(x => (cpt[x] > 1 ? cpt[x] + ' × ' : '') + x).join(', ')));
      });
    });
    if (meubles.length) s += bloc('🛋️ L\'aménagement', meubles.join(''));

    /* Les ambiances et matières */
    const g = etat.ambiances.general || {};
    let amb = '';
    if (g.style || g.notes) amb += L('Toute la maison', [g.style, g.notes ? '« ' + esc(g.notes) + ' »' : ''].filter(Boolean).join(' — '));
    piecesRetenues().forEach(pr => {
      const a = ambDe(pr.piece.id);
      if (!a) return;
      const sol = a.sol || {}, murs = a.murs || {};
      const bouts = [];
      if (a.style) bouts.push('style ' + esc(a.style).toLowerCase());
      if (sol.mat) bouts.push('sol ' + libelle(SOLS, sol.mat).toLowerCase() + (sol.motif ? ' (' + esc(sol.motif).toLowerCase() + ')' : '') + pastille(sol.couleur, papier));
      if (murs.mat) bouts.push('murs ' + libelle(MURS, murs.mat).toLowerCase() + (murs.motif && murs.motif !== 'Uni' ? ' (' + esc(murs.motif).toLowerCase() + ')' : '') + pastille(murs.couleur, papier));
      if (a.plafond) bouts.push('plafond ' + esc(a.plafond).toLowerCase());
      if ((a.accents || []).length) bouts.push('matières : ' + a.accents.map(esc).join(', ').toLowerCase());
      if ((a.palette || []).filter(Boolean).length) bouts.push('couleurs ' + a.palette.filter(Boolean).map(x => pastille(x, papier)).join(''));
      if (a.notes) bouts.push('« ' + esc(a.notes) + ' »');
      if (bouts.length) amb += '<div class="rl col"><span>' + NP.CAT[pr.piece.type].emoji + ' ' + esc(pr.piece.nom) + '</span><b>' + bouts.join(' · ') + '</b></div>';
    });
    if (amb) s += bloc('🎨 Ambiances et matières', amb);
    return s;
  }
  const pastille = (c, papier) => c ? ' <i class="pastille-coul" style="background:' + c + '"></i>' : '';

  function rendreRecap() {
    el('recap-projet').innerHTML = '<div class="card recap-card"><div class="hd"><h2>📋 Récapitulatif du projet</h2>' +
      '<span class="hint">Tout ce que vous avez choisi, prêt à imprimer ou à transmettre</span>' +
      '<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn" type="button" data-choixact="enregistrer">💾 Enregistrer</button>' +
      '<button class="btn primary" type="button" data-choixact="pdf">📄 Télécharger le PDF</button></span></div>' +
      '<div class="bd recap">' + recapHtml(false) + '</div></div>';
  }

  /* ============================================================
     ↶ ANNULER / ↷ RÉTABLIR
     ------------------------------------------------------------
     Chaque état enregistré est photographié ; la flèche retour
     remet la photo précédente — plan, meubles, critères, ambiances.
     ============================================================ */
  const histo = {pile: [], i: -1, enCours: false};
  function photographier() {
    if (histo.enCours) return;
    const s = JSON.stringify({criteres: etat.criteres, pieces: etat.pieces, ouv: etat.ouv, perso: etat.perso,
      projet: etat.projet, ambiances: etat.ambiances, choix: etat.choix});
    if (histo.pile[histo.i] === s) return;
    histo.pile = histo.pile.slice(0, histo.i + 1);
    histo.pile.push(s);
    if (histo.pile.length > 80) histo.pile.shift();
    histo.i = histo.pile.length - 1;
    majFleches();
  }
  function revenir(sens) {
    const j = histo.i + sens;
    if (j < 0 || j >= histo.pile.length) { toast(sens < 0 ? 'Rien à annuler.' : 'Rien à rétablir.'); return; }
    const avant = photo();
    histo.enCours = true;
    histo.i = j;
    const d = JSON.parse(histo.pile[j]);
    etat.criteres = d.criteres; etat.pieces = d.pieces; etat.ouv = d.ouv; etat.perso = d.perso;
    etat.projet = d.projet; etat.ambiances = d.ambiances; etat.choix = d.choix;
    etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = etat.selMeuble = null;
    if (!etat.perso && etat.iv === -1) etat.iv = etat.choix || 0;
    if (etat.perso && (etat.etape === 4 || etat.etape === 5)) etat.iv = -1;
    etat.res = NP.generer(etat.criteres, etat.pieces, etat.ouv);
    etat.pieces = etat.res.pieces;
    perime();
    if (etat.etape === 1) rendreProjet();
    if (etat.etape === 2) el('colg').innerHTML = formulaire();
    rendre();
    if (etat.etape === 6) { rendreAmbiances(); rendreRecap(); }
    rendreParcours();
    animer(avant);
    sauver();
    histo.enCours = false;
    majFleches();
    toast(sens < 0 ? '↶ Dernière modification annulée.' : '↷ Modification rétablie.');
  }
  function majFleches() {
    const a = el('btn-annuler'), r = el('btn-retablir');
    if (a) a.disabled = histo.i <= 0;
    if (r) r.disabled = histo.i >= histo.pile.length - 1;
  }

  /* ============================================================
     LES BRANCHEMENTS
     ============================================================ */
  function brancher() {
    /* Le parcours : rail, dock, flèches annuler / rétablir */
    el('rail').addEventListener('click', e => {
      const b = e.target.closest('[data-aller]');
      if (b) afficherEtape(+b.getAttribute('data-aller'));
    });
    el('dock-prec').addEventListener('click', () => afficherEtape(etat.etape - 1));
    el('dock-suiv').addEventListener('click', () => {
      /* De l'étape 3 à la 4 : on personnalise la variante choisie. */
      if (etat.etape === 3) continuerAvec(4); else afficherEtape(etat.etape + 1);
    });
    el('btn-annuler').addEventListener('click', () => revenir(-1));
    el('btn-retablir').addEventListener('click', () => revenir(1));

    /* Étape 1 : le projet */
    const projet = el('etape-projet');
    projet.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'f-nom') { etat.criteres.nom = t.value; }
      else {
        const k = t.getAttribute('data-proj');
        if (!k || t.type === 'checkbox') return;
        etat.projet[k] = t.value;
      }
      clearTimeout(brancher._p);
      brancher._p = setTimeout(() => { sauver(); rendreRail(); el('feuilles').innerHTML = feuilles(); }, 350);
    });
    projet.addEventListener('change', e => {
      const t = e.target, k = t.getAttribute('data-proj');
      if (!k) return;
      etat.projet[k] = t.type === 'checkbox' ? t.checked : t.value;
      /* Les deux dates donnent la durée ; on redessine pour l'afficher. */
      if (k === 'debut' || k === 'emmenagement') { if (!etat.projet.dureeManuelle) etat.projet.duree = dureeCalculee(); rendreProjet(); }
      if (k === 'duree') etat.projet.dureeManuelle = !!t.value;
      sauver(); rendreRail();
    });
    projet.addEventListener('click', e => {
      const ch = e.target.closest('[data-pchoix]');
      if (ch) { etat.projet[ch.getAttribute('data-pchoix')] = ch.getAttribute('data-val'); sauver(); rendreProjet(); return; }
      const cp = e.target.closest('[data-pcpt]');
      if (cp) {
        const k = cp.getAttribute('data-pcpt');
        etat.projet[k] = NP.clamp((+etat.projet[k] || 0) + (+cp.getAttribute('data-pas')), 0, +cp.getAttribute('data-max'));
        sauver(); rendreProjet();
      }
    });

    /* Étape 3 : choisir une variante, et la suite */
    el('choix-plan').addEventListener('click', e => {
      const v = e.target.closest('[data-choix]');
      if (v) {
        const avant = photo();
        etat.iv = etat.choix = +v.getAttribute('data-choix');
        sauver(); rendre(); animer(avant); rendreRail();
        return;
      }
      const a = e.target.closest('[data-choixact]');
      if (a) actionChoix(a.getAttribute('data-choixact'));
    });
    el('recap-projet').addEventListener('click', e => {
      const a = e.target.closest('[data-choixact]');
      if (a) actionChoix(a.getAttribute('data-choixact'));
    });

    /* Étape 6 : les ambiances */
    const amb = el('etape-ambiances');
    const cible = id => id === 'general' ? (etat.ambiances.general = etat.ambiances.general || {})
      : (etat.ambiances.pieces[id] = etat.ambiances.pieces[id] || {});
    const apres = id => { sauver(); if (id !== 'general') majCarteAmb(id); rendreRecap(); };
    amb.addEventListener('change', e => {
      const t = e.target, id = t.getAttribute('data-amb');
      if (!id) return;
      const champ = t.getAttribute('data-champ');
      fixerChamp(cible(id), champ, t.value);
      /* Une matière choisie sans couleur prend la teinte type de la matière. */
      if (/\.mat$/.test(champ) && t.value) {
        const o = cible(id)[champ.split('.')[0]];
        if (!o.couleur || o.auto) { o.couleur = couleurMat(champ === 'sol.mat' ? SOLS : MURS, t.value); o.auto = true; }
      }
      if (/\.couleur$/.test(champ)) cible(id)[champ.split('.')[0]].auto = false;
      apres(id);
    });
    amb.addEventListener('input', e => {
      const t = e.target, id = t.getAttribute('data-amb');
      if (!id || t.tagName !== 'TEXTAREA') return;
      fixerChamp(cible(id), t.getAttribute('data-champ'), t.value);
      clearTimeout(brancher._a);
      brancher._a = setTimeout(() => { sauver(); rendreRecap(); }, 400);
    });
    amb.addEventListener('click', e => {
      const ac = e.target.closest('[data-amb-acc]');
      if (ac) {
        const id = ac.getAttribute('data-amb-acc'), a = cible(id), v = ac.getAttribute('data-val');
        a.accents = a.accents || [];
        const i = a.accents.indexOf(v);
        if (i >= 0) a.accents.splice(i, 1); else a.accents.push(v);
        apres(id);
        return;
      }
      const ins = e.target.closest('[data-amb-inspi]');
      if (ins) {
        const id = ins.getAttribute('data-amb-inspi');
        const x = INSPI[ins.getAttribute('data-fam')][+ins.getAttribute('data-i')];
        etat.ambiances.pieces[id] = Object.assign(NP.copie({style: x.style, sol: x.sol, murs: x.murs, plafond: x.plafond,
          accents: x.accents, palette: x.palette}), {notes: (etat.ambiances.pieces[id] || {}).notes || '', inspiration: x.nom});
        apres(id);
        etincelles(e.clientX, e.clientY, .7);
        return;
      }
      const vi = e.target.closest('[data-amb-vider]');
      if (vi) { delete etat.ambiances.pieces[vi.getAttribute('data-amb-vider')]; sauver(); rendreAmbiances(); rendreRecap(); return; }
      const gs = e.target.closest('[data-amb-gstyle]');
      if (gs) {
        const g = cible('general'), v = gs.getAttribute('data-amb-gstyle');
        g.style = g.style === v ? '' : v;
        sauver(); rendreAmbiances(); rendreRecap();
        return;
      }
      if (e.target.closest('[data-amb-appliquer]')) {
        const g = etat.ambiances.general || {};
        let n = 0;
        piecesRetenues().forEach(pr => {
          if (etat.ambiances.pieces[pr.piece.id]) return;
          etat.ambiances.pieces[pr.piece.id] = {style: g.style || '', palette: (g.palette || []).slice()};
          n++;
        });
        sauver(); rendreAmbiances(); rendreRecap();
        toast(n ? 'Style et palette appliqués à ' + n + ' pièce' + (n > 1 ? 's' : '') + '.' : 'Toutes les pièces ont déjà leurs choix.');
      }
    });

    /* La colonne des critères */
    el('colg').addEventListener('click', e => {
      const t = e.target.closest('[data-typo]');
      if (t) { majCritere('type', t.getAttribute('data-typo')); return; }
      const c = e.target.closest('[data-cpt]');
      if (c) {
        const cle = c.getAttribute('data-cpt'), pas = +c.getAttribute('data-pas');
        const bornes = {chambres: [0, 8], sdb: [1, 4], niveaux: [1, 2], placesExt: [0, 10]};
        const b = bornes[cle];
        majCritere(cle, NP.clamp(etat.criteres[cle] + pas, b[0], b[1]));
        return;
      }
      const ch = e.target.closest('[data-cchip]');
      if (ch) { majCritere(ch.getAttribute('data-cchip'), ch.getAttribute('data-val')); return; }
      if (e.target.id === 'f-regen') regenerer();
    });
    el('colg').addEventListener('change', e => {
      const o = e.target.getAttribute('data-opt');
      if (o) { majCritere(o, e.target.checked); return; }
      if (e.target.id === 'f-nord') { majCritere('nord', e.target.value); return; }
      if (e.target.id === 'f-suitelvl') { majCritere('parentaleRdc', e.target.value === '0'); return; }
      if (e.target.name === 'suite') { majCritere('suiteType', e.target.value); return; }
      const sc = e.target.getAttribute('data-c');
      if (sc) {
        /* Un détail qui ne change pas la découpe : noté, sans refaire les plans. */
        if (sc in CRIT_PLUS) { etat.criteres[sc] = e.target.value; sauver(); rendreRail(); }
        else majCritere(sc, e.target.value);
        return;
      }
      const sn = e.target.getAttribute('data-cnum');
      if (sn) {
        const v = parseFloat(String(e.target.value).replace(',', '.'));
        if (!isNaN(v)) majCritere(sn, NP.clamp(v, +e.target.min, +e.target.max));
      }
    });
    el('colg').addEventListener('input', e => {
      const id = e.target.id;
      const tx = e.target.getAttribute('data-ctxt');
      if (tx) { etat.criteres[tx] = e.target.value; clearTimeout(brancher._s); brancher._s = setTimeout(sauver, 400); return; }
      const champs = {'f-surface': ['surface', 20, 500], 'f-terrasse': ['terrasse', 0, 200], 'f-jardin': ['jardin', 0, 5000]};
      if (champs[id]) {
        const [cle, mn, mx] = champs[id];
        const v = NP.clamp(parseFloat(e.target.value) || 0, mn, mx);
        etat.criteres[cle] = v;
        clearTimeout(brancher._t);
        brancher._t = setTimeout(recalculer, 260);
      }
    });

    /* Les onglets : variante, niveau, vue, côté de façade */
    el('barre-plan').addEventListener('click', e => {
      const v = e.target.closest('[data-var]');
      if (v) { etat.iv = +v.getAttribute('data-var'); etat.sel = etat.selOuv = etat.selMeuble = null; sauver(); rendre(); return; }
      const na = e.target.closest('[data-niveau-act]');
      if (na) { if (na.getAttribute('data-niveau-act') === 'ajouter') ajouterNiveau(); else retirerNiveau(); return; }
      const n = e.target.closest('[data-niv]');
      if (n) { etat.iniv = +n.getAttribute('data-niv'); etat.sel = etat.selOuv = etat.selMeuble = null; sauver(); rendre(); return; }
      const w = e.target.closest('[data-vue]');
      if (w) { etat.vue = w.getAttribute('data-vue'); etat.selOuv = null; sauver(); rendre(); return; }
      const f = e.target.closest('[data-cote]');
      if (f) { etat.criteres.facade = f.getAttribute('data-cote'); sauver(); rendre(); }
    });

    /* La barre de l'ouverture sélectionnée */
    el('barre-ouv').addEventListener('click', e => {
      const b = e.target.closest('[data-ouvact]');
      if (b) { actionOuverture(b.getAttribute('data-ouvact')); return; }
      const a = e.target.closest('[data-annact]');
      if (a) { actionAnnexe(a.getAttribute('data-annact')); return; }
      const mb = e.target.closest('[data-meubact]');
      if (mb) { actionMeuble(mb.getAttribute('data-meubact')); return; }
      const m = e.target.closest('[data-muract]');
      if (m) actionMur(m.getAttribute('data-muract'));
    });
    el('barre-ouv').addEventListener('change', e => {
      if (e.target.hasAttribute('data-ouvtype')) actionOuverture('type', e.target.value);
      else if (e.target.hasAttribute('data-anngenre')) actionAnnexe('genre', e.target.value);
      else if (e.target.hasAttribute('data-anndim')) actionAnnexe(e.target.getAttribute('data-anndim'), e.target.value);
      else if (e.target.hasAttribute('data-annforme')) actionAnnexe('forme', e.target.value);
      else if (e.target.hasAttribute('data-annporte')) actionAnnexe('porte', e.target.value);
      else if (e.target.hasAttribute('data-annpose')) actionAnnexe('pose', e.target.value);
      else if (e.target.hasAttribute('data-meubdim')) actionMeuble(e.target.getAttribute('data-meubdim'), e.target.value);
      else if (e.target.hasAttribute('data-murval') && etat.selMur) {
        const v = parseFloat(String(e.target.value).replace(/\s/g, '').replace(',', '.'));
        if (!(v >= 0)) { toast('Tapez une valeur en mètres, par exemple 3,245.'); return; }
        if (e.target.getAttribute('data-murval') === 'emprise') {
          const m = etat.selMur, pn = niveauPerso();
          const L = m.axe === 'v' ? pn.W : pn.H;
          placerMur(m.pos < .004 ? L - v : v);
        } else placerMur(v);
      }
    });
    /* Entrée valide la cote tapée sans quitter le champ. */
    el('barre-ouv').addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.target.hasAttribute('data-murval') || e.target.hasAttribute('data-meubdim') || e.target.hasAttribute('data-anndim'))) e.target.blur();
    });

    /* La scène : un seul aiguillage pour tous les gestes. */
    el('scene').addEventListener('pointerdown', surScene);

    /* Les outils, et les actions sur le plan entier. */
    const actionsPlan = e => {
      const o = e.target.closest('[data-outil]');
      if (o) {
        etat.outil = o.getAttribute('data-outil');
        etat.selOuv = etat.outil === 'main' ? etat.selOuv : null;
        rendre();
        const aide = {main: 'Glissez une pièce sur une autre, tirez un mur, déplacez une porte.',
          mur: 'Tirez un trait dans une pièce : elle se coupe en deux (un simple clic la coupe dans sa longueur).',
          gomme: 'Cliquez une porte, une fenêtre, un garage ou une terrasse pour l\'effacer — ou un mur intérieur pour fusionner deux pièces.',
          porte: 'Cliquez un mur pour y poser une porte.', garage: 'Cliquez un mur pour y poser une porte de garage (2,40 m, élargissable).', fenetre: 'Cliquez un mur pour y poser une fenêtre.',
          baie: 'Cliquez un mur pour y poser une baie vitrée.',
          meubler: 'Glissez un meuble du catalogue sur le plan — ou « ✨ Meubler automatiquement » pour un premier jet.'}[etat.outil];
        if (etat.outil !== 'meubler') etat.arme = null;
        toast(aide);
        return;
      }
      /* Le catalogue de meubles */
      const rayon = e.target.closest('[data-cat]');
      if (rayon) { etat.cat = rayon.getAttribute('data-cat'); etat.arme = null; rendre(); return; }
      const ma = e.target.closest('[data-meubact]');
      if (ma) {
        const act = ma.getAttribute('data-meubact');
        if (act === 'auto') meublerAuto();
        else if (act === 'vider') viderMeubles();
        return;
      }
      const p = e.target.closest('[data-plan]');
      if (!p) return;
      const a = p.getAttribute('data-plan');
      if (a === 'importer') el('fondIn').click();
      else if (a === 'vierge') planVierge();
      else if (a === 'garder') garderPlan();
      else if (a === 'supprimer') supprimerMonPlan();
      else if (a === 'annexe') ajouterAnnexe((el('annexe-type') || {}).value || 'garage');
      else if (a === 'image') {
        const f = etat.fonds[etat.iniv];
        if (f) { f.cache = !f.cache; sauverFonds(); rendre(); }
      }
    };
    el('barre-plan').addEventListener('click', actionsPlan);
    /* Un meuble du catalogue se saisit à la souris et se lâche sur le plan. */
    el('barre-plan').addEventListener('pointerdown', e => {
      const it = e.target.closest('[data-meuble-cat]');
      if (it && e.button === 0) debutCatalogue(e, it.getAttribute('data-meuble-cat'));
    });
    el('fondIn').addEventListener('change', e => {
      if (e.target.files.length) ouvrirImport(e.target.files);
      e.target.value = '';
    });

    /* ♻️ Remettre l'outil à neuf */
    el('topbar-raz').addEventListener('click', ouvrirRaz);

    /* La fenêtre d'import, celle de comparaison et celle de remise à neuf */
    el('modale').addEventListener('click', e => {
      const z = e.target.closest('[data-raz]');
      if (z) {
        const a = z.getAttribute('data-raz');
        if (a === 'fermer') fermerImport();
        else if (a === 'sauver') exporter();
        else if (a === 'go') reinitialiserOutil();
        return;
      }
      const b = e.target.closest('[data-imp]');
      if (b && b.getAttribute('data-imp') === 'fermer') { fermerImport(); return; }
      if (b && b.getAttribute('data-imp') === 'valider') { validerImport(); return; }
      if (e.target.closest('[data-cmp-fermer]') || e.target.classList.contains('modale-fond')) { fermerImport(); return; }
      const o = e.target.closest('[data-gt-ouvrir]');
      if (o) { fermerImport(); ouvrirGarde(o.getAttribute('data-gt-ouvrir')); }
    });
    el('modale').addEventListener('change', e => {
      if (e.target.getAttribute('data-imp') === 'largeur' && importEnCours) {
        const v = parseFloat(String(e.target.value).replace(',', '.'));
        const i = +e.target.getAttribute('data-i') || 0;
        if (v > 2 && v < 200) {
          if (i === 0) fixerEchelle(v);
          else { importEnCours.largeurs[i] = v; importEnCours.manuel[i] = true; }
          afficherImport();
        }
      }
    });

    /* La gouttière */
    const gt = el('gouttiere');
    gt.addEventListener('click', e => {
      if (e.target.closest('[data-plan="garder"]')) { garderPlan(); return; }
      if (e.target.closest('[data-gt-comparer]')) { comparer(); return; }
      const o = e.target.closest('[data-gt-ouvrir]');
      if (o) { ouvrirGarde(o.getAttribute('data-gt-ouvrir')); return; }
      const s = e.target.closest('[data-gt-sup]');
      if (s) supprimerGarde(s.getAttribute('data-gt-sup'));
    });
    gt.addEventListener('change', e => {
      if (e.target.hasAttribute('data-gt-filtre')) { filtreProjet = e.target.value; rendreGouttiere(); return; }
      const c = e.target.getAttribute('data-gt-cmp');
      if (c) { aComparer[c] = e.target.checked; rendreGouttiere(); }
    });
    gt.addEventListener('input', e => {
      const id = e.target.getAttribute('data-gt-nom');
      const g = id && gouttiere.find(x => x.id === id);
      if (g) { g.nom = e.target.value; clearTimeout(gt._t); gt._t = setTimeout(sauverGouttiere, 400); }
    });

    /* Le clavier : Échap, Suppr, R — comme dans un logiciel de dessin. */
    document.addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); revenir(e.shiftKey ? 1 : -1); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); revenir(1); return; }
      if (e.key === 'Escape' && etat.etape === 5 && !etat.arme && !etat.selMeuble && !etat.selAnnexe) return;
      if (e.key === 'Escape') {
        if (el('modale').classList.contains('on')) { fermerImport(); return; }
        if (etat.arme) { etat.arme = null; rendre(); return; }
        if (etat.selMeuble) { etat.selMeuble = null; rendre(); return; }
        if (etat.outil !== 'main') { etat.outil = 'main'; rendre(); return; }
        if (etat.sel || etat.selOuv || etat.selAnnexe || etat.selMur || etat.selMeuble) { etat.sel = etat.selOuv = etat.selAnnexe = etat.selMur = etat.selMeuble = null; rendre(); }
      } else if (etat.selMeuble && etat.vue === '2d' && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault(); actionMeuble('sup');
      } else if (etat.selMeuble && etat.vue === '2d' && (e.key === 'r' || e.key === 'R')) {
        actionMeuble('pivoter');
      } else if (etat.selMeuble && etat.vue === '2d' && (e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); actionMeuble('dupliquer');
      } else if (etat.selMeuble && etat.vue === '2d' && /^Arrow/.test(e.key)) {
        /* Les flèches poussent le meuble de 1 cm (10 cm avec Maj). */
        e.preventDefault();
        const pas = e.shiftKey ? .1 : .01;
        const d = {ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas]}[e.key];
        actionMeuble('pousser', d);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && etat.selOuv) {
        e.preventDefault(); actionOuverture('sup');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && etat.selAnnexe) {
        e.preventDefault(); actionAnnexe('sup');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && etat.selMur && !etat.sel) {
        e.preventDefault(); actionMur('sup');
      } else if ((e.key === 'r' || e.key === 'R') && etat.selOuv) {
        actionOuverture('tourner');
      } else if ((e.key === 'r' || e.key === 'R') && etat.selAnnexe) {
        actionAnnexe('pivoter');
      }
    });

    /* La liste des pièces */
    const liste = el('liste-pieces');
    liste.addEventListener('click', e => {
      const m = e.target.closest('[data-mv]');
      if (m) { changerNiveau(m.getAttribute('data-mv')); return; }
      const s = e.target.closest('[data-sup]');
      if (s) { supprimerPiece(s.getAttribute('data-sup')); return; }
      if (e.target.id === 'add-go') ajouterPiece(el('add-type').value);
    });
    liste.addEventListener('input', e => {
      const nom = e.target.getAttribute('data-nom');
      if (nom) {
        const p = piecesAffichees().find(x => x.id === nom);
        if (p) { p.nom = e.target.value; perime(); sauver(); }
        clearTimeout(liste._t);
        liste._t = setTimeout(() => { rendre(true); el('feuilles').innerHTML = feuilles(); }, 320);
        return;
      }
    });

    /* Les cartes se saisissent comme les pièces du plan. */
    liste.addEventListener('pointerdown', e => {
      const pc = e.target.closest('.pc');
      if (pc && !e.target.closest('input,button,select,label')) debutGlisse(e, pc);
    });

    liste.addEventListener('change', e => {
      /* Le type d'une pièce : son nom suit, s'il n'avait pas été changé. */
      const t = e.target.getAttribute('data-type');
      if (t) {
        assurerPerso();
        const p = etat.perso.pieces.find(x => x.id === t);
        if (!p) return;
        const ancien = NP.CAT[p.type].nom;
        const neuf = e.target.value;
        appliquer(() => {
          if (!p.nom || p.nom === ancien || /^Pièce( \d+)?$|^Nouvelle pièce$|\?$/.test(p.nom)) p.nom = NP.CAT[neuf].nom;
          p.type = neuf;
          return true;
        });
        return;
      }
      /* La forme d'un escalier. */
      const f = e.target.getAttribute('data-forme');
      if (f) {
        assurerPerso();
        const p = etat.perso.pieces.find(x => x.id === f);
        if (!p) return;
        appliquer(() => { p.forme = e.target.value; return true; });
        toast('Escalier ' + NP.ESCALIERS[e.target.value].nom.toLowerCase() + '.');
        return;
      }
      /* L'emprise, tapée au clavier : tout le plan s'étire en proportion —
         c'est ce qui met à l'échelle un plan repris d'une image. */
      const id = e.target.id;
      if (id !== 'emp-l' && id !== 'emp-p') return;
      const v = parseFloat(String(e.target.value).replace(',', '.'));
      if (!(v > 1)) { rendre(); return; }
      const perso = assurerPerso();
      const n0 = perso.niveaux[0];
      const W0 = n0.W, H0 = n0.H;
      const kx = id === 'emp-l' ? v / W0 : 1, ky = id === 'emp-p' ? v / H0 : 1;
      /* L'image d'origine suit la même mise à l'échelle. */
      Object.keys(etat.fonds).forEach(k => {
        const fd = etat.fonds[k];
        if (!fd) return;
        fd.largeur *= kx; fd.dx *= kx; fd.dy *= ky;
        fd.ratio *= ky / kx;
      });
      sauverFonds();
      appliquer(() => { NP.mettreAEchelle(perso, W0 * kx, H0 * ky); return true; });
    });

    /* Le haut de page */
    el('btnPrint').addEventListener('click', () => {
      toast('Dans la boîte d\'impression, choisissez « Enregistrer au format PDF ».');
      setTimeout(() => window.print(), 420);
    });
    el('btnExport').addEventListener('click', exporter);
    el('btnImport').addEventListener('click', () => el('fileIn').click());
    el('fileIn').addEventListener('change', e => { if (e.target.files[0]) importer(e.target.files[0]); e.target.value = ''; });
    el('m2-switch').addEventListener('click', basculerM2);
    el('theme-switch').addEventListener('click', () => {
      theme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      rendre();
    });
  }

  /* ============================================================
     DÉPART
     ============================================================ */
  function demarrer() {
    let t = null;
    try { t = localStorage.getItem(CLE_THEME); } catch (e) {}
    if (!t) t = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    theme(t);

    etat.criteres = Object.assign({}, CRIT_PLUS, NP.defauts());
    etat.projet = Object.assign({}, PROJET_DEFAUT);
    etat.ambiances = {general: {}, pieces: {}};
    etat.etape = 1; etat.choix = 0;
    charger();
    chargerGouttiere();
    try { etat.m2 = localStorage.getItem(CLE_M2) === '1'; } catch (e) { etat.m2 = false; }
    majInterrupteurM2();
    etat.res = NP.generer(etat.criteres, etat.pieces, etat.ouv);
    etat.pieces = etat.res.pieces;
    brancher();
    histo.enCours = true;
    afficherEtape(etat.etape || 1, {calme: true});
    histo.enCours = false;
    photographier();
    entree();
  }

  /* L'entrée : le plan se dessine, puis le voile s'efface. Un clic passe
     tout de suite ; si l'animation n'aboutit pas, le voile part quand même. */
  function entree() {
    const intro = el('intro');
    if (!intro) return;
    const finir = () => { if (intro.parentNode) intro.remove(); };
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { finir(); return; }
    intro.addEventListener('click', () => {
      intro.style.animation = 'introSort .45s cubic-bezier(.6,0,.35,1) forwards';
      setTimeout(finir, 470);
    });
    intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
    setTimeout(finir, 4500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
