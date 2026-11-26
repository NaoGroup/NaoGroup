/* ============================================================
   NaoTrip — le monde : les pays, leurs statuts, la carte à plat
   et le globe qui tourne. Les contours viennent de Natural Earth
   (world-atlas 110m), dessinés avec d3-geo — tout est dans le fichier.
   ============================================================ */
'use strict';
const CONTINENTS = { EU: 'Europe', AF: 'Afrique', AS: 'Asie', NA: 'Amérique du Nord', SA: 'Amérique du Sud', OC: 'Océanie', AN: 'Antarctique' };
const STATUTS_PAYS = {
  visite: { e: '✓', l: 'Visité', long: "J'y suis allé·e" },
  avenir: { e: '📍', l: 'À venir', long: 'Voyage prévu' },
  reve:   { e: '♡', l: 'En rêve', long: "J'aimerais y aller" }
};

const PAYS = {};           /* code ISO-2 → { code, num, nom, reg, lat, lng } */
const PAYS_NUM = {};
(function () {
  const brut = JSON.parse(document.getElementById('donnees-pays').textContent);
  const corrections = { AX: 'Îles Åland', XK: 'Kosovo', GB: 'Royaume-Uni', US: 'États-Unis', MK: 'Macédoine du Nord', CZ: 'Tchéquie' };
  brut.forEach(([num, code, nom, reg, lat, lng]) => {
    const p = { code, num, nom: corrections[code] || nom, reg, lat, lng };
    PAYS[code] = p; if (num) PAYS_NUM[num] = p;
  });
})();
const LISTE_PAYS = Object.values(PAYS).filter(p => p.reg !== 'AN').sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
const NOMS_PAYS = LISTE_PAYS.map(p => p.nom);
function paysDeNom(s) {
  const n = sansAccent(s);
  if (!n) return null;
  if (PAYS[s.toUpperCase()]) return PAYS[s.toUpperCase()];
  return LISTE_PAYS.find(p => sansAccent(p.nom) === n) || LISTE_PAYS.find(p => sansAccent(p.nom).startsWith(n)) || null;
}
const codePays = code => `<span class="code-pays">${esc(code)}</span>`;

/* ---------- les formes ---------- */
const TOPO = JSON.parse(document.getElementById('donnees-monde').textContent);
const SANS_ID = { 'Kosovo': 'XK', 'N. Cyprus': 'CY', 'Somaliland': 'SO' };
const FORMES = topojson.feature(TOPO, TOPO.objects.countries).features.map(f => {
  const p = PAYS_NUM[f.id] || PAYS[SANS_ID[f.properties.name]] || null;
  f.code = p ? p.code : null;
  return f;
});
const FRONTIERES = topojson.mesh(TOPO, TOPO.objects.countries, (a, b) => a !== b);
const CODES_AVEC_FORME = new Set(FORMES.map(f => f.code).filter(Boolean));
/* les petits pays sans contour à cette échelle (Malte, Singapour, Maldives…) deviennent des points */
const PETITS_PAYS = LISTE_PAYS.filter(p => !CODES_AVEC_FORME.has(p.code));
const NB_PAYS_MONDE = 195;

