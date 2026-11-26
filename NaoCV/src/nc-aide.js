/* ============================================================
   NaoCV — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoAgenda, NaoBaby et NaoPets : sommaire à gauche,
   fiche à droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   La phrase « guide » en haut de chaque étape du CV reste là où elle est :
   cette aide explique l'outil dans son ensemble.
   ============================================================ */
'use strict';

const AIDE = [
  { id: 'debut', em: '🚀', t: 'Premiers pas', chapo: 'Ce qu’il faut savoir avant tout le reste.',
    b: [
      ['p', 'NaoCV vous aide à écrire un <b>CV clair et moderne</b>, à l’<b>adapter à chaque offre</b>, à préparer vos <b>lettres de motivation</b> et à <b>suivre vos candidatures</b> jusqu’à l’entretien. Tout reste sur cet ordinateur et fonctionne sans connexion.'],
      ['sous', 'La règle d’or'],
      ['p', '<b>NaoCV n’invente rien.</b> Aucune compétence, aucun diplôme, aucun chiffre, aucune motivation n’est ajouté à votre place. Ce qui manque devient un <b>[emplacement à compléter]</b>, jamais une affirmation : chaque mot vient de vous.'],
      ['sous', 'Pour démarrer'],
      ['etapes', [
        'Cliquez <b>✨ Créer mon CV</b>, en haut à droite ou sur l’accueil.',
        'Suivez les <b>10 étapes</b> une par une : coordonnées, poste et accroche, expériences, formation… L’<b>aperçu A4</b> se met à jour à chaque lettre tapée.',
        'Choisissez un <b>modèle</b> et des <b>couleurs</b> à l’étape Style — pourquoi pas celles de l’entreprise visée.',
        'À l’étape <b>Vérifier & exporter</b>, corrigez ce qui est signalé, puis téléchargez votre CV en <b>PDF</b> ou en <b>Word</b>.',
      ]],
      ['p', 'Vous avez déjà un CV ? <b>📥 Importer un CV</b> le lit (PDF, Word, photo ou texte) et le range par rubriques. Envie de voir l’outil rempli d’abord ? Sur un accueil vierge, <b>Voir un exemple</b> charge le CV de Camille, une version à part que vous supprimez quand vous voulez.'],
      ['sous', 'Les onglets'],
      ['liste', [
        ['🏠 Accueil', 'votre accompagnement pas à pas et un résumé de tout le reste.'],
        ['📝 Mon CV', 'l’éditeur guidé en 10 étapes, avec l’aperçu en direct.'],
        ['🗂️ Mes versions', 'une version du CV par métier, par offre ou par entreprise.'],
        ['🎯 Adapter à une offre', 'collez une annonce : NaoCV la compare à votre CV.'],
        ['✉️ Lettres', 'vos lettres de motivation, paragraphe par paragraphe.'],
        ['📋 Candidatures', 'le tableau de suivi : statut, relance, entretien.'],
        ['📅 Entretiens & relances', 'le calendrier du mois et ce qui arrive.'],
        ['✅ Prêt à envoyer', 'la checklist finale et tous les exports.'],
      ]],
      ['astuce', 'Tout s’enregistre tout seul, au fil de la saisie. Pensez quand même à <b>💾</b> de temps en temps pour garder une copie de vos CV dans un fichier.'],
    ] },

  { id: 'accueil', em: '🏠', t: 'L’accueil et votre accompagnement', chapo: 'Où vous en êtes, et ce qui vient ensuite.',
    b: [
      ['liste', [
        ['Les raccourcis', 'créer un CV, importer un CV, ajouter une expérience, analyser une offre ou créer une lettre, en un clic.'],
        ['Votre accompagnement', '9 étapes, du premier mot à la première candidature : coordonnées, poste et accroche, expériences, formation, compétences et langues, style, vérification, lettre, candidature. Le pourcentage et la jauge avancent avec vous.'],
        ['Prochaine étape', 'le gros bouton vous emmène directement à ce qui reste à faire. Chaque pastille du chemin est aussi cliquable.'],
      ]],
      ['sous', 'Les cartes'],
      ['liste', [
        ['📝 Mon CV principal', 'sa miniature, son modèle, ses couleurs et son score de vérification ; « Modifier » ou « Exporter ».'],
        ['🗂️ Mes versions de CV', 'les dernières versions, et « + Nouvelle version ».'],
        ['🎯 Adapter mon CV à une offre', 'le chemin vers l’analyse d’annonce.'],
        ['📋 Mes candidatures en cours', 'une barre par statut.'],
        ['📅 Mes entretiens et relances', 'les prochaines dates ; la carte s’allume quand une relance est à faire.'],
        ['✉️ Mes lettres de motivation', 'les quatre dernières, à rouvrir d’un clic.'],
        ['📦 Mes documents prêts à envoyer', 'les CV et lettres dont la vérification est au vert, avec leur nom de fichier.'],
      ]],
      ['astuce', 'Cliquer sur la grande feuille de l’accueil ouvre directement votre CV.'],
    ] },

  { id: 'etapes', em: '📝', t: 'Mon CV : les 10 étapes', chapo: 'Un CV complet, sans page blanche.',
    b: [
      ['p', 'À gauche, la liste des étapes ; au centre, le formulaire, avec une phrase qui vous guide ; à droite, l’<b>aperçu A4</b> en direct. Les boutons <b>← précédente</b> et <b>suivante →</b> en bas du formulaire font avancer pas à pas, mais vous pouvez sauter à n’importe quelle étape.'],
      ['liste', [
        ['👤 Coordonnées', 'prénom, nom, ville, téléphone, e-mail ; LinkedIn et portfolio si vous voulez ; une photo facultative.'],
        ['🎯 Poste & accroche', 'le titre du poste visé et 2 à 4 lignes de profil (idéalement 200 à 450 caractères).'],
        ['💼 Expériences', 'emploi, stage, alternance, job étudiant, bénévolat : tout compte.'],
        ['🎓 Formation', 'diplômes, titres et formations, même en cours.'],
        ['🧩 Compétences', 'techniques, relationnelles et logiciels.'],
        ['🌍 Langues & certifications', 'un niveau honnête pour chaque langue ; TOEIC, PIX, CACES, SST…'],
        ['✨ Projets & intérêts', 'facultatif, mais précieux.'],
        ['🚗 Infos pratiques', 'permis, mobilité, disponibilité — facultatif.'],
        ['🎨 Style & couleurs', 'modèle, couleurs, police, version visuelle ou ATS.'],
        ['✅ Vérifier & exporter', 'la checklist, la relecture et les téléchargements.'],
      ]],
      ['sous', 'Ce que disent les pastilles'],
      ['liste', [
        ['✓', 'l’étape est complète.'],
        ['Numéro coloré', 'l’étape est commencée.'],
        ['« facultatif »', 'l’étape peut rester vide sans souci.'],
      ]],
      ['sous', 'L’aperçu'],
      ['p', 'Au-dessus de l’aperçu, la bascule <b>🎨 Visuel / 🤖 CV ATS</b> montre l’une ou l’autre version, le <b>nombre de pages</b> s’affiche (il passe en orange au-delà de 2), et <b>⬇️ Exporter</b> ouvre les téléchargements. Sur téléphone, le bouton <b>👁️ Aperçu</b> passe du formulaire à l’aperçu et inversement.'],
      ['astuce', 'En haut de l’éditeur, le menu 🗂️ choisit la <b>version</b> que vous modifiez ; l’étoile ★ marque votre CV principal.'],
    ] },

  { id: 'experiences', em: '💼', t: 'Expériences et formations', chapo: 'Votre parcours, du plus récent au plus ancien.',
    b: [
      ['etapes', [
        'À l’étape Expériences, cliquez <b>+ Ajouter une expérience</b>.',
        'Indiquez le poste, l’entreprise, la ville, le type de contrat et les dates. Pour un poste actuel, cochez <b>Poste actuel (en cours)</b>.',
        'Écrivez vos <b>missions, une par ligne</b>, avec vos mots : « je m’occupais de la caisse » convient très bien.',
        'Cliquez <b>✨ Reformuler mes missions</b> pour des formulations professionnelles, puis <b>Enregistrer</b>.',
      ]],
      ['liste', [
        ['Outils, compétences, résultats', 'trois champs facultatifs. Les résultats sont uniquement des résultats réels : NaoCV n’ajoute jamais de chiffre à votre place.'],
        ['Couleurs de l’entreprise', 'pour une centaine d’entreprises connues, la couleur est trouvée toute seule ; sinon choisissez-la, ou <b>📷 importez son logo</b> pour qu’elle en soit extraite. Elle colore le monogramme et le nom de l’entreprise sur le CV.'],
        ['↑ ↓', 'déplacent une expérience ou une formation dans la liste.'],
        ['↕️ Trier', 'remet tout du plus récent au plus ancien en un clic.'],
        ['✏️ / 🗑️', 'modifier ou supprimer.'],
      ]],
      ['sous', 'Les formations'],
      ['p', 'Même principe : diplôme, établissement, ville, mention, dates (cochez <b>Formation en cours</b> si besoin) et quelques détails — spécialité, matières clés, rythme d’alternance.'],
      ['astuce', 'Une expérience avec des missions « vagues » est signalée par ⚠️ dans la liste : un passage par ✨ Reformuler suffit souvent.'],
    ] },

  { id: 'reformuler', em: '✨', t: 'Reformuler ses missions', chapo: 'Vos mots, en version professionnelle — sans rien inventer.',
    b: [
      ['p', 'Dans la fenêtre d’une expérience, <b>✨ Reformuler mes missions</b> propose, pour chaque ligne, jusqu’à trois formulations : <b>Simple</b>, <b>Professionnelle</b> et <b>Impactante</b>, toutes commencées par un verbe d’action.'],
      ['exemple', '« je m’occupais de la caisse » → Gérer la caisse · Assurer la gestion des encaissements · Piloter les encaissements.'],
      ['sous', 'Les conseils qui accompagnent chaque ligne'],
      ['liste', [
        ['⚠️ Verbe peu précis', '« faire », « s’occuper de », « aider »… : un verbe plus juste est proposé.'],
        ['⚠️ Ligne très courte', 'précisez pour qui, avec quels outils, à quelle fréquence.'],
        ['⚠️ Formulation vague', '« divers », « tâches »… : décrivez l’action précise.'],
        ['💡 Un repère réel', 'un volume, une fréquence, une taille d’équipe — seulement si vous le connaissez.'],
      ]],
      ['p', 'Cliquez une formulation pour <b>remplacer la ligne</b>. Vous pouvez ensuite la retoucher librement dans la zone des missions.'],
      ['astuce', 'Relisez toujours la proposition : elle doit rester fidèle à ce que vous avez réellement fait. Une finalité générique (« pour fidéliser la clientèle »…) est signalée : gardez-la seulement si elle est vraie.'],
    ] },

  { id: 'contenu', em: '🧩', t: 'Accroche, compétences et langues', chapo: 'Les rubriques qui font la différence.',
    b: [
      ['sous', 'L’accroche'],
      ['p', 'Deux à quatre lignes : qui vous êtes, ce que vous savez faire, ce que vous cherchez. Sous le champ, un compteur de caractères ; à côté, des <b>💡 idées d’accroche</b> construites <b>uniquement avec ce que vous avez saisi</b>. <b>Utiliser</b> en reprend une, à personnaliser ensuite avec vos mots.'],
      ['sous', 'Les compétences'],
      ['liste', [
        ['Trois familles', 'compétences techniques (savoir-faire du métier), relationnelles (savoir-être) et logiciels maîtrisés.'],
        ['Ajouter', 'tapez puis <kbd>Entrée</kbd> ; plusieurs d’un coup en les séparant par des virgules.'],
        ['Suggestions', 'les pastilles « + » proposent des compétences proches de votre métier. Cliquez seulement sur ce que vous maîtrisez réellement.'],
        ['×', 'retire une compétence.'],
      ]],
      ['sous', 'Langues, certifications, projets, centres d’intérêt'],
      ['p', 'Chaque langue a son niveau, de « Débutant (A1) » à « Langue maternelle ». Une certification s’accompagne de son organisme et de son année. Un projet a un titre, un contexte, une description et un lien éventuel. Pour les centres d’intérêt, soyez précis : « Trail, 3 courses par an » plutôt que « Sport ».'],
      ['sous', 'Infos pratiques'],
      ['p', 'Permis, mobilité et disponibilité, avec des propositions toutes prêtes (« Permis B », « immédiate », « rythme 3 semaines entreprise / 1 semaine école »…). Seulement si vous le souhaitez.'],
    ] },

  { id: 'style', em: '🎨', t: 'Modèles et couleurs', chapo: 'Un CV qui vous ressemble — ou qui ressemble à l’entreprise visée.',
    b: [
      ['sous', 'Dix modèles'],
      ['liste', [
        ['Classique', 'une colonne, sobre et intemporel.'],
        ['Moderne', 'colonne latérale aux couleurs choisies.'],
        ['Élégant', 'en-tête centré, filets fins, petites capitales.'],
        ['Créatif', 'bandeau affirmé et frise chronologique.'],
        ['Minimaliste', 'beaucoup d’air, une seule touche de couleur.'],
        ['Professionnel', 'filet de marque, colonne à droite.'],
        ['Étudiant', 'la formation et les projets d’abord.'],
        ['Alternance', 'rythme et disponibilité mis en avant.'],
        ['Cadre', 'en-tête sombre, résultats clés en tête.'],
        ['Reconversion', 'les compétences transférables d’abord.'],
      ]],
      ['sous', 'La couleur'],
      ['p', 'Dix teintes discrètes (bleu marine, pétrole, bordeaux, lilas NaoGroup…), ou <b>Personnalisée</b> pour choisir la vôtre.'],
      ['sous', 'Aux couleurs d’une entreprise'],
      ['etapes', [
        'Cliquez une entreprise proposée (celle visée ou celles de vos expériences), ou tapez son nom puis <b>Appliquer</b>.',
        'Si elle fait partie des entreprises connues, ses deux couleurs s’appliquent aussitôt.',
        'Sinon, réglez la <b>couleur principale</b> et la <b>couleur secondaire</b>, ou cliquez <b>📷 Depuis un logo</b> : NaoCV en extrait les teintes dominantes.',
        '<b>Retirer</b> revient à une couleur neutre.',
      ]],
      ['astuce', 'Une couleur trop claire (jaune, orange vif) est assombrie automatiquement pour rester lisible. Les couleurs connues sont indicatives : vérifiez-les.'],
      ['sous', 'Les réglages'],
      ['liste', [
        ['Police', 'dix polices pour la version visuelle.'],
        ['Couleurs et monogrammes', 'affiche ou non la couleur de chaque entreprise dans vos expériences.'],
        ['Afficher ma photo', 'apparaît une fois la photo ajoutée à l’étape Coordonnées.'],
      ]],
    ] },

  { id: 'ats', em: '🤖', t: 'Version visuelle ou version ATS', chapo: 'Un CV pour les yeux, un CV pour les logiciels de tri.',
    b: [
      ['p', 'Beaucoup de sites d’emploi passent les CV dans un <b>logiciel de tri</b> (ATS) avant qu’un humain ne les lise. Ces logiciels lisent mal les colonnes, les tableaux et les icônes. NaoCV prépare donc, à partir des mêmes informations, une <b>version ATS</b> :'],
      ['liste', [
        ['Une seule colonne', 'avec des titres standards (Expérience professionnelle, Formation…).'],
        ['Une police simple', 'Arial, Calibri, Georgia, Tahoma ou Verdana.'],
        ['Les coordonnées dans le corps', 'pas dans un en-tête.'],
        ['Rien de décoratif', 'ni photo, ni tableau, ni icône, ni barre de niveau.'],
      ]],
      ['p', 'La bascule <b>🎨 Visuel / 🤖 CV ATS</b> est au-dessus de l’aperçu et à l’étape Style. Rien n’est perdu en passant de l’une à l’autre.'],
      ['sous', 'Laquelle envoyer ?'],
      ['liste', [
        ['Formulaire en ligne, site d’emploi', 'la version ATS.'],
        ['E-mail à un recruteur, main propre', 'la version visuelle.'],
        ['L’annonce précise un format', 'suivez toujours la consigne.'],
      ]],
    ] },

  { id: 'verif', em: '✅', t: 'Vérifier son CV', chapo: 'Ce qu’un recruteur remarquerait, repéré avant lui.',
    b: [
      ['p', 'La dernière étape de l’éditeur donne un <b>score</b> et une checklist, pour la version affichée (visuelle ou ATS). Le CV est « prêt à envoyer » quand il ne reste plus de point rouge.'],
      ['liste', [
        ['Titre professionnel', 'le poste visé est-il indiqué ?'],
        ['Coordonnées complètes', 'prénom, nom, téléphone, e-mail valide et ville.'],
        ['Profil / accroche', 'présente, et pas trop longue.'],
        ['Expériences compréhensibles', 'chacune avec un poste, une entreprise et des missions.'],
        ['Dates cohérentes', 'pas de fin avant le début, pas de date manquante.'],
        ['Ordre antéchronologique', 'du plus récent au plus ancien — le bouton <b>Trier</b> s’en charge.'],
        ['Formulations claires', 'les missions vagues sont signalées.'],
        ['Compétences', 'au moins quatre compétences et logiciels.'],
        ['Orthographe et typographie', 'les fautes fréquentes repérées dans tout le CV.'],
      ]],
      ['p', 'À côté de chaque point à reprendre, <b>Corriger</b> vous emmène à la bonne étape. Dans la <b>🔤 Relecture</b>, <b>Corriger partout</b> remplace une faute dans tout le CV d’un coup.'],
      ['astuce', 'La relecture repère les fautes les plus courantes ; le correcteur de votre navigateur souligne le reste en rouge dans les champs. Une dernière lecture à voix haute reste la meilleure vérification.'],
    ] },

  { id: 'export', em: '⬇️', t: 'Exporter en PDF et en Word', chapo: 'Des fichiers propres, au bon nom.',
    b: [
      ['p', 'Le bouton <b>⬇️ Exporter</b> (au-dessus de l’aperçu, dans Mes versions ou sur l’accueil) propose quatre fichiers :'],
      ['liste', [
        ['🎨 PDF visuel', 'votre CV tel que vous le voyez.'],
        ['🤖 PDF ATS', 'une colonne, texte sélectionnable.'],
        ['📝 Word · DOCX', 'un document Word modifiable, en une colonne.'],
        ['📄 DOCX ATS', 'la même chose, sans couleur.'],
      ]],
      ['sous', 'Le PDF, pas à pas'],
      ['p', 'Le PDF passe par la fenêtre d’impression de votre navigateur. La première fois, NaoCV vous rappelle les bons réglages :'],
      ['etapes', [
        'Destination : <b>« Enregistrer au format PDF »</b>.',
        'Format <b>A4</b>, marges par défaut ou aucune.',
        'Décochez <b>« En-têtes et pieds de page »</b> et cochez <b>« Graphiques d’arrière-plan »</b> pour garder les couleurs.',
        'Le nom du fichier est déjà proposé : il suffit de valider.',
      ]],
      ['p', 'Le PDF obtenu contient du vrai texte, sélectionnable — jamais une image. Le fichier Word, lui, se télécharge directement.'],
      ['exemple', 'Noms proposés : CV_Camille_Martin_Assistante-commerciale.pdf · Lettre_Motivation_Camille_Martin_Decathlon.pdf'],
      ['astuce', 'Si la vérification signale encore des points, la fenêtre d’export le dit, avec un lien pour les voir. Vous pouvez tout de même exporter.'],
    ] },

  { id: 'versions', em: '🗂️', t: 'Mes versions de CV', chapo: 'Un même parcours, plusieurs mises en avant.',
    b: [
      ['p', 'Une version par métier, par offre ou par entreprise : chacune garde son contenu, son modèle et ses couleurs. Les candidatures retiennent quelle version vous avez envoyée.'],
      ['etapes', [
        'Cliquez <b>+ Nouvelle version</b> (accueil, Mes versions ou éditeur).',
        'Donnez-lui un nom, le poste et, si vous voulez, l’entreprise visée.',
        'Partez d’une <b>copie de votre CV principal</b> (recommandé) ou d’un <b>CV vierge</b>.',
        'Laissez cochée l’option pour <b>habiller le CV aux couleurs de l’entreprise</b>, si elles sont connues.',
      ]],
      ['liste', [
        ['Modifier', 'ouvre la version dans l’éditeur.'],
        ['Dupliquer', 'crée une copie à retoucher.'],
        ['Renommer', 'change le nom, le poste ou l’entreprise visés.'],
        ['★ Principal', 'en fait votre CV principal, celui de l’accueil.'],
        ['Exporter', 'les quatre téléchargements.'],
        ['Supprimer', 'efface la version ; les candidatures liées gardent leur historique.'],
      ]],
      ['p', 'Chaque carte affiche le modèle, la marque, le score de vérification (ou « ✓ prêt ») et le nombre de candidatures qui l’utilisent.'],
    ] },

  { id: 'importer', em: '📥', t: 'Importer un ancien CV', chapo: 'Repartir de ce que vous avez déjà.',
    b: [
      ['etapes', [
        'Cliquez <b>📥 Importer un CV</b> (raccourci de l’accueil ou Mes versions).',
        'Choisissez un fichier — <b>PDF</b>, <b>Word (.docx)</b>, <b>photo ou capture d’écran</b>, <b>.txt</b> — ou déposez-le sur la zone de texte, ou collez directement le texte.',
        'Le texte lu s’affiche d’abord : <b>relisez-le et corrigez-le</b> si besoin.',
        'Choisissez : <b>créer une nouvelle version</b>, ou <b>remplacer le contenu de votre CV principal</b> (son style est conservé).',
        'Cliquez <b>Importer et restructurer</b> : NaoCV range le texte par rubriques, puis vous vérifiez chaque étape.',
      ]],
      ['liste', [
        ['PDF scanné ou photo', 'lu par reconnaissance de texte, directement dans votre navigateur : l’image n’est envoyée nulle part. La première fois, le moteur de lecture se télécharge (connexion Internet nécessaire).'],
        ['Ancien Word (.doc)', 'pas lisible : enregistrez-le d’abord en .docx ou en PDF depuis Word.'],
      ]],
      ['astuce', 'Une photo floue ou penchée donne des erreurs de lecture : préférez le PDF ou le Word d’origine quand vous l’avez.'],
    ] },

  { id: 'offre', em: '🎯', t: 'Adapter son CV à une offre', chapo: 'Voir ce que l’annonce attend — et n’ajouter que ce qui est vrai.',
    b: [
      ['etapes', [
        'Dans <b>🎯 Adapter à une offre</b>, choisissez le <b>CV à comparer</b> et indiquez l’<b>entreprise qui recrute</b>.',
        'Collez le <b>texte complet de l’annonce</b> : intitulé, missions, profil recherché.',
        'Cliquez <b>🔎 Analyser l’offre</b>.',
      ]],
      ['sous', 'Ce que vous obtenez'],
      ['liste', [
        ['Un score sur 100', 'de « correspondance faible » à « très bonne correspondance ». Il est <b>indicatif</b> : il aide à voir quoi clarifier, il ne garantit ni entretien ni embauche.'],
        ['🔑 Les mots-clés', 'logiciels, compétences, qualités, langues : ✓ déjà dans votre CV, ○ absents. Le « + » ajoute un mot-clé au CV — <b>seulement s’il correspond à votre expérience réelle</b>, une confirmation vous le rappelle.'],
        ['📋 Les missions repérées', 'ce que le poste demande au quotidien.'],
        ['🧭 Les axes d’amélioration', 'quoi renforcer en priorité.'],
        ['✍️ Les propositions', 'le titre de l’annonce, une accroche adaptée (modifiable) et vos missions remises dans l’ordre le plus pertinent.'],
      ]],
      ['sous', 'Créer la version adaptée'],
      ['p', 'Cochez ce que vous voulez reprendre — titre, accroche, ordre des missions, <b>couleurs de l’entreprise</b> — et, si vous le souhaitez, <b>ajouter la candidature au suivi</b> et <b>préparer une lettre</b>. <b>Créer la version adaptée</b> fait tout d’un coup, puis vous ouvre la nouvelle version pour la relire.'],
      ['astuce', 'Votre CV d’origine n’est jamais modifié par l’analyse : c’est une nouvelle version qui est créée.'],
    ] },

  { id: 'lettres', em: '✉️', t: 'Lettres de motivation', chapo: 'Trois temps : pourquoi ce poste, ce que vous apportez, la demande d’entretien.',
    b: [
      ['etapes', [
        'Cliquez <b>+ Créer une lettre</b> : elle part du CV choisi, avec son poste et son entreprise visés.',
        'Vérifiez l’entreprise, le poste et la formule d’appel. En format développé, complétez l’en-tête : destinataire, service, adresse, lieu, date, objet.',
        'Choisissez le <b>ton</b> et le <b>format</b>.',
        'Écrivez, <b>avec vos mots</b>, ce qui vous attire dans ce poste ou cette entreprise. Ajoutez si vous voulez un exemple concret, et le texte de l’offre.',
        'Cliquez <b>✨ Générer la lettre</b>, puis relisez et modifiez chaque paragraphe.',
      ]],
      ['liste', [
        ['5 tons', 'professionnel, chaleureux, direct, dynamique, plus formel.'],
        ['2 formats', 'courte pour une candidature en ligne (visez 120 à 220 mots), développée pour un e-mail ou un dossier (250 à 420 mots). Le compteur de mots est au-dessus de l’aperçu.'],
        ['↻', 'une nouvelle proposition pour un seul paragraphe.'],
        ['🗑️ / + Paragraphe', 'retirer ou ajouter un paragraphe.'],
        ['Les [crochets surlignés]', 'ce qui manque et que vous seul·e pouvez écrire. L’étiquette indique combien il en reste ; « ✓ Prête » quand tout est complété.'],
      ]],
      ['p', 'Exportez la lettre avec <b>⬇️ PDF</b> ou <b>⬇️ DOCX</b>. Le menu ✉️ en haut passe d’une lettre à l’autre.'],
      ['astuce', 'NaoCV n’invente jamais votre motivation : laissé vide, ce champ devient un [emplacement à compléter] dans la lettre. Régénérer remplace vos modifications de paragraphes — une confirmation vous le rappelle.'],
    ] },

  { id: 'candidatures', em: '📋', t: 'Le suivi des candidatures', chapo: 'Ne plus oublier une relance, savoir ce que vous avez envoyé.',
    b: [
      ['p', 'Cliquez <b>+ Ajouter une candidature</b> : poste, entreprise, lien de l’offre, type de contrat, statut, dates, CV et lettre utilisés, notes personnelles.'],
      ['sous', 'Les 8 statuts'],
      ['liste', [
        ['À préparer', 'pas encore envoyée.'],
        ['Candidature envoyée', 'la date d’envoi se remplit toute seule, et la <b>relance est proposée 10 jours après</b>.'],
        ['Relance à faire', 'elle apparaît dans les rappels.'],
        ['Entretien prévu', 'NaoCV vous demande aussitôt la date et l’heure.'],
        ['En attente de réponse', 'la balle est dans leur camp.'],
        ['Réponse positive · négative · archivée', 'la candidature sort des relances.'],
      ]],
      ['liste', [
        ['Changer de statut', 'directement dans le tableau, avec le menu de la ligne.'],
        ['Les filtres', 'au-dessus du tableau, pour ne voir qu’un statut.'],
        ['🔔 Les relances dues', 'un bandeau les liste ; un petit nombre s’affiche aussi sur l’onglet Candidatures, et un message les rappelle à l’ouverture de NaoCV.'],
      ]],
      ['astuce', 'Une relance, c’est un e-mail court et poli, 7 à 10 jours après l’envoi. Notez dans « Notes personnelles » le nom de votre contact et vos impressions.'],
    ] },

  { id: 'calendrier', em: '📅', t: 'Entretiens et relances', chapo: 'Votre mois de recherche, d’un coup d’œil.',
    b: [
      ['p', 'Le calendrier est rempli automatiquement à partir du suivi des candidatures : <b>🤝 entretiens</b>, <b>🔔 relances</b> et <b>📤 envois</b>. Rien à saisir deux fois.'],
      ['liste', [
        ['‹ ›', 'changent de mois ; <b>Aujourd’hui</b> revient au mois en cours.'],
        ['Un clic sur un événement', 'ouvre la candidature pour la modifier.'],
        ['À venir', 'à droite, les prochains entretiens et relances, avec le nombre de jours restants.'],
      ]],
      ['astuce', 'Une relance n’apparaît plus une fois la candidature terminée (réponse positive, négative ou archivée).'],
    ] },

  { id: 'prets', em: '📦', t: 'Prêt à envoyer', chapo: 'La checklist finale, avant d’appuyer sur « Envoyer ».',
    b: [
      ['p', 'L’onglet <b>✅ Prêt à envoyer</b> reprend chaque CV avec <b>deux scores</b> — version visuelle et version ATS —, les trois premiers points à reprendre et le nom de fichier proposé. Les boutons exportent directement en PDF visuel, PDF ATS ou DOCX ; <b>Vérifier</b> ouvre la checklist détaillée.'],
      ['p', 'En dessous, vos lettres : ton, format, éléments restant à compléter, et leurs exports.'],
      ['sous', 'Avant l’envoi'],
      ['liste', [
        ['Le nom du fichier', 'professionnel : CV_Prenom_Nom_Poste.pdf.'],
        ['Le format', 'celui demandé par l’annonce (PDF ou DOCX).'],
        ['L’e-mail d’accompagnement', 'court : objet clair, 3 à 5 lignes, pièces jointes nommées.'],
        ['Le suivi', 'la candidature ajoutée au tableau, avec une date de relance.'],
      ]],
    ] },

  { id: 'donnees', em: '💾', t: 'Sauvegarde, synchronisation et export', chapo: 'Où sont vos CV, et comment les mettre à l’abri.',
    b: [
      ['p', 'Tout ce que vous saisissez s’enregistre <b>automatiquement</b>, au fil de la frappe, dans le navigateur de cet ordinateur.'],
      ['liste', [
        ['Avec votre profil NaoGroup', 'si vous êtes connecté·e, votre sauvegarde NaoCV suit votre profil : vous la retrouvez sur vos autres appareils, et chaque profil a son propre espace.'],
        ['En mode visite', 'l’outil s’ouvre vierge, rien n’est envoyé, et tout est effacé à la visite suivante.'],
        ['💾 Sauvegarder', 'télécharge un fichier <b>NaoCV_sauvegarde_date.json</b> avec tous vos CV, versions, lettres et candidatures.'],
        ['📂 Recharger', 'remplace vos données par celles d’un fichier de sauvegarde, sur cet ordinateur ou un autre (une confirmation vous est demandée).'],
        ['Exporter vos documents', 'les CV et lettres se téléchargent en PDF et en Word : voir « Exporter en PDF et en Word ».'],
      ]],
      ['astuce', 'Les photos et logos sont réduits avant d’être gardés, mais prennent de la place. Si NaoCV affiche « Espace plein », retirez une image trop lourde, ou faites 💾.'],
      ['p', 'Faites une sauvegarde de temps en temps, et toujours avant de changer d’ordinateur ou de nettoyer votre navigateur.'],
    ] },

  { id: 'reinit', em: '🧹', t: 'Réinitialiser l’outil', chapo: 'Repartir d’un NaoCV tout neuf.',
    b: [
      ['p', 'Le bouton <b>🧹</b>, en haut à droite, rend NaoCV <b>vierge</b>, comme pour une nouvelle personne. Avant d’effacer, une fenêtre vous montre ce qui va disparaître :'],
      ['liste', [
        ['Vos CV et leurs versions', 'photos et logos compris.'],
        ['Vos lettres de motivation', 'toutes, prêtes ou non.'],
        ['Vos candidatures', 'avec leurs relances et entretiens.'],
        ['Le reste', 'l’offre analysée, le thème et les réglages.'],
      ]],
      ['etapes', [
        'Cliquez <b>🧹</b>.',
        'Cliquez <b>💾 Sauvegarder d’abord</b> pour garder une copie — vous pourrez la recharger avec 📂.',
        'Cliquez <b>Tout effacer</b>. NaoCV se recharge, vide, sur l’accueil.',
      ]],
      ['astuce', 'Cette action est définitive. Seules les données de NaoCV sont effacées : les autres outils de NaoGroup ne sont pas touchés.'],
    ] },

  { id: 'astuces', em: '💡', t: 'Astuces et raccourcis', chapo: 'Les petits gestes qui font gagner du temps.',
    b: [
      ['liste', [
        ['<kbd>F1</kbd>', 'ouvre cette aide, depuis n’importe quel écran.'],
        ['<kbd>Échap</kbd>', 'ferme la fenêtre ouverte.'],
        ['<kbd>Entrée</kbd>', 'ajoute une compétence ou un centre d’intérêt tapé.'],
        ['Un clic sur l’animation d’ouverture', 'la passe ; elle est sautée si votre ordinateur demande moins d’animations.'],
        ['🕊️', 'met en pause les animations du décor (feuilles qui dérivent, enveloppes qui s’envolent).'],
        ['☾ ☀', 'thème sombre ou clair, à votre goût.'],
        ['Le logo NaoCV', 'ramène à NaoGroup.'],
      ]],
      ['sous', 'Pour un CV qui se fait remarquer'],
      ['liste', [
        ['Une page, deux au maximum', 'le compteur de pages passe en orange au-delà.'],
        ['Une mission = un verbe d’action', 'et un détail concret quand vous le connaissez.'],
        ['Une version par type de poste', 'plutôt qu’un CV unique qui dit tout.'],
        ['Des compétences précises', '« Facturation » vaut mieux que « Gestion ».'],
      ]],
      ['astuce', 'Suivez toujours le format demandé dans l’annonce. Sans consigne, le PDF garde votre mise en page intacte ; sur un formulaire en ligne, préférez la version ATS.'],
    ] },

  { id: 'questions', em: '💬', t: 'Questions fréquentes', chapo: 'Les petites choses qu’on se demande.',
    b: [
      ['liste', [
        ['NaoCV peut-il écrire mon CV à ma place ?', 'non, et c’est voulu : il reformule et met en forme ce que vous écrivez, il n’invente ni compétence ni chiffre.'],
        ['Mon CV fait plus de deux pages ?', 'raccourcissez l’accroche, gardez les missions essentielles des postes anciens, ou essayez un modèle plus compact.'],
        ['Les couleurs ont disparu de mon PDF ?', 'cochez « Graphiques d’arrière-plan » dans la fenêtre d’impression.'],
        ['L’entreprise que je vise n’est pas reconnue ?', 'choisissez ses couleurs à la main, ou importez son logo pour les extraire.'],
        ['Ma photo n’apparaît pas ?', 'elle n’est jamais sur la version ATS ; sur la version visuelle, vérifiez « Afficher ma photo » à l’étape Style.'],
        ['L’import d’une photo de CV ne marche pas ?', 'la première lecture d’image demande une connexion Internet ; sinon, collez le texte.'],
        ['Comment supprimer le CV d’exemple ?', 'dans 🗂️ Mes versions, bouton Supprimer sur « Exemple — à supprimer ».'],
      ]],
    ] },
];

