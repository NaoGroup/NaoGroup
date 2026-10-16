'use strict';
/* ============================================================
   NaoRoots — les gestes : navigation, formulaires (personnes, liens,
   photos, histoires, documents, sources, questions, arbres), la
   corbeille, l'amélioration de photo, l'impression (arbre, frise,
   livre de famille), le GEDCOM, les invitations, la sauvegarde,
   la réinitialisation, le thème et le décor animé.
   ============================================================ */

const ACT = {};

/* ---------- navigation ---------- */
function allerA(vue) {
  if (vue !== 'fiche') U.avant = null;
  U.vue = vue; history.replaceState(null, '', '#' + vue);
  rendre(); scrollTo({ top: 0, behavior: 'smooth' });
}
document.addEventListener('click', e => {
  const n = e.target.closest('#scene [data-noeud]');
  if (n) {
    /* un clic sur la personne déjà au centre : Famille ⇄ Sablier (ses ascendants et ses descendants seulement) */
    if (n.dataset.noeud === (U.focus || racineCourante()) && (U.mode === 'sablier' || U.mode === 'lignee')) { U.mode = U.mode === 'sablier' ? 'lignee' : 'sablier'; toast(U.mode === 'lignee' ? '⏳ Sablier : seulement les ascendants et les descendants' : '👨‍👩‍👧 Famille : avec frères, sœurs et conjoints'); }
    U.focus = n.dataset.noeud; rendre(); return;
  }
  const f = e.target.closest('[data-fantome]');
  if (f && f.closest('#scene')) { if (peutModifier()) formProche(f.dataset.pour, { rel: 'parent' }); return; }
  const v = e.target.closest('[data-vue]');
  if (v && !e.target.closest('[data-act]')) { e.preventDefault(); if ($('#modale').classList.contains('ouvert')) fermerModale(); allerA(v.dataset.vue); return; }
  const a = e.target.closest('[data-act]');
  if (!a || !ACT[a.dataset.act]) return;
  if (a.tagName === 'A') e.preventDefault();
  if (a.type === 'checkbox') { ACT[a.dataset.act](a, e); return; }
  ACT[a.dataset.act](a, e);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-noeud], [data-fantome]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
});
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ONGLETS.some(o => o.id === h) && h !== U.vue) { U.vue = h; rendre(); } });
document.addEventListener('input', e => {
  if (e.target.id === 'chercheFamille') {
    U.q = e.target.value; rendre();
    const n = $('#chercheFamille'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'choixArbre') { S.reglages.arbre = t.value; U.focus = null; sauver(); rendre(); }
  if (t.id === 'choixGen') { U.gen = +t.value; rendre(); if (U.gen >= 99) setTimeout(() => ACT['zoom']({ dataset: { id: 'ajuster' } }), 30); }
  if (t.id === 'filtreFrise') { U.filtreFrise = t.value; rendre(); }
});

ACT['vue'] = el => allerA(el.dataset.id);
ACT['fiche'] = el => { if ($('#modale').classList.contains('ouvert')) fermerModale(); if (U.vue !== 'fiche') U.avant = U.vue; U.pid = el.dataset.id; U.vue = 'fiche'; history.replaceState(null, '', '#fiche'); rendre(); scrollTo({ top: 0, behavior: 'smooth' }); };
ACT['retour'] = () => allerA(U.avant || 'famille');
ACT['ancre'] = el => { const b = document.getElementById(el.dataset.id); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
ACT['arbre-mode'] = el => { U.mode = el.dataset.id; if (U.mode === 'eventail' && U.gen < 3) U.gen = 4; rendre(); };
ACT['arbre-sens'] = el => { U.sens = el.dataset.id; rendre(); };
ACT['arbre-focus'] = el => { U.focus = el.dataset.id; if (U.vue !== 'arbre') allerA('arbre'); else rendre(); };
ACT['arbre-centre'] = () => { U.focus = null; rendre(); };
ACT['arbre-racine'] = el => { const a = arbreCourant(); if (!a) return; a.racine = el.dataset.id; sauver(); rendre(); toast('« ' + nomComplet(personne(a.racine)) + ' » est maintenant au centre de l’arbre.'); };
ACT['zoom'] = el => {
  if (el.dataset.id === 'ajuster') {
    const sc = $('#scene'), svg = sc && sc.querySelector('svg'); if (!svg || sc.clientWidth < 50 || sc.clientHeight < 50) return;
    const vb = svg.viewBox.baseVal, z = Math.min((sc.clientWidth - 16) / vb.width, (sc.clientHeight - 16) / vb.height);
    U.zoom = Math.max(.15, Math.min(2, Math.floor(z * 100) / 100));
  } else U.zoom = el.dataset.id === '0' ? 1 : Math.max(.15, Math.min(2.5, Math.round((U.zoom + (el.dataset.id === '+' ? .15 : -.15)) * 100) / 100));
  rendre();
};
/* L'arbre en plein écran : toute la fenêtre (et tout l'écran si le navigateur le permet). */
ACT['plein-ecran'] = () => {
  U.plein = !U.plein;
  document.body.classList.toggle('arbre-plein', U.plein);
  try { if (U.plein && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else if (!U.plein && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  rendre();
  if (U.plein) setTimeout(() => ACT['zoom']({ dataset: { id: 'ajuster' } }), 60);
};
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && U.plein) { U.plein = false; document.body.classList.remove('arbre-plein'); rendre(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && U.plein && !$('#modale').classList.contains('ouvert')) ACT['plein-ecran'](); });
ACT['filtre-branche'] = el => { U.filtreBranche = el.dataset.id; rendre(); };
ACT['histoires-genre'] = el => { U.genreH = el.dataset.id; rendre(); };
ACT['albums-vue'] = el => { U.albums = el.dataset.id; U.album = null; rendre(); };
ACT['album-ouvrir'] = el => { U.album = el.dataset.id; if (U.vue !== 'albums') allerA('albums'); else { rendre(); scrollTo({ top: 0, behavior: 'smooth' }); } };
ACT['album-fermer'] = () => { U.album = null; U.albums = 'albums'; rendre(); };
ACT['docs-vue'] = el => { U.docs = el.dataset.id; rendre(); };
ACT['frise-vue'] = el => { U.frise = el.dataset.id; rendre(); };
ACT['frise-carte'] = () => { U.frise = 'carte'; allerA('frise'); };
ACT['carte-monde'] = () => { U.monde = !U.monde; rendre(); };

/* Après chaque rendu : l'arbre se centre sur la personne choisie et se déplace à la souris. */
function apresRendu() {
  const sc = $('#scene'); if (!sc) return;
  const f = sc.querySelector('.noeud.focus');
  if (f) { const a = sc.getBoundingClientRect(), b = f.getBoundingClientRect(); sc.scrollLeft += (b.left + b.width / 2) - (a.left + a.width / 2); sc.scrollTop += (b.top + b.height / 2) - (a.top + a.height / 2); }
  let dep = null, bouge = false;
  sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; dep = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; bouge = false; });
  sc.addEventListener('pointermove', e => {
    if (!dep) return;
    const dx = e.clientX - dep.x, dy = e.clientY - dep.y;
    if (!bouge && Math.hypot(dx, dy) > 5) { bouge = true; sc.classList.add('glisse'); }
    if (bouge) { sc.scrollLeft = dep.l - dx; sc.scrollTop = dep.t - dy; }
  });
  const fin = () => { dep = null; setTimeout(() => sc.classList.remove('glisse'), 0); };
  sc.addEventListener('pointerup', fin); sc.addEventListener('pointerleave', fin);
  sc.addEventListener('click', e => { if (bouge) { e.stopPropagation(); e.preventDefault(); bouge = false; } }, true);
  /* Ctrl + molette (ou pincement sur un pavé tactile) : zoomer autour du pointeur */
  sc.addEventListener('wheel', e => {
    if (!e.ctrlKey) return; e.preventDefault();
    const r = sc.getBoundingClientRect(), fx = (sc.scrollLeft + e.clientX - r.left) / U.zoom, fy = (sc.scrollTop + e.clientY - r.top) / U.zoom;
    U.zoom = Math.max(.15, Math.min(2.5, Math.round(U.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12) * 100) / 100));
    rendre(); const s2 = $('#scene'); if (s2) { s2.scrollLeft = fx * U.zoom - (e.clientX - r.left); s2.scrollTop = fy * U.zoom - (e.clientY - r.top); }
  }, { passive: false });
}

/* ============================================================
   Morceaux de formulaire
   ============================================================ */
function champDate(nomD, nomQ, lib, v, q) {
  return `<div class="champ"><label>${lib} <small>jj/mm/aaaa, mm/aaaa ou aaaa</small></label><div class="ligne-date">
    <select name="${nomQ}" aria-label="Précision">${Object.entries(PRECISIONS).map(([k, x]) => `<option value="${k}"${(q || 'exacte') === k ? ' selected' : ''}>${x.nom}</option>`).join('')}</select>
    <input name="${nomD}" value="${esc(saisieDate(v))}" placeholder="ex. 1932 ou 12/03/1932" inputmode="numeric" autocomplete="off"></div></div>`;
}
function lireDates(o, noms) {
  for (const n of noms) {
    const v = lireDate(o[n]);
    if (v === null) return `La date « ${o[n]} » n'est pas lisible. Écrivez par exemple 1932, 03/1932 ou 12/03/1932.`;
    o[n] = v;
  }
  return null;
}
const champCert = (nom, lib, v) => `<div class="champ"><label>${lib}</label><select name="${nom}">${optionsCert(v)}</select></div>`;
function champConfid(x, defaut = 'prive') {
  const v = (x && x.confid) || defaut;
  return `<div class="champ plein"><span class="lab">Confidentialité</span><div class="choix grand">${Object.entries(CONFID).map(([k, c]) => `<label><input type="radio" name="confid" value="${k}"${v === k ? ' checked' : ''}><span>${c.e} <b>${c.nom}</b><small>${c.d}</small></span></label>`).join('')}</div></div>`;
}
function champPersonnes(sel, lib = 'Personnes concernées', nom = 'personnes') {
  const l = actifs('personnes').filter(p => !p.masque || U.recu).sort((a, b) => nomComplet(a).localeCompare(nomComplet(b)));
  return `<div class="champ plein"><span class="lab">${lib}</span>${l.length ? `<div class="qui">${l.map(p => `<label><input type="checkbox" name="${nom}" value="${p.id}" data-multi="1"${(sel || []).includes(p.id) ? ' checked' : ''}>${esc(nomComplet(p))} <small style="color:var(--ink-3)">${esc([periode(p), parentsDe(p.id).length ? genre(p, 'fille', 'fils', 'enfant') + ' de ' + parentsDe(p.id).map(x => prenomDe(x.p)).join(' et ') : ''].filter(Boolean).join(' · '))}</small></label>`).join('')}</div>` : '<small style="color:var(--ink-3)">Aucune personne dans l’arbre.</small>'}</div>`;
}
function champSources(sel) {
  const l = S.sources.filter(s => !s.supprime);
  return `<div class="champ plein"><span class="lab">Sources <small>— d'où vient l'information ?</small></span>
    ${l.length ? `<div class="qui" style="max-height:140px">${l.map(s => `<label><input type="checkbox" name="sources" value="${s.id}" data-multi="1"${(sel || []).includes(s.id) ? ' checked' : ''}>${typeSource(s.type).e} ${esc(s.titre)} <small style="color:var(--ink-3)">${esc(typeSource(s.type).nom)}</small></label>`).join('')}</div>` : ''}
    <div class="champs" style="margin-top:6px"><select name="srcType" aria-label="Type de la nouvelle source">${Object.entries(TYPES_SOURCE).map(([k, t]) => `<option value="${k}">${t.e} ${t.nom}</option>`).join('')}</select>
      <input name="srcTitre" placeholder="＋ Nouvelle source (ex. « Témoignage de tante Marie, 2024 »)" autocomplete="off"></div></div>`;
}
/* La nouvelle source saisie dans le formulaire, créée au moment d'enregistrer. */
function sourceDuForm(o) {
  const ids = (o.sources || []).slice();
  if (o.srcTitre) { const s = { id: uid(), type: o.srcType || 'temoignage', titre: o.srcTitre, cree: maintenant() }; S.sources.push(s); ids.push(s.id); }
  delete o.srcTitre; delete o.srcType; return ids;
}
function qualifier(cert, ids, quoi) {
  return certAcceptable(cert);
}
function brancherForm(f) { $$('[data-f="annuler"]', f).forEach(b => b.addEventListener('click', fermerModale)); }
const piedForm = (gauche, lib = 'Enregistrer') => `<div class="pied-fen">${gauche || ''}<div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button class="btn" type="submit">${lib}</button></div></div>`;
const btnCorbeille = (k, id) => `<button type="button" class="btn fin petit" data-act="corbeille-mettre" data-k="${k}" data-id="${id}">🗑️ Mettre à la corbeille</button>`;
const erreur = (f, t) => { let z = $('.err-form', f); if (!z) { z = document.createElement('div'); z.className = 'note douce err-form'; $('.pied-fen', f).before(z); } z.innerHTML = `<span class="e">⚠️</span><div>${esc(t)}</div>`; z.scrollIntoView({ block: 'nearest' }); };

/* ============================================================
   Les arbres
   ============================================================ */
function nouvelArbre(racine, o = {}) {
  const a = Object.assign({ id: uid(), nom: 'Notre arbre familial', type: 'principal', racine, portee: 'tout', branches: {}, cree: maintenant() }, o);
  S.arbres.push(a); S.reglages.arbre = a.id; return a;
}
ACT['commencer'] = () => formPersonne(null, { premier: true });
ACT['arbres-gerer'] = () => {
  const l = actifs('arbres');
  ouvrirModale(`<h3 id="modaleTitre">🌳 Mes arbres</h3><p class="sous">Plusieurs regards sur la même famille : famille maternelle, paternelle, arbre du couple, d'un enfant ou d'une branche. Une personne n'est saisie qu'une fois.</p>
    <div class="lignes">${l.map(a => { const inv = S.invitations.filter(x => !x.supprime && x.arbre === a.id).length; return `<div class="ligne"><div class="pic">${(TYPES_ARBRE[a.type] || {}).e || '🌳'}</div>
      <div class="corps"><div class="t">${esc(a.nom)}</div><div class="s"><span>Centre : ${esc(nomComplet(personne(a.racine)) || '—')}</span><span>${membresArbre(a).length} personnes</span>
        <span>${inv ? '👥 Partagé avec ' + inv + ' proche' + (inv > 1 ? 's' : '') : '🔒 Privé — jamais public'}</span></div></div>
      <div class="fin-l"><button type="button" class="btn petit fin" data-f="choisir" data-id="${a.id}">Afficher</button><button type="button" class="ico-btn" data-f="modifier" data-id="${a.id}" aria-label="Modifier">✏️</button></div></div>`; }).join('')}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button><button type="button" class="btn" data-f="nouveau">＋ Créer un arbre</button></div></div>`, f => {
    brancherForm(f);
    $$('[data-f="choisir"]', f).forEach(b => b.addEventListener('click', () => { S.reglages.arbre = b.dataset.id; U.focus = null; sauver(); fermerModale(); allerA('arbre'); }));
    $$('[data-f="modifier"]', f).forEach(b => b.addEventListener('click', () => formArbre(arbre(b.dataset.id))));
    $('[data-f="nouveau"]', f).addEventListener('click', () => formArbre(null));
  });
};
function formArbre(a) {
  const ps = actifs('personnes').sort((x, y) => nomComplet(x).localeCompare(nomComplet(y)));
  const x = a || { type: 'maternel', racine: racineCourante(), portee: 'ascendants', branches: {} };
  ouvrirModale(`<h3 id="modaleTitre">${a ? '✏️ Modifier l’arbre' : '🌳 Nouvel arbre'}</h3>
    <form id="fArbre" autocomplete="off"><div class="champs">
      <div class="champ plein"><label for="aNom">Nom de l'arbre</label><input id="aNom" name="nom" value="${esc(x.nom || '')}" placeholder="ex. Famille maternelle, Les Joseph de Martinique…" required></div>
      <div class="champ"><label>Type</label><select name="type">${Object.entries(TYPES_ARBRE).map(([k, t]) => `<option value="${k}"${x.type === k ? ' selected' : ''}>${t.e} ${t.nom}</option>`).join('')}</select></div>
      <div class="champ"><label>Personne au centre</label><select name="racine">${ps.map(p => `<option value="${p.id}"${x.racine === p.id ? ' selected' : ''}>${esc(nomComplet(p))}</option>`).join('')}</select></div>
      <div class="champ plein"><span class="lab">Qui fait partie de cet arbre ?</span><div class="choix">
        ${[['tout', 'Toute la famille reliée'], ['ascendants', 'Ses ancêtres seulement'], ['descendants', 'Ses descendants seulement']].map(([k, n]) => `<label><input type="radio" name="portee" value="${k}"${(x.portee || 'tout') === k ? ' checked' : ''}>${n}</label>`).join('')}</div></div>
      <div class="champ plein"><span class="lab">Noms des branches <small>— les lignées des quatre grands-parents de la personne au centre (facultatif)</small></span>
        <div class="champs">${[1, 2, 3, 4].map(i => `<input name="b${i}" value="${esc((x.branches || {})[i] || '')}" placeholder="${esc(BRANCHES[i].nom)}" style="border-left:6px solid ${BRANCHES[i].c}">`).join('')}</div></div>
    </div>
    <div class="note promesse"><span class="e">🔒</span><div>Un arbre est <b>toujours privé</b>. Il ne devient visible par un proche que si vous préparez vous-même une invitation, après confirmation.</div></div>
    ${piedForm(a && actifs('arbres').length > 1 ? `<button type="button" class="btn fin petit" data-f="suppr">🗑️ Supprimer cet arbre</button>` : '')}</form>`, f => {
    brancherForm(f);
    const s = $('[data-f="suppr"]', f);
    if (s) s.addEventListener('click', async () => { if (!await confirmer('Supprimer l’arbre « ' + a.nom + ' » ?', 'Seul ce regard sur la famille disparaît (il va à la corbeille) : les personnes, photos et histoires restent.', 'Mettre à la corbeille')) return; a.supprime = maintenant(); if (S.reglages.arbre === a.id) S.reglages.arbre = null; sauver(); rendre(); });
    $('#fArbre', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      const d = { nom: o.nom || TYPES_ARBRE[o.type].nom, type: o.type, racine: o.racine, portee: o.portee, branches: { 1: o.b1, 2: o.b2, 3: o.b3, 4: o.b4 } };
      if (a) Object.assign(a, d); else nouvelArbre(o.racine, d);
      U.focus = null; sauver(); fermerModale(); allerA('arbre');
    });
  });
}

/* ============================================================
   Les personnes
   ============================================================ */
