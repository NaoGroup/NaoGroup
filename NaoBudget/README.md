# NaoBudget

Budget mensuel et annuel. Deuxième outil de **NaoGroup**, après NaoFi.
Un seul fichier, aucune installation, aucune connexion : tout reste sur votre ordinateur.

## Démarrer

Double-cliquez sur **`NaoBudget.html`**, ou utilisez le raccourci **NaoBudget** sur le bureau
(il ouvre l'outil dans sa propre fenêtre, sans barre d'adresse). Pour recréer les raccourcis —
après avoir déplacé le dossier, par exemple : clic droit sur `creer-raccourcis-bureau.ps1`
→ « Exécuter avec PowerShell ».

| Fichier | Rôle |
|---|---|
| `NaoBudget.html` | L'outil. C'est le seul fichier à ouvrir. |
| `NaoGroup.html` | **Le site de la maison** : la vitrine des outils — NaoFi, NaoBudget, et la place du prochain. |
| `CHARTE-NaoGroup.html` | La charte : signification des trois logos, le fond, la palette, les règles pour un nouvel outil. |
| `PROPOSITIONS-LOGOS.html` | Les pistes de logos explorées, en grand et en 16 px. |
| `src/` | Les sources (CSS, JS, gabarit HTML) + `generer-icones.ps1`. |
| `build.sh` | Réassemble `NaoBudget.html` à partir de `src/`. À lancer après toute modification de `src/`. |

## NaoGroup

