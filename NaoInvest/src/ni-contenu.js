/* ============================================================
   NaoInvest — le contenu pédagogique.
   Leçons (et leurs quiz), parcours, fiches produits, dictionnaire,
   actualités expliquées, anti-arnaques, défis et badges.
   Tout est rédigé à titre éducatif : aucune recommandation personnalisée,
   aucun produit « meilleur » qu'un autre, aucune promesse de gain.

   Une question de quiz :
     { q, c: [choix…], b: index de la bonne réponse, x: explication }
     { q, n: réponse chiffrée, tol: tolérance, u: unité, x: explication }
   ============================================================ */

const ESPACES = {
  bases:    { nom: 'Mes bases financières', court: 'Mes bases', e: '🧮' },
  epargne:  { nom: 'Épargner et investir',  court: 'Épargner & investir', e: '🌱' },
  bourse:   { nom: 'Découvrir la Bourse',   court: 'La Bourse', e: '📈' },
  arnaques: { nom: 'Anti-arnaques',         court: 'Anti-arnaques', e: '🛡️' }
};

const NIVEAUX = [
  { n: 1, nom: 'Découverte',       e: '✦', desc: 'Les premiers mots de l’argent, sans pression.' },
  { n: 2, nom: 'Bases',            e: '✧', desc: 'Budget, crédit, inflation, premiers pas en Bourse.' },
  { n: 3, nom: 'Autonomie',        e: '★', desc: 'Produits, enveloppes, indices et ETF : comprendre seul·e.' },
  { n: 4, nom: 'Approfondissement', e: '✪', desc: 'Frais, volatilité, diversification, temps long.' }
];

