'use strict';
/* ============================================================
   NaoRoots — les écrans. Les gestes passent par data-act (voir nr-app.js).
   ============================================================ */

const ONGLETS = [
  { id: 'accueil', nom: 'Accueil', e: '🏠' },
  { id: 'arbre', nom: 'Mon arbre', e: '🌳' },
  { id: 'famille', nom: 'Ma famille', e: '👨‍👩‍👧' },
  { id: 'histoires', nom: 'Nos histoires', e: '📖' },
  { id: 'albums', nom: 'Albums', e: '🖼️' },
  { id: 'documents', nom: 'Documents & sources', e: '📜' },
  { id: 'frise', nom: 'Frise familiale', e: '⏳' },
  { id: 'completer', nom: 'À compléter', e: '🧩' },
  { id: 'transmission', nom: 'Transmission', e: '🎁' }
];
const ONGLETS_RECU = ['arbre', 'famille', 'histoires', 'albums', 'frise'];

function rendre() {
  memo = {};
  const vide = !actifs('personnes').length && !U.recu;
  if (vide && U.vue !== 'accueil') U.vue = 'accueil';
  if (U.recu && !ONGLETS_RECU.includes(U.vue) && U.vue !== 'fiche') U.vue = 'arbre';
  const nc = U.recu ? 0 : totalACompleter();
  $('#onglets').innerHTML = vide ? '' : ONGLETS.filter(o => !U.recu || ONGLETS_RECU.includes(o.id)).map(o => `<button type="button" class="onglet${U.vue === o.id || (U.vue === 'fiche' && o.id === 'famille') ? ' actif' : ''}" data-vue="${o.id}"${U.vue === o.id ? ' aria-current="page"' : ''}>
    <span aria-hidden="true">${o.e}</span>${o.nom}${o.id === 'completer' && nc ? ` <span class="n">${nc}</span>` : ''}</button>`).join('');
  const b = $('#bandeauRecu'), r = recuActif();
  if (r) {
    b.hidden = false;
    b.innerHTML = `<span>🎁 Vous consultez l'arbre <b>« ${esc(r.arbreNom)} »</b> partagé par <b>${esc(r.de || 'un proche')}</b> · ${esc(DROITS[r.droit].nom)}.
      ${r.droit === 'lecture' ? 'Rien ne peut y être modifié.' : 'Vos ajouts sont des propositions : la personne qui vous a invité·e les validera.'}</span>
      <span class="droite">${r.droit !== 'lecture' && (r.contributions || []).length ? `<button type="button" class="btn petit" data-act="contrib-envoyer">📤 Renvoyer mes ajouts (${r.contributions.length})</button>` : ''}
      <button type="button" class="btn petit fin" data-act="recu-quitter">Revenir à mon arbre</button></span>`;
  } else b.hidden = true;
  const n = ['personnes', 'photos', 'histoires', 'documents', 'sources', 'albums', 'evenements', 'arbres', 'liens'].reduce((t, k) => t + S[k].filter(x => x.supprime).length, 0);
  const bc = $('#btnCorbeille'); if (n) bc.dataset.n = n; else delete bc.dataset.n;
  const vues = { accueil: vueAccueil, arbre: vueArbre, famille: vueFamille, fiche: vueFiche, histoires: vueHistoires, albums: vueAlbums,
    documents: vueDocuments, frise: vueFrise, completer: vueCompleter, transmission: vueTransmission };
  $('#contenu').innerHTML = (vues[U.vue] || vueAccueil)();
  hydrater($('#contenu'));
  apresRendu();
}

/* ---------- petits morceaux réutilisés ---------- */
const peutModifier = () => !U.recu;
const btnConfirmer = (k, id, champ) => peutModifier() ? `<button type="button" class="btn petit fin" data-act="certifier" data-k="${k}" data-id="${id}"${champ ? ` data-champ="${champ}"` : ''} title="Je sais que c'est vrai : marquer « confirmé »">✓ Confirmer</button>` : '';
const peutProposer = () => { const r = recuActif(); return !!r && r.droit !== 'lecture'; };
const vide = (texte, act, lib) => `<div class="vide">${texte}${act && peutModifier() ? `<div><button type="button" class="btn petit" data-act="${act}">${lib}</button></div>` : ''}</div>`;
function racineCourante() { const a = arbreCourant(); return a && personne(a.racine) ? a.racine : (actifs('personnes')[0] || {}).id; }
function rond(p, taille = 44, racine) {
  const c = couleurBranche(racine || racineCourante(), p.id);
  return `<span class="rond" style="--c:${esc(c)};width:${taille}px;height:${taille}px;font-size:${Math.round(taille * .4)}px">${p.photo ? `<img src="${p.photo}" alt="">` : esc(initiale(p))}</span>`;
}
function pastilleP(p) { return p ? `<span class="personne"><span class="pastille-p" style="--c:${esc(couleurBranche(racineCourante(), p.id))}">${p.photo ? `<img src="${p.photo}" alt="">` : esc(initiale(p))}</span>${esc(prenomDe(p))}</span>` : ''; }
function nomsDe(ids, max = 3) {
  const l = (ids || []).map(personne).filter(Boolean);
  return l.slice(0, max).map(pastilleP).join('') + (l.length > max ? `<span class="personne">+${l.length - max}</span>` : '');
}
function ficheP(p, racine) {
  const par = parente(racine, p.id);
  return `<button type="button" class="fiche-p" data-act="fiche" data-id="${p.id}" style="--c:${esc(couleurBranche(racine, p.id))}">${rond(p, 46, racine)}
    <span style="min-width:0"><b>${esc(nomComplet(p))}${p.surnom ? ` <i style="font-weight:400;color:var(--accent)">« ${esc(p.surnom)} »</i>` : ''}</b>
      <small>${esc([par, periode(p)].filter(Boolean).join(' · '))}</small>
      <span class="badges">${p.masque ? '<span class="badge mini">🌱 Personne vivante — détails protégés</span>' : ''}${aVerifier(p) ? badgeCert('verifier', true) : ''}${estMineur(p) ? '<span class="badge mini" title="Données d’un mineur : jamais partagées sans votre accord explicite">🛡️ Mineur</span>' : ''}</span></span></button>`;
}
function lignePersonne(p, sous) {
  return `<div class="ligne compacte cliquable" data-act="fiche" data-id="${p.id}"><div class="pic" style="background:none">${rond(p, 32)}</div>
    <div class="corps"><div class="t">${esc(nomComplet(p))}</div><div class="s">${sous || esc(periode(p) || parente(racineCourante(), p.id))}</div></div></div>`;
}
function ligneMini(e, titre, sous, act, id, fin = '') {
  return `<div class="ligne compacte${act ? ' cliquable' : ''}"${act ? ` data-act="${act}" data-id="${id}"` : ''}><div class="pic">${e}</div>
    <div class="corps"><div class="t">${esc(titre)}</div><div class="s">${sous}</div></div>${fin ? `<div class="fin-l">${fin}</div>` : ''}</div>`;
}
const rameau = `<svg class="rameau" viewBox="0 0 230 150" aria-hidden="true"><path d="M200 150C196 118 190 96 176 76M176 76C162 60 140 52 118 50M176 76C182 56 196 40 214 32M146 54C140 38 128 26 112 20M118 50C98 52 80 62 66 78"/><circle cx="214" cy="32" r="5"/><circle cx="112" cy="20" r="5"/><circle cx="66" cy="78" r="5"/><circle cx="118" cy="50" r="3"/><path d="M200 150C186 146 170 148 158 144M200 150C214 146 226 148 230 142"/></svg>`;

/* ============================================================
   La bienvenue
   ============================================================ */
function vueBienvenue() {
  const exemple = !(window.NaoCtx && NaoCtx.vierge);
  return `<section class="hero">
      <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-ro"/></svg>
      <div class="txt"><div class="salut">Bienvenue</div><h2>Nao<span>Roots</span></h2><p>Retrouver nos racines, transmettre nos histoires.</p>
        <p style="font-size:14.5px;color:var(--ink-3)">Arbre familial, souvenirs, photos et histoires de génération en génération.</p></div>${rameau}
    </section>
    <div class="grille">
      <div class="carte">
        <h3><span class="e">🌱</span>Planter la première graine</h3>
        <p style="margin-top:0;color:var(--ink-2)">Pas besoin de connaître la généalogie : on commence par <b>une personne</b> — vous, un enfant, une grand-mère —
          puis on ajoute ses parents, ses enfants, ses frères et sœurs, au fil des souvenirs. Chaque information peut rester « à vérifier » :
          l'arbre grandit à votre rythme.</p>
        <button type="button" class="btn gros" data-act="commencer">🌳 Commencer mon arbre</button>
        <button type="button" class="lien-discret" data-act="gedcom-importer" style="margin-left:8px">importer un fichier GEDCOM</button>
        ${exemple ? '<div><button type="button" class="lien-discret" data-act="exemple">ou découvrir avec une famille d’exemple</button></div>' : ''}
      </div>
      <div class="carte">
        <h3><span class="e">🛡️</span>Notre promesse</h3>
        ${promesses()}
      </div>
    </div>`;
}
function promesses() {
  return `<div class="promesses">
    <div><b>🔒 Privé par défaut</b>Aucun arbre, aucune photo, aucune histoire n'est jamais public. Rien n'est partagé sans votre confirmation.</div>
    <div><b>🔎 Des faits, pas des suppositions</b>NaoRoots n'invente aucun lien, aucune date, aucune origine. Chaque information dit si elle est confirmée, probable, à vérifier ou issue de la tradition familiale.</div>
    <div><b>🌱 Les vivants protégés</b>Les personnes vivantes et les mineurs sont masqués dans les exports et les invitations, sauf si vous choisissez le contraire.</div>
    <div><b>🧬 Pas de génétique</b>Pas de test ADN, et jamais d'origine déduite d'un nom, d'un visage ou d'un arbre.</div>
  </div>`;
}

/* ============================================================
   1. L'accueil
   ============================================================ */
