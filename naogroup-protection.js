/* ============================================================
   NaoGroup — protection contre la copie
   Chargé par toutes les pages (directement, ou par naogroup-cloud.js pour les outils).

   À savoir : aucun site ne peut empêcher techniquement de récupérer son HTML — le navigateur
   doit le recevoir pour l'afficher. Ce fichier décourage la copie ordinaire (clic droit,
   sélection, copier, glisser une image, « afficher le code source », outils de développement) ;
   la vraie protection est juridique : voir « Propriété intellectuelle » dans les mentions légales.

   · Pages vitrine : tout est bloqué, sauf dans les champs de saisie.
   · Dans un outil (script naogroup-cloud.js avec data-outil) ou une page marquée
     <html data-copie-libre> (administration) : le client doit pouvoir copier SES propres textes
     (une lettre de NaoCV, une facture) ; seuls le clic droit hors des champs, le code source,
     les outils de développement et le glisser d'images sont bloqués.
   · Un bloc marqué data-copiable reste toujours sélectionnable.
   ============================================================ */
(function () {
  'use strict';
  if (window.NaoProtection) return;
  window.NaoProtection = true;

  var libre = !!document.querySelector('script[src*="naogroup-cloud.js"][data-outil]') ||
    document.documentElement.hasAttribute('data-copie-libre');

  function saisie(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      var t = n.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || n.isContentEditable || n.hasAttribute('data-copiable')) return true;
    }
    return false;
  }
  function cible(e) { var t = e.target; return t && t.nodeType === 3 ? t.parentNode : t; }
  function dansSaisie() { var a = document.activeElement; return !!(a && saisie(a)); }

  document.addEventListener('contextmenu', function (e) { if (!saisie(cible(e))) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) {
    var t = cible(e);
    if (t && (t.tagName === 'IMG' || (t.closest && t.closest('svg')))) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    var dev = k === 'f12' || (mod && k === 'u') ||
      (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
      (mod && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u'));
    if (dev) { e.preventDefault(); return; }
    if (libre) return;
    if (mod && k === 's') { e.preventDefault(); return; }
    if (mod && (k === 'a' || k === 'c' || k === 'x') && !dansSaisie()) e.preventDefault();
  }, true);

  if (libre) return;
  document.addEventListener('selectstart', function (e) { if (!saisie(cible(e))) e.preventDefault(); });
  ['copy', 'cut'].forEach(function (t) {
    document.addEventListener(t, function (e) { if (!dansSaisie()) e.preventDefault(); });
  });
  var st = document.createElement('style');
  st.textContent = 'html{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    'input,textarea,select,[contenteditable],[contenteditable] *,[data-copiable],[data-copiable] *{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}' +
    'img,svg{-webkit-user-drag:none}';
  (document.head || document.documentElement).appendChild(st);
})();
