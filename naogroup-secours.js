/* ============================================================
   NaoGroup — le bouton de secours.
   Sur chaque page qui charge naogroup-cloud.js (accueil, connexion, tous les outils),
   un petit onglet rouge « SOS » reste collé au bord gauche de l'écran, comme
   l'onglet des notes de NaoBudget. Un clic fait glisser un volet avec les numéros
   d'urgence (15, 17, 18, 112, 114…) et ce que chacun veut dire.
   Sur un téléphone, toucher un numéro l'appelle directement.
   Alt+S ouvre et ferme le volet ; Échap le ferme.
   Rien n'est enregistré, rien n'est envoyé : c'est une simple fiche.
   ============================================================ */
(function () {
  if (window.NaoSecours) return;
  try { if (window.top !== window.self) return; } catch (e) { return; }   /* pas dans une page encadrée */

  var PRINCIPAUX = [
    { num: '15', nom: 'SAMU', quoi: 'Urgence médicale : malaise, blessure grave, douleur dans la poitrine, difficulté à respirer, intoxication.', em: '🚑', coul: '#d6336c' },
    { num: '17', nom: 'Police · Gendarmerie', quoi: 'Agression, violence, vol en cours, danger immédiat pour sa sécurité ou celle des autres.', em: '🚓', coul: '#1c5fd4' },
    { num: '18', nom: 'Pompiers', quoi: 'Incendie, accident, personne coincée ou en danger, fuite de gaz, inondation.', em: '🚒', coul: '#e0461f' },
    { num: '112', nom: 'Urgence européenne', quoi: 'Toutes les urgences, dans tous les pays de l\'Union européenne. Gratuit, même depuis un téléphone verrouillé.', em: '🌍', coul: '#2b3a8c' },
    { num: '114', nom: 'Urgence par SMS', quoi: 'Pour les personnes sourdes ou malentendantes, ou quand on ne peut pas parler (violence à la maison…). Écrire un SMS.', em: '💬', coul: '#7048b6', sms: true }
  ];
  var AUTRES = [
    { num: '116117', aff: '116 117', nom: 'Médecin de garde', quoi: 'Le soir, le week-end et les jours fériés, quand ce n\'est pas une urgence vitale (selon les régions).' },
    { num: '196', nom: 'Urgence en mer', quoi: 'Personne en difficulté en mer ou sur la côte (CROSS).' },
    { num: '115', nom: 'SAMU social', quoi: 'Personne sans abri ou en détresse dans la rue.' },
    { num: '119', nom: 'Enfance en danger', quoi: 'Enfant maltraité ou en danger. 24 h/24, gratuit, n\'apparaît pas sur la facture.' },
    { num: '3919', nom: 'Violences Femmes Info', quoi: 'Écoute et conseils pour les victimes de violences. 24 h/24, gratuit, anonyme.' },
    { num: '3114', nom: 'Prévention du suicide', quoi: 'Pour soi ou pour un proche en souffrance. 24 h/24, gratuit.' },
    { num: '116000', aff: '116 000', nom: 'Enfant disparu', quoi: 'Disparition ou fugue d\'un enfant.' }
  ];

  var css = document.createElement('style');
  css.id = 'ng-secours-style';
  css.textContent =
    '#ng-sos{--s-fond:#fff;--s-fond-2:#faf6f7;--s-encre:#241f33;--s-encre-2:#5d566b;--s-bord:rgba(36,31,51,.12);--s-rouge:#d32f2f;' +
      'position:fixed;top:0;left:0;height:100vh;height:100dvh;z-index:2147483100;display:flex;align-items:stretch;' +
      'transform:translateX(-100%);transition:transform .32s cubic-bezier(.2,.8,.2,1);' +
      'font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-style:normal;color:var(--s-encre);text-align:left}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #ng-sos{--s-fond:#1f1b29;--s-fond-2:#28233470;--s-encre:#f1edf7;--s-encre-2:#b4adc2;--s-bord:rgba(255,255,255,.12)}}' +
    ':root[data-theme="dark"] #ng-sos{--s-fond:#1f1b29;--s-fond-2:#28233470;--s-encre:#f1edf7;--s-encre-2:#b4adc2;--s-bord:rgba(255,255,255,.12)}' +
    '#ng-sos *{box-sizing:border-box}' +
    '#ng-sos.on{transform:translateX(0)}' +
    '#ng-sos:not(.on) .ng-sos-in{visibility:hidden;transition:visibility 0s .32s}' +
    '#ng-sos .ng-sos-tab{position:absolute;left:100%;bottom:110px;display:flex;flex-direction:column;align-items:center;gap:6px;' +
      'border:0;margin:0;background:var(--s-rouge);color:#fff;border-radius:0 12px 12px 0;padding:11px 6px 12px 5px;cursor:pointer;' +
      'box-shadow:0 6px 18px -6px rgba(211,47,47,.6);opacity:.78;transition:opacity .2s,padding .2s;font:inherit}' +
    '#ng-sos .ng-sos-tab:hover,#ng-sos .ng-sos-tab:focus-visible,#ng-sos.on .ng-sos-tab{opacity:1;padding-left:9px}' +
    '#ng-sos .ng-sos-tab .em{font-size:15px;line-height:1}' +
    '#ng-sos .ng-sos-tab .mot{font-size:10.5px;font-weight:800;letter-spacing:.12em;writing-mode:vertical-rl;transform:rotate(180deg)}' +
    '#ng-sos .ng-sos-in{width:min(92vw,370px);height:100%;background:var(--s-fond);border-right:1px solid var(--s-bord);' +
      'box-shadow:22px 0 50px -28px rgba(36,31,51,.55);display:flex;flex-direction:column}' +
    '#ng-sos .ng-sos-hd{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;background:var(--s-rouge);color:#fff}' +
    '#ng-sos .ng-sos-hd b{font-size:16.5px;font-weight:700}' +
    '#ng-sos .ng-sos-hd small{display:block;font-size:12px;opacity:.88;font-weight:400}' +
    '#ng-sos .ng-sos-x{margin-left:auto;border:0;background:rgba(255,255,255,.18);color:#fff;width:30px;height:30px;border-radius:50%;' +
      'cursor:pointer;font:15px/1 inherit;flex:none}' +
    '#ng-sos .ng-sos-x:hover{background:rgba(255,255,255,.32)}' +
    '#ng-sos .ng-sos-corps{flex:1;overflow-y:auto;padding:12px 12px 6px;overscroll-behavior:contain}' +
    '#ng-sos a{text-decoration:none;color:inherit}' +
    '#ng-sos .ng-sos-p{display:flex;gap:11px;align-items:flex-start;padding:10px 11px;margin-bottom:8px;border-radius:12px;' +
      'border:1px solid var(--s-bord);background:var(--s-fond);transition:transform .15s,box-shadow .15s}' +
    '#ng-sos .ng-sos-p:hover{transform:translateY(-1px);box-shadow:0 8px 20px -12px rgba(36,31,51,.45)}' +
    '#ng-sos .ng-sos-num{flex:none;min-width:58px;height:46px;padding:0 8px;border-radius:10px;color:#fff;display:flex;align-items:center;' +
      'justify-content:center;font-size:22px;font-weight:800;letter-spacing:.01em}' +
    '#ng-sos .ng-sos-p b{display:block;font-size:14.5px}' +
    '#ng-sos .ng-sos-p div span{display:block;font-size:12.5px;color:var(--s-encre-2)}' +
    '#ng-sos h4{margin:14px 2px 6px;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--s-encre-2)}' +
    '#ng-sos .ng-sos-a{display:flex;gap:10px;align-items:baseline;padding:7px 4px;border-bottom:1px dashed var(--s-bord)}' +
    '#ng-sos .ng-sos-a:last-of-type{border-bottom:0}' +
    '#ng-sos .ng-sos-a strong{flex:none;min-width:62px;font-size:15px;color:var(--s-rouge)}' +
    '#ng-sos .ng-sos-a b{font-size:13.5px}' +
    '#ng-sos .ng-sos-a span{display:block;font-size:12px;color:var(--s-encre-2)}' +
    '#ng-sos .ng-sos-a:hover b{text-decoration:underline}' +
    '#ng-sos .ng-sos-conseil{margin:12px 0 8px;padding:10px 12px;border-radius:12px;background:var(--s-fond-2);border:1px solid var(--s-bord);font-size:12.5px}' +
    '#ng-sos .ng-sos-conseil b{display:block;margin-bottom:3px;font-size:13px}' +
    '#ng-sos .ng-sos-conseil ul{margin:0;padding-left:18px}' +
    '#ng-sos .ng-sos-ft{padding:8px 14px;border-top:1px solid var(--s-bord);font-size:11.5px;color:var(--s-encre-2);background:var(--s-fond-2)}' +
    '@media print{#ng-sos{display:none!important}}' +
    '@media (prefers-reduced-motion:reduce){#ng-sos,#ng-sos *{transition:none!important}}';

  function lien(o) { return (o.sms ? 'sms:' : 'tel:') + o.num; }

  function construire() {
    if (document.getElementById('ng-sos')) return;
    (document.head || document.documentElement).appendChild(css);
    var el = document.createElement('aside');
    el.id = 'ng-sos';
    el.setAttribute('aria-label', 'Numéros d\'urgence');
    el.innerHTML =
      '<button class="ng-sos-tab" type="button" aria-expanded="false" aria-controls="ng-sos-volet" title="Numéros d\'urgence (Alt+S)">' +
        '<span class="em" aria-hidden="true">🆘</span><span class="mot">Secours</span></button>' +
      '<div class="ng-sos-in" id="ng-sos-volet" role="dialog" aria-label="Numéros d\'urgence">' +
        '<div class="ng-sos-hd"><span style="font-size:22px" aria-hidden="true">🆘</span>' +
          '<div><b>Numéros d\'urgence</b><small>Gratuits, 24 h/24, depuis un fixe ou un portable</small></div>' +
          '<button class="ng-sos-x" type="button" title="Fermer (Échap)" aria-label="Fermer">✕</button></div>' +
        '<div class="ng-sos-corps">' +
          PRINCIPAUX.map(function (o) {
            return '<a class="ng-sos-p" href="' + lien(o) + '" title="' + (o.sms ? 'Écrire un SMS au ' : 'Appeler le ') + o.num + '">' +
              '<span class="ng-sos-num" style="background:' + o.coul + '">' + o.num + '</span>' +
              '<div><b>' + o.em + ' ' + o.nom + '</b><span>' + o.quoi + '</span></div></a>';
          }).join('') +
          '<div class="ng-sos-conseil"><b>Au téléphone</b><ul>' +
            '<li>Dites <b style="display:inline">où</b> vous êtes (adresse précise, étage, code).</li>' +
            '<li>Dites ce qui se passe et combien de personnes sont touchées.</li>' +
            '<li>Ne raccrochez pas le premier : on peut vous guider.</li></ul></div>' +
          '<h4>Autres numéros utiles</h4>' +
          AUTRES.map(function (o) {
            return '<a class="ng-sos-a" href="' + lien(o) + '" title="Appeler le ' + (o.aff || o.num) + '">' +
              '<strong>' + (o.aff || o.num) + '</strong><div><b>' + o.nom + '</b><span>' + o.quoi + '</span></div></a>';
          }).join('') +
        '</div>' +
        '<div class="ng-sos-ft">En France, outre-mer compris. Sur un téléphone, touchez un numéro pour appeler.</div>' +
      '</div>';
    document.body.appendChild(el);

    var tab = el.querySelector('.ng-sos-tab');
    function ouvert() { return el.classList.contains('on'); }
    function basculer(on) {
      on = on == null ? !ouvert() : !!on;
      el.classList.toggle('on', on);
      tab.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) { var p = el.querySelector('.ng-sos-p'); if (p) try { p.focus({ preventScroll: true }); } catch (e) {} }
    }
    tab.addEventListener('click', function () { basculer(); });
    el.querySelector('.ng-sos-x').addEventListener('click', function () { basculer(false); tab.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ouvert()) { basculer(false); tab.focus(); }
      else if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); basculer(); }
    });
    /* Un clic ailleurs dans la page referme le volet. */
    document.addEventListener('mousedown', function (e) { if (ouvert() && !el.contains(e.target)) basculer(false); }, true);
    window.NaoSecours = { ouvrir: function () { basculer(true); }, fermer: function () { basculer(false); } };
  }

  window.NaoSecours = window.NaoSecours || { ouvrir: function () {}, fermer: function () {} };
  if (document.body) construire(); else document.addEventListener('DOMContentLoaded', construire);
})();
