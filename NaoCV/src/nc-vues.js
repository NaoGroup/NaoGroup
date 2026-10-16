/* ============================================================
   NaoCV — les écrans.
   ============================================================ */
'use strict';

NC.UI = { vue: 'accueil', cvId: '', etape: 'coord', lettreId: '', calMois: '', filtre: '', mobileApercu: false };
const cvCourant = () => NC.cvParId(NC.UI.cvId) || NC.cvPrincipal();
const lettreCourante = () => NC.lettreParId(NC.UI.lettreId) || NC.ETAT.lettres[0] || null;
NC.cvCourant = cvCourant; NC.lettreCourante = lettreCourante;

NC.ONGLETS = [
  ['accueil', '🏠', 'Accueil'], ['cv', '📝', 'Mon CV'], ['versions', '🗂️', 'Mes versions'], ['offre', '🎯', 'Adapter à une offre'],
  ['lettres', '✉️', 'Lettres'], ['candidatures', '📋', 'Candidatures'], ['calendrier', '📅', 'Entretiens & relances'], ['prets', '✅', 'Prêt à envoyer']
];
NC.ETAPES = [
  ['coord', 'Coordonnées', '👤'], ['poste', 'Poste & accroche', '🎯'], ['exp', 'Expériences', '💼'], ['form', 'Formation', '🎓'],
  ['comp', 'Compétences', '🧩'], ['lang', 'Langues & certifications', '🌍'], ['plus', 'Projets & intérêts', '✨'], ['infos', 'Infos pratiques', '🚗'],
  ['style', 'Style & couleurs', '🎨'], ['verif', 'Vérifier & exporter', '✅']
];
NC.STATUTS = [
  ['preparer', 'À préparer', '#8C8FA3'], ['envoyee', 'Candidature envoyée', '#5B7BD5'], ['relance', 'Relance à faire', '#D98E2B'],
  ['entretien', 'Entretien prévu', '#8E6BE0'], ['attente', 'En attente de réponse', '#3C9BB0'], ['positive', 'Réponse positive', '#2F8F63'],
  ['negative', 'Réponse négative', '#C24B63'], ['archivee', 'Candidature archivée', '#7A7A8C']
];
const statut = id => NC.STATUTS.find(s => s[0] === id) || NC.STATUTS[0];
const FINIS = ['positive', 'negative', 'archivee'];

/* ---------- Petites briques de formulaire ---------- */
function champ(label, chemin, val, o) {
  o = o || {};
  const commun = `data-c="${chemin}"${o.id ? ` id="${o.id}"` : ''}`;
  let saisie;
  if (o.zone) saisie = `<textarea ${commun} rows="${o.rows || 4}" spellcheck="true" lang="fr" placeholder="${esc(o.ph || '')}">${esc(val)}</textarea>`;
  else if (o.select) saisie = `<select ${commun}>${o.select.map(x => { const v = Array.isArray(x) ? x[0] : x, t = Array.isArray(x) ? x[1] : x; return `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(t)}</option>`; }).join('')}</select>`;
  else saisie = `<input ${commun} type="${o.type || 'text'}" value="${esc(val)}" placeholder="${esc(o.ph || '')}"${o.liste ? ` list="${o.liste}"` : ''} spellcheck="${o.type ? 'false' : 'true'}" lang="fr" autocomplete="off">`;
  return `<label class="champ ${o.cls || ''}"><span>${label}${o.req ? ' <i class="req">*</i>' : ''}${o.facult ? ' <i class="fac">facultatif</i>' : ''}</span>${saisie}${o.aide ? `<small>${o.aide}</small>` : ''}</label>`;
}
const coche = (label, chemin, val, cls) => `<label class="coche ${cls || ''}"><input type="checkbox" data-c="${chemin}"${val ? ' checked' : ''}><span class="case"></span><span>${label}</span></label>`;
const vide = (emoji, titre, texte, bouton) => `<div class="vide"><div class="vide-em">${emoji}</div><b>${titre}</b><p>${texte}</p>${bouton || ''}</div>`;
function vignette(cv, largeur, ats) {
  const k = largeur / 793.7;
  return `<div class="vignette" style="width:${largeur}px;height:${Math.round(largeur * 1.4142)}px" aria-hidden="true"><div class="vignette-in" style="transform:scale(${k})">${NC.rendreCV(cv, ats)}</div></div>`;
}
const pastilleCouleur = c => `<i class="rond" style="background:${esc(c)}"></i>`;

/* ---------- État des étapes ---------- */
function etatEtape(cv, id) {
  const P = cv.perso;
  switch (id) {
    case 'coord': return P.prenom && P.nom && P.tel && P.email ? 'ok' : (P.prenom || P.nom || P.tel || P.email ? 'part' : '');
    case 'poste': return cv.titre && cv.accroche ? 'ok' : (cv.titre || cv.accroche ? 'part' : '');
    case 'exp': return cv.experiences.some(x => x.missions.filter(Boolean).length) ? 'ok' : (cv.experiences.length ? 'part' : '');
    case 'form': return cv.formations.length ? 'ok' : '';
    case 'comp': { const n = cv.compTech.length + cv.compRel.length + cv.logiciels.length; return n >= 4 ? 'ok' : n ? 'part' : ''; }
    case 'lang': return cv.langues.length ? 'ok' : '';
    case 'plus': return cv.projets.length || cv.interets.length ? 'ok' : 'fac';
    case 'infos': return P.permis || P.mobilite || P.dispo ? 'ok' : 'fac';
    case 'style': return NC.ETAT.vus['style_' + cv.id] ? 'ok' : '';
    case 'verif': return NC.pret(NC.verifier(cv, cv.style.ats)) ? 'ok' : '';
  }
  return '';
}
NC.etatEtape = etatEtape;
function progression() {
  const cv = NC.cvPrincipal();
  const e = id => etatEtape(cv, id) === 'ok';
  return [
    ['Coordonnées', e('coord'), 'cv', 'coord'], ['Poste & accroche', e('poste'), 'cv', 'poste'], ['Expériences', e('exp'), 'cv', 'exp'],
    ['Formation', e('form'), 'cv', 'form'], ['Compétences & langues', e('comp') && e('lang'), 'cv', 'comp'], ['Style', e('style'), 'cv', 'style'],
    ['Vérification', e('verif'), 'cv', 'verif'], ['Lettre', NC.ETAT.lettres.some(l => l.paragraphes.length), 'lettres', ''],
    ['Candidature', NC.ETAT.candidatures.length > 0, 'candidatures', '']
  ];
}

/* Relances et entretiens. */
function relancesDues() {
  const auj = NC.aujourdhui();
  return NC.ETAT.candidatures.filter(c => !FINIS.includes(c.statut) && (c.statut === 'relance' || (c.dateRelance && c.dateRelance <= auj)));
}
function evenements() {
  const ev = [];
  NC.ETAT.candidatures.forEach(c => {
    const nom = [c.poste, c.entreprise].filter(Boolean).join(' · ') || 'Candidature';
    if (c.dateEntretien) ev.push({ date: c.dateEntretien, heure: c.heureEntretien || '', type: 'entretien', nom, id: c.id });
    if (c.dateRelance && !FINIS.includes(c.statut)) ev.push({ date: c.dateRelance, heure: '', type: 'relance', nom, id: c.id });
    if (c.dateEnvoi) ev.push({ date: c.dateEnvoi, heure: '', type: 'envoi', nom, id: c.id });
  });
  return ev.sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure));
}
NC.relancesDues = relancesDues;

/* ============================================================
   ACCUEIL
   ============================================================ */
