'use strict';
/* ============================================================
   NaoBaby — événements : baby shower, gender reveal,
   invitations numériques animées, et la révélation du sexe
   ============================================================ */

/* palettes partagées par les invitations et les cartes de naissance */
const PALETTES = {
  lavande: { nom: 'Lavande', bg: ['#F1E9FE', '#D8CAF8'], ink: '#3B2E6E', acc: '#7F63D6', page: ['#6A59BC', '#2A2150'], conf: ['#C9B7F5', '#B39BF0', '#FFFFFF', '#F3D7EA', '#F3C969'] },
  rose: { nom: 'Rose poudré', bg: ['#FDF0F5', '#F5D2E2'], ink: '#6B2E4F', acc: '#C95A90', page: ['#B77BB0', '#4A2340'], conf: ['#F4B6CF', '#F9D5E4', '#FFFFFF', '#E3B9EC', '#F3C969'] },
  bleu: { nom: 'Bleu ciel', bg: ['#EDF4FE', '#CDDFF8'], ink: '#23406E', acc: '#4A78CC', page: ['#6F8BD6', '#1F2A55'], conf: ['#A8C6F6', '#CFE0FB', '#FFFFFF', '#C9B7F5', '#F3C969'] },
  creme: { nom: 'Crème & doré', bg: ['#FCF7EF', '#EEE2CD'], ink: '#4E3F2C', acc: '#A9803F', page: ['#B89C74', '#3D3121'], conf: ['#E9D7B5', '#F3C969', '#FFFFFF', '#D8CBB8'] },
  sauge: { nom: 'Sauge', bg: ['#F1F6F1', '#D3E4D8'], ink: '#2F4A3B', acc: '#5E8F73', page: ['#7FA58E', '#20352A'], conf: ['#BFD9C8', '#F3E9C6', '#FFFFFF', '#E6D3E8'] },
  nuit: { nom: 'Nuit étoilée', bg: ['#4A3A94', '#1E1740'], ink: '#F6F2FF', acc: '#C9B7F5', page: ['#3B2E7E', '#120E26'], conf: ['#C9B7F5', '#F3C969', '#FFFFFF', '#F4B6CF'] },
  surprise: { nom: 'Rose & bleu', bg: ['#FCEAF3', '#E3EDFD'], ink: '#40306A', acc: '#9B7BD8', page: ['#9E86D6', '#2A2150'], conf: ['#F4B6CF', '#A8C6F6', '#FFFFFF', '#C9B7F5'] },
  peche: { nom: 'Pêche', bg: ['#FFF3EC', '#F9D5C4'], ink: '#6A3A2C', acc: '#D27C5A', page: ['#D59A80', '#4A2A20'], conf: ['#F6BFA6', '#FCE2D4', '#FFFFFF', '#F3C969'] },
  menthe: { nom: 'Menthe', bg: ['#EFFAF6', '#CBEDE1'], ink: '#24574A', acc: '#3C9A82', page: ['#6FB9A4', '#173A31'], conf: ['#A9DFCD', '#DDF4EC', '#FFFFFF', '#F6E3A8'] },
  soleil: { nom: 'Soleil doux', bg: ['#FFFAEA', '#F6E4AE'], ink: '#5C4A1C', acc: '#C3931F', page: ['#D7B660', '#3E3214'], conf: ['#F3D77C', '#FBEFC6', '#FFFFFF', '#F6BFA6'] },
  arcenciel: { nom: 'Arc-en-ciel pastel', bg: ['#FDEEF3', '#E6F4EE'], ink: '#43356B', acc: '#8C6FD6', page: ['#A58ED8', '#2A2150'], conf: ['#F4B6CF', '#F6D98A', '#A9DFCD', '#A8C6F6', '#C9B7F5'] },
};
const ANIMS = { etoiles: '✨ Étoiles', confettis: '🎊 Confettis doux', ballons: '🎈 Ballons', bulles: '🫧 Bulles', nuages: '☁️ Nuages',
  coeurs: '💕 Petits cœurs', paillettes: '🌟 Paillettes dorées', papillons: '🦋 Papillons', aucune: '⏸️ Sans animation' };
/* les modèles : la mise en page de l'invitation, au-delà des couleurs */
const MODELES = { classique: 'Classique', arche: 'Arche', nuage: 'Nuages', polaroid: 'Polaroïd', ruban: 'Ruban', lune: 'Clair de lune',
  fleurs: 'Bouquet', guirlande: 'Guirlande', pois: 'Petits pois', minimal: 'Épuré' };
const EMOJIS_INV = ['🍼', '🎀', '🧸', '🌙', '⭐', '🎈', '🍰', '🦋', '🌸', '☁️', '👶', '💕', '🐣', '🦢', '🌈', '🍓', '🐘', '🦊', '🐰', '🌼'];
function textesInv(k) {
  const bb = actifs().length > 1 ? 'nos bébés' : 'bébé';
  return k === 'shower' ? [
    { sur: 'Vous êtes invité·e à la', titre: 'Baby shower', message: `Venez célébrer avec nous l'arrivée prochaine de ${bb}.\nDouceurs, jeux et beaucoup d'amour au programme.` },
    { sur: 'Une douce fête pour', titre: 'Bébé arrive !', message: `Un goûter tout doux pour souhaiter la bienvenue à ${bb}. Votre présence sera notre plus beau cadeau.` },
    { sur: 'Bientôt', titre: 'La famille s’agrandit', message: 'Avant le grand jour, nous aimerions partager ce moment avec les personnes qui comptent pour nous.' },
    { sur: 'Thé, gâteaux & tendresse', titre: 'Tea party pour bébé', message: 'Une après-midi gourmande pour rêver ensemble à la petite vie qui arrive.' },
    { sur: 'Oh baby !', titre: 'Baby shower', message: `Rires, douceurs et petits chaussons : venez fêter ${bb} avec nous !` },
  ] : [
    { sur: 'Fille ou garçon ?', titre: 'Gender reveal', message: 'Venez découvrir avec nous qui se cache dans le petit ventre… Rose ou bleu ? Réponse en direct !' },
    { sur: 'Le grand secret', titre: 'Rose ou bleu ?', message: 'Faites vos pronostics : nous découvrirons ensemble si c’est une petite fille ou un petit garçon.' },
    { sur: 'Team rose ou team bleu ?', titre: 'La grande révélation', message: 'Venez voter, trinquer et partager avec nous ce moment magique.' },
    { sur: 'Il ou elle ?', titre: 'Surprise !', message: 'Un secret bien gardé, une enveloppe, et vous à nos côtés pour l’ouvrir.' },
  ];
}

