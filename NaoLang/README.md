# NaoLang

> **NaoLang — Une langue à la fois, le monde s'ouvre.**

L'application d'apprentissage des langues de **NaoGroup** : des leçons courtes, des exercices variés,
une révision intelligente, des histoires audio et des mises en situation réelles. Elle convient aux débutants,
aux personnes qui reprennent une langue, aux voyageurs, aux étudiants et aux professionnels.
Il n'y a qu'un seul fichier, rien à installer et aucun compte à créer : tout reste sur votre ordinateur.

## Démarrer

Double-cliquez sur **`NaoLang.html`**. L'application s'ouvre dans votre navigateur (Chrome ou Edge conseillés).

| Fichier | Rôle |
|---|---|
| `NaoLang.html` | L'application. C'est le seul fichier à ouvrir. |
| `README.md` | Ce guide. |

On peut aussi l'ouvrir depuis la page d'accueil de la maison : `../NaoGroup.html` → **Ouvrir NaoLang**.
Pour revenir à NaoGroup, cliquez sur le **logo NaoLang**, en haut à gauche.

## Les langues

Six langues, disponibles dans les deux sens :
**français, anglais, espagnol, allemand, créole martiniquais, créole guadeloupéen.**

- **Plusieurs langues maternelles.** Cochez toutes celles que vous parlez. La première sert aux
  traductions ; les autres s'affichent en complément sous chaque mot et dans les corrections.
  Le menu de gauche (« Traductions depuis ») permet d'en changer à tout moment.
- **Plusieurs langues apprises.** Chaque langue a son propre parcours : niveau, progression, notes,
  révisions et attestations. Les boutons **EN · ES · FR…** du menu font passer de l'une à l'autre ;
  le **＋** mène aux réglages pour en ajouter une.
- Une langue peut être à la fois maternelle et apprise (par exemple pour perfectionner son français) :
  les traductions viennent alors d'une autre langue maternelle.
- **Créoles** : la graphie est proche du GEREC, et les usages varient d'une commune à l'autre. Il n'existe
  pas encore de voix de synthèse créole : l'écoute utilise une voix française approchante.

## Les profils

Chaque personne de la maison peut avoir **son propre profil** : ses langues, sa progression, ses notes,
ses attestations, son journal et ses cartes. Aucune donnée n'est partagée entre deux profils.

- Le bouton **👤 prénom** en haut à droite ouvre la fenêtre **Les profils** : ouvrir un autre profil,
  en créer un nouveau (**＋ Nouveau profil**), sauvegarder ou supprimer un profil.
- Un nouveau profil commence par l'accueil : prénom, langues, niveau estimé, objectif quotidien et thèmes.
- Si NaoLang contenait déjà des données avant l'arrivée des profils, elles deviennent automatiquement
  le premier profil, sans aucune perte.

## Sauvegardes

Tout est enregistré dans le navigateur, **pour cette adresse de fichier**. Si l'on vide les données de
navigation, tout disparaît : gardez une sauvegarde récente.

| Bouton | Ce qu'il fait |
|---|---|
| 💾 (en haut) ou **Ce profil** | Télécharge le profil ouvert : `naolang-<prénom>-<date>.json` |
| 🗄️ **Tous les profils** | Télécharge tous les profils dans un seul fichier : `naolang-tous-les-profils-<date>.json` |
| 📂 **Charger une sauvegarde** | Lit un fichier de sauvegarde, puis vous demande quoi en faire |

Au chargement d'un fichier :
- **Un seul profil** : le mettre à jour s'il existe déjà, l'ajouter comme nouveau profil, ou remplacer
  le profil ouvert.
- **Tous les profils** : les profils déjà présents sont remplacés par leur version sauvegardée, les autres
  sont ajoutés. Les profils qui ne figurent pas dans le fichier ne sont pas touchés.
- Les sauvegardes de l'ancienne version (un seul profil) se chargent aussi.

C'est aussi de cette façon qu'on change d'ordinateur ou qu'on déplace le dossier : on sauvegarde **tous
les profils**, puis on charge le fichier depuis le nouvel emplacement.

## Le parcours

- **Test de niveau** au démarrage (facultatif) : les questions s'adaptent à vos réponses.
- **Six niveaux** : A1 débutant, A2 élémentaire, B1 intermédiaire, B2 intermédiaire avancé,
  C1 avancé, C2 maîtrise. Chaque niveau compte **2 unités**, chaque unité **2 chapitres**, et
  chaque chapitre **5 leçons** de 3 à 10 minutes :
  📘 Vocabulaire · 🧩 Grammaire · 🎧 Écoute & lecture · 🎙️ Oral & situations · ✍️ Écrit.
