/* ============================================================
   NaoGroup — le mur des notifications (accueil, administratrice seulement).
   Les demandes de la page Contact et les avis reçus apparaissent dans un
   panneau sur le côté droit ; une cloche dans la barre du haut l'ouvre ou
   le ferme et compte ce qui n'a pas encore été vu. Toutes les minutes, la
   page regarde s'il y a du nouveau : une petite notification s'affiche
   (et une notification de l'ordinateur si vous l'avez autorisée).
   « Vu » est gardé sur cet appareil seulement : le statut de la demande
   ne change que dans l'administration.
   ============================================================ */
(function () {
  if (typeof Nao === 'undefined' || !Nao.configure) return;

  var CLE_VUS = 'ng:notifs:vus', CLE_OUVERT = 'ng:notifs:ouvert', CLE_BUREAU = 'ng:notifs:bureau';
  var TYPES = { question: 'Question', souscription: 'Souscription', acces: 'Ouverture d\'un outil', mdp: 'Mot de passe oublié', autre: 'Message' };
  var ICONES = { question: '✉️', souscription: '💳', acces: '🔓', mdp: '🔑', autre: '✉️', avis: '⭐' };
  var C = null, ITEMS = [], connus = null, mur, cloche, liste, minuteur;

  function lire(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var vus = lire(CLE_VUS, []);
  function estVu(id) { return vus.indexOf(id) >= 0; }
  function marquerVus() {
    var ajout = ITEMS.filter(function (x) { return !estVu(x.id); }).map(function (x) { return x.id; });
    if (!ajout.length) return;
    vus = ajout.concat(vus).slice(0, 400); ecrire(CLE_VUS, vus); dessiner();
  }

  function ilYA(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'à l\'instant';
    if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h';
    if (s < 7 * 86400) { var j = Math.floor(s / 86400); return j === 1 ? 'hier' : 'il y a ' + j + ' jours'; }
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
  function court(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }

  /* ---------- style ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.bar nav .ng-cloche{position:relative;font:inherit;font-family:var(--ui,sans-serif);font-style:normal;font-size:15px;line-height:1;' +
      'background:transparent;border:1px solid var(--bord-2,rgba(255,255,255,.3));color:#fff;border-radius:999px;padding:7px 11px;cursor:pointer}' +
    '.bar nav .ng-cloche:hover,.bar nav .ng-cloche[aria-expanded="true"]{background:var(--verre,rgba(255,255,255,.07))}' +
    '.ng-cloche b{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;font-size:10.5px;' +
      'line-height:18px;font-weight:800;color:#1C1636;background:linear-gradient(135deg,#6FFFEF,#C46BFF);box-shadow:0 0 0 2px #2a1d66}' +
    '.ng-cloche b[hidden]{display:none}' +
    '.ng-cloche.sonne{animation:ngSonne .9s ease}' +
    '@keyframes ngSonne{0%,100%{transform:none}20%{transform:rotate(14deg)}40%{transform:rotate(-12deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-4deg)}}' +
    '#ng-mur{position:fixed;z-index:60;top:84px;right:16px;bottom:16px;width:330px;display:flex;flex-direction:column;' +
      'font-family:var(--ui,sans-serif);font-style:normal;color:var(--ink,#F3EFFB);background:rgba(28,19,72,.82);' +
      '-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--bord,rgba(255,255,255,.16));' +
      'border-radius:22px;box-shadow:0 26px 60px -30px rgba(0,0,0,.85);transition:transform .35s ease,opacity .35s ease}' +
    '#ng-mur[hidden]{display:flex;transform:translateX(calc(100% + 30px));opacity:0;pointer-events:none;visibility:hidden}' +
    '#ng-mur .ng-tete{display:flex;align-items:center;gap:8px;padding:15px 16px 11px;border-bottom:1px solid rgba(255,255,255,.1)}' +
    '#ng-mur .ng-tete h3{margin:0;font-size:14.5px;font-weight:700;color:#fff;flex:1}' +
    '#ng-mur .ng-tete h3 small{display:block;font-size:11px;font-weight:500;color:var(--ink-3,rgba(243,239,251,.5));margin-top:2px}' +
    '#ng-mur .ng-tete button{background:transparent;border:1px solid rgba(255,255,255,.18);color:var(--ink-2,#ddd);border-radius:999px;' +
      'font:inherit;font-size:12px;padding:5px 9px;cursor:pointer}' +
    '#ng-mur .ng-tete button:hover{background:rgba(255,255,255,.08);color:#fff}' +
    '#ng-mur .ng-tete button[aria-pressed="true"]{border-color:#6FFFEF;color:#6FFFEF}' +
    '#ng-mur ol{list-style:none;margin:0;padding:8px;overflow:auto;flex:1}' +
    '#ng-mur li a{display:flex;gap:11px;padding:11px 10px;border-radius:14px;text-decoration:none;color:inherit;position:relative}' +
    '#ng-mur li a:hover{background:rgba(255,255,255,.07)}' +
    '#ng-mur li .ic{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:16px;background:rgba(255,255,255,.09)}' +
    '#ng-mur li .tx{min-width:0;flex:1}' +
    '#ng-mur li .l1{display:flex;gap:6px;align-items:baseline;font-size:13px;color:#fff;font-weight:650}' +
    '#ng-mur li .l1 span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
    '#ng-mur li .l1 time{flex:none;font-size:10.5px;font-weight:500;color:var(--ink-3,rgba(243,239,251,.5))}' +
    '#ng-mur li .l2{font-size:12px;color:var(--ink-2,rgba(243,239,251,.74));margin-top:1px}' +
    '#ng-mur li .l3{font-size:12px;color:var(--ink-3,rgba(243,239,251,.5));margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '#ng-mur li.neuf a::before{content:"";position:absolute;left:3px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#6FFFEF;box-shadow:0 0 8px #6FFFEF}' +
    '#ng-mur li.neuf .ic{background:linear-gradient(135deg,rgba(111,255,239,.25),rgba(196,107,255,.3))}' +
    '#ng-mur .ng-vide{padding:30px 18px;text-align:center;color:var(--ink-3,rgba(243,239,251,.5));font-size:13px;line-height:1.5}' +
    '#ng-mur .ng-vide b{display:block;font-size:26px;margin-bottom:6px}' +
    '#ng-mur .ng-pied{padding:11px 16px 14px;border-top:1px solid rgba(255,255,255,.1);font-size:12.5px}' +
    '#ng-mur .ng-pied a{color:var(--lilas,#C9B7F5);text-decoration:none}' +
    '#ng-mur .ng-pied a:hover{color:#fff}' +
    '.ng-toasts{position:fixed;z-index:70;left:50%;bottom:22px;transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}' +
    '.ng-toast{pointer-events:auto;cursor:pointer;font-family:var(--ui,sans-serif);font-style:normal;font-size:13px;color:#1C1636;font-weight:600;' +
      'background:linear-gradient(135deg,#6FFFEF,#C9B7F5);border-radius:999px;padding:10px 18px;box-shadow:0 14px 34px -12px rgba(0,0,0,.7);' +
      'animation:ngToast .4s ease both;max-width:min(92vw,460px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '@keyframes ngToast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    /* grand écran : le mur prend sa place à droite, la page se resserre à côté */
    '@media (min-width:1100px){html.ng-mur-ouvert .page{margin-right:362px}}' +
    '@media (max-width:640px){#ng-mur{top:70px;left:10px;right:10px;bottom:10px;width:auto}}' +
    '@media (prefers-reduced-motion:reduce){#ng-mur{transition:none}.ng-cloche.sonne,.ng-toast{animation:none}}';
  document.head.appendChild(css);

  /* ---------- petites notifications ---------- */
  var zoneToasts;
  function toast(texte, clic) {
    if (!zoneToasts) { zoneToasts = document.createElement('div'); zoneToasts.className = 'ng-toasts'; zoneToasts.setAttribute('aria-live', 'polite'); document.body.appendChild(zoneToasts); }
    var t = document.createElement('div'); t.className = 'ng-toast'; t.textContent = texte;
    t.addEventListener('click', function () { t.remove(); if (clic) clic(); });
    zoneToasts.appendChild(t);
    setTimeout(function () { t.remove(); }, 7000);
  }
  function bureau(x) {
    if (!lire(CLE_BUREAU, false) || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      var n = new Notification(x.titre, { body: x.detail || x.sous, tag: 'naogroup-' + x.id, icon: Nao.url('icones/naogroup-192.png') });
      n.onclick = function () { window.focus(); ouvrirDansAdmin(x); n.close(); };
    } catch (e) {}
  }

  /* ---------- lien vers l'administration (avec le cadenas, comme le bouton « Administration ») ---------- */
  function lienDe(x) { return Nao.url('admin.html') + '?' + (x.genre === 'avis' ? 'avis=' : 'demande=') + encodeURIComponent(x.id); }
  function ouvrirDansAdmin(x) { var u = x ? lienDe(x) : Nao.url('admin.html'); if (window.NaoCadenas) NaoCadenas.entrer(u); else location.href = u; }

  /* ---------- le mur ---------- */
  function construire() {
    var nav = document.querySelector('.bar nav');
    cloche = document.createElement('button'); cloche.type = 'button'; cloche.className = 'ng-cloche';
    cloche.setAttribute('aria-controls', 'ng-mur'); cloche.title = 'Notifications';
    cloche.innerHTML = '<span aria-hidden="true">🔔</span><b hidden></b>';
    cloche.addEventListener('click', function () { basculer(); });
    if (nav) { var moi = nav.querySelector('.moi'); nav.insertBefore(cloche, moi || null); }
    else { cloche.style.cssText = 'position:fixed;top:16px;right:16px;z-index:61'; document.body.appendChild(cloche); }

    mur = document.createElement('aside'); mur.id = 'ng-mur'; mur.setAttribute('aria-label', 'Notifications');
    mur.innerHTML =
      '<div class="ng-tete"><h3>🔔 Notifications<small id="ngMurCompte">Chargement…</small></h3>' +
        ('Notification' in window ? '<button type="button" id="ngMurBureau" title="Recevoir aussi une notification de l\'ordinateur">🖥️</button>' : '') +
        '<button type="button" id="ngMurFermer" title="Fermer le panneau" aria-label="Fermer">✕</button></div>' +
      '<ol id="ngMurListe"></ol>' +
      '<div class="ng-pied"><a href="admin.html" id="ngMurAdmin">Tout voir dans l\'administration →</a></div>';
    document.body.appendChild(mur);
    liste = mur.querySelector('#ngMurListe');
    mur.querySelector('#ngMurFermer').addEventListener('click', function () { basculer(false); });
    mur.querySelector('#ngMurAdmin').addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); ouvrirDansAdmin(null);
    });
    liste.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-id]'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault(); ouvrirDansAdmin(ITEMS.filter(function (x) { return x.id === a.getAttribute('data-id'); })[0]);
    });
    var bb = mur.querySelector('#ngMurBureau');
    if (bb) {
      var majBureau = function () { bb.setAttribute('aria-pressed', String(!!lire(CLE_BUREAU, false) && Notification.permission === 'granted')); };
      majBureau();
      bb.addEventListener('click', function () {
        if (lire(CLE_BUREAU, false) && Notification.permission === 'granted') { ecrire(CLE_BUREAU, false); majBureau(); toast('Notifications de l\'ordinateur coupées.'); return; }
        Promise.resolve(Notification.requestPermission()).then(function (p) {
          ecrire(CLE_BUREAU, p === 'granted'); majBureau();
          toast(p === 'granted' ? 'Notifications de l\'ordinateur activées (tant qu\'un onglet NaoGroup est ouvert).' : 'Le navigateur a refusé les notifications.');
        });
      });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mur.hidden && innerWidth < 1100) basculer(false); });
    /* ouvert par défaut sur grand écran, fermé sur petit ; ensuite on garde le dernier choix */
    basculer(lire(CLE_OUVERT, innerWidth >= 1100), true);
  }
  function basculer(ouvrir, sansMemo) {
    if (ouvrir === undefined) ouvrir = mur.hidden;
    mur.hidden = !ouvrir;
    cloche.setAttribute('aria-expanded', String(ouvrir));
    document.documentElement.classList.toggle('ng-mur-ouvert', ouvrir);
    if (!sansMemo) ecrire(CLE_OUVERT, ouvrir);
    if (ouvrir && zoneToasts) zoneToasts.innerHTML = '';
    if (ouvrir) setTimeout(function () { if (!mur.hidden && !document.hidden) marquerVus(); }, 2500);
  }

  function dessiner() {
    var neufs = ITEMS.filter(function (x) { return !estVu(x.id); }).length;
    var b = cloche.querySelector('b'); b.hidden = !neufs; b.textContent = neufs > 99 ? '99+' : neufs;
    cloche.title = neufs ? neufs + ' nouvelle' + (neufs > 1 ? 's' : '') + ' notification' + (neufs > 1 ? 's' : '') : 'Notifications';
    var nd = ITEMS.filter(function (x) { return x.genre === 'demande'; }).length, na = ITEMS.length - nd;
    mur.querySelector('#ngMurCompte').textContent = ITEMS.length
      ? [nd ? nd + ' demande' + (nd > 1 ? 's' : '') + ' à traiter' : '', na ? na + ' avis non lu' + (na > 1 ? 's' : '') : ''].filter(Boolean).join(' · ')
      : 'Tout est à jour';
    if (!ITEMS.length) { liste.innerHTML = '<li class="ng-vide"><b>✨</b>Aucun message en attente.<br>Les demandes de la page Contact et les avis reçus s\'afficheront ici.</li>'; return; }
    liste.innerHTML = ITEMS.map(function (x) {
      return '<li class="' + (estVu(x.id) ? '' : 'neuf') + '"><a href="' + Nao.esc(lienDe(x)) + '" data-id="' + Nao.esc(x.id) + '">' +
        '<span class="ic" aria-hidden="true">' + x.icone + '</span><span class="tx">' +
        '<span class="l1"><span>' + Nao.esc(x.titre) + '</span><time datetime="' + Nao.esc(x.date) + '">' + ilYA(x.date) + '</time></span>' +
        '<span class="l2">' + Nao.esc(x.sous) + '</span>' + (x.detail ? '<span class="l3">' + Nao.esc(x.detail) + '</span>' : '') +
        '</span></a></li>';
    }).join('');
  }

  /* ---------- lecture du serveur ---------- */
  function charger() {
    return Promise.all([
      C.from('demandes').select('id,created_at,nom,type,sujet,message,statut').in('statut', ['nouvelle', 'en_cours']).order('created_at', { ascending: false }).limit(40),
      C.from('avis').select('id,created_at,profil,recommandation,commentaires,outils,statut').eq('statut', 'nouveau').order('created_at', { ascending: false }).limit(40)
    ]).then(function (r) {
      var d = (r[0].data || []).map(function (x) {
        var type = TYPES[x.type] || 'Message', sujet = x.sujet && x.sujet !== type ? ' — ' + court(x.sujet, 60) : '';
        return { id: x.id, genre: 'demande', date: x.created_at, icone: ICONES[x.type] || '✉️',
          titre: x.nom || 'Demande', sous: type + (x.statut === 'en_cours' ? ' · en cours' : '') + sujet,
          detail: court(x.message, 140) };
      });
      var a = (r[1].data || []).map(function (x) {
        var outils = (x.outils || []).map(function (id) { var o = Nao.outilParId(id); return o ? o.nom : id; });
        return { id: x.id, genre: 'avis', date: x.created_at, icone: ICONES.avis,
          titre: 'Nouvel avis' + (x.recommandation != null ? ' · ' + x.recommandation + '/10' : ''),
          sous: [x.profil, outils.slice(0, 3).join(', ') + (outils.length > 3 ? '…' : '')].filter(Boolean).join(' — ') || 'Questionnaire',
          detail: court(x.commentaires, 140) };
      });
      ITEMS = d.concat(a).sort(function (p, q) { return p.date < q.date ? 1 : -1; });
      var arrivees = connus ? ITEMS.filter(function (x) { return connus.indexOf(x.id) < 0 && !estVu(x.id); }) : [];
      var premiere = !connus;
      connus = ITEMS.map(function (x) { return x.id; });
      dessiner();
      if (premiere) {
        var n = ITEMS.filter(function (x) { return !estVu(x.id); }).length;
        if (n && mur.hidden) toast('🔔 ' + n + ' nouvelle' + (n > 1 ? 's' : '') + ' notification' + (n > 1 ? 's' : '') + ' — cliquez pour voir', function () { basculer(true); });
        return;
      }
      if (arrivees.length) {
        cloche.classList.remove('sonne'); void cloche.offsetWidth; cloche.classList.add('sonne');
        arrivees.slice(0, 3).forEach(function (x) { toast(x.icone + ' ' + x.titre + ' — ' + x.sous, function () { ouvrirDansAdmin(x); }); bureau(x); });
        if (arrivees.length > 3) toast('… et ' + (arrivees.length - 3) + ' autre(s)', function () { basculer(true); });
        if (!mur.hidden && !document.hidden) setTimeout(marquerVus, 4000);
      }
    }).catch(function () { /* hors ligne : on réessaiera à la prochaine minute */ });
  }
  function demarrer() {
    construire();
    charger();
    minuteur = setInterval(function () { if (!document.hidden) charger(); }, 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { charger(); if (!mur.hidden) setTimeout(marquerVus, 2500); } });
    /* les « il y a 5 min » restent justes */
    setInterval(function () { if (!document.hidden && ITEMS.length) dessiner(); }, 30 * 1000);
  }

  function go() {
    Nao.profil().then(function (p) {
      if (!p || p.role !== 'admin' || p.statut !== 'actif') return;
      return Nao.client().then(function (c) { if (!c) return; C = c; demarrer(); });
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