NC.vues = {};
NC.vues.accueil = function () {
  const cv = NC.cvPrincipal(), E = NC.ETAT;
  const etapes = progression(), faites = etapes.filter(e => e[1]).length, pct = Math.round(100 * faites / etapes.length);
  const prochaine = etapes.find(e => !e[1]);
  const versions = E.cvs.filter(c => c.id !== cv.id);
  const actives = E.candidatures.filter(c => !FINIS.includes(c.statut));
  const dues = relancesDues();
  const auj = NC.aujourdhui();
  const avenir = evenements().filter(e => e.date >= auj && e.type !== 'envoi').slice(0, 4);
  const verifs = E.cvs.map(c => ({ c, v: NC.verifier(c, c.style.ats) }));
  const prets = verifs.filter(x => NC.pret(x.v));
  const lettresPretes = E.lettres.filter(l => l.paragraphes.length && !NC.trousLettre(l));
  const vv = NC.verifier(cv, cv.style.ats), sc = NC.score(vv);

  return `
  <section class="hero carte">
    <div class="hero-txt">
      <div class="surtitre">Un outil de la maison NaoGroup</div>
      <h2 class="hero-titre"><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#l-cv"/></svg><span>Nao<b>CV</b></span></h2>
      <p class="slogan">Votre parcours mérite d'être remarqué.</p>
      <p class="muted">CV, lettres de motivation et candidatures : NaoCV vous accompagne étape par étape pour un CV clair, moderne, adapté à votre métier — et à l'entreprise que vous visez. Rien n'est jamais inventé : chaque mot vient de vous.</p>
      <div class="boutons">
        <button class="btn primaire grand" data-act="creer-mon-cv">Créer mon CV</button>
        ${cv.titre || cv.experiences.length ? '' : '<button class="btn" data-act="exemple">Voir un exemple</button>'}
      </div>
    </div>
    <div class="hero-feuille" data-act="creer-mon-cv" title="Ouvrir mon CV">${vignette(cv.titre || cv.experiences.length ? cv : NC.exemple(), 230, false)}<span class="hero-eclat" aria-hidden="true"></span></div>
  </section>

  <div class="raccourcis">
    <button class="rac" data-act="nouveau-cv"><span>📄</span>Créer un CV</button>
    <button class="rac" data-act="importer"><span>📥</span>Importer un CV</button>
    <button class="rac" data-act="ajouter-exp-accueil"><span>💼</span>Ajouter une expérience</button>
    <button class="rac" data-act="vue" data-vue="offre"><span>🎯</span>Analyser une offre</button>
    <button class="rac" data-act="nouvelle-lettre"><span>✉️</span>Créer une lettre</button>
  </div>

  <section class="carte progression">
    <div class="prog-tete"><div><h3>Votre accompagnement</h3><p class="muted">${faites} étape${faites > 1 ? 's' : ''} sur ${etapes.length} — du premier mot à la première candidature.</p></div>
      <div class="prog-pct"><b>${pct}</b>%</div></div>
    <div class="jauge"><i style="width:${pct}%"></i></div>
    <ol class="chemin">${etapes.map((e, i) => `<li class="${e[1] ? 'fait' : (e === prochaine ? 'actuel' : '')}"><button data-act="aller" data-vue="${e[2]}" data-etape="${e[3]}"><span class="pas">${e[1] ? '✓' : i + 1}</span><span class="lib">${e[0]}</span></button></li>`).join('')}</ol>
    ${prochaine ? `<button class="btn primaire" data-act="aller" data-vue="${prochaine[2]}" data-etape="${prochaine[3]}">Prochaine étape : ${prochaine[0]} →</button>` : '<p class="bravo">🎉 Parcours complet : votre CV est prêt, votre candidature est suivie. Bonne chance !</p>'}
  </section>

  <div class="grille-cartes">
    <article class="carte tuile t-principal">
      <div class="tuile-tete"><span class="tuile-em">📝</span><h3>Mon CV principal</h3></div>
      <div class="principal-corps">
        ${vignette(cv, 120, cv.style.ats)}
        <div>
          <b>${esc(NC.nomComplet(cv) || 'Votre nom')}</b>
          <div class="muted">${esc(cv.titre || 'Titre à définir')}</div>
          <div class="etiquettes"><span class="etiq">${esc(NC.modele(cv.style.modele).nom)}</span>${cv.style.ats ? '<span class="etiq">ATS</span>' : ''}${cv.style.marque ? `<span class="etiq">${pastilleCouleur(cv.style.couleur)} ${esc(cv.style.marque)}</span>` : ''}</div>
          <div class="mini-jauge"><i style="width:${sc}%"></i></div><small class="muted">Vérification : ${sc}%</small>
        </div>
      </div>
      <div class="tuile-pied"><button class="btn petit" data-act="ouvrir-cv" data-id="${cv.id}">Modifier</button><button class="btn petit" data-act="exporter" data-id="${cv.id}">Exporter</button></div>
    </article>

    <article class="carte tuile">
      <div class="tuile-tete"><span class="tuile-em">🗂️</span><h3>Mes versions de CV</h3><span class="compte">${versions.length}</span></div>
      ${versions.length ? `<ul class="liste-mini">${versions.slice(0, 4).map(v => `<li><button data-act="ouvrir-cv" data-id="${v.id}">${pastilleCouleur(v.style.couleur)}<span><b>${esc(v.nom)}</b><small>${esc([v.cible.poste, v.cible.entreprise].filter(Boolean).join(' · ') || NC.modele(v.style.modele).nom)}</small></span></button></li>`).join('')}</ul>`
        : '<p class="muted">Une version par métier ou par offre : même parcours, mise en avant différente.</p>'}
      <div class="tuile-pied"><button class="btn petit" data-act="nouvelle-version">+ Nouvelle version</button><button class="btn petit fantome" data-act="vue" data-vue="versions">Tout voir</button></div>
    </article>

    <article class="carte tuile t-offre">
      <div class="tuile-tete"><span class="tuile-em">🎯</span><h3>Adapter mon CV à une offre</h3></div>
      <p class="muted">Collez une annonce : mots-clés présents et absents, score indicatif, titre et accroche adaptés — et un CV aux couleurs de l'entreprise.</p>
      <div class="tuile-pied"><button class="btn petit primaire" data-act="vue" data-vue="offre">Analyser une offre</button></div>
    </article>

    <article class="carte tuile">
      <div class="tuile-tete"><span class="tuile-em">📋</span><h3>Mes candidatures en cours</h3><span class="compte">${actives.length}</span></div>
      ${E.candidatures.length ? `<div class="barres-statut">${NC.STATUTS.filter(s => E.candidatures.some(c => c.statut === s[0])).map(s => { const n = E.candidatures.filter(c => c.statut === s[0]).length; return `<div class="bs"><span>${s[1]}</span><i style="--l:${Math.max(8, 100 * n / E.candidatures.length)}%;--c:${s[2]}"></i><b>${n}</b></div>`; }).join('')}</div>`
        : '<p class="muted">Suivez chaque envoi : statut, relance, entretien, CV et lettre utilisés.</p>'}
      <div class="tuile-pied"><button class="btn petit" data-act="nouvelle-candidature">+ Ajouter</button><button class="btn petit fantome" data-act="vue" data-vue="candidatures">Tableau</button></div>
    </article>

    <article class="carte tuile${dues.length ? ' alerte' : ''}">
      <div class="tuile-tete"><span class="tuile-em">📅</span><h3>Mes entretiens et relances</h3>${dues.length ? `<span class="compte chaud">${dues.length}</span>` : ''}</div>
      ${dues.length ? `<div class="rappel">🔔 ${dues.length} relance${dues.length > 1 ? 's' : ''} à faire : ${dues.slice(0, 2).map(c => esc(c.entreprise || c.poste)).join(', ')}${dues.length > 2 ? '…' : ''}</div>` : ''}
      ${avenir.length ? `<ul class="agenda-mini">${avenir.map(e => `<li class="ev-${e.type}"><span class="quand">${NC.fmtDate(e.date)}${e.heure ? ' · ' + e.heure : ''}</span><span>${e.type === 'entretien' ? '🤝 Entretien' : '🔔 Relance'} — ${esc(e.nom)}</span></li>`).join('')}</ul>`
        : (dues.length ? '' : '<p class="muted">Aucun entretien ni relance à venir.</p>')}
      <div class="tuile-pied"><button class="btn petit fantome" data-act="vue" data-vue="calendrier">Calendrier</button></div>
    </article>

    <article class="carte tuile">
      <div class="tuile-tete"><span class="tuile-em">✉️</span><h3>Mes lettres de motivation</h3><span class="compte">${E.lettres.length}</span></div>
      ${E.lettres.length ? `<ul class="liste-mini">${E.lettres.slice(-4).reverse().map(l => `<li><button data-act="ouvrir-lettre" data-id="${l.id}"><span class="rond-em">✉️</span><span><b>${esc(l.entreprise || 'Sans entreprise')}</b><small>${esc(l.poste || 'Poste à préciser')} · ${l.format === 'court' ? 'courte' : 'développée'}</small></span></button></li>`).join('')}</ul>`
        : '<p class="muted">Une lettre construite à partir de votre parcours et de l\'offre, que vous relisez phrase par phrase.</p>'}
      <div class="tuile-pied"><button class="btn petit" data-act="nouvelle-lettre">+ Créer une lettre</button></div>
    </article>

    <article class="carte tuile">
      <div class="tuile-tete"><span class="tuile-em">📦</span><h3>Mes documents prêts à envoyer</h3><span class="compte">${prets.length + lettresPretes.length}</span></div>
      ${prets.length + lettresPretes.length ? `<ul class="liste-mini">${prets.slice(0, 3).map(x => `<li><button data-act="exporter" data-id="${x.c.id}"><span class="rond-em">📄</span><span><b>${esc(NC.nomFichier('CV', x.c, x.c.cible.poste || x.c.titre))}.pdf</b><small>${esc(x.c.nom)}</small></span></button></li>`).join('')}
        ${lettresPretes.slice(0, 2).map(l => { const c = NC.cvParId(l.cvId) || cv; return `<li><button data-act="ouvrir-lettre" data-id="${l.id}"><span class="rond-em">✉️</span><span><b>${esc(NC.nomFichier('Lettre_Motivation', c, l.entreprise))}.pdf</b><small>${esc(l.entreprise)}</small></span></button></li>`; }).join('')}</ul>`
        : '<p class="muted">Vos documents apparaissent ici quand la vérification est au vert.</p>'}
      <div class="tuile-pied"><button class="btn petit fantome" data-act="vue" data-vue="prets">Checklist d'envoi</button></div>
    </article>
  </div>`;
};

/* ============================================================
   MON CV : l'éditeur guidé et l'aperçu en direct
   ============================================================ */
NC.vues.cv = function () {
  const cv = cvCourant(), et = NC.UI.etape;
  const idx = NC.ETAPES.findIndex(e => e[0] === et);
  const prec = NC.ETAPES[idx - 1], suiv = NC.ETAPES[idx + 1];
  return `
  <div class="ed-barre">
    <label class="pastille choix"><span>🗂️</span><select data-act-change="choisir-cv" aria-label="Version affichée">${NC.ETAT.cvs.map(c => `<option value="${c.id}"${c.id === cv.id ? ' selected' : ''}>${esc(c.nom)}${c.id === NC.ETAT.principal ? ' ★' : ''}</option>`).join('')}</select></label>
    <div class="ed-barre-d">
      <button class="btn petit fantome" data-act="nouvelle-version">+ Version</button>
      <button class="btn petit fantome ecran-seul" data-act="basculer-apercu">👁️ Aperçu</button>
    </div>
  </div>
  <div class="editeur${NC.UI.mobileApercu ? ' voir-apercu' : ''}">
    <nav class="etapes" id="navEtapes" aria-label="Étapes du CV">${NC.navEtapes(cv)}</nav>
    <section class="ed-form carte" data-cible="cv" id="edForm">
      <div class="ed-titre"><span class="ed-em">${NC.ETAPES[idx][2]}</span><div><small>Étape ${idx + 1} sur ${NC.ETAPES.length}</small><h3>${NC.ETAPES[idx][1]}</h3></div></div>
      ${ETAPE[et](cv)}
      <div class="ed-nav">${prec ? `<button class="btn fantome" data-act="etape" data-etape="${prec[0]}">← ${prec[1]}</button>` : '<span></span>'}
        ${suiv ? `<button class="btn primaire" data-act="etape" data-etape="${suiv[0]}">${suiv[1]} →</button>` : `<button class="btn primaire" data-act="vue" data-vue="prets">Prêt à envoyer →</button>`}</div>
    </section>
    <section class="ed-apercu">
      <div class="apercu-barre">
        <div class="bascule" role="group" aria-label="Version affichée">
          <button class="${cv.style.ats ? '' : 'on'}" data-act="mode" data-ats="0">🎨 Visuel</button><button class="${cv.style.ats ? 'on' : ''}" data-act="mode" data-ats="1">🤖 CV ATS</button>
        </div>
        <span class="pages" id="pagesApercu"></span>
        <button class="btn petit" data-act="exporter" data-id="${cv.id}">⬇️ Exporter</button>
      </div>
      <div class="apercu-cadre" id="apercuCadre"><div class="apercu-echelle" id="apercu"></div></div>
      <p class="apercu-note">${cv.style.ats ? 'Version ATS : une colonne, texte simple, titres standards — idéale pour les formulaires en ligne.' : `Modèle ${esc(NC.modele(cv.style.modele).nom)}${cv.style.marque ? ' · aux couleurs de ' + esc(cv.style.marque) : ''} · aperçu en direct.`}</p>
    </section>
  </div>`;
};

