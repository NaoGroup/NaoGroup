'use strict';
/* ============================================================
   NaoBaby — la grossesse : accueil, semaines, rendez-vous,
   planning & démarches, journal, jalons, listes, prénoms, chambre
   ============================================================ */

/* bébé semaine après semaine — des comparaisons tendres, rien de médical */
const FRUITS = [null,
  ['✨', 'une promesse'], ['✨', 'une promesse'], ['🌱', 'une toute petite graine'], ['🌱', 'une graine de pavot'],
  ['🌾', 'un grain de sésame'], ['🫘', 'une lentille'], ['🫐', 'une myrtille'], ['🍇', 'un grain de raisin'],
  ['🍒', 'une cerise'], ['🍓', 'une fraise'], ['🌰', 'une noix'], ['🍋', 'un citron vert'],
  ['🍑', 'une pêche'], ['🍋', 'un citron'], ['🍎', 'une pomme'], ['🥑', 'un avocat'],
  ['🍐', 'une poire'], ['🫑', 'un poivron'], ['🥭', 'une mangue'], ['🍌', 'une banane'],
  ['🥕', 'une carotte'], ['🌽', 'un épi de maïs'], ['🍆', 'une aubergine'], ['🥥', 'une noix de coco'],
  ['🥦', 'un chou-fleur'], ['🥬', 'une laitue'], ['🥬', 'un beau chou'], ['🥒', 'un grand concombre'],
  ['🎃', 'une courge butternut'], ['🍈', 'un petit melon'], ['🍍', 'un ananas'], ['🍈', 'un melon'],
  ['🍍', 'un gros ananas'], ['🍈', 'un melon miel'], ['🥬', 'une romaine'], ['🥬', 'une grosse romaine'],
  ['🍉', 'une petite pastèque'], ['🍉', 'une pastèque'], ['🎃', 'une citrouille'], ['🎃', 'une belle citrouille'],
  ['🎃', 'une belle citrouille'], ['🎃', 'une belle citrouille']];
const HUMEURS_TRI = {
  1: 'Le début d’une grande aventure. Prenez le temps, à votre rythme — tout se met en place doucement.',
  2: 'Souvent un trimestre plus léger : un bon moment pour préparer, rêver et partager la nouvelle.',
  3: 'La dernière ligne droite : on prépare le nid, et on se repose dès qu’on le peut.',
};
function ideeSemaine(s) {
  if (s <= 8) return ['📝', 'Notez vos premières émotions dans le journal : vous aimerez tant les relire plus tard.'];
  if (s <= 13) return ['🏥', 'Pensez à l’inscription à la maternité et à noter vos premiers rendez-vous.'];
  if (s <= 17) return ['✍️', 'Un joli moment pour commencer la liste des prénoms, à deux.'];
  if (s <= 21) return ['🎁', 'Commencez la liste de naissance, tranquillement, sans rien presser.'];
  if (s <= 25) return ['🎉', 'Et si vous prépariez la baby shower ou la gender reveal ?'];
  if (s <= 29) return ['🛏️', 'La chambre peut commencer à prendre forme : couleurs, meubles, budget.'];
  if (s <= 33) return ['🧳', 'Préparez la valise maternité petit à petit, sans vous presser.'];
  if (s <= 36) return ['🗺️', 'Repérez le trajet vers la maternité et gardez les numéros utiles à portée de main.'];
  return ['🌙', 'Tout est prêt, ou presque. Reposez-vous : le grand jour approche.'];
}

const RDV_TYPES = {
  sagefemme: ['🤱', 'Sage-femme'], gyneco: ['🩺', 'Gynécologue'], echo: ['🌙', 'Échographie'], sang: ['🧪', 'Prise de sang'],
  prepa: ['🧘', 'Préparation à la naissance'], maternite: ['🏥', 'Maternité'], anesth: ['💤', "Consultation d'anesthésie"],
  pediatre: ['🧸', 'Pédiatre / médecin de bébé'], admin: ['📋', 'Démarche'], autre: ['📌', 'Autre suivi'],
};
const RAPPELS = [['', 'Aucun rappel'], ['0', 'Le jour même'], ['1', 'La veille'], ['2', 'Deux jours avant'], ['7', 'Une semaine avant']];

const JALONS = [
  { k: 'annonce', em: '💌', t: "L'annonce de la grossesse" }, { k: 'declaration', em: '📝', t: 'Déclaration de grossesse' },
  { k: 'echo1', em: '🌙', t: 'Première échographie' }, { k: 'coeur', em: '💓', t: 'Premier battement de cœur entendu' },
  { k: 'mouvements', em: '🦋', t: 'Premiers mouvements ressentis' }, { k: 'sexe', em: '🎀', t: 'Le sexe de bébé découvert' },
  { k: 'prenom', em: '✍️', t: 'Le choix du prénom' }, { k: 'tenue', em: '👕', t: 'Achat de la première tenue' },
  { k: 'chambre', em: '🛏️', t: 'Préparation de la chambre' }, { k: 'shower', em: '🎉', t: 'La baby shower' },
  { k: 'valise', em: '🧳', t: 'Valise maternité bouclée' },
];
const EMOTIONS = [['heureuse', '😊 Heureux·se'], ['emue', '🥰 Ému·e'], ['sereine', '😌 Serein·e'], ['impatiente', '🤩 Impatient·e'],
  ['fatiguee', '😴 Fatigué·e'], ['nostalgique', '🥹 Nostalgique'], ['inquiete', '😟 Un peu inquiet·e']];
const EMO = Object.fromEntries(EMOTIONS);

/* ---------- Planning : quoi faire, et quand (France, à titre indicatif) ---------- */
const CAT_PLAN = { suivi: ['🩺', 'Suivi'], admin: ['📋', 'Démarches'], prepa: ['🌿', 'Préparation'], bebe: ['🍼', 'Pour bébé'] };
function congeMat() {
  const nb = actifs().length || 1, aines = Number(P().aines) || 0;
  let avant = 6, apres = 10;
  if (nb >= 3) { avant = 24; apres = 22; } else if (nb === 2) { avant = 12; apres = 22; } else if (aines >= 2) { avant = 8; apres = 18; }
  const dpa = lire(P().dpa);
  return { avant, apres, total: avant + apres, debut: dpa ? plus(dpa, -avant * 7) : null, fin: dpa ? plus(dpa, apres * 7) : null };
}
const congePat = () => (actifs().length > 1 ? 32 : 25);
function planning() {
  const c = congeMat();
  const G = [
    { id: 'suivi1', sa: 8, cat: 'suivi', t: 'Premier rendez-vous de suivi de grossesse', d: "Avec votre sage-femme, votre gynécologue ou votre médecin. C'est souvent lors de ce rendez-vous qu'est établie la déclaration de grossesse." },
    { id: 'mater', sa: 11, cat: 'admin', t: "S'inscrire à la maternité", d: 'Dans certaines villes les places partent vite : renseignez-vous tôt auprès de la maternité choisie.' },
    { id: 'echo1', sa: 12, cat: 'suivi', t: 'Première échographie (autour de 11 à 13 SA)', d: 'Le calendrier exact est fixé par votre professionnel de santé.' },
    { id: 'decl', sa: 14, cat: 'admin', t: 'Déclaration de grossesse (avant la fin du 3ᵉ mois)', d: "Généralement transmise en ligne par le professionnel à l'Assurance Maladie et à la CAF. Vérifiez sur votre compte ameli qu'elle a bien été reçue.", lien: 'https://www.ameli.fr' },
    { id: 'employeur', sa: 16, cat: 'admin', t: 'Informer votre employeur', d: "Aucune date n'est imposée par la loi. L'informer (courrier remis en main propre ou recommandé, avec un certificat de grossesse) permet de bénéficier des droits liés à la grossesse." },
    { id: 'epp', sa: 16, cat: 'suivi', t: 'Entretien prénatal précoce', d: "Proposé à partir du 4ᵉ mois avec une sage-femme ou un médecin : un temps d'échange sur vos besoins, vos questions et votre projet." },
    { id: 'garde', sa: 18, cat: 'admin', t: 'Chercher un mode de garde', d: 'Crèche, assistante maternelle… Les demandes se font souvent dès le 6ᵉ mois, parfois avant. Renseignez-vous auprès de votre mairie ou sur monenfant.fr.', lien: 'https://monenfant.fr' },
    { id: 'reco', sa: 20, cat: 'admin', t: 'Couple non marié : reconnaissance anticipée', d: "Elle se fait en mairie, à tout moment avant la naissance. Pour un couple de femmes ayant eu recours à une AMP, renseignez-vous sur la reconnaissance conjointe anticipée.", lien: 'https://www.service-public.fr' },
    { id: 'listeN', sa: 20, cat: 'bebe', t: 'Commencer la liste de naissance', d: 'Pour que vos proches puissent vous gâter sans doublons.', go: ['grossesse', 'listes', 'naissance'] },
    { id: 'echo2', sa: 22, cat: 'suivi', t: 'Deuxième échographie (autour de 20 à 24 SA)', d: 'La date est fixée avec votre professionnel de santé.' },
    { id: 'prepa', sa: 24, cat: 'prepa', t: 'Commencer la préparation à la naissance', d: '8 séances avec une sage-femme sont prises en charge par l’Assurance Maladie : classique, yoga, piscine, haptonomie… Choisissez ce qui vous ressemble.' },
    { id: 'conges', sa: 24, cat: 'admin', t: 'Organiser les congés de naissance', d: `Congé maternité indicatif : ${c.avant} semaines avant et ${c.apres} semaines après la date prévue${c.debut ? ` (du ${dateMoy(c.debut)} au ${dateMoy(c.fin)})` : ''}. Congé de paternité et d'accueil de l'enfant : ${congePat()} jours, plus 3 jours de congé de naissance. À confirmer avec l'Assurance Maladie et votre employeur.` },
    { id: 'chambre', sa: 26, cat: 'bebe', t: 'Préparer la chambre de bébé', d: 'Couleurs, meubles, budget : tout se prépare dans l’espace Chambre.', go: ['grossesse', 'chambre'] },
    { id: 'prime', sa: 28, cat: 'admin', t: 'Prime à la naissance (CAF)', d: 'Sous conditions de ressources, elle est versée en fin de grossesse (vers le 7ᵉ mois) lorsque la grossesse a été déclarée. Vérifiez vos droits sur caf.fr.', lien: 'https://www.caf.fr' },
    { id: 'mutuelle', sa: 30, cat: 'admin', t: 'Prévenir votre mutuelle', d: "Pour connaître la prise en charge de la chambre particulière et préparer l'ajout de bébé." },
    { id: 'nom', sa: 30, cat: 'admin', t: 'Choisir le nom de famille de bébé', d: 'Une déclaration conjointe de choix de nom peut être remise lors de la déclaration de naissance.', lien: 'https://www.service-public.fr' },
    { id: 'echo3', sa: 32, cat: 'suivi', t: 'Troisième échographie (autour de 30 à 34 SA)', d: 'La date est fixée avec votre professionnel de santé.' },
    { id: 'anesth', sa: 33, cat: 'suivi', t: "Consultation d'anesthésie", d: "Proposée par la maternité en fin de grossesse, en général au 8ᵉ mois, même sans projet de péridurale." },
    { id: 'medecinBb', sa: 32, cat: 'bebe', t: 'Choisir un médecin ou un pédiatre pour bébé', d: 'Pour être prêts dès la sortie de la maternité.' },
    { id: 'valise', sa: 34, cat: 'bebe', t: 'Préparer la valise maternité', d: 'Pour la maman, pour bébé et pour l’accompagnant.', go: ['grossesse', 'listes', 'valise'] },
    { id: 'siege', sa: 35, cat: 'bebe', t: 'Installer le siège auto', d: 'Faites un essai d’installation avant le jour J.' },
    { id: 'trajet', sa: 35, cat: 'prepa', t: 'Repérer le trajet vers la maternité', d: 'Adresse, entrée de nuit, stationnement, numéros utiles.', go: ['accouchement', 'preparer'] },
  ];
  const nee = nes()[0];
  const base = nee ? lire(nee.naissance.date) : (P().dpa ? lire(P().dpa) : null);
  const N = [
    { id: 'n-mairie', j: 5, cat: 'admin', t: 'Déclarer la naissance à la mairie (dans les 5 jours)', d: "Le jour de l'accouchement n'est pas compté. C'est souvent possible directement à la maternité. Le livret de famille est mis à jour à cette occasion.", lien: 'https://www.service-public.fr' },
    { id: 'n-pat', j: 3, cat: 'admin', t: 'Congé de naissance et congé de paternité', d: `3 jours de congé de naissance, puis ${congePat()} jours de congé de paternité et d'accueil de l'enfant (dont 4 jours pris tout de suite après).` },
    { id: 'n-exam', j: 8, cat: 'suivi', t: 'Premier examen de bébé (dans les 8 premiers jours)', d: 'Souvent réalisé à la maternité. Il figure dans le carnet de santé.' },
    { id: 'n-caf', j: 15, cat: 'admin', t: 'Déclarer la naissance à la CAF', d: 'Pour la prestation d’accueil du jeune enfant (PAJE), selon vos droits.', lien: 'https://www.caf.fr' },
    { id: 'n-secu', j: 15, cat: 'admin', t: 'Rattacher bébé à l’Assurance Maladie', d: 'Inscription sur le compte ameli d’un parent, ou des deux.', lien: 'https://www.ameli.fr' },
    { id: 'n-mut', j: 20, cat: 'admin', t: 'Ajouter bébé à la mutuelle', d: 'Avec l’acte de naissance.' },
    { id: 'n-empl', j: 20, cat: 'admin', t: 'Prévenir votre employeur de la naissance', d: 'Et vous renseigner, si vous le souhaitez, sur le congé parental.' },
    { id: 'n-garde', j: 30, cat: 'admin', t: 'Confirmer le mode de garde', d: 'Et vérifier vos droits au complément de libre choix du mode de garde (CMG) sur caf.fr.', lien: 'https://www.caf.fr' },
    { id: 'n-epn', j: 35, cat: 'suivi', t: 'Entretien postnatal précoce', d: "Entre la 4ᵉ et la 8ᵉ semaine après l'accouchement, avec une sage-femme ou un médecin : pour parler de vous, de votre récupération et de votre moral." },
    { id: 'n-impots', j: 60, cat: 'admin', t: 'Impôts : signaler la naissance (dans les 60 jours)', d: 'Sur impots.gouv.fr → « Gérer mon prélèvement à la source » → « Déclarer un changement de situation ». Puis ajoutez l’enfant à charge lors de la prochaine déclaration de revenus.', lien: 'https://www.impots.gouv.fr' },
    { id: 'n-postnat', j: 50, cat: 'suivi', t: 'Consultation postnatale (6 à 8 semaines après)', d: 'Avec votre sage-femme, votre gynécologue ou votre médecin.' },
  ];
  return {
    avant: aProfil() ? G.map(x => ({ ...x, date: dateSA(x.sa), fait: !!S.demarches[x.id] })) : [],
    apres: base ? N.map(x => ({ ...x, date: plus(base, x.j), fait: !!S.demarches[x.id], estime: !nee })) : [],
  };
}

