/* ============================================================
   NaoInvest — les impôts en vrai : les documents qu'on reçoit,
   dans quel ordre, comment lire un avis d'imposition zone par zone,
   et le calcul du nombre de parts (garde alternée comprise).
   Tous les documents montrés sont des EXEMPLES FICTIFS et simplifiés.
   ============================================================ */

/* ---------- les documents ---------- */
const DOCS_IMPOTS = [
  { id: 'declaration', e: '✍️', nom: 'La déclaration de revenus', ref: 'formulaire n° 2042', quand: 'Avril à juin', couleur: '#6C78EE',
    role: 'C’est vous qui la remplissez (le plus souvent en ligne) : vos revenus de l’année passée, votre situation de famille, vos charges, dons, frais de garde…',
    faire: 'Vérifier chaque montant prérempli, ajouter ce qui manque (dons, frais de garde, emploi à domicile, pensions versées…), puis signer en ligne avant la date limite de votre département.',
    apercu: { titre: 'Déclaration des revenus 2024', sous: 'Formulaire 2042 · à déposer en 2025', lignes: [['Situation de famille (case M)', 'Marié'], ['Case H · enfant en résidence alternée', '1'], ['1AJ · Salaires déclarant 1', '38 000 €'], ['1BJ · Salaires déclarant 2', '30 000 €'], ['7UF · Dons à des associations', '300 €']], pied: 'Signée en ligne le 22 mai 2025' } },
  { id: 'asdir', e: '🧾', nom: 'L’avis de situation déclarative', ref: 'ASDIR', quand: 'Juste après la déclaration en ligne', couleur: '#5AB8A8',
    role: 'Disponible tout de suite dans votre espace après avoir déclaré en ligne. Il résume ce que vous avez déclaré et sert de justificatif provisoire de revenus (logement, crédit, aides) en attendant l’avis d’impôt.',
    faire: 'Le télécharger si on vous demande un justificatif avant l’été. Il ne remplace pas l’avis d’impôt : il ne dit pas encore combien vous paierez.',
    apercu: { titre: 'Avis de situation déclarative', sous: 'Impôt sur les revenus de 2024', lignes: [['Revenu fiscal de référence', '61 200 €'], ['Nombre de parts', '2,25'], ['Date de la déclaration', '22/05/2025']], pied: 'Document provisoire, ne vaut pas avis d’impôt', tampon: 'PROVISOIRE' } },
  { id: 'avis', e: '📩', nom: 'L’avis d’impôt', ref: 'avis d’imposition ou de non-imposition', quand: 'Fin juillet à début septembre', couleur: '#E59B3B',
    role: 'Le calcul définitif de votre impôt sur le revenu : ce que vous devez au total, ce qui a déjà été prélevé à la source, et le solde (à payer ou remboursé). Il donne aussi votre revenu fiscal de référence et votre nouveau taux de prélèvement.',
    faire: 'Le lire en entier (voir « Lire son avis zone par zone » plus bas), le garder : il est demandé pour de nombreuses démarches. En cas d’erreur, corriger sa déclaration en ligne.',
    apercu: { titre: 'Avis d’impôt 2025', sous: 'sur les revenus de l’année 2024', lignes: [['Impôt sur le revenu net', '3 688 €'], ['Déjà prélevé à la source', '− 3 520 €'], ['Reste à payer', '168 €']], pied: 'Revenu fiscal de référence : 61 200 € · 2,25 parts' } },
  { id: 'degrevement', e: '↩️', nom: 'L’avis de dégrèvement', ref: 'après une réclamation ou une correction', quand: 'Quelques semaines après la demande', couleur: '#3DB57A',
    role: 'Un « dégrèvement », c’est une baisse ou une annulation d’un impôt déjà calculé : l’administration reconnaît que vous deviez moins. L’avis indique le montant retiré, et le remboursement s’il était déjà payé.',
    faire: 'Vérifier que le montant correspond à votre demande, et suivre le remboursement sur votre compte bancaire. Le garder avec l’avis d’impôt d’origine.',
    apercu: { titre: 'Avis de dégrèvement', sous: 'Impôt sur les revenus de 2024', lignes: [['Impôt initial', '3 688 €'], ['Montant dégrevé', '− 270 €'], ['Nouvel impôt', '3 418 €'], ['À vous rembourser', '270 €']], pied: 'Suite à votre réclamation du 03/10/2025', tampon: 'DÉGREVÉ' } },
  { id: 'fonciere', e: '🏠', nom: 'L’avis de taxe foncière', ref: 'pour les propriétaires', quand: 'Fin août à septembre', couleur: '#B07AD9',
    role: 'L’impôt local des propriétaires d’un logement ou d’un terrain au 1er janvier. Il est calculé sur la valeur locative cadastrale et les taux votés par la commune.',
    faire: 'Le payer avant la date limite (souvent mi-octobre, un peu plus tard en ligne), ou opter pour la mensualisation. Le prévoir dans son budget après un achat.',
    apercu: { titre: 'Taxe foncière 2025', sous: 'Propriétés bâties', lignes: [['Base d’imposition', '1 850 €'], ['Commune', '742 €'], ['Intercommunalité', '96 €'], ['Montant à payer', '838 €']], pied: 'Date limite de paiement : 15/10/2025' } },
  { id: 'acomptes', e: '📅', nom: 'L’échéancier d’acomptes', ref: 'revenus sans employeur', quand: 'En début d’année, et à chaque changement', couleur: '#5B8DEF',
    role: 'Pour les revenus que personne ne prélève à votre place (activité indépendante, loyers perçus, pensions alimentaires reçues…), l’impôt est payé par acomptes prélevés sur votre compte, chaque mois ou chaque trimestre.',
    faire: 'Vérifier les montants et les dates ; on peut les moduler dans son espace si ses revenus changent beaucoup.',
    apercu: { titre: 'Échéancier d’acomptes', sous: 'Prélèvement à la source — revenus non salariaux', lignes: [['Acompte mensuel', '85 €'], ['Prélevé le', '15 de chaque mois'], ['Taux appliqué', '8,7 %']], pied: 'Modifiable dans « Gérer mon prélèvement à la source »' } }
];
const ETAPES_IMPOTS = [
  { quand: 'Toute l’année N', e: '💼', titre: 'On perçoit ses revenus', txt: 'L’impôt est prélevé chaque mois sur le salaire (ou par acomptes), avec le taux connu à ce moment-là.', doc: 'acomptes' },
  { quand: 'Avril → juin N+1', e: '✍️', titre: 'On déclare les revenus de l’année N', txt: 'En ligne, avec une date limite selon le département. On vérifie le prérempli et on complète.', doc: 'declaration' },
  { quand: 'Aussitôt après', e: '🧾', titre: 'L’avis de situation déclarative', txt: 'Un justificatif provisoire, disponible immédiatement en ligne.', doc: 'asdir' },
  { quand: 'Fin juillet → début septembre', e: '📩', titre: 'L’avis d’impôt arrive', txt: 'Le calcul définitif. Remboursement à partir de fin juillet si l’on a trop payé ; sinon le solde est prélevé à partir de septembre (en une fois s’il est petit, en plusieurs fois sinon).', doc: 'avis' },
  { quand: 'Septembre', e: '🔄', titre: 'Le nouveau taux s’applique', txt: 'Le taux de prélèvement calculé sur l’avis remplace l’ancien sur les fiches de paie.' },
  { quand: 'Automne', e: '🏠', titre: 'Les impôts locaux', txt: 'Taxe foncière pour les propriétaires, taxe d’habitation pour les résidences secondaires.', doc: 'fonciere' },
  { quand: 'Si une erreur est repérée', e: '🛠️', titre: 'Corriger ou réclamer', txt: 'Correction en ligne de la déclaration (en général d’août à mi-décembre), ou réclamation : en principe jusqu’au 31 décembre de la deuxième année qui suit l’avis.' },
  { quand: 'Après la réponse', e: '↩️', titre: 'L’avis de dégrèvement', txt: 'Si la demande est acceptée : l’impôt est réduit et le trop-payé remboursé.', doc: 'degrevement' }
];
function apercuDoc(d, grand) {
  const a = d.apercu;
  return `<div class="doc-papier ${grand ? 'grand' : ''}" style="--dc:${d.couleur}">
    <div class="dp-bande"><span>ADMINISTRATION FISCALE</span><span>exemple fictif</span></div>
    <div class="dp-titre"><b>${esc(a.titre)}</b><small>${esc(a.sous)}</small></div>
    <div class="dp-lignes">${a.lignes.map(l => `<div><span>${esc(l[0])}</span><b>${esc(l[1])}</b></div>`).join('')}</div>
    <div class="dp-pied">${esc(a.pied)}</div>
    ${a.tampon ? `<span class="dp-tampon">${esc(a.tampon)}</span>` : ''}
  </div>`;
}

