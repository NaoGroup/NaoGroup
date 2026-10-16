'use strict';
/* ============================================================
   NaoBaby — navigation, profil, partage & démarrage
   ============================================================ */

function onglets() {
  if (!aProfil()) return [];
  if (P().mode === 'perte') return [['accueil', '🕊️ Notre espace'], ['grossesse', '💭 Journal', 'journal']];
  const o = [['accueil', '🏠 Accueil'], ['grossesse', '🤰 Grossesse'], ['accouchement', '🏥 Accouchement'], ['bebe', '👶 Bébé']];
  if (etoiles().length) o.push(['souvenir', '✨ Souvenir']);
  return o;
}
function rendrePill() {
  const el = $('#pill');
  if (!aProfil()) { el.hidden = true; return; }
  el.hidden = false;
  if (P().mode === 'perte') { el.innerHTML = '<i></i>🕊️ Avec douceur'; return; }
  if (estNe()) { const b = nes()[0]; el.innerHTML = `<i></i>${esc(nes().map(x => nomBebe(x)).join(' & '))} <small>· ${ageA(b.naissance.date, cle(auj()))}</small>`; return; }
  const g = etatGrossesse();
  el.innerHTML = `<i></i>Semaine ${g.semaine} sur 40 ${g.restant >= 0 ? `<small>· J-${g.restant}</small>` : ''}`;
}
function rendre() {
  const o = onglets();
  if (o.length && !o.some(([p]) => p === V.page)) V.page = 'accueil';
  if (P().mode === 'perte' && V.page === 'grossesse') V.sous.grossesse = 'journal';
  $('#pages').innerHTML = o.map(([p, l, s]) => `<button class="${V.page === p ? 'on' : ''}" data-act="go" data-p="${p}" ${s ? `data-s="${s}"` : ''}>${l}</button>`).join('');
  $('#pages').hidden = !o.length;
  rendrePill();
  rendreRappels();
  const f = PAGES[V.page] || PAGES.accueil;
  $('#vue').innerHTML = f();
  if (V.page === 'accouchement' && V.sous.accouchement === 'contractions') lancerChrono();
  try { localStorage.setItem('naobaby.vue', JSON.stringify({ page: V.page, sous: V.sous, ev: V.ev })); } catch (e) {}
}
ACTIONS.go = el => {
  const p = el.dataset.p, s = el.dataset.s, x = el.dataset.x;
  V.page = p;
  if (s) V.sous[p] = s;
  if (x && s === 'listes') V.filtreListe = x;
  if (x && s === 'evenements') V.ev = x;
  if (s === 'suivi') V.semaine = null;
  fermer(); rendre(); scrollTo({ top: 0, behavior: 'smooth' });
};
ACTIONS.sous = el => { V.sous[el.dataset.p] = el.dataset.s; if (el.dataset.s === 'suivi') V.semaine = null; rendre(); };
ACTIONS.theme = () => appliquerTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');

/* ============================================================
   Profil de grossesse
   ============================================================ */
