'use strict';
/* ============================================================
   NaoPets — les pages
   ============================================================ */
const carteT = (em, titre, compte = '', extra = '') =>
  `<div class="carte-t"><span class="em">${em}</span><h2>${titre}</h2>${compte !== '' ? `<span class="compte">${compte}</span>` : ''}${extra}</div>`;
const videJoli = (em, texte, bouton = '') => `<div class="vide-joli"><span class="em">${em}</span>${texte}${bouton ? `<div style="margin-top:12px">${bouton}</div>` : ''}</div>`;
const sousPages = (page, liste) => `<div class="sous-pages">${liste.map(([k, l]) => `<button class="${V.sous[page] === k ? 'on' : ''}" data-act="sous" data-p="${page}" data-s="${k}">${l}</button>`).join('')}</div>`;
const quiEst = id => id ? esc(nomA(id)) : 'Tout le foyer';
const pourQui = () => V.animal ? `de <b>${esc(nomA(V.animal))}</b>` : 'de tous vos animaux';

/* une tâche du jour, à cocher */
function ligneTache(t, d = auj(), avecAnimal = true) {
  return `<div class="ligne ${t.fait ? 'fait' : ''}">
    <button class="coche ${t.fait ? 'on' : ''}" data-act="cocher" data-id="${esc(t.id)}" data-d="${cle(d)}" aria-label="Marquer comme fait">✓</button>
    <span class="em">${t.em}</span>
    <div class="txt"><b>${esc(t.titre)}</b><span>${[avecAnimal && t.animal ? esc(nomA(t.animal)) : '', esc(t.sous)].filter(Boolean).join(' · ')}</span></div>
    ${t.heure ? `<span class="meta">${fmtH(t.heure)}</span>` : ''}</div>`;
}
/* un élément « à venir » (rendez-vous, rappel de santé, rappel ponctuel) */
function ligneAVenir(e) {
  const n = ecart(auj(), e.d), x = e.x;
  let em, titre, sous, act;
  if (e.genre === 'rdv') { em = T_RDV[x.type]?.[0]; titre = x.titre || T_RDV[x.type]?.[1]; sous = [x.heure && fmtH(x.heure), x.lieu].filter(Boolean).join(' · '); act = `data-act="rdv" data-id="${x.id}"`; }
  else if (e.genre === 'sante') { em = T_SANTE[x.type]?.[0]; titre = `${x.nom || T_SANTE[x.type]?.[1]}`; sous = n < 0 ? 'Rappel passé — à noter une fois fait' : 'Rappel prévu au carnet'; act = `data-act="soin-suivant" data-id="${x.id}"`; }
  else { em = T_RAPPEL[x.type]?.[0]; titre = x.titre || T_RAPPEL[x.type]?.[1]; sous = texteFreq(x); act = `data-act="rappel" data-id="${x.id}"`; }
  return `<div class="ligne cliquable" ${act}><span class="em">${em || '📍'}</span>
    <div class="txt"><b>${esc(titre)}</b><span>${x.animal ? esc(nomA(x.animal)) + ' · ' : ''}${esc(sous)}</span></div>
    <span class="meta ${n <= 7 ? 'or' : ''}">${n < 0 ? 'à mettre à jour' : n <= 1 ? dansJours(n) : n < 14 ? 'J-' + n : dateCourte(e.d)}</span></div>`;
}

/* ============================================================
   Accueil
   ============================================================ */