/* ---------- l'avis d'impôt « comme le vrai » : spécimen fictif, zone par zone ----------
   Même mise en page que l'avis réel (page de garde, feuillets 1 et 2), informations
   100 % inventées. Pas de logo officiel ni de code 2D-DOC : un filigrane SPÉCIMEN
   sur chaque page, pour qu'il ne puisse jamais passer pour un vrai document. */
const CAS_AVIS = {
  seul: {
    nom: 'Parent seul, non imposable : remboursé', court: 'Parent seul · remboursé',
    noms: ['MME EXEMPLE SARAH'], adresse: ['3 ALLEE DES TILLEULS', 'BAT B APPT 12', '00100 VILLE-EXEMPLE'],
    nfiscal: ['00 00 000 000 001'], ref: '25 00 0000000 01', fip: '000 00 00 000 00000 0 X', role: '001',
    situation: 'D', casPart: 'T', exclusifs: '1', alternes: '', parts: '2,00',
    revenus: [{ lib: 'Salaires', v: [21800] }, { lib: 'Déduction 10% ou frais réels', v: [-2180] }, { lib: 'Salaires, pensions, rentes nets', v: [19620], total: 19620 }],
    rbg: 19620, imposable: 19620, bareme: 0, reductions: 0, net: 0, retenue: 312, solde: -312,
    per: [{ lib: 'Plafond non utilisé pour les revenus de 2021', v: [4114] }, { lib: 'Plafond non utilisé pour les revenus de 2022', v: [4114] }, { lib: 'Plafond non utilisé pour les revenus de 2023', v: [4399] }, { lib: 'Plafond calculé sur les revenus de 2024', v: [4637] }],
    perTotal: [17264]
  },
  couple: {
    nom: 'Couple marié, 1 enfant en garde alternée : reste à payer', court: 'Couple marié · à payer',
    noms: ['M. EXEMPLE ALEX', 'MME EXEMPLE CAMILLE'], adresse: ['12 RUE DES LILAS', '00200 BOURG-EXEMPLE'],
    nfiscal: ['00 00 000 000 002', '00 00 000 000 003'], ref: '25 00 0000000 02', fip: '000 00 00 000 00000 0 Y', role: '002',
    situation: 'M', casPart: '', exclusifs: '', alternes: '1', parts: '2,25',
    revenus: [{ lib: 'Salaires', v: [38000, 30000] }, { lib: 'Déduction 10% ou frais réels', v: [-3800, -3000] }, { lib: 'Salaires, pensions, rentes nets', v: [34200, 27000], total: 61200 }],
    rbg: 61200, imposable: 61200, bareme: 3886, reductions: 198, net: 3688, retenue: 3520, solde: 168,
    per: [{ lib: 'Plafond non utilisé pour les revenus de 2021', v: [4114, 4114] }, { lib: 'Plafond non utilisé pour les revenus de 2022', v: [4114, 4114] }, { lib: 'Plafond non utilisé pour les revenus de 2023', v: [4399, 4399] }, { lib: 'Plafond calculé sur les revenus de 2024', v: [4637, 4637] }],
    perTotal: [17264, 17264]
  }
};
const casAvis = () => CAS_AVIS[U.casAvis || 'seul'];
const n0 = x => nb(Math.abs(x), 0);
/* Les explications, en listes : plus lisibles, et le panneau prend la place à l'écran. */
const L = items => `<ul class="liste-ex">${items.filter(Boolean).map(x => `<li>${x}</li>`).join('')}</ul>`;
const CODE = (c, t) => `<li class="code-l"><b class="code">${c}</b><span>${t}</span></li>`;
const CODES = items => `<ul class="liste-ex codes">${items.map(x => CODE(x[0], x[1])).join('')}</ul>`;
const ICI = t => `<div class="ici">👉 ${t}</div>`;
/* Le petit tableau des parts, pour les cas courants. */
const TABLEAU_PARTS = [
  ['1', '1 personne majeure ou émancipée'],
  ['1,25', '1 personne majeure ou émancipée + 1 enfant mineur ou handicapé en garde alternée'],
  ['1,5', '1 personne majeure ou émancipée + 1 enfant mineur ou handicapé à charge'],
  ['1,5', '1 parent seul (case T) + 1 enfant en garde alternée'],
  ['2', '1 parent seul (case T) + 1 enfant à charge'],
  ['2', '1 personne seule + 2 enfants à charge'],
  ['2', '1 couple marié ou pacsé'],
  ['2,25', '1 couple + 1 enfant en garde alternée'],
  ['2,5', '1 couple + 1 enfant à charge'],
  ['3', '1 couple + 2 enfants à charge'],
  ['4', '1 couple + 3 enfants à charge (le 3e compte pour 1 part)']
];
const tableauParts = actuel => `<p class="sous-t">Le petit tableau des parts</p><table class="tab-parts"><thead><tr><th>Parts</th><th>Composition du foyer</th></tr></thead><tbody>${TABLEAU_PARTS.map((r, i) => `<tr class="${i === actuel ? 'ici-l' : ''}"><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('')}</tbody></table>
  <p class="petit-texte">Case T : parent qui vit seul avec ses enfants (+0,5 part, ou +0,25 si les enfants sont seulement en garde alternée). Enfant handicapé ou carte d’invalidité : parts en plus.</p>`;
const AVIS_ZONES = [
  { id: 'entete', nom: 'L’en-tête : quel impôt, quelle année', ou: 'Page 1, tout en haut au centre.', explic: c =>
    L(['<b>Impôt sur les revenus de 2024</b> : les revenus gagnés en 2024.', '<b>Avis d’impôt établi en 2025</b> : l’année où l’impôt est calculé et payé.', 'Quand on vous demande « votre dernier avis d’imposition », c’est celui-ci.', 'Le petit code à droite (AVIS_IR_RG) indique seulement le type de document.']) },
  { id: 'code2d', nom: 'Le code 2D-DOC', ou: 'Page 1, le grand carré noir et blanc en haut à gauche.', explic: c =>
    L(['Il contient les informations principales de l’avis (nom, revenu fiscal de référence, parts…), <b>signées numériquement</b>.', 'Un bailleur, une banque ou une administration peut le <b>scanner</b> pour vérifier que l’avis est authentique et n’a pas été modifié.', 'C’est ce qui permet de repérer un faux avis.', 'Ce spécimen n’en contient pas : il ne peut pas servir de justificatif.']) },
  { id: 'centre', nom: 'Votre centre des finances publiques', ou: 'Page 1, l’adresse au-dessus de la vôtre.', explic: c =>
    L(['Le <b>SIP</b> (service des impôts des particuliers) qui gère votre dossier.', 'C’est à lui qu’on s’adresse pour une question ou une réclamation.', 'Le plus simple : la <b>messagerie sécurisée</b> de votre espace sur impots.gouv.fr.']) },
  { id: 'destinataire', nom: 'Le destinataire : qui fait partie du foyer', ou: 'Page 1, l’adresse à droite (celle de la fenêtre de l’enveloppe).', explic: c =>
    L(['<b>Un nom</b> : une personne qui déclare seule.', '<b>Deux noms</b> : un couple marié ou pacsé qui déclare ensemble.', 'Les <b>enfants</b> n’apparaissent pas ici : ils sont comptés au feuillet 1, dans les personnes à charge.']) + ICI(c.noms.length > 1 ? 'deux noms : une déclaration commune.' : 'un seul nom : une personne qui déclare seule.') },
  { id: 'refs', nom: 'Vos références', ou: 'Page 1, cadre « Vos références », à gauche.', explic: c =>
    L(['<b>Numéro fiscal</b> : votre identifiant personnel (13 chiffres) pour vous connecter à impots.gouv.fr.', '<b>Référence de l’avis</b> : identifie ce document ; demandée avec le numéro fiscal pour vérifier l’avis en ligne (bourse, logement social…).', '<b>Adresse d’imposition au 1er janvier</b> : l’adresse qui compte pour l’année.', '<b>Numéro FIP</b> et <b>numéro de rôle</b> : des références internes de l’administration.', '<b>Date d’établissement</b> : le jour où l’avis a été calculé.', '<b>Date de mise en recouvrement</b> : la date officielle de l’avis, qui fait courir les délais.', '⚠️ Ne donnez jamais ces numéros à quelqu’un qui vous contacte sans que vous l’ayez demandé.']) },
  { id: 'contacts', nom: 'Vos contacts', ou: 'Page 1, cadre « Vos contacts », à gauche.', explic: c =>
    L(['🖥 <b>Messagerie sécurisée</b> : la plus pratique, elle garde une trace écrite.', '📱 <b>Téléphone</b> : le numéro est indiqué sur votre vrai avis.', '🏛 <b>Sur place</b> : souvent sur rendez-vous, à prendre en ligne.']) },
  { id: 'montant', nom: c => c.solde < 0 ? 'La somme qui vous est remboursée' : 'Le montant qui reste à payer', ou: 'Page 1, le grand cadre bleu à droite.', explic: c => c.solde < 0
      ? L([`On vous a prélevé <b>plus</b> d’impôt que vous n’en deviez : <b>${n0(c.solde)} €</b> vous sont rendus.`, 'Le remboursement est <b>automatique</b>, par virement.', 'Il arrive en général <b>dès fin juillet</b>, sur le compte indiqué.', 'À faire : seulement vérifier que le compte bancaire est toujours le bon.'])
      : L([`Le prélèvement à la source n’a <b>pas suffi</b> : il reste <b>${n0(c.solde)} €</b> à payer.`, '<b>300 € ou moins</b> : prélevé en une seule fois, fin septembre.', '<b>Plus de 300 €</b> : étalé en 4 fois, de septembre à décembre.', 'Le prélèvement se fait sur le compte bancaire indiqué.']) },
  { id: 'rfr', nom: 'Revenu fiscal de référence et nombre de parts', ou: 'Page 1, petit cadre sous le montant ; repris au feuillet 1.', explic: c =>
    L(['<b>Revenu fiscal de référence (RFR)</b> : le chiffre demandé pour les aides.', 'Il sert pour : bourses, logement social, LEP, chèque énergie, tarifs sociaux, aides de la CAF ou de la commune, exonérations.', 'Il part du <b>revenu imposable</b>, auquel on ajoute certains revenus exonérés ou taxés à part.', '<b>Nombre de parts</b> : la taille du foyer (détail au feuillet 1).']) + ICI(`RFR = ${n0(c.imposable)} € · ${c.parts} parts.`) },
  { id: 'message', nom: 'Le message sur le prélèvement à la source', ou: 'Page 1, cadre du bas.', explic: c =>
    L(['Cet avis <b>régularise</b> l’année passée.', 'On compare l’impôt <b>réellement dû</b> et ce qui a été <b>prélevé chaque mois</b>.', 'Pour voir ou changer son taux : « Gérer mon prélèvement à la source », dans votre espace sur impots.gouv.fr.']) },
  { id: 'feuillet', nom: 'L’en-tête des feuillets', ou: 'En haut des pages suivantes.', explic: c =>
    L(['L’année de l’avis et l’année des revenus.', 'Le <b>numéro fiscal</b> du déclarant 1.', 'Le <b>numéro de feuillet</b> (« 1 / 2 ») : vérifiez que vous avez toutes les pages.', '<b>Déclarant 1 – Nom de naissance</b> : qui est le premier déclarant.']) },
  { id: 'situation', nom: 'Situation du foyer et cas particulier', ou: 'Feuillet 1, première ligne du tableau bleu.', explic: c =>
    '<p class="sous-t">Situation du foyer</p>' + CODES([['M', 'marié·e'], ['O', 'pacsé·e'], ['C', 'célibataire'], ['D', 'divorcé·e ou séparé·e'], ['V', 'veuf·ve']]) +
    '<p class="sous-t">Cas particulier (demi-part en plus)</p>' + CODES([['T', 'parent qui vit seul avec ses enfants'], ['L', 'personne seule ayant élevé des enfants'], ['P', 'invalidité'], ['W', 'ancien combattant (plus de 74 ans)']]) +
    '<p class="sous-t">Les autres colonnes</p>' + L(['Enfants majeurs célibataires ou mariés rattachés au foyer.', 'Personnes handicapées recueillies.']) +
    ICI(`situation <b>${c.situation}</b>${c.casPart ? `, cas particulier <b>${c.casPart}</b>` : ', aucun cas particulier'}.`) },
  { id: 'enfants', nom: 'Les enfants : résidence exclusive ou alternée', ou: 'Feuillet 1, deuxième ligne du tableau bleu.', explic: c =>
    L(['<b>Résidence exclusive</b> : l’enfant vit chez vous → <b>0,5 part</b> (pour chacun des deux premiers, 1 part à partir du troisième).', '<b>Résidence alternée</b> : garde partagée → <b>0,25 part</b> (pour chacun des deux premiers, 0,5 ensuite).', '<b>Dont enfants handicapés</b> : ils donnent des parts en plus.']) +
    ICI(c.exclusifs ? `${c.exclusifs} enfant en résidence exclusive.` : `${c.alternes} enfant en résidence alternée.`) },
  { id: 'parts', nom: 'Le nombre de parts', ou: 'Feuillet 1, à droite du tableau bleu.', explic: c =>
    tableauParts(c.situation === 'D' ? 4 : 7) +
    L(['Il mesure la <b>taille du foyer</b>.', 'Le revenu imposable est <b>divisé</b> par ce nombre avant d’appliquer le barème.', 'Plus il y a de parts, <b>moins</b> l’impôt est élevé.', 'Vérifiez-le toujours : une erreur fausse tout le calcul.']) +
    '<p class="sous-t">Le calcul ici</p>' + (c.situation === 'D'
      ? CODES([['1', 'part pour le parent seul'], ['+0,5', 'enfant en résidence exclusive'], ['+0,5', 'case T (parent isolé)'], ['= 2', 'parts']])
      : CODES([['2', 'parts pour le couple marié'], ['+0,25', 'enfant en résidence alternée'], ['= 2,25', 'parts']])) },
  { id: 'revenus', nom: 'Le détail des revenus', ou: 'Feuillet 1, « Détail des revenus ».', explic: c =>
    L(['Une <b>colonne par déclarant</b> (Déclar. 1, Déclar. 2) et une colonne <b>Total</b>.', '<b>Salaires</b> : le net imposable de l’année (comparez avec le cumul de la fiche de paie de décembre).', '<b>Déduction 10 % ou frais réels</b> : l’abattement pour frais professionnels, ou vos frais réels si vous les avez déclarés.', '<b>Salaires, pensions, rentes nets</b> : ce qui reste après la déduction.', 'D’autres lignes peuvent apparaître : retraites, loyers perçus, revenus de placements…']) + ICI(`${n0(c.revenus[2].total)} € de salaires nets au total.`) },
  { id: 'imposable', nom: 'Revenu brut global et revenu imposable', ou: 'Feuillet 1, sous le détail des revenus.', explic: c =>
    L(['<b>Revenu brut global</b> : tous les revenus nets du foyer additionnés.', 'On retire les <b>charges déductibles</b> (pension alimentaire versée, versements sur un PER…).', '<b>Revenu imposable</b> : ce qui reste ; c’est lui qu’on divise par le nombre de parts.']) + ICI(`revenu imposable : ${n0(c.imposable)} €.`) },
  { id: 'impot', nom: 'Le calcul de l’impôt', ou: 'Feuillet 1, de « Impôt sur les revenus soumis au barème » à « IMPOT NET ».', explic: c =>
    '<p class="sous-t">Le calcul pas à pas</p>' + (c.net === 0
      ? L([`${n0(c.imposable)} € ÷ ${c.parts} parts = <b>${nb(c.imposable / 2, 0)} € par part</b>.`, 'C’est sous le seuil de la première tranche (<b>11 497 €</b>).', 'Résultat : <b>0 € d’impôt</b>, le foyer est non imposable.'])
      : L([`${n0(c.imposable)} € ÷ ${c.parts} parts = <b>27 200 € par part</b>.`, 'Barème : 0 % jusqu’à 11 497 €, puis 11 % → <b>1 727,33 € par part</b>.', `× ${c.parts} parts = <b>${n0(c.bareme)} €</b> (impôt soumis au barème).`, `Réduction pour dons (66 % de 300 €) : <b>− ${n0(c.reductions)} €</b>.`, `<b>Impôt net : ${n0(c.net)} €</b>.`])) +
    '<p class="sous-t">Les lignes possibles</p>' + L(['<b>Décote</b> : allège les petits impôts.', '<b>Réductions d’impôt</b> : dons, frais de scolarité…', '<b>Crédits d’impôt</b> : garde d’enfant, emploi à domicile — remboursés même sans impôt.']) },
  { id: 'solde', nom: 'Le calcul du solde', ou: 'Feuillet 1, « CALCUL DU SOLDE DE VOTRE IMPOT POUR 2024 ».', explic: c =>
    CODES([[`${n0(c.net)} €`, 'impôt dû pour 2024'], [`− ${n0(c.retenue)} €`, 'retenue à la source prélevée en 2024 par les employeurs'], [`${c.solde < 0 ? '− ' : '= '}${n0(c.solde)} €`, c.solde < 0 ? 'solde négatif : remboursé' : 'solde positif : à payer']]) },
  { id: 'rfr2', nom: 'Informations complémentaires', ou: 'Feuillet 1, « INFORMATIONS COMPLEMENTAIRES ».', explic: c =>
    L(['Le <b>revenu fiscal de référence</b> est rappelé ici.', 'Le petit chiffre en exposant renvoie à la <b>notice</b> de l’avis, qui détaille son calcul.']) + ICI(`${n0(c.imposable)} €.`) },
  { id: 'per', nom: 'Le plafond épargne retraite', ou: 'Feuillet 1 en bas, et suite au feuillet 2.', explic: c =>
    L(['Le montant que chaque déclarant peut verser en 2025 sur un <b>PER</b> en le <b>déduisant</b> de ses revenus.', 'Il additionne les plafonds <b>non utilisés</b> des trois années précédentes…', '… et celui <b>calculé sur les revenus de 2024</b> : 10 % des revenus professionnels, avec un minimum.', 'Utile seulement si l’on paie de l’impôt : sans impôt, la déduction ne rapporte rien.']) },
  { id: 'reclamation', nom: 'Contester son impôt', ou: 'Feuillet 1, tout en bas, en petits caractères.', explic: c =>
    L(['Possible jusqu’au <b>31 décembre 2027</b> pour cet avis.', 'Par la <b>messagerie sécurisée</b> ou par courrier au centre des finances publiques.', 'Si la demande est acceptée : un <b>avis de dégrèvement</b> et un remboursement.']) },
  { id: 'pas2025', nom: 'Le prélèvement à la source de l’année suivante', ou: 'Feuillet 2, « PRELEVEMENT A LA SOURCE 2025 ».', explic: c =>
    L(['Le nouveau taux, calculé grâce à cet avis, s’applique à partir de <b>septembre</b>.', 'On peut le consulter, le <b>moduler</b> ou choisir des <b>taux individualisés</b> (couples).', 'Où : « Gérer mon prélèvement à la source » sur impots.gouv.fr.']) }
];
const OU_LIRE = [['🧾', 'Mon revenu fiscal de référence', 'rfr'], ['👪', 'Ma situation (marié, pacsé, célibataire…)', 'situation'], ['🧒', 'Mes enfants', 'enfants'], ['➗', 'Mon nombre de parts', 'parts'],
  ['💶', 'Mes revenus', 'revenus'], ['💳', 'Remboursé ou à payer ?', 'montant'], ['🧮', 'Le calcul de l’impôt', 'impot'], ['🌅', 'Mon plafond épargne retraite', 'per'], ['⚖️', 'Contester', 'reclamation']];
function avisFictif() {
  const c = casAvis(), deux = c.noms.length > 1;
  const z = (id, cls, html) => `<button type="button" class="sz ${cls || ''} ${U.zoneAvis === id ? 'choisie' : ''}" data-zone-avis="${id}">${html}</button>`;
  const ligne = (lib, vals, total, gras) => `<div class="sp-l ${gras ? 'gras' : ''}"><span>${lib}</span>${(deux ? [0, 1] : [0]).map(i => `<span class="n">${vals && vals[i] != null ? (vals[i] < 0 ? '- ' : '') + n0(vals[i]) : ''}</span>`).join('')}${deux ? '' : '<span class="n"></span>'}<span class="n t">${total != null ? total : ''}</span></div>`;
  const entFeuillet = n => z('feuillet', 'sp-feuillet', `<div><b>Avis d’impôt établi en 2025</b><span>N°fiscal : ${c.nfiscal[0]}</span></div><div class="d"><b>Impôt sur les revenus de 2024</b><span>Feuillet n° : ${n} / 2</span></div>`);
  const rembourse = c.solde < 0;
  return `<div class="specimen">
  <div class="sp-page">
    <div class="sp-haut">
      <div class="sp-logo">SPÉCIMEN<br><small>pédagogique</small><br><small>NaoInvest</small></div>
      ${z('entete', 'sp-entete', '<span class="org">ADMINISTRATION FISCALE · SPÉCIMEN</span><b>Impôt sur les revenus de 2024</b><b>Avis d’impôt établi en 2025</b><span class="code">AVIS_IR_RG</span>')}
      <div class="sp-notice">La notice de cet avis est disponible sur le site des impôts</div>
    </div>
    <div class="sp-ligne2">
      ${z('code2d', 'sp-code2d', '<span>Code 2D-DOC</span><small>absent du spécimen</small>')}
      ${z('centre', 'sp-centre', '<span>CENTRE DES FINANCES PUBLIQUES</span><span>SIP VILLE-EXEMPLE</span><span>1 RUE DE L’EXEMPLE</span><span>00000 VILLE-EXEMPLE CEDEX</span>')}
    </div>
    <div class="sp-corps">
      <div class="sp-gauche">
        ${z('refs', 'sp-boite', `<span class="sp-onglet">Vos références</span>
          <div class="sp-kv"><b>Numéro fiscal (C) :</b><span>${c.nfiscal[0]}</span></div>${deux ? `<div class="sp-kv"><b>Numéro fiscal (C) :</b><span>${c.nfiscal[1]}</span></div>` : ''}
          <div class="sp-kv"><b>Référence de l’avis :</b><span>${c.ref}</span></div>
          <div class="sp-kv col"><b>Adresse d’imposition au 01/01/2025 :</b><span>${c.adresse.join('<br>')}</span></div>
          <div class="sp-kv"><b>Numéro FIP :</b><span>${c.fip}</span></div><div class="sp-kv"><b>Numéro de rôle :</b><span>${c.role}</span></div>
          <div class="sp-kv"><b>Date d’établissement :</b><span>08/07/2025</span></div><div class="sp-kv"><b>Date de mise en recouvrement :</b><span>31/07/2025</span></div>
          <div class="sp-kv"><b>Identifiant service :</b><span>00000</span></div>`)}
        ${z('contacts', 'sp-boite', `<span class="sp-onglet">Vos contacts</span>
          <p><b>🖥 Par messagerie sécurisée</b><br>dans votre espace particulier sur le site des impôts</p>
          <p><b>📱 Par téléphone</b><br>au numéro indiqué sur votre avis (fictif ici)<br>du lundi au vendredi</p>
          <p><b>🏛 Sur place</b><br>horaires de votre centre des finances publiques, rubrique Contact et prise de RDV</p>
          <p class="adr">SIP VILLE-EXEMPLE<br>1 RUE DE L’EXEMPLE<br>00000 VILLE-EXEMPLE CEDEX</p>`)}
      </div>
      <div class="sp-droite">
        ${z('destinataire', 'sp-dest', c.noms.concat(c.adresse).map(x => `<span>${x}</span>`).join(''))}
        ${z('montant', 'sp-montant', `<span class="sp-mt-t">${rembourse ? 'Somme qui vous est remboursée' : 'Montant restant à payer'}</span><span class="sp-mt-v">${nb(Math.abs(c.solde), 2)} €</span>
          <span class="sp-mt-txt">${rembourse ? `<b>Vous n’avez plus rien à payer au titre des revenus de 2024.</b><br><br><b>Vous serez remboursé par virement le 25/07/2025 sur le compte bancaire suivant :</b><br>FR76 0000 0000 0000 0000 0000 000 (fictif)<br>Émetteur du virement : ADMINISTRATION FISCALE`
            : `<b>Ce montant sera prélevé le 25/09/2025 sur le compte bancaire suivant :</b><br>FR76 0000 0000 0000 0000 0000 000 (fictif)<br><br>Montant inférieur à 300 € : prélevé en une seule fois.`}</span>`)}
        ${z('rfr', 'sp-rfr', `<div class="sp-kv"><b>Revenu fiscal de référence :</b><span>${n0(c.imposable)}</span></div><div class="sp-kv"><b>Nombre de parts :</b><span>${c.parts}</span></div><small>Plus de détails dans la (les) page (s) suivante (s).</small>`)}
      </div>
    </div>
    ${z('message', 'sp-message', 'Cet avis permet de régulariser votre prélèvement à la source réalisé en 2024 suite à votre déclaration des revenus effectuée en 2025.<br><br>Pour retrouver toutes les informations relatives à votre prélèvement à la source (taux, options…), rendez-vous sur le service « Gérer mon prélèvement à la source » de votre espace particulier.')}
  </div>

  <div class="sp-page">
    ${entFeuillet(1)}
    <div class="sp-nom">Déclarant 1 - Nom de naissance : ${c.noms[0].replace(/^(M\.|MME) /, '')}</div>
    ${z('situation', 'sp-grille g5', `<span class="th">situation du foyer</span><span class="th">cas particulier</span><span class="th">enfants majeurs célibataires</span><span class="th">enfants mariés</span><span class="th">personnes recueillies handicapées</span><span>${c.situation}</span><span>${c.casPart}</span><span></span><span></span><span></span>`)}
    <div class="sp-grille2">
      ${z('enfants', 'sp-grille g4', `<span class="bande">RÉSIDENCE EXCLUSIVE</span><span class="bande">RÉSIDENCE ALTERNÉE</span><span class="th">enfants mineurs ou handicapés</span><span class="th">dont enfants handicapés</span><span class="th">enfants mineurs ou handicapés</span><span class="th">dont enfants handicapés</span><span>${c.exclusifs}</span><span></span><span>${c.alternes}</span><span></span>`)}
      ${z('parts', 'sp-grille g1', `<span class="th haut">NOMBRE DE PARTS</span><span>${c.parts}</span>`)}
    </div>
    <div class="sp-colonnes ${deux ? 'deux' : ''}">
      ${z('revenus', 'sp-bloc', `<div class="sp-l gras"><span>Détail des revenus</span><span class="n">Déclar. 1</span>${deux ? '<span class="n">Déclar. 2</span>' : '<span class="n"></span>'}<span class="n t">Total</span></div>` + c.revenus.map((r, i) => ligne(r.lib + '…………', r.v, r.total != null ? n0(r.total) : null)).join(''))}
      ${z('imposable', 'sp-bloc', ligne('<b>Revenu brut global………</b>', null, `<b>${n0(c.rbg)}</b>`) + ligne('<b>Revenu imposable………</b>', null, `<b>${n0(c.imposable)}</b>`))}
      ${z('impot', 'sp-bloc', ligne('Impôt sur les revenus soumis au barème <sup>14</sup>', null, n0(c.bareme)) + (c.reductions ? ligne('Réductions d’impôt (dons)', null, '- ' + n0(c.reductions)) : '') + ligne('Montant net de votre imposition………', null, n0(c.net)) + '<div class="sp-sous">IMPOT NET</div>' + ligne('Total de l’impôt sur le revenu net………', null, n0(c.net)))}
      ${z('solde', 'sp-bloc', '<div class="sp-sous">CALCUL DU SOLDE DE VOTRE IMPOT POUR 2024 :</div><div class="sp-sous">IMPOT SUR LE REVENU</div>' + ligne('Impôt sur le revenu 2024 dû <sup>53</sup> :', null, n0(c.net)) + ligne('Retenue à la source prélevée en 2024 par vos verseurs de revenus :', null, '- ' + n0(c.retenue)) + ligne('<b>Solde d’impôt sur les revenus 2024 :</b>', null, `<b>${c.solde < 0 ? '- ' : ''}${n0(c.solde)}</b>`) +
        `<p class="sp-maj">${rembourse ? `COMPTE TENU DES ELEMENTS QUE VOUS AVEZ DECLARES, LE MONTANT QUI VOUS SERA REMBOURSE (voir notice) EST DE <b>${n0(c.solde)}</b><br>CE REMBOURSEMENT EST AUTOMATIQUE, VOUS N’AVEZ AUCUNE DEMARCHE A FAIRE.<br>Vous n’êtes pas imposable à l’impôt sur le revenu.` : `LE MONTANT RESTANT A PAYER EST DE <b>${n0(c.solde)}</b>`}</p>`)}
      ${z('rfr2', 'sp-bloc', '<div class="sp-sous">INFORMATIONS COMPLEMENTAIRES</div>' + ligne('<b>Revenu fiscal de référence <sup>25</sup>………</b>', null, `<b>${n0(c.imposable)}</b>`))}
      ${z('per', 'sp-bloc', `<div class="sp-sous">PLAFOND EPARGNE RETRAITE</div><p class="sp-petit">Le plafond disponible pour la déduction des cotisations versées en 2025, pour la déclaration des revenus à souscrire en 2026 est de :</p>` + ligne('Plafond pour les cotisations versées en 2025', c.perTotal, null, true) + '<p class="sp-petit">LA SUITE DE CET AVIS EST CI-JOINTE</p>')}
    </div>
    ${z('reclamation', 'sp-reclam', 'Si vous souhaitez contester le montant de votre impôt, vous pouvez effectuer une réclamation sur votre messagerie sécurisée ou par courrier adressé à votre centre des finances publiques jusqu’au 31 décembre 2027 (dans les conditions prévues aux articles R* 190-1 et R* 196-1 du livre des procédures fiscales).')}
  </div>

  <div class="sp-page court">
    ${entFeuillet(2)}
    <div class="sp-colonnes ${deux ? 'deux' : ''}">
      ${z('per', 'sp-bloc', '<p class="sp-petit">>>> Suite de votre avis</p>' + c.per.map(r => ligne(r.lib + '……', r.v)).join('') + ligne('<b>Plafond pour les cotisations versées en 2025……</b>', c.perTotal))}
      ${z('pas2025', 'sp-bloc', '<div class="sp-sous">PRELEVEMENT A LA SOURCE 2025</div><p class="sp-petit">Pour consulter ou moduler votre taux de PAS et retrouver l’ensemble de vos informations, rendez-vous dans votre espace particulier, rubrique « Gérer mon prélèvement à la source ».</p>')}
    </div>
  </div>
  </div>`;
}
function explicAvis() {
  const zz = AVIS_ZONES.find(x => x.id === U.zoneAvis), c = casAvis();
  if (!zz) return '<h4>👈 Touchez une zone de l’avis</h4><p>Ou choisissez ci-dessus ce que vous cherchez : la zone s’encadre et son explication s’affiche ici. Commencez par le grand cadre bleu (remboursé ou à payer), puis le revenu fiscal de référence et le nombre de parts.</p>';
  return `<small>📍 Où le lire : ${esc(zz.ou)}</small><h4>${esc(typeof zz.nom === 'function' ? zz.nom(c) : zz.nom)}</h4><div class="explic-corps">${zz.explic(c)}</div>`;
}

/* ---------- les parts : la garde alternée compte pour moitié ---------- */
function calculParts(o) {
  let p = o.couple ? 2 : 1, rang = 0;
  const valeur = () => (++rang <= 2 ? .5 : 1);
  for (let i = 0; i < o.exclusifs; i++) p += valeur();
  for (let i = 0; i < o.alternes; i++) p += valeur() / 2;      /* résidence alternée : la moitié, comptée après les enfants à charge exclusive */
  if (!o.couple && o.isole) p += o.exclusifs > 0 ? .5 : o.alternes > 0 ? .25 : 0;
  if (o.invalide) p += .5;
  return p;
}
function aideParts() {
  const o = U.partsAide || (U.partsAide = { couple: false, exclusifs: 0, alternes: 0, isole: false, invalide: false });
  return `<details class="plus-d aide-parts" ${U.partsOuvert ? 'open' : ''}><summary>🧮 Calculer mon nombre de parts (garde alternée comprise)</summary>
    <div class="champs" style="margin-top:10px">
      <div class="champ"><label for="apSit">Situation</label><select id="apSit" data-parts="couple"><option value="0" ${!o.couple ? 'selected' : ''}>Seul·e (célibataire, divorcé·e, séparé·e, veuf·ve)</option><option value="1" ${o.couple ? 'selected' : ''}>En couple marié ou pacsé</option></select></div>
      <div class="champ"><label for="apExcl">Enfants à charge (vivant chez moi)</label><input id="apExcl" type="number" min="0" max="10" value="${o.exclusifs}" data-parts="exclusifs"></div>
      <div class="champ"><label for="apAlt">Enfants en garde alternée</label><input id="apAlt" type="number" min="0" max="10" value="${o.alternes}" data-parts="alternes"></div>
      <div class="champ"><span class="lab">Cas particuliers</span>
        <label class="check"><input type="checkbox" data-parts="isole" ${o.isole ? 'checked' : ''} ${o.couple ? 'disabled' : ''}><span class="lib">Je vis seul·e avec mes enfants (parent isolé, case T)</span></label>
        <label class="check"><input type="checkbox" data-parts="invalide" ${o.invalide ? 'checked' : ''}><span class="lib">Carte d’invalidité dans le foyer (+0,5, simplifié)</span></label></div>
    </div>
    <div class="resultat-parts" id="resParts">${resParts()}</div>
    <p class="petit-texte">Règles : 1 part par adulte seul, 2 pour un couple ; +0,5 pour chacun des deux premiers enfants, +1 à partir du troisième ; un enfant en <b>garde alternée</b> compte pour <b>la moitié</b> (0,25 pour les deux premiers, 0,5 ensuite). Cas particuliers simplifiés : vérifiez sur impots.gouv.fr.</p>
  </details>`;
}
function resParts() {
  const p = calculParts(U.partsAide);
  return `<b>${nb(p, 2)} part${p > 1 ? 's' : ''}</b><button type="button" class="btn petit" data-parts-appliquer="1">Utiliser ce nombre dans le calcul</button>`;
}

/* ---------- les sections de la page ---------- */
function vueDocsImpots() {
  return `<section class="bloc"><h3 class="bloc-titre">📄 Les documents des impôts</h3>
    <p class="petit-texte" style="margin:-6px 0 12px">Ce que l’on reçoit (ou remplit), à quoi ça ressemble et à quoi ça sert. Touchez un document pour l’agrandir. Exemples fictifs et simplifiés : les vrais documents ont plus de rubriques.</p>
    <div class="docs-impots">${DOCS_IMPOTS.map(d => `<button type="button" class="doc-carte" data-doc-impot="${d.id}">
      ${apercuDoc(d)}
      <span class="doc-texte"><span class="meta"><span class="badge">🗓️ ${esc(d.quand)}</span></span><b>${d.e} ${esc(d.nom)}</b><small>${esc(d.ref)}</small><span>${esc(d.role)}</span></span></button>`).join('')}</div>
  </section>
  <section class="bloc"><h3 class="bloc-titre">🗓️ Dans quel ordre ça se passe ?</h3>
    <ol class="frise-impots">${ETAPES_IMPOTS.map((et, i) => `<li style="--i:${i}"><span class="pastille-f">${et.e}</span><div><small>${esc(et.quand)}</small><b>${esc(et.titre)}</b><p>${esc(et.txt)}</p>${et.doc ? `<button type="button" class="lien-discret" data-doc-impot="${et.doc}">Voir le document →</button>` : ''}</div></li>`).join('')}</ol>
  </section>
  <section class="bloc" id="lireAvis"><h3 class="bloc-titre">🔍 Lire son avis d’imposition, zone par zone</h3>
    <p class="petit-texte" style="margin:-6px 0 12px">Un avis présenté exactement comme le vrai (page de garde, feuillets 1 et 2), avec des informations entièrement inventées. Choisissez un exemple, puis touchez une zone ou ce que vous cherchez :</p>
    <div class="sous-onglets">${Object.entries(CAS_AVIS).map(([k, c]) => `<button type="button" class="puce ${(U.casAvis || 'seul') === k ? 'actif' : ''}" data-cas-avis="${k}">${esc(c.nom)}</button>`).join('')}</div>
    <div class="ou-lire">${OU_LIRE.map(o => `<button type="button" class="puce ${U.zoneAvis === o[2] ? 'actif' : ''}" data-ou-lire="${o[2]}">${o[0]} ${esc(o[1])}</button>`).join('')}</div>
    <div class="paie-ex"><div>${avisFictif()}</div><aside class="paie-explic" id="explicAvis" aria-live="polite">${explicAvis()}</aside></div>
    <div class="note douce"><span class="e">✅</span><div><b>Les 4 vérifications à faire en recevant son avis :</b> la situation de famille et le nombre de parts correspondent-ils à votre foyer ? Les revenus sont-ils ceux de votre fiche de paie de décembre (net imposable cumulé) ? Les dons, frais de garde, emploi à domicile sont-ils bien comptés ? Le solde est-il cohérent avec ce qui a été prélevé ? Une erreur : corrigez en ligne, ou faites une réclamation depuis votre espace.</div></div>
  </section>`;
}
function ficheDocImpot(id) {
  const d = DOCS_IMPOTS.find(x => x.id === id);
  ouvrirModale(`<h3 id="modaleTitre"><span>${d.e}</span>${esc(d.nom)}</h3><p class="sous">${esc(d.ref)} · ${esc(d.quand)}</p>
    <div class="doc-modale">${apercuDoc(d, true)}<div>
      <h4>À quoi ça sert</h4><p>${esc(d.role)}</p>
      <h4>Que faire quand on le reçoit</h4><p>${esc(d.faire)}</p>
      ${d.id === 'avis' ? '<button type="button" class="btn petit" data-vers-avis="1">🔍 Le lire zone par zone</button>' : ''}
    </div></div>
    <p class="petit-texte">Exemple fictif et simplifié : la présentation des vrais documents évolue d’une année à l’autre. Les originaux se trouvent dans votre espace particulier sur impots.gouv.fr.</p>
    <div class="pied-fen"><div class="droite"><button type="button" class="btn" data-f="annuler">Fermer</button></div></div>`, null, true);
}

/* ---------- les gestes ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-doc-impot],[data-zone-avis],[data-parts-appliquer],[data-vers-avis],[data-ou-lire],[data-cas-avis]'); if (!t) return;
  if (t.dataset.casAvis) { U.casAvis = t.dataset.casAvis; const y = scrollY; rendre(); scrollTo(0, y); return; }
  if (t.dataset.ouLire) {
    U.zoneAvis = t.dataset.ouLire;
    $$('[data-ou-lire]').forEach(x => x.classList.toggle('actif', x === t));
    $$('[data-zone-avis]').forEach(x => x.classList.toggle('choisie', x.dataset.zoneAvis === U.zoneAvis));
    if (innerWidth < 820) { const a = $('#explicAvis'); if (a) { a.innerHTML = explicAvis(); a.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    const a = $('#explicAvis'); if (a) a.innerHTML = explicAvis();
    const zz = $(`[data-zone-avis="${U.zoneAvis}"]`); if (zz) zz.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (t.dataset.partsAppliquer) {
    const n = calculParts(U.partsAide), c = $('#calcParts'); U.calc.parts = n;
    if (c) { c.value = n; majCalcul(); toast(`Calcul mis à jour avec ${nb(n, 2)} parts.`); }
    return;
  }
  if (t.dataset.versAvis) { fermerModale(); const a = $('#lireAvis'); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  if (t.dataset.docImpot) return ficheDocImpot(t.dataset.docImpot);
  U.zoneAvis = t.dataset.zoneAvis;
  $$('[data-zone-avis]').forEach(x => x.classList.toggle('choisie', x.dataset.zoneAvis === U.zoneAvis));
  $$('[data-ou-lire]').forEach(x => x.classList.toggle('actif', x.dataset.ouLire === U.zoneAvis));
  const a = $('#explicAvis'); if (a) { a.innerHTML = explicAvis(); if (innerWidth < 820) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
});
function majParts(el) {
  const o = U.partsAide, k = el.dataset.parts;
  if (el.type === 'checkbox') o[k] = el.checked;
  else if (k === 'couple') { o.couple = el.value === '1'; if (o.couple) o.isole = false; U.partsOuvert = true; const y = scrollY; rendre(); scrollTo(0, y); return; }
  else o[k] = Math.max(0, Math.min(10, parseInt(el.value, 10) || 0));
  const r = $('#resParts'); if (r) r.innerHTML = resParts();
}
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.parts && e.target.type === 'number') majParts(e.target); });
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.parts && e.target.type !== 'number') majParts(e.target); });
