/* ============================================================
   NaoInvest — les écrans.
   ============================================================ */
/* Deux univers bien distincts, plus les pages communes. */
const UNIVERS = {
  vie:     { nom: 'Vie pratique', e: '🧭', court: 'Ce qu’on n’apprend pas à l’école',
             desc: 'Fiche de paie, impôts, câbles, fièvre, symboles du linge, voyants de la voiture, bons réflexes selon son âge.' },
  finance: { nom: 'Éducation financière', e: '💶', court: 'Gérer, épargner, placer',
             desc: 'Budget, épargne (livrets, assurance-vie, PEA, PER…), placements et Bourse, avec un portefeuille fictif pour s’exercer.' }
};
const ONGLETS = [
  { id: 'accueil',      nom: 'Accueil',               e: '🏠' },
  { id: 'vie',          nom: 'Vie pratique',          e: '🧭', hub: true },
  { id: 'finance',      nom: 'Éducation financière',  e: '💶', hub: true },
  { id: 'paie',         nom: 'Fiche de paie',         e: '💼', u: 'vie',     d: 'Lire sa fiche, et décrypter la sienne' },
  { id: 'impots',       nom: 'Impôts',                e: '🧾', u: 'vie',     d: 'Le cours en 8 chapitres et l’atelier de calcul' },
  { id: 'conseils',     nom: 'Conseils de vie',       e: '💡', u: 'vie',     d: 'Les bons réflexes par âge et par situation' },
  { id: 'cables',       nom: 'Câbles & prises',       e: '🔌', u: 'vie',     d: 'Reconnaître chaque câble en un coup d’œil' },
  { id: 'fievre',       nom: 'Fièvre',                e: '🌡️', u: 'vie',     d: 'Lire le thermomètre, savoir quand s’inquiéter' },
  { id: 'linge',        nom: 'Symboles du linge',     e: '🧺', u: 'vie',     d: 'Laver, sécher, repasser sans abîmer' },
  { id: 'voyants',      nom: 'Voyants de voiture',    e: '🚗', u: 'vie',     d: 'Ce que dit le tableau de bord, et que faire' },
  { id: 'bases',        nom: 'Mes bases',             e: '🧮', u: 'finance', d: 'Budget, crédit, découvert, inflation' },
  { id: 'guide',        nom: 'Guide de l’épargne',    e: '🏦', u: 'finance', d: 'Livrets, assurance-vie, PEA, PER… tout en détail' },
  { id: 'epargne',      nom: 'Épargner & investir',   e: '🌱', u: 'finance', d: 'Risque, horizon, diversification : les notions clés' },
  { id: 'bourse',       nom: 'La Bourse',             e: '📈', u: 'finance', d: 'De l’action à l’ETF, pas à pas' },
  { id: 'portefeuille', nom: 'Portefeuille fictif',   e: '🎮', u: 'finance', d: 'S’exercer avec 10 000 NaoCoins' },
  { id: 'actus',        nom: 'Actualités',            e: '📰', u: 'finance', d: 'L’économie expliquée, datée et sourcée' },
  { id: 'arnaques',     nom: 'Anti-arnaques',         e: '🛡️', u: 'finance', d: 'Signaux d’alerte, checklist, vérifications' },
  { id: 'progression',  nom: 'Ma progression',        e: '⭐' },
  { id: 'dico',         nom: 'Dictionnaire',          e: '📖' }
];
const partieDe = id => { const o = ONGLETS.find(x => x.id === id) || {}; return o.u || (o.hub ? o.id : null); };
const U = { vue: 'accueil', lecon: null, quiz: null, cat: '', vueActu: 'toutes', q: '', lettre: '', mix: null, calc: { rev: 30000, parts: 1 } };

const deco = n => { const i = n.indexOf('Nao'); return i === 0 ? `Nao<span>${esc(n.slice(3))}</span>` : esc(n); };
const jeton = (cls = '') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-in"/></svg>`;
const prog = (p, lib) => `<div class="prog" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" ${lib ? `aria-label="${esc(lib)}"` : ''}><i style="width:${p}%"></i></div>`;
const bandeauUnivers = k => { const u = UNIVERS[k]; return `<button type="button" class="bandeau-u u-${k}" data-vue="${k}" title="Voir toute la partie « ${esc(u.nom)} »"><span class="e" aria-hidden="true">${u.e}</span><span><small>${esc(u.court)}</small><b>${esc(u.nom)}</b></span><span class="fleche" aria-hidden="true">Tout voir →</span></button>`; };
const rappelRisque = (court) => `<div class="note risque"><span class="e">⚠️</span><div>${court
  ? '<b>Investir comporte des risques</b>, dont un risque de perte en capital. Les performances passées ne préjugent pas des performances futures.'
  : '<b>Rappel important.</b> Tout investissement comporte des risques, notamment un risque de <b>perte en capital</b>. Les performances passées ne préjugent pas des performances futures. NaoInvest est un outil d’éducation : il ne donne aucun conseil personnalisé. Avant toute décision, consultez une source officielle ou un professionnel compétent.'}</div></div>`;

/* ---------- le rendu général ---------- */
function rendre() {
  const partie = U.lecon ? partieDe(lecon(U.lecon).esp) : partieDe(U.vue);
  const seg = o => `<a class="seg ${o.hub ? 'u-' + o.id : ''} ${(o.hub ? partie === o.id : U.vue === o.id && !U.lecon) ? 'actif' : ''}" href="#${o.id}" data-vue="${o.id}"><span aria-hidden="true">${o.e}</span><span class="lib">${esc(o.nom)}</span></a>`;
  const sous = o => `<a class="onglet ${U.vue === o.id ? 'actif' : ''}" href="#${o.id}" data-vue="${o.id}" ${U.vue === o.id ? 'aria-current="page"' : ''}><span aria-hidden="true">${o.e}</span>${esc(o.nom)}</a>`;
  $('#onglets').innerHTML = `<div class="nav-principale">${ONGLETS.filter(o => o.id === 'accueil' || o.hub).map(seg).join('')}</div>
    ${partie ? `<div class="sous-nav u-${partie}">${ONGLETS.filter(o => o.u === partie).map(sous).join('')}</div>` : ''}`;
  const n = aRevoirAujourdhui().ratees.length, bp = $('#btnProgression');
  if (bp) bp.dataset.n = n || '';
  const m = $('#contenu');
  if (U.lecon) m.innerHTML = vueLecon(lecon(U.lecon));
  else if (U.mix) m.innerHTML = vueQuizMix();
  else m.innerHTML = ({ accueil: vueAccueil, vie: () => vueHub('vie'), finance: () => vueHub('finance'), paie: vuePaie, cables: vueCables, fievre: vueFievre, linge: vueLinge, voyants: vueVoyants, bases: () => vueEspace('bases'), epargne: () => vueEspace('epargne'), impots: vueCoursImpots, conseils: vueConseils, guide: vueGuide, bourse: () => vueEspace('bourse'),
    arnaques: () => vueEspace('arnaques'), portefeuille: vuePortefeuille, actus: vueActus, progression: vueProgression, dico: vueDico }[U.vue] || vueAccueil)();
  apresRendu();
}

