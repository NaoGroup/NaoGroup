/* ============================================================
   NaoCV — navigation, actions, exports et décor animé.
   ============================================================ */
'use strict';

/* ---------- Affichage ---------- */
function rendre() {
  const v = NC.vues[NC.UI.vue] ? NC.UI.vue : 'accueil';
  NC.UI.vue = v;
  $('#contenu').innerHTML = NC.vues[v]();
  $$('#onglets button').forEach(b => b.classList.toggle('actif', b.dataset.vue === v));
  if (v === 'cv') majApercu();
  if (v === 'lettres') majApercuLettre();
  majBulle();
  if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
}
NC.rendre = rendre;
function onglets() {
  $('#onglets').innerHTML = NC.ONGLETS.map(([id, em, nom]) => `<button type="button" data-act="vue" data-vue="${id}"><span aria-hidden="true">${em}</span>${nom}${id === 'candidatures' ? '<i class="bulle-n" id="bulleRelances" hidden></i>' : ''}</button>`).join('');
  majBulle();
}
function majBulle() {
  const b = $('#bulleRelances'); if (!b) return;
  const n = NC.relancesDues().length;
  b.hidden = !n; b.textContent = n;
}
function aller(vue) { NC.UI.vue = vue; rendre(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* L'aperçu à l'échelle : la feuille A4 garde sa vraie taille, on la réduit pour l'écran. */
function echelle() {
  const zone = $('#apercu'), cadre = $('#apercuCadre');
  if (!zone || !cadre || !zone.firstElementChild) return;
  const f = zone.firstElementChild, k = Math.min(1, cadre.clientWidth / f.offsetWidth);
  zone.style.transform = `scale(${k})`;
  cadre.style.height = Math.ceil(f.offsetHeight * k) + 'px';
  const pageH = f.offsetWidth * 297 / 210;
  const pages = Math.max(1, Math.ceil((f.offsetHeight - 6) / pageH));
  if (NC.UI.vue === 'cv') {
    NC.pagesApercu = pages;
    const p = $('#pagesApercu');
    if (p) { p.textContent = pages + ' page' + (pages > 1 ? 's' : ''); p.classList.toggle('chaud', pages > 2); }
  }
}
function majApercu() {
  const zone = $('#apercu'); if (!zone) return;
  const cv = NC.cvCourant();
  zone.innerHTML = NC.rendreCV(cv, cv.style.ats);
  requestAnimationFrame(echelle);
}
function majApercuLettre() {
  const zone = $('#apercu'), l = NC.lettreCourante(); if (!zone || !l) return;
  zone.innerHTML = NC.rendreLettre(l, NC.cvParId(l.cvId) || NC.cvPrincipal());
  requestAnimationFrame(echelle);
  const t = NC.trousLettre(l), mots = l.paragraphes.join(' ').split(/\s+/).filter(Boolean).length, cible = l.format === 'court' ? [120, 220] : [250, 420];
  const e = $('#etatLettre'); if (e) { e.textContent = t ? `⚠️ ${t} élément(s) à compléter` : '✓ Prête'; e.className = 'etiq ' + (t ? 'chaud' : 'vert'); }
  const m = $('#motsLettre'); if (m) m.textContent = `${mots} mots · visez ${cible[0]}–${cible[1]}`;
}
let minuteurApercu = 0;
const bientot = f => { clearTimeout(minuteurApercu); minuteurApercu = setTimeout(f, 140); };
function majEtapes() { const n = $('#navEtapes'); if (n) n.innerHTML = NC.navEtapes(NC.cvCourant()); }
window.addEventListener('resize', () => bientot(echelle));

/* ---------- Les champs liés ---------- */
function poser(obj, chemin, v) {
  const k = chemin.split('.'); let o = obj;
  for (let i = 0; i < k.length - 1; i++) { if (o[k[i]] == null) o[k[i]] = {}; o = o[k[i]]; }
  o[k[k.length - 1]] = v;
}
function cibleDe(nom) {
  return { cv: NC.cvCourant(), brouillon: NC.brouillon, lettre: NC.lettreCourante(), cand: NC.brouillonCand, offre: NC.ETAT.offre }[nom];
}
function lier(el) {
  const zone = el.closest('[data-cible]'); if (!zone) return;
  const nom = zone.dataset.cible, obj = cibleDe(nom), chemin = el.dataset.c; if (!obj || !chemin) return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (nom === 'brouillon' && chemin === 'missions') v = el.value.split('\n');
  poser(obj, chemin, v);
  if (nom === 'cv') {
    obj.maj = NC.aujourdhui();
    if (chemin === 'accroche') { const c = $('#compteAccroche'); if (c) c.textContent = v.length; }
    NC.sauver(); bientot(majApercu); majEtapes();
  } else if (nom === 'brouillon') {
    if (chemin === 'entreprise') {
      const t = NC.trouverEntreprise(v);
      if (t && (!obj.couleur || obj._auto)) { obj.couleur = t.c1; obj._auto = true; }
      NC.majMarqueExp();
    }
    if (chemin === 'couleur') { obj._auto = false; const m = $('#marqueExp .mono'); if (m) m.style.background = v; }
    if (chemin === 'enCours') { const f = $('[data-cible="brouillon"] [data-c="fin"]'); if (f) f.closest('.champ').classList.toggle('grise', v); }
  } else if (nom === 'lettre') {
    NC.sauver(); bientot(majApercuLettre);
    if (chemin === 'cvId' || chemin === 'format') rendre();
  } else if (nom === 'cand') {
    if (chemin === 'dateEnvoi' && v && !obj.dateRelance) { obj.dateRelance = NC.plusJours(v, 10); const r = $('[data-cible="cand"] [data-c="dateRelance"]'); if (r) r.value = obj.dateRelance; }
    if (chemin === 'statut' && v === 'envoyee' && !obj.dateEnvoi) {
      obj.dateEnvoi = NC.aujourdhui(); if (!obj.dateRelance) obj.dateRelance = NC.plusJours(obj.dateEnvoi, 10);
      ['dateEnvoi', 'dateRelance'].forEach(k => { const r = $(`[data-cible="cand"] [data-c="${k}"]`); if (r) r.value = obj[k]; });
    }
  } else if (nom === 'offre') {
    NC.sauver();
  }
}
document.addEventListener('input', e => {
  const el = e.target;
  if (el.matches('[data-c]') && el.type !== 'checkbox' && el.tagName !== 'SELECT') lier(el);
  if (el.matches('[data-par]')) {
    const l = NC.lettreCourante(); if (!l) return;
    l.paragraphes[+el.dataset.par] = el.value; NC.sauver(); bientot(majApercuLettre);
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('[data-c]') && (el.type === 'checkbox' || el.tagName === 'SELECT')) {
    lier(el);
    const zone = el.closest('[data-cible]');
    if (zone && zone.dataset.cible === 'cv' && /^style\./.test(el.dataset.c) && NC.UI.etape === 'style') rendre();
    if (zone && zone.dataset.cible === 'offre' && el.dataset.c === 'cvId') rendre();
  }
  if (el.matches('[data-c="entreprise"]') && el.closest('[data-cible="offre"]')) rendre();
  if (el.matches('[data-act-change]')) CHG[el.dataset.actChange] && CHG[el.dataset.actChange](el);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modale').classList.contains('ouvert')) fermerModale();
  if (e.key === 'Enter' && e.target.matches('[data-puce]')) { e.preventDefault(); ajouterPuce(e.target.dataset.puce, e.target.value); }
  if (e.key === 'Enter' && e.target.id === 'saisieMarque') { e.preventDefault(); ACT['marque-saisie'](); }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (e.target.id === 'modale') { fermerModale(); return; }
  if (!b || b.disabled) return;
  const f = ACT[b.dataset.act];
  if (f) { e.preventDefault(); f(b, e); }
});

/* ---------- Les actions ---------- */
const ACT = {}, CHG = {};
const cvDe = b => NC.cvParId(b && b.dataset.id) || NC.cvCourant();
const modifie = cv => { cv.maj = NC.aujourdhui(); NC.sauver(); };

ACT.vue = b => aller(b.dataset.vue);
ACT.aller = b => { if (b.dataset.id) NC.UI.cvId = b.dataset.id; else if (b.dataset.vue === 'cv') NC.UI.cvId = NC.ETAT.principal; if (b.dataset.etape) NC.UI.etape = b.dataset.etape; aller(b.dataset.vue); };
ACT.etape = b => {
  NC.UI.etape = b.dataset.etape; NC.UI.mobileApercu = false;
  if (NC.UI.etape === 'style') { NC.ETAT.vus['style_' + NC.cvCourant().id] = 1; NC.sauver(); }
  rendre();
  const f = $('#edForm'); if (f && f.getBoundingClientRect().top < 0) f.scrollIntoView({ behavior: 'smooth' });
};
ACT['creer-mon-cv'] = () => {
  const cv = NC.cvPrincipal(); NC.UI.cvId = cv.id;
  NC.UI.etape = (NC.ETAPES.find(e => ['', 'part'].includes(NC.etatEtape(cv, e[0]))) || NC.ETAPES[0])[0];
  aller('cv');
};
ACT.exemple = () => {
  const cv = NC.exemple(); NC.ETAT.cvs.push(cv); NC.UI.cvId = cv.id; NC.UI.etape = 'exp'; NC.sauver();
  aller('cv'); toast('👀 Exemple chargé comme une version à part. Supprimez-le depuis « Mes versions » quand vous voulez.');
};
ACT.basculer = () => {};
ACT['basculer-apercu'] = () => { NC.UI.mobileApercu = !NC.UI.mobileApercu; rendre(); };
ACT.fermer = () => fermerModale();
ACT.confirme = () => { const f = NC._confirme; NC._confirme = null; fermerModale(); if (f) f(); };

/* Nouveau CV / nouvelle version */
function fenetreNouveauCV(titre) {
  const p = NC.cvPrincipal(), vierge = !p.titre && !p.experiences.length;
  ouvrirModale(`<h3 id="modaleTitre">${titre}</h3>
    <div class="grille2">
      <label class="champ"><span>Nom de la version</span><input id="nvNom" type="text" placeholder="CV — Assistante commerciale"></label>
      <label class="champ"><span>Poste visé</span><input id="nvPoste" type="text" placeholder="Intitulé du poste"></label>
      <label class="champ"><span>Entreprise visée <i class="fac">facultatif</i></span><input id="nvEnt" type="text" list="dlEntreprises" placeholder="Pour l'habiller à ses couleurs"></label>
    </div>
    <div class="coches">
      <label class="coche radio"><input type="radio" name="nvDepart" value="copie" ${vierge ? '' : 'checked'}><span class="case"></span><span><b>Copie de mon CV principal</b> — vous ajustez la mise en avant (recommandé)</span></label>
      <label class="coche radio"><input type="radio" name="nvDepart" value="vierge" ${vierge ? 'checked' : ''}><span class="case"></span><span><b>CV vierge</b> — on repart de zéro</span></label>
      <label class="coche"><input type="checkbox" id="nvMarque" checked><span class="case"></span><span>Habiller le CV aux couleurs de l'entreprise visée, si elles sont connues</span></label>
    </div>
    <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="creer-version">Créer</button></div>`);
}
ACT['nouveau-cv'] = () => fenetreNouveauCV('📄 Créer un CV');
ACT['nouvelle-version'] = () => fenetreNouveauCV('🗂️ Nouvelle version de CV');
ACT['creer-version'] = () => {
  const depart = ($('input[name="nvDepart"]:checked') || {}).value || 'copie';
  const poste = $('#nvPoste').value.trim(), ent = $('#nvEnt').value.trim();
  let cv;
  if (depart === 'copie') { cv = clone(NC.cvPrincipal()); cv.id = uid(); cv.cree = cv.maj = NC.aujourdhui(); cv.experiences.forEach(x => x.id = uid()); cv.formations.forEach(x => x.id = uid()); }
  else { cv = NC.cvVide(); cv.perso = clone(NC.cvPrincipal().perso); }
  cv.nom = $('#nvNom').value.trim() || ['CV', poste, ent].filter(Boolean).join(' — ') || 'Nouvelle version';
  cv.cible = { poste, entreprise: ent, offre: '' };
  if (poste) cv.titre = poste;
  if (ent && $('#nvMarque').checked) appliquerMarque(cv, ent, true);
  NC.ETAT.cvs.push(cv); NC.UI.cvId = cv.id; NC.UI.etape = depart === 'copie' ? 'poste' : 'coord';
  NC.sauver(); fermerModale(); aller('cv'); toast('🗂️ Version « ' + esc(cv.nom) + ' » créée.');
};

/* Importer un ancien CV */
ACT.importer = () => {
  ouvrirModale(`<h3 id="modaleTitre">📥 Importer un CV</h3>
    <p class="muted">Choisissez votre ancien CV — <b>PDF</b>, <b>Word (.docx)</b>, <b>photo ou capture d'écran</b>, ou <b>.txt</b> — ou collez son texte.
    Le texte lu s'affiche d'abord ici : corrigez-le si besoin, puis NaoCV le range par rubriques.</p>
    <textarea id="texteImport" rows="11" placeholder="Collez ici le texte de votre CV, ou déposez un fichier sur cette zone…" spellcheck="false"></textarea>
    <div class="boutons"><button class="btn petit" data-act="fichier-import">📄 Choisir un fichier : PDF, Word, image, texte</button><span class="muted petit" id="nomImport"></span></div>
    <p class="muted petit">Une image est lue par reconnaissance de texte, directement dans votre navigateur : elle n'est envoyée nulle part.
    La première fois, le moteur de lecture se télécharge (connexion Internet nécessaire). Vérifiez bien le résultat : une photo floue ou penchée donne des erreurs.</p>
    <div class="coches">
      <label class="coche radio"><input type="radio" name="impMode" value="version" checked><span class="case"></span><span>Créer une nouvelle version</span></label>
      <label class="coche radio"><input type="radio" name="impMode" value="principal"><span class="case"></span><span>Remplacer le contenu de mon CV principal (le style est conservé)</span></label>
    </div>
    <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="lancer-import">Importer et restructurer</button></div>`, 'large');
};
ACT['fichier-import'] = () => $('#fichierImport').click();
/* Lit un fichier importé et place son texte dans la zone, pour relecture avant la restructuration. */
async function lireFichierImport(f) {
  const n = $('#nomImport'), z = $('#texteImport'), bouton = $('[data-act="lancer-import"]');
  const etat = t => { if (n) n.textContent = t; };
  if (bouton) bouton.disabled = true;
  try {
    let texte;
    if (/\.docx$/i.test(f.name)) texte = await NC.texteDocx(f);
    else if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
      const r = await NC.textePdf(f, etat);
      texte = r.texte;
      if (texte.replace(/\s/g, '').length < 40) {
        etat('Ce PDF est une image scannée : lecture par reconnaissance de texte…');
        texte = await NC.texteImages(await NC.pagesEnImages(r.doc, 3), etat);
      }
    } else if (/^image\//.test(f.type) || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name)) texte = await NC.texteImages([f], etat);
    else if (/\.doc$/i.test(f.name)) throw new Error('L\'ancien format Word (.doc) n\'est pas lisible : enregistrez-le en .docx ou en PDF depuis Word.');
    else texte = await f.text();
    texte = String(texte || '').replace(/\n{3,}/g, '\n\n').trim();
    if (!texte) throw new Error('Aucun texte trouvé dans ce fichier.');
    if (z) z.value = texte;
    etat(`✓ ${f.name} lu — relisez le texte, puis « Importer et restructurer ».`);
  } catch (err) {
    etat('');
    toast('⚠️ ' + esc(err.message || 'Lecture impossible.'), 'alerte');
  } finally { if (bouton) bouton.disabled = false; }
}
$('#fichierImport').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) lireFichierImport(f); });
document.addEventListener('dragover', e => { if (e.target.id === 'texteImport') { e.preventDefault(); e.target.classList.add('survol'); } });
document.addEventListener('dragleave', e => { if (e.target.id === 'texteImport') e.target.classList.remove('survol'); });
document.addEventListener('drop', e => {
  if (e.target.id !== 'texteImport' || !e.dataTransfer.files.length) return;
  e.preventDefault(); e.target.classList.remove('survol'); lireFichierImport(e.dataTransfer.files[0]);
});
ACT['lancer-import'] = () => {
  const t = ($('#texteImport') || {}).value || '';
  if (t.trim().length < 30) { toast('Collez d\'abord le texte de votre CV.', 'alerte'); return; }
  const lu = NC.importerTexte(t), mode = ($('input[name="impMode"]:checked') || {}).value;
  let cv;
  if (mode === 'principal') {
    cv = NC.cvPrincipal();
    const garde = { id: cv.id, nom: cv.nom, style: cv.style, cree: cv.cree };
    Object.assign(cv, lu, garde); cv.perso.photo = cv.perso.photo || '';
  } else { cv = lu; NC.ETAT.cvs.push(cv); }
  NC.UI.cvId = cv.id; NC.UI.etape = 'coord'; NC.sauver(); fermerModale(); aller('cv');
  toast(`📥 CV restructuré : ${cv.experiences.length} expérience(s), ${cv.formations.length} formation(s), ${cv.compTech.length + cv.compRel.length + cv.logiciels.length} compétence(s). Vérifiez chaque étape.`);
};