NaoGroup est la maison qui réunit les outils : une page d'accueil qui les présente, explique ce
qui les relie (rien ne sort de l'ordinateur, un seul fichier par outil, une seule charte) et
garde une place pour le suivant. Son fond est celui de l'écran de connexion de NaoFi —
c'est le fond principal de la charte.

Son logo, **G1**, est le N de la famille portant **les deux accents à la fois** : la flèche de
NaoFi au-dessus, la ligne de NaoBudget en dessous. Le groupe, c'est la somme de ses outils ;
quand un troisième arrivera, son signe viendra s'y ajouter.

## Les cinq vues

| Vue | À quoi elle sert |
|---|---|
| 📊 **Vue annuelle** | Le tableau complet : revenus, dépenses fixes par catégorie, dépenses variables, totaux par mois et par poste. C'est là qu'on saisit. |
| 📆 **Le mois** | Le détail d'un mois : ce qui rentre, ce qui sort, ce qui reste, le nombre de lignes payées, le cumul depuis janvier. |
| 🥧 **Graphiques** | Revenus/dépenses mois par mois, épargne cumulée, et un camembert par catégorie (ils se créent tout seuls quand vous ajoutez une catégorie). |
| 📅 **Agenda** | Un calendrier du mois avec chaque prélèvement à sa date, la liste des échéances dans l'ordre, et celles qui n'ont pas encore de date. |
| ⚙️ **Réglages** | Les années, les sauvegardes, le vidage, l'aide. |

## Ce qui rentre, ce qui sort

Les deux sens ne se confondent jamais :

- le bloc **Revenus** porte un badge **« + ce qui rentre »**, son bandeau et ses montants sont
  dans la couleur des entrées, et les totaux de ligne sont précédés d'un **+** ;
- les blocs **Dépenses fixes** et **Dépenses variables** portent **« − ce qui sort »**.

Cela vaut aussi pour les **statuts** : une rentrée ne se « paie » pas et ne peut pas être
« rejetée ». Sa pastille fait donc l'aller-retour entre **rien = attendu** et **💰 encaissé**,
avec un fond aux couleurs des entrées — pas le vert des dépenses payées. Les compteurs
distinguent les deux : *« 💰 2 encaissé(s) · ✅ 7 payé(s) · ❌ 1 »*.

Et les petites blagues suivent : saisir un salaire ne déclenche plus « grosse sortie », mais
un mot de bonne nouvelle. Une rentrée ne fait jamais basculer le ton dans le rouge ou l'orange.

## Couleur des cases : payé, inscrit, rejeté

Chaque montant porte un état, et c'est lui qui donne la couleur :

- ✅ **vert — payé** : l'argent est parti (ou rentré).
- ⬜ **sans couleur — inscrit** : c'est prévu, noté, pas encore réglé.
- ❌ **rouge — rejeté** : le prélèvement n'est pas passé (barré).

Pour changer : **cliquez la pastille** à gauche de la case, ou faites un **clic droit** dedans.
Chaque clic passe à l'état suivant. Marquer « payé » fait sauter quelques **confettis** sur la
case ; « rejeté » fait un éclat rouge et secoue la case. Rien d'autre ne bouge sur la page —
les totaux du haut se mettent à jour sans sauter. Le nombre de payés et de rejetés du mois
s'affiche dans l'indicateur « Reste au total ».

> Le vert et le rouge ne servent qu'à ça dans tout l'outil. Les blocs, eux, restent dans le lilas :
> indigo pour les revenus, violet pour les dépenses fixes, mauve pour les variables.

## 📋 Détailler une case (plusieurs achats, part payée)

**Double-cliquez dans une case** pour l'ouvrir en détail. Vous pouvez y lister autant de dépenses
que nécessaire — trois passages au supermarché dans le mois, par exemple — chacune avec :

- son **jour**, son **lieu ou libellé** (Carrefour, marché, pharmacie…), son **montant payé** ;
- la **part à votre charge** : `Tout` si vous avez tout réglé, `½` si votre chéri a payé la moitié,
  ou un pourcentage libre.

La case du tableau affiche alors **la somme de vos parts uniquement** — c'est ce montant qui entre
dans le budget, les totaux et les camemberts. Le bandeau du bas rappelle les deux chiffres :
total dépensé, et ce qui est à votre charge. Deux boutons appliquent une part à toutes les lignes
d'un coup : 🙋‍♀️ *J'ai tout payé* et 💑 *Moitié-moitié*.

Une case détaillée porte un 📋 et n'est plus modifiable directement : un clic rouvre son détail.
Supprimez toutes les lignes du détail pour repasser en saisie simple.

## Saisir et modifier

- Cliquez dans une case, tapez le montant. `Tab`, `Entrée` ou les **flèches** pour passer à la suivante.
- Au survol d'une ligne, quatre boutons apparaissent à droite du nom :
  **▲ ▼** déplacer · **📋** recopier une case sur d'autres mois · **✕** supprimer.

## 📋 Recopier une case sur plusieurs mois

L'électricité au même montant, le même jour, partagée en deux tous les mois : ça se saisit
**une seule fois**. Le bouton **📋** d'une ligne ouvre une fenêtre qui recopie une case —
**avec son détail et ses parts**, moitié-moitié comprise.

1. **La case à recopier** : les douze mois, ceux qui contiennent quelque chose en évidence.
   Un résumé rappelle ce qu'elle contient : *« Janvier — 40,00 € · 📋 1 ligne de détail · 50 % à ma charge »*.
2. **Vers quels mois** : cliquez ceux que vous voulez, ou d'un coup **Toute l'année**,
   **Les mois suivants**, **Les mois vides** (les mois déjà remplis portent un point et sont
   épargnés). Un avertissement s'affiche si un mois choisi contient déjà un montant.
3. **On recopie aussi** : le détail et ses parts (coché par défaut), et si vous voulez le statut.

Chaque mois reçoit sa **propre copie** du détail : modifier le mois de mars ne touche pas à avril.

**Au clavier**, dans une case : `Ctrl+C` copie, `Ctrl+V` colle — détail et parts compris —
et `Ctrl+D` ouvre directement la fenêtre de recopie sur cette case.
- **L'émoji** au début de chaque ligne se change en cliquant dessus. Par défaut il est deviné
  d'après le nom du poste (loyer → 🏠, Duolingo → 🦉, carburant → ⛽…).
- **➕ Catégorie** crée un nouveau bloc de dépenses fixes ; les noms de catégories se modifient
  directement en cliquant dessus. Les camemberts suivent automatiquement.
- La colonne **📅** est le jour de prélèvement : c'est elle qui remplit l'agenda.

## 📅 Classer par ordre de prélèvement

La colonne 📅 sert aussi à **ranger le tableau dans l'ordre où l'argent part du compte** :

- **📅 Trier par jour** dans le bandeau d'un bloc (Revenus, Dépenses fixes, Dépenses variables) ;
- **📅 Trier** sur la ligne d'une catégorie, pour ne classer que celle-ci ;
- **📅 Trier tout par jour** en haut du tableau, qui classe les trois blocs d'un coup
  (avec confirmation, puisque cela remplace l'ordre que vous avez mis à la main).

Les lignes sans date restent à la fin de leur bloc, dans leur ordre d'origine. Le tri est
enregistré : c'est le nouvel ordre du tableau, que vous pouvez toujours retoucher avec ▲ ▼.

Dans la vue **Le mois**, un sélecteur permet de basculer l'affichage entre
*💶 du plus gros au plus petit* (par défaut) et *📅 dans l'ordre des prélèvements* —
là, rien n'est modifié, c'est juste la façon de lire. Et l'agenda, lui, a toujours été
classé par date.

## 🧹 Vider

Trois portées, toujours avec confirmation. Les lignes, catégories, émojis et jours **restent en
place** — seuls les montants, les statuts et les détails repartent à zéro :

- **Vider ce bloc** — dans le bandeau de chaque bloc (Revenus, Dépenses fixes, Dépenses variables).
- **Vider** — sur la ligne d'une catégorie de dépenses fixes.
- **Vider toute l'année** — en haut du tableau, et dans Réglages.

## 🐖 L'épargne remonte dans la courbe

Une ligne peut être marquée **épargne** avec le bouton 🐖 qui apparaît au survol
(dépenses fixes et variables). Cet argent reste une sortie du compte, mais il n'est pas
*perdu* : il est remis dans le graphique **Épargne cumulée**, sur une bande verte d'eau
au-dessus de ce qui reste réellement sur le compte. La ligne du haut donne le **total conservé**.

La marque est devinée toute seule pour les libellés qui parlent d'épargne (épargne, livret,
PEL, PEA, assurance vie, placement) — c'est le cas de votre « Épargne bloquée LCL ». Le bouton 🐖
permet de forcer dans un sens ou dans l'autre. Le camembert « Répartition globale » sépare lui
aussi *mis de côté* et *reste sur le compte*.

**Comment lire la courbe** — trois éléments, trois chiffres écrits en toutes lettres :

| Sur le graphique | Ce que c'est |
|---|---|
| le **trait plein** du haut | tout ce que vous avez gardé (compte + épargne) |
| le **trait en pointillés** | ce qui reste réellement sur le compte |
| la **bande verte** entre les deux | ce que vous avez mis de côté — sa hauteur *est* cette somme |

Les montants de fin d'année sont écrits directement au bout des courbes, et les trois tuiles
sous le graphique les redonnent au centime.

**Au survol**, une infobulle donne les chiffres exacts du mois pointé — plus besoin de viser l'axe
de gauche. Elle marche sur toute la colonne du mois (pas seulement sur le petit point), et un
repère vertical s'allume sur la courbe. Le graphique en barres et les camemberts ont la même :

| Graphique | Ce que dit l'infobulle |
|---|---|
| Barres mois par mois | revenus, dépenses fixes, dépenses variables, reste du mois |
| Épargne cumulée | sur le compte, mis de côté, total conservé, et le résultat du mois |
| Camemberts | le poste, son montant, sa part en %, et le total de référence |

## 😄 Les petites blagues

NaoBudget glisse une réplique quand il se passe quelque chose : un prélèvement **rejeté**, une
**amende** saisie, un mois **entièrement payé**, un mois qui **part dans le rouge**, une grosse
dépense, un plein de carburant, de l'argent mis de côté. Les répliques tournent au hasard et ne
se répètent jamais deux fois de suite.

Elles s'affichent dans un **grand bandeau en haut de l'écran**, coloré selon l'événement —
rouge pour un rejet, gyrophare bleu/rouge pour une amende, vert pour une bonne nouvelle. Il reste
**5 secondes**, avec une barre qui montre le temps restant ; **au survol il se met en pause**,
le temps de lire tranquillement, et un clic le ferme tout de suite. Quand un mois est
entièrement payé, une **pluie de confettis** traverse la page.

### Les animations

| Quand | Ce qui bouge |
|---|---|
| Prélèvement payé | confettis sur la case + **toute la ligne clignote en vert** |
| Prélèvement rejeté | éclat rouge, la case tremble, **la ligne clignote en rouge** |
| Un chiffre change | le total de la ligne et l'indicateur concerné **clignotent** (plus de saut de page) |
| Nouvelle ligne | elle arrive en surbrillance et le curseur s'y place |
| Après un tri | les lignes **entrent en cascade**, on voit ce qui a bougé |
| Graphiques | barres qui poussent, courbe qui se dessine, camemberts qui apparaissent |
| Survol | cartes et lignes qui se soulèvent, émoji du bloc qui s'anime |

Tout se coupe automatiquement si Windows est réglé sur « animations réduites ».

Les amendes sont reconnues au libellé (amende, contravention, PV, radar, stationnement, fourrière).
Tout se coupe d'un clic dans **Réglages → 😄 Le ton**, et ça ne touche à aucun chiffre.

## 🏦 Reprendre un relevé bancaire

**Réglages → 🏦 Importer un relevé bancaire.** NaoBudget lit trois formats :

- le **CSV** téléchargé depuis l'espace client LCL (avec ou sans ligne d'en-tête,
  colonnes *Débit/Crédit* ou colonne *Montant*, accents en ISO comme en UTF-8) ;
