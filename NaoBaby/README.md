# NaoBaby — Chaque semaine, un peu plus de vous.

Le carnet de grossesse de la maison NaoGroup : élégant, personnel et rassurant.
Il accompagne les futurs parents semaine après semaine, puis les premiers mois de bébé.

> NaoBaby est un outil d'organisation, d'information générale et de souvenirs.
> Il ne pose aucun diagnostic, n'interprète aucun symptôme et ne remplace jamais
> une sage-femme, un médecin ou la maternité. Quand une note évoque une inquiétude,
> l'interface invite simplement à contacter un professionnel de santé (15 / 112 en urgence).

## Ouvrir

Double-cliquez sur **`NaoBaby.html`**. Aucune installation, aucun serveur : tout reste dans
le navigateur de cet ordinateur (stockage local). Pensez à **💞 Partager & sauvegarder → 💾**
de temps en temps.

Pour un raccourci sur le bureau, avec le logo : clic droit sur `creer-raccourci-bureau.ps1`
→ « Exécuter avec PowerShell ».

À l'ouverture, une courte animation : le ciel s'éveille, une étoile filante tombe dans le berceau
de lune du logo (ondes et étincelles à son arrivée), les 40 perles des semaines s'allument jusqu'à la
semaine en cours et un tour de lumière les parcourt ; enfin le croissant et son étoile s'envolent
se poser dans le logo de l'en-tête. Un clic, Entrée ou Échap la passe.

**❓ Comment ça marche** (bouton en haut à droite, ou F1) explique tout l'outil, fiche par
fiche, avec une recherche par mot.

## Les espaces

| Espace | Ce qu'on y trouve |
|---|---|
| 🏠 **Accueil** | « Mon petit calendrier de grossesse » (semaine X sur 40, perles, compte à rebours, taille de bébé en fruit), prochains rendez-vous, souvenirs de la semaine, liste naissance, chambre, valise, événements, prénoms, prochaines étapes. |
| 🤰 **Grossesse** | Semaine après semaine · Rendez-vous (rappels, notes privées, export `.ics` pour le téléphone, notifications) · **Planning & démarches** (suivi, Assurance Maladie, CAF, mairie, employeur, impôts, congés calculés selon le nombre de bébés) · Journal & jalons · Achats, liste de naissance, valise · Prénoms (notes à deux, coups de cœur, comparaison avec le nom de famille) · Chambre (palette, meubles, budget, inspirations) · **Événements** (baby shower, gender reveal, invités, budget, tâches, idées, fumigènes avec consignes de sécurité) et **invitations numériques animées**. |
| 🏥 **Accouchement** | Projet de naissance (souhaits, imprimable), numéros utiles, trajet vers la maternité, valise, chronomètre des contractions (sans interprétation), le grand jour. |
| 👶 **Bébé** | Naissance (date, heure, prénom, poids, taille, photo, premiers souvenirs), **carte de naissance** en image, poids & taille avec courbes, repas & découvertes, premières fois (âge calculé automatiquement), **livre souvenir PDF**. |

## Ce qui s'adapte tout seul

- **Jumeaux, triplés et plus** : un bébé par fiche, congé maternité recalculé, listes multipliées,
  carte de naissance commune, sélecteur de bébé dans l'espace Bébé.
- **Le sexe de bébé** : saisi seulement s'il a été communiqué par un professionnel de santé ou
  choisi par les parents, éventuellement en secret. Le bouton **« Découvrir le sexe de bébé »**
  ouvre une enveloppe animée (confettis doux, étoiles, ruban). Une fois révélé, l'outil prend
  des **touches de rose** (fille), **de bleu** (garçon) ou **des deux** (jumeaux mixtes).
  Un réglage permet de garder un thème neutre lavande.
- **Thème clair et sombre** (bouton lune / soleil).
- **Une grossesse qui s'arrête** : depuis ⚙️, « Notre grossesse s'est arrêtée ». L'outil devient
  un espace souvenir doux (bougie, mots, photos, contacts d'associations, 3114), sans compte
  à rebours ni fête. Pour des jumeaux, un seul bébé peut devenir « étoile » : il reste nommé
  dans le carnet. Tout est réversible.

## Invitations : modèles et propositions

10 modèles (Classique, Arche, Nuages, Polaroïd, Ruban, Clair de lune, Bouquet, Guirlande, Petits pois, Épuré),
12 palettes, 9 animations (étoiles, confettis, ballons, bulles, nuages, cœurs, paillettes dorées, papillons, sans
animation), des idées de textes prêtes à l'emploi, un choix d'emojis et un bouton **🎲 Me surprendre**.
Chaque modèle se retrouve dans la page animée téléchargée **et** dans l'image PNG. Les modèles servent aussi à la
carte de naissance.

## Recommencer un nouveau carnet

⚙️ ou 💞 Partager & sauvegarder → **🌱 Supprimer ce carnet et en commencer un nouveau**. Une sauvegarde peut être
faite juste avant ; les prénoms des parents, le nom de famille et la maternité peuvent être gardés.

## Réinitialiser l'outil

⚙️, 💞 Partager & sauvegarder, ou le lien en bas de page → **♻️ Réinitialiser l'outil**. Tout est effacé
(carnet, carnets gardés, thème, préférences) et NaoBaby redevient vierge, comme pour un nouvel utilisateur.
Par sécurité, il faut écrire **EFFACER** pour confirmer ; une sauvegarde peut être faite juste avant.

## Partage avec le ou la partenaire

**💞 Partager & sauvegarder → Créer le fichier à partager** : un fichier `.naobaby` chiffré par
mot de passe (AES-GCM 256, clé PBKDF2). Les notes de rendez-vous et les souvenirs marqués
« privé » n'y sont pas inclus, sauf choix contraire. Le ou la partenaire l'ouvre avec 📂.

## Compte NaoGroup

L'outil porte la ligne `naogroup-cloud.js` (`data-outil="naobaby"`) comme les autres outils :
tant que NaoGroup Cloud n'est pas configuré, il fonctionne en local ; une fois configuré, il
suit le profil et l'abonnement. NaoBaby est inscrit au catalogue (`naogroup-cloud.js`) — à
ajouter aux formules voulues dans `admin.html`. Attention : la synchronisation ignore une clé
de plus de 1,5 Mo, et les photos font vite grossir le carnet.

## Le logo

Le jeton NaoGroup (carré de 40, rayon 13) en dégradé violet profond → bleu-violet → lavande →
rose poudré à peine visible, le N blanc d'un seul tracé, et l'accent : **un croissant de lune
couché qui berce une petite étoile** — le berceau et l'enfant qui arrive.
`generer-icone.ps1` régénère `naobaby.ico`.

## Modifier le code

Les sources sont dans `src/` (`index.html`, `naobaby.css`, `nb-core.js`, `nb-grossesse.js`,
`nb-evenements.js`, `nb-bebe.js`, `nb-aide.js`, `nb-app.js`). Après chaque modification :

```
powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1
```

Les informations administratives (France) sont indicatives : elles renvoient toujours vers
service-public.fr, ameli.fr, caf.fr et impots.gouv.fr.
