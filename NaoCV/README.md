# NaoCV

> **Votre parcours mérite d'être remarqué.**

Le générateur de CV, de lettres de motivation et de candidatures de la maison NaoGroup.
Pour les étudiants, alternants, jeunes diplômés, personnes en recherche d'emploi ou en reconversion.
Un seul fichier, `NaoCV.html`, à double-cliquer. Tout reste sur l'ordinateur et marche sans connexion.

**Règle d'or : NaoCV n'invente rien.** Aucune compétence, aucun diplôme, aucun chiffre, aucune motivation
n'est ajouté sans l'utilisateur. Ce qui manque devient un `[emplacement à compléter]`, jamais une affirmation.

## Ce qu'on y trouve

| Onglet | Rôle |
|---|---|
| 🏠 Accueil | En-tête et bouton « Créer mon CV », accompagnement en 9 étapes, raccourcis, cartes : CV principal, versions, offre, candidatures, entretiens et relances, lettres, documents prêts |
| 📝 Mon CV | Création guidée en 10 étapes avec **aperçu A4 en direct** : coordonnées (photo facultative), poste et accroche (idées d'accroche), expériences, formation, compétences, langues et certifications, projets et centres d'intérêt, infos pratiques, style et couleurs, vérification et export |
| 🗂️ Mes versions | Une version par métier, par offre ou par entreprise : dupliquer, renommer, définir le CV principal |
| 🎯 Adapter à une offre | Mots-clés de l'annonce présents / absents, score de compatibilité **indicatif**, axes d'amélioration, titre et accroche adaptés, missions réordonnées, puis **version adaptée aux couleurs de l'entreprise** en un clic |
| ✉️ Lettres | Lettre en trois temps, 5 tons, format court (candidature en ligne) ou développé, chaque paragraphe modifiable |
| 📋 Candidatures | Tableau de suivi, 8 statuts, relance proposée à J+10, CV et lettre utilisés |
| 📅 Entretiens & relances | Calendrier du mois et liste « À venir » |
| ✅ Prêt à envoyer | Checklist « CV prêt à envoyer », noms de fichiers professionnels, exports |

### Des CV vraiment personnalisés

- **10 modèles** : Classique, Moderne, Élégant, Créatif, Minimaliste, Professionnel, Étudiant, Alternance, Cadre, Reconversion.
- **Aux couleurs de l'entreprise** : une centaine d'entreprises connues (Carrefour, Decathlon, Orange, SNCF, BNP Paribas…)
  sont reconnues avec leurs couleurs ; sinon, on importe le logo et NaoCV **extrait ses couleurs**. Une couleur trop claire
  est assombrie automatiquement pour rester lisible.
- Dans les expériences : **monogramme ou logo** et nom de chaque entreprise dans sa couleur de marque.

### Version ATS

Bascule « 🎨 Visuel / 🤖 CV ATS » partout : une colonne, police simple (Arial, Calibri, Georgia, Tahoma, Verdana),
titres standards, coordonnées dans le corps, ni photo, ni tableau, ni icône, ni barre de niveau.

### Reformuler les missions

« je m'occupais de la caisse » → *Gérer la caisse* · *Assurer la gestion des encaissements* · *Piloter les encaissements*.
Trois styles (simple, professionnel, impactant), verbes d'action, signalement des formulations vagues. Aucun chiffre n'est ajouté.

### Exports

- **PDF visuel** et **PDF ATS** : par la fenêtre d'impression (« Enregistrer au format PDF »), texte sélectionnable.
- **DOCX** (CV et lettre) : fichier Word généré directement, une colonne, modifiable.
- Noms proposés : `CV_Prenom_Nom_Poste.pdf`, `Lettre_Motivation_Prenom_Nom_Entreprise.pdf`.

Thème clair / sombre (☾ ☀), 🕊️ pour mettre les animations en pause, 💾 / 📂 pour sauvegarder et recharger.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoCV.html` est **généré** :

```
powershell -File build.ps1
```

- `src/index.html`, `src/naocv.css` — la page, la charte, les 10 modèles de CV, la lettre, l'impression
- `src/nc-core.js` — état, dates, fenêtres, couleurs, écriture et lecture des fichiers .docx (ZIP maison)
- `src/nc-savoir.js` — couleurs des entreprises, verbes d'action, mots-clés des annonces, fautes fréquentes
- `src/nc-cv.js` — rendu des CV, version ATS, vérifications, reformulation, analyse d'offre, lettre, import, export Word
- `src/nc-vues.js` — les écrans
- `src/nc-app.js` — navigation, actions, exports, décor animé

`generer-icone.ps1` produit `naocv.ico` ; `creer-raccourci-bureau.ps1` pose un raccourci sur le bureau.
Les données sont enregistrées sous la clé `naocv.donnees` (espace propre à chaque profil avec NaoGroup Cloud).
