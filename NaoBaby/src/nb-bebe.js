'use strict';
/* ============================================================
   NaoBaby — l'accouchement, bébé, et l'espace souvenir
   ============================================================ */

/* ============================================================
   Accouchement
   ============================================================ */
const SOUS_A = [['preparer', '🌿 Se préparer'], ['valise', '🧳 La valise'], ['contractions', '⏱️ Chronomètre'], ['jourJ', '👶 Le grand jour']];
const PREFS = [
  ['ambiance', 'Ambiance souhaitée', 'Lumière douce, musique, calme…'], ['presents', 'Qui sera présent', 'Le ou la partenaire, une personne de confiance…'],
  ['mobilite', 'Pour me sentir bien', 'Bouger, ballon, bain, massages, respiration…'], ['peau', 'Les premiers instants', 'Peau à peau, premier câlin, qui coupe le cordon si possible…'],
  ['alim', 'Alimentation de bébé', 'Allaitement, biberon, on verra sur le moment…'], ['photos', 'Photos & souvenirs', 'Photos souhaitées ou non, par qui…'],
  ['autre', 'Autres souhaits', 'Ce qui compte pour nous…'],
];
PAGES.accouchement = () => {
  if (!aProfil()) return accueilBienvenue();
  const s = V.sous.accouchement;
  return sousNav('accouchement', SOUS_A) + (SOUS_ACC[s] ? SOUS_ACC[s]() : '');
};
const SOUS_ACC = {};
SOUS_ACC.preparer = () => {
  const a = S.accouchement, p = P();
  const adr = p.materniteAdresse || p.maternite;
  return `<div class="titre-page"><h2>Préparer <span>l’accouchement</span></h2></div>
  <p class="chapo">Vos souhaits pour la naissance, les numéros utiles et le trajet vers la maternité — pour aborder le grand jour l’esprit plus léger.</p>
  <div class="grille-2">
    <section class="carte">${carteT('🌿', 'Notre projet de naissance')}
      <div class="note-douce"><span class="em">🤍</span><div>Le projet de naissance exprime <b>des souhaits</b>. Il se prépare et se discute avec votre sage-femme ou l’équipe de la maternité,
        qui vous accompagnera selon la situation du jour J.</div></div>
      <div class="champs">${PREFS.map(([k, l, pl]) => `<div class="champ large"><label>${l}</label><textarea rows="2" data-pref="${k}" placeholder="${esc(pl)}">${esc(a.preferences[k] || '')}</textarea></div>`).join('')}</div>
      <button class="btn" style="margin-top:12px" data-act="imprimer-projet">🖨️ Imprimer notre projet de naissance</button></section>
    <div style="display:grid;gap:16px">
      <section class="carte">${carteT('📞', 'Numéros utiles')}
        ${p.maternite || p.materniteTel ? `<div class="ligne"><span class="em">🏥</span><div class="txt"><b>${esc(p.maternite || 'Maternité')}</b><span>${esc(p.materniteTel || 'numéro à ajouter dans le profil')}</span></div>
          ${p.materniteTel ? `<a class="btn petit" href="tel:${esc(p.materniteTel)}">Appeler</a>` : ''}</div>` : ''}
        ${a.contacts.map(c => `<div class="ligne"><span class="em">👤</span><div class="txt"><b>${esc(c.nom)}</b><span>${esc(c.role || '')}${c.tel ? ' · ' + esc(c.tel) : ''}</span></div>
          ${c.tel ? `<a class="btn petit" href="tel:${esc(c.tel)}">Appeler</a>` : ''}<div class="act"><button class="rond petit" data-act="edit-contact" data-id="${c.id}">✏️</button></div></div>`).join('')}
        <div class="ligne"><span class="em">🚑</span><div class="txt"><b>Urgences : 15 (SAMU) ou 112</b><span>En cas d’urgence, à tout moment</span></div><a class="btn petit" href="tel:15">15</a></div>
        <button class="lien-carte" data-act="add-contact">＋ Ajouter un contact (sage-femme, garde des aînés…)</button></section>
      <section class="carte">${carteT('🗺️', 'Le trajet vers la maternité')}
        <div class="champs">
          <div class="champ large"><label>Adresse</label><input type="text" data-profil="materniteAdresse" value="${esc(p.materniteAdresse)}" placeholder="Adresse de la maternité"></div>
          <div class="champ"><label>Temps de trajet</label><input type="text" data-acc="trajetTemps" value="${esc(a.trajetTemps)}" placeholder="Ex. : 25 min"></div>
          <div class="champ"><label>&nbsp;</label>${adr ? `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adr)}">🧭 Ouvrir l’itinéraire</a>` : ''}</div>
          <div class="champ large"><label>Bon à savoir</label><textarea rows="3" data-acc="trajet" placeholder="Entrée de nuit, stationnement, étage, taxi de secours…">${esc(a.trajet)}</textarea></div>
        </div></section>
    </div>
  </div>`;
};
SOUS_ACC.valise = () => `<div class="titre-page"><h2>La <span>valise</span> maternité</h2></div>
  <p class="chapo">Pour la maman, pour ${motBebe()} et pour l’accompagnant·e. Cochez au fur et à mesure.</p>${listeValise()}`;
SOUS_ACC.contractions = () => {
  const l = S.accouchement.contractions, enCours = l.length && !l[l.length - 1].fin;
  const hm = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const dur = s => s >= 60 ? `${Math.floor(s / 60)} min ${pad(Math.round(s % 60))} s` : `${Math.round(s)} s`;
  const lignes = l.map((c, i) => ({ ...c, d: c.fin ? (c.fin - c.debut) / 1000 : null, iv: i ? (c.debut - l[i - 1].debut) / 1000 : null })).reverse();
  const fin5 = lignes.filter(x => x.d).slice(0, 5);
  const moy = k => { const v = fin5.map(x => x[k]).filter(x => x); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  return `<div class="titre-page"><h2>Chronomètre des <span>contractions</span></h2></div>
  <div class="note-douce"><span class="em">🤍</span><div>Ce chronomètre sert <b>seulement à noter</b> la durée et l’écart entre les contractions, pour pouvoir les donner à la maternité.
    Il ne dit pas quand partir : <b>c’est la maternité qui vous guide.</b> En cas de doute, appelez-la${P().materniteTel ? ` au <a href="tel:${esc(P().materniteTel)}">${esc(P().materniteTel)}</a>` : ''}. Urgence : <b>15</b>.</div></div>
  <div class="grille-2">
    <section class="carte" style="text-align:center">
      <div id="chrono" style="font-size:64px;color:var(--titre);font-variant-numeric:tabular-nums;margin:10px 0">${enCours ? '…' : '0 s'}</div>
      <button class="btn plein" style="font-size:17px;padding:16px 34px" data-act="contraction">${enCours ? '⏹️ Fin de la contraction' : '▶️ Début d’une contraction'}</button>
      ${fin5.length ? `<div class="mini-stat" style="justify-content:center;margin-top:18px"><span>Durée moyenne <b>${dur(moy('d'))}</b></span>${moy('iv') ? `<span>Écart moyen <b>${dur(moy('iv'))}</b></span>` : ''}</div>
        <div class="avert">Moyennes des ${fin5.length} dernières, à titre de simple repère.</div>` : ''}</section>
    <section class="carte">${carteT('📝', 'Relevé', pluriel(l.length, 'contraction'))}
      ${lignes.slice(0, 30).map(x => `<div class="ligne"><span class="em">⏱️</span><div class="txt"><b>${hm(x.debut)}</b><span>${x.d ? 'durée ' + dur(x.d) : 'en cours…'}${x.iv ? ' · écart ' + dur(x.iv) : ''}</span></div></div>`).join('') || '<div class="vide">Aucune contraction notée.</div>'}
      ${l.length ? '<button class="btn danger petit" data-act="vider-contractions" style="margin-top:10px">Effacer le relevé</button>' : ''}</section>
  </div>`;
};
let minuterie = null;
function lancerChrono() {
  clearInterval(minuterie);
  const l = S.accouchement.contractions;
  if (!l.length || l[l.length - 1].fin) return;
  const t0 = l[l.length - 1].debut;
  minuterie = setInterval(() => { const el = $('#chrono'); if (!el) return clearInterval(minuterie); const s = (Date.now() - t0) / 1000; el.textContent = s >= 60 ? `${Math.floor(s / 60)} min ${pad(Math.floor(s % 60))}` : `${Math.floor(s)} s`; }, 250);
}
ACTIONS.contraction = () => {
  const l = S.accouchement.contractions;
  if (l.length && !l[l.length - 1].fin) l[l.length - 1].fin = Date.now(); else l.push({ debut: Date.now(), fin: null });
  sauver(); lancerChrono();
};
ACTIONS['vider-contractions'] = async () => { if (await confirmer('Effacer le relevé ?', 'Toutes les contractions notées seront effacées.', 'Effacer')) { S.accouchement.contractions = []; sauver(); } };
SOUS_ACC.jourJ = () => {
  const a = actifs();
  return `<div class="titre-page"><h2>Le <span>grand jour</span></h2></div>
  <p class="chapo">${estNe() ? 'Bienvenue au monde. 💜' : `Quand ${actifs().length > 1 ? 'vos bébés seront nés' : 'bébé sera né'}, enregistrez ici les premières informations : elles ouvriront l’espace Bébé, la carte de naissance et le planning des démarches.`}</p>
  <div class="grille">${a.map((b, i) => `<section class="carte">${carteT(b.naissance.date ? '🌟' : '🤍', esc(nomBebe(b, S.bebes.indexOf(b))))}
    ${b.naissance.date ? `<div style="color:var(--ink-2)">Né${b.sexe === 'fille' ? 'e' : ''} le ${dateLongue(lire(b.naissance.date))}${b.naissance.heure ? ' à ' + fmtH(b.naissance.heure) : ''}</div>` : '<div class="vide">Pas encore né·e.</div>'}
    <button class="btn plein" style="margin-top:12px" data-act="naissance" data-id="${b.id}">${b.naissance.date ? '✏️ Modifier' : '👶 Enregistrer la naissance'}</button></section>`).join('')}</div>
  <div class="note-douce" style="margin-top:16px"><span class="em">📋</span><div>Après la naissance : déclaration à la mairie <b>dans les 5 jours</b> (souvent possible à la maternité), puis CAF, Assurance Maladie, mutuelle et impôts.
    ${lien('Voir le planning', 'grossesse', 'planning')}</div></div>`;
};
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.pref) { S.accouchement.preferences[t.dataset.pref] = t.value; enregistrer(); }
  if (t.dataset.acc) { S.accouchement[t.dataset.acc] = t.value; enregistrer(); }
  if (t.dataset.profil) { P()[t.dataset.profil] = t.value; sauver(); }
});
function formContact(c = {}) {
  const neuf = !c.id;
  formulaire({ titre: '📞 Contact utile', valeurs: c,
    champs: [{ k: 'nom', lab: 'Nom', req: true }, { k: 'role', lab: 'Rôle', place: 'Sage-femme, garde des aînés…' }, { k: 'tel', lab: 'Téléphone', type: 'tel', large: true }],
    enregistrer: v => { if (neuf) S.accouchement.contacts.push({ id: uid(), ...v }); else Object.assign(S.accouchement.contacts.find(x => x.id === c.id), v); },
    supprimer: neuf ? null : () => { S.accouchement.contacts = S.accouchement.contacts.filter(x => x.id !== c.id); } });
}
ACTIONS['add-contact'] = () => formContact();
ACTIONS['edit-contact'] = el => formContact(S.accouchement.contacts.find(c => c.id === el.dataset.id));
ACTIONS['imprimer-projet'] = () => {
  const a = S.accouchement.preferences;
  imprimer(`<div class="pdf-page"><div class="pdf-couv" style="min-height:auto;padding:12mm;align-items:flex-start;text-align:left">
    <div class="sur">Projet de naissance</div><h1 style="font-size:24pt">${esc(parents())}</h1>
    <p>Date prévue : ${P().dpa ? dateLongue(lire(P().dpa)) : '—'}${P().maternite ? ' · ' + esc(P().maternite) : ''}</p></div>
    ${PREFS.filter(([k]) => a[k]).map(([k, l]) => `<h3>${l}</h3><p>${esc(a[k])}</p>`).join('')}
    <p style="margin-top:8mm;font-size:9.5pt;color:#958DAE">Ces souhaits sont une base d’échange avec l’équipe : nous savons qu’elle nous accompagnera selon la situation du jour. Merci 💜</p></div>`);
};

/* ============================================================
   Bébé
   ============================================================ */
const SOUS_B = [['naissance', '🌟 Naissance'], ['carte', '💌 Carte de naissance'], ['croissance', '📈 Poids & taille'], ['repas', '🥄 Repas & découvertes'], ['premieres', '✨ Premières fois'], ['pdf', '📖 Livre souvenir']];
const bebeCourant = () => actifs().find(b => b.id === V.bebe) || actifs()[0];
function choixBebe() {
  const a = actifs(); if (a.length < 2) return '';
  return `<div class="bebe-choix">${a.map(b => `<button class="${bebeCourant().id === b.id ? 'on' : ''}" data-act="bebe" data-id="${b.id}">
    <span class="av">${b.naissance.photo ? `<img src="${b.naissance.photo}" alt="">` : b.sexe === 'fille' && b.revele ? '🎀' : b.sexe === 'garcon' && b.revele ? '💙' : '🤍'}</span>${esc(nomBebe(b, S.bebes.indexOf(b)))}</button>`).join('')}</div>`;
}
ACTIONS.bebe = el => { V.bebe = el.dataset.id; rendre(); };
PAGES.bebe = () => {
  if (!aProfil()) return accueilBienvenue();
  const b = bebeCourant();
  if (!b) return '<section class="carte"><div class="vide">Aucun bébé dans le carnet.</div></section>';
  if (!b.naissance.date) return `${choixBebe()}<section class="carte" style="text-align:center;padding:40px 24px;max-width:720px;margin:10px auto">
    <div style="font-size:64px;animation:berce 4s ease-in-out infinite">🌙</div>
    <h2 style="font-size:26px;margin-top:8px">Cet espace s’ouvrira à la naissance</h2>
    <p class="chapo" style="margin:10px auto 18px">Poids, taille, carte de naissance, repas, premières fois et livre souvenir : tout vous attend ici.</p>
    <button class="btn plein" data-act="naissance" data-id="${b.id}">👶 ${esc(nomBebe(b))} est né${b.sexe === 'fille' && b.revele ? 'e' : '·e'} ! Enregistrer la naissance</button></section>`;
  const s = V.sous.bebe;
  return sousNav('bebe', SOUS_B) + choixBebe() + (SOUS_BB[s] ? SOUS_BB[s](b) : '');
};
const SOUS_BB = {};
function fmtPoids(g) { const n = nombre(g); if (!n) return '—'; return n > 50 ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 3 })} kg` : `${n.toLocaleString('fr-FR')} kg`; }
const fmtCm = v => nombre(v) ? `${nombre(v).toLocaleString('fr-FR')} cm` : '—';
SOUS_BB.naissance = b => {
  const n = b.naissance;
  return `<section class="carte"><div class="fiche-naissance">
    ${n.photo ? `<img class="ph" src="${n.photo}" alt="">` : `<div class="ph vide">${b.sexe === 'fille' ? '🎀' : b.sexe === 'garcon' ? '💙' : '🤍'}</div>`}
    <div><div class="sa">Bienvenue au monde</div><h2 style="font-size:38px;line-height:1.1;margin:4px 0">${esc(nomBebe(b))}</h2>
      <div style="color:var(--ink-2)">${cap(dateLongue(lire(n.date)))}${n.heure ? ' à ' + fmtH(n.heure) : ''}${n.lieu ? ' · ' + esc(n.lieu) : ''} · ${ageA(n.date, cle(auj()))}</div>
      <div class="infos-n"><div><span>Poids</span><b>${fmtPoids(n.poids)}</b></div><div><span>Taille</span><b>${fmtCm(n.taille)}</b></div>
        ${n.pc ? `<div><span>Périmètre crânien</span><b>${fmtCm(n.pc)}</b></div>` : ''}<div><span>Heure</span><b>${n.heure ? fmtH(n.heure) : '—'}</b></div></div>
      <button class="btn" style="margin-top:14px" data-act="naissance" data-id="${b.id}">✏️ Modifier</button></div></div>
    ${n.souvenirs ? `<div class="souvenir" style="margin-top:16px"><div class="souvenir-h"><b>Nos premiers souvenirs</b></div><p>${esc(n.souvenirs)}</p></div>` : ''}</section>`;
};
ACTIONS.naissance = el => {
  const b = S.bebes.find(x => x.id === el.dataset.id), n = b.naissance;
  formulaire({
    titre: `👶 La naissance${actifs().length > 1 ? ' de ' + esc(nomBebe(b)) : ''}`, large: true,
    chapo: 'Tous les champs sont facultatifs, sauf la date : ne notez que ce que vous avez envie de garder.',
    valeurs: { prenom: b.prenom, sexe: b.sexe === 'fille' || b.sexe === 'garcon' ? b.sexe : '', ...n, date: n.date || cle(auj()) },
    champs: [
      { k: 'prenom', lab: 'Prénom', large: true }, { k: 'sexe', lab: 'C’est', type: 'choix', options: [['fille', '🎀 Une fille'], ['garcon', '💙 Un garçon'], ['', '— Je préfère ne pas le préciser']], large: true },
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'heure', lab: 'Heure', type: 'time' },
      { k: 'poids', lab: 'Poids (en grammes)', type: 'number', min: 0, place: 'Ex. : 3250' }, { k: 'taille', lab: 'Taille (cm)', type: 'number', min: 0, step: '0.5' },
      { k: 'pc', lab: 'Périmètre crânien (cm, facultatif)', type: 'number', min: 0, step: '0.5' }, { k: 'lieu', lab: 'Lieu', place: 'Maternité, ville…' },
      { k: 'photo', lab: 'Photo', type: 'photo', large: true }, { k: 'souvenirs', lab: 'Nos premiers souvenirs', type: 'textarea', large: true, rows: 4 },
    ],
    enregistrer: v => {
      const premier = !n.date;
      b.prenom = v.prenom; if (v.sexe) { b.sexe = v.sexe; b.revele = true; }
      Object.assign(n, { date: v.date, heure: v.heure, poids: v.poids, taille: v.taille, pc: v.pc, lieu: v.lieu, photo: v.photo, souvenirs: v.souvenirs });
      if (v.poids || v.taille) {
        const m = S.croissance.find(c => c.bebe === b.id && c.naissance);
        const val = { date: v.date, poids: v.poids ? String(nombre(v.poids) / 1000) : '', taille: v.taille, pc: v.pc };
        if (m) Object.assign(m, val); else S.croissance.push({ id: uid(), bebe: b.id, naissance: true, ...val });
      }
      if (P().mode !== 'perte') P().mode = 'grossesse';
      majAccent();
      if (premier) { V.page = 'bebe'; V.sous.bebe = 'naissance'; V.bebe = b.id; setTimeout(() => { confettis(couleursAccent(), 5000, 170); toast('🌟', `Bienvenue ${v.prenom || 'petit cœur'} !`, 'Pensez à la déclaration de naissance dans les 5 jours.'); }, 300); }
    },
  });
};