const LECONS = [
/* ==================== ESPACE 1 — MES BASES FINANCIÈRES ==================== */
{ id: 'b-mots', esp: 'bases', niv: 1, min: 5, e: '💶', titre: 'Revenus, dépenses et reste à vivre',
  intro: 'Avant de parler de placements, il faut savoir d’où vient l’argent et où il va. Cinq mots suffisent.',
  sections: [
    { h: 'Les revenus', p: 'C’est tout ce qui entre sur votre compte : salaire, pension, allocations, revenus d’une activité, loyers perçus… On regarde en général le <b>montant net</b>, celui qui arrive vraiment.' },
    { h: 'Les dépenses fixes', p: 'Elles reviennent chaque mois, au même montant ou presque : loyer ou mensualité de crédit, assurances, abonnements, électricité, téléphone. On les connaît à l’avance, c’est leur force… et leur poids.' },
    { h: 'Les dépenses variables', p: 'Elles changent d’un mois à l’autre : courses, carburant, sorties, vêtements, cadeaux. C’est souvent là que l’argent « file » sans qu’on s’en rende compte.' },
    { h: 'L’épargne et le reste à vivre', p: 'L’<b>épargne</b>, c’est la part qu’on met de côté. Le <b>reste à vivre</b>, c’est ce qui reste une fois les dépenses fixes payées : c’est avec lui qu’on fait les courses, qu’on se déplace, qu’on vit.' }
  ],
  exemple: 'Léo gagne 1 900 € net. Ses dépenses fixes (loyer, assurances, abonnements) font 850 €. Son reste à vivre est donc de 1 050 € pour le mois : courses, transport, loisirs… et épargne.',
  retenir: ['Revenus − dépenses fixes = reste à vivre.', 'Les dépenses variables se pilotent ; les fixes se renégocient.', 'L’épargne est une « dépense » qu’on se fait à soi-même.'],
  quiz: [
    { q: 'Un abonnement de téléphone à 15 € par mois est plutôt…', c: ['Une dépense fixe', 'Une dépense variable', 'Un revenu', 'De l’épargne'], b: 0, x: 'Il revient chaque mois au même montant : c’est une dépense fixe.' },
    { q: 'Les courses alimentaires sont en général…', c: ['Une dépense fixe', 'Une dépense variable', 'Une épargne'], b: 1, x: 'Leur montant change d’un mois à l’autre : ce sont des dépenses variables.' },
    { q: 'Cas pratique : revenus 2 000 €, dépenses fixes 900 €. Quel est le reste à vivre (en €) ?', n: 1100, tol: 0, u: '€', x: '2 000 − 900 = 1 100 €.' },
    { q: 'Le reste à vivre sert à…', c: ['Payer le loyer', 'Les dépenses du quotidien et l’épargne', 'Rembourser le découvert uniquement'], b: 1, x: 'Il se calcule après les dépenses fixes : il couvre le quotidien, et une partie peut être épargnée.' }
  ] },

{ id: 'b-budget', esp: 'bases', niv: 1, min: 7, e: '📒', titre: 'Construire son budget en 4 étapes',
  intro: 'Un budget n’est pas une punition : c’est une carte. Elle montre où l’on est, pour décider où l’on va.',
  sections: [
    { h: '1. Tout noter pendant un mois', p: 'Relevés bancaires, tickets, paiements en espèces : on liste tout, sans juger. Le but est de voir, pas de culpabiliser.' },
    { h: '2. Ranger par familles', p: 'Logement, transport, alimentation, santé, loisirs, abonnements, épargne… Cinq à dix familles suffisent pour y voir clair.' },
    { h: '3. Fixer des repères', p: 'Certains utilisent la méthode « 50 / 30 / 20 » : 50 % pour les besoins, 30 % pour les envies, 20 % pour l’épargne. C’est un <b>repère</b> parmi d’autres, pas une règle : chaque situation est différente.' },
    { h: '4. Comparer et ajuster chaque mois', p: 'On compare le prévu et le réel. Un écart n’est pas un échec : c’est une information pour le mois suivant.' }
  ],
  exemple: 'Inès a noté ses dépenses : 180 € de repas livrés en un mois. Elle ne les supprime pas, elle décide d’en garder la moitié — et découvre qu’elle peut épargner 90 € de plus.',
  retenir: ['On observe avant de décider.', 'Les repères (50/30/20…) aident, ils n’obligent pas.', 'Un budget se revoit chaque mois.'],
  quiz: [
    { q: 'La première étape d’un budget, c’est…', c: ['Couper toutes les sorties', 'Noter toutes ses dépenses pendant un mois', 'Ouvrir un livret'], b: 1, x: 'On commence par observer : sans données, on décide à l’aveugle.' },
    { q: 'Avec la méthode 50/30/20 et 2 000 € de revenus, combien va à l’épargne (en €) ?', n: 400, tol: 0, u: '€', x: '20 % de 2 000 € = 400 €. C’est un repère de calcul, pas une obligation.' },
    { q: 'La méthode 50/30/20 est…', c: ['Une règle légale', 'Un repère parmi d’autres', 'La seule bonne méthode'], b: 1, x: 'C’est un repère simple. Chaque foyer adapte selon sa situation.' },
    { q: 'Ce mois-ci, vous avez dépensé plus que prévu en loisirs. Le bon réflexe ?', c: ['Abandonner le budget', 'Comprendre l’écart et ajuster le mois suivant', 'Prendre un crédit'], b: 1, x: 'Un écart est une information : on ajuste, sans culpabiliser.' }
  ] },

{ id: 'b-precaution', esp: 'bases', niv: 1, min: 5, e: '☂️', titre: 'L’épargne de précaution',
  intro: 'Une machine à laver qui lâche, une réparation de voiture, un mois difficile : l’épargne de précaution est le parapluie du budget.',
  sections: [
    { h: 'À quoi elle sert', p: 'Faire face à un imprévu <b>sans découvert ni crédit</b>. Elle protège aussi les autres projets : on n’a pas besoin de tout casser au premier coup dur.' },
    { h: 'Combien ?', p: 'On entend souvent « trois à six mois de dépenses courantes ». C’est un <b>repère courant</b>, pas une règle : un indépendant, une famille nombreuse ou une personne seule n’ont pas les mêmes besoins.' },
    { h: 'Où la garder ?', p: 'Elle doit être <b>disponible rapidement</b> et <b>sans risque de perte</b> : c’est pourquoi on la garde souvent sur un support d’épargne disponible, et non sur un placement qui peut baisser.' },
    { h: 'La construire petit à petit', p: 'Un virement automatique, même modeste, le jour de la paie. 30 € par mois, c’est 360 € au bout d’un an.' }
  ],
  exemple: 'Sami a 2 000 € de côté sur un livret. Quand sa voiture tombe en panne (650 €), il paie sans découvert, puis reconstitue son épargne en quelques mois.',
  retenir: ['Elle sert aux imprévus, pas aux projets.', 'Disponible et sans risque de perte.', 'Le montant dépend de chaque situation.'],
  quiz: [
    { q: 'L’épargne de précaution doit surtout être…', c: ['Très rémunérée, même risquée', 'Disponible rapidement et sans risque de perte', 'Bloquée 8 ans'], b: 1, x: 'Son rôle est d’être là le jour de l’imprévu, au montant attendu.' },
    { q: 'Un virement automatique de 25 € par mois, cela fait combien en un an (en €) ?', n: 300, tol: 0, u: '€', x: '25 × 12 = 300 €.' },
    { q: '« Trois à six mois de dépenses », c’est…', c: ['Une obligation légale', 'Un repère courant à adapter', 'Un maximum à ne pas dépasser'], b: 1, x: 'C’est un repère souvent cité ; chacun l’adapte à sa situation.' },
    { q: 'Placer son épargne de précaution en actions est risqué parce que…', c: ['Les actions sont interdites', 'Leur valeur peut baisser au moment où l’on en a besoin', 'On ne peut pas en acheter'], b: 1, x: 'Le jour de l’imprévu, la valeur pourrait être en baisse : on risquerait de vendre à perte.' }
  ] },

{ id: 'b-decouvert', esp: 'bases', niv: 2, min: 6, e: '🕳️', titre: 'Découvert et agios',
  intro: 'Être « à découvert », c’est avoir un solde négatif. La banque avance l’argent… et le fait payer.',
  sections: [
    { h: 'Autorisé ou non', p: 'Le <b>découvert autorisé</b> est prévu dans votre convention de compte (un montant maximum, une durée). Au-delà, on parle de découvert non autorisé : frais et incidents peuvent s’ajouter.' },
    { h: 'Les agios', p: 'Ce sont les <b>intérêts</b> (et parfois des commissions) facturés pour la période passée en négatif. Ils se calculent selon le montant, le nombre de jours et le taux annuel indiqué par la banque.' },
    { h: 'Le calcul, simplement', p: 'Intérêts ≈ montant du découvert × taux annuel × nombre de jours ÷ 365. Les taux du découvert sont souvent élevés, bien plus que ceux d’un crédit classique.' },
    { h: 'Pour l’éviter', p: 'Connaître ses dates de prélèvement, garder une petite marge sur le compte, et construire une épargne de précaution.' }
  ],
  exemple: 'Découvert de 300 € pendant 10 jours à un taux annuel de 16 % : 300 × 0,16 × 10 ÷ 365 ≈ 1,32 € d’intérêts, auxquels peuvent s’ajouter des frais selon la banque.',
  retenir: ['Le découvert est un crédit très court, et souvent cher.', 'Les agios dépendent du montant, du taux et de la durée.', 'Votre convention de compte précise les conditions.'],
  quiz: [
    { q: 'Les agios, ce sont…', c: ['Des intérêts et frais liés au découvert', 'Des intérêts gagnés sur un livret', 'Une prime de la banque'], b: 0, x: 'Ils rémunèrent l’argent que la banque vous a avancé.' },
    { q: 'Où trouve-t-on les conditions de son découvert autorisé ?', c: ['Sur les réseaux sociaux', 'Dans sa convention de compte', 'Nulle part'], b: 1, x: 'La convention de compte (et ses tarifs) précise montant, durée et taux.' },
    { q: 'Cas pratique : 500 € de découvert pendant 73 jours à 10 % par an. Intérêts approximatifs (en €) ?', n: 10, tol: 0.2, u: '€', x: '500 × 0,10 × 73 ÷ 365 = 10 €.' },
    { q: 'Plus le découvert dure longtemps…', c: ['Moins il coûte', 'Plus les intérêts augmentent', 'Rien ne change'], b: 1, x: 'Les intérêts sont proportionnels au nombre de jours.' }
  ] },

{ id: 'b-credit', esp: 'bases', niv: 2, min: 8, e: '🏦', titre: 'Crédit et taux d’endettement',
  intro: 'Un crédit permet de réaliser un projet tout de suite et de le payer plus tard. Il a un coût, et une limite de bon sens.',
  sections: [
    { h: 'Ce que coûte un crédit', p: 'On rembourse le <b>capital</b> emprunté, plus des <b>intérêts</b>, plus souvent une <b>assurance</b> et des frais. Le <b>TAEG</b> (taux annuel effectif global) rassemble ces coûts : c’est lui qui permet de comparer des offres.' },
    { h: 'Le taux d’endettement', p: 'C’est la part des revenus consacrée aux remboursements de crédits : (mensualités ÷ revenus) × 100. Pour le crédit immobilier, les banques en France suivent un repère fixé par le Haut Conseil de stabilité financière : <b>35 % maximum, assurance comprise</b>, avec des exceptions possibles.' },
    { h: 'Le reste à vivre compte aussi', p: '35 % de 1 500 € ou de 6 000 € ne laissent pas le même montant pour vivre. Les prêteurs regardent donc aussi ce qui reste une fois les crédits payés.' },
    { h: 'Crédit renouvelable : prudence', p: 'Il se reconstitue au fil des remboursements, et son coût est souvent élevé. Avant de signer, on lit le TAEG et le coût total.' }
  ],
  exemple: 'Nora gagne 2 500 € par mois et rembourse 700 € de crédits : 700 ÷ 2 500 × 100 = 28 % de taux d’endettement.',
  retenir: ['Comparer les offres avec le TAEG.', 'Taux d’endettement = mensualités ÷ revenus × 100.', 'Le repère de 35 % concerne surtout le crédit immobilier.'],
  quiz: [
    { q: 'Pour comparer deux offres de crédit, on regarde surtout…', c: ['La couleur de la brochure', 'Le TAEG et le coût total', 'Le nom de la banque'], b: 1, x: 'Le TAEG inclut intérêts, assurance obligatoire et frais : il rend les offres comparables.' },
    { q: 'Cas pratique : revenus 3 000 €, mensualités 900 €. Taux d’endettement (en %) ?', n: 30, tol: 0, u: '%', x: '900 ÷ 3 000 × 100 = 30 %.' },
    { q: 'Le repère de 35 % en crédit immobilier inclut…', c: ['L’assurance emprunteur', 'Les courses', 'L’épargne'], b: 0, x: 'Le repère du HCSF s’entend assurance comprise.' },
    { q: 'Un taux d’endettement faible garantit-il un budget confortable ?', c: ['Oui, toujours', 'Non, il faut aussi regarder le reste à vivre'], b: 1, x: 'Le reste à vivre dit combien il reste pour vivre au quotidien.' }
  ] },

{ id: 'b-horizons', esp: 'bases', niv: 2, min: 5, e: '🧭', titre: 'Épargne disponible, moyen terme, long terme',
  intro: 'Toute épargne n’a pas le même rôle. La question clé : « Quand vais-je avoir besoin de cet argent ? »',
  sections: [
    { h: 'L’épargne disponible', p: 'Pour les imprévus et les dépenses proches (quelques mois). Elle doit pouvoir être retirée vite, sans perte.' },
    { h: 'L’épargne à moyen terme', p: 'Pour un projet dans 2 à 5 ans environ : un apport, une voiture, des études. On cherche un équilibre entre sécurité et rendement, selon le projet.' },
    { h: 'L’épargne à long terme', p: 'Pour dans 8 ans ou plus : la retraite, un capital pour ses enfants. Plus l’horizon est long, plus on peut <b>traverser</b> des périodes de baisse — sans que cela soit jamais garanti.' },
    { h: 'Des tiroirs, pas un seul pot', p: 'Séparer son épargne en « tiroirs » évite de puiser dans l’épargne de long terme au premier imprévu.' }
  ],
  exemple: 'Camille range son argent dans trois tiroirs : 3 000 € disponibles pour les imprévus, 5 000 € pour un apport dans 4 ans, et 50 € par mois pour le très long terme.',
  retenir: ['L’horizon, c’est la date du besoin.', 'Disponible, moyen terme, long terme : trois rôles différents.', 'Un long horizon ne supprime jamais le risque.'],
  quiz: [
    { q: 'Un voyage prévu dans 3 mois, c’est plutôt de l’épargne…', c: ['Disponible / court terme', 'Long terme', 'Retraite'], b: 0, x: 'Le besoin est proche : l’argent doit être disponible et stable.' },
    { q: 'La question clé pour ranger son épargne est…', c: ['Quel produit rapporte le plus ?', 'Quand aurai-je besoin de cet argent ?', 'Que fait mon voisin ?'], b: 1, x: 'L’horizon guide le choix du type d’épargne.' },
    { q: 'Un horizon long…', c: ['Supprime tout risque', 'Laisse plus de temps pour traverser des baisses, sans garantie'], b: 1, x: 'Le temps aide souvent, mais ne garantit jamais rien.' },
    { q: 'Pourquoi séparer son épargne en « tiroirs » ?', c: ['Pour payer plus de frais', 'Pour ne pas toucher au long terme au premier imprévu', 'C’est obligatoire'], b: 1, x: 'Chaque tiroir a son rôle ; l’épargne de long terme reste à l’abri des imprévus.' }
  ] },

{ id: 'b-inflation', esp: 'bases', niv: 2, min: 6, e: '🎈', titre: 'L’inflation et le pouvoir d’achat',
  intro: 'Quand les prix montent, un même billet achète un peu moins. C’est l’inflation.',
  sections: [
    { h: 'Définition', p: 'L’<b>inflation</b> est la hausse générale et durable des prix. En France, l’Insee la mesure avec l’indice des prix à la consommation.' },
    { h: 'Le pouvoir d’achat', p: 'C’est ce qu’on peut acheter avec ses revenus. Si les prix montent de 3 % et les revenus de 1 %, le pouvoir d’achat baisse.' },
    { h: 'Et l’épargne ?', p: 'Un argent qui dort sans rémunération perd du pouvoir d’achat quand il y a de l’inflation. On compare donc le taux d’un placement à l’inflation : c’est le <b>rendement réel</b> (rendement − inflation, en simplifiant).' },
    { h: 'Rien d’automatique', p: 'Aucun placement ne « bat » l’inflation à coup sûr. Il faut toujours regarder le risque qui accompagne un rendement plus élevé.' }
  ],
  exemple: 'Avec 2 % d’inflation, un panier de courses de 100 € coûte environ 102 € un an plus tard. Un billet de 100 € gardé sous le matelas achète donc un peu moins.',
  retenir: ['Inflation = hausse générale des prix.', 'Rendement réel ≈ rendement − inflation.', 'Aucun placement ne protège à coup sûr de l’inflation.'],
  quiz: [
    { q: 'Un article coûte 100 € ; l’inflation est de 3 % sur un an. Son prix un an plus tard (en €) ?', n: 103, tol: 0, u: '€', x: '100 × 1,03 = 103 €.' },
    { q: 'Un livret rapporte 2 % et l’inflation est de 3 %. Le rendement réel est…', c: ['Positif', 'Négatif (environ −1 %)', 'Nul'], b: 1, x: '2 % − 3 % ≈ −1 % : le pouvoir d’achat de l’épargne recule.' },
    { q: 'Qui mesure l’inflation en France ?', c: ['L’Insee', 'Les influenceurs', 'Chaque magasin'], b: 0, x: 'L’Insee publie chaque mois l’indice des prix à la consommation.' },
    { q: 'Un placement qui « bat toujours l’inflation »…', c: ['Existe, c’est garanti', 'N’existe pas : il faut se méfier de cette promesse'], b: 1, x: 'Aucune protection n’est certaine ; méfiez-vous des promesses de ce type.' }
  ] },

{ id: 'b-projet', esp: 'bases', niv: 2, min: 6, e: '🎯', titre: 'Préparer un projet : objectif, montant, date',
  intro: 'Un projet devient réalisable quand il a un montant et une date. Le reste, c’est du calcul… et de la patience.',
  sections: [
    { h: 'Un objectif clair', p: '« Partir en voyage » devient « 1 800 € pour l’été prochain ». Un objectif précis se mesure, donc se suit.' },
    { h: 'Le calcul de base', p: 'Montant à épargner par mois ≈ montant visé ÷ nombre de mois restants (sans compter d’éventuels intérêts). C’est simple, et souvent suffisant.' },
    { h: 'L’horizon choisit le support', p: 'Un projet à 12 mois supporte mal une baisse de valeur : on privilégie en général des supports sans risque de perte. Plus le projet est lointain, plus les options s’élargissent — avec leurs risques.' },
    { h: 'Prévoir une marge', p: 'Les prix changent, les imprévus existent : ajouter 5 à 10 % au budget du projet évite les mauvaises surprises.' }
  ],
  exemple: 'Yanis vise 2 400 € dans 12 mois pour son permis et une petite voiture d’occasion : 2 400 ÷ 12 = 200 € à mettre de côté chaque mois.',
  retenir: ['Un montant + une date = un projet.', 'Mensualité ≈ montant ÷ nombre de mois.', 'Projet proche = support sans risque de perte, en général.'],
  quiz: [
    { q: 'Cas pratique : 3 000 € à réunir en 15 mois. Combien épargner par mois (en €) ?', n: 200, tol: 0, u: '€', x: '3 000 ÷ 15 = 200 € par mois.' },
    { q: 'Pour un projet dans 10 mois, un support qui peut perdre 20 % est…', c: ['Adapté, car il peut rapporter plus', 'Peu adapté : une baisse pourrait compromettre le projet'], b: 1, x: 'L’horizon est court : une baisse n’aurait pas le temps d’être rattrapée.' },
    { q: 'Pourquoi ajouter une marge au budget ?', c: ['Pour les imprévus et les hausses de prix', 'Pour payer plus d’impôts'], b: 0, x: 'La marge absorbe les écarts entre le prévu et le réel.' },
    { q: 'Quel objectif est le plus facile à suivre ?', c: ['« Épargner un peu »', '« 1 500 € d’ici juin »'], b: 1, x: 'Un montant et une date rendent le suivi possible.' }
  ] },

/* ==================== ESPACE 2 — ÉPARGNER ET INVESTIR ==================== */
{ id: 'e-risque', esp: 'epargne', niv: 2, min: 6, e: '⚖️', titre: 'Risque et rendement : un couple inséparable',
  intro: 'C’est la règle la plus importante de ce parcours : plus un placement peut rapporter, plus il peut aussi faire perdre.',
  sections: [
    { h: 'Le rendement', p: 'C’est ce que rapporte un placement : intérêts, dividendes, loyers, plus-values. Il peut être connu d’avance (un livret) ou incertain (des actions).' },
    { h: 'Le risque', p: 'C’est la possibilité que le résultat soit différent de ce qu’on espérait — y compris une <b>perte d’une partie ou de la totalité</b> de l’argent placé.' },
    { h: 'Pourquoi ils vont ensemble', p: 'Personne n’accepte de prendre un risque sans espérer être rémunéré pour cela. À l’inverse, un placement sans risque rapporte en général peu.' },
    { h: 'Le signal d’alarme', p: 'Un rendement élevé présenté comme <b>« garanti »</b> ou <b>« sans risque »</b> est un signal d’alerte majeur : c’est la marque de nombreuses arnaques.' }
  ],
  exemple: 'Deux placements fictifs : A rapporte presque toujours un petit peu ; B peut gagner beaucoup une année et perdre beaucoup la suivante. Aucun n’est « meilleur » : ils ne répondent pas au même besoin.',
  retenir: ['Rendement espéré plus élevé = risque plus élevé.', 'Le risque inclut la perte en capital.', '« Rendement élevé garanti » = alerte.'],
  quiz: [
    { q: 'Un placement annonce 12 % par an « garantis, sans risque ». Votre réaction ?', c: ['Super affaire', 'Méfiance : c’est un signal d’alerte classique'], b: 1, x: 'Rendement élevé et absence de risque ne vont pas ensemble : c’est typique d’une arnaque.' },
    { q: 'En général, un placement sans risque…', c: ['Rapporte beaucoup', 'Rapporte peu'], b: 1, x: 'L’absence de risque se paie par un rendement modeste.' },
    { q: 'Le risque d’un placement, c’est notamment…', c: ['La possibilité de perdre une partie de son argent', 'Seulement les frais'], b: 0, x: 'Le risque inclut la perte en capital, partielle ou totale.' },
    { q: 'Existe-t-il un « meilleur » placement pour tout le monde ?', c: ['Oui', 'Non : cela dépend de la situation, de l’horizon et du rapport au risque de chacun'], b: 1, x: 'Chaque situation est différente ; c’est pourquoi on ne classe jamais un produit comme meilleur en général.' }
  ] },

{ id: 'e-horizon', esp: 'epargne', niv: 3, min: 5, e: '⏳', titre: 'Horizon de placement et liquidité',
  intro: 'Deux questions à se poser avant tout placement : « Combien de temps ? » et « Puis-je récupérer mon argent facilement ? »',
  sections: [
    { h: 'L’horizon de placement', p: 'C’est la durée pendant laquelle on prévoit de laisser l’argent placé. Chaque produit est généralement associé à un horizon : quelques mois pour un livret, plusieurs années pour des actions.' },
    { h: 'La liquidité', p: 'C’est la facilité à récupérer son argent : immédiatement (un livret), sous quelques jours (des titres cotés, avec un prix qui varie), ou parfois après des mois (certains placements immobiliers).' },
    { h: 'Bloqué ne veut pas dire sûr', p: 'Un placement peu liquide n’est pas plus sûr pour autant. Et un placement liquide peut avoir une valeur qui varie beaucoup.' },
    { h: 'Aligner les deux', p: 'On évite de placer sur un support peu liquide un argent dont on pourrait avoir besoin bientôt.' }
  ],
  exemple: 'Des parts de fonds immobilier fictives peuvent mettre plusieurs mois à être revendues si beaucoup de gens veulent sortir en même temps : l’argent n’est pas « perdu », mais il n’est pas disponible.',
  retenir: ['Horizon = combien de temps.', 'Liquidité = en combien de temps je récupère mon argent.', 'Peu liquide ≠ plus sûr.'],
  quiz: [
    { q: 'La liquidité d’un placement, c’est…', c: ['Son rendement', 'La facilité à récupérer son argent'], b: 1, x: 'C’est la vitesse et la facilité pour retrouver son argent.' },
    { q: 'Un placement difficile à revendre est-il forcément plus sûr ?', c: ['Oui', 'Non'], b: 1, x: 'La liquidité et le risque sont deux choses différentes.' },
    { q: 'Pour un argent dont on pourrait avoir besoin dans 2 mois, on privilégie en général…', c: ['Un support liquide et stable', 'Un support bloqué plusieurs années'], b: 0, x: 'Un besoin proche demande disponibilité et stabilité.' },
    { q: 'Des titres cotés sont souvent liquides, mais…', c: ['Leur prix de vente est connu d’avance', 'Leur prix au moment de la vente peut être en baisse'], b: 1, x: 'On peut vendre vite, mais au prix du moment, qui peut être plus bas.' }
  ] },

{ id: 'e-diversif', esp: 'epargne', niv: 3, min: 5, e: '🧺', titre: 'Ne pas mettre tous ses œufs dans le même panier',
  intro: 'La diversification consiste à répartir son épargne sur plusieurs supports, pour qu’un seul problème ne fasse pas tout tomber.',
  sections: [
    { h: 'Le principe', p: 'Si tout est placé sur une seule entreprise et qu’elle a des difficultés, tout est touché. Réparti sur plusieurs, un coup dur pèse moins sur l’ensemble.' },
    { h: 'Diversifier quoi ?', p: 'Les types de supports (épargne disponible, obligations, actions, immobilier…), les secteurs, les pays, et même les moments où l’on place (en plusieurs fois).' },
    { h: 'Ce qu’elle ne fait pas', p: 'La diversification <b>réduit</b> certains risques, elle ne les <b>supprime</b> pas. Lors d’une crise générale, beaucoup de placements peuvent baisser en même temps.' },
    { h: 'Diversifié ≠ compliqué', p: 'Posséder vingt produits que l’on ne comprend pas n’est pas diversifier : c’est se perdre. Mieux vaut peu de supports bien compris.' }
  ],
  exemple: 'Dans le portefeuille fictif de NaoInvest, une « crise sectorielle » fait chuter l’action fictive. Ceux qui avaient tout mis dessus voient leur portefeuille plonger ; ceux qui avaient réparti amortissent le choc.',
  retenir: ['Répartir limite l’impact d’un problème isolé.', 'La diversification ne supprime pas le risque.', 'Comprendre chaque support reste indispensable.'],
  quiz: [
    { q: 'La diversification permet surtout de…', c: ['Supprimer tout risque', 'Limiter l’impact d’un problème sur une seule entreprise ou un seul secteur'], b: 1, x: 'Elle réduit certains risques, sans jamais les supprimer.' },
    { q: 'Lors d’une crise générale…', c: ['Un portefeuille diversifié ne baisse jamais', 'Beaucoup de supports peuvent baisser ensemble'], b: 1, x: 'En crise générale, les baisses peuvent toucher presque tout.' },
    { q: 'Avoir 20 produits qu’on ne comprend pas, c’est…', c: ['Être bien diversifié', 'Prendre le risque de ne plus savoir ce qu’on possède'], b: 1, x: 'La compréhension passe avant le nombre de produits.' },
    { q: 'Placer en plusieurs fois plutôt qu’en une seule, c’est diversifier…', c: ['Dans le temps', 'Géographiquement'], b: 0, x: 'On répartit les moments d’entrée : c’est une diversification dans le temps.' }
  ] },

{ id: 'e-capital', esp: 'epargne', niv: 3, min: 6, e: '🔍', titre: 'Garanti, variable, perte en capital : bien distinguer',
  intro: 'Trois familles de supports, trois comportements. Savoir les reconnaître, c’est la moitié du chemin.',
  sections: [
    { h: 'Capital garanti', p: 'Vous récupérez au minimum ce que vous avez versé (hors frais éventuels), selon les conditions du produit : c’est le cas des livrets réglementés, par exemple. La garantie a toujours un <b>garant</b> (l’État, une banque, un assureur) : elle vaut ce que vaut ce garant.' },
    { h: 'Capital qui peut varier', p: 'La valeur bouge avec le temps. Par exemple, une obligation gardée jusqu’à son échéance est en principe remboursée, mais sa valeur peut baisser entre-temps si on la revend — et l’émetteur peut faire défaut.' },
    { h: 'Risque de perte en capital', p: 'Actions, ETF, la plupart des fonds, l’immobilier papier : la valeur peut baisser durablement et vous pouvez récupérer <b>moins</b> que ce que vous avez versé — voire, dans certains cas, perdre tout.' },
    { h: 'Où le lire ?', p: 'Dans le <b>document d’informations clés</b> (DIC) des produits concernés : il donne un indicateur de risque de 1 (plus faible) à 7 (plus élevé) et des scénarios de performance, qui ne sont jamais des promesses.' }
  ],
  exemple: 'Un fonds fictif affiche un indicateur de risque de 6 sur 7 dans son DIC : cela signifie que sa valeur peut fortement varier, à la hausse comme à la baisse.',
  retenir: ['Garanti = selon les conditions et la solidité du garant.', 'Variable ≠ garanti.', 'Le DIC indique un niveau de risque de 1 à 7.'],
  quiz: [
    { q: 'Des actions font partie des supports…', c: ['À capital garanti', 'Avec risque de perte en capital'], b: 1, x: 'La valeur d’une action peut baisser, parfois beaucoup.' },
    { q: 'Le DIC d’un produit indique un risque de 1 à 7. Un 7 signifie…', c: ['Le risque le plus faible', 'Le risque le plus élevé'], b: 1, x: '1 = risque le plus faible, 7 = risque le plus élevé.' },
    { q: 'Une garantie en capital dépend…', c: ['De la solidité de celui qui la donne', 'De rien, elle est absolue'], b: 0, x: 'Une garantie vaut ce que vaut le garant et les conditions du contrat.' },
    { q: 'Les scénarios de performance d’un DIC sont…', c: ['Des promesses de gain', 'Des illustrations, sans garantie'], b: 1, x: 'Ce sont des simulations ; les performances passées ou estimées ne préjugent pas du futur.' }
  ] },

{ id: 'e-enveloppes', esp: 'epargne', niv: 3, min: 8, e: '✉️', titre: 'Produit ou enveloppe ? Livret, assurance-vie, PEA, compte-titres',
  intro: 'On confond souvent le « contenant » et le « contenu ». Une enveloppe est un cadre (avec ses règles et sa fiscalité) ; les produits sont ce qu’on met dedans.',
  sections: [
    { h: 'Les livrets', p: 'Ce sont à la fois le contenant et le contenu : on y dépose de l’argent, rémunéré à un taux fixé (par les pouvoirs publics pour les livrets réglementés, par la banque pour les autres).' },
    { h: 'L’assurance-vie', p: 'Une enveloppe qui peut contenir un <b>fonds en euros</b> (capital en principe garanti par l’assureur) et des <b>unités de compte</b> (fonds, ETF, immobilier papier… sans garantie en capital). Sa fiscalité et ses règles de transmission sont particulières : à vérifier selon sa situation.' },
    { h: 'Le PEA', p: 'Le plan d’épargne en actions est une enveloppe réservée principalement aux actions européennes (et aux fonds et ETF éligibles). Il a un plafond de versements et des règles de retrait : un avantage fiscal existe après 5 ans, dans les conditions prévues par la loi.' },
    { h: 'Le compte-titres', p: 'Une enveloppe sans plafond, pour détenir presque tous les titres (actions, obligations, fonds, ETF), en France comme à l’étranger, sans avantage fiscal particulier.' }
  ],
  exemple: 'Deux personnes détiennent « le même ETF fictif » : l’une dans un PEA, l’autre dans un compte-titres. Le produit est identique ; les règles de retrait et la fiscalité, non.',
  retenir: ['Enveloppe = cadre et fiscalité ; produit = contenu.', 'Assurance-vie : fonds en euros et/ou unités de compte.', 'Règles et fiscalité à vérifier sur une source officielle.'],
  quiz: [
    { q: 'Le PEA est…', c: ['Une action', 'Une enveloppe qui contient des actions et fonds éligibles'], b: 1, x: 'C’est un cadre fiscal ; ce qu’on y met, ce sont des titres.' },
    { q: 'Dans une assurance-vie, les unités de compte…', c: ['Sont garanties en capital', 'Présentent un risque de perte en capital'], b: 1, x: 'Seul le fonds en euros est en principe garanti par l’assureur ; les unités de compte ne le sont pas.' },
    { q: 'Le compte-titres a-t-il un plafond de versements ?', c: ['Oui, très bas', 'Non'], b: 1, x: 'Le compte-titres ordinaire n’a pas de plafond.' },
    { q: 'Où vérifier les règles fiscales à jour ?', c: ['Sur une source officielle (impots.gouv.fr, service-public.fr) ou auprès d’un professionnel', 'Dans une vidéo d’influenceur'], b: 0, x: 'La fiscalité change : on la vérifie à la source, ou avec un professionnel compétent.' }
  ] },

{ id: 'e-frais', esp: 'epargne', niv: 4, min: 6, e: '🧾', titre: 'Les frais et la fiscalité : ce qu’il faut vérifier',
  intro: 'Deux placements identiques peuvent donner des résultats très différents… à cause des frais.',
  sections: [
    { h: 'Les frais les plus courants', p: 'Frais d’entrée (sur chaque versement), frais de gestion (chaque année), frais de transaction (à chaque achat ou vente de titres), frais d’arbitrage, droits de garde…' },
    { h: 'L’effet du temps', p: 'Des frais annuels de 2 % au lieu de 0,5 % paraissent petits, mais ils s’appliquent chaque année, sur un montant qui grandit : au bout de 20 ans, l’écart peut devenir important.' },
    { h: 'La fiscalité', p: 'Intérêts, dividendes et plus-values peuvent être soumis à l’impôt et aux prélèvements sociaux, sauf régime particulier (certains livrets, enveloppes sous conditions). Les règles évoluent : on les vérifie sur <b>impots.gouv.fr</b> ou <b>service-public.fr</b>.' },
    { h: 'Où trouver les frais ?', p: 'Dans la brochure tarifaire, les conditions générales et le DIC. Si les frais ne sont pas clairs, c’est déjà une information.' }
  ],
  exemple: 'Sur 10 000 € placés, des frais de gestion de 1 % par an représentent 100 € la première année, que le placement ait gagné ou perdu.',
  retenir: ['Les frais s’appliquent même quand le placement baisse.', 'Un petit pourcentage devient grand avec le temps.', 'La fiscalité se vérifie à la source officielle.'],
  quiz: [
    { q: 'Cas pratique : 8 000 € placés, frais de gestion de 1,5 % par an. Frais la première année (en €) ?', n: 120, tol: 0, u: '€', x: '8 000 × 0,015 = 120 €.' },
    { q: 'Les frais de gestion s’appliquent…', c: ['Seulement les bonnes années', 'Chaque année, que le placement monte ou baisse'], b: 1, x: 'Ils sont prélevés quelle que soit la performance.' },
    { q: 'Des frais peu clairs sont…', c: ['Sans importance', 'Une information en soi : il faut demander des précisions'], b: 1, x: 'La transparence sur les frais est un bon indicateur de sérieux.' },
    { q: 'Les règles fiscales…', c: ['Ne changent jamais', 'Peuvent évoluer : on les vérifie sur une source officielle'], b: 1, x: 'La fiscalité change régulièrement ; NaoInvest n’est pas un conseiller fiscal.' }
  ] },

/* ==================== ESPACE 3 — DÉCOUVRIR LA BOURSE ==================== */
{ id: 's-cotee', esp: 'bourse', niv: 2, min: 5, e: '🏛️', titre: 'Qu’est-ce qu’une entreprise cotée ?',
  intro: 'Une entreprise « cotée » est une entreprise dont une partie du capital s’échange sur un marché organisé : la Bourse.',
  sections: [
    { h: 'Pourquoi entrer en Bourse ?', p: 'Pour trouver de l’argent (financer sa croissance, ses projets) auprès de nombreux investisseurs, et permettre aux actionnaires existants de vendre leurs parts plus facilement.' },
    { h: 'Le marché, c’est quoi ?', p: 'Un lieu (aujourd’hui électronique) où acheteurs et vendeurs se rencontrent. À Paris, c’est Euronext Paris. Le prix naît de la rencontre entre ceux qui veulent acheter et ceux qui veulent vendre.' },
    { h: 'Des obligations en échange', p: 'Une société cotée doit publier régulièrement des informations (résultats, événements importants). En France, l’<b>Autorité des marchés financiers</b> (AMF) veille à l’information des investisseurs.' },
    { h: 'Cotée ne veut pas dire solide', p: 'Être en Bourse ne garantit ni la réussite de l’entreprise, ni la hausse de son cours.' }
  ],
  exemple: 'L’entreprise fictive « Lumina Énergie » entre en Bourse pour financer de nouvelles installations : elle vend une partie de son capital à des milliers d’investisseurs.',
  retenir: ['Cotée = ses titres s’échangent en Bourse.', 'Le prix naît de l’offre et de la demande.', 'Cotée ≠ garantie de réussite.'],
  quiz: [
    { q: 'Une entreprise entre en Bourse notamment pour…', c: ['Trouver des financements', 'Ne plus publier d’informations'], b: 0, x: 'Elle lève des fonds auprès d’investisseurs, en échange d’obligations d’information.' },
    { q: 'En France, qui veille à l’information des investisseurs ?', c: ['L’AMF', 'Les réseaux sociaux'], b: 0, x: 'L’Autorité des marchés financiers régule les marchés et protège l’épargne.' },
    { q: 'Le prix d’une action en Bourse résulte…', c: ['D’une décision de l’État', 'De la rencontre entre acheteurs et vendeurs'], b: 1, x: 'C’est l’offre et la demande qui fixent le prix à chaque instant.' },
    { q: 'Une entreprise cotée est-elle forcément solide ?', c: ['Oui', 'Non'], b: 1, x: 'Être cotée ne garantit ni la solidité ni la hausse du cours.' }
  ] },

{ id: 's-action', esp: 'bourse', niv: 2, min: 5, e: '🧩', titre: 'L’action : une petite part d’entreprise',
  intro: 'Acheter une action, c’est devenir propriétaire d’un tout petit morceau d’une entreprise.',
  sections: [
    { h: 'Ce que l’on possède', p: 'Une action est un titre de propriété. L’actionnaire peut voter en assemblée générale et recevoir une part des bénéfices si l’entreprise décide d’en distribuer (les dividendes).' },
    { h: 'Ce qui fait bouger sa valeur', p: 'Les résultats de l’entreprise, ses perspectives, l’économie en général, les taux d’intérêt, et aussi l’humeur des investisseurs.' },
    { h: 'Le risque', p: 'Si l’entreprise va mal, la valeur de l’action peut baisser fortement. En cas de faillite, l’actionnaire passe après les créanciers et peut <b>tout perdre</b>.' },
    { h: 'Aucune action n’est « sûre »', p: 'Même les plus grandes entreprises ont connu des baisses importantes. Personne ne peut prédire à coup sûr l’évolution d’une action.' }
  ],
  exemple: 'Avec 1 action fictive de « Lumina Énergie » sur 10 millions, vous détenez un dix-millionième de l’entreprise… et de ses risques.',
  retenir: ['Action = part de propriété.', 'Dividendes possibles, jamais garantis.', 'Risque de perte, jusqu’à la totalité.'],
  quiz: [
    { q: 'Posséder une action, c’est…', c: ['Prêter de l’argent à l’entreprise', 'Détenir une part de l’entreprise'], b: 1, x: 'L’action est un titre de propriété (prêter, c’est l’obligation).' },
    { q: 'En cas de faillite, l’actionnaire…', c: ['Est remboursé en premier', 'Passe après les créanciers et peut tout perdre'], b: 1, x: 'Il est le dernier servi : il peut perdre toute sa mise.' },
    { q: 'Les dividendes sont…', c: ['Garantis chaque année', 'Décidés par l’entreprise, jamais garantis'], b: 1, x: 'L’entreprise peut les réduire ou les supprimer.' },
    { q: 'Peut-on prédire à coup sûr le cours d’une action ?', c: ['Oui, avec la bonne méthode', 'Non, personne ne le peut'], b: 1, x: 'Méfiez-vous de quiconque prétend le contraire.' }
  ] },

{ id: 's-obligation', esp: 'bourse', niv: 3, min: 6, e: '📜', titre: 'L’obligation : prêter de l’argent',
  intro: 'Avec une obligation, on ne devient pas propriétaire : on devient prêteur, d’un État ou d’une entreprise.',
  sections: [
    { h: 'Le principe', p: 'L’émetteur emprunte une somme pour une durée fixée. En échange, il verse en général des intérêts réguliers (le <b>coupon</b>) et rembourse le capital à l’échéance.' },
    { h: 'Le risque de défaut', p: 'Si l’émetteur ne peut plus payer, le prêteur peut perdre une partie de son argent. Les agences de notation évaluent ce risque, sans jamais l’annuler.' },
    { h: 'Le risque de taux', p: 'Si les taux montent, les obligations existantes (qui rapportent moins que les nouvelles) perdent de la valeur sur le marché. Si les taux baissent, elles en gagnent.' },
    { h: 'Jusqu’à l’échéance… ou pas', p: 'Gardée jusqu’au bout et sans défaut, une obligation est en principe remboursée. Revendue avant, son prix dépend du marché du moment.' }
  ],
  exemple: 'L’« État de Naoland » (fictif) emprunte 1 000 NaoCoins sur 10 ans à 3 % : il verse 30 NaoCoins par an, puis rembourse 1 000 NaoCoins au bout de 10 ans — s’il en est capable.',
  retenir: ['Obligation = prêt ; action = propriété.', 'Deux risques clés : défaut et taux.', 'Taux en hausse → prix des obligations existantes en baisse.'],
  quiz: [
    { q: 'Le coupon d’une obligation, c’est…', c: ['L’intérêt versé au prêteur', 'Une réduction en magasin'], b: 0, x: 'C’est la rémunération du prêt.' },
    { q: 'Si les taux d’intérêt montent, la valeur des obligations déjà émises…', c: ['Monte', 'Baisse'], b: 1, x: 'Les nouvelles obligations rapportent plus : les anciennes deviennent moins attractives, leur prix baisse.' },
    { q: 'Le risque de défaut, c’est…', c: ['Que l’émetteur ne puisse pas rembourser', 'Que la Bourse ferme le dimanche'], b: 0, x: 'C’est le risque que l’emprunteur ne paie pas ce qu’il doit.' },
    { q: 'Cas pratique : obligation de 1 000 € à 4 % par an. Coupon annuel (en €) ?', n: 40, tol: 0, u: '€', x: '1 000 × 4 % = 40 € par an.' }
  ] },

{ id: 's-indice', esp: 'bourse', niv: 3, min: 5, e: '🌡️', titre: 'L’indice boursier : un thermomètre',
  intro: 'Quand on entend « le CAC 40 a baissé de 1 % », on parle d’un indice : une moyenne qui résume un groupe d’actions.',
  sections: [
    { h: 'Définition', p: 'Un indice mesure l’évolution d’un panier d’actions choisies selon des règles : les plus grandes entreprises d’un pays, d’une région, d’un secteur…' },
    { h: 'Quelques exemples', p: 'Le <b>CAC 40</b> (40 grandes valeurs de la Bourse de Paris), l’<b>Euro Stoxx 50</b> (zone euro), le <b>S&P 500</b> (États-Unis), le <b>MSCI World</b> (pays développés).' },
    { h: 'À quoi il sert', p: 'À prendre la température d’un marché, et à servir de référence pour comparer. On ne peut pas acheter un indice directement : on passe par des fonds qui le répliquent, comme les ETF.' },
    { h: 'Un thermomètre, pas une boussole', p: 'Un indice dit ce qui s’est passé, pas ce qui va se passer.' }
  ],
  exemple: 'L’indice fictif « Nao 10 » regroupe dix entreprises imaginaires. S’il passe de 1 000 à 1 050 points, le panier a progressé de 5 % sur la période.',
  retenir: ['Indice = panier représentatif d’un marché.', 'CAC 40, S&P 500, MSCI World… des thermomètres.', 'Il décrit le passé, il ne prédit rien.'],
  quiz: [
    { q: 'Le CAC 40 est…', c: ['Une entreprise', 'Un indice de 40 grandes valeurs de la Bourse de Paris'], b: 1, x: 'C’est l’indice phare de la place de Paris.' },
    { q: 'Un indice passe de 2 000 à 2 100 points. Variation (en %) ?', n: 5, tol: 0, u: '%', x: '(2 100 − 2 000) ÷ 2 000 × 100 = 5 %.' },
    { q: 'Peut-on acheter un indice directement ?', c: ['Oui', 'Non, on passe par des fonds qui le répliquent (ETF…)'], b: 1, x: 'L’indice est un calcul ; des fonds indiciels permettent de le suivre.' },
    { q: 'Un indice…', c: ['Prédit l’avenir', 'Mesure ce qui s’est passé'], b: 1, x: 'C’est un thermomètre, pas une boussole.' }
  ] },

{ id: 's-etf', esp: 'bourse', niv: 3, min: 6, e: '🧺', titre: 'L’ETF : un panier qui suit un indice',
  intro: 'Un ETF (ou « tracker », ou fonds indiciel coté) est un fonds qui cherche à reproduire l’évolution d’un indice, et qui s’échange en Bourse comme une action.',
  sections: [
    { h: 'Comment ça marche', p: 'Au lieu de choisir des actions une à une, l’ETF suit un indice entier. Si l’indice monte de 2 %, l’ETF monte d’environ 2 % (hors frais et petits écarts de suivi) ; s’il baisse de 10 %, l’ETF baisse d’environ 10 %.' },
    { h: 'Ses caractéristiques', p: 'Une diversification immédiate sur tout l’indice, des frais généralement plus bas qu’un fonds géré activement, et une cotation en continu.' },
    { h: 'Ses risques', p: 'L’ETF a <b>le risque de son indice</b> : un ETF qui suit un seul secteur ou un seul pays est plus concentré qu’un ETF « monde ». Certains ETF (à effet de levier, par exemple) sont complexes et très risqués.' },
    { h: 'Lire avant', p: 'Le DIC précise l’indice suivi, les frais, le niveau de risque et la méthode de réplication.' }
  ],
  exemple: 'L’« ETF fictif Monde Étoilé » suit un indice imaginaire de 1 500 entreprises de 23 pays : il ne dépend pas d’une seule entreprise, mais il baisse quand l’ensemble des marchés baisse.',
  retenir: ['ETF = fonds coté qui suit un indice.', 'Diversifié, souvent peu coûteux, mais pas sans risque.', 'Son risque est celui de l’indice suivi.'],
  quiz: [
    { q: 'Un ETF cherche à…', c: ['Battre le marché à tout prix', 'Reproduire l’évolution d’un indice'], b: 1, x: 'Il suit un indice, à la hausse comme à la baisse.' },
    { q: 'Si l’indice suivi baisse de 15 %, l’ETF…', c: ['Monte', 'Baisse d’environ 15 %'], b: 1, x: 'L’ETF suit l’indice, dans les deux sens.' },
    { q: 'Un ETF sur un seul secteur est…', c: ['Plus concentré qu’un ETF « monde »', 'Sans risque'], b: 0, x: 'Moins de diversification = plus de dépendance à un secteur.' },
    { q: 'Les ETF à effet de levier sont…', c: ['Simples et sans danger', 'Complexes et très risqués'], b: 1, x: 'Ils amplifient les variations : ils ne conviennent pas à un apprentissage de base.' }
  ] },

{ id: 's-gains', esp: 'bourse', niv: 3, min: 6, e: '🪙', titre: 'Dividendes, plus-values et moins-values',
  intro: 'Il y a deux façons de gagner (ou de perdre) avec des titres : ce qu’ils versent, et l’écart entre le prix d’achat et le prix de vente.',
  sections: [
    { h: 'Le dividende', p: 'Une part des bénéfices qu’une entreprise peut décider de verser à ses actionnaires. Il n’est <b>jamais garanti</b> : il peut baisser ou disparaître.' },
    { h: 'La plus-value', p: 'Vendre un titre plus cher qu’on ne l’a acheté : la différence est une plus-value (avant frais et impôts).' },
    { h: 'La moins-value', p: 'Vendre moins cher qu’on n’a acheté : la différence est une perte. Tant qu’on n’a pas vendu, on parle de plus- ou moins-value « latente » : elle peut encore changer.' },
    { h: 'Frais et impôts', p: 'Frais de courtage et fiscalité réduisent le gain net. Leurs règles se vérifient sur une source officielle.' }
  ],
  exemple: 'Achat fictif de 10 actions à 50 NaoCoins, revente à 62 : plus-value de (62 − 50) × 10 = 120 NaoCoins, avant frais et impôts. Si le cours était tombé à 40, la moins-value aurait été de 100.',
  retenir: ['Dividende = versement possible, jamais garanti.', 'Plus-value / moins-value = prix de vente − prix d’achat.', 'Latente tant qu’on n’a pas vendu.'],
  quiz: [
    { q: 'Cas pratique : 20 titres achetés 30, revendus 27. Résultat (en NaoCoins, négatif si perte) ?', n: -60, tol: 0, u: 'NaoCoins', x: '(27 − 30) × 20 = −60 : une moins-value de 60.' },
    { q: 'Une plus-value « latente », c’est…', c: ['Un gain déjà encaissé', 'Un gain sur le papier, tant qu’on n’a pas vendu'], b: 1, x: 'Elle peut encore disparaître si le cours baisse.' },
    { q: 'Un dividende élevé l’an dernier garantit-il le même cette année ?', c: ['Oui', 'Non'], b: 1, x: 'L’entreprise décide chaque année ; rien n’est garanti.' },
    { q: 'Le gain réellement perçu dépend aussi…', c: ['Des frais et des impôts', 'De la météo'], b: 0, x: 'Courtage et fiscalité réduisent le gain net.' }
  ] },

{ id: 's-volatilite', esp: 'bourse', niv: 4, min: 7, e: '🌊', titre: 'Volatilité : pourquoi un cours monte ou baisse',
  intro: 'Un cours de Bourse bouge chaque jour. La volatilité mesure l’ampleur de ces mouvements.',
  sections: [
    { h: 'Pourquoi ça bouge', p: 'Résultats d’entreprises, chiffres de l’économie, décisions des banques centrales sur les taux, événements politiques ou climatiques, rumeurs… et les émotions des investisseurs : la peur fait vendre, l’enthousiasme fait acheter.' },
    { h: 'La volatilité', p: 'Un titre très volatil peut faire +10 % un jour et −12 % le lendemain. Un titre peu volatil bouge peu. La volatilité n’est pas le sens du mouvement : c’est son intensité.' },
    { h: 'Les émotions, le vrai piège', p: 'Acheter parce que « tout le monde en parle » ou vendre dans la panique sont deux réflexes fréquents… et souvent coûteux. Comprendre la volatilité aide à ne pas être surpris.' },
    { h: 'Le passé ne prédit pas', p: 'Les <b>performances passées ne préjugent pas des performances futures</b> : une hausse passée n’annonce pas une hausse future, une baisse passée n’annonce pas un rebond.' }
  ],
  exemple: 'Dans NaoInvest, l’action fictive est très volatile et le fonds diversifié fictif l’est beaucoup moins. Lancez le scénario « marché en baisse » pour voir la différence.',
  retenir: ['Volatilité = ampleur des variations.', 'Nouvelles, taux et émotions font bouger les cours.', 'Le passé ne préjuge pas du futur.'],
  quiz: [
    { q: 'La volatilité mesure…', c: ['Le sens d’un mouvement', 'L’ampleur des variations'], b: 1, x: 'Elle dit « combien ça bouge », pas « dans quel sens ».' },
    { q: 'Une action a fortement monté l’an dernier. Cela garantit-il une hausse cette année ?', c: ['Oui', 'Non : les performances passées ne préjugent pas des performances futures'], b: 1, x: 'C’est une mention obligatoire pour une bonne raison.' },
    { q: 'Vendre dans la panique après une forte baisse est…', c: ['Un réflexe fréquent, souvent regretté', 'Toujours la bonne décision'], b: 0, x: 'Les émotions poussent à des décisions précipitées ; comprendre la volatilité aide à s’en méfier.' },
    { q: 'Qu’est-ce qui peut faire bouger un cours ?', c: ['Seulement les résultats de l’entreprise', 'Résultats, économie, taux, événements et émotions'], b: 1, x: 'Beaucoup de facteurs se combinent, souvent de façon imprévisible.' }
  ] },

{ id: 's-diversif', esp: 'bourse', niv: 4, min: 6, e: '🗺️', titre: 'Diversifier : géographie, secteurs, types d’actifs',
  intro: 'Diversifier en Bourse, c’est éviter de dépendre d’un seul pays, d’un seul secteur ou d’un seul type de placement.',
  sections: [
    { h: 'Géographique', p: 'Les économies ne vont pas toutes au même rythme. Un portefeuille réparti entre plusieurs zones dépend moins d’un seul pays.' },
    { h: 'Sectorielle', p: 'Énergie, santé, technologie, consommation, industrie… Un problème propre à un secteur (réglementation, prix d’une matière première) pèse moins si l’on n’y est pas tout entier.' },
    { h: 'Par type d’actif', p: 'Actions, obligations, épargne disponible, immobilier ne réagissent pas de la même façon aux mêmes événements : par exemple, une hausse des taux touche différemment les obligations et les actions.' },
    { h: 'Les limites', p: 'En cas de crise mondiale, beaucoup d’actifs baissent ensemble. La diversification réduit certains risques, elle ne garantit rien.' }
  ],
  exemple: 'Un portefeuille fictif 100 % « Lumina Énergie » dépend d’une seule entreprise, d’un seul secteur, d’un seul pays. Un ETF monde fictif, lui, répartit sur des centaines d’entreprises — sans éliminer le risque de marché.',
  retenir: ['Trois axes : pays, secteurs, types d’actifs.', 'Moins de dépendance à un seul événement.', 'Aucune diversification n’élimine tout risque.'],
  quiz: [
    { q: 'Diversifier géographiquement, c’est…', c: ['Répartir entre plusieurs pays ou zones', 'Voyager souvent'], b: 0, x: 'On dépend moins de l’économie d’un seul pays.' },
    { q: 'Un portefeuille 100 % secteur de l’énergie est…', c: ['Très diversifié', 'Concentré sur un secteur'], b: 1, x: 'Un problème du secteur touche tout le portefeuille.' },
    { q: 'Actions et obligations réagissent-elles toujours pareil ?', c: ['Oui', 'Non, pas forcément'], b: 1, x: 'C’est justement l’intérêt de combiner plusieurs types d’actifs — sans certitude.' },
    { q: 'En crise mondiale, la diversification…', c: ['Empêche toute baisse', 'Peut amortir sans empêcher les baisses'], b: 1, x: 'Elle limite certains risques, elle ne les supprime pas.' }
  ] },

{ id: 's-temps', esp: 'bourse', niv: 4, min: 6, e: '🐢', titre: 'Court terme ou long terme ?',
  intro: 'Le temps change tout en Bourse : les mouvements d’une journée ne racontent pas la même histoire que ceux de quinze ans.',
  sections: [
    { h: 'Le court terme', p: 'Sur quelques jours ou mois, les cours sont très influencés par l’actualité et les émotions. Chercher à « profiter » de ces mouvements (le trading) est très risqué et demande des connaissances poussées : la plupart des particuliers qui s’y essaient perdent de l’argent, selon les études publiées par les régulateurs.' },
    { h: 'Le long terme', p: 'Sur de longues périodes, l’évolution des marchés a davantage reflété celle des entreprises et de l’économie. Cela a permis historiquement d’absorber certaines baisses, <b>sans aucune garantie pour l’avenir</b>.' },
    { h: 'L’horizon avant le produit', p: 'Un argent dont on aura besoin dans un an ne se place pas comme un argent qu’on laissera quinze ans. C’est l’horizon qui guide, pas l’envie du moment.' },
    { h: 'Les promesses de gains rapides', p: '« Doublez votre mise en un mois » : ce type de promesse relève de la spéculation extrême… ou de l’arnaque.' }
  ],
  exemple: 'Dans la simulation NaoInvest, avancez d’un an à la fois pendant 10 ans : vous verrez des années en baisse au milieu d’autres en hausse. Le chemin n’est jamais une ligne droite — et une autre simulation donnera un autre chemin.',
  retenir: ['Court terme = bruit, émotions, risque élevé.', 'Long terme = plus de temps pour traverser les baisses, sans garantie.', 'Gains rapides promis = alerte.'],
  quiz: [
    { q: 'Le trading à court terme est…', c: ['Un moyen sûr de gagner', 'Très risqué, et la plupart des particuliers y perdent'], b: 1, x: 'Les régulateurs ont régulièrement mis en garde contre ces pertes.' },
    { q: 'Un horizon long garantit-il un gain ?', c: ['Oui', 'Non'], b: 1, x: 'Il laisse plus de temps pour traverser les baisses, sans jamais rien garantir.' },
    { q: '« Doublez votre argent en un mois » évoque…', c: ['Un placement prudent', 'Une spéculation extrême ou une arnaque'], b: 1, x: 'Des gains rapides promis sont un signal d’alerte.' },
    { q: 'Qu’est-ce qui doit guider le choix d’un placement ?', c: ['L’horizon et la situation personnelle', 'La tendance du jour sur les réseaux'], b: 0, x: 'L’horizon et la situation d’abord ; jamais l’effet de mode.' }
  ] },

/* ==================== ESPACE 6 — ANTI-ARNAQUES ==================== */
{ id: 'a-signaux', esp: 'arnaques', niv: 1, min: 6, e: '🚨', titre: 'Les 8 signaux d’alerte',
  intro: 'Les arnaques financières changent de décor, mais utilisent presque toujours les mêmes ficelles. Les reconnaître, c’est déjà se protéger.',
  sections: [
    { h: 'Les promesses', p: '<b>1.</b> Un rendement élevé présenté comme garanti. <b>2.</b> Un investissement incompréhensible, « trop technique pour être expliqué ». <b>3.</b> Un influenceur qui promet un enrichissement rapide.' },
    { h: 'La pression', p: '<b>4.</b> L’urgence : « offre valable aujourd’hui seulement », « places limitées ». <b>5.</b> Un contact non sollicité (appel, SMS, message, publicité) qui vous propose un placement.' },
    { h: 'Les faux-semblants', p: '<b>6.</b> Un faux site qui imite une banque ou un média connu. <b>7.</b> Un faux conseiller, qui usurpe le nom d’une société réelle ou d’un organisme officiel.' },
    { h: 'L’argent', p: '<b>8.</b> Une demande de virement vers un inconnu, un compte à l’étranger, en cryptoactifs ou en cartes prépayées. Un professionnel sérieux ne demande jamais cela.' }
  ],
  exemple: 'Message reçu : « Livret exclusif à 9 % garanti, seulement pour les 50 premiers, virez aujourd’hui sur ce compte. » Garantie élevée + urgence + contact non sollicité + virement : quatre signaux d’un coup.',
  retenir: ['Garantie élevée, urgence, contact non sollicité = alerte.', 'Jamais de virement vers un inconnu.', 'Dans le doute, on s’arrête et on vérifie.'],
  quiz: [
    { q: 'Un inconnu vous appelle pour un placement « exceptionnel ». C’est…', c: ['Une chance à saisir', 'Un contact non sollicité : signal d’alerte'], b: 1, x: 'Le démarchage non sollicité est l’une des portes d’entrée des arnaques.' },
    { q: '« Offre valable seulement aujourd’hui » vise surtout à…', c: ['Vous rendre service', 'Vous empêcher de réfléchir et de vérifier'], b: 1, x: 'L’urgence coupe la réflexion : c’est voulu.' },
    { q: 'Un « conseiller » vous demande de payer en cartes prépayées. Vous…', c: ['Payez vite', 'Refusez : aucun professionnel sérieux ne demande cela'], b: 1, x: 'Cartes prépayées, cryptoactifs vers un inconnu, comptes à l’étranger : alerte rouge.' },
    { q: 'Combien de signaux dans : « 15 % garantis, secret, virez ce soir » ?', c: ['Un seul', 'Au moins trois'], b: 1, x: 'Garantie élevée, investissement opaque, urgence… sans compter le virement.' }
  ] },

{ id: 'a-verifier', esp: 'arnaques', niv: 2, min: 6, e: '🔎', titre: 'Vérifier une société, un site, un intermédiaire',
  intro: 'Avant de confier de l’argent, on vérifie. Ça prend dix minutes, et ça peut éviter de tout perdre.',
  sections: [
    { h: 'Les listes noires', p: 'L’<b>AMF</b> (amf-france.org) et l’<b>ACPR</b> publient des listes de sites et d’entités non autorisés. Le site <b>abe-infoservice.fr</b> (Assurance Banque Épargne Info Service) rassemble des mises en garde.' },
    { h: 'Les registres officiels', p: '<b>REGAFI</b> (regafi.fr) pour les établissements bancaires et prestataires agréés ; <b>ORIAS</b> (orias.fr) pour les intermédiaires (conseillers en investissements financiers, courtiers…). Un professionnel absent de ces registres ne devrait pas vous proposer de placement.' },
    { h: 'Les pièges de l’usurpation', p: 'Un escroc peut utiliser le nom d’une vraie société. Vérifiez vous-même les coordonnées officielles (en tapant l’adresse du site, pas en cliquant sur un lien reçu) et rappelez la société par son numéro officiel.' },
    { h: 'Se faire aider', p: 'AMF Épargne Info Service : 01 53 45 62 00. Info Escroqueries : 0 805 805 817 (appel gratuit). Numéros à revérifier sur les sites officiels. En cas d’arnaque : prévenir sa banque au plus vite et porter plainte.' }
  ],
  exemple: 'Un site propose un placement au nom d’une banque connue. Vous tapez vous-même l’adresse de la vraie banque : l’offre n’y existe pas. Vous consultez la liste noire de l’AMF : le site y figure.',
  retenir: ['Listes noires AMF / ACPR, registres REGAFI et ORIAS.', 'Coordonnées : on les cherche soi-même.', 'Arnaque ? Banque, plainte, signalement.'],
  quiz: [
    { q: 'Pour vérifier un conseiller en investissements financiers, on consulte…', c: ['Le registre ORIAS', 'Ses avis en ligne uniquement'], b: 0, x: 'L’ORIAS immatricule les intermédiaires ; les avis en ligne peuvent être faux.' },
    { q: 'Un lien reçu par SMS mène au « site de votre banque ». Le bon réflexe ?', c: ['Cliquer et se connecter', 'Taper soi-même l’adresse officielle'], b: 1, x: 'Les faux sites imitent les vrais : on passe toujours par l’adresse qu’on connaît.' },
    { q: 'Où trouver les listes noires des sites non autorisés ?', c: ['Sur le site de l’AMF', 'Sur un forum anonyme'], b: 0, x: 'L’AMF (et l’ACPR) publient ces listes.' },
    { q: 'Vous pensez avoir été victime d’une arnaque. Première chose à faire ?', c: ['Attendre', 'Prévenir sa banque au plus vite, puis porter plainte'], b: 1, x: 'Plus on agit tôt, plus on a de chances de limiter les dégâts.' }
  ] }
];

