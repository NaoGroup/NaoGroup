/* ============================================================
   NaoSanté — la santé du foyer : pilulier, fiches médicales,
   poids & IMC, répertoire des soignants, vaccination.
   Les personnes viennent du foyer de NaoHome (membres rattachés
   à NaoSanté) : prénom, nom, date de naissance, sexe, place.
   Rappel de la maison : NaoSanté organise et range. Il ne pose
   aucun diagnostic et ne remplace jamais un professionnel de santé.
   ============================================================ */

/* ---------- le foyer, repris de NaoHome (lireFoyer, membresFoyer, estMoi… sont dans ns-core.js) ----------
   « Moi » a l'identifiant vide '' (ou celui choisi avec « 🙋 C'est moi ») : sa fiche est S.notes.
   Chaque proche rattaché dans NaoHome a sa fiche dans S.fiches[id] — les mêmes que dans Notes & mémo. */
const ficheDe = id => estMoi(id) ? S.notes : (S.fiches[id] || (S.fiches[id] = { maladies: [] }));
const ficheLue = id => (estMoi(id) ? S.notes : S.fiches[id]) || { maladies: [] };
const idDonnees = id => estMoi(id) ? '' : id;   /* les traitements, mesures et vaccins de « Moi » sont rangés sous '' */
/* Quand NaoHome (ou « C'est moi ») désigne un membre comme vous, sa fiche de proche rejoint la vôtre :
   ce qui est vide chez vous est complété, rien de ce que vous aviez n'est écrasé. Les traitements,
   mesures et vaccins notés sous son identifiant sont déjà reconnus comme les vôtres (idDonnees). */
function fusionnerMoi() {
  const id = idMoi(), f = id && S.fiches[id];
  if (!f) return;
  const { nom, ...reste } = f;
  Object.keys(reste).forEach(k => { const v = S.notes[k]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) S.notes[k] = reste[k]; });
  S.notes.active = true; delete S.fiches[id]; sauver();
}
/* Le n° de sécurité sociale noté dans NaoHome est mis à jour dans la fiche médicale.
   secuNaoHome garde le dernier numéro reçu : un numéro changé dans NaoHome remplace celui
   de la fiche, mais tant que NaoHome ne change rien, une correction faite ici est gardée. */
function reprendreSecu() {
  let change = false;
  membresFoyer().forEach(m => {
    const n = (m.secu || '').trim();
    if (!n) return;
    const fi = ficheDe(m.id);
    if (fi.secuNaoHome === n) return;
    fi.secu = n; fi.secuNaoHome = n; change = true;
  });
  if (change) sauver();
}
function personnes() {
  fusionnerMoi();
  reprendreSecu();
  const moi = moiFoyer();
  const liste = [{ id: '', prenom: moi ? moi.prenom : (R().prenom || 'Moi'), nom: moi ? moi.nom || '' : '', naissance: moi ? moi.naissance || '' : '', sexe: moi ? moi.sexe || '' : '',
    genre: moi ? moi.genre || 'adulte' : 'adulte', lien: moi ? moi.lien || '' : '', naohome: !!moi, moi: true }];
  prochesFoyer().forEach(m => liste.push({ id: m.id, prenom: m.prenom || '', nom: m.nom || '', naissance: m.naissance || '', sexe: m.sexe || '', genre: m.genre || 'adulte', lien: m.lien || '', naohome: true }));
  /* une personne détachée dans NaoHome mais qui a des données ici reste visible */
  const ids = [...Object.keys(S.fiches), ...S.traitements.map(t => t.personne), ...S.mesures.map(m => m.personne), ...S.vaccins.map(v => v.personne)];
  ids.forEach(id => { if (!estMoi(id) && !liste.some(p => p.id === id)) { const fi = S.fiches[id] || {}; liste.push({ id, prenom: fi.nom || 'Personne retirée du foyer', nom: '', naissance: '', sexe: '', genre: fi.genre || 'adulte', lien: '', naohome: false, ancienne: true }); } });
  liste.forEach(p => { const fi = ficheLue(p.id); p.naissanceLocale = !p.naissance; p.sexeLocal = !p.sexe; if (!p.naissance) p.naissance = fi.naissance || ''; if (!p.sexe) p.sexe = fi.sexe || ''; });
  return liste;
}
const personne = id => personnes().find(p => p.id === idDonnees(id)) || personnes()[0];
const nomP = p => p ? [p.prenom, p.nom].filter(Boolean).join(' ') || '—' : '—';
const prenomP = id => { const p = personne(id); return p.moi ? (p.naohome ? p.prenom : 'Moi') : p.prenom || nomP(p); };
const deP = p => p.moi && !p.naohome ? 'vous concernant' : 'de ' + esc(p.prenom || 'cette personne');
const pourQui = (l, id) => l.filter(x => idDonnees(x.personne) === idDonnees(id));
function emojiP(p) {
  if (!p) return '👤';
  const enfant = p.genre === 'enfant' || (ageAnsDe(p.naissance) != null && ageAnsDe(p.naissance) < 15);
  if (p.sexe === 'femme') return enfant ? '👧' : '👩';
  if (p.sexe === 'homme') return enfant ? '👦' : '👨';
  return enfant ? '🧒' : '👤';
}