NC.navEtapes = cv => NC.ETAPES.map((e, i) => {
  const s = etatEtape(cv, e[0]);
  return `<button class="etape ${e[0] === NC.UI.etape ? 'active' : ''} ${s}" data-act="etape" data-etape="${e[0]}"><span class="num">${s === 'ok' ? '✓' : i + 1}</span><span class="lib">${e[2]} ${e[1]}</span>${s === 'fac' ? '<small>facultatif</small>' : ''}</button>`;
}).join('');

const ETAPE = {};
ETAPE.coord = cv => {
  const P = cv.perso;
  return `<p class="guide">Commençons simplement : comment un recruteur peut-il vous joindre ?</p>
  <div class="grille2">
    ${champ('Prénom', 'perso.prenom', P.prenom, { req: true })}${champ('Nom', 'perso.nom', P.nom, { req: true })}
    ${champ('Ville de résidence', 'perso.ville', P.ville, { req: true, ph: 'Lyon' })}${champ('Téléphone', 'perso.tel', P.tel, { req: true, type: 'tel', ph: '06 12 34 56 78' })}
    ${champ('Adresse e-mail', 'perso.email', P.email, { req: true, type: 'email', ph: 'prenom.nom@mail.fr', aide: 'Une adresse sobre, idéalement prénom.nom.' })}
    ${champ('LinkedIn', 'perso.linkedin', P.linkedin, { facult: true, type: 'url', ph: 'linkedin.com/in/…' })}
    ${champ('Portfolio ou site', 'perso.portfolio', P.portfolio, { facult: true, type: 'url', ph: 'monportfolio.fr' })}
  </div>
  <div class="bloc-photo">
    ${P.photo ? `<img src="${P.photo}" alt="Votre photo">` : '<div class="photo-vide">📷</div>'}
    <div>
      <b>Photo</b> <i class="fac">facultatif</i>
      <p class="muted">En France, la photo n'est pas obligatoire. Elle n'apparaît jamais dans la version ATS.</p>
      <div class="boutons">
        <button class="btn petit" data-act="choisir-photo">${P.photo ? 'Changer' : 'Ajouter une photo'}</button>
        ${P.photo ? '<button class="btn petit fantome" data-act="retirer-photo">Retirer</button>' : ''}
      </div>
      ${P.photo ? coche('Afficher la photo sur la version visuelle', 'style.photo', cv.style.photo) : ''}
    </div>
  </div>`;
};
ETAPE.poste = cv => {
  const idees = NC.ideesAccroche(cv);
  const postes = [...new Set(cv.experiences.map(x => x.poste).filter(Boolean))];
  return `<p class="guide">Quel poste recherchez-vous ? Le titre est la première chose lue par un recruteur — et par un logiciel de tri.</p>
  ${champ('Titre professionnel recherché', 'titre', cv.titre, { req: true, ph: 'Assistante commerciale, Développeur web junior…', liste: 'dlPostes' })}
  <datalist id="dlPostes">${postes.map(p => `<option value="${esc(p)}">`).join('')}</datalist>
  ${champ('Phrase d\'accroche · profil professionnel', 'accroche', cv.accroche, { zone: true, rows: 4, ph: 'Qui êtes-vous, que savez-vous faire, que cherchez-vous ? En 2 à 4 lignes.', aide: `<span id="compteAccroche">${cv.accroche.length}</span> caractères · idéalement 200 à 450.` })}
  <div class="idees">
    <div class="idees-tete"><b>💡 Idées d'accroche</b><small>construites uniquement avec ce que vous avez saisi</small></div>
    ${idees.length ? idees.map((i, n) => `<div class="idee"><small>${i.label}</small><p>${esc(i.texte)}</p><button class="btn petit" data-act="utiliser-accroche" data-i="${n}">Utiliser</button></div>`).join('')
      : '<p class="muted">Renseignez d\'abord votre titre, vos expériences ou compétences : les idées apparaîtront ici.</p>'}
  </div>`;
};
ETAPE.exp = cv => {
  return `<p class="guide">Vos expériences, de la plus récente à la plus ancienne. Écrivez vos missions simplement : ✨ Reformuler vous proposera des formulations professionnelles, sans rien inventer.</p>
  ${cv.experiences.length ? `<div class="liste-cartes">${cv.experiences.map((x, i) => {
    const vagues = x.missions.filter(m => m && NC.estVague(m)).length;
    return `<div class="elem" style="--marque:${x.couleur || 'var(--accent)'}">
      ${x.logo ? `<span class="mono logo"><img src="${x.logo}" alt=""></span>` : `<span class="mono" style="background:${x.couleur || 'var(--accent)'};color:${x.couleur ? NC.texteSur(x.couleur) : '#fff'}">${esc(NC.initiales(x.entreprise))}</span>`}
      <div class="elem-txt"><b>${esc(x.poste || 'Poste à préciser')}</b><span>${esc([x.entreprise, x.ville, x.contrat].filter(Boolean).join(' · '))}</span>
        <small>${esc(NC.periode(x)) || 'Dates à préciser'} · ${x.missions.filter(Boolean).length} mission(s)${vagues ? ` · <em class="attention">⚠️ ${vagues} à préciser</em>` : ''}</small></div>
      <div class="elem-act"><button class="icone" data-act="monter-exp" data-i="${i}" title="Monter" ${i ? '' : 'disabled'}>↑</button><button class="icone" data-act="descendre-exp" data-i="${i}" title="Descendre" ${i < cv.experiences.length - 1 ? '' : 'disabled'}>↓</button>
        <button class="icone" data-act="modifier-exp" data-i="${i}" title="Modifier">✏️</button><button class="icone" data-act="supprimer-exp" data-i="${i}" title="Supprimer">🗑️</button></div></div>`;
  }).join('')}</div>` : vide('💼', 'Aucune expérience pour l\'instant', 'Emploi, stage, alternance, job étudiant, bénévolat : tout compte.')}
  <div class="boutons"><button class="btn primaire" data-act="ajouter-exp">+ Ajouter une expérience</button>${cv.experiences.length > 1 ? '<button class="btn fantome" data-act="trier">↕️ Trier du plus récent au plus ancien</button>' : ''}</div>`;
};
ETAPE.form = cv => `<p class="guide">Diplômes et formations, du plus récent au plus ancien. Une formation en cours compte aussi.</p>
  ${cv.formations.length ? `<div class="liste-cartes">${cv.formations.map((f, i) => `<div class="elem">
    <span class="mono">🎓</span><div class="elem-txt"><b>${esc(f.diplome || 'Diplôme à préciser')}</b><span>${esc([f.ecole, f.ville, f.mention].filter(Boolean).join(' · '))}</span><small>${esc(NC.periode(f)) || 'Dates à préciser'}</small></div>
    <div class="elem-act"><button class="icone" data-act="monter-form" data-i="${i}" ${i ? '' : 'disabled'}>↑</button><button class="icone" data-act="descendre-form" data-i="${i}" ${i < cv.formations.length - 1 ? '' : 'disabled'}>↓</button>
    <button class="icone" data-act="modifier-form" data-i="${i}">✏️</button><button class="icone" data-act="supprimer-form" data-i="${i}">🗑️</button></div></div>`).join('')}</div>`
    : vide('🎓', 'Aucune formation', 'Diplôme, titre professionnel, formation courte ou en cours.')}
  <div class="boutons"><button class="btn primaire" data-act="ajouter-form">+ Ajouter une formation</button></div>`;