/* ---------- Les parcours (et leurs attestations) ---------- */
const PARCOURS = [
  { id: 'debute',   nom: 'Je débute', e: '🌱', desc: 'Les premiers mots de l’argent et les premiers réflexes, en douceur.', lecons: ['b-mots', 'b-precaution', 'e-risque', 'a-signaux'] },
  { id: 'budget',   nom: 'Je veux mieux gérer mon budget', e: '📒', desc: 'Budget, découvert, crédit et inflation : reprendre la main.', lecons: ['b-mots', 'b-budget', 'b-decouvert', 'b-credit', 'b-inflation'] },
  { id: 'projet',   nom: 'Je prépare un projet', e: '🎯', desc: 'Un objectif, un montant, une date — et la bonne distance avec le risque.', lecons: ['b-budget', 'b-precaution', 'b-horizons', 'b-projet', 'b-credit'] },
  { id: 'epargne',  nom: 'Je veux comprendre l’épargne', e: '🪴', desc: 'Horizons, inflation, garanties, enveloppes et frais.', lecons: ['b-horizons', 'b-inflation', 'e-risque', 'e-capital', 'e-enveloppes', 'e-frais'] },
  { id: 'investir', nom: 'Épargner et investir', e: '⚖️', desc: 'Risque, horizon, liquidité, diversification : les notions clés.', lecons: ['e-risque', 'e-horizon', 'e-diversif', 'e-capital', 'e-enveloppes', 'e-frais'] },
  { id: 'bourse',   nom: 'Découvrir la Bourse', e: '📈', desc: 'De l’entreprise cotée à l’ETF, pas à pas.', lecons: ['s-cotee', 's-action', 's-obligation', 's-indice', 's-etf', 's-gains', 's-volatilite', 's-diversif', 's-temps'] },
  { id: 'arnaques', nom: 'Anti-arnaques', e: '🛡️', desc: 'Reconnaître les signaux, vérifier, bien réagir.', lecons: ['a-signaux', 'a-verifier'] }
];

