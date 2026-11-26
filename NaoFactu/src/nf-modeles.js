/* ============================================================
   NaoFactu — les contenus de référence : modèles de contrat
   (article par article), bibliothèque de clauses, grille de
   cotisations indicative pour les bulletins de paie.
   Tous ces textes sont des bases de travail, modifiables.
   ============================================================ */
'use strict';

/* ---------- Montants en toutes lettres (contrats, bulletins) ---------- */
function nombreEnLettres(n) {
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const D = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  function cent(x) { // 0..999
    let s = '';
    const c = Math.floor(x / 100), r = x % 100;
    if (c) s = (c > 1 ? U[c] + ' cent' + (r === 0 ? 's' : '') : 'cent');
    if (r) {
      let t;
      if (r < 20) t = U[r];
      else {
        const d = Math.floor(r / 10), u = r % 10;
        if (d === 7 || d === 9) t = D[d] + (d === 7 && u === 1 ? ' et ' : '-') + U[10 + u];
        else t = D[d] + (u === 1 && d !== 8 ? ' et un' : u ? '-' + U[u] : (d === 8 ? 's' : ''));
      }
      s += (s ? ' ' : '') + t;
    }
    return s;
  }
  function entier(x) {
    if (x === 0) return 'zéro';
    const parts = [[1e9, 'milliard'], [1e6, 'million'], [1e3, 'mille']];
    let s = '', reste = x;
    for (const [v, nom] of parts) {
      const q = Math.floor(reste / v);
      if (q) {
        if (nom === 'mille') s += (q === 1 ? 'mille' : cent(q).replace(/cents$/, 'cent') + ' mille') + ' ';
        else s += cent(q) + ' ' + nom + (q > 1 ? 's' : '') + ' ';
        reste %= v;
      }
    }
    if (reste) s += cent(reste);
    return s.trim();
  }
  const v = Math.round(Math.abs(Number(n) || 0) * 100), e = Math.floor(v / 100), c = v % 100;
  let s = entier(e) + (e >= 1e6 && e % 1e6 === 0 ? ' d\'euros' : ' euro' + (e > 1 ? 's' : ''));
  if (c) s += ' et ' + entier(c) + ' centime' + (c > 1 ? 's' : '');
  return s;
}

/* ---------- Rôles des parties selon le type de contrat ---------- */
const ROLES_CONTRAT = {
  prestation: ['le Prestataire', 'le Client'], fournisseur: ['le Client', 'le Fournisseur'], cdi: ["l'Employeur", 'le Salarié'],
  cdd: ["l'Employeur", 'le Salarié'], freelance: ["le Donneur d'ordre", 'le Sous-traitant'], stage: ["l'Organisme d'accueil", 'le Stagiaire'],
  alternance: ["l'Employeur", "l'Alternant"], bail: ['le Bailleur', 'le Preneur'], nda: ['la Partie émettrice', 'la Partie réceptrice'], autre: ['la Partie A', 'la Partie B']
};
const TITRES_CONTRAT = {
  prestation: 'Contrat de prestation de services', fournisseur: "Contrat d'approvisionnement", cdi: 'Contrat de travail à durée indéterminée',
  cdd: 'Contrat de travail à durée déterminée', freelance: 'Contrat de sous-traitance', stage: 'Convention de stage', alternance: "Contrat d'apprentissage",
  bail: 'Contrat de location', nda: 'Accord de confidentialité', autre: 'Contrat'
};

