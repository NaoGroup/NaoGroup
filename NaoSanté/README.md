# NaoSanté

> **NaoSanté — Prenez soin de votre rythme.**

L'outil bien-être de la maison NaoGroup : un compagnon personnel, doux et pratique pour suivre son hydratation,
son sommeil, son activité, ses habitudes, ses rendez-vous de santé et ses rappels importants.
Un seul fichier, `NaoSante.html`, à double-cliquer. Aucun compte, aucun abonnement : tout reste sur l'ordinateur.

**NaoSanté n'est pas un outil médical.** Il ne pose aucun diagnostic, ne propose aucun traitement, ne promet aucun
résultat et ne remplace jamais un professionnel de santé. Il sert à s'organiser, à se suivre et à prendre de bonnes habitudes.

## Les espaces

| Onglet | Ce qu'on y trouve |
|---|---|
| 🌿 **Aujourd'hui** | En-tête et slogan, phrase d'encouragement, cercle des habitudes du jour, les 4 gros boutons (*Ajouter une habitude*, *Ajouter un rendez-vous*, *Ajouter une activité*, *Boire un verre d'eau*), puis les cartes **Mon énergie du jour**, **Mon hydratation**, **Mes habitudes du jour**, **Mon sommeil**, **Mes rendez-vous à venir**, **Mon activité de la semaine**, **Mon objectif en cours** et le **mini-défi du jour** |
| 🌸 **Bien-être** | Trois parties sur une seule page, avec un sommaire : **💧 Hydratation** — Goutte qui se remplit, verres à toucher, objectif et taille du verre personnalisés, série de jours à l'objectif, 7 derniers jours ; **🌙 Sommeil** — Heures de coucher et de réveil, objectif d'heures et heure de coucher visée, moyenne, régularité, 14 dernières nuits, carnet ; **😊 Humeur & énergie** — Énergie (faible → très bonne), humeur, ressenti du jour, journal des 14 derniers jours (les adresses #hydratation, #sommeil et #humeur mènent à leur partie) |
| 🏃 **Activité & souplesse** | Marche, gymnastique, musculation, course, vélo, yoga, étirements, danse, natation ; semaine en minutes ; **routine souplesse** guidée avec minuteur, modifiable |
| ✅ **Habitudes & défis** | Habitudes quotidiennes à cocher, séries de jours consécutifs, 7 derniers jours corrigeables, suggestions, mini-défis doux |
| 📅 **Rendez-vous & rappels** | Rendez-vous médicaux, dentaires, optiques, de suivi… ; rappels (renouveler une ordonnance, prendre rendez-vous, faire un contrôle) |
| 🎯 **Objectifs** | Mieux dormir, améliorer sa souplesse, bouger davantage, boire plus d'eau, ou objectif personnel à étapes. La progression se calcule toute seule |
| 📈 **Progression** | Semaine ou mois : moyennes, graphiques eau / sommeil / activité / habitudes, calendrier des habitudes |
| 🔒 **Notes & mémo** | Notes privées **désactivées par défaut** (groupe sanguin, allergies, traitements, contacts d'urgence), floutées à l'ouverture ; mémo médicaments & vitamines à cocher, sans aucun conseil |

### 🩺 Santé du foyer

Une seconde ligne d'onglets, pour chaque personne du **foyer de NaoHome** (membres cochés « 🩺 Rattacher à NaoSanté » :
prénom, nom, date de naissance, **sexe** et place sont repris ; « 🙋 Moi » en plus). Les fiches sont les mêmes que celles de Notes & mémo.

| Onglet | Ce qu'on y trouve |
|---|---|
| 💊 **Pilulier** | Pour qui, traitement, dose, prescripteur, date de début, durée (jours / semaines / mois ou au long cours), cases **matin, midi, soir, nuit** à cocher chaque jour (‹ › pour les jours passés), avancée « jour 4 sur 8 », 7 derniers jours en couleur ; en cours / à venir / terminés ; carte du jour sur l'accueil |
| 🩺 **Fiches médicales** | N° de sécu (flouté), CPAM, mutuelle et n° d'adhérent, médecin traitant (répertoire), taille, poids, IMC, groupe sanguin, tabac (cigarettes / jour), allergies et intolérances médicamenteuses, antécédents familiaux / médicaux / chirurgicaux, maladies infantiles à cocher, traitements réguliers (et ceux du pilulier), vaccins du carnet |
| ⚖️ **Poids & IMC** | Mesures (poids, taille, masse grasse, tour de taille) ; IMC et masse grasse sur des jauges colorées selon l'âge et le sexe (OMS chez l'adulte, seuils IOTF de 2 à 18 ans, Gallagher pour la masse grasse, estimation de Deurenberg si elle n'est pas mesurée) ; courbes de poids (bande du poids « normal »), de taille, d'IMC et de masse grasse ; tableau des mesures |
| 📇 **Mes soignants** | Répertoire : médecin traitant, généraliste, pédiatre, dentiste, ophtalmo, dermato, gynéco, radiologie, laboratoire, kiné, ostéo, ORL… et « Autre » ; téléphone, e-mail, adresse, horaires, prise de rendez-vous, personnes suivies ; recherche et filtres |
| 💉 **Vaccins** | « Où en est… ? » en clair (à faire maintenant avec « ✓ C'est fait », prochain vaccin et son mois, vaccins passés non notés, saison grippe & Covid, grossesse) ; tableau à double entrée en couleurs (vaccins × âges, d'après le calendrier simplifié 2026) avec ✓ noté, ! à faire, colonne de l'âge, cases qui ne concernent pas la personne en pâle, et une case touchée = vaccin noté ; carnet de vaccins ; bon à savoir (pas de vaccin contre l'hépatite C) ; détail étape par étape replié |


**👪 Le foyer (depuis NaoHome)** : NaoSanté lit (sans jamais l'écrire) la clé `naohome.foyer`, où NaoHome range les membres
cochés « Rattacher à NaoSanté » (prénom, nom, naissance, sexe, n° de sécu, lien, sports) ; un n° de sécu changé dans NaoHome
remplace celui de la fiche médicale (`secuNaoHome` garde le dernier reçu, pour ne pas écraser une correction faite ici). Ils s'affichent en haut de 🔒 Notes & mémo avec leur âge et
leurs sports ; chacun peut avoir sa fiche (`fiches` dans les données, par identifiant de membre), « 🙋 C'est moi » désigne la personne
qui utilise NaoSanté (`reglages.moi`), et les activités ont un champ « Pour qui ? » (`membre`) — celles d'un proche ne comptent pas
dans vos objectifs. Sans membre rattaché, une phrase explique la case de NaoHome.

Thème clair / sombre (☾ ☀), **A+** pour agrandir le texte, 🕊️ pour mettre les animations en pause, ⚙️ pour les objectifs,
💾 / 📂 pour sauvegarder et recharger, ♻️ pour réinitialiser l'outil. En fond : des gélules, des plaquettes, des gouttes qui se remplissent, des cœurs qui
battent, des croix douces, des feuilles, et de temps en temps une ligne de pulsation qui traverse le ciel.

## ❓ Comment ça marche

Le bouton rond **❓** de l'en-tête (ou la touche **F1**, ou **?** hors d'un champ) ouvre le mode d'emploi, sur le modèle de NaoFi,
NaoBaby et NaoPets : un sommaire à gauche (au-dessus sur téléphone), la fiche à droite et une recherche qui ne garde que les sujets
contenant le mot tapé (sans tenir compte des accents). **Échap** ferme. Un lien « ❓ Comment ça marche » figure aussi sous le slogan de l'accueil.

Les fiches : Bienvenue (ce que NaoSanté ne fait jamais) · Premiers pas · L'accueil · L'hydratation · Le sommeil · L'activité ·
La routine souplesse · Les séances chronométrées (et le minuteur fractionné) · Habitudes et mini-défis · Rendez-vous et rappels ·
Humeur et énergie · Les objectifs · La progression · Notes privées et mémo · Réglages et confort · Sauvegarde et synchronisation ·
Réinitialiser l'outil · Astuces et questions. Le texte est dans `src/ns-aide.js` (tableau `AIDE`) : à tenir à jour quand une fonction change.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé turquoise → violet → lilas rosé (`#17C9C0 → #7A4FF0 → #E99BFF`, comme « Notre histoire »),
le N blanc d'un seul tracé, et l'accent : **une ligne de pulsation** à demi transparente qui court vers **un petit cœur blanc**,
posé dans une lueur douce. `generer-icone.ps1` refait `naosante.ico`, `creer-raccourci-bureau.ps1` pose le raccourci sur le bureau.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoSante.html` est **généré** :

```
powershell -File build.ps1
```

- `src/index.html`, `src/naosante.css` — la page et la charte (thèmes clair et sombre)
- `src/ns-core.js` — état, dates, références (activités, défis, encouragements…), calculs (séries, objectifs), fenêtre-formulaire
- `src/ns-vues.js` — les écrans
- `src/ns-sport.js` — séances chronométrées : séances proposées, éditeur, lecteur guidé avec bips, minuteur fractionné
- `src/ns-app.js` — actions, routine guidée, sauvegarde, réinitialisation, décor animé
- `src/ns-medical.js` — la santé du foyer : pilulier, fiches médicales, poids & IMC (jauges, courbes), répertoire des soignants, vaccination
- `src/ns-aide.js` — l'aide « Comment ça marche » (fiches, recherche, F1)

Données : `localStorage['naosante.donnees']`, synchronisées par `naogroup-cloud.js` (identifiant d'outil `naosante`,
inscrit au catalogue ; à ajouter aux formules voulues dans `admin.html`).