/* ---------- Les badges ---------- */
const BADGES = [
  { id: 'premier',  nom: 'Premiers pas',          e: '👣', desc: 'Réussir une première leçon.', lecons: [], min: 1 },
  { id: 'budget',   nom: 'Budget compris',        e: '📒', desc: 'Réussir « Revenus, dépenses et reste à vivre » et « Construire son budget ».', lecons: ['b-mots', 'b-budget'] },
  { id: 'epargne',  nom: 'Épargne maîtrisée',     e: '🪴', desc: 'Réussir les leçons sur la précaution, les horizons, les garanties et les enveloppes.', lecons: ['b-precaution', 'b-horizons', 'e-capital', 'e-enveloppes'] },
  { id: 'prudent',  nom: 'Investissement prudent', e: '⚖️', desc: 'Réussir risque, diversification, long terme… et mener une simulation sur au moins 3 étapes.', lecons: ['e-risque', 'e-diversif', 's-diversif', 's-temps'], sim: 3 },
  { id: 'arnaques', nom: 'Anti-arnaques',         e: '🛡️', desc: 'Réussir les deux leçons anti-arnaques avec au moins 80/100 et cocher toute la checklist.', lecons: ['a-signaux', 'a-verifier'], note: 80, checklist: true },
  { id: 'bourse',   nom: 'Curiosité boursière',   e: '🔭', desc: 'Réussir « Entreprise cotée », « Action » et « Indice ».', lecons: ['s-cotee', 's-action', 's-indice'] },
  { id: 'defi',     nom: 'Défi relevé',           e: '🏅', desc: 'Relever un défi de la semaine.', lecons: [], defi: 1 }
];