/* ---------- Listes par défaut ---------- */
function listesParDefaut() {
  const nb = actifs().length || 1, x = n => n * nb;
  const A = [
    ['Vêtements', 'Bodies naissance', x(6)], ['Vêtements', 'Pyjamas', x(6)], ['Vêtements', 'Gigoteuses', x(2)], ['Vêtements', 'Bonnets de naissance', x(1)], ['Vêtements', 'Gilets', x(2)],
    ['Sommeil', nb > 1 ? 'Lits ou berceaux' : 'Lit ou berceau', x(1)], ['Sommeil', 'Matelas adaptés', x(1)], ['Sommeil', 'Draps housses', x(3)], ['Sommeil', 'Babyphone', 1],
    ['Balade', nb === 2 ? 'Poussette double' : nb > 2 ? 'Poussette pour ' + nb : 'Poussette', 1], ['Balade', 'Porte-bébé ou écharpe', 1],
    ['Voiture', nb > 1 ? 'Sièges auto' : 'Siège auto', x(1)],
    ['Repas', 'Biberons', x(4)], ['Repas', 'Goupillon et égouttoir', 1], ['Repas', 'Bavoirs', x(4)], ['Repas', "Coussin d'allaitement", 1],
    ['Bain', 'Baignoire ou transat de bain', 1], ['Bain', 'Thermomètre de bain', 1], ['Bain', 'Capes de bain', x(2)],
    ['Change', 'Table ou matelas à langer', 1], ['Change', 'Couches taille 1', 1], ['Change', 'Liniment ou eau nettoyante', 1], ['Change', 'Carrés de coton', 1],
    ['Soins', 'Trousse de soins bébé', 1], ['Soins', 'Brosse douce', 1], ['Soins', 'Ciseaux à ongles bébé', 1],
    ['Chambre & déco', 'Veilleuse', 1], ['Chambre & déco', 'Rideaux occultants', 1], ['Chambre & déco', 'Commode', 1], ['Chambre & déco', 'Mobile ou déco murale', 1],
  ];
  const Vl = [
    ['documents', "Pièce d'identité"], ['documents', 'Carte Vitale et carte de mutuelle'], ['documents', 'Dossier de suivi, échographies et résultats'],
    ['documents', 'Livret de famille ou reconnaissance anticipée'], ['documents', 'Projet de naissance'],
    ['maman', 'Chemises de nuit ou grands t-shirts (×3)'], ['maman', 'Robe de chambre et chaussons'], ['maman', "Soutiens-gorge d'allaitement"],
    ['maman', 'Culottes confortables'], ['maman', 'Trousse de toilette'], ['maman', 'Serviettes de toilette'], ['maman', 'Brumisateur'],
    ['maman', 'Tenue de sortie confortable'], ['maman', 'Chargeur de téléphone'], ['maman', "Encas et bouteille d'eau"],
    ['bebe', `Bodies (×${x(6)})`], ['bebe', `Pyjamas (×${x(6)})`], ['bebe', 'Bonnets'], ['bebe', 'Chaussettes'], ['bebe', `Gilets (×${x(2)})`],
    ['bebe', 'Gigoteuse'], ['bebe', 'Capes de bain'], ['bebe', 'Couverture pour le retour'], ['bebe', 'Tenue de sortie'],
    ['accomp', 'Tenue de rechange'], ['accomp', 'Encas'], ['accomp', 'Monnaie pour le parking'], ['accomp', 'Appareil photo'], ['accomp', 'Playlist douce'], ['accomp', 'Chargeur'],
  ];
  return {
    achats: A.map(([cat, nom, qte]) => ({ id: uid(), cat, nom, qte, prix: '', fait: false })),
    valise: Vl.map(([pour, nom]) => ({ id: uid(), pour, nom, fait: false })),
  };
}
const CATS_ACHATS = ['Vêtements', 'Sommeil', 'Balade', 'Voiture', 'Repas', 'Bain', 'Change', 'Soins', 'Chambre & déco', 'Autre'];
const POUR_VALISE = { documents: '📂 Documents', maman: '🤍 Pour la maman', bebe: '🍼 Pour bébé', accomp: '💞 Pour l’accompagnant·e' };
const STATUT_LN = { souhaite: ['🤍', 'Souhaité', ''], reserve: ['🎀', 'Réservé', 'att'], recu: ['🎁', 'Reçu', 'ok'] };

/* ============================================================
   Accueil
   ============================================================ */