function formPersonne(p, pre = {}) {
  const x = p || { confid: 'invites', nCert: 'verifier', dCert: 'verifier', bio: {}, sources: [] };
  let photo = x.photo || null;
  const titre = pre.premier ? '🌱 La première personne de l’arbre' : pre.relie ? '👤 ' + esc(pre.relie.titre) : p ? '✏️ ' + esc(nomComplet(p)) : '👤 Ajouter une personne';
  ouvrirModale(`<h3 id="modaleTitre">${titre}</h3>
    ${pre.premier ? '<p class="sous">Vous, un enfant, un parent, une grand-mère… Elle sera au centre de votre premier arbre. Seul le prénom est nécessaire : tout le reste peut attendre.</p>' : ''}
    ${pre.relie ? `<p class="sous">${pre.relie.texte}</p>` : ''}
    <form id="fPers" autocomplete="off">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><span class="rond" id="pRond" style="--c:#8E7BD4;width:64px;height:64px;font-size:24px">${photo ? `<img src="${photo}" alt="">` : '?'}</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn petit fin" data-f="photo">📷 Portrait</button><button type="button" class="btn petit fin" data-f="sansphoto"${photo ? '' : ' hidden'}>Retirer</button>
          <input type="file" id="pPhoto" accept="image/*" hidden></div></div>
      <div class="champs">
        <div class="champ"><label for="pPrenom">Prénom(s)</label><input id="pPrenom" name="prenom" value="${esc(x.prenom || '')}" autofocus></div>
        <div class="champ"><label>Nom de naissance</label><input name="nom" value="${esc(x.nom || pre.nom || '')}"></div>
        <div class="champ"><label>Surnom <small>(« Man Rose », « Papi Jo »…)</small></label><input name="surnom" value="${esc(x.surnom || '')}"></div>
        <div class="champ"><label>Nom d'usage <small>(facultatif)</small></label><input name="nomUsage" value="${esc(x.nomUsage || '')}"></div>
        <div class="champ"><label>Sexe <small>(facultatif — sert aux mots « grand-mère », « oncle »…)</small></label><select name="sexe"><option value="">Non précisé</option>${Object.entries(SEXES).map(([k, n]) => `<option value="${k}"${x.sexe === k ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="champ"><label>Profession</label><input name="profession" value="${esc(x.profession || '')}"></div>
      </div>
      <h4>Naissance</h4><div class="champs">${champDate('nD', 'nQ', 'Date', x.nD, x.nQ)}<div class="champ"><label>Lieu</label><input name="nLieu" value="${esc(x.nLieu || '')}" placeholder="Ville, région, île, pays…"></div>${champCert('nCert', 'Certitude', x.nCert)}</div>
      <div class="choix" style="margin:12px 0 4px"><label><input type="checkbox" name="decede" id="pDecede"${estDecede(x) ? ' checked' : ''}> Cette personne est décédée</label></div>
      <div id="pDeces"${estDecede(x) ? '' : ' hidden'}><div class="champs">${champDate('dD', 'dQ', 'Date du décès', x.dD, x.dQ)}<div class="champ"><label>Lieu du décès</label><input name="dLieu" value="${esc(x.dLieu || '')}"></div>${champCert('dCert', 'Certitude', x.dCert)}</div></div>
      <details class="plus-d"${pre.onglet === 'bio' ? ' open' : ''}><summary>📖 Biographie (enfance, études, métiers, lieux de vie, passions…)</summary>
        <div class="champs">${BIO.map(([k, n]) => `<div class="champ"><label>${n}</label><textarea name="bio_${k}">${esc((x.bio || {})[k] || '')}</textarea></div>`).join('')}</div></details>
      <div class="champ"><label>Notes</label><textarea name="notes">${esc(x.notes || '')}</textarea></div>
      ${champSources(x.sources)}
      <div class="champs">${champConfid(x, 'invites')}
        <div class="champ"><label>Couleur de branche <small>(sinon, automatique)</small></label><select name="couleur"><option value="">Automatique</option>${BRANCHES.map((b, i) => `<option value="${b.c}"${x.couleur === b.c ? ' selected' : ''}>${i ? 'Couleur ' + i : 'Lavande'}</option>`).join('')}</select></div></div>
      <div class="note bleue" style="margin-top:12px"><span class="e">🌱</span><div>Si la personne est vivante (et surtout si elle est mineure), ses détails sont automatiquement masqués dans les exports et les invitations, sauf choix contraire de votre part.</div></div>
      ${piedForm(p ? btnCorbeille('personnes', p.id) : '', p ? 'Enregistrer' : pre.premier ? '🌳 Planter l’arbre' : 'Ajouter')}
    </form>`, f => {
    brancherForm(f);
    const maj = () => { $('#pRond', f).innerHTML = photo ? `<img src="${photo}" alt="">` : esc((($('#pPrenom', f).value || '?').charAt(0)).toUpperCase()); $('[data-f="sansphoto"]', f).hidden = !photo; };
    $('#pPrenom', f).addEventListener('input', maj); maj();
    $('[data-f="photo"]', f).addEventListener('click', () => $('#pPhoto', f).click());
    $('[data-f="sansphoto"]', f).addEventListener('click', () => { photo = null; maj(); });
    $('#pPhoto', f).addEventListener('change', async e => { const fi = e.target.files[0]; if (!fi) return; try { photo = await portrait(fi); maj(); } catch (err) { toast('Cette image n’a pas pu être lue.'); } });
    $('#pDecede', f).addEventListener('change', e => { $('#pDeces', f).hidden = !e.target.checked; });
    $('#fPers', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      if (!o.prenom && !o.nom && !o.surnom) return erreur(f, 'Indiquez au moins un prénom, un nom ou un surnom.');
      const pb = lireDates(o, ['nD', 'dD']); if (pb) return erreur(f, pb);
      if (o.nD && o.dD && o.dD < o.nD) return erreur(f, 'La date de décès est antérieure à la date de naissance.');
      const bio = {}; BIO.forEach(([k]) => { bio[k] = o['bio_' + k]; delete o['bio_' + k]; });
      const sources = sourceDuForm(o);
      const d = Object.assign(o, { bio, sources, photo, decede: !!o.decede });
      if (!d.decede) { d.dD = ''; d.dLieu = ''; }
      d.nCert = d.nD || d.nLieu ? qualifier(d.nCert, sources, 'la naissance') : 'verifier';
      d.dCert = d.dD || d.dLieu ? qualifier(d.dCert, sources, 'le décès') : 'verifier';
      let cible = p;
      if (p) { Object.assign(p, d, { maj: maintenant() }); }
      else {
        cible = Object.assign({ id: uid(), cree: maintenant(), citations: [] }, d); S.personnes.push(cible);
        if (pre.premier || !actifs('arbres').length) nouvelArbre(cible.id);
        if (pre.relie) creerLiens(pre.relie, cible.id);
      }
      sauver(); fermerModale();
      if (pre.premier) { U.focus = null; allerA('arbre'); toast('🌱 Votre arbre est planté ! Ajoutez maintenant ses proches.'); return; }
      if (pre.relie) { U.focus = pre.relie.cible; }
      rendre(); toast(p ? 'Fiche enregistrée ✓' : nomComplet(cible) + ' a rejoint l’arbre 🌿');
    });
  });
}
ACT['personne-ajouter'] = () => actifs('personnes').length ? formPersonne(null) : formPersonne(null, { premier: true });
ACT['personne-modifier'] = el => formPersonne(personne(el.dataset.id), { onglet: el.dataset.onglet });

/* ---------- ajouter un proche : on part toujours d'une personne ---------- */
const RELATIONS = [
  ['parent', '👪 Un parent', 'Mère, père, parent adoptif, beau-parent…'], ['enfant', '👶 Un enfant', 'Enfant, enfant adopté, enfant du conjoint…'],
  ['conjoint', '💞 Un·e conjoint·e', 'Mariage, PACS, union libre'], ['ex', '💔 Un·e ex-conjoint·e', 'Séparés ou divorcés'],
  ['fratrie', '👫 Un frère ou une sœur', 'Avec les mêmes parents, ou un seul en commun'], ['grandparent', '🧓 Un grand-parent', 'Le parent d’un de ses parents'],
  ['oncle', '🧑‍🤝‍🧑 Un oncle ou une tante', 'Le frère ou la sœur d’un de ses parents'], ['cousin', '🧒 Un cousin ou une cousine', 'L’enfant d’un oncle ou d’une tante'],
  ['autre', '🕊️ Un lien important', 'Parrain, marraine, lien de cœur…']
];
function formProche(id, o = {}) {
  const x = personne(id); if (!x) return;
  const parents = parentsDe(id).map(q => q.p), oncles = parents.flatMap(q => fratrieDe(q.id).map(f => f.p)), conj = conjointsDe(id).map(q => q.p);
  const autres = actifs('personnes').filter(p => p.id !== id).sort((a, b) => nomComplet(a).localeCompare(nomComplet(b)));
  const sel = (nom, l, vide) => `<select name="${nom}">${vide ? `<option value="">${vide}</option>` : ''}${l.map(p => `<option value="${p.id}">${esc(nomComplet(p))}</option>`).join('')}</select>`;
  ouvrirModale(`<h3 id="modaleTitre">＋ Ajouter un proche de ${esc(prenomDe(x))}</h3>
    <p class="sous">Choisissez le lien. NaoRoots ne relie jamais deux personnes tout seul : chaque lien est posé par vous, avec son niveau de certitude.</p>
    <form id="fProche" autocomplete="off">
      <div class="champ"><span class="lab">Quel lien avec ${esc(prenomDe(x))} ?</span><div class="choix grand">${RELATIONS.map(([k, n, d]) => `<label><input type="radio" name="rel" value="${k}"${(o.rel || 'parent') === k ? ' checked' : ''}><span>${n}<small>${d}</small></span></label>`).join('')}</div></div>
      <div id="prPrecision"></div>
      <div class="champs">
        <div class="champ"><span class="lab">Qui ?</span><div class="choix"><label><input type="radio" name="qui" value="nouveau"${o.existant ? '' : ' checked'}> Une nouvelle personne</label><label><input type="radio" name="qui" value="existant"${o.existant ? ' checked' : ''}${autres.length ? '' : ' disabled'}> Quelqu'un déjà dans l'arbre</label></div></div>
        <div class="champ" id="prExistant"${o.existant ? '' : ' hidden'}><label>Personne</label>${sel('existant', autres)}</div>
        ${champCert('cert', 'Certitude du lien', 'verifier')}
      </div>
      <div class="note douce" id="prAvert" hidden></div>
      ${piedForm('', 'Continuer →')}
    </form>`, f => {
    brancherForm(f);
    const zone = $('#prPrecision', f), av = $('#prAvert', f);
    const maj = () => {
      const r = $('input[name=rel]:checked', f).value; av.hidden = true; let h = '';
      const nature = (cat, def) => `<div class="champ"><label>Nature du lien</label><select name="nature">${Object.entries(cat).filter(([k]) => k !== 'fratrie').map(([k, n]) => `<option value="${k}"${def === k ? ' selected' : ''}>${n.e ? n.e + ' ' : ''}${n.nom}${n.d ? ' — ' + n.d : ''}</option>`).join('')}</select></div>`;
      if (r === 'parent') { h = nature(NATURES_PARENT, 'biologique'); if (parents.filter(q => (lienEntre('parent', q.id, id) || {}).nature !== 'beau').length >= 2) { av.hidden = false; av.innerHTML = '<span class="e">ℹ️</span><div>' + esc(prenomDe(x)) + ' a déjà deux parents. Pour un beau-parent ou une famille d’accueil, choisissez la nature correspondante.</div>'; } }
      else if (r === 'enfant') h = nature(NATURES_PARENT, 'biologique').replace('Nature du lien', 'Nature du lien (côté parent)') + (conj.length ? `<div class="champ"><label>L'autre parent <small>(facultatif)</small></label>${sel('autreParent', conj, '— non renseigné —')}</div>` : '');
      else if (r === 'conjoint') h = nature({ mariage: NATURES_UNION.mariage, pacs: NATURES_UNION.pacs, union: NATURES_UNION.union }, 'mariage') + `<div class="champs">${champDate('debut', 'debutQ', 'Date de l’union', '', '')}<div class="champ"><label>Lieu</label><input name="lieu"></div></div>`;
      else if (r === 'ex') h = `<div class="champs">${champDate('debut', 'debutQ', 'Début de l’union', '', '')}${champDate('fin', 'finQ', 'Séparation / divorce', '', '')}</div><div class="choix" style="margin-bottom:10px"><label><input type="checkbox" name="etaitMariage"> Ils étaient mariés</label></div>`;
      else if (r === 'fratrie') h = parents.length ? `<div class="champ"><span class="lab">Parents en commun <small>(décochez pour un demi-frère ou une demi-sœur)</small></span><div class="choix">${parents.map(q => `<label><input type="checkbox" name="partage" value="${q.id}" data-multi="1" checked> ${esc(nomComplet(q))}</label>`).join('')}</div></div>`
        : '<div class="note bleue"><span class="e">ℹ️</span><div>Les parents ne sont pas encore dans l’arbre : le lien frère / sœur sera posé directement. Vous pourrez relier les parents plus tard.</div></div>';
      else if (r === 'grandparent') h = parents.length ? `<div class="champ"><label>Parent de quel parent ?</label>${sel('via', parents)}</div>${nature(NATURES_PARENT, 'biologique')}` : '';
      else if (r === 'oncle') h = parents.length ? `<div class="champ"><label>Frère ou sœur de quel parent ?</label>${sel('via', parents)}</div>` : '';
      else if (r === 'cousin') h = oncles.length ? `<div class="champ"><label>Enfant de quel oncle ou de quelle tante ?</label>${sel('via', oncles)}</div>` : '';
      else if (r === 'autre') h = `<div class="champs"><div class="champ"><label>Nature</label><select name="nature"><option value="parrainage">🕊️ Parrain / marraine de ${esc(prenomDe(x))}</option><option value="coeur">💜 Lien de cœur</option></select></div><div class="champ"><label>Précision <small>(facultatif)</small></label><input name="libelle" placeholder="ex. Marraine, Nounou de toujours…"></div></div>`;
      if ((r === 'grandparent' || r === 'oncle') && !parents.length) { av.hidden = false; av.innerHTML = '<span class="e">🌱</span><div>Ajoutez d’abord le parent concerné de ' + esc(prenomDe(x)) + ' : NaoRoots ne crée pas de parent inconnu à votre place.</div>'; }
      if (r === 'cousin' && !oncles.length) { av.hidden = false; av.innerHTML = '<span class="e">🌱</span><div>Ajoutez d’abord l’oncle ou la tante concerné·e (frère ou sœur d’un parent).</div>'; }
      zone.innerHTML = h;
    };
    $$('input[name=rel]', f).forEach(i => i.addEventListener('change', maj)); maj();
    $$('input[name=qui]', f).forEach(i => i.addEventListener('change', () => { $('#prExistant', f).hidden = $('input[name=qui]:checked', f).value !== 'existant'; }));
    $('#fProche', f).addEventListener('submit', e => {
      e.preventDefault(); const v = lireForm(e.target);
      if (!av.hidden && /Ajoutez d’abord/.test(av.textContent)) return;
      const pb = lireDates(v, ['debut', 'fin'].filter(k => k in v)); if (pb) return erreur(f, pb);
      const spec = { rel: v.rel, cible: id, nature: v.nature, cert: v.cert, debut: v.debut, debutQ: v.debutQ, fin: v.fin, finQ: v.finQ, lieu: v.lieu, via: v.via, partage: v.partage || [], autreParent: v.autreParent, libelle: v.libelle, etaitMariage: v.etaitMariage };
      const nomRel = { parent: 'un parent', enfant: 'un enfant', conjoint: 'un·e conjoint·e', ex: 'un·e ex-conjoint·e', fratrie: 'un frère ou une sœur', grandparent: 'un grand-parent', oncle: 'un oncle ou une tante', cousin: 'un cousin ou une cousine', autre: 'un lien important' }[v.rel];
      if (v.qui === 'existant') {
        if (v.existant === id) return;
        creerLiens(spec, v.existant); sauver(); fermerModale(); U.focus = id; rendre(); toast('Lien ajouté ✓ (' + certDe(spec.cert).nom.toLowerCase() + ')'); return;
      }
      spec.titre = 'Ajouter ' + nomRel + ' de ' + prenomDe(x);
      spec.texte = 'Ce lien sera noté « ' + certDe(v.cert).nom.toLowerCase() + ' ». Seul le prénom est nécessaire.';
      formPersonne(null, { relie: spec, nom: ['parent', 'enfant', 'fratrie'].includes(v.rel) && v.nature === 'biologique' ? '' : '' });
    });
  });
}
ACT['proche-ajouter'] = el => formProche(el.dataset.id);
ACT['lien-relier'] = el => formProche(el.dataset.id, { existant: true });
function lien(t, a, b, o = {}) {
  if (a === b || lienEntre(t, a, b)) return null;
  const l = Object.assign({ id: uid(), t, a, b, cert: 'verifier', cree: maintenant(), sources: [] }, o);
  S.liens.push(l); memo = {}; return l;
}
/* Pose les liens décrits par le formulaire « ajouter un proche », et seulement ceux-là. */
function creerLiens(s, nouveau) {
  const c = { cert: s.cert || 'verifier' };
  if (s.rel === 'parent') lien('parent', nouveau, s.cible, Object.assign({ nature: s.nature || 'biologique' }, c));
  else if (s.rel === 'enfant') { lien('parent', s.cible, nouveau, Object.assign({ nature: s.nature || 'biologique' }, c)); if (s.autreParent) lien('parent', s.autreParent, nouveau, Object.assign({ nature: 'biologique' }, c)); }
  else if (s.rel === 'conjoint') lien('union', s.cible, nouveau, Object.assign({ nature: s.nature || 'union', debut: s.debut, debutQ: s.debutQ, lieu: s.lieu }, c));
  else if (s.rel === 'ex') lien('union', s.cible, nouveau, Object.assign({ nature: 'ex', debut: s.debut, debutQ: s.debutQ, fin: s.fin, finQ: s.finQ, etaitMariage: !!s.etaitMariage }, c));
  else if (s.rel === 'fratrie') { if (s.partage.length) s.partage.forEach(pid => lien('parent', pid, nouveau, Object.assign({ nature: 'biologique' }, c))); else lien('autre', s.cible, nouveau, Object.assign({ nature: 'fratrie' }, c)); }
  else if (s.rel === 'grandparent') lien('parent', nouveau, s.via, Object.assign({ nature: s.nature || 'biologique' }, c));
  else if (s.rel === 'oncle') { const gp = parentsDe(s.via).filter(x => x.lien.nature !== 'beau'); if (gp.length) gp.forEach(g => lien('parent', g.p.id, nouveau, Object.assign({ nature: 'biologique' }, c))); else lien('autre', s.via, nouveau, Object.assign({ nature: 'fratrie' }, c)); }
  else if (s.rel === 'cousin') lien('parent', s.via, nouveau, Object.assign({ nature: 'biologique' }, c));
  else if (s.rel === 'autre') lien('autre', nouveau, s.cible, Object.assign({ nature: s.nature || 'coeur', libelle: s.libelle }, c));
}
ACT['lien-modifier'] = el => {
  const l = S.liens.find(x => x.id === el.dataset.id); if (!l) return;
  const a = personne(l.a), b = personne(l.b);
  const titre = l.t === 'parent' ? `${esc(prenomDe(a))} → parent de → ${esc(prenomDe(b))}` : l.t === 'union' ? `${esc(prenomDe(a))} ♥ ${esc(prenomDe(b))}` : `${esc(prenomDe(a))} · ${esc(prenomDe(b))}`;
  const cat = l.t === 'parent' ? NATURES_PARENT : l.t === 'union' ? NATURES_UNION : NATURES_AUTRE;
  ouvrirModale(`<h3 id="modaleTitre">🔗 ${titre}</h3><p class="sous">Précisez ce lien : sa nature, son niveau de certitude et sa source.</p>
    <form id="fLien" autocomplete="off"><div class="champs">
      <div class="champ"><label>Nature</label><select name="nature">${Object.entries(cat).map(([k, n]) => `<option value="${k}"${(l.nature || '') === k ? ' selected' : ''}>${n.e ? n.e + ' ' : ''}${n.nom}</option>`).join('')}</select></div>
      ${champCert('cert', 'Certitude', l.cert)}
      ${l.t === 'union' ? champDate('debut', 'debutQ', 'Début de l’union / mariage', l.debut, l.debutQ) + champDate('fin', 'finQ', 'Fin (séparation, divorce)', l.fin, l.finQ) + `<div class="champ"><label>Lieu</label><input name="lieu" value="${esc(l.lieu || '')}"></div>` : ''}
      ${l.t === 'autre' ? `<div class="champ"><label>Précision</label><input name="libelle" value="${esc(l.libelle || '')}"></div>` : ''}
      <div class="champ plein"><label>Notes</label><textarea name="notes">${esc(l.notes || '')}</textarea></div>
      ${champSources(l.sources)}</div>
      ${piedForm(`<button type="button" class="btn fin petit" data-f="suppr">✂️ Retirer ce lien</button>`)}</form>`, f => {
    brancherForm(f);
    $('[data-f="suppr"]', f).addEventListener('click', async () => {
      if (!await confirmer('Retirer ce lien ?', 'Les deux fiches restent ; seul le lien entre elles va à la corbeille.', 'Retirer le lien')) return;
      l.supprime = maintenant(); sauver(); rendre(); toast('Lien retiré.', { action: 'Annuler', fait: () => { l.supprime = null; sauver(); rendre(); } });
    });
    $('#fLien', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      const pb = lireDates(o, ['debut', 'fin'].filter(k => k in o)); if (pb) return erreur(f, pb);
      o.sources = sourceDuForm(o); o.cert = qualifier(o.cert, o.sources, 'ce lien');
      Object.assign(l, o); sauver(); fermerModale(); rendre(); toast('Lien précisé ✓');
    });
  });
};
ACT['citation-ajouter'] = el => {
  const p = personne(el.dataset.id); if (!p) return;
  ouvrirModale(`<h3 id="modaleTitre">💬 Une citation de ${esc(prenomDe(p))}</h3><p class="sous">Une expression, un dicton, un surnom, une petite phrase qu'on répète encore dans la famille.</p>
    <form id="fCit"><div class="champ"><label>La phrase</label><textarea name="t" required autofocus></textarea></div>
      <div class="champ"><label>Contexte <small>(quand le disait-${genre(p, 'elle', 'il', 'iel')} ? que veut-elle dire ?)</small></label><input name="ctx"></div>
      ${(p.citations || []).length ? `<h4>Déjà notées</h4><div class="lignes">${p.citations.map((c, i) => `<div class="ligne compacte"><div class="corps"><div class="t" style="font-style:italic;white-space:normal">« ${esc(c.t)} »</div></div><button type="button" class="ico-btn" data-f="suppr" data-i="${i}" aria-label="Retirer">✕</button></div>`).join('')}</div>` : ''}
      ${piedForm()}</form>`, f => {
    brancherForm(f);
    $$('[data-f="suppr"]', f).forEach(b => b.addEventListener('click', () => { p.citations.splice(+b.dataset.i, 1); sauver(); rendre(); ACT['citation-ajouter'](el); }));
    $('#fCit', f).addEventListener('submit', e => { e.preventDefault(); const o = lireForm(e.target); if (!o.t) return; (p.citations = p.citations || []).push(o); sauver(); fermerModale(); rendre(); toast('Citation gardée 💬'); });
  });
};

/* ============================================================
   Les événements
   ============================================================ */
function formEvenement(ev, pre = {}) {
  const x = ev || { type: 'demenagement', personnes: pre.pour ? [pre.pour] : [], cert: 'verifier', sources: [] };
  ouvrirModale(`<h3 id="modaleTitre">${ev ? '✏️ Modifier l’événement' : '🗓️ Ajouter un événement'}</h3>
    <form id="fEv" autocomplete="off"><div class="champs">
      <div class="champ"><label>Type</label><select name="type">${Object.entries(TYPES_EVENEMENT).map(([k, t]) => `<option value="${k}"${x.type === k ? ' selected' : ''}>${t.e} ${t.nom}</option>`).join('')}</select></div>
      <div class="champ"><label>Titre <small>(facultatif)</small></label><input name="titre" value="${esc(x.titre || '')}" placeholder="ex. Arrivée à Paris, CAP de couture…"></div>
      ${champDate('date', 'dateQ', 'Date', x.date, x.dateQ)}<div class="champ"><label>Lieu</label><input name="lieu" value="${esc(x.lieu || '')}"></div>
      <div class="champ plein"><label>Ce qui s'est passé</label><textarea name="desc">${esc(x.desc || '')}</textarea></div>
      ${champPersonnes(x.personnes)}${champCert('cert', 'Certitude', x.cert)}
      ${champSources(x.sources)}</div>
      ${piedForm(ev ? btnCorbeille('evenements', ev.id) : '')}</form>`, f => {
    brancherForm(f);
    $('#fEv', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      o.personnes = o.personnes || []; o.sources = sourceDuForm(o); o.cert = qualifier(o.cert, o.sources, 'cet événement');
      if (ev) Object.assign(ev, o); else S.evenements.push(Object.assign({ id: uid(), cree: maintenant() }, o));
      sauver(); fermerModale(); rendre(); toast('Événement enregistré ✓');
    });
  });
}
/* « Je le sais » : confirmer d'un clic, sans rouvrir le formulaire. */
ACT['certifier'] = el => {
  const k = el.dataset.k, x = S[k].find(y => y.id === el.dataset.id); if (!x) return;
  const champs = k === 'personnes' ? (el.dataset.champ ? [el.dataset.champ + 'Cert'] : ['nCert', 'dCert'].filter(c => c === 'nCert' ? (x.nD || x.nLieu) : (x.dD || x.dLieu))) : ['cert'];
  const avant = champs.map(c => x[c]);
  champs.forEach(c => { x[c] = 'confirme'; });
  sauver(); rendre();
  toast('Marqué « confirmé » ✓', { action: 'Annuler', fait: () => { champs.forEach((c, i) => { x[c] = avant[i]; }); sauver(); rendre(); } });
};
ACT['evenement-ajouter'] = el => formEvenement(null, { pour: el.dataset.pour });
ACT['evenement-modifier'] = el => formEvenement(S.evenements.find(x => x.id === el.dataset.id));

/* ============================================================
   Les photos
   ============================================================ */