/* ---------- Les fiches produits (Espace 2) ----------
   cls : 'garanti' | 'varie' | 'perte' | 'mixte' — jamais de classement « meilleur ». */
const PRODUITS = [
  { id: 'livret-regl', nom: 'Livret réglementé', e: '🏠', cls: 'garanti', ex: 'Livret A, LDDS, LEP',
    def: 'Un compte d’épargne dont les règles (taux, plafond, conditions) sont fixées par les pouvoirs publics.',
    obj: 'Garder une épargne disponible, par exemple l’épargne de précaution.',
    dispo: 'Argent disponible à tout moment.', risque: 1, horizon: 'Court terme', frais: 'En principe aucuns frais de tenue.',
    fisc: 'Intérêts généralement exonérés d’impôt et de prélèvements sociaux pour les livrets réglementés : à vérifier sur service-public.fr.',
    vigil: ['Le taux peut évoluer (il est révisé par les pouvoirs publics).', 'Un plafond de versements s’applique.', 'Le LEP est soumis à des conditions de revenus.'] },
  { id: 'livret-bq', nom: 'Compte sur livret (livret bancaire)', e: '🏦', cls: 'garanti', ex: 'Livrets « maison » des banques',
    def: 'Un compte d’épargne proposé par une banque, dont elle fixe librement le taux.',
    obj: 'Épargner de façon disponible, souvent en complément des livrets réglementés.',
    dispo: 'Argent disponible à tout moment.', risque: 1, horizon: 'Court terme', frais: 'En général aucuns ; à vérifier dans la brochure tarifaire.',
    fisc: 'Intérêts en principe imposables et soumis aux prélèvements sociaux : à vérifier.',
    vigil: ['Les taux « boostés » ne durent souvent que quelques mois.', 'Comparer le taux après la période promotionnelle.'] },
  { id: 'pel', nom: 'PEL (plan d’épargne logement)', e: '🔑', cls: 'garanti', ex: 'Plan d’épargne logement',
    def: 'Un plan d’épargne avec des versements réguliers et un taux fixé à l’ouverture.',
    obj: 'Constituer une épargne sur plusieurs années, souvent en vue d’un projet immobilier.',
    dispo: 'Argent bloqué : un retrait entraîne en général la clôture du plan.', risque: 1, horizon: 'Moyen terme (plusieurs années)', frais: 'Généralement aucuns frais de gestion.',
    fisc: 'Règles différentes selon la date d’ouverture du plan : à vérifier sur service-public.fr.',
    vigil: ['Versements minimum obligatoires.', 'Clôture anticipée = conditions moins favorables.', 'Le droit à prêt a des conditions précises.'] },
  { id: 'av', nom: 'Assurance-vie', e: '📂', cls: 'mixte', ex: 'Fonds en euros et unités de compte',
    def: 'Une enveloppe proposée par un assureur, qui peut contenir un fonds en euros et/ou des unités de compte (fonds, ETF, immobilier papier…).',
    obj: 'Épargner à moyen ou long terme, préparer un projet ou une transmission.',
    dispo: 'Argent en principe récupérable (rachat), avec un délai de quelques jours à quelques semaines.', risque: 0, horizon: 'Moyen à long terme', frais: 'Frais sur versements, frais de gestion annuels, frais d’arbitrage selon les contrats.',
    fisc: 'Fiscalité particulière selon l’ancienneté du contrat et les versements ; règles de transmission spécifiques : à vérifier.',
    vigil: ['Fonds en euros : capital en principe garanti par l’assureur (hors frais), rendement non garanti à l’avance.', 'Unités de compte : risque de perte en capital.', 'Comparer les frais, qui varient beaucoup d’un contrat à l’autre.'] },
  { id: 'pea', nom: 'PEA (plan d’épargne en actions)', e: '🇪🇺', cls: 'perte', ex: 'PEA, PEA-PME',
    def: 'Une enveloppe pour détenir principalement des actions européennes et des fonds ou ETF éligibles.',
    obj: 'Investir en actions sur le long terme dans un cadre fiscal particulier.',
    dispo: 'Retraits possibles, mais un retrait avant 5 ans entraîne en principe la clôture (sauf exceptions).', risque: 5, horizon: 'Long terme (5 ans et plus)', frais: 'Frais de courtage, parfois droits de garde ou frais de tenue.',
    fisc: 'Avantage fiscal après 5 ans dans les conditions prévues par la loi ; prélèvements sociaux dus : à vérifier.',
    vigil: ['Le cadre est avantageux, mais les actions peuvent baisser : perte en capital possible.', 'Plafond de versements (150 000 € pour le PEA classique).', 'Seuls certains titres sont éligibles.'] },
  { id: 'cto', nom: 'Compte-titres ordinaire', e: '🗂️', cls: 'perte', ex: 'CTO',
    def: 'Une enveloppe sans plafond pour détenir presque tous les titres : actions, obligations, fonds, ETF, français ou étrangers.',
    obj: 'Accéder à un large choix de titres financiers.',
    dispo: 'Titres revendables, au prix du marché du moment.', risque: 5, horizon: 'Selon les titres détenus', frais: 'Courtage, droits de garde, frais de tenue selon l’établissement.',
    fisc: 'Dividendes, intérêts et plus-values imposables selon les règles en vigueur : à vérifier.',
    vigil: ['Le risque dépend entièrement de ce qu’on y place.', 'Pas d’avantage fiscal particulier.'] },
  { id: 'oblig', nom: 'Obligations', e: '📜', cls: 'varie', ex: 'Obligations d’État ou d’entreprises',
    def: 'Un titre de dette : vous prêtez à un État ou une entreprise, qui verse des intérêts et rembourse à l’échéance.',
    obj: 'Recevoir des intérêts réguliers et récupérer le capital à l’échéance, si l’émetteur rembourse.',
    dispo: 'Revendables sur le marché avant l’échéance, à un prix qui peut être inférieur au prix d’achat.', risque: 3, horizon: 'Selon l’échéance', frais: 'Frais de courtage ; frais de gestion si détenues via un fonds.',
    fisc: 'Intérêts et plus-values imposables selon l’enveloppe : à vérifier.',
    vigil: ['Risque de défaut de l’émetteur.', 'Risque de taux : la valeur baisse quand les taux montent.', 'Un rendement très élevé signale souvent un émetteur fragile.'] },
  { id: 'actions', nom: 'Actions', e: '🧩', cls: 'perte', ex: 'Parts d’entreprises cotées',
    def: 'Des titres de propriété d’une entreprise.',
    obj: 'Participer à la vie d’entreprises, avec des dividendes possibles et une valeur qui varie.',
    dispo: 'Revendables en Bourse, au prix du moment.', risque: 6, horizon: 'Long terme (souvent 8 ans et plus évoqués)', frais: 'Courtage, droits de garde éventuels.',
    fisc: 'Dividendes et plus-values imposables, sauf enveloppe particulière : à vérifier.',
    vigil: ['Perte en capital possible, jusqu’à la totalité.', 'Forte volatilité.', 'Une seule entreprise = aucune diversification.'] },
  { id: 'etf', nom: 'ETF (fonds indiciels cotés)', e: '🧺', cls: 'perte', ex: 'Trackers',
    def: 'Des fonds cotés qui cherchent à reproduire l’évolution d’un indice.',
    obj: 'Suivre un marché entier plutôt que des titres choisis un à un.',
    dispo: 'Revendables en Bourse, au prix du moment.', risque: 5, horizon: 'Long terme, selon l’indice', frais: 'Frais courants annuels souvent bas, plus le courtage.',
    fisc: 'Selon l’enveloppe (PEA, compte-titres, assurance-vie) : à vérifier.',
    vigil: ['Le risque est celui de l’indice suivi.', 'ETF à effet de levier ou sur un seul secteur : beaucoup plus risqués.', 'Lire le DIC : indice, frais, réplication.'] },
  { id: 'fonds', nom: 'Fonds (OPCVM, FCP, SICAV)', e: '🎛️', cls: 'perte', ex: 'Fonds gérés par une société de gestion',
    def: 'Des placements collectifs : l’argent de nombreux épargnants est géré ensemble par une société de gestion, selon une stratégie définie.',
    obj: 'Déléguer la gestion et accéder à une diversification selon la stratégie du fonds.',
    dispo: 'Rachat possible, en général en quelques jours, à la prochaine valeur calculée.', risque: 0, horizon: 'Selon la stratégie (indiqué dans le DIC)', frais: 'Frais d’entrée éventuels, frais courants annuels, parfois commissions de performance.',
    fisc: 'Selon l’enveloppe : à vérifier.',
    vigil: ['Niveau de risque très variable (1 à 7 dans le DIC).', 'Les frais peuvent peser sur le résultat.', 'Lire la stratégie avant tout.'] },
  { id: 'immo', nom: 'Immobilier papier (SCPI, OPCI…)', e: '🏢', cls: 'perte', ex: 'SCPI, OPCI, SCI en unités de compte',
    def: 'Des parts de sociétés ou de fonds qui détiennent des biens immobiliers (bureaux, commerces, logements…).',
    obj: 'S’exposer à l’immobilier sans acheter un bien soi-même.',
    dispo: 'Revente parfois longue (plusieurs mois) et non garantie.', risque: 3, horizon: 'Long terme (souvent 8 à 10 ans évoqués)', frais: 'Frais de souscription souvent élevés, frais de gestion annuels.',
    fisc: 'Revenus et plus-values imposables selon le cadre de détention : à vérifier.',
    vigil: ['Capital non garanti, revenus non garantis.', 'Liquidité réduite.', 'Sensible aux taux et au marché immobilier.'] }
];
const CLASSES_PRODUIT = {
  garanti: { lib: 'Capital garanti', desc: 'selon les conditions du produit et la solidité du garant', c: 'ok' },
  varie:   { lib: 'Le capital peut varier', desc: 'la valeur bouge ; remboursement à l’échéance si l’émetteur honore sa dette', c: 'bientot' },
  mixte:   { lib: 'Selon les supports choisis', desc: 'fonds en euros garanti par l’assureur, unités de compte avec risque de perte', c: 'bleu' },
  perte:   { lib: 'Risque de perte en capital', desc: 'vous pouvez récupérer moins que ce que vous avez versé', c: 'passe' }
};

