/* ============================================================
   NaoInvest — le cours « Comprendre les impôts ».
   Huit chapitres, du « pourquoi » à la déclaration, avec un barème
   daté pour s'exercer et une calculatrice qui montre chaque étape.
   NaoInvest n'est pas un conseiller fiscal : tout se vérifie sur
   impots.gouv.fr ou service-public.fr.
   ============================================================ */
ESPACES.impots = { nom: 'Comprendre les impôts', court: 'Impôts', e: '🧾' };

/* Le barème de l'impôt sur le revenu appliqué aux revenus 2024 (déclarés en 2025),
   par part de quotient familial. Il est revalorisé chaque année : il sert ici à s'exercer. */
const BAREME = {
  annee: 'revenus 2024, déclarés en 2025',
  tranches: [
    { de: 0,      a: 11497,    taux: 0 },
    { de: 11497,  a: 29315,    taux: 11 },
    { de: 29315,  a: 83823,    taux: 30 },
    { de: 83823,  a: 180294,   taux: 41 },
    { de: 180294, a: Infinity, taux: 45 }
  ]
};
/* le calcul par tranches, pour une part */
function impotParPart(q) {
  return BAREME.tranches.map(t => {
    const base = Math.max(0, Math.min(q, t.a) - t.de);
    return Object.assign({ base, impot: base * t.taux / 100 }, t);
  });
}

