/* ============================================================
   NaoFactu — « Comment ça marche » : le mode d'emploi.
   Même forme que dans NaoFi, NaoBaby et NaoPets : sommaire à gauche,
   fiche à droite, et une recherche qui garde les sujets contenant le mot tapé.
   Une fiche = un titre, un chapô, puis des blocs :
     ['p', texte] · ['sous', intertitre] · ['etapes', [..]] ·
     ['liste', [[mot, explication], ..]] · ['astuce', texte] · ['exemple', texte]
   ============================================================ */
'use strict';

const AIDE = [
{ id: 'debut', em: '🚀', t: 'Premiers pas', chapo: 'Ce qu’il faut savoir avant tout le reste.', b: [
  ['p', 'NaoFactu tient l’administratif d’une petite activité : <b>devis, factures, paiements, dépenses, comptabilité, paie, contrats et recrutements</b>. Il vit <b>dans votre navigateur, sur cet ordinateur</b> : aucun abonnement, aucun serveur à installer.'],
  ['etapes', [
    'Ouvrez <b>⚙️ Paramètres → 🏷️ Mon activité</b> (ou <b>Compléter mon activité</b> sur le tableau de bord) : nom, logo, adresse, SIRET, coordonnées bancaires, TVA, conditions de paiement. Ces informations s’impriment sur tous vos documents.',
    'Ajoutez vos <b>👥 Clients</b> — ou créez-les au vol depuis un devis avec le bouton ➕.',
    'Si vous vendez souvent les mêmes prestations, rangez-les dans le <b>📦 Catalogue</b>.',
    'Créez votre premier <b>📝 devis</b> ou votre première <b>🧾 facture</b> : le bouton est en haut du tableau de bord.',
    'Quand le client paie, enregistrez le <b>💳 paiement</b> : la facture passe toute seule en « Payée ».',
  ]],
  ['liste', [
    ['Le menu à gauche', 'toutes les rubriques. Sur téléphone, il s’ouvre avec <b>☰ Menu</b>.'],
    ['Les pastilles rouges', 'à côté de Factures, Documents et Échéances : le nombre de choses qui attendent (retards, documents à classer, rappels).'],
    ['Le ⋯ au bout d’une ligne', 'toutes les actions sur un devis ou une facture : PDF, e-mail, paiement, avoir, duplication…'],
  ]],
  ['astuce', 'Pensez à <b>⚙️ Paramètres → 💾 Sauvegarde</b> de temps en temps : un seul fichier garde tout, documents joints compris.'],
]},

{ id: 'accueil', em: '🏠', t: 'Le tableau de bord', chapo: 'Votre activité en un coup d’œil, à chaque ouverture.', b: [
  ['liste', [
    ['💶 Encaissé ce mois-ci', 'la somme des paiements reçus ce mois.'],
    ['⏳ Factures à encaisser', 'ce que vos clients vous doivent encore, sur les factures validées.'],
    ['🚨 Factures en retard', 'celles dont l’échéance est passée, avec le montant à relancer.'],
    ['🛒 Dépenses du mois', 'le total TTC, et la TVA déductible indicative.'],
    ['🏦 Trésorerie estimée', 'votre solde estimé, et ce qu’il deviendra une fois tout encaissé.'],
  ]],
  ['p', 'Chaque carte se clique pour ouvrir la rubrique correspondante. En dessous : <b>vos prochaines échéances</b> (30 jours), <b>vos derniers devis</b>, les <b>documents à classer</b>, puis les recrutements et contrats à surveiller.'],
  ['p', 'La rangée de raccourcis crée en un clic un devis, une facture, une dépense, un paiement, ou importe une fiche de paie.'],
]},

{ id: 'activite', em: '🏷️', t: 'Votre activité', chapo: 'Ce qui apparaît en haut et en bas de vos documents.', b: [
  ['p', 'Dans <b>⚙️ Paramètres → 🏷️ Mon activité</b>, puis <b>💾 Enregistrer le profil</b>.'],
  ['liste', [
    ['Identité', 'nom, forme juridique, SIRET, TVA intracommunautaire, RCS ou RM, métier, représentant légal.'],
    ['Logo', '📷 Ajouter un logo : il est réduit automatiquement et s’affiche sur les devis, factures et contrats.'],
    ['Employeur', 'code APE, n° Urssaf, convention collective, caisse de retraite, mutuelle : repris sur les contrats de travail et les bulletins.'],
    ['Apparence', 'la couleur des devis, factures, contrats et bulletins, et la mise en page des contrats (classique, moderne, élégante).'],
    ['Coordonnées & banque', 'adresse, e-mail, téléphone, site, IBAN, BIC : l’IBAN s’imprime sur les factures pour faciliter le virement.'],
    ['TVA', 'cochez « Je ne facture pas la TVA » (franchise en base, association…) : la colonne TVA disparaît et la mention choisie s’affiche.'],
    ['Conditions & mentions', 'délai de paiement, validité des devis, pénalités de retard, mention des devis, pied de page, signature des e-mails.'],
  ]],
  ['sous', 'Plusieurs activités'],
  ['p', 'Dans <b>🗃️ Activités</b>, <b>➕ Ajouter une activité</b> : chacune a ses propres clients, catalogue, devis, factures, dépenses, contrats et sa propre numérotation. On passe de l’une à l’autre avec le sélecteur <b>Activité</b> en haut du menu. Les fiches de paie rangées sont communes.'],
  ['astuce', 'Les mentions obligatoires et le régime de TVA dépendent de votre situation : faites-les valider par votre expert-comptable ou le service des impôts.'],
]},

{ id: 'clients', em: '👥', t: 'Clients & catalogue', chapo: 'Les gens pour qui vous travaillez, et ce que vous leur vendez.', b: [
  ['sous', 'Les clients'],
  ['liste', [
    ['➕ Nouveau client', 'un nom ou une entreprise suffit ; ajoutez e-mail, téléphone, adresse, TVA, SIRET et notes si besoin.'],
    ['La fiche', 'cliquez sur un client : ses coordonnées, puis son <b>historique</b> — devis, factures, montant encaissé et reste dû.'],
    ['📝 Devis / 🧾 Facture', 'depuis la fiche, créent directement un document pour ce client.'],
    ['🔎 Rechercher', 'par nom, entreprise, e-mail ou ville.'],
  ]],
  ['sous', 'Le catalogue'],
  ['p', '<b>📦 Catalogue → ➕ Nouvel article</b> : nom, référence, description, prix unitaire HT, unité (heure, jour, forfait…), taux de TVA, catégorie. Dans un devis ou une facture, <b>📦 Depuis le catalogue</b> ajoute les articles cochés en une fois.'],
  ['astuce', 'Un client qui a des devis ou des factures ne peut pas être supprimé : son historique reste intact.'],
]},

{ id: 'devis', em: '📝', t: 'Les devis', chapo: 'Proposer un prix, puis le transformer en facture.', b: [
  ['etapes', [
    '<b>📝 Devis → ➕ Nouveau devis</b>. Le numéro est proposé tout de suite (par exemple D-2026-004).',
    'Choisissez le <b>client</b>, l’<b>objet</b>, la date et la <b>durée de validité</b>.',
    'Ajoutez les <b>lignes</b> : désignation, détail, quantité, unité, prix HT, remise, TVA. Le total se calcule à droite.',
    'Ajoutez si besoin une <b>remise globale</b>, des <b>conditions</b> (acompte à la commande…) et une <b>note</b>.',
    '<b>💾 Enregistrer</b>, puis <b>👁️ Aperçu & PDF</b> ou <b>✉️ Préparer l’e-mail</b>.',
  ]],
  ['liste', [
    ['Les statuts', 'Brouillon, Envoyé, Accepté, Refusé. Un devis en brouillon ou envoyé dont la validité est dépassée passe en <b>Expiré</b>.'],
    ['🔁 Transformer en facture', 'crée une facture avec les mêmes lignes ; le devis passe en « Accepté » et porte l’étiquette « facturé ».'],
    ['💶 Facture d’acompte', 'facture un pourcentage du devis (30 % par défaut).'],
    ['📄 Dupliquer', 'repart d’un devis existant, avec un nouveau numéro et la date du jour.'],
    ['Les filtres', 'en haut de la liste, par statut, avec une recherche par numéro, client ou objet.'],
  ]],
  ['astuce', 'La fin de validité d’un devis envoyé apparaît dans les <b>📅 Échéances</b> : un bon moment pour relancer.'],
]},

{ id: 'factures', em: '🧾', t: 'Les factures', chapo: 'Du brouillon à la facture payée.', b: [
  ['etapes', [
    '<b>🧾 Factures → ➕ Nouvelle facture</b> (ou depuis un devis).',
    'Client, type (facture, acompte, solde), objet, date d’émission et <b>échéance</b> — les boutons « À réception, 15, 30, 45, 60 jours » la placent pour vous.',
    'Les lignes, la remise, les conditions et les notes, comme pour un devis.',
    '<b>💾 Enregistrer</b> garde un brouillon, sans numéro.',
    '<b>✅ Valider et numéroter</b> : la facture reçoit son numéro définitif, dans l’ordre chronologique, sans trou ni doublon.',
  ]],
  ['liste', [
    ['Les statuts', 'Brouillon, En attente, Envoyée, Vue par le client, Partiellement payée, Payée, En retard, Annulée. « Payée » et « En retard » se calculent tout seuls à partir des paiements et de l’échéance.'],
    ['🔒 Facture validée', 'elle est verrouillée : pour corriger un montant, faites plutôt un <b>avoir</b>. « Modifier quand même » existe, avec prudence.'],
    ['🚫 Annuler la facture', 'son numéro reste dans la chronologie. Si elle a été envoyée, préférez un avoir.'],
    ['🗑️ Supprimer', 'seulement pour un brouillon : une facture numérotée ne se supprime plus.'],
    ['Les filtres', 'Toutes, Brouillons, À encaisser, En retard, Payées, Avoirs, Annulées, 🔁 Récurrentes.'],
    ['Les boutons de ligne', '🔔 relancer (si en retard), 💳 enregistrer un paiement, ⋯ toutes les actions.'],
  ]],
  ['astuce', '« Envoyée » ou « Vue par le client » se règlent dans le menu ⋯ de la facture, rubrique <b>Suivi d’envoi</b>.'],
]},

{ id: 'acompte', em: '💶', t: 'Acompte, solde & avoirs', chapo: 'Facturer en plusieurs fois, ou corriger une facture.', b: [
  ['sous', 'Acompte puis solde'],
  ['etapes', [
    'Sur un devis, menu ⋯ → <b>💶 Facture d’acompte</b> : indiquez le pourcentage (30 % proposé). Une facture d’acompte est créée en brouillon.',
    'Validez-la et envoyez-la comme une facture ordinaire.',
    'Le moment venu, menu ⋯ du devis → <b>🧮 Facture de solde</b> : elle reprend tout le devis et <b>déduit les acomptes déjà validés</b>, ligne par ligne.',
  ]],
  ['sous', 'Les avoirs'],
  ['p', 'Sur une facture validée, menu ⋯ → <b>↩️ Créer un avoir</b> : il reprend toutes les lignes. Gardez-les pour un avoir total, ou ajustez-les pour un <b>avoir partiel</b>, puis validez : il reçoit son propre numéro (AV-…). Les avoirs se retrouvent dans le filtre « Avoirs ».'],
  ['astuce', 'Un avoir est la façon propre de corriger ou d’annuler une facture déjà envoyée.'],
]},

{ id: 'recurrentes', em: '🔁', t: 'Factures récurrentes', chapo: 'Pour un abonnement, une maintenance, un loyer…', b: [
  ['etapes', [
    'Ouvrez le menu ⋯ d’une facture qui servira de <b>modèle</b> → <b>🔁 Rendre récurrente</b>.',
    'Choisissez la <b>fréquence</b> (mensuelle, trimestrielle, semestrielle, annuelle), la date de la prochaine facture et, si besoin, une date de fin.',
    'À chaque échéance, à l’ouverture de NaoFactu, une nouvelle facture est préparée <b>en brouillon</b> : vous la vérifiez, la validez et l’envoyez.',
  ]],
  ['p', 'Toutes vos récurrences sont dans <b>🧾 Factures → 🔁 Récurrentes</b> : <b>Modifier</b> pour changer la fréquence, la mettre en pause (décochez « Récurrence active ») ou la supprimer.'],
  ['astuce', 'Rien n’est jamais envoyé tout seul : une facture récurrente reste un brouillon jusqu’à ce que vous la validiez.'],
]},

{ id: 'envoi', em: '✉️', t: 'PDF & e-mails', chapo: 'Envoyer vos documents à vos clients.', b: [
  ['liste', [
    ['👁️ Aperçu & PDF', 'le document tel qu’il sera imprimé. <b>📄 Télécharger en PDF</b> ouvre la fenêtre d’impression : choisissez « Enregistrer au format PDF ».'],
    ['✉️ Préparer l’e-mail', 'NaoFactu rédige le message (destinataire, objet, texte) ; vous pouvez le retoucher.'],
    ['✉️ Ouvrir dans ma messagerie', 'votre messagerie s’ouvre avec le texte prêt. <b>Joignez le PDF</b> avant d’envoyer.'],
    ['📋 Copier le texte', 'pour le coller ailleurs (webmail, messagerie).'],
    ['✓ Marquer comme envoyé', 'un devis passe en « Envoyé » ; une facture est validée si besoin et passe en « Envoyée ».'],
  ]],
  ['astuce', 'NaoFactu n’envoie rien lui-même : c’est toujours vous qui cliquez sur « Envoyer » dans votre messagerie.'],
]},

{ id: 'paiements', em: '💳', t: 'Paiements & relances', chapo: 'Savoir qui a payé, et relancer gentiment les autres.', b: [
  ['sous', 'Enregistrer un paiement'],
  ['etapes', [
    '<b>💳 Paiements → ➕ Enregistrer un paiement</b>, ou 💳 sur la ligne d’une facture.',
    'Choisissez la facture : le montant restant dû est proposé.',
    'Date, montant, moyen (virement, carte, chèque, espèces, prélèvement, PayPal…), référence et notes.',
  ]],
  ['p', 'Un paiement partiel fait passer la facture en « Partiellement payée » ; quand tout est réglé, elle passe en « Payée ». La page Paiements montre l’encaissé du mois et de l’année, et la liste de ce qui reste à encaisser.'],
  ['sous', 'Relancer'],
  ['liste', [
    ['🔔 Relancer le client', 'choisissez un modèle — rappel courtois avant l’échéance, première relance, seconde relance plus ferme — puis <b>Rédiger →</b>. Le message est rempli avec le client, le numéro, le montant, l’échéance et le retard.'],
    ['Noter la relance', 'la date est gardée dans l’historique de la facture, et la prochaine relance est proposée dans les échéances.'],
    ['Vos modèles', 'dans <b>⚙️ Paramètres → 🔔 Relances & rappels</b>, avec les variables {client}, {numero}, {montant}, {restant}, {echeance}, {jours}, {activite}, {signature}.'],
  ]],
  ['astuce', 'Un paiement s’enregistre seulement sur une facture validée : validez d’abord un brouillon.'],
]},

{ id: 'depenses', em: '🛒', t: 'Dépenses & justificatifs', chapo: 'Vos achats professionnels, avec leur ticket.', b: [
  ['etapes', [
    '<b>🛒 Dépenses → ➕ Ajouter une dépense</b>.',
    'Date, fournisseur, catégorie (matériel, logiciels, déplacements, repas, loyer…), moyen de paiement et montant TTC.',
    'La TVA : tapez-la, ou choisissez un taux et NaoFactu la calcule.',
    '<b>📷 Joindre une photo / un PDF</b> du justificatif.',
  ]],
  ['liste', [
    ['⚠️ Justificatif manquant', 'la dépense est signalée dans « Documents à classer ». Si elle n’en aura jamais, cochez « Pas de justificatif ».'],
    ['Dépense prévue', 'une dépense à venir : elle apparaît dans le calendrier et la trésorerie projetée. Cochez « désormais payée » quand c’est fait.'],
    ['Les filtres', 'par année, par mois et par catégorie, avec les totaux TTC, HT, la TVA récupérable indicative et le nombre de dépenses sans justificatif.'],
    ['📎', 'ouvre le justificatif joint.'],
  ]],
]},

{ id: 'compta', em: '📊', t: 'Comptabilité & exports', chapo: 'Des tableaux de suivi, et de quoi préparer le travail du comptable.', b: [
  ['liste', [
    ['📒 Recettes & dépenses', 'mois par mois : facturé HT, TVA collectée, encaissé, dépenses, TVA déductible et solde, avec un graphique. Les flèches ‹ › changent d’année.'],
    ['🏦 Trésorerie', 'solde de départ + paiements encaissés − dépenses = solde estimé ; puis le solde projeté avec ce qui reste à encaisser et les dépenses prévues. Indiquez votre <b>solde de départ</b> et sa date, puis « Mettre à jour ».'],
    ['📑 Rapports', 'mensuel, trimestriel ou annuel : synthèse, dépenses par catégorie, meilleurs clients. En <b>📄 PDF</b> ou <b>📗 Excel</b>.'],
    ['📤 Exports', 'choisissez la période (ce mois, trimestre, cette année, année dernière ou dates libres) et le contenu (factures & avoirs, paiements, dépenses, journal), puis le format : CSV, Excel ou PDF. <b>📎 Liste des justificatifs</b> indique ceux qui manquent.'],
  ]],
  ['astuce', 'Chaque export est aussi rangé dans <b>🗂️ Documents → Exports comptables</b> : vous savez toujours ce que vous avez transmis.'],
  ['exemple', 'Ces tableaux sont calculés à partir de ce que vous saisissez : ils ne remplacent ni une comptabilité tenue par un professionnel, ni vos déclarations.'],
]},

{ id: 'paie', em: '💼', t: 'Fiches de paie & salaires', chapo: 'Éditer vos bulletins, ranger ceux que vous recevez.', b: [
  ['sous', 'Éditer un bulletin'],
  ['etapes', [
    '<b>👤 Salariés → ➕ Nouveau salarié</b> : identité, emploi, statut, contrat, dates, heures mensuelles, taux horaire ou salaire, taux de prélèvement à la source, mutuelle.',
    '<b>➕ Nouveau bulletin</b> : choisissez le salarié et le mois.',
    'Ajoutez les éléments du mois : heures supplémentaires à 25 % ou 50 %, prime, absence, ligne libre. Les cotisations viennent de la grille, modifiables pour ce bulletin.',
    'Complétez les autres éléments (transport, frais…), les congés payés et une mention libre. Le résultat se calcule à droite : brut, net, net imposable, prélèvement, net payé, coût employeur.',
    '<b>✅ Valider et ranger</b> : le bulletin rejoint le classement et compte dans les cumuls. <b>➡️ Préparer le mois suivant</b> fait gagner du temps.',
  ]],
  ['sous', 'Ranger les fiches reçues'],
  ['p', '<b>📥 Importer une fiche de paie</b> (aussi sur le tableau de bord) : un ou plusieurs PDF ou photos ; le mois est deviné d’après le nom du fichier. Dans <b>🗂️ Classement des fiches</b>, par année : modifier, ouvrir, supprimer une fiche, ou en cocher plusieurs et <b>🗑️ Supprimer la sélection</b>. <b>⏰ Rappel</b> crée un rappel « transmettre les bulletins ».'],
  ['sous', 'La grille de cotisations'],
  ['p', 'Dans <b>🧮 Grille de cotisations</b> : ajoutez, modifiez ou retirez des lignes, puis enregistrez. <b>↺ Grille d’origine</b> remet celle de NaoFactu.'],
  ['exemple', 'Les taux fournis sont indicatifs (entreprise de moins de 11 salariés) et changent chaque année : vérifiez-les sur urssaf.fr ou avec votre expert-comptable. NaoFactu ne fait ni la DSN, ni le paiement des cotisations.'],
]},

{ id: 'documents', em: '🗂️', t: 'Documents comptables', chapo: 'Tous vos papiers, rangés au même endroit.', b: [
  ['liste', [
    ['Les dossiers', '📥 À classer, Factures clients, Factures fournisseurs, Justificatifs, Relevés bancaires, Exports comptables, Administratif & fiscal, Autres.'],
    ['Déposer', 'glissez vos fichiers dans la zone en pointillés, ou cliquez dessus : ils vont dans le dossier ouvert.'],
    ['Ranger', 'un fichier déposé dans « À classer » se range avec la liste <b>Ranger dans…</b> ; ailleurs, <b>Déplacer…</b>.'],
    ['Automatique', 'vos factures validées et les justificatifs de vos dépenses apparaissent d’eux-mêmes dans leur dossier.'],
  ]],
  ['astuce', '« À classer » rappelle aussi les dépenses sans justificatif : cliquez dessus pour le joindre.'],
]},

{ id: 'contrats', em: '✍️', t: 'Contrats', chapo: 'Rédigés article par article, suivis jusqu’à leur échéance.', b: [
  ['etapes', [
    '<b>✍️ Contrats → ➕ Nouveau contrat</b> : choisissez un type (prestation, fournisseur, CDI, CDD, sous-traitance, stage, alternance, bail, confidentialité…), un modèle ou un document vierge, et si vous voulez un <b>client lié</b> : ses coordonnées remplissent la seconde partie.',
    'Remplissez les <b>parties</b>, l’<b>objet</b> ou le <b>poste</b>, la <b>durée</b> et les <b>conditions financières</b> : les champs s’adaptent au type.',
    'Ajustez les <b>articles</b> : modifiez le texte, montez ou descendez, retirez, ajoutez un article vierge ou une clause de la bibliothèque.',
    'Choisissez la <b>couleur</b> et la <b>mise en page</b>, puis 💾 Enregistrer : le contrat reçoit sa référence (CT-…).',
    '<b>👁️ Aperçu</b>, <b>📄 Télécharger en PDF</b> ou <b>✉️ Envoyer par e-mail</b>. Une fois signé, <b>joignez l’exemplaire signé</b>.',
  ]],
  ['liste', [
    ['Les montants', 'écrits automatiquement en toutes lettres. Dans l’aperçu, les éléments encore à compléter sont surlignés en jaune.'],
    ['📐 Modèles', 'modifiez les modèles fournis, créez les vôtres, ou <b>📐 Enregistrer comme modèle</b> un contrat réussi. ↺ Restaurer les modèles d’origine si besoin.'],
    ['🧩 Bibliothèque de clauses', 'confidentialité, propriété intellectuelle, force majeure, données personnelles, non-concurrence, télétravail…'],
    ['Les alertes', 'fin de contrat, préavis à donner, fin de période d’essai, signature à relancer : tout arrive dans les 📅 Échéances.'],
    ['👤 Créer la fiche salarié', 'depuis un contrat de travail, pour préparer la paie.'],
  ]],
  ['exemple', 'Les modèles sont des bases de travail : faites relire un contrat — surtout un contrat de travail — par un professionnel du droit avant signature.'],
]},

{ id: 'recrutement', em: '🧑‍🤝‍🧑', t: 'Recrutements', chapo: 'Des postes ouverts jusqu’au contrat signé.', b: [
  ['liste', [
    ['📌 Postes', '➕ Poste : intitulé, statut (ouvert, en pause, pourvu, fermé), type de contrat, lieu, rémunération, missions, profil recherché, diffusion. <b>📄 Fiche de poste</b> l’imprime.'],
    ['👤 Candidats', '➕ Candidat : coordonnées, poste visé, note en étoiles, CV joint, entretiens à planifier.'],
    ['🧭 Suivi des candidatures', 'des colonnes de « Nouvelle candidature » à « Recruté·e » ou « Non retenu·e » : <b>glissez une carte</b> d’une colonne à l’autre pour faire avancer le dossier, cliquez-la pour ouvrir la fiche.'],
    ['✉️ E-mail', 'quatre messages types — accusé de réception, invitation à un entretien, réponse négative courtoise, proposition — à ouvrir dans votre messagerie ; l’envoi est noté dans le dossier.'],
    ['🤝 Recruté·e', 'NaoFactu propose aussitôt de préparer le contrat.'],
  ]],
  ['astuce', 'Les entretiens planifiés apparaissent dans les 📅 Échéances. Pensez au RGPD : supprimez les dossiers non retenus au bout d’un délai raisonnable.'],
]},

{ id: 'echeances', em: '📅', t: 'Échéances & rappels', chapo: 'Tout ce qui a une date, au même endroit.', b: [
  ['p', 'Le calendrier rassemble les <b>paiements attendus</b>, les <b>retards et relances</b>, les <b>dépenses prévues</b>, les <b>factures récurrentes</b>, les <b>entretiens</b>, les <b>dates de contrats</b> et vos <b>rappels</b>, chacun avec sa couleur. Cliquez sur un élément pour l’ouvrir.'],
  ['liste', [
    ['➕ Ajouter un rappel', 'une déclaration, des relevés à envoyer au comptable… avec une date, un type et des notes. « ✓ Marquer comme fait » quand c’est réglé.'],
    ['En retard / à traiter', 'ce qui est déjà passé ; à droite, les 45 prochains jours.'],
    ['Rappels automatiques', 'dans <b>⚙️ Paramètres → 🔔 Relances & rappels</b> : combien de jours avant l’échéance d’une facture être prévenu, et tous les combien de jours proposer une nouvelle relance.'],
  ]],
]},

{ id: 'numerotation', em: '#️⃣', t: 'Numérotation', chapo: 'Des numéros qui se suivent, sans trou ni doublon.', b: [
  ['p', 'Dans <b>⚙️ Paramètres → #️⃣ Numérotation</b>, un modèle pour les devis, les factures et les avoirs, avec les codes <kbd>{AAAA}</kbd> année, <kbd>{AA}</kbd> année courte, <kbd>{MM}</kbd> mois et <kbd>{NUM}</kbd> compteur.'],
  ['liste', [
    ['Chiffres du compteur', '3 donne 001, 002…'],
    ['Repartir de 1 chaque année', 'coché par défaut.'],
    ['Reprise d’un autre logiciel', 'indiquez le dernier numéro déjà émis cette année : NaoFactu continue à la suite.'],
    ['Prochains numéros', 'un aperçu se met à jour pendant que vous tapez.'],
  ]],
  ['exemple', 'Avec F-{AAAA}-{NUM} et 3 chiffres, la première facture de 2026 sera F-2026-001.'],
]},

{ id: 'sauvegarde', em: '💾', t: 'Sauvegarde, synchronisation & exports', chapo: 'Garder vos données à l’abri.', b: [
  ['p', 'Vos données sont enregistrées <b>dans ce navigateur, sur cet ordinateur</b>, à chaque modification. Les documents joints (justificatifs, bulletins, CV, contrats signés) sont rangés à part, dans le navigateur aussi.'],
  ['liste', [
    ['💾 Télécharger une sauvegarde', 'dans <b>⚙️ Paramètres → 💾 Sauvegarde</b> : un seul fichier <kbd>.json</kbd> qui contient tout, <b>documents joints compris</b>.'],
    ['📂 Restaurer une sauvegarde', 'remplace toutes les données actuelles par celles du fichier (après confirmation). Sert aussi à passer sur un autre ordinateur.'],
    ['🔄 Avec un compte NaoGroup', 'si vous ouvrez NaoFactu depuis NaoGroup en étant connecté·e, vos données suivent votre profil sur vos autres appareils. Les documents joints, eux, restent sur cet ordinateur : seule la sauvegarde <kbd>.json</kbd> les emporte.'],
    ['📤 Exports', 'pour votre expert-comptable : CSV, Excel ou PDF, dans <b>📊 Comptabilité → Exports</b>.'],
  ]],
  ['astuce', 'Faites une sauvegarde régulièrement, et toujours avant de changer d’ordinateur, de déplacer le dossier ou de nettoyer votre navigateur. Si le stockage est plein, allégez le logo et sauvegardez.'],
]},

{ id: 'reinit', em: '♻️', t: 'Réinitialiser l’outil', chapo: 'Effacer une partie, ou tout recommencer.', b: [
  ['sous', '🧹 Remise à zéro… (sélective)'],
  ['etapes', [
    '<b>⚙️ Paramètres → 🧹 Remise à zéro</b> (ou le bouton « 🧹 Remise à zéro… » de la Sauvegarde).',
    'Choisissez la portée : l’activité en cours seulement, ou toutes les activités.',
    'Cochez ce qu’il faut effacer : devis, factures (avec paiements et récurrences), clients, catalogue, dépenses, contrats, recrutements, documents, bulletins et salariés, fiches de paie rangées, rappels.',
    'Cochez si besoin « Remettre aussi les compteurs de numérotation à zéro ».',
    '<b>🧹 Effacer la sélection</b>, puis confirmez. Tout le reste est conservé.',
  ]],
  ['sous', '♻️ Réinitialiser l’outil (complète)'],
  ['p', 'Le bouton ♻️ en bas du menu, ou <b>♻️ Réinitialiser l’outil</b> dans la Sauvegarde ou la Remise à zéro : NaoFactu redevient exactement ce qu’un nouvel utilisateur découvre. Profil et logo, clients, documents, paie, contrats, modèles personnalisés, réglages et thème : tout est effacé. Pour confirmer, il faut écrire <b>EFFACER</b>.'],
  ['liste', [
    ['💾 Sauvegarder, puis réinitialiser', 'télécharge d’abord une sauvegarde complète, puis efface : le choix le plus sûr.'],
    ['Revenir en arrière', 'Paramètres → Sauvegarde → 📂 Restaurer une sauvegarde.'],
  ]],
  ['astuce', 'Les deux effacements sont définitifs, documents joints compris : sans sauvegarde, rien ne peut être récupéré.'],
]},

{ id: 'astuces', em: '💡', t: 'Astuces & raccourcis', chapo: 'Pour aller plus vite.', b: [
  ['liste', [
    ['F1 ou ?', 'ouvre cette aide, depuis n’importe quel écran.'],
    ['Échap', 'ferme la fenêtre ouverte.'],
    ['Entrée', 'valide une petite question (pourcentage d’acompte, nom d’une activité…).'],
    ['☀️ / 🌙', 'l’interrupteur en bas du menu passe du thème clair au thème sombre.'],
    ['L’ouverture', 'l’animation de la facture se passe d’un clic ; elle est sautée si votre ordinateur demande moins d’animations.'],
    ['Modifications non enregistrées', 'en quittant un devis, une facture, un contrat ou un bulletin, NaoFactu vous prévient avant de perdre votre travail.'],
    ['📄 Dupliquer', 'le plus rapide pour refaire un devis, une facture ou un contrat semblable.'],
    ['Le catalogue', 'vos prestations habituelles, prêtes en deux clics dans chaque document.'],
  ]],
  ['astuce', 'Sur le tableau de bord, cliquez sur une carte chiffrée : elle ouvre directement la liste filtrée correspondante.'],
]},

{ id: 'limites', em: '🤍', t: 'Ce que NaoFactu ne fait pas', chapo: 'Un outil d’organisation et de suivi.', b: [
  ['p', 'NaoFactu n’est ni un expert-comptable, ni un logiciel de paie certifié, ni un conseil fiscal, social ou juridique. Il ne garantit pas la conformité de vos documents à votre situation.'],
  ['liste', [
    ['Mentions et TVA', 'à faire valider par votre expert-comptable ou l’administration.'],
    ['Paie', 'taux indicatifs, ni DSN ni paiement des cotisations.'],
    ['Contrats et recrutement', 'à faire relire par un professionnel du droit.'],
    ['Envois', 'NaoFactu prépare les e-mails, mais n’envoie rien tout seul.'],
  ]],
]},
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
  /* une seule aide à la fois : celle déjà ouverte se referme */
  $$('.modal.aide .xclose').forEach(x => x.click());
  const m = modal({ titre: '❓ Comment ça marche', sous: 'Tout NaoFactu, expliqué pas à pas. Choisissez un sujet, ou cherchez un mot.', taille: 'aide', corps: `
    <div class="aide-corps">
      <nav class="aide-nav" id="aide-nav" aria-label="Sommaire de l’aide">
        ${AIDE.map(s => `<button type="button" class="aide-n" data-s="${s.id}"><b>${s.em}</b>${s.t}</button>`).join('')}
      </nav>
      <div class="aide-p" id="aide-p" tabindex="0"></div>
    </div>` });
  m.box.setAttribute('aria-label', 'Comment ça marche');
  /* le champ de recherche se place dans l'en-tête, après la création : la modale ne lui donne pas le focus
     d'office (sur téléphone, le clavier cacherait la fiche) */
  const q = document.createElement('input');
  q.type = 'search'; q.className = 'in aide-q'; q.placeholder = 'Chercher : acompte, relance, TVA…'; q.setAttribute('aria-label', 'Chercher dans l’aide');
  $('.mhd', m.box).insertBefore(q, $('.xclose', m.box));
  const nav = $('#aide-nav', m.box), pan = $('#aide-p', m.box);
  let courant = AIDE.some(s => s.id === sec) ? sec : AIDE[0].id;
  const montrer = id => {
    courant = id;
    pan.innerHTML = fiche(AIDE.find(x => x.id === id));
    pan.scrollTop = 0;
    $$('.aide-n', nav).forEach(b => b.classList.toggle('on', b.dataset.s === id));
    const on = $('.aide-n.on', nav); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  montrer(courant);
  nav.addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) montrer(b.dataset.s); });
  /* la recherche : on garde les sujets dont le texte contient les mots tapés */
  const sansAccents = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const texteDe = s => sansAccents([s.t, s.chapo, JSON.stringify(s.b)].join(' ').replace(/<[^>]+>/g, ' '));
  q.addEventListener('input', () => {
    const mots = sansAccents(q.value.trim()).split(/\s+/).filter(Boolean);
    let premier = null;
    for (const s of AIDE) {
      const t = texteDe(s), ok = mots.every(x => t.includes(x));
      $(`[data-s="${s.id}"]`, nav).hidden = !ok;
      if (ok && !premier) premier = s.id;
    }
    if (mots.length && premier && (premier !== courant || $(`[data-s="${courant}"]`, nav).hidden)) montrer(premier);
    if (mots.length && !premier) pan.innerHTML = `<div class="empty">Aucun sujet ne parle de « ${esc(q.value.trim())} ». Essayez un autre mot, ou parcourez le sommaire.</div>`;
    else if (!$('.aide-fiche', pan)) montrer(courant);
  });
  if (window.matchMedia && matchMedia('(pointer:fine)').matches) setTimeout(() => q.focus(), 60);
  return m;
}
ACT.aide = ds => ouvrirAide(ds && ds.s);
document.addEventListener('keydown', e => {
  if (el('nf-intro')) return;
  const saisie = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
  if (e.key === 'F1' || (e.key === '?' && !saisie && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); ouvrirAide(); }
});