function vueAccueil() {
  if (!actifs('personnes').length) return vueBienvenue();
  const a = arbreCourant(), r = racineCourante(), h = new Date().getHours();
  const c = aCompleter(), nc = totalACompleter();
  const ajouts = derniersAjouts().slice(0, 5), anniv = anniversaires().slice(0, 5);
  const albs = S.albums.filter(x => !x.supprime), docs = S.documents.filter(x => !x.supprime), srcs = S.sources.filter(x => !x.supprime);
  const lieux = lieuxFamille().places;
  return `<section class="hero">
      <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-ro"/></svg>
      <div class="txt"><div class="salut">${h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour'} · ${esc(JOURS[new Date().getDay()])} ${esc(texteDate(auj()))}</div>
        <h2>Nao<span>Roots</span></h2><p>Retrouver nos racines, transmettre nos histoires.</p>
        <p style="font-size:14px;color:var(--ink-3)">Arbre familial, souvenirs, photos et histoires de génération en génération.</p></div>
      <button type="button" class="btn gros" data-vue="arbre">🌳 Ouvrir mon arbre</button>${rameau}
    </section>
    ${banniereDoublons()}${banniereFete()}
    <div class="actions-rapides">
      <button type="button" class="btn" data-act="personne-ajouter">👤 Ajouter une personne</button>
      <button type="button" class="btn" data-act="photo-ajouter">📷 Ajouter une photo</button>
      <button type="button" class="btn" data-act="histoire-ajouter">✍️ Raconter une histoire</button>
      <button type="button" class="btn" data-act="document-ajouter">📜 Ajouter un document</button>
      <button type="button" class="btn fin" data-act="inviter">💌 Inviter un proche</button>
    </div>
    <div class="grille">
      <div class="carte arbre-carte"><h3><span class="e">🌳</span>Mon arbre familial${a ? ` <span class="badge mini">${esc(a.nom)}</span>` : ''}<button type="button" class="ico-btn plus" data-vue="arbre" title="Ouvrir l'arbre">→</button></h3>
        <div class="scene mini" data-vue="arbre" title="Ouvrir mon arbre">${dessinerArbre(r, { mode: 'sablier', gen: 2, mini: true, largeur: 1100 }).replace('<svg ', '<svg style="width:100%;height:auto;max-height:340px" ')}</div>
        <div class="legende-branches">${legendeBranches(a, r)}<span style="margin-left:auto">${membresArbre(a).length} personne${membresArbre(a).length > 1 ? 's' : ''} · ${generationsComptees(r)} génération${generationsComptees(r) > 1 ? 's' : ''}</span></div></div>
      <div class="carte"><h3><span class="e">🧩</span>À compléter${nc ? ` <span class="badge bientot mini">${nc}</span>` : ''}<button type="button" class="ico-btn plus" data-vue="completer" title="Tout voir">→</button></h3>
        ${nc ? `<div class="lignes">${[
          c.propositions.length && ligneMini('📥', c.propositions.length + ' proposition' + (c.propositions.length > 1 ? 's' : '') + ' à valider', 'Envoyées par vos proches', 'vue', 'completer'),
          c.doublons.length && ligneMini('🧩', c.doublons.length + ' doublon' + (c.doublons.length > 1 ? 's' : '') + ' possible' + (c.doublons.length > 1 ? 's' : ''), 'Même nom, peut-être la même personne', 'vue', 'completer'),
          c.dates.length && ligneMini('📅', c.dates.length + ' date' + (c.dates.length > 1 ? 's' : '') + ' de naissance inconnue' + (c.dates.length > 1 ? 's' : ''), esc(c.dates.slice(0, 3).map(prenomDe).join(', ')), 'vue', 'completer'),
          c.liens.length && ligneMini('🔗', c.liens.length + ' lien' + (c.liens.length > 1 ? 's' : '') + ' à vérifier', 'Filiations ou unions pas encore confirmées', 'vue', 'completer'),
          c.infos.length && ligneMini('❔', c.infos.length + ' information' + (c.infos.length > 1 ? 's' : '') + ' à vérifier', esc(c.infos.slice(0, 3).map(prenomDe).join(', ')), 'vue', 'completer'),
          c.photos.length && ligneMini('🖼️', c.photos.length + ' photo' + (c.photos.length > 1 ? 's' : '') + ' à identifier', 'Personne n’y est encore nommé', 'vue', 'completer'),
          c.sources.length && ligneMini('📌', c.sources.length + ' fiche' + (c.sources.length > 1 ? 's' : '') + ' sans source', 'D’où viennent ces informations ?', 'vue', 'completer'),
          c.questions.length && ligneMini('💬', c.questions.length + ' question' + (c.questions.length > 1 ? 's' : '') + ' à poser', esc(couper(c.questions[0].q, 60)), 'vue', 'completer')
        ].filter(Boolean).slice(0, 5).join('')}</div>` : vide('Tout est à jour. Bravo ! 🌿')}</div>
      <div class="carte"><h3><span class="e">🕯️</span>Souvenir du jour</h3>${souvenirDuJour()}</div>
      <div class="carte"><h3><span class="e">✨</span>Nos derniers ajouts</h3>
        ${ajouts.length ? `<div class="lignes">${ajouts.map(x => ligneMini(x.e, x.titre, esc(x.sous) + ' · ' + esc(texteDate(x.cree.slice(0, 10))), x.act, x.id)).join('')}</div>` : vide('Rien encore.')}</div>
      <div class="carte"><h3><span class="e">🎂</span>Les prochains anniversaires</h3>
        ${anniv.length ? `<div class="lignes">${anniv.map(x => ligneMini(x.vivant ? gateauIco(ecart(x.date) === 0, 22) : '🕯️', x.vivant ? nomComplet(x.p) + (x.age ? ' · ' + x.age + ' ans' : '') : nomComplet(x.p),
          x.vivant ? esc(texteDate(x.date)) + ' · ' + esc(dans(x.date)) : `Né${x.p.sexe === 'f' ? 'e' : ''} il y a ${x.age} ans, le ${esc(texteDate(x.p.nD))}`, 'fiche', x.p.id)).join('')}</div>`
          : vide('Ajoutez les dates de naissance complètes (jour et mois) pour voir arriver les anniversaires de la famille.')}</div>
      <div class="carte"><h3><span class="e">🖼️</span>Mes albums<button type="button" class="ico-btn plus" data-vue="albums" title="Tous les albums">→</button></h3>
        ${albs.length ? `<div class="albums" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">${albs.slice(0, 4).map(al => carteAlbum(al, true)).join('')}</div>`
          : vide('Mariages, vacances, enfance, traditions… rangez les photos de famille en albums.', 'album-ajouter', '＋ Créer un album')}</div>
      <div class="carte"><h3><span class="e">📜</span>Mes documents et sources<button type="button" class="ico-btn plus" data-vue="documents" title="Tout voir">→</button></h3>
        ${docs.length || srcs.length ? `<div class="puces" style="margin-bottom:10px"><span class="puce">📄 ${docs.length} document${docs.length > 1 ? 's' : ''}</span><span class="puce">📌 ${srcs.length} source${srcs.length > 1 ? 's' : ''}</span>
          <span class="puce">🏛️ ${srcs.filter(s => s.type === 'officiel' || s.type === 'archive').length} officielle${srcs.filter(s => s.type === 'officiel' || s.type === 'archive').length > 1 ? 's' : ''}</span></div>
          <div class="lignes">${docs.slice().sort((x, y) => String(y.cree).localeCompare(x.cree)).slice(0, 3).map(d => ligneMini(typeDoc(d.type).e, d.titre, esc(typeDoc(d.type).nom) + (d.date ? ' · ' + esc(texteDate(d.date, d.dateQ)) : ''), 'document-ouvrir', d.id)).join('')}</div>`
          : vide('Livret de famille, actes, lettres, cartes postales… et les sources de chaque information.', 'document-ajouter', '📜 Ajouter un document')}</div>
      <div class="carte"><h3><span class="e">📍</span>Nos lieux importants<button type="button" class="ico-btn plus" data-act="frise-carte" title="Ouvrir la carte">→</button></h3>
        ${lieux.length ? `<div class="carte-lieux" data-act="frise-carte" style="cursor:pointer">${dessinerCarte(lieux.slice(0, 12), [], { sansNoms: lieux.length > 6, ratio: 1.9 })}</div>
          <div class="puces" style="margin-top:10px">${lieux.slice(0, 6).map(l => `<span class="puce">📍 ${esc(l.nom)} <span class="n">${l.n}</span></span>`).join('')}</div>`
          : vide('Ajoutez des lieux de naissance, de vie ou de mariage : ils apparaîtront sur une petite carte.')}</div>
    </div>
`;
}
/* Le jour J : un bandeau de fête, avec gâteau et confettis. */
/* Des fiches en double : un bandeau bien visible, avec la fusion en un clic. */
function banniereDoublons() {
  if (U.recu) return '';
  const g = groupesDoublons(); if (!g.length) return '';
  const ev = g.map(x => x.filter(p => x.some(q => q !== p && doublonEvident(p, q)))).reduce((t, x) => t + Math.max(0, x.length - 1), 0);
  const ex = g.slice(0, 3).map(x => nomComplet(x[0]) + ' ×' + x.length).join(', ');
  return `<div class="note douce" style="align-items:center;margin-bottom:16px"><span class="e">🧩</span><div style="flex:1"><b>${g.length} personne${g.length > 1 ? 's' : ''} en plusieurs exemplaires</b> (${esc(ex)}${g.length > 3 ? '…' : ''}).
    ${ev ? 'NaoRoots peut les réunir en une seule fiche chacune : rien n’est perdu, et vous pourrez annuler.' : 'Comparez-les pour décider.'}</div>
    ${ev ? `<button type="button" class="btn petit" data-act="doublons-evidents">🧩 Fusionner ${ev} doublon${ev > 1 ? 's' : ''}</button>` : ''}
    <button type="button" class="btn petit fin" data-act="doublons-voir">Voir</button></div>`;
}
function banniereFete() {
  const vus = new Set(), l = actifs('personnes').filter(p => anniversaireDans(p) === 0).filter(p => { const k = cleIdentite(p) + '|' + p.nD; if (vus.has(k)) return false; vus.add(k); return true; });
  if (!l.length) return '';
  const noms = l.map(p => prenomDe(p)), liste = noms.length > 1 ? noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1] : noms[0];
  const couleurs = ['#F3A6C8', '#B89CF2', '#FFE08A', '#9BE6C6', '#AAB4FF'];
  const confettis = Array.from({ length: 22 }, (_, i) => `<i style="left:${(i * 4.6 + (i % 3) * 1.7).toFixed(1)}%;background:${couleurs[i % 5]};animation-delay:-${(i * .37 % 3.4).toFixed(2)}s;animation-duration:${(2.8 + (i % 4) * .45).toFixed(2)}s"></i>`).join('');
  return `<div class="fete" role="status"><div class="confettis" aria-hidden="true">${confettis}</div>
    ${gateauIco(true, 64)}
    <div class="txt"><div class="salut">🎉 Joyeux anniversaire</div><b>${esc(liste)}</b>
      <span>${l.map(p => esc(prenomDe(p)) + ' fête ses ' + ageDe(p) + ' ans aujourd’hui').join(' · ')}</span></div>
    <div class="droite">${l.map(p => `<button type="button" class="btn petit" data-act="fiche" data-id="${p.id}">Voir ${esc(prenomDe(p))}</button>`).join('')}</div></div>`;
}
function legendeBranches(a, r) {
  const b = branches(r), vus = new Set(b.values());
  return [1, 2, 3, 4].filter(i => vus.has(i)).map(i => `<span><i style="--c:${BRANCHES[i].c}"></i>${esc(nomBranche(a, i))}</span>`).join('') || '<span style="color:var(--ink-3)">Les couleurs des branches apparaissent quand on ajoute les grands-parents.</span>';
}
function generationsComptees(r) { const g = Array.from(generations(r).values()); return g.length ? Math.max(...g) - Math.min(...g) + 1 : 0; }

function souvenirDuJour() {
  const choix = [];
  actifs('histoires').filter(h => h.confid !== 'masque').forEach(h => choix.push({ t: 'h', x: h }));
  actifs('photos').filter(p => p.souvenir || p.legende).forEach(p => choix.push({ t: 'p', x: p }));
  actifs('personnes').forEach(p => (p.citations || []).forEach(c => choix.push({ t: 'c', x: c, p })));
  if (!choix.length) return vide('Une histoire, une photo avec son souvenir ou une citation familiale s’affichera ici chaque jour.', 'histoire-ajouter', '✍️ Raconter une histoire');
  const j = Math.floor(Date.now() / 864e5), s = choix[j % choix.length];
  if (s.t === 'h') return `<div class="souvenir"><div class="img">${genreH(s.x.genre).e}</div><div><b style="font-style:italic">${esc(s.x.titre)}</b>
    <blockquote>${esc(couper(s.x.texte, 220))}</blockquote><small>${esc(genreH(s.x.genre).nom)}${s.x.personnes && s.x.personnes.length ? ' · ' : ''}</small>${nomsDe(s.x.personnes)}
    <div><button type="button" class="voir-tout" data-act="histoire-ouvrir" data-id="${s.x.id}">Lire l'histoire →</button></div></div></div>`;
  if (s.t === 'p') return `<div class="souvenir"><button type="button" class="img" style="border:0;padding:0;cursor:pointer" data-act="photo-ouvrir" data-id="${s.x.id}">${imgPhoto(s.x)}</button><div>
    <blockquote>${esc(couper(s.x.souvenir || s.x.legende, 220))}</blockquote><small>${esc([s.x.date ? texteDate(s.x.date, s.x.dateQ) : '', s.x.lieu].filter(Boolean).join(' · '))}</small>${nomsDe(s.x.personnes)}</div></div>`;
  return `<div class="citation">${esc(s.x.t)}<small>— ${esc(nomComplet(s.p))}${s.x.ctx ? ', ' + esc(s.x.ctx) : ''}</small></div>`;
}
function derniersAjouts() {
  const l = [];
  actifs('personnes').forEach(p => p.cree && l.push({ cree: p.cree, e: '👤', titre: nomComplet(p), sous: 'Personne ajoutée', act: 'fiche', id: p.id }));
  actifs('photos').forEach(p => p.cree && l.push({ cree: p.cree, e: '📷', titre: p.legende || 'Photo', sous: 'Photo', act: 'photo-ouvrir', id: p.id }));
  actifs('histoires').forEach(h => h.cree && l.push({ cree: h.cree, e: genreH(h.genre).e, titre: h.titre, sous: genreH(h.genre).nom, act: 'histoire-ouvrir', id: h.id }));
  if (!U.recu) S.documents.filter(d => !d.supprime).forEach(d => d.cree && l.push({ cree: d.cree, e: typeDoc(d.type).e, titre: d.titre, sous: typeDoc(d.type).nom, act: 'document-ouvrir', id: d.id }));
  return l.sort((a, b) => String(b.cree).localeCompare(a.cree));
}
/* Les anniversaires des vivants, et le souvenir doux des disparus (jour de naissance). */
function anniversaires() {
  const l = [], a = new Date().getFullYear();
  actifs('personnes').filter(p => dateComplete(p.nD) && !p.masque).forEach(p => {
    const d = dateDe(p.nD); let x = iso(new Date(a, d.getMonth(), d.getDate())); if (x < auj()) x = iso(new Date(a + 1, d.getMonth(), d.getDate()));
    const n = ecart(x), vivant = estVivant(p);
    if (n <= (vivant ? 60 : 21)) l.push({ p, date: x, vivant, age: dateDe(x).getFullYear() - d.getFullYear() });
  });
  return l.sort((x, y) => x.date.localeCompare(y.date) || (y.vivant - x.vivant));
}