/* ---------- les statuts : ce qu'on a coché + ce que disent les voyages ---------- */
const RANG_STATUT = { visite: 3, avenir: 2, reve: 1 };
/* ce que disent les voyages seuls : visité après (ou pendant), à venir avant */
function statutsDesVoyages() {
  const res = {}, via = {};
  S.voyages.forEach(v => {
    const st = statutVoyage(v);
    const s = (st === 'passe' || st === 'encours') ? 'visite' : (st === 'avenir' ? 'avenir' : 'reve');
    (v.pays || []).forEach(c => {
      if (PAYS[c] && (!res[c] || RANG_STATUT[s] > RANG_STATUT[res[c]])) { res[c] = s; via[c] = v.nom; }
    });
  });
  return { res, via };
}
/* le statut le plus avancé l'emporte ; « aucun » coché à la main efface tout */
function statutsPays() {
  const { res, via } = statutsDesVoyages();
  Object.entries(S.monde || {}).forEach(([c, s]) => {
    if (s === 'aucun') { delete res[c]; delete via[c]; }
    else if (STATUTS_PAYS[s] && (!res[c] || RANG_STATUT[s] > RANG_STATUT[res[c]])) { res[c] = s; delete via[c]; }
  });
  return { statut: res, via };
}
function definirStatutPays(code, s) {
  const naturel = statutsDesVoyages().res[code];
  if (!s || s === 'aucun') { if (naturel) S.monde[code] = 'aucun'; else delete S.monde[code]; }
  else if (naturel && RANG_STATUT[naturel] >= RANG_STATUT[s]) delete S.monde[code];
  else S.monde[code] = s;
  sauver();
}
function statsMonde() {
  const { statut } = statutsPays();
  const par = { visite: [], avenir: [], reve: [] };
  Object.entries(statut).forEach(([c, s]) => par[s] && par[s].push(PAYS[c]));
  Object.values(par).forEach(l => l.sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
  const continents = {};
  Object.keys(CONTINENTS).filter(k => k !== 'AN').forEach(k => continents[k] = { total: LISTE_PAYS.filter(p => p.reg === k).length, vus: par.visite.filter(p => p.reg === k).length });
  return { par, continents, pct: Math.round(par.visite.length / NB_PAYS_MONDE * 1000) / 10 };
}

/* ---------- les marques : la coche ✓ et l'aiguille 📍 ---------- */
function marqueSVG(s, x, y, k = 1, i = 0) {
  const d = `style="animation-delay:${(i % 30) * 0.04}s"`;
  if (s === 'visite') return `<g class="marque tombe" transform="translate(${x},${y}) scale(${k})" ${d}><circle r="5.4" fill="var(--pays-visite)" stroke="#fff" stroke-width="1.3"/><path d="M-2.4 .1L-.7 1.9L2.6 -1.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if (s === 'avenir') return `<g class="marque tombe" transform="translate(${x},${y}) scale(${k})" ${d}><path d="M0 0L0 -9" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/><circle cy="-11" r="3.8" fill="var(--pays-avenir)" stroke="#fff" stroke-width="1.2"/><circle cx="-1" cy="-12" r="1" fill="#fff" opacity=".8"/><ellipse rx="2.2" ry=".8" fill="#000" opacity=".25"/></g>`;
  if (s === 'reve') return `<g class="marque tombe" transform="translate(${x},${y}) scale(${k})" ${d}><path d="M0 3.2C-4.6 0-4.4-3.6-2.2-3.8C-1 -3.9-.3-3.1 0-2.4C.3-3.1 1-3.9 2.2-3.8C4.4-3.6 4.6 0 0 3.2Z" fill="var(--pays-reve)" stroke="#fff" stroke-width=".9"/></g>`;
  return '';
}

/* ---------- la carte à plat (SVG) ---------- */
function carteMondeSVG(o = {}) {
  const W = 960, H = o.hauteur || 470;
  const proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
  const chemin = d3.geoPath(proj);
  const { statut, via } = statutsPays();
  const formes = FORMES.filter(f => f.id !== '010');
  const pays = formes.map(f => {
    const s = f.code ? statut[f.code] || '' : '';
    const p = PAYS[f.code];
    const titre = p ? `${p.nom}${s ? ' — ' + STATUTS_PAYS[s].l : ''}${via[f.code] ? ' (' + via[f.code] + ')' : ''}` : f.properties.name;
    return `<path class="pays ${s}" d="${chemin(f)}" data-code="${f.code || ''}"><title>${esc(titre)}</title></path>`;
  }).join('');
  const petits = PETITS_PAYS.filter(p => statut[p.code]).map(p => {
    const [x, y] = proj([p.lng, p.lat]) || [];
    return x == null ? '' : `<circle class="pays ${statut[p.code]}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" data-code="${p.code}"><title>${esc(p.nom)}</title></circle>`;
  }).join('');
  let i = 0;
  const ordre = { reve: 0, visite: 1, avenir: 2 };
  const marques = Object.entries(statut).filter(([c]) => PAYS[c]).sort((a, b) => ordre[a[1]] - ordre[b[1]] || PAYS[b[0]].lat - PAYS[a[0]].lat).map(([c, s]) => {
    const [x, y] = proj([PAYS[c].lng, PAYS[c].lat]) || [];
    return x == null ? '' : marqueSVG(s, x.toFixed(1), y.toFixed(1), o.k || 1.25, i++);
  }).join('');
  return `<div class="carte-monde"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Carte du monde de mes voyages">
    <path class="grat" d="${chemin(d3.geoGraticule10())}"/>
    <g>${pays}${petits}</g>
    <path class="sphere" d="${chemin({ type: 'Sphere' })}"/>
    <g>${marques}</g></svg></div>`;
}

/* ============================================================
   Le globe (canvas) : on le fait tourner du doigt ou de la souris,
   on clique sur un pays pour dire « j'y suis allé·e » ou « c'est prévu ».
   ============================================================ */
const Globe = {
  canvas: null, ctx: null, proj: null, chemin: null, rot: [-10, -28, 0], zoom: 1, taille: 500, dpr: 1,
  auto: true, anim: null, cible: null, derniere: 0, survol: null, couleurs: null, t: 0, surClic: null,

  monter(canvas, surClic) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.surClic = surClic;
    this.proj = d3.geoOrthographic().clipAngle(90).precision(.6);
    this.chemin = d3.geoPath(this.proj, this.ctx);
    this.lireCouleurs(); this.dimensionner();
    if (this.obs) this.obs.disconnect();
    this.obs = new ResizeObserver(() => this.dimensionner());
    this.obs.observe(canvas);
    this.brancher();
    this.auto = !document.documentElement.classList.contains('calme') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(this.anim);
    this.derniere = performance.now();
    const boucle = t => {
      if (!this.canvas || !this.canvas.isConnected) { this.anim = null; if (this.obs) this.obs.disconnect(); return; }
      const dt = Math.min(60, t - this.derniere); this.derniere = t; this.t = t;
      if (this.cible) this.avancerVersCible(t);
      else if (this.auto && !this.tire) this.rot[0] += dt * 0.006;
      this.dessiner();
      this.anim = requestAnimationFrame(boucle);
    };
    this.anim = requestAnimationFrame(boucle);
  },
  lireCouleurs() {
    const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
    const clair = document.documentElement.dataset.theme === 'light';
    this.couleurs = { o1: v('--ocean-1'), o2: v('--ocean-2'), terre: clair ? '#FFFFFF' : 'rgba(226,216,255,.26)', bord: v('--terre-bord'),
      visite: v('--pays-visite'), avenir: v('--pays-avenir'), reve: v('--pays-reve'), accent: v('--accent'), clair,
      halo: clair ? 'rgba(130,100,220,.28)' : 'rgba(185,168,240,.35)', grat: clair ? 'rgba(96,74,170,.14)' : 'rgba(255,255,255,.09)' };
  },
  dimensionner() {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.taille = Math.max(260, r.width);
    this.canvas.width = this.taille * this.dpr; this.canvas.height = this.taille * this.dpr;
  },
  rayon() { return this.taille * 0.41 * this.zoom; },
  dessiner() {
    const c = this.ctx, T = this.taille, R = this.rayon(), C = this.couleurs, cx = T / 2, cy = T / 2;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, T, T);
    this.proj.scale(R).translate([cx, cy]).rotate(this.rot);
    /* l'atmosphère */
    const h = c.createRadialGradient(cx, cy, R * .92, cx, cy, R * 1.16);
    h.addColorStop(0, C.halo); h.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = h; c.beginPath(); c.arc(cx, cy, R * 1.16, 0, Math.PI * 2); c.fill();
    /* l'océan */
    const o = c.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    o.addColorStop(0, C.o1); o.addColorStop(1, C.o2);
    c.fillStyle = o; c.beginPath(); this.chemin({ type: 'Sphere' }); c.fill();
    c.strokeStyle = C.grat; c.lineWidth = .7; c.beginPath(); this.chemin(d3.geoGraticule10()); c.stroke();
    /* les terres */
    const { statut } = this.statuts || (this.statuts = statutsPays());
    FORMES.forEach(f => {
      const s = f.code && statut[f.code];
      c.beginPath(); this.chemin(f);
      c.fillStyle = s ? C[s] : C.terre;
      if (f === this.survol) c.fillStyle = s ? C[s] : C.accent;
      c.globalAlpha = (f === this.survol && !s) ? .55 : (s === 'reve' ? .8 : 1);
      c.fill();
    });
    c.globalAlpha = 1;
    c.strokeStyle = C.bord; c.lineWidth = .6; c.beginPath(); this.chemin(FRONTIERES); c.stroke();
    if (this.survol) { c.strokeStyle = C.clair ? '#2E2358' : '#fff'; c.lineWidth = 1.4; c.beginPath(); this.chemin(this.survol); c.stroke(); }
    /* la brillance */
    const b = c.createRadialGradient(cx - R * .45, cy - R * .5, 0, cx - R * .3, cy - R * .35, R * 1.1);
    b.addColorStop(0, 'rgba(255,255,255,.22)'); b.addColorStop(.5, 'rgba(255,255,255,0)'); b.addColorStop(1, 'rgba(0,0,0,.18)');
    c.fillStyle = b; c.beginPath(); this.chemin({ type: 'Sphere' }); c.fill();
    /* les marques, seulement sur la face visible */
    const centre = [-this.rot[0], -this.rot[1]];
    const k = Math.max(.8, Math.min(1.6, R / 210));
    const liste = Object.entries(statut).filter(([code]) => PAYS[code]).map(([code, s]) => ({ p: PAYS[code], s }))
      .filter(m => d3.geoDistance([m.p.lng, m.p.lat], centre) < Math.PI / 2 - .08)
      .sort((a, b) => a.p.lat - b.p.lat).reverse();
    liste.forEach(({ p, s }) => {
      const [x, y] = this.proj([p.lng, p.lat]);
      const bord = d3.geoDistance([p.lng, p.lat], centre) / (Math.PI / 2);
      c.globalAlpha = Math.max(.25, 1 - Math.pow(bord, 4));
      this.marque(s, x, y, k);
    });
    c.globalAlpha = 1;
  },
  marque(s, x, y, k) {
    const c = this.ctx, C = this.couleurs;
    c.save(); c.translate(x, y); c.scale(k, k);
    if (s === 'visite') {
      c.fillStyle = C.visite; c.strokeStyle = '#fff'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(0, 0, 6.5, 0, Math.PI * 2); c.fill(); c.stroke();
      c.lineWidth = 1.9; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-2.9, .1); c.lineTo(-.8, 2.3); c.lineTo(3.1, -2.2); c.stroke();
    } else if (s === 'avenir') {
      const bob = Math.sin(this.t / 420 + x) * 1.4;
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, 0, 3, 1.1, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -11 + bob); c.stroke();
      c.fillStyle = C.avenir; c.beginPath(); c.arc(0, -14 + bob, 4.8, 0, Math.PI * 2); c.fill(); c.lineWidth = 1.4; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(-1.4, -15.4 + bob, 1.3, 0, Math.PI * 2); c.fill();
    } else if (s === 'reve') {
      c.fillStyle = C.reve; c.strokeStyle = '#fff'; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(0, 4); c.bezierCurveTo(-5.8, 0, -5.5, -4.5, -2.7, -4.7); c.bezierCurveTo(-1.2, -4.8, -.4, -3.9, 0, -3);
      c.bezierCurveTo(.4, -3.9, 1.2, -4.8, 2.7, -4.7); c.bezierCurveTo(5.5, -4.5, 5.8, 0, 0, 4); c.fill(); c.stroke();
    }
    c.restore();
  },
  /* ce qu'il y a sous le pointeur */
  pays(ev) {
    const r = this.canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * this.taille / r.width, y = (ev.clientY - r.top) * this.taille / r.height;
    const R = this.rayon(); if (Math.hypot(x - this.taille / 2, y - this.taille / 2) > R) return null;
    const centre = [-this.rot[0], -this.rot[1]];
    /* d'abord les petits pays marqués ou non, visés à quelques pixels près */
    for (const p of PETITS_PAYS) {
      if (d3.geoDistance([p.lng, p.lat], centre) > Math.PI / 2) continue;
      const q = this.proj([p.lng, p.lat]);
      if (q && Math.hypot(q[0] - x, q[1] - y) < 7) return { code: p.code, forme: null };
    }
    const ll = this.proj.invert([x, y]); if (!ll) return null;
    const f = FORMES.find(f => f.code && d3.geoContains(f, ll));
    return f ? { code: f.code, forme: f } : null;
  },
  brancher() {
    const cv = this.canvas;
    let depart = null, bouge = false;
    const bulle = $('#infobulle');
    cv.onpointerdown = e => {
      cv.setPointerCapture(e.pointerId); this.tire = true; bouge = false; this.cible = null;
      depart = { x: e.clientX, y: e.clientY, rot: this.rot.slice() }; cv.classList.add('tire');
    };
    cv.onpointermove = e => {
      if (this.tire && depart) {
        const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) bouge = true;
        const k = 75 / this.rayon();
        this.rot = [depart.rot[0] + dx * k, Math.max(-85, Math.min(85, depart.rot[1] - dy * k)), 0];
        bulle.classList.remove('vis');
        return;
      }
      const t = e.pointerType === 'mouse' ? this.pays(e) : null;
      this.survol = t && t.forme;
      if (t) { bulle.textContent = PAYS[t.code].nom; bulle.style.left = e.clientX + 14 + 'px'; bulle.style.top = e.clientY + 12 + 'px'; bulle.classList.add('vis'); }
      else bulle.classList.remove('vis');
    };
    const fin = e => {
      if (!this.tire) return;
      this.tire = false; cv.classList.remove('tire');
      if (!bouge && e.type === 'pointerup') { const t = this.pays(e); if (t && this.surClic) this.surClic(t.code, e.clientX, e.clientY); }
      depart = null;
    };
    cv.onpointerup = fin; cv.onpointercancel = fin;
    cv.onpointerleave = () => { this.survol = null; bulle.classList.remove('vis'); };
    cv.onwheel = e => { e.preventDefault(); this.zoomer(e.deltaY < 0 ? 1.12 : 1 / 1.12); };
  },
  zoomer(f) { this.zoom = Math.max(.7, Math.min(4.5, this.zoom * f)); },
  tournerVers(code) {
    const p = PAYS[code]; if (!p) return;
    let l0 = this.rot[0], l1 = -p.lng;
    while (l1 - l0 > 180) l1 -= 360; while (l1 - l0 < -180) l1 += 360;
    this.cible = { de: this.rot.slice(), vers: [l1, -p.lat * .85, 0], t0: performance.now(), d: 1100 };
    this.auto = false;
  },
  avancerVersCible(t) {
    const q = Math.min(1, (t - this.cible.t0) / this.cible.d), e = q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
    this.rot = this.cible.de.map((a, i) => a + (this.cible.vers[i] - a) * e);
    if (q >= 1) this.cible = null;
  },
  rafraichir() { this.statuts = null; this.lireCouleurs(); }
};