/* ---------- Carte de naissance ---------- */
function carteDe() {
  S.carteN ||= {};
  const a = nes(), f = a.every(b => b.sexe === 'fille'), g = a.every(b => b.sexe === 'garcon');
  const defPal = P().neutre ? 'lavande' : f ? 'rose' : g ? 'bleu' : a.length > 1 ? 'surprise' : 'lavande';
  const sur = a.length > 1 ? (f ? 'Elles sont arrivées' : 'Ils sont arrivés') : f ? 'Elle est arrivée' : g ? 'Il est arrivé' : 'Bienvenue';
  return Object.assign({ palette: defPal, sur, message: 'Avec tout notre amour', photo: '', deco: 'etoiles', emoji: '🌙', modele: 'classique' }, S.carteN);
}
function blocsCarte() {
  const c = carteDe(), a = nes();
  const blocs = [{ t: 'sur', v: c.sur }];
  const photo = c.photo || (a.length === 1 ? a[0].naissance.photo : '');
  if (photo) blocs.push({ t: 'photo', v: photo, taille: 440 }); else blocs.push({ t: 'emoji', v: c.emoji || '🌙', taille: 150 });
  blocs.push({ t: 'titre', v: a.map(b => nomBebe(b)).join(' & '), taille: a.length > 2 ? 86 : 110 });
  if (a.length === 1) {
    const n = a[0].naissance;
    blocs.push({ t: 'texte', v: cap(dateLongue(lire(n.date))), taille: 46 });
    const inf = [n.heure && ['Heure', fmtH(n.heure)], nombre(n.poids) && ['Poids', fmtPoids(n.poids)], nombre(n.taille) && ['Taille', fmtCm(n.taille)]].filter(Boolean);
    if (inf.length) blocs.push({ t: 'espace', v: 16 }, { t: 'infos', v: inf });
  } else {
    blocs.push({ t: 'texte', v: cap(dateLongue(lire(a[0].naissance.date))), taille: 44 });
    a.forEach(b => { const n = b.naissance; blocs.push({ t: 'texte', v: [nomBebe(b), n.heure && fmtH(n.heure), nombre(n.poids) && fmtPoids(n.poids), nombre(n.taille) && fmtCm(n.taille)].filter(Boolean).join(' · '), taille: 36 }); });
  }
  blocs.push({ t: 'espace', v: 24 }, { t: 'texte', v: c.message, taille: 44 }, { t: 'texte', v: parents(), taille: 40 });
  return blocs;
}
SOUS_BB.carte = () => {
  const c = carteDe();
  setTimeout(apercuCarte, 20);
  return `<div class="titre-page"><h2>Notre <span>carte de naissance</span></h2></div>
  <p class="chapo">Une jolie carte avec la photo et les premières informations de ${nes().length > 1 ? 'vos bébés' : 'bébé'}, prête à être envoyée à vos proches.</p>
  <div class="atelier">
    <section class="carte"><div class="champs">
      <div class="champ large"><label>En-tête</label><input type="text" data-carte="sur" value="${esc(c.sur)}"></div>
      <div class="champ large"><label>Message</label><input type="text" data-carte="message" value="${esc(c.message)}"></div>
      <div class="champ large"><span class="lab">Couleurs</span><div class="palettes">${Object.entries(PALETTES).map(([pk, p]) =>
        `<label title="${p.nom}"><input type="radio" name="pal-carte" data-carte="palette" value="${pk}" ${c.palette === pk ? 'checked' : ''}><span style="background:linear-gradient(135deg,${p.bg[0]},${p.bg[1]} 60%,${p.acc})"></span></label>`).join('')}</div></div>
      <div class="champ large"><span class="lab">Modèle</span><div class="choix">${Object.entries(MODELES).map(([k, n]) =>
        `<label><input type="radio" name="mod-carte" data-carte="modele" value="${k}" ${c.modele === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
      <div class="champ"><span class="lab">Décor</span><div class="choix">${[['etoiles', '✨ Étoiles'], ['confettis', '🎊 Confettis']].map(([k, n]) =>
        `<label><input type="radio" name="deco-carte" data-carte="deco" value="${k}" ${c.deco === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
      <div class="champ"><label>Emoji (sans photo)</label><input type="text" data-carte="emoji" value="${esc(c.emoji)}" maxlength="8"></div>
      <div class="champ large"><div class="choix"><button class="btn petit" data-act="carte-photo">📷 ${c.photo ? 'Changer' : 'Choisir'} la photo de la carte</button>
        ${c.photo ? '<button class="btn petit" data-act="carte-photo-sup">Reprendre la photo de naissance</button>' : ''}</div></div>
      <div class="champ large"><div class="choix"><button class="btn plein" data-act="carte-png">⬇️ Télécharger la carte</button>
        ${navigator.share ? '<button class="btn" data-act="carte-partager">📤 Partager…</button>' : ''}<button class="btn" data-act="carte-texte">📋 Copier l’annonce</button></div></div>
    </div></section>
    <div class="carte-apercu" id="apercu-carte"><div class="vide">Préparation de la carte…</div></div>
  </div>`;
};
async function apercuCarte() {
  const z = $('#apercu-carte'); if (!z) return;
  const c = carteDe(), cv = await dessinerCarte(PALETTES[c.palette] || PALETTES.lavande, blocsCarte(), c.deco, c.modele);
  z.innerHTML = ''; z.append(cv);
}
document.addEventListener('change', e => { const t = e.target; if (t.dataset.carte) { S.carteN = { ...carteDe(), [t.dataset.carte]: t.value }; enregistrer(); apercuCarte(); } });
ACTIONS['carte-photo'] = async () => { const p = await choisirPhoto(1000, .85); if (p) { S.carteN = { ...carteDe(), photo: p }; sauver(); } };
ACTIONS['carte-photo-sup'] = () => { S.carteN = { ...carteDe(), photo: '' }; sauver(); };
const blobCarte = async () => { const c = carteDe(); const cv = await dessinerCarte(PALETTES[c.palette] || PALETTES.lavande, blocsCarte(), c.deco, c.modele); return new Promise(r => cv.toBlob(r, 'image/png')); };
const texteAnnonce = () => { const a = nes(); return `${carteDe().sur} ! 💜\n\n` + a.map(b => { const n = b.naissance; return `${nomBebe(b)} — ${dateLongue(lire(n.date))}${n.heure ? ' à ' + fmtH(n.heure) : ''}${nombre(n.poids) ? ', ' + fmtPoids(n.poids) : ''}${nombre(n.taille) ? ', ' + fmtCm(n.taille) : ''}`; }).join('\n') + `\n\n${carteDe().message}\n${parents()}`; };
ACTIONS['carte-png'] = async () => telecharger(`carte-naissance-${nomFichier(nes().map(b => nomBebe(b)).join('-'))}.png`, await blobCarte());
ACTIONS['carte-texte'] = async () => { try { await navigator.clipboard.writeText(texteAnnonce()); toast('📋', 'Annonce copiée'); } catch (e) { toast('⚠️', 'Copie impossible'); } };
ACTIONS['carte-partager'] = async () => {
  const f = new File([await blobCarte()], 'carte-de-naissance.png', { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: texteAnnonce() }); else await navigator.share({ text: texteAnnonce() }); } catch (e) {}
};

/* ---------- Poids & taille ---------- */
function courbe(points, unite, titre) {
  if (points.length < 1) return '';
  const W = 560, H = 230, g = 42, d = 16, h = 16, b = 34;
  const maxX = Math.max(1, ...points.map(p => p.x)) * 1.08, ys = points.map(p => p.y), minY = Math.min(...ys) * .9, maxY = Math.max(...ys) * 1.06 || 1;
  const X = v => g + v / maxX * (W - g - d), Y = v => H - b - (v - minY) / (maxY - minY || 1) * (H - b - h);
  const tr = points.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join('');
  const graduY = [0, .5, 1].map(k => minY + (maxY - minY) * k);
  const pasX = maxX > 24 ? 6 : maxX > 8 ? 2 : 1;
  const graduX = []; for (let m = 0; m <= maxX; m += pasX) graduX.push(m);
  return `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(titre)}">
    ${graduY.map(v => `<line class="axe" x1="${g}" x2="${W - d}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lbl" x="${g - 6}" y="${Y(v) + 4}" text-anchor="end">${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}</text>`).join('')}
    ${graduX.map(m => `<text class="lbl" x="${X(m)}" y="${H - 12}" text-anchor="middle">${m} m</text>`).join('')}
    ${points.length > 1 ? `<path class="aire" d="${tr}L${X(points[points.length - 1].x)} ${H - b}L${X(points[0].x)} ${H - b}Z"/><path class="trace" d="${tr}"/>` : ''}
    ${points.map(p => `<circle class="pt" cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5"><title>${p.y.toLocaleString('fr-FR')} ${unite}</title></circle>`).join('')}
    <text class="lbl" x="${g}" y="11">${esc(unite)}</text></svg>`;
}
SOUS_BB.croissance = b => {
  const n = b.naissance.date;
  const l = S.croissance.filter(c => c.bebe === b.id).sort((x, y) => x.date.localeCompare(y.date));
  const pts = k => l.filter(c => nombre(c[k])).map(c => ({ x: ageMois(n, c.date), y: nombre(c[k]) }));
  return `<div class="titre-page"><h2>Poids & <span>taille</span></h2></div>
  <p class="chapo">Notez les mesures relevées lors des rendez-vous : la courbe se dessine au fil des mois.</p>
  <div class="actions-rapides"><button class="btn plein" data-act="add-mesure"><span class="plus">＋</span> Ajouter une mesure</button></div>
  <div class="grille-2">
    <section class="carte">${carteT('⚖️', 'Poids (kg)')}${courbe(pts('poids'), 'kg', 'Courbe de poids') || '<div class="vide">Pas encore de mesure.</div>'}</section>
    <section class="carte">${carteT('📏', 'Taille (cm)')}${courbe(pts('taille'), 'cm', 'Courbe de taille') || '<div class="vide">Pas encore de mesure.</div>'}</section>
  </div>
  <section class="carte" style="margin-top:16px">${carteT('📝', 'Les mesures', pluriel(l.length, 'mesure'))}
    ${[...l].reverse().map(c => `<div class="ligne" data-act="edit-mesure" data-id="${c.id}" style="cursor:pointer"><span class="em">${c.naissance ? '🌟' : '📏'}</span>
      <div class="txt"><b>${[nombre(c.poids) && nombre(c.poids).toLocaleString('fr-FR') + ' kg', nombre(c.taille) && fmtCm(c.taille), nombre(c.pc) && 'PC ' + fmtCm(c.pc)].filter(Boolean).join(' · ') || '—'}</b>
      <span>${cap(dateCourte(lire(c.date)))} ${lire(c.date).getFullYear()} · ${ageA(n, c.date)}${c.note ? ' · ' + esc(c.note) : ''}</span></div></div>`).join('') || '<div class="vide">Aucune mesure.</div>'}</section>
  <p class="avert">Les courbes de référence figurent dans le carnet de santé : c’est votre médecin ou votre pédiatre qui les interprète avec vous.</p>`;
};
function formMesure(c = {}) {
  const neuf = !c.id, b = bebeCourant();
  formulaire({ titre: '📏 Une mesure', valeurs: { date: cle(auj()), ...c },
    champs: [{ k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'poids', lab: 'Poids (kg)', type: 'number', step: '0.001', min: 0, place: 'Ex. : 4,85' },
      { k: 'taille', lab: 'Taille (cm)', type: 'number', step: '0.5', min: 0 }, { k: 'pc', lab: 'Périmètre crânien (cm)', type: 'number', step: '0.5', min: 0 },
      { k: 'note', lab: 'Note', large: true, place: 'Rendez-vous du 2ᵉ mois…' }],
    enregistrer: v => { if (neuf) S.croissance.push({ id: uid(), bebe: b.id, ...v }); else Object.assign(S.croissance.find(x => x.id === c.id), v); },
    supprimer: neuf ? null : () => { S.croissance = S.croissance.filter(x => x.id !== c.id); } });
}
ACTIONS['add-mesure'] = () => formMesure();
ACTIONS['edit-mesure'] = el => formMesure(S.croissance.find(c => c.id === el.dataset.id));

/* ---------- Repas & découvertes ---------- */
const CATS_AL = { legume: ['🥕', 'Légumes'], fruit: ['🍎', 'Fruits'], feculent: ['🍚', 'Féculents'], proteine: ['🍗', 'Protéines'], laitage: ['🧀', 'Laitages'], autre: ['🍪', 'Autres'] };
const AVIS = { adore: ['😍', 'Adoré'], aime: ['🙂', 'Aimé'], mitige: ['😐', 'Mitigé'], pas: ['🙅', 'Pas aimé'] };
const IDEES_AL = { legume: ['Carotte', 'Courgette', 'Haricot vert', 'Patate douce', 'Potiron', 'Petits pois', 'Brocoli', 'Épinard', 'Panais'], fruit: ['Pomme', 'Poire', 'Banane', 'Pêche', 'Abricot', 'Mangue', 'Prune'],
  feculent: ['Pomme de terre', 'Riz', 'Semoule', 'Pâtes', 'Lentilles corail'], proteine: ['Poulet', 'Jambon blanc', 'Poisson blanc', 'Œuf', 'Bœuf'], laitage: ['Yaourt nature', 'Fromage blanc', 'Petit-suisse'], autre: ['Pain', 'Compote maison'] };
SOUS_BB.repas = b => {
  const l = S.repas.filter(r => r.bebe === b.id).sort((x, y) => y.date.localeCompare(x.date));
  const uniques = [...new Map([...l].reverse().map(r => [r.aliment.toLowerCase(), r])).values()];
  return `<div class="titre-page"><h2>Repas & <span>découvertes</span></h2></div>
  <p class="chapo">Chaque nouvel aliment est une petite aventure : notez ce que ${esc(nomBebe(b))} a goûté, et ce qu’il en a pensé.</p>
  <div class="note-douce"><span class="em">🤍</span><div>La diversification se fait au rythme de bébé, selon les conseils de votre médecin ou de votre pédiatre.
    Si vous remarquez quelque chose d’inhabituel après un repas, contactez un professionnel de santé.</div></div>
  <div class="actions-rapides"><button class="btn plein" data-act="add-repas"><span class="plus">＋</span> Nouvelle découverte</button></div>
  <div class="mini-stat">${Object.entries(CATS_AL).map(([k, [e, n]]) => `<span>${e} <b>${uniques.filter(r => r.cat === k).length}</b> ${n.toLowerCase()}</span>`).join('')}</div>
  <div class="grille-2">
    <section class="carte">${carteT('🧺', 'Déjà goûtés', pluriel(uniques.length, 'aliment'))}
      ${Object.entries(CATS_AL).map(([k, [e, n]]) => { const g = uniques.filter(r => r.cat === k); return g.length ? `<div class="groupe-t">${e} ${n}</div><div class="aliments">${g.map(r =>
        `<div class="aliment" data-act="edit-repas" data-id="${r.id}"><span>${(AVIS[r.avis] || ['🥄'])[0]}</span><b>${esc(r.aliment)}</b></div>`).join('')}</div>` : ''; }).join('') || '<div class="vide">Aucun aliment pour le moment.</div>'}
      <div class="groupe-t">Idées à découvrir</div><div class="choix">${Object.entries(IDEES_AL).flatMap(([k, arr]) => arr.filter(a => !uniques.some(u => u.aliment.toLowerCase() === a.toLowerCase())).slice(0, 3).map(a =>
        `<label><input type="checkbox" data-act="add-repas" data-al="${esc(a)}" data-cat="${k}"><span>＋ ${esc(a)}</span></label>`)).join('')}</div></section>
    <section class="carte">${carteT('🗓️', 'Le journal des repas', pluriel(l.length, 'repas', 'repas'))}
      ${l.slice(0, 40).map(r => `<div class="ligne" data-act="edit-repas" data-id="${r.id}" style="cursor:pointer"><span class="em">${CATS_AL[r.cat]?.[0] || '🥄'}</span>
        <div class="txt"><b>${esc(r.aliment)}</b><span>${cap(dateCourte(lire(r.date)))} · ${ageA(b.naissance.date, r.date)}${r.texture ? ' · ' + esc(r.texture) : ''}${r.note ? ' · ' + esc(r.note) : ''}</span></div>
        ${r.avis ? `<span class="meta">${AVIS[r.avis].join(' ')}</span>` : ''}</div>`).join('') || '<div class="vide">Le premier repas arrive bientôt.</div>'}</section>
  </div>`;
};
function formRepas(r = {}) {
  const neuf = !r.id, b = bebeCourant();
  formulaire({ titre: '🥄 Une découverte', valeurs: { date: cle(auj()), cat: 'legume', avis: 'aime', ...r },
    champs: [{ k: 'aliment', lab: 'Aliment', req: true }, { k: 'cat', lab: 'Famille', type: 'select', options: Object.entries(CATS_AL).map(([k, [e, n]]) => [k, e + ' ' + n]) },
      { k: 'date', lab: 'Date', type: 'date', req: true }, { k: 'texture', lab: 'Texture', type: 'select', options: [['', '—'], ['purée lisse', 'Purée lisse'], ['écrasé', 'Écrasé'], ['petits morceaux', 'Petits morceaux'], ['morceaux', 'Morceaux']] },
      { k: 'avis', lab: 'Son avis', type: 'choix', options: Object.entries(AVIS).map(([k, [e, n]]) => [k, e + ' ' + n]), large: true },
      { k: 'note', lab: 'Note', large: true, place: 'Une grimace, un sourire…' }],
    enregistrer: v => {
      if (neuf) S.repas.push({ id: uid(), bebe: b.id, ...v }); else Object.assign(S.repas.find(x => x.id === r.id), v);
      if (/(allerg|réaction|reaction|bouton|plaque|gonfl|vomi|respir|urticaire)/i.test(v.note)) setTimeout(noteSante, 350);
    },
    supprimer: neuf ? null : () => { S.repas = S.repas.filter(x => x.id !== r.id); } });
}
ACTIONS['add-repas'] = el => { if (el.checked !== undefined) el.checked = false; formRepas(el.dataset.al ? { aliment: el.dataset.al, cat: el.dataset.cat } : {}); };
ACTIONS['edit-repas'] = el => formRepas(S.repas.find(r => r.id === el.dataset.id));

/* ---------- Premières fois ---------- */
const PREMIERES = [
  ['sourire', '😊', 'Premier vrai sourire'], ['bain', '🛁', 'Premier bain à la maison'], ['sortie', '🌳', 'Première promenade'], ['rire', '😂', 'Premier éclat de rire'],
  ['nuit', '🌙', 'Première nuit complète'], ['tete', '💪', 'Tient sa tête'], ['retourne', '🔄', 'Se retourne'], ['repas', '🥄', 'Premier repas à la cuillère'],
  ['assis', '🪑', 'Tient assis·e'], ['dent', '🦷', 'Première dent'], ['pattes', '🐾', 'Premier quatre-pattes'], ['debout', '🧍', 'Se met debout'],
  ['mot', '💬', 'Premier mot'], ['pas', '👣', 'Premiers pas'], ['bravo', '👏', 'Premier « bravo »'], ['noel', '🎄', 'Premier Noël'],
  ['vacances', '🏖️', 'Premières vacances'], ['coiffeur', '✂️', 'Première coupe de cheveux'], ['anniv', '🎂', 'Premier anniversaire'],
];
SOUS_BB.premieres = b => {
  const n = b.naissance.date;
  const l = S.premieres.filter(p => p.bebe === b.id).sort((x, y) => x.date.localeCompare(y.date));
  const faites = new Set(l.map(p => p.k));
  return `<div class="titre-page"><h2>Ses <span>premières fois</span></h2></div>
  <p class="chapo">Notez la date : l’âge de ${esc(nomBebe(b))} se calcule tout seul. Ajoutez une photo, un mot — tout rejoindra le livre souvenir.</p>
  <div class="grille-2">
    <section class="carte">${carteT('✨', 'Nos premières fois', pluriel(l.length, 'souvenir'))}
      <div class="frise">${l.map(p => `<div class="etape faite" data-act="edit-premiere" data-id="${p.id}" style="cursor:pointer">
        <div class="etape-h"><span>${p.em}</span><b>${esc(p.t)}</b><span class="pastille acc">à ${ageA(n, p.date)}</span><span class="quand">${dateMoy(lire(p.date))}</span></div>
        ${p.note ? `<p>${esc(p.note)}</p>` : ''}${p.photo ? `<img class="photo-mini" src="${p.photo}" alt="">` : ''}</div>`).join('') || '<div class="vide">La première arrivera plus vite qu’on ne le croit.</div>'}</div></section>
    <section class="carte">${carteT('🌱', 'À venir')}
      <div class="choix">${PREMIERES.filter(([k]) => !faites.has(k)).map(([k, e, t]) => `<label><input type="checkbox" data-act="add-premiere" data-k="${k}"><span>${e} ${t}</span></label>`).join('')}
        <label><input type="checkbox" data-act="add-premiere" data-k=""><span>＋ Une autre première fois</span></label></div></section>
  </div>`;
};
function formPremiere(p) {
  const neuf = !p.id, b = bebeCourant();
  formulaire({ titre: `${p.em || '✨'} ${esc(p.t || 'Une première fois')}`, valeurs: { date: cle(auj()), ...p },
    champs: [...(p.k ? [] : [{ k: 't', lab: 'Quelle première fois ?', req: true }, { k: 'em', lab: 'Emoji', def: '✨' }]),
      { k: 'date', lab: 'Date', type: 'date', req: true, large: !!p.k }, { k: 'note', lab: 'Un mot', type: 'textarea', large: true }, { k: 'photo', lab: 'Photo', type: 'photo', large: true }],
    enregistrer: v => {
      if (neuf) { S.premieres.push({ id: uid(), bebe: b.id, k: p.k || '', t: p.t, em: p.em || '✨', ...v }); confettis(couleursAccent(), 2600, 80); toast(p.em || '✨', `À ${ageA(b.naissance.date, v.date)} !`, 'Une première fois de plus dans votre histoire.'); }
      else Object.assign(S.premieres.find(x => x.id === p.id), v);
    },
    supprimer: neuf ? null : () => { S.premieres = S.premieres.filter(x => x.id !== p.id); } });
}
ACTIONS['add-premiere'] = el => { el.checked = false; const d = PREMIERES.find(x => x[0] === el.dataset.k); formPremiere(d ? { k: d[0], em: d[1], t: d[2] } : {}); };
ACTIONS['edit-premiere'] = el => formPremiere(S.premieres.find(p => p.id === el.dataset.id));

/* ---------- Livre souvenir (PDF) ---------- */
SOUS_BB.pdf = b => `<div class="titre-page"><h2>Le <span>livre souvenir</span></h2></div>
  <p class="chapo">Un joli livret à garder, à imprimer ou à offrir : la grossesse, la naissance, les premières fois, les repas et la croissance de ${esc(nomBebe(b))}.</p>
  <section class="carte" style="max-width:720px"><form id="form-pdf"><div class="champs">
    ${[['couv', 'Couverture avec la photo', 1], ['grossesse', 'La grossesse : jalons et souvenirs', 1], ['naissance', 'La naissance', 1], ['premieres', 'Les premières fois', 1],
      ['croissance', 'Poids et taille', 1], ['repas', 'Les découvertes à table', 1], ['prives', 'Inclure aussi les souvenirs marqués « privé »', 0]].map(([k, l, on]) =>
      `<div class="champ large"><label class="case"><input type="checkbox" name="${k}" ${on ? 'checked' : ''}> ${l}</label></div>`).join('')}
    <div class="champ large"><span class="lab">Couleurs</span><div class="palettes">${Object.entries(PALETTES).filter(([k]) => k !== 'nuit').map(([pk, p], i) =>
      `<label title="${p.nom}"><input type="radio" name="pal" value="${pk}" ${pk === carteDe().palette || (!PALETTES[carteDe().palette] && !i) ? 'checked' : ''}><span style="background:linear-gradient(135deg,${p.bg[0]},${p.bg[1]} 60%,${p.acc})"></span></label>`).join('')}</div></div>
  </div>
  <div class="pied"><button type="button" class="btn plein" data-act="creer-pdf">📖 Créer mon livre souvenir</button></div>
  <div class="avert">Dans la fenêtre qui s’ouvre, choisissez <b>« Enregistrer au format PDF »</b> comme imprimante.</div></form></section>`;
ACTIONS['creer-pdf'] = () => {
  const f = $('#form-pdf'), o = k => f.querySelector(`[name=${k}]`)?.checked;
  const pal = PALETTES[f.querySelector('[name=pal]:checked')?.value] || PALETTES.lavande;
  const b = bebeCourant(), n = b.naissance, g = aProfil() ? debutG() : null;
  const pages = [];
  const pied = `<div class="pdf-pied">${esc(nomBebe(b))} · NaoBaby</div>`;
  if (o('couv')) pages.push(`<div class="pdf-page"><div class="pdf-couv"><div class="sur">Le livre de</div>
    ${n.photo ? `<img class="ph" src="${n.photo}" alt="">` : '<div style="font-size:60pt;margin:10mm">🌙</div>'}
    <h1>${esc(nomBebe(b))}</h1><p>${cap(dateLongue(lire(n.date)))}</p><p style="margin-top:8mm">${esc(parents())}</p></div></div>`);
  if (o('grossesse')) {
    const jal = [...JALONS.map(j => ({ ...j, ...(S.jalons[j.k] || {}) })), ...S.jalonsPerso].filter(j => j.date).sort((a, c) => a.date.localeCompare(c.date));
    const jr = S.journal.filter(j => o('prives') || !j.prive).sort((a, c) => a.date.localeCompare(c.date));
    pages.push(`<div class="pdf-page"><h2>En t’attendant</h2>
      ${P().dpa ? `<p>Tu étais attendu${b.sexe === 'fille' ? 'e' : ''} pour le ${dateLongue(lire(P().dpa))}.</p>` : ''}
      ${jal.length ? `<h3>Nos jalons</h3><table>${jal.map(j => `<tr><td style="width:10mm">${j.em}</td><td>${esc(j.t)}</td><td>${dateMoy(lire(j.date))}</td><td>${esc(j.note || '')}</td></tr>`).join('')}</table>` : ''}
      ${jr.length ? `<h3>Notre journal</h3>${jr.map(j => `<div class="pdf-souv">${j.photo ? `<img src="${j.photo}" alt="">` : ''}<div class="q">${dateMoy(lire(j.date))}${g ? ` · semaine ${Math.floor(ecart(g, lire(j.date)) / 7) + 1}` : ''}</div>
        <p><b>${esc(j.titre || '')}</b></p><p>${esc(j.texte || '')}</p>${j.envie ? `<p><i>Envie du moment : ${esc(j.envie)}</i></p>` : ''}<div style="clear:both"></div></div>`).join('')}` : ''}${pied}</div>`);
  }
  if (o('naissance')) pages.push(`<div class="pdf-page"><h2>Ta naissance</h2>
    <p>${cap(dateLongue(lire(n.date)))}${n.heure ? ' à ' + fmtH(n.heure) : ''}${n.lieu ? ', ' + esc(n.lieu) : ''}.</p>
    <div class="pdf-infos"><div><span>Poids</span><b>${fmtPoids(n.poids)}</b></div><div><span>Taille</span><b>${fmtCm(n.taille)}</b></div><div><span>Heure</span><b>${n.heure ? fmtH(n.heure) : '—'}</b></div></div>
    ${n.photo ? `<img src="${n.photo}" alt="" style="max-width:100%;max-height:110mm;border-radius:5mm;display:block;margin:0 auto 6mm">` : ''}
    ${n.souvenirs ? `<h3>Nos premiers souvenirs</h3><p>${esc(n.souvenirs)}</p>` : ''}${pied}</div>`);
  if (o('premieres')) {
    const l = S.premieres.filter(p => p.bebe === b.id).sort((x, y) => x.date.localeCompare(y.date));
    if (l.length) pages.push(`<div class="pdf-page"><h2>Tes premières fois</h2>${l.map(p => `<div class="pdf-souv">${p.photo ? `<img src="${p.photo}" alt="">` : ''}
      <p><b>${p.em} ${esc(p.t)}</b></p><div class="q">${dateMoy(lire(p.date))} · à ${ageA(n.date, p.date)}</div>${p.note ? `<p>${esc(p.note)}</p>` : ''}<div style="clear:both"></div></div>`).join('')}${pied}</div>`);
  }
  if (o('croissance') || o('repas')) {
    const c = S.croissance.filter(x => x.bebe === b.id).sort((x, y) => x.date.localeCompare(y.date));
    const r = S.repas.filter(x => x.bebe === b.id).sort((x, y) => x.date.localeCompare(y.date));
    const u = [...new Map(r.map(x => [x.aliment.toLowerCase(), x])).values()];
    pages.push(`<div class="pdf-page">
      ${o('croissance') && c.length ? `<h2>Tu grandis</h2><table><tr><th>Date</th><th>Âge</th><th>Poids</th><th>Taille</th></tr>${c.map(x => `<tr><td>${dateMoy(lire(x.date))}</td><td>${ageA(n.date, x.date)}</td><td>${nombre(x.poids) ? nombre(x.poids).toLocaleString('fr-FR') + ' kg' : '—'}</td><td>${fmtCm(x.taille)}</td></tr>`).join('')}</table>` : ''}
      ${o('repas') && u.length ? `<h2 style="margin-top:10mm">Tes découvertes à table</h2><table><tr><th>Aliment</th><th>Première fois</th><th>Ton avis</th></tr>${u.map(x => `<tr><td>${CATS_AL[x.cat]?.[0] || ''} ${esc(x.aliment)}</td><td>${dateMoy(lire(x.date))}</td><td>${x.avis ? AVIS[x.avis].join(' ') : ''}</td></tr>`).join('')}</table>` : ''}${pied}</div>`);
  }
  imprimer(pages.join(''), pal);
};
function imprimer(html, pal = PALETTES.lavande) {
  const z = $('#impression');
  z.style.cssText = `--p1:${pal.bg[0]};--p2:${pal.bg[1]};--pi:${pal.ink};--pa:${pal.acc}`;
  z.innerHTML = html;
  const fin = () => { z.innerHTML = ''; removeEventListener('afterprint', fin); };
  addEventListener('afterprint', fin);
  setTimeout(() => window.print(), 250);
}

/* ============================================================
   Accueil après la naissance
   ============================================================ */
PAGES.accueilBebe = () => {
  const a = nes(), b0 = a[0], n = b0.naissance;
  const pr = S.premieres.filter(p => a.some(b => b.id === p.bebe)).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 4);
  const mes = S.croissance.filter(c => c.bebe === b0.id).sort((x, y) => y.date.localeCompare(x.date))[0];
  const rp = S.repas.filter(r => a.some(b => b.id === r.bebe));
  return `<section class="carte hero">
    <div><h2>🌟 ${a.length > 1 ? 'Nos bébés' : 'Notre bébé'}</h2>
      <div class="sem">${a.map(b => `<span>${esc(nomBebe(b))}</span>`).join(' & ')}</div>
      <div class="sa">${ageA(n.date, cle(auj()))} · né${a.every(b => b.sexe === 'fille') ? 'e' : ''}${a.length > 1 ? 's' : ''} le ${dateMoy(lire(n.date))}</div>
      <div class="infos-n">${a.length === 1 ? `<div><span>Poids de naissance</span><b>${fmtPoids(n.poids)}</b></div><div><span>Taille</span><b>${fmtCm(n.taille)}</b></div>` : ''}
        <div><span>Jours ensemble</span><b>${ecart(lire(n.date), auj()) + 1}</b></div>${mes && !mes.naissance ? `<div><span>Dernière mesure</span><b>${nombre(mes.poids) ? nombre(mes.poids).toLocaleString('fr-FR') + ' kg' : fmtCm(mes.taille)}</b></div>` : ''}</div>
    </div>
    <div class="bulle-bebe"><div class="orbe" style="overflow:hidden">${b0.naissance.photo ? `<img src="${b0.naissance.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '<span class="fruit">👶</span>'}</div>
      <p>Chaque jour, un peu plus de vous. 💜</p></div>
  </section>
  <div class="actions-rapides">
    <button class="btn plein" data-act="go" data-p="bebe" data-s="premieres"><span class="plus">＋</span> Une première fois</button>
    <button class="btn plein" data-act="go" data-p="bebe" data-s="repas"><span class="plus">＋</span> Un nouveau repas</button>
    <button class="btn plein" data-act="go" data-p="bebe" data-s="croissance"><span class="plus">＋</span> Poids & taille</button>
    <button class="btn" data-act="go" data-p="bebe" data-s="carte">💌 Carte de naissance</button>
    <button class="btn" data-act="go" data-p="bebe" data-s="pdf">📖 Livre souvenir</button>
  </div>
  <div class="grille">
    <section class="carte">${carteT('✨', 'Les dernières premières fois')}${pr.map(p => `<div class="ligne"><span class="em">${p.em}</span><div class="txt"><b>${esc(p.t)}</b><span>à ${ageA(S.bebes.find(b => b.id === p.bebe)?.naissance.date, p.date)}</span></div></div>`).join('') || '<div class="vide">Le premier sourire n’est pas loin…</div>'}${lien('Toutes les premières fois', 'bebe', 'premieres')}</section>
    <section class="carte">${carteT('🥄', 'À table', pluriel(new Set(rp.map(r => r.aliment.toLowerCase())).size, 'aliment goûté', 'aliments goûtés'))}${rp.slice(-3).reverse().map(r => `<div class="ligne"><span class="em">${(AVIS[r.avis] || ['🥄'])[0]}</span><div class="txt"><b>${esc(r.aliment)}</b><span>${dateCourte(lire(r.date))}</span></div></div>`).join('') || '<div class="vide">La diversification viendra à son rythme.</div>'}${lien('Repas & découvertes', 'bebe', 'repas')}</section>
    ${carteEtapes()}
    <section class="carte">${carteT('💭', 'Notre journal')}${[...S.journal].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 3).map(j => `<div class="ligne" data-act="edit-souvenir" data-id="${j.id}" style="cursor:pointer"><span class="em">${(EMO[j.emotion] || '💭').split(' ')[0]}</span><div class="txt"><b>${esc(j.titre || (j.texte || '').slice(0, 50))}</b><span>${dateCourte(lire(j.date))}</span></div></div>`).join('') || '<div class="vide">Aucun souvenir encore.</div>'}
      <button class="lien-carte" data-act="add-souvenir">＋ Ajouter un souvenir</button></section>
    ${etoiles().length ? carteEnPensee() : ''}
  </div>`;
};

/* ============================================================
   L'espace souvenir — quand la grossesse s'arrête
   ============================================================ */
PAGES.souvenir = () => {
  const p = S.perte, globale = P().mode === 'perte';
  const noms = globale ? (p.nom || etoiles().map(b => b.prenom).filter(Boolean).join(', ')) : etoiles().map(b => nomBebe(b)).join(', ');
  return `<section class="carte bougie-zone">
    <div class="bougie" aria-hidden="true"><div class="halo"></div><div class="flamme"></div><div class="meche"></div><div class="cire"></div></div>
    <div class="sa">Pour toujours dans notre histoire</div>
    <h2 style="font-size:32px;margin:6px 0">${noms ? esc(noms) : 'Notre petit amour'}</h2>
    ${globale && p.date ? `<p style="color:var(--ink-2);margin:0">${dateLongue(lire(p.date))}</p>` : ''}
    <p class="chapo" style="margin:14px auto 0;max-width:60ch">Ce carnet reste le vôtre. Vous pouvez y garder vos mots, vos photos et vos souvenirs, à votre rythme, sans rien devoir à personne.</p>
  </section>
  <div class="grille-2" style="margin-top:16px">
    <section class="carte">${carteT('🕊️', 'Nos mots')}
      <textarea rows="8" data-perte="mots" placeholder="Une lettre, une pensée, ce que vous voulez garder…">${esc(p.mots)}</textarea>
      <div class="photos">${p.photos.map((x, i) => `<div style="position:relative"><img class="photo-mini" src="${x}" alt=""><button class="rond petit" style="position:absolute;top:4px;right:4px" data-act="perte-photo-sup" data-i="${i}">✕</button></div>`).join('')}
        <button class="depot" data-act="perte-photo" style="width:84px;height:84px;justify-content:center;flex-direction:column;gap:2px"><span style="font-size:22px">📷</span><span style="font-size:11px">Ajouter</span></button></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px"><button class="lien-carte" data-act="add-souvenir">＋ Un souvenir dans le journal</button>${lien('Le journal', 'grossesse', 'journal')}</div></section>
    <section class="carte">${carteT('🤝', 'Vous n’êtes pas seuls')}
      <p style="margin:0 0 10px;color:var(--ink-2)">Votre sage-femme, votre médecin ou la maternité peuvent vous accompagner, vous et votre partenaire — pour le corps comme pour le cœur, maintenant ou plus tard.
        Il n’y a pas de bonne façon de traverser ce moment.</p>
      <div class="ligne"><span class="em">🕯️</span><div class="txt"><b>Agapa</b><span>Écoute et accompagnement autour de la perte d’un bébé pendant la grossesse</span></div><a class="btn petit" href="https://www.agapa.fr" target="_blank" rel="noopener">agapa.fr</a></div>
      <div class="ligne"><span class="em">🌸</span><div class="txt"><b>Petite Émilie</b><span>Association de parents endeuillés en périnatalité</span></div><a class="btn petit" href="https://www.petiteemilie.org" target="_blank" rel="noopener">petiteemilie.org</a></div>
      <div class="ligne"><span class="em">🤍</span><div class="txt"><b>SPAMA</b><span>Soins palliatifs et accompagnement en maternité</span></div><a class="btn petit" href="https://www.spama.asso.fr" target="_blank" rel="noopener">spama.asso.fr</a></div>
      <div class="note-douce"><span class="em">📞</span><div>Si la peine devient trop lourde, le <b>3114</b> répond jour et nuit, gratuitement. En cas d’urgence : <b>15</b> ou <b>112</b>.</div></div>
      ${globale ? `<div class="pied"><button class="btn petit" data-act="perte-annuler">Revenir au suivi de grossesse</button><button class="btn petit" data-act="nouveau-carnet">🌱 Commencer un nouveau carnet, un jour</button></div>` : ''}</section>
  </div>
  ${S.archives.length ? `<section class="carte" style="margin-top:16px">${carteT('📚', 'Nos carnets gardés')}${S.archives.map(a => `<div class="ligne"><span class="em">✦</span><div class="txt"><b>${esc(a.nom || 'Notre petit amour')}</b><span>${a.date ? dateMoy(lire(a.date)) : ''}${a.mots ? ' · ' + esc(a.mots.slice(0, 80)) + (a.mots.length > 80 ? '…' : '') : ''}</span></div></div>`).join('')}</section>` : ''}`;
};
document.addEventListener('change', e => { if (e.target.dataset.perte) { S.perte[e.target.dataset.perte] = e.target.value; enregistrer(); } });
ACTIONS['perte-photo'] = async () => { const p = await choisirPhoto(); if (p) { S.perte.photos.push(p); sauver(); } };
ACTIONS['perte-photo-sup'] = el => { S.perte.photos.splice(Number(el.dataset.i), 1); sauver(); };
ACTIONS['mode-perte'] = () => {
  fermer();
  const a = S.bebes.filter(b => !b.etoile);
  formulaire({
    titre: '🕊️ Notre grossesse s’est arrêtée',
    chapo: 'Nous sommes profondément désolés. Rien ne presse ici : NaoBaby va se faire plus doux, cacher les comptes à rebours, les listes et les fêtes, et vous laisser un espace pour vos souvenirs.',
    valeurs: { date: cle(auj()), qui: 'tous' },
    champs: [
      ...(a.length > 1 ? [{ k: 'qui', lab: 'Pour', type: 'choix', large: true, options: [['tous', 'Toute la grossesse'], ...a.map(b => [b.id, `Seulement ${nomBebe(b, S.bebes.indexOf(b))}`])] }] : []),
      { k: 'date', lab: 'Date (facultative)', type: 'date' }, { k: 'nom', lab: 'Un prénom, si vous le souhaitez' },
      { k: 'n', type: 'note', em: '🤍', html: 'Votre sage-femme, votre médecin ou la maternité peuvent vous accompagner. Vous pourrez revenir en arrière à tout moment depuis l’espace souvenir.' },
    ],
    texteOk: 'Continuer, doucement',
    enregistrer: v => {
      if (v.qui && v.qui !== 'tous') {
        const b = S.bebes.find(x => x.id === v.qui); b.etoile = true; if (v.nom) b.prenom = v.nom; b.etoileDate = v.date;
        V.page = 'souvenir';
      } else { P().mode = 'perte'; S.perte.date = v.date; S.perte.nom = v.nom; V.page = 'accueil'; }
      majAccent(); majMotifs();
    },
  });
};
ACTIONS['perte-annuler'] = async () => { if (await confirmer('Revenir au suivi ?', 'Le suivi de grossesse réapparaîtra. Vos mots et photos restent gardés.', 'Revenir', false)) { P().mode = 'grossesse'; majAccent(); majMotifs(); sauver(); } };
ACTIONS['nouveau-carnet'] = async () => {
  if (!await confirmer('Un nouveau carnet', 'Vos mots, vos photos et votre journal seront gardés dans « Nos carnets gardés ». Le suivi repartira de zéro pour une future grossesse, quand vous serez prêts.', 'Commencer', false)) return;
  S.archives.push({ id: uid(), date: S.perte.date, nom: S.perte.nom, mots: S.perte.mots, photos: S.perte.photos, journal: S.journal, jalons: S.jalons });
  const garde = { archives: S.archives, theme: null, profil: { parent1: P().parent1, parent2: P().parent2, nomFamille: P().nomFamille, maternite: P().maternite, materniteTel: P().materniteTel, materniteAdresse: P().materniteAdresse } };
  S = completer(Object.assign(vierge(), { archives: garde.archives }));
  Object.assign(S.profil, garde.profil);
  majAccent(); majMotifs(); V.page = 'accueil'; sauver();
  setTimeout(() => ACTIONS.profil(), 300);
};