/* ---------- Bibliothèque de clauses (à insérer dans n'importe quel contrat) ---------- */
const CLAUSES = [
  { id: 'confidentialite', titre: 'Confidentialité', texte: "Chacune des parties s'engage à garder strictement confidentielles les informations, documents et données de toute nature qui lui sont communiqués par l'autre partie à l'occasion de l'exécution du présent contrat, et à ne les utiliser que pour les besoins de celui-ci.\n\nCette obligation ne s'applique pas aux informations tombées dans le domaine public sans faute de la partie qui les a reçues, ni à celles dont la communication est exigée par la loi ou par une autorité judiciaire ou administrative.\n\nElle demeure en vigueur pendant toute la durée du contrat et pendant {duree_conf} après sa cessation, quelle qu'en soit la cause." },
  { id: 'pi', titre: 'Propriété intellectuelle', texte: "Sous réserve du paiement intégral du prix, {P} cède à {C}, à titre exclusif, les droits patrimoniaux d'auteur sur les livrables réalisés dans le cadre du présent contrat, à savoir les droits de reproduction, de représentation et d'adaptation, pour les usages suivants : {usages}, pour le territoire suivant : {territoire}, et pour une durée de {duree_cession}.\n\n{P_maj} conserve la propriété de ses outils, méthodes, savoir-faire et éléments préexistants, dont il concède à {C} un droit d'utilisation non exclusif dans la seule mesure nécessaire à l'exploitation des livrables.\n\nSauf opposition écrite de {C}, {P} pourra mentionner la réalisation à titre de référence commerciale." },
  { id: 'responsabilite', titre: 'Responsabilité et assurance', texte: "La responsabilité de chacune des parties ne pourra être engagée qu'en cas de faute prouvée, pour les seuls dommages directs et prévisibles. En tout état de cause, et sauf faute lourde ou dolosive, la responsabilité totale de {P} au titre du présent contrat est limitée au montant effectivement perçu au titre de celui-ci.\n\nChaque partie déclare être titulaire d'une police d'assurance couvrant sa responsabilité civile professionnelle, et s'engage à la maintenir pendant toute la durée du contrat." },
  { id: 'forcemajeure', titre: 'Force majeure', texte: "Aucune des parties ne pourra être tenue responsable de l'inexécution ou du retard dans l'exécution de ses obligations résultant d'un cas de force majeure au sens de l'article 1218 du Code civil.\n\nLa partie qui invoque la force majeure en informe l'autre sans délai. Si l'empêchement se prolonge au-delà de trente (30) jours, chacune des parties pourra résilier le contrat par lettre recommandée avec accusé de réception, sans indemnité de part ni d'autre." },
  { id: 'rgpd', titre: 'Protection des données personnelles', texte: "Chacune des parties s'engage à respecter la réglementation applicable en matière de protection des données personnelles, notamment le Règlement (UE) 2016/679 (RGPD) et la loi n° 78-17 du 6 janvier 1978 modifiée.\n\nLes données personnelles échangées dans le cadre du présent contrat ne sont traitées que pour les besoins de son exécution, sont conservées pour la durée strictement nécessaire, et ne sont communiquées à aucun tiers non autorisé. Les personnes concernées disposent d'un droit d'accès, de rectification, d'effacement et d'opposition qu'elles peuvent exercer auprès de la partie responsable du traitement." },
  { id: 'nonsollicitation', titre: 'Non-sollicitation', texte: "Pendant toute la durée du contrat et pendant douze (12) mois après sa cessation, chacune des parties s'interdit de solliciter, directement ou indirectement, en vue de l'engager ou de le faire travailler, tout salarié ou collaborateur de l'autre partie ayant participé à l'exécution du présent contrat, sauf accord écrit préalable de celle-ci." },
  { id: 'independance', titre: 'Indépendance des parties', texte: "Les parties agissent en toute indépendance. Le présent contrat ne crée entre elles aucun lien de subordination, ni société, ni mandat. Chaque partie demeure seule responsable de ses actes, de son personnel et de ses obligations sociales et fiscales." },
  { id: 'soustraitance', titre: 'Sous-traitance et cession', texte: "Le présent contrat est conclu en considération de la personne de {P}. Il ne pourra être cédé, ni son exécution sous-traitée, en tout ou partie, sans l'accord écrit préalable de {C}." },
  { id: 'exclusivite', titre: 'Exclusivité', texte: "Pendant la durée du contrat, {P} s'engage à ne pas réaliser de prestations identiques pour le compte d'un concurrent direct de {C} dans le périmètre suivant : {perimetre_exclu}." },
  { id: 'nonconcurrence', titre: 'Non-concurrence', texte: "À la cessation du contrat, quelle qu'en soit la cause, {B} s'interdit d'exercer, directement ou indirectement, une activité concurrente de celle de {A}, pendant une durée de {nc_duree}, sur le territoire suivant : {nc_territoire}.\n\nEn contrepartie, {B} percevra, pendant toute la durée de l'interdiction, une indemnité mensuelle égale à {nc_contrepartie} de sa rémunération mensuelle moyenne des douze derniers mois.\n\n{A_maj} pourra renoncer à l'application de la présente clause dans les conditions prévues par la convention collective ou, à défaut, dans un délai de quinze (15) jours suivant la notification de la rupture.", note: "Pour être valable, une clause de non-concurrence doit être limitée dans le temps et l'espace, justifiée par les intérêts de l'entreprise et assortie d'une contrepartie financière. À faire valider." },
  { id: 'teletravail', titre: 'Télétravail', texte: "{B_maj} pourra exercer tout ou partie de ses fonctions en télétravail, à raison de {tt_jours} par semaine, selon les modalités définies par accord entre les parties ou par la charte de télétravail de l'entreprise. Le télétravail est réversible à la demande de chacune des parties, moyennant un délai de prévenance raisonnable." },
  { id: 'mobilite', titre: 'Mobilité', texte: "Compte tenu de la nature de ses fonctions, {B} accepte par avance que son lieu de travail puisse être modifié à l'intérieur de la zone géographique suivante : {zone_mobilite}. Toute mutation sera notifiée en respectant un délai de prévenance raisonnable." },
  { id: 'integralite', titre: 'Intégralité et modifications', texte: "Le présent contrat, y compris ses annexes, exprime l'intégralité de l'accord des parties. Il annule et remplace tout accord antérieur ayant le même objet. Toute modification ne pourra résulter que d'un avenant écrit signé par les deux parties.\n\nSi l'une des stipulations du contrat était déclarée nulle, les autres stipulations conserveraient leur plein effet." },
  { id: 'signature', titre: 'Signature électronique', texte: "Les parties conviennent que le présent contrat peut être signé par voie électronique, conformément aux articles 1366 et 1367 du Code civil, et reconnaissent à cette signature la même valeur qu'une signature manuscrite." },
  { id: 'droit', titre: 'Droit applicable et règlement des litiges', texte: "Le présent contrat est soumis au droit français.\n\nEn cas de différend relatif à sa formation, son interprétation ou son exécution, les parties s'efforceront de le résoudre à l'amiable. À défaut d'accord dans un délai de trente (30) jours, le litige sera porté devant {juridiction}." }
];
const clause = id => { const c = CLAUSES.find(x => x.id === id); return { titre: c.titre, texte: c.texte }; };

