/* ============================================================
   NaoCV — le moteur : modèles de CV, version ATS, vérifications,
   reformulation des missions, analyse d'une offre, lettre de
   motivation, import d'un ancien CV et export Word.
   Règle d'or : rien n'est inventé. Ce qui manque devient une
   [question à compléter], jamais une affirmation.
   ============================================================ */
'use strict';

/* ---------- Les modèles ---------- */
NC.MODELES = [
  { id: 'classique', nom: 'Classique', famille: 'une', police: 'Georgia', desc: 'Une colonne, sobre et intemporel.', ordre: ['profil', 'exp', 'form', 'comp', 'lang', 'certif', 'projets', 'interets'] },
  { id: 'moderne', nom: 'Moderne', famille: 'gauche', police: 'Calibri', desc: 'Colonne latérale aux couleurs choisies.', ordre: ['profil', 'exp', 'form', 'certif', 'projets'] },
  { id: 'elegant', nom: 'Élégant', famille: 'une', police: 'Garamond', desc: 'En-tête centré, filets fins, petites capitales.', ordre: ['profil', 'exp', 'form', 'comp', 'lang', 'certif', 'projets', 'interets'] },
  { id: 'creatif', nom: 'Créatif', famille: 'bandeau', police: 'Trebuchet MS', desc: 'Bandeau affirmé et frise chronologique.', ordre: ['profil', 'exp', 'comp', 'form', 'projets', 'lang', 'certif', 'interets'] },
  { id: 'minimaliste', nom: 'Minimaliste', famille: 'une', police: 'Helvetica', desc: 'Beaucoup d\'air, une seule touche de couleur.', ordre: ['profil', 'exp', 'form', 'comp', 'lang', 'certif', 'projets', 'interets'] },
  { id: 'professionnel', nom: 'Professionnel', famille: 'droite', police: 'Calibri', desc: 'Corporate : filet de marque, colonne à droite.', ordre: ['profil', 'exp', 'form', 'certif', 'projets'] },
  { id: 'etudiant', nom: 'Étudiant', famille: 'gauche', police: 'Segoe UI', desc: 'La formation et les projets d\'abord.', ordre: ['profil', 'form', 'projets', 'exp', 'certif'], clair: true },
  { id: 'alternance', nom: 'Alternance', famille: 'bandeau', police: 'Calibri', desc: 'Rythme et disponibilité mis en avant.', ordre: ['profil', 'form', 'exp', 'comp', 'projets', 'lang', 'certif', 'interets'], dispo: true },
  { id: 'cadre', nom: 'Cadre', famille: 'bandeau', police: 'Cambria', desc: 'En-tête sombre, résultats clés en tête.', ordre: ['profil', 'forts', 'exp', 'form', 'comp', 'lang', 'certif', 'interets'], sombre: true },
  { id: 'reconversion', nom: 'Reconversion', famille: 'gauche', police: 'Calibri', desc: 'Compétences transférables d\'abord.', ordre: ['profil', 'comp', 'form', 'exp', 'projets', 'certif'], compPrincipal: true }
];
NC.modele = id => NC.MODELES.find(m => m.id === id) || NC.MODELES[1];
NC.POLICES = ['Calibri', 'Arial', 'Helvetica', 'Georgia', 'Garamond', 'Cambria', 'Tahoma', 'Verdana', 'Trebuchet MS', 'Segoe UI'];
NC.POLICES_ATS = ['Arial', 'Calibri', 'Georgia', 'Tahoma', 'Verdana'];
/* Guillemets simples : la pile de polices va dans un attribut style="…". */
const pilePolice = p => `'${p}', ${/Georgia|Garamond|Cambria/.test(p) ? "Georgia, 'Times New Roman', serif" : "Calibri, Carlito, Arial, Helvetica, sans-serif"}`;
NC.pilePolice = pilePolice;

/* Titres de rubriques : standards, pour les robots comme pour les humains. */
NC.TITRES = { profil: 'Profil', exp: 'Expérience professionnelle', form: 'Formation', comp: 'Compétences', lang: 'Langues', certif: 'Certifications', projets: 'Projets', interets: 'Centres d\'intérêt', forts: 'Réalisations clés', infos: 'Informations pratiques', contact: 'Contact', logiciels: 'Logiciels' };

