# NaoInvest

> **NaoInvest — Comprendre avant de placer.**

L'espace d'éducation financière de la maison NaoGroup : gérer son argent, comprendre l'épargne et les impôts,
découvrir la Bourse, s'exercer avec un portefeuille fictif et repérer les arnaques. Un seul fichier,
`NaoInvest.html`, à double-cliquer.

NaoInvest est un **outil d'éducation et de simulation** : ce n'est ni une banque, ni une plateforme de courtage,
ni un conseiller en investissement financier, ni un conseiller fiscal. Il ne recommande l'achat, la vente ou la
conservation d'aucun titre, ne promet aucun rendement, ne collecte aucun argent et ne permet aucune opération réelle.
Le risque de perte en capital et « les performances passées ne préjugent pas des performances futures » sont rappelés
en pied de page, dans les leçons d'épargne et de Bourse, dans le portefeuille fictif et sur l'accueil.

## Deux parties bien distinctes

En haut, trois choix seulement : **🏠 Accueil · 🧭 Vie pratique · 💶 Éducation financière**. Choisir une partie
affiche sa page d'entrée (tuiles) et ses onglets ; chaque page rappelle sa partie par un bandeau.
Vert d'eau pour la vie pratique, doré pour l'éducation financière. ⭐ Ma progression et 📖 Dictionnaire sont
dans la barre du haut. L'accueil : deux grandes « portes », puis « Aujourd'hui pour vous » (leçon du jour,
conseil du jour, progression, réflexe anti-arnaque).

### 🧭 Vie pratique — ce qu'on n'apprend pas à l'école

| Onglet | Ce qu'on y trouve |
|---|---|
| 💼 **Fiche de paie** | Le chemin du coût employeur au net payé (barres), une fiche fictive dont chaque ligne s'explique d'un clic, FAQ. **Import de sa propre fiche** (PDF via pdf.js, ou photo via Tesseract, chargés à la demande depuis cdnjs / jsdelivr) : lue uniquement dans le navigateur, jamais envoyée ni enregistrée ; repère brut, net avant impôt, impôt à la source et taux, net payé, net imposable, net social, coût employeur, et explique chaque ligne reconnue. Saisie de 3 chiffres possible |
| 🧾 **Impôts** | Cours en 8 chapitres, atelier de calcul par tranches |
| 💡 **Conseils de vie** | 27 repères par âge et situation, atelier voiture |
| 🔌 **Câbles & prises** | 17 câbles dessinés (USB-C, USB-A, micro-USB, Lightning, USB-B, HDMI, DisplayPort, VGA, jack, RCA, optique, Ethernet, antenne, péritel, C13, C7, prise française) : usage et astuce |
| 🌡️ **Fièvre** | Thermomètre interactif (34–42 °C) selon l'âge, zones de température, signes qui doivent faire appeler le 15, méthodes de mesure, bons gestes. Pas un avis médical |
| 🧺 **Symboles du linge** | 25 symboles d'entretien dessinés : lavage, blanchiment, séchage, repassage, nettoyage professionnel |
| 🚗 **Voyants de voiture** | 18 voyants sur un tableau de bord, classés par couleur (rouge, orange, vert/bleu) : ce qu'ils veulent dire, que faire |

Chaque fiche (câbles, fièvre, linge, voyants) se termine par un jeu **« Teste-toi »**.

### 💶 Éducation financière — gérer, épargner, placer

| Onglet | Ce qu'on y trouve |
|---|---|
| 🧮 **Mes bases** | Budget, reste à vivre, précaution, découvert, crédit, horizons, inflation, projet |
| 🏦 **Guide de l'épargne** | 30 fiches complètes (livrets, PEL/CEL, assurance-vie, PEA, PER, PEE, supports, enfants, placements risqués), pyramide de l'épargne, tableau comparatif |
| 🌱 **Épargner & investir** | Notions clés : risque, horizon, diversification, garanties, enveloppes, frais |
| 📈 **La Bourse** | 9 leçons en escalier |
| 🎮 **Portefeuille fictif** | 10 000 NaoCoins, 7 scénarios, journal, comparaison |
| 📰 **Actualités** | Repères datés et sourcés |
| 🛡️ **Anti-arnaques** | Signaux d'alerte, checklist, vérifications |

La page d'entrée propose un chemin « Par où commencer ? » : budget → produits d'épargne → risque et rendement → Bourse → s'exercer.

Aussi : **Mode clair / Mode sombre** (mémorisé), 🕊️ pour mettre les animations en pause, **♻️ Réinitialiser** (taper
EFFACER : tout repart vierge — les autres outils NaoGroup ne sont pas touchés). En fond, la Bourse en douceur :
chandeliers qui respirent, courbes qui se tracent, pièces qui tournent, petits histogrammes et camemberts, sous le
ciel étoilé de la maison. Aucune flèche agressive, aucun cours réel.

## À savoir sur les chiffres

- L'outil fonctionne **hors ligne** : il ne reçoit pas les nouvelles du jour. Les actualités sont des événements
  passés vérifiables (rédaction : septembre 2026), chacune invitant à vérifier la situation actuelle à la source.
- Le cours d'impôts utilise le **barème des revenus 2024 (déclarés en 2025)**, pour s'exercer ; il est revalorisé
  chaque année (constante `BAREME` dans `src/ni-impots.js`). Le taux global du PFU n'est volontairement pas chiffré :
  il a changé plusieurs fois.
- La simulation repose sur un modèle volontairement simplifié et inventé ; elle ne prévoit rien.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé violet profond `#3F2CB9` → bleu-violet `#6C78EE` → lavande
`#CDB3F8`, le N blanc d'un seul tracé, et l'accent : **trois petites barres qui montent doucement** (un graphique
discret, à demi transparent) et **une étoile blanche qui s'élève** dans une lueur lavande. Pas de flèche, pas de
billet : comprendre, puis avancer. `generer-icone.ps1` refait `naoinvest.ico`, `creer-raccourci-bureau.ps1` pose le raccourci.

## Pour les développeurs

Les sources sont dans `src/` ; `NaoInvest.html` est **généré** :

```
powershell -ExecutionPolicy Bypass -File build.ps1
```

- `src/index.html`, `src/naoinvest.css` — la page et la charte (thèmes clair et sombre)
- `src/ni-contenu.js` — leçons et quiz, parcours, badges, produits, dictionnaire, actualités, anti-arnaques, défis, supports et scénarios
- `src/ni-impots.js` — le cours d'impôts (chapitres, barème, mots, parcours, badge)
- `src/ni-placements.js` — le guide de l'épargne (fiches, familles, besoins, tableau comparatif)
- `src/ni-conseils.js` — les conseils de vie et l'atelier voiture
- `src/ni-vie.js` — câbles, fièvre, linge, voyants (dessins SVG) et le jeu « Teste-toi »
- `src/ni-paie.js` — la fiche de paie : explications, fiche d'exemple, import et analyse
- `src/ni-core.js` — état, progression, correction des quiz, modèle de simulation, fenêtre, fête
- `src/ni-vues.js` — les écrans
- `src/ni-cours-impots.js` — la page du cours d'impôts et son atelier de calcul
- `src/ni-app.js` — navigation, quiz, simulation, actualités, objectif, réinitialisation, thème, décor animé

Données : `localStorage['naoinvest.donnees']` (synchronisé par `naogroup-cloud.js`, identifiant d'outil `naoinvest`,
inscrit au catalogue et à la formule Particulier) ; `naoinvest.theme` et `naoinvest.calme` pour les réglages.
