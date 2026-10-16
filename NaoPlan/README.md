# NaoPlan

**Générateur de plans de projet immobilier** — le troisième outil de la suite
[NaoGroup](../Gestion%20budget/NaoGroup.html), après NaoFi (crédit) et NaoBudget (budget).

On décrit le logement qu'on cherche — type, surface, chambres, jardin, terrasse —
et NaoPlan en dessine des plans cotés, meublés, qu'on remanie ensuite pièce par pièce
et qu'on sort en PDF.

Comme les autres outils de la maison : **un seul fichier**, rien à installer,
rien qui sorte de l'ordinateur.

---

## Ouvrir l'outil

Double-cliquez sur **`NaoPlan.html`**, ou lancez une fois
`creer-raccourci-naoplan.ps1` (clic droit → « Exécuter avec PowerShell »)
pour poser un raccourci sur le bureau : l'outil s'ouvre alors dans sa propre
fenêtre, avec son logo comme icône.

---

## Ce qu'on peut faire

**Un parcours en six étapes**, comme dans NaoFi : un rail à gauche, un bandeau en
tête, un dock « Précédent / Suivant » en bas.

1. **Le projet** — nom, type d'opération, lieu, calendrier (début, emménagement,
   durée calculée), foyer, budget, envies.
2. **Les critères** — tout, en détail : le bien (style, toiture, hauteur sous
   plafond, orientation), les chambres et la suite, les pièces d'eau, les pièces
   de vie, les extérieurs, **la piscine** (forme, pose, dimensions, profondeur,
   chauffage, couverture, margelle, traitement…), le stationnement, la technique.
3. **Les plans** — plusieurs variantes, en lecture seule. On choisit, on imprime,
   on enregistre… ou on continue : « Personnaliser » (étape 4) ou « Aménager
   directement » (étape 5).
