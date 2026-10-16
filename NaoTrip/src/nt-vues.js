/* ============================================================
   NaoTrip — les écrans. Chaque vue rend du HTML ; les clics passent
   tous par data-act, reçus dans ACT (voir plus bas).
   ============================================================ */
'use strict';
const ACT = {};

/* ---------- petites briques partagées ---------- */
const coche = (on, act, attrs) => `<button type="button" class="coche${on ? ' on' : ''}" data-act="${act}" ${attrs} aria-pressed="${on ? 'true' : 'false'}" aria-label="Cocher"></button>`;
const voyageursHTML = v => v.voyageurs.length
  ? `<div class="voyageurs">${v.voyageurs.map(p => `<span class="v"><i>${esc(initiales(p.nom))}</i>${esc(p.nom)}</span>`).join('')}</div>`
  : '<span class="muet ui" style="font-size:12px">Voyageurs à ajouter</span>';
const paysHTML = v => (v.pays || []).filter(c => PAYS[c]).map(c => `<span class="etiquette">${codePays(c)} ${esc(PAYS[c].nom)}</span>`).join(' ');
function titreVue(titre, sous, actions) {
  return `<div class="titre-vue"><div><h2>${titre}</h2>${sous ? `<p>${sous}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
}
function sansVoyage(quoi) {
  return `<div class="carte bienvenue"><div class="grand">🧳</div><h3>Aucun voyage pour l'instant</h3>
    <p>Créez un voyage pour ${esc(quoi)}. Destination, dates, voyageurs : le reste se range tout seul.</p>
    <div class="actions"><button class="btn plein" data-act="nouveau-voyage"><span class="e">✈️</span> Créer un voyage</button>
    <button class="btn" data-act="exemple"><span class="e">🗺️</span> Voir un exemple</button></div></div>`;
}
function badgeStatut(v) {
  const st = statutVoyage(v);
  if (st === 'avenir') { const j = joursEntre(auj(), v.debut); return `<span class="etiquette or">${j === 1 ? 'Demain' : 'J-' + j}</span>`; }
  if (st === 'encours') return '<span class="etiquette ok">En cours</span>';
  if (st === 'passe') return '<span class="etiquette">Terminé</span>';
  return '<span class="etiquette rose">En projet</span>';
}

/* ---------- les événements datés d'un voyage (réservations + horaires clés) ---------- */
function evenements(v) {
  const ev = [];
  v.reservations.forEach(r => {
    const [, e, nom, fam] = typeResa(r.type);
    const transport = fam === 'transport', heberg = r.type === 'hebergement';
    if (r.debut) ev.push({ quand: r.debut, e, titre: (heberg ? 'Check-in · ' : transport ? 'Départ · ' : '') + (r.titre || nom), sous: r.lieu, r, cle: 'debut' });
    if (r.embarquement && transport) ev.push({ quand: r.embarquement, e: '🛫', titre: 'Embarquement · ' + (r.titre || nom), sous: r.porte || r.lieu, r, cle: 'embarquement' });
    if (r.fin && (transport || heberg)) ev.push({ quand: r.fin, e: heberg ? '🔑' : '🛬', titre: (heberg ? 'Check-out · ' : 'Arrivée · ') + (r.titre || nom), sous: heberg ? r.lieu : r.arrivee, r, cle: 'fin' });
  });
  return ev.sort((a, b) => a.quand.localeCompare(b.quand));
}
function totauxBudget(v) {
  const prevu = somme(CATS_BUDGET, c => nombre(v.budget[c[0]]));
  const depense = somme(v.depenses, d => nombre(d.montant));
  const parCat = {}; CATS_BUDGET.forEach(c => parCat[c[0]] = 0);
  v.depenses.forEach(d => { parCat[d.categorie in parCat ? d.categorie : 'divers'] += nombre(d.montant); });
  return { prevu, depense, reste: prevu - depense, parCat };
}
function progressionPrep(v) {
  const tout = [...v.valise, ...v.documents, ...v.taches];
  return tout.length ? Math.round(tout.filter(x => x.fait).length / tout.length * 100) : 0;
}

/* ============================================================
   ACCUEIL
   ============================================================ */