/* le style des invitations — injecté dans la page ET recopié dans chaque invitation exportée */
const INVIT_CSS = `
.invit{position:relative;width:min(380px,100%);aspect-ratio:3/4.2;border-radius:26px;overflow:hidden;color:var(--i-ink);text-align:center;
  background:linear-gradient(165deg,var(--i-bg1),var(--i-bg2));box-shadow:0 30px 70px -30px rgba(20,10,50,.8);box-sizing:border-box;
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 26px;font-family:Georgia,"Times New Roman",serif;font-style:italic;
  animation:i-ouvre 1s cubic-bezier(.2,.9,.25,1.15) both}
.invit *{box-sizing:border-box}
.invit .cadre{position:absolute;inset:12px;border-radius:18px;border:1.5px solid color-mix(in srgb, var(--i-acc) 45%, transparent);pointer-events:none}
.invit .couche{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.invit .couche span{position:absolute;display:block}
.invit .i-sur{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-style:normal;font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--i-acc);position:relative}
.invit .i-titre{font-size:32px;line-height:1.12;margin:10px 0 6px;position:relative;font-weight:600}
.invit .i-pour{font-size:15px;margin-bottom:6px;position:relative;opacity:.85}
.invit .i-emb{font-size:46px;margin:4px 0;position:relative;animation:i-berce 4s ease-in-out infinite;display:inline-block}
.invit .i-photo{width:118px;height:118px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,.85);box-shadow:0 12px 26px -12px rgba(0,0,0,.5);position:relative;margin:4px 0}
.invit .i-msg{font-size:14.5px;line-height:1.5;margin:8px 0;position:relative;white-space:pre-wrap}
.invit .i-quand{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-style:normal;font-size:13px;font-weight:700;margin-top:8px;position:relative}
.invit .i-ou{font-size:13.5px;position:relative;opacity:.85}
.invit .i-rsvp{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-style:normal;font-size:11.5px;margin-top:12px;padding:6px 14px;border-radius:999px;
  background:color-mix(in srgb, var(--i-acc) 16%, transparent);position:relative}
@keyframes i-ouvre{0%{opacity:0;transform:perspective(900px) rotateX(30deg) translateY(30px) scale(.92)}100%{opacity:1;transform:none}}
@keyframes i-berce{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes i-tombe{0%{transform:translate3d(0,-40px,0) rotate(0)}100%{transform:translate3d(var(--dx,20px),640px,0) rotate(var(--rot,360deg))}}
@keyframes i-monte{0%{transform:translate3d(0,60px,0)}100%{transform:translate3d(var(--dx,10px),-660px,0)}}
@keyframes i-scint{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
@keyframes i-glisse{0%{transform:translateX(-160px)}100%{transform:translateX(560px)}}
@keyframes i-battre{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.25)}}
.invit .d{position:absolute;pointer-events:none}
.invit.m-arche .cadre{inset:16px;border-radius:180px 180px 20px 20px;border-width:2px}
.invit.m-arche .cadre::after{content:'';position:absolute;inset:6px;border-radius:inherit;border:1px dashed color-mix(in srgb, var(--i-acc) 45%, transparent)}
.invit.m-arche{padding-top:64px}
.invit .d-plein{inset:0;width:100%;height:100%}
.invit.m-nuage{padding:60px 30px}
.invit .i-pola{position:relative;background:#fff;padding:10px 10px 34px;transform:rotate(-4deg);box-shadow:0 14px 28px -14px rgba(0,0,0,.55);margin:10px 0 8px}
.invit .i-pola .i-photo{border-radius:2px;border:0;width:150px;height:150px;box-shadow:none;margin:0}
.invit .i-pola .i-emb{display:grid;place-items:center;width:150px;height:130px;margin:0;font-size:64px;background:linear-gradient(160deg,var(--i-bg1),var(--i-bg2));animation:none}
.invit.m-polaroid .i-titre{transform:rotate(-2deg)}
.invit.m-ruban .i-titre{background:var(--i-acc);color:#fff;padding:8px 36px;font-size:26px;clip-path:polygon(0 0,100% 0,93% 50%,100% 100%,0 100%,7% 50%);margin:12px -10px 8px}
.invit .d-lune{top:14px;right:10px;width:140px;height:140px}
.invit.m-lune .i-sur{margin-top:40px}
.invit .d-fleur{width:185px;height:185px}
.invit .d-fleur.bg{left:-4px;bottom:-4px}.invit .d-fleur.hd{right:-4px;top:-4px;transform:rotate(180deg)}
.invit.m-minimal{padding:40px 36px}
.invit.m-minimal .i-sur{letter-spacing:.32em;font-weight:600}
.invit.m-minimal .i-sur::after{content:'';display:block;width:44px;height:1px;background:var(--i-acc);margin:12px auto 0}
.invit.m-minimal .i-titre{font-size:42px;font-weight:400;letter-spacing:-.02em}
.invit.m-minimal .i-emb{font-size:32px;animation:none}
.invit.m-minimal .i-rsvp{background:none;border-top:1px solid color-mix(in srgb, var(--i-acc) 40%, transparent);border-radius:0;padding-top:10px}
.invit .d-guirlande{top:0;left:0;width:100%;height:auto}
.invit.m-guirlande{padding-top:70px}
.invit.m-pois{background:radial-gradient(circle, color-mix(in srgb, var(--i-acc) 30%, transparent) 2.6px, transparent 3.2px) 0 0/24px 24px, linear-gradient(165deg,var(--i-bg1),var(--i-bg2))}
.invit.m-pois .cadre{inset:22px;border:0;border-radius:24px;background:color-mix(in srgb, var(--i-bg1) 90%, transparent);box-shadow:0 10px 30px -18px rgba(0,0,0,.4)}
.invit.m-pois{padding:34px 36px}
@media (prefers-reduced-motion:reduce){.invit,.invit *{animation:none!important}}`;
(function () { const s = document.createElement('style'); s.textContent = INVIT_CSS; document.head.append(s); })();

