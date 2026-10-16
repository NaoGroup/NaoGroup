# NaoAgenda

> **NaoAgenda — La bonne date, au bon moment.**

L'agenda personnel et professionnel de **NaoGroup** : rendez-vous, tâches, anniversaires,
échéances et moments importants du quotidien.
Un seul fichier, aucune installation, aucune connexion : tout reste sur votre ordinateur.

## ❓ L'aide, dans l'outil

Le bouton **❓** de l'en-tête (ou la touche **F1**, ou **?**) ouvre **Comment ça marche** : le mode
d'emploi complet, sans quitter l'agenda.

- Un **sommaire** de douze sujets à gauche — Premiers pas, Ajouter un rendez-vous, Ce qui se répète,
  Mes horaires de travail, Congés & télétravail, Fériés & vacances, La garde alternée, Les
  anniversaires, Déplacer et corriger, Thèmes et saisons, Enregistrer & réinitialiser, Raccourcis.
- Une **fiche** à droite : ce qu'on veut faire, les **étapes numérotées**, les possibilités, une
  **💡 astuce** et un **🧩 exemple** pris dans la vraie vie.
- Une **recherche** en haut : tapez *télétravail*, *garde*, *vacances* — les accents n'ont pas
  d'importance — et le sujet s'ouvre.

Sur téléphone, le sommaire devient une rangée de pastilles qui défile.

## Démarrer

Double-cliquez sur **`NaoAgenda.html`**. Pour l'avoir sur le bureau, dans sa propre fenêtre
(sans barre d'adresse) : clic droit sur `creer-raccourci-bureau.ps1` → « Exécuter avec PowerShell ».

| Fichier | Rôle |
|---|---|
| `NaoAgenda.html` | L'outil. C'est le seul fichier à ouvrir. |
| `naoagenda.ico` | L'icône du raccourci Windows. |
| `generer-icone.ps1` | Recrée `naoagenda.ico` à partir des tracés du logo. |
| `creer-raccourci-bureau.ps1` | Pose le raccourci **NaoAgenda** sur le bureau. |

Au premier lancement, l'agenda contient **des exemples** (dont un anniversaire le jour même,
pour voir la carte animée). Pour les retirer : 🧽 **Effacer les exemples**, sous le calendrier.
Vos propres saisies ne sont jamais touchées.

## L'ouverture

Comme dans NaoDoc, l'outil s'ouvre sur une petite scène : un **éphéméride** posé sous le jeton
NaoAgenda, dont les feuilles des trois jours passés **s'arrachent une à une** pour laisser la date
d'aujourd'hui — la vraie, avec son jour de la semaine. Des pastilles aux couleurs de vos catégories
viennent s'y poser, une étincelle dorée s'allume, puis le nom et le slogan apparaissent.

Elle dure environ trois secondes. **Un clic n'importe où la passe**, et elle ne joue pas du tout si
votre système demande de réduire les animations.

### Changer de mois

NaoAgenda utilise les **View Transitions**, ce que les navigateurs font de plus récent en matière
d'animation : le navigateur photographie le mois qui part et celui qui arrive, puis les anime
ensemble sur des images figées — c'est fluide quoi qu'il y ait dans la grille.

Le mois sortant s'efface sur le côté pendant que le suivant arrive de l'autre, dans le sens du
voyage, avec la courbe d'accélération des interfaces modernes (lent à l'arrivée, jamais sec). Le
nom du mois, lui, **roule verticalement** comme un compteur. Et quand le mois fait changer de
saison, une lueur traverse la carte pour annoncer les nouvelles couleurs.

Les navigateurs qui ne connaissent pas encore cette API gardent l'animation précédente : un simple
glissement de la grille, tout aussi fluide.

## Les trois pages

En haut, trois onglets :

- **📅 Agenda** — le calendrier en pleine largeur, en vue **Jour**, **Semaine** ou **Mois**
  (flèches ‹ › ou ← → du clavier). Sous le calendrier : les catégories (cliquer pour masquer)
  et les boutons **🧹 Vider le mois** et **🧹 Vider l'année**.

  Dans la vue mois, **les jours des mois voisins restent en retrait** : pas de fond, un cadre en
  pointillés, des couleurs adoucies, et le nom de leur mois sous le premier d'entre eux — le mois
  affiché se détache d'un coup d'œil. Le bouton **🌙 Estomper les mois voisins** va plus loin : il ne
  leur laisse que leur numéro et un petit point par élément.
- **✨ Ma journée** — les cartes **Aujourd'hui**, **Mes priorités du jour**, **Prochains
  anniversaires** et **À ne pas oublier**. La pastille rose sur l'onglet compte les priorités
  qui restent à faire.
- **🎂 Anniversaires** — tout le carnet, en visuel (voir plus bas). La pastille compte ceux des
  sept prochains jours.

Toujours visibles : le **bandeau doré** quand c'est un anniversaire aujourd'hui, les trois boutons
**Ajouter un rendez-vous / une tâche / un anniversaire**, l'interrupteur **🌙 / ☀️** (thème sombre
ou clair, mémorisé), **📥 Enregistrer**, **🗂️ Mes enregistrements** et ♻️ Réinitialiser. Tout à gauche, la **flèche ←** ramène à NaoGroup.