PAGES.accueil = () => {
  if (!S.animaux.length) return `
    <section class="carte bienvenue">
      <svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><use href="#nao-logo"/></svg>
      <h2>Bienvenue dans Nao<span>Pets</span></h2>
      <p>Leur bien-être, bien organisé : repas, promenades, soins, rendez-vous, stock, dépenses et souvenirs — pour tous vos compagnons, au même endroit.</p>
      <div class="especes-deco">${['chien', 'chat', 'lapin', 'cochon', 'hamster', 'cheval'].map(k => `<span class="av">${svgDessin(k)}</span>`).join('')}</div>
      <div class="btns" style="margin-top:18px">
        <button class="btn plein" data-act="animal">🐾 Ajouter mon premier animal</button>
        <button class="btn" data-act="exemple">✨ Découvrir avec un exemple</button>
        <button class="btn" data-act="ouvrir">📂 Ouvrir une sauvegarde</button></div>
      <div style="margin-top:14px"><button class="lien-carte" style="margin:0" data-act="aide">❓ Comment ça marche ?</button></div>
    </section>`;

  const t = tachesDu(auj()), faits = t.filter(x => x.fait).length;
  const venir = aVenir(90);
  const rdv = venir.filter(e => e.genre === 'rdv').slice(0, 5);
  const soins = venir.filter(e => e.genre !== 'rdv').slice(0, 5);
  const bas = S.stock.filter(s => pourAnimal(s) && stockBas(s));
  const m = cleMois(auj()), totM = totalPeriode(d => d.startsWith(m)), bud = budgetMensuel();
  const souv = S.souvenirs.filter(pourAnimalStrict).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1).slice(0, 6);
  const catsM = Object.keys(T_DEPENSE).map(k => [k, S.depenses.filter(d => d.categorie === k && (d.date || '').startsWith(m)).reduce((s, d) => s + (V.animal ? partPour(d, V.animal) : nombre(d.montant)), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);

  return `
  <div class="actions-rapides">
    <button class="gros-bouton" data-act="animal"><span class="ic">🐾</span><span>Ajouter un animal<small>Profil, photo, infos</small></span></button>
    <button class="gros-bouton" data-act="rappel"><span class="ic">🔔</span><span>Ajouter un rappel<small>Repas, soins, promenades</small></span></button>
    <button class="gros-bouton" data-act="rdv"><span class="ic">📅</span><span>Ajouter un rendez-vous<small>Vétérinaire, toilettage…</small></span></button>
    <button class="gros-bouton" data-act="depense"><span class="ic">💶</span><span>Ajouter une dépense<small>Suivre le budget</small></span></button>
  </div>

  <div class="section-t"><h2>🐾 Mes animaux</h2><div class="spacer"></div><button class="lien-carte" style="margin:0" data-act="go" data-p="animaux">Voir les fiches →</button></div>
  <div class="animaux">${actifs().map(carteAnimal).join('')}
    <div class="carte carte-animal nouveau" data-act="animal"><span class="plus">+</span><b>Ajouter un compagnon</b></div></div>

  <div class="grille-3">
    <section class="carte">${carteT('☀️', "À faire aujourd'hui", t.length ? `${faits} / ${t.length}` : '')}
      ${t.length ? `<div class="jauge" style="margin:-4px 0 10px"><i style="width:${Math.round(faits / t.length * 100)}%"></i></div>` + t.slice(0, 8).map(x => ligneTache(x)).join('')
        + (t.length > 8 ? `<button class="lien-carte" data-act="go" data-p="quotidien" data-s="aujourdhui">Voir les ${t.length} tâches →</button>` : '')
        : videJoli('🌿', "Rien de prévu aujourd'hui.", '<button class="btn petit" data-act="rappel">🔔 Ajouter un rappel</button>')}
      ${t.length && faits === t.length ? '<div class="note-douce"><span class="em">💜</span><div>Tout est fait pour aujourd’hui. Belle journée à vous deux !</div></div>' : ''}
    </section>

    <section class="carte">${carteT('📅', 'Prochains rendez-vous', rdv.length || '')}
      ${rdv.length ? rdv.map(ligneAVenir).join('') : videJoli('🗓️', 'Aucun rendez-vous prévu.', '<button class="btn petit" data-act="rdv">📅 Ajouter un rendez-vous</button>')}
      <button class="lien-carte" data-act="go" data-p="sante" data-s="rdv">Tous les rendez-vous →</button></section>

    <section class="carte">${carteT('💉', 'Vaccins et rappels à venir', soins.length || '')}
      ${soins.length ? soins.map(ligneAVenir).join('') : videJoli('🛡️', 'Aucun rappel de soin dans les trois prochains mois.', '<button class="btn petit" data-act="soin">💉 Noter un soin</button>')}
      <button class="lien-carte" data-act="go" data-p="sante" data-s="carnet">Ouvrir le carnet de santé →</button></section>

    <section class="carte">${carteT('📦', 'Stock à renouveler', bas.length || '')}
      ${bas.length ? bas.map(ligneStock).join('') : videJoli('🥣', S.stock.length ? 'Tout est bien rempli.' : 'Aucun article suivi pour le moment.', S.stock.length ? '' : '<button class="btn petit" data-act="stock">📦 Suivre un article</button>')}
      <button class="lien-carte" data-act="go" data-p="stock">Gérer le stock →</button></section>

    <section class="carte">${carteT('💶', 'Dépenses du mois', cap(MOIS[auj().getMonth()]))}
      <div class="budget-anneau">${anneau(totM, bud)}
        <div><div class="gros-chiffre">${euros(totM)}</div>
          <div style="font-size:13px;color:var(--ink-3)">${bud ? `sur un budget de ${euros(bud)} — ${totM <= bud ? `il reste ${euros(bud - totM)}` : `${euros(totM - bud)} au-delà, rien de grave`}` : 'Aucun budget défini'}</div></div></div>
      ${catsM.length ? `<div class="repartition" style="margin-top:12px">${catsM.slice(0, 4).map(([k, v]) => `<div class="r"><span>${T_DEPENSE[k][0]} ${T_DEPENSE[k][1]}</span><div class="jauge"><i style="width:${Math.round(v / catsM[0][1] * 100)}%;background:${T_DEPENSE[k][2]}"></i></div><b>${euros(v)}</b></div>`).join('')}</div>` : ''}
      <button class="lien-carte" data-act="go" data-p="depenses">Voir le budget →</button></section>

    <section class="carte">${carteT('📸', 'Derniers souvenirs', souv.length || '')}
      ${souv.length ? `<div class="mini-souv">${souv.map(s => `<div data-act="souvenir-voir" data-id="${s.id}">${s.photo ? `<img src="${s.photo}" alt="">` : (animal(s.animal) ? avatar(animal(s.animal)) : '💜')}<small>${esc(s.titre || dateCourte(lire(s.date)))}</small></div>`).join('')}</div>`
        : videJoli('📷', 'Gardez ici les photos et les grands moments.', '<button class="btn petit" data-act="souvenir">📸 Ajouter un souvenir</button>')}
      ${datesImportantes(45).slice(0, 2).map(x => `<div class="ligne"><span class="em">${x.em}</span><div class="txt"><b>${x.titre}</b><span>${dateLongue(x.date)}</span></div><span class="meta">${x.dans === 0 ? "aujourd'hui" : 'J-' + x.dans}</span></div>`).join('')}
      <button class="lien-carte" data-act="go" data-p="souvenirs">Tous les souvenirs →</button></section>
  </div>`;
};

function carteAnimal(a) {
  const es = espece(a.espece);
  const t = tachesDu(auj(), false).filter(x => x.animal === a.id && !x.fait).slice(0, 2);
  const v = aVenir(60, false).filter(e => e.x.animal === a.id).slice(0, 3 - t.length);
  const lignes = [
    ...t.map(x => `<div><span>${x.em}</span>${esc(x.titre)}<small>${x.heure ? fmtH(x.heure) : "aujourd'hui"}</small></div>`),
    ...v.map(e => { const n = ecart(auj(), e.d), x = e.x; const tt = e.genre === 'rdv' ? (x.titre || T_RDV[x.type][1]) : e.genre === 'sante' ? (x.nom || T_SANTE[x.type][1]) : (x.titre || T_RAPPEL[x.type][1]);
      const em = e.genre === 'rdv' ? T_RDV[x.type][0] : e.genre === 'sante' ? T_SANTE[x.type][0] : T_RAPPEL[x.type][0];
      return `<div><span>${em}</span>${esc(tt)}<small>${n < 0 ? 'à mettre à jour' : n <= 1 ? dansJours(n) : 'J-' + n}</small></div>`; }),
  ];
  return `<div class="carte carte-animal" data-act="voir-animal" data-id="${a.id}">
    <div class="ca-h">${avatar(a)}<div><h3>${esc(a.nom)}</h3><div class="esp">${es[1]}${a.race ? ' · ' + esc(a.race) : ''}</div>
      <div class="age">${[ageDe(a.naissance) || (a.ageTexte ? esc(a.ageTexte) : ''), dernierPoids(a) ? nbFr(dernierPoids(a)) + ' kg' : ''].filter(Boolean).join(' · ')}</div></div></div>
    <div class="ca-actions"><span class="t">Prochaines actions</span>${lignes.length ? lignes.join('') : '<div style="color:var(--ink-3)">Rien de prévu — profitez-en 🌿</div>'}</div></div>`;
}
function anneau(val, max) {
  const p = max ? Math.min(1, val / max) : 0, r = 38, c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 92 92"><defs><linearGradient id="an-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E8CE6"/><stop offset="1" stop-color="#C9A8F5"/></linearGradient></defs>
    <circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--trait)" stroke-width="9"/>
    <circle cx="46" cy="46" r="${r}" fill="none" stroke="url(#an-g)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 46 46)"/>
    <text x="46" y="51" text-anchor="middle" style="font-family:var(--ui);font-style:normal;font-size:15px;font-weight:700;fill:var(--titre)">${max ? Math.round(val / max * 100) + '%' : '—'}</text></svg>`;
}
function ligneStock(s) {
  const j = joursRestants(s), ts = T_STOCK[s.categorie] || T_STOCK.autre;
  return `<div class="ligne cliquable" data-act="stock" data-id="${s.id}"><span class="em">${ts[0]}</span>
    <div class="txt"><b>${esc(s.nom)}</b><span>${s.animal ? esc(nomA(s.animal)) + ' · ' : ''}Il reste ${nbFr(s.quantite)} ${esc(s.unite || '')}${j != null ? ` · environ ${pluriel(j, 'jour')}` : ''}</span></div>
    <button class="btn petit" data-act="stock-plein" data-id="${s.id}">🛒 Racheté</button></div>`;
}
/* anniversaires de naissance et d'adoption */
function datesImportantes(jours = 365) {
  const l = [];
  for (const a of actifs().filter(x => !V.animal || x.id === V.animal)) {
    const n = prochainAnniv(a.naissance), ad = prochainAnniv(a.adoption);
    if (n && n.dans <= jours) l.push({ em: '🎂', titre: `${esc(a.nom)} fête ses ${n.ans} an${n.ans > 1 ? 's' : ''}`, date: n.date, dans: n.dans, a });
    if (ad && ad.dans <= jours) l.push({ em: '🏡', titre: `${pluriel(ad.ans, 'an')} que ${esc(a.nom)} a rejoint la famille`, date: ad.date, dans: ad.dans, a });
  }
  return l.sort((x, y) => x.dans - y.dans);
}

/* ============================================================
   Le sélecteur d'animal et les alertes douces
   ============================================================ */
function rendreSelecteur() {
  const el = $('#selecteur');
  if (!S.animaux.length) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<span class="lab">Pour</span>
    <button class="puce-animal tous ${!V.animal ? 'on' : ''}" data-act="choisir" data-id=""><span class="av">${svgDessin('patte')}</span>Tous</button>
    ${actifs().map(a => `<button class="puce-animal ${V.animal === a.id ? 'on' : ''}" data-act="choisir" data-id="${a.id}">${avatar(a)}${esc(a.nom)}</button>`).join('')}
    <button class="puce-animal ajout" data-act="animal" title="Ajouter un animal">＋</button>`;
}
function alertesDouces() {
  const l = [], a = auj();
  for (const s of S.sante.filter(pourAnimalStrict)) {
    if (!s.prochain || s.renouvele) continue;
    const n = ecart(a, lire(s.prochain)), nom = nomA(s.animal), quoi = s.nom || T_SANTE[s.type]?.[1];
    if (n >= 0 && n <= 14) l.push({ id: 's' + s.id + s.prochain, em: '💜', html: `Le rappel <b>${esc(quoi)}</b> de ${esc(nom)} approche : ${dansJours(n)}. Un petit appel au vétérinaire pour caler la date ?`, act: `data-act="rdv"` , bouton: '📅 Prévoir' });
    else if (n < 0 && n >= -45) l.push({ id: 's' + s.id + s.prochain, em: '🌿', html: `Le rappel <b>${esc(quoi)}</b> de ${esc(nom)} était prévu le ${dateCourte(lire(s.prochain))}. Si c'est déjà fait, notez-le simplement ✓`, act: `data-act="soin-suivant" data-id="${s.id}"`, bouton: '✓ Noter' });
  }
  for (const r of S.rdv.filter(pourAnimalStrict)) {
    if (!r.date || r.fait) continue;
    const n = ecart(a, lire(r.date));
    if (n >= 0 && n <= 2) l.push({ id: 'v' + r.id, em: '📅', html: `${n === 0 ? "Aujourd'hui" : cap(dansJours(n))}${r.heure ? ' à ' + fmtH(r.heure) : ''} : <b>${esc(r.titre || T_RDV[r.type][1])}</b> pour ${esc(nomA(r.animal))}${r.lieu ? ' · ' + esc(r.lieu) : ''}.` });
  }
  for (const s of S.stock.filter(pourAnimal)) if (stockBas(s)) {
    const j = joursRestants(s);
    l.push({ id: 'k' + s.id + s.quantite, em: '📦', html: `<b>${esc(s.nom)}</b> arrive bientôt au bout${j != null ? ` — environ ${pluriel(j, 'jour')}` : ''}. Pensez à le glisser dans la prochaine commande.`, act: `data-act="stock-plein" data-id="${s.id}"`, bouton: '🛒 Racheté' });
  }
  for (const x of datesImportantes(3)) l.push({ id: 'd' + x.titre + cle(x.date), em: x.em, html: `${x.dans === 0 ? "Aujourd'hui" : cap(dansJours(x.dans))}, ${x.titre} 🎉` });
  const vac = S.vacances;
  if (vac.depart) {
    const n = ecart(a, lire(vac.depart)), reste = vac.items.filter(i => !i.fait).length;
    if (n >= 0 && n <= 10 && reste) l.push({ id: 'vac' + vac.depart + reste, em: '🧳', html: `Départ ${dansJours(n)}${vac.destination ? ' pour ' + esc(vac.destination) : ''} : encore <b>${pluriel(reste, 'élément')}</b> à préparer.`, act: `data-act="go" data-p="vacances"`, bouton: 'Voir' });
  }
  return l;
}
function rendreRappels() {
  let masques = [];
  try { masques = JSON.parse(sessionStorage.getItem('naopet.masques') || '[]'); } catch (e) {}
  const l = S.animaux.length ? alertesDouces().filter(x => !masques.includes(x.id)).slice(0, 3) : [];
  $('#rappels').innerHTML = l.map(x => `<div class="rappel"><span class="em">${x.em}</span><div class="txt">${x.html}</div>
    ${x.act ? `<button class="btn petit" ${x.act}>${x.bouton}</button>` : ''}<button class="rond petit" data-act="masquer" data-id="${esc(x.id)}" title="Masquer pour aujourd'hui" aria-label="Masquer">✕</button></div>`).join('');
}