/* ---------- Le dictionnaire financier ---------- */
const DICO = [
  { m: 'Action', d: 'Titre de propriété d’une part d’entreprise.', ex: 'Détenir 1 action sur 1 million, c’est posséder un millionième de l’entreprise.', a: ['Dividende', 'Plus-value', 'Bourse'] },
  { m: 'Agios', d: 'Intérêts et frais facturés par la banque quand le compte est à découvert.', ex: '300 € de découvert pendant 10 jours coûtent quelques euros d’agios.', a: ['Découvert', 'Taux d’intérêt'] },
  { m: 'AMF', d: 'Autorité des marchés financiers : le régulateur français des marchés, qui protège l’épargne investie.', ex: 'L’AMF publie des listes noires de sites non autorisés.', a: ['Liste noire', 'ORIAS'] },
  { m: 'Assurance-vie', d: 'Enveloppe d’épargne proposée par un assureur, qui peut contenir un fonds en euros et des unités de compte.', ex: 'Un contrat peut mélanger 70 % de fonds en euros et 30 % d’unités de compte.', a: ['Fonds en euros', 'Unité de compte', 'Enveloppe'] },
  { m: 'Banque centrale', d: 'Institution qui gère la monnaie et fixe les taux directeurs (la BCE pour la zone euro).', ex: 'Quand la BCE baisse ses taux, le crédit tend à devenir moins cher.', a: ['Taux directeur', 'Inflation'] },
  { m: 'Bourse', d: 'Marché organisé où s’échangent des titres financiers (actions, obligations, ETF…).', ex: 'Euronext Paris est la Bourse de Paris.', a: ['Action', 'Indice boursier', 'Cours'] },
  { m: 'Capital', d: 'La somme d’argent placée ou empruntée au départ.', ex: 'Vous placez 1 000 € : votre capital de départ est de 1 000 €.', a: ['Perte en capital', 'Intérêts'] },
  { m: 'Coupon', d: 'Intérêt versé au détenteur d’une obligation.', ex: 'Une obligation de 1 000 € à 3 % verse un coupon de 30 € par an.', a: ['Obligation', 'Taux d’intérêt'] },
  { m: 'Cours', d: 'Le prix d’un titre à un instant donné sur le marché.', ex: 'Le cours d’une action fictive passe de 50 à 52 NaoCoins dans la journée.', a: ['Volatilité', 'Bourse'] },
  { m: 'Découvert', d: 'Situation d’un compte dont le solde est négatif.', ex: 'Un solde à −120 € : le compte est à découvert de 120 €.', a: ['Agios', 'Budget'] },
  { m: 'DIC', d: 'Document d’informations clés : fiche normalisée qui résume un produit, ses frais, ses risques (indicateur de 1 à 7) et des scénarios.', ex: 'Avant de souscrire un fonds, on lit son DIC.', a: ['Frais', 'Risque'] },
  { m: 'Diversification', d: 'Répartir son épargne entre plusieurs supports, secteurs ou pays pour limiter certains risques.', ex: 'Répartir entre épargne disponible, obligations et actions.', a: ['Risque', 'ETF', 'Portefeuille'] },
  { m: 'Dividende', d: 'Part des bénéfices qu’une entreprise peut verser à ses actionnaires. Jamais garanti.', ex: 'Une entreprise fictive verse 2 NaoCoins par action cette année.', a: ['Action', 'Rendement'] },
  { m: 'Enveloppe', d: 'Cadre (avec ses règles et sa fiscalité) dans lequel on détient des placements.', ex: 'PEA, assurance-vie et compte-titres sont des enveloppes.', a: ['PEA', 'Assurance-vie', 'Compte-titres'] },
  { m: 'Épargne de précaution', d: 'Somme disponible et sans risque de perte, réservée aux imprévus.', ex: 'Une réserve pour une réparation urgente.', a: ['Liquidité', 'Livret'] },
  { m: 'ETF', d: 'Fonds coté en Bourse qui cherche à reproduire un indice.', ex: 'Un ETF qui suit un indice « monde » détient des centaines d’entreprises.', a: ['Indice boursier', 'Diversification', 'Frais'] },
  { m: 'Fonds en euros', d: 'Support d’assurance-vie dont le capital est en principe garanti par l’assureur (hors frais).', ex: 'La rémunération du fonds en euros est annoncée chaque année, sans garantie à l’avance.', a: ['Assurance-vie', 'Unité de compte'] },
  { m: 'Frais', d: 'Sommes prélevées pour la gestion, l’entrée, les transactions ou la garde des placements.', ex: '1 % de frais annuels sur 10 000 € = 100 € par an.', a: ['DIC', 'Rendement'] },
  { m: 'Horizon de placement', d: 'Durée pendant laquelle on prévoit de laisser son argent placé.', ex: 'Un projet dans 3 ans = horizon de 3 ans.', a: ['Liquidité', 'Risque'] },
  { m: 'Indice boursier', d: 'Indicateur qui résume l’évolution d’un panier d’actions.', ex: 'Le CAC 40 résume l’évolution de 40 grandes valeurs de Paris.', a: ['ETF', 'Bourse'] },
  { m: 'Inflation', d: 'Hausse générale et durable des prix.', ex: 'Avec 2 % d’inflation, 100 € d’achats en coûtent 102 un an plus tard.', a: ['Pouvoir d’achat', 'Rendement réel'] },
  { m: 'Intérêts', d: 'Rémunération d’un prêt ou d’une épargne, ou coût d’un emprunt.', ex: 'Un livret à 2 % verse 20 € d’intérêts par an pour 1 000 €.', a: ['Taux d’intérêt', 'Capital'] },
  { m: 'Liquidité', d: 'Facilité et rapidité avec lesquelles on peut récupérer son argent.', ex: 'Un livret est très liquide ; certaines parts immobilières le sont peu.', a: ['Horizon de placement'] },
  { m: 'Liste noire', d: 'Liste publiée par l’AMF ou l’ACPR des sites et entités non autorisés à proposer des placements.', ex: 'Avant d’investir, on vérifie que la société n’y figure pas.', a: ['AMF', 'ORIAS', 'REGAFI'] },
  { m: 'Moins-value', d: 'Perte réalisée quand on vend un titre moins cher qu’on ne l’a acheté.', ex: 'Acheté 50, vendu 40 : moins-value de 10.', a: ['Plus-value', 'Volatilité'] },
  { m: 'Obligation', d: 'Titre de dette : un prêt à un État ou une entreprise, rémunéré par un coupon.', ex: 'Prêter 1 000 € sur 5 ans à 3 %.', a: ['Coupon', 'Taux d’intérêt', 'Risque de défaut'] },
  { m: 'ORIAS', d: 'Registre officiel des intermédiaires en assurance, banque et finance (orias.fr).', ex: 'Un conseiller en investissements financiers doit y être immatriculé.', a: ['Liste noire', 'AMF'] },
  { m: 'PEA', d: 'Plan d’épargne en actions : enveloppe pour détenir principalement des actions européennes.', ex: 'Un avantage fiscal s’applique après 5 ans, dans les conditions de la loi.', a: ['Enveloppe', 'Action'] },
  { m: 'Perte en capital', d: 'Situation où l’on récupère moins que la somme placée au départ.', ex: 'Placer 1 000 € et récupérer 850 € : perte en capital de 150 €.', a: ['Risque', 'Capital'] },
  { m: 'Plus-value', d: 'Gain réalisé quand on vend un titre plus cher qu’on ne l’a acheté.', ex: 'Acheté 50, vendu 62 : plus-value de 12 (avant frais et impôts).', a: ['Moins-value', 'Action'] },
  { m: 'Portefeuille', d: 'Ensemble des placements détenus par une personne.', ex: 'Le portefeuille fictif de NaoInvest mélange six supports imaginaires.', a: ['Diversification'] },
  { m: 'Pouvoir d’achat', d: 'Quantité de biens et services qu’on peut acheter avec ses revenus.', ex: 'Si les prix montent plus vite que les salaires, le pouvoir d’achat baisse.', a: ['Inflation'] },
  { m: 'REGAFI', d: 'Registre des agents financiers : liste officielle des établissements autorisés (regafi.fr).', ex: 'On y vérifie qu’un établissement est bien agréé.', a: ['ORIAS', 'Liste noire'] },
  { m: 'Rendement', d: 'Ce que rapporte un placement, souvent exprimé en % par an.', ex: '20 € gagnés sur 1 000 € = rendement de 2 %.', a: ['Risque', 'Rendement réel'] },
  { m: 'Rendement réel', d: 'Rendement après prise en compte de l’inflation (≈ rendement − inflation).', ex: '3 % de rendement et 2 % d’inflation ≈ 1 % de rendement réel.', a: ['Inflation', 'Rendement'] },
  { m: 'Reste à vivre', d: 'Ce qui reste après les dépenses fixes, pour vivre au quotidien.', ex: '2 000 € de revenus − 900 € de fixes = 1 100 € de reste à vivre.', a: ['Budget', 'Taux d’endettement'] },
  { m: 'Risque', d: 'Possibilité que le résultat d’un placement soit différent de celui espéré, jusqu’à la perte.', ex: 'Une action peut perdre 30 % en quelques mois.', a: ['Rendement', 'Volatilité', 'Perte en capital'] },
  { m: 'Risque de défaut', d: 'Risque qu’un emprunteur ne rembourse pas ce qu’il doit.', ex: 'Une entreprise en faillite ne paie plus ses obligations.', a: ['Obligation'] },
  { m: 'SCPI', d: 'Société civile de placement immobilier : on achète des parts d’un patrimoine immobilier.', ex: 'Les parts donnent droit à une part des loyers, non garantie.', a: ['Immobilier papier', 'Liquidité'] },
  { m: 'TAEG', d: 'Taux annuel effectif global : coût total d’un crédit (intérêts, assurance obligatoire, frais), exprimé en % par an.', ex: 'Pour comparer deux crédits, on compare leurs TAEG.', a: ['Taux d’endettement', 'Intérêts'] },
  { m: 'Taux d’endettement', d: 'Part des revenus consacrée au remboursement des crédits.', ex: '700 € de crédits pour 2 500 € de revenus = 28 %.', a: ['TAEG', 'Reste à vivre'] },
  { m: 'Taux d’intérêt', d: 'Pourcentage qui fixe la rémunération d’un placement ou le coût d’un emprunt.', ex: 'Emprunter à 4 % coûte plus cher qu’à 3 %.', a: ['Taux directeur', 'Obligation'] },
  { m: 'Taux directeur', d: 'Taux fixé par la banque centrale, qui influence l’ensemble des taux de l’économie.', ex: 'Une hausse des taux directeurs tend à renchérir le crédit.', a: ['Banque centrale', 'Inflation'] },
  { m: 'Unité de compte', d: 'Support d’assurance-vie investi en fonds, actions, immobilier…, sans garantie en capital.', ex: 'Une unité de compte peut baisser comme le marché qu’elle suit.', a: ['Assurance-vie', 'Fonds en euros'] },
  { m: 'Volatilité', d: 'Ampleur des variations du prix d’un placement.', ex: 'Une action très volatile peut faire +8 % puis −10 % en deux jours.', a: ['Risque', 'Cours'] }
];