- Chaque leçon affiche le niveau, le thème, les objectifs, la durée estimée, les mots à retenir,
  la règle de grammaire travaillée, votre progression et la note obtenue.
- Les étapes s'ouvrent l'une après l'autre. Les niveaux situés sous votre niveau de départ restent libres.

**Exercices** : traduire (choix ou saisie), remettre les mots dans l'ordre, compléter, conjuguer,
trouver l'erreur, associer à une image ou à une situation, paires, écouter et choisir, dictée,
lire à voix haute au micro, rédiger. Le retour est toujours bienveillant.

**Micro** : la reconnaissance vocale fonctionne dans Chrome et Edge, et elle a besoin d'Internet.
Sans micro, une auto-évaluation est proposée. En créole, elle entend du français, ce qui la rend plus sévère.

## Évaluations, notes et attestations

- **Évaluations** de fin de chapitre (seuil 60), de fin d'unité (65) et de passage de niveau (70).
  Toutes les compétences y sont évaluées : vocabulaire, grammaire, compréhension écrite et orale,
  expression écrite et orale.
- Le résultat donne une note sur 100, le détail par compétence, vos réussites, les points à revoir et un
  **plan de révision personnalisé**. En cas d'échec, un **parcours de révision** est préparé avant
  de repasser l'évaluation.
- Chaque note est accompagnée d'une appréciation : *Très bien*, *Bonne progression*, *Presque acquis*
  ou *À revoir tranquillement*.
- **Carnet de notes** : toutes les notes, la moyenne générale, les moyennes par niveau et par compétence,
  la courbe de progression et ce qu'il reste à revoir.
- **Attestation** : quand toutes les unités d'un niveau sont validées et l'évaluation de passage réussie,
  une attestation est générée. Elle porte le prénom, la langue, le niveau, la date, la note et un numéro
  unique. Pour la consulter, l'imprimer (« Enregistrer au format PDF ») ou la télécharger : **📜 Mes attestations**.
  Il s'agit d'une *attestation interne de parcours NaoLang* : ce n'est ni un diplôme officiel,
  ni une certification reconnue par un organisme d'examen.

## Les autres espaces

- **🔁 Révisions** : la liste « À réviser aujourd'hui », la répétition espacée (les mots difficiles
  reviennent plus souvent), les erreurs les plus fréquentes et une leçon de révision adaptée.
- **📖 Lecture** : menus, messages, affiches, e-mails, avis, articles, tribunes et débats. On peut écouter
  le texte, toucher une phrase pour voir sa traduction et garder des mots dans « Mots à revoir ».
- **🎧 NaoStories** : histoires audio avec le texte qui suit la voix, la traduction à la demande et
  la vitesse réglable (lente en A1–A2). Viennent ensuite des questions et un mini-jeu. On peut mettre
  une histoire en favori.
- **🧳 Mode Voyage** : les phrases essentielles, écrites en grand, pour se présenter, aller au restaurant,
  demander son chemin, faire des achats, à l'hôtel et en cas d'urgence.
- **⭐ Mes phrases utiles** : les phrases gardées, les mots à revoir et vos cartes mémoire personnelles.
- **✍️ Journal** : une phrase ou un mot appris chaque jour.
- **🌌 Mes réussites** : la carte céleste (chaque chapitre validé allume une étoile), les badges,
  les défis hebdomadaires, les histoires terminées et les évaluations réussies.
- Thème **sombre ou clair** : l'interrupteur 🌙 / ☀️ en haut à droite. En fond, des lettres accentuées,
  des guillemets et quelques signes d'autres écritures dérivent très lentement, en filigrane.
  Comme toutes les animations de NaoLang, ils s'arrêtent si le système demande de réduire les animations.

## Le logo

Même jeton que toute la famille (carré de 40, rayon 13, dégradé bleu-violet `#5E4BD4` → lavande
`#BBA5F6`) et même N blanc d'un seul tracé, posé dans le bas du jeton. L'accent de NaoLang, en blanc
à 50 %, est un **tilde** : le N devient un **Ñ**. L'accent de l'outil est donc… un accent, le signe qui
fait changer une lettre de langue. Il ondule aussi comme une voix, et reste lisible à 16 px.

## Ce qui reste à faire

- Faire relire les contenus en créole martiniquais et guadeloupéen par des locuteurs natifs,
  en particulier aux niveaux B2 à C2.
- Ajouter l'icône Windows (`naolang.ico`) et le script de raccourci sur le bureau, comme pour les autres outils.