/* ---------- âges ---------- */
function ageMoisDe(naissance, d = auj()) {
  if (!naissance) return null;
  const n = parseJour(naissance), x = parseJour(d);
  let m = (x.getFullYear() - n.getFullYear()) * 12 + x.getMonth() - n.getMonth();
  if (x.getDate() < n.getDate()) m--;
  return m < 0 ? null : m;
}
const ageAnsDe = (n, d) => { const m = ageMoisDe(n, d); return m == null ? null : Math.floor(m / 12); };
const ageExact = (n, d = auj()) => n ? Math.max(0, joursEntre(n, d) / 365.25) : null;
function ageTexte(n, d) {
  const m = ageMoisDe(n, d); if (m == null) return '';
  if (m < 1) return pluriel(Math.max(0, joursEntre(n, d || auj())), 'jour');
  return m < 24 ? m + ' mois' : Math.floor(m / 12) + ' ans';
}
function ajouteMois(s, n) {
  const d = parseJour(s), j = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(j, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return isoJour(d);
}
const sexeTexte = s => s === 'femme' ? '♀ Femme' : s === 'homme' ? '♂ Homme' : '';

/* ---------- le choix de la personne, en haut de chaque page ---------- */
function quiCourant(avecTous) {
  const ps = personnes();
  if (U.qui === 'tous' && avecTous && ps.length > 1) return 'tous';
  if (ps.some(p => p.id === U.qui)) return U.qui;
  return avecTous && ps.length > 1 ? 'tous' : ps[0].id;
}
function choixQui(avecTous) {
  const ps = personnes(), q = quiCourant(avecTous);
  const b = (id, e, l, sous) => `<button type="button" class="${q === id ? 'actif' : ''}" data-act="qui" data-id="${esc(id)}"><span class="e">${e}</span>${esc(l)}${sous ? `<small>${esc(sous)}</small>` : ''}</button>`;
  const lienNaoHome = '<a class="lien" href="../NaoHome/NaoHome.html#famille">🏡 Ouvrir NaoHome</a>';
  const aucun = !membresFoyer().length;
  return `<div class="qui-choix">${avecTous && ps.length > 1 ? b('tous', '👪', 'Tout le foyer') : ''}${ps.map(p => b(p.id, p.moi ? '🙋' : emojiP(p), p.moi ? (p.naohome ? p.prenom + ' (moi)' : 'Moi') : p.prenom || 'Sans prénom', ageTexte(p.naissance))).join('')}</div>
    ${aucun ? `<p class="note-douce foyer-info">🏡 <span>Les personnes viennent du <b>foyer de NaoHome</b> : dans la fiche de chaque personne, cochez <b>🩺 Rattacher à NaoSanté</b>
      (prénom, date de naissance et sexe sont alors repris ici). En attendant, seule votre fiche « Moi » est disponible.</span> ${lienNaoHome}</p>` : ''}`;
}
const optionsPersonnes = () => personnes().map(p => [p.id, p.moi ? '🙋 Moi' + (p.naohome ? ' (' + nomP(p) + ')' : '') : emojiP(p) + ' ' + nomP(p)]);

/* ============================================================
   💊 LE PILULIER
   ============================================================ */
const MOMENTS_PIL = [['matin', '🌅', 'Matin'], ['midi', '☀️', 'Midi'], ['soir', '🌆', 'Soir'], ['nuit', '🌙', 'Nuit']];
const UNITES_DUREE = [['jours', 'jour(s)'], ['semaines', 'semaine(s)'], ['mois', 'mois'], ['continu', 'Au long cours (sans date de fin)']];
function finPrevue(t) {
  if (t.unite === 'continu' || !t.debut) return '';
  const n = Math.max(1, Math.round(nombre(t.duree)) || 1);
  if (t.unite === 'semaines') return ajouteJours(t.debut, n * 7 - 1);
  if (t.unite === 'mois') return ajouteJours(ajouteMois(t.debut, n), -1);
  return ajouteJours(t.debut, n - 1);
}
const finTraitement = t => { const f = finPrevue(t); return t.arret && (!f || t.arret < f) ? t.arret : f; };
function etatTraitement(t, d = auj()) {
  if (t.debut && d < t.debut) return 'avenir';
  const f = finTraitement(t);
  return f && d > f ? 'fini' : 'encours';
}
const actifLe = (t, d) => etatTraitement(t, d) === 'encours' && t.moments.length > 0;
const prisLe = (t, d, m) => (t.prises[d] || []).includes(m);
function texteDuree(t) {
  if (t.unite === 'continu') return t.debut ? `depuis le ${fmtJour(t.debut)} · au long cours` : 'au long cours';
  const f = finTraitement(t), n = Math.round(nombre(t.duree)) || 1;
  const u = t.unite === 'semaines' ? pluriel(n, 'semaine') : t.unite === 'mois' ? n + ' mois' : pluriel(n, 'jour');
  return `${u} · du ${fmtJour(t.debut)} au ${fmtJour(f)}${t.arret && t.arret < finPrevue(t) ? ' (arrêté)' : ''}`;
}
const traitementsDe = id => S.traitements.filter(t => id === 'tous' || idDonnees(t.personne) === idDonnees(id));

function tablePilulier(p, d) {
  const ts = S.traitements.filter(t => idDonnees(t.personne) === idDonnees(p.id) && actifLe(t, d));
  if (!ts.length) return '';
  const attendues = somme(ts, t => t.moments.length), faites = somme(ts, t => t.moments.filter(m => prisLe(t, d, m)).length);
  return `<div class="pil-bloc"><div class="pil-tete"><span class="e">${emojiP(p)}</span><b>${esc(p.prenom || nomP(p))}</b>
      <span class="etiquette${faites === attendues ? ' ok' : ''}">${faites} / ${attendues} prise${attendues > 1 ? 's' : ''}</span></div>
    <div class="pil-defile"><table class="pil"><thead><tr><th></th>${MOMENTS_PIL.map(([k, e, l]) => `<th><span class="e">${e}</span>${l}</th>`).join('')}</tr></thead><tbody>
    ${ts.map(t => `<tr><th><b>${esc(t.nom)}</b>${t.dosage ? `<small>${esc(t.dosage)}</small>` : ''}</th>${MOMENTS_PIL.map(([k, e, l]) => t.moments.includes(k)
      ? `<td><button type="button" class="pil-case${prisLe(t, d, k) ? ' pris' : ''}" data-act="prise" data-id="${t.id}" data-m="${k}" data-d="${d}" title="${esc(t.nom)} — ${l.toLowerCase()}${prisLe(t, d, k) ? ' : pris' : ''}" aria-pressed="${prisLe(t, d, k)}">${COCHE}</button></td>`
      : '<td><span class="pil-rien">·</span></td>').join('')}</tr>`).join('')}
    </tbody></table></div></div>`;
}
function carteTraitement(t) {
  const e = etatTraitement(t), f = finTraitement(t), p = personne(t.personne);
  let suivi = '';
  if (e === 'encours' && f) {
    const total = joursEntre(t.debut, f) + 1, fait = joursEntre(t.debut, auj()) + 1, reste = joursEntre(auj(), f);
    suivi = barreProgres(fait / total, `Jour ${fait} sur ${total} · ${reste === 0 ? 'dernier jour aujourd’hui' : reste === 1 ? 'encore 1 jour après aujourd’hui' : `encore ${reste} jours après aujourd’hui`}`);
  } else if (e === 'avenir') suivi = `<div class="ui muet" style="font-size:12px">Commence ${quand(t.debut)}.</div>`;
  const semaine = derniersJours(7).map(d => {
    const n = actifLe(t, d) ? t.moments.length : 0, k = n ? t.moments.filter(m => prisLe(t, d, m)).length : 0;
    return `<span class="pil-point${!n ? ' hors' : k === n ? ' plein' : k ? ' moitie' : ''}" title="${fmtJour(d)} : ${n ? k + ' / ' + n : 'pas de prise'}">${lab7(d)}</span>`;
  }).join('');
  return `<div class="traitement ${e}">
    <div class="tr-tete"><span class="emo">💊</span><div class="corps"><div class="texte"><b>${esc(t.nom)}</b>${t.dosage ? ` · <span class="muet">${esc(t.dosage)}</span>` : ''}</div>
      <div class="meta"><span>${emojiP(p)} ${esc(prenomP(t.personne))}</span><span>· ${texteDuree(t)}</span></div></div>
      <div class="outils"><button class="btn-rond" data-act="modifier-traitement" data-id="${t.id}" title="Modifier">✏️</button></div></div>
    <div class="meta-l">${t.moments.map(k => { const m = MOMENTS_PIL.find(x => x[0] === k); return `<span class="etiquette">${m[1]} ${m[2]}</span>`; }).join('')}
      ${t.prescripteur ? `<span class="ui muet">· prescrit par ${esc(t.prescripteur)}</span>` : ''}</div>
    ${t.note ? `<p class="ui muet" style="font-size:12.5px;margin:6px 0 0">📝 ${esc(t.note)}</p>` : ''}
    ${suivi ? `<div style="margin-top:8px">${suivi}</div>` : ''}
    ${e === 'encours' ? `<div class="pil-semaine">${semaine}</div>` : ''}
  </div>`;
}
function vuePilulier() {
  const q = quiCourant(true), d = U.jourPil || auj();
  const ps = q === 'tous' ? personnes() : [personne(q)];
  const liste = traitementsDe(q);
  const encours = liste.filter(t => etatTraitement(t) === 'encours'), avenir = liste.filter(t => etatTraitement(t) === 'avenir'),
    finis = liste.filter(t => etatTraitement(t) === 'fini').sort((a, b) => (finTraitement(b) || '').localeCompare(finTraitement(a) || ''));
  const tables = ps.map(p => tablePilulier(p, d)).join('');
  return `<div class="vue">${titreVue('Mon <span>pilulier</span>', 'Les traitements de chacun, à cocher matin, midi, soir et nuit.',
    `<button class="btn plein" data-act="ajouter-traitement">💊 Ajouter un traitement</button>`)}
  ${choixQui(true)}
  <div class="grille g2">
    <section class="carte large-2"><h3><span class="e">🗓️</span> ${d === auj() ? 'Aujourd’hui' : esc(fmtJour(d, true).replace(/^./, c => c.toUpperCase()))}
      <span class="nav-jour"><button class="btn-rond" data-act="jour-pil" data-n="-1" title="Jour précédent">‹</button>
      ${d !== auj() ? '<button class="lien" data-act="jour-pil" data-n="0">Aujourd’hui</button>' : ''}
      <button class="btn-rond" data-act="jour-pil" data-n="1" title="Jour suivant"${d >= auj() ? ' disabled style="opacity:.4"' : ''}>›</button></span></h3>
      <p class="chapo">Touchez une case quand la prise est faite. Une case peut se décocher.</p>
      ${tables || vide(liste.length ? 'Aucune prise prévue ce jour-là.' : 'Le pilulier est vide.', liste.length ? '' : '<button class="btn plein petit" data-act="ajouter-traitement">💊 Ajouter un traitement</button>')}
    </section>
    <section class="carte large-2"><h3><span class="e">💊</span> En cours <span class="ui muet" style="font-size:13px;font-weight:600">${encours.length || ''}</span></h3>
      ${encours.length ? `<div class="traitements">${encours.map(carteTraitement).join('')}</div>` : vide('Aucun traitement en cours.')}
      ${avenir.length ? `<div class="sous-titre" style="margin-top:16px">À venir</div><div class="traitements">${avenir.map(carteTraitement).join('')}</div>` : ''}
      ${finis.length ? `<details class="replie" style="margin-top:16px"><summary class="sous-titre">Terminés (${finis.length})</summary><div class="traitements">${finis.map(carteTraitement).join('')}</div></details>` : ''}
    </section>
  </div>
  <p class="note-douce" style="margin-top:16px">⚕️ <b>Le pilulier sert à ne rien oublier.</b> Recopiez l’ordonnance telle quelle : NaoSanté ne donne aucun conseil sur les médicaments, les doses ou les horaires.
    En cas de doute, demandez à votre médecin ou à votre pharmacien.</p></div>`;
}
/* la carte du jour sur l'accueil, seulement s'il y a des prises prévues */
function cartePilulierJour() {
  const d = auj(), ps = personnes().filter(p => S.traitements.some(t => idDonnees(t.personne) === idDonnees(p.id) && actifLe(t, d)));
  if (!ps.length) return '';
  return `<section class="carte large-2"><h3><span class="e">💊</span> Le pilulier du jour <button class="lien" data-act="vue" data-vue="pilulier">Tout →</button></h3>
    ${ps.map(p => tablePilulier(p, d)).join('')}</section>`;
}
function fenTraitement(t) {
  const nouveau = !t, q = quiCourant(false);
  formulaire({
    titre: nouveau ? '💊 Un traitement dans le pilulier' : '✏️ Modifier le traitement',
    sous: 'Recopiez l’ordonnance ou la notice telle quelle. NaoSanté ne donne aucun conseil sur les doses ni les horaires.',
    large: true,
    valeurs: t || { personne: U.qui === 'tous' ? personnes()[0].id : q, debut: auj(), duree: 7, unite: 'jours', moments: [] },
    champs: [
      { k: 'personne', l: 'Pour qui ?', t: 'select', o: optionsPersonnes() },
      { k: 'nom', l: 'Médicament / traitement', ph: 'Tel qu’écrit sur la boîte ou l’ordonnance' },
      { k: 'dosage', l: 'Dose par prise', ph: 'Ex. : 1 comprimé, 5 ml, 2 gouttes…' },
      { k: 'prescripteur', l: 'Prescrit par', ph: 'Ex. : Dr Martin' },
      { k: 'debut', l: 'Début du traitement', t: 'date' },
      { k: 'duree', l: 'Durée', t: 'number', pas: 1 },
      { k: 'unite', l: 'Unité de durée', t: 'select', o: UNITES_DUREE },
      { k: 'moments', l: 'Quand ? (cochez)', t: 'html', html: `<div class="cases-moments">${MOMENTS_PIL.map(([k, e, l]) => `<label class="etiquette"><input type="checkbox" name="moments" value="${k}"${t && t.moments.includes(k) ? ' checked' : ''}> ${e} ${l}</label>`).join('')}</div>` },
      { k: 'note', l: 'Note', t: 'textarea', ph: 'Ex. : pendant le repas, à espacer de 8 h, selon l’ordonnance du…' }
    ].concat(nouveau ? [] : [{ k: 'arret', l: 'Arrêté le (facultatif)', t: 'date', aide: 'Si le traitement a été arrêté avant la date prévue.' }]),
    supprimer: nouveau ? null : () => { instantane(); retirer(S.traitements, t.id); maj(); toast('Traitement retiré du pilulier.', { annuler: true }); },
    apres: fen => {
      const u = fen.querySelector('[name=unite]'), du = fen.querySelector('[name=duree]');
      const suivre = () => { du.disabled = u.value === 'continu'; du.closest('.champ').style.opacity = u.value === 'continu' ? .45 : 1; };
      u.addEventListener('change', suivre); suivre();
    },
    enregistrer: (v, f) => {
      if (!v.nom) { toast('Indiquez le nom du traitement.', { alerte: true }); return false; }
      v.moments = $$('[name=moments]:checked', f).map(x => x.value);
      if (!v.moments.length) { toast('Cochez au moins un moment : matin, midi, soir ou nuit.', { alerte: true }); return false; }
      if (!v.debut) v.debut = auj();
      if (v.unite !== 'continu' && !(v.duree >= 1)) v.duree = 1;
      if (nouveau) { S.traitements.push(Object.assign({ id: uid(), prises: {} }, v)); U.qui = U.qui === 'tous' ? 'tous' : v.personne; }
      else Object.assign(t, v);
      maj(); toast(nouveau ? `💊 ${v.nom} ajouté au pilulier de ${prenomP(v.personne)}.` : 'Traitement enregistré.');
    }
  });
}

/* ============================================================
   🩺 LES FICHES MÉDICALES
   ============================================================ */
const GROUPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
const MALADIES_INFANTILES = ['Varicelle', 'Rougeole', 'Oreillons', 'Rubéole', 'Scarlatine', 'Coqueluche', 'Roséole', 'Cinquième maladie', 'Pied-main-bouche',
  'Bronchiolite', 'Otites à répétition', 'Angines à répétition', 'Asthme de l’enfant', 'Eczéma'];
const TABAC = [['', '— Non renseigné —'], ['non', '🚭 Non-fumeur'], ['oui', '🚬 Fumeur'], ['ancien', '🌱 Ancien fumeur']];
const mesuresDe = id => S.mesures.filter(m => idDonnees(m.personne) === idDonnees(id)).sort((a, b) => a.date.localeCompare(b.date));
const dernier = (id, k) => { const l = mesuresDe(id).filter(m => nombre(m[k]) > 0); return l.length ? l[l.length - 1] : null; };
const soignantNom = s => s ? [s.nom, s.specialite === 'autre' && s.specialiteLibre ? s.specialiteLibre : ''].filter(Boolean).join(' — ') : '';

function vueFiches() {
  const q = quiCourant(false), p = personne(q), fi = ficheLue(q), masque = !U.devoileFiche;
  const taille = dernier(q, 'taille'), poids = dernier(q, 'poids');
  const imc = taille && poids ? nombre(poids.poids) / Math.pow(nombre(taille.taille) / 100, 2) : 0;
  const cl = imc ? classeImc(imc, p, poids.date) : null;
  const tr = S.traitements.filter(t => idDonnees(t.personne) === idDonnees(q) && etatTraitement(t) === 'encours');
  const vac = S.vaccins.filter(v => idDonnees(v.personne) === idDonnees(q)).sort((a, b) => b.date.localeCompare(a.date));
  const traitant = trouver(S.soignants, fi.traitant);
  const c = (l, v, cls = '') => `<div class="c ${cls}"><div class="l">${l}</div><div class="v${v ? '' : ' vide-v'}">${v || 'Non renseigné'}</div></div>`;
  const tabac = fi.fumeur === 'oui' ? `🚬 Fumeur${nombre(fi.cigarettes) ? ` — ${joli(nombre(fi.cigarettes))} cigarette${nombre(fi.cigarettes) > 1 ? 's' : ''} par jour (≈ ${joli(nombre(fi.cigarettes) / 20)} paquet / jour)` : ''}${fi.fumeurDepuis ? ` · depuis ${esc(fi.fumeurDepuis)}` : ''}`
    : fi.fumeur === 'ancien' ? `🌱 Ancien fumeur${fi.fumeurDepuis ? ` · arrêt : ${esc(fi.fumeurDepuis)}` : ''}` : fi.fumeur === 'non' ? '🚭 Non-fumeur' : '';
  return `<div class="vue">${titreVue('Les <span>fiches médicales</span>', 'Une fiche par personne du foyer : tout ce qu’on vous demande chez le médecin, au même endroit.',
    `<button class="btn fin" data-act="devoiler-fiche">${masque ? '👁️ Afficher le n° de sécu' : '🙈 Masquer le n° de sécu'}</button><button class="btn plein" data-act="modifier-fiche" data-id="${esc(q)}">✏️ Remplir la fiche</button>`)}
  ${choixQui(false)}
  <section class="carte fiche-tete"><span class="avatar">${emojiP(p)}</span>
    <div style="flex:1;min-width:0"><h3 style="margin:0">${esc(nomP(p))}</h3>
      <div class="meta-l">${p.naissance ? `<span class="etiquette">🎂 ${esc(fmtJour(p.naissance, true).replace(/^\S+ /, ''))} · ${ageTexte(p.naissance)}</span>` : '<span class="etiquette alerte-e">Date de naissance à renseigner</span>'}
        ${p.sexe ? `<span class="etiquette">${sexeTexte(p.sexe)}</span>` : '<span class="etiquette alerte-e">Sexe à renseigner</span>'}
        ${p.lien ? `<span class="etiquette">${esc(p.lien)}</span>` : ''}${p.naohome ? '<span class="etiquette ok">🏡 depuis NaoHome</span>' : ''}${fi.groupe ? `<span class="etiquette sang">🩸 ${esc(fi.groupe)}</span>` : ''}</div></div>
    <div class="fiche-maj ui muet">${fi.maj ? 'Mise à jour ' + quand(fi.maj) : 'Fiche vierge'}</div></section>
  <div class="grille g2">
    <section class="carte"><h3><span class="e">🪪</span> Identité & couverture</h3>
      <div class="fiche">${c('N° de sécurité sociale', fi.secu ? `<span class="${masque ? 'flou' : ''}">${esc(fi.secu)}</span>${fi.secu === fi.secuNaoHome ? ' <small class="muet">🏡 depuis NaoHome</small>' : ''}` : '')}${c('Caisse (CPAM)', esc(fi.cpam))}
        ${c('Mutuelle', fi.mutuelle ? esc(fi.mutuelle) + (fi.mutuelleNum ? `<br><small class="muet">n° adhérent : <span class="${masque ? 'flou' : ''}">${esc(fi.mutuelleNum)}</span></small>` : '') : '')}
        ${c('Médecin traitant', traitant ? `<b>${esc(soignantNom(traitant))}</b>${traitant.tel ? `<br><a href="tel:${esc(traitant.tel.replace(/\s/g, ''))}">${esc(traitant.tel)}</a>` : ''}` : esc(fi.traitantLibre))}</div></section>
    <section class="carte"><h3><span class="e">📏</span> Mensurations <button class="lien" data-act="vue" data-vue="poids">Suivi poids & IMC →</button></h3>
      <div class="fiche">${c('Taille', taille ? joli(nombre(taille.taille)) + ' cm' : '')}${c('Poids', poids ? joli(nombre(poids.poids)) + ' kg' + `<br><small class="muet">${fmtJour(poids.date)}</small>` : '')}
        ${c('IMC', imc ? `<b>${joli(imc)}</b> ${cl ? `<span class="pastille-niv ${cl.c}">${cl.lab}</span>` : ''}` : '')}${c('Groupe sanguin', esc(fi.groupe))}</div></section>
    <section class="carte alerte-carte"><h3><span class="e">⚠️</span> Allergies & intolérances</h3>
      <div class="fiche">${c('Allergies', esc(fi.allergies), fi.allergies ? 'fort' : '')}${c('Intolérances médicamenteuses', esc(fi.intolerances), fi.intolerances ? 'fort' : '')}</div></section>
    <section class="carte"><h3><span class="e">🚬</span> Tabac</h3><div class="fiche">${c('Consommation', tabac)}</div></section>
    <section class="carte large-2"><h3><span class="e">🧬</span> Antécédents</h3>
      <div class="fiche">${c('Antécédents familiaux', esc(fi.atcdFamiliaux))}${c('Antécédents médicaux', esc(fi.atcdMedicaux))}${c('Antécédents chirurgicaux', esc(fi.atcdChirurgicaux))}</div></section>
    <section class="carte"><h3><span class="e">🧸</span> Maladies infantiles contractées</h3>
      ${(fi.maladies || []).length || fi.maladiesAutres ? `<div class="meta-l">${(fi.maladies || []).map(m => `<span class="etiquette">${esc(m)}</span>`).join('')}</div>${fi.maladiesAutres ? `<p class="ui" style="font-size:13px;margin:8px 0 0">${esc(fi.maladiesAutres)}</p>` : ''}` : vide('Rien de noté.')}</section>
    <section class="carte"><h3><span class="e">💊</span> Traitements réguliers <button class="lien" data-act="vue" data-vue="pilulier">Pilulier →</button></h3>
      ${fi.traitements ? `<p class="ui" style="font-size:13.5px;margin:0 0 8px;white-space:pre-wrap">${esc(fi.traitements)}</p>` : ''}
      ${tr.length ? `<div class="sous-titre">Dans le pilulier en ce moment</div>${tr.map(t => `<div class="ui" style="font-size:13px;margin:4px 0">💊 <b>${esc(t.nom)}</b>${t.dosage ? ' · ' + esc(t.dosage) : ''} <span class="muet">· ${t.moments.map(k => MOMENTS_PIL.find(x => x[0] === k)[2].toLowerCase()).join(', ')}</span></div>`).join('')}` : ''}
      ${!fi.traitements && !tr.length ? vide('Aucun traitement régulier noté.') : ''}</section>
    <section class="carte large-2"><h3><span class="e">💉</span> Vaccins <button class="lien" data-act="vue" data-vue="vaccins">Calendrier et carnet →</button></h3>
      ${vac.length ? `<div class="vac-liste">${vac.slice(0, 12).map(v => `<span class="etiquette">💉 ${esc(nomVaccin(v))} · ${fmtJour(v.date)} ${parseJour(v.date).getFullYear()}</span>`).join('')}${vac.length > 12 ? `<span class="ui muet">+ ${vac.length - 12} autres</span>` : ''}</div>` : vide('Aucun vaccin noté dans le carnet.')}
      ${fi.vaccinsNotes ? `<p class="ui" style="font-size:13px;margin:8px 0 0">📝 ${esc(fi.vaccinsNotes)}</p>` : ''}</section>
    ${fi.infos ? `<section class="carte large-2"><h3><span class="e">📝</span> Autres informations</h3><p class="ui" style="font-size:13.5px;margin:0;white-space:pre-wrap">${esc(fi.infos)}</p></section>` : ''}
  </div>
  <p class="note-douce" style="margin-top:16px">🔒 Ces informations restent dans ce navigateur (et dans votre profil NaoGroup si vous êtes connecté·e). Pensez à 💾 sauvegarder régulièrement.</p></div>`;
}
function fenFiche(id) {
  const p = personne(id), fi = ficheDe(id), taille = dernier(id, 'taille'), poids = dernier(id, 'poids');
  const soignants = S.soignants.slice().sort((a, b) => ordreSpe(a.specialite) - ordreSpe(b.specialite));
  const v = Object.assign({}, fi, { taille: taille ? taille.taille : '', poids: poids ? poids.poids : '' });
  const champs = [];
  if (p.naissanceLocale) champs.push({ k: 'naissance', l: '🎂 Date de naissance', t: 'date', aide: p.naohome ? 'Pas encore notée dans NaoHome.' : 'Idéalement, notez-la dans NaoHome.' });
  if (p.sexeLocal) champs.push({ k: 'sexe', l: 'Sexe', t: 'select', o: [['', '—'], ['femme', '♀ Femme'], ['homme', '♂ Homme']], aide: 'Sert à l’IMC des enfants, à la masse grasse et au calendrier des vaccins.' });
  champs.push(
    { k: 's1', l: '🪪 Identité & couverture', t: 'html', html: '' },
    { k: 'secu', l: 'N° de sécurité sociale', ph: '1 23 45 67 890 123 45', aide: fi.secuNaoHome ? 'Repris de NaoHome : changez-le de préférence dans le carnet de famille, il sera mis à jour ici.' : '' },
    { k: 'cpam', l: 'Caisse (CPAM)', ph: 'Ex. : CPAM de la Gironde' },
    { k: 'mutuelle', l: 'Mutuelle', ph: 'Nom de la mutuelle' },
    { k: 'mutuelleNum', l: 'N° d’adhérent', ph: 'Sur la carte de mutuelle' },
    { k: 'traitant', l: 'Médecin traitant (répertoire)', t: 'select', o: [['', soignants.length ? '— Choisir dans le répertoire —' : '— Répertoire vide —'], ...soignants.map(s => [s.id, speciale(s.specialite)[1] + ' ' + soignantNom(s)])] },
    { k: 'traitantLibre', l: 'ou son nom', ph: 'Si le médecin n’est pas dans le répertoire' },
    { k: 's2', l: '📏 Mensurations', t: 'html', html: '' },
    { k: 'taille', l: 'Taille (cm)', t: 'number', aide: 'Une nouvelle valeur s’ajoute au suivi du poids.' },
    { k: 'poids', l: 'Poids (kg)', t: 'number' },
    { k: 'groupe', l: '🩸 Groupe sanguin', t: 'select', o: [['', '— Non renseigné —'], ...GROUPES.map(x => [x, x])] },
    { k: 'fumeur', l: '🚬 Tabac', t: 'select', o: TABAC },
    { k: 'cigarettes', l: 'Cigarettes par jour', t: 'number', pas: 1 },
    { k: 'fumeurDepuis', l: 'Depuis / arrêt en', ph: 'Ex. : 2012' },
    { k: 's3', l: '⚠️ Allergies & intolérances', t: 'html', html: '' },
    { k: 'allergies', l: 'Allergies', t: 'textarea', ph: 'Ex. : pollens, arachides, piqûres de guêpe…' },
    { k: 'intolerances', l: 'Intolérances médicamenteuses', t: 'textarea', ph: 'Ex. : pénicilline, aspirine, codéine…' },
    { k: 's4', l: '🧬 Antécédents', t: 'html', html: '' },
    { k: 'atcdFamiliaux', l: 'Antécédents familiaux', t: 'textarea', ph: 'Ex. : diabète (père), cancer du sein (grand-mère maternelle)…' },
    { k: 'atcdMedicaux', l: 'Antécédents médicaux', t: 'textarea', ph: 'Maladies, hospitalisations, avec l’année si possible' },
    { k: 'atcdChirurgicaux', l: 'Antécédents chirurgicaux', t: 'textarea', ph: 'Ex. : appendicite (2015), amygdales (2001)…' },
    { k: 'maladies', l: '🧸 Maladies infantiles contractées', t: 'html', html: `<div class="cases-moments">${MALADIES_INFANTILES.map(m => `<label class="etiquette"><input type="checkbox" name="maladies" value="${esc(m)}"${(fi.maladies || []).includes(m) ? ' checked' : ''}> ${esc(m)}</label>`).join('')}</div>` },
    { k: 'maladiesAutres', l: 'Autres maladies de l’enfance', ph: 'Ex. : méningite virale à 4 ans', large: true },
    { k: 'traitements', l: '💊 Traitements réguliers', t: 'textarea', ph: 'Ceux pris au long cours (les traitements du pilulier s’affichent aussi sur la fiche)' },
    { k: 'vaccinsNotes', l: '💉 Vaccins — remarques', t: 'textarea', ph: 'Le détail se note dans l’onglet Vaccins. Ici : réactions, rappels à prévoir…' },
    { k: 'infos', l: '📝 Autres informations', t: 'textarea', ph: 'Lunettes, appareil dentaire, contre-indications au sport…' }
  );
  champs.forEach(c => { if (c.t === 'html' && !c.html) { c.html = `<div class="sep-fen">${c.l}</div>`; c.l = ''; } });
  formulaire({
    titre: `🩺 La fiche médicale de ${esc(p.prenom || nomP(p))}`,
    sous: 'Remplissez seulement ce que vous voulez : tout est facultatif et peut se compléter plus tard.',
    large: true, valeurs: v, champs,
    apres: fen => {
      const f = fen.querySelector('[name=fumeur]'), cg = fen.querySelector('[name=cigarettes]').closest('.champ'), dp = fen.querySelector('[name=fumeurDepuis]').closest('.champ');
      const suivre = () => { cg.style.display = f.value === 'oui' ? '' : 'none'; dp.style.display = f.value === 'oui' || f.value === 'ancien' ? '' : 'none'; };
      f.addEventListener('change', suivre); suivre();
    },
    enregistrer: (val, f) => {
      val.maladies = $$('[name=maladies]:checked', f).map(x => x.value);
      const t = val.taille, po = val.poids; delete val.taille; delete val.poids;
      const avantT = taille ? nombre(taille.taille) : 0, avantP = poids ? nombre(poids.poids) : 0;
      if ((t > 0 && t !== avantT) || (po > 0 && po !== avantP)) {
        let m = S.mesures.find(x => idDonnees(x.personne) === idDonnees(id) && x.date === auj());
        if (!m) { m = { id: uid(), personne: id, date: auj() }; S.mesures.push(m); }
        if (t > 0) m.taille = t; else if (avantT && !m.taille) m.taille = avantT;
        if (po > 0) m.poids = po;
      }
      Object.assign(fi, val, p.moi ? { active: true, maj: auj() } : { nom: nomP(p), genre: p.genre, maj: auj() });
      maj(); toast(`🩺 Fiche de ${p.prenom || nomP(p)} enregistrée.`);
    }
  });
}

/* ============================================================
   ⚖️ POIDS, TAILLE, IMC & MASSE GRASSE
   ============================================================ */
/* Repères de l'IMC adulte (OMS) */
const IMC_ADULTE = [[12, 18.5, 'Maigreur', 'n-bleu'], [18.5, 25, 'Corpulence normale', 'n-vert'], [25, 30, 'Surpoids', 'n-jaune'],
  [30, 35, 'Obésité modérée', 'n-orange'], [35, 40, 'Obésité sévère', 'n-rouge'], [40, 48, 'Obésité morbide', 'n-bordeaux']];
/* Enfants de 2 à 18 ans : seuils IOTF (Cole, 2000 et 2007) qui rejoignent à 18 ans les seuils adultes 18,5 / 25 / 30.
   âge : [garçon maigreur, surpoids, obésité, fille maigreur, surpoids, obésité] — repères approximatifs, interpolés entre deux âges. */
const IOTF = {
  2: [15.14, 18.41, 20.09, 14.83, 18.02, 19.81], 3: [14.74, 17.89, 19.57, 14.47, 17.56, 19.36], 4: [14.43, 17.55, 19.29, 14.19, 17.28, 19.15],
  5: [14.21, 17.42, 19.30, 13.94, 17.15, 19.17], 6: [14.07, 17.55, 19.78, 13.82, 17.34, 19.65], 7: [14.04, 17.92, 20.63, 13.86, 17.75, 20.51],
  8: [14.15, 18.44, 21.60, 14.02, 18.35, 21.57], 9: [14.35, 19.10, 22.77, 14.28, 19.07, 22.81], 10: [14.64, 19.84, 24.00, 14.61, 19.86, 24.11],
  11: [14.97, 20.55, 25.10, 15.05, 20.74, 25.42], 12: [15.35, 21.22, 26.02, 15.62, 21.68, 26.67], 13: [15.84, 21.91, 26.84, 16.26, 22.58, 27.76],
  14: [16.41, 22.62, 27.63, 16.88, 23.34, 28.57], 15: [16.98, 23.29, 28.30, 17.37, 23.94, 29.11], 16: [17.54, 23.90, 28.88, 17.75, 24.37, 29.43],
  17: [18.05, 24.46, 29.41, 18.05, 24.70, 29.69], 18: [18.5, 25, 30, 18.5, 25, 30]
};
function seuilsEnfant(age, sexe) {
  const a = borne(age, 2, 18), b = Math.floor(a), h = Math.min(18, b + 1), t = a - b;
  const v = i => IOTF[b][i] + (IOTF[h][i] - IOTF[b][i]) * t;
  const pour = o => [v(o), v(o + 1), v(o + 2)];
  if (sexe === 'homme') return pour(0);
  if (sexe === 'femme') return pour(3);
  return pour(0).map((x, i) => (x + pour(3)[i]) / 2);
}
/* les bandes de couleur de l'IMC, selon l'âge et le sexe */
function bandesImc(p, date) {
  const age = ageExact(p && p.naissance, date);
  if (age != null && age < 2) return null;
  if (age != null && age < 18) {
    const [m, s, o] = seuilsEnfant(age, p.sexe);
    return { enfant: true, bandes: [[10, m, 'Maigreur', 'n-bleu'], [m, s, 'Corpulence normale', 'n-vert'], [s, o, 'Surpoids', 'n-jaune'], [o, Math.max(o + 6, 34), 'Obésité', 'n-rouge']] };
  }
  return { enfant: false, bandes: IMC_ADULTE };
}
function classeImc(imc, p, date) {
  const b = bandesImc(p, date); if (!b) return null;
  const x = b.bandes.find(([a, z], i) => imc < z || i === b.bandes.length - 1);
  return { lab: x[2], c: x[3], enfant: b.enfant };
}
/* Masse grasse : repères de Gallagher (2000), de 20 à 79 ans, selon le sexe */
const MG = { femme: [[40, 21, 33, 39], [60, 23, 34, 40], [200, 24, 36, 42]], homme: [[40, 8, 20, 25], [60, 11, 22, 28], [200, 13, 25, 30]] };
function bandesMg(p, date) {
  const age = ageExact(p && p.naissance, date);
  if (age == null || age < 20 || !MG[p.sexe]) return null;
  const [, a, b, c] = MG[p.sexe].find(x => age < x[0]);
  return [[2, a, 'Faible', 'n-bleu'], [a, b, 'Normale', 'n-vert'], [b, c, 'Élevée', 'n-orange'], [c, Math.max(c + 10, 50), 'Très élevée', 'n-rouge']];
}
/* estimation à partir de l'IMC (Deurenberg, 1991) quand la masse grasse n'est pas mesurée */
function mgEstimee(imc, p, date) {
  const age = ageExact(p && p.naissance, date);
  if (!imc || age == null || age < 18 || !p.sexe) return 0;
  return 1.2 * imc + 0.23 * age - 10.8 * (p.sexe === 'homme' ? 1 : 0) - 5.4;
}
/* Tour de taille (repères de l'IDF / OMS) */
function bandesTour(p) {
  if (!p || !p.sexe || (ageAnsDe(p.naissance) ?? 99) < 18) return null;
  const [a, b] = p.sexe === 'homme' ? [94, 102] : [80, 88];
  return [[50, a, 'Repère normal', 'n-vert'], [a, b, 'Augmenté', 'n-orange'], [b, b + 30, 'Élevé', 'n-rouge']];
}
const classeDe = (v, bandes) => { const x = bandes.find(([a, z], i) => v < z || i === bandes.length - 1); return { lab: x[2], c: x[3] }; };
/* une jauge horizontale colorée, avec un repère à la valeur */
function jauge(v, bandes, fmt = joli) {
  const min = bandes[0][0], max = bandes[bandes.length - 1][1], pos = borne((v - min) / (max - min), 0, 1) * 100;
  return `<div class="jauge"><div class="jauge-barre">${bandes.map(([a, z, l, c]) => `<i class="${c}" style="flex:${(z - a).toFixed(2)}" title="${esc(l)} : ${fmt(a)} – ${fmt(z)}"></i>`).join('')}
      <b class="jauge-repere" style="left:${pos.toFixed(1)}%"><span>${fmt(v)}</span></b></div>
    <div class="jauge-seuils">${bandes.slice(1).map(([a]) => `<span style="left:${((a - min) / (max - min) * 100).toFixed(1)}%">${fmt(a)}</span>`).join('')}</div>
    <div class="jauge-legende">${bandes.map(([a, z, l, c]) => `<span><i class="${c}"></i>${esc(l)}</span>`).join('')}</div></div>`;
}
/* une courbe dans le temps (SVG), avec une bande « repère » facultative */
function courbe(points, o = {}) {
  if (!points.length) return vide(o.vide || 'Aucune mesure pour l’instant.');
  const W = o.etroit ? 380 : 640, H = o.etroit ? 230 : 240, G = 46, D = 16, T = 14, B = 30;
  const xs = points.map(p => parseJour(p.d).getTime());
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  if (x1 === x0) { x0 -= 20 * 864e5; x1 += 20 * 864e5; }
  const vals = points.map(p => p.v).concat(o.bande ? o.bande.slice(0, 2) : []);
  let y0 = Math.min(...vals), y1 = Math.max(...vals);
  const marge = Math.max((y1 - y0) * .12, o.margeMin || 1); y0 = Math.max(0, y0 - marge); y1 += marge;
  const X = t => G + (t - x0) / (x1 - x0) * (W - G - D), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const pasY = (y1 - y0) / 4;
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = y0 + pasY * i, y = Y(v); g += `<line x1="${G}" x2="${W - D}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text x="${G - 7}" y="${(y + 4).toFixed(1)}" text-anchor="end">${joli(v)}</text>`; }
  const nbX = Math.min(o.etroit ? 3 : 5, points.length > 1 ? 5 : 1);
  let gx = '';
  for (let i = 0; i < nbX; i++) {
    const t = nbX === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (nbX - 1), d = new Date(t);
    gx += `<text x="${X(t).toFixed(1)}" y="${H - 9}" text-anchor="${nbX > 1 && i === 0 ? 'start' : nbX > 1 && i === nbX - 1 ? 'end' : 'middle'}">${d.getDate()} ${MOIS_C[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</text>`;
  }
  const bande = o.bande ? `<rect class="bande" x="${G}" width="${W - G - D}" y="${Y(o.bande[1]).toFixed(1)}" height="${(Y(o.bande[0]) - Y(o.bande[1])).toFixed(1)}"/>
    <text class="bande-t" x="${W - D - 6}" y="${(Y(o.bande[1]) + 14).toFixed(1)}" text-anchor="end">${esc(o.bande[2] || '')}</text>` : '';
  const pts = points.map(p => [X(parseJour(p.d).getTime()), Y(p.v)]);
  const ligne = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const aire = pts.length > 1 ? `<path class="aire" d="${ligne}L${pts[pts.length - 1][0].toFixed(1)} ${H - B}L${pts[0][0].toFixed(1)} ${H - B}Z"/>` : '';
  return `<div class="courbe ${o.cls || ''}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.titre || 'Courbe')}">
    <defs><linearGradient id="aire-${o.cls || 'c'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".28"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
    ${bande}<g class="axes">${g}${gx}</g>${aire.replace('class="aire"', `class="aire" fill="url(#aire-${o.cls || 'c'})"`)}<path class="trait" d="${ligne}"/>
    ${pts.map((q, i) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4.5"><title>${fmtJour(points[i].d)} ${parseJour(points[i].d).getFullYear()} : ${joli(points[i].v)} ${o.unite || ''}</title></circle>`).join('')}
  </svg></div>`;
}
function vuePoids() {
  const q = quiCourant(false), p = personne(q), ms = mesuresDe(q);
  const taille = dernier(q, 'taille'), poids = dernier(q, 'poids');
  const h = taille ? nombre(taille.taille) / 100 : 0;
  const imcDe = m => { const t = nombre(m.taille) || (taille ? nombre(taille.taille) : 0); return t && nombre(m.poids) ? nombre(m.poids) / Math.pow(t / 100, 2) : 0; };
  const imc = poids ? imcDe(poids) : 0, bi = bandesImc(p, poids ? poids.date : auj()), cl = imc && bi ? classeImc(imc, p, poids.date) : null;
  const mgMes = dernier(q, 'mg'), mgV = mgMes ? nombre(mgMes.mg) : mgEstimee(imc, p, poids ? poids.date : auj()), bm = bandesMg(p, auj());
  const tour = dernier(q, 'tour'), bt = bandesTour(p);
  const age = ageExact(p.naissance), adulte = age != null && age >= 18;
  const avant = ms.filter(m => nombre(m.poids) > 0), ecart = avant.length > 1 ? nombre(avant[avant.length - 1].poids) - nombre(avant[avant.length - 2].poids) : null;
  const manque = [!p.naissance && 'la date de naissance', !p.sexe && 'le sexe'].filter(Boolean);
  const bandePoids = h && adulte ? [18.5 * h * h, 25 * h * h, 'poids « normal » pour ' + joli(h * 100) + ' cm'] : null;
  return `<div class="vue">${titreVue('Poids, taille & <span>IMC</span>', 'Le suivi du poids et de la masse grasse, avec des repères de couleur selon l’âge et le sexe.',
    `<button class="btn plein" data-act="ajouter-mesure">⚖️ Ajouter une mesure</button>`)}
  ${choixQui(false)}
  ${manque.length ? `<p class="note-douce">ℹ️ Pour des repères justes, indiquez ${manque.join(' et ')} ${deP(p)} — dans NaoHome, ou dans <button class="lien" data-act="modifier-fiche" data-id="${esc(q)}">la fiche médicale</button>.</p>` : ''}
  <section class="carte" style="margin-bottom:16px"><div class="chiffres">
    <div><b>${poids ? joli(nombre(poids.poids)) + ' kg' : '—'}</b><small>⚖️ poids${ecart != null ? ` · <span class="${ecart > 0 ? 'hausse' : ecart < 0 ? 'baisse' : ''}">${ecart > 0 ? '+' : ''}${joli(ecart)} kg</span>` : ''}</small></div>
    <div><b>${taille ? joli(nombre(taille.taille)) + ' cm' : '—'}</b><small>📏 taille</small></div>
    <div><b>${imc ? joli(imc) : '—'}</b><small>🧮 IMC${cl ? ` · <span class="pastille-niv ${cl.c}">${cl.lab}</span>` : ''}</small></div>
    <div><b>${mgV ? joli(mgV) + ' %' : '—'}</b><small>💧 masse grasse${mgV && !mgMes ? ' (estimée)' : ''}${mgV && bm ? ` · <span class="pastille-niv ${classeDe(mgV, bm).c}">${classeDe(mgV, bm).lab}</span>` : ''}</small></div>
    <div><b>${age != null ? ageTexte(p.naissance) : '—'}</b><small>🎂 âge ${p.sexe ? '· ' + sexeTexte(p.sexe) : ''}</small></div>
  </div></section>
  <div class="grille g2">
    <section class="carte"><h3><span class="e">🧮</span> Indice de masse corporelle</h3>
      ${!imc ? vide('Ajoutez une taille et un poids pour calculer l’IMC.') : !bi ? '<p class="chapo">Avant 2 ans, l’IMC se lit uniquement sur les courbes du carnet de santé.</p>'
        : `<p class="chapo">IMC = poids ÷ taille². ${bi.enfant ? `Chez l’enfant, les seuils changent avec l’âge${p.sexe ? ' et le sexe' : ''} (repères IOTF, à ${ageTexte(p.naissance, poids.date)}).` : 'Repères de l’OMS pour l’adulte.'}</p>${jauge(imc, bi.bandes)}`}
      ${bi && bi.enfant ? '<p class="ui muet" style="font-size:12px;margin:10px 0 0">Pour un enfant, la courbe de corpulence du carnet de santé reste la référence : parlez-en au médecin.</p>' : ''}</section>
    <section class="carte"><h3><span class="e">💧</span> Masse grasse${mgV && !mgMes ? ' <span class="etiquette">estimée</span>' : ''}</h3>
      ${!mgV ? vide(adulte ? 'Notez votre masse grasse (balance à impédancemètre) dans une mesure, ou renseignez sexe et âge pour une estimation.' : 'Les repères de masse grasse concernent les adultes.')
        : !bm ? `<p class="chapo"><b>${joli(mgV)} %</b> — ${adulte ? 'renseignez le sexe pour voir les repères.' : 'pas de repère avant 20 ans.'}</p>`
        : `<p class="chapo">${mgMes ? `Mesurée le ${fmtJour(mgMes.date)}.` : 'Estimée à partir de l’IMC, de l’âge et du sexe (formule de Deurenberg) : une mesure sur balance est plus fiable.'} Repères pour ${p.sexe === 'femme' ? 'une femme' : 'un homme'} de ${ageAnsDe(p.naissance)} ans.</p>${jauge(mgV, bm, v => Math.round(v) + '%')}`}
      ${tour && bt ? `<div class="sous-titre" style="margin-top:16px">📐 Tour de taille : ${joli(nombre(tour.tour))} cm</div>${jauge(nombre(tour.tour), bt, v => Math.round(v))}` : ''}</section>
    <section class="carte large-2"><h3><span class="e">⚖️</span> Courbe de poids (kg)</h3>
      ${courbe(ms.filter(m => nombre(m.poids) > 0).map(m => ({ d: m.date, v: nombre(m.poids) })), { unite: 'kg', cls: 'c-poids', titre: 'Courbe de poids', bande: bandePoids, vide: 'Ajoutez une première mesure pour voir la courbe.' })}
      ${bandePoids ? '<p class="ui muet" style="font-size:12px;margin:6px 0 0">La bande verte montre les poids qui correspondent à un IMC entre 18,5 et 25 pour la taille actuelle.</p>' : ''}</section>
    <section class="carte"><h3><span class="e">📏</span> Courbe de taille (cm)</h3>
      ${courbe(ms.filter(m => nombre(m.taille) > 0).map(m => ({ d: m.date, v: nombre(m.taille) })), { unite: 'cm', cls: 'c-taille', titre: 'Courbe de taille', margeMin: 2, etroit: true, vide: 'Aucune taille notée.' })}</section>
    <section class="carte"><h3><span class="e">🧮</span> Courbe de l’IMC</h3>
      ${courbe(ms.filter(m => imcDe(m)).map(m => ({ d: m.date, v: Math.round(imcDe(m) * 10) / 10 })), { cls: 'c-imc', titre: 'Courbe de l’IMC', etroit: true, bande: adulte ? [18.5, 25, 'normale'] : null, vide: 'Il faut une taille et un poids.' })}</section>
    ${ms.some(m => nombre(m.mg) > 0) ? `<section class="carte large-2"><h3><span class="e">💧</span> Courbe de masse grasse (%)</h3>
      ${courbe(ms.filter(m => nombre(m.mg) > 0).map(m => ({ d: m.date, v: nombre(m.mg) })), { unite: '%', cls: 'c-mg', titre: 'Courbe de masse grasse', bande: bm ? [bm[1][0], bm[1][1], 'normale'] : null })}</section>` : ''}
    <section class="carte large-2"><h3><span class="e">📋</span> Toutes les mesures</h3>
      ${ms.length ? `<div class="tableau-defile"><table class="tableau"><thead><tr><th>Date</th><th>Âge</th><th>Taille</th><th>Poids</th><th>IMC</th><th>Masse grasse</th><th>Tour de taille</th><th></th></tr></thead><tbody>
        ${ms.slice().reverse().map(m => { const i = imcDe(m), c = i && bandesImc(p, m.date) ? classeImc(i, p, m.date) : null; return `<tr><td>${fmtJour(m.date)} ${parseJour(m.date).getFullYear()}</td><td>${ageTexte(p.naissance, m.date) || '—'}</td>
          <td>${nombre(m.taille) ? joli(nombre(m.taille)) + ' cm' : '—'}</td><td>${nombre(m.poids) ? joli(nombre(m.poids)) + ' kg' : '—'}</td>
          <td>${i ? `${joli(i)} ${c ? `<span class="pastille-niv ${c.c}" title="${esc(c.lab)}"></span>` : ''}` : '—'}</td><td>${nombre(m.mg) ? joli(nombre(m.mg)) + ' %' : '—'}</td><td>${nombre(m.tour) ? joli(nombre(m.tour)) + ' cm' : '—'}</td>
          <td><button class="btn-rond" data-act="modifier-mesure" data-id="${m.id}" title="Modifier">✏️</button></td></tr>`; }).join('')}</tbody></table></div>`
        : vide('Aucune mesure notée.', '<button class="btn plein petit" data-act="ajouter-mesure">⚖️ Ajouter une mesure</button>')}</section>
  </div>
  <p class="note-douce" style="margin-top:16px">⚕️ L’IMC et la masse grasse sont des <b>repères statistiques</b>, pas un diagnostic : ils ne tiennent compte ni de la musculature, ni de la morphologie, ni de la grossesse.
    Pour toute question sur votre poids ou celui d’un enfant, parlez-en à votre médecin.</p></div>`;
}
function fenMesure(m) {
  const nouveau = !m, q = quiCourant(false), taille = dernier(m ? m.personne : q, 'taille');
  formulaire({
    titre: nouveau ? '⚖️ Une nouvelle mesure' : '✏️ Modifier la mesure',
    sous: 'Seul le poids ou la taille suffit. La masse grasse et le tour de taille sont facultatifs.',
    valeurs: m || { personne: q, date: auj(), taille: taille ? taille.taille : '' },
    champs: [
      { k: 'personne', l: 'Pour qui ?', t: 'select', o: optionsPersonnes() },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'poids', l: 'Poids (kg)', t: 'number', ph: 'Ex. : 64,5' },
      { k: 'taille', l: 'Taille (cm)', t: 'number', ph: 'Ex. : 168' },
      { k: 'mg', l: 'Masse grasse (%)', t: 'number', ph: 'Balance à impédancemètre', aide: 'Facultatif — sinon NaoSanté l’estime pour un adulte.' },
      { k: 'tour', l: 'Tour de taille (cm)', t: 'number', ph: 'Au niveau du nombril' },
      { k: 'note', l: 'Note', ph: 'Ex. : le matin à jeun', large: true }
    ],
    supprimer: nouveau ? null : () => { instantane(); retirer(S.mesures, m.id); maj(); toast('Mesure supprimée.', { annuler: true }); },
    enregistrer: v => {
      if (!(v.poids > 0) && !(v.taille > 0)) { toast('Indiquez au moins un poids ou une taille.', { alerte: true }); return false; }
      if (!v.date) v.date = auj();
      if (nouveau) S.mesures.push(Object.assign({ id: uid() }, v)); else Object.assign(m, v);
      U.qui = v.personne; maj(); toast('⚖️ Mesure enregistrée.');
    }
  });
}

/* ============================================================
   📇 LE RÉPERTOIRE DES SOIGNANTS
   ============================================================ */
const SPECIALITES = [
  ['traitant', '🩺', 'Médecin traitant'], ['generaliste', '👩‍⚕️', 'Médecin généraliste'], ['pediatre', '🧸', 'Pédiatre'],
  ['dentiste', '🦷', 'Dentiste'], ['orthodontiste', '😁', 'Orthodontiste'], ['ophtalmo', '👁️', 'Ophtalmologue'], ['opticien', '👓', 'Opticien'],
  ['dermato', '🧴', 'Dermatologue'], ['gyneco', '🌸', 'Gynécologue'], ['sagefemme', '🤰', 'Sage-femme'],
  ['radiologie', '🩻', 'Radiologie / imagerie'], ['labo', '🧪', 'Laboratoire d’analyses'], ['kine', '🤲', 'Kinésithérapeute'], ['osteo', '🦴', 'Ostéopathe'],
  ['orl', '👂', 'ORL'], ['cardio', '❤️', 'Cardiologue'], ['allergo', '🤧', 'Allergologue'], ['psy', '🧠', 'Psychologue / psychiatre'],
  ['orthophoniste', '🗣️', 'Orthophoniste'], ['podologue', '🦶', 'Podologue'], ['infirmier', '💉', 'Infirmier·e'], ['pharmacie', '💊', 'Pharmacie'],
  ['hopital', '🏥', 'Hôpital / clinique'], ['autre', '📇', 'Autre']
];
const speciale = k => SPECIALITES.find(s => s[0] === k) || SPECIALITES[SPECIALITES.length - 1];
const ordreSpe = k => { const i = SPECIALITES.findIndex(s => s[0] === k); return i < 0 ? 99 : i; };
const SPE_RAPIDES = ['traitant', 'dentiste', 'ophtalmo', 'dermato', 'gyneco', 'radiologie', 'labo', 'kine', 'osteo'];
function carteSoignant(s) {
  const sp = speciale(s.specialite), qui = (s.personnes || []).map(prenomDe).filter(x => x !== '—');
  return `<div class="soignant"><div class="tr-tete"><span class="emo">${sp[1]}</span>
    <div class="corps"><div class="texte"><b>${esc(s.nom || 'Sans nom')}</b></div><div class="meta"><span>${esc(s.specialite === 'autre' && s.specialiteLibre ? s.specialiteLibre : sp[2])}</span>${s.cabinet ? `<span>· ${esc(s.cabinet)}</span>` : ''}</div></div>
    <div class="outils"><button class="btn-rond" data-act="modifier-soignant" data-id="${s.id}" title="Modifier">✏️</button></div></div>
    <div class="soignant-infos">${s.tel ? `<a href="tel:${esc(s.tel.replace(/\s/g, ''))}">📞 ${esc(s.tel)}</a>` : ''}${s.email ? `<a href="mailto:${esc(s.email)}">✉️ ${esc(s.email)}</a>` : ''}
      ${s.adresse ? `<span>📍 ${esc(s.adresse)}</span>` : ''}${s.horaires ? `<span>🕘 ${esc(s.horaires)}</span>` : ''}${s.site ? `<span>🔗 ${esc(s.site)}</span>` : ''}</div>
    ${qui.length ? `<div class="meta-l">${qui.map(x => `<span class="etiquette">${esc(x)}</span>`).join('')}</div>` : ''}
    ${s.notes ? `<p class="ui muet" style="font-size:12.5px;margin:6px 0 0">📝 ${esc(s.notes)}</p>` : ''}</div>`;
}
function vueSoignants() {
  const f = U.filtreSpe || '', r = (U.chercheSoignant || '').toLowerCase();
  const liste = S.soignants.filter(s => (!f || s.specialite === f) && (!r || [s.nom, s.cabinet, s.adresse, s.specialiteLibre, speciale(s.specialite)[2]].join(' ').toLowerCase().includes(r)))
    .sort((a, b) => ordreSpe(a.specialite) - ordreSpe(b.specialite) || (a.nom || '').localeCompare(b.nom || '', 'fr'));
  const presentes = [...new Set(S.soignants.map(s => s.specialite))].sort((a, b) => ordreSpe(a) - ordreSpe(b));
  const groupes = [...new Set(liste.map(s => s.specialite))];
  return `<div class="vue">${titreVue('Mes <span>soignants</span>', 'Le répertoire du foyer : médecins, dentistes, spécialistes, laboratoires, kinés…',
    '<button class="btn plein" data-act="ajouter-soignant">📇 Ajouter un soignant</button>')}
  ${S.soignants.length ? `<div class="actions" style="margin-bottom:14px"><input type="search" class="recherche" id="chercheSoignant" placeholder="🔎 Chercher un nom, une ville…" value="${esc(U.chercheSoignant || '')}">
    <div class="sous-onglets" style="margin:0"><button class="${f ? '' : 'actif'}" data-act="filtre-spe" data-k="">Tous</button>${presentes.map(k => `<button class="${f === k ? 'actif' : ''}" data-act="filtre-spe" data-k="${k}">${speciale(k)[1]} ${esc(speciale(k)[2])}</button>`).join('')}</div></div>` : ''}
  ${liste.length ? groupes.map(k => `<div class="sous-titre" style="margin:18px 0 8px">${speciale(k)[1]} ${esc(speciale(k)[2])}</div><div class="grille g3">${liste.filter(s => s.specialite === k).map(s => `<section class="carte">${carteSoignant(s)}</section>`).join('')}</div>`).join('')
    : `<section class="carte">${vide(S.soignants.length ? 'Personne ne correspond à cette recherche.' : 'Le répertoire est vide. Commencez par les soignants que vous voyez le plus :')}
      <div class="actions" style="justify-content:center;margin-top:10px">${SPE_RAPIDES.map(k => `<button class="btn petit fin" data-act="ajouter-soignant" data-k="${k}">${speciale(k)[1]} ${esc(speciale(k)[2])}</button>`).join('')}
        <button class="btn petit fin" data-act="ajouter-soignant" data-k="autre">📇 Autre…</button></div></section>`}
  </div>`;
}
function fenSoignant(s, spe) {
  const nouveau = !s, ps = personnes();
  formulaire({
    titre: nouveau ? '📇 Un soignant dans le répertoire' : '✏️ Modifier',
    large: true,
    valeurs: s || { specialite: spe || 'generaliste', personnes: [] },
    champs: [
      { k: 'specialite', l: 'Spécialité', t: 'select', o: SPECIALITES.map(([k, e, l]) => [k, e + ' ' + l]) },
      { k: 'specialiteLibre', l: 'Précisez', ph: 'Ex. : endocrinologue, diététicienne…' },
      { k: 'nom', l: 'Nom', ph: 'Ex. : Dr Claire Moreau' },
      { k: 'cabinet', l: 'Cabinet / établissement', ph: 'Ex. : Maison de santé des Tilleuls' },
      { k: 'tel', l: 'Téléphone', t: 'tel', ph: '05 …' },
      { k: 'email', l: 'E-mail', t: 'email' },
      { k: 'adresse', l: 'Adresse', large: true },
      { k: 'horaires', l: 'Horaires', ph: 'Ex. : lun.–ven. 8 h 30 – 19 h' },
      { k: 'site', l: 'Prise de rendez-vous', ph: 'Site, application, n° de secrétariat…' },
      { k: 'personnes', l: 'Qui suit-il / elle ?', t: 'html', html: `<div class="cases-moments">${ps.map(p => `<label class="etiquette"><input type="checkbox" name="personnes" value="${esc(p.id)}"${s && (s.personnes || []).includes(p.id) ? ' checked' : ''}> ${emojiP(p)} ${esc(p.prenom || nomP(p))}</label>`).join('')}</div>` },
      { k: 'notes', l: 'Notes', t: 'textarea', ph: 'Ex. : conventionné secteur 1, parking derrière, apporter la carte Vitale…' }
    ],
    apres: fen => {
      const sp = fen.querySelector('[name=specialite]'), li = fen.querySelector('[name=specialiteLibre]').closest('.champ');
      const suivre = () => { li.style.display = sp.value === 'autre' ? '' : 'none'; };
      sp.addEventListener('change', suivre); suivre();
    },
    supprimer: nouveau ? null : () => {
      instantane(); retirer(S.soignants, s.id);
      [S.notes, ...Object.values(S.fiches)].forEach(fi => { if (fi.traitant === s.id) fi.traitant = ''; });
      maj(); toast('Retiré du répertoire.', { annuler: true });
    },
    enregistrer: (v, f) => {
      if (!v.nom && !v.cabinet) { toast('Indiquez au moins un nom ou un cabinet.', { alerte: true }); return false; }
      v.personnes = $$('[name=personnes]:checked', f).map(x => x.value);
      if (nouveau) S.soignants.push(Object.assign({ id: uid() }, v)); else Object.assign(s, v);
      /* un médecin traitant coché pour quelqu'un devient son médecin traitant sur sa fiche, s'il n'en a pas */
      if (v.specialite === 'traitant') { const id = nouveau ? S.soignants[S.soignants.length - 1].id : s.id; v.personnes.forEach(p => { const fi = ficheDe(p); if (!fi.traitant && !fi.traitantLibre) fi.traitant = id; }); }
      maj(); toast('📇 Répertoire mis à jour.');
    }
  });
}

/* ============================================================
   💉 LA VACCINATION
   D'après le calendrier des vaccinations 2025 du ministère de la Santé
   (simplifié). Les âges sont en mois.
   ============================================================ */
const VACCINS = [
  ['hexa', 'DTCaP-Hib-HepB', 'Diphtérie, tétanos, coqueluche, poliomyélite, Haemophilus influenzae b et hépatite B (vaccin « hexavalent »)'],
  ['pn', 'Pneumocoque', 'Infections à pneumocoque : pneumonies, méningites, otites graves'],
  ['rota', 'Rotavirus', 'Gastro-entérites à rotavirus du nourrisson (vaccin donné par la bouche)'],
  ['menb', 'Méningocoque B', 'Méningites et septicémies à méningocoque B'],
  ['menacwy', 'Méningocoques ACWY', 'Méningites et septicémies à méningocoques A, C, W et Y'],
  ['menc', 'Méningocoque C', 'Méningites et septicémies à méningocoque C'],
  ['ror', 'ROR', 'Rougeole, oreillons, rubéole'],
  ['dtcap', 'DTCaP / dTcaP', 'Diphtérie, tétanos, coqueluche, poliomyélite (rappels de l’enfant et de l’adulte)'],
  ['dtp', 'dTP', 'Diphtérie, tétanos, poliomyélite (rappels de l’adulte)'],
  ['hpv', 'Papillomavirus (HPV)', 'Papillomavirus humains : cancers du col de l’utérus, de l’anus, de la gorge, du pénis, et verrues génitales'],
  ['hepb', 'Hépatite B', 'Hépatite B (si elle n’a pas été faite avec le vaccin hexavalent)'],
  ['hepa', 'Hépatite A', 'Hépatite A : voyages, collectivités, entourage d’un malade…'],
  ['bcg', 'BCG', 'Tuberculose'],
  ['grippe', 'Grippe', 'Grippe saisonnière (chaque automne)'],
  ['covid', 'Covid-19', 'Covid-19 (chaque automne pour les personnes concernées)'],
  ['zona', 'Zona', 'Zona et ses douleurs (vaccin recombinant, 2 doses)'],
  ['vrs', 'VRS', 'Virus respiratoire syncytial : bronchiolite du nourrisson, infections respiratoires des aînés'],
  ['varicelle', 'Varicelle', 'Varicelle (adolescents et adultes qui ne l’ont jamais eue)'],
  ['fj', 'Fièvre jaune', 'Fièvre jaune : obligatoire en Guyane et pour certains voyages'],
  ['autre', 'Autre vaccin', '']
];
const vaccinRef = k => VACCINS.find(v => v[0] === k) || VACCINS[VACCINS.length - 1];
const nomVaccin = v => v.vaccin === 'autre' && v.libre ? v.libre : vaccinRef(v.vaccin)[1];
/* statut : oblig = obligatoire pour les enfants nés depuis 2018 · oblig25 = obligatoire pour les enfants nés depuis 2025
   · reco = recommandé · situation = selon la situation. nes = années de naissance concernées [de, à]. */
const CALENDRIER = [
  { k: 'm1-bcg', age: 1, v: 'bcg', lab: 'BCG', statut: 'situation', fen: 12, note: 'Pour les enfants exposés à la tuberculose (Guyane, Mayotte, entourage à risque…). N’est plus obligatoire depuis 2007.' },
  { k: 'm2-hexa', age: 2, v: 'hexa', lab: 'DTCaP-Hib-HepB — 1re dose', statut: 'oblig' },
  { k: 'm2-pn', age: 2, v: 'pn', lab: 'Pneumocoque — 1re dose', statut: 'oblig' },
  { k: 'm2-rota', age: 2, v: 'rota', lab: 'Rotavirus — 1re dose', statut: 'reco', fen: 2, nes: [2021] },
  { k: 'm3-menb', age: 3, v: 'menb', lab: 'Méningocoque B — 1re dose', statut: 'oblig25', nes: [2022] },
  { k: 'm3-rota', age: 3, v: 'rota', lab: 'Rotavirus — 2e dose', statut: 'reco', fen: 2, nes: [2021] },
  { k: 'm4-hexa', age: 4, v: 'hexa', lab: 'DTCaP-Hib-HepB — 2e dose', statut: 'oblig' },
  { k: 'm4-pn', age: 4, v: 'pn', lab: 'Pneumocoque — 2e dose', statut: 'oblig' },
  { k: 'm5-menb', age: 5, v: 'menb', lab: 'Méningocoque B — 2e dose', statut: 'oblig25', nes: [2022] },
  { k: 'm5-menc', age: 5, v: 'menc', lab: 'Méningocoque C — 1re dose', statut: 'oblig', nes: [2018, 2024] },
  { k: 'm6-acwy', age: 6, v: 'menacwy', lab: 'Méningocoques ACWY — 1re dose', statut: 'oblig25', nes: [2025] },
  { k: 'm11-hexa', age: 11, v: 'hexa', lab: 'DTCaP-Hib-HepB — rappel', statut: 'oblig' },
  { k: 'm11-pn', age: 11, v: 'pn', lab: 'Pneumocoque — rappel', statut: 'oblig' },
  { k: 'm12-ror', age: 12, v: 'ror', lab: 'ROR — 1re dose', statut: 'oblig' },
  { k: 'm12-menb', age: 12, v: 'menb', lab: 'Méningocoque B — rappel', statut: 'oblig25', nes: [2022] },
  { k: 'm12-acwy', age: 12, v: 'menacwy', lab: 'Méningocoques ACWY — rappel', statut: 'oblig25', nes: [2025] },
  { k: 'm12-menc', age: 12, v: 'menc', lab: 'Méningocoque C — rappel', statut: 'oblig', nes: [2018, 2024] },
  { k: 'm12-menc0', age: 12, v: 'menc', lab: 'Méningocoque C — 1 dose', statut: 'reco', nes: [2010, 2017] },
  { k: 'm16-ror', age: 16, v: 'ror', lab: 'ROR — 2e dose (entre 16 et 18 mois)', statut: 'oblig', fen: 4 },
  { k: 'a6-dtcap', age: 72, v: 'dtcap', lab: 'DTCaP — rappel de 6 ans', statut: 'reco', fen: 12 },
  { k: 'a11-dtcap', age: 132, v: 'dtcap', lab: 'dTcaP — rappel de 11-13 ans', statut: 'reco', fen: 36 },
  { k: 'a11-hpv1', age: 132, v: 'hpv', lab: 'Papillomavirus — 1re dose (filles et garçons, 11-14 ans)', statut: 'reco', fen: 48, note: 'Rattrapage possible jusqu’à 19 ans révolus (26 ans dans certaines situations) — 3 doses à partir de 15 ans.' },
  { k: 'a11-hpv2', age: 138, v: 'hpv', lab: 'Papillomavirus — 2e dose (6 à 13 mois après la 1re)', statut: 'reco', fen: 48 },
  { k: 'a11-acwy', age: 132, v: 'menacwy', lab: 'Méningocoques ACWY — rappel de 11-14 ans', statut: 'reco', fen: 48, note: 'Rattrapage recommandé de 15 à 24 ans.' },
  { k: 'a25-dtcap', age: 300, v: 'dtcap', lab: 'dTcaP — rappel de 25 ans (avec la coqueluche)', statut: 'reco', fen: 24 },
  { k: 'a45-dtp', age: 540, v: 'dtp', lab: 'dTP — rappel de 45 ans', statut: 'reco', fen: 24 },
  { k: 'a65-dtp', age: 780, v: 'dtp', lab: 'dTP — rappel de 65 ans', statut: 'reco', fen: 24 },
  { k: 'a65-pn', age: 780, v: 'pn', lab: 'Pneumocoque — 1 dose (dès 65 ans)', statut: 'reco', fen: 60 },
  { k: 'a65-zona1', age: 780, v: 'zona', lab: 'Zona — 1re dose (dès 65 ans)', statut: 'reco', fen: 60 },
  { k: 'a65-zona2', age: 782, v: 'zona', lab: 'Zona — 2e dose (2 mois après la 1re)', statut: 'reco', fen: 60 },
  { k: 'a75-dtp', age: 900, v: 'dtp', lab: 'dTP — rappel de 75 ans', statut: 'reco', fen: 24 },
  { k: 'a75-vrs', age: 900, v: 'vrs', lab: 'VRS — 1 dose (dès 75 ans, ou 65 ans avec une maladie chronique)', statut: 'reco', fen: 60 },
  { k: 'a85-dtp', age: 1020, v: 'dtp', lab: 'dTP — rappel de 85 ans', statut: 'reco', fen: 24 },
  { k: 'a95-dtp', age: 1140, v: 'dtp', lab: 'dTP — rappel de 95 ans', statut: 'reco', fen: 24 }
];
/* le tableau à double entrée (vaccins × âges), d'après le « calendrier simplifié des vaccinations 2026 ».
   Colonnes : [libellé, âge de début en mois]. Cases : colonne → [étapes du calendrier, texte, pâle]. */
const COLS_VAC = [['1 mois', 1], ['2 mois', 2], ['3 mois', 3], ['4 mois', 4], ['5 mois', 5], ['6 mois', 6], ['11 mois', 11], ['12 mois', 12],
  ['16-18 mois', 16], ['6 ans', 72], ['11-13 ans', 132], ['25 ans', 300], ['45 ans', 540], ['65 ans et +', 780], ['75 ans et +', 900]];
const OBLIG_COLS = ['2 mois', '3 mois', '4 mois', '5 mois', '6 mois', '11 mois', '12 mois', '16-18 mois'];
const GRILLE_VAC = [
  { n: 'BCG', c: '#8E5BC2', v: 'bcg', d: 'Tuberculose : seulement pour les enfants exposés', cases: { '1 mois': [['m1-bcg'], 'si besoin', 1] } },
  { n: 'Diphtérie, tétanos, polio, coqueluche', c: '#2FA595', v: 'dtcap', d: 'Rappels toute la vie',
    cases: { '2 mois': [['m2-hexa']], '4 mois': [['m4-hexa']], '11 mois': [['m11-hexa']], '6 ans': [['a6-dtcap']], '11-13 ans': [['a11-dtcap']],
      '25 ans': [['a25-dtcap']], '45 ans': [['a45-dtp'], 'sans coqueluche'], '65 ans et +': [['a65-dtp', 'a75-dtp', 'a85-dtp', 'a95-dtp'], 'tous les 10 ans'] } },
  { n: 'Hib', c: '#4FB37A', v: 'hexa', d: 'Haemophilus influenzae b (méningites du bébé)', cases: { '2 mois': [['m2-hexa']], '4 mois': [['m4-hexa']], '11 mois': [['m11-hexa']] } },
  { n: 'Hépatite B', c: '#D9AE2A', v: 'hepb', d: 'Dans le même vaccin que les précédents chez le bébé',
    cases: { '2 mois': [['m2-hexa']], '4 mois': [['m4-hexa']], '11 mois': [['m11-hexa']], '11-13 ans': [[], 'rattrapage', 1] } },
  { n: 'Pneumocoque', c: '#D2609C', v: 'pn', d: 'Pneumonies, méningites, otites graves', cases: { '2 mois': [['m2-pn']], '4 mois': [['m4-pn']], '11 mois': [['m11-pn']], '65 ans et +': [['a65-pn']] } },
  { n: 'ROR', c: '#C9433E', v: 'ror', d: 'Rougeole, oreillons, rubéole', cases: { '12 mois': [['m12-ror']], '16-18 mois': [['m16-ror']] } },
  { n: 'Méningocoques ACWY', c: '#C255B4', v: 'menacwy', d: 'Méningites (le C seul pour les enfants nés de 2010 à 2024)',
    cases: { '5 mois': [['m5-menc'], 'C', 1], '6 mois': [['m6-acwy']], '12 mois': [['m12-acwy', 'm12-menc', 'm12-menc0']], '11-13 ans': [['a11-acwy']] } },
  { n: 'Méningocoque B', c: '#7E5FD0', v: 'menb', d: 'Méningites à méningocoque B', cases: { '3 mois': [['m3-menb']], '5 mois': [['m5-menb']], '12 mois': [['m12-menb']] } },
  { n: 'Rotavirus', c: '#C98E3C', v: 'rota', d: 'Gastro-entérites du bébé (par la bouche)', cases: { '2 mois': [['m2-rota']], '3 mois': [['m3-rota']], '4 mois': [[], 'selon le vaccin', 1] } },
  { n: 'Papillomavirus (HPV)', c: '#E98535', v: 'hpv', d: 'Cancers et verrues génitales — filles et garçons', cases: { '11-13 ans': [['a11-hpv1', 'a11-hpv2'], '2 doses'] } },
  { n: 'Grippe', c: '#3E9BE0', v: 'grippe', d: 'Chaque automne', annuel: 1, cases: { '65 ans et +': [[], 'tous les ans'] } },
  { n: 'Covid-19', c: '#3F5A8C', v: 'covid', d: 'Chaque automne', annuel: 1, cases: { '65 ans et +': [[], 'tous les ans'] } },
  { n: 'Zona', c: '#9A6F5A', v: 'zona', d: '2 doses à 2 mois d’écart', cases: { '65 ans et +': [['a65-zona1', 'a65-zona2'], '2 doses'] } },
  { n: 'VRS', c: '#3DAF6E', v: 'vrs', d: 'Virus de la bronchiolite', cases: { '75 ans et +': [['a75-vrs']] } }
];
const STATUTS = { oblig: ['Obligatoire', 'oblig'], oblig25: ['Obligatoire (nés depuis 2025)', 'oblig'], reco: ['Recommandé', 'reco'], situation: ['Selon la situation', 'sit'] };
function statutPour(e, p) {
  const an = p && p.naissance ? parseJour(p.naissance).getFullYear() : null;
  if (e.statut === 'oblig') return an != null && an >= 2018 ? STATUTS.oblig : STATUTS.reco;
  if (e.statut === 'oblig25') return an != null && an >= 2025 ? STATUTS.oblig : STATUTS.reco;
  return STATUTS[e.statut];
}
function etapesPour(p) {
  const an = parseJour(p.naissance).getFullYear();
  return CALENDRIER.filter(e => !e.nes || (an >= e.nes[0] && (e.nes[1] == null || an <= e.nes[1])));
}
const faitPour = (p, e) => S.vaccins.find(v => idDonnees(v.personne) === idDonnees(p.id) && v.etape === e.k);
function etatEtape(p, e) {
  const m = ageMoisDe(p.naissance), f = faitPour(p, e);
  if (f) return ['fait', f];
  if (e.statut === 'situation') return ['situation'];
  if (m < e.age) return ['avenir'];
  if (m < e.age + (e.fen || (e.age < 24 ? 3 : 24))) return ['maintenant'];
  return ['verifier'];
}
const saisonDe = (d = auj()) => { const x = parseJour(d), y = x.getMonth() >= 8 ? x.getFullYear() : x.getFullYear() - 1; return [y + '-09-01', (y + 1) + '-08-31', `${y}-${y + 1}`]; };
function ligneEtape(p, e) {
  const [etat, f] = etatEtape(p, e), st = statutPour(e, p), date = ajouteMois(p.naissance, e.age);
  const etiquette = etat === 'fait' ? `<span class="vac-etat fait">✓ Fait le ${fmtJour(f.date)} ${parseJour(f.date).getFullYear()}</span>`
    : etat === 'avenir' ? `<span class="vac-etat avenir">À venir · ${MOIS_L[parseJour(date).getMonth()]} ${parseJour(date).getFullYear()}</span>`
    : etat === 'situation' ? '<span class="vac-etat avenir">Si besoin : en parler au médecin</span>'
    : etat === 'maintenant' ? '<span class="vac-etat maintenant">À faire maintenant</span>' : '<span class="vac-etat verifier">Non noté · à vérifier dans le carnet</span>';
  return `<div class="vac-ligne ${etat}"><div class="corps"><div class="texte"><b>${esc(e.lab)}</b> <span class="vac-statut ${st[1]}">${st[0]}</span></div>
      ${e.note ? `<div class="meta"><span>${esc(e.note)}</span></div>` : ''}</div>${etiquette}
    ${etat === 'fait' ? `<button class="btn-rond" data-act="modifier-vaccin" data-id="${f.id}" title="Modifier">✏️</button>` : `<button class="btn petit ${etat === 'maintenant' ? 'plein' : 'fin'}" data-act="noter-etape" data-k="${e.k}">✓ Noter</button>`}</div>`;
}
/* le tableau en couleurs, avec la situation de la personne choisie (✓ noté, ! à faire, colonne de son âge) */
function grilleVaccins(p) {
  const m = p && p.naissance ? ageMoisDe(p.naissance) : null, ok = m != null ? etapesPour(p).map(e => e.k) : null;
  const colAge = m == null ? -1 : COLS_VAC.reduce((i, c, j) => m >= c[1] ? j : i, -1);
  const [d0, d1] = saisonDe();
  const cell = (r, [col], j) => {
    const cs = r.cases[col], cls = j === colAge ? ' ici' : '', ob = OBLIG_COLS.includes(col) ? ' ob' : '';
    if (!cs) return `<td class="vg-vide${cls}${ob}"></td>`;
    const [ks, txt, pale] = cs, etapes = ok ? ks.filter(k => ok.includes(k)).map(k => CALENDRIER.find(e => e.k === k)) : [];
    let marque = '', act = '', titre = `${r.n} · ${col}${txt ? ' · ' + txt : ''}`, hors = '';
    if (ok && r.annuel) {
      const f = m >= 780 && S.vaccins.find(v => idDonnees(v.personne) === idDonnees(p.id) && v.vaccin === r.v && v.date >= d0 && v.date <= d1);
      if (f) marque = '<i class="vg-m">✓</i>';
      act = ` data-act="ajouter-vaccin" data-v="${r.v}"`;
    } else if (ok && ks.length) {
      if (!etapes.length) hors = ' hors';
      else {
        const faits = etapes.filter(e => faitPour(p, e)), etats = etapes.map(e => etatEtape(p, e)[0]);
        if (faits.length === etapes.length) { marque = '<i class="vg-m">✓</i>'; act = ` data-act="modifier-vaccin" data-id="${faitPour(p, etapes[0]).id}"`; titre += ' · noté ✓'; }
        else {
          const suiv = etapes.find(e => !faitPour(p, e));
          if (etats.includes('maintenant')) { marque = '<i class="vg-m vg-alerte">!</i>'; titre += ' · à faire maintenant'; }
          else if (faits.length) marque = `<i class="vg-m vg-demi">${faits.length}/${etapes.length}</i>`;
          act = ` data-act="noter-etape" data-k="${suiv.k}"`;
        }
      }
    }
    return `<td class="vg-c${pale ? ' pale' : ''}${hors}${cls}${ob}" style="--vc:${r.c}"${act} title="${esc(titre)}">${marque}${txt && !marque ? `<span>${esc(txt)}</span>` : ''}</td>`;
  };
  return `<div class="vg-defile"><table class="vg">
    <thead><tr><th class="vg-coin">Âge →<br>Vaccin ↓</th>${COLS_VAC.map(([l], j) => `<th class="${j === colAge ? 'ici' : ''}${OBLIG_COLS.includes(l) ? ' ob' : ''}">${j === colAge ? `<em>${esc(p.prenom || 'Moi')}</em>` : ''}${l}</th>`).join('')}</tr></thead>
    <tbody>${GRILLE_VAC.map(r => `<tr><th><div class="vg-nom"><i class="vg-pt" style="--vc:${r.c}"></i><span><b>${esc(r.n)}</b><small>${esc(r.d)}</small></span></div></th>${COLS_VAC.map((c, j) => cell(r, c, j)).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <div class="vg-legende"><span><i class="vg-cadre"></i>Obligatoires pour les bébés</span>
    ${m != null ? `<span><i class="vg-l vg-m">✓</i>Noté dans son carnet</span><span><i class="vg-l vg-m vg-alerte">!</i>À faire maintenant</span><span><i class="vg-l vg-ici"></i>Son âge aujourd’hui</span><span><i class="vg-l vg-hors"></i>Ne la concerne pas (année de naissance)</span>` : ''}
    <span><i class="vg-l vg-pale"></i>Rattrapage ou selon le cas</span></div>
  ${m != null ? '<p class="ui muet" style="font-size:12px;margin:8px 0 0">👆 Touchez une case en couleur pour noter ce vaccin dans son carnet.</p>' : ''}`;
}
function vueVaccins() {
  const q = quiCourant(false), p = personne(q), m = ageMoisDe(p.naissance), age = m == null ? null : m / 12, qui = esc(p.prenom || nomP(p));
  const carnet = S.vaccins.filter(v => idDonnees(v.personne) === idDonnees(q)).sort((a, b) => b.date.localeCompare(a.date));
  let point;
  if (m == null) point = `<p class="note-douce">🎂 Indiquez la date de naissance ${deP(p)} (dans NaoHome ou dans <button class="lien" data-act="modifier-fiche" data-id="${esc(q)}">la fiche médicale</button>) : le tableau montrera alors où ${qui} en est.</p>`;
  else {
    const etapes = etapesPour(p), aFaire = etapes.filter(e => etatEtape(p, e)[0] === 'maintenant'), nonNotes = etapes.filter(e => etatEtape(p, e)[0] === 'verifier');
    const prochaine = etapes.find(e => etatEtape(p, e)[0] === 'avenir'), dp = prochaine && parseJour(ajouteMois(p.naissance, prochaine.age));
    const [d0, d1, saison] = saisonDe(), annuel = [];
    if (age >= 65 || (age >= 2 && age < 18)) annuel.push(['grippe', 'Grippe']);
    if (age >= 65) annuel.push(['covid', 'Covid-19']);
    const saisonAFaire = annuel.filter(([k]) => !carnet.some(v => v.vaccin === k && v.date >= d0 && v.date <= d1));
    const bloc = (cls, em, titre, corps) => `<div class="vp-bloc ${cls}"><span class="vp-em">${em}</span><div class="corps"><b>${titre}</b>${corps || ''}</div></div>`;
    const ligne = (lab, bouton) => `<div class="vp-ligne"><span>${esc(lab)}</span>${bouton}</div>`;
    point = `<div class="vp">
      ${aFaire.length || saisonAFaire.length
        ? bloc('orange', '⏳', `À faire maintenant`, aFaire.map(e => ligne(e.lab, `<button class="btn petit plein" data-act="noter-etape" data-k="${e.k}">✓ C’est fait</button>`)).join('')
          + saisonAFaire.map(([k, l]) => ligne(`${l} — saison ${saison}`, `<button class="btn petit plein" data-act="ajouter-vaccin" data-v="${k}">✓ C’est fait</button>`)).join(''))
        : bloc('vert', '✅', 'Rien à faire en ce moment', '<small>D’après le calendrier et ce qui est noté.</small>')}
      ${bloc('', '📅', prochaine ? `Prochain vaccin : ${esc(prochaine.lab.split(' — ')[0])}` : 'Pas d’autre vaccin prévu au calendrier',
        prochaine ? `<small>${MOIS_L[dp.getMonth()]} ${dp.getFullYear()} · ${esc(prochaine.lab.split(' — ')[1] || '')}</small>` : '')}
      ${nonNotes.length ? bloc('jaune', '📒', `${pluriel(nonNotes.length, 'vaccin passé non noté', 'vaccins passés non notés')}`, `<small>Recopiez son carnet de santé : touchez les cases du tableau pour les noter.</small>`) : ''}
    </div>
    ${p.sexe === 'femme' && age >= 15 && age < 50 ? '<p class="note-douce" style="margin-top:10px">🤰 <b>En cas de grossesse</b> : coqueluche à chaque grossesse dès 20 semaines, grippe en saison, et protection du bébé contre le VRS (vaccin entre 32 et 36 semaines ou anticorps à la naissance).</p>' : ''}`;
  }
  return `<div class="vue">${titreVue('La <span>vaccination</span>', 'Où en est chacun, et le calendrier en un coup d’œil.',
    '<button class="btn plein" data-act="ajouter-vaccin">💉 Noter un vaccin</button>')}
  ${choixQui(false)}
  <div class="grille g2">
    <section class="carte large-2"><h3><span class="e">🎯</span> Où en est ${qui} ?${m != null ? ` <span class="ui muet" style="font-size:13px;font-weight:600">· ${ageTexte(p.naissance)}</span>` : ''}</h3>${point}</section>
    <section class="carte large-2"><h3><span class="e">🗓️</span> Le calendrier des vaccinations</h3>
      <p class="chapo">Une ligne par vaccin, une colonne par âge : chaque case en couleur est une dose à faire à cet âge.</p>
      ${grilleVaccins(m != null ? p : null)}</section>
    <section class="carte"><h3><span class="e">📒</span> Le carnet de ${qui}</h3>
      ${carnet.length ? carnet.map(v => `<div class="ligne"><span class="emo">💉</span><div class="corps"><div class="texte">${esc(nomVaccin(v))}</div>
        <div class="meta"><span>${fmtJour(v.date)} ${parseJour(v.date).getFullYear()}</span>${v.etape ? `<span>· ${esc((CALENDRIER.find(e => e.k === v.etape) || { lab: '' }).lab.split(' — ')[1] || '')}</span>` : ''}${v.produit ? `<span>· ${esc(v.produit)}</span>` : ''}${v.par ? `<span>· ${esc(v.par)}</span>` : ''}</div></div>
        <div class="outils"><button class="btn-rond" data-act="modifier-vaccin" data-id="${v.id}" title="Modifier">✏️</button></div></div>`).join('')
        : vide('Aucun vaccin noté.', '<button class="btn petit plein" data-act="ajouter-vaccin">💉 Noter un vaccin</button>')}</section>
    <section class="carte"><h3><span class="e">📖</span> Bon à savoir</h3>
      <div class="vac-bref"><b>🍂 Chaque automne</b><span>Grippe : dès 65 ans, pendant la grossesse, avec une maladie chronique, et proposée aux enfants de 2 à 17 ans. Covid-19 : dès 65 ans et personnes fragiles.</span></div>
      <div class="vac-bref"><b>🔁 Rattrapages</b><span>Papillomavirus jusqu’à 19 ans, méningocoques ACWY jusqu’à 24 ans, hépatite B jusqu’à 15 ans, ROR si moins de 2 doses (nés après 1980).</span></div>
      <div class="vac-bref"><b>⚖️ Obligatoires</b><span>11 vaccins pour les enfants nés depuis 2018 ; méningocoques B et ACWY en plus pour ceux nés depuis 2025.</span></div>
      <div class="vac-bref"><b>🩸 Hépatite C</b><span>Il n’existe <b>pas de vaccin</b> : on s’en protège par le dépistage et la prévention.</span></div>
      <div class="vac-bref"><b>✈️ Voyages</b><span>Fièvre jaune, hépatite A, typhoïde, rage… : à voir avec un centre de vaccinations internationales.</span></div></section>
  </div>
  <details class="replie carte" style="margin-top:16px"><summary class="sous-titre">📋 Le détail étape par étape${m != null ? ' pour ' + qui : ''}</summary>
    ${m != null ? etapesPour(p).map(e => ligneEtape(p, e)).join('') : '<p class="ui muet">Indiquez la date de naissance pour voir le détail.</p>'}</details>
  <p class="note-douce" style="margin-top:16px">⚕️ Calendrier <b>simplifié</b> d’après le calendrier des vaccinations 2026 (ministère de la Santé, Santé publique France). Il change chaque année et dépend de la santé de chacun :
    vérifiez toujours avec votre médecin, votre pharmacien ou sur vaccination-info-service.fr.</p></div>`;
}
function fenVaccin(v, pre = {}) {
  const nouveau = !v, q = quiCourant(false), id = v ? v.personne : (pre.personne || q), p = personne(id);
  const etapes = p && p.naissance ? etapesPour(p) : CALENDRIER;
  formulaire({
    titre: nouveau ? '💉 Noter un vaccin' : '✏️ Modifier le vaccin',
    sous: 'Recopiez le carnet de santé ou de vaccination : date, nom du vaccin, numéro de lot.',
    valeurs: v || Object.assign({ personne: id, date: auj(), vaccin: 'hexa', etape: '' }, pre),
    champs: [
      { k: 'personne', l: 'Pour qui ?', t: 'select', o: optionsPersonnes() },
      { k: 'date', l: 'Date', t: 'date' },
      { k: 'vaccin', l: 'Vaccin', t: 'select', o: VACCINS.map(([k, n]) => [k, n]) },
      { k: 'libre', l: 'Nom du vaccin', ph: 'Ex. : typhoïde, rage, encéphalite à tiques…' },
      { k: 'etape', l: 'Étape du calendrier', t: 'select', o: [['', '— Aucune (vaccin hors calendrier, voyage…) —'], ...etapes.map(e => [e.k, e.lab])], large: true },
      { k: 'produit', l: 'Nom commercial / n° de lot', ph: 'Ex. : Hexyon, lot A1234' },
      { k: 'par', l: 'Fait par', ph: 'Ex. : Dr Moreau, pharmacie du Centre' },
      { k: 'note', l: 'Note', ph: 'Ex. : petite fièvre le soir', large: true }
    ],
    apres: fen => {
      const vc = fen.querySelector('[name=vaccin]'), li = fen.querySelector('[name=libre]').closest('.champ'), et = fen.querySelector('[name=etape]');
      const suivre = () => { li.style.display = vc.value === 'autre' ? '' : 'none'; };
      vc.addEventListener('change', suivre); suivre();
      et.addEventListener('change', () => { const e = CALENDRIER.find(x => x.k === et.value); if (e) { vc.value = e.v; suivre(); } });
    },
    supprimer: nouveau ? null : () => { instantane(); retirer(S.vaccins, v.id); maj(); toast('Vaccin retiré du carnet.', { annuler: true }); },
    enregistrer: val => {
      if (!val.date) val.date = auj();
      if (val.vaccin === 'autre' && !val.libre) { toast('Indiquez le nom du vaccin.', { alerte: true }); return false; }
      if (val.etape && S.vaccins.some(x => x !== v && idDonnees(x.personne) === idDonnees(val.personne) && x.etape === val.etape)) { toast('Cette étape est déjà notée pour cette personne.', { alerte: true }); return false; }
      if (nouveau) S.vaccins.push(Object.assign({ id: uid() }, val)); else Object.assign(v, val);
      U.qui = val.personne; maj(); toast(`💉 ${val.vaccin === 'autre' ? val.libre : vaccinRef(val.vaccin)[1]} noté pour ${prenomP(val.personne)}.`);
    }
  });
}

/* ============================================================
   Branchement : les onglets, les écrans et les actions
   ============================================================ */
VUES.push(
  ['pilulier', '💊', 'Pilulier', 'sante'],
  ['fiches', '🩺', 'Fiches médicales', 'sante'],
  ['poids', '⚖️', 'Poids & IMC', 'sante'],
  ['soignants', '📇', 'Mes soignants', 'sante'],
  ['vaccins', '💉', 'Vaccins', 'sante']
);
Object.assign(RENDUS, { pilulier: vuePilulier, fiches: vueFiches, poids: vuePoids, soignants: vueSoignants, vaccins: vueVaccins });
Object.assign(ACTIONS, {
  qui: b => { U.qui = b.dataset.id; rendre(); },
  'ajouter-traitement': () => fenTraitement(),
  'modifier-traitement': b => fenTraitement(trouver(S.traitements, b.dataset.id)),
  prise: (b, e) => {
    const t = trouver(S.traitements, b.dataset.id), d = b.dataset.d, m = b.dataset.m, l = t.prises[d] || (t.prises[d] = []), i = l.indexOf(m);
    if (i >= 0) l.splice(i, 1); else { l.push(m); eclat(e.clientX, e.clientY, ['💊', '✦', '·', '✧']); }
    if (!l.length) delete t.prises[d];
    maj();
  },
  'jour-pil': b => { const n = Number(b.dataset.n); U.jourPil = n === 0 ? auj() : ajouteJours(U.jourPil || auj(), n); if (U.jourPil > auj()) U.jourPil = auj(); rendre(); },
  'modifier-fiche': b => fenFiche(b.dataset.id || quiCourant(false)),
  'devoiler-fiche': () => { U.devoileFiche = !U.devoileFiche; rendre(); },
  'ajouter-mesure': () => fenMesure(),
  'modifier-mesure': b => fenMesure(trouver(S.mesures, b.dataset.id)),
  'ajouter-soignant': b => fenSoignant(null, b.dataset.k),
  'modifier-soignant': b => fenSoignant(trouver(S.soignants, b.dataset.id)),
  'filtre-spe': b => { U.filtreSpe = b.dataset.k; rendre(); },
  'ajouter-vaccin': b => fenVaccin(null, b.dataset.v ? { vaccin: b.dataset.v } : {}),
  'modifier-vaccin': b => fenVaccin(trouver(S.vaccins, b.dataset.id)),
  'noter-etape': b => { const e = CALENDRIER.find(x => x.k === b.dataset.k); fenVaccin(null, { etape: e.k, vaccin: e.v, personne: quiCourant(false) }); }
});
/* la recherche du répertoire : on garde le curseur dans le champ */
document.addEventListener('input', e => {
  if (e.target.id !== 'chercheSoignant') return;
  U.chercheSoignant = e.target.value; const pos = e.target.selectionStart;
  rendre(); const c = $('#chercheSoignant'); if (c) { c.focus(); c.setSelectionRange(pos, pos); }
});
/* une adresse comme #vaccins ouvre directement l'écran (ns-app a déjà rendu l'accueil) */
{ const h = location.hash.slice(1); if (RENDUS[h] && VUES.find(v => v[0] === h)[3] === 'sante') { U.vue = h; rendre(); } }
