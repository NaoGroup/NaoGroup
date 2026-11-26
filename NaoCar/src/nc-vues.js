'use strict';
/* ============================================================
   NaoCar — les pages
   ============================================================ */
const carteT = (em, titre, compte = '', extra = '') =>
  `<div class="carte-t"><span class="em">${em}</span><h2>${titre}</h2>${compte !== '' ? `<span class="compte">${compte}</span>` : ''}${extra}</div>`;
const videJoli = (em, texte, bouton = '') => `<div class="vide-joli"><span class="em">${em}</span>${texte}${bouton ? `<div style="margin-top:12px">${bouton}</div>` : ''}</div>`;
const sousPages = (page, liste) => `<div class="sous-pages">${liste.map(([k, l]) => `<button class="${V.sous[page] === k ? 'on' : ''}" data-act="sous" data-p="${page}" data-s="${k}">${l}</button>`).join('')}</div>`;
const titrePage = (titre, extra = '') => `<div class="titre-page"><h2>${titre}</h2><div class="spacer"></div>${extra}</div>`;
const infoL = (lab, val) => val ? `<div><span>${lab}</span><b>${val}</b></div>` : '';
const pourQui = () => V.voiture ? ` · ${esc(nomDe(V.voiture))}` : '';

/* ============================================================
   En haut : le choix de la voiture
   ============================================================ */
function rendreChoixVoiture() {
  const z = $('#choix-voiture');
  if (S.voitures.length < 2 || V.page === 'accueil') { z.innerHTML = ''; return; }
  z.innerHTML = `<span class="lab">Voiture</span><button class="puce-v tous ${!V.voiture ? 'on' : ''}" data-act="pour" data-id="">🚗 Toutes</button>` +
    S.voitures.map(v => `<button class="puce-v ${V.voiture === v.id ? 'on' : ''}" data-act="pour" data-id="${v.id}">${vignette(v)}${esc(nomVoiture(v))}${v.vendue ? ' <small>(vendue)</small>' : ''}</button>`).join('');
}
/* Les bandeaux : seulement ce qui est urgent */
function rendreRappels() {
  let masques = [];
  try { masques = JSON.parse(sessionStorage.getItem('naocar.masques') || '[]'); } catch (e) {}
  const l = toutesAlertes().filter(a => a.u === 1).filter(a => !masques.includes(a.t + a.v)).slice(0, 3);
  $('#rappels').innerHTML = l.map(a => `<div class="rappel"><span class="em">${a.em}</span><div class="txt"><b>${esc(a.t)}</b> — ${esc(a.s)}</div>
    <button class="btn petit" data-act="${a.act}" data-v="${a.v}" ${a.id ? `data-id="${a.id}"` : ''} ${a.type ? `data-type="${a.type}"` : ''}>Voir</button>
    <button class="rond petit" data-act="masquer" data-id="${esc(a.t + a.v)}" title="Masquer jusqu'à la prochaine ouverture">✕</button></div>`).join('');
}

/* ============================================================
   Accueil
   ============================================================ */
