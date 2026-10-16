# NaoFactu

> **NaoFactu — Vos factures claires, votre activité maîtrisée.**

Un outil de la famille NaoGroup pour gérer l'administratif et les finances d'une petite activité :
indépendants, freelances, auto-entrepreneurs, créateurs, graphistes, artisans, associations et petites entreprises.

Un seul fichier, `NaoFactu.html`, à ouvrir dans Chrome ou Edge. Aucun compte, aucun abonnement, aucun serveur :
les données restent dans le navigateur de cet ordinateur (état dans `localStorage`, fichiers joints dans IndexedDB).

## Ce que fait l'outil

| Rubrique | Contenu |
|---|---|
| **Tableau de bord** | CA encaissé du mois, factures à encaisser, factures en retard, dépenses du mois, trésorerie estimée, prochaines échéances, derniers devis, documents à classer, raccourcis. |
| **Clients** | Fiches (coordonnées, TVA, notes) avec historique des devis, factures et paiements. |
| **Devis** | Lignes, remises, TVA, validité, statuts (brouillon, envoyé, accepté, refusé, expiré), duplication, transformation en facture en un clic, facture d'acompte puis de solde. |
| **Factures** | Numérotation chronologique attribuée à la validation, acompte / solde, avoirs liés, factures récurrentes, statuts (brouillon, envoyée, vue, en attente, partiellement payée, payée, en retard, annulée), relances courtoises personnalisables. |
| **Paiements** | Encaissements (date, montant, moyen, référence), reste à encaisser. |
| **Dépenses** | Catégories, TVA, moyen de paiement, photo ou PDF du justificatif, dépenses prévues. |
| **Comptabilité** | Tableau recettes / dépenses, trésorerie, rapports mensuels / trimestriels / annuels, exports CSV, Excel et PDF. |
| **Fiches de paie** | Édition de bulletins de paie (bulletin clarifié : brut, cotisations salariales et patronales, net avant impôt, net imposable, prélèvement à la source, net payé, cumuls, congés), fiches salariés, grille de cotisations modifiable ; classement des bulletins reçus, suppression unitaire ou groupée, rappels. |
| **Documents** | Dossiers : à classer, factures clients, fournisseurs, justificatifs, relevés, exports, administratif. |
| **Recrutements** | Postes (fiche de poste imprimable), candidats avec CV, suivi par étapes en glisser-déposer, entretiens, e-mails types. |
| **Contrats** | Éditeur détaillé article par article (parties complètes, objet, durée, conditions financières, clauses), 6 modèles rédigés (prestation, CDI, CDD, sous-traitance, NDA, fournisseur), bibliothèque de 15 clauses, montants en toutes lettres, champs manquants surlignés, 3 mises en page (classique, moderne, élégante) et couleur au choix, paraphes et numéros de page ; exemplaire signé joint, alertes de fin, de préavis et de période d'essai. |
| **Échéances** | Calendrier de tout ce qui a une date, et rappels personnalisés. |
| **Catalogue** | Produits et services réutilisables. |
| **Paramètres** | Profil de l'activité (logo, coordonnées, banque, TVA, mentions, informations employeur, couleur des documents), plusieurs activités, numérotation, modèles de relance, sauvegarde / restauration, remise à zéro sélective (devis, factures, contrats… au choix, compteurs compris). |

Les PDF passent par la fenêtre d'impression du navigateur (« Enregistrer au format PDF ») : rien à installer, tout fonctionne hors ligne.
Thème clair et thème sombre, avec l'interrupteur en bas du menu.

## Limites volontaires

NaoFactu est un **outil d'organisation et de suivi**. Ce n'est ni un expert-comptable, ni un logiciel de paie,
ni un conseil fiscal, social ou juridique, et il ne garantit pas la conformité des documents à la situation de chacun.
Les écrans concernés le rappellent : mentions obligatoires, TVA, déclarations, contrats de travail et règles de recrutement
sont à vérifier avec un professionnel ou l'administration. Les bulletins de paie suivent la structure légale, mais les taux de
la grille de cotisations sont indicatifs (entreprise de moins de 11 salariés) : ils doivent être vérifiés chaque année. L'outil ne fait ni la DSN
ni le paiement des cotisations.

## Fichiers

```
NaoFactu.html               l'application, construite (à ouvrir)
build.sh                    réassemble NaoFactu.html à partir de src/
src/index.html             la page
src/naofactu.css           la charte (thèmes clair et sombre)
src/nf-core.js             données, stockage, calculs, numérotation
src/nf-ui.js               navigation, modales, formulaires, thème
src/nf-docs.js             rendu des documents, PDF, e-mails, relances, exports
src/nf-vues-ventes.js      accueil, clients, catalogue, devis, factures, paiements
src/nf-vues-compta.js      dépenses, comptabilité, paie, documents, calendrier, paramètres
src/nf-modeles.js          modèles de contrat, clauses, grille de cotisations, montants en lettres
src/nf-vues-rh.js          recrutements
src/nf-contrats.js         contrats : rendu, éditeur, modèles
src/nf-paie.js             paie : salariés, bulletins, grille, classement
src/nf-app.js              démarrage
generer-icone.ps1          génère naofactu.ico
creer-raccourci-bureau.ps1 pose un raccourci NaoFactu sur le bureau
```

Après une modification dans `src/` : `sh build.sh`.

## Le logo

Le jeton de la maison (carré de 40, rayon 13) en dégradé violet profond → lavande → bleu-violet, le N blanc
d'un seul tracé, et au-dessus une ligne de facture qui se termine par une petite coche de paiement dans une lueur lavande :
« la ligne est réglée ». Lisible à 16 px.

## Sauvegarde

Paramètres → Sauvegarde télécharge un fichier `.json` qui contient tout, documents joints compris.
Les données sont liées à l'adresse du fichier : avant de déplacer le dossier, faites une sauvegarde puis restaurez-la.
