/* ============================================================
   NaoPlan — la lecture d'un plan en image
   ------------------------------------------------------------
   Transforme une image de plan (annonce, scan, capture) en un
   plan modifiable : des pièces rectangulaires, leurs portes, leurs
   fenêtres. Tout se passe ici, dans le navigateur, sur les pixels :
   l'image ne quitte pas l'ordinateur.

   Le principe, en six temps :
     1. LES MURS    — sur un plan d'agence, les murs sont des traits
                      noirs épais. On mesure leur épaisseur, puis une
                      « ouverture » morphologique efface tout ce qui est
                      plus fin : texte, mobilier, cotes, logo.
     2. L'EMPRISE   — le plus grand ensemble de murs d'un seul tenant,
                      et son cadre.
     3. LES LIGNES  — les murs horizontaux et verticaux, ramenés à leur
                      axe et regroupés quand ils sont alignés.
     4. LES PORTES  — un mur coupé sur moins de 1,35 m, c'est une porte :
                      on le referme (pour trouver les pièces) et on note
                      l'ouverture. Au-delà, c'est un passage ouvert : les
                      deux espaces n'en font qu'un, comme sur le plan.
     5. LES PIÈCES  — la grille des lignes découpe l'emprise en cases ;
                      les cases que rien ne sépare forment une pièce.
                      Une pièce en L devient deux rectangles.
     6. LES NOMS    — facultatif : une reconnaissance de texte (qui
                      tourne, elle aussi, dans le navigateur) lit
                      « Chambre », « Cuisine »… et place chaque mot
                      dans sa pièce.

   Ce que ça ne sait pas faire, et le dit : les murs en biais, les
   pièces rondes, et les plans dessinés au trait fin (croquis à main
   levée). Le plan obtenu est une base, qu'on corrige ensuite à la main.
   ============================================================ */