LECONS.push(
{ id: 'i-principes', esp: 'impots', niv: 1, min: 6, e: '🏛️', titre: 'Chapitre 1 — À quoi servent les impôts ?',
  intro: 'Avant de calculer quoi que ce soit, comprenons le système : qui paie, quoi, et pour financer quoi.',
  sections: [
    { h: 'Financer ce qui est commun', p: 'Les impôts et les cotisations financent les services publics (écoles, hôpitaux, routes, justice, sécurité), la protection sociale (retraites, santé, allocations) et les collectivités (communes, départements, régions). On parle de <b>prélèvements obligatoires</b>.' },
    { h: 'Impôts directs et indirects', p: 'Un impôt <b>direct</b> est payé directement par la personne qui le doit : l’impôt sur le revenu, la taxe foncière. Un impôt <b>indirect</b> est inclus dans le prix de ce qu’on achète : la <b>TVA</b>, les taxes sur le carburant. Tout le monde paie de la TVA, même sans payer d’impôt sur le revenu.' },
    { h: 'Impôts et cotisations', p: 'Sur une fiche de paie, les <b>cotisations sociales</b> (retraite, chômage, santé) sont prélevées avant le salaire net. S’y ajoutent la <b>CSG</b> et la <b>CRDS</b>, qui financent la Sécurité sociale. L’impôt sur le revenu vient ensuite, sur le revenu imposable.' },
    { h: 'Qui décide ?', p: 'Chaque année, le Parlement vote la <b>loi de finances</b> : elle fixe les règles et les taux pour l’année. C’est pour cela que les montants changent souvent : un chiffre juste l’an dernier peut ne plus l’être aujourd’hui.' }
  ],
  exemple: 'Emma, étudiante, ne paie pas d’impôt sur le revenu. Pourtant, en achetant un casque audio à 60 € TTC, elle paie 10 € de TVA : 50 € hors taxe + 20 % de TVA = 60 €.',
  retenir: ['Direct = payé par la personne ; indirect = inclus dans les prix.', 'Tout le monde paie des impôts indirects, comme la TVA.', 'Les règles changent chaque année avec la loi de finances.'],
  quiz: [
    { q: 'La TVA est un impôt…', c: ['Direct', 'Indirect, inclus dans le prix'], b: 1, x: 'Elle est payée à chaque achat, incluse dans le prix TTC.' },
    { q: 'Un objet coûte 100 € hors taxe, avec une TVA à 20 %. Prix TTC (en €) ?', n: 120, tol: 0, u: '€', x: '100 + 20 % = 120 € TTC.' },
    { q: 'Qui vote chaque année les règles des impôts ?', c: ['Le Parlement, avec la loi de finances', 'Chaque banque'], b: 0, x: 'La loi de finances fixe les règles fiscales de l’année.' },
    { q: 'Une personne qui ne paie pas d’impôt sur le revenu…', c: ['Ne paie aucun impôt', 'Paie quand même des impôts indirects comme la TVA'], b: 1, x: 'Chaque achat inclut de la TVA.' }
  ] },

{ id: 'i-revenu', esp: 'impots', niv: 2, min: 9, e: '📊', titre: 'Chapitre 2 — L’impôt sur le revenu et ses tranches',
  intro: 'L’idée la plus mal comprise de la fiscalité française : « passer dans la tranche supérieure ». Ce chapitre la démonte, calcul à l’appui.',
  sections: [
    { h: 'Du salaire au revenu imposable', p: 'On part des revenus de l’année (salaires, pensions, revenus d’activité…). Pour les salaires, on retire en général un <b>abattement de 10 %</b> pour frais professionnels (ou les frais réels, si on les déclare), et certaines charges déductibles. On obtient le <b>revenu net imposable</b>.' },
    { h: 'Un impôt progressif, par tranches', p: 'Le revenu est découpé en <b>tranches</b>. Chaque tranche a son taux : 0 %, 11 %, 30 %, 41 %, 45 % (barème des revenus 2024). <b>Chaque taux ne s’applique qu’à la part du revenu qui se trouve dans sa tranche</b> — jamais à tout le revenu.' },
    { h: 'Le mythe de la tranche supérieure', p: 'Gagner 100 € de plus et « passer dans la tranche à 30 % » ne fait payer 30 % que sur ces 100 € là. On ne gagne jamais moins en gagnant plus à cause du barème.' },
    { h: 'Taux marginal et taux moyen', p: 'Le <b>taux marginal</b>, c’est le taux de la dernière tranche atteinte. Le <b>taux moyen</b>, c’est l’impôt total divisé par le revenu imposable : il est toujours plus bas. Votre avis d’imposition et votre taux de prélèvement à la source se rapprochent du taux moyen.' }
  ],
  exemple: 'Léa, célibataire, a 30 000 € de revenu net imposable (1 part). Tranche à 0 % : rien sur les 11 497 premiers euros. Tranche à 11 % : (29 315 − 11 497) × 11 % ≈ 1 960 €. Tranche à 30 % : (30 000 − 29 315) × 30 % ≈ 206 €. Impôt brut ≈ 2 165 € : son taux marginal est de 30 %, mais son taux moyen n’est que d’environ 7,2 %.',
  retenir: ['Chaque taux ne touche que sa tranche.', 'Taux marginal ≠ taux moyen (toujours plus bas).', 'Gagner plus ne fait jamais gagner moins à cause du barème.'],
  quiz: [
    { q: 'Vous « passez » dans la tranche à 30 %. Le taux de 30 % s’applique…', c: ['À tout votre revenu', 'Seulement à la part de revenu dans cette tranche'], b: 1, x: 'C’est le principe de l’impôt progressif par tranches.' },
    { q: 'Avec le barème du cours, 1 part, 20 000 € de revenu imposable : impôt brut (en €, arrondi) ?', n: 935, tol: 3, u: '€', x: '(20 000 − 11 497) × 11 % ≈ 935 €. Les 11 497 premiers euros sont à 0 %.' },
    { q: 'Salaire net imposable de 25 000 € avec l’abattement de 10 % : revenu retenu (en €) ?', n: 22500, tol: 0, u: '€', x: '25 000 − 10 % = 22 500 € (l’abattement a en réalité un minimum et un maximum).' },
    { q: 'Le taux moyen d’imposition est…', c: ['Plus élevé que le taux marginal', 'Plus bas que le taux marginal (ou égal)'], b: 1, x: 'Les premières tranches, moins taxées, font baisser la moyenne.' }
  ] },

{ id: 'i-quotient', esp: 'impots', niv: 3, min: 8, e: '👨‍👩‍👧', titre: 'Chapitre 3 — Le foyer fiscal et le quotient familial',
  intro: 'L’impôt sur le revenu ne regarde pas une personne seule, mais un foyer. Le quotient familial adapte l’impôt à sa taille.',
  sections: [
    { h: 'Le foyer fiscal', p: 'C’est l’ensemble des personnes qui déposent une déclaration commune : une personne seule, ou un couple marié ou pacsé, avec les personnes à charge (enfants, parfois d’autres). Un couple en union libre fait deux déclarations séparées.' },
    { h: 'Les parts', p: 'Chaque foyer a un nombre de <b>parts</b> : 1 pour une personne seule, 2 pour un couple marié ou pacsé, + 0,5 part pour chacun des deux premiers enfants à charge, + 1 part à partir du troisième. Un enfant en <b>garde alternée</b> compte pour moitié : 0,25 part pour chacun des deux premiers, 0,5 ensuite (un couple avec un enfant en garde alternée a donc 2,25 parts). Des situations particulières (parent isolé, invalidité…) peuvent ajouter des parts.' },
    { h: 'Le calcul en trois temps', p: '<b>1.</b> On divise le revenu imposable du foyer par le nombre de parts : c’est le <b>quotient</b>. <b>2.</b> On applique le barème à ce quotient. <b>3.</b> On multiplie le résultat par le nombre de parts.' },
    { h: 'Des limites', p: 'L’avantage lié aux demi-parts pour enfants est <b>plafonné</b> ; une <b>décote</b> allège l’impôt des foyers modestes ; des réductions et crédits d’impôt viennent ensuite. Le vrai calcul est donc plus complet que celui du cours : le simulateur officiel d’impots.gouv.fr en tient compte.' }
  ],
  exemple: 'Un couple pacsé avec 2 enfants a 3 parts (2 + 0,5 + 0,5). Avec 60 000 € de revenu imposable, le quotient est de 20 000 € par part : le barème s’applique à 20 000 €, puis on multiplie par 3. Sans enfants, le quotient serait de 30 000 € par part, donc taxé plus haut.',
  retenir: ['Le foyer fiscal déclare ensemble.', 'Quotient = revenu imposable ÷ nombre de parts.', 'Plafonnement et décote rendent le vrai calcul plus fin.'],
  quiz: [
    { q: 'Un couple marié avec 3 enfants a combien de parts ?', n: 4, tol: 0, u: 'parts', x: '2 + 0,5 + 0,5 + 1 (le 3e enfant compte pour une part entière) = 4 parts.' },
    { q: 'Foyer de 2 parts, revenu imposable 50 000 € : quotient par part (en €) ?', n: 25000, tol: 0, u: '€', x: '50 000 ÷ 2 = 25 000 €.' },
    { q: 'Un couple en union libre…', c: ['Déclare en commun', 'Fait deux déclarations séparées'], b: 1, x: 'Seuls le mariage et le PACS permettent la déclaration commune.' },
    { q: 'L’avantage des demi-parts pour enfants est…', c: ['Illimité', 'Plafonné'], b: 1, x: 'Le plafonnement du quotient familial limite cet avantage.' }
  ] },

{ id: 'i-prelevement', esp: 'impots', niv: 2, min: 7, e: '💳', titre: 'Chapitre 4 — Le prélèvement à la source',
  intro: 'Depuis le 1er janvier 2019, l’impôt sur le revenu est prélevé au fil des mois. Mais la déclaration annuelle existe toujours : voici pourquoi.',
  sections: [
    { h: 'Le principe', p: 'L’employeur, la caisse de retraite ou Pôle emploi/France Travail retient chaque mois un montant d’impôt sur ce qu’il verse, selon un <b>taux</b> transmis par l’administration fiscale. Pour les indépendants et les revenus fonciers, ce sont des <b>acomptes</b> prélevés sur le compte bancaire.' },
    { h: 'Trois taux possibles', p: 'Le taux <b>personnalisé</b> (celui du foyer, par défaut), le taux <b>individualisé</b> (pour répartir différemment dans un couple aux revenus inégaux) et le taux <b>non personnalisé</b> ou « neutre » (si l’on ne veut pas que l’employeur connaisse son taux, avec parfois un complément à verser).' },
    { h: 'Pourquoi déclarer quand même ?', p: 'Le taux appliqué pendant l’année repose sur les revenus des années passées. La déclaration du printemps permet de calculer l’impôt <b>exact</b> : l’administration rembourse le trop-perçu ou demande le complément, souvent à la fin de l’été.' },
    { h: 'Changement de situation', p: 'Mariage, naissance, baisse ou hausse de revenus : on peut <b>actualiser son taux</b> dans son espace particulier sur impots.gouv.fr, pour éviter une grosse régularisation l’année suivante.' }
  ],
  exemple: 'Karim a un taux de prélèvement de 5 %. Pour un salaire net avant impôt de 2 000 €, 100 € sont prélevés : il reçoit 1 900 € sur son compte. S’il a une naissance en cours d’année, il peut signaler ce changement pour que son taux baisse.',
  retenir: ['L’impôt est prélevé chaque mois, selon un taux.', 'La déclaration annuelle calcule l’impôt exact et régularise.', 'On peut actualiser son taux en cas de changement.'],
  quiz: [
    { q: 'Salaire net avant impôt 2 400 €, taux de 6 %. Montant prélevé (en €) ?', n: 144, tol: 0, u: '€', x: '2 400 × 6 % = 144 €.' },
    { q: 'Avec le prélèvement à la source, faut-il encore déclarer ses revenus ?', c: ['Non', 'Oui, chaque année'], b: 1, x: 'La déclaration permet de calculer l’impôt définitif et de régulariser.' },
    { q: 'Le taux « neutre » sert surtout à…', c: ['Payer moins d’impôt', 'Ne pas communiquer son taux personnel à l’employeur'], b: 1, x: 'Il ne change pas l’impôt final ; un complément peut être dû.' },
    { q: 'Vous gagnez beaucoup moins cette année. Que pouvez-vous faire ?', c: ['Actualiser votre taux sur impots.gouv.fr', 'Attendre deux ans'], b: 0, x: 'L’actualisation évite de trop payer pendant l’année.' }
  ] },

{ id: 'i-deductions', esp: 'impots', niv: 3, min: 8, e: '✂️', titre: 'Chapitre 5 — Déductions, réductions et crédits d’impôt',
  intro: 'Trois mots proches, trois mécanismes différents. Les confondre, c’est se tromper sur ce que l’on va vraiment économiser.',
  sections: [
    { h: 'La déduction : avant le barème', p: 'Une charge <b>déductible</b> diminue le revenu imposable (par exemple une pension alimentaire versée, ou des versements sur un plan d’épargne retraite dans certaines limites). L’économie dépend donc du taux marginal : 1 000 € déduits font économiser environ 300 € à un foyer dont le taux marginal est de 30 %, 110 € à 11 %, et rien à 0 %.' },
    { h: 'La réduction d’impôt : après le barème', p: 'Elle diminue l’impôt lui-même. Exemple : les <b>dons</b> à certaines associations ouvrent droit à une réduction de 66 % du montant donné (75 % pour certains organismes d’aide aux personnes en difficulté), dans des limites. <b>Mais</b> si l’impôt tombe à zéro, le reste est perdu.' },
    { h: 'Le crédit d’impôt : remboursable', p: 'Il diminue l’impôt… et s’il dépasse l’impôt dû, la différence est <b>remboursée</b>. Exemple : l’emploi d’un salarié à domicile (ménage, garde d’enfant à domicile, soutien scolaire…) ouvre droit à un crédit d’impôt de 50 % des dépenses, dans la limite de plafonds.' },
    { h: 'Jamais d’achat « pour défiscaliser »', p: 'Un avantage fiscal ne rend pas bon un placement mauvais. Certains produits vendus « pour payer moins d’impôts » sont risqués ou très chers : on vérifie toujours le produit avant l’avantage — et on se méfie des démarcheurs.' }
  ],
  exemple: 'Sarah donne 150 € à une association reconnue d’utilité publique : sa réduction d’impôt est de 150 × 66 % = 99 €. Le don lui « coûte » réellement 51 €. Si elle ne payait pas d’impôt, la réduction ne lui serait pas remboursée.',
  retenir: ['Déduction : baisse le revenu imposable.', 'Réduction : baisse l’impôt, jamais en dessous de zéro.', 'Crédit : baisse l’impôt, et l’excédent est remboursé.'],
  quiz: [
    { q: 'Don de 300 € ouvrant droit à 66 % de réduction. Réduction (en €) ?', n: 198, tol: 0, u: '€', x: '300 × 66 % = 198 €.' },
    { q: 'Vous ne payez pas d’impôt. Un crédit d’impôt de 400 €…', c: ['Est perdu', 'Vous est remboursé'], b: 1, x: 'C’est toute la différence entre crédit et réduction.' },
    { q: '1 000 € de charges déductibles, taux marginal 30 %. Économie d’impôt approximative (en €) ?', n: 300, tol: 0, u: '€', x: '1 000 × 30 % ≈ 300 € : une déduction vaut plus quand le taux marginal est élevé.' },
    { q: 'Un produit « idéal pour défiscaliser » vous est proposé par téléphone. Le bon réflexe ?', c: ['Signer vite pour profiter de l’avantage', 'Vérifier le produit, ses risques et le vendeur avant tout'], b: 1, x: 'L’avantage fiscal ne compense jamais un mauvais produit ; le démarchage est un signal d’alerte.' }
  ] },

{ id: 'i-epargne', esp: 'impots', niv: 3, min: 8, e: '🪴', titre: 'Chapitre 6 — Comment l’épargne est-elle imposée ?',
  intro: 'Intérêts, dividendes, plus-values : ce que rapporte l’épargne est souvent imposé… mais pas toujours, ni de la même façon.',
  sections: [
    { h: 'Les livrets réglementés', p: 'Les intérêts du Livret A, du LDDS et du LEP sont <b>exonérés</b> d’impôt sur le revenu et de prélèvements sociaux. Les intérêts des livrets bancaires ordinaires, eux, sont imposables.' },
    { h: 'Le prélèvement forfaitaire unique', p: 'Les revenus de l’épargne (intérêts, dividendes, plus-values sur titres) sont, par défaut, soumis au <b>prélèvement forfaitaire unique</b> (PFU, dit « flat tax ») : une part d’impôt sur le revenu (12,8 %) et une part de <b>prélèvements sociaux</b>. Le total a longtemps été de 30 % ; le taux des prélèvements sociaux a été modifié à plusieurs reprises : <b>vérifiez le taux en vigueur</b>. On peut aussi opter pour le barème progressif, si c’est plus favorable, pour l’ensemble de ces revenus.' },
    { h: 'Les enveloppes et leurs règles', p: '<b>PEA</b> : après 5 ans, les gains échappent à l’impôt sur le revenu, mais pas aux prélèvements sociaux. <b>Assurance-vie</b> : fiscalité allégée après 8 ans, avec un abattement annuel sur les gains retirés. <b>Compte-titres</b> : fiscalité « normale » chaque année. Dans tous les cas : conditions à vérifier.' },
    { h: 'Seulement les gains, pas le capital', p: 'L’impôt porte sur ce que l’épargne a <b>rapporté</b>, pas sur l’argent versé. Retirer 1 000 € d’une assurance-vie qui en contient 10 000 € dont 2 000 € de gains, c’est retirer surtout du capital, et un peu de gains.' }
  ],
  exemple: 'Tom touche 100 € d’intérêts sur son Livret A : il n’a rien à payer. Avec 100 € d’intérêts sur un livret bancaire soumis à un prélèvement de 30 %, il lui en resterait 70 €.',
  retenir: ['Livret A, LDDS, LEP : intérêts exonérés.', 'PFU par défaut, option possible pour le barème.', 'Les enveloppes (PEA, assurance-vie) ont des règles propres.'],
  quiz: [
    { q: 'Les intérêts du Livret A sont…', c: ['Imposés au PFU', 'Exonérés d’impôt et de prélèvements sociaux'], b: 1, x: 'C’est l’une des caractéristiques des livrets réglementés.' },
    { q: '200 € de dividendes, avec un prélèvement total de 30 %. Montant net (en €) ?', n: 140, tol: 0, u: '€', x: '200 − 30 % = 140 €. Le taux réel en vigueur se vérifie sur impots.gouv.fr.' },
    { q: 'Sur un PEA de plus de 5 ans, les gains retirés…', c: ['Ne supportent plus que les prélèvements sociaux', 'Sont totalement exonérés de tout'], b: 0, x: 'L’impôt sur le revenu disparaît, pas les prélèvements sociaux.' },
    { q: 'L’impôt sur l’épargne porte sur…', c: ['Tout l’argent versé', 'Les gains réalisés'], b: 1, x: 'Le capital versé n’est pas imposé une seconde fois.' }
  ] },

{ id: 'i-locaux', esp: 'impots', niv: 2, min: 6, e: '🏠', titre: 'Chapitre 7 — Taxe foncière, taxe d’habitation et TVA',
  intro: 'Au-delà de l’impôt sur le revenu, d’autres impôts touchent le logement et la consommation. Chacun a sa logique.',
  sections: [
    { h: 'La taxe foncière', p: 'Payée chaque automne par les <b>propriétaires</b> au 1er janvier de l’année. Elle finance les communes et groupements de communes. Elle se calcule sur une <b>valeur locative cadastrale</b> (un loyer théorique fixé par l’administration), multipliée par des taux votés localement.' },
    { h: 'La taxe d’habitation', p: 'Elle a été <b>supprimée pour les résidences principales</b> (totalement depuis 2023). Elle existe toujours pour les <b>résidences secondaires</b> et certains logements vacants, avec parfois une majoration dans les zones tendues.' },
    { h: 'La TVA', p: 'La taxe sur la valeur ajoutée est la première recette de l’État. Taux normal : <b>20 %</b>. Taux réduits : <b>10 %</b> (restauration, transports…), <b>5,5 %</b> (la plupart des produits alimentaires, énergie…), <b>2,1 %</b> (certains médicaments, presse…).' },
    { h: 'Et le patrimoine ?', p: 'L’<b>impôt sur la fortune immobilière</b> (IFI) ne concerne que les foyers dont le patrimoine immobilier net dépasse 1,3 million d’euros. Lors d’une succession ou d’une donation, des <b>droits</b> peuvent aussi être dus, avec des abattements selon le lien de parenté.' }
  ],
  exemple: 'Au restaurant, une addition de 55 € TTC avec une TVA à 10 % comprend 5 € de TVA (50 € hors taxe + 10 %). En achetant un appartement, Julie devient redevable de la taxe foncière dès l’année suivante — un coût à prévoir dans son budget.',
  retenir: ['Taxe foncière : pour les propriétaires.', 'Taxe d’habitation : supprimée pour la résidence principale.', 'TVA : 20 %, 10 %, 5,5 %, 2,1 %.'],
  quiz: [
    { q: 'Qui paie la taxe foncière ?', c: ['Le locataire', 'Le propriétaire au 1er janvier'], b: 1, x: 'C’est un impôt de propriétaire.' },
    { q: 'Pour sa résidence principale, la taxe d’habitation est aujourd’hui…', c: ['Supprimée', 'Doublée'], b: 0, x: 'Elle a disparu pour les résidences principales ; elle reste due pour les résidences secondaires.' },
    { q: 'Prix hors taxe de 200 €, TVA à 5,5 %. Prix TTC (en €) ?', n: 211, tol: 0, u: '€', x: '200 × 1,055 = 211 €.' },
    { q: 'Le taux normal de TVA en France est de…', c: ['10 %', '20 %', '33 %'], b: 1, x: '20 % est le taux normal ; les autres sont des taux réduits.' }
  ] },

{ id: 'i-declaration', esp: 'impots', niv: 2, min: 7, e: '🗓️', titre: 'Chapitre 8 — Déclarer, lire son avis, éviter les pièges',
  intro: 'Dernier chapitre : le calendrier, les documents, les bons gestes… et les arnaques qui se déguisent en administration fiscale.',
  sections: [
    { h: 'Le calendrier', p: 'Au <b>printemps</b> (en général d’avril à juin, avec des dates limites selon les départements), on vérifie et complète sa déclaration de revenus, le plus souvent en ligne. À la <b>fin de l’été</b>, l’avis d’imposition arrive : remboursement ou complément. À l’<b>automne</b>, les taxes foncières.' },
    { h: 'Vérifier, même si c’est prérempli', p: 'Les salaires et pensions sont préremplis, mais il faut vérifier : revenus manquants, frais réels, pensions versées, dons, emploi à domicile, changement de situation… Le déclarant reste <b>responsable</b> de ce qu’il signe.' },
    { h: 'Lire son avis d’imposition', p: 'On y retrouve le revenu fiscal de référence (souvent demandé pour des aides), le nombre de parts, l’impôt calculé, les réductions et crédits, ce qui a déjà été prélevé et le solde. Une erreur ? On peut corriger en ligne ou faire une réclamation depuis son espace particulier.' },
    { h: 'Les arnaques aux « impôts »', p: 'Faux SMS ou e-mail « vous avez droit à un remboursement », faux site qui imite impots.gouv.fr : <b>l’administration ne demande jamais vos coordonnées bancaires ou votre numéro de carte par message</b>. On se connecte toujours en tapant soi-même l’adresse impots.gouv.fr.' }
  ],
  exemple: 'Inès reçoit un SMS : « Remboursement d’impôt de 248 €, confirmez votre carte ici. » Elle ne clique pas, tape elle-même impots.gouv.fr : aucun remboursement n’est annoncé dans son espace. C’était une tentative d’hameçonnage.',
  retenir: ['Printemps : déclaration ; fin d’été : avis ; automne : taxe foncière.', 'Prérempli ne veut pas dire exact : on vérifie.', 'Jamais de coordonnées bancaires par SMS ou e-mail.'],
  quiz: [
    { q: 'Votre déclaration est préremplie. Vous devez…', c: ['La valider sans regarder', 'La vérifier et la compléter si besoin'], b: 1, x: 'Le déclarant reste responsable de ce qu’il déclare.' },
    { q: 'Un SMS vous propose un « remboursement d’impôt » contre votre numéro de carte. C’est…', c: ['Normal', 'Une arnaque : l’administration ne demande jamais cela'], b: 1, x: 'Ne cliquez pas ; passez toujours par impots.gouv.fr tapé vous-même.' },
    { q: 'Le revenu fiscal de référence figure…', c: ['Sur l’avis d’imposition', 'Sur la fiche de paie'], b: 0, x: 'On le retrouve sur l’avis ; il sert pour de nombreuses aides.' },
    { q: 'Vous repérez une erreur sur votre avis. Que faire ?', c: ['Rien, c’est trop tard', 'Corriger en ligne ou faire une réclamation depuis son espace'], b: 1, x: 'Des corrections et réclamations sont possibles, dans des délais.' }
  ] }
);

