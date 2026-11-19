'use strict';
/* ============================================================
   NaoRoots — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoFi, NaoAgenda, NaoBaby et NaoPets : sommaire à
   gauche, fiche à droite, et une recherche qui garde les sujets contenant
   le mot tapé. Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   Ouverture : le bouton ❓ de l'en-tête, la touche F1 (ou ?), et le lien
   de l'écran de bienvenue. Échap ferme, comme toutes les fenêtres.
   ============================================================ */
const AIDE = [
{ id: 'debut', em: '🌱', t: 'Premiers pas', chapo: 'Planter la première graine : une personne suffit.', b: [
  ['p', 'NaoRoots est votre <b>arbre familial</b> et la <b>mémoire de la famille</b> : les personnes et leurs liens, mais aussi les photos, les histoires, les documents et les questions à poser aux anciens. Pas besoin de connaître la généalogie : l’arbre grandit à votre rythme.'],
  ['etapes', [
    'Sur l’écran de bienvenue, cliquez <b>🌳 Commencer mon arbre</b>.',
    'Indiquez la <b>première personne</b> — vous, un enfant, une grand-mère… Seul le prénom est nécessaire. Cliquez <b>🌳 Planter l’arbre</b> : elle devient le centre de votre premier arbre.',
    'Dans <b>🌳 Mon arbre</b>, cliquez <b>＋ Ajouter un parent</b> sur les cases en pointillés, ou <b>＋ Ajouter un proche</b> sous l’arbre : parents, enfants, conjoint·e, frères et sœurs…',
    'Ouvrez la <b>fiche</b> de chacun (📄 Voir la fiche) pour compléter dates, lieux, biographie, photos et histoires.',
  ]],
  ['liste', [
    ['🏠 Accueil', 'le résumé : aperçu de l’arbre, ce qui reste à compléter, souvenir du jour, derniers ajouts, anniversaires, albums, documents, lieux.'],
    ['🌳 Mon arbre', 'l’arbre dessiné, en plusieurs vues.'],
    ['👨‍👩‍👧 Ma famille', 'tout le monde, génération par génération, avec la fiche de chacun.'],
    ['📖 Nos histoires · 🖼️ Albums · 📜 Documents & sources', 'les souvenirs, les photos et les papiers de famille.'],
    ['⏳ Frise familiale', 'la chronologie et la carte des lieux.'],
    ['🧩 À compléter', 'ce qui manque encore, les doublons et les questions à poser.'],
    ['🎁 Transmission', 'livre de famille, impressions, invitations, GEDCOM, sauvegarde.'],
  ]],
  ['p', 'Vous venez d’un autre logiciel de généalogie ? Le lien <b>importer un fichier GEDCOM</b> reprend tout votre arbre d’un coup (voir la fiche « Livre, impressions & GEDCOM »). Pour voir l’outil rempli avant de commencer, le lien <b>découvrir avec une famille d’exemple</b> charge une famille inventée — quand il est proposé.'],
  ['astuce', 'Une date, un lien, un lieu dont vous n’êtes pas sûr·e ? Saisissez-le quand même : il restera « à vérifier » jusqu’à ce que vous le confirmiez.'],
]},

{ id: 'accueil', em: '🏠', t: 'L’accueil', chapo: 'La famille d’un coup d’œil, chaque jour.', b: [
  ['liste', [
    ['🌳 Ouvrir mon arbre', 'le grand bouton en haut ; l’aperçu de l’arbre s’ouvre aussi d’un clic.'],
    ['Les cinq boutons', '👤 Ajouter une personne, 📷 Ajouter une photo, ✍️ Raconter une histoire, 📜 Ajouter un document, 💌 Inviter un proche.'],
    ['🧩 À compléter', 'les cinq premières choses qui manquent (dates, liens, photos à identifier, propositions de proches…). La flèche → mène à tout le reste.'],
    ['🕯️ Souvenir du jour', 'chaque jour, une histoire, une photo avec son souvenir ou une citation de la famille.'],
    ['✨ Nos derniers ajouts', 'les personnes, photos, histoires et documents ajoutés récemment.'],
    ['🎂 Les prochains anniversaires', 'ceux des vivants dans les deux mois, et le jour de naissance des disparus, en souvenir. Il faut une date de naissance complète (jour et mois).'],
    ['🖼️ Mes albums · 📜 Mes documents · 📍 Nos lieux importants', 'un raccourci vers chaque espace ; la petite carte s’ouvre en grand d’un clic.'],
  ]],
  ['p', 'Le jour d’un anniversaire, un <b>bandeau de fête</b> s’affiche avec gâteau et confettis ; sur l’arbre, un petit gâteau se pose sur le portrait (bougie qui vacille le jour même, plus discret dans les 7 jours).'],
  ['p', 'En bas de l’accueil : <b>Les outils Nao</b> de la maison NaoGroup, et ceux à venir.'],
]},

{ id: 'arbre', em: '🌳', t: 'Mon arbre', chapo: 'Se promener dans l’arbre, de génération en génération.', b: [
  ['sous', 'Les vues'],
  ['liste', [
    ['👨‍👩‍👧 Famille', 'les ancêtres au-dessus, les descendants en dessous, les frères, sœurs et conjoints à côté.'],
    ['⏳ Sablier', 'seulement les ascendants et les descendants de la personne au centre.'],
    ['⬆️ Ascendants · ⬇️ Descendants', 'seulement les ancêtres, ou seulement la descendance.'],
    ['🪭 Éventail', 'les ancêtres en demi-roue, comme un éventail ouvert.'],
    ['↕ Vertical · ↔ Horizontal', 'le sens de l’arbre (sauf en éventail).'],
    ['Générations', 'de 1 à 8, ou <b>🌳 Tout l’arbre</b> pour toutes les générations d’un coup.'],
  ]],
  ['sous', 'Se déplacer'],
  ['liste', [
    ['Un clic sur une personne', 'la met au centre. Un clic sur la personne déjà au centre passe de « Famille » à « Sablier », et inversement.'],
    ['Glisser', 'avec la souris, pour déplacer l’arbre.'],
    ['Zoom', 'les boutons − et ＋ (le pourcentage remet à 100 %), ou <b>Ctrl + molette</b> autour du pointeur.'],
    ['⤢ Ajuster', 'fait tenir tout l’arbre dans la fenêtre.'],
    ['⌂ Centre', 'revient à la personne au centre de l’arbre.'],
    ['⛶ Plein écran', 'l’arbre prend tout l’écran ; Échap pour revenir.'],
    ['🖨️ PDF', 'imprime l’arbre tel qu’il est affiché.'],
  ]],
  ['sous', 'Lire l’arbre'],
  ['liste', [
    ['Les couleurs', 'chaque branche a sa couleur discrète : les lignées des quatre grands-parents de la personne au centre. Elles apparaissent dès que les grands-parents sont ajoutés.'],
    ['<span style="color:#F6C66E">●</span> Le point doré', 'une date est encore à vérifier.'],
    ['Les pointillés', 'un lien adoptif, un beau-parent ou un·e ex-conjoint·e.'],
    ['＋ Ajouter un parent', 'les cases en pointillés, là où un parent manque : un clic pour l’ajouter.'],
  ]],
  ['p', 'Sous l’arbre, la carte de la personne choisie : sa naissance, son âge, son prochain anniversaire, ses proches (un clic pour aller vers eux), et les boutons <b>📄 Voir la fiche</b>, <b>＋ Ajouter un proche</b> et <b>⭐ Centre de l’arbre</b>.'],
]},

{ id: 'arbres', em: '🗂️', t: 'Plusieurs arbres', chapo: 'Plusieurs regards sur la même famille.', b: [
  ['p', 'Dans <b>🌳 Mon arbre → Mes arbres</b>, créez d’autres arbres : <b>famille maternelle, paternelle, arbre du couple, arbre d’un enfant, branche spécifique</b>. Ce ne sont pas des copies : chaque personne n’est saisie <b>qu’une seule fois</b>, et chaque arbre la regarde depuis une autre personne au centre.'],
  ['etapes', [
    'Cliquez <b>🌳 Mes arbres</b>, puis <b>＋ Créer un arbre</b>.',
    'Donnez-lui un nom et un type, et choisissez la <b>personne au centre</b>.',
    'Choisissez qui en fait partie : <b>toute la famille reliée</b>, <b>ses ancêtres seulement</b> ou <b>ses descendants seulement</b>.',
    'Si vous voulez, nommez les <b>quatre branches</b> (les lignées des grands-parents) : « Les Joseph de Martinique », « Les Schmitt d’Alsace »…',
  ]],
  ['liste', [
    ['Changer d’arbre', 'le menu en haut de l’arbre (dès qu’il y en a deux), ou <b>Afficher</b> dans Mes arbres.'],
    ['✏️ Modifier', 'renommer, changer le centre ou la portée.'],
    ['🗑️ Supprimer cet arbre', 'seul ce regard disparaît (il va à la corbeille) : les personnes, photos et histoires restent.'],
  ]],
  ['astuce', 'Un arbre est toujours privé. Il n’est visible par un proche que si vous préparez vous-même une invitation pour cet arbre-là.'],
]},

{ id: 'personnes', em: '👤', t: 'Les personnes et leur fiche', chapo: 'Tout ce qu’on sait de quelqu’un, au même endroit.', b: [
  ['sous', 'Ajouter ou modifier une personne'],
  ['liste', [
    ['Prénom, nom, surnom', 'le nom de naissance, un surnom (« Man Rose », « Papi Jo »), un nom d’usage. Il faut au moins un prénom, un nom ou un surnom.'],
    ['📷 Portrait', 'une photo ronde, qui apparaît dans l’arbre.'],
    ['Sexe', 'facultatif : il sert seulement aux mots « grand-mère », « oncle », « cousine »…'],
    ['Naissance', 'date, lieu et certitude. La date peut être incomplète : <b>1932</b>, <b>03/1932</b> ou <b>12/03/1932</b>, et précisée : exacte, vers, avant, après.'],
    ['Décès', 'cochez « Cette personne est décédée » pour faire apparaître date et lieu.'],
    ['📖 Biographie', 'enfance, études, métiers, lieux de vie, passions, habitudes, souvenirs, anecdotes.'],
    ['Sources, confidentialité, couleur', 'd’où viennent les informations, qui peut les voir, et la couleur de branche (automatique sinon).'],
  ]],
  ['sous', 'La fiche'],
  ['p', 'Cliquez sur une personne dans <b>👨‍👩‍👧 Ma famille</b> (ou <b>📄 Voir la fiche</b> sous l’arbre) : naissance, décès, âge, profession, sources, puis <b>sa famille</b> (parents, frères et sœurs, unions, enfants, liens importants), <b>les événements de sa vie</b>, <b>sa biographie</b>, <b>ses mots et expressions</b>, ses photos, ses histoires, ses documents et les questions à poser à son sujet.'],
  ['liste', [
    ['🗓️ Événements', 'baptême, mariage, déménagement, arrivée dans une région, migration, voyage, diplôme, métier, permis, tatouage, service militaire… avec date, lieu, certitude et sources. Ils apparaissent sur la frise.'],
    ['💬 Citations', 'une expression, un dicton, une petite phrase qu’on répète encore dans la famille, avec son contexte.'],
    ['🎂 Âge et anniversaire', 'calculés tout seuls quand la date de naissance est connue.'],
  ]],
  ['sous', 'Ma famille'],
  ['p', 'Tout le monde, rangé par génération (grands-parents, parents, oncles et tantes…). Le champ de recherche trouve un prénom, un nom, un lieu ou un métier ; les pastilles filtrent par branche. Les personnes d’autres arbres sont dans « Dans d’autres arbres ».'],
]},

{ id: 'liens', em: '🔗', t: 'Ajouter un proche, les liens', chapo: 'Chaque lien est posé par vous, jamais deviné.', b: [
  ['etapes', [
    'Sur la fiche ou sous l’arbre, cliquez <b>＋ Ajouter un proche</b>.',
    'Choisissez le lien : un parent, un enfant, un·e conjoint·e, un·e ex, un frère ou une sœur, un grand-parent, un oncle ou une tante, un cousin ou une cousine, ou un lien important (parrain, marraine, lien de cœur).',
    'Précisez sa <b>nature</b> (parent biologique, adoptif, beau-parent, famille d’accueil ; mariage, PACS, union libre…) et sa <b>certitude</b>.',
    'Choisissez <b>une nouvelle personne</b>, ou <b>quelqu’un déjà dans l’arbre</b>, puis <b>Continuer →</b>.',
  ]],
  ['liste', [
    ['Grand-parent, oncle, cousin', 'NaoRoots demande par quel parent passer. Si ce parent n’est pas encore là, il faut l’ajouter d’abord : NaoRoots ne crée jamais de parent inconnu à votre place.'],
    ['Frère ou sœur', 'cochez les parents en commun ; décochez-en un pour un demi-frère ou une demi-sœur.'],
    ['Un enfant', 'vous pouvez indiquer l’autre parent parmi les conjoints.'],
    ['🔗 Relier à une personne existante', 'sur la fiche, pour relier deux personnes déjà saisies.'],
    ['✏️ sur un lien', 'préciser sa nature, sa certitude, ses dates (union, séparation), son lieu, ses notes et ses sources ; ou <b>✂️ Retirer ce lien</b> (les deux fiches restent).'],
    ['✓ sur un lien', 'le marquer « confirmé » d’un clic.'],
  ]],
  ['astuce', 'Une personne a déjà deux parents ? Pour un beau-parent ou une famille d’accueil, choisissez simplement la nature correspondante.'],
]},

{ id: 'certitude', em: '✓', t: 'Certitudes et sources', chapo: 'Des faits, pas des suppositions.', b: [
  ['p', 'Chaque date, lieu, lien et événement porte un niveau de certitude. Tout commence <b>« à vérifier »</b>, et <b>c’est vous qui décidez</b>.'],
  ['liste', [
    ['✓ Confirmé', 'vous le savez, ou une source le prouve.'],
    ['◐ Probable', 'c’est très vraisemblable.'],
    ['? À vérifier', 'à confirmer un jour.'],
    ['≈ Approximatif', 'la date ou le lieu sont à peu près justes.'],
    ['❦ Tradition familiale', 'ce qui se transmet à l’oral.'],
  ]],
  ['p', 'Le bouton <b>✓ Confirmer</b> (sur la fiche et dans « À compléter ») marque une information « confirmée » en un clic, avec <b>Annuler</b> juste après.'],
  ['sous', 'Les sources'],
  ['p', 'Une source garde la trace de <b>d’où vient</b> l’information : témoignage familial, document officiel, archive, photo, recherche personnelle, autre. Ajoutez-en depuis la fiche (<b>＋ Ajouter une source</b>) ou depuis <b>📜 Documents & sources</b>, avec qui témoigne, la date, la référence (cote d’archive, registre, page…) et les fiches qu’elle appuie.'],
  ['astuce', 'Un témoignage compte aussi : « Man Rose me l’a raconté en 2012 » est déjà une source.'],
]},

{ id: 'histoires', em: '📖', t: 'Nos histoires et les témoignages', chapo: 'Les récits qu’on ne veut pas perdre.', b: [
  ['etapes', [
    'Cliquez <b>✍️ Raconter une histoire</b> (accueil, Nos histoires, ou la fiche d’une personne).',
    'Un titre, un genre, et l’histoire, racontée comme vous le diriez à voix haute.',
    'Cochez les personnes concernées ; ajoutez si vous voulez quand et où.',
    'Choisissez d’où vient ce récit (tradition familiale, confirmé…) et qui peut le voir.',
  ]],
  ['liste', [
    ['Les genres', 'récit de famille, souvenir d’enfance, histoire de migration, recette, tradition, fête, chanson, expression ou dicton, anecdote, témoignage. Les pastilles en haut de Nos histoires filtrent par genre.'],
    ['🎙️ Témoignage audio', 'enregistrer au micro ou importer un fichier audio. Il faut d’abord cocher l’<b>accord de la personne enregistrée</b> et noter son nom : sans cela, les boutons restent grisés.'],
    ['Citations', 'les expressions notées sur les fiches s’affichent aussi en bas de Nos histoires.'],
  ]],
  ['astuce', 'Commencez par un tout petit souvenir : une odeur de cuisine, une phrase de grand-mère, un départ en bateau…'],
]},

{ id: 'photos', em: '🖼️', t: 'Photos et albums', chapo: 'Les photos de famille, rangées et légendées.', b: [
  ['etapes', [
    'Cliquez <b>📷 Ajouter des photos</b> et choisissez-en une ou plusieurs.',
    'Ajoutez une légende, les <b>personnes présentes</b>, une date (même approximative), un lieu, un événement et le souvenir associé : tout cela s’applique à toutes les photos choisies.',
    'Rangez-les dans un ou plusieurs albums, ou tapez le nom d’un <b>＋ Nouvel album</b>.',
  ]],
  ['liste', [
    ['📚 Albums', 'Mariages, Anniversaires, Vacances, Enfance, Générations, Traditions… ou les vôtres, avec un emoji et une description.'],
    ['Les classements', 'toutes les photos, par personne, branche, année, lieu, événement, génération.'],
    ['À identifier', 'les photos où personne n’est encore nommé. Demandez aux anciens !'],
    ['⭐ Couverture de l’album', 'dans la photo ouverte, pour choisir l’image de l’album.'],
    ['⬇️ Enregistrer sur l’ordinateur', 'récupérer la photo en fichier.'],
  ]],
  ['sous', 'L’amélioration (facultative)'],
  ['p', '<b>✨ Améliorer la photo</b> propose la netteté, une correction légère de la lumière, une restauration légère (grain, petites taches) ou une colorisation douce. C’est fait dans le navigateur : la photo n’est envoyée nulle part. <b>L’original est toujours gardé</b> : vous pouvez afficher l’un ou l’autre, ou supprimer la version améliorée.'],
  ['exemple', 'Une version améliorée ou colorisée est une interprétation visuelle, pas une reconstitution historique : une mention l’accompagne partout où elle apparaît, à l’écran comme dans le livre de famille.'],
]},

{ id: 'documents', em: '📜', t: 'Documents et sources', chapo: 'Les papiers de famille, à l’abri.', b: [
  ['etapes', [
    'Cliquez <b>📜 Ajouter un document</b>.',
    'Choisissez le type : livret de famille, acte de naissance, de mariage ou de décès, certificat, diplôme, livret militaire, lettre, carte postale, arbre dessiné, coupure de presse, document ancien…',
    'Joignez le fichier (<b>PDF ou image</b>), la date, le lieu, les personnes concernées, et <b>où se trouve l’original</b> (« chez tante Marie », « Archives de Martinique, registre 1928 »).',
  ]],
  ['liste', [
    ['En faire une source', 'cochée par défaut : le document devient une source pour les personnes cochées (officielle pour un acte ou un livret).'],
    ['Ouvrir un document', 'il s’affiche dans la fenêtre ; <b>⬇️ Enregistrer le fichier</b> le récupère.'],
    ['🔒 Moi seul·e par défaut', 'les documents ne sont jamais partagés dans les invitations.'],
    ['📌 Sources', 'le second onglet de la page liste toutes vos sources, et combien d’informations chacune appuie.'],
  ]],
]},

{ id: 'frise', em: '⏳', t: 'La frise et la carte des lieux', chapo: 'L’histoire de la famille dans le temps et sur la carte.', b: [
  ['sous', 'La frise chronologique'],
  ['p', 'Naissances, unions, séparations, décès, événements et histoires datées, rangés par époque. Le menu filtre <b>par branche</b> ou <b>par personne</b> ; <b>＋ Événement</b> en ajoute un ; <b>🖨️ Frise imprimable</b> la prépare pour l’impression.'],
  ['sous', 'La carte des origines et des déplacements'],
  ['p', 'Les villes, régions, îles et pays de la famille, et le <b>chemin de vie</b> de chacun (naissance → déménagements, migrations, mariage… → décès). <b>🌍 Monde entier</b> ou <b>🔍 Resserrer sur nos lieux</b>.'],
  ['liste', [
    ['Les lieux reconnus', 'un répertoire intégré, sans connexion : Martinique, Guadeloupe, Alsace, France, pays…'],
    ['📍 Placer un lieu', 'pour un lieu inconnu : choisissez-le, choisissez la région de la carte, puis cliquez à l’endroit voulu.'],
  ]],
  ['astuce', 'Plus vous indiquez de lieux de naissance, de décès et d’événements, plus la carte raconte les voyages de la famille.'],
]},

{ id: 'completer', em: '🧩', t: 'À compléter', chapo: 'Ce qui manque encore, sans pression.', b: [
  ['p', 'Les compteurs en haut mènent à chaque liste : <b>propositions à valider</b>, <b>doublons</b>, <b>dates inconnues</b>, <b>liens à vérifier</b>, <b>informations à vérifier</b>, <b>photos à identifier</b>, <b>fiches sans source</b> et <b>questions</b>. Le chiffre de l’onglet en fait le total.'],
  ['sous', 'Les doublons'],
  ['liste', [
    ['Doublon possible', 'deux fiches au même nom que rien ne distingue (par exemple après un import GEDCOM).'],
    ['Comparer', 'choisissez la fiche à garder : les autres y versent ce qu’elles savent (dates, lieux, photos, histoires, liens, sources), puis disparaissent.'],
    ['Ce ne sont pas les mêmes personnes', 'NaoRoots ne les proposera plus.'],
    ['🧩 Fusionner les doublons évidents', 'd’un coup, quand c’est sûr (même fichier importé deux fois, ou même date de naissance complète) — avec <b>Annuler</b> juste après.'],
  ]],
  ['p', 'Un parent et son enfant du même nom ne sont jamais confondus. Un bandeau rappelle les doublons sur l’accueil, l’arbre et Ma famille.'],
  ['sous', 'À demander à la famille'],
  ['liste', [
    ['💬 Préparer une question', 'à propos de quelqu’un ou générale, et à qui la poser.'],
    ['Questions prêtes à poser', 'des idées selon ce qui manque (« Quel était son métier ? », « As-tu une photo ? »…) : <b>＋ Garder</b> l’ajoute à votre liste.'],
    ['La réponse', '✏️ pour la noter ; la case cochée range la question dans « déjà posées ».'],
  ]],
  ['astuce', 'Une année approximative suffit pour une date inconnue : « vers 1920 ».'],
]},

{ id: 'partage', em: '💌', t: 'Inviter un proche', chapo: 'Partager un arbre, sans rien perdre de vue.', b: [
  ['p', 'NaoRoots <b>n’envoie rien</b> : il prépare un fichier <b>.naoroots</b> que vous transmettez vous-même (clé USB, e-mail, messagerie…). Votre proche l’ouvre dans son propre NaoRoots avec <b>📂</b>.'],
  ['etapes', [
    'Cliquez <b>💌 Inviter un proche</b> (accueil ou Transmission).',
    'Indiquez son nom, votre prénom, et <b>un seul arbre</b> à partager.',
    'Choisissez ses droits et ce que contient l’invitation (dates et biographies des disparus, histoires, photos, témoignages audio).',
    'Relisez le récapitulatif, puis <b>💌 Préparer l’invitation</b> : le fichier est téléchargé.',
  ]],
  ['liste', [
    ['👀 Lecture seule', 'consulter l’arbre, sans rien modifier.'],
    ['✍️ Ajout de souvenirs', 'proposer des histoires et des photos.'],
    ['📝 Modification des profils', 'proposer aussi des corrections sur les fiches.'],
    ['🗝️ Administrateur', 'proposer aussi de nouvelles personnes. Tout reste soumis à votre validation.'],
  ]],
  ['sous', 'Quand on vous invite'],
  ['p', 'Ouvrez le fichier avec <b>📂</b> : l’arbre est rangé <b>à part du vôtre</b>, dans Transmission → Arbres reçus. Vos ajouts y sont des propositions ; <b>📤 Renvoyer mes ajouts</b> prépare un fichier à renvoyer. <b>Revenir à mon arbre</b> vous ramène chez vous.'],
  ['sous', 'Les propositions reçues'],
  ['p', 'Ouvrez le fichier de votre proche avec <b>📂</b> : ses ajouts attendent dans <b>🧩 À compléter</b>. <b>Voir</b>, <b>✓ Accepter</b> ou <b>Refuser</b> : histoires et photos arrivent « à vérifier », les corrections s’ajoutent aux notes, les personnes arrivent <b>sans lien</b> (à vous de les relier). <b>Retirer</b> une invitation refuse ses prochains ajouts.'],
  ['astuce', 'Retirer une invitation ne peut pas effacer une copie déjà transmise : choisissez bien ce que vous partagez.'],
]},

{ id: 'transmission', em: '📕', t: 'Livre, impressions & GEDCOM', chapo: 'Garder, imprimer, offrir.', b: [
  ['liste', [
    ['📕 Livre de famille', 'une couverture (titre, sous-titre, photo), l’arbre, la frise, les photos, les biographies et les histoires que vous cochez.'],
    ['🌳 Arbre imprimable', 'l’arbre tel qu’il est affiché à l’écran (vue, sens, générations).'],
    ['⏳ Frise imprimable', 'toute la chronologie.'],
  ]],
  ['p', 'Tout s’ouvre dans la fenêtre d’impression du navigateur : choisissez <b>« Enregistrer au format PDF »</b> pour obtenir un fichier à garder, offrir ou faire imprimer.'],
  ['sous', 'GEDCOM'],
  ['liste', [
    ['📤 Exporter', 'un fichier <b>.ged</b> (GEDCOM 5.5.1), le format commun des logiciels de généalogie. Vous pouvez exclure les personnes vivantes marquées « Moi seul·e ».'],
    ['📥 Importer', 'un <b>.ged</b>, ou un <b>.zip</b> avec ses photos. Tout arrive « à vérifier », avec la source « Import GEDCOM ». Les personnes déjà présentes (même fichier, ou même nom et même date de naissance) peuvent être <b>complétées au lieu d’être ajoutées deux fois</b>.'],
    ['📷 Photos du GEDCOM', 'un GEDCOM ne contient que les noms des photos : montrez le dossier, quelques fichiers ou le ZIP, et NaoRoots les rattache aux bonnes personnes (la photo principale devient le portrait). Les photos en ligne peuvent aussi être téléchargées, quand le site l’accepte.'],
  ]],
  ['astuce', 'Avant chaque impression ou export, NaoRoots vous montre les options de protection des vivants et demande votre confirmation.'],
]},

{ id: 'sauvegarde', em: '💾', t: 'Sauvegarde, synchronisation, fichiers', chapo: 'Garder la mémoire de la famille à l’abri.', b: [
  ['liste', [
    ['Où sont vos données ?', 'dans ce navigateur, sur cet ordinateur. Les <b>photos, documents et enregistrements</b> sont rangés à part, dans le navigateur aussi.'],
    ['Avec votre compte NaoGroup', 'l’arbre, les fiches, les liens, les histoires… suivent votre profil sur vos autres appareils. Les photos, documents et enregistrements, eux, <b>ne partent pas</b> en ligne : ils restent dans ce navigateur.'],
    ['💾 Sauvegarder', 'un fichier <b>.naoroots</b> avec tout votre contenu — photos, documents et enregistrements compris si vous laissez la case cochée. À garder sur une clé USB ou un disque personnel.'],
    ['📂 Ouvrir un fichier', 'recharge une sauvegarde (elle <b>remplace</b> tout le contenu actuel, après confirmation), ouvre une invitation reçue, les ajouts d’un proche, ou un GEDCOM.'],
  ]],
  ['astuce', 'La sauvegarde contient tout en clair, y compris les personnes vivantes : gardez-la pour vous. Pour partager, utilisez plutôt 💌 Inviter un proche.'],
  ['exemple', 'Avant de changer d’ordinateur, de nettoyer le navigateur ou de réinitialiser l’outil, faites une sauvegarde 💾 : c’est le seul moyen de retrouver vos photos ailleurs.'],
]},

{ id: 'corbeille', em: '🗑️', t: 'La corbeille', chapo: 'Rien ne disparaît sans votre accord.', b: [
  ['p', 'Une personne, une photo, une histoire, un document, une source, un album, un événement, un arbre ou un lien supprimé va d’abord à la <b>corbeille 🗑️</b> (en haut à droite ; le petit chiffre dit combien d’éléments y attendent). Juste après, <b>Annuler</b> le remet en place.'],
  ['liste', [
    ['↩ Restaurer', 'remet l’élément exactement où il était, à tout moment.'],
    ['Supprimer définitivement', 'l’efface pour de bon, après confirmation. Pour une personne, ses liens sont effacés aussi et elle est retirée des photos, histoires et documents.'],
    ['Vider la corbeille', 'tout effacer d’un coup, après confirmation.'],
  ]],
  ['astuce', 'Retirer un lien ne supprime aucune fiche : seul le lien entre les deux personnes va à la corbeille.'],
]},

{ id: 'prive', em: '🛡️', t: 'Vie privée et personnes vivantes', chapo: 'Notre promesse.', b: [
  ['liste', [
    ['🔒 Privé par défaut', 'aucun arbre, aucune photo, aucune histoire n’est jamais public. Rien n’est partagé sans votre confirmation.'],
    ['Moi seul·e / Proches invités', 'chaque personne, photo, histoire et document a sa confidentialité. « Moi seul·e » n’est jamais partagé, même avec un proche invité. Les documents sont « Moi seul·e » par défaut.'],
    ['🌱 Les vivants protégés', 'dans les impressions, le livre, le GEDCOM et les invitations, les personnes vivantes n’apparaissent que par leur prénom, sauf case cochée.'],
    ['🛡️ Les mineurs', 'ils apparaissent comme « Enfant », sans aucun détail, sauf case cochée.'],
    ['🔎 Des faits, pas des suppositions', 'NaoRoots n’invente aucun lien, aucune date, aucun lieu, aucune origine.'],
    ['🧬 Pas de génétique', 'pas de test ADN, et jamais d’origine déduite d’un nom, d’un visage ou d’un arbre.'],
  ]],
  ['exemple', 'Les informations de NaoRoots sont des informations familiales à vérifier, sauf lorsqu’une source officielle est ajoutée.'],
]},

{ id: 'reinit', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Repartir de zéro, comme au premier jour.', b: [
  ['p', 'Le bouton <b>♻️ Réinitialiser</b>, en haut à droite, efface <b>définitivement</b> tout ce qui a été saisi dans NaoRoots : arbres, personnes, liens, photos, albums, histoires et enregistrements, documents, sources, questions, invitations, arbres reçus, corbeille et réglages (thème, taille du texte, animations). L’outil redevient vierge, comme pour une nouvelle personne.'],
  ['etapes', [
    'Cliquez <b>♻️ Réinitialiser</b>.',
    'Gardez d’abord une copie avec le bouton <b>Sauvegarder</b> de la fenêtre : vous pourrez la recharger plus tard avec 📂.',
    'Tapez <b>EFFACER</b> dans le champ, puis <b>🗑 Tout effacer</b>.',
  ]],
  ['astuce', 'C’est aussi le moyen d’effacer la famille d’exemple pour commencer la vôtre.'],
  ['exemple', 'Ce geste ne passe pas par la corbeille et ne peut pas être annulé. Sans sauvegarde, rien ne pourra être récupéré.'],
]},

