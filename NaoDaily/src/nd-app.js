/* ============================================================
   NaoDaily — les actions : navigation, formulaires, liens entre les
   espaces, partage, impression, sauvegarde et décor animé.
   ============================================================ */
'use strict';
const ACT = {};
Object.assign(ACT, ACT_REC, ACT_NUT);   /* la page recette et les allergies (nd-recettes.js) */
function maj() { const y = scrollY; sauver(); rendre(); scrollTo(0, y); }
function aller(v, sous) {
  U.vue = v;
  if (sous && v === 'menus') U.menus = sous;
  if (sous && v === 'cadeaux') U.cadeaux = sous;
  if (v !== 'listes') U.liste = null;
  U.recette = null;
  if (location.hash.slice(1) !== v) history.replaceState(null, '', '#' + v);
  rendre(); scrollTo(0, 0);
}
const momentSelonHeure = () => { const h = new Date().getHours(); return h < 10 ? 'petitdej' : h < 15 ? 'dejeuner' : h < 17 ? 'collation' : 'diner'; };
const majuscule = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/* ============================================================
   NAVIGATION
   ============================================================ */
ACT['vue'] = (el, e) => { e.preventDefault(); aller(el.dataset.vue); };
ACT['aller-menus'] = el => aller('menus', el.dataset.sous);
ACT['aller-cadeaux'] = el => aller('cadeaux', el.dataset.sous);
ACT['sous-menus'] = el => { U.menus = el.dataset.s; U.recette = null; rendre(); };
ACT['sous-cadeaux'] = el => { U.cadeaux = el.dataset.s; rendre(); };

/* « Ajouter » : un seul bouton, quatre chemins */
ACT['ajouter'] = () => {
  ouvrirModale(`<h3 id="modaleTitre"><span>＋</span>Que voulez-vous ajouter ?</h3><p class="sous">Choisissez, on s’occupe du rangement.</p>
    <div class="modeles">
      <button type="button" class="modele" data-choix="nouvelle-tache"><span class="e">✓</span>Une tâche</button>
      <button type="button" class="modele" data-choix="nouvel-article"><span class="e">🛒</span>Un article de courses</button>
      <button type="button" class="modele" data-choix="planifier"><span class="e">🍽️</span>Un repas</button>
      <button type="button" class="modele" data-choix="nouveau-cadeau"><span class="e">🎁</span>Une idée cadeau</button>
      <button type="button" class="modele" data-choix="nouvelle-liste"><span class="e">📝</span>Une liste</button>
      <button type="button" class="modele" data-choix="nouveau-rappel"><span class="e">⏰</span>Un rappel</button>
      <button type="button" class="modele" data-choix="nouvelle-personne"><span class="e">👤</span>Un proche</button>
      <button type="button" class="modele" data-choix="nouvelle-recette"><span class="e">📖</span>Une recette</button>
      <button type="button" class="modele" data-choix="nouvelle-idee"><span class="e">💡</span>Une idée repas</button>
    </div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Fermer</button></div></div>`, fen => {
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    $$('[data-choix]', fen).forEach(b => b.addEventListener('click', () => { const k = b.dataset.choix; fermerModale(); ACT[k]({ dataset: {} }, { preventDefault() {} }); }));
  });
};

/* ============================================================
   MES LISTES
   ============================================================ */
function formListe(l, prefill) {
  const neuve = !l, v = l || Object.assign({ nom: '', emoji: '📝', modele: 'libre', partage: '', favori: false }, prefill || {});
  const m = modele(v.modele);
  formulaire({
    titre: neuve ? 'Créer une liste' : 'Modifier la liste', emoji: v.emoji || '📝',
    sous: neuve ? 'Donnez-lui un nom et une petite image : elle sera plus facile à retrouver.' : '',
    valeurs: Object.assign({}, v, { suggestions: true }),
    champs: [
      { k: 'nom', l: 'Nom de la liste', req: true, large: true, ph: 'Ex. Courses du samedi, Valise Bretagne…' },
      { k: 'emoji', l: 'Son image', t: 'emoji', o: [v.emoji || '📝'].concat(EMOJIS_LISTE.filter(x => x !== (v.emoji || '📝'))) },
      { k: 'modele', l: 'Type de liste', t: 'select', o: MODELES.map(x => [x[0], x[1] + ' ' + x[2]]) },
      { k: 'partage', l: 'Partagée', t: 'select', o: PARTAGES },
      { k: 'favori', l: '⭐ Mettre en favori (raccourci sur « Aujourd’hui »)', t: 'case' },
      ...(neuve && m[3].length ? [{ k: 'suggestions', l: `Ajouter les ${m[3].length} suggestions du modèle (${m[3].slice(0, 2).join(', ')}…)`, t: 'case' }] : [])
    ],
    bouton: neuve ? 'Créer la liste' : 'Enregistrer',
    enregistrer: x => {
      if (neuve) {
        const nl = { id: uid(), nom: x.nom, emoji: x.emoji, modele: x.modele, partage: x.partage, favori: x.favori, archivee: false, creeLe: auj(),
          elements: x.suggestions ? modele(x.modele)[3].map(t => ({ id: uid(), texte: t, fait: false, priorite: 'normale' })) : [] };
        S.listes.unshift(nl); U.liste = nl.id; U.vue = 'listes'; history.replaceState(null, '', '#listes');
        sauver(); rendre(); scrollTo(0, 0); toast(`Liste « ${x.nom} » créée ✨`);
      } else { Object.assign(l, { nom: x.nom, emoji: x.emoji, modele: x.modele, partage: x.partage, favori: x.favori }); maj(); }
    }
  });
}
ACT['nouvelle-liste'] = () => {
  ouvrirModale(`<h3 id="modaleTitre"><span>📝</span>Créer une liste</h3><p class="sous">Partez d’un modèle, ou d’une page blanche.</p>
    <div class="modeles">${MODELES.map(m => `<button type="button" class="modele" data-m="${m[0]}"><span class="e">${m[1]}</span>${esc(m[2])}</button>`).join('')}</div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button></div></div>`, fen => {
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    $$('[data-m]', fen).forEach(b => b.addEventListener('click', () => { const m = modele(b.dataset.m); fermerModale(); formListe(null, { modele: m[0], emoji: m[1], nom: m[0] === 'libre' ? '' : m[2] }); }));
  });
};
ACT['depuis-modele'] = el => { const m = modele(el.dataset.m); formListe(null, { modele: m[0], emoji: m[1], nom: m[0] === 'libre' ? '' : m[2] }); };
ACT['ouvrir-liste'] = el => { U.liste = el.dataset.l; U.vue = 'listes'; history.replaceState(null, '', '#listes'); rendre(); scrollTo(0, 0); };
ACT['fermer-liste'] = () => { U.liste = null; rendre(); };
ACT['filtre-listes'] = el => { U.filtre = el.dataset.f; rendre(); };
ACT['fav-liste'] = el => { const l = trouver(S.listes, el.dataset.l); l.favori = !l.favori; maj(); toast(l.favori ? `⭐ « ${l.nom} » est dans vos favoris` : 'Retirée des favoris'); };
ACT['modifier-liste'] = el => formListe(trouver(S.listes, el.dataset.l));
ACT['dupliquer-liste'] = el => {
  const l = trouver(S.listes, el.dataset.l), c = copie(l);
  c.id = uid(); c.nom = l.nom + ' (copie)'; c.archivee = false; c.systeme = undefined; c.creeLe = auj();
  c.elements.forEach(e => { e.id = uid(); e.fait = false; delete e.faitLe; });
  S.listes.splice(S.listes.indexOf(l) + 1, 0, c); U.liste = c.id; maj(); toast('Liste dupliquée, tout est décoché ⧉');
};
ACT['archiver-liste'] = el => {
  const l = trouver(S.listes, el.dataset.l); l.archivee = !l.archivee;
  if (l.archivee) U.liste = null;
  maj(); toast(l.archivee ? `« ${l.nom} » rangée dans les archives 🗄️` : 'Liste sortie des archives');
};
ACT['suppr-liste'] = async el => {
  const l = trouver(S.listes, el.dataset.l);
  if (!await confirmer(`Supprimer « ${l.nom} » ?`, `${pluriel(l.elements.length, 'élément')} seront supprimés. Vous pourrez annuler juste après.`)) return;
  instantane(); retirer(S.listes, l.id); U.liste = null; maj(); toast('Liste supprimée', { annuler: true });
};
ACT['decocher-tout'] = el => { const l = trouver(S.listes, el.dataset.l); instantane(); l.elements.forEach(e => { e.fait = false; delete e.faitLe; }); maj(); toast('Tout est décoché', { annuler: true }); };
ACT['liste-vers-courses'] = el => {
  const l = trouver(S.listes, el.dataset.l); let n = 0;
  l.elements.filter(e => !e.fait).forEach(e => { const a = analyserArticle(e.texte); if (ajouterCourse(a.nom, { qte: a.qte ?? (e.quantite ? nombre(e.quantite) || '' : ''), unite: a.unite })) n++; });
  maj(); toast(`${pluriel(n, 'article envoyé', 'articles envoyés')} vers Ma liste de courses 🛒`, { action: ['Voir', () => aller('menus', 'courses')] });
};

/* les éléments */
function formElement(l, e) {
  const neuf = !e;
  formulaire({
    titre: neuf ? 'Ajouter un élément' : 'Modifier', emoji: l.emoji || '📝', sous: 'Dans « ' + l.nom + ' »',
    valeurs: e || { priorite: 'normale' },
    champs: [
      { k: 'texte', l: 'Quoi ?', req: true, large: true },
      { k: 'quantite', l: 'Quantité', ph: 'Ex. 2, 500 g…' },
      { k: 'priorite', l: 'Priorité', t: 'select', o: PRIORITES },
      { k: 'date', l: 'Pour quand ?', t: 'date' },
      { k: 'rappel', l: '⏰ Me le rappeler dans « À ne pas oublier »', t: 'case', si: v => !!v.date },
      { k: 'note', l: 'Note', t: 'textarea', ph: 'Un détail, un lien, une idée…' }
    ],
    supprimer: neuf ? null : () => { instantane(); retirer(l.elements, e.id); maj(); toast('Élément supprimé', { annuler: true }); },
    enregistrer: x => {
      if (!x.date) x.rappel = false;
      if (neuf) l.elements.push(Object.assign({ id: uid(), fait: false }, x)); else Object.assign(e, x);
      maj();
    }
  });
}
function ajouterTache(texte, listeId, extra) {
  let l = listeId && listeId !== '__jour' ? trouver(S.listes, listeId) : null;
  if (!l) {
    l = S.listes.find(x => x.modele === 'jour' && !x.archivee);
    if (!l) { l = { id: uid(), nom: 'Tâches du jour', emoji: '☀️', modele: 'jour', partage: '', favori: true, archivee: false, creeLe: auj(), elements: [] }; S.listes.unshift(l); }
  }
  l.elements.push(Object.assign({ id: uid(), texte, fait: false, priorite: 'normale' }, extra || {}));
  return l;
}
ACT['nouvelle-tache'] = () => {
  const ls = listesActives().filter(l => !MODELES_HORS_TACHES.includes(l.modele) && !l.systeme);
  const jour = ls.find(l => l.modele === 'jour');
  formulaire({
    titre: 'Ajouter une tâche', emoji: '✓', sous: 'Elle apparaîtra dans « Mes tâches prioritaires » le jour venu.',
    valeurs: { liste: jour ? jour.id : '__jour', priorite: 'normale', date: auj() },
    champs: [
      { k: 'texte', l: 'La tâche', req: true, large: true, ph: 'Ex. Appeler le médecin, rendre le livre…' },
      { k: 'liste', l: 'Dans la liste', t: 'select', o: (jour ? [] : [['__jour', '☀️ Tâches du jour (nouvelle)']]).concat(ls.map(l => [l.id, (l.emoji || '📝') + ' ' + l.nom])) },
      { k: 'priorite', l: 'Priorité', t: 'select', o: PRIORITES },
      { k: 'date', l: 'Pour quand ?', t: 'date' },
      { k: 'rappel', l: '⏰ Me le rappeler dans « À ne pas oublier »', t: 'case', si: v => !!v.date },
      { k: 'note', l: 'Note', t: 'textarea' }
    ],
    bouton: 'Ajouter la tâche',
    enregistrer: x => { const l = ajouterTache(x.texte, x.liste, { priorite: x.priorite, date: x.date, rappel: !!(x.date && x.rappel), note: x.note }); maj(); toast(`Ajoutée à « ${l.nom} » ✓`); }
  });
};
ACT['nouvel-el'] = el => formElement(trouver(S.listes, el.dataset.l));
ACT['modifier-el'] = el => { const l = trouver(S.listes, el.dataset.l); formElement(l, trouver(l.elements, el.dataset.e)); };
ACT['suppr-el'] = el => { const l = trouver(S.listes, el.dataset.l); instantane(); retirer(l.elements, el.dataset.e); maj(); toast('Élément supprimé', { annuler: true }); };
ACT['cocher-el'] = el => {
  const l = trouver(S.listes, el.dataset.l), e = l && trouver(l.elements, el.dataset.e); if (!e) return;
  e.fait = !e.fait;
  if (e.fait) {
    e.faitLe = auj();
    const r = el.getBoundingClientRect(); eclat(r.left + r.width / 2, r.top + r.height / 2);
    /* un cadeau coché dans « À acheter » passe à « Acheté » */
    const c = e.cadeauId && trouver(S.cadeaux, e.cadeauId);
    if (c && rangStatut(c.statut) < 2) { c.statut = 'achete'; c.dateAchat = auj(); toast(`🛍️ « ${c.titre} » est marqué acheté`); }
  } else delete e.faitLe;
  maj();
  const av = avancement(l);
  if (e.fait && av.n > 1 && av.pct === 100 && !l.systeme) toast(`🎉 « ${l.nom} » est terminée !`, { action: ['Archiver', () => { l.archivee = true; if (U.liste === l.id) U.liste = null; maj(); }] });
};