PARCOURS.push({ id: 'impots', nom: 'Comprendre mes impôts', e: '🧾', desc: 'Le cours complet : tranches, quotient familial, prélèvement à la source, épargne, déclaration.',
  lecons: ['i-principes', 'i-revenu', 'i-quotient', 'i-prelevement', 'i-deductions', 'i-epargne', 'i-locaux', 'i-declaration'] });
BADGES.splice(BADGES.length - 1, 0, { id: 'impots', nom: 'Impôts démystifiés', e: '🧾', desc: 'Réussir les chapitres sur les tranches, le quotient familial, le prélèvement à la source et les réductions.', lecons: ['i-revenu', 'i-quotient', 'i-prelevement', 'i-deductions'] });

DICO.push(
  { m: 'Abattement', d: 'Somme ou pourcentage retiré d’un revenu avant de calculer l’impôt.', ex: 'L’abattement de 10 % pour frais professionnels sur les salaires.', a: ['Revenu net imposable', 'Frais réels'] },
  { m: 'Avis d’imposition', d: 'Document envoyé par l’administration fiscale qui détaille le calcul de l’impôt et le solde à payer ou à recevoir.', ex: 'Il arrive en général à la fin de l’été.', a: ['Revenu fiscal de référence', 'Prélèvement à la source'] },
  { m: 'Crédit d’impôt', d: 'Somme déduite de l’impôt ; si elle dépasse l’impôt dû, la différence est remboursée.', ex: 'L’emploi d’un salarié à domicile ouvre droit à un crédit d’impôt.', a: ['Réduction d’impôt', 'Déduction'] },
  { m: 'CSG', d: 'Contribution sociale généralisée : prélèvement sur la plupart des revenus, qui finance la Sécurité sociale.', ex: 'Elle apparaît sur la fiche de paie et s’applique aussi aux revenus de l’épargne.', a: ['Prélèvements sociaux'] },
  { m: 'Décote', d: 'Mécanisme qui réduit l’impôt sur le revenu des foyers aux revenus modestes.', ex: 'Un petit impôt calculé peut être fortement réduit, voire annulé, par la décote.', a: ['Impôt sur le revenu'] },
  { m: 'Déduction', d: 'Charge retirée du revenu imposable ; l’économie dépend du taux marginal.', ex: 'Une pension alimentaire versée est déductible dans certaines limites.', a: ['Crédit d’impôt', 'Taux marginal'] },
  { m: 'Foyer fiscal', d: 'Ensemble des personnes qui déposent une même déclaration de revenus.', ex: 'Un couple pacsé avec deux enfants forme un foyer fiscal.', a: ['Quotient familial', 'Parts'] },
  { m: 'Frais réels', d: 'Option qui remplace l’abattement de 10 % par les frais professionnels réellement engagés, sur justificatifs.', ex: 'Utile, par exemple, en cas de longs trajets domicile-travail.', a: ['Abattement'] },
  { m: 'Impôt sur le revenu', d: 'Impôt direct et progressif calculé sur les revenus du foyer fiscal.', ex: 'Il est prélevé à la source puis régularisé après la déclaration.', a: ['Tranche', 'Quotient familial'] },
  { m: 'Parts', d: 'Unités qui mesurent la taille du foyer pour le quotient familial.', ex: 'Couple marié : 2 parts ; + 0,5 par enfant pour les deux premiers.', a: ['Quotient familial'] },
  { m: 'PFU', d: 'Prélèvement forfaitaire unique (« flat tax ») : imposition par défaut des revenus de l’épargne, impôt et prélèvements sociaux compris.', ex: 'Des dividendes sont soumis par défaut au PFU.', a: ['Prélèvements sociaux', 'Dividende'] },
  { m: 'Prélèvement à la source', d: 'Mode de paiement de l’impôt sur le revenu, retenu chaque mois sur les revenus.', ex: 'Un taux de 5 % sur un salaire de 2 000 € : 100 € prélevés.', a: ['Taux de prélèvement', 'Avis d’imposition'] },
  { m: 'Prélèvements sociaux', d: 'CSG, CRDS et autres prélèvements qui financent la protection sociale, notamment sur les revenus de l’épargne.', ex: 'Les gains d’un PEA de plus de 5 ans y restent soumis.', a: ['CSG', 'PFU'] },
  { m: 'Quotient familial', d: 'Revenu imposable divisé par le nombre de parts : c’est à lui qu’on applique le barème.', ex: '60 000 € pour 3 parts : quotient de 20 000 €.', a: ['Parts', 'Foyer fiscal'] },
  { m: 'Réduction d’impôt', d: 'Somme déduite de l’impôt, sans remboursement si elle dépasse l’impôt dû.', ex: 'Les dons aux associations ouvrent droit à une réduction d’impôt.', a: ['Crédit d’impôt'] },
  { m: 'Revenu fiscal de référence', d: 'Montant figurant sur l’avis d’imposition, utilisé pour l’accès à de nombreuses aides.', ex: 'Il sert, par exemple, à vérifier les conditions du LEP.', a: ['Avis d’imposition'] },
  { m: 'Revenu net imposable', d: 'Revenu retenu pour calculer l’impôt, après abattements et charges déductibles.', ex: '25 000 € de salaires − 10 % = 22 500 € de revenu net imposable.', a: ['Abattement', 'Tranche'] },
  { m: 'Taux marginal', d: 'Taux de la tranche la plus haute atteinte par le quotient familial.', ex: 'Avec un quotient de 30 000 €, le taux marginal est de 30 %.', a: ['Taux moyen', 'Tranche'] },
  { m: 'Taux moyen', d: 'Impôt total divisé par le revenu imposable ; toujours inférieur ou égal au taux marginal.', ex: '2 165 € d’impôt pour 30 000 € : environ 7,2 %.', a: ['Taux marginal'] },
  { m: 'Tranche', d: 'Portion du revenu à laquelle s’applique un taux du barème.', ex: 'La tranche à 11 % ne concerne que la part du revenu située dans ses bornes.', a: ['Taux marginal', 'Impôt sur le revenu'] },
  { m: 'TVA', d: 'Taxe sur la valeur ajoutée : impôt indirect inclus dans le prix des biens et services.', ex: 'Taux normal de 20 % ; taux réduits de 10 %, 5,5 % et 2,1 %.', a: ['Impôt sur le revenu'] }
);
REFLEXES.push('L’administration fiscale ne demande jamais vos coordonnées bancaires par SMS ou e-mail pour un « remboursement ».');
