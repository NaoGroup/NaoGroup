/* ============================================================
   NaoBudget — « Comment ça marche » : le mode d'emploi
   Même forme que dans NaoAgenda, NaoBaby et NaoPets : sommaire à
   gauche, fiche à droite, et une recherche qui garde les sujets
   contenant le mot tapé. S'ouvre avec le bouton ❓ ou la touche F1.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   N'importe quel élément portant data-aide="<id de fiche>" ouvre l'aide
   sur cette fiche (data-aide="" : sur « Premiers pas »).
   ============================================================ */
const AIDE = [
{ id: 'debut', em: '🚀', t: 'Premiers pas', chapo: 'Savoir où va l’argent, mois après mois — en cinq minutes pour démarrer.', b: [
  ['p', 'NaoBudget est votre <b>budget mensuel et annuel</b> : ce qui rentre, ce qui sort, ce qui reste. Il vit <b>dans votre navigateur, sur cet ordinateur</b> : vos chiffres ne partent nulle part, et tout s’enregistre tout seul à chaque saisie.'],
  ['etapes', [
    'Ouvrez l’onglet <b>📊 Vue annuelle</b> : trois blocs, <b>💰 Revenus</b>, <b>🏠 Dépenses fixes</b> (rangées par catégorie) et <b>🛍️ Dépenses variables</b>.',
    'Renommez les lignes à votre façon (cliquez sur le nom), ajoutez-en avec <b>➕</b>, supprimez celles qui ne vous servent pas avec <b>✕</b>.',
    'Cliquez dans une case, tapez le montant, passez à la suivante avec <b>Tab</b>, <b>Entrée</b> ou les <b>flèches</b>.',
    'Indiquez dans la colonne <b>📅</b> le jour du prélèvement (5 pour le 5 de chaque mois) : c’est elle qui remplit l’agenda.',
    'Au fil du mois, marquez ce qui est <b>✅ payé</b> ou <b>💰 encaissé</b> en cliquant la pastille à gauche de la case.',
    'De temps en temps, <b>💾 Sauvegarder</b> : un fichier de secours à garder à l’abri.',
  ]],
  ['sous', 'Les six onglets'],
  ['liste', [
    ['📊 Vue annuelle', 'le grand tableau des douze mois : c’est là qu’on saisit.'],
    ['📆 Le mois', 'un mois à la loupe : ce qui rentre, ce qui sort, ce qui reste.'],
    ['🐖 Épargne', 'vos livrets, leur courbe, ce que vous auriez pu épargner, et l’historique de chaque livret.'],
    ['🥧 Graphiques', 'les barres mois par mois, ce que je gagne face à ce que je dépense, et les camemberts.'],
    ['📅 Agenda des prélèvements', 'chaque prélèvement à sa date, dans un calendrier.'],
    ['⚙️ Réglages', 'les années, les sauvegardes, le relevé bancaire, Excel, le ton et la remise à zéro.'],
  ]],
  ['p', 'Au-dessus des onglets, quatre indicateurs résument l’année affichée : <b>💰 Total revenus</b> (et la moyenne par mois), <b>🏠 Dépenses fixes</b> et <b>🛍️ Dépenses variables</b> (en % des revenus), <b>🐖 Reste au total</b>, avec ce qui a été mis de côté et les compteurs du mois choisi.'],
  ['astuce', 'Au tout premier lancement, NaoBudget s’ouvre soit sur un <b>tableau neuf</b> (quelques lignes types : salaire, loyer, électricité, courses…), soit sur le <b>budget d’exemple 2026</b>. Pour repartir de zéro, voyez la fiche <a href="#" data-aide="raz">🧨 Réinitialiser l’outil</a>.'],
]},

{ id: 'annuel', em: '📊', t: 'La vue annuelle', chapo: 'Le tableau complet de l’année : c’est là que tout se saisit.', b: [
  ['liste', [
    ['+ ce qui rentre', 'le bloc <b>Revenus</b> porte ce badge ; ses montants sont dans la couleur des entrées et ses totaux de ligne commencent par un <b>+</b>.'],
    ['− ce qui sort', 'les blocs <b>Dépenses fixes</b> et <b>Dépenses variables</b>. Les dépenses fixes sont rangées par catégorie (Logement, Transport, Impôts, Abonnements…).'],
    ['Les totaux', 'chaque bloc a sa ligne <b>Total</b> par mois, et chaque ligne son <b>total annuel</b> à droite.'],
    ['Reste', 'sous les dépenses fixes : ce qu’il reste des revenus <b>pour les dépenses variables</b>.'],
    ['Reste au total', 'tout en bas : ce qu’il reste <b>pour épargner ou pour les dépenses exceptionnelles</b>. En vert s’il est positif, en rouge s’il est négatif.'],
    ['Le mois en cours', 'sa colonne est mise en évidence quand vous regardez l’année actuelle.'],
  ]],
  ['sous', 'Saisir'],
  ['etapes', [
    'Cliquez dans une case : le montant se sélectionne, tapez simplement le nouveau.',
    'Virgule ou point, espaces, symbole € : tout est accepté (« 1 234,56 », « 1234.56 »…).',
    '<b>Tab</b> ou <b>→</b> passent au mois suivant, <b>Entrée</b> ou <b>↓</b> à la ligne du dessous, <b>↑</b> et <b>←</b> reviennent en arrière.',
  ]],
  ['astuce', 'Les totaux et les indicateurs se mettent à jour pendant que vous tapez, sans que la page saute. Effacer un montant efface aussi son statut.'],
]},

{ id: 'lignes', em: '✏️', t: 'Lignes, catégories et émojis', chapo: 'Un tableau à votre image.', b: [
  ['p', 'À droite du nom d’une ligne, de petits boutons (ils apparaissent au survol ; le 💳 / 🐖 reste toujours visible, en léger) :'],
  ['liste', [
    ['▲ ▼', 'montent ou descendent la ligne.'],
    ['📋', 'recopie une case sur d’autres mois (voir <a href="#" data-aide="copier">Recopier une case</a>).'],
    ['💼 💳 🐖 🔁 🏦', 'dit par où passe l’argent : salaire, virement reçu, pris sur l’épargne, payé depuis le compte, mis de côté, payé avec l’épargne. Un clic pour choisir ; il se devine aussi pendant que vous tapez le nom (« ass vie », LEP, livret… passent en 🐖). Voir <a href="#" data-aide="epargne">L’épargne</a>.'],
    ['✕', 'supprime la ligne — avec une confirmation si elle contient des montants.'],
  ]],
  ['sous', 'Ajouter, renommer'],
  ['liste', [
    ['Renommer', 'cliquez directement sur le nom d’une ligne ou d’une catégorie et tapez.'],
    ['➕ Ajouter…', 'en bas de chaque bloc et de chaque catégorie : une « Nouvelle ligne » apparaît, prête à être renommée.'],
    ['➕ Catégorie', 'crée un nouveau groupe de dépenses fixes. Son camembert apparaît tout seul dans les graphiques.'],
    ['🗑️ Supprimer', 'sur la ligne d’une catégorie : la supprime avec toutes ses lignes (après confirmation).'],
  ]],
  ['sous', 'L’émoji'],
  ['p', 'Il est <b>deviné d’après le nom</b> (loyer → 🏠, carburant → ⛽, Duolingo → 🦉, salaire → 💰…). Cliquez dessus pour en choisir un autre : <b>Aucun</b> l’enlève, <b>Auto</b> revient à l’émoji deviné.'],
  ['sous', 'La colonne 📅'],
  ['p', 'Le <b>jour du prélèvement</b>, de 1 à 31. Elle remplit l’<a href="#" data-aide="agenda">agenda</a> et sert au <a href="#" data-aide="trier">tri par jour</a>.'],
]},

{ id: 'statuts', em: '✅', t: 'Payé, inscrit, rejeté', chapo: 'La couleur d’une case dit où en est l’argent.', b: [
  ['sous', 'Pour une dépense'],
  ['liste', [
    ['○ inscrit', 'sans couleur : c’est prévu, noté, pas encore réglé.'],
    ['✅ payé', 'en vert : l’argent est parti.'],
    ['❌ rejeté', 'en rouge, barré : le prélèvement n’est pas passé.'],
  ]],
  ['sous', 'Pour une rentrée d’argent'],
  ['liste', [
    ['○ attendu', 'sans couleur : l’argent doit arriver.'],
    ['💰 encaissé', 'il est arrivé. Une rentrée ne se « paie » pas et ne peut pas être « rejetée » : sa pastille fait seulement l’aller-retour entre attendu et encaissé.'],
  ]],
  ['etapes', [
    'Cliquez la <b>pastille</b> à gauche de la case, ou faites un <b>clic droit</b> dans la case.',
    'Chaque clic passe à l’état suivant : inscrit → payé → rejeté → inscrit.',
  ]],
  ['p', 'Marquer « payé » fait sauter quelques confettis sur la case ; « rejeté » la secoue. Les compteurs du mois (<b>💰 encaissé(s) · ✅ payé(s) · ❌</b>) s’affichent dans l’indicateur « Reste au total » et dans le bilan de <b>📆 Le mois</b>.'],
  ['astuce', 'Les compteurs suivent le mois choisi dans <b>📆 Le mois</b> ou dans l’agenda.'],
]},

{ id: 'detail', em: '📋', t: 'Détailler une case et partager', chapo: 'Plusieurs achats dans la même case, et seulement votre part comptée.', b: [
  ['p', 'Trois passages au supermarché dans le mois ? Une dépense réglée à deux ? <b>Double-cliquez dans la case</b> : une fenêtre s’ouvre pour la détailler.'],
  ['etapes', [
    'Pour chaque dépense : le <b>jour</b>, le <b>lieu ou libellé</b> (Carrefour, pharmacie…) et le <b>montant payé</b>.',
    'Choisissez la <b>part à votre charge</b> : <b>Tout</b> (100 %) si vous avez tout réglé, <b>½</b> si votre chéri·e a payé la moitié, ou un pourcentage libre.',
    '<b>➕ Ajouter une dépense</b> pour en mettre une autre ; 🗑️ en supprime une.',
    '<b>✅ Terminé</b> (ou Échap) : la case affiche automatiquement la somme de vos parts.',
  ]],
  ['liste', [
    ['🙋‍♀️ J’ai tout payé · 💑 Moitié-moitié', 'appliquent la même part à toutes les lignes d’un coup.'],
    ['Total dépensé / À ma charge', 'en bas de la fenêtre : ce qui a été payé en tout, et ce qui compte dans votre budget.'],
    ['La case détaillée', 'elle porte un petit 📋 et ne se tape plus à la main : un simple clic la rouvre.'],
  ]],
  ['astuce', 'Seule <b>votre part</b> est comptée dans le budget : c’est elle que la case affiche. Une case détaillée se recopie avec son détail et ses parts sur d’autres mois.'],
]},

{ id: 'copier', em: '📑', t: 'Recopier une case sur d’autres mois', chapo: 'Un abonnement se saisit une seule fois.', b: [
  ['p', 'Le bouton <b>📋</b> d’une ligne (au survol, à droite du nom) ouvre la fenêtre <b>Recopier une case</b>.'],
  ['etapes', [
    '<b>La case à recopier</b> : choisissez le mois de départ parmi ceux qui sont remplis. Un résumé rappelle ce qu’elle contient (montant, détail, part, statut).',
    '<b>Vers quels mois ?</b> Cliquez les mois voulus, ou d’un coup : <b>Toute l’année</b>, <b>Les mois suivants</b>, <b>Les mois vides</b> (les mois déjà remplis portent un point et sont épargnés), <b>Aucun</b>.',
    '<b>On recopie aussi…</b> le détail et ses parts (coché par défaut), et si vous voulez le statut.',
    '<b>📋 Recopier sur N mois</b>.',
  ]],
  ['p', 'Un avertissement s’affiche si un mois choisi contient déjà un montant : il sera remplacé. Chaque mois reçoit sa <b>propre copie</b> du détail : modifier mars ne touche pas à avril.'],
  ['sous', 'Au clavier, dans une case'],
  ['liste', [
    ['Ctrl + C', 'copie la case, détail et parts compris.'],
    ['Ctrl + V', 'la colle dans une autre case.'],
    ['Ctrl + D', 'ouvre directement la fenêtre de recopie sur cette case.'],
  ]],
  ['astuce', 'Pour un abonnement : saisissez janvier, puis 📋 → <b>Les mois suivants</b>.'],
]},

{ id: 'trier', em: '📅', t: 'Trier et vider', chapo: 'Ranger le tableau, remettre les chiffres à zéro.', b: [
  ['sous', 'Trier par jour de prélèvement'],
  ['p', 'Le tableau peut suivre l’ordre dans lequel l’argent part du compte :'],
  ['liste', [
    ['📅 Trier par jour', 'dans le bandeau d’un bloc (Revenus, Dépenses fixes, Dépenses variables).'],
    ['📅 Trier', 'sur la ligne d’une catégorie, pour ne classer qu’elle.'],
    ['📅 Trier tout par jour', 'en haut du tableau : les trois blocs d’un coup, avec confirmation puisque l’ordre mis à la main est remplacé.'],
  ]],
  ['p', 'Les lignes sans date restent à la fin de leur bloc. Le nouvel ordre est enregistré, et se retouche avec ▲ ▼.'],
  ['sous', 'Vider'],
  ['liste', [
    ['🧹 Vider ce bloc', 'dans le bandeau de chaque bloc.'],
    ['🧹 Vider', 'sur la ligne d’une catégorie de dépenses fixes.'],
    ['🧹 Vider toute l’année', 'en haut du tableau, et dans ⚙️ Réglages.'],
  ]],
  ['astuce', 'Vider ne supprime rien d’autre que les chiffres : les lignes, catégories, émojis et jours <b>restent en place</b> ; seuls les montants, les statuts et les détails repartent à zéro. Toujours avec confirmation.'],
]},

{ id: 'epargne', em: '🐖', t: 'L’épargne', chapo: 'Vos livrets, ce qui va dessus, ce qui en sort — et ce que vous auriez pu mettre de côté.', b: [
  ['p', 'Un virement vers un livret est une « dépense » pour le budget du mois… mais cet argent est toujours à vous. Et une rentrée qui vient du livret n’est pas un gain. Chaque ligne dit donc <b>par où passe l’argent</b>, avec le petit bouton à côté de son nom.'],
  ['sous', 'Les étiquettes'],
  ['liste', [
    ['💼 Salaire / revenu', 'rentrée par défaut : ce que vous gagnez. Arrive sur le compte courant.'],
    ['🔁 Virement reçu', 'remboursement, aide, CAF, cadeau, participation d’un proche. Arrive sur le compte courant.'],
    ['🐖 Pris sur l’épargne', 'une rentrée qui vient de votre livret : le compte monte, l’épargne baisse d’autant.'],
    ['💳 Payé depuis le compte', 'dépense par défaut.'],
    ['🐖 Mis de côté', 'un virement vers le livret : il quitte le compte courant et s’ajoute à l’épargne.'],
    ['🏦 Payé avec l’épargne', 'une dépense réglée directement avec le livret : le compte courant n’est pas touché.'],
  ]],
  ['p', 'Le bouton est toujours visible à droite du nom ; les étiquettes autres que 💼 et 💳 sont en couleur, avec un liseré au bord de la ligne. Beaucoup sont devinées d’après le nom (livret, épargne, ass vie, AV, LEP, LDDS, PER, PEA, virement, remboursement, CAF…) ; un clic sur le bouton permet toujours de choisir. Ça ne change aucun total du tableau.'],
  ['sous', 'L’onglet 🐖 Épargne'],
  ['liste', [
    ['Les trois chiffres', 'en haut : votre épargne aujourd’hui (la somme de vos livrets), ce qu’elle a gagné ou perdu depuis le départ, et à combien vous auriez pu être (avec ce qui n’a pas été mis de côté).'],
    ['La courbe', 'le <b>trait plein</b> est votre épargne, un point par mois : <b>vert</b> quand elle monte, <b>rouge</b> quand elle baisse (avec le montant). Les <b>pointillés</b> montrent où vous en seriez si tout ce qui restait chaque mois avait été mis de côté. Sous la courbe, choisissez ce qu’on enlève des revenus : toutes les dépenses, ou les prélèvements fixes seulement.'],
    ['🏦 Mes livrets', 'une ligne par livret : son nom, sa banque, une petite barre pour le plafond et son solde. Cliquez dessus pour l’ouvrir. « ＋ Ajouter un livret » en crée un : donnez-lui un nom et indiquez <b>ce qu’il y a dessus aujourd’hui</b> — c’est le point de départ, l’avant ne compte pas.'],
    ['Noter une opération', 'dans un livret ouvert : choisissez <b>➕ J’ai versé</b>, <b>➖ J’ai retiré</b>, <b>✨ Intérêts reçus</b> ou <b>🏦 Solde de la banque</b>, le montant et le mois, puis « Ajouter ». « Chaque mois jusqu’à » sert pour un virement automatique (laissez vide pour une seule fois). L’historique en dessous liste tout, année par année ; ✕ efface une ligne. Un solde de la banque qui ne colle pas affiche « ❓ pas expliqué ».'],
    ['⚙️ Modifier le livret', 'en bas d’un livret ouvert : nom, type, banque, date d’ouverture, montant de départ, plafond, et 🗑️ pour le supprimer. Le plafond légal est proposé pour les livrets réglementés. <b>Au plafond, le livret est bloqué</b> : les versements au-delà sont refusés (🔒), seuls les intérêts s’ajoutent.'],
    ['🔗 Les lignes 🐖 du budget', 'toutes les lignes qui vont sur l’épargne ou en sortent, avec le livret où chacune va. Choisissez-le dans la liste : le montant y arrive tout seul, le mois où il est dans le budget. « ＋ Créer le livret » le crée d’après le nom de la ligne. Les lignes pas encore reliées sont en jaune ; le bloc se replie quand tout est relié.'],
    ['🧺 À répartir à la main', 'n’apparaît que si un montant 🐖 n’est relié à aucun livret : on le partage entre les livrets, mois par mois (• = il reste quelque chose, ✓ = c’est fait).'],
    ['📒 Le détail mois par mois', 'replié en bas : mis de côté, repris, épargne de fin de mois, variation, capacité du mois et « j’aurais pu être à ».'],
  ]],
  ['astuce', 'Pour démarrer : ajoutez chaque livret avec ce qu’il y a dessus aujourd’hui, puis reliez vos lignes 🐖 avec 🔗. Ensuite, notez une fois par an les intérêts dans l’historique. Si la banque affiche autre chose, notez son solde : « ❓ Pas expliqué » montre la différence (une opération oubliée, par exemple).'],
]},

{ id: 'mois', em: '📆', t: 'Le mois', chapo: 'Le même tableau que l’année, un mois à la fois.', b: [
  ['p', 'Choisissez le mois dans la rangée du haut (❄️ Janvier… 🎄 Décembre). Vous retrouvez <b>exactement les tableaux de la 📊 Vue annuelle</b> (💰 Revenus, 🏠 Dépenses fixes, 🛍️ Dépenses variables), avec une seule colonne : celle du mois choisi. Tout s’y modifie de la même façon :'],
  ['liste', [
    ['Montants', 'tapez dans la case ; les totaux et le bilan se mettent à jour aussitôt.'],
    ['Statuts', 'clic sur la pastille ou clic droit dans la case (✅ payé, ❌ rejeté, 💰 encaissé).'],
    ['📋 Détail', 'double-clic dans la case, comme dans l’année.'],
    ['Lignes et catégories', 'renommer, changer l’émoji, ▲ ▼, 📋 recopier sur d’autres mois, 🐖 épargne, ✕ supprimer, ➕ ajouter.'],
    ['Total annuel', 'la dernière colonne rappelle le total de la ligne sur toute l’année.'],
  ]],
  ['p', 'Les lignes, catégories et noms sont communs à toute l’année : une ligne ajoutée ou renommée ici l’est aussi dans la Vue annuelle. Les montants, eux, ne concernent que le mois affiché.'],
  ['sous', '🧮 Bilan du mois'],
  ['p', 'À droite du tableau : revenus – dépenses = <b>reste</b>, la part des revenus dépensée, les compteurs (encaissé, attendu, payé, rejeté, en attente), la moyenne de l’année et le <b>cumul depuis janvier</b>.'],
  ['astuce', 'Ici, les boutons 🧹 Vider ne remettent à zéro que le mois affiché : les autres mois ne bougent pas.'],
]},

{ id: 'graph', em: '🥧', t: 'Les graphiques', chapo: 'L’année en images — et le chiffre exact au survol.', b: [
  ['liste', [
    ['📊 Revenus et dépenses mois par mois', 'pour chaque mois, une barre des revenus et, à côté, les dépenses fixes surmontées des variables.'],
    ['⚖️ Ce que je gagne, ce que je dépense', 'deux courbes cumulées depuis janvier : en <b>vert</b> ce qui est gagné (salaires, revenus, virements reçus), en <b>rouge</b> ce qui est dépensé (sans l’argent mis de côté). Si le rouge passe au-dessus du vert, on dépense plus que ce qu’on gagne. Un point rouge plein marque un mois où l’on a dépensé plus que gagné. Sous la courbe : le total gagné, le total dépensé et la différence. La courbe de l’épargne est dans l’onglet 🐖 Épargne.'],
    ['💰 D’où vient l’argent qui rentre', 'salaires, virements reçus et argent pris sur l’épargne, séparés.'],
    ['🥧 Répartition globale', 'dépenses fixes, variables, mis de côté, reste sur le compte.'],
    ['Les camemberts', 'dépenses fixes par catégorie, un par catégorie, dépenses variables, revenus — avec la légende, les montants et les pourcentages.'],
  ]],
  ['astuce', '<b>Survolez</b> une barre, un mois de la courbe ou une part de camembert : une bulle donne le montant exact.'],
]},

{ id: 'agenda', em: '🗓️', t: 'L’agenda des prélèvements', chapo: 'Quand l’argent part, et quand il arrive.', b: [
  ['p', 'Choisissez le mois en haut. Toutes les lignes qui ont un <b>jour 📅</b> et un <b>montant</b> ce mois-là se placent dans le calendrier.'],
  ['liste', [
    ['Le calendrier', 'chaque jour montre ses prélèvements et ses rentrées (jusqu’à quatre, puis « + autres »). Aujourd’hui est mis en évidence ; payé et rejeté se voient aussi.'],
    ['🔻 prélevés · 🔺 encaissés', 'les totaux du mois, en haut à droite.'],
    ['⏳ Échéances du mois, dans l’ordre', 'la même chose en liste, jour après jour.'],
    ['❓ Sans date de prélèvement', 'les dépenses du mois qui n’ont pas encore de jour : à compléter dans la colonne 📅 du tableau.'],
  ]],
]},

{ id: 'banque', em: '🏦', t: 'Importer un relevé bancaire', chapo: 'Les opérations de la banque, rangées dans le budget.', b: [
  ['p', 'Dans <b>⚙️ Réglages → 🏦 Importer un relevé bancaire</b>, choisissez le relevé téléchargé depuis l’espace client de votre banque, quelle qu’elle soit : <b>.csv</b>, <b>.ofx / .qfx</b> ou <b>.json</b>. (Un .ofx fonctionne aussi avec 📂 Charger.)'],
  ['etapes', [
    'Si le relevé concerne une autre année, NaoBudget propose de basculer dessus.',
    'Vérifiez <b>de quel compte</b> vient le relevé : 💳 compte courant, 🐖 compte d’épargne ou 👥 compte joint. NaoBudget le reconnaît quand le fichier l’indique, sinon il vous le signale. Pour un compte joint, indiquez <b>votre part</b> (½ par défaut).',
    'Choisissez le <b>mois à rapprocher</b> (le plus fourni est proposé d’office).',
    'Pour chaque opération, NaoBudget <b>devine la ligne du budget</b>. Corrigez avec la liste déroulante ; « — à classer — » laisse l’opération de côté.',
    'Cochez ou décochez (ou ☑️ / ☐ pour tout), puis <b>📥 Inscrire dans [le mois]</b>.',
  ]],
  ['p', 'Chaque opération cochée rejoint le <b>📋 détail</b> de la case du mois, avec sa date et son libellé : le montant de la case devient la somme de son détail. Un montant que vous aviez tapé à la main est gardé, en première ligne « Saisi à la main ».'],
  ['p', '<b>↔️ Les virements entre vos comptes</b> (du courant vers le livret, vers le compte joint…) apparaissent sur les deux relevés. NaoBudget les laisse décochés pour ne pas compter deux fois le même argent ; un versement vers l’épargne est rangé dans une ligne 🐖 épargne. Sur un livret, seuls les intérêts sont proposés. Sur un compte joint, chaque opération est notée en entier avec votre pourcentage : seule votre part compte dans le budget.'],
  ['astuce', 'NaoBudget <b>apprend</b> vos choix : la prochaine fois, le même libellé ira tout seul sur la même ligne. Ces associations s’effacent depuis 🧨 Réinitialiser l’outil.'],
  ['exemple', 'Rien ne part sur Internet : le relevé est lu dans le navigateur, sur cet ordinateur.'],
]},

{ id: 'excel', em: '📊', t: 'Reprendre un tableau Excel', chapo: 'Votre ancien fichier de budget, repris en un clic.', b: [
  ['p', '<b>⚙️ Réglages → 📊 Importer un tableau Excel</b>, ou <b>📂 Charger</b> en haut : choisissez un classeur <b>.xlsx</b> (ou .xlsm) ou un <b>.csv</b>.'],
  ['etapes', [
    'NaoBudget repère la ligne des mois (Janvier, Février…), les blocs Revenus / Dépenses fixes / Dépenses variables et les catégories.',
    'Il vous <b>montre ce qu’il a compris</b> — bloc, catégorie, poste, jour, total — avant d’importer quoi que ce soit. S’il y a plusieurs feuilles, choisissez la bonne.',
    'Choisissez <b>🔄 Remplacer</b> (toutes les lignes de l’année sont remplacées) ou <b>➕ Ajouter à l’existant</b>.',
    '<b>📥 Importer</b>.',
  ]],
  ['astuce', 'Les vieux fichiers <b>.xls</b> ne sont pas lisibles : dans Excel, « Enregistrer sous → Classeur Excel (.xlsx) », puis réessayez. Pensez à 💾 Sauvegarder avant de remplacer.'],
]},

{ id: 'imprimer', em: '🖨️', t: 'Imprimer ou faire un PDF', chapo: 'Un vrai document, pas une capture d’écran.', b: [
  ['p', 'Le bouton <b>🖨️ Imprimer / PDF</b>, en haut, ouvre une fenêtre où vous cochez ce que le document doit contenir :'],
  ['liste', [
    ['📊 Le tableau annuel complet', 'coché par défaut.'],
    ['🥧 Les graphiques', 'barres, épargne, camemberts.'],
    ['📆 Le détail du mois · 📅 L’agenda', 'pour le mois choisi.'],
    ['📝 Mes notes', 'le contenu du bloc-notes.'],
  ]],
  ['p', 'Le document est en <b>paysage</b>, avec un en-tête (total de l’année, date d’édition) ; chaque partie commence sur une nouvelle page.'],
  ['astuce', 'Pour un PDF, choisissez <b>« Enregistrer au format PDF »</b> comme imprimante. Si les couleurs des statuts manquent, cochez « Graphiques d’arrière-plan » dans la fenêtre d’impression.'],
]},

{ id: 'notes', em: '📝', t: 'Le bloc-notes', chapo: 'Ce qu’il ne faut pas oublier, toujours sous la main.', b: [
  ['p', 'L’onglet <b>📝 Notes</b> est collé au bord droit de l’écran, quel que soit l’onglet affiché. Un clic, ou <b>Alt + N</b>, l’ouvre et le ferme. Un point sur l’onglet signale qu’il contient quelque chose.'],
  ['liste', [
    ['☐', 'coche ou décoche la ligne où se trouve le curseur.'],
    ['📅', 'insère la date du jour.'],
    ['──', 'pose un séparateur.'],
    ['🧹', 'efface toutes les notes (avec confirmation).'],
  ]],
  ['p', 'En bas : le nombre de lignes et de tâches faites. Le texte s’enregistre tout seul et <b>part dans la sauvegarde</b> avec le budget ; il peut aussi s’ajouter au PDF.'],
]},

{ id: 'annees', em: '🗂️', t: 'Changer d’année', chapo: 'Un budget par année, autant que vous voulez.', b: [
  ['liste', [
    ['‹ 2026 ›', 'les flèches en haut passent d’une année à l’autre. Une année qui n’existe pas encore s’ouvre sur un tableau neuf.'],
    ['⚙️ Réglages → Mes années', 'la liste de vos budgets avec leurs revenus : <b>Ouvrir</b> pour y aller, 🗑️ pour en supprimer un (s’il en reste au moins un autre).'],
    ['✨ Nouvelle année vide', 'crée l’année de votre choix avec quelques lignes types.'],
    ['📋 Dupliquer', 'recrée toutes vos lignes et catégories pour une autre année : chaque dépense fixe reprend son dernier montant sur les douze mois (loyer, abonnements, assurances), revenus et dépenses variables repartent à zéro, sans statut.'],
  ]],
  ['astuce', 'En fin d’année, <b>📋 Dupliquer</b> fait gagner beaucoup de temps : il ne reste qu’à ajuster les montants qui ont changé.'],
]},

{ id: 'sauvegarde', em: '💾', t: 'Sauvegarder, synchroniser, exporter', chapo: 'Garder son budget à l’abri, et le retrouver ailleurs.', b: [
  ['p', 'Tout s’enregistre <b>automatiquement dans ce navigateur</b>, à chaque saisie — pour cette adresse de fichier, sur cet ordinateur.'],
  ['liste', [
    ['💾 Sauvegarder', 'en haut (ou ⬇️ Exporter dans Réglages) : un fichier <b>.json</b> avec toutes vos années, vos notes et ce que l’outil a appris de votre banque. C’est votre filet de sécurité.'],
    ['📂 Charger', 'recharge une sauvegarde .json — elle <b>remplace</b> le budget actuel, après confirmation. Le même bouton lit aussi un tableau Excel ou un relevé .ofx.'],
    ['📊 Exporter pour Excel (.csv)', 'dans Réglages : les chiffres de l’année affichée, à ouvrir dans un tableur. Les statuts y figurent entre parenthèses (payé, rejeté).'],
    ['Avec votre profil NaoGroup', 'quand vous ouvrez NaoBudget depuis NaoGroup avec votre profil, votre budget est aussi enregistré avec ce profil : vous le retrouvez sur vos autres appareils.'],
    ['En mode visite', 'pour essayer sans compte : rien n’est gardé.'],
  ]],
  ['astuce', 'Vider les données de navigation, changer d’ordinateur ou déplacer le dossier de l’outil fait repartir d’un budget vide : gardez une <b>sauvegarde récente</b> à côté, elle se recharge en un clic avec 📂 Charger.'],
]},

{ id: 'raz', em: '🧨', t: 'Réinitialiser l’outil', chapo: 'Rendre NaoBudget vierge, comme au premier jour.', b: [
  ['p', 'Dans <b>⚙️ Réglages → 🧨 Réinitialiser l’outil (le rendre vierge)</b>. Rien ne s’efface avant la toute dernière confirmation.'],
  ['etapes', [
    'La fenêtre annonce d’abord <b>ce qui va disparaître</b> : nombre d’années, de lignes, de montants saisis et de dépenses détaillées.',
    '<b>💾 Exporter une sauvegarde maintenant</b> : un clic, et vous gardez une copie.',
    'Choisissez l’état d’arrivée : <b>🌱 Un tableau neuf</b> (quelques lignes types), <b>🗑️ Complètement vide</b> (les trois blocs, rien dedans) ou <b>🎁 L’exemple 2026</b> (le budget de démonstration).',
    'Cochez ce que vous effacez : <b>📊 les budgets</b> (années, lignes, montants, détails et notes), <b>🏦 les rapprochements appris</b> (libellé bancaire → ligne), <b>⚙️ les réglages</b> (thème et petites blagues).',
    '<b>🧨 Réinitialiser</b>, puis confirmez une dernière fois : l’outil se recharge.',
  ]],
  ['astuce', 'Pour seulement faire oublier à NaoBudget ce qu’il a appris de votre banque, décochez « les budgets » et gardez « les rapprochements appris ». Pour juste remettre les chiffres à zéro sans toucher aux lignes, préférez <b>🧹 Vider</b>.'],
  ['exemple', 'Il n’y a pas de retour en arrière : seule une sauvegarde .json permet de retrouver un budget effacé.'],
]},

{ id: 'ton', em: '😄', t: 'Le ton, le thème et les animations', chapo: 'Un budget, c’est sérieux ; le ton ne l’est pas forcément.', b: [
  ['liste', [
    ['😄 Les petites blagues', 'une réplique quand un prélèvement est rejeté, qu’une amende tombe, qu’un salaire arrive, que le mois est entièrement payé (pluie de confettis) ou qu’il passe dans le rouge. <b>⚙️ Réglages → Le ton</b> les coupe ou les remet ; cela ne touche à aucun chiffre.'],
    ['☀️ / 🌙', 'l’interrupteur en haut passe du thème clair au thème sombre. Sans choix de votre part, NaoBudget suit le réglage de l’ordinateur.'],
    ['L’ouverture', 'le petit tableau de bord qui se construit à l’arrivée se passe d’un clic.'],
    ['Animations réduites', 'si votre ordinateur est réglé sur « réduire les animations », NaoBudget les supprime.'],
  ]],
]},

{ id: 'astuces', em: '💡', t: 'Raccourcis et astuces', chapo: 'Pour aller plus vite.', b: [
  ['sous', 'Au clavier'],
  ['liste', [
    ['F1', 'ouvrir cette aide (Échap la ferme).'],
    ['Tab · Entrée · flèches', 'passer d’une case à l’autre dans le tableau.'],
    ['Clic droit dans une case', 'changer son statut.'],
    ['Double-clic dans une case', 'la détailler.'],
    ['Ctrl + C · Ctrl + V', 'copier / coller une case, détail compris.'],
    ['Ctrl + D', 'recopier une case sur d’autres mois.'],
    ['Alt + N', 'ouvrir ou fermer le bloc-notes.'],
  ]],
  ['sous', 'Astuces'],
  ['liste', [
    ['Datez vos prélèvements', 'une fois la colonne 📅 remplie, l’agenda et le tri par jour font le reste.'],
    ['Un abonnement', 'saisissez-le une fois, puis 📋 → Les mois suivants.'],
    ['Une dépense à deux', 'double-clic, puis ½ : seule votre part compte.'],
    ['Survolez les graphiques', 'chaque barre et chaque part donne son chiffre exact.'],
    ['Sauvegardez souvent', 'un fichier .json par mois, rangé sur une clé ou un autre ordinateur, et vous ne perdez jamais rien.'],
  ]],
]},
];

