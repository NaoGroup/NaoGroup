/* ============================================================
   NaoBudget — les petites blagues
   Un budget, c'est sérieux ; le ton ne l'est pas forcément.
   Chaque événement pioche une réplique au hasard, jamais deux
   fois la même d'affilée. Tout se coupe depuis les Réglages.
   ============================================================ */

const HUMOUR_KEY = 'naobudget.humour';
let humourOn = (() => {
  try { return localStorage.getItem(HUMOUR_KEY) !== 'off'; } catch (e) { return true; }
})();
function setHumour(on) {
  humourOn = !!on;
  try { localStorage.setItem(HUMOUR_KEY, on ? 'on' : 'off'); } catch (e) {}
}

/* Les libellés qui sentent la contravention. */
const AMENDE_RE = /amende|contravention|\bpv\b|radar|stationnement|fourriere|fourrière|exces de vitesse|excès de vitesse|proces.verbal|procès.verbal/;

const BLAGUES = {
  rejet: [
    '❌ Rejeté. Le compte a dit non, et il a été très clair.',
    '💸 Prélèvement refusé — retour à l’envoyeur.',
    '🚧 La banque a posé un plot orange devant celui-là.',
    '🙅 Refusé. On réessaiera quand le compte sera de meilleure humeur.',
    '📮 Retourné à l’expéditeur, avec un petit mot d’excuse.',
    '🛑 Rejeté. Ce n’est que partie remise… en principe.',
    '😬 Rejeté. Personne n’a rien vu, on n’en parle plus.',
    '🥊 Le compte a esquivé.',
    '📉 Refusé pour cause de compte fatigué.'
  ],
  amende: [
    '🚓 Radar 1 — toi 0.',
    '📸 Sourire ! Ça fera {montant}.',
    '🏛️ Merci pour ta généreuse contribution au budget de l’État.',
    '🚗 Le stationnement créatif, ça se paie.',
    '📄 Une amende : l’abonnement qu’on n’a jamais souscrit.',
    '⚖️ La loi a gagné cette manche.',
    '🐌 La prochaine fois, plus lentement : c’est moins cher.',
    '💌 Une lettre de l’État. Ce n’était pas une carte postale.'
  ],
  amendePayee: [
    '⚖️ Amende réglée. La République te pardonne.',
    '🚓 Dette envers la société : soldée.',
    '🕊️ Casier du mois : à nouveau vierge.'
  ],
  paye: [
    '✅ Et hop, un de moins.',
    '💪 Payé. Le mois avance.',
    '🎯 Réglé, sans douleur.',
    '🧾 Un prélèvement passé comme une lettre à la poste.',
    '👌 Celui-là est derrière nous.'
  ],
  moisBoucle: [
    '🎉 Tout est payé ce mois-ci. Champagne — un petit, il reste le mois prochain.',
    '🏁 Mois bouclé, plus rien ne traîne.',
    '🧹 Plus une ligne en attente. Impeccable.'
  ],
  rouge: [
    '🔴 Le mois vient de passer dans le rouge. On respire.',
    '🥶 Reste négatif… c’est la semaine des pâtes.',
    '🫣 Le mois est dans le rouge. On fera semblant de ne pas avoir vu.'
  ],
  gros: [
    '😮 Grosse sortie — {montant}. On note, on ne juge pas.',
    '💨 Le compte a senti passer celui-là.',
    '🫠 {montant} d’un coup. Courage.'
  ],
  epargne: [
    '🐖 Le cochon grossit.',
    '🏦 Mis de côté = pas dépensé. C’est de la triche légale.',
    '🌱 Ça, c’est de l’argent qui dort bien.'
  ],
  /* Une rentrée d'argent n'est pas une dépense : elle a ses propres mots. */
  rentree: [
    '🤑 Ça rentre, c\u2019est déjà ça.',
    '💶 Bonne nouvelle : {montant} de plus.',
    '📈 Le compte remonte.',
    '🙂 Une entrée d\u2019argent, ça fait toujours plaisir.'
  ],
  grosseRentree: [
    '🥳 Grosse rentrée — {montant} !',
    '🎊 {montant} : le compte respire enfin.',
    '🏆 Belle entrée d\u2019argent. Profitez-en pour mettre de côté.',
    '🤩 {montant} d\u2019un coup. On prend.'
  ],
  encaisse: [
    '💰 Encaissé.',
    '✅ Bien arrivé sur le compte.',
    '🙌 L\u2019argent est là.',
    '📬 Reçu, et bien reçu.'
  ],
  carburant: [
    '⛽ Ta voiture boit plus que toi.',
    '🚗 Encore du carburant ? Elle a soif, cette petite.'
  ]
};