/* ============================================================
   2. Mon arbre
   ============================================================ */
function vueArbre() {
  const a = arbreCourant(), l = actifs('arbres');
  let r = U.focus && personne(U.focus) ? U.focus : racineCourante();
  if (!r) return `<div class="carte">${vide('Votre arbre est vide.', 'personne-ajouter', '👤 Ajouter une personne')}</div>`;
  U.focus = r;
  const p = personne(r), modes = [['sablier', '👨‍👩‍👧 Famille'], ['lignee', '⏳ Sablier'], ['ascendants', '⬆️ Ascendants'], ['descendants', '⬇️ Descendants'], ['eventail', '🪭 Éventail']];
  return `<div class="section-titre"><h2>${a ? esc(TYPES_ARBRE[a.type] ? TYPES_ARBRE[a.type].e : '🌳') + ' <span>' + esc(a.nom) + '</span>' : 'Mon <span>arbre</span>'}</h2>
      <div class="droite">${peutModifier() ? `<button type="button" class="btn fin petit" data-act="arbres-gerer">🌳 Mes arbres (${l.length})</button>
        <button type="button" class="btn petit" data-act="personne-ajouter">👤 Ajouter une personne</button>` : ''}</div></div>
    ${banniereDoublons()}
    <div class="arbre-zone${U.plein ? ' plein' : ''}" id="arbreZone">
    <div class="arbre-barre">
      ${U.plein ? `<b style="font-style:italic;font-size:17px;margin-right:4px">🌳 ${esc(a ? a.nom : 'Mon arbre')}</b>` : ''}
      ${l.length > 1 && peutModifier() ? `<select id="choixArbre" aria-label="Choisir un arbre">${l.map(x => `<option value="${x.id}"${a && a.id === x.id ? ' selected' : ''}>${esc((TYPES_ARBRE[x.type] || {}).e || '🌳')} ${esc(x.nom)}</option>`).join('')}</select>` : ''}
      <span class="groupe" role="group" aria-label="Vue">${modes.map(([m, n]) => `<button type="button" class="${U.mode === m ? 'actif' : ''}" data-act="arbre-mode" data-id="${m}">${n}</button>`).join('')}</span>
      <span class="groupe" role="group" aria-label="Sens">${U.mode === 'eventail' ? '' : `<button type="button" class="${U.sens === 'v' ? 'actif' : ''}" data-act="arbre-sens" data-id="v" title="Arbre vertical">↕ Vertical</button><button type="button" class="${U.sens === 'h' ? 'actif' : ''}" data-act="arbre-sens" data-id="h" title="Arbre horizontal">↔ Horizontal</button>`}</span>
      <select id="choixGen" aria-label="Nombre de générations">${[1, 2, 3, 4, 5, 6, 8].map(n => `<option value="${n}"${U.gen === n ? ' selected' : ''}>${n} génération${n > 1 ? 's' : ''}</option>`).join('')}<option value="99"${U.gen >= 99 ? ' selected' : ''}>🌳 Tout l'arbre (toutes les générations)</option></select>
      <span class="droite"><span class="groupe"><button type="button" data-act="zoom" data-id="-" title="Dézoomer">−</button><button type="button" data-act="zoom" data-id="0" title="Taille normale">${Math.round(U.zoom * 100)} %</button><button type="button" data-act="zoom" data-id="+" title="Zoomer">＋</button></span>
        ${a && r !== a.racine ? `<button type="button" class="btn fin petit" data-act="arbre-centre" title="Revenir à la personne au centre de l'arbre">⌂ Centre</button>` : ''}
        <button type="button" class="btn fin petit" data-act="zoom" data-id="ajuster" title="Voir tout l'arbre d'un coup d'œil">⤢ Ajuster</button>
        ${U.plein ? '' : '<button type="button" class="btn fin petit" data-act="imprimer-arbre">🖨️ PDF</button>'}
        <button type="button" class="btn petit" data-act="plein-ecran" title="${U.plein ? 'Revenir à la page (Échap)' : 'Afficher l’arbre en plein écran'}">${U.plein ? '✕ Quitter le plein écran' : '⛶ Plein écran'}</button></span>
    </div>
    <div class="scene" id="scene">${dessinerArbre(r, { mode: U.mode, sens: U.sens, gen: U.gen, zoom: U.zoom })}</div>
    ${U.plein ? `<div class="legende-branches">${legendeBranches(a, a ? a.racine : r)}<span style="margin-left:auto;color:var(--ink-3)">Ctrl + molette pour zoomer · glisser pour se déplacer · Échap pour quitter</span></div>` : ''}
    </div>
    <div class="legende-branches">${legendeBranches(a, a ? a.racine : r)}</div>
    <p style="margin:6px 0 0;font-family:var(--ui);font-size:12px;color:var(--ink-3)">Cliquez sur une personne pour la mettre au centre — cliquez encore sur la personne au centre pour passer de « Famille » à « Sablier » (seulement ses ascendants et ses descendants) · glissez pour vous déplacer · <b style="color:#F6C66E">●</b> date à vérifier · traits en pointillés : lien adoptif, beau-parent ou ex</p>
    <div class="carte selection-arbre"><div class="profil-tete" style="margin:0">${rond(p, 64, a ? a.racine : r)}
      <div style="flex:1;min-width:200px"><b style="font-size:19px;font-style:italic">${esc(nomComplet(p))}</b>
        <div class="meta" style="font-family:var(--ui);font-size:13px;color:var(--ink-2)">${esc([a ? parente(a.racine, p.id) : '', p.profession].filter(Boolean).join(' · '))}</div>
        ${infosNaissance(p)}
        <div class="proches" style="margin-top:8px">${parentsDe(p.id).map(x => boutonProche(x.p, 'parent')).join('')}${conjointsDe(p.id).map(x => boutonProche(x.p, 'conjoint')).join('')}${enfantsDe(p.id).map(x => boutonProche(x.p, 'enfant')).join('')}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn petit" data-act="fiche" data-id="${p.id}">📄 Voir la fiche</button>
        ${peutModifier() ? `<button type="button" class="btn petit fin" data-act="proche-ajouter" data-id="${p.id}">＋ Ajouter un proche</button>` : ''}
        ${peutModifier() && a && a.racine !== p.id ? `<button type="button" class="btn petit fin" data-act="arbre-racine" data-id="${p.id}" title="Faire de cette personne le centre de l'arbre">⭐ Centre de l'arbre</button>` : ''}</div></div></div>`;
}
/* Naissance complète, âge et prochain anniversaire : ce qu'on veut savoir en cliquant sur quelqu'un. */
const aLieu = l => ' ' + String(l).replace(/^(?:à )?/, 'à ').replace(/^à Le /, 'au ').replace(/^à Les /, 'aux ');
function infosNaissance(p) {
  if (p.masque) return '<div class="naiss">🌱 Personne vivante — détails protégés</div>';
  const e = genre(p, 'e', '', '·e'), age = ageDe(p), l = [];
  if (p.nD || p.nLieu) l.push(`<span>👶 Né${e} ${p.nD ? (dateComplete(p.nD) && (!p.nQ || p.nQ === 'exacte') ? 'le ' : '') + esc(texteDate(p.nD, p.nQ)) : ''}${p.nLieu ? esc(aLieu(p.nLieu)) : ''}</span>`);
  if (estDecede(p)) {
    if (p.dD || p.dLieu) l.push(`<span>🕯️ Décédé${e} ${p.dD ? (dateComplete(p.dD) && (!p.dQ || p.dQ === 'exacte') ? 'le ' : '') + esc(texteDate(p.dD, p.dQ)) : ''}${p.dLieu ? esc(aLieu(p.dLieu)) : ''}${age != null ? ', à ' + age + ' ans' : ''}</span>`);
  } else if (age != null) l.push(`<span><b>${age} an${age > 1 ? 's' : ''}</b>${p.nQ && p.nQ !== 'exacte' ? ' environ' : ''}</span>`);
  const n = anniversaireDans(p);
  if (n != null) l.push(n === 0 ? `<span class="anniv-fiche" style="margin:0">🎉 C'est son anniversaire aujourd'hui : ${age} ans !</span>`
    : `<span>🎂 Prochain anniversaire : ${esc(texteDate(iso(new Date(Date.now() + n * 864e5)).slice(0, 10)).replace(/ \d{4}$/, ''))} (${n === 1 ? 'demain' : 'dans ' + n + ' jours'}) — ${age + 1} ans</span>`);
  if (!l.length) return '<div class="naiss" style="color:var(--ink-3)">Date de naissance inconnue</div>';
  return `<div class="naiss">${l.join('')}</div>`;
}
function boutonProche(p, role) {
  return `<button type="button" class="proche" data-act="arbre-focus" data-id="${p.id}">${rond(p, 28)}<span>${esc(prenomDe(p))} <small>${esc(role === 'parent' ? genre(p, 'mère', 'père', 'parent') : role === 'conjoint' ? genre(p, 'conjointe', 'conjoint', 'conjoint·e') : genre(p, 'fille', 'fils', 'enfant'))}</small></span></button>`;
}

/* ============================================================
   3. Ma famille, et la fiche de chacun
   ============================================================ */
