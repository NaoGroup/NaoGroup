/* ============================================================
   NaoSanté — les écrans.
   ============================================================ */
const VUES = [
  ['aujourdhui', '🌿', 'Aujourd’hui'],
  ['bienetre', '🌸', 'Bien-être'],
  ['activite', '🏃', 'Activité & souplesse'],
  ['habitudes', '✅', 'Habitudes & défis'],
  ['rdv', '📅', 'Rendez-vous & rappels'],
  ['objectifs', '🎯', 'Objectifs'],
  ['progression', '📈', 'Progression'],
  ['notes', '🔒', 'Notes & mémo']
];
/* Hydratation, sommeil et humeur vivent ensemble dans « Bien-être » : les anciennes adresses mènent à leur partie */
const ALIAS_VUES = { hydratation: 'bienetre', sommeil: 'bienetre', humeur: 'bienetre' };
const U = { vue: 'aujourdhui', periode: 'semaine', decalage: 0, phrase: 0, devoile: false, fiche: '' };

/* ---------- petites briques ---------- */
const COCHE = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function anneau(pct, cls = '') {
  const c = 2 * Math.PI * 52;
  return `<svg viewBox="0 0 120 120" class="anneau ${cls}"><circle class="fondc" cx="60" cy="60" r="52"/>
    <circle class="valc" cx="60" cy="60" r="52" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - borne(pct, 0, 1))).toFixed(1)}"/></svg>`;
}
function barreProgres(pct, texte, cls = '') {
  const p = Math.round(borne(pct, 0, 1) * 100);
  return `<div class="progres ${cls}${p >= 100 ? ' complet' : ''}"><div class="barre"><i style="width:${p}%"></i></div><b>${p} %</b></div>${texte ? `<div class="ui muet" style="font-size:12px;margin-top:5px">${texte}</div>` : ''}`;
}
function goutte(pct) {
  const y = 118 - borne(pct, 0, 1) * 112;
  return `<div class="goutte"><svg viewBox="0 0 96 120">
      <defs><clipPath id="clipGoutte"><path d="M48 3C48 3 9 49 9 76a39 39 0 0 0 78 0C87 49 48 3 48 3Z"/></clipPath></defs>
      <path class="contour" d="M48 3C48 3 9 49 9 76a39 39 0 0 0 78 0C87 49 48 3 48 3Z"/>
      <g clip-path="url(#clipGoutte)"><g class="niveau" style="transform:translateY(${y.toFixed(1)}px)">
        <path class="vague b" d="M0 6Q20 0 40 6T80 6T120 6T160 6T200 6T240 6V140H0Z"/>
        <path class="vague" d="M0 8Q20 2 40 8T80 8T120 8T160 8T200 8T240 8V140H0Z"/>
      </g></g>
      <path d="M30 62q-6 12-3 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
    </svg><div class="pct">${Math.round(pct * 100)} %</div></div>`;
}
function rangeeVerres(d = auj()) {
  const n = verres(d), obj = R().objectifVerres, max = Math.max(obj, n);
  return `<div class="verres" role="group" aria-label="Verres bus">${Array.from({ length: max }, (_, i) =>
    `<button type="button" class="verre${i < n ? ' plein' : ''}${i === n - 1 ? ' dernier' : ''}" data-act="verres" data-n="${i + 1 === n ? i : i + 1}" title="${i + 1 === n ? 'Retirer ce verre' : `${i + 1} verre${i ? 's' : ''}`}"></button>`).join('')}</div>`;
}
/* de petites barres verticales ; vals = [{v, lab, auj, cls}] */
function barres(vals, o = {}) {
  const max = Math.max(o.cible || 0, ...vals.map(x => x.v), 1);
  const cible = o.cible ? `<div class="ligne-cible" style="bottom:calc(21px + ${(o.cible / max).toFixed(3)} * (100% - 6px) * .64)"></div>` : '';
  return `<div class="barres-cadre">${cible}<div class="barres${o.mois ? ' mois' : ''}" style="--n:${vals.length}">${vals.map(x =>
    `<div class="col${x.auj ? ' auj' : ''}" title="${esc(x.titre || '')}">${o.mois ? '' : `<span class="v">${x.v ? (o.fmt ? o.fmt(x.v) : x.v) : ''}</span>`}
      <div class="b ${o.cls || ''}${x.v ? '' : ' nul'}${o.cible && x.v >= o.cible ? ' cible' : ''}" style="height:${(x.v / max * 64).toFixed(1)}%"></div>
      <small>${x.lab}</small></div>`).join('')}</div></div>`;
}
const vide = (texte, bouton) => `<div class="vide">${texte}${bouton ? `<br>${bouton}` : ''}</div>`;
const titreVue = (titre, sous, actions = '') => `<div class="titre-vue"><div><h2>${titre}</h2>${sous ? `<p>${sous}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const lab7 = d => JOURS_C[parseJour(d).getDay()].slice(0, 3);

function ligneHabitude(h, complet) {
  const f = estFaite(h), s = serieHabitude(h);
  const pts = complet ? `<div class="semaine-points">${derniersJours(7).map(d => `<i class="${faitsDu(d).includes(h.id) ? 'on' : ''}${d === auj() ? ' auj' : ''}" title="${fmtJour(d)}" data-act="basculer-jour" data-id="${h.id}" data-d="${d}" style="cursor:pointer"></i>`).join('')}</div>` : '';
  return `<div class="ligne${f ? ' fait' : ''}">
    <button type="button" class="coche-btn" data-act="habitude" data-id="${h.id}" aria-label="${f ? 'Décocher' : 'Cocher'} ${esc(h.nom)}">${COCHE}</button>
    <span class="emo">${esc(h.emoji || '⭐')}</span>
    <div class="corps"><div class="texte">${esc(h.nom)}</div>${complet ? `<div class="meta">${pts}</div>` : ''}</div>
    <span class="serie${s ? '' : ' zero'}" title="Jours consécutifs">${s ? '🔥 ' + pluriel(s, 'jour') : '—'}</span>
    ${complet ? `<div class="outils"><button class="btn-rond" data-act="modifier-habitude" data-id="${h.id}" title="Modifier">✏️</button></div>` : ''}
  </div>`;
}
function carteRdv(r) {
  const d = parseJour(r.date), t = typeRdv(r.type);
  return `<div class="rdv${r.date < auj() ? ' passe' : ''}">
    <div class="cal-ic"><small>${MOIS_C[d.getMonth()]}</small><b>${d.getDate()}</b></div>
    <div class="corps"><div class="titre">${t[1]} ${esc(r.titre || t[2])}</div>
      <div class="meta"><span>${quand(r.date)}${r.heure ? ' · ' + esc(r.heure) : ''}</span>${r.avec ? `<span>· ${esc(r.avec)}</span>` : ''}${r.lieu ? `<span>· 📍 ${esc(r.lieu)}</span>` : ''}</div></div>
    <div class="outils"><button class="btn-rond" data-act="modifier-rdv" data-id="${r.id}" title="Modifier">✏️</button></div></div>`;
}
function ligneRappel(r) {
  const t = typeRappel(r.type), retard = r.date && r.date < auj() && !r.fait;
  return `<div class="ligne${r.fait ? ' fait' : ''}">
    <button type="button" class="coche-btn" data-act="rappel" data-id="${r.id}" aria-label="Marquer comme fait">${COCHE}</button>
    <span class="emo">${t[1]}</span>
    <div class="corps"><div class="texte">${esc(r.texte || t[2])}</div>
      <div class="meta"><span>${esc(t[2])}</span>${r.date ? `<span class="etiquette${retard ? ' alerte' : ' ciel'}">${retard ? 'à faire · ' : ''}${quand(r.date)}</span>` : ''}</div></div>
    <div class="outils"><button class="btn-rond" data-act="modifier-rappel" data-id="${r.id}" title="Modifier">✏️</button></div></div>`;
}
function carteObjectif(o, compact) {
  const t = typeObjectif(o.type), p = progresObjectif(o);
  return `<div class="objectif${p.pct >= 1 ? ' atteint' : ''}">
    <div class="tete"><div class="emo">${t[1]}</div><div style="min-width:0"><div class="n">${esc(o.titre || t[2])}</div>
      <div class="s">${o.type === 'libre' ? 'Objectif personnel' : `Cible : ${joli(nombre(o.cible) || t[4])} ${t[3]}`}${o.fin ? ` · jusqu’au ${fmtJour(o.fin)}` : ''}</div></div>
      ${compact ? '' : `<div class="outils"><button class="btn-rond" data-act="vedette" data-id="${o.id}" title="Mettre en avant sur l’accueil">${o.vedette ? '⭐' : '☆'}</button>
        <button class="btn-rond" data-act="modifier-objectif" data-id="${o.id}" title="Modifier">✏️</button></div>`}</div>
    ${barreProgres(p.pct, p.texte)}
    ${!compact && o.type === 'libre' ? `<div style="margin-top:10px">${o.pas.map(s => `<div class="ligne${s.fait ? ' fait' : ''}">
        <button type="button" class="coche-btn" data-act="pas" data-id="${o.id}" data-p="${s.id}">${COCHE}</button><div class="corps"><div class="texte">${esc(s.texte)}</div></div>
        <div class="outils"><button class="btn-rond" data-act="retirer-pas" data-id="${o.id}" data-p="${s.id}" title="Retirer">✕</button></div></div>`).join('')}
      <form class="actions" data-form="pas" data-id="${o.id}" style="margin-top:8px"><input class="saisie" name="t" placeholder="Ajouter une étape…" style="flex:1;min-width:0;padding:9px 12px;border-radius:12px;border:1px solid var(--bord);background:var(--champ);font-family:var(--ui)"><button class="btn petit lavande" type="submit">＋</button></form></div>` : ''}
    ${p.pct >= 1 ? '<div class="note-douce" style="margin-top:10px">🎉 <b>Bravo !</b> Vous avez atteint votre objectif. Prenez le temps d’en être fier·e.</div>' : ''}
  </div>`;
}
function carteDefiDuJour() {
  const d = defiDuJour(), fait = (S.defis[auj()] || []).includes(d[0]);
  return `<div class="defi${fait ? ' fait' : ''}"><span class="emo">${d[1]}</span>
    <div style="flex:1;min-width:0"><div class="s ui" style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px">Mini-défi du jour</div>
      <div class="n">${esc(d[2])}</div><div class="s">${esc(d[3])}</div></div>
    <button class="btn ${fait ? 'lavande' : 'plein'} petit" data-act="defi" data-k="${d[0]}">${fait ? '✓ Relevé !' : 'Je le fais'}</button></div>`;
}

