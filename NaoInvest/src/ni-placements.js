/* ============================================================
   NaoInvest — le guide de l'épargne et des placements.
   Chaque produit en détail : pour qui, plafond, disponibilité,
   rémunération, fiscalité, frais, avantages, limites, vigilance,
   exemple. Montants et règles en vigueur en 2025 : ils évoluent,
   chaque fiche invite à vérifier sur une source officielle.
   Aucun produit n'est présenté comme « meilleur » qu'un autre.
   ============================================================ */
const MAJ_GUIDE = 'règles et montants connus en 2025';

const BESOINS = [
  { id: 'dispo',    nom: 'Disponible à tout moment', e: '💧' },
  { id: 'projet',   nom: 'Un projet dans 2 à 8 ans', e: '🎯' },
  { id: 'long',     nom: 'Le long terme (8 ans et plus)', e: '🌳' },
  { id: 'retraite', nom: 'La retraite', e: '🌅' },
  { id: 'enfants',  nom: 'Pour les enfants', e: '🧸' }
];

const FAMILLES_EPARGNE = [
  { id: 'dispo',     e: '💧', nom: 'L’épargne disponible', desc: 'Pour les imprévus et les projets proches : on récupère son argent quand on veut, sans risque de perte. C’est la base de tout.' },
  { id: 'logement',  e: '🔑', nom: 'L’épargne logement', desc: 'Des plans réglementés historiquement liés à un projet immobilier.' },
  { id: 'enveloppes', e: '✉️', nom: 'Les grandes enveloppes du moyen et long terme', desc: 'Des cadres fiscaux dans lesquels on place des supports : leur intérêt se révèle avec le temps.' },
  { id: 'retraite',  e: '🌅', nom: 'Préparer sa retraite', desc: 'Une épargne bloquée jusqu’à la retraite (sauf exceptions), avec un avantage fiscal à l’entrée.' },
  { id: 'salariale', e: '🏢', nom: 'L’épargne salariale', desc: 'Proposée par l’employeur : intéressement, participation, abondement.' },
  { id: 'supports',  e: '🧩', nom: 'Ce qu’on met dans les enveloppes', desc: 'Les supports eux-mêmes : c’est d’eux que dépendent le risque et le rendement.' },
  { id: 'enfants',   e: '🧸', nom: 'Épargner pour ses enfants', desc: 'Commencer tôt, petit à petit, au nom de l’enfant ou en lui donnant plus tard.' },
  { id: 'risque',    e: '⚠️', nom: 'Les placements très risqués — à connaître pour s’en méfier', desc: 'Ils font beaucoup parler d’eux. Les comprendre, c’est surtout comprendre pourquoi on peut tout y perdre.' }
];

