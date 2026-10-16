# Assemble les sources de src/ en un seul fichier autonome : NaoRoots.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naoroots.css">', "<style>`n" + (& $lire 'naoroots.css') + "</style>")
foreach ($js in 'nr-core.js', 'nr-arbre.js', 'nr-vues.js', 'nr-app.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoRoots.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoRoots.html construit : $((Get-Item $sortie).Length) octets"
