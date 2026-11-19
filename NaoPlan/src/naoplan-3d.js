/* ============================================================
   NaoPlan — la vue 3D
   ------------------------------------------------------------
   Une maquette, pas un rendu : les mêmes rectangles que le plan,
   relevés en volume et vus de trois quarts.

   Deux partis pris, et la raison de chacun :

   · L'AXONOMÉTRIE plutôt que la perspective. Pas de point de fuite,
     pas de caméra : un mètre reste un mètre où qu'il se trouve.
     On peut donc continuer à lire les proportions, ce qu'une
     perspective interdit. C'est le dessin d'un maquettiste.

   · DES MURS BAS (1,25 m). À hauteur réelle, les murs du premier
     plan cacheraient les pièces du fond — le défaut de toutes les
     vues 3D de logement. Coupés à mi-hauteur, tout reste visible
     d'un coup d'œil, comme une maquette en carton posée sur
     une table. Les portes sont des trous, les fenêtres des bandes
     claires : on voit où elles tombent sans perdre le dessus.

   Aucune bibliothèque : de la trigonométrie, et un tri des faces
   de l'arrière vers l'avant (l'algorithme du peintre).
   ============================================================ */
const NP3D = (function () {
  'use strict';

  const COS30 = Math.cos(Math.PI / 6), SIN30 = .5;
  const H_MUR = 1.25;        // hauteur de coupe de la maquette
  const H_APPUI = .5;        // allège : le bas d'une fenêtre
  const EP_EXT = .3, EP_INT = .09;
  const q = v => Math.round(v * 1000) / 1000;

  /* Projection isométrique. z monte, (x,y) est le plan du sol. */
  function proj(x, y, z) {
    return [(x - y) * COS30, (x + y) * SIN30 - (z || 0)];
  }
  const pts = a => a.map(p => q(p[0]) + ',' + q(p[1])).join(' ');

  /* Éclaircit ou assombrit une couleur : les faces d'un volume ne
     peuvent pas avoir la même teinte, sinon le volume disparaît. */
  function teinte(hex, k) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
    return '#' + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)]
      .map(v => ('0' + v.toString(16)).slice(-2)).join('');
  }

  /* --------------------------------------------------------
     Une boîte posée au sol : trois faces visibles depuis notre
     point de vue (le dessus, la face sud, la face est).
     -------------------------------------------------------- */
  function boite(x, y, w, d, z0, h, coul, opts) {
    opts = opts || {};
    const z1 = z0 + h;
    const A = [x, y], B = [x + w, y], C = [x + w, y + d], D = [x, y + d];
    const haut = [proj(A[0], A[1], z1), proj(B[0], B[1], z1), proj(C[0], C[1], z1), proj(D[0], D[1], z1)];
    const sud = [proj(D[0], D[1], z1), proj(C[0], C[1], z1), proj(C[0], C[1], z0), proj(D[0], D[1], z0)];
    const est = [proj(B[0], B[1], z1), proj(C[0], C[1], z1), proj(C[0], C[1], z0), proj(B[0], B[1], z0)];
    const tr = opts.opacite !== undefined ? ' opacity="' + opts.opacite + '"' : '';
    const bord = opts.bord ? ' stroke="' + opts.bord + '" stroke-width="' + (opts.ep || .012) +
      '" stroke-linejoin="round"' : '';
    let s = '';
    if (h > .001) {
      s += '<polygon points="' + pts(sud) + '" fill="' + teinte(coul, -.22) + '"' + tr + bord + '/>';
      s += '<polygon points="' + pts(est) + '" fill="' + teinte(coul, -.38) + '"' + tr + bord + '/>';
    }
    s += '<polygon points="' + pts(haut) + '" fill="' + coul + '"' + tr + bord + '/>';
    return s;
  }

  /* Profondeur d'un objet pour le tri : plus x+y est grand, plus il
     est près de nous, donc plus il est dessiné tard. */
  const prof = o => (o.x + o.w / 2) + (o.y + o.d / 2);

  /* Le plus grand morceau de chaque pièce : c'est là qu'on pose ses
     meubles et son nom (une pièce en L n'a qu'un lit, qu'une étiquette). */
  function grands(niv) {
    const m = {};
    niv.cases.forEach(c => {
      const id = c.piece.id;
      if (!m[id] || c.w * c.h > m[id].w * m[id].h) m[id] = c;
    });
    return Object.keys(m).map(k => m[k]);
  }

  /* --------------------------------------------------------
     Les murs d'un niveau, découpés autour des ouvertures.
     Chaque mur est une bande ; une porte la coupe en deux,
     une fenêtre y laisse une allège et un linteau.
     -------------------------------------------------------- */
  function mursDuNiveau(niv) {
    const segs = [];
    const W = niv.W, H = niv.H;

    /* On collecte tous les pans de mur : le contour de chaque pièce.
       Un pan partagé par deux pièces est dessiné une seule fois. */
    const vus = {};
    const ajoute = (axe, pos, a, b, ext) => {
      if (b - a < .02) return;
      const k = axe + '|' + q(pos) + '|' + q(a) + '|' + q(b);
      if (vus[k]) { vus[k].ext = vus[k].ext || ext; return; }
      vus[k] = {axe: axe, pos: pos, a: a, b: b, ext: ext};
      segs.push(vus[k]);
    };
    /* Seulement les vrais murs : une pièce en L n'a pas de cloison
       entre ses deux morceaux. */
    NP.mursReels(niv).forEach(m => {
      const L = m.axe === 'v' ? W : H;
      ajoute(m.axe, m.pos, m.a, m.b, Math.abs(m.pos) < .02 || Math.abs(m.pos - L) < .02);
    });

    /* Les ouvertures, rangées par mur. */
    const ouvs = (niv.portes || []).concat(niv.fenetres || []);
    const morceaux = [];
    segs.forEach(m => {
      const ep = m.ext ? EP_EXT : EP_INT;
      const sur = ouvs.filter(o => o.axe === m.axe && Math.abs(o.pos - m.pos) < .06 &&
        o.c - o.l / 2 > m.a - .02 && o.c + o.l / 2 < m.b + .02)
        .sort((x, y) => x.c - y.c);
      let d = m.a;
      const bande = (a, b, z0, h) => {
        if (b - a < .02 || h < .02) return;
        morceaux.push(m.axe === 'h'
          ? {x: a, y: m.pos - ep / 2, w: b - a, d: ep, z: z0, h: h, ext: m.ext}
          : {x: m.pos - ep / 2, y: a, w: ep, d: b - a, z: z0, h: h, ext: m.ext});
      };
      sur.forEach(o => {
        bande(d, o.c - o.l / 2, 0, H_MUR);
        if (o.type === 'fenetre' || o.type === 'baie') {
          /* Une fenêtre laisse son allège ; une baie descend au sol. */
          if (o.type === 'fenetre') bande(o.c - o.l / 2, o.c + o.l / 2, 0, H_APPUI);
          morceaux.push(Object.assign(
            m.axe === 'h'
              ? {x: o.c - o.l / 2, y: m.pos - ep / 2, w: o.l, d: ep}
              : {x: m.pos - ep / 2, y: o.c - o.l / 2, w: ep, d: o.l},
            {z: o.type === 'fenetre' ? H_APPUI : 0, h: .02, vitre: true, ext: m.ext}));
        }
        d = o.c + o.l / 2;
      });
      bande(d, m.b, 0, H_MUR);
    });
    return morceaux;
  }

  /* --------------------------------------------------------
     Le mobilier : des blocs, à la bonne emprise et à la bonne
     hauteur. Un lit fait 50 cm, un plan de travail 90.
     -------------------------------------------------------- */
  const HM = {lit: .5, canape: .75, table: .75, plan: .9, bac: .55, douche: .2,
              wc: .42, marche: 1.1, bureau: .74, rangement: 1.1, voiture: 1.4};

  function meubles(niv) {
    const out = [];
    const m = (x, y, w, d, h, t) => { if (w > .15 && d > .15) out.push({x: x, y: y, w: w, d: d, z: 0, h: h, meuble: t}); };
    /* Les pièces meublées à la main n'ont pas de meubles automatiques. */
    const occ = typeof NPM !== 'undefined' ? NPM.occupees(niv) : {};
    grands(niv).forEach(c => {
      if (occ[c.piece.id] && c.piece.type !== 'escalier') return;
      const t = c.piece.type, horiz = c.w >= c.h;
      const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
      if (t === 'chambre' || t === 'parentale' || t === 'suite') {
        const L = 2.0, lg = t === 'chambre' ? 1.4 : 1.65;
        if (horiz && L < c.w - .5 && lg < c.h - .5) m(c.x + .3, cy - lg / 2, L, lg, HM.lit, 'lit');
        else if (!horiz && lg < c.w - .5 && L < c.h - .5) m(cx - lg / 2, c.y + .3, lg, L, HM.lit, 'lit');
      } else if (t === 'cuisine') {
        if (horiz) m(c.x + .1, c.y + .1, c.w - .2, .6, HM.plan, 'plan');
        else m(c.x + .1, c.y + .1, .6, c.h - .2, HM.plan, 'plan');
      } else if (t === 'sejour') {
        if (Math.min(c.w, c.h) > 2.4) {
          if (horiz) { m(cx - 1.05, cy - .9, 2.1, .85, HM.canape, 'canape'); m(cx - .55, cy + .15, 1.1, .6, .4, 'table'); }
          else { m(cx - .9, cy - 1.05, .85, 2.1, HM.canape, 'canape'); m(cx + .15, cy - .55, .6, 1.1, .4, 'table'); }
        }
      } else if (t === 'salle_manger') {
        m(cx - (horiz ? .8 : .45), cy - (horiz ? .45 : .8), horiz ? 1.6 : .9, horiz ? .9 : 1.6, HM.table, 'table');
      } else if (t === 'sdb' || t === 'salle_eau') {
        const bain = t === 'sdb' && Math.max(c.w, c.h) > 2.2;
        if (bain) {
          if (horiz) m(c.x + .08, c.y + .08, 1.7, Math.min(.72, c.h - .16), HM.bac, 'bac');
          else m(c.x + .08, c.y + .08, Math.min(.72, c.w - .16), 1.7, HM.bac, 'bac');
        } else {
          const s = Math.min(.9, Math.min(c.w, c.h) - .2);
          m(c.x + .08, c.y + .08, s, s, HM.douche, 'douche');
        }
      } else if (t === 'wc') {
        m(cx - .19, cy - .29, .38, .58, HM.wc, 'wc');
      } else if (t === 'bureau') {
        if (horiz) m(c.x + .15, c.y + .15, Math.min(1.5, c.w - .3), .62, HM.bureau, 'bureau');
        else m(c.x + .15, c.y + .15, .62, Math.min(1.5, c.h - .3), HM.bureau, 'bureau');
      } else if (t === 'dressing' || t === 'cellier' || t === 'buanderie') {
        const p = Math.min(.6, Math.min(c.w, c.h) * .45);
        if (horiz) m(c.x + .06, c.y + .06, c.w - .12, p, HM.rangement, 'rangement');
        else m(c.x + .06, c.y + .06, p, c.h - .12, HM.rangement, 'rangement');
      } else if (t === 'escalier' && c.piece.forme === 'colimacon') {
        /* Le colimaçon : des marches qui tournent en montant autour d'un fût. */
        const R = Math.max(.35, Math.min(c.w, c.h) / 2 - .1), n = 10;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const mx = cx + Math.cos(a) * R * .55, my = cy + Math.sin(a) * R * .55;
          m(mx - R * .28, my - R * .28, R * .56, R * .56, .15 + 1.05 * i / n, 'marche');
        }
        m(cx - .08, cy - .08, .16, .16, 1.3, 'marche');
      } else if (t === 'escalier') {
        /* Les marches : une volée qui monte vers le fond. */
        const n = 7;
        for (let i = 0; i < n; i++) {
          const f = i / n, e = (i + 1) / n;
          if (horiz) m(c.x + .08 + (c.w - .16) * f, c.y + .1, (c.w - .16) / n, c.h - .2, .18 + 1.0 * f, 'marche');
          else m(c.x + .1, c.y + .08 + (c.h - .16) * f, c.w - .2, (c.h - .16) / n, .18 + 1.0 * f, 'marche');
        }
      }
    });
    return out;
  }

  /* --------------------------------------------------------
     La scène complète d'un niveau.
     -------------------------------------------------------- */
  function scene(niv, C, coulPiece, opts) {
    opts = opts || {};
    const objets = [];
    const W = niv.W, H = niv.H;

    /* Les extérieurs, à plat. Le jardin devient un simple socle serré
       autour du bâti : dessiné en entier, il réduirait la maison à un
       timbre-poste au milieu de l'herbe. */
    const autres = (niv.ext || []).filter(e => e.genre !== 'jardin');
    const jardin = (niv.ext || []).find(e => e.genre === 'jardin');
    if (jardin) {
      let x0 = 0, y0 = 0, x1 = W, y1 = H;
      autres.forEach(e => { x0 = Math.min(x0, e.x); y0 = Math.min(y0, e.y);
                            x1 = Math.max(x1, e.x + e.w); y1 = Math.max(y1, e.y + e.h); });
      const m = 1.2;
      objets.push({x: x0 - m, y: y0 - m, w: x1 - x0 + 2 * m, d: y1 - y0 + 2 * m, z: -.22, h: .12,
                   coul: C.ext, sol: true});
    }
    autres.forEach(e => {
      if (e.genre === 'piscine') {
        /* Hors-sol : une cuve d'1,20 m ; creusée : l'eau au ras du sol. */
        if (e.pose === 'horssol') objets.push({x: e.x, y: e.y, w: e.w, d: e.h, z: 0, h: 1.2, coul: C.vitre, nom: e.nom});
        else objets.push({x: e.x, y: e.y, w: e.w, d: e.h, z: -.08, h: .06, coul: C.vitre, sol: true, nom: e.nom});
        return;
      }
      const coul = e.genre === 'garage' ? C.serv : C.terr;
      objets.push({x: e.x, y: e.y, w: e.w, d: e.h, z: -.08, h: .06, coul: coul, sol: true, nom: e.nom});
    });

    /* La dalle : un sol par pièce, dans sa couleur de zone. */
    niv.cases.forEach(c => {
      objets.push({x: c.x, y: c.y, w: c.w, d: c.h, z: -.04, h: .04,
                   coul: coulPiece(c), sol: true, cas: c});
    });

    /* Les murs. */
    mursDuNiveau(niv).forEach(m => {
      objets.push(Object.assign({}, m, {coul: m.vitre ? C.vitre : (m.ext ? C.murExt : C.murInt)}));
    });

    /* Le mobilier. */
    if (opts.mobilier) meubles(niv).forEach(m => {
      objets.push(Object.assign({}, m, {coul: C.meuble}));
    });
    /* Les meubles posés à la main : toujours là, à leur hauteur. */
    if (typeof NPM !== 'undefined') (niv.meubles || []).forEach(m => {
      const b = NPM.emprise(m), def = NPM.CATALOGUE[m.genre] || {};
      objets.push({x: b.x, y: b.y, w: b.w, d: b.h, z: 0, h: Math.max(.02, def.h || .5), meuble: m.genre, coul: C.meuble});
    });

    /* L'algorithme du peintre : le fond d'abord, l'avant ensuite.
       Les sols passent avant tout le reste, sinon un mur du fond
       serait recouvert par la dalle de la pièce d'à côté. */
    const sols = objets.filter(o => o.sol).sort((a, b) => prof(a) - prof(b));
    const debout = objets.filter(o => !o.sol).sort((a, b) => prof(a) - prof(b));

    let s = '';
    sols.forEach(o => { s += boite(o.x, o.y, o.w, o.d, o.z, o.h, o.coul, {bord: C.trait, ep: .01}); });
    debout.forEach(o => {
      s += boite(o.x, o.y, o.w, o.d, o.z, o.h, o.coul,
        {bord: C.trait, ep: o.meuble ? .008 : .012, opacite: o.vitre ? .55 : undefined});
    });

    /* Les noms de pièces, posés à plat sur la dalle. */
    grands(niv).forEach(c => {
      if (c.w * c.h < 3.2) return;
      const p = proj(c.x + c.w / 2, c.y + c.h / 2, .02);
      s += '<text x="' + q(p[0]) + '" y="' + q(p[1]) + '" font-size="' + q(opts.fs || .3) +
        '" text-anchor="middle" fill="' + C.ink + '" opacity=".72" style="font-family:' +
        'var(--ui-sans);font-style:normal;font-weight:600">' + opts.esc(opts.abrege(c.piece.nom)) + '</text>';
    });

    /* L'étendue projetée, pour cadrer. */
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    const coins = [];
    objets.forEach(o => {
      [[o.x, o.y], [o.x + o.w, o.y], [o.x, o.y + o.d], [o.x + o.w, o.y + o.d]].forEach(pt => {
        coins.push(proj(pt[0], pt[1], 0));
        coins.push(proj(pt[0], pt[1], o.z + o.h));
      });
    });
    coins.forEach(p => {
      minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]);
      miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]);
    });
    void W; void H;
    return {svg: s, boite: {x: minx, y: miny, w: maxx - minx, h: maxy - miny}};
  }

  /* ============================================================
     LA FAÇADE
     ------------------------------------------------------------
     Une élévation : le logement vu droit devant, depuis l'extérieur.
     C'est le dessin qui dit la hauteur — ce que ni le plan ni la
     maquette ne montrent. Les ouvertures y retombent à leur vraie
     abscisse, et à leur vraie hauteur d'allège.

     Convention : on regarde toujours la façade de dehors. Au sud on
     lit les x dans le sens du plan ; au nord et à l'ouest, la vue
     est inversée — c'est ce qu'on verrait en se plaçant devant.
     ============================================================ */
  const H_NIV = 2.5;        // hauteur sous plafond
  const EP_PLANCHER = .28;  // l'épaisseur du plancher entre deux niveaux
  const H_ALLEGE = 1.0;     // le bas d'une fenêtre courante
  const H_FEN = 1.3;
  const H_PORTE = 2.15;

  const COTES = {
    S: {nom: 'Sud', axe: 'h', bord: 'max'},
    N: {nom: 'Nord', axe: 'h', bord: 'min'},
    E: {nom: 'Est', axe: 'v', bord: 'max'},
    O: {nom: 'Ouest', axe: 'v', bord: 'min'}
  };

  /* Les ouvertures d'un niveau qui donnent sur la façade demandée. */
  function surFacade(niv, cote) {
    const d = COTES[cote];
    const W = niv.W, H = niv.H;
    const pos = d.axe === 'h' ? (d.bord === 'max' ? H : 0) : (d.bord === 'max' ? W : 0);
    const L = d.axe === 'h' ? W : H;
    const u = v => (cote === 'S' || cote === 'E') ? v : L - v;
    const out = [];
    (niv.fenetres || []).concat(niv.portes || []).forEach(o => {
      if (o.axe !== d.axe || Math.abs(o.pos - pos) > .06) return;
      if (o.type === 'passage' || o.type === 'vide') return;
      const a = u(o.c - o.l / 2), b = u(o.c + o.l / 2);
      out.push({a: Math.min(a, b), b: Math.max(a, b), l: o.l, type: o.type});
    });
    return {ouv: out, L: L};
  }

  function facade(niveaux, cote, C, opts) {
    opts = opts || {};
    const n = niveaux.length;
    const base = surFacade(niveaux[0], cote);
    const L = base.L;
    const hTotale = n * H_NIV + (n - 1) * EP_PLANCHER;
    const pente = opts.toit === 'plat' ? 0 : .34;      // 34 % : une pente courante
    const debord = opts.toit === 'plat' ? .18 : .42;
    const hFaitage = pente ? (L / 2 + debord) * pente : .25;

    /* Le repère : y descend à l'écran, donc on dessine depuis le sol. */
    const sol = 0;
    const Y = z => sol - z;
    let s = '';

    /* Le terrain */
    s += '<path d="M' + q(-L * .12) + ' ' + q(Y(0)) + 'H' + q(L * 1.12) + '" stroke="' + C.trait +
      '" stroke-width="0.06" fill="none"/>';
    for (let i = 0; i <= 26; i++) {
      const x = -L * .12 + (L * 1.24) * (i / 26);
      s += '<path d="M' + q(x) + ' ' + q(Y(0)) + 'l-0.16 0.26" stroke="' + C.trait +
        '" stroke-width="0.025" opacity=".5" fill="none"/>';
    }

    /* Le volume bâti */
    s += '<rect x="0" y="' + q(Y(hTotale)) + '" width="' + q(L) + '" height="' + q(hTotale) +
      '" fill="' + C.mur + '" stroke="' + C.trait + '" stroke-width="0.05"/>';

    /* La toiture */
    if (pente) {
      s += '<path d="M' + q(-debord) + ' ' + q(Y(hTotale)) + 'L' + q(L / 2) + ' ' +
        q(Y(hTotale + hFaitage)) + 'L' + q(L + debord) + ' ' + q(Y(hTotale)) + 'Z" fill="' + C.toit +
        '" stroke="' + C.trait + '" stroke-width="0.05" stroke-linejoin="round"/>';
    } else {
      s += '<rect x="' + q(-debord) + '" y="' + q(Y(hTotale + hFaitage)) + '" width="' + q(L + debord * 2) +
        '" height="' + q(hFaitage) + '" fill="' + C.toit + '" stroke="' + C.trait + '" stroke-width="0.05"/>';
    }

    /* Le trait de plancher entre les niveaux */
    for (let i = 1; i < n; i++) {
      const z = i * H_NIV + (i - 1) * EP_PLANCHER;
      s += '<rect x="0" y="' + q(Y(z + EP_PLANCHER)) + '" width="' + q(L) + '" height="' + q(EP_PLANCHER) +
        '" fill="' + C.trait + '" opacity=".18"/>';
    }

    /* Les ouvertures, niveau par niveau */
    niveaux.forEach((niv, i) => {
      const z0 = i * (H_NIV + EP_PLANCHER);
      surFacade(niv, cote).ouv.forEach(o => {
        let bas, haut;
        if (o.type === 'entree') { bas = z0; haut = z0 + H_PORTE; }
        else if (o.type === 'baie') { bas = z0 + .05; haut = z0 + H_PORTE + .1; }
        else if (o.type === 'porte') { bas = z0; haut = z0 + H_PORTE; }
        else if (o.type === 'garage') { bas = z0; haut = z0 + 2.05; }
        else { bas = z0 + H_ALLEGE; haut = z0 + H_ALLEGE + H_FEN; }
        const h = haut - bas;
        s += '<rect x="' + q(o.a) + '" y="' + q(Y(haut)) + '" width="' + q(o.b - o.a) + '" height="' + q(h) +
          '" fill="' + (o.type === 'entree' || o.type === 'garage' ? C.porte : C.vitre) + '" stroke="' + C.trait +
          '" stroke-width="0.045"/>';
        if (o.type === 'garage') {
          /* La porte sectionnelle : ses panneaux horizontaux. */
          for (let k = 1; k < 5; k++) s += '<path d="M' + q(o.a) + ' ' + q(Y(bas + h * k / 5)) + 'h' + q(o.b - o.a) + '" stroke="' + C.trait + '" stroke-width="0.025" opacity=".7" fill="none"/>';
        } else if (o.type !== 'entree') {
          /* Le meneau : deux vantaux, comme dans la vraie vie. */
          s += '<path d="M' + q((o.a + o.b) / 2) + ' ' + q(Y(haut)) + 'v' + q(h) + '" stroke="' + C.trait +
            '" stroke-width="0.03" opacity=".6" fill="none"/>';
          s += '<path d="M' + q(o.a) + ' ' + q(Y(bas)) + 'h' + q(o.b - o.a) + '" stroke="' + C.trait +
            '" stroke-width="0.05" fill="none"/>';       // l'appui
        } else {
          s += '<circle cx="' + q(o.b - .16) + '" cy="' + q(Y(bas + 1.05)) + '" r="0.055" fill="' + C.trait + '"/>';
        }
      });
    });

    /* La cote de hauteur, à gauche */
    const xc = -.75;
    s += '<g stroke="' + C.cote + '" stroke-width="0.025" fill="none">' +
      '<path d="M' + q(xc) + ' ' + q(Y(0)) + 'V' + q(Y(hTotale + hFaitage)) +
      'M' + q(xc - .14) + ' ' + q(Y(0)) + 'h0.28M' + q(xc - .14) + ' ' + q(Y(hTotale + hFaitage)) + 'h0.28"/></g>';
    s += '<text x="' + q(xc - .18) + '" y="' + q(Y((hTotale + hFaitage) / 2)) + '" font-size="0.22" fill="' +
      C.cote + '" text-anchor="middle" transform="rotate(-90 ' + q(xc - .18) + ' ' +
      q(Y((hTotale + hFaitage) / 2)) + ')" style="font-family:var(--ui-sans);font-style:normal">' +
      (Math.round((hTotale + hFaitage) * 100) / 100).toFixed(2).replace('.', ',') + ' m au faîtage</text>';

    return {svg: s, boite: {x: -debord - 1.2, y: Y(hTotale + hFaitage) - .5,
                            w: L + debord * 2 + 1.7, h: hTotale + hFaitage + 1.1},
            nom: COTES[cote].nom};
  }

  return {scene: scene, facade: facade, proj: proj, H_MUR: H_MUR, COTES: COTES};
})();
