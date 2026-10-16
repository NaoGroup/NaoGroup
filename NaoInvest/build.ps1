# Assemble les sources de src/ en un seul fichier autonome : NaoInvest.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naoinvest.css">', "<style>`n" + (& $lire 'naoinvest.css') + "</style>")
foreach ($js in 'ni-contenu.js', 'ni-impots.js', 'ni-placements.js', 'ni-conseils.js', 'ni-vie.js', 'ni-paie.js', 'ni-core.js', 'ni-vues.js', 'ni-docs-impots.js', 'ni-cours-impots.js', 'ni-app.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoInvest.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoInvest.html construit : $((Get-Item $sortie).Length) octets"
