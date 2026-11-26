/* ============================================================
   NaoInvest — les conseils de vie.
   Des repères concrets, par âge et par situation : les bons réflexes
   d'argent au quotidien, les pièges classiques, et pourquoi.
   Ce sont des repères généraux, jamais une recommandation personnalisée.
   Et l'atelier « le vrai coût d'une voiture ».
   ============================================================ */
const THEMES_CONSEILS = [
{ id: 'jeunes', e: '🎓', nom: '18–25 ans : les premiers pas', sous: 'Premier salaire, premier logement, première voiture : les choix d’aujourd’hui pèsent longtemps.', conseils: [
  { id: 'voiture', e: '🚗', t: 'La première voiture : commencer petit',
    reflexe: 'Éviter le crédit auto de 15 000 à 25 000 € quand on débute. Une petite voiture fiable, payée comptant ou avec un petit crédit court, suffit largement pour commencer.',
    pourquoi: 'Un crédit de 20 000 € sur 5 ans, c’est environ 390 € par mois pendant 60 mois. Mais la voiture coûte bien plus que sa mensualité : l’assurance d’un jeune conducteur est souvent chère, s’ajoutent le carburant, l’entretien, les pneus, les réparations, le stationnement. Au total, la voiture peut avaler un tiers du salaire. Au moindre imprévu, il n’y a plus de marge : découvert, crédit renouvelable… l’engrenage.',
    piege: 'Cette mensualité compte aussi dans le taux d’endettement : tant que le crédit court, la banque prête beaucoup moins pour un achat immobilier. Une voiture neuve à crédit peut retarder de plusieurs années l’achat d’un logement — et elle perd une grande partie de sa valeur dès les premières années.',
    alternative: 'Une petite occasion fiable, avec une réserve de côté pour les réparations, puis épargner chaque mois la différence : c’est un futur apport immobilier qui se construit.',
    verifier: 'Le coût total du crédit (TAEG), le devis d’assurance avant d’acheter, le contrôle technique et l’historique d’entretien d’une occasion.', outil: true },
  { id: 'payer-soi', e: '💸', t: 'Se payer en premier',
    reflexe: 'Le jour de la paie, un virement automatique vers l’épargne — même 30 ou 50 €.',
    pourquoi: 'Ce qu’on épargne « à la fin du mois » n’existe presque jamais. Un virement automatique transforme l’épargne en habitude, sans effort de volonté.',
    piege: 'Attendre de « gagner plus » pour commencer : les habitudes prises au premier salaire restent.',
    alternative: 'Commencer petit et augmenter à chaque hausse de salaire.', verifier: 'Que le virement tombe bien juste après la paie, pas avant.' },
  { id: 'precaution-jeune', e: '☂️', t: 'L’épargne de précaution avant tout « investissement »',
    reflexe: 'Avant la crypto, le trading ou la Bourse : un matelas de sécurité sur un livret.',
    pourquoi: 'Les 18–25 ans sont la cible numéro un des publicités de trading, des « formations » d’influenceurs et des arnaques à la crypto. Sans matelas, la moindre perte ou le moindre imprévu fait mal.',
    piege: 'Placer son seul argent disponible sur un actif qui peut perdre la moitié de sa valeur en quelques semaines.',
    alternative: 'D’abord le livret (Livret A, LEP si éligible, livret jeune), ensuite seulement le long terme — avec de l’argent dont on n’a pas besoin.', verifier: 'L’espace Anti-arnaques avant toute plateforme.' },
  { id: 'fractionne', e: '🧾', t: 'Méfiance envers le « payer en 3 ou 4 fois » et le crédit renouvelable',
    reflexe: 'Payer en plusieurs fois reste un crédit. Ne pas en cumuler.',
    pourquoi: 'Chaque petit paiement fractionné paraît indolore ; cumulés, ils grignotent le budget des mois suivants. Le crédit renouvelable a souvent un coût élevé et se reconstitue au fil des remboursements.',
    piege: 'Trois achats en 4 fois en même temps, et le mois suivant le budget est déjà dépensé.',
    alternative: 'Si on ne peut pas payer comptant un achat non indispensable, attendre et épargner pour lui.', verifier: 'Le coût total et les frais en cas de retard.' },
  { id: 'logement-jeune', e: '🏠', t: 'Le premier logement',
    reflexe: 'Viser un loyer charges comprises autour d’un tiers des revenus au maximum (c’est aussi ce que regardent la plupart des bailleurs).',
    pourquoi: 'Au-delà, il reste trop peu pour vivre, épargner et faire face aux imprévus.',
    piege: 'Oublier les frais d’entrée : dépôt de garantie, frais d’agence, assurance habitation (obligatoire pour un locataire), ouverture des compteurs, premiers meubles.',
    alternative: 'La garantie Visale (Action Logement) peut servir de caution gratuite pour les 18–30 ans ; les aides au logement se simulent sur le site de la CAF.', verifier: 'Les conditions de Visale et des aides au logement sur les sites officiels.' },
  { id: 'impots-jeune', e: '🧾', t: 'Les impôts quand on débute',
    reflexe: 'Faire sa première déclaration en ligne, même avec de petits revenus.',
    pourquoi: 'Un étudiant peut, selon les cas, rester rattaché au foyer fiscal de ses parents (jusqu’à 21 ans, ou 25 ans s’il fait des études) ou déclarer seul : le choix change l’impôt de la famille. Certains salaires d’étudiants et d’apprentis de moins de 26 ans sont exonérés dans une limite.',
    piege: 'Ne pas déclarer : l’avis d’imposition (même à zéro) est souvent demandé pour un logement, une aide ou un LEP.',
    alternative: 'Comparer les deux options (rattachement ou déclaration seule) avec le simulateur d’impots.gouv.fr.', verifier: 'Les limites d’exonération en vigueur sur impots.gouv.fr.' }
] },
{ id: 'installer', e: '🏡', nom: '25–35 ans : s’installer', sous: 'Couple, logement, projets : préparer le terrain pour emprunter dans de bonnes conditions.', conseils: [
  { id: 'avant-pret', e: '🏦', t: 'Les 6 mois avant de demander un prêt immobilier',
    reflexe: 'Des comptes propres : pas de découvert, une épargne régulière, pas de nouveaux crédits.',
    pourquoi: 'La banque lit les derniers relevés de compte. Elle regarde le taux d’endettement (35 % maximum en principe, assurance comprise), le reste à vivre, la stabilité de l’emploi, l’apport (qui couvre souvent au moins les frais de notaire, de l’ordre de 7 à 8 % du prix dans l’ancien) et la capacité à épargner.',
    piege: 'Prendre un crédit auto ou un crédit conso juste avant : chaque mensualité réduit d’autant la capacité d’emprunt.',
    alternative: 'Rembourser ou solder les petits crédits avant le projet, et montrer une épargne mensuelle régulière.', verifier: 'Les critères du HCSF et le simulateur de capacité de votre banque.', outil: true },
  { id: 'couple', e: '💑', t: 'L’argent dans le couple',
    reflexe: 'Se parler d’argent tôt : revenus, dettes, projets, habitudes.',
    pourquoi: 'Beaucoup de couples choisissent un compte commun pour les dépenses partagées, alimenté au prorata des revenus, et gardent chacun un compte personnel.',
    piege: 'En union libre, le partenaire n’hérite pas automatiquement ; mariage et PACS changent la fiscalité (déclaration commune) et la protection.',
    alternative: 'Pour un achat à deux, prévoir la répartition chez le notaire ; désigner son partenaire comme bénéficiaire d’une assurance-vie si on le souhaite.', verifier: 'Les règles du régime choisi auprès d’un notaire.' },
  { id: 'louer-acheter', e: '⚖️', t: 'Louer ou acheter ?',
    reflexe: 'Il n’y a pas de bonne réponse universelle : tout dépend de la durée pendant laquelle on compte rester.',
    pourquoi: 'Acheter entraîne des frais importants (notaire, garantie, frais de dossier) qu’il faut plusieurs années pour amortir. Revendre trop tôt peut coûter cher.',
    piege: 'Acheter sous la pression (« louer, c’est jeter l’argent par les fenêtres ») sans projet de durée.',
    alternative: 'Comparer le coût total sur 5, 10 et 15 ans, avec un simulateur, en incluant charges, taxe foncière et travaux.', verifier: 'Les frais d’acquisition et la taxe foncière du bien visé.' },
  { id: 'assurance-pret', e: '🛡️', t: 'L’assurance emprunteur se change',
    reflexe: 'Comparer l’assurance du prêt : elle peut représenter une part importante du coût total.',
    pourquoi: 'Depuis 2022 (loi Lemoine), on peut changer d’assurance emprunteur à tout moment, à garanties équivalentes.',
    piege: 'Accepter l’assurance de la banque sans comparer.',
    alternative: 'Demander des devis à garanties équivalentes et faire la demande de substitution.', verifier: 'Les garanties exigées par la banque.' },
  { id: 'changement-pro', e: '🔄', t: 'Changement de travail ou de revenus',
    reflexe: 'Actualiser son taux de prélèvement à la source sur impots.gouv.fr.',
    pourquoi: 'Le taux appliqué repose sur les revenus des années passées : sans mise à jour, on paie trop (ou pas assez) pendant des mois.',
    piege: 'Une grosse régularisation à payer l’été suivant.',
    alternative: 'Mettre à jour dès le changement, et garder de côté une petite somme si le revenu augmente.', verifier: 'Le taux dans « Gérer mon prélèvement à la source ».' }
] },
{ id: 'famille', e: '👨‍👩‍👧', nom: 'Famille & enfants', sous: 'Un enfant change le budget, les impôts et les protections à prévoir.', conseils: [
  { id: 'naissance', e: '🍼', t: 'Une naissance : trois réflexes administratifs',
    reflexe: 'Déclarer la naissance pour le prélèvement à la source, vérifier ses droits CAF, adapter son budget.',
    pourquoi: 'Un enfant ajoute des parts au quotient familial : signaler la naissance fait baisser le taux de prélèvement tout de suite.',
    piege: 'Attendre la déclaration de l’année suivante pour en bénéficier.',
    alternative: 'Faire la démarche en ligne dans les 60 jours.', verifier: 'Les prestations sur caf.fr.' },
  { id: 'garde', e: '🧸', t: 'Les frais de garde réduisent l’impôt',
    reflexe: 'Garder les justificatifs de crèche, d’assistante maternelle ou de garde à domicile.',
    pourquoi: 'Les frais de garde hors du domicile d’un enfant de moins de 6 ans ouvrent droit à un crédit d’impôt de 50 % dans la limite d’un plafond ; l’emploi à domicile aussi (dans d’autres limites).',
    piege: 'Oublier de les déclarer : le crédit est remboursé même si l’on ne paie pas d’impôt.',
    alternative: 'Vérifier les cases correspondantes à chaque déclaration.', verifier: 'Les plafonds en vigueur sur impots.gouv.fr.' },
  { id: 'proteger', e: '☂️', t: 'Protéger sa famille',
    reflexe: 'Avec des enfants et un crédit, vérifier qu’on est couvert en cas de décès ou d’invalidité.',
    pourquoi: 'L’assurance emprunteur protège le prêt ; une prévoyance (parfois proposée par l’employeur) protège le revenu de la famille.',
    piege: 'Découvrir après coup qu’aucune protection n’existait.',
    alternative: 'Faire le point sur les garanties déjà en place (employeur, assurance du prêt) avant d’en souscrire d’autres.', verifier: 'Les contrats de prévoyance de l’employeur.' },
  { id: 'argent-enfants', e: '🐷', t: 'Apprendre l’argent aux enfants',
    reflexe: 'Un peu d’argent de poche régulier, et le laisser faire ses propres choix.',
    pourquoi: 'C’est en gérant de petites sommes qu’on apprend à attendre, comparer et épargner.',
    piege: 'Tout payer à leur place jusqu’à 18 ans, puis les lâcher avec une carte bancaire.',
    alternative: 'Un livret à leur nom, alimenté un peu chaque mois, qu’ils voient grandir.', verifier: 'Les fiches « Épargner pour ses enfants » du guide de l’épargne.' }
] },
{ id: 'consolider', e: '🧱', nom: '35–55 ans : consolider', sous: 'Rembourser, diversifier, préparer la retraite et aider ses proches.', conseils: [
  { id: 'retraite-tot', e: '🌅', t: 'Regarder sa retraite bien avant 60 ans',
    reflexe: 'Consulter son relevé de carrière sur info-retraite.fr et corriger les trous.',
    pourquoi: 'Des périodes oubliées (jobs, chômage, étranger) peuvent manquer ; les corriger tôt est bien plus facile qu’à la veille du départ.',
    piege: 'Découvrir à 62 ans une pension plus basse que prévu, sans temps pour s’y préparer.',
    alternative: 'Estimer sa future pension, puis décider s’il faut épargner en plus (assurance-vie, PER…).', verifier: 'Le simulateur officiel « Mon compte retraite ».' },
  { id: 'concentration', e: '🧺', t: 'Ne pas tout mettre au même endroit',
    reflexe: 'Éviter de concentrer tout son patrimoine sur un seul bien, un seul placement ou les actions de son employeur.',
    pourquoi: 'Si ce seul pilier vacille, tout vacille en même temps — surtout si c’est aussi la source de son salaire.',
    piege: 'Tout investir dans l’immobilier locatif à crédit, sans épargne disponible.',
    alternative: 'Répartir entre épargne disponible, projets et long terme (voir la pyramide du guide de l’épargne).', verifier: 'La leçon « Diversifier ».' },
  { id: 'aider-enfants', e: '💝', t: 'Aider ses enfants de son vivant',
    reflexe: 'Connaître les abattements avant de donner.',
    pourquoi: 'Chaque parent peut donner jusqu’à 100 000 € par enfant tous les 15 ans sans droits, et un don familial de sommes d’argent est possible en plus dans certaines conditions.',
    piege: 'Donner sans déclarer le don, ou se démunir de ce dont on aura besoin pour sa propre retraite.',
    alternative: 'Déclarer le don en ligne ; passer par un notaire pour les montants importants.', verifier: 'Les règles à jour sur service-public.fr.' },
  { id: 'revue', e: '🔍', t: 'La revue annuelle de ses contrats',
    reflexe: 'Une fois par an : assurances, abonnements, frais bancaires, forfait téléphone, énergie.',
    pourquoi: 'Les petits montants mensuels oubliés coûtent souvent des centaines d’euros par an.',
    piege: 'Payer deux assurances pour la même chose (assurance carte bancaire, assurance téléphone…).',
    alternative: 'Résilier ce qui ne sert plus ; la résiliation est simplifiée pour beaucoup de contrats.', verifier: 'Les conditions de résiliation de chaque contrat.' }
] },
{ id: 'impots', e: '🧾', nom: 'Impôts : les bons réflexes', sous: 'Le cours explique le système ; ici, les gestes concrets de chaque année.', conseils: [
  { id: 'declarer', e: '🗓️', t: 'Déclarer chaque printemps, même prérempli',
    reflexe: 'Relire chaque ligne de la déclaration préremplie avant de valider.',
    pourquoi: 'Des revenus peuvent manquer ou être faux, et les déductions, réductions et crédits ne sont pas préremplis.',
    piege: 'Valider en un clic et oublier ses dons, frais de garde ou emploi à domicile.',
    alternative: 'Garder une pochette (papier ou numérique) avec les justificatifs de l’année.', verifier: 'Les dates limites de votre département sur impots.gouv.fr.' },
  { id: 'frais-reels', e: '🚗', t: 'Frais réels ou abattement de 10 % ?',
    reflexe: 'Si on a de longs trajets domicile-travail, comparer les deux options.',
    pourquoi: 'L’abattement de 10 % est automatique ; les frais réels (kilomètres, repas…) peuvent être plus avantageux, sur justificatifs.',
    piege: 'Choisir les frais réels sans pouvoir les justifier.',
    alternative: 'Faire le calcul avec le barème kilométrique officiel.', verifier: 'Le barème kilométrique sur impots.gouv.fr.' },
  { id: 'justificatifs', e: '📁', t: 'Garder ses justificatifs',
    reflexe: 'Conserver les justificatifs de déclaration au moins 3 ans.',
    pourquoi: 'L’administration peut en principe contrôler les déclarations des 3 dernières années.',
    piege: 'Jeter un reçu de don ou une attestation de garde avant la fin de ce délai.',
    alternative: 'Les ranger par année ; NaoDoc peut aider à les classer.', verifier: 'Les délais sur service-public.fr.' },
  { id: 'faux-remboursement', e: '🚨', t: 'Les faux remboursements d’impôt',
    reflexe: 'Ne jamais donner sa carte bancaire pour « recevoir un remboursement ».',
    pourquoi: 'L’administration rembourse par virement sur le compte connu ; elle ne demande jamais de numéro de carte par SMS ou e-mail.',
    piege: 'Cliquer sur un lien qui imite impots.gouv.fr.',
    alternative: 'Taper soi-même l’adresse impots.gouv.fr et vérifier dans son espace.', verifier: 'L’espace Anti-arnaques.' }
] },
{ id: 'coups-durs', e: '🌦️', nom: 'Coups durs & changements', sous: 'Quand ça va moins bien : agir tôt, demander de l’aide, ne pas rester seul.', conseils: [
  { id: 'emploi', e: '📉', t: 'Perte d’emploi',
    reflexe: 'S’inscrire rapidement à France Travail, refaire son budget, prévenir ses créanciers tôt.',
    pourquoi: 'Plus on prévient tôt (banque, bailleur), plus il est facile de trouver un arrangement. Certaines assurances de prêt couvrent la perte d’emploi.',
    piege: 'Utiliser le crédit renouvelable pour « tenir » : la dette grossit vite.',
    alternative: 'Actualiser son taux de prélèvement à la source, vérifier les garanties de ses assurances.', verifier: 'Vos droits sur francetravail.fr.' },
  { id: 'surendettement', e: '🆘', t: 'Quand les dettes deviennent trop lourdes',
    reflexe: 'La commission de surendettement de la Banque de France existe, et la démarche est gratuite.',
    pourquoi: 'Elle peut proposer un plan d’étalement, voire un effacement partiel, et suspendre certaines procédures.',
    piege: 'Prendre un « rachat de crédits » ou un nouveau crédit pour rembourser les anciens sans regarder le coût total.',
    alternative: 'Se faire accompagner gratuitement par un Point conseil budget (PCB).', verifier: 'banque-france.fr et le service des Points conseil budget.' },
  { id: 'separation', e: '💔', t: 'Séparation',
    reflexe: 'Faire le point sur les comptes joints et les crédits communs.',
    pourquoi: 'Sur un compte joint ou un crédit signé à deux, chacun peut rester responsable de la totalité des dettes, même après la séparation.',
    piege: 'Laisser un compte joint ouvert « en attendant ».',
    alternative: 'Désolidariser ou clôturer le compte joint, actualiser sa situation pour les impôts.', verifier: 'Les démarches sur service-public.fr.' },
  { id: 'decouvert-chronique', e: '🕳️', t: 'Découvert tous les mois',
    reflexe: 'En parler à sa banque : une offre pour la clientèle fragile financièrement plafonne les frais d’incidents.',
    pourquoi: 'Les frais de découvert et d’incidents s’accumulent et entretiennent le découvert.',
    piege: 'Payer des agios chaque mois sans rien changer.',
    alternative: 'Décaler les dates de prélèvement après la paie, construire une petite réserve.', verifier: 'Les conditions de l’offre clientèle fragile auprès de votre banque.' }
] }
];
const tousConseils = () => THEMES_CONSEILS.flatMap(th => th.conseils.map(c => Object.assign({ theme: th }, c)));