/* ============================================================
   Mes animaux : la liste, puis la fiche
   ============================================================ */
PAGES.animaux = () => {
  if (!V.animal) return `
    <div class="titre-page"><h2>🐾 Mes <span>animaux</span></h2><div class="spacer"></div><button class="btn plein" data-act="animal">🐾 Ajouter un animal</button></div>
    <p class="chapo">Choisissez un compagnon pour ouvrir sa fiche : identité, informations importantes, repas, poids, soins et souvenirs.</p>
    <div class="animaux">${actifs().map(carteAnimal).join('')}<div class="carte carte-animal nouveau" data-act="animal"><span class="plus">+</span><b>Ajouter un compagnon</b></div></div>
    ${S.animaux.some(a => a.parti) ? `<section class="carte">${carteT('🌈', 'Ceux qui restent dans nos cœurs')}
      ${S.animaux.filter(a => a.parti).map(a => `<div class="ligne cliquable" data-act="animal" data-id="${a.id}">${avatar(a, 'm')}<div class="txt"><b>${esc(a.nom)}</b><span>${espece(a.espece)[1]}${a.parti && a.partiLe ? ' · ' + dateMoy(lire(a.partiLe)) : ''}</span></div></div>`).join('')}</section>` : ''}`;
  return ficheAnimal(animal(V.animal));
};
function ficheAnimal(a) {
  if (!a) { V.animal = ''; return PAGES.animaux(); }
  const es = espece(a.espece), p = poidsDe(a.id), dp = dernierPoids(a);
  const contactsUrg = S.contacts.filter(c => (!c.animaux || !c.animaux.length || c.animaux.includes(a.id)) && ['veterinaire', 'clinique', 'urgence'].includes(c.type));
  const repas = S.repas.filter(r => r.animal === a.id).sort((x, y) => (x.heure || '') < (y.heure || '') ? -1 : 1);
  const rappels = S.rappels.filter(r => r.animal === a.id);
  const sante = S.sante.filter(s => s.animal === a.id).sort((x, y) => (y.date || '') < (x.date || '') ? -1 : 1).slice(0, 5);
  const an = String(auj().getFullYear()), m = cleMois(auj());
  const totA = totalPeriode(d => d.startsWith(an), a.id), totM = totalPeriode(d => d.startsWith(m), a.id), bud = nombre(S.budgets[a.id]);
  const n = prochainAnniv(a.naissance), ad = prochainAnniv(a.adoption);
  return `
  <section class="carte fiche-h">
    ${avatar(a, 'xg')}
    <div style="min-width:0"><h2>${esc(a.nom)}</h2>
      <div class="esp">${es[1]}${a.race ? ' · ' + esc(a.race) : ''}${a.sexe ? ' · ' + (a.sexe === 'f' ? '♀ femelle' : '♂ mâle') : ''}${a.sterilise ? ' · stérilisé' + (a.sexe === 'f' ? 'e' : '') : ''}</div>
      <div class="infos">
        <div><span>Âge</span><b>${ageDe(a.naissance) || esc(a.ageTexte) || '—'}</b></div>
        <div><span>Né${a.sexe === 'f' ? 'e' : ''} le</span><b>${a.naissance ? dateMoy(lire(a.naissance)) : '—'}</b></div>
        <div><span>Poids</span><b>${dp ? nbFr(dp) + ' kg' : '—'}</b></div>
        <div><span>Couleur / robe</span><b>${esc(a.couleur) || '—'}</b></div>
        <div><span>Adopté${a.sexe === 'f' ? 'e' : ''} le</span><b>${a.adoption ? dateMoy(lire(a.adoption)) : '—'}</b></div>
        <div><span>Avec nous depuis</span><b>${a.adoption ? ageDe(a.adoption) || '—' : '—'}</b></div>
      </div></div>
    <div class="fiche-actions">
      <button class="btn plein" data-act="animal" data-id="${a.id}">✏️ Modifier la fiche</button>
      <button class="btn" data-act="poids">⚖️ Noter un poids</button>
      <button class="btn" data-act="souvenir">📸 Ajouter un souvenir</button>
      <button class="btn" data-act="choisir" data-id="" data-p="animaux">← Tous mes animaux</button>
    </div>
  </section>
  <div style="height:16px"></div>
  <div class="grille-2">
    <section class="carte">${carteT('📌', 'Informations importantes', '', `<button class="btn petit" style="margin-left:auto" data-act="animal" data-id="${a.id}">Modifier</button>`)}
      <div class="importantes">
        <div class="imp ${a.allergies ? 'accent' : ''}"><div class="t">⚠️ Allergies connues</div><p>${esc(a.allergies) || '<span style="color:var(--ink-3)">Aucune notée</span>'}</p></div>
        <div class="imp ${a.sensibilites ? 'accent' : ''}"><div class="t">🥣 Sensibilités alimentaires</div><p>${esc(a.sensibilites) || '<span style="color:var(--ink-3)">Aucune notée</span>'}</p></div>
        <div class="imp"><div class="t">🔖 Puce / identification</div><p>${esc(a.puce) || '<span style="color:var(--ink-3)">Non renseignée</span>'}</p></div>
        <div class="imp"><div class="t">🛡️ Assurance</div><p>${[a.assureur, a.contrat && 'Contrat ' + a.contrat, a.assuranceTel].filter(Boolean).map(esc).join('\n') || '<span style="color:var(--ink-3)">Non renseignée</span>'}</p></div>
      </div>
      <div class="groupe-t" style="margin-top:14px">📞 Contacts utiles${contactsUrg.length ? '' : ''}</div>
      ${contactsUrg.length ? contactsUrg.map(c => `<div class="ligne"><span class="em">${T_CONTACT[c.type][0]}</span><div class="txt"><b>${esc(c.nom)}</b><span>${T_CONTACT[c.type][1]}</span></div>${c.tel ? `<a class="meta" href="tel:${esc(c.tel.replace(/\s/g, ''))}">📞 ${esc(c.tel)}</a>` : ''}</div>`).join('')
        : `<div class="vide">Aucun vétérinaire ni contact d'urgence. <button class="lien-carte" style="margin:0" data-act="contact">＋ Ajouter</button></div>`}
      ${a.notes ? `<div class="imp" style="margin-top:10px"><div class="t">📝 Notes</div><p>${esc(a.notes)}</p></div>` : ''}
    </section>

    <section class="carte">${carteT('⚖️', 'Suivi du poids', p.length ? pluriel(p.length, 'pesée') : '', `<button class="btn petit" style="margin-left:${p.length ? '8px' : 'auto'}" data-act="poids">＋ Pesée</button>`)}
      ${p.length >= 2 ? courbePoids(p) : p.length === 1 ? `<div class="gros-chiffre">${nbFr(p[0].kg, 2)} <small>kg · le ${dateMoy(lire(p[0].date))}</small></div><p class="vide">Une deuxième pesée et la courbe apparaîtra.</p>` : videJoli('⚖️', 'Notez les pesées (chez le vétérinaire ou à la maison) pour suivre l’évolution.')}
      ${p.length ? `<div class="groupe-t">Dernières pesées</div>${p.slice(-4).reverse().map(x => `<div class="ligne cliquable" data-act="poids" data-id="${x.id}"><span class="em">⚖️</span><div class="txt"><b>${nbFr(x.kg, 2)} kg</b><span>${dateLongue(lire(x.date))}${x.note ? ' · ' + esc(x.note) : ''}</span></div></div>`).join('')}` : ''}
      <div class="avert" style="margin:8px 0 0">Pour savoir quel poids est idéal pour ${esc(a.nom)}, fiez-vous à votre vétérinaire.</div>
    </section>

    <section class="carte">${carteT('🍽️', 'Repas planifiés', repas.length || '', `<button class="btn petit" style="margin-left:${repas.length ? '8px' : 'auto'}" data-act="repas">＋ Repas</button>`)}
      ${repas.length ? repas.map(r => `<div class="ligne cliquable" data-act="repas" data-id="${r.id}"><span class="em">🍽️</span><div class="txt"><b>${esc(r.aliment || 'Repas')}${r.quantite ? ' · ' + esc(r.quantite) : ''}</b><span>${esc(r.notes) || 'Chaque jour'}</span></div>${r.heure ? `<span class="meta">${fmtH(r.heure)}</span>` : ''}</div>`).join('')
        : videJoli('🥣', 'Planifiez les repas : heure, type d’alimentation, quantité et notes.')}
      ${a.sensibilites ? `<div class="note-douce"><span class="em">🥣</span><div>À garder en tête : ${esc(a.sensibilites)}</div></div>` : ''}
    </section>

    <section class="carte">${carteT('🔔', 'Rappels', rappels.length || '', `<button class="btn petit" style="margin-left:${rappels.length ? '8px' : 'auto'}" data-act="rappel">＋ Rappel</button>`)}
      ${rappels.length ? rappels.map(ligneRappel).join('') : videJoli('🔔', 'Promenades, eau, brossage, antiparasitaire, médicaments prescrits…')}
    </section>

    <section class="carte">${carteT('🩺', 'Santé récente', '', `<button class="btn petit" style="margin-left:auto" data-act="soin">＋ Soin</button>`)}
      ${sante.length ? sante.map(ligneSoin).join('') : videJoli('💉', 'Vaccins, vermifuges, antiparasitaires, traitements : gardez tout ici.')}
      <button class="lien-carte" data-act="go" data-p="sante" data-s="carnet">Carnet de santé complet →</button>
    </section>

    <section class="carte">${carteT('💶', 'Budget', String(auj().getFullYear()))}
      <div class="mini-stat"><span>Ce mois-ci <b>${euros(totM)}</b></span><span>Cette année <b>${euros(totA)}</b></span><span>Budget mensuel <b>${bud ? euros(bud) : '—'}</b></span></div>
      ${bud ? `<div class="jauge"><i style="width:${Math.min(100, Math.round(totM / bud * 100))}%"></i></div>` : ''}
      <div class="groupe-t">🎉 Dates à fêter</div>
      ${n ? `<div class="ligne"><span class="em">🎂</span><div class="txt"><b>${pluriel(n.ans, 'an')}</b><span>${dateLongue(n.date)}</span></div><span class="meta">${n.dans === 0 ? "aujourd'hui" : 'J-' + n.dans}</span></div>` : ''}
      ${ad ? `<div class="ligne"><span class="em">🏡</span><div class="txt"><b>${pluriel(ad.ans, 'an')} d'adoption</b><span>${dateLongue(ad.date)}</span></div><span class="meta">${ad.dans === 0 ? "aujourd'hui" : 'J-' + ad.dans}</span></div>` : ''}
      ${!n && !ad ? '<div class="vide">Ajoutez la date de naissance ou d’adoption pour ne jamais les oublier.</div>' : ''}
    </section>
  </div>`;
}
function courbePoids(p) {
  const W = 560, H = 210, g = 38, d = 16, h = 16, b = 28;
  const xs = p.map(x => lire(x.date).getTime()), ys = p.map(x => nombre(x.kg));
  const x0 = Math.min(...xs), x1 = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys);
  const marge = Math.max(.2, (yMax - yMin) * .25), y0 = Math.max(0, yMin - marge), y1 = yMax + marge;
  const X = t => g + (x1 === x0 ? (W - g - d) / 2 : (t - x0) / (x1 - x0) * (W - g - d));
  const Y = v => h + (1 - (v - y0) / (y1 - y0)) * (H - h - b);
  const pts = p.map((x, i) => [X(xs[i]), Y(ys[i])]);
  const ligne = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const graduations = [0, .5, 1].map(k => y0 + (y1 - y0) * k);
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de poids">
    <defs><linearGradient id="aire-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity=".32"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></linearGradient></defs>
    ${graduations.map(v => `<line class="axe" x1="${g}" x2="${W - d}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="lbl" x="${g - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end">${nbFr(v)}</text>`).join('')}
    <path class="aire" d="${ligne}L${pts[pts.length - 1][0].toFixed(1)} ${H - b}L${pts[0][0].toFixed(1)} ${H - b}Z"/>
    <path class="trace" d="${ligne}"/>
    ${pts.map((q, i) => `<circle class="pt" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4.5"><title>${nbFr(ys[i], 2)} kg — ${dateMoy(lire(p[i].date))}</title></circle>`).join('')}
    <text class="val" x="${pts[pts.length - 1][0].toFixed(1)}" y="${(pts[pts.length - 1][1] - 10).toFixed(1)}" text-anchor="end">${nbFr(ys[ys.length - 1], 2)} kg</text>
    <text class="lbl" x="${g}" y="${H - 8}">${dateCourte(lire(p[0].date))} ${lire(p[0].date).getFullYear()}</text>
    <text class="lbl" x="${W - d}" y="${H - 8}" text-anchor="end">${dateCourte(lire(p[p.length - 1].date))} ${lire(p[p.length - 1].date).getFullYear()}</text></svg>`;
}
function ligneRappel(r) {
  const pf = prochaineFois(r);
  return `<div class="ligne cliquable" data-act="rappel" data-id="${r.id}"><span class="em">${T_RAPPEL[r.type]?.[0] || '🔔'}</span>
    <div class="txt"><b>${esc(r.titre || T_RAPPEL[r.type]?.[1])}</b><span>${r.animal ? esc(nomA(r.animal)) + ' · ' : 'Tout le foyer · '}${texteFreq(r)}${r.heures && r.heures.length ? ' · ' + r.heures.map(fmtH).join(', ') : ''}</span></div>
    <span class="meta">${pf ? (ecart(auj(), pf) <= 1 ? dansJours(ecart(auj(), pf)) : dateCourte(pf)) : 'terminé'}</span></div>`;
}
function ligneSoin(s) {
  return `<div class="ligne cliquable" data-act="soin" data-id="${s.id}"><span class="em">${T_SANTE[s.type]?.[0] || '📋'}</span>
    <div class="txt"><b>${esc(s.nom || T_SANTE[s.type]?.[1])}</b><span>${s.animal ? esc(nomA(s.animal)) + ' · ' : ''}${T_SANTE[s.type]?.[1]} · ${s.date ? dateMoy(lire(s.date)) : 'date inconnue'}${s.veto ? ' · ' + esc(s.veto) : ''}</span></div>
    ${s.prochain && !s.renouvele ? `<span class="meta ${ecart(auj(), lire(s.prochain)) <= 14 ? 'or' : ''}">↻ ${dateCourte(lire(s.prochain))}</span>` : ''}</div>`;
}

/* ============================================================
   Calendrier
   ============================================================ */
function evenementsDu(d) {
  const k = cle(d), l = [];
  for (const r of S.rdv.filter(pourAnimalStrict)) if (r.date === k) l.push({ c: '#8C93F2', em: T_RDV[r.type][0], t: `${r.heure ? fmtH(r.heure) + ' ' : ''}${r.titre || T_RDV[r.type][1]}`, a: r.animal, act: `data-act="rdv" data-id="${r.id}"` });
  for (const s of S.sante.filter(pourAnimalStrict)) {
    if (s.prochain === k && !s.renouvele) l.push({ c: '#F3C969', em: T_SANTE[s.type][0], t: `Rappel ${s.nom || T_SANTE[s.type][1]}`, a: s.animal, act: `data-act="soin-suivant" data-id="${s.id}"` });
    if (s.date === k) l.push({ c: '#7FD4B0', em: '✓', t: `${s.nom || T_SANTE[s.type][1]} fait`, a: s.animal, act: `data-act="soin" data-id="${s.id}"` });
  }
  for (const r of S.rappels.filter(pourAnimalStrict)) if (r.freq !== 'jour' && actifLe(r, d))
    l.push({ c: '#C9A8F5', em: T_RAPPEL[r.type][0], t: r.titre || T_RAPPEL[r.type][1], a: r.animal, act: `data-act="rappel" data-id="${r.id}"` });
  for (const a of actifs().filter(x => !V.animal || x.id === V.animal)) {
    if (a.naissance && a.naissance.slice(5) === k.slice(5) && a.naissance < k) l.push({ c: '#F0B8D0', em: '🎂', t: `Anniversaire de ${a.nom}`, a: a.id });
    if (a.adoption && a.adoption.slice(5) === k.slice(5) && a.adoption < k) l.push({ c: '#F0B8D0', em: '🏡', t: `Adoption de ${a.nom}`, a: a.id });
  }
  for (const j of S.journal.filter(pourAnimalStrict)) if (j.date === k) l.push({ c: '#A8E0D6', em: T_JOURNAL[j.type][0], t: j.titre || T_JOURNAL[j.type][1], a: j.animal, act: `data-act="journal" data-id="${j.id}"` });
  const v = S.vacances;
  if (v.depart && v.depart === k) l.push({ c: '#9FC3F2', em: '🧳', t: 'Départ en vacances', act: 'data-act="go" data-p="vacances"' });
  if (v.retour && v.retour === k) l.push({ c: '#9FC3F2', em: '🏠', t: 'Retour de vacances', act: 'data-act="go" data-p="vacances"' });
  return l;
}
PAGES.calendrier = () => {
  const [y, mo] = V.calMois.split('-').map(Number), prem = new Date(y, mo - 1, 1), debut = lundi(prem), a = auj();
  let h = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(j => `<div class="jn">${j}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = plus(debut, i);
    if (i >= 35 && d.getMonth() !== mo - 1) break;
    const ev = evenementsDu(d), k = cle(d);
    h += `<div class="j ${d.getMonth() !== mo - 1 ? 'hors' : ''} ${k === cle(a) ? 'auj' : ''} ${k === V.calJour ? 'sel' : ''}" data-act="cal-jour" data-d="${k}">
      <span class="n">${d.getDate()}</span>${ev.slice(0, 3).map(e => `<span class="ev" style="--c:${e.c}">${e.em} ${esc(e.t)}</span>`).join('')}${ev.length > 3 ? `<span class="plus">+${ev.length - 3}</span>` : ''}</div>`;
  }
  const dj = lire(V.calJour), evj = evenementsDu(dj), tj = tachesDu(dj).filter(t => t.type !== 'rdv' && t.type !== 'sante');
  return `
  <div class="titre-page"><h2>📅 <span>Calendrier</span></h2><div class="spacer"></div><button class="btn" data-act="rappel">🔔 Rappel</button><button class="btn plein" data-act="rdv">📅 Rendez-vous</button></div>
  <p class="chapo">Tous les rendez-vous, rappels de soins, anniversaires et moments ${pourQui()}, réunis sur un seul calendrier.</p>
  <div class="cal-mise">
    <section class="carte">
      <div class="cal-nav"><button class="rond" data-act="cal-mois" data-n="-1" aria-label="Mois précédent">‹</button><h3>${cap(MOIS[mo - 1])} ${y}</h3>
        <button class="rond" data-act="cal-mois" data-n="1" aria-label="Mois suivant">›</button><div class="spacer"></div><button class="btn petit" data-act="cal-mois" data-n="0">Aujourd'hui</button></div>
      <div class="cal">${h}</div>
      <div class="legende"><span><i style="background:#8C93F2"></i>Rendez-vous</span><span><i style="background:#F3C969"></i>Rappel de soin</span><span><i style="background:#7FD4B0"></i>Soin effectué</span>
        <span><i style="background:#C9A8F5"></i>Rappel</span><span><i style="background:#F0B8D0"></i>Anniversaire</span><span><i style="background:#A8E0D6"></i>Journal</span><span><i style="background:#9FC3F2"></i>Vacances</span></div>
    </section>
    <section class="carte">${carteT('🗓️', cap(dateLongue(dj)))}
      ${evj.length ? evj.map(e => `<div class="ligne ${e.act ? 'cliquable' : ''}" ${e.act || ''}><span class="em">${e.em}</span><div class="txt"><b>${esc(e.t)}</b><span>${e.a ? esc(nomA(e.a)) : ''}</span></div></div>`).join('') : '<div class="vide">Aucun événement ce jour-là.</div>'}
      ${tj.length ? `<div class="groupe-t">Routine du jour<span class="compte">${tj.length}</span></div>${tj.map(t => ligneTache(t, dj)).join('')}` : ''}
      <div class="pied" style="margin-top:12px"><button class="btn petit" data-act="rdv" data-date="${V.calJour}">＋ Rendez-vous ce jour</button><button class="btn petit" data-act="journal" data-date="${V.calJour}">＋ Moment</button></div>
    </section>
  </div>`;
};

