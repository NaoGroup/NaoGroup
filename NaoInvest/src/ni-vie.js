/* ============================================================
   NaoInvest — la vie pratique : ce qu'on n'apprend pas à l'école.
   Les câbles (avec leurs dessins), la température et la fièvre,
   les symboles d'entretien du linge, les voyants de la voiture.
   Chaque fiche se termine par un petit jeu « Teste-toi ».
   ============================================================ */

/* ---------- un petit jeu « Teste-toi », commun à toutes les fiches ---------- */
const DEVINE = {};          /* id du jeu → { items, i, bons, faits, rep, ordre } */
function devinette(id, titre, items) {
  let d = DEVINE[id];
  if (!d) {
    const ordre = items.map((_, k) => k).sort(() => Math.random() - .5);
    d = DEVINE[id] = { items, ordre, i: 0, bons: 0, faits: 0, rep: null };
  }
  const it = d.items[d.ordre[d.i % d.items.length]];
  const choix = d.choix && d.choixPour === d.i ? d.choix : (d.choix = melangeChoix(it, d.items), d.choixPour = d.i, d.choix);
  return `<section class="devine" id="devine-${id}"><div class="devine-tete"><h3>🎯 ${esc(titre)}</h3><span class="badge">${d.bons}/${d.faits} bonnes réponses</span></div>
    <div class="devine-corps"><div class="devine-image">${it.dessin}</div>
      <div class="devine-choix">${choix.map(c => {
        const etat = d.rep == null ? '' : c === it.nom ? 'bonne' : c === d.rep ? 'mauvaise' : '';
        return `<button type="button" class="${etat}" data-devine="${id}" data-c="${esc(c)}" ${d.rep != null ? 'disabled' : ''}>${esc(c)}</button>`; }).join('')}
        ${d.rep != null ? `<p class="devine-explic">${d.rep === it.nom ? '✓ Bravo !' : `✗ C’était « ${esc(it.nom)} ».`} ${esc(it.explic || '')}</p><button type="button" class="btn petit" data-devine-suite="${id}">Suivant →</button>` : ''}
      </div></div></section>`;
}
function melangeChoix(it, items) {
  const autres = items.filter(x => x.nom !== it.nom).map(x => x.nom).sort(() => Math.random() - .5).slice(0, 3);
  return autres.concat(it.nom).sort(() => Math.random() - .5);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-devine],[data-devine-suite]'); if (!b) return;
  const id = b.dataset.devine || b.dataset.devineSuite, d = DEVINE[id]; if (!d) return;
  if (b.dataset.devine) { d.rep = b.dataset.c; d.faits++; if (d.rep === d.items[d.ordre[d.i % d.items.length]].nom) d.bons++; }
  else { d.i++; d.rep = null; }
  const y = scrollY; rendre(); scrollTo(0, y);
});

/* ============================================================
   🔌 Les câbles et prises
   ============================================================ */