PAGES.accueil = () => {
  if (!aProfil()) return accueilBienvenue();
  if (P().mode === 'perte') return PAGES.souvenir();
  if (estNe()) return PAGES.accueilBebe();
  const g = etatGrossesse();
  const [fe, fn] = FRUITS[Math.min(42, g.semaine)];
  const [ie, it] = ideeSemaine(g.semaine);
  const perles = Array.from({ length: 40 }, (_, i) =>
    `<i class="perle ${i < g.semaine - 1 ? 'faite' : ''} ${i === g.semaine - 1 ? 'now' : ''}" title="Semaine ${i + 1}"></i>`).join('');
  const r = g.restant;
  const rebours = r >= 0
    ? `<div class="compteur"><b>${r}</b><span>jours</span></div><div class="compteur"><b>${Math.floor(r / 7)}<small style="font-size:16px"> sem.</small> ${r % 7}<small style="font-size:16px"> j</small></b><span>avant le terme</span></div><div class="compteur"><b>${Math.round(g.pct)}<small style="font-size:16px">%</small></b><span>du chemin</span></div>`
    : `<div class="compteur" style="grid-column:1/-1"><b>✨</b><span>La date prévue est passée depuis ${pluriel(-r, 'jour')} — la maternité vous accompagne</span></div>`;
  const ev = prochainEvent();
  return `
  <section class="carte hero" aria-label="Mon petit calendrier de grossesse">
    <div>
      <h2>🗓️ Mon petit calendrier de grossesse</h2>
      <div class="sem">Semaine <span>${g.semaine}</span> sur 40</div>
      <div class="sa">${g.sa} SA + ${g.j} j · ${er(g.mois)}${g.mois === 1 ? '' : 'ᵉ'} mois · ${g.trimestre === 1 ? '1ᵉʳ' : g.trimestre + 'ᵉ'} trimestre</div>
      <div class="perles" aria-hidden="true">${perles}</div>
      <div class="trimestres"><span>1ᵉʳ trimestre</span><span>2ᵉ trimestre</span><span>3ᵉ trimestre</span></div>
      <div class="rebours">${rebours}</div>
      <div class="idee"><span class="em">📅</span><div>Date prévue : <b style="color:var(--titre)">${dateLongue(g.dpa)}</b>${P().maternite ? ` · ${esc(P().maternite)}` : ''}</div></div>
    </div>
    <div class="bulle-bebe">
      <div class="orbe"><span class="fruit">${fe}</span></div>
      <p>Cette semaine, ${actifs().length > 1 ? `chacun de ${motBebe()} a` : 'bébé a'} à peu près la taille d’<b>${fn.replace(/^une? /, m => m)}</b>.</p>
      <p style="font-size:13.5px">${HUMEURS_TRI[g.trimestre]}</p>
      <div class="idee" style="text-align:left"><span class="em">${ie}</span><div>${it}</div></div>
    </div>
  </section>

  <div class="actions-rapides">
    <button class="btn plein" data-act="add-souvenir"><span class="plus">＋</span> Ajouter un souvenir</button>
    <button class="btn plein" data-act="add-rdv"><span class="plus">＋</span> Ajouter un rendez-vous</button>
    <button class="btn plein" data-act="add-ln"><span class="plus">＋</span> Ajouter à la liste naissance</button>
    <button class="btn plein" data-act="go" data-p="grossesse" data-s="evenements"><span class="plus">＋</span> Préparer un événement</button>
    ${revelable() ? '<button class="btn" data-act="reveler">🎀 Découvrir le sexe de bébé</button>' : ''}
  </div>

  <div class="grille">
    ${carteRdv()}
    ${carteSouvenirs(g)}
    ${carteListeNaissance()}
    ${carteChambre()}
    ${carteValise()}
    ${carteEvenements(ev)}
    ${cartePrenoms()}
    ${carteEtapes()}
    ${etoiles().length ? carteEnPensee() : ''}
  </div>`;
};

function accueilBienvenue() {
  return `<section class="carte" style="text-align:center;padding:40px 26px;max-width:760px;margin:30px auto">
    <svg viewBox="0 0 40 40" style="width:96px;height:96px;border-radius:30px;box-shadow:0 22px 50px -18px var(--acc-lueur)"><use href="#nao-logo"/></svg>
    <h2 style="font-size:32px;margin-top:18px">Bienvenue dans Nao<span style="color:var(--acc)">Baby</span></h2>
    <p class="chapo" style="margin:10px auto 22px">Un carnet doux et élégant pour vivre votre grossesse semaine après semaine : les rendez-vous, les listes,
      les souvenirs, la baby shower, l'accouchement — puis les premiers mois de bébé. Tout reste sur cet ordinateur.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn plein" data-act="profil" style="font-size:15px;padding:13px 26px">✨ Créer notre carnet</button>
      <button class="btn" data-act="aide" style="font-size:15px;padding:13px 22px">❓ Comment ça marche</button></div>
    <p class="avert" style="margin-top:22px">NaoBaby est un outil d'organisation, d'information générale et de souvenirs. Il ne pose aucun diagnostic et ne remplace
      ni une sage-femme, ni un médecin, ni la maternité.</p>
  </section>`;
}

/* ---------- les cartes de l'accueil ---------- */
const carteT = (em, titre, compte = '') => `<div class="carte-t"><span class="em">${em}</span><h2>${titre}</h2>${compte ? `<span class="compte">${compte}</span>` : ''}</div>`;
const lien = (txt, p, s, x = '') => `<button class="lien-carte" data-act="go" data-p="${p}" ${s ? `data-s="${s}"` : ''} ${x ? `data-x="${x}"` : ''}>${txt} →</button>`;

