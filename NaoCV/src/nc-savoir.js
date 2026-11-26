/* ============================================================
   NaoCV — ce que l'outil sait déjà : couleurs des entreprises,
   verbes d'action, mots-clés des annonces, fautes fréquentes.
   Rien ici n'est jamais ajouté au CV sans l'accord de l'utilisateur.
   ============================================================ */
'use strict';

/* ---------- Les couleurs des entreprises ----------
   [nom affiché, couleur principale, couleur secondaire, alias…]
   Couleurs indicatives, reprises des chartes publiques : l'utilisateur
   peut toujours les corriger, ou importer le logo pour les extraire. */
NC.ENTREPRISES = [
  ['Carrefour', '#004E9F', '#E30613', 'carrefour market', 'carrefour city', 'carrefour express'],
  ['Auchan', '#E2001A', '#00A651'],
  ['E.Leclerc', '#0066B3', '#F18E00', 'leclerc', 'e leclerc'],
  ['Intermarché', '#E30613', '#1D1D1B', 'intermarche', 'les mousquetaires'],
  ['Lidl', '#0050AA', '#E60A14'],
  ['Monoprix', '#D8232A', '#1D1D1B'],
  ['Fnac', '#1D1D1B', '#E1A925', 'fnac darty'],
  ['Darty', '#E30613', '#1D1D1B'],
  ['Decathlon', '#3643BA', '#0082C3'],
  ['Leroy Merlin', '#78BE20', '#1B1B1B'],
  ['Castorama', '#0053A0', '#00A0E1'],
  ['IKEA', '#0058A3', '#FFDB00'],
  ['Intersport', '#E2001A', '#003DA5'],
  ['Sephora', '#111111', '#C8102E'],
  ['Yves Rocher', '#2E7D32', '#1B1B1B'],
  ['Zara', '#111111', '#6B6B6B', 'inditex'],
  ['H&M', '#E50010', '#222222', 'h et m', 'h m'],
  ['Uniqlo', '#FF0000', '#1A1A1A'],
  ['Nike', '#111111', '#F36F21'],
  ['Adidas', '#111111', '#767677'],
  ['McDonald\'s', '#DA291C', '#FFC72C', 'mcdonalds', 'mc donald', 'mcdo'],
  ['Burger King', '#D62300', '#FF8732'],
  ['KFC', '#A3080C', '#1A1A1A'],
  ['Starbucks', '#00704A', '#1E3932'],
  ['Coca-Cola', '#F40009', '#1A1A1A', 'coca cola'],
  ['Danone', '#005EB8', '#00A3E0'],
  ['L\'Oréal', '#111111', '#B8860B', 'loreal', 'l oreal'],
  ['LVMH', '#1B1B1B', '#9E7C4E'],
  ['Louis Vuitton', '#3B2A1A', '#B89B5E'],
  ['Hermès', '#F37021', '#3E2A1E', 'hermes'],
  ['Chanel', '#111111', '#8C8C8C'],
  ['Dior', '#111111', '#8C8C8C'],
  ['Kering', '#111111', '#7A7A7A'],
  ['SNCF', '#6E1E78', '#E4002B', 'sncf voyageurs', 'sncf reseau'],
  ['RATP', '#003CA6', '#00A88F'],
  ['Air France', '#002157', '#E4002B', 'air france klm'],
  ['Airbus', '#00205B', '#0085CA'],
  ['Safran', '#002F5F', '#6D8FB5'],
  ['Thales', '#242A75', '#00BBDD'],
  ['Dassault Systèmes', '#005386', '#1B1B1B', 'dassault systemes'],
  ['Renault', '#1A1A1A', '#EFDF00', 'renault group'],
  ['Stellantis', '#243782', '#6E7B8B', 'peugeot', 'citroen', 'psa'],
  ['Michelin', '#27509B', '#FCE500'],
  ['Valeo', '#1A1A1A', '#82E600'],
  ['TotalEnergies', '#E4002B', '#0E3B8F', 'total'],
  ['EDF', '#001A70', '#FE5815'],
  ['Engie', '#1B3F8F', '#00AAFF'],
  ['Veolia', '#E2001A', '#1A1A1A'],
  ['Schneider Electric', '#3DCD58', '#1A1A1A', 'schneider'],
  ['Saint-Gobain', '#003DA5', '#6CC24A', 'saint gobain'],
  ['Vinci', '#004489', '#E30613'],
  ['Bouygues Telecom', '#009DCC', '#1D4F91', 'bouygues'],
  ['Orange', '#FF7900', '#1A1A1A'],
  ['SFR', '#E2001A', '#1A1A1A'],
  ['Free', '#CD1E25', '#1A1A1A', 'iliad'],
  ['La Poste', '#003DA5', '#FFCD00', 'groupe la poste', 'la banque postale', 'banque postale'],
  ['BNP Paribas', '#00965E', '#1C1C1C', 'bnp'],
  ['Société Générale', '#E60028', '#1A1A1A', 'societe generale'],
  ['Crédit Agricole', '#00735F', '#E2001A', 'credit agricole'],
  ['LCL', '#003B7A', '#FDD100'],
  ['Crédit Mutuel', '#0E4E9B', '#E2001A', 'credit mutuel'],
  ['CIC', '#003D7C', '#E2001A'],
  ['Caisse d\'Épargne', '#E2001A', '#1A1A1A', 'caisse d epargne', 'caisse depargne'],
  ['Banque Populaire', '#0B2E88', '#E2001A'],
  ['BoursoBank', '#D6006F', '#1A1A1A', 'boursorama'],
  ['AXA', '#00008F', '#FF1721'],
  ['Allianz', '#003781', '#0070C0'],
  ['Groupama', '#006B3F', '#1A1A1A'],
  ['Capgemini', '#0070AD', '#12ABDB'],
  ['Accenture', '#A100FF', '#1A1A1A'],
  ['Sopra Steria', '#CF022B', '#1A1A1A'],
  ['Atos', '#0066A1', '#1A1A1A'],
  ['Deloitte', '#1A1A1A', '#86BC25'],
  ['KPMG', '#00338D', '#005EB8'],
  ['PwC', '#D04A02', '#EB8C00', 'pricewaterhousecoopers'],
  ['EY', '#2E2E38', '#FFE600', 'ernst young', 'ernst & young'],
  ['IBM', '#0F62FE', '#161616'],
  ['Microsoft', '#0078D4', '#737373'],
  ['Google', '#4285F4', '#34A853', 'alphabet'],
  ['Apple', '#1D1D1F', '#6E6E73'],
  ['Amazon', '#232F3E', '#FF9900', 'amazon web services', 'aws'],
  ['Netflix', '#E50914', '#221F1F'],
  ['Spotify', '#1DB954', '#191414'],
  ['Disney', '#113CCF', '#1A1A1A', 'disneyland paris', 'the walt disney company'],
  ['Uber', '#111111', '#276EF1'],
  ['Deliveroo', '#00CCBC', '#2E3333'],
  ['Doctolib', '#107ACA', '#0B3B66'],
  ['BlaBlaCar', '#054752', '#2ED1FF'],
  ['Leboncoin', '#EC5A13', '#1A1A1A', 'le bon coin'],
  ['Vinted', '#09B1BA', '#1A1A1A'],
  ['Accor', '#050033', '#C4A866', 'novotel', 'ibis', 'mercure', 'sofitel'],
  ['Hilton', '#002F61', '#1A1A1A'],
  ['Sodexo', '#2A295C', '#EE0000'],
  ['Adecco', '#E1001A', '#231F20'],
  ['Manpower', '#0A3D91', '#E31937', 'manpowergroup'],
  ['Randstad', '#2175D9', '#0F1941'],
  ['France Travail', '#000091', '#E1000F', 'pole emploi'],
  ['Éducation nationale', '#000091', '#E1000F', 'education nationale', 'ministere de l education'],
  ['Fonction publique', '#000091', '#E1000F', 'mairie', 'prefecture', 'conseil departemental', 'conseil regional'],
  ['AP-HP', '#004C9B', '#1A1A1A', 'ap hp', 'assistance publique'],
  ['Heineken', '#008200', '#1A1A1A'],
  ['Carglass', '#E2001A', '#FFD100'],
  ['Norauto', '#0074BC', '#E30613']
];