ACTIONS.profil = () => {
  const p = P(), neuf = !aProfil();
  const secrets = actifs().filter(b => (b.sexe === 'fille' || b.sexe === 'garcon') && !b.revele).length;
  const connus = actifs().filter(b => b.revele && (b.sexe === 'fille' || b.sexe === 'garcon'));
  formulaire({
    titre: neuf ? '✨ Créons votre carnet' : '⚙️ Notre carnet de grossesse', large: true,
    chapo: neuf ? 'Quelques informations suffisent pour commencer. Tout reste sur cet ordinateur, et tout se modifie plus tard.' : 'Vos informations restent sur cet ordinateur.',
    valeurs: { ...p, nb: String(p.nb), aines: String(p.aines || 0) },
    champs: [
      { k: 'parent1', lab: 'Prénom du premier parent', place: 'Ex. : Naomie' }, { k: 'parent2', lab: 'Prénom du second parent (facultatif)' },
      { k: 'nomFamille', lab: 'Nom de famille (pour tester les prénoms)', large: true },
      { k: 'dpa', lab: 'Date prévue d’accouchement', type: 'date', aide: 'Celle indiquée par votre professionnel de santé.' },
      { k: 'ddr', lab: 'ou : date des dernières règles', type: 'date', aide: 'Si vous n’avez pas encore la date prévue, NaoBaby l’estime (+ 280 jours).' },
      { k: 'nb', lab: 'Nous attendons', type: 'choix', large: true, options: [['1', '👶 Un bébé'], ['2', '👶👶 Des jumeaux'], ['3', '👶👶👶 Des triplés'], ['4', '💞 Quatre bébés ou plus']] },
      { k: 'aines', lab: 'Enfants déjà à charge', type: 'select', options: [['0', 'Aucun'], ['1', 'Un'], ['2', 'Deux ou plus']], aide: 'Sert uniquement au calcul indicatif du congé maternité.' },
      { k: 'maternite', lab: 'Maternité (facultatif)' }, { k: 'materniteTel', lab: 'Téléphone de la maternité', type: 'tel' }, { k: 'materniteAdresse', lab: 'Adresse de la maternité' },
      { k: 'styleRevel', lab: 'Style de la révélation du sexe', type: 'choix', large: true, options: [['tradition', '🎀💙 Rose ou bleu'], ['violet', '💜 Violet'], ['neutre', '✨ Doré & crème']] },
      { k: 'neutre', type: 'case', texte: 'Garder un thème neutre et lavande, même quand le sexe de bébé est connu', large: true },
      ...(neuf ? [] : [{ k: 'x-sexe', type: 'html', large: true, html: `<div class="note-douce"><span class="em">🎀</span><div>
          ${connus.length ? `Sexe connu : <b>${connus.map(b => `${esc(nomBebe(b))} ${b.sexe === 'fille' ? '🎀' : '💙'}`).join(', ')}</b>. ` : ''}${secrets ? '🔒 Un secret attend d’être découvert. ' : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${revelable() ? '<button type="button" class="btn petit" data-act="reveler">🎀 Découvrir / saisir le sexe</button>' : ''}
          ${connus.length ? '<button type="button" class="btn petit" data-act="reset-sexe">↺ Effacer le sexe saisi</button>' : ''}</div></div></div>` },
        { k: 'x-perte', type: 'html', large: true, html: `<div class="note-douce" style="background:var(--creux);border-color:var(--bord)"><span class="em">🕊️</span><div>
          Si la grossesse s’est arrêtée, NaoBaby peut se faire plus doux et devenir un espace de souvenir.
          <div style="margin-top:8px"><button type="button" class="btn petit" data-act="mode-perte">Notre grossesse s’est arrêtée</button></div></div></div>` },
        { k: 'x-nouveau', type: 'html', large: true, html: `<div class="note-douce" style="background:var(--creux);border-color:var(--bord)"><span class="em">🌱</span><div>
          Envie de repartir de zéro — une nouvelle grossesse, un carnet de test, une erreur de saisie ? Vous pouvez effacer ce carnet et en commencer un nouveau.
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn petit" data-act="nouveau-depart">🌱 Supprimer ce carnet et en commencer un nouveau</button>
          <button type="button" class="btn petit danger" data-act="reinitialiser">♻️ Réinitialiser l’outil</button></div></div></div>` }]),
    ],
    texteOk: neuf ? '✨ Commencer' : 'Enregistrer',
    enregistrer: v => {
      let dpa = v.dpa;
      if (!dpa && v.ddr) dpa = cle(plus(lire(v.ddr), 280));
      if (!dpa) { toast('📅', 'Indiquez la date prévue', 'ou la date des dernières règles.'); return false; }
      const ancienNb = p.nb;
      Object.assign(p, { parent1: v.parent1, parent2: v.parent2, nomFamille: v.nomFamille, dpa, nb: Number(v.nb) || 1, aines: Number(v.aines) || 0,
        maternite: v.maternite, materniteTel: v.materniteTel, materniteAdresse: v.materniteAdresse, styleRevel: v.styleRevel || 'tradition', neutre: v.neutre });
      completer(S);
      if (neuf) { const d = listesParDefaut(); S.achats = d.achats; S.valise = d.valise; V.page = 'accueil'; }
      if (neuf) setTimeout(() => { confettis(couleursAccent(), 3600, 120); toast('💜', 'Votre carnet est prêt', 'Chaque semaine, un peu plus de vous.'); }, 250);
      else if (ancienNb !== p.nb) toast('💞', p.nb > 1 ? `${cap(motBebe(false))} !` : 'Un bébé', 'Le carnet s’adapte : congés, listes et espaces bébé.');
      majAccent();
    },
  });
};
ACTIONS['reset-sexe'] = async () => {
  if (!await confirmer('Effacer le sexe saisi ?', 'Le thème redeviendra neutre. Vous pourrez le saisir à nouveau.', 'Effacer', false)) return;
  actifs().forEach(b => { if (!b.naissance.date) { b.sexe = 'inconnu'; b.revele = false; } });
  majAccent(); fermer(); sauver();
};
/* ============================================================
   Supprimer le carnet et en commencer un nouveau
   ============================================================ */