function rdvAVenir() {
  const a = cle(auj());
  return S.rdv.filter(r => r.date >= a).sort((x, y) => (x.date + (x.heure || '')).localeCompare(y.date + (y.heure || '')));
}
function ligneRdv(r, actions = true) {
  const [em, nom] = RDV_TYPES[r.type] || RDV_TYPES.autre;
  const d = lire(r.date), n = ecart(auj(), d);
  return `<div class="ligne" data-act="edit-rdv" data-id="${r.id}" style="cursor:pointer"><span class="em">${em}</span>
    <div class="txt"><b>${esc(r.titre || nom)}</b><span>${cap(dateLongue(d))}${r.heure ? ' · ' + fmtH(r.heure) : ''}${r.avec ? ' · ' + esc(r.avec) : ''}${r.lieu ? ' · ' + esc(r.lieu) : ''}</span></div>
    ${n >= 0 ? `<span class="meta">${n === 0 ? "aujourd'hui" : n === 1 ? 'demain' : 'J-' + n}</span>` : r.note ? '<span class="pastille">📝 note</span>' : ''}
    ${actions ? `<div class="act"><button class="rond petit" data-act="ics-rdv" data-id="${r.id}" title="Ajouter à mon calendrier (.ics)">📲</button></div>` : ''}</div>`;
}
function carteRdv() {
  const l = rdvAVenir().slice(0, 4);
  return `<section class="carte">${carteT('🩺', 'Mes prochains rendez-vous', l.length ? pluriel(rdvAVenir().length, 'à venir', 'à venir') : '')}
    ${l.length ? l.map(r => ligneRdv(r, false)).join('') : '<div class="vide">Aucun rendez-vous à venir. Ajoutez le prochain pour recevoir un rappel.</div>'}
    <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="lien-carte" data-act="add-rdv">＋ Ajouter</button>${lien('Tous les rendez-vous', 'grossesse', 'rdv')}</div></section>`;
}
function carteSouvenirs(g) {
  const debut = cle(plus(g.debut, (g.semaine - 1) * 7));
  let l = S.journal.filter(j => j.date >= debut).sort((a, b) => b.date.localeCompare(a.date));
  const semaine = l.length > 0;
  if (!semaine) l = [...S.journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  return `<section class="carte">${carteT('💭', 'Mes souvenirs de la semaine', semaine ? pluriel(l.length, 'souvenir') : '')}
    ${!semaine && l.length ? '<div class="sous" style="margin-top:0">Rien encore cette semaine — vos derniers souvenirs :</div>' : ''}
    ${l.length ? l.slice(0, 3).map(j => `<div class="ligne" data-act="edit-souvenir" data-id="${j.id}" style="cursor:pointer">
      ${j.photo ? `<img src="${j.photo}" alt="" style="width:44px;height:44px;border-radius:12px;object-fit:cover;flex:none">` : `<span class="em">${(EMO[j.emotion] || '💭').split(' ')[0]}</span>`}
      <div class="txt"><b>${esc(j.titre || (j.texte || '').slice(0, 50) || 'Souvenir')}</b><span>${cap(dateCourte(lire(j.date)))}${j.important ? ' · ⭐ moment important' : ''}</span></div></div>`).join('')
      : '<div class="vide">Une émotion, une envie, une photo : gardez une trace de cette semaine.</div>'}
    <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="lien-carte" data-act="add-souvenir">＋ Ajouter un souvenir</button>${lien('Le journal', 'grossesse', 'journal')}</div></section>`;
}
function carteListeNaissance() {
  const l = S.naissance, rec = l.filter(x => x.statut === 'recu').length, res = l.filter(x => x.statut === 'reserve').length;
  return `<section class="carte">${carteT('🎁', 'Ma liste naissance', l.length ? pluriel(l.length, 'idée') : '')}
    ${l.length ? `<div class="mini-stat"><span><b>${l.length - rec - res}</b> souhaités</span><span><b>${res}</b> réservés</span><span><b>${rec}</b> reçus</span></div>
      <div class="jauge"><i style="width:${l.length ? (rec + res) / l.length * 100 : 0}%"></i></div>
      ${l.filter(x => x.statut === 'souhaite').slice(0, 3).map(x => `<div class="ligne"><span class="em">🤍</span><div class="txt"><b>${esc(x.nom)}</b></div>${x.prix ? `<span class="meta">${euros(x.prix)}</span>` : ''}</div>`).join('')}`
      : '<div class="vide">Les petites et grandes choses dont vous rêvez pour bébé, à partager avec vos proches.</div>'}
    <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="lien-carte" data-act="add-ln">＋ Ajouter</button>${lien('Voir la liste', 'grossesse', 'listes', 'naissance')}</div></section>`;
}
function carteChambre() {
  const c = S.chambre, dep = c.meubles.reduce((s, m) => s + nombre(m.prix), 0), b = nombre(c.budget);
  return `<section class="carte cliquable" data-act="go" data-p="grossesse" data-s="chambre">${carteT('🛏️', 'La chambre de bébé', c.meubles.length ? pluriel(c.meubles.filter(m => m.fait).length, 'meuble prêt', 'meubles prêts') : '')}
    <div class="nuancier" style="margin-bottom:10px">${c.couleurs.map(x => `<i style="width:38px;height:38px;border-radius:13px;background:${x};border:1px solid var(--bord-2);display:block"></i>`).join('')}</div>
    ${c.style ? `<div style="font-size:14px;color:var(--ink-2);margin-bottom:6px">« ${esc(c.style)} »</div>` : ''}
    ${b ? `<div class="mini-stat"><span><b>${euros(dep)}</b> sur ${euros(b)}</span></div><div class="jauge"><i style="width:${Math.min(100, dep / b * 100)}%;${dep > b ? 'background:var(--doux)' : ''}"></i></div>` : '<div class="vide">Couleurs, inspirations, meubles et budget.</div>'}
    ${lien('Préparer la chambre', 'grossesse', 'chambre')}</section>`;
}
function progresValise() {
  return Object.keys(POUR_VALISE).map(k => { const l = S.valise.filter(v => v.pour === k); return [k, l.filter(v => v.fait).length, l.length]; }).filter(x => x[2]);
}
function carteValise() {
  const p = progresValise(), f = S.valise.filter(v => v.fait).length;
  return `<section class="carte">${carteT('🧳', 'Ma valise maternité', S.valise.length ? `${f}/${S.valise.length}` : '')}
    ${p.map(([k, a, n]) => `<div style="font-size:13.5px;color:var(--ink-2);display:flex;justify-content:space-between"><span>${POUR_VALISE[k]}</span><span>${a}/${n}</span></div><div class="jauge"><i style="width:${a / n * 100}%"></i></div>`).join('') || '<div class="vide">La liste de valise est vide.</div>'}
    ${f === S.valise.length && S.valise.length ? '<div class="note-douce"><span class="em">✨</span><div>La valise est prête. Il ne reste plus qu’à attendre bébé.</div></div>' : ''}
    ${lien('Préparer la valise', 'grossesse', 'listes', 'valise')}</section>`;
}
function prochainEvent() {
  const a = cle(auj());
  return ['shower', 'reveal'].map(k => ({ k, ...S.events[k] })).filter(e => e.date && e.date >= a).sort((x, y) => x.date.localeCompare(y.date))[0];
}
function carteEvenements() {
  const ligne = k => {
    const e = S.events[k], nom = k === 'shower' ? 'Baby shower' : 'Gender reveal', em = k === 'shower' ? '🎉' : '🎀';
    const oui = e.invites.filter(i => i.rsvp === 'oui').length;
    return `<div class="ligne" data-act="go" data-p="grossesse" data-s="evenements" data-x="${k}" style="cursor:pointer"><span class="em">${em}</span>
      <div class="txt"><b>${nom}</b><span>${e.date ? cap(dateLongue(lire(e.date))) + (e.lieu ? ' · ' + esc(e.lieu) : '') : 'Pas encore de date'}${e.invites.length ? ` · ${oui}/${e.invites.length} invités confirmés` : ''}</span></div>
      ${e.date && ecart(auj(), lire(e.date)) >= 0 ? `<span class="meta">J-${ecart(auj(), lire(e.date))}</span>` : ''}</div>`;
  };
  return `<section class="carte">${carteT('🎈', 'Baby shower et gender reveal')}${ligne('shower')}${ligne('reveal')}
    <div style="display:flex;gap:12px;flex-wrap:wrap">${revelable() ? '<button class="lien-carte" data-act="reveler">🎀 Découvrir le sexe</button>' : ''}${lien('Préparer un événement', 'grossesse', 'evenements')}</div></section>`;
}
const scorePrenom = p => (Number(p.n1) || 0) + (Number(p.n2) || 0) + (p.favori ? 1.5 : 0);
function cartePrenoms() {
  const l = [...S.prenoms].sort((a, b) => scorePrenom(b) - scorePrenom(a)).slice(0, 4);
  const choisis = actifs().filter(b => b.prenom);
  return `<section class="carte">${carteT('✍️', 'Nos prénoms préférés', S.prenoms.length ? pluriel(S.prenoms.length, 'prénom') : '')}
    ${choisis.length ? `<div class="note-douce"><span class="em">💜</span><div>Prénom choisi : <b>${choisis.map(b => esc(b.prenom)).join(', ')}</b></div></div>` : ''}
    ${l.length ? l.map((p, i) => `<div class="ligne"><span class="em">${['🥇', '🥈', '🥉', '✨'][i]}</span><div class="txt"><b style="font-size:17px">${esc(p.nom)}</b><span>${{ fille: 'Fille', garcon: 'Garçon', mixte: 'Mixte' }[p.genre] || ''}${p.sens ? ' · ' + esc(p.sens) : ''}</span></div><span class="meta">${scorePrenom(p).toFixed(0)} ★</span></div>`).join('')
      : '<div class="vide">Notez les prénoms qui vous font rêver, puis comparez-les à deux.</div>'}
    ${lien('Nos prénoms', 'grossesse', 'prenoms')}</section>`;
}
function carteEtapes() {
  const { avant, apres } = planning();
  const l = [...(estNe() ? [] : avant), ...apres].filter(x => !x.fait && ecart(auj(), x.date) >= -21).sort((a, b) => a.date - b.date).slice(0, 4);
  return `<section class="carte">${carteT('🧭', 'Mes prochaines étapes')}
    ${l.map(x => `<div class="ligne"><button class="coche" data-act="demarche" data-id="${x.id}" aria-label="Fait">✓</button>
      <div class="txt"><b>${esc(x.t)}</b><span>${CAT_PLAN[x.cat][1]} · ${ecart(auj(), x.date) < 0 ? 'à faire bientôt' : 'vers le ' + dateCourte(x.date)}</span></div></div>`).join('') || '<div class="vide">Tout est à jour. 🌙</div>'}
    ${lien('Le planning complet', 'grossesse', 'planning')}</section>`;
}
function carteEnPensee() {
  return `<section class="carte">${carteT('✨', 'En pensée')}
    <p style="margin:0;color:var(--ink-2)">${etoiles().map(b => `<b class="etoile-bebe">✦ ${esc(nomBebe(b))}</b>`).join(', ')} — pour toujours dans votre histoire.</p>
    ${lien('Espace souvenir', 'souvenir')}</section>`;
}

/* ============================================================
   Page Grossesse : sous-pages
   ============================================================ */
const SOUS_G = [['suivi', '🌙 Semaine après semaine'], ['rdv', '🩺 Rendez-vous'], ['planning', '🧭 Planning & démarches'], ['journal', '💭 Journal & jalons'],
  ['listes', '🧺 Listes & valise'], ['prenoms', '✍️ Prénoms'], ['chambre', '🛏️ Chambre'], ['evenements', '🎉 Événements & invitations']];
const sousNav = (page, liste) => `<div class="sous-pages">${liste.map(([k, l]) => `<button class="${V.sous[page] === k ? 'on' : ''}" data-act="sous" data-p="${page}" data-s="${k}">${l}</button>`).join('')}</div>`;
PAGES.grossesse = () => {
  if (!aProfil()) return accueilBienvenue();
  const s = V.sous.grossesse;
  return sousNav('grossesse', SOUS_G) + (SOUS[s] ? SOUS[s]() : '');
};
const SOUS = {};

/* ---------- Semaine après semaine ---------- */
SOUS.suivi = () => {
  const g = etatGrossesse();
  const sel = V.semaine || g.semaine;
  const [fe, fn] = FRUITS[sel];
  const tri = sel <= 14 ? 1 : sel <= 28 ? 2 : 3;
  const date = plus(g.debut, (sel - 1) * 7);
  const souv = S.journal.filter(j => { const n = ecart(g.debut, lire(j.date)); return Math.floor(n / 7) + 1 === sel; });
  const jal = JALONS.filter(j => S.jalons[j.k]?.date && Math.floor(ecart(g.debut, lire(S.jalons[j.k].date)) / 7) + 1 === sel);
  const plan = planning().avant.filter(x => x.sa + 1 === sel || x.sa === sel);
  return `<div class="titre-page"><h2>Semaine <span>${sel}</span> sur 40</h2><span class="pastille acc">${sel === g.semaine ? 'cette semaine' : sel < g.semaine ? 'déjà vécue' : 'à venir'}</span></div>
  <p class="chapo">Du ${dateCourte(date)} au ${dateCourte(plus(date, 6))} · ${sel - 1} SA · ${tri === 1 ? '1ᵉʳ' : tri + 'ᵉ'} trimestre</p>
  <div class="carte" style="margin-bottom:16px">
    <div class="perles" style="grid-template-columns:repeat(21,1fr);margin:0">${Array.from({ length: 42 }, (_, i) =>
      `<button class="perle ${i < g.semaine - 1 ? 'faite' : ''} ${i + 1 === sel ? 'now' : ''}" style="padding:0;cursor:pointer" data-act="semaine" data-n="${i + 1}" title="Semaine ${i + 1}" aria-label="Semaine ${i + 1}"></button>`).join('')}</div>
  </div>
  <div class="grille-2">
    <section class="carte bulle-bebe" style="padding:26px">
      <div class="orbe"><span class="fruit">${fe}</span></div>
      <p>À la semaine ${sel}, ${actifs().length > 1 ? `chacun de ${motBebe()} a` : 'bébé a'} à peu près la taille d’<b>${fn}</b>.</p>
      <p style="font-size:13.5px">${HUMEURS_TRI[tri]}</p>
      <div style="display:flex;gap:8px"><button class="btn petit" data-act="semaine" data-n="${Math.max(1, sel - 1)}">← Semaine ${Math.max(1, sel - 1)}</button>
        <button class="btn petit" data-act="semaine" data-n="${g.semaine}">Aujourd’hui</button>
        <button class="btn petit" data-act="semaine" data-n="${Math.min(42, sel + 1)}">Semaine ${Math.min(42, sel + 1)} →</button></div>
    </section>
    <section class="carte">${carteT('💭', 'Cette semaine-là')}
      ${plan.map(x => `<div class="ligne"><span class="em">${CAT_PLAN[x.cat][0]}</span><div class="txt"><b>${esc(x.t)}</b><span>${x.fait ? '✓ fait' : 'à prévoir'}</span></div></div>`).join('')}
      ${jal.map(j => `<div class="ligne"><span class="em">${j.em}</span><div class="txt"><b>${j.t}</b><span>${dateCourte(lire(S.jalons[j.k].date))}</span></div></div>`).join('')}
      ${souv.map(j => `<div class="ligne" data-act="edit-souvenir" data-id="${j.id}" style="cursor:pointer"><span class="em">${(EMO[j.emotion] || '💭').split(' ')[0]}</span><div class="txt"><b>${esc(j.titre || (j.texte || '').slice(0, 60))}</b><span>${dateCourte(lire(j.date))}</span></div></div>`).join('')}
      ${!plan.length && !jal.length && !souv.length ? '<div class="vide">Rien de noté pour cette semaine.</div>' : ''}
      <div class="idee"><span class="em">${ideeSemaine(sel)[0]}</span><div>${ideeSemaine(sel)[1]}</div></div>
      <button class="lien-carte" data-act="add-souvenir">＋ Ajouter un souvenir</button></section>
  </div>
  <p class="avert">Les comparaisons de taille sont des repères tendres et approximatifs. Pour toute question sur le développement de bébé, parlez-en à votre sage-femme ou à votre médecin.</p>`;
};
ACTIONS.semaine = el => { V.semaine = Number(el.dataset.n); rendre(); };

/* ---------- Rendez-vous ---------- */
SOUS.rdv = () => {
  const a = cle(auj());
  const avenir = rdvAVenir(), passes = S.rdv.filter(r => r.date < a).sort((x, y) => y.date.localeCompare(x.date));
  const notif = 'Notification' in window ? Notification.permission : 'absent';
  return `<div class="titre-page"><h2>Mes <span>rendez-vous</span></h2></div>
  <p class="chapo">Sage-femme, gynécologue, échographies, préparation à la naissance… Ajoutez un rappel, et après chaque rendez-vous, gardez vos notes privées.</p>
  <div class="actions-rapides">
    <button class="btn plein" data-act="add-rdv"><span class="plus">＋</span> Ajouter un rendez-vous</button>
    ${S.rdv.length ? '<button class="btn" data-act="ics-tous">📲 Exporter vers mon calendrier (.ics)</button>' : ''}
    ${notif === 'default' ? '<button class="btn" data-act="notifs">🔔 Activer les rappels du navigateur</button>' : notif === 'granted' ? '<span class="pastille ok">🔔 Rappels du navigateur activés</span>' : ''}
  </div>
  <div class="grille-2">
    <section class="carte">${carteT('📅', 'À venir', pluriel(avenir.length, 'rendez-vous', 'rendez-vous'))}
      ${avenir.map(r => ligneRdv(r)).join('') || '<div class="vide">Aucun rendez-vous à venir.</div>'}</section>
    <section class="carte">${carteT('📝', 'Passés & notes', pluriel(passes.length, 'rendez-vous', 'rendez-vous'))}
      ${passes.map(r => `${ligneRdv(r, false)}${r.note ? `<div style="margin:-4px 0 8px 46px;font-size:13.5px;color:var(--ink-2);white-space:pre-wrap">🔒 ${esc(r.note)}</div>` : `<div style="margin:-6px 0 6px 46px"><button class="lien-carte" style="margin:0" data-act="edit-rdv" data-id="${r.id}">＋ Ajouter mes notes</button></div>`}`).join('') || '<div class="vide">Les rendez-vous passés apparaîtront ici, avec vos notes.</div>'}</section>
  </div>`;
};
function formRdv(r = {}) {
  const neuf = !r.id;
  formulaire({
    titre: neuf ? '🩺 Nouveau rendez-vous' : '🩺 Rendez-vous', chapo: 'Les notes restent privées : elles ne sont jamais incluses dans un partage, sauf si vous le choisissez.',
    valeurs: { type: 'sagefemme', date: cle(auj()), rappel: '1', ...r },
    champs: [
      { k: 'type', lab: 'Type', type: 'select', options: Object.entries(RDV_TYPES).map(([k, [e, n]]) => [k, `${e} ${n}`]), large: true },
      { k: 'titre', lab: 'Intitulé (facultatif)', place: 'Ex. : échographie du 2ᵉ trimestre', large: true },
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'avec', lab: 'Avec', place: 'Nom du professionnel' }, { k: 'lieu', lab: 'Lieu', place: 'Cabinet, maternité…' },
      { k: 'rappel', lab: 'Rappel', type: 'select', options: RAPPELS, large: true },
      { k: 'questions', lab: 'Mes questions à poser', type: 'textarea', large: true, place: 'Pour ne rien oublier le jour venu…' },
      { k: 'note', lab: 'Mes notes privées après le rendez-vous', type: 'textarea', large: true, rows: 4 },
    ],
    enregistrer: v => {
      if (neuf) S.rdv.push({ id: uid(), ...v }); else Object.assign(S.rdv.find(x => x.id === r.id), v);
      if (MOTS_SOUCI.test(v.note + ' ' + v.questions)) setTimeout(noteSante, 350);
      toast('🩺', neuf ? 'Rendez-vous ajouté' : 'Rendez-vous mis à jour', v.rappel ? 'Un rappel apparaîtra sur l’accueil.' : '');
    },
    supprimer: neuf ? null : () => { S.rdv = S.rdv.filter(x => x.id !== r.id); },
  });
}
function noteSante() {
  fenetre(`<div class="fenetre etroite" role="dialog" aria-modal="true"><h2>💜 Prenez soin de vous</h2>
    <div class="note-douce"><span class="em">🤍</span><div>${NOTE_SANTE}</div></div>
    ${P().materniteTel ? `<p style="margin:6px 0">📞 Maternité : <a href="tel:${esc(P().materniteTel)}"><b>${esc(P().materniteTel)}</b></a></p>` : ''}
    <div class="pied"><div class="spacer"></div><button class="btn plein" data-act="fermer">J'ai compris</button></div></div>`);
}
ACTIONS['add-rdv'] = () => formRdv();
ACTIONS['edit-rdv'] = el => formRdv(S.rdv.find(r => r.id === el.dataset.id));
ACTIONS.fermer = () => fermer();

