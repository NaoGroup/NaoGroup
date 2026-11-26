# NaoPassword — Vos accès, bien gardés, toujours sous la main

Le carnet de mots de passe de la maison **NaoGroup** : pour chaque organisme (EDF, Ameli, la banque,
la CAF, l'opérateur…), le **numéro de contrat ou de client**, l'**identifiant** et le **mot de passe**,
rangés par thème, cachés à l'écran et — avec un code maître — chiffrés avant d'être enregistrés.

Un seul fichier : `NaoPassword.html` (pas de `src/` ni de build). Il se branche à NaoGroup par la ligne
`<script src="../naogroup-cloud.js" data-outil="naopassword"></script>` (profils, accès, synchronisation,
passage animé depuis l'accueil et retour).

## Ce qu'on y fait

| Onglet | Contenu |
|---|---|
| 🏠 Accueil | recherche (`/`), grands boutons, favoris ⭐, comptes par thème, derniers modifiés ; bandeau tant qu'aucun code maître n'est posé |
| 🔑 Mes comptes | la liste, filtrée par thème, triée (organisme, récents, thème, plus faibles d'abord) ; 👤 copie l'identifiant, 👁 montre le mot de passe 20 s, 📋 le copie |
| 🛡️ Bilan de sécurité | note sur 100, mots de passe faibles, réutilisés, de plus d'un an, comptes sans mot de passe |
| 🎲 Créer un mot de passe | caractères au hasard (8 à 40, choix des sortes, sans caractères ambigus) ou phrase de mots (3 à 10) ; `crypto.getRandomValues` |
| 🔒 Ma protection | code maître (poser, changer, retirer), verrouillage automatique, presse-papiers, « ce qui est vraiment protégé » |

Thèmes : Banque, Assurance & mutuelle, Santé, Administration & impôts, Énergie & eau, Téléphone & internet,
Messagerie & réseaux, Achats en ligne, Loisirs & abonnements, Travail & études, Logement, Transport & véhicule, Autre —
devinés d'après le nom de l'organisme (`devinerCat`). Types de numéro : client, contrat, adhérent, dossier, fiscal,
sécurité sociale, autre.

En haut : ❓ Comment ça marche (F1), 🔒 Verrouiller (si un code existe), 💾 Sauvegarder, 📂 Recharger,
🧹 Réinitialiser (écrire EFFACER), 🕊️ animations en pause, ☾/☀ thème.

## Le « cache » des mots de passe

- Partout, un mot de passe s'affiche `••••••••••` (toujours dix points : la longueur n'est pas trahie).
- 👁 le montre 20 secondes ; 📋 le copie sans l'afficher, et le presse-papiers est vidé au bout de 30 s (réglable).
- Les champs de saisie sont des champs texte masqués (`-webkit-text-security`), pas des `type=password` :
  le navigateur ne propose pas de les enregistrer dans son propre gestionnaire.
- Fermer une fiche vide la fenêtre : aucun mot de passe montré ne reste dans la page.

## Le code maître (chiffrement)

- Sans code : `naopassword.donnees` contient le coffre en clair (JSON `{v, comptes}`) — caché à l'écran seulement.
- Avec un code : `naopassword.donnees` = `{v, chiffre:true, algo:'AES-256-GCM', kdf:'PBKDF2-SHA256', iter:600000, sel, iv, data}`.
  La clé est tirée du code (PBKDF2-SHA-256, 600 000 tours, sel de 16 octets) et n'existe qu'en mémoire
  (`CryptoKey` non exportable) tant que le coffre est ouvert ; nouvel IV à chaque enregistrement.
  Le code n'est **jamais** enregistré : un code oublié ne se récupère pas (seule issue : une sauvegarde
  antérieure, ou 🧹).
- La synchronisation NaoGroup (`naogroup-cloud.js`) envoie la valeur telle qu'elle est stockée : avec un code,
  le serveur ne reçoit que le texte chiffré.
- Verrouillage : à chaque ouverture de la page, sur 🔒, et après 1 à 60 min sans geste (5 par défaut ;
  « Jamais » possible). Cinq codes faux de suite imposent une courte attente.
- Réglages (non secrets) dans `naopassword.reglages` : `verrou`, `pressePapiers`, `gen` (générateur).
- Besoin d'un contexte sûr pour `crypto.subtle` : http(s) ou fichier local (`file://`, vérifié) conviennent.

## Import et sauvegardes

- 📥 Importer : fichier CSV exporté par Chrome, Edge, Firefox (colonnes name/title, url, username/login,
  password, note ; séparateur `,` ou `;`). Les doublons exacts sont ignorés ; rappel de supprimer le CSV.
- 💾 Sauvegarde : `NaoPassword-sauvegarde-AAAA-MM-JJ.json` = `{outil, date, stockage}` où `stockage` est la
  valeur enregistrée telle quelle (chiffrée si un code existe ; sinon avertissement avant téléchargement).
- 📂 Recharger : une sauvegarde chiffrée remplace le coffre et redemande son code ; une sauvegarde en clair,
  chargée coffre ouvert avec un code, est rechiffrée avec ce code.

## Ouverture et fermeture

`#intro` : la porte ronde d'un coffre-fort (≈ 4 s). Des poussières de lumière convergent et un anneau se
dessine ; la porte arrive en tournant ; le cadran tourne à droite, à gauche, à droite pendant que les six points
du code s'allument ; au déclic, deux ondes partent, le volant tourne et les quatre pênes rentrent ; la porte
pivote sur ses gonds, la lumière et des éclats jaillissent, le jeton monte du coffre devant des rayons ; le nom se
déchiffre lettre à lettre (`•#A…` → NaoPassword), les comptes s'envolent tout autour, la phrase s'écrit mot à mot.
Elle sort par l'animation `introSort` ; le jeton (`data-ng-jeton`) glisse jusqu'au logo de l'en-tête
(`data-ng-logo`), comme le nom et la phrase.

Contrairement aux autres outils (intro passée d'elle-même dès la 2e ouverture dans la session), l'intro porte
`data-ng-toujours` : `naogroup-cloud.js` la laisse se jouer à chaque ouverture. Un clic, Échap, Entrée ou Espace
la passent toujours.
Le passage depuis l'accueil (voile, jeton) et le retour (repli dans la carte) sont gérés par
`naogroup-cloud.js` ; le fond de l'écran d'ouverture est aussi noté dans `FONDS` de `NaoGroup.html`.

## Fichiers

- `NaoPassword.html` — l'outil
- `generer-icone.ps1` → `naopassword.ico` (même tracé que le logo SVG `l-pw`)
- `creer-raccourci-bureau.ps1` — raccourci bureau (Chrome/Edge en mode application)

Ailleurs dans NaoGroup : `naogroup-cloud.js` (catalogue `OUTILS`, formule Particulier par défaut),
`naogroup-logos.js` (symbole `l-pw` et sa fiche de charte), `NaoGroup.html` (carte, symbole, fond, essai libre,
phrase « je m'occupe de mes mots de passe »), `connexion.html` (essai libre), `histoire.html` (ruban),
`supabase-schema.sql` (formules par défaut). Les formules en ligne se règlent dans `admin.html` →
Paramètres → Formules et tarifs (NaoPassword y apparaît tout seul).