const GUIDE = [
/* ---------- l'épargne disponible ---------- */
{ id: 'livret-a', fam: 'dispo', e: '🏠', nom: 'Livret A', cls: 'garanti', besoins: ['dispo', 'enfants'],
  court: 'Le livret le plus connu : disponible, sans risque, sans impôt.',
  pourQui: 'Tout le monde, enfants compris (un seul Livret A par personne).',
  plafond: '22 950 € de versements (les intérêts peuvent le faire dépasser).', plafC: '22 950 €',
  dispo: 'Retraits et versements à tout moment.', dispoC: 'Immédiate',
  remun: 'Taux fixé par les pouvoirs publics et révisé en général deux fois par an (février et août). Les intérêts sont calculés par quinzaine : un versement rapporte à partir du 1er ou du 16 du mois suivant, un retrait cesse de rapporter dès la quinzaine en cours.',
  fisc: 'Intérêts exonérés d’impôt sur le revenu et de prélèvements sociaux.', fiscC: 'Exonéré',
  frais: 'Aucun frais d’ouverture ni de gestion.',
  plus: ['Argent disponible tout de suite', 'Capital garanti par l’État', 'Aucun impôt sur les intérêts'],
  moins: ['Rendement modeste, qui peut être inférieur à l’inflation', 'Plafond limité'],
  vigil: ['Le taux change : vérifiez le taux du moment sur service-public.fr', 'Un seul Livret A par personne : en ouvrir un second est interdit'],
  exemple: 'Lina garde son épargne de précaution, 3 000 €, sur son Livret A : si sa voiture tombe en panne, elle paie la réparation sans découvert.' },
{ id: 'ldds', fam: 'dispo', e: '🌿', nom: 'LDDS (livret de développement durable et solidaire)', cls: 'garanti', besoins: ['dispo'],
  court: 'Le « frère » du Livret A, avec le même taux et la même fiscalité.',
  pourQui: 'Toute personne majeure domiciliée en France (un seul par personne).',
  plafond: '12 000 € de versements.', plafC: '12 000 €',
  dispo: 'Retraits et versements à tout moment.', dispoC: 'Immédiate',
  remun: 'Même taux que le Livret A. Les sommes financent notamment les PME et la transition énergétique ; la banque doit proposer chaque année de faire un don à l’économie sociale et solidaire (facultatif).',
  fisc: 'Intérêts exonérés d’impôt et de prélèvements sociaux.', fiscC: 'Exonéré',
  frais: 'Aucun.',
  plus: ['Complète le Livret A une fois celui-ci rempli', 'Disponible et sans risque'],
  moins: ['Même rendement modeste que le Livret A'],
  vigil: ['Réservé aux majeurs'],
  exemple: 'Avec un Livret A et un LDDS, une personne peut garder jusqu’à 34 950 € d’épargne disponible et défiscalisée.' },
{ id: 'lep', fam: 'dispo', e: '💜', nom: 'LEP (livret d’épargne populaire)', cls: 'garanti', besoins: ['dispo'],
  court: 'Le livret réglementé le mieux rémunéré, réservé aux revenus modestes.',
  pourQui: 'Les personnes dont le revenu fiscal de référence ne dépasse pas un plafond fixé chaque année (selon le nombre de parts).',
  plafond: '10 000 € de versements.', plafC: '10 000 €',
  dispo: 'Retraits et versements à tout moment.', dispoC: 'Immédiate',
  remun: 'Taux réglementé, plus élevé que celui du Livret A.',
  fisc: 'Intérêts exonérés d’impôt et de prélèvements sociaux.', fiscC: 'Exonéré',
  frais: 'Aucun.',
  plus: ['Meilleure rémunération des livrets réglementés', 'Disponible et sans risque'],
  moins: ['Soumis à conditions de ressources, vérifiées chaque année par la banque'],
  vigil: ['Beaucoup de personnes éligibles ne le savent pas : comparez votre revenu fiscal de référence (sur l’avis d’imposition) au plafond publié sur service-public.fr'],
  exemple: 'Jade, apprentie, découvre grâce à son avis d’imposition qu’elle est éligible au LEP : son épargne y est mieux rémunérée que sur son Livret A, avec la même disponibilité.' },
{ id: 'livret-jeune', fam: 'dispo', e: '🎒', nom: 'Livret jeune', cls: 'garanti', besoins: ['dispo', 'enfants'],
  court: 'Un livret pour les 12–25 ans, rémunéré au moins comme le Livret A.',
  pourQui: 'Les jeunes de 12 à 25 ans qui résident en France.',
  plafond: '1 600 € de versements.', plafC: '1 600 €',
  dispo: 'Retraits libres à partir de 16 ans (avant, avec l’accord du représentant légal).', dispoC: 'Immédiate',
  remun: 'Taux libre fixé par la banque, mais jamais inférieur à celui du Livret A.',
  fisc: 'Intérêts exonérés d’impôt et de prélèvements sociaux.', fiscC: 'Exonéré',
  frais: 'Aucun.',
  plus: ['Peut rapporter un peu plus que le Livret A', 'Apprend à épargner tôt'],
  moins: ['Petit plafond', 'Clôturé au 31 décembre de l’année des 25 ans'],
  vigil: ['Les taux diffèrent d’une banque à l’autre : comparer'],
  exemple: 'Noé, 17 ans, y range l’argent de son job d’été : 1 200 €, disponibles pour son permis.' },
{ id: 'csl', fam: 'dispo', e: '🏦', nom: 'Comptes sur livret et « super livrets »', cls: 'garanti', besoins: ['dispo'],
  court: 'Les livrets propres à chaque banque, au taux libre.',
  pourQui: 'Tout le monde ; plusieurs livrets possibles.',
  plafond: 'Fixé par la banque, souvent très élevé.', plafC: 'Variable',
  dispo: 'Retraits à tout moment.', dispoC: 'Immédiate',
  remun: 'Taux libre. Les taux « boostés » ou promotionnels ne durent souvent que quelques mois, puis retombent.',
  fisc: 'Intérêts imposables : prélèvement forfaitaire unique par défaut (ou barème sur option), prélèvements sociaux compris.', fiscC: 'Imposable',
  frais: 'En général aucun : à vérifier dans la brochure tarifaire.',
  plus: ['Pas de plafond contraignant', 'Disponible'],
  moins: ['Intérêts imposés', 'Taux souvent bas hors promotion'],
  vigil: ['Comparez le taux après la période promotionnelle, et après impôt'],
  exemple: 'Un « super livret » à 4 % pendant 3 mois puis 1 % : sur l’année, le rendement réel est bien plus proche de 1,75 % que de 4 %.' },
{ id: 'cat', fam: 'dispo', e: '⏲️', nom: 'Compte à terme', cls: 'garanti', besoins: ['projet'],
  court: 'On bloque une somme pour une durée fixée, contre un taux connu d’avance.',
  pourQui: 'Une somme dont on est sûr de ne pas avoir besoin pendant la durée prévue.',
  plafond: 'Selon la banque (souvent un minimum de versement).', plafC: 'Variable',
  dispo: 'Bloqué jusqu’à l’échéance ; une sortie anticipée fait perdre tout ou partie des intérêts.', dispoC: 'Bloqué (durée choisie)',
  remun: 'Taux fixe, ou progressif, connu à l’ouverture.',
  fisc: 'Intérêts imposables (PFU par défaut).', fiscC: 'Imposable',
  frais: 'En général aucun.',
  plus: ['Rendement connu d’avance', 'Capital garanti'],
  moins: ['Argent bloqué', 'Intérêts imposés'],
  vigil: ['Bien choisir la durée : une sortie anticipée est pénalisée'],
  exemple: 'Placer 5 000 € pendant 12 mois en sachant dès le départ ce qu’ils rapporteront.' },

/* ---------- l'épargne logement ---------- */
{ id: 'pel', fam: 'logement', e: '🔑', nom: 'PEL (plan d’épargne logement)', cls: 'garanti', besoins: ['projet'],
  court: 'Une épargne programmée à taux fixe, sur plusieurs années.',
  pourQui: 'Une personne qui peut épargner régulièrement sans toucher à cet argent (un seul PEL par personne).',
  plafond: '61 200 € ; versements obligatoires d’au moins 540 € par an.', plafC: '61 200 €',
  dispo: 'Bloqué : un retrait entraîne la clôture du plan. Pour le prêt associé, au moins 4 ans.', dispoC: 'Bloqué',
  remun: 'Taux fixé à l’ouverture et garanti pour toute la durée du plan (le taux proposé aux nouveaux plans change chaque année).',
  fisc: 'Pour les PEL ouverts depuis 2018 : intérêts imposables dès la première année (PFU), plus de prime d’État.', fiscC: 'Imposable',
  frais: 'En général aucun.',
  plus: ['Taux connu et garanti dès le départ', 'Discipline d’épargne régulière'],
  moins: ['Argent bloqué', 'Le prêt associé est rarement intéressant aujourd’hui'],
  vigil: ['Les règles dépendent de la date d’ouverture : à vérifier sur service-public.fr', 'Ne pas y mettre son épargne de précaution'],
  exemple: 'Sofia verse 100 € par mois sur un PEL pendant 4 ans pour constituer une partie de son apport.' },
{ id: 'cel', fam: 'logement', e: '🗝️', nom: 'CEL (compte épargne logement)', cls: 'garanti', besoins: ['dispo'],
  court: 'Un livret logement disponible, au taux réglementé plus bas que le Livret A.',
  pourQui: 'Toute personne (un seul CEL par personne).',
  plafond: '15 300 €.', plafC: '15 300 €',
  dispo: 'Retraits possibles à tout moment (un solde minimum doit rester).', dispoC: 'Immédiate',
  remun: 'Taux réglementé, inférieur à celui du Livret A.',
  fisc: 'Pour les CEL ouverts depuis 2018 : intérêts imposables (PFU).', fiscC: 'Imposable',
  frais: 'Aucun.',
  plus: ['Disponible', 'Sans risque'],
  moins: ['Moins bien rémunéré qu’un Livret A, et imposé'],
  vigil: ['Rarement prioritaire tant que Livret A et LDDS ne sont pas remplis'],
  exemple: 'Un CEL peut garder une petite épargne logement disponible, mais un Livret A rapporte davantage, sans impôt.' },

/* ---------- les grandes enveloppes ---------- */
{ id: 'assurance-vie', fam: 'enveloppes', e: '📂', nom: 'Assurance-vie', cls: 'mixte', besoins: ['projet', 'long', 'enfants'],
  court: 'L’enveloppe la plus utilisée en France : souple, pour épargner, préparer un projet ou transmettre.',
  pourQui: 'Tout le monde, à tout âge (un mineur avec ses représentants légaux). On peut en avoir plusieurs.',
  plafond: 'Aucun plafond de versements.', plafC: 'Aucun',
  dispo: 'L’argent n’est pas bloqué : on peut faire un « rachat » (retrait) partiel ou total à tout moment. L’assureur verse en général sous quelques jours ou semaines.', dispoC: 'Sous quelques jours',
  remun: 'Elle dépend des supports choisis à l’intérieur. <b>Fonds en euros</b> : capital en principe garanti par l’assureur (hors frais), rémunération annoncée chaque année, jamais garantie à l’avance. <b>Unités de compte</b> (fonds, ETF, immobilier papier…) : pas de garantie, la valeur monte et descend. On choisit soi-même (gestion libre) ou on délègue (gestion pilotée ou profilée).',
  fisc: 'On n’est imposé que sur les <b>gains</b>, et seulement au moment d’un rachat. Avant 8 ans : prélèvement forfaitaire unique. <b>Après 8 ans</b> : abattement annuel de 4 600 € sur les gains retirés (9 200 € pour un couple marié ou pacsé), puis taux réduit (7,5 % pour les versements jusqu’à 150 000 €), plus les prélèvements sociaux. Les prélèvements sociaux du fonds en euros sont prélevés chaque année. <b>Transmission</b> : au décès, les sommes vont aux bénéficiaires désignés, avec un abattement de 152 500 € par bénéficiaire pour les versements faits avant 70 ans (30 500 € au total pour ceux faits après 70 ans).', fiscC: 'Allégée après 8 ans',
  frais: 'Frais sur versements (de 0 à quelques %), frais de gestion annuels, frais d’arbitrage, frais propres aux unités de compte. Ils varient énormément d’un contrat à l’autre.',
  plus: ['Très souple : pas de plafond, argent récupérable', 'Fiscalité allégée après 8 ans', 'Outil de transmission (clause bénéficiaire)'],
  moins: ['Les unités de compte peuvent perdre de la valeur', 'Les frais peuvent peser lourd', 'Le fonds en euros rapporte peu certaines années'],
  vigil: ['La date qui compte pour les 8 ans est celle de l’ouverture du contrat : ouvrir tôt, même avec peu', 'Rédiger avec soin la clause bénéficiaire', 'Comparer les frais avant de signer ; méfiance envers les contrats vendus avec des frais d’entrée élevés', 'Le Fonds de garantie des assurances de personnes protège jusqu’à 70 000 € par assuré et par assureur en cas de faillite de l’assureur'],
  exemple: 'Marc ouvre une assurance-vie à 30 ans avec 100 €. À 38 ans, le contrat a « pris date » : s’il retire de l’argent, la fiscalité allégée s’applique déjà.' },
{ id: 'pea', fam: 'enveloppes', e: '🇪🇺', nom: 'PEA (plan d’épargne en actions)', cls: 'perte', besoins: ['long'],
  court: 'L’enveloppe des actions européennes, avec un avantage fiscal après 5 ans.',
  pourQui: 'Les personnes majeures domiciliées en France (un seul PEA par personne).',
  plafond: '150 000 € de versements (les gains peuvent faire dépasser ce montant).', plafC: '150 000 €',
  dispo: 'Avant 5 ans, un retrait entraîne en principe la clôture (sauf exceptions : licenciement, invalidité, retraite anticipée…). Après 5 ans, retraits possibles sans clôturer.', dispoC: 'Après 5 ans',
  remun: 'Elle dépend des titres détenus : actions de sociétés européennes, fonds et ETF éligibles (au moins 75 % d’actions européennes). Dividendes et plus-values restent dans le plan. Les liquidités sur le compte espèces ne rapportent rien.',
  fisc: 'Pas d’impôt tant que l’argent reste dans le plan. Après 5 ans, les gains retirés sont exonérés d’impôt sur le revenu ; seuls les prélèvements sociaux restent dus.', fiscC: 'Exonéré d’IR après 5 ans',
  frais: 'Frais de courtage et de tenue de compte, plafonnés par la réglementation.',
  plus: ['Fiscalité très favorable après 5 ans', 'Accès à des ETF larges éligibles'],
  moins: ['Risque de perte en capital', 'Seuls certains titres sont éligibles'],
  vigil: ['Ouvrir tôt pour « prendre date », même avec un petit versement', 'Ne placer que de l’argent dont on n’aura pas besoin avant longtemps'],
  exemple: 'Inès ouvre un PEA à 26 ans avec 50 €. À 31 ans, ses 5 ans sont passés : ses futurs retraits seront exonérés d’impôt sur le revenu.' },
{ id: 'pea-jeune', fam: 'enveloppes', e: '🌱', nom: 'PEA jeune', cls: 'perte', besoins: ['long'],
  court: 'Un PEA pour les 18–25 ans encore rattachés au foyer fiscal de leurs parents.',
  pourQui: 'Les jeunes majeurs de 18 à 25 ans rattachés au foyer fiscal de leurs parents.',
  plafond: '20 000 €.', plafC: '20 000 €',
  dispo: 'Mêmes règles que le PEA.', dispoC: 'Après 5 ans',
  remun: 'Comme le PEA : selon les titres détenus.',
  fisc: 'Comme le PEA. Il devient un PEA classique (plafond de 150 000 €) quand le rattachement prend fin.', fiscC: 'Exonéré d’IR après 5 ans',
  frais: 'Comme le PEA.',
  plus: ['Permet de prendre date très tôt'],
  moins: ['Risque de perte en capital', 'Petit plafond'],
  vigil: ['Le compteur des 5 ans démarre à l’ouverture : un atout pour les jeunes'],
  exemple: 'À 19 ans, Hugo ouvre un PEA jeune avec 30 € : à 24 ans, son plan aura déjà 5 ans.' },
{ id: 'pea-pme', fam: 'enveloppes', e: '🏭', nom: 'PEA-PME', cls: 'perte', besoins: ['long'],
  court: 'Un second PEA, pour les petites et moyennes entreprises.',
  pourQui: 'Les personnes majeures domiciliées en France (un seul par personne).',
  plafond: '225 000 € au total avec le PEA classique (si le PEA est rempli à 150 000 €, il reste 75 000 €).', plafC: '225 000 € cumulés',
  dispo: 'Mêmes règles que le PEA.', dispoC: 'Après 5 ans',
  remun: 'Actions de PME et ETI européennes, fonds éligibles.',
  fisc: 'Mêmes règles que le PEA.', fiscC: 'Exonéré d’IR après 5 ans',
  frais: 'Comme le PEA.',
  plus: ['Plafond supplémentaire'],
  moins: ['Petites entreprises : volatilité souvent plus forte', 'Choix de supports plus restreint'],
  vigil: ['Plus risqué qu’un PEA investi dans de grands indices'],
  exemple: 'Utile surtout à ceux qui ont déjà beaucoup versé sur leur PEA.' },
{ id: 'cto', fam: 'enveloppes', e: '🗂️', nom: 'Compte-titres ordinaire (CTO)', cls: 'perte', besoins: ['projet', 'long'],
  court: 'L’enveloppe sans plafond et sans contrainte, mais sans avantage fiscal.',
  pourQui: 'Tout le monde ; plusieurs comptes possibles.',
  plafond: 'Aucun.', plafC: 'Aucun',
  dispo: 'Titres revendables à tout moment, au prix du marché du moment.', dispoC: 'Quelques jours (prix variable)',
  remun: 'Selon les titres : actions, obligations, fonds, ETF du monde entier.',
  fisc: 'Dividendes, intérêts et plus-values imposés chaque année où ils sont perçus ou réalisés (PFU par défaut). Les moins-values peuvent compenser des plus-values.', fiscC: 'Imposable',
  frais: 'Courtage, droits de garde, frais de tenue selon l’établissement.',
  plus: ['Aucune limite de montant ni de titres', 'Disponible'],
  moins: ['Pas d’avantage fiscal', 'Risque selon les titres'],
  vigil: ['Le risque dépend entièrement de ce qu’on y met'],
  exemple: 'Un compte-titres permet de détenir un ETF sur un indice mondial qui n’est pas éligible au PEA.' },

/* ---------- la retraite ---------- */
{ id: 'per', fam: 'retraite', e: '🌅', nom: 'PER individuel (plan d’épargne retraite)', cls: 'mixte', besoins: ['retraite'],
  court: 'Épargner pour sa retraite, avec une déduction d’impôt aujourd’hui.',
  pourQui: 'Tout le monde, salarié ou non, même sans revenus. Particulièrement étudié par ceux dont le taux marginal d’imposition est élevé.',
  plafond: 'Pas de plafond de versements, mais la déduction fiscale est plafonnée : le montant déductible figure sur l’avis d’imposition (« plafond épargne retraite »).', plafC: 'Déduction plafonnée',
  dispo: '<b>Bloqué jusqu’à la retraite</b>, sauf cas prévus par la loi : achat de la résidence principale, décès du conjoint ou partenaire de PACS, invalidité, surendettement, fin des droits au chômage, liquidation judiciaire de son entreprise.', dispoC: 'Retraite (sauf exceptions)',
  remun: 'Selon les supports, comme une assurance-vie ou un compte-titres. Par défaut, la gestion est pilotée « à horizon » : la part risquée diminue à l’approche de la retraite.',
  fisc: '<b>À l’entrée</b> : les versements volontaires sont déductibles du revenu imposable dans la limite du plafond (on peut choisir de ne pas déduire). L’économie dépend du taux marginal : 1 000 € versés font économiser environ 300 € d’impôt à 30 %, 110 € à 11 %, rien à 0 %. <b>À la sortie</b> : si les versements ont été déduits, le capital est imposé au barème et les gains au PFU ; sinon, seuls les gains sont imposés. Sortie en capital (en une ou plusieurs fois) ou en rente.', fiscC: 'Déduction à l’entrée, impôt à la sortie',
  frais: 'Frais sur versements, de gestion, d’arbitrage, selon le contrat (assurance ou compte-titres).',
  plus: ['Réduit l’impôt l’année du versement', 'Discipline : l’argent est vraiment mis de côté pour la retraite', 'Transférable d’un établissement à un autre'],
  moins: ['Argent bloqué très longtemps', 'L’impôt n’est pas effacé : il est en grande partie reporté à la sortie', 'Peu ou pas d’intérêt fiscal pour un foyer non imposable'],
  vigil: ['Ne jamais y mettre son épargne de précaution', 'Comparer l’économie d’impôt d’aujourd’hui à l’impôt probable à la sortie', 'Le lien avec le chapitre « Déductions » du cours sur les impôts aide à comprendre ce calcul'],
  exemple: 'Claire, taux marginal de 30 %, verse 2 000 € sur un PER : son impôt baisse d’environ 600 € cette année, mais cet argent sera bloqué jusqu’à sa retraite et imposé à la sortie.' },
{ id: 'per-entreprise', fam: 'retraite', e: '🏢', nom: 'PER d’entreprise (collectif ou obligatoire)', cls: 'mixte', besoins: ['retraite'],
  court: 'Le plan retraite proposé par l’employeur, souvent complété par lui.',
  pourQui: 'Les salariés d’une entreprise qui en a mis un en place.',
  plafond: 'Selon les règles du plan ; versements volontaires déductibles comme le PER individuel.', plafC: 'Selon le plan',
  dispo: 'Bloqué jusqu’à la retraite, avec les mêmes cas de déblocage anticipé que le PER individuel.', dispoC: 'Retraite (sauf exceptions)',
  remun: 'Selon les fonds proposés par l’entreprise. Peut recevoir intéressement, participation et <b>abondement</b> (complément versé par l’employeur).',
  fisc: 'Intéressement, participation et abondement placés dessus ne sont pas soumis à l’impôt sur le revenu à l’entrée (prélèvements sociaux selon les cas).', fiscC: 'Avantageux',
  frais: 'Souvent en partie pris en charge par l’employeur.',
  plus: ['L’abondement de l’employeur est un « bonus » direct', 'Gestion simplifiée'],
  moins: ['Argent bloqué jusqu’à la retraite', 'Choix de fonds limité'],
  vigil: ['Regarder si l’employeur abonde, et à quelles conditions'],
  exemple: 'Si l’employeur abonde 50 % des versements jusqu’à un plafond, 100 € versés deviennent 150 € (avant prélèvements sociaux sur l’abondement).' },

/* ---------- l'épargne salariale ---------- */
{ id: 'pee', fam: 'salariale', e: '💼', nom: 'PEE (plan d’épargne entreprise)', cls: 'perte', besoins: ['projet'],
  court: 'L’épargne salariale à 5 ans, souvent complétée par l’employeur.',
  pourQui: 'Les salariés (et parfois dirigeants) d’une entreprise qui l’a mis en place.',
  plafond: 'Versements volontaires limités à un quart de la rémunération annuelle brute ; l’abondement de l’employeur est plafonné.', plafC: '¼ du salaire (volontaire)',
  dispo: 'Bloqué 5 ans, sauf déblocages anticipés prévus par la loi : mariage ou PACS, naissance ou adoption d’un 3e enfant, achat de la résidence principale, fin du contrat de travail, invalidité, surendettement, violences conjugales…', dispoC: '5 ans (sauf exceptions)',
  remun: 'Fonds communs de placement d’entreprise (FCPE) : monétaires, obligataires, actions, parfois actions de l’entreprise elle-même.',
  fisc: 'Intéressement et participation placés dessus et gains exonérés d’impôt sur le revenu ; prélèvements sociaux dus sur les gains.', fiscC: 'Exonéré d’IR (PS dus)',
  frais: 'Frais de tenue souvent payés par l’employeur ; frais des fonds selon les FCPE.',
  plus: ['L’abondement de l’employeur', 'Fiscalité favorable', 'Nombreux cas de déblocage'],
  moins: ['Argent bloqué 5 ans', 'Risque de perte selon les fonds'],
  vigil: ['Éviter de concentrer trop d’épargne en actions de son employeur : si l’entreprise va mal, on peut perdre son emploi et son épargne en même temps'],
  exemple: 'Yanis place sa prime d’intéressement sur le PEE plutôt que de la toucher : elle échappe à l’impôt sur le revenu, et son employeur abonde.' },

/* ---------- les supports ---------- */
{ id: 'fonds-euros', fam: 'supports', e: '🛡️', nom: 'Fonds en euros', cls: 'garanti', besoins: ['projet', 'long'],
  court: 'Le support « sécurisé » de l’assurance-vie et de certains PER.',
  pourQui: 'Ceux qui veulent la stabilité à l’intérieur d’une assurance-vie.', plafond: 'Certains contrats imposent une part minimale d’unités de compte.', plafC: 'Selon le contrat',
  dispo: 'Comme l’enveloppe qui le contient.', dispoC: 'Selon l’enveloppe',
  remun: 'Investi surtout en obligations ; rémunération annoncée chaque année, une fois acquise elle ne peut plus être reprise (effet « cliquet »).',
  fisc: 'Celle de l’enveloppe.', fiscC: 'Selon l’enveloppe',
  frais: 'Frais de gestion annuels prélevés par l’assureur.',
  plus: ['Capital en principe garanti par l’assureur (hors frais)', 'Valeur stable'], moins: ['Rendement modeste certaines années', 'Rendement futur jamais garanti'],
  vigil: ['La garantie dépend de la solidité de l’assureur'], exemple: 'Un fonds en euros peut servir à mettre de côté un projet à quelques années, dans une assurance-vie.' },
{ id: 'uc', fam: 'supports', e: '📊', nom: 'Unités de compte (UC)', cls: 'perte', besoins: ['long'],
  court: 'Tous les supports non garantis d’une assurance-vie ou d’un PER : fonds, ETF, immobilier papier…',
  pourQui: 'Ceux qui acceptent que la valeur baisse, pour viser un rendement plus élevé sur la durée.', plafond: '—', plafC: '—',
  dispo: 'Comme l’enveloppe, à la valeur du moment.', dispoC: 'Selon l’enveloppe',
  remun: 'Selon les marchés.', fisc: 'Celle de l’enveloppe.', fiscC: 'Selon l’enveloppe',
  frais: 'Frais du contrat + frais propres à chaque fonds (indiqués dans son DIC).',
  plus: ['Accès à la diversification (actions, obligations, immobilier)'], moins: ['Aucune garantie en capital'],
  vigil: ['Lire le DIC de chaque unité de compte : niveau de risque de 1 à 7, frais'], exemple: 'Une UC qui suit un indice mondial monte et baisse avec lui.' },
{ id: 'actions', fam: 'supports', e: '🧩', nom: 'Actions', cls: 'perte', besoins: ['long'],
  court: 'Des parts d’entreprises : dividendes possibles, valeur qui varie fortement.',
  pourQui: 'Pour la partie long terme seulement, avec une épargne de précaution déjà constituée.', plafond: '—', plafC: '—',
  dispo: 'Revendables en Bourse, au prix du moment.', dispoC: 'Quelques jours (prix variable)',
  remun: 'Dividendes (jamais garantis) et plus-values éventuelles.', fisc: 'Selon l’enveloppe (PEA, CTO, assurance-vie).', fiscC: 'Selon l’enveloppe',
  frais: 'Courtage.', plus: ['Potentiel de croissance sur le long terme'], moins: ['Perte possible jusqu’à la totalité', 'Forte volatilité'],
  vigil: ['Une seule entreprise = aucune diversification'], exemple: 'Voir l’espace « La Bourse » pour comprendre pas à pas.' },
{ id: 'obligations', fam: 'supports', e: '📜', nom: 'Obligations', cls: 'varie', besoins: ['projet', 'long'],
  court: 'Prêter à un État ou une entreprise contre des intérêts.',
  pourQui: 'Pour une part plus stable d’un portefeuille, en direct ou via des fonds.', plafond: '—', plafC: '—',
  dispo: 'Revendables avant l’échéance, à un prix qui varie.', dispoC: 'Prix variable avant échéance',
  remun: 'Coupons ; remboursement à l’échéance si l’émetteur paie.', fisc: 'Selon l’enveloppe.', fiscC: 'Selon l’enveloppe',
  frais: 'Courtage, ou frais du fonds.', plus: ['Revenus réguliers', 'Moins volatiles que les actions en général'], moins: ['Risque de défaut', 'Valeur en baisse quand les taux montent'],
  vigil: ['Un taux très élevé signale souvent un émetteur fragile'], exemple: 'Voir la leçon « L’obligation : prêter de l’argent ».' },
{ id: 'etf', fam: 'supports', e: '🧺', nom: 'ETF (trackers)', cls: 'perte', besoins: ['long'],
  court: 'Des fonds cotés qui suivent un indice, souvent à frais réduits.',
  pourQui: 'Ceux qui veulent suivre un marché entier plutôt que choisir des titres un à un.', plafond: '—', plafC: '—',
  dispo: 'Revendables en Bourse, au prix du moment.', dispoC: 'Quelques jours (prix variable)',
  remun: 'Comme l’indice suivi.', fisc: 'Selon l’enveloppe (PEA si éligible, CTO, assurance-vie).', fiscC: 'Selon l’enveloppe',
  frais: 'Frais courants annuels souvent bas + courtage.', plus: ['Diversification immédiate', 'Frais souvent faibles'], moins: ['Risque de l’indice', 'Certains ETF (levier, un seul secteur) sont très risqués'],
  vigil: ['Lire le DIC : indice, frais, méthode de réplication'], exemple: 'Voir la leçon « L’ETF : un panier qui suit un indice ».' },
{ id: 'opc', fam: 'supports', e: '🎛️', nom: 'Fonds (OPCVM, SICAV, FCP)', cls: 'perte', besoins: ['projet', 'long'],
  court: 'Une gestion collective confiée à une société de gestion.',
  pourQui: 'Ceux qui préfèrent déléguer la sélection des titres.', plafond: '—', plafC: '—',
  dispo: 'Rachat en général sous quelques jours.', dispoC: 'Quelques jours',
  remun: 'Selon la stratégie du fonds.', fisc: 'Selon l’enveloppe.', fiscC: 'Selon l’enveloppe',
  frais: 'Frais d’entrée éventuels, frais courants, parfois commission de performance.', plus: ['Gestion déléguée'], moins: ['Frais souvent plus élevés que les ETF', 'Risque très variable'],
  vigil: ['Niveau de risque de 1 à 7 dans le DIC'], exemple: 'Un fonds « monétaire » est peu risqué, un fonds « actions émergentes » beaucoup plus.' },
{ id: 'scpi', fam: 'supports', e: '🏢', nom: 'SCPI et immobilier papier', cls: 'perte', besoins: ['long'],
  court: 'Des parts d’un patrimoine immobilier (bureaux, commerces, santé…) qui versent une part des loyers.',
  pourQui: 'Pour une épargne de long terme, sans besoin de revendre vite.', plafond: '—', plafC: '—',
  dispo: 'La revente des parts peut prendre des mois et n’est pas garantie.', dispoC: 'Lente, non garantie',
  remun: 'Revenus issus des loyers (non garantis) et variation du prix des parts.', fisc: 'Revenus fonciers imposés au barème + prélèvements sociaux en direct ; plus doux via assurance-vie.', fiscC: 'Revenus fonciers',
  frais: 'Frais de souscription souvent élevés (environ 8 à 12 %), frais de gestion annuels.', plus: ['Accès à l’immobilier sans gérer de locataires'], moins: ['Capital et revenus non garantis', 'Faible liquidité', 'Frais d’entrée élevés'],
  vigil: ['Des baisses de prix des parts ont eu lieu ces dernières années : le risque est réel'], exemple: 'Avec 8 à 12 % de frais d’entrée, il faut souvent plusieurs années pour seulement « rentrer dans ses frais ».' },

/* ---------- les enfants ---------- */
{ id: 'enfant-livret', fam: 'enfants', e: '🐣', nom: 'Livret A ou livret jeune au nom de l’enfant', cls: 'garanti', besoins: ['enfants', 'dispo'],
  court: 'La façon la plus simple de commencer : dès la naissance.',
  pourQui: 'Un Livret A dès la naissance ; un livret jeune à partir de 12 ans.', plafond: '22 950 € (Livret A) ; 1 600 € (livret jeune).', plafC: 'Comme les livrets',
  dispo: 'Géré par les parents ; à partir de 16 ans, l’enfant peut en principe retirer seul (sauf opposition).', dispoC: 'Immédiate',
  remun: 'Celle des livrets.', fisc: 'Exonéré.', fiscC: 'Exonéré', frais: 'Aucun.',
  plus: ['Simple, sans risque', 'Apprend l’épargne à l’enfant'], moins: ['Rendement modeste sur 18 ans'],
  vigil: ['L’argent versé appartient à l’enfant'], exemple: '20 € par mois pendant 18 ans, c’est 4 320 € versés, plus les intérêts.' },
{ id: 'enfant-av', fam: 'enfants', e: '🎁', nom: 'Assurance-vie au nom de l’enfant', cls: 'mixte', besoins: ['enfants', 'long'],
  court: 'Prendre date fiscalement très tôt, pour ses études ou son premier projet.',
  pourQui: 'Ouverte par les représentants légaux au nom du mineur.', plafond: 'Aucun.', plafC: 'Aucun',
  dispo: 'Les sommes appartiennent à l’enfant : les parents ne peuvent pas les reprendre pour eux-mêmes.', dispoC: 'Pour l’enfant uniquement',
  remun: 'Selon les supports.', fisc: 'Celle de l’assurance-vie : à 18 ans, le contrat a souvent déjà ses 8 ans.', fiscC: 'Allégée après 8 ans',
  frais: 'Comme une assurance-vie.', plus: ['Le contrat « vieillit » pendant l’enfance'], moins: ['Argent définitivement donné', 'Risque selon les supports'],
  vigil: ['Bien comprendre qu’il s’agit d’un don irrévocable'], exemple: 'Ouverte à la naissance, elle a 8 ans d’ancienneté au CE2.' },
{ id: 'peac', fam: 'enfants', e: '🌍', nom: 'PEAC (plan d’épargne avenir climat)', cls: 'perte', besoins: ['enfants', 'long'],
  court: 'Une enveloppe pour les moins de 21 ans, investie dans des fonds liés à la transition écologique.',
  pourQui: 'Les jeunes de moins de 21 ans (ouvert par les parents pour un mineur).', plafond: 'Plafond identique à celui du Livret A.', plafC: 'Comme le Livret A',
  dispo: 'Bloqué jusqu’à la majorité et pendant au moins 5 ans (sauf exceptions).', dispoC: 'Bloqué',
  remun: 'Selon les fonds éligibles (actions, obligations « vertes »).', fisc: 'Gains exonérés d’impôt et de prélèvements sociaux.', fiscC: 'Exonéré',
  frais: 'Frais plafonnés par la réglementation.', plus: ['Fiscalité très favorable'], moins: ['Argent bloqué', 'Perte en capital possible'],
  vigil: ['Récent (2024) : encore peu d’établissements le proposent'], exemple: 'Voir l’actualité « Naissance du PEAC ».' },
{ id: 'donner', fam: 'enfants', e: '💝', nom: 'Donner à ses enfants de son vivant', cls: 'garanti', besoins: ['enfants'],
  court: 'Les abattements qui permettent d’aider ses enfants sans droits de donation.',
  pourQui: 'Parents et grands-parents.', plafond: 'Abattement de 100 000 € par parent et par enfant, renouvelable tous les 15 ans ; don familial de sommes d’argent jusqu’à 31 865 € (donateur de moins de 80 ans, bénéficiaire majeur).', plafC: '100 000 € / 15 ans',
  dispo: '—', dispoC: '—', remun: '—', fisc: 'Pas de droits de donation dans les limites des abattements ; au-delà, barème des droits.', fiscC: 'Abattements',
  frais: 'Frais de notaire si acte notarié ; déclaration du don à l’administration fiscale.', plus: ['Aider au bon moment (études, logement)'], moins: ['Un don est définitif'],
  vigil: ['Déclarer le don (en ligne sur impots.gouv.fr)', 'Pour les montants importants, passer par un notaire'], exemple: 'Deux parents peuvent chacun donner 100 000 € à leur enfant sans droits, tous les 15 ans.' },

/* ---------- les placements très risqués ---------- */
{ id: 'crypto', fam: 'risque', e: '🪙', nom: 'Cryptoactifs (bitcoin…)', cls: 'perte', besoins: [],
  court: 'Des actifs numériques extrêmement volatils, sans valeur garantie.',
  pourQui: 'À n’envisager, si jamais, qu’avec une très petite somme qu’on accepte de perdre entièrement.', plafond: '—', plafC: '—',
  dispo: 'Revendables vite… au prix du moment, qui peut avoir chuté de moitié.', dispoC: 'Prix très variable',
  remun: 'Aucune rémunération propre : seulement la variation (souvent violente) du prix.',
  fisc: 'Plus-values de cession imposées (prélèvement forfaitaire) au-delà de 305 € de cessions par an ; comptes ouverts à l’étranger à déclarer.', fiscC: 'Imposable',
  frais: 'Frais de plateforme, d’achat-vente, de retrait.',
  plus: ['Accessible à tous… ce qui fait aussi leur danger'], moins: ['Variations de 50 % ou plus possibles', 'Piratages, faillites de plateformes', 'Terrain favori des arnaques'],
  vigil: ['Vérifier que la plateforme est enregistrée ou agréée auprès de l’AMF (règlement MiCA)', 'Aucun « rendement garanti » n’existe en crypto : c’est une arnaque'], exemple: 'Des cryptoactifs très connus ont perdu plus des deux tiers de leur valeur en quelques mois par le passé.' },
{ id: 'trading', fam: 'risque', e: '🎰', nom: 'Trading, CFD, Forex', cls: 'perte', besoins: [],
  court: 'Des produits spéculatifs à effet de levier : la majorité des particuliers y perdent.',
  pourQui: 'Personne qui débute.', plafond: '—', plafC: '—', dispo: 'Positions ouvertes et fermées en continu.', dispoC: '—',
  remun: 'Aucune : des paris sur des variations de prix, amplifiés par l’effet de levier.', fisc: 'Gains imposables.', fiscC: 'Imposable',
  frais: 'Écarts de prix, frais de financement, commissions.',
  plus: ['Aucun pour un débutant'], moins: ['Les plateformes doivent afficher la part de clients qui perdent : elle dépasse souvent 70 %', 'On peut perdre plus vite que sa mise ne semble le permettre'],
  vigil: ['Publicités « formation trading » et « signaux » d’influenceurs : prudence maximale'], exemple: 'Avec un levier de 10, une baisse de 10 % efface toute la mise.' },
{ id: 'atypiques', fam: 'risque', e: '🍷', nom: 'Placements atypiques (vin, montres, forêts, bétail, terres rares…)', cls: 'perte', besoins: [],
  court: 'Des « biens divers » présentés comme concrets et rassurants.',
  pourQui: 'À aborder avec la plus grande méfiance.', plafond: '—', plafC: '—', dispo: 'Revente souvent très difficile.', dispoC: 'Très faible',
  remun: 'Promesses de rendement souvent irréalistes.', fisc: 'Variable.', fiscC: 'Variable', frais: 'Souvent élevés et peu clairs.',
  plus: ['Aucun quand le vendeur promet un rendement'], moins: ['Peu ou pas de marché pour revendre', 'Nombreuses escroqueries signalées par l’AMF'],
  vigil: ['Vérifier l’enregistrement de l’intermédiaire auprès de l’AMF', 'Consulter les listes noires'], exemple: 'Voir l’espace « Anti-arnaques ».' }
];

