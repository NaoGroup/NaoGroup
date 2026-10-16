/* ============================================================
   NaoBudget — le bloc-notes
   Un panneau sur le côté droit, ouvert ou fermé, mais toujours
   accessible : il ne dépend d'aucun onglet et suit partout.
   Le texte part dans la sauvegarde comme le reste du budget.
   ============================================================ */

const NOTES_OUVERT = 'naobudget.notes.ouvert';
let notesTimer = null;

function notesTexte() { return (state.notes || ''); }

function notesMaj(txt) {
  state.notes = txt;
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => { save(); notesEtat('enregistré'); }, 400);
  notesEtat('…');
  notesCompte();
}
function notesEtat(m) { const n = el('notesEtat'); if (n) n.textContent = m; }
function notesCompte() {
  const n = el('notesCompte'); if (!n) return;
  const t = notesTexte().trim();
  const lignes = t ? t.split(/\n+/).filter(x => x.trim()).length : 0;
  const coches = (t.match(/☐/g) || []).length, faits = (t.match(/☑/g) || []).length;
  n.textContent = !t ? 'vide'
    : `${lignes} ligne(s)` + (coches + faits ? ` · ${faits}/${coches + faits} fait(s)` : '');
  const tab = el('notesTab');
  if (tab) tab.classList.toggle('plein', !!t);
}

function notesOuvrir(on) {
  const box = el('notes'); if (!box) return;
  box.classList.toggle('on', on);
  el('notesTab').setAttribute('aria-expanded', on ? 'true' : 'false');
  try { localStorage.setItem(NOTES_OUVERT, on ? '1' : '0'); } catch (e) {}
  if (on) setTimeout(() => { const z = el('notesZone'); if (z) z.focus(); }, 180);
}

/* Petites aides d'écriture : une date, une case à cocher, un trait. */
function notesInsere(txt) {
  const z = el('notesZone'); if (!z) return;
  const d = z.selectionStart, f = z.selectionEnd, v = z.value;
  const avant = v.slice(0, d), apres = v.slice(f);
  const saut = (avant && !avant.endsWith('\n')) ? '\n' : '';
  z.value = avant + saut + txt + apres;
  const pos = (avant + saut + txt).length;
  z.setSelectionRange(pos, pos);
  z.focus();
  notesMaj(z.value);
}
function notesCocher() {
  const z = el('notesZone'); if (!z) return;
  const v = z.value, pos = z.selectionStart;
  const debut = v.lastIndexOf('\n', pos - 1) + 1;
  let fin = v.indexOf('\n', pos); if (fin < 0) fin = v.length;
  const ligne = v.slice(debut, fin);
  let neuve;
  if (ligne.includes('☐')) neuve = ligne.replace('☐', '☑');
  else if (ligne.includes('☑')) neuve = ligne.replace('☑', '☐');
  else neuve = '☐ ' + ligne;
  z.value = v.slice(0, debut) + neuve + v.slice(fin);
  z.setSelectionRange(debut + neuve.length, debut + neuve.length);
  z.focus();
  notesMaj(z.value);
}

function notesInit() {
  const box = el('notes'); if (!box) return;
  const z = el('notesZone');
  z.value = notesTexte();
  notesCompte();
  notesEtat(notesTexte() ? 'enregistré' : '');
  let ouvert = false;
  try { ouvert = localStorage.getItem(NOTES_OUVERT) === '1'; } catch (e) {}
  notesOuvrir(ouvert);

  el('notesTab').addEventListener('click', () => notesOuvrir(!box.classList.contains('on')));
  el('notesFermer').addEventListener('click', () => notesOuvrir(false));
  z.addEventListener('input', () => notesMaj(z.value));
  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-note]'); if (!b) return;
    if (b.dataset.note === 'date') {
      const d = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      notesInsere('— ' + d + ' — ');
    } else if (b.dataset.note === 'coche') notesCocher();
    else if (b.dataset.note === 'trait') notesInsere('──────────');
    else if (b.dataset.note === 'vider') {
      if (!notesTexte().trim()) return;
      if (!confirm('Effacer toutes les notes ?\n\nElles ne sont pas récupérables, mais elles figurent dans vos sauvegardes .json.')) return;
      z.value = ''; notesMaj(''); toast('🧹 Notes effacées');
    }
  });
  /* Alt+N ouvre et ferme, où qu'on soit. */
  document.addEventListener('keydown', e => {
    if (e.altKey && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      notesOuvrir(!box.classList.contains('on'));
    }
  });
}
