#!/bin/sh
# Assemble src/index.html + la feuille de style + les quatre scripts
# (moteur, 3D, lecture d'image, interface) en un seul fichier autonome :
# NaoPlan.html. À relancer après chaque modification de src/.
cd "$(dirname "$0")/src" || exit 1
awk '
/<link rel="stylesheet" href="naoplan.css">/ {
  print "<style>"; while ((getline l < "naoplan.css") > 0) print l; print "</style>"; next }
/<script src="naoplan-moteur.js"><\/script>/ {
  print "<script>"; while ((getline l < "naoplan-moteur.js") > 0) print l; print "</script>"; next }
/<script src="naoplan-3d.js"><\/script>/ {
  print "<script>"; while ((getline l < "naoplan-3d.js") > 0) print l; print "</script>"; next }
/<script src="naoplan-lecture.js"><\/script>/ {
  print "<script>"; while ((getline l < "naoplan-lecture.js") > 0) print l; print "</script>"; next }
/<script src="naoplan-meubles.js"><\/script>/ {
  print "<script>"; while ((getline l < "naoplan-meubles.js") > 0) print l; print "</script>"; next }
/<script src="naoplan.js"><\/script>/ {
  print "<script>"; while ((getline l < "naoplan.js") > 0) print l; print "</script>"; next }
{ print }
' index.html > ../NaoPlan.html
echo "NaoPlan.html construit : $(wc -c < ../NaoPlan.html) octets"