function bienvenue() {
  return `<section class="bienvenue">
    <svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><use href="#nao-logo"/></svg>
    <h2>Bienvenue dans Nao<span>Car</span></h2>
    <p>Une fiche par voiture — plaque, pneus, batterie —, le <b>contrôle technique</b> et ce qu’il reste <b>à faire</b>, les <b>réparations</b> avec leurs factures, et les <b>papiers</b> : assurance, carte grise. Tout au même endroit, et les PDF rangés en copie dans NaoDoc.</p>
    <div class="btns"><button class="btn plein" data-act="voiture">➕ Ajouter ma voiture</button><button class="btn" data-act="exemple">✨ Découvrir avec un exemple</button></div>
    <svg class="route" viewBox="0 0 420 70" aria-hidden="true"><path class="trait" d="M0 58H420"/>
      <g class="v" style="color:var(--acc)"><g transform="translate(170 6) scale(2.6)" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${DESSINS.voiture}</g></g></svg>
  </section>`;
}
function carteVoiture(v) {
  const k = kmActuel(v), ct = prochainCT(v), jct = ct ? ecart(auj(), ct.date) : null, as = etatAssu(v), cg = etatCG(v);
  const afaire = S.taches.filter(t => t.voiture === v.id && !t.fait), urg = afaire.filter(t => Number(t.urgence) === 1).length;
  return `<section class="carte cliquable carte-v" data-act="voir" data-v="${v.id}" role="button" tabindex="0">
    <div class="haut">${vignette(v, 'm')}<div style="min-width:0;flex:1"><h3>${esc(nomVoiture(v))}</h3><div class="sous-t">${esc(nomComplet(v) || 'Marque et modèle à compléter')}${v.vendue ? ' · vendue' : ''}</div></div>${plaqueHTML(v.plaque)}</div>
    <div class="etats">
      ${k ? `<span class="pastille">📍 ${kmTxt(k.km)}</span>` : ''}
      ${ct ? `<span class="pastille ${niveau(jct)}" title="Contrôle technique">✅ CT ${jct < 0 ? 'dépassé' : dansJours(jct)}</span>` : '<span class="pastille">✅ CT : date de 1re mise en circulation ?</span>'}
      <span class="pastille ${as.etat === 'aucune' ? 'att' : niveau(as.dans)}">🛡️ ${as.etat === 'aucune' ? 'Assurance ?' : as.dans != null ? 'Assurée · échéance ' + dansJours(as.dans) : 'Assurée'}</span>
      <span class="pastille ${cg.etat === 'def' ? 'ok' : cg.etat === 'prov' ? (cg.dans != null && cg.dans < 0 ? 'mal' : 'att') : ''}">🪪 ${cg.etat === 'def' ? 'Carte grise définitive' : cg.etat === 'prov' ? 'Carte grise provisoire' : 'Carte grise ?'}</span>
      ${afaire.length ? `<span class="pastille ${urg ? 'mal' : 'acc'}">🔧 ${pluriel(afaire.length, 'chose', 'choses')} à faire${urg ? ` · ${urg} urgente${urg > 1 ? 's' : ''}` : ''}</span>` : ''}
    </div></section>`;
}
PAGES.accueil = () => {
  if (!S.voitures.length) return bienvenue();
  let h = titrePage('Mon <span>garage</span>', '<button class="btn" data-act="voiture">➕ Une voiture</button>');
  h += `<div class="actions-rapides">
    <button class="gros-bouton" data-act="tache"><span class="ic">🔧</span><span>À faire<small>noter une réparation à prévoir</small></span></button>
    <button class="gros-bouton" data-act="reparation"><span class="ic">🧾</span><span>Une réparation<small>avec sa facture</small></span></button>
    <button class="gros-bouton" data-act="ct"><span class="ic">✅</span><span>Contrôle technique<small>le dernier passé</small></span></button>
    <button class="gros-bouton" data-act="km"><span class="ic">📍</span><span>Kilométrage<small>le compteur aujourd’hui</small></span></button></div>`;
  h += `<div class="voitures">${S.voitures.filter(v => !v.vendue).map(carteVoiture).join('')}</div>`;
  h += '<div class="grille">';
  /* à faire */
  const t = tachesAFaire();
  h += `<section class="carte">${carteT('🔧', 'À faire', t.length || '')}
    ${t.length ? t.slice(0, 6).map(x => ligneTache(x, true)).join('') + (t.length > 6 ? `<div class="vide">… et ${t.length - 6} autres</div>` : '')
      : videJoli('✨', 'Rien à faire pour l’instant.', '<button class="btn petit" data-act="tache">➕ Noter quelque chose à faire</button>')}
    <button class="lien-carte" data-act="go" data-p="entretien" data-s="afaire">Tout l’entretien →</button></section>`;
  /* échéances */
  const al = toutesAlertes();
  h += `<section class="carte">${carteT('📅', 'Échéances', al.length || '')}
    ${al.length ? al.slice(0, 6).map(a => `<div class="ligne cliquable u${a.u}" data-act="${a.act}" data-v="${a.v}" ${a.id ? `data-id="${a.id}"` : ''} ${a.type ? `data-type="${a.type}"` : ''}><span class="em">${a.em}</span><div class="txt"><b>${esc(a.t)}</b><span>${esc(a.s)}</span></div>${urgBadge(a.u)}</div>`).join('')
      : videJoli('🛣️', 'Tout est en règle : contrôle technique, assurance et carte grise à jour.')}
    ${prochainesDates()}</section>`;
  /* réparations */
  const r = S.reparations.filter(x => !(voiture(x.voiture) || {}).vendue).sort(parDate);
  const an = String(auj().getFullYear()), totAn = r.filter(x => (x.date || '').startsWith(an)).reduce((s, x) => s + (nombre(x.montant) || 0), 0);
  h += `<section class="carte">${carteT('🧾', 'Dernières réparations', r.length || '')}
    ${r.length ? `<div class="mini-stat"><span><b>${euros(totAn)}</b> en ${an}</span></div>` + r.slice(0, 5).map(ligneRepa).join('')
      : videJoli('🧰', 'Aucune réparation notée.', '<button class="btn petit" data-act="reparation">➕ Noter une réparation</button>')}
    <button class="lien-carte" data-act="go" data-p="reparations">Le tableau des réparations →</button></section>`;
  h += '</div>';
  return h;
};
/* les dates qui arrivent plus tard (CT, assurance) : on les voit venir de loin */
function prochainesDates() {
  const l = [];
  for (const v of S.voitures.filter(x => !x.vendue)) {
    const ct = prochainCT(v); if (ct) { const j = ecart(auj(), ct.date); if (j > 60) l.push({ j, t: `✅ CT · ${nomVoiture(v)}`, d: ct.date }); }
    const as = etatAssu(v); if (as.dans != null && as.dans > 30) l.push({ j: as.dans, t: `🛡️ Assurance · ${nomVoiture(v)}`, d: as.fin });
  }
  if (!l.length) return '';
  return `<div class="groupe-t">Plus tard</div>${l.sort((a, b) => a.j - b.j).slice(0, 4).map(x => `<div class="ligne"><div class="txt"><b>${esc(x.t)}</b><span>${dateMoy(x.d)}</span></div><span class="meta">${dansJours(x.j)}</span></div>`).join('')}`;
}
function ligneTache(t, avecVoiture = false) {
  const v = voiture(t.voiture), u = Number(t.urgence) || 3;
  const ech = t.echeance ? ecart(auj(), lire(t.echeance)) : null;
  const sous = [avecVoiture && S.voitures.length > 1 ? nomVoiture(v) : '', t.echeance ? `avant le ${dateMoy(lire(t.echeance))}` : '', t.kmEcheance ? `avant ${kmTxt(t.kmEcheance)}` : '', t.garage ? '🔧 ' + t.garage : '', t.devis ? 'devis ' + euros(t.devis) : ''].filter(Boolean).join(' · ');
  return `<div class="ligne u${u} ${t.fait ? 'fait' : ''}">
    <button class="coche ${t.fait ? 'on' : ''}" data-act="tache-faite" data-id="${t.id}" aria-label="${t.fait ? 'Remettre à faire' : 'Marquer comme fait'}">✓</button>
    <div class="txt cliquable" data-act="tache" data-id="${t.id}" role="button" tabindex="0" style="cursor:pointer"><b>${esc(t.texte)}</b>${sous ? `<span>${esc(sous)}${ech != null && ech < 0 && !t.fait ? ' · <b style="display:inline;color:var(--doux)">en retard</b>' : ''}</span>` : ''}</div>
    ${t.fait ? `<span class="meta">fait ${dateCourte(lire(t.fait))}</span>` : urgBadge(u)}</div>`;
}
function ligneRepa(r) {
  const T = T_REPA[r.nature] || T_REPA.autre;
  return `<div class="ligne cliquable" data-act="reparation" data-id="${r.id}"><span class="em">${T[0]}</span><div class="txt"><b>${esc(r.description || T[1])}</b>
    <span>${dateMoy(lire(r.date))}${S.voitures.length > 1 ? ' · ' + esc(nomDe(r.voiture)) : ''}${r.garage ? ' · ' + esc(r.garage) : ''}${r.km ? ' · ' + kmTxt(r.km) : ''}</span></div>
    ${lienDoc(r)}${r.montant ? `<span class="meta">${euros(nombre(r.montant))}</span>` : ''}</div>`;
}