/* ---------- Palette discrète proposée pour les titres et séparateurs ---------- */
NC.PALETTE = [
  ['Bleu marine', '#1F3A68'], ['Bleu roi', '#2C5AA0'], ['Pétrole', '#1D5C63'], ['Vert sapin', '#2E5E4E'],
  ['Bordeaux', '#7A2E3A'], ['Prune', '#5B3A6E'], ['Lilas NaoGroup', '#6A4FC9'], ['Anthracite', '#3A3F47'],
  ['Terracotta', '#A0522D'], ['Or doux', '#8C6D2C']
];

/* ---------- Les verbes d'action ----------
   [infinitif, radical sans accent (1er groupe) ou formes, nom, article du nom,
    verbe plus fort, finalité générique proposée (à vérifier par l'utilisateur)] */
NC.VERBES = [
  ['Accueillir', /^accueill\w*$/, 'accueil', "l'", 'Prendre en charge', 'afin d\'orienter chaque demande vers le bon interlocuteur'],
  ['Conseiller', /^conseill\w*$/, 'conseil', 'le ', 'Accompagner', 'afin de répondre précisément aux besoins exprimés'],
  ['Vendre', /^(vend|vends|vendait|vendaient|vendais|vendre|vendu|vendue|vendus|vendues|vendant)$/, 'vente', 'la ', 'Assurer la vente de', ''],
  ['Encaisser', /^encaiss\w*$/, 'encaissement', "l'", 'Sécuriser', ''],
  ['Gérer', /^(ger|gere|geres|gerent|gerais|gerait|geraient|gerer|geree|gerees|gerant|geriez|gerions)$/, 'gestion', 'la ', 'Piloter', ''],
  ['Organiser', /^organis\w*$/, 'organisation', "l'", 'Coordonner', ''],
  ['Planifier', /^planifi\w*$/, 'planification', 'la ', 'Coordonner', ''],
  ['Coordonner', /^coordonn\w*$/, 'coordination', 'la ', 'Piloter', ''],
  ['Suivre', /^(suis|suit|suivais|suivait|suivaient|suivre|suivi|suivie|suivis|suivies|suivant)$/, 'suivi', 'le ', 'Assurer le suivi de', ''],
  ['Analyser', /^analys\w*$/, 'analyse', "l'", 'Analyser en profondeur', 'afin d\'éclairer les décisions'],
  ['Accompagner', /^accompagn\w*$/, 'accompagnement', "l'", 'Soutenir', ''],
  ['Développer', /^develop\w*$/, 'développement', 'le ', 'Développer', ''],
  ['Créer', /^(cre|cree|crees|creent|creais|creait|creaient|creer|creee|creees|creant)$/, 'création', 'la ', 'Concevoir', ''],
  ['Concevoir', /^(concois|concoit|concevais|concevait|concevoir|concu|concue|concus|concues)$/, 'conception', 'la ', 'Concevoir', ''],
  ['Négocier', /^negoci\w*$/, 'négociation', 'la ', 'Négocier', ''],
  ['Former', /^form(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'formation', 'la ', 'Transmettre son savoir-faire à', ''],
  ['Fidéliser', /^fidelis\w*$/, 'fidélisation', 'la ', 'Fidéliser', ''],
  ['Optimiser', /^optimis\w*$/, 'optimisation', "l'", 'Optimiser', ''],
  ['Résoudre', /^(resous|resout|resolvais|resolvait|resoudre|resolu|resolue|resolus|resolues)$/, 'résolution', 'la ', 'Résoudre', ''],
  ['Traiter', /^trait(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'traitement', 'le ', 'Prendre en charge', 'dans le respect des délais'],
  ['Préparer', /^prepar\w*$/, 'préparation', 'la ', 'Assurer la préparation de', ''],
  ['Rédiger', /^redig\w*$/, 'rédaction', 'la ', 'Rédiger', ''],
  ['Réaliser', /^realis\w*$/, 'réalisation', 'la ', 'Mener à bien', ''],
  ['Animer', /^anim(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'animation', "l'", 'Animer', ''],
  ['Encadrer', /^encadr\w*$/, 'encadrement', "l'", 'Manager', ''],
  ['Manager', /^manag(e|es|ent|eais|eait|eaient|er|ee|ees|eant)$/, 'management', 'le ', 'Manager', ''],
  ['Recruter', /^recrut\w*$/, 'recrutement', 'le ', 'Piloter le recrutement de', ''],
  ['Prospecter', /^prospect(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'prospection', 'la ', 'Prospecter', 'afin de développer le portefeuille clients'],
  ['Contrôler', /^control\w*$/, 'contrôle', 'le ', 'Garantir la conformité de', ''],
  ['Vérifier', /^verifi\w*$/, 'vérification', 'la ', 'Contrôler', ''],
  ['Saisir', /^(saisis|saisit|saisissais|saisissait|saisir|saisi|saisie|saisies)$/, 'saisie', 'la ', 'Assurer la saisie de', ''],
  ['Réceptionner', /^receptionn\w*$/, 'réception', 'la ', 'Contrôler la réception de', ''],
  ['Livrer', /^livr\w*$/, 'livraison', 'la ', 'Assurer la livraison de', ''],
  ['Entretenir', /^(entretiens|entretient|entretenais|entretenait|entretenir|entretenu|entretenue|entretenus)$/, 'entretien', "l'", 'Assurer l\'entretien de', ''],
  ['Installer', /^install\w*$/, 'installation', "l'", 'Installer', ''],
  ['Réparer', /^repar(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'réparation', 'la ', 'Diagnostiquer et réparer', ''],
  ['Assurer', /^assur\w*$/, '', '', 'Garantir', ''],
  ['Informer', /^inform(e|es|ent|ais|ait|aient|er|ee|ees|ant)$/, 'information', "l'", 'Informer', ''],
  ['Orienter', /^orient\w*$/, 'orientation', "l'", 'Orienter', ''],
  ['Répondre', /^(reponds|repond|repondais|repondait|repondaient|repondre|repondu|repondant)$/, 'réponse', 'la ', 'Traiter', ''],
  ['Servir', /^(sers|sert|servais|servait|servaient|servir|servi|servie|servis|servant)$/, 'service', 'le ', 'Assurer le service de', ''],
  ['Mettre en place', /^(mets|met|mettais|mettait|mettre|mis|mise|mises)$/, 'mise en place', 'la ', 'Déployer', ''],
  ['Piloter', /^pilot\w*$/, 'pilotage', 'le ', 'Piloter', ''],
  ['Superviser', /^supervis\w*$/, 'supervision', 'la ', 'Superviser', ''],
  ['Facturer', /^factur\w*$/, 'facturation', 'la ', 'Assurer la facturation de', ''],
  ['Relancer', /^relanc\w*$/, 'relance', 'la ', 'Relancer', ''],
  ['Approvisionner', /^approvisionn\w*$/, 'approvisionnement', "l'", 'Anticiper l\'approvisionnement de', ''],
  ['Mettre en rayon', /^rayonn\w*$/, 'mise en rayon', 'la ', 'Assurer la mise en rayon de', ''],
  ['Nettoyer', /^nettoy\w*$/, 'nettoyage', 'le ', 'Assurer l\'entretien de', ''],
  ['Soigner', /^soign\w*$/, 'soins', 'les ', 'Prodiguer des soins à', ''],
  ['Enseigner', /^enseign\w*$/, 'enseignement', "l'", 'Transmettre', ''],
  ['Communiquer', /^communiqu\w*$/, 'communication', 'la ', 'Communiquer', ''],
  ['Participer à', /^particip\w*$/, 'participation', 'la ', 'Contribuer à', ''],
  ['Contribuer à', /^contribu\w*$/, 'contribution', 'la ', 'Contribuer activement à', '']
];

/* Les noms d'action qu'on peut rencontrer en tête de ligne : « Gestion des stocks ». */
NC.NOMS_ACTION = {};
NC.VERBES.forEach(v => { if (v[2]) NC.NOMS_ACTION[norm(v[2])] = v; });
Object.assign(NC.NOMS_ACTION, {
  'tenue': ['Tenir', null, 'tenue', 'la ', 'Assurer la tenue de', ''],
  'mise en rayon': NC.VERBES.find(v => v[0] === 'Mettre en rayon'),
  'redaction': NC.VERBES.find(v => v[0] === 'Rédiger'),
  'reception': NC.VERBES.find(v => v[0] === 'Réceptionner'),
  'soins': NC.VERBES.find(v => v[0] === 'Soigner'),
  'accueil': NC.VERBES.find(v => v[0] === 'Accueillir')
});

/* Les verbes « faibles » : on propose un verbe plus précis selon le complément. */
NC.FAIBLES = /^(fais|fait|faisais|faisait|faire|occup\w*|aid\w*|travaill\w*|etais|etait|etre|avais|avait|avoir|m'occup\w*|m'occupais|s'occup\w*|charge|responsable)$/;

/* Le complément suggère le verbe : [motif, verbe]. */
NC.INDICES = [
  [/client|clientele|usager|patient|visiteur|public|voyageur|passager/, 'Accueillir'],
  [/conseil|besoin|recommand/, 'Conseiller'],
  [/caisse/, 'Gérer'],
  [/encaisse|paiement|reglement/, 'Encaisser'],
  [/stock|inventaire|reserve|entrepot/, 'Gérer'],
  [/commande|colis|expedition/, 'Traiter'],
  [/rayon|etal|vitrine|merchandising|facing/, 'Mettre en rayon'],
  [/equipe|collaborateur|stagiaire|salarie/, 'Coordonner'],
  [/reunion|evenement|salon|seminaire|planning|agenda|rendez/, 'Organiser'],
  [/rapport|tableau|donnee|indicateur|kpi|statistique|chiffre/, 'Analyser'],
  [/courrier|mail|email|compte rendu|document|dossier|devis|contrat/, 'Rédiger'],
  [/facture|facturation/, 'Facturer'],
  [/telephone|appel|standard|ligne/, 'Traiter'],
  [/reclamation|litige|probleme|incident|panne|sav/, 'Résoudre'],
  [/vente|vendre|produit|article/, 'Vendre'],
  [/menage|nettoyage|proprete|local|locaux/, 'Nettoyer'],
  [/formation|apprenti|nouveau|nouvelle recrue/, 'Former'],
  [/site|application|logiciel|code|web/, 'Développer'],
  [/prospect|nouveaux clients|portefeuille/, 'Prospecter'],
  [/enfant|eleve|personne agee|resident|beneficiaire/, 'Accompagner'],
  [/livraison|tournee/, 'Livrer'],
  [/machine|equipement|materiel|vehicule/, 'Entretenir']
];

/* Petites améliorations de vocabulaire, sans changer le sens. */
NC.LEXIQUE = [
  [/\bles clients\b/g, 'la clientèle'], [/\bdes clients\b/g, 'de la clientèle'], [/\bla caisse\b/g, 'les encaissements'],
  [/\ble telephone\b|\ble téléphone\b/g, 'les appels téléphoniques'], [/\bau telephone\b|\bau téléphone\b/g, 'aux appels téléphoniques'], [/\bles mails\b|\bles e-mails\b/g, 'les courriels'],
  [/\bles papiers\b/g, 'les documents administratifs'], [/\ble ménage\b/g, "l'entretien des locaux"],
  [/\bles gens\b/g, 'le public'], [/\bles collègues\b/g, "l'équipe"], [/\bles trucs\b|\bles choses\b/g, 'les tâches']
];

/* Formulations vagues à signaler. */
NC.VAGUE = /\b(divers|diverses|differentes taches|taches diverses|taches|etc|plusieurs choses|polyvalen\w*|aider|aide a|s'occuper|m'occuper|faire|trucs|choses|un peu de tout|tout ce qui)\b/;

/* ---------- Les mots-clés d'une annonce ----------
   [libellé canonique, motif sans accents] */
NC.MOTS = {
  logiciels: [
    ['Pack Office', 'pack office|suite office|microsoft office|office 365|microsoft 365'], ['Excel', 'excel'], ['Word', '\\bword\\b'],
    ['PowerPoint', 'powerpoint'], ['Outlook', 'outlook'], ['Teams', '\\bteams\\b'], ['Google Workspace', 'google workspace|gsuite|g suite|google sheets|google docs'],
    ['SAP', '\\bsap\\b'], ['Salesforce', 'salesforce'], ['HubSpot', 'hubspot'], ['Sage', '\\bsage\\b'], ['Cegid', 'cegid'], ['EBP', '\\bebp\\b'],
    ['Pennylane', 'pennylane'], ['Quadratus', 'quadratus'], ['Silae', 'silae'], ['ADP', '\\badp\\b'], ['CRM', '\\bcrm\\b'], ['ERP', '\\berp\\b'],
    ['Photoshop', 'photoshop'], ['Illustrator', 'illustrator'], ['InDesign', 'indesign'], ['Canva', 'canva'], ['Figma', 'figma'], ['Premiere Pro', 'premiere pro'],
    ['WordPress', 'wordpress'], ['Shopify', 'shopify'], ['Prestashop', 'prestashop'], ['Google Analytics', 'google analytics|ga4'], ['Google Ads', 'google ads|adwords'],
    ['Meta Business Suite', 'meta business|facebook ads'], ['Power BI', 'power ?bi'], ['Tableau', '\\btableau software\\b'], ['Looker Studio', 'looker'],
    ['Jira', '\\bjira\\b'], ['Trello', 'trello'], ['Notion', '\\bnotion\\b'], ['Slack', '\\bslack\\b'], ['Asana', 'asana'],
    ['AutoCAD', 'autocad'], ['Revit', 'revit'], ['SolidWorks', 'solidworks'], ['SketchUp', 'sketchup'], ['CATIA', 'catia'],
    ['Python', 'python'], ['SQL', '\\bsql\\b'], ['Java', '\\bjava\\b'], ['JavaScript', 'javascript|\\bjs\\b'], ['TypeScript', 'typescript'], ['PHP', '\\bphp\\b'],
    ['React', '\\breact\\b'], ['Angular', 'angular'], ['Vue.js', 'vue\\.?js'], ['Node.js', 'node\\.?js'], ['HTML / CSS', '\\bhtml\\b|\\bcss\\b'], ['C#', 'c#|\\.net'],
    ['Git', '\\bgit\\b|github|gitlab'], ['Docker', 'docker'], ['Kubernetes', 'kubernetes'], ['AWS', '\\baws\\b|amazon web services'], ['Azure', 'azure'],
    ['Linux', 'linux'], ['VBA', '\\bvba\\b'], ['Doctolib', 'doctolib'], ['Pix', '\\bpix\\b']
  ],
  techniques: [
    ['Comptabilité', 'comptab\\w*'], ['Paie', '\\bpaie\\b'], ['Facturation', 'factur\\w*'], ['Recouvrement', 'recouvrement'], ['Trésorerie', 'tresorerie'],
    ['Contrôle de gestion', 'controle de gestion'], ['Audit', '\\baudit\\w*'], ['Fiscalité', 'fiscal\\w*'], ['Gestion administrative', 'gestion administrative|administratif|administrative'],
    ['Accueil', '\\baccueil\\w*'], ['Relation client', 'relation client\\w*|relation clientele'], ['Service client', 'service client\\w*|sav\\b|apres-vente'],
    ['Vente', '\\bvente\\w*|\\bvendre\\b|vendeur|vendeuse'], ['Conseil client', 'conseil\\w* client|conseiller'], ['Encaissement', 'encaiss\\w*|\\bcaisse\\b'],
    ['Merchandising', 'merchandising|mise en rayon|facing'], ['Gestion des stocks', 'gestion des stocks|stock\\w*|inventaire\\w*'],
    ['Prospection', 'prospect\\w*'], ['Négociation', 'negoci\\w*'], ['Développement commercial', 'developpement commercial|business developer|portefeuille client\\w*'],
    ['Marketing digital', 'marketing digital|webmarketing|marketing numerique'], ['SEO', '\\bseo\\b|referencement'], ['Community management', 'community manag\\w*|reseaux sociaux'],
    ['Communication', '\\bcommunication\\b'], ['Rédaction', 'redaction|rediger|redactionnel'], ['Gestion de projet', 'gestion de projets?|chef de projet|pilotage de projet'],
    ['Management', 'management|manager|encadr\\w*'], ['Recrutement', 'recrutements?\\b(?! (h|f))|recruteu\\w*|sourcing|charge\\w* de recrutement'], ['Formation', '\\bformer\\b|animation de formation|formateur|formatrice'],
    ['Ressources humaines', 'ressources humaines|\\brh\\b'], ['Logistique', 'logistique'], ['Approvisionnement', 'approvisionn\\w*'], ['Achats', '\\bachats?\\b|acheteur|acheteuse'],
    ['Supply chain', 'supply chain'], ['Transport', '\\btransport\\w*'], ['Préparation de commandes', 'preparation de commandes?|preparateur|preparatrice'],
    ['Analyse de données', 'analyse de donnees|data analys\\w*|\\bdata\\b'], ['Reporting', 'reporting|tableaux? de bord'], ['Développement web', 'developpement web|developpeur|developpeuse'],
    ['Secrétariat', 'secretariat|secretaire'], ['Assistanat', 'assistanat|assistant\\w*'], ['Planification', 'planific\\w*|planning'],
    ['Maintenance', 'maintenance'], ['Qualité', '\\bqualite\\b|iso 9001'], ['Sécurité', '\\bsecurite\\b|hse|qhse'], ['Hygiène HACCP', 'haccp|hygiene'],
    ['Soins', '\\bsoins?\\b'], ['Accompagnement', 'accompagn\\w*'], ['Animation', '\\banimation\\b|animer'], ['Juridique', 'juridique|droit des'],
    ['Graphisme', 'graphis\\w*|design graphique'], ['UX / UI', '\\bux\\b|\\bui\\b|experience utilisateur'], ['Événementiel', 'evenementiel|evenements?'],
    ['Standard téléphonique', 'standard|appels telephoniques|accueil telephonique'], ['Cuisine', 'cuisine|cuisinier|commis'], ['Service en salle', 'service en salle|serveur|serveuse']
  ],
  qualites: [
    ['Rigueur', 'rigueur|rigoureu\\w*'], ['Autonomie', 'autonom\\w*'], ['Organisation', 'organise\\w*|sens de l\'organisation|organisation'], ['Sens du relationnel', 'relationnel\\w*'],
    ['Esprit d\'équipe', 'esprit d\'equipe|travail en equipe|collaborati\\w*'], ['Adaptabilité', 'adaptab\\w*|capacite d\'adaptation|s\'adapter'], ['Curiosité', 'curiosite|curieu\\w*'],
    ['Dynamisme', 'dynami\\w*'], ['Polyvalence', 'polyvalen\\w*'], ['Réactivité', 'reacti\\w*'], ['Écoute', '\\becoute\\b'], ['Aisance à l\'oral', 'aisance a l\'oral|aisance relationnelle|expression orale'],
    ['Créativité', 'creati\\w*'], ['Leadership', 'leadership'], ['Sens du service', 'sens du service'], ['Esprit d\'analyse', 'esprit d\'analyse|capacites? d\'analyse|analytique'],
    ['Gestion du stress', 'gestion du stress|resistance au stress|sous pression'], ['Ponctualité', 'ponctu\\w*'], ['Discrétion', 'discret\\w*|discretion|confidentialite'],
    ['Persévérance', 'perseveran\\w*|tenacite|tenace'], ['Force de proposition', 'force de proposition|proactivite|proacti\\w*'], ['Esprit de synthèse', 'synthese'],
    ['Bienveillance', 'bienveill\\w*'], ['Patience', 'patien\\w*'], ['Pédagogie', 'pedagog\\w*'], ['Sens commercial', 'sens commercial|fibre commerciale|goût du challenge|gout du challenge'],
    ['Minutie', 'minuti\\w*|souci du detail'], ['Fiabilité', 'fiab\\w*'], ['Diplomatie', 'diplomat\\w*']
  ],
  langues: [
    ['Anglais', 'anglais|english'], ['Espagnol', 'espagnol'], ['Allemand', 'allemand'], ['Italien', 'italien'], ['Portugais', 'portugais'],
    ['Chinois', 'chinois|mandarin'], ['Arabe', '\\barabe\\b'], ['Russe', '\\brusse\\b'], ['Japonais', 'japonais'], ['Néerlandais', 'neerlandais'],
    ['Langue des signes', 'langue des signes|lsf']
  ]
};

NC.LANGUES = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Arabe', 'Chinois', 'Russe', 'Japonais', 'Néerlandais', 'Langue des signes'];
NC.NIVEAUX = ['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avancé (B2)', 'Intermédiaire (B1)', 'Notions (A2)', 'Débutant (A1)'];
NC.CONTRATS = ['CDI', 'CDD', 'Intérim', 'Alternance', 'Apprentissage', 'Stage', 'Freelance', 'Saisonnier', 'Job étudiant', 'Bénévolat', 'Service civique', 'Temps partiel'];

/* Mots qu'on ignore quand on cherche les autres mots-clés d'une annonce. */
NC.VIDES = new Set(('a au aux avec ce ces cet cette dans de des du elle en et etre il ils je la le les leur leurs lui ma mais me meme mes moi mon ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous y ' +
  'afin ainsi alors apres aussi autre autres avant avoir bien cadre candidat candidate candidats candidature ceux chaque chez comme comprenant dont doit doivent donc egalement ' +
  'encore ensemble entre entreprise equipe faire fait fera grande grand h f hf homme femme ici jour jours lors mission missions mois moins notamment nombreux offre offrons ' +
  'peut plus poste postes profil propose proposons qualites recherche recherchons rejoindre rejoignez selon sera serez seront sont souhaite souhaitee souhaites taches tout toute toutes tous ' +
  'tres travail vos vous votre etes aurez avez annee annees experience experiences formation niveau minimum requis requise idealement type contrat salaire remuneration ' +
  'temps plein partiel lieu date debut dès des que h/f f/h cdi cdd poste. sein cadre nous. afin. ainsi bonne bon bons bonnes connaissance connaissances maitrise maitriser capacite ' +
  'capacites sens esprit savoir etre avoir aimer aimez aime gout environnement groupe societe structure client clients activite activites service services').split(/\s+/));

/* ---------- Fautes fréquentes dans un CV ---------- [motif sans accent, correction] */
NC.FAUTES = [
  ['develloper', 'développer'], ['devellopement', 'développement'], ['developpement', 'développement'], ['experiance', 'expérience'], ['experience', 'expérience'],
  ['experiences', 'expériences'], ['competance', 'compétence'], ['competances', 'compétences'], ['competences', 'compétences'], ['competence', 'compétence'],
  ['resonsable', 'responsable'], ['responsabe', 'responsable'], ['etudes', 'études'], ['etudiant', 'étudiant'], ['ecole', 'école'], ['equipe', 'équipe'],
  ['societe', 'société'], ['securite', 'sécurité'], ['qualite', 'qualité'], ['negociation', 'négociation'], ['periode', 'période'], ['deja', 'déjà'],
  ['tres', 'très'], ['reseau', 'réseau'], ['reseaux', 'réseaux'], ['specialise', 'spécialisé'], ['realisation', 'réalisation'], ['gerer', 'gérer'],
  ['gestionaire', 'gestionnaire'], ['accceuil', 'accueil'], ['acceuil', 'accueil'], ['acceuillir', 'accueillir'], ['language', 'langage (ou langue)'],
  ['manageur', 'manager'], ['courament', 'couramment'], ['courrament', 'couramment'], ['dévelloppement', 'développement'], ['réceptionniste', null],
  ['professionel', 'professionnel'], ['professionelle', 'professionnelle'], ['professionnele', 'professionnelle'], ['adresse mail', null], ['intéret', 'intérêt'],
  ['interet', 'intérêt'], ['interets', 'intérêts'], ['diplome', 'diplôme'], ['diplomes', 'diplômes'], ['maitrise', 'maîtrise'], ['maitriser', 'maîtriser'],
  ['connaisance', 'connaissance'], ['connaisances', 'connaissances'], ['sérieu', 'sérieux'], ['disponibilitée', 'disponibilité'], ['mobilitée', 'mobilité'],
  ['envirronement', 'environnement'], ['environement', 'environnement'], ['informatiqe', 'informatique'], ['comercial', 'commercial'], ['commerciale', null],
  ['addresse', 'adresse'], ['apartir', 'à partir'], ['parmis', 'parmi'], ['malgrés', 'malgré'], ['quelques soit', 'quel que soit'], ['au jour d\'aujourd\'hui', 'aujourd\'hui'],
  ['baccalaureat', 'baccalauréat'], ['licence pro', null], ['secretaire', 'secrétaire'], ['secretariat', 'secrétariat'], ['comptabilite', 'comptabilité']
].filter(f => f[1]);