function vueAccueil() {
  const v = voyage();
  const p = prochainVoyage();
  const hero = `<section class="carte hero">
    <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-tr"/></svg>
    <div class="txt"><h2>Nao<span>Trip</span></h2>
      <p class="slogan">« Préparez le départ, profitez du voyage. »</p>
      <p class="mission">Un week-end, une sortie, des vacances en couple, entre amis ou en famille : NaoTrip tient le planning, les réservations,
        la valise, le budget partagé et les papiers — et garde les souvenirs au retour.</p>
      <div class="actions">
        <button class="btn plein" data-act="nouveau-voyage"><span class="e">✈️</span> Créer un voyage</button>
        <button class="btn" data-act="ajout-resa"><span class="e">🎫</span> Ajouter une réservation</button>
        <button class="btn" data-act="vue" data-vue="valise"><span class="e">🧳</span> Préparer ma valise</button>
      </div></div>
    <svg class="horizon" viewBox="0 0 320 160" aria-hidden="true"><path d="M10 140Q120 20 300 60" fill="none" stroke="var(--motif)" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" opacity=".5"/>
      <circle cx="10" cy="140" r="5" fill="var(--accent)"/><circle cx="300" cy="60" r="5" fill="var(--or)"/></svg>
  </section>`;
  if (!S.voyages.length) return hero + sansVoyage('commencer') + carteMondeAccueil();
  if (!v) return hero + carteMondeAccueil();

  /* 2. Mon prochain voyage */
  const st = statutVoyage(v);
  const depart = departDe(v);
  let bloc = '';
  if (st === 'avenir' && depart) {
    bloc = `<div class="decompte" data-decompte="${depart.getTime()}"><div><b data-u="j">–</b><small>jours</small></div><div><b data-u="h">–</b><small>heures</small></div>
      <div><b data-u="m">–</b><small>minutes</small></div><div><b data-u="s">–</b><small>secondes</small></div></div>`;
  } else if (st === 'encours') {
    const n = joursEntre(v.debut, auj()) + 1, tot = joursEntre(v.debut, v.fin || v.debut) + 1;
    bloc = `<div class="en-route"><span class="gros">🌴</span><div><b class="chiffre" style="font-size:20px">Bon voyage !</b><div class="ui muet" style="font-size:13px">Jour ${n} sur ${tot} — profitez-en.</div></div></div>`;
  } else if (st === 'passe') {
    bloc = `<div class="en-route"><span class="gros">📸</span><div><b class="chiffre" style="font-size:20px">Voyage terminé</b><div class="ui muet" style="font-size:13px">Le carnet souvenir vous attend.</div></div>
      <button class="btn petit" data-act="vue" data-vue="souvenirs" style="margin-left:auto">Ouvrir le carnet</button></div>`;
  } else bloc = `<div class="en-route"><span class="gros">🗓️</span><div class="ui muet" style="font-size:13px">Ajoutez des dates pour lancer le compte à rebours.</div>
      <button class="btn petit" data-act="editer-voyage" data-id="${v.id}" style="margin-left:auto">Choisir les dates</button></div>`;
  let avance = 0;
  if (st === 'avenir' && v.creeLe) { const tot = parseJour(v.debut) - parseJour(v.creeLe), fait = new Date() - parseJour(v.creeLe); avance = tot > 0 ? Math.max(4, Math.min(96, fait / tot * 100)) : 50; }
  else if (st === 'encours' || st === 'passe') avance = 96;
  const [, te, tl] = typeVoyage(v.type);
  const carteProchain = `<article class="carte prochain large-2">
    <div class="coin">${badgeStatut(v)}<button class="mini" data-act="editer-voyage" data-id="${v.id}" title="Modifier le voyage">✎</button></div>
    <h3><span class="e">🧭</span>${p && p.id === v.id ? 'Mon prochain voyage' : 'Mon voyage'}</h3>
    <div class="destination">${esc(v.nom)}</div>
    <div class="quand"><span>${te} ${esc(tl)}</span>·<span>${esc(fmtPeriode(v))}</span>${v.destination ? `·<span>📍 ${esc(v.destination)}</span>` : ''}</div>
    ${bloc}
    <div class="trajet" aria-hidden="true"><i class="a"></i><span class="avion" style="left:${avance}%">✈️</span><i class="b"></i></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">${voyageursHTML(v)}<div>${paysHTML(v)}</div></div>
  </article>`;

  /* 3. Mon budget voyage */
  const b = totauxBudget(v);
  const pctB = b.prevu ? Math.round(b.depense / b.prevu * 100) : 0;
  const carteBudget = `<article class="carte">
    <h3><span class="e">💶</span>Mon budget voyage</h3><p class="chapo">${b.prevu ? `${pctB} % du budget prévu` : 'Aucun budget prévu pour l’instant'}</p>
    <div class="chiffres"><div><small>Prévu</small><b>${argent(b.prevu, v.devise)}</b></div><div><small>Dépensé</small><b>${argent(b.depense, v.devise)}</b></div></div>
    <div class="jauge${pctB > 100 ? ' trop' : ''}"><i style="width:${Math.min(100, pctB)}%"></i></div>
    <p class="ui" style="font-size:12.5px;margin:10px 0 12px;color:${b.reste < 0 ? 'var(--alerte)' : 'var(--ink-2)'}">${b.prevu ? (b.reste >= 0 ? 'Il reste ' + argent(b.reste, v.devise) : 'Dépassement de ' + argent(-b.reste, v.devise)) : ''}${v.voyageurs.length > 1 && b.depense ? ` · ${argent(b.depense / v.voyageurs.length, v.devise)} par personne` : ''}</p>
    <div class="actions"><button class="btn petit" data-act="ajout-depense">＋ Dépense</button><button class="lien" data-act="vue" data-vue="budget">Tout le budget →</button></div>
  </article>`;

  /* 4. Ma valise */
  const nv = v.valise.length, fv = v.valise.filter(x => x.fait).length, pv = nv ? Math.round(fv / nv * 100) : 0;
  const restants = v.valise.filter(x => !x.fait).slice(0, 4);
  const carteValise = `<article class="carte">
    <h3><span class="e">🧳</span>Ma valise</h3><p class="chapo">${nv ? `${fv} sur ${nv} affaires prêtes` : 'Liste vide — on la prépare ?'}</p>
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><div class="anneau" style="--p:${pv}"><b>${pv}%</b></div>
      <div class="liste" style="flex:1">${restants.map(x => `<div class="item" style="padding:6px 9px">${coche(false, 'basculer', `data-liste="valise" data-id="${x.id}"`)}<span class="corps"><span>${esc(x.nom)}</span></span></div>`).join('') || (nv ? '<span class="ui muet" style="font-size:13px">Tout est prêt ✨</span>' : '')}</div></div>
    <div class="actions">${nv ? '' : '<button class="btn petit plein" data-act="generer-valise">✨ Liste de base</button>'}<button class="lien" data-act="vue" data-vue="valise">Préparer ma valise →</button></div>
  </article>`;

  /* 5. Mes réservations */
  const maintenant = new Date();
  const evs = evenements(v), aVenir = evs.filter(e => parseDT(e.quand) >= maintenant);
  const montres = (aVenir.length ? aVenir : evs).slice(0, 4);
  const carteResa = `<article class="carte large-2">
    <h3><span class="e">🎫</span>Mes réservations</h3><p class="chapo">${pluriel(v.reservations.length, 'réservation')} · ${aVenir.length} horaire${aVenir.length > 1 ? 's' : ''} à venir</p>
    <div class="liste">${montres.map(e => `<button class="evt resa" data-act="editer-resa" data-id="${e.r.id}"><span>${e.e}</span><span style="flex:1"><b>${esc(e.titre)}</b><br><span class="muet">${esc(fmtDT(e.quand))}</span></span></button>`).join('') || '<div class="vide">Vols, trains, hôtels, billets…</div>'}</div>
    <div class="actions" style="margin-top:12px"><button class="btn petit" data-act="ajout-resa">＋ Réservation</button><button class="lien" data-act="vue" data-vue="reservations">Chronologie →</button></div>
  </article>`;

  /* 6. Planning visuel */
  const jours = listeJours(v.debut, v.fin);
  const planning = `<article class="carte pleine">
    <div class="coin"><button class="lien" data-act="vue" data-vue="planning">Planning détaillé →</button></div>
    <h3><span class="e">🗓️</span>Le planning des journées</h3><p class="chapo">${jours.length ? pluriel(jours.length, 'journée') + ' · touchez une activité pour la modifier' : 'Ajoutez des dates au voyage pour voir les journées'}</p>
    ${jours.length ? `<div class="jours">${jours.map((j, i) => colonneJour(v, j, i)).join('')}</div>` : ''}
  </article>`;

  /* 8. À ne pas oublier */
  const docs = v.documents.filter(d => !d.fait), taches = v.taches.filter(t => !t.fait).sort((a, b) => (b.jMoins || 0) - (a.jMoins || 0));
  const horaires = aVenir.filter(e => e.cle !== 'debut' || typeResa(e.r.type)[3] === 'transport' || e.r.type === 'hebergement').slice(0, 4);
  const oubli = `<article class="carte pleine">
    <h3><span class="e">📌</span>À ne pas oublier avant le départ</h3><p class="chapo">Préparation terminée à ${progressionPrep(v)} % — documents, tâches et horaires importants</p>
    <div class="grille g3">
      <div><div class="groupe-titre">🪪 Documents <span class="n">${v.documents.length - docs.length}/${v.documents.length}</span></div>
        <div class="liste">${docs.slice(0, 5).map(d => ligneCoche(d, 'documents', d.qui)).join('') || '<div class="vide">Tous les papiers sont prêts ✓</div>'}</div></div>
      <div><div class="groupe-titre">✅ Tâches <span class="n">${v.taches.length - taches.length}/${v.taches.length}</span></div>
        <div class="liste">${taches.slice(0, 5).map(t => ligneCoche(t, 'taches', echeanceTache(v, t))).join('') || '<div class="vide">Rien d’urgent ✓</div>'}</div></div>
      <div><div class="groupe-titre">⏰ Horaires importants</div>
        <div class="liste">${horaires.map(e => `<div class="horaire"><span>${e.e}</span><span>${esc(e.titre)}</span><span class="q">${esc(fmtDT(e.quand))}</span></div>`).join('') || '<div class="vide">Départ, embarquement, check-in… apparaîtront ici</div>'}</div></div>
    </div>
    <div class="actions" style="margin-top:12px"><button class="lien" data-act="vue" data-vue="preparation">Toute la préparation →</button></div>
  </article>`;

  return hero + `<div class="grille g4">${carteProchain}${carteBudget}${carteValise}${carteResa}${carteMondeAccueil('large-2')}</div>
    <div class="grille" style="margin-top:16px">${planning}${oubli}</div>`;
}
function carteMondeAccueil(cls) {
  const st = statsMonde();
  return `<article class="carte ${cls || ''}" style="${cls ? '' : 'margin-top:16px'}">
    <div class="coin"><button class="btn petit plein" data-act="vue" data-vue="globe">🌍 Ouvrir mon globe</button></div>
    <h3><span class="e">🗺️</span>Ma carte du monde</h3>
    <p class="chapo">${pluriel(st.par.visite.length, 'pays visité', 'pays visités')} ✓ · ${pluriel(st.par.avenir.length, 'pays à venir', 'pays à venir')} 📍 · ${st.pct} % du monde — cliquez un pays pour le marquer</p>
    <div id="carteAccueil">${carteMondeSVG()}</div>
    <div class="legende"><span><i class="v"></i>✓ Visité</span><span><i class="a"></i>📍 À venir</span><span><i class="r"></i>♡ En rêve</span></div>
  </article>`;
}
function colonneJour(v, j, i) {
  const a = auj();
  const items = elementsDuJour(v, j);
  return `<div class="jour${j === a ? ' auj' : ''}${j < a ? ' passe' : ''}">
    <header><b>J${i + 1}</b><small>${esc(fmtJour(j))}</small><button class="lien" data-act="ajout-plan" data-jour="${j}" title="Ajouter">＋</button></header>
    ${items.map(evtJour).join('') || '<span class="ui muet" style="font-size:12px">Journée libre ☀️</span>'}
  </div>`;
}
function elementsDuJour(v, j) {
  const l = [];
  v.planning.filter(p => p.jour === j).forEach(p => l.push({ h: p.heure || '', e: typePlan(p.type)[1], t: p.titre, sous: p.lieu, fait: p.fait, act: 'editer-plan', id: p.id, cls: '' }));
  v.reservations.forEach(r => {
    if (r.debut && r.debut.slice(0, 10) === j) l.push({ h: fmtHeure(r.debut).replace('h', ':'), e: typeResa(r.type)[1], t: (r.type === 'hebergement' ? 'Check-in · ' : '') + (r.titre || typeResa(r.type)[2]), sous: r.lieu, act: 'editer-resa', id: r.id, cls: 'resa' });
    if (r.fin && r.fin.slice(0, 10) === j && r.type === 'hebergement') l.push({ h: fmtHeure(r.fin).replace('h', ':'), e: '🔑', t: 'Check-out · ' + (r.titre || 'Hébergement'), act: 'editer-resa', id: r.id, cls: 'resa' });
  });
  v.idees.filter(x => x.jour === j).forEach(x => l.push({ h: x.heure || '', e: TYPES_IDEE.find(t => t[0] === x.type)?.[1] || '💡', t: x.nom, sous: x.adresse, fait: x.statut === 'fait', act: 'editer-idee', id: x.id, cls: 'idee' }));
  return l.sort((a, b) => (a.h || '99').localeCompare(b.h || '99'));
}
const evtJour = x => `<button class="evt ${x.cls}${x.fait ? ' fait' : ''}" data-act="${x.act}" data-id="${x.id}">${x.h ? `<span class="h">${esc(x.h.replace(':', 'h'))}</span>` : ''}<span>${x.e}</span><span class="t">${esc(x.t)}</span></button>`;
function ligneCoche(x, liste, sous) {
  return `<div class="item${x.fait ? ' fait' : ''}">${coche(x.fait, 'basculer', `data-liste="${liste}" data-id="${x.id}"`)}
    <span class="corps"><b>${esc(x.nom)}</b>${sous ? `<small>${esc(sous)}</small>` : ''}</span>
    <span class="outils"><button class="mini" data-act="editer-${liste}" data-id="${x.id}" title="Modifier">✎</button><button class="mini" data-act="suppr" data-liste="${liste}" data-id="${x.id}" title="Retirer">✕</button></span></div>`;
}
function echeanceTache(v, t) {
  if (t.jMoins == null || t.jMoins === '' || !v.debut) return t.note || '';
  const d = ajouteJours(v.debut, -t.jMoins);
  const r = joursEntre(auj(), d);
  return `À faire ${t.jMoins > 0 ? 'J-' + t.jMoins : 'le jour J'} · ${fmtJour(d)}${r < 0 ? ' · en retard' : r === 0 ? ' · aujourd’hui' : ''}`;
}

