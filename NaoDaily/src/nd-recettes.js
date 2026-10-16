/* ============================================================
   NaoDaily — la page détaillée d'une recette, et les allergies :
   qui est concerné, par quoi, à quel niveau, et comment adapter.
   Le repérage se fait sur le NOM des ingrédients : c'est une aide,
   jamais une garantie (étiquettes, traces, contaminations croisées).
   ============================================================ */
'use strict';

/* ---------- les 14 allergènes à déclaration obligatoire ---------- */
const ALLERGENES = [['gluten', '🌾', 'Gluten', 'gluten'], ['lait', '🥛', 'Lait / lactose', 'lactose'], ['oeufs', '🥚', 'Œufs', 'œufs'], ['poissons', '🐟', 'Poissons', 'poisson'],
  ['crustaces', '🦐', 'Crustacés', 'crustacés'], ['mollusques', '🦪', 'Mollusques', 'mollusques'], ['arachides', '🥜', 'Arachides', 'arachides'], ['fruits-coque', '🌰', 'Fruits à coque', 'fruits à coque'],
  ['soja', '🫘', 'Soja', 'soja'], ['celeri', '🥬', 'Céleri', 'céleri'], ['moutarde', '🟡', 'Moutarde', 'moutarde'], ['sesame', '⚪', 'Sésame', 'sésame'], ['sulfites', '🍷', 'Sulfites', 'sulfites'], ['lupin', '🌼', 'Lupin', 'lupin']];
const allergene = k => ALLERGENES.find(a => a[0] === k) || [k, '⚠️', k, k];
/* les niveaux : de « un peu, ça va » à « jamais, même une trace » */
const NIVEAUX = [
  ['petite', '🟡', 'Tolérée en petite quantité', 1, 'Un peu, ça passe : à surveiller, sans plus.'],
  ['intolerance', '🟠', 'Intolérance', 2, 'Inconfort ou malaise : à éviter, remplacé dans les courses.'],
  ['allergie', '🔴', 'Allergie', 3, 'Réaction allergique : à exclure des recettes et des courses.'],
  ['severe', '🚨', 'Allergie sévère — risque vital', 4, 'Même une trace est dangereuse : tout est bloqué et vérifié.']];
const niveau = k => NIVEAUX.find(n => n[0] === k) || NIVEAUX[1];
const rangNiveau = k => niveau(k)[3];

