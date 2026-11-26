'use strict';
/* ============================================================
   NaoHome — les pages
   ============================================================ */
const carteT = (em, titre, compte = '', extra = '') =>
  `<div class="carte-t"><span class="em">${em}</span><h2>${titre}</h2>${compte !== '' ? `<span class="compte">${compte}</span>` : ''}${extra}</div>`;
const videJoli = (em, texte, bouton = '') => `<div class="vide-joli"><span class="em">${em}</span>${texte}${bouton ? `<div style="margin-top:12px">${bouton}</div>` : ''}</div>`;
const sousPages = (page, liste) => `<div class="sous-pages">${liste.map(([k, l]) => `<button class="${V.sous[page] === k ? 'on' : ''}" data-act="sous" data-p="${page}" data-s="${k}">${l}</button>`).join('')}</div>`;
const titrePage = (titre, extra = '') => `<div class="titre-page"><h2>${titre}</h2><div class="spacer"></div>${extra}</div>`;
const nomFamille = () => { const a = adultes().find(m => m.nom) || personnes().find(m => m.nom); return a ? a.nom : ''; };

/* ============================================================
   Les dessins du logement (choix, accueil, ménage)
   ============================================================ */
function dessinLogement(type, piscine = false) {
  if (type === 'appartement') return `<svg class="dessin-l" viewBox="0 0 150 110" aria-hidden="true">
    <rect class="mur" x="38" y="10" width="74" height="92" rx="5"/>
    ${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect class="fen" x="${48 + c * 20}" y="${20 + r * 18}" width="12" height="10" rx="2" style="animation-delay:${((r * 3 + c) * .3).toFixed(1)}s"/>`).join('')).join('')}
    <rect class="toit" x="66" y="86" width="18" height="16" rx="2"/><path class="sol" d="M14 102h122"/></svg>`;
  return `<svg class="dessin-l" viewBox="0 0 150 110" aria-hidden="true">
    <path class="toit" d="M${piscine ? 14 : 30} 50 ${piscine ? 56 : 75} 14 ${piscine ? 98 : 120} 50Z"/>
    <rect class="mur" x="${piscine ? 22 : 38}" y="50" width="${piscine ? 68 : 74}" height="52" rx="3"/>
    <rect class="fen" x="${piscine ? 30 : 47}" y="60" width="14" height="12" rx="2"/><rect class="fen" x="${piscine ? 68 : 89}" y="60" width="14" height="12" rx="2"/>
    <path class="toit" d="M${piscine ? 49 : 66} 102V82a7 7 0 0 1 14 0v20Z"/>
    ${piscine ? `<rect class="eau" x="100" y="80" width="44" height="22" rx="6"/><path class="vague" d="M106 89c3 0 3-2.4 6-2.4s3 2.4 6 2.4 3-2.4 6-2.4 3 2.4 6 2.4M106 96c3 0 3-2.4 6-2.4s3 2.4 6 2.4 3-2.4 6-2.4 3 2.4 6 2.4"/>` : ''}
    <path class="sol" d="M8 102h134"/></svg>`;
}

/* ============================================================
   Accueil — le tout premier choix, puis la maison d'un coup d'œil
   ============================================================ */
function assistant() {
  const etape = V.typeChoisi === 'maison' ? 2 : 1;
  const points = `<div class="etape-n" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= etape ? 'on' : ''}"></i>`).join('')}</div>`;
  if (etape === 1) return `<section class="assistant">
      <svg class="logo" viewBox="0 0 40 40" aria-hidden="true" style="width:92px;height:92px;border-radius:30px;box-shadow:0 26px 60px -24px var(--acc-lueur);animation:respire 5s ease-in-out infinite"><use href="#nao-logo"/></svg>
      <div>${points}</div>
      <h2>Bienvenue dans Nao<span style="color:transparent;background:var(--grad-vif);background-size:220% 100%;-webkit-background-clip:text;background-clip:text">Home</span></h2>
      <p>Pour commencer, un seul choix : <b>dans quoi vivez-vous ?</b> NaoHome s'adapte à votre logement — les pièces du ménage, la piscine, tout le reste suit.</p>
      <div class="choix-logement">
        <button type="button" class="choix-l" data-act="logement-type" data-t="maison">${dessinLogement('maison')}<b>Une maison</b><span>Avec ou sans piscine : on vous le demande juste après.</span></button>
        <button type="button" class="choix-l" data-act="logement-type" data-t="appartement">${dessinLogement('appartement')}<b>Un appartement</b><span>Studio, T2, T4… les pièces se choisissent ensuite.</span></button>
      </div>
      <div class="pied" style="justify-content:center;margin-top:22px"><button class="btn" data-act="exemple">✨ Découvrir avec une famille d'exemple</button></div>
    </section>`;
  return `<section class="assistant">
      <div>${points}</div>
      <h2>Une maison… avec une piscine ?</h2>
      <p>Avec une piscine, une page <b>🏊 Piscine</b> s'ajoute à NaoHome : l'entretien, le suivi du pH et du chlore, et le temps de filtration selon la température de l'eau.</p>
      <div class="choix-logement">
        <button type="button" class="choix-l" data-act="logement-piscine" data-v="1">${dessinLogement('maison', true)}<b>Avec piscine</b><span>La page Piscine apparaît dans le menu.</span></button>
        <button type="button" class="choix-l" data-act="logement-piscine" data-v="0">${dessinLogement('maison')}<b>Sans piscine</b><span>Vous pourrez l'ajouter plus tard dans « Mon logement ».</span></button>
      </div>
      <div class="pied" style="justify-content:center;margin-top:22px"><button class="btn" data-act="logement-retour">← Revenir au choix du logement</button></div>
    </section>`;
}
PAGES.accueil = () => {
  if (!S.logement.type) return assistant();
  const L = S.logement, fam = nomFamille();
  const typeTxt = L.type === 'appartement' ? 'Appartement' : L.piscine ? 'Maison avec piscine' : 'Maison';
  let h = titrePage(`${fam ? `La maison des ${esc(fam)}` : 'Notre maison'}`, `<button class="btn" data-act="logement">🏠 Mon logement</button>`);
  if (!S.membres.length) h += `<div class="note-douce" style="margin-top:4px"><span class="em">📖</span><div><b>Étape suivante : la composition du foyer.</b> Ajoutez chaque personne qui vit ici — adultes, enfants, et même les animaux — dans le <b>carnet de famille</b>. Une fiche, une seule fois : NaoHome s'en sert partout (ménage, sports, copains, annuaire).</div>
      <button class="btn plein petit" style="margin-left:auto;flex:none" data-act="go" data-p="carnet">📖 Composer le foyer</button></div>`;
  h += '<div class="grille">';
  /* le logement */
  h += `<section class="carte cliquable" data-act="logement">${carteT(L.type === 'appartement' ? '🏢' : '🏡', 'Notre logement', S.pieces.length ? pluriel(S.pieces.length, 'pièce') : '')}
      <div style="display:flex;align-items:center;gap:14px">${dessinLogement(L.type, L.piscine)}<div><b style="color:var(--titre);font-size:17px">${esc(L.nom || typeTxt)}</b>
      <div class="sous" style="margin:2px 0 0">${esc(typeTxt)}${L.adresse ? '<br>' + esc(L.adresse) : ''}</div></div></div></section>`;
  /* le carnet */
  const pers = S.membres;
  const annivs = S.membres.map(m => ({ m, a: prochainAnniv(m.naissance) })).filter(x => x.a && x.a.dans <= 45).sort((a, b) => a.a.dans - b.a.dans);
  h += `<section class="carte">${carteT('📖', 'Carnet de famille', pers.length ? pluriel(pers.length, 'membre') : '')}
      ${pers.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${pers.map(m => `<button class="btn petit" style="padding:4px 12px 4px 4px" data-act="voir-membre" data-id="${m.id}">${avatar(m, 't')} ${esc(m.prenom || m.nom)}</button>`).join('')}</div>` : videJoli('👪', 'Le foyer est encore vide.')}
      ${annivs.length ? `<div class="groupe-t">🎂 Anniversaires à venir</div>${annivs.slice(0, 3).map(x => `<div class="ligne"><span class="em">🎂</span><div class="txt"><b>${esc(x.m.prenom)}</b><span>${x.a.ans} ${x.m.genre === 'animal' ? 'an' + (x.a.ans > 1 ? 's' : '') : 'ans'} le ${dateCourte(x.a.date)}</span></div><span class="meta ${x.a.dans <= 7 ? 'or' : ''}">${dansJours(x.a.dans)}</span></div>`).join('')}` : ''}
      <button class="lien-carte" data-act="go" data-p="carnet">Ouvrir le carnet →</button></section>`;
  /* le ménage */
  const aFaire = S.taches.filter(t => t.freq !== 'mois' && !tacheFaite(t));
  const tot = S.taches.filter(t => t.freq !== 'mois'), faites = tot.length - aFaire.length;
  h += `<section class="carte">${carteT('🧹', 'Ménage', tot.length ? `${faites}/${tot.length}` : '')}
      ${!S.pieces.length ? videJoli('🧽', 'Ajoutez les pièces de votre logement pour répartir les tâches.', '<button class="btn petit plein" data-act="go" data-p="menage">🧹 Organiser le ménage</button>')
        : !aFaire.length ? videJoli('✨', tot.length ? 'Tout est fait pour aujourd’hui et cette semaine. Bravo !' : 'Aucune tâche pour l’instant.')
        : aFaire.slice(0, 6).map(t => ligneTache(t)).join('') + (aFaire.length > 6 ? `<div class="vide">… et ${aFaire.length - 6} autres</div>` : '')}
      ${tot.length ? `<div class="jauge" style="margin-top:10px"><i style="width:${Math.round(faites / tot.length * 100)}%"></i></div>` : ''}
      ${S.pieces.length ? '<button class="lien-carte" data-act="go" data-p="menage">Voir toutes les pièces →</button>' : ''}</section>`;
  /* la piscine */
  if (L.piscine) {
    const p = derniereMesure('ph'), c = derniereMesure('chlore'), pm = prochaineMesure();
    const retard = S.piscine.entretien.filter(t => etatEntretien(t).retard);
    h += `<section class="carte">${carteT('🏊', 'Piscine', retard.length ? pluriel(retard.length, 'tâche') + ' à faire' : '')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${pilule('pH', p && p.ph, PH)}${pilule('Chlore', c && c.chlore, CHLORE, ' mg/L')}</div>
        <div class="sous" style="margin:0 0 8px">${p ? `Dernière mesure : ${dansJours(ecart(lire(p.date), auj()))}` : 'Aucune mesure encore.'}${pm ? ` · prochaine ${ecart(auj(), pm) === 0 ? '<b>aujourd’hui</b>' : JOURS[pm.getDay()]}` : ''}</div>
        ${retard.slice(0, 3).map(t => `<div class="ligne"><span class="em">${t.em}</span><div class="txt"><b>${esc(t.texte)}</b><span>${texteTous(t.tous)}</span></div><button class="btn petit" data-act="entretien-fait" data-id="${t.id}">✓ Fait</button></div>`).join('')}
        <div class="pied" style="margin-top:8px"><button class="btn petit plein" data-act="mesure">🧪 Noter une mesure</button><button class="lien-carte" style="margin:0 0 0 auto" data-act="go" data-p="piscine">Ouvrir la piscine →</button></div></section>`;
  }
  /* les sports */
  if (S.sports.length) {
    const enCours = S.sports.filter(s => !s.fin), med = S.sports.reduce((t, s) => t + (Number(s.or) || 0) + (Number(s.argent) || 0) + (Number(s.bronze) || 0), 0);
    h += `<section class="carte">${carteT('🏅', 'Sports', pluriel(enCours.length, 'en cours', 'en cours'))}
        ${enCours.slice(0, 5).map(s => `<div class="ligne cliquable" data-act="sport" data-id="${s.id}"><span class="em">${emSport(s.sport)}</span><div class="txt"><b>${esc(s.sport)}</b><span>${esc(prenomDe(s.membre))}${s.club ? ' · ' + esc(s.club) : ''}</span></div>${s.compet ? '<span class="meta">compétition</span>' : ''}</div>`).join('')}
        ${med ? `<div class="mini-stat" style="margin-top:8px"><span><b>${med}</b> médaille${med > 1 ? 's' : ''} dans la famille</span></div>` : ''}
        <button class="lien-carte" data-act="go" data-p="sports">Tous les sports →</button></section>`;
  }
  /* numéros utiles et personnes de confiance */
  const utiles = S.annuaire.filter(a => a.tel).slice(0, 5);
  h += `<section class="carte">${carteT('📇', 'Numéros utiles', S.annuaire.length || '')}
      ${utiles.length ? utiles.map(a => `<div class="ligne"><span class="em">${(T_ANNUAIRE[a.type] || T_ANNUAIRE.autre)[0]}</span><div class="txt"><b>${esc(a.nom || (T_ANNUAIRE[a.type] || T_ANNUAIRE.autre)[1])}</b><span>${esc((T_ANNUAIRE[a.type] || T_ANNUAIRE.autre)[1])}</span></div><span class="meta">${telLien(a.tel)}</span></div>`).join('')
        : videJoli('🛡️', 'Mutuelle, assurances, sécurité sociale : notez leurs numéros une fois pour toutes.', '<button class="btn petit" data-act="contact-annuaire">➕ Ajouter un numéro</button>')}
      ${S.confiance.length ? `<div class="groupe-t">🤝 Personnes de confiance</div>${S.confiance.map(c => `<div class="ligne"><span class="em">🤝</span><div class="txt"><b>${esc(nomComplet(c))}</b><span>${esc(c.lien || '')}</span></div><span class="meta">${telLien(c.tel) || '—'}</span></div>`).join('')}` : ''}
      <button class="lien-carte" data-act="go" data-p="annuaire">Ouvrir l’annuaire →</button></section>`;
  h += '</div>';
  return h;
};
function pilule(nom, v, g, unite = '') {
  const e = evaluer(v, g);
  return `<span class="mesure ${e || ''}" title="${libelleEval(e)}"><i></i>${nom} ${v !== undefined && v !== '' && v != null ? nbFr(nombre(v), 2) + unite : '—'}</span>`;
}
function ligneTache(t, modifier = false) {
  const p = S.pieces.find(x => x.id === t.piece), fait = tacheFaite(t), m = membre(t.qui);
  return `<div class="ligne ${fait ? 'fait' : ''}">
    <button class="coche ${fait ? 'on' : ''}" data-act="tache-faite" data-id="${t.id}" aria-label="${fait ? 'Marquer comme à faire' : 'Marquer comme fait'}">✓</button>
    <span class="em">${p ? (T_PIECE[p.type] || T_PIECE.autre)[0] : '🧹'}</span>
    <div class="txt"><b>${esc(t.texte)}</b><span>${p ? esc(p.nom) + ' · ' : ''}${texteFreq(t.freq)}</span></div>
    ${m ? `<span class="qui">${avatar(m)}${esc(m.prenom)}</span>` : t.qui === 'tous' ? '<span class="qui">👪 Tout le monde</span>' : '<span class="qui" style="opacity:.6">Personne</span>'}
    ${modifier ? `<button class="rond petit" data-act="tache" data-id="${t.id}" title="Modifier">✏️</button>` : ''}</div>`;
}

/* ============================================================
   Le carnet de famille
   ============================================================ */
function carteMembre(m) {
  const age = ageDe(m.naissance);
  let role = m.lien || (m.genre === 'enfant' ? 'Enfant' : m.genre === 'animal' ? (ESPECES.find(e => e[0] === m.espece) || ESPECES[8])[1].slice(3) : 'Adulte');
  if (m.moi) role = '🙋 Moi · ' + role;
  let info = '';
  if (m.genre === 'adulte') info = [m.poste, m.entreprise].filter(Boolean).join(' · ');
  if (m.genre === 'enfant') info = [m.classe, m.etablissement].filter(Boolean).join(' · ');
  if (m.genre === 'animal') info = m.race || '';
  const nbSports = S.sports.filter(s => s.membre === m.id && !s.fin).length;
  return `<div class="carte membre" data-act="voir-membre" data-id="${m.id}" tabindex="0" role="button">
    ${avatar(m)}<div><h3>${esc(nomComplet(m) || 'Sans nom')}</h3><div class="role">${esc(role)}${age ? ' · ' + age : ''}</div></div>
    ${info ? `<div class="info">${esc(info)}</div>` : ''}
    <div class="badges">${m.sante ? '<span class="pastille sante">🩺 NaoSanté</span>' : ''}${m.pets ? '<span class="pastille sante">🐾 NaoPets</span>' : ''}${nbSports ? `<span class="pastille acc">${pluriel(nbSports, 'sport')}</span>` : ''}</div></div>`;
}
const carteNouveau = (genre, texte) => `<div class="carte membre nouveau" data-act="membre" data-genre="${genre}" tabindex="0" role="button"><span class="plus">＋</span><b>${texte}</b></div>`;
PAGES.carnet = () => {
  const fam = nomFamille();
  let h = `<section class="livret"><div class="livret-t"><div><div class="titre-livret">Carnet de famille</div><h2>${fam ? `Famille ${esc(fam)}` : 'Notre famille'}</h2></div>
      <div class="spacer"></div><button class="btn plein" data-act="membre" data-genre="adulte">➕ Ajouter quelqu'un</button></div>
      <div class="resume">${[[adultes().length, 'adulte'], [enfants().length, 'enfant'], [animaux().length, 'animal', 'animaux'], [S.confiance.length, 'personne de confiance', 'personnes de confiance']]
        .filter(x => x[0]).map(([n, u, p]) => `<span class="pastille">${pluriel(n, u, p)}</span>`).join('') || '<span class="pastille">Le carnet est encore vide</span>'}</div></section>`;
  h += `<div class="section-t"><h2>👤 Les adultes</h2></div><div class="famille">${adultes().map(carteMembre).join('')}${carteNouveau('adulte', 'Un adulte')}</div>`;
  h += `<div class="section-t"><h2>🧒 Les enfants</h2></div><div class="famille">${enfants().map(carteMembre).join('')}${carteNouveau('enfant', 'Un enfant')}</div>`;
  h += `<div class="section-t"><h2>🐾 Les animaux</h2></div><div class="famille">${animaux().map(carteMembre).join('')}${carteNouveau('animal', 'Un animal')}</div>`;
  h += `<div class="section-t"><h2>🤝 Les personnes de confiance</h2><span class="pastille">1 ou 2 personnes</span></div>
    <p class="chapo" style="margin-top:-4px">Ceux qu'on appelle si l'on ne peut pas être joint : la nounou, une grand-mère, un voisin… Ils ne vivent pas forcément ici.</p>
    <div class="famille">${S.confiance.map(c => `<div class="carte membre" data-act="confiance" data-id="${c.id}" tabindex="0" role="button">${avatar({ ...c, confiance: true })}
      <div><h3>${esc(nomComplet(c))}</h3><div class="role">${esc(c.lien || 'Personne de confiance')}</div></div><div class="info">${c.tel ? esc(c.tel) : ''}</div></div>`).join('')}
      ${S.confiance.length < 2 ? `<div class="carte membre nouveau" data-act="confiance" tabindex="0" role="button"><span class="plus">＋</span><b>Une personne de confiance</b></div>` : ''}</div>`;
  return h;
};

/* ============================================================
   La piscine
   ============================================================ */
function gamme(v, g, unite) {
  const pos = x => ((x - g.min) / (g.max - g.min) * 100);
  const n = nombre(v), ok = isFinite(n);
  const st = `--a1:${pos(g.a1).toFixed(1)}%;--a2:${pos(g.a2).toFixed(1)}%;--a3:${pos(g.a3).toFixed(1)}%;--a4:${pos(g.a4).toFixed(1)}%`;
  const reps = [g.a1, g.a2, g.a3, g.a4].map(x => `<span class="rep" style="left:${pos(x).toFixed(1)}%">${nbFr(x, 1)}</span>`).join('');
  return `<div class="gamme" style="${st}">${ok ? `<span class="curseur" style="left:${Math.max(0, Math.min(100, pos(n))).toFixed(1)}%" data-v="${nbFr(n, 2)}${unite}"></span>` : ''}${reps}</div>`;
}
function courbeMesures(k, g, unite) {
  const pts = mesuresTriees().filter(m => isFinite(nombre(m[k]))).slice(0, 16).reverse();
  if (pts.length < 2) return '<div class="vide">La courbe apparaît à partir de deux mesures.</div>';
  const W = 520, H = 150, x0 = 34, x1 = W - 12, y0 = 12, y1 = H - 24;
  const lo = Math.min(g.a1, ...pts.map(p => nombre(p[k]))), hi = Math.max(g.a4, ...pts.map(p => nombre(p[k])));
  const y = v => y1 - (v - lo) / (hi - lo || 1) * (y1 - y0), x = i => x0 + i * (x1 - x0) / (pts.length - 1);
  const ligne = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(nombre(p[k])).toFixed(1)}`).join('');
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution du ${k === 'ph' ? 'pH' : 'chlore'}">
    <rect class="bande" x="${x0}" y="${y(g.a3).toFixed(1)}" width="${x1 - x0}" height="${(y(g.a2) - y(g.a3)).toFixed(1)}"/>
    <line class="bande-l" x1="${x0}" x2="${x1}" y1="${y(g.a3).toFixed(1)}" y2="${y(g.a3).toFixed(1)}"/><line class="bande-l" x1="${x0}" x2="${x1}" y1="${y(g.a2).toFixed(1)}" y2="${y(g.a2).toFixed(1)}"/>
    <text class="lbl" x="4" y="${(y(g.a3) + 4).toFixed(1)}">${nbFr(g.a3, 1)}</text><text class="lbl" x="4" y="${(y(g.a2) + 4).toFixed(1)}">${nbFr(g.a2, 1)}</text>
    <path class="trace" d="${ligne}"/>
    ${pts.map((p, i) => `<circle class="pt" cx="${x(i).toFixed(1)}" cy="${y(nombre(p[k])).toFixed(1)}" r="4" style="stroke:var(--${({ ok: 'vert', att: 'or', mal: 'doux' })[evaluer(p[k], g)]})"><title>${dateCourte(lire(p.date))} : ${nbFr(nombre(p[k]), 2)}${unite}</title></circle>`).join('')}
    <text class="lbl" x="${x0}" y="${H - 6}">${dateCourte(lire(pts[0].date))}</text><text class="lbl" x="${x1}" y="${H - 6}" text-anchor="end">${dateCourte(lire(pts[pts.length - 1].date))}</text></svg>`;
}
function texteFiltration(t) {
  const hrs = heuresFiltration(t);
  return hrs == null ? 'Tapez la température de l’eau pour connaître la durée.'
    : hrs === 0 ? 'Eau froide (moins de 12 °C) : c’est la période d’hivernage, quelques heures par jour suffisent pour faire tourner l’eau.'
    : `À ${nbFr(nombre(t), 1)} °C : <b>${nbFr(hrs, 1)} heures</b> de filtration par jour${hrs >= 24 ? ', soit en continu' : ''}.`;
}
PAGES.piscine = () => {
  if (!aPiscine()) return videJoli('🏊', 'Votre logement n’a pas de piscine.', '<button class="btn plein" data-act="logement">🏠 Mon logement</button>');
  let h = titrePage('🏊 La piscine', `<button class="btn plein" data-act="mesure">🧪 Noter une mesure</button>`);
  h += sousPages('piscine', [['suivi', '🧪 pH & chlore'], ['entretien', '🧽 Entretien'], ['filtration', '⏱️ Filtration']]);
  const s = V.sous.piscine;
  if (s === 'entretien') {
    const vol = nombre(S.logement.volume);
    h += `<div class="grille-2 large-g"><section class="carte">${carteT('🧽', 'L’entretien régulier', '', `<button class="btn petit" style="margin-left:auto" data-act="entretien">➕ Une tâche</button>`)}
      ${S.piscine.entretien.map(t => {
        const e = etatEntretien(t);
        return `<div class="entretien ${e.retard ? 'retard' : 'ok'}"><span class="em">${t.em || '🧽'}</span>
          <div class="txt"><b>${esc(t.texte)}</b><span>${texteTous(t.tous)} · ${e.jours == null ? 'jamais noté' : e.jours === 0 ? 'fait aujourd’hui' : `fait ${dansJours(-e.jours)}`}${!e.retard && e.reste > 0 ? ` · prochaine fois ${dansJours(e.reste)}` : ''}</span>
          ${t.id === 'tiers' && isFinite(vol) && vol > 0 ? `<span>Soit environ <b>${nbFr(vol / 3, 1)} m³</b> à renouveler sur ${nbFr(vol, 1)} m³.</span>` : ''}
          ${t.conseil ? `<span style="margin-top:3px">${esc(t.conseil)}</span>` : ''}</div>
          <div class="jauge${e.retard ? ' bas' : ''}"><i style="width:${Math.round(e.part * 100)}%"></i></div>
          <button class="btn petit ${e.retard ? 'plein' : ''}" data-act="entretien-fait" data-id="${t.id}">✓ Fait</button>
          <button class="rond petit" data-act="entretien" data-id="${t.id}" title="Modifier">✏️</button></div>`;
      }).join('')}</section>
      <section class="carte">${carteT('💡', 'Les bons réflexes')}
        <ul class="conseils">
          <li><span>🍂</span>Retirez feuilles et insectes avant qu’ils ne coulent : au fond, ils nourrissent les algues.</li>
          <li><span>🧽</span>Brossez les parois de haut en bas, vers la bonde de fond, avant de passer le robot ou l’aspirateur.</li>
          <li><span>〰️</span>La ligne d’eau se nettoie avec un produit prévu pour elle, jamais avec un produit ménager.</li>
          <li><span>💧</span>Renouveler un tiers de l’eau chaque année évite que les résidus s’accumulent (sels, stabilisant).</li>
          <li><span>⚠️</span>Ne mélangez jamais deux produits entre eux, et versez-les toujours dans l’eau (jamais l’inverse).</li>
          <li><span>🧪</span>Après un orage, une grosse chaleur ou beaucoup de baigneurs : refaites une mesure.</li>
        </ul>
        ${isFinite(vol) && vol > 0 ? '' : '<div class="note-douce"><span class="em">📐</span><div>Indiquez le <b>volume de votre piscine</b> dans 🏠 Mon logement : NaoHome calculera le tiers à renouveler.</div></div>'}</section></div>`;
    return h;
  }
  if (s === 'filtration') {
    const der = derniereMesure('temp');
    const t = V.tempFiltre !== undefined ? V.tempFiltre : der ? der.temp : '';
    const hrs = heuresFiltration(t);
    const C = 2 * Math.PI * 58, part = hrs == null ? 0 : hrs / 24;
    h += `<div class="grille-2"><section class="carte">${carteT('⏱️', 'Combien d’heures filtrer ?')}
      <p class="chapo" style="margin-top:-4px">La règle simple : <b>la température de l’eau divisée par deux</b> donne le nombre d’heures de filtration par jour. À 30 °C, 15 heures.</p>
      <div class="cadran"><svg viewBox="0 0 150 150" aria-hidden="true"><circle class="arc-fond" cx="75" cy="75" r="58"/>
        <circle class="arc" id="arc-filtre" cx="75" cy="75" r="58" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - part)).toFixed(1)}" transform="rotate(-90 75 75)"/>
        <text class="val" id="val-filtre" x="75" y="80" text-anchor="middle">${hrs == null ? '—' : nbFr(hrs, 1) + ' h'}</text><text class="sousval" x="75" y="100" text-anchor="middle">PAR JOUR</text></svg>
        <div style="flex:1;min-width:200px"><div class="champ"><label for="temp-filtre">Température de l’eau (°C)</label>
          <input type="number" id="temp-filtre" data-champ="temp-filtre" inputmode="decimal" step="0.5" min="0" max="40" value="${esc(t)}" placeholder="Ex. : 26"></div>
          <p id="txt-filtre" style="margin:10px 0 0;color:var(--ink-2);font-size:14px;min-height:3.2em">${texteFiltration(t)}</p>
          ${der ? `<p class="sous" style="margin:6px 0 0">Dernière température notée : ${nbFr(nombre(der.temp), 1)} °C (${dateCourte(lire(der.date))}).</p>` : ''}</div></div></section>
      <section class="carte">${carteT('💡', 'Conseils de filtration')}
        <ul class="conseils">
          <li><span>☀️</span>Filtrez surtout aux heures les plus chaudes, quand l’eau se réchauffe et que les algues se développent le plus.</li>
          <li><span>✂️</span>Vous pouvez couper en deux plages (par exemple la moitié le matin, la moitié l’après-midi).</li>
          <li><span>🏊</span>Après une forte fréquentation, un orage ou un traitement choc, ajoutez quelques heures.</li>
          <li><span>🌡️</span>La température change avec les saisons : revérifiez la durée chaque semaine en été.</li>
          <li><span>🧺</span>Nettoyez le filtre (contre-lavage ou cartouche) quand la pression monte, selon la notice de votre installation.</li>
          <li><span>❄️</span>En dessous de 12 °C, l’eau est en hivernage : la filtration se réduit beaucoup.</li>
        </ul></section></div>`;
    return h;
  }
  /* suivi pH & chlore */
  const p = derniereMesure('ph'), c = derniereMesure('chlore'), tp = derniereMesure('temp'), pm = prochaineMesure();
  const ep = p && evaluer(p.ph, PH), ec = c && evaluer(c.chlore, CHLORE);
  const jours = S.logement.joursMesure.map(Number).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(j => JOURS[j]);
  h += `<div class="note-douce" style="margin-top:0"><span class="em">📅</span><div>Mesurez le pH et le chlore <b>2 fois par semaine</b> — ${jours.length ? `les <b>${jours.join(' et ')}</b>` : 'choisissez vos jours dans 🏠 Mon logement'}.
      ${pm ? `Prochaine mesure : <b>${ecart(auj(), pm) === 0 ? 'aujourd’hui' : dateLongue(pm)}</b>.` : ''}</div><button class="btn petit" style="margin-left:auto;flex:none" data-act="logement">Changer les jours</button></div>`;
  h += `<div class="gros-releve">
      <div class="releve ${ep || ''}"><span>pH</span><b>${p ? nbFr(nombre(p.ph), 2) : '—'}</b><small>${p ? libelleEval(ep) + ' · idéal 7,2 à 7,4' : 'idéal 7,2 à 7,4'}</small></div>
      <div class="releve ${ec || ''}"><span>Chlore libre</span><b>${c ? nbFr(nombre(c.chlore), 2) : '—'}</b><small>${c ? libelleEval(ec) + ' · idéal 1,5 à 2 mg/L' : 'idéal 1,5 à 2 mg/L'}</small></div>
      <div class="releve"><span>Eau</span><b>${tp ? nbFr(nombre(tp.temp), 1) + '°' : '—'}</b><small>${tp && heuresFiltration(tp.temp) != null ? `filtrer ${nbFr(heuresFiltration(tp.temp), 1)} h par jour` : 'température en °C'}</small></div></div>`;
  h += `<div class="grille-2"><section class="carte">${carteT('🧪', 'Le pH', p ? dateCourte(lire(p.date)) : '')}
      ${gamme(p && p.ph, PH, '')}<p style="margin:0 0 12px;font-size:14px;color:var(--ink-2)">${p ? avisPh(p.ph) : 'Notez une première mesure : le curseur se placera sur la règle.'}</p>
      <div class="legende" style="margin:0 0 10px"><span><i style="background:var(--vert)"></i>7,2 – 7,4 idéal</span><span><i style="background:var(--or)"></i>à surveiller</span><span><i style="background:var(--doux)"></i>à corriger</span></div>
      ${courbeMesures('ph', PH, '')}</section>
    <section class="carte">${carteT('💧', 'Le chlore', c ? dateCourte(lire(c.date)) : '')}
      ${gamme(c && c.chlore, CHLORE, ' mg/L')}<p style="margin:0 0 12px;font-size:14px;color:var(--ink-2)">${c ? avisChlore(c.chlore) : 'Le chlore libre se mesure en mg/L (ou ppm, c’est pareil).'}</p>
      <div class="legende" style="margin:0 0 10px"><span><i style="background:var(--vert)"></i>1,5 – 2 mg/L idéal</span><span><i style="background:var(--or)"></i>à surveiller</span><span><i style="background:var(--doux)"></i>à corriger</span></div>
      ${courbeMesures('chlore', CHLORE, ' mg/L')}</section></div>`;
  const M = mesuresTriees();
  h += `<section class="carte" style="margin-top:16px">${carteT('📋', 'Le tableau des mesures', M.length || '')}
    ${M.length ? `<div class="tableau-w"><table class="tableau"><thead><tr><th>Date</th><th>pH</th><th>Chlore</th><th>Eau</th><th>Filtration</th><th>Note</th><th></th></tr></thead><tbody>
      ${M.map(m => `<tr><td>${esc(cap(JOURS_C[lire(m.date).getDay()]))} ${dateNum(lire(m.date))}${m.heure ? ' · ' + esc(m.heure) : ''}</td>
        <td>${pilule('', m.ph, PH)}</td><td>${pilule('', m.chlore, CHLORE)}</td>
        <td>${isFinite(nombre(m.temp)) ? nbFr(nombre(m.temp), 1) + ' °C' : '—'}</td>
        <td>${heuresFiltration(m.temp) != null ? nbFr(heuresFiltration(m.temp), 1) + ' h' : '—'}</td>
        <td class="note">${esc(m.note || '')}</td><td class="act"><button class="rond petit" data-act="mesure" data-id="${m.id}" title="Modifier">✏️</button></td></tr>`).join('')}
      </tbody></table></div>` : videJoli('🧪', 'Aucune mesure pour l’instant. Avec une trousse d’analyse ou des bandelettes, notez le pH, le chlore et la température.', '<button class="btn plein petit" data-act="mesure">🧪 Noter une mesure</button>')}</section>`;
  return h;
};

/* ============================================================
   Les sports
   ============================================================ */
function carteSport(s) {
  const med = [['🥇', s.or], ['🥈', s.argent], ['🥉', s.bronze]].filter(x => Number(x[1]) > 0);
  return `<div class="sport ${s.fin ? 'fini' : ''}" data-act="sport" data-id="${s.id}" tabindex="0" role="button"><span class="em">${emSport(s.sport)}</span>
    <div class="txt"><b>${esc(s.sport)}</b><div class="l">${[s.club, s.debut ? (s.fin ? `${esc(s.debut)} – ${esc(s.fin)}` : `depuis ${esc(s.debut)}`) : ''].filter(Boolean).join(' · ')}</div>
    ${s.adresse ? `<div class="l">📍 ${esc(s.adresse)}</div>` : ''}
    <div class="tags">${s.compet ? '<span class="pastille acc">🏆 Compétition</span>' : '<span class="pastille">Loisir</span>'}${s.niveau ? `<span class="pastille">${esc(s.niveau)}</span>` : ''}${s.licence ? `<span class="pastille">Licence ${secret(s.licence, 'lic-' + s.id)}</span>` : ''}
      ${med.length ? `<span class="medailles">${med.map(([e, n]) => `${e} ${n}`).join(' ')}</span>` : ''}</div></div></div>`;
}
PAGES.sports = () => {
  const pers = personnes();
  let h = titrePage('🏅 Les sports', `<button class="btn plein" data-act="sport">➕ Un sport</button>`);
  if (!pers.length) return h + videJoli('📖', 'Ajoutez d’abord les membres du foyer dans le carnet de famille.', '<button class="btn plein" data-act="go" data-p="carnet">📖 Le carnet</button>');
  h += `<p class="chapo">Les clubs, les licences, les niveaux et les médailles de chacun — et, en dessous, le parcours sportif de toute une vie.</p>`;
  h += `<div class="filtres"><button class="${!V.sportPour ? 'on' : ''}" data-act="sport-pour" data-id="">Tout le monde</button>${pers.map(m => `<button class="${V.sportPour === m.id ? 'on' : ''}" data-act="sport-pour" data-id="${m.id}">${esc(m.prenom || m.nom)}</button>`).join('')}</div>`;
  h += sousPages('sports', [['liste', '🏃 En ce moment'], ['vie', '📜 Toute une vie']]);
  const qui = V.sportPour ? pers.filter(m => m.id === V.sportPour) : pers;
  if (V.sous.sports === 'vie') {
    h += '<div class="grille">' + qui.map(m => {
      const l = S.sports.filter(s => s.membre === m.id).sort((a, b) => String(a.debut || '9999').localeCompare(String(b.debut || '9999')));
      const med = l.reduce((t, s) => t + (Number(s.or) || 0) + (Number(s.argent) || 0) + (Number(s.bronze) || 0), 0);
      return `<section class="carte"><div class="carte-t">${avatar(m, 'm')}<h2>${esc(nomComplet(m))}</h2><span class="compte">${pluriel(l.length, 'sport')}${med ? ` · ${med} 🏅` : ''}</span></div>
        ${l.length ? `<div class="frise">${l.map(s => `<div class="pt ${s.fin ? '' : 'en-cours'}" data-act="sport" data-id="${s.id}" style="cursor:pointer"><b>${emSport(s.sport)} ${esc(s.sport)}</b>
          <small>${s.debut ? (s.fin ? `${esc(s.debut)} – ${esc(s.fin)}` : `depuis ${esc(s.debut)} · en cours`) : 'dates à préciser'}${s.niveau ? ' · ' + esc(s.niveau) : ''}${s.compet ? ' · compétition' : ''}</small></div>`).join('')}</div>`
          : `<div class="vide">Aucun sport noté.</div>`}
        <button class="lien-carte" data-act="sport" data-membre="${m.id}">➕ Ajouter un sport passé ou actuel</button></section>`;
    }).join('') + '</div>';
    return h;
  }
  h += '<div class="grille">' + qui.map(m => {
    const l = S.sports.filter(s => s.membre === m.id && !s.fin);
    return `<section class="carte"><div class="carte-t">${avatar(m, 'm')}<h2>${esc(m.prenom || m.nom)}</h2><span class="compte">${l.length ? pluriel(l.length, 'sport') : 'aucun'}</span></div>
      ${l.map(carteSport).join('') || '<div class="vide">Pas de sport en ce moment.</div>'}
      <button class="lien-carte" data-act="sport" data-membre="${m.id}">➕ Ajouter un sport</button></section>`;
  }).join('') + '</div>';
  return h;
};

/* ============================================================
   Les copains des enfants
   ============================================================ */
PAGES.copains = () => {
  const E = enfants();
  let h = titrePage('🎒 Les copains', E.length ? `<button class="btn plein" data-act="copain">➕ Un copain</button>` : '');
  if (!E.length) return h + videJoli('🧒', 'Ce petit annuaire sert aux enfants du foyer : ajoutez d’abord un enfant dans le carnet de famille.', '<button class="btn plein" data-act="membre" data-genre="enfant">➕ Un enfant</button>');
  h += `<p class="chapo">Les parents des copains de classe : pour un anniversaire, une sortie, un covoiturage ou un devoir oublié.</p>`;
  h += '<div class="grille">' + E.map(e => {
    const l = S.copains.filter(c => c.enfant === e.id).sort((a, b) => (a.copain || '').localeCompare(b.copain || ''));
    return `<section class="carte"><div class="carte-t">${avatar(e, 'm')}<h2>Les copains de ${esc(e.prenom)}</h2><span class="compte">${l.length}</span></div>
      ${e.classe || e.etablissement ? `<div class="sous">${esc([e.classe, e.etablissement].filter(Boolean).join(' · '))}</div>` : ''}
      ${l.map(c => `<div class="fiche-contact" style="margin-bottom:9px" data-act="copain" data-id="${c.id}" tabindex="0" role="button"><span class="em">🧒</span>
        <div class="txt"><span class="type">${esc(c.classe || 'Copain / copine')}</span><b>${esc(c.copain)}</b>
        ${c.parents ? `<p>Parents : ${esc(c.parents)}</p>` : ''}
        <div class="coord">${telLien(c.tel)}${c.tel2 ? telLien(c.tel2) : ''}${mailLien(c.email)}</div>
        ${c.adresse ? `<p>📍 ${esc(c.adresse)}</p>` : ''}${c.notes ? `<p>${esc(c.notes)}</p>` : ''}</div></div>`).join('') || '<div class="vide">Aucun copain noté.</div>'}
      <button class="lien-carte" data-act="copain" data-enfant="${e.id}">➕ Ajouter un copain</button></section>`;
  }).join('') + '</div>';
  return h;
};

/* ============================================================
   L'annuaire : assurances, mutuelle, sécurité sociale…
   ============================================================ */
PAGES.annuaire = () => {
  let h = titrePage('📇 L’annuaire', `<button class="btn plein" data-act="contact-annuaire">➕ Un contact</button>`);
  h += `<p class="chapo">Assurance scolaire, mutuelle, voiture, habitation, accidents de la vie, sécurité sociale… Le nom, le numéro de contrat, le téléphone et l’adresse, au même endroit.</p>`;
  const groupes = Object.keys(T_ANNUAIRE).map(k => [k, S.annuaire.filter(a => (T_ANNUAIRE[a.type] ? a.type : 'autre') === k)]).filter(g => g[1].length);
  if (!S.annuaire.length) h += `<section class="carte">${videJoli('🛡️', 'Aucun contact pour l’instant. Commencez par ceux qu’on cherche toujours au mauvais moment :', `<div class="idees" style="justify-content:center">${['scolaire', 'mutuelle', 'secu', 'voiture', 'maison', 'accident'].map(k => `<button data-act="contact-annuaire" data-type="${k}">${T_ANNUAIRE[k][0]} ${T_ANNUAIRE[k][1]}</button>`).join('')}</div>`)}</section>`;
  /* toutes les fiches dans une même grille, rangées par type (assurances d'abord) */
  if (groupes.length) h += `<div class="annuaire-g" style="margin-bottom:16px">${groupes.map(([k, l]) => l.map(a => {
      const qui = (a.membres || []).map(prenomDe).filter(Boolean);
      return `<div class="fiche-contact" data-act="contact-annuaire" data-id="${a.id}" tabindex="0" role="button"><span class="em">${T_ANNUAIRE[k][0]}</span>
        <div class="txt"><span class="type">${esc(T_ANNUAIRE[k][1])}</span><b>${esc(a.nom || T_ANNUAIRE[k][1])}</b>
        ${a.contrat ? `<p>N° de contrat : ${secret(a.contrat, 'ctr-' + a.id)}</p>` : ''}
        <div class="coord">${telLien(a.tel)}${mailLien(a.email)}${a.site ? `<a href="${esc(/^https?:/i.test(a.site) ? a.site : 'https://' + a.site)}" target="_blank" rel="noopener">${esc(a.site)}</a>` : ''}</div>
        ${a.adresse ? `<p>📍 ${esc(a.adresse)}</p>` : ''}${qui.length ? `<p>Pour : ${esc(qui.join(', '))}</p>` : ''}${a.notes ? `<p>${esc(a.notes)}</p>` : ''}</div></div>`;
    }).join('')).join('')}</div>`;
  /* les numéros de sécurité sociale viennent des fiches du carnet */
  const secu = personnes().filter(m => m.secu);
  h += `<section class="carte" style="margin-top:4px">${carteT('🩺', 'Numéros de sécurité sociale', secu.length || '')}
    <p class="sous">Ils se notent dans la fiche de chacun, au carnet de famille. Masqués à l’écran : 👁️ pour les afficher.</p>
    ${secu.length ? secu.map(m => `<div class="ligne">${avatar(m, 't')}<div class="txt"><b>${esc(nomComplet(m))}</b></div><span>${secret(m.secu, 'secu-' + m.id)}</span>
      <button class="rond petit" data-act="membre" data-id="${m.id}" title="Modifier">✏️</button></div>`).join('') : '<div class="vide">Aucun numéro noté.</div>'}</section>`;
  return h;
};

/* ============================================================
   Le ménage : la maison dessinée, pièce par pièce
   ============================================================ */
function dessinPlan() {
  const P = S.pieces, n = P.length + 1;
  const cols = n <= 4 ? 2 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols);
  const cw = 138, ch = 82, gap = 10, gw = cols * cw + (cols - 1) * gap, gh = rows * ch + (rows - 1) * gap;
  /* la largeur suit le nombre de colonnes : le toit (ou l'immeuble) déborde de 70 de chaque côté */
  const W = gw + 140, x0 = 70, appart = estAppart();
  const toitH = appart ? 0 : 92, haut = appart ? 64 : toitH + 14;
  const y0 = haut + 16, bas = y0 + gh + 16, piscH = aPiscine() ? 64 : 0, H = bas + piscH + 24;
  let s = `<svg class="dessin-maison" viewBox="0 0 ${W} ${H}" role="group" aria-label="Les pièces du logement">`;
  if (appart) {
    /* l'immeuble : deux étages au-dessus, un en dessous ; le nôtre est encadré */
    s += `<rect class="immeuble" x="${x0 - 30}" y="6" width="${gw + 60}" height="${H - 30}" rx="10"/>`;
    for (let i = 0; i < Math.floor((gw + 40) / 46); i++) s += `<rect class="fenetre-i" x="${x0 - 14 + i * 46}" y="18" width="26" height="16" rx="3"/><rect class="fenetre-i" x="${x0 - 14 + i * 46}" y="40" width="26" height="16" rx="3" style="opacity:.18"/>`;
    s += `<rect class="cadre" x="${x0 - 14}" y="${y0 - 14}" width="${gw + 28}" height="${gh + 28}" rx="12"/>`;
    s += `<text x="${x0 - 8}" y="${y0 - 20}" style="font-family:var(--ui);font-style:normal;font-size:11px;font-weight:800;letter-spacing:.1em;fill:var(--acc)">${esc((S.logement.etage ? 'ÉTAGE ' + S.logement.etage + ' · ' : '') + 'NOTRE APPARTEMENT')}</text>`;
  } else {
    const cx = W / 2, l = x0 - 22, r = x0 + gw + 22;
    s += `<rect class="chem" x="${r - 76}" y="${toitH * .28}" width="22" height="${toitH * .5}" rx="3"/>
      <path class="fumee" d="M${r - 65} ${toitH * .24}c-6-6 6-10 0-16"/><path class="fumee" style="animation-delay:1.4s" d="M${r - 62} ${toitH * .22}c-6-6 6-10 0-16"/>
      <path class="toit" d="M${l - 16} ${toitH + 8} ${cx} 6 ${r + 16} ${toitH + 8}Z"/>
      <rect class="cadre" x="${l}" y="${toitH + 8}" width="${r - l}" height="${bas - toitH - 8}" rx="6"/>`;
  }
  P.forEach((p, i) => {
    const x = x0 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap);
    const t = S.taches.filter(x => x.piece === p.id), f = t.filter(tacheFaite).length, part = t.length ? f / t.length : 0;
    const [em] = T_PIECE[p.type] || T_PIECE.autre;
    s += `<g class="piece-svg ${V.piece === p.id ? 'on' : ''} ${t.length && f === t.length ? 'fini' : ''}" data-act="piece" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.nom)}, ${f} tâche${f > 1 ? 's' : ''} faite${f > 1 ? 's' : ''} sur ${t.length}">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12"/>
      <text class="em" x="${x + 14}" y="${y + 30}">${em}</text>
      <text class="nom" x="${x + 44}" y="${y + 26}">${esc(p.nom.length > 15 ? p.nom.slice(0, 14) + '…' : p.nom)}</text>
      <text class="cpt" x="${x + 44}" y="${y + 43}">${t.length ? `${f} / ${t.length} fait${f > 1 ? 'es' : 'e'}` : 'aucune tâche'}</text>
      <rect class="barre-f" x="${x + 14}" y="${y + ch - 20}" width="${cw - 28}" height="6" rx="3"/>
      <rect class="barre-p" x="${x + 14}" y="${y + ch - 20}" width="${((cw - 28) * part).toFixed(1)}" height="6" rx="3"/></g>`;
  });
  { const i = P.length, x = x0 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap);
    s += `<g class="piece-svg ajout" data-act="piece-ajout" tabindex="0" role="button" aria-label="Ajouter une pièce"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12"/>
      <text class="em" x="${x + cw / 2}" y="${y + 38}" text-anchor="middle">＋</text><text class="cpt" x="${x + cw / 2}" y="${y + 58}" text-anchor="middle">Une pièce</text></g>`; }
  if (aPiscine() && !appart) {
    const pw = Math.min(gw, 300), px = (W - pw) / 2, py = bas + 18;
    s += `<rect class="piscine" x="${px}" y="${py}" width="${pw}" height="${piscH - 18}" rx="18"/>
      <path class="vague" d="M${px + 20} ${py + 18}${Array.from({ length: Math.floor((pw - 40) / 16) }, () => 'c4 0 4-3 8-3s4 3 8 3').join('')}"/>
      <path class="vague" style="animation-delay:.8s" d="M${px + 28} ${py + 32}${Array.from({ length: Math.floor((pw - 56) / 16) }, () => 'c4 0 4-3 8-3s4 3 8 3').join('')}"/>`;
  }
  if (!appart) s += `<path class="sol" d="M${x0 - 60} ${bas} H${x0 + gw + 60}"/>`;
  return s + '</svg>';
}
function suggestionsPieces() {
  return estAppart() ? ['entree', 'salon', 'cuisine', 'chambre', 'sdb', 'wc', 'terrasse'] : ['entree', 'salon', 'sam', 'cuisine', 'chambre', 'chambre', 'sdb', 'wc', 'buanderie', 'garage', 'jardin'];
}
PAGES.menage = () => {
  let h = titrePage('🧹 Le ménage', `<button class="btn" data-act="piece-ajout">➕ Une pièce</button><button class="btn plein" data-act="tache">➕ Une tâche</button>`);
  if (!S.pieces.length) {
    const sug = suggestionsPieces();
    return h + `<section class="carte" style="text-align:center">${dessinLogement(S.logement.type, S.logement.piscine).replace('class="dessin-l"', 'class="dessin-l" style="width:200px;height:146px"')}
      <h2 style="margin:10px 0 6px">Quelles pièces y a-t-il chez vous ?</h2>
      <p class="chapo" style="margin:0 auto 14px">Ajoutez les pièces de votre ${estAppart() ? 'appartement' : 'maison'} : chacune aura sa petite liste de tâches, avec le nom de qui s’en occupe.</p>
      <button class="btn plein" data-act="pieces-proposees">✨ Ajouter les pièces habituelles (${sug.length})</button>
      <div class="pieces-chips" style="justify-content:center;margin-top:16px">${Object.entries(T_PIECE).map(([k, v]) => `<button data-act="piece-vite" data-t="${k}">${v[0]} ${v[1]}</button>`).join('')}</div></section>`;
  }
  if (!S.pieces.some(p => p.id === V.piece)) V.piece = S.pieces[0].id;
  const p = S.pieces.find(x => x.id === V.piece), [em, lib, idees] = T_PIECE[p.type] || T_PIECE.autre;
  const t = S.taches.filter(x => x.piece === p.id);
  const dejaLa = new Set(t.map(x => x.texte.toLowerCase()));
  h += `<p class="chapo">Cliquez sur une pièce ${estAppart() ? 'de l’appartement' : 'de la maison'} pour voir ses tâches. Chaque tâche a sa fréquence et son responsable ; cochez-la quand elle est faite, elle revient d’elle-même le jour, la semaine ou le mois suivant.</p>`;
  h += `<div class="plan"><section class="carte">${dessinPlan()}</section>
    <section class="carte">${carteT(em, esc(p.nom), t.length ? `${t.filter(tacheFaite).length}/${t.length}` : '', `<button class="rond petit" style="margin-left:${t.length ? '6px' : 'auto'}" data-act="piece" data-id="${p.id}" data-modifier="1" title="Renommer ou supprimer la pièce">✏️</button>`)}
      ${FREQ_MENAGE.map(([f, l]) => { const x = t.filter(y => y.freq === f); return x.length ? `<div class="groupe-t">${l}<span class="compte">${x.filter(tacheFaite).length}/${x.length}</span></div>${x.map(y => ligneTache(y, true)).join('')}` : ''; }).join('') || '<div class="vide">Aucune tâche dans cette pièce.</div>'}
      <div class="pied" style="margin-top:12px"><button class="btn petit plein" data-act="tache" data-piece="${p.id}">➕ Une tâche pour ${esc(p.nom)}</button></div>
      ${idees.filter(i => !dejaLa.has(i.toLowerCase())).length ? `<div class="groupe-t" style="padding:0;margin-top:14px">Idées pour ${esc(lib.toLowerCase())}</div><div class="idees">${idees.filter(i => !dejaLa.has(i.toLowerCase())).map(i => `<button data-act="tache-idee" data-piece="${p.id}" data-t="${esc(i)}">＋ ${esc(i)}</button>`).join('')}</div>` : ''}
    </section></div>`;
  /* qui fait quoi */
  const pers = personnes();
  if (S.taches.length) {
    const ligne = (titre, av, l) => `<div class="qui-carte">${av}<div><b>${titre}</b><small>${pluriel(l.length, 'tâche')} · ${l.filter(tacheFaite).length} faite${l.filter(tacheFaite).length > 1 ? 's' : ''}</small></div></div>`;
    h += `<section class="carte" style="margin-top:16px">${carteT('👪', 'Qui fait quoi')}<div class="qui-qui">
      ${pers.map(m => ligne(esc(m.prenom || m.nom), avatar(m), S.taches.filter(x => x.qui === m.id))).join('')}
      ${S.taches.some(x => x.qui === 'tous') ? ligne('Tout le monde', '<span class="av">👪</span>', S.taches.filter(x => x.qui === 'tous')) : ''}
      ${S.taches.some(x => !x.qui) ? ligne('Pas encore attribuées', '<span class="av" style="background:var(--creux);color:var(--ink-3)">?</span>', S.taches.filter(x => !x.qui)) : ''}</div></section>`;
  }
  return h;
};

/* ============================================================
   Les alertes douces en haut de page
   ============================================================ */
function rendreRappels() {
  let masques = [];
  try { masques = JSON.parse(sessionStorage.getItem('naohome.masques') || '[]'); } catch (e) {}
  const l = [];
  if (S.logement.type) {
    for (const m of S.membres) { const a = prochainAnniv(m.naissance); if (a && a.dans <= 7) l.push({ id: 'anniv-' + m.id + a.date.getFullYear(), em: '🎂', html: `<b>${esc(m.prenom)}</b> fête ses ${a.ans} ${m.genre === 'animal' ? 'an' + (a.ans > 1 ? 's' : '') : 'ans'} ${dansJours(a.dans)} (${dateCourte(a.date)}).` }); }
    if (aPiscine()) {
      const pm = prochaineMesure();
      if (pm && ecart(auj(), pm) === 0) l.push({ id: 'mesure-' + cle(auj()), em: '🧪', html: 'C’est le jour de la <b>mesure du pH et du chlore</b> de la piscine.', act: '<button class="btn petit" data-act="mesure">Noter</button>' });
      const c = derniereMesure('chlore'), p = derniereMesure('ph');
      if (p && evaluer(p.ph, PH) === 'mal') l.push({ id: 'ph-' + p.id, em: '⚠️', html: `Piscine : le <b>pH (${nbFr(nombre(p.ph), 2)})</b> est à corriger.`, act: '<button class="btn petit" data-act="go" data-p="piscine">Voir</button>' });
      if (c && evaluer(c.chlore, CHLORE) === 'mal') l.push({ id: 'cl-' + c.id, em: '⚠️', html: `Piscine : le <b>chlore (${nbFr(nombre(c.chlore), 2)} mg/L)</b> est à corriger.`, act: '<button class="btn petit" data-act="go" data-p="piscine">Voir</button>' });
    }
  }
  $('#rappels').innerHTML = l.filter(x => !masques.includes(x.id)).slice(0, 3).map(x => `<div class="rappel"><span class="em">${x.em}</span><div class="txt">${x.html}</div>${x.act || ''}<button class="rond petit" data-act="masquer" data-id="${esc(x.id)}" title="Masquer">✕</button></div>`).join('');
}
