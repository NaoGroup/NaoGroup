# Assemble les sources de src/ en un seul fichier autonome : NaoDaily.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naodaily.css">', "<style>`n" + (& $lire 'naodaily.css') + "</style>")
foreach ($js in 'nd-core.js', 'nd-vues.js', 'nd-nutrition.js', 'nd-recettes.js', 'nd-app.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoDaily.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoDaily.html construit : $((Get-Item $sortie).Length) octets"
