# NaoDoc

> **Vos documents, vos échéances, votre tranquillité.**

Le classeur familial de la maison NaoGroup : on entre les documents de toute la famille, NaoDoc les trie
**par personne** et **par thème**, et on les retrouve en un instant. Un seul fichier, `NaoDoc.html`, à double-cliquer.
Tout reste sur l'ordinateur.

## Ce qu'on y trouve

| Onglet | Rôle |
|---|---|
| 🏠 Accueil | Recherche, « Ajouter un document / Ajouter un profil / Ouvrir le classeur », les profils de la famille, les thèmes, les derniers documents ajoutés |
| 📚 Mon classeur | Choix de la personne (Toute la famille, Foyer, chaque membre), puis un intercalaire par thème, avec une page qui se tourne |
| 👨‍👩‍👧 Ma famille | Gérer les profils (prénom, rôle, avatar, couleur). Chaque profil affiche tous les thèmes et leur nombre de documents |

**Profils** — le profil « Foyer » (commun : bail, assurance habitation, livret de famille…) existe toujours ; on ajoute
ensuite chaque membre : moi, conjoint·e, enfant, parent… Supprimer un profil ne perd rien : ses documents vont dans « Foyer ».

**Thèmes** — identité, logement, banque, assurance, santé, travail, impôts, véhicule, famille, loisirs, et vos thèmes
personnels. Chaque personne a sa liste : un thème créé depuis son classeur n'est qu'à elle (« Pour qui ? » pour en
cocher d'autres), et 🗑 depuis son classeur ne le retire que chez elle. « Tout » (Toute la famille) montre toujours tous
les thèmes ; 🗑 depuis « Toute la famille » le retire pour tous. Les documents d'un thème supprimé sont déplacés vers
le thème choisi, jamais perdus ; les thèmes de départ se rétablissent depuis « ＋ Thème ».

**Retrouver mes fichiers** — la liste des documents suit le compte d'un ordinateur à l'autre, mais pas les fichiers
joints (IndexedDB, propre à chaque navigateur). Si des fichiers manquent, un bandeau apparaît sur l'accueil : on montre
le dossier des originaux et NaoDoc les rattache par leur nom (la taille et le dossier d'origine départagent les homonymes).

**Chaque document** — pour qui, le thème, un nom, l'organisme, une référence, l'emplacement de l'original, des notes,
et si on le souhaite un fichier numérisé (image ou PDF, 25 Mo au plus, gardé dans IndexedDB). « Dupliquer » crée le
même document pour un autre membre.

**Import par lot** — 📥 « Importer des documents » (accueil ou classeur), ou glisser-déposer des fichiers / dossiers
n'importe où dans la page. NaoDoc lit le nom des fichiers **et des dossiers** : le thème est deviné par mots-clés
(« BS », « salaire » → Travail ; « avis impot » → Impôts ; « Santé » → Santé…), la personne par son prénom
(« Léa/Santé/scan.pdf » → Léa). Un écran de vérification permet de corriger avant de ranger ; les fichiers non reconnus
sont en orange. L'emplacement retient le dossier d'origine (« Ordinateur : … »).

**Mémoire de l'organisme** — dès qu'un nom ressemble à un document déjà rangé (« 03 BS Mars » ≈ « 02 BS Février Marc » :
dates, mois et prénoms sont ignorés), l'organisme, l'emplacement et le thème sont repris. « ＋ Enregistrer et ajouter le
suivant » garde la personne, le thème, le nom et l'organisme pour enchaîner les bulletins de salaire.

**Aperçu** — la fiche d'un document montre directement le PDF ou l'image joint.

**Recherche** — par nom, personne, thème, organisme, référence, notes ou emplacement (touche `/`).

À l'ouverture, le classeur s'ouvre comme un livre (un clic pour passer). Cliquer sur le logo ramène à NaoGroup.
Thème clair / sombre (☾ ☀), 🕊️ pour mettre les animations en pause, 💾 / 📂 pour sauvegarder et recharger
(fichiers joints compris), 🧹 pour réinitialiser l'outil et repartir d'un classeur vierge (il faut écrire EFFACER pour confirmer).

## Sur le bureau

- `creer-raccourci-bureau.ps1` — pose un raccourci NaoDoc (fenêtre d'application Chrome ou Edge).
- `generer-icone.ps1` — régénère `naodoc.ico` à partir du logo.

## Le logo

Le jeton de la famille et, au-dessus du N, **deux feuilles** : l'une posée de biais, à demi transparente, l'autre en
blanc plein avec son coin corné. Dégradé `#5F48D2 → #9580EC → #CDB6F7`. Symbole `l-do` dans `../naogroup-logos.js`.

## Intégration NaoGroup

- `../naogroup-cloud.js` : entrée `naodoc` du catalogue (clés `naodoc.*`).
- `../NaoGroup.html` : carte NaoDoc dans « Les outils », juste avant la place gardée « À venir ».