/* ============================================================
   MES VOYAGES
   ============================================================ */
function vueVoyages() {
  const tri = [...S.voyages].sort((a, b) => (a.debut || '9999').localeCompare(b.debut || '9999'));
  const groupes = [
    ['En cours & à venir', tri.filter(v => ['encours', 'avenir'].includes(statutVoyage(v)))],
    ['En projet', tri.filter(v => statutVoyage(v) === 'projet')],
    ['Mes voyages passés', tri.filter(v => statutVoyage(v) === 'passe').reverse()]];
  const carte = v => {
    const [, e, l] = typeVoyage(v.type);
    const b = totauxBudget(v);
    return `<article class="carte voyage-carte${v.id === S.actif ? ' actif' : ''}">
      <div class="bandeau"><span class="e">${e}</span>${badgeStatut(v)}<h4>${esc(v.nom)}</h4><div class="dest">${esc(v.destination || l)}</div></div>
      <div class="infos"><span>🗓️ ${esc(fmtPeriode(v))}</span><span>👥 ${v.voyageurs.map(p => esc(p.nom)).join(', ') || '—'}</span>
        <span>🎫 ${pluriel(v.reservations.length, 'réservation')} · 💶 ${argent(b.depense, v.devise)}${b.prevu ? ' / ' + argent(b.prevu, v.devise) : ''}</span>
        <span>${paysHTML(v)}</span></div>
      <footer><button class="btn petit plein" data-act="ouvrir-voyage" data-id="${v.id}">Ouvrir</button>
        <button class="btn petit" data-act="editer-voyage" data-id="${v.id}">✎ Modifier</button>
        <button class="btn petit" data-act="dupliquer-voyage" data-id="${v.id}" title="Repartir de ce voyage">⧉</button>
        <button class="btn petit fin danger" data-act="suppr-voyage" data-id="${v.id}" title="Supprimer">🗑</button></footer>
    </article>`;
  };
  return titreVue('Mes <span>voyages</span>', 'Week-ends, sorties, vacances : tous vos départs au même endroit.',
    '<button class="btn plein" data-act="nouveau-voyage"><span class="e">✈️</span> Créer un voyage</button>')
    + (S.voyages.length ? groupes.filter(g => g[1].length).map(([t, l]) => `<div class="groupe-titre" style="margin-top:20px">${t} <span class="n">${l.length}</span></div><div class="grille g3">${l.map(carte).join('')}</div>`).join('')
      : sansVoyage('commencer'));
}

