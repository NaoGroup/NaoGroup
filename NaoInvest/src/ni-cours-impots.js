/* ============================================================
   NaoInvest — la page du cours « Comprendre les impôts » :
   couverture, sommaire des chapitres, atelier de calcul par tranches,
   barème daté et mots de l'impôt.
   ============================================================ */
function vueCoursImpots() {
  const p = PARCOURS.find(x => x.id === 'impots'), pp = progressionParcours(p);
  const chap = p.lecons.map(lecon), suite = chap.find(l => !acquise(l.id)) || chap[0];
  const duree = chap.reduce((t, l) => t + l.min, 0);
  const mots = ['Revenu net imposable', 'Tranche', 'Taux marginal', 'Taux moyen', 'Quotient familial', 'Parts', 'Prélèvement à la source', 'Crédit d’impôt', 'Réduction d’impôt', 'PFU', 'Revenu fiscal de référence', 'TVA'];
  const numSuite = suite.titre.split(' — ')[0].toLowerCase();
  return `${bandeauUnivers('vie')}<div class="section-titre"><h2>🧾 Comprendre les impôts</h2><div class="droite"><span class="badge">${pp.n}/${pp.total} chapitres acquis</span></div></div>
    <p class="chapo">${esc(INTROS.impots)}</p>
    <div class="note douce"><span class="e">⚖️</span><div><b>Un cours, pas un conseil fiscal.</b> Les règles et les montants changent chaque année avec la loi de finances : les chiffres du cours sont datés et servent à comprendre. Pour votre situation, utilisez le simulateur officiel d’<b>impots.gouv.fr</b>, <b>service-public.fr</b>, ou un professionnel compétent.</div></div>

    <section class="cours-tete">
      <div class="cours-couv"><span class="gros-e" aria-hidden="true">🧾</span><div><small>Le cours NaoInvest</small><h3>Les impôts, expliqués simplement</h3>
        <p>${chap.length} chapitres · environ ${duree} minutes · un quiz noté sur 100 à la fin de chaque chapitre · une attestation de parcours à la clé</p>
        ${prog(pp.pct, 'Progression du cours')}</div></div>
      <div class="cours-cta"><button class="btn gros" type="button" data-lecon="${suite.id}">${pp.fini ? '↻ Réviser le cours' : pp.n ? `▶ Reprendre au ${esc(numSuite)}` : '▶ Commencer le cours'}</button>
        ${pp.fini ? '<button class="btn fin" type="button" data-attestation="impots">🎓 Mon attestation</button>' : ''}
        ${S.objectif.parcours === 'impots' ? '<span class="badge ok">🎯 Mon objectif</span>' : '<button class="btn petit fin" type="button" data-objectif="impots">🎯 En faire mon objectif</button>'}</div>
    </section>

    <section class="bloc"><h3 class="bloc-titre">📑 Sommaire</h3>
      <ol class="sommaire">${chap.map((l, i) => {
        const et = etatLecon(l.id), morceaux = l.titre.split(' — ');
        const etat = !et ? '<span class="badge">À lire</span>' : acquise(l.id) && et.score >= SEUIL ? `<span class="badge ok">✓ ${et.meilleur}/100</span>` : `<span class="badge bientot">À revoir · ${et.score}/100</span>`;
        return `<li style="--i:${i}"><button type="button" class="chapitre ${acquise(l.id) ? 'acquis' : aRevoir(l.id) ? 'revoir' : ''}" data-lecon="${l.id}">
          <span class="num-ch">${i + 1}</span><span class="corps"><small>${esc(morceaux[0])} · ⏱ ${l.min} min</small><b>${esc(morceaux[1] || l.titre)}</b><span>${esc(l.intro)}</span></span>
          <span class="etat-ch">${etat}</span></button></li>`;
      }).join('')}</ol>
    </section>

    ${vueDocsImpots()}

    <section class="bloc"><h3 class="bloc-titre">🧮 L’atelier : calculer un impôt, tranche par tranche</h3>
      <div class="grille grille-calc">
        <form class="carte" id="calcForm" novalidate>
          <h3><span class="e">✏️</span>Vos chiffres d’exercice</h3>
          <div class="champ"><label for="calcRev">Revenu net imposable du foyer (en €)</label><input id="calcRev" type="number" min="0" step="100" value="${U.calc.rev}" inputmode="numeric"></div>
          <div class="champ"><label for="calcParts">Nombre de parts <small>(par quarts : 2,25 = couple + 1 enfant en garde alternée)</small></label><input id="calcParts" type="number" min="1" max="12" step="0.25" value="${U.calc.parts}" inputmode="decimal"></div>
          ${aideParts()}
          <p class="petit-texte">Rappel : personne seule 1 part ; couple marié ou pacsé 2 parts ; + 0,5 part pour chacun des deux premiers enfants, + 1 part à partir du troisième ; un enfant en garde alternée compte pour moitié.</p>
          <div class="note risque" style="margin-bottom:0"><span class="e">🧪</span><div>Calcul <b>simplifié et pédagogique</b>, avec le barème des ${esc(BAREME.annee)} : sans décote, sans plafonnement du quotient familial, sans réductions ni crédits d’impôt. Ce n’est pas le montant que vous paierez.</div></div>
        </form>
        <div class="carte" id="calcRes" aria-live="polite">${resultatCalcul()}</div>
      </div>
    </section>

    <section class="bloc"><h3 class="bloc-titre">📋 Le barème du cours</h3>
      <p class="petit-texte" style="margin:-4px 0 10px">Barème des ${esc(BAREME.annee)}, par part de quotient familial. Il est revalorisé chaque année : vérifiez le barème en vigueur sur impots.gouv.fr.</p>
      <div class="tableau-defile"><table class="tableau bareme"><thead><tr><th>Tranche de revenu (par part)</th><th>Taux</th><th>Ce que cela veut dire</th></tr></thead><tbody>
      ${BAREME.tranches.map(t => `<tr><td>${t.a === Infinity ? `Au-delà de ${nb(t.de)} €` : t.de ? `De ${nb(t.de + 1)} à ${nb(t.a)} €` : `Jusqu’à ${nb(t.a)} €`}</td><td><b>${t.taux} %</b></td>
        <td>${t.taux ? `${t.taux} centimes d’impôt pour chaque euro situé dans cette tranche` : 'Aucun impôt sur cette partie du revenu'}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="bloc"><h3 class="bloc-titre">📖 Les mots de l’impôt</h3>
      <div class="puces">${mots.map(m => `<button type="button" class="puce" data-mot="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <p class="petit-texte">Chaque mot ouvre sa définition dans le dictionnaire, avec un exemple.</p>
    </section>
    ${vueParcoursListe(['impots'])}`;
}
function resultatCalcul() {
  const rev = Math.max(0, +U.calc.rev || 0), parts = +U.calc.parts || 1, q = rev / parts;
  const lignes = impotParPart(q), parPart = lignes.reduce((t, l) => t + l.impot, 0), total = parPart * parts;
  const atteintes = lignes.filter(l => l.base > 0), marg = atteintes.length ? atteintes[atteintes.length - 1].taux : 0;
  const moyen = rev ? total / rev * 100 : 0, fp = n => nb(n, n % 1 ? 1 : 0);
  return `<h3><span class="e">🔍</span>Le calcul, étape par étape</h3>
    <ol class="etapes-calc">
      <li><b>Le quotient familial</b> : ${nb(rev)} € ÷ ${fp(parts)} = <b>${nb(Math.round(q))} €</b> par part.</li>
      <li><b>Le barème, tranche par tranche</b> (pour une part) :
        <div class="tranches-calc">${lignes.map(l => `<div class="tr ${l.base > 0 ? 'on' : ''}"><span>${l.taux} %</span><i><em style="width:${q ? Math.min(100, l.base / q * 100).toFixed(1) : 0}%"></em></i><small>${l.base > 0 ? `${nb(Math.round(l.base))} € × ${l.taux} % = <b>${nb(Math.round(l.impot))} €</b>` : '—'}</small></div>`).join('')}</div>
        Total pour une part : <b>${nb(Math.round(parPart))} €</b>.</li>
      <li><b>On multiplie par les parts</b> : ${nb(Math.round(parPart))} € × ${fp(parts)} = <b>${nb(Math.round(total))} €</b> d’impôt brut (avant décote, plafonnement, réductions et crédits).</li>
    </ol>
    <div class="chiffres"><div class="chiffre"><small>Impôt brut simplifié</small><b>${nb(Math.round(total))} €</b></div>
      <div class="chiffre"><small>Taux marginal</small><b>${marg} %</b></div><div class="chiffre"><small>Taux moyen</small><b>${nb(moyen, 1)} %</b></div></div>
    <p class="petit-texte">${marg ? `Le taux marginal de ${marg} % ne touche que la dernière portion du revenu : c’est pourquoi le taux moyen (${nb(moyen, 1)} %) est bien plus bas.` : 'Le quotient reste dans la tranche à 0 % : pas d’impôt sur le revenu dans ce calcul simplifié.'}</p>`;
}
function majCalcul() {
  U.calc = { rev: +$('#calcRev').value || 0, parts: +$('#calcParts').value || 1 };
  $('#calcRes').innerHTML = resultatCalcul();
}
document.addEventListener('input', e => { if (e.target.id === 'calcRev' || e.target.id === 'calcParts') majCalcul(); });
document.addEventListener('change', e => { if (e.target.id === 'calcParts') majCalcul(); });
document.addEventListener('submit', e => { if (e.target.id === 'calcForm') e.preventDefault(); });