const M = '#C9CDD6', MF = '#8D93A3', P = '#2B2E3A', OR = '#E3B04B';   /* métal, métal foncé, plastique, contacts dorés */
const svgC = c => `<svg viewBox="0 0 120 80" aria-hidden="true">${c}</svg>`;
const CABLES = [
  { id: 'usb-c', nom: 'USB-C', fam: 'Charger & transférer', dessin: svgC(`<rect x="32" y="29" width="56" height="22" rx="11" fill="${M}" stroke="${MF}" stroke-width="2"/><rect x="40" y="35" width="40" height="10" rx="5" fill="${P}"/><rect x="46" y="38.5" width="28" height="3" rx="1.5" fill="${OR}"/>`),
    usage: 'Le connecteur universel récent : téléphones, ordinateurs, tablettes, écouteurs, consoles… Il se branche dans les deux sens.',
    astuce: 'Tous les câbles USB-C ne se valent pas : certains ne font que charger lentement, d’autres transfèrent la vidéo ou chargent vite un ordinateur. Thunderbolt utilise la même forme (repérez le petit éclair).' },
  { id: 'usb-a', nom: 'USB-A', fam: 'Charger & transférer', dessin: svgC(`<rect x="25" y="26" width="70" height="28" rx="2" fill="${M}" stroke="${MF}" stroke-width="2"/><rect x="31" y="31" width="58" height="9" fill="${P}"/><g fill="${OR}"><rect x="37" y="37" width="8" height="3"/><rect x="50" y="37" width="8" height="3"/><rect x="63" y="37" width="8" height="3"/><rect x="76" y="37" width="7" height="3"/></g><rect x="40" y="45" width="9" height="5" fill="${MF}"/><rect x="71" y="45" width="9" height="5" fill="${MF}"/>`),
    usage: 'Le grand rectangle « classique » : chargeurs, clés USB, souris, ports d’ordinateur.',
    astuce: 'Il ne se branche que dans un sens : si ça ne rentre pas, retournez-le plutôt que de forcer. Un intérieur bleu indique souvent l’USB 3 (plus rapide).' },
  { id: 'micro-usb', nom: 'Micro-USB', fam: 'Charger & transférer', dessin: svgC(`<path d="M34 31H86L80 49H40Z" fill="${M}" stroke="${MF}" stroke-width="2" stroke-linejoin="round"/><path d="M42 36H78L75 43H45Z" fill="${P}"/><rect x="48" y="38" width="24" height="2.5" fill="${OR}"/>`),
    usage: 'L’ancien connecteur des téléphones Android, enceintes, liseuses, manettes et petits appareils.',
    astuce: 'Forme en trapèze : un seul sens. Il est peu à peu remplacé par l’USB-C.' },
  { id: 'lightning', nom: 'Lightning (Apple)', fam: 'Charger & transférer', dessin: svgC(`<rect x="22" y="31" width="34" height="18" rx="3" fill="#E9EAEE" stroke="${MF}" stroke-width="2"/><rect x="56" y="33" width="42" height="14" rx="7" fill="${M}" stroke="${MF}" stroke-width="1.5"/><g fill="${OR}"><rect x="62" y="37" width="3" height="6" rx="1"/><rect x="68" y="37" width="3" height="6" rx="1"/><rect x="74" y="37" width="3" height="6" rx="1"/><rect x="80" y="37" width="3" height="6" rx="1"/><rect x="86" y="37" width="3" height="6" rx="1"/></g>`),
    usage: 'Le connecteur des iPhone jusqu’à l’iPhone 14, et de certains iPad et AirPods.',
    astuce: 'Depuis l’iPhone 15, Apple est passé à l’USB-C : un câble Lightning ne sert donc plus aux modèles récents.' },
  { id: 'usb-b', nom: 'USB-B (imprimante)', fam: 'Charger & transférer', dessin: svgC(`<path d="M44 24H70L78 32V56H42V24Z" fill="${M}" stroke="${MF}" stroke-width="2" stroke-linejoin="round"/><path d="M50 32H66L70 36V48H50Z" fill="${P}"/><rect x="54" y="38" width="12" height="2.5" fill="${OR}"/><rect x="54" y="43" width="12" height="2.5" fill="${OR}"/>`),
    usage: 'Le carré aux coins coupés : imprimantes, scanners, certains instruments de musique.',
    astuce: 'On l’utilise avec un câble USB-B vers USB-A (ou USB-C) pour relier l’imprimante à l’ordinateur.' },
  { id: 'hdmi', nom: 'HDMI', fam: 'Image & son', dessin: svgC(`<path d="M22 28H98V42L90 52H30L22 42Z" fill="${M}" stroke="${MF}" stroke-width="2" stroke-linejoin="round"/><path d="M30 33H90V40L85 46H35L30 40Z" fill="${P}"/><rect x="38" y="37" width="44" height="3" fill="${OR}"/>`),
    usage: 'Le câble de l’image et du son ensemble : télé, box, console, ordinateur, vidéoprojecteur.',
    astuce: 'Il existe aussi en mini-HDMI et micro-HDMI (appareils photo, petits ordinateurs). Pour de la 4K à 120 images/s, il faut un câble « HDMI 2.1 / Ultra High Speed ».' },
  { id: 'displayport', nom: 'DisplayPort', fam: 'Image & son', dessin: svgC(`<path d="M24 28H96V52H32L24 44Z" fill="${M}" stroke="${MF}" stroke-width="2" stroke-linejoin="round"/><path d="M31 33H89V47H36L31 42Z" fill="${P}"/><rect x="40" y="38" width="42" height="3" fill="${OR}"/>`),
    usage: 'Surtout sur les ordinateurs et écrans de bureau ou de jeu.',
    astuce: 'Reconnaissable à son seul coin coupé. Souvent préféré au HDMI pour les écrans d’ordinateur à haute fréquence.' },
  { id: 'vga', nom: 'VGA', fam: 'Image & son', dessin: svgC(`<circle cx="16" cy="40" r="6" fill="${M}" stroke="${MF}" stroke-width="2"/><circle cx="104" cy="40" r="6" fill="${M}" stroke="${MF}" stroke-width="2"/><path d="M26 27H94L88 53H32Z" fill="#3E63B8" stroke="#2C4A8C" stroke-width="2" stroke-linejoin="round"/>${[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(k => `<circle cx="${42 + k * 9 + (r === 1 ? 0 : r === 2 ? 3 : -2)}" cy="${33 + r * 7}" r="2" fill="#DDE3F2"/>`).join('')).join('')}`),
    usage: 'L’ancien câble vidéo (analogique) des écrans et vidéoprojecteurs, souvent bleu, avec deux vis.',
    astuce: 'Il ne transporte pas le son. On le trouve encore sur des vidéoprojecteurs de salles de réunion.' },
  { id: 'jack', nom: 'Jack 3,5 mm', fam: 'Image & son', dessin: svgC(`<rect x="18" y="32" width="38" height="16" rx="4" fill="${P}"/><rect x="56" y="35.5" width="44" height="9" rx="2" fill="${M}" stroke="${MF}" stroke-width="1.5"/><path d="M100 35.5L108 40L100 44.5Z" fill="${M}" stroke="${MF}" stroke-width="1.5" stroke-linejoin="round"/><g stroke="${P}" stroke-width="2"><path d="M74 35.5V44.5"/><path d="M86 35.5V44.5"/></g>`),
    usage: 'La prise des écouteurs et casques filaires, des enceintes et autoradios.',
    astuce: 'Le nombre d’anneaux noirs compte : 2 anneaux = son et micro (casque de téléphone), 1 anneau = son stéréo seulement.' },
  { id: 'rca', nom: 'RCA (cinch)', fam: 'Image & son', dessin: svgC(`${[['#D9443B', 30], ['#F2F2F2', 60], ['#F2C230', 90]].map(([c, x]) => `<circle cx="${x}" cy="40" r="13" fill="${c}" stroke="${MF}" stroke-width="2"/><circle cx="${x}" cy="40" r="7" fill="${M}"/><circle cx="${x}" cy="40" r="2.5" fill="${P}"/>`).join('')}`),
    usage: 'Les fiches rondes de couleur : rouge et blanc pour le son (droite et gauche), jaune pour l’image.',
    astuce: 'On les trouve sur les vieilles télés, chaînes hi-fi et platines vinyle. On branche chaque couleur dans la prise de la même couleur.' },
  { id: 'optique', nom: 'Optique (Toslink)', fam: 'Image & son', dessin: svgC(`<path d="M40 24H80V48L72 56H48L40 48Z" fill="${P}" stroke="#111" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="40" r="5" fill="#E8483B"/><circle cx="60" cy="40" r="9" fill="none" stroke="#E8483B" stroke-opacity=".35" stroke-width="3"/>`),
    usage: 'Le son numérique en lumière, entre la télé et une barre de son ou un ampli.',
    astuce: 'Une petite lumière rouge sort du câble. Il est fragile : ne pas le plier à angle droit. Retirer le capuchon de protection avant de le brancher.' },
  { id: 'rj45', nom: 'Ethernet (RJ45)', fam: 'Internet & antenne', dessin: svgC(`<path d="M30 30H86V56H30Z" fill="#E8EEF6" fill-opacity=".9" stroke="${MF}" stroke-width="2"/><path d="M44 30V20H72V30" fill="none" stroke="${MF}" stroke-width="2.5" stroke-linejoin="round"/><g fill="${OR}">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<rect x="${36 + k * 6}" y="44" width="3" height="9"/>`).join('')}</g>`),
    usage: 'Le câble internet filaire : box, ordinateur, console, télé connectée.',
    astuce: 'Plus stable et souvent plus rapide que le wifi. Il se clipse : appuyer sur le petit ergot pour le retirer. À ne pas confondre avec le RJ11, plus petit (téléphone fixe).' },
  { id: 'coax', nom: 'Câble d’antenne (coaxial)', fam: 'Internet & antenne', dessin: svgC(`<circle cx="60" cy="40" r="22" fill="${M}" stroke="${MF}" stroke-width="2"/><circle cx="60" cy="40" r="15" fill="#F4F4F4" stroke="${MF}" stroke-width="1.5"/><circle cx="60" cy="40" r="3.2" fill="${OR}"/>`),
    usage: 'Relie la prise murale d’antenne (TNT) à la télévision ou à la box.',
    astuce: 'Prise mâle d’un côté, femelle de l’autre : la télé et le mur n’ont pas le même sens.' },
  { id: 'peritel', nom: 'Péritel (SCART)', fam: 'Image & son', dessin: svgC(`<path d="M16 26H104V48L96 56H16Z" fill="${P}" stroke="#111" stroke-width="2" stroke-linejoin="round"/>${[0, 1].map(r => Array.from({ length: 10 }, (_, k) => `<rect x="${24 + k * 7.5 + r * 3.5}" y="${34 + r * 8}" width="3.5" height="4" fill="${M}"/>`).join('')).join('')}`),
    usage: 'Le grand connecteur des anciens magnétoscopes, lecteurs DVD et décodeurs.',
    astuce: 'Il transporte image et son, mais il a disparu des appareils récents au profit du HDMI.' },
  { id: 'c13', nom: 'Alimentation C13 (ordinateur)', fam: 'Électricité', dessin: svgC(`<path d="M30 24H90V46L80 56H40L30 46Z" fill="${P}" stroke="#111" stroke-width="2" stroke-linejoin="round"/>${[42, 60, 78].map((x, k) => `<rect x="${x - 3}" y="${k === 1 ? 30 : 38}" width="6" height="11" rx="1" fill="#0E0F14" stroke="${MF}" stroke-width="1"/>`).join('')}`),
    usage: 'Le câble d’alimentation des ordinateurs fixes, écrans, imprimantes et box.',
    astuce: 'Trois trous : phase, neutre et terre. Il est standard : on peut en réutiliser un d’un appareil à l’autre.' },
  { id: 'c7', nom: 'Alimentation « en 8 » (C7)', fam: 'Électricité', dessin: svgC(`<path d="M46 24A16 16 0 0 0 46 56H74A16 16 0 0 0 74 24Z" fill="${P}" stroke="#111" stroke-width="2"/><circle cx="48" cy="40" r="5" fill="#0E0F14" stroke="${MF}" stroke-width="1"/><circle cx="72" cy="40" r="5" fill="#0E0F14" stroke="${MF}" stroke-width="1"/>`),
    usage: 'Le petit câble en forme de 8 : consoles, radios, certains chargeurs d’ordinateur et télés.',
    astuce: 'Deux trous, sans terre : à réserver aux appareils prévus pour.' },
  { id: 'prise-e', nom: 'Prise électrique française (type E)', fam: 'Électricité', dessin: svgC(`<circle cx="60" cy="40" r="26" fill="#F3F3F3" stroke="${MF}" stroke-width="2"/><circle cx="60" cy="40" r="19" fill="#E2E3E8"/><circle cx="50" cy="42" r="3.5" fill="${P}"/><circle cx="70" cy="42" r="3.5" fill="${P}"/><rect x="58" y="22" width="4" height="9" rx="2" fill="${M}" stroke="${MF}" stroke-width="1"/>`),
    usage: 'La prise murale française : deux trous et une broche de terre en haut.',
    astuce: 'La broche de terre protège des chocs électriques : ne jamais la contourner. À l’étranger, les prises changent : prévoir un adaptateur.' }
];

/* ============================================================
   🌡️ La température et la fièvre
   ============================================================ */
const ZONES_TEMP = [
  { max: 35, nom: 'Hypothermie', c: '#5AA9F2', e: '🥶', txt: 'Température trop basse. Réchauffer la personne et appeler le 15 (ou le 112), surtout s’il s’agit d’un bébé ou d’une personne âgée.' },
  { max: 36.5, nom: 'Un peu basse', c: '#7DBDF0', e: '🙂', txt: 'Souvent sans gravité (prise de mesure, matin, mesure sous le bras). À recontrôler. Si la personne va mal, demander un avis médical.' },
  { max: 37.6, nom: 'Normale', c: '#57C79B', e: '😊', txt: 'Température normale. Elle varie un peu dans la journée (plus basse le matin, plus haute le soir) et après un effort.' },
  { max: 38, nom: 'Légère élévation', c: '#E9C14E', e: '😐', txt: 'Ce n’est pas encore de la fièvre. Surveiller, boire, ne pas trop se couvrir, reprendre la température plus tard.' },
  { max: 39, nom: 'Fièvre modérée', c: '#F0973F', e: '🤒', txt: 'C’est de la fièvre : le corps se défend, souvent contre une infection. Repos, boire régulièrement, se découvrir. Surveiller l’évolution et l’état général.' },
  { max: 40, nom: 'Forte fièvre', c: '#E8663E', e: '🥵', txt: 'Forte fièvre. Bien boire, se découvrir, surveiller de près l’état général. Demander un avis médical (médecin, pharmacien), surtout si elle ne baisse pas ou si l’état se dégrade.' },
  { max: 99, nom: 'Très forte fièvre', c: '#D83B4F', e: '🚨', txt: 'Très forte fièvre : demander rapidement un avis médical. En cas de signe inquiétant (voir ci-dessous), appeler le 15.' }
];
const AGES_TEMP = [
  { id: 'bebe', nom: 'Bébé de moins de 3 mois', alerte: t => t >= 38 ? 'Chez un bébé de moins de 3 mois, une fièvre de 38 °C ou plus doit faire consulter un médecin <b>en urgence</b>, même s’il semble aller bien (appeler le 15 si besoin).' : '' },
  { id: 'enfant', nom: 'Enfant', alerte: t => t >= 38 ? 'Chez l’enfant, consulter si la fièvre dure plus de 48 heures, s’il est très abattu, s’il boit peu, ou en cas de signe inquiétant. Pas d’aspirine pour un enfant sans avis médical.' : '' },
  { id: 'adulte', nom: 'Adulte', alerte: t => t >= 38 ? 'Chez l’adulte, consulter si la fièvre dure plus de 3 jours, si elle est très élevée, ou en cas de signe inquiétant.' : '' },
  { id: 'age', nom: 'Personne âgée ou fragile', alerte: t => t >= 38 ? 'Chez une personne âgée, enceinte ou fragile (maladie chronique, traitement qui affaiblit l’immunité), demander un avis médical rapidement.' : '' }
];
const MESURES = [
  { nom: 'Rectale (dans les fesses)', e: '🍼', d: 'La plus fiable, la référence chez le nourrisson. Thermomètre électronique, embout protégé.' },
  { nom: 'Buccale (sous la langue)', e: '👄', d: 'Fiable chez l’adulte et le grand enfant, bouche fermée, sans avoir bu chaud ou froid juste avant.' },
  { nom: 'Auriculaire (dans l’oreille)', e: '👂', d: 'Rapide, mais dépend de la bonne position ; à éviter chez le tout-petit.' },
  { nom: 'Frontale (sans contact)', e: '🔫', d: 'Pratique et rapide, mais moins précise : en cas de doute, recontrôler autrement.' },
  { nom: 'Axillaire (sous le bras)', e: '💪', d: 'La moins précise : elle sous-estime souvent la température d’environ un demi-degré.' }
];

/* ============================================================
   🧺 Les symboles d'entretien du linge
   ============================================================ */
const s60 = c => `<svg viewBox="0 0 60 60" aria-hidden="true" class="sym-l"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${c}</g></svg>`;
const BARRE = '<path d="M8 8L52 52M52 8L8 52"/>';
const souligne = n => (n >= 1 ? '<path d="M12 53H48"/>' : '') + (n >= 2 ? '<path d="M12 58H48"/>' : '');
const bac = (inside, traits = 0, barre) => s60(`<path d="M8 20L13 46H47L52 20"/><path d="M8 20Q13 15 18 20T28 20T38 20T48 20"/>${inside}${souligne(traits)}${barre ? BARRE : ''}`);
const txt = t => `<text x="30" y="40" text-anchor="middle" font-size="${t.length > 2 ? 11 : 14}" font-weight="700" fill="currentColor" stroke="none" font-family="Segoe UI,Arial,sans-serif">${t}</text>`;
const main = '<path d="M24 41V31M28 41V28M32 41V29M36 41V33M22 37C22 41 24 43 29 43C35 43 38 41 38 35"/>';
const tri = (in_, barre) => s60(`<path d="M30 9L54 49H6Z"/>${in_ || ''}${barre ? BARRE : ''}`);
const carre = c => s60(`<rect x="9" y="9" width="42" height="42" rx="3"/>${c}`);
const points = (n, cy = 30) => [[30], [25, 35], [22, 30, 38]][n - 1].map(x => `<circle cx="${x}" cy="${cy}" r="2.2" fill="currentColor" stroke="none"/>`).join('');
const fer = (n, barre) => s60(`<path d="M8 44H52C52 30 46 22 34 22H20C18 22 16 24 15 26"/><path d="M8 44L15 26"/>${n ? points(n, 36) : ''}${barre ? BARRE : ''}`);
const rond = (l, traits = 0, barre) => s60(`<circle cx="30" cy="28" r="18"/>${l ? `<text x="30" y="34" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor" stroke="none" font-family="Segoe UI,Arial,sans-serif">${l}</text>` : ''}${traits ? '<path d="M14 53H46"/>' : ''}${barre ? BARRE : ''}`);
const LINGE = [
  { fam: 'Le lavage (le baquet)', items: [
    { nom: 'Lavage à 30 °C maximum', dessin: bac(txt('30')), explic: 'Le chiffre est la température maximale de lavage.' },
    { nom: 'Lavage à 40 °C maximum', dessin: bac(txt('40')), explic: 'La température la plus courante pour le linge de tous les jours.' },
    { nom: 'Lavage à 60 °C maximum', dessin: bac(txt('60')), explic: 'Linge de maison, serviettes, draps : supporte un lavage chaud.' },
    { nom: 'Lavage à 95 °C (blanc, coton)', dessin: bac(txt('95')), explic: 'Pour le coton blanc très résistant.' },
    { nom: 'Programme délicat', dessin: bac(txt('30'), 1), explic: 'Un trait sous le baquet = programme doux (synthétiques), essorage réduit.' },
    { nom: 'Programme très délicat', dessin: bac(txt('30'), 2), explic: 'Deux traits = programme très doux (laine, soie), essorage minimal.' },
    { nom: 'Lavage à la main uniquement', dessin: bac(main), explic: 'Eau tiède (40 °C maximum), sans frotter ni tordre.' },
    { nom: 'Ne pas laver', dessin: bac('', 0, true), explic: 'À confier au pressing, ou à nettoyer autrement.' }] },
  { fam: 'Le blanchiment (le triangle)', items: [
    { nom: 'Tout agent de blanchiment autorisé', dessin: tri(), explic: 'Eau de Javel (chlore) ou blanchissant à l’oxygène possibles.' },
    { nom: 'Blanchiment sans chlore uniquement', dessin: tri('<path d="M24 44L34 24M31 44L41 24"/>'), explic: 'Deux traits : seulement un détachant à l’oxygène, pas d’eau de Javel.' },
    { nom: 'Ne pas blanchir', dessin: tri('', true), explic: 'Aucun agent de blanchiment, ni Javel ni oxygène.' }] },
  { fam: 'Le séchage (le carré)', items: [
    { nom: 'Sèche-linge à basse température', dessin: carre(`<circle cx="30" cy="30" r="15"/>${points(1)}`), explic: 'Un point : programme doux, chaleur réduite.' },
    { nom: 'Sèche-linge à température normale', dessin: carre(`<circle cx="30" cy="30" r="15"/>${points(2)}`), explic: 'Deux points : programme normal.' },
    { nom: 'Pas de sèche-linge', dessin: carre(`<circle cx="30" cy="30" r="15"/>${BARRE}`), explic: 'Le tambour abîmerait ou rétrécirait le vêtement.' },
    { nom: 'Séchage sur un fil, suspendu', dessin: carre('<path d="M30 15V45"/>'), explic: 'Un trait vertical : étendre sur un fil ou un cintre.' },
    { nom: 'Séchage à plat', dessin: carre('<path d="M16 30H44"/>'), explic: 'Un trait horizontal : à plat, pour ne pas déformer (pulls en laine).' },
    { nom: 'Séchage à l’ombre', dessin: carre('<path d="M9 21L21 9M9 29L29 9"/><path d="M30 18V45"/>'), explic: 'Traits dans le coin : à l’abri du soleil, pour garder les couleurs.' }] },
  { fam: 'Le repassage (le fer)', items: [
    { nom: 'Repassage doux (110 °C)', dessin: fer(1), explic: 'Un point : synthétiques fragiles, souvent sans vapeur.' },
    { nom: 'Repassage moyen (150 °C)', dessin: fer(2), explic: 'Deux points : laine, soie, polyester.' },
    { nom: 'Repassage chaud (200 °C)', dessin: fer(3), explic: 'Trois points : coton, lin.' },
    { nom: 'Ne pas repasser', dessin: fer(0, true), explic: 'Le fer abîmerait le tissu ou l’impression.' }] },
  { fam: 'Le nettoyage professionnel (le cercle)', items: [
    { nom: 'Nettoyage à sec, tous solvants usuels (P)', dessin: rond('P'), explic: 'Lettre P : le pressing peut utiliser les solvants courants.' },
    { nom: 'Nettoyage à sec doux (F)', dessin: rond('F'), explic: 'Lettre F : solvants doux uniquement.' },
    { nom: 'Nettoyage professionnel à l’eau (W)', dessin: rond('W'), explic: 'Lettre W : nettoyage à l’eau par un professionnel.' },
    { nom: 'Pas de nettoyage à sec', dessin: rond('', 0, true), explic: 'Le pressing ne doit pas utiliser de solvants.' }] }
];

/* ============================================================
   🚗 Les voyants de la voiture
   ============================================================ */
const s48 = c => `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${c}</g></svg>`;
const VOYANTS = [
  { id: 'huile', nom: 'Pression d’huile', c: 'rouge', dessin: s48('<path d="M6 22H14L18 18H30L38 26L44 22"/><path d="M14 22V32H34L38 26"/><path d="M18 18V14H24"/><path d="M44 28C44 30 43 32 42 32C41 32 40 30 40 28C40 26 42 24 42 24C42 24 44 26 44 28Z"/>'),
    sens: 'La pression d’huile moteur est trop basse.', faire: 'S’arrêter dès que possible en sécurité et couper le moteur. Vérifier le niveau d’huile moteur froid. Ne pas repartir si le voyant reste allumé : risque de casser le moteur.' },
  { id: 'temp', nom: 'Température du moteur', c: 'rouge', dessin: s48('<path d="M24 8V28"/><circle cx="24" cy="32" r="4"/><path d="M24 14H30M24 19H30M24 24H30"/><path d="M8 40Q12 37 16 40T24 40T32 40T40 40"/>'),
    sens: 'Le moteur surchauffe (liquide de refroidissement).', faire: 'S’arrêter en sécurité, couper le moteur, laisser refroidir. Ne jamais ouvrir le bouchon du radiateur à chaud : risque de brûlure. Contrôler le niveau une fois refroidi.' },
  { id: 'batterie', nom: 'Charge de la batterie', c: 'rouge', dessin: s48('<rect x="6" y="15" width="36" height="24" rx="2"/><path d="M12 15V11H18V15M30 15V11H36V15"/><path d="M12 27H18M15 24V30M30 27H36"/>'),
    sens: 'La batterie ne se recharge plus (alternateur, courroie…).', faire: 'La voiture roule sur la batterie, qui va se vider : couper ce qui consomme (chauffage, radio) et aller au garage le plus proche sans tarder.' },
  { id: 'frein', nom: 'Freins', c: 'rouge', dessin: s48('<circle cx="24" cy="24" r="11"/><path d="M24 18V25"/><circle cx="24" cy="29.5" r="1.2" fill="currentColor"/><path d="M9 14A16 16 0 0 0 9 34M39 14A16 16 0 0 1 39 34"/>'),
    sens: 'Frein à main serré… ou niveau de liquide de frein bas / défaut du freinage.', faire: 'Vérifier d’abord le frein à main. S’il est desserré et que le voyant reste allumé : s’arrêter prudemment et faire contrôler, ne pas continuer à rouler.' },
  { id: 'airbag', nom: 'Airbag', c: 'rouge', dessin: s48('<circle cx="18" cy="11" r="3.5"/><path d="M15 17L13 30H22L28 40"/><path d="M14 23L22 25"/><circle cx="33" cy="22" r="8"/><path d="M8 40H20"/>'),
    sens: 'Défaut du système d’airbags.', faire: 'Les airbags pourraient ne pas se déclencher en cas de choc : faire contrôler rapidement par un garage.' },
  { id: 'ceinture', nom: 'Ceinture non bouclée', c: 'rouge', dessin: s48('<circle cx="24" cy="10" r="4"/><path d="M18 40V20H30V40"/><path d="M16 18L32 34"/><path d="M14 40H34"/>'),
    sens: 'Une ceinture n’est pas attachée.', faire: 'Attacher la ceinture (obligatoire pour tous les passagers).' },
  { id: 'moteur', nom: 'Moteur / antipollution', c: 'orange', dessin: s48('<path d="M10 18H16V14H28V18H34L38 22H42V32H38L34 36H16L12 32H8V22H10Z"/><path d="M20 14V10H26"/>'),
    sens: 'Défaut du moteur ou du système antipollution.', faire: 'Allumé fixe : faire contrôler rapidement. Clignotant : ralentir, éviter les accélérations et aller au garage sans attendre (risque d’abîmer le catalyseur).' },
  { id: 'abs', nom: 'ABS', c: 'orange', dessin: s48('<circle cx="24" cy="24" r="12"/><text x="24" y="28" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor" stroke="none" font-family="Arial,sans-serif">ABS</text><path d="M8 14A18 18 0 0 0 8 34M40 14A18 18 0 0 1 40 34"/>'),
    sens: 'L’antiblocage des roues est en défaut.', faire: 'Les freins fonctionnent, mais les roues peuvent se bloquer en freinage d’urgence : garder plus de distance et faire contrôler.' },
  { id: 'pneus', nom: 'Pression des pneus', c: 'orange', dessin: s48('<path d="M12 12C8 18 8 30 12 36H36C40 30 40 18 36 12"/><path d="M10 40H38" stroke-dasharray="3 3"/><path d="M24 17V26"/><circle cx="24" cy="31" r="1.3" fill="currentColor"/>'),
    sens: 'Un pneu est sous-gonflé (ou crevé).', faire: 'Vérifier les pneus et regonfler à la pression indiquée (souvent sur la portière ou la trappe à carburant), à froid.' },
  { id: 'esp', nom: 'Contrôle de stabilité (ESP)', c: 'orange', dessin: s48('<path d="M12 20L16 12H32L36 20V28H12Z"/><circle cx="17" cy="28" r="2"/><circle cx="31" cy="28" r="2"/><path d="M10 38Q14 34 18 38T26 38M24 44Q28 40 32 44T40 44"/>'),
    sens: 'Clignotant : l’ESP agit (la route glisse). Fixe : système désactivé ou en défaut.', faire: 'S’il clignote, lever le pied et adapter sa conduite. S’il reste allumé sans raison, faire contrôler.' },
  { id: 'prechauffage', nom: 'Préchauffage (diesel)', c: 'orange', dessin: s48('<path d="M8 24C8 16 16 16 16 24S24 32 24 24S32 16 32 24S40 32 40 24"/>'),
    sens: 'Le moteur diesel préchauffe.', faire: 'Attendre qu’il s’éteigne avant de démarrer. S’il clignote en roulant, faire contrôler le moteur.' },
  { id: 'plaquettes', nom: 'Usure des plaquettes de frein', c: 'orange', dessin: s48('<circle cx="24" cy="24" r="9"/><path d="M10 14A16 16 0 0 0 10 34M38 14A16 16 0 0 1 38 34"/><path d="M5 18V30M43 18V30" stroke-dasharray="2 3"/>'),
    sens: 'Les plaquettes de frein arrivent en fin de vie.', faire: 'Prendre rendez-vous au garage pour les remplacer prochainement.' },
  { id: 'carburant', nom: 'Réserve de carburant', c: 'orange', dessin: s48('<rect x="10" y="10" width="18" height="30" rx="2"/><path d="M13 16H25V22H13Z"/><path d="M28 18H33L36 22V34C36 36 40 36 40 34V16L36 12"/><path d="M7 40H31"/>'),
    sens: 'Le réservoir est presque vide.', faire: 'Faire le plein rapidement : la réserve ne permet souvent que quelques dizaines de kilomètres, selon le véhicule.' },
  { id: 'direction', nom: 'Direction assistée', c: 'orange', dessin: s48('<circle cx="24" cy="24" r="13"/><circle cx="24" cy="24" r="3"/><path d="M11 24H21M27 24H37M24 27V37"/><path d="M40 10V16"/><circle cx="40" cy="20" r="1.2" fill="currentColor"/>'),
    sens: 'Défaut de la direction assistée.', faire: 'Le volant peut devenir dur à tourner : rouler prudemment jusqu’au garage.' },
  { id: 'entretien', nom: 'Entretien à prévoir', c: 'orange', dessin: s48('<path d="M30 8A9 9 0 0 0 22 20L9 33A3 3 0 0 0 15 39L28 26A9 9 0 0 0 40 18L34 20L30 16L32 10Z"/>'),
    sens: 'La révision approche (vidange, contrôle).', faire: 'Prendre rendez-vous pour l’entretien prévu dans le carnet.' },
  { id: 'route', nom: 'Feux de route (pleins phares)', c: 'bleu', dessin: s48('<path d="M30 12C38 12 42 18 42 24S38 36 30 36C27 36 26 30 26 24S27 12 30 12Z"/><path d="M6 15H20M6 21H20M6 27H20M6 33H20"/>'),
    sens: 'Les pleins phares sont allumés.', faire: 'Les éteindre quand on croise ou suit un véhicule, pour ne pas éblouir.' },
  { id: 'croisement', nom: 'Feux de croisement', c: 'vert', dessin: s48('<path d="M30 12C38 12 42 18 42 24S38 36 30 36C27 36 26 30 26 24S27 12 30 12Z"/><path d="M6 18L20 15M6 24L20 21M6 30L20 27M6 36L20 33"/>'),
    sens: 'Les feux de croisement (codes) sont allumés.', faire: 'Information seulement : c’est l’éclairage normal la nuit.' },
  { id: 'brouillard-ar', nom: 'Feu antibrouillard arrière', c: 'orange', dessin: s48('<path d="M18 12C10 12 6 18 6 24S10 36 18 36C21 36 22 30 22 24S21 12 18 12Z"/><path d="M28 15H42M28 21H42M28 27H42M28 33H42"/><path d="M35 10Q32 24 35 38"/>'),
    sens: 'Le feu antibrouillard arrière est allumé.', faire: 'À utiliser seulement par brouillard épais ou neige ; l’éteindre sinon, il éblouit ceux qui suivent.' }
];
const COULEURS_VOYANT = { rouge: { lib: 'Rouge : danger, s’arrêter', c: '#FF5A5F' }, orange: { lib: 'Orange : anomalie, faire contrôler', c: '#FFB02E' }, vert: { lib: 'Vert : information', c: '#3DD68C' }, bleu: { lib: 'Bleu : information', c: '#4DA3FF' } };

/* ============================================================
   Les écrans
   ============================================================ */
function vueCables() {
  const fams = [...new Set(CABLES.map(c => c.fam))];
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>🔌 Les câbles et les prises</h2><div class="droite"><span class="badge">${CABLES.length} câbles</span></div></div>
    <p class="chapo">« C’est quoi ce câble ? » Reconnaître chaque prise au premier coup d’œil, savoir à quoi elle sert, et les petits pièges à connaître.</p>
    ${fams.map(f => `<section class="bloc"><h3 class="bloc-titre">${esc(f)}</h3><div class="cartes-img">${CABLES.filter(c => c.fam === f).map(c => `<article class="carte-img">
      <div class="img-zone">${c.dessin}</div><div class="img-texte"><h4>${esc(c.nom)}</h4><p>${esc(c.usage)}</p><p class="astuce">💡 ${esc(c.astuce)}</p></div></article>`).join('')}</div></section>`).join('')}
    ${devinette('cables', 'Teste-toi : quel est ce câble ?', CABLES.map(c => ({ nom: c.nom, dessin: `<div class="img-zone grand">${c.dessin}</div>`, explic: c.usage })))}`;
}
function zoneTemp(t) { return ZONES_TEMP.find(z => t < z.max) || ZONES_TEMP[ZONES_TEMP.length - 1]; }
function resultatTemp(t, A) {
  const z = zoneTemp(t);
  return `<div class="zone-t"><span class="e">${z.e}</span><div><small>${nb(t, 1)} °C</small><b>${esc(z.nom)}</b></div></div>
    <p>${esc(z.txt)}</p>
    ${A.alerte(t) ? `<div class="note risque" style="margin:10px 0 0"><span class="e">⚠️</span><div>${A.alerte(t)}</div></div>` : ''}`;
}
function majTemp() {
  const t = U.temp == null ? 37 : U.temp, A = AGES_TEMP.find(a => a.id === (U.ageTemp || 'adulte')), r = $('#resTemp');
  if (!r) return;
  r.style.setProperty('--zc', zoneTemp(t).c); r.innerHTML = resultatTemp(t, A);
  $('#tempValeur').textContent = `${nb(t, 1)} °C`; $('#curseurT').style.left = `${Math.max(0, Math.min(100, (t - 34) / 8 * 100))}%`;
}
function vueFievre() {
  const t = U.temp == null ? 37 : U.temp, age = U.ageTemp || 'adulte', z = zoneTemp(t), A = AGES_TEMP.find(a => a.id === age);
  const pctT = Math.max(0, Math.min(100, (t - 34) / 8 * 100));
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>🌡️ Température et fièvre</h2></div>
    <p class="chapo">Que veut dire le chiffre du thermomètre ? À partir de quand parle-t-on de fièvre, et quand faut-il s’inquiéter ?</p>
    <div class="note risque"><span class="e">⚕️</span><div><b>Ceci n’est pas un avis médical.</b> En cas de doute, appelez votre médecin ou un pharmacien. Urgence : <b>15</b> (SAMU) ou <b>112</b> ; personnes sourdes ou malentendantes : <b>114</b> (SMS) ; médecin de garde le soir et le week-end : <b>116 117</b> dans de nombreuses régions.</div></div>
    <div class="grille grille-temp">
      <article class="carte thermo-carte">
        <h3><span class="e">🌡️</span>Quelle est la température ?</h3>
        <div class="thermo-saisie"><input type="range" id="tempCurseur" min="34" max="42" step="0.1" value="${t}" aria-label="Température"><output id="tempValeur">${nb(t, 1)} °C</output></div>
        <div class="champ"><label for="tempAge">Pour qui ?</label><select id="tempAge">${AGES_TEMP.map(a => `<option value="${a.id}" ${a.id === age ? 'selected' : ''}>${esc(a.nom)}</option>`).join('')}</select></div>
        <div class="thermo-echelle"><div class="echelle">${ZONES_TEMP.map((zz, i) => { const min = i ? ZONES_TEMP[i - 1].max : 34, max = Math.min(zz.max, 42); return `<i style="flex:${Math.max(.2, max - min)};background:${zz.c}" title="${esc(zz.nom)}"></i>`; }).join('')}</div><span class="curseur-t" id="curseurT" style="left:${pctT}%"></span>
          <div class="graduations"><span>34</span><span>36</span><span>38</span><span>40</span><span>42</span></div></div>
      </article>
      <article class="carte resultat-temp" id="resTemp" style="--zc:${z.c}" aria-live="polite">${resultatTemp(t, A)}</article>
    </div>
    <section class="bloc"><h3 class="bloc-titre">🚨 Les signes qui doivent faire appeler le 15</h3>
      <div class="signaux">${[
        ['🟣', 'Des taches rouges ou violacées sur la peau qui ne s’effacent pas quand on appuie dessus'],
        ['🧠', 'Une raideur de la nuque, des maux de tête violents, une confusion, une somnolence inhabituelle'],
        ['🫁', 'Une difficulté à respirer, des lèvres bleutées'],
        ['⚡', 'Des convulsions'],
        ['💧', 'Un bébé qui refuse de boire, ne mouille plus ses couches, très abattu ou geignard'],
        ['✈️', 'Une fièvre au retour d’un voyage en zone tropicale (risque de paludisme)']].map((s, i) => `<div class="signal" style="--i:${i}"><span class="e">${s[0]}</span><small>${esc(s[1])}</small></div>`).join('')}</div></section>
    <div class="grille">
      <article class="carte"><h3><span class="e">📏</span>Bien prendre la température</h3>
        <div class="lignes">${MESURES.map(m => `<div class="ligne compacte"><span class="pic">${m.e}</span><span class="corps"><span class="t">${esc(m.nom)}</span><span class="s">${esc(m.d)}</span></span></div>`).join('')}</div>
        <p class="petit-texte">Attendre une vingtaine de minutes après un effort, un bain ou une boisson chaude avant de mesurer.</p></article>
      <article class="carte"><h3><span class="e">🤲</span>Les bons gestes en cas de fièvre</h3>
        <div class="lignes">${[['💧', 'Boire souvent', 'La fièvre fait perdre de l’eau, surtout chez l’enfant.'], ['👕', 'Se découvrir', 'Vêtements légers, pièce aérée, ne pas s’emmitoufler.'], ['🛏️', 'Se reposer', 'La fièvre est une défense du corps, souvent contre une infection.'], ['💊', 'Un médicament contre la fièvre ?', 'Seulement selon la notice ou l’avis d’un pharmacien ou d’un médecin, en respectant les doses et les délais. Le but est le confort, pas forcément de faire tomber la fièvre.'], ['📝', 'Noter', 'Les températures et les heures : utile pour le médecin.']].map(g => `<div class="ligne compacte"><span class="pic">${g[0]}</span><span class="corps"><span class="t">${esc(g[1])}</span><span class="s">${esc(g[2])}</span></span></div>`).join('')}</div></article>
    </div>
    ${devinette('fievre', 'Teste-toi : comment s’appelle cette température ?', [36.2, 37, 37.8, 38.4, 39.4, 40.5].map(v => { const zz = zoneTemp(v); return { nom: zz.nom, dessin: `<div class="temp-devine" style="--zc:${zz.c}">${nb(v, 1)} °C</div>`, explic: zz.txt }; }).filter((x, i, a) => a.findIndex(y => y.nom === x.nom) === i))}`;
}
function vueLinge() {
  const tous = LINGE.flatMap(f => f.items);
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>🧺 Les symboles du linge</h2><div class="droite"><span class="badge">${tous.length} symboles</span></div></div>
    <p class="chapo">Les petits dessins de l’étiquette disent tout : comment laver, blanchir, sécher, repasser. Cinq familles, cinq formes à retenir.</p>
    <div class="familles-linge">${[['🪣', 'Baquet', 'le lavage'], ['🔺', 'Triangle', 'le blanchiment'], ['⬜', 'Carré', 'le séchage'], ['♨️', 'Fer', 'le repassage'], ['⭕', 'Cercle', 'le pressing']].map(f => `<div><span>${f[0]}</span><b>${f[1]}</b><small>${f[2]}</small></div>`).join('')}</div>
    <div class="note douce"><span class="e">💡</span><div>Une <b>croix</b> sur un symbole veut toujours dire « interdit ». Les <b>traits sous</b> un symbole veulent dire « plus doux ». Les <b>points</b> indiquent la chaleur : plus il y en a, plus c’est chaud.</div></div>
    ${LINGE.map(f => `<section class="bloc"><h3 class="bloc-titre">${esc(f.fam)}</h3><div class="symboles">${f.items.map(s => `<div class="symbole">${s.dessin}<b>${esc(s.nom)}</b><small>${esc(s.explic)}</small></div>`).join('')}</div></section>`).join('')}
    ${devinette('linge', 'Teste-toi : que veut dire ce symbole ?', tous.map(s => ({ nom: s.nom, dessin: `<div class="sym-devine">${s.dessin}</div>`, explic: s.explic })))}`;
}
function vueVoyants() {
  const groupes = ['rouge', 'orange', 'vert', 'bleu'];
  return `${bandeauUnivers('vie')}
    <div class="section-titre"><h2>🚗 Les voyants de la voiture</h2><div class="droite"><span class="badge">${VOYANTS.length} voyants</span></div></div>
    <p class="chapo">Un voyant s’allume au tableau de bord : est-ce grave ? La couleur donne déjà la réponse.</p>
    <div class="couleurs-v">${groupes.map(g => `<div style="--vc:${COULEURS_VOYANT[g].c}"><i></i><b>${esc(COULEURS_VOYANT[g].lib)}</b></div>`).join('')}</div>
    <div class="note douce"><span class="e">📘</span><div>Les symboles peuvent varier d’une marque à l’autre : en cas de doute, le <b>carnet d’entretien</b> ou la notice du véhicule fait foi. En cas de voyant rouge sur autoroute, s’arrêter sur une aire ou la bande d’arrêt d’urgence, gilet jaune et triangle.</div></div>
    ${groupes.filter(g => g !== 'vert').map(g => `<section class="bloc"><h3 class="bloc-titre" style="color:${COULEURS_VOYANT[g].c}">● ${esc(g === 'bleu' ? 'Vert et bleu : information' : COULEURS_VOYANT[g].lib)}</h3>
      <div class="voyants">${VOYANTS.filter(v => g === 'bleu' ? (v.c === 'bleu' || v.c === 'vert') : v.c === g).map(v => `<article class="voyant">
        <div class="tableau-bord" style="--vc:${COULEURS_VOYANT[v.c].c}">${v.dessin}</div>
        <div><h4>${esc(v.nom)}</h4><p><b>Ça veut dire :</b> ${esc(v.sens)}</p><p><b>Que faire :</b> ${esc(v.faire)}</p></div></article>`).join('')}</div></section>`).join('')}
    ${devinette('voyants', 'Teste-toi : quel est ce voyant ?', VOYANTS.map(v => ({ nom: v.nom, dessin: `<div class="tableau-bord grand" style="--vc:${COULEURS_VOYANT[v.c].c}">${v.dessin}</div>`, explic: v.sens })))}`;
}
document.addEventListener('input', e => {
  if (e.target.id === 'tempCurseur') { U.temp = +e.target.value; majTemp(); }
});
document.addEventListener('change', e => { if (e.target.id === 'tempAge') { U.ageTemp = e.target.value; majTemp(); } });
