/* ============================================================
   NaoDaily — « Comment ça marche » : le mode d'emploi.
   Même forme que NaoAgenda, NaoBaby et NaoPets : sommaire à gauche,
   fiche à droite, et une recherche qui garde les sujets contenant
   le mot tapé. Ouvert par le bouton ❓ de l'en-tête, ou F1.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
'use strict';
const AIDE = [
  { id: 'demarrer', em: '🚀', t: 'Premiers pas', chapo: 'Le quotidien, simplement organisé : quelques minutes pour bien démarrer.',
    b: [
      ['p', 'NaoDaily réunit tout ce qu’on ne veut plus garder en tête : <b>les listes</b> (tâches, valise, ménage, films…), <b>les menus et les courses</b>, <b>les cadeaux et les occasions</b>. Tout converge vers une seule page, <b>☀️ Aujourd’hui</b>, qui vous dit ce qui compte maintenant.'],
      ['etapes', ['Touchez <b>＋ Ajouter</b> sur la page Aujourd’hui : tâche, article de courses, repas, idée cadeau, liste, rappel, proche, recette ou idée repas — choisissez, NaoDaily range.',
        'Créez une première liste depuis un <b>modèle</b> (courses, valise, ménage…) : elle arrive avec quelques idées pour commencer.',
        'Planifiez un ou deux <b>repas</b> de la semaine : leurs ingrédients peuvent partir tout seuls dans la liste de courses.',
        'Ajoutez vos <b>proches</b> avec leur date d’anniversaire : NaoDaily vous préviendra à temps.',
        'Revenez chaque jour sur <b>☀️ Aujourd’hui</b> et cochez ce qui est fait.']],
      ['p', 'Envie de voir l’outil rempli avant de vous lancer ? Tant que NaoDaily est vide, la page Aujourd’hui propose <b>✨ Découvrir avec un exemple</b> : des listes, des recettes, un menu, des proches et des cadeaux fictifs, à explorer et modifier librement.'],
      ['astuce', 'Pour repartir de zéro après l’exemple, utilisez <b>♻️ Réinitialiser</b> en haut de la page (voir la fiche « Réinitialiser l’outil »).'],
      ['sous', 'Les cinq espaces'],
      ['liste', [['☀️ Aujourd’hui', 'votre journée en un coup d’œil.'],
        ['📝 Mes listes', 'toutes vos listes, leurs éléments, les archives.'],
        ['🍽️ Menus & courses', 'planning des repas, idées, saisons, recettes, courses, anti-gaspillage, nutrition et allergies.'],
        ['🎁 Cadeaux & occasions', 'idées cadeaux, proches, occasions, budget, listes d’envies, mots pour la carte.'],
        ['⭐ Favoris', 'ce qui revient souvent, rangé au même endroit.']]],
      ['p', 'Un petit chiffre sur un onglet signale ce qui attend : tâches prioritaires, articles à acheter, occasions dans les 14 jours.'],
    ] },
  { id: 'aujourdhui', em: '☀️', t: 'La page Aujourd’hui', chapo: 'Un coup d’œil, et vous savez où vous en êtes.',
    b: [
      ['sous', 'Ma journée'],
      ['p', 'En haut : la date, une phrase douce qui change chaque jour, et quatre chiffres — tâches prioritaires, repas prévus, articles à acheter, occasions sous 30 jours. <b>Touchez un chiffre</b> pour ouvrir l’espace correspondant. Le cercle à droite compte les tâches cochées aujourd’hui.'],
      ['sous', 'Les actions rapides'],
      ['p', 'Six gros boutons : <b>＋ Ajouter</b> (le choix de tout ce qu’on peut créer), ajouter une tâche, créer une liste, planifier un repas, ajouter un article de courses, ajouter une idée cadeau.'],
      ['sous', 'Les cartes'],
      ['liste', [['✅ Mes tâches prioritaires', 'en retard, prévues aujourd’hui, marquées importantes, ou dans une liste « Tâches du jour ». Les sept premières s’affichent ; « Voir les autres » ouvre Mes listes.'],
        ['🍽️ Le repas du jour', 'petit-déjeuner, déjeuner, dîner (et collation si prévue). Une case vide propose « Qu’est-ce qu’on mange ? ». Sans dîner prévu, NaoDaily pioche une idée pour ce soir dans vos idées repas.'],
        ['🛒 Ma liste de courses', 'un champ pour ajouter un article et les six premiers à acheter.'],
        ['🎂 Prochaines occasions', 'anniversaires et fêtes à venir, avec les cadeaux à acheter, emballer ou offrir — un bouton les fait passer à l’étape suivante.'],
        ['📌 À ne pas oublier', 'vos rappels, les occasions qui approchent et ce qui est à consommer bientôt.'],
        ['⚡ Mes raccourcis', 'listes favorites, produits habituels (un clic = aux courses) et recettes favorites (un clic = planifier).'],
        ['🍓 Ce mois-ci', 'les fruits et légumes de saison ; toucher un produit l’ajoute aux courses.']]],
      ['astuce', 'À minuit, la page passe toute seule au jour suivant, même si NaoDaily est resté ouvert.'],
    ] },
  { id: 'listes', em: '📝', t: 'Mes listes', chapo: 'Tout ce qu’on ne veut plus garder en tête.',
    b: [
      ['sous', 'Créer une liste'],
      ['p', '<b>＋ Créer une liste</b> propose 17 modèles : tâches du jour, courses, ménage, valise, voyage, déménagement, rentrée, projet, achats, documents, films & séries, livres, jeux, idées, souhaits, objectifs… ou une liste libre. Donnez-lui un nom, une petite image, dites si elle est partagée, et cochez « Ajouter les suggestions du modèle » pour démarrer avec quelques éléments.'],
      ['sous', 'Dans une liste'],
      ['liste', [['Ajouter', 'tapez dans le champ puis Entrée. <b>＋ Détails</b> ajoute une quantité, une priorité, une date, un rappel et une note.'],
        ['Cocher', 'le rond à gauche. Une liste terminée vous félicite et propose de l’archiver.'],
        ['Modifier', 'touchez le texte d’un élément.'],
        ['⏰', 'transforme l’élément en rappel (et peut le retirer de la liste ensuite).'],
        ['🗑', 'supprime l’élément ; « Annuler » apparaît quelques secondes.'],
        ['Tout décocher', 'remet la liste à zéro, pratique pour une valise ou un ménage qui revient.']]],
      ['sous', 'Les boutons de la liste'],
      ['liste', [['☆', 'en favori : elle apparaît dans les raccourcis d’Aujourd’hui et dans ⭐ Favoris.'],
        ['✏️ Modifier', 'nom, image, type, partage.'],
        ['⧉ Dupliquer', 'une copie, tout décoché.'],
        ['👥 Partager', 'un texte ou un fichier à envoyer à un proche.'],
        ['🗄️ Archiver', 'la range sans l’effacer ; le filtre « Archivées » la retrouve.'],
        ['🗑', 'la supprime, après confirmation.']]],
      ['sous', 'Retrouver'],
      ['p', 'La recherche fouille les noms de listes <b>et</b> le texte des éléments (notes comprises), et montre les éléments trouvés. Les filtres : Toutes, ⭐ Mes favoris, 👥 Partagées, 🗄️ Archivées.'],
      ['astuce', 'Une liste de type « Courses » a un bouton <b>🛒 Envoyer vers Ma liste de courses</b> : ses éléments non cochés rejoignent la vraie liste de courses, rangés par rayon.'],
      ['p', 'La liste <b>🛍️ À acheter</b> se crée toute seule quand vous y envoyez une idée cadeau (voir « Idées cadeaux et suivi »).'],
    ] },
  { id: 'taches', em: '⏰', t: 'Tâches et rappels', chapo: 'Ce qui doit être fait, et ce dont il faut se souvenir.',
    b: [
      ['sous', 'Ajouter une tâche'],
      ['p', 'Choisissez la liste qui l’accueille (par défaut <b>☀️ Tâches du jour</b>, créée si besoin), sa priorité (Importante, Normale, Quand j’ai le temps), le jour prévu et une note. Une tâche en retard, prévue aujourd’hui ou importante remonte dans « Mes tâches prioritaires ».'],
      ['sous', 'Les rappels'],
      ['p', '<b>＋ Rappel</b> (carte « À ne pas oublier ») : un texte et un jour. Le rappel apparaît <b>à partir de deux jours avant</b>. Vous pouvez aussi transformer un élément de liste ou un article de courses en rappel avec ⏰.'],
      ['p', 'Sur un élément de liste daté, la case <b>« ⏰ Me le rappeler »</b> le fait apparaître dans « À ne pas oublier » la veille et le jour même.'],
      ['sous', 'À ne pas oublier'],
      ['liste', [['⏰ Vos rappels', '✓ quand c’est fait.'],
        ['Les éléments de listes avec rappel', '✓ les coche dans leur liste.'],
        ['Les occasions qui approchent', 'selon les rappels choisis (un mois, deux semaines, une semaine, trois jours, la veille), avec l’état du cadeau.'],
        ['🥛 À consommer bientôt', 'deux jours avant la date.']]],
      ['p', '<b>Tous mes rappels →</b> ouvre la liste complète : ✓ c’est fait, ↺ réactiver, 🗑 supprimer, 🧹 effacer les rappels faits.'],
    ] },
  { id: 'menus', em: '🗓️', t: 'Le planning des repas', chapo: 'Un repas prévu, c’est une question de moins à 19 h.',
    b: [
      ['p', 'Dans <b>🍽️ Menus & courses → 🗓️ Planning des repas</b>, la semaine s’affiche en grille : un jour par colonne, une ligne par moment (petit-déjeuner, déjeuner, dîner, collation). <b>Touchez une case</b> pour y planifier un repas, ou un repas pour le modifier.'],
      ['sous', 'Planifier un repas'],
      ['liste', [['Jour et moment', 'pré-remplis selon la case touchée (ou l’heure qu’il est).'],
        ['Recette', 'une de vos recettes… ou « Repas libre » : écrivez simplement ce qui est au menu (vos idées repas sont proposées pendant la saisie).'],
        ['Nombre de personnes', 'les quantités de la recette s’ajustent toutes seules.'],
        ['🛒 Ajouter ses ingrédients', 'pour une recette : ils partent dans la liste de courses.']]],
      ['sous', 'Les boutons du planning'],
      ['liste', [['‹ ›, Cette semaine', 'pour naviguer.'],
        ['Semaine / Mois', 'la vue mois montre tout le mois ; touchez un jour pour ouvrir sa semaine.'],
        ['👥 Partager', 'le menu de la semaine, en texte ou en fichier.'],
        ['🛒 Générer les courses', 'ajoute les ingrédients de toutes les recettes de la semaine affichée, ajustés au nombre de personnes et rangés par rayon. Un repas déjà passé aux courses n’est pas ajouté deux fois.']]],
      ['astuce', 'Un repas déjà planifié peut envoyer ses ingrédients plus tard : ouvrez-le, puis <b>🛒 Ingrédients aux courses</b>.'],
    ] },
  { id: 'idees', em: '💡', t: 'Idées repas et produits de saison', chapo: 'Quand l’inspiration manque.',
    b: [
      ['sous', '💡 Idées repas'],
      ['p', 'Une réserve de plats qui vous font envie, <b>sans recette à écrire</b>. Ajoutez-les d’une ligne, classez-les par catégorie (rapide, économique, équilibré, familial, végétarien, repas de fête, à préparer à l’avance, restes à utiliser), marquez vos favorites ☆.'],
      ['liste', [['📅 Planifier', 'ouvre le formulaire de repas avec ce plat.'],
        ['📖', 'en fait une vraie recette.'],
        ['🎲 Une idée au hasard', 'pioche dans vos idées (ou dans l’inspiration), en évitant ce que vous avez mangé ces cinq derniers jours et ce qui pose un problème d’allergie.'],
        ['Besoin d’inspiration ?', 'des suggestions par catégorie : un clic les ajoute à vos idées.']]],
      ['sous', '🍓 De saison'],
      ['p', 'Le calendrier des fruits et légumes de saison en France, mois par mois : ce qui arrive (« nouveau »), ce qui vit ses derniers jours, l’info du mois et des idées de plats à ajouter à vos idées ou à planifier. <b>Touchez un produit</b> pour l’ajouter aux courses.'],
      ['astuce', 'Dans la liste de courses, la pastille <b>🍓 de saison</b> signale les fruits et légumes du mois.'],
    ] },
  { id: 'recettes', em: '📖', t: 'Mes recettes', chapo: 'Les écrire une fois, s’en servir tout le temps.',
    b: [
      ['sous', 'Créer une recette'],
      ['p', '<b>＋ Nouvelle recette</b> : le nom, une image, pour combien de personnes, la difficulté, les temps de préparation, de cuisson et de repos, les catégories, puis :'],
      ['liste', [['Les ingrédients', 'nom, quantité, unité et rayon (laissé sur « auto », il se devine tout seul). Entrée ajoute une ligne.'],
        ['Les étapes', 'une par ligne. Écrivez les durées (« 25 min ») : un minuteur apparaîtra sur la page de la recette.'],
        ['Les ustensiles et les astuces', 'facultatifs.']]],
      ['p', 'La recherche trouve une recette par son nom <b>ou par un ingrédient</b>. Les filtres : favorites, catégories, et « 🛡️ Compatibles allergies » si des allergies sont renseignées. Chaque carte a <b>📅 Planifier</b> et <b>🛒 Aux courses</b>.'],
      ['sous', 'La page d’une recette'],
      ['liste', [['Pour − / +', 'change le nombre de portions ; les quantités suivent.'],
        ['Ingrédients', 'cochez ce que vous avez déjà, puis <b>🛒 Ajouter ce qui manque aux courses</b>.'],
        ['Comment on fait', 'touchez une étape quand elle est faite ; « Tout recommencer » remet à zéro.'],
        ['⏱ Minuteurs', 'un bouton par durée écrite dans une étape, et un minuteur de cuisson. Ils s’affichent dans un coin de l’écran et sonnent quand c’est prêt.'],
        ['📊 Valeurs nutritionnelles', 'une estimation par portion (voir « Nutrition »).'],
        ['🖨️ Imprimer', 'une fiche propre, aux portions choisies.']]],
      ['astuce', 'Supprimer une recette déjà planifiée ne vide pas le menu : les repas restent, sous le nom de la recette.'],
    ] },
  { id: 'courses', em: '🛒', t: 'La liste de courses', chapo: 'Elle se range toute seule par rayon.',
    b: [
      ['sous', 'Ajouter'],
      ['p', 'Tapez l’article, avec la quantité devant si vous voulez : <b>« 2 kg pommes »</b>, <b>« 6 œufs »</b>, <b>« 1 l lait »</b>. Il se range dans son rayon : fruits & légumes, frais, viandes & poissons, épicerie, surgelés, boissons, hygiène & entretien, autres. Ajouter deux fois le même article additionne les quantités.'],
      ['p', 'Touchez un article pour le modifier : quantité, unité, rayon, prix estimé, note (marque, magasin…).'],
      ['sous', 'Pendant les courses'],
      ['liste', [['Cocher', 'l’article passe « Dans le panier ». Décochez si besoin.'],
        ['🧹 Retirer les articles achetés', 'vide le panier quand vous rentrez.'],
        ['☆', 'en fait un <b>produit habituel</b> : un clic suffit ensuite pour le remettre sur la liste.'],
        ['⏰', 'le transforme en rappel (« Acheter : … »).']]],
      ['sous', 'Les produits habituels'],
      ['p', 'Lait, pain, café, lessive… <b>Gérer</b> permet d’en ajouter, d’en retirer, ou de partir des classiques proposés.'],
      ['sous', 'Budget, impression, partage'],
      ['liste', [['💶 Budget estimé', 'la somme des prix connus ; pour les autres, un prix moyen du rayon. Uniquement indicatif.'],
        ['🖨️ Imprimer', 'la liste rangée par rayon.'],
        ['⬇️ Exporter', 'un fichier texte.'],
        ['👥 Partager', 'un texte à coller, ou un fichier pour le NaoDaily d’un proche.'],
        ['🍽️ Depuis le menu', 'les ingrédients des recettes planifiées.']]],
      ['astuce', 'Les achats de la liste « 🛍️ À acheter » (cadeaux, achats ponctuels) s’affichent aussi ici, dans « Aussi à acheter ».'],
    ] },
  { id: 'antigaspi', em: '♻️', t: 'Anti-gaspillage', chapo: 'Rien ne se perd dans le frigo.',
    b: [
      ['p', 'Dans <b>⏳ À consommer bientôt</b>, notez un produit entamé, un reste ou une date qui approche : quoi, quelle quantité, à consommer avant le…'],
      ['liste', [['Les couleurs', 'la ligne s’allume quand la date approche (J-3, puis la veille).'],
        ['Sur Aujourd’hui', 'le produit apparaît dans « À ne pas oublier » deux jours avant.'],
        ['🍳', 'cherche vos recettes qui l’utilisent, ou marquées « Restes à utiliser », pour les planifier.'],
        ['✓', 'consommé : il disparaît (avec « Annuler » au cas où).']]],
      ['p', 'À côté : des idées anti-gaspillage simples, et vos recettes de la catégorie « ♻️ Restes à utiliser ».'],
    ] },
  { id: 'nutrition', em: '📊', t: 'Nutrition', chapo: 'Des repères pour équilibrer, pas un avis médical.',
    b: [
      ['p', 'L’onglet <b>📊 Nutrition</b> présente environ 115 aliments courants : énergie, protéines, glucides, sucres, lipides, fibres et sel, <b>pour 100 g</b> ou <b>par portion</b> usuelle.'],
      ['liste', [['Chercher', 'un aliment par son nom.'],
        ['Trier', 'touchez l’en-tête d’une colonne (une seconde fois pour inverser).'],
        ['Catégories', 'fruits, légumes, féculents, viandes et poissons, laitiers…'],
        ['🛒', 'ajoute l’aliment aux courses.']]],
      ['sous', 'Sur vos recettes'],
      ['p', 'NaoDaily estime les valeurs <b>par portion</b> et le pourcentage des repères journaliers d’un adulte, à partir des ingrédients reconnus. Indiquez les quantités en g, ml, cuillères ou pièces pour une estimation possible. Les cartes de recette affichent alors « 🔥 ~ kcal ».'],
      ['astuce', 'Les valeurs sont des moyennes arrondies, dans l’esprit de la table Ciqual de l’ANSES : elles varient selon la variété, la marque et la cuisson.'],
    ] },
  { id: 'allergies', em: '🛡️', t: 'Allergies et intolérances', chapo: 'Cuisiner pour tout le monde, en confiance.',
    b: [
      ['p', 'Dans <b>🛡️ Allergies</b>, ajoutez chaque personne concernée (du foyer, ou un invité régulier). Pour chacun des <b>14 allergènes</b> à déclaration obligatoire, choisissez un niveau — et ajoutez d’autres aliments à éviter (fraise, kiwi…).'],
      ['liste', [['🟡 Tolérée en petite quantité', 'à surveiller, sans plus.'],
        ['🟠 Intolérance', 'à éviter, remplacé dans les courses.'],
        ['🔴 Allergie', 'à exclure des recettes et des courses.'],
        ['🚨 Allergie sévère', 'même une trace est dangereuse : tout est bloqué et vérifié.']]],
      ['sous', 'Ce qui s’adapte'],
      ['liste', [['Des pastilles', 'sur les recettes, les repas, les idées et les articles de courses concernés.'],
        ['🛡️ Créer une version adaptée', 'sur la page d’une recette : les ingrédients concernés sont remplacés, la recette d’origine est gardée.'],
        ['Les courses', 'quand une recette remplit la liste, les ingrédients concernés peuvent être remplacés automatiquement (option à cocher ; toujours pour une allergie sévère). Un bouton « Remplacer » existe aussi article par article.'],
        ['Les repas', 'planifier un repas avec une allergie sévère demande de cocher « J’ai vérifié ».'],
        ['Les récapitulatifs', 'recettes, repas des 15 prochains jours, courses et idées concernés.']]],
      ['p', 'Décochez « Prendre en compte » pour un invité absent : sa fiche est mise en pause. Le champ <b>Conduite à tenir</b> s’affiche sur les recettes à risque sévère.'],
      ['astuce', 'NaoDaily repère les allergènes à partir du <b>nom</b> des ingrédients : c’est une aide, jamais une garantie. Vérifiez toujours les étiquettes (traces, contaminations croisées) et suivez les conseils de votre médecin ou allergologue. En cas de réaction grave : <b>15</b> ou <b>112</b>.'],
    ] },
  { id: 'cadeaux', em: '🎁', t: 'Idées cadeaux et suivi', chapo: 'Le bon cadeau, prévu à temps.',
    b: [
      ['p', 'Notez chaque idée qui passe — un livre évoqué, une envie glissée au détour d’une conversation — puis suivez-la jusqu’au jour J. Dans <b>🎁 Idées & suivi</b>, les cadeaux sont rangés en cinq colonnes :'],
      ['etapes', ['💡 <b>Idée</b>', '🛒 <b>À acheter</b>', '🛍️ <b>Acheté</b>', '🎀 <b>Emballé</b>', '🎁 <b>Offert</b> — il rejoint l’historique.']],
      ['p', 'Le bouton <b>→</b> d’une carte la fait passer à l’étape suivante. Touchez la carte pour tout modifier : pour qui, pour quelle occasion, budget prévu, prix payé, catégorie, magasin, lien, photo, note.'],
      ['sous', 'La liste « À acheter »'],
      ['p', '<b>🛍️ À acheter</b> envoie le cadeau dans une liste du même nom. Cochez-le là-bas une fois acheté : le cadeau passe à « Acheté ». Et inversement.'],
      ['sous', 'Le cadeau commun'],
      ['p', 'Cochez <b>🤝 Cadeau commun</b>, ajoutez les participants : NaoDaily calcule la part de chacun à partir du prix ou du budget, et vous cochez qui a payé.'],
      ['astuce', 'NaoDaily vous prévient si une idée ressemble à un cadeau <b>déjà offert</b> à la même personne : fini les doublons.'],
      ['p', 'Le menu « Pour » filtre les cadeaux d’un proche.'],
    ] },
  { id: 'proches', em: '👥', t: 'Proches et occasions', chapo: 'Les dates qui comptent, sans y penser.',
    b: [
      ['sous', '👥 Mes proches'],
      ['p', 'Une fiche par proche : prénom, lien avec vous, une image, la date d’anniversaire (et l’année si vous la connaissez, pour afficher l’âge), quand être prévenu·e, ses goûts, centres d’intérêt, tailles, couleurs préférées et notes. Seul le prénom est obligatoire.'],
      ['p', 'Touchez une fiche pour la voir en entier : idées en cours, cadeaux déjà offerts, et <b>＋ Idée cadeau</b> pour elle ou lui.'],
      ['sous', '📅 Occasions'],
      ['liste', [['Toutes seules', 'les anniversaires des fiches, Noël et la Saint-Valentin. « Ne pas afficher cette année » masque une fête qui ne vous concerne pas.'],
        ['Les vôtres', '＋ Occasion : type (fête, mariage, naissance, crémaillère, remerciement…), date, intitulé, pour qui, « revient chaque année », note.'],
        ['Les rappels', 'un mois avant, deux semaines, une semaine, trois jours ou la veille : ils apparaissent dans « À ne pas oublier ».']]],
      ['exemple', 'Anniversaire de Léa, rappels deux semaines et la veille : 14 jours avant, « Anniversaire de Léa dans 14 jours — Pas encore d’idée cadeau » s’affiche sur Aujourd’hui.'],
    ] },
  { id: 'budget', em: '💶', t: 'Budget, historique et mots pour la carte', chapo: 'Des repères, pas des contraintes.',
    b: [
      ['sous', '💶 Budget & historique'],
      ['liste', [['✏️ Budgets', 'un budget cadeaux pour le mois et pour l’année ; une jauge montre ce qui est dépensé et ce qui reste.'],
        ['Encore prévu', 'le total des idées et cadeaux « à acheter » (prix ou budget indiqué).'],
        ['Par personne', 'ce qui a été dépensé pour chacun cette année.'],
        ['📜 Historique', 'les cadeaux offerts, année par année.']]],
      ['p', 'Les dépenses comptées sont celles des cadeaux achetés, emballés ou offerts, avec un prix payé.'],
      ['sous', '💌 Mots pour la carte'],
      ['p', 'Des idées de messages pour un anniversaire, Noël, une naissance, un mariage, un merci ou une fête, en trois tons : 🤍 doux, 😄 drôle, ✒️ élégant. Choisissez « Pour » : le prénom s’insère. <b>🎲 Une autre idée</b> change l’ordre, <b>📋 Copier</b> met le message dans le presse-papiers.'],
    ] },
  { id: 'envies', em: '🌠', t: 'Les listes d’envies', chapo: 'Pour répondre à « qu’est-ce qui te ferait plaisir ? ».',
    b: [
      ['p', 'Une liste par occasion ou par personne : Noël, votre anniversaire, celle de votre enfant… Partez d’un modèle ou d’une liste libre, puis choisissez son nom, son symbole, sa <b>couleur</b>, pour qui, et une date (un compte à rebours s’affiche, chaque année).'],
      ['sous', 'Ajouter une envie'],
      ['liste', [['L’essentiel', 'ce qui ferait plaisir, le lien vers l’article, le prix, où le trouver, des précisions (taille, couleur…).'],
        ['L’image', '📷 une photo de l’ordinateur, l’adresse d’une image, ou <b>collez-la</b> : sur un site, clic droit sur l’image → « Copier l’image », puis <kbd>Ctrl</kbd> + <kbd>V</kbd> dans la fenêtre.'],
        ['♥ Coup de cœur', 'mis en avant chez vos proches.'],
        ['✓ Offert', 'l’envie porte un ruban « 🎁 Offert » ; ↺ la remet « à offrir ».']]],
      ['p', 'Les filtres (coups de cœur, à offrir, déjà offertes) et le tri (récentes, coups de cœur, prix) aident à s’y retrouver quand la liste s’allonge.'],
      ['sous', '📤 Envoyer à mes proches'],
      ['liste', [['🌐 La page de ma liste', 'un fichier web autonome, avec photos, prix, liens et coups de cœur, qui s’ouvre sur n’importe quel téléphone ou ordinateur, sans NaoDaily.'],
        ['✉️ E-mail, 💬 WhatsApp, 📋 Copier', 'la liste en texte, avec les liens.'],
        ['📄 Fichier NaoDaily', 'pour un proche qui a NaoDaily : il l’ouvre avec 📂.']]],
      ['astuce', 'Les envies déjà offertes ne sont pas envoyées : la surprise reste entière.'],
    ] },
  { id: 'favoris', em: '⭐', t: 'Favoris et raccourcis', chapo: 'Ce qui revient souvent, à portée de clic.',
    b: [
      ['p', 'L’étoile <b>☆</b> existe sur les listes, les recettes, les idées repas et les articles de courses (qui deviennent alors des produits habituels).'],
      ['liste', [['⭐ Favoris', 'listes favorites, recettes favorites, produits habituels et listes partagées, sur une seule page.'],
        ['⚡ Mes raccourcis', 'sur Aujourd’hui, les mêmes en version rapide : un produit habituel touché part aux courses, une recette favorite touchée propose de la planifier.']]],
    ] },
  { id: 'partage', em: '👥', t: 'Partager avec un proche', chapo: 'Sans compte, sans rien installer.',
    b: [
      ['p', 'Une liste, la liste de courses, le menu de la semaine ou une liste d’envies peuvent être partagés de deux façons :'],
      ['liste', [['📋 Un texte', 'à coller dans un SMS, un e-mail, une messagerie.'],
        ['📄 Un fichier .naodaily', 'que votre proche ouvre avec <b>📂</b> dans son propre NaoDaily.']]],
      ['sous', 'Recevoir un partage'],
      ['p', 'Touchez <b>📂</b>, choisissez le fichier reçu : une liste arrive dans Mes listes (« (reçue) » si le nom existe déjà), des courses s’ajoutent à votre liste, un menu ajoute ses repas et ses recettes, une liste d’envies rejoint vos listes d’envies. Rien n’est remplacé.'],
      ['astuce', 'Marquer une liste « 💞 En couple », « 👨‍👩‍👧 En famille » ou « 🏠 En colocation » la range dans les listes partagées ; pour la transmettre, utilisez 👥 Partager.'],
    ] },
  { id: 'donnees', em: '💾', t: 'Sauvegarde, synchronisation et export', chapo: 'Ce qui est gardé, où, et comment le mettre à l’abri.',
    b: [
      ['p', 'Tout ce que vous saisissez est enregistré <b>aussitôt</b>, dans le navigateur de cet appareil. Les photos (cadeaux, envies) sont réduites avant d’être gardées, mais prennent de la place : si la mémoire du navigateur est pleine, NaoDaily vous le dit.'],
      ['sous', 'Sauvegarder et recharger'],
      ['liste', [['💾 Sauvegarder', 'télécharge un fichier de sauvegarde (.json) avec tout votre quotidien.'],
        ['📂 Recharger', 'ouvre une sauvegarde (elle remplace le contenu actuel, après confirmation, avec « Annuler » juste après) — ou un fichier de partage reçu d’un proche.']]],
      ['sous', 'La synchronisation NaoGroup'],
      ['p', 'Quand vous ouvrez NaoDaily depuis votre espace <b>NaoGroup</b> avec votre profil, votre quotidien suit ce profil : il est récupéré à l’ouverture de l’outil et envoyé quand vous le quittez, pour le retrouver sur vos autres appareils. En mode visite, rien n’est synchronisé.'],
      ['sous', 'Exporter et imprimer'],
      ['liste', [['La liste de courses', '🖨️ imprimer ou ⬇️ exporter en texte.'],
        ['Une recette', '🖨️ imprimer, aux portions choisies.'],
        ['Une liste d’envies', '🌐 une page web à envoyer.'],
        ['Listes, courses, menu', '👥 partager en texte ou en fichier.']]],
      ['astuce', 'Faites une sauvegarde 💾 de temps en temps, et toujours avant de changer d’ordinateur, de nettoyer votre navigateur ou de réinitialiser l’outil.'],
    ] },
  { id: 'reinitialiser', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Repartir d’une page blanche, comme au premier jour.',
    b: [
      ['p', 'Le bouton <b>♻️</b> en haut de la page efface <b>tout</b> ce qui a été saisi dans NaoDaily : listes, menus, recettes, courses, proches, cadeaux, occasions, envies, rappels — et les réglages (thème, A+, animations). L’outil redevient vierge, comme pour une nouvelle personne.'],
      ['etapes', ['Touchez <b>♻️</b> (« Réinitialiser l’outil »).',
        'Conseil : touchez d’abord <b>Sauvegarder</b> dans la fenêtre, pour garder une copie.',
        'Tapez <b>EFFACER</b> dans le champ de confirmation.',
        'Touchez <b>🗑 Tout effacer</b> : NaoDaily revient sur Aujourd’hui, tout neuf.']],
      ['astuce', 'Il n’y a <b>pas d’« Annuler »</b> après une réinitialisation. Seule une sauvegarde faite avant permet de tout retrouver, avec 📂.'],
      ['p', 'Pour effacer une seule chose, inutile de tout réinitialiser : chaque liste, recette, proche ou cadeau a son propre bouton 🗑 Supprimer.'],
    ] },
  { id: 'reglages', em: '⌨️', t: 'Réglages et raccourcis', chapo: 'Pour que l’outil vous ressemble.',
    b: [
      ['liste', [['☾ / ☀', 'thème sombre ou clair.'],
        ['A+', 'agrandit le texte (un second clic revient à la taille normale).'],
        ['🕊️', 'met les animations du décor en pause. Si votre ordinateur demande moins d’animations, NaoDaily le respecte déjà.'],
        ['L’ouverture', 'l’animation d’entrée se passe d’un clic, ou avec Échap, Entrée ou Espace.']]],
      ['sous', 'Au clavier'],
      ['liste', [['F1 ou ?', 'ouvrir cette aide.'],
        ['Échap', 'fermer la fenêtre ouverte.'],
        ['Entrée', 'ajouter un élément, un article ou une idée dans les champs d’ajout rapide.']]],
      ['astuce', 'Après une suppression, le petit message en bas de l’écran propose <b>Annuler</b> pendant quelques secondes.'],
    ] },
  { id: 'questions', em: '💬', t: 'Questions fréquentes', chapo: 'Les petites choses qu’on se demande.',
    b: [
      ['liste', [['Ma tâche n’apparaît pas dans les prioritaires ?', 'elle doit être en retard, prévue aujourd’hui, marquée « Importante », ou rangée dans une liste « Tâches du jour ». Les listes de courses, films, livres, jeux, idées, souhaits et achats n’y remontent pas.'],
        ['« Générer les courses » est grisé ?', 'aucune recette n’est planifiée cette semaine : les repas libres n’ont pas d’ingrédients.'],
        ['Un article est dans le mauvais rayon ?', 'touchez-le et choisissez le bon rayon.'],
        ['Mon rappel n’est pas sur Aujourd’hui ?', 'il apparaît à partir de deux jours avant sa date.'],
        ['Noël ne me concerne pas ?', 'ouvrez-le dans les occasions : « Ne pas afficher cette année ».'],
        ['J’ai supprimé quelque chose par erreur ?', 'touchez « Annuler » dans le message qui apparaît en bas.'],
        ['Je veux retrouver mon quotidien sur un autre ordinateur ?', '💾 sauvegardez ici, puis 📂 rechargez là-bas — ou ouvrez NaoDaily depuis votre espace NaoGroup.']]],
      ['sous', 'Petites astuces'],
      ['liste', [['Une valise qui revient', 'dupliquez la liste ⧉ : la copie est toute décochée.'],
        ['Le dimanche soir', 'planifiez la semaine, puis 🛒 Générer les courses.'],
        ['Les produits entamés', 'notez-les dans ⏳ À consommer bientôt : ils reviennent sur Aujourd’hui au bon moment.']]],
    ] },
];

function ouvrirAide(sec) {
  if ($('#intro')) return;   /* l'animation d'entrée est encore là */
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🧩</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  ouvrirModale(`<div class="aide-h">
      <div><h3 id="modaleTitre"><span>❓</span>Comment ça marche</h3>
        <p class="sous" style="margin:2px 0 0">Tout NaoDaily, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span style="flex:1"></span>
      <input type="search" id="aide-q" placeholder="Chercher : courses, rappel, envies…" aria-label="Chercher dans l’aide" autocomplete="off">
      <button type="button" class="btn fin" data-f="fermer">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
        <p class="aide-vide" id="aide-vide" hidden>Aucun sujet ne contient ce mot.</p>
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`, fen => {
    fen.classList.add('aide');
    const nav = fen.querySelector('#aide-nav'), pan = fen.querySelector('#aide-p'), q = fen.querySelector('#aide-q');
    fen.querySelector('[data-f="fermer"]').addEventListener('click', fermerModale);
    let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
    const montrer = id => {
      courant = id;
      pan.innerHTML = fiche(AIDE.find(x => x.id === id));
      pan.scrollTop = 0;
      nav.querySelectorAll('.aide-n').forEach(b => { const on = b.dataset.s === id; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'true' : 'false'); if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
    };
    montrer(courant);
    nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
    /* la recherche garde les sujets dont le texte contient les mots tapés */
    const texteDe = s => sansAccent([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
    q.addEventListener('input', () => {
      const mots = sansAccent(q.value).split(/\s+/).filter(Boolean);
      let premier = null;
      for (const s of AIDE) {
        const t = texteDe(s), ok = mots.every(m => t.includes(m));
        nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
        if (ok && !premier) premier = s.id;
      }
      fen.querySelector('#aide-vide').hidden = !!premier;
      if (mots.length && premier && premier !== courant) montrer(premier);
    });
  }, true);
}
ACT['aide'] = el => ouvrirAide(el && el.dataset && el.dataset.s);
/* F1 (ou « ? » hors d'un champ) ouvre l'aide ; Échap la ferme comme toute fenêtre */
document.addEventListener('keydown', e => {
  const dansChamp = e.target.matches && e.target.matches('input, textarea, select, [contenteditable="true"]');
  if (e.key === 'F1' || (e.key === '?' && !dansChamp && !e.ctrlKey && !e.metaKey && !e.altKey)) {
    if (e.key === 'F1') e.preventDefault();
    if ($('#modale').classList.contains('ouvert')) return;   /* une fenêtre est déjà ouverte : on ne perd pas sa saisie */
    e.preventDefault(); ouvrirAide();
  }
});