/* ============================================================
   Santé : rendez-vous, carnet, poids
   ============================================================ */
PAGES.sante = () => {
  const s = V.sous.sante;
  let corps = '';
  if (s === 'rdv') {
    const tous = S.rdv.filter(pourAnimalStrict).sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
    const futurs = tous.filter(r => r.date >= cle(auj()) && !r.fait), passes = tous.filter(r => r.date < cle(auj()) || r.fait).reverse();
    const ligne = r => `<div class="ligne cliquable ${r.fait ? 'fait' : ''}" data-act="rdv" data-id="${r.id}"><span class="em">${T_RDV[r.type][0]}</span>
      <div class="txt"><b>${esc(r.titre || T_RDV[r.type][1])}</b><span>${esc(nomA(r.animal))} · ${r.date ? dateLongue(lire(r.date)) : ''}${r.heure ? ' · ' + fmtH(r.heure) : ''}${r.lieu ? ' · ' + esc(r.lieu) : ''}</span></div>
      ${r.date >= cle(auj()) && !r.fait ? `<span class="meta">${ecart(auj(), lire(r.date)) <= 1 ? dansJours(ecart(auj(), lire(r.date))) : 'J-' + ecart(auj(), lire(r.date))}</span>` : ''}</div>`;
    corps = `<div class="grille-2">
      <section class="carte">${carteT('📅', 'À venir', futurs.length || '', '<button class="btn petit plein" style="margin-left:8px" data-act="rdv">＋ Rendez-vous</button>')}
        ${futurs.length ? futurs.map(ligne).join('') : videJoli('🗓️', 'Aucun rendez-vous à venir.')}</section>
      <section class="carte">${carteT('📚', 'Historique des rendez-vous', passes.length || '')}
        ${passes.length ? passes.slice(0, 30).map(ligne).join('') : '<div class="vide">Les rendez-vous passés s’afficheront ici.</div>'}</section></div>`;
  } else if (s === 'carnet') {
    const f = V.filtreSante;
    const l = S.sante.filter(pourAnimalStrict).filter(x => f === 'tout' || x.type === f).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    const prochains = S.sante.filter(pourAnimalStrict).filter(x => x.prochain && !x.renouvele).sort((a, b) => a.prochain < b.prochain ? -1 : 1);
    corps = `<div class="grille-2">
      <section class="carte">${carteT('📖', 'Historique des soins', l.length || '', '<button class="btn petit plein" style="margin-left:8px" data-act="soin">＋ Noter un soin</button>')}
        <div class="filtres">${[['tout', 'Tout'], ...opts(T_SANTE)].map(([k, lb]) => `<button class="${f === k ? 'on' : ''}" data-act="filtre-sante" data-f="${k}">${lb}</button>`).join('')}</div>
        ${l.length ? l.map(ligneSoin).join('') : videJoli('💉', 'Notez les vaccins, vermifuges, antiparasitaires et traitements tels qu’ils figurent sur le carnet ou l’ordonnance.')}</section>
      <section class="carte">${carteT('↻', 'Prochains renouvellements', prochains.length || '')}
        ${prochains.length ? prochains.map(x => { const n = ecart(auj(), lire(x.prochain)); return `<div class="ligne"><span class="em">${T_SANTE[x.type][0]}</span>
          <div class="txt"><b>${esc(x.nom || T_SANTE[x.type][1])}</b><span>${esc(nomA(x.animal))} · ${dateLongue(lire(x.prochain))}</span></div>
          <span class="meta ${n <= 14 ? 'or' : ''}">${n < 0 ? 'à mettre à jour' : n <= 1 ? dansJours(n) : 'J-' + n}</span>
          <button class="btn petit" data-act="soin-suivant" data-id="${x.id}">✓ Fait</button></div>`; }).join('') : '<div class="vide">Indiquez une date de rappel en notant un soin : elle apparaîtra ici et dans le calendrier.</div>'}
        <div class="note-douce"><span class="em">🩺</span><div>NaoPets garde la trace de ce qui a été fait et de ce que votre vétérinaire a prévu. <b>Le choix des vaccins, des traitements et des dosages reste toujours le sien.</b></div></div>
      </section></div>`;
  } else {
    const liste = V.animal ? [animal(V.animal)] : actifs();
    corps = `<div class="grille-2">${liste.map(a => { const p = poidsDe(a.id); return `<section class="carte">${carteT(avatar(a, 't'), esc(a.nom), p.length ? pluriel(p.length, 'pesée') : '', `<button class="btn petit" style="margin-left:8px" data-act="poids" data-animal="${a.id}">＋ Pesée</button>`)}
      ${p.length >= 2 ? courbePoids(p) : p.length ? `<div class="gros-chiffre">${nbFr(p[0].kg, 2)} <small>kg · ${dateMoy(lire(p[0].date))}</small></div>` : '<div class="vide">Aucune pesée pour le moment.</div>'}
      ${p.length ? p.slice().reverse().slice(0, 6).map(x => `<div class="ligne cliquable" data-act="poids" data-id="${x.id}"><span class="em">⚖️</span><div class="txt"><b>${nbFr(x.kg, 2)} kg</b><span>${dateLongue(lire(x.date))}${x.note ? ' · ' + esc(x.note) : ''}</span></div></div>`).join('') : ''}</section>`; }).join('')}</div>`;
  }
  return `<div class="titre-page"><h2>🩺 Santé & <span>rendez-vous</span></h2></div>
    <p class="chapo">Rendez-vous, carnet de santé et poids ${pourQui()}. Un outil pour s'organiser — pour tout conseil de santé, votre vétérinaire reste la bonne personne.
      Les rendez-vous apparaissent aussi dans <a href="../NaoAgenda/NaoAgenda.html" target="_blank" rel="noopener">NaoAgenda</a> 🐾, où ils restent modifiables.</p>
    ${sousPages('sante', [['rdv', '📅 Rendez-vous'], ['carnet', '📖 Carnet de santé'], ['poids', '⚖️ Poids']])}${corps}`;
};