/* ---------- Actualités expliquées ----------
   Des repères réels, datés et sourcés, choisis parce qu'ils sont vérifiables.
   Ce ne sont pas des nouvelles du jour : l'outil fonctionne hors ligne. Chaque fiche
   rappelle sa date et invite à vérifier la situation actuelle auprès de la source. */
const REDACTION = '2026-09';
const CATEGORIES_ACTU = [
  { id: 'economie', nom: 'Économie', e: '🌍' }, { id: 'epargne', nom: 'Épargne', e: '🪴' }, { id: 'bourse', nom: 'Bourse', e: '📈' },
  { id: 'immobilier', nom: 'Immobilier', e: '🏠' }, { id: 'taux', nom: 'Taux', e: '📊' }, { id: 'inflation', nom: 'Inflation', e: '🎈' },
  { id: 'emploi', nom: 'Emploi', e: '💼' }, { id: 'entreprises', nom: 'Entreprises', e: '🏭' }, { id: 'reglementation', nom: 'Réglementation', e: '⚖️' }
];
const ACTUS = [
  { id: 'a-bce-2025', cat: 'taux', date: '2025-06-05', titre: 'La BCE ramène son principal taux directeur à 2 %',
    source: 'Banque centrale européenne', url: 'https://www.ecb.europa.eu',
    resume: 'Le 5 juin 2025, la Banque centrale européenne a abaissé son taux de dépôt à 2 %. C’était la huitième baisse depuis le début du cycle de baisses engagé en juin 2024, alors que l’inflation de la zone euro se rapprochait de son objectif de 2 %.',
    mots: [['Taux directeur', 'Taux fixé par la banque centrale, qui influence les taux des crédits et de l’épargne.'], ['Taux de dépôt', 'Taux auquel les banques placent leurs excédents auprès de la BCE ; c’est aujourd’hui son principal taux de référence.']],
    pourquoi: 'Les taux directeurs se répercutent, avec du retard, sur les taux des crédits immobiliers, sur la rémunération de certaines épargnes et sur la valeur des obligations. Comprendre ce lien aide à lire les autres actualités.' },
  { id: 'a-bce-2024', cat: 'taux', date: '2024-06-06', titre: 'Première baisse des taux de la BCE depuis 2019',
    source: 'Banque centrale européenne', url: 'https://www.ecb.europa.eu',
    resume: 'Le 6 juin 2024, après une période de hausses rapides destinées à freiner l’inflation, la BCE a baissé ses taux pour la première fois depuis 2019 : son taux de dépôt est passé de 4 % à 3,75 %.',
    mots: [['BCE', 'Banque centrale européenne : elle conduit la politique monétaire des pays de la zone euro.'], ['Politique monétaire', 'Ensemble des décisions d’une banque centrale sur les taux et la quantité de monnaie.']],
    pourquoi: 'Ce tournant a marqué la fin d’une période de hausse des taux. Il illustre comment une banque centrale agit sur l’économie quand l’inflation ralentit.' },
  { id: 'a-livret-2025', cat: 'epargne', date: '2025-08-01', titre: 'Le taux du Livret A passe à 1,7 %',
    source: 'Banque de France / ministère de l’Économie', url: 'https://www.banque-france.fr',
    resume: 'Au 1er août 2025, le taux du Livret A et du LDDS est passé à 1,7 %, après 2,4 % depuis le 1er février 2025 et 3 % auparavant. Ce taux est calculé selon une formule qui tient compte de l’inflation et des taux d’intérêt à court terme.',
    mots: [['Livret A', 'Livret d’épargne réglementé, disponible à tout moment, dont le taux est fixé par les pouvoirs publics.'], ['LDDS', 'Livret de développement durable et solidaire, qui suit le même taux que le Livret A.']],
    pourquoi: 'Quand l’inflation et les taux baissent, la rémunération des livrets réglementés baisse aussi. Le taux a pu changer depuis cette fiche : vérifiez-le sur service-public.fr.' },
  { id: 'a-insee-2024', cat: 'inflation', date: '2025-01', titre: 'L’inflation française retombe à 2,0 % en moyenne en 2024',
    source: 'Insee', url: 'https://www.insee.fr',
    resume: 'Selon l’Insee, les prix à la consommation ont augmenté de 2,0 % en moyenne annuelle en 2024, après 4,9 % en 2023. La hausse des prix a donc nettement ralenti, sans que les prix eux-mêmes baissent.',
    mots: [['Indice des prix à la consommation', 'Outil de l’Insee qui mesure l’évolution moyenne des prix payés par les ménages.'], ['Désinflation', 'Ralentissement de la hausse des prix (à ne pas confondre avec la déflation, qui est une baisse des prix).']],
    pourquoi: 'L’inflation influence le pouvoir d’achat, les taux des livrets réglementés et les décisions de la banque centrale. Moins d’inflation ne veut pas dire que les prix redescendent.' },
  { id: 'a-hcsf', cat: 'immobilier', date: '2022-01-01', titre: 'Crédit immobilier : la norme du HCSF devient contraignante',
    source: 'Haut Conseil de stabilité financière', url: 'https://www.economie.gouv.fr/hcsf',
    resume: 'Depuis le 1er janvier 2022, les banques doivent respecter les critères du HCSF pour les crédits immobiliers : un taux d’effort de 35 % maximum (assurance comprise) et une durée de 25 ans maximum (jusqu’à 27 ans dans certains cas), avec une part de dérogations possibles.',
    mots: [['Taux d’effort', 'Part des revenus consacrée au remboursement des crédits (on dit aussi taux d’endettement).'], ['HCSF', 'Haut Conseil de stabilité financière : autorité qui veille à la stabilité du système financier français.']],
    pourquoi: 'Ces règles expliquent pourquoi une banque peut refuser un prêt même si les mensualités semblent « passer ». Leurs modalités peuvent évoluer : à vérifier auprès de la source.' },
  { id: 'a-mica', cat: 'reglementation', date: '2024-12-30', titre: 'Cryptoactifs : le règlement européen MiCA pleinement applicable',
    source: 'Autorité des marchés financiers', url: 'https://www.amf-france.org',
    resume: 'Depuis le 30 décembre 2024, le règlement européen MiCA encadre les prestataires de services sur cryptoactifs dans l’Union européenne : ils doivent obtenir un agrément pour proposer leurs services, avec des périodes de transition selon les pays.',
    mots: [['Cryptoactif', 'Actif numérique (comme le bitcoin) qui repose sur une technologie de registre partagé ; sa valeur peut varier très fortement.'], ['Agrément', 'Autorisation officielle d’exercer une activité réglementée.']],
    pourquoi: 'Un cadre réglementaire ne supprime pas le risque de perte, très élevé sur les cryptoactifs. Il aide en revanche à vérifier si un prestataire est autorisé, sur le site de l’AMF.' },
  { id: 'a-ptz', cat: 'immobilier', date: '2025-04-01', titre: 'Le prêt à taux zéro élargi dans le neuf',
    source: 'Service-public.fr', url: 'https://www.service-public.fr',
    resume: 'Depuis le 1er avril 2025, le prêt à taux zéro (PTZ) pour l’achat d’un logement neuf est ouvert sur l’ensemble du territoire, pour les appartements comme pour les maisons individuelles, sous conditions de ressources et pour une première acquisition.',
    mots: [['PTZ', 'Prêt sans intérêts, accordé sous conditions pour aider à l’achat d’une résidence principale.'], ['Primo-accédant', 'Personne qui n’a pas été propriétaire de sa résidence principale ces dernières années.']],
    pourquoi: 'Ce type d’aide peut changer le plan de financement d’un projet immobilier. Les conditions évoluent souvent : à vérifier sur service-public.fr.' },
  { id: 'a-peac', cat: 'epargne', date: '2024-07', titre: 'Naissance du plan d’épargne avenir climat (PEAC)',
    source: 'Service-public.fr', url: 'https://www.service-public.fr',
    resume: 'Créé par la loi « Industrie verte », le PEAC est ouvert depuis juillet 2024 aux moins de 21 ans. Les sommes sont en principe bloquées jusqu’à la majorité et au moins 5 ans, et investies dans des supports dédiés au financement de la transition écologique.',
    mots: [['Épargne bloquée', 'Épargne qu’on ne peut pas retirer avant une date ou un événement prévu.'], ['Transition écologique', 'Ensemble des changements visant à réduire l’impact environnemental de l’économie.']],
    pourquoi: 'C’est un exemple d’enveloppe créée par la loi pour orienter l’épargne. Comme toute enveloppe, son contenu peut comporter un risque de perte : lire les documents avant tout.' },
  { id: 'a-covid', cat: 'bourse', date: '2020-03', titre: 'Mars 2020 : la chute brutale des marchés face au Covid-19',
    source: 'Autorité des marchés financiers', url: 'https://www.amf-france.org',
    resume: 'En quelques semaines de février-mars 2020, les grands indices boursiers mondiaux ont perdu près d’un tiers de leur valeur, avant de se redresser dans les mois qui ont suivi, à des rythmes différents selon les secteurs et les pays.',
    mots: [['Krach', 'Chute brutale et importante des cours de Bourse.'], ['Volatilité', 'Ampleur des variations des prix.']],
    pourquoi: 'Cet épisode montre qu’une baisse très forte peut arriver vite, et que personne ne sait à l’avance ni quand, ni pour combien de temps. Les performances passées ne préjugent pas des performances futures.' },
  { id: 'a-pacte', cat: 'reglementation', date: '2019-05-22', titre: 'La loi PACTE réforme l’épargne retraite et le PEA',
    source: 'Ministère de l’Économie', url: 'https://www.economie.gouv.fr',
    resume: 'Promulguée le 22 mai 2019, la loi PACTE a notamment créé le plan d’épargne retraite (PER) et assoupli les règles du PEA : après 5 ans, des retraits partiels sont possibles sans clôturer le plan.',
    mots: [['PER', 'Plan d’épargne retraite : enveloppe pour préparer la retraite, avec des règles de sortie particulières.'], ['Loi PACTE', 'Plan d’action pour la croissance et la transformation des entreprises.']],
    pourquoi: 'Les règles des enveloppes changent avec les lois : c’est pourquoi NaoInvest invite toujours à vérifier la réglementation en vigueur.' }
];