/* ============================================================
   L'atelier : le vrai coût d'une voiture, et son effet sur un futur prêt immobilier
   ============================================================ */
const VOITURE_DEFAUT = {
  revenu: 1700, km: 12000, carbu: 1.8, tauxImmo: 3.6, dureeImmo: 25,
  a: { nom: 'Voiture récente à crédit', prix: 20000, apport: 0, duree: 60, taeg: 6.5, assurance: 110, conso: 6.5, entretien: 500 },
  b: { nom: 'Petite occasion payée comptant', prix: 5000, apport: 5000, duree: 0, taeg: 0, assurance: 55, conso: 6, entretien: 1000 }
};
function mensualite(capital, tauxAn, mois) {
  if (capital <= 0 || mois <= 0) return 0;
  const t = tauxAn / 100 / 12;
  return t ? capital * t / (1 - Math.pow(1 + t, -mois)) : capital / mois;
}
function capitalEmpruntable(mens, tauxAn, annees) {
  if (mens <= 0) return 0;
  const t = tauxAn / 100 / 12, n = annees * 12;
  return t ? mens * (1 - Math.pow(1 + t, -n)) / t : mens * n;
}
function calculVoiture(V, s) {
  const credit = Math.max(0, s.prix - s.apport), m = mensualite(credit, s.taeg, s.duree);
  const carbu = V.km / 12 * s.conso / 100 * V.carbu, entretien = s.entretien / 12;
  const total = m + s.assurance + carbu + entretien;
  const coutCredit = m * s.duree - credit;
  const maxMens = V.revenu * .35, immo = capitalEmpruntable(Math.max(0, maxMens - m), V.tauxImmo, V.dureeImmo);
  return { credit, m, carbu, entretien, total, coutCredit, part: total / V.revenu * 100, immo, reste: V.revenu - total };
}
function vueAtelierVoiture() {
  const V = U.voiture || (U.voiture = JSON.parse(JSON.stringify(VOITURE_DEFAUT)));
  const champ = (cle, lib, u, pas = 1, sc) => `<label class="mini-champ"><span>${lib}</span><span class="ent"><input type="number" min="0" step="${pas}" data-voiture="${sc ? sc + '.' : ''}${cle}" value="${sc ? V[sc][cle] : V[cle]}"><em>${u}</em></span></label>`;
  const colonne = sc => `<div class="scenario-v sc-${sc}"><input class="nom-sc" data-voiture="${sc}.nom" value="${esc(V[sc].nom)}" aria-label="Nom du scénario">
      ${champ('prix', 'Prix', '€', 500, sc)}${champ('apport', 'Payé comptant', '€', 500, sc)}${champ('duree', 'Durée du crédit', 'mois', 6, sc)}${champ('taeg', 'TAEG', '%', .1, sc)}
      ${champ('assurance', 'Assurance auto', '€/mois', 5, sc)}${champ('conso', 'Consommation', 'L/100', .1, sc)}${champ('entretien', 'Entretien, pneus, réparations', '€/an', 50, sc)}</div>`;
  return `<section class="bloc atelier-voiture" id="atelierVoiture"><h3 class="bloc-titre">🚗 L’atelier : le vrai coût d’une voiture… et son effet sur un futur achat immobilier</h3>
    <p class="petit-texte" style="margin:-6px 0 12px">Comparez deux choix. Toutes les valeurs sont des hypothèses modifiables : remplacez-les par vos propres devis.</p>
    <div class="carte">
      <div class="communs">${champ('revenu', 'Revenu net mensuel', '€', 50)}${champ('km', 'Kilomètres par an', 'km', 500)}${champ('carbu', 'Prix du carburant', '€/L', .01)}${champ('tauxImmo', 'Taux d’un futur prêt immobilier', '%', .1)}${champ('dureeImmo', 'Sur', 'ans', 1)}</div>
      <div class="deux-sc">${colonne('a')}${colonne('b')}</div>
    </div>
    <div class="carte" id="resVoiture" aria-live="polite" style="margin-top:14px">${resultatVoiture()}</div>
  </section>`;
}
function resultatVoiture() {
  const V = U.voiture, A = calculVoiture(V, V.a), B = calculVoiture(V, V.b);
  const ligne = (lib, fa, fb, fmt = x => `${nb(Math.round(x))} €`) => `<tr><td>${lib}</td><td>${fmt(fa)}</td><td>${fmt(fb)}</td></tr>`;
  const ecartImmo = B.immo - A.immo, ecartMois = A.total - B.total;
  return `<h3><span class="e">🔍</span>Le résultat</h3>
    <div class="tableau-defile"><table class="tableau compare-v"><thead><tr><th></th><th>${esc(V.a.nom)}</th><th>${esc(V.b.nom)}</th></tr></thead><tbody>
      ${ligne('Mensualité de crédit', A.m, B.m)}
      ${ligne('Assurance auto', V.a.assurance, V.b.assurance)}
      ${ligne('Carburant', A.carbu, B.carbu)}
      ${ligne('Entretien et réparations (par mois)', A.entretien, B.entretien)}
      <tr class="total"><td><b>Coût réel par mois</b></td><td><b>${nb(Math.round(A.total))} €</b></td><td><b>${nb(Math.round(B.total))} €</b></td></tr>
      ${ligne('Part du revenu', A.part, B.part, x => `${nb(x, 0)} %`)}
      ${ligne('Reste pour tout le reste du mois', A.reste, B.reste)}
      ${ligne('Coût total des intérêts du crédit', A.coutCredit, B.coutCredit)}
      <tr class="total"><td><b>Capacité d’emprunt immobilier estimée pendant le crédit auto</b></td><td><b>${nb(Math.round(A.immo / 1000))} k€</b></td><td><b>${nb(Math.round(B.immo / 1000))} k€</b></td></tr>
    </tbody></table></div>
    ${ecartImmo > 1000 ? `<div class="note risque" style="margin:14px 0 0"><span class="e">🏠</span><div>Tant que dure le crédit de « ${esc(V.a.nom)} », la capacité d’emprunt pour un logement baisse d’environ <b>${nb(Math.round(ecartImmo / 1000))} 000 €</b>, et chaque mois coûte <b>${nb(Math.round(ecartMois))} €</b> de plus. Épargner cette différence pendant ${Math.max(1, V.a.duree)} mois, c’est environ <b>${nb(Math.round(ecartMois * Math.max(1, V.a.duree) / 100) * 100)} €</b> d’apport.</div></div>` : ''}
    ${A.part > 30 || B.part > 30 ? '<div class="note douce"><span class="e">⚠️</span><div>Au-delà d’environ 25–30 % du revenu, la voiture laisse très peu de marge pour les imprévus.</div></div>' : ''}
    <p class="petit-texte">Calcul simplifié : capacité d’emprunt avec un taux d’endettement de 35 % maximum (sans assurance emprunteur ni autres crédits), sans tenir compte de la revente du véhicule. Une banque fera son propre calcul.</p>`;
}
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.voiture; if (!k || !U.voiture) return;
  const [a, b] = k.split('.'), v = e.target.type === 'number' ? (+e.target.value || 0) : e.target.value;
  if (b) U.voiture[a][b] = v; else U.voiture[a] = v;
  const r = $('#resVoiture'); if (r) r.innerHTML = resultatVoiture();
});