function champAlbums(sel) {
  const l = S.albums.filter(a => !a.supprime);
  return `<div class="champ plein"><span class="lab">Albums</span><div class="choix">${l.map(a => `<label><input type="checkbox" name="albums" value="${a.id}" data-multi="1"${(sel || []).includes(a.id) ? ' checked' : ''}>${esc(a.e || '')} ${esc(a.nom)}</label>`).join('')}
    <input name="nouvelAlbum" placeholder="＋ Nouvel album" style="padding:7px 11px;border-radius:999px;border:1px dashed var(--bord-2);background:transparent;font-family:var(--ui);font-size:13px;min-width:150px"></div></div>`;
}
function albumDuForm(o) {
  const ids = (o.albums || []).slice();
  if (o.nouvelAlbum) { const s = ALBUMS_SUGGERES.find(([n]) => sansAccent(n) === sansAccent(o.nouvelAlbum)); const a = { id: uid(), nom: o.nouvelAlbum, e: s ? s[1] : '🖼️', cree: maintenant() }; S.albums.push(a); ids.push(a.id); }
  delete o.nouvelAlbum; return ids;
}
function champsPhoto(x) {
  return `<div class="champs">
    <div class="champ plein"><label>Légende</label><input name="legende" value="${esc(x.legende || '')}" placeholder="ex. Communion de Julien, devant l’église"></div>
    ${champPersonnes(x.personnes, 'Personnes présentes <small>— laissez vide si vous ne savez pas : la photo ira dans « À identifier »</small>')}
    ${champDate('date', 'dateQ', 'Date (même approximative)', x.date, x.dateQ || 'vers')}<div class="champ"><label>Lieu</label><input name="lieu" value="${esc(x.lieu || '')}"></div>
    <div class="champ plein"><label>Événement</label><input name="evenement" value="${esc(x.evenement || '')}" placeholder="Mariage, Noël 1975, vacances à…"></div>
    <div class="champ plein"><label>Le souvenir associé</label><textarea name="souvenir">${esc(x.souvenir || '')}</textarea></div>
    ${U.recu ? '' : champAlbums(x.albums)}${U.recu ? '' : champConfid(x, 'invites')}</div>`;
}
ACT['photo-ajouter'] = el => {
  const pre = { personnes: el.dataset.pour ? [el.dataset.pour] : [], albums: el.dataset.album ? [el.dataset.album] : [] };
  let fichiers = [];
  ouvrirModale(`<h3 id="modaleTitre">📷 Ajouter des photos${U.recu ? ' <span class="badge mini">proposition</span>' : ''}</h3>
    <p class="sous">Une ou plusieurs photos : les informations ci-dessous s'appliquent à toutes. Les photos restent dans ce navigateur.</p>
    <form id="fPhoto" autocomplete="off">
      <div class="fichier-zone" style="margin-bottom:12px"><button type="button" class="btn petit" data-f="choisir">🖼️ Choisir des photos</button><span class="nom" id="phNoms">Aucune photo choisie</span>
        <input type="file" id="phFichiers" accept="image/*" multiple hidden></div>
      ${champsPhoto(pre)}
      ${piedForm('', U.recu ? 'Proposer' : 'Ajouter')}</form>`, f => {
    brancherForm(f);
    $('[data-f="choisir"]', f).addEventListener('click', () => $('#phFichiers', f).click());
    $('#phFichiers', f).addEventListener('change', e => { fichiers = Array.from(e.target.files).filter(x => /^image\//.test(x.type)); $('#phNoms', f).textContent = fichiers.length ? fichiers.length + ' photo' + (fichiers.length > 1 ? 's' : '') + ' : ' + fichiers.map(x => x.name).join(', ') : 'Aucune photo choisie'; });
    $('#fPhoto', f).addEventListener('submit', async e => {
      e.preventDefault(); if (!fichiers.length) return erreur(f, 'Choisissez au moins une photo.');
      const o = lireForm(e.target); const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      const btn = $('button[type=submit]', f); btn.disabled = true; btn.textContent = 'Un instant…';
      o.personnes = o.personnes || [];
      if (U.recu) {
        const r = recuActif();
        for (const fi of fichiers) { try { const im = await preparerImage(fi); r.contributions.push({ id: uid(), t: 'photo', cree: maintenant(), data: Object.assign({}, o, { vignette: await blobEnTexte(im.vignette), image: await blobEnTexte(await canvasBlob(versCanvas(await chargerImage(URL.createObjectURL(im.grande)), 1200))) }) }); } catch (err) {} }
        sauver(); fermerModale(); rendre(); toast('Proposition gardée : pensez à « Renvoyer mes ajouts ».'); return;
      }
      o.albums = albumDuForm(o); let n = 0;
      for (const fi of fichiers) {
        try {
          const im = await preparerImage(fi), id = uid(), cle = 'p-' + id;
          await fichierMettre(cle, { blob: im.grande, nom: fi.name, type: 'image/jpeg' }); await fichierMettre(cle + '-v', { blob: im.vignette, type: 'image/jpeg' });
          S.photos.push(Object.assign({ id, fichier: cle, nomFichier: fi.name, cree: maintenant() }, o, { legende: fichiers.length > 1 && !o.legende ? '' : o.legende })); n++;
        } catch (err) { toast('« ' + fi.name + ' » n’a pas pu être lue.'); }
      }
      sauver(); fermerModale(); rendre(); toast(n + ' photo' + (n > 1 ? 's' : '') + ' ajoutée' + (n > 1 ? 's' : '') + ' 📷');
    });
  });
};
const MENTION_IA = 'Cette image a été améliorée ou colorisée par intelligence artificielle ; les couleurs et détails sont une interprétation visuelle, non une reconstitution historique certaine.';
ACT['photo-ouvrir'] = el => ouvrirPhoto(el.dataset.id);
function ouvrirPhoto(id) {
  const ph = photo(id); if (!ph) return;
  const voitAmelioree = ph.amelioree && ph.voirAmelioree !== false;
  const grande = ph.grandeData ? `<img src="${ph.grandeData}" alt="">` : imgPhoto(ph, true);
  const lecture = !peutModifier();
  ouvrirModale(`<h3 id="modaleTitre">📷 ${esc(ph.legende || 'Photo')}</h3>
    <div class="visionneuse">${grande}</div>
    ${voitAmelioree ? `<div class="mention-ia"><span>✨</span><div>${esc(MENTION_IA)}</div></div>` : ''}
    ${lecture ? `<p class="sous">${esc([ph.date ? texteDate(ph.date, ph.dateQ) : '', ph.lieu, ph.evenement].filter(Boolean).join(' · '))}</p>${ph.souvenir ? `<p style="font-style:italic">${esc(ph.souvenir)}</p>` : ''}${nomsDe(ph.personnes, 12)}
      <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`
    : `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button type="button" class="btn petit fin" data-f="ameliorer">✨ Améliorer la photo (facultatif)</button>
        ${ph.amelioree ? `<button type="button" class="btn petit fin" data-f="basculer">${voitAmelioree ? '🖼️ Afficher l’original' : '✨ Afficher la version améliorée'}</button><button type="button" class="btn petit fin" data-f="retirer-amelioration">Supprimer la version améliorée</button>` : ''}
        ${(ph.albums || []).length ? `<button type="button" class="btn petit fin" data-f="couverture">⭐ Couverture de l'album</button>` : ''}
        <button type="button" class="btn petit fin" data-f="telecharger">⬇️ Enregistrer sur l'ordinateur</button></div>
      <form id="fPhotoInfo" autocomplete="off">${champsPhoto(ph)}${piedForm(btnCorbeille('photos', ph.id))}</form>`}`, f => {
    brancherForm(f);
    if (lecture) return;
    $('[data-f="ameliorer"]', f).addEventListener('click', () => formAmeliorer(ph));
    const b = $('[data-f="basculer"]', f); if (b) b.addEventListener('click', () => { ph.voirAmelioree = !voitAmelioree; sauver(); rendre(); ouvrirPhoto(ph.id); });
    const r = $('[data-f="retirer-amelioration"]', f); if (r) r.addEventListener('click', async () => {
      if (!await confirmer('Supprimer la version améliorée ?', 'L’original est conservé tel quel.', 'Supprimer la version améliorée')) return;
      await fichierSuppr(ph.amelioree).catch(() => {}); await fichierSuppr(ph.amelioree + '-v').catch(() => {}); oublierUrl(ph.amelioree); oublierUrl(ph.amelioree + '-v');
      ph.amelioree = null; ph.amelioration = null; sauver(); rendre(); ouvrirPhoto(ph.id);
    });
    const c = $('[data-f="couverture"]', f); if (c) c.addEventListener('click', () => { (ph.albums || []).forEach(aid => { const a = album(aid); if (a) a.couverture = ph.id; }); sauver(); toast('Couverture choisie ⭐'); });
    $('[data-f="telecharger"]', f).addEventListener('click', async () => { const v = await fichierLire(voitAmelioree ? ph.amelioree : ph.fichier).catch(() => null); if (v) telecharger((ph.legende ? nomFichier(ph.legende) : 'photo') + (voitAmelioree ? '-amelioree' : '') + '.jpg', v.blob); });
    $('#fPhotoInfo', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target); const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      o.personnes = o.personnes || []; o.albums = albumDuForm(o); Object.assign(ph, o); sauver(); fermerModale(); rendre(); toast('Photo enregistrée ✓');
    });
  }, true);
}

/* ---------- l'amélioration de photo (facultative) ----------
   Traitements automatiques faits dans le navigateur : netteté, correction
   légère des niveaux, restauration légère (atténuation du grain), et une
   colorisation en tons doux. L'original est toujours conservé. */
const AMELIORATIONS = {
  nettete: { nom: 'Netteté', d: 'Rend les contours un peu plus nets.' },
  correction: { nom: 'Correction légère', d: 'Rééquilibre la lumière et le contraste.' },
  restauration: { nom: 'Restauration légère', d: 'Atténue le grain et les petites taches, ravive un tirage pâli.' },
  colorisation: { nom: 'Colorisation', d: 'Donne des tons de couleur doux à une photo en noir et blanc — une interprétation, pas la réalité.' }
};
function niveaux(d, force = 1) {
  const n = d.length / 4, h = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < d.length; i += 4) { h[0][d[i]]++; h[1][d[i + 1]]++; h[2][d[i + 2]]++; }
  const bornes = h.map(t => { let a = 0, lo = 0, hi = 255; for (let i = 0; i < 256; i++) { a += t[i]; if (a > n * .008) { lo = i; break; } } a = 0; for (let i = 255; i >= 0; i--) { a += t[i]; if (a > n * .008) { hi = i; break; } } return [lo, Math.max(lo + 1, hi)]; });
  for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) { const [lo, hi] = bornes[c], v = (d[i + c] - lo) * 255 / (hi - lo); d[i + c] = Math.max(0, Math.min(255, d[i + c] + (v - d[i + c]) * force)); }
}
function flou(d, w, h) {
  const o = new Uint8ClampedArray(d.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) {
    let s = 0, k = 0;
    for (let dy = -1; dy <= 1; dy++) { const yy = y + dy; if (yy < 0 || yy >= h) continue; for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx < 0 || xx >= w) continue; s += d[(yy * w + xx) * 4 + c]; k++; } }
    o[(y * w + x) * 4 + c] = s / k;
  }
  for (let i = 3; i < d.length; i += 4) o[i] = d[i];
  return o;
}
function traiter(canvas, mode) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height, im = ctx.getImageData(0, 0, w, h), d = im.data;
  if (mode === 'correction') niveaux(d, .85);
  else if (mode === 'nettete') { const b = flou(d, w, h); for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, d[i + c] + .9 * (d[i + c] - b[i + c]))); }
  else if (mode === 'restauration') { const b = flou(d, w, h); for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * .45 + b[i + c] * .55; niveaux(d, .7); }
  else if (mode === 'colorisation') {
    niveaux(d, .6);
    const pal = [[0, [34, 30, 52]], [.35, [104, 84, 78]], [.6, [186, 146, 118]], [.8, [214, 196, 170]], [1, [248, 242, 228]]];
    const teinte = l => { for (let k = 1; k < pal.length; k++) if (l <= pal[k][0]) { const [a, ca] = pal[k - 1], [b, cb] = pal[k], t = (l - a) / (b - a); return ca.map((v, j) => v + (cb[j] - v) * t); } return pal[pal.length - 1][1]; };
    for (let i = 0; i < d.length; i += 4) { const l = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255, t = teinte(l); for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * .3 + t[c] * .7; }
  }
  ctx.putImageData(im, 0, 0); return canvas;
}
async function formAmeliorer(ph) {
  const v = await fichierLire(ph.fichier).catch(() => null); if (!v) return toast('L’original de cette photo est introuvable.');
  const url = URL.createObjectURL(v.blob), img = await chargerImage(url);
  ouvrirModale(`<h3 id="modaleTitre">✨ Améliorer la photo</h3><p class="sous">Facultatif. L'original est toujours conservé : la version améliorée s'ajoute à côté, et vous pouvez revenir à l'original à tout moment.</p>
    <div class="choix grand" style="margin-bottom:12px">${Object.entries(AMELIORATIONS).map(([k, a], i) => `<label><input type="radio" name="mode" value="${k}"${i === 1 ? ' checked' : ''}><span><b>${a.nom}</b><small>${a.d}</small></span></label>`).join('')}</div>
    <div class="compare"><figure><img id="amOrig" alt="Original">Original</figure><figure><img id="amRes" alt="Résultat">Résultat</figure></div>
    <div class="mention-ia"><span>✨</span><div>${esc(MENTION_IA)}</div></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="button" class="btn" data-f="garder">Garder cette version</button></div></div>`, f => {
    brancherForm(f);
    $('#amOrig', f).src = url;
    const apercu = () => { const m = $('input[name=mode]:checked', f).value; $('#amRes', f).src = traiter(versCanvas(img, 700), m).toDataURL('image/jpeg', .85); };
    $$('input[name=mode]', f).forEach(i => i.addEventListener('change', apercu)); setTimeout(apercu, 30);
    $('[data-f="garder"]', f).addEventListener('click', async e => {
      e.target.disabled = true; e.target.textContent = 'Un instant…';
      const m = $('input[name=mode]:checked', f).value, c = traiter(versCanvas(img, 1800), m), cle = 'a-' + ph.id + '-' + Date.now().toString(36);
      if (ph.amelioree) { await fichierSuppr(ph.amelioree).catch(() => {}); await fichierSuppr(ph.amelioree + '-v').catch(() => {}); }
      await fichierMettre(cle, { blob: await canvasBlob(c), type: 'image/jpeg' }); await fichierMettre(cle + '-v', { blob: await canvasBlob(versCanvas(c, 360), .8), type: 'image/jpeg' });
      ph.amelioree = cle; ph.amelioration = { mode: m, date: maintenant() }; ph.voirAmelioree = true;
      URL.revokeObjectURL(url); sauver(); rendre(); ouvrirPhoto(ph.id); toast('Version améliorée gardée — l’original est conservé.');
    });
  }, true);
}

/* ---------- les albums ---------- */
function formAlbum(a) {
  const x = a || { e: '🖼️' };
  ouvrirModale(`<h3 id="modaleTitre">${a ? '✏️ Modifier l’album' : '📚 Créer un album'}</h3>
    ${a ? '' : `<div class="puces" style="margin-bottom:12px">${ALBUMS_SUGGERES.map(([n, e]) => `<button type="button" class="puce" data-f="sugg" data-n="${esc(n)}" data-e="${e}">${e} ${esc(n)}</button>`).join('')}</div>`}
    <form id="fAlbum" autocomplete="off"><div class="champs"><div class="champ"><label>Nom de l'album</label><input name="nom" id="alNom" value="${esc(x.nom || '')}" required></div>
      <div class="champ"><label>Emoji</label><input name="e" id="alE" value="${esc(x.e || '')}" maxlength="4"></div>
      <div class="champ plein"><label>Description</label><textarea name="desc">${esc(x.desc || '')}</textarea></div></div>
      ${piedForm(a ? btnCorbeille('albums', a.id) : '')}</form>`, f => {
    brancherForm(f);
    $$('[data-f="sugg"]', f).forEach(b => b.addEventListener('click', () => { $('#alNom', f).value = b.dataset.n; $('#alE', f).value = b.dataset.e; }));
    $('#fAlbum', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      if (a) Object.assign(a, o); else { const n = Object.assign({ id: uid(), cree: maintenant() }, o); S.albums.push(n); U.album = n.id; }
      sauver(); fermerModale(); if (U.vue !== 'albums') allerA('albums'); else rendre();
    });
  });
}
ACT['album-ajouter'] = () => formAlbum(null);
ACT['album-modifier'] = el => formAlbum(album(el.dataset.id));

/* ============================================================
   Les histoires, et les témoignages audio (avec accord)
   ============================================================ */