/* Expériences et formations */
const expVide = () => ({ id: uid(), poste: '', entreprise: '', ville: '', debut: '', fin: '', enCours: false, contrat: '', missions: [], outils: '', resultats: '', competences: '', couleur: '', logo: '' });
const formVide = () => ({ id: uid(), diplome: '', ecole: '', ville: '', debut: '', fin: '', enCours: false, mention: '', details: '' });
ACT['ajouter-exp-accueil'] = () => { NC.UI.cvId = NC.ETAT.principal; NC.UI.etape = 'exp'; aller('cv'); NC.fenetreExperience(expVide(), true); };
ACT['ajouter-exp'] = () => NC.fenetreExperience(expVide(), true);
ACT['modifier-exp'] = b => { NC.UI.expIndex = +b.dataset.i; NC.fenetreExperience(clone(NC.cvCourant().experiences[+b.dataset.i]), false); };
ACT['enregistrer-exp'] = b => {
  const x = NC.brouillon, cv = NC.cvCourant();
  if (!x.poste.trim() && !x.entreprise.trim()) { toast('Indiquez au moins le poste ou l\'entreprise.', 'alerte'); return; }
  x.missions = x.missions.map(m => m.trim()).filter(Boolean);
  if (!x.couleur) { const t = NC.trouverEntreprise(x.entreprise); if (t) x.couleur = t.c1; }
  delete x._auto;
  if (b.dataset.nouveau === '1') cv.experiences.unshift(x); else cv.experiences[NC.UI.expIndex] = x;
  modifie(cv); fermerModale(); rendre();
  const vagues = x.missions.filter(NC.estVague).length;
  toast(vagues ? `💼 Enregistrée. ${vagues} mission(s) gagneraient à être précisées (✨ Reformuler).` : '💼 Expérience enregistrée.');
};
ACT['supprimer-exp'] = b => confirmer('Supprimer cette expérience ?', () => { const cv = NC.cvCourant(); cv.experiences.splice(+b.dataset.i, 1); modifie(cv); rendre(); });
function deplacer(liste, i, d) { const j = i + d; if (j < 0 || j >= liste.length) return; [liste[i], liste[j]] = [liste[j], liste[i]]; }
ACT['monter-exp'] = b => { const cv = NC.cvCourant(); deplacer(cv.experiences, +b.dataset.i, -1); modifie(cv); rendre(); };
ACT['descendre-exp'] = b => { const cv = NC.cvCourant(); deplacer(cv.experiences, +b.dataset.i, 1); modifie(cv); rendre(); };
ACT['ajouter-form'] = () => NC.fenetreFormation(formVide(), true);
ACT['modifier-form'] = b => { NC.UI.formIndex = +b.dataset.i; NC.fenetreFormation(clone(NC.cvCourant().formations[+b.dataset.i]), false); };
ACT['enregistrer-form'] = b => {
  const f = NC.brouillon, cv = NC.cvCourant();
  if (!f.diplome.trim()) { toast('Indiquez le diplôme ou la formation.', 'alerte'); return; }
  if (b.dataset.nouveau === '1') cv.formations.unshift(f); else cv.formations[NC.UI.formIndex] = f;
  modifie(cv); fermerModale(); rendre(); toast('🎓 Formation enregistrée.');
};
ACT['supprimer-form'] = b => confirmer('Supprimer cette formation ?', () => { const cv = NC.cvCourant(); cv.formations.splice(+b.dataset.i, 1); modifie(cv); rendre(); });
ACT['monter-form'] = b => { const cv = NC.cvCourant(); deplacer(cv.formations, +b.dataset.i, -1); modifie(cv); rendre(); };
ACT['descendre-form'] = b => { const cv = NC.cvCourant(); deplacer(cv.formations, +b.dataset.i, 1); modifie(cv); rendre(); };
ACT.trier = () => {
  const cv = NC.cvCourant(), tri = (a, b) => NC.cleTri(b).localeCompare(NC.cleTri(a));
  cv.experiences.sort(tri); cv.formations.sort(tri); modifie(cv); rendre(); toast('↕️ Trié du plus récent au plus ancien.');
};
ACT.reformuler = () => { const t = $('#champMissions'); if (t) NC.brouillon.missions = t.value.split('\n'); NC.panneauReformulation(); };
ACT.variante = b => {
  NC.brouillon.missions[+b.dataset.i] = b.dataset.t;
  const t = $('#champMissions'); if (t) t.value = NC.brouillon.missions.join('\n');
  NC.panneauReformulation(); toast('✨ Formulation appliquée.');
};