/* ---------- La fenêtre ---------- */
let aideRetour = null;          /* l'élément qui avait le focus avant l'ouverture */
const aideOuverte = () => !!document.getElementById('aidebg');

function fermerAide() {
  const bg = document.getElementById('aidebg'); if (!bg) return;
  bg.remove();
  if (aideRetour && aideRetour.isConnected) { try { aideRetour.focus(); } catch (e) {} }
  aideRetour = null;
}

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>💜</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;

  if (!aideOuverte()) aideRetour = document.activeElement;
  fermerAideSeule();
  const bg = document.createElement('div');
  bg.className = 'modal-bg aide-bg'; bg.id = 'aidebg';
  bg.innerHTML = `<div class="modal aide" role="dialog" aria-modal="true" aria-labelledby="t-aide">
    <div class="aide-h">
      <div class="aide-ti"><h2 id="t-aide">❓ Comment ça marche</h2>
        <p>Tout NaoBudget, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="right"></span>
      <input type="search" id="aide-q" placeholder="Chercher : épargne, relevé, PDF…" aria-label="Chercher dans l’aide">
      <button type="button" class="btn" data-aideclose="1">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
        <p class="aide-rien" id="aide-rien" hidden>Aucun sujet ne contient ce mot 🤷</p>
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>
  </div>`;
  document.body.appendChild(bg);

  const nav = bg.querySelector('#aide-nav'), pan = bg.querySelector('#aide-p'), q = bg.querySelector('#aide-q');
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    nav.querySelectorAll('.aide-n').forEach(b => {
      const on = b.dataset.s === id;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    const b = nav.querySelector(`[data-s="${id}"]`);
    if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  montrer(courant);

  bg.addEventListener('click', e => {
    if (e.target === bg || e.target.closest('[data-aideclose]')) { fermerAide(); return; }
    const n = e.target.closest('[data-s]');
    if (n) { montrer(n.dataset.s); return; }
    const lien = e.target.closest('[data-aide]');          /* lien d'une fiche vers une autre */
    if (lien) {
      e.preventDefault();
      const id = lien.dataset.aide;
      if (AIDE.some(s => s.id === id)) {
        if (q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
        montrer(id);
      }
    }
  });

  /* la recherche : on garde les sujets dont le texte contient les mots tapés */
  const sansAccents = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘]/g, "'").toLowerCase();
  const texteDe = s => sansAccents([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const m = sansAccents(q.value.trim());
    let premier = null;
    for (const s of AIDE) {
      const ok = !m || texteDe(s).includes(m);
      nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    nav.querySelector('#aide-rien').hidden = !!premier;
    if (m && premier && premier !== courant && nav.querySelector(`[data-s="${courant}"]`).hidden) montrer(premier);
  });

  if (window.matchMedia && matchMedia('(pointer:fine)').matches) setTimeout(() => q.focus(), 60);
  else setTimeout(() => pan.focus(), 60);
}
/* retire la fenêtre sans toucher au focus mémorisé (réouverture sur une autre fiche) */
function fermerAideSeule() { const bg = document.getElementById('aidebg'); if (bg) bg.remove(); }

/* ---------- Ouvrir : bouton ❓, liens data-aide, touche F1 ---------- */
document.addEventListener('click', e => {
  if (e.target.closest('#aidebg')) return;              /* les liens internes sont gérés par la fenêtre */
  const b = e.target.closest('[data-aide]');
  if (!b) return;
  e.preventDefault();
  ouvrirAide(b.dataset.aide || undefined);
});
/* En phase de capture : Échap ferme l'aide sans fermer en même temps la
   fenêtre qui se trouverait dessous (le détail d'une case, par exemple). */
window.addEventListener('keydown', e => {
  if (e.key === 'F1') {
    e.preventDefault();
    if (document.getElementById('intro')) return;       /* pendant l'animation d'ouverture */
    if (aideOuverte()) { const q = document.getElementById('aide-q'); if (q) q.focus(); return; }
    ouvrirAide();
    return;
  }
  if (e.key === 'Escape' && aideOuverte()) {
    e.preventDefault();
    e.stopPropagation();
    fermerAide();
  }
}, true);