function sauvegarderFichier() {
  telecharger(`naobaby-sauvegarde-${cle(auj())}.json`, JSON.stringify({ naobaby: 1, chiffre: false, data: S }), 'application/json');
  toast('💾', 'Carnet sauvegardé', 'Le fichier est dans vos téléchargements : 📂 permet de le rouvrir.');
}
function recommencer(garderProfil, garderArchives) {
  const p = P(), archives = garderArchives ? S.archives : [];
  try { localStorage.removeItem(CLE_STOCK); localStorage.removeItem('naobaby.accent'); localStorage.removeItem('naobaby.vue'); sessionStorage.removeItem('naobaby.masques'); } catch (e) {}
  S = completer(vierge());
  if (garderProfil) Object.assign(S.profil, { parent1: p.parent1, parent2: p.parent2, nomFamille: p.nomFamille, maternite: p.maternite, materniteTel: p.materniteTel, materniteAdresse: p.materniteAdresse });
  S.archives = archives;
  enregistrer();
  Object.assign(V, { page: 'accueil', semaine: null, bebe: null, ev: 'shower', invitPour: '', filtreListe: 'achats', filtrePlan: 'tout', filtreJ: 'tout', filtreP: 'tout' });
  V.sous = { grossesse: 'suivi', accouchement: 'preparer', bebe: 'naissance' };
  majAccent(); majMotifs(); rendre(); scrollTo({ top: 0 });
  toast('🌱', 'Un nouveau carnet vous attend', 'Chaque semaine, un peu plus de vous.');
  setTimeout(() => ACTIONS.profil(), 450);
}
/* Réinitialiser : NaoBaby redevient exactement ce qu'un nouvel utilisateur découvre.
   Rien n'est gardé — ni carnet, ni carnets gardés, ni thème, ni préférences. */