/* Images : photo, logos */
let usageImage = '';
ACT['choisir-photo'] = () => { usageImage = 'photo'; $('#fichierImage').click(); };
ACT['logo-exp'] = () => { usageImage = 'logo-exp'; $('#fichierImage').click(); };
ACT['logo-marque'] = () => { usageImage = 'logo-marque'; $('#fichierImage').click(); };
$('#fichierImage').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    if (usageImage === 'photo') {
      const r = await NC.reduireImage(f, 360, 'image/jpeg'), cv = NC.cvCourant();
      cv.perso.photo = r.url; cv.style.photo = true; modifie(cv); rendre(); toast('📷 Photo ajoutée (version visuelle uniquement).');
    } else {
      const r = await NC.reduireImage(f, 160, 'image/png'), couleurs = NC.couleursDuLogo(r.canvas);
      if (usageImage === 'logo-exp') {
        NC.brouillon.logo = r.url; if (couleurs[0]) { NC.brouillon.couleur = couleurs[0]; NC.brouillon._auto = false; }
        NC.majMarqueExp(); toast(couleurs.length ? '🎨 Logo importé, couleur extraite.' : '🎨 Logo importé.');
      } else {
        const cv = NC.cvCourant();
        if (!couleurs.length) { toast('Aucune couleur nette trouvée dans ce logo.', 'alerte'); return; }
        cv.style.couleur = couleurs[0]; cv.style.couleur2 = couleurs[1] || '';
        cv.style.marque = (($('#saisieMarque') || {}).value || '').trim() || cv.cible.entreprise || 'l\'entreprise visée';
        modifie(cv); rendre(); toast('🎨 Couleurs extraites du logo et appliquées.');
      }
    }
  } catch (err) { toast('⚠️ Image illisible.', 'alerte'); }
});
ACT['retirer-photo'] = () => { const cv = NC.cvCourant(); cv.perso.photo = ''; cv.style.photo = false; modifie(cv); rendre(); };
ACT['retirer-logo-exp'] = () => { NC.brouillon.logo = ''; NC.majMarqueExp(); };

