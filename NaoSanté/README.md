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
| 💧 **Hydratation** | Goutte qui se remplit, verres à toucher, objectif et taille du verre personnalisés, série de jours à l'objectif, 7 derniers jours |
| 🌙 **Sommeil** | Heures de coucher et de réveil, objectif d'heures et heure de coucher visée, moyenne, régularité, 14 dernières nuits, carnet |
| 🏃 **Activité & souplesse** | Marche, gymnastique, musculation, course, vélo, yoga, étirements, danse, natation ; semaine en minutes ; **routine souplesse** guidée avec minuteur, modifiable |
| ✅ **Habitudes & défis** | Habitudes quotidiennes à cocher, séries de jours consécutifs, 7 derniers jours corrigeables, suggestions, mini-défis doux |
| 📅 **Rendez-vous & rappels** | Rendez-vous médicaux, dentaires, optiques, de suivi… ; rappels (renouveler une ordonnance, prendre rendez-vous, faire un contrôle) |
| 😊 **Humeur & énergie** | Énergie (faible → très bonne), humeur, ressenti du jour, journal des 14 derniers jours |
| 🎯 **Objectifs** | Mieux dormir, améliorer sa souplesse, bouger davantage, boire plus d'eau, ou objectif personnel à étapes. La progression se calcule toute seule |
| 📈 **Progression** | Semaine ou mois : moyennes, graphiques eau / sommeil / activité / habitudes, calendrier des habitudes |
| 🔒 **Notes & mémo** | Notes privées **désactivées par défaut** (groupe sanguin, allergies, traitements, contacts d'urgence), floutées à l'ouverture ; mémo médicaments & vitamines à cocher, sans aucun conseil |

Thème clair / sombre (☾ ☀), **A+** pour agrandir le texte, 🕊️ pour mettre les animations en pause, ⚙️ pour les objectifs,
💾 / 📂 pour sauvegarder et recharger. En fond : des gélules, des plaquettes, des gouttes qui se remplissent, des cœurs qui
battent, des croix douces, des feuilles, et de temps en temps une ligne de pulsation qui traverse le ciel.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé violet profond → lavande → bleu clair (`#4B36C6 → #9A84EE → #A9D6F6`),
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
- `src/ns-app.js` — actions, routine guidée, sauvegarde, décor animé

Données : `localStorage['naosante.donnees']`, synchronisées par `naogroup-cloud.js` (identifiant d'outil `naosante`,
inscrit au catalogue ; à ajouter aux formules voulues dans `admin.html`).