{ id: 'astuces', em: '💡', t: 'Astuces et raccourcis', chapo: 'Pour aller plus vite, et lire plus confortablement.', b: [
  ['liste', [
    ['F1 ou ?', 'ouvrir cette aide.'],
    ['Échap', 'fermer la fenêtre ouverte, ou quitter le plein écran de l’arbre.'],
    ['Ctrl + molette', 'zoomer dans l’arbre autour du pointeur.'],
    ['Entrée', 'sur une personne de l’arbre (au clavier), la met au centre.'],
    ['A+', 'agrandir le texte de tout l’outil.'],
    ['🕊️', 'mettre en pause les animations du décor (arbres qui poussent, feuilles qui tombent…).'],
    ['🌙 / ☀️', 'passer du mode sombre au mode clair ; votre choix est gardé.'],
    ['L’ouverture', 'l’arbre qui pousse à l’entrée se passe d’un clic.'],
    ['NaoGroup', 'le logo ou la pastille NaoGroup, en haut, ramène à l’accueil de la maison.'],
  ]],
  ['sous', 'Petites idées'],
  ['liste', [
    ['Commencer par les anciens', 'tant qu’ils sont là, leurs souvenirs valent tous les actes : préparez vos questions dans 🧩 À compléter.'],
    ['Nommer les branches', 'dans Mes arbres → ✏️, donnez un nom aux quatre lignées : les couleurs deviennent parlantes.'],
    ['Un portrait par personne', 'l’arbre devient tout de suite plus vivant.'],
  ]],
]},
];

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🌿</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  ouvrirModale(`<div class="aide-h">
      <div><h2 id="modaleTitre">❓ Comment ça marche</h2>
        <p class="aide-sous">Tout NaoRoots, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="aide-espace"></span>
      <input type="search" id="aide-q" placeholder="Chercher : photo, lien, GEDCOM…" aria-label="Chercher dans l’aide" autocomplete="off">
      <button type="button" class="btn fin petit" data-f="annuler">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`, f => {
    f.classList.add('aide');
    brancherForm(f);
    const nav = $('#aide-nav', f), pan = $('#aide-p', f), q = $('#aide-q', f);
    let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
    const montrer = id => {
      courant = id;
      pan.innerHTML = fiche(AIDE.find(x => x.id === id));
      pan.scrollTop = 0;
      $$('.aide-n', nav).forEach(b => { const on = b.dataset.s === id; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      const b = $(`[data-s="${id}"]`, nav); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    montrer(courant);
    nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
    /* la recherche : on garde les sujets dont le texte contient les mots tapés */
    const texteDe = s => sansAccent([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
    q.addEventListener('input', () => {
      const m = sansAccent(q.value.trim());
      let premier = null;
      for (const s of AIDE) {
        const ok = !m || texteDe(s).includes(m);
        $(`[data-s="${s.id}"]`, nav).hidden = !ok;
        if (ok && !premier) premier = s.id;
      }
      if (m && premier && premier !== courant) montrer(premier);
      if (m && !premier) pan.innerHTML = `<div class="vide">Aucun sujet ne parle de « ${esc(q.value.trim())} ». Essayez un autre mot.</div>`;
      else if (!m && !pan.querySelector('.aide-fiche')) montrer(courant);
    });
    /* sur un écran tactile, pas de clavier qui surgit à l'ouverture */
    if (!matchMedia('(pointer:fine)').matches) setTimeout(() => { q.blur(); pan.focus({ preventScroll: true }); }, 60);
  }, true);
}
ACT['aide'] = el => ouvrirAide(el && el.dataset ? el.dataset.s : undefined);
document.addEventListener('keydown', e => {
  if (document.getElementById('intro')) return;
  if (e.key === 'F1' || (e.key === '?' && !e.target.matches('input, textarea, select, [contenteditable]'))) {
    e.preventDefault();
    if ($('#modale').classList.contains('ouvert') && $('#modaleFen').classList.contains('aide')) return;
    ouvrirAide();
  }
});