/* Poste, compétences, listes */
ACT['utiliser-accroche'] = b => { const cv = NC.cvCourant(), i = NC.ideesAccroche(cv)[+b.dataset.i]; if (!i) return; cv.accroche = i.texte; modifie(cv); rendre(); toast('💡 Accroche reprise : personnalisez-la avec vos mots.'); };
function ajouterPuce(cle, texte) {
  const cv = NC.cvCourant(), mots = String(texte || '').split(/\s*[,;]\s*/).map(s => s.trim()).filter(Boolean);
  mots.forEach(t => { if (!cv[cle].some(x => norm(x) === norm(t))) cv[cle].push(NC.maj1(t)); });
  if (mots.length) { modifie(cv); rendre(); const i = $(`[data-puce="${cle}"]`); if (i) i.focus(); }
}
ACT['ajouter-puce'] = b => { const i = $(`[data-puce="${b.dataset.cle}"]`); ajouterPuce(b.dataset.cle, i && i.value); };
ACT['puce-sugg'] = b => ajouterPuce(b.dataset.cle, b.dataset.t);
ACT['retirer-puce'] = b => { const cv = NC.cvCourant(); cv[b.dataset.cle].splice(+b.dataset.i, 1); modifie(cv); rendre(); };
const LIGNES = { langues: () => ({ langue: '', niveau: '' }), certifications: () => ({ nom: '', organisme: '', date: '' }), projets: () => ({ titre: '', contexte: '', description: '', lien: '' }) };
ACT['ajouter-ligne'] = b => { const cv = NC.cvCourant(); cv[b.dataset.cle].push(LIGNES[b.dataset.cle]()); modifie(cv); rendre(); };
ACT['retirer-ligne'] = b => { const cv = NC.cvCourant(); cv[b.dataset.cle].splice(+b.dataset.i, 1); modifie(cv); rendre(); };