/* ============================================================
   L'accueil
   ============================================================ */
function porte(k) {
  const u = UNIVERS[k];
  return `<div class="porte u-${k}">
    <button type="button" class="porte-tete" data-vue="${k}"><span class="e" aria-hidden="true">${u.e}</span><span><small>${esc(u.court)}</small><b>${esc(u.nom)}</b></span><span class="fleche" aria-hidden="true">→</span></button>
    <p>${esc(u.desc)}</p>
    <div class="porte-liens">${ONGLETS.filter(o => o.u === k).map(o => `<button type="button" class="porte-lien" data-vue="${o.id}"><span class="e" aria-hidden="true">${o.e}</span><b>${esc(o.nom)}</b></button>`).join('')}</div>
  </div>`;
}
function vueAccueil() {
  const ldj = leconDuJour(), niv = niveauActuel(), total = LECONS.length, n = faites().length;
  const salut = S.prenom ? `Bonjour ${esc(S.prenom)}` : (new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir');
  const c = duJour(tousConseils(), 'conseil');
  return `
  <section class="hero hero-simple">
    ${jeton('jeton')}
    <div class="txt">
      <div class="salut">${salut} · ${esc(dateLongue(auj()))}</div>
      <h2>Nao<span>Invest</span></h2>
      <p class="slogan">Comprendre avant de placer.</p>
      <p class="mission">Tout ce qu’on n’apprend pas à l’école, en deux parties : la vie pratique d’un côté, l’argent et l’épargne de l’autre.</p>
    </div>
  </section>

  <section class="portes" aria-label="Les deux parties de NaoInvest">${porte('vie')}${porte('finance')}</section>

  <h3 class="titre-jour">Aujourd’hui pour vous</h3>
  <div class="grille grille-jour">
    <article class="carte mini u-finance">
      <small class="etiquette">💶 Leçon du jour · ⏱ ${ldj.l.min} min</small>
      <b class="titre-m">${ldj.l.e} ${esc(ldj.l.titre)}</b>
      <p>${esc(ldj.pourquoi)}</p>
      <button class="btn petit" type="button" data-lecon="${ldj.l.id}">Commencer →</button>
    </article>
    <article class="carte mini u-vie">
      <small class="etiquette">🧭 Conseil du jour · ${esc(c.theme.nom.split(' : ')[0])}</small>
      <b class="titre-m">${c.e} ${esc(c.t)}</b>
      <p>${esc(c.reflexe)}</p>
      <button class="btn petit fin" type="button" data-conseil-voir="${c.theme.id}/${c.id}">Pourquoi ? →</button>
    </article>
    <article class="carte mini">
      <small class="etiquette">⭐ Ma progression</small>
      <b class="titre-m">Étape « ${esc(niv.nom)} »</b>
      <p>${n}/${total} leçons acquises · ${Object.keys(S.badges).length}/${BADGES.length} badges</p>
      ${prog(Math.round(n / total * 100), 'Progression globale')}
      <button class="btn petit fin" type="button" data-vue="progression" style="margin-top:10px">Voir le détail →</button>
    </article>
    <article class="carte mini">
      <small class="etiquette">🛡️ Réflexe anti-arnaque</small>
      <p class="citation">${esc(duJour(REFLEXES, 'reflexe'))}</p>
      <button class="btn petit fin" type="button" data-vue="arnaques">Les signaux d’alerte →</button>
    </article>
  </div>
  ${rappelRisque(true)}`;
}

/* ---------- la page d'entrée de chaque partie ---------- */
function vueHub(k) {
  const u = UNIVERS[k], tuiles = ONGLETS.filter(o => o.u === k);
  const etat = o => {
    if (ESPACES[o.id]) { const ls = LECONS.filter(l => l.esp === o.id); return `${ls.filter(l => acquise(l.id)).length}/${ls.length} leçons`; }
    return { impots: (() => { const p = PARCOURS.find(x => x.id === 'impots'); return `${progressionParcours(p).n}/8 chapitres`; })(), conseils: `${Object.keys(S.conseilsLus || {}).length}/${tousConseils().length} lus`,
      guide: `${GUIDE.length} fiches`, cables: `${CABLES.length} câbles`, linge: `${LINGE.reduce((t, f) => t + f.items.length, 0)} symboles`, voyants: `${VOYANTS.length} voyants`,
      paie: 'Import PDF ou photo', fievre: 'Thermomètre interactif', portefeuille: `${nb(DEPART)} NaoCoins`, actus: `${toutesActus().length} repères` }[o.id] || '';
  };
  return `<section class="hub-tete u-${k}"><span class="e" aria-hidden="true">${u.e}</span><div><small>${esc(u.court)}</small><h2>${esc(u.nom)}</h2><p>${esc(u.desc)}</p></div></section>
    ${k === 'finance' ? `<section class="bloc"><h3 class="bloc-titre">🪜 Par où commencer ?</h3><ol class="etapes-hub">${[
      ['bases', 'Tenir son budget', 'Revenus, dépenses, précaution, crédit.'],
      ['guide', 'Connaître les produits d’épargne', 'Livret A, assurance-vie, PEA, PER… et l’ordre logique pour épargner.'],
      ['epargne', 'Comprendre risque et rendement', 'Horizon, liquidité, diversification, frais.'],
      ['bourse', 'Découvrir la Bourse', 'Actions, obligations, indices, ETF.'],
      ['portefeuille', 'S’exercer sans risque', 'Un portefeuille fictif pour voir les effets du temps et des crises.']].map((e, i) => `<li><button type="button" data-vue="${e[0]}"><span class="num">${i + 1}</span><span><b>${esc(e[1])}</b><small>${esc(e[2])}</small></span></button></li>`).join('')}</ol></section>` : ''}
    <section class="bloc"><h3 class="bloc-titre">${k === 'vie' ? '🗂️ Les fiches pratiques' : '🗂️ Tous les espaces'}</h3>
      <div class="tuiles">${tuiles.map(o => `<button type="button" class="tuile" data-vue="${o.id}"><span class="e" aria-hidden="true">${o.e}</span><b>${esc(o.nom)}</b><small>${esc(o.d)}</small><span class="etat">${esc(etat(o))}</span></button>`).join('')}
        ${k === 'vie' ? '<div class="tuile bientot" aria-disabled="true"><span class="e" aria-hidden="true">＋</span><b>Bientôt d’autres fiches</b><small>La vie pratique s’agrandit petit à petit.</small></div>' : ''}</div>
    </section>
    ${k === 'finance' ? rappelRisque(false) : '<div class="note douce"><span class="e">🧭</span><div>Ces fiches donnent des repères généraux. Elles ne remplacent ni un avis médical, ni l’avis d’un professionnel (garagiste, électricien, service paie…). En cas d’urgence : <b>15</b> ou <b>112</b>.</div></div>'}`;
}
function carteObjectif() {
  const obj = PARCOURS.find(p => p.id === S.objectif.parcours), defi = defiSemaine(), defiFait = !!S.defis[semaineISO()];
  const cetteSemaine = Object.values(S.lecons).filter(x => joursEntre(x.date, auj()) < 7).length;
  return `<article class="carte large" style="margin-bottom:16px">
      <h3><span class="e">🎯</span>Mon objectif d’apprentissage <button class="btn petit fin plus" type="button" data-act="objectif">${obj ? 'Modifier' : 'Choisir'}</button></h3>
      <div class="objectif">
        <div>
          ${obj ? (() => { const pp = progressionParcours(obj); return `<b>${obj.e} ${esc(obj.nom)}</b><small>${pp.n}/${pp.total} leçons — ${pp.fini ? 'parcours terminé, attestation disponible 🎓' : esc(obj.desc)}</small>${prog(pp.pct, 'Progression du parcours')}`; })()
            : '<b>Pas encore d’objectif</b><small>Choisissez un parcours : la leçon du jour suivra votre chemin.</small>'}
          <small class="rythme">Rythme choisi : ${S.objectif.rythme} leçon${S.objectif.rythme > 1 ? 's' : ''} par semaine · cette semaine : ${cetteSemaine}</small>
          ${prog(Math.min(100, Math.round(cetteSemaine / S.objectif.rythme * 100)), 'Rythme de la semaine')}
        </div>
        <div class="defi ${defiFait ? 'fait' : ''}">
          <small>Défi de la semaine</small>
          <b>${defi.e} ${esc(defi.t)}</b>
          <p>${esc(defi.d)}</p>
          <button class="btn petit ${defiFait ? 'fin' : ''}" type="button" data-act="defi">${defiFait ? '✓ Défi relevé' : 'J’ai relevé ce défi'}</button>
        </div>
      </div>
    </article>`;
}

/* ---------- le chemin lumineux : 4 étapes, une étoile par leçon ---------- */
function vueChemin() {
  return `<section class="chemin" aria-label="Chemin de progression">
    <div class="chemin-titre"><h3>Mon chemin lumineux</h3><small>Chaque leçon réussie allume une étoile. Une étape s’ouvre quand la précédente est aux deux tiers.</small></div>
    <div class="etapes">
      ${NIVEAUX.map((N, i) => {
        const p = progressionNiveau(N.n), ouvert = niveauOuvert(N.n), fini = p.n === p.total;
        const ls = LECONS.filter(l => l.niv === N.n);
        return `<div class="etape ${ouvert ? 'ouverte' : 'fermee'} ${fini ? 'finie' : ''}" style="--i:${i}">
          <div class="medaille" aria-hidden="true">${ouvert ? N.e : '🔒'}</div>
          <b>${esc(N.nom)}</b><small>${p.n}/${p.total} étoiles</small>
          <div class="etoiles">${ls.map(l => `<button type="button" class="etoile-l ${acquise(l.id) ? 'allumee' : aRevoir(l.id) ? 'revoir' : ''}" data-lecon="${l.id}" title="${esc(l.titre)}${acquise(l.id) ? ' — acquise' : aRevoir(l.id) ? ' — à revoir' : ''}" aria-label="${esc(l.titre)}">★</button>`).join('')}</div>
        </div>`;
      }).join('<div class="lien-etape" aria-hidden="true"></div>')}
    </div>
  </section>`;
}

function ligneLecon(l, avecEsp) {
  const et = etatLecon(l.id);
  const statut = !et ? '<span class="badge">Nouvelle</span>' : acquise(l.id) && et.score >= SEUIL ? `<span class="badge ok">✓ ${et.meilleur}/100</span>` : `<span class="badge bientot">À revoir · ${et.score}/100</span>`;
  return `<button type="button" class="ligne cliquable" data-lecon="${l.id}">
    <span class="pic" aria-hidden="true">${l.e}</span>
    <span class="corps"><span class="t">${esc(l.titre)}</span>
      <span class="s">${avecEsp ? `<span>${ESPACES[l.esp].e} ${esc(ESPACES[l.esp].court)}</span>` : ''}<span>⏱ ${l.min} min</span><span>${esc(NIVEAUX[l.niv - 1].nom)}</span></span></span>
    <span class="fin-l">${statut}</span></button>`;
}

/* ============================================================
   Les espaces d'apprentissage
   ============================================================ */
const INTROS = {
  bases: 'Des cours courts pour y voir clair : revenus, dépenses, budget, épargne de précaution, découvert, crédit, inflation. Chaque leçon se termine par un quiz et des cas pratiques.',
  epargne: 'Les notions qui comptent avant tout placement — risque, rendement, horizon, liquidité, diversification, perte en capital — et les grands produits expliqués simplement. Aucun n’est « meilleur » qu’un autre : tout dépend de la situation de chacun.',
  bourse: 'Un parcours très progressif pour comprendre comment fonctionnent les marchés financiers. Tous les exemples sont fictifs : ils expliquent, ils n’invitent à acheter aucun actif réel.',
  impots: 'Un vrai petit cours, en huit chapitres : à quoi servent les impôts, comment se calcule l’impôt sur le revenu, le quotient familial, le prélèvement à la source, les réductions et crédits, l’imposition de l’épargne, les taxes du logement et la déclaration.',
  arnaques: 'Les arnaques financières promettent beaucoup, vite, et sans risque. Apprenez à reconnaître leurs ficelles, à vérifier, et à prendre le temps.'
};
function vueEspace(esp) {
  const E = ESPACES[esp], ls = LECONS.filter(l => l.esp === esp);
  const n = ls.filter(l => acquise(l.id)).length;
  let h = `${bandeauUnivers('finance')}<div class="section-titre"><h2>${E.e} ${esc(E.nom)}</h2><div class="droite"><span class="badge">${n}/${ls.length} leçons acquises</span></div></div>
    <p class="chapo">${esc(INTROS[esp])}</p>`;
  if (esp === 'epargne' || esp === 'bourse') h += rappelRisque(true);
  if (esp === 'bases') h += vueParcoursListe(['debute', 'budget', 'projet', 'epargne']);
  if (esp === 'arnaques') h += vueAntiArnaques();
  h += `<section class="bloc"><h3 class="bloc-titre">${esp === 'bourse' ? '🪜 Le parcours, pas à pas' : esp === 'arnaques' ? '📚 Les leçons et leurs quiz' : '📚 Les leçons'}</h3>
    <div class="${esp === 'bourse' ? 'escalier' : 'lignes'}">${ls.slice().sort((a, b) => a.niv - b.niv).map((l, i) => esp === 'bourse'
      ? `<div class="marche" style="--i:${i}"><span class="num">${i + 1}</span>${ligneLecon(l)}</div>` : ligneLecon(l)).join('')}</div></section>`;
  if (esp === 'epargne') h += `<div class="carte lien-guide"><h3><span class="e">🏦</span>Tous les produits, en détail</h3>
      <p class="vide">Livret A, LEP, PEL, assurance-vie, PEA, PER, épargne salariale, compte-titres, SCPI… : chaque produit a sa fiche complète dans le guide de l’épargne, avec un tableau comparatif.</p>
      <button class="btn" type="button" data-vue="guide">Ouvrir le guide de l’épargne →</button></div>` + vueParcoursListe(['investir', 'epargne']);
  if (esp === 'bourse') h += `<div class="carte" style="margin-top:16px"><h3><span class="e">📖</span>Un mot vous échappe ?</h3>
      <p class="vide">Le dictionnaire financier rassemble ${DICO.length} définitions simples, avec un exemple et les mots associés.</p>
      <button class="btn fin" type="button" data-vue="dico">Ouvrir le dictionnaire</button></div>` + vueParcoursListe(['bourse']);
  if (esp === 'arnaques') h += vueParcoursListe(['arnaques']);
  return h;
}
function vueParcoursListe(ids) {
  return `<section class="bloc"><h3 class="bloc-titre">🧭 Les parcours</h3><div class="parcours-grille">${ids.map(id => {
    const p = PARCOURS.find(x => x.id === id), pp = progressionParcours(p), actif = S.objectif.parcours === id;
    return `<div class="parcours ${pp.fini ? 'fini' : ''} ${actif ? 'actif' : ''}">
      <div class="tete"><span class="e">${p.e}</span><div><b>${esc(p.nom)}</b><small>${pp.n}/${pp.total} leçons · ${p.lecons.reduce((t, x) => t + lecon(x).min, 0)} min</small></div></div>
      <p>${esc(p.desc)}</p>${prog(pp.pct, p.nom)}
      <div class="bas">
        <button class="btn petit" type="button" data-parcours="${p.id}">${pp.n ? 'Continuer' : 'Commencer'}</button>
        ${actif ? '<span class="badge ok">🎯 Mon objectif</span>' : `<button class="btn petit fin" type="button" data-objectif="${p.id}">🎯 En faire mon objectif</button>`}
        ${pp.fini ? `<button class="btn petit fin" type="button" data-attestation="${p.id}">🎓 Attestation</button>` : ''}
      </div></div>`;
  }).join('')}</div></section>`;
}

/* ---------- anti-arnaques ---------- */
function vueAntiArnaques() {
  const nCoche = CHECKLIST.filter((_, i) => S.checklist[i]).length;
  return `<section class="bloc"><h3 class="bloc-titre">🚨 Les signaux d’alerte</h3>
    <div class="signaux">${SIGNAUX.map((s, i) => `<div class="signal" style="--i:${i}"><span class="e">${s.e}</span><b>${esc(s.t)}</b><small>${esc(s.d)}</small></div>`).join('')}</div></section>
  <div class="grille">
    <article class="carte">
      <h3><span class="e">✅</span>Avant de placer mon argent <span class="badge plus">${nCoche}/${CHECKLIST.length}</span></h3>
      <div class="checklist">${CHECKLIST.map((t, i) => `<label class="check ${S.checklist[i] ? 'fait' : ''}"><input type="checkbox" data-check="${i}" ${S.checklist[i] ? 'checked' : ''}><span class="lib">${esc(t)}</span></label>`).join('')}</div>
      <p class="petit-texte">Une seule case non cochée ? Prenez le temps. Personne n’a jamais regretté d’avoir attendu une semaine de plus pour vérifier.</p>
      ${nCoche ? '<button class="lien-discret" type="button" data-act="checklist-vider">Décocher tout (pour un autre projet)</button>' : ''}
    </article>
    <article class="carte verifier">
      <h3><span class="e">🔍</span>À vérifier avant toute décision</h3>
      <div class="lignes">${A_VERIFIER.map(v => `<div class="ligne compacte"><span class="pic">${v.e}</span><span class="corps"><span class="t" style="white-space:normal">${esc(v.t)}</span><span class="s">${esc(v.d)}</span></span></div>`).join('')}</div>
      <div class="note sure" style="margin:12px 0 0"><span class="e">☎️</span><div><b>Besoin d’aide ?</b> AMF Épargne Info Service : 01 53 45 62 00 · Info Escroqueries : 0 805 805 817 (appel gratuit). Numéros à revérifier sur les sites officiels. Victime ? Prévenez votre banque au plus vite et portez plainte.</div></div>
    </article>
  </div>
  <div class="note douce"><span class="e">🐢</span><div><b>Le meilleur réflexe, c’est le temps.</b> Prenez-le, comparez des sources fiables, et ne placez jamais d’argent dans un produit que vous ne comprenez pas.</div></div>`;
}

/* ============================================================
   Une leçon, puis son quiz
   ============================================================ */
function vueLecon(l) {
  const et = etatLecon(l.id), E = ESPACES[l.esp];
  const q = U.quiz && U.quiz.id === l.id ? U.quiz : null;
  const idx = LECONS.filter(x => x.esp === l.esp), i = idx.indexOf(l), suiv = idx[i + 1];
  return `<nav class="fil"><button class="lien-discret" type="button" data-act="retour">← ${esc(E.nom)}</button></nav>
  <article class="lecon">
    <header class="lecon-tete">
      <span class="gros-e" aria-hidden="true">${l.e}</span>
      <div><div class="meta"><span class="badge">${E.e} ${esc(E.court)}</span><span class="badge">⏱ ${l.min} min</span><span class="badge">${NIVEAUX[l.niv - 1].e} ${esc(NIVEAUX[l.niv - 1].nom)}</span>${et ? `<span class="badge ${acquise(l.id) ? 'ok' : 'bientot'}">Meilleure note : ${et.meilleur}/100</span>` : ''}</div>
        <h2>${esc(l.titre)}</h2><p class="intro">${esc(l.intro)}</p></div>
    </header>
    ${q ? '' : `<div class="sections">${l.sections.map((s, k) => `<section class="sec" style="--i:${k}"><span class="k">${k + 1}</span><div><h3>${esc(s.h)}</h3><p>${s.p}</p></div></section>`).join('')}</div>
    <div class="exemple"><span class="e">💡</span><div><b>Exemple</b><p>${esc(l.exemple)}</p></div></div>
    <div class="retenir"><b>À retenir</b><ul>${l.retenir.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
    ${l.esp !== 'bases' ? rappelRisque(true) : ''}
    <div class="lecon-bas"><button class="btn gros" type="button" data-act="quiz-lecon" data-id="${l.id}">✏️ Passer le quiz (${l.quiz.length} questions)</button>
      ${suiv ? `<button class="btn fin" type="button" data-lecon="${suiv.id}">Leçon suivante : ${esc(suiv.titre)} →</button>` : ''}</div>`}
    ${q ? vueQuiz(l.quiz, q, `data-quiz-lecon="${l.id}"`) : ''}
  </article>`;
}
function vueQuiz(questions, q, attr) {
  const res = q.resultat;
  return `<form class="quiz" ${attr} novalidate>
    <div class="quiz-tete"><h3>✏️ Quiz${q.titre ? ' — ' + esc(q.titre) : ''}</h3><small>${res ? 'Corrigé' : 'Prenez votre temps : aucune limite de durée.'}</small></div>
    ${questions.map((qu, i) => {
      const d = res && res.det[i];
      return `<fieldset class="question ${d ? (d.juste ? 'juste' : 'faux') : ''}"><legend><span class="k">${i + 1}</span>${esc(qu.q)}</legend>
      ${qu.n !== undefined
        ? `<div class="reponse-n"><input type="text" inputmode="decimal" name="r${i}" value="${esc(q.rep[i] || '')}" ${res ? 'disabled' : ''} aria-label="Votre réponse" autocomplete="off"><span>${esc(qu.u || '')}</span></div>`
        : `<div class="choix-q">${qu.c.map((c, k) => `<label class="${res ? (k === qu.b ? 'bonne' : (+q.rep[i] === k ? 'mauvaise' : '')) : ''}"><input type="radio" name="r${i}" value="${k}" ${String(q.rep[i]) === String(k) ? 'checked' : ''} ${res ? 'disabled' : ''}><span>${esc(c)}</span></label>`).join('')}</div>`}
      ${d ? `<div class="explication">${d.juste ? '✓ Juste. ' : `✗ ${qu.n !== undefined ? `La réponse attendue : <b>${nb(qu.n, Number.isInteger(qu.n) ? 0 : 2)} ${esc(qu.u || '')}</b>. ` : ''}`}${esc(qu.x)}</div>` : ''}
      </fieldset>`;
    }).join('')}
    ${res ? `<div class="resultat ${res.score >= SEUIL ? 'reussi' : ''}">
        <div class="note-100"><b>${res.score}</b><small>/100</small></div>
        <div><p>${esc(messageNote(res.score))}</p>
          <div class="bas"><button class="btn" type="button" data-act="refaire">↻ Refaire le quiz</button>
          ${attr.includes('lecon') ? '<button class="btn fin" type="button" data-act="relire">Relire la leçon</button>' : ''}
          <button class="btn fin" type="button" data-act="retour">Terminer</button></div></div>
      </div>`
      : `<div class="bas"><button class="btn gros" type="submit">Valider mes réponses</button><button class="btn fin" type="button" data-act="${attr.includes('lecon') ? 'relire' : 'retour'}">${attr.includes('lecon') ? 'Relire la leçon' : 'Annuler'}</button></div>`}
  </form>`;
}
/* un quiz mélangé : des questions tirées des leçons (d'abord celles à revoir) */
function vueQuizMix() {
  return `<nav class="fil"><button class="lien-discret" type="button" data-act="retour">← Retour</button></nav>
    <article class="lecon"><header class="lecon-tete"><span class="gros-e">🎲</span><div><h2>Quiz mélangé</h2>
    <p class="intro">${U.mix.questions.length} questions tirées de plusieurs leçons${U.mix.revoir ? ', en commençant par les notions à revoir' : ''}.</p></div></header>
    ${vueQuiz(U.mix.questions, U.mix, 'data-quiz-mix="1"')}</article>`;
}

/* ============================================================
   Le portefeuille fictif
   ============================================================ */
function barreRepartition(parts) {
  const tot = valeurSim(parts) || 1;
  return `<div class="barre-rep" role="img" aria-label="Répartition du portefeuille fictif">${ACTIFS.filter(a => parts[a.id] > 0.5).map(a => `<i style="width:${(parts[a.id] / tot * 100).toFixed(2)}%;background:${a.c}" title="${esc(a.court)} : ${nb(parts[a.id] / tot * 100, 0)} %"></i>`).join('')}</div>`;
}
function courbe(vals, reels, etapes) {
  const W = 640, H = 220, g = 44, d = 14, hb = 26;
  const tous = vals.concat(reels, [DEPART]), mn = Math.min(...tous) * .96, mx = Math.max(...tous) * 1.04;
  const x = i => g + (vals.length < 2 ? 0 : i * (W - g - d) / (vals.length - 1)), y = v => d + (H - d - hb) * (1 - (v - mn) / (mx - mn || 1));
  const ligne = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const graduations = [mn, (mn + mx) / 2, mx].map(v => `<text x="${g - 6}" y="${y(v) + 4}" text-anchor="end">${nb(Math.round(v / 100) * 100)}</text><line x1="${g}" x2="${W - d}" y1="${y(v)}" y2="${y(v)}" class="grille-l"/>`).join('');
  const pas = Math.max(1, Math.ceil(vals.length / 10));
  const axeX = vals.map((_, i) => i % pas === 0 || i === vals.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${i === 0 ? 'Départ' : i}</text>` : '').join('');
  const marques = etapes.map((e, i) => e.sc ? `<text x="${x(i + 1)}" y="${y(vals[i + 1]) - 10}" text-anchor="middle" class="sc-ic">${SCENARIOS.find(s => s.id === e.sc).e}</text>` : '').join('');
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution simulée du portefeuille fictif, de ${nb(Math.round(vals[0]))} à ${nb(Math.round(vals[vals.length - 1]))} NaoCoins">
    ${graduations}<line x1="${g}" x2="${W - d}" y1="${y(DEPART)}" y2="${y(DEPART)}" class="depart-l"/>
    <path d="${ligne(vals)}V${H - hb}H${g}Z" class="aire"/>
    <path d="${ligne(reels)}" class="reel-l"/><path d="${ligne(vals)}" class="valeur-l"/>
    ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.2" class="pt"><title>${i ? 'Étape ' + i : 'Départ'} : ${nb(Math.round(v))} NaoCoins</title></circle>`).join('')}
    ${marques}${axeX}</svg>
    <div class="legende"><span><i class="l-valeur"></i>Valeur simulée</span><span><i class="l-reel"></i>Valeur corrigée de l’inflation</span><span><i class="l-depart"></i>Mise de départ (${nb(DEPART)})</span></div>`;
}
function vuePortefeuille() {
  const sim = S.sim, e = etatSim();
  let h = `${bandeauUnivers('finance')}<div class="section-titre"><h2>🎮 Mon portefeuille fictif</h2></div>
    <div class="bandeau-sim" role="note"><span>🎓</span><b>Simulation pédagogique — aucun argent réel</b><span class="sep">·</span><span>Tout est inventé : les NaoCoins, les supports, les chiffres. Aucun ordre n’est passé, nulle part.</span></div>`;
  if (!e) {
    h += `<p class="chapo">Vous disposez de <b>${nb(DEPART)} NaoCoins</b> virtuels. Répartissez-les entre six supports imaginaires, puis faites passer le temps et traversez des scénarios pour observer ce que deviennent la diversification, la volatilité et l’horizon.</p>
      ${formRepartition(sim.rep || REPARTITIONS_TYPES[1].r)}
      <div class="grille" style="margin-top:16px">${ACTIFS.map(a => `<div class="carte actif-carte" style="--c:${a.c}"><h3><span class="e">${a.e}</span>${esc(a.nom)}</h3><p class="vide">${esc(a.vol)}.</p></div>`).join('')}</div>`;
  } else {
    const st = statsSim(sim), reels = [DEPART].concat(sim.etapes.map(x => valeurSim(x.parts) / x.prix));
    h += `<div class="chiffres grand">
        <div class="chiffre"><small>Valeur simulée</small><b>${nb(Math.round(st.fin))}</b><small>NaoCoins</small></div>
        <div class="chiffre"><small>Depuis le départ</small><b class="${st.delta >= 0 ? 'hausse' : 'baisse'}">${pct(st.delta)}</b><small>${sim.etapes.length} étape${sim.etapes.length > 1 ? 's' : ''}</small></div>
        <div class="chiffre"><small>Corrigée de l’inflation</small><b>${nb(Math.round(st.reel))}</b><small>NaoCoins d’aujourd’hui</small></div>
        <div class="chiffre"><small>Plus forte baisse traversée</small><b class="${st.pire < 0 ? 'baisse' : ''}">${pct(st.pire)}</b><small>depuis un sommet</small></div>
      </div>
      <div class="grille grille-sim">
        <article class="carte large"><h3><span class="e">📉📈</span>Évolution simulée</h3>
          ${sim.etapes.length ? courbe(st.vals, reels, sim.etapes) : '<p class="vide">Faites passer le temps ou choisissez un scénario : la courbe se dessinera ici.</p>'}
          <p class="petit-texte">Ces chiffres sont produits par un modèle volontairement simplifié. Ils ne décrivent aucun marché réel et ne permettent aucune prévision. Recommencez la même répartition : vous obtiendrez un autre chemin.</p>
        </article>
        <article class="carte"><h3><span class="e">⏭️</span>Faire passer le temps</h3>
          <div class="boutons-sim"><button class="btn" type="button" data-sim="1">🎲 Une année au hasard</button><button class="btn fin" type="button" data-sim="5">🎲 Cinq années</button></div>
          <h3 style="margin-top:16px"><span class="e">🌦️</span>Traverser un scénario</h3>
          <div class="scenarios">${SCENARIOS.map(s => `<button type="button" class="scenario" data-scenario="${s.id}"><span>${s.e}</span>${esc(s.nom)}</button>`).join('')}</div>
        </article>
        <article class="carte"><h3><span class="e">🧺</span>Ma répartition</h3>
          ${barreRepartition(e.parts)}
          <div class="lignes rep-lignes">${ACTIFS.map(a => { const v = e.parts[a.id], d0 = DEPART * (sim.rep[a.id] || 0) / 100; return d0 > 0 ? `<div class="ligne compacte"><span class="pic" style="background:color-mix(in srgb, ${a.c} 30%, transparent)">${a.e}</span><span class="corps"><span class="t">${esc(a.court)}</span><span class="s">${nb(sim.rep[a.id])} % au départ · ${esc(a.vol)}</span></span><span class="fin-l"><b>${nb(Math.round(v))}</b><span class="badge ${v >= d0 ? 'ok' : 'passe'}">${pct((v / d0 - 1) * 100)}</span></span></div>` : ''; }).join('')}</div>
          <p class="petit-texte">Pour changer la répartition, on recommence une simulation : c’est ce qui permet de comparer des choix entre eux.</p>
        </article>
      </div>`;
    h += `<article class="carte" style="margin-top:16px"><h3><span class="e">📓</span>Mon journal de simulation</h3>
      <form class="journal-form" id="journalForm"><input type="text" id="journalTexte" maxlength="400" placeholder="Ce que j’ai appris… (ex. : « la crise sectorielle a surtout touché l’action »)" aria-label="Ce que j’ai appris"><button class="btn" type="submit">Noter</button></form>
      <div class="journal">${sim.journal.slice().reverse().map(j => `<div class="entree ${j.auto ? 'auto' : 'moi'}"><small>${j.auto ? `Étape ${j.etape}` : '✍️ Ce que j’ai appris'} · ${esc(dateLongue(j.date))}</small><p>${esc(j.texte)}</p>${j.auto ? '' : `<button class="ico-btn" type="button" data-journal-suppr="${j.id}" title="Supprimer cette note" aria-label="Supprimer cette note">✕</button>`}</div>`).join('') || '<p class="vide">Chaque étape ajoutera ici une explication. Ajoutez vos propres observations : c’est ce qui fait apprendre.</p>'}</div>
    </article>
    <div class="bas-sim"><button class="btn gros" type="button" data-act="sim-recommencer">↻ Recommencer une simulation</button><small>La simulation actuelle sera gardée dans « Comparer mes choix ».</small></div>`;
  }
  h += vueComparaison();
  h += rappelRisque(false);
  return h;
}
function formRepartition(rep) {
  return `<form class="carte repartition-form" id="repForm">
    <h3><span class="e">🧺</span>Ma répartition de départ</h3>
    <div class="types">${REPARTITIONS_TYPES.map((t, i) => `<button type="button" class="puce" data-type-rep="${i}">${esc(t.nom)}</button>`).join('')}<small>Des exemples pour expérimenter, pas des modèles à suivre.</small></div>
    ${ACTIFS.map(a => `<div class="curseur" style="--c:${a.c}"><label for="rep-${a.id}"><span>${a.e} ${esc(a.nom)}</span><small>${esc(a.vol)}</small></label>
      <input type="range" id="rep-${a.id}" name="${a.id}" min="0" max="100" step="5" value="${rep[a.id] || 0}"><output for="rep-${a.id}">${rep[a.id] || 0} %</output></div>`).join('')}
    <div class="total-rep" id="totalRep"></div>
    <div class="bas"><button class="btn gros" type="submit" id="repValider">✦ Démarrer la simulation</button></div>
  </form>`;
}
function vueComparaison() {
  const liste = S.simArchives.slice().reverse();
  if (!liste.length) return '';
  return `<article class="carte" style="margin-top:16px"><h3><span class="e">⚖️</span>Comparer mes choix</h3>
    <p class="petit-texte" style="margin-top:0">Comparer n’est pas désigner un gagnant : chaque résultat dépend des scénarios traversés et du hasard du modèle. Regardez plutôt comment chaque répartition a réagi aux mêmes types d’événements.</p>
    <div class="tableau-defile"><table class="tableau"><thead><tr><th>Simulation</th><th>Répartition de départ</th><th>Étapes</th><th>Scénarios</th><th>Valeur finale</th><th>Plus forte baisse</th><th></th></tr></thead>
    <tbody>${liste.map(a => `<tr><td>${esc(a.nom)}<br><small>${esc(dateLongue(a.date))}</small></td>
      <td>${ACTIFS.filter(x => a.rep[x.id]).map(x => `<span class="mini-rep" style="--c:${x.c}">${x.e} ${a.rep[x.id]} %</span>`).join(' ')}</td>
      <td>${a.etapes}</td><td>${a.scenarios.map(s => (SCENARIOS.find(x => x.id === s) || {}).e || '').join(' ') || '—'}</td>
      <td><b>${nb(Math.round(a.fin))}</b> <span class="badge ${a.fin >= DEPART ? 'ok' : 'passe'}">${pct((a.fin / DEPART - 1) * 100)}</span></td>
      <td>${pct(a.pire)}</td><td><button class="ico-btn" type="button" data-archive-suppr="${a.id}" title="Retirer de la comparaison" aria-label="Retirer">✕</button></td></tr>`).join('')}</tbody></table></div>
  </article>`;
}

/* ============================================================
   Les actualités à comprendre
   ============================================================ */
const catActu = id => CATEGORIES_ACTU.find(c => c.id === id) || { nom: id, e: '📰' };
const couper = (t, n) => t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
const toutesActus = () => ACTUS.map(a => Object.assign({ fiable: true, nao: true }, a)).concat(S.actusPerso)
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const actus2min = () => toutesActus().filter(a => a.fiable).slice(0, 3);
function carteActu(a) {
  const fav = S.favoris.includes(a.id), c = catActu(a.cat);
  return `<article class="actu ${a.fiable ? '' : 'non-verifiee'}">
    <div class="meta"><span class="badge">${c.e} ${esc(c.nom)}</span><span class="badge">📅 ${esc(dateLongue(a.date))}</span>
      ${a.fiable ? '' : '<span class="badge passe">⚠️ Non vérifié</span>'}${a.nao ? '' : '<span class="badge bleu">Ajoutée par moi</span>'}
      <button class="fav ${fav ? 'on' : ''}" type="button" data-fav="${a.id}" aria-pressed="${fav}" title="${fav ? 'Retirer des favoris' : 'Mettre en favori'}" aria-label="Favori">${fav ? '★' : '☆'}</button></div>
    <h3>${esc(a.titre)}</h3>
    <p>${esc(a.resume)}</p>
    ${a.mots && a.mots.length ? `<details class="mots"><summary>📖 Les mots difficiles (${a.mots.length})</summary><dl>${a.mots.map(m => `<dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd>`).join('')}</dl></details>` : ''}
    ${a.pourquoi ? `<div class="pourquoi"><b>Pourquoi cette actualité peut compter ?</b><p>${esc(a.pourquoi)}</p></div>` : ''}
    <div class="src">Source : ${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.source)}</a>` : esc(a.source || 'non renseignée')}
      ${a.nao ? ` · fiche rédigée en ${esc(dateLongue(REDACTION))} — la situation a pu évoluer depuis, vérifiez la source.` : ''}
      ${a.nao ? '' : ` · <button class="lien-discret" type="button" data-actu-suppr="${a.id}">Supprimer</button>`}</div>
  </article>`;
}
function vueActus() {
  const toutes = toutesActus();
  let liste = U.vueActu === 'favoris' ? toutes.filter(a => S.favoris.includes(a.id)) : toutes;
  if (U.cat) liste = liste.filter(a => a.cat === U.cat);
  const deux = U.vueActu === '2min';
  return `${bandeauUnivers('finance')}<div class="section-titre"><h2>📰 Actualités à comprendre</h2><div class="droite"><button class="btn petit fin" type="button" data-act="actu-ajouter">＋ Ajouter une actualité lue</button></div></div>
    <p class="chapo">Des repères économiques et financiers réels, datés et sourcés, expliqués simplement — avec les mots difficiles et ce qu’ils peuvent changer. Jamais de conseil d’achat ou de vente.</p>
    <div class="note douce"><span class="e">📡</span><div>NaoInvest fonctionne sans connexion : il ne reçoit pas les nouvelles du jour. Les fiches ci-dessous sont des <b>événements passés</b>, choisis parce qu’ils sont vérifiables. Pour l’actualité récente, ajoutez un article lu sur une source fiable : il sera classé ici, avec sa date et sa source.</div></div>
    <div class="sous-onglets">
      <button class="puce ${U.vueActu === 'toutes' ? 'actif' : ''}" type="button" data-vue-actu="toutes">Toutes</button>
      <button class="puce ${deux ? 'actif' : ''}" type="button" data-vue-actu="2min">⏱️ L’actualité en 2 minutes</button>
      <button class="puce ${U.vueActu === 'favoris' ? 'actif' : ''}" type="button" data-vue-actu="favoris">★ Mes favoris <span class="n">${S.favoris.length}</span></button>
    </div>
    ${deux ? `<div class="deux-min">${actus2min().map((a, i) => `<div class="dm" style="--i:${i}"><span class="k">${i + 1}</span><div><div class="meta"><span class="badge">${catActu(a.cat).e} ${esc(catActu(a.cat).nom)}</span><span class="badge">📅 ${esc(dateLongue(a.date))}</span></div><b>${esc(a.titre)}</b><p>${esc(couper(a.resume, 170))}</p><small>👉 ${esc(couper(a.pourquoi || '', 150))}</small><small class="src">Source : ${esc(a.source)}</small></div></div>`).join('')}
      <p class="petit-texte">Trois repères, trois minutes à peine. Seules les sources fiables apparaissent ici ; les actualités « non vérifiées » en sont exclues.</p></div>`
    : `<div class="puces" style="margin-bottom:14px"><button class="puce ${!U.cat ? 'actif' : ''}" type="button" data-cat="">Toutes les catégories</button>${CATEGORIES_ACTU.map(c => { const n = toutes.filter(a => a.cat === c.id).length; return `<button class="puce ${U.cat === c.id ? 'actif' : ''}" type="button" data-cat="${c.id}">${c.e} ${esc(c.nom)} <span class="n">${n}</span></button>`; }).join('')}</div>
      <div class="actus">${liste.map(carteActu).join('') || `<p class="calme-vide"><span class="e">🗞️</span>${U.vueActu === 'favoris' ? 'Aucun favori ici. Touchez ☆ sur une actualité pour la retrouver ici.' : 'Aucune fiche dans cette catégorie pour l’instant : ajoutez une actualité lue sur une source fiable.'}</p>`}</div>`}
    <div class="note"><span class="e">🧐</span><div><b>Rumeurs, influenceurs, forums :</b> une information qui n’a ni source identifiée, ni date, ni auteur n’est pas une information fiable. Si vous en ajoutez une, NaoInvest la marque « non vérifiée » et ne la montre jamais comme une information sûre.</div></div>`;
}