function editeurPuces(cle, titre, aide, suggestions, cv) {
  const deja = new Set(cv[cle].map(norm));
  const sugg = suggestions.filter(s => !deja.has(norm(s))).slice(0, 16);
  return `<div class="puces-ed">
    <div class="puces-tete"><b>${titre}</b><small>${aide}</small></div>
    <div class="puces-liste">${cv[cle].map((t, i) => `<span class="puce-ed">${esc(t)}<button data-act="retirer-puce" data-cle="${cle}" data-i="${i}" aria-label="Retirer ${esc(t)}">×</button></span>`).join('') || '<span class="muted petit">Aucune pour l\'instant.</span>'}</div>
    <div class="puces-ajout"><input type="text" data-puce="${cle}" placeholder="Ajouter puis Entrée…" spellcheck="true" lang="fr"><button class="btn petit" data-act="ajouter-puce" data-cle="${cle}">Ajouter</button></div>
    ${sugg.length ? `<div class="sugg"><small>Suggestions — cliquez seulement sur ce que vous maîtrisez réellement :</small>${sugg.map(s => `<button class="sugg-b" data-act="puce-sugg" data-cle="${cle}" data-t="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>` : ''}
  </div>`;
}
ETAPE.comp = cv => {
  const titreN = norm(cv.titre + ' ' + cv.experiences.map(x => x.poste + ' ' + x.missions.join(' ')).join(' '));
  const proches = NC.MOTS.techniques.filter(([, m]) => new RegExp(m).test(titreN)).map(e => e[0]);
  const tech = [...new Set(proches.concat(NC.MOTS.techniques.map(e => e[0])))];
  return `<p class="guide">Ce que vous savez faire (techniques), comment vous travaillez (relationnelles) et vos logiciels. Soyez précis·e : « Facturation » vaut mieux que « Gestion ».</p>
  ${editeurPuces('compTech', 'Compétences techniques', 'savoir-faire du métier', tech, cv)}
  ${editeurPuces('compRel', 'Compétences relationnelles', 'savoir-être', NC.MOTS.qualites.map(e => e[0]), cv)}
  ${editeurPuces('logiciels', 'Logiciels maîtrisés', 'outils du quotidien', NC.MOTS.logiciels.map(e => e[0]), cv)}`;
};
ETAPE.lang = cv => `<p class="guide">Vos langues avec un niveau honnête, et vos certifications (TOEIC, PIX, CACES, SST, permis spécifiques…).</p>
  <h4 class="sous">🌍 Langues</h4>
  <div class="lignes-ed">${cv.langues.map((l, i) => `<div class="ligne-ed">${champ('Langue', `langues.${i}.langue`, l.langue, { liste: 'dlLangues' })}${champ('Niveau', `langues.${i}.niveau`, l.niveau, { select: [['', '— niveau —']].concat(NC.NIVEAUX.map(n => [n, n])) })}<button class="icone" data-act="retirer-ligne" data-cle="langues" data-i="${i}" title="Retirer">🗑️</button></div>`).join('')}</div>
  <datalist id="dlLangues">${NC.LANGUES.map(l => `<option value="${l}">`).join('')}</datalist>
  <button class="btn petit" data-act="ajouter-ligne" data-cle="langues">+ Ajouter une langue</button>
  <h4 class="sous">🏅 Certifications</h4>
  <div class="lignes-ed">${cv.certifications.map((c, i) => `<div class="ligne-ed l3">${champ('Certification', `certifications.${i}.nom`, c.nom, { ph: 'TOEIC 850' })}${champ('Organisme', `certifications.${i}.organisme`, c.organisme)}${champ('Année', `certifications.${i}.date`, c.date, { ph: '2025' })}<button class="icone" data-act="retirer-ligne" data-cle="certifications" data-i="${i}">🗑️</button></div>`).join('')}</div>
  <button class="btn petit" data-act="ajouter-ligne" data-cle="certifications">+ Ajouter une certification</button>`;
ETAPE.plus = cv => `<p class="guide">Facultatif, mais précieux : un projet montre ce que vous savez faire, un centre d'intérêt dit qui vous êtes.</p>
  <h4 class="sous">🚀 Projets personnels ou professionnels</h4>
  <div class="lignes-ed">${cv.projets.map((p, i) => `<div class="projet-ed">
    <div class="grille2">${champ('Titre du projet', `projets.${i}.titre`, p.titre)}${champ('Contexte', `projets.${i}.contexte`, p.contexte, { ph: 'Projet d\'études, associatif, personnel…' })}</div>
    ${champ('Description', `projets.${i}.description`, p.description, { zone: true, rows: 2, ph: 'Ce que vous avez fait, avec quels outils, pour quel résultat réel.' })}
    <div class="grille2">${champ('Lien', `projets.${i}.lien`, p.lien, { facult: true, type: 'url' })}<div class="droite"><button class="btn petit fantome" data-act="retirer-ligne" data-cle="projets" data-i="${i}">🗑️ Retirer ce projet</button></div></div></div>`).join('')}</div>
  <button class="btn petit" data-act="ajouter-ligne" data-cle="projets">+ Ajouter un projet</button>
  <h4 class="sous">🎈 Centres d'intérêt</h4>
  ${editeurPuces('interets', 'Centres d\'intérêt', 'précis de préférence : « Trail, 3 courses par an » plutôt que « Sport »', ['Lecture', 'Randonnée', 'Photographie', 'Musique', 'Bénévolat associatif', 'Cuisine', 'Voyages', 'Théâtre', 'Course à pied', 'Dessin', 'Jeux de société', 'Jardinage'], cv)}`;
ETAPE.infos = cv => {
  const P = cv.perso;
  return `<p class="guide">Des informations pratiques qui rassurent le recruteur — seulement si vous le souhaitez.</p>
  <div class="grille2">
    ${champ('Permis de conduire', 'perso.permis', P.permis, { facult: true, liste: 'dlPermis', ph: 'Permis B' })}
    ${champ('Mobilité', 'perso.mobilite', P.mobilite, { facult: true, ph: 'Lyon et 30 km autour, télétravail…' })}
    ${champ('Disponibilité', 'perso.dispo', P.dispo, { facult: true, liste: 'dlDispo', ph: 'immédiate' })}
  </div>
  <datalist id="dlPermis"><option value="Permis B"><option value="Permis B, véhicule personnel"><option value="Permis A"><option value="Permis C"><option value="Permis D"><option value="Permis BE"><option value="Permis B en cours"></datalist>
  <datalist id="dlDispo"><option value="immédiate"><option value="sous 1 mois"><option value="préavis de 1 mois"><option value="préavis de 3 mois"><option value="à partir de septembre"><option value="rythme 3 semaines entreprise / 1 semaine école"><option value="rythme 2 jours école / 3 jours entreprise"></datalist>`;
};
ETAPE.style = cv => {
  const st = cv.style;
  const entreprises = [...new Set([cv.cible.entreprise, ...cv.experiences.map(x => x.entreprise)].filter(Boolean))];
  return `<p class="guide">Choisissez le modèle, puis la couleur : une teinte discrète, ou les couleurs de l'entreprise que vous visez pour un CV vraiment « maison ».</p>
  <div class="bascule grande" role="group" aria-label="Type de CV">
    <button class="${st.ats ? '' : 'on'}" data-act="mode" data-ats="0">🎨 Version visuelle</button><button class="${st.ats ? 'on' : ''}" data-act="mode" data-ats="1">🤖 Version ATS</button>
  </div>
  ${st.ats ? `<div class="encart">🤖 <b>CV ATS</b> — une seule colonne, police simple, titres standards, coordonnées en haut du corps du document, texte sélectionnable. Ni photo, ni tableau, ni icône, ni barre de niveau. C'est la version à déposer sur les sites d'emploi et formulaires en ligne.</div>
    ${champ('Police ATS', 'style.atsPolice', st.atsPolice, { select: NC.POLICES_ATS })}` : ''}
  <h4 class="sous">🧾 Modèle</h4>
  <div class="modeles">${NC.MODELES.map(m => `<button class="modele ${st.modele === m.id ? 'on' : ''}" data-act="modele" data-m="${m.id}">${vignette(Object.assign({}, cv, { style: Object.assign({}, st, { modele: m.id }) }), 118, false)}<b>${m.nom}</b><small>${m.desc}</small></button>`).join('')}</div>
  <h4 class="sous">🎨 Couleur des titres et séparateurs</h4>
  <div class="palette">${NC.PALETTE.map(([n, c]) => `<button class="nuance ${!st.marque && norm(st.couleur) === norm(c) ? 'on' : ''}" data-act="couleur" data-c="${c}" title="${n}" style="--n:${c}"><i></i><span>${n}</span></button>`).join('')}
    <label class="nuance perso" title="Couleur personnalisée"><input type="color" data-c="style.couleur" value="${esc(st.couleur)}"><span>Personnalisée</span></label></div>
  <div class="marque-bloc">
    <div class="marque-tete"><b>🏢 Aux couleurs d'une entreprise</b><small>pour un CV vraiment personnalisé et corporate</small></div>
    ${st.marque ? `<div class="marque-active">${pastilleCouleur(st.couleur)}${st.couleur2 ? pastilleCouleur(st.couleur2) : ''}<span>CV habillé aux couleurs de <b>${esc(st.marque)}</b></span><button class="btn petit fantome" data-act="retirer-marque">Retirer</button></div>` : ''}
    ${entreprises.length ? `<div class="sugg">${entreprises.map(e => { const t = NC.trouverEntreprise(e); return `<button class="sugg-b" data-act="marque" data-e="${esc(e)}">${t ? pastilleCouleur(t.c1) : ''}${esc(e)}</button>`; }).join('')}</div>` : ''}
    <div class="puces-ajout"><input type="text" id="saisieMarque" list="dlEntreprises" placeholder="Nom de l'entreprise visée…"><button class="btn petit" data-act="marque-saisie">Appliquer</button><button class="btn petit fantome" data-act="logo-marque">📷 Depuis un logo</button></div>
    <div class="grille2 serre">${champ('Couleur principale', 'style.couleur', st.couleur, { type: 'color' })}${champ('Couleur secondaire', 'style.couleur2', st.couleur2 || st.couleur, { type: 'color', aide: 'filets et détails' })}</div>
    <small class="muted">Couleurs indicatives, reprises des chartes publiques : vérifiez-les, ou importez le logo de l'entreprise pour en extraire les teintes. Une couleur trop claire est automatiquement assombrie pour rester lisible.</small>
  </div>
  <h4 class="sous">⚙️ Réglages</h4>
  <div class="grille2">${champ('Police de la version visuelle', 'style.police', st.police, { select: NC.POLICES })}<div class="coches">
    ${coche('Couleurs et monogrammes des entreprises dans mes expériences', 'style.couleursEntreprises', st.couleursEntreprises !== false)}
    ${cv.perso.photo ? coche('Afficher ma photo', 'style.photo', st.photo) : '<small class="muted">Photo : ajoutez-la à l\'étape Coordonnées si vous le souhaitez.</small>'}</div></div>`;
};
ETAPE.verif = cv => {
  const ats = cv.style.ats, L = NC.verifier(cv, ats), pret = NC.pret(L), sc = NC.score(L);
  const fautes = (L.find(i => i.fautes) || {}).fautes || [];
  const nom = NC.nomFichier('CV', cv, cv.cible.poste || cv.titre);
  return `<div class="pret-badge ${pret ? 'ok' : ''}"><div class="anneau" style="--p:${sc}"><b>${sc}%</b></div><div><b>${pret ? '✅ CV prêt à envoyer' : '🛠️ Encore quelques points'}</b><p class="muted">Vérification de la version ${ats ? 'ATS' : 'visuelle'}. ${pret ? 'Relisez une dernière fois à voix haute, puis exportez.' : 'Corrigez les points en rouge avant d\'envoyer.'}</p></div></div>
  <ul class="checklist">${L.map(i => `<li class="${i.niveau}"><span class="ic">${{ ok: '✓', alerte: '!', erreur: '✕', info: 'i' }[i.niveau]}</span><div><b>${i.titre}</b><small>${esc(i.detail)}</small></div>
    ${i.act === 'trier' ? '<button class="btn petit" data-act="trier">Trier</button>' : (i.etape && i.niveau !== 'ok' && i.etape !== 'verif' ? `<button class="btn petit fantome" data-act="etape" data-etape="${i.etape}">Corriger</button>` : '')}</li>`).join('')}</ul>
  ${fautes.length ? `<h4 class="sous">🔤 Relecture</h4><ul class="fautes">${fautes.slice(0, 14).map(f => `<li><small>${esc(f.ou)}</small><span>${esc(f.texte)}</span>${f.corr ? `<button class="btn petit" data-act="corriger" data-f="${esc(f.faute)}" data-r="${esc(f.corr)}">Corriger partout</button>` : ''}</li>`).join('')}</ul>` : ''}
  <p class="muted petit">La relecture repère les fautes fréquentes et la typographie ; le correcteur de votre navigateur souligne le reste en rouge dans les champs.</p>
  <h4 class="sous">⬇️ Exporter</h4>
  <div class="exports">
    <button class="export" data-act="pdf" data-id="${cv.id}" data-ats="0"><span>🎨</span><b>PDF visuel</b><small>${esc(nom)}.pdf</small></button>
    <button class="export" data-act="pdf" data-id="${cv.id}" data-ats="1"><span>🤖</span><b>PDF ATS</b><small>texte sélectionnable</small></button>
    <button class="export" data-act="docx" data-id="${cv.id}" data-ats="0"><span>📝</span><b>Word · DOCX</b><small>${esc(nom)}.docx</small></button>
    <button class="export" data-act="docx" data-id="${cv.id}" data-ats="1"><span>📄</span><b>DOCX ATS</b><small>une colonne, sans couleur</small></button>
  </div>
  <div class="encart">📌 Suivez toujours le format demandé dans l'annonce : <b>PDF</b> ou <b>DOCX</b>. Sans consigne, le PDF garde votre mise en page intacte ; sur un formulaire en ligne, préférez la version ATS.</div>`;
};

/* ---------- Fenêtre : une expérience ---------- */
NC.fenetreExperience = function (x, nouveau) {
  NC.brouillon = x;
  const t = NC.trouverEntreprise(x.entreprise);
  ouvrirModale(`<h3 id="modaleTitre">${nouveau ? '💼 Nouvelle expérience' : '💼 Modifier l\'expérience'}</h3>
  <div data-cible="brouillon" class="form-exp">
    <div class="grille2">
      ${champ('Poste occupé', 'poste', x.poste, { req: true, ph: 'Conseillère de vente' })}
      ${champ('Entreprise', 'entreprise', x.entreprise, { req: true, liste: 'dlEntreprises', ph: 'Nom de l\'entreprise', id: 'champEntreprise' })}
      ${champ('Ville', 'ville', x.ville)}
      ${champ('Type de contrat', 'contrat', x.contrat, { select: [['', '— choisir —']].concat(NC.CONTRATS.map(c => [c, c])) })}
      ${champ('Date de début', 'debut', x.debut, { type: 'month' })}
      <div>${champ('Date de fin', 'fin', x.fin, { type: 'month', cls: x.enCours ? 'grise' : '' })}${coche('Poste actuel (en cours)', 'enCours', x.enCours)}</div>
    </div>
    <div class="marque-exp" id="marqueExp">${blocMarqueExp(x, t)}</div>
    ${champ('Principales missions', 'missions', x.missions.join('\n'), { zone: true, rows: 5, ph: 'Une mission par ligne, avec vos mots :\nje m\'occupais de la caisse\naccueil des clients\ngestion du stock', aide: 'Une mission par ligne. Puis ✨ Reformuler pour des formulations professionnelles.', id: 'champMissions' })}
    <div class="boutons"><button class="btn" data-act="reformuler">✨ Reformuler mes missions</button></div>
    <div id="reformulations"></div>
    <div class="grille2">
      ${champ('Outils utilisés', 'outils', x.outils, { facult: true, ph: 'Excel, SAP, caisse enregistreuse…' })}
      ${champ('Compétences développées', 'competences', x.competences, { facult: true, ph: 'Relation client, gestion des priorités…' })}
    </div>
    ${champ('Résultats obtenus', 'resultats', x.resultats, { facult: true, zone: true, rows: 2, ph: 'Uniquement des résultats réels : un chiffre que vous connaissez, un projet livré, un retour client…', aide: 'NaoCV n\'ajoute jamais de chiffre à votre place.' })}
  </div>
  <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="enregistrer-exp" data-nouveau="${nouveau ? 1 : 0}">Enregistrer</button></div>`, 'large');
};
function blocMarqueExp(x, t) {
  return `<div class="me-apercu"><span class="mono" style="background:${x.couleur || 'var(--accent)'}">${x.logo ? `<img src="${x.logo}" alt="">` : esc(NC.initiales(x.entreprise))}</span>
    <div><b>Couleurs de l'entreprise</b><small>${t ? `Couleurs de ${esc(t.nom)} reconnues automatiquement.` : 'Choisissez sa couleur, ou importez son logo pour l\'extraire.'}</small></div></div>
    <div class="me-outils"><input type="color" data-c="couleur" value="${esc(x.couleur || '#1F3A68')}" aria-label="Couleur de l'entreprise">
    <button class="btn petit fantome" data-act="logo-exp">📷 ${x.logo ? 'Changer le logo' : 'Importer le logo'}</button>
    ${x.logo ? '<button class="btn petit fantome" data-act="retirer-logo-exp">Retirer le logo</button>' : ''}</div>`;
}
NC.majMarqueExp = function () { const b = $('#marqueExp'); if (b && NC.brouillon) b.innerHTML = blocMarqueExp(NC.brouillon, NC.trouverEntreprise(NC.brouillon.entreprise)); };
NC.panneauReformulation = function () {
  const zone = $('#reformulations'); if (!zone) return;
  const lignes = NC.brouillon.missions.map((m, i) => ({ m, i })).filter(o => o.m.trim());
  if (!lignes.length) { zone.innerHTML = '<p class="muted">Écrivez d\'abord vos missions, une par ligne.</p>'; return; }
  zone.innerHTML = `<div class="reform">${lignes.map(({ m, i }) => {
    const r = NC.reformuler(m);
    return `<div class="reform-l"><div class="reform-o">« ${esc(m)} »</div>
      ${r.avis.map(a => `<div class="avis ${a.niveau}">${a.niveau === 'info' ? '💡' : '⚠️'} ${esc(a.texte)}</div>`).join('')}
      <div class="variantes">${r.variantes.map(v => `<button class="variante" data-act="variante" data-i="${i}" data-t="${esc(v.texte)}"><small>${v.style}</small><span>${esc(v.texte)}</span>${v.note ? `<em>${esc(v.note)}</em>` : ''}</button>`).join('')}</div></div>`;
  }).join('')}<p class="muted petit">Cliquez sur une formulation pour remplacer la ligne. Vérifiez toujours qu'elle reste fidèle à ce que vous avez réellement fait.</p></div>`;
};

NC.fenetreFormation = function (f, nouveau) {
  NC.brouillon = f;
  ouvrirModale(`<h3 id="modaleTitre">🎓 ${nouveau ? 'Nouvelle formation' : 'Modifier la formation'}</h3>
  <div data-cible="brouillon"><div class="grille2">
    ${champ('Diplôme ou formation', 'diplome', f.diplome, { req: true, ph: 'BTS Management commercial opérationnel' })}
    ${champ('Établissement', 'ecole', f.ecole, { ph: 'Lycée, université, organisme…' })}
    ${champ('Ville', 'ville', f.ville)}${champ('Mention', 'mention', f.mention, { facult: true, liste: 'dlMentions' })}
    ${champ('Début', 'debut', f.debut, { type: 'month' })}<div>${champ('Fin', 'fin', f.fin, { type: 'month' })}${coche('Formation en cours', 'enCours', f.enCours)}</div></div>
    <datalist id="dlMentions"><option value="Mention très bien"><option value="Mention bien"><option value="Mention assez bien"><option value="Major de promotion"></datalist>
    ${champ('Détails', 'details', f.details, { facult: true, zone: true, rows: 2, ph: 'Spécialité, matières clés, mémoire, rythme d\'alternance…' })}</div>
  <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="enregistrer-form" data-nouveau="${nouveau ? 1 : 0}">Enregistrer</button></div>`, 'large');
};

/* ============================================================
   MES VERSIONS
   ============================================================ */
NC.vues.versions = function () {
  const E = NC.ETAT;
  return `<div class="tete-vue"><div><h2>🗂️ Mes versions de CV</h2><p class="muted">Un même parcours, plusieurs mises en avant : une version par métier, par offre ou par entreprise.</p></div>
    <div class="boutons"><button class="btn" data-act="importer">📥 Importer un CV</button><button class="btn primaire" data-act="nouvelle-version">+ Nouvelle version</button></div></div>
  <div class="versions">${E.cvs.map(cv => {
    const L = NC.verifier(cv, cv.style.ats), princ = cv.id === E.principal;
    const liees = E.candidatures.filter(c => c.cvId === cv.id).length;
    return `<article class="carte version${princ ? ' principal' : ''}">
      <button class="version-v" data-act="ouvrir-cv" data-id="${cv.id}">${vignette(cv, 170, cv.style.ats)}</button>
      <div class="version-txt">
        <div class="version-nom">${princ ? '<span class="etoile" title="CV principal">★</span>' : ''}<b>${esc(cv.nom)}</b></div>
        <small class="muted">${esc([cv.cible.poste || cv.titre, cv.cible.entreprise].filter(Boolean).join(' · ') || 'Sans cible')}</small>
        <div class="etiquettes"><span class="etiq">${esc(NC.modele(cv.style.modele).nom)}</span>${cv.style.ats ? '<span class="etiq">ATS</span>' : ''}${cv.style.marque ? `<span class="etiq">${pastilleCouleur(cv.style.couleur)} ${esc(cv.style.marque)}</span>` : ''}<span class="etiq ${NC.pret(L) ? 'vert' : ''}">${NC.pret(L) ? '✓ prêt' : NC.score(L) + '%'}</span>${liees ? `<span class="etiq">📋 ${liees}</span>` : ''}</div>
        <small class="muted">Modifié le ${NC.fmtDate(cv.maj || cv.cree)}</small>
      </div>
      <div class="version-act">
        <button class="btn petit" data-act="ouvrir-cv" data-id="${cv.id}">Modifier</button>
        <button class="btn petit fantome" data-act="dupliquer-cv" data-id="${cv.id}">Dupliquer</button>
        <button class="btn petit fantome" data-act="renommer-cv" data-id="${cv.id}">Renommer</button>
        ${princ ? '' : `<button class="btn petit fantome" data-act="principal-cv" data-id="${cv.id}">★ Principal</button>`}
        <button class="btn petit fantome" data-act="exporter" data-id="${cv.id}">Exporter</button>
        ${E.cvs.length > 1 ? `<button class="btn petit fantome danger-t" data-act="supprimer-cv" data-id="${cv.id}">Supprimer</button>` : ''}
      </div></article>`;
  }).join('')}</div>`;
};

/* ============================================================
   ADAPTER À UNE OFFRE
   ============================================================ */
NC.vues.offre = function () {
  const O = NC.ETAT.offre || (NC.ETAT.offre = { texte: '', cvId: NC.ETAT.principal, entreprise: '', poste: '' });
  const cv = NC.cvParId(O.cvId) || NC.cvPrincipal();
  const R = O.texte.trim().length > 40 ? NC.analyserOffre(O.texte, cv) : null;
  NC.derniereAnalyse = R;
  const marque = NC.trouverEntreprise(O.entreprise);
  const puce = k => `<span class="kw ${k.present ? 'present' : 'absent'}">${k.present ? '✓' : '○'} ${esc(k.label)}${!k.present ? `<button data-act="kw-ajouter" data-l="${esc(k.label)}" data-g="${k.groupe}" title="Je le maîtrise réellement : l'ajouter à mon CV">+</button>` : ''}</span>`;
  const groupes = R ? [['logiciels', '💻 Logiciels'], ['techniques', '🧩 Compétences et missions'], ['qualites', '🤝 Qualités'], ['langues', '🌍 Langues']].filter(([g]) => R.groupes[g] && R.groupes[g].length) : [];
  return `<div class="tete-vue"><div><h2>🎯 Adapter mon CV à une offre</h2><p class="muted">Collez l'annonce : NaoCV repère ce qu'elle attend et le compare à votre CV. Vous n'ajoutez que ce qui est vrai.</p></div></div>
  <div class="offre-grille">
    <section class="carte" data-cible="offre">
      <div class="grille2">
        <label class="champ"><span>CV à comparer</span><select data-c="cvId">${NC.ETAT.cvs.map(c => `<option value="${c.id}"${c.id === cv.id ? ' selected' : ''}>${esc(c.nom)}</option>`).join('')}</select></label>
        ${champ('Entreprise qui recrute', 'entreprise', O.entreprise, { liste: 'dlEntreprises', ph: 'Nom de l\'entreprise', aide: marque ? `${pastilleCouleur(marque.c1)}${pastilleCouleur(marque.c2)} Couleurs de ${esc(marque.nom)} reconnues.` : 'Ses couleurs pourront habiller votre CV.' })}
      </div>
      ${champ('Texte de l\'annonce', 'texte', O.texte, { zone: true, rows: 12, ph: 'Copiez-collez ici l\'annonce complète : intitulé, missions, profil recherché…' })}
      <div class="boutons"><button class="btn primaire" data-act="analyser">🔎 Analyser l'offre</button>${O.texte ? '<button class="btn fantome" data-act="vider-offre">Effacer</button>' : ''}</div>
    </section>
    <section class="resultats">${!R ? `<div class="carte">${vide('🔎', 'En attente d\'une annonce', 'Collez le texte d\'une offre d\'emploi (au moins quelques lignes), puis lancez l\'analyse.')}</div>` : `
      <div class="carte score-carte">
        <div class="anneau grand" style="--p:${R.score}"><b>${R.score}</b><small>/100</small></div>
        <div><b>${R.niveau}</b>${R.titre ? `<p>Poste : <b>${esc(R.titre)}</b>${R.contrat ? ' · ' + esc(R.contrat) : ''}</p>` : ''}
        <p class="muted petit">Score indicatif calculé à partir des mots-clés, de la structure du CV et du titre. Il ne garantit ni entretien ni embauche — il vous aide à voir quoi clarifier.</p></div>
      </div>
      <div class="carte"><h3>🔑 Mots-clés de l'annonce</h3>
        <p class="legende"><span class="kw present">✓ déjà dans votre CV</span><span class="kw absent">○ absent</span><span class="muted petit">« + » ajoute le mot-clé à votre CV — uniquement s'il correspond à votre expérience réelle.</span></p>
        ${groupes.map(([g, t]) => `<div class="kw-groupe"><h4>${t}</h4><div>${R.groupes[g].map(puce).join('')}</div></div>`).join('')}
        ${R.autres.length ? `<div class="kw-groupe"><h4>📌 Autres mots fréquents</h4><div>${R.autres.map(k => `<span class="kw ${k.present ? 'present' : 'absent'}">${k.present ? '✓' : '○'} ${esc(k.label)}</span>`).join('')}</div></div>` : ''}
      </div>
      ${R.missions.length ? `<div class="carte"><h3>📋 Missions repérées dans l'annonce</h3><ul class="puces-simple">${R.missions.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
      <div class="carte"><h3>🧭 Axes d'amélioration</h3><ul class="axes">${R.axes.map(a => `<li><b>${esc(a.titre)}</b><span>${esc(a.texte)}</span></li>`).join('')}</ul></div>
      <div class="carte" data-cible="offre"><h3>✍️ Propositions adaptées au poste</h3>
        <div class="propo"><small>Titre professionnel</small><p><b>${esc(R.titre || cv.titre || '—')}</b>${cv.titre && R.titre && norm(cv.titre) !== norm(R.titre) ? ` <span class="muted">au lieu de « ${esc(cv.titre)} »</span>` : ''}</p></div>
        <div class="propo"><small>Accroche adaptée — modifiable</small><textarea id="accrocheAdaptee" rows="4" spellcheck="true" lang="fr">${esc(NC.accrocheAdaptee(cv, R, O.entreprise))}</textarea></div>
        ${R.experiences.filter(x => x.missions.length > 1).map(x => `<div class="propo"><small>${esc(x.poste)}${x.entreprise ? ' · ' + esc(x.entreprise) : ''} — missions dans l'ordre le plus pertinent</small><ol class="missions-tri">${x.missions.map(o => `<li class="${o.s ? 'fort' : ''}">${esc(o.m)}${o.s ? ' <span class="kw present mini">en lien avec l\'offre</span>' : ''}</li>`).join('')}</ol></div>`).join('')}
      </div>
      <div class="carte creer-version">
        <h3>🗂️ Créer une version adaptée à cette offre</h3>
        <div class="coches">
          <label class="coche"><input type="checkbox" id="optTitre" checked><span class="case"></span><span>Reprendre le titre de l'annonce</span></label>
          <label class="coche"><input type="checkbox" id="optAccroche" checked><span class="case"></span><span>Utiliser l'accroche adaptée ci-dessus</span></label>
          <label class="coche"><input type="checkbox" id="optOrdre" checked><span class="case"></span><span>Placer les missions les plus pertinentes en premier</span></label>
          ${O.entreprise ? `<label class="coche"><input type="checkbox" id="optMarque" ${marque ? 'checked' : ''}><span class="case"></span><span>Habiller le CV aux couleurs de ${esc(O.entreprise)} ${marque ? pastilleCouleur(marque.c1) + pastilleCouleur(marque.c2) : '(couleur à choisir ensuite)'}</span></label>` : ''}
          <label class="coche"><input type="checkbox" id="optCand" checked><span class="case"></span><span>Ajouter la candidature au tableau de suivi (« à préparer »)</span></label>
          <label class="coche"><input type="checkbox" id="optLettre"><span class="case"></span><span>Préparer aussi une lettre de motivation</span></label>
        </div>
        <button class="btn primaire grand" data-act="creer-version-offre">Créer la version adaptée</button>
      </div>`}
    </section>
  </div>`;
};