/* Style */
ACT.mode = b => { const cv = NC.cvCourant(); cv.style.ats = b.dataset.ats === '1'; modifie(cv); rendre(); };
ACT.modele = b => { const cv = NC.cvCourant(), M = NC.modele(b.dataset.m); cv.style.modele = M.id; cv.style.police = M.police; cv.style.ats = false; modifie(cv); rendre(); };
ACT.couleur = b => { const cv = NC.cvCourant(); cv.style.couleur = b.dataset.c; cv.style.couleur2 = ''; cv.style.marque = ''; modifie(cv); rendre(); };
function appliquerMarque(cv, nom, silencieux) {
  const t = NC.trouverEntreprise(nom);
  if (t) { cv.style.couleur = t.c1; cv.style.couleur2 = t.c2; cv.style.marque = t.nom; if (!silencieux) toast(`🏢 CV habillé aux couleurs de ${esc(t.nom)}.`); return true; }
  cv.style.marque = nom;
  if (!silencieux) toast(`Couleurs de « ${esc(nom)} » inconnues : choisissez-les ci-dessous, ou importez son logo 📷.`, 'alerte');
  return false;
}
ACT.marque = b => { const cv = NC.cvCourant(); appliquerMarque(cv, b.dataset.e); modifie(cv); rendre(); };
ACT['marque-saisie'] = () => { const v = (($('#saisieMarque') || {}).value || '').trim(); if (!v) return; const cv = NC.cvCourant(); appliquerMarque(cv, v); modifie(cv); rendre(); };
ACT['retirer-marque'] = () => { const cv = NC.cvCourant(); cv.style.marque = ''; cv.style.couleur2 = ''; cv.style.couleur = '#1F3A68'; modifie(cv); rendre(); };
ACT.corriger = b => { const cv = NC.cvCourant(); NC.corriger(cv, b.dataset.f, b.dataset.r); modifie(cv); rendre(); toast('🔤 Corrigé dans tout le CV.'); };

/* Versions */
ACT['ouvrir-cv'] = b => { NC.UI.cvId = b.dataset.id; aller('cv'); };
CHG['choisir-cv'] = el => { NC.UI.cvId = el.value; rendre(); };
ACT['dupliquer-cv'] = b => {
  const src = cvDe(b), cv = clone(src);
  cv.id = uid(); cv.nom = src.nom + ' (copie)'; cv.cree = cv.maj = NC.aujourdhui();
  NC.ETAT.cvs.push(cv); NC.sauver(); rendre(); toast('🗂️ Version dupliquée.');
};
ACT['renommer-cv'] = b => {
  const cv = cvDe(b); NC.UI.renomme = cv.id;
  ouvrirModale(`<h3 id="modaleTitre">Renommer la version</h3><label class="champ"><span>Nom</span><input id="nouveauNom" type="text" value="${esc(cv.nom)}"></label>
    <div class="grille2"><label class="champ"><span>Poste visé</span><input id="nouveauPoste" type="text" value="${esc(cv.cible.poste)}"></label><label class="champ"><span>Entreprise visée</span><input id="nouvelleEnt" type="text" list="dlEntreprises" value="${esc(cv.cible.entreprise)}"></label></div>
    <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn primaire" data-act="valider-nom">Enregistrer</button></div>`, 'petite');
};
ACT['valider-nom'] = () => {
  const cv = NC.cvParId(NC.UI.renomme); if (!cv) return;
  cv.nom = $('#nouveauNom').value.trim() || cv.nom; cv.cible.poste = $('#nouveauPoste').value.trim(); cv.cible.entreprise = $('#nouvelleEnt').value.trim();
  modifie(cv); fermerModale(); rendre();
};
ACT['principal-cv'] = b => { NC.ETAT.principal = b.dataset.id; NC.sauver(); rendre(); toast('★ C\'est désormais votre CV principal.'); };
ACT['supprimer-cv'] = b => {
  const cv = cvDe(b);
  confirmer(`Supprimer la version « ${esc(cv.nom)} » ? Les candidatures liées garderont leur historique, sans lien vers ce CV.`, () => {
    NC.ETAT.cvs = NC.ETAT.cvs.filter(c => c.id !== cv.id);
    if (NC.ETAT.principal === cv.id) NC.ETAT.principal = NC.ETAT.cvs[0].id;
    if (NC.UI.cvId === cv.id) NC.UI.cvId = NC.ETAT.principal;
    NC.ETAT.candidatures.forEach(c => { if (c.cvId === cv.id) c.cvId = ''; });
    NC.sauver(); rendre();
  });
};

/* Exports */
ACT.exporter = b => {
  const cv = cvDe(b), nom = NC.nomFichier('CV', cv, cv.cible.poste || cv.titre), L = NC.verifier(cv, cv.style.ats);
  ouvrirModale(`<h3 id="modaleTitre">⬇️ Exporter « ${esc(cv.nom)} »</h3>
    ${NC.pret(L) ? '<p class="bravo">✅ La vérification est au vert.</p>' : `<p class="attention">🛠️ La vérification signale encore des points : <button class="lien" data-act="aller" data-vue="cv" data-etape="verif" data-id="${cv.id}">les voir</button>.</p>`}
    <div class="exports">
      <button class="export" data-act="pdf" data-id="${cv.id}" data-ats="0"><span>🎨</span><b>PDF visuel</b><small>${esc(nom)}.pdf</small></button>
      <button class="export" data-act="pdf" data-id="${cv.id}" data-ats="1"><span>🤖</span><b>PDF ATS</b><small>une colonne, texte sélectionnable</small></button>
      <button class="export" data-act="docx" data-id="${cv.id}" data-ats="0"><span>📝</span><b>Word · DOCX</b><small>${esc(nom)}.docx</small></button>
      <button class="export" data-act="docx" data-id="${cv.id}" data-ats="1"><span>📄</span><b>DOCX ATS</b><small>sans couleur</small></button>
    </div>
    <div class="encart">📌 Suivez toujours le format demandé dans l'annonce : PDF ou DOCX.</div>
    <div class="actions"><button class="btn" data-act="fermer">Fermer</button></div>`);
};
function imprimer(html, titre) {
  const z = $('#impression');
  z.innerHTML = html;
  const ancien = document.title;
  document.title = titre;
  document.documentElement.classList.add('imprime');
  const fin = () => { document.documentElement.classList.remove('imprime'); z.innerHTML = ''; document.title = ancien; window.removeEventListener('afterprint', fin); };
  window.addEventListener('afterprint', fin);
  setTimeout(() => window.print(), 80);
}
function avecAstuce(suite) {
  if (NC.ETAT.vus.astucePdf) { fermerModale(); suite(); return; }
  NC._suitePdf = suite;
  ouvrirModale(`<h3 id="modaleTitre">🖨️ Enregistrer en PDF</h3>
    <ol class="puces-simple"><li>Dans la fenêtre qui s'ouvre, choisissez la destination <b>« Enregistrer au format PDF »</b>.</li>
    <li>Format <b>A4</b>, marges <b>par défaut</b> ou <b>aucune</b>.</li><li>Décochez <b>« En-têtes et pieds de page »</b> et cochez <b>« Graphiques d'arrière-plan »</b> pour garder les couleurs.</li>
    <li>Le nom du fichier est déjà proposé : il suffit de valider.</li></ol>
    <p class="muted petit">Le PDF obtenu contient du vrai texte, sélectionnable — jamais une image.</p>
    <div class="actions"><button class="btn primaire" data-act="suite-pdf">Compris, ouvrir l'impression</button></div>`);
}
ACT['suite-pdf'] = () => { NC.ETAT.vus.astucePdf = 1; NC.sauver(); fermerModale(); const s = NC._suitePdf; NC._suitePdf = null; if (s) s(); };
ACT.pdf = b => {
  const cv = cvDe(b), ats = b.dataset.ats === '1';
  avecAstuce(() => imprimer(NC.rendreCV(cv, ats), NC.nomFichier('CV', cv, cv.cible.poste || cv.titre)));
};
ACT.docx = b => {
  const cv = cvDe(b), ats = b.dataset.ats === '1';
  NC.telecharger(NC.docxCV(cv, ats), NC.nomFichier('CV', cv, cv.cible.poste || cv.titre) + '.docx');
  toast('📝 Document Word téléchargé.');
};