## Glisser-déposer, comme dans Google Agenda

- **Mois** : attrapez un rendez-vous ou une tâche et lâchez-le sur un autre jour ; l'heure est gardée.
- **Semaine / Jour** : glissez un bloc vers une autre heure (par pas de 15 min) ou un autre jour.
  Une étiquette indique où il va atterrir. Lâché sur la ligne « Journée », il perd son heure ;
  un élément sans heure glissé dans la grille en reçoit une.
- **Durée** : tirez le bord du bas d'un bloc pour l'allonger ou le raccourcir.
- Pour un événement qui se répète, **seule l'occurrence déplacée change** ; les autres semaines
  ou mois restent à leur place.
- Chaque déplacement affiche **Annuler** pendant quelques secondes. Échap pendant le glisser l'interrompt.

## Vider le mois ou l'année

**🧹 Vider le mois** retire les rendez-vous et tâches du mois affiché, **🧹 Vider l'année** ceux de
l'année affichée. Une fenêtre annonce combien d'éléments partiront avant de confirmer, et
**Annuler** permet de revenir en arrière juste après. Les répétitions en dehors de la période
restent en place, et les **anniversaires sont toujours conservés** (ils reviennent chaque année).
Pour aller plus loin, voir « Vider, effacer, repartir à neuf » plus bas.

## Enlever une seule fois, sans casser la série

Ouvrez l'occurrence qui vous gêne : un bouton **🚫 Pas le 28 novembre** attend en bas de la fiche,
à côté de *Supprimer*. Un clic, et **ce samedi-là seulement** s'efface — tous les autres samedis
restent. C'est le dîner hebdomadaire chez la belle-mère le jour où l'on va au parc d'attractions,
ou la réunion du jeudi un jour de congé. La **journée chargée** se recalcule aussitôt : ce qui n'a
plus lieu ne compte plus.

**Supprimer** propose la même chose, avec le choix complet :

- **Seulement le 28 novembre** — cette fois-là disparaît, la série continue.
- **Toute la série** — le rendez-vous et toutes ses répétitions s'en vont.

**On peut toujours revenir en arrière.** Dans la fiche, la ligne **« Les fois où ça ne compte pas »**
liste les dates mises de côté : cliquez l'une d'elles (**↩ 28 novembre**) et elle reprend sa place
dans la série. Et chaque retrait propose **Annuler** pendant quelques secondes.

Pour que cela se fasse tout seul à l'avenir, cochez **🌴 Pas les jours où je ne travaille pas**
ou **🏖️ Pas pendant les vacances scolaires** sur l'événement (voir plus bas).

## Les thèmes : l'agenda suit les saisons

Par défaut, **les couleurs et les motifs du fond changent avec le mois que vous regardez**, et un
bouton dans la barre du calendrier annonce la saison en cours. Feuilletez les mois : l'agenda se
rhabille à chaque fois.

| Mois | Thème | Ce qu'on y voit |
|---|---|---|
| 👑 janvier | Galette & nouvel an | couronnes, galettes, champagne, étoiles et confettis |
| 💝 février | Valentin & crêpes | cœurs, crêpes, roses, chocolats |
| 🌸 mars | Printemps | fleurs, bourgeons, oiseaux, papillons |
| 🐰 avril | Pâques | œufs, lapins, chocolats, poussins |
| 🌼 mai | Muguet & 1er mai | muguet, trèfles, abeilles, la fête du Travail |
| 🎵 juin | Fête de la musique | notes, guitare, micro, batterie, violon |
| 🎆 juillet | 14 juillet & examens | feux d'artifice, chapeau de diplômé, valise, pastèque |
| 🏖️ août | Grandes vacances | palmiers, mer, soleil, glaces, tongs, coquillages |
| 🎒 septembre | La rentrée | cartable, livres, crayons, pomme, règle |
| 🎃 octobre | Halloween | citrouilles, fantômes, squelettes, zombies, chauves-souris, bougies, toiles |
| 🍂 novembre | Automne | feuilles qui tombent, marrons, champignons, café, laine |
| 🎄 décembre | Noël | sapin, cadeaux, bonhomme de neige, boules rouges et vertes, neige |

Chaque mois apporte sa teinte, ses halos et ses petits symboles qui dérivent en fond : couronnes et
galettes en janvier, crêpes et cœurs en février, citrouilles et chauves-souris en octobre, sapins et
cadeaux en décembre. Les couleurs suivent la fête — **Noël est rouge et vert**, la Saint-Valentin
rose, Halloween orange sur violet profond.

### Le décor posé sur le calendrier

Le calendrier lui-même est décoré, comme un meuble qu'on habille. Tout épouse exactement la carte :
rien ne dépasse, les coins arrondis découpent le décor au millimètre.