/* ============================================================
   Quotidien : aujourd'hui, rappels, repas, journal
   ============================================================ */
PAGES.quotidien = () => {
  const s = V.sous.quotidien;
  let corps = '';
  if (s === 'aujourdhui') {
    const t = tachesDu(auj()), dem = tachesDu(plus(auj(), 1));
    const groupes = [['🌅 Matin', x => (x.heure || '') && x.heure < '12:00'], ['☀️ Après-midi', x => x.heure >= '12:00' && x.heure < '18:00'], ['🌙 Soir', x => x.heure >= '18:00'], ['🕊️ Dans la journée', x => !x.heure]];
    corps = `<div class="grille-2">
      <section class="carte">${carteT('☀️', cap(dateLongue(auj())), `${t.filter(x => x.fait).length} / ${t.length}`)}
        ${t.length ? `<div class="jauge" style="margin:-4px 0 6px"><i style="width:${Math.round(t.filter(x => x.fait).length / t.length * 100)}%"></i></div>` + groupes.map(([lb, f]) => { const g = t.filter(f); return g.length ? `<div class="groupe-t">${lb}<span class="compte">${g.length}</span></div>${g.map(x => ligneTache(x)).join('')}` : ''; }).join('')
          : videJoli('🌿', "Rien de programmé aujourd'hui.", '<button class="btn petit" data-act="rappel">🔔 Ajouter un rappel</button>')}</section>
      <section class="carte">${carteT('🌙', 'Demain', dem.length || '')}
        ${dem.length ? dem.map(x => `<div class="ligne"><span class="em">${x.em}</span><div class="txt"><b>${esc(x.titre)}</b><span>${x.animal ? esc(nomA(x.animal)) : 'Tout le foyer'}${x.sous ? ' · ' + esc(x.sous) : ''}</span></div>${x.heure ? `<span class="meta">${fmtH(x.heure)}</span>` : ''}</div>`).join('') : '<div class="vide">Rien de prévu demain.</div>'}
        <div class="groupe-t">Noter un moment</div>
        <div class="choix">${Object.entries(T_JOURNAL).map(([k, v]) => `<button class="btn petit" data-act="journal" data-type="${k}">${v[0]} ${v[1]}</button>`).join('')}</div></section></div>`;
  } else if (s === 'rappels') {
    const l = S.rappels.filter(pourAnimal);
    const parType = Object.keys(T_RAPPEL).map(k => [k, l.filter(r => r.type === k)]).filter(x => x[1].length);
    corps = `<section class="carte">${carteT('🔔', 'Rappels récurrents', l.length || '', '<button class="btn petit plein" style="margin-left:8px" data-act="rappel">＋ Rappel</button>')}
      ${parType.length ? parType.map(([k, g]) => `<div class="groupe-t">${T_RAPPEL[k][0]} ${T_RAPPEL[k][1]}<span class="compte">${g.length}</span></div>${g.map(ligneRappel).join('')}`).join('')
        : videJoli('🔔', 'Créez des rappels pour les promenades, l’eau, le brossage, les antiparasitaires ou les médicaments prescrits.')}
      <div class="note-douce"><span class="em">💊</span><div>Pour un médicament, recopiez simplement la posologie de l’ordonnance. <b>NaoPets ne calcule ni ne modifie jamais un dosage</b> : en cas de doute, demandez à votre vétérinaire.</div></div></section>`;
  } else if (s === 'repas') {
    const liste = V.animal ? [animal(V.animal)] : actifs();
    corps = `<div class="grille">${liste.map(a => { const r = S.repas.filter(x => x.animal === a.id).sort((x, y) => (x.heure || '') < (y.heure || '') ? -1 : 1);
      return `<section class="carte">${carteT(avatar(a, 't'), esc(a.nom), r.length ? pluriel(r.length, 'repas', 'repas') : '', `<button class="btn petit" style="margin-left:8px" data-act="repas" data-animal="${a.id}">＋ Repas</button>`)}
        ${r.length ? r.map(x => `<div class="ligne cliquable" data-act="repas" data-id="${x.id}"><span class="em">🍽️</span><div class="txt"><b>${esc(x.aliment || 'Repas')}${x.quantite ? ' · ' + esc(x.quantite) : ''}</b><span>${esc(x.notes) || 'Chaque jour'}</span></div>${x.heure ? `<span class="meta">${fmtH(x.heure)}</span>` : ''}</div>`).join('') : '<div class="vide">Aucun repas planifié.</div>'}
        ${a.sensibilites ? `<div class="note-douce"><span class="em">🥣</span><div>${esc(a.sensibilites)}</div></div>` : ''}</section>`; }).join('')}</div>
      <div class="note-douce"><span class="em">🥣</span><div>Les repas planifiés apparaissent chaque jour dans « À faire aujourd’hui ». Pour les quantités adaptées à votre compagnon, suivez les conseils de votre vétérinaire.</div></div>`;
  } else {
    const f = V.filtreJournal;
    const l = S.journal.filter(pourAnimalStrict).filter(j => f === 'tout' || j.type === f).sort((a, b) => (b.date || '') + (b.heure || '') < (a.date || '') + (a.heure || '') ? -1 : 1);
    const sem = cle(plus(auj(), -6)), cette = S.journal.filter(pourAnimalStrict).filter(j => j.date >= sem);
    const stats = Object.keys(T_JOURNAL).map(k => [k, cette.filter(j => j.type === k)]).filter(x => x[1].length);
    corps = `<div class="grille-2">
      <section class="carte">${carteT('📔', 'Journal du quotidien', l.length || '', '<button class="btn petit plein" style="margin-left:8px" data-act="journal">＋ Moment</button>')}
        <div class="filtres">${[['tout', 'Tout'], ...opts(T_JOURNAL)].map(([k, lb]) => `<button class="${f === k ? 'on' : ''}" data-act="filtre-journal" data-f="${k}">${lb}</button>`).join('')}</div>
        ${l.length ? l.slice(0, 40).map(j => `<div class="ligne cliquable" data-act="journal" data-id="${j.id}"><span class="em">${T_JOURNAL[j.type][0]}</span>
          <div class="txt"><b>${esc(j.titre || T_JOURNAL[j.type][1])}${j.duree ? ' · ' + esc(j.duree) + ' min' : ''}</b><span>${esc(nomA(j.animal))} · ${dateLongue(lire(j.date))}${j.heure ? ' · ' + fmtH(j.heure) : ''}${j.notes ? ' · ' + esc(j.notes) : ''}</span></div></div>`).join('')
          : videJoli('📔', 'Promenades, jeux, bains, coupe des griffes, apprentissages, garderie : notez les moments du quotidien.')}</section>
      <section class="carte">${carteT('🌿', '7 derniers jours', cette.length || '')}
        ${stats.length ? `<div class="repartition">${stats.map(([k, g]) => `<div class="r"><span>${T_JOURNAL[k][0]} ${T_JOURNAL[k][1]}</span><div class="jauge"><i style="width:${Math.round(g.length / Math.max(...stats.map(x => x[1].length)) * 100)}%"></i></div><b>${g.length}×${g.some(x => x.duree) ? ` · ${g.reduce((s, x) => s + nombre(x.duree), 0)} min` : ''}</b></div>`).join('')}</div>` : '<div class="vide">Rien de noté cette semaine.</div>'}
        <div class="groupe-t">Noter en un clic</div>
        <div class="choix">${Object.entries(T_JOURNAL).map(([k, v]) => `<button class="btn petit" data-act="journal" data-type="${k}">${v[0]} ${v[1]}</button>`).join('')}</div></section></div>`;
  }
  return `<div class="titre-page"><h2>🦴 Le <span>quotidien</span></h2></div>
    <p class="chapo">La routine ${pourQui()} : les tâches du jour, les rappels récurrents, les repas planifiés et le journal des petits moments.</p>
    ${sousPages('quotidien', [['aujourdhui', "☀️ Aujourd'hui"], ['rappels', '🔔 Rappels'], ['repas', '🍽️ Repas'], ['journal', '📔 Journal']])}${corps}`;
};