/* ============================================================
   L'écran
   ============================================================ */
const ficheGuide = id => GUIDE.find(g => g.id === id);
function vueGuide() {
  const filtre = U.besoin || '', mode = U.guideMode || 'fiches';
  const liste = GUIDE.filter(g => !filtre || g.besoins.includes(filtre));
  const carte = g => { const c = CLASSES_PRODUIT[g.cls]; return `<button type="button" class="produit fiche-g" data-guide="${g.id}">
      <span class="tete"><span class="e">${g.e}</span><span><b>${esc(g.nom)}</b><small>${esc(g.court)}</small></span></span>
      <span class="meta"><span class="badge ${c.c}">${esc(c.lib)}</span><span class="badge">💧 ${esc(g.dispoC)}</span>${g.plafC && g.plafC !== '—' ? `<span class="badge">📏 ${esc(g.plafC)}</span>` : ''}</span>
      <span class="plus-p">Lire la fiche complète →</span></button>`; };
  return `${bandeauUnivers('finance')}
    <div class="section-titre"><h2>🏦 Le guide de l’épargne</h2><div class="droite"><span class="badge">${GUIDE.length} fiches</span></div></div>
    <p class="chapo">Tous les produits d’épargne et de placement, expliqués un par un : livrets, épargne logement, assurance-vie, PEA, PER, épargne salariale, compte-titres, supports, épargne des enfants… et les placements très risqués dont il faut se méfier. Pour chacun : pour qui, plafond, disponibilité, rémunération, fiscalité, frais, avantages, limites et pièges.</p>
    <div class="note douce"><span class="e">🧭</span><div>Aucun produit n’est « le meilleur » : chacun répond à un besoin. Les montants et règles sont ceux connus en 2025 (${esc(MAJ_GUIDE)}) ; ils évoluent, vérifiez-les sur <b>service-public.fr</b>, <b>impots.gouv.fr</b> ou <b>amf-france.org</b> avant toute décision, et demandez conseil à un professionnel compétent pour votre situation.</div></div>

    <section class="bloc"><h3 class="bloc-titre">🔺 Par où commencer ? L’ordre logique de l’épargne</h3>
      <div class="pyramide">
        <div class="etage e4"><b>4. Le long terme et la retraite</b><span>Assurance-vie, PEA, PER… seulement avec l’argent dont on n’aura pas besoin avant 8 ans ou plus. Risque de perte accepté.</span></div>
        <div class="etage e3"><b>3. Les projets à 2–8 ans</b><span>Apport immobilier, voiture, études : des supports adaptés à la date du projet, plutôt stables.</span></div>
        <div class="etage e2"><b>2. Rembourser les crédits chers</b><span>Découvert, crédit renouvelable, paiements fractionnés : leur coût dépasse ce que rapporte presque n’importe quelle épargne.</span></div>
        <div class="etage e1"><b>1. L’épargne de précaution</b><span>3 à 6 mois de dépenses (repère) sur un livret disponible et sans risque. C’est la fondation.</span></div>
      </div>
      <p class="petit-texte">Un repère pédagogique général, pas une règle : chaque situation est différente.</p>
    </section>

    <div class="sous-onglets">
      <button type="button" class="puce ${mode === 'fiches' ? 'actif' : ''}" data-guide-mode="fiches">🗂️ Les fiches</button>
      <button type="button" class="puce ${mode === 'tableau' ? 'actif' : ''}" data-guide-mode="tableau">📋 Le tableau comparatif</button>
    </div>
    <div class="puces" style="margin-bottom:16px"><button type="button" class="puce ${!filtre ? 'actif' : ''}" data-besoin="">Tous les besoins</button>${BESOINS.map(b => `<button type="button" class="puce ${filtre === b.id ? 'actif' : ''}" data-besoin="${b.id}">${b.e} ${esc(b.nom)}</button>`).join('')}</div>
    ${mode === 'tableau' ? `<div class="tableau-defile"><table class="tableau comparatif"><thead><tr><th>Produit</th><th>Risque</th><th>Disponibilité</th><th>Plafond</th><th>Fiscalité</th></tr></thead><tbody>
        ${liste.map(g => { const c = CLASSES_PRODUIT[g.cls]; return `<tr data-guide="${g.id}" class="ligne-tab"><td><b>${g.e} ${esc(g.nom)}</b></td><td><span class="badge ${c.c}">${esc(c.lib)}</span></td><td>${esc(g.dispoC)}</td><td>${esc(g.plafC)}</td><td>${esc(g.fiscC)}</td></tr>`; }).join('')}
      </tbody></table></div><p class="petit-texte">Touchez une ligne pour ouvrir la fiche complète.</p>`
    : FAMILLES_EPARGNE.map(f => { const g = liste.filter(x => x.fam === f.id); return g.length ? `<section class="bloc famille-g ${f.id === 'risque' ? 'danger-g' : ''}"><h3 class="bloc-titre">${f.e} ${esc(f.nom)}</h3><p class="petit-texte" style="margin:-6px 0 10px">${esc(f.desc)}</p><div class="produits">${g.map(carte).join('')}</div></section>` : ''; }).join('')}
    ${rappelRisque(false)}`;
}
function ficheGuideModale(id) {
  const g = ficheGuide(id), c = CLASSES_PRODUIT[g.cls];
  const ligne = (t, v) => v && v !== '—' ? `<div class="plein"><small>${t}</small><p>${v}</p></div>` : '';
  ouvrirModale(`<h3 id="modaleTitre"><span>${g.e}</span>${esc(g.nom)}</h3>
    <p class="sous">${esc(g.court)}</p>
    <div class="meta" style="margin-bottom:12px"><span class="badge ${c.c}">${esc(c.lib)}</span>${g.besoins.map(b => { const B = BESOINS.find(x => x.id === b); return `<span class="badge">${B.e} ${esc(B.nom)}</span>`; }).join('')}</div>
    <div class="fiche">
      ${ligne('Pour qui ?', esc(g.pourQui))}
      <div><small>Plafond</small><p>${esc(g.plafond)}</p></div>
      <div><small>Disponibilité de l’argent</small><p>${g.dispo}</p></div>
      ${ligne('Comment c’est rémunéré', g.remun)}
      ${ligne('Fiscalité', g.fisc)}
      ${ligne('Frais', esc(g.frais))}
      <div><small>✅ Les atouts</small><ul>${g.plus.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><small>⚖️ Les limites</small><ul>${g.moins.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="plein"><small>⚠️ Points de vigilance</small><ul>${g.vigil.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="exemple"><span class="e">💡</span><div><b>Exemple</b><p>${esc(g.exemple)}</p></div></div>
    <div class="note douce"><span class="e">🧭</span><div>Fiche générale (${esc(MAJ_GUIDE)}) : elle ne dit pas si ce produit convient à <b>votre</b> situation. Vérifiez les règles à jour sur service-public.fr, impots.gouv.fr ou amf-france.org, et demandez conseil à un professionnel compétent.${g.cls !== 'garanti' ? ' Ce produit comporte un risque de perte en capital ; les performances passées ne préjugent pas des performances futures.' : ''}</div></div>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`, null, true);
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-guide],[data-besoin],[data-guide-mode]'); if (!t) return;
  if (t.dataset.guide) return ficheGuideModale(t.dataset.guide);
  if (t.dataset.besoin !== undefined && t.matches('[data-besoin]')) { U.besoin = t.dataset.besoin; return rendre(); }
  if (t.dataset.guideMode) { U.guideMode = t.dataset.guideMode; rendre(); }
});

