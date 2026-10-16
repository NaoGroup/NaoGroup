/* ============================================================
   NaoFactu — démarrage.
   ============================================================ */
'use strict';

charger();
initTheme();

/* Les motifs du fond : une petite famille de pictogrammes « facturation ».
   Positions, tailles et vitesses fixes (pas de hasard) : le fond est le même à chaque ouverture. */
(function motifs() {
  const M = {
    facture: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 11h6M9 14h6M9 17h3.5"/>',
    ticket: '<path d="M6 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 9h6M9 12h6M9 15h3"/>',
    euro: '<path d="M17 7.2A6.2 6.2 0 1 0 17 16.8"/><path d="M5 10.5h8M5 13.5h8"/>',
    coche: '<circle cx="12" cy="12" r="8.5"/><path class="trace" d="M8 12.4l2.7 2.7L16.2 9.6"/>',
    calcul: '<rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h3"/>',
    pieces: '<ellipse cx="12" cy="7" rx="6.5" ry="2.6"/><path d="M5.5 7v4.5c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6V7M5.5 11.5V16c0 1.4 2.9 2.6 6.5 2.6s6.5-1.2 6.5-2.6v-4.5"/>',
    pourcent: '<path d="M6.5 17.5l11-11"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
    payee: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path class="trace" d="M8.8 14l2.3 2.3 4.4-4.8"/>'
  };
  const ordre = ['facture', 'euro', 'coche', 'ticket', 'calcul', 'pourcent', 'payee', 'pieces', 'euro', 'facture', 'coche', 'ticket', 'pieces', 'payee', 'calcul', 'euro'];
  el('motifs').innerHTML = ordre.map((k, i) => {
    const gauche = (3 + i * 6.1 + (i % 3) * 1.7) % 96, taille = 24 + (i * 7) % 22, duree = 42 + (i * 11) % 34;
    const style = `left:${gauche.toFixed(1)}%;--t:${taille}px;--d:${duree}s;--r:${-(i * duree / ordre.length * 1.9 % duree).toFixed(1)}s;` +
      `--dx:${(i % 2 ? 1 : -1) * (18 + (i * 13) % 40)}px;--a0:${-14 + (i * 5) % 28}deg;--a1:${12 - (i * 7) % 26}deg;--r2:${(i * 1.3) % 7}s`;
    return `<svg viewBox="0 0 24 24" class="${k === 'coche' || k === 'payee' ? 'lueur' : ''}" style="${style}">${M[k]}</svg>`;
  }).join('');
})();
el('menu-toggle').onclick = () => el('side').classList.toggle('open');
document.addEventListener('click', e => {
  const s = el('side');
  if (s.classList.contains('open') && !e.target.closest('#side') && !e.target.closest('#menu-toggle')) s.classList.remove('open');
});
window.addEventListener('beforeunload', e => { if (EDIT && EDIT.sale) { e.preventDefault(); e.returnValue = ''; } });

/* L'entrée : la facture s'écrit (≈ 3 s). Un clic l'abrège ; elle se retire toute seule
   au bout de 4,4 s même si les animations sont gelées (onglet en arrière-plan), et
   n'est pas jouée du tout quand le système demande des animations réduites. */
function entree() {
  const intro = el('nf-intro');
  if (!intro) return 0;
  const finir = () => { if (intro.isConnected) intro.remove(); };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { finir(); return 0; }
  // le décor : les pictogrammes du fond, qui montent plus vite ; et les éclats du tampon
  el('nfi-motifs').innerHTML = el('motifs').innerHTML;
  el('nfi-eclats').innerHTML = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30 + (i % 2 ? 9 : -6)}deg"></i>`).join('');
  // le total se compte, de 0 à 2 400,00 €, pendant que la ligne de total apparaît
  const montant = el('nfi-montant'), cible = 2400, t0 = performance.now() + 1650, duree = 600;
  const compter = t => {
    if (!montant.isConnected) return;
    const p = Math.min(1, Math.max(0, (t - t0) / duree)), e = 1 - Math.pow(1 - p, 3);
    montant.textContent = money(cible * e);
    if (p < 1) requestAnimationFrame(compter);
  };
  requestAnimationFrame(compter);
  setTimeout(() => { if (montant.isConnected) montant.textContent = money(cible); }, 2400); // si l'onglet est en arrière-plan
  intro.addEventListener('click', () => {
    intro.style.animation = 'nfiSort .4s ease forwards';
    document.querySelector('.app').classList.add('nfi-entre');
    setTimeout(finir, 420);
  });
  intro.addEventListener('animationend', e => { if (e.animationName === 'nfiSort') { document.querySelector('.app').classList.add('nfi-entre'); finir(); } });
  setTimeout(finir, 4700);
  return 4000;
}

const nGen = genererRecurrences();
rendre();
const delaiEntree = entree();
if (nGen) setTimeout(() => toast(`🔁 ${nGen} facture${nGen > 1 ? 's' : ''} récurrente${nGen > 1 ? 's' : ''} préparée${nGen > 1 ? 's' : ''} en brouillon.`, 4200), 500 + delaiEntree);