- **Une guirlande** dans son propre bandeau, en haut, qui ne recouvre jamais le nom du mois : des
  **boules rondes rouges, vertes et dorées** à Noël, des **citrouilles, fantômes et chauves-souris**
  en octobre, des **œufs et des lapins** à Pâques, des **notes de musique** en juin, des **fanions
  et des glaces** en août, des **feuilles** en novembre. Le fil suit une vraie courbe, et ce qui y
  est accroché tombe exactement dessus et se balance — quelle que soit la largeur de l'écran.
- **Janvier n'a pas de guirlande** : c'est la fête, donc un ciel d'**étoiles, de confettis et de
  paillettes** qui scintillent au-dessus du calendrier.
- **Dans les coins** : des **toiles d'araignée blanches** bien géométriques, tendues depuis l'angle
  en octobre, et des **cristaux de givre** en décembre et janvier. Le coin arrondi de la carte les
  découpe au millimètre.
- **Posés sur la tablette du haut**, à l'intérieur de la carte : trois objets du mois — citrouille,
  bougie et crâne en octobre, sapin, cadeaux et bonhomme de neige en décembre, couronne, galette et
  champagne en janvier. Ils arrivent en se posant, et ne débordent sur rien.
- **Suspendus** au bord de la carte, deux ou trois breloques qui se balancent.
- **Il en tombe** doucement tout le long du calendrier : feuilles en novembre, flocons en décembre,
  pétales au printemps, chauves-souris en octobre, confettis en juillet.
- **Des paillettes dorées** qui scintillent pour les mois magiques — janvier, février, juillet et Noël.

Tout ce décor disparaît si votre système demande de réduire les animations.

Un clic sur le bouton de saison ouvre **🎨 Le thème de l'agenda** : gardez les saisons, ou figez une
couleur — 💜 Lavande (la charte NaoGroup), 🌙 Nuit claire, 🌿 Menthe, 🌅 Aurore. Le choix **clair /
sombre** reste indépendant et se règle toujours avec l'interrupteur 🌙 / ☀️.

## Mon temps de travail

**🕘 Mes horaires**, sous le calendrier : **chaque jour de la semaine a ses propres horaires**, et
autant de plages que nécessaire. De vraies semaines, pas un horaire unique :

| | |
|---|---|
| lundi | repos |
| mardi, mercredi, vendredi | 8 h 45 – 12 h 30 · 14 h – 18 h |
| jeudi | 8 h 45 – 12 h 30 · **15 h** – 18 h |
| samedi | 8 h 45 – **13 h** · 14 h – **16 h** |

Chaque jour : une case à cocher, ses plages (**＋ plage** pour en ajouter une, ✕ pour en retirer une),
et **⧉ copier** qui donne ses horaires à tous les autres jours travaillés — de quoi saisir
mardi une fois et le recopier sur mercredi et vendredi. Un total s'affiche en bas : *« 36 h 15 par
semaine · 5 jours travaillés »*.

En **vue mois**, chaque journée travaillée affiche sa barre d'horaires — *« 🏢 8 h 45 – 18 h »*, et
*« 8 h 45 – 16 h »* le samedi — aux couleurs du lieu.

Les vues **semaine** et **jour** dessinent ces plages derrière les rendez-vous, **vivantes** :
dégradé qui respire, lueur qui passe lentement, étiquette qui se pose avec l'icône du lieu
(🏢 bureau ou 🏠 télétravail), durée de la plage en bas à droite. **Ce qui sépare deux plages devient
la pause** : une bande hachurée ambre avec sa pastille 🍽️ qui flotte doucement.

## Ma semaine commence le…

Dans **🕘 Mes horaires**, en haut : *« Ma semaine commence le »* — lundi, dimanche, samedi, le jour
que vous voulez. La grille du mois, la vue semaine et l'ordre de vos horaires suivent ce choix.

## Fériés, vacances scolaires et garde alternée

Trois boutons sont posés **juste sous le titre du mois**, impossibles à manquer :

| Bouton | Ce qu'on y règle |
|---|---|
| 🏷️ **Congés & télétravail** | poser un tampon sur un jour ou une période : congés, RTT, télétravail, repos, formation… |
| 🗓️ **Fériés, vacances & garde** | les jours fériés, les vacances scolaires par zone, la garde alternée |
| 🕘 **Mes horaires** | les plages de travail jour par jour, et le jour où commence la semaine |

À côté, un rappel de ce qui est actif : *« 👧 une semaine sur deux »*, *« 🏫 Zone B »*.

Le bouton **🗓️ Fériés, vacances & garde** réunit ce qui rythme l'année sans qu'on ait à le saisir
jour après jour.

- **🎌 Les jours fériés français** sont calculés — Pâques comprise — pour toutes les années, passées
  et à venir : Jour de l'an, lundi de Pâques, Fête du Travail, Victoire 1945, Ascension, lundi de
  Pentecôte, Fête nationale, Assomption, Toussaint, Armistice, Noël. Une case à cocher ajoute ceux
  d'**Alsace-Moselle**. Un jour férié n'affiche aucune plage de travail.
