/* ============================================================
   NaoDaily — les écrans : Aujourd'hui, Mes listes, Menus & courses,
   Cadeaux & occasions, Favoris.
   ============================================================ */
'use strict';

const VUES = [['aujourdhui', '☀️', 'Aujourd’hui'], ['listes', '📝', 'Mes listes'], ['menus', '🍽️', 'Menus & courses'], ['cadeaux', '🎁', 'Cadeaux & occasions'], ['favoris', '⭐', 'Favoris']];
const U = {
  vue: VUES.some(v => v[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'aujourdhui',
  menus: 'planning', cadeaux: 'idees', liste: null, recherche: '', filtre: 'toutes',
  semaine: lundiDe(auj()), mode: 'semaine', mois: auj().slice(0, 7),
  catRecette: '', chercheRecette: '', personne: '', motsTon: 'doux', motsOcc: 'anniversaire', motsPour: '', melange: 0
};

const DOUCEURS = [
  'Une chose à la fois, et c’est déjà beaucoup.', 'Ce qui est noté n’encombre plus la tête.', 'Pas besoin que tout soit parfait : juste un peu plus simple.',
  'Vous avez le droit de rayer une tâche… et de la remettre à demain.', 'Une petite liste, un grand soulagement.', 'Prenez soin de vous comme vous prenez soin des autres.',
  'Ce soir, soyez fière de ce qui est fait — pas inquiète de ce qui reste.', 'Un repas prévu, c’est une question de moins à 19 h.', 'La journée n’a pas besoin d’être remplie pour être réussie.',
  'Respirez : tout est rangé ici, vous pouvez l’oublier un instant.', 'Les petits pas comptent. Surtout eux.', 'Il y a toujours une case à cocher qui fait du bien.',
  'Aujourd’hui, choisissez trois choses. Le reste peut attendre.', 'On ne vide pas une liste, on avance avec elle.', 'Faire simple, c’est déjà prendre soin.',
  'Un cadeau prévu à l’avance, c’est un sourire sans stress.', 'Votre calme est aussi une priorité.', 'Ce que vous faites compte, même quand personne ne le voit.',
  'Une pause, un verre d’eau, et on reprend doucement.', 'Tout ne se fait pas aujourd’hui — et c’est très bien ainsi.', 'Le quotidien, c’est aussi les petites joies. Notez-en une.',
  'Moins de charge mentale, plus de place pour le reste.', 'Vous n’êtes pas en retard : vous êtes en route.', 'Demain vous remerciera pour la liste de ce soir.'
];
const douceurDuJour = () => { const d = new Date(); const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); return DOUCEURS[n % DOUCEURS.length]; };

/* ---------- petites briques ---------- */
const COCHE_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';
const barre = (pct, texte) => `<div class="progres${pct >= 100 ? ' complet' : ''}"><div class="barre"><i style="width:${pct}%"></i></div><b>${pct} %</b>${texte ? `<span>${texte}</span>` : ''}</div>`;
const etoile = (on, act, attrs, titre) => `<button type="button" class="btn-rond${on ? ' on' : ''}" data-act="${act}" ${attrs} title="${on ? 'Retirer des favoris' : 'Mettre en favori'}" aria-pressed="${!!on}" aria-label="${esc(titre || 'Favori')}">${on ? '★' : '☆'}</button>`;
const vide = (texte, bouton) => `<div class="vide">${texte}${bouton ? `<br>${bouton}` : ''}</div>`;
const PRIX_MOYEN = { fruits: 2.5, frais: 2.8, viandes: 7, epicerie: 2.2, surgeles: 4, boissons: 2.4, hygiene: 4, autre: 3 };
function budgetCourses() {
  const r = coursesRestantes();
  let total = 0, estimes = 0;
  r.forEach(c => { const p = nombre(c.prix); if (p > 0) total += p; else { total += PRIX_MOYEN[c.rayon] || 3; estimes++; } });
  return { total, estimes, n: r.length };
}

function ligneEl(l, e, avecListe) {
  const a = auj(), retard = e.date && e.date < a && !e.fait;
  const meta = [
    e.priorite === 'haute' ? '<span class="etiquette alerte"><i class="prio haute"></i> Importante</span>' : '',
    e.quantite ? `<span class="qte">× ${esc(e.quantite)}</span>` : '',
    e.date ? `<span class="etiquette${retard ? ' alerte' : e.date === a ? ' or' : ''}">📅 ${esc(quand(e.date))}</span>` : '',
    e.rappel ? '<span title="Rappel prévu">⏰</span>' : '',
    avecListe ? `<span>${esc(l.emoji || '📝')} ${esc(l.nom)}</span>` : '',
    ['courses', 'achats'].includes(l.modele) || l.systeme ? badgesConflits(conflits(e.texte), true) : ''
  ].filter(Boolean).join('');
  return `<div class="ligne${e.fait ? ' fait' : ''}">
    <button class="coche-btn" type="button" data-act="cocher-el" data-l="${l.id}" data-e="${e.id}" aria-pressed="${!!e.fait}" aria-label="${e.fait ? 'Décocher' : 'Cocher'} : ${esc(e.texte)}">${COCHE_SVG}</button>
    <div class="corps" data-act="modifier-el" data-l="${l.id}" data-e="${e.id}" role="button" tabindex="0">
      <div class="texte">${esc(e.texte)}</div>
      ${meta ? `<div class="meta">${meta}</div>` : ''}
      ${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}
    </div>
    <div class="outils">
      <button type="button" class="btn-rond" data-act="rappel-el" data-l="${l.id}" data-e="${e.id}" title="Transformer en rappel" aria-label="Transformer en rappel">⏰</button>
      <button type="button" class="btn-rond" data-act="suppr-el" data-l="${l.id}" data-e="${e.id}" title="Supprimer" aria-label="Supprimer">🗑</button>
    </div></div>`;
}
function ligneCourse(c) {
  const hab = S.habituels.some(h => sansAccent(h.nom) === sansAccent(c.nom));
  const meta = [qteTexte(c) ? `<span class="qte">${esc(qteTexte(c))}</span>` : '', estDeSaison(c.nom) ? '<span class="etiquette ok">🍓 de saison</span>' : '', badgesConflits(conflits(c.nom), true), nombre(c.prix) > 0 ? `<span>≈ ${argent(nombre(c.prix))}</span>` : '',
    c.origine === 'recette' ? '<span>🍽️ menu</span>' : c.origine === 'cadeau' ? '<span>🎁 cadeau</span>' : c.origine === 'partage' ? '<span>👥 partagé</span>' : ''].filter(Boolean).join(' · ');
  return `<div class="ligne${c.fait ? ' fait' : ''}">
    <button class="coche-btn" type="button" data-act="cocher-course" data-c="${c.id}" aria-pressed="${!!c.fait}" aria-label="${c.fait ? 'Remettre' : 'Acheté'} : ${esc(c.nom)}">${COCHE_SVG}</button>
    <div class="corps" data-act="modifier-course" data-c="${c.id}" role="button" tabindex="0">
      <div class="texte">${esc(c.nom)}</div>${meta ? `<div class="meta">${meta}</div>` : ''}${c.note ? `<div class="note">${esc(c.note)}</div>` : ''}
    </div>
    <div class="outils">
      <button type="button" class="btn-rond${hab ? ' on' : ''}" data-act="habituel-course" data-c="${c.id}" title="${hab ? 'Déjà dans mes produits habituels' : 'Ajouter à mes produits habituels'}" aria-label="Produit habituel">${hab ? '★' : '☆'}</button>
      <button type="button" class="btn-rond" data-act="rappel-course" data-c="${c.id}" title="Transformer en rappel" aria-label="Transformer en rappel">⏰</button>
      <button type="button" class="btn-rond" data-act="suppr-course" data-c="${c.id}" title="Retirer" aria-label="Retirer">🗑</button>
    </div></div>`;
}
function ligneOccasion(o) {
  const d = parseJour(o.date), n = joursEntre(auj(), o.date), t = typeOcc(o.type);
  const cad = S.cadeaux.filter(c => (o.personneId && c.personneId === o.personneId && c.statut !== 'offert') || c.occasion === o.cle);
  const pers = o.personneId ? nomPersonne(o.personneId) : '';
  return `<div class="occasion" data-act="ouvrir-occasion" data-cle="${esc(o.cle)}" role="button" tabindex="0">
    <div class="cal"><small>${MOIS_C[d.getMonth()]}</small><b>${d.getDate()}</b></div>
    <div class="txt"><div class="t">${t[1]} ${esc(o.titre)}</div>
      <div class="s">${esc(fmtJour(o.date, true))}${pers && !o.titre.includes(pers) ? ' · ' + esc(pers) : ''}${cad.length ? ` · 🎁 ${pluriel(cad.length, 'cadeau')} en cours` : o.personneId ? ' · aucune idée cadeau encore' : ''}</div></div>
    <div class="dans${n <= 7 ? ' proche' : ''}">${n === 0 ? 'Aujourd’hui 🎉' : n === 1 ? 'Demain' : 'J-' + n}</div></div>`;
}

/* ============================================================
   AUJOURD'HUI
   ============================================================ */
const MODELES_HORS_TACHES = ['courses', 'films', 'livres', 'jeux', 'idees', 'souhaits', 'achats'];
function tachesPrioritaires() {
  const a = auj(), r = [];
  listesActives().forEach(l => {
    if (MODELES_HORS_TACHES.includes(l.modele) || l.systeme) return;
    l.elements.forEach(e => {
      if (e.fait) return;
      const retard = e.date && e.date < a, jour = e.date === a;
      if (retard || jour || e.priorite === 'haute' || l.modele === 'jour') r.push({ l, e, score: retard ? 0 : jour ? 1 : e.priorite === 'haute' ? 2 : 3 });
    });
  });
  return r.sort((x, y) => x.score - y.score || (x.e.date || '9').localeCompare(y.e.date || '9'));
}
function aNePasOublier() {
  const a = auj(), r = [];
  S.rappels.filter(x => !x.fait && x.date <= ajouteJours(a, 2)).sort((x, y) => x.date.localeCompare(y.date)).forEach(x =>
    r.push(`<div class="rappel${x.date < a ? ' retard' : ''}"><span class="e">⏰</span><div class="t">${esc(x.texte)}<small>${esc(quand(x.date))}${x.origine ? ' · ' + esc(x.origine) : ''}</small></div>
      <button type="button" class="btn-rond" data-act="rappel-fait" data-r="${x.id}" title="C'est fait" aria-label="C'est fait">✓</button></div>`));
  listesActives().forEach(l => l.elements.filter(e => e.rappel && !e.fait && e.date && e.date <= ajouteJours(a, 1)).forEach(e =>
    r.push(`<div class="rappel${e.date < a ? ' retard' : ''}"><span class="e">${esc(l.emoji || '📝')}</span><div class="t">${esc(e.texte)}<small>${esc(quand(e.date))} · ${esc(l.nom)}</small></div>
      <button type="button" class="btn-rond" data-act="cocher-el" data-l="${l.id}" data-e="${e.id}" title="C'est fait" aria-label="C'est fait">✓</button></div>`)));
  rappelsOccasions().forEach(({ occ, n }) => {
    const cad = S.cadeaux.filter(c => c.statut !== 'offert' && ((occ.personneId && c.personneId === occ.personneId) || c.occasion === occ.cle));
    const pret = cad.some(c => rangStatut(c.statut) >= 2);
    r.push(`<div class="rappel"><span class="e">${typeOcc(occ.type)[1]}</span><div class="t">${esc(occ.titre)} ${n === 0 ? 'aujourd’hui' : n === 1 ? 'demain' : 'dans ' + n + ' jours'}
      <small>${pret ? '🎁 Le cadeau est prêt' : cad.length ? `💡 ${pluriel(cad.length, 'idée')} — pensez à l’acheter` : 'Pas encore d’idée cadeau'}</small></div>
      <button type="button" class="btn petit" data-act="ouvrir-occasion" data-cle="${esc(occ.cle)}">Voir</button></div>`);
  });
  S.aConsommer.filter(x => x.date && x.date <= ajouteJours(a, 2)).forEach(x =>
    r.push(`<div class="rappel${x.date < a ? ' retard' : ''}"><span class="e">🥛</span><div class="t">${esc(x.nom)} à consommer<small>${x.date < a ? 'date dépassée — à vérifier' : esc(quand(x.date))}</small></div>
      <button type="button" class="btn-rond" data-act="consomme" data-x="${x.id}" title="Consommé" aria-label="Consommé">✓</button></div>`));
  return r;
}

function vueAujourdhui() {
  const a = auj(), h = new Date().getHours();
  const salut = h < 5 ? 'Belle nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bel après-midi' : 'Bonsoir';
  const taches = tachesPrioritaires();
  const faites = S.listes.reduce((t, l) => t + l.elements.filter(e => e.fait && e.faitLe === a).length, 0);
  const total = faites + taches.length, pct = total ? Math.round(faites / total * 100) : 0, C = 2 * Math.PI * 50;
  const repas = repasDu(a), restantes = coursesRestantes(), occ = occasionsAVenir(60);
  const aAcheter = S.listes.find(l => l.systeme === 'aacheter' && !l.archivee);
  const aAcheterN = aAcheter ? aAcheter.elements.filter(e => !e.fait).length : 0;
  const enCours = S.cadeaux.filter(c => ['acheter', 'achete', 'emballe'].includes(c.statut));
  const oubli = aNePasOublier();
  const b = budgetCourses();
  const toutVide = !S.listes.length && !S.recettes.length && !S.personnes.length && !S.courses.length;

  const hero = `<section class="carte hero" aria-label="Ma journée">
    <a class="jeton-lien" href="../NaoGroup.html" title="Revenir à NaoGroup" aria-label="Revenir à NaoGroup"><svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-da"/></svg></a>
    <div class="txt">
      <div class="date">${esc(fmtJour(a, true))}</div>
      <h2>${salut}, voici <span>ma journée</span></h2>
      <p class="douceur">${esc(douceurDuJour())}</p>
      <div class="resume">
        <div data-act="vue" data-vue="listes" role="button" tabindex="0"><b>${taches.length}</b><small>${taches.length > 1 ? 'tâches prioritaires' : 'tâche prioritaire'}</small></div>
        <div data-act="aller-menus" data-sous="planning" role="button" tabindex="0"><b>${repas.length}</b><small>${repas.length > 1 ? 'repas prévus' : 'repas prévu'}</small></div>
        <div data-act="aller-menus" data-sous="courses" role="button" tabindex="0"><b>${restantes.length}</b><small>${restantes.length > 1 ? 'articles à acheter' : 'article à acheter'}</small></div>
        <div data-act="aller-cadeaux" data-sous="occasions" role="button" tabindex="0"><b>${occ.filter(o => joursEntre(a, o.date) <= 30).length}</b><small>occasions sous 30 jours</small></div>
      </div>
      ${toutVide ? `<div class="actions" style="margin-top:14px"><button type="button" class="btn lavande" data-act="exemple"><span class="e">✨</span> Découvrir avec un exemple</button><span class="ui muet" style="font-size:12.5px">ou commencez directement avec les boutons ci-dessous.</span></div>` : ''}
    </div>
    <div class="progres-jour" title="Tâches cochées aujourd'hui">
      <svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="gradProgres" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E7BD4"/><stop offset="1" stop-color="#9FB0FF"/></linearGradient></defs>
        <circle class="fondc" cx="60" cy="60" r="50"/><circle class="valc" cx="60" cy="60" r="50" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(1)}"/></svg>
      <div class="lab"><div><b>${faites}</b>${faites > 1 ? 'cochées' : 'cochée'}<br>aujourd’hui</div></div>
    </div>
  </section>`;

  const rapides = `<div class="rapides" role="group" aria-label="Actions rapides">
    <button type="button" class="rapide principal" data-act="ajouter"><span class="ic">＋</span>Ajouter<small>Tâche, article, repas, cadeau…</small></button>
    <button type="button" class="rapide" data-act="nouvelle-tache" style="animation-delay:.04s"><span class="ic">✓</span>Ajouter une tâche<small>Dans la liste de mon choix</small></button>
    <button type="button" class="rapide" data-act="nouvelle-liste" style="animation-delay:.08s"><span class="ic">📝</span>Créer une liste<small>Libre ou depuis un modèle</small></button>
    <button type="button" class="rapide" data-act="planifier" style="animation-delay:.12s"><span class="ic">🍽️</span>Planifier un repas<small>Et préparer les courses</small></button>
    <button type="button" class="rapide" data-act="nouvel-article" style="animation-delay:.16s"><span class="ic">🛒</span>Ajouter un article<small>Rangé par rayon tout seul</small></button>
    <button type="button" class="rapide" data-act="nouveau-cadeau" style="animation-delay:.2s"><span class="ic">🎁</span>Ajouter une idée cadeau<small>Pour ne plus l’oublier</small></button>
  </div>`;

  const cTaches = `<section class="carte" style="animation-delay:.05s">
    <div class="coin"><button type="button" class="btn petit" data-act="nouvelle-tache">＋ Tâche</button></div>
    <h3><span class="e">✅</span> Mes tâches prioritaires</h3>
    <p class="chapo">En retard, prévues aujourd’hui, ou marquées importantes.</p>
    ${taches.length ? taches.slice(0, 7).map(t => ligneEl(t.l, t.e, true)).join('') + (taches.length > 7 ? `<button type="button" class="lien" data-act="vue" data-vue="listes" style="margin:8px 10px 0">Voir les ${taches.length - 7} autres →</button>` : '')
      : vide(faites ? `Tout est fait pour aujourd’hui 🌙 Bravo pour vos ${pluriel(faites, 'coche')} !` : 'Rien d’urgent aujourd’hui. Profitez-en, ou notez ce qui vous trotte dans la tête.', '<button type="button" class="btn petit" data-act="nouvelle-tache">＋ Ajouter une tâche</button>')}
  </section>`;

  const cRepas = `<section class="carte" style="animation-delay:.1s">
    <div class="coin"><button type="button" class="btn petit" data-act="planifier" data-jour="${a}">＋ Repas</button></div>
    <h3><span class="e">🍽️</span> Le repas du jour</h3>
    <p class="chapo">${repas.length ? 'Ce qui est prévu aujourd’hui.' : 'Rien de prévu pour le moment.'}</p>
    <div class="repas-jour">${MOMENTS.filter(m => m[0] !== 'collation' || repas.some(r => r.moment === 'collation')).map(m => {
      const rs = repas.filter(r => r.moment === m[0]);
      if (!rs.length) return m[0] === 'petitdej' ? '' : `<div class="r vide-r" data-act="planifier" data-jour="${a}" data-moment="${m[0]}" role="button" tabindex="0"><span class="e">${m[1]}</span><div><div class="m">${m[2]}</div><div class="n">Qu’est-ce qu’on mange ? ＋</div></div></div>`;
      return rs.map(r => `<div class="r" data-act="modifier-repas" data-r="${r.id}" role="button" tabindex="0"><span class="e">${emojiRepas(r)}</span><div><div class="m">${m[2]}${r.personnes ? ' · ' + pluriel(r.personnes, 'personne') : ''}</div><div class="n">${esc(nomRepas(r))} ${signeConflit(conflitsRepas(r))}</div></div></div>`).join('');
    }).join('')}</div>
    ${!repas.some(r => r.moment === 'diner') && S.ideesRepas.length ? (() => { const i = S.ideesRepas[new Date().getDate() % S.ideesRepas.length];
      return `<div class="rappel" style="margin-top:10px"><span class="e">💡</span><div class="t">Une idée pour ce soir : <b>${esc(i.nom)}</b><small>Tirée de vos idées repas</small></div><button type="button" class="btn petit" data-act="planifier-idee" data-i="${i.id}" data-jour="${a}" data-moment="diner">Planifier</button></div>`; })() : ''}
    <div class="actions" style="margin-top:12px"><button type="button" class="lien" data-act="aller-menus" data-sous="planning">Voir le menu de la semaine →</button><button type="button" class="lien" data-act="aller-menus" data-sous="idees">💡 Mes idées repas →</button></div>
  </section>`;

  const cCourses = `<section class="carte" style="animation-delay:.15s">
    <div class="coin"><button type="button" class="btn petit" data-act="aller-menus" data-sous="courses">Ouvrir</button></div>
    <h3><span class="e">🛒</span> Ma liste de courses</h3>
    <p class="chapo">${restantes.length ? `${pluriel(restantes.length, 'article')} · budget estimé ≈ ${argent(b.total)} <span class="muet">(indicatif)</span>` : 'La liste est vide.'}${aAcheterN ? ` · 🛍️ ${pluriel(aAcheterN, 'achat')} dans « À acheter »` : ''}</p>
    <form class="ajout-rapide" data-form="course-rapide"><input class="saisie" name="t" placeholder="Ajouter un article (ex. 2 kg pommes)" aria-label="Ajouter un article" autocomplete="off"><button class="btn plein" type="submit">Ajouter</button></form>
    <div style="margin-top:8px">${restantes.slice(0, 6).map(ligneCourse).join('')}</div>
    ${restantes.length > 6 ? `<button type="button" class="lien" data-act="aller-menus" data-sous="courses" style="margin:6px 10px 0">+ ${pluriel(restantes.length - 6, 'autre article', 'autres articles')} →</button>` : ''}
  </section>`;

  const cOcc = `<section class="carte" style="animation-delay:.2s">
    <div class="coin"><button type="button" class="btn petit" data-act="nouvelle-occasion">＋ Occasion</button></div>
    <h3><span class="e">🎂</span> Prochaines occasions</h3>
    <p class="chapo">Anniversaires, fêtes et moments à ne pas manquer.</p>
    ${occ.length ? occ.slice(0, 4).map(ligneOccasion).join('') : vide('Ajoutez vos proches et leur date d’anniversaire : ils apparaîtront ici.', '<button type="button" class="btn petit" data-act="nouvelle-personne">＋ Ajouter un proche</button>')}
    ${enCours.length ? `<div class="sous-titre">🎁 Cadeaux à acheter, emballer ou offrir</div>${enCours.slice(0, 4).map(c => `<div class="rappel"><span class="e">${statut(c.statut)[1]}</span><div class="t">${esc(c.titre)}<small>${statut(c.statut)[2]}${c.personneId ? ' · pour ' + esc(nomPersonne(c.personneId)) : ''}</small></div>
      <button type="button" class="btn petit" data-act="cadeau-suivant" data-c="${c.id}">→ ${statut(STATUTS[rangStatut(c.statut) + 1][0])[2]}</button></div>`).join('')}` : ''}
  </section>`;

  const cOubli = `<section class="carte" style="animation-delay:.25s">
    <div class="coin"><button type="button" class="btn petit" data-act="nouveau-rappel">＋ Rappel</button></div>
    <h3><span class="e">📌</span> À ne pas oublier</h3>
    <p class="chapo">Vos rappels, les dates qui approchent et ce qui est à consommer bientôt.</p>
    <div class="oubli">${oubli.length ? oubli.join('') : vide('Rien à signaler. Tout est sous contrôle ✨')}</div>
    ${S.rappels.length ? '<div class="actions" style="margin-top:10px"><button type="button" class="lien" data-act="tous-rappels">Tous mes rappels →</button></div>' : ''}
  </section>`;

  const favL = listesActives().filter(l => l.favori), favR = S.recettes.filter(r => r.favori);
  const cRacc = `<section class="carte" style="animation-delay:.3s">
    <h3><span class="e">⚡</span> Mes raccourcis</h3>
    <p class="chapo">Listes favorites, produits habituels et recettes préférées, à portée de clic.</p>
    <div class="sous-titre">⭐ Listes favorites</div>
    <div class="raccourcis">${favL.length ? favL.map(l => `<button type="button" class="puce" data-act="ouvrir-liste" data-l="${l.id}">${esc(l.emoji || '📝')} ${esc(l.nom)} <span class="muet">${avancement(l).pct} %</span></button>`).join('') : '<span class="ui muet" style="font-size:12.5px">Touchez ☆ sur une liste pour la retrouver ici.</span>'}</div>
    <div class="sous-titre">🧺 Produits habituels <span class="muet" style="text-transform:none;letter-spacing:0;font-weight:500">— un clic pour l’ajouter aux courses</span></div>
    <div class="raccourcis">${S.habituels.length ? S.habituels.map(p => `<button type="button" class="puce" data-act="ajouter-habituel" data-h="${p.id}"><span class="plus">＋</span> ${esc(p.nom)}</button>`).join('') : '<span class="ui muet" style="font-size:12.5px">Lait, pain, café… touchez ☆ sur un article de courses.</span>'}</div>
    ${favR.length ? `<div class="sous-titre">📖 Recettes favorites</div><div class="raccourcis">${favR.map(r => `<button type="button" class="puce" data-act="planifier" data-recette="${r.id}">${esc(r.emoji || '🍽️')} ${esc(r.nom)}</button>`).join('')}</div>` : ''}
  </section>`;

  return `<div class="vue">${hero}${rapides}<div class="grille g2">${cTaches}${cRepas}${cCourses}${cOcc}${cOubli}${cRacc}${carteMoisAccueil()}</div></div>`;
}

/* ============================================================
   MES LISTES
   ============================================================ */
function carteListe(l, i) {
  const av = avancement(l), reste = l.elements.filter(e => !e.fait);
  return `<article class="carte-liste${l.archivee ? ' archivee' : ''}" data-act="ouvrir-liste" data-l="${l.id}" role="button" tabindex="0" style="animation-delay:${Math.min(i, 12) * .03}s" aria-label="${esc(l.nom)}">
    <div class="fav">${etoile(l.favori, 'fav-liste', `data-l="${l.id}"`, 'Liste favorite')}</div>
    <div class="tete"><div class="emo">${esc(l.emoji || '📝')}</div><div style="min-width:0;padding-right:30px"><h4>${esc(l.nom)}</h4>
      <div class="sous">${av.f}/${av.n} ${av.n > 1 ? 'éléments' : 'élément'}${l.partage ? ' · ' + esc(partageLib(l.partage)) : ''}${l.archivee ? ' · archivée' : ''}</div></div></div>
    ${barre(av.pct)}
    <div class="apercu">${reste.slice(0, 3).map(e => `<span>${esc(e.texte)}</span>`).join('') || `<em class="muet">${av.n ? 'Tout est coché ✨' : 'Liste vide'}</em>`}</div>
  </article>`;
}
function vueListes() {
  if (U.liste && trouver(S.listes, U.liste)) return vueDetailListe(trouver(S.listes, U.liste));
  U.liste = null;
  const q = sansAccent(U.recherche);
  const filtres = [['toutes', 'Toutes'], ['favoris', '⭐ Mes favoris'], ['partagees', '👥 Partagées'], ['archivees', '🗄️ Archivées']];
  let ls = S.listes.filter(l => U.filtre === 'archivees' ? l.archivee : !l.archivee);
  if (U.filtre === 'favoris') ls = ls.filter(l => l.favori);
  if (U.filtre === 'partagees') ls = ls.filter(l => l.partage);
  let resultats = '';
  if (q) {
    const trouves = [];
    S.listes.forEach(l => l.elements.forEach(e => { if (sansAccent(e.texte + ' ' + (e.note || '')).includes(q)) trouves.push([l, e]); }));
    ls = ls.filter(l => sansAccent(l.nom).includes(q) || l.elements.some(e => sansAccent(e.texte + ' ' + (e.note || '')).includes(q)));
    const surligne = t => { const i = sansAccent(t).indexOf(q); return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length)); };
    resultats = trouves.length ? `<section class="carte" style="margin-bottom:16px"><h3><span class="e">🔎</span> ${pluriel(trouves.length, 'élément trouvé', 'éléments trouvés')}</h3><div class="pile" style="gap:6px;margin-top:10px">
      ${trouves.slice(0, 30).map(([l, e]) => `<div class="resultat-recherche" data-act="ouvrir-liste" data-l="${l.id}" role="button" tabindex="0"><span>${e.fait ? '✅' : '○'}</span><span style="flex:1">${surligne(e.texte)}</span><span class="muet">${esc(l.emoji || '📝')} ${esc(l.nom)}</span></div>`).join('')}</div></section>` : '';
  }
  const titres = { toutes: 'Toutes mes listes', favoris: 'Mes favoris', partagees: 'Mes listes partagées', archivees: 'Listes archivées' };
  return `<div class="vue">
    <div class="titre-vue"><div><h2>Mes <span>listes</span></h2><p>Tout ce qu’on ne veut plus garder en tête : tâches, courses, valise, films, idées…</p></div>
      <div class="actions"><button type="button" class="btn plein" data-act="nouvelle-liste"><span class="e">＋</span> Créer une liste</button></div></div>
    <div class="barre-outils">
      <div class="recherche"><input class="saisie" id="rechercheListes" type="search" placeholder="Rechercher une liste ou un élément…" value="${esc(U.recherche)}" aria-label="Rechercher"></div>
      <div class="filtres">${filtres.map(([k, t]) => `<button type="button" class="filtre${U.filtre === k ? ' actif' : ''}" data-act="filtre-listes" data-f="${k}">${t}</button>`).join('')}</div>
    </div>
    ${resultats}
    <div class="sous-titre">${titres[U.filtre]} · ${ls.length}</div>
    ${ls.length ? `<div class="listes">${ls.map(carteListe).join('')}</div>` : vide(q ? 'Aucune liste ne correspond à cette recherche.' : U.filtre === 'favoris' ? 'Aucune liste favorite : touchez ☆ sur une liste.' : U.filtre === 'partagees' ? 'Aucune liste partagée. Ouvrez une liste puis « 👥 Partager ».' : U.filtre === 'archivees' ? 'Aucune liste archivée.' : 'Aucune liste pour l’instant.', U.filtre === 'toutes' && !q ? '<button type="button" class="btn plein" data-act="nouvelle-liste">＋ Créer ma première liste</button>' : '')}
    <section class="carte" style="margin-top:18px"><h3><span class="e">✨</span> Partir d’un modèle</h3><p class="chapo">Un clic, et la liste est prête avec quelques idées pour commencer.</p>
      <div class="modeles">${MODELES.map(m => `<button type="button" class="modele" data-act="depuis-modele" data-m="${m[0]}"><span class="e">${m[1]}</span>${esc(m[2])}</button>`).join('')}</div></section>
  </div>`;
}
function vueDetailListe(l) {
  const av = avancement(l), a = auj();
  const tri = (x, y) => (x.priorite === 'haute' ? 0 : x.priorite === 'basse' ? 2 : 1) - (y.priorite === 'haute' ? 0 : y.priorite === 'basse' ? 2 : 1) || (x.date || '9').localeCompare(y.date || '9');
  const afaire = l.elements.filter(e => !e.fait).sort(tri), faits = l.elements.filter(e => e.fait);
  const estCourses = l.modele === 'courses';
  return `<div class="vue detail-liste">
    <div class="actions" style="margin-bottom:12px"><button type="button" class="btn fin" data-act="fermer-liste">← Toutes mes listes</button></div>
    <section class="carte">
      <div class="tete-detail"><div class="emo">${esc(l.emoji || '📝')}</div>
        <div style="flex:1;min-width:220px"><h3 style="margin:0">${esc(l.nom)}</h3>
          <div class="ui muet" style="font-size:12.5px">${av.f} sur ${av.n} · ${esc(modele(l.modele)[2])}${l.partage ? ' · ' + esc(partageLib(l.partage)) : ''}${l.archivee ? ' · archivée' : ''}</div>
          <div style="margin-top:8px;max-width:420px">${barre(av.pct)}</div></div>
        <div class="actions">
          ${etoile(l.favori, 'fav-liste', `data-l="${l.id}"`, 'Liste favorite')}
          <button type="button" class="btn petit" data-act="modifier-liste" data-l="${l.id}">✏️ Modifier</button>
          <button type="button" class="btn petit" data-act="dupliquer-liste" data-l="${l.id}">⧉ Dupliquer</button>
          <button type="button" class="btn petit" data-act="partager-liste" data-l="${l.id}">👥 Partager</button>
          <button type="button" class="btn petit" data-act="archiver-liste" data-l="${l.id}">${l.archivee ? '↩︎ Désarchiver' : '🗄️ Archiver'}</button>
          <button type="button" class="btn petit danger" data-act="suppr-liste" data-l="${l.id}">🗑</button>
        </div></div>
      ${av.n && av.pct === 100 && !l.archivee ? `<div class="rappel" style="margin-bottom:10px"><span class="e">🎉</span><div class="t">Bravo, cette liste est terminée !<small>Vous pouvez l’archiver pour la garder sans l’avoir sous les yeux.</small></div><button type="button" class="btn petit plein" data-act="archiver-liste" data-l="${l.id}">🗄️ Archiver</button></div>` : ''}
      <form class="ajout-rapide" data-form="element-rapide" data-l="${l.id}"><input class="saisie" name="t" placeholder="${estCourses ? 'Ajouter un article…' : 'Ajouter un élément, puis Entrée…'}" aria-label="Ajouter un élément" autocomplete="off">
        <button class="btn plein" type="submit">Ajouter</button><button class="btn" type="button" data-act="nouvel-el" data-l="${l.id}" title="Avec note, quantité, priorité, date…">＋ Détails</button></form>
      ${estCourses && afaire.length ? `<div class="actions" style="margin-top:10px"><button type="button" class="btn petit lavande" data-act="liste-vers-courses" data-l="${l.id}">🛒 Envoyer vers Ma liste de courses</button></div>` : ''}
      <div style="margin-top:12px">${afaire.map(e => ligneEl(l, e)).join('') || (av.n ? '' : vide('Cette liste attend son premier élément.'))}</div>
      ${faits.length ? `<div class="sous-titre" style="margin-top:18px">✅ Terminé · ${faits.length} <button type="button" class="lien" data-act="decocher-tout" data-l="${l.id}" style="margin-left:auto;text-transform:none;letter-spacing:0">Tout décocher</button></div>${faits.map(e => ligneEl(l, e)).join('')}` : ''}
    </section>
  </div>`;
}