const CLES_OUTIL = [CLE_STOCK, 'naobaby.theme', 'naobaby.accent', 'naobaby.vue'];
ACTIONS.reinitialiser = () => {
  $$('.voile').forEach(v => v.remove());
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>♻️ Réinitialiser NaoBaby</h2>
    <p class="chapo">L’outil sera remis à zéro, comme pour un nouvel utilisateur : <b>tout</b> sera effacé de cet ordinateur —
      le carnet, les rendez-vous, le journal, les photos, les listes, les événements, l’espace bébé, les carnets gardés,
      le thème et les préférences.</p>
    ${aProfil() || S.archives.length ? `<div class="note-douce"><span class="em">💾</span><div><b>Conseil :</b> sauvegardez d’abord votre carnet — vous pourrez le rouvrir plus tard avec 💞 → 📂 Ouvrir un fichier.</div></div>` : ''}
    <div class="champ" style="margin-top:10px"><label for="ri-mot">Pour confirmer, écrivez <b>EFFACER</b></label><input type="text" id="ri-mot" autocomplete="off"></div>
    <div class="pied"><button class="btn" data-act="fermer">Annuler</button><div class="spacer"></div>
      ${aProfil() ? '<button class="btn" data-ri="avec">💾 Sauvegarder, puis réinitialiser</button>' : ''}
      <button class="btn plein danger" data-ri="sans">♻️ Réinitialiser</button></div></div>`);
  v.addEventListener('click', e => {
    const b = e.target.closest('[data-ri]'); if (!b) return;
    if (v.querySelector('#ri-mot').value.trim().toUpperCase() !== 'EFFACER') { toast('✏️', 'Écrivez EFFACER pour confirmer'); v.querySelector('#ri-mot').focus(); return; }
    if (b.dataset.ri === 'avec') sauvegarderFichier();
    setTimeout(() => {
      try { CLES_OUTIL.forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('naobaby.masques'); } catch (err) {}
      S = completer(vierge()); /* au cas où le rechargement serait bloqué */
      location.reload();
    }, b.dataset.ri === 'avec' ? 700 : 0);
  });
};
ACTIONS['nouveau-depart'] = () => {
  $$('.voile').forEach(v => v.remove());
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>🌱 Commencer un nouveau carnet</h2>
    <p class="chapo">Le carnet actuel — profil, rendez-vous, journal, listes, événements, invitations, bébé — sera <b>effacé de cet ordinateur</b>, et vous repartirez d’une page blanche.</p>
    <div class="note-douce"><span class="em">💾</span><div><b>Conseil :</b> gardez d’abord une sauvegarde. Vous pourrez la rouvrir plus tard avec 💞 → 📂 Ouvrir un fichier.</div></div>
    <label class="case" style="margin-top:6px"><input type="checkbox" id="nd-profil" ${P().parent1 || P().parent2 ? 'checked' : ''}> Garder nos prénoms, le nom de famille et la maternité</label>
    ${S.archives.length ? '<label class="case" style="margin-top:8px"><input type="checkbox" id="nd-archives" checked> Garder « Nos carnets gardés »</label>' : ''}
    <div class="pied"><button class="btn" data-act="fermer">Annuler</button><div class="spacer"></div>
      <button class="btn danger" data-nd="sans">Effacer sans sauvegarder</button>
      <button class="btn plein" data-nd="avec">💾 Sauvegarder, puis recommencer</button></div></div>`);
  v.addEventListener('click', async e => {
    const b = e.target.closest('[data-nd]'); if (!b) return;
    const garder = v.querySelector('#nd-profil').checked, arch = !!v.querySelector('#nd-archives')?.checked;
    if (b.dataset.nd === 'avec') sauvegarderFichier();
    else if (!await confirmer('Effacer sans sauvegarde ?', 'Le carnet actuel sera <b>définitivement</b> effacé de cet ordinateur. Cette action ne peut pas être annulée.', 'Effacer et recommencer')) return;
    fermer(v);
    setTimeout(() => recommencer(garder, arch), b.dataset.nd === 'avec' ? 600 : 0);
  });
};

/* ============================================================
   Partage avec le ou la partenaire, sauvegarde et chargement
   Le partage se fait par fichier, chiffré par mot de passe
   (AES-GCM, clé dérivée PBKDF2) : rien ne passe par un serveur.
   ============================================================ */
