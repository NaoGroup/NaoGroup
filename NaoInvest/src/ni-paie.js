/* ============================================================
   NaoInvest — comprendre sa fiche de paie.
   Le chemin du brut au net, une fiche d'exemple dont chaque ligne
   s'explique d'un clic, et l'import de sa propre fiche (PDF ou photo)
   lue UNIQUEMENT dans le navigateur : rien n'est envoyé ni enregistré.
   ============================================================ */

/* ---------- ce que veut dire chaque ligne ---------- */
const LIGNES_PAIE = [
  { cle: 'base', re: /salaire de base|appointements|salaire mensuel/, nom: 'Salaire de base', cat: 'salaire', explic: 'Le salaire prévu par le contrat de travail, avant tout ajout ou retenue. Pour un temps plein, il correspond souvent à 151,67 heures par mois (35 heures × 52 semaines ÷ 12).' },
  { cle: 'hsup', re: /heures? supp|h\.? ?sup|heures? compl|majoration/, nom: 'Heures supplémentaires', cat: 'salaire', explic: 'Les heures au-delà de 35 heures par semaine, payées plus cher (majoration, souvent 25 %). Elles sont en partie exonérées d’impôt sur le revenu, dans une limite annuelle.' },
  { cle: 'prime', re: /\bprime|gratification|13e mois|treizieme|bonus|commission/, nom: 'Prime', cat: 'salaire', explic: 'Une somme ajoutée au salaire (ancienneté, objectifs, 13e mois…). Elle est soumise aux cotisations comme le salaire, sauf primes particulières.' },
  { cle: 'absence', re: /absence|sans solde|retenue pour absence|entree.*sortie/, nom: 'Absence ou retenue', cat: 'salaire', explic: 'Une somme retirée du brut pour une absence non payée par l’employeur (maladie, congé sans solde…). En cas d’arrêt maladie, la Sécurité sociale verse des indemnités à part.' },
  { cle: 'brut', re: /salaire brut|total brut|brut total|remuneration brute|^brut\b/, nom: 'Salaire brut', cat: 'total', explic: 'Le salaire total avant les cotisations sociales. C’est le chiffre souvent annoncé à l’embauche (« 24 000 € brut par an »).' },
  { cle: 'mutuelle', re: /complementaire sante|mutuelle|frais de sante|complementaire.*sante/, nom: 'Complémentaire santé (mutuelle)', cat: 'cotisation', explic: 'La mutuelle d’entreprise, obligatoire : elle complète les remboursements de la Sécurité sociale. L’employeur en paie au moins la moitié.' },
  { cle: 'sante', re: /maladie|maternite|invalidite|deces|securite sociale.*sante|^sante/, nom: 'Santé (Sécurité sociale)', cat: 'cotisation', explic: 'Finance l’assurance maladie : remboursements de soins, indemnités en cas d’arrêt, maternité. Surtout payée par l’employeur.' },
  { cle: 'prevoyance', re: /prevoyance|incapacite/, nom: 'Prévoyance', cat: 'cotisation', explic: 'Une assurance qui protège en cas d’arrêt long, d’invalidité ou de décès (capital versé aux proches).' },
  { cle: 'at', re: /accidents? du travail|at\/mp|maladies? professionnelle/, nom: 'Accidents du travail', cat: 'cotisation', explic: 'Payée uniquement par l’employeur : couvre les accidents du travail, de trajet, et les maladies professionnelles.' },
  { cle: 'retraite-base', re: /vieillesse|plafonnee|deplafonnee|retraite.*securite sociale|securite sociale.*retraite/, nom: 'Retraite de base (Sécurité sociale)', cat: 'cotisation', explic: 'Les cotisations qui ouvrent vos droits à la retraite de base. « Plafonnée » s’applique jusqu’au plafond de la Sécurité sociale, « déplafonnée » sur tout le salaire.' },
  { cle: 'retraite-compl', re: /agirc|arrco|retraite complementaire|complementaire tranche|tranche [12]|\bt[12]\b|\bceg\b|\bcet\b/, nom: 'Retraite complémentaire (Agirc-Arrco)', cat: 'cotisation', explic: 'La deuxième retraite des salariés du privé : ces cotisations vous donnent des points, convertis en pension. CEG et CET sont des contributions d’équilibre du régime.' },
  { cle: 'chomage', re: /chomage|\bapec\b|\bags\b/, nom: 'Assurance chômage', cat: 'cotisation', explic: 'Finance les allocations chômage. Depuis 2018, la part salariée a été supprimée : elle est payée par l’employeur (l’APEC concerne les cadres).' },
  { cle: 'famille', re: /famille|allocations familiales/, nom: 'Famille', cat: 'cotisation', explic: 'Payée par l’employeur : finance les allocations familiales et la branche famille.' },
  { cle: 'csg-nd', re: /non deductible|crds/, nom: 'CSG et CRDS non déductibles', cat: 'cotisation', explic: 'Une partie de la CSG et la CRDS (remboursement de la dette sociale). Elles sont retirées de votre salaire mais restent comptées dans le revenu imposable : c’est pourquoi le net imposable est plus élevé que le net à payer.' },
  { cle: 'csg-d', re: /csg/, nom: 'CSG déductible', cat: 'cotisation', explic: 'La contribution sociale généralisée, qui finance la Sécurité sociale. Elle se calcule sur 98,25 % du brut. Cette part-là n’est pas imposable.' },
  { cle: 'allegement', re: /exoneration|allegement|reduction generale|reduction de cotisations|regularisation/, nom: 'Allègements de cotisations', cat: 'cotisation', explic: 'Des réductions de cotisations patronales accordées par l’État, surtout pour les salaires proches du SMIC. Elles baissent le coût pour l’employeur, pas votre salaire.' },
  { cle: 'autres', re: /autres contributions|formation professionnelle|taxe d.apprentissage|versement mobilite|fnal|dialogue social/, nom: 'Autres contributions de l’employeur', cat: 'cotisation', explic: 'Des contributions payées par l’employeur (formation, transport, logement…). Elles n’enlèvent rien à votre salaire.' },
  { cle: 'total-cot', re: /total (des )?cotisations|total (des )?retenues|cotisations et contributions/, nom: 'Total des cotisations', cat: 'total', explic: 'La somme de tout ce qui a été retenu sur votre brut (colonne salarié) et de ce que paie l’employeur en plus (colonne employeur).' },
  { cle: 'net-avant', re: /avant impot|net a payer avant|net avant/, nom: 'Net à payer avant impôt', cat: 'net', explic: 'Ce que vous auriez touché sans le prélèvement à la source : brut moins cotisations salariales. C’est le meilleur repère pour comparer deux salaires.' },
  { cle: 'net-imposable', re: /net imposable|net fiscal|revenu imposable/, nom: 'Net imposable', cat: 'impot', explic: 'Le montant pris en compte pour l’impôt sur le revenu. Il est un peu plus élevé que le net avant impôt (CSG/CRDS non déductibles, part de mutuelle payée par l’employeur). C’est la somme qu’on retrouve, cumulée sur l’année, dans la déclaration préremplie.' },
  { cle: 'taux-pas', re: /taux (personnalise|non personnalise|neutre|individualise|du prelevement|pas)|taux d.imposition/, nom: 'Taux du prélèvement à la source', cat: 'impot', explic: 'Le taux transmis par l’administration fiscale à votre employeur. On peut le modifier sur impots.gouv.fr (« Gérer mon prélèvement à la source »).' },
  { cle: 'pas', re: /impot sur le revenu|prelevement a la source|retenue a la source|\bpas\b/, nom: 'Impôt prélevé à la source', cat: 'impot', explic: 'L’impôt sur le revenu retenu ce mois-ci : net imposable × votre taux. Il est reversé à l’administration fiscale par l’employeur.' },
  { cle: 'net-social', re: /net social|montant net social/, nom: 'Montant net social', cat: 'net', explic: 'Un montant à reporter tel quel pour vos demandes de prime d’activité ou de RSA. Il simplifie ces démarches.' },
  { cle: 'tickets', re: /titres? restaurant|tickets? restaurant|carte restaurant/, nom: 'Titres-restaurant', cat: 'autre', explic: 'Votre part des titres-restaurant, retenue sur le salaire ; l’employeur paie l’autre partie (souvent 50 à 60 %).' },
  { cle: 'transport', re: /transport|navigo|forfait mobilite|frais de trajet/, nom: 'Transport', cat: 'autre', explic: 'Le remboursement d’une partie de votre abonnement de transport en commun (au moins 50 % par l’employeur), ou un forfait mobilités durables.' },
  { cle: 'nature', re: /avantage en nature|avantage nature|logement de fonction|vehicule de fonction/, nom: 'Avantage en nature', cat: 'autre', explic: 'Un avantage fourni par l’employeur (voiture, logement, repas) : il est ajouté au brut pour les cotisations et l’impôt, puis retiré du net, puisqu’on ne le touche pas en argent.' },
  { cle: 'net-paye', re: /net paye|net a payer|net verse|montant verse|virement|net a percevoir/, nom: 'Net payé', cat: 'net', explic: 'La somme réellement versée sur votre compte bancaire : net à payer avant impôt, moins l’impôt prélevé à la source.' },
  { cle: 'conges', re: /conges? payes?|\bcp\b|solde conges|conges acquis|conges pris/, nom: 'Congés payés', cat: 'info', explic: 'Vous acquérez 2,5 jours ouvrables de congés par mois travaillé, soit 5 semaines par an. La fiche indique ce qui est acquis, pris et restant.' },
  { cle: 'cout', re: /cout (total |global )?(de l.)?employeur|total verse par l.employeur|cout global|cout total/, nom: 'Coût total employeur', cat: 'employeur', explic: 'Ce que votre emploi coûte réellement à l’employeur : brut + cotisations patronales (moins les allègements).' },
  { cle: 'cumul', re: /cumul/, nom: 'Cumuls de l’année', cat: 'info', explic: 'Les totaux depuis le 1er janvier : brut, net imposable, impôt… Utiles pour vérifier sa déclaration de revenus.' },
  { cle: 'heures', re: /heures travaillees|nombre d.heures|horaire|151[,.]67/, nom: 'Heures', cat: 'info', explic: 'Le nombre d’heures payées dans le mois. 151,67 heures = un temps plein à 35 heures.' }
];
const CAT_PAIE = { salaire: '💶 Salaire', total: 'Σ Total', cotisation: '🛡️ Cotisation', net: '✅ Net', impot: '🧾 Impôt', autre: '🎫 Avantage', info: 'ℹ️ Information', employeur: '🏢 Employeur' };
const sansAcc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const lignePaie = texte => { const t = sansAcc(texte); return LIGNES_PAIE.find(l => l.re.test(t)) || null; };