/* Adapter à une offre */
ACT.analyser = () => {
  const O = NC.ETAT.offre;
  if (!O || O.texte.trim().length < 40) { toast('Collez le texte complet de l\'annonce (quelques lignes au moins).', 'alerte'); return; }
  NC.sauver(); rendre();
  const r = $('.resultats'); if (r && window.innerWidth < 1000) r.scrollIntoView({ behavior: 'smooth' });
};
ACT['vider-offre'] = () => { NC.ETAT.offre = { texte: '', cvId: NC.ETAT.offre.cvId, entreprise: '', poste: '' }; NC.sauver(); rendre(); };
ACT['kw-ajouter'] = b => {
  const O = NC.ETAT.offre, cv = NC.cvParId(O.cvId) || NC.cvPrincipal(), l = b.dataset.l, g = b.dataset.g;
  confirmer(`Ajouter « <b>${esc(l)}</b> » à « ${esc(cv.nom)} » ?<br>Ne l'ajoutez que si cela correspond à votre expérience réelle : un recruteur peut vous interroger dessus.`, () => {
    if (g === 'logiciels') cv.logiciels.push(l);
    else if (g === 'qualites') cv.compRel.push(l);
    else if (g === 'langues') { cv.langues.push({ langue: l, niveau: '' }); toast('🌍 Précisez votre niveau à l\'étape Langues.'); }
    else if (g === 'permis') cv.perso.permis = 'Permis B';
    else cv.compTech.push(l);
    modifie(cv); rendre();
  }, 'Oui, je le maîtrise');
};
ACT['creer-version-offre'] = () => {
  const O = NC.ETAT.offre, src = NC.cvParId(O.cvId) || NC.cvPrincipal(), R = NC.derniereAnalyse;
  if (!R) return;
  const opt = id => { const c = $('#' + id); return c && c.checked; };
  const cv = clone(src);
  cv.id = uid(); cv.cree = cv.maj = NC.aujourdhui();
  const poste = R.titre || src.titre;
  cv.nom = ['CV', poste, O.entreprise].filter(Boolean).join(' — ');
  cv.cible = { poste, entreprise: O.entreprise, offre: O.texte };
  if (opt('optTitre') && R.titre) cv.titre = R.titre;
  if (opt('optAccroche')) { const a = $('#accrocheAdaptee'); if (a && a.value.trim()) cv.accroche = a.value.trim(); }
  if (opt('optOrdre')) cv.experiences.forEach(x => { const r = R.experiences.find(e => e.id === x.id); if (r) x.missions = r.missions.map(o => o.m); });
  if (O.entreprise && opt('optMarque')) appliquerMarque(cv, O.entreprise, true);
  NC.ETAT.cvs.push(cv);
  let cand = null;
  if (opt('optCand')) {
    cand = { id: uid(), cree: NC.aujourdhui(), poste, entreprise: O.entreprise, lien: '', contrat: R.contrat || '', statut: 'preparer', dateEnvoi: '', dateRelance: '', dateEntretien: '', heureEntretien: '', notes: '', cvId: cv.id, lettreId: '' };
    NC.ETAT.candidatures.push(cand);
  }
  if (opt('optLettre')) {
    const l = Object.assign(NC.lettreVide(cv), { entreprise: O.entreprise, poste, offre: O.texte });
    l.paragraphes = NC.genererLettre(l, cv);
    NC.ETAT.lettres.push(l); if (cand) cand.lettreId = l.id;
  }
  NC.UI.cvId = cv.id; NC.UI.etape = 'poste'; NC.sauver(); aller('cv');
  toast(`🎯 Version « ${esc(cv.nom)} » créée${cand ? ', candidature ajoutée au suivi' : ''}. Relisez chaque étape.`);
};