const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function cleDe(mdp, sel) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(mdp), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sel, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function chiffrer(obj, mdp) {
  const sel = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cleDe(mdp, sel), new TextEncoder().encode(JSON.stringify(obj)));
  return { naobaby: 1, chiffre: true, sel: b64(sel), iv: b64(iv), data: b64(data) };
}
async function dechiffrer(f, mdp) {
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(f.iv) }, await cleDe(mdp, deB64(f.sel)), deB64(f.data));
  return JSON.parse(new TextDecoder().decode(data));
}
function sansPrive(s) {
  const c = JSON.parse(JSON.stringify(s));
  c.rdv.forEach(r => { delete r.note; });
  c.journal = c.journal.filter(j => !j.prive);
  delete c.notifies;
  return c;
}
ACTIONS.partage = () => {
  const crypto_ok = !!(window.crypto && crypto.subtle);
  const v = fenetre(`<div class="fenetre" role="dialog" aria-modal="true"><h2>💞 Partager & sauvegarder</h2>
    <p class="chapo">NaoBaby n’envoie rien sur Internet : pour partager avec votre partenaire, vous créez un fichier protégé que vous lui envoyez vous-même.</p>
    <section class="carte" style="margin-bottom:12px">${carteT('💞', 'Partager avec mon ou ma partenaire')}
      <div class="champs">
        ${crypto_ok ? `<div class="champ large"><label for="mdp">Mot de passe du fichier</label><input type="password" id="mdp" placeholder="À lui donner de vive voix, pas dans le même message" autocomplete="new-password"></div>` : '<div class="champ large"><div class="note-douce"><span class="em">⚠️</span><div>Le chiffrement n’est pas disponible dans ce navigateur.</div></div></div>'}
        <div class="champ large"><label class="case"><input type="checkbox" id="avec-prive"> Inclure aussi mes notes de rendez-vous et souvenirs marqués « privé »</label></div>
      </div>
      <div class="pied" style="margin-top:12px"><button class="btn plein" data-x="partager">🔐 Créer le fichier à partager</button></div>
      <div class="avert">Votre partenaire l’ouvre dans NaoBaby avec « 📂 Ouvrir un fichier », puis saisit le mot de passe.</div></section>
    <section class="carte">${carteT('💾', 'Sauvegarde')}
      <p style="margin:0 0 10px;color:var(--ink-2)">Le carnet vit dans ce navigateur. Une sauvegarde régulière dans un fichier le met à l’abri (changement d’ordinateur, nettoyage du navigateur…).</p>
      <div class="choix"><button class="btn" data-x="sauver">💾 Sauvegarder tout le carnet</button><button class="btn" data-x="ouvrir">📂 Ouvrir un fichier</button></div></section>
    ${aProfil() ? `<section class="carte" style="margin-top:12px">${carteT('🌱', 'Nouveau carnet')}
      <p style="margin:0 0 10px;color:var(--ink-2)">Supprimer ce carnet de cet ordinateur pour en commencer un nouveau (vous pourrez le sauvegarder juste avant).</p>
      <button class="btn danger" data-act="nouveau-depart">🌱 Supprimer ce carnet et recommencer</button></section>` : ''}
    <section class="carte" style="margin-top:12px">${carteT('♻️', 'Réinitialiser l’outil')}
      <p style="margin:0 0 10px;color:var(--ink-2)">Tout effacer — carnet, carnets gardés, thème et préférences — et retrouver NaoBaby vierge, comme au tout premier jour.</p>
      <button class="btn danger" data-act="reinitialiser">♻️ Réinitialiser l’outil</button></section>
    <div class="pied"><div class="spacer"></div><button class="btn" data-act="fermer">Fermer</button></div></div>`);
  v.addEventListener('click', async e => {
    const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
    const date = cle(auj());
    if (x === 'sauver') sauvegarderFichier();
    if (x === 'ouvrir') { fermer(v); $('#fichier').value = ''; $('#fichier').click(); }
    if (x === 'partager') {
      const mdp = v.querySelector('#mdp')?.value || '';
      const donnees = v.querySelector('#avec-prive').checked ? S : sansPrive(S);
      if (crypto_ok && mdp.length < 6) { toast('🔐', 'Choisissez un mot de passe', 'Au moins 6 caractères, pour protéger vos informations.'); return; }
      const f = crypto_ok ? await chiffrer(donnees, mdp) : { naobaby: 1, chiffre: false, data: donnees };
      telecharger(`naobaby-partage-${date}.naobaby`, JSON.stringify(f), 'application/json');
      toast('💞', 'Fichier de partage créé', 'Envoyez-le à votre partenaire, et donnez-lui le mot de passe à part.');
      fermer(v);
    }
  });
};
$('#fichier').addEventListener('change', async () => {
  const f = $('#fichier').files[0]; if (!f) return;
  let j;
  try { j = JSON.parse(await f.text()); } catch (e) { toast('⚠️', 'Fichier illisible', 'Ce n’est pas un fichier NaoBaby.'); return; }
  if (!j || !j.naobaby) { toast('⚠️', 'Fichier non reconnu', 'Ce n’est pas un fichier NaoBaby.'); return; }
  const appliquer = async data => {
    if (!data || !data.profil) { toast('⚠️', 'Fichier incomplet'); return; }
    if (aProfil() && !await confirmer('Remplacer le carnet ?', 'Le carnet de cet ordinateur sera remplacé par celui du fichier. <b>Conseil :</b> sauvegardez d’abord le carnet actuel si vous voulez le garder.', 'Remplacer')) return;
    S = completer(data); enregistrer(); majAccent(); majMotifs(); V.page = 'accueil'; rendre();
    toast('📂', 'Carnet chargé', parents());
  };
  if (!j.chiffre) return appliquer(j.data);
  const v = fenetre(`<form class="fenetre etroite" role="dialog" aria-modal="true"><h2>🔐 Fichier protégé</h2>
    <p class="chapo">Saisissez le mot de passe choisi lors du partage.</p>
    <div class="champ"><input type="password" id="mdp-in" autocomplete="current-password"></div>
    <div class="pied"><div class="spacer"></div><button type="button" class="btn" data-act="fermer">Annuler</button><button class="btn plein">Ouvrir</button></div></form>`);
  v.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    try { const d = await dechiffrer(j, v.querySelector('#mdp-in').value); fermer(v); appliquer(d); }
    catch (err) { toast('🔐', 'Mot de passe incorrect'); }
  });
});