/* La couleur du bandeau dépend de ce qui vient de se passer. */
const HUMOUR_TON = {
  rejet: 'ko', rouge: 'ko',
  amende: 'pol', amendePayee: 'ok',
  paye: 'ok', moisBoucle: 'fete', epargne: 'ok',
  gros: 'warn', carburant: 'warn',
  rentree: 'ok', grosseRentree: 'fete', encaisse: 'ok'
};

/* ---------- Le bandeau ----------
   Un petit toast en bas d'écran se rate une fois sur deux. Celui-ci arrive
   en haut, au milieu, en grand, avec une barre qui montre le temps restant —
   et il s'arrête de défiler tant que la souris est dessus. */
let gagTimer = null;
function gag(msg, ton) {
  const vieux = document.getElementById('gag');
  if (vieux) vieux.remove();
  clearTimeout(gagTimer);
  const bout = msg.split(' ');
  const em = bout[0], txt = bout.slice(1).join(' ');
  const n = document.createElement('div');
  n.id = 'gag';
  n.className = 'gag ' + (ton || 'fun');
  n.innerHTML = `<span class="ge">${em}</span><span class="gt">${txt}</span>
    <button class="gx" title="Fermer">✕</button><i class="gp"></i>`;
  document.body.appendChild(n);
  const fin = () => {
    n.classList.add('out');
    setTimeout(() => n.remove(), 340);
  };
  gagTimer = setTimeout(fin, 5200);
  n.addEventListener('click', fin);
  /* on laisse le temps de lire : au survol, tout se met en pause */
  n.addEventListener('mouseenter', () => { clearTimeout(gagTimer); n.classList.add('pause'); });
  n.addEventListener('mouseleave', () => { n.classList.remove('pause'); gagTimer = setTimeout(fin, 2200); });
  return n;
}

/* Pluie de confettis sur toute la page — pour les grandes occasions. */
function pluie(n) {
  if (!humourOn || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const cols = ['#7257CF', '#C39BF3', '#4FC0B4', '#E8A05C', '#E7738B', '#D9B44A', '#9B82E8'];
  const box = document.createElement('div');
  box.className = 'pluie';
  let h = '';
  for (let i = 0; i < (n || 46); i++) {
    h += `<b style="left:${(Math.random() * 100).toFixed(1)}%;background:${cols[i % cols.length]};
      --rot:${Math.round(Math.random() * 900 - 450)}deg;
      animation-duration:${(2 + Math.random() * 1.6).toFixed(2)}s;
      animation-delay:${(Math.random() * 0.7).toFixed(2)}s;
      width:${(6 + Math.random() * 6).toFixed(0)}px;height:${(9 + Math.random() * 8).toFixed(0)}px"></b>`;
  }
  box.innerHTML = h;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4200);
}

let derniereBlague = {};
function blague(cat, montant) {
  const pool = BLAGUES[cat]; if (!pool || !pool.length) return '';
  let m, tours = 0;
  do { m = pool[Math.floor(Math.random() * pool.length)]; tours++; }
  while (pool.length > 1 && m === derniereBlague[cat] && tours < 8);
  derniereBlague[cat] = m;
  return m.replace('{montant}', montant ? money(montant) : 'ça');
}
/* Affiche une réplique — sauf si l'humour est coupé. */
function rire(cat, montant) {
  if (!humourOn) return false;
  const m = blague(cat, montant);
  if (!m) return false;
  gag(m, HUMOUR_TON[cat] || 'fun');
  if (cat === 'moisBoucle') pluie(60);
  return true;
}
const estAmende = l => AMENDE_RE.test(noAcc(l && l.label));
const estCarburant = l => /carburant|essence|gazole|diesel|station/.test(noAcc(l && l.label));
