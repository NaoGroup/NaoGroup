/* ============================================================
   NaoGroup — la lettre d'accès, en vrai courrier.
   Quand un profil est créé (ou reçoit un nouveau mot de passe provisoire),
   l'administration ouvre cette lettre dans une fenêtre à part, prête à être
   enregistrée en PDF puis jointe à l'e-mail : en-tête NaoGroup, outils de la
   formule, accès dans un encadré, signature et tampon de la directrice.

   NaoLettre.ouvrir({ prenom, nom, entreprise, identifiant, mdp, formule, outils:[ids], nouveauMdp })
   NaoLettre.texteMail({ prenom, identifiant, nouveauMdp }) → le message d'accompagnement
   La page qui l'appelle doit charger naogroup-cloud.js et naogroup-logos.js.
   ============================================================ */
(function () {
'use strict';

var SITE_PUBLIC = 'https://naogroup.github.io/NaoGroup/';
var CONTACT = 'support.naogroup@gmail.com';
var SIGNATAIRE = 'L\'équipe NaoGroup', FONCTION = 'Service clients';

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
/* l'adresse de connexion : jamais un chemin de cet ordinateur (file://) dans un courrier */
function lienConnexion() {
  var u = (window.Nao && Nao.url) ? Nao.url('connexion.html') : '';
  return /^https?:/.test(u) ? u : SITE_PUBLIC + 'connexion.html';
}
function dateLongue(d) {
  var m = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
}
function deux(n) { return (n < 10 ? '0' : '') + n; }

/* Le tampon de la directrice : double cercle, texte qui tourne, le N au centre et la date,
   avec un grain d'encre irrégulier pour qu'il ait l'air vraiment apposé. */
function tampon(d) {
  var date = deux(d.getDate()) + ' · ' + deux(d.getMonth() + 1) + ' · ' + d.getFullYear();
  return '<svg class="tampon" viewBox="0 0 200 200" aria-hidden="true">' +
    '<defs><path id="tp-cercle" d="M100,100 m-73,0 a73,73 0 1,1 146,0 a73,73 0 1,1 -146,0"/>' +
    '<filter id="tp-encre" x="-5%" y="-5%" width="110%" height="110%">' +
    '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="g"/>' +
    '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.4" result="m"/>' +
    '<feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs>' +
    '<g filter="url(#tp-encre)" fill="none" stroke="#5B3FC4">' +
      '<circle cx="100" cy="100" r="93" stroke-width="4.5"/><circle cx="100" cy="100" r="85" stroke-width="1.4"/>' +
      '<circle cx="100" cy="100" r="58" stroke-width="1.4"/>' +
      '<text fill="#5B3FC4" stroke="none" font-family="Segoe UI,Arial,sans-serif" font-weight="800" font-size="14.5" letter-spacing="2.4">' +
        '<textPath href="#tp-cercle" textLength="452" lengthAdjust="spacing">NAOGROUP ✦ LA DIRECTION ✦ ACCÈS VALIDÉ ✦</textPath></text>' +
      '<path d="M84 117V83L116 113V81" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g fill="#5B3FC4" stroke="none"><circle cx="81" cy="127" r="3"/><circle cx="93.5" cy="130.5" r="3"/><circle cx="106.5" cy="130.5" r="3"/><circle cx="119" cy="127" r="3"/></g>' +
      '<text x="100" y="72" text-anchor="middle" fill="#5B3FC4" stroke="none" font-family="Segoe UI,Arial,sans-serif" font-weight="700" font-size="9.5" letter-spacing="1.5">' + date + '</text>' +
    '</g></svg>';
}

var CSS =
  '@page{size:A4;margin:0}' +
  '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  'html,body{margin:0;background:#E9E4F4}' +
  'body{font-family:"Segoe UI",-apple-system,Roboto,Arial,sans-serif;color:#2A2350;font-size:10.4pt;line-height:1.5}' +
  '.barre{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;padding:12px 16px;' +
    'background:#2A2160;color:#F3EFFB;font-size:13px}' +
  '.barre button{font:700 13px "Segoe UI",sans-serif;color:#1C1636;background:linear-gradient(135deg,#C9B7F5,#EBDFFD);border:0;border-radius:999px;padding:10px 18px;cursor:pointer}' +
  '.barre span{opacity:.75}' +
  '.feuille{position:relative;width:210mm;height:297mm;margin:18px auto;background:#fff;overflow:hidden;padding:15mm 17mm 13mm;' +
    'box-shadow:0 20px 50px -20px rgba(30,20,70,.45);display:flex;flex-direction:column}' +
  '@media print{html,body{background:#fff}.barre{display:none}.feuille{margin:0;box-shadow:none}}' +
  /* la bande de couleur à gauche et le grand N en filigrane */
  '.feuille::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5mm;background:linear-gradient(180deg,#6F55D0,#C39BF3 55%,#60ccc1)}' +
  '.filigrane{position:absolute;right:-28mm;bottom:-30mm;width:120mm;height:120mm;opacity:.045;pointer-events:none}' +
  '.tete{display:flex;align-items:center;gap:12px}' +
  '.tete .logo{width:15mm;height:15mm;border-radius:4.6mm;box-shadow:0 6px 14px -6px rgba(60,40,140,.6)}' +
  '.marque b{display:block;font:italic 700 21pt Georgia,serif;letter-spacing:-.01em;color:#2A2160;line-height:1}' +
  '.marque b span{color:#8E7BD4}' +
  '.marque small{display:block;margin-top:3px;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:#8A83A8}' +
  '.tete .ref{margin-left:auto;text-align:right;font-size:8.5pt;color:#6E6790}' +
  '.tete .ref em{display:inline-block;font-style:normal;font-weight:700;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#5B3FC4;' +
    'background:#F1ECFD;border-radius:99px;padding:3px 10px;margin-bottom:5px}' +
  '.filet{height:1.2px;margin:6mm 0 5mm;background:linear-gradient(90deg,#6F55D0,#C39BF3 60%,transparent)}' +
  '.dest{margin-left:auto;width:72mm;font-size:10.5pt;line-height:1.45}' +
  '.dest .a{font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#8A83A8}' +
  '.dest b{font-size:12pt}' +
  '.objet{margin:6mm 0 4mm;font-weight:700;color:#2A2160}' +
  '.objet span{font-weight:400;color:#6E6790}' +
  'h1{margin:0 0 3mm;font:italic 700 16pt Georgia,serif;color:#2A2160}' +
  'p{margin:0 0 3mm}' +
  '.outils{display:grid;grid-template-columns:repeat(3,1fr);gap:2.2mm;margin:1mm 0 5mm}' +
  '.outil{display:flex;align-items:center;gap:2.6mm;padding:1.8mm 2.4mm;border:1px solid #E6E0F6;border-radius:3mm;background:#FBFAFF}' +
  '.outil svg{width:7.4mm;height:7.4mm;border-radius:2.3mm;flex:none}' +
  '.outil b{display:block;font:italic 700 9.6pt Georgia,serif;color:#2A2160;line-height:1.15}' +
  '.outil small{display:block;font-size:7pt;color:#8A83A8;line-height:1.25}' +
  /* l'encadré des accès, comme un billet à détacher */
  '.acces{position:relative;display:grid;grid-template-columns:1fr auto;gap:4mm;align-items:center;margin:0 0 5mm;padding:4.5mm 5.5mm;' +
    'border:1.4px dashed #B9A8F0;border-radius:4mm;background:linear-gradient(135deg,#F7F3FF,#FFFFFF 60%)}' +
  '.acces h2{margin:0 0 2.5mm;font-size:7.5pt;letter-spacing:.16em;text-transform:uppercase;color:#5B3FC4}' +
  '.acces dl{display:grid;grid-template-columns:auto 1fr;gap:1.6mm 5mm;margin:0;align-items:baseline}' +
  '.acces dt{font-size:8.5pt;color:#6E6790}' +
  '.acces dd{margin:0;font-weight:600;color:#2A2160;word-break:break-all}' +
  '.acces code{font:700 12.5pt Consolas,"Courier New",monospace;letter-spacing:.06em;color:#2A2160;background:#EEE8FD;border-radius:1.6mm;padding:.6mm 2.2mm}' +
  '.acces .mdp code{letter-spacing:.16em;background:#2A2160;color:#fff}' +
  '.acces .cle{width:24mm;text-align:center;font-size:7.4pt;line-height:1.35;color:#6E6790}' +
  '.acces .cle svg{display:block;width:12mm;height:12mm;margin:0 auto 1.5mm}' +
  '.etapes{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:0 0 5mm}' +
  '.etapes div{display:flex;gap:2.4mm;align-items:flex-start;font-size:8.8pt;line-height:1.38}' +
  '.etapes i{flex:none;display:grid;place-items:center;width:6mm;height:6mm;border-radius:50%;font:700 9pt "Segoe UI",sans-serif;font-style:normal;color:#fff;' +
    'background:linear-gradient(135deg,#19F0D8,#8A5CFF 48%,#E99BFF)}' +
  '.fin{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:8mm}' +
  '.signe{position:relative;padding-top:2mm}' +
  '.signe .main{font:400 25pt "Segoe Script","Brush Script MT","Lucida Handwriting",cursive;color:#3B2E7E;transform:rotate(-4deg);' +
    'transform-origin:left bottom;margin:1mm 0 0 2mm;line-height:1.1}' +
  '.signe .nom{margin-top:1.5mm;font-weight:700;color:#2A2160}' +
  '.signe .fct{font-size:8.5pt;color:#6E6790}' +
  '.tampon{position:absolute;left:66mm;top:-4mm;width:37mm;height:37mm;transform:rotate(-13deg);opacity:.92;mix-blend-mode:multiply}' +
  '.pied{margin-top:6mm;padding-top:3mm;border-top:1px solid #ECE7F7;display:flex;justify-content:space-between;gap:6mm;font-size:7.4pt;color:#8A83A8}' +
  '.pied b{color:#5B3FC4;font-weight:600}';

function lettre(d, defs) {
  var maintenant = new Date();
  var prenom = d.prenom || '', nomComplet = ((d.prenom || '') + ' ' + (d.nom || '')).trim() || d.identifiant;
  var outils = (d.outils || []).map(function (id) { return window.Nao && Nao.outilParId ? Nao.outilParId(id) : null; }).filter(Boolean);
  var lien = lienConnexion();
  var jeton = function (sym) { return '<svg viewBox="0 0 40 40" aria-hidden="true"><use href="#' + esc(sym) + '"/></svg>'; };
  var intro = d.nouveauMdp
    ? '<p>Comme convenu, voici un nouveau mot de passe provisoire pour votre espace NaoGroup. Vos outils et tout ce que vous y avez ' +
      'saisi sont restés à leur place : seul le mot de passe change.</p>'
    : '<p>C\'est avec une vraie joie que je vous ouvre aujourd\'hui les portes de NaoGroup. Vos outils vous attendent, vierges et prêts ' +
      'à accueillir votre quotidien : rien n\'y a été saisi, et ce que vous y écrirez ne sera visible par personne d\'autre que vous.</p>';
  var blocOutils = outils.length && !d.nouveauMdp
    ? '<p>' + (d.formule ? 'Votre formule <b>' + esc(d.formule) + '</b> vous ouvre ' : 'Votre accès vous ouvre ') +
      (outils.length > 1 ? 'ces ' + outils.length + ' outils :' : 'cet outil :') + '</p>' +
      '<div class="outils">' + outils.map(function (o) {
        return '<div class="outil">' + jeton(o.symbole) + '<div><b>' + esc(o.nom) + '</b><small>' + esc(o.role) + '</small></div></div>';
      }).join('') + '</div>'
    : '';
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Lettre d\'accès NaoGroup — ' + esc(nomComplet) + '</title><style>' + CSS + '</style></head><body>' +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + defs + '</svg>' +
    '<div class="barre"><button type="button" onclick="window.print()">Enregistrer en PDF</button>' +
      '<span>Dans la fenêtre qui s\'ouvre, choisissez « Enregistrer au format PDF », puis joignez le fichier à votre e-mail.</span></div>' +
    '<div class="feuille">' +
      '<svg class="filigrane" viewBox="0 0 40 40" aria-hidden="true"><path d="M12 27V11L28 25V9.5" fill="none" stroke="#5B3FC4" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<div class="tete">' + jeton('l-gr').replace('<svg ', '<svg class="logo" ') +
        '<div class="marque"><b>Nao<span>Group</span></b><small>Des outils pour la vie de tous les jours</small></div>' +
        '<div class="ref"><em>Lettre d\'accès personnelle</em><br>Le ' + dateLongue(maintenant) + '</div></div>' +
      '<div class="filet"></div>' +
      '<div class="dest"><div class="a">À l\'attention de</div><b>' + esc(nomComplet) + '</b>' + (d.entreprise ? '<br>' + esc(d.entreprise) : '') + '</div>' +
      '<div class="objet">Objet : <span>' + (d.nouveauMdp ? 'votre nouveau mot de passe provisoire' : 'bienvenue chez NaoGroup — votre accès personnel') + '</span></div>' +
      '<h1>Bonjour' + (prenom ? ' ' + esc(prenom) : '') + ',</h1>' + intro + blocOutils +
      '<div class="acces"><div><h2>Vos accès</h2><dl>' +
        '<dt>Adresse</dt><dd>' + esc(lien) + '</dd>' +
        '<dt>Identifiant</dt><dd><code>' + esc(d.identifiant) + '</code></dd>' +
        '<dt>Mot de passe provisoire</dt><dd class="mdp"><code>' + esc(d.mdp) + '</code></dd></dl></div>' +
        '<div class="cle"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="9" y="17" width="22" height="17" rx="4.5" fill="#EEE8FD" stroke="#6F55D0" stroke-width="2.2"/>' +
          '<path d="M14 17v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#6F55D0" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="25" r="2.4" fill="#6F55D0"/></svg>' +
          'Ne sert qu\'une fois : vous choisirez aussitôt le vôtre.</div></div>' +
      '<div class="etapes"><div><i>1</i><span>Ouvrez l\'adresse ci-dessus sur l\'appareil de votre choix.</span></div>' +
        '<div><i>2</i><span>Saisissez votre identifiant et ce mot de passe provisoire.</span></div>' +
        '<div><i>3</i><span>Choisissez votre propre mot de passe : c\'est prêt.</span></div></div>' +
      '<p>Une question, une idée, un petit souci ? Écrivez-moi à <b>' + CONTACT + '</b> : je lis chaque message et je vous réponds personnellement.</p>' +
      '<div class="fin"><div class="signe"><div>Au plaisir de vous accompagner au quotidien,</div>' +
        '<div class="main">' + esc(SIGNATAIRE) + '</div><div class="nom">' + esc(SIGNATAIRE) + '</div><div class="fct">' + esc(FONCTION) + '</div>' +
        tampon(maintenant) + '</div></div>' +
      '<div class="pied"><span><b>NaoGroup</b> · ' + CONTACT + ' · naogroup.github.io/NaoGroup</span>' +
        '<span>Courrier personnel : gardez-le pour vous.</span></div>' +
    '</div>' +
    '<script>addEventListener("load",function(){setTimeout(function(){window.print()},450)})<\/script>' +
    '</body></html>';
}

/* Les dégradés et symboles des jetons, repris de la page qui appelle (chargés par naogroup-logos.js). */
function defsDesLogos() {
  var s = document.getElementById('l-gr');
  return s && s.parentNode ? s.parentNode.outerHTML.replace(/^<defs[^>]*>/, '<defs>') : '';
}

function ouvrir(d) {
  var f = window.open('', '_blank');
  if (!f) { alert('La fenêtre de la lettre a été bloquée : autorisez les fenêtres pour cette page, puis recommencez.'); return; }
  f.document.open();
  f.document.write(lettre(d, defsDesLogos()));
  f.document.close();
}

function texteMail(d) {
  return 'Bonjour' + (d.prenom ? ' ' + d.prenom : '') + ',\n\n' +
    (d.nouveauMdp
      ? 'Vous trouverez en pièce jointe votre lettre NaoGroup avec votre nouveau mot de passe provisoire.\n\n'
      : 'Bienvenue chez NaoGroup ! Vous trouverez en pièce jointe votre lettre d\'accès personnelle : votre identifiant, ' +
        'votre mot de passe provisoire et les trois petites étapes pour commencer.\n\n') +
    'Votre identifiant : ' + d.identifiant + '\nAdresse de connexion : ' + lienConnexion() + '\n\n' +
    'À votre première connexion, vous choisirez votre propre mot de passe. Pour toute question, je suis là : ' + CONTACT + '.\n\n' +
    'Au plaisir de vous accompagner au quotidien,\n\n' + SIGNATAIRE + '\n' + FONCTION;
}

window.NaoLettre = { ouvrir: ouvrir, texteMail: texteMail, lienConnexion: lienConnexion,
  page: function (d) { return lettre(d, defsDesLogos()); } };
})();