/* ============================================================
   Mes voitures : la liste, puis la fiche
   ============================================================ */
PAGES.voitures = () => {
  if (!S.voitures.length) return bienvenue();
  const v = V.voiture ? voiture(V.voiture) : S.voitures.length === 1 ? S.voitures[0] : null;
  if (!v) return titrePage('Mes <span>voitures</span>', '<button class="btn plein" data-act="voiture">➕ Une voiture</button>')
    + `<p class="chapo">Chaque voiture a sa fiche, comme un profil : cliquez sur l’une d’elles pour tout voir.</p><div class="voitures">${S.voitures.map(carteVoiture).join('')}</div>`;
  return ficheVoiture(v);
};
function ficheVoiture(v) {
  const k = kmActuel(v), kpa = kmParAn(v), p = v.pneus || {}, b = v.batterie || {};
  const carb = (CARBURANTS.find(c => c[0] === v.carburant) || ['', ''])[1];
  let h = titrePage(`${esc(nomVoiture(v))}`, `${S.voitures.length > 1 ? '<button class="btn" data-act="pour" data-id="">← Toutes les voitures</button>' : ''}<button class="btn" data-act="voiture">➕ Une voiture</button>`);
  h += `<section class="carte fiche-v">
    ${v.photo ? vignette(v, 'g') : `<div style="width:220px;max-width:100%">${dessinVoiture(v)}</div>`}
    <div style="min-width:0"><h2>${esc(nomVoiture(v))}</h2>
      <div class="esp">${esc(nomComplet(v) || 'Marque, modèle et finition à compléter')}${v.vendue ? ' · <b>vendue</b>' : ''}</div>
      <div style="margin-bottom:12px">${plaqueHTML(v.plaque)}</div>
      <div class="infos">
        ${infoL('Couleur', esc(v.couleur))}
        ${infoL('1re mise en circulation', v.dateMEC ? `${dateNum(lire(v.dateMEC))} <small style="color:var(--ink-3)">(${ageDe(v.dateMEC)})</small>` : '')}
        ${infoL('Énergie', esc(carb))}${infoL('Boîte', esc((BOITES.find(c => c[0] === v.boite) || ['', ''])[1]))}
        ${infoL('Puissance fiscale', v.cv ? esc(v.cv) + ' CV' : '')}
        ${infoL('Kilométrage', k ? `${kmTxt(k.km)}${k.date ? ` <small style="color:var(--ink-3)">au ${dateNum(lire(k.date))}</small>` : ''}` : '')}
        ${infoL('Kilomètres par an', kpa ? '≈ ' + kmTxt(kpa) : '')}
        ${infoL('Achetée le', v.dateAchat ? dateNum(lire(v.dateAchat)) + (v.kmAchat ? ` · ${kmTxt(v.kmAchat)}` : '') : '')}
        ${infoL('N° VIN (case E)', esc(v.vin))}
      </div></div>
    <div class="fiche-actions"><button class="btn plein" data-act="voiture" data-id="${v.id}">✏️ Modifier la fiche</button>
      <button class="btn" data-act="km" data-v="${v.id}">📍 Kilométrage</button><button class="btn" data-act="tache" data-v="${v.id}">🔧 À faire</button></div>
  </section>`;
  h += `<div class="blocs-tech">
    <section class="carte tech"><h3>🛞 Les pneus</h3>
      ${p.av || p.ar ? `<div style="display:flex;gap:22px;flex-wrap:wrap"><div class="pneu-dim"><small>Avant</small>${esc(p.av || p.ar)}</div>${p.ar && p.ar !== p.av ? `<div class="pneu-dim"><small>Arrière</small>${esc(p.ar)}</div>` : ''}</div>${lecturePneu(p.av || p.ar)}`
        : videJoli('🛞', 'La taille des pneus est écrite sur leur flanc (ex. 205/55 R16 91V), ou dans la portière conducteur.')}
      <div class="infos" style="margin-top:12px">
        ${infoL('Pression avant', p.pressionAv ? esc(p.pressionAv) + ' bar' : '')}${infoL('Pression arrière', p.pressionAr ? esc(p.pressionAr) + ' bar' : '')}
        ${infoL('Saison', esc({ ete: '☀️ Été', hiver: '❄️ Hiver', '4s': '🌦️ 4 saisons' }[p.saison] || ''))}${infoL('Marque', esc(p.marque))}
        ${infoL('Montés le', p.dateMontage ? dateNum(lire(p.dateMontage)) + ` <small style="color:var(--ink-3)">(${ageDe(p.dateMontage)})</small>` : '')}${infoL('Montés à', kmTxt(p.kmMontage))}
        ${infoL('Date DOT', p.dot && dateDot(p.dot) ? `${esc(p.dot)} <small style="color:var(--ink-3)">(${moisAn(dateDot(p.dot))})</small>` : esc(p.dot))}
      </div></section>
    <section class="carte tech"><h3>🔋 La batterie</h3>
      ${b.marque || b.capacite || b.date ? `<div class="infos">
        ${infoL('Marque', esc(b.marque))}${infoL('Référence', esc(b.ref))}${infoL('Tension', b.tension ? esc(b.tension) + ' V' : '')}
        ${infoL('Capacité', b.capacite ? esc(b.capacite) + ' Ah' : '')}${infoL('Démarrage (CCA)', b.cca ? esc(b.cca) + ' A' : '')}${infoL('Technologie', esc(b.techno))}
        ${infoL('Posée le', b.date ? dateNum(lire(b.date)) + ` <small style="color:var(--ink-3)">(${ageDe(b.date)})</small>` : '')}
        ${infoL('Garantie jusqu’au', b.garantie ? dateNum(lire(b.garantie)) : '')}</div>
        ${b.date && ansDepuis(b.date) >= 5 ? '<div class="note-douce"><span class="em">🔋</span><div>Une batterie dure en général <b>4 à 6 ans</b>. Faites-la tester (c’est souvent gratuit) avant l’hiver.</div></div>' : ''}`
        : videJoli('🔋', 'Capacité (Ah), courant de démarrage (A) et date de pose : tout est écrit sur l’étiquette de la batterie.')}
    </section>
    <section class="carte tech"><h3>🧭 En un coup d’œil</h3>${resumeVoiture(v)}</section>
  </div>`;
  if (v.notes) h += `<section class="carte" style="margin-top:16px">${carteT('📝', 'Notes')}<p style="margin:0;white-space:pre-wrap">${esc(v.notes)}</p></section>`;
  return h;
}
function resumeVoiture(v) {
  const ct = prochainCT(v), jct = ct ? ecart(auj(), ct.date) : null, r = S.reparations.filter(x => x.voiture === v.id);
  const tot = r.reduce((s, x) => s + (nombre(x.montant) || 0), 0), af = S.taches.filter(t => t.voiture === v.id && !t.fait);
  const rel = [...S.releves.filter(x => x.voiture === v.id)].sort(parDate).slice(0, 4);
  return `<div class="ligne cliquable" data-act="go" data-p="entretien" data-s="ct"><span class="em">✅</span><div class="txt"><b>Prochain contrôle technique</b><span>${ct ? `${dateMoy(ct.date)} · ${jct < 0 ? 'dépassé' : dansJours(jct)}` : 'Notez la date de 1re mise en circulation'}</span></div></div>
    <div class="ligne cliquable" data-act="go" data-p="entretien" data-s="afaire"><span class="em">🔧</span><div class="txt"><b>${pluriel(af.length, 'chose', 'choses')} à faire</b><span>${af.filter(t => Number(t.urgence) === 1).length} urgente(s)</span></div></div>
    <div class="ligne cliquable" data-act="go" data-p="reparations"><span class="em">🧾</span><div class="txt"><b>${pluriel(r.length, 'réparation')}</b><span>${euros(tot)} au total</span></div></div>
    <div class="ligne cliquable" data-act="go" data-p="papiers"><span class="em">📋</span><div class="txt"><b>${pluriel(papiersDe(v.id).length, 'papier')}</b><span>assurance, carte grise…</span></div></div>
    ${rel.length ? `<div class="groupe-t">📍 Relevés du compteur</div>${rel.map(x => `<div class="ligne"><div class="txt"><b>${kmTxt(x.km)}</b><span>${dateMoy(lire(x.date))}</span></div><button class="rond petit" data-act="km-sup" data-id="${x.id}" title="Retirer ce relevé">✕</button></div>`).join('')}` : ''}`;
}