/* les rappels */
function formRappel(prefill, apres) {
  formulaire({
    titre: 'Créer un rappel', emoji: '⏰', sous: 'Il apparaîtra dans « À ne pas oublier » à partir de deux jours avant.',
    valeurs: Object.assign({ date: ajouteJours(auj(), 1) }, prefill || {}),
    champs: [
      { k: 'texte', l: 'De quoi faut-il se souvenir ?', req: true, large: true },
      { k: 'date', l: 'Quel jour ?', t: 'date', req: true },
      ...(apres ? [{ k: 'retirer', l: apres.libelle, t: 'case' }] : [])
    ],
    bouton: 'Créer le rappel',
    enregistrer: x => {
      S.rappels.push({ id: uid(), texte: x.texte, date: x.date, fait: false, origine: (prefill && prefill.origine) || '' });
      if (apres && x.retirer) apres.faire();
      maj(); toast(`⏰ Rappel prévu ${quand(x.date)}`);
    }
  });
}
ACT['nouveau-rappel'] = () => formRappel();
ACT['rappel-el'] = el => {
  const l = trouver(S.listes, el.dataset.l), e = trouver(l.elements, el.dataset.e);
  formRappel({ texte: e.texte, date: e.date && e.date >= auj() ? e.date : ajouteJours(auj(), 1), origine: l.nom }, { libelle: 'Retirer ensuite cet élément de la liste', faire: () => retirer(l.elements, e.id) });
};
ACT['rappel-course'] = el => {
  const c = trouver(S.courses, el.dataset.c);
  formRappel({ texte: 'Acheter : ' + c.nom + (qteTexte(c) ? ' (' + qteTexte(c) + ')' : ''), origine: 'courses' }, { libelle: 'Retirer ensuite l’article de la liste de courses', faire: () => retirer(S.courses, c.id) });
};
ACT['rappel-fait'] = el => { const r = trouver(S.rappels, el.dataset.r); r.fait = !r.fait; if (r.fait) { const b = el.getBoundingClientRect(); eclat(b.left + b.width / 2, b.top + b.height / 2); } maj(); if (U.tousRappels) ACT['tous-rappels'](); };
ACT['tous-rappels'] = () => {
  U.tousRappels = true;
  const rs = S.rappels.slice().sort((a, b) => (a.fait - b.fait) || a.date.localeCompare(b.date));
  ouvrirModale(`<h3 id="modaleTitre"><span>⏰</span>Mes rappels</h3><p class="sous">${pluriel(rs.filter(r => !r.fait).length, 'rappel actif', 'rappels actifs')}.</p>
    <div class="oubli">${rs.map(r => `<div class="rappel${!r.fait && r.date < auj() ? ' retard' : ''}" style="${r.fait ? 'opacity:.55' : ''}"><span class="e">${r.fait ? '✅' : '⏰'}</span><div class="t">${esc(r.texte)}<small>${esc(fmtJour(r.date, true))}${r.origine ? ' · ' + esc(r.origine) : ''}</small></div>
      <button type="button" class="btn-rond" data-act="rappel-fait" data-r="${r.id}" title="${r.fait ? 'Réactiver' : 'C’est fait'}">${r.fait ? '↺' : '✓'}</button><button type="button" class="btn-rond" data-suppr="${r.id}" title="Supprimer" aria-label="Supprimer">🗑</button></div>`).join('') || vide('Aucun rappel.')}</div>
    <div class="pied-fen">${rs.some(r => r.fait) ? '<button type="button" class="btn fin" data-f="nettoyer">🧹 Effacer les rappels faits</button>' : ''}<div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button><button type="button" class="btn plein" data-f="nouveau">＋ Nouveau rappel</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', () => { U.tousRappels = false; fermerModale(); });
    fen.querySelector('[data-f="nouveau"]').addEventListener('click', () => { U.tousRappels = false; fermerModale(); formRappel(); });
    const n = fen.querySelector('[data-f="nettoyer"]'); if (n) n.addEventListener('click', () => { S.rappels = S.rappels.filter(r => !r.fait); maj(); ACT['tous-rappels'](); });
    $$('[data-suppr]', fen).forEach(b => b.addEventListener('click', () => { retirer(S.rappels, b.dataset.suppr); maj(); ACT['tous-rappels'](); }));
  });
  fermetureModale = () => { U.tousRappels = false; };
};

/* ============================================================
   COURSES
   ============================================================ */
function analyserArticle(t) {
  t = String(t || '').trim();
  const m = t.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|gr|l|cl|ml|x|pcs?|pièces?|paquets?|boîtes?|bouteilles?|sachets?|tranches?|pots?|bottes?|packs?)?\.?\s+(?:de\s+|d['’]\s*)?(.+)$/i);
  if (m) return { nom: majuscule(m[3].trim()), qte: nombre(m[1]), unite: (m[2] || '').toLowerCase().replace(/^x$/, '').replace(/^gr$/, 'g') };
  return { nom: majuscule(t) };
}
function formCourse(c) {
  const neuf = !c;
  formulaire({
    titre: neuf ? 'Ajouter un article' : 'Modifier l’article', emoji: '🛒', sous: neuf ? 'Le rayon est deviné tout seul — vous pouvez le changer.' : '',
    valeurs: c || { rayon: '' },
    champs: [
      { k: 'nom', l: 'Article', req: true, large: true, ph: 'Ex. Pommes, lessive, café…', liste: S.habituels.map(h => h.nom) },
      { k: 'qte', l: 'Quantité', t: 'number' },
      { k: 'unite', l: 'Unité', ph: 'kg, l, paquet…', liste: ['g', 'kg', 'ml', 'cl', 'l', 'pièce(s)', 'paquet', 'boîte', 'bouteille', 'sachet', 'tranche(s)', 'pot'] },
      { k: 'rayon', l: 'Rayon', t: 'select', o: [['', '✨ Deviner tout seul']].concat(RAYONS.map(r => [r[0], r[1] + ' ' + r[2]])) },
      { k: 'prix', l: 'Prix estimé (€)', t: 'number', aide: 'Facultatif, pour le budget indicatif.' },
      { k: 'note', l: 'Note', large: true, ph: 'Marque, variété, magasin…' }
    ],
    supprimer: neuf ? null : () => { instantane(); retirer(S.courses, c.id); maj(); toast('Article retiré', { annuler: true }); },
    enregistrer: x => {
      if (neuf) { const n = ajouterCourse(x.nom, { qte: x.qte, unite: x.unite, rayon: x.rayon || '', prix: x.prix, note: x.note }); maj(); toast(`${n.nom} → ${rayon(n.rayon)[1]} ${rayon(n.rayon)[2]}`); }
      else { Object.assign(c, x); if (!c.rayon) c.rayon = deviner(c.nom); maj(); }
    }
  });
}
ACT['nouvel-article'] = () => formCourse();
ACT['modifier-course'] = el => formCourse(trouver(S.courses, el.dataset.c));
ACT['cocher-course'] = el => {
  const c = trouver(S.courses, el.dataset.c); c.fait = !c.fait;
  if (c.fait) { const r = el.getBoundingClientRect(); eclat(r.left + r.width / 2, r.top + r.height / 2); }
  maj();
  if (c.fait && !coursesRestantes().length) toast('🧺 Tout est dans le panier. Bravo !');
};
ACT['suppr-course'] = el => { instantane(); retirer(S.courses, el.dataset.c); maj(); toast('Article retiré', { annuler: true }); };
ACT['vider-panier'] = () => { instantane(); S.courses = S.courses.filter(c => !c.fait); maj(); toast('Panier vidé 🧹', { annuler: true }); };
ACT['habituel-course'] = el => {
  const c = trouver(S.courses, el.dataset.c), k = sansAccent(c.nom), i = S.habituels.findIndex(h => sansAccent(h.nom) === k);
  if (i >= 0) { S.habituels.splice(i, 1); toast('Retiré des produits habituels'); }
  else { S.habituels.push({ id: uid(), nom: c.nom, rayon: c.rayon, prix: c.prix || '' }); toast(`⭐ ${c.nom} fait partie de vos produits habituels`); }
  maj();
};
ACT['ajouter-habituel'] = el => {
  const h = trouver(S.habituels, el.dataset.h); if (!h) return;
  ajouterCourse(h.nom, { rayon: h.rayon, prix: h.prix });
  maj();
  const b = $(`[data-act="ajouter-habituel"][data-h="${h.id}"]`); if (b) b.classList.add('ajoutee');
  toast(`${h.nom} ajouté aux courses 🛒`);
};
ACT['gerer-habituels'] = () => {
  const dessiner = () => ouvrirModale(`<h3 id="modaleTitre"><span>🧺</span>Mes produits habituels</h3><p class="sous">Ceux qu’on rachète sans cesse : lait, pain, café, lessive, papier toilette…</p>
    <form class="ajout-rapide" id="formHab"><input class="saisie" name="t" placeholder="Ajouter un produit habituel" autocomplete="off"><button class="btn plein" type="submit">Ajouter</button></form>
    <div style="margin-top:12px">${S.habituels.map(h => `<div class="ligne"><span style="font-size:18px">${rayon(h.rayon)[1]}</span><div class="corps"><div class="texte">${esc(h.nom)}</div><div class="meta">${rayon(h.rayon)[2]}${nombre(h.prix) ? ' · ≈ ' + argent(nombre(h.prix)) : ''}</div></div><button type="button" class="btn-rond" data-retire="${h.id}" aria-label="Retirer">✕</button></div>`).join('') || vide('Aucun produit habituel.')}</div>
    ${!S.habituels.length ? '<div class="actions" style="margin-top:10px"><button type="button" class="btn petit lavande" data-f="base">✨ Proposer les classiques</button></div>' : ''}
    <div class="pied-fen"><div class="droite"><button type="button" class="btn plein" data-f="fermer">Terminé</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    const base = fen.querySelector('[data-f="base"]');
    if (base) base.addEventListener('click', () => { ['Lait', 'Pain', 'Café', 'Œufs', 'Beurre', 'Lessive', 'Papier toilette', 'Liquide vaisselle'].forEach(n => S.habituels.push({ id: uid(), nom: n, rayon: deviner(n), prix: '' })); maj(); dessiner(); });
    fen.querySelector('#formHab').addEventListener('submit', ev => { ev.preventDefault(); const t = ev.target.t.value.trim(); if (!t) return; S.habituels.push({ id: uid(), nom: majuscule(t), rayon: deviner(t), prix: '' }); maj(); dessiner(); });
    $$('[data-retire]', fen).forEach(b => b.addEventListener('click', () => { retirer(S.habituels, b.dataset.retire); maj(); dessiner(); }));
  });
  dessiner();
};
function texteCourses() {
  const r = coursesRestantes(), b = budgetCourses();
  return `🛒 Ma liste de courses — ${fmtJour(auj(), true)}\n` + RAYONS.map(ry => { const cs = r.filter(c => c.rayon === ry[0]); return cs.length ? `\n${ry[1]} ${ry[2].toUpperCase()}\n` + cs.map(c => `☐ ${c.nom}${qteTexte(c) ? ' — ' + qteTexte(c) : ''}`).join('\n') : ''; }).join('\n').replace(/\n{3,}/g, '\n\n')
    + `\n\nBudget estimé : ≈ ${argent(b.total)} (indicatif)\n— NaoDaily`;
}
ACT['imprimer-courses'] = () => {
  const r = coursesRestantes(), b = budgetCourses();
  if (!r.length) { toast('La liste de courses est vide.', { alerte: true }); return; }
  $('#impression').innerHTML = `<h1>Ma liste de courses</h1><div class="s">${esc(fmtJour(auj(), true))} · ${pluriel(r.length, 'article')} · budget estimé ≈ ${argent(b.total)} (indicatif)</div>
    <div class="cols">${RAYONS.map(ry => { const cs = r.filter(c => c.rayon === ry[0]); return cs.length ? `<div class="r"><h2>${ry[1]} ${esc(ry[2])}</h2>${cs.map(c => `<div class="i">${esc(c.nom)}${qteTexte(c) ? ' — ' + esc(qteTexte(c)) : ''}</div>`).join('')}</div>` : ''; }).join('')}</div>`;
  window.print();
};
ACT['exporter-courses'] = () => {
  if (!coursesRestantes().length) { toast('La liste de courses est vide.', { alerte: true }); return; }
  telecharger(`NaoDaily-courses-${auj()}.txt`, texteCourses()); toast('Liste exportée ⬇️');
};

/* ============================================================
   PARTAGER avec un proche : un texte à envoyer, ou un fichier à ouvrir
   dans son propre NaoDaily (📂). Rien ne passe par internet.
   ============================================================ */
