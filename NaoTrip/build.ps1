# Assemble les sources de src/ en un seul fichier autonome : NaoTrip.html.
# Les bibliothèques de carte (d3-geo, topojson) et les contours des pays
# sont intégrés : le globe marche sans connexion.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naotrip.css">', "<style>`n" + (& $lire 'naotrip.css') + "</style>")
$html = $html.Replace('@@MONDE@@', (& $lire 'donnees/monde-110m.json').Trim())
$html = $html.Replace('@@PAYS@@', (& $lire 'donnees/pays.json').Trim())
foreach ($js in 'lib/d3-array.min.js', 'lib/d3-geo.min.js', 'lib/topojson-client.min.js', 'nt-core.js', 'nt-monde.js', 'nt-vues.js', 'nt-app.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoTrip.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoTrip.html construit : $((Get-Item $sortie).Length) octets"