/* ============================================================
   L'ACCUEIL
   ============================================================ */
function vueAujourdhui() {
  const d = auj(), en = S.energie[d], taux = tauxHabitudes(d);
  const hs = habitudesDu(d), nuit = nuitDu(d) || nuitsTriees()[0];
  const lundi = lundiDe(d), min = minutesSemaine(lundi), obj = objectifVedette();
  const heure = new Date().getHours(), salut = heure < 5 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const nomSalut = R().prenom || (moiFoyer() || {}).prenom, prenom = nomSalut ? ' ' + esc(nomSalut) : '';
  const venir = rdvAVenir().slice(0, 3), rap = rappelsOuverts();
  return `<div class="vue">
  <section class="carte hero">
    <svg class="jeton" viewBox="0 0 40 40" aria-hidden="true"><use href="#l-sa"/></svg>
    <div class="txt">
      <div class="date">${fmtJour(d, true)}</div>
      <h2>${salut}${prenom}, <span>prenez soin de votre rythme.</span></h2>
      <div class="slogan">NaoSanté — Prenez soin de votre rythme. <button class="lien aide-lien" data-act="aide" title="Comment ça marche (F1)">❓ Comment ça marche</button></div>
      <p class="douceur"><span>${esc(encouragementDuJour(U.phrase))}</span><button class="btn-rond autre" data-act="phrase" title="Une autre phrase">↻</button></p>
    </div>
    <div class="progres-jour" title="Habitudes du jour">${anneau(taux || 0)}<div class="lab"><div><b>${taux == null ? '—' : Math.round(taux * 100) + '%'}</b>habitudes<br>du jour</div></div></div>
  </section>

  <div class="rapides">
    <button class="rapide" data-act="ajouter-habitude"><span class="ic">✅</span><span>Ajouter une habitude<small>boire, marcher, s’étirer…</small></span></button>
    <button class="rapide" data-act="ajouter-rdv"><span class="ic">📅</span><span>Ajouter un rendez-vous<small>médecin, dentiste, optique…</small></span></button>
    <button class="rapide" data-act="ajouter-activite"><span class="ic">🏃</span><span>Ajouter une activité<small>marche, yoga, vélo…</small></span></button>
    <button class="rapide eau" data-act="boire"><span class="ic">💧</span><span>Boire un verre d’eau<small>${verres(d)} / ${R().objectifVerres} aujourd’hui</small></span></button>
  </div>

  <div class="grille g3">
    <section class="carte">
      <h3><span class="e">⚡</span> Mon énergie du jour</h3>
      <p class="chapo">Comment vous sentez-vous, là, maintenant ?</p>
      <div class="choix-niveau">${ENERGIES.map(([n, e, l]) => `<button type="button" class="${en === n ? 'on' : ''}" data-act="energie" data-n="${n}"><span class="e">${e}</span>${l}</button>`).join('')}</div>
      <p class="ui muet" style="font-size:12px;margin:12px 0 0">${en ? (en <= 1 ? 'Journée à énergie douce : accordez-vous des pauses, sans culpabiliser.' : en === 2 ? 'Une énergie moyenne : parfait pour les petits pas.' : 'Belle énergie ! Profitez-en à votre rythme.') : 'Un simple clic : cela vous aidera à voir vos tendances.'}</p>
    </section>

    <section class="carte">
      <h3><span class="e">💧</span> Mon hydratation <button class="lien" data-act="vue" data-vue="hydratation">Détails →</button></h3>
      <div class="eau-bloc">${goutte(pctEau(d))}
        <div style="flex:1;min-width:140px"><div class="gros">${verres(d)}<small>/ ${R().objectifVerres} verres</small></div>
          <div class="ui muet" style="font-size:12px;margin-top:4px">soit ${litres(verres(d))} sur ${litres(R().objectifVerres)}</div>
          ${rangeeVerres(d)}
          <div class="actions"><button class="btn eau petit" data-act="boire">💧 Un verre</button>${verres(d) ? '<button class="btn petit fin" data-act="retirer-verre">− 1</button>' : ''}</div></div></div>
      ${serieEau() > 1 ? `<p class="ui" style="font-size:12px;margin:10px 0 0"><span class="serie">🔥 ${serieEau()} jours</span> <span class="muet">d’objectif atteint d’affilée</span></p>` : ''}
    </section>

    <section class="carte">
      <h3><span class="e">✅</span> Mes habitudes du jour <button class="lien" data-act="vue" data-vue="habitudes">Toutes →</button></h3>
      ${hs.length ? `<p class="chapo">${hs.filter(h => estFaite(h)).length} sur ${hs.length} réalisée${hs.length > 1 ? 's' : ''}</p>${hs.slice(0, 6).map(h => ligneHabitude(h)).join('')}${hs.length > 6 ? `<button class="lien" data-act="vue" data-vue="habitudes" style="margin-top:8px">+ ${hs.length - 6} autres</button>` : ''}`
        : vide('Aucune habitude pour l’instant.', '<button class="btn plein petit" data-act="habitudes-proposees">✨ Commencer avec 5 habitudes douces</button>')}
    </section>

    <section class="carte">
      <h3><span class="e">🌙</span> Mon sommeil <button class="lien" data-act="vue" data-vue="sommeil">Détails →</button></h3>
      ${nuit ? `<div class="nuit"><div class="lune-ic">🌙</div><div><div class="gros">${duree(dureeNuit(nuit))}</div>
          <div class="ui muet" style="font-size:12px">${nuit.date === d ? 'cette nuit' : 'nuit du ' + fmtJour(ajouteJours(nuit.date, -1))} · objectif ${joli(R().objectifSommeil)} h</div></div></div>
        <div class="horaires" style="margin:12px 0"><div>Coucher<b>${esc(nuit.coucher)}</b></div><div>Réveil<b>${esc(nuit.lever)}</b></div><div>Moyenne 7 j<b>${moyenneSommeil(derniersJours(7)) ? duree(moyenneSommeil(derniersJours(7))) : '—'}</b></div></div>`
        : '<p class="chapo">Notez vos heures de coucher et de réveil pour suivre votre rythme.</p>'}
      <button class="btn ${nuitDu(d) ? 'fin' : 'plein'} petit" data-act="noter-nuit">${nuitDu(d) ? '✏️ Modifier ma nuit' : '🌙 Noter ma nuit'}</button>
    </section>

    <section class="carte">
      <h3><span class="e">📅</span> Mes rendez-vous à venir <button class="lien" data-act="vue" data-vue="rdv">Tous →</button></h3>
      ${venir.length ? venir.map(carteRdv).join('') : vide('Aucun rendez-vous prévu.', '<button class="btn petit lavande" data-act="ajouter-rdv">＋ Ajouter un rendez-vous</button>')}
      ${rap.length ? `<div class="sous-titre" style="margin-top:14px">🔔 Rappels</div>${rap.slice(0, 2).map(ligneRappel).join('')}${rap.length > 2 ? `<button class="lien" data-act="vue" data-vue="rdv">+ ${rap.length - 2} autres rappels</button>` : ''}` : ''}
    </section>

    <section class="carte">
      <h3><span class="e">🏃</span> Mon activité de la semaine <button class="lien" data-act="vue" data-vue="activite">Détails →</button></h3>
      <div class="gros" style="margin:4px 0 8px">${min}<small>/ ${R().objectifMinutes} min</small></div>
      ${barreProgres(min / Math.max(1, R().objectifMinutes), '')}
      ${barres(joursSemaine(lundi).map(j => ({ v: minutesDu(j), lab: lab7(j), auj: j === d, titre: `${fmtJour(j)} : ${minutesDu(j)} min` })), { fmt: v => v })}
    </section>

    ${typeof cartePilulierJour === 'function' ? cartePilulierJour() : ''}

    <section class="carte large-2">
      <h3><span class="e">🎯</span> Mon objectif en cours <button class="lien" data-act="vue" data-vue="objectifs">Tous →</button></h3>
      ${obj ? carteObjectif(obj, true) : vide('Choisissez un objectif doux : mieux dormir, bouger davantage, boire plus d’eau…', '<button class="btn plein petit" data-act="ajouter-objectif">🎯 Créer mon objectif</button>')}
    </section>

    <section class="carte">
      <h3><span class="e">🌱</span> Un petit défi</h3>
      <p class="chapo">Simple, doux, faisable aujourd’hui.</p>
      ${carteDefiDuJour()}
    </section>
  </div></div>`;
}