4. **Personnalisation** *(facultative)* — pièces, murs, portes, fenêtres, portes
   de garage, niveaux (« ＋ Niveau » : l'escalier arrive pile au-dessus).
5. **Aménagement** *(facultatif)* — les meubles.
6. **Ambiances** *(facultatives)* — pièce par pièce : style, sol (matière, teinte,
   pose), murs (matière, couleur, motif), plafond, palette, matières d'accent, vos
   mots ; des inspirations en un clic. Puis **le récapitulatif** de tout le projet,
   qui part aussi dans le PDF.

**↶ La flèche retour** (en haut, ou Ctrl+Z) annule la dernière modification ;
↷ (Ctrl+Y) la rétablit.

**L'ouverture** — comme NaoDoc ouvre son classeur, NaoPlan déroule sa feuille de
calque : un crayon court le long de l'emprise pendant qu'elle se trace, les deux
cloisons suivent, les quatre pièces se colorent et prennent leur nom, une porte
s'ouvre, deux fenêtres se posent, le lit et le canapé arrivent, la cote s'écrit
(« 12,05 m »), le nord se cale, et le cartouche se signe — « NaoPlan · plan de
projet · échelle 1:50 ». Trois secondes et demie en tout. Un clic passe tout de
suite ; la feuille se soulève et la page apparaît dessous. Rien ne s'affiche si
le système demande moins d'animations, et rien ne part à l'impression.

**Le fond** — derrière la page, la trame d'un calque glisse doucement et dix
motifs de plan dérivent dans les marges : maison, feuille de plan, ligne de cote,
escalier, porte, fenêtre, boussole, clé, équerre, mètre. La maison et l'escalier se
dessinent au crayon, puis s'effacent. Tout est très pâle, ne prend jamais la
souris, ne s'imprime pas, et s'arrête si le système demande moins d'animations.

**Les critères** (colonne de gauche)

| Critère | Valeurs |
|---|---|
| Type de bien | appartement · maison · duplex |
| Surface habitable | 20 à 500 m² |
| Niveaux | 1 ou 2 (imposé à 2 pour un duplex, à 1 pour un appartement) |
| Chambres | 0 à 8 |
| Salles de bain | 1 à 4 |
| Terrasse / balcon | en m², accolée au séjour |
| Jardin | en m², autour de la maison |
| Suite parentale | chambre seule · suite + salle d'eau · suite + salle d'eau + dressing ; au rez ou à l'étage |
| Programme | cuisine ouverte, WC séparé, dressing indépendant, cellier, buanderie, bureau, garage |
| Dessin | mobilier, cotes d'ensemble, autre niveau en transparence, orientation du nord |

**Les propositions** — trois variantes sont proposées à chaque fois : ce sont les
trois meilleurs agencements trouvés parmi plusieurs centaines, choisis pour ne pas
se ressembler. Elles se recalculent dès qu'un critère change.

**✏️ Mon plan** — dès qu'on retouche une proposition, elle est figée dans l'onglet
« Mon plan ». Là, **une retouche ne change que ce qu'elle touche** :

- **glisser une pièce sur une autre** : les deux échangent leur place, rien d'autre ne bouge ;
- **tirer un mur** (le curseur change au survol) : la cloison se déplace, comme le
  bord d'une fenêtre d'ordinateur ; les murs à moins de 4 cm se rejoignent d'eux-mêmes ;
- **tirer une façade** : la maison s'agrandit — à tous les niveaux à la fois, pour
  que les étages restent superposés ; on peut aussi taper l'emprise au centimètre ;
- **ajouter une pièce** : elle est découpée dans la pièce sélectionnée ;
- **supprimer une pièce** : sa place revient à une voisine ;
- **⇅** : envoyer une pièce à l'autre niveau.

Aucune dimension n'est interdite : une pièce étroite est signalée, jamais bloquée.
Changer un critère refait les propositions mais ne touche pas à « Mon plan ».

**Le mode construction** — une palette d'outils au-dessus du plan :
✋ Déplacer · 🧱 Tracer un mur (la pièce se coupe en deux, avec une porte) ·
🧽 Effacer un mur — n'importe lequel : les deux pièces n'en font plus qu'une,
quelle que soit la forme obtenue (L, T, U…) ; un mur de façade s'ouvre sur
l'extérieur (« Rebâtir le mur » le remet) · 🚪 Porte · 🪟 Fenêtre · 🌅 Baie
(un clic sur un mur pour la poser). Échap revient à ✋, Suppr efface la sélection,
R la fait tourner. Chaque retouche est animée : les pièces glissent vers leur
nouvelle place, et une gerbe d'étincelles salue le geste. Une pièce saisie se
réduit en miniature sous le curseur et reprend sa taille là où on la lâche.

**Murs au millimètre** — un clic sur un mur (sans tirer) le sélectionne : sa
barre donne sa position exacte, à taper au millimètre (3,245 m), avec des pas de
±1 mm, ±1 cm, ±10 cm, et un bouton pour l'effacer. Sur une façade, on tape
directement la largeur ou la profondeur de la maison.

**Les m²** — cachés par défaut. L'interrupteur « m² » en haut, jumeau de celui
du thème, les affiche : chaque surface apparaît l'une après l'autre en comptant.

**Portes et fenêtres** — un clic en sélectionne une ; on la fait glisser le long de
son mur ou jusqu'à un autre mur, on la fait tourner (quatre positions), on change
son type (porte, porte d'entrée, fenêtre, baie, **porte de garage**, passage), sa
largeur, ou on la supprime (bouton, Suppr ou outil Effacer). Un garage posé dehors
porte sa porte sectionnelle côté rue, ou du côté choisi dans sa barre.

**🛋️ Aménager** — dernier outil de la palette. Un catalogue par rayon (Chambre,
Salle d'eau, Cuisine, Séjour, Rangement, Buanderie, Extérieur) : lits, chevets,
armoire, bureau, WC, lavabo, double vasque, douche, douche à l'italienne,
baignoire, plan de travail, évier, plaque, four, frigo (et américain),
lave-vaisselle, îlot, tables avec chaises, canapé (droit ou d'angle), fauteuil,
meuble TV, bibliothèque, dressing, placard, lave-linge, sèche-linge, chauffe-eau,
spa, bain de soleil, barbecue… On glisse un meuble sur le plan : il se tourne dos
au mur le plus proche et s'y plaque. Ou on le clique, puis chaque clic sur le plan
en pose un (Échap pour arrêter). Ensuite : glisser pour le déplacer (Alt : sans
aimant), poignées pour l'étirer, R pour pivoter, angle libre dans sa barre,
flèches pour l'ajuster au centimètre (Maj : 10 cm), Ctrl+D pour le dupliquer,
Suppr pour l'enlever. « ✨ Meubler automatiquement » pose un premier jeu dans chaque
pièce encore vide ; « 🧹 Tout enlever » vide le niveau. Une pièce meublée à la main
perd ses symboles automatiques ; quand deux pièces échangent leur place, leurs
meubles déménagent avec elles. Les meubles apparaissent aussi en 3D et au PDF.

**Piscines** — rectangulaire, carrée, ronde, ovale ou haricot ; creusée,
semi-enterrée ou hors-sol (cuve avec échelle, en relief dans la maquette 3D).
Forme et pose se changent dans la barre de la piscine sélectionnée.

**Garage, terrasse et autres annexes** — ce sont des objets à part : on les
déplace par le milieu (ils s'aimantent aux façades), on les étire par leurs bords,
on les fait pivoter (R), on tape leurs cotes, on les supprime. « ＋ Dehors » en
ajoute : garage, terrasse, balcon, abri de jardin, carport, piscine.

**Types de pièce et escaliers** — chaque carte de pièce a une liste pour changer
son type ; un escalier peut être droit, quart tournant, demi-tournant ou en
colimaçon (dessin 2D et maquette 3D suivent).

**Importer un plan existant** — « 🖼️ Importer un plan », une image par niveau.
La lecture se fait dans le navigateur : murs, pièces (une pièce en L reste une
seule pièce), portes et fenêtres, et — si on le coche — les noms écrits sur le
plan (« Chambre », « Cuisine »…). On tape la largeur réelle du rez ; les autres
niveaux prennent la même échelle (et gardent leur vraie taille, sans être étirés),
sauf si on tape la leur. La lecture reconnaît les cloisons en trait fin et les
portes dessinées en liseré gris (sur ces plans, un trou blanc est un passage, pas
une porte) ; une petite pièce sans nom lisible reste « Pièce » plutôt qu'un « WC »
deviné. La précision dépend de l'image : la fenêtre l'annonce
(« 1 pixel ≈ 1,2 cm ») ; le reste se règle mur par mur au millimètre. Tout devient
modifiable. L'image d'origine reste en transparence pour vérifier ;
un bouton la cache.

**La gouttière** — à droite, « 💾 Garder ce plan » range une copie par projet.
On la rouvre d'un clic, on en coche plusieurs pour les comparer côte à côte.
« 🧹 Plan vierge » repart d'une emprise vide ; « 🗑️ Supprimer Mon plan » revient
aux propositions.

**Les vues** — le plan coté, une **maquette 3D** (murs coupés à 1,25 m pour voir
l'intérieur) et les **quatre façades** avec leurs hauteurs d'allège et de faîtage.

**Le PDF** — le bouton « Télécharger le PDF » ouvre la boîte d'impression :
choisissez **« Enregistrer au format PDF »**. Sortent une feuille A4 paysage par
niveau, la maquette 3D, la façade choisie, et une feuille de surfaces et de critères.

Le projet en cours est gardé par le navigateur ; « Enregistrer » en fait une copie
`.json` qu'on peut ranger ailleurs et recharger plus tard.

**♻️ Réinitialiser** — le bouton de la barre du haut rend NaoPlan **vierge**, comme
pour une nouvelle personne : projet, critères, « Mon plan » et ses meubles, plans
gardés dans la gouttière, images importées, ambiances, thème et affichage des m².
La fenêtre dit d'abord ce qui va disparaître, propose d'enregistrer une sauvegarde,
et ne se déverrouille qu'une fois le mot **EFFACER** tapé. C'est définitif.

---

## Comment les plans sont fabriqués

Tout est dans `src/naoplan-moteur.js`, en quatre temps :

1. **Le programme** — les critères deviennent une liste de pièces, chacune avec
   une surface visée (une fourchette par type : un séjour vaut ~26 % de la surface,
   une chambre ~9 %, jamais moins que son minimum).
2. **L'enveloppe** — un rectangle dont l'aire vaut la surface d'un niveau.
   Pour un duplex, les deux niveaux partagent la même emprise : un étage se
   superpose au rez, il ne flotte pas.
3. **La distribution** — une bande de circulation traverse le niveau :
   l'entrée contre une façade, l'escalier et le WC à sa suite, puis le **hall**,
   qui prend tout le reste et file le long des chambres pour que chacune ait sa
   porte dessus. À l'étage, le palier **contourne l'escalier** (une même pièce en
   deux morceaux) pour qu'aucune chambre ne reste au fond d'un cul-de-sac.
   Les pièces se rangent de part et d'autre, en une ou deux rangées ; le couloir
   peut passer au milieu, avec des chambres des deux côtés.
4. **Les ouvertures** — portes sur les murs mitoyens de la circulation,
   fenêtres sur les murs donnant dehors, baie du côté de la terrasse.

**Ce que le moteur sait d'une maison d'aujourd'hui** — c'est ce qui sépare un
plan qui se tient d'un plan où les pièces sont posées au hasard :

- cuisine ouverte = **une seule** grande pièce de vie (séjour · cuisine ·
  salle à manger), ouverte sur la terrasse ; cuisine fermée = deux pièces voisines ;
- le **cellier** et la **buanderie** sont derrière la cuisine, jamais dans le couloir :
  on ne traverse pas un cellier pour aller au salon ;
- on entre par l'**entrée**, qui touche une façade et donne sur le hall et le séjour ;
- la **suite parentale** emmène sa salle d'eau et son dressing : ils se rangent
  derrière elle et s'ouvrent dedans, pas dans la chambre d'à côté ;
- on n'empile jamais deux chambres l'une derrière l'autre, et une pièce ne
  s'ouvre pas dans l'escalier ;
- une chambre collée au séjour, un WC qui donne sur la pièce de vie, une pièce
  plus étroite que son usage : autant de points de pénalité.

Le moteur essaie **768 configurations** (bande horizontale ou verticale,
élancement, ordre des pièces, couloir au milieu ou sur un côté), les note sur
tout ce qui précède — plus les proportions, le plus petit côté et les pièces
aveugles — et garde les trois meilleures qui diffèrent vraiment. Une génération
prend environ 10 ms.

### Ce que l'outil ne fait pas, et le dit

- Les surfaces sont mesurées **d'axe en axe** : elles ne tiennent pas compte de
  l'épaisseur réelle des cloisons et **ne valent pas mesurage Carrez**.
- Structure, murs porteurs, réseaux, règles d'urbanisme, accessibilité :
  **rien de tout cela n'est vérifié**. Un plan NaoPlan est une intention de
  programme, pas un document d'architecte.
- Quand un programme ne tient pas dans la surface demandée (5 chambres dans
  55 m², par exemple), l'outil le dit — sans rien bloquer : les pièces
  concernées portent la mention « étroite », à vérifier selon l'usage.
- Les escaliers de deux niveaux sont vérifiés : s'ils ne tombent pas l'un
  au-dessus de l'autre, un bandeau le signale.
- La lecture d'image vise les plans d'annonce aux murs noirs épais. Murs en biais,
  pièces rondes et croquis au trait fin ne sont pas lus. Des petites cases en trop
  peuvent apparaître : l'outil 🧽 les efface d'un clic. La lecture des noms
  télécharge son moteur la première fois (il faut une connexion ce jour-là) ;
  l'image, elle, n'est envoyée nulle part.
- Les niveaux importés sont ajustés à l'emprise du rez-de-chaussée.
- Certains programmes serrés laissent une pièce dont la porte donne sur une
  autre pièce plutôt que sur le couloir. C'est écrit sur sa carte
  (« porte sur … ») — un glisser-déposer suffit à la déplacer.
- Un grand terrain est **dessiné réduit** autour de la maison, pour que le
  logement reste lisible ; sa surface réelle est écrite à côté.

---

## Les fichiers

```
NaoPlan.html                  l'outil, autonome (c'est le fichier à ouvrir)
naoplan.ico                   l'icône du raccourci
build.sh                      reconstruit NaoPlan.html depuis src/
creer-raccourci-naoplan.ps1   pose le raccourci sur le bureau
src/
  index.html                  la page
  naoplan.css                 la charte NaoGroup + les teintes du plan
  naoplan-moteur.js           programme, enveloppe, découpe, ouvertures, « Mon plan »
  naoplan-3d.js               maquette 3D et façades
  naoplan-lecture.js          lecture d'une image de plan (murs, pièces, ouvertures, noms)
  naoplan-meubles.js          l'aménagement : catalogue de meubles, dessins, aimant aux murs, piscines
  naoplan.js                  dessin SVG, interface, impression
  generer-icone.ps1           régénère naoplan.ico depuis le tracé du logo
```

**On ne modifie pas `NaoPlan.html` à la main** : on édite `src/`, puis on relance
`build.sh` (Git Bash : `sh build.sh`), qui recolle tout en un seul fichier.

---

## Le logo

Le jeton carré-arrondi de la famille, le N blanc d'un seul tracé, et **un toit
posé au-dessus**. Les accents de NaoFi et NaoBudget partent du N ; celui-ci
l'abrite — c'est le propos de l'outil. Dégradé `#7A4FD6 → #BE9AF4`.
Tout est expliqué dans [la charte](../Gestion%20budget/CHARTE-NaoGroup.html).
