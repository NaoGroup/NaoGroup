/* ============================================================
   NaoPlan — le moteur
   ------------------------------------------------------------
   Il ne « dessine » rien : il transforme des critères (type de
   bien, surface, nombre de chambres…) en un agencement de
   rectangles cotés en mètres, avec ses portes et ses fenêtres.
   Le dessin, lui, est dans naoplan.js.

   La méthode tient en quatre temps :
     1. LE PROGRAMME  — quelles pièces, et quelle surface visée
                        pour chacune (fourchettes du bâtiment).
     2. L'ENVELOPPE   — un rectangle dont l'aire vaut la surface
                        du niveau, avec un élancement plausible.
     3. LA DISTRIBUTION — une bande de circulation traverse le
                        niveau ; les pièces se rangent de part et
                        d'autre, en une rangée. Toutes touchent
                        donc la bande : toutes ont une porte.
     4. LES OUVERTURES — portes sur les murs mitoyens de la
                        circulation, fenêtres sur les murs
                        donnant dehors.

   Comme il existe plusieurs bandes possibles (horizontale ou
   verticale, zone nuit à gauche ou à droite, ordre des pièces…),
   le moteur les essaie toutes, les note, et garde les trois
   meilleures qui ne se ressemblent pas : ce sont les variantes.
   ============================================================ */
