/* NaoGroup — le cadenas plein écran de l'administration.
   Entrée (clic sur « Administration ») : l'écran se voile de violet, la clé tourne, le cadenas s'ouvre,
   puis admin.html apparaît pendant que le cadenas ouvert s'efface.
   Sortie (« ← Le site » ou « Déconnexion » dans l'administration) : le cadenas ouvert se referme (clac),
   puis la page suivante apparaît pendant que le cadenas fermé s'efface.
   À charger dans le <head> de chaque page concernée (NaoGroup.html, admin.html, connexion.html) :
   la page d'arrivée reste cachée derrière le voile jusqu'à ce qu'il soit posé, sans éclair blanc.
   Rien ne bouge si l'appareil demande de « réduire les animations ». */
(function () {
  'use strict';
  var CLE = 'nao:cadenas';
  var calme = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  var CSS =
    'html.nao-cad-attente{background:#140E2C}html.nao-cad-attente body{visibility:hidden}' +
    '.nao-cad{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;' +
      'background:radial-gradient(circle at 50% 45%,#3B2384 0%,#22154F 45%,#120C2A 100%);opacity:0;transition:opacity .3s ease;pointer-events:all}' +
    '.nao-cad.vu{opacity:1}' +
    '.nao-cad svg{width:120px;height:140px;overflow:visible;filter:drop-shadow(0 18px 40px rgba(167,123,255,.55));transform:scale(.7);transition:transform .45s cubic-bezier(.2,1.4,.4,1)}' +
    '.nao-cad.vu svg{transform:scale(1)}' +
    '.nao-cad .anse{transform-box:view-box;transform-origin:86px 64px;transition:transform .38s cubic-bezier(.3,1.6,.5,1)}' +
    '.nao-cad.ouvert .anse{transform:translateY(-20px) rotate(-14deg)}' +
    '.nao-cad .serrure{transform-box:view-box;transform-origin:60px 92px;transition:transform .25s ease}' +
    '.nao-cad.ouvert .serrure{transform:rotate(90deg)}' +
    '.nao-cad .onde{transform-box:view-box;transform-origin:60px 92px;opacity:0}' +
    '.nao-cad.eclat .onde{animation:naoCadOnde .7s ease-out}' +
    '.nao-cad.clac svg{animation:naoCadClac .3s ease}' +
    '.nao-cad p{margin:0;font:italic 600 22px Georgia,"Times New Roman",serif;color:#fff;letter-spacing:.01em;opacity:0;transform:translateY(8px);transition:.35s ease .15s}' +
    '.nao-cad p small{display:block;margin-top:6px;font:600 11px system-ui,sans-serif;font-style:normal;letter-spacing:.14em;text-transform:uppercase;color:#C9B7F5;text-align:center}' +
    '.nao-cad.vu p{opacity:1;transform:none}' +
    '.nao-cad.part{opacity:0;transition:opacity .55s ease .1s}' +
    '.nao-cad.part svg{transform:scale(1.35);opacity:0;transition:transform .55s ease,opacity .45s ease}' +
    '.nao-cad.part.ferme svg{transform:scale(.6)}' +
    '.nao-cad.part p{opacity:0;transition:.25s}' +
    '@keyframes naoCadOnde{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(2.6)}}' +
    '@keyframes naoCadClac{0%,100%{transform:scale(1)}35%{transform:scale(.93) translateY(3px)}70%{transform:scale(1.04)}}';

  var SVG =
    '<svg viewBox="0 0 120 140" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="naoCadCorps" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FFFEF"/><stop offset=".5" stop-color="#A77BFF"/><stop offset="1" stop-color="#E99BFF"/></linearGradient>' +
        '<linearGradient id="naoCadAnse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9E2FF"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9B7F5"/></linearGradient>' +
      '</defs>' +
      '<circle class="onde" cx="60" cy="92" r="40" fill="none" stroke="#6FFFEF" stroke-width="3"/>' +
      '<g class="anse"><path d="M34 66V42a26 26 0 0 1 52 0v24" fill="none" stroke="url(#naoCadAnse)" stroke-width="11" stroke-linecap="round"/></g>' +
      '<rect x="18" y="60" width="84" height="66" rx="16" fill="url(#naoCadCorps)"/>' +
      '<rect x="18" y="60" width="84" height="22" rx="16" fill="#fff" opacity=".18"/>' +
      '<g class="serrure" fill="#1B1534"><circle cx="60" cy="88" r="8"/><rect x="56.5" y="90" width="7" height="18" rx="3.5"/></g>' +
    '</svg>';

  function lire() {
    try {
      var v = JSON.parse(sessionStorage.getItem(CLE) || 'null');
      sessionStorage.removeItem(CLE);
      return v && Date.now() - v.t < 6000 ? v.sens : null;
    } catch (e) { return null; }
  }
  function noter(sens) { try { sessionStorage.setItem(CLE, JSON.stringify({ sens: sens, t: Date.now() })); } catch (e) {} }

  var style = document.createElement('style'); style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  function voile(texte, sousTexte, etat) {
    var d = document.createElement('div');
    d.className = 'nao-cad' + (etat ? ' ' + etat : '');
    d.setAttribute('role', 'status');
    d.innerHTML = SVG + '<p>' + texte + '<small>' + sousTexte + '</small></p>';
    document.body.appendChild(d);
    d.getBoundingClientRect();   /* l'état de départ est posé avant la transition */
    return d;
  }
  function puis(ms, fn) { setTimeout(fn, ms); }

  var enCours = false;

  /* Entrée : le cadenas s'ouvre, puis on part vers `adresse`. */
  function entrer(adresse) {
    if (calme) { location.href = adresse; return; }
    if (enCours) return; enCours = true;
    var d = voile('Accès administration', 'NaoGroup', '');
    d.classList.add('vu');
    puis(380, function () { d.querySelector('.serrure').style.transform = 'rotate(90deg)'; });
    puis(640, function () { d.classList.add('ouvert', 'eclat'); });
    puis(1250, function () { noter('entree'); location.href = adresse; });
  }

  /* Sortie : le cadenas ouvert se referme, puis `suite` (une adresse, ou une fonction comme la déconnexion). */
  function sortir(suite) {
    var aller = function () { if (typeof suite === 'function') suite(); else location.href = suite; };
    if (calme) { aller(); return; }
    if (enCours) return; enCours = true;
    var d = voile('Administration fermée', 'À bientôt', 'ouvert');
    d.classList.add('vu');
    puis(420, function () { d.classList.remove('ouvert'); d.querySelector('.serrure').style.transform = 'rotate(90deg)'; });
    puis(780, function () { d.classList.add('clac'); d.querySelector('.serrure').style.transform = ''; });
    puis(1250, function () { noter('sortie'); aller(); });
  }

  /* À l'arrivée : la page était cachée ; on pose le voile dans l'état où on l'a quitté, puis il s'efface. */
  var arrivee = calme ? null : lire();
  if (arrivee) {
    document.documentElement.classList.add('nao-cad-attente');
    var poser = function () {
      var ouvert = arrivee === 'entree';
      var d = voile(ouvert ? 'Accès administration' : 'Administration fermée', ouvert ? 'NaoGroup' : 'À bientôt', ouvert ? 'ouvert vu' : 'vu ferme');
      d.querySelector('svg').style.transition = 'none';
      if (ouvert) d.querySelector('.serrure').style.transform = 'rotate(90deg)';
      document.documentElement.classList.remove('nao-cad-attente');
      d.getBoundingClientRect(); d.querySelector('svg').style.transition = '';
      puis(120, function () { d.classList.add('part'); });
      puis(800, function () { d.remove(); });
    };
    if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
  }

  window.NaoCadenas = { entrer: entrer, sortir: sortir };
})();