- l'**OFX / QFX**, l'autre format proposé par la banque ;
- le **JSON** produit par le pont [NaoBanque](../NaoBanque/README.md), qui va chercher
  les opérations par l'open banking.

Pour chaque opération, il **propose la ligne du budget** qui correspond — en pesant les mots
rares (« duolingo » vaut cher, « abonnement » ne prouve rien) et en vérifiant que le sens
colle : un crédit ne tombe jamais dans une dépense. Vous corrigez au menu déroulant ce qui
doit l'être, vous décochez ce que vous ne voulez pas, et **NaoBudget retient vos choix** :
la fois suivante, « CB CARREFOUR MARKET » ira tout seul dans Courses alimentaires.

Chaque opération retenue s'ajoute au **détail 📋** de la case du mois, avec sa date et le
libellé de la banque. Le montant de la case devient la somme de son détail — et si la case
contenait déjà un montant saisi à la main, il est conservé comme première ligne du détail.

## 📊 Reprendre un tableau Excel

Le bouton **📂 Charger** (et *Importer un tableau Excel* dans Réglages) accepte les
classeurs **`.xlsx`** et les fichiers **`.csv`**, en plus des sauvegardes `.json`.
Aucune installation : NaoBudget ouvre le classeur lui-même, hors ligne.

