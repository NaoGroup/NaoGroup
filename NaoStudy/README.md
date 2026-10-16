# NaoStudy

> **NaoStudy — Apprendre, s’organiser, avancer.**
> Emplois du temps, révisions et devoirs de toute la famille.

L’outil d’organisation scolaire de la maison NaoGroup, pour les enfants, adolescents, étudiants et les parents qui
les accompagnent. Un seul fichier, `NaoStudy.html`, à double-cliquer.

NaoStudy est un **outil d’organisation et d’accompagnement** : il ne remplace ni l’enseignant, ni l’établissement,
ni les professionnels de l’orientation ou de la santé. Il ne fait **jamais les devoirs à la place de l’élève** : l’aide
pose des questions et donne des indices, sans la réponse finale.

## Les espaces

| Onglet | Ce qu’on y trouve |
|---|---|
| 🏠 **Accueil** | Sélecteur de profil, grande carte **Ma journée** (cours du jour, devoirs prioritaires, révisions à faire, rappels), boutons « Ajouter un devoir / un contrôle », « Créer une fiche », « Lancer une révision », « Ajouter une note », puis les cartes **Mon emploi du temps**, **Mes devoirs à rendre**, **Mes prochains contrôles**, **Mes révisions du jour**, **Mes notes et objectifs**, **Mes documents récents**, **Mon défi de la semaine** |
| 🗓️ **Emploi du temps** | Cours, options et activités (matière, jour, horaires, salle, enseignant, couleur) ; vues **semaine**, **journée** et **mois** ; **clic sur une case vide** pour ajouter un cours à cet horaire, **glisser** un cours pour le déplacer, **tirer son bord** pour changer sa durée ; durées rapides (55 min, 1 h, 2 h…), plusieurs jours d’un coup, « Dupliquer » ; **semaines A / B** (badge, inversion en un clic, chaque cours « toutes / A / B ») ; les cours qui se chevauchent se rangent côte à côte ; 📌 devoir à rendre et 📝 contrôle signalés sur le créneau |
| 📚 **Devoirs** | Matière, consigne, date de rendu, temps estimé, priorité, documents joints, rappel ; colonnes **À commencer, En cours, Terminé, Rendu, À revoir** ; « M’aider pas à pas » ; copie vers NaoAgenda / NaoDaily |
| 📝 **Contrôles** | Contrôles, interrogations, examens, oraux, dates importantes ; compte à rebours ; **planning de révisions** espacé en un clic |
| 🧠 **Révisions** | Aujourd’hui, planning, **fiches** (résumé, mots-clés, définitions, exemples, image), **flashcards** recto-verso avec **révision progressive** (5 boîtes : les notions difficiles reviennent plus souvent), **quiz**, **objectifs** ; **modèles** : semaine de cours, semaine de révisions, brevet, bac, partiels, concours, oral, devoir maison ; chrono de révision |
| 📁 **Documents** | PDF et photos rangés par matière, année scolaire et chapitre |
| 📊 **Notes** | Notes avec coefficients, **moyenne globale indicative** en grand avec sa tendance sur un mois, **courbe d’évolution** de la moyenne globale (option : les matières en fond), **barres** de moyenne par matière avec le repère de la moyenne globale, filtres **trimestre / semestre / année**, courbe détaillée par matière (avec l’avertissement : le bulletin fait foi), carnet de bord (réussites, difficultés, objectifs) |
| 💡 **Besoin d’aide** | Méthodes (comprendre une consigne, apprendre une leçon, faire une fiche, préparer un oral, organiser ses révisions, gérer le stress) et **aide aux devoirs pas à pas** (questions, indices progressifs, récapitulatif des réflexions de l’élève) |
| 🧭 **Orientation** | Métiers, formations, stages, dates de candidature, CV, lettre de motivation, projets, notes |
| 🏅 **Récompenses** | Série de jours, 15 badges, défi de la semaine, encouragements bienveillants |
| ❓ **Comment ça marche** | Le mode d’emploi écrit pour les jeunes, en 10 étapes (profil, emploi du temps, devoirs, contrôles, révisions, notes, aide, badges, parents, données) avec astuces et « Y aller → », et des questions fréquentes ; accessible aussi par le bouton ❓ et depuis l’écran d’accueil |

**👪 Vue parent** : les échéances de chaque enfant (matière, date, statut), les contrôles, la régularité — sans les
consignes, fiches, carnet de bord ni orientation. La moyenne n’apparaît que si le profil l’autorise.
**Code parent** facultatif (4 à 8 chiffres, empreinte SHA-256 salée) : il protège la vue parent, la création/suppression
de profils, le rechargement d’une sauvegarde et la réinitialisation. C’est un rideau de confidentialité, pas un chiffrement.

Aussi : **Mode clair / Mode sombre** (mémorisé), **A+**, 🕊️ pour mettre les animations en pause, 💾 / 📂 pour sauvegarder
et recharger (avec ou sans les documents), **♻️ Réinitialiser** (taper EFFACER). En fond, le ciel étoilé de la maison
et de petites choses de l’école : des livres dont une page tourne, des crayons qui écrivent, des toques qui flottent
ou s’envolent, des ampoules d’idées qui s’allument, des règles et équerres, des lettres et chiffres qui montent.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé violet profond `#4B34C8` → bleu-violet `#7A7CF0` → lavande
`#CDB4F8`, le N blanc d’un seul tracé, et l’accent : **un livre ouvert** (une page blanche, l’autre à demi transparente,
reliure lavande) d’où s’élève **une petite étoile de connaissance**, dans une lueur lavande. `generer-icone.ps1` refait
`naostudy.ico`, `creer-raccourci-bureau.ps1` pose le raccourci.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoStudy.html` est **généré** :

```
powershell -File build.ps1
```

- `src/index.html`, `src/naostudy.css` — la page et la charte (thèmes clair et sombre)
- `src/ns-core.js` — état, dates, catalogues, profils, moyennes, séries, fichiers joints (IndexedDB), fenêtre, code parent
- `src/ns-vues.js` — les écrans, méthodes et aides pas à pas, badges et défis, vue parent
- `src/ns-app.js` — formulaires, révision progressive, quiz, plannings et modèles, sauvegarde, réinitialisation, décor, exemple

Données : `localStorage['naostudy.donnees']` (synchronisé par `naogroup-cloud.js`, identifiant d’outil `naostudy`,
inscrit au catalogue et à la formule Particulier). Les documents joints sont dans la base IndexedDB `naostudy-fichiers`
de ce navigateur : ils ne partent pas dans le cloud. NaoStudy n’écrit jamais dans un autre outil : « Vers NaoAgenda /
NaoDaily » copie le texte, que l’on colle soi-même.