/* ---------- Anti-arnaques ---------- */
const SIGNAUX = [
  { e: '💎', t: 'Rendement garanti élevé', d: 'Un rendement élevé ne peut pas être garanti. Les deux ensemble, c’est le signe le plus fréquent d’une arnaque.' },
  { e: '⏰', t: 'Urgence à investir', d: '« Aujourd’hui seulement », « dernières places » : l’urgence sert à vous empêcher de vérifier.' },
  { e: '📞', t: 'Contact non sollicité', d: 'Un appel, un SMS, un message ou une publicité qui vous propose un placement sans que vous l’ayez demandé.' },
  { e: '🕸️', t: 'Faux site', d: 'Une copie du site d’une banque, d’un assureur ou d’un média, avec une adresse légèrement différente.' },
  { e: '🎭', t: 'Faux conseiller', d: 'Quelqu’un qui usurpe le nom d’une vraie société ou d’un organisme officiel (AMF, Banque de France…).' },
  { e: '📱', t: 'Influenceur et gains rapides', d: 'Promesses d’enrichissement rapide, vie de luxe mise en scène, liens de parrainage : prudence maximale.' },
  { e: '💸', t: 'Virement vers un inconnu', d: 'Vers un particulier, un compte à l’étranger, en cryptoactifs ou en cartes prépayées : jamais.' },
  { e: '🌫️', t: 'Investissement incompréhensible', d: 'Si on ne peut pas vous l’expliquer simplement, ou si vous ne pouvez pas l’expliquer à un proche, ne placez pas.' }
];
const CHECKLIST = [
  'J’ai déjà une épargne de précaution disponible.',
  'Je comprends ce produit et je pourrais l’expliquer simplement à un proche.',
  'Je sais que je peux perdre tout ou partie de l’argent placé (si c’est le cas).',
  'Je connais tous les frais (entrée, gestion, sortie).',
  'Je sais combien de temps mon argent peut être bloqué.',
  'J’ai vérifié l’intermédiaire sur les registres officiels (ORIAS, REGAFI) et les listes noires de l’AMF.',
  'Personne ne me presse : j’ai pris le temps de réfléchir.',
  'On ne me promet pas de rendement élevé « garanti ».',
  'J’ai lu le document d’informations clés (DIC) quand il existe.',
  'J’ai comparé avec d’autres sources fiables, ou demandé l’avis d’un professionnel compétent.'
];
const A_VERIFIER = [
  { e: '🏛️', t: 'L’intermédiaire est-il autorisé ?', d: 'Registres ORIAS (orias.fr) et REGAFI (regafi.fr), listes noires de l’AMF (amf-france.org) et d’ABE Info Service (abe-infoservice.fr).' },
  { e: '📄', t: 'Le produit est-il documenté ?', d: 'Document d’informations clés, conditions générales, brochure tarifaire. Pas de document = pas de placement.' },
  { e: '🧾', t: 'Les frais et la fiscalité sont-ils clairs ?', d: 'Frais d’entrée, de gestion, de sortie ; fiscalité vérifiée sur impots.gouv.fr ou service-public.fr.' },
  { e: '⏳', t: 'L’horizon et la disponibilité me conviennent-ils ?', d: 'Quand aurai-je besoin de cet argent ? Puis-je le récupérer, et à quelles conditions ?' },
  { e: '👩‍💼', t: 'Ai-je demandé un avis compétent ?', d: 'Un conseiller en investissements financiers immatriculé, un notaire, un expert-comptable ou un conseiller bancaire, selon la question.' }
];
const REFLEXES = [
  'Un rendement élevé ne peut jamais être garanti. Si on vous le garantit, fuyez.',
  'On ne vous presse jamais pour un bon placement : l’urgence est une technique de manipulation.',
  'Ne cliquez pas sur un lien reçu par SMS ou e-mail : tapez vous-même l’adresse de votre banque.',
  'Votre banque ne vous demandera jamais vos codes, ni de valider une opération que vous n’avez pas faite.',
  'Avant de placer, vérifiez l’intermédiaire sur orias.fr ou regafi.fr, et sur les listes noires de l’AMF.',
  'Un influenceur qui montre sa réussite n’est pas un conseiller financier.',
  'Jamais de virement vers un particulier ou un compte à l’étranger pour un « placement ».',
  'Si vous ne pouvez pas expliquer le placement à un proche, ne le faites pas.',
  'Un faux conseiller peut connaître votre nom et votre banque : ce n’est pas une preuve.',
  'Dans le doute : AMF Épargne Info Service, 01 53 45 62 00 (numéro à revérifier sur amf-france.org).'
];

/* ---------- Les défis de la semaine ---------- */
const DEFIS = [
  { e: '🧾', t: 'Noter toutes ses dépenses variables pendant 7 jours', d: 'Un carnet, une note sur le téléphone : tout, sans juger.' },
  { e: '🔁', t: 'Refaire deux quiz « à revoir »', d: 'Revenir sur une notion fragile est la meilleure façon de la fixer.' },
  { e: '🔎', t: 'S’exercer à vérifier une société', d: 'Choisir une banque connue et la retrouver soi-même dans le registre REGAFI.' },
  { e: '📉', t: 'Lancer le scénario « marché en baisse »', d: 'Dans le portefeuille fictif, puis noter dans le journal ce que vous avez observé.' },
  { e: '📖', t: 'Apprendre 5 mots du dictionnaire', d: 'Et les expliquer avec vos mots à quelqu’un de votre entourage.' },
  { e: '🎈', t: 'Calculer l’effet de l’inflation sur un achat habituel', d: 'Votre panier de courses coûterait combien avec 3 % d’inflation ?' },
  { e: '☂️', t: 'Estimer son épargne de précaution', d: 'Combien de mois de dépenses courantes représente-t-elle aujourd’hui ?' },
  { e: '📰', t: 'Lire une actualité et expliquer un mot difficile', d: 'Choisir une fiche de « Actualités à comprendre » et la résumer en une phrase.' }
];

/* ---------- Le portefeuille fictif ---------- */
const ACTIFS = [
  { id: 'cash',   nom: 'Espèces virtuelles',            court: 'Espèces',       e: '💶', c: '#9BA3C9', vol: 'Aucune variation (mais l’inflation grignote)', mu: 0,     sig: 0 },
  { id: 'oblig',  nom: 'Obligation fictive — État de Naoland 10 ans', court: 'Obligation', e: '📜', c: '#7FB3E8', vol: 'Faibles variations, sensibles aux taux', mu: .022, sig: .045 },
  { id: 'fonds',  nom: 'Fonds diversifié fictif — Équilibre Lavande', court: 'Fonds diversifié', e: '🎛️', c: '#B39DF2', vol: 'Variations moyennes', mu: .035, sig: .09 },
  { id: 'etf',    nom: 'ETF fictif — Monde Étoilé',       court: 'ETF',           e: '🧺', c: '#8C7BEA', vol: 'Variations moyennes à fortes', mu: .05, sig: .16 },
  { id: 'action', nom: 'Action fictive — Lumina Énergie', court: 'Action',        e: '🧩', c: '#E59BC4', vol: 'Variations fortes', mu: .055, sig: .32 },
  { id: 'immo',   nom: 'Immobilier papier fictif — Pierre Nao', court: 'Immobilier papier', e: '🏢', c: '#F2C27E', vol: 'Variations faibles à moyennes, revente lente', mu: .03, sig: .07 }
];
/* Chaque scénario : impact en % par support, inflation de la période, et l'explication. */
const SCENARIOS = [
  { id: 'hausse', nom: 'Marché en hausse', e: '🌤️', infl: .02, imp: { cash: 0, oblig: 1, fonds: 7, etf: 13, action: 19, immo: 3 },
    txt: 'Les entreprises publient de bons résultats et les investisseurs sont confiants : les actions et l’ETF progressent nettement, le fonds diversifié un peu moins, les obligations bougent peu. Plus un support est volatil, plus il réagit — dans les deux sens.' },
  { id: 'baisse', nom: 'Marché en baisse', e: '🌧️', infl: .02, imp: { cash: 0, oblig: 2, fonds: -9, etf: -17, action: -28, immo: -4 },
    txt: 'L’inquiétude domine : les actions et l’ETF reculent fortement. Les obligations d’État jouent souvent (pas toujours) un rôle d’amortisseur. Un portefeuille réparti baisse moins qu’un portefeuille concentré — mais il baisse aussi.' },
  { id: 'inflation', nom: 'Poussée d’inflation', e: '🎈', infl: .06, imp: { cash: 0, oblig: -5, fonds: -3, etf: -2, action: -4, immo: 1 },
    txt: 'Les prix montent de 6 % : chaque NaoCoin achète moins. Les espèces ne bougent pas en nombre mais perdent en pouvoir d’achat. Les obligations à taux fixe perdent de la valeur, car les taux tendent à monter. Regardez la ligne « valeur corrigée de l’inflation ».' },
  { id: 'baisse-taux', nom: 'Baisse des taux', e: '📉', infl: .015, imp: { cash: 0, oblig: 6, fonds: 4, etf: 5, action: 4, immo: 5 },
    txt: 'La banque centrale baisse ses taux : les obligations déjà émises (qui rapportent plus que les nouvelles) prennent de la valeur, l’immobilier papier en profite souvent, et le crédit moins cher peut soutenir les entreprises.' },
  { id: 'hausse-taux', nom: 'Hausse des taux', e: '📈', infl: .03, imp: { cash: 0, oblig: -7, fonds: -5, etf: -6, action: -7, immo: -8 },
    txt: 'La banque centrale monte ses taux pour freiner l’inflation : les obligations existantes perdent de la valeur, l’immobilier papier est pénalisé, et les actions peuvent reculer. Les espèces, elles, ne bougent pas.' },
  { id: 'crise', nom: 'Crise sectorielle (énergie)', e: '⚡', infl: .025, imp: { cash: 0, oblig: 1, fonds: -3, etf: -3, action: -35, immo: 0 },
    txt: 'Le secteur de l’énergie traverse une crise : l’action fictive Lumina Énergie chute lourdement. L’ETF monde, qui contient des centaines d’entreprises, n’est que peu touché. C’est l’illustration la plus nette de la diversification.' },
  { id: 'reprise', nom: 'Reprise économique', e: '🌱', infl: .025, imp: { cash: 0, oblig: -1, fonds: 6, etf: 10, action: 17, immo: 3 },
    txt: 'L’activité repart après une période difficile : les entreprises retrouvent des perspectives, les actions progressent. Les obligations peuvent légèrement reculer si les taux remontent avec la reprise.' }
];
const REPARTITIONS_TYPES = [
  { nom: 'Tout en espèces', r: { cash: 100, oblig: 0, fonds: 0, etf: 0, action: 0, immo: 0 } },
  { nom: 'Très répartie', r: { cash: 15, oblig: 25, fonds: 20, etf: 20, action: 5, immo: 15 } },
  { nom: 'Tout sur une action', r: { cash: 0, oblig: 0, fonds: 0, etf: 0, action: 100, immo: 0 } }
];