let enreg = null;
window.arreterEnregistrement = () => { if (enreg && enreg.rec && enreg.rec.state === 'recording') enreg.rec.stop(); if (enreg && enreg.flux) enreg.flux.getTracks().forEach(t => t.stop()); enreg = null; };
function formHistoire(h, pre = {}) {
  const x = h || { genre: pre.genre || 'recit', personnes: pre.pour ? [pre.pour] : [], cert: 'tradition', confid: 'invites' };
  let audio = null, retirerAudio = false;
  const peutAudio = !U.recu && !!(navigator.mediaDevices && window.MediaRecorder);
  ouvrirModale(`<h3 id="modaleTitre">${h ? '✏️ Modifier l’histoire' : '✍️ Raconter une histoire'}${U.recu ? ' <span class="badge mini">proposition</span>' : ''}</h3>
    <form id="fHist" autocomplete="off"><div class="champs">
      <div class="champ"><label>Titre</label><input name="titre" value="${esc(x.titre || '')}" required autofocus placeholder="ex. Le colombo de Man Rose"></div>
      <div class="champ"><label>Genre</label><select name="genre">${Object.entries(GENRES_HISTOIRE).map(([k, g]) => `<option value="${k}"${x.genre === k ? ' selected' : ''}>${g.e} ${g.nom}</option>`).join('')}</select></div>
      <div class="champ plein"><label>L'histoire</label><textarea class="long" name="texte" placeholder="Racontez comme vous le diriez à voix haute…">${esc(x.texte || '')}</textarea></div>
      ${champPersonnes(x.personnes)}
      ${champDate('date', 'dateQ', 'Quand ? <small>(facultatif)</small>', x.date, x.dateQ || 'vers')}<div class="champ"><label>Où ? <small>(facultatif)</small></label><input name="lieu" value="${esc(x.lieu || '')}"></div>
      ${U.recu ? '' : champCert('cert', 'D’où vient ce récit ?', x.cert)}${U.recu ? '' : champConfid(x, 'invites')}</div>
      ${peutAudio || (h && h.audio) ? `<h4>🎙️ Témoignage audio <small style="text-transform:none;letter-spacing:0">(facultatif)</small></h4>
        <div class="enregistreur" id="hAudio">
          ${h && h.audio ? `<audio controls data-audio="${esc(h.audio.cle)}"></audio><small style="font-family:var(--ui);color:var(--ink-3)">Accord de ${esc(h.audio.consent.nom)} · ${esc(texteDate(h.audio.consent.date.slice(0, 10)))}</small><button type="button" class="btn petit fin" data-f="retirer-audio">Retirer l'enregistrement</button>`
          : `<div style="flex:1 1 100%" class="choix"><label><input type="checkbox" id="hAccord"> La personne enregistrée a donné son accord pour être enregistrée et que ce témoignage soit gardé dans NaoRoots.</label></div>
            <input name="accordNom" id="hAccordNom" placeholder="Nom de la personne enregistrée" style="flex:1;min-width:200px;padding:9px 12px;border-radius:12px;border:1px solid var(--bord);background:var(--champ)">
            <button type="button" class="btn petit" data-f="rec" disabled>🎙️ Enregistrer</button><span class="rec" id="hRec" hidden></span><span id="hTemps" style="font-family:var(--ui);font-size:13px"></span>
            <button type="button" class="btn petit fin" data-f="importer" disabled>📁 Importer un fichier audio</button><input type="file" id="hFichier" accept="audio/*" hidden><audio controls id="hEcoute" hidden></audio>`}
        </div>` : ''}
      ${piedForm(h ? btnCorbeille('histoires', h.id) : '', U.recu ? 'Proposer' : 'Enregistrer')}</form>`, f => {
    brancherForm(f);
    const lec = $('audio[data-audio]', f); if (lec) urlDe(lec.dataset.audio).then(u => { if (u) lec.src = u; });
    const ra = $('[data-f="retirer-audio"]', f); if (ra) ra.addEventListener('click', () => { retirerAudio = true; $('#hAudio', f).innerHTML = '<small style="font-family:var(--ui);color:var(--ink-3)">L’enregistrement sera retiré à l’enregistrement de l’histoire.</small>'; });
    const acc = $('#hAccord', f);
    if (acc) {
      const nomA = $('#hAccordNom', f), rec = $('[data-f="rec"]', f), imp = $('[data-f="importer"]', f);
      const ok = () => { const v = acc.checked && nomA.value.trim(); rec.disabled = !v; imp.disabled = !v; };
      acc.addEventListener('change', ok); nomA.addEventListener('input', ok);
      const montrer = b => { audio = b; const e = $('#hEcoute', f); e.hidden = false; e.src = URL.createObjectURL(b); };
      imp.addEventListener('click', () => $('#hFichier', f).click());
      $('#hFichier', f).addEventListener('change', e => { const fi = e.target.files[0]; if (fi) montrer(fi); });
      rec.addEventListener('click', async () => {
        if (enreg) { enreg.rec.stop(); return; }
        try {
          const flux = await navigator.mediaDevices.getUserMedia({ audio: true }), morceaux = [], r = new MediaRecorder(flux), t0 = Date.now();
          enreg = { rec: r, flux };
          r.ondataavailable = e => morceaux.push(e.data);
          r.onstop = () => { flux.getTracks().forEach(t => t.stop()); clearInterval(enreg && enreg.min); enreg = null; montrer(new Blob(morceaux, { type: r.mimeType || 'audio/webm' })); rec.textContent = '🎙️ Recommencer'; $('#hRec', f).hidden = true; };
          r.start(); rec.textContent = '⏹ Arrêter'; $('#hRec', f).hidden = false;
          enreg.min = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); $('#hTemps', f).textContent = Math.floor(s / 60) + ':' + z2(s % 60); }, 500);
        } catch (err) { toast('Le micro n’est pas accessible. Vous pouvez importer un fichier audio.'); }
      });
    }
    $('#fHist', f).addEventListener('submit', async e => {
      e.preventDefault(); if (enreg) { toast('Arrêtez d’abord l’enregistrement.'); return; }
      const o = lireForm(e.target); const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      o.personnes = o.personnes || []; const accordNom = o.accordNom; delete o.accordNom;
      if (U.recu) { recuActif().contributions.push({ id: uid(), t: 'histoire', cree: maintenant(), data: o }); sauver(); fermerModale(); rendre(); toast('Proposition gardée : pensez à « Renvoyer mes ajouts ».'); return; }
      const cible = h || Object.assign({ id: uid(), cree: maintenant() }); Object.assign(cible, o);
      if (retirerAudio && cible.audio) { await fichierSuppr(cible.audio.cle).catch(() => {}); oublierUrl(cible.audio.cle); cible.audio = null; }
      if (audio) { const cle = 'v-' + cible.id; await fichierMettre(cle, { blob: audio, type: audio.type || 'audio/webm', nom: 'temoignage' }); oublierUrl(cle); cible.audio = { cle, consent: { nom: accordNom, date: maintenant() } }; }
      if (!h) S.histoires.push(cible);
      sauver(); fermerModale(); rendre(); toast('Histoire gardée 📖');
    });
  });
}
ACT['histoire-ajouter'] = el => formHistoire(null, { pour: el.dataset.pour });
ACT['histoire-ouvrir'] = el => {
  const h = histoire(el.dataset.id); if (!h) return;
  ouvrirModale(`<div class="genre" style="font-family:var(--ui);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)">${genreH(h.genre).e} ${esc(genreH(h.genre).nom)}</div>
    <h3 id="modaleTitre" style="font-size:26px;margin-top:4px">${esc(h.titre)}</h3>
    <p class="sous">${esc([h.date ? texteDate(h.date, h.dateQ) : '', h.lieu].filter(Boolean).join(' · '))} ${h.cert ? badgeCert(h.cert, true) : ''}</p>
    ${h.audio ? `<div class="enregistreur" style="margin-bottom:14px"><audio controls data-audio="${esc(h.audio.cle || '')}"${h.audio.data ? ` src="${h.audio.data}"` : ''}></audio><small style="font-family:var(--ui);color:var(--ink-3)">🎙️ Enregistré avec l'accord de ${esc(h.audio.consent.nom)}</small></div>` : ''}
    <div class="recit">${esc(h.texte || '')}</div>
    <div style="margin-top:14px">${nomsDe(h.personnes, 10)}</div>
    <div class="pied-fen">${peutModifier() ? btnCorbeille('histoires', h.id) : ''}<div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button>${peutModifier() ? '<button type="button" class="btn" data-f="modifier">✏️ Modifier</button>' : ''}</div></div>`, f => {
    brancherForm(f);
    const a = $('audio[data-audio]', f); if (a && a.dataset.audio) urlDe(a.dataset.audio).then(u => { if (u) a.src = u; });
    const m = $('[data-f="modifier"]', f); if (m) m.addEventListener('click', () => formHistoire(h));
  }, true);
};

/* ============================================================
   Les documents et les sources
   ============================================================ */
function formDocument(d, pre = {}) {
  const x = d || { type: 'naissance', personnes: pre.pour ? [pre.pour] : [], confid: 'prive' };
  let fichier = null, retirer = false;
  ouvrirModale(`<h3 id="modaleTitre">${d ? '✏️ Modifier le document' : '📜 Ajouter un document'}</h3>
    <form id="fDoc" autocomplete="off"><div class="champs">
      <div class="champ"><label>Type</label><select name="type" id="dType">${Object.entries(TYPES_DOC).map(([k, t]) => `<option value="${k}"${x.type === k ? ' selected' : ''}>${t.e} ${t.nom}</option>`).join('')}</select></div>
      <div class="champ"><label>Titre</label><input name="titre" value="${esc(x.titre || '')}" placeholder="ex. Acte de naissance de Victor"></div>
      ${champDate('date', 'dateQ', 'Date du document', x.date, x.dateQ)}<div class="champ"><label>Lieu</label><input name="lieu" value="${esc(x.lieu || '')}"></div>
      <div class="champ plein"><span class="lab">Fichier <small>(PDF ou image — gardé dans ce navigateur)</small></span><div class="fichier-zone"><button type="button" class="btn petit" data-f="choisir">📎 Choisir</button>
        <span class="nom" id="dNom">${x.fichier ? esc(x.nomFichier || 'Fichier joint') : 'Aucun fichier'}</span>${x.fichier ? '<button type="button" class="btn petit fin" data-f="retirer">Retirer</button>' : ''}<input type="file" id="dFichier" hidden></div></div>
      ${champPersonnes(x.personnes)}
      <div class="champ plein"><label>Où se trouve l'original ? / Référence d'archive</label><input name="ref" value="${esc(x.ref || '')}" placeholder="ex. Chez tante Marie · Archives de Martinique, registre 1928"></div>
      <div class="champ plein"><label>Notes</label><textarea name="notes">${esc(x.notes || '')}</textarea></div>
      ${d ? '' : `<div class="champ plein"><div class="choix"><label><input type="checkbox" name="commeSource" id="dSource" checked> En faire une source pour les personnes cochées</label></div><small id="dSourceNote" style="font-family:var(--ui);color:var(--ink-3)"></small></div>`}
      ${champConfid(x, 'prive')}</div>
      ${piedForm(d ? btnCorbeille('documents', d.id) : '')}</form>`, f => {
    brancherForm(f);
    const note = () => { const n = $('#dSourceNote', f); if (n) n.textContent = typeDoc($('#dType', f).value).off ? 'Un document officiel appuie les informations des personnes cochées.' : 'Ce document sera une source « archive » ou « autre » selon son type.'; };
    $('#dType', f).addEventListener('change', note); note();
    $('[data-f="choisir"]', f).addEventListener('click', () => $('#dFichier', f).click());
    $('#dFichier', f).addEventListener('change', e => { fichier = e.target.files[0] || null; $('#dNom', f).textContent = fichier ? fichier.name + ' · ' + taille(fichier.size) : 'Aucun fichier'; });
    const r = $('[data-f="retirer"]', f); if (r) r.addEventListener('click', () => { retirer = true; fichier = null; $('#dNom', f).textContent = 'Aucun fichier'; r.hidden = true; });
    $('#fDoc', f).addEventListener('submit', async e => {
      e.preventDefault(); const o = lireForm(e.target); const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      o.personnes = o.personnes || []; o.titre = o.titre || typeDoc(o.type).nom; const commeSource = o.commeSource; delete o.commeSource;
      const cible = d || { id: uid(), cree: maintenant() }; Object.assign(cible, o);
      if ((retirer || fichier) && cible.fichier) { await fichierSuppr(cible.fichier).catch(() => {}); oublierUrl(cible.fichier); cible.fichier = null; cible.nomFichier = null; }
      if (fichier) { const cle = 'd-' + cible.id; await fichierMettre(cle, { blob: fichier, nom: fichier.name, type: fichier.type }); cible.fichier = cle; cible.nomFichier = fichier.name; cible.mime = fichier.type; cible.taille = fichier.size; }
      if (!d) {
        S.documents.push(cible);
        if (commeSource) {
          const t = typeDoc(o.type), type = t.off ? 'officiel' : ['presse', 'ancien'].includes(o.type) ? 'archive' : 'autre';
          const s = { id: uid(), type, titre: o.titre, date: o.date, ref: o.ref, docId: cible.id, cree: maintenant() }; S.sources.push(s); cible.source = s.id;
          o.personnes.forEach(pid => { const p = personne(pid); if (p) p.sources = Array.from(new Set([...(p.sources || []), s.id])); });
        }
      }
      sauver(); fermerModale(); rendre(); toast('Document gardé 📜');
    });
  });
}
ACT['document-ajouter'] = el => formDocument(null, { pour: el.dataset.pour });
ACT['document-ouvrir'] = async el => {
  const d = documentDe(el.dataset.id); if (!d) return;
  const u = d.fichier ? await urlDe(d.fichier) : null;
  const vue = u ? (/^image\//.test(d.mime || '') ? `<div class="visionneuse"><img src="${u}" alt=""></div>` : /pdf/.test(d.mime || '') ? `<div class="visionneuse"><iframe src="${u}" title="${esc(d.titre)}"></iframe></div>` : '') : '';
  ouvrirModale(`<h3 id="modaleTitre">${typeDoc(d.type).e} ${esc(d.titre)}</h3>
    <p class="sous">${esc([typeDoc(d.type).nom, d.date ? texteDate(d.date, d.dateQ) : '', d.lieu].filter(Boolean).join(' · '))} ${badgeConfid(d)}</p>
    ${vue}${d.ref ? `<p style="font-family:var(--ui);font-size:13.5px">🔖 ${esc(d.ref)}</p>` : ''}${d.notes ? `<p style="white-space:pre-line">${esc(d.notes)}</p>` : ''}
    <div>${nomsDe(d.personnes, 10)}</div>
    <div class="pied-fen">${btnCorbeille('documents', d.id)}<div class="droite">${u ? '<button type="button" class="btn fin" data-f="dl">⬇️ Enregistrer le fichier</button>' : ''}<button type="button" class="btn" data-f="modifier">✏️ Modifier</button></div></div>`, f => {
    const dl = $('[data-f="dl"]', f); if (dl) dl.addEventListener('click', async () => { const v = await fichierLire(d.fichier); if (v) telecharger(v.nom || d.nomFichier || 'document', v.blob); });
    $('[data-f="modifier"]', f).addEventListener('click', () => formDocument(d));
  }, true);
};
function formSource(s, pre = {}) {
  const x = s || { type: 'temoignage' };
  const lies = s ? actifs('personnes').filter(p => (p.sources || []).includes(s.id)).map(p => p.id) : (pre.pour ? [pre.pour] : []);
  ouvrirModale(`<h3 id="modaleTitre">${s ? '✏️ Modifier la source' : '📌 Ajouter une source'}</h3>
    <form id="fSrc" autocomplete="off"><div class="champs">
      <div class="champ"><label>Type</label><select name="type">${Object.entries(TYPES_SOURCE).map(([k, t]) => `<option value="${k}"${x.type === k ? ' selected' : ''}>${t.e} ${t.nom}</option>`).join('')}</select></div>
      <div class="champ"><label>Titre</label><input name="titre" value="${esc(x.titre || '')}" required placeholder="ex. Témoignage de Man Rose"></div>
      <div class="champ"><label>Qui témoigne ? / Auteur</label><input name="auteur" value="${esc(x.auteur || '')}"></div>
      ${champDate('date', 'dateQ', 'Date', x.date, x.dateQ)}
      <div class="champ plein"><label>Référence <small>(cote d'archive, registre, page, lien…)</small></label><input name="ref" value="${esc(x.ref || '')}"></div>
      <div class="champ plein"><label>Notes</label><textarea name="notes">${esc(x.notes || '')}</textarea></div>
      ${champPersonnes(lies, 'Cette source appuie les fiches de', 'lies')}</div>
      <div class="note bleue"><span class="e">ℹ️</span><div>C'est vous qui choisissez si une information est confirmée, probable ou à vérifier. Une source garde la trace de <b>d'où</b> elle vient : document officiel, archive, témoignage…</div></div>
      ${piedForm(s ? btnCorbeille('sources', s.id) : '')}</form>`, f => {
    brancherForm(f);
    $('#fSrc', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target); const pb = lireDates(o, ['date']); if (pb) return erreur(f, pb);
      const l = o.lies || []; delete o.lies;
      const c = s || { id: uid(), cree: maintenant() }; Object.assign(c, o); if (!s) S.sources.push(c);
      actifs('personnes').forEach(p => { const a = (p.sources || []).includes(c.id), b = l.includes(p.id); if (b && !a) p.sources = [...(p.sources || []), c.id]; if (a && !b) p.sources = p.sources.filter(id => id !== c.id); });
      sauver(); fermerModale(); rendre(); toast('Source enregistrée 📌');
    });
  });
}
ACT['source-ajouter'] = el => formSource(null, { pour: el.dataset.pour });
ACT['source-modifier'] = el => formSource(source(el.dataset.id));

/* ============================================================
   Les questions à poser à la famille
   ============================================================ */
function formQuestion(q, pre = {}) {
  const x = q || { pour: pre.pour || '', q: pre.q || '' };
  const ps = actifs('personnes').sort((a, b) => nomComplet(a).localeCompare(nomComplet(b)));
  ouvrirModale(`<h3 id="modaleTitre">💬 ${q ? 'Une question' : 'Préparer une question'}</h3><p class="sous">Les questions à poser aux anciens, tant qu'il est temps. Notez la réponse quand vous l'avez.</p>
    <form id="fQ" autocomplete="off"><div class="champ"><label>La question</label><input name="q" list="qPretes" value="${esc(x.q)}" required autofocus>
      <datalist id="qPretes">${QUESTIONS_PRETES.map(t => `<option value="${esc(t)}">`).join('')}</datalist></div>
      <div class="champs"><div class="champ"><label>À propos de</label><select name="pour"><option value="">— question générale —</option>${ps.map(p => `<option value="${p.id}"${x.pour === p.id ? ' selected' : ''}>${esc(nomComplet(p))}</option>`).join('')}</select></div>
        <div class="champ"><label>À qui la poser ?</label><input name="a" value="${esc(x.a || '')}" placeholder="ex. Tante Josiane"></div></div>
      <div class="champ"><label>La réponse</label><textarea name="reponse">${esc(x.reponse || '')}</textarea></div>
      <div class="choix"><label><input type="checkbox" name="fait"${x.fait ? ' checked' : ''}> Question posée</label></div>
      ${piedForm(q ? `<button type="button" class="btn fin petit" data-f="suppr">🗑️ Retirer</button>` : '')}</form>`, f => {
    brancherForm(f);
    const s = $('[data-f="suppr"]', f); if (s) s.addEventListener('click', () => { q.supprime = maintenant(); sauver(); fermerModale(); rendre(); });
    $('#fQ', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target); if (o.reponse && !q) o.fait = true;
      if (q) Object.assign(q, o); else S.questions.push(Object.assign({ id: uid(), cree: maintenant() }, o));
      sauver(); fermerModale(); rendre(); toast('Question gardée 💬');
    });
  });
}
ACT['question-ajouter'] = el => formQuestion(null, { pour: el.dataset.pour });
ACT['question-modifier'] = el => formQuestion(S.questions.find(x => x.id === el.dataset.id));
ACT['question-garder'] = el => { S.questions.push({ id: uid(), q: el.dataset.q, pour: el.dataset.pour || '', cree: maintenant() }); sauver(); rendre(); toast('Question ajoutée à votre liste 💬'); };
ACT['question-cocher'] = el => { const q = S.questions.find(x => x.id === el.dataset.id); if (q) { q.fait = el.checked; sauver(); setTimeout(rendre, 150); } };

/* ============================================================
   Placer un lieu sur la carte
   ============================================================ */
const CADRES = { monde: [-170, 180, 72, -56], europe: [-12, 32, 58, 34], france: [-5.5, 10, 51.5, 41], alsace: [6.6, 8.4, 49.2, 47.4], antilles: [-63.5, -59.5, 18.5, 13.5], martinique: [-61.35, -60.75, 14.95, 14.35], ocean: [40, 60, -8, -26] };
ACT['lieu-placer'] = () => {
  const inc = lieuxFamille().inconnus; let cadre = 'monde', point = null;
  ouvrirModale(`<h3 id="modaleTitre">📍 Placer un lieu</h3><p class="sous">Choisissez le lieu, zoomez sur la bonne région, puis cliquez sur la carte à l'endroit voulu.</p>
    <form id="fLieu" autocomplete="off"><div class="champs"><div class="champ"><label>Lieu</label><input name="nom" list="lieuxInc" value="${esc((inc[0] || {}).nom || '')}" required><datalist id="lieuxInc">${inc.map(l => `<option value="${esc(l.nom)}">`).join('')}</datalist></div>
      <div class="champ"><label>Région de la carte</label><select id="lCadre">${Object.keys(CADRES).map(k => `<option value="${k}">${{ monde: 'Monde', europe: 'Europe', france: 'France', alsace: 'Alsace', antilles: 'Antilles', martinique: 'Martinique', ocean: 'Océan Indien' }[k]}</option>`).join('')}</select></div></div>
      <div class="carte-lieux" id="lCarte" style="cursor:crosshair;margin-bottom:10px"></div>
      <div class="champs"><div class="champ"><label>Latitude</label><input name="lat" id="lLat" inputmode="decimal"></div><div class="champ"><label>Longitude</label><input name="lon" id="lLon" inputmode="decimal"></div></div>
      ${piedForm()}</form>`, f => {
    brancherForm(f);
    const dessine = () => {
      const pts = point ? [{ nom: $('input[name=nom]', f).value || 'Ici', lat: point.lat, lon: point.lon }] : [];
      $('#lCarte', f).innerHTML = dessinerCarte(pts, [], { cadre: CADRES[cadre] });
      const svg = $('#lCarte svg', f);
      svg.addEventListener('click', e => {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        point = { lat: Math.round(-p.y * 1000) / 1000, lon: Math.round(p.x * 1000) / 1000 }; $('#lLat', f).value = point.lat; $('#lLon', f).value = point.lon; dessine();
      });
    };
    $('#lCadre', f).addEventListener('change', e => { cadre = e.target.value; dessine(); }); dessine();
    $('#fLieu', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target), lat = parseFloat(String(o.lat).replace(',', '.')), lon = parseFloat(String(o.lon).replace(',', '.'));
      if (isNaN(lat) || isNaN(lon)) return erreur(f, 'Cliquez sur la carte pour placer le lieu.');
      S.lieux = S.lieux.filter(l => sansAccent(l.nom) !== sansAccent(o.nom)); S.lieux.push({ nom: o.nom, lat, lon });
      sauver(); fermerModale(); rendre(); toast('📍 « ' + o.nom + ' » est sur la carte.');
    });
  }, true);
};

/* ============================================================
   La corbeille : rien ne disparaît sans confirmation
   ============================================================ */
const GENRES = {
  personnes: { nom: 'Personne', e: '👤', t: x => nomComplet(x) }, photos: { nom: 'Photo', e: '📷', t: x => x.legende || 'Photo' },
  histoires: { nom: 'Histoire', e: '📖', t: x => x.titre }, documents: { nom: 'Document', e: '📜', t: x => x.titre },
  sources: { nom: 'Source', e: '📌', t: x => x.titre }, albums: { nom: 'Album', e: '📚', t: x => x.nom },
  evenements: { nom: 'Événement', e: '🗓️', t: x => x.titre || typeEv(x.type).nom }, arbres: { nom: 'Arbre', e: '🌳', t: x => x.nom },
  liens: { nom: 'Lien', e: '🔗', t: x => { const a = S.personnes.find(p => p.id === x.a), b = S.personnes.find(p => p.id === x.b); return prenomDe(a) + ' — ' + prenomDe(b); } }
};
ACT['corbeille-mettre'] = el => {
  const k = el.dataset.k, x = S[k].find(y => y.id === el.dataset.id); if (!x) return;
  x.supprime = maintenant();
  if (k === 'personnes' && U.pid === x.id && U.vue === 'fiche') U.vue = U.avant || 'famille';
  if (k === 'personnes' && U.focus === x.id) U.focus = null;
  sauver(); if ($('#modale').classList.contains('ouvert')) fermerModale(); rendre();
  toast(GENRES[k].nom + ' mise à la corbeille.', { action: 'Annuler', fait: () => { x.supprime = null; sauver(); rendre(); } });
};
async function effacerPourDeBon(k, x) {
  const fichiers = k === 'photos' ? [x.fichier, x.fichier + '-v', x.amelioree, x.amelioree && x.amelioree + '-v'] : k === 'documents' ? [x.fichier] : k === 'histoires' && x.audio ? [x.audio.cle] : [];
  for (const c of fichiers.filter(Boolean)) { await fichierSuppr(c).catch(() => {}); oublierUrl(c); }
  S[k] = S[k].filter(y => y !== x);
  if (k === 'personnes') {
    S.liens = S.liens.filter(l => l.a !== x.id && l.b !== x.id);
    ['photos', 'histoires', 'documents', 'evenements'].forEach(c => S[c].forEach(y => { if (y.personnes) y.personnes = y.personnes.filter(id => id !== x.id); }));
    S.questions = S.questions.filter(q => q.pour !== x.id);
    S.arbres.forEach(a => { if (a.racine === x.id) a.racine = (S.personnes.find(p => !p.supprime) || {}).id; });
  }
  if (k === 'sources') ['personnes', 'liens', 'evenements'].forEach(c => S[c].forEach(y => { if (y.sources) y.sources = y.sources.filter(id => id !== x.id); }));
  if (k === 'albums') S.photos.forEach(p => { if (p.albums) p.albums = p.albums.filter(id => id !== x.id); });
}
ACT['corbeille'] = () => {
  const l = Object.keys(GENRES).flatMap(k => S[k].filter(x => x.supprime).map(x => ({ k, x }))).sort((a, b) => String(b.x.supprime).localeCompare(a.x.supprime));
  ouvrirModale(`<h3 id="modaleTitre">🗑️ La corbeille</h3><p class="sous">Ce qui a été supprimé attend ici. Restaurez-le à tout moment ; la suppression définitive demande toujours une confirmation.</p>
    ${l.length ? `<div class="lignes">${l.map(({ k, x }) => `<div class="ligne compacte"><div class="pic">${GENRES[k].e}</div><div class="corps"><div class="t">${esc(GENRES[k].t(x))}</div><div class="s">${esc(GENRES[k].nom)} · supprimé le ${esc(texteDate(String(x.supprime).slice(0, 10)))}</div></div>
      <div class="fin-l"><button type="button" class="btn petit" data-f="restaurer" data-k="${k}" data-id="${x.id}">↩ Restaurer</button><button type="button" class="btn petit fin" data-f="effacer" data-k="${k}" data-id="${x.id}">Supprimer définitivement</button></div></div>`).join('')}</div>`
      : '<div class="vide">La corbeille est vide.</div>'}
    <div class="pied-fen">${l.length ? '<button type="button" class="btn fin petit" data-f="vider">Vider la corbeille</button>' : ''}<div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`, f => {
    brancherForm(f);
    $$('[data-f="restaurer"]', f).forEach(b => b.addEventListener('click', () => { const x = S[b.dataset.k].find(y => y.id === b.dataset.id); if (x) x.supprime = null; sauver(); rendre(); ACT['corbeille'](); toast('Restauré ✓'); }));
    $$('[data-f="effacer"]', f).forEach(b => b.addEventListener('click', async () => {
      const x = S[b.dataset.k].find(y => y.id === b.dataset.id); if (!x) return;
      const plus = b.dataset.k === 'personnes' ? ' Ses liens familiaux seront effacés aussi, et elle sera retirée des photos, histoires et documents.' : '';
      if (!await confirmer('Supprimer définitivement ?', `« ${esc(GENRES[b.dataset.k].t(x))} » sera effacé pour de bon.${plus} Ce geste ne peut pas être annulé.`, 'Supprimer définitivement')) { ACT['corbeille'](); return; }
      await effacerPourDeBon(b.dataset.k, x); sauver(); rendre(); ACT['corbeille']();
    }));
    const v = $('[data-f="vider"]', f); if (v) v.addEventListener('click', async () => {
      if (!await confirmer('Vider la corbeille ?', `${l.length} élément${l.length > 1 ? 's' : ''} ser${l.length > 1 ? 'ont' : 'a'} effacé${l.length > 1 ? 's' : ''} définitivement. Ce geste ne peut pas être annulé.`, 'Vider la corbeille')) { ACT['corbeille'](); return; }
      for (const { k, x } of l) await effacerPourDeBon(k, x); sauver(); rendre(); toast('Corbeille vidée.');
    });
  });
};

/* ============================================================
   Protéger les vivants : un regard temporaire sur des données masquées
   ============================================================ */
function avecMasque(o, fn) {
  const copie = Object.assign({}, D(), { personnes: D().personnes.filter(p => !p.supprime && (!o.sansPrives || p.confid !== 'prive' || !estVivant(p))).map(p => masquer(p, o)) });
  const id = '__masque'; S.recus.push({ id, donnees: copie, droit: 'lecture' });
  const avant = U.recu; U.recu = id; memo = {};
  try { return fn(); } finally { U.recu = avant; S.recus = S.recus.filter(r => r.id !== id); memo = {}; }
}
function optionsProtection(prefixe = '') {
  return `<div class="champ plein"><span class="lab">🌱 Protection des personnes vivantes</span><div class="choix grand">
    <label><input type="checkbox" name="${prefixe}vivants"><span><b>Montrer le détail des personnes vivantes majeures</b><small>Sinon, seul leur prénom apparaît.</small></span></label>
    <label><input type="checkbox" name="${prefixe}mineurs"><span><b>Montrer les mineurs</b><small>Sinon, ils apparaissent comme « Enfant », sans aucun détail.</small></span></label></div></div>`;
}

/* ============================================================
   L'impression : arbre, frise, livre de famille (→ PDF)
   ============================================================ */
async function imprimer(html) {
  const zone = $('#impression'); zone.innerHTML = html;
  await Promise.all($$('img', zone).map(i => i.complete ? Promise.resolve() : new Promise(ok => { i.onload = i.onerror = ok; })));
  const r = document.documentElement, avant = r.dataset.theme;
  r.dataset.theme = 'light';
  const fin = () => { r.dataset.theme = avant; zone.innerHTML = ''; removeEventListener('afterprint', fin); };
  addEventListener('afterprint', fin);
  setTimeout(() => window.print(), 120);
}
const noteImpr = () => `<div class="p-note">Réalisé avec NaoRoots (NaoGroup) le ${esc(texteDate(auj()))}. Les informations de cet ouvrage sont des informations familiales à vérifier, sauf mention d'une source officielle. Aucune origine n'a été déduite d'un nom, d'une photo ou d'un arbre.</div>`;
function formImpression(titre, texte, fn) {
  ouvrirModale(`<h3 id="modaleTitre">🖨️ ${titre}</h3><p class="sous">${texte} Dans la fenêtre d'impression, choisissez <b>« Enregistrer au format PDF »</b> pour obtenir un fichier.</p>
    <form id="fImpr">${optionsProtection()}${piedForm('', '🖨️ Imprimer / PDF')}</form>`, f => {
    brancherForm(f);
    $('#fImpr', f).addEventListener('submit', e => { e.preventDefault(); const o = lireForm(e.target); fermerModale(); fn(o); });
  });
}
ACT['imprimer-arbre'] = () => {
  const r = U.focus && personne(U.focus) ? U.focus : racineCourante(); if (!r) return toast('L’arbre est vide.');
  formImpression('Arbre imprimable', 'L’arbre tel qu’il est affiché (' + ({ sablier: 'famille', lignee: 'sablier', ascendants: 'ascendants', descendants: 'descendants', eventail: 'éventail' }[U.mode]) + ', ' + U.gen + ' générations).', o => {
    const a = arbreCourant();
    const svg = avecMasque(o, () => dessinerArbre(r, { mode: U.mode, sens: U.sens, gen: U.gen, impression: true, largeur: 1000 }));
    imprimer(`<div class="feuille"><h1 style="margin:0 0 2mm">${esc(a ? a.nom : 'Notre arbre familial')}</h1><p style="margin:0 0 6mm;color:#5A4F86">Autour de ${esc(nomComplet(personne(r)))}</p>${svg}${noteImpr()}</div>`);
  });
};
ACT['imprimer-frise'] = () => formImpression('Frise familiale imprimable', 'Toute la chronologie de la famille.', o => {
  const h = avecMasque(o, () => friseHTML(evenementsFrise(), true));
  imprimer(`<div class="feuille"><h1>Frise familiale</h1>${h}${noteImpr()}</div>`);
});
ACT['livre'] = () => {
  const ps = actifs('personnes').sort((a, b) => String(a.nD || '9').localeCompare(String(b.nD || '9')));
  const hs = actifs('histoires'), phs = actifs('photos'), a = arbreCourant();
  const nomFam = (personne(racineCourante()) || {}).nom || '';
  ouvrirModale(`<h3 id="modaleTitre">📕 Le livre de famille</h3><p class="sous">Choisissez ce qui entre dans le livre. Il s'ouvre ensuite dans la fenêtre d'impression : « Enregistrer au format PDF » pour le garder, l'offrir ou le faire imprimer.</p>
    <form id="fLivre" autocomplete="off"><div class="champs">
      <div class="champ"><label>Titre</label><input name="titre" value="${esc('La famille ' + nomFam).trim()}"></div>
      <div class="champ"><label>Sous-titre</label><input name="sous" value="Nos racines, nos histoires"></div>
      <div class="champ plein"><label>Photo de couverture</label><select name="couv"><option value="">— sans photo —</option>${phs.map(p => `<option value="${p.id}">${esc(p.legende || 'Photo du ' + texteDate(p.cree.slice(0, 10)))}</option>`).join('')}</select></div></div>
      <h4>Au sommaire</h4><div class="choix"><label><input type="checkbox" name="arbre" checked> 🌳 L'arbre</label><label><input type="checkbox" name="frise" checked> ⏳ La frise</label><label><input type="checkbox" name="photos"${phs.length ? ' checked' : ''}> 🖼️ Les photos (${phs.length})</label></div>
      <h4>Les biographies</h4><div class="qui">${ps.map(p => `<label><input type="checkbox" name="bios" value="${p.id}" data-multi="1"${estDecede(p) || (p.bio && Object.values(p.bio).some(Boolean)) ? ' checked' : ''}>${esc(nomComplet(p))} <small style="color:var(--ink-3)">${esc(periode(p))}${estVivant(p) ? ' · vivante' : ''}</small></label>`).join('')}</div>
      <h4>Les histoires</h4>${hs.length ? `<div class="qui">${hs.map(h => `<label><input type="checkbox" name="hist" value="${h.id}" data-multi="1"${h.confid !== 'prive' ? ' checked' : ''}>${genreH(h.genre).e} ${esc(h.titre)}</label>`).join('')}</div>` : '<small style="color:var(--ink-3)">Aucune histoire.</small>'}
      ${optionsProtection()}
      ${piedForm('', '📕 Composer le livre')}</form>`, f => {
    brancherForm(f);
    $('#fLivre', f).addEventListener('submit', async e => {
      e.preventDefault(); const o = lireForm(e.target); fermerModale();
      const src = async p => { const u = await urlDe(p.amelioree && p.voirAmelioree !== false ? p.amelioree : p.fichier); return u || ''; };
      const couv = o.couv && photo(o.couv) ? await src(photo(o.couv)) : '';
      const listePh = o.photos ? await Promise.all(phs.slice().sort((x, y) => String(x.date || '9').localeCompare(String(y.date || '9'))).map(async p => ({ p, u: await src(p) }))) : [];
      const html = avecMasque(o, () => {
        let h = `<div class="feuille couverture"><svg viewBox="0 0 40 40"><use href="#l-ro"/></svg><h1>${esc(o.titre || 'Livre de famille')}</h1><p>${esc(o.sous || '')}</p>${couv ? `<img src="${couv}" alt="">` : ''}<p style="font-size:10pt">${esc(texteDate(auj()))}</p></div>`;
        if (o.arbre && racineCourante()) h += `<div class="feuille"><h2>Notre arbre</h2>${dessinerArbre(racineCourante(), { mode: 'sablier', sens: 'v', gen: 3, impression: true, largeur: 1000 })}</div>`;
        const bios = (o.bios || []).map(personne).filter(p => p && !p.masque);
        if (bios.length) h += `<div class="feuille"><h2>Portraits</h2>${bios.map(p => `<div class="p-fiche"><h3>${esc(nomComplet(p))}${p.surnom ? ' « ' + esc(p.surnom) + ' »' : ''}</h3>
          <div class="m">${esc([p.nD ? 'Naissance : ' + texteDate(p.nD, p.nQ) + (p.nLieu ? ', ' + p.nLieu : '') + ' (' + certDe(p.nCert).nom.toLowerCase() + ')' : '', p.dD ? 'Décès : ' + texteDate(p.dD, p.dQ) + (p.dLieu ? ', ' + p.dLieu : '') : '', p.profession].filter(Boolean).join(' · '))}</div>
          ${BIO.filter(([k]) => p.bio && p.bio[k]).map(([k, n]) => `<p><b>${n}.</b> ${esc(p.bio[k])}</p>`).join('')}${p.notes ? `<p>${esc(p.notes)}</p>` : ''}
          ${(p.citations || []).map(c => `<p><i>« ${esc(c.t)} »</i></p>`).join('')}</div>`).join('')}</div>`;
        const hist = (o.hist || []).map(histoire).filter(Boolean);
        if (hist.length) h += `<div class="feuille"><h2>Nos histoires</h2>${hist.map(x => `<div class="p-histoire"><h3>${esc(x.titre)}</h3><div class="m" style="font-size:9.5pt;color:#5A4F86">${esc([genreH(x.genre).nom, x.date ? texteDate(x.date, x.dateQ) : '', x.lieu].filter(Boolean).join(' · '))}</div><p>${esc(x.texte || '')}</p></div>`).join('')}</div>`;
        if (listePh.length) h += `<div class="feuille"><h2>Nos photos</h2><div class="p-photos">${listePh.filter(x => x.u).map(({ p, u }) => `<figure><img src="${u}" alt=""><figcaption>${esc([p.legende, p.date ? texteDate(p.date, p.dateQ) : '', p.lieu].filter(Boolean).join(' · '))}
          ${(p.personnes || []).length ? '<br>' + esc(p.personnes.map(personne).filter(Boolean).map(nomComplet).join(', ')) : ''}${p.amelioree && p.voirAmelioree !== false ? '<br><i>✨ ' + esc(MENTION_IA) + '</i>' : ''}</figcaption></figure>`).join('')}</div></div>`;
        if (o.frise) h += `<div class="feuille"><h2>Frise familiale</h2>${friseHTML(evenementsFrise(), true)}${noteImpr()}</div>`;
        else h += `<div class="feuille">${noteImpr()}</div>`;
        return h;
      });
      imprimer(html);
    });
  }, true);
};

/* ============================================================
   GEDCOM : le format commun des logiciels de généalogie
   ============================================================ */
const MOIS_G = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function dateGed(v, q) {
  if (!v) return '';
  const [a, m, j] = String(v).split('-').map(Number);
  return ({ vers: 'ABT ', avant: 'BEF ', apres: 'AFT ' }[q] || '') + (j ? j + ' ' : '') + (m ? MOIS_G[m - 1] + ' ' : '') + a;
}
function lireDateGed(t) {
  t = String(t || '').toUpperCase().trim(); if (!t) return { v: '', q: 'exacte' };
  let q = 'exacte';
  if (/^(ABT|ABOUT|EST|CAL|CA\.?)\s/.test(t)) { q = 'vers'; t = t.replace(/^\S+\s/, ''); }
  else if (/^BEF\s/.test(t)) { q = 'avant'; t = t.slice(4); } else if (/^AFT\s/.test(t)) { q = 'apres'; t = t.slice(4); }
  else if (/^(BET|FROM)\s/.test(t)) { q = 'vers'; t = t.replace(/^(BET|FROM)\s/, '').split(/\s(AND|TO)\s/)[0]; }
  const m = t.match(/^(?:(\d{1,2})\s)?(?:([A-Z]{3})\s)?(\d{4})/);
  if (!m) return { v: '', q };
  const mo = m[2] ? MOIS_G.indexOf(m[2]) + 1 : 0;
  return { v: normaliserDate(m[3], mo || undefined, mo ? m[1] : undefined) || m[3], q };
}
function ligneGed(n, tag, val) {
  if (val == null || val === '') return [`${n} ${tag}`];
  const out = [], parts = String(val).split(/\r?\n/);
  parts.forEach((p, i) => {
    const morceaux = p.match(/.{1,200}/g) || [''];
    morceaux.forEach((m, j) => out.push(i === 0 && j === 0 ? `${n} ${tag} ${m}` : `${n + 1} ${j === 0 ? 'CONT' : 'CONC'} ${m}`));
  });
  return out;
}
ACT['gedcom-exporter'] = () => {
  if (!actifs('personnes').length) return toast('L’arbre est vide.');
  ouvrirModale(`<h3 id="modaleTitre">📤 Exporter en GEDCOM</h3><p class="sous">Un fichier <b>.ged</b> (GEDCOM 5.5.1, UTF-8) lisible par la plupart des logiciels de généalogie. Il reste sur votre ordinateur : c'est vous qui décidez où il va.</p>
    <form id="fGed">${optionsProtection()}
      <div class="choix" style="margin-bottom:10px"><label><input type="checkbox" name="sansPrives"> Exclure les personnes vivantes marquées « Moi seul·e »</label></div>
      <div class="note douce"><span class="e">⚠️</span><div>Ce fichier contient vos informations familiales <b>en clair</b>. Ne le déposez pas sur un site public si vous n'êtes pas certain·e de vouloir les rendre publiques.</div></div>
      ${piedForm('', '📤 Confirmer et exporter')}</form>`, f => {
    brancherForm(f);
    $('#fGed', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      const txt = avecMasque(o, () => construireGedcom()); fermerModale();
      telecharger('NaoRoots-' + auj() + '.ged', new Blob(['﻿' + txt], { type: 'text/plain;charset=utf-8' }));
      toast('Fichier GEDCOM prêt 📤');
    });
  });
};
function construireGedcom() {
  const ps = actifs('personnes'), I = new Map(ps.map((p, i) => [p.id, '@I' + (i + 1) + '@'])), L = [];
  const srcIds = new Map(); S.sources.filter(s => !s.supprime).forEach((s, i) => srcIds.set(s.id, '@S' + (i + 1) + '@'));
  const d = new Date();
  L.push('0 HEAD', '1 SOUR NAOROOTS', '2 NAME NaoRoots (NaoGroup)', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8', `1 DATE ${d.getDate()} ${MOIS_G[d.getMonth()]} ${d.getFullYear()}`,
    '1 NOTE Informations familiales à vérifier, sauf mention d’une source officielle.');
  /* les familles : un couple (uni ou non) et ses enfants */
  const fams = new Map(), cle = ids => ids.slice().sort().join('+');
  const fam = ids => { const k = cle(ids); if (!fams.has(k)) fams.set(k, { id: '@F' + (fams.size + 1) + '@', parents: ids.slice(), enfants: [], union: null }); return fams.get(k); };
  liensActifs().filter(l => l.t === 'union').forEach(u => { fam([u.a, u.b]).union = u; });
  ps.forEach(p => {
    const par = parentsDe(p.id).filter(x => x.lien.nature !== 'beau').slice(0, 2);
    if (par.length) fam(par.map(x => x.p.id)).enfants.push({ id: p.id, nature: par[0].lien.nature });
  });
  const famsDe = id => Array.from(fams.values()).filter(f => f.parents.includes(id)), famcDe = id => Array.from(fams.values()).filter(f => f.enfants.some(e => e.id === id));
  const certNote = c => c && c !== 'verifier' ? 'Certitude : ' + certDe(c).nom : 'Certitude : à vérifier';
  ps.forEach(p => {
    L.push(`0 ${I.get(p.id)} INDI`);
    if (p.masque) { L.push(`1 NAME ${p.prenom || 'Vivant'} //`, '1 NOTE Personne vivante : détails non exportés.'); }
    else {
      L.push(...ligneGed(1, 'NAME', `${p.prenom || ''} /${p.nom || ''}/`.trim()));
      if (p.prenom) L.push(...ligneGed(2, 'GIVN', p.prenom)); if (p.nom) L.push(...ligneGed(2, 'SURN', p.nom)); if (p.surnom) L.push(...ligneGed(2, 'NICK', p.surnom));
      if (p.nomUsage) L.push(...ligneGed(1, 'NAME', `${p.prenom || ''} /${p.nomUsage}/`), '2 TYPE married');
      L.push(`1 SEX ${p.sexe === 'f' ? 'F' : p.sexe === 'm' ? 'M' : 'U'}`);
      if (p.nD || p.nLieu) { L.push('1 BIRT'); if (p.nD) L.push('2 DATE ' + dateGed(p.nD, p.nQ)); if (p.nLieu) L.push(...ligneGed(2, 'PLAC', p.nLieu)); L.push(...ligneGed(2, 'NOTE', certNote(p.nCert))); }
      if (estDecede(p)) { if (p.dD || p.dLieu) { L.push('1 DEAT'); if (p.dD) L.push('2 DATE ' + dateGed(p.dD, p.dQ)); if (p.dLieu) L.push(...ligneGed(2, 'PLAC', p.dLieu)); L.push(...ligneGed(2, 'NOTE', certNote(p.dCert))); } else L.push('1 DEAT Y'); }
      if (p.profession) L.push(...ligneGed(1, 'OCCU', p.profession));
      const bio = BIO.filter(([k]) => p.bio && p.bio[k]).map(([k, n]) => n + ' : ' + p.bio[k]).join('\n');
      const note = [p.notes, bio, (p.citations || []).map(c => '« ' + c.t + ' »' + (c.ctx ? ' (' + c.ctx + ')' : '')).join('\n')].filter(Boolean).join('\n\n');
      if (note) L.push(...ligneGed(1, 'NOTE', note));
      (p.sources || []).forEach(s => { if (srcIds.has(s)) L.push('1 SOUR ' + srcIds.get(s)); });
      actifs('evenements').filter(e => (e.personnes || []).includes(p.id)).forEach(e => {
        const tag = { bapteme: 'BAPM', diplome: 'GRAD', metier: 'OCCU', militaire: 'EVEN', migration: 'EMIG', arrivee: 'IMMI', demenagement: 'RESI' }[e.type] || 'EVEN';
        L.push('1 ' + tag); if (tag === 'EVEN') L.push(...ligneGed(2, 'TYPE', e.titre || typeEv(e.type).nom)); if (e.date) L.push('2 DATE ' + dateGed(e.date, e.dateQ)); if (e.lieu) L.push(...ligneGed(2, 'PLAC', e.lieu));
        if (e.desc) L.push(...ligneGed(2, 'NOTE', e.desc));
      });
    }
    famsDe(p.id).forEach(f => L.push('1 FAMS ' + f.id));
    famcDe(p.id).forEach(f => { L.push('1 FAMC ' + f.id); const e = f.enfants.find(x => x.id === p.id); if (e && e.nature === 'adoptif') L.push('2 PEDI adopted'); else if (e && e.nature === 'accueil') L.push('2 PEDI foster'); });
  });
  fams.forEach(f => {
    L.push(`0 ${f.id} FAM`);
    const [a, b] = f.parents.map(personne);
    const h = [a, b].filter(Boolean).sort((x, y) => (x.sexe === 'f') - (y.sexe === 'f'));
    if (h[0]) L.push('1 HUSB ' + I.get(h[0].id)); if (h[1]) L.push('1 WIFE ' + I.get(h[1].id));
    const u = f.union;
    if (u && (u.debut || u.lieu) && !(a && a.masque) && !(b && b.masque)) { L.push(u.nature === 'mariage' || u.etaitMariage ? '1 MARR' : '1 EVEN'); if (!(u.nature === 'mariage' || u.etaitMariage)) L.push('2 TYPE ' + NATURES_UNION[u.nature || 'union'].nom); if (u.debut) L.push('2 DATE ' + dateGed(u.debut, u.debutQ)); if (u.lieu) L.push(...ligneGed(2, 'PLAC', u.lieu)); }
    if (u && u.nature === 'ex') { L.push('1 DIV'); if (u.fin) L.push('2 DATE ' + dateGed(u.fin, u.finQ)); }
    f.enfants.forEach(e => L.push('1 CHIL ' + I.get(e.id)));
  });
  S.sources.filter(s => !s.supprime).forEach(s => {
    L.push(`0 ${srcIds.get(s.id)} SOUR`, ...ligneGed(1, 'TITL', s.titre)); if (s.auteur) L.push(...ligneGed(1, 'AUTH', s.auteur));
    if (s.ref) L.push(...ligneGed(1, 'PUBL', s.ref)); L.push(...ligneGed(1, 'NOTE', typeSource(s.type).nom + (s.notes ? '\n' + s.notes : '')));
  });
  L.push('0 TRLR');
  return L.join('\r\n') + '\r\n';
}
function lireGedcom(texte) {
  const recs = [], pile = [];
  texte.replace(/^﻿/, '').split(/\r\n|\r|\n/).forEach(l => {
    const m = l.trim().match(/^(\d+)\s+(@[^@]+@\s+)?(\S+)(?:\s(.*))?$/); if (!m) return;
    const n = { niv: +m[1], xref: m[2] ? m[2].trim() : null, tag: m[3].toUpperCase(), val: m[4] || '', enf: [] };
    if (n.tag === 'CONC' || n.tag === 'CONT') { const p = pile[n.niv - 1]; if (p) p.val += (n.tag === 'CONT' ? '\n' : '') + n.val; return; }
    pile.length = n.niv; pile[n.niv] = n;
    if (n.niv === 0) recs.push(n); else if (pile[n.niv - 1]) pile[n.niv - 1].enf.push(n);
  });
  const un = (n, tag) => n.enf.find(e => e.tag === tag), tous = (n, tag) => n.enf.filter(e => e.tag === tag);
  /* les photos et documents : OBJE, dans la fiche ou en enregistrement à part (@O1@) */
  const lireObje = o => {
    const f = un(o, 'FILE'); if (!f || !f.val) return null;
    const val = (n, t) => (un(n, t) || {}).val || '';
    const d = lireDateGed(val(o, 'DATE') || val(o, '_DATE') || (f && val(f, 'DATE')));
    return { chemin: f.val.trim(), titre: val(o, 'TITL') || val(f, 'TITL'), form: (val(o, 'FORM') || val(f, 'FORM')).toLowerCase(),
      prim: /^y/i.test(val(o, '_PRIM') || val(f, '_PRIM') || val(o, '_PRIMARY')), date: d.v, dateQ: d.q, lieu: val(o, 'PLAC') || val(o, '_PLACE') };
  };
  const objets = new Map(recs.filter(r => r.tag === 'OBJE' && r.xref).map(r => [r.xref, lireObje(r)]));
  const medias = r => tous(r, 'OBJE').map(o => {
    if (/^@/.test(o.val)) { const x = objets.get(o.val.trim()); return x ? Object.assign({}, x, /^y/i.test((un(o, '_PRIM') || {}).val || '') ? { prim: true } : {}) : null; }
    return lireObje(o);
  }).filter(Boolean);
  const indis = recs.filter(r => r.tag === 'INDI').map(r => {
    const nm = un(r, 'NAME'), brut = nm ? nm.val : '', sn = (brut.match(/\/([^/]*)\//) || [])[1] || '';
    const g = nm && un(nm, 'GIVN') ? un(nm, 'GIVN').val : brut.replace(/\/[^/]*\//, '').trim();
    const ev = t => { const e = un(r, t); if (!e) return null; const d = lireDateGed(un(e, 'DATE') ? un(e, 'DATE').val : ''); return { d: d.v, q: d.q, lieu: un(e, 'PLAC') ? un(e, 'PLAC').val : '', y: e.val === 'Y' }; };
    return { xref: r.xref, prenom: g, nom: (nm && un(nm, 'SURN') ? un(nm, 'SURN').val : sn).trim(), surnom: nm && un(nm, 'NICK') ? un(nm, 'NICK').val : '',
      sexe: (un(r, 'SEX') || {}).val === 'F' ? 'f' : (un(r, 'SEX') || {}).val === 'M' ? 'm' : '', n: ev('BIRT') || ev('CHR') || ev('BAPM'), d: ev('DEAT') || ev('BURI'),
      profession: un(r, 'OCCU') ? un(r, 'OCCU').val : '', notes: tous(r, 'NOTE').map(x => x.val).filter(v => !/^@/.test(v)).join('\n\n'),
      famc: tous(r, 'FAMC').map(x => ({ f: x.val, pedi: un(x, 'PEDI') ? un(x, 'PEDI').val.toLowerCase() : '' })), medias: medias(r) };
  });
  const fams = recs.filter(r => r.tag === 'FAM').map(r => {
    const m = un(r, 'MARR'), d = m && un(m, 'DATE') ? lireDateGed(un(m, 'DATE').val) : { v: '', q: '' }, dv = un(r, 'DIV');
    return { xref: r.xref, parents: [un(r, 'HUSB'), un(r, 'WIFE')].filter(Boolean).map(x => x.val), enfants: tous(r, 'CHIL').map(x => x.val), marie: !!m, debut: d.v, debutQ: d.q, lieu: m && un(m, 'PLAC') ? un(m, 'PLAC').val : '', div: !!dv, medias: medias(r) };
  });
  return { indis, fams };
}
ACT['gedcom-importer'] = () => $('#fichierGedcom').click();
$('#fichierGedcom').addEventListener('change', async e => {
  const fi = e.target.files[0]; e.target.value = ''; if (!fi) return;
  if (/\.zip$/i.test(fi.name)) {
    let l; try { l = await lireZip(fi); } catch (err) { return toast('Ce fichier ZIP n’a pas pu être ouvert.'); }
    const ged = l.find(x => /\.(ged|gedcom)$/i.test(x.nom));
    if (!ged) return toast('Aucun fichier .ged dans ce ZIP.');
    return importerGedcom(ged.nom.split('/').pop(), texteGed(new Uint8Array(await ged.blob.arrayBuffer())), l.filter(x => x !== ged));
  }
  importerGedcom(fi.name, texteGed(new Uint8Array(await fi.arrayBuffer())));
});
/* Un GEDCOM peut être en UTF-8 ou en ANSI (Windows) : on essaie l'un puis l'autre. */
function texteGed(octets) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(octets); } catch (e) { return new TextDecoder('windows-1252').decode(octets); }
}
/* Lire un ZIP sans bibliothèque : le répertoire central, puis chaque fichier (stocké ou compressé). */
async function lireZip(fichier) {
  const buf = new Uint8Array(await fichier.arrayBuffer()), dv = new DataView(buf.buffer), dec = new TextDecoder();
  let e = buf.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('zip');
  const n = dv.getUint16(e + 10, true), out = []; let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < n && dv.getUint32(p, true) === 0x02014b50; i++) {
    const meth = dv.getUint16(p + 10, true), taille = dv.getUint32(p + 20, true), ln = dv.getUint16(p + 28, true), lx = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), loc = dv.getUint32(p + 42, true);
    const nom = dec.decode(buf.subarray(p + 46, p + 46 + ln)); p += 46 + ln + lx + lc;
    if (nom.endsWith('/') || /(^|\/)__MACOSX\//.test(nom)) continue;
    const debut = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true), data = buf.subarray(debut, debut + taille);
    let blob = null;
    if (meth === 0) blob = new Blob([data]);
    else if (meth === 8 && window.DecompressionStream) blob = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
    if (blob) out.push({ nom, blob });
  }
  return out;
}
/* Pour chaque personne du GEDCOM : est-elle déjà dans NaoRoots ? (même fichier déjà importé,
   ou même nom et même date de naissance complète) */
function dejaPresentes(nom, g) {
  const m = new Map(), l = actifs('personnes'), pris = new Set(), libre = x => !pris.has(x.id);
  /* d'abord les correspondances sûres (même fiche du même fichier), puis les autres */
  g.indis.forEach(i => { const p = l.find(x => x.gedRef === nom + '#' + i.xref); if (p) { m.set(i.xref, p); pris.add(p.id); } });
  g.indis.forEach(i => {
    if (m.has(i.xref)) return;
    const cle = cleIdentite(i), nD = i.n ? i.n.d : '';
    const memeNom = l.filter(x => libre(x) && cleIdentite(x) === cle && !x.masque);
    const p = (dateComplete(nD) && memeNom.find(x => x.nD === nD))
      /* même fichier déjà importé (avant que NaoRoots ne note la référence) : même nom et même année, ou aucune date des deux côtés */
      || memeNom.find(x => fichiersImport(x).has(nom) && (annee(x.nD) || 0) === (annee(nD) || 0) && (!x.sexe || !i.sexe || x.sexe === i.sexe));
    if (p) { m.set(i.xref, p); pris.add(p.id); }
  });
  return m;
}
function importerGedcom(nom, texte, fichiersJoints = []) {
  let g; try { g = lireGedcom(texte); } catch (err) { g = { indis: [] }; }
  if (!g.indis.length) return toast('Ce fichier ne ressemble pas à un GEDCOM lisible.');
  const deja = dejaPresentes(nom, g);
  ouvrirModale(`<h3 id="modaleTitre">📥 Importer « ${esc(nom)} »</h3>
    <p class="sous"><b>${g.indis.length}</b> personne${g.indis.length > 1 ? 's' : ''} et <b>${g.fams.length}</b> famille${g.fams.length > 1 ? 's' : ''} trouvées. Elles seront <b>ajoutées</b> à votre famille, sans rien remplacer.</p>
    <div class="note douce"><span class="e">🔎</span><div>Tout arrive marqué <b>« à vérifier »</b>, avec la source « Import GEDCOM ». NaoRoots ne fusionne personne automatiquement : si quelqu'un existe déjà, vous verrez un doublon à relier ou à mettre à la corbeille.</div></div>
    ${nbMediasGed(g) ? `<div class="note bleue"><span class="e">📷</span><div>Ce fichier cite <b>${nbMediasGed(g)} photo${nbMediasGed(g) > 1 ? 's' : ''} ou document${nbMediasGed(g) > 1 ? 's' : ''}</b>.
      ${fichiersJoints.length ? `Le ZIP contient ${fichiersJoints.length} fichier${fichiersJoints.length > 1 ? 's' : ''} : NaoRoots les rattache aux bonnes personnes.` : 'Un GEDCOM ne contient que leurs noms : juste après l’import, vous pourrez choisir le dossier où elles se trouvent.'}</div></div>` : ''}
    ${deja.size ? `<div class="note promesse"><span class="e">🧩</span><div><b>${deja.size} personne${deja.size > 1 ? 's' : ''}</b> de ce fichier ${deja.size > 1 ? 'sont' : 'est'} déjà dans votre arbre (même fichier déjà importé, ou même nom et même date de naissance).
      <div class="choix" style="margin-top:6px"><label><input type="checkbox" id="impReutiliser" checked> Les compléter au lieu de les ajouter une deuxième fois</label></div></div></div>` : ''}
    <form id="fImp"><div class="champ"><label>Créer un arbre centré sur</label><select name="racine">${g.indis.map(i => `<option value="${esc(i.xref)}">${esc([i.prenom, i.nom].filter(Boolean).join(' ') || i.xref)}${i.n && i.n.d ? ' (' + annee(i.n.d) + ')' : ''}</option>`).join('')}</select></div>
      ${piedForm('', '📥 Importer')}</form>`, f => {
    brancherForm(f);
    $('#fImp', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      const src = { id: uid(), type: 'recherche', titre: 'Import GEDCOM : ' + nom, date: auj(), cree: maintenant() }; S.sources.push(src);
      const ids = new Map(), reutiliser = deja.size && $('#impReutiliser', f) && $('#impReutiliser', f).checked;
      let completees = 0;
      g.indis.forEach(i => {
        const ancien = reutiliser && deja.get(i.xref);
        if (ancien) {
          const v = { prenom: i.prenom, nom: i.nom, surnom: i.surnom, sexe: i.sexe, profession: i.profession, nD: i.n ? i.n.d : '', nQ: i.n ? i.n.q : '', nLieu: i.n ? i.n.lieu : '', dD: i.d ? i.d.d : '', dQ: i.d ? i.d.q : '', dLieu: i.d ? i.d.lieu : '' };
          Object.entries(v).forEach(([k, x]) => { if (x && !ancien[k]) ancien[k] = x; });
          if (i.d) ancien.decede = true;
          if (i.notes && !(ancien.notes || '').includes(i.notes)) ancien.notes = [ancien.notes, i.notes].filter(Boolean).join('\n\n');
          ancien.sources = Array.from(new Set([...(ancien.sources || []), src.id]));
          if (!ancien.gedRef) { ancien.gedRef = nom + '#' + i.xref; ancien.gedFichier = nom; }
          ids.set(i.xref, ancien.id); completees++; return;
        }
        const p = { id: uid(), cree: maintenant(), prenom: i.prenom, nom: i.nom, surnom: i.surnom, sexe: i.sexe, profession: i.profession, notes: i.notes, bio: {}, citations: [], sources: [src.id], confid: 'invites',
          nD: i.n ? i.n.d : '', nQ: i.n ? i.n.q : '', nLieu: i.n ? i.n.lieu : '', nCert: 'verifier', decede: !!i.d, dD: i.d ? i.d.d : '', dQ: i.d ? i.d.q : '', dLieu: i.d ? i.d.lieu : '', dCert: 'verifier' };
        p.gedRef = nom + '#' + i.xref; p.gedFichier = nom;
        S.personnes.push(p); ids.set(i.xref, p.id);
      });
      g.fams.forEach(fa => {
        const ps = fa.parents.map(x => ids.get(x)).filter(Boolean);
        if (ps.length === 2) lien('union', ps[0], ps[1], { nature: fa.div ? 'ex' : fa.marie ? 'mariage' : 'union', etaitMariage: fa.div && fa.marie, debut: fa.debut, debutQ: fa.debutQ, lieu: fa.lieu, sources: [src.id] });
        fa.enfants.forEach(c => {
          const cid = ids.get(c); if (!cid) return;
          const pedi = ((g.indis.find(i => i.xref === c) || {}).famc || []).find(x => x.f === fa.xref);
          ps.forEach(pid => lien('parent', pid, cid, { nature: pedi && pedi.pedi === 'adopted' ? 'adoptif' : pedi && pedi.pedi === 'foster' ? 'accueil' : 'biologique', sources: [src.id] }));
        });
      });
      const nomArbre = 'Arbre importé — ' + nom.replace(/\.(ged|gedcom)$/i, ''), dejaArbre = S.arbres.find(a => !a.supprime && a.nom === nomArbre);
      if (dejaArbre) { dejaArbre.racine = ids.get(o.racine); S.reglages.arbre = dejaArbre.id; } else nouvelArbre(ids.get(o.racine), { nom: nomArbre, type: 'branche' });
      /* les photos citées : une entrée par fichier, avec toutes les personnes qui y figurent */
      const parChemin = new Map(), ajoute = (m, pids) => { const k = m.chemin; if (!parChemin.has(k)) parChemin.set(k, Object.assign({ id: uid(), personnes: [], import: nom, cree: maintenant() }, m, { prim: false, principalDe: [] })); const x = parChemin.get(k); pids.filter(Boolean).forEach(pid => { if (!x.personnes.includes(pid)) x.personnes.push(pid); if (m.prim && !x.principalDe.includes(pid)) x.principalDe.push(pid); }); };
      g.indis.forEach(i => (i.medias || []).forEach(m => ajoute(m, [ids.get(i.xref)])));
      g.fams.forEach(fa => (fa.medias || []).forEach(m => ajoute(m, fa.parents.map(x => ids.get(x)))));
      const connus = new Set((S.mediasGed || []).filter(m => m.import === nom).map(m => m.chemin));
      const nouveaux = Array.from(parChemin.values()).filter(m => !connus.has(m.chemin)); S.mediasGed = (S.mediasGed || []).concat(nouveaux);
      sauver(); fermerModale(); U.focus = null; allerA('arbre'); toast((g.indis.length - completees) + ' personne' + (g.indis.length - completees > 1 ? 's' : '') + ' ajoutée' + (g.indis.length - completees > 1 ? 's' : '') + (completees ? ', ' + completees + ' complétée' + (completees > 1 ? 's' : '') + ' (déjà présentes)' : '') + ' — à vérifier 🔎', { duree: 7000 });
      if (groupesDoublons().length) setTimeout(() => toast('🧩 Des doublons possibles ont été repérés : voir « À compléter ».', { action: 'Voir', fait: () => { allerA('completer'); setTimeout(() => ACT['ancre']({ dataset: { id: 'bloc-doublons' } }), 120); }, duree: 9000 }), 1200);
      if (nouveaux.length && fichiersJoints.length) rattacherMedias(fichiersJoints, true);
      else if (nouveaux.length) formPhotosGed();
    });
  });
}