/* un tirage pseudo-aléatoire stable : l'aperçu ne « saute » pas à chaque frappe */
function graine(n) { let s = n; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function coucheAnim(anim, pal) {
  const r = graine(7), c = pal.conf;
  let h = '';
  if (anim === 'etoiles') for (let i = 0; i < 22; i++) h += `<span style="left:${(r() * 94).toFixed(1)}%;top:${(r() * 94).toFixed(1)}%;font-size:${(8 + r() * 12).toFixed(0)}px;color:${i % 3 ? pal.acc : c[3] || '#fff'};animation:i-scint ${(2 + r() * 3).toFixed(1)}s ${(-r() * 4).toFixed(1)}s ease-in-out infinite">✦</span>`;
  if (anim === 'confettis') for (let i = 0; i < 30; i++) h += `<span style="left:${(r() * 100).toFixed(1)}%;top:-20px;width:${(5 + r() * 5).toFixed(0)}px;height:${(8 + r() * 6).toFixed(0)}px;border-radius:${i % 2 ? '50%' : '2px'};background:${c[i % c.length]};--dx:${(-40 + r() * 80).toFixed(0)}px;--rot:${(180 + r() * 540).toFixed(0)}deg;animation:i-tombe ${(6 + r() * 6).toFixed(1)}s ${(-r() * 10).toFixed(1)}s linear infinite;opacity:.85"></span>`;
  if (anim === 'ballons') for (let i = 0; i < 10; i++) { const col = c[i % c.length] === '#FFFFFF' ? pal.acc : c[i % c.length]; h += `<span style="left:${(r() * 88).toFixed(1)}%;bottom:-80px;--dx:${(-30 + r() * 60).toFixed(0)}px;animation:i-monte ${(10 + r() * 8).toFixed(1)}s ${(-r() * 16).toFixed(1)}s linear infinite;opacity:.8"><svg width="${(26 + r() * 16).toFixed(0)}" viewBox="0 0 30 56"><path d="M15 2C7 2 2 9 2 16s6 15 13 17c7-2 13-10 13-17S23 2 15 2z" fill="${col}"/><path d="M13 33h4l-2 3z" fill="${col}"/><path d="M15 36c-3 5 3 8 0 14" stroke="${pal.ink}" stroke-opacity=".35" fill="none"/><ellipse cx="10" cy="11" rx="3" ry="5" fill="#fff" opacity=".35"/></svg></span>`; }
  if (anim === 'bulles') for (let i = 0; i < 18; i++) { const t = 10 + r() * 26; h += `<span style="left:${(r() * 94).toFixed(1)}%;bottom:-40px;width:${t.toFixed(0)}px;height:${t.toFixed(0)}px;border-radius:50%;border:1.5px solid ${pal.acc};background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.7), transparent 60%);--dx:${(-24 + r() * 48).toFixed(0)}px;animation:i-monte ${(8 + r() * 8).toFixed(1)}s ${(-r() * 14).toFixed(1)}s linear infinite;opacity:.55"></span>`; }
  if (anim === 'nuages') for (let i = 0; i < 6; i++) h += `<span style="left:0;top:${(4 + r() * 88).toFixed(1)}%;animation:i-glisse ${(22 + r() * 18).toFixed(0)}s ${(-r() * 30).toFixed(0)}s linear infinite;opacity:${(.35 + r() * .35).toFixed(2)}"><svg width="${(70 + r() * 60).toFixed(0)}" viewBox="0 0 64 36"><path d="M16 34h34a12 12 0 0 0 1-24A16 16 0 0 0 20 13 11 11 0 0 0 16 34z" fill="#fff"/></svg></span>`;
  const col = i => { const x = c[i % c.length]; return x === '#FFFFFF' ? pal.acc : x; };
  if (anim === 'coeurs') for (let i = 0; i < 16; i++) h += `<span style="left:${(r() * 92).toFixed(1)}%;bottom:-40px;font-size:${(10 + r() * 14).toFixed(0)}px;color:${col(i)};--dx:${(-30 + r() * 60).toFixed(0)}px;animation:i-monte ${(9 + r() * 7).toFixed(1)}s ${(-r() * 14).toFixed(1)}s linear infinite;opacity:.8">♥</span>`;
  if (anim === 'paillettes') for (let i = 0; i < 40; i++) { const t = 2 + r() * 3.5; h += `<span style="left:${(r() * 100).toFixed(1)}%;top:-10px;width:${t.toFixed(1)}px;height:${t.toFixed(1)}px;border-radius:50%;background:${i % 3 ? '#F3C969' : '#fff'};box-shadow:0 0 6px ${i % 3 ? '#F3C969' : '#fff'};--dx:${(-20 + r() * 40).toFixed(0)}px;--rot:0deg;animation:i-tombe ${(8 + r() * 8).toFixed(1)}s ${(-r() * 14).toFixed(1)}s linear infinite"></span>`; }
  if (anim === 'papillons') for (let i = 0; i < 7; i++) h += `<span style="left:${(r() * 86).toFixed(1)}%;bottom:-40px;--dx:${(-60 + r() * 120).toFixed(0)}px;animation:i-monte ${(14 + r() * 8).toFixed(1)}s ${(-r() * 20).toFixed(1)}s linear infinite;opacity:.8"><svg width="${(20 + r() * 12).toFixed(0)}" viewBox="0 0 24 24" style="animation:i-battre ${(.5 + r() * .4).toFixed(2)}s ease-in-out infinite;fill:${col(i)}"><path d="M12 12C8 4 2 5 3 10c1 4 6 4 9 2zM12 12c4-8 10-7 9-2-1 4-6 4-9 2zM12 12c-3 3-6 6-4 8 2 1 4-3 4-8zM12 12c3 3 6 6 4 8-2 1-4-3-4-8z"/></svg></span>`;
  return `<div class="couche" aria-hidden="true">${h}</div>`;
}
/* le décor propre à chaque modèle */
function decorHTML(m, pal) {
  const c = pal.conf.filter(x => x !== '#FFFFFF');
  if (m === 'nuage') {
    const rang = (y, dec) => Array.from({ length: 9 }, (_, i) => `<circle cx="${i * 48 + dec}" cy="${y}" r="${24 + (i * 37) % 17}"/>`).join('');
    return `<svg class="d d-plein" viewBox="0 0 380 532" preserveAspectRatio="xMidYMid slice"><g fill="#fff" opacity=".85">${rang(-6, 0)}${rang(538, 24)}</g><g fill="#fff" opacity=".45">${rang(22, 24)}${rang(510, 0)}</g></svg>`;
  }
  if (m === 'lune') return `<div class="cadre"></div><svg class="d d-lune" viewBox="0 0 120 120"><path d="M78 14a44 44 0 1 0 28 70A36 36 0 0 1 78 14z" style="fill:var(--i-acc)" opacity=".28"/>
    <g style="fill:var(--i-acc)">${[[22, 30, 4], [38, 12, 2.6], [104, 20, 3], [96, 104, 2.4], [14, 70, 2]].map(([x, y, t]) => `<path d="M${x} ${y - t * 2}Q${x + t * .3} ${y - t * .3} ${x + t * 2} ${y}Q${x + t * .3} ${y + t * .3} ${x} ${y + t * 2}Q${x - t * .3} ${y + t * .3} ${x - t * 2} ${y}Q${x - t * .3} ${y - t * .3} ${x} ${y - t * 2}Z"/>`).join('')}</g></svg>`;
  if (m === 'fleurs') {
    const feuilles = [[22, 78, -40], [34, 64, 25], [46, 54, -50], [58, 42, 18], [70, 32, -55]].map(([x, y, a], i) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.8" transform="rotate(${a} ${x} ${y})" fill="${c[(i + 2) % c.length]}"/>`).join('');
    const fleur = (x, y, col) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 5).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 5).toFixed(1)}" r="4.2" fill="${col}"/>`).join('')}<circle r="2.6" fill="#F3C969"/></g>`;
    const br = `<svg class="d d-fleur CL" viewBox="0 0 100 100"><path d="M4 98C30 72 52 46 88 12" fill="none" stroke="${pal.acc}" stroke-width="1.6" opacity=".55"/>${feuilles}${fleur(88, 12, c[0])}${fleur(40, 60, c[1 % c.length])}${fleur(64, 36, c[0])}</svg>`;
    return `<div class="cadre"></div>${br.replace('CL', 'bg')}${br.replace('CL', 'hd')}`;
  }
  if (m === 'guirlande') {
    const y = x => { const t = x / 380; return (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 52 + t * t * 10; };
    const fanions = Array.from({ length: 10 }, (_, i) => { const x = i * 38 + 19, yy = y(x); return `<path d="M${x - 14} ${yy.toFixed(1)}L${x + 14} ${y(x + 14).toFixed(1)}L${x} ${(yy + 30).toFixed(1)}Z" fill="${c[i % c.length]}"/>`; }).join('');
    return `<svg class="d d-guirlande" viewBox="0 0 380 90"><path d="M0 10Q190 94 380 10" fill="none" stroke="${pal.ink}" stroke-opacity=".35" stroke-width="1.4"/>${fanions}</svg>`;
  }
  if (m === 'polaroid' || m === 'minimal') return '';
  return '<div class="cadre"></div>';
}
function invitDefaut(k) {
  return k === 'shower'
    ? { sur: 'Vous êtes invité·e à la', titre: 'Baby shower', emoji: '🍼', message: `Venez célébrer avec nous l'arrivée prochaine de ${actifs().length > 1 ? 'nos bébés' : 'notre bébé'}.\nDouceurs, jeux et beaucoup d'amour au programme.`, rsvp: 'Merci de nous confirmer votre venue', palette: 'lavande', anim: 'etoiles', photo: '' }
    : { sur: 'Fille ou garçon ?', titre: 'Gender reveal', emoji: '🎀', message: 'Venez découvrir avec nous qui se cache dans le petit ventre… Rose ou bleu ? Réponse en direct !', rsvp: 'Merci de nous confirmer votre venue', palette: 'surprise', anim: 'confettis', photo: '' };
}
const rsvpTxt = inv => inv.rsvp + (inv.rsvpDate ? ' avant le ' + dateCourte(lire(inv.rsvpDate)) : '');
const invitDe = k => (S.events[k].invit ||= invitDefaut(k));
function invitHTML(k, pour = '', autre = {}) {
  const e = S.events[k], inv = { ...invitDe(k), ...autre }, pal = PALETTES[inv.palette] || PALETTES.lavande;
  const m = MODELES[inv.modele] ? inv.modele : 'classique';
  const media = inv.photo ? `<img class="i-photo" src="${inv.photo}" alt="">` : inv.emoji ? `<div class="i-emb">${esc(inv.emoji)}</div>` : '';
  const quand = e.date ? cap(dateLongue(lire(e.date))) + (e.heure ? ' · ' + fmtH(e.heure) : '') : '';
  return `<div class="invit m-${m}" style="--i-bg1:${pal.bg[0]};--i-bg2:${pal.bg[1]};--i-ink:${pal.ink};--i-acc:${pal.acc}">
    ${coucheAnim(inv.anim, pal)}${decorHTML(m, pal)}
    ${pour ? `<div class="i-pour">Pour ${esc(pour)} 💌</div>` : ''}
    <div class="i-sur">${esc(inv.sur)}</div>
    <div class="i-titre">${esc(inv.titre)}</div>
    ${m === 'polaroid' && media ? `<div class="i-pola">${media}</div>` : media}
    <div class="i-msg">${esc(inv.message)}</div>
    ${quand ? `<div class="i-quand">${quand}</div>` : ''}
    ${e.lieu ? `<div class="i-ou">${esc(e.lieu)}</div>` : ''}
    <div class="i-ou" style="margin-top:6px">${esc(parents())}</div>
    ${inv.rsvp ? `<div class="i-rsvp">${esc(rsvpTxt(inv))}</div>` : ''}
  </div>`;
}

/* ============================================================
   La page des événements
   ============================================================ */