/* ============================================================
   Ma progression : notions, badges, attestations
   ============================================================ */
function vueProgression() {
  const niv = niveauActuel(), rev = aRevoirAujourdhui();
  const acq = faites(), ratees = rev.ratees, jamais = LECONS.filter(l => !etatLecon(l.id));
  return `<div class="section-titre"><h2>⭐ Ma progression</h2><div class="droite"><button class="btn petit fin" type="button" data-act="prenom">✍️ ${S.prenom ? esc(S.prenom) : 'Mon prénom'}</button></div></div>
    <p class="chapo">Vous êtes à l’étape <b>« ${esc(niv.nom)} »</b> — ${esc(niv.desc)}</p>
    ${carteObjectif()}
    ${vueChemin()}
    <div class="grille">
      <article class="carte"><h3><span class="e">✅</span>Notions acquises <span class="badge ok plus">${acq.length}</span></h3>
        ${acq.length ? `<div class="lignes">${acq.map(l => ligneLecon(l, true)).join('')}</div>` : '<p class="vide">Réussissez un quiz avec au moins 70/100 : la notion apparaîtra ici.</p>'}</article>
      <article class="carte"><h3><span class="e">🔁</span>Notions à revoir · quiz à refaire <span class="badge bientot plus">${ratees.length}</span></h3>
        ${ratees.length ? `<div class="lignes">${ratees.map(l => ligneLecon(l, true)).join('')}</div>` : '<p class="vide">Aucun quiz à refaire. 🌿</p>'}
        ${rev.anciennes.length ? `<h3 style="margin-top:16px"><span class="e">🕰️</span>À rafraîchir (acquises il y a plus de 2 semaines)</h3><div class="lignes">${rev.anciennes.slice(0, 5).map(l => ligneLecon(l, true)).join('')}</div>` : ''}</article>
      <article class="carte large"><h3><span class="e">🌱</span>Pas encore découvertes <span class="badge plus">${jamais.length}</span></h3>
        ${jamais.length ? `<div class="lignes deux-col">${jamais.map(l => ligneLecon(l, true)).join('')}</div>` : '<p class="vide">Vous avez ouvert toutes les leçons. Bravo !</p>'}</article>
    </div>
    <section class="bloc"><h3 class="bloc-titre">🏅 Mes badges</h3>
      <div class="badges">${BADGES.map(b => { const ok = !!S.badges[b.id]; return `<div class="medaillon ${ok ? 'obtenu' : ''}"><span class="rond">${ok ? b.e : '🔒'}</span><b>${esc(b.nom)}</b><small>${ok ? `Obtenu le ${esc(dateLongue(S.badges[b.id]))}` : esc(b.desc)}</small></div>`; }).join('')}</div></section>
    <section class="bloc"><h3 class="bloc-titre">🎓 Mes attestations de parcours</h3>
      <div class="parcours-grille">${PARCOURS.map(p => { const pp = progressionParcours(p); return `<div class="parcours ${pp.fini ? 'fini' : ''}"><div class="tete"><span class="e">${p.e}</span><div><b>${esc(p.nom)}</b><small>${pp.n}/${pp.total} leçons</small></div></div>${prog(pp.pct, p.nom)}
        <div class="bas">${pp.fini ? `<button class="btn petit" type="button" data-attestation="${p.id}">🎓 Voir l’attestation</button>` : `<button class="btn petit fin" type="button" data-parcours="${p.id}">Continuer</button>`}</div></div>`; }).join('')}</div>
      <p class="petit-texte">Une attestation de parcours NaoInvest n’est ni un diplôme, ni une certification financière officielle, ni un conseil en investissement.</p></section>`;
}
function attestation(id) {
  const p = PARCOURS.find(x => x.id === id), d = S.attestations[id] || auj();
  const moy = Math.round(p.lecons.reduce((t, l) => t + (etatLecon(l) ? etatLecon(l).meilleur : 0), 0) / p.lecons.length);
  ouvrirModale(`<div class="attestation" id="attestation">
      <div class="att-cadre">
        ${jeton('att-jeton')}
        <small class="att-sur">Attestation de parcours</small>
        <h2>Nao<span>Invest</span></h2>
        <p class="att-texte">NaoInvest atteste que</p>
        <p class="att-nom">${S.prenom ? esc(S.prenom) : '<button type="button" class="lien-discret" data-act="prenom">✍️ Ajouter mon prénom</button>'}</p>
        <p class="att-texte">a terminé le parcours</p>
        <p class="att-parcours">${p.e} ${esc(p.nom)}</p>
        <p class="att-detail">${p.lecons.length} leçons réussies · note moyenne ${moy}/100 · le ${esc(dateLongue(d))}</p>
        <ul class="att-lecons">${p.lecons.map(l => `<li>${esc(lecon(l).titre)}</li>`).join('')}</ul>
        <p class="att-mention">Ce document est une attestation interne de parcours NaoInvest. Ce n’est <b>ni un diplôme, ni une certification financière officielle, ni un conseil en investissement</b>.</p>
      </div>
    </div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button><button type="button" class="btn" data-f="imprimer">🖨️ Imprimer ou enregistrer en PDF</button></div></div>`, f => {
    $('[data-f="imprimer"]', f).addEventListener('click', () => { document.documentElement.classList.add('impression-att'); print(); document.documentElement.classList.remove('impression-att'); });
  }, true);
}

