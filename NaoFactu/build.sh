#!/bin/sh
# Assemble src/index.html + naofactu.css + les scripts nf-*.js en un seul
# fichier autonome : NaoFactu.html. À relancer après chaque modification de src/.
cd "$(dirname "$0")/src" || exit 1
awk '
/<link rel="stylesheet" href="[^"]+">/ {
  match($0, /href="[^"]+"/); f = substr($0, RSTART + 6, RLENGTH - 7)
  print "<style>"; while ((getline l < f) > 0) print l; close(f); print "</style>"; next }
/<script src="[^"]+"><\/script>/ {
  match($0, /src="[^"]+"/); f = substr($0, RSTART + 5, RLENGTH - 6)
  print "<script>"; while ((getline l < f) > 0) print l; close(f); print "</script>"; next }
{ print }
' index.html > ../NaoFactu.html
echo "NaoFactu.html construit : $(wc -c < ../NaoFactu.html) octets"