/* ---------- Modèles de contrat : une suite d'articles ---------- */
const MODELES_CONTRAT_V2 = [
  { id: 'mv-prestation', nom: 'Prestation de services', type: 'prestation', preambule: "{A_maj} exerce une activité de {activite_metier}. {B_maj} souhaite lui confier la réalisation d'une prestation dans les conditions définies ci-après. Les parties se sont rapprochées et ont convenu de ce qui suit.",
    articles: [
      { titre: 'Objet', texte: "Le présent contrat a pour objet de définir les conditions dans lesquelles {A} s'engage à réaliser, pour le compte de {B}, la prestation suivante : {objet}.\n\n{description}" },
      { titre: 'Périmètre et livrables', texte: "La prestation comprend les éléments suivants :\n{livrables}\n\nToute demande ne figurant pas dans ce périmètre fera l'objet d'un devis complémentaire, qui devra être accepté par écrit par {B} avant exécution." },
      { titre: 'Durée', texte: "Le présent contrat prend effet le {debut}{fin_phrase}.{reconduction_phrase}" },
      { titre: 'Obligations du Prestataire', texte: "{A_maj} s'engage à exécuter la prestation avec tout le soin et la diligence requis, conformément aux règles de l'art et dans le respect des délais convenus. Il est tenu d'une obligation de moyens.\n\nIl informe {B} sans délai de toute difficulté susceptible d'affecter la bonne exécution de la mission et lui fait part de ses recommandations." },
      { titre: 'Obligations du Client', texte: "{B_maj} s'engage à collaborer activement à la réussite de la prestation, notamment en fournissant dans les délais convenus les informations, documents, contenus et accès nécessaires, en désignant un interlocuteur disposant d'un pouvoir de décision, et en procédant aux validations demandées dans un délai raisonnable.\n\nIl s'engage à régler le prix dans les conditions prévues au présent contrat." },
      { titre: 'Prix', texte: "En contrepartie de la prestation, {B} versera à {A} la somme de {montant} ({montant_lettres}) {periodicite_phrase}.\n\n{tva_phrase}{acompte_phrase}{frais_phrase}\n\n{revision}" },
      { titre: 'Modalités de paiement', texte: "{modalites}\n\n{penalites}" },
      clause('pi'), clause('confidentialite'), clause('responsabilite'), clause('forcemajeure'),
      { titre: 'Résiliation', texte: "En cas de manquement grave de l'une des parties à ses obligations, non réparé dans un délai de quinze (15) jours suivant la réception d'une mise en demeure adressée par lettre recommandée avec accusé de réception, l'autre partie pourra résilier le contrat de plein droit, sans préjudice de tous dommages et intérêts.\n\nChaque partie peut en outre mettre fin au contrat à tout moment, par écrit, moyennant un préavis de {preavis}. Les prestations réalisées jusqu'à la date effective de résiliation restent dues." },
      clause('rgpd'), clause('independance'), clause('integralite'), clause('droit')
    ] },
  { id: 'mv-cdi', nom: 'Contrat de travail — CDI', type: 'cdi',
    articles: [
      { titre: 'Engagement', texte: "{A_maj} engage {B}, qui l'accepte, à compter du {debut}, sous réserve des formalités d'embauche (déclaration préalable à l'embauche effectuée auprès de l'Urssaf) et de la visite d'information et de prévention.\n\n{B_maj} déclare être libre de tout engagement envers un autre employeur et n'être soumis(e) à aucune clause de non-concurrence l'empêchant d'exercer les présentes fonctions." },
      { titre: 'Nature et durée du contrat', texte: "Le présent contrat est conclu pour une durée indéterminée. Il est régi par les dispositions du Code du travail et par la convention collective {convention}." },
      { titre: "Période d'essai", texte: "Le présent contrat ne deviendra définitif qu'à l'issue d'une période d'essai de {essai}, pendant laquelle chacune des parties pourra y mettre fin à tout moment, sous réserve de respecter le délai de prévenance prévu par la loi. Toute absence pendant la période d'essai en prolonge d'autant la durée.{essai_renouv}" },
      { titre: 'Fonctions', texte: "{B_maj} est engagé(e) en qualité de {emploi}, statut {statut_salarie}, niveau / coefficient {classification} de la convention collective applicable.\n\nSes principales missions sont les suivantes :\n{description}\n\nCette liste n'est pas limitative : {B} pourra se voir confier toute tâche relevant de sa qualification." },
      { titre: 'Lieu de travail', texte: "{B_maj} exercera ses fonctions à l'adresse suivante : {lieu}. Des déplacements ponctuels pourront être demandés pour les besoins du service." },
      { titre: 'Durée du travail', texte: "La durée du travail de {B} est fixée à {horaire} heures par semaine, réparties selon l'horaire collectif en vigueur dans l'entreprise.\n\nLes heures supplémentaires éventuelles, accomplies à la demande de {A}, seront rémunérées ou compensées conformément aux dispositions légales et conventionnelles." },
      { titre: 'Rémunération', texte: "En contrepartie de son travail, {B} percevra une rémunération mensuelle brute de {remuneration} ({remuneration_lettres}) pour l'horaire défini ci-dessus, versée à la fin de chaque mois.\n\n{avantages}" },
      { titre: 'Congés payés', texte: "{B_maj} bénéficiera des congés payés prévus par la loi et la convention collective, soit deux jours et demi ouvrables par mois de travail effectif. Les dates de congés sont fixées par {A} en tenant compte, dans la mesure du possible, des souhaits de {B}." },
      { titre: 'Protection sociale', texte: "{B_maj} sera affilié(e) dès son embauche aux régimes de sécurité sociale et de retraite complémentaire obligatoires, ainsi qu'aux régimes de prévoyance et de complémentaire santé en vigueur dans l'entreprise.\n\nCaisse de retraite complémentaire : {caisse_retraite}.\nOrganisme de complémentaire santé : {mutuelle}." },
      { titre: 'Absences', texte: "En cas d'absence, {B} doit en informer {A} dans les meilleurs délais et, en cas de maladie ou d'accident, lui adresser un justificatif (arrêt de travail) dans les quarante-huit (48) heures." },
      { titre: 'Obligations professionnelles', texte: "{B_maj} s'engage à respecter les directives qui lui seront données, le règlement intérieur s'il en existe un, ainsi que les règles d'hygiène et de sécurité.\n\nIl/elle est tenu(e) à une obligation de discrétion professionnelle concernant toutes les informations dont il/elle aura connaissance dans l'exercice de ses fonctions, pendant et après l'exécution du contrat." },
      { titre: 'Rupture du contrat', texte: "Le présent contrat pourra être rompu à l'initiative de l'une ou l'autre des parties dans les conditions prévues par le Code du travail et la convention collective applicable, notamment en ce qui concerne le préavis." },
      { titre: 'Données personnelles', texte: "{A_maj} traite les données personnelles de {B} pour les seuls besoins de la gestion du personnel et du respect de ses obligations légales, conformément au RGPD. {B_maj} dispose d'un droit d'accès, de rectification et d'effacement de ses données." }
    ] },
  { id: 'mv-cdd', nom: 'Contrat de travail — CDD', type: 'cdd',
    articles: [
      { titre: 'Engagement et motif du recours', texte: "{A_maj} engage {B}, qui l'accepte, sous contrat à durée déterminée, pour le motif suivant : {motif}.\n\nCe recours est effectué conformément à l'article L. 1242-2 du Code du travail. Le cas échéant, nom et qualification de la personne remplacée : {remplace}." },
      { titre: 'Durée du contrat', texte: "Le contrat prend effet le {debut} et prendra fin le {fin}.{renouv_cdd}\n\n{A_maj} a procédé à la déclaration préalable à l'embauche auprès de l'Urssaf." },
      { titre: "Période d'essai", texte: "Le contrat comporte une période d'essai de {essai}, pendant laquelle chacune des parties pourra y mettre fin sans indemnité, sous réserve du délai de prévenance légal." },
      { titre: 'Fonctions', texte: "{B_maj} est engagé(e) en qualité de {emploi}, statut {statut_salarie}, niveau / coefficient {classification} de la convention collective {convention}.\n\nMissions principales :\n{description}" },
      { titre: 'Lieu et durée du travail', texte: "{B_maj} exercera ses fonctions à : {lieu}.\n\nLa durée du travail est fixée à {horaire} heures par semaine. Les heures supplémentaires éventuelles seront rémunérées conformément aux dispositions légales et conventionnelles." },
      { titre: 'Rémunération', texte: "{B_maj} percevra une rémunération mensuelle brute de {remuneration} ({remuneration_lettres}).\n\n{avantages}" },
      { titre: 'Congés payés', texte: "{B_maj} acquiert des congés payés à raison de deux jours et demi ouvrables par mois de travail effectif. Les congés non pris à l'échéance du contrat donneront lieu au versement d'une indemnité compensatrice de congés payés." },
      { titre: 'Indemnité de fin de contrat', texte: "À l'échéance du terme, et sauf exceptions prévues par la loi (notamment en cas de proposition d'un CDI, de rupture anticipée à l'initiative du salarié ou de faute grave), {B} percevra une indemnité de fin de contrat égale à 10 % de la rémunération totale brute perçue pendant la durée du contrat." },
      { titre: 'Protection sociale', texte: "{B_maj} sera affilié(e) aux régimes de sécurité sociale, de retraite complémentaire ({caisse_retraite}) et de complémentaire santé ({mutuelle}) en vigueur dans l'entreprise." },
      { titre: 'Obligations professionnelles', texte: "{B_maj} s'engage à respecter les directives de {A}, le règlement intérieur s'il en existe un, et à observer une stricte discrétion sur les informations dont il/elle aura connaissance." },
      { titre: 'Rupture anticipée', texte: "En dehors de la période d'essai, le contrat ne peut être rompu avant son terme que dans les cas prévus par l'article L. 1243-1 du Code du travail : accord commun des parties, faute grave, force majeure, inaptitude constatée par le médecin du travail, ou à l'initiative de {B} justifiant d'une embauche en CDI." },
      { titre: 'Convention collective', texte: "Le présent contrat est régi par la convention collective {convention}, que {B} peut consulter auprès de {A}." }
    ] },
  { id: 'mv-soustraitance', nom: 'Sous-traitance / freelance', type: 'freelance',
    articles: [
      { titre: 'Objet', texte: "{A_maj} confie à {B}, qui l'accepte, la réalisation de la mission suivante : {objet}.\n\n{description}" },
      { titre: 'Livrables et délais', texte: "{B_maj} s'engage à remettre les livrables suivants :\n{livrables}\n\nselon le calendrier convenu entre les parties. La mission débute le {debut}{fin_phrase}." },
      { titre: 'Indépendance du Sous-traitant', texte: "{B_maj} exécute la mission en toute indépendance, avec ses propres moyens, et organise librement son travail. Il n'existe aucun lien de subordination entre les parties. {B_maj} demeure seul responsable de ses obligations sociales et fiscales." },
      { titre: 'Prix et paiement', texte: "La mission est rémunérée {montant} ({montant_lettres}) {periodicite_phrase}, sur présentation de factures conformes.\n\n{modalites}" },
      { titre: 'Obligation de vigilance', texte: "Conformément à l'article L. 8222-1 du Code du travail, lorsque le montant du contrat atteint au moins 5 000 € HT, {B} remet à {A}, lors de la conclusion du contrat puis tous les six mois jusqu'à la fin de son exécution, une attestation de vigilance délivrée par l'Urssaf ainsi qu'un extrait d'immatriculation." },
      clause('pi'), clause('confidentialite'), clause('responsabilite'),
      { titre: 'Résiliation', texte: "Chaque partie peut mettre fin au contrat moyennant un préavis de {preavis}, notifié par écrit. En cas de manquement grave non réparé quinze (15) jours après mise en demeure, le contrat pourra être résilié de plein droit. Les travaux réalisés jusqu'à la résiliation restent dus." },
      clause('nonsollicitation'), clause('droit')
    ] },
  { id: 'mv-nda', nom: 'Accord de confidentialité (NDA)', type: 'nda', preambule: "Dans le cadre de {objet}, les parties sont amenées à échanger des informations confidentielles. Le présent accord a pour but d'en organiser la protection.",
    articles: [
      { titre: 'Objet', texte: "Le présent accord définit les conditions dans lesquelles {B} s'engage à préserver la confidentialité des informations communiquées par {A} dans le cadre de : {objet}." },
      { titre: 'Informations confidentielles', texte: "Sont considérées comme confidentielles toutes les informations, de quelque nature et sous quelque forme que ce soit (écrite, orale, numérique), communiquées par {A} à {B}, notamment les informations techniques, commerciales, financières, les savoir-faire, les fichiers clients et les projets en cours." },
      { titre: 'Engagements', texte: "{B_maj} s'engage à :\n– ne pas divulguer les informations confidentielles à des tiers ;\n– ne les utiliser que pour l'objet défini à l'article 1 ;\n– n'en permettre l'accès qu'aux seules personnes qui en ont besoin, tenues à la même obligation ;\n– prendre toutes mesures raisonnables pour en assurer la protection." },
      { titre: 'Exceptions', texte: "Les obligations ci-dessus ne s'appliquent pas aux informations : déjà connues de {B} au moment de leur communication ; tombées dans le domaine public sans faute de sa part ; reçues légitimement d'un tiers non tenu au secret ; ou dont la divulgation est exigée par la loi ou une autorité judiciaire." },
      { titre: 'Durée', texte: "Le présent accord prend effet le {debut}. Les obligations de confidentialité demeurent en vigueur pendant toute la durée des échanges et pendant {duree_conf} après leur fin." },
      { titre: 'Restitution', texte: "À première demande de {A}, et en tout état de cause à la fin des échanges, {B} restituera ou détruira l'ensemble des documents et supports contenant des informations confidentielles, sans en conserver de copie." },
      { titre: 'Absence de licence', texte: "La communication des informations confidentielles ne confère à {B} aucun droit de propriété ni aucune licence sur celles-ci." },
      clause('droit')
    ] },
  { id: 'mv-fournisseur', nom: "Contrat d'approvisionnement (fournisseur)", type: 'fournisseur',
    articles: [
      { titre: 'Objet', texte: "Le présent contrat définit les conditions dans lesquelles {B} fournit à {A} les produits ou services suivants : {objet}.\n\n{description}" },
      { titre: 'Commandes', texte: "Les commandes sont passées par {A} par écrit (courrier électronique accepté). Elles précisent la nature, les quantités, le prix et le délai de livraison souhaité. Toute commande est réputée acceptée à défaut de refus motivé de {B} dans un délai de cinq (5) jours ouvrés." },
      { titre: 'Livraison', texte: "Les livraisons sont effectuées à l'adresse suivante : {lieu}. Le transfert des risques intervient à la livraison. {A_maj} dispose d'un délai de huit (8) jours pour signaler toute non-conformité ou vice apparent." },
      { titre: 'Prix', texte: "Les prix sont fixés à {montant} ({montant_lettres}) {periodicite_phrase}, ou selon le tarif annexé au présent contrat.\n\n{revision}" },
      { titre: 'Paiement', texte: "{modalites}" },
      { titre: 'Garantie', texte: "{B_maj} garantit la conformité des produits et services à la commande et à la réglementation en vigueur, ainsi que les garanties légales de conformité et contre les vices cachés." },
      { titre: 'Durée et résiliation', texte: "Le contrat prend effet le {debut}{fin_phrase}.{reconduction_phrase} Chaque partie peut y mettre fin moyennant un préavis de {preavis}, par lettre recommandée avec accusé de réception." },
      clause('responsabilite'), clause('forcemajeure'), clause('droit')
    ] }
];