- **🏖️ Les vacances scolaires** par **zone A, B ou C** : choisissez la vôtre et les périodes
  s'affichent dans le calendrier. Les dates du calendrier officiel sont pré-remplies **à partir
  d'aujourd'hui** — jamais de vacances déjà passées à supprimer une par une — et **à vérifier** :
  chaque période est modifiable, vous pouvez en ajouter, en retirer, ou reprendre les dates de la
  zone. Les jours fériés, eux, n'ont rien à pré-remplir : ils sont calculés pour toutes les années.
Les **jours fériés portent leur tampon d'office** : pas besoin de les poser, ils apparaissent en
travers de la journée comme les congés, avec le nom de la fête au survol.

### 🎃 Les fêtes aussi portent leur tampon

Les fêtes du calendrier se tamponnent toutes seules, chacune avec **son emoji et sa couleur** :
🎃 Halloween le 31 octobre, 🎄 Noël le 25 décembre et 🎅 le Réveillon la veille, 🥂 la Saint-Sylvestre,
🎉 le Jour de l'an, 👑 l'Épiphanie, 🥞 la Chandeleur, 💝 la Saint-Valentin, 🍀 la Saint-Patrick,
🐟 le Poisson d'avril, 🎭 Mardi gras, 🐰 Pâques, 🌼 le muguet du 1er mai, 💐 la fête des mères,
👔 la fête des pères, 🎵 la fête de la musique, 🎆 le 14 juillet, 🕯️ la Toussaint.

**Pâques, Mardi gras et les fêtes des mères et des pères se calculent**, année après année — la
fête des mères saute d'une semaine quand elle tombe en même temps que la Pentecôte, comme le veut
l'usage. Quand deux fêtes tombent le même jour (la fête des pères un 21 juin), le tampon les
nomme toutes les deux.

Une fête **n'est pas un jour férié** : le 31 octobre reste travaillé, les plages d'horaires
s'affichent normalement et les rendez-vous qui se répètent y tombent comme d'habitude. Et quand une
fête tombe un jour férié, le tampon garde l'emoji de la fête — 🎄 plutôt que 🎌.

La case **🎃 Tamponner aussi les fêtes** (dans *Fériés & vacances*) les affiche ou les retire d'un
clic. Poser son propre tampon sur une journée — congés, télétravail — l'emporte toujours.

**Les vacances se voient d'un coup d'œil dans la vue mois** : un **fil turquoise franc court
au-dessus des jours concernés**, d'un bout à l'autre de la période — il enjambe les écarts entre les
cases, s'arrondit en fin de ligne et reprend à la suivante. Deux petites **équerres** marquent le
**vrai premier et le vrai dernier jour** des vacances : on voit où elles commencent et où elles
s'arrêtent, même quand elles débordent sur le mois suivant.

**Les cases, elles, ne changent pas de couleur** : l'agenda reste lisible, et seules les couleurs
qui disent quelque chose — les catégories, les tampons — restent dans les cases. Le nom de la
période (*Toussaint*, *Hiver*, *Été*) reste écrit au premier jour et en début de chaque semaine.

## La garde alternée

Son propre bouton, **👨‍👩‍👧 Garde alternée**, et sa propre fenêtre.

- **Les vrais mots** : vous donnez le prénom des enfants, ce qu'on dit chez vous (« à la maison ») et
  ce qu'on dit chez l'autre parent (« chez sa maman »). L'agenda écrit alors **« Driss à la maison »**
  et **« Driss chez sa maman »** — jamais « l'autre ».
- **Le rythme habituel** : une semaine sur deux, ou un week-end sur deux, à partir d'une semaine où
  ils sont chez vous. L'outil alterne ensuite seul, en avant comme en arrière.
- **✱ Les arrangements** : la liste des périodes qui ne suivent pas le rythme — les vacances surtout,
  un week-end échangé, une semaine décalée. Pour chacune : du … au …, chez qui, et une note
  (« Toussaint », « été »). Elles **l'emportent toujours** sur le rythme, et portent une ✱ dans
  l'agenda. Un bouton **🏖️ Reprendre les vacances scolaires** crée d'un coup une période par
  vacances à venir : il ne reste qu'à dire qui a les enfants pour chacune.
