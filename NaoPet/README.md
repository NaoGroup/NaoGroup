# NaoPets — Leur bien-être, bien organisé.

L'outil NaoGroup pour organiser le quotidien de ses animaux de compagnie : repas,
promenades, soins, rendez-vous, stock, dépenses, vacances et souvenirs — pour tous
les compagnons du foyer, au même endroit.

> **Important.** NaoPets est un outil d'organisation et de suivi personnel. Il
> n'établit aucun diagnostic vétérinaire, ne recommande aucun traitement, ne
> modifie jamais un dosage et ne remplace pas l'avis d'un vétérinaire. Les
> posologies sont recopiées de l'ordonnance, les dates de rappel sont celles du
> carnet ; quand une note évoque une inquiétude, NaoPets invite simplement à
> appeler le vétérinaire.

## Ouvrir l'outil

Double-cliquer sur **`NaoPet.html`** : tout tient dans ce seul fichier, rien à
installer. Pour une vraie fenêtre d'application avec son icône sur le bureau :
clic droit sur `creer-raccourci-bureau.ps1` → « Exécuter avec PowerShell ».

Au premier lancement, **✨ Découvrir avec un exemple** charge Moka (chienne),
Pixel (chat) et Caramel (lapin) pour explorer ; un bouton efface l'exemple pour
commencer avec ses propres animaux.

## Ce que fait NaoPets

| Espace | Contenu |
| --- | --- |
| 🏠 Accueil | Logo et slogan, sélecteur d'animal, alertes douces, 4 grands boutons (animal, rappel, rendez-vous, dépense), cartes « Mes animaux » avec leurs prochaines actions, « À faire aujourd'hui », « Prochains rendez-vous », « Vaccins et rappels à venir », « Stock à renouveler », « Dépenses du mois », « Derniers souvenirs » |
| 🐾 Mes animaux | Fiche complète : photo, prénom, espèce, race, naissance ou âge estimé, sexe, stérilisation, poids, couleur, adoption ; allergies, sensibilités alimentaires, puce, assurance, contacts d'urgence ; repas, rappels, santé récente, budget, anniversaires. Un animal disparu peut rester dans le cœur (fiche et souvenirs gardés, sans rappels) |
| 📅 Calendrier | Tous les rendez-vous, rappels de soins, rappels, anniversaires de naissance et d'adoption, journal et vacances de tous les animaux, sur un mois, avec le détail du jour choisi |
| 🩺 Santé | Rendez-vous (consultation, vaccin, contrôle, stérilisation, toilettage…), carnet de santé (vaccins, vermifuges, antiparasitaires, traitements prescrits, examens) avec dates de renouvellement, courbe de poids |
| 🦴 Quotidien | Tâches du jour à cocher (matin, après-midi, soir), rappels récurrents (jour, jours de la semaine, mois, an, une fois, avec plusieurs heures), repas planifiés, journal (promenade, jeu, toilettage, bain, griffes, apprentissage, garderie) |
| 📦 Stock | Nourriture, friandises, litière, accessoires : jauge, seuil d'alerte, consommation par jour → jours restants, bouton « Racheté », liste de courses |
| 💶 Dépenses | Par catégorie (alimentation, vétérinaire, assurance, accessoires, toilettage, pension, médicaments), budget mensuel et annuel par animal ; une dépense « Tout le foyer » est partagée à parts égales |
| 🧳 Vacances | Destination, dates, mode de garde, consignes, et checklist (carnet de santé, nourriture, laisse, harnais, jouets, médicaments, pension ou garde…) |
| 📸 Souvenirs | Photos, titres, textes, dates importantes et anniversaires d'adoption |
| 📇 Contacts | Vétérinaire, clinique de garde, toiletteur, pension, pet-sitter, contacts d'urgence, éducateur — par animal ou pour tous |

Le **sélecteur « Pour »** en haut de page filtre toutes les pages sur un animal
(ou « Tous »). Thème **sombre** (par défaut) ou **clair** avec l'interrupteur 🌙/☀️.

## Données

Tout reste dans le navigateur de cet ordinateur (`localStorage`, clé
`naopet.v1`). **💾 Sauvegarder** (ou Ctrl + S) télécharge un fichier JSON ;
**📂 Ouvrir une sauvegarde** le recharge. Les photos sont réduites avant d'être
gardées, mais prennent de la place : sauvegardez de temps en temps.

Dans NaoGroup, `naogroup-cloud.js` (outil `naopet`) donne à chaque profil son
propre espace et la synchronisation de ses données.

## Le logo

Le jeton de la famille (carré de 40, rayon 13) en dégradé violet profond
`#5B42CE` → bleu-violet `#7F84F0` → lavande `#C6ACF6`, le N blanc d'un seul
tracé posé bas, et au-dessus **une petite empreinte de patte** (un coussinet et
quatre doigts) sur une lueur lavande. Lisible jusqu'à 16 px. Il est déclaré dans
`../naogroup-logos.js` (symbole `l-pe`, visible dans la charte) et sur la page
`../NaoGroup.html`.

## Le fond

La nuit violette de NaoGroup, sa trame de points et ses halos, un ciel étoilé,
et de petits animaux au trait — chien, chat, cheval, hamster, cochon d'Inde,
lapin, pattes, cœurs et os — qui dérivent lentement en hochant la tête, avec
des traces de pattes qui apparaissent une à une. Tout s'arrête si le système
demande de réduire les animations.

## Développer

Les sources sont dans `src/` :

- `index.html` — la page et le logo SVG
- `naopet.css` — la charte (thèmes clair et sombre)
- `np-core.js` — dates, données, espèces et dessins, rappels récurrents, calculs, fond animé, fenêtres et formulaires
- `np-vues.js` — les pages
- `np-app.js` — navigation, saisies, sauvegarde, exemple et démarrage
- `np-aide.js` — « ❓ Comment ça marche » : le mode d'emploi, avec sommaire et recherche

Après chaque modification : `powershell -File build.ps1` reconstruit
`NaoPet.html`. Si le logo change : `generer-icone.ps1` régénère `naopet.ico`.