function partager(o) {
  ouvrirModale(`<h3 id="modaleTitre"><span>👥</span>${esc(o.titre)}</h3>
    <p class="sous">Deux façons de partager, sans compte : un <b>texte</b> à coller dans un message, ou un <b>fichier</b> que votre proche ouvre avec 📂 dans son NaoDaily.</p>
    ${o.liste ? `<div class="champ" style="margin-bottom:14px"><label for="selPartage">Cette liste est partagée</label><select id="selPartage">${PARTAGES.map(([k, t]) => `<option value="${k}"${o.liste.partage === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>` : ''}
    <div class="champ"><label for="apercuPartage">Aperçu du texte</label><textarea id="apercuPartage" readonly style="min-height:170px;font-size:13px">${esc(o.texte)}</textarea></div>
    <div class="pied-fen"><button type="button" class="btn" data-f="fichier">📄 Télécharger le fichier</button><div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button><button type="button" class="btn plein" data-f="copier">📋 Copier le texte</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    fen.querySelector('[data-f="copier"]').addEventListener('click', () => copierTexte(o.texte));
    fen.querySelector('[data-f="fichier"]').addEventListener('click', () => {
      telecharger(o.nomFichier, JSON.stringify({ naodaily: 'partage', type: o.type, date: new Date().toISOString(), contenu: o.contenu }, null, 1), 'application/json');
      toast('Fichier de partage téléchargé 📄 — envoyez-le à votre proche.');
    });
    const sel = fen.querySelector('#selPartage');
    if (sel) sel.addEventListener('change', () => { o.liste.partage = sel.value; maj(); toast(sel.value ? `Liste marquée ${partageLib(sel.value)}` : 'Liste redevenue personnelle'); });
  });
}
const nomFichierSur = s => sansAccent(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'liste';
ACT['partager-liste'] = el => {
  const l = trouver(S.listes, el.dataset.l);
  const texte = `${l.emoji || '📝'} ${l.nom}\n\n` + l.elements.map(e => `${e.fait ? '☑' : '☐'} ${e.texte}${e.quantite ? ' (' + e.quantite + ')' : ''}${e.date ? ' — ' + fmtJour(e.date) : ''}`).join('\n') + '\n\n— NaoDaily';
  partager({ titre: 'Partager « ' + l.nom + ' »', texte, type: 'liste', contenu: l, nomFichier: `NaoDaily-${nomFichierSur(l.nom)}.naodaily`, liste: l });
};
ACT['partager-courses'] = () => {
  if (!coursesRestantes().length) { toast('La liste de courses est vide.', { alerte: true }); return; }
  partager({ titre: 'Partager la liste de courses', texte: texteCourses(), type: 'courses', contenu: coursesRestantes(), nomFichier: `NaoDaily-courses-${auj()}.naodaily` });
};
ACT['partager-menu'] = () => {
  const jours = Array.from({ length: 7 }, (_, i) => ajouteJours(U.semaine, i));
  const rs = S.repas.filter(r => jours.includes(r.date));
  if (!rs.length) { toast('Aucun repas prévu cette semaine.', { alerte: true }); return; }
  const texte = `🍽️ Menu de la semaine du ${fmtJour(jours[0])} au ${fmtJour(jours[6])}\n` + jours.map(j => { const x = repasDu(j); return x.length ? `\n${majuscule(fmtJour(j, true))}\n` + x.map(r => `  ${moment(r.moment)[1]} ${moment(r.moment)[2]} : ${nomRepas(r)}`).join('\n') : ''; }).join('') + '\n\n— NaoDaily';
  const recettes = S.recettes.filter(r => rs.some(x => x.recetteId === r.id));
  partager({ titre: 'Partager le menu de la semaine', texte, type: 'menu', contenu: { repas: rs, recettes }, nomFichier: `NaoDaily-menu-${jours[0]}.naodaily` });
};
ACT['partager-envies'] = () => {
  const texte = '🌠 Ma liste d’envies\n\n' + S.envies.map(e => `• ${e.titre}${nombre(e.prix) ? ' — ' + argent(nombre(e.prix)) : ''}${e.magasin ? ' (' + e.magasin + ')' : ''}${e.lien ? '\n  ' + e.lien : ''}`).join('\n') + '\n\n— NaoDaily';
  partager({ titre: 'Partager ma liste d’envies', texte, type: 'envies', contenu: S.envies, nomFichier: 'NaoDaily-mes-envies.naodaily' });
};
function recevoirPartage(d) {
  const c = d.contenu;
  if (d.type === 'liste' && c && Array.isArray(c.elements)) {
    const l = copie(c); l.id = uid(); l.systeme = undefined; l.archivee = false; l.partage = l.partage || 'famille';
    l.elements.forEach(e => { e.id = uid(); delete e.cadeauId; });
    if (S.listes.some(x => x.nom === l.nom)) l.nom += ' (reçue)';
    S.listes.unshift(l); U.liste = l.id; U.vue = 'listes'; maj(); toast(`👥 Liste « ${l.nom} » reçue`); return true;
  }
  if (d.type === 'courses' && Array.isArray(c)) {
    c.forEach(x => ajouterCourse(x.nom, { qte: x.qte, unite: x.unite, rayon: x.rayon, prix: x.prix, origine: 'partage' }));
    U.vue = 'menus'; U.menus = 'courses'; maj(); toast(`👥 ${pluriel(c.length, 'article reçu', 'articles reçus')} dans la liste de courses`); return true;
  }
  if (d.type === 'menu' && c && Array.isArray(c.repas)) {
    const corresp = {};
    (c.recettes || []).forEach(r => {
      const deja = S.recettes.find(x => sansAccent(x.nom) === sansAccent(r.nom));
      if (deja) corresp[r.id] = deja.id; else { const n = copie(r); n.id = uid(); n.favori = false; S.recettes.push(n); corresp[r.id] = n.id; }
    });
    let n = 0;
    c.repas.forEach(r => {
      const nr = Object.assign(copie(r), { id: uid(), recetteId: corresp[r.recetteId] || '', coursesAjoutees: false });
      if (!S.repas.some(x => x.date === nr.date && x.moment === nr.moment && nomRepas(x) === nomRepas(nr))) { S.repas.push(nr); n++; }
    });
    U.vue = 'menus'; U.menus = 'planning'; U.mode = 'semaine'; if (c.repas[0]) U.semaine = lundiDe(c.repas[0].date);
    maj(); toast(`👥 Menu reçu : ${pluriel(n, 'repas ajouté', 'repas ajoutés')}`); return true;
  }
  if (d.type === 'envies' && Array.isArray(c)) {
    const l = { id: uid(), nom: 'Envies d’un proche', emoji: '🌠', modele: 'souhaits', partage: 'famille', favori: false, archivee: false, creeLe: auj(),
      elements: c.map(e => ({ id: uid(), texte: e.titre, fait: false, priorite: 'normale', note: [e.magasin, e.lien, nombre(e.prix) ? argent(nombre(e.prix)) : ''].filter(Boolean).join(' · ') })) };
    S.listes.unshift(l); U.liste = l.id; U.vue = 'listes'; maj(); toast('🌠 Liste d’envies reçue — renommez-la avec le prénom de votre proche'); return true;
  }
  return false;
}

/* ============================================================
   MENUS & RECETTES
   ============================================================ */
function formRepas(r, defauts) {
  const neuf = !r, d = r || Object.assign({ date: auj(), moment: momentSelonHeure(), recetteId: '', personnes: 2 }, defauts || {});
  if (neuf && d.recetteId) { const rec = trouver(S.recettes, d.recetteId); if (rec && rec.personnes) d.personnes = rec.personnes; }
  const recettes = S.recettes.slice().sort((a, b) => (b.favori - a.favori) || a.nom.localeCompare(b.nom));
  formulaire({
    titre: neuf ? 'Planifier un repas' : 'Modifier le repas', emoji: '🍽️',
    sous: recettes.length ? 'Choisissez une recette, ou écrivez simplement ce que vous mangerez.' : 'Écrivez ce que vous mangerez. Astuce : avec une recette enregistrée, les courses se font toutes seules.',
    valeurs: Object.assign({ courses: true }, d),
    champs: [
      { k: 'date', l: 'Jour', t: 'date', req: true },
      { k: 'moment', l: 'Moment', t: 'select', o: MOMENTS.map(m => [m[0], m[1] + ' ' + m[2]]) },
      { k: 'recetteId', l: 'Recette', t: 'select', large: true, o: [['', '— Repas libre (sans recette)']].concat(recettes.map(x => [x.id, (x.favori ? '★ ' : '') + (x.emoji || '🍽️') + ' ' + x.nom])) },
      { k: 'titre', l: 'Au menu', large: true, ph: 'Ex. Salade de lentilles, pizza maison, restes de la veille…', si: v => !v.recetteId, liste: S.ideesRepas.map(i => i.nom), aide: S.ideesRepas.length ? 'Vos idées repas sont proposées pendant la saisie.' : '' },
      { k: 'personnes', l: 'Nombre de personnes', t: 'number' },
      { k: 'note', l: 'Note', ph: 'Ex. préparer la veille' },
      ...(neuf ? [{ k: 'courses', l: '🛒 Ajouter ses ingrédients à la liste de courses', t: 'case', si: v => !!v.recetteId }] : []),
      { k: 'allerg', l: '', t: 'html', html: '<div id="zoneAllerg"></div>' },
      { k: 'verifie', l: '🚨 J’ai vérifié : ce repas sera adapté (ou pas servi) à la personne allergique', t: 'case', si: v => niveauMax(conflitsRepas(v)) >= 4 }
    ],
    change: (x, form) => {
      const z = form.querySelector('#zoneAllerg'); if (!z) return;
      const cs = conflitsRepas(x), nv = niveauMax(cs);
      z.innerHTML = cs.length ? `<div class="alerte-allergies niveau-${cs[0].niveau}" style="padding:12px 14px;border-radius:16px"><b class="ui" style="font-size:13px">${niveau(cs[0].niveau)[1]} ${nv >= 4 ? 'Allergie sévère dans ce repas' : nv >= 3 ? 'Ce repas contient un allergène' : nv >= 2 ? 'Un ingrédient est mal toléré' : 'À surveiller'}</b>
        <div class="raccourcis" style="margin-top:6px">${badgesConflits(cs)}</div>${x.recetteId && nv >= 2 ? '<div class="ui muet" style="font-size:12px;margin-top:6px">Ouvrez la recette pour en créer une version adaptée.</div>' : ''}</div>` : '';
    },
    extra: neuf ? null : [['🛒 Ingrédients aux courses', () => { const n = ajouterIngredients([r]); r.coursesAjoutees = true; maj(); toast(n ? `${pluriel(n, 'ingrédient ajouté', 'ingrédients ajoutés')} aux courses 🛒` : 'Ce repas n’a pas de recette avec ingrédients.'); }]],
    bouton: neuf ? 'Planifier' : 'Enregistrer',
    verifier: x => (!x.recetteId && !x.titre) ? 'Indiquez ce qui est au menu, ou choisissez une recette.'
      : niveauMax(conflitsRepas(x)) >= 4 && !x.verifie ? 'Allergie sévère : cochez la case de vérification, ou choisissez une recette adaptée.' : '',
    supprimer: neuf ? null : () => { instantane(); retirer(S.repas, r.id); maj(); toast('Repas retiré du menu', { annuler: true }); },
    enregistrer: x => {
      const val = { date: x.date, moment: x.moment, recetteId: x.recetteId, titre: x.recetteId ? '' : x.titre, personnes: x.personnes || '', note: x.note };
      let cible;
      if (neuf) { cible = Object.assign({ id: uid(), coursesAjoutees: false }, val); S.repas.push(cible); }
      else { if (r.recetteId !== val.recetteId || r.personnes !== val.personnes) val.coursesAjoutees = false; Object.assign(r, val); cible = r; }
      if (!cible.recetteId) { const idee = S.ideesRepas.find(i => sansAccent(i.nom) === sansAccent(cible.titre)); if (idee && (!idee.dernier || idee.dernier < cible.date)) idee.dernier = cible.date; }
      let msg = neuf ? `${moment(x.moment)[1]} ${nomRepas(cible)} · ${fmtJour(x.date)}` : 'Repas mis à jour';
      if (neuf && x.recetteId && x.courses) { const n = ajouterIngredients([cible]); cible.coursesAjoutees = true; if (n) msg += ` · ${pluriel(n, 'ingrédient')} aux courses 🛒`; }
      if (x.date < U.semaine || x.date > ajouteJours(U.semaine, 6)) U.semaine = lundiDe(x.date);
      maj(); toast(msg);
    }
  });
}
ACT['planifier'] = el => formRepas(null, { date: el.dataset.jour || auj(), moment: el.dataset.moment || momentSelonHeure(), recetteId: el.dataset.recette || '' });
ACT['modifier-repas'] = el => formRepas(trouver(S.repas, el.dataset.r));
ACT['sem-prec'] = () => { U.semaine = ajouteJours(U.semaine, -7); rendre(); };
ACT['sem-suiv'] = () => { U.semaine = ajouteJours(U.semaine, 7); rendre(); };
ACT['sem-courante'] = () => { U.semaine = lundiDe(auj()); rendre(); };
ACT['mode-menu'] = el => { U.mode = el.dataset.m; if (U.mode === 'mois') U.mois = ajouteJours(U.semaine, 3).slice(0, 7); rendre(); };
const decaleMois = n => { const d = parseJour(U.mois + '-01'); d.setMonth(d.getMonth() + n); U.mois = isoJour(d).slice(0, 7); rendre(); };
ACT['mois-prec'] = () => decaleMois(-1);
ACT['mois-suiv'] = () => decaleMois(1);
ACT['mois-courant'] = () => { U.mois = auj().slice(0, 7); rendre(); };
ACT['voir-semaine'] = el => { U.semaine = lundiDe(el.dataset.j); U.mode = 'semaine'; rendre(); };
ACT['generer-courses'] = async () => {
  const deb = U.vue === 'menus' && U.menus === 'planning' ? U.semaine : auj(), fin = ajouteJours(deb, 6);
  const rs = S.repas.filter(r => r.date >= deb && r.date <= fin && trouver(S.recettes, r.recetteId));
  const aFaire = rs.filter(r => !r.coursesAjoutees);
  if (!rs.length) { toast(`Aucune recette planifiée du ${fmtJour(deb)} au ${fmtJour(fin)}.`, { alerte: true }); return; }
  if (!aFaire.length) { toast('Les ingrédients de ces repas sont déjà dans la liste de courses ✓'); return; }
  if (!await confirmer('Générer la liste de courses ?', `Les ingrédients de ${pluriel(aFaire.length, 'repas', 'repas')} (du ${fmtJour(deb)} au ${fmtJour(fin)}) seront ajoutés, ajustés au nombre de personnes et rangés par rayon.`, 'Générer')) return;
  instantane();
  const n = ajouterIngredients(aFaire); aFaire.forEach(r => { r.coursesAjoutees = true; });
  maj(); toast(`🛒 ${pluriel(n, 'ingrédient ajouté', 'ingrédients ajoutés')} à la liste de courses`, { action: ['Voir', () => aller('menus', 'courses')] });
};

const ligneIngr = (i = {}) => `<div class="ingr-ligne"><input class="nom" placeholder="Ingrédient" value="${esc(i.nom || '')}" aria-label="Ingrédient"><input class="q" placeholder="Qté" inputmode="decimal" value="${esc(i.qte ?? '')}" aria-label="Quantité">
  <input class="unite" placeholder="Unité" list="dl_unites" value="${esc(i.unite || '')}" aria-label="Unité"><select class="rayon" aria-label="Rayon"><option value="">✨ Rayon auto</option>${RAYONS.map(r => `<option value="${r[0]}"${i.rayon === r[0] ? ' selected' : ''}>${r[1]} ${r[2]}</option>`).join('')}</select>
  <button type="button" class="btn-rond" data-retire-ingr aria-label="Retirer l’ingrédient">✕</button></div>`;
function formRecette(r, prefill) {
  const neuve = !r;
  formulaire({
    titre: neuve ? 'Nouvelle recette' : 'Modifier la recette', emoji: '📖', large: true,
    sous: 'Les quantités sont pour le nombre de personnes indiqué : elles s’ajustent toutes seules quand vous planifiez.',
    valeurs: r || Object.assign({ emoji: '🍝', personnes: 4, categories: [] }, prefill || {}),
    champs: [
      { k: 'nom', l: 'Nom de la recette', req: true, large: true, ph: 'Ex. Gratin de courgettes' },
      { k: 'emoji', l: 'Son image', t: 'emoji', o: [(r && r.emoji) || '🍝'].concat(EMOJIS_RECETTE.filter(x => x !== ((r && r.emoji) || '🍝'))) },
      { k: 'personnes', l: 'Pour combien de personnes ?', t: 'number' },
      { k: 'difficulte', l: 'Difficulté', t: 'select', o: [['', '—']].concat(DIFFICULTES) },
      { k: 'temps', l: 'Préparation (minutes)', t: 'number' },
      { k: 'tempsCuisson', l: 'Cuisson (minutes)', t: 'number' },
      { k: 'tempsRepos', l: 'Repos (minutes)', t: 'number', aide: 'Facultatif : marinade, pâte qui repose…' },
      { k: 'categories', l: 'Catégories', t: 'cases', o: CATS_RECETTE },
      { k: 'ingr', l: 'Ingrédients', t: 'html', html: `<div id="ingrs">${((r && r.ingredients.length ? r.ingredients : [{}, {}, {}])).map(ligneIngr).join('')}</div>
        <div class="actions"><button type="button" class="btn petit" id="ajoutIngr">＋ Un ingrédient</button><span class="ui muet" style="font-size:11.5px">Le rayon se devine tout seul si vous le laissez sur « auto ».</span></div>
        <datalist id="dl_unites">${['g', 'kg', 'ml', 'cl', 'l', 'pièce(s)', 'c. à soupe', 'c. à café', 'pincée', 'sachet', 'boîte', 'tranche(s)', 'gousse(s)', 'bouquet'].map(u => `<option value="${u}">`).join('')}</datalist>` },
      { k: 'etapes', l: 'Comment on fait — une étape par ligne', t: 'textarea', ph: 'Préchauffer le four à 180 °C.\nCuire 25 min…', aide: 'Écrivez les durées (« 25 min ») : un minuteur apparaîtra sur la page de la recette.' },
      { k: 'ustensiles', l: 'Ustensiles nécessaires', t: 'puces', ph: 'Ex. plat à gratin, fouet… puis Entrée' },
      { k: 'astuces', l: 'Astuces', t: 'textarea', ph: 'Variantes, conservation, service…' },
      { k: 'favori', l: '⭐ Recette favorite', t: 'case' }
    ],
    apres: form => {
      const boite = form.querySelector('#ingrs');
      form.querySelector('#ajoutIngr').addEventListener('click', () => { boite.insertAdjacentHTML('beforeend', ligneIngr()); boite.lastElementChild.querySelector('.nom').focus(); });
      boite.addEventListener('click', e => { const b = e.target.closest('[data-retire-ingr]'); if (b) b.closest('.ingr-ligne').remove(); });
      boite.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); boite.insertAdjacentHTML('beforeend', ligneIngr()); boite.lastElementChild.querySelector('.nom').focus(); } });
    },
    supprimer: neuve ? null : async () => {
      const n = S.repas.filter(x => x.recetteId === r.id).length;
      if (n && !await confirmer(`Supprimer « ${r.nom} » ?`, `Elle est planifiée dans ${pluriel(n, 'repas', 'repas')} : ils resteront au menu sous son nom.`)) return;
      instantane(); S.repas.forEach(x => { if (x.recetteId === r.id) { x.titre = r.nom; x.recetteId = ''; } }); retirer(S.recettes, r.id); maj(); toast('Recette supprimée', { annuler: true });
    },
    enregistrer: (x, form) => {
      const ingredients = $$('.ingr-ligne', form).map(li => ({ nom: majuscule(li.querySelector('.nom').value.trim()), qte: li.querySelector('.q').value.trim() === '' ? '' : nombre(li.querySelector('.q').value), unite: li.querySelector('.unite').value.trim(), rayon: li.querySelector('.rayon').value })).filter(i => i.nom);
      const val = { nom: x.nom, emoji: x.emoji, personnes: x.personnes || '', temps: x.temps || '', tempsCuisson: x.tempsCuisson || '', tempsRepos: x.tempsRepos || '', difficulte: x.difficulte || '',
        categories: x.categories, etapes: x.etapes, ustensiles: x.ustensiles || [], astuces: x.astuces || '', favori: x.favori, ingredients };
      let cible = r; if (neuve) { cible = Object.assign({ id: uid() }, val); S.recettes.push(cible); } else Object.assign(r, val);
      U.vue = 'menus'; U.menus = 'recettes'; U.recette = cible.id; maj(); toast(neuve ? `📖 « ${x.nom} » rejoint vos recettes` : 'Recette enregistrée');
    }
  });
}
ACT['nouvelle-recette'] = () => formRecette();