const NP = (function () {
  'use strict';

  /* ---------- Catalogue des pièces ----------
     part  : part de la surface habitable visée (0 = surface fixe)
     min/max : fourchette en m² ; cote : plus petit côté acceptable (m)
     bande : la pièce se range dans la bande de distribution
     elast : la pièce absorbe les m² qui restent à placer          */
  const CAT = {
    entree:     {nom: 'Entrée',            emoji: '🚪', zone: 'circ', part: .045, min: 3,   max: 10, cote: 1.25, bande: true},
    degagement: {nom: 'Dégagement',        emoji: '🚶', zone: 'circ', part: .085, min: 3,   max: 26, cote: 1.05, bande: true, elast: true},
    escalier:   {nom: 'Escalier',          emoji: '🪜', zone: 'circ', part: 0,    min: 3.2, max: 4.8, cote: .95, bande: true, fixe: 3.6},
    sejour:     {nom: 'Séjour',            emoji: '🛋️', zone: 'jour', part: .26,  min: 16,  max: 75, cote: 3.0,  elast: true},
    cuisine:    {nom: 'Cuisine',           emoji: '🍳', zone: 'jour', part: .10,  min: 6.5, max: 22, cote: 2.0,  elast: true},
    salle_manger:{nom: 'Salle à manger',   emoji: '🍽️', zone: 'jour', part: .10,  min: 9,   max: 25, cote: 2.6,  elast: true},
    bureau:     {nom: 'Bureau',            emoji: '💻', zone: 'jour', part: .07,  min: 7,   max: 16, cote: 2.3,  elast: true},
    cellier:    {nom: 'Cellier',           emoji: '🧃', zone: 'serv', part: 0,    min: 3,   max: 9,  cote: 1.2,  fixe: 4.5},
    buanderie:  {nom: 'Buanderie',         emoji: '🧺', zone: 'serv', part: 0,    min: 3,   max: 9,  cote: 1.3,  fixe: 4.5},
    wc:         {nom: 'WC',                emoji: '🚻', zone: 'serv', part: 0,    min: 1.3, max: 2.6, cote: .88, bande: true, fixe: 1.7},
    sdb:        {nom: 'Salle de bain',     emoji: '🛁', zone: 'eau',  part: .055, min: 4.2, max: 13, cote: 1.7},
    salle_eau:  {nom: "Salle d'eau",       emoji: '🚿', zone: 'eau',  part: .033, min: 3,   max: 8,  cote: 1.5},
    parentale:  {nom: 'Chambre parentale', emoji: '🛏️', zone: 'nuit', part: .115, min: 11,  max: 24, cote: 2.8,  elast: true},
    chambre:    {nom: 'Chambre',           emoji: '🛏️', zone: 'nuit', part: .09,  min: 9,   max: 18, cote: 2.55, elast: true},
    dressing:   {nom: 'Dressing',          emoji: '👕', zone: 'nuit', part: 0,    min: 3.5, max: 9,  cote: 1.35, fixe: 5},
    suite:      {nom: 'Suite parentale',   emoji: '🛌', zone: 'nuit', part: .16,  min: 15,  max: 32, cote: 3.0,  elast: true},
    /* Types qui ne sortent pas du générateur, mais d'un plan dessiné à
       la main ou lu dans une image. */
    garage:     {nom: 'Garage',            emoji: '🚗', zone: 'serv', part: 0,    min: 12,  max: 45, cote: 2.6,  fixe: 17},
    piece:      {nom: 'Pièce',             emoji: '⬜', zone: 'serv', part: 0,    min: 1,   max: 80, cote: .5,   fixe: 10}
  };

  /* Les escaliers : la forme change l'emprise et le dessin, pas le reste. */
  const ESCALIERS = {
    droit:     {nom: 'Droit',            emoji: '🪜'},
    quart:     {nom: 'Quart tournant',   emoji: '↪️'},
    demi:      {nom: 'Demi-tournant',    emoji: '↩️'},
    colimacon: {nom: 'Colimaçon',        emoji: '🌀'}
  };

  /* Les pièces qu'on peut ajouter à la main, dans l'ordre du menu. */
  const AJOUTABLES = ['piece', 'chambre', 'parentale', 'bureau', 'sejour', 'cuisine', 'salle_manger', 'sdb', 'salle_eau', 'wc',
                      'dressing', 'cellier', 'buanderie', 'degagement', 'entree', 'escalier', 'garage'];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const somme = (t, f) => t.reduce((s, x) => s + f(x), 0);
  const copie = (o) => JSON.parse(JSON.stringify(o));

  /* ============================================================
     1. LE PROGRAMME
     ============================================================ */
  let compteurId = 0;

  function nouvellePiece(type, opts) {
    const d = CAT[type];
    return Object.assign({
      id: 'p' + (++compteurId) + Math.random().toString(36).slice(2, 6),
      type: type,
      nom: d.nom,
      niveau: 0,
      cible: d.fixe || 0,
      verrou: false          // surface fixée à la main par l'utilisateur
    }, opts || {});
  }

  /* Construit la liste des pièces à partir des critères. */
  function programme(c) {
    const P = [];
    const S = c.surface;
    const n2 = c.niveaux === 2;
    const add = (t, o) => { const p = nouvellePiece(t, o); P.push(p); return p; };

    /* --- le jour ---
       Une maison d'aujourd'hui, c'est d'abord une grande pièce de vie.
       Cuisine ouverte : c'est UNE seule pièce — séjour, salle à manger et
       cuisine d'un seul tenant, ouverte sur la terrasse. Cuisine fermée :
       deux pièces voisines, avec le cellier derrière la cuisine. */
    add('entree', {niveau: 0});
    if (c.cuisineOuverte) {
      add('sejour', {niveau: 0, nom: 'Séjour · cuisine ouverte', ouverte: true, part: .36, max: 95});
    } else {
      add('sejour', {niveau: 0, nom: 'Séjour'});
      add('cuisine', {niveau: 0, nom: 'Cuisine'});
    }
    if (c.cellier) add('cellier', {niveau: 0});
    if (c.buanderie) add('buanderie', {niveau: 0});
    if (c.bureau) add('bureau', {niveau: 0});
    if (n2) add('escalier', {niveau: 0, nom: 'Escalier'});

    /* Le hall : la pièce qui dessert tout. Au rez, toujours — c'est lui
       qui mène au séjour, aux chambres et à l'escalier. */
    add('degagement', {niveau: 0, nom: n2 ? 'Hall' : 'Dégagement'});

    /* --- la nuit --- */
    const nivNuit = n2 ? 1 : 0;
    if (n2) {
      add('escalier', {niveau: 1, nom: 'Escalier'});
      add('degagement', {niveau: 1, nom: 'Palier · dégagement'});
    }

    /* La suite parentale peut rester au rez : c'est un choix courant
       (plain-pied pour les parents, étage pour les enfants). Elle
       emmène avec elle sa salle d'eau et son dressing. */
    const nivSuite = (n2 && c.parentaleRdc) ? 0 : nivNuit;
    const nbCh = Math.max(0, c.chambres);
    /* La suite parentale : chambre seule, avec salle d'eau, ou avec salle
       d'eau et dressing. Aucune surface minimale n'est exigée — on peut
       tout faire dans la vraie vie, le plan dira seulement si c'est serré. */
    const suite = c.suiteType || 'simple';
    const avecSuite = suite !== 'simple';
    let laSuite = null;
    for (let i = 0; i < nbCh; i++) {
      if (i === 0 && (nbCh > 1 || avecSuite)) laSuite = add('parentale', {niveau: nivSuite, nom: avecSuite ? 'Suite parentale' : 'Chambre parentale'});
      else add('chambre', {niveau: nivNuit, nom: 'Chambre ' + (nbCh > 1 ? i + 1 : '')});
    }
    /* La salle d'eau et le dressing de la suite lui appartiennent : ils se
       rangent derrière elle, et s'ouvrent dedans — pas dans la chambre
       d'à côté. */
    if (nbCh > 0 && avecSuite) add('salle_eau', {niveau: nivSuite, nom: "Salle d'eau parentale", pour: laSuite && laSuite.id});
    if (nbCh > 0 && suite === 'complete') add('dressing', {niveau: nivSuite, nom: 'Dressing parental', pour: laSuite && laSuite.id});
    if (c.dressing && !(nbCh > 0 && suite === 'complete')) add('dressing', {niveau: nivNuit});

    for (let i = 0; i < Math.max(1, c.sdb); i++) {
      add('sdb', {niveau: nivNuit, nom: c.sdb > 1 ? 'Salle de bain ' + (i + 1) : 'Salle de bain'});
    }
    if (c.wcSepare) {
      add('wc', {niveau: 0, nom: n2 ? 'WC (rez)' : 'WC'});
      /* Un second WC ne se justifie qu'à l'étage : de plain-pied, un
         seul WC séparé suffit et laisse la place aux pièces de vie. */
      if (n2) add('wc', {niveau: 1, nom: 'WC (étage)'});
    }

    /* Noms : « Chambre 1 » plutôt que « Chambre  » quand il n'y en a qu'une. */
    P.forEach(p => { p.nom = p.nom.replace(/\s+$/, ''); });
    return P;
  }

  /* Répartit exactement `aire` m² entre les pièces d'un niveau.
     On part des fourchettes du catalogue, puis on donne (ou on
     reprend) le reste aux pièces élastiques : séjour, chambres… */
  /* Les fourchettes du catalogue, qu'une pièce peut élargir pour elle-même
     (un séjour avec cuisine ouverte vise plus grand qu'un séjour seul). */
  const catDe = p => {
    const d = CAT[p.type];
    if (p.part === undefined && p.max === undefined && p.min === undefined) return d;
    return Object.assign({}, d, {part: p.part === undefined ? d.part : p.part,
      max: p.max === undefined ? d.max : p.max, min: p.min === undefined ? d.min : p.min});
  };

  function equilibrer(pieces, aire, S) {
    if (!pieces.length) return {serre: false};
    pieces.forEach(p => {
      const d = catDe(p);
      if (p.verrou) return;                       // surface imposée par l'utilisateur
      p.cible = d.fixe ? d.fixe : clamp(d.part * S, d.min, d.max);
    });
    let total = somme(pieces, p => p.cible);
    let reste = aire - total;

    if (reste > 0) {
      /* On étire d'abord les pièces élastiques jusqu'à leur maximum… */
      for (let tour = 0; tour < 3 && reste > .01; tour++) {
        const el = pieces.filter(p => !p.verrou && CAT[p.type].elast && p.cible < catDe(p).max * (1 + tour * .35));
        if (!el.length) break;
        const poids = somme(el, p => p.cible) || el.length;
        el.forEach(p => {
          const plafond = catDe(p).max * (1 + tour * .35);
          const gain = Math.min(reste * (p.cible / poids), Math.max(0, plafond - p.cible));
          p.cible += gain;
        });
        total = somme(pieces, p => p.cible);
        reste = aire - total;
      }
      /* …puis, s'il reste des mètres, ils vont à la plus grande. */
      if (reste > .01) {
        const g = pieces.filter(p => !p.verrou).sort((a, b) => b.cible - a.cible)[0] || pieces[0];
        g.cible += reste;
      }
    } else if (reste < -.01) {
      /* Trop de programme pour la surface : on resserre les élastiques
         jusqu'à leur minimum, et on prévient si ça ne suffit pas. */
      let manque = -reste;
      const el = pieces.filter(p => !p.verrou && CAT[p.type].elast);
      const marge = somme(el, p => p.cible - catDe(p).min);
      if (marge > 0) {
        const k = Math.min(1, manque / marge);
        el.forEach(p => { p.cible -= (p.cible - catDe(p).min) * k; });
        manque -= Math.min(manque, marge);
      }
      if (manque > .01) {
        const k = aire / somme(pieces, p => p.cible);
        pieces.forEach(p => { p.cible *= k; });
        return {serre: true, manque: manque};
      }
    }
    return {serre: false};
  }

  /* ============================================================
     2 & 3. L'ENVELOPPE ET LA DISTRIBUTION
     ============================================================ */

  /* Une rangée de pièces le long de la bande.
     Les pièces trop étroites sont regroupées en colonne (une salle
     de bain au-dessus d'un dressing, par exemple) : c'est ce que
     ferait un architecte plutôt que de dessiner un couloir de 1,2 m
     de large sur 4 m de long. */
  function rangee(rect, items, horizontal, front) {
    if (!items.length) return [];
    const D = horizontal ? rect.h : rect.w;     // profondeur de la rangée
    const L = horizontal ? rect.w : rect.h;     // longueur disponible
    if (D <= .2 || L <= .2) return items.map(p => ({piece: p, x: rect.x, y: rect.y, w: .1, h: .1}));

    const k = (L * D) / Math.max(.01, somme(items, p => p.cible));
    const large = g => somme(g, p => p.cible) * k / D;
    const coteMax = g => Math.max.apply(null, g.map(p => CAT[p.type].cote));

    /* Regroupement en colonnes : une pièce trop étroite se met en
       colonne avec sa voisine — la suivante, ou, si elle est la
       dernière de la rangée, la précédente. */
    /* L'escalier ne se met jamais en colonne : il traverse la bande de
       part en part, sinon il ne tomberait pas au même endroit d'un
       niveau à l'autre. */
    const seul = p => p.type === 'escalier';
    /* On n'empile que si chaque pièce garde, dans la profondeur, au
       moins son plus petit côté : sinon on écraserait un WC à 16 cm. */
    const tient = g => somme(g, p => CAT[p.type].cote) <= D;
    /* On n'empile que ce qui peut s'ouvrir dans la pièce de devant : une
       salle d'eau derrière une chambre, un dressing derrière une suite.
       Deux chambres l'une derrière l'autre, jamais — la seconde n'aurait
       pas de porte sur le couloir. */
    const aQui = (a, b) => (!a.pour || a.pour === b.id) && (!b.pour || b.pour === a.id);
    /* Une colonne reste une colonne : au-delà de 5,50 m de large, ce n'est
       plus une pièce derrière une autre, c'est une bande qui barre tout le
       plan — un cellier de dix mètres de long derrière le séjour. */
    const colonneOk = g => large(g) <= 5.5;
    const empilable = (g, p) => colonneOk(g.concat([p])) &&
      g.some(o => aQui(p, o) && (bonHoteType(p.type, o.type) || bonHoteType(o.type, p.type)));
    const grp = [];
    let i = 0;
    while (i < items.length) {
      const g = [items[i]];
      let j = i + 1;
      if (!seul(items[i])) {
        while (j < items.length && !seul(items[j]) && g.length < 3 && large(g) < coteMax(g) &&
               empilable(g, items[j]) && tient(g.concat([items[j]]))) { g.push(items[j]); j++; }
      }
      grp.push(g);
      i = j;
    }
    while (grp.length > 1 && large(grp[grp.length - 1]) < coteMax(grp[grp.length - 1]) &&
           grp[grp.length - 1].length + grp[grp.length - 2].length <= 3 &&
           tient(grp[grp.length - 2].concat(grp[grp.length - 1])) &&
           grp[grp.length - 1].every(p => empilable(grp[grp.length - 2], p)) &&
           !grp[grp.length - 1].some(seul) && !grp[grp.length - 2].some(seul)) {
      const der = grp.pop();
      grp[grp.length - 1] = grp[grp.length - 1].concat(der);
    }

    /* Dans une colonne, une seule pièce touche la circulation : on met
       au fond celle qui peut s'ouvrir dans l'autre (salle d'eau,
       dressing, WC), à défaut la plus petite. */
    grp.forEach(g => {
      if (g.length < 2) return;
      g.sort((a, b) => {
        const ha = g.some(o => o !== a && bonHoteType(a.type, o.type)) ? 1 : 0;
        const hb = g.some(o => o !== b && bonHoteType(b.type, o.type)) ? 1 : 0;
        if (ha !== hb) return ha - hb;
        return b.cible - a.cible;
      });
      if (front === 'fin') g.reverse();
    });

    const out = [];
    let curseur = 0;
    /* Les largeurs : chacune au prorata de sa surface, mais jamais sous le
       plus petit côté acceptable de la pièce — un WC de 32 cm de large
       n'existe pas, même quand le couloir est gourmand. */
    const largeurs = repartir(grp.map(g => somme(g, p => p.cible)), grp.map(g => coteMax(g)), L);
    grp.forEach((g, idx) => {
      let larg = largeurs[idx];
      if (idx === grp.length - 1) larg = L - curseur;          // on ferme pile au bord
      const profs = repartir(g.map(p => p.cible), g.map(p => CAT[p.type].cote), D);
      let sous = 0;
      g.forEach((p, k2) => {
        const prof = k2 === g.length - 1 ? D - sous : profs[k2];
        out.push(horizontal
          ? {piece: p, x: rect.x + curseur, y: rect.y + sous, w: larg, h: prof}
          : {piece: p, x: rect.x + sous, y: rect.y + curseur, w: prof, h: larg});
        sous += prof;
      });
      curseur += larg;
    });
    return out;
  }

  /* Répartit D entre plusieurs pièces au prorata, en donnant d'abord à
     chacune son plus petit côté acceptable quand la place le permet. */
  function repartir(aires, cotes, D) {
    const n = aires.length;
    if (n === 1) return [D];
    const mini = somme(cotes, c => c);
    const tot = somme(aires, a => a) || 1;
    if (mini >= D) return aires.map(a => (a / tot) * D);
    const libre = D - mini;
    return aires.map((a, i) => cotes[i] + (a / tot) * libre);
  }

  /* Agence un niveau entier.
     cfg = {axe:'h'|'v', bord:'debut'|'fin', inverseJour, inverseNuit,
            ordreBande:0|1|2, ratio}                                  */
  function agencerNiveau(pieces, W, H, cfg, impose) {
    const escalierImpose = impose && impose.esc;
    const tri = (t) => t.slice().sort((a, b) => cle(a, cfg) - cle(b, cfg));
    /* Une salle de bain peut se ranger dans la bande de service, avec
       le WC : c'est fréquent, et ça libère la rangée des chambres d'une
       pièce trop étroite. Le moteur essaie les deux. */
    const versBande = p => grp(p) === 'bande';
    const bande = pieces.filter(versBande).sort((a, b) => cle(a, cfg, 'bande') - cle(b, cfg, 'bande'));
    const jour = tri(pieces.filter(p => grp(p) === 'jour'));
    const nuit = tri(pieces.filter(p => grp(p) === 'nuit' && !versBande(p)));
    if (cfg.inverseJour) jour.reverse();
    if (cfg.inverseNuit) nuit.reverse();

    const horiz = cfg.axe === 'h';                 // bande horizontale
    const L = horiz ? W : H;                        // longueur de la bande
    const P = horiz ? H : W;                        // profondeur totale du niveau

    /* Plafond de profondeur de la bande : 2,95 m tant qu'elle ne
       contient que de la circulation et du service ; davantage si
       l'utilisateur y a glissé une vraie pièce. */
    const plafond = bande.some(p => !CAT[p.type].bande && p.type !== 'sdb') ? P * .5 : 2.95;
    let aireBande = somme(bande, p => p.cible);
    let d = clamp(aireBande / L, 1.15, plafond);
    /* Bande trop chargée : le cellier ou la buanderie passent en zone. */
    while (aireBande / L > plafond && bande.length > 1) {
      const idx = bande.findIndex(p => p.type === 'cellier' || p.type === 'buanderie');
      if (idx < 0) break;
      const dehors = bande.splice(idx, 1)[0];
      (jour.length ? jour : nuit).push(dehors);
      aireBande = somme(bande, p => p.cible);
      d = clamp(aireBande / L, 1.15, plafond);
    }
    d = Math.min(d, P * (plafond > 3 ? .5 : .42));
    /* Un étage se superpose au rez : même profondeur de bande, donc
       même place pour l'escalier d'un niveau à l'autre. */
    if (impose && impose.d) d = impose.d;
    /* Toutes les pièces de la bande ont été glissées ailleurs : plus de
       bande du tout, plutôt qu'une bande vide qui ferait un trou. */
    if (!bande.length) d = 0;
    /* La bande imposée par le niveau du dessous ne laisse pas la place
       aux pièces de celui-ci : on la libère, et on le signale. */
    if (impose && impose.d && (jour.length + nuit.length) && P - d < 2.4) {
      const r = agencerNiveau(pieces, W, H, cfg, null);
      r.decale = true;
      return r;
    }
    const resteProf = P - d;
    const aJ = somme(jour, p => p.cible), aN = somme(nuit, p => p.cible);
    let pJ = 0, pN = 0;
    if (jour.length && nuit.length) {
      pJ = resteProf * (aJ / (aJ + aN));
      pN = resteProf - pJ;
    } else if (jour.length) { pJ = resteProf; } else { pN = resteProf; }

    /* Les rangées de pièces, de part et d'autre de la bande. Chacune :
       {off, prof, items, front} — `front` dit de quel côté est la bande,
       donc les portes. */
    let offBande;
    const rangs = [];
    const deuxZones = jour.length && nuit.length;
    const tout = jour.concat(nuit);

    if (impose && impose.off !== undefined) {
      /* La bande est imposée par le niveau du dessous : les pièces se
         rangent dans ce qui reste, d'un côté, de l'autre, ou des deux. */
      offBande = clamp(impose.off, 0, Math.max(0, resteProf));
      const A = offBande, B = resteProf - offBande;
      if (A > .8 && B > .8) {
        if (deuxZones) {
          rangs.push({off: 0, prof: A, items: jour, front: 'fin'});
          rangs.push({off: A + d, prof: B, items: nuit, front: 'debut'});
        } else {
          /* Une seule zone mais une bande au milieu : la zone se partage
             des deux côtés, au prorata des profondeurs disponibles. */
          const cible = somme(tout, p => p.cible) * A / (A + B);
          const avant = [], apres = [];
          let acc = 0;
          tout.forEach(p => {
            if (acc + p.cible / 2 <= cible) { avant.push(p); acc += p.cible; } else apres.push(p);
          });
          if (!avant.length && apres.length > 1) avant.push(apres.shift());
          if (!apres.length && avant.length > 1) apres.push(avant.pop());
          if (!avant.length || !apres.length) {
            /* Une seule pièce pour deux côtés : impossible sans laisser un
               trou. On renonce à superposer la bande — la note le comptera. */
            const r = agencerNiveau(pieces, W, H, cfg, {d: impose.d});
            r.decale = true;
            return r;
          }
          rangs.push({off: 0, prof: A, items: avant, front: 'fin'});
          rangs.push({off: A + d, prof: B, items: apres, front: 'debut'});
        }
      } else if (B <= .02) {
        rangs.push({off: 0, prof: resteProf, items: tout, front: 'fin'});
      } else if (A <= .02) {
        rangs.push({off: d, prof: resteProf, items: tout, front: 'debut'});
      } else {
        /* Il resterait une lamelle de moins de 80 cm d'un côté de la
           bande : trop mince pour une pièce, trop large pour l'ignorer.
           On libère la bande, et on le signale. */
        const r = agencerNiveau(pieces, W, H, cfg, {d: impose.d});
        r.decale = true;
        return r;
      }
    } else if (deuxZones) {
      /* Une zone qui loge des pièces de vie ne descend pas sous 3,10 m
         de profondeur : en deçà, ce n'est plus une pièce, c'est un
         couloir meublé. Ce qu'on lui rend, l'autre zone le cède. */
      const plancher = Math.min(3.1, resteProf * .35);
      if (pN < plancher) { pN = plancher; pJ = resteProf - pN; }
      else if (pJ < plancher) { pJ = plancher; pN = resteProf - pJ; }
      offBande = pJ;
      rangs.push({off: 0, prof: pJ, items: jour, front: 'fin'});
      rangs.push({off: pJ + d, prof: pN, items: nuit, front: 'debut'});
    } else if (cfg.bandeCentre && tout.length > 2 && resteProf > 6.2) {
      /* Le couloir au milieu, les pièces de part et d'autre : c'est
         l'étage d'une maison d'aujourd'hui — quatre chambres autour du
         palier plutôt qu'en enfilade. */
      const moitie = somme(tout, p => p.cible) / 2;
      const avant = [], apres = [];
      let acc = 0;
      tout.forEach(p => {
        if (acc + p.cible / 2 <= moitie || !apres.length && avant.length === 0) { avant.push(p); acc += p.cible; }
        else apres.push(p);
      });
      if (!apres.length && avant.length > 1) apres.push(avant.pop());
      const A = resteProf * (somme(avant, p => p.cible) / Math.max(.01, somme(tout, p => p.cible)));
      const plancher = Math.min(3.1, resteProf * .35);
      offBande = clamp(A, plancher, resteProf - plancher);
      rangs.push({off: 0, prof: offBande, items: avant, front: 'fin'});
      rangs.push({off: offBande + d, prof: resteProf - offBande, items: apres, front: 'debut'});
    } else if (cfg.bord === 'debut') {
      offBande = 0;
      rangs.push({off: d, prof: resteProf, items: tout, front: 'debut'});
    } else {
      offBande = resteProf;
      rangs.push({off: 0, prof: resteProf, items: tout, front: 'fin'});
    }

    /* Un niveau sans aucune pièce de vie (un palier seul, par exemple) :
       la bande occupe tout le niveau plutôt que de laisser du vide. */
    if (!tout.length) { offBande = 0; d = P; }

    const rect = (off, prof) => horiz
      ? {x: 0, y: off, w: W, h: prof}
      : {x: off, y: 0, w: prof, h: H};

    const cases = [];
    rangs.forEach(r => {
      if (r.items.length) cases.push.apply(cases, rangee(rect(r.off, r.prof), r.items, horiz, r.front));
    });

    /* La bande : mêmes règles, mais l'escalier peut être imposé par
       le niveau du dessous pour que les deux se superposent. */
    const rB = rect(offBande, d);
    /* Le hall prend tout ce que l'entrée, l'escalier et le WC ne prennent
       pas : c'est lui qui court le long des chambres, pour que chacune ait
       sa porte dessus plutôt que de s'ouvrir dans la chambre d'à côté. */
    const hall = bande.find(p => p.type === 'degagement' && !p.verrou && !p.manuel);
    const cibleHall = hall ? hall.cible : 0;
    if (hall && d > 0) {
      const autres = somme(bande.filter(p => p !== hall), p => p.cible);
      hall.cible = Math.max(hall.cible, d * L - autres);
    }
    let casesB;
    if (escalierImpose && bande.some(p => p.type === 'escalier')) {
      casesB = bandeAvecEscalier(rB, bande, horiz, escalierImpose);
    } else {
      casesB = rangee(rB, bande, horiz);
    }
    if (hall) hall.cible = cibleHall;         // la cible du programme reste intacte
    const decale = !!casesB.decale;
    cases.push.apply(cases, casesB);

    return {W: W, H: H, cases: cases, bandeRect: rB, horiz: horiz, decale: decale};
  }

  /* Place l'escalier exactement là où il est au niveau du dessous, puis
     répartit les autres pièces de la bande dans les deux morceaux qui
     restent — de part et d'autre. Le niveau doit être couvert entièrement :
     s'il n'y a pas assez de pièces pour remplir les deux morceaux, on
     renonce à superposer l'escalier plutôt que de laisser un trou. */
  function bandeAvecEscalier(rB, bande, horiz, esc) {
    const L = horiz ? rB.w : rB.h;
    const base = horiz ? rB.x : rB.y;
    let debut = clamp((horiz ? esc.x : esc.y) - base, 0, L);
    let lon = Math.min(horiz ? esc.w : esc.h, L - debut);
    let libreAvant = debut, libreApres = L - debut - lon;
    /* Un bout de bande trop court pour une pièce (moins de 60 cm) :
       l'escalier le prend, comme un palier. Il reste superposé à celui
       du dessous sur toute sa volée. */
    if (libreAvant <= .6) { lon += libreAvant; debut = 0; libreAvant = 0; }
    if (libreApres <= .6) { lon += libreApres; libreApres = 0; }

    const iEsc = bande.findIndex(p => p.type === 'escalier');
    const autres = bande.filter(p => p.type !== 'escalier');
    const aTot = somme(autres, p => p.cible) || 1;
    const partAvant = libreAvant / Math.max(.01, libreAvant + libreApres);

    const avant = [], apres = [];
    let acc = 0;
    autres.forEach(p => {
      if (libreAvant > .6 && acc + p.cible / 2 <= aTot * partAvant) { avant.push(p); acc += p.cible; }
      else apres.push(p);
    });
    if (!avant.length && libreAvant > .6 && apres.length > 1) avant.push(apres.shift());
    if (!apres.length && libreApres > .6 && avant.length > 1) apres.push(avant.pop());

    /* Le palier contourne l'escalier : s'il y a du monde des deux côtés,
       la circulation passe des deux côtés aussi. Sinon un WC se
       retrouverait seul contre l'escalier, sans porte sur le couloir.
       Une même pièce peut tenir en deux morceaux — c'est ce que fait un
       palier qui enveloppe sa trémie. */
    const estCircP = p => p.type === 'degagement' || p.type === 'entree';
    if (avant.length && apres.length && libreAvant > .6 && libreApres > .6) {
      const circA = avant.some(estCircP), circB = apres.some(estCircP);
      if (circA !== circB) {
        const hall = (circA ? avant : apres).filter(estCircP).sort((a, b) => b.cible - a.cible)[0];
        if (hall) {
          if (circA) apres.unshift(hall); else avant.push(hall);
        }
      }
    }

    /* Un morceau resterait vide : on préfère un plan plein à un escalier
       aligné. Le défaut est compté dans la note, donc évité si possible. */
    /* Un morceau de bande bien trop court pour ce qu'on veut y ranger
       écraserait les pièces : mieux vaut libérer l'escalier. */
    const prof = horiz ? rB.h : rB.w;
    const trop = (items, lg) => items.length && somme(items, p => p.cible) > lg * prof * 2.5;
    if ((libreAvant > .6 && !avant.length) || (libreApres > .6 && !apres.length) ||
        (autres.length && !libreAvant && !libreApres) ||
        trop(avant, libreAvant) || trop(apres, libreApres)) {
      const out = rangee(rB, bande, horiz);
      out.decale = true;
      return out;
    }

    const out = [];
    const placer = (items, dep, lg) => {
      if (!items.length || lg <= .05) return;
      const r = horiz ? {x: dep, y: rB.y, w: lg, h: rB.h} : {x: rB.x, y: dep, w: rB.w, h: lg};
      out.push.apply(out, rangee(r, items, horiz));
    };
    placer(avant, base, libreAvant);
    placer(apres, base + debut + lon, libreApres);
    /* Même place, mais pas la même profondeur de bande qu'en dessous :
       l'escalier ne se superpose qu'à moitié. On le signale. */
    if (Math.abs((horiz ? esc.h : esc.w) - (horiz ? rB.h : rB.w)) > .05) out.decale = true;
    out.push(horiz
      ? {piece: bande[iEsc], x: base + debut, y: rB.y, w: lon, h: rB.h}
      : {piece: bande[iEsc], x: rB.x, y: base + debut, w: rB.w, h: lon});
    return out;
  }

  /* ---------- Où se range une pièce, et dans quel ordre ----------
     `grp` dit de quel côté elle tombe (bande de distribution, zone
     jour, zone nuit) et `ordre` à quelle place dans la rangée.
     Les deux se laissent échanger : c'est ce qui permet de déplacer
     une pièce à la main sans jamais casser le plan.              */
  function grp(p) {
    if (p.grp) return p.grp;
    /* Le cellier et la buanderie se rangent derrière la cuisine, dans la
       zone de jour : on ne traverse pas un cellier pour aller au salon. */
    if (p.type === 'cellier' || p.type === 'buanderie') return 'jour';
    const z = CAT[p.type].zone;
    return CAT[p.type].bande ? 'bande' : (z === 'jour' ? 'jour' : 'nuit');
  }

  /* Ordre de lecture par défaut : la cuisine près de l'entrée, le
     séjour au fond (il ouvre sur la terrasse) ; côté nuit, la
     parentale le plus loin possible de l'entrée. Côté bande,
     l'entrée reste à une extrémité : c'est elle qui touche la façade. */
  /* Côté jour : le service d'abord (cellier, buanderie), puis la cuisine,
     puis le séjour au fond — celui qui ouvre sur la terrasse. */
  const ORDRE_JOUR = {wc: .4, cellier: .6, buanderie: .8, cuisine: 1, salle_manger: 2, sejour: 3, bureau: 4};
  const ORDRE_NUIT = {sdb: 1, chambre: 2, dressing: 3, salle_eau: 4, parentale: 5, suite: 5};
  /* Dans la bande, la circulation reste d'un seul tenant : l'entrée contre
     la façade, le hall à sa suite, et le service (cellier, buanderie, WC)
     rejeté à l'autre bout. On ne traverse jamais un cellier pour aller au
     salon. Trois variantes, qui déplacent le service et l'escalier. */
  /* L'escalier et le WC se tiennent près de l'entrée ; le hall file ensuite
     le long des chambres, pour que chacune ait sa porte dessus. */
  const ORDRE_BANDE = [
    {entree: 0, escalier: 1, wc: 2, sdb: 2.5, degagement: 3, cellier: 4, buanderie: 5},
    {wc: 0, sdb: .5, escalier: 1, entree: 2, degagement: 3, cellier: 4, buanderie: 5},
    {entree: 0, wc: 1, sdb: 1.5, escalier: 2, degagement: 3, cellier: 4, buanderie: 5}
  ];

  /* La clé de tri d'une pièce : celle qu'elle s'est vu attribuer à la
     main si elle a été déplacée, sinon celle du catalogue. */
  function cle(p, cfg, groupe) {
    if (p.manuel && typeof p.ordre === 'number') return p.ordre;
    const g = groupe || grp(p);
    if (g === 'bande') return (ORDRE_BANDE[(cfg.ordreBande || 0) % 3][p.type] !== undefined
      ? ORDRE_BANDE[(cfg.ordreBande || 0) % 3][p.type] : 3) * 10;
    if (g === 'jour') return (ORDRE_JOUR[p.type] || 3) * 10;
    return (ORDRE_NUIT[p.type] || 2) * 10;
  }

  /* Glisse la pièce `a` juste avant (ou juste après) la pièce `b` :
     elle prend son groupe, son niveau, et se range à côté d'elle.
     Le plan est recalculé derrière — il reste toujours d'un seul
     tenant, sans trou ni chevauchement. */
  function inserer(a, b, avant, cfg, toutes) {
    if (a === b) return;
    const g = grp(b), niv = b.niveau;
    const memes = toutes.filter(p => p !== a && p.niveau === niv && grp(p) === g)
      .sort((x, y) => cle(x, cfg) - cle(y, cfg));
    const i = memes.indexOf(b);
    const kb = cle(b, cfg);
    let k;
    if (avant) {
      const prec = i > 0 ? cle(memes[i - 1], cfg) : kb - 20;
      k = (prec + kb) / 2;
    } else {
      const suiv = i >= 0 && i < memes.length - 1 ? cle(memes[i + 1], cfg) : kb + 20;
      k = (kb + suiv) / 2;
    }
    a.grp = g;
    a.niveau = niv;
    a.ordre = k;
    a.manuel = true;
  }

  /* Envoie une pièce dans un groupe donné (bande, jour, nuit) d'un
     niveau, en dernière position. */
  function ranger(a, groupe, niveau, cfg, toutes) {
    const memes = toutes.filter(p => p !== a && p.niveau === niveau && grp(p) === groupe);
    const max = memes.length ? Math.max.apply(null, memes.map(p => cle(p, cfg))) : 0;
    a.grp = groupe;
    a.niveau = niveau;
    a.ordre = max + 10;
    a.manuel = true;
  }

  /* ============================================================
     4. LES OUVERTURES
     ============================================================ */
  const EPS = .04;

  /* Mur commun à deux pièces : renvoie {axe, pos, a, b} ou null. */
  function mitoyen(A, B) {
    if (Math.abs(A.x + A.w - B.x) < EPS || Math.abs(B.x + B.w - A.x) < EPS) {
      const a = Math.max(A.y, B.y), b = Math.min(A.y + A.h, B.y + B.h);
      if (b - a > .55) return {axe: 'v', pos: Math.abs(A.x + A.w - B.x) < EPS ? A.x + A.w : A.x, a: a, b: b};
    }
    if (Math.abs(A.y + A.h - B.y) < EPS || Math.abs(B.y + B.h - A.y) < EPS) {
      const a = Math.max(A.x, B.x), b = Math.min(A.x + A.w, B.x + B.w);
      if (b - a > .55) return {axe: 'h', pos: Math.abs(A.y + A.h - B.y) < EPS ? A.y + A.h : A.y, a: a, b: b};
    }
    return null;
  }

  const estCirc = c => CAT[c.piece.type].zone === 'circ';
  /* La circulation qui dessert : l'entrée et le hall. L'escalier, lui, est
     un objet qu'on traverse, pas une pièce sur laquelle on ouvre des portes. */
  const desserteVraie = c => c.piece.type === 'entree' || c.piece.type === 'degagement';

  /* Certaines pièces n'ont rien à faire sur un couloir : une salle d'eau
     parentale s'ouvre dans la chambre, un cellier dans la cuisine. On
     appelle ça leur hôte — une porte sur l'hôte est un bon plan, pas un
     défaut. Tout le reste doit donner sur la circulation. */
  const HOTE = {
    salle_eau: ['parentale', 'suite', 'chambre'],
    dressing: ['parentale', 'suite', 'chambre'],
    cellier: ['cuisine', 'sejour'],
    buanderie: ['cuisine', 'sejour', 'cellier']
  };
  const bonHoteType = (t, o) => !!(HOTE[t] && HOTE[t].indexOf(o) >= 0);
  /* Une cuisine ouverte donne sur le séjour : c'est le principe même. */
  const bonHote = (c, o) => bonHoteType(c.piece.type, o.piece.type) ||
    (c.piece.type === 'cuisine' && c.piece.ouverte && o.piece.type === 'sejour');

  /* De quel côté d'une pièce se trouve un mur : N, S, O ou E.
     C'est ce qui donne à chaque ouverture un nom stable — « la porte
     nord de la chambre 2 » — pour qu'un réglage fait à la main
     (position, sens d'ouverture, largeur) survive au recalcul du plan. */
  function cote(c, axe, pos) {
    if (axe === 'h') return Math.abs(pos - c.y) < EPS ? 'N' : 'S';
    return Math.abs(pos - c.x) < EPS ? 'O' : 'E';
  }

  /* Pose une ouverture sur son mur d'après sa position relative t
     (0 = tout contre le début du mur, 1 = tout contre la fin). */
  function poser(o) {
    const marge = .16;
    const a = o.a + marge + o.l / 2, b = o.b - marge - o.l / 2;
    o.c = b > a ? a + (b - a) * clamp(o.t, 0, 1) : (o.a + o.b) / 2;
    o.libre = Math.max(0, b - a);
    return o;
  }

  function ouvertures(niv, ouv) {
    const cases = niv.cases, W = niv.W, H = niv.H;
    const portes = [], fenetres = [];
    const larg = t => t === 'wc' ? .73 : (t === 'cellier' || t === 'buanderie' || t === 'dressing') ? .73 : .83;
    /* Les retouches faites à la main, rangées par nom d'ouverture. */
    const reg = ouv || {};
    const retouche = (o) => {
      const r = reg[o.cle];
      if (!r) return o;
      if (r.supprimee) { o.supprimee = true; return o; }
      if (typeof r.t === 'number') o.t = r.t;
      if (typeof r.l === 'number') o.l = clamp(r.l, .6, Math.max(.6, o.b - o.a - .3));
      if (typeof r.sens === 'number') o.sens = r.sens;
      if (typeof r.charn === 'number') o.charn = r.charn;
      o.manuel = true;
      return o;
    };

    cases.forEach(c => {
      if (estCirc(c)) return;
      /* On cherche d'abord la circulation, sinon la plus grande pièce
         voisine : une chambre desservie par le séjour reste un plan
         valide, le diagnostic le signalera. */
      let best = null;
      cases.forEach(o => {
        if (o === c) return;
        const m = mitoyen(c, o);
        if (!m) return;
        /* Ce qui dessert vraiment : le hall et l'entrée. L'escalier n'est
           pas un couloir — on n'ouvre une porte dedans qu'à défaut de tout
           le reste, et jamais pour une chambre ou une pièce de vie. */
        const bonus = (c.piece.pour && o.piece.id === c.piece.pour) ? 260
          : (c.piece.pour && bonHote(c, o)) ? 60
          : bonHote(c, o) ? 200
          : desserteVraie(o) ? 100
          : o.piece.type === 'escalier' ? (CAT[c.piece.type].zone === 'serv' ? 30 : 8)
          : (o.piece.type === 'sejour' ? 10 : 0);
        const note = bonus + (m.b - m.a);
        if (!best || note > best.note) best = {note: note, m: m, o: o};
      });
      if (!best) return;
      const m = best.m;
      /* Cuisine ouverte sur le séjour : pas une porte, un passage large. */
      const ouvert = (c.piece.type === 'cuisine' && c.piece.ouverte && best.o.piece.type === 'sejour');
      const co = cote(c, m.axe, m.pos);
      const o = retouche({
        cle: c.piece.id + ':P:' + co,
        axe: m.axe, pos: m.pos, a: m.a, b: m.b, t: .5,
        l: ouvert ? Math.min(2.4, m.b - m.a - .4) : larg(c.piece.type),
        type: ouvert ? 'passage' : 'porte',
        sens: m.axe === 'v' ? (c.x < m.pos ? 1 : -1) : (c.y < m.pos ? 1 : -1),
        charn: 0,
        direct: estCirc(best.o), de: c.piece.id, piece: c.piece.nom, cote: co, vers: best.o.piece.nom
      });
      if (!o.supprimee) portes.push(poser(o));
      c.dessertie = desserteVraie(best.o) ? 'circ'
        : bonHote(c, best.o) ? 'hote'
        : best.o.piece.type === 'escalier' ? 'escalier' : best.o.piece.nom;
      c.hote = best.o.piece.nom;
      c.hoteId = best.o.piece.id;
    });

    /* Fenêtres : chaque mur donnant dehors en reçoit une, sauf les
       tout petits pans et les pièces qui n'en réclament pas. */
    cases.forEach(c => {
      const t = c.piece.type;
      if (t === 'escalier') return;
      const murs = [];
      if (Math.abs(c.y) < EPS) murs.push({axe: 'h', pos: 0, a: c.x, b: c.x + c.w, n: -1});
      if (Math.abs(c.y + c.h - H) < EPS) murs.push({axe: 'h', pos: H, a: c.x, b: c.x + c.w, n: 1});
      if (Math.abs(c.x) < EPS) murs.push({axe: 'v', pos: 0, a: c.y, b: c.y + c.h, n: -1});
      if (Math.abs(c.x + c.w - W) < EPS) murs.push({axe: 'v', pos: W, a: c.y, b: c.y + c.h, n: 1});
      c.mursExt = murs;
      if (t === 'wc' || t === 'cellier' || t === 'dressing') return;
      murs.forEach(m => {
        const dispo = m.b - m.a;
        if (dispo < 1.15) return;
        const grand = (t === 'sejour' || t === 'salle_manger');
        let l = clamp(dispo * .5, 1.0, grand ? 3.2 : 1.7);
        if (grand && c.baieCote && m.axe === c.baieCote.axe && Math.abs(m.pos - c.baieCote.pos) < EPS) {
          l = clamp(dispo * .62, 1.6, 3.6);
        }
        const co = cote(c, m.axe, m.pos);
        const o = retouche({
          cle: c.piece.id + ':F:' + co,
          axe: m.axe, pos: m.pos, a: m.a, b: m.b, t: .5, l: l, n: m.n,
          type: (grand && l >= 2.2) ? 'baie' : 'fenetre',
          de: c.piece.id, piece: c.piece.nom, cote: co
        });
        if (!o.supprimee) fenetres.push(poser(o));
      });
    });

    /* La porte d'entrée : sur le plus long mur extérieur de l'entrée. */
    const e = cases.find(c => c.piece.type === 'entree');
    if (e && e.mursExt && e.mursExt.length) {
      const m = e.mursExt.slice().sort((x, y) => (y.b - y.a) - (x.b - x.a))[0];
      const co = cote(e, m.axe, m.pos);
      const o = retouche({
        cle: e.piece.id + ':E:' + co,
        axe: m.axe, pos: m.pos, a: m.a, b: m.b, t: .5,
        l: Math.min(1.0, (m.b - m.a) * .6), type: 'entree',
        sens: -m.n, charn: 0, direct: true, de: e.piece.id, piece: e.piece.nom, cote: co,
        vers: 'l\'extérieur'
      });
      if (!o.supprimee) portes.push(poser(o));
      niv.entreeMur = m;
    }
    niv.portes = portes;
    niv.fenetres = fenetres;
    return niv;
  }

  /* ============================================================
     LA NOTE D'UN AGENCEMENT — plus elle est basse, mieux c'est.
     ============================================================ */
  function noter(niv) {
    let n = 0;
    const W = niv.W, H = niv.H;
    n += Math.max(0, Math.max(W / H, H / W) - 1.75) * 14;
    if (niv.decale) n += 35;            // escalier non superposé au niveau du dessous
    niv.cases.forEach(c => {
      const d = CAT[c.piece.type];
      const petit = Math.min(c.w, c.h), grand = Math.max(c.w, c.h);
      /* Un couloir a le droit d'être long et étroit ; une pièce, non. */
      const circ = CAT[c.piece.type].zone === 'circ';
      n += Math.max(0, grand / petit - (circ ? 7 : 2.1)) * (circ ? 3 : 9);
      n += Math.max(0, d.cote - petit) * 55;                 // plus petit côté impossible
      if (CAT[c.piece.type].zone !== 'circ') {
        /* Une porte qui n'ouvre ni sur la circulation ni sur l'hôte
           naturel de la pièce : c'est le pire défaut d'un plan. */
        if (c.dessertie && c.dessertie !== 'circ' && c.dessertie !== 'hote') n += 42;
        if (c.dessertie === 'escalier') n += 16;              // on n'entre pas dans une pièce par l'escalier
        const habitable = ['sejour', 'cuisine', 'salle_manger', 'chambre', 'parentale', 'suite', 'bureau'];
        if (habitable.indexOf(c.piece.type) >= 0 && (!c.mursExt || !c.mursExt.some(m => m.b - m.a > 1.15))) {
          n += 26;                                            // pièce de vie aveugle
        }
      }
    });

    /* ---- Ce qui fait qu'un plan se tient, vu de l'habitant ---- */
    const par = t => niv.cases.filter(c => c.piece.type === t);
    const un = t => par(t)[0];
    const colle = (A, B) => !!(A && B && mitoyen(A, B));
    const colleUn = (A, liste) => liste.some(B => colle(A, B));
    const ent = un('entree'), hall = un('degagement'), sej = un('sejour'), cui = un('cuisine');

    /* L'entrée : elle doit toucher une façade (sinon pas de porte d'entrée),
       et donner sur le hall ou directement sur le séjour. */
    if (ent) {
      if (!ent.mursExt || !ent.mursExt.some(m => m.b - m.a > 1.0)) n += 70;
      if (!colle(ent, hall) && !colle(ent, sej)) n += 34;
      /* On n'entre pas chez soi par la buanderie ou le cellier. */
      ['cellier', 'buanderie'].forEach(t => par(t).forEach(s => { if (colle(ent, s)) n += 6; }));
    }
    /* Le hall dessert : il doit toucher le séjour et la partie nuit. */
    if (hall) {
      if (sej && !colle(hall, sej) && !colle(ent, sej)) n += 22;
      const nuit = niv.cases.filter(c => ['chambre', 'parentale', 'suite'].indexOf(c.piece.type) >= 0);
      if (nuit.length) {
        const servies = nuit.filter(ch => colle(ch, hall) || colle(ch, ent)).length;
        n += (nuit.length - servies) * 12;
      }
    }
    /* La cuisine fermée reste contre le séjour ; le cellier derrière elle. */
    if (cui) {
      if (sej && !colle(cui, sej)) n += 24;
      if (ent && colle(cui, ent) && !colle(cui, sej)) n += 6;
    }
    par('cellier').forEach(cel => { if (!colleUn(cel, [cui, sej].filter(Boolean))) n += 14; });
    par('buanderie').forEach(b => { if (!colleUn(b, [cui, sej, un('cellier')].filter(Boolean))) n += 8; });
    /* La suite parentale emmène sa salle d'eau et son dressing avec elle. */
    const par0 = un('parentale') || un('suite');
    if (par0) {
      niv.cases.forEach(c => {
        if (!c.piece.pour) return;
        if (!colle(c, par0)) n += 22;                         // séparée de la chambre dont elle dépend
        if (c.hoteId && c.hoteId !== c.piece.pour) n += 18;   // elle s'ouvre dans la mauvaise pièce
      });
    }
    /* Une chambre collée au séjour : on entend la télévision depuis le lit. */
    niv.cases.forEach(c => {
      if (['chambre', 'parentale', 'suite'].indexOf(c.piece.type) < 0) return;
      if (sej && colle(c, sej)) n += 7;
    });
    /* Le WC ne s'ouvre pas sur la pièce de vie. */
    par('wc').forEach(w => { if (sej && colle(w, sej) && w.dessertie && w.dessertie !== 'circ') n += 10; });
    /* Le séjour veut un grand pan de mur dehors — c'est là que passe la baie. */
    if (sej && sej.mursExt) {
      const meilleur = sej.mursExt.reduce((s, m) => Math.max(s, m.b - m.a), 0);
      n += Math.max(0, 3.6 - meilleur) * 5;
    }
    return n;
  }

  /* ============================================================
     LA GÉNÉRATION : on essaie, on note, on garde trois plans
     qui ne se ressemblent pas.
     ============================================================ */
  const RATIOS = [1.12, 1.28, 1.45, 1.62];

  function enveloppe(aire, r) {
    const W = Math.sqrt(aire * r);
    return {W: W, H: aire / W};
  }

  /* Agence tous les niveaux pour une configuration donnée. */
  function essai(pieces, aireNiveau, cfg, nbNiveaux, ouv) {
    const W0 = enveloppe(aireNiveau, cfg.ratio);
    const niveaux = [];
    let ref = null;
    for (let n = 0; n < nbNiveaux; n++) {
      const pn = pieces.filter(p => p.niveau === n);
      if (!pn.length) continue;
      const niv = agencerNiveau(pn, W0.W, W0.H, cfg, n > 0 ? ref : null);
      niv.niveau = n;
      ouvertures(niv, ouv);
      niv.score = noter(niv);
      if (n === 0) {
        const e = niv.cases.find(c => c.piece.type === 'escalier');
        const b = niv.bandeRect;
        ref = {
          esc: e ? {x: e.x, y: e.y, w: e.w, h: e.h} : null,
          d: niv.horiz ? b.h : b.w,
          off: niv.horiz ? b.y : b.x
        };
      }
      niveaux.push(niv);
    }
    /* Vérification finale, quelle que soit la façon dont on en est arrivé
       là (un escalier peut avoir été glissé hors de la bande à la main) :
       les deux escaliers se recouvrent-ils vraiment ? */
    if (niveaux.length > 1) {
      const e0 = niveaux[0].cases.find(c => c.piece.type === 'escalier');
      for (let i = 1; i < niveaux.length; i++) {
        const e1 = niveaux[i].cases.find(c => c.piece.type === 'escalier');
        if (!e0 || !e1) continue;
        const ox = Math.min(e0.x + e0.w, e1.x + e1.w) - Math.max(e0.x, e1.x);
        const oy = Math.min(e0.y + e0.h, e1.y + e1.h) - Math.max(e0.y, e1.y);
        if (ox < Math.min(e0.w, e1.w) * .8 || oy < Math.min(e0.h, e1.h) * .8) {
          if (!niveaux[i].decale) { niveaux[i].decale = true; niveaux[i].score += 35; }
        }
      }
    }
    return {cfg: cfg, niveaux: niveaux, score: somme(niveaux, n => n.score)};
  }

  function configurations() {
    const out = [];
    ['h', 'v'].forEach(axe => {
      RATIOS.forEach(ratio => {
        ['debut', 'fin'].forEach(bord => {
          [0, 1, 2].forEach(ordreBande => {
            /* bandeCentre : le couloir passe au milieu même quand il n'y a
               qu'une zone — des chambres de chaque côté, comme à l'étage
               d'une maison d'aujourd'hui. */
            [false, true].forEach(bandeCentre => {
              [false, true].forEach(inverseJour => {
                [false, true].forEach(inverseNuit => {
                  out.push({axe: axe, ratio: ratio, bord: bord, ordreBande: ordreBande,
                            bandeCentre: bandeCentre, inverseJour: inverseJour, inverseNuit: inverseNuit});
                });
              });
            });
          });
        });
      });
    });
    return out;
  }

  const FAMILLES = [
    {cle: 'A', nom: 'Distribution centrale', emoji: '🧭',
     note: "La circulation traverse le logement ; le jour d'un côté, la nuit de l'autre."},
    {cle: 'B', nom: 'Nuit en aile', emoji: '🧱',
     note: "La bande de distribution tourne d'un quart : les chambres forment une aile."},
    {cle: 'C', nom: 'Jour traversant', emoji: '🌤️',
     note: "Le séjour prend toute la longueur d'une façade, la cuisine passe de l'autre côté."}
  ];

  /* Trois variantes : la meilleure, la meilleure avec l'autre axe,
     et la meilleure avec un élancement franchement différent. */
  function variantes(pieces, aireNiveau, nbNiveaux, ouv) {
    const tous = configurations()
      .map(cfg => essai(pieces, aireNiveau, cfg, nbNiveaux, ouv))
      .sort((a, b) => a.score - b.score);
    if (!tous.length) return [];
    const choix = [tous[0]];
    const b = tous.find(t => t.cfg.axe !== choix[0].cfg.axe);
    if (b) choix.push(b);
    const c = tous.find(t => choix.indexOf(t) < 0 &&
      Math.abs(t.cfg.ratio - choix[0].cfg.ratio) > .15 &&
      (choix.length < 2 || t.cfg.axe !== choix[1].cfg.axe || Math.abs(t.cfg.ratio - choix[1].cfg.ratio) > .15));
    if (c) choix.push(c);
    while (choix.length < 3 && tous.length > choix.length) {
      const s = tous.find(t => choix.indexOf(t) < 0);
      if (!s) break;
      choix.push(s);
    }
    return choix.map((v, i) => Object.assign({}, v, FAMILLES[i] || FAMILLES[0]));
  }

  /* ============================================================
     LES EXTÉRIEURS : terrasse, jardin, garage.
     Ils ne comptent pas dans la surface habitable ; ils se posent
     contre l'enveloppe, une fois le plan arrêté.
     ============================================================ */
  function exterieurs(niv, c) {
    const ext = [];
    const W = niv.W, H = niv.H;

    if (c.terrasse > 0 && niv.niveau === 0) {
      const sej = niv.cases.find(x => x.piece.type === 'sejour') ||
                  niv.cases.find(x => x.piece.type === 'salle_manger');
      if (sej && sej.mursExt && sej.mursExt.length) {
        const m = sej.mursExt.slice().sort((x, y) => (y.b - y.a) - (x.b - x.a))[0];
        const lg = m.b - m.a;
        const prof = clamp(c.terrasse / lg, 1.6, 6);
        const r = m.axe === 'h'
          ? {x: m.a, y: m.n > 0 ? H : -prof, w: lg, h: prof}
          : {x: m.n > 0 ? W : -prof, y: m.a, w: prof, h: lg};
        ext.push(Object.assign({id: 'ext-terrasse', annexe: true, genre: 'terrasse', aire: c.terrasse,
          nom: c.type === 'appartement' ? 'Balcon · terrasse' : 'Terrasse', emoji: '⛱️'}, r));
        /* Le séjour ouvre par une baie de ce côté-là. */
        sej.baieCote = {axe: m.axe, pos: m.pos};
      }
    }

    if (c.garage && niv.niveau === 0) {
      const e = niv.cases.find(x => x.piece.type === 'entree');
      const m = e && e.mursExt && e.mursExt.length
        ? e.mursExt.slice().sort((x, y) => (y.b - y.a) - (x.b - x.a))[0]
        : {axe: 'v', pos: 0, a: 0, b: Math.min(H, 5.5), n: -1};
      const aire = c.garageDouble ? 32 : 17;
      const prof = c.garageDouble ? 5.6 : 5.4;
      const lg = aire / prof;
      const r = m.axe === 'v'
        ? {x: m.n > 0 ? W : -prof, y: clamp((m.a + m.b) / 2 - lg / 2, 0, Math.max(0, H - lg)), w: prof, h: lg}
        : {x: clamp((m.a + m.b) / 2 - lg / 2, 0, Math.max(0, W - lg)), y: m.n > 0 ? H : -prof, w: lg, h: prof};
      ext.push(Object.assign({id: 'ext-garage', annexe: true, genre: 'garage', aire: aire,
        nom: c.garageDouble ? 'Garage double' : 'Garage', emoji: '🚗'}, r));
    }

    /* Dehors, au fond du jardin : piscine, carport, abri — selon les
       critères détaillés de l'étape 2. On les range en ligne, loin de la
       façade d'entrée, sans toucher la maison ni la terrasse. */
    if (niv.niveau === 0 && c.type !== 'appartement') {
      const pris = ext.slice();
      const libre = r => pris.every(o => r.x >= o.x + o.w + .8 || r.x + r.w + .8 <= o.x || r.y >= o.y + o.h + .8 || r.y + r.h + .8 <= o.y) &&
                         (r.x >= W + .8 || r.x + r.w + .8 <= 0 || r.y >= H + .8 || r.y + r.h + .8 <= 0);
      /* Côté jardin : celui de la terrasse s'il y en a une, sinon le bas. */
      const t = ext.find(e => e.genre === 'terrasse');
      const cote = !t ? 's' : t.y >= H - .01 ? 's' : t.y + t.h <= .01 ? 'n' : t.x >= W - .01 ? 'e' : 'o';
      const poser = (r0) => {
        /* On cherche une place le long du côté choisi, puis des autres. */
        const cotes = [cote, 's', 'e', 'o', 'n'];
        for (let i = 0; i < cotes.length; i++) {
          const k = cotes[i];
          for (let d = 1.5; d < 14; d += .5) {
            for (let u = 0; u < 12; u += .5) {
              const r = {w: r0.w, h: r0.h};
              if (k === 's') { r.x = u; r.y = H + d + (t && cote === 's' ? t.h : 0); }
              if (k === 'n') { r.x = u; r.y = -d - r.h - (t && cote === 'n' ? t.h : 0); }
              if (k === 'e') { r.x = W + d + (t && cote === 'e' ? t.w : 0); r.y = u; }
              if (k === 'o') { r.x = -d - r.w - (t && cote === 'o' ? t.w : 0); r.y = u; }
              if (libre(r)) { pris.push(r); return r; }
            }
          }
        }
        return {x: 0, y: H + 3, w: r0.w, h: r0.h};
      };
      if (c.piscine) {
        const L = clamp(+c.piscineL || 8, 2, 25), l = clamp(+c.piscineW || 4, 1.5, 15);
        const rond = c.piscineForme === 'ronde' || c.piscineForme === 'carre';
        const pl = c.piscinePose === 'horssol' ? 0 : c.piscinePose === 'semi' ? .18 : .4;   // la margelle autour de l'eau
        const r = poser({w: (rond ? Math.max(L, l) : L) + 2 * pl, h: (rond ? Math.max(L, l) : l) + 2 * pl});
        ext.push(Object.assign({id: 'ext-piscine', annexe: true, genre: 'piscine', emoji: '🏊',
          nom: 'Piscine', forme: c.piscineForme || 'rect', pose: c.piscinePose || 'creusee', aire: r.w * r.h}, r));
      }
      if (c.carport) {
        const r = poser({w: 3, h: 5.2});
        ext.push(Object.assign({id: 'ext-carport', annexe: true, genre: 'carport', emoji: '🅿️', nom: 'Carport', aire: r.w * r.h}, r));
      }
      if (c.abri) {
        const r = poser({w: 2.5, h: 2});
        ext.push(Object.assign({id: 'ext-abri', annexe: true, genre: 'abri', emoji: '🛖', nom: 'Abri de jardin', aire: r.w * r.h}, r));
      }
    }

    if (c.jardin > 0 && niv.niveau === 0 && c.type !== 'appartement') {
      /* Marge telle que (W+2m)(H+2m) = jardin + emprise. */
      const A = c.jardin + W * H;
      const m = (-(W + H) + Math.sqrt((W + H) * (W + H) + 4 * (A - W * H))) / 4;
      /* Un grand terrain écraserait la maison sur la feuille : on borne
         la bande dessinée, et on dit franchement qu'elle est réduite. */
      const mv = clamp(m, 1.4, Math.min(5, Math.max(W, H) * .3));
      ext.unshift({genre: 'jardin', aire: c.jardin, nom: 'Jardin', emoji: '🌳',
        x: -mv, y: -mv, w: W + 2 * mv, h: H + 2 * mv, reduit: mv < m - .05});
    }
    niv.ext = ext;
    englober(ext);
    return ext;
  }

  /* Le jardin s'étend pour contenir tout ce qu'on a posé dehors. */
  function englober(ext) {
    const j = ext.find(e => e.genre === 'jardin');
    if (!j) return;
    ext.forEach(e => {
      if (e === j) return;
      const x0 = Math.min(j.x, e.x - .8), y0 = Math.min(j.y, e.y - .8);
      const x1 = Math.max(j.x + j.w, e.x + e.w + .8), y1 = Math.max(j.y + j.h, e.y + e.h + .8);
      j.x = x0; j.y = y0; j.w = x1 - x0; j.h = y1 - y0;
    });
  }

  /* ============================================================
     « MON PLAN » — LE PLAN FIGÉ
     ------------------------------------------------------------
     Les variantes sont des propositions : le moteur les recalcule
     de fond en comble à chaque critère. Dès qu'on retouche un plan
     à la main, on le fige : chaque pièce garde son rectangle, et
     une retouche ne change que ce qu'elle touche.

       · déplacer une pièce  → elle échange sa place avec celle où on
                               la dépose, rien d'autre ne bouge ;
       · tirer une cloison   → les deux pièces de part et d'autre
                               suivent, comme le bord d'une fenêtre ;
       · tirer une façade    → la maison s'agrandit, à tous les
                               niveaux à la fois (les étages
                               coïncident toujours) ;
       · ajouter une pièce   → elle est prise sur une pièce existante ;
       · retirer une pièce   → sa place revient à une voisine.

     Aucune dimension n'est interdite : une pièce peut être aussi
     étroite qu'on le veut, le plan le dira sans l'empêcher.
     ============================================================ */
  const MIN_COTE = .3;         // en deçà, ce n'est plus une pièce mais un trait
  const E_MUR = .04;           // deux murs à moins de 4 cm sont le même mur

  /* ---------- Les lignes de mur d'un niveau ----------
     Chaque bord de pièce est un morceau de mur. On les regroupe par
     ligne (même axe, même position) et on fusionne les morceaux qui se
     touchent : on obtient les murs tels qu'on les voit. */
  /* ---------- Les murs réels ----------
     Une pièce peut être faite de plusieurs rectangles (une pièce en L,
     deux pièces réunies en effaçant le mur qui les séparait). Entre deux
     rectangles d'une même pièce, il n'y a pas de mur : on retire ces
     morceaux-là. Ce qui reste, ce sont les murs qu'on voit. */
  const idDe = k => k.id || (k.piece && k.piece.id);
  function soustraire(iv, a, b) {
    const out = [];
    iv.forEach(i => {
      if (b <= i[0] + 1e-6 || a >= i[1] - 1e-6) { out.push(i); return; }
      if (a > i[0]) out.push([i[0], a]);
      if (b < i[1]) out.push([b, i[1]]);
    });
    return out;
  }
  function bordsDe(k) {
    return [{axe: 'h', pos: k.y, a: k.x, b: k.x + k.w, cote: 'n'}, {axe: 'h', pos: k.y + k.h, a: k.x, b: k.x + k.w, cote: 's'},
            {axe: 'v', pos: k.x, a: k.y, b: k.y + k.h, cote: 'o'}, {axe: 'v', pos: k.x + k.w, a: k.y, b: k.y + k.h, cote: 'e'}];
  }
  function mursReels(pn) {
    const out = [];
    pn.cases.forEach(k => bordsDe(k).forEach(e => {
      let iv = [[e.a, e.b]];
      pn.cases.forEach(j => {
        if (j === k || idDe(j) !== idDe(k)) return;
        bordsDe(j).forEach(f => {
          if (f.axe !== e.axe || f.cote === e.cote || Math.abs(f.pos - e.pos) > E_MUR) return;
          iv = soustraire(iv, f.a, f.b);
        });
      });
      iv.forEach(i => { if (i[1] - i[0] > .02) out.push({axe: e.axe, pos: e.pos, a: i[0], b: i[1]}); });
    }));
    return out;
  }

  function lignesMurs(pn) {
    const lignes = [];
    const ajoute = (axe, pos, a, b) => {
      let l = lignes.find(x => x.axe === axe && Math.abs(x.pos - pos) < E_MUR);
      if (!l) { l = {axe: axe, pos: pos, morceaux: []}; lignes.push(l); }
      l.morceaux.push([a, b]);
    };
    mursReels(pn).forEach(m => ajoute(m.axe, m.pos, m.a, m.b));
    const out = [];
    lignes.forEach(l => {
      l.morceaux.sort((u, v) => u[0] - v[0]);
      let cur = null;
      l.morceaux.forEach(m => {
        if (cur && m[0] <= cur[1] + E_MUR) cur[1] = Math.max(cur[1], m[1]);
        else { cur = [m[0], m[1]]; out.push({axe: l.axe, pos: l.pos, a: cur[0], b: cur[1], ref: cur}); }
      });
    });
    out.forEach(s => { s.a = s.ref[0]; s.b = s.ref[1]; delete s.ref; });
    return out;
  }

  /* Le tronçon de mur qui porte le point c de la ligne (axe, pos). */
  function segmentSur(pn, axe, pos, c) {
    return lignesMurs(pn).find(s => s.axe === axe && Math.abs(s.pos - pos) < E_MUR &&
      c >= s.a - E_MUR && c <= s.b + E_MUR) || null;
  }

  /* Une ouverture dont le mur a disparu disparaît avec lui ; une
     ouverture qui déborde de son mur y est ramenée. */
  function nettoyerOuvertures(pn) {
    if (!pn.ouvertures) return pn;
    pn.ouvertures = pn.ouvertures.filter(o => {
      const s = segmentSur(pn, o.axe, o.pos, o.c);
      if (!s || s.b - s.a < (o.type === 'vide' ? .05 : .45)) return false;
      o.pos = s.pos;
      if (o.type === 'vide') {
        /* Un mur supprimé reste pile sur son tronçon. */
        const a = Math.max(s.a, o.c - o.l / 2), b = Math.min(s.b, o.c + o.l / 2);
        if (b - a < .05) return false;
        o.c = (a + b) / 2; o.l = b - a;
        return true;
      }
      o.l = Math.min(o.l, s.b - s.a - .1);
      o.c = clamp(o.c, s.a + o.l / 2 + .05, s.b - o.l / 2 - .05);
      return true;
    });
    return pn;
  }

  /* Des murs à moins de 4 cm l'un de l'autre sont le même mur : on les
     ramène sur une seule ligne. Sans ça, de minuscules écarts laissés
     par le calcul (un centimètre ici ou là) s'amplifieraient à chaque
     façade tirée, jusqu'à ouvrir un jour entre deux pièces. */
  function aligner(pn) {
    const E = E_MUR;
    ['x', 'y'].forEach(ax => {
      const lg = ax === 'x' ? 'w' : 'h', L = ax === 'x' ? pn.W : pn.H;
      const vals = [];
      pn.cases.forEach(k => { vals.push(k[ax], k[ax] + k[lg]); });
      vals.sort((a, b) => a - b);
      const groupes = [];
      vals.forEach(v => {
        const g = groupes[groupes.length - 1];
        if (g && v - g[g.length - 1] < E) g.push(v); else groupes.push([v]);
      });
      const rep = v => {
        const g = groupes.find(gr => v >= gr[0] - E && v <= gr[gr.length - 1] + E);
        if (!g) return v;
        if (g.some(u => Math.abs(u) < E)) return 0;             // la façade reste à zéro
        if (g.some(u => Math.abs(u - L) < E)) return L;          // et l'autre à l'emprise
        return somme(g, u => u) / g.length;
      };
      pn.cases.forEach(k => {
        const a = rep(k[ax]), b = rep(k[ax] + k[lg]);
        k[ax] = a; k[lg] = b - a;
      });
      /* Les ouvertures suivent leur mur. */
      (pn.ouvertures || []).forEach(o => {
        if ((ax === 'x' && o.axe === 'v') || (ax === 'y' && o.axe === 'h')) o.pos = rep(o.pos);
      });
    });
    return nettoyerOuvertures(pn);
  }

  let compteurOuv = 0;
  const idOuv = () => 'o' + (++compteurOuv) + Math.random().toString(36).slice(2, 6);

  /* Photographie d'une variante : des rectangles, des pièces, et ses
     portes et fenêtres, qui deviennent des objets à part entière. */
  function figer(v, pieces) {
    const ids = {};
    v.niveaux.forEach(n => n.cases.forEach(c => { ids[c.piece.id] = true; }));
    return {
      base: v.cle,
      pieces: copie(pieces.filter(p => ids[p.id])),
      niveaux: v.niveaux.map(n => aligner({
        niveau: n.niveau, W: n.W, H: n.H,
        cases: n.cases.map(c => ({id: c.piece.id, x: c.x, y: c.y, w: c.w, h: c.h})),
        ouvertures: (n.portes || []).concat(n.fenetres || []).map(o => ({
          id: idOuv(), type: o.type, axe: o.axe, pos: o.pos, c: o.c, l: o.l,
          sens: o.sens || 1, charn: o.charn || 0
        })),
        /* Le garage et la terrasse deviennent des annexes : des objets
           qu'on déplace, qu'on étire et qu'on supprime comme le reste. */
        annexes: (n.ext || []).filter(e => e.genre !== 'jardin').map(e => ({
          id: idOuv(), genre: e.genre, nom: e.nom, x: e.x, y: e.y, w: e.w, h: e.h, forme: e.forme, pose: e.pose, porte: e.porte
        }))
      }))
    };
  }

  /* ---------- Les annexes : garage, terrasse, balcon, abri ----------
     Elles vivent hors de l'emprise, collées à la maison ou non. On les
     aimante aux façades quand on les en approche. */
  const ANNEXES = {
    garage:   {nom: 'Garage',   emoji: '🚗', w: 3.2, h: 5.4},
    terrasse: {nom: 'Terrasse', emoji: '⛱️', w: 5,   h: 3},
    balcon:   {nom: 'Balcon',   emoji: '🌿', w: 3,   h: 1.4},
    abri:     {nom: 'Abri de jardin', emoji: '🛖', w: 2.5, h: 2},
    carport:  {nom: 'Carport',  emoji: '🅿️', w: 3,   h: 5.2},
    piscine:  {nom: 'Piscine',  emoji: '🏊', w: 4,   h: 8}
  };

  function aimanter(pn, a) {
    const S = .4;
    const W = pn.W, H = pn.H;
    /* Les bords de l'annexe contre les façades… */
    if (Math.abs(a.x - W) < S) a.x = W;
    if (Math.abs(a.x + a.w) < S) a.x = -a.w;
    if (Math.abs(a.y - H) < S) a.y = H;
    if (Math.abs(a.y + a.h) < S) a.y = -a.h;
    /* …et ses côtés dans l'alignement des coins de la maison. */
    if (Math.abs(a.x) < S) a.x = 0;
    if (Math.abs(a.x + a.w - W) < S) a.x = W - a.w;
    if (Math.abs(a.y) < S) a.y = 0;
    if (Math.abs(a.y + a.h - H) < S) a.y = H - a.h;
    return a;
  }

  function ajouterAnnexe(pn, genre) {
    const d = ANNEXES[genre] || ANNEXES.garage;
    if (!pn.annexes) pn.annexes = [];
    /* Elle se pose contre la façade de droite, sous les annexes déjà là. */
    const bas = pn.annexes.filter(a => a.x >= pn.W - .01).reduce((m, a) => Math.max(m, a.y + a.h), 0);
    const a = {id: idOuv(), genre: genre, nom: d.nom, x: pn.W, y: Math.min(bas, Math.max(0, pn.H - d.h)), w: d.w, h: d.h};
    if (bas + d.h > pn.H + 3) { a.x = 0; a.y = pn.H; }
    pn.annexes.push(a);
    return a;
  }

  function deplacerAnnexe(pn, id, x, y) {
    const a = (pn.annexes || []).find(v => v.id === id);
    if (!a) return null;
    a.x = Math.round(x * 20) / 20; a.y = Math.round(y * 20) / 20;
    return aimanter(pn, a);
  }

  /* Étirer une annexe par un de ses bords (n, s, e, o). */
  function etirerAnnexe(pn, id, cote, v) {
    const a = (pn.annexes || []).find(u => u.id === id);
    if (!a) return null;
    v = Math.round(v * 20) / 20;
    const M = .6;
    if (cote === 'e') a.w = Math.max(M, v - a.x);
    if (cote === 's') a.h = Math.max(M, v - a.y);
    if (cote === 'o') { const x1 = a.x + a.w; a.x = Math.min(v, x1 - M); a.w = x1 - a.x; }
    if (cote === 'n') { const y1 = a.y + a.h; a.y = Math.min(v, y1 - M); a.h = y1 - a.y; }
    return a;
  }

  /* Faire pivoter une annexe d'un quart de tour, autour de son centre. */
  function pivoterAnnexe(pn, id) {
    const a = (pn.annexes || []).find(u => u.id === id);
    if (!a) return null;
    /* Contre quelle façade était-elle ? Elle y reste collée après le quart de tour. */
    const E = .05;
    const colle = Math.abs(a.y + a.h) < E ? 'n' : Math.abs(a.y - pn.H) < E ? 's'
      : Math.abs(a.x + a.w) < E ? 'o' : Math.abs(a.x - pn.W) < E ? 'e' : null;
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    const w = a.h, h = a.w;
    a.w = w; a.h = h; a.x = cx - w / 2; a.y = cy - h / 2;
    if (colle === 'n') a.y = -a.h;
    if (colle === 's') a.y = pn.H;
    if (colle === 'o') a.x = -a.w;
    if (colle === 'e') a.x = pn.W;
    return aimanter(pn, a);
  }

  /* Un plan vierge : une seule grande pièce par niveau, à découper soi-même
     en traçant des murs. */
  function planVierge(W, H, nbNiveaux) {
    const pieces = [], niveaux = [];
    for (let n = 0; n < nbNiveaux; n++) {
      const p = nouvellePiece('piece', {niveau: n, nom: n === 0 ? 'Rez-de-chaussée' : 'Étage'});
      pieces.push(p);
      niveaux.push({niveau: n, W: W, H: H, cases: [{id: p.id, x: 0, y: 0, w: W, h: H}],
        ouvertures: n === 0 ? [{id: idOuv(), type: 'entree', axe: 'h', pos: H, c: W / 2, l: .95, sens: -1, charn: 0}] : []});
    }
    return {base: 'vierge', pieces: pieces, niveaux: niveaux};
  }

  /* Qui est de chaque côté d'une ouverture — pour la nommer. */
  function cotesOuverture(niv, o) {
    const E = E_MUR;
    let avant = null, apres = null;
    niv.cases.forEach(k => {
      if (o.axe === 'v') {
        if (o.c < k.y - E || o.c > k.y + k.h + E) return;
        if (Math.abs(k.x + k.w - o.pos) < E) avant = k;
        if (Math.abs(k.x - o.pos) < E) apres = k;
      } else {
        if (o.c < k.x - E || o.c > k.x + k.w + E) return;
        if (Math.abs(k.y + k.h - o.pos) < E) avant = k;
        if (Math.abs(k.y - o.pos) < E) apres = k;
      }
    });
    return [avant, apres];
  }

  /* Remonte un plan figé en niveaux complets. Le reste de l'outil (dessin,
     3D, façade, PDF) ne voit pas la différence avec une variante. */
  function monter(perso, c, ouv) {
    const niveaux = perso.niveaux.map(n => {
      const cases = n.cases.map(k => ({piece: perso.pieces.find(p => p.id === k.id), x: k.x, y: k.y, w: k.w, h: k.h}))
        .filter(k => k.piece);
      const niv = {W: n.W, H: n.H, niveau: n.niveau, cases: cases, bandeRect: {x: 0, y: 0, w: 0, h: 0}};
      cases.forEach(k => { if (k.piece.type === 'cuisine') k.piece.ouverte = !!c.cuisineOuverte; });
      /* Le calcul automatique sert encore à savoir quels murs donnent
         dehors (pour la terrasse) et qui dessert qui. */
      ouvertures(niv, ouv);
      exterieurs(niv, c);
      /* Un « Mon plan » figé avant l'arrivée des annexes : sa terrasse et
         son garage étaient de simples décors. On les convertit une fois
         pour toutes en annexes, pour qu'ils deviennent modulables. */
      if (!n.annexes) {
        n.annexes = niv.ext.filter(e => e.genre !== 'jardin').map(e => ({
          id: idOuv(), genre: e.genre, nom: e.nom, x: e.x, y: e.y, w: e.w, h: e.h, forme: e.forme, pose: e.pose, porte: e.porte
        }));
      }
      if (n.annexes) {
        /* Le jardin reste calculé autour de la maison ; le reste est à
           l'utilisateur. */
        niv.ext = niv.ext.filter(e => e.genre === 'jardin').concat(n.annexes.map(a => ({
          id: a.id, genre: a.genre, nom: a.nom, emoji: (ANNEXES[a.genre] || ANNEXES.garage).emoji,
          x: a.x, y: a.y, w: a.w, h: a.h, annexe: true, forme: a.forme, pose: a.pose, porte: a.porte,
          aire: a.forme === 'ronde' ? Math.PI / 4 * a.w * a.h
            : a.forme === 'ovale' ? a.w * a.h - (4 - Math.PI) * Math.pow(Math.min(a.w, a.h) / 2, 2)
            : a.forme === 'haricot' ? .8 * a.w * a.h : a.w * a.h
        })));
      }
      /* Les meubles posés à la main (le mode Aménager). */
      niv.meubles = n.meubles || [];
      englober(niv.ext);
      if (n.ouvertures) {
        const portes = [], fenetres = [];
        n.ouvertures.forEach(o => {
          const s = segmentSur(n, o.axe, o.pos, o.c);
          if (!s) return;
          const cs = cotesOuverture(niv, o);
          const nom = k => k ? k.piece.nom : 'l\'extérieur';
          const obj = {cle: o.id, id: o.id, type: o.type, axe: o.axe, pos: o.pos, c: o.c, l: o.l,
                       sens: o.sens, charn: o.charn, a: s.a, b: s.b, libre: Math.max(0, s.b - s.a - o.l),
                       piece: nom(cs[0] || cs[1]), vers: nom(cs[0] ? cs[1] : null), explicite: true};
          if (o.type === 'fenetre' || o.type === 'baie') fenetres.push(obj); else portes.push(obj);
        });
        niv.portes = portes; niv.fenetres = fenetres;
      } else {
        niv.portes = []; niv.fenetres = [];
        ouvertures(niv, ouv);
      }
      return niv;
    });
    if (niveaux.length > 1) {
      const e0 = niveaux[0].cases.find(k => k.piece.type === 'escalier');
      niveaux.slice(1).forEach(n => {
        const e1 = n.cases.find(k => k.piece.type === 'escalier');
        if (!e0 || !e1) return;
        const ox = Math.min(e0.x + e0.w, e1.x + e1.w) - Math.max(e0.x, e1.x);
        const oy = Math.min(e0.y + e0.h, e1.y + e1.h) - Math.max(e0.y, e1.y);
        if (ox < Math.min(e0.w, e1.w) * .8 || oy < Math.min(e0.h, e1.h) * .8) n.decale = true;
      });
    }
    return {cle: '✏️', nom: 'Mon plan', emoji: '✏️', perso: true,
            note: 'Votre plan, retouché à la main : il ne bouge que là où vous le touchez.',
            niveaux: niveaux};
  }

  /* Deux pièces échangent leurs rectangles. Les murs, les portes et les
     fenêtres restent où ils sont : seules les deux pièces changent. */
  function echangerCases(pn, idA, idB) {
    if (idA === idB) return false;
    const a = pn.cases.filter(k => k.id === idA), b = pn.cases.filter(k => k.id === idB);
    if (!a.length || !b.length) return false;
    /* Une pièce peut compter plusieurs rectangles : les deux pièces
       échangent simplement tous les leurs. */
    a.forEach(k => { k.id = idB; });
    b.forEach(k => { k.id = idA; });
    return true;
  }

  const aireDe = (pn, id) => pn.cases.filter(k => k.id === id).reduce((s, k) => s + k.w * k.h, 0);

  /* Déplace une ligne de mur. On part du tronçon saisi, et on l'étend
     à tout ce qui est dans son prolongement et le touche : bouger une
     cloison, c'est bouger tout le mur, pas un morceau qui laisserait
     un trou. Ses portes et fenêtres suivent. Renvoie la position atteinte. */
  function deplacerMur(pn, axe, pos, a, b, nouv) {
    const E = E_MUR;
    const L = axe === 'v' ? pn.W : pn.H;
    const ext0 = Math.abs(pos) < E, extMax = Math.abs(pos - L) < E;
    let lo = a, hi = b;
    if (ext0 || extMax) { lo = -1e9; hi = 1e9; }
    const span = k => axe === 'v' ? [k.y, k.y + k.h] : [k.x, k.x + k.w];
    const bords = [];
    pn.cases.forEach(k => {
      const s0 = axe === 'v' ? k.x : k.y, s1 = s0 + (axe === 'v' ? k.w : k.h);
      if (Math.abs(s0 - pos) < E) bords.push({k: k, cote: 'debut'});
      if (Math.abs(s1 - pos) < E) bords.push({k: k, cote: 'fin'});
    });
    const pris = [];
    let change = true;
    while (change) {
      change = false;
      bords.forEach(e => {
        if (pris.indexOf(e) >= 0) return;
        const s = span(e.k);
        if (s[1] > lo + E && s[0] < hi - E) {
          pris.push(e);
          if (s[0] < lo) { lo = s[0]; change = true; }
          if (s[1] > hi) { hi = s[1]; change = true; }
        }
      });
    }
    if (!pris.length) return pos;
    let min = -1e9, max = 1e9;
    pris.forEach(e => {
      const s0 = axe === 'v' ? e.k.x : e.k.y, s1 = s0 + (axe === 'v' ? e.k.w : e.k.h);
      if (e.cote === 'debut') max = Math.min(max, s1 - MIN_COTE);
      else min = Math.max(min, s0 + MIN_COTE);
    });
    nouv = clamp(nouv, min, max);
    pris.forEach(e => {
      if (axe === 'v') {
        if (e.cote === 'debut') { const x1 = e.k.x + e.k.w; e.k.x = nouv; e.k.w = x1 - nouv; } else e.k.w = nouv - e.k.x;
      } else {
        if (e.cote === 'debut') { const y1 = e.k.y + e.k.h; e.k.y = nouv; e.k.h = y1 - nouv; } else e.k.h = nouv - e.k.y;
      }
    });
    /* Les portes et fenêtres posées sur ce mur le suivent. */
    (pn.ouvertures || []).forEach(o => {
      if (o.axe === axe && Math.abs(o.pos - pos) < E && o.c >= lo - E && o.c <= hi + E) o.pos = nouv;
    });
    if (extMax) {
      if (axe === 'v') pn.W = nouv; else pn.H = nouv;
      /* Un garage collé à cette façade la suit. */
      (pn.annexes || []).forEach(a => {
        if (axe === 'v' && Math.abs(a.x - L) < E) a.x = nouv;
        if (axe === 'h' && Math.abs(a.y - L) < E) a.y = nouv;
      });
    }
    if (ext0) {
      /* La façade de gauche (ou du haut) a bougé : on recale tout pour
         que le logement reparte de zéro. */
      pn.cases.forEach(k => { if (axe === 'v') k.x -= nouv; else k.y -= nouv; });
      (pn.annexes || []).forEach(a => { if (axe === 'v') a.x -= nouv; else a.y -= nouv; });
      (pn.ouvertures || []).forEach(o => {
        if (axe === 'v') { if (o.axe === 'v') o.pos -= nouv; else o.c -= nouv; }
        else { if (o.axe === 'h') o.pos -= nouv; else o.c -= nouv; }
      });
      if (axe === 'v') pn.W -= nouv; else pn.H -= nouv;
    }
    aligner(pn);
    return nouv;
  }

  /* Tirer une façade s'applique à tous les niveaux : un étage ne
     dépasse jamais du rez, les deux restent superposés. */
  function deplacerFacade(perso, axe, cote, nouv) {
    const pos = pn => cote === 'fin' ? (axe === 'v' ? pn.W : pn.H) : 0;
    /* Essai à blanc sur chaque niveau : chacun a ses propres limites
       (une pièce ne descend pas sous 30 cm). La plus contraignante
       l'emporte, puis on applique la même valeur partout. */
    /* On raisonne en décalage : un étage plus petit que le rez (repris
       d'une image, par exemple) bouge d'autant, sans prendre sa taille. */
    const ref = perso.niveaux[arguments[4] || 0] || perso.niveaux[0];
    let delta = nouv - pos(ref);
    perso.niveaux.forEach(pn => { delta = deplacerMur(copie(pn), axe, pos(pn), -1e9, 1e9, pos(pn) + delta) - pos(pn); });
    perso.niveaux.forEach(pn => { deplacerMur(pn, axe, pos(pn), -1e9, 1e9, pos(pn) + delta); });
    return pos(ref);
  }

  /* Étire tout le plan, pièces et ouvertures comprises, pour que
     l'emprise vaille W × H. Les largeurs de porte ne changent pas :
     une porte reste une porte. */
  function mettreAEchelle(perso, W, H) {
    perso.niveaux.forEach(pn => {
      const kx = W / pn.W, ky = H / pn.H;
      pn.cases.forEach(k => { k.x *= kx; k.w *= kx; k.y *= ky; k.h *= ky; });
      (pn.ouvertures || []).forEach(o => {
        if (o.axe === 'v') { o.pos *= kx; o.c *= ky; } else { o.pos *= ky; o.c *= kx; }
      });
      /* Les annexes gardent leur taille et suivent leur façade. */
      (pn.annexes || []).forEach(a => {
        if (a.x >= pn.W - .01) a.x = W + (a.x - pn.W); else if (a.x + a.w > .01) a.x *= kx;
        if (a.y >= pn.H - .01) a.y = H + (a.y - pn.H); else if (a.y + a.h > .01) a.y *= ky;
      });
      pn.W = W; pn.H = H;
      aligner(pn);
    });
  }

  /* Une porte au milieu d'un mur neuf : sans elle, la pièce qu'on vient
     de créer serait murée. On peut ensuite la déplacer ou la supprimer. */
  function porteSur(pn, axe, pos, a, b, sens) {
    if (!pn.ouvertures) pn.ouvertures = [];
    if (b - a < .75) return null;
    const o = {id: idOuv(), type: 'porte', axe: axe, pos: pos, c: (a + b) / 2, l: Math.min(.83, b - a - .2),
               sens: sens || 1, charn: 0};
    pn.ouvertures.push(o);
    return o;
  }

  /* Ajoute une pièce en la prenant sur une pièce hôte : l'hôte est
     coupé en deux dans sa longueur. `aire` est la surface souhaitée,
     plafonnée à la moitié de l'hôte. */
  function ajouterCase(pn, id, hoteId, aire) {
    const decoupable = k => Math.max(k.w, k.h) >= MIN_COTE * 2 + .02;
    let h = pn.cases.find(k => k.id === hoteId);
    /* Un hôte trop petit pour être coupé : on prend la plus grande pièce. */
    if (!h || !decoupable(h)) h = pn.cases.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    if (!h || !decoupable(h)) return false;
    const long = Math.max(h.w, h.h);
    const part = clamp(clamp(aire / (h.w * h.h), .15, .5), MIN_COTE / long, 1 - MIN_COTE / long);
    if (h.w >= h.h) {
      const w = h.w * part;
      pn.cases.push({id: id, x: h.x + h.w - w, y: h.y, w: w, h: h.h});
      h.w -= w;
      porteSur(pn, 'v', h.x + h.w, h.y, h.y + h.h, 1);
    } else {
      const hh = h.h * part;
      pn.cases.push({id: id, x: h.x, y: h.y + h.h - hh, w: h.w, h: hh});
      h.h -= hh;
      porteSur(pn, 'h', h.y + h.h, h.x, h.x + h.w, 1);
    }
    aligner(pn);
    return true;
  }

  /* Tracer un mur dans une pièce : elle se coupe en deux à l'endroit
     choisi. La nouvelle moitié reçoit l'identifiant `id`, et une porte. */
  function scinder(pn, idPiece, id, axe, pos, pt) {
    /* Une pièce en L compte plusieurs rectangles : on coupe celui où le
       trait a commencé. */
    const siens = pn.cases.filter(c => c.id === idPiece);
    const k = (pt && siens.find(c => pt.x >= c.x - .01 && pt.x <= c.x + c.w + .01 && pt.y >= c.y - .01 && pt.y <= c.y + c.h + .01)) || siens[0];
    if (!k) return false;
    if (axe === 'v') {
      if (pos < k.x + MIN_COTE || pos > k.x + k.w - MIN_COTE) return false;
      pn.cases.push({id: id, x: pos, y: k.y, w: k.x + k.w - pos, h: k.h});
      k.w = pos - k.x;
      porteSur(pn, 'v', pos, k.y, k.y + k.h, 1);
    } else {
      if (pos < k.y + MIN_COTE || pos > k.y + k.h - MIN_COTE) return false;
      pn.cases.push({id: id, x: k.x, y: pos, w: k.w, h: k.y + k.h - pos});
      k.h = pos - k.y;
      porteSur(pn, 'h', pos, k.x, k.x + k.w, 1);
    }
    aligner(pn);
    return true;
  }

  /* Effacer un mur : les deux pièces de part et d'autre n'en font plus
     qu'une — à condition que leur réunion soit un rectangle. Renvoie
     l'identifiant de la pièce absorbée, ou une raison si c'est impossible. */
  /* Effacer un mur, sans restriction :
       · entre deux pièces, elles n'en font plus qu'une — quelle que soit
         leur forme (une pièce en L, en T, en U, c'est permis) ;
       · en façade, le mur s'ouvre sur l'extérieur sur toute la longueur
         du tronçon visé (on le rebâtit en supprimant ce « vide »). */
  function effacerMur(pn, axe, pos, u) {
    const E = E_MUR;
    const dans = k => axe === 'v' ? (u >= k.y - E && u <= k.y + k.h + E) : (u >= k.x - E && u <= k.x + k.w + E);
    const A = pn.cases.find(k => dans(k) && Math.abs((axe === 'v' ? k.x + k.w : k.y + k.h) - pos) < E);
    const B = pn.cases.find(k => dans(k) && Math.abs((axe === 'v' ? k.x : k.y) - pos) < E);
    if (!A && !B) return {erreur: 'Aucun mur ici.'};
    if (!A || !B) {
      /* Un mur de façade : on l'ouvre, tronçon par tronçon. */
      const k = A || B;
      /* Seulement le mur de la pièce visée, pas toute la façade. */
      const s = {pos: pos, a: axe === 'v' ? k.y : k.x, b: axe === 'v' ? k.y + k.h : k.x + k.w};
      if (!pn.ouvertures) pn.ouvertures = [];
      /* Ce qui était déjà percé dans ce tronçon disparaît dans le vide. */
      pn.ouvertures = pn.ouvertures.filter(o => !(o.axe === axe && Math.abs(o.pos - pos) < E && o.c >= s.a && o.c <= s.b));
      pn.ouvertures.push({id: idOuv(), type: 'vide', axe: axe, pos: s.pos, c: (s.a + s.b) / 2, l: s.b - s.a, sens: 1, charn: 0});
      return {facade: true};
    }
    if (A.id === B.id) return {erreur: 'Il n\'y a déjà plus de mur ici.'};
    /* La plus grande garde son nom ; l'autre lui donne tous ses rectangles. */
    const garde = aireDe(pn, A.id) >= aireDe(pn, B.id) ? A.id : B.id;
    const part = garde === A.id ? B.id : A.id;
    pn.cases.forEach(k => { if (k.id === part) k.id = garde; });
    aligner(pn);
    return {garde: garde, retire: part};
  }

  /* Retire une pièce. Sa place va à la voisine avec qui elle forme un
     rectangle (même largeur ou même hauteur, bord à bord). S'il n'y en
     a pas, la place reste libre : on renvoie son rectangle, à charge
     pour l'interface d'en faire un dégagement. */
  function retirerCase(pn, id) {
    const siennes = pn.cases.filter(k => k.id === id);
    if (!siennes.length) return {ok: false};
    /* Sa place revient à la voisine avec qui elle partage le plus long
       mur — quelle que soit la forme qui en résulte. */
    const partage = {};
    siennes.forEach(k => bordsDe(k).forEach(e => pn.cases.forEach(j => {
      if (j.id === id) return;
      bordsDe(j).forEach(f => {
        if (f.axe !== e.axe || f.cote === e.cote || Math.abs(f.pos - e.pos) > E_MUR) return;
        const l = Math.min(e.b, f.b) - Math.max(e.a, f.a);
        if (l > .05) partage[j.id] = (partage[j.id] || 0) + l;
      });
    })));
    const voisine = Object.keys(partage).sort((a, b) => partage[b] - partage[a])[0];
    if (!voisine) return {ok: false};
    siennes.forEach(k => { k.id = voisine; });
    aligner(pn);
    return {ok: true, fusion: voisine};
  }

  /* ---------- Portes et fenêtres, comme des objets ----------
     On les pose sur le mur le plus proche du point visé ; on les
     déplace de la même façon — y compris sur un autre mur. */
  function murLePlusProche(pn, x, y, max) {
    let best = null;
    lignesMurs(pn).forEach(s => {
      const u = s.axe === 'v' ? y : x, d0 = s.axe === 'v' ? Math.abs(x - s.pos) : Math.abs(y - s.pos);
      const hors = u < s.a ? s.a - u : (u > s.b ? u - s.b : 0);
      const d = Math.sqrt(d0 * d0 + hors * hors);
      if (d <= (max || .8) && (!best || d < best.d)) best = {s: s, d: d, u: clamp(u, s.a, s.b)};
    });
    return best;
  }

  function placerSurMur(o, m) {
    const s = m.s;
    o.axe = s.axe; o.pos = s.pos;
    o.l = Math.min(o.l, Math.max(.4, s.b - s.a - .1));
    o.c = clamp(m.u, s.a + o.l / 2 + .05, s.b - o.l / 2 - .05);
    return o;
  }

  const LARGEURS = {porte: .83, entree: .95, fenetre: 1.2, baie: 2.4, passage: 1.6, garage: 2.4};

  function poserOuverture(pn, type, x, y) {
    const m = murLePlusProche(pn, x, y, 1.2);
    if (!m) return null;
    if (!pn.ouvertures) pn.ouvertures = [];
    const o = placerSurMur({id: idOuv(), type: type, l: LARGEURS[type] || .9, sens: 1, charn: 0}, m);
    pn.ouvertures.push(o);
    return o;
  }

  function deplacerOuverture(pn, id, x, y) {
    const o = (pn.ouvertures || []).find(v => v.id === id);
    if (!o) return null;
    const m = murLePlusProche(pn, x, y, 1.5);
    if (!m) return o;
    return placerSurMur(o, m);
  }

  /* Tourner une porte : quatre positions, comme dans la vraie vie —
     charnière à gauche ou à droite, ouverture d'un côté ou de l'autre. */
  function tournerOuverture(o) {
    const etats = [[1, 0], [1, 1], [-1, 1], [-1, 0]];
    const i = etats.findIndex(e => e[0] === (o.sens || 1) && e[1] === (o.charn || 0));
    const n = etats[(i + 1) % 4];
    o.sens = n[0]; o.charn = n[1];
    return o;
  }

  /* Les tronçons de mur d'un niveau figé, pour les poignées : chaque
     bord de pièce, une seule fois. */
  function tronconsMurs(pn) {
    const vus = {}, out = [];
    const q = v => Math.round(v * 100) / 100;
    const add = (axe, pos, a, b) => {
      const k = axe + q(pos) + ':' + q(a) + ':' + q(b);
      if (vus[k] || b - a < .1) return;
      vus[k] = 1;
      out.push({axe: axe, pos: pos, a: a, b: b});
    };
    /* Seulement les vrais murs : rien entre deux morceaux d'une même pièce. */
    mursReels(pn).forEach(m => add(m.axe, m.pos, m.a, m.b));
    return out;
  }

  /* ============================================================
     L'API
     ============================================================ */
  function critèresParDéfaut() {
    return {
      type: 'maison', surface: 110, chambres: 3, sdb: 1, niveaux: 1,
      cuisineOuverte: true, wcSepare: true, cellier: true, buanderie: false,
      bureau: false, suiteType: 'simple', dressing: false, parentaleRdc: false,
      garage: false, garageDouble: false, terrasse: 18, jardin: 400,
      nord: 'haut', mobilier: true, cotes: true,
      piscine: false, piscineForme: 'rect', piscinePose: 'creusee', piscineL: 8, piscineW: 4,
      carport: false, abri: false
    };
  }

  /* Construit tout : programme (si absent), surfaces, variantes. */
  function generer(c, piecesExistantes, ouv) {
    const pieces = piecesExistantes ? copie(piecesExistantes) : programme(c);
    pieces.forEach(p => { if (p.type === 'cuisine') p.ouverte = !!c.cuisineOuverte; });

    const nbNiveaux = Math.max.apply(null, pieces.map(p => p.niveau)) + 1;
    const diagnostics = [];

    /* Chaque niveau reçoit la même emprise : un étage se superpose au
       rez-de-chaussée, il ne flotte pas. */
    let aireNiveau = c.surface / nbNiveaux;
    if (nbNiveaux > 1) {
      const mini = [];
      for (let n = 0; n < nbNiveaux; n++) {
        const pn = pieces.filter(p => p.niveau === n);
        mini.push(somme(pn, p => {
          const d = CAT[p.type];
          return p.verrou ? p.cible : (d.fixe ? d.fixe : Math.max(d.min, d.part * c.surface * .8));
        }));
      }
      const besoin = Math.max.apply(null, mini);
      if (besoin > aireNiveau + .5) {
        aireNiveau = besoin;
        diagnostics.push({genre: 'info', texte:
          'Pour que les deux niveaux se superposent, l\'emprise a été portée à ' +
          Math.round(aireNiveau) + ' m² par niveau, soit ' + Math.round(aireNiveau * nbNiveaux) +
          ' m² au total au lieu des ' + Math.round(c.surface) + ' m² demandés.'});
      }
    }

    for (let n = 0; n < nbNiveaux; n++) {
      const pn = pieces.filter(p => p.niveau === n);
      const r = equilibrer(pn, aireNiveau, c.surface);
      if (r.serre) diagnostics.push({genre: 'info', texte:
        'Le programme demande plus de place que ' + Math.round(c.surface) + ' m² : les pièces ont été ' +
        'resserrées sous leurs dimensions habituelles. Ajoutez des m², ou retirez une pièce.'});
    }

    if (nbNiveaux > 1) {
      for (let n = 0; n < nbNiveaux; n++) {
        if (!pieces.some(p => p.niveau === n && p.type === 'escalier')) {
          diagnostics.push({genre: 'alerte', texte:
            'Il manque un escalier au ' + (n === 0 ? 'rez-de-chaussée' : 'niveau ' + n) +
            ' : les deux niveaux ne communiquent pas. Ajoutez-en un depuis « Les pièces ».'});
        }
      }
    }

    const vars = variantes(pieces, aireNiveau, nbNiveaux, ouv);
    vars.forEach(v => v.niveaux.forEach(niv => exterieurs(niv, c)));
    /* La baie du séjour est connue après coup : on refait les ouvertures. */
    vars.forEach(v => v.niveaux.forEach(niv => { niv.fenetres = []; niv.portes = []; ouvertures(niv, ouv); }));

    /* Pièces trop étroites : on le dit, plutôt que de faire semblant. */
    if (vars.length) {
      const etroites = [];
      vars[0].niveaux.forEach(niv => niv.cases.forEach(c2 => {
        const d = CAT[c2.piece.type];
        if (Math.min(c2.w, c2.h) < d.cote - .06) etroites.push(c2.piece.nom);
      }));
      if (etroites.length) diagnostics.push({genre: 'info', texte:
        'Plus étroite(s) que l\'usage courant dans la variante A : ' + etroites.join(', ') +
        '. C\'est tout à fait faisable — à vérifier avec votre usage.'});
    }

    return {criteres: c, pieces: pieces, variantes: vars, aireNiveau: aireNiveau,
            nbNiveaux: nbNiveaux, diagnostics: diagnostics};
  }

  return {
    CAT: CAT, AJOUTABLES: AJOUTABLES, FAMILLES: FAMILLES,
    programme: programme, generer: generer, nouvellePiece: nouvellePiece,
    defauts: critèresParDéfaut, clamp: clamp, mitoyen: mitoyen,
    grp: grp, inserer: inserer, ranger: ranger, cle: cle,
    figer: figer, monter: monter, echangerCases: echangerCases, deplacerMur: deplacerMur,
    deplacerFacade: deplacerFacade, ajouterCase: ajouterCase, retirerCase: retirerCase,
    tronconsMurs: tronconsMurs, copie: copie,
    lignesMurs: lignesMurs, scinder: scinder, effacerMur: effacerMur, mettreAEchelle: mettreAEchelle,
    poserOuverture: poserOuverture, deplacerOuverture: deplacerOuverture, tournerOuverture: tournerOuverture,
    planVierge: planVierge, aligner: aligner, nettoyerOuvertures: nettoyerOuvertures,
    ESCALIERS: ESCALIERS, LARGEURS: LARGEURS, idOuv: idOuv,
    ANNEXES: ANNEXES, ajouterAnnexe: ajouterAnnexe, deplacerAnnexe: deplacerAnnexe,
    etirerAnnexe: etirerAnnexe, pivoterAnnexe: pivoterAnnexe,
    mursReels: mursReels, aireDe: aireDe
  };
})();