/* Lettres */
ACT['nouvelle-lettre'] = () => {
  const cv = NC.UI.vue === 'cv' ? NC.cvCourant() : NC.cvPrincipal();
  const l = NC.lettreVide(cv);
  if (cv.cible.entreprise) l.entreprise = cv.cible.entreprise;
  l.poste = cv.cible.poste || cv.titre || '';
  if (cv.cible.offre) l.offre = cv.cible.offre;
  NC.ETAT.lettres.push(l); NC.UI.lettreId = l.id; NC.sauver(); aller('lettres');
};
ACT['ouvrir-lettre'] = b => { NC.UI.lettreId = b.dataset.id; aller('lettres'); };
CHG['choisir-lettre'] = el => { NC.UI.lettreId = el.value; rendre(); };
ACT.ton = b => { const l = NC.lettreCourante(); l.ton = b.dataset.t; if (l.paragraphes.length) l.paragraphes = NC.genererLettre(l, NC.cvParId(l.cvId) || NC.cvPrincipal()); NC.sauver(); rendre(); };
ACT['format-lettre'] = b => { const l = NC.lettreCourante(); l.format = b.dataset.f; if (l.paragraphes.length) l.paragraphes = NC.genererLettre(l, NC.cvParId(l.cvId) || NC.cvPrincipal()); NC.sauver(); rendre(); };
ACT['generer-lettre'] = () => {
  const l = NC.lettreCourante(), cv = NC.cvParId(l.cvId) || NC.cvPrincipal();
  const go = () => { l.paragraphes = NC.genererLettre(l, cv); NC.sauver(); rendre(); toast('✨ Lettre préparée : complétez les [crochets] et relisez chaque phrase.'); };
  if (l.paragraphes.length) confirmer('Régénérer la lettre ? Vos modifications de paragraphes seront remplacées.', go, 'Régénérer'); else go();
};
ACT['regenerer-par'] = b => {
  const l = NC.lettreCourante(), cv = NC.cvParId(l.cvId) || NC.cvPrincipal(), i = +b.dataset.i;
  l._var = ((l._var || 0) + 1) % NC.TONS.length;
  const ton = NC.TONS[(NC.TONS.findIndex(t => t[0] === l.ton) + l._var) % NC.TONS.length][0];
  const neuf = NC.genererLettre(Object.assign({}, l, { ton }), cv);
  if (neuf[i]) { l.paragraphes[i] = neuf[i]; NC.sauver(); rendre(); toast('↻ Nouvelle proposition (inspirée du ton « ' + NC.TONS.find(t => t[0] === ton)[1].toLowerCase() + ' »).'); }
};
ACT['retirer-par'] = b => { const l = NC.lettreCourante(); l.paragraphes.splice(+b.dataset.i, 1); NC.sauver(); rendre(); };
ACT['ajouter-par'] = () => { const l = NC.lettreCourante(); l.paragraphes.splice(Math.max(0, l.paragraphes.length - 1), 0, ''); NC.sauver(); rendre(); };
ACT['supprimer-lettre'] = () => {
  const l = NC.lettreCourante();
  confirmer('Supprimer cette lettre ?', () => {
    NC.ETAT.lettres = NC.ETAT.lettres.filter(x => x.id !== l.id);
    NC.ETAT.candidatures.forEach(c => { if (c.lettreId === l.id) c.lettreId = ''; });
    NC.UI.lettreId = ''; NC.sauver(); rendre();
  });
};
const lettreDe = b => NC.lettreParId(b.dataset.id) || NC.lettreCourante();
ACT['pdf-lettre'] = b => {
  const l = lettreDe(b), cv = NC.cvParId(l.cvId) || NC.cvPrincipal();
  if (!l.paragraphes.length) { toast('Générez d\'abord la lettre.', 'alerte'); return; }
  const go = () => avecAstuce(() => imprimer(NC.rendreLettre(l, cv).replace(/<mark class="trou">|<\/mark>/g, ''), NC.nomFichier('Lettre_Motivation', cv, l.entreprise)));
  if (NC.trousLettre(l)) confirmer('Cette lettre contient encore des [éléments à compléter]. Exporter quand même ?', go, 'Exporter'); else go();
};
ACT['docx-lettre'] = b => {
  const l = lettreDe(b), cv = NC.cvParId(l.cvId) || NC.cvPrincipal();
  if (!l.paragraphes.length) { toast('Générez d\'abord la lettre.', 'alerte'); return; }
  NC.telecharger(NC.docxLettre(l, cv), NC.nomFichier('Lettre_Motivation', cv, l.entreprise) + '.docx');
  toast(NC.trousLettre(l) ? '📝 Téléchargée — pensez à compléter les [crochets] dans Word.' : '📝 Lettre téléchargée.');
};

/* Candidatures */
const candVide = () => ({ id: uid(), cree: NC.aujourdhui(), poste: '', entreprise: '', lien: '', contrat: '', statut: 'preparer', dateEnvoi: '', dateRelance: '', dateEntretien: '', heureEntretien: '', notes: '', cvId: NC.ETAT.principal, lettreId: '' });
ACT['nouvelle-candidature'] = () => NC.fenetreCandidature(candVide(), true);
ACT['modifier-cand'] = b => { const c = NC.ETAT.candidatures.find(x => x.id === b.dataset.id); if (c) NC.fenetreCandidature(clone(c), false); };
ACT['enregistrer-cand'] = b => {
  const c = NC.brouillonCand;
  if (!c.poste.trim() && !c.entreprise.trim()) { toast('Indiquez le poste ou l\'entreprise.', 'alerte'); return; }
  if (b.dataset.nouveau === '1') NC.ETAT.candidatures.push(c);
  else { const i = NC.ETAT.candidatures.findIndex(x => x.id === c.id); NC.ETAT.candidatures[i] = c; }
  NC.sauver(); fermerModale(); rendre(); majBulle(); toast('📋 Candidature enregistrée.');
};
ACT['supprimer-cand'] = b => confirmer('Supprimer cette candidature du suivi ?', () => { NC.ETAT.candidatures = NC.ETAT.candidatures.filter(c => c.id !== b.dataset.id); NC.sauver(); rendre(); majBulle(); });
CHG.statut = el => {
  const c = NC.ETAT.candidatures.find(x => x.id === el.dataset.id); if (!c) return;
  c.statut = el.value;
  if (c.statut === 'envoyee' && !c.dateEnvoi) { c.dateEnvoi = NC.aujourdhui(); if (!c.dateRelance) c.dateRelance = NC.plusJours(c.dateEnvoi, 10); }
  if (c.statut === 'relance' && !c.dateRelance) c.dateRelance = NC.aujourdhui();
  NC.sauver(); rendre(); majBulle();
  if (c.statut === 'entretien' && !c.dateEntretien) { NC.fenetreCandidature(clone(c), false); toast('🤝 Indiquez la date de l\'entretien.'); }
};
ACT.filtre = b => { NC.UI.filtre = b.dataset.f; rendre(); };
ACT.mois = b => { NC.UI.calMois = b.dataset.m; rendre(); };

/* Thème, calme, sauvegarde */
ACT.theme = () => {
  const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t; NC.ecrire('naocv.theme', t);
};
ACT.calme = () => {
  const c = document.documentElement.classList.toggle('calme');
  NC.ecrire('naocv.calme', c ? '1' : '0'); toast(c ? '🕊️ Animations en pause.' : '✨ Animations relancées.');
};
ACT.sauvegarder = () => {
  NC.sauver(true);
  NC.telecharger(new Blob([JSON.stringify(NC.ETAT, null, 1)], { type: 'application/json' }), 'NaoCV_sauvegarde_' + NC.aujourdhui() + '.json');
  toast('💾 Sauvegarde téléchargée.');
};
ACT.recharger = () => $('#fichierSauvegarde').click();

