/* ============================================================
   NaoDaily — la table nutritionnelle des aliments courants, et
   l'estimation des valeurs d'une recette à partir de ses ingrédients.
   Valeurs moyennes pour 100 g (ou 100 ml), arrondies, dans l'esprit
   de la table Ciqual (ANSES) : des repères, pas des mesures.
   ============================================================ */
'use strict';

const CATS_NUTRI = [['fruits', '🍎', 'Fruits'], ['legumes', '🥕', 'Légumes'], ['feculents', '🍞', 'Féculents & légumineuses'], ['proteines', '🍗', 'Viandes, poissons & œufs'],
  ['laitiers', '🧀', 'Produits laitiers'], ['graisses', '🫒', 'Matières grasses'], ['coques', '🌰', 'Fruits à coque & secs'], ['sucres', '🍫', 'Sucré & plats'], ['boissons', '🥤', 'Boissons']];
/* [nom, catégorie, kcal, protéines, glucides, dont sucres, lipides, fibres, sel, portion (g), libellé de portion, mots reconnus dans les recettes] */
const ALIMENTS = [
  ['Pomme', 'fruits', 53, .3, 11.3, 9.6, .3, 1.8, 0, 150, '1 pomme'], ['Poire', 'fruits', 55, .4, 11.5, 9.8, .3, 3.1, 0, 160, '1 poire'],
  ['Banane', 'fruits', 90, 1.1, 20, 15, .3, 2, 0, 120, '1 banane'], ['Orange', 'fruits', 47, .9, 9, 8.5, .2, 2, 0, 150, '1 orange'],
  ['Clémentine', 'fruits', 47, .8, 9.5, 9, .2, 1.7, 0, 60, '1 clémentine'], ['Citron', 'fruits', 30, .8, 3.5, 2.5, .3, 2, 0, 60, '1 citron'],
  ['Kiwi', 'fruits', 61, 1.1, 11, 9, .6, 3, 0, 75, '1 kiwi'], ['Fraise', 'fruits', 33, .7, 6, 5, .3, 2, 0, 125, '1 bol'],
  ['Framboise', 'fruits', 45, 1.2, 5, 4.5, .7, 6.5, 0, 125, '1 barquette'], ['Myrtille', 'fruits', 57, .7, 12, 10, .3, 2.4, 0, 125, '1 barquette'],
  ['Cerise', 'fruits', 60, 1, 13, 12, .3, 1.5, 0, 100, '1 poignée'], ['Abricot', 'fruits', 45, .9, 9, 8, .1, 2, 0, 40, '1 abricot'],
  ['Pêche', 'fruits', 40, .9, 8.5, 8, .2, 1.5, 0, 150, '1 pêche'], ['Prune', 'fruits', 50, .7, 10, 10, .2, 1.6, 0, 40, '1 prune'],
  ['Melon', 'fruits', 34, .8, 7, 7, .2, 1, 0, 200, '1/4 de melon'], ['Pastèque', 'fruits', 30, .6, 7, 6, .2, .4, 0, 250, '1 tranche'],
  ['Raisin', 'fruits', 70, .7, 16, 16, .2, 1, 0, 125, '1 grappe'], ['Ananas', 'fruits', 50, .5, 11, 10, .2, 1.4, 0, 150, '2 tranches'],
  ['Mangue', 'fruits', 65, .6, 14, 13, .4, 1.7, 0, 150, '1/2 mangue'], ['Figue', 'fruits', 70, .8, 15, 15, .3, 2.5, 0, 50, '1 figue'],
  ['Avocat', 'fruits', 160, 2, 1.5, .7, 15, 6.5, 0, 80, '1/2 avocat'],
  ['Carotte', 'legumes', 36, .6, 6.5, 5, .2, 2.7, .1, 100, '1 carotte'], ['Tomate', 'legumes', 18, .8, 2.5, 2.4, .3, 1.2, 0, 120, '1 tomate'],
  ['Courgette', 'legumes', 17, 1.2, 2, 1.7, .3, 1, 0, 200, '1 courgette'], ['Aubergine', 'legumes', 20, 1, 3, 2.5, .2, 2.5, 0, 250, '1 aubergine'],
  ['Poivron', 'legumes', 25, .9, 4.5, 4, .3, 2, 0, 150, '1 poivron'], ['Concombre', 'legumes', 13, .6, 2, 1.7, .1, .7, 0, 150, '1/2 concombre'],
  ['Salade (laitue)', 'legumes', 14, 1.2, 1.3, 1.1, .2, 1.3, 0, 80, '1 assiette', ['salade', 'laitue', 'mache', 'roquette']],
  ['Épinard', 'legumes', 25, 2.8, 1.4, .5, .5, 2.6, .1, 150, '1 portion'], ['Brocoli', 'legumes', 34, 2.8, 4, 1.7, .4, 2.6, 0, 150, '1 portion'],
  ['Chou-fleur', 'legumes', 25, 2, 3, 2.5, .3, 2.2, 0, 150, '1 portion'], ['Chou', 'legumes', 25, 1.3, 4.5, 3, .1, 2.5, 0, 150, '1 portion'],
  ['Haricots verts', 'legumes', 31, 1.8, 4.5, 2, .2, 3.4, 0, 150, '1 portion', ['haricot vert']], ['Petits pois', 'legumes', 80, 5.4, 10, 4, .4, 5.5, 0, 150, '1 portion', ['petits pois', 'petit pois']],
  ['Champignon', 'legumes', 22, 3, .5, .3, .3, 1.5, 0, 100, '1 portion'], ['Oignon', 'legumes', 40, 1.1, 8, 5, .1, 1.7, 0, 100, '1 oignon', ['oignon', 'echalote']],
  ['Ail', 'legumes', 130, 6, 24, 1, .5, 2, 0, 5, '1 gousse'], ['Poireau', 'legumes', 31, 1.5, 5, 3, .3, 2, 0, 150, '1 poireau'],
  ['Pomme de terre', 'legumes', 80, 2, 17, .8, .1, 1.8, 0, 150, '1 pomme de terre', ['pomme de terre', 'patate']], ['Patate douce', 'legumes', 86, 1.6, 20, 4.2, .1, 3, .1, 200, '1 patate douce'],
  ['Potiron / courge', 'legumes', 25, 1, 5, 3, .1, 1, 0, 200, '1 portion', ['potiron', 'courge', 'butternut', 'citrouille']], ['Betterave', 'legumes', 43, 1.6, 9, 7, .2, 2.8, .2, 100, '1 betterave'],
  ['Céleri', 'legumes', 18, .7, 3, 1.8, .2, 1.6, .2, 100, '1 portion'], ['Radis', 'legumes', 16, .7, 3, 2, .1, 1.6, 0, 50, '1 botte (moitié)'],
  ['Maïs doux', 'legumes', 86, 3.3, 19, 6, 1.4, 2, 0, 100, '1 petite boîte', ['mais']], ['Fenouil', 'legumes', 20, 1.2, 3, 3, .2, 2.5, .1, 150, '1 bulbe'],
  ['Asperge', 'legumes', 20, 2.2, 2, 1.5, .1, 2, 0, 150, '6 asperges'], ['Endive', 'legumes', 17, 1, 2.5, 1, .1, 1.5, 0, 100, '1 endive'],
  ['Pâtes (crues)', 'feculents', 355, 12, 70, 3, 1.5, 3, 0, 80, '1 portion', ['pates', 'spaghetti', 'tagliatelle', 'coquillettes', 'penne', 'macaroni', 'lasagne']],
  ['Pâtes (cuites)', 'feculents', 158, 5.5, 30, .6, .9, 1.8, 0, 200, '1 assiette', ['pates cuites']],
  ['Riz (cru)', 'feculents', 355, 7, 78, .3, .7, 1.3, 0, 70, '1 portion', ['riz']], ['Riz (cuit)', 'feculents', 130, 2.7, 28, .1, .3, .4, 0, 180, '1 assiette', ['riz cuit']],
  ['Pain (baguette)', 'feculents', 270, 9, 55, 3, 1.2, 2.7, 1.2, 50, '1/5 de baguette', ['pain', 'baguette']], ['Pain complet', 'feculents', 240, 9, 43, 3, 2.5, 7, 1.1, 50, '2 tranches'],
  ['Pain de mie', 'feculents', 280, 8, 50, 6, 4.5, 3, 1.1, 25, '1 tranche'], ['Farine de blé', 'feculents', 345, 10, 72, 1, 1.2, 3, 0, 30, '2 c. à soupe', ['farine']],
  ['Semoule (crue)', 'feculents', 360, 12, 73, 1, 1.5, 3.5, 0, 70, '1 portion', ['semoule', 'couscous']], ['Quinoa (cru)', 'feculents', 370, 14, 64, 3, 6, 7, 0, 70, '1 portion', ['quinoa']],
  ['Flocons d’avoine', 'feculents', 370, 13, 60, 1, 7, 10, 0, 40, '1 bol', ['flocons d avoine', 'avoine']], ['Céréales (pétales de maïs)', 'feculents', 380, 7, 84, 8, 1, 3, 1.1, 30, '1 bol', ['cereales', 'corn flakes']],
  ['Lentilles (sèches)', 'feculents', 330, 25, 50, 1.5, 1.5, 11, 0, 60, '1 portion', ['lentilles']], ['Lentilles (cuites)', 'feculents', 116, 9, 17, 1, .4, 8, 0, 150, '1 assiette', ['lentilles cuites']],
  ['Pois chiches (cuits)', 'feculents', 140, 8, 19, 1, 2.5, 7.5, 0, 150, '1 portion', ['pois chiches', 'pois chiche']], ['Haricots rouges (cuits)', 'feculents', 120, 8, 18, .5, .5, 7, 0, 150, '1 portion', ['haricots rouges']],
  ['Poulet (blanc cuit)', 'proteines', 150, 30, 0, 0, 3, 0, .2, 120, '1 filet', ['poulet', 'dinde']], ['Steak haché 5 % (cuit)', 'proteines', 180, 27, 0, 0, 8, 0, .2, 100, '1 steak', ['steak hache', 'viande hachee', 'hache']],
  ['Bœuf (steak)', 'proteines', 160, 28, 0, 0, 5, 0, .15, 150, '1 steak', ['boeuf', 'steak']], ['Porc (filet)', 'proteines', 150, 27, 0, 0, 4, 0, .15, 150, '1 portion', ['porc']],
  ['Jambon blanc', 'proteines', 110, 20, 1, 1, 3, 0, 1.9, 40, '1 tranche', ['jambon']], ['Lardons', 'proteines', 270, 15, .5, .5, 23, 0, 2.5, 50, '1/4 de barquette', ['lardon']],
  ['Saucisse', 'proteines', 280, 13, 1, .5, 25, 0, 1.8, 100, '1 saucisse', ['saucisse', 'merguez', 'chipolata']], ['Saumon', 'proteines', 200, 20, 0, 0, 13, 0, .15, 125, '1 pavé'],
  ['Thon (conserve au naturel)', 'proteines', 115, 26, 0, 0, 1, 0, .9, 100, '1 petite boîte', ['thon']], ['Poisson blanc (cabillaud)', 'proteines', 80, 18, 0, 0, .7, 0, .25, 150, '1 filet', ['cabillaud', 'colin', 'lieu', 'merlu', 'poisson']],
  ['Crevettes', 'proteines', 100, 22, 0, 0, 1.2, 0, 1, 100, '1 portion', ['crevette']], ['Œuf', 'proteines', 140, 12.5, .7, .4, 10, 0, .3, 50, '1 œuf', ['oeuf']],
  ['Tofu', 'proteines', 120, 13, 1.5, .6, 7, 1.2, 0, 100, '1 portion'],
  ['Lait demi-écrémé', 'laitiers', 46, 3.3, 4.8, 4.8, 1.6, 0, .1, 250, '1 verre', ['lait']], ['Lait entier', 'laitiers', 64, 3.2, 4.7, 4.7, 3.6, 0, .1, 250, '1 verre', ['lait entier']],
  ['Yaourt nature', 'laitiers', 60, 4, 5, 5, 3, 0, .1, 125, '1 pot', ['yaourt', 'yogourt']], ['Fromage blanc 3 %', 'laitiers', 75, 7.5, 4, 4, 3, 0, .1, 100, '1 portion', ['fromage blanc']],
  ['Crème fraîche 30 %', 'laitiers', 300, 2.3, 3, 3, 30, 0, .1, 30, '2 c. à soupe', ['creme fraiche', 'creme']], ['Beurre', 'laitiers', 745, .7, .6, .6, 82, 0, .05, 10, '1 noisette'],
  ['Emmental / gruyère râpé', 'laitiers', 380, 28, 0, 0, 29, 0, .5, 30, '1 poignée', ['emmental', 'gruyere', 'comte', 'fromage rape']], ['Mozzarella', 'laitiers', 250, 18, 1, 1, 19, 0, .4, 60, '1/2 boule'],
  ['Parmesan', 'laitiers', 400, 33, 0, 0, 29, 0, 1.6, 10, '1 c. à soupe'], ['Camembert', 'laitiers', 280, 20, .5, .5, 22, 0, 1.5, 30, '1 part'],
  ['Feta', 'laitiers', 270, 15, 1, 1, 23, 0, 2.5, 30, '1 part'], ['Chèvre frais', 'laitiers', 200, 11, 3, 3, 16, 0, 1, 30, '1 part', ['chevre']],
  ['Huile d’olive', 'graisses', 900, 0, 0, 0, 100, 0, 0, 10, '1 c. à soupe', ['huile d olive', 'huile']], ['Huile de colza', 'graisses', 900, 0, 0, 0, 100, 0, 0, 10, '1 c. à soupe', ['huile de colza']],
  ['Margarine', 'graisses', 540, .2, .5, .5, 60, 0, .6, 10, '1 noisette'],
  ['Noix', 'coques', 700, 15, 7, 3, 65, 6.5, 0, 15, '1 poignée'], ['Amande', 'coques', 600, 21, 8, 4, 52, 12, 0, 25, '1 poignée'],
  ['Noisette', 'coques', 650, 15, 7, 4, 62, 10, 0, 25, '1 poignée'], ['Cacahuète', 'coques', 590, 25, 11, 4, 49, 8.5, 0, 25, '1 poignée', ['cacahuete', 'arachide']],
  ['Raisins secs', 'coques', 300, 3, 66, 60, .5, 4.5, .05, 30, '1 poignée'], ['Dattes', 'coques', 290, 2.5, 65, 63, .4, 7, 0, 30, '3 dattes', ['datte']],
  ['Sucre', 'sucres', 400, 0, 100, 100, 0, 0, 0, 5, '1 c. à café'], ['Miel', 'sucres', 320, .4, 80, 80, 0, 0, 0, 15, '1 c. à soupe'],
  ['Confiture', 'sucres', 250, .4, 60, 55, .2, 1, 0, 15, '1 c. à soupe'], ['Chocolat noir 70 %', 'sucres', 580, 8, 30, 25, 43, 11, 0, 20, '2 carrés', ['chocolat noir', 'chocolat']],
  ['Chocolat au lait', 'sucres', 540, 7, 57, 55, 31, 2, .25, 20, '2 carrés'], ['Pâte à tartiner', 'sucres', 540, 6, 57, 56, 31, 3.4, .1, 15, '1 c. à soupe', ['pate a tartiner']],
  ['Biscuits secs', 'sucres', 440, 7, 75, 25, 12, 2.5, .8, 25, '3 biscuits', ['biscuit']], ['Croissant', 'sucres', 420, 8, 45, 10, 23, 2, 1, 60, '1 croissant'],
  ['Pizza margherita', 'sucres', 250, 11, 30, 3, 9, 2, 1.3, 250, '1/2 pizza', ['pizza']], ['Frites', 'sucres', 300, 3.4, 35, .5, 15, 3.5, .5, 150, '1 cornet'],
  ['Bouillon (cube)', 'sucres', 230, 8, 20, 5, 13, 1, 50, 10, '1 cube', ['bouillon']],
  ['Eau', 'boissons', 0, 0, 0, 0, 0, 0, 0, 250, '1 verre'], ['Café noir', 'boissons', 1, .1, 0, 0, 0, 0, 0, 150, '1 tasse', ['cafe']],
  ['Jus d’orange', 'boissons', 45, .7, 10, 9, .1, .2, 0, 200, '1 verre', ['jus d orange']], ['Soda au cola', 'boissons', 42, 0, 10.6, 10.6, 0, 0, 0, 330, '1 canette', ['soda', 'cola']],
  ['Lait d’avoine', 'boissons', 45, .5, 7, 4, 1.5, .8, .1, 250, '1 verre', ['lait d avoine', 'lait vegetal']], ['Boisson au soja', 'boissons', 40, 3.3, 2.5, 2, 2, .5, .1, 250, '1 verre', ['lait de soja', 'boisson soja']],
  ['Vin rouge', 'boissons', 70, .1, .2, .2, 0, 0, 0, 125, '1 verre', ['vin']], ['Bière', 'boissons', 42, .4, 3.5, .3, 0, 0, 0, 250, '1 demi', ['biere']]
].map(a => ({ nom: a[0], cat: a[1], kcal: a[2], prot: a[3], gluc: a[4], sucres: a[5], lip: a[6], fibres: a[7], sel: a[8], portion: a[9], portionLib: a[10],
  mots: (a[11] || [sansAccent(a[0]).replace(/\s*\(.*\)/, '').replace(/['’]/g, ' ')]) }));
const NUTRIMENTS = [['kcal', 'Énergie', 'kcal', 2000], ['prot', 'Protéines', 'g', 50], ['gluc', 'Glucides', 'g', 260], ['sucres', 'dont sucres', 'g', 90],
  ['lip', 'Lipides', 'g', 70], ['fibres', 'Fibres', 'g', 25], ['sel', 'Sel', 'g', 6]];
/* les mots reconnus, du plus long au plus court : « pomme de terre » passe avant « pomme » */
const INDEX_NUTRI = [];
ALIMENTS.forEach(a => a.mots.forEach(m => INDEX_NUTRI.push([m, new RegExp('(^|[^a-z])' + m.split(' ').map(w => w + '(?:s|x)?').join('[ -]+') + '([^a-z]|$)'), a])));
INDEX_NUTRI.sort((x, y) => y[0].length - x[0].length);
function alimentDe(nom) {
  const n = sansAccent(nom).replace(/['’]/g, ' ').replace(/[^a-z0-9 -]/g, ' ');
  if (/vegeta/.test(n) && !/lait vegetal/.test(n)) return null;   /* un substitut végétal : on ne devine pas ses valeurs */
  const t = INDEX_NUTRI.find(([, re]) => re.test(n));
  return t ? t[2] : null;
}
/* la quantité en grammes, d'après l'unité ; sans unité, une pièce = la portion de l'aliment */
const UNITES_G = [['kg', 1000], ['mg', .001], ['g', 1], ['gr', 1], ['l', 1000], ['dl', 100], ['cl', 10], ['ml', 1], ['c a soupe', 15], ['cuillere a soupe', 15], ['c a cafe', 5], ['cuillere a cafe', 5],
  ['pincee', .5], ['sachet', 11], ['tranche', 30], ['gousse', 5], ['bouquet', 30], ['pot', 125], ['boite', 400], ['pave', 125], ['verre', 200], ['cube', 10], ['filet', 120], ['noisette', 10], ['bol', 250]];
function grammes(qte, unite, al) {
  const q = nombre(qte); if (!q) return null;
  const u = sansAccent(unite || '').replace(/['’.]/g, ' ').replace(/\(s\)/g, '').replace(/\s+/g, ' ').trim().replace(/s$/, '');
  if (!u || /^(piece|unite|x)$/.test(u)) return al ? q * al.portion : null;
  const f = UNITES_G.find(([k]) => u === k || u.startsWith(k + ' ') || (k.length > 2 && u.startsWith(k)));
  return f ? q * f[1] : null;
}
/* les valeurs d'une recette : total, par portion, et ce qui n'a pas pu être compté */
function nutritionRecette(r, portions) {
  const base = nombre(r.personnes) || 4, p = portions || base, k = p / base;
  const total = {}; NUTRIMENTS.forEach(([c]) => { total[c] = 0; });
  const comptes = [], ignores = [];
  r.ingredients.filter(i => i.nom).forEach(i => {
    const al = alimentDe(i.nom), g = grammes(i.qte, i.unite, al);
    if (!al || g == null) { ignores.push(i.nom); return; }
    NUTRIMENTS.forEach(([c]) => { total[c] += al[c] * g * k / 100; });
    comptes.push(i.nom);
  });
  const parPortion = {}; NUTRIMENTS.forEach(([c]) => { parPortion[c] = total[c] / p; });
  return { total, parPortion, comptes, ignores, portions: p };
}
const fmtNut = (v, c) => c === 'kcal' ? Math.round(v) : c === 'sel' ? joli(Math.round(v * 100) / 100) : joli(Math.round(v * 10) / 10);

/* ---------- la carte « Valeurs nutritionnelles » de la page recette ---------- */
function carteNutritionRecette(r) {
  const e = etatRecette(r.id), n = nutritionRecette(r, e.portions);
  if (!n.comptes.length) return `<section class="carte"><h3><span class="e">📊</span> Valeurs nutritionnelles</h3>${vide('Indiquez les quantités des ingrédients (en g, ml, cuillères ou pièces) pour obtenir une estimation.')}</section>`;
  return `<section class="carte">
    <h3><span class="e">📊</span> Valeurs nutritionnelles</h3>
    <p class="chapo">Estimation par portion (${pluriel(n.portions, 'personne')} au total) · % des repères journaliers d’un adulte</p>
    <div class="nutri-tuiles">${NUTRIMENTS.map(([c, lib, u, ref]) => { const v = n.parPortion[c], pct = Math.round(v / ref * 100);
      return `<div class="${c === 'kcal' ? 'fort' : ''}"><small>${esc(lib)}</small><b>${fmtNut(v, c)} <i>${u}</i></b><span class="mini"><i style="width:${Math.min(100, pct)}%"></i></span><em>${pct} %</em></div>`; }).join('')}</div>
    <p class="ui muet" style="font-size:11.5px;margin:10px 0 0">Tout le plat : ${Math.round(n.total.kcal)} kcal · calcul sur ${n.comptes.length} ingrédient${n.comptes.length > 1 ? 's' : ''} sur ${n.comptes.length + n.ignores.length}${n.ignores.length ? ` — non comptés : ${esc(n.ignores.join(', '))}` : ''}. Valeurs moyennes indicatives.</p>
  </section>`;
}

/* ---------- l'onglet « Nutrition » : le tableau des aliments ---------- */
function menuNutrition() {
  const q = sansAccent(U.chercheNutri || ''), cat = U.catNutri || '', parPortion = U.nutriPortion, tri = U.nutriTri || 'nom', sens = U.nutriSens || 1;
  let ls = ALIMENTS.filter(a => (!cat || a.cat === cat) && (!q || sansAccent(a.nom).includes(q) || a.mots.some(m => m.includes(q))));
  const val = (a, c) => parPortion ? a[c] * a.portion / 100 : a[c];
  ls = ls.slice().sort((x, y) => tri === 'nom' ? sens * x.nom.localeCompare(y.nom) : sens * (val(x, tri) - val(y, tri)));
  const max = {}; NUTRIMENTS.forEach(([c]) => { max[c] = Math.max(1e-9, ...ls.map(a => val(a, c))); });
  const fleche = c => tri === c ? (sens > 0 ? ' ▲' : ' ▼') : '';
  return `<div class="astuce" style="margin-bottom:14px;font-size:13px"><span class="e">📊</span><span>Valeurs moyennes ${parPortion ? 'par portion usuelle' : 'pour 100 g (ou 100 ml)'}, arrondies, dans l’esprit de la table Ciqual de l’ANSES : elles varient selon la variété, la marque et la cuisson. Des repères pour équilibrer, pas un avis médical.</span></div>
    <div class="barre-outils">
      <div class="recherche"><input class="saisie" id="chercheNutri" type="search" placeholder="Un aliment : pomme, riz, œuf…" value="${esc(U.chercheNutri || '')}" aria-label="Rechercher un aliment"></div>
      <div class="filtres"><button type="button" class="filtre${!parPortion ? ' actif' : ''}" data-act="nutri-portion" data-v="0">Pour 100 g</button><button type="button" class="filtre${parPortion ? ' actif' : ''}" data-act="nutri-portion" data-v="1">Par portion</button></div>
    </div>
    <div class="filtres" style="margin-bottom:14px"><button type="button" class="filtre${!cat ? ' actif' : ''}" data-act="nutri-cat" data-c="">Tous · ${ALIMENTS.length}</button>
      ${CATS_NUTRI.map(([k, e, t]) => `<button type="button" class="filtre${cat === k ? ' actif' : ''}" data-act="nutri-cat" data-c="${k}">${e} ${t}</button>`).join('')}</div>
    <section class="carte" style="padding:10px 10px 6px">
      <div class="defile"><table class="tableau-nutri">
        <thead><tr><th><button type="button" data-act="nutri-tri" data-c="nom">Aliment${fleche('nom')}</button></th>
          ${NUTRIMENTS.map(([c, lib, u]) => `<th><button type="button" data-act="nutri-tri" data-c="${c}">${esc(lib)}${fleche(c)}<small>${u}</small></button></th>`).join('')}<th></th></tr></thead>
        <tbody>${ls.map(a => `<tr>
          <td><span class="nom-al">${(CATS_NUTRI.find(c => c[0] === a.cat) || [])[1] || ''} ${esc(a.nom)}</span><small>${parPortion ? esc(a.portionLib) + ' · ' + a.portion + ' g' : 'portion : ' + esc(a.portionLib)}</small></td>
          ${NUTRIMENTS.map(([c]) => { const v = val(a, c); return `<td class="v v-${c}" style="--p:${Math.round(v / max[c] * 100)}%">${fmtNut(v, c)}</td>`; }).join('')}
          <td><button type="button" class="btn-rond" data-act="nutri-course" data-n="${esc(a.nom.replace(/\s*\(.*\)/, ''))}" title="Ajouter aux courses" aria-label="Ajouter ${esc(a.nom)} aux courses">🛒</button></td></tr>`).join('')
          || `<tr><td colspan="${NUTRIMENTS.length + 2}">${vide('Aucun aliment ne correspond.')}</td></tr>`}</tbody>
      </table></div>
    </section>
    <p class="ui muet" style="font-size:11.5px;margin:10px 4px 0">Repères journaliers d’un adulte (étiquetage européen) : 2 000 kcal, 50 g de protéines, 260 g de glucides dont 90 g de sucres, 70 g de lipides, 6 g de sel ; fibres : 25 g conseillés. Les besoins varient selon l’âge, l’activité et la santé.</p>`;
}

const ACT_NUT = {};
ACT_NUT['nutri-cat'] = el => { U.catNutri = el.dataset.c; rendre(); };
ACT_NUT['nutri-portion'] = el => { U.nutriPortion = el.dataset.v === '1'; rendre(); };
ACT_NUT['nutri-tri'] = el => { const c = el.dataset.c; if (U.nutriTri === c) U.nutriSens = -(U.nutriSens || 1); else { U.nutriTri = c; U.nutriSens = c === 'nom' ? 1 : -1; } rendre(); };
ACT_NUT['nutri-course'] = el => { const c = ajouterCourse(el.dataset.n); maj(); toast(`${c.nom} ajouté aux courses 🛒`); };