/* de saison */
ACT['mois-saison'] = el => { U.moisSaison = +el.dataset.m; rendre(); };
ACT['saison-course'] = el => { const c = ajouterCourse(el.dataset.n); maj(); const b = $(`[data-act="saison-course"][data-n="${el.dataset.n}"]`); if (b) b.classList.add('ajoutee'); toast(`${c.nom} ajouté aux courses 🛒`); };
ACT['saison-idee'] = el => { S.ideesRepas.push({ id: uid(), nom: el.dataset.n, categorie: '', favori: false, note: 'De saison', creeLe: auj() }); maj(); toast(`💡 « ${el.dataset.n} » ajoutée à vos idées repas`); };
ACT['saison-planifier'] = el => formRepas(null, { titre: el.dataset.n });

/* les idées repas */
function formIdee(i) {
  const neuve = !i;
  formulaire({
    titre: neuve ? 'Une idée repas' : 'Modifier l’idée', emoji: '💡', sous: 'Un plat qui vous fait envie — pas besoin de recette.',
    valeurs: i || { categorie: U.catIdee && U.catIdee !== 'favoris' ? U.catIdee : '' },
    champs: [
      { k: 'nom', l: 'Le plat', req: true, large: true, ph: 'Ex. Gnocchis à la sauce tomate' },
      { k: 'categorie', l: 'Catégorie', t: 'select', o: [['', '—']].concat(CATS_RECETTE) },
      { k: 'note', l: 'Note', ph: 'Ex. Tom adore, prévoir du parmesan' },
      { k: 'favori', l: '⭐ Idée favorite', t: 'case' }
    ],
    supprimer: neuve ? null : () => { instantane(); retirer(S.ideesRepas, i.id); maj(); toast('Idée supprimée', { annuler: true }); },
    extra: neuve ? null : [['📅 Planifier', v => { Object.assign(i, v); sauver(); setTimeout(() => formRepas(null, { titre: i.nom }), 0); }]],
    enregistrer: v => { v.nom = majuscule(v.nom); if (neuve) S.ideesRepas.push(Object.assign({ id: uid(), creeLe: auj() }, v)); else Object.assign(i, v); maj(); }
  });
}
ACT['nouvelle-idee'] = () => formIdee();
ACT['modifier-idee'] = el => formIdee(trouver(S.ideesRepas, el.dataset.i));
ACT['cat-idee'] = el => { U.catIdee = el.dataset.c; rendre(); };
ACT['fav-idee'] = el => { const i = trouver(S.ideesRepas, el.dataset.i); i.favori = !i.favori; maj(); };
ACT['suppr-idee'] = el => { instantane(); retirer(S.ideesRepas, el.dataset.i); maj(); toast('Idée supprimée', { annuler: true }); };
ACT['planifier-idee'] = el => { const i = trouver(S.ideesRepas, el.dataset.i); if (i) formRepas(null, { titre: i.nom, date: el.dataset.jour || auj(), moment: el.dataset.moment || momentSelonHeure() }); };
ACT['idee-en-recette'] = el => { const i = trouver(S.ideesRepas, el.dataset.i); formRecette(null, { nom: i.nom, categories: i.categorie ? [i.categorie] : [], favori: !!i.favori }); };
ACT['ajouter-suggestion'] = el => {
  const n = el.dataset.n; if (S.ideesRepas.some(i => sansAccent(i.nom) === sansAccent(n))) return;
  S.ideesRepas.push({ id: uid(), nom: n, categorie: el.dataset.c || '', favori: false, note: '', creeLe: auj() }); maj(); toast(`💡 « ${n} » ajoutée à vos idées`);
};
ACT['idee-hasard'] = () => {
  const cat = U.catIdee && U.catIdee !== 'favoris' ? U.catIdee : '';
  let pool = S.ideesRepas.filter(i => U.catIdee === 'favoris' ? i.favori : !cat || i.categorie === cat).map(i => ({ nom: i.nom, id: i.id }));
  if (!pool.length) pool = (cat ? SUGGESTIONS_REPAS[cat] : [].concat(...Object.values(SUGGESTIONS_REPAS))).map(nom => ({ nom }));
  /* on évite de reproposer ce qu'on a mangé il y a moins de 5 jours */
  const recents = new Set(S.repas.filter(r => joursEntre(r.date, auj()) >= 0 && joursEntre(r.date, auj()) < 5).map(r => sansAccent(nomRepas(r))));
  const frais = pool.filter(p => !recents.has(sansAccent(p.nom))); if (frais.length) pool = frais;
  const surs = pool.filter(p => niveauMax(conflits(p.nom)) < 2); if (surs.length) pool = surs;   /* on évite les allergènes */
  const x = pool[Math.floor(Math.random() * pool.length)];
  toast(`🎲 Et pourquoi pas… ${x.nom} ?`, { action: ['📅 Planifier', () => formRepas(null, { titre: x.nom })], duree: 8000 });
};
ACT['fav-recette'] = el => { const r = trouver(S.recettes, el.dataset.r); r.favori = !r.favori; maj(); };
ACT['cat-recette'] = el => { U.catRecette = el.dataset.c; rendre(); };
ACT['recette-courses'] = el => {
  const r = trouver(S.recettes, el.dataset.r);
  const n = ajouterIngredients([{ recetteId: r.id, personnes: r.personnes }]);
  maj(); toast(n ? `🛒 ${pluriel(n, 'ingrédient')} de « ${r.nom} » ajoutés aux courses` : 'Cette recette n’a pas encore d’ingrédients.', { action: n ? ['Voir', () => aller('menus', 'courses')] : null });
};
ACT['voir-recette-fenetre'] = el => {
  const r = trouver(S.recettes, el.dataset.r); if (!r) return;
  const etapes = String(r.etapes || '').split('\n').map(s => s.trim().replace(/^\d+[.)]\s*/, '')).filter(Boolean);
  const prevus = S.repas.filter(x => x.recetteId === r.id && x.date >= auj()).sort((a, b) => a.date.localeCompare(b.date));
  ouvrirModale(`<h3 id="modaleTitre"><span>${esc(r.emoji || '🍽️')}</span>${esc(r.nom)}</h3>
    <div class="actions" style="margin:6px 0 14px">${r.temps ? `<span class="etiquette">⏱ ${r.temps} min</span>` : ''}${r.personnes ? `<span class="etiquette">👥 ${pluriel(r.personnes, 'personne')}</span>` : ''}${r.categories.map(c => `<span class="etiquette bleu">${esc(catRecette(c))}</span>`).join('')}${r.favori ? '<span class="etiquette or">★ Favorite</span>' : ''}</div>
    <div class="grille g2"><div><div class="sous-titre">🧺 Ingrédients</div>${r.ingredients.map(i => `<div class="part"><span>${rayon(i.rayon || deviner(i.nom))[1]} ${esc(i.nom)}</span><span class="m qte">${i.qte !== '' && i.qte != null ? joli(nombre(i.qte)) + ' ' : ''}${esc(i.unite || '')}</span></div>`).join('') || '<p class="ui muet">Aucun ingrédient.</p>'}</div>
      <div><div class="sous-titre">👩‍🍳 Étapes</div>${etapes.length ? `<ol class="ui" style="margin:0;padding-left:20px;font-size:14px;line-height:1.6">${etapes.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '<p class="ui muet">Aucune étape notée.</p>'}</div></div>
    ${prevus.length ? `<div class="sous-titre">📅 Prévue</div><div class="raccourcis">${prevus.map(x => `<span class="etiquette">${esc(fmtJour(x.date))} · ${esc(moment(x.moment)[2])}</span>`).join('')}</div>` : ''}
    <div class="pied-fen"><button type="button" class="btn fin" data-f="modifier">✏️ Modifier</button><button type="button" class="btn fin" data-f="courses">🛒 Aux courses</button>
      <div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button><button type="button" class="btn plein" data-f="planifier">📅 Planifier</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    fen.querySelector('[data-f="modifier"]').addEventListener('click', () => { fermerModale(); formRecette(r); });
    fen.querySelector('[data-f="courses"]').addEventListener('click', () => { fermerModale(); ACT['recette-courses']({ dataset: { r: r.id } }); });
    fen.querySelector('[data-f="planifier"]').addEventListener('click', () => { fermerModale(); formRepas(null, { recetteId: r.id }); });
  }, true);
};