const ICO = {
  tel: '<path d="M6.5 3.5h3l1.6 4.2-2 1.3a11 11 0 0 0 5.9 5.9l1.3-2 4.2 1.6v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  lieu: '<path d="M12 21s-6.8-6-6.8-11a6.8 6.8 0 0 1 13.6 0c0 5-6.8 11-6.8 11z"/><circle cx="12" cy="10" r="2.4"/>',
  lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  in: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 10.5V17M8 7.2v.1M12 17v-6.5M12 13.5a2.6 2.6 0 0 1 5.2 0V17"/>',
  voiture: '<path d="M5 15.5l1.6-5a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4l1.6 5"/><rect x="3.5" y="15" width="17" height="4.5" rx="1.4"/><circle cx="7.5" cy="19.5" r="1.2"/><circle cx="16.5" cy="19.5" r="1.2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  route: '<path d="M4 19c4 0 4-6 8-6s4-6 8-6"/><circle cx="4" cy="19" r="1.6"/><circle cx="20" cy="7" r="1.6"/>'
};
const ico = k => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
const lienCourt = u => String(u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

/* ---------- Les rubriques d'un CV visuel ---------- */
function blocsVisuels(cv, M) {
  const P = cv.perso, st = cv.style, B = {};
  const h2 = k => `<h2><span>${NC.TITRES[k]}</span></h2>`;
  const liste = a => a.filter(Boolean);
  const marques = st.couleursEntreprises !== false;

  if (cv.accroche) B.profil = `<section class="s s-profil">${h2('profil')}<p>${esc(cv.accroche)}</p></section>`;

  if (cv.experiences.length) {
    B.exp = `<section class="s s-exp">${h2('exp')}${cv.experiences.map(x => {
      const coul = x.couleur ? NC.lisible(x.couleur) : '';
      const mono = !marques ? '' : x.logo
        ? `<span class="mono logo"><img src="${x.logo}" alt=""></span>`
        : (x.entreprise ? `<span class="mono" style="background:${x.couleur || 'var(--c1)'};color:${x.couleur ? NC.texteSur(x.couleur) : '#fff'}">${esc(NC.initiales(x.entreprise))}</span>` : '');
      const ent = liste([x.entreprise ? `<b>${esc(x.entreprise)}</b>` : '', esc(x.ville), esc(x.contrat)]).join(' · ');
      return `<div class="xp${marques && coul ? ' marque' : ''}"${marques && coul ? ` style="--marque:${coul};--marque-brut:${x.couleur}"` : ''}>
        <div class="xp-tete">${mono}<div class="xp-titres"><div class="xp-poste">${esc(x.poste || 'Poste')}</div>${ent ? `<div class="xp-ent">${ent}</div>` : ''}</div>
        <div class="xp-date">${esc(NC.periode(x, true))}</div></div>
        ${x.missions.filter(Boolean).length ? `<ul>${x.missions.filter(Boolean).map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
        ${x.outils ? `<div class="xp-plus"><span>Outils</span> ${esc(x.outils)}</div>` : ''}
        ${x.resultats ? `<div class="xp-plus"><span>Résultats</span> ${esc(x.resultats)}</div>` : ''}
        ${x.competences ? `<div class="xp-plus"><span>Compétences</span> ${esc(x.competences)}</div>` : ''}
      </div>`;
    }).join('')}</section>`;
  }

  const forts = cv.experiences.filter(x => x.resultats);
  if (forts.length) B.forts = `<section class="s s-forts">${h2('forts')}<ul>${forts.map(x => `<li>${esc(x.resultats)}${x.entreprise ? ` <span class="gris">— ${esc(x.entreprise)}</span>` : ''}</li>`).join('')}</ul></section>`;

  if (cv.formations.length) {
    B.form = `<section class="s s-form">${h2('form')}${cv.formations.map(f => `<div class="fo">
      <div class="xp-tete"><div class="xp-titres"><div class="xp-poste">${esc(f.diplome || 'Diplôme')}</div>
      <div class="xp-ent">${liste([f.ecole ? `<b>${esc(f.ecole)}</b>` : '', esc(f.ville), esc(f.mention)]).join(' · ')}</div></div>
      <div class="xp-date">${esc(NC.periode(f, true))}</div></div>
      ${f.details ? `<p class="fo-det">${esc(f.details)}</p>` : ''}</div>`).join('')}</section>`;
  }

  const puces = a => a.map(t => `<span class="puce">${esc(t)}</span>`).join('');
  if (cv.compTech.length || cv.compRel.length || cv.logiciels.length) {
    B.comp = `<section class="s s-comp">${h2('comp')}
      ${cv.compTech.length ? `<div class="groupe"><h3>Techniques</h3><div class="puces">${puces(cv.compTech)}</div></div>` : ''}
      ${cv.logiciels.length ? `<div class="groupe"><h3>Logiciels</h3><div class="puces">${puces(cv.logiciels)}</div></div>` : ''}
      ${cv.compRel.length ? `<div class="groupe"><h3>Relationnelles</h3><div class="puces">${puces(cv.compRel)}</div></div>` : ''}</section>`;
  }
  if (cv.langues.length) B.lang = `<section class="s s-lang">${h2('lang')}<ul class="lignes">${cv.langues.map(l => `<li><b>${esc(l.langue)}</b> <span>${esc(l.niveau)}</span></li>`).join('')}</ul></section>`;
  if (cv.certifications.length) B.certif = `<section class="s s-certif">${h2('certif')}<ul class="lignes">${cv.certifications.map(c => `<li><b>${esc(c.nom)}</b> <span>${esc(liste([c.organisme, c.date]).join(' · '))}</span></li>`).join('')}</ul></section>`;
  if (cv.projets.length) B.projets = `<section class="s s-projets">${h2('projets')}${cv.projets.map(p => `<div class="pj"><div class="xp-poste">${esc(p.titre)}${p.contexte ? ` <span class="gris">· ${esc(p.contexte)}</span>` : ''}</div>${p.description ? `<p>${esc(p.description)}</p>` : ''}${p.lien ? `<div class="gris">${esc(lienCourt(p.lien))}</div>` : ''}</div>`).join('')}</section>`;
  if (cv.interets.length) B.interets = `<section class="s s-interets">${h2('interets')}<p>${cv.interets.map(esc).join(' · ')}</p></section>`;

  const infos = liste([P.permis ? ico('voiture') + esc(P.permis) : '', P.mobilite ? ico('route') + 'Mobilité : ' + esc(P.mobilite) : '', P.dispo ? ico('cal') + 'Disponibilité : ' + esc(P.dispo) : '']);
  if (infos.length) B.infos = `<section class="s s-infos">${h2('infos')}<ul class="lignes infos">${infos.map(i => `<li>${i}</li>`).join('')}</ul></section>`;

  const contacts = liste([
    P.tel ? `<li>${ico('tel')}${esc(P.tel)}</li>` : '', P.email ? `<li>${ico('mail')}${esc(P.email)}</li>` : '',
    P.ville ? `<li>${ico('lieu')}${esc(P.ville)}</li>` : '', P.linkedin ? `<li>${ico('in')}${esc(lienCourt(P.linkedin))}</li>` : '',
    P.portfolio ? `<li>${ico('lien')}${esc(lienCourt(P.portfolio))}</li>` : '']);
  B.contacts = contacts.length ? `<ul class="contacts">${contacts.join('')}</ul>` : '';
  B.contactSection = contacts.length ? `<section class="s s-contact">${h2('contact')}${B.contacts}</section>` : '';
  B.photo = st.photo && P.photo ? `<img class="photo" src="${P.photo}" alt="">` : '';
  B.nom = `<div class="nom">${esc(P.prenom || 'Prénom')} <b>${esc(P.nom || 'Nom')}</b></div>`;
  B.titre = `<div class="titre">${esc(cv.titre || 'Titre professionnel recherché')}</div>`;
  B.dispoBandeau = M.dispo && P.dispo ? `<div class="dispo-bandeau">${ico('cal')} Disponibilité : ${esc(P.dispo)}</div>` : '';
  return B;
}

/* Les variables de couleur d'un CV : une couleur de marque trop claire est assombrie pour le texte. */
function variablesCouleur(cv) {
  const st = cv.style, brut = st.couleur || '#1F3A68';
  const c1 = NC.lisible(brut), c2 = st.couleur2 || brut;
  return `--c1:${c1};--c1-brut:${brut};--c2:${c2};--c1-pale:${NC.melange(c1, '#FFFFFF', .9)};--c1-voile:${NC.melange(c1, '#FFFFFF', .95)};--c1-sombre:${NC.melange(c1, '#000000', .38)};--police:${pilePolice(st.police || 'Calibri')};`;
}

/* ---------- Rendu d'un CV (visuel ou ATS) ---------- */
NC.rendreCV = function (cv, ats) {
  if (ats) return rendreATS(cv);
  const M = NC.modele(cv.style.modele), B = blocsVisuels(cv, M);
  const ordre = M.ordre.filter(k => B[k]);
  let corps;
  if (M.famille === 'gauche' || M.famille === 'droite') {
    const cote = ['contactSection', 'infos', ...(M.compPrincipal ? [] : ['comp']), 'lang', 'interets'].filter(k => B[k]).map(k => B[k]).join('');
    const principal = ordre.filter(k => !(k === 'comp' && !M.compPrincipal)).map(k => B[k]).join('');
    corps = `<div class="fond-cote"></div><div class="colonnes">
      <aside class="cote">${B.photo}${M.famille === 'gauche' ? `<div class="cote-nom">${B.nom}${B.titre}</div>` : ''}${cote}</aside>
      <main class="principal">${M.famille === 'droite' ? `<header class="entete">${B.nom}${B.titre}</header>` : ''}${principal}</main></div>`;
  } else if (M.famille === 'bandeau') {
    corps = `<header class="bandeau">${B.photo}<div class="bandeau-txt">${B.nom}${B.titre}${B.contacts}</div></header>${B.dispoBandeau}
      <div class="corps">${ordre.map(k => B[k]).join('')}${B.infos || ''}</div>`;
  } else {
    corps = `<header class="entete">${B.photo}<div class="entete-txt">${B.nom}${B.titre}${B.contacts}</div></header>
      <div class="corps">${ordre.map(k => B[k]).join('')}${B.infos || ''}</div>`;
  }
  return `<article class="feuille m-${M.id} f-${M.famille}${M.clair ? ' clair' : ''}${M.sombre ? ' sombre' : ''}" style="${variablesCouleur(cv)}">${corps}</article>`;
};

function rendreATS(cv) {
  const P = cv.perso, st = cv.style, M = NC.modele(st.modele);
  const liste = a => a.filter(Boolean);
  const S = {};
  if (cv.accroche) S.profil = `<h2>Profil</h2><p>${esc(cv.accroche)}</p>`;
  if (cv.experiences.length) S.exp = `<h2>Expérience professionnelle</h2>${cv.experiences.map(x => `<div class="ats-bloc">
    <h3>${esc(liste([x.poste, x.entreprise]).join(' — '))}${x.ville ? ', ' + esc(x.ville) : ''}</h3>
    <p class="ats-date">${esc(NC.maj1(liste([NC.periode(x), x.contrat]).join(' · ')))}</p>
    ${x.missions.filter(Boolean).length ? `<ul>${x.missions.filter(Boolean).map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
    ${x.outils ? `<p>Outils : ${esc(x.outils)}</p>` : ''}${x.resultats ? `<p>Résultats : ${esc(x.resultats)}</p>` : ''}${x.competences ? `<p>Compétences développées : ${esc(x.competences)}</p>` : ''}</div>`).join('')}`;
  if (cv.formations.length) S.form = `<h2>Formation</h2>${cv.formations.map(f => `<div class="ats-bloc">
    <h3>${esc(liste([f.diplome, f.ecole]).join(' — '))}${f.ville ? ', ' + esc(f.ville) : ''}</h3>
    <p class="ats-date">${esc(NC.maj1(liste([NC.periode(f), f.mention]).join(' · ')))}</p>${f.details ? `<p>${esc(f.details)}</p>` : ''}</div>`).join('')}`;
  if (cv.compTech.length || cv.compRel.length || cv.logiciels.length) S.comp = `<h2>Compétences</h2>
    ${cv.compTech.length ? `<p>Compétences techniques : ${esc(cv.compTech.join(', '))}</p>` : ''}
    ${cv.logiciels.length ? `<p>Logiciels : ${esc(cv.logiciels.join(', '))}</p>` : ''}
    ${cv.compRel.length ? `<p>Compétences relationnelles : ${esc(cv.compRel.join(', '))}</p>` : ''}`;
  if (cv.langues.length) S.lang = `<h2>Langues</h2>${cv.langues.map(l => `<p>${esc(l.langue)} : ${esc(l.niveau)}</p>`).join('')}`;
  if (cv.certifications.length) S.certif = `<h2>Certifications</h2>${cv.certifications.map(c => `<p>${esc(liste([c.nom, c.organisme, c.date]).join(' — '))}</p>`).join('')}`;
  if (cv.projets.length) S.projets = `<h2>Projets</h2>${cv.projets.map(p => `<div class="ats-bloc"><h3>${esc(liste([p.titre, p.contexte]).join(' — '))}</h3>${p.description ? `<p>${esc(p.description)}</p>` : ''}${p.lien ? `<p>${esc(p.lien)}</p>` : ''}</div>`).join('')}`;
  if (cv.interets.length) S.interets = `<h2>Centres d'intérêt</h2><p>${esc(cv.interets.join(', '))}</p>`;
  const ordre = [...M.ordre.filter(k => k !== 'forts'), 'comp', 'lang', 'certif', 'projets', 'interets'].filter((k, i, a) => a.indexOf(k) === i && S[k]);
  const contacts = liste([P.ville, P.tel, P.email]).map(esc).join(' · ');
  const liens = liste([P.linkedin, P.portfolio]).map(esc).join(' · ');
  const pratique = liste([P.permis, P.mobilite ? 'Mobilité : ' + P.mobilite : '', P.dispo ? 'Disponibilité : ' + P.dispo : '']).map(esc).join(' · ');
  return `<article class="feuille ats" style="--police:${pilePolice(NC.POLICES_ATS.includes(st.atsPolice) ? st.atsPolice : 'Arial')}">
    <h1>${esc(nomComplet(cv) || 'Prénom Nom')}</h1><p class="ats-titre">${esc(cv.titre || 'Titre professionnel')}</p>
    ${contacts ? `<p>${contacts}</p>` : ''}${liens ? `<p>${liens}</p>` : ''}${pratique ? `<p>${pratique}</p>` : ''}
    ${ordre.map(k => S[k]).join('')}</article>`;
}

/* Tout le texte d'un CV, pour chercher les mots-clés d'une offre. */
NC.texteCV = function (cv) {
  const t = [cv.titre, cv.accroche, cv.compTech.join(' '), cv.compRel.join(' '), cv.logiciels.join(' '), cv.interets.join(' '),
    cv.perso.permis, cv.perso.mobilite, cv.perso.dispo];
  cv.experiences.forEach(x => t.push(x.poste, x.entreprise, x.contrat, x.missions.join(' '), x.outils, x.resultats, x.competences));
  cv.formations.forEach(f => t.push(f.diplome, f.ecole, f.details, f.mention));
  cv.langues.forEach(l => t.push(l.langue, l.niveau));
  cv.certifications.forEach(c => t.push(c.nom, c.organisme));
  cv.projets.forEach(p => t.push(p.titre, p.contexte, p.description));
  return ' ' + norm(t.filter(Boolean).join(' \n ')) + ' ';
};

/* ---------- Durée d'expérience (périodes qui se chevauchent comptées une fois) ---------- */
NC.moisExperience = function (cv) {
  const mois = new Set();
  cv.experiences.forEach(x => {
    if (!x.debut || /bénévolat|benevolat/i.test(x.contrat || '')) return;
    let [a, m] = x.debut.split('-').map(Number); m = m || 1;
    const fin = x.enCours ? NC.moisCourant() : (x.fin || x.debut);
    const [a2, m2] = fin.split('-').map(Number);
    let garde = 0;
    while ((a < a2 || (a === a2 && m <= (m2 || 12))) && garde++ < 720) { mois.add(a * 12 + m); m++; if (m > 12) { m = 1; a++; } }
  });
  return mois.size;
};
NC.dureeTexte = function (n) {
  if (n >= 24) return Math.floor(n / 12) + ' ans d\'expérience';
  if (n >= 12) return 'un an d\'expérience';
  if (n > 0) return n + ' mois d\'expérience';
  return '';
};
const et = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1];
NC.et = et;

/* ---------- Idées d'accroche : uniquement à partir de ce qui est saisi ---------- */
NC.ideesAccroche = function (cv, cible) {
  const titre = (cible && cible.poste) || cv.titre, idees = [];
  if (!titre) return idees;
  const duree = NC.dureeTexte(NC.moisExperience(cv));
  const comps = cv.compTech.slice(0, 3).map(c => NC.min1(c)), rels = cv.compRel.slice(0, 2).map(c => NC.min1(c));
  const exps = cv.experiences.slice().sort((a, b) => NC.cleTri(b).localeCompare(NC.cleTri(a)));
  const der = exps[0], form = cv.formations.find(f => f.enCours) || cv.formations[0];
  const dispo = cv.perso.dispo ? ` Disponibilité : ${cv.perso.dispo}.` : '';
  idees.push({ label: 'Synthétique', texte: `${titre}${duree ? ' avec ' + duree : ''}${comps.length ? ', avec des compétences en ' + et(comps) : ''}.${dispo}` });
  if (der && der.poste && der.entreprise) {
    idees.push({ label: 'Parcours', texte: `${duree ? 'Après ' + duree + ', dont' : 'Après'} un poste de ${NC.min1(der.poste)} chez ${der.entreprise}, je souhaite mettre ${comps.length ? 'mes compétences en ' + et(comps) : 'mon expérience'} au service d'un poste de ${NC.min1(titre)}.${rels.length ? ' Mes atouts : ' + et(rels) + '.' : ''}` });
  }
  if (form && form.diplome) {
    idees.push({ label: 'Étudiant · alternance', texte: `${form.enCours ? 'Actuellement en formation' : 'Diplôme obtenu'} : ${form.diplome}${form.ecole ? ' (' + form.ecole + ')' : ''}. Je recherche un poste de ${NC.min1(titre)}.${rels.length ? ' Mes atouts : ' + et(rels) + '.' : ''}${dispo}` });
  }
  if (der && der.poste && norm(der.poste).split(' ')[0] !== norm(titre).split(' ')[0]) {
    idees.push({ label: 'Reconversion', texte: `En reconversion vers le métier de ${NC.min1(titre)}, je m'appuie sur mon expérience de ${NC.min1(der.poste)}${comps.concat(rels).length ? ' et sur des compétences transférables : ' + et(comps.concat(rels).slice(0, 4)) : ''}.` });
  }
  return idees;
};

/* ---------- Reformuler une mission ---------- */
function deObjet(o) {
  const t = o.trim();
  let m;
  if ((m = t.match(/^les\s+(.*)$/i))) return 'des ' + m[1];
  if ((m = t.match(/^le\s+(.*)$/i))) return 'du ' + m[1];
  if ((m = t.match(/^la\s+(.*)$/i))) return 'de la ' + m[1];
  if ((m = t.match(/^l['’](.*)$/i))) return "de l'" + m[1];
  if ((m = t.match(/^(des|du|de la|de l['’]|d['’]|de)\s*(.*)$/i))) return t;
  return (/^[aeiouyhéèêàâîôû]/i.test(t) ? "d'" : 'de ') + t;
}
function objetDepuisDe(article, reste) {
  const a = norm(article).trim();
  if (a === 'des') return 'les ' + reste;
  if (a === 'du') return 'le ' + reste;
  if (a === 'de la') return 'la ' + reste;
  if (a === "de l'") return "l'" + reste;
  /* « vente de produits » → « des produits » ; « gestion de stock » reste sans article. */
  const w = (reste.split(/\s+/)[0] || '');
  if (/^(un|une|mon|ma|mes|son|sa|ses|leur|leurs|ce|cet|cette|ces|plusieurs|nombreu\w*|diff[ée]rent\w*|\d+)$/i.test(w)) return reste;
  if (/[sx]$/i.test(w) && w.length > 3) return 'des ' + reste;
  return NU + reste;
}
const NU = '\u0001';   /* marque un complément sans article : seule la forme « Assurer la gestion de … » lui convient */
function joindre(verbe, objet) {
  if (!objet) return verbe;
  if (/ à$/.test(verbe)) {
    const o = objet.replace(/^les\s+/i, 'aux ').replace(/^le\s+/i, 'au ');
    return /^(aux|au) /.test(o) ? verbe.slice(0, -2) + ' ' + o : verbe + ' ' + o;
  }
  if (/ de$/.test(verbe)) return verbe.slice(0, -3) + ' ' + deObjet(objet);
  return verbe + ' ' + objet;
}
const PRENDRE = ['Prendre en charge', null, 'prise en charge', 'la ', 'Piloter', ''];
function lexique(o) { let r = o; NC.LEXIQUE.forEach(([re, rem]) => { r = r.replace(re, rem); }); return r; }
function verbeParNom(nom) { return NC.VERBES.find(v => v[0] === nom); }
function deviner(objet) {
  const n = norm(objet);
  for (const [re, v] of NC.INDICES) if (re.test(n)) return verbeParNom(v);
  return null;
}

NC.reformuler = function (ligne) {
  const brut = String(ligne || '').trim().replace(/^[\-–—•*·>\s]+/, '').replace(/[.;\s]+$/, '');
  const avis = [];
  if (!brut) return { variantes: [], avis };
  let t = brut.replace(/^(j['’]ai|j['’]|je|nous avons|nous|on|il a|elle a|il|elle)\s+/i, '');
  let verbe = null, objet = t, faible = false, m;

  if ((m = t.match(/^(?:m['’]|s['’]|me |se )?occup\S*\s+(de la |de l['’]|des |du |de |d['’])(.*)$/i))) { faible = true; objet = objetDepuisDe(m[1], m[2]); }
  else if ((m = t.match(/^(?:étais |etais |être |etre )?(?:en charge|responsable|chargée?)\s+(de la |de l['’]|des |du |de |d['’])(.*)$/i))) { faible = true; objet = objetDepuisDe(m[1], m[2]); }
  else {
    const mots = t.split(/\s+/), w = norm(mots[0]).replace(/[^a-z']/g, '');
    const w3 = norm(mots.slice(0, 3).join(' '));
    const cle3 = ['mise en place', 'mise en rayon'].find(k => w3.indexOf(k) === 0);
    if (cle3) {
      verbe = NC.NOMS_ACTION[cle3] || verbeParNom('Mettre en place');
      const reste = mots.slice(3).join(' ');
      const d = reste.match(/^(de la |de l['’]|des |du |de |d['’])(.*)$/i);
      objet = d ? objetDepuisDe(d[1], d[2]) : reste;
    } else if (NC.FAIBLES.test(w)) { faible = true; objet = mots.slice(1).join(' ').replace(/^(de la |de l['’]|des |du |de |d['’])/i, a => objetDepuisDe(a, '')); }
    else {
      if (NC.NOMS_ACTION[w]) {
        verbe = NC.NOMS_ACTION[w];
        const reste = mots.slice(1).join(' ');
        const d = reste.match(/^(de la |de l['’]|des |du |de |d['’])(.*)$/i);
        objet = d ? objetDepuisDe(d[1], d[2]) : reste;
      } else {
        verbe = NC.VERBES.find(v => v[1] && v[1].test(w)) || null;
        /* Un autre verbe à l'infinitif (« Établir », « Élaborer »…) : on le garde tel quel. */
        if (!verbe && /^[a-z]{2,}(er|ir|re|oir)$/.test(w) && !NC.VIDES.has(w) && mots.length > 1) {
          const v0 = NC.maj1(mots[0].toLowerCase());
          verbe = [v0, null, '', '', v0, ''];
        }
        if (verbe) objet = mots.slice(1).join(' ');
      }
    }
  }

  if (!verbe) {
    const g = deviner(objet), w0 = norm(t.split(/\s+/)[0] || '');
    verbe = g || (/^aid/.test(w0) ? verbeParNom('Accompagner') : /occup|charge|responsable/.test(norm(t)) ? PRENDRE : verbeParNom('Réaliser'));
    if (faible) avis.push({ niveau: 'alerte', texte: `Verbe peu précis (« faire », « s'occuper de », « aider »…) : je propose « ${verbe[0]} » d'après le contenu. Vérifiez qu'il décrit bien votre action.` });
    else avis.push({ niveau: 'alerte', texte: `La ligne ne commence pas par un verbe d'action. Proposition : « ${verbe[0]} » — vérifiez qu'il correspond à ce que vous faisiez vraiment.` });
  }
  objet = objet.trim();
  const nu = objet.indexOf(NU) === 0;
  objet = objet.replace(NU, '');
  const inf = verbe[0];
  const variantes = [];
  const ajoute = (style, texte, note) => { texte = NC.maj1(texte.replace(/\s+/g, ' ')); if (texte && !variantes.some(v => v.texte === texte)) variantes.push({ style, texte, note }); };
  const objLex = lexique(objet);
  const prepo = /^(au|aux|à|a|en|sur|avec|dans|pour|auprès|aupres|chez|par|entre)\s/i.test(objet);
  const nominal = verbe[2] && objet && !prepo && !/^(Participer à|Contribuer à|Assurer)$/.test(verbe[0]);
  const chiffres = /\d/.test(brut);
  const finalite = verbe[5] && !chiffres ? ' ' + verbe[5] : '';
  const noteFin = finalite ? 'La finalité (« ' + verbe[5] + ' ») est générique : gardez-la seulement si elle est vraie pour vous.' : '';
  if (nu && nominal) {
    /* « gestion de stock » : la forme nominale est la seule naturelle. */
    ajoute('Simple', `Assurer ${verbe[3]}${verbe[2]} ${deObjet(objet)}`);
    ajoute('Professionnelle', `Assurer ${verbe[3]}${verbe[2]} ${deObjet(objLex)}${finalite}`, noteFin);
  } else {
    ajoute('Simple', joindre(inf, objet));
    if (nominal) ajoute('Professionnelle', `Assurer ${verbe[3]}${verbe[2]} ${deObjet(objLex)}`);
    else ajoute('Professionnelle', joindre(inf, objLex));
    ajoute('Impactante', joindre(prepo ? inf : (verbe[4] || inf), objLex) + finalite, noteFin);
  }

  const n = norm(brut), nbMots = brut.split(/\s+/).length;
  if (nbMots <= 2) avis.push({ niveau: 'alerte', texte: 'Très courte : précisez le contexte — pour qui ? avec quels outils ? à quelle fréquence ?' });
  else if (nbMots === 3) avis.push({ niveau: 'info', texte: 'Ligne courte : un détail de contexte (pour qui, avec quel outil) la rendrait plus parlante.' });
  if (NC.VAGUE.test(n)) avis.push({ niveau: 'alerte', texte: 'Formulation vague (« divers », « tâches », « aider »…) : décrivez l\'action précise, le contexte ou le résultat réel.' });
  if (!chiffres) avis.push({ niveau: 'info', texte: 'Pour aller plus loin : un repère réel (volume, fréquence, taille d\'équipe, résultat) rendrait la ligne plus concrète — seulement si vous le connaissez.' });
  return { variantes, avis };
};
NC.estVague = l => { const r = NC.reformuler(l); return r.avis.some(a => a.niveau === 'alerte'); };

/* ---------- Relecture : fautes fréquentes et typographie ---------- */
const REGLES_FAUTES = NC.FAUTES.map(([f, c]) => [new RegExp('(^|[^\\p{L}])(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^\\p{L}])', 'giu'), c, f]);
NC.relire = function (cv) {
  const champs = [['Titre', cv.titre], ['Accroche', cv.accroche]];
  cv.experiences.forEach((x, i) => { champs.push([`Expérience ${i + 1} · poste`, x.poste]); x.missions.forEach((m, j) => champs.push([`Expérience ${i + 1} · mission ${j + 1}`, m])); champs.push([`Expérience ${i + 1} · résultats`, x.resultats]); });
  cv.formations.forEach((f, i) => champs.push([`Formation ${i + 1}`, f.diplome], [`Formation ${i + 1} · détails`, f.details]));
  cv.projets.forEach((p, i) => champs.push([`Projet ${i + 1}`, p.description]));
  [['Compétences', cv.compTech.join(', ')], ['Compétences relationnelles', cv.compRel.join(', ')], ['Centres d\'intérêt', cv.interets.join(', ')]].forEach(c => champs.push(c));
  const r = [];
  champs.forEach(([ou, txt]) => {
    if (!txt) return;
    REGLES_FAUTES.forEach(([re, corr]) => { re.lastIndex = 0; let m; while ((m = re.exec(txt))) r.push({ ou, texte: `« ${m[2]} » → « ${corr} »`, faute: m[2], corr }); });
    if (/ {2,}/.test(txt)) r.push({ ou, texte: 'Double espace', faute: '  ', corr: ' ' });
    if (/\s,/.test(txt)) r.push({ ou, texte: 'Espace avant une virgule', faute: ' ,', corr: ',' });
    if (/,(?=[^\s\d])/.test(txt)) r.push({ ou, texte: 'Espace manquante après une virgule' });
    const rep = txt.match(/(^|[^\p{L}])(\p{L}{2,})\s+\2(?=$|[^\p{L}])/iu);
    if (rep && !/^(nous|vous)$/i.test(rep[2])) r.push({ ou, texte: `Mot répété : « ${rep[2]} ${rep[2]} »` });
  });
  if (cv.accroche && /^[a-zà-ÿ]/.test(cv.accroche.trim())) r.push({ ou: 'Accroche', texte: 'L\'accroche commence par une minuscule' });
  return r;
};
/* Corrige automatiquement une faute simple dans tout le CV. */
NC.corriger = function (cv, faute, corr) {
  const re = faute === '  ' ? / {2,}/g : new RegExp('(^|[^\\p{L}])(' + faute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^\\p{L}])', 'gu');
  const f = s => typeof s === 'string' ? (faute === '  ' ? s.replace(re, ' ') : faute === ' ,' ? s.replace(/\s+,/g, ',') : s.replace(re, (m, a) => a + corr)) : s;
  cv.titre = f(cv.titre); cv.accroche = f(cv.accroche);
  cv.experiences.forEach(x => { x.poste = f(x.poste); x.missions = x.missions.map(f); x.resultats = f(x.resultats); });
  cv.formations.forEach(x => { x.diplome = f(x.diplome); x.details = f(x.details); });
  cv.projets.forEach(p => { p.description = f(p.description); });
  ['compTech', 'compRel', 'interets'].forEach(k => { cv[k] = cv[k].map(f); });
};

/* ---------- Vérification avant export : la checklist « CV prêt à envoyer » ---------- */
NC.verifier = function (cv, ats) {
  const P = cv.perso, L = [], mois = NC.moisCourant();
  const item = (niveau, titre, detail, etape) => L.push({ niveau, titre, detail: detail || '', etape: etape || '' });
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(P.email || '');
  const telOk = (P.tel || '').replace(/\D/g, '').length >= 9;
  item(cv.titre ? 'ok' : 'erreur', 'Titre professionnel', cv.titre ? `« ${cv.titre} »` : 'Indiquez le poste que vous visez : c\'est la première chose lue.', 'poste');
  const manque = [!P.prenom && 'prénom', !P.nom && 'nom', !telOk && 'téléphone', !emailOk && 'e-mail valide', !P.ville && 'ville'].filter(Boolean);
  item(manque.length ? (manque.length > 1 || !P.ville ? 'erreur' : 'alerte') : 'ok', 'Coordonnées complètes', manque.length ? 'Il manque : ' + manque.join(', ') + '.' : 'Nom, téléphone, e-mail et ville sont là.', 'coord');
  item(cv.accroche ? (cv.accroche.length > 520 ? 'alerte' : 'ok') : 'alerte', 'Profil / accroche', cv.accroche ? (cv.accroche.length > 520 ? 'Un peu longue : visez 2 à 4 lignes.' : 'Présente.') : 'Deux à quatre lignes pour dire qui vous êtes et ce que vous cherchez.', 'poste');
  if (!cv.experiences.length && !cv.formations.length) item('erreur', 'Rubriques essentielles', 'Ajoutez au moins une expérience ou une formation.', 'exp');
  else {
    const vides = cv.experiences.filter(x => !x.poste || !x.entreprise || !x.missions.filter(Boolean).length);
    item(vides.length ? 'alerte' : 'ok', 'Expériences compréhensibles', vides.length ? `${vides.length} expérience(s) sans poste, entreprise ou mission.` : `${cv.experiences.length} expérience(s) détaillée(s).`, 'exp');
    if (!cv.formations.length) item('alerte', 'Formation', 'Aucune formation renseignée.', 'form');
  }
  const pbDates = [];
  [['exp', cv.experiences, x => x.poste || 'expérience'], ['form', cv.formations, f => f.diplome || 'formation']].forEach(([k, liste, nom]) => {
    liste.forEach(x => {
      if (!x.debut) pbDates.push(`${nom(x)} : date de début manquante`);
      else if (!x.enCours && x.fin && x.fin < x.debut) pbDates.push(`${nom(x)} : la fin est avant le début`);
      else if (!x.enCours && !x.fin) pbDates.push(`${nom(x)} : date de fin manquante (cochez « en cours » si c'est le cas)`);
      if (x.debut && x.debut > mois && k === 'exp') pbDates.push(`${nom(x)} : commence dans le futur`);
      if (!x.enCours && x.fin && x.fin > mois && k === 'exp') pbDates.push(`${nom(x)} : se termine dans le futur`);
    });
  });
  item(pbDates.length ? 'alerte' : 'ok', 'Dates cohérentes', pbDates.length ? pbDates.slice(0, 4).join(' · ') : 'Toutes les périodes se suivent logiquement.', 'exp');
  const enOrdre = liste => liste.every((x, i) => i === 0 || NC.cleTri(liste[i - 1]) >= NC.cleTri(x));
  const ordreOk = enOrdre(cv.experiences) && enOrdre(cv.formations);
  L.push({ niveau: ordreOk ? 'ok' : 'alerte', titre: 'Ordre antéchronologique', detail: ordreOk ? 'Du plus récent au plus ancien.' : 'Vos expériences ou formations ne sont pas de la plus récente à la plus ancienne.', etape: 'exp', act: ordreOk ? '' : 'trier' });
  const vagues = [];
  cv.experiences.forEach(x => x.missions.forEach(m => { if (m && NC.estVague(m)) vagues.push(m); }));
  item(vagues.length ? 'alerte' : 'ok', 'Formulations claires', vagues.length ? `${vagues.length} mission(s) à préciser, par exemple « ${vagues[0]} ». Utilisez ✨ Reformuler.` : 'Chaque mission commence par un verbe d\'action.', 'exp');
  const nbComp = cv.compTech.length + cv.compRel.length + cv.logiciels.length;
  item(nbComp >= 4 ? 'ok' : 'alerte', 'Compétences', nbComp >= 4 ? `${nbComp} compétences et logiciels.` : 'Ajoutez vos compétences techniques, relationnelles et logiciels.', 'comp');
  const fautes = NC.relire(cv);
  L.push({ niveau: fautes.length ? 'alerte' : 'ok', titre: 'Orthographe et typographie', detail: fautes.length ? `${fautes.length} point(s) à relire.` : 'Aucune faute fréquente repérée. Relisez tout de même à voix haute : le correcteur du navigateur souligne le reste.', etape: 'verif', fautes });
  if (ats) {
    item('ok', 'Format ATS', `Une seule colonne, police ${NC.POLICES_ATS.includes(cv.style.atsPolice) ? cv.style.atsPolice : 'Arial'}, titres standards, coordonnées dans le corps, sans photo ni tableau ni icône.`);
  } else {
    const M = NC.modele(cv.style.modele);
    if (cv.style.photo && !P.photo) item('info', 'Photo', 'L\'option photo est activée, mais aucune photo n\'est ajoutée.', 'style');
    item(M.famille === 'gauche' || M.famille === 'droite' ? 'info' : 'ok', 'Format visuel', M.famille === 'gauche' || M.famille === 'droite'
      ? 'Mise en page à deux colonnes : parfaite pour un envoi par e-mail ; pour un formulaire en ligne, préférez la version ATS.'
      : 'Mise en page lisible, aussi bien par un humain que par un logiciel de tri.');
  }
  if (NC.pagesApercu > 2) item('alerte', 'Longueur', `Environ ${NC.pagesApercu} pages : visez 1 page (2 au maximum avec beaucoup d'expérience).`);
  return L;
};
NC.pret = L => !L.some(i => i.niveau === 'erreur');
NC.score = L => { const n = L.filter(i => i.niveau !== 'info').length || 1; return Math.round(100 * L.filter(i => i.niveau === 'ok').length / n); };

/* ---------- Analyser une offre d'emploi ---------- */
const reMot = p => new RegExp('(^|[^a-z0-9])(' + p + ')(?=$|[^a-z0-9])', 'i');
NC.analyserOffre = function (texte, cv) {
  const brut = String(texte || ''), n = ' ' + norm(brut) + ' ', t = NC.texteCV(cv);
  const lignes = brut.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const R = { titre: '', contrat: '', lieu: '', missions: [], groupes: {}, autres: [], score: 0, axes: [] };
  const premiere = lignes.find(l => l.length < 100 && !/^(nous|vous|notre|votre|a propos|à propos|description|l'entreprise|qui sommes)/i.test(l));
  R.titre = (premiere || '').replace(/\(?\b(h\s*\/\s*f|f\s*\/\s*h|h-f|f-h)\b\)?/ig, '').replace(/\s[-–|]\s.*$/, '').replace(/\b(cdi|cdd|stage|alternance|int[ée]rim)\b.*$/i, '').replace(/[:–-]\s*$/, '').trim();
  const c = n.match(/\b(cdi|cdd|alternance|apprentissage|stage|interim|freelance|contrat pro\w*|saisonnier)\b/);
  const CT = { cdi: ['CDI', "d'un CDI"], cdd: ['CDD', "d'un CDD"], alternance: ['Alternance', "d'une alternance"], apprentissage: ['Apprentissage', "d'un apprentissage"],
    stage: ['Stage', "d'un stage"], interim: ['Intérim', "d'une mission d'intérim"], freelance: ['Freelance', "d'une mission en freelance"], saisonnier: ['Saisonnier', "d'un contrat saisonnier"] };
  const ct = c ? (CT[c[1]] || ['Contrat de professionnalisation', "d'un contrat de professionnalisation"]) : null;
  R.contrat = ct ? ct[0] : ''; R.contratPhrase = ct ? ct[1] : '';
  const poids = { logiciels: 3, techniques: 3, qualites: 1.5, langues: 2 };
  let total = 0, trouve = 0;
  const vus = new Set();
  Object.keys(NC.MOTS).forEach(g => {
    R.groupes[g] = [];
    NC.MOTS[g].forEach(([label, motif]) => {
      const re = reMot(motif);
      if (re.test(n) && !vus.has(label)) {
        vus.add(label);
        const present = re.test(t);
        R.groupes[g].push({ label, present, groupe: g });
        total += poids[g]; if (present) trouve += poids[g];
      }
    });
  });
  if (/permis\s*(b|de conduire)/.test(n)) {
    const present = /permis/.test(t);
    R.groupes.techniques.push({ label: 'Permis B', present, groupe: 'permis' }); total += 2; if (present) trouve += 2;
  }
  /* Les missions de l'annonce : lignes à puces ou qui commencent par un verbe. */
  lignes.forEach(l => {
    const s = l.replace(/^[\-–—•*·>✓✔▪►\d.)\s]+/, '').trim();
    const w = norm(s.split(/\s+/)[0] || '');
    const puce = /^[\-–—•*·>✓✔▪►]/.test(l);
    const verbe = /(er|ir|re)$/.test(w) && w.length > 3 && !NC.VIDES.has(w);
    const nb = s.split(/\s+/).length;
    if ((puce || verbe || NC.NOMS_ACTION[w]) && nb >= 3 && nb <= 28 && R.missions.length < 12 && !/salaire|avantage|tickets?|mutuelle|remuneration|rémunération|€/i.test(s)) R.missions.push(s.replace(/[.;]$/, ''));
  });
  /* Les autres mots qui reviennent souvent. */
  const freq = {};
  const connus = new Set([].concat(...Object.values(NC.MOTS)).map(e => norm(e[0])));
  n.replace(/[^a-z0-9' -]/g, ' ').split(/[\s']+/).forEach(w => { if (w.length >= 5 && !NC.VIDES.has(w) && !/^\d+$/.test(w)) freq[w] = (freq[w] || 0) + 1; });
  R.autres = Object.entries(freq).filter(([w, k]) => k >= 2 && ![...connus].some(c => c.indexOf(w) !== -1 || w.indexOf(c) !== -1))
    .sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => ({ label: w, present: t.indexOf(w.slice(0, Math.max(5, w.length - 2))) !== -1, groupe: 'autres' }));
  R.autres.forEach(a => { total += 1; if (a.present) trouve += 1; });

  const kw = total ? trouve / total : .5;
  const struct = [cv.titre, cv.accroche, cv.experiences.length, cv.formations.length, cv.compTech.length + cv.compRel.length + cv.logiciels.length >= 5].filter(Boolean).length / 5;
  const motsTitre = norm(R.titre).split(/[^a-z0-9]+/).filter(w => w.length > 2 && !NC.VIDES.has(w));
  const titreMatch = motsTitre.length ? motsTitre.filter(w => norm(cv.titre).indexOf(w) !== -1).length / motsTitre.length : .5;
  R.score = Math.max(0, Math.min(100, Math.round(100 * (.65 * kw + .2 * struct + .15 * titreMatch))));
  R.niveau = R.score >= 80 ? 'Très bonne correspondance' : R.score >= 65 ? 'Bonne correspondance' : R.score >= 40 ? 'Correspondance partielle' : 'Correspondance faible';

  /* Les axes d'amélioration. */
  const manquants = g => (R.groupes[g] || []).filter(k => !k.present).map(k => k.label);
  if (R.titre && titreMatch < .6) R.axes.push({ titre: 'Titre professionnel', texte: `Votre titre ne reprend pas l'intitulé de l'annonce. Si c'est bien le métier que vous exercez ou visez, écrivez : « ${R.titre} ».` });
  if (!cv.accroche) R.axes.push({ titre: 'Accroche', texte: 'Ajoutez une accroche de 2 à 4 lignes qui nomme le poste visé.' });
  else if (R.titre && motsTitre.length && !motsTitre.some(w => norm(cv.accroche).indexOf(w) !== -1)) R.axes.push({ titre: 'Accroche', texte: 'Votre accroche ne mentionne pas le poste visé : une version adaptée est proposée ci-dessous.' });
  if (manquants('logiciels').length) R.axes.push({ titre: 'Logiciels', texte: `L'annonce cite ${et(manquants('logiciels'))}. Ajoutez seulement ceux que vous utilisez réellement.` });
  if (manquants('techniques').length) R.axes.push({ titre: 'Compétences à clarifier', texte: `Absentes de votre CV : ${et(manquants('techniques').slice(0, 6))}. Si vous les avez pratiquées, détaillez-les dans une expérience plutôt que dans une simple liste.` });
  if (manquants('langues').length) R.axes.push({ titre: 'Langues', texte: `L'annonce demande : ${et(manquants('langues'))}. Indiquez votre niveau réel, s'il y a lieu.` });
  if (/(bac\s*\+|diplome|master|licence|bts|but|dut|formation (superieure|en))/.test(n)) {
    R.axes.push({ titre: 'Formation', texte: cv.formations.length ? 'L\'annonce insiste sur le diplôme : placez votre formation juste après votre profil si elle correspond (modèle Étudiant ou Alternance).' : 'L\'annonce mentionne un diplôme : ajoutez votre formation.' });
  }
  if (/certifi/.test(n) && !cv.certifications.length) R.axes.push({ titre: 'Rubrique manquante', texte: 'L\'annonce parle de certification : ajoutez les vôtres s\'il y en a.' });
  const expMaigres = cv.experiences.filter(x => x.missions.filter(Boolean).length < 2);
  if (expMaigres.length) R.axes.push({ titre: 'Expériences à détailler', texte: `${expMaigres.length} expérience(s) avec moins de deux missions : décrivez ce que vous faisiez concrètement.` });
  if (!R.axes.length) R.axes.push({ titre: 'Bon alignement', texte: 'Votre CV couvre déjà l\'essentiel de l\'annonce. Relisez l\'ordre des missions pour placer les plus proches du poste en premier.' });

  /* Missions de chaque expérience, des plus proches de l'offre aux plus lointaines. */
  const clesOffre = [].concat(...Object.values(R.groupes)).map(k => k.label).concat(R.autres.map(a => a.label));
  /* Les mots porteurs des missions de l'annonce, sans les verbes (« gérer », « assurer »…) trop communs. */
  const motsMissions = new Set(norm(R.missions.join(' ')).split(/[^a-z]+/).filter(w => w.length > 4 && !NC.VIDES.has(w) && !/(er|ir|re)$/.test(w)));
  const pertinence = m => { const x = norm(m); let s = 0; clesOffre.forEach(k => { if (x.indexOf(norm(k)) !== -1) s += 2; }); motsMissions.forEach(w => { if (x.indexOf(w) !== -1) s += 1; }); return s; };
  R.experiences = cv.experiences.map(x => ({ id: x.id, poste: x.poste, entreprise: x.entreprise, missions: x.missions.filter(Boolean).map(m => ({ m, s: pertinence(m) })).sort((a, b) => b.s - a.s) }));
  R.pertinence = pertinence;
  return R;
};
NC.accrocheAdaptee = function (cv, R, entreprise) {
  const titre = R.titre || cv.titre;
  const duree = NC.dureeTexte(NC.moisExperience(cv));
  /* Uniquement les mots-clés de l'offre déjà présents dans le CV : rien n'est ajouté. */
  const garder = g => (R.groupes[g] || []).filter(k => k.present && k.groupe !== 'permis').map(k => k.label);
  const tech = garder('techniques').filter(l => !/^(Assistanat|Vente)$/.test(l)).slice(0, 3).map(NC.min1), logi = garder('logiciels').slice(0, 3), qual = garder('qualites').slice(0, 2).map(NC.min1);
  if (!titre) return '';
  return `${titre}${duree ? ' — ' + duree : ''}.${tech.length ? ' Compétences clés : ' + et(tech) + '.' : ''}${logi.length ? ' Outils : ' + logi.join(', ') + '.' : ''}${qual.length ? ' Atouts : ' + et(qual) + '.' : ''} Je souhaite mettre mon expérience au service de ${entreprise || 'votre équipe'}${R.contratPhrase ? ' dans le cadre ' + R.contratPhrase : ''}.`;
};

/* ---------- La lettre de motivation ---------- */
NC.TONS = [
  ['professionnel', 'Professionnel'], ['chaleureux', 'Chaleureux'], ['direct', 'Direct'], ['dynamique', 'Dynamique'], ['formel', 'Plus formel']
];
/* « le poste d'assistante », « en tant qu'assistante » : les élisions devant le poste. */
const voyelle = p => /^[aeiouyhéèêàâîôû]/i.test(p);
const dePoste = p => (voyelle(p) ? "d'" : 'de ') + NC.min1(p);
const tantQue = p => (voyelle(p) ? "en tant qu'" : 'en tant que ') + NC.min1(p);
const TON = {
  professionnel: {
    intro: (p, e) => `Votre offre pour le poste ${p}${e ? ' au sein de ' + e : ''} a retenu toute mon attention.`,
    apport: 'Mon parcours m\'a permis d\'acquérir des compétences directement utiles à ce poste.',
    entretien: 'Je me tiens à votre disposition pour un entretien afin de vous présenter plus en détail mon parcours et ma motivation.',
    politesse: a => `Dans l'attente de votre retour, je vous prie d'agréer, ${a}, l'expression de mes salutations distinguées.`,
    court: 'Je vous remercie de l\'attention portée à ma candidature. Cordialement,'
  },
  chaleureux: {
    intro: (p, e) => `C'est avec un grand intérêt que j'ai découvert votre offre pour le poste ${p}${e ? ' chez ' + e : ''}.`,
    apport: 'Au fil de mes expériences, j\'ai développé des savoir-faire que j\'aurais plaisir à mettre au service de votre équipe.',
    entretien: 'J\'aurais grand plaisir à échanger avec vous lors d\'un entretien, pour vous en dire davantage sur mon parcours.',
    politesse: a => `En vous remerciant pour le temps accordé à ma candidature, je vous adresse, ${a}, mes sincères salutations.`,
    court: 'Merci pour votre attention, et au plaisir d\'échanger avec vous. Bien cordialement,'
  },
  direct: {
    intro: (p, e) => `Je vous propose ma candidature au poste ${p}${e ? ' chez ' + e : ''}.`,
    apport: 'Voici ce que je peux apporter concrètement.',
    entretien: 'Je suis disponible pour un entretien, à votre convenance.',
    politesse: a => `Je vous prie d'agréer, ${a}, mes salutations distinguées.`,
    court: 'Disponible pour un échange rapide. Cordialement,'
  },
  dynamique: {
    intro: (p, e, tq) => `Rejoindre ${e || 'votre équipe'} ${tq} : c'est le sens de ma candidature.`,
    apport: 'Sur le terrain, j\'ai appris à agir vite et à m\'adapter : voici ce que j\'en retiens pour ce poste.',
    entretien: 'Un entretien serait l\'occasion idéale d\'en discuter : je me rends disponible dès que vous le souhaitez.',
    politesse: a => `Je vous remercie de votre attention et vous adresse, ${a}, mes meilleures salutations.`,
    court: 'Au plaisir d\'en parler de vive voix ! Bien à vous,'
  },
  formel: {
    intro: (p, e) => `J'ai l'honneur de vous soumettre ma candidature au poste ${p}${e ? ' au sein de ' + e : ''}, tel que proposé dans votre annonce.`,
    apport: 'Mon parcours professionnel m\'a conduit à exercer des responsabilités en lien direct avec les missions décrites.',
    entretien: 'Je sollicite l\'opportunité d\'un entretien au cours duquel je pourrai vous exposer plus avant mes motivations.',
    politesse: a => `Je vous prie d'agréer, ${a}, l'assurance de ma considération distinguée.`,
    court: 'Je vous prie d\'agréer mes salutations distinguées.'
  }
};
TON.formel.apport = 'Mon parcours professionnel m\'a permis d\'exercer des responsabilités en lien direct avec les missions décrites.';

/* « ma rigueur », « mon sens du service », « mon écoute » : le bon possessif devant une qualité. */
function possessif(q) {
  if (/^[aeiouyéèêàâîôûh]/i.test(q)) return 'mon ' + q;
  return (/^(rigueur|curiosit|cr[ée]ativit|polyvalence|r[ée]activit|patience|p[ée]dagogie|bienveillance|pers[ée]v[ée]rance|minutie|fiabilit|diplomatie|discr[ée]tion|ponctualit|force|gestion|capacit|motivation|disponibilit|aisance)/i.test(q) ? 'ma ' : 'mon ') + q;
}
NC.possessif = possessif;
NC.lettreVide = function (cv) {
  return { id: uid(), cvId: cv ? cv.id : '', cree: NC.aujourdhui(), entreprise: '', poste: '', destinataire: '', service: '', adresse: '', lieu: cv ? cv.perso.ville : '', date: NC.aujourdhui(),
    appel: 'Madame, Monsieur,', ton: 'professionnel', format: 'long', motivation: '', apport: '', offre: '', objet: '', paragraphes: [] };
};
NC.genererLettre = function (l, cv) {
  const T = TON[l.ton] || TON.professionnel;
  const poste = l.poste || '[intitulé du poste]', ent = l.entreprise || '';
  const appel = (l.appel || 'Madame, Monsieur,').replace(/,\s*$/, '');
  const exps = cv.experiences.slice().sort((a, b) => NC.cleTri(b).localeCompare(NC.cleTri(a)));
  let R = null;
  if (l.offre) R = NC.analyserOffre(l.offre, cv);
  const choisirMissions = x => {
    let ms = x.missions.filter(Boolean);
    if (R) ms = ms.map(m => ({ m, s: R.pertinence(m) })).sort((a, b) => b.s - a.s).map(o => o.m);
    return ms.slice(0, l.format === 'court' ? 2 : 3).map(m => NC.min1(m).replace(/[.;]$/, ''));
  };
  const phraseExp = x => {
    const ms = choisirMissions(x);
    const ou = [x.poste ? tantQue(x.poste) : '', x.entreprise ? 'chez ' + x.entreprise : ''].filter(Boolean).join(' ');
    if (!ou) return '';
    return `${NC.maj1(ou)}${x.debut ? ' (' + NC.periode(x, true) + ')' : ''}, ${ms.length ? 'j\'ai notamment pris en charge les missions suivantes : ' + ms.join(' ; ') + '.' : '[décrivez en une phrase ce que vous y faisiez].'}`;
  };
  let comps = cv.compTech.slice(), logi = cv.logiciels.slice();
  if (R) {
    const cles = [].concat(R.groupes.techniques || [], R.groupes.logiciels || []).map(k => norm(k.label));
    const tri = a => a.slice().sort((x, y) => (cles.some(k => norm(y).indexOf(k) !== -1 || k.indexOf(norm(y)) !== -1) ? 1 : 0) - (cles.some(k => norm(x).indexOf(k) !== -1 || k.indexOf(norm(x)) !== -1) ? 1 : 0));
    comps = tri(comps); logi = tri(logi);
  }
  const motiv = l.motivation ? l.motivation.trim().replace(/([^.!?])$/, '$1.')
    : `[Ce qui vous attire réellement dans ce poste${ent ? ' ou chez ' + ent : ''} : un projet, un produit, une valeur que vous connaissez — à compléter avec vos mots.]`;
  const lignesComp = [comps.length ? `des compétences en ${et(comps.slice(0, 3).map(NC.min1))}` : '', logi.length ? `la maîtrise de ${et(logi.slice(0, 3))}` : ''].filter(Boolean);
  const qual = cv.compRel.slice(0, 2).map(NC.min1);
  const P = [];
  if (l.format === 'court') {
    P.push(`${T.intro(dePoste(poste), ent, tantQue(poste))} ${motiv}`);
    P.push([exps[0] ? phraseExp(exps[0]) : '[Présentez en une phrase votre expérience la plus proche du poste.]',
      lignesComp.length ? `J'y ai développé ${et(lignesComp)}.` : '', l.apport ? l.apport.trim() : ''].filter(Boolean).join(' '));
    P.push(`${T.entretien} ${T.court}`);
  } else {
    P.push(`${T.intro(dePoste(poste), ent, tantQue(poste))} ${motiv}`);
    const ex = exps.slice(0, 2).map(phraseExp).filter(Boolean);
    P.push([T.apport, ...(ex.length ? ex : ['[Présentez votre expérience la plus proche du poste : où, quand, et ce que vous y faisiez.]']),
      lignesComp.length ? `Ces expériences m'ont permis de développer ${et(lignesComp)}.` : '',
      qual.length ? `Sur le plan relationnel, je peux m'appuyer sur ${et(qual.map(possessif))}.` : '',
      l.apport ? l.apport.trim() : ''].filter(Boolean).join(' '));
    const f = cv.formations[0];
    if (f && f.diplome) P.push(`${f.enCours ? 'Je prépare actuellement le' : 'Je suis titulaire du'} diplôme « ${f.diplome} »${f.ecole ? ' (' + f.ecole + ')' : ''}. [Précisez en une phrase ce que cette formation vous apporte pour ce poste — ou retirez ce paragraphe.]`);
    P.push(`${T.entretien} ${T.politesse(appel)}`);
  }
  return P;
};
NC.objetLettre = l => l.objet || `Candidature au poste ${dePoste(l.poste || '[intitulé du poste]')}`;
NC.trousLettre = l => (l.paragraphes.join(' ').match(/\[[^\]]+\]/g) || []).length + (l.poste ? 0 : 1);

NC.rendreLettre = function (l, cv) {
  const P = cv.perso;
  const surligne = s => esc(s).replace(/\[([^\]]+)\]/g, '<mark class="trou">[$1]</mark>');
  const coord = [P.ville, P.tel, P.email].filter(Boolean).map(esc).join('<br>');
  const dest = [l.destinataire, l.service, l.entreprise, l.adresse].filter(Boolean).map(esc).join('<br>');
  const court = l.format === 'court';
  return `<article class="feuille lettre${court ? ' courte' : ''}" style="${variablesCouleur(cv)}">
    ${court ? '' : `<header class="l-tete"><div class="l-exp"><div class="nom">${esc(P.prenom || 'Prénom')} <b>${esc(P.nom || 'Nom')}</b></div>${cv.titre ? `<div class="titre">${esc(cv.titre)}</div>` : ''}<div class="l-coord">${coord}</div></div>
      ${dest ? `<div class="l-dest">${dest}</div>` : ''}</header>
    <p class="l-date">${esc(l.lieu ? l.lieu + ', le ' : 'Le ')}${esc(NC.fmtDate(l.date || NC.aujourdhui(), true))}</p>
    <p class="l-objet"><b>Objet :</b> ${surligne(NC.objetLettre(l))}</p>`}
    <p class="l-appel">${esc(l.appel || 'Madame, Monsieur,')}</p>
    ${l.paragraphes.map(p => `<p class="l-par">${surligne(p)}</p>`).join('')}
    <p class="l-signe">${esc(nomComplet(cv) || 'Prénom Nom')}</p></article>`;
};

/* ---------- Importer un ancien CV (texte collé ou .docx) ---------- */
const RUBRIQUES = [
  ['exp', /^(experiences?( professionnelles?)?|parcours professionnel|emplois?|experience)$/],
  ['form', /^(formations?|diplomes?|etudes|cursus|formation et diplomes|scolarite|parcours scolaire)$/],
  ['comp', /^(competences?( techniques| cles| professionnelles)?|savoir-faire|aptitudes|expertises?|competences et qualites)$/],
  ['rel', /^(qualites|savoir-etre|competences relationnelles|soft skills|atouts)$/],
  ['logi', /^(informatique|logiciels?|outils|competences informatiques|outils informatiques|bureautique)$/],
  ['lang', /^(langues?( etrangeres)?|langues vivantes)$/],
  ['certif', /^(certifications?|habilitations?)$/],
  ['projets', /^(projets?( personnels| professionnels)?|realisations)$/],
  ['interets', /^(centres? d'interets?|loisirs|hobbies|passions|activites extra-professionnelles|interets)$/],
  ['profil', /^(profil|a propos|resume|objectif|presentation|accroche|profil professionnel)$/],
  ['infos', /^(informations? (complementaires|pratiques|personnelles)|divers|infos)$/]
];
const MOIS_NORM = ['janv', 'fevr', 'mars', 'avr', 'mai', 'juin', 'juil', 'aout', 'sept', 'oct', 'nov', 'dec'];
function lireDate(s) {
  const n = norm(s);
  let m = n.match(/(\d{1,2})[\/.-](\d{4})/);
  if (m) return m[2] + '-' + String(m[1]).padStart(2, '0');
  m = n.match(/(janv\w*|fevr?\w*|mars|avr\w*|mai|juin|juil\w*|aout|sept\w*|oct\w*|nov\w*|dec\w*)\.?\s*(\d{4})/);
  if (m) { const i = MOIS_NORM.findIndex(k => m[1].indexOf(k) === 0 || k.indexOf(m[1].slice(0, 3)) === 0); return m[2] + '-' + String(i + 1).padStart(2, '0'); }
  m = n.match(/(19|20)\d{2}/);
  return m ? m[0] : '';
}
/* Les dates d'une ligne, dans l'ordre : la première est le début, la suivante la fin. */
function lirePeriode(ligne) {
  const n = norm(ligne);
  const dates = n.match(/\d{1,2}[\/.-](19|20)\d{2}|(janv|fevr?|mars|avr|mai|juin|juil|aout|sept|oct|nov|dec)\w*\.?\s*(19|20)\d{2}|(19|20)\d{2}/g) || [];
  const enCours = /aujourd|present|actuel|en cours|ce jour/.test(n);
  return { debut: dates[0] ? lireDate(dates[0]) : '', fin: !enCours && dates[1] ? lireDate(dates[dates.length - 1]) : '', enCours };
}
const aUneDate = l => /(19|20)\d{2}/.test(l) && l.length < 140;
const retireDate = l => l.replace(/(depuis\s+)?(de\s+|du\s+)?((\d{1,2}[\/.-])?(19|20)\d{2}|(janv\w*|f[ée]vr?\w*|mars|avr\w*|mai|juin|juil\w*|ao[uû]t|sept\w*|oct\w*|nov\w*|d[ée]c\w*)\.?\s*(19|20)\d{2})(\s*(-|–|—|à|au)\s*((\d{1,2}[\/.-])?(19|20)\d{2}|(janv\w*|f[ée]vr?\w*|mars|avr\w*|mai|juin|juil\w*|ao[uû]t|sept\w*|oct\w*|nov\w*|d[ée]c\w*)\.?\s*(19|20)\d{2}|aujourd'hui|aujourd’hui|pr[ée]sent|en cours|ce jour|actuellement))?/ig, '').replace(/^[\s,|·:–—-]+|[\s,|·:–—-]+$/g, '').replace(/\(\s*\)/g, '').trim();

NC.importerTexte = function (texte) {
  const cv = NC.cvVide('CV importé');
  const lignes = String(texte || '').replace(/\r/g, '').split('\n').map(l => l.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim());
  const tout = lignes.join('\n');
  const P = cv.perso;
  const mail = tout.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); if (mail) P.email = mail[0];
  const tel = tout.match(/(\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}/); if (tel) P.tel = tel[0].trim();
  const li = tout.match(/(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/[^\s,;]+/i); if (li) P.linkedin = li[0];
  const url = tout.split(/\s/).find(w => /^(https?:\/\/|www\.)/i.test(w) && !/linkedin/i.test(w)); if (url) P.portfolio = url;
  const permis = tout.match(/permis\s+[a-z]{1,2}\b[^\n,;]*/i); if (permis) P.permis = NC.maj1(permis[0].trim());
  const estContact = l => /@|linkedin|https?:|www\.|(\+33|0)[1-9](?:[\s.-]?\d{2}){4}/i.test(l);
  const rubrique = l => { const n = norm(l).replace(/[:•\-–—_*#]+/g, ' ').replace(/\s+/g, ' ').trim(); if (n.length > 45) return null; const r = RUBRIQUES.find(([, re]) => re.test(n)); return r ? r[0] : null; };

  const idxPremiere = lignes.findIndex(l => l && !estContact(l) && !rubrique(l));
  if (idxPremiere >= 0 && lignes[idxPremiere].split(' ').length <= 4) {
    const mots = lignes[idxPremiere].split(' ');
    P.prenom = NC.maj1(mots[0].toLowerCase()); P.nom = mots.slice(1).join(' ');
    const suivante = lignes.slice(idxPremiere + 1).find(l => l);
    if (suivante && !estContact(suivante) && !rubrique(suivante) && suivante.length < 70 && !aUneDate(suivante)) cv.titre = suivante;
  }
  const ville = lignes.find(l => /\b\d{5}\b/.test(l) && l.length < 80);
  if (ville) { const m = ville.match(/\d{5}\s+([A-Za-zÀ-ÿ' -]+)/); if (m) P.ville = m[1].trim(); }

  /* On range chaque ligne dans sa rubrique. */
  const blocs = {}; let cour = null;
  lignes.forEach(l => {
    if (!l) return;
    const r = rubrique(l);
    if (r) { cour = r; blocs[r] = blocs[r] || []; return; }
    if (cour) blocs[cour].push(l);
  });
  const estPuce = l => /^[\-–—•*·>▪►✓]/.test(l);
  const sansPuce = l => l.replace(/^[\-–—•*·>▪►✓\s]+/, '').trim();
  const decouper = (liste, fabrique) => {
    const sortie = []; let courant = null;
    liste.forEach(l => {
      if (aUneDate(l) && !estPuce(l)) { courant = fabrique(l); sortie.push(courant); }
      else if (courant) courant._lignes.push(l);
      else { courant = fabrique(''); courant._lignes.push(l); sortie.push(courant); }
    });
    return sortie;
  };
  if (blocs.profil) cv.accroche = blocs.profil.join(' ');
  if (blocs.exp) {
    cv.experiences = decouper(blocs.exp, l => Object.assign({ id: uid(), poste: '', entreprise: '', ville: '', contrat: '', missions: [], outils: '', resultats: '', competences: '', couleur: '', logo: '', _lignes: [] }, lirePeriode(l), { _tete: retireDate(l) }))
      .map(x => {
        let tete = x._tete, reste = x._lignes.slice();
        if (!tete && reste.length && !estPuce(reste[0])) tete = reste.shift();
        const parts = tete.split(/\s+(?:-|–|—|\||chez|@)\s+|,\s+/).map(s => s.trim()).filter(Boolean);
        x.poste = parts[0] || ''; x.entreprise = parts[1] || ''; x.ville = parts[2] || '';
        if (!x.entreprise && reste.length && !estPuce(reste[0]) && reste[0].length < 60) x.entreprise = reste.shift();
        const contrat = NC.CONTRATS.find(c => new RegExp('\\b' + norm(c) + '\\b').test(norm(tete + ' ' + reste.join(' '))));
        if (contrat) x.contrat = contrat;
        x.missions = reste.map(sansPuce).filter(m => m.length > 2);
        const t = NC.trouverEntreprise(x.entreprise); if (t) x.couleur = t.c1;
        delete x._lignes; delete x._tete; return x;
      });
  }
  if (blocs.form) {
    cv.formations = decouper(blocs.form, l => Object.assign({ id: uid(), diplome: '', ecole: '', ville: '', mention: '', details: '', _lignes: [] }, lirePeriode(l), { _tete: retireDate(l) }))
      .map(f => {
        let tete = f._tete, reste = f._lignes.slice();
        if (!tete && reste.length) tete = reste.shift();
        const parts = tete.split(/\s+(?:-|–|—|\|)\s+|,\s+/).map(s => s.trim()).filter(Boolean);
        f.diplome = parts[0] || ''; f.ecole = parts[1] || ''; f.ville = parts[2] || '';
        if (!f.ecole && reste.length && reste[0].length < 70) f.ecole = sansPuce(reste.shift());
        f.details = reste.map(sansPuce).join(' ');
        const mention = norm(f.details + ' ' + tete).match(/mention (tres bien|bien|assez bien)/); if (mention) f.mention = 'Mention ' + mention[1].replace('tres', 'très');
        delete f._lignes; delete f._tete; return f;
      });
  }
  const eclater = liste => [].concat(...(liste || []).map(l => sansPuce(l).split(/\s*[,;•|·]\s*/))).map(s => s.replace(/^[^:]{2,30}:\s*/, '').trim()).filter(s => s.length > 1 && s.length < 60);
  cv.compTech = eclater(blocs.comp); cv.compRel = eclater(blocs.rel); cv.logiciels = eclater(blocs.logi); cv.interets = eclater(blocs.interets);
  if (blocs.lang) cv.langues = [].concat(...blocs.lang.map(l => sansPuce(l).split(/\s*[,;•|·]\s*/))).filter(s => s.length > 1).map(s => {
    const m = s.match(/^([A-Za-zÀ-ÿ' ]+?)\s*(?:[:\-–(]\s*|\s+)(.+)$/);
    return m ? { langue: NC.maj1(m[1].trim()), niveau: m[2].replace(/\)$/, '').trim() } : { langue: NC.maj1(s), niveau: '' };
  });
  if (blocs.certif) cv.certifications = blocs.certif.map(l => ({ nom: sansPuce(retireDate(l)), organisme: '', date: lireDate(l).slice(0, 4) }));
  if (blocs.projets) cv.projets = blocs.projets.filter(l => l.length > 2).map(l => { const s = sansPuce(l); const [a, ...b] = s.split(/\s*[:–—-]\s+/); return { titre: a, contexte: '', description: b.join(' — '), lien: '' }; });
  if (blocs.infos) blocs.infos.forEach(l => { if (/mobilit/i.test(l)) P.mobilite = l.replace(/^.*?mobilit\S*\s*:?\s*/i, ''); if (/disponib/i.test(l)) P.dispo = l.replace(/^.*?disponib\S*\s*:?\s*/i, ''); });
  return cv;
};
NC.texteDocx = async function (fichier) {
  const xml = await NC.lireDansZip(await fichier.arrayBuffer(), 'word/document.xml');
  return xml.replace(/<w:tab\/>/g, '\t').replace(/<w:br\/>/g, '\n').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
};

/* ---------- Importer un PDF : pdf.js, embarqué, chargé au premier besoin ---------- */
function ajouterScript(code, src) {
  return new Promise((ok, ko) => {
    const s = document.createElement('script');
    if (code) { s.textContent = code; document.head.appendChild(s); ok(); return; }
    s.src = src; s.onload = ok; s.onerror = () => ko(new Error('Bibliothèque introuvable : ' + src));
    document.head.appendChild(s);
  });
}
function chargerPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  const lib = $('#lib-pdf'), wk = $('#lib-pdf-worker');
  const embarque = lib && lib.textContent.length > 1000;          /* NaoCV.html construit */
  /* Le « worker » tourne dans la page : pas de fichier séparé, ça marche en double-clic. */
  return ajouterScript(embarque ? wk.textContent : '', 'lib/pdf.worker.min.js')
    .then(() => ajouterScript(embarque ? lib.textContent : '', 'lib/pdf.min.js'))
    .then(() => window.pdfjsLib);
}
/* Remet les morceaux de texte d'une page dans l'ordre de lecture, colonne par colonne. */
function lignesDePage(items, largeur) {
  const morceaux = items.filter(i => i.str && i.str.trim()).map(i => ({ x: i.transform[4], y: i.transform[5], w: i.width || 0, t: i.str }));
  const grouper = liste => {
    const lignes = [];
    liste.slice().sort((a, b) => b.y - a.y || a.x - b.x).forEach(m => {
      const l = lignes.find(l => Math.abs(l.y - m.y) < 3);
      if (l) l.m.push(m); else lignes.push({ y: m.y, m: [m] });
    });
    return lignes.map(l => l.m.sort((a, b) => a.x - b.x));
  };
  const texteLigne = l => l.reduce((s, m, i) => s + (i && m.x - (l[i - 1].x + l[i - 1].w) > 1.5 && !/\s$/.test(s) ? ' ' : '') + m.t, '').trim();
  /* Une mise en page à deux colonnes ? On cherche une gouttière verticale que presque aucun texte
     ne traverse, avec une vraie quantité de texte de chaque côté (pas seulement une colonne de dates). */
  const W = largeur || Math.max(...morceaux.map(m => m.x + m.w), 1);
  const total = morceaux.reduce((s, m) => s + m.t.length, 0) || 1;
  let meilleur = null;
  for (let x = W * .18; x <= W * .82; x += 2) {
    const traverse = morceaux.filter(m => m.x - 3 < x && m.x + m.w + 3 > x);
    const g = morceaux.filter(m => m.x + m.w <= x).reduce((s, m) => s + m.t.length, 0);
    const d = morceaux.filter(m => m.x >= x).reduce((s, m) => s + m.t.length, 0);
    if (traverse.length > Math.max(2, morceaux.length * .08) || g < total * .22 || d < total * .22) continue;
    const note = traverse.length * 1000 + Math.abs(g - d) / total;
    if (!meilleur || note < meilleur.note) meilleur = { x, note, traverse };
  }
  if (meilleur) {
    const haut = new Set(meilleur.traverse);          /* un titre qui court sur toute la largeur passe en premier */
    const lire = f => grouper(morceaux.filter(m => !haut.has(m) && f(m))).map(texteLigne);
    return grouper([...haut]).map(texteLigne).concat(lire(m => m.x < meilleur.x), [''], lire(m => m.x >= meilleur.x));
  }
  return grouper(morceaux).map(texteLigne);
}
NC.textePdf = async function (fichier, progres) {
  const pdfjs = await chargerPdfJs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await fichier.arrayBuffer()), isEvalSupported: false }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    if (progres) progres(`Lecture du PDF : page ${p} sur ${doc.numPages}…`);
    const page = await doc.getPage(p);
    pages.push(lignesDePage((await page.getTextContent()).items, page.getViewport({ scale: 1 }).width).join('\n'));
  }
  const texte = pages.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  return { texte, doc };
};
/* Un PDF scanné n'a pas de texte : on dessine ses pages pour les lire comme des images. */
NC.pagesEnImages = async function (doc, max) {
  const toiles = [];
  for (let p = 1; p <= Math.min(doc.numPages, max || 3); p++) {
    const page = await doc.getPage(p), vue = page.getViewport({ scale: 2 });
    const c = document.createElement('canvas'); c.width = vue.width; c.height = vue.height;
    await page.render({ canvasContext: c.getContext('2d'), viewport: vue }).promise;
    toiles.push(c);
  }
  return toiles;
};

/* ---------- Importer une image : reconnaissance de texte (Tesseract.js) ----------
   La reconnaissance tourne dans le navigateur : l'image n'est envoyée nulle part.
   Seuls le moteur et le dictionnaire français sont téléchargés, la première fois. */
const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
NC.texteImages = async function (sources, progres) {
  if (!window.Tesseract) {
    if (progres) progres('Chargement de la reconnaissance de texte (connexion Internet nécessaire la première fois)…');
    try { await ajouterScript('', TESSERACT); }
    catch (e) { throw new Error('La lecture d\'une image demande une connexion Internet (le moteur de reconnaissance se télécharge la première fois). Vous pouvez aussi copier-coller le texte.'); }
  }
  const textes = [];
  for (let i = 0; i < sources.length; i++) {
    const r = await window.Tesseract.recognize(sources[i], 'fra', {
      logger: m => { if (progres && m.status === 'recognizing text') progres(`Lecture de l'image${sources.length > 1 ? ' ' + (i + 1) + '/' + sources.length : ''} : ${Math.round(m.progress * 100)} %`); }
    });
    textes.push(r.data.text);
  }
  return textes.join('\n\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
};

/* ---------- Export Word (.docx) : une colonne, texte modifiable ---------- */
const W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
function wr(t, o) {
  o = o || {};
  const rp = (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + (o.couleur ? `<w:color w:val="${o.couleur.replace('#', '')}"/>` : '') + (o.taille ? `<w:sz w:val="${Math.round(o.taille * 2)}"/><w:szCs w:val="${Math.round(o.taille * 2)}"/>` : '');
  return `<w:r>${rp ? '<w:rPr>' + rp + '</w:rPr>' : ''}<w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
}
function wp(runs, o) {
  o = o || {};
  const pp = (o.style ? `<w:pStyle w:val="${o.style}"/>` : '') + (o.puce ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : '') +
    (o.bord ? `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="${o.bord.replace('#', '')}"/></w:pBdr>` : '') +
    `<w:spacing w:before="${o.avant || 0}" w:after="${o.apres == null ? 60 : o.apres}"/>` + (o.align ? `<w:jc w:val="${o.align}"/>` : '');
  return `<w:p><w:pPr>${pp}</w:pPr>${Array.isArray(runs) ? runs.join('') : runs}</w:p>`;
}
function paquetDocx(corps, police) {
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${W_NS}>
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${police}" w:hAnsi="${police}" w:cs="${police}" w:eastAsia="${police}"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="140" w:after="20"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360"/></w:pPr></w:style>
</w:styles>`;
  const numerotation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering ${W_NS}><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="260"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W_NS}><w:body>${corps}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1080" w:bottom="1000" w:left="1080" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  return NC.creerZip([
    { nom: '[Content_Types].xml', contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
    { nom: '_rels/.rels', contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
    { nom: 'docProps/core.xml', contenu: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>NaoCV</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>` },
    { nom: 'word/_rels/document.xml.rels', contenu: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>' },
    { nom: 'word/document.xml', contenu: doc },
    { nom: 'word/styles.xml', contenu: styles },
    { nom: 'word/numbering.xml', contenu: numerotation }
  ], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
NC.docxCV = function (cv, ats) {
  const P = cv.perso, st = cv.style, M = NC.modele(st.modele);
  const accent = ats ? '#000000' : NC.lisible(st.couleur || '#1F3A68');
  const police = ats ? (NC.POLICES_ATS.includes(st.atsPolice) ? st.atsPolice : 'Arial') : (st.police || 'Calibri');
  const titre = k => wp(wr(NC.TITRES[k].toUpperCase(), { b: true, couleur: accent }), { style: 'Heading1', bord: ats ? '#999999' : accent });
  const liste = a => a.filter(Boolean);
  const x = [];
  x.push(wp(wr(nomComplet(cv) || 'Prénom Nom', { b: true, taille: 20, couleur: ats ? '' : accent }), { style: 'Title', apres: 20 }));
  if (cv.titre) x.push(wp(wr(cv.titre, { b: true, taille: 12.5 }), { apres: 80 }));
  const c1 = liste([P.ville, P.tel, P.email]).join(' · '), c2 = liste([P.linkedin, P.portfolio]).join(' · ');
  const c3 = liste([P.permis, P.mobilite ? 'Mobilité : ' + P.mobilite : '', P.dispo ? 'Disponibilité : ' + P.dispo : '']).join(' · ');
  [c1, c2, c3].filter(Boolean).forEach(c => x.push(wp(wr(c, { taille: 10 }), { apres: 20 })));
  const S = {};
  if (cv.accroche) S.profil = () => { x.push(titre('profil'), wp(wr(cv.accroche))); };
  if (cv.experiences.length) S.exp = () => {
    x.push(titre('exp'));
    cv.experiences.forEach(e => {
      const coul = !ats && st.couleursEntreprises !== false && e.couleur ? NC.lisible(e.couleur) : '';
      x.push(wp([wr(e.poste || '', { b: true }), e.entreprise ? wr(' — ') : '', e.entreprise ? wr(e.entreprise, { b: true, couleur: coul }) : '', e.ville ? wr(', ' + e.ville) : ''], { style: 'Heading2' }));
      x.push(wp(wr(NC.maj1(liste([NC.periode(e), e.contrat]).join(' · ')), { i: true, couleur: '#555555' }), { apres: 40 }));
      e.missions.filter(Boolean).forEach(m => x.push(wp(wr(m), { style: 'ListParagraph', puce: true, apres: 20 })));
      if (e.outils) x.push(wp([wr('Outils : ', { b: true }), wr(e.outils)]));
      if (e.resultats) x.push(wp([wr('Résultats : ', { b: true }), wr(e.resultats)]));
      if (e.competences) x.push(wp([wr('Compétences développées : ', { b: true }), wr(e.competences)]));
    });
  };
  if (!ats && cv.experiences.some(e => e.resultats)) S.forts = () => { x.push(titre('forts')); cv.experiences.filter(e => e.resultats).forEach(e => x.push(wp(wr(e.resultats + (e.entreprise ? ' — ' + e.entreprise : '')), { style: 'ListParagraph', puce: true, apres: 20 }))); };
  if (cv.formations.length) S.form = () => {
    x.push(titre('form'));
    cv.formations.forEach(f => {
      x.push(wp([wr(f.diplome || '', { b: true }), f.ecole ? wr(' — ' + f.ecole) : '', f.ville ? wr(', ' + f.ville) : ''], { style: 'Heading2' }));
      x.push(wp(wr(NC.maj1(liste([NC.periode(f), f.mention]).join(' · ')), { i: true, couleur: '#555555' }), { apres: 40 }));
      if (f.details) x.push(wp(wr(f.details)));
    });
  };
  if (cv.compTech.length || cv.compRel.length || cv.logiciels.length) S.comp = () => {
    x.push(titre('comp'));
    if (cv.compTech.length) x.push(wp([wr('Compétences techniques : ', { b: true }), wr(cv.compTech.join(', '))]));
    if (cv.logiciels.length) x.push(wp([wr('Logiciels : ', { b: true }), wr(cv.logiciels.join(', '))]));
    if (cv.compRel.length) x.push(wp([wr('Compétences relationnelles : ', { b: true }), wr(cv.compRel.join(', '))]));
  };
  if (cv.langues.length) S.lang = () => { x.push(titre('lang')); cv.langues.forEach(l => x.push(wp([wr(l.langue + ' : ', { b: true }), wr(l.niveau || '')]))); };
  if (cv.certifications.length) S.certif = () => { x.push(titre('certif')); cv.certifications.forEach(c => x.push(wp(wr(liste([c.nom, c.organisme, c.date]).join(' — '))))); };
  if (cv.projets.length) S.projets = () => { x.push(titre('projets')); cv.projets.forEach(p => { x.push(wp(wr(liste([p.titre, p.contexte]).join(' — '), { b: true }), { style: 'Heading2' })); if (p.description) x.push(wp(wr(p.description))); if (p.lien) x.push(wp(wr(p.lien))); }); };
  if (cv.interets.length) S.interets = () => { x.push(titre('interets'), wp(wr(cv.interets.join(', ')))); };
  const ordre = [...M.ordre.filter(k => ats ? k !== 'forts' : true), 'comp', 'lang', 'certif', 'projets', 'interets'].filter((k, i, a) => a.indexOf(k) === i && S[k]);
  ordre.forEach(k => S[k]());
  return paquetDocx(x.join(''), police);
};
NC.docxLettre = function (l, cv) {
  const P = cv.perso, x = [], police = cv.style.police || 'Calibri';
  const accent = NC.lisible(cv.style.couleur || '#1F3A68');
  if (l.format !== 'court') {
    x.push(wp(wr(nomComplet(cv), { b: true, taille: 14, couleur: accent }), { apres: 0 }));
    if (cv.titre) x.push(wp(wr(cv.titre, { i: true }), { apres: 0 }));
    [P.ville, P.tel, P.email].filter(Boolean).forEach(c => x.push(wp(wr(c), { apres: 0 })));
    x.push(wp('', { apres: 200 }));
    [l.destinataire, l.service, l.entreprise, l.adresse].filter(Boolean).forEach(c => x.push(wp(wr(c), { align: 'right', apres: 0 })));
    x.push(wp(wr((l.lieu ? l.lieu + ', le ' : 'Le ') + NC.fmtDate(l.date || NC.aujourdhui(), true)), { align: 'right', avant: 240, apres: 240 }));
    x.push(wp([wr('Objet : ', { b: true }), wr(NC.objetLettre(l))], { apres: 240 }));
  }
  x.push(wp(wr(l.appel || 'Madame, Monsieur,'), { apres: 160 }));
  l.paragraphes.forEach(p => x.push(wp(wr(p), { align: 'both', apres: 160 })));
  x.push(wp(wr(nomComplet(cv)), { align: 'right', avant: 240 }));
  return paquetDocx(x.join(''), police);
};

/* ---------- Un exemple, pour voir l'outil à l'œuvre ---------- */
NC.exemple = function () {
  const cv = NC.cvVide('Exemple — à supprimer');
  Object.assign(cv.perso, { prenom: 'Camille', nom: 'Martin', ville: 'Lyon', tel: '06 12 34 56 78', email: 'camille.martin@exemple.fr', linkedin: 'linkedin.com/in/camille-martin-exemple', permis: 'Permis B', mobilite: 'Lyon et alentours', dispo: 'immédiate' });
  cv.titre = 'Assistante commerciale';
  cv.accroche = 'Assistante commerciale avec 4 ans d\'expérience en relation client et en gestion administrative des ventes. Je souhaite rejoindre une équipe commerciale où la qualité du suivi client fait la différence.';
  cv.experiences = [
    { id: uid(), poste: 'Assistante commerciale', entreprise: 'Decathlon', ville: 'Lyon', debut: '2023-02', fin: '', enCours: true, contrat: 'CDI', missions: ['Traiter les commandes des clients professionnels', 'Établir les devis et suivre leur relance', 'Mettre à jour le fichier clients dans le CRM'], outils: 'Salesforce, Excel', resultats: '', competences: 'Relation client B2B', couleur: '#3643BA', logo: '' },
    { id: uid(), poste: 'Conseillère de vente', entreprise: 'Fnac', ville: 'Lyon', debut: '2020-09', fin: '2023-01', enCours: false, contrat: 'CDI', missions: ['Accueillir et conseiller la clientèle au rayon image et son', 'Gérer les encaissements', 'Participer aux inventaires'], outils: '', resultats: '', competences: '', couleur: '#E1A925', logo: '' }
  ];
  cv.formations = [{ id: uid(), diplome: 'BTS Négociation et digitalisation de la relation client', ecole: 'Lycée La Martinière', ville: 'Lyon', debut: '2018-09', fin: '2020-06', enCours: false, mention: '', details: '' }];
  cv.compTech = ['Gestion des devis', 'Suivi des commandes', 'Relation client', 'Facturation'];
  cv.compRel = ['Sens du service', 'Rigueur', 'Esprit d\'équipe'];
  cv.logiciels = ['Salesforce', 'Excel', 'Word', 'Outlook'];
  cv.langues = [{ langue: 'Français', niveau: 'Langue maternelle' }, { langue: 'Anglais', niveau: 'Intermédiaire (B1)' }];
  cv.interets = ['Randonnée', 'Photographie'];
  cv.style.modele = 'professionnel';
  return cv;
};