/* ============================================================
   Les photos d'un GEDCOM : le fichier ne cite que leurs noms (ou des liens) ;
   on les retrouve dans un dossier, un ZIP, ou en ligne, puis on les rattache.
   ============================================================ */
const nbMediasGed = g => new Set([...g.indis.flatMap(i => (i.medias || []).map(m => m.chemin)), ...g.fams.flatMap(f => (f.medias || []).map(m => m.chemin))]).size;
const mediasEnAttente = () => (S.mediasGed || []).filter(m => !m.fait);
const nomSeul = c => String(c || '').split(/[\\/]/).pop().split('?')[0];
const decoder = t => { try { return decodeURIComponent(t); } catch (e) { return t; } };
const cleNom = c => sansAccent(decoder(nomSeul(c))).replace(/\s+/g, ' ').trim();
const sansExt = c => c.replace(/\.[a-z0-9]{2,5}$/i, '');
const estLien = c => /^https?:\/\//i.test(c || '');
const EXT_IMAGES = /\.(jpe?g|png|gif|webp|bmp|avif)$/i;
function formPhotosGed() {
  const l = mediasEnAttente(); if (!l.length) return toast('Toutes les photos des GEDCOM importés sont en place. 🌿');
  const liens = l.filter(m => estLien(m.chemin)), locaux = l.filter(m => !estLien(m.chemin));
  ouvrirModale(`<h3 id="modaleTitre">📷 Les photos du GEDCOM</h3>
    <p class="sous">Le fichier GEDCOM cite <b>${l.length} photo${l.length > 1 ? 's' : ''} ou document${l.length > 1 ? 's' : ''}</b>, mais un GEDCOM ne contient que leurs noms.
      Montrez à NaoRoots où elles se trouvent : il les reconnaît par leur nom de fichier et les rattache aux bonnes personnes (la photo principale devient le portrait).</p>
    <div class="lignes" style="margin-bottom:12px">
      ${locaux.length ? `<div class="ligne"><div class="pic">📁</div><div class="corps"><div class="t">Choisir le dossier des photos</div><div class="s">Le dossier (et ses sous-dossiers) livré avec le GEDCOM — ${locaux.length} fichier${locaux.length > 1 ? 's' : ''} à retrouver</div></div>
        <div class="fin-l"><button type="button" class="btn petit" data-f="dossier">📁 Choisir le dossier</button></div></div>
      <div class="ligne"><div class="pic">🖼️</div><div class="corps"><div class="t">Choisir des fichiers ou un ZIP</div><div class="s">Quelques photos, ou le ZIP qui les contient</div></div>
        <div class="fin-l"><button type="button" class="btn petit fin" data-f="fichiers">🖼️ Choisir</button></div></div>` : ''}
      ${liens.length ? `<div class="ligne"><div class="pic">🌐</div><div class="corps"><div class="t">Télécharger les ${liens.length} photo${liens.length > 1 ? 's' : ''} en ligne</div><div class="s">Le GEDCOM donne des liens internet (MyHeritage, Geneanet…). Certains sites refusent le téléchargement : elles resteront alors en attente.</div></div>
        <div class="fin-l"><button type="button" class="btn petit fin" data-f="liens">🌐 Télécharger</button></div></div>` : ''}
    </div>
    <details class="plus-d"><summary>Voir les fichiers attendus (${l.length})</summary><div class="lignes">${l.slice(0, 60).map(m => `<div class="ligne compacte"><div class="pic">${EXT_IMAGES.test(nomSeul(m.chemin)) ? '🖼️' : '📄'}</div>
      <div class="corps"><div class="t">${esc(m.titre || nomSeul(m.chemin))}</div><div class="s">${esc(nomSeul(m.chemin))} · ${esc(m.personnes.map(personne).filter(Boolean).map(prenomDe).join(', '))}</div></div></div>`).join('')}${l.length > 60 ? `<small>… et ${l.length - 60} autres</small>` : ''}</div></details>
    <input type="file" id="gedDossier" webkitdirectory directory multiple hidden><input type="file" id="gedFichiers" accept="image/*,.pdf,.zip" multiple hidden>
    <div class="pied-fen"><button type="button" class="btn fin petit" data-f="oublier">Oublier ces photos</button><div class="droite"><button type="button" class="btn" data-f="annuler">Plus tard</button></div></div>`, f => {
    brancherForm(f);
    const lire = async fichiers => {
      let l = [];
      for (const fi of fichiers) { if (/\.zip$/i.test(fi.name)) { try { l = l.concat(await lireZip(fi)); } catch (e) { toast('« ' + fi.name + ' » n’a pas pu être ouvert.'); } } else l.push({ nom: fi.webkitRelativePath || fi.name, blob: fi }); }
      rattacherMedias(l);
    };
    const d = $('[data-f="dossier"]', f); if (d) d.addEventListener('click', () => $('#gedDossier', f).click());
    const fs = $('[data-f="fichiers"]', f); if (fs) fs.addEventListener('click', () => $('#gedFichiers', f).click());
    $('#gedDossier', f).addEventListener('change', e => lire(Array.from(e.target.files)));
    $('#gedFichiers', f).addEventListener('change', e => lire(Array.from(e.target.files)));
    const li = $('[data-f="liens"]', f); if (li) li.addEventListener('click', async () => {
      li.disabled = true; li.textContent = 'Téléchargement…'; const l = [];
      for (const m of liens) { try { const r = await fetch(m.chemin); if (r.ok) { const b = await r.blob(); if (b.size) l.push({ nom: m.chemin, blob: b, media: m }); } } catch (e) {} }
      rattacherMedias(l);
    });
    $('[data-f="oublier"]', f).addEventListener('click', async () => {
      if (!await confirmer('Oublier ces photos ?', 'NaoRoots ne les cherchera plus. Les personnes importées restent ; vous pourrez toujours ajouter des photos à la main.', 'Oublier')) return formPhotosGed();
      S.mediasGed = (S.mediasGed || []).filter(m => m.fait); sauver(); rendre();
    });
  });
}
ACT['photos-ged'] = () => formPhotosGed();
/* Rattacher les fichiers trouvés aux photos attendues, par nom de fichier (avec ou sans extension). */
async function rattacherMedias(fichiers, depuisZip) {
  const attente = mediasEnAttente(); if (!attente.length) return;
  const exact = new Map(), court = new Map();
  fichiers.forEach(x => { const k = cleNom(x.nom); if (!exact.has(k)) exact.set(k, x); if (!court.has(sansExt(k))) court.set(sansExt(k), x); });
  toast('Recherche des photos…');
  let photos = 0, docs = 0, portraits = 0;
  const album = attente.length ? (() => { const n = 'Photos importées — ' + String(attente[0].import || 'GEDCOM').replace(/\.(ged|gedcom)$/i, ''); let a = S.albums.find(x => !x.supprime && x.nom === n); if (!a) { a = { id: uid(), nom: n, e: '📥', cree: maintenant() }; S.albums.push(a); } return a; })() : null;
  for (const m of attente.sort((a, b) => b.principalDe.length - a.principalDe.length)) {
    const k = cleNom(m.chemin), x = fichiers.find(y => y.media === m) || exact.get(k) || court.get(sansExt(k));
    if (!x) continue;
    const nomF = nomSeul(x.nom), estImage = EXT_IMAGES.test(nomF) || /^image\/(jpe?g|png|gif|webp|bmp|avif)/.test(x.blob.type || '') || /^(jpe?g|png|gif|webp|bmp)$/.test(m.form);
    const pids = m.personnes.filter(id => personne(id));
    try {
      if (estImage) {
        const im = await preparerImage(x.blob), id = uid(), cle = 'p-' + id;
        await fichierMettre(cle, { blob: im.grande, nom: nomF, type: 'image/jpeg' }); await fichierMettre(cle + '-v', { blob: im.vignette, type: 'image/jpeg' });
        S.photos.push({ id, fichier: cle, nomFichier: nomF, cree: maintenant(), legende: m.titre || sansExt(nomF).replace(/[_-]+/g, ' '), personnes: pids, date: m.date || '', dateQ: m.dateQ || '', lieu: m.lieu || '', albums: [album.id], confid: 'invites', importGed: m.import });
        for (const pid of pids) { const p = personne(pid); if (p && !p.photo && (m.principalDe.includes(pid) || pids.length === 1)) { p.photo = await portrait(x.blob); portraits++; } }
        m.fait = id; photos++;
      } else {
        const id = uid(), cle = 'd-' + id, type = x.blob.type || (/\.pdf$/i.test(nomF) ? 'application/pdf' : '');
        await fichierMettre(cle, { blob: x.blob, nom: nomF, type });
        S.documents.push({ id, type: 'autre', titre: m.titre || sansExt(nomF), personnes: pids, date: m.date || '', dateQ: m.dateQ || '', fichier: cle, nomFichier: nomF, mime: type, taille: x.blob.size, confid: 'prive', notes: 'Importé avec le GEDCOM « ' + (m.import || '') + ' ».', cree: maintenant() });
        m.fait = id; docs++;
      }
    } catch (e) {}
  }
  sauver(); if ($('#modale').classList.contains('ouvert')) fermerModale(); rendre();
  const reste = mediasEnAttente().length;
  const bilan = [photos && photos + ' photo' + (photos > 1 ? 's' : ''), docs && docs + ' document' + (docs > 1 ? 's' : ''), portraits && portraits + ' portrait' + (portraits > 1 ? 's' : '')].filter(Boolean).join(', ');
  toast((bilan ? '📷 Rattaché : ' + bilan + '.' : 'Aucun fichier ne correspond aux noms attendus.') + (reste ? ' Encore ' + reste + ' en attente (Transmission → Photos du GEDCOM).' : ''), { duree: 8000, action: reste && !depuisZip ? 'Chercher encore' : '', fait: formPhotosGed });
}