/* anti-gaspillage */
function formAConsommer(x) {
  const neuf = !x;
  formulaire({
    titre: neuf ? 'À consommer bientôt' : 'Modifier', emoji: '⏳', sous: 'Un produit entamé, un reste, une date qui approche.',
    valeurs: x || { date: ajouteJours(auj(), 2) },
    champs: [{ k: 'nom', l: 'Quoi ?', req: true, ph: 'Ex. Crème fraîche, reste de riz…' }, { k: 'qte', l: 'Quantité', ph: 'Ex. un demi-pot' }, { k: 'date', l: 'À consommer avant le', t: 'date' }],
    supprimer: neuf ? null : () => { retirer(S.aConsommer, x.id); maj(); },
    enregistrer: v => { if (neuf) S.aConsommer.push(Object.assign({ id: uid() }, v)); else Object.assign(x, v); maj(); }
  });
}
ACT['nouveau-aconsommer'] = () => formAConsommer();
ACT['modifier-aconsommer'] = el => formAConsommer(trouver(S.aConsommer, el.dataset.x));
ACT['consomme'] = el => { const x = trouver(S.aConsommer, el.dataset.x); instantane(); retirer(S.aConsommer, x.id); maj(); toast(`✓ ${x.nom} : rien de gaspillé, bravo 🌿`, { annuler: true }); };
ACT['idee-recette'] = el => {
  const x = trouver(S.aConsommer, el.dataset.x), mots = sansAccent(x.nom).split(/\s+/).filter(m => m.length > 2);
  const rs = S.recettes.filter(r => r.ingredients.some(i => mots.some(m => sansAccent(i.nom).includes(m))) || r.categories.includes('restes'));
  ouvrirModale(`<h3 id="modaleTitre"><span>🍳</span>Que faire avec « ${esc(x.nom)} » ?</h3><p class="sous">Vos recettes qui l’utilisent, ou marquées « restes à utiliser ».</p>
    ${rs.length ? `<div class="raccourcis">${rs.map(r => `<button type="button" class="puce" data-r="${r.id}">${esc(r.emoji || '🍽️')} ${esc(r.nom)}</button>`).join('')}</div>` : vide('Aucune de vos recettes ne l’utilise encore. Une omelette, une soupe, une quiche ou un gratin accueillent presque tout !')}
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    $$('[data-r]', fen).forEach(b => b.addEventListener('click', () => { fermerModale(); formRepas(null, { recetteId: b.dataset.r }); }));
  });
};

/* ============================================================
   CADEAUX & OCCASIONS
   ============================================================ */
function formPersonne(p) {
  const neuve = !p;
  formulaire({
    titre: neuve ? 'Ajouter un proche' : 'Modifier la fiche', emoji: '👤', large: true,
    sous: 'Tout ce qui aide à trouver le bon cadeau — rien n’est obligatoire, sauf le prénom.',
    valeurs: p || { emoji: '🌸', rappels: ['7', '1'], interets: [], couleurs: [] },
    champs: [
      { k: 'prenom', l: 'Prénom', req: true },
      { k: 'lien', l: 'Lien avec moi', t: 'select', o: [['', '—']].concat(LIENS.map(x => [x, x])) },
      { k: 'emoji', l: 'Son image', t: 'emoji', o: [(p && p.emoji) || '🌸'].concat(EMOJIS_PERSONNE.filter(x => x !== ((p && p.emoji) || '🌸'))) },
      { k: 'anniversaire', l: 'Date d’anniversaire', t: 'date' },
      { k: 'anneeConnue', l: 'Je connais l’année de naissance (pour afficher l’âge)', t: 'case', si: v => !!v.anniversaire },
      { k: 'rappels', l: 'Me prévenir avant son anniversaire', t: 'cases', o: RAPPELS_OCC.map(([n, t]) => [String(n), t]), si: v => !!v.anniversaire },
      { k: 'gouts', l: 'Ses goûts', t: 'textarea', ph: 'Ce qu’il ou elle aime, n’aime pas, collectionne…' },
      { k: 'interets', l: 'Centres d’intérêt', t: 'puces', ph: 'Ex. jardinage, polars, yoga… puis Entrée' },
      { k: 'tailles', l: 'Tailles', large: true, ph: 'Ex. haut M · pantalon 38 · pointure 39 · bague 52' },
      { k: 'couleurs', l: 'Couleurs préférées', t: 'puces', ph: 'Ex. vert sauge, bleu nuit…' },
      { k: 'notes', l: 'Notes', t: 'textarea', ph: 'Allergies, idées glanées, choses à éviter…' }
    ],
    supprimer: neuve ? null : async () => {
      if (!await confirmer(`Supprimer la fiche de ${p.prenom} ?`, 'Ses idées cadeaux resteront, sans nom associé.')) return;
      instantane(); S.cadeaux.forEach(c => { if (c.personneId === p.id) { c.personneId = ''; c.pour = p.prenom; } }); S.occasions.forEach(o => { if (o.personneId === p.id) o.personneId = ''; });
      retirer(S.personnes, p.id); maj(); toast('Fiche supprimée', { annuler: true });
    },
    enregistrer: x => {
      x.rappels = (x.rappels || []).map(Number);
      if (neuve) { S.personnes.push(Object.assign({ id: uid() }, x)); toast(`${x.emoji} ${x.prenom} fait partie de vos proches`); } else Object.assign(p, x);
      maj();
    }
  });
}
ACT['nouvelle-personne'] = () => formPersonne();
ACT['fiche-personne'] = el => {
  const p = trouver(S.personnes, el.dataset.p); if (!p) return;
  const d = prochaineDate(p.anniversaire), n = d ? joursEntre(auj(), d) : null, age = p.anneeConnue && d ? ageA(p.anniversaire, d) : null;
  const encours = S.cadeaux.filter(c => c.personneId === p.id && c.statut !== 'offert'), offerts = S.cadeaux.filter(c => c.personneId === p.id && c.statut === 'offert').sort((a, b) => (b.dateOffert || '').localeCompare(a.dateOffert || ''));
  const info = (e, t, v) => v ? `<div class="part"><span>${e} ${t}</span><span class="m" style="font-weight:600;text-align:right">${v}</span></div>` : '';
  ouvrirModale(`<div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><div class="avatar" style="width:64px;height:64px;font-size:30px">${esc(p.emoji || initiales(p.prenom))}</div>
      <div><h3 id="modaleTitre" style="margin:0">${esc(p.prenom)}</h3><div class="ui muet" style="font-size:13px">${esc(p.lien || '')}${d ? ` · 🎂 ${parseJour(d).getDate()} ${MOIS_L[parseJour(d).getMonth()]}${age ? `, ${age} ans` : ''} — ${n === 0 ? 'aujourd’hui !' : 'dans ' + pluriel(n, 'jour')}` : ''}</div></div></div>
    <div class="grille g2"><div>
      ${info('❤️', 'Goûts', esc(p.gouts || ''))}${info('👕', 'Tailles', esc(p.tailles || ''))}
      ${(p.interets || []).length ? `<div class="sous-titre">✨ Centres d’intérêt</div><div class="raccourcis">${p.interets.map(x => `<span class="etiquette">${esc(x)}</span>`).join('')}</div>` : ''}
      ${(p.couleurs || []).length ? `<div class="sous-titre">🎨 Couleurs préférées</div><div class="raccourcis">${p.couleurs.map(x => `<span class="etiquette rose">${esc(x)}</span>`).join('')}</div>` : ''}
      ${p.notes ? `<div class="sous-titre">📝 Notes</div><p class="ui" style="font-size:13.5px;margin:0;white-space:pre-wrap">${esc(p.notes)}</p>` : ''}
    </div><div>
      <div class="sous-titre">🎁 Idées en cours · ${encours.length}</div>${encours.map(c => `<div class="part"><span>${statut(c.statut)[1]} ${esc(c.titre)}</span><span class="m">${statut(c.statut)[2]}</span></div>`).join('') || '<p class="ui muet" style="font-size:13px">Pas encore d’idée.</p>'}
      <div class="sous-titre">📜 Déjà offert · ${offerts.length}</div>${offerts.map(c => `<div class="part"><span>🎁 ${esc(c.titre)}</span><span class="m muet" style="font-weight:600">${c.dateOffert ? esc(c.dateOffert.slice(0, 4)) : ''}</span></div>`).join('') || '<p class="ui muet" style="font-size:13px">Rien pour le moment.</p>'}
    </div></div>
    <div class="pied-fen"><button type="button" class="btn fin" data-f="modifier">✏️ Modifier la fiche</button><div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button><button type="button" class="btn plein" data-f="idee">＋ Idée cadeau pour ${esc(p.prenom)}</button></div></div>`, fen => {
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    fen.querySelector('[data-f="modifier"]').addEventListener('click', () => { fermerModale(); formPersonne(p); });
    fen.querySelector('[data-f="idee"]').addEventListener('click', () => { fermerModale(); formCadeau(null, { personneId: p.id, occasion: d ? 'anniv-' + p.id : '' }); });
  }, true);
};

function formOccasion(o, defauts) {
  const neuve = !o;
  formulaire({
    titre: neuve ? 'Nouvelle occasion' : 'Modifier l’occasion', emoji: '📅',
    valeurs: o ? Object.assign({}, o, { rappels: (o.rappels || []).map(String) }) : Object.assign({ type: 'fete', rappels: ['7', '1'], annuelle: false }, defauts || {}),
    champs: [
      { k: 'type', l: 'Type', t: 'select', o: TYPES_OCCASION.map(t => [t[0], t[1] + ' ' + t[2]]) },
      { k: 'date', l: 'Date', t: 'date', req: true },
      { k: 'titre', l: 'Intitulé', req: true, large: true, ph: 'Ex. Crémaillère de Jade, mariage de Tom et Lina…' },
      { k: 'personneId', l: 'Pour qui ?', t: 'select', o: [['', '—']].concat(S.personnes.map(p => [p.id, p.prenom])) },
      { k: 'annuelle', l: '🔁 Revient chaque année', t: 'case' },
      { k: 'rappels', l: 'Me prévenir', t: 'cases', o: RAPPELS_OCC.map(([n, t]) => [String(n), t]) },
      { k: 'note', l: 'Note', t: 'textarea' }
    ],
    extra: neuve ? null : [['＋ Idée cadeau', () => { setTimeout(() => formCadeau(null, { personneId: o.personneId, occasion: o.id }), 0); }]],
    supprimer: neuve ? null : () => { instantane(); retirer(S.occasions, o.id); maj(); toast('Occasion supprimée', { annuler: true }); },
    enregistrer: x => { x.rappels = (x.rappels || []).map(Number); if (neuve) S.occasions.push(Object.assign({ id: uid() }, x)); else Object.assign(o, x); maj(); toast(neuve ? `${typeOcc(x.type)[1]} ${x.titre} · ${quand(x.date)}` : 'Occasion enregistrée'); }
  });
}
ACT['nouvelle-occasion'] = () => formOccasion();
ACT['ouvrir-occasion'] = el => {
  const cle = el.dataset.cle;
  if (cle.startsWith('anniv-')) { ACT['fiche-personne']({ dataset: { p: cle.slice(6) } }); return; }
  if (cle.startsWith('fixe-')) {
    const occ = occasionsAVenir(400).find(x => x.cle === cle); if (!occ) return;
    ouvrirModale(`<h3 id="modaleTitre"><span>${typeOcc(occ.type)[1]}</span>${esc(occ.titre)}</h3><p class="sous">${esc(fmtJour(occ.date, true))} — ${esc(quand(occ.date))}. Cette fête s’ajoute toute seule au calendrier.</p>
      <div class="pied-fen"><button type="button" class="btn fin" data-f="masquer">Ne pas afficher cette année</button><div class="droite"><button type="button" class="btn fin" data-f="fermer">Fermer</button><button type="button" class="btn plein" data-f="idee">＋ Idée cadeau</button></div></div>`, fen => {
      fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
      fen.querySelector('[data-f="masquer"]').addEventListener('click', () => { S.masques.push(cle); fermerModale(); maj(); });
      fen.querySelector('[data-f="idee"]').addEventListener('click', () => { fermerModale(); formCadeau(null, { occasion: cle }); });
    });
    return;
  }
  const o = trouver(S.occasions, cle); if (o) formOccasion(o);
};

let photoCadeau = null;
function formCadeau(c, defauts) {
  const neuf = !c, occs = occasionsAVenir(400);
  photoCadeau = c ? c.photo || null : null;
  const occOptions = [['', '—']].concat(occs.map(o => [o.cle, `${typeOcc(o.type)[1]} ${o.titre} · ${fmtJour(o.date)}`]));
  if (c && c.occasion && !occs.some(o => o.cle === c.occasion)) occOptions.push([c.occasion, c.occasionTitre || 'Occasion passée']);
  const partsHTML = v => {
    const n = (v.participants || []).length + 1, total = nombre(v.prix) || nombre(v.budget);
    if (!v.commun) return '';
    return `<span class="lab">Répartition</span>${total ? `<div class="part"><span>🙋 Moi</span><span class="m">${argent(total / n)}</span></div>` + (v.participants || []).map(p => `<label class="part" style="cursor:pointer"><input type="checkbox" name="payes" value="${esc(p)}"${(v.payes || []).includes(p) ? ' checked' : ''} style="accent-color:#8E7BD4"> ${esc(p)} ${(v.payes || []).includes(p) ? '<span class="etiquette ok">a payé</span>' : ''}<span class="m">${argent(total / n)}</span></label>`).join('')
      : '<p class="ui muet" style="font-size:12.5px;margin:4px 0">Indiquez un prix ou un budget pour calculer la part de chacun.</p>'}`;
  };
  formulaire({
    titre: neuf ? 'Nouvelle idée cadeau' : 'Le cadeau', emoji: '🎁', large: true,
    valeurs: c ? Object.assign({}, c) : Object.assign({ statut: 'idee', participants: [], payes: [] }, defauts || {}),
    champs: [
      { k: 'titre', l: 'L’idée', req: true, large: true, ph: 'Ex. Un carnet de voyage, un atelier poterie…' },
      { k: 'personneId', l: 'Pour qui ?', t: 'select', o: [['', '— Quelqu’un d’autre']].concat(S.personnes.map(p => [p.id, (p.emoji || '') + ' ' + p.prenom])) },
      { k: 'pour', l: 'Son prénom', si: v => !v.personneId, ph: 'Facultatif' },
      { k: 'occasion', l: 'Pour quelle occasion ?', t: 'select', o: occOptions },
      { k: 'statut', l: 'Où en est-on ?', t: 'select', o: STATUTS.map(s => [s[0], s[1] + ' ' + s[2]]) },
      { k: 'budget', l: 'Budget prévu (€)', t: 'number' },
      { k: 'prix', l: 'Prix payé (€)', t: 'number' },
      { k: 'categorie', l: 'Catégorie', t: 'select', o: CATS_CADEAU },
      { k: 'magasin', l: 'Magasin', ph: 'Ex. la librairie du quartier' },
      { k: 'lien', l: 'Lien', t: 'url', large: true, ph: 'https://…' },
      { k: 'photo', l: 'Photo', t: 'html', html: `<div id="zonePhoto">${photoCadeau ? `<img class="photo-apercu" src="${photoCadeau}" alt="">` : ''}</div><div class="actions" style="margin-top:6px"><button type="button" class="btn petit" id="btnPhoto">📷 ${photoCadeau ? 'Changer la photo' : 'Ajouter une photo'}</button><button type="button" class="btn petit fin" id="btnSansPhoto"${photoCadeau ? '' : ' hidden'}>Retirer</button></div>` },
      { k: 'note', l: 'Note', t: 'textarea', ph: 'Taille, couleur, référence, idée d’emballage…' },
      { k: 'commun', l: '🤝 Cadeau commun (le budget est partagé)', t: 'case' },
      { k: 'participants', l: 'Participants (en plus de moi)', t: 'puces', ph: 'Prénom puis Entrée', si: v => !!v.commun },
      { k: 'parts', l: '', t: 'html', html: '<div id="zoneParts"></div>', si: v => !!v.commun }
    ],
    change: (v, form) => {
      const z = form.querySelector('#zoneParts'); if (!z) return;
      const cases = $$('input[name="payes"]', form);
      v.payes = cases.length ? cases.filter(i => i.checked).map(i => i.value) : (v.payes || []);
      z.innerHTML = partsHTML(Object.assign({}, v, { payes: v.payes.filter(p => (v.participants || []).includes(p)) }));
    },
    apres: form => {
      const zone = form.querySelector('#zonePhoto'), sans = form.querySelector('#btnSansPhoto'), btn = form.querySelector('#btnPhoto');
      btn.addEventListener('click', () => {
        const f = $('#fichierPhoto'); f.value = '';
        f.onchange = async () => {
          const fi = f.files && f.files[0]; if (!fi) return;
          try { photoCadeau = await reduirePhoto(fi); zone.innerHTML = `<img class="photo-apercu" src="${photoCadeau}" alt="">`; sans.hidden = false; btn.textContent = '📷 Changer la photo'; }
          catch (e) { toast('Cette image n’a pas pu être lue.', { alerte: true }); }
        };
        f.click();
      });
      sans.addEventListener('click', () => { photoCadeau = null; zone.innerHTML = ''; sans.hidden = true; btn.textContent = '📷 Ajouter une photo'; });
    },
    supprimer: neuf ? null : () => { instantane(); retirer(S.cadeaux, c.id); maj(); toast('Idée supprimée', { annuler: true }); },
    extra: [['🛍️ Liste « À acheter »', v => { if (!v.titre) { toast('Donnez d’abord un nom à l’idée.', { alerte: true }); return false; } const cible = enregistrerCadeau(c, v); versAAcheter(cible); maj(); }]],
    bouton: neuf ? 'Enregistrer l’idée' : 'Enregistrer',
    enregistrer: (v, form) => { v.payes = $$('input[name="payes"]:checked', form).map(i => i.value); enregistrerCadeau(c, v); maj(); }
  });
}
function enregistrerCadeau(c, v) {
  const occ = occasionsAVenir(400).find(o => o.cle === v.occasion);
  const val = { titre: v.titre, personneId: v.personneId, pour: v.personneId ? '' : v.pour, occasion: v.occasion, occasionTitre: occ ? occ.titre : (c && c.occasion === v.occasion ? c.occasionTitre : ''),
    statut: v.statut, budget: v.budget, prix: v.prix, categorie: v.categorie, magasin: v.magasin, lien: v.lien, note: v.note, photo: photoCadeau,
    commun: v.commun, participants: v.commun ? v.participants : [], payes: v.commun ? (v.payes || []).filter(p => (v.participants || []).includes(p)) : [] };
  /* un doublon ? un cadeau déjà offert à la même personne, au titre très proche */
  if (val.personneId && (!c || sansAccent(c.titre) !== sansAccent(val.titre))) {
    const t = sansAccent(val.titre);
    const dbl = S.cadeaux.find(x => x !== c && x.personneId === val.personneId && x.statut === 'offert' && (sansAccent(x.titre).includes(t) || t.includes(sansAccent(x.titre))));
    if (dbl) toast(`Attention : « ${dbl.titre} » a déjà été offert à ${nomPersonne(val.personneId)}${dbl.dateOffert ? ' en ' + dbl.dateOffert.slice(0, 4) : ''}.`, { alerte: true, duree: 8000 });
  }
  const r = rangStatut(val.statut);
  if (r >= 2 && !(c && c.dateAchat)) val.dateAchat = auj();
  if (r === 4 && !(c && c.dateOffert)) val.dateOffert = (occ && occ.date <= auj() ? occ.date : auj());
  if (c) { Object.assign(c, val); return c; }
  const n = Object.assign({ id: uid(), creeLe: auj() }, val); S.cadeaux.push(n);
  toast(`🎁 Idée « ${val.titre} » enregistrée`);
  return n;
}
function versAAcheter(c) {
  const l = listeAAcheter();
  if (l.elements.some(e => e.cadeauId === c.id && !e.fait)) { toast('Ce cadeau est déjà dans « À acheter ».'); return; }
  const pour = c.personneId ? nomPersonne(c.personneId) : c.pour;
  l.elements.push({ id: uid(), texte: `🎁 ${c.titre}${pour ? ' — pour ' + pour : ''}`, fait: false, priorite: 'normale', cadeauId: c.id, note: [c.magasin, c.lien, nombre(c.budget) ? 'budget ' + argent(nombre(c.budget)) : ''].filter(Boolean).join(' · ') });
  if (c.statut === 'idee') c.statut = 'acheter';
  toast(`🛍️ Ajouté à la liste « À acheter »`, { action: ['Voir', () => { U.liste = l.id; aller('listes'); }] });
}
ACT['nouveau-cadeau'] = () => formCadeau(null, { personneId: U.personne || '' });
ACT['modifier-cadeau'] = el => formCadeau(trouver(S.cadeaux, el.dataset.c));
ACT['cadeau-aacheter'] = el => { versAAcheter(trouver(S.cadeaux, el.dataset.c)); maj(); };
ACT['cadeau-suivant'] = el => {
  const c = trouver(S.cadeaux, el.dataset.c), r = rangStatut(c.statut); if (r >= 4) return;
  c.statut = STATUTS[r + 1][0];
  if (r + 1 >= 2 && !c.dateAchat) c.dateAchat = auj();
  if (c.statut === 'offert') { c.dateOffert = auj(); const b = el.getBoundingClientRect(); eclat(b.left + b.width / 2, b.top); }
  /* acheté : l'élément correspondant de « À acheter » se coche aussi */
  if (r + 1 >= 2) S.listes.forEach(l => l.elements.forEach(e => { if (e.cadeauId === c.id && !e.fait) { e.fait = true; e.faitLe = auj(); } }));
  maj();
  toast(c.statut === 'offert' ? '🎁 Offert ! Il rejoint l’historique.' : `${statut(c.statut)[1]} ${c.titre} : ${statut(c.statut)[2]}`, c.statut === 'acheter' ? { action: ['🛍️ À la liste', () => { versAAcheter(c); maj(); }] } : {});
};
ACT['budget-cadeaux'] = () => formulaire({
  titre: 'Mes budgets cadeaux', emoji: '💶', sous: 'Des repères, pas des contraintes.',
  valeurs: S.budgetCadeaux,
  champs: [{ k: 'mois', l: 'Budget du mois (€)', t: 'number' }, { k: 'annee', l: 'Budget de l’année (€)', t: 'number' }],
  enregistrer: x => { S.budgetCadeaux = { mois: x.mois || 0, annee: x.annee || 0 }; maj(); }
});
function formEnvie(x) {
  const neuve = !x;
  formulaire({
    titre: neuve ? 'Une envie' : 'Modifier l’envie', emoji: '🌠',
    valeurs: x || {},
    champs: [{ k: 'titre', l: 'Ce qui me ferait plaisir', req: true, large: true }, { k: 'prix', l: 'Prix indicatif (€)', t: 'number' }, { k: 'magasin', l: 'Où le trouver' },
      { k: 'lien', l: 'Lien', t: 'url', large: true, ph: 'https://…' }, { k: 'note', l: 'Précisions', large: true, ph: 'Taille, couleur…' }],
    supprimer: neuve ? null : () => { retirer(S.envies, x.id); maj(); },
    enregistrer: v => { if (neuve) S.envies.push(Object.assign({ id: uid() }, v)); else Object.assign(x, v); maj(); }
  });
}
ACT['nouvelle-envie'] = () => formEnvie();
ACT['modifier-envie'] = el => formEnvie(trouver(S.envies, el.dataset.x));
ACT['mots-occ'] = el => { U.motsOcc = el.dataset.k; U.melange = 0; rendre(); };
ACT['mots-ton'] = el => { U.motsTon = el.dataset.k; U.melange = 0; rendre(); };
ACT['mots-melange'] = () => { U.melange++; rendre(); };
ACT['copier-mot'] = el => copierTexte(el.dataset.t);

/* ============================================================
   RÉGLAGES, SAUVEGARDE, EXEMPLE
   ============================================================ */
ACT['theme'] = () => { const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = t; ecrire('naodaily.theme', t); };
ACT['calme'] = () => { const on = document.documentElement.classList.toggle('calme'); ecrire('naodaily.calme', on ? '1' : '0'); toast(on ? 'Animations en pause 🕊️' : 'Animations relancées ✨'); };
ACT['grand'] = () => { const on = document.documentElement.classList.toggle('grand'); ecrire('naodaily.grand', on ? '1' : '0'); toast(on ? 'Texte agrandi A+' : 'Texte à la taille normale'); };
ACT['sauvegarder'] = () => {
  telecharger(`NaoDaily-sauvegarde-${auj()}.json`, JSON.stringify({ outil: 'NaoDaily', date: new Date().toISOString(), donnees: S }, null, 1), 'application/json');
  toast('Sauvegarde téléchargée 💾');
};
/* Réinitialiser : l'outil redevient vierge, comme au premier jour d'un nouvel utilisateur */
ACT['reinitialiser'] = () => {
  const n = S.listes.length + S.recettes.length + S.repas.length + S.courses.length + S.personnes.length + S.cadeaux.length + S.occasions.length + S.envies.length + S.rappels.length;
  ouvrirModale(`<h3 id="modaleTitre"><span>♻️</span>Réinitialiser NaoDaily ?</h3>
    <p class="sous">Tout ce qui a été saisi dans NaoDaily est <b>effacé définitivement</b> : listes, menus, recettes, courses, proches, cadeaux, occasions, envies, rappels et réglages.
      L'outil repart vierge, comme pour une nouvelle personne.${n ? '' : ' (Il est déjà presque vide.)'}</p>
    <div class="rappel" style="margin-bottom:14px"><span class="e">💾</span><div class="t">Conseil : gardez d'abord une sauvegarde<small>Vous pourrez la recharger plus tard avec 📂.</small></div><button type="button" class="btn petit" data-f="sauver">Sauvegarder</button></div>
    <div class="champ"><label for="saisieEffacer">Pour confirmer, tapez <b style="color:var(--alerte);letter-spacing:.08em">EFFACER</b></label>
      <input id="saisieEffacer" type="text" autocomplete="off" spellcheck="false" placeholder="EFFACER" style="text-align:center;letter-spacing:.12em;font-weight:700"></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn fin" data-f="annuler">Annuler</button>
      <button type="button" class="btn danger" data-f="effacer" disabled style="opacity:.5">🗑 Tout effacer</button></div></div>`, fen => {
    const saisie = fen.querySelector('#saisieEffacer'), bouton = fen.querySelector('[data-f="effacer"]');
    fen.querySelector('[data-f="annuler"]').addEventListener('click', fermerModale);
    fen.querySelector('[data-f="sauver"]').addEventListener('click', () => ACT['sauvegarder']());
    saisie.addEventListener('input', () => { const ok = saisie.value.trim().toUpperCase() === 'EFFACER'; bouton.disabled = !ok; bouton.style.opacity = ok ? 1 : .5; });
    saisie.addEventListener('keydown', e => { if (e.key === 'Enter' && !bouton.disabled) bouton.click(); });
    bouton.addEventListener('click', () => {
      S = vierge(); annulation = null;
      ['naodaily.theme', 'naodaily.calme', 'naodaily.grand'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      sauver();
      const r = document.documentElement; r.dataset.theme = 'dark'; r.classList.remove('calme', 'grand');
      Object.assign(U, { vue: 'aujourdhui', menus: 'planning', cadeaux: 'idees', liste: null, recette: null, recherche: '', filtre: 'toutes', semaine: lundiDe(auj()), mode: 'semaine',
        mois: auj().slice(0, 7), catIdee: '', catRecette: '', chercheRecette: '', personne: '', motsTon: 'doux', motsOcc: 'anniversaire', motsPour: '', melange: 0 });
      history.replaceState(null, '', '#aujourdhui');
      fermerModale(); rendre(); scrollTo(0, 0);
      toast('NaoDaily est vierge ✨ Bienvenue !');
    });
  });
};
ACT['recharger'] = () => { $('#fichierSauvegarde').value = ''; $('#fichierSauvegarde').click(); };
$('#fichierSauvegarde').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const d = JSON.parse(r.result);
      if (d && d.naodaily === 'partage') { if (!recevoirPartage(d)) throw new Error(); return; }
      const s = d.donnees || d;
      if (!s || !Array.isArray(s.listes)) throw new Error();
      if (!await confirmer('Recharger cette sauvegarde ?', `${pluriel(s.listes.length, 'liste')}, ${pluriel((s.recettes || []).length, 'recette')}, ${pluriel((s.personnes || []).length, 'proche')} — le contenu actuel sera remplacé.`, 'Recharger')) return;
      instantane(); S = normaliser(s); U.liste = null; maj(); toast('Sauvegarde rechargée 📂', { annuler: true });
    } catch (err) { toast('Ce fichier n’est ni une sauvegarde ni un partage NaoDaily.', { alerte: true }); }
  };
  r.readAsText(f);
});
ACT['exemple'] = () => {
  const a = auj(), j = n => ajouteJours(a, n), lun = lundiDe(a);
  const annivDans = (n, annee) => { const d = parseJour(j(n)); return `${annee}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const pl = { id: uid(), prenom: 'Léa', lien: 'Ami·e', emoji: '🌻', anniversaire: annivDans(9, 1992), anneeConnue: true, rappels: [14, 7, 1], gouts: 'Adore le thé, les plantes et les romans policiers.', interets: ['Jardinage', 'Polars', 'Céramique'], tailles: 'Haut M · pointure 38', couleurs: ['Vert sauge', 'Terracotta'], notes: 'Allergique aux noix.' };
  const pm = { id: uid(), prenom: 'Maman', lien: 'Parent', emoji: '💜', anniversaire: annivDans(46, 1963), anneeConnue: false, rappels: [30, 7, 1], gouts: 'Chocolat noir, jazz, balades en forêt.', interets: ['Jazz', 'Randonnée'], couleurs: ['Bleu nuit'] };
  const pt = { id: uid(), prenom: 'Tom', lien: 'Enfant', emoji: '⚽', anniversaire: annivDans(120, 2017), anneeConnue: true, rappels: [14, 3], interets: ['Football', 'Dinosaures', 'Lego'], tailles: '8 ans · pointure 31' };
  const r1 = { id: uid(), nom: 'Gratin de courgettes', emoji: '🥘', personnes: 4, temps: 40, categories: ['vegetarien', 'familial', 'economique'], favori: true,
    ingredients: [{ nom: 'Courgettes', qte: 4, unite: '' }, { nom: 'Œufs', qte: 3, unite: '' }, { nom: 'Crème fraîche', qte: 20, unite: 'cl' }, { nom: 'Gruyère râpé', qte: 100, unite: 'g' }, { nom: 'Ail', qte: 1, unite: 'gousse(s)' }],
    etapes: 'Couper les courgettes en rondelles et les faire revenir 10 min.\nBattre les œufs avec la crème et l’ail écrasé.\nVerser sur les courgettes, parsemer de gruyère.\nEnfourner 25 min à 190 °C.' };
  const r2 = { id: uid(), nom: 'Pâtes au saumon', emoji: '🍝', personnes: 2, temps: 20, categories: ['rapide'], favori: false,
    ingredients: [{ nom: 'Pâtes', qte: 250, unite: 'g' }, { nom: 'Saumon', qte: 2, unite: 'pavé(s)' }, { nom: 'Crème fraîche', qte: 15, unite: 'cl' }, { nom: 'Citron', qte: 1, unite: '' }, { nom: 'Aneth', qte: '', unite: '', rayon: 'fruits' }],
    etapes: 'Cuire les pâtes.\nPoêler le saumon en dés, ajouter la crème et le zeste de citron.\nMélanger avec les pâtes.' };
  const r3 = { id: uid(), nom: 'Soupe de légumes « frigo vide »', emoji: '🍲', personnes: 4, temps: 35, categories: ['restes', 'economique', 'equilibre'], favori: true,
    ingredients: [{ nom: 'Carottes', qte: 3, unite: '' }, { nom: 'Pommes de terre', qte: 2, unite: '' }, { nom: 'Poireau', qte: 1, unite: '' }, { nom: 'Bouillon de légumes', qte: 1, unite: 'cube' }],
    etapes: 'Éplucher et couper tous les légumes.\nCouvrir d’eau avec le bouillon, cuire 25 min.\nMixer, saler, poivrer.' };
  const r4 = { id: uid(), nom: 'Pancakes du dimanche', emoji: '🥞', personnes: 4, temps: 25, categories: ['familial', 'fete'], favori: false,
    ingredients: [{ nom: 'Farine', qte: 250, unite: 'g' }, { nom: 'Lait', qte: 30, unite: 'cl' }, { nom: 'Œufs', qte: 2, unite: '' }, { nom: 'Sucre', qte: 30, unite: 'g' }, { nom: 'Levure', qte: 1, unite: 'sachet' }],
    etapes: 'Mélanger farine, sucre et levure.\nAjouter les œufs puis le lait petit à petit.\nCuire à la poêle, 2 min de chaque côté.' };
  const jour = { id: uid(), nom: 'Tâches du jour', emoji: '☀️', modele: 'jour', partage: '', favori: true, archivee: false, creeLe: a, elements: [
    { id: uid(), texte: 'Appeler le cabinet médical pour le rendez-vous', fait: false, priorite: 'haute', date: a },
    { id: uid(), texte: 'Répondre à la maîtresse (sortie scolaire)', fait: false, priorite: 'normale', date: a, rappel: true },
    { id: uid(), texte: 'Arroser les plantes', fait: true, faitLe: a, priorite: 'basse' },
    { id: uid(), texte: 'Renvoyer le colis', fait: false, priorite: 'normale', date: j(-1) }] };
  const menage = { id: uid(), nom: 'Ménage de la semaine', emoji: '🧽', modele: 'menage', partage: 'famille', favori: false, archivee: false, creeLe: a, elements: [
    { id: uid(), texte: 'Passer l’aspirateur', fait: true, faitLe: j(-1) }, { id: uid(), texte: 'Salle de bain', fait: false, date: j(2) }, { id: uid(), texte: 'Changer les draps', fait: false, priorite: 'haute', date: j(1) }, { id: uid(), texte: 'Sortir les poubelles', fait: true }, { id: uid(), texte: 'Lancer une lessive', fait: false }] };
  const valise = { id: uid(), nom: 'Valise week-end en Bretagne', emoji: '🧳', modele: 'valise', partage: 'couple', favori: true, archivee: false, creeLe: a, elements: [
    { id: uid(), texte: 'Papiers d’identité', fait: true }, { id: uid(), texte: 'Chargeurs', fait: false }, { id: uid(), texte: 'K-way', fait: false, note: 'Il pleut forcément un peu 🌧️' }, { id: uid(), texte: 'Maillot de bain', fait: false }] };
  const films = { id: uid(), nom: 'Films & séries à voir', emoji: '🎬', modele: 'films', partage: '', favori: false, archivee: false, creeLe: a, elements: [
    { id: uid(), texte: 'Le Voyage de Chihiro', fait: true }, { id: uid(), texte: 'La série dont tout le monde parle', fait: false }, { id: uid(), texte: 'Un vieux Chaplin avec Tom', fait: false }] };
  const rentree = { id: uid(), nom: 'Rentrée de Tom', emoji: '🎒', modele: 'rentree', partage: 'famille', favori: false, archivee: true, creeLe: j(-30), elements: [
    { id: uid(), texte: 'Fournitures scolaires', fait: true }, { id: uid(), texte: 'Assurance scolaire', fait: true }, { id: uid(), texte: 'Inscription au foot', fait: true }] };
  S.listes.push(jour, menage, valise, films, rentree);
  Object.assign(r1, { temps: 15, tempsCuisson: 25, difficulte: 'facile', ustensiles: ['Plat à gratin', 'Poêle', 'Saladier', 'Fouet', 'Râpe'], astuces: 'Dégorgez les courgettes 10 min avec du sel pour un gratin moins aqueux.\nSe garde 2 jours au frais.' });
  Object.assign(r2, { temps: 10, tempsCuisson: 12, difficulte: 'facile', ustensiles: ['Grande casserole', 'Poêle', 'Égouttoir', 'Zesteur'] });
  Object.assign(r3, { temps: 15, tempsCuisson: 25, difficulte: 'facile', ustensiles: ['Faitout', 'Mixeur plongeant', 'Économe'], astuces: 'Tous les légumes fatigués du frigo y trouvent leur place.' });
  Object.assign(r4, { temps: 10, tempsCuisson: 15, tempsRepos: 30, difficulte: 'facile', ustensiles: ['Saladier', 'Fouet', 'Poêle', 'Louche'], etapes: 'Mélanger farine, sucre et levure.\nAjouter les œufs puis le lait petit à petit.\nLaisser reposer la pâte 30 min.\nCuire à la poêle, 2 min de chaque côté.' });
  S.allergies.personnes.push({ id: uid(), nom: 'Maman', allergenes: { lait: 'intolerance' }, eviter: [], niveauEviter: 'intolerance', actif: true, urgence: '' },
    { id: uid(), nom: 'Tom', allergenes: { 'fruits-coque': 'severe', gluten: 'petite' }, eviter: ['kiwi'], niveauEviter: 'allergie', actif: true, urgence: 'Stylo d’adrénaline dans la poche avant du cartable. Appeler le 15.' });
  S.recettes.push(r1, r2, r3, r4);
  S.repas.push({ id: uid(), date: a, moment: 'dejeuner', titre: 'Salade composée', recetteId: '', personnes: 1 }, { id: uid(), date: a, moment: 'diner', recetteId: r1.id, personnes: 4 },
    { id: uid(), date: j(1), moment: 'diner', recetteId: r2.id, personnes: 2 }, { id: uid(), date: j(2), moment: 'diner', recetteId: r3.id, personnes: 4 }, { id: uid(), date: ajouteJours(lun, 6), moment: 'petitdej', recetteId: r4.id, personnes: 4 });
  S.habituels.push(...['Lait', 'Pain', 'Café', 'Lessive', 'Papier toilette'].map(n => ({ id: uid(), nom: n, rayon: deviner(n), prix: '' })));
  ['Bananes', 'Yaourts nature', 'Café', 'Liquide vaisselle', 'Eau gazeuse'].forEach(n => ajouterCourse(n));
  ajouterCourse('Tomates', { qte: 1, unite: 'kg', prix: 3.2 }); ajouterCourse('Poulet', { qte: 2, unite: 'filets', prix: 8.5 });
  S.aConsommer.push({ id: uid(), nom: 'Crème fraîche', qte: 'un demi-pot', date: j(1) }, { id: uid(), nom: 'Reste de riz', date: a }, { id: uid(), nom: 'Courgettes', qte: '2', date: j(4) });
  S.personnes.push(pl, pm, pt);
  S.occasions.push({ id: uid(), type: 'cremaillere', titre: 'Crémaillère de Jade', date: j(5), personneId: '', annuelle: false, rappels: [7, 3, 1] });
  S.cadeaux.push(
    { id: uid(), titre: 'Atelier céramique pour deux', personneId: pl.id, occasion: 'anniv-' + pl.id, occasionTitre: 'Anniversaire de Léa', statut: 'acheter', budget: 90, categorie: 'experience', magasin: 'Atelier Terre & Feu', commun: true, participants: ['Hugo', 'Sarah'], payes: ['Hugo'], creeLe: j(-10) },
    { id: uid(), titre: 'Le dernier polar de son autrice préférée', personneId: pl.id, statut: 'idee', budget: 22, categorie: 'livre', creeLe: j(-4) },
    { id: uid(), titre: 'Coffret de chocolats noirs', personneId: pm.id, statut: 'achete', prix: 32, categorie: 'gourmand', magasin: 'Chocolaterie du centre', dateAchat: a, creeLe: j(-20) },
    { id: uid(), titre: 'Plante grimpante en pot', pour: 'Jade', occasion: '', statut: 'emballe', prix: 28, categorie: 'maison', dateAchat: j(-2), creeLe: j(-15) },
    { id: uid(), titre: 'Lego dinosaure', personneId: pt.id, statut: 'idee', budget: 45, categorie: 'jeu', creeLe: j(-3) },
    { id: uid(), titre: 'Écharpe en laine bleu nuit', personneId: pm.id, statut: 'offert', prix: 39, categorie: 'mode', dateAchat: j(-300), dateOffert: j(-290), occasionTitre: 'Noël', creeLe: j(-320) });
  S.ideesRepas.push(...[['Pizza maison', 'familial', true], ['Curry de pois chiches', 'vegetarien', false], ['Omelette aux herbes', 'rapide', false], ['Tartiflette', 'fete', false], ['Soupe du frigo', 'restes', false]]
    .map(([nom, categorie, favori]) => ({ id: uid(), nom, categorie, favori, note: '', creeLe: a })));
  S.envies.push({ id: uid(), titre: 'Un cours de yoga en plein air', prix: 25 }, { id: uid(), titre: 'Une théière en fonte', magasin: 'Maison du thé', prix: 45 });
  S.rappels.push({ id: uid(), texte: 'Payer la cantine', date: j(1), fait: false, origine: '' });
  S.budgetCadeaux = { mois: 120, annee: 900 };
  maj(); toast('Exemple chargé : explorez, cochez, modifiez librement ✨');
};

/* ============================================================
   LES CLICS, LE CLAVIER, LES SAISIES
   ============================================================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.act];
  if (f) { if (el.tagName === 'A') e.preventDefault(); f(el, e); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) { fermerModale(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const t = f.t.value.trim(); if (!t) { f.t.focus(); return; }
  if (f.dataset.form === 'course-rapide') {
    const a = analyserArticle(t), c = ajouterCourse(a.nom, { qte: a.qte, unite: a.unite });
    maj(); toast(`${c.nom} → ${rayon(c.rayon)[1]} ${rayon(c.rayon)[2]}`);
  } else if (f.dataset.form === 'idee-repas') {
    if (S.ideesRepas.some(i => sansAccent(i.nom) === sansAccent(t))) toast('Cette idée est déjà dans votre liste 💡');
    else { S.ideesRepas.push({ id: uid(), nom: majuscule(t), categorie: U.catIdee && U.catIdee !== 'favoris' ? U.catIdee : '', favori: U.catIdee === 'favoris', note: '', creeLe: auj() }); maj(); toast(`💡 « ${majuscule(t)} » ajoutée à vos idées repas`); }
  } else if (f.dataset.form === 'element-rapide') {
    const l = trouver(S.listes, f.dataset.l); l.elements.push({ id: uid(), texte: t, fait: false, priorite: 'normale' }); maj();
  }
  const n = $(`[data-form="${f.dataset.form}"] input`); if (n) n.focus();
});
/* les recherches : on redessine sans perdre la saisie */
document.addEventListener('input', e => {
  const id = e.target.id;
  if (id !== 'rechercheListes' && id !== 'chercheRecette' && id !== 'chercheNutri') return;
  if (id === 'rechercheListes') U.recherche = e.target.value; else if (id === 'chercheNutri') U.chercheNutri = e.target.value; else U.chercheRecette = e.target.value;
  const pos = e.target.selectionStart; rendre();
  const n = $('#' + id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) {} }
});
document.addEventListener('change', e => {
  if (e.target.id === 'filtrePersonne') { U.personne = e.target.value; rendre(); }
  if (e.target.id === 'motsPour') { U.motsPour = e.target.value; rendre(); }
});
$('#modale').addEventListener('mousedown', e => { if (e.target.id === 'modale') fermerModale(); });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== U.vue && VUES.some(x => x[0] === h)) { U.vue = h; U.liste = null; rendre(); } });
/* une autre fenêtre (ou la synchronisation NaoGroup) a modifié les données */
window.addEventListener('storage', e => { if (e.key === CLE) { S = charger(); rendre(); } });
/* à minuit, « Aujourd'hui » change de jour */
let jourAffiche = auj();
setInterval(() => { if (auj() !== jourAffiche) { jourAffiche = auj(); if (!$('#modale').classList.contains('ouvert')) rendre(); } }, 60000);