/* ============================================================
   Stock
   ============================================================ */
PAGES.stock = () => {
  const l = S.stock.filter(pourAnimal);
  const cats = Object.keys(T_STOCK).map(k => [k, l.filter(s => s.categorie === k)]).filter(x => x[1].length);
  const carte = s => {
    const q = nombre(s.quantite), c = nombre(s.capacite) || Math.max(q, nombre(s.seuil) * 3, 1), j = joursRestants(s), bas = stockBas(s);
    return `<div class="stock-item ${bas ? 'bas' : ''}">
      <div class="h"><span style="font-size:20px">${T_STOCK[s.categorie]?.[0] || '📦'}</span><b>${esc(s.nom)}</b><button class="rond petit" data-act="stock" data-id="${s.id}" aria-label="Modifier">✏️</button></div>
      <div class="jauge ${bas ? 'bas' : ''}"><i style="width:${Math.min(100, Math.round(q / c * 100))}%"></i></div>
      <div class="q"><span><b style="color:var(--titre)">${nbFr(q)}</b> ${esc(s.unite || '')}${s.capacite ? ' / ' + nbFr(s.capacite) : ''}</span><div class="spacer"></div>
        ${j != null ? `<span class="pastille ${bas ? 'att' : 'ok'}">≈ ${pluriel(j, 'jour')}</span>` : bas ? '<span class="pastille att">bientôt fini</span>' : '<span class="pastille ok">bien rempli</span>'}</div>
      <div class="q">${s.animal ? avatar(animal(s.animal), 't') + esc(nomA(s.animal)) : '🏡 Tout le foyer'}<div class="spacer"></div>
        <button class="rond petit" data-act="stock-moins" data-id="${s.id}" aria-label="Retirer une unité">−</button>
        <button class="rond petit" data-act="stock-plus" data-id="${s.id}" aria-label="Ajouter une unité">＋</button>
        <button class="btn petit" data-act="stock-plein" data-id="${s.id}">🛒 Racheté</button></div></div>`;
  };
  const bas = l.filter(stockBas);
  return `<div class="titre-page"><h2>📦 <span>Stock</span></h2><div class="spacer"></div><button class="btn plein" data-act="stock">＋ Suivre un article</button></div>
    <p class="chapo">Nourriture, friandises, litière, accessoires : NaoPets vous prévient tout en douceur quand il est temps de racheter.</p>
    ${bas.length ? `<div class="note-douce"><span class="em">🛒</span><div><b>Liste de courses :</b> ${bas.map(s => esc(s.nom)).join(', ')}.</div></div>` : ''}
    ${cats.length ? cats.map(([k, g]) => `<div class="section-t" style="margin-top:16px"><h2 style="font-size:18px">${T_STOCK[k][0]} ${T_STOCK[k][1]}</h2></div><div class="grille-stock">${g.map(carte).join('')}</div>`).join('')
      : `<section class="carte">${videJoli('📦', 'Suivez vos sacs de croquettes, la litière ou les friandises. Indiquez une consommation par jour pour estimer combien de temps il en reste.', '<button class="btn plein" data-act="stock">＋ Suivre un article</button>')}</section>`}`;
};