/* Réinitialiser : NaoCV redevient vierge, comme à la première ouverture. */
ACT.reinitialiser = () => {
  const E = NC.ETAT;
  const n = E.cvs.filter(c => c.titre || c.experiences.length || c.perso.nom).length;
  ouvrirModale(`<h3 id="modaleTitre">🧹 Réinitialiser NaoCV</h3>
    <p>NaoCV va redevenir <b>vierge</b>, comme pour une nouvelle personne. Seront effacés :</p>
    <ul class="puces-simple"><li>${n} CV et leurs versions, photos et logos compris</li><li>${E.lettres.length} lettre(s) de motivation</li>
    <li>${E.candidatures.length} candidature(s), relances et entretiens</li><li>l'offre analysée, le thème et les réglages</li></ul>
    <p class="attention">Cette action est définitive. Les autres outils de NaoGroup ne sont pas touchés.</p>
    <p class="muted petit">Conseil : téléchargez d'abord une sauvegarde — vous pourrez la recharger avec 📂.</p>
    <div class="actions"><button class="btn" data-act="fermer">Annuler</button><button class="btn" data-act="sauvegarder">💾 Sauvegarder d'abord</button>
    <button class="btn danger" data-act="reinitialiser-confirme">Tout effacer</button></div>`);
};
ACT['reinitialiser-confirme'] = () => {
  /* L'état vide d'abord : l'enregistrement de sortie de page n'écrira plus les anciennes données. */
  NC.ETAT = NC.reparer(null);
  /* Uniquement les clés de NaoCV, par leur nom : NaoGroup Cloud les range dans l'espace du profil connecté. */
  ['naocv.donnees', 'naocv.theme', 'naocv.calme'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  NC.sauver(true);
  location.hash = '#accueil';
  location.reload();
};
$('#fichierSauvegarde').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d || !Array.isArray(d.cvs)) throw new Error();
    confirmer('Remplacer toutes vos données NaoCV par cette sauvegarde ?', () => {
      NC.ETAT = NC.reparer(d); NC.UI.cvId = NC.ETAT.principal; NC.UI.lettreId = ''; NC.sauver(true); rendre(); majBulle(); toast('📂 Sauvegarde rechargée.');
    }, 'Remplacer');
  } catch (err) { toast('⚠️ Ce fichier n\'est pas une sauvegarde NaoCV.', 'alerte'); }
});

/* ---------- Le décor : feuilles, mallettes, stylos, enveloppes qui s'envolent ---------- */
const MOTIFS = {
  cv: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="9.3" cy="7.5" r="1.9"/><path d="M12.6 6.6h3.4M12.6 8.6h2.4M8 12.5h8M8 15.3h8M8 18.1h5"/>',
  doc: '<path d="M6 2.5h8.5l4 4v15H6z"/><path d="M14.5 2.5v4h4"/><path d="M9 11h6.5M9 14h6.5M9 17h4"/>',
  mallette: '<rect x="3" y="7" width="18" height="13" rx="2.2"/><path d="M9 7V5.2a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 5.2V7M3 12.5h18M11 12.5v2h2v-2"/>',
  stylo: '<path d="M4 20l1.2-4.4L16 4.8l3.2 3.2L8.4 18.8z"/><path d="M14 6.8l3.2 3.2M4 20l4.4-1.2"/>',
  trombone: '<path d="M16.5 7v9a4.5 4.5 0 0 1-9 0V6a3 3 0 0 1 6 0v9.5a1.5 1.5 0 0 1-3 0V8"/>',
  loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M8 10.5h5"/>',
  enveloppe: '<rect x="3" y="6" width="18" height="12.5" rx="2"/><path d="M3.6 7l8.4 6.2L20.4 7"/>',
  toque: '<path d="M2 9.5l10-4.5 10 4.5-10 4.5z"/><path d="M6 11.5v4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4M22 9.5v5"/>',
  coche: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16.2 9.6"/>',
  etoile: '<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.6l-5.3 2.9 1.1-6-4.4-4.2 6-.8z"/>',
  bulle: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9.3h8M8 12.3h5"/>',
  calendrier: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2"/>',
  cravate: '<path d="M10 3h4l-1 3.2 2 10.3-3 4-3-4 2-10.3z"/>',
  punaise: '<circle cx="12" cy="8" r="4.5"/><path d="M12 12.5V21"/>'
};
function decor() {
  const svg = $('#motifs'); if (!svg) return;
  const noms = Object.keys(MOTIFS);
  let graine = 7;
  const alea = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
  const n = window.innerWidth < 700 ? 14 : 26;
  let h = '';
  for (let i = 0; i < n; i++) {
    const nom = noms[i % noms.length], taille = 22 + Math.round(alea() * 24);
    const x = (4 + alea() * 92).toFixed(1), y = (4 + alea() * 90).toFixed(1);
    const op = (.08 + alea() * .14).toFixed(2), duree = (15 + alea() * 16).toFixed(1), delai = (-alea() * 20).toFixed(1);
    h += `<svg x="${x}%" y="${y}%" width="${taille}" height="${taille}" viewBox="0 0 24 24" overflow="visible"><g class="m" style="opacity:${op};animation-duration:${duree}s;animation-delay:${delai}s">${MOTIFS[nom]}</g></svg>`;
  }
  for (let i = 0; i < (window.innerWidth < 700 ? 10 : 22); i++) {
    const x = (alea() * 100).toFixed(1), y = (alea() * 100).toFixed(1);
    h += `<circle class="eclat" cx="${x}%" cy="${y}%" r="${(1 + alea() * 1.4).toFixed(1)}" style="animation-duration:${(3 + alea() * 4).toFixed(1)}s;animation-delay:${(-alea() * 6).toFixed(1)}s"/>`;
  }
  svg.innerHTML = h;
}
/* De temps en temps, une candidature part : une enveloppe traverse l'écran. */
function envol() {
  const r = document.documentElement;
  if (!r.classList.contains('calme') && !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const e = document.createElement('div');
    e.className = 'envol';
    const haut = 12 + Math.random() * 60, sens = Math.random() < .5;
    e.style.top = haut + 'vh';
    e.style.setProperty('--duree', (9 + Math.random() * 5).toFixed(1) + 's');
    if (sens) e.classList.add('retour');
    e.innerHTML = `<div class="envol-y"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12.5" rx="2"/><path d="M3.6 7l8.4 6.2L20.4 7"/></svg></div>`;
    $('#decor').appendChild(e);
    setTimeout(() => e.remove(), 15000);
  }
  setTimeout(envol, 9000 + Math.random() * 9000);
}

/* ---------- Démarrage ---------- */
NC.charger();
NC.UI.cvId = NC.ETAT.principal;
if (NC.ETAT.lettres.length) NC.UI.lettreId = NC.ETAT.lettres[NC.ETAT.lettres.length - 1].id;
$('#dlEntreprises').innerHTML = NC.ENTREPRISES.map(e => `<option value="${esc(e[0])}">`).join('');
onglets();
const depart = location.hash.replace('#', '');
if (NC.vues[depart]) NC.UI.vue = depart;
rendre();
decor();
setTimeout(envol, 3500);
window.addEventListener('hashchange', () => { const v = location.hash.replace('#', ''); if (NC.vues[v] && v !== NC.UI.vue) { NC.UI.vue = v; rendre(); } });
const dues = NC.relancesDues();
if (dues.length) setTimeout(() => toast(`🔔 ${dues.length} relance${dues.length > 1 ? 's' : ''} à faire aujourd'hui : ${dues.slice(0, 2).map(c => esc(c.entreprise || c.poste)).join(', ')}${dues.length > 2 ? '…' : ''}`), 900);