/* ============================================================
   LETTRES DE MOTIVATION
   ============================================================ */
function libellePar(i, n) {
  const L = n === 3 ? ['① Pourquoi ce poste', '② Ce que vous apportez', '③ Entretien et politesse']
    : n === 4 ? ['① Pourquoi ce poste', '② Ce que vous apportez', '③ Votre formation', '④ Entretien et politesse'] : [];
  return L[i] || 'Paragraphe ' + (i + 1);
}
NC.vues.lettres = function () {
  const E = NC.ETAT, l = lettreCourante();
  if (!l) return `<div class="tete-vue"><div><h2>✉️ Mes lettres de motivation</h2><p class="muted">Construites à partir de votre parcours et de l'offre. Vous gardez la main sur chaque phrase.</p></div></div>
    <div class="carte">${vide('✉️', 'Aucune lettre pour l\'instant', 'Choisissez l\'offre, le ton et le format : NaoCV prépare une première version structurée en trois temps, que vous relisez et complétez.', '<button class="btn primaire" data-act="nouvelle-lettre">+ Créer une lettre</button>')}</div>`;
  const cv = NC.cvParId(l.cvId) || NC.cvPrincipal();
  const trous = NC.trousLettre(l), mots = l.paragraphes.join(' ').split(/\s+/).filter(Boolean).length;
  const cible = l.format === 'court' ? [120, 220] : [250, 420];
  return `<div class="tete-vue"><div><h2>✉️ Mes lettres de motivation</h2><p class="muted">Trois temps : pourquoi ce poste, ce que vous apportez, la demande d'entretien.</p></div>
    <div class="boutons"><label class="pastille choix"><span>✉️</span><select data-act-change="choisir-lettre">${E.lettres.map(x => `<option value="${x.id}"${x.id === l.id ? ' selected' : ''}>${esc(x.entreprise || 'Sans entreprise')} — ${esc(x.poste || 'poste ?')}</option>`).join('')}</select></label>
    <button class="btn primaire" data-act="nouvelle-lettre">+ Nouvelle lettre</button></div></div>
  <div class="lettre-grille">
    <section class="carte" data-cible="lettre">
      <div class="grille2">
        <label class="champ"><span>CV utilisé</span><select data-c="cvId">${E.cvs.map(c => `<option value="${c.id}"${c.id === cv.id ? ' selected' : ''}>${esc(c.nom)}</option>`).join('')}</select></label>
        ${champ('Entreprise', 'entreprise', l.entreprise, { liste: 'dlEntreprises' })}
        ${champ('Poste visé', 'poste', l.poste, { req: true })}
        ${champ('Formule d\'appel', 'appel', l.appel, { liste: 'dlAppel' })}
      </div>
      <datalist id="dlAppel"><option value="Madame, Monsieur,"><option value="Madame,"><option value="Monsieur,"><option value="Madame la Directrice,"><option value="Monsieur le Directeur,"><option value="Bonjour,"></datalist>
      <details class="plier"${l.format === 'court' ? '' : ' open'}><summary>En-tête de la lettre (format développé)</summary><div class="grille2">
        ${champ('Destinataire', 'destinataire', l.destinataire, { facult: true, ph: 'Mme Dupont, Responsable RH' })}${champ('Service', 'service', l.service, { facult: true })}
        ${champ('Adresse', 'adresse', l.adresse, { facult: true })}${champ('Fait à', 'lieu', l.lieu, { ph: 'Lyon' })}
        ${champ('Date', 'date', l.date, { type: 'date' })}${champ('Objet', 'objet', l.objet, { ph: NC.objetLettre(l) })}</div></details>
      <div class="choix-ligne"><span>Ton</span>${NC.TONS.map(([id, n]) => `<button class="choix-b ${l.ton === id ? 'on' : ''}" data-act="ton" data-t="${id}">${n}</button>`).join('')}</div>
      <div class="choix-ligne"><span>Format</span><button class="choix-b ${l.format === 'court' ? 'on' : ''}" data-act="format-lettre" data-f="court">Courte · candidature en ligne</button><button class="choix-b ${l.format !== 'court' ? 'on' : ''}" data-act="format-lettre" data-f="long">Développée · e-mail ou dossier</button></div>
      ${champ('Ce qui vous attire dans ce poste ou cette entreprise — avec vos mots', 'motivation', l.motivation, { zone: true, rows: 3, ph: 'Un produit que vous utilisez, un projet de l\'entreprise, une valeur qui compte pour vous… NaoCV n\'invente jamais votre motivation.', aide: 'Laissé vide, un [emplacement à compléter] apparaît dans la lettre.' })}
      ${champ('Ce que vous voulez ajouter', 'apport', l.apport, { facult: true, zone: true, rows: 2, ph: 'Un exemple concret, une réussite réelle, une disponibilité…' })}
      <details class="plier"${l.offre ? ' open' : ''}><summary>Texte de l'offre (pour choisir vos missions les plus pertinentes)</summary>${champ('', 'offre', l.offre, { zone: true, rows: 6, ph: 'Collez l\'annonce (facultatif)' })}</details>
      <div class="boutons"><button class="btn primaire" data-act="generer-lettre">✨ ${l.paragraphes.length ? 'Régénérer la lettre' : 'Générer la lettre'}</button></div>
      ${l.paragraphes.length ? `<h4 class="sous">✏️ Relisez et modifiez chaque paragraphe</h4>
        <div class="paragraphes">${l.paragraphes.map((p, i) => `<div class="par-ed"><div class="par-tete"><small>${libellePar(i, l.paragraphes.length)}</small>
          <span><button class="icone" data-act="regenerer-par" data-i="${i}" title="Nouvelle proposition pour ce paragraphe">↻</button><button class="icone" data-act="retirer-par" data-i="${i}" title="Retirer">🗑️</button></span></div>
          <textarea data-par="${i}" rows="${Math.max(3, Math.ceil(p.length / 80))}" spellcheck="true" lang="fr">${esc(p)}</textarea></div>`).join('')}</div>
        <button class="btn petit fantome" data-act="ajouter-par">+ Paragraphe</button>` : ''}
    </section>
    <section class="lettre-droite">
      <div class="apercu-barre">
        <span class="etiq ${trous ? 'chaud' : 'vert'}" id="etatLettre">${trous ? `⚠️ ${trous} élément(s) à compléter` : '✓ Prête'}</span>
        <span class="etiq" id="motsLettre">${mots} mots · visez ${cible[0]}–${cible[1]}</span>
        <button class="btn petit" data-act="pdf-lettre">⬇️ PDF</button><button class="btn petit" data-act="docx-lettre">⬇️ DOCX</button>
        <button class="btn petit fantome danger-t" data-act="supprimer-lettre">🗑️</button>
      </div>
      <div class="apercu-cadre" id="apercuCadre"><div class="apercu-echelle" id="apercu"></div></div>
      <p class="apercu-note">Fichier : ${esc(NC.nomFichier('Lettre_Motivation', cv, l.entreprise))}.pdf — les [crochets surlignés] sont à compléter avant l'envoi.</p>
    </section>
  </div>`;
};