/* ============================================================
   Dépenses & budget
   ============================================================ */
PAGES.depenses = () => {
  const s = V.sous.depenses, id = V.animal;
  const [y, mo] = V.mois.split('-').map(Number);
  const val = d => id ? partPour(d, id) : nombre(d.montant);
  let corps = '';
  if (s === 'mois') {
    const l = S.depenses.filter(d => (d.date || '').startsWith(V.mois) && val(d) > 0).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    const tot = l.reduce((t, d) => t + val(d), 0), bud = budgetMensuel(id);
    const cats = Object.keys(T_DEPENSE).map(k => [k, l.filter(d => d.categorie === k).reduce((t, d) => t + val(d), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const parAnimal = actifs().map(a => [a, S.depenses.filter(d => (d.date || '').startsWith(V.mois)).reduce((t, d) => t + partPour(d, a.id), 0)]);
    corps = `<div class="grille-2">
      <section class="carte">${carteT('💶', `${cap(MOIS[mo - 1])} ${y}`)}
        <div class="budget-anneau">${anneau(tot, bud)}<div><div class="gros-chiffre">${eurosFin(tot)}</div>
          <div style="font-size:13px;color:var(--ink-3)">${bud ? `Budget mensuel : ${euros(bud)} · ${tot <= bud ? `reste ${euros(bud - tot)}` : `${euros(tot - bud)} au-delà`}` : 'Définissez un budget mensuel pour chaque animal.'}</div></div></div>
        ${cats.length ? `<div class="groupe-t" style="margin-top:14px">Par catégorie</div><div class="repartition">${cats.map(([k, v]) => `<div class="r"><span>${T_DEPENSE[k][0]} ${T_DEPENSE[k][1]}</span><div class="jauge"><i style="width:${Math.round(v / cats[0][1] * 100)}%;background:${T_DEPENSE[k][2]}"></i></div><b>${eurosFin(v)}</b></div>`).join('')}</div>` : ''}
        ${!id && parAnimal.length > 1 ? `<div class="groupe-t" style="margin-top:14px">Par animal <span class="compte">dépenses communes partagées</span></div>${parAnimal.map(([a, v]) => `<div class="ligne">${avatar(a, 't')}<div class="txt"><b>${esc(a.nom)}</b><span>${nombre(S.budgets[a.id]) ? 'Budget ' + euros(S.budgets[a.id]) : 'Pas de budget'}</span></div><span class="meta">${eurosFin(v)}</span></div>`).join('')}` : ''}
        <div class="pied" style="margin-top:12px"><button class="btn petit" data-act="budgets">🎯 Budgets mensuels</button></div></section>
      <section class="carte">${carteT('🧾', 'Les dépenses', l.length || '', '<button class="btn petit plein" style="margin-left:8px" data-act="depense">＋ Dépense</button>')}
        ${l.length ? l.map(d => `<div class="ligne cliquable" data-act="depense" data-id="${d.id}"><span class="em">${T_DEPENSE[d.categorie]?.[0] || '📦'}</span>
          <div class="txt"><b>${esc(d.libelle || T_DEPENSE[d.categorie]?.[1])}</b><span>${quiEst(d.animal)} · ${dateCourte(lire(d.date))}${id && !d.animal ? ` · part de ${euros(val(d), 2)} sur ${eurosFin(d.montant)}` : ''}</span></div><span class="meta">${eurosFin(id ? val(d) : d.montant)}</span></div>`).join('')
          : videJoli('🧾', 'Aucune dépense ce mois-ci.')}</section></div>`;
  } else {
    const an = String(y), l = S.depenses.filter(d => (d.date || '').startsWith(an));
    const mois = Array.from({ length: 12 }, (_, i) => l.filter(d => d.date.slice(5, 7) === pad(i + 1)).reduce((t, d) => t + val(d), 0));
    const tot = mois.reduce((a, b) => a + b, 0), max = Math.max(...mois, 1), bud = budgetMensuel(id) * 12;
    const cats = Object.keys(T_DEPENSE).map(k => [k, l.filter(d => d.categorie === k).reduce((t, d) => t + val(d), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const moisPleins = mois.filter(x => x > 0).length;
    corps = `<div class="grille-2">
      <section class="carte">${carteT('📈', `Année ${an}`)}
        <div class="mini-stat"><span>Total <b>${euros(tot)}</b></span><span>Moyenne mensuelle <b>${euros(moisPleins ? tot / moisPleins : 0)}</b></span><span>Budget annuel <b>${bud ? euros(bud) : '—'}</b></span></div>
        <div class="barres">${mois.map((v, i) => `<div class="${y === auj().getFullYear() && i === auj().getMonth() ? 'on' : ''}" title="${cap(MOIS[i])} : ${euros(v)}"><i style="height:${Math.round(v / max * 100)}%"></i><span>${MOIS_C[i].slice(0, 3)}</span></div>`).join('')}</div></section>
      <section class="carte">${carteT('🧩', 'Répartition de l’année')}
        ${cats.length ? `<div class="repartition">${cats.map(([k, v]) => `<div class="r"><span>${T_DEPENSE[k][0]} ${T_DEPENSE[k][1]}</span><div class="jauge"><i style="width:${Math.round(v / cats[0][1] * 100)}%;background:${T_DEPENSE[k][2]}"></i></div><b>${euros(v)}</b></div>`).join('')}</div>` : '<div class="vide">Aucune dépense cette année.</div>'}
        ${!id && actifs().length > 1 ? `<div class="groupe-t" style="margin-top:14px">Par animal</div>${actifs().map(a => `<div class="ligne">${avatar(a, 't')}<div class="txt"><b>${esc(a.nom)}</b><span>${nombre(S.budgets[a.id]) ? 'Budget annuel ' + euros(nombre(S.budgets[a.id]) * 12) : ''}</span></div><span class="meta">${euros(l.reduce((t, d) => t + partPour(d, a.id), 0))}</span></div>`).join('')}` : ''}</section></div>`;
  }
  const nav = s === 'mois'
    ? `<button class="rond" data-act="mois" data-n="-1" aria-label="Mois précédent">‹</button><b style="min-width:150px;text-align:center">${cap(MOIS[mo - 1])} ${y}</b><button class="rond" data-act="mois" data-n="1" aria-label="Mois suivant">›</button>`
    : `<button class="rond" data-act="mois" data-n="-12" aria-label="Année précédente">‹</button><b style="min-width:80px;text-align:center">${y}</b><button class="rond" data-act="mois" data-n="12" aria-label="Année suivante">›</button>`;
  return `<div class="titre-page"><h2>💶 Dépenses & <span>budget</span></h2><div class="spacer"></div>${nav}<button class="btn plein" data-act="depense">＋ Dépense</button></div>
    <p class="chapo">Alimentation, vétérinaire, assurance, accessoires, toilettage, pension, médicaments : le budget ${pourQui()}, mois par mois et sur l'année.</p>
    ${sousPages('depenses', [['mois', '🗓️ Mensuel'], ['annee', '📈 Annuel']])}${corps}`;
};

/* ============================================================
   Vacances
   ============================================================ */
PAGES.vacances = () => {
  const v = S.vacances, n = v.depart ? ecart(auj(), lire(v.depart)) : null;
  const faits = v.items.filter(i => i.fait).length, pct = v.items.length ? Math.round(faits / v.items.length * 100) : 0;
  const cats = [...new Set(v.items.map(i => i.cat || 'Divers'))];
  const garde = { emmene: '🚗 Il part avec nous', pension: '🏡 Pension', petsitter: '🤝 Pet-sitter', famille: '💜 Famille ou amis' }[v.garde] || '';
  return `<div class="titre-page"><h2>🧳 Avant les <span>vacances</span></h2><div class="spacer"></div><button class="btn plein" data-act="vacances">✏️ Le séjour</button></div>
    <p class="chapo">Une checklist pour partir l'esprit tranquille : documents, nourriture, balade, confort, soins et garde.</p>
    <section class="carte vac-h" style="margin-bottom:16px">
      <div><h3 style="font-size:22px">${v.destination ? esc(v.destination) : 'Prochain séjour'}</h3>
        <div style="color:var(--ink-2);margin:4px 0 8px">${v.depart ? `Du ${dateLongue(lire(v.depart))}${v.retour ? ` au ${dateLongue(lire(v.retour))}` : ''}` : 'Indiquez vos dates pour recevoir un rappel doux avant le départ.'}</div>
        ${garde ? `<span class="pastille acc">${garde}${v.gardeNom ? ' · ' + esc(v.gardeNom) : ''}${v.gardeTel ? ' · ' + esc(v.gardeTel) : ''}</span>` : ''}
        <div class="barre-prog"><i style="width:${pct}%"></i></div><div style="font-family:var(--ui);font-style:normal;font-size:12px;color:var(--ink-3)">${faits} / ${v.items.length} prêts · ${pct} %</div>
        ${v.consignes ? `<div class="imp" style="margin-top:10px"><div class="t">📝 Consignes pour la garde</div><p>${esc(v.consignes)}</p></div>` : ''}</div>
      ${n != null && n >= 0 ? `<div class="compteur-vac"><b>${n}</b><span>${n > 1 ? 'jours avant le départ' : n === 1 ? 'jour avant le départ' : "c'est le jour J !"}</span></div>` : ''}
    </section>
    <div class="grille">${cats.map(c => { const g = v.items.filter(i => (i.cat || 'Divers') === c); return `<section class="carte">${carteT({ Documents: '📄', Alimentation: '🥣', Balade: '🦮', Confort: '🧸', Soins: '💊', Garde: '🏡' }[c] || '✨', esc(c), `${g.filter(i => i.fait).length} / ${g.length}`)}
      ${g.map(i => `<div class="ligne ${i.fait ? 'fait' : ''}"><button class="coche ${i.fait ? 'on' : ''}" data-act="vac-cocher" data-id="${i.id}" aria-label="Cocher">✓</button><div class="txt"><b>${esc(i.texte)}</b></div>
        <div class="act"><button class="rond petit" data-act="vac-suppr" data-id="${i.id}" aria-label="Retirer">✕</button></div></div>`).join('')}</section>`; }).join('')}
      <section class="carte">${carteT('＋', 'Ajouter à la liste')}
        <form class="ajout-ligne" data-form="vac-ajout"><input type="text" name="texte" placeholder="Ex. : sa couverture préférée" required>
          <select name="cat">${[...new Set([...cats, 'Documents', 'Alimentation', 'Balade', 'Confort', 'Soins', 'Garde', 'Divers'])].map(c => `<option>${esc(c)}</option>`).join('')}</select>
          <button class="btn plein">Ajouter</button></form>
        <div class="pied"><button class="btn petit" data-act="vac-reinit">↺ Tout décocher</button><button class="btn petit" data-act="vac-defaut">✨ Liste d'origine</button></div></section></div>`;
};

/* ============================================================
   Souvenirs
   ============================================================ */
PAGES.souvenirs = () => {
  const l = S.souvenirs.filter(pourAnimalStrict).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
  const dates = datesImportantes(366);
  return `<div class="titre-page"><h2>📸 Mes <span>souvenirs</span></h2><div class="spacer"></div><button class="btn plein" data-act="souvenir">＋ Ajouter un souvenir</button></div>
    <p class="chapo">Les photos, les premières fois et les dates qui comptent ${pourQui()}.</p>
    <div class="cal-mise">
      <div>${l.length ? `<div class="souvenirs">${l.map(s => `<div class="souv" data-act="souvenir-voir" data-id="${s.id}"><div class="ph">${s.photo ? `<img src="${s.photo}" alt="">` : (animal(s.animal) ? `<span class="av g">${svgDessin(animal(s.animal).espece)}</span>` : '💜')}</div>
        <div class="c"><b>${esc(s.titre || 'Souvenir')}</b><span>${s.animal ? esc(nomA(s.animal)) + ' · ' : ''}${s.date ? dateMoy(lire(s.date)) : ''}</span>${s.texte ? `<p>${esc(s.texte)}</p>` : ''}</div></div>`).join('')}</div>`
        : `<section class="carte">${videJoli('📷', 'Son arrivée à la maison, sa première balade, sa bouille endormie… Gardez ici les moments qui comptent.', '<button class="btn plein" data-act="souvenir">📸 Premier souvenir</button>')}</section>`}</div>
      <section class="carte">${carteT('🎉', 'Dates importantes')}
        ${dates.length ? `<div class="dates-imp">${dates.map(x => `<div class="ligne">${avatar(x.a, 't')}<div class="txt"><b>${x.em} ${x.titre}</b><span>${dateLongue(x.date)}</span></div><span class="meta">${x.dans === 0 ? "aujourd'hui" : x.dans < 60 ? 'J-' + x.dans : dateCourte(x.date)}</span></div>`).join('')}</div>`
          : '<div class="vide">Ajoutez la date de naissance et la date d’adoption dans la fiche de chaque animal : les anniversaires apparaîtront ici.</div>'}</section>
    </div>`;
};

/* ============================================================
   Contacts
   ============================================================ */
PAGES.contacts = () => {
  const l = S.contacts.filter(c => !V.animal || !c.animaux || !c.animaux.length || c.animaux.includes(V.animal));
  const types = Object.keys(T_CONTACT).map(k => [k, l.filter(c => c.type === k)]).filter(x => x[1].length);
  return `<div class="titre-page"><h2>📇 <span>Contacts</span></h2><div class="spacer"></div><button class="btn plein" data-act="contact">＋ Ajouter un contact</button></div>
    <p class="chapo">Vétérinaire, clinique, toiletteur, pension, pet-sitter, contacts d'urgence : tout le monde à portée de main.</p>
    ${types.length ? `<div class="grille">${types.map(([k, g]) => `<section class="carte">${carteT(T_CONTACT[k][0], T_CONTACT[k][1], g.length)}
      ${g.map(c => `<div class="contact"><span class="em">${T_CONTACT[k][0]}</span><div class="txt"><b>${esc(c.nom)}</b>
        ${c.animaux && c.animaux.length ? `<span class="type">${c.animaux.map(nomA).map(esc).join(', ')}</span>` : '<span class="type">Tous les animaux</span>'}
        <div class="coord">${c.tel ? `<a href="tel:${esc(c.tel.replace(/\s/g, ''))}">📞 ${esc(c.tel)}</a>` : ''}${c.email ? `<a href="mailto:${esc(c.email)}">✉️ ${esc(c.email)}</a>` : ''}${c.adresse ? `<span>📍 ${esc(c.adresse)}</span>` : ''}${c.horaires ? `<span>🕘 ${esc(c.horaires)}</span>` : ''}</div>
        ${c.notes ? `<p>${esc(c.notes)}</p>` : ''}</div><button class="rond petit" data-act="contact" data-id="${c.id}" aria-label="Modifier">✏️</button></div>`).join('')}</section>`).join('')}</div>`
      : `<section class="carte">${videJoli('📇', 'Commencez par votre vétérinaire et une clinique d’urgence : en cas de besoin, leurs numéros seront là.', '<button class="btn plein" data-act="contact">＋ Ajouter un contact</button>')}</section>`}
    <div class="note-douce"><span class="em">🚑</span><div>Gardez toujours le numéro d'une <b>clinique vétérinaire de garde</b> : en cas de souci, c'est elle qu'il faut appeler, pas une application.</div></div>`;
};