const IDEES_EV = {
  shower: {
    deco: ['Arche de ballons pastel', 'Guirlande de petits bodies', 'Photobooth', 'Bouquets de fleurs séchées', 'Table des douceurs'],
    jeux: ['Pronostics : date, poids, prénom', 'Devine le tour de ventre', 'Le livre des conseils aux parents', 'Bingo des cadeaux', 'Qui est ce bébé ? (photos des invités)', 'Décorer des bodies'],
    cadeaux: ['Une cagnotte commune', 'La liste de naissance', 'Des couches de toutes tailles', 'Un livre pour bébé avec une dédicace'],
    menu: ['Mini-sandwichs', 'Cupcakes', 'Mocktails sans alcool', 'Plateau de fruits', 'Gâteau de couches (déco)'],
  },
  reveal: {
    idee: ['Gâteau à l’intérieur coloré', 'Boîte d’où s’envolent des ballons', 'Ballon géant rempli de confettis', 'Canon à confettis', 'Piñata', 'Cupcakes à cœur coloré'],
    deco: ['Moitié rose, moitié bleu', 'Tableau des votes « fille / garçon »', 'Badges pour les invités', 'Guirlande « Fille ou garçon ? »'],
    gateau: ['Génoise colorée à l’intérieur', 'Nuage de chantilly et pépites colorées', 'Layer cake avec surprise'],
    ballons: ['Ballons transparents à confettis', 'Ballon géant noir à percer', 'Arche rose et bleue'],
    playlist: ['Musique douce pour l’arrivée', 'Un roulement de tambour pour le moment J', 'La chanson de votre rencontre'],
  },
};
SOUS.evenements = () => {
  const k = V.ev, e = S.events[k];
  const dep = e.depenses.reduce((s, x) => s + nombre(x.montant), 0), b = nombre(e.budget);
  const oui = e.invites.filter(i => i.rsvp === 'oui'), pers = oui.reduce((s, i) => s + (Number(i.nb) || 1), 0);
  const tuile = (kk, em, nom, sous) => `<button class="ev-tuile ${k === kk ? 'on' : ''}" data-act="ev" data-k="${kk}"><span class="em">${em}</span><div><b>${nom}</b><span>${sous}</span></div></button>`;
  const txt = (champ, lab, place = '') => `<div class="champ large"><label>${lab}</label>
    <textarea data-ev-champ="${champ}" rows="3" placeholder="${esc(place)}">${esc(e[champ] || '')}</textarea>
    ${IDEES_EV[k][champ] ? `<div class="choix" style="margin-top:4px">${IDEES_EV[k][champ].map(i => `<label><input type="checkbox" data-act="idee-ev" data-champ="${champ}" value="${esc(i)}"><span>＋ ${esc(i)}</span></label>`).join('')}</div>` : ''}</div>`;
  const rsvp = { attente: ['att', '⏳ En attente'], oui: ['ok', '✓ Vient'], non: ['non', '✕ Ne vient pas'] };
  return `<div class="titre-page"><h2>Nos <span>événements</span></h2></div>
  <p class="chapo">Organisez une baby shower ou une gender reveal : invités, budget, décoration, jeux, menu — et des invitations numériques animées à envoyer.</p>
  <div class="onglets-ev">${tuile('shower', '🎉', 'Baby shower', e && S.events.shower.date ? cap(dateLongue(lire(S.events.shower.date))) : 'Une fête douce pour accueillir bébé')}
    ${tuile('reveal', '🎀', 'Gender reveal', S.events.reveal.date ? cap(dateLongue(lire(S.events.reveal.date))) : 'Fille ou garçon ? Le grand moment')}</div>
  ${k === 'reveal' ? `<div class="note-douce"><span class="em">🎀</span><div>Le sexe de bébé ne se découvre dans NaoBaby que s'il vous a été communiqué par un professionnel de santé, ou si vous le saisissez vous-mêmes.
    Vous pouvez le faire saisir en secret par un proche, puis l'ouvrir ensemble le jour J.
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">${revelable() ? '<button class="btn plein petit" data-act="reveler">🎀 Découvrir le sexe de bébé</button>' : '<span class="pastille ok">✓ Déjà révélé</span>'}</div></div></div>` : ''}
  <div class="grille">
    <section class="carte">${carteT('📅', 'Le jour J')}
      <div class="champs">
        <div class="champ"><label>Date</label><input type="date" data-ev-champ="date" value="${esc(e.date)}"></div>
        <div class="champ"><label>Heure</label><input type="time" data-ev-champ="heure" value="${esc(e.heure)}"></div>
        <div class="champ large"><label>Lieu</label><input type="text" data-ev-champ="lieu" value="${esc(e.lieu)}" placeholder="Adresse ou nom du lieu"></div>
        <div class="champ"><label>Budget (€)</label><input type="number" min="0" data-ev-champ="budget" value="${esc(e.budget || '')}"></div>
        <div class="champ"><label>${k === 'shower' ? 'Thème' : 'Organisé par'}</label><input type="text" data-ev-champ="${k === 'shower' ? 'theme' : 'orga'}" value="${esc(e[k === 'shower' ? 'theme' : 'orga'] || '')}"></div>
      </div>
      ${e.date ? `<div class="idee"><span class="em">⏳</span><div>${ecart(auj(), lire(e.date)) >= 0 ? `Plus que <b style="color:var(--titre)">${pluriel(ecart(auj(), lire(e.date)), 'jour')}</b>` : 'C’était un joli jour.'}</div></div>` : ''}</section>

    <section class="carte">${carteT('💌', 'Les invités', `${oui.length}/${e.invites.length} · ${pluriel(pers, 'personne')}`)}
      ${e.invites.map(i => `<div class="ligne"><span class="em">👤</span><div class="txt"><b>${esc(i.nom)}</b><span>${esc(i.contact || '')}</span></div>
        <button class="pastille ${rsvp[i.rsvp][0]}" data-act="rsvp" data-id="${i.id}" style="cursor:pointer">${rsvp[i.rsvp][1]}</button>
        <div class="act"><button class="rond petit" data-act="invit-pour" data-id="${i.id}" title="Invitation personnalisée">✉️</button>
        <button class="rond petit" data-act="edit-invite" data-id="${i.id}" aria-label="Modifier">✏️</button></div></div>`).join('') || '<div class="vide">Ajoutez vos invités pour suivre les réponses.</div>'}
      <form class="ajout-ligne" data-form="ev-invite" data-ev="${k}"><input type="text" name="nom" placeholder="Nom" required><input type="text" name="contact" placeholder="E-mail ou téléphone"><button class="btn plein">＋</button></form></section>

    <section class="carte">${carteT('✅', 'À faire', `${e.taches.filter(t => t.fait).length}/${e.taches.length}`)}
      ${e.taches.map(t => `<div class="ligne ${t.fait ? 'fait' : ''}"><button class="coche ${t.fait ? 'on' : ''}" data-act="ev-tache" data-id="${t.id}">✓</button><div class="txt"><b>${esc(t.nom)}</b></div>
        <div class="act"><button class="rond petit" data-act="sup-ev" data-l="taches" data-id="${t.id}">✕</button></div></div>`).join('') || '<div class="vide">Réserver le lieu, envoyer les invitations, commander le gâteau…</div>'}
      <form class="ajout-ligne" data-form="ev-tache" data-ev="${k}"><input type="text" name="nom" placeholder="Ajouter une tâche…" required><button class="btn plein">＋</button></form>
      ${!e.taches.length ? '<button class="btn petit" data-act="taches-defaut" style="margin-top:8px">✨ Proposer une liste de départ</button>' : ''}</section>

    <section class="carte">${carteT('💶', 'Le budget', b ? `${euros(dep)} / ${euros(b)}` : euros(dep))}
      ${b ? `<div class="jauge"><i style="width:${Math.min(100, dep / b * 100)}%;${dep > b ? 'background:var(--doux)' : ''}"></i></div>` : ''}
      ${e.depenses.map(d => `<div class="ligne"><span class="em">💶</span><div class="txt"><b>${esc(d.nom)}</b></div><span class="meta">${euros(d.montant)}</span>
        <div class="act"><button class="rond petit" data-act="sup-ev" data-l="depenses" data-id="${d.id}">✕</button></div></div>`).join('') || '<div class="vide">Décoration, gâteau, lieu…</div>'}
      <form class="ajout-ligne" data-form="ev-depense" data-ev="${k}"><input type="text" name="nom" placeholder="Poste" required><input type="number" name="montant" placeholder="€" min="0" style="max-width:100px"><button class="btn plein">＋</button></form></section>
  </div>

  <section class="carte" style="margin-top:16px">${carteT(k === 'shower' ? '🎈' : '🎀', k === 'shower' ? 'Décoration, jeux, cadeaux et menu' : 'La révélation, la déco, le gâteau et l’ambiance')}
    <div class="champs">${k === 'shower'
      ? txt('deco', 'Décoration') + txt('jeux', 'Jeux') + txt('cadeaux', 'Cadeaux') + txt('menu', 'Menu')
      : txt('idee', 'Idée de révélation') + txt('deco', 'Décoration') + txt('gateau', 'Gâteau') + txt('ballons', 'Ballons') + txt('playlist', 'Playlist') + txt('photos', 'Photos', 'Qui prend les photos ? Quels moments ne pas manquer ?') +
        `<div class="champ large"><label class="case"><input type="checkbox" data-ev-champ="fumigenes" ${e.fumigenes ? 'checked' : ''}> Nous envisageons des fumigènes colorés</label>
        ${e.fumigenes ? `<div class="securite"><span>⚠️</span><div><b>Uniquement si vous les gérez en toute sécurité</b> et conformément aux règles du lieu : autorisation du lieu, extérieur dégagé,
          loin des bâtiments et de la végétation sèche, à distance des invités — en particulier de la future maman et des enfants — et en suivant la notice du fabricant.
          <label class="case" style="margin-top:8px"><input type="checkbox" data-ev-champ="fumiSecurite" ${e.fumiSecurite ? 'checked' : ''}> J’ai vérifié les règles du lieu et je m’occupe de la sécurité</label></div></div>` : ''}</div>`}
    </div></section>

  ${atelierInvitation(k)}`;
};
function atelierInvitation(k) {
  const inv = invitDe(k), e = S.events[k];
  const pour = V.invitPour || '';
  return `<section class="carte" style="margin-top:16px" id="atelier">${carteT('💌', 'Notre invitation numérique')}
    <p class="sous" style="margin-top:-4px">Choisissez un modèle, personnalisez-le, puis téléchargez l’invitation animée (une page à ouvrir sur n’importe quel téléphone) ou en image, et envoyez-la à vos invités.</p>
    <div class="groupe-t" style="padding:0">🎨 ${pluriel(Object.keys(MODELES).length, 'modèle')} à essayer
      <button class="btn petit" data-act="inv-surprise" style="margin-left:auto;text-transform:none;letter-spacing:0">🎲 Me surprendre</button></div>
    <div class="galerie-inv">${Object.entries(MODELES).map(([m, n]) => `<button class="mini-inv ${(inv.modele || 'classique') === m ? 'on' : ''}" data-act="inv-modele" data-m="${m}">
      <div class="mini-cadre">${invitHTML(k, '', { modele: m, anim: 'aucune' })}</div><span>${n}</span></button>`).join('')}</div>
    <div class="atelier">
      <div class="champs">
        <div class="champ large"><span class="lab">💡 Idées de textes</span><div class="choix">${textesInv(k).map((t, i) =>
          `<label><input type="checkbox" data-act="inv-idee" data-i="${i}"><span>${esc(t.titre)} — <small>${esc(t.sur)}</small></span></label>`).join('')}</div></div>
        <div class="champ"><label>Petit titre</label><input type="text" data-inv="sur" value="${esc(inv.sur)}"></div>
        <div class="champ"><label>Titre</label><input type="text" data-inv="titre" value="${esc(inv.titre)}"></div>
        <div class="champ large"><label>Message</label><textarea data-inv="message" rows="3">${esc(inv.message)}</textarea></div>
        <div class="champ"><label>Emoji</label><input type="text" data-inv="emoji" value="${esc(inv.emoji)}" maxlength="8"></div>
        <div class="champ"><label>Réponse souhaitée avant le</label><input type="date" data-inv="rsvpDate" value="${esc(inv.rsvpDate || '')}"></div>
        <div class="champ large"><div class="emojis">${EMOJIS_INV.map(em => `<button class="rond petit ${inv.emoji === em ? 'on' : ''}" data-act="inv-emoji" data-e="${em}" title="Choisir ${em}">${em}</button>`).join('')}</div></div>
        <div class="champ large"><label>Phrase de réponse</label><input type="text" data-inv="rsvp" value="${esc(inv.rsvp)}"></div>
        <div class="champ large"><span class="lab">Couleurs</span><div class="palettes">${Object.entries(PALETTES).map(([pk, p]) =>
          `<label title="${p.nom}"><input type="radio" name="pal-${k}" data-inv="palette" value="${pk}" ${inv.palette === pk ? 'checked' : ''}><span style="background:linear-gradient(135deg,${p.bg[0]},${p.bg[1]} 60%,${p.acc})"></span></label>`).join('')}</div></div>
        <div class="champ large"><span class="lab">Animation</span><div class="choix">${Object.entries(ANIMS).map(([ak, n]) =>
          `<label><input type="radio" name="anim-${k}" data-inv="anim" value="${ak}" ${inv.anim === ak ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>
        <div class="champ large"><span class="lab">Photo (facultative)</span><div class="choix"><button class="btn petit" data-act="inv-photo">📷 ${inv.photo ? 'Changer' : 'Ajouter'} une photo</button>
          ${inv.photo ? '<button class="btn petit" data-act="inv-photo-sup">Retirer</button>' : ''}</div></div>
        <div class="champ large"><label>Personnaliser pour</label><select data-act-change="invit-pour-sel"><option value="">— Invitation générale —</option>
          ${e.invites.map(i => `<option ${pour === i.nom ? 'selected' : ''}>${esc(i.nom)}</option>`).join('')}</select></div>
        <div class="champ large"><div class="choix">
          <button class="btn plein" data-act="inv-html">✨ Télécharger l’invitation animée</button>
          <button class="btn" data-act="inv-png">🖼️ En image</button>
          <button class="btn" data-act="inv-texte">📋 Copier le texte</button>
          ${navigator.share ? '<button class="btn" data-act="inv-partager">📤 Partager…</button>' : ''}
          ${pour ? envoiDirect(e.invites.find(i => i.nom === pour), k) : ''}
          ${e.invites.length ? '<button class="btn" data-act="inv-toutes">📦 Une invitation par invité</button>' : ''}</div></div>
      </div>
      <div class="invit-scene" id="scene-invit">${invitHTML(k, pour)}</div>
    </div></section>`;
}
function texteInvit(k, pour = '') {
  const e = S.events[k], inv = invitDe(k);
  return [pour ? `${pour},` : '', `${inv.sur} ${inv.titre} ${inv.emoji || ''}`.trim(), '', inv.message, '',
    e.date ? `📅 ${cap(dateLongue(lire(e.date)))}${e.heure ? ' à ' + fmtH(e.heure) : ''}` : '', e.lieu ? `📍 ${e.lieu}` : '',
    inv.rsvp ? `💌 ${rsvpTxt(inv)}` : '', '', parents()].filter((l, i, a) => l || (a[i - 1] && i < a.length - 1)).join('\n');
}
function envoiDirect(i, k) {
  if (!i || !i.contact) return '';
  const t = encodeURIComponent(texteInvit(k, i.nom)), sujet = encodeURIComponent(`${invitDe(k).titre} — invitation`);
  if (i.contact.includes('@')) return `<a class="btn" href="mailto:${esc(i.contact)}?subject=${sujet}&body=${t}">✉️ E-mail à ${esc(i.nom)}</a>`;
  if (/^[+\d][\d .-]{5,}$/.test(i.contact)) return `<a class="btn" href="sms:${esc(i.contact.replace(/[ .-]/g, ''))}?&body=${t}">💬 SMS à ${esc(i.nom)}</a>`;
  return '';
}
function pageInvitation(k, pour = '') {
  const inv = invitDe(k), pal = PALETTES[inv.palette] || PALETTES.lavande;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(inv.titre)} — ${esc(parents())}</title>
<style>html,body{margin:0;min-height:100%}body{min-height:100vh;display:grid;place-items:center;padding:22px;box-sizing:border-box;
background:radial-gradient(1000px 700px at 50% 30%, ${pal.page[0]}, ${pal.page[1]});font-family:Georgia,serif}
.pied{position:fixed;bottom:10px;left:0;right:0;text-align:center;font:italic 12px Georgia,serif;color:rgba(255,255,255,.6)}
${INVIT_CSS}</style></head><body>${invitHTML(k, pour)}<div class="pied">Créée avec amour dans NaoBaby · NaoGroup</div></body></html>`;
}

/* ---------- actions des événements ---------- */
ACTIONS.ev = el => { V.ev = el.dataset.k; V.invitPour = ''; rendre(); };
ACTIONS.rsvp = el => { const i = S.events[V.ev].invites.find(x => x.id === el.dataset.id); const o = ['attente', 'oui', 'non']; i.rsvp = o[(o.indexOf(i.rsvp) + 1) % 3]; sauver(); };
ACTIONS['ev-tache'] = el => { const t = S.events[V.ev].taches.find(x => x.id === el.dataset.id); t.fait = !t.fait; sauver(); };
ACTIONS['sup-ev'] = el => { const e = S.events[V.ev]; e[el.dataset.l] = e[el.dataset.l].filter(x => x.id !== el.dataset.id); sauver(); };
ACTIONS['edit-invite'] = el => {
  const e = S.events[V.ev], i = e.invites.find(x => x.id === el.dataset.id);
  formulaire({ titre: '💌 Invité', valeurs: i,
    champs: [{ k: 'nom', lab: 'Nom', req: true, large: true }, { k: 'contact', lab: 'E-mail ou téléphone', large: true }, { k: 'nb', lab: 'Nombre de personnes', type: 'number', min: 1 },
      { k: 'rsvp', lab: 'Réponse', type: 'select', options: [['attente', 'En attente'], ['oui', 'Vient'], ['non', 'Ne vient pas']] }],
    enregistrer: v => { Object.assign(i, v); i.nb = Number(v.nb) || 1; },
    supprimer: () => { e.invites = e.invites.filter(x => x.id !== i.id); } });
};
ACTIONS['taches-defaut'] = () => {
  const l = V.ev === 'shower'
    ? ['Choisir la date avec les futurs parents', 'Réserver le lieu', 'Envoyer les invitations', 'Commander ou préparer le gâteau', 'Préparer les jeux', 'Acheter la décoration', 'Prévoir un livre d’or', 'Organiser les photos']
    : ['Recevoir le résultat sous enveloppe', 'Confier l’enveloppe à la personne de confiance', 'Préparer la surprise (gâteau, ballons…)', 'Envoyer les invitations', 'Préparer les votes des invités', 'Prévoir qui filme le moment', 'Vérifier les règles du lieu'];
  S.events[V.ev].taches.push(...l.map(nom => ({ id: uid(), nom, fait: false }))); sauver();
};
ACTIONS['idee-ev'] = el => {
  const e = S.events[V.ev], c = el.dataset.champ;
  e[c] = (e[c] ? e[c].replace(/\s+$/, '') + '\n' : '') + '• ' + el.value; sauver();
};
ACTIONS['invit-pour'] = el => {
  const i = S.events[V.ev].invites.find(x => x.id === el.dataset.id);
  V.invitPour = i.nom; rendre();
  setTimeout(() => $('#atelier')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
};
ACTIONS['inv-photo'] = async () => { const p = await choisirPhoto(600, .8); if (p) { invitDe(V.ev).photo = p; sauver(); } };
ACTIONS['inv-photo-sup'] = () => { invitDe(V.ev).photo = ''; sauver(); };
/* redessine seulement l'atelier : la page ne bouge pas sous les yeux */
function rendreAtelier() { const a = $('#atelier'); if (a) a.outerHTML = atelierInvitation(V.ev); else rendre(); }
ACTIONS['inv-modele'] = el => { invitDe(V.ev).modele = el.dataset.m; enregistrer(); rendreAtelier(); };
ACTIONS['inv-emoji'] = el => { const inv = invitDe(V.ev); inv.emoji = el.dataset.e; enregistrer(); rendreAtelier(); };
ACTIONS['inv-idee'] = el => { el.checked = false; Object.assign(invitDe(V.ev), textesInv(V.ev)[Number(el.dataset.i)]); enregistrer(); rendreAtelier(); };
ACTIONS['inv-surprise'] = () => {
  const au = o => { const l = Object.keys(o); return l[Math.floor(Math.random() * l.length)]; };
  const inv = invitDe(V.ev);
  Object.assign(inv, { modele: au(MODELES), palette: au(PALETTES), anim: au(Object.fromEntries(Object.entries(ANIMS).filter(([k]) => k !== 'aucune'))),
    emoji: EMOJIS_INV[Math.floor(Math.random() * EMOJIS_INV.length)] });
  enregistrer(); rendreAtelier();
  toast('🎲', `${MODELES[inv.modele]} · ${PALETTES[inv.palette].nom}`, 'Encore ? Touchez de nouveau « Me surprendre ».', 2600);
};
ACTIONS['inv-html'] = () => { const pour = V.invitPour || ''; telecharger(`invitation-${nomFichier(invitDe(V.ev).titre)}${pour ? '-' + nomFichier(pour) : ''}.html`, pageInvitation(V.ev, pour), 'text/html'); toast('✨', 'Invitation téléchargée', 'Envoyez ce fichier : il s’ouvre et s’anime dans n’importe quel navigateur.'); };
ACTIONS['inv-toutes'] = () => {
  const e = S.events[V.ev];
  e.invites.forEach((i, n) => setTimeout(() => telecharger(`invitation-${nomFichier(invitDe(V.ev).titre)}-${nomFichier(i.nom)}.html`, pageInvitation(V.ev, i.nom), 'text/html'), n * 350));
  toast('📦', pluriel(e.invites.length, 'invitation personnalisée', 'invitations personnalisées'), 'Une pour chaque invité, à son prénom.');
};
ACTIONS['inv-texte'] = async () => { try { await navigator.clipboard.writeText(texteInvit(V.ev, V.invitPour)); toast('📋', 'Texte copié', 'Collez-le dans un message.'); } catch (e) { toast('⚠️', 'Copie impossible'); } };
ACTIONS['inv-png'] = async () => { const c = await canvasInvitation(V.ev, V.invitPour); c.toBlob(b => telecharger(`invitation-${nomFichier(invitDe(V.ev).titre)}.png`, b), 'image/png'); };
ACTIONS['inv-partager'] = async () => {
  const k = V.ev, pour = V.invitPour;
  const f = new File([pageInvitation(k, pour)], `invitation-${nomFichier(invitDe(k).titre)}.html`, { type: 'text/html' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: invitDe(k).titre, text: texteInvit(k, pour) });
    else await navigator.share({ title: invitDe(k).titre, text: texteInvit(k, pour) });
  } catch (e) { /* partage annulé */ }
};
/* champs d'événement et d'invitation modifiés en direct */
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.inv && t.type !== 'radio' && t.type !== 'date') {
    invitDe(V.ev)[t.dataset.inv] = t.value; enregistrer();
    const s = $('#scene-invit'); if (s) s.innerHTML = invitHTML(V.ev, V.invitPour);
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.inv && (t.type === 'radio' || t.type === 'date')) {
    invitDe(V.ev)[t.dataset.inv] = t.value; enregistrer();
    if (t.dataset.inv === 'palette') return rendreAtelier();
    const s = $('#scene-invit'); if (s) s.innerHTML = invitHTML(V.ev, V.invitPour);
  }
  if (t.dataset.actChange === 'invit-pour-sel') { V.invitPour = t.value; rendre(); setTimeout(() => $('#atelier')?.scrollIntoView({ block: 'start' }), 30); }
  if (t.dataset.evChamp) {
    const ev = S.events[V.ev], c = t.dataset.evChamp;
    ev[c] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? nombre(t.value) : t.value;
    if (c === 'date' && V.ev === 'shower' && t.value && !S.jalons.shower) S.jalons.shower = { date: t.value, note: '' };
    sauver();
  }
});

/* ============================================================
   Cartes en image (invitation, faire-part) — dessinées sur un canevas
   ============================================================ */
function chargerImage(src) { return new Promise(r => { if (!src) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
function couper(ctx, texte, larg) {
  const out = [];
  for (const para of String(texte || '').split('\n')) {
    let l = '';
    for (const m of para.split(' ')) { const t = l ? l + ' ' + m : m; if (ctx.measureText(t).width > larg && l) { out.push(l); l = m; } else l = t; }
    out.push(l);
  }
  return out;
}
/* blocs : { t:'sur'|'titre'|'texte'|'emoji'|'photo'|'infos'|'pastille'|'espace', v, taille } */
/* le décor d'un modèle, dessiné sur le canevas (1200 × 1680) */
function decorCanvas(x, W, H, pal, m) {
  const c = pal.conf.filter(v => v !== '#FFFFFF');
  const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(a, b, w, h, r) : x.rect(a, b, w, h); };
  const arche = (a, b, w, h) => { const r = w / 2; x.beginPath(); x.moveTo(a, b + h - 40); x.lineTo(a, b + r); x.arc(a + r, b + r, r, Math.PI, 0); x.lineTo(a + w, b + h - 40); x.quadraticCurveTo(a + w, b + h, a + w - 40, b + h); x.lineTo(a + 40, b + h); x.quadraticCurveTo(a, b + h, a, b + h - 40); };
  x.save();
  if (m === 'arche') { x.strokeStyle = pal.acc; x.globalAlpha = .55; x.lineWidth = 5; arche(56, 56, W - 112, H - 112); x.stroke(); x.globalAlpha = .4; x.lineWidth = 2; x.setLineDash([12, 12]); arche(78, 78, W - 156, H - 156); x.stroke(); }
  else if (m === 'nuage') { x.fillStyle = '#fff'; [[-10, .85, 0], [H + 10, .85, 70], [70, .45, 70], [H - 70, .45, 0]].forEach(([y, a, d]) => { x.globalAlpha = a; for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(i * 140 + d, y, 75 + (i * 37) % 45, 0, 7); x.fill(); } }); }
  else if (m === 'pois') { x.fillStyle = pal.acc; x.globalAlpha = .3; for (let a = 36; a < W; a += 76) for (let b = 36; b < H; b += 76) { x.beginPath(); x.arc(a, b, 8, 0, 7); x.fill(); } x.globalAlpha = .9; x.fillStyle = pal.bg[0]; rr(70, 70, W - 140, H - 140, 70); x.fill(); }
  else if (m === 'lune') {
    x.strokeStyle = pal.acc; x.globalAlpha = .4; x.lineWidth = 4; rr(46, 46, W - 92, H - 92, 50); x.stroke();
    x.save(); x.beginPath(); x.rect(0, 0, W, H); x.arc(W - 150, 170, 150, 0, 7, true); x.clip('evenodd');
    x.globalAlpha = .28; x.fillStyle = pal.acc; x.beginPath(); x.arc(W - 240, 250, 170, 0, 7); x.fill(); x.restore();
  }
  else if (m === 'fleurs') {
    x.strokeStyle = pal.acc; x.globalAlpha = .4; x.lineWidth = 4; rr(46, 46, W - 92, H - 92, 50); x.stroke(); x.globalAlpha = 1;
    const branche = (tx, ty, rot) => {
      x.save(); x.translate(tx, ty); x.rotate(rot); x.scale(4.4, 4.4);
      x.strokeStyle = pal.acc; x.globalAlpha = .55; x.lineWidth = .5; x.beginPath(); x.moveTo(4, 98); x.bezierCurveTo(30, 72, 52, 46, 88, 12); x.stroke(); x.globalAlpha = 1;
      [[22, 78, -40], [34, 64, 25], [46, 54, -50], [58, 42, 18], [70, 32, -55]].forEach(([a, b, r], i) => { x.fillStyle = c[(i + 2) % c.length]; x.beginPath(); x.ellipse(a, b, 9, 3.8, r * Math.PI / 180, 0, 7); x.fill(); });
      [[88, 12, 0], [40, 60, 1], [64, 36, 0]].forEach(([a, b, k]) => { x.fillStyle = c[k % c.length]; for (let p = 0; p < 5; p++) { const an = p * 1.2566; x.beginPath(); x.arc(a + Math.cos(an) * 5, b + Math.sin(an) * 5, 4.2, 0, 7); x.fill(); } x.fillStyle = '#F3C969'; x.beginPath(); x.arc(a, b, 2.6, 0, 7); x.fill(); });
      x.restore();
    };
    branche(-10, H - 430, 0); branche(W + 10, 430, Math.PI);
  }
  else if (m === 'guirlande') {
    const y = t => (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 250 + t * t * 30;
    x.strokeStyle = pal.ink; x.globalAlpha = .35; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 30); x.quadraticCurveTo(W / 2, 250, W, 30); x.stroke(); x.globalAlpha = 1;
    for (let i = 0; i < 10; i++) { const a = i * 120 + 60, t0 = (a - 44) / W, t1 = (a + 44) / W; x.fillStyle = c[i % c.length]; x.beginPath(); x.moveTo(a - 44, y(t0)); x.lineTo(a + 44, y(t1)); x.lineTo(a, y(a / W) + 100); x.fill(); }
  }
  else if (m === 'minimal') { x.strokeStyle = pal.acc; x.globalAlpha = .5; x.lineWidth = 2; x.beginPath(); x.moveTo(W / 2 - 70, 120); x.lineTo(W / 2 + 70, 120); x.moveTo(W / 2 - 70, H - 170); x.lineTo(W / 2 + 70, H - 170); x.stroke(); }
  else if (m !== 'polaroid') { x.strokeStyle = pal.acc; x.globalAlpha = .45; x.lineWidth = 4; rr(46, 46, W - 92, H - 92, 50); x.stroke(); }
  x.restore();
}
async function dessinerCarte(pal, blocs, deco = 'etoiles', modele = 'classique') {
  const W = 1200, H = 1680, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W * .6, H); g.addColorStop(0, pal.bg[0]); g.addColorStop(1, pal.bg[1]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  /* décor discret */
  const r = graine(11);
  x.save();
  for (let i = 0; i < 46; i++) {
    const px = r() * W, py = r() * H, t = 6 + r() * 16; x.globalAlpha = .25 + r() * .35; x.fillStyle = pal.conf[i % pal.conf.length] === '#FFFFFF' ? pal.acc : pal.conf[i % pal.conf.length];
    if (deco === 'confettis') { x.beginPath(); x.arc(px, py, t / 2, 0, 7); x.fill(); }
    else { x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, rr = k % 2 ? t * .28 : t; x.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } x.fill(); }
  }
  x.restore();
  if (deco !== 'aucun') decorCanvas(x, W, H, pal, modele);
  const pola = modele === 'polaroid';

  const serif = (s, gras) => `italic ${gras ? '600 ' : ''}${s}px Georgia, "Times New Roman", serif`;
  const sans = (s, gras = 700) => `${gras} ${s}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  const imgs = await Promise.all(blocs.map(b => b.t === 'photo' ? chargerImage(b.v) : null));
  /* mesure */
  const mes = blocs.map((b, i) => {
    if (b.t === 'sur') return 60;
    if (b.t === 'titre') { x.font = serif(b.taille || 110, 1); return couper(x, b.v, W - 220).length * (b.taille || 110) * 1.1 + (modele === 'ruban' ? 80 : 20); }
    if (b.t === 'texte') { x.font = serif(b.taille || 44); return couper(x, b.v, W - 260).length * (b.taille || 44) * 1.4 + 10; }
    if (pola && (b.t === 'emoji' || (b.t === 'photo' && imgs[i]))) return 540;
    if (b.t === 'emoji') return (b.taille || 150) + 30;
    if (b.t === 'photo') return imgs[i] ? (b.taille || 440) + 40 : 0;
    if (b.t === 'infos') return 190;
    if (b.t === 'pastille') return 100;
    if (b.t === 'espace') return b.v || 30;
    return 0;
  });
  let y = Math.max(120, (H - mes.reduce((a, b) => a + b, 0)) / 2);
  x.textAlign = 'center'; x.textBaseline = 'top';
  blocs.forEach((b, i) => {
    const h = mes[i];
    x.fillStyle = pal.ink;
    if (b.t === 'sur') { x.font = sans(30, 800); x.fillStyle = pal.acc; x.letterSpacing = '8px'; x.fillText(String(b.v).toUpperCase(), W / 2, y + 10); x.letterSpacing = '0px'; }
    if (b.t === 'titre') {
      const t = b.taille || 110; x.font = serif(t, 1);
      const lignes = couper(x, b.v, W - 220);
      if (modele === 'ruban') {
        const lw = Math.min(W - 80, Math.max(...lignes.map(l => x.measureText(l).width)) + 200), hh = lignes.length * t * 1.1 + 40, x0 = W / 2 - lw / 2, e = 50;
        x.fillStyle = pal.acc; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + lw, y); x.lineTo(x0 + lw - e, y + hh / 2); x.lineTo(x0 + lw, y + hh); x.lineTo(x0, y + hh); x.lineTo(x0 + e, y + hh / 2); x.fill();
        x.fillStyle = '#fff'; lignes.forEach((l, k) => x.fillText(l, W / 2, y + 26 + k * t * 1.1));
      } else lignes.forEach((l, k) => x.fillText(l, W / 2, y + k * t * 1.1));
    }
    if (pola && (b.t === 'emoji' || (b.t === 'photo' && imgs[i]))) {
      x.save(); x.translate(W / 2, y + 260); x.rotate(-4 * Math.PI / 180);
      x.shadowColor = 'rgba(40,20,80,.35)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#fff'; x.fillRect(-210, -250, 420, 500); x.shadowColor = 'transparent';
      if (b.t === 'photo') { const im = imgs[i], s = Math.min(im.width, im.height); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, -190, -230, 380, 380); }
      else {
        const gg = x.createLinearGradient(0, -230, 0, 150); gg.addColorStop(0, pal.bg[0]); gg.addColorStop(1, pal.bg[1]); x.fillStyle = gg; x.fillRect(-190, -230, 380, 380);
        x.textBaseline = 'middle'; x.font = '190px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; x.fillStyle = pal.ink; x.fillText(b.v, 0, -40); x.textBaseline = 'top';
      }
      x.restore(); y += h; return;
    }
    if (b.t === 'texte') { x.font = serif(b.taille || 44); x.globalAlpha = .88; couper(x, b.v, W - 260).forEach((l, k) => x.fillText(l, W / 2, y + k * (b.taille || 44) * 1.4)); x.globalAlpha = 1; }
    if (b.t === 'emoji') { x.font = `${b.taille || 150}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; x.fillText(b.v, W / 2, y); }
    if (b.t === 'photo' && imgs[i]) {
      const d = b.taille || 440, im = imgs[i], s = Math.min(im.width, im.height);
      x.save(); x.shadowColor = 'rgba(40,20,80,.35)'; x.shadowBlur = 40; x.shadowOffsetY = 16;
      x.beginPath(); x.arc(W / 2, y + d / 2, d / 2 + 12, 0, 7); x.fillStyle = '#fff'; x.fill(); x.restore();
      x.save(); x.beginPath(); x.arc(W / 2, y + d / 2, d / 2, 0, 7); x.clip();
      x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, W / 2 - d / 2, y, d, d); x.restore();
    }
    if (b.t === 'infos') {
      const n = b.v.length, lw = Math.min(300, (W - 200) / n), x0 = W / 2 - lw * n / 2;
      b.v.forEach(([lab, val], k) => {
        const cx = x0 + lw * k + lw / 2;
        x.fillStyle = pal.acc; x.globalAlpha = .12; x.beginPath(); x.roundRect ? x.roundRect(cx - lw / 2 + 12, y, lw - 24, 160, 30) : x.rect(cx - lw / 2 + 12, y, lw - 24, 160); x.fill(); x.globalAlpha = 1;
        x.font = sans(24, 800); x.fillStyle = pal.acc; x.fillText(lab.toUpperCase(), cx, y + 30);
        x.font = serif(52, 1); x.fillStyle = pal.ink; x.fillText(val, cx, y + 76);
      });
    }
    if (b.t === 'pastille') {
      x.font = sans(32, 700); const w = x.measureText(b.v).width + 80;
      x.fillStyle = pal.acc; x.globalAlpha = .16; x.beginPath(); x.roundRect ? x.roundRect(W / 2 - w / 2, y + 10, w, 70, 35) : x.rect(W / 2 - w / 2, y + 10, w, 70); x.fill(); x.globalAlpha = 1;
      x.fillStyle = pal.ink; x.fillText(b.v, W / 2, y + 28);
    }
    y += h;
  });
  x.font = sans(22, 600); x.fillStyle = pal.ink; x.globalAlpha = .4; x.fillText('NaoBaby · NaoGroup', W / 2, H - 100); x.globalAlpha = 1;
  return c;
}
function canvasInvitation(k, pour = '') {
  const e = S.events[k], inv = invitDe(k), pal = PALETTES[inv.palette] || PALETTES.lavande;
  const quand = e.date ? cap(dateLongue(lire(e.date))) + (e.heure ? ' · ' + fmtH(e.heure) : '') : '';
  return dessinerCarte(pal, [
    pour ? { t: 'texte', v: `Pour ${pour} 💌`, taille: 40 } : null, { t: 'sur', v: inv.sur }, { t: 'titre', v: inv.titre },
    inv.photo ? { t: 'photo', v: inv.photo, taille: 360 } : inv.emoji ? { t: 'emoji', v: inv.emoji, taille: 140 } : null,
    { t: 'texte', v: inv.message, taille: 42 }, { t: 'espace', v: 20 },
    quand ? { t: 'texte', v: quand, taille: 44 } : null, e.lieu ? { t: 'texte', v: e.lieu, taille: 38 } : null,
    { t: 'texte', v: parents(), taille: 36 },
    inv.rsvp ? { t: 'pastille', v: rsvpTxt(inv) } : null,
  ].filter(Boolean), inv.anim === 'confettis' ? 'confettis' : 'etoiles', MODELES[inv.modele] ? inv.modele : 'classique');
}

/* ============================================================
   « Découvrir le sexe de bébé »
   ============================================================ */
const revelable = () => aProfil() && P().mode !== 'perte' && actifs().some(b => !b.revele && b.sexe !== 'surprise');
const NOMBRES = ['', 'Une', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six'];
function phraseSexe(l) {
  const f = l.filter(b => b.sexe === 'fille').length, g = l.filter(b => b.sexe === 'garcon').length;
  if (l.length === 1) return f ? "C'est une fille !" : "C'est un garçon !";
  const masc = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];
  if (f && g) return `${NOMBRES[f]} ${f > 1 ? 'filles' : 'fille'} et ${masc[g]} ${g > 1 ? 'garçons' : 'garçon'} !`;
  return f ? `${NOMBRES[f]} petites filles !` : `${cap(masc[g])} petits garçons !`;
}
function couleursRevel(l) {
  const st = P().styleRevel || 'tradition';
  const f = l.some(b => b.sexe === 'fille'), g = l.some(b => b.sexe === 'garcon');
  if (st === 'violet') return { ruban: 'linear-gradient(90deg,#8E7BD4,#C39BF3)', conf: ['#C9B7F5', '#B39BF0', '#FFFFFF', '#8E7BD4', '#F3C969'] };
  if (st === 'neutre') return { ruban: 'linear-gradient(90deg,#E9D7B5,#F3C969,#FFFFFF)', conf: ['#F3C969', '#E9D7B5', '#FFFFFF', '#C9B7F5'] };
  if (f && g) return { ruban: 'linear-gradient(90deg,#F2A7C9,#C9B7F5,#9DC6F4)', conf: ['#F4B6D2', '#A9C8F7', '#FFFFFF', '#C9B7F5'] };
  return f ? { ruban: 'linear-gradient(90deg,#F7C6DC,#F2A7C9,#E07FAE)', conf: ['#F4B6D2', '#F9D5E4', '#FFFFFF', '#E3B9EC', '#F3C969'] }
    : { ruban: 'linear-gradient(90deg,#CFE0FB,#9DC6F4,#6E9BE0)', conf: ['#A9C8F7', '#D3E2FB', '#FFFFFF', '#C9B7F5', '#F3C969'] };
}
ACTIONS.reveler = () => {
  const prets = actifs().filter(b => !b.revele && (b.sexe === 'fille' || b.sexe === 'garcon'));
  if (prets.length) return ceremonie(prets);
  saisirSexe();
};
function saisirSexe() {
  const a = actifs().filter(b => !b.revele && b.sexe !== 'surprise');
  formulaire({
    titre: '🎀 Le sexe de bébé',
    chapo: 'À saisir uniquement si l’information vous a été communiquée par un professionnel de santé, ou si vous choisissez de la saisir vous-mêmes. Un proche peut la saisir en secret pour vous.',
    valeurs: { source: 'pro', secret: true },
    champs: [
      { k: 'source', lab: 'Cette information vient', type: 'choix', options: [['pro', '🩺 D’un professionnel de santé'], ['nous', '✍️ Nous la saisissons nous-mêmes']], large: true },
      ...a.map((b, i) => ({ k: 'b-' + b.id, lab: a.length > 1 ? nomBebe(b, S.bebes.indexOf(b)) : 'Bébé est', type: 'choix', large: true,
        options: [['fille', '🎀 Une fille'], ['garcon', '💙 Un garçon'], ['surprise', '✨ On garde la surprise jusqu’à la naissance']] })),
      { k: 'secret', type: 'case', texte: '🔒 Garder le secret : on ouvrira l’enveloppe ensemble plus tard' },
    ],
    texteOk: 'Valider',
    enregistrer: v => {
      if (a.some(b => !v['b-' + b.id])) { toast('🎀', 'Choisissez une réponse pour chaque bébé'); return false; }
      a.forEach(b => { b.sexe = v['b-' + b.id]; b.source = v.source; });
      const prets = a.filter(b => b.sexe !== 'surprise');
      if (!prets.length) { toast('✨', 'Surprise gardée', 'Vous découvrirez tout le jour de la naissance.'); return; }
      if (v.secret) { toast('🔒', 'C’est gardé secret', 'Le bouton « Découvrir le sexe de bébé » vous attend quand vous serez prêts.'); return; }
      setTimeout(() => ceremonie(prets), 250);
    },
  });
}
function ceremonie(l) {
  const col = couleursRevel(l);
  const v = fenetre(`<div class="revelation" role="dialog" aria-modal="true">
    <div class="sur">Le moment tant attendu</div>
    <h2>${l.length > 1 ? 'Filles ou garçons ?' : 'Fille ou garçon ?'}</h2>
    <p id="rv-aide">Quand vous êtes prêts, touchez l’enveloppe.</p>
    <div class="enveloppe" id="rv-env" role="button" tabindex="0" aria-label="Ouvrir l’enveloppe">
      <svg viewBox="0 0 190 150">
        <g class="lettre"><rect x="30" y="56" width="130" height="80" rx="8" fill="#fff"/><path d="M95 70l4 9 10 1-7.5 6.8 2.2 9.7L95 91.4l-8.7 5.1 2.2-9.7L81 80l10-1z" fill="#C9B7F5"/></g>
        <rect x="10" y="50" width="170" height="95" rx="14" fill="#EFE7FD"/>
        <path d="M10 60l85 50 85-50v75a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z" fill="#E1D6FA"/>
        <path class="rabat" d="M10 60a10 10 0 0 1 10-10h150a10 10 0 0 1 10 10l-85 50z" fill="#CFC0F3"/>
        <circle cx="95" cy="92" r="11" fill="#B39BF0"/><path d="M95 86.5c-2.4-3-7-1.2-5.8 2 1 2.6 5.8 6 5.8 6s4.8-3.4 5.8-6c1.2-3.2-3.4-5-5.8-2z" fill="#fff"/>
      </svg>
    </div>
    <div id="rv-res" hidden></div>
    <div class="ruban" id="rv-ruban" style="background:${col.ruban}"></div>
    <div class="pied" style="justify-content:center"><button class="btn" data-act="plein-ecran">⛶ Plein écran pour la fête</button><button class="btn" data-act="fermer">Plus tard</button></div>
  </div>`, 'revel');
  const env = v.querySelector('#rv-env');
  const ouvrir = () => {
    if (env.classList.contains('ouverte')) return;
    env.classList.add('ouverte');
    setTimeout(() => {
      l.forEach(b => { b.revele = true; });
      if (!S.jalons.sexe) S.jalons.sexe = { date: cle(auj()), note: phraseSexe(l) };
      enregistrer(); majAccent();
      v.querySelector('#rv-aide').hidden = true;
      const res = v.querySelector('#rv-res');
      res.hidden = false;
      res.innerHTML = `<div class="resultat">${phraseSexe(l)}<small>${l.length > 1 ? l.map(b => `${nomBebe(b, S.bebes.indexOf(b))} : ${b.sexe === 'fille' ? '🎀 fille' : '💙 garçon'}`).join(' · ') : 'Bienvenue, petit cœur 💜'}</small></div>`;
      v.querySelector('#rv-ruban').classList.add('on');
      confettis(col.conf, 5200, 170);
      setTimeout(() => confettis(col.conf, 4200, 90), 1300);
      v.querySelector('.pied').innerHTML = '<button class="btn plein" data-act="fermer">💜 Refermer</button>';
      v._surFermer = () => rendre();
    }, 1100);
  };
  env.addEventListener('click', ouvrir);
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(); } });
}
ACTIONS['plein-ecran'] = () => { const v = document.querySelector('.voile.revel'); try { v.requestFullscreen(); } catch (e) {} };