/* ============================================================
   L'écran
   ============================================================ */
function vueConseils() {
  const lus = S.conseilsLus || {}, total = tousConseils().length, n = Object.keys(lus).length;
  const th = U.themeC || '';
  const themes = THEMES_CONSEILS.filter(t => !th || t.id === th);
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>💡 Conseils de vie</h2><div class="droite"><span class="badge">${n}/${total} conseils lus</span></div></div>
    <p class="chapo">Des repères concrets, par âge et par situation : les bons réflexes d’argent au quotidien, les pièges classiques, et surtout <b>pourquoi</b>. On ne vous dit pas quoi acheter : on vous aide à éviter de vous mettre en difficulté pour rien.</p>
    <div class="note douce"><span class="e">🧭</span><div>Ce sont des <b>repères généraux</b>, à adapter à votre situation. Pour une décision importante (crédit, achat immobilier, placement), comparez plusieurs sources officielles et demandez l’avis d’un professionnel compétent.</div></div>
    <div class="puces" style="margin-bottom:16px"><button type="button" class="puce ${!th ? 'actif' : ''}" data-theme-c="">Tous</button>${THEMES_CONSEILS.map(t => `<button type="button" class="puce ${th === t.id ? 'actif' : ''}" data-theme-c="${t.id}">${t.e} ${esc(t.nom.split(' : ')[0])}</button>`).join('')}</div>
    ${themes.map(t => `<section class="bloc"><h3 class="bloc-titre">${t.e} ${esc(t.nom)}</h3><p class="petit-texte" style="margin:-6px 0 12px">${esc(t.sous)}</p>
      <div class="conseils">${t.conseils.map(c => `<article class="conseil ${lus[t.id + '/' + c.id] ? 'lu' : ''}" id="c-${t.id}-${c.id}">
        <header><span class="e">${c.e}</span><h4>${esc(c.t)}</h4></header>
        <p class="reflexe"><b>Le réflexe :</b> ${esc(c.reflexe)}</p>
        <details><summary>Pourquoi, le piège, et quoi faire à la place</summary>
          <p><b>Pourquoi ?</b> ${esc(c.pourquoi)}</p>
          <p class="piege"><b>⚠️ Le piège :</b> ${esc(c.piege)}</p>
          <p class="alt"><b>✅ À la place :</b> ${esc(c.alternative)}</p>
          <p class="verif"><b>🔍 À vérifier :</b> ${esc(c.verifier)}</p>
        </details>
        <footer>${c.outil ? '<button type="button" class="btn petit" data-act="atelier-voiture">🚗 Faire le calcul</button>' : ''}
          <button type="button" class="btn petit ${lus[t.id + '/' + c.id] ? '' : 'fin'}" data-conseil-lu="${t.id}/${c.id}">${lus[t.id + '/' + c.id] ? '✓ Compris' : 'J’ai compris'}</button></footer>
      </article>`).join('')}</div>
      ${t.id === 'jeunes' ? vueAtelierVoiture() : ''}</section>`).join('')}
    `;
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-conseil-lu],[data-theme-c]'); if (!t) return;
  if (t.dataset.conseilLu) {
    S.conseilsLus = S.conseilsLus || {};
    if (S.conseilsLus[t.dataset.conseilLu]) delete S.conseilsLus[t.dataset.conseilLu]; else S.conseilsLus[t.dataset.conseilLu] = auj();
    sauver(); const y = scrollY; rendre(); scrollTo(0, y); return;
  }
  if (t.dataset.themeC !== undefined) { U.themeC = t.dataset.themeC; rendre(); }
});
