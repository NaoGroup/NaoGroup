# NaoHome — Toute la maison, chacun à sa place.

L'outil NaoGroup de la maison : le logement, le carnet de famille, la piscine,
les sports, les copains des enfants, l'annuaire des assurances et le ménage
pièce par pièce — au même endroit.

## Ouvrir l'outil

Double-cliquer sur **`NaoHome.html`** : tout tient dans ce seul fichier, rien à
installer. Pour une vraie fenêtre d'application avec son icône sur le bureau :
clic droit sur `creer-raccourci-bureau.ps1` → « Exécuter avec PowerShell ».

Au tout premier lancement, un seul choix : **dans quoi vivez-vous ?** Une maison
(puis : avec ou sans piscine ?) ou un appartement. **✨ Découvrir avec une famille
d'exemple** charge les Martin, une famille entièrement inventée ; un bouton
l'efface pour commencer avec son propre foyer.

## Ce que fait NaoHome

| Espace | Contenu |
| --- | --- |
| 🏠 Accueil | La maison d'un coup d'œil : le logement dessiné, le carnet (avatars, anniversaires à venir), le ménage du jour et de la semaine à cocher, la piscine (dernier pH / chlore, prochaine mesure, entretien en retard), les sports en cours, les numéros utiles et les personnes de confiance |
| 📖 Carnet de famille | Le « livret » du foyer : une fiche par adulte, enfant et animal, avec photo. Adulte : nom, prénom, naissance, place dans le foyer, entreprise, poste, date d'entrée, matricule, numéro et e-mail pros, téléphone, e-mail, n° de sécurité sociale. Enfant : les études à la place du travail (établissement, classe, professeur principal, numéro et adresse de l'école). Animal : espèce, race, naissance, puce, vétérinaire. Une ou deux **personnes de confiance**. Case **🩺 Rattacher à NaoSanté** (personnes) et **🐾 Rattacher à NaoPets** (animaux) |
| 🏊 Piscine | Seulement si le logement en a une. **Entretien** (feuilles / débris / insectes, frotter les parois, ligne d'eau, renouveler 1/3 de l'eau chaque année — avec le volume en m³), **pH et chlore** mesurés 2 fois par semaine (repères 7,2–7,4 et 1,5–2 mg/L, règle colorée vert / orange / rouge, courbes, tableau des mesures, conseil simple), **filtration** = température de l'eau ÷ 2 heures par jour (30 °C → 15 h) avec des conseils |
| 🧹 Ménage | La maison (ou l'immeuble) dessinée avec ses pièces ; chaque pièce a sa petite liste de tâches (chaque jour / semaine / mois), le nom de qui la fait, des idées de tâches par type de pièce, et « Qui fait quoi » |
| 🏅 Sports | Pour chaque adulte et enfant : sport, club, adresse, n° de licence, horaires, années, avec ou sans compétition, niveau acquis, médailles 🥇🥈🥉 ; « Toute une vie » : la frise des sports pratiqués |
| 🎒 Copains | Pour chaque enfant : le petit annuaire des parents des copains de classe (classe, parents, téléphones, e-mail, adresse, note) |
| 📇 Annuaire | Assurance scolaire, mutuelle, sécurité sociale, voiture, habitation, accidents de la vie, prévoyance, animaux, banque… (nom, n° de contrat, téléphone, e-mail, site, adresse, pour qui) et les numéros de sécurité sociale du carnet |

**❓ Comment ça marche** (ou F1) explique tout, avec une recherche par mot.
**↺ Réinitialiser** rend l'outil vierge, comme pour un nouvel utilisateur (avec
proposition de sauvegarder d'abord). Thème **sombre** (par défaut) ou **clair**.

Les numéros sensibles (sécurité sociale, contrats, matricules, licences, puces)
sont masqués à l'écran (« ••• 123 ») ; 👁️ les montre 30 secondes.

## NaoSanté

Les membres rattachés à NaoSanté sont rangés à part, dans la clé
`naohome.foyer` (même espace de profil) : prénom, nom, date de naissance, sexe,
n° de sécurité sociale, place dans le foyer et sports. Rien d'autre (travail,
école, contrats) n'y est mis. NaoSanté lit cette clé : le n° de sécu changé dans
NaoHome est mis à jour dans la fiche médicale de la personne.

## NaoPets

Les animaux rattachés à NaoPets sont rangés à part, dans la clé
`naohome.animaux` (même espace de profil) : nom, espèce, race, date de
naissance, puce, vétérinaire et photo (sans la photo si le navigateur est plein).
NaoPets lit cette clé à l'ouverture et quand on revient sur son onglet : il crée
l'animal (ou relie celui de même nom), ajoute le vétérinaire à ses contacts, puis
reprend les changements faits ensuite dans NaoHome.

## Données

Tout reste dans le navigateur de cet ordinateur (`localStorage`, clé
`naohome.v1`). **💾 Sauvegarder** (ou Ctrl + S) télécharge un fichier JSON ;
**📂 Ouvrir une sauvegarde** le recharge. Dans NaoGroup, `naogroup-cloud.js`
(outil `naohome`) donne à chaque profil son propre espace et la synchronisation.

## Sources et assemblage

`src/` contient `index.html`, `naohome.css`, `nh-core.js` (données, repères de
la piscine, fenêtres), `nh-vues.js` (les pages), `nh-app.js` (saisies, exemple,
sauvegarde, écran d'ouverture) et `nh-aide.js` (Comment ça marche). Après une
modification : `powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1`
reconstruit `NaoHome.html`.

## Le logo

Le jeton de la famille (carré de 40, rayon 13) aux couleurs de « Notre histoire »
— turquoise `#17C9C0` → violet `#7A4FF0` → lilas rosé `#E99BFF` —, le N blanc d'un
seul tracé, et au-dessus **une petite maison** en blanc plein (toit, cheminée,
deux fenêtres et une porte lavande) avec **un éclat**. Symbole `l-ho` dans
`../naogroup-logos.js` et sur `../NaoGroup.html` ; `generer-icone.ps1` refait
`naohome.ico`.