/* ============================================================
   HYDRATATION
   ============================================================ */
function vueHydratation() {
  const d = auj(), j7 = derniersJours(7), j30 = derniersJours(30);
  const moy7 = somme(j7, verres) / 7, atteints = j30.filter(x => verres(x) >= R().objectifVerres).length;
  return `<div class="vue">${titreVue('Mon <span>hydratation</span>', 'Un verre après l’autre, à votre rythme.',
    '<button class="btn fin" data-act="reglages">⚙️ Mon objectif</button><button class="btn eau" data-act="boire">💧 Boire un verre d’eau</button>')}
  <div class="grille g2">
    <section class="carte">
      <h3><span class="e">💧</span> Aujourd’hui</h3>
      <div class="eau-bloc" style="margin-top:10px">${goutte(pctEau(d))}
        <div style="flex:1;min-width:180px"><div class="gros">${verres(d)}<small>/ ${R().objectifVerres} verres de ${R().verreMl} ml</small></div>
          <div class="ui muet" style="font-size:12.5px;margin-top:4px">${litres(verres(d))} bus sur ${litres(R().objectifVerres)} · ${verres(d) >= R().objectifVerres ? '🎉 objectif du jour atteint' : `encore ${R().objectifVerres - verres(d)} verre${R().objectifVerres - verres(d) > 1 ? 's' : ''}`}</div>
          ${rangeeVerres(d)}
          <div class="actions"><button class="btn eau" data-act="boire">＋ 1 verre</button><button class="btn fin" data-act="retirer-verre"${verres(d) ? '' : ' disabled'}>− 1</button></div></div></div>
      <p class="note-douce">Touchez un verre pour indiquer directement combien vous en avez bu. Les besoins varient d’une personne à l’autre :
        <b>votre objectif est le vôtre</b>, ajustez-le librement dans ⚙️.</p>
    </section>
    <section class="carte">
      <h3><span class="e">📊</span> Mes 7 derniers jours</h3>
      <div class="chiffres" style="margin:10px 0 14px">
        <div><b>${joli(moy7)}</b><small>verres / jour en moyenne</small></div>
        <div><b>${serieEau()}</b><small>jour${serieEau() > 1 ? 's' : ''} d’affilée à l’objectif</small></div>
        <div><b>${atteints}</b><small>objectifs atteints sur 30 jours</small></div>
      </div>
      ${barres(j7.map(x => ({ v: verres(x), lab: lab7(x), auj: x === d, titre: `${fmtJour(x)} : ${verres(x)} verres` })), { cible: R().objectifVerres, cls: 'eau' })}
    </section>
  </div></div>`;
}

/* ============================================================
   SOMMEIL
   ============================================================ */
