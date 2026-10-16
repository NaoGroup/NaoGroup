#!/bin/sh
# Assemble les sources de src/ en un seul fichier : NaoBudget.html.
# À relancer après chaque modification de src/.
cd "$(dirname "$0")/src" || exit 1
awk '
/<link rel="stylesheet" href="naobudget.css">/ {
  print "<style>"; while ((getline l < "naobudget.css") > 0) print l; print "</style>"; next }
/<script src="naobudget-import.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-import.js") > 0) print l; print "</script>"; next }
/<script src="naobudget-print.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-print.js") > 0) print l; print "</script>"; next }
/<script src="naobudget-humour.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-humour.js") > 0) print l; print "</script>"; next }
/<script src="naobudget-banque.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-banque.js") > 0) print l; print "</script>"; next }
/<script src="naobudget-copie.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-copie.js") > 0) print l; print "</script>"; next }
/<script src="naobudget-notes.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget-notes.js") > 0) print l; print "</script>"; next }
/<script src="naobudget.js"><\/script>/ {
  print "<script>"; while ((getline l < "naobudget.js") > 0) print l; print "</script>"; next }
{ print }
' index.html > ../NaoBudget.html
echo "NaoBudget.html construit : $(wc -c < ../NaoBudget.html) octets"