/* ---------- la fiche d'exemple (fictive, taux simplifiés) ---------- */
const EX_PAIE = [
  { s: 'Salaire' },
  { l: 'Salaire de base', b: '151,67 h', t: '13,19 €', g: '2 000,00', k: 'base' },
  { l: 'Salaire brut', g: '2 000,00', k: 'brut', fort: true },
  { s: 'Santé' },
  { l: 'Sécurité sociale maladie, maternité, invalidité, décès', b: '2 000,00', p: '140,00', k: 'sante' },
  { l: 'Complémentaire santé (mutuelle)', r: '25,00', p: '25,00', k: 'mutuelle' },
  { l: 'Accidents du travail, maladies professionnelles', b: '2 000,00', p: '22,00', k: 'at' },
  { s: 'Retraite' },
  { l: 'Sécurité sociale plafonnée', b: '2 000,00', t: '6,90 %', r: '138,00', p: '171,00', k: 'retraite-base' },
  { l: 'Sécurité sociale déplafonnée', b: '2 000,00', t: '0,40 %', r: '8,00', p: '40,40', k: 'retraite-base' },
  { l: 'Complémentaire Tranche 1 (Agirc-Arrco, avec CEG)', b: '2 000,00', t: '4,01 %', r: '80,20', p: '120,20', k: 'retraite-compl' },
  { s: 'Autres cotisations' },
  { l: 'Famille', b: '2 000,00', p: '69,00', k: 'famille' },
  { l: 'Assurance chômage', b: '2 000,00', p: '81,00', k: 'chomage' },
  { l: 'Autres contributions dues par l’employeur', p: '30,00', k: 'autres' },
  { l: 'CSG déductible de l’impôt sur le revenu', b: '1 965,00', t: '6,80 %', r: '133,62', k: 'csg-d' },
  { l: 'CSG/CRDS non déductibles de l’impôt sur le revenu', b: '1 965,00', t: '2,90 %', r: '56,99', k: 'csg-nd' },
  { l: 'Exonérations, allègements de cotisations', p: '-250,00', k: 'allegement' },
  { l: 'Total des cotisations et contributions', r: '441,81', p: '448,60', k: 'total-cot', fort: true },
  { s: 'Net' },
  { l: 'Net à payer avant impôt sur le revenu', g: '1 558,19', k: 'net-avant', fort: true },
  { l: 'Net imposable', g: '1 640,18', k: 'net-imposable' },
  { l: 'Impôt sur le revenu prélevé à la source', b: '1 640,18', t: '3,00 %', r: '49,21', k: 'pas' },
  { l: 'Net payé', g: '1 508,98', k: 'net-paye', fort: true, gros: true },
  { l: 'Montant net social', g: '1 563,00', k: 'net-social' },
  { s: 'Informations' },
  { l: 'Congés payés : acquis 2,5 j · pris 0 j · solde 15 j', k: 'conges' },
  { l: 'Coût total employeur', g: '2 448,60', k: 'cout' }
];

