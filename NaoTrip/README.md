# NaoTrip

> **Préparez le départ, profitez du voyage.**

L'organisateur de voyages de la maison NaoGroup : week-end, sortie, vacances en couple, entre amis ou en famille.
Un seul fichier, `NaoTrip.html`, à double-cliquer. Tout reste sur l'ordinateur, et le globe marche sans connexion.

## Ce qu'on y trouve

| Onglet | Rôle |
|---|---|
| 🏠 Accueil | Prochain voyage et compte à rebours, budget, valise, réservations, planning des journées, « À ne pas oublier », carte du monde |
| 🧭 Mes voyages | Créer, modifier, dupliquer, supprimer — destination, dates, pays, voyageurs, monnaie |
| 🗓️ Planning | Jour par jour : activités, réservations et idées programmées |
| 🎫 Réservations | Vols, trains, voitures, hébergements, billets, restaurants + **vue chronologique** (départ, embarquement, check-in, check-out) |
| 🧳 Valise | Liste par catégorie et par voyageur, générateur de liste de base (climat, plage, enfants, avion…) |
| 💶 Budget | Prévisionnel par poste, dépenses, **répartition entre voyageurs** et « qui rembourse qui » |
| ✅ Préparation | Documents importants (identité, passeport, assurance, billets, permis…), tâches à J-x, horaires clés |
| 💡 Idées | Visites, restaurants, activités — à programmer dans le planning |
| 📇 Infos utiles | Adresses, numéros, liens (reprend aussi ceux des réservations) |
| 📸 Carnet souvenir | Pages avec photos, notes, humeur et lieux préférés |
| 🌍 Mon globe | Globe qui tourne (ou carte à plat) : ✓ pays visités, 📍 à venir, ♡ en rêve, statistiques par continent |

Les pays des voyages se placent seuls sur le globe : « à venir » avant le départ, « visités » après.

Thème clair / sombre (☾ ☀), bouton 🕊️ pour mettre les animations en pause, 💾 / 📂 pour sauvegarder et recharger,
🧹 pour réinitialiser l'outil.

## Comment ça marche

Le bouton rond **❓** de l'en-tête (ou la touche **F1**, ou **?**) ouvre le mode d'emploi : sommaire à gauche
(au-dessus sur téléphone), fiche à droite, et un champ de recherche qui ne garde que les sujets contenant le mot tapé.
**Échap** le ferme. Un lien « ❓ Comment ça marche » est aussi sur l'accueil et sur l'écran « Aucun voyage pour l'instant ».

Fiches : Bienvenue · Premiers pas · L'accueil · Mes voyages · Le planning · Les réservations · La valise ·
Le budget et les dépenses · La préparation · Les idées · Les infos utiles · Le carnet souvenir · Mon globe ·
Sauvegarde et synchronisation · Réinitialiser l'outil · Affichage et animations · Astuces · Questions fréquentes.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoTrip.html` est **généré** :

```
powershell -File build.ps1
```

- `src/index.html`, `src/naotrip.css` — la page et la charte
- `src/nt-core.js` — état, dates, argent, fenêtre-formulaire
- `src/nt-monde.js` — pays, statuts, carte à plat et globe (d3-geo)
- `src/nt-vues.js` — les écrans
- `src/nt-app.js` — navigation, actions, décor animé
- `src/nt-aide.js` — « Comment ça marche » (les fiches sont dans le tableau `AIDE`)
- `src/lib/` — d3-array, d3-geo, topojson-client (ISC)
- `src/donnees/` — contours Natural Earth 1:110m (world-atlas) et noms des pays en français (world-countries)

Données : `localStorage['naotrip.donnees']`, synchronisées par `naogroup-cloud.js` (identifiant d'outil `naotrip`).

`generer-icone.ps1` refait `naotrip.ico`, `creer-raccourci-bureau.ps1` pose le raccourci sur le bureau.