function ouvrirAide(sec) {
  const bloc = ([t, v]) => {
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'sous') return `<h4>${v}</h4>`;
    if (t === 'astuce') return `<div class="aide-astuce"><span>💡</span><div>${v}</div></div>`;
    if (t === 'exemple') return `<div class="aide-ex"><span>🧩</span><div>${v}</div></div>`;
    if (t === 'etapes') return `<ol class="aide-etapes">${v.map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (t === 'liste') return `<ul class="aide-liste">${v.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join('')}</ul>`;
    return '';
  };
  const fiche = s => `<article class="aide-fiche"><h3><span class="aide-em">${s.em}</span>${s.t}</h3>
    <p class="aide-chapo">${s.chapo}</p>${s.b.map(bloc).join('')}</article>`;
  ouvrirModale(`<div class="aide-h">
      <div><h3 id="modaleTitre">❓ Comment ça marche</h3>
        <p class="aide-sous">Tout NaoCV, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.</p></div>
      <span class="aide-espace"></span>
      <input type="search" id="aide-q" placeholder="Chercher : lettre, ATS, PDF…" aria-label="Chercher dans l’aide" autocomplete="off">
      <button type="button" class="btn petit" data-act="fermer">Fermer</button>
    </div>
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b aria-hidden="true">${s.em}</b>${s.t}</button>`).join('')}
        <p class="aide-rien" id="aide-rien" hidden>Aucun sujet ne contient ce mot.</p>
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>`, 'aide');
  const v = $('#modaleFen'), nav = v.querySelector('#aide-nav'), pan = v.querySelector('#aide-p'), q = v.querySelector('#aide-q');
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    nav.querySelectorAll('.aide-n').forEach(b => {
      const on = b.dataset.s === id;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  };
  montrer(courant);
  nav.addEventListener('click', e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    montrer(b.dataset.s);
    if (window.innerWidth <= 760) b.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
  /* La recherche : on garde les sujets dont le texte contient les mots tapés. */
  const sansAccents = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'").toLowerCase();
  const texteDe = s => sansAccents([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const m = sansAccents(q.value.trim());
    let premier = null;
    for (const s of AIDE) {
      const ok = !m || texteDe(s).includes(m);
      nav.querySelector(`[data-s="${s.id}"]`).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    v.querySelector('#aide-rien').hidden = !!premier;
    if (m && premier && premier !== courant) montrer(premier);
  });
}
NC.ouvrirAide = ouvrirAide;
ACT.aide = b => ouvrirAide(b && b.dataset.s);
/* F1 ouvre l'aide, où que l'on soit (Échap la ferme, comme toutes les fenêtres). */
document.addEventListener('keydown', e => {
  if (e.key !== 'F1' || document.documentElement.classList.contains('imprime')) return;
  e.preventDefault();
  if (!$('#modaleFen .aide-corps')) ouvrirAide();
});