/* ---------- l'écran ---------- */
function cascade(v) {
  const max = Math.max(v.cout || 0, v.brut || 0) || 1, w = x => `${Math.max(2, x / max * 100).toFixed(1)}%`;
  const ligne = (lib, val, cls, note) => val ? `<div class="cas ${cls}"><span class="lib">${lib}</span><span class="barre-c"><i style="width:${w(Math.abs(val))}"></i></span><b>${cls === 'moins' ? '−' : ''}${nb(Math.abs(val), 2)} €</b>${note ? `<small>${note}</small>` : ''}</div>` : '';
  const cot = v.brut && v.netAvant ? v.brut - v.netAvant : 0;
  return `<div class="cascade">
    ${v.cout ? ligne('Coût pour l’employeur', v.cout, 'employeur', 'brut + cotisations patronales') : ''}
    ${ligne('Salaire brut', v.brut, 'brut')}
    ${ligne('Cotisations salariales', cot, 'moins', v.brut ? `${nb(cot / v.brut * 100, 1)} % du brut` : '')}
    ${ligne('Net avant impôt', v.netAvant, 'net')}
    ${ligne('Impôt prélevé à la source', v.pas, 'moins', v.taux ? `taux ${nb(v.taux, 2)} %` : '')}
    ${ligne('Net payé sur votre compte', v.netPaye, 'paye')}
  </div>`;
}
function vuePaie() {
  const sel = U.lignePaie != null ? EX_PAIE[U.lignePaie] : null, expl = sel && LIGNES_PAIE.find(l => l.cle === sel.k);
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>💼 Comprendre sa fiche de paie</h2></div>
    <p class="chapo">Brut, net, cotisations, net imposable, prélèvement à la source… Une fiche de paie se lit en quelques minutes une fois qu’on connaît le chemin. Et vous pouvez importer la vôtre pour la décrypter.</p>

    <section class="bloc"><h3 class="bloc-titre">🧭 Le chemin, du coût employeur à votre compte</h3>
      <div class="carte">${cascade({ cout: 2448.60, brut: 2000, netAvant: 1558.19, pas: 49.21, taux: 3, netPaye: 1508.98 })}
      <p class="petit-texte">Exemple fictif pour un salaire de 2 000 € brut (taux simplifiés). En moyenne, le net avant impôt représente environ 75 à 80 % du brut pour un salarié du privé non cadre.</p></div>
    </section>

    <section class="bloc" id="importPaie"><h3 class="bloc-titre">📥 Décrypter ma fiche de paie</h3>
      <div class="carte import-paie">
        <div class="note sure" style="margin-top:0"><span class="e">🔒</span><div><b>Votre fiche reste chez vous.</b> Elle est lue directement dans votre navigateur : elle n’est ni envoyée, ni enregistrée, et disparaît quand vous quittez la page. Seuls les programmes de lecture (gratuits) sont téléchargés depuis internet la première fois.</div></div>
        <label class="depot" id="depotPaie"><input type="file" id="fichierPaie" accept="application/pdf,image/*" hidden>
          <span class="e">📄</span><b>Choisir ma fiche de paie</b><small>PDF (le plus fiable) ou photo bien nette · ou glissez-déposez le fichier ici</small></label>
        <div id="resPaie" aria-live="polite">${U.paie ? resultatPaie(U.paie) : ''}</div>
        <details class="plus-d"><summary>Pas de fichier sous la main ? Saisir 3 chiffres</summary>
          <form id="paieManuelle" class="champs" style="margin-top:10px" novalidate>
            <div class="champ"><label for="pmBrut">Salaire brut (€)</label><input id="pmBrut" type="number" step="0.01" min="0" inputmode="decimal"></div>
            <div class="champ"><label for="pmNet">Net à payer avant impôt (€)</label><input id="pmNet" type="number" step="0.01" min="0" inputmode="decimal"></div>
            <div class="champ"><label for="pmTaux">Taux de prélèvement (%)</label><input id="pmTaux" type="number" step="0.1" min="0" inputmode="decimal"></div>
            <div class="champ" style="align-self:end"><button class="btn" type="submit">Décrypter</button></div>
          </form></details>
      </div>
    </section>

    <section class="bloc"><h3 class="bloc-titre">🔍 Une fiche de paie, ligne par ligne</h3>
      <p class="petit-texte" style="margin:-6px 0 10px">Fiche fictive. Touchez une ligne pour savoir ce qu’elle veut dire.</p>
      <div class="paie-ex">
        <div class="fiche-paie" role="table" aria-label="Exemple de fiche de paie">
          <div class="fp-tete"><div><b>SARL Les Jardins de Nao</b><small>Exemple fictif · Période : mars</small></div><div><b>Léa Martin</b><small>Employée · temps plein</small></div></div>
          <div class="fp-cols" role="row"><span>Libellé</span><span>Base</span><span>Taux</span><span>À déduire</span><span>Employeur</span></div>
          ${EX_PAIE.map((r, i) => r.s ? `<div class="fp-section">${esc(r.s)}</div>`
            : `<button type="button" class="fp-ligne ${r.fort ? 'fort' : ''} ${r.gros ? 'gros' : ''} ${U.lignePaie === i ? 'choisie' : ''}" data-ligne-paie="${i}" role="row">
              <span>${esc(r.l)}</span><span>${esc(r.b || '')}</span><span>${esc(r.t || '')}</span><span>${esc(r.r || r.g || '')}</span><span>${esc(r.p || '')}</span></button>`).join('')}
        </div>
        <aside class="paie-explic" aria-live="polite">${expl ? `<small>${CAT_PAIE[expl.cat]}</small><h4>${esc(expl.nom)}</h4><p>${esc(expl.explic)}</p>` : '<h4>👈 Touchez une ligne</h4><p>Chaque ligne de la fiche a son explication. Commencez par « Salaire brut », puis descendez jusqu’au « Net payé ».</p>'}</aside>
      </div>
    </section>

    <section class="bloc"><h3 class="bloc-titre">❓ Les questions qu’on se pose</h3>
      <div class="faq">${[
        ['Pourquoi mon net change d’un mois à l’autre ?', 'Heures supplémentaires, primes, absences, nombre de jours, changement de taux de prélèvement, régularisation de mutuelle… La fiche indique toujours la ligne qui a bougé.'],
        ['Brut, net, net imposable : lequel compter ?', 'Pour comparer deux offres d’emploi : le brut annuel (ou le net avant impôt). Pour son budget : le net payé. Pour sa déclaration d’impôts : le net imposable cumulé.'],
        ['Combien de temps garder ses fiches de paie ?', 'Jusqu’à la liquidation de sa retraite : elles prouvent les périodes travaillées. Beaucoup d’employeurs les déposent dans un coffre-fort numérique.'],
        ['Mon employeur peut-il me payer moins que le SMIC ?', 'Non, sauf cas particuliers prévus par la loi (apprentis, certains jeunes). Le montant du SMIC est revalorisé au moins une fois par an : à vérifier sur service-public.fr.'],
        ['Que faire si je pense qu’il y a une erreur ?', 'En parler d’abord au service paie ou RH, par écrit. Les représentants du personnel et l’inspection du travail peuvent aider. Un rappel de salaire peut être demandé sur 3 ans.']].map(q => `<details class="question-faq"><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('')}</div>
    </section>`;
}

/* ---------- lire un fichier : PDF (pdf.js) ou image (Tesseract), à la demande ---------- */
const LIBS = {
  pdf: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  ocr: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
};
const scriptsCharges = {};
function chargerScript(src) {
  if (!scriptsCharges[src]) scriptsCharges[src] = new Promise((ok, ko) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => { delete scriptsCharges[src]; ko(new Error('chargement')); };
    document.head.appendChild(s);
  });
  return scriptsCharges[src];
}
async function lignesDuPdf(fichier) {
  await chargerScript(LIBS.pdf);
  pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfWorker;
  const doc = await pdfjsLib.getDocument({ data: await fichier.arrayBuffer() }).promise, lignes = [];
  for (let n = 1; n <= Math.min(doc.numPages, 3); n++) {
    const items = (await (await doc.getPage(n)).getTextContent()).items.filter(i => i.str && i.str.trim());
    const rangs = [];
    items.forEach(i => {
      const y = i.transform[5], x = i.transform[4];
      let r = rangs.find(r => Math.abs(r.y - y) < 3);
      if (!r) rangs.push(r = { y, mots: [] });
      r.mots.push({ x, t: i.str });
    });
    rangs.sort((a, b) => b.y - a.y).forEach(r => lignes.push(r.mots.sort((a, b) => a.x - b.x).map(m => m.t).join('  ')));
  }
  return lignes;
}
async function lignesDeLImage(fichier, etape) {
  await chargerScript(LIBS.ocr);
  const r = await Tesseract.recognize(fichier, 'fra', { logger: m => { if (m.status === 'recognizing text') etape(`Lecture de l’image… ${Math.round(m.progress * 100)} %`); } });
  return r.data.text.split('\n');
}
/* les montants d'une ligne : « 1 234,56 », « 1234.56 », « -250,00 », et les taux à 3–4 décimales « 6,9000 » */
const RE_MONTANT = /-?\d{1,3}(?:[   .]\d{3})*,\d{2,4}\b|-?\d+,\d{2,4}\b|-?\d+\.\d{2}\b/g;
const lireNb = m => parseFloat(m.replace(/[   ]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
function montants(ligne) { return (ligne.match(RE_MONTANT) || []).map(lireNb); }

/* Les cotisations surtout payées par l'employeur : un montant seul va dans sa colonne. */
const PART_EMPLOYEUR = ['at', 'famille', 'chomage', 'autres', 'allegement', 'sante'];
/* Découpe une ligne en libellé, base, taux, part salarié, part employeur — au mieux. */
function decouper(t, l) {
  const cle = l ? l.cle : '', cat = l ? l.cat : '';
  let taux = null, reste = t, debut = t.length;
  const pct = t.match(/(\d{1,3}[,.]\d{1,4})\s*%/);
  if (pct) { taux = pct[1].replace('.', ',') + ' %'; reste = t.replace(pct[0], ' '.repeat(pct[0].length)); debut = pct.index; }
  const nums = [];
  let m; RE_MONTANT.lastIndex = 0;
  while ((m = RE_MONTANT.exec(reste))) {
    debut = Math.min(debut, m.index);
    const dec = (m[0].split(/[,.]/).pop() || '').length;
    if (dec >= 3 && taux == null) taux = m[0];       /* « 6,9000 » : un taux sans le signe % */
    else nums.push(lireNb(m[0]));
  }
  let lib = t.slice(0, debut).replace(/[\s·:|-]+$/, '').trim() || t.trim();
  const dernierMensuel = () => nums.length >= 2 && Math.abs(nums[1]) > Math.abs(nums[0]) * 3 ? nums[0] : nums[nums.length - 1];  /* évite la colonne « cumul » */
  let base = null, sal = null, pat = null;
  if (cat === 'cotisation' || cle === 'total-cot') {
    if (nums.length >= 3) { base = nums[0]; sal = nums[nums.length - 2]; pat = nums[nums.length - 1]; }
    else if (nums.length === 2) {
      if (cle !== 'total-cot' && Math.abs(nums[0]) > 3 * Math.abs(nums[1])) { base = nums[0]; if (PART_EMPLOYEUR.includes(cle)) pat = nums[1]; else sal = nums[1]; }
      else { sal = nums[0]; pat = nums[1]; }
    } else if (nums.length === 1) { if (PART_EMPLOYEUR.includes(cle)) pat = nums[0]; else sal = nums[0]; }
  } else if (cle === 'base' && nums.length >= 3 && taux == null) { base = nums[0]; taux = `${nb(nums[1], 2)} €`; sal = nums[nums.length - 1]; }
  else if (cle === 'pas') { if (nums.length >= 2) base = nums[0]; if (nums.length) sal = nums[nums.length - 1]; }
  else if (cle === 'cout') { if (nums.length) pat = dernierMensuel(); }
  else if (nums.length) {
    if (nums.length >= 3) { base = nums[0]; sal = nums[nums.length - 1]; }
    else sal = dernierMensuel();
  }
  return { lib, base, taux, sal, pat };
}
const GROUPE_PAIE = { salaire: 'Salaire', cotisation: 'Cotisations', net: 'Net et impôt', impot: 'Net et impôt', autre: 'Avantages et frais', info: 'Informations', employeur: 'Informations' };
function groupeDe(l) {
  if (!l) return null;
  if (l.cle === 'brut') return 'Salaire';
  if (l.cle === 'total-cot') return 'Cotisations';
  return GROUPE_PAIE[l.cat] || null;
}
function analyserPaie(lignes) {
  const v = {}, rangs = [];
  const garder = (cle, val) => { if (val != null && !isNaN(val) && v[cle] == null) v[cle] = val; };
  let groupe = null;
  lignes.forEach(brut => {
    const t = brut.replace(/\s+/g, ' ').trim(); if (t.length < 3) return;
    const l = lignePaie(t), d = decouper(t, l);
    if (!l && d.sal == null && d.pat == null) return;          /* ni reconnue, ni montant : en-tête, adresse… */
    const g = groupeDe(l) || groupe || 'Salaire';
    rangs.push(Object.assign({ texte: t, l, groupe: g }, d)); groupe = g;
    if (!l) return;
    const s = sansAcc(t), principal = d.sal != null ? d.sal : d.pat;
    if (l.cle === 'brut') garder('brut', principal);
    if (l.cle === 'net-avant') garder('netAvant', principal);
    if (l.cle === 'net-paye' && !/avant/.test(s)) garder('netPaye', principal);
    if (l.cle === 'net-imposable') garder('netImposable', principal);
    if (l.cle === 'net-social') garder('netSocial', principal);
    if (l.cle === 'cout') garder('cout', d.pat != null ? d.pat : principal);
    if (l.cle === 'pas' || l.cle === 'taux-pas') {
      const pct = s.match(/(\d{1,2}[,.]\d{1,2})\s*%/); if (pct) garder('taux', parseFloat(pct[1].replace(',', '.')));
      if (l.cle === 'pas' && principal != null && Math.abs(principal) < 100000) garder('pas', Math.abs(principal));
    }
  });
  if (v.netPaye == null && v.netAvant != null && v.pas != null) v.netPaye = v.netAvant - v.pas;
  if (v.pas == null && v.netAvant != null && v.netPaye != null && v.netAvant >= v.netPaye) v.pas = +(v.netAvant - v.netPaye).toFixed(2);
  return { v, rangs };
}
const eur = x => x == null ? '' : nb(x, 2);
function explicRang(r) {
  if (!r) return '<h4>👈 Touchez une ligne</h4><p>Chaque ligne de votre fiche a son explication, avec ses propres montants. Commencez par le salaire brut, puis descendez jusqu’au net payé.</p>';
  const puce = (lib, val) => val == null || val === '' ? '' : `<span><small>${lib}</small><b>${val}</b></span>`;
  const chiffres = `<div class="vos-chiffres">${puce('Base', r.base != null ? eur(r.base) : '')}${puce('Taux', r.taux ? esc(r.taux) : '')}${puce(r.l && ['cotisation', 'impot'].includes(r.l.cat) || (r.l && r.l.cle === 'total-cot') ? 'Retenu sur votre salaire' : 'Montant', r.sal != null ? `${eur(r.sal)} €` : '')}${puce('Payé par l’employeur', r.pat != null ? `${eur(r.pat)} €` : '')}</div>`;
  if (!r.l) return `<small>❔ Ligne de votre fiche</small><h4>${esc(r.lib)}</h4>${chiffres}<p>NaoInvest ne connaît pas encore ce libellé. Les intitulés varient d’un logiciel de paie à l’autre : votre service paie ou RH peut vous l’expliquer.</p>`;
  let calcul = '';
  if (r.base != null && r.taux && /%/.test(r.taux) && (r.sal != null || r.pat != null)) calcul = `<p class="calcul">🧮 Calcul : ${eur(r.base)} € × ${esc(r.taux)} = ${eur(r.sal != null ? r.sal : r.pat)} €</p>`;
  return `<small>${CAT_PAIE[r.l.cat]}</small><h4>${esc(r.lib)}</h4>${r.lib.toLowerCase() !== r.l.nom.toLowerCase() ? `<div class="alias">= ${esc(r.l.nom)}</div>` : ''}${chiffres}${calcul}<p>${esc(r.l.explic)}</p>`;
}
function ficheImportee(r) {
  let groupe = null;
  const lignesHtml = r.rangs.map((x, i) => {
    const titre = x.groupe !== groupe ? `<div class="fp-section">${esc(x.groupe)}</div>` : '';
    groupe = x.groupe;
    const k = x.l ? x.l.cle : '';
    const cls = [['brut', 'net-avant', 'total-cot', 'net-imposable'].includes(k) ? 'fort' : '', k === 'net-paye' ? 'fort gros' : '', !x.l ? 'inconnue' : '', U.ligneImp === i ? 'choisie' : ''].join(' ');
    return `${titre}<button type="button" class="fp-ligne ${cls}" data-ligne-imp="${i}" role="row" title="${esc(x.texte)}">
      <span>${esc(x.lib)}</span><span>${x.base != null ? eur(x.base) : ''}</span><span>${x.taux ? esc(x.taux) : ''}</span><span>${eur(x.sal)}</span><span>${eur(x.pat)}</span></button>`;
  }).join('');
  return `<div class="paie-ex imp">
    <div class="fiche-paie" role="table" aria-label="Votre fiche de paie, ligne par ligne">
      <div class="fp-tete"><div><b>Votre fiche de paie</b><small>${esc(r.nom || '')}</small></div><div><b>${r.rangs.filter(x => x.l).length}/${r.rangs.length}</b><small>lignes expliquées</small></div></div>
      <div class="fp-cols" role="row"><span>Libellé</span><span>Base</span><span>Taux</span><span>Salarié</span><span>Employeur</span></div>
      ${lignesHtml}
    </div>
    <aside class="paie-explic" id="explicImp" aria-live="polite">${explicRang(r.rangs[U.ligneImp])}</aside>
  </div>
  <p class="petit-texte">La lecture automatique range les montants dans les colonnes au mieux : en cas de doute, fiez-vous à votre fiche. Les lignes en gris ne sont pas encore dans le lexique.</p>`;
}
function resultatPaie(r) {
  if (r.etape) return `<div class="attente-paie"><span class="rond-attente"></span>${esc(r.etape)}</div>`;
  if (r.erreur) return `<div class="note risque"><span class="e">😕</span><div>${r.erreur}</div></div>`;
  const v = r.v, trouves = ['brut', 'netAvant', 'netPaye'].filter(k => v[k] != null).length, rangs = r.rangs || [];
  return `<div class="res-paie">
    <h4>✨ Votre fiche décryptée ${r.nom ? `<small>${esc(r.nom)}</small>` : ''}</h4>
    ${trouves ? `<div class="chiffres">${[['Brut', v.brut], ['Net avant impôt', v.netAvant], ['Impôt à la source', v.pas], ['Net payé', v.netPaye], ['Net imposable', v.netImposable], ['Net social', v.netSocial], ['Coût employeur', v.cout]].filter(c => c[1] != null).map(c => `<div class="chiffre"><small>${c[0]}</small><b>${nb(c[1], 2)} €</b></div>`).join('')}</div>
      ${v.brut && v.netAvant ? cascade(v) : ''}
      ${v.brut && v.netAvant ? `<p class="lecture">Sur ${nb(v.brut, 2)} € brut, <b>${nb(v.brut - v.netAvant, 2)} €</b> partent en cotisations sociales (${nb((v.brut - v.netAvant) / v.brut * 100, 1)} %) : elles financent votre santé, votre retraite et votre protection sociale.${v.pas ? ` Puis <b>${nb(v.pas, 2)} €</b> d’impôt sont prélevés à la source.` : ''}${v.netPaye ? ` Il vous reste <b>${nb(v.netPaye, 2)} €</b> sur votre compte.` : ''}</p>` : ''}`
    : '<div class="note douce"><span class="e">🧐</span><div>Je n’ai pas réussi à repérer les totaux (brut, net). Le format de cette fiche est peut-être inhabituel, ou la photo trop floue : essayez le PDF d’origine, ou la saisie des 3 chiffres ci-dessous.</div></div>'}
    ${rangs.length ? `<h4 class="titre-lignes">🔍 Votre fiche, ligne par ligne</h4>${ficheImportee(r)}` : ''}
    <p class="petit-texte">Lecture automatique : vérifiez toujours les chiffres sur votre fiche. En cas de doute sur votre paie, adressez-vous à votre service paie ou RH.</p>
    <button type="button" class="lien-discret" data-act="paie-effacer">Effacer ce résultat</button>
  </div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ligne-imp]'); if (!b || !U.paie || !U.paie.rangs) return;
  U.ligneImp = +b.dataset.ligneImp;
  $$('[data-ligne-imp]').forEach(x => x.classList.toggle('choisie', x === b));
  const a = $('#explicImp'); if (a) { a.innerHTML = explicRang(U.paie.rangs[U.ligneImp]); if (innerWidth < 820) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
});
async function lireFichePaie(fichier) {
  const maj = r => { U.paie = r; const z = $('#resPaie'); if (z) z.innerHTML = resultatPaie(r); };
  U.ligneImp = null;
  if (!fichier) return;
  if (fichier.size > 15 * 1024 * 1024) return maj({ erreur: 'Ce fichier est trop lourd (plus de 15 Mo).' });
  const estPdf = fichier.type === 'application/pdf' || /\.pdf$/i.test(fichier.name);
  maj({ etape: estPdf ? 'Lecture du PDF…' : 'Préparation de la lecture de l’image (la première fois, cela peut prendre un moment)…' });
  try {
    const lignes = estPdf ? await lignesDuPdf(fichier) : await lignesDeLImage(fichier, e => maj({ etape: e }));
    if (estPdf && lignes.join('').trim().length < 30) return maj({ erreur: 'Ce PDF ne contient pas de texte lisible (c’est sans doute une image scannée). Faites-en une photo nette et importez-la, ou saisissez les 3 chiffres ci-dessous.' });
    const r = analyserPaie(lignes); r.nom = fichier.name; maj(r);
  } catch (e) {
    maj({ erreur: 'La lecture n’a pas pu se faire. Il faut une connexion internet la première fois, pour télécharger le programme de lecture. Vous pouvez aussi saisir les 3 chiffres ci-dessous.' });
  }
}
document.addEventListener('change', e => { if (e.target.id === 'fichierPaie') { lireFichePaie(e.target.files[0]); e.target.value = ''; } });
['dragover', 'drop'].forEach(t => document.addEventListener(t, e => {
  const z = e.target.closest && e.target.closest('#depotPaie'); if (!z) return;
  e.preventDefault(); if (t === 'drop') lireFichePaie(e.dataTransfer.files[0]);
}));
document.addEventListener('submit', e => {
  if (e.target.id !== 'paieManuelle') return; e.preventDefault();
  const brut = +$('#pmBrut').value || null, netAvant = +$('#pmNet').value || null, taux = +$('#pmTaux').value || 0;
  if (!brut && !netAvant) return toast('Indiquez au moins le brut et le net avant impôt.');
  const pas = netAvant && taux ? +(netAvant * 1.05 * taux / 100).toFixed(2) : null;
  U.paie = { v: { brut, netAvant, taux: taux || null, pas, netPaye: netAvant && pas != null ? netAvant - pas : null }, reconnues: [], nom: 'saisie manuelle' };
  $('#resPaie').innerHTML = resultatPaie(U.paie);
  if (pas != null) toast('L’impôt est estimé : le net imposable est en général un peu plus élevé que le net avant impôt.', { duree: 5000 });
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ligne-paie]'); if (!b) return;
  U.lignePaie = +b.dataset.lignePaie; const y = scrollY; rendre(); scrollTo(0, y);
  if (innerWidth < 820) { const x = $('.paie-explic'); if (x) x.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
});