/* ============================================================
   Le dictionnaire
   ============================================================ */
function vueDico() {
  const q = Nao_sansAccent(U.q);
  const lettres = [...new Set(DICO.map(d => Nao_sansAccent(d.m)[0].toUpperCase()))].sort();
  const liste = DICO.slice().sort((a, b) => a.m.localeCompare(b.m, 'fr'))
    .filter(d => (!q || Nao_sansAccent(d.m + ' ' + d.d).includes(q)) && (!U.lettre || Nao_sansAccent(d.m)[0].toUpperCase() === U.lettre));
  return `<div class="section-titre"><h2>📖 Dictionnaire financier</h2><div class="droite"><span class="badge">${DICO.length} mots</span></div></div>
    <p class="chapo">Des définitions simples, un exemple concret, et les mots associés pour aller plus loin.</p>
    <div class="recherche"><input type="search" id="dicoQ" value="${esc(U.q)}" placeholder="Chercher un mot : inflation, ETF, agios…" aria-label="Chercher dans le dictionnaire"></div>
    <div class="alphabet"><button type="button" class="puce ${!U.lettre ? 'actif' : ''}" data-lettre="">Tout</button>${lettres.map(l => `<button type="button" class="puce ${U.lettre === l ? 'actif' : ''}" data-lettre="${l}">${l}</button>`).join('')}</div>
    <div class="dico">${liste.map(d => `<article class="mot" id="mot-${Nao_sansAccent(d.m).replace(/[^a-z]/g, '')}"><h3>${esc(d.m)}</h3><p>${esc(d.d)}</p><p class="ex"><b>Exemple :</b> ${esc(d.ex)}</p>
      ${d.a.length ? `<div class="assoc"><small>Mots associés :</small>${d.a.map(a => `<button type="button" class="puce petite" data-mot="${esc(a)}">${esc(a)}</button>`).join('')}</div>` : ''}</article>`).join('') || '<p class="calme-vide"><span class="e">🔎</span>Aucun mot ne correspond. Essayez un autre terme.</p>'}</div>`;
}
function Nao_sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function defiSemaine() { return DEFIS[hachage(semaineISO()) % DEFIS.length]; }