const NPL = (function () {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Outils sur masques binaires ---------- */
  function filtreMin(src, W, H, r, horiz) {
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v = 1;
        for (let d = -r; d <= r && v; d++) {
          const xx = horiz ? x + d : x, yy = horiz ? y : y + d;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H || !src[yy * W + xx]) v = 0;
        }
        out[y * W + x] = v;
      }
    }
    return out;
  }
  function filtreMax(src, W, H, r, horiz) {
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v = 0;
        for (let d = -r; d <= r && !v; d++) {
          const xx = horiz ? x + d : x, yy = horiz ? y : y + d;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && src[yy * W + xx]) v = 1;
        }
        out[y * W + x] = v;
      }
    }
    return out;
  }
  /* Ouverture morphologique : érosion puis dilatation. Efface ce qui
     est plus fin que 2r+1 pixels, rend le reste à l'identique. */
  function ouverture(m, W, H, r) {
    let e = filtreMin(m, W, H, r, true); e = filtreMin(e, W, H, r, false);
    let d = filtreMax(e, W, H, r, true); d = filtreMax(d, W, H, r, false);
    return d;
  }

  /* Composantes connexes (4-voisinage). */
  function composantes(m, W, H) {
    const lab = new Int32Array(W * H).fill(-1);
    const comps = [];
    const pile = new Int32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      if (!m[i] || lab[i] >= 0) continue;
      const id = comps.length;
      const c = {id: id, n: 0, x0: 1e9, y0: 1e9, x1: -1, y1: -1};
      let sp = 0;
      pile[sp++] = i; lab[i] = id;
      while (sp) {
        const p = pile[--sp];
        const x = p % W, y = (p - x) / W;
        c.n++;
        if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x;
        if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
        const vois = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1];
        for (let k = 0; k < 4; k++) {
          const q = vois[k];
          if (q >= 0 && m[q] && lab[q] < 0) { lab[q] = id; pile[sp++] = q; }
        }
      }
      comps.push(c);
    }
    return {lab: lab, comps: comps};
  }

  /* Regroupe des valeurs proches (à tol près) ; renvoie les centres. */
  function grouper(vals, tol, ancres) {
    const v = vals.slice().sort((a, b) => a - b);
    const gr = [];
    v.forEach(x => {
      const g = gr[gr.length - 1];
      if (g && x - g[g.length - 1] <= tol) g.push(x); else gr.push([x]);
    });
    return gr.map(g => {
      const a = (ancres || []).find(an => an >= g[0] - tol && an <= g[g.length - 1] + tol);
      return a !== undefined ? a : g.reduce((s, x) => s + x, 0) / g.length;
    });
  }
  const plusProche = (liste, v) => liste.reduce((b, x) => Math.abs(x - v) < Math.abs(b - v) ? x : b, liste[0]);

  /* ============================================================
     L'ANALYSE
     img      : une image chargée (HTMLImageElement ou canvas)
     largeurM : la largeur réelle du logement, en mètres
     ============================================================ */
  function analyser(img, largeurM) {
    const MAX = 1600;             // assez fin pour qu'un pixel vaille à peine un centimètre
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const k = Math.min(1, MAX / Math.max(iw, ih));
    const W = Math.max(1, Math.round(iw * k)), H = Math.max(1, Math.round(ih * k));
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.drawImage(img, 0, 0, W, H);
    const px = g.getImageData(0, 0, W, H).data;

    /* 1. Les pixels sombres */
    const lum = new Uint8Array(W * H), sombre = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const l = .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2];
      lum[i] = l;
      sombre[i] = l < 100 ? 1 : 0;
    }

    /* L'épaisseur des murs : la longueur de course sombre la plus
       fréquente, au-delà de 4 px (en deçà, c'est du texte ou un trait). */
    const hist = new Array(61).fill(0);
    const courses = (horiz) => {
      const n1 = horiz ? H : W, n2 = horiz ? W : H;
      for (let a = 0; a < n1; a++) {
        let run = 0;
        for (let b = 0; b <= n2; b++) {
          const on = b < n2 && sombre[horiz ? a * W + b : b * W + a];
          if (on) run++;
          else { if (run >= 2 && run <= 60) hist[run]++; run = 0; }
        }
      }
    };
    courses(true); courses(false);
    let t = 6, best = 0;
    for (let L = 4; L <= 40; L++) if (hist[L] > best) { best = hist[L]; t = L; }

    /* Une ouverture légère efface les traits fins (mobilier, logo,
       hachures) sans toucher aux cloisons, souvent plus fines que les
       murs de façade. Le texte, lui, survit — mais il sera écarté plus
       bas : une lettre ne contient jamais de long trait droit. */
    const r = 1;
    const murs = ouverture(sombre, W, H, r);

    /* 2. Les longs traits droits : ce sont les murs. */
    const Lpx = Math.max(t * 3, Math.round(.03 * Math.max(W, H)));
    const longs = (horiz) => {
      const m = new Uint8Array(W * H);
      const n1 = horiz ? H : W, n2 = horiz ? W : H;
      for (let a = 0; a < n1; a++) {
        let deb = -1;
        for (let b = 0; b <= n2; b++) {
          const on = b < n2 && murs[horiz ? a * W + b : b * W + a];
          if (on && deb < 0) deb = b;
          if (!on && deb >= 0) {
            if (b - deb >= Lpx) for (let q = deb; q < b; q++) m[horiz ? a * W + q : q * W + a] = 1;
            deb = -1;
          }
        }
      }
      return m;
    };
    /* Le contour se lit sur les traits épais : les façades. Un long
       trait mince (contour de balcon, ligne de cote, cadre de page)
       n'en fait pas partie. Les cloisons, souvent aussi fines qu'un
       contour de balcon, seront reprises ensuite — mais seulement à
       l'intérieur de la maison. */
    const epais = (m, horiz) => {
      const cc = composantes(m, W, H);
      const mince = {};
      cc.comps.forEach(c => {
        const ep = (horiz ? c.y1 - c.y0 : c.x1 - c.x0) + 1;
        if (ep < Math.max(3, t * .7)) mince[c.id] = true;
      });
      for (let i = 0; i < W * H; i++) if (m[i] && mince[cc.lab[i]]) m[i] = 0;
      return m;
    };
    const mH = epais(longs(true), true), mV = epais(longs(false), false);

    /* L'emprise : le cadre de tous les longs traits. */
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let i = 0; i < W * H; i++) {
      if (mH[i] || mV[i]) {
        const x = i % W, y = (i - x) / W;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    const grand = null;
    if (x1 - x0 < t * 8 || y1 - y0 < t * 8) return {erreur: 'L\'image ne ressemble pas à un plan : pas d\'emprise nette.'};
    const xa = x0 + t / 2, xb = x1 - t / 2, ya = y0 + t / 2, yb = y1 - t / 2;
    const pxm = (xb - xa) / largeurM;                 // pixels par mètre
    /* Les seuils se comptent en épaisseurs de mur, pas en mètres : la
       lecture ne dépend donc pas de la largeur tapée, seule la
       conversion en mètres en dépend. */
    const Gmin = t * 2.8, Gmax = t * 8.5;

    /* 3. Les tronçons de mur : les courses longues, dans chaque sens. */
    const Lmin = t * 3.2;
    const tronçons = (horiz) => {
      const m = new Uint8Array(W * H);
      const n1 = horiz ? H : W, n2 = horiz ? W : H;
      for (let a = 0; a < n1; a++) {
        let deb = -1;
        for (let b = 0; b <= n2; b++) {
          const on = b < n2 && murs[horiz ? a * W + b : b * W + a];
          if (on && deb < 0) deb = b;
          if (!on && deb >= 0) {
            if (b - deb >= Lmin) for (let q = deb; q < b; q++) m[horiz ? a * W + q : q * W + a] = 1;
            deb = -1;
          }
        }
      }
      return composantes(m, W, H).comps
        .filter(c => (horiz ? c.y1 - c.y0 : c.x1 - c.x0) <= t * 3)
        /* Seulement dans la maison : un balcon ou une cote dehors ne
           dessinent pas de pièce. */
        .filter(c => c.x0 >= x0 - t && c.x1 <= x1 + t && c.y0 >= y0 - t && c.y1 <= y1 + t)
        .map(c => horiz ? {pos: (c.y0 + c.y1) / 2, a: c.x0, b: c.x1 + 1}
                        : {pos: (c.x0 + c.x1) / 2, a: c.y0, b: c.y1 + 1});
    };
    const segH = tronçons(true), segV = tronçons(false);

    /* Les lignes : on regroupe les axes proches, la façade fait foi. */
    const Xs = grouper(segV.map(s => s.pos).concat([xa, xb]), t * 1.6, [xa, xb]).filter(x => x >= xa - 1 && x <= xb + 1);
    const Ys = grouper(segH.map(s => s.pos).concat([ya, yb]), t * 1.6, [ya, yb]).filter(y => y >= ya - 1 && y <= yb + 1);

    /* 4. Chaque ligne : ses morceaux de mur, ses trous (portes, fenêtres). */
    const ouvertures = [];
    /* Second passage : une fois la ligne connue, on la relit en entier,
       pixel par pixel, dans l'épaisseur du mur. Les petits bouts de mur
       entre deux portes (trop courts pour la première passe) comptent. */
    const relire = (axe, v, lo, hi, v0, v1) => {
      const e = Math.max(2, Math.round(t * .5));
      const out = [];
      let deb = -1;
      const mini = Math.max(4, Math.round(t * .8));
      for (let u = Math.floor(lo); u <= Math.ceil(hi) + 1; u++) {
        let n = 0, m = 0;
        if (u <= hi) {
          /* On lit toute la bande des murs regroupés sur cette ligne : un palier
             dessiné 10 px plus haut que la cage d'escalier voisine reste lu. */
          const d0 = Math.round(Math.min(0, (v0 == null ? v : v0) - v)) - e, d1 = Math.round(Math.max(0, (v1 == null ? v : v1) - v)) + e;
          for (let d = d0; d <= d1; d++) {
            const x = Math.round(axe === 'v' ? v + d : u), y = Math.round(axe === 'v' ? u : v + d);
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            n++; if (murs[y * W + x]) m++;
          }
        }
        const on = n && m >= Math.max(2, Math.min(n * .35, t * .7));
        if (on && deb < 0) deb = u;
        if (!on && deb >= 0) { if (u - deb >= mini) out.push([deb, u]); deb = -1; }
      }
      return out;
    };
    /* Le style du plan : les portes intérieures sont-elles dessinées en
       liseré gris (un petit rectangle dans le mur) ? On en cherche sur
       toutes les lignes intérieures. Si oui, chaque porte est dessinée, et
       un trou blanc dans une cloison est un passage ouvert. */
    const lisereSur = (axe, v, lo, hi) => {
      const e = Math.max(3, Math.round(t * .7));
      let n = 0, deb = -1;
      for (let u = Math.floor(lo); u <= Math.ceil(hi) + 1; u++) {
        let g = 0, noir = 0, dmin = 1e9, dmax = -1e9;
        if (u <= hi) for (let d = -e; d <= e; d++) {
          const x = Math.round(axe === 'v' ? v + d : u), y = Math.round(axe === 'v' ? u : v + d);
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const l = lum[y * W + x];
          if (l < 222) { g++; if (d < dmin) dmin = d; if (d > dmax) dmax = d; }
          if (l < 55) noir++;
        }
        const on = u <= hi && g >= 2 && !noir && dmax - dmin <= t * 1.3;
        if (on && deb < 0) deb = u;
        if (!on && deb >= 0) { if (u - deb >= Gmin * .6 && u - deb <= Gmax * 1.3) n++; deb = -1; }
      }
      return n;
    };
    let nLiseres = 0;
    Xs.forEach(x => { if (Math.abs(x - xa) > t && Math.abs(x - xb) > t) nLiseres += lisereSur('v', x, ya, yb); });
    Ys.forEach(y => { if (Math.abs(y - ya) > t && Math.abs(y - yb) > t) nLiseres += lisereSur('h', y, xa, xb); });
    const liseres = nLiseres >= 3;

    const lignes = (segs, vals, axe) => vals.map(v => {
      const ext = Math.abs(v - (axe === 'v' ? xa : ya)) < 1 || Math.abs(v - (axe === 'v' ? xb : yb)) < 1;
      const lo = axe === 'v' ? ya : xa, hi = axe === 'v' ? yb : xb;
      /* Les morceaux relus sur la ligne ne comptent que s'ils touchent un
         vrai tronçon de la première passe, ou sont eux-mêmes assez longs
         — sinon une ligne qui traverse une pièce ramasserait les pieds
         de toutes les cloisons qu'elle croise. */
      const vrais = segs.filter(s => plusProche(vals, s.pos) === v);
      const perp = axe === 'v' ? Ys : Xs;
      /* Un morceau à peine plus large qu'un mur, posé pile sur une ligne
         perpendiculaire, n'est pas un bout de ce mur-ci : c'est le pied
         de la cloison qui le croise. On l'écarte, sinon on inventerait
         des murs qui traversent les pièces. */
      const pied = s => s[1] - s[0] <= t * 2 && perp.some(p => p >= s[0] - 1 && p <= s[1] + 1) &&
        !vrais.some(q => q.a <= s[1] + t && q.b >= s[0] - t);
      const bande = vrais.length ? [Math.min.apply(null, vrais.map(q => q.pos)), Math.max.apply(null, vrais.map(q => q.pos))] : [v, v];
      let iv = relire(axe, v, lo, hi, bande[0], bande[1]).filter(s =>
        !pied(s) && (s[1] - s[0] > t * 1.8 || vrais.some(q => q.a <= s[1] + Gmax && q.b >= s[0] - Gmax)))
        .concat(vrais.map(s => [s.a, s.b]))
        .map(s => [clamp(s[0], lo, hi), clamp(s[1], lo, hi)]).filter(s => s[1] > s[0]);
      /* Les bouts de cloison qui s'arrêtent à moins de 1,35 m d'un mur
         perpendiculaire le rejoignent : c'est une porte au bout. */
      /* Le mur perpendiculaire p existe-t-il vraiment à la hauteur de
         cette ligne ? (Sinon, c'est une ligne de la grille, pas un mur.) */
      const segsPerp = axe === 'v' ? segH : segV;
      const present = p => segsPerp.some(q => plusProche(perp, q.pos) === p && v >= q.a - t && v <= q.b + t);
      /* Un mur perpendiculaire qui passe de part et d'autre de la ligne :
         notre mur vient buter dessus et s'arrête là (un T dont il est la
         jambe). S'il s'arrête sur la ligne, c'est lui la jambe, et notre
         mur peut continuer au-delà. */
      const traverse = p => segsPerp.some(q => plusProche(perp, q.pos) === p && q.a < v - 2 * t && q.b > v + 2 * t);
      /* Un bout de mur posé sur un angle (un mur perpendiculaire y arrive)
         ne se prolonge que si le trou est vraiment une porte : un liseré
         gris dans l'épaisseur du mur. Sinon on inventerait une cloison —
         typiquement, la cage d'escalier prolongée jusqu'à la façade. */
      const grisDans = (a, b) => {
        /* La part des colonnes du trou où un liseré (trait gris ramassé) est dessiné. */
        const e = Math.max(3, Math.round(t * 1.4));
        const d0 = Math.round(bande[0] - v) - e, d1 = Math.round(bande[1] - v) + e;
        let n = 0, c = 0;
        for (let u = Math.ceil(a) + 1; u < b - 1; u++) {
          let g = 0, dmin = 1e9, dmax = -1e9;
          for (let d = d0; d <= d1; d++) {
            const x = Math.round(axe === 'v' ? v + d : u), y = Math.round(axe === 'v' ? u : v + d);
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            if (lum[y * W + x] < 222) { g++; if (d < dmin) dmin = d; if (d > dmax) dmax = d; }
          }
          n++;
          if (g >= 2 && dmax - dmin <= t * 1.3) c++;
        }
        return n ? c / n : 0;
      };
      const surAngle = x => perp.some(p => Math.abs(p - x) <= t && present(p));
      /* Les cloisons en trait fin et les portes en liseré gris : on relit la
         bande du mur (un peu plus large, un trait fin peut être décalé de
         quelques pixels), colonne par colonne. Une suite continue de
         trait, fin, gris ou épais, bordée à ses deux bouts par un mur, ferme
         la pièce ; ses parties seulement grises sont des portes. */
      if (!ext) {
        const e = Math.max(3, Math.round(t * 1.4));
        const d0 = Math.round(bande[0] - v) - e, d1 = Math.round(bande[1] - v) + e;
        let deb = -1;
        const runs = [], etat = [], travers = [];
        for (let u = Math.floor(lo); u <= Math.ceil(hi) + 1; u++) {
          let g = 0, noir = 0, dmin = 1e9, dmax = -1e9;
          if (u <= hi) for (let d = d0; d <= d1; d++) {
            const x = Math.round(axe === 'v' ? v + d : u), y = Math.round(axe === 'v' ? u : v + d);
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            const l = lum[y * W + x];
            if (l < 222) { g++; if (d < dmin) dmin = d; if (d > dmax) dmax = d; }
            if (l < 55) noir++;
          }
          /* Un trait ou un liseré est ramassé (moins d'une épaisseur de mur) ;
             un escalier en colimaçon ou un mot, eux, s'étalent : on les ignore. */
          const on = u <= hi && g >= 2 && dmax - dmin <= t * 1.3;
          etat[u] = noir >= 2 ? 'n' : 'g';
          /* Une colonne sombre sur presque toute la bande : un mur qui croise. */
          travers[u] = g >= (d1 - d0) * .7;
          if (on && deb < 0) deb = u;
          if (!on && deb >= 0) { runs.push([deb, u]); deb = -1; }
        }
        const bord = x => iv.some(s => Math.abs(s[0] - x) <= t * 1.6 || Math.abs(s[1] - x) <= t * 1.6) ||
          perp.some(p => Math.abs(p - x) <= t * 1.6 && present(p)) || Math.abs(x - lo) <= t * 1.6 || Math.abs(x - hi) <= t * 1.6 ||
          [-3, -2, -1, 1, 2, 3].some(k => travers[Math.round(x) + k]);
        runs.forEach(r => {
          const L = r[1] - r[0];
          if (L < Gmin * .8 || !bord(r[0]) || !bord(r[1])) return;
          if (iv.some(s => s[0] <= r[0] + 2 && s[1] >= r[1] - 2)) return;
          iv.push([r[0], r[1]]);
          /* Les liserés gris dans cette suite : des portes. */
          let g0 = -1;
          for (let u = r[0]; u <= r[1]; u++) {
            const gris = u < r[1] && etat[u] === 'g';
            if (gris && g0 < 0) g0 = u;
            if (!gris && g0 >= 0) {
              if (u - g0 >= Gmin * .6) ouvertures.push({axe: axe, pos: v, a: g0, b: u, ext: false});
              g0 = -1;
            }
          }
        });
      }
      iv = iv.map(s => {
        const n = [s[0], s[1]];
        const buteFin = perp.some(p => Math.abs(p - s[1]) <= t && traverse(p));
        const buteDeb = perp.some(p => Math.abs(p - s[0]) <= t && traverse(p));
        /* Vers l'avant : le premier mur perpendiculaire après le bout. */
        let avant = buteFin ? undefined :
          perp.filter(p => p > s[1] + 1 && p - s[1] <= Gmax && present(p)).sort((p, q) => p - q)[0];
        if (avant !== undefined && (surAngle(s[1]) || liseres) && grisDans(s[1], avant) < .5) avant = undefined;
        if (avant !== undefined) {
          if (avant - s[1] >= Gmin) ouvertures.push({axe: axe, pos: v, a: s[1], b: avant, ext: ext});
          n[1] = avant;
        } else {
          const colle = perp.find(p => Math.abs(p - s[1]) <= t);
          if (colle !== undefined) n[1] = Math.max(n[1], colle);
        }
        /* Vers l'arrière : le dernier mur perpendiculaire avant le début. */
        let arr = buteDeb ? undefined :
          perp.filter(p => p < s[0] - 1 && s[0] - p <= Gmax && present(p)).sort((p, q) => q - p)[0];
        if (arr !== undefined && (surAngle(s[0]) || liseres) && grisDans(arr, s[0]) < .5) arr = undefined;
        if (arr !== undefined) {
          if (s[0] - arr >= Gmin) ouvertures.push({axe: axe, pos: v, a: arr, b: s[0], ext: ext});
          n[0] = arr;
        } else {
          const colle = perp.find(p => Math.abs(p - s[0]) <= t);
          if (colle !== undefined) n[0] = Math.min(n[0], colle);
        }
        return n;
      });
      iv.sort((p, q) => p[0] - q[0]);
      const fus = [];
      iv.forEach(s => {
        const d = fus[fus.length - 1];
        if (d && s[0] <= d[1] + 1) { d[1] = Math.max(d[1], s[1]); return; }
        if (d) {
          const trou = s[0] - d[1];
          /* Un mur de façade reste un mur : ses trous sont des fenêtres
             ou la porte d'entrée. À l'intérieur, un trou court est une
             porte (on referme), un grand trou est un passage (on laisse). */
          /* Plan « à liserés » : une porte y est toujours dessinée ; un trou
             blanc est alors un passage ouvert, pas une porte oubliée. */
          if (ext || (trou <= Gmax && (!liseres || grisDans(d[1], s[0]) >= .5))) {
            if (trou >= Gmin) ouvertures.push({axe: axe, pos: v, a: d[1], b: s[0], ext: ext});
            d[1] = Math.max(d[1], s[1]);
            return;
          }
        }
        fus.push([s[0], s[1]]);
      });
      if (ext) {
        /* La façade couvre toute la longueur ; ses trous aux extrémités aussi. */
        if (!fus.length) fus.push([lo, hi]);
        if (fus[0][0] - lo >= Gmin) ouvertures.push({axe: axe, pos: v, a: lo, b: fus[0][0], ext: true});
        if (hi - fus[fus.length - 1][1] >= Gmin) ouvertures.push({axe: axe, pos: v, a: fus[fus.length - 1][1], b: hi, ext: true});
        return {pos: v, iv: [[lo, hi]]};
      }
      return {pos: v, iv: fus};
    });
    const LV = lignes(segV, Xs, 'v'), LH = lignes(segH, Ys, 'h');

    /* Un mur sépare-t-il deux cases ? Oui s'il couvre plus de la moitié
       de leur bord commun. */
    const couvre = (ligne, a, b) => {
      let s = 0;
      ligne.iv.forEach(iv => { s += Math.max(0, Math.min(b, iv[1]) - Math.max(a, iv[0])); });
      return s >= (b - a) * .5;
    };

    /* 5. La grille, puis les pièces par remplissage. */
    const nx = Xs.length - 1, ny = Ys.length - 1;
    if (nx < 1 || ny < 1) return {erreur: 'Pas assez de murs lisibles.'};
    const region = new Int32Array(nx * ny).fill(-1);
    let nr = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      if (region[j * nx + i] >= 0) continue;
      const pile = [[i, j]]; region[j * nx + i] = nr;
      while (pile.length) {
        const [a, b] = pile.pop();
        const essai = (a2, b2, bloque) => {
          if (a2 < 0 || b2 < 0 || a2 >= nx || b2 >= ny || region[b2 * nx + a2] >= 0 || bloque) return;
          region[b2 * nx + a2] = nr; pile.push([a2, b2]);
        };
        essai(a + 1, b, couvre(LV[a + 1], Ys[b], Ys[b + 1]));
        essai(a - 1, b, couvre(LV[a], Ys[b], Ys[b + 1]));
        essai(a, b + 1, couvre(LH[b + 1], Xs[a], Xs[a + 1]));
        essai(a, b - 1, couvre(LH[b], Xs[a], Xs[a + 1]));
      }
      nr++;
    }

    /* Chaque région devient un ou plusieurs rectangles : on prend le
       plus grand rectangle de cases libres, et on recommence. */
    const pris = new Uint8Array(nx * ny);
    const rects = [];
    for (let rg = 0; rg < nr; rg++) {
      for (;;) {
        let meilleur = null;
        for (let j0 = 0; j0 < ny; j0++) for (let i0 = 0; i0 < nx; i0++) {
          if (region[j0 * nx + i0] !== rg || pris[j0 * nx + i0]) continue;
          let iMax = nx;
          for (let j1 = j0; j1 < ny; j1++) {
            let i1 = i0;
            while (i1 < iMax && region[j1 * nx + i1] === rg && !pris[j1 * nx + i1]) i1++;
            iMax = i1;
            if (iMax <= i0) break;
            const aire = (Xs[iMax] - Xs[i0]) * (Ys[j1 + 1] - Ys[j0]);
            if (!meilleur || aire > meilleur.aire) meilleur = {i0: i0, i1: iMax, j0: j0, j1: j1 + 1, aire: aire};
          }
        }
        if (!meilleur) break;
        for (let j = meilleur.j0; j < meilleur.j1; j++) for (let i = meilleur.i0; i < meilleur.i1; i++) pris[j * nx + i] = 1;
        rects.push({region: rg, x: Xs[meilleur.i0], y: Ys[meilleur.j0],
                    w: Xs[meilleur.i1] - Xs[meilleur.i0], h: Ys[meilleur.j1] - Ys[meilleur.j0]});
      }
    }

    /* 6. Les ouvertures : fenêtre ou porte ? Une fenêtre est dessinée
       dans l'épaisseur du mur (un liseré gris) ; une porte laisse un
       vide blanc. On regarde le trou. */
    const typer = (o) => {
      let n = 0, g2 = 0;
      const e = Math.max(1, Math.floor(t / 2));
      for (let u = Math.ceil(o.a); u < o.b; u++) for (let d = -e; d <= e; d++) {
        const x = Math.round(o.axe === 'v' ? o.pos + d : u), y = Math.round(o.axe === 'v' ? u : o.pos + d);
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        n++;
        if (lum[y * W + x] < 222) g2++;
      }
      const grise = n ? g2 / n : 0;
      if (!o.ext) return 'porte';
      if (grise > .1) return (o.b - o.a) / pxm >= 2.1 ? 'baie' : 'fenetre';
      return 'entree';
    };
    /* Pas deux fois le même trou : deux ouvertures sur le même mur qui se
       chevauchent n'en font qu'une (la plus large). */
    const ouv = [];
    ouvertures.slice().sort((p, q) => (q.b - q.a) - (p.b - p.a)).forEach(o => {
      const doublon = ouv.some(x => x.axe === o.axe && Math.abs(x.pos - o.pos) <= t * 1.5 &&
        Math.min(x.c + x.l / 2, o.b) - Math.max(x.c - x.l / 2, o.a) > Math.min(x.l, o.b - o.a) * .3);
      if (doublon) return;
      ouv.push({type: typer(o), axe: o.axe, pos: o.pos, c: (o.a + o.b) / 2, l: (o.b - o.a), ext: o.ext});
    });
    /* Une seule porte d'entrée : la plus large ; les autres portes de
       façade deviennent des portes-fenêtres. */
    const entrees = ouv.filter(o => o.type === 'entree').sort((a, b) => b.l - a.l);
    entrees.slice(1).forEach(o => { o.type = o.l / pxm >= 1.6 ? 'baie' : 'fenetre'; });

    /* En mètres, depuis le coin de l'emprise. */
    const mx = v => (v - xa) / pxm, my = v => (v - ya) / pxm;
    return {
      W: (xb - xa) / pxm, H: (yb - ya) / pxm, pxm: pxm, epaisseur: t / pxm,
      debug: {t: t, r: r, liseres: liseres, nLiseres: nLiseres, img: [W, H], env: [x0, y0, x1, y1], Xs: Xs, Ys: Ys, nh: segH.length, nv: segV.length,
        LH: LH, LV: LV, segH: segH, segV: segV},
      rects: rects.map(q => ({region: q.region, x: mx(q.x), y: my(q.y), w: q.w / pxm, h: q.h / pxm})),
      ouvertures: ouv.map(o => ({type: o.type, axe: o.axe, pos: o.axe === 'v' ? mx(o.pos) : my(o.pos),
        c: o.axe === 'v' ? my(o.c) : mx(o.c), l: clamp(o.l / pxm, .5, 4)})),
      regions: nr,
      /* Pour la lecture des noms : l'image réduite et le repère. */
      canvas: cv, source: img, k: k, repere: {xa: xa, ya: ya, pxm: pxm}
    };
  }

  /* ============================================================
     LES NOMS DES PIÈCES (facultatif)
     La reconnaissance de texte tourne dans le navigateur (Tesseract).
     Son moteur se télécharge la première fois — il faut donc une
     connexion ce jour-là — mais l'image, elle, n'est envoyée nulle part.
     Sans connexion, on s'en passe : les pièces s'appellent « Pièce 1… ».
     ============================================================ */
  let tesseract = null;
  function chargerTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tesseract) return tesseract;
    tesseract = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      s.onload = () => window.Tesseract ? ok(window.Tesseract) : ko(new Error('Tesseract absent'));
      s.onerror = () => { tesseract = null; ko(new Error('hors ligne')); };
      document.head.appendChild(s);
    });
    return tesseract;
  }

  async function lireMots(analyse, delaiMs) {
    const T = await Promise.race([chargerTesseract(),
      new Promise((_, ko) => setTimeout(() => ko(new Error('délai')), delaiMs || 20000))]);
    const worker = await T.createWorker('fra');
    try {
      /* « Texte épars » : sur un plan, les mots sont semés çà et là, pas
         rangés en paragraphes. C'est ce mode qui les trouve tous. */
      try { await worker.setParameters({tessedit_pageseg_mode: '11'}); } catch (e) { /* ancien moteur */ }
      /* Le texte se lit mieux en grand : on repart de l'image d'origine,
         agrandie pour que les lettres fassent une trentaine de pixels. */
      const src = analyse.source;
      const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height;
      const z = Math.min(3, Math.max(1, 2400 / Math.max(iw, ih)));
      const cv = document.createElement('canvas');
      cv.width = Math.round(iw * z); cv.height = Math.round(ih * z);
      const g = cv.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
      g.imageSmoothingQuality = 'high';
      g.drawImage(src, 0, 0, cv.width, cv.height);
      const r = await Promise.race([worker.recognize(cv),
        new Promise((_, ko) => setTimeout(() => ko(new Error('délai')), 60000))]);
      const R = analyse.repere;
      /* Du repère de l'image agrandie à celui de l'analyse, puis en mètres. */
      const f = analyse.k / z;
      const bon = w => w.confidence >= 40 && /[a-zA-ZÀ-ÿ]{2,}/.test(w.text);
      const nettoie = s => s.replace(/[^a-zA-ZÀ-ÿ'’\- ]/g, '');
      const mots = (r.data.words || []).filter(bon)
        .map(w => ({texte: nettoie(w.text),
                    x: ((w.bbox.x0 + w.bbox.x1) / 2 * f - R.xa) / R.pxm,
                    y: ((w.bbox.y0 + w.bbox.y1) / 2 * f - R.ya) / R.pxm}));

      /* Seconde lecture, pièce par pièce : entourés de murs épais, certains
         noms échappent à la lecture d'ensemble. Découpée seule, sans ses
         murs, une pièce se lit presque toujours. */
      await worker.setParameters({tessedit_pageseg_mode: '6'});
      for (const q of analyse.rects) {
        if (q.w * q.h < 1.2) continue;
        const e = analyse.epaisseur * 1.2;
        const x0 = (R.xa + (q.x + e) * R.pxm) / analyse.k, y0 = (R.ya + (q.y + e) * R.pxm) / analyse.k;
        const x1 = (R.xa + (q.x + q.w - e) * R.pxm) / analyse.k, y1 = (R.ya + (q.y + q.h - e) * R.pxm) / analyse.k;
        if (x1 - x0 < 12 || y1 - y0 < 8) continue;
        const zz = Math.min(4, Math.max(2, 900 / Math.max(x1 - x0, y1 - y0)));
        const c2 = document.createElement('canvas');
        c2.width = Math.round((x1 - x0) * zz); c2.height = Math.round((y1 - y0) * zz);
        const g2 = c2.getContext('2d');
        g2.fillStyle = '#fff'; g2.fillRect(0, 0, c2.width, c2.height);
        g2.imageSmoothingQuality = 'high';
        g2.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, c2.width, c2.height);
        try {
          const r2 = await worker.recognize(c2);
          (r2.data.words || []).filter(bon).forEach(w => {
            mots.push({texte: nettoie(w.text), x: q.x + q.w / 2, y: q.y + q.h / 2, piece: true});
          });
        } catch (err) { /* une pièce illisible : on passe à la suivante */ }
      }
      return mots;
    } finally {
      worker.terminate();
    }
  }

  /* Du nom lu au type de pièce. L'ordre compte : « salle à manger »
     avant « salle », « chambre parentale » avant « chambre ». */
  const MOTS = [
    [/salon|s[ée]jour|living|pi[èe]ce de vie/i, 'sejour'],
    [/cuisine/i, 'cuisine'],
    [/manger/i, 'salle_manger'],
    [/parental|parents|suite/i, 'parentale'],
    [/chambre|ch\.?\s*\d/i, 'chambre'],
    [/salle d.?eau|douche/i, 'salle_eau'],
    [/bain|sdb/i, 'sdb'],
    [/\bwc\b|toilette/i, 'wc'],
    [/dressing|placard/i, 'dressing'],
    [/buanderie|lingerie/i, 'buanderie'],
    [/cellier|r[ée]serve|cave/i, 'cellier'],
    [/garage/i, 'garage'],
    [/bureau/i, 'bureau'],
    [/escalier/i, 'escalier'],
    [/palier|d[ée]gagement|couloir|circulation/i, 'degagement'],
    [/entr[ée]e|hall/i, 'entree']
  ];
  function typeDe(nom) {
    for (const m of MOTS) if (m[0].test(nom)) return m[1];
    return null;
  }

  /* Les jolis noms, et l'ordre de préséance quand une pièce ouverte
     porte plusieurs étiquettes (« Salon », « Cuisine », « Salle à
     manger » dans le même volume : c'est un séjour). */
  const JOLIS = {sejour: 'Séjour', cuisine: 'Cuisine', salle_manger: 'Salle à manger',
    parentale: 'Chambre parentale', chambre: 'Chambre', salle_eau: 'Salle d\'eau', sdb: 'Salle de bain',
    wc: 'WC', dressing: 'Dressing', buanderie: 'Buanderie', cellier: 'Cellier', garage: 'Garage',
    bureau: 'Bureau', escalier: 'Escalier', degagement: 'Dégagement', entree: 'Entrée'};
  const PRESEANCE = ['sejour', 'parentale', 'chambre', 'cuisine', 'salle_manger', 'sdb', 'salle_eau', 'garage',
    'bureau', 'buanderie', 'cellier', 'dressing', 'wc', 'escalier', 'entree', 'degagement'];

  /* Donne un type et un nom à chaque région d'une analyse, d'après les
     mots lus (ou, faute de mots, d'après sa taille — en le disant). */
  function nommer(analyse, mots) {
    const regions = {};
    analyse.rects.forEach(q => {
      const r = regions[q.region] || (regions[q.region] = {aire: 0, mots: [], w: 0, h: 0});
      r.aire += q.w * q.h;
      r.w = Math.max(r.w, q.w); r.h = Math.max(r.h, q.h);
      (mots || []).forEach(m => {
        if (m.x >= q.x && m.x <= q.x + q.w && m.y >= q.y && m.y <= q.y + q.h) r.mots.push(m.texte);
      });
    });
    const out = {};
    let nChambres = 0;
    Object.keys(regions).forEach(k => {
      const r = regions[k];
      const texte = r.mots.join(' ');
      const types = [];
      MOTS.forEach(m => {
        const t = m[1];
        if (m[0].test(texte) && types.indexOf(t) < 0) {
          /* « Salle d'eau » ne doit pas aussi compter comme « salle à manger ». */
          if (t === 'chambre' && types.indexOf('parentale') >= 0) return;
          types.push(t);
        }
      });
      if (types.length) {
        types.sort((a, b) => PRESEANCE.indexOf(a) - PRESEANCE.indexOf(b));
        const t = types[0];
        let nom = types.slice(0, 3).map(x => x === 'degagement' && /palier/i.test(texte) ? 'Palier' : JOLIS[x]).join(' · ');
        if (t === 'chambre') nChambres++;
        out[k] = {type: t, nom: nom, lu: true};
      } else if (r.aire < 1.2) {
        /* Sans nom lu, on ne devine plus « WC » : une petite pièce reste
           une pièce, à nommer soi-même. Seul un tout petit réduit devient
           un placard. */
        out[k] = {type: 'dressing', nom: 'Placard', lu: false};
      } else {
        out[k] = {type: 'piece', nom: 'Pièce', lu: false};
      }
    });
    /* Plusieurs chambres : on les numérote. */
    if (nChambres > 1) {
      let i = 0;
      Object.keys(out).sort((a, b) => a - b).forEach(k => { if (out[k].type === 'chambre') out[k].nom = 'Chambre ' + (++i); });
    }
    let n = 0;
    Object.keys(out).forEach(k => { if (out[k].type === 'piece') out[k].nom = 'Pièce ' + (++n); });
    return out;
  }

  return {analyser: analyser, lireMots: lireMots, typeDe: typeDe, nommer: nommer, MOTS: MOTS};
})();