/* ============================================================
   Démarrage
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const f = ACTIONS[el.dataset.act];
  if (!f) return;
  if (el.tagName !== 'INPUT') e.preventDefault();
  f(el, e);
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); ACTIONS.partage(); }
});
/* l'entrée : l'étoile tombe dans le berceau, les perles s'allument jusqu'à la semaine du jour */
function entree() {
  const intro = $('#intro');
  const finir = () => { if (intro.isConnected) intro.remove(); document.body.classList.remove('entree'); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
  const g = aProfil() && P().mode !== 'perte' && !estNe() ? etatGrossesse() : null;
  const allumees = P().mode === 'perte' ? 0 : g ? Math.min(40, g.semaine) : 40;
  $('#introAnneau').innerHTML = Array.from({ length: 40 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 40;
    return `<circle cx="${(140 + Math.cos(a) * 124).toFixed(1)}" cy="${(140 + Math.sin(a) * 124).toFixed(1)}" r="3.6" style="--i:${i}"
      class="${i < allumees ? 'on' : ''} ${g && i === allumees - 1 ? 'now' : ''}"/>`;
  }).join('') + '<circle class="tour" cx="140" cy="140" r="124" pathLength="100"/>';
  /* la gerbe d'étincelles à l'arrivée de l'étoile */
  $('#introGerbe').innerHTML = Array.from({ length: 12 }, (_, i) =>
    `<span class="part" style="--a:${(i * 30 + (i % 2) * 12).toFixed(0)}deg;--d:${(46 + (i % 3) * 14)}px;animation-delay:${(1.38 + (i % 4) * .03).toFixed(2)}s"></span>`).join('');
  /* le ciel de l'entrée : des étoiles qui s'éveillent une à une, et quelques nuages qui passent */
  let ciel = '';
  for (let i = 0; i < 46; i++) {
    const t = Math.random() < .15 ? 3 : 1 + Math.random() * 1.6;
    ciel += `<b style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;width:${t.toFixed(1)}px;height:${t.toFixed(1)}px;animation-delay:${(Math.random() * 1.8).toFixed(2)}s;animation-duration:${(2 + Math.random() * 2.5).toFixed(1)}s"></b>`;
  }
  const nuage = (bas, gauche, larg, dx, o, t) => `<svg class="nuage-i" viewBox="0 0 64 36" style="bottom:${bas}%;left:${gauche}%;width:${larg}px;--dx:${dx}px;--o:${o};--t:${t}s"><path d="M16 34h34a12 12 0 0 0 1-24A16 16 0 0 0 20 13 11 11 0 0 0 16 34z" fill="currentColor"/></svg>`;
  $('#introCiel').innerHTML = ciel + nuage(-2, 2, 150, 120, .07, 9) + nuage(3, 76, 110, -100, .05, 10) + nuage(-4, 44, 90, 70, .04, 11);
  $('#introNom').innerHTML = [...'NaoBaby'].map((c, i) => `<span class="${i > 2 ? 'acc' : ''}" style="--i:${i}">${c}</span>`).join('');
  const phrase = $('#introPhrase');
  if (P().mode === 'perte') phrase.innerHTML = 'Avec douceur, <b>à votre rythme.</b>';
  else if (estNe()) phrase.innerHTML = `Bienvenue, <b>${esc(nes().map(b => nomBebe(b)).join(' & '))}</b> 💜`;
  else if (g) phrase.innerHTML = `Semaine ${g.semaine} sur 40 — <b>un peu plus de vous.</b>`;
  /* le final : le croissant et son étoile s'envolent se poser dans le logo de l'en-tête */
  const envol = () => {
    if (!intro.isConnected || intro.dataset.passe) return;
    const lune = intro.querySelector('.lune'), logo = $('.marque svg');
    if (!lune || !logo || !logo.animate) return;
    lune.style.animation = 'none';                     /* on arrête le bercement pour mesurer juste */
    const r = lune.getBoundingClientRect(), L = logo.getBoundingClientRect();
    if (!L.width || !r.width) return;
    const vol = lune.cloneNode(true);
    vol.className = 'lune-vol';
    vol.querySelectorAll('.onde,.eclat,#introGerbe,.traine').forEach(e => e.remove());
    vol.querySelectorAll('*').forEach(e => { e.style.animation = 'none'; });
    vol.querySelector('.etoile-bb').style.cssText = 'position:absolute;left:35.3%;top:28.3%;width:29.3%;height:36.7%';
    vol.querySelector('.etoile-bb svg').style.cssText = 'width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 8px #fff)';
    vol.querySelector('svg.croissant').style.cssText = 'width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 14px var(--acc-lueur))';
    Object.assign(vol.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
      margin: '0', zIndex: '250', transformOrigin: '0 0' });
    document.body.append(vol);
    lune.style.visibility = 'hidden';
    /* le croissant occupe x 10→30 et y −1→15 de son dessin ; dans le logo (40 unités), il est au même endroit */
    const u = L.width / 40, s = (20 * u) / r.width;
    const dx = L.left + 10 * u - r.left, dy = L.top - u - r.top;
    const a = vol.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate(${dx * .42}px, ${dy * .42 - 70}px) scale(${(1 + s) / 2}) rotate(-8deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 1, offset: .86 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
    ], { duration: 950, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
    setTimeout(() => vol.remove(), 1250);              /* filet de sécurité si l'onglet ne dessine pas */
    a.onfinish = () => {
      vol.remove();
      logo.animate([{ transform: 'none' }, { transform: 'scale(1.2) rotate(-8deg)', boxShadow: '0 0 40px 6px var(--acc-lueur)' }, { transform: 'none' }],
        { duration: 650, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    };
  };
  setTimeout(envol, 3200);
  const passer = () => {
    if (!intro.isConnected) return;
    intro.dataset.passe = '1';
    intro.style.animation = 'introSort .4s ease forwards';
    $('.shell').style.animation = 'emerge .6s ease both';
    setTimeout(finir, 420);
  };
  intro.addEventListener('click', passer);
  addEventListener('keydown', function k(e) { if (['Escape', 'Enter', ' '].includes(e.key) && intro.isConnected) { e.preventDefault(); passer(); } if (!intro.isConnected) removeEventListener('keydown', k); });
  intro.addEventListener('animationend', e => { if (e.animationName === 'introSort') finir(); });
  setTimeout(finir, 4400);
}

charger();
try {
  const t = JSON.parse(localStorage.getItem('naobaby.vue') || 'null');
  if (t && PAGES[t.page]) { V.page = t.page; Object.assign(V.sous, t.sous || {}); if (t.ev) V.ev = t.ev; }
} catch (e) {}
appliquerTheme(document.documentElement.dataset.theme || 'dark');
majAccent();
dessinerFond();
rendre();
entree();
verifierNotifs();
setInterval(() => { verifierNotifs(); rendrePill(); }, 10 * 60 * 1000);