DICO.push(
  { m: 'Abondement', d: 'Somme versée par l’employeur en complément des versements du salarié sur un plan d’épargne salariale (PEE, PER d’entreprise).', ex: 'Pour 100 € versés, l’employeur ajoute 50 €.', a: ['PEE', 'PER'] },
  { m: 'Clause bénéficiaire', d: 'Partie d’un contrat d’assurance-vie qui désigne qui recevra les sommes au décès.', ex: '« Mon conjoint, à défaut mes enfants, par parts égales. »', a: ['Assurance-vie'] },
  { m: 'LDDS', d: 'Livret de développement durable et solidaire : livret réglementé disponible, au même taux que le Livret A.', ex: 'Plafond de 12 000 €.', a: ['Livret A', 'LEP'] },
  { m: 'LEP', d: 'Livret d’épargne populaire : livret réglementé mieux rémunéré, réservé aux revenus modestes.', ex: 'L’éligibilité se vérifie avec le revenu fiscal de référence.', a: ['Livret A', 'Revenu fiscal de référence'] },
  { m: 'Livret A', d: 'Livret d’épargne réglementé, disponible, sans risque et sans impôt.', ex: 'Plafond de 22 950 €.', a: ['LDDS', 'Épargne de précaution'] },
  { m: 'PEE', d: 'Plan d’épargne entreprise : épargne salariale bloquée 5 ans (sauf exceptions), souvent abondée par l’employeur.', ex: 'On peut y placer sa prime d’intéressement.', a: ['Abondement'] },
  { m: 'PER', d: 'Plan d’épargne retraite : épargne bloquée jusqu’à la retraite (sauf exceptions), versements déductibles du revenu imposable dans une limite.', ex: 'Plus le taux marginal est élevé, plus la déduction fait économiser d’impôt.', a: ['Taux marginal', 'Déduction'] },
  { m: 'Rachat', d: 'Retrait d’argent d’un contrat d’assurance-vie, partiel ou total.', ex: 'Seule la part de gains contenue dans le rachat est imposée.', a: ['Assurance-vie'] }
);