/* ============================================================
   Les doublons : comparer, puis fusionner (ou dire « ce ne sont pas les mêmes »)
   ============================================================ */
function resumePersonne(p) {
  const par = parentsDe(p.id).map(x => prenomDe(x.p)), cj = conjointsDe(p.id).map(x => prenomDe(x.p)), enf = enfantsDe(p.id).length;
  const ph = actifs('photos').filter(x => (x.personnes || []).includes(p.id)).length;
  return [periode(p) || 'dates inconnues', p.nLieu && '📍 ' + p.nLieu, par.length && 'parents : ' + par.join(', '), cj.length && 'union : ' + cj.join(', '), enf && enf + ' enfant' + (enf > 1 ? 's' : ''), ph && ph + ' photo' + (ph > 1 ? 's' : ''), p.gedFichier && '📥 ' + p.gedFichier].filter(Boolean).join(' · ');
}
const scoreFiche = p => ['nD', 'nLieu', 'dD', 'dLieu', 'profession', 'photo', 'notes', 'surnom'].filter(k => p[k]).length * 2 + liensActifs().filter(l => l.a === p.id || l.b === p.id).length + (p.sources || []).length;
let avantFusion = null;
function annulable(texte) {
  toast(texte, { action: 'Annuler', duree: 9000, fait: () => { if (!avantFusion) return; S = JSON.parse(avantFusion); avantFusion = null; sauver(); rendre(); toast('Fusion annulée.'); } });
}
ACT['doublon-comparer'] = el => {
  const g = groupesDoublons()[+el.dataset.i]; if (!g) return;
  const tri = g.slice().sort((a, b) => scoreFiche(b) - scoreFiche(a));
  ouvrirModale(`<h3 id="modaleTitre">🧩 ${esc(nomComplet(g[0]))} — ${g.length} fiches</h3>
    <p class="sous">Ces fiches portent le même nom et rien ne les distingue. Choisissez celle à garder : les autres y versent ce qu'elles savent (dates, lieux, photos, histoires, liens, sources), puis disparaissent.</p>
    <form id="fFusion"><div class="lignes">${tri.map((p, i) => `<label class="ligne" style="cursor:pointer;align-items:flex-start">
      <input type="radio" name="garder" value="${p.id}"${i === 0 ? ' checked' : ''} style="margin-top:12px;accent-color:#7C6BE0" aria-label="Garder cette fiche">
      <div class="pic" style="background:none">${rond(p, 36)}</div>
      <div class="corps"><div class="t">${esc(nomComplet(p))}${i === 0 ? ' <span class="badge ok mini">la plus complète</span>' : ''}</div><div class="s" style="white-space:normal">${esc(resumePersonne(p))}</div></div>
      <div class="fin-l"><span class="choix"><label style="padding:4px 9px"><input type="checkbox" name="inclure" value="${p.id}" data-multi="1" checked> Fusionner</label></span></div></label>`).join('')}</div>
      <div class="pied-fen"><button type="button" class="btn fin petit" data-f="distinctes">Ce ne sont pas les mêmes personnes</button>
        <div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="submit" class="btn">🧩 Fusionner</button></div></div></form>`, f => {
    brancherForm(f);
    $('[data-f="distinctes"]', f).addEventListener('click', () => {
      g.forEach((a, i) => g.slice(i + 1).forEach(b => S.pasDoublons.push(clePaire(a.id, b.id))));
      sauver(); fermerModale(); rendre(); toast('Noté : ce sont des personnes différentes.');
    });
    $('#fFusion', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target), garder = personne(o.garder);
      const autres = (o.inclure || []).filter(id => id !== o.garder).map(personne).filter(Boolean);
      if (!autres.length) return erreur(f, 'Cochez au moins une autre fiche à fusionner.');
      avantFusion = JSON.stringify(S); fusionner(garder, autres); sauver(); fermerModale(); rendre();
      annulable(`${autres.length + 1} fiches réunies en une seule : ${nomComplet(garder)} 🧩`);
    });
  }, true);
};
ACT['doublons-voir'] = () => { allerA('completer'); setTimeout(() => ACT['ancre']({ dataset: { id: 'bloc-doublons' } }), 120); };
ACT['doublons-evidents'] = async () => {
  const groupes = groupesDoublons().map(g => g.filter(p => g.some(q => q !== p && doublonEvident(p, q)))).filter(g => g.length > 1);
  const n = groupes.reduce((t, g) => t + g.length - 1, 0); if (!n) return;
  if (!await confirmer('Fusionner les doublons évidents ?', `${n} fiche${n > 1 ? 's' : ''} en double (même fichier GEDCOM importé plusieurs fois, ou même date de naissance complète) ser${n > 1 ? 'ont' : 'a'} réunie${n > 1 ? 's' : ''} avec ${n > 1 ? 'leur' : 'sa'} jumelle. Rien n'est perdu : tout est versé dans la fiche gardée. Vous pourrez annuler juste après.`, '🧩 Fusionner', false)) return;
  avantFusion = JSON.stringify(S);
  groupes.forEach(g => { const t = g.slice().sort((a, b) => scoreFiche(b) - scoreFiche(a)); fusionner(t[0], t.slice(1)); });
  sauver(); rendre(); annulable(n + ' doublon' + (n > 1 ? 's' : '') + ' fusionné' + (n > 1 ? 's' : '') + ' 🧩');
};