function vueSommeil() {
  const j14 = derniersJours(14), nuits = nuitsTriees(), obj = R().objectifSommeil;
  const moy = moyenneSommeil(derniersJours(7));
  const couchers = derniersJours(7).map(nuitDu).filter(Boolean).map(n => { const m = enMinutes(n.coucher); return m < 720 ? m + 1440 : m; });
  const moyC = couchers.length ? somme(couchers) / couchers.length : 0;
  const ecart = couchers.length > 1 ? Math.round(somme(couchers, c => Math.abs(c - moyC)) / couchers.length) : null;
  const hC = m => { m = Math.round(m) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const aObj = derniersJours(7).filter(x => { const n = nuitDu(x); return n && dureeNuit(n) >= obj * 60 - 10; }).length;
  return `<div class="vue">${titreVue('Mon <span>sommeil</span>', 'Le coucher, le réveil, et le rythme qui se dessine.',
    '<button class="btn fin" data-act="reglages">⚙️ Mon objectif</button><button class="btn plein" data-act="noter-nuit">🌙 Noter ma nuit</button>')}
  <div class="grille g3" style="margin-bottom:16px">
    <section class="carte"><h3><span class="e">🎯</span> Mon objectif</h3>
      <div class="gros" style="margin:8px 0">${joli(obj)} h<small>par nuit</small></div>
      <div class="ui muet" style="font-size:12.5px">Heure de coucher visée : <b style="color:var(--ink)">${esc(R().coucherCible || '—')}</b></div>
      <div style="margin-top:12px">${barreProgres(aObj / 7, `${aObj} nuit${aObj > 1 ? 's' : ''} sur 7 à l’objectif`)}</div></section>
    <section class="carte"><h3><span class="e">📊</span> Cette semaine</h3>
      <div class="chiffres" style="margin-top:10px">
        <div><b>${moy ? duree(moy) : '—'}</b><small>durée moyenne</small></div>
        <div><b>${moyC ? hC(moyC) : '—'}</b><small>coucher moyen</small></div>
        <div><b>${ecart == null ? '—' : '± ' + ecart + ' min'}</b><small>régularité du coucher</small></div>
      </div></section>
    <section class="carte"><h3><span class="e">💡</span> Des idées douces</h3>
      <p class="ui" style="font-size:13px;color:var(--ink-2);margin:6px 0 0;line-height:1.6">• Garder des horaires proches, même le week-end.<br>• Un petit rituel du soir : lumière tamisée, lecture, respiration.<br>• Poser le téléphone un peu avant de dormir.</p>
      <p class="ui muet" style="font-size:12px;margin:10px 0 0">Si votre sommeil vous inquiète, parlez-en à un professionnel de santé.</p></section>
  </div>
  <div class="grille g2">
    <section class="carte"><h3><span class="e">🌙</span> Mes 14 dernières nuits</h3>
      ${barres(j14.map(x => { const n = nuitDu(x); return { v: n ? Math.round(dureeNuit(n) / 6) / 10 : 0, lab: parseJour(x).getDate(), auj: x === auj(), titre: n ? `${fmtJour(x)} : ${duree(dureeNuit(n))}` : fmtJour(x) }; }), { cible: obj, fmt: v => joli(v) })}
      <p class="ui muet" style="font-size:12px;margin:8px 0 0">En heures, rangées au jour du réveil. La ligne verte marque votre objectif.</p></section>
    <section class="carte"><h3><span class="e">📖</span> Mon carnet de nuits</h3>
      ${nuits.length ? nuits.slice(0, 10).map(n => `<div class="ligne"><span class="emo">${n.qualite ? QUALITES[n.qualite - 1][1].split(' ')[0] : '🌙'}</span>
        <div class="corps"><div class="texte"><b>${duree(dureeNuit(n))}</b> · ${esc(n.coucher)} → ${esc(n.lever)}</div>
        <div class="meta"><span>réveil ${fmtJour(n.date)}</span>${n.note ? `<span>· ${esc(n.note)}</span>` : ''}</div></div>
        <div class="outils"><button class="btn-rond" data-act="noter-nuit" data-id="${n.id}" title="Modifier">✏️</button></div></div>`).join('')
        : vide('Aucune nuit notée pour l’instant.', '<button class="btn plein petit" data-act="noter-nuit">🌙 Noter ma première nuit</button>')}
    </section>
  </div></div>`;
}

/* ============================================================
   ACTIVITÉ & SOUPLESSE
   ============================================================ */
function vueActivite() {
  const d = auj(), lundi = lundiDe(d), min = minutesSemaine(lundi);
  const recentes = S.activites.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const rt = S.etirements.routine, tot = somme(rt, e => nombre(e.secondes)), faitAuj = !!S.etirements.jours[d];
  const parType = ACTIVITES.map(a => [a, somme(S.activites.filter(x => x.type === a[0] && x.date >= lundi && estMoi(x.membre)), x => nombre(x.duree))]).filter(x => x[1]);
  return `<div class="vue">${titreVue('Mon <span>activité</span>, mes séances & ma souplesse', 'Bouger un peu, c’est déjà bouger — et le minuteur s’occupe du reste.',
    '<button class="btn fin" data-act="reglages">⚙️ Mon objectif</button><button class="btn plein" data-act="ajouter-activite">🏃 Ajouter une activité</button>')}
  <div class="grille g2">
    ${carteSportsFoyer()}
    ${sectionSport()}
    <section class="carte"><h3><span class="e">➕</span> Ajout rapide</h3><p class="chapo">Choisissez une activité, indiquez la durée — c’est tout.</p>
      <div class="types">${ACTIVITES.map(([k, e, l]) => `<button class="type" data-act="ajouter-activite" data-type="${k}"><span class="e">${e}</span>${l}</button>`).join('')}</div></section>
    <section class="carte"><h3><span class="e">📅</span> Ma semaine</h3>
      <div class="gros" style="margin:6px 0 8px">${min}<small>/ ${R().objectifMinutes} min</small></div>
      ${barreProgres(min / Math.max(1, R().objectifMinutes), parType.map(([a, m]) => `${a[1]} ${m} min`).join(' · ') || 'Aucune activité cette semaine pour l’instant.')}
      ${barres(joursSemaine(lundi).map(j => ({ v: minutesDu(j), lab: lab7(j), auj: j === d, titre: `${fmtJour(j)} : ${minutesDu(j)} min` })))}</section>

    <section class="carte"><h3><span class="e">🙆</span> Ma routine souplesse <span class="serie${serieEtirements() ? '' : ' zero'}" style="margin-left:auto">${serieEtirements() ? '🔥 ' + pluriel(serieEtirements(), 'jour') : ''}</span></h3>
      <p class="chapo">${rt.length} geste${rt.length > 1 ? 's' : ''} · environ ${Math.max(1, Math.round(tot / 60))} min · ${seancesEtirementSemaine()} séance${seancesEtirementSemaine() > 1 ? 's' : ''} cette semaine sur ${R().objectifEtirements}</p>
      ${rt.map(e => `<div class="etirement"><span class="emo">${esc(e.emoji || '🙆')}</span><div class="corps"><div class="n">${esc(e.nom)}</div><div class="d">${nombre(e.secondes)} s${e.conseil ? ' · ' + esc(e.conseil) : ''}</div></div>
        <button class="btn-rond" data-act="modifier-etirement" data-id="${e.id}" title="Modifier">✏️</button></div>`).join('')}
      <div class="actions" style="margin-top:12px"><button class="btn plein" data-act="routine"${rt.length ? '' : ' disabled'}>▶ Commencer la routine</button>
        <button class="btn ${faitAuj ? 'lavande' : 'fin'}" data-act="etirements-faits">${faitAuj ? '✓ Faite aujourd’hui' : '✓ Marquer faite'}</button>
        <button class="btn fin petit" data-act="modifier-etirement">＋ Un geste</button></div>
      <p class="note-douce">Allez-y <b>en douceur</b>, sans forcer ni à-coups, et arrêtez si c’est inconfortable ou douloureux.</p></section>

    <section class="carte"><h3><span class="e">📖</span> ${prochesFoyer().length ? 'Les dernières activités' : 'Mes dernières activités'}</h3>
      ${recentes.length ? recentes.map(a => { const t = activite(a.type); return `<div class="ligne"><span class="emo">${t[1]}</span>
        <div class="corps"><div class="texte"><b>${esc(t[2])}</b> · ${nombre(a.duree)} min${estMoi(a.membre) ? '' : ` <span class="etiquette ciel">👪 ${esc(prenomDe(a.membre))}</span>`}</div><div class="meta"><span>${quand(a.date)}</span><span>· ${intensite(a.intensite)}</span>${a.note ? `<span>· ${esc(a.note)}</span>` : ''}</div></div>
        <div class="outils"><button class="btn-rond" data-act="modifier-activite" data-id="${a.id}" title="Modifier">✏️</button></div></div>`; }).join('')
        : vide('Aucune activité notée.', '<button class="btn plein petit" data-act="ajouter-activite">🏃 Ajouter ma première activité</button>')}
      ${prochesFoyer().length ? '<p class="note-douce">Les activités notées pour un proche du foyer restent les siennes : elles ne comptent pas dans <b>vos</b> minutes ni dans vos objectifs.</p>' : ''}</section>
  </div></div>`;
}

/* ============================================================
   LE FOYER (repris de NaoHome)
   ============================================================ */
const fmtNaissance = s => { if (!s) return ''; const d = parseJour(s); return `${d.getDate()} ${MOIS_L[d.getMonth()]} ${d.getFullYear()}`; };
const emMembre = m => m && m.genre === 'enfant' ? '🧒' : '🧑';
/* « Julien Martin · Parent · 38 ans · 🎂 14 mars 1987 — repris de NaoHome » */
function ligneIdentite(m, memo) {
  if (!m) return memo ? `<p class="identite">🪪 <b>${esc(memo)}</b> <span class="muet">— n’est plus rattaché·e à NaoSanté dans NaoHome</span></p>` : '';
  return `<p class="identite">🪪 <b>${esc(nomMembre(m))}</b>${m.lien ? ' · ' + esc(m.lien) : ''}${texteAge(m.naissance) ? ' · ' + texteAge(m.naissance) : ''}${m.naissance ? ' · 🎂 ' + fmtNaissance(m.naissance) : ''}
    <span class="muet">— repris de NaoHome</span></p>`;
}
const etiquetteSport = s => `<span class="etiquette ciel">${sportFoyer(s.sport)[1]} ${esc(s.sport)}${s.club ? ' · ' + esc(s.club) : ''}${s.debut ? ' · depuis ' + anneeDe(s.debut) : ''}${s.competition ? ' · 🏆' : ''}</span>`;
const etiquetteSportPasse = s => `<span class="etiquette passe">${sportFoyer(s.sport)[1]} ${esc(s.sport)}${s.debut || s.fin ? ' · ' + [anneeDe(s.debut), anneeDe(s.fin)].filter(Boolean).join('–') : ''}${s.niveau ? ' · ' + esc(s.niveau) : ''}</span>`;
const texteSports = m => m ? [sportsEnCours(m).map(s => s.sport + (s.club ? ' (' + s.club + ')' : '')).join(', '),
  sportsPasses(m).length ? 'Avant : ' + sportsPasses(m).map(s => s.sport).join(', ') : ''].filter(Boolean).join('\n') : '';
function carteMembre(m) {
  const moi = m.id === idMoi(), ec = sportsEnCours(m), pa = sportsPasses(m);
  const fiche = moi ? S.notes.active : !!S.fiches[m.id];
  return `<div class="membre-foyer${moi ? ' moi' : ''}">
    <div class="tete"><span class="ini">${esc(initiales(nomMembre(m)))}</span>
      <div class="corps"><div class="n">${esc(nomMembre(m))}${moi ? ' <span class="etiquette ok">🙋 c’est moi</span>' : ''}</div>
        <div class="s">${[m.lien ? esc(m.lien) : (m.genre === 'enfant' ? 'Enfant' : 'Adulte'), texteAge(m.naissance), m.naissance ? '🎂 ' + fmtNaissance(m.naissance) : ''].filter(Boolean).join(' · ')}</div></div></div>
    <div class="sports">${ec.length || pa.length ? `${ec.length ? `<div class="lab">En cours</div><div class="etiquettes">${ec.map(etiquetteSport).join('')}</div>` : ''}
        ${pa.length ? `<div class="lab">Avant</div><div class="etiquettes">${pa.map(etiquetteSportPasse).join('')}</div>` : ''}`
      : '<div class="muet ui" style="font-size:12.5px">Aucun sport noté dans NaoHome.</div>'}</div>
    <div class="actions"><button class="btn petit lavande" data-act="fiche-de" data-id="${moi ? '' : m.id}">🔒 ${moi ? 'Ma fiche' : fiche ? 'Sa fiche' : 'Créer sa fiche'}</button>
      <button class="btn petit fin" data-act="ajouter-activite" data-membre="${moi ? '' : m.id}">🏃 Une activité</button>
      <button class="btn petit fin" data-act="c-est-moi" data-id="${m.id}" title="${moi ? 'Ce n’est pas moi' : 'Cette personne, c’est vous : sa fiche devient « Moi »'}">${moi ? '↩︎ Pas moi' : '🙋 C’est moi'}</button></div>
  </div>`;
}
function sectionFoyer() {
  const ms = membresFoyer();
  if (!ms.length) return `<section class="carte large-2 foyer sans"><h3><span class="e">👪</span> Le foyer <small>(depuis NaoHome)</small></h3>
    <p class="ui muet" style="font-size:13px;margin:4px 0 0;line-height:1.55">Vous tenez le carnet de famille dans <b>NaoHome</b> ? Sur la fiche d’un adulte ou d’un enfant, cochez
      <b>« Rattacher à NaoSanté »</b> : il apparaîtra ici avec son âge et ses sports, prêt à être choisi pour sa fiche ou ses activités — sans rien retaper.</p></section>`;
  return `<section class="carte large-2 foyer"><h3><span class="e">👪</span> Le foyer <small>(depuis NaoHome)</small>
      <a class="lien" href="../NaoHome/NaoHome.html" style="margin-left:auto">Ouvrir NaoHome →</a></h3>
    <p class="chapo">${pluriel(ms.length, 'personne rattachée', 'personnes rattachées')}${FOYER.maj ? ', à jour de NaoHome du ' + fmtJour(String(FOYER.maj).slice(0, 10)) : ''} —
      On choisit la personne, on ne retape rien ; pour corriger un nom ou une date, c’est dans NaoHome.</p>
    <div class="membres-foyer">${ms.map(carteMembre).join('')}</div></section>`;
}
/* Le répertoire des activités sportives du foyer, repris du carnet de famille de NaoHome :
   chaque personne, ses sports en cours (＋ pour noter une séance) et ceux déjà pratiqués. */
function carteSportsFoyer() {
  const ms = sportifsFoyer().filter(m => (m.sports || []).length);
  const enCours = somme(ms, m => sportsEnCours(m).length), passes = somme(ms, m => sportsPasses(m).length);
  const tete = `<h3><span class="e">🏅</span> Les activités sportives du foyer <a class="lien" href="../NaoHome/NaoHome.html">🏡 NaoHome →</a></h3>`;
  if (!ms.length) return `<section class="carte large-2">${tete}
    ${vide(FOYER ? 'Aucun sport n’est encore noté dans le carnet de famille de NaoHome.' : 'Les sports notés dans le carnet de famille de NaoHome (onglet Sports) s’afficheront ici tout seuls.')}</section>`;
  const personne = m => {
    const moi = m.id === idMoi(), qui = esc(m.prenom || nomMembre(m));
    const ec = sportsEnCours(m), pa = sportsPasses(m);
    const resume = [ec.length ? pluriel(ec.length, 'sport en cours', 'sports en cours') : '', pa.length ? pluriel(pa.length, 'déjà pratiqué', 'déjà pratiqués') : ''].filter(Boolean).join(' · ');
    return `<div class="sport-personne${moi ? ' moi' : ''}">
      <div class="sport-qui"><span class="ini">${esc(initiales(nomMembre(m)) || '?')}</span>
        <div class="corps"><b>${qui}</b>${moi ? ' <span class="etiquette ok">🙋 moi</span>' : ''}<small>${resume}</small></div>
        ${m.nonRattache ? '<span class="etiquette passe" title="Cochez « 🩺 Rattacher à NaoSanté » dans sa fiche NaoHome pour noter ses séances ici">non rattaché·e</span>' : ''}</div>
      ${ec.map(s => `<div class="sport-encours"><span class="sport-ico">${sportFoyer(s.sport)[1]}</span>
        <div class="corps"><div class="n">${esc(s.sport)}${s.competition ? ' <span class="pastille-compet" title="En compétition">🏆 compét.</span>' : ''}</div>
          <div class="m">${[s.club ? '📍 ' + esc(s.club) : '', s.debut ? 'depuis ' + anneeDe(s.debut) : '', s.niveau ? esc(s.niveau) : ''].filter(Boolean).join(' · ') || '&nbsp;'}</div></div>
        ${m.nonRattache ? '' : `<button class="sport-plus" data-act="seance-sport" data-id="${moi ? '' : m.id}" data-sport="${esc(s.sport)}" data-club="${esc(s.club || '')}" title="Noter une séance de ${esc(s.sport)}">＋ Séance</button>`}</div>`).join('')}
      ${pa.length ? `<div class="sport-avant"><div class="lab">Déjà pratiqué</div>
        ${pa.map(s => `<div class="sport-passe"><span class="sport-ico petit">${sportFoyer(s.sport)[1]}</span><b>${esc(s.sport)}</b>
          <span class="ans">${[anneeDe(s.debut), anneeDe(s.fin)].filter(Boolean).join('–')}</span>${s.niveau ? `<span class="niv">${esc(s.niveau)}</span>` : ''}</div>`).join('')}</div>` : ''}
      ${!ec.length && !pa.length ? '<p class="ui muet" style="font-size:12.5px;margin:4px 0">Aucun sport noté.</p>' : ''}</div>`;
  };
  return `<section class="carte large-2">${tete}
    <p class="chapo">Repris du carnet de famille de NaoHome : ${pluriel(enCours, 'sport en cours', 'sports en cours')}${passes ? ', ' + pluriel(passes, 'déjà pratiqué', 'déjà pratiqués') : ''}. « ＋ Séance » note une séance pour la bonne personne, déjà remplie.</p>
    <div class="sports-foyer">${ms.map(personne).join('')}</div></section>`;
}

/* ============================================================
   HABITUDES & DÉFIS
   ============================================================ */
function vueHabitudes() {
  const hs = S.habitudes.filter(h => !h.archive), arch = S.habitudes.filter(h => h.archive);
  const manquantes = HABITUDES_PROPOSEES.filter(([, n]) => !S.habitudes.some(h => h.nom === n));
  const faitsDefis = S.defis[auj()] || [];
  const meilleure = hs.reduce((m, h) => Math.max(m, serieHabitude(h)), 0);
  return `<div class="vue">${titreVue('Mes <span>habitudes</span> & mini-défis', 'Cochez ce que vous avez fait. Les séries se construisent toutes seules.',
    '<button class="btn plein" data-act="ajouter-habitude">✅ Ajouter une habitude</button>')}
  <div class="grille g2">
    <section class="carte large-2"><h3><span class="e">✅</span> Mes habitudes quotidiennes ${meilleure ? `<span class="serie" style="margin-left:auto">🔥 meilleure série en cours : ${pluriel(meilleure, 'jour')}</span>` : ''}</h3>
      <p class="chapo">Les pastilles montrent vos 7 derniers jours : touchez-en une pour corriger un oubli.</p>
      ${hs.length ? hs.map(h => ligneHabitude(h, true)).join('') : vide('Aucune habitude pour l’instant.')}
      ${manquantes.length ? `<div class="sous-titre" style="margin-top:16px">Suggestions</div><div class="actions">${manquantes.map(([e, n]) => `<button class="btn petit fin" data-act="habitude-proposee" data-e="${e}" data-n="${esc(n)}">${e} ${esc(n)} ＋</button>`).join('')}</div>` : ''}
      ${arch.length ? `<div class="sous-titre" style="margin-top:16px">En pause</div><div class="actions">${arch.map(h => `<button class="btn petit fin" data-act="modifier-habitude" data-id="${h.id}">${esc(h.emoji)} ${esc(h.nom)}</button>`).join('')}</div>` : ''}
    </section>
    <section class="carte"><h3><span class="e">🌱</span> Le défi du jour</h3><p class="chapo">Il change chaque matin.</p>${carteDefiDuJour()}</section>
    <section class="carte"><h3><span class="e">✨</span> Tous les mini-défis</h3><p class="chapo">${faitsDefis.length} relevé${faitsDefis.length > 1 ? 's' : ''} aujourd’hui — aucun n’est obligatoire.</p>
      <div class="defis">${DEFIS.map(([k, e, n, s]) => { const f = faitsDefis.includes(k); return `<button class="mini-defi${f ? ' fait' : ''}" data-act="defi" data-k="${k}"><span class="e">${e}</span>${esc(n)}<small>${f ? '✓ relevé aujourd’hui' : esc(s)}</small></button>`; }).join('')}</div></section>
  </div></div>`;
}

/* ============================================================
   RENDEZ-VOUS & RAPPELS
   ============================================================ */
function vueRdv() {
  const venir = rdvAVenir(), passes = rdvPasses().slice(0, 8), ouverts = rappelsOuverts(), faits = S.rappels.filter(r => r.fait).slice(-6).reverse();
  return `<div class="vue">${titreVue('Mes <span>rendez-vous</span> & rappels', 'Médecin, dentiste, optique, suivi… et tout ce qu’il ne faut pas oublier.',
    '<button class="btn fin" data-act="ajouter-rappel">🔔 Ajouter un rappel</button><button class="btn plein" data-act="ajouter-rdv">📅 Ajouter un rendez-vous</button>')}
  <div class="grille g2">
    <section class="carte"><h3><span class="e">📅</span> À venir</h3>
      ${venir.length ? venir.map(carteRdv).join('') : vide('Aucun rendez-vous prévu.')}
      ${passes.length ? `<div class="sous-titre" style="margin-top:16px">Passés</div>${passes.map(carteRdv).join('')}` : ''}</section>
    <section class="carte"><h3><span class="e">🔔</span> Mes rappels</h3>
      <p class="chapo">Renouveler une ordonnance, prendre rendez-vous, faire un contrôle…</p>
      ${ouverts.length ? ouverts.map(ligneRappel).join('') : vide('Aucun rappel en attente.')}
      <div class="sous-titre" style="margin-top:14px">Idées de rappels</div>
      <div class="actions">${TYPES_RAPPEL.slice(0, 3).map(([k, e, l]) => `<button class="btn petit fin" data-act="ajouter-rappel" data-type="${k}">${e} ${l}</button>`).join('')}</div>
      ${faits.length ? `<div class="sous-titre" style="margin-top:16px">Faits récemment</div>${faits.map(ligneRappel).join('')}` : ''}</section>
  </div></div>`;
}

/* ============================================================
   HUMEUR & ÉNERGIE
   ============================================================ */
function vueHumeur() {
  const d = auj(), h = S.humeur[d] || {}, en = S.energie[d];
  const jours = derniersJours(14).reverse().filter(x => S.humeur[x] || S.energie[x]);
  const j7 = derniersJours(7), moyE = j7.map(x => S.energie[x]).filter(Boolean), moyH = j7.map(x => (S.humeur[x] || {}).h).filter(Boolean);
  return `<div class="vue">${titreVue('Mon <span>humeur</span> & mon énergie', 'Un petit mot pour vous, chaque jour. Personne d’autre ne le lit.')}
  <div class="grille g2">
    <section class="carte"><h3><span class="e">⚡</span> Mon énergie du jour</h3>
      <div class="choix-niveau" style="margin-top:10px">${ENERGIES.map(([n, e, l]) => `<button type="button" class="${en === n ? 'on' : ''}" data-act="energie" data-n="${n}"><span class="e">${e}</span>${l}</button>`).join('')}</div>
      <div class="sous-titre" style="margin-top:18px">Mon humeur</div>
      <div class="choix-niveau cinq">${HUMEURS.map(([n, e, l]) => `<button type="button" class="${h.h === n ? 'on' : ''}" data-act="humeur" data-n="${n}"><span class="e">${e}</span>${l}</button>`).join('')}</div>
      <div class="sous-titre" style="margin-top:18px">Mon ressenti du jour</div>
      <form data-form="ressenti"><textarea name="t" class="saisie-libre" placeholder="Ce qui m’a fait du bien, ce qui m’a pesé, une petite victoire…" style="width:100%;min-height:96px;padding:12px;border-radius:14px;border:1px solid var(--bord);background:var(--champ);font-family:var(--ui);font-size:14px;resize:vertical">${esc(h.ressenti || '')}</textarea>
        <div class="actions" style="margin-top:8px"><button class="btn plein petit" type="submit">Enregistrer</button></div></form></section>
    <section class="carte"><h3><span class="e">📖</span> Mon journal</h3>
      <div class="chiffres" style="margin:8px 0 14px">
        <div><b>${moyE.length ? energie(Math.round(somme(moyE) / moyE.length))[1] + ' ' + energie(Math.round(somme(moyE) / moyE.length))[2] : '—'}</b><small>énergie moyenne sur 7 jours</small></div>
        <div><b>${moyH.length ? humeur(Math.round(somme(moyH) / moyH.length))[1] + ' ' + humeur(Math.round(somme(moyH) / moyH.length))[2] : '—'}</b><small>humeur moyenne sur 7 jours</small></div>
      </div>
      ${jours.length ? jours.map(x => { const hh = S.humeur[x] || {}, ee = S.energie[x]; const p = parseJour(x); return `<div class="journal-j">
        <div class="d">${JOURS_C[p.getDay()]}<b>${p.getDate()}</b></div><div class="e">${hh.h ? humeur(hh.h)[1] : ''}${ee ? energie(ee)[1] : ''}</div>
        <div class="t">${hh.ressenti ? esc(hh.ressenti) : `<span class="muet ui" style="font-size:12.5px">${[hh.h ? 'Humeur ' + humeur(hh.h)[2].toLowerCase() : '', ee ? 'énergie ' + energie(ee)[2].toLowerCase() : ''].filter(Boolean).join(' · ')}</span>`}</div></div>`; }).join('')
        : vide('Votre journal se remplira au fil des jours.')}
      <p class="note-douce">Si vous traversez une période difficile, n’hésitez pas à en parler à un proche ou à un professionnel.</p></section>
  </div></div>`;
}

/* ============================================================
   OBJECTIFS
   ============================================================ */
function vueObjectifs() {
  const act = objectifsActifs(), arch = S.objectifs.filter(o => o.archive);
  return `<div class="vue">${titreVue('Mes <span>objectifs</span>', 'Des objectifs personnels et bienveillants. La progression se calcule toute seule.',
    '<button class="btn plein" data-act="ajouter-objectif">🎯 Nouvel objectif</button>')}
  <div class="grille g2">
    <section class="carte"><h3><span class="e">🎯</span> En cours</h3><p class="chapo">⭐ = l’objectif affiché sur l’accueil.</p>
      ${act.length ? act.map(o => carteObjectif(o)).join('') : vide('Aucun objectif pour le moment.')}</section>
    <section class="carte"><h3><span class="e">✨</span> Idées d’objectifs</h3><p class="chapo">Un clic, et vous pourrez l’ajuster.</p>
      <div class="pile" style="gap:8px">${TYPES_OBJECTIF.map(([k, e, l, u, c]) => `<button class="btn fin" style="justify-content:flex-start" data-act="ajouter-objectif" data-type="${k}">${e} ${l}${c ? ` <span class="muet" style="font-weight:500">· ${c} ${u}</span>` : ''}</button>`).join('')}</div>
      ${arch.length ? `<div class="sous-titre" style="margin-top:16px">Archivés</div><div class="actions">${arch.map(o => `<button class="btn petit fin" data-act="modifier-objectif" data-id="${o.id}">${typeObjectif(o.type)[1]} ${esc(o.titre)}</button>`).join('')}</div>` : ''}</section>
  </div></div>`;
}

/* ============================================================
   PROGRESSION : semaine et mois
   ============================================================ */
function vueProgression() {
  const semaine = U.periode === 'semaine';
  let jours, titre;
  if (semaine) {
    const lundi = ajouteJours(lundiDe(auj()), U.decalage * 7); jours = joursSemaine(lundi);
    titre = `Semaine du ${fmtJour(lundi)} au ${fmtJour(jours[6])}`;
  } else {
    const r = new Date(); r.setDate(1); r.setMonth(r.getMonth() + U.decalage);
    const deb = isoJour(r), n = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    jours = Array.from({ length: n }, (_, i) => ajouteJours(deb, i));
    titre = `${MOIS_L[r.getMonth()].replace(/^./, c => c.toUpperCase())} ${r.getFullYear()}`;
  }
  const passes = jours.filter(x => x <= auj());
  const joursEau = passes.filter(x => verres(x)), eauMoy = joursEau.length ? somme(joursEau, verres) / joursEau.length : 0, nuits = passes.map(nuitDu).filter(Boolean);
  const somMoy = nuits.length ? somme(nuits, dureeNuit) / nuits.length : 0, minTot = somme(passes, minutesDu);
  const taux = passes.map(tauxHabitudes).filter(t => t != null), tauxMoy = taux.length ? somme(taux) / taux.length : null;
  const ens = passes.map(x => S.energie[x]).filter(Boolean), enMoy = ens.length ? Math.round(somme(ens) / ens.length) : 0;
  const defis = somme(passes, x => (S.defis[x] || []).length);
  const lab = x => semaine ? lab7(x) : parseJour(x).getDate();
  const opt = { mois: !semaine };
  const niveau = t => t == null ? '' : t >= 1 ? 'n4' : t >= .66 ? 'n3' : t >= .33 ? 'n2' : t > 0 ? 'n1' : '';
  let cal = '';
  if (!semaine) {
    const dec = (parseJour(jours[0]).getDay() + 6) % 7;
    cal = `<div class="cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<div class="t">${x}</div>`).join('')}${'<div class="j hors"></div>'.repeat(dec)}${jours.map(x => `<div class="j ${x <= auj() ? niveau(tauxHabitudes(x)) : ''}${x === auj() ? ' auj' : ''}" title="${fmtJour(x)}${tauxHabitudes(x) != null && x <= auj() ? ' : ' + Math.round(tauxHabitudes(x) * 100) + ' % des habitudes' : ''}">${parseJour(x).getDate()}</div>`).join('')}</div>
      <div class="legende">Moins <i></i><i style="background:color-mix(in srgb,#8A5CFF 25%,var(--champ))"></i><i style="background:color-mix(in srgb,#8A5CFF 50%,var(--champ))"></i><i style="background:color-mix(in srgb,#8A5CFF 78%,var(--champ))"></i><i style="background:var(--degrade)"></i> Toutes</div>`;
  }
  return `<div class="vue">${titreVue('Ma <span>progression</span>', 'Regarder le chemin parcouru, sans jugement.')}
  <div class="actions" style="margin-bottom:16px"><div class="sous-onglets" style="margin:0">
      <button class="${semaine ? 'actif' : ''}" data-act="periode" data-p="semaine">Semaine</button><button class="${semaine ? '' : 'actif'}" data-act="periode" data-p="mois">Mois</button></div>
    <button class="btn-rond" data-act="decaler" data-n="-1" title="Précédent">‹</button><b class="chiffre" style="font-size:18px">${titre}</b>
    <button class="btn-rond" data-act="decaler" data-n="1" title="Suivant"${U.decalage >= 0 ? ' disabled style="opacity:.4"' : ''}>›</button>
    ${U.decalage ? '<button class="lien" data-act="decaler" data-n="0">Revenir à aujourd’hui</button>' : ''}</div>
  <section class="carte" style="margin-bottom:16px"><div class="chiffres">
    <div><b>${eauMoy ? joli(eauMoy) : '—'}</b><small>💧 verres / jour suivi</small></div>
    <div><b>${somMoy ? duree(somMoy) : '—'}</b><small>🌙 sommeil moyen</small></div>
    <div><b>${minTot} min</b><small>🏃 d’activité</small></div>
    <div><b>${tauxMoy == null ? '—' : Math.round(tauxMoy * 100) + ' %'}</b><small>✅ habitudes réalisées</small></div>
    <div><b>${enMoy ? energie(enMoy)[1] + ' ' + energie(enMoy)[2] : '—'}</b><small>⚡ énergie moyenne</small></div>
    <div><b>${defis}</b><small>🌱 mini-défis relevés</small></div>
  </div></section>
  <div class="grille g2">
    <section class="carte"><h3><span class="e">💧</span> Hydratation</h3>${barres(jours.map(x => ({ v: verres(x), lab: lab(x), auj: x === auj(), titre: `${fmtJour(x)} : ${verres(x)} verres` })), Object.assign({ cible: R().objectifVerres, cls: 'eau' }, opt))}</section>
    <section class="carte"><h3><span class="e">🌙</span> Sommeil (heures)</h3>${barres(jours.map(x => { const n = nuitDu(x); return { v: n ? Math.round(dureeNuit(n) / 6) / 10 : 0, lab: lab(x), auj: x === auj(), titre: n ? `${fmtJour(x)} : ${duree(dureeNuit(n))}` : fmtJour(x) }; }), Object.assign({ cible: R().objectifSommeil, fmt: joli }, opt))}</section>
    <section class="carte"><h3><span class="e">🏃</span> Activité (minutes)</h3>${barres(jours.map(x => ({ v: minutesDu(x), lab: lab(x), auj: x === auj(), titre: `${fmtJour(x)} : ${minutesDu(x)} min` })), opt)}</section>
    <section class="carte"><h3><span class="e">✅</span> Habitudes</h3>${semaine
      ? barres(jours.map(x => { const t = x <= auj() ? tauxHabitudes(x) : null; return { v: t == null ? 0 : Math.round(t * 100), lab: lab(x), auj: x === auj(), titre: `${fmtJour(x)} : ${t == null ? '—' : Math.round(t * 100) + ' %'}` }; }), { fmt: v => v + '%', cible: 100 })
      : cal}</section>
  </div>
  <p class="note-douce" style="margin-top:16px">🌸 ${esc(encouragementDuJour(3 + U.phrase))}</p></div>`;
}

/* ============================================================
   NOTES PRIVÉES & MÉMO
   ============================================================ */
/* la fiche d'un proche du foyer : nom, âge et naissance viennent de NaoHome */
function ficheProche(id, case_, masque) {
  const m = membreFoyer(id), f = S.fiches[id], qui = m ? (m.prenom || nomMembre(m)) : ((f && f.nom) || 'ce proche');
  if (!f) return `<div class="cadenas"><span class="e">🔒</span><h3 style="justify-content:center">La fiche de ${esc(qui)}</h3>${ligneIdentite(m)}
      <p class="ui muet" style="max-width:52ch;margin:0;font-size:13.5px">Groupe sanguin, allergies, traitements à ne pas oublier… <b>uniquement si vous le souhaitez</b>.
      Le nom, l’âge, la date de naissance et les sports viennent déjà de NaoHome : il ne reste que l’essentiel.</p>
      <button class="btn plein" data-act="modifier-notes" data-id="${id}">Créer la fiche de ${esc(qui)}</button></div>`;
  return `<h3><span class="e">${emMembre(m)}</span> La fiche de ${esc(qui)}
      <span style="margin-left:auto;display:flex;gap:6px">${S.notes.masquer ? `<button class="btn petit fin" data-act="devoiler">${U.devoile ? '🙈 Masquer' : '👁️ Afficher'}</button>` : ''}<button class="btn petit lavande" data-act="modifier-notes" data-id="${id}">✏️ Modifier</button></span></h3>
    ${ligneIdentite(m, f.nom)}
    <div class="fiche${masque ? ' masque' : ''}">${case_('🩸 Groupe sanguin', f.groupe)}${case_('⚠️ Allergies', f.allergies)}${case_('💊 Traitements à ne pas oublier', f.traitements)}${case_('📝 Autres informations', f.infos)}${m ? case_('🏅 Sports (NaoHome)', texteSports(m)) : ''}</div>
    <p class="note-douce">📞 Les contacts d’urgence sont ceux de l’onglet <b>Moi</b>.</p>
    <div class="actions" style="margin-top:10px"><button class="btn petit fin danger" data-act="effacer-fiche" data-id="${id}" style="margin-left:auto">Effacer la fiche de ${esc(qui)}</button></div>`;
}
function vueNotes() {
  const n = S.notes, masque = n.masquer && !U.devoile;
  const case_ = (l, v) => `<div class="c"><div class="l">${l}</div><div class="v${v ? '' : ' vide-v'}">${v ? esc(v) : 'Non renseigné'}</div></div>`;
  /* une fiche par personne : vous, puis chaque proche rattaché (et les fiches gardées de ceux qui ne le sont plus) */
  const proches = prochesFoyer().map(m => [m.id, emMembre(m) + ' ' + (m.prenom || nomMembre(m))]);
  Object.keys(S.fiches).forEach(id => { if (id !== idMoi() && !membreFoyer(id)) proches.push([id, '🗂️ ' + (S.fiches[id].nom || 'Un proche')]); });
  if (U.fiche && (U.fiche === idMoi() || !proches.some(p => p[0] === U.fiche))) U.fiche = '';
  const onglets = proches.length ? `<div class="sous-onglets" role="tablist" aria-label="La fiche de">${[['', '🙋 Moi'], ...proches].map(([id, l]) =>
    `<button type="button" role="tab" aria-selected="${U.fiche === id}" class="${U.fiche === id ? 'actif' : ''}" data-act="fiche-de" data-id="${id}">${esc(l)}</button>`).join('')}</div>` : '';
  const moiF = moiFoyer();
  const prive = U.fiche ? ficheProche(U.fiche, case_, masque) : !n.active
    ? `<div class="cadenas"><span class="e">🔒</span><h3 style="justify-content:center">Mes notes privées</h3>
        ${ligneIdentite(moiF)}<p class="ui muet" style="max-width:52ch;margin:0;font-size:13.5px">Groupe sanguin, allergies, contacts d’urgence, traitements à ne pas oublier… <b>uniquement si vous le souhaitez</b>.
        Ces informations restent dans ce navigateur (et dans votre profil NaoGroup si vous êtes connecté·e). Rien n’est obligatoire.</p>
        <button class="btn plein" data-act="activer-notes">Activer mes notes privées</button></div>`
    : `<h3><span class="e">🔒</span> Mes notes privées
        <span style="margin-left:auto;display:flex;gap:6px">${n.masquer ? `<button class="btn petit fin" data-act="devoiler">${U.devoile ? '🙈 Masquer' : '👁️ Afficher'}</button>` : ''}<button class="btn petit lavande" data-act="modifier-notes">✏️ Modifier</button></span></h3>
      ${ligneIdentite(moiF)}<p class="chapo">${n.masquer ? 'Floutées par défaut, pour les regards par-dessus l’épaule.' : 'Visibles à l’ouverture.'}</p>
      <div class="fiche${masque ? ' masque' : ''}">${case_('🩸 Groupe sanguin', n.groupe)}${case_('⚠️ Allergies', n.allergies)}${case_('💊 Traitements à ne pas oublier', n.traitements)}${case_('📝 Autres informations', n.infos)}${moiF ? case_('🏅 Sports (NaoHome)', texteSports(moiF)) : ''}</div>
      <div class="sous-titre" style="margin-top:16px">📞 Contacts d’urgence</div>
      <div class="${masque ? 'masque' : ''}">${n.urgence.length ? n.urgence.map(c => `<div class="contact"><span class="ini">${esc(initiales(c.nom))}</span><div class="corps" style="flex:1;min-width:0"><div class="v"><b>${esc(c.nom)}</b>${c.lien ? ` · <span class="muet">${esc(c.lien)}</span>` : ''}</div></div>
          ${c.tel ? `<a href="tel:${esc(c.tel.replace(/\s/g, ''))}" class="v">${esc(c.tel)}</a>` : ''}<button class="btn-rond" data-act="retirer-contact" data-id="${c.id}" title="Retirer">✕</button></div>`).join('') : '<div class="vide">Aucun contact d’urgence.</div>'}</div>
      <div class="actions" style="margin-top:10px"><button class="btn petit fin" data-act="ajouter-contact">＋ Un contact d’urgence</button>
        <button class="btn petit fin danger" data-act="desactiver-notes" style="margin-left:auto">Effacer mes notes privées</button></div>`;
  const d = auj();
  return `<div class="vue">${titreVue('Mes <span>notes</span> & mon mémo', 'Des informations à garder sous la main — rien de plus.')}
  <div class="grille g2">
    ${sectionFoyer()}
    <section class="carte prive" id="fichePrivee">${onglets}${prive}</section>
    <section class="carte"><h3><span class="e">💊</span> Mon mémo médicaments & vitamines <button class="btn petit plein" data-act="ajouter-memo" style="margin-left:auto">＋ Ajouter</button></h3>
      <p class="chapo">Une liste pour ne pas oublier, à cocher chaque jour.</p>
      ${S.memo.length ? S.memo.map(m => { const c = catMemo(m.categorie), f = !!m.pris[d]; return `<div class="ligne${f ? ' fait' : ''}">
        <button type="button" class="coche-btn" data-act="memo-pris" data-id="${m.id}" aria-label="Marquer comme pris aujourd’hui">${COCHE}</button><span class="emo">${c[1]}</span>
        <div class="corps"><div class="texte">${esc(m.nom)}</div><div class="meta"><span>${esc(c[2])}</span>${m.moments.map(k => `<span class="etiquette">${(MOMENTS.find(x => x[0] === k) || ['', k])[1]}</span>`).join('')}${m.note ? `<span>· ${esc(m.note)}</span>` : ''}</div></div>
        <div class="outils"><button class="btn-rond" data-act="modifier-memo" data-id="${m.id}" title="Modifier">✏️</button></div></div>`; }).join('')
        : vide('Votre mémo est vide.')}
      <p class="note-douce">⚕️ <b>Ce mémo sert uniquement à ne rien oublier.</b> NaoSanté ne donne aucun conseil sur les médicaments, les doses ou les horaires :
        suivez toujours les indications de votre médecin ou de votre pharmacien.</p></section>
  </div></div>`;
}

/* ============================================================
   RENDU
   ============================================================ */
/* ============================================================
   BIEN-ÊTRE : hydratation, sommeil, humeur & énergie sur une seule page
   ============================================================ */
function vueBienEtre() {
  const ancre = (id, e, l) => `<button type="button" class="btn petit fin" data-act="ancre" data-a="be-${id}">${e} ${l}</button>`;
  return `<div class="vue">${titreVue('Mon <span>bien-être</span>', 'Hydratation, sommeil, humeur et énergie : tout au même endroit.')}
  <div class="actions sommaire-be">${ancre('hydratation', '💧', 'Hydratation')}${ancre('sommeil', '🌙', 'Sommeil')}${ancre('humeur', '😊', 'Humeur & énergie')}</div>
  <div id="be-hydratation" class="be-partie">${vueHydratation()}</div>
  <div id="be-sommeil" class="be-partie">${vueSommeil()}</div>
  <div id="be-humeur" class="be-partie">${vueHumeur()}</div></div>`;
}
const RENDUS = { bienetre: vueBienEtre, aujourdhui: vueAujourdhui, hydratation: vueHydratation, sommeil: vueSommeil, activite: vueActivite, habitudes: vueHabitudes,
  rdv: vueRdv, humeur: vueHumeur, objectifs: vueObjectifs, progression: vueProgression, notes: vueNotes };
function rendre() {
  if (ALIAS_VUES[U.vue]) { U.ancre = 'be-' + U.vue; U.vue = ALIAS_VUES[U.vue]; }
  const onglet = ([k, e, l]) => `<button type="button" class="${U.vue === k ? 'actif' : ''}" data-act="vue" data-vue="${k}"><span class="e">${e}</span>${l}</button>`;
  const sante = VUES.filter(v => v[3] === 'sante');
  $('#onglets').innerHTML = `<span class="onglets-groupe">🌿 Bien-être</span>${VUES.filter(v => v[3] !== 'sante').map(onglet).join('')}`
    + (sante.length ? `<span class="onglets-groupe">🩺 Santé du foyer</span>${sante.map(onglet).join('')}` : '');
  $('#contenu').innerHTML = (RENDUS[U.vue] || vueAujourdhui)();
  if (U.ancre) { const a = U.ancre; U.ancre = ''; setTimeout(() => { const el = document.getElementById(a); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); }
}
/* redessiner sans rejouer les animations d'entrée ni perdre le défilement */
function maj() {
  sauver();
  const y = scrollY;
  rendre();
  $$('#contenu .vue, #contenu .carte').forEach(x => x.style.animation = 'none');
  scrollTo(0, y);
}