/* ============================================================
   Entretien : ce qu'il y a à faire, et le contrôle technique
   ============================================================ */
PAGES.entretien = () => {
  if (!S.voitures.length) return bienvenue();
  let h = titrePage(`L’<span>entretien</span>${pourQui()}`, V.sous.entretien === 'ct' ? '<button class="btn plein" data-act="ct">✅ Noter un contrôle technique</button>' : '<button class="btn plein" data-act="tache">➕ Quelque chose à faire</button>');
  h += sousPages('entretien', [['afaire', '🔧 Ce qu’il y a à faire'], ['ct', '✅ Contrôle technique']]);
  return h + (V.sous.entretien === 'ct' ? pageCT() : pageAFaire());
};
function pageAFaire() {
  const t = tachesAFaire();
  let h = '<p class="chapo">Ce que le garagiste a signalé, une usure remarquée, une pièce à changer : notez-le avec son <b>niveau d’urgence</b>. Cochez ✓ quand c’est fait, et NaoCar propose d’en faire une réparation dans le tableau.</p><div class="grille-3">';
  for (const u of [1, 2, 3]) {
    const l = t.filter(x => (Number(x.urgence) || 3) === u);
    h += `<section class="carte">${carteT(URGENCES[u][0], URGENCES[u][1], l.length || '')}<div class="sous">${URGENCES[u][2]}</div>
      ${l.length ? l.map(x => ligneTache(x, true)).join('') : `<div class="vide">Rien ${u === 1 ? 'd’urgent' : 'ici'}.</div>`}
      <button class="lien-carte" data-act="tache" data-u="${u}">➕ Ajouter</button></section>`;
  }
  h += '</div>';
  const faits = S.taches.filter(x => x.fait && pourVoiture(x)).sort((a, b) => b.fait.localeCompare(a.fait));
  if (faits.length) h += `<section class="carte" style="margin-top:16px">${carteT('✔️', 'Fait récemment', faits.length)}${faits.slice(0, 8).map(x => ligneTache(x, true)).join('')}</section>`;
  return h;
}
function pageCT() {
  const vs = voituresVues();
  let h = '<p class="chapo">Le premier contrôle technique se passe dans les <b>6 mois avant les 4 ans</b> de la voiture (date de 1re mise en circulation), puis <b>tous les 2 ans</b>. Après une contre-visite demandée, on a <b>2 mois</b> pour la faire. NaoCar calcule la date à partir de votre dernier passage.</p><div class="grille-2">';
  for (const v of vs) {
    const ct = prochainCT(v), j = ct ? ecart(auj(), ct.date) : null, liste = ctDe(v.id);
    const part = j == null ? 0 : Math.max(0, Math.min(1, j / 730)), L = 2 * Math.PI * 50;
    h += `<section class="carte">${carteT('✅', esc(nomVoiture(v)), liste.length ? pluriel(liste.length, 'passage') : '', `<span style="margin-left:8px">${plaqueHTML(v.plaque)}</span>`)}
      <div class="ct-bloc"><div class="cadran ${niveau(j)}"><svg viewBox="0 0 120 120"><circle class="fond-c" cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${(L * (1 - part)).toFixed(1)}"/></svg>
        <div class="milieu"><div>${j == null ? '<b>?</b><span>date inconnue</span>' : j < 0 ? `<b>${-j}</b><span>jours de retard</span>` : j > 99 ? `<b>${Math.round(j / 30.4)}</b><span>mois</span>` : `<b>${j}</b><span>jour${j > 1 ? 's' : ''}</span>`}</div></div></div>
      <div>${ct ? `<b style="color:var(--titre);font-size:17px">${ct.type === 'contre' ? 'Contre-visite' : ct.type === 'premier' ? 'Premier contrôle' : 'Prochain contrôle'} : ${dateMoy(ct.date)}</b>
        <div class="sous" style="margin:4px 0 0">${ct.type === 'premier' ? `4 ans après la 1re mise en circulation (${dateNum(lire(v.dateMEC))}). Possible dès le ${dateMoy(plusMois(ct.date, -6))}.` : ct.type === 'contre' ? `2 mois après le contrôle du ${dateMoy(lire(ct.der.date))}. ${ct.der.resultat === 'critique' ? '<b>Défaillances critiques : la voiture ne pouvait rouler que le jour du contrôle.</b>' : ''}` : `Dernier passage le ${dateMoy(lire(ct.der.date))}${ct.der.centre ? ' chez ' + esc(ct.der.centre) : ''}.`}</div>`
        : '<div class="vide">Ajoutez la date de 1re mise en circulation dans la fiche (case B de la carte grise), ou notez votre dernier contrôle.</div>'}
        <div class="pied" style="margin-top:10px"><button class="btn petit plein" data-act="ct" data-v="${v.id}">✅ Noter un passage</button>${!v.dateMEC ? `<button class="btn petit" data-act="voiture" data-id="${v.id}">✏️ La fiche</button>` : ''}</div></div></div>
      ${liste.length ? `<div class="groupe-t" style="margin-top:14px">L’historique</div>${liste.map(c => { const R = RESULTATS_CT[c.resultat] || RESULTATS_CT.favorable; return `<div class="ligne cliquable" data-act="ct" data-id="${c.id}"><span class="em">${R[0]}</span><div class="txt"><b>${dateMoy(lire(c.date))}${c.km ? ' · ' + kmTxt(c.km) : ''}</b><span>${esc(c.centre || 'Centre non noté')} · ${R[1]}${c.defauts ? ' · ' + esc(c.defauts.split('\n')[0]) : ''}</span></div>${lienDoc(c)}${c.prix ? `<span class="meta">${euros(nombre(c.prix))}</span>` : ''}</div>`; }).join('')}` : ''}
    </section>`;
  }
  return h + '</div>';
}