/* ============================================================
   LE DÉCOR : de petites listes qui se cochent toutes seules,
   des post-it, des crayons, des trombones — et des étoiles.
   ============================================================ */
const MOTIFS = {
  checklist: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><rect x="7" y="6.2" width="3" height="3" rx=".7"/><path d="M12.5 7.7h4.5"/><rect x="7" y="11" width="3" height="3" rx=".7"/><path d="M12.5 12.5h4.5"/><rect x="7" y="15.8" width="3" height="3" rx=".7"/><path d="M12.5 17.3h3.5"/>'
    + '<path class="coche" d="M7.1 7.7l1.3 1.3 2.8-3.2"/><path class="coche" style="animation-delay:calc(var(--r) + 1.1s)" d="M7.1 12.5l1.3 1.3 2.8-3.2"/><path class="coche" style="animation-delay:calc(var(--r) + 2.2s)" d="M7.1 17.3l1.3 1.3 2.8-3.2"/>',
  caseCochee: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path class="coche" d="M8 12.2l2.8 2.8L16.5 9"/>',
  rond: '<circle cx="12" cy="12" r="9"/><path class="coche" d="M8 12.3l2.7 2.7 5.6-5.6"/>',
  postit: '<path d="M4 4h16v11l-5 5H4z"/><path d="M15 20v-5h5"/><path d="M7.5 8.5h9M7.5 12h6"/>',
  crayon: '<path d="M4 20l1.2-4.2L15.8 5.2a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8.2 18.8z"/><path d="M14 7l3 3M4 20l4.2-1.2"/>',
  trombone: '<path d="M9 7.5v8.5a3 3 0 0 0 6 0V6.5a4.5 4.5 0 0 0-9 0V16a6 6 0 0 0 12 0V8"/>',
  bloc: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><rect x="9" y="2.5" width="6" height="3.5" rx="1.2"/><path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4"/><path class="barre" d="M8 10.5h8"/>',
  puces: '<circle class="plein" cx="5" cy="7" r="1.3"/><circle class="plein" cx="5" cy="12" r="1.3"/><circle class="plein" cx="5" cy="17" r="1.3"/><path style="opacity:.55" d="M9 7h11M9 12h9M9 17h10"/><path class="barre" d="M8.5 7h12"/><path class="barre" style="animation-delay:calc(var(--r) + 1.4s)" d="M8.5 12h10"/>',
  etoile: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/>',
  agenda: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path class="coche" d="M9 14.6l2 2 4-4.2"/>'
};
function decor() {
  const svg = $('#motifs'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const noms = Object.keys(MOTIFS);
  let hasard = 11; const alea = () => (hasard = (hasard * 9301 + 49297) % 233280) / 233280;
  const cols = Math.max(3, Math.round(W / 250)), rangs = Math.max(3, Math.round(H / 220));
  let m = '', k = 0;
  /* une grille jetée au hasard : chaque motif dans sa case, jamais deux collés */
  for (let r = 0; r < rangs; r++) for (let c = 0; c < cols; c++) {
    if (alea() < .36) continue;
    const n = noms[(k++ + Math.floor(alea() * 3)) % noms.length], t = 26 + alea() * 22;
    const x = (c + .15 + alea() * .7) * W / cols, y = (r + .15 + alea() * .7) * H / rangs;
    m += `<g class="m" style="opacity:${(.08 + alea() * .09).toFixed(2)};animation-duration:${(16 + alea() * 16).toFixed(1)}s;animation-delay:-${(alea() * 20).toFixed(1)}s;--d:${(7 + alea() * 6).toFixed(1)}s;--r:${(alea() * 6).toFixed(1)}s">
      <g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(alea() * 36 - 18).toFixed(0)}) scale(${(t / 24).toFixed(2)}) translate(-12 -12)">${MOTIFS[n]}</g></g>`;
  }
  /* le ciel étoilé */
  for (let i = 0; i < 24; i++) {
    const x = alea() * W, y = alea() * H * .8, s = 1.6 + alea() * 2.6;
    m += `<path class="etoile" style="animation-duration:${(2.5 + alea() * 4).toFixed(1)}s;animation-delay:-${(alea() * 5).toFixed(1)}s" d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z"/>`;
  }
  /* de petites coches qui montent doucement, comme des bulles de soulagement */
  m += '<g class="bulles">';
  for (let i = 0; i < 9; i++) {
    const x = alea() * W, s = .7 + alea() * .6;
    m += `<g class="bulle" style="animation-duration:${(20 + alea() * 16).toFixed(1)}s;animation-delay:-${(alea() * 30).toFixed(1)}s"><g transform="translate(${x.toFixed(0)} ${H + 20}) scale(${s.toFixed(2)})">
      <circle r="9" fill="none" stroke="var(--motif)" stroke-width="1.4"/><path d="M-4 .3l2.7 2.7 5.4-5.6" fill="none" stroke="var(--motif)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }
  m += '</g>';
  svg.innerHTML = m;
}
let minuteurDecor = null;
window.addEventListener('resize', () => { clearTimeout(minuteurDecor); minuteurDecor = setTimeout(decor, 300); });

decor();
rendre();

/* ============================================================
   L'ENTRÉE DANS L'OUTIL — un toucher (ou Échap, Entrée, Espace) la passe.
   Orchestrée avec l'API Web Animations : chaque étape part au bon moment,
   et un passage rapide reste fluide.
   ============================================================ */
function entree() {
  const intro = $('#intro'); if (!intro) return;
  const page = $('.page'), d = new Date();
  $('#introDate').textContent = `${JOURS_C[d.getDay()]} ${d.getDate()} ${MOIS_C[d.getMonth()]}`;
  let fini = false, sortie = false;
  const minuteurs = [];
  const plus_tard = (f, ms) => minuteurs.push(setTimeout(f, ms));
  const terminer = () => {
    if (fini) return; fini = true;
    minuteurs.forEach(clearTimeout); intro.remove();
    page.getAnimations().forEach(a => a.cancel()); page.style.opacity = '';
    document.removeEventListener('keydown', clavier);
  };
  const clavier = e => { if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); sortir(true); } };
  if ((window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !intro.animate) return terminer();

  const A = (el, kf, o) => el.animate(kf, Object.assign({ fill: 'both', easing: 'cubic-bezier(.2,.8,.2,1)' }, o));
  const jeton = $('.intro-jeton', intro), carte = $('.intro-carte', intro), fond = $('.intro-fond', intro);
  const phrase = $('.phrase', intro), passer = $('.passer', intro), onde = $('.intro-onde', intro);
  const points = $$('.pt', jeton), anneau = $('.anneau', jeton), taches = $$('.tache', carte);
  page.style.opacity = '0';

  /* la phrase, lettre par lettre */
  phrase.innerHTML = [['Le quotidien, ', ''], ['simplement organisé', 'acc'], ['.', '']]
    .map(([t, c]) => [...t].map(l => `<span class="l${c ? ' ' + c : ''}">${esc(l)}</span>`).join('')).join('');

  /* 1. les trois univers convergent vers la carte */
  const depart = [[-38, -30, -24], [40, -26, 20], [0, 42, -12]];
  $$('.univers', intro).forEach((u, i) => {
    const [x, y, r] = depart[i];
    A(u, [{ opacity: 0, transform: `translate(-50%,-50%) translate(${x}vw,${y}vh) rotate(${r}deg) scale(1.3)` },
      { opacity: 1, offset: .35 },
      { opacity: 0, transform: 'translate(-50%,-50%) translate(0,6vh) rotate(0) scale(.3)' }], { duration: 1100, delay: 80 + i * 90, easing: 'cubic-bezier(.5,0,.3,1)' });
  });
  /* 2. le jeton éclot, le N se trace d'un seul geste */
  A(jeton, [{ opacity: 0, transform: 'scale(.35) rotate(-24deg)' }, { opacity: 1, transform: 'scale(1.06) rotate(3deg)', offset: .7 }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 150 });
  A($('.n', jeton), [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 650, delay: 420, easing: 'cubic-bezier(.6,.1,.3,1)' });
  /* 3. la carte « Ma journée » arrive, ses lignes glissent l'une après l'autre */
  A(carte, [{ opacity: 0, transform: 'translateY(26px) scale(.95)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 560 });
  taches.forEach((t, i) => A(t, [{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 720 + i * 90 }));
  A(passer, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1100 });

  /* 4. chaque coche lance une étincelle vers son point du logo */
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const etincelles = (x, y) => ['✦', '✧', '·', '✦', '✧', '·'].forEach((c, i) => {
    const s = document.createElement('span'); s.className = 'intro-etincelle'; s.textContent = c;
    s.style.color = i % 2 ? 'var(--accent)' : 'var(--or)'; intro.appendChild(s);
    const ang = i / 6 * Math.PI * 2, dist = 26 + (i % 3) * 8;
    s.animate([{ transform: `translate(${x}px,${y}px) scale(.4)`, opacity: 1 }, { transform: `translate(${x + Math.cos(ang) * dist}px,${y + Math.sin(ang) * dist}px) scale(1.15) rotate(60deg)`, opacity: 0 }],
      { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
  });
  const cocher = i => {
    if (sortie) return;
    const t = taches[i], cs = $('.case', t);
    cs.classList.add('on'); t.classList.add('faite');
    A(cs, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: .4 }, { transform: 'scale(1)' }], { duration: 380 });
    A($('path', cs), [{ strokeDashoffset: 22 }, { strokeDashoffset: 0 }], { duration: 300 });
    A($('.barre-l', t), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 320, delay: 110 });
    const [x1, y1] = centre(cs), [x2, y2] = centre(points[i]);
    etincelles(x1, y1);
    const p = document.createElement('span'); p.className = 'intro-particule'; intro.appendChild(p);
    const mx = (x1 + x2) / 2 + (i - 1) * 40, my = Math.min(y1, y2) - 70;
    const vol = p.animate([{ transform: `translate(${x1}px,${y1}px) scale(.6)`, opacity: 0 }, { transform: `translate(${mx}px,${my}px) scale(1.2)`, opacity: 1, offset: .5 },
      { transform: `translate(${x2}px,${y2}px) scale(.5)`, opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.45,0,.3,1)' });
    vol.onfinish = () => {
      p.remove(); if (sortie) return;
      A(points[i], [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.8)', offset: .45 }, { opacity: .6, transform: 'scale(1)' }], { duration: 420 });
      A(anneau, [{ strokeDashoffset: 100 - 25 * i }, { strokeDashoffset: 75 - 25 * i }], { duration: 380 });
      A(jeton, [{ transform: 'none' }, { transform: 'scale(1.04)', offset: .4 }, { transform: 'none' }], { duration: 300, composite: 'replace' });
    };
  };
  [1150, 1520, 1890].forEach((t, i) => plus_tard(() => cocher(i), t));

  /* 5. le cercle est en place : onde de lumière, lueur, et la phrase s'écrit */
  plus_tard(() => {
    if (sortie) return;
    A($('.lueur', jeton), [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.3)', offset: .4 }, { opacity: .5, transform: 'none' }], { duration: 900 });
    A(onde, [{ opacity: .9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.7)' }], { duration: 900, easing: 'cubic-bezier(.2,.6,.3,1)' });
    $$('.l', phrase).forEach((l, i) => A(l, [{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 420, delay: 120 + i * 24 }));
  }, 2480);

  /* 6. la sortie : le jeton s'envole se poser à sa place dans l'en-tête */
  function sortir(vite) {
    if (sortie || fini) return; sortie = true;
    minuteurs.forEach(clearTimeout);
    const k = vite ? .6 : 1;
    [carte, phrase, passer].forEach(el => A(el, [{ opacity: getComputedStyle(el).opacity, transform: 'none' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 320 * k }));
    $$('.intro-particule, .intro-etincelle', intro).forEach(x => x.remove());
    /* le logo finit complet, même si on a passé l'animation */
    points.forEach(p => A(p, [{ opacity: .6, transform: 'none' }], { duration: 1 }));
    A(anneau, [{ strokeDashoffset: 25 }], { duration: 1 }); A($('.n', jeton), [{ strokeDashoffset: 0 }], { duration: 1 }); A($('.lueur', jeton), [{ opacity: .5 }], { duration: 1 });
    const cible = $('.bar .mark svg');
    const rj = jeton.getBoundingClientRect(), rc = cible ? cible.getBoundingClientRect() : null;
    if (rc && rc.width && rj.width) {
      const dx = rc.left + rc.width / 2 - (rj.left + rj.width / 2), dy = rc.top + rc.height / 2 - (rj.top + rj.height / 2), s = rc.width / rj.width;
      A(jeton, [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: `translate(${dx * .55}px,${dy * .45}px) scale(${(1 + s) / 2}) rotate(-8deg)`, offset: .55 },
        { opacity: 1, transform: `translate(${dx}px,${dy}px) scale(${s})` }], { duration: 820 * k, easing: 'cubic-bezier(.6,0,.25,1)' });
    } else A(jeton, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
    A(fond, [{ opacity: 1 }, { opacity: 0 }], { duration: 650 * k, delay: 200 * k, easing: 'ease' });
    A(page, [{ opacity: 0 }, { opacity: 1 }], { duration: 650 * k, delay: 200 * k, easing: 'ease' });
    setTimeout(terminer, 860 * k);
  }
  plus_tard(() => sortir(false), 3550);
  intro.addEventListener('click', () => sortir(true));
  document.addEventListener('keydown', clavier);
  setTimeout(terminer, 7000);   /* filet de sécurité : l'outil finit toujours visible */
}
entree();