- **🔄 Les relais** : le moment où l'on se passe les enfants. *« Tous les dimanches à 18 h, on
  récupère le petit »* devient une ligne dans l'agenda : **🤝 Driss à récupérer chez sa maman**, à
  18 h, dans la vue mois comme dans la grille horaire de la semaine. Pour chaque relais : le jour,
  l'heure, le sens (**je récupère** ou **je dépose**), et le lieu si vous voulez le préciser
  (« à l'école »). Un clic dessus rouvre ces réglages.

- **Le jour du changement est toujours annoncé**, même sans relais réglé — et il s'affiche
  **comme un événement, à son heure**, pas en haut de la journée : 🚗 *« Driss rentre chez sa
  maman »* à 19 h le soir où il part, 🏡 *« Driss revient à la maison »* le jour de son retour.
  L'heure se règle une fois pour toutes dans **« D'habitude, le changement se fait à »**. Si un
  relais est prévu ce jour-là, c'est lui qui s'affiche — pas les deux. Dans la vue mois, départs
  et relais passent **juste après les anniversaires**, pour ne jamais finir cachés sous un
  « + 3 autres ».

  Surtout, un relais **ne s'affiche que lorsqu'il a lieu d'être** : l'outil regarde si les enfants
  changent vraiment de maison ce jour-là, et dans quel sens. Le dimanche d'une semaine où ils
  étaient déjà chez vous, rien ne s'affiche — on ne récupère pas quelqu'un qui est là. Le dimanche
  suivant, oui. C'est le réglage *« quand ils changent de maison »*, choisi par défaut ;
  *« chaque semaine, quoi qu'il arrive »* reste possible pour un rituel immuable.
- Leur symbole est au choix (👦 👧 🧒 👶 ⚽ 🎒…), et vous décidez d'afficher ou non les jours chez
  l'autre parent.

## Le sport qui s'arrête pendant les vacances

Sur un événement qui se répète, trois cases changent tout :

- **🏖️ Pas pendant les vacances scolaires** — le judo du lundi, la danse, la musique : ils
  disparaissent de l'agenda pendant les vacances de votre zone, et reviennent à la rentrée, sans que
  vous touchiez à rien.
- **🎌 Pas les jours fériés** — la réunion hebdomadaire saute le 1er mai.
- **🌴 Pas les jours où je ne travaille pas** — dès qu'une journée porte un tampon *Congés*, *RTT*,
  *Repos* ou *Arrêt maladie*, la réunion du jeudi ne s'y invite plus. Posez votre congé : elle
  disparaît toute seule ce jour-là, et revient le jeudi suivant.

Dans la vue mois, ces rubans ne s'affichent qu'au **début de chaque période ou de chaque semaine**,
pour ne pas encombrer les cases ; en vue semaine et jour, ils sont en tête de colonne.

## Les tampons de journée

Le bouton **🏷️** (au survol d'une case du mois, en tête de colonne dans la semaine, ou en haut de la
vue jour) pose un tampon sur la journée :

🏢 Au bureau · 🏠 Télétravail · 🎓 Formation · 🌴 Congés · 🧘 RTT · 😌 Jour de repos · 🎏 Jour férié · 🤒 Arrêt maladie

On y arrive aussi par le bouton **🏷️ Congés & télétravail**, sous le titre du mois.

La fenêtre demande d'abord **sur quoi** poser le tampon :

- **📌 Ce jour-là seulement** — un seul jour, celui que vous choisissez. C'est le cas par défaut :
  jamais rien ne déborde sur les jours suivants.
- **📎 Plusieurs jours précis** — vous ajoutez vos dates une par une, elles s'affichent en pastilles
  qu'on retire d'un clic. C'est fait pour le télétravail posé à la dernière minute : le 17, le 21 et
  le 28, et rien entre les deux.
- **📆 Toute une période** — du … au …, avec la possibilité de ne retenir que certains jours de la
  semaine (les mardis et jeudis de la quinzaine).

Le tampon s'affiche en travers de la journée, un peu de biais comme un vrai tampon encreur, et teinte
la case. Pour des congés, choisissez le tampon puis **une date de fin** : toute la période est
tamponnée d'un coup, et un bouton **Annuler** permet de revenir en arrière. Une note est possible
(« Corse ✈️ »).

**Pour du télétravail posé à la dernière minute**, cochez en plus **les jours de la semaine**
concernés : « du 12 au 25 octobre, les mardis et jeudis » pose le tampon sur ces quatre jours-là
seulement. Rien de coché = toute la période.

Un tampon **l'emporte toujours sur les horaires** : un jour de congés, de RTT ou de repos n'affiche
aucune bande de travail et sa colonne part en hachures. À l'inverse, un télétravail posé un dimanche
fait apparaître la bande ce jour-là.

## Le type « travail »

En plus de 📅 Rendez-vous et ✅ Tâche, le formulaire propose **💼 Travail**, avec ce que c'est :

- 💼 **Temps de travail** — de telle heure à telle heure (vos horaires sont pré-remplis) ;
- 🍽️ **Pause déjeuner** — pré-remplie à l'heure de votre pause, affichée en hachures ;
- 👥 **Réunion** · 🎓 **Formation** · 📟 **Astreinte**.

La catégorie Travail et une durée adaptée sont posées automatiquement ; tout reste modifiable.

## 📝 Les examens

Un contrôle n'est ni un rendez-vous ni une tâche : c'est son propre type, le quatrième du
formulaire, à côté de 📅 Rendez-vous, ✅ Tâche et 💼 Travail.

- **L'épreuve** : 📝 Contrôle · 📄 Devoir surveillé · 🎓 Examen · 🧾 Examen blanc · 🗣️ Oral ·
  🧪 TP noté · 🏅 Concours · 🔁 Rattrapage. Chacune apporte sa durée habituelle — un DS fait deux
  heures, un oral trente minutes — et son pictogramme.
- **La matière** (« Mathématiques ») et le **coefficient** (« coef. 3 ») ont leur champ.
- Un examen arrive avec la catégorie **Études**, un **rappel la veille** et un **compte à rebours**
  déjà cochés : il s'affiche donc tout de suite en grand dans « À ne pas oublier », avec les jours,
  les heures et les minutes qui restent.
- Dans le calendrier, il se repère à son **liseré double** et à ses hachures ; son pictogramme est
  collé en sticker sur le bloc.
- Sur la page **✨ Ma journée**, une carte **📝 Prochains examens** les liste dans l'ordre, avec la
  date, l'épreuve, la matière, le coefficient, la salle, l'horaire et le nombre de jours restants.
  Elle n'apparaît que si vous avez des examens à venir.

## Les illustrations

Chaque rendez-vous, tâche ou temps de travail porte une **illustration**, devinée d'après son
intitulé : « Muscu à la salle » → 🏋️, « Piscine » → 🏊, « Dentiste » → 🦷, « Ciné » → 🎬,
« Formation » → 🎓, « Courses » → 🛒… Une cinquantaine de pictogrammes sont proposés dans le
formulaire si vous préférez en choisir un vous-même, ou aucun.

Elle apparaît en petit dans les pastilles du mois et dans les listes de la page « Ma journée », et
surtout **comme un sticker collé en haut à droite du bloc**, légèrement de travers, avec son liseré
blanc — dans les vues semaine et jour. C'est là qu'elle décore vraiment l'agenda : le sport du soir,
la formation, le déjeuner se repèrent d'un coup d'œil.

**Le sticker se met à la taille du bloc** : généreux sur une après-midi entière, moyen sur une
heure, tout petit sur une demi-heure ou sur un bloc serré entre deux autres — et absent quand le
bloc est vraiment minuscule. Le texte, lui, garde toujours sa place : il ne passe jamais sous le
pictogramme, et le titre d'un relais de garde reste lisible en entier.

## Du début à la fin — plus de durée en minutes

Un rendez-vous se saisit **de telle date et heure à telle date et heure** : quatre champs, et une
ligne qui dit en toutes lettres ce que ça donne — « 1 h 30 », « toute la journée », ou
« 7 jours, du 27 octobre au 2 novembre ». La fin suit automatiquement quand vous déplacez le début.

**Minuit se saisit comme fin de soirée** : une soirée de 22 h à `00:00` dure bien deux heures, et
non « rien du tout ». Plus besoin d'écrire 23 h 59.

**Un quart d'heure se saisit comme le reste** : `16:30` → `16:45`. L'heure de fin n'est plus
corrigée pendant que vous la tapez — le temps d'écrire « 16:45 », le champ passait par 16:00, que
l'outil croyait antérieur au début et remplaçait aussitôt par 17:30. Désormais il attend que vous
quittiez le champ, et la ligne *Cela dure* affiche « 15 min ». Dans la semaine, un bloc aussi court
tient sur **une seule ligne** : titre et horaire côte à côte, rien n'est rogné.

Un élément **sur plusieurs jours** — des vacances, un déplacement, un séjour — s'affiche sur chacune
de ses journées, en bandeau rayé, numéroté `1/7`, `2/7`… Dans les vues semaine et jour, il se place
dans la ligne **Journée**, au-dessus de la grille des heures. Le glisser-déposer le déplace en entier,
même si vous l'attrapez par un jour du milieu, et tirer le bord du bas d'un bloc change son **heure de
fin**.

## Rendez-vous et tâches

- **Rendez-vous** : date, heure, durée, lieu. **Tâche** : date, heure facultative, priorité
  (haute, moyenne, basse). On passe de l'un à l'autre dans le formulaire.
- **Catégories colorées** : Personnel, Travail, Famille, Santé, **Sport**, Loisirs, Administratif,
  Études, Important. Le sport a sa propre couleur, un vert franc : le judo du mardi ne se confond
  plus avec le cinéma du samedi.
  Sous le calendrier, cliquer une catégorie la masque ou la réaffiche.
- **Répétition** : chaque semaine, chaque mois ou chaque année, avec une date de fin facultative.
  Sur « chaque semaine », vous **choisissez les jours** : cochez mardi et jeudi, et la permanence de
  8 h 45 revient tous les mardis et jeudis sans que vous ayez à la ressaisir.
- **Quelles semaines** (sur « chaque semaine ») : toutes, **une semaine sur deux** à partir de la
  date choisie, ou — si la garde alternée est activée — **seulement vos semaines avec les enfants**,
  voire seulement celles où ils sont chez l'autre parent. C'est le lundi d'école : *« c'est moi qui
  l'emmène et qui vais le chercher tous les lundis, mais une semaine sur deux »*. En choisissant
  **mes semaines avec Driss**, l'agenda suit le rythme de garde tout seul — vacances échangées et
  arrangements compris.
- **Rappel** : à l'heure, 15 min, 1 h, la veille ou une semaine avant. Il apparaît dans l'outil
  (et sur le bureau Windows si vous cliquez le 🔔 de l'en-tête) tant que
  NaoAgenda est ouvert.
- **Compte à rebours** : à cocher sur un événement (coché d'office pour la catégorie Important).
  Le plus proche s'affiche en grand dans « À ne pas oublier », les suivants en « J-12 ».
- **Terminé** : le rond à gauche d'une ligne, ou « ✓ Marquer comme terminé » dans la fiche.
  Pour un événement qui se répète, seule l'occurrence du jour est cochée.
- Ajouter vite : le **+** au survol d'une case du mois, un clic dans une colonne horaire
  (semaine ou jour) pour créer un rendez-vous à cette heure, ou le champ « Ajouter une priorité… ».

## Journées chargées

Une journée est **chargée** à partir de **5 éléments** ou de **6 h de rendez-vous**. Elle est
teintée d'ambre dans le calendrier, porte une pastille « chargée », et les prochaines sont
signalées dans « À ne pas oublier ».

Le **temps de travail** et les **formations** ne comptent pas : c'est la journée elle-même, pas
une charge en plus. Et le jour d'une formation (un élément 💼 Travail de sorte 🎓 Formation, ou
un rendez-vous de catégorie Travail dont le titre contient « formation »), la formation
**remplace** le travail, mais seulement sur ses heures à elle : une formation de 9 h à 12 h
retire la matinée des horaires, et l'après-midi reste travaillé. Une formation sans heure, ou
qui couvre toute la journée, remplace la journée entière.

## Anniversaires, fêtes et dates importantes

### 🎂 La page Anniversaires — tout le carnet, en visuel

L'onglet **🎂 Anniversaires** montre **tout ce qui est enregistré**, rangé **mois par mois**, du
1er janvier au 31 décembre. Chaque mois porte l'emblème de sa saison — 🎃 octobre, 🎄 décembre,
🌸 mars — et **chaque carte prend les couleurs de son mois** : le médaillon de Camille est orange
Halloween, celui de juin aux couleurs de la fête de la musique. L'année se lit d'un coup d'œil.

Sur chaque carte : le prénom, le jour, l'âge, le lien, l'**idée cadeau** avec son budget, et le
temps qui reste — *« dans 12 jours »*, *« Demain »*, *« 🎉 Aujourd'hui »* (la carte du jour
s'auréole de lumière). Celle marquée **⭐ MOI** est dorée.

- **Cliquer une carte** ouvre la carte de fête, comme depuis l'agenda.
- **Le crayon ✏️**, en bas à droite de la carte, ouvre directement le formulaire pour **modifier**
  ou **supprimer**.
- **＋ Ajouter un anniversaire** est en haut de la page (et reste en haut de l'outil).
- En tête, le compte de ce qui est enregistré, **combien arrivent dans les 30 jours**, le **total
  des budgets cadeaux** notés, et dans combien de jours tombe **le vôtre**.

- Trois types : 🎂 **Anniversaire**, 🌸 **Fête**, 💫 **Date importante** (ex. anniversaire de mariage).
  Ils reviennent chaque année tout seuls. L'année est facultative : si elle est connue, l'âge s'affiche.
- **Alerte** : une semaine avant, trois jours avant ou la veille.
- **Idée cadeau** et **budget** pour chacun.
- **Le jour J** : confettis discrets, carte animée avec gâteau et bougies, et une **suggestion de
  message** adaptée au lien (famille, ami·e, amour, collègue) — « ↻ Une autre idée », « 📋 Copier ».
  **Les paillettes et confettis tombent en continu tant que la carte est ouverte**, derrière elle.
  La carte s'ouvre une fois par jour ; ensuite, le bandeau doré permet de la rouvrir.

### ⭐ Votre anniversaire à vous

Sur la page **✨ Ma journée**, une carte dorée **🎂 Mon anniversaire** affiche le **compte à rebours**
jusqu'au vôtre — jours, heures, minutes, secondes, à la seconde près — avec l'âge que vous allez
fêter. Elle n'existe que pour l'anniversaire marqué **MOI** : les autres n'ont pas de compte à
rebours. Le jour venu, la carte change de visage : *« C'est aujourd'hui ! »*, et un bouton
**🎉 Ouvrir la fête** relance l'animation quand vous voulez.

Dans le champ **Lien**, choisissez **⭐ MOI**. Ce jour-là, l'agenda ne vous fait pas la même fête :

- un **feu d'artifice** plein écran — des fusées qui montent, explosent en gerbes de couleurs et
  laissent leurs traînées s'éteindre ;
- une **guirlande de fanions** qui tombe du haut de l'écran et se balance ;
- une carte qui **se déplie en perspective**, bordée d'or, avec votre prénom en dégradé qui respire ;
- **votre âge qui défile** jusqu'au bon chiffre, en géant, avec un petit sursaut à l'arrivée ;
- le gâteau qui flotte, ses bougies allumées, et un bouton **🕯️ Souffler les bougies** : les flammes
  s'éteignent, la carte s'illumine d'un grand halo, et le vœu est formulé.

## ↩ Annuler la dernière action

Le bouton **↩** dans l'en-tête, ou **Ctrl + Z**, revient sur ce que vous venez de faire : un
rendez-vous ajouté ou supprimé, un tampon posé, un déplacement, un réglage changé. **Ctrl + Y**
(ou Ctrl + Maj + Z) le refait. Les quarante dernières actions restent en mémoire tant que l'outil
est ouvert, et le bouton reste éteint quand il n'y a rien à annuler.

## Vider, effacer, repartir à neuf

Trois gestes, du plus doux au plus radical :

| Bouton | Où | Ce qu'il fait | Annulable |
|---|---|---|---|
| 🧽 **Effacer les exemples** | sous le calendrier | Retire seulement les exemples du premier lancement ; vos saisies restent. | Oui, bouton **Annuler** |
| 🧹 **Vider le mois / l'année** | sous le calendrier | Retire les rendez-vous et tâches de la période affichée. Anniversaires conservés. | Oui, bouton **Annuler** |
| ♻️ **Réinitialiser l'outil** | en-tête, à droite | Remet NaoAgenda dans l'état du **tout premier lancement**. | **Non** |

**♻️ Réinitialiser l'outil**, c'est la même fenêtre que dans NaoPlan. Elle dresse d'abord
**l'inventaire précis** de ce qui va disparaître — vos rendez-vous, vos tâches, vos anniversaires
avec leurs idées cadeaux, vos enregistrements, vos réglages (thème, vue, page, catégories masquées) —
puis conseille de **garder une sauvegarde**, avec un bouton qui exporte l'agenda en `.json`. Le bouton
rouge reste **bloqué tant que vous n'avez pas tapé `EFFACER`**. Ensuite l'outil se recharge avec ses
exemples, comme pour une nouvelle personne. Il n'y a pas de retour en arrière : seul le fichier `.json`
exporté avant permet de revenir, en le réimportant dans 🗂️ Mes enregistrements.

Il n'y a plus de fenêtre de réglages : le thème, les enregistrements et la remise à zéro sont
directement dans l'en-tête, et le 🔔 n'apparaît que si les notifications du bureau n'ont pas encore
été autorisées.

## Enregistrer et remettre l'agenda — comme dans NaoFi

L'agenda affiché est gardé automatiquement par le navigateur. En plus, vous pouvez en garder
**des versions nommées**, et en remettre une quand vous en avez besoin :

- **📥 Enregistrer** (ou **Ctrl + S**) : donnez un nom — « Agenda de la rentrée », « Avant
  les vacances »… — et l'état actuel est rangé dans vos enregistrements. Si vous travaillez sur
  une version déjà enregistrée, le bouton **↻ Mettre à jour** la remplace par l'état actuel ;
  « Nouvel enregistrement » en crée une autre à côté.
- **🗂️ Mes enregistrements** : la liste, de la plus récente à la plus ancienne, avec la date et
  le nombre d'éléments. Celle que vous avez remise ou enregistrée en dernier porte l'étiquette
  **EN COURS**. Pour chacune :
  - **↩ Remettre** — remplace l'agenda affiché par cette version (avec confirmation, et
    **Annuler** juste après) ;
  - ✏️ **Renommer** ;
  - 📤 **Exporter** en fichier `.json` ;
  - 🗑️ **Supprimer** (avec Annuler).
- **📂 Importer un fichier .json** (dans la même fenêtre) ajoute un fichier exporté à la liste ;
  il ne remplace rien tant que vous n'avez pas cliqué « Remettre ».
- **📤 Exporter l'agenda affiché** crée un fichier de l'état actuel.

Les enregistrements vivent dans ce navigateur, **pour cette adresse de fichier**. Pour passer
l'agenda sur un autre ordinateur, après avoir déplacé le dossier, ou par précaution : exportez
en `.json`, puis importez le fichier au nouvel endroit. Vider les données de navigation efface
l'agenda **et** les enregistrements : gardez un export récent de côté.

## Le fond

Le fond de la maison NaoGroup — grand dégradé violet, trame de points, trois halos qui dérivent —
avec, en plus, un **ciel étoilé** et de **petits motifs d'agenda** qui montent lentement : un
calendrier, une horloge, une cloche de rappel, une coche, une étoile et un gâteau d'anniversaire.
Ils sont volontairement très pâles (autour de 20 % dans le thème sombre, 17 % dans le clair) et se
placent surtout dans les marges, pour ne jamais gêner la lecture. Si votre système demande de
**réduire les animations**, ils ne sont pas affichés du tout.

## Le logo

Même jeton que toute la famille (carré de 40, rayon 13, dégradé violet `#6A4ED0` → lavande
`#C7A6F6`) et même N blanc d'un seul tracé. L'accent de NaoAgenda, en blanc à 50 %, est
**l'en-tête d'un calendrier** : une ligne et un anneau de reliure. Le second anneau est remplacé
par **une petite étoile pleine**, légèrement lumineuse : la date qui compte. Le signe reste
lisible à 16 px.