/* ============================================================
   CANDIDATURES
   ============================================================ */
NC.vues.candidatures = function () {
  const E = NC.ETAT, f = NC.UI.filtre;
  const liste = E.candidatures.filter(c => !f || c.statut === f).slice().sort((a, b) => (b.dateEnvoi || b.cree || '').localeCompare(a.dateEnvoi || a.cree || ''));
  const dues = relancesDues();
  return `<div class="tete-vue"><div><h2>📋 Mes candidatures</h2><p class="muted">Chaque envoi, son statut, sa relance, son entretien — et le CV et la lettre utilisés.</p></div>
    <div class="boutons"><button class="btn primaire" data-act="nouvelle-candidature">+ Ajouter une candidature</button></div></div>
  ${dues.length ? `<div class="bandeau-rappel">🔔 <b>${dues.length} relance${dues.length > 1 ? 's' : ''} à faire</b> : ${dues.map(c => `<button class="lien" data-act="modifier-cand" data-id="${c.id}">${esc(c.entreprise || c.poste)}</button>`).join(', ')}. Un e-mail court et poli, 7 à 10 jours après l'envoi, suffit.</div>` : ''}
  <div class="filtres"><button class="choix-b ${!f ? 'on' : ''}" data-act="filtre" data-f="">Toutes <b>${E.candidatures.length}</b></button>${NC.STATUTS.map(s => { const n = E.candidatures.filter(c => c.statut === s[0]).length; return `<button class="choix-b ${f === s[0] ? 'on' : ''}" data-act="filtre" data-f="${s[0]}" style="--s:${s[2]}"><i class="rond" style="background:${s[2]}"></i>${s[1]} <b>${n}</b></button>`; }).join('')}</div>
  ${liste.length ? `<div class="carte tableau-cand"><table class="cands">
    <thead><tr><th>Poste · entreprise</th><th>Contrat</th><th>Envoyée le</th><th>Statut</th><th>Relance</th><th>Entretien</th><th>Documents</th><th></th></tr></thead>
    <tbody>${liste.map(c => {
      const cv = NC.cvParId(c.cvId), l = NC.lettreParId(c.lettreId), s = statut(c.statut);
      const due = !FINIS.includes(c.statut) && c.dateRelance && c.dateRelance <= NC.aujourdhui();
      return `<tr>
        <td data-l="Poste"><b>${esc(c.poste || '—')}</b><small>${esc(c.entreprise || '')}${c.lien ? ` · <a href="${esc(c.lien)}" target="_blank" rel="noopener">offre ↗</a>` : ''}</small></td>
        <td data-l="Contrat">${esc(c.contrat || '—')}</td>
        <td data-l="Envoyée le">${c.dateEnvoi ? NC.fmtDate(c.dateEnvoi) : '—'}</td>
        <td data-l="Statut"><select class="statut-sel" data-act-change="statut" data-id="${c.id}" style="--s:${s[2]}">${NC.STATUTS.map(x => `<option value="${x[0]}"${x[0] === c.statut ? ' selected' : ''}>${x[1]}</option>`).join('')}</select></td>
        <td data-l="Relance" class="${due ? 'chaud' : ''}">${c.dateRelance ? (due ? '🔔 ' : '') + NC.fmtDate(c.dateRelance) : '—'}</td>
        <td data-l="Entretien">${c.dateEntretien ? '🤝 ' + NC.fmtDate(c.dateEntretien) + (c.heureEntretien ? ' · ' + esc(c.heureEntretien) : '') : '—'}</td>
        <td data-l="Documents"><small>${cv ? '📄 ' + esc(cv.nom) : '—'}${l ? '<br>✉️ ' + esc(l.entreprise || 'lettre') : ''}</small></td>
        <td class="act"><button class="icone" data-act="modifier-cand" data-id="${c.id}" title="Modifier">✏️</button><button class="icone" data-act="supprimer-cand" data-id="${c.id}" title="Supprimer">🗑️</button></td></tr>`;
    }).join('')}</tbody></table></div>`
    : `<div class="carte">${vide('📋', f ? 'Aucune candidature avec ce statut' : 'Aucune candidature suivie', 'Ajoutez chaque candidature pour ne plus oublier une relance, et savoir quel CV vous avez envoyé.', '<button class="btn primaire" data-act="nouvelle-candidature">+ Ajouter une candidature</button>')}</div>`}`;
};
NC.fenetreCandidature = function (c, nouveau) {
  NC.brouillonCand = c;
  const E = NC.ETAT;
  ouvrirModale(`<h3 id="modaleTitre">📋 ${nouveau ? 'Nouvelle candidature' : 'Modifier la candidature'}</h3>
  <div data-cible="cand"><div class="grille2">
    ${champ('Poste recherché', 'poste', c.poste, { req: true })}${champ('Entreprise', 'entreprise', c.entreprise, { liste: 'dlEntreprises' })}
    ${champ('Lien de l\'offre', 'lien', c.lien, { type: 'url', facult: true })}${champ('Type de contrat', 'contrat', c.contrat, { select: [['', '—']].concat(NC.CONTRATS.map(x => [x, x])) })}
    ${champ('Statut', 'statut', c.statut, { select: NC.STATUTS.map(s => [s[0], s[1]]) })}${champ('Date d\'envoi', 'dateEnvoi', c.dateEnvoi, { type: 'date', aide: 'La relance est proposée automatiquement 10 jours après.' })}
    ${champ('Date de relance', 'dateRelance', c.dateRelance, { type: 'date' })}
    <div class="grille2 serre">${champ('Date d\'entretien', 'dateEntretien', c.dateEntretien, { type: 'date' })}${champ('Heure', 'heureEntretien', c.heureEntretien, { type: 'time' })}</div>
    <label class="champ"><span>CV utilisé</span><select data-c="cvId"><option value="">—</option>${E.cvs.map(x => `<option value="${x.id}"${x.id === c.cvId ? ' selected' : ''}>${esc(x.nom)}</option>`).join('')}</select></label>
    <label class="champ"><span>Lettre utilisée</span><select data-c="lettreId"><option value="">—</option>${E.lettres.map(x => `<option value="${x.id}"${x.id === c.lettreId ? ' selected' : ''}>${esc((x.entreprise || 'Sans entreprise') + ' — ' + (x.poste || ''))}</option>`).join('')}</select></label>
  </div>${champ('Notes personnelles', 'notes', c.notes, { zone: true, rows: 3, ph: 'Contact, impressions, questions à préparer…' })}</div>
  <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="enregistrer-cand" data-nouveau="${nouveau ? 1 : 0}">Enregistrer</button></div>`, 'large');
};

/* ============================================================
   CALENDRIER DES ENTRETIENS ET RELANCES
   ============================================================ */
NC.vues.calendrier = function () {
  const mois = NC.UI.calMois || NC.moisCourant();
  const [a, m] = mois.split('-').map(Number);
  const premier = new Date(a, m - 1, 1), decal = (premier.getDay() + 6) % 7, nb = new Date(a, m, 0).getDate();
  const ev = evenements(), auj = NC.aujourdhui();
  const cases = [];
  for (let i = 0; i < decal; i++) cases.push('<div class="jour hors"></div>');
  for (let j = 1; j <= nb; j++) {
    const d = `${a}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
    const du = ev.filter(e => e.date === d);
    cases.push(`<div class="jour${d === auj ? ' auj' : ''}${du.length ? ' plein' : ''}"><span class="n">${j}</span>${du.map(e => `<button class="ev ev-${e.type}" data-act="modifier-cand" data-id="${e.id}" title="${esc(e.nom)}">${{ entretien: '🤝', relance: '🔔', envoi: '📤' }[e.type]} ${e.heure ? esc(e.heure) + ' ' : ''}${esc(e.nom)}</button>`).join('')}</div>`);
  }
  const avenir = ev.filter(e => e.date >= auj && e.type !== 'envoi').slice(0, 12);
  const prec = m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`, suiv = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
  return `<div class="tete-vue"><div><h2>📅 Entretiens et relances</h2><p class="muted">Vos rendez-vous et vos relances, tirés du suivi des candidatures.</p></div>
    <div class="boutons"><button class="btn primaire" data-act="nouvelle-candidature">+ Candidature</button></div></div>
  <div class="cal-grille">
    <section class="carte calendrier">
      <div class="cal-tete"><button class="icone" data-act="mois" data-m="${prec}" aria-label="Mois précédent">‹</button><h3>${NC.MOIS[m - 1]} ${a}</h3><button class="icone" data-act="mois" data-m="${suiv}" aria-label="Mois suivant">›</button>
        <button class="btn petit fantome" data-act="mois" data-m="${NC.moisCourant()}">Aujourd'hui</button></div>
      <div class="legende-cal"><span class="ev ev-entretien">🤝 Entretien</span><span class="ev ev-relance">🔔 Relance</span><span class="ev ev-envoi">📤 Envoi</span></div>
      <div class="semaine">${NC.JOURS_C.map(j => `<span>${j}</span>`).join('')}</div>
      <div class="mois">${cases.join('')}</div>
    </section>
    <section class="carte">
      <h3>À venir</h3>
      ${relancesDues().length ? `<div class="rappel">🔔 Relances en retard ou du jour : ${relancesDues().map(c => `<button class="lien" data-act="modifier-cand" data-id="${c.id}">${esc(c.entreprise || c.poste)}</button>`).join(', ')}</div>` : ''}
      ${avenir.length ? `<ul class="agenda">${avenir.map(e => `<li class="ev-${e.type}"><div class="date-bloc"><b>${+e.date.slice(8)}</b><small>${NC.MOIS_C[+e.date.slice(5, 7) - 1]}</small></div><div><b>${e.type === 'entretien' ? '🤝 Entretien' : '🔔 Relance'}${e.heure ? ' · ' + esc(e.heure) : ''}</b><span>${esc(e.nom)}</span><small>${e.date === auj ? 'aujourd\'hui' : 'dans ' + NC.ecartJours(auj, e.date) + ' jour(s)'}</small></div><button class="icone" data-act="modifier-cand" data-id="${e.id}">✏️</button></li>`).join('')}</ul>`
        : '<p class="muted">Rien de prévu. Ajoutez une date de relance ou d\'entretien à vos candidatures.</p>'}
    </section>
  </div>`;
};

/* ============================================================
   PRÊT À ENVOYER
   ============================================================ */
NC.vues.prets = function () {
  const E = NC.ETAT;
  return `<div class="tete-vue"><div><h2>✅ Mes documents prêts à envoyer</h2><p class="muted">La checklist finale, les bons formats et des noms de fichier professionnels.</p></div></div>
  <div class="encart">📌 <b>Toujours suivre le format demandé dans l'annonce</b> : PDF ou DOCX. Pour un formulaire en ligne ou un site d'emploi, envoyez la <b>version ATS</b> ; pour un e-mail à un recruteur, la <b>version visuelle</b>.</div>
  <h3 class="sous-vue">📄 CV</h3>
  <div class="prets">${E.cvs.map(cv => {
    const Lv = NC.verifier(cv, false), La = NC.verifier(cv, true), nom = NC.nomFichier('CV', cv, cv.cible.poste || cv.titre);
    const pv = NC.pret(Lv), pa = NC.pret(La);
    const pbs = Lv.filter(i => i.niveau === 'erreur' || i.niveau === 'alerte').slice(0, 3);
    return `<article class="carte pret">
      ${vignette(cv, 96, false)}
      <div class="pret-txt"><b>${esc(cv.nom)}</b><small class="muted">${esc(cv.titre || 'Sans titre')}</small>
        <div class="etiquettes"><span class="etiq ${pv ? 'vert' : 'chaud'}">${pv ? '✓' : '!'} Visuel ${NC.score(Lv)}%</span><span class="etiq ${pa ? 'vert' : 'chaud'}">${pa ? '✓' : '!'} ATS ${NC.score(La)}%</span></div>
        ${pbs.length ? `<ul class="mini-pb">${pbs.map(i => `<li class="${i.niveau}">${esc(i.titre)} — ${esc(i.detail)}</li>`).join('')}</ul>` : '<p class="bravo petit">Tout est au vert.</p>'}
        <code class="nom-f">${esc(nom)}.pdf</code></div>
      <div class="pret-act">
        <button class="btn petit" data-act="pdf" data-id="${cv.id}" data-ats="0">🎨 PDF visuel</button>
        <button class="btn petit" data-act="pdf" data-id="${cv.id}" data-ats="1">🤖 PDF ATS</button>
        <button class="btn petit" data-act="docx" data-id="${cv.id}" data-ats="0">📝 DOCX</button>
        <button class="btn petit fantome" data-act="aller" data-vue="cv" data-etape="verif" data-id="${cv.id}">Vérifier</button>
      </div></article>`;
  }).join('')}</div>
  <h3 class="sous-vue">✉️ Lettres de motivation</h3>
  ${E.lettres.length ? `<div class="prets">${E.lettres.map(l => {
    const cv = NC.cvParId(l.cvId) || NC.cvPrincipal(), t = NC.trousLettre(l), ok = l.paragraphes.length && !t;
    return `<article class="carte pret"><div class="pret-em">✉️</div>
      <div class="pret-txt"><b>${esc(l.entreprise || 'Sans entreprise')} — ${esc(l.poste || 'poste ?')}</b><small class="muted">Ton ${esc((NC.TONS.find(x => x[0] === l.ton) || ['', ''])[1].toLowerCase())} · ${l.format === 'court' ? 'courte' : 'développée'}</small>
        <div class="etiquettes"><span class="etiq ${ok ? 'vert' : 'chaud'}">${ok ? '✓ Prête' : !l.paragraphes.length ? 'Pas encore générée' : `⚠️ ${t} élément(s) à compléter`}</span></div>
        <code class="nom-f">${esc(NC.nomFichier('Lettre_Motivation', cv, l.entreprise))}.pdf</code></div>
      <div class="pret-act"><button class="btn petit" data-act="pdf-lettre" data-id="${l.id}">⬇️ PDF</button><button class="btn petit" data-act="docx-lettre" data-id="${l.id}">⬇️ DOCX</button><button class="btn petit fantome" data-act="ouvrir-lettre" data-id="${l.id}">Relire</button></div></article>`;
  }).join('')}</div>` : `<div class="carte">${vide('✉️', 'Aucune lettre', 'Créez une lettre à partir de votre CV et d\'une offre.', '<button class="btn primaire" data-act="nouvelle-lettre">+ Créer une lettre</button>')}</div>`}
  <div class="carte astuces"><h3>🧾 Avant d'appuyer sur « Envoyer »</h3><ul class="puces-simple">
    <li>Le nom du fichier est professionnel : <code>CV_Prenom_Nom_Poste.pdf</code>.</li>
    <li>Le format est celui demandé par l'annonce (PDF ou DOCX).</li>
    <li>L'e-mail d'accompagnement est court : objet clair, 3 à 5 lignes, pièces jointes nommées.</li>
    <li>La candidature est ajoutée au suivi, avec une date de relance.</li></ul></div>`;
};
