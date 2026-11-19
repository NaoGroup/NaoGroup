# NaoDaily

> **NaoDaily — Le quotidien, simplement organisé.**

L'organisateur central du quotidien de la maison NaoGroup. Une seule application pour ne plus rien garder en tête :
les listes utiles, les menus et les courses, les cadeaux et les occasions importantes.
Un seul fichier, `NaoDaily.html`, à double-cliquer. Aucun compte, aucun abonnement : tout reste sur l'ordinateur.

## Les espaces

| Onglet | Ce qu'on y trouve |
|---|---|
| ☀️ **Aujourd'hui** | « Ma journée » (date, phrase douce, résumé, cercle des tâches cochées), gros boutons d'action rapide, **Mes tâches prioritaires**, **Le repas du jour**, **Ma liste de courses**, **Prochaines occasions** et cadeaux en cours, **À ne pas oublier**, raccourcis (listes favorites, produits habituels, recettes favorites) |
| 📝 **Mes listes** | Listes libres ou 17 modèles (tâches du jour, courses, ménage, valise, voyage, déménagement, rentrée, projet, achats, documents, films & séries, livres, jeux, idées, souhaits, objectifs). Éléments avec note, quantité, priorité, date et rappel ; progression en %, favoris, duplication, archives, recherche, listes partagées (couple, famille, colocation) |
| 🍽️ **Menus & courses** | Planning semaine ou mois (petit-déjeuner, déjeuner, dîner, collation, nombre de personnes), recettes (ingrédients, étapes, temps, 8 catégories), **liste de courses générée depuis le menu** et ajustée au nombre de personnes, rangement automatique par rayon, produits habituels, budget estimé (indicatif), impression / export / partage, « À consommer bientôt » et idées anti-gaspillage |
| 📖 **Page recette** | Préparation, cuisson, repos, durée totale, difficulté, portions ajustables (−/+), ingrédients à cocher (« j'ai déjà »), ustensiles, « ajouter ce qui manque aux courses », étapes à cocher avec **minuteurs**, astuces, impression |
| 📊 **Nutrition** | Tableau de ~115 aliments courants (énergie, protéines, glucides, sucres, lipides, fibres, sel), pour 100 g ou par portion, avec recherche, tri par colonne et catégories ; sur chaque recette, valeurs estimées par portion et % des repères journaliers. Valeurs moyennes indicatives dans l'esprit de la table Ciqual (ANSES) |
| 🛡️ **Allergies** | Par personne, un niveau par allergène (14 allergènes + aliments libres) : 🟡 tolérée en petite quantité, 🟠 intolérance, 🔴 allergie, 🚨 allergie sévère. Pastilles sur recettes, repas, idées et courses ; version adaptée d'une recette ; remplacements automatiques dans les courses ; blocage avec vérification pour une allergie sévère. Repérage par le nom des ingrédients : une aide, jamais une garantie |
| 🎁 **Cadeaux & occasions** | Fiches des proches (anniversaire, goûts, centres d'intérêt, tailles, couleurs, notes), suivi des idées de *Idée* à *Offert*, occasions et rappels (un mois, deux semaines, une semaine, trois jours, la veille), budget du mois et de l'année, historique avec **alerte doublon**, **listes d'envies** (une par occasion ou par personne — Noël, un anniversaire, son enfant… — chacune avec sa couleur et son compte à rebours ; envies en vitrine avec photo ou image collée, prix, lien, ♥ coups de cœur, « offert », filtres et tri ; **📤 Envoyer à mes proches** : une page web autonome — photos, prix, liens, coups de cœur — qui s'ouvre sur tout téléphone sans NaoDaily, ou par e-mail, WhatsApp, texte, fichier `.naodaily`), « Mots pour la carte », **cadeau commun** (parts et qui a payé) |
| ⭐ **Favoris** | Listes favorites, recettes favorites, produits habituels, listes partagées |

## Ce qui relie les espaces

- Planifier un repas propose d'**ajouter ses ingrédients à la liste de courses** ; « 🛒 Générer les courses » le fait pour toute la semaine.
- Une idée cadeau passe dans la liste **« À acheter »** ; la cocher marque le cadeau comme acheté (et inversement).
- Tâche ou article → **⏰ rappel**, qui apparaît dans « À ne pas oublier ».
- Anniversaires, fêtes, cadeaux en attente et produits « à consommer bientôt » remontent sur **Aujourd'hui**.
- **Partager** une liste, les courses, le menu ou ses envies : un texte à coller dans un message, ou un fichier `.naodaily`
  que le proche ouvre avec 📂 dans son propre NaoDaily. Rien ne passe par internet.

Thème clair / sombre (☾ ☀), **A+** pour agrandir le texte, 🕊️ pour mettre les animations en pause,
💾 / 📂 pour sauvegarder et recharger, ♻️ pour réinitialiser l'outil. En fond, de petites listes se cochent toutes seules.

## L'aide « ❓ Comment ça marche »

Le bouton rond **❓** de l'en-tête (ou **F1**, ou **?** hors d'un champ) ouvre le mode d'emploi ; **Échap** le ferme.
Sommaire à gauche (au-dessus sur téléphone), fiche à droite, et une recherche qui ne garde que les sujets contenant
les mots tapés (sans tenir compte des accents). Un lien « ❓ Comment ça marche » figure aussi sur la page Aujourd'hui
tant que l'outil est vide. 21 fiches : premiers pas, la page Aujourd'hui, mes listes, tâches et rappels, planning des
repas, idées repas et saisons, recettes, liste de courses, anti-gaspillage, nutrition, allergies, idées cadeaux et suivi,
proches et occasions, budget / historique / mots pour la carte, listes d'envies, favoris, partager avec un proche,
sauvegarde / synchronisation / export, réinitialiser l'outil, réglages et raccourcis, questions fréquentes et astuces.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé turquoise → violet → lilas rosé (`#17C9C0 → #7A4FF0 → #E99BFF`, comme « Notre histoire »), le N blanc d'un seul
tracé, et l'accent : **trois points bien rangés** (les trois espaces) et **un cercle de planning** parcouru aux trois
quarts (la journée qui avance), avec une lueur blanche. `generer-icone.ps1` refait `naodaily.ico`,
`creer-raccourci-bureau.ps1` pose le raccourci sur le bureau.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoDaily.html` est **généré** :

```
powershell -File build.ps1
```

- `src/index.html`, `src/naodaily.css` — la page et la charte (thèmes clair et sombre)
- `src/nd-core.js` — état, dates, rayons automatiques, fenêtre-formulaire, calculs partagés
- `src/nd-vues.js` — les écrans
- `src/nd-nutrition.js` — table nutritionnelle et estimation des recettes
- `src/nd-recettes.js` — page recette, allergies, minuteurs
- `src/nd-app.js` — actions, liens entre espaces, partage, impression, exemple, décor animé
- `src/nd-aide.js` — l'aide « ❓ Comment ça marche » (fiches, sommaire, recherche, touche F1)

Données : `localStorage['naodaily.donnees']`, synchronisées par `naogroup-cloud.js` (identifiant d'outil `naodaily`,
inscrit au catalogue ; à ajouter aux formules voulues dans `admin.html`).