/* export .ics : pour retrouver ses rendez-vous dans le calendrier du téléphone */
function ics(liste) {
  const t = s => String(s || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const ev = liste.map(r => {
    const [em, nom] = RDV_TYPES[r.type] || RDV_TYPES.autre;
    const d = r.date.replace(/-/g, '');
    const quand = r.heure ? `DTSTART:${d}T${r.heure.replace(':', '')}00\r\nDURATION:PT1H` : `DTSTART;VALUE=DATE:${d}`;
    const alarme = r.rappel !== '' && r.rappel != null ? `\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${t(r.titre || nom)}\r\nTRIGGER:-P${Number(r.rappel) || 0}D${r.heure ? 'T0H' : ''}\r\nEND:VALARM` : '';
    return `BEGIN:VEVENT\r\nUID:${r.id}@naobaby\r\nDTSTAMP:${stamp}\r\n${quand}\r\nSUMMARY:${t(em + ' ' + (r.titre || nom))}\r\nLOCATION:${t(r.lieu)}\r\nDESCRIPTION:${t([r.avec && 'Avec ' + r.avec, r.questions && 'Questions : ' + r.questions].filter(Boolean).join('\n'))}${alarme}\r\nEND:VEVENT`;
  });
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//NaoGroup//NaoBaby//FR\r\nCALSCALE:GREGORIAN\r\n${ev.join('\r\n')}\r\nEND:VCALENDAR`;
}
ACTIONS['ics-rdv'] = el => { const r = S.rdv.find(x => x.id === el.dataset.id); telecharger(`rdv-${r.date}.ics`, ics([r]), 'text/calendar'); };
ACTIONS['ics-tous'] = () => telecharger('naobaby-rendez-vous.ics', ics(S.rdv), 'text/calendar');
ACTIONS.notifs = async () => { try { await Notification.requestPermission(); } catch (e) {} rendre(); verifierNotifs(); };

/* rappels : bandeau sur l'accueil + notification du navigateur si autorisée */
function rappelsDuJour() {
  const out = [], a = auj();
  for (const r of S.rdv) {
    if (!r.date) continue;
    const n = ecart(a, lire(r.date));
    const fen = r.rappel === '' || r.rappel == null ? -1 : Number(r.rappel);
    if (n >= 0 && (n <= fen || n === 0)) {
      const [em, nom] = RDV_TYPES[r.type] || RDV_TYPES.autre;
      out.push({ id: 'r' + r.id + r.date, em, txt: `<b>${esc(r.titre || nom)}</b> ${dansJours(n)}${r.heure ? ' à ' + fmtH(r.heure) : ''}${r.lieu ? ' · ' + esc(r.lieu) : ''}`, act: `data-act="edit-rdv" data-id="${r.id}"` });
    }
  }
  if (P().mode !== 'perte') {
    const { avant, apres } = planning();
    let nPlan = 0;
    for (const x of [...(estNe() ? [] : avant), ...apres]) {
      const n = ecart(a, x.date);
      if (!x.fait && n <= 7 && n >= -14 && !x.estime && nPlan++ < 2) out.push({ id: 'p' + x.id, em: CAT_PLAN[x.cat][0], txt: `<b>${esc(x.t)}</b> — ${n < 0 ? 'à faire bientôt' : 'vers le ' + dateCourte(x.date)}`, act: 'data-act="go" data-p="grossesse" data-s="planning"' });
    }
  }
  let masques = [];
  try { masques = JSON.parse(sessionStorage.getItem('naobaby.masques') || '[]'); } catch (e) {}
  return out.filter(x => !masques.includes(x.id)).slice(0, 3);
}
function rendreRappels() {
  const l = aProfil() ? rappelsDuJour() : [];
  $('#rappels').innerHTML = l.map(x => `<div class="rappel"><span class="em">${x.em}</span><div>${x.txt}</div><div class="spacer"></div>
    <button class="btn petit" ${x.act}>Voir</button><button class="rond petit" data-act="masquer-rappel" data-id="${x.id}" aria-label="Masquer">✕</button></div>`).join('');
}
ACTIONS['masquer-rappel'] = el => {
  let m = []; try { m = JSON.parse(sessionStorage.getItem('naobaby.masques') || '[]'); } catch (e) {}
  m.push(el.dataset.id); try { sessionStorage.setItem('naobaby.masques', JSON.stringify(m)); } catch (e) {}
  rendreRappels();
};
function verifierNotifs() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  S.notifies ??= {};
  for (const x of rappelsDuJour()) {
    const k = x.id + cle(auj());
    if (S.notifies[k]) continue;
    try { new Notification('NaoBaby', { body: x.txt.replace(/<[^>]+>/g, ''), tag: k }); } catch (e) {}
    S.notifies[k] = 1;
  }
  enregistrer();
}