/* ============================================================
   Réparations : le tableau
   ============================================================ */
PAGES.reparations = () => {
  if (!S.voitures.length) return bienvenue();
  const r = S.reparations.filter(pourVoiture);
  const { k, asc } = V.tri;
  const val = x => k === 'montant' || k === 'km' ? (nombre(x[k]) || 0) : k === 'voiture' ? nomDe(x.voiture) : k === 'nature' ? (T_REPA[x.nature] || T_REPA.autre)[1] : String(x[k] || '');
  r.sort((a, b) => { const A = val(a), B = val(b); const c = typeof A === 'number' ? A - B : A.localeCompare(B, 'fr'); return asc ? c : -c; });
  const tot = r.reduce((s, x) => s + (nombre(x.montant) || 0), 0), an = String(auj().getFullYear());
  const totAn = r.filter(x => (x.date || '').startsWith(an)).reduce((s, x) => s + (nombre(x.montant) || 0), 0);
  const plusieurs = S.voitures.length > 1 && !V.voiture;
  const th = (cle_, lab) => `<th class="${k === cle_ ? 'tri' + (asc ? ' asc' : '') : ''}" data-act="trier" data-k="${cle_}">${lab}</th>`;
  let h = titrePage(`Les <span>réparations</span>${pourQui()}`, '<button class="btn plein" data-act="reparation">➕ Une réparation</button>');
  h += '<p class="chapo">Chaque passage au garage : la date, le <b>kilométrage à ce moment-là</b>, ce qui a été fait, le garage et le prix. La facture en PDF se joint à la ligne, et une copie part dans NaoDoc.</p>';
  if (!r.length) return h + `<section class="carte">${videJoli('🧾', 'Aucune réparation notée pour l’instant.', '<button class="btn plein petit" data-act="reparation">➕ Noter la première</button>')}</section>`;
  h += `<div class="mini-stat"><span><b>${r.length}</b> intervention${r.length > 1 ? 's' : ''}</span><span><b>${euros(tot)}</b> au total</span><span><b>${euros(totAn)}</b> en ${an}</span></div>`;
  h += `<div class="tableau-z"><table class="tab"><thead><tr>${th('date', 'Date')}${plusieurs ? th('voiture', 'Voiture') : ''}${th('km', 'Kilométrage')}${th('nature', 'Nature')}<th>Ce qui a été fait</th>${th('garage', 'Garage')}${th('montant', 'Montant')}<th>Facture</th></tr></thead><tbody>
    ${r.map(x => { const T = T_REPA[x.nature] || T_REPA.autre; return `<tr data-act="reparation" data-id="${x.id}"><td class="date">${dateNum(lire(x.date))}</td>${plusieurs ? `<td>${esc(nomDe(x.voiture))}</td>` : ''}<td class="num">${x.km ? kmTxt(x.km) : '—'}</td><td>${T[0]} ${esc(T[1])}</td><td>${esc(x.description || '')}</td><td>${esc(x.garage || '')}</td><td class="num">${x.montant ? euros(nombre(x.montant)) : '—'}</td><td>${lienDoc(x) || '<span style="color:var(--ink-3)">—</span>'}</td></tr>`; }).join('')}
    </tbody><tfoot><tr><td colspan="${plusieurs ? 6 : 5}">Total</td><td class="num">${euros(tot)}</td><td></td></tr></tfoot></table></div>`;
  /* par nature */
  const par = {};
  r.forEach(x => { const n = x.nature || 'autre'; par[n] = (par[n] || 0) + (nombre(x.montant) || 0); });
  const lst = Object.entries(par).filter(([, m]) => m > 0).sort((a, b) => b[1] - a[1]);
  if (lst.length > 1) h += `<section class="carte" style="margin-top:16px">${carteT('📊', 'Où part l’argent')}${lst.map(([n, m]) => `<div class="ligne"><span class="em">${(T_REPA[n] || T_REPA.autre)[0]}</span><div class="txt"><b>${esc((T_REPA[n] || T_REPA.autre)[1])}</b><div class="jauge" style="margin-top:5px"><i style="width:${Math.round(m / lst[0][1] * 100)}%"></i></div></div><span class="meta">${euros(m)}</span></div>`).join('')}</section>`;
  return h;
};