/* ============================================================
   MENUS & COURSES
   ============================================================ */
const SOUS_MENUS = [['planning', '🗓️ Planning des repas'], ['idees', '💡 Idées repas'], ['saison', '🍓 De saison'], ['recettes', '📖 Mes recettes'], ['courses', '🛒 Liste de courses'], ['antigaspi', '♻️ Anti-gaspillage'], ['nutrition', '📊 Nutrition'], ['allergies', '🛡️ Allergies']];

/* ---------- les idées repas : une réserve d'envies, sans recette obligatoire ---------- */
const SUGGESTIONS_REPAS = {
  rapide: ['Omelette aux herbes', 'Pâtes au pesto', 'Wraps poulet crudités', 'Croque-monsieur et salade', 'Riz sauté aux légumes', 'Quesadillas'],
  economique: ['Soupe de légumes', 'Lentilles corail au curry', 'Gratin de pâtes', 'Hachis parmentier', 'Pâtes carbonara', 'Galettes de pommes de terre'],
  equilibre: ['Saumon, riz et brocolis', 'Buddha bowl', 'Poulet rôti et légumes', 'Salade de quinoa', 'Papillote de poisson', 'Poêlée de légumes et œuf'],
  vegetarien: ['Curry de pois chiches', 'Lasagnes aux légumes', 'Risotto aux champignons', 'Chili sin carne', 'Quiche aux poireaux', 'Dahl de lentilles'],
  familial: ['Pizza maison', 'Burgers maison', 'Tacos', 'Crêpes salées', 'Spaghetti bolognaise', 'Croquettes de poisson et purée'],
  fete: ['Tartiflette', 'Blanquette de veau', 'Couscous', 'Paella', 'Fondue savoyarde', 'Raclette'],
  avance: ['Chili con carne', 'Bœuf bourguignon', 'Gratin dauphinois', 'Cake salé', 'Salade de pâtes', 'Soupe à emporter'],
  restes: ['Riz cantonais des restes', 'Clafoutis salé', 'Frittata du frigo', 'Pain perdu', 'Salade composée', 'Tarte « fond de frigo »']
};
const emojiIdee = c => ({ rapide: '⚡', economique: '🪙', equilibre: '🥗', vegetarien: '🌱', familial: '👨‍👩‍👧', fete: '🎉', avance: '🫙', restes: '♻️' }[c] || '💡');
function menuIdees() {
  const cat = U.catIdee || '';
  let ids = S.ideesRepas.slice().sort((a, b) => (b.favori - a.favori) || a.nom.localeCompare(b.nom));
  if (cat === 'favoris') ids = ids.filter(i => i.favori); else if (cat) ids = ids.filter(i => i.categorie === cat);
  const miennes = new Set(S.ideesRepas.map(i => sansAccent(i.nom)));
  const catSugg = cat && cat !== 'favoris' ? [cat] : Object.keys(SUGGESTIONS_REPAS);
  return `<div class="grille g3">
    <section class="carte large-2">
      <div class="coin"><button type="button" class="btn petit lavande" data-act="idee-hasard">🎲 Une idée au hasard</button></div>
      <h3><span class="e">💡</span> Mes idées repas</h3>
      <p class="chapo">Les plats qui vous font envie, sans recette à écrire. Un clic pour les planifier quand l’inspiration manque.</p>
      <form class="ajout-rapide" data-form="idee-repas"><input class="saisie" name="t" placeholder="Ex. Gnocchis à la sauce tomate, soupe de potiron…" aria-label="Ajouter une idée repas" autocomplete="off"><button class="btn plein" type="submit">Ajouter</button></form>
      <div class="filtres" style="margin:12px 0 6px"><button type="button" class="filtre${!cat ? ' actif' : ''}" data-act="cat-idee" data-c="">Toutes · ${S.ideesRepas.length}</button><button type="button" class="filtre${cat === 'favoris' ? ' actif' : ''}" data-act="cat-idee" data-c="favoris">⭐ Favorites</button>
        ${CATS_RECETTE.map(([k, t]) => `<button type="button" class="filtre${cat === k ? ' actif' : ''}" data-act="cat-idee" data-c="${k}">${t}</button>`).join('')}</div>
      ${ids.length ? ids.map(i => `<div class="ligne"><span style="font-size:20px;width:26px;text-align:center">${emojiIdee(i.categorie)}</span>
        <div class="corps" data-act="modifier-idee" data-i="${i.id}" role="button" tabindex="0"><div class="texte">${esc(i.nom)} ${signeConflit(conflits(i.nom))}</div>
          <div class="meta">${i.categorie ? `<span class="etiquette bleu">${esc(catRecette(i.categorie))}</span>` : ''}${i.dernier ? `<span>dernière fois ${esc(quand(i.dernier))}</span>` : ''}${i.note ? `<span>${esc(i.note)}</span>` : ''}</div></div>
        <div class="outils" style="opacity:1">${etoile(i.favori, 'fav-idee', `data-i="${i.id}"`, 'Idée favorite')}
          <button type="button" class="btn petit plein" data-act="planifier-idee" data-i="${i.id}">📅 Planifier</button>
          <button type="button" class="btn-rond" data-act="idee-en-recette" data-i="${i.id}" title="En faire une recette" aria-label="En faire une recette">📖</button>
          <button type="button" class="btn-rond" data-act="suppr-idee" data-i="${i.id}" title="Supprimer" aria-label="Supprimer">🗑</button></div></div>`).join('')
        : vide(S.ideesRepas.length ? 'Aucune idée dans cette catégorie.' : 'Notez ici les plats qui vous plaisent, ou piochez dans l’inspiration à côté.')}
    </section>
    <section class="carte">
      <h3><span class="e">✨</span> Besoin d’inspiration ?</h3>
      <p class="chapo">Touchez une idée pour l’ajouter à votre liste.</p>
      ${catSugg.map(c => `<div class="sous-titre">${esc(catRecette(c))}</div><div class="raccourcis">${SUGGESTIONS_REPAS[c].map(n => miennes.has(sansAccent(n))
        ? `<span class="puce" style="opacity:.5;cursor:default">✓ ${esc(n)}</span>`
        : `<button type="button" class="puce" data-act="ajouter-suggestion" data-n="${esc(n)}" data-c="${c}"><span class="plus">＋</span> ${esc(n)}</button>`).join('')}</div>`).join('')}
    </section></div>`;
}
function vueMenus() {
  const rec = U.menus === 'recettes' && U.recette && trouver(S.recettes, U.recette);
  if (rec) return vueDetailRecette(rec);
  const n = coursesRestantes().length;
  const corps = { planning: menuPlanning, idees: menuIdees, saison: menuSaison, recettes: menuRecettes, courses: menuCourses, antigaspi: menuAntigaspi, nutrition: menuNutrition, allergies: menuAllergies }[U.menus] || menuPlanning;
  return `<div class="vue">
    <div class="titre-vue"><div><h2>Menus <span>& courses</span></h2><p>Planifier les repas, garder ses recettes, et laisser la liste de courses se faire toute seule.</p></div></div>
    <div class="sous-onglets" role="tablist">${SOUS_MENUS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${U.menus === k}" class="${U.menus === k ? 'actif' : ''}" data-act="sous-menus" data-s="${k}">${t}${k === 'courses' && n ? ` · ${n}` : ''}</button>`).join('')}</div>
    ${corps()}
  </div>`;
}
function menuPlanning() {
  const a = auj();
  if (U.mode === 'mois') {
    const [y, m] = U.mois.split('-').map(Number), prem = `${U.mois}-01`, debut = lundiDe(prem);
    const jours = Array.from({ length: 42 }, (_, i) => ajouteJours(debut, i));
    const n = S.repas.filter(r => r.date.startsWith(U.mois)).length;
    return `<section class="carte">
      <div class="semaine-nav"><button type="button" class="btn-rond" data-act="mois-prec" aria-label="Mois précédent">‹</button><span class="titre-sem">${MOIS_L[m - 1]} ${y}</span><button type="button" class="btn-rond" data-act="mois-suiv" aria-label="Mois suivant">›</button>
        <button type="button" class="btn petit fin" data-act="mois-courant">Ce mois-ci</button>
        <div class="actions" style="margin-left:auto"><div class="filtres"><button type="button" class="filtre" data-act="mode-menu" data-m="semaine">Semaine</button><button type="button" class="filtre actif" data-act="mode-menu" data-m="mois">Mois</button></div>
        <button type="button" class="btn petit plein" data-act="planifier">＋ Planifier un repas</button></div></div>
      <p class="ui muet" style="font-size:12.5px;margin:0 0 12px">${pluriel(n, 'repas prévu', 'repas prévus')} ce mois-ci. Touchez un jour pour ouvrir sa semaine.</p>
      <div class="mois">${['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(j => `<div class="jn">${j}</div>`).join('')}
        ${jours.map(j => { const rs = repasDu(j); return `<div class="jour-m${j.slice(0, 7) !== U.mois ? ' hors' : ''}${j === a ? ' auj' : ''}" data-act="voir-semaine" data-j="${j}" role="button" tabindex="0"><b>${+j.slice(8)}</b>${rs.slice(0, 3).map(r => `<div>${emojiRepas(r)} ${esc(nomRepas(r))}</div>`).join('')}${rs.length > 3 ? `<div class="muet">+${rs.length - 3}</div>` : ''}</div>`; }).join('')}</div>
    </section>`;
  }
  const jours = Array.from({ length: 7 }, (_, i) => ajouteJours(U.semaine, i)), fin = jours[6];
  const dA = parseJour(U.semaine), dB = parseJour(fin);
  const titre = dA.getMonth() === dB.getMonth() ? `Semaine du ${dA.getDate()} au ${dB.getDate()} ${MOIS_L[dB.getMonth()]}` : `Semaine du ${dA.getDate()} ${MOIS_C[dA.getMonth()]} au ${dB.getDate()} ${MOIS_C[dB.getMonth()]}`;
  const rs = S.repas.filter(r => r.date >= U.semaine && r.date <= fin);
  const avecRecette = rs.filter(r => r.recetteId && trouver(S.recettes, r.recetteId));
  return `<section class="carte">
    <div class="semaine-nav"><button type="button" class="btn-rond" data-act="sem-prec" aria-label="Semaine précédente">‹</button><span class="titre-sem">${titre}</span><button type="button" class="btn-rond" data-act="sem-suiv" aria-label="Semaine suivante">›</button>
      <button type="button" class="btn petit fin" data-act="sem-courante">Cette semaine</button>
      <div class="actions" style="margin-left:auto"><div class="filtres"><button type="button" class="filtre actif" data-act="mode-menu" data-m="semaine">Semaine</button><button type="button" class="filtre" data-act="mode-menu" data-m="mois">Mois</button></div>
      <button type="button" class="btn petit" data-act="partager-menu">👥 Partager</button>
      <button type="button" class="btn petit lavande" data-act="generer-courses" ${avecRecette.length ? '' : 'disabled title="Planifiez des recettes pour générer la liste"'}>🛒 Générer les courses</button></div></div>
    <p class="ui muet" style="font-size:12.5px;margin:0 0 12px">${pluriel(rs.length, 'repas prévu', 'repas prévus')} · ${pluriel(avecRecette.length, 'avec recette', 'avec recette')}. Touchez une case pour ajouter un repas.</p>
    <div class="defile"><div class="semaine">
      <div></div>${jours.map(j => { const d = parseJour(j); return `<div class="entete${j === a ? ' auj' : ''}">${JOURS_C[d.getDay()]}<b>${d.getDate()}</b></div>`; }).join('')}
      ${MOMENTS.map(m => `<div class="moment">${m[1]} ${m[2]}</div>${jours.map(j => {
        const ici = rs.filter(r => r.date === j && r.moment === m[0]);
        return `<div class="case-repas${j === a ? ' auj' : ''}" data-act="planifier" data-jour="${j}" data-moment="${m[0]}" role="button" tabindex="0" aria-label="${m[2]} du ${fmtJour(j, true)}">
          ${ici.map(r => `<div class="repas" data-act="modifier-repas" data-r="${r.id}">${signeConflit(conflitsRepas(r))}${emojiRepas(r)} ${esc(nomRepas(r))}${r.personnes ? `<small>👥 ${r.personnes}</small>` : ''}</div>`).join('') || '<span class="plus">＋</span>'}</div>`;
      }).join('')}`).join('')}
    </div></div>
  </section>`;
}
function carteRecette(r, i) {
  return `<article class="recette" data-act="voir-recette" data-r="${r.id}" role="button" tabindex="0" style="animation-delay:${Math.min(i, 12) * .03}s">
    <div class="fav">${etoile(r.favori, 'fav-recette', `data-r="${r.id}"`, 'Recette favorite')}</div>
    <div class="emo">${esc(r.emoji || '🍽️')}</div><h4>${esc(r.nom)}</h4>
    <div class="infos">${nombre(r.temps) + nombre(r.tempsCuisson) + nombre(r.tempsRepos) ? `<span class="etiquette">⏱ ${fmtDuree(nombre(r.temps) + nombre(r.tempsCuisson) + nombre(r.tempsRepos))}</span>` : ''}${badgesConflits(conflitsRecette(r), true)}${r.personnes ? `<span class="etiquette">👥 ${r.personnes}</span>` : ''}${(n => n.comptes.length ? `<span class="etiquette" title="Estimation par portion">🔥 ~${Math.round(n.parPortion.kcal)} kcal</span>` : '')(nutritionRecette(r))}${r.categories.slice(0, 2).map(c => `<span class="etiquette bleu">${esc(catRecette(c))}</span>`).join('')}</div>
    <div class="ui muet" style="font-size:12px">${pluriel(r.ingredients.length, 'ingrédient')}</div>
    <div class="bas"><button type="button" class="btn petit plein" data-act="planifier" data-recette="${r.id}">📅 Planifier</button><button type="button" class="btn petit" data-act="recette-courses" data-r="${r.id}">🛒 Aux courses</button></div>
  </article>`;
}
function menuRecettes() {
  const q = sansAccent(U.chercheRecette);
  let rs = S.recettes.slice().sort((a, b) => (b.favori - a.favori) || a.nom.localeCompare(b.nom));
  if (U.catRecette === 'favoris') rs = rs.filter(r => r.favori);
  else if (U.catRecette === 'compatibles') rs = rs.filter(r => niveauMax(conflitsRecette(r)) < 2);
  else if (U.catRecette) rs = rs.filter(r => r.categories.includes(U.catRecette));
  if (q) rs = rs.filter(r => sansAccent(r.nom + ' ' + r.ingredients.map(i => i.nom).join(' ')).includes(q));
  return `<div class="barre-outils">
      <div class="recherche"><input class="saisie" id="chercheRecette" type="search" placeholder="Une recette, un ingrédient…" value="${esc(U.chercheRecette)}" aria-label="Rechercher une recette"></div>
      <button type="button" class="btn plein" data-act="nouvelle-recette">＋ Nouvelle recette</button></div>
    <div class="filtres" style="margin-bottom:16px"><button type="button" class="filtre${!U.catRecette ? ' actif' : ''}" data-act="cat-recette" data-c="">Toutes</button><button type="button" class="filtre${U.catRecette === 'favoris' ? ' actif' : ''}" data-act="cat-recette" data-c="favoris">⭐ Favorites</button>${allergiesRenseignees() ? `<button type="button" class="filtre${U.catRecette === 'compatibles' ? ' actif' : ''}" data-act="cat-recette" data-c="compatibles">🛡️ Compatibles allergies</button>` : ''}
      ${CATS_RECETTE.map(([k, t]) => `<button type="button" class="filtre${U.catRecette === k ? ' actif' : ''}" data-act="cat-recette" data-c="${k}">${t}</button>`).join('')}</div>
    ${rs.length ? `<div class="recettes">${rs.map(carteRecette).join('')}</div>` : vide(S.recettes.length ? 'Aucune recette ne correspond.' : 'Enregistrez vos recettes préférées : ingrédients, étapes, temps de préparation. Elles rempliront la liste de courses toutes seules.', '<button type="button" class="btn plein" data-act="nouvelle-recette">＋ Ma première recette</button>')}`;
}
function menuCourses() {
  const restantes = coursesRestantes(), faites = S.courses.filter(c => c.fait), b = budgetCourses();
  const parRayon = RAYONS.map(r => [r, restantes.filter(c => c.rayon === r[0])]).filter(x => x[1].length);
  const aAcheter = S.listes.find(l => l.systeme === 'aacheter' && !l.archivee);
  return `<div class="grille g3" style="margin-bottom:16px">
    <section class="carte large-2">
      <h3><span class="e">🛒</span> Ajouter un article</h3>
      <p class="chapo">Il se range tout seul dans son rayon. Vous pouvez écrire la quantité devant : « 2 kg pommes », « 6 œufs ».</p>
      <form class="ajout-rapide" data-form="course-rapide"><input class="saisie" name="t" placeholder="Ex. 1 l lait, lessive, 500 g pâtes…" aria-label="Ajouter un article" autocomplete="off"><button class="btn plein" type="submit">Ajouter</button></form>
      <div class="sous-titre" style="margin-top:16px">🧺 Mes produits habituels <button type="button" class="lien" data-act="gerer-habituels" style="margin-left:auto;text-transform:none;letter-spacing:0">Gérer</button></div>
      <div class="raccourcis">${S.habituels.length ? S.habituels.map(p => `<button type="button" class="puce" data-act="ajouter-habituel" data-h="${p.id}"><span class="plus">＋</span> ${esc(p.nom)}</button>`).join('') : '<span class="ui muet" style="font-size:12.5px">Touchez ☆ sur un article pour l’ajouter à vos habituels.</span>'}</div>
    </section>
    <section class="carte">
      <h3><span class="e">💶</span> Budget estimé</h3>
      <p class="chapo">Uniquement à titre indicatif.</p>
      <div class="budget-courses"><div><b>≈ ${argent(b.total)}</b><br><small>pour ${pluriel(b.n, 'article')}${b.estimes ? ` · dont ${b.estimes} au prix moyen du rayon` : ''}</small></div></div>
      <div class="actions" style="margin-top:14px">
        <button type="button" class="btn petit" data-act="imprimer-courses">🖨️ Imprimer</button>
        <button type="button" class="btn petit" data-act="exporter-courses">⬇️ Exporter</button>
        <button type="button" class="btn petit" data-act="partager-courses">👥 Partager</button>
        <button type="button" class="btn petit lavande" data-act="generer-courses">🍽️ Depuis le menu</button>
      </div>
    </section></div>
    ${aAcheter && aAcheter.elements.some(e => !e.fait) ? `<section class="carte" style="margin-bottom:16px"><h3><span class="e">🛍️</span> Aussi à acheter</h3><p class="chapo">Depuis la liste « À acheter » (cadeaux, achats ponctuels).</p>${aAcheter.elements.filter(e => !e.fait).map(e => ligneEl(aAcheter, e)).join('')}</section>` : ''}
    ${parRayon.length ? `<div class="rayons">${parRayon.map(([r, cs]) => `<section class="rayon"><h4><span class="e">${r[1]}</span>${r[2]}<span class="n">${cs.length}</span></h4>${cs.map(ligneCourse).join('')}</section>`).join('')}</div>`
      : vide(faites.length ? 'Tout est dans le panier ! 🧺' : 'La liste de courses est vide. Ajoutez un article, un produit habituel, ou générez-la depuis le menu de la semaine.')}
    ${faites.length ? `<section class="carte" style="margin-top:16px"><div class="coin"><button type="button" class="btn petit" data-act="vider-panier">🧹 Retirer les ${faites.length} articles achetés</button></div>
      <h3><span class="e">🧺</span> Dans le panier</h3><p class="chapo">Déjà acheté — décochez si besoin.</p>${faites.map(ligneCourse).join('')}</section>` : ''}`;
}
const ASTUCES = [
  ['🧊', 'Congelez le pain, les restes de sauce et les fruits trop mûrs (pour les smoothies ou un crumble).'],
  ['🥕', 'Les fanes de carottes et de radis font un très bon pesto.'],
  ['🍌', 'Des bananes trop mûres ? Un banana bread, des pancakes ou une compote.'],
  ['🥖', 'Le pain rassis devient pain perdu, croûtons ou chapelure maison.'],
  ['🍲', 'Un soir par semaine « frigo vide » : soupe, omelette, quiche ou riz sauté avec ce qui reste.'],
  ['🧀', 'Les restes de fromage finissent en gratin, en croque-monsieur ou dans une pâte à cake salé.'],
  ['📅', 'Rangez devant ce qui périme en premier : on le voit, on le mange.'],
  ['🥗', 'Faites la liste de courses après avoir regardé le frigo : on achète seulement ce qui manque.'],
  ['🍅', 'Des tomates fatiguées ? Une sauce ou une soupe froide, puis au congélateur.'],
  ['🫙', 'Gardez les restes dans des boîtes transparentes : on les oublie beaucoup moins.']
];
function menuAntigaspi() {
  const a = auj();
  const items = S.aConsommer.slice().sort((x, y) => (x.date || '9').localeCompare(y.date || '9'));
  const restes = S.recettes.filter(r => r.categories.includes('restes'));
  return `<div class="grille g2">
    <section class="carte">
      <div class="coin"><button type="button" class="btn petit plein" data-act="nouveau-aconsommer">＋ Ajouter</button></div>
      <h3><span class="e">⏳</span> À consommer bientôt</h3>
      <p class="chapo">Ce qu’il y a dans le frigo et qu’il ne faut pas oublier.</p>
      ${items.length ? items.map(x => { const n = x.date ? joursEntre(a, x.date) : 99;
        return `<div class="dlc${n <= 1 ? ' urgent' : n <= 3 ? ' bientot' : ''}"><span>🥛</span><span style="flex:1;cursor:pointer" data-act="modifier-aconsommer" data-x="${x.id}">${esc(x.nom)}${x.qte ? ` <span class="muet">· ${esc(x.qte)}</span>` : ''}</span>
          <span class="j">${x.date ? (n < 0 ? 'dépassé' : n === 0 ? 'aujourd’hui' : n === 1 ? 'demain' : 'J-' + n) : ''}</span>
          <button type="button" class="btn-rond" data-act="idee-recette" data-x="${x.id}" title="Trouver une recette" aria-label="Trouver une recette">🍳</button>
          <button type="button" class="btn-rond" data-act="consomme" data-x="${x.id}" title="Consommé" aria-label="Consommé">✓</button></div>`; }).join('')
        : vide('Notez ici les produits entamés ou qui approchent de leur date : ils apparaîtront sur « Aujourd’hui » au bon moment.')}
    </section>
    <section class="carte">
      <h3><span class="e">♻️</span> Idées anti-gaspillage</h3>
      <p class="chapo">De petites habitudes qui changent tout.</p>
      ${ASTUCES.map(([e, t]) => `<div class="astuce"><span class="e">${e}</span><span>${esc(t)}</span></div>`).join('')}
      ${restes.length ? `<div class="sous-titre">♻️ Mes recettes « restes à utiliser »</div><div class="raccourcis">${restes.map(r => `<button type="button" class="puce" data-act="voir-recette" data-r="${r.id}">${esc(r.emoji || '🍽️')} ${esc(r.nom)}</button>`).join('')}</div>` : ''}
    </section></div>`;
}

/* ============================================================
   CADEAUX & OCCASIONS
   ============================================================ */
const SOUS_CADEAUX = [['idees', '🎁 Idées & suivi'], ['personnes', '👥 Mes proches'], ['occasions', '📅 Occasions'], ['budget', '💶 Budget & historique'], ['envies', '🌠 Ma liste d’envies'], ['mots', '💌 Mots pour la carte']];
function vueCadeaux() {
  const corps = { idees: cadeauxIdees, personnes: cadeauxPersonnes, occasions: cadeauxOccasions, budget: cadeauxBudget, envies: cadeauxEnvies, mots: cadeauxMots }[U.cadeaux] || cadeauxIdees;
  return `<div class="vue">
    <div class="titre-vue"><div><h2>Cadeaux <span>& occasions</span></h2><p>Les proches, leurs goûts, les dates qui comptent — et le bon cadeau, prévu à temps.</p></div>
      <div class="actions"><button type="button" class="btn" data-act="nouvelle-personne">＋ Un proche</button><button type="button" class="btn plein" data-act="nouveau-cadeau">＋ Idée cadeau</button></div></div>
    <div class="sous-onglets" role="tablist">${SOUS_CADEAUX.map(([k, t]) => `<button type="button" role="tab" aria-selected="${U.cadeaux === k}" class="${U.cadeaux === k ? 'actif' : ''}" data-act="sous-cadeaux" data-s="${k}">${t}</button>`).join('')}</div>
    ${corps()}
  </div>`;
}
function carteCadeau(c) {
  const p = trouver(S.personnes, c.personneId), r = rangStatut(c.statut);
  const commun = c.commun && c.participants && c.participants.length;
  return `<div class="cadeau" data-act="modifier-cadeau" data-c="${c.id}" role="button" tabindex="0">
    ${c.photo ? `<img src="${c.photo}" alt="">` : ''}
    <div class="t">${esc(c.titre)}</div>
    <div class="meta">${p ? `<span>${esc(p.emoji || '🌸')} ${esc(p.prenom)}</span>` : c.pour ? `<span>${esc(c.pour)}</span>` : ''}
      ${nombre(c.prix) ? `<span class="etiquette">${argent(nombre(c.prix))}</span>` : nombre(c.budget) ? `<span class="etiquette">budget ${argent(nombre(c.budget))}</span>` : ''}
      ${c.categorie ? `<span>${esc(catCadeau(c.categorie))}</span>` : ''}${c.magasin ? `<span>🏬 ${esc(c.magasin)}</span>` : ''}${c.occasionTitre ? `<span>📅 ${esc(c.occasionTitre)}</span>` : ''}
      ${commun ? `<span class="etiquette rose">🤝 commun · ${c.participants.length + 1} pers.</span>` : ''}${c.lien ? '<span>🔗</span>' : ''}</div>
    <div class="suite">${r < 4 ? `<button type="button" class="btn petit" data-act="cadeau-suivant" data-c="${c.id}">→ ${STATUTS[r + 1][2]}</button>` : ''}
      ${r <= 1 ? `<button type="button" class="btn petit fin" data-act="cadeau-aacheter" data-c="${c.id}" title="Ajouter à la liste « À acheter »">🛍️ À acheter</button>` : ''}</div>
  </div>`;
}
function cadeauxIdees() {
  let cs = S.cadeaux.slice();
  if (U.personne) cs = cs.filter(c => c.personneId === U.personne);
  const annee = new Date().getFullYear();
  return `<div class="barre-outils">
      <label class="ui" style="font-size:13px;display:flex;gap:8px;align-items:center">Pour
        <select class="saisie" id="filtrePersonne" style="width:auto;padding:9px 12px"><option value="">tout le monde</option>${S.personnes.map(p => `<option value="${p.id}"${U.personne === p.id ? ' selected' : ''}>${esc(p.prenom)}</option>`).join('')}</select></label>
      <span class="ui muet" style="font-size:12.5px">${pluriel(cs.filter(c => c.statut !== 'offert').length, 'cadeau en cours', 'cadeaux en cours')}</span></div>
    ${S.cadeaux.length ? `<div class="defile"><div class="pipeline">${STATUTS.map(([k, e, t]) => {
      let col = cs.filter(c => c.statut === k), avant = 0;
      if (k === 'offert') { const tous = col; col = col.filter(c => (c.dateOffert || '').startsWith(String(annee)) || !c.dateOffert).slice(0, 12); avant = tous.length - col.length; }
      return `<div class="colonne"><h4>${e} ${t}<span class="n">${col.length}</span></h4>${col.map(carteCadeau).join('') || `<div class="ui muet" style="font-size:12px;padding:8px 4px">—</div>`}
        ${avant ? `<button type="button" class="lien" data-act="sous-cadeaux" data-s="budget" style="margin:4px">📜 ${pluriel(avant, 'autre', 'autres')} dans l’historique →</button>` : ''}</div>`;
    }).join('')}</div></div>`
      : vide('Notez ici chaque idée qui passe : un livre évoqué, une envie glissée au détour d’une conversation… puis suivez-la jusqu’au jour J.', '<button type="button" class="btn plein" data-act="nouveau-cadeau">＋ Ma première idée cadeau</button>')}`;
}
function cadeauxPersonnes() {
  const a = auj();
  if (!S.personnes.length) return vide('Créez une fiche pour chaque proche : date d’anniversaire, goûts, tailles, couleurs préférées… Tout ce qui aide à trouver le bon cadeau.', '<button type="button" class="btn plein" data-act="nouvelle-personne">＋ Ajouter un proche</button>');
  const ps = S.personnes.slice().sort((x, y) => (prochaineDate(x.anniversaire) || '9').localeCompare(prochaineDate(y.anniversaire) || '9'));
  return `<div class="personnes">${ps.map((p, i) => {
    const d = prochaineDate(p.anniversaire), n = d ? joursEntre(a, d) : null, age = p.anneeConnue ? ageA(p.anniversaire, d) : null;
    const idees = S.cadeaux.filter(c => c.personneId === p.id && c.statut !== 'offert').length;
    const offerts = S.cadeaux.filter(c => c.personneId === p.id && c.statut === 'offert');
    return `<article class="personne" data-act="fiche-personne" data-p="${p.id}" role="button" tabindex="0" style="animation-delay:${Math.min(i, 12) * .03}s">
      <div class="tete"><div class="avatar">${esc(p.emoji || initiales(p.prenom))}</div><div><h4>${esc(p.prenom)}</h4><div class="lien-p">${esc(p.lien || '')}</div></div></div>
      ${d ? `<div class="anniv">🎂 ${parseJour(d).getDate()} ${MOIS_L[parseJour(d).getMonth()]}${age ? ` · ${age} ans` : ''} <span class="etiquette${n <= 14 ? ' or' : ''}">${n === 0 ? 'aujourd’hui !' : n === 1 ? 'demain' : 'dans ' + n + ' j'}</span></div>` : '<div class="anniv muet">Date d’anniversaire à ajouter</div>'}
      <div class="ui muet" style="font-size:12px">${pluriel(idees, 'idée en cours', 'idées en cours')} · ${pluriel(offerts.length, 'cadeau offert', 'cadeaux offerts')}</div>
      ${(p.interets || []).length ? `<div class="raccourcis">${p.interets.slice(0, 4).map(x => `<span class="etiquette">${esc(x)}</span>`).join('')}</div>` : ''}
    </article>`;
  }).join('')}</div>`;
}
function cadeauxOccasions() {
  const occ = occasionsAVenir(400);
  return `<div class="grille g3">
    <section class="carte large-2">
      <div class="coin"><button type="button" class="btn petit plein" data-act="nouvelle-occasion">＋ Occasion</button></div>
      <h3><span class="e">📅</span> Prochains anniversaires et occasions</h3>
      <p class="chapo">Les anniversaires des fiches, Noël et la Saint-Valentin s’ajoutent tout seuls.</p>
      ${occ.length ? occ.map(ligneOccasion).join('') : vide('Aucune occasion à venir.')}
    </section>
    <section class="carte">
      <h3><span class="e">⏰</span> Les rappels</h3>
      <p class="chapo">Pour chaque occasion, choisissez quand être prévenue : un mois avant, deux semaines, une semaine, trois jours ou la veille. Le rappel apparaît dans « À ne pas oublier ».</p>
      ${rappelsOccasions().length ? rappelsOccasions().map(({ occ: o, n }) => `<div class="rappel"><span class="e">${typeOcc(o.type)[1]}</span><div class="t">${esc(o.titre)}<small>${n === 0 ? 'aujourd’hui' : 'dans ' + pluriel(n, 'jour')}</small></div></div>`).join('') : vide('Aucun rappel actif en ce moment.')}
    </section></div>`;
}
function depensesCadeaux(prefixe) {
  return S.cadeaux.filter(c => rangStatut(c.statut) >= 2 && nombre(c.prix) > 0 && ((c.dateAchat || c.dateOffert || '').startsWith(prefixe)));
}
function cadeauxBudget() {
  const a = auj(), mois = a.slice(0, 7), annee = a.slice(0, 4);
  const dm = somme(depensesCadeaux(mois), c => nombre(c.prix)), da = somme(depensesCadeaux(annee), c => nombre(c.prix));
  const bm = nombre(S.budgetCadeaux.mois), ba = nombre(S.budgetCadeaux.annee);
  const prevu = somme(S.cadeaux.filter(c => rangStatut(c.statut) <= 1), c => nombre(c.prix) || nombre(c.budget));
  const jauge = (d, b) => b ? `<div class="jauge${d > b ? ' depasse' : ''}"><i style="width:${Math.min(100, Math.round(d / b * 100))}%"></i></div><div class="ui muet" style="font-size:12px">${argent(d)} sur ${argent(b)} · ${d > b ? 'dépassé de ' + argent(d - b) : 'reste ' + argent(b - d)}</div>` : `<div class="ui muet" style="font-size:12.5px;margin-top:6px">${argent(d)} dépensés · aucun budget fixé</div>`;
  const parPers = {};
  depensesCadeaux(annee).forEach(c => { const k = c.personneId ? nomPersonne(c.personneId) : (c.pour || 'Autres'); parPers[k] = (parPers[k] || 0) + nombre(c.prix); });
  const offerts = S.cadeaux.filter(c => c.statut === 'offert').sort((x, y) => (y.dateOffert || '').localeCompare(x.dateOffert || ''));
  const parAnnee = {};
  offerts.forEach(c => { const y = (c.dateOffert || '').slice(0, 4) || 'Sans date'; (parAnnee[y] = parAnnee[y] || []).push(c); });
  return `<div class="grille g3">
    <section class="carte"><div class="coin"><button type="button" class="btn petit" data-act="budget-cadeaux">✏️ Budgets</button></div>
      <h3><span class="e">🗓️</span> Ce mois-ci</h3><p class="chapo">${MOIS_L[+mois.slice(5) - 1]} ${annee}</p>${jauge(dm, bm)}</section>
    <section class="carte"><h3><span class="e">📆</span> Cette année</h3><p class="chapo">${annee}</p>${jauge(da, ba)}</section>
    <section class="carte"><h3><span class="e">💡</span> Encore prévu</h3><p class="chapo">Idées et cadeaux « à acheter » (prix ou budget indiqué)</p><div class="chiffre" style="font-size:30px">${argent(prevu)}</div></section>
    <section class="carte">
      <h3><span class="e">👥</span> Par personne</h3><p class="chapo">Dépensé en ${annee}</p>
      ${Object.keys(parPers).length ? Object.entries(parPers).sort((x, y) => y[1] - x[1]).map(([n, v]) => `<div class="part"><span>${esc(n)}</span><span class="m">${argent(v)}</span></div>`).join('') : vide('Rien pour le moment.')}
    </section>
    <section class="carte large-2">
      <h3><span class="e">📜</span> Historique des cadeaux offerts</h3><p class="chapo">Pour ne jamais offrir deux fois la même chose : NaoDaily vous prévient en cas de doublon.</p>
      ${offerts.length ? Object.keys(parAnnee).sort().reverse().map(y => `<div class="sous-titre">${esc(y)}</div>${parAnnee[y].map(c => `<div class="rappel" data-act="modifier-cadeau" data-c="${c.id}" role="button" tabindex="0" style="cursor:pointer"><span class="e">🎁</span><div class="t">${esc(c.titre)}<small>${c.personneId ? 'pour ' + esc(nomPersonne(c.personneId)) : esc(c.pour || '')}${c.occasionTitre ? ' · ' + esc(c.occasionTitre) : ''}${c.dateOffert ? ' · ' + esc(fmtJour(c.dateOffert)) : ''}</small></div>${nombre(c.prix) ? `<span class="qte">${argent(nombre(c.prix))}</span>` : ''}</div>`).join('')}`).join('') : vide('Les cadeaux passés au statut « Offert » apparaîtront ici.')}
    </section></div>`;
}
function cadeauxEnvies() {
  return `<section class="carte">
    <div class="coin"><button type="button" class="btn petit" data-act="partager-envies" ${S.envies.length ? '' : 'disabled'}>👥 Partager</button><button type="button" class="btn petit plein" data-act="nouvelle-envie">＋ Une envie</button></div>
    <h3><span class="e">🌠</span> Ma liste d’envies</h3>
    <p class="chapo">Ce qui me ferait plaisir — à partager avec mes proches quand ils demandent « qu’est-ce qui te ferait plaisir ? ».</p>
    ${S.envies.length ? S.envies.map(e => `<div class="ligne"><span style="font-size:20px">🌠</span><div class="corps" data-act="modifier-envie" data-x="${e.id}" role="button" tabindex="0"><div class="texte">${esc(e.titre)}</div>
      <div class="meta">${nombre(e.prix) ? `<span class="etiquette">${argent(nombre(e.prix))}</span>` : ''}${e.magasin ? `<span>🏬 ${esc(e.magasin)}</span>` : ''}${e.note ? `<span>${esc(e.note)}</span>` : ''}</div></div>
      ${e.lien ? `<a class="btn-rond" href="${esc(e.lien)}" target="_blank" rel="noopener" title="Ouvrir le lien" aria-label="Ouvrir le lien">🔗</a>` : ''}</div>`).join('') : vide('Votre liste d’envies est vide. Ajoutez un livre, une sortie, un objet qui vous fait de l’œil…')}
  </section>`;
}
const MOTS = {
  anniversaire: {
    doux: ['Joyeux anniversaire {p} ! Que cette nouvelle année t’apporte autant de douceur que tu en donnes autour de toi.', 'Une année de plus à t’avoir dans ma vie : c’est moi qui reçois le cadeau. Joyeux anniversaire !', 'Je te souhaite une journée lumineuse, des rires, des bras tendres et tout ce qui te rend heureux·se.'],
    drole: ['Joyeux anniversaire {p} ! Rassure-toi : tu ne vieillis pas, tu prends de la valeur.', 'On a compté les bougies… puis on a appelé les pompiers par précaution. Bon anniversaire !', 'Encore un an de sagesse accumulée. Enfin, surtout un an. Joyeux anniversaire !'],
    elegant: ['Belle et heureuse année à vous, {p}. Que chaque jour qui vient soit à la hauteur de ce que vous méritez.', 'Avec toute mon affection, je vous souhaite un anniversaire rempli de joie et une année riche de beaux projets.', 'À vous, à cette nouvelle année, et à tous les moments précieux qu’elle vous réserve.']
  },
  noel: {
    doux: ['Joyeux Noël {p} ! Que la magie de ces fêtes t’enveloppe de chaleur et de tendresse.', 'Un peu de douceur sous le sapin, et beaucoup d’amour autour. Joyeux Noël !'],
    drole: ['Le Père Noël m’a confié ce paquet. Il a dit que tu avais été (presque) sage. Joyeux Noël !', 'Joyeux Noël ! Garantie : zéro chaussette… cette année.'],
    elegant: ['Je vous souhaite de très belles fêtes de fin d’année, entouré·e de ceux qui vous sont chers.', 'Que ces fêtes vous apportent sérénité, lumière et de précieux moments partagés.']
  },
  naissance: {
    doux: ['Bienvenue au monde, petit trésor. Et félicitations aux parents pour ce bonheur tout neuf.', 'Un tout petit être, un immense amour. Tous nos vœux de bonheur à votre nouvelle famille.'],
    drole: ['Félicitations ! Les nuits courtes commencent, mais les câlins en valent chaque minute.', 'Bienvenue au nouveau chef de la maison. Les parents, bon courage !'],
    elegant: ['Toutes nos félicitations pour cette merveilleuse arrivée. Que cet enfant grandisse entouré de tendresse.', 'Avec nos vœux les plus sincères de bonheur et de santé pour votre petit et toute votre famille.']
  },
  mariage: {
    doux: ['Félicitations aux mariés ! Que votre amour grandisse chaque jour un peu plus.', 'Deux cœurs, un chemin. Tous nos vœux de bonheur pour cette belle aventure.'],
    drole: ['Félicitations ! Vous avez officiellement trouvé quelqu’un pour supporter vos manies à vie.', 'Vive les mariés ! Et que la bataille de la couette soit toujours amicale.'],
    elegant: ['Nous vous adressons nos vœux les plus chaleureux pour ce jour et pour toutes les années à venir.', 'Que votre union soit belle, douce et lumineuse. Avec toute notre affection.']
  },
  merci: {
    doux: ['Merci du fond du cœur {p}. Ta gentillesse m’a vraiment touché·e.', 'Un petit mot pour un grand merci : tu comptes beaucoup pour moi.'],
    drole: ['Merci ! Je te dois une fière chandelle… et probablement un gâteau.', 'Merci infiniment. Tu es officiellement nommé·e héros·ïne de la semaine.'],
    elegant: ['Je tenais à vous exprimer toute ma gratitude pour votre attention et votre générosité.', 'Avec mes plus sincères remerciements pour ce geste qui m’a profondément touché·e.']
  },
  fete: {
    doux: ['Bonne fête {p} ! Une petite attention pour te dire combien tu comptes.', 'Parce que tu mérites qu’on te fête : belle journée à toi !'],
    drole: ['Bonne fête ! Aujourd’hui, tu as le droit de tout. Enfin presque.', 'C’est ta fête ! Le gâteau est pour toi, les miettes pour nous.'],
    elegant: ['Je vous souhaite une très belle fête, remplie de joie et de douces attentions.', 'Avec toutes mes pensées affectueuses en ce jour qui vous est dédié.']
  }
};
function cadeauxMots() {
  const occ = [['anniversaire', '🎂 Anniversaire'], ['noel', '🎄 Noël'], ['naissance', '👶 Naissance'], ['mariage', '💍 Mariage'], ['merci', '💐 Merci'], ['fete', '🎉 Fête']];
  const tons = [['doux', '🤍 Doux'], ['drole', '😄 Drôle'], ['elegant', '✒️ Élégant']];
  const p = trouver(S.personnes, U.motsPour);
  const liste = (MOTS[U.motsOcc] || MOTS.anniversaire)[U.motsTon] || [];
  const decal = U.melange % Math.max(1, liste.length);
  const ordre = liste.slice(decal).concat(liste.slice(0, decal));
  const perso = t => t.replace(/ ?\{p\}/g, p ? ' ' + p.prenom : '').replace(/^ /, '');
  return `<section class="carte">
    <h3><span class="e">💌</span> Mots pour la carte</h3>
    <p class="chapo">Des idées de messages à recopier ou à adapter. Choisissez l’occasion, le ton, et pour qui.</p>
    <div class="filtres" style="margin-bottom:8px">${occ.map(([k, t]) => `<button type="button" class="filtre${U.motsOcc === k ? ' actif' : ''}" data-act="mots-occ" data-k="${k}">${t}</button>`).join('')}</div>
    <div class="barre-outils"><div class="filtres">${tons.map(([k, t]) => `<button type="button" class="filtre${U.motsTon === k ? ' actif' : ''}" data-act="mots-ton" data-k="${k}">${t}</button>`).join('')}</div>
      ${S.personnes.length ? `<label class="ui" style="font-size:13px;display:flex;gap:8px;align-items:center">Pour <select class="saisie" id="motsPour" style="width:auto;padding:8px 12px"><option value="">—</option>${S.personnes.map(x => `<option value="${x.id}"${U.motsPour === x.id ? ' selected' : ''}>${esc(x.prenom)}</option>`).join('')}</select></label>` : ''}
      <button type="button" class="btn petit" data-act="mots-melange">🎲 Une autre idée</button></div>
    ${ordre.map(t => `<div class="mot"><p>${esc(perso(t))}</p><button type="button" class="btn petit" data-act="copier-mot" data-t="${esc(perso(t))}">📋 Copier</button></div>`).join('')}
  </section>`;
}

/* ============================================================
   FAVORIS
   ============================================================ */
function vueFavoris() {
  const fl = S.listes.filter(l => l.favori && !l.archivee), fr = S.recettes.filter(r => r.favori);
  return `<div class="vue">
    <div class="titre-vue"><div><h2>Mes <span>favoris</span></h2><p>Ce qui revient souvent, rangé au même endroit.</p></div></div>
    <div class="sous-titre">⭐ Listes favorites · ${fl.length}</div>
    ${fl.length ? `<div class="listes">${fl.map(carteListe).join('')}</div>` : vide('Touchez ☆ sur une liste pour la mettre en favori.')}
    <div class="sous-titre" style="margin-top:22px">📖 Recettes favorites · ${fr.length}</div>
    ${fr.length ? `<div class="recettes">${fr.map(carteRecette).join('')}</div>` : vide('Touchez ☆ sur une recette pour la retrouver ici.')}
    <div class="grille g2" style="margin-top:22px">
      <section class="carte"><div class="coin"><button type="button" class="btn petit" data-act="gerer-habituels">Gérer</button></div>
        <h3><span class="e">🧺</span> Produits habituels</h3><p class="chapo">Un clic pour les ajouter à la liste de courses.</p>
        <div class="raccourcis">${S.habituels.length ? S.habituels.map(p => `<button type="button" class="puce" data-act="ajouter-habituel" data-h="${p.id}"><span class="plus">＋</span> ${esc(p.nom)}</button>`).join('') : '<span class="ui muet" style="font-size:12.5px">Aucun produit habituel.</span>'}</div></section>
      <section class="carte"><h3><span class="e">👥</span> Listes partagées</h3><p class="chapo">Avec le couple, la famille ou la colocation.</p>
        <div class="raccourcis">${S.listes.filter(l => l.partage && !l.archivee).map(l => `<button type="button" class="puce" data-act="ouvrir-liste" data-l="${l.id}">${esc(l.emoji || '📝')} ${esc(l.nom)} <span class="muet">${esc(partageLib(l.partage))}</span></button>`).join('') || '<span class="ui muet" style="font-size:12.5px">Aucune liste partagée.</span>'}</div></section>
    </div>
  </div>`;
}

/* ============================================================
   LE RENDU
   ============================================================ */
function rendre() {
  const nTaches = tachesPrioritaires().length, nCourses = coursesRestantes().length, nOcc = occasionsAVenir(14).length;
  const compte = { aujourdhui: 0, listes: nTaches, menus: nCourses, cadeaux: nOcc, favoris: 0 };
  $('#onglets').innerHTML = VUES.map(([k, e, t]) => `<button type="button" class="${U.vue === k ? 'actif' : ''}" data-act="vue" data-vue="${k}" aria-current="${U.vue === k ? 'page' : 'false'}"><span class="e">${e}</span>${t}${compte[k] ? `<span class="compte">${compte[k]}</span>` : ''}</button>`).join('');
  const f = { aujourdhui: vueAujourdhui, listes: vueListes, menus: vueMenus, cadeaux: vueCadeaux, favoris: vueFavoris }[U.vue] || vueAujourdhui;
  $('#contenu').innerHTML = f();
  document.title = `NaoDaily — ${(VUES.find(v => v[0] === U.vue) || VUES[0])[2]}`;
}

/* ============================================================
   DE SAISON : les fruits et légumes de chaque mois (France métropolitaine)
   ============================================================ */
const SAISONS = [
  /* janvier */ { f: 'Citron, Clémentine, Kiwi, Mandarine, Orange, Pamplemousse, Poire, Pomme', l: 'Betterave, Carotte, Céleri, Chou, Chou de Bruxelles, Endive, Mâche, Navet, Oignon, Panais, Poireau, Potiron, Salsifis, Topinambour',
    astuce: 'C’est la pleine saison des agrumes : de la vitamine C à volonté pour traverser l’hiver.', plats: ['Soupe poireaux-pommes de terre', 'Gratin d’endives au jambon', 'Salade d’agrumes'] },
  /* février */ { f: 'Citron, Clémentine, Kiwi, Mandarine, Orange, Pamplemousse, Poire, Pomme', l: 'Betterave, Carotte, Céleri, Chou, Chou de Bruxelles, Endive, Mâche, Navet, Oignon, Panais, Poireau, Salsifis, Topinambour',
    astuce: 'Panais, topinambours et carottes font des soupes et des purées toutes douces. Et c’est la Chandeleur !', plats: ['Crêpes de la Chandeleur', 'Velouté de panais', 'Potée au chou'] },
  /* mars */ { f: 'Citron, Kiwi, Orange, Pamplemousse, Poire, Pomme', l: 'Betterave, Carotte, Céleri, Chou, Endive, Épinard, Mâche, Navet, Oignon, Panais, Poireau, Radis',
    astuce: 'Les premiers radis et les jeunes épinards arrivent : place aux salades croquantes.', plats: ['Quiche aux épinards', 'Carottes râpées au citron', 'Pot-au-feu'] },
  /* avril */ { f: 'Citron, Kiwi, Pamplemousse, Pomme, Rhubarbe', l: 'Asperge, Blette, Carotte, Chou-fleur, Épinard, Laitue, Navet, Oignon nouveau, Petits pois, Poireau, Radis',
    astuce: 'Asperges et petits pois signent le printemps : cuisinez-les simplement, pour garder leur goût.', plats: ['Asperges vinaigrette', 'Risotto aux petits pois', 'Crumble à la rhubarbe'] },
  /* mai */ { f: 'Cerise, Fraise, Rhubarbe', l: 'Artichaut, Asperge, Blette, Carotte, Chou-fleur, Concombre, Épinard, Fève, Laitue, Navet, Petits pois, Radis',
    astuce: 'Les fraises françaises arrivent : choisissez-les bien rouges jusqu’à la queue, et parfumées.', plats: ['Tarte aux fraises', 'Fèves à la menthe', 'Salade de concombre au yaourt'] },
  /* juin */ { f: 'Abricot, Cerise, Fraise, Framboise, Groseille, Melon, Pêche, Rhubarbe', l: 'Artichaut, Asperge, Aubergine, Blette, Carotte, Concombre, Courgette, Fève, Haricot vert, Laitue, Petits pois, Poivron, Radis, Tomate',
    astuce: 'Début des fruits d’été ! Les courgettes s’installent pour tout l’été.', plats: ['Tian de courgettes', 'Salade melon et feta', 'Clafoutis aux cerises'] },
  /* juillet */ { f: 'Abricot, Cassis, Cerise, Fraise, Framboise, Groseille, Melon, Myrtille, Nectarine, Pastèque, Pêche, Prune', l: 'Artichaut, Aubergine, Blette, Brocoli, Carotte, Concombre, Courgette, Fenouil, Haricot vert, Laitue, Maïs, Petits pois, Poivron, Radis, Tomate',
    astuce: 'Tomates, courgettes, aubergines : c’est le mois des ratatouilles et des salades fraîches.', plats: ['Ratatouille', 'Salade de tomates anciennes', 'Tarte aux abricots'] },
  /* août */ { f: 'Abricot, Figue, Framboise, Melon, Mirabelle, Mûre, Myrtille, Nectarine, Pastèque, Pêche, Poire, Prune, Raisin', l: 'Artichaut, Aubergine, Blette, Brocoli, Carotte, Concombre, Courgette, Fenouil, Haricot vert, Laitue, Maïs, Poivron, Tomate',
    astuce: 'Profitez de l’abondance pour faire des confitures, des coulis, ou congeler des fruits d’été.', plats: ['Gaspacho', 'Aubergines rôties', 'Tarte aux prunes'] },
  /* septembre */ { f: 'Figue, Melon, Mirabelle, Mûre, Noisette, Noix, Pêche, Poire, Pomme, Prune, Raisin', l: 'Aubergine, Betterave, Brocoli, Carotte, Céleri, Concombre, Courgette, Épinard, Fenouil, Haricot vert, Laitue, Maïs, Poireau, Poivron, Potiron, Tomate',
    astuce: 'Rentrée gourmande : raisin, figues et prunes, et les toutes premières courges.', plats: ['Poêlée de courgettes', 'Tarte aux figues', 'Soupe de potiron'] },
  /* octobre */ { f: 'Châtaigne, Coing, Figue, Noisette, Noix, Poire, Pomme, Raisin', l: 'Betterave, Brocoli, Carotte, Céleri, Champignon, Chou, Courge, Épinard, Fenouil, Navet, Panais, Poireau, Potiron',
    astuce: 'Champignons, châtaignes et potirons annoncent le retour des plats réconfortants.', plats: ['Velouté de potiron', 'Poêlée de champignons', 'Crumble aux pommes'] },
  /* novembre */ { f: 'Châtaigne, Clémentine, Coing, Kaki, Kiwi, Mandarine, Noix, Poire, Pomme', l: 'Betterave, Brocoli, Carotte, Céleri, Chou, Chou de Bruxelles, Chou-fleur, Courge, Endive, Épinard, Mâche, Navet, Panais, Poireau, Potiron, Salsifis, Topinambour',
    astuce: 'Choux, poireaux et courges : parfaits pour les soupes, les gratins et les potées.', plats: ['Gratin de chou-fleur', 'Soupe de courge', 'Poires au chocolat'] },
  /* décembre */ { f: 'Châtaigne, Citron, Clémentine, Kaki, Kiwi, Mandarine, Orange, Pamplemousse, Poire, Pomme', l: 'Betterave, Carotte, Céleri, Chou, Chou de Bruxelles, Courge, Endive, Mâche, Navet, Panais, Poireau, Potiron, Salsifis, Topinambour',
    astuce: 'Clémentines et châtaignes pour les fêtes ; les légumes d’hiver tiennent la forme.', plats: ['Velouté de châtaignes', 'Choux de Bruxelles rôtis', 'Salade d’oranges à la cannelle'] }
].map(m => ({ fruits: m.f.split(', '), legumes: m.l.split(', '), astuce: m.astuce, plats: m.plats }));
const EMOJI_PRODUIT = { pomme: '🍎', poire: '🍐', orange: '🍊', clementine: '🍊', mandarine: '🍊', pamplemousse: '🍊', citron: '🍋', kiwi: '🥝', fraise: '🍓', cerise: '🍒',
  abricot: '🍑', peche: '🍑', nectarine: '🍑', melon: '🍈', pasteque: '🍉', raisin: '🍇', framboise: '🫐', myrtille: '🫐', mure: '🫐', cassis: '🫐', groseille: '🫐',
  chataigne: '🌰', noix: '🌰', noisette: '🌰', carotte: '🥕', tomate: '🍅', aubergine: '🍆', poivron: '🫑', mais: '🌽', concombre: '🥒', courgette: '🥒', brocoli: '🥦',
  'chou-fleur': '🥦', champignon: '🍄', oignon: '🧅', 'oignon nouveau': '🧅', potiron: '🎃', courge: '🎃', laitue: '🥬', mache: '🥬', epinard: '🥬', blette: '🥬', chou: '🥬',
  'petits pois': '🫛', feve: '🫛', 'haricot vert': '🫛', asperge: '🌱', radis: '🌱', rhubarbe: '🌱' };
const emojiProduit = (n, fruit) => EMOJI_PRODUIT[sansAccent(n)] || (fruit ? '🍏' : '🥬');
const saisonDe = m => SAISONS[((m % 12) + 12) % 12];
const majusculeMot = s => s.charAt(0).toUpperCase() + s.slice(1);
/* un article de courses est-il de saison ce mois-ci ? (seulement les fruits et légumes du calendrier) */
function estDeSaison(nom) {
  const m = saisonDe(new Date().getMonth()), n = sansAccent(nom);
  return m.fruits.concat(m.legumes).some(p => {
    const q = sansAccent(p); if (!n.startsWith(q)) return false;
    const reste = n.slice(q.length).replace(/^[sx]/, '');
    return reste === '' || (reste.startsWith(' ') && !/^ de terre/.test(reste));   /* « pommes de terre » ne sont pas des pommes */
  });
}
const puceProduit = (p, fruit, extra) => `<button type="button" class="puce" data-act="saison-course" data-n="${esc(p)}" title="Ajouter à la liste de courses">${emojiProduit(p, fruit)} ${esc(p)}${extra || ''}</button>`;
function menuSaison() {
  const actuel = new Date().getMonth(), m = U.moisSaison ?? actuel, s = saisonDe(m), avant = saisonDe(m - 1), apres = saisonDe(m + 1);
  const tous = x => x.fruits.concat(x.legumes);
  const arrivent = tous(s).filter(p => !tous(avant).includes(p)), partent = tous(s).filter(p => !tous(apres).includes(p));
  const idees = new Set(S.ideesRepas.map(i => sansAccent(i.nom)));
  const nouveau = p => arrivent.includes(p) ? ' <span class="etiquette ok">nouveau</span>' : '';
  return `<section class="carte" style="margin-bottom:16px">
      <h3><span class="e">🗓️</span> Le calendrier des saisons</h3>
      <p class="chapo">Fruits et légumes de saison en France : plus savoureux, souvent moins chers, et plus doux pour la planète. Touchez un produit pour l’ajouter aux courses.</p>
      <div class="filtres">${MOIS_L.map((n, i) => `<button type="button" class="filtre${i === m ? ' actif' : ''}" data-act="mois-saison" data-m="${i}">${i === actuel ? '📍 ' : ''}${majusculeMot(n)}</button>`).join('')}</div>
    </section>
    <div class="grille g2">
      <section class="carte"><h3><span class="e">🍎</span> Les fruits de ${esc(MOIS_L[m])}</h3><p class="chapo">${pluriel(s.fruits.length, 'fruit')} de saison</p>
        <div class="raccourcis">${s.fruits.map(p => puceProduit(p, true, nouveau(p))).join('')}</div></section>
      <section class="carte"><h3><span class="e">🥕</span> Les légumes de ${esc(MOIS_L[m])}</h3><p class="chapo">${pluriel(s.legumes.length, 'légume')} de saison</p>
        <div class="raccourcis">${s.legumes.map(p => puceProduit(p, false, nouveau(p))).join('')}</div></section>
      <section class="carte"><h3><span class="e">✨</span> Ce qui change</h3>
        <div class="sous-titre">🌱 Arrivent ce mois-ci</div><div class="raccourcis">${arrivent.map(p => puceProduit(p, s.fruits.includes(p))).join('') || '<span class="ui muet" style="font-size:12.5px">Rien de nouveau : on profite de ce qui est là.</span>'}</div>
        <div class="sous-titre">⏳ Derniers jours — à savourer avant ${esc(MOIS_L[(m + 1) % 12])}</div><div class="raccourcis">${partent.map(p => puceProduit(p, s.fruits.includes(p))).join('') || '<span class="ui muet" style="font-size:12.5px">Tout reste de saison le mois prochain.</span>'}</div></section>
      <section class="carte"><h3><span class="e">💡</span> L’info du mois</h3>
        <div class="astuce" style="font-size:14px"><span class="e">🌿</span><span>${esc(s.astuce)}</span></div>
        <div class="sous-titre">🍽️ Idées de plats de saison</div>
        ${s.plats.map(n => `<div class="rappel" style="margin-bottom:6px"><span class="e">🍽️</span><div class="t">${esc(n)}</div>
          ${idees.has(sansAccent(n)) ? '<span class="etiquette ok">✓ dans mes idées</span>' : `<button type="button" class="btn petit" data-act="saison-idee" data-n="${esc(n)}">＋ Mes idées</button>`}
          <button type="button" class="btn petit plein" data-act="saison-planifier" data-n="${esc(n)}">📅 Planifier</button></div>`).join('')}</section>
    </div>`;
}
/* la carte « Ce mois-ci » de la page Aujourd'hui */
function carteMoisAccueil() {
  const m = new Date().getMonth(), s = saisonDe(m), avant = saisonDe(m - 1);
  const nouveaux = s.fruits.concat(s.legumes).filter(p => !avant.fruits.concat(avant.legumes).includes(p));
  return `<section class="carte pleine" style="animation-delay:.35s">
    <div class="coin"><button type="button" class="btn petit" data-act="aller-menus" data-sous="saison">Tout le calendrier</button></div>
    <h3><span class="e">🍓</span> Ce mois-ci : ${esc(MOIS_L[m])}</h3>
    <p class="chapo">${esc(s.astuce)}${nouveaux.length ? ' · Nouveautés : ' + esc(nouveaux.slice(0, 5).join(', ').toLowerCase()) + '.' : ''}</p>
    <div class="grille g2" style="gap:12px">
      <div><div class="sous-titre">🍎 Fruits de saison</div><div class="raccourcis">${s.fruits.map(p => puceProduit(p, true)).join('')}</div></div>
      <div><div class="sous-titre">🥕 Légumes de saison</div><div class="raccourcis">${s.legumes.map(p => puceProduit(p, false)).join('')}</div></div>
    </div>
  </section>`;
}