/* ---------- Grille de cotisations indicative (bulletin de paie) ----------
   Taux de référence pour un salarié du secteur privé, entreprise de moins de
   11 salariés. Ils évoluent chaque année et dépendent de votre situation
   (effectif, taux AT/MP notifié, convention collective, réductions…) :
   ils DOIVENT être vérifiés et ajustés avant toute utilisation.
   base : brut | T1 (dans la limite du plafond) | T2 (entre 1 et 8 plafonds) | csg (98,25 % du brut + part patronale santé/prévoyance) | forfait */
const GRILLE_DEFAUT = [
  { cat: 'Santé', libelle: 'Sécurité sociale — maladie, maternité, invalidité, décès', base: 'brut', sal: 0, pat: 7 },
  { cat: 'Santé', libelle: 'Complémentaire santé (mutuelle)', base: 'forfait', sal: 0, pat: 0, mutuelle: true },
  { cat: 'Accidents du travail', libelle: 'Accidents du travail — maladies professionnelles', base: 'brut', sal: 0, pat: 2.08 },
  { cat: 'Retraite', libelle: 'Sécurité sociale plafonnée', base: 'T1', sal: 6.9, pat: 8.55 },
  { cat: 'Retraite', libelle: 'Sécurité sociale déplafonnée', base: 'brut', sal: 0.4, pat: 2.11 },
  { cat: 'Retraite', libelle: 'Complémentaire tranche 1', base: 'T1', sal: 3.15, pat: 4.72 },
  { cat: 'Retraite', libelle: 'Complémentaire tranche 2', base: 'T2', sal: 8.64, pat: 12.95 },
  { cat: 'Retraite', libelle: "Contribution d'équilibre général T1", base: 'T1', sal: 0.86, pat: 1.29 },
  { cat: 'Retraite', libelle: "Contribution d'équilibre général T2", base: 'T2', sal: 1.08, pat: 1.62 },
  { cat: 'Retraite', libelle: 'APEC (cadres)', base: 'T1T2', sal: 0.024, pat: 0.036, cadre: true },
  { cat: 'Famille', libelle: 'Famille', base: 'brut', sal: 0, pat: 3.45 },
  { cat: 'Assurance chômage', libelle: 'Assurance chômage', base: 'brut', sal: 0, pat: 4 },
  { cat: 'Assurance chômage', libelle: 'AGS (garantie des salaires)', base: 'brut', sal: 0, pat: 0.25 },
  { cat: "Autres contributions dues par l'employeur", libelle: 'FNAL, contribution solidarité autonomie, dialogue social', base: 'brut', sal: 0, pat: 0.416 },
  { cat: "Autres contributions dues par l'employeur", libelle: 'Formation professionnelle et taxe d\'apprentissage', base: 'brut', sal: 0, pat: 1.23 },
  { cat: 'CSG / CRDS', libelle: 'CSG déductible de l\'impôt sur le revenu', base: 'csg', sal: 6.8, pat: 0 },
  { cat: 'CSG / CRDS', libelle: 'CSG / CRDS non déductibles de l\'impôt sur le revenu', base: 'csg', sal: 2.9, pat: 0, nonDed: true }
];