/* ---------- Planning & démarches ---------- */
SOUS.planning = () => {
  const { avant, apres } = planning();
  const f = V.filtrePlan || 'tout';
  const ok = x => f === 'tout' || x.cat === f;
  const c = congeMat();
  const etape = x => {
    const n = ecart(auj(), x.date);
    return `<div class="etape ${x.fait ? 'faite' : ''} ${!x.fait && n <= 14 && n >= -21 ? 'proche' : ''}">
      <div class="etape-h"><button class="coche ${x.fait ? 'on' : ''}" data-act="demarche" data-id="${x.id}" aria-label="Marquer comme fait">✓</button>
        <b>${esc(x.t)}</b><span class="pastille">${CAT_PLAN[x.cat].join(' ')}</span>
        <span class="quand">${x.sa ? `${x.sa} SA · ` : ''}${x.estime ? 'vers le ' : ''}${dateMoy(x.date)}${x.fait ? '' : n < 0 ? ' · à faire bientôt' : ' · ' + dansJours(n)}</span></div>
      <p>${esc(x.d)}${x.lien ? ` <a href="${x.lien}" target="_blank" rel="noopener">${x.lien.replace('https://', '').replace('www.', '')}</a>` : ''}
        ${x.go ? ` <button class="lien-carte" style="margin:0" data-act="go" data-p="${x.go[0]}" data-s="${x.go[1]}" ${x.go[2] ? `data-x="${x.go[2]}"` : ''}>Ouvrir →</button>` : ''}</p></div>`;
  };
  return `<div class="titre-page"><h2>Le <span>planning</span> : quoi faire, et quand</h2></div>
  <p class="chapo">Les étapes du suivi et les démarches administratives (Assurance Maladie, CAF, mairie, employeur, impôts…), placées automatiquement selon votre date prévue.</p>
  <div class="grille" style="margin-bottom:16px">
    <section class="carte">${carteT('🤰', 'Congé maternité (indicatif)')}
      <div class="mini-stat"><span><b>${c.avant}</b> sem. avant</span><span><b>${c.apres}</b> sem. après</span><span><b>${c.total}</b> sem. au total</span></div>
      ${c.debut ? `<div style="font-size:14px;color:var(--ink-2)">Du <b style="color:var(--titre)">${dateMoy(c.debut)}</b> au <b style="color:var(--titre)">${dateMoy(c.fin)}</b></div>` : ''}
      <div class="avert">Calculé pour ${actifs().length > 1 ? motBebe() : 'un bébé'}${actifs().length === 1 ? ` avec ${pluriel(Number(P().aines) || 0, 'enfant', 'enfants')} déjà à charge` : ''}. Des reports sont possibles : vérifiez avec l’Assurance Maladie.</div></section>
    <section class="carte">${carteT('👨‍🍼', 'Second parent')}
      <div class="mini-stat"><span><b>3</b> jours de naissance</span><span><b>${congePat()}</b> jours de congé</span></div>
      <div class="avert">Congé de paternité et d'accueil de l'enfant, dont 4 jours à prendre juste après le congé de naissance. Le reste peut être fractionné dans les 6 mois.</div></section>
  </div>
  <div class="choix" style="margin-bottom:14px">${[['tout', 'Tout'], ...Object.entries(CAT_PLAN).map(([k, [e, n]]) => [k, e + ' ' + n])].map(([k, l]) =>
    `<label><input type="radio" name="fp" data-act="filtre-plan" value="${k}" ${f === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <div class="grille-2">
    <section class="carte">${carteT('🌙', 'Pendant la grossesse', `${avant.filter(x => x.fait).length}/${avant.length}`)}<div class="frise">${avant.filter(ok).map(etape).join('')}</div></section>
    <section class="carte">${carteT('👶', 'Après la naissance', `${apres.filter(x => x.fait).length}/${apres.length}`)}
      ${apres[0]?.estime ? '<div class="sous" style="margin-top:0">Dates estimées à partir de la date prévue — elles se recalent dès que la naissance est enregistrée.</div>' : ''}
      <div class="frise">${apres.filter(ok).map(etape).join('')}</div></section>
  </div>
  <p class="avert">Informations générales pour la France, données à titre indicatif et susceptibles d’évoluer. Vérifiez toujours votre situation sur
    <a href="https://www.service-public.fr" target="_blank" rel="noopener">service-public.fr</a>, <a href="https://www.ameli.fr" target="_blank" rel="noopener">ameli.fr</a>,
    <a href="https://www.caf.fr" target="_blank" rel="noopener">caf.fr</a> et <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener">impots.gouv.fr</a>.
    Le calendrier des examens est toujours fixé avec votre professionnel de santé.</p>`;
};
ACTIONS.demarche = el => { const id = el.dataset.id; S.demarches[id] = !S.demarches[id]; sauver(); };
ACTIONS['filtre-plan'] = el => { V.filtrePlan = el.value; rendre(); };

/* ---------- Journal & jalons ---------- */
SOUS.journal = () => {
  const g = etatGrossesse();
  const f = V.filtreJ || 'tout';
  let l = [...S.journal].sort((a, b) => b.date.localeCompare(a.date));
  if (f === 'important') l = l.filter(j => j.important);
  const semaineDe = d => g ? Math.floor(ecart(g.debut, lire(d)) / 7) + 1 : 0;
  const tousJalons = [...JALONS.map(j => ({ ...j, ...(S.jalons[j.k] || {}), perso: false })), ...S.jalonsPerso.map(j => ({ ...j, k: j.id, perso: true }))]
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  return `<div class="titre-page"><h2>Notre <span>journal</span></h2></div>
  <p class="chapo">Les mots, les photos, les émotions, les envies et les petits moments — l’histoire de votre grossesse, écrite au fil des semaines.</p>
  <div class="actions-rapides"><button class="btn plein" data-act="add-souvenir"><span class="plus">＋</span> Ajouter un souvenir</button>
    <button class="btn" data-act="add-jalon">✨ Ajouter un jalon</button>
    <div class="choix" style="align-self:center">${[['tout', 'Tous'], ['important', '⭐ Moments importants']].map(([k, n]) =>
      `<label><input type="radio" name="fj" data-act="filtre-j" value="${k}" ${f === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
  <div class="grille-2">
    <section>${l.map(j => `<article class="souvenir ${j.important ? 'important' : ''}">
      <div class="souvenir-h"><span style="font-size:20px">${(EMO[j.emotion] || '💭').split(' ')[0]}</span><b>${esc(j.titre || 'Souvenir')}</b>
        <span class="quand">${cap(dateLongue(lire(j.date)))}${g ? ` · semaine ${semaineDe(j.date)}` : ''}${j.prive ? ' · 🔒 privé' : ''}</span>
        <span class="act"><button class="rond petit" data-act="edit-souvenir" data-id="${j.id}" aria-label="Modifier">✏️</button></span></div>
      ${j.photo ? `<img class="photo-grande" src="${j.photo}" alt="">` : ''}
      ${j.texte ? `<p>${esc(j.texte)}</p>` : ''}
      ${j.envie ? `<div class="envie"><b>Envie du moment :</b> ${esc(j.envie)}</div>` : ''}</article>`).join('') ||
      '<section class="carte"><div class="vide">Votre journal est encore vierge. Le premier souvenir est souvent le plus précieux.</div></section>'}</section>
    <section class="carte">${carteT('✨', 'Nos jalons', `${tousJalons.filter(j => j.date).length}/${tousJalons.length}`)}
      <div class="frise">${tousJalons.map(j => `<div class="etape ${j.date ? 'faite' : ''}" data-act="jalon" data-k="${j.k}" data-perso="${j.perso ? 1 : ''}" style="cursor:pointer">
        <div class="etape-h"><span>${j.em}</span><b>${esc(j.t)}</b><span class="quand">${j.date ? dateMoy(lire(j.date)) : 'à vivre'}</span></div>
        ${j.note ? `<p>${esc(j.note)}</p>` : ''}${j.photo ? `<img class="photo-mini" src="${j.photo}" alt="">` : ''}</div>`).join('')}</div></section>
  </div>`;
};
ACTIONS['filtre-j'] = el => { V.filtreJ = el.value; rendre(); };
function formSouvenir(j = {}) {
  const neuf = !j.id;
  formulaire({
    titre: neuf ? '💭 Un nouveau souvenir' : '💭 Souvenir', large: true,
    valeurs: { date: cle(auj()), prive: true, ...j },
    champs: [
      { k: 'titre', lab: 'Titre', place: 'Ex. : les premiers petits coups', large: true },
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'emotion', lab: 'Mon émotion', type: 'select', options: [['', '—'], ...EMOTIONS] },
      { k: 'texte', lab: 'Ce que je veux garder', type: 'textarea', large: true, rows: 5 },
      { k: 'envie', lab: 'Mon envie du moment', place: 'Des fraises, un bain chaud, une sieste…', large: true },
      { k: 'photo', lab: 'Photo', type: 'photo', large: true },
      { k: 'important', type: 'case', texte: '⭐ C’est un moment important' },
      { k: 'prive', type: 'case', texte: '🔒 Privé (jamais partagé)' },
    ],
    enregistrer: v => {
      if (neuf) S.journal.push({ id: uid(), ...v }); else Object.assign(S.journal.find(x => x.id === j.id), v);
      if (v.emotion === 'inquiete' || MOTS_SOUCI.test(v.texte + ' ' + v.titre)) setTimeout(noteSante, 350);
      else toast('💭', 'Souvenir gardé', 'Il fait maintenant partie de votre histoire.');
    },
    supprimer: neuf ? null : () => { S.journal = S.journal.filter(x => x.id !== j.id); },
  });
}
ACTIONS['add-souvenir'] = () => formSouvenir();
ACTIONS['edit-souvenir'] = el => formSouvenir(S.journal.find(j => j.id === el.dataset.id));
ACTIONS.jalon = el => {
  const perso = !!el.dataset.perso, k = el.dataset.k;
  const base = perso ? S.jalonsPerso.find(j => j.id === k) : { ...JALONS.find(j => j.k === k), ...(S.jalons[k] || {}) };
  formulaire({
    titre: `${base.em} ${esc(base.t)}`, valeurs: { date: base.date || cle(auj()), ...base },
    champs: [
      ...(perso ? [{ k: 't', lab: 'Jalon', large: true, req: true }, { k: 'em', lab: 'Emoji' }] : []),
      { k: 'date', lab: 'Date', type: 'date', large: !perso }, { k: 'note', lab: 'Un mot', type: 'textarea', large: true }, { k: 'photo', lab: 'Photo', type: 'photo', large: true }],
    enregistrer: v => {
      if (perso) Object.assign(base, v); else S.jalons[k] = { date: v.date, note: v.note, photo: v.photo };
      if (v.date) confettis(couleursAccent(), 2200, 60);
    },
    supprimer: perso ? () => { S.jalonsPerso = S.jalonsPerso.filter(j => j.id !== k); } : (S.jalons[k] ? () => { delete S.jalons[k]; } : null),
  });
};
ACTIONS['add-jalon'] = () => formulaire({
  titre: '✨ Un jalon à nous', valeurs: { em: '🌟', date: cle(auj()) },
  champs: [{ k: 't', lab: 'Jalon', req: true, large: true, place: 'Ex. : le premier cadeau pour bébé' }, { k: 'em', lab: 'Emoji' }, { k: 'date', lab: 'Date', type: 'date' },
    { k: 'note', lab: 'Un mot', type: 'textarea', large: true }, { k: 'photo', lab: 'Photo', type: 'photo', large: true }],
  enregistrer: v => { S.jalonsPerso.push({ id: uid(), ...v }); },
});
function couleursAccent() {
  const a = document.documentElement.dataset.sexe;
  return a === 'fille' ? ['#F4B6D2', '#F9D5E4', '#FFFFFF', '#E3B9EC', '#F3C969']
    : a === 'garcon' ? ['#A9C8F7', '#D3E2FB', '#FFFFFF', '#C9B7F5', '#F3C969']
    : a === 'mixte' ? ['#F4B6D2', '#A9C8F7', '#FFFFFF', '#C9B7F5', '#F3C969']
    : ['#C9B7F5', '#B39BF0', '#FFFFFF', '#F3D7EA', '#F3C969'];
}

/* ---------- Listes : achats, liste de naissance, valise ---------- */
SOUS.listes = () => {
  const t = V.filtreListe || 'achats';
  const tabs = [['achats', '🛍️ Achats pour bébé'], ['naissance', '🎁 Liste de naissance'], ['valise', '🧳 Valise maternité']];
  return `<div class="titre-page"><h2>Nos <span>listes</span></h2></div>
  <div class="choix" style="margin:6px 0 16px">${tabs.map(([k, n]) => `<label><input type="radio" name="tl" data-act="onglet-liste" value="${k}" ${t === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
  ${t === 'achats' ? listeAchats() : t === 'naissance' ? listeNaissance() : listeValise()}`;
};
ACTIONS['onglet-liste'] = el => { V.filtreListe = el.value; rendre(); };
const ligneItem = (l, x, txt, sous = '', meta = '') => `<div class="ligne ${x.fait ? 'fait' : ''}">
  <button class="coche ${x.fait ? 'on' : ''}" data-act="coche" data-l="${l}" data-id="${x.id}" aria-label="Cocher">✓</button>
  <div class="txt"><b>${txt}</b>${sous ? `<span>${sous}</span>` : ''}</div>${meta}
  <div class="act"><button class="rond petit" data-act="edit-item" data-l="${l}" data-id="${x.id}" aria-label="Modifier">✏️</button>
  <button class="rond petit" data-act="sup-item" data-l="${l}" data-id="${x.id}" aria-label="Supprimer">✕</button></div></div>`;
function listeAchats() {
  const l = S.achats, tot = l.reduce((s, x) => s + nombre(x.prix), 0), dep = l.filter(x => x.fait).reduce((s, x) => s + nombre(x.prix), 0);
  const cats = CATS_ACHATS.filter(c => l.some(x => x.cat === c));
  return `<section class="carte">
    <div class="mini-stat"><span><b>${l.filter(x => x.fait).length}</b>/${l.length} achetés</span>${tot ? `<span><b>${euros(dep)}</b> dépensés sur ${euros(tot)} prévus</span>` : ''}</div>
    <div class="jauge"><i style="width:${l.length ? l.filter(x => x.fait).length / l.length * 100 : 0}%"></i></div>
    <div class="grille" style="margin-top:6px">${cats.map(c => { const g = l.filter(x => x.cat === c); return `<div>
      <div class="groupe-t">${c}<span class="compte">${g.filter(x => x.fait).length}/${g.length}</span></div>
      ${g.map(x => ligneItem('achats', x, esc(x.nom) + (x.qte > 1 ? ` <small style="color:var(--ink-3)">×${x.qte}</small>` : ''), '', x.prix ? `<span class="meta">${euros(x.prix)}</span>` : '')).join('')}</div>`; }).join('')}</div>
    <form class="ajout-ligne" data-form="achats"><input type="text" name="nom" placeholder="Ajouter un achat…" required>
      <select name="cat">${CATS_ACHATS.map(c => `<option>${c}</option>`).join('')}</select><input type="number" name="prix" placeholder="Prix €" min="0" style="max-width:110px">
      <button class="btn plein">＋</button></form>
    ${!l.length ? '<button class="btn" data-act="listes-defaut" style="margin-top:10px">✨ Remplir avec une liste de départ</button>' : ''}</section>`;
}
function listeNaissance() {
  const l = S.naissance;
  return `<section class="carte">
    <div class="mini-stat">${Object.entries(STATUT_LN).map(([k, [e, n]]) => `<span>${e} <b>${l.filter(x => x.statut === k).length}</b> ${n.toLowerCase()}${l.filter(x => x.statut === k).length > 1 ? 's' : ''}</span>`).join('')}</div>
    ${l.map(x => { const [e, n, c] = STATUT_LN[x.statut] || STATUT_LN.souhaite; return `<div class="ligne ${x.statut === 'recu' ? 'fait' : ''}"><span class="em">${e}</span>
      <div class="txt"><b>${esc(x.nom)}</b><span>${x.par ? 'Offert par ' + esc(x.par) + ' · ' : ''}${x.lien ? `<a href="${esc(x.lien)}" target="_blank" rel="noopener">voir l’article</a>` : ''}</span></div>
      ${x.prix ? `<span class="meta">${euros(x.prix)}</span>` : ''}<button class="pastille ${c}" data-act="statut-ln" data-id="${x.id}" title="Changer le statut" style="cursor:pointer">${n}</button>
      <div class="act"><button class="rond petit" data-act="edit-ln" data-id="${x.id}">✏️</button></div></div>`; }).join('') || '<div class="vide">Votre liste de naissance est vide.</div>'}
    <div class="actions-rapides" style="margin-top:12px"><button class="btn plein" data-act="add-ln"><span class="plus">＋</span> Ajouter une idée</button>
      ${l.length ? '<button class="btn" data-act="copier-ln">📋 Copier la liste pour la partager</button>' : ''}</div></section>`;
}
function listeValise() {
  return `<div class="grille">${Object.entries(POUR_VALISE).map(([k, n]) => { const g = S.valise.filter(v => v.pour === k); return `<section class="carte">
    ${carteT(n.split(' ')[0], n.slice(n.indexOf(' ') + 1), `${g.filter(x => x.fait).length}/${g.length}`)}
    <div class="jauge"><i style="width:${g.length ? g.filter(x => x.fait).length / g.length * 100 : 0}%"></i></div>
    ${g.map(x => ligneItem('valise', x, esc(x.nom))).join('')}
    <form class="ajout-ligne" data-form="valise" data-pour="${k}"><input type="text" name="nom" placeholder="Ajouter…" required><button class="btn plein">＋</button></form></section>`; }).join('')}</div>
    ${!S.valise.length ? '<button class="btn" data-act="listes-defaut">✨ Remplir avec une liste de départ</button>' : ''}`;
}
ACTIONS.coche = el => {
  const x = S[el.dataset.l].find(i => i.id === el.dataset.id); x.fait = !x.fait;
  if (el.dataset.l === 'valise' && S.valise.length && S.valise.every(v => v.fait)) {
    if (!S.jalons.valise) S.jalons.valise = { date: cle(auj()), note: '' };
    confettis(couleursAccent(), 3000, 90); toast('🧳', 'La valise est bouclée !', 'Un nouveau jalon rejoint votre journal.');
  }
  sauver();
};
ACTIONS['sup-item'] = el => { S[el.dataset.l] = S[el.dataset.l].filter(i => i.id !== el.dataset.id); sauver(); };
ACTIONS['edit-item'] = el => {
  const l = el.dataset.l, x = S[l].find(i => i.id === el.dataset.id);
  formulaire({
    titre: '✏️ Modifier', valeurs: x,
    champs: l === 'achats' ? [{ k: 'nom', lab: 'Article', req: true, large: true }, { k: 'cat', lab: 'Catégorie', type: 'select', options: CATS_ACHATS.map(c => [c, c]) },
      { k: 'qte', lab: 'Quantité', type: 'number', min: 1 }, { k: 'prix', lab: 'Prix (€)', type: 'number', min: 0 }, { k: 'fait', type: 'case', texte: 'Acheté' }]
      : [{ k: 'nom', lab: 'Élément', req: true, large: true }, { k: 'pour', lab: 'Pour', type: 'select', options: Object.entries(POUR_VALISE) }, { k: 'fait', type: 'case', texte: 'Dans la valise' }],
    enregistrer: v => { Object.assign(x, v); if (v.qte) x.qte = Number(v.qte) || 1; },
    supprimer: () => { S[l] = S[l].filter(i => i.id !== x.id); },
  });
};
ACTIONS['listes-defaut'] = () => { const d = listesParDefaut(); if (!S.achats.length) S.achats = d.achats; if (!S.valise.length) S.valise = d.valise; sauver(); };
function formLN(x = {}) {
  const neuf = !x.id;
  formulaire({
    titre: neuf ? '🎁 Ajouter à la liste naissance' : '🎁 Liste naissance', valeurs: { statut: 'souhaite', ...x },
    champs: [{ k: 'nom', lab: 'Idée', req: true, large: true, place: 'Ex. : un doudou tout doux' }, { k: 'prix', lab: 'Prix (€)', type: 'number', min: 0 },
      { k: 'statut', lab: 'Statut', type: 'select', options: Object.entries(STATUT_LN).map(([k, [e, n]]) => [k, e + ' ' + n]) },
      { k: 'lien', lab: 'Lien vers l’article', type: 'url', large: true, place: 'https://…' }, { k: 'par', lab: 'Réservé ou offert par', large: true }],
    enregistrer: v => { if (neuf) S.naissance.push({ id: uid(), ...v }); else Object.assign(S.naissance.find(i => i.id === x.id), v); toast('🎁', neuf ? 'Ajouté à la liste naissance' : 'Liste naissance mise à jour'); },
    supprimer: neuf ? null : () => { S.naissance = S.naissance.filter(i => i.id !== x.id); },
  });
}
ACTIONS['add-ln'] = () => formLN();
ACTIONS['edit-ln'] = el => formLN(S.naissance.find(i => i.id === el.dataset.id));
ACTIONS['statut-ln'] = el => { const x = S.naissance.find(i => i.id === el.dataset.id); const o = Object.keys(STATUT_LN); x.statut = o[(o.indexOf(x.statut) + 1) % o.length]; sauver(); };
ACTIONS['copier-ln'] = async () => {
  const t = `🎁 Liste de naissance — ${parents()}\n\n` + S.naissance.filter(x => x.statut !== 'recu').map(x => `• ${x.nom}${x.prix ? ` (${euros(x.prix)})` : ''}${x.statut === 'reserve' ? ' — déjà réservé' : ''}${x.lien ? `\n  ${x.lien}` : ''}`).join('\n') + '\n\nAvec tout notre amour 💜';
  try { await navigator.clipboard.writeText(t); toast('📋', 'Liste copiée', 'Collez-la dans un message à vos proches.'); } catch (e) { fenetre(`<div class="fenetre"><h2>📋 Votre liste</h2><textarea rows="12">${esc(t)}</textarea><div class="pied"><div class="spacer"></div><button class="btn plein" data-act="fermer">Fermer</button></div></div>`); }
};
/* ajout rapide dans les listes */
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const nom = f.nom.value.trim(); if (!nom) return;
  if (f.dataset.form === 'achats') S.achats.push({ id: uid(), nom, cat: f.cat.value, prix: f.prix.value, qte: 1, fait: false });
  if (f.dataset.form === 'valise') S.valise.push({ id: uid(), nom, pour: f.dataset.pour, fait: false });
  if (f.dataset.form === 'meuble') S.chambre.meubles.push({ id: uid(), nom, prix: f.prix.value, fait: false });
  if (f.dataset.form === 'ev-tache') S.events[f.dataset.ev].taches.push({ id: uid(), nom, fait: false });
  if (f.dataset.form === 'ev-invite') S.events[f.dataset.ev].invites.push({ id: uid(), nom, contact: f.contact.value.trim(), nb: 1, rsvp: 'attente' });
  if (f.dataset.form === 'ev-depense') S.events[f.dataset.ev].depenses.push({ id: uid(), nom, montant: f.montant.value });
  sauver();
  setTimeout(() => { const n = document.querySelector(`[data-form="${f.dataset.form}"]${f.dataset.pour ? `[data-pour="${f.dataset.pour}"]` : ''} input[name=nom]`); n && n.focus(); }, 30);
});

/* ---------- Prénoms ---------- */
SOUS.prenoms = () => {
  const l = [...S.prenoms].sort((a, b) => scorePrenom(b) - scorePrenom(a));
  const fav = l.filter(p => p.favori).slice(0, 6);
  const nom = P().nomFamille;
  const f = V.filtreP || 'tout';
  const vis = l.filter(p => f === 'tout' || p.genre === f || p.genre === 'mixte');
  const etoilesNote = (p, k) => `<span class="etoiles">${[1, 2, 3, 4, 5].map(n => `<button class="${(Number(p[k]) || 0) >= n ? 'on' : ''}" data-act="note-prenom" data-id="${p.id}" data-k="${k}" data-n="${n}" aria-label="${n} étoiles">★</button>`).join('')}</span>`;
  return `<div class="titre-page"><h2>Nos <span>prénoms</span> préférés</h2></div>
  <p class="chapo">Notez chacun les prénoms qui vous touchent : le classement se fait tout seul. Cochez vos coups de cœur pour les comparer côte à côte${nom ? `, avec « ${esc(nom)} »` : ''}.</p>
  <div class="actions-rapides"><button class="btn plein" data-act="add-prenom"><span class="plus">＋</span> Ajouter un prénom</button>
    <div class="choix" style="align-self:center">${[['tout', 'Tous'], ['fille', 'Fille'], ['garcon', 'Garçon'], ['mixte', 'Mixte']].map(([k, n]) =>
      `<label><input type="radio" name="fpr" data-act="filtre-p" value="${k}" ${f === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
  ${fav.length ? `<section class="carte" style="margin-bottom:16px">${carteT('💞', 'Nos coups de cœur, côte à côte')}
    <div class="comparer">${fav.map(p => `<div class="c"><div class="n">${esc(p.nom)}</div>${nom ? `<div class="f">${esc(p.nom)} ${esc(nom)}</div>` : ''}
      <div class="f" style="font-size:12.5px;margin-top:6px">${esc(P().parent1 || 'Parent 1')} ${'★'.repeat(Number(p.n1) || 0) || '—'}<br>${esc(P().parent2 || 'Parent 2')} ${'★'.repeat(Number(p.n2) || 0) || '—'}</div>
      <button class="btn petit" style="margin-top:10px" data-act="choisir-prenom" data-id="${p.id}">💜 C’est lui / c’est elle</button></div>`).join('')}</div></section>` : ''}
  <section>${vis.map(p => `<div class="prenom ${p.favori ? 'favori' : ''}">
    <button class="rond petit" data-act="fav-prenom" data-id="${p.id}" title="Coup de cœur">${p.favori ? '💜' : '🤍'}</button>
    <div class="nom">${esc(p.nom)}<small>${{ fille: 'Fille', garcon: 'Garçon', mixte: 'Mixte' }[p.genre] || ''}${p.sens ? ' · ' + esc(p.sens) : ''}</small></div>
    <div class="notes"><span>${esc(P().parent1 || 'Parent 1')} ${etoilesNote(p, 'n1')}</span><span>${esc(P().parent2 || 'Parent 2')} ${etoilesNote(p, 'n2')}</span></div>
    <div class="total"><b>${scorePrenom(p).toFixed(0)}</b><span>points</span></div>
    <button class="rond petit" data-act="edit-prenom" data-id="${p.id}" aria-label="Modifier">✏️</button></div>`).join('') || '<section class="carte"><div class="vide">Aucun prénom pour le moment.</div></section>'}</section>`;
};
ACTIONS['filtre-p'] = el => { V.filtreP = el.value; rendre(); };
function formPrenom(p = {}) {
  const neuf = !p.id;
  formulaire({
    titre: neuf ? '✍️ Un prénom qui nous plaît' : '✍️ Prénom', valeurs: { genre: 'mixte', ...p },
    champs: [{ k: 'nom', lab: 'Prénom', req: true, large: true }, { k: 'genre', lab: 'Pour', type: 'choix', options: [['fille', 'Fille'], ['garcon', 'Garçon'], ['mixte', 'Mixte']], large: true },
      { k: 'sens', lab: 'Origine ou signification', large: true }, { k: 'note', lab: 'Pourquoi on l’aime', type: 'textarea', large: true }],
    enregistrer: v => { if (neuf) S.prenoms.push({ id: uid(), n1: 0, n2: 0, favori: false, ...v }); else Object.assign(S.prenoms.find(x => x.id === p.id), v); },
    supprimer: neuf ? null : () => { S.prenoms = S.prenoms.filter(x => x.id !== p.id); },
  });
}
ACTIONS['add-prenom'] = () => formPrenom();
ACTIONS['edit-prenom'] = el => formPrenom(S.prenoms.find(p => p.id === el.dataset.id));
ACTIONS['fav-prenom'] = el => { const p = S.prenoms.find(x => x.id === el.dataset.id); p.favori = !p.favori; sauver(); };
ACTIONS['note-prenom'] = el => { const p = S.prenoms.find(x => x.id === el.dataset.id); const n = Number(el.dataset.n); p[el.dataset.k] = Number(p[el.dataset.k]) === n ? 0 : n; sauver(); };
ACTIONS['choisir-prenom'] = el => {
  const p = S.prenoms.find(x => x.id === el.dataset.id), a = actifs();
  const poser = b => { b.prenom = p.nom; if (!S.jalons.prenom) S.jalons.prenom = { date: cle(auj()), note: p.nom }; confettis(couleursAccent(), 3000, 100); toast('💜', `${p.nom}`, 'Le prénom est choisi. Quel joli moment.'); sauver(); };
  if (a.length === 1) return poser(a[0]);
  formulaire({ titre: `💜 ${esc(p.nom)} pour…`, champs: [{ k: 'b', lab: 'Quel bébé ?', type: 'choix', options: a.map((b, i) => [b.id, nomBebe(b, i)]), large: true }],
    enregistrer: v => { const b = a.find(x => x.id === v.b); if (!b) return false; poser(b); } });
};

/* ---------- Chambre ---------- */
SOUS.chambre = () => {
  const c = S.chambre, dep = c.meubles.reduce((s, m) => s + nombre(m.prix), 0), b = nombre(c.budget);
  return `<div class="titre-page"><h2>La <span>chambre</span> de bébé</h2></div>
  <p class="chapo">Les couleurs, les inspirations, les meubles et le budget — pour un nid qui vous ressemble.</p>
  <div class="grille-2">
    <section class="carte">${carteT('🎨', 'Notre palette')}
      <div class="nuancier">${c.couleurs.map((x, i) => `<label class="nuance"><input type="color" value="${x}" data-act="couleur" data-i="${i}">${x.toUpperCase()}</label>`).join('')}</div>
      <div class="champs" style="margin-top:14px">
        <div class="champ large"><label>Ambiance, style</label><input type="text" data-chambre="style" value="${esc(c.style)}" placeholder="Ex. : doux et naturel, bois clair, nuages…"></div>
        <div class="champ"><label>Budget (€)</label><input type="number" min="0" data-chambre="budget" value="${esc(c.budget || '')}"></div>
        <div class="champ"><label>Déjà prévu</label><div style="font-size:20px;color:var(--titre);padding-top:6px">${euros(dep)}</div></div></div>
      ${b ? `<div class="jauge" style="margin-top:12px"><i style="width:${Math.min(100, dep / b * 100)}%;${dep > b ? 'background:var(--doux)' : ''}"></i></div>
        <div style="font-size:13px;color:var(--ink-3)">${dep > b ? `Dépassement de ${euros(dep - b)}` : `Reste ${euros(b - dep)}`}</div>` : ''}</section>
    <section class="carte">${carteT('🪑', 'Meubles & équipements', `${c.meubles.filter(m => m.fait).length}/${c.meubles.length}`)}
      ${c.meubles.map(m => `<div class="ligne ${m.fait ? 'fait' : ''}"><button class="coche ${m.fait ? 'on' : ''}" data-act="meuble" data-id="${m.id}">✓</button>
        <div class="txt"><b>${esc(m.nom)}</b></div>${m.prix ? `<span class="meta">${euros(m.prix)}</span>` : ''}
        <div class="act"><button class="rond petit" data-act="sup-meuble" data-id="${m.id}">✕</button></div></div>`).join('') || '<div class="vide">Lit, commode, fauteuil, rangements…</div>'}
      <form class="ajout-ligne" data-form="meuble"><input type="text" name="nom" placeholder="Ajouter un meuble…" required><input type="number" name="prix" placeholder="Prix €" min="0" style="max-width:110px"><button class="btn plein">＋</button></form></section>
  </div>
  <section class="carte" style="margin-top:16px">${carteT('✨', 'Nos inspirations', pluriel(c.inspis.length, 'image'))}
    <div class="inspis">${c.inspis.map(x => `<div class="inspi"><img src="${x.photo}" alt=""><span>${esc(x.note || '')}</span><button class="rond petit" data-act="sup-inspi" data-id="${x.id}">✕</button></div>`).join('')}
      <button class="inspi" data-act="add-inspi" style="min-height:150px;display:grid;place-items:center;border-style:dashed;cursor:pointer;font-size:14px;color:var(--ink-2)">📷<br>Ajouter une inspiration</button></div></section>`;
};
ACTIONS.meuble = el => { const m = S.chambre.meubles.find(x => x.id === el.dataset.id); m.fait = !m.fait; sauver(); };
ACTIONS['sup-meuble'] = el => { S.chambre.meubles = S.chambre.meubles.filter(x => x.id !== el.dataset.id); sauver(); };
ACTIONS['sup-inspi'] = el => { S.chambre.inspis = S.chambre.inspis.filter(x => x.id !== el.dataset.id); sauver(); };
ACTIONS['add-inspi'] = () => formulaire({ titre: '✨ Une inspiration', champs: [{ k: 'photo', lab: 'Image', type: 'photo', large: true }, { k: 'note', lab: 'Ce qui nous plaît', large: true }],
  enregistrer: v => { if (!v.photo) { toast('📷', 'Ajoutez une image'); return false; } S.chambre.inspis.push({ id: uid(), ...v }); } });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'couleur') { S.chambre.couleurs[Number(t.dataset.i)] = t.value; enregistrer(); }
  if (t.dataset.chambre) { S.chambre[t.dataset.chambre] = t.type === 'number' ? nombre(t.value) : t.value; sauver(); }
});