function vueFamille() {
  const a = arbreCourant(), r = racineCourante(), g = generations(r), q = sansAccent(U.q), b = branches(r);
  let l = (U.recu ? actifs('personnes') : membresArbre(a));
  const hors = U.recu ? [] : actifs('personnes').filter(p => !l.includes(p));
  l = l.filter(p => (!q || sansAccent([p.prenom, p.nom, p.surnom, p.nomUsage, p.nLieu, p.dLieu, p.profession].join(' ')).includes(q)) && (!U.filtreBranche || String(b.get(p.id) || 0) === U.filtreBranche));
  const groupes = new Map();
  l.forEach(p => { const k = g.has(p.id) ? g.get(p.id) : 99; if (!groupes.has(k)) groupes.set(k, []); groupes.get(k).push(p); });
  const cles = Array.from(groupes.keys()).sort((x, y) => y - x);
  const titreGen = n => n === 99 ? 'Sans lien avec le centre' : n === 0 ? 'Génération du centre' : n > 0 ? (n === 1 ? 'Parents, oncles et tantes' : n === 2 ? 'Grands-parents' : 'Génération ' + '+' + n + ' — ' + 'arrière-'.repeat(n - 2) + 'grands-parents') : (n === -1 ? 'Enfants, neveux et nièces' : n === -2 ? 'Petits-enfants' : 'Génération ' + n);
  const vus = new Set(b.values());
  return `<div class="section-titre"><h2>Ma <span>famille</span></h2><div class="droite">${peutModifier() ? '<button type="button" class="btn" data-act="personne-ajouter">👤 Ajouter une personne</button>' : ''}</div></div>
    <p class="chapo">Toutes les personnes ${a && !U.recu ? 'de l’arbre « ' + esc(a.nom) + ' »' : 'de l’arbre'}, génération par génération. Cliquez sur une personne pour ouvrir sa fiche.</p>
    ${banniereDoublons()}
    <div class="recherche"><input type="search" id="chercheFamille" placeholder="Rechercher un prénom, un nom, un lieu, un métier…" value="${esc(U.q)}" aria-label="Rechercher une personne"></div>
    ${vus.size ? `<div class="puces" style="margin-bottom:10px"><button type="button" class="puce${!U.filtreBranche ? ' actif' : ''}" data-act="filtre-branche" data-id="">Toutes les branches</button>
      ${[1, 2, 3, 4].filter(i => vus.has(i)).map(i => `<button type="button" class="puce${U.filtreBranche === String(i) ? ' actif' : ''}" data-act="filtre-branche" data-id="${i}"><span class="c" style="--c:${BRANCHES[i].c}"></span>${esc(nomBranche(a, i))}</button>`).join('')}</div>` : ''}
    ${cles.length ? cles.map(k => `<div class="gen-titre">${esc(titreGen(k))}</div><div class="fiches">${groupes.get(k).sort((x, y) => String(x.nD || '9').localeCompare(String(y.nD || '9'))).map(p => ficheP(p, r)).join('')}</div>`).join('')
      : `<div class="carte">${vide(q ? 'Personne ne correspond.' : 'Personne pour l’instant.', 'personne-ajouter', '👤 Ajouter une personne')}</div>`}
    ${hors.length && !q ? `<details class="plus-d" style="margin-top:18px"><summary>Dans d’autres arbres (${hors.length})</summary><div class="fiches">${hors.map(p => ficheP(p, r)).join('')}</div></details>` : ''}`;
}