/* ============================================================
   PLANNING
   ============================================================ */
function vuePlanning() {
  const v = voyage(); if (!v) return sansVoyage('organiser les journées');
  const jours = listeJours(v.debut, v.fin);
  const entete = titreVue('Le <span>planning</span>', `${esc(v.nom)} · ${esc(fmtPeriode(v))}`,
    '<button class="btn plein" data-act="ajout-plan"><span class="e">＋</span> Ajouter au planning</button><button class="btn" data-act="vue" data-vue="idees">💡 Mes idées</button>');
  if (!jours.length) return entete + `<div class="carte bienvenue"><div class="grand">🗓️</div><h3>Le voyage n'a pas encore de dates</h3><p>Choisissez les dates pour voir apparaître chaque journée.</p><div class="actions"><button class="btn plein" data-act="editer-voyage" data-id="${v.id}">Choisir les dates</button></div></div>`;
  const a = auj();
  const sansJour = v.idees.filter(x => !x.jour && x.statut !== 'fait');
  return entete + `<div class="grille g2">${jours.map((j, i) => {
    const items = elementsDuJour(v, j);
    return `<section class="jour-plein${j === a ? ' auj' : ''}">
      <header><span class="num">J${i + 1}</span><div><b>${esc(fmtJour(j, true).replace(/ \d{4}$/, ''))}</b>${j === a ? ' <span class="etiquette ok">Aujourd’hui</span>' : ''}</div>
        <div class="actions"><button class="btn petit" data-act="ajout-plan" data-jour="${j}">＋</button></div></header>
      ${items.map(x => `<div class="plan-ligne${x.fait ? ' fait' : ''}"><span class="h">${esc((x.h || '—').replace(':', 'h'))}</span><span>${x.e}</span>
        <span class="t"><b class="ui">${esc(x.t)}</b>${x.sous ? `<small>${esc(x.sous)}</small>` : ''}${x.cls === 'resa' ? '<small>🎫 réservation</small>' : x.cls === 'idee' ? '<small>💡 idée programmée</small>' : ''}</span>
        <span class="actions">${x.act === 'editer-plan' ? coche(x.fait, 'basculer', `data-liste="planning" data-id="${x.id}"`) : ''}<button class="mini" data-act="${x.act}" data-id="${x.id}">✎</button></span></div>`).join('')
        || '<div class="vide">Journée libre — flâner compte aussi ☀️</div>'}
    </section>`;
  }).join('')}</div>
  ${sansJour.length ? `<article class="carte" style="margin-top:16px"><h3><span class="e">💡</span>Idées pas encore programmées</h3><p class="chapo">Donnez-leur un jour pour les voir dans le planning</p>
    <div class="grille g3">${sansJour.map(x => `<div class="item"><span>${TYPES_IDEE.find(t => t[0] === x.type)?.[1] || '💡'}</span><span class="corps"><b>${esc(x.nom)}</b><small>${esc(x.adresse || '')}</small></span><button class="btn petit" data-act="programmer-idee" data-id="${x.id}">Programmer</button></div>`).join('')}</div></article>` : ''}`;
}

/* ============================================================
   RÉSERVATIONS + chronologie
   ============================================================ */
function vueReservations() {
  const v = voyage(); if (!v) return sansVoyage('ranger les réservations');
  const familles = [['transport', '🚆 Transports'], ['hebergement', '🏨 Hébergements'], ['activite', '🎟️ Activités, billets & restaurants']];
  const carte = r => {
    const [, e, nom] = typeResa(r.type);
    const heb = r.type === 'hebergement';
    return `<div class="resa-carte" data-act="editer-resa" data-id="${r.id}" role="button" tabindex="0"><span class="ic">${e}</span>
      <div class="corps"><b>${esc(r.titre || nom)}</b>
        <small>${r.debut ? (heb ? 'Arrivée ' : '') + esc(fmtDT(r.debut)) : 'Date à préciser'}${r.fin ? ' → ' + esc(fmtDT(r.fin)) : ''}</small>
        ${r.lieu || r.arrivee ? `<small>📍 ${esc(r.lieu || '')}${r.arrivee ? ' → ' + esc(r.arrivee) : ''}</small>` : ''}
        ${r.reference ? `<small class="ref">N° ${esc(r.reference)}</small>` : ''}
        ${r.lien ? `<small><a href="${esc(r.lien)}" target="_blank" rel="noopener" data-stop>Ouvrir la réservation ↗</a></small>` : ''}</div>
      ${r.prix ? `<span class="prix">${argent(nombre(r.prix), v.devise)}</span>` : ''}</div>`;
  };
  const maintenant = new Date();
  const evs = evenements(v);
  const prochain = evs.find(e => parseDT(e.quand) >= maintenant);
  let jourCourant = '';
  const chrono = evs.map(e => {
    const j = e.quand.slice(0, 10), t = j !== jourCourant ? `<div class="jourc">${esc(fmtJour(j, true))}</div>` : '';
    jourCourant = j;
    const passe = parseDT(e.quand) < maintenant;
    return t + `<div class="ev${passe ? ' passe' : ''}${e === prochain ? ' prochain' : ''}" data-act="editer-resa" data-id="${e.r.id}"><span class="h">${esc(fmtHeure(e.quand) || '—')}</span><span class="ic">${e.e}</span>
      <span class="corps"><b>${esc(e.titre)}</b>${e.sous ? `<small>${esc(e.sous)}</small>` : ''}</span>${e === prochain ? '<span class="etiquette or">Prochain</span>' : ''}</div>`;
  }).join('');
  const total = somme(v.reservations, r => nombre(r.prix));
  return titreVue('Mes <span>réservations</span>', `${esc(v.nom)} · ${pluriel(v.reservations.length, 'réservation')}${total ? ' · ' + argent(total, v.devise) : ''}`,
    '<button class="btn plein" data-act="ajout-resa"><span class="e">＋</span> Ajouter une réservation</button>')
    + `<div class="grille g2"><div class="pile">${familles.map(([f, t]) => {
      const l = v.reservations.filter(r => typeResa(r.type)[3] === f).sort((a, b) => (a.debut || '9').localeCompare(b.debut || '9'));
      return `<article class="carte"><h3>${t}</h3><p class="chapo">${pluriel(l.length, 'réservation')}</p><div class="liste">${l.map(carte).join('') || '<div class="vide">Rien pour l’instant</div>'}</div></article>`;
    }).join('')}</div>
    <article class="carte" style="align-self:start"><h3><span class="e">⏱️</span>Vue chronologique</h3><p class="chapo">Départs, embarquements, check-in et check-out dans l'ordre</p>
      ${evs.length ? `<div class="chrono">${chrono}</div>` : '<div class="vide">Les horaires des réservations s’aligneront ici.</div>'}</article></div>`;
}