const MOTS_ALLERGENES = {
  gluten: 'farine,pate,pates,pate feuilletee,pate brisee,pate sablee,pate a pizza,pain,baguette,brioche,biscotte,semoule,boulgour,ble,orge,seigle,epeautre,avoine,flocons d avoine,chapelure,croutons,biscuit,gateau,crepe,pancake,pizza,quiche,tarte,cake,gnocchi,spaghetti,tagliatelle,coquillettes,lasagne,couscous,croque-monsieur,wrap,burger,crumble,clafoutis,biere,muesli,cereales,sauce soja,crackers,pain d epices,pain perdu,nouilles,raviolis,galette,cookies,madeleine,bechamel,panure,pane,nuggets,cordon bleu,beignet,tiramisu,gaufre',
  lait: 'lait,beurre,creme,creme fraiche,fromage,fromage blanc,yaourt,yogourt,emmental,gruyere,mozzarella,parmesan,feta,chevre,comte,raclette,camembert,reblochon,skyr,petit suisse,bechamel,gratin,tartiflette,fondue,croque-monsieur,mascarpone,ricotta,lactose,glace,chantilly,quiche,flan,cheesecake,cordon bleu,pizza,lasagne,carbonara,pesto,hachis parmentier,tiramisu,crepe,pancake,gateau,brioche,gaufre',
  oeufs: 'oeuf,omelette,mayonnaise,quiche,crepe,pancake,clafoutis,frittata,pain perdu,gateau,cake,brioche,madeleine,flan,meringue,tiramisu,carbonara,gaufre,beignet',
  poissons: 'poisson,saumon,thon,cabillaud,colin,lieu,truite,sardine,anchois,maquereau,dorade,merlu,sole,hareng,surimi,croquettes de poisson,nuoc mam',
  crustaces: 'crevette,crabe,homard,langoustine,ecrevisse,gambas,langouste,surimi',
  mollusques: 'moule,huitre,calamar,encornet,poulpe,seiche,saint-jacques,escargot,bulot,palourde',
  arachides: 'arachide,cacahuete,beurre de cacahuete,huile d arachide',
  'fruits-coque': 'noix,noisette,amande,cajou,pistache,pecan,macadamia,pate a tartiner,praline,pesto,nutella,frangipane,massepain,pignon,poudre d amande',
  soja: 'soja,tofu,tempeh,edamame,miso,sauce soja',
  celeri: 'celeri,celeri-rave',
  moutarde: 'moutarde,vinaigrette',
  sesame: 'sesame,tahini,houmous',
  sulfites: 'vin,vin blanc,vin rouge,champagne,cidre,prosecco,raisins secs,abricots secs,bourguignon,vinaigre',
  lupin: 'lupin'
};
/* ce qui ressemble à un allergène mais n'en est pas un */
const NEUTRES = {
  lait: /\b[a-z]+s? vegeta[a-z]*|lait de coco|lait d amande|lait d avoine|lait de riz|lait de soja|beurre de cacahuetes?|beurre de karite|creme de marrons?|sans (lactose|lait)/g,
  gluten: /(\b[a-z]+ ){0,4}sans gluten|farine de (riz|sarrasin|mais|coco|pois chiches?|chataigne)|galettes? de sarrasin|(pates|nouilles|galettes?) de riz|galettes? de pommes? de terre/g,
  oeufs: /sans oeufs?/g, 'fruits-coque': /noix de (coco|muscade)|sans (fruits a coque|noix)/g, arachides: /sans arachides?/g, soja: /sans soja/g,
  sesame: /sans sesame/g, moutarde: /sans moutarde/g, sulfites: /sans sulfites?/g
};
const motifMot = m => new RegExp('(^|[^a-z])' + m.split(' ').map(w => w.split('-').join('[- ]?')).join('[ -]+') + '(s|x)?([^a-z]|$)');
const INDEX_ALLERGENES = Object.keys(MOTS_ALLERGENES).map(k => [k, MOTS_ALLERGENES[k].split(',').map(m => motifMot(m.trim()))]);
const normal = t => sansAccent(t).replace(/['’]/g, ' ');
function allergenesDe(texte) {
  const n = normal(texte), r = [];
  INDEX_ALLERGENES.forEach(([k, motifs]) => { const t = NEUTRES[k] ? n.replace(NEUTRES[k], ' ') : n; if (motifs.some(re => re.test(t))) r.push(k); });
  return r;
}
const contientMot = (texte, mot) => { const m = normal(mot).trim(); return !!m && motifMot(m).test(normal(texte)); };

/* ---------- qui est concerné, et à quel niveau ---------- */
const personnesAllergies = () => (S.allergies.personnes || []).filter(p => p.actif !== false);
const allergiesRenseignees = () => personnesAllergies().some(p => Object.keys(p.allergenes || {}).length || (p.eviter || []).length);
/* [{ cle, lib, emoji, niveau, qui:[prénoms] }] — du plus grave au plus léger */
function conflits(texte) {
  if (!texte || !allergiesRenseignees()) return [];
  const trouves = allergenesDe(texte), r = {};
  personnesAllergies().forEach(p => {
    Object.entries(p.allergenes || {}).forEach(([k, nv]) => {
      if (!trouves.includes(k)) return;
      const x = r[k] = r[k] || { cle: k, lib: allergene(k)[2], court: allergene(k)[3], emoji: allergene(k)[1], niveau: nv, qui: [] };
      if (rangNiveau(nv) > rangNiveau(x.niveau)) x.niveau = nv;
      x.qui.push(p.nom);
    });
    (p.eviter || []).forEach(mot => {
      if (!contientMot(texte, mot)) return;
      const k = 'mot:' + sansAccent(mot), nv = p.niveauEviter || 'intolerance';
      const x = r[k] = r[k] || { cle: k, lib: majusculeMot(mot), court: mot, emoji: '🚫', niveau: nv, qui: [] };
      if (rangNiveau(nv) > rangNiveau(x.niveau)) x.niveau = nv;
      x.qui.push(p.nom);
    });
  });
  return Object.values(r).sort((a, b) => rangNiveau(b.niveau) - rangNiveau(a.niveau));
}
function fusionConflits(textes) {
  const r = {};
  textes.forEach(t => conflits(t).forEach(c => {
    const x = r[c.cle] = r[c.cle] || Object.assign({}, c, { qui: [] });
    if (rangNiveau(c.niveau) > rangNiveau(x.niveau)) x.niveau = c.niveau;
    c.qui.forEach(q => { if (!x.qui.includes(q)) x.qui.push(q); });
  }));
  return Object.values(r).sort((a, b) => rangNiveau(b.niveau) - rangNiveau(a.niveau));
}
const conflitsRecette = r => r ? fusionConflits(r.ingredients.length ? r.ingredients.map(i => i.nom) : [r.nom]) : [];
const conflitsRepas = r => { const rec = trouver(S.recettes, r.recetteId); return rec ? conflitsRecette(rec) : conflits(r.titre || ''); };
const niveauMax = cs => cs.reduce((m, c) => Math.max(m, rangNiveau(c.niveau)), 0);
/* une pastille par conflit, couleur selon la gravité */
function badgesConflits(cs, court) {
  return cs.map(c => { const n = niveau(c.niveau);
    return `<span class="etiquette allerg-${c.niveau}" title="${esc(n[2])} — ${esc(c.qui.join(', '))}">${n[1]} ${esc(court ? c.court : c.lib)}${court ? '' : ` <small>· ${esc(c.qui.join(', '))}</small>`}</span>`; }).join('');
}
const signeConflit = cs => cs.length ? `<span class="allerg-signe allerg-${cs[0].niveau}" title="${esc(cs.map(c => niveau(c.niveau)[2] + ' : ' + c.lib + ' (' + c.qui.join(', ') + ')').join(' · '))}">${niveau(cs[0].niveau)[1]}</span>` : '';

/* ---------- les remplacements ---------- */
const SUBSTITUTS = [
  ['farine', 'gluten', 'Farine sans gluten'], ['pates', 'gluten', 'Pâtes sans gluten'], ['pate', 'gluten', 'Pâte sans gluten'], ['spaghetti', 'gluten', 'Spaghetti sans gluten'],
  ['tagliatelle', 'gluten', 'Pâtes sans gluten'], ['coquillettes', 'gluten', 'Pâtes sans gluten'], ['lasagne', 'gluten', 'Feuilles de lasagne sans gluten'], ['pain', 'gluten', 'Pain sans gluten'],
  ['baguette', 'gluten', 'Pain sans gluten'], ['chapelure', 'gluten', 'Chapelure sans gluten'], ['semoule', 'gluten', 'Quinoa'], ['couscous', 'gluten', 'Quinoa'], ['boulgour', 'gluten', 'Quinoa'],
  ['sauce soja', 'gluten', 'Tamari sans gluten'], ['biscuit', 'gluten', 'Biscuits sans gluten'], ['biere', 'gluten', 'Bière sans gluten'], ['flocons d avoine', 'gluten', 'Flocons de riz'],
  ['lait', 'lait', 'Lait végétal', 'avoine, riz ou soja selon les autres allergies'], ['beurre', 'lait', 'Margarine végétale'], ['creme fraiche', 'lait', 'Crème végétale'], ['creme', 'lait', 'Crème végétale'],
  ['yaourt', 'lait', 'Yaourt végétal'], ['fromage blanc', 'lait', 'Yaourt végétal nature'], ['emmental', 'lait', 'Râpé végétal'], ['gruyere', 'lait', 'Râpé végétal'], ['parmesan', 'lait', 'Levure maltée', 'pour le goût fromager'],
  ['mozzarella', 'lait', 'Mozzarella végétale'], ['feta', 'lait', 'Feta végétale'], ['chevre', 'lait', 'Fromage végétal'], ['fromage', 'lait', 'Fromage végétal'],
  ['oeuf', 'oeufs', 'Graines de lin moulues', '1 c. à soupe + 3 c. à soupe d’eau pour remplacer un œuf', 'c. à soupe'], ['mayonnaise', 'oeufs', 'Mayonnaise végétale'],
  ['saumon', 'poissons', 'Poulet'], ['thon', 'poissons', 'Pois chiches écrasés'], ['cabillaud', 'poissons', 'Poulet'], ['poisson', 'poissons', 'Poulet'],
  ['crevette', 'crustaces', 'Poulet'], ['moule', 'mollusques', 'Champignons'], ['cacahuete', 'arachides', 'Graines de tournesol'], ['beurre de cacahuete', 'arachides', 'Purée de graines de tournesol'],
  ['pesto', 'fruits-coque', 'Pesto maison sans fruits à coque', 'basilic, huile d’olive, graines de tournesol'], ['noix', 'fruits-coque', 'Graines de courge'], ['noisette', 'fruits-coque', 'Graines de tournesol'],
  ['poudre d amande', 'fruits-coque', 'Farine de coco'], ['amande', 'fruits-coque', 'Graines de tournesol'], ['tofu', 'soja', 'Pois chiches'], ['sauce soja', 'soja', 'Sauce coco aminos'],
  ['moutarde', 'moutarde', 'Curcuma et un filet de citron'], ['sesame', 'sesame', 'Graines de tournesol'], ['tahini', 'sesame', 'Purée de graines de tournesol'],
  ['celeri', 'celeri', 'Fenouil'], ['vin', 'sulfites', 'Bouillon', 'ou jus de raisin'], ['vinaigre', 'sulfites', 'Jus de citron']
].sort((a, b) => b[0].length - a[0].length).map(s => ({ re: motifMot(s[0]), allergene: s[1], nom: s[2], note: s[3] || '', unite: s[4] }));
/* le remplaçant d'un ingrédient pour les conflits donnés (null si aucun) */
function substitut(nom, cs) {
  const cles = (cs || conflits(nom)).map(c => c.cle), n = normal(nom);
  return SUBSTITUTS.find(s => cles.includes(s.allergene) && s.re.test(n)) || null;
}
/* dans la liste de courses : remplacer ce qui pose problème (toujours pour une allergie sévère) */
function adapterPourCourses(i) {
  const cs = conflits(i.nom); if (!cs.length) return i;
  const nv = niveauMax(cs);
  if (nv < 2 || (!S.allergies.remplacer && nv < 4)) return i;
  const s = substitut(i.nom, cs.filter(c => rangNiveau(c.niveau) >= 2)); if (!s) return i;
  return Object.assign({}, i, { nom: s.nom, unite: s.unite || i.unite, rayon: deviner(s.nom), prix: '', note: `à la place de : ${i.nom}${s.note ? ' — ' + s.note : ''}`, remplace: true });
}

/* ============================================================
   LA PAGE D'UNE RECETTE
   ============================================================ */
const fmtDuree = m => { m = Math.round(nombre(m)); if (!m) return '—'; const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ' ' + pad(r) : ''}` : `${r} min`; };
const DIFFICULTES = [['facile', '🙂 Facile'], ['moyen', '👌 Moyen'], ['difficile', '💪 Difficile']];
const etatRecette = id => (U.etatRecette = U.etatRecette || {})[id] = U.etatRecette[id] || { portions: null, jai: new Set(), etapes: new Set() };
const etapesDe = r => String(r.etapes || '').split('\n').map(s => s.trim().replace(/^\d+\s*[.)-]\s*/, '')).filter(Boolean);
function dureesDans(t) {
  const r = [], re = /(\d+)\s*(?:à|-)?\s*(\d+)?\s*(h|heures?|min|minutes?|mn)\b/gi; let m;
  while ((m = re.exec(t))) { const v = +(m[2] || m[1]); r.push(/^h/i.test(m[3]) ? v * 60 : v); }
  return r.slice(0, 2);
}
function vueDetailRecette(r) {
  const e = etatRecette(r.id), base = nombre(r.personnes) || 4, portions = e.portions || base, k = portions / base;
  const cs = conflitsRecette(r), nv = niveauMax(cs), etapes = etapesDe(r), total = nombre(r.temps) + nombre(r.tempsCuisson) + nombre(r.tempsRepos);
  const enCourses = new Set(coursesRestantes().map(c => sansAccent(c.nom)));
  const qte = i => i.qte === '' || i.qte == null ? '' : joli(Math.round(nombre(i.qte) * k * 100) / 100) + (i.unite ? ' ' + i.unite : '');
  const manquants = r.ingredients.filter((i, n) => i.nom && !e.jai.has(n));
  const severes = cs.filter(c => c.niveau === 'severe');
  const urgences = personnesAllergies().filter(p => severes.some(c => c.qui.includes(p.nom)) && p.urgence);
  return `<div class="vue page-recette">
    <div class="actions" style="margin-bottom:12px"><button type="button" class="btn fin" data-act="fermer-recette">← Mes recettes</button>
      <div class="actions" style="margin-left:auto">${etoile(r.favori, 'fav-recette', `data-r="${r.id}"`, 'Recette favorite')}
        <button type="button" class="btn petit" data-act="modifier-recette" data-r="${r.id}">✏️ Modifier</button>
        <button type="button" class="btn petit" data-act="imprimer-recette" data-r="${r.id}">🖨️ Imprimer</button>
        <button type="button" class="btn petit plein" data-act="planifier" data-recette="${r.id}">📅 Planifier</button></div></div>

    <section class="carte recette-tete">
      <div class="emo-grand">${esc(r.emoji || '🍽️')}</div>
      <div style="flex:1;min-width:240px">
        <h2>${esc(r.nom)}</h2>
        <div class="raccourcis" style="margin-top:6px">${r.categories.map(c => `<span class="etiquette bleu">${esc(catRecette(c))}</span>`).join('')}${r.adapteeDe ? '<span class="etiquette ok">🛡️ Version adaptée</span>' : ''}</div>
        <div class="stats-recette">
          <div><small>Préparation</small><b>${fmtDuree(r.temps)}</b></div>
          <div><small>Cuisson</small><b>${fmtDuree(r.tempsCuisson)}</b></div>
          ${nombre(r.tempsRepos) ? `<div><small>Repos</small><b>${fmtDuree(r.tempsRepos)}</b></div>` : ''}
          <div class="fort"><small>Durée totale</small><b>${fmtDuree(total)}</b></div>
          <div><small>Difficulté</small><b>${esc((DIFFICULTES.find(d => d[0] === r.difficulte) || ['', '—'])[1])}</b></div>
          <div class="portions"><small>Pour</small><span><button type="button" class="btn-rond" data-act="portions" data-r="${r.id}" data-d="-1" aria-label="Moins de personnes">−</button>
            <b>${portions}</b><button type="button" class="btn-rond" data-act="portions" data-r="${r.id}" data-d="1" aria-label="Plus de personnes">+</button></span><small>${portions > 1 ? 'personnes' : 'personne'}</small></div>
        </div>
      </div>
    </section>

    ${cs.length ? `<section class="carte alerte-allergies niveau-${cs[0].niveau}">
      <h3><span class="e">${niveau(cs[0].niveau)[1]}</span> ${nv >= 4 ? 'Attention : allergie sévère' : nv >= 3 ? 'Contient un allergène' : nv >= 2 ? 'Contient un ingrédient mal toléré' : 'À surveiller'}</h3>
      <div class="raccourcis" style="margin:6px 0 10px">${badgesConflits(cs)}</div>
      ${nv >= 4 ? `<p class="ui" style="margin:0 0 8px;font-size:13.5px"><b>Même une trace peut être dangereuse.</b> Vérifiez chaque étiquette (y compris « peut contenir des traces »), les ustensiles et les plans de travail. En cas de réaction : <b>appelez le 15 ou le 112</b>.</p>
        ${urgences.map(p => `<div class="rappel" style="margin-bottom:6px"><span class="e">🩺</span><div class="t"><b>${esc(p.nom)}</b> — conduite à tenir<small style="white-space:pre-wrap">${esc(p.urgence)}</small></div></div>`).join('')}` : ''}
      ${cs.some(c => rangNiveau(c.niveau) >= 2) ? `<div class="actions"><button type="button" class="btn plein" data-act="adapter-recette" data-r="${r.id}">🛡️ Créer une version adaptée</button><span class="ui muet" style="font-size:12px">Les ingrédients concernés sont remplacés ; la recette d’origine est gardée.</span></div>` : '<p class="ui muet" style="margin:0;font-size:12.5px">Tolérée en petite quantité : pas de remplacement nécessaire, gardez juste les portions raisonnables.</p>'}
    </section>` : ''}

    <div class="grille recette-corps">
      <div class="pile">
        <section class="carte">
          <h3><span class="e">🧺</span> Ingrédients</h3>
          <p class="chapo">Pour ${pluriel(portions, 'personne')}${portions !== base ? ` (recette prévue pour ${base})` : ''} · cochez ce que vous avez déjà.</p>
          ${r.ingredients.filter(i => i.nom).map((i, n) => { const ci = conflits(i.nom), s = ci.some(c => rangNiveau(c.niveau) >= 2) ? substitut(i.nom, ci) : null;
            return `<div class="ingr-detail${e.jai.has(n) ? ' fait' : ''}">
              <button class="coche-btn" type="button" data-act="jai-ingr" data-r="${r.id}" data-n="${n}" aria-pressed="${e.jai.has(n)}" aria-label="J’ai : ${esc(i.nom)}">${COCHE_SVG}</button>
              <span class="e">${rayon(i.rayon || deviner(i.nom))[1]}</span>
              <div class="t"><span class="texte">${esc(i.nom)}</span>${ci.length ? ' ' + badgesConflits(ci, true) : ''}
                ${s ? `<small class="remplacer">💡 Remplacer par : <b>${esc(s.nom)}</b>${s.note ? ' — ' + esc(s.note) : ''}</small>` : ''}
                ${enCourses.has(sansAccent(i.nom)) ? '<small class="muet">🛒 déjà dans la liste de courses</small>' : ''}</div>
              <span class="qte">${esc(qte(i))}</span></div>`; }).join('') || vide('Aucun ingrédient : modifiez la recette pour les ajouter.')}
        </section>
        <section class="carte">
          <h3><span class="e">🧰</span> Ce dont j’ai besoin</h3>
          <div class="sous-titre">🍳 Ustensiles</div>
          <div class="raccourcis">${(r.ustensiles || []).map(u => `<span class="etiquette">${esc(u)}</span>`).join('') || '<span class="ui muet" style="font-size:12.5px">Aucun ustensile noté — ajoutez-les en modifiant la recette.</span>'}</div>
          <div class="sous-titre">🛒 À acheter</div>
          ${manquants.length ? `<p class="ui" style="margin:0 0 10px;font-size:13px">${pluriel(manquants.length, 'ingrédient')} à prévoir : ${esc(manquants.map(i => i.nom).join(', '))}.</p>
            <button type="button" class="btn plein" data-act="recette-manquants" data-r="${r.id}">🛒 Ajouter ce qui manque aux courses</button>` : '<p class="ui ok-texte" style="margin:0;font-size:13px">✓ Vous avez tout ce qu’il faut !</p>'}
          ${cs.some(c => rangNiveau(c.niveau) >= 2) && S.allergies.remplacer ? '<p class="ui muet" style="margin:8px 0 0;font-size:11.5px">🛡️ Les ingrédients concernés par une allergie seront remplacés dans la liste de courses.</p>' : ''}
        </section>
      </div>
      <div class="pile">
        <section class="carte">
          <h3><span class="e">👩‍🍳</span> Comment on fait</h3>
          <p class="chapo">${etapes.length ? `${e.etapes.size}/${etapes.length} étapes · touchez une étape quand elle est faite` : 'Aucune étape notée.'}</p>
          ${etapes.length ? barre(Math.round(e.etapes.size / etapes.length * 100)) : ''}
          <div class="etapes">${etapes.map((t, n) => `<div class="etape${e.etapes.has(n) ? ' faite' : ''}">
            <button type="button" class="num" data-act="etape-faite" data-r="${r.id}" data-n="${n}" aria-pressed="${e.etapes.has(n)}" aria-label="Étape ${n + 1} faite">${e.etapes.has(n) ? '✓' : n + 1}</button>
            <div class="t" data-act="etape-faite" data-r="${r.id}" data-n="${n}" role="button" tabindex="0">${esc(t)}</div>
            ${dureesDans(t).map(m => `<button type="button" class="btn petit lavande" data-act="minuteur" data-min="${m}" data-lab="${esc(r.nom + ' — étape ' + (n + 1))}" title="Lancer un minuteur">⏱ ${fmtDuree(m)}</button>`).join('')}</div>`).join('')}</div>
          ${etapes.length ? `<div class="actions" style="margin-top:12px">${nombre(r.tempsCuisson) ? `<button type="button" class="btn petit" data-act="minuteur" data-min="${nombre(r.tempsCuisson)}" data-lab="${esc('Cuisson — ' + r.nom)}">⏱ Minuteur de cuisson (${fmtDuree(r.tempsCuisson)})</button>` : ''}
            ${e.etapes.size ? `<button type="button" class="lien" data-act="etapes-zero" data-r="${r.id}">Tout recommencer</button>` : ''}</div>` : ''}
        </section>
        ${carteNutritionRecette(r)}
        ${r.astuces ? `<section class="carte"><h3><span class="e">💡</span> Astuces</h3><p class="ui" style="margin:0;font-size:14px;white-space:pre-wrap">${esc(r.astuces)}</p></section>` : ''}
      </div>
    </div>
  </div>`;
}

/* ============================================================
   L'ESPACE ALLERGIES
   ============================================================ */
function menuAllergies() {
  const ps = S.allergies.personnes || [], a = auj();
  const recettes = S.recettes.map(r => [r, conflitsRecette(r)]).filter(x => x[1].length).sort((x, y) => niveauMax(y[1]) - niveauMax(x[1]));
  const repas = S.repas.filter(r => r.date >= a && r.date <= ajouteJours(a, 14)).map(r => [r, conflitsRepas(r)]).filter(x => x[1].length).sort((x, y) => x[0].date.localeCompare(y[0].date));
  const courses = coursesRestantes().map(c => [c, conflits(c.nom)]).filter(x => x[1].length);
  const idees = S.ideesRepas.map(i => [i, conflits(i.nom)]).filter(x => x[1].length);
  return `<div class="astuce" style="margin-bottom:16px;font-size:13.5px"><span class="e">🩺</span><span>NaoDaily repère les allergènes à partir du <b>nom</b> des ingrédients : c’est une aide, pas une garantie.
      Vérifiez toujours les étiquettes (traces, contaminations croisées) et suivez les conseils de votre médecin ou allergologue. En cas de réaction grave : <b>15</b> ou <b>112</b>.</span></div>
    <div class="grille g3">
      <section class="carte large-2">
        <div class="coin"><button type="button" class="btn petit plein" data-act="nouvelle-allergie">＋ Une personne</button></div>
        <h3><span class="e">🛡️</span> Qui a des allergies ou intolérances ?</h3>
        <p class="chapo">Pour chaque personne, chaque allergène a son niveau : les recettes, les repas, les idées et les courses s’adaptent en fonction.</p>
        ${ps.length ? ps.map(p => { const al = Object.entries(p.allergenes || {}).sort((x, y) => rangNiveau(y[1]) - rangNiveau(x[1]));
          return `<div class="personne-allergie${p.actif === false ? ' inactive' : ''}" data-act="modifier-allergie" data-p="${p.id}" role="button" tabindex="0">
            <div class="avatar petit">${esc(initiales(p.nom))}</div>
            <div style="flex:1;min-width:0"><div class="texte" style="font-size:16px;font-style:italic;font-weight:700">${esc(p.nom)}${p.actif === false ? ' <span class="etiquette">en pause</span>' : ''}</div>
              <div class="raccourcis" style="margin-top:5px">${al.map(([k, nv]) => `<span class="etiquette allerg-${nv}" title="${esc(niveau(nv)[2])}">${niveau(nv)[1]} ${allergene(k)[1]} ${esc(allergene(k)[2])}</span>`).join('')}
                ${(p.eviter || []).map(m => `<span class="etiquette allerg-${p.niveauEviter || 'intolerance'}">${niveau(p.niveauEviter || 'intolerance')[1]} 🚫 ${esc(m)}</span>`).join('')}
                ${!al.length && !(p.eviter || []).length ? '<span class="ui muet" style="font-size:12px">Rien de renseigné</span>' : ''}</div>
              ${p.urgence ? `<div class="ui" style="font-size:12px;margin-top:6px;color:var(--alerte)">🩺 ${esc(p.urgence)}</div>` : ''}</div></div>`; }).join('')
          : vide('Ajoutez les personnes du foyer (ou les invités réguliers) qui ont une allergie, une intolérance ou un aliment à éviter.', '<button type="button" class="btn plein" data-act="nouvelle-allergie">＋ Ajouter une personne</button>')}
      </section>
      <section class="carte">
        <h3><span class="e">🎚️</span> Les niveaux</h3>
        ${NIVEAUX.map(n => `<div class="rappel" style="margin-bottom:6px"><span class="e">${n[1]}</span><div class="t"><b>${esc(n[2])}</b><small>${esc(n[4])}</small></div></div>`).join('')}
        <div class="sous-titre">🛒 Liste de courses</div>
        <label class="champ case" style="font-size:13px"><input type="checkbox" data-act="remplacer-auto" ${S.allergies.remplacer ? 'checked' : ''}> Remplacer automatiquement les ingrédients concernés (intolérance et allergie) quand une recette remplit la liste de courses.</label>
        <p class="ui muet" style="font-size:11.5px;margin:6px 0 0">Pour une allergie sévère, le remplacement se fait toujours.</p>
      </section>
    </div>
    ${allergiesRenseignees() ? `<div class="grille g2" style="margin-top:16px">
      <section class="carte"><h3><span class="e">📖</span> Recettes concernées · ${recettes.length}</h3><p class="chapo">Ouvrez-les pour voir quoi remplacer, ou créez une version adaptée.</p>
        ${recettes.map(([r, cs]) => `<div class="rappel" style="margin-bottom:6px"><span class="e">${esc(r.emoji || '🍽️')}</span><div class="t" data-act="voir-recette" data-r="${r.id}" role="button" tabindex="0" style="cursor:pointer">${esc(r.nom)}<small class="raccourcis" style="margin-top:4px">${badgesConflits(cs, true)}</small></div>
          ${niveauMax(cs) >= 2 ? `<button type="button" class="btn petit" data-act="adapter-recette" data-r="${r.id}">🛡️ Adapter</button>` : ''}</div>`).join('') || vide('Toutes vos recettes conviennent ✨')}</section>
      <section class="carte"><h3><span class="e">🗓️</span> Repas des 15 prochains jours · ${repas.length}</h3><p class="chapo">Les repas prévus qui contiennent un allergène.</p>
        ${repas.map(([r, cs]) => `<div class="rappel" style="margin-bottom:6px" data-act="modifier-repas" data-r="${r.id}" role="button" tabindex="0"><span class="e">${emojiRepas(r)}</span><div class="t">${esc(nomRepas(r))}<small>${esc(fmtJour(r.date))} · ${esc(moment(r.moment)[2])}</small><small class="raccourcis" style="margin-top:4px">${badgesConflits(cs, true)}</small></div></div>`).join('') || vide('Aucun repas prévu ne pose problème ✨')}</section>
      <section class="carte"><h3><span class="e">🛒</span> Dans la liste de courses · ${courses.length}</h3>
        ${courses.map(([c, cs]) => { const s = substitut(c.nom, cs); return `<div class="rappel" style="margin-bottom:6px"><span class="e">${rayon(c.rayon)[1]}</span><div class="t">${esc(c.nom)}<small class="raccourcis" style="margin-top:4px">${badgesConflits(cs, true)}</small>${s ? `<small>💡 ${esc(s.nom)}</small>` : ''}</div>
          ${s && niveauMax(cs) >= 2 ? `<button type="button" class="btn petit" data-act="remplacer-course" data-c="${c.id}">Remplacer</button>` : ''}</div>`; }).join('') || vide('Rien à signaler dans les courses ✨')}</section>
      <section class="carte"><h3><span class="e">💡</span> Idées repas · ${idees.length}</h3>
        ${idees.map(([i, cs]) => `<div class="rappel" style="margin-bottom:6px"><span class="e">💡</span><div class="t">${esc(i.nom)}<small class="raccourcis" style="margin-top:4px">${badgesConflits(cs, true)}</small></div></div>`).join('') || vide('Toutes vos idées conviennent ✨')}</section>
    </div>` : ''}`;
}

/* ============================================================
   LES ACTIONS (ajoutées à ACT par nd-app.js)
   ============================================================ */
const ACT_REC = {};
ACT_REC['fermer-recette'] = () => { U.recette = null; rendre(); scrollTo(0, 0); };
ACT_REC['modifier-recette'] = el => formRecette(trouver(S.recettes, el.dataset.r));
ACT_REC['portions'] = el => { const r = trouver(S.recettes, el.dataset.r), e = etatRecette(r.id), base = nombre(r.personnes) || 4; e.portions = Math.max(1, Math.min(30, (e.portions || base) + +el.dataset.d)); maj(); };
ACT_REC['jai-ingr'] = el => { const e = etatRecette(el.dataset.r), n = +el.dataset.n; e.jai.has(n) ? e.jai.delete(n) : e.jai.add(n); maj(); };
ACT_REC['etape-faite'] = el => { const e = etatRecette(el.dataset.r), n = +el.dataset.n; if (e.etapes.has(n)) e.etapes.delete(n); else { e.etapes.add(n); const b = el.getBoundingClientRect(); eclat(b.left + 16, b.top + 16); } maj(); };
ACT_REC['etapes-zero'] = el => { const e = etatRecette(el.dataset.r); e.etapes.clear(); maj(); };
ACT_REC['recette-manquants'] = el => {
  const r = trouver(S.recettes, el.dataset.r), e = etatRecette(r.id), base = nombre(r.personnes) || 4, k = (e.portions || base) / base;
  let n = 0, remplaces = 0;
  r.ingredients.forEach((i, x) => {
    if (!i.nom || e.jai.has(x)) return;
    const a = adapterPourCourses({ nom: i.nom, qte: i.qte === '' || i.qte == null ? '' : Math.round(nombre(i.qte) * k * 100) / 100, unite: i.unite || '', rayon: i.rayon || deviner(i.nom) });
    if (a.remplace) remplaces++;
    if (ajouterCourse(a.nom, Object.assign({ origine: 'recette' }, a))) n++;
  });
  maj(); toast(`🛒 ${pluriel(n, 'ingrédient ajouté', 'ingrédients ajoutés')} aux courses${remplaces ? ` · 🛡️ ${remplaces} remplacé${remplaces > 1 ? 's' : ''}` : ''}`, { action: ['Voir', () => aller('menus', 'courses')] });
};
ACT_REC['adapter-recette'] = el => {
  const r = trouver(S.recettes, el.dataset.r), cs = conflitsRecette(r).filter(c => rangNiveau(c.niveau) >= 2);
  const c = copie(r), faits = [], restes = [];
  c.id = uid(); c.favori = false; c.adapteeDe = r.id;
  c.ingredients = r.ingredients.map(i => {
    const ci = conflits(i.nom).filter(x => rangNiveau(x.niveau) >= 2); if (!ci.length) return Object.assign({}, i);
    const s = substitut(i.nom, ci); if (!s) { restes.push(i.nom); return Object.assign({}, i); }
    faits.push(`${i.nom} → ${s.nom}${s.note ? ' (' + s.note + ')' : ''}`);
    return Object.assign({}, i, { nom: s.nom, unite: s.unite || i.unite, rayon: deviner(s.nom) });
  });
  if (!faits.length) { toast('Aucun remplacement connu pour ces ingrédients : adaptez-la à la main.', { alerte: true, duree: 6000 }); return; }
  c.nom = `${r.nom} — sans ${cs.map(x => x.court).join(', sans ')}`;
  c.astuces = `🛡️ Version adaptée de « ${r.nom} » :\n${faits.map(f => '• ' + f).join('\n')}${restes.length ? `\n⚠️ Reste à vérifier : ${restes.join(', ')}` : ''}${r.astuces ? '\n\n' + r.astuces : ''}`;
  S.recettes.push(c); U.vue = 'menus'; U.menus = 'recettes'; U.recette = c.id; maj(); scrollTo(0, 0);
  toast(`🛡️ Version adaptée créée : ${pluriel(faits.length, 'ingrédient remplacé', 'ingrédients remplacés')}${restes.length ? ' — ' + restes.length + ' à vérifier' : ''}`, { duree: 6000 });
};
ACT_REC['imprimer-recette'] = el => {
  const r = trouver(S.recettes, el.dataset.r), e = etatRecette(r.id), base = nombre(r.personnes) || 4, p = e.portions || base, k = p / base;
  const cs = conflitsRecette(r), total = nombre(r.temps) + nombre(r.tempsCuisson) + nombre(r.tempsRepos);
  $('#impression').innerHTML = `<h1>${esc(r.emoji || '')} ${esc(r.nom)}</h1>
    <div class="s">Pour ${pluriel(p, 'personne')} · préparation ${fmtDuree(r.temps)} · cuisson ${fmtDuree(r.tempsCuisson)}${nombre(r.tempsRepos) ? ' · repos ' + fmtDuree(r.tempsRepos) : ''} · total ${fmtDuree(total)}
      ${cs.length ? '<br>⚠️ ' + esc(cs.map(c => niveau(c.niveau)[2] + ' : ' + c.lib + ' (' + c.qui.join(', ') + ')').join(' · ')) : ''}</div>
    <div class="cols"><div class="r"><h2>Ingrédients</h2>${r.ingredients.filter(i => i.nom).map(i => `<div class="i">${esc(i.nom)}${i.qte !== '' && i.qte != null ? ' — ' + joli(Math.round(nombre(i.qte) * k * 100) / 100) + ' ' + esc(i.unite || '') : ''}</div>`).join('')}</div>
      ${(r.ustensiles || []).length ? `<div class="r"><h2>Ustensiles</h2>${r.ustensiles.map(u => `<div class="i">${esc(u)}</div>`).join('')}</div>` : ''}</div>
    <h2>Étapes</h2><ol>${etapesDe(r).map(t => `<li>${esc(t)}</li>`).join('')}</ol>${r.astuces ? `<h2>Astuces</h2><p style="white-space:pre-wrap;font-size:13px">${esc(r.astuces)}</p>` : ''}`;
  window.print();
};
ACT_REC['remplacer-course'] = el => {
  const c = trouver(S.courses, el.dataset.c), s = substitut(c.nom); if (!s) return;
  instantane(); c.note = `à la place de : ${c.nom}${s.note ? ' — ' + s.note : ''}`; c.nom = s.nom; c.rayon = deviner(s.nom); c.prix = '';
  maj(); toast(`🛡️ Remplacé par ${s.nom}`, { annuler: true });
};
ACT_REC['remplacer-auto'] = el => { S.allergies.remplacer = el.checked; sauver(); };

/* ---------- les minuteurs de cuisine ---------- */
const MINUTEURS = [];
function sonnerie() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, .35, .7].forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(.001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(.3, ctx.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .3);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + .32); });
  } catch (e) {}
}
function dessinerMinuteurs() {
  let z = $('#minuteurs'); if (!z) { z = document.createElement('div'); z.id = 'minuteurs'; z.className = 'minuteurs'; document.body.appendChild(z); }
  z.innerHTML = MINUTEURS.map((m, i) => { const r = Math.max(0, Math.round((m.fin - Date.now()) / 1000));
    return `<div class="minuteur${r ? '' : ' fini'}"><span>⏱</span><div><small>${esc(m.lab)}</small><b>${r ? pad(Math.floor(r / 60)) + ':' + pad(r % 60) : 'C’est prêt !'}</b></div><button type="button" data-fin-minuteur="${i}" aria-label="Arrêter">✕</button></div>`; }).join('');
  z.querySelectorAll('[data-fin-minuteur]').forEach(b => b.addEventListener('click', () => { MINUTEURS.splice(+b.dataset.finMinuteur, 1); dessinerMinuteurs(); }));
}
setInterval(() => {
  if (!MINUTEURS.length) return;
  MINUTEURS.forEach(m => { if (!m.sonne && Date.now() >= m.fin) { m.sonne = true; sonnerie(); toast(`⏰ C’est prêt : ${m.lab}`, { alerte: true, duree: 10000 }); } });
  dessinerMinuteurs();
}, 1000);
ACT_REC['minuteur'] = el => { const min = nombre(el.dataset.min); if (!min) return; MINUTEURS.push({ lab: el.dataset.lab || 'Minuteur', fin: Date.now() + min * 60000 }); dessinerMinuteurs(); toast(`⏱ Minuteur lancé : ${fmtDuree(min)}`); };

/* ---------- la fiche allergies d'une personne ---------- */
function formAllergie(p) {
  const neuve = !p, v = p || { nom: '', allergenes: {}, eviter: [], niveauEviter: 'intolerance', actif: true, urgence: '' };
  const choixNiveau = k => `<select data-allerg="${k}" aria-label="Niveau pour ${esc(allergene(k)[2])}"><option value="">—</option>${NIVEAUX.map(n => `<option value="${n[0]}"${(v.allergenes || {})[k] === n[0] ? ' selected' : ''}>${n[1]} ${esc(n[2])}</option>`).join('')}</select>`;
  formulaire({
    titre: neuve ? 'Allergies d’une personne' : 'Allergies de ' + v.nom, emoji: '🛡️', large: true,
    sous: 'Choisissez un niveau pour chaque allergène concerné. Laissez « — » pour les autres.',
    valeurs: Object.assign({}, v),
    champs: [
      { k: 'nom', l: 'Prénom', req: true, liste: ['Moi'].concat(S.personnes.map(x => x.prenom)) },
      { k: 'actif', l: 'Prendre en compte (décochez pour un invité absent)', t: 'case' },
      { k: 'grille', l: 'Allergènes', t: 'html', html: `<div class="grille-allergenes">${ALLERGENES.map(a => `<label class="ligne-allergene"><span>${a[1]} ${esc(a[2])}</span>${choixNiveau(a[0])}</label>`).join('')}</div>` },
      { k: 'eviter', l: 'Autres aliments à éviter', t: 'puces', ph: 'Ex. fraise, kiwi, porc… puis Entrée' },
      { k: 'niveauEviter', l: 'Niveau pour ces aliments', t: 'select', o: NIVEAUX.map(n => [n[0], n[1] + ' ' + n[2]]), si: x => (x.eviter || []).length > 0 },
      { k: 'urgence', l: 'Conduite à tenir en cas de réaction (facultatif)', t: 'textarea', ph: 'Ex. stylo d’adrénaline dans le sac bleu, protocole du médecin, numéro de l’allergologue…' }
    ],
    change: (x, form) => { $$('[data-allerg]', form).forEach(s => s.closest('.ligne-allergene').className = 'ligne-allergene' + (s.value ? ' allerg-' + s.value : '')); },
    supprimer: neuve ? null : () => { instantane(); retirer(S.allergies.personnes, p.id); maj(); toast('Fiche supprimée', { annuler: true }); },
    enregistrer: (x, form) => {
      const al = {}; $$('[data-allerg]', form).forEach(s => { if (s.value) al[s.dataset.allerg] = s.value; });
      const val = { nom: x.nom, actif: x.actif, allergenes: al, eviter: x.eviter || [], niveauEviter: x.niveauEviter || 'intolerance', urgence: x.urgence };
      if (neuve) S.allergies.personnes.push(Object.assign({ id: uid() }, val)); else Object.assign(p, val);
      maj();
      const n = S.recettes.filter(r => conflitsRecette(r).length).length;
      toast(`🛡️ Allergies de ${x.nom} enregistrées${n ? ` · ${pluriel(n, 'recette concernée', 'recettes concernées')}` : ''}`);
    }
  });
}
ACT_REC['nouvelle-allergie'] = () => formAllergie();
ACT_REC['modifier-allergie'] = el => formAllergie(trouver(S.allergies.personnes, el.dataset.p));
ACT_REC['voir-recette'] = el => {
  if (!trouver(S.recettes, el.dataset.r)) return;
  if ($('#modale').classList.contains('ouvert')) fermerModale();
  U.vue = 'menus'; U.menus = 'recettes'; U.recette = el.dataset.r; U.liste = null;
  if (location.hash !== '#menus') history.replaceState(null, '', '#menus');
  rendre(); scrollTo(0, 0);
};