/* ============================================================
   Les invitations : un arbre précis, des droits choisis, rien d'automatique
   ============================================================ */
ACT['inviter'] = () => {
  const l = actifs('arbres'); if (!l.length) return toast('Créez d’abord votre arbre.');
  ouvrirModale(`<h3 id="modaleTitre">💌 Inviter un proche</h3>
    <p class="sous">NaoRoots prépare un fichier d'invitation pour <b>un seul arbre</b>, avec les droits que vous choisissez. Rien n'est envoyé : c'est vous qui le transmettez. Votre proche l'ouvre dans son propre NaoRoots, avec 📂.</p>
    <form id="fInv" autocomplete="off"><div class="champs">
      <div class="champ"><label>Le proche invité</label><input name="nom" required placeholder="ex. Cousine Inès"></div>
      <div class="champ"><label>Votre prénom <small>(tel qu'il le verra)</small></label><input name="de" required></div>
      <div class="champ plein"><label>Quel arbre ?</label><select name="arbre">${l.map(a => `<option value="${a.id}"${arbreCourant() && arbreCourant().id === a.id ? ' selected' : ''}>${esc(a.nom)} (${membresArbre(a).length} personnes)</option>`).join('')}</select></div>
      <div class="champ plein"><span class="lab">Ses droits</span><div class="choix grand">${Object.entries(DROITS).map(([k, d], i) => `<label><input type="radio" name="droit" value="${k}"${i === 0 ? ' checked' : ''}><span>${d.e} <b>${d.nom}</b><small>${d.d}</small></span></label>`).join('')}</div></div>
      <div class="champ plein"><span class="lab">Ce que contient l'invitation <small>— seulement les éléments marqués « Proches invités »</small></span><div class="choix">
        <label><input type="checkbox" name="details" checked> Dates, lieux et biographies des personnes décédées</label>
        <label><input type="checkbox" name="histoires"> Les histoires</label><label><input type="checkbox" name="photos"> Les photos</label><label><input type="checkbox" name="audio"> Les témoignages audio</label></div></div>
      ${optionsProtection()}</div>
      <div class="note promesse"><span class="e">🔒</span><div>Les fiches, photos et histoires marquées <b>« Moi seul·e »</b> ne sont jamais incluses. Les documents et les sources ne sont pas partagés.</div></div>
      <div id="invResume" class="note bleue" hidden></div>
      ${piedForm('', 'Voir le récapitulatif →')}</form>`, f => {
    brancherForm(f);
    $('#fInv', f).addEventListener('submit', async e => {
      e.preventDefault(); const o = lireForm(e.target), a = arbre(o.arbre);
      const paquet = await paquetInvitation(a, o);
      const n = paquet.personnes.length, nh = paquet.histoires.length, np = paquet.photos.length, nv = paquet.personnes.filter(p => p.masque).length;
      if (!await confirmer('Préparer l’invitation pour ' + o.nom + ' ?', `L'arbre <b>« ${esc(a.nom)} »</b> — ${n} personne${n > 1 ? 's' : ''} (dont ${nv} protégée${nv > 1 ? 's' : ''}), ${nh} histoire${nh > 1 ? 's' : ''}, ${np} photo${np > 1 ? 's' : ''} — avec le droit <b>${esc(DROITS[o.droit].nom)}</b>.
        Rien d'autre. Le fichier est téléchargé sur votre ordinateur : c'est vous qui le transmettez, par le moyen de votre choix.`, '💌 Préparer l’invitation', false)) return;
      const inv = { id: uid(), nom: o.nom, de: o.de, droit: o.droit, arbre: a.id, cree: maintenant() };
      S.invitations.push(inv); sauver();
      telecharger('NaoRoots-invitation-' + nomFichier(o.nom) + '.naoroots', { type: 'naoroots-invitation', v: 1, id: inv.id, date: inv.cree, de: o.de, pour: o.nom, droit: o.droit, arbreNom: a.nom, donnees: paquet });
      rendre(); toast('Invitation prête : transmettez-la vous-même à ' + o.nom + ' 💌', { duree: 6000 });
    });
  });
};
async function paquetInvitation(a, o) {
  const membres = membresArbre(a), ids = new Set(membres.map(p => p.id));
  const personnes = membres.filter(p => p.confid !== 'prive' || !estVivant(p)).map(p => {
    let q = masquer(p, o);
    if (p.confid === 'prive') q = { id: p.id, prenom: 'Personne', nom: '', masque: true };
    else if (!q.masque && !o.details) q = { id: p.id, prenom: p.prenom, nom: p.nom, sexe: p.sexe, surnom: p.surnom, decede: estDecede(p), photo: p.photo };
    return Object.assign({}, q, { sources: [] });
  });
  const garde = new Set(personnes.map(p => p.id));
  const liens = liensActifs().filter(l => garde.has(l.a) && garde.has(l.b)).map(l => Object.assign({}, l, { sources: [], notes: '' }));
  const filtrer = l => l.filter(x => !x.supprime && x.confid === 'invites' && (x.personnes || []).some(id => ids.has(id))).map(x => Object.assign({}, x, { personnes: (x.personnes || []).filter(id => garde.has(id)) }));
  const histoires = o.histoires ? await Promise.all(filtrer(S.histoires).map(async h => { const c = Object.assign({}, h); if (h.audio && o.audio) { const v = await fichierLire(h.audio.cle).catch(() => null); c.audio = v ? { data: await blobEnTexte(v.blob), consent: h.audio.consent } : null; } else c.audio = null; return c; })) : [];
  const photos = o.photos ? (await Promise.all(filtrer(S.photos).map(async p => {
    const g = await fichierLire(p.amelioree && p.voirAmelioree !== false ? p.amelioree : p.fichier).catch(() => null), v = await fichierLire((p.amelioree && p.voirAmelioree !== false ? p.amelioree : p.fichier) + '-v').catch(() => null);
    if (!g || !v) return null;
    const moy = await canvasBlob(versCanvas(await chargerImage(URL.createObjectURL(g.blob)), 1100), .82);
    return { id: p.id, legende: p.legende, personnes: p.personnes, date: p.date, dateQ: p.dateQ, lieu: p.lieu, evenement: p.evenement, souvenir: p.souvenir, amelioree: !!(p.amelioree && p.voirAmelioree !== false), vignetteData: await blobEnTexte(v.blob), grandeData: await blobEnTexte(moy) };
  }))).filter(Boolean) : [];
  const evenements = o.details ? filtrer(S.evenements.map(e => Object.assign({ confid: 'invites' }, e))).map(e => Object.assign({}, e, { sources: [] })) : [];
  return { arbres: [{ id: a.id, nom: a.nom, type: a.type, racine: a.racine, portee: a.portee, branches: a.branches }], personnes, liens, histoires, photos, evenements };
}
ACT['invitation-retirer'] = async el => {
  const x = S.invitations.find(i => i.id === el.dataset.id); if (!x) return;
  if (!await confirmer('Retirer l’invitation de ' + x.nom + ' ?', 'Elle ne comptera plus comme partagée ici, et ses prochains ajouts ne seront plus acceptés. Une copie déjà transmise ne peut pas être effacée à distance.', 'Retirer')) return;
  x.supprime = maintenant(); sauver(); rendre();
};
ACT['recu-ouvrir'] = el => { U.recu = el.dataset.id; U.focus = null; allerA('arbre'); };
ACT['recu-quitter'] = () => { U.recu = null; U.focus = null; allerA('transmission'); };
ACT['recu-supprimer'] = async el => {
  const r = S.recus.find(x => x.id === el.dataset.id); if (!r) return;
  if (!await confirmer('Retirer l’arbre de ' + (r.de || 'ce proche') + ' ?', 'Votre copie de cet arbre partagé sera effacée de NaoRoots' + ((r.contributions || []).length ? ', avec vos ajouts non envoyés' : '') + '.', 'Retirer')) return;
  S.recus = S.recus.filter(x => x !== r); sauver(); rendre();
};
ACT['contrib-correction'] = el => {
  const p = personne(el.dataset.id), r = recuActif(); if (!p || !r) return;
  if (!['profils', 'admin'].includes(r.droit)) return toast('Votre invitation permet seulement d’ajouter des souvenirs.');
  ouvrirModale(`<h3 id="modaleTitre">✍️ Proposer une correction pour ${esc(nomComplet(p))}</h3><p class="sous">Votre proposition sera relue et validée par ${esc(r.de || 'la personne qui vous a invité·e')}.</p>
    <form id="fCorr"><div class="champ"><label>Ce qu'il faudrait corriger ou ajouter</label><textarea name="texte" required autofocus placeholder="ex. Il est né au Lorrain, pas à Sainte-Marie : c'est écrit sur son livret militaire."></textarea></div>
      ${r.droit === 'admin' ? `<h4>Ou proposer un proche manquant</h4><div class="champs"><div class="champ"><label>Nom</label><input name="nom"></div><div class="champ"><label>Son lien avec ${esc(prenomDe(p))}</label><input name="lien" placeholder="ex. sa sœur aînée"></div></div>` : ''}
      ${piedForm('', 'Proposer')}</form>`, f => {
    brancherForm(f);
    $('#fCorr', f).addEventListener('submit', e => {
      e.preventDefault(); const o = lireForm(e.target);
      if (o.texte) r.contributions.push({ id: uid(), t: 'correction', cree: maintenant(), data: { pour: p.id, pourNom: nomComplet(p), texte: o.texte } });
      if (o.nom) r.contributions.push({ id: uid(), t: 'personne', cree: maintenant(), data: { nom: o.nom, lien: o.lien, pour: p.id, pourNom: nomComplet(p), texte: (o.lien ? o.lien + ' de ' + nomComplet(p) : '') } });
      sauver(); fermerModale(); rendre(); toast('Proposition gardée : pensez à « Renvoyer mes ajouts ».');
    });
  });
};
ACT['contrib-envoyer'] = async () => {
  const r = recuActif(); if (!r || !(r.contributions || []).length) return;
  if (!await confirmer('Renvoyer vos ajouts à ' + (r.de || 'votre proche') + ' ?', `${r.contributions.length} proposition${r.contributions.length > 1 ? 's' : ''} (histoires, photos, corrections). Un fichier est téléchargé : transmettez-le vous-même. Rien n'entrera dans son arbre sans sa validation.`, '📤 Préparer le fichier', false)) return;
  telecharger('NaoRoots-ajouts-pour-' + nomFichier(r.de || 'proche') + '.naoroots', { type: 'naoroots-contribution', v: 1, invitation: r.invitation, de: r.pour, pour: r.de, droit: r.droit, arbreNom: r.arbreNom, date: maintenant(), contributions: r.contributions });
  r.envoyes = (r.envoyes || []).concat(r.contributions); r.contributions = []; sauver(); rendre(); toast('Fichier prêt 📤');
};
/* Chez la personne qui a invité : les propositions attendent sa validation. */
ACT['proposition-voir'] = el => {
  const x = S.propositions.find(p => p.id === el.dataset.id); if (!x) return;
  ouvrirModale(`<h3 id="modaleTitre">📥 Proposition de ${esc(x.de || 'un proche')}</h3>
    ${x.t === 'photo' ? `<div class="visionneuse"><img src="${x.data.image || x.data.vignette}" alt=""></div>` : ''}
    ${x.data.titre ? `<h4>${esc(x.data.titre)}</h4>` : ''}${x.data.legende ? `<p><b>${esc(x.data.legende)}</b></p>` : ''}
    ${x.data.pourNom ? `<p class="sous">À propos de ${esc(x.data.pourNom)}</p>` : ''}${x.data.nom ? `<p>Personne proposée : <b>${esc(x.data.nom)}</b></p>` : ''}
    <div class="recit" style="font-size:15.5px">${esc(x.data.texte || x.data.souvenir || '')}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button></div></div>`, brancherForm, true);
};
ACT['proposition-refuser'] = async el => {
  const x = S.propositions.find(p => p.id === el.dataset.id); if (!x) return;
  if (!await confirmer('Refuser cette proposition ?', 'Elle ne sera pas ajoutée à votre arbre.', 'Refuser')) return;
  x.traite = 'refuse'; sauver(); rendre();
};
ACT['proposition-accepter'] = async el => {
  const x = S.propositions.find(p => p.id === el.dataset.id); if (!x) return;
  const inv = S.invitations.find(i => i.id === x.invitation);
  if (inv && inv.supprime) return toast('Cette invitation a été retirée : la proposition ne peut plus être acceptée.');
  const src = { id: uid(), type: 'temoignage', titre: 'Proposition de ' + (x.de || 'un proche') + ' (' + texteDate(auj()) + ')', auteur: x.de, cree: maintenant() };
  const existe = ids => (ids || []).filter(id => personne(id));
  if (x.t === 'histoire') { S.sources.push(src); S.histoires.push(Object.assign({}, x.data, { id: uid(), cree: maintenant(), personnes: existe(x.data.personnes), cert: 'verifier', confid: 'invites', sources: [src.id], proposePar: x.de })); }
  else if (x.t === 'photo') {
    const id = uid(), cle = 'p-' + id;
    await fichierMettre(cle, { blob: await texteEnBlob(x.data.image || x.data.vignette), type: 'image/jpeg' }); await fichierMettre(cle + '-v', { blob: await texteEnBlob(x.data.vignette), type: 'image/jpeg' });
    const d = Object.assign({}, x.data); delete d.image; delete d.vignette;
    S.photos.push(Object.assign(d, { id, fichier: cle, cree: maintenant(), personnes: existe(d.personnes), albums: [], confid: 'invites', proposePar: x.de }));
  } else if (x.t === 'correction') {
    const p = personne(x.data.pour); if (!p) return toast('Cette personne n’est plus dans votre arbre.');
    p.notes = [p.notes, '📝 Proposé par ' + (x.de || 'un proche') + ' le ' + texteDate(auj()) + ' (à vérifier) : ' + x.data.texte].filter(Boolean).join('\n\n');
  } else if (x.t === 'personne') {
    const [prenom, ...reste] = String(x.data.nom).split(' ');
    S.personnes.push({ id: uid(), cree: maintenant(), prenom, nom: reste.join(' '), notes: 'Proposé par ' + (x.de || 'un proche') + ' : ' + (x.data.texte || '') + '\nÀ relier vous-même si le lien est confirmé.', bio: {}, citations: [], sources: [], confid: 'invites', nCert: 'verifier', dCert: 'verifier' });
  }
  x.traite = 'accepte'; sauver(); rendre();
  toast(x.t === 'personne' ? 'Personne ajoutée sans lien : reliez-la si le lien est confirmé.' : 'Ajouté à votre arbre, marqué « à vérifier » ✓');
};

/* ============================================================
   Sauvegarder, ouvrir un fichier
   ============================================================ */
function tousLesFichiers() {
  const c = []; S.photos.forEach(p => { c.push(p.fichier, p.fichier + '-v'); if (p.amelioree) c.push(p.amelioree, p.amelioree + '-v'); });
  S.documents.forEach(d => d.fichier && c.push(d.fichier)); S.histoires.forEach(h => h.audio && c.push(h.audio.cle));
  return c.filter(Boolean);
}
ACT['sauvegarder'] = () => {
  const n = tousLesFichiers().length;
  ouvrirModale(`<h3 id="modaleTitre">💾 Sauvegarder NaoRoots</h3>
    <p class="sous">Un fichier <b>.naoroots</b> avec tout votre contenu, à garder en lieu sûr (clé USB, disque personnel). Il se recharge avec 📂.</p>
    ${n ? `<div class="choix" style="margin-bottom:10px"><label><input type="checkbox" id="sFich" checked> Inclure les photos, documents et enregistrements (${n} fichier${n > 1 ? 's' : ''})</label></div>` : ''}
    <div class="note douce"><span class="e">⚠️</span><div>Ce fichier contient toutes vos informations familiales <b>en clair</b>, y compris celles des personnes vivantes : ne le partagez pas. Pour partager, utilisez 💌 Inviter un proche.</div></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button><button type="button" class="btn" data-f="ok">💾 Confirmer et télécharger</button></div></div>`, f => {
    brancherForm(f);
    $('[data-f="ok"]', f).addEventListener('click', async e => {
      e.target.disabled = true; e.target.textContent = 'Un instant…';
      const fichiers = {};
      if ($('#sFich', f) && $('#sFich', f).checked) for (const c of tousLesFichiers()) { const v = await fichierLire(c).catch(() => null); if (v && v.blob) fichiers[c] = { nom: v.nom, type: v.type, data: await blobEnTexte(v.blob) }; }
      telecharger('NaoRoots-sauvegarde-' + auj() + '.naoroots', { type: 'naoroots-sauvegarde', v: 1, date: maintenant(), donnees: S, fichiers });
      fermerModale(); toast('Sauvegarde téléchargée 💾');
    });
  });
};
ACT['ouvrir-fichier'] = () => $('#fichierOuvrir').click();
$('#fichierOuvrir').addEventListener('change', async e => {
  const fi = e.target.files[0]; e.target.value = ''; if (!fi) return;
  const texte = await fi.text();
  if (/^﻿?0\s+HEAD/.test(texte.trim())) return importerGedcom(fi.name, texte);
  let j; try { j = JSON.parse(texte); } catch (err) { return toast('Ce fichier n’est pas un fichier NaoRoots.'); }
  if (j && j.type === 'naoroots-sauvegarde' && j.donnees) {
    if (!await confirmer('Recharger cette sauvegarde ?', `Sauvegarde du ${esc(texteDate(String(j.date).slice(0, 10)))}. Elle <b>remplace</b> tout le contenu actuel de NaoRoots. Pensez à sauvegarder l'état actuel avant, si besoin.`, 'Remplacer par la sauvegarde')) return;
    for (const c in (j.fichiers || {})) { try { await fichierMettre(c, { blob: await texteEnBlob(j.fichiers[c].data), nom: j.fichiers[c].nom, type: j.fichiers[c].type }); oublierUrl(c); } catch (err) {} }
    S = Object.assign(vierge(), j.donnees); U.recu = null; U.focus = null; sauver(); allerA('accueil'); toast('Sauvegarde rechargée ✓');
  } else if (j && j.type === 'naoroots-invitation' && j.donnees) {
    if (S.recus.some(r => r.invitation === j.id)) { if (!await confirmer('Mettre à jour cet arbre partagé ?', 'Vous avez déjà ouvert une invitation de ' + esc(j.de) + ' pour cet arbre. La nouvelle version remplacera l’ancienne (vos ajouts non envoyés sont gardés).', 'Mettre à jour', false)) return; }
    else if (!await confirmer(j.de + ' vous invite', `${esc(j.de)} vous partage l'arbre <b>« ${esc(j.arbreNom)} »</b> avec le droit <b>${esc((DROITS[j.droit] || DROITS.lecture).nom)}</b>. Il sera rangé à part de votre propre arbre, dans « Transmission ».`, 'Ouvrir l’arbre partagé', false)) return;
    const ancien = S.recus.find(r => r.invitation === j.id);
    const r = { id: ancien ? ancien.id : uid(), invitation: j.id, de: j.de, pour: j.pour, droit: DROITS[j.droit] ? j.droit : 'lecture', arbreNom: j.arbreNom, recu: maintenant(), donnees: Object.assign({ arbres: [], personnes: [], liens: [], histoires: [], photos: [], evenements: [] }, j.donnees), contributions: ancien ? ancien.contributions : [] };
    S.recus = S.recus.filter(x => x !== ancien).concat(r); sauver();
    U.recu = r.id; U.focus = null; allerA('arbre'); toast('Voici l’arbre partagé par ' + j.de + ' 🎁');
  } else if (j && j.type === 'naoroots-contribution' && Array.isArray(j.contributions)) {
    const inv = S.invitations.find(i => i.id === j.invitation && !i.supprime);
    if (!inv) return toast('Ces ajouts ne correspondent à aucune invitation en cours.');
    const autorise = { lecture: [], souvenirs: ['histoire', 'photo'], profils: ['histoire', 'photo', 'correction'], admin: ['histoire', 'photo', 'correction', 'personne'] }[inv.droit] || [];
    const l = j.contributions.filter(c => autorise.includes(c.t) && !S.propositions.some(p => p.cid === c.id));
    if (!l.length) return toast('Rien de nouveau à valider dans ce fichier.');
    if (!await confirmer('Ajouts de ' + (j.de || inv.nom), `${l.length} proposition${l.length > 1 ? 's' : ''} pour l'arbre « ${esc(j.arbreNom)} ». Elles attendront votre validation dans « À compléter » : rien n'entre dans votre arbre sans votre accord.`, 'Voir les propositions', false)) return;
    l.forEach(c => S.propositions.push({ id: uid(), cid: c.id, t: c.t, data: c.data, de: j.de || inv.nom, invitation: inv.id, droit: inv.droit, recu: maintenant() }));
    sauver(); allerA('completer');
  } else toast('Ce fichier n’est pas un fichier NaoRoots.');
});