Ce qu'il sait reconnaître tout seul :

- la **ligne d'en-tête des mois** (Janvier, Février… — même abrégés ou sans accents) et
  donc les douze colonnes, où qu'elles soient dans la feuille ;
- les **blocs** : une ligne « REVENUS », « DÉPENSES FIXES », « DÉPENSES VARIABLES » fait basculer
  la suite dans le bon bloc ;
- les **catégories** de dépenses fixes (Logement, Transport, Impôts, Abonnements, Assurances,
  Santé, Loisirs, Banque…) : une ligne de titre sans montants devient une catégorie ;
- une colonne **Jour** si elle existe ;
- les lignes **Total**, **Sous-total**, **Reste**, **Solde** et **Cumul**, qu'il ignore
  (elles seront recalculées).

Avant d'importer quoi que ce soit, une fenêtre montre **tout ce qui a été compris**, ligne par
ligne, avec le bloc, la catégorie et le total annuel. Si le classeur a plusieurs feuilles, vous
choisissez laquelle. Vous décidez ensuite entre **🔄 Remplacer** l'année affichée ou
**➕ Ajouter** les lignes à l'existant. Rien n'est touché tant que vous n'avez pas confirmé.

Les vieux fichiers `.xls` (format binaire d'avant 2007) ne sont pas lisibles : dans Excel,
*Fichier → Enregistrer sous → Classeur Excel (.xlsx)*, puis réessayez.

## 🖨️ Imprimer / PDF

Le bouton **🖨️ Imprimer / PDF** ne photocopie pas l'écran : il **compose un document**.
Une fenêtre demande d'abord ce qu'il doit contenir — chaque partie commence sur une page neuve :

- 📊 le tableau annuel complet ;
- 🥧 les graphiques (barres, épargne cumulée, camemberts) ;
- 📆 le détail du mois affiché ;
- 📅 l'agenda des prélèvements de ce mois.

Le document s'ouvre sur un en-tête : logo, **Budget 2026**, date d'édition, la légende des
couleurs, et une rangée de totaux (revenus, fixes, variables, mis de côté, reste). Il s'imprime
en **paysage**, les boutons et barres d'outils sont retirés, les en-têtes de colonnes se répètent
en haut de chaque page, et une ligne n'est jamais coupée en deux. Les couleurs des statuts
(✅ vert, ❌ rouge) sont conservées, même si l'outil était en thème sombre à l'écran.

Pour obtenir un PDF : dans la fenêtre d'impression, choisissez **« Enregistrer au format PDF »**
comme imprimante. Si les couleurs manquent, cochez *Graphiques d'arrière-plan* dans les options.

## 📝 Le bloc-notes

Un onglet **📝 Notes** est collé au bord droit de l'écran, **quelle que soit la vue** — tableau,
mois, graphiques, agenda, réglages. Un clic (ou **Alt+N**) fait glisser le panneau ; un point
violet sur l'onglet signale qu'il contient quelque chose.

Trois boutons aident à écrire : **☐** coche ou décoche la ligne où se trouve le curseur,
**📅** insère la date du jour, **──** pose un séparateur. En bas, le compte des lignes et des
tâches faites. Le texte s'enregistre tout seul et **part dans la sauvegarde `.json`** avec le
budget — on peut aussi l'ajouter au PDF depuis la fenêtre d'impression.

## L'entrée dans l'outil

À l'ouverture, un petit tableau de bord se construit : les barres poussent, la courbe se trace,
et le jeton NaoBudget vient s'y poser. Trois secondes, passables d'un clic, et entièrement
sautées si Windows est réglé sur « animations réduites ».

## 🧨 Réinitialiser l'outil

**Réglages → 🧨 Réinitialiser l'outil (le rendre vierge).** Une fenêtre annonce d'abord
**ce qui va disparaître** — nombre d'années, de lignes, de montants saisis et de dépenses
détaillées — et propose d'**exporter une sauvegarde en un clic** avant d'aller plus loin.

Vous choisissez l'état d'arrivée :

| | Ce que vous obtenez |
|---|---|
| 🌱 **Un tableau neuf** | quelques lignes types pour démarrer : salaire, loyer, électricité, courses… |
| 🗑️ **Complètement vide** | les trois blocs, et rien dedans |
| 🎁 **L'exemple 2026** | le budget de démonstration livré avec l'outil |

…et ce que vous effacez en plus : **les budgets**, **les rapprochements bancaires appris**
(les associations libellé → ligne), **les réglages** (thème et blagues). Décochez « les budgets »
si vous voulez seulement oublier ce que l'outil a appris de votre banque.

Il faut confirmer deux fois, puis l'outil **se recharge comme au premier jour**.

Le budget est enregistré automatiquement par le navigateur, **pour cette adresse de fichier**.
Deux précautions :

1. **Exportez** régulièrement (bouton 💾 *Sauvegarder*) : un fichier `.json` qui se recharge avec
   📂 *Charger*. C'est aussi comme ça qu'on transfère le budget sur un autre ordinateur, ou après
   avoir déplacé le dossier.
2. *Exporter pour Excel (.csv)* dans Réglages pour récupérer les chiffres dans un tableur
   (les statuts y apparaissent entre parenthèses).

Vider les données de navigation du navigateur efface le budget : gardez un export récent à côté.

## Changer d'année

Dans Réglages : ✨ **Nouvelle année vide**, ou 📋 **Dupliquer** l'année en cours — qui recrée toutes
vos lignes et catégories en reportant les dépenses fixes (loyer, abonnements, assurances) et en
remettant revenus et dépenses variables à zéro. Les flèches `‹ ›` en haut passent d'une année à l'autre.

---

L'année 2026 est pré-remplie avec les chiffres de votre ancien fichier Excel (janvier → décembre) :
24 583,80 € de revenus, 11 746,06 € de dépenses fixes, 8 999,89 € de variables, 3 837,85 € de reste.
Les jours de prélèvement, eux, ont été estimés — vérifiez-les une fois dans la colonne 📅.