/* ============================================================
   VALISE
   ============================================================ */
let filtreValise = 'tous';
function vueValise() {
  const v = voyage(); if (!v) return sansVoyage('préparer la valise');
  const qui = [['tous', 'Tout le monde'], ...v.voyageurs.map(p => [p.id, p.nom])];
  if (!qui.some(q => q[0] === filtreValise)) filtreValise = 'tous';
  const items = v.valise.filter(x => filtreValise === 'tous' || !x.qui || x.qui === filtreValise);
  const n = items.length, f = items.filter(x => x.fait).length, p = n ? Math.round(f / n * 100) : 0;
  const cats = CATS_VALISE.map(c => [c, items.filter(x => (x.cat || 'divers') === c[0])]).filter(c => c[1].length);
  return titreVue('Ma <span>valise</span>', `${esc(v.nom)} · ${f} sur ${n} affaires prêtes`,
    '<button class="btn plein" data-act="ajout-valise"><span class="e">＋</span> Ajouter</button><button class="btn" data-act="generer-valise">✨ Liste de base</button>'
    + (v.valise.some(x => x.fait) ? '<button class="btn fin" data-act="vider-valise" title="Tout décocher pour le retour">↺ Tout décocher</button>' : ''))
    + `<div class="grille" style="grid-template-columns:minmax(0,260px) minmax(0,1fr)">
      <article class="carte" style="align-self:start;text-align:center"><div class="anneau" style="--p:${p};width:140px;height:140px;margin:6px auto 12px"><b style="font-size:30px">${p}%</b></div>
        <p class="ui muet" style="font-size:13px;margin:0 0 14px">${p === 100 ? 'Valise bouclée ! 🎉' : p > 60 ? 'Presque prête…' : 'On s’y met ?'}</p>
        ${v.voyageurs.length > 1 ? `<div class="groupe-titre">Pour qui</div><div class="liste">${qui.map(([id, nom]) => `<button class="btn petit${filtreValise === id ? ' plein' : ''}" data-act="filtre-valise" data-qui="${id}">${esc(nom)}</button>`).join('')}</div>` : ''}
      </article>
      <div class="grille g2">${cats.map(([[id, e, nom], l]) => `<article class="carte"><h3><span class="e">${e}</span>${esc(nom)}</h3><p class="chapo">${l.filter(x => x.fait).length}/${l.length}</p>
        <div class="liste">${l.map(x => ligneCoche(x, 'valise', [x.qte > 1 ? '× ' + x.qte : '', x.qui ? nomVoyageur(v, x.qui) : ''].filter(Boolean).join(' · '))).join('')}</div>
        <div class="actions" style="margin-top:10px"><button class="lien" data-act="ajout-valise" data-cat="${id}">＋ Ajouter ici</button></div></article>`).join('')
        || `<div class="carte pleine bienvenue"><div class="grand">🧳</div><h3>La valise est vide</h3><p>Générez une liste adaptée au voyage (durée, climat, enfants…), puis ajustez-la.</p><div class="actions"><button class="btn plein" data-act="generer-valise">✨ Générer ma liste</button></div></div>`}</div>
    </div>`;
}

/* ============================================================
   BUDGET, dépenses et répartition
   ============================================================ */