/* ============================================================
   Administratif : assurance, carte grise, Crit'Air, autres papiers
   ============================================================ */
PAGES.papiers = () => {
  if (!S.voitures.length) return bienvenue();
  let h = titrePage(`Les <span>papiers</span>${pourQui()}`, '<button class="btn plein" data-act="papier">➕ Un papier</button>');
  h += '<p class="chapo">L’assurance et son échéance, la carte grise — provisoire puis définitive —, la vignette Crit’Air, le crédit ou la garantie. Chaque papier peut avoir son PDF, rangé en copie dans NaoDoc.</p>';
  for (const v of voituresVues()) {
    const as = etatAssu(v), cg = etatCG(v), crit = dernierPapier(v.id, 'critair');
    const autres = papiersDe(v.id).filter(p => !['assurance', 'cg-prov', 'cg-def', 'critair'].includes(p.type) || (p.type === 'assurance' && as.p && p.id !== as.p.id));
    h += `<div class="section-t" style="margin-top:18px">${vignette(v)}<h2>${esc(nomVoiture(v))}</h2>${plaqueHTML(v.plaque)}</div><div class="papiers">`;
    /* l'assurance */
    h += `<section class="carte papier">${carteT('🛡️', 'Assurance', '', `<span class="pastille etat ${as.etat === 'aucune' ? 'att' : niveau(as.dans)}">${as.etat === 'aucune' ? 'À noter' : as.dans == null ? 'Assurée' : as.dans < 0 ? 'Échéance passée' : 'Échéance ' + dansJours(as.dans)}</span>`)}
      ${as.p ? `<div class="infos">${infoL('Assureur', esc(as.p.organisme))}${infoL('N° de contrat', esc(as.p.numero))}${infoL('Formule', esc((FORMULES_ASSU.find(f => f[0] === as.p.formule) || ['', ''])[1]))}
        ${infoL('Depuis le', as.p.debut ? dateNum(lire(as.p.debut)) : '')}${infoL('Échéance', as.fin ? dateNum(as.fin) : '')}${infoL('Prix / an', as.p.montant ? euros(nombre(as.p.montant)) : '')}${infoL('Assistance', telLien(as.p.tel))}</div>
        <div class="pied" style="margin-top:10px">${lienDoc(as.p)}<div class="spacer"></div><button class="btn petit" data-act="papier" data-id="${as.p.id}">✏️ Modifier</button><button class="btn petit" data-act="papier" data-v="${v.id}" data-type="assurance">🔁 Nouvelle période</button></div>`
        : videJoli('🛡️', 'Assureur, n° de contrat, échéance et attestation.', `<button class="btn petit plein" data-act="papier" data-v="${v.id}" data-type="assurance">➕ Noter l’assurance</button>`)}</section>`;
    /* la carte grise */
    const et = cg.etat === 'def' ? 3 : cg.etat === 'prov' ? 2 : 1;
    h += `<section class="carte papier">${carteT('🪪', 'Carte grise', '', `<span class="pastille etat ${cg.etat === 'def' ? 'ok' : cg.etat === 'prov' ? (cg.dans != null && cg.dans < 0 ? 'mal' : 'att') : ''}">${cg.etat === 'def' ? 'Définitive' : cg.etat === 'prov' ? 'Provisoire' : 'À noter'}</span>`)}
      <div class="etapes-cg"><div class="on">Demande</div><div class="${et >= 2 ? 'on' : ''}">Provisoire</div><div class="${et >= 3 ? 'on' : ''}">Définitive</div></div>
      ${cg.etat === 'def' ? `<div class="infos">${infoL('Immatriculation', esc(cg.p.numero || v.plaque))}${infoL('Reçue le', cg.p.debut ? dateNum(lire(cg.p.debut)) : '')}${infoL('Titulaire', esc(cg.p.organisme))}</div>
          <div class="pied" style="margin-top:10px">${lienDoc(cg.p)}<div class="spacer"></div><button class="btn petit" data-act="papier" data-id="${cg.p.id}">✏️ Modifier</button></div>`
        : cg.etat === 'prov' ? `<div class="infos">${infoL('N° du certificat', esc(cg.p.numero))}${infoL('Délivré le', cg.p.debut ? dateNum(lire(cg.p.debut)) : '')}${infoL('Valable jusqu’au', cg.fin ? dateNum(cg.fin) : '')}</div>
          <div class="note-douce"><span class="em">📬</span><div>Le certificat provisoire (CPI) permet de rouler <b>1 mois</b> en France, le temps que la carte définitive arrive par courrier recommandé. Dès qu’elle est là, notez-la : NaoCar arrête de vous le rappeler.</div></div>
          <div class="pied">${lienDoc(cg.p)}<div class="spacer"></div><button class="btn petit" data-act="papier" data-id="${cg.p.id}">✏️ Modifier</button><button class="btn petit plein" data-act="papier" data-v="${v.id}" data-type="cg-def">📬 Définitive reçue</button></div>`
        : `<div class="pied" style="justify-content:center"><button class="btn petit" data-act="papier" data-v="${v.id}" data-type="cg-prov">📄 Provisoire (CPI)</button><button class="btn petit plein" data-act="papier" data-v="${v.id}" data-type="cg-def">🪪 Définitive</button></div>`}
    </section>`;
    /* Crit'Air et le reste */
    h += `<section class="carte papier">${carteT('🌿', 'Crit’Air et autres papiers', autres.length + (crit ? 1 : 0) || '')}
      ${crit ? `<div class="ligne cliquable" data-act="papier" data-id="${crit.id}"><span class="em">🌿</span><div class="txt"><b>${esc((CRITAIR.find(c => c[0] === crit.classe) || ['', 'Vignette Crit’Air'])[1])}</b><span>${crit.numero ? 'N° ' + esc(crit.numero) : 'Vignette de pollution'}</span></div>${lienDoc(crit)}</div>`
        : `<div class="ligne cliquable" data-act="papier" data-v="${v.id}" data-type="critair"><span class="em">🌿</span><div class="txt"><b>Vignette Crit’Air</b><span>Obligatoire dans les zones à faibles émissions (ZFE)</span></div><span class="meta">➕</span></div>`}
      ${autres.map(p => { const T = T_PAPIER[p.type] || T_PAPIER.autre; const j = p.fin ? ecart(auj(), lire(p.fin)) : null; return `<div class="ligne cliquable" data-act="papier" data-id="${p.id}"><span class="em">${T[0]}</span><div class="txt"><b>${esc(p.titre || T[1])}</b><span>${[p.organisme, p.numero && 'N° ' + p.numero, p.fin && 'jusqu’au ' + dateNum(lire(p.fin))].filter(Boolean).map(esc).join(' · ') || esc(T[1])}</span></div>${lienDoc(p)}${j != null ? `<span class="meta ${j < 30 ? 'or' : ''}">${dansJours(j)}</span>` : ''}</div>`; }).join('')}
      <button class="lien-carte" data-act="papier" data-v="${v.id}">➕ Un autre papier</button></section>`;
    h += '</div>';
  }
  return h;
};