function vueFiche() {
  const p = personne(U.pid);
  if (!p) { U.vue = 'famille'; return vueFamille(); }
  const r = racineCourante(), c = couleurBranche(r, p.id), mod = peutModifier();
  const fait = (e, lab, val, cert, extra = '') => val ? `<div class="fait"><small>${e} ${lab}</small><div class="v">${val}</div>${cert || extra ? `<div class="b">${cert ? badgeCert(cert, true) : ''}${extra}</div>` : ''}</div>` : '';
  const evs = actifs('evenements').filter(e => (e.personnes || []).includes(p.id)).sort((a, b) => String(a.date || '9').localeCompare(String(b.date || '9')));
  const phs = actifs('photos').filter(x => (x.personnes || []).includes(p.id));
  const his = actifs('histoires').filter(h => (h.personnes || []).includes(p.id));
  const docs = U.recu ? [] : S.documents.filter(d => !d.supprime && (d.personnes || []).includes(p.id));
  const srcs = (p.sources || []).map(source).filter(s => s && !s.supprime);
  const qs = U.recu ? [] : S.questions.filter(x => !x.supprime && x.pour === p.id);
  const bio = BIO.filter(([k]) => p.bio && p.bio[k]);
  const lienRole = (x, role) => `<span class="proche" style="cursor:default">${rond(x.p, 28)}<button type="button" class="lien-discret" style="text-decoration:none;color:var(--ink);padding:0" data-act="fiche" data-id="${x.p.id}">${esc(nomComplet(x.p))}</button>
    <small>${esc(role)}${x.lien && (x.lien.cert || 'verifier') !== 'confirme' ? ' · ' + certDe(x.lien.cert).nom.toLowerCase() : ''}</small>${mod && x.lien && x.lien.cert !== 'confirme' ? `<button type="button" class="ico-btn" data-act="certifier" data-k="liens" data-id="${x.lien.id}" title="Je sais que ce lien est vrai : marquer « confirmé »" aria-label="Confirmer le lien">✓</button>` : ''}${mod && x.lien ? `<button type="button" class="ico-btn" data-act="lien-modifier" data-id="${x.lien.id}" title="Préciser ce lien (nature, certitude, source)" aria-label="Modifier le lien">✏️</button>` : ''}</span>`;
  const parents = parentsDe(p.id), conj = conjointsDe(p.id), enf = enfantsDe(p.id), fr = fratrieDe(p.id), autres = autresLiensDe(p.id);
  return `<div class="section-titre"><button type="button" class="btn fin petit" data-act="retour">← Retour</button>
      <div class="droite">${mod ? `<button type="button" class="btn fin petit" data-act="personne-modifier" data-id="${p.id}">✏️ Modifier</button>
        <button type="button" class="btn petit" data-act="proche-ajouter" data-id="${p.id}">＋ Ajouter un proche</button>` : ''}
        ${peutProposer() ? `<button type="button" class="btn petit" data-act="contrib-correction" data-id="${p.id}">✍️ Proposer une correction</button>` : ''}
        <button type="button" class="btn fin petit" data-act="arbre-focus" data-id="${p.id}">🌳 Voir dans l'arbre</button></div></div>
    <div class="carte" style="border-top:4px solid ${esc(c)}">
      <div class="profil-tete" style="--c:${esc(c)}">${rond(p, 92, r)}
        <div style="flex:1;min-width:220px"><h2>${esc(nomComplet(p))}${p.surnom ? ` <span class="surnom">« ${esc(p.surnom)} »</span>` : ''}${anniversaireDans(p) === 0 ? ' ' + gateauIco(true, 30, phraseAnniv(p, 0)) : ''}</h2>
          ${anniversaireDans(p) != null && anniversaireDans(p) <= 30 ? `<div class="anniv-fiche">${anniversaireDans(p) === 0 ? '🎉 ' : '🎂 '}${esc(phraseAnniv(p, anniversaireDans(p)))}</div>` : ''}
          ${p.nomUsage ? `<div style="color:var(--ink-2);font-style:italic">Nom d'usage : ${esc(p.nomUsage)}</div>` : ''}
          <div class="meta"><span>${esc(parente(r, p.id))}</span>${periode(p) ? `<span>${esc(periode(p))}</span>` : ''}${ageDe(p) != null ? `<span>${estDecede(p) ? 'à ' + ageDe(p) + ' ans' : ageDe(p) + ' ans'}</span>` : ''}
            ${p.profession ? `<span>🛠️ ${esc(p.profession)}</span>` : ''}${mod ? badgeConfid(p) : ''}${estMineur(p) ? '<span class="badge mini">🛡️ Mineur — données protégées</span>' : estVivant(p) ? '<span class="badge mini">🌱 Personne vivante — protégée dans les partages</span>' : ''}</div></div></div>
      ${p.masque ? '<div class="note bleue"><span class="e">🌱</span><div>Cette personne est vivante : ses informations n’ont pas été partagées avec vous.</div></div>' : ''}
      <div class="faits">
        ${fait('👶', 'Naissance', [p.nD ? esc(texteDate(p.nD, p.nQ)) : '<span style="color:var(--ink-3)">date inconnue</span>', p.nLieu ? '📍 ' + esc(p.nLieu) : ''].filter(Boolean).join('<br>'), p.nD || p.nLieu ? (p.nCert || 'verifier') : '', (p.nD || p.nLieu) && p.nCert !== 'confirme' ? btnConfirmer('personnes', p.id, 'n') : '')}
        ${estDecede(p) ? fait('🕯️', 'Décès', [p.dD ? esc(texteDate(p.dD, p.dQ)) : '<span style="color:var(--ink-3)">date inconnue</span>', p.dLieu ? '📍 ' + esc(p.dLieu) : ''].filter(Boolean).join('<br>'), p.dD || p.dLieu ? (p.dCert || 'verifier') : '', (p.dD || p.dLieu) && p.dCert !== 'confirme' ? btnConfirmer('personnes', p.id, 'd') : '') : ''}
        ${fait('🛠️', 'Profession', esc(p.profession))}
        ${fait('📌', 'Sources', srcs.length ? srcs.map(s => `${typeSource(s.type).e} ${esc(s.titre)}`).join('<br>') : '', '', srcs.length ? '' : '<span class="badge bientot mini">Aucune source — informations familiales à vérifier</span>')}
        ${!srcs.length ? fait('📌', 'Sources', '<span style="color:var(--ink-3)">Aucune source pour l’instant</span>', '', mod ? `<button type="button" class="btn petit fin" data-act="source-ajouter" data-pour="${p.id}">＋ Ajouter une source</button>` : '') : ''}
      </div>
      ${p.notes ? `<p style="white-space:pre-line;color:var(--ink-2);margin:0 0 6px">${esc(p.notes)}</p>` : ''}
    </div>
    <div class="grille" style="margin-top:16px">
      <div class="carte"><h3><span class="e">👨‍👩‍👧</span>Sa famille</h3>
        ${parents.length ? `<div class="gen-titre" style="margin-top:0">Parents</div><div class="proches">${parents.map(x => lienRole(x, NATURES_PARENT[x.lien.nature || 'biologique'].nom)).join('')}</div>` : ''}
        ${fr.length ? `<div class="gen-titre">Frères et sœurs</div><div class="proches">${fr.map(x => lienRole({ p: x.p, lien: x.direct }, x.demi ? 'demi-' + genre(x.p, 'sœur', 'frère', 'frère ou sœur') : genre(x.p, 'sœur', 'frère', 'frère ou sœur'))).join('')}</div>` : ''}
        ${conj.length ? `<div class="gen-titre">Unions</div><div class="proches">${conj.map(x => lienRole(x, NATURES_UNION[x.lien.nature || 'union'].nom + (x.lien.debut ? ' · ' + texteAnnee(x.lien.debut, x.lien.debutQ) : ''))).join('')}</div>` : ''}
        ${enf.length ? `<div class="gen-titre">Enfants</div><div class="proches">${enf.map(x => lienRole(x, (x.lien.nature && x.lien.nature !== 'biologique' ? NATURES_PARENT[x.lien.nature].nom.replace('Parent', 'enfant').toLowerCase() + ' · ' : '') + genre(x.p, 'fille', 'fils', 'enfant'))).join('')}</div>` : ''}
        ${autres.length ? `<div class="gen-titre">Liens importants</div><div class="proches">${autres.map(x => lienRole(x, (x.lien.libelle || NATURES_AUTRE[x.lien.nature].nom))).join('')}</div>` : ''}
        ${!parents.length && !conj.length && !enf.length && !fr.length ? vide('Aucun proche relié pour l’instant.', '', '') : ''}
        ${mod ? `<div style="margin-top:12px"><button type="button" class="btn petit fin" data-act="proche-ajouter" data-id="${p.id}">＋ Ajouter un proche</button> <button type="button" class="btn petit fin" data-act="lien-relier" data-id="${p.id}">🔗 Relier à une personne existante</button></div>` : ''}</div>
      <div class="carte"><h3><span class="e">🗓️</span>Événements de sa vie${mod ? `<button type="button" class="ico-btn plus" data-act="evenement-ajouter" data-pour="${p.id}" title="Ajouter un événement">＋</button>` : ''}</h3>
        ${evs.length ? `<div class="lignes">${evs.map(e => ligneMini(typeEv(e.type).e, e.titre || typeEv(e.type).nom, esc([texteDate(e.date, e.dateQ), e.lieu].filter(Boolean).join(' · ')) + ' ' + badgeCert(e.cert, true), mod ? 'evenement-modifier' : '', e.id, e.cert !== 'confirme' ? btnConfirmer('evenements', e.id) : '')).join('')}</div>`
          : vide('Mariage, déménagement, diplôme, métier, arrivée dans une région…', 'evenement-ajouter" data-pour="' + p.id, '＋ Ajouter un événement')}</div>
      <div class="carte large"><h3><span class="e">📖</span>Sa biographie${mod ? `<button type="button" class="ico-btn plus" data-act="personne-modifier" data-id="${p.id}" data-onglet="bio" title="Écrire sa biographie">✏️</button>` : ''}</h3>
        ${bio.length ? `<div class="bio">${bio.map(([k, n]) => `<div class="bloc"><h4>${n}</h4><p>${esc(p.bio[k])}</p></div>`).join('')}</div>`
          : vide('Enfance, études, métiers, lieux de vie, passions, habitudes, souvenirs, anecdotes : racontez qui était ' + esc(prenomDe(p)) + '.', '', '')}
        ${(p.citations || []).length ? `<div class="gen-titre">Ses mots, ses expressions</div>${p.citations.map(c => `<div class="citation">${esc(c.t)}${c.ctx ? `<small>${esc(c.ctx)}</small>` : ''}</div>`).join('')}` : ''}
        ${mod ? `<button type="button" class="btn petit fin" data-act="citation-ajouter" data-id="${p.id}">💬 Ajouter une citation, une expression</button>` : ''}</div>
      <div class="carte"><h3><span class="e">📷</span>Photos${mod || peutProposer() ? `<button type="button" class="ico-btn plus" data-act="photo-ajouter" data-pour="${p.id}" title="Ajouter une photo">＋</button>` : ''}</h3>
        ${phs.length ? `<div class="photos" style="grid-template-columns:repeat(auto-fill,minmax(96px,1fr))">${phs.slice(0, 9).map(x => cartePhoto(x, true)).join('')}</div>` : vide('Aucune photo pour l’instant.')}</div>
      <div class="carte"><h3><span class="e">✍️</span>Histoires${mod || peutProposer() ? `<button type="button" class="ico-btn plus" data-act="histoire-ajouter" data-pour="${p.id}" title="Raconter une histoire">＋</button>` : ''}</h3>
        ${his.length ? `<div class="lignes">${his.map(h => ligneMini(genreH(h.genre).e, h.titre, esc(genreH(h.genre).nom) + (h.audio ? ' · 🎙️' : ''), 'histoire-ouvrir', h.id)).join('')}</div>` : vide('Une anecdote, une recette, une chanson, un témoignage…')}</div>
      ${U.recu ? '' : `<div class="carte"><h3><span class="e">📜</span>Documents<button type="button" class="ico-btn plus" data-act="document-ajouter" data-pour="${p.id}" title="Ajouter un document">＋</button></h3>
        ${docs.length ? `<div class="lignes">${docs.map(d => ligneMini(typeDoc(d.type).e, d.titre, esc(typeDoc(d.type).nom) + (d.date ? ' · ' + esc(texteDate(d.date, d.dateQ)) : ''), 'document-ouvrir', d.id)).join('')}</div>` : vide('Acte de naissance, livret de famille, lettre…')}</div>
      <div class="carte"><h3><span class="e">💬</span>À demander à la famille<button type="button" class="ico-btn plus" data-act="question-ajouter" data-pour="${p.id}" title="Ajouter une question">＋</button></h3>
        ${qs.length ? `<div class="lignes">${qs.map(ligneQuestion).join('')}</div>` : vide('Préparez les questions à poser : « Quel était son métier ? », « As-tu une photo ? »…', 'question-ajouter" data-pour="' + p.id, '💬 Préparer une question')}</div>`}
      ${mod ? `<div class="carte large" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="color:var(--ink-3);font-family:var(--ui);font-size:13px;flex:1">Créée le ${esc(texteDate((p.cree || auj()).slice(0, 10)))}</span>
        <button type="button" class="btn petit fin" data-act="corbeille-mettre" data-k="personnes" data-id="${p.id}">🗑️ Mettre à la corbeille</button></div>` : ''}
    </div>`;
}
function ligneQuestion(x) {
  const p = x.pour && personne(x.pour);
  return `<div class="question${x.fait ? ' fait' : ''}"><input type="checkbox" data-act="question-cocher" data-id="${x.id}" ${x.fait ? 'checked' : ''} aria-label="Question posée" style="width:18px;height:18px;margin-top:3px;accent-color:#7C6BE0">
    <div class="q"><b>${esc(x.q)}</b><div class="s" style="font-family:var(--ui);font-size:12px;color:var(--ink-3)">${p ? 'À propos de ' + esc(prenomDe(p)) : 'Question générale'}${x.a ? ' · à demander à ' + esc(x.a) : ''}</div>
      ${x.reponse ? `<div class="rep">↳ ${esc(x.reponse)}</div>` : ''}</div>
    <button type="button" class="ico-btn" data-act="question-modifier" data-id="${x.id}" title="Noter la réponse" aria-label="Modifier">✏️</button></div>`;
}

/* ============================================================
   4. Nos histoires
   ============================================================ */
function vueHistoires() {
  const toutes = actifs('histoires'), l = toutes.filter(h => !U.genreH || h.genre === U.genreH).sort((a, b) => String(b.cree).localeCompare(a.cree));
  const genres = Object.keys(GENRES_HISTOIRE).filter(g => toutes.some(h => h.genre === g));
  const citations = actifs('personnes').flatMap(p => (p.citations || []).map(c => ({ c, p })));
  return `<div class="section-titre"><h2>Nos <span>histoires</span></h2><div class="droite">${peutModifier() || peutProposer() ? '<button type="button" class="btn" data-act="histoire-ajouter">✍️ Raconter une histoire</button>' : ''}</div></div>
    <p class="chapo">Les récits de famille, les recettes, les traditions, les fêtes, les chansons, les expressions, les histoires de migration et les souvenirs d'enfance.
      Un témoignage peut être enregistré à voix haute, avec l'accord de la personne.</p>
    ${genres.length > 1 ? `<div class="puces" style="margin-bottom:14px"><button type="button" class="puce${!U.genreH ? ' actif' : ''}" data-act="histoires-genre" data-id="">Toutes <span class="n">${toutes.length}</span></button>
      ${genres.map(g => `<button type="button" class="puce${U.genreH === g ? ' actif' : ''}" data-act="histoires-genre" data-id="${g}">${genreH(g).e} ${esc(genreH(g).nom)} <span class="n">${toutes.filter(h => h.genre === g).length}</span></button>`).join('')}</div>` : ''}
    ${l.length ? `<div class="histoires">${l.map(h => `<button type="button" class="histoire" data-act="histoire-ouvrir" data-id="${h.id}">
        <div class="genre">${genreH(h.genre).e} ${esc(genreH(h.genre).nom)}</div><h4>${esc(h.titre)}</h4><p>${esc(h.texte || '')}</p>
        <div class="bas">${nomsDe(h.personnes)}${h.audio ? '<span class="badge mini">🎙️ Audio</span>' : ''}${h.cert && h.cert !== 'verifier' ? badgeCert(h.cert, true) : ''}${peutModifier() ? badgeConfid(h) : ''}</div></button>`).join('')}</div>`
      : `<div class="carte">${vide('Aucune histoire encore. Commencez par un souvenir, même tout petit : une odeur de cuisine, une phrase de grand-mère, un départ en bateau…', 'histoire-ajouter', '✍️ Raconter une histoire')}</div>`}
    ${citations.length && !U.genreH ? `<div class="gen-titre">Citations, expressions et petites phrases transmises</div><div class="grille">${citations.map(({ c, p }) => `<div class="citation">${esc(c.t)}<small>— ${esc(nomComplet(p))}${c.ctx ? ', ' + esc(c.ctx) : ''}</small></div>`).join('')}</div>` : ''}`;
}

/* ============================================================
   5. Albums et photos
   ============================================================ */
function cartePhoto(ph, mini) {
  return `<button type="button" class="photo" data-act="photo-ouvrir" data-id="${ph.id}"><span class="img">${imgPhoto(ph)}</span>
    ${mini ? '' : `<span class="leg"><b>${esc(ph.legende || 'Sans légende')}</b>${esc([ph.date ? texteAnnee(ph.date, ph.dateQ) : '', ph.lieu].filter(Boolean).join(' · '))}</span>`}
    <span class="coin">${ph.amelioree ? '<span class="badge mini" title="Version améliorée ou colorisée — interprétation visuelle">✨</span>' : ''}${!(ph.personnes || []).length && !mini ? '<span class="badge bientot mini">À identifier</span>' : ''}</span></button>`;
}
function carteAlbum(al, mini) {
  const phs = S.photos.filter(p => !p.supprime && (p.albums || []).includes(al.id)), couv = al.couverture && photo(al.couverture) ? [photo(al.couverture), ...phs.filter(p => p.id !== al.couverture)] : phs;
  const cases = couv.slice(0, mini ? 1 : 3);
  return `<button type="button" class="album" data-act="album-ouvrir" data-id="${al.id}"><span class="couv${cases.length < 2 || mini ? ' seule' : ''}">${cases.length ? cases.map(p => `<span>${imgPhoto(p)}</span>`).join('') : `<span>${esc(al.e || '🖼️')}</span>`}</span>
    <span class="txt"><b>${esc(al.e || '')} ${esc(al.nom)}</b><small>${phs.length} photo${phs.length > 1 ? 's' : ''}</small></span></button>`;
}
function vueAlbums() {
  const toutes = actifs('photos');
  if (U.album && album(U.album) && !U.recu) {
    const al = album(U.album), l = toutes.filter(p => (p.albums || []).includes(al.id));
    return `<div class="section-titre"><button type="button" class="btn fin petit" data-act="album-fermer">← Albums</button><h2>${esc(al.e || '🖼️')} <span>${esc(al.nom)}</span></h2>
        <div class="droite"><button type="button" class="btn fin petit" data-act="album-modifier" data-id="${al.id}">✏️ Modifier l'album</button><button type="button" class="btn" data-act="photo-ajouter" data-album="${al.id}">📷 Ajouter des photos</button></div></div>
      ${al.desc ? `<p class="chapo">${esc(al.desc)}</p>` : ''}
      ${l.length ? `<div class="photos">${l.map(p => cartePhoto(p)).join('')}</div>` : `<div class="carte">${vide('Cet album est vide.', '', '')}</div>`}`;
  }
  const r = racineCourante(), g = generations(r);
  const par = { tout: 'Toutes les photos', personne: 'Par personne', branche: 'Par branche', annee: 'Par année', lieu: 'Par lieu', evenement: 'Par événement', generation: 'Par génération', identifier: 'À identifier' };
  const vue = U.albums || (U.recu ? 'tout' : 'albums');
  const regrouper = (cle) => { const m = new Map(); toutes.forEach(p => { const ks = cle(p); (ks.length ? ks : ['—']).forEach(k => { if (!m.has(k)) m.set(k, []); m.get(k).push(p); }); }); return m; };
  let corps = '';
  if (vue === 'albums') {
    const l = S.albums.filter(a => !a.supprime);
    corps = l.length ? `<div class="albums">${l.map(a => carteAlbum(a)).join('')}</div>` : `<div class="carte">${vide('Créez vos premiers albums : mariages, anniversaires, vacances, enfance, générations, traditions…', 'album-ajouter', '＋ Créer un album')}</div>`;
  } else if (vue === 'tout' || vue === 'identifier') {
    const l = (vue === 'identifier' ? toutes.filter(p => !(p.personnes || []).length) : toutes).slice().sort((a, b) => String(a.date || '9').localeCompare(String(b.date || '9')));
    corps = l.length ? `<div class="photos">${l.map(p => cartePhoto(p)).join('')}</div>` : `<div class="carte">${vide(vue === 'identifier' ? 'Toutes les photos ont au moins une personne nommée. 🌿' : 'Aucune photo pour l’instant.', 'photo-ajouter', '📷 Ajouter une photo')}</div>`;
  } else {
    const b = branches(r), a = arbreCourant();
    const fn = { personne: p => (p.personnes || []).map(id => personne(id)).filter(Boolean).map(nomComplet), annee: p => p.date ? [String(Math.floor(annee(p.date) / 10) * 10) + 's'] : [],
      lieu: p => p.lieu ? [p.lieu] : [], evenement: p => p.evenement ? [p.evenement] : [],
      branche: p => Array.from(new Set((p.personnes || []).map(id => b.get(id) || 0))).map(i => i ? nomBranche(a, i) : 'Famille proche'),
      generation: p => Array.from(new Set((p.personnes || []).filter(id => g.has(id)).map(id => g.get(id)))).map(n => n === 0 ? 'Génération du centre' : n > 0 ? 'Génération +' + n : 'Génération ' + n) }[vue];
    const m = regrouper(fn), cles = Array.from(m.keys()).sort((x, y) => x === '—' ? 1 : y === '—' ? -1 : x.localeCompare(y, 'fr'));
    corps = toutes.length ? cles.map(k => `<div class="gen-titre">${esc(k === '—' ? 'Non renseigné' : vue === 'annee' ? 'Années ' + k.replace('s', '') : k)} · ${m.get(k).length}</div><div class="photos">${m.get(k).map(p => cartePhoto(p)).join('')}</div>`).join('')
      : `<div class="carte">${vide('Aucune photo pour l’instant.', 'photo-ajouter', '📷 Ajouter une photo')}</div>`;
  }
  return `<div class="section-titre"><h2>Nos <span>albums</span></h2><div class="droite">${peutModifier() ? '<button type="button" class="btn fin" data-act="album-ajouter">＋ Créer un album</button>' : ''}
      ${peutModifier() || peutProposer() ? '<button type="button" class="btn" data-act="photo-ajouter">📷 Ajouter des photos</button>' : ''}</div></div>
    <div class="puces" style="margin-bottom:14px">${U.recu ? '' : `<button type="button" class="puce${vue === 'albums' ? ' actif' : ''}" data-act="albums-vue" data-id="albums">📚 Albums</button>`}
      ${Object.entries(par).map(([k, n]) => `<button type="button" class="puce${vue === k ? ' actif' : ''}" data-act="albums-vue" data-id="${k}">${esc(n)}${k === 'identifier' ? ` <span class="n">${toutes.filter(p => !(p.personnes || []).length).length}</span>` : ''}</button>`).join('')}</div>
    ${corps}`;
}

/* ============================================================
   6. Documents & sources
   ============================================================ */
function vueDocuments() {
  const docs = S.documents.filter(d => !d.supprime).sort((a, b) => String(b.cree).localeCompare(a.cree)), srcs = S.sources.filter(s => !s.supprime);
  const utilisations = s => ['personnes', 'liens', 'evenements'].reduce((t, k) => t + S[k].filter(x => !x.supprime && (x.sources || []).includes(s.id)).length, 0);
  return `<div class="section-titre"><h2>Documents <span>& sources</span></h2><div class="droite"><button type="button" class="btn fin" data-act="source-ajouter">📌 Ajouter une source</button><button type="button" class="btn" data-act="document-ajouter">📜 Ajouter un document</button></div></div>
    <p class="chapo">Chaque information de l'arbre peut dire d'où elle vient. Tant que vous ne l'avez pas confirmée, elle reste une <b>information familiale à vérifier</b>.</p>
    <div class="puces" style="margin-bottom:14px"><button type="button" class="puce${U.docs === 'documents' ? ' actif' : ''}" data-act="docs-vue" data-id="documents">📄 Documents <span class="n">${docs.length}</span></button>
      <button type="button" class="puce${U.docs === 'sources' ? ' actif' : ''}" data-act="docs-vue" data-id="sources">📌 Sources <span class="n">${srcs.length}</span></button></div>
    ${U.docs === 'sources'
      ? (srcs.length ? `<div class="lignes">${srcs.map(s => `<div class="ligne"><div class="pic">${typeSource(s.type).e}</div><div class="corps"><div class="t">${esc(s.titre)}</div>
          <div class="s"><span>${esc(typeSource(s.type).nom)}</span>${s.date ? `<span>${esc(texteDate(s.date))}</span>` : ''}${s.ref ? `<span>🔖 ${esc(s.ref)}</span>` : ''}${s.auteur ? `<span>🗣️ ${esc(s.auteur)}</span>` : ''}<span>${utilisations(s)} information${utilisations(s) > 1 ? 's' : ''} appuyée${utilisations(s) > 1 ? 's' : ''}</span></div></div>
          <div class="fin-l">${s.type === 'officiel' || s.type === 'archive' ? '<span class="badge ok mini">Source officielle</span>' : ''}<button type="button" class="ico-btn" data-act="source-modifier" data-id="${s.id}" aria-label="Modifier">✏️</button>
          <button type="button" class="ico-btn" data-act="corbeille-mettre" data-k="sources" data-id="${s.id}" aria-label="Mettre à la corbeille">🗑️</button></div></div>`).join('')}</div>`
        : `<div class="carte">${vide('Témoignage familial, document officiel, archive, photo, recherche personnelle… ajoutez vos sources.', 'source-ajouter', '📌 Ajouter une source')}</div>`)
      : (docs.length ? `<div class="lignes">${docs.map(d => `<div class="ligne cliquable" data-act="document-ouvrir" data-id="${d.id}"><div class="pic">${typeDoc(d.type).e}</div><div class="corps"><div class="t">${esc(d.titre)}</div>
          <div class="s"><span>${esc(typeDoc(d.type).nom)}</span>${d.date ? `<span>${esc(texteDate(d.date, d.dateQ))}</span>` : ''}${d.lieu ? `<span>📍 ${esc(d.lieu)}</span>` : ''}${nomsDe(d.personnes)}</div></div>
          <div class="fin-l">${d.fichier ? '<span class="badge mini">📎 Fichier</span>' : ''}${badgeConfid(d)}</div></div>`).join('')}</div>`
        : `<div class="carte">${vide('Livret de famille, actes de naissance, de mariage ou de décès, lettres, cartes postales, certificats, diplômes, arbres dessinés, coupures de presse…', 'document-ajouter', '📜 Ajouter un document')}</div>`)}`;
}

/* ============================================================
   7. La frise familiale, et la carte des lieux
   ============================================================ */
function evenementsFrise() {
  const l = [], r = racineCourante(), filtre = U.filtreFrise;
  const garde = ids => !filtre || (filtre.startsWith('b') ? ids.some(id => String(branches(r).get(id) || 0) === filtre.slice(1)) : ids.includes(filtre));
  actifs('personnes').filter(p => !p.masque).forEach(p => {
    if (p.nD && garde([p.id])) l.push({ date: p.nD, q: p.nQ, e: '👶', titre: 'Naissance de ' + nomComplet(p), lieu: p.nLieu, cert: p.nCert, ids: [p.id], c: couleurBranche(r, p.id) });
    if (p.dD && garde([p.id])) l.push({ date: p.dD, q: p.dQ, e: '🕯️', titre: 'Décès de ' + nomComplet(p), lieu: p.dLieu, cert: p.dCert, ids: [p.id], c: couleurBranche(r, p.id) });
  });
  liensActifs().filter(x => x.t === 'union').forEach(u => {
    const a = personne(u.a), b = personne(u.b); if (!garde([u.a, u.b])) return;
    if (u.debut) l.push({ date: u.debut, q: u.debutQ, e: NATURES_UNION[u.nature || 'union'].e, titre: (u.nature === 'mariage' || (u.nature === 'ex' && u.etaitMariage) ? 'Mariage' : 'Union') + ' de ' + prenomDe(a) + ' et ' + prenomDe(b), lieu: u.lieu, cert: u.cert, ids: [u.a, u.b], c: 'var(--rose)' });
    if (u.fin) l.push({ date: u.fin, q: u.finQ, e: '💔', titre: 'Séparation de ' + prenomDe(a) + ' et ' + prenomDe(b), cert: u.cert, ids: [u.a, u.b], c: 'var(--rose)' });
  });
  actifs('evenements').filter(e => e.date && garde(e.personnes || [])).forEach(e => l.push({ date: e.date, q: e.dateQ, e: typeEv(e.type).e, titre: e.titre || typeEv(e.type).nom, lieu: e.lieu, cert: e.cert, ids: e.personnes || [], c: 'var(--bleu)', ev: e.id, desc: e.desc }));
  actifs('histoires').filter(h => h.date && garde(h.personnes || [])).forEach(h => l.push({ date: h.date, q: h.dateQ, e: genreH(h.genre).e, titre: h.titre, lieu: h.lieu, ids: h.personnes || [], c: 'var(--or)', histoire: h.id }));
  return l.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
function epoque(v) { const a = annee(v); return a < 1800 ? 'Avant 1800' : a < 1900 ? 'XIXe siècle — années ' + Math.floor(a / 10) * 10 : 'Années ' + Math.floor(a / 10) * 10; }
function friseHTML(l, impression) {
  let h = '', ep = '';
  l.forEach(x => {
    const e = epoque(x.date); if (e !== ep) { h += `<div class="epoque">${esc(e)}</div>`; ep = e; }
    h += `<div class="ev" style="--c:${x.c}"><div class="quand">${esc(texteDate(x.date, x.q))}</div><div class="quoi"><b>${x.e} ${esc(x.titre)}</b>
      <div class="s">${x.lieu ? `<span>📍 ${esc(x.lieu)}</span>` : ''}${x.cert ? badgeCert(x.cert, true) : ''}${impression ? '' : nomsDe(x.ids, 4)}${x.desc ? `<span>${esc(couper(x.desc, 120))}</span>` : ''}
      ${!impression && x.histoire ? `<button type="button" class="voir-tout" style="margin:0" data-act="histoire-ouvrir" data-id="${x.histoire}">Lire →</button>` : ''}${!impression && x.ev && peutModifier() ? `<button type="button" class="ico-btn" data-act="evenement-modifier" data-id="${x.ev}" aria-label="Modifier">✏️</button>` : ''}</div></div></div>`;
  });
  return `<div class="frise">${h}</div>`;
}
function lieuxFamille() {
  const m = new Map(), inconnus = new Map(), routes = [];
  const noter = (texte, qui, quoi) => {
    if (!texte) return null;
    const l = trouverLieu(texte);
    if (!l) { const k = sansAccent(texte); if (!inconnus.has(k)) inconnus.set(k, { nom: texte, n: 0 }); inconnus.get(k).n++; return null; }
    const k = l.nom; if (!m.has(k)) m.set(k, { cle: k, nom: l.nom, lat: l.lat, lon: l.lon, n: 0, qui: new Set(), quoi: new Set() });
    const x = m.get(k); x.n++; if (qui) x.qui.add(qui); if (quoi) x.quoi.add(quoi); return x;
  };
  actifs('personnes').filter(p => !p.masque).forEach(p => {
    const chemin = [];
    const a = noter(p.nLieu, p.id, 'naissance'); if (a) chemin.push({ d: p.nD || '0', l: a });
    actifs('evenements').filter(e => (e.personnes || []).includes(p.id) && e.lieu).forEach(e => { const x = noter(e.lieu, p.id, typeEv(e.type).nom.toLowerCase()); if (x && ['demenagement', 'migration', 'arrivee', 'mariage', 'union', 'metier', 'diplome'].includes(e.type)) chemin.push({ d: e.date || '5', l: x }); });
    const b = noter(p.dLieu, p.id, 'décès'); if (b) chemin.push({ d: p.dD || '9999', l: b });
    const r = chemin.sort((x, y) => String(x.d).localeCompare(String(y.d))).map(x => x.l).filter((l, i, t) => !i || t[i - 1] !== l);
    if (r.length > 1) routes.push({ p, r });
  });
  actifs('photos').forEach(p => noter(p.lieu, null, 'photo'));
  actifs('histoires').forEach(h => noter(h.lieu, null, 'histoire'));
  return { places: Array.from(m.values()).sort((a, b) => b.n - a.n), inconnus: Array.from(inconnus.values()), routes };
}
function vueFrise() {
  const a = arbreCourant(), r = racineCourante(), b = branches(r), vus = new Set(b.values());
  const filtres = `<select id="filtreFrise" aria-label="Filtrer"><option value="">Toute la famille</option>
    ${[1, 2, 3, 4].filter(i => vus.has(i)).map(i => `<option value="b${i}"${U.filtreFrise === 'b' + i ? ' selected' : ''}>Branche : ${esc(nomBranche(a, i))}</option>`).join('')}
    ${actifs('personnes').filter(p => !p.masque).sort((x, y) => nomComplet(x).localeCompare(nomComplet(y))).map(p => `<option value="${p.id}"${U.filtreFrise === p.id ? ' selected' : ''}>${esc(nomComplet(p))}</option>`).join('')}</select>`;
  const onglets = `<div class="puces" style="margin-bottom:14px"><button type="button" class="puce${U.frise === 'frise' ? ' actif' : ''}" data-act="frise-vue" data-id="frise">⏳ Frise chronologique</button>
    <button type="button" class="puce${U.frise === 'carte' ? ' actif' : ''}" data-act="frise-vue" data-id="carte">🗺️ Carte des origines et des déplacements</button></div>`;
  if (U.frise === 'carte') {
    const { places, inconnus, routes } = lieuxFamille();
    return `<div class="section-titre"><h2>Nos <span>lieux</span></h2><div class="droite"><button type="button" class="btn fin petit" data-act="carte-monde">${U.monde ? '🔍 Resserrer sur nos lieux' : '🌍 Monde entier'}</button></div></div>${onglets}
      <p class="chapo">Villes, régions, îles et pays de la famille, et les chemins de vie de chacun (naissance → déménagements, migrations → décès). Une carte stylisée, pour se situer.</p>
      ${places.length ? `<div class="carte-lieux">${dessinerCarte(places, routes.map(x => x.r), { monde: U.monde })}</div>` : `<div class="carte">${vide('Aucun lieu reconnu pour l’instant. Indiquez des lieux de naissance, de vie ou d’événements.', '', '')}</div>`}
      ${inconnus.length && peutModifier() ? `<div class="note douce" style="margin-top:14px"><span class="e">📍</span><div style="flex:1">Ces lieux ne sont pas encore sur la carte : <b>${inconnus.map(x => esc(x.nom)).join(', ')}</b>. Vous pouvez les placer vous-même.</div>
        <button type="button" class="btn petit fin" data-act="lieu-placer">📍 Placer un lieu</button></div>` : ''}
      ${places.length ? `<div class="lieux-liste">${places.map(l => `<div class="ligne compacte"><div class="pic">📍</div><div class="corps"><div class="t">${esc(l.nom)}</div><div class="s">${esc(Array.from(l.quoi).join(', '))}</div></div>
        <div class="fin-l">${Array.from(l.qui).slice(0, 4).map(id => { const p = personne(id); return p ? `<span class="pastille-p" title="${esc(nomComplet(p))}" style="--c:${esc(couleurBranche(racineCourante(), p.id))}">${p.photo ? `<img src="${p.photo}" alt="">` : esc(initiale(p))}</span>` : ''; }).join('')}</div></div>`).join('')}</div>` : ''}
      ${routes.length ? `<div class="gen-titre">Chemins de vie</div><div class="lignes">${routes.map(x => ligneMini(rond(x.p, 32), nomComplet(x.p), esc(x.r.map(l => l.nom).join(' → ')), 'fiche', x.p.id)).join('')}</div>` : ''}`;
  }
  const l = evenementsFrise();
  return `<div class="section-titre"><h2>Frise <span>familiale</span></h2><div class="droite">${filtres}${peutModifier() ? '<button type="button" class="btn fin petit" data-act="evenement-ajouter">＋ Événement</button><button type="button" class="btn fin petit" data-act="imprimer-frise">🖨️ Frise imprimable</button>' : ''}</div></div>${onglets}
    ${l.length ? friseHTML(l) : `<div class="carte">${vide('Les naissances, unions, décès et événements datés apparaîtront ici, dans l’ordre du temps.', 'evenement-ajouter', '＋ Ajouter un événement')}</div>`}`;
}

/* ============================================================
   8. À compléter
   ============================================================ */
function aCompleter() {
  if (memo.completer && memo.src === D()) return memo.completer;
  const ps = actifs('personnes').filter(p => !p.masque);
  const c = {
    propositions: U.recu ? [] : S.propositions.filter(x => !x.traite),
    doublons: U.recu ? [] : groupesDoublons(),
    dates: ps.filter(p => !p.nD),
    liens: liensActifs().filter(l => (l.cert || 'verifier') === 'verifier' && l.nature !== 'fratrie'),
    infos: ps.filter(p => p.nD && aVerifier(p)),
    photos: actifs('photos').filter(p => !(p.personnes || []).length),
    sources: ps.filter(p => !(p.sources || []).some(id => source(id) && !source(id).supprime)),
    questions: U.recu ? [] : S.questions.filter(q => !q.supprime && !q.fait)
  };
  liensActifs(); memo.completer = c; return c;
}
function totalACompleter() { const c = aCompleter(); return c.propositions.length + c.doublons.length + c.dates.length + c.liens.length + c.infos.length + c.photos.length + c.questions.length; }
function vueCompleter() {
  const c = aCompleter();
  const bloc = (id, e, titre, texte, contenu) => `<div class="carte" id="bloc-${id}"><h3><span class="e">${e}</span>${titre}</h3>${texte ? `<p style="margin:-6px 0 10px;color:var(--ink-3);font-family:var(--ui);font-size:13px">${texte}</p>` : ''}${contenu}</div>`;
  const suggestions = suggestionsQuestions();
  return `<div class="section-titre"><h2>À <span>compléter</span></h2><div class="droite"><button type="button" class="btn" data-act="question-ajouter">💬 Préparer une question</button></div></div>
    <p class="chapo">Ce qui manque encore, sans pression : des dates, des liens à vérifier, des photos à identifier, des sources. Et les questions à poser à la famille tant qu'il est temps.</p>
    <div class="compteurs">${[['propositions', '📥', 'À valider'], ['doublons', '🧩', 'Doublons'], ['dates', '📅', 'Dates inconnues'], ['liens', '🔗', 'Liens à vérifier'], ['infos', '❔', 'Infos à vérifier'], ['photos', '🖼️', 'Photos à identifier'], ['sources', '📌', 'Sans source'], ['questions', '💬', 'Questions']]
      .map(([k, e, n]) => `<a class="compteur" href="#bloc-${k}" data-act="ancre" data-id="bloc-${k}"><small>${e} ${n}</small><b>${c[k].length}</b></a>`).join('')}</div>
    <div class="taches">
      ${c.propositions.length ? bloc('propositions', '📥', 'Propositions de vos proches', 'Rien n’entre dans votre arbre sans votre validation.', `<div class="lignes">${c.propositions.map(ligneProposition).join('')}</div>`) : ''}
      ${c.doublons.length ? bloc('doublons', '🧩', 'Doublons possibles', 'Même nom, et rien qui les distingue. Comparez, puis fusionnez — ou dites que ce sont des personnes différentes.',
        `${(() => { const ev = c.doublons.map(g => g.filter(p => g.some(q => q !== p && doublonEvident(p, q)))).reduce((t, g) => t + Math.max(0, g.length - 1), 0); return ev ? `<button type="button" class="btn petit" data-act="doublons-evidents" style="margin-bottom:10px">🧩 Fusionner les ${ev} doublon${ev > 1 ? 's' : ''} évident${ev > 1 ? 's' : ''}</button>` : ''; })()}
        <div class="lignes">${c.doublons.slice(0, 30).map((g, i) => ligneMini(rond(g[0], 32), nomComplet(g[0]) + ' × ' + g.length, esc(g.map(p => periode(p) || 'dates inconnues').join(' / ')), '', '', `<button type="button" class="btn petit fin" data-act="doublon-comparer" data-i="${i}">Comparer</button>`)).join('')}</div>
        ${c.doublons.length > 30 ? `<small style="color:var(--ink-3)">… et ${c.doublons.length - 30} autres groupes</small>` : ''}`) : ''}
      ${bloc('questions', '💬', 'À demander à la famille', '', `${c.questions.length ? `<div class="lignes">${c.questions.map(ligneQuestion).join('')}</div>` : vide('Aucune question en attente.')}
        ${suggestions.length ? `<div class="gen-titre">Questions prêtes à poser</div><div class="lignes">${suggestions.slice(0, 6).map(s => `<div class="ligne compacte"><div class="pic">💡</div><div class="corps"><div class="t" style="font-style:italic;white-space:normal">${esc(s.q)}</div><div class="s">${s.pour ? 'À propos de ' + esc(prenomDe(personne(s.pour))) : 'Question générale'}</div></div>
          <div class="fin-l"><button type="button" class="btn petit fin" data-act="question-garder" data-q="${esc(s.q)}" data-pour="${s.pour || ''}">＋ Garder</button></div></div>`).join('')}</div>` : ''}
        ${S.questions.some(q => q.fait && !q.supprime) ? `<details class="plus-d" style="margin-top:10px"><summary>Questions déjà posées (${S.questions.filter(q => q.fait && !q.supprime).length})</summary><div class="lignes">${S.questions.filter(q => q.fait && !q.supprime).map(ligneQuestion).join('')}</div></details>` : ''}`)}
      ${bloc('dates', '📅', 'Dates de naissance inconnues', 'Une année approximative suffit : « vers 1920 ».', c.dates.length ? `<div class="lignes">${c.dates.slice(0, 12).map(p => lignePersonne(p, 'Date de naissance inconnue')).join('')}</div>` : vide('Toutes les dates de naissance sont renseignées.'))}
      ${bloc('liens', '🔗', 'Liens à vérifier', 'Ces filiations et unions ne sont pas encore confirmées.', c.liens.length ? `<div class="lignes">${c.liens.slice(0, 12).map(l => ligneMini('🔗', prenomDe(personne(l.a)) + (l.t === 'parent' ? ' → parent de → ' : l.t === 'union' ? ' ♥ ' : ' · ') + prenomDe(personne(l.b)),
        esc(l.t === 'parent' ? NATURES_PARENT[l.nature || 'biologique'].nom : l.t === 'union' ? NATURES_UNION[l.nature || 'union'].nom : (NATURES_AUTRE[l.nature] || {}).nom || 'Lien'), 'lien-modifier', l.id, badgeCert(l.cert, true) + btnConfirmer('liens', l.id))).join('')}</div>` : vide('Tous les liens sont qualifiés.'))}
      ${bloc('infos', '❔', 'Informations à vérifier', 'Dates ou lieux saisis sans certitude.', c.infos.length ? `<div class="lignes">${c.infos.slice(0, 12).map(p => ligneMini(rond(p, 32), nomComplet(p), esc(texteDate(p.nD, p.nQ)) + ' · à vérifier', 'fiche', p.id, btnConfirmer('personnes', p.id))).join('')}</div>` : vide('Rien à vérifier.'))}
      ${bloc('photos', '🖼️', 'Photos à identifier', 'Qui est sur la photo ? Demandez aux anciens !', c.photos.length ? `<div class="photos" style="grid-template-columns:repeat(auto-fill,minmax(96px,1fr))">${c.photos.slice(0, 12).map(p => cartePhoto(p, true)).join('')}</div>` : vide('Toutes les photos sont identifiées.'))}
      ${bloc('sources', '📌', 'Fiches sans source', 'D’où vient l’information ? Un témoignage compte aussi.', c.sources.length ? `<div class="lignes">${c.sources.slice(0, 12).map(p => lignePersonne(p, 'Aucune source')).join('')}</div>` : vide('Chaque fiche a au moins une source. 🌿'))}
    </div>`;
}
function suggestionsQuestions() {
  const deja = new Set(S.questions.filter(q => !q.supprime).map(q => q.pour + '|' + q.q)), l = [];
  actifs('personnes').filter(p => !p.masque && estDecede(p) || (p.nD && annee(p.nD) < 1960)).forEach(p => {
    if (!p.profession) l.push({ q: 'Quel était le métier de ' + prenomDe(p) + ' ?', pour: p.id });
    if (!p.nLieu) l.push({ q: 'Où ' + prenomDe(p) + ' est-' + genre(p, 'elle', 'il', 'iel') + ' né' + genre(p, 'e', '', '·e') + ' ?', pour: p.id });
    if (!p.photo && !actifs('photos').some(x => (x.personnes || []).includes(p.id))) l.push({ q: 'As-tu une photo de ' + prenomDe(p) + ' ?', pour: p.id });
    if (!(p.bio && (p.bio.lieux || p.bio.souvenirs))) l.push({ q: 'Où vivait ' + prenomDe(p) + ' ? Quels souvenirs en gardes-tu ?', pour: p.id });
  });
  actifs('histoires').filter(h => h.genre === 'recette' && (h.texte || '').length < 200).forEach(h => l.push({ q: 'Quelle est l’histoire de la recette « ' + h.titre + ' » ?', pour: (h.personnes || [])[0] || '' }));
  QUESTIONS_PRETES.forEach(q => l.push({ q, pour: '' }));
  return l.filter(x => !deja.has(x.pour + '|' + x.q));
}
function ligneProposition(x) {
  const e = { histoire: '✍️', photo: '📷', correction: '📝', personne: '👤' }[x.t] || '📥';
  const titre = x.t === 'histoire' ? 'Histoire : « ' + (x.data.titre || '') + ' »' : x.t === 'photo' ? 'Photo : ' + (x.data.legende || 'sans légende') : x.t === 'correction' ? 'Correction pour ' + (x.data.pourNom || '') : 'Nouvelle personne : ' + (x.data.nom || '');
  return `<div class="ligne">${x.t === 'photo' && x.data.vignette ? `<div class="pic"><img src="${x.data.vignette}" alt=""></div>` : `<div class="pic">${e}</div>`}<div class="corps"><div class="t">${esc(titre)}</div>
    <div class="s"><span>Proposé par ${esc(x.de || 'un proche')}</span><span>${esc(texteDate((x.recu || auj()).slice(0, 10)))}</span>${x.data.texte ? `<span>${esc(couper(x.data.texte, 90))}</span>` : ''}</div></div>
    <div class="fin-l"><button type="button" class="btn petit fin" data-act="proposition-voir" data-id="${x.id}">Voir</button><button type="button" class="btn petit" data-act="proposition-accepter" data-id="${x.id}">✓ Accepter</button>
      <button type="button" class="btn petit fin" data-act="proposition-refuser" data-id="${x.id}">Refuser</button></div></div>`;
}

/* ============================================================
   9. Transmission
   ============================================================ */
const DROITS = {
  lecture: { nom: 'Lecture seule', e: '👀', d: 'Consulter l’arbre partagé, sans rien modifier.' },
  souvenirs: { nom: 'Ajout de souvenirs', e: '✍️', d: 'Proposer des histoires et des photos.' },
  profils: { nom: 'Modification des profils', e: '📝', d: 'Proposer aussi des corrections sur les fiches.' },
  admin: { nom: 'Administrateur', e: '🗝️', d: 'Proposer aussi de nouvelles personnes. Tout reste soumis à votre validation.' }
};
function vueTransmission() {
  const inv = S.invitations.filter(x => !x.supprime), recus = S.recus;
  const act = (e, t, d, a) => `<button type="button" class="action-t" data-act="${a}"><span class="e">${e}</span><b>${t}</b><small>${d}</small></button>`;
  return `<div class="section-titre"><h2>Trans<span>mission</span></h2></div>
    <p class="chapo">Garder, imprimer, offrir, partager avec les proches : tout ce qui permet à l'histoire de la famille de passer de main en main.
      Chaque export ou partage vous est d'abord montré et demande votre confirmation.</p>
    <div class="transmission">
      ${act('📕', 'Livre de famille (PDF)', 'Une couverture, l’arbre, les biographies, les photos et les histoires choisies — à imprimer ou enregistrer en PDF.', 'livre')}
      ${act('🌳', 'Arbre imprimable (PDF)', 'L’arbre tel qu’il est affiché, sur une page à imprimer ou enregistrer en PDF.', 'imprimer-arbre')}
      ${act('⏳', 'Frise familiale imprimable', 'Toute la chronologie de la famille, prête à imprimer.', 'imprimer-frise')}
      ${act('💌', 'Inviter un proche', 'Préparer une invitation pour un arbre précis, avec des droits choisis. Rien n’est envoyé sans vous.', 'inviter')}
      ${act('📤', 'Exporter en GEDCOM', 'Le format commun des logiciels de généalogie, pour garder vos données et les utiliser ailleurs.', 'gedcom-exporter')}
      ${act('📥', 'Importer un GEDCOM', 'Reprendre un arbre venu d’un autre logiciel (.ged, ou un .zip avec ses photos). Tout arrive « à vérifier ».', 'gedcom-importer')}
      ${mediasEnAttente().length ? act('📷', 'Photos du GEDCOM (' + mediasEnAttente().length + ')', 'Des photos citées par votre GEDCOM attendent leurs fichiers : montrez le dossier où elles se trouvent.', 'photos-ged') : ''}
      ${act('💾', 'Sauvegarder NaoRoots', 'Un fichier avec tout votre contenu (photos et documents compris, si vous le souhaitez).', 'sauvegarder')}
      ${act('📂', 'Ouvrir un fichier', 'Recharger une sauvegarde, ouvrir une invitation reçue ou les ajouts d’un proche.', 'ouvrir-fichier')}
    </div>
    <div class="grille" style="margin-top:18px">
      <div class="carte"><h3><span class="e">💌</span>Invitations préparées</h3>
        ${inv.length ? `<div class="lignes">${inv.map(x => ligneMini(DROITS[x.droit].e, x.nom, esc(DROITS[x.droit].nom) + ' · arbre « ' + esc((arbre(x.arbre) || {}).nom || '?') + ' » · ' + esc(texteDate(x.cree.slice(0, 10))), '', '',
          `<button type="button" class="btn petit fin" data-act="invitation-retirer" data-id="${x.id}" title="Ne plus considérer cet arbre comme partagé avec cette personne">Retirer</button>`)).join('')}</div>
          <div class="note douce" style="margin:10px 0 0"><span class="e">ℹ️</span><div>Une invitation est un fichier que vous transmettez vous-même. La retirer ici ne peut pas effacer une copie déjà transmise.</div></div>`
          : vide('Aucune invitation. Vos arbres sont privés.', 'inviter', '💌 Inviter un proche')}</div>
      <div class="carte"><h3><span class="e">🎁</span>Arbres reçus</h3>
        ${recus.length ? `<div class="lignes">${recus.map(x => ligneMini('🎁', x.arbreNom, 'Partagé par ' + esc(x.de || 'un proche') + ' · ' + esc(DROITS[x.droit].nom) + ((x.contributions || []).length ? ' · ' + x.contributions.length + ' ajout(s) à renvoyer' : ''), '', '',
          `<button type="button" class="btn petit" data-act="recu-ouvrir" data-id="${x.id}">Ouvrir</button><button type="button" class="ico-btn" data-act="recu-supprimer" data-id="${x.id}" aria-label="Retirer">🗑️</button>`)).join('')}</div>`
          : vide('Quand un proche vous invite, ouvrez son fichier avec 📂 : son arbre apparaîtra ici, à part du vôtre.')}</div>
    </div>`;
}

/* ============================================================
   Les outils Nao, et les Nao à venir
   ============================================================ */
const A_VENIR = [
  { nom: 'NaoStudy', role: 'Études & devoirs', desc: 'Emplois du temps, révisions et devoirs de toute la famille.' },
  { nom: 'NaoInvest', role: 'Épargne & placements', desc: 'Suivre son épargne et ses projets d’avenir, sereinement.' },
  { nom: 'NaoGarden', role: 'Jardin & plantes', desc: 'Arrosages, semis, récoltes et plantes de la maison.' },
  { nom: 'NaoEvent', role: 'Fêtes & événements', desc: 'Anniversaires, invitations, listes et budget des fêtes.' }
];
function vueEco() {
  const catalogue = (window.Nao && Nao.outils) || [];
  const reg = (window.NaoLogos && NaoLogos.outils) || [];
  const liste = catalogue.length ? catalogue.map(o => ({ id: o.id, nom: o.nom, role: o.role, desc: o.desc, chemin: o.chemin, symbole: o.symbole }))
    : reg.map(o => ({ id: o.id === 'l-ro' ? 'naoroots' : '', nom: o.nom, role: o.role, desc: '', chemin: '', symbole: o.id }));
  if (!liste.some(o => o.id === 'naoroots')) liste.push({ id: 'naoroots', nom: 'NaoRoots', role: 'Généalogie & mémoire familiale', symbole: 'l-ro' });
  const noms = new Set(liste.map(o => o.nom));
  const deco = n => { const i = n.indexOf('Nao'); return i === 0 ? `Nao<span>${esc(n.slice(3))}</span>` : esc(n); };
  return `<section class="eco" aria-labelledby="ecoTitre">
    <div class="tete-eco"><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#l-gr"/></svg><h2 id="ecoTitre">Les outils <span>Nao</span></h2></div>
    <p class="chapo" style="margin:4px 0 0">NaoRoots fait partie de la maison NaoGroup : chaque outil fait une chose, et ils se complètent.</p>
    <div class="outils-nao" id="outilsNao" style="margin-top:14px">
      ${liste.map(o => o.id === 'naoroots' ? `<div class="outil-nao" style="border-color:var(--accent)"><span class="badge ok ici">Vous êtes ici</span><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#l-ro"/></svg><b>${deco(o.nom)}</b><small>${esc(o.role)}</small></div>`
        : `<a class="outil-nao" ${o.id ? `data-outil="${o.id}"` : ''} href="${o.chemin ? '../' + encodeURI(o.chemin) : '../NaoGroup.html#outils'}">
        <svg viewBox="0 0 40 40" aria-hidden="true"><use href="#${esc(o.symbole)}"/></svg><b>${deco(o.nom)}</b><small>${esc(o.role)}</small>${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</a>`).join('')}
    </div>
    <h3>🔒 Les Nao <span style="color:var(--accent)">à venir</span></h3>
    <div class="outils-nao">
      ${A_VENIR.filter(o => !noms.has(o.nom)).map(o => `<div class="outil-nao venir" aria-disabled="true"><span class="verrou-ic">🔒</span><b>${deco(o.nom)}</b><small>${esc(o.role)}</small><small>${esc(o.desc)}</small><span class="badge bientot">Bientôt disponible</span></div>`).join('')}
      <div class="outil-nao venir" aria-disabled="true"><span class="verrou-ic">＋</span><b>Nao<span>…</span></b><small>La place est gardée</small><small>Le prochain outil du quotidien arrive.</small><span class="badge">Bientôt disponible</span></div>
    </div>
    <div class="explorer"><a class="btn gros" href="../NaoGroup.html#outils"><svg viewBox="0 0 40 40" style="width:22px;height:22px;border-radius:7px" aria-hidden="true"><use href="#l-gr"/></svg> Explorer NaoGroup</a></div>
  </section>`;
}