function repartition(v) {
  const soldes = {}; v.voyageurs.forEach(p => soldes[p.id] = { paye: 0, part: 0 });
  v.depenses.forEach(d => {
    const m = nombre(d.montant);
    const pour = (d.pour && d.pour.length ? d.pour : v.voyageurs.map(p => p.id)).filter(id => soldes[id]);
    if (soldes[d.payePar]) soldes[d.payePar].paye += m;
    pour.forEach(id => soldes[id].part += m / pour.length);
  });
  /* qui rembourse qui : les plus gros débiteurs vers les plus gros créanciers */
  const l = Object.entries(soldes).map(([id, s]) => ({ id, solde: Math.round((s.paye - s.part) * 100) / 100 }));
  const cred = l.filter(x => x.solde > .01).sort((a, b) => b.solde - a.solde), deb = l.filter(x => x.solde < -.01).sort((a, b) => a.solde - b.solde);
  const virements = [];
  let i = 0, j = 0;
  while (i < deb.length && j < cred.length) {
    const m = Math.min(-deb[i].solde, cred[j].solde);
    virements.push({ de: deb[i].id, a: cred[j].id, m });
    deb[i].solde += m; cred[j].solde -= m;
    if (deb[i].solde > -.01) i++;
    if (cred[j].solde < .01) j++;
  }
  return { soldes, virements };
}
function vueBudget() {
  const v = voyage(); if (!v) return sansVoyage('tenir le budget');
  const b = totauxBudget(v), D = v.devise;
  const nbJ = Math.max(1, listeJours(v.debut, v.fin).length);
  const { soldes, virements } = repartition(v);
  const deps = [...v.depenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return titreVue('Mon <span>budget</span>', `${esc(v.nom)} · en ${esc(D)}`,
    '<button class="btn plein" data-act="ajout-depense"><span class="e">＋</span> Ajouter une dépense</button><button class="btn" data-act="budget-prevu">✎ Budget prévisionnel</button>')
    + `<div class="chiffres" style="margin-bottom:16px"><div><small>Budget prévu</small><b>${argent(b.prevu, D)}</b></div><div><small>Dépensé</small><b>${argent(b.depense, D)}</b></div>
      <div><small>${b.reste >= 0 ? 'Reste' : 'Dépassement'}</small><b class="${b.reste >= 0 ? 'ok' : 'alerte'}">${argent(Math.abs(b.reste), D)}</b></div>
      <div><small>Par jour</small><b>${argent(b.depense / nbJ, D)}</b></div>${v.voyageurs.length ? `<div><small>Par personne</small><b>${argent(b.depense / v.voyageurs.length, D)}</b></div>` : ''}</div>
    <div class="grille g2">
      <article class="carte"><h3><span class="e">📊</span>Prévu et dépensé</h3><p class="chapo">Par catégorie</p>
        <div class="cat-lignes">${CATS_BUDGET.map(([id, e, nom]) => { const pr = nombre(v.budget[id]), de = b.parCat[id]; const pc = pr ? de / pr * 100 : (de ? 100 : 0);
          return `<div class="cat-ligne"><span>${e}</span><span>${esc(nom)}</span><span class="m">${argent(de, D)} <span class="muet">/ ${argent(pr, D)}</span></span><div class="jauge${pc > 100 ? ' trop' : ''}"><i style="width:${Math.min(100, pc)}%"></i></div></div>`; }).join('')}</div></article>
      <article class="carte"><h3><span class="e">🤝</span>Répartition entre voyageurs</h3><p class="chapo">Qui a payé quoi, et comment être quittes</p>
        ${v.voyageurs.length < 2 ? '<div class="vide">Ajoutez au moins deux voyageurs au voyage pour partager les dépenses.</div>' : `
        <div class="liste">${v.voyageurs.map(p => { const s = soldes[p.id], d = s.paye - s.part;
          return `<div class="solde"><span class="voyageurs"><span class="v"><i>${esc(initiales(p.nom))}</i>${esc(p.nom)}</span></span><span class="muet">a payé ${argent(s.paye, D)} · part ${argent(s.part, D)}</span><b class="${d >= 0 ? 'pos' : 'neg'}">${d >= 0 ? '+' : '−'}${argent(Math.abs(d), D)}</b></div>`; }).join('')}</div>
        <div class="groupe-titre" style="margin-top:14px">Pour être quittes</div>
        <div class="liste">${virements.map(x => `<div class="virement"><b>${esc(nomVoyageur(v, x.de))}</b><span class="fl">→</span><b>${esc(nomVoyageur(v, x.a))}</b><span style="margin-left:auto" class="chiffre">${argent(x.m, D)}</span></div>`).join('') || '<div class="vide">Tout le monde est quitte ✓</div>'}</div>`}
      </article>
      <article class="carte pleine"><h3><span class="e">🧾</span>Les dépenses</h3><p class="chapo">${pluriel(deps.length, 'dépense')} · touchez une ligne pour la modifier</p>
        ${deps.length ? `<div class="defile"><table class="tableau"><thead><tr><th>Date</th><th>Dépense</th><th>Catégorie</th>${v.voyageurs.length ? '<th>Payé par</th><th>Pour</th>' : ''}<th style="text-align:right">Montant</th></tr></thead><tbody>
          ${deps.map(d => `<tr data-act="editer-depense" data-id="${d.id}"><td>${esc(d.date ? fmtJour(d.date) : '—')}</td><td><b>${esc(d.libelle)}</b>${d.resaId ? ' <span class="etiquette ciel">🎫 réservation</span>' : ''}</td><td>${catBudget(d.categorie)[1]} ${esc(catBudget(d.categorie)[2])}</td>
            ${v.voyageurs.length ? `<td>${esc(nomVoyageur(v, d.payePar))}</td><td class="muet">${!d.pour || !d.pour.length || d.pour.length === v.voyageurs.length ? 'Tous' : d.pour.map(id => esc(nomVoyageur(v, id))).join(', ')}</td>` : ''}
            <td class="m">${argent(nombre(d.montant), D)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="vide">Notez les dépenses au fil du voyage : elles se répartissent toutes seules.</div>'}
      </article></div>`;
}

/* ============================================================
   PRÉPARATION : documents + tâches + horaires
   ============================================================ */
function vuePreparation() {
  const v = voyage(); if (!v) return sansVoyage('préparer le départ');
  const p = progressionPrep(v);
  const evs = evenements(v);
  const taches = [...v.taches].sort((a, b) => (b.jMoins ?? -1) - (a.jMoins ?? -1));
  return titreVue('La <span>préparation</span>', `${esc(v.nom)} · prêt à ${p} %`)
    + `<div class="grille g3">
      <article class="carte"><h3><span class="e">🪪</span>Documents importants</h3><p class="chapo">${v.documents.filter(d => d.fait).length}/${v.documents.length} vérifiés</p>
        <div class="liste">${v.documents.map(d => ligneCoche(d, 'documents', [d.qui ? nomVoyageur(v, d.qui) : '', d.expire ? 'Valable jusqu’au ' + fmtJour(d.expire, true) : '', d.note].filter(Boolean).join(' · '))).join('') || '<div class="vide">Aucun document</div>'}</div>
        <div class="actions" style="margin-top:10px"><button class="btn petit" data-act="ajout-documents">＋ Document</button></div></article>
      <article class="carte"><h3><span class="e">✅</span>Tâches de préparation</h3><p class="chapo">${v.taches.filter(t => t.fait).length}/${v.taches.length} faites</p>
        <div class="liste">${taches.map(t => ligneCoche(t, 'taches', echeanceTache(v, t))).join('') || '<div class="vide">Aucune tâche</div>'}</div>
        <div class="actions" style="margin-top:10px"><button class="btn petit" data-act="ajout-taches">＋ Tâche</button></div></article>
      <article class="carte"><h3><span class="e">⏰</span>Horaires importants</h3><p class="chapo">Départ, embarquement, check-in, check-out</p>
        <div class="liste">${v.debut ? `<div class="horaire"><span>🚪</span><span>Départ de la maison</span><span class="q">${esc(fmtJour(v.debut))}${v.heureDepart ? ' · ' + fmtHeure(v.heureDepart) : ''}</span></div>` : ''}
        ${evs.map(e => `<div class="horaire" data-act="editer-resa" data-id="${e.r.id}" style="cursor:pointer"><span>${e.e}</span><span>${esc(e.titre)}</span><span class="q">${esc(fmtDT(e.quand))}</span></div>`).join('') || '<div class="vide">Ajoutez des réservations avec leurs horaires</div>'}</div>
        <div class="actions" style="margin-top:10px"><button class="btn petit" data-act="ajout-resa">＋ Réservation</button></div></article>
    </div>`;
}

/* ============================================================
   IDÉES : visites, restaurants, activités
   ============================================================ */
function vueIdees() {
  const v = voyage(); if (!v) return sansVoyage('noter des idées');
  const statuts = { idee: ['💭', 'Idée'], prevu: ['🗓️', 'Prévu'], fait: ['✓', 'Fait'] };
  return titreVue('Mes <span>idées</span>', `${esc(v.nom)} · visites, restaurants et activités à ne pas manquer`,
    '<button class="btn plein" data-act="ajout-idee"><span class="e">＋</span> Ajouter une idée</button>')
    + `<div class="grille g3">${TYPES_IDEE.map(([id, e, nom]) => {
      const l = v.idees.filter(x => x.type === id).sort((a, b) => (b.coeur ? 1 : 0) - (a.coeur ? 1 : 0) || (a.statut === 'fait') - (b.statut === 'fait'));
      return `<article class="carte"><h3><span class="e">${e}</span>${nom}</h3><p class="chapo">${pluriel(l.length, 'idée')}</p><div class="liste">
        ${l.map(x => { const st = x.jour ? 'prevu' : x.statut === 'fait' ? 'fait' : 'idee';
          return `<div class="idee${x.statut === 'fait' ? ' fait' : ''}"><header><b>${x.coeur ? '❤️ ' : ''}${esc(x.nom)}</b><button class="mini" data-act="editer-idee" data-id="${x.id}">✎</button></header>
          ${x.adresse ? `<p>📍 ${esc(x.adresse)}</p>` : ''}${x.note ? `<p>${esc(x.note)}</p>` : ''}
          <footer><span class="etiquette${st === 'fait' ? ' ok' : st === 'prevu' ? ' or' : ''}">${statuts[st][0]} ${x.jour ? esc(fmtJour(x.jour)) + (x.heure ? ' · ' + fmtHeure(x.heure) : '') : statuts[st][1]}</span>
            ${x.prix ? `<span class="etiquette">${argent(nombre(x.prix), v.devise)}</span>` : ''}
            ${x.lien ? `<a class="lien" href="${esc(x.lien)}" target="_blank" rel="noopener">Lien ↗</a>` : ''}
            <span style="margin-left:auto;display:flex;gap:4px">${x.statut !== 'fait' ? `<button class="btn petit" data-act="programmer-idee" data-id="${x.id}">🗓️</button>` : ''}<button class="btn petit" data-act="idee-faite" data-id="${x.id}">${x.statut === 'fait' ? '↺' : '✓'}</button></span></footer></div>`; }).join('')
        || '<div class="vide">À noter au fil des envies</div>'}</div>
        <div class="actions" style="margin-top:10px"><button class="lien" data-act="ajout-idee" data-type="${id}">＋ Ajouter</button></div></article>`;
    }).join('')}</div>`;
}

/* ============================================================
   INFOS UTILES : adresses, numéros, liens
   ============================================================ */
function vueInfos() {
  const v = voyage(); if (!v) return sansVoyage('garder les infos utiles');
  const deResa = v.reservations.filter(r => r.adresse || r.telephone || r.lien);
  const lienDe = (t, x) => t === 'numero' ? `<a href="tel:${esc(x.valeur.replace(/[^\d+]/g, ''))}">${esc(x.valeur)}</a>`
    : t === 'lien' ? `<a href="${esc(/^https?:/i.test(x.valeur) ? x.valeur : 'https://' + x.valeur)}" target="_blank" rel="noopener">${esc(x.valeur.replace(/^https?:\/\//, ''))} ↗</a>`
    : `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.valeur)}" target="_blank" rel="noopener">${esc(x.valeur)} ↗</a>`;
  return titreVue('Infos <span>utiles</span>', `${esc(v.nom)} · adresses, liens de réservation et numéros à portée de main`,
    '<button class="btn plein" data-act="ajout-info"><span class="e">＋</span> Ajouter</button>')
    + `<div class="grille g3">${TYPES_INFO.map(([t, e, nom]) => {
      const l = v.infos.filter(x => x.type === t);
      return `<article class="carte"><h3><span class="e">${e}</span>${nom}</h3><p class="chapo">${pluriel(l.length, 'élément')}</p><div class="liste">
        ${l.map(x => `<div class="item"><span class="corps"><b>${esc(x.nom)}</b><small>${lienDe(t, x)}</small>${x.note ? `<small>${esc(x.note)}</small>` : ''}</span>
          <span class="outils"><button class="mini" data-act="editer-info" data-id="${x.id}">✎</button></span></div>`).join('')
        || `<div class="vide">${t === 'numero' ? 'Urgences, hôtel, taxi, ambassade…' : t === 'lien' ? 'Sites de réservation, billets, applis…' : 'Hôtel, gare, restaurants…'}</div>`}</div>
        <div class="actions" style="margin-top:10px"><button class="lien" data-act="ajout-info" data-type="${t}">＋ Ajouter</button></div></article>`;
    }).join('')}
    ${deResa.length ? `<article class="carte pleine"><h3><span class="e">🎫</span>Depuis les réservations</h3><p class="chapo">Repris automatiquement</p><div class="grille g3">
      ${deResa.map(r => `<div class="item"><span>${typeResa(r.type)[1]}</span><span class="corps"><b>${esc(r.titre || typeResa(r.type)[2])}</b>
        ${r.adresse ? `<small>${lienDe('adresse', { valeur: r.adresse })}</small>` : ''}${r.telephone ? `<small>${lienDe('numero', { valeur: r.telephone })}</small>` : ''}${r.lien ? `<small>${lienDe('lien', { valeur: r.lien })}</small>` : ''}</span></div>`).join('')}</div></article>` : ''}
    <article class="carte pleine"><h3><span class="e">🆘</span>Numéros d'urgence</h3><p class="chapo">À connaître partout en Europe : 112 · France : 15 SAMU, 17 police, 18 pompiers · Depuis l'étranger, le consulat de France est joignable via le site du ministère des Affaires étrangères.</p></article>
    </div>`;
}

/* ============================================================
   CARNET SOUVENIR
   ============================================================ */
function vueSouvenirs() {
  const v = voyage(); if (!v) return sansVoyage('garder les souvenirs');
  const l = [...v.souvenirs].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const favoris = v.souvenirs.filter(x => x.favori && x.lieu);
  return titreVue('Carnet <span>souvenir</span>', `${esc(v.nom)} · photos, notes et lieux préférés`,
    '<button class="btn plein" data-act="ajout-souvenir"><span class="e">＋</span> Nouvelle page</button>')
    + (favoris.length ? `<article class="carte" style="margin-bottom:16px"><h3><span class="e">❤️</span>Nos lieux préférés</h3><div class="actions" style="margin-top:8px">${favoris.map(x => `<span class="etiquette rose">📍 ${esc(x.lieu)}</span>`).join('')}</div></article>` : '')
    + (l.length ? `<div class="souvenirs">${l.map(x => `<article class="carte souvenir">
      ${x.photos && x.photos.length ? `<div class="photos">${x.photos.map((ph, i) => `<img src="${ph}" alt="" data-act="agrandir" data-id="${x.id}" data-i="${i}" loading="lazy">`).join('')}</div>` : ''}
      <div class="txt"><h4><span>${x.humeur ? x.humeur + ' ' : ''}${esc(x.titre || 'Souvenir')}</span><button class="fav${x.favori ? ' on' : ''}" data-act="fav-souvenir" data-id="${x.id}" title="Lieu préféré">❤️</button></h4>
        <div class="meta">${esc(x.date ? fmtJour(x.date, true) : '')}${x.lieu ? ' · 📍 ' + esc(x.lieu) : ''}</div>
        ${x.texte ? `<p>${esc(x.texte)}</p>` : ''}
        <div class="actions" style="margin-top:10px"><button class="btn petit" data-act="editer-souvenir" data-id="${x.id}">✎ Modifier</button><button class="btn petit" data-act="photos-souvenir" data-id="${x.id}">📷 Photos</button></div></div>
    </article>`).join('')}</div>`
    : `<div class="carte bienvenue"><div class="grand">📸</div><h3>Le carnet est encore blanc</h3><p>Une page par moment : quelques mots, deux ou trois photos, le lieu qu'on a aimé. On le relira avec plaisir.</p><div class="actions"><button class="btn plein" data-act="ajout-souvenir">Écrire la première page</button></div></div>`);
}

/* ============================================================
   LE GLOBE
   ============================================================ */
let modeGlobe = 'globe';
function vueGlobe() {
  const st = statsMonde();
  const { via } = statutsPays();
  const puce = (p, s) => `<span class="puce-pays ${s}" data-act="viser-pays" data-code="${p.code}" role="button" tabindex="0">${codePays(p.code)} ${esc(p.nom)}${via[p.code] ? ` <em>· ${esc(via[p.code])}</em>` : ''}<span class="x" data-act="statut-pays" data-code="${p.code}" data-statut="aucun" title="Retirer">✕</span></span>`;
  const bloc = (s, titre) => `<div class="groupe-titre">${STATUTS_PAYS[s].e} ${titre} <span class="n">${st.par[s].length}</span></div>
    <div class="puces-pays">${st.par[s].map(p => puce(p, s)).join('') || '<span class="ui muet" style="font-size:12.5px">Aucun pour l’instant</span>'}</div>`;
  return titreVue('Mon <span>globe</span>', 'Tournez la planète, cliquez un pays : ✓ j’y suis allé·e · 📍 c’est prévu · ♡ j’en rêve')
    + `<div class="globe-zone">
      <article class="carte globe-boite">
        <div class="haut"><div class="bascule"><button data-act="mode-globe" data-mode="globe" class="${modeGlobe === 'globe' ? 'actif' : ''}">🌍 Globe</button><button data-act="mode-globe" data-mode="carte" class="${modeGlobe === 'carte' ? 'actif' : ''}">🗺️ Carte à plat</button></div></div>
        ${modeGlobe === 'globe' ? `<canvas id="globe" aria-label="Globe des pays visités et à venir"></canvas>
          <div class="commandes"><button data-act="globe-zoom" data-f="1.25" title="Rapprocher">＋</button><button data-act="globe-zoom" data-f="0.8" title="Éloigner">－</button><button data-act="globe-tourne" title="Rotation automatique">⟳</button></div>
          <div class="aide">Glisser pour tourner · molette pour zoomer · cliquer un pays pour le marquer</div>` : carteMondeSVG({ hauteur: 500, k: 1.35 })}
      </article>
      <div class="pile">
        <article class="carte"><div class="grands-chiffres"><div class="v"><b>${st.par.visite.length}</b><small>✓ pays visités</small></div><div class="a"><b>${st.par.avenir.length}</b><small>📍 à venir</small></div>
          <div><b>${st.pct}<span style="font-size:18px"> %</span></b><small>du monde exploré</small></div><div class="r"><b>${st.par.reve.length}</b><small>♡ en rêve</small></div></div>
          <div class="recherche-pays"><input id="chercherPays" list="dlPays" placeholder="Chercher un pays…" autocomplete="off"><datalist id="dlPays">${NOMS_PAYS.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
            <button class="btn petit" data-act="marquer-cherche" data-statut="visite">✓ Visité</button><button class="btn petit" data-act="marquer-cherche" data-statut="avenir">📍 À venir</button></div>
          <div class="legende"><span><i class="v"></i>Visité</span><span><i class="a"></i>À venir</span><span><i class="r"></i>En rêve</span><span><i class="n"></i>Pas encore</span></div></article>
        <article class="carte">${bloc('visite', 'Pays visités')}${bloc('avenir', 'Pays à venir')}${bloc('reve', 'Pays en rêve')}
          <p class="ui muet" style="font-size:11.5px;margin:12px 0 0">Les pays de vos voyages s'ajoutent tout seuls : à venir avant le départ, visités après.</p></article>
        <article class="carte"><h3><span class="e">🧭</span>Continents explorés</h3><p class="chapo">${Object.values(st.continents).filter(c => c.vus).length} sur 6</p>
          <div class="continents">${Object.entries(st.continents).map(([k, c]) => `<div class="ligne"><span>${CONTINENTS[k]}</span><div class="jauge"><i style="width:${c.total ? c.vus / c.total * 100 : 0}%"></i></div><span class="muet" style="text-align:right">${c.vus}/${c.total}</span></div>`).join('')}</div></article>
      </div></div>`;
}
function ouvrirBullePays(code, x, y) {
  const p = PAYS[code]; if (!p) return;
  const { statut, via } = statutsPays();
  const s = statut[code] || 'aucun';
  const b = $('#bullePays');
  b.innerHTML = `<h5>${codePays(code)} ${esc(p.nom)}</h5><div class="reg">${esc(CONTINENTS[p.reg] || '')}</div>
    <div class="choix">${[['visite', '✓ Visité'], ['avenir', '📍 À venir'], ['reve', '♡ En rêve'], ['aucun', '○ Pas encore']].map(([k, l]) => `<button type="button" class="${s === k ? 'on' : ''}" data-act="statut-pays" data-code="${code}" data-statut="${k}">${l}</button>`).join('')}</div>
    ${via[code] ? `<div class="via">Ajouté par le voyage « ${esc(via[code])} »</div>` : ''}`;
  b.classList.add('ouverte');
  const w = b.offsetWidth, h = b.offsetHeight;
  b.style.left = Math.max(10, Math.min(innerWidth - w - 10, x - w / 2)) + 'px';
  b.style.top = (y + h + 20 > innerHeight ? Math.max(10, y - h - 14) : y + 14) + 'px';
}
const fermerBullePays = () => $('#bullePays').classList.remove('ouverte');
