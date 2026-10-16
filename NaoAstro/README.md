# NaoAstro

> **NaoAstro — Regardez votre quotidien autrement.**

L'espace personnel de découverte astrologique de **NaoGroup** : son thème de naissance, son horoscope,
une carte du jour, les compatibilités et un journal astral.
Aucune installation, aucun calcul distant : tout se fait sur votre ordinateur, et vos données y restent.

> L'outil lui-même tient dans `NaoAstro.html`. Il charge en plus, depuis le dossier NaoGroup, les deux
> scripts communs à la maison : `naogroup-cloud.js` (comptes NaoGroup) et `naogroup-local-auth.js`
> (accès de test, temporaire). Pour ouvrir NaoAstro seul, sur une clé par exemple, il suffit de
> retirer ces deux lignes `<script src="../…">` en haut du fichier.

L'astrologie y est présentée comme **un outil de découverte, de divertissement et d'introspection**.
Les interprétations sont toujours formulées au conditionnel : ce sont des pistes de réflexion,
jamais des vérités certaines, et jamais des conseils médicaux, financiers, juridiques ou professionnels.

## Démarrer

Double-cliquez sur **`NaoAstro.html`**. Pour l'avoir sur le bureau, dans sa propre fenêtre
(sans barre d'adresse) : clic droit sur `creer-raccourci-bureau.ps1` → « Exécuter avec PowerShell ».

| Fichier | Rôle |
|---|---|
| `NaoAstro.html` | L'outil. C'est le seul fichier à ouvrir. |
| `naoastro.ico` | L'icône du raccourci Windows. |
| `generer-icone.ps1` | Recrée `naoastro.ico` à partir des tracés du logo. |
| `creer-raccourci-bureau.ps1` | Pose le raccourci **NaoAstro** sur le bureau. |

## L'entrée

À l'ouverture, comme dans NaoDoc, une petite scène se joue (environ 3 secondes) : les étoiles
s'allument **en vague, du centre vers les bords**, les sommets de la constellation s'éclairent au fur
et à mesure que le trait les relie, le **N de la famille se trace comme une constellation**, un halo
accompagne le croissant de lune, deux étoiles filantes traversent, puis le jeton se matérialise dans
une onde lumineuse avec le nom (qui se resserre en place) et le slogan.
Un **clic passe l'animation** ; elle ne se joue pas du tout si les animations sont calmées
(⚙️ Réglages) ou si le système demande de les réduire.

Au premier lancement, NaoAstro affiche le ciel du moment. Cliquez sur **✨ Créer mon profil astral**
(ou 👤 en haut) : prénom, nom, date, heure, pays et ville de naissance.

## Les trois pages

L'en-tête propose **✨ Mon ciel**, **🃏 Tirage** et **🎲 Jeux**.

## 1. Mon ciel (l'accueil)

1. **En-tête** : le logo et le slogan — **un clic sur le logo ramène à NaoGroup** — puis le thème
   clair / sombre, 👤 profil, 💾 sauvegarder, 📂 charger, ⚙️ réglages.
2. **Mon ciel aujourd'hui** : la phase de la Lune dessinée en direct, le signe qu'elle traverse,
   le Soleil, la prochaine pleine lune, et le secteur de votre ciel que la Lune éclaire aujourd'hui.
3. **Mes trois lumières** : signe solaire, ascendant et signe lunaire, avec leurs mots-clés.
   → **📖 Lire mon profil détaillé** : portrait, équilibre des éléments, modes, et les neuf astres
   (Soleil, Lune, Mercure, Vénus, Mars, Jupiter, Saturne, Uranus, Neptune) avec leur maison.
4. **Ma carte du ciel** : la roue du thème natal (maisons égales depuis l'ascendant, aspects tracés),
   ou le **ciel du moment**. À l'affichage, les douze signes s'allument l'un après l'autre à partir de
   l'ascendant, les astres se posent, puis les aspects se tracent. **Survolez un astre** : sa position
   s'affiche, et les liens qui le concernent ressortent pendant que les autres s'estompent. Le volet
   **🧭 Comment lire cette carte ?** explique en quelques lignes l'anneau des signes, les jetons des
   astres, les maisons numérotées, l'AC, le MC et les traits d'aspect : on peut s'y retrouver sans
   rien connaître à l'astrologie.
5. **Mon horoscope** : **jour**, **semaine** ou **mois**, à lire pour son Soleil ou son ascendant.
   Chaque jour, deux blocs s'ajoutent au texte : **🌗 Votre météo intérieure** — le climat émotionnel
   du moment, lu dans l'élément du signe que traverse la Lune, dans sa phase et dans l'angle qu'elle
   forme avec la Lune et le Soleil de votre naissance (retour lunaire, tension passagère…), suivi de
   ce qui vient (« Demain, la Lune entre en Gémeaux : le climat devrait devenir plus léger… ») —
   et **🔭 Ce qui pourrait se présenter**, deux possibilités concrètes liées au secteur éclairé,
   présentées comme des pistes à regarder d'un œil léger, jamais comme des annonces.
   Il s'appuie sur le vrai ciel : le signe de la Lune, les lunaisons, Vénus, Mars, Mercure rétrograde.
   🖼️ **Partager en image** ou 📋 **copier le texte**.
6. **Mon ciel personnel** : la lecture la plus personnalisée de l'outil. Elle ne part plus de votre
   signe mais de **votre thème de naissance** : les angles (les « transits ») que les astres
   d'aujourd'hui forment avec votre Soleil, votre Lune, votre Mercure, votre Vénus, votre Mars et
   votre ascendant. Deux personnes du même signe n'y lisent donc pas la même chose.
   En **Jour**, **Semaine** ou **Mois**, quatre volets : **💗 Émotions**, **⚡ Élan et actions**,
   **🤝 Rencontres et situations** et **🌱 Ce qui vient** (les prochains rendez-vous du ciel, avec
   leur date). En semaine et en mois s'ajoute la toile de fond : les secteurs de votre thème que
   traversent Jupiter et Saturne. Quand aucun angle n'est actif, c'est le secteur traversé qui prend
   le relais, pour que la lecture ne soit jamais vide.

   > Le tirage de carte a quitté l'accueil : il a sa propre page **🃏 Tirage**, et l'horoscope profite
   > de toute la largeur.
7. **Compatibilités** : ajoutez des proches (amour, amitié, famille), puis **💞 Comparer deux profils** :
   la rencontre des éléments, cinq indicateurs doux (communication, émotions, spontanéité, confiance,
   projets communs), les liens marquants entre vos deux ciels et quelques pistes prudentes.
8. **Mon journal astral** : les tirages, les pensées (✍️ Écrire une pensée, avec une humeur) et les
   comparaisons gardées. Filtres, modification, suppression avec « Annuler ».

## 2. Tirage — le rituel, en grand

Une page immersive, dans un ciel profond dessiné en direct (étoiles qui dérivent, nébuleuses lentes) :

1. **Un instant rien que pour vous** : on peut commencer par **trois respirations guidées**
   (un cercle s'ouvre et se referme) ou aller directement au tirage.
2. **Le mélange** : les cartes se brassent, le dos miroite doucement.
3. **Le choix** : cinq cartes se distribuent une à une en éventail — vous prenez celle qui vous attire ;
   les autres s'effacent vers le bas.
4. **La révélation** : une lueur monte autour de la carte, elle se retourne en basculant légèrement
   dans une pluie d'étincelles, puis le message, la question et le petit geste apparaissent en douceur.

Un tirage par jour. Ensuite, la page montre votre carte du jour, avec **↻ Revivre le rituel**,
📝 une note et 🖼️ le partage en image. Si les animations sont calmées (⚙️ Réglages) ou si le système
demande de les réduire, le rituel va droit au but, sans animation.

L'**Oracle céleste** compte **33 cartes originales**, chacune avec un mot-clé, un message doux,
une question et un petit geste.

## 3. Jeux

- **🔮 Quiz du ciel** : 10 questions tirées au hasard parmi 35, avec une explication bienveillante
  après chaque réponse, un score en étoiles et votre meilleur résultat conservé.
- **🔤 Mots mêlés cosmiques** : une grille de 12 × 12 tirée au hasard, 10 mots du ciel à retrouver
  en glissant d'une lettre à l'autre — dans tous les sens, diagonales et à l'envers comprises.
  Chronomètre doux et record du meilleur temps.
- **🃏 Memory des constellations** : 8 paires de cartes de l'Oracle à retrouver, avec le nombre de
  coups, le temps, et le record du plus petit nombre de coups.

## Les calculs

- **Positions** : formules de Jean Meeus (Soleil, Lune) et éléments orbitaux approchés du JPL
  (planètes, valables de 1800 à 2050). Précision de l'ordre du dixième de degré pour le Soleil
  et la Lune, du degré pour les planètes. La date de naissance est acceptée de 1900 à 2049.
- **Heure et fuseau** : l'heure locale est convertie en temps universel avec l'historique des fuseaux
  du navigateur (heure d'été et changements passés compris).
- **Villes** : **toutes les communes françaises de 2 000 habitants et plus** (5 614 avec l'outre-mer
  au complet), plus les grandes villes de 52 autres pays. Les coordonnées viennent des données
  ouvertes de l'État (API Découpage administratif, data.gouv.fr), intégrées une fois pour toutes
  dans le fichier : l'outil ne se connecte à rien.
  La recherche ignore les accents et la casse, comprend « St- » pour « Saint- » (`St-Ouen-l'Aumône`),
  le début d'un nom (`Boulogne-Bil`) et le numéro de département (`Ermont 95`). Les noms de communes
  qui existent en double portent leur département : `Saint-Denis (93)`, `Saint-Denis (974)`.
  Le formulaire affiche 📍 la commune retenue, pour lever tout doute.
- **Commune absente** (moins de 2 000 habitants) : choisissez son **département** dans la liste qui
  apparaît. L'outil prend alors la plus grande commune du département comme repère, et l'indique
  (« lieu approché : Argenteuil, Val-d'Oise »). L'écart sur l'ascendant se compte en minutes.
  Pour une précision au mètre, saisissez la latitude et la longitude. « Autre pays » demande aussi
  le décalage horaire de la naissance.
- **Heure inconnue** : pas d'ascendant ni de maisons ; la Lune est calculée vers midi, et NaoAstro
  signale si elle changeait de signe ce jour-là.
- **Horoscope** : maisons solaires (le ciel du moment lu depuis votre signe), avec un hasard
  reproductible : le même jour donne le même texte.

## Mon profil : sauvegarder, recharger, repartir de zéro

Dans **⚙️ Réglages → Mon profil**, dans la fiche 📖 **Mon profil astrologique** ou dans le formulaire :

- **💾 Sauvegarder mon profil** : un petit fichier `naoastro-profil-prenom.json`, rien que vos
  données de naissance. Pratique pour le garder de côté ou le passer sur un autre ordinateur.
- **🗑️ Supprimer mon profil** : après confirmation, le thème, l'ascendant et les horoscopes
  personnalisés sont effacés et NaoAstro repart de zéro. **Vos tirages, vos pensées et vos proches
  sont conservés.** Un bouton **Annuler** reste affiché quelques secondes en cas de regret.
- **📂 Charger** accepte aussi bien un fichier de profil seul (il remplace alors uniquement le
  profil) qu'une sauvegarde complète.

## Réinitialiser l'outil

**⚙️ Réglages → Repartir de zéro → 🧹 Réinitialiser NaoAstro** remet l'outil exactement dans l'état
du premier lancement, comme pour une nouvelle personne :

- le profil et les personnes ajoutées,
- le journal : tirages, pensées, compatibilités,
- les scores et records des jeux,
- le thème et les réglages d'affichage (retour au thème sombre, animations réactivées).

Une fenêtre récapitule ce qui va être effacé et propose **💾 Sauvegarder d'abord**. Après coup, un
message **Annuler** reste affiché une quinzaine de secondes pour tout rétablir en cas de regret.
Passé ce délai, seule une sauvegarde `.json` permet de revenir en arrière.

## Sauvegardes

Le profil, les proches, le journal et les scores des jeux sont enregistrés par le navigateur,
**pour cette adresse de fichier**.

1. **💾 Sauvegarder tout** régulièrement : un fichier `.json` qui se recharge avec **📂 Charger**.
   C'est aussi comme ça qu'on passe NaoAstro sur un autre ordinateur, ou après avoir déplacé le dossier.
2. Vider les données de navigation du navigateur efface NaoAstro : gardez une sauvegarde récente.

## Le logo

Même jeton que toute la famille (carré de 40, rayon 13) et même N blanc d'un seul tracé
(`stroke-width 4.2`). Le dégradé va du **bleu nuit** `#1E2266` en haut au **violet profond** `#5A3FC6`
puis à la **lavande** `#B89CF3` : un ciel nocturne qui s'éclaircit vers l'horizon. Le N est posé en bas,
et au-dessus de lui l'accent de NaoAstro : **un croissant de lune** avec une lueur douce et **trois
étoiles fines**. Le signe reste lisible à 16 px.

## Animations

Étoiles qui scintillent, étoiles filantes de temps en temps, une grande lune qui se balance (elle
montre la phase du jour), un soleil qui tourne lentement (plus présent en thème clair), de petites
lunes et de petits soleils qui dérivent. Sur la page **Tirage**, le ciel est dessiné en direct :
étoiles qui descendent doucement, nébuleuses qui respirent, étincelles à la révélation de la carte.

**⚙️ Réglages → Calmer les animations** arrête tout ; elles sont aussi coupées si le système demande
de réduire les animations, et le rituel se déroule alors sans attente.