/* ============================================================
   Réinitialiser : l'outil redevient vierge, comme pour une nouvelle personne
   ============================================================ */
ACT['reinitialiser'] = () => {
  const n = S.personnes.length + S.photos.length + S.histoires.length + S.documents.length;
  ouvrirModale(`<h3 id="modaleTitre"><span>♻️</span>Réinitialiser NaoRoots ?</h3>
    <p class="sous">Tout ce qui a été saisi dans NaoRoots est <b>effacé définitivement</b> : arbres, personnes, liens, photos, albums, histoires et enregistrements, documents, sources,
      questions, invitations, arbres reçus, corbeille et réglages. L'outil repart vierge, comme pour une nouvelle personne.${n ? '' : ' (Il est déjà presque vide.)'}</p>
    <div class="note douce"><span class="e">💾</span><div style="flex:1">Conseil : gardez d'abord une sauvegarde, pour pouvoir la recharger plus tard avec 📂.</div><button type="button" class="btn petit fin" data-f="sauver">Sauvegarder</button></div>
    <div class="champ"><label for="saisieEffacer">Pour confirmer, tapez <b style="color:var(--alerte);letter-spacing:.08em">EFFACER</b></label>
      <input id="saisieEffacer" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER" style="text-align:center;letter-spacing:.12em;font-weight:700"></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn danger" data-f="effacer" disabled>🗑 Tout effacer</button></div></div>`, f => {
    brancherForm(f);
    const s = $('#saisieEffacer', f), b = $('[data-f="effacer"]', f);
    $('[data-f="sauver"]', f).addEventListener('click', () => ACT['sauvegarder']());
    s.addEventListener('input', () => { b.disabled = s.value.trim().toUpperCase() !== 'EFFACER'; });
    s.addEventListener('keydown', e => { if (e.key === 'Enter' && !b.disabled) b.click(); });
    b.addEventListener('click', async () => {
      await fichiersVider().catch(() => {}); URLS.forEach(u => URL.revokeObjectURL(u)); URLS.clear();
      S = vierge();
      ['naoroots.theme', 'naoroots.calme', 'naoroots.grand'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver();
      const r = document.documentElement; r.dataset.theme = 'dark'; r.classList.remove('calme', 'grand');
      Object.assign(U, { vue: 'accueil', q: '', filtreBranche: '', albums: '', album: null, docs: 'documents', frise: 'frise', filtreFrise: '', mode: 'sablier', sens: 'v', gen: 3, zoom: 1, focus: null, genreH: '', recu: null, pid: null, avant: null, monde: false });
      history.replaceState(null, '', '#accueil');
      fermerModale(); majBoutons(); rendre(); decor(); scrollTo(0, 0);
      toast('NaoRoots est vierge ✨ Bienvenue !');
    });
  });
};

/* ============================================================
   Thème, taille du texte, animations
   ============================================================ */
function majBoutons() {
  const clair = document.documentElement.dataset.theme === 'light', b = $('#btnTheme');
  b.setAttribute('aria-checked', clair ? 'false' : 'true');
  b.setAttribute('aria-label', clair ? 'Passer en mode sombre' : 'Passer en mode clair');
  b.title = clair ? 'Mode clair — cliquer pour le mode sombre' : 'Mode sombre — cliquer pour le mode clair';
  b.querySelector('.thumb').textContent = clair ? '☀️' : '🌙';
  $('#btnCalme').title = document.documentElement.classList.contains('calme') ? 'Relancer les animations' : 'Mettre les animations en pause';
}
ACT['theme'] = () => {
  const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('naoroots.theme', r.dataset.theme); } catch (e) {}
  majBoutons(); decor();
};
ACT['grand'] = () => { const on = document.documentElement.classList.toggle('grand'); try { localStorage.setItem('naoroots.grand', on ? '1' : '0'); } catch (e) {} };
ACT['calme'] = () => { const on = document.documentElement.classList.toggle('calme'); try { localStorage.setItem('naoroots.calme', on ? '1' : '0'); } catch (e) {} majBoutons(); };

/* ============================================================
   Le décor : l'arbre de famille qui vit doucement
   — de petits arbres dont le tronc se trace et les feuilles s'ouvrent,
   des constellations familiales (deux points se relient, les enfants
   s'allument), des feuilles qui tombent en tournoyant, des racines qui
   s'étirent tout en bas, des graines qui montent, et le ciel étoilé.
   ============================================================ */
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const clair = document.documentElement.dataset.theme === 'light', m = 'var(--motif)';
  const hasard = (a, b) => a + Math.random() * (b - a);
  const bord = () => { const x = hasard(0, W); return [x < W * .5 ? hasard(14, W * .17) : hasard(W * .83, W - 14), hasard(40, H - 60)]; };
  const k = Math.max(.6, Math.min(1.6, W * H / 1100000));
  let h = '';
  for (let i = 0; i < Math.round(36 * k); i++) h += `<circle class="etoile" cx="${hasard(0, W).toFixed(0)}" cy="${hasard(0, H).toFixed(0)}" r="${hasard(.6, 1.6).toFixed(1)}" style="animation-duration:${hasard(2.5, 6).toFixed(1)}s;animation-delay:-${hasard(0, 6).toFixed(1)}s;opacity:${clair ? .35 : .5}"/>`;
  /* les petits arbres */
  for (let i = 0; i < Math.round(5 * k); i++) {
    const [x, y] = bord(), d = hasard(11, 16).toFixed(1), r = hasard(0, 10).toFixed(1), s = hasard(.8, 1.25).toFixed(2);
    const feuilles = [[-11, -30], [10, -33], [0, -40], [-6, -22], [7, -24]].map(([fx, fy], j) => `<circle class="pousse" cx="${fx}" cy="${fy}" r="${j === 2 ? 4.2 : 3.2}" fill="${m}" style="animation-delay:calc(var(--r) + ${(j * .25).toFixed(2)}s)"/>`).join('');
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s})" opacity="${clair ? .3 : .24}" style="--d:${d}s;--r:-${r}s">
      <path class="trace" d="M0 0C-1 -12 1 -22 0 -38" fill="none" stroke="${m}" stroke-width="1.7" stroke-linecap="round"/>
      <path class="trace b" d="M0 -16C-4 -20 -8 -24 -11 -30M0 -20C4 -24 8 -28 10 -33M0 -12C-3 -15 -5 -18 -6 -22M0 -14C3 -17 5 -20 7 -24" fill="none" stroke="${m}" stroke-width="1.2" stroke-linecap="round"/>
      ${feuilles}<path d="M-9 0H9M0 0C-3 3 -7 4 -10 5M0 0C3 3 7 4 10 5" fill="none" stroke="${m}" stroke-width="1" stroke-linecap="round" opacity=".7"/></g>`;
  }
  /* les constellations familiales : un couple, un trait, des enfants */
  for (let i = 0; i < Math.round(5 * k); i++) {
    const [x, y] = bord(), d = hasard(10, 15).toFixed(1), r = hasard(0, 10).toFixed(1), n = 2 + (i % 2);
    const enfants = Array.from({ length: n }, (_, j) => -14 * (n - 1) / 2 + j * 14);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})" opacity="${clair ? .34 : .28}" style="--d:${d}s;--r:-${r}s">
      <path class="lien" d="M-10 0H10M0 0V12M${enfants[0]} 12H${enfants[n - 1]}${enfants.map(ex => 'M' + ex + ' 12V20').join('')}" fill="none" stroke="${m}" stroke-width="1" stroke-linecap="round"/>
      <circle class="noeud" cx="-10" cy="0" r="2.6" fill="${m}"/><circle class="noeud" cx="10" cy="0" r="2.6" fill="${m}"/>
      ${enfants.map((ex, j) => `<circle class="noeud e" cx="${ex}" cy="21" r="2" fill="${m}" style="animation-delay:calc(var(--r) + ${(j * .3).toFixed(1)}s)"/>`).join('')}</g>`;
  }
  /* les racines, tout en bas */
  for (let i = 0; i < 4; i++) {
    const x = hasard(W * .05, W * .95), d = hasard(20, 30).toFixed(1), r = hasard(0, 20).toFixed(1);
    h += `<g transform="translate(${x.toFixed(0)} ${H + 4})" opacity="${clair ? .22 : .18}" style="--d:${d}s;--r:-${r}s">
      <path class="racine" d="M0 0C-4 -30 -24 -44 -46 -52C-60 -57 -70 -66 -76 -80M-20 -40C-10 -54 -14 -70 -8 -86M0 0C8 -26 30 -36 52 -40C66 -43 76 -54 82 -66M34 -38C40 -52 36 -62 42 -76" fill="none" stroke="${m}" stroke-width="1.2" stroke-linecap="round"/></g>`;
  }
  /* les feuilles qui tombent en tournoyant, et les graines qui montent */
  h += '<g class="bouge">';
  for (let i = 0; i < Math.round(8 * k); i++) {
    const x = hasard(0, W), dur = hasard(18, 30).toFixed(1), del = hasard(0, 30).toFixed(1), s = hasard(.7, 1.3).toFixed(2);
    h += `<g transform="translate(${x.toFixed(0)} -20) scale(${s})"><g class="feuille" style="animation-duration:${dur}s;animation-delay:-${del}s">
      <path d="M0 -7C5 -5 6 2 0 7C-6 2 -5 -5 0 -7Z" fill="${m}" opacity="${clair ? .5 : .55}"/><path d="M0 -6V7" stroke="var(--fond-uni)" stroke-width=".6" opacity=".5"/></g></g>`;
  }
  for (let i = 0; i < Math.round(5 * k); i++) {
    const x = hasard(0, W * .75), y = hasard(H * .55, H), dur = hasard(24, 36).toFixed(1), del = hasard(0, 30).toFixed(1);
    h += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="graine" style="animation-duration:${dur}s;animation-delay:-${del}s">
      <path d="M0 0V-9" stroke="${m}" stroke-width="1" fill="none"/>${[-60, -30, 0, 30, 60].map(a => `<path d="M0 -9L${(Math.sin(a * Math.PI / 180) * 5).toFixed(1)} ${(-9 - Math.cos(a * Math.PI / 180) * 5).toFixed(1)}" stroke="${m}" stroke-width=".8" fill="none"/>`).join('')}
      <circle r="1" fill="${m}"/></g></g>`;
  }
  svg.innerHTML = h + '</g>';
}
let minuteurDecor = null;
addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

/* ============================================================
   Une famille d'exemple, pour découvrir (jamais proposée à un profil qui démarre vierge).
   Tout y est inventé.
   ============================================================ */
ACT['exemple'] = () => {
  const t = (n = 0) => new Date(Date.now() - n * 864e5).toISOString();
  const P = (id, o) => Object.assign({ id, cree: t(30), bio: {}, citations: [], sources: [], confid: 'invites', nCert: 'verifier', dCert: 'verifier' }, o);
  const livret = { id: 's1', type: 'officiel', titre: 'Livret de famille Joseph – Schmitt', date: '1984-06-16', ref: 'Chez Daniel', cree: t(20) };
  const temoin = { id: 's2', type: 'temoignage', titre: 'Témoignage de Man Rose', auteur: 'Rosette Joseph', date: '2012-08', cree: t(20) };
  const acteV = { id: 's3', type: 'officiel', titre: 'Acte de naissance de Victor Joseph', ref: 'Archives de Martinique (exemple)', cree: t(19) };
  S = Object.assign(vierge(), {
    personnes: [
      P('cam', { prenom: 'Camille', nom: 'Joseph', sexe: 'f', nD: '1986-04-12', nLieu: 'Paris', nCert: 'confirme', sources: ['s1'], profession: 'Architecte', confid: 'prive' }),
      P('hug', { prenom: 'Hugo', nom: 'Bernard', sexe: 'm', nD: '1984-11-02', nLieu: 'Lyon', confid: 'prive' }),
      P('lea', { prenom: 'Léa', nom: 'Bernard', sexe: 'f', nD: '2016-09-30', nLieu: 'Strasbourg', confid: 'prive' }),
      P('noe', { prenom: 'Noé', nom: 'Bernard', sexe: 'm', nD: '2019-10-08', nLieu: 'Strasbourg', confid: 'prive' }),
      P('jul', { prenom: 'Julien', nom: 'Joseph', sexe: 'm', nD: '1989-07-21', nLieu: 'Paris', confid: 'prive' }),
      P('dan', { prenom: 'Daniel', nom: 'Joseph', sexe: 'm', nD: '1955-10-03', nLieu: 'Fort-de-France', nCert: 'confirme', sources: ['s1'], profession: 'Agent de la RATP, puis chef d’équipe',
        bio: { enfance: 'Grandit au Lorrain, dans la maison de bois de ses parents, entre la mer et les champs de bananes.', lieux: 'Le Lorrain, Fort-de-France, puis Paris à partir de 1974.' } }),
      P('ann', { prenom: 'Anne', nom: 'Schmitt', sexe: 'f', nD: '1958-02-17', nLieu: 'Colmar', nCert: 'confirme', sources: ['s1'], profession: 'Infirmière' }),
      P('vic', { prenom: 'Victor', nom: 'Joseph', sexe: 'm', nD: '1928', nQ: 'vers', nLieu: 'Le Lorrain', nCert: 'probable', decede: true, dD: '2004-03-11', dLieu: 'Fort-de-France', dCert: 'probable', profession: 'Pêcheur, puis ébéniste', sources: ['s3'],
        bio: { metiers: 'Pêcheur avec son oncle jusqu’à vingt ans, puis ébéniste : il a fait lui-même les chaises de la maison.', passions: 'Les combats de coqs du dimanche, qu’il regardait sans jamais parier.' },
        citations: [{ t: 'Sé an bon bwa ki ka fè bon chaloup.', ctx: 'C’est le bon bois qui fait la bonne barque — sur le travail bien fait.' }] }),
      P('ros', { prenom: 'Rosette', nom: 'Lucien', surnom: 'Man Rose', sexe: 'f', nD: '1931-05-24', nLieu: 'Sainte-Marie', nCert: 'probable', decede: true, dD: '2016-12-02', dLieu: 'Le Lorrain', dCert: 'probable', profession: 'Couturière', sources: ['s2'],
        bio: { habitudes: 'Chaque dimanche, le colombo et la messe, dans cet ordre-là ou dans l’autre.', souvenirs: 'Sa machine à coudre Singer, qu’on entendait depuis la route.' },
        citations: [{ t: 'Sé grenn diri ka fè sak diri.', ctx: 'Grain par grain, on remplit le sac de riz.' }] }),
      P('emi', { prenom: 'Émile', nom: 'Lucien', sexe: 'm', nD: '1900', nQ: 'vers', nCert: 'tradition', decede: true, notes: 'Selon la tradition familiale, il serait arrivé de Sainte-Lucie vers 1920. Aucune source ne le confirme pour l’instant.' }),
      P('alb', { prenom: 'Albert', nom: 'Schmitt', sexe: 'm', nD: '1926-08-09', nLieu: 'Sélestat', decede: true, dD: '2009-01-15', dLieu: 'Colmar', profession: 'Boulanger',
        bio: { metiers: 'Boulanger rue des Clefs, à Colmar, pendant trente-cinq ans. Levé à trois heures, six jours sur sept.' }, citations: [{ t: 'Wer rastet, der rostet.', ctx: 'Qui se repose rouille — il le disait en enfilant son tablier.' }] }),
      P('mar', { prenom: 'Marthe', nom: 'Kieffer', sexe: 'f', nD: '1930-03-02', nLieu: 'Haguenau', decede: true, dD: '2019-06-20', dLieu: 'Colmar', profession: 'Institutrice' }),
      P('mrc', { prenom: 'Marc', nom: 'Schmitt', sexe: 'm', nD: '1961-12-01', nLieu: 'Colmar', confid: 'prive' }),
      P('ine', { prenom: 'Inès', nom: 'Schmitt', sexe: 'f', nD: '1992-05-05', nLieu: 'Mulhouse', confid: 'prive' })
    ],
    liens: [
      ['parent', 'dan', 'cam', 'confirme'], ['parent', 'ann', 'cam', 'confirme'], ['parent', 'dan', 'jul'], ['parent', 'ann', 'jul'],
      ['parent', 'vic', 'dan', 'probable'], ['parent', 'ros', 'dan', 'probable'], ['parent', 'emi', 'ros', 'tradition'],
      ['parent', 'alb', 'ann'], ['parent', 'mar', 'ann'], ['parent', 'alb', 'mrc'], ['parent', 'mar', 'mrc'], ['parent', 'mrc', 'ine'],
      ['parent', 'cam', 'lea'], ['parent', 'hug', 'lea'], ['parent', 'cam', 'noe'], ['parent', 'hug', 'noe']
    ].map(([tt, a, b, c], i) => ({ id: 'l' + i, t: tt, a, b, nature: 'biologique', cert: c || 'verifier', sources: c === 'confirme' ? ['s1'] : [], cree: t(29) })).concat([
      { id: 'u1', t: 'union', a: 'dan', b: 'ann', nature: 'mariage', debut: '1984-06-16', lieu: 'Paris', cert: 'confirme', sources: ['s1'], cree: t(29) },
      { id: 'u2', t: 'union', a: 'vic', b: 'ros', nature: 'mariage', debut: '1952', debutQ: 'vers', lieu: 'Le Lorrain', cert: 'tradition', sources: [], cree: t(29) },
      { id: 'u3', t: 'union', a: 'alb', b: 'mar', nature: 'mariage', debut: '1953-05-09', lieu: 'Colmar', cert: 'probable', sources: [], cree: t(29) },
      { id: 'u4', t: 'union', a: 'cam', b: 'hug', nature: 'mariage', debut: '2014-07-05', lieu: 'Strasbourg', cert: 'verifier', sources: [], cree: t(29) },
      { id: 'a1', t: 'autre', a: 'mrc', b: 'cam', nature: 'parrainage', libelle: 'Parrain', cert: 'verifier', sources: [], cree: t(29) }]),
    evenements: [
      { id: 'e1', type: 'migration', titre: 'Départ pour Paris', date: '1974-09', lieu: 'Paris', personnes: ['dan'], desc: 'À dix-neuf ans, avec une valise et l’adresse d’un cousin à Belleville.', cert: 'probable', sources: ['s2'], cree: t(15) },
      { id: 'e2', type: 'arrivee', titre: 'Installation à Strasbourg', date: '2013', lieu: 'Strasbourg', personnes: ['cam', 'hug'], cert: 'verifier', sources: [], cree: t(14) },
      { id: 'e3', type: 'metier', titre: 'Ouverture de la boulangerie', date: '1955', dateQ: 'vers', lieu: 'Colmar', personnes: ['alb', 'mar'], cert: 'verifier', sources: [], cree: t(13) },
      { id: 'e4', type: 'arrivee', titre: 'Arrivée en Martinique', date: '1920', dateQ: 'vers', lieu: 'Sainte-Marie', personnes: ['emi'], desc: 'Tradition familiale : venu de Sainte-Lucie. À vérifier dans les archives.', cert: 'tradition', sources: [], cree: t(12) }
    ],
    histoires: [
      { id: 'h1', titre: 'Le colombo de Man Rose', genre: 'recette', personnes: ['ros'], lieu: 'Le Lorrain', cert: 'tradition', confid: 'invites', cree: t(5),
        texte: 'Le poulet mariné la veille avec le citron vert, l’ail, le piment et le bois d’Inde. Le lendemain, la poudre à colombo « de chez Tatie Léonie », jamais une autre.\nMan Rose disait qu’un colombo pressé est un colombo raté. On mangeait après la messe, tous serrés autour de la grande table que Victor avait faite.' },
      { id: 'h2', titre: 'La valise de 1974', genre: 'migration', personnes: ['dan'], date: '1974-09', lieu: 'Paris', cert: 'probable', confid: 'invites', cree: t(4),
        texte: 'Daniel raconte qu’il avait froid dès l’aéroport, en septembre. Dans sa valise : deux chemises, une photo de ses parents, et un pot de piment que Man Rose avait glissé sans rien dire.' },
      { id: 'h3', titre: 'Noël à la boulangerie', genre: 'tradition', personnes: ['alb', 'mar', 'ann'], lieu: 'Colmar', cert: 'tradition', confid: 'invites', cree: t(3),
        texte: 'Chaque année, les bredele étaient cuits dans le four de la boulangerie après la dernière fournée. Les enfants avaient le droit de découper les étoiles ; Albert gardait pour lui les « Spritz », trop difficiles, disait-il.' }
    ],
    albums: [{ id: 'al1', nom: 'Martinique', e: '🌺', cree: t(10) }, { id: 'al2', nom: 'Alsace', e: '🥨', cree: t(10) }, { id: 'al3', nom: 'Mariages', e: '💍', cree: t(10) }],
    documents: [{ id: 'd1', type: 'livret', titre: 'Livret de famille Joseph – Schmitt', date: '1984-06-16', personnes: ['dan', 'ann', 'cam', 'jul'], ref: 'Chez Daniel', source: 's1', confid: 'prive', cree: t(20) }],
    sources: [livret, temoin, acteV],
    questions: [
      { id: 'q1', q: 'D’où venait exactement Émile Lucien ? Existe-t-il un papier ?', pour: 'emi', a: 'Tante Josiane', cree: t(2) },
      { id: 'q2', q: 'As-tu une photo du mariage de Victor et Rosette ?', pour: 'vic', a: 'Daniel', cree: t(2) }
    ]
  });
  nouvelArbre('cam', { nom: 'Notre arbre familial', branches: { 1: 'Branche Joseph', 2: 'Branche Lucien', 3: 'Branche Schmitt', 4: 'Branche Kieffer' }, exemple: true });
  S.arbres.push({ id: 'ar2', nom: 'Famille paternelle — Martinique', type: 'paternel', racine: 'dan', portee: 'ascendants', branches: {}, cree: t(1) });
  sauver(); U.focus = null; fermerModale(); rendre();
  toast('Voici une famille d’exemple (inventée). ♻️ Réinitialiser pour repartir de zéro.', { duree: 7000 });
};

/* ============================================================
   Au démarrage
   ============================================================ */
/* L'entrée : l'arbre pousse (environ 3 secondes), un clic pour entrer tout de suite. */
function entree() {
  const intro = $('#intro'); if (!intro) return;
  const reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finir = () => { if (intro.isConnected) intro.remove(); };
  if (reduit) { document.body.classList.remove('entree'); return finir(); }
  intro.addEventListener('click', () => { intro.style.animation = 'introSort .4s ease forwards'; $('.page').style.animation = 'emerge .6s ease both'; setTimeout(finir, 420); });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4400);
}
(function demarrer() {
  const h = location.hash.slice(1); if (ONGLETS.some(o => o.id === h)) U.vue = h;
  majBoutons(); rendre(); decor(); entree();
})();
