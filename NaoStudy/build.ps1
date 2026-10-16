# Assemble les sources de src/ en un seul fichier autonome : NaoStudy.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naostudy.css">', "<style>`n" + (& $lire 'naostudy.css') + "</style>")
foreach ($js in 'ns-core.js', 'ns-vues.js', 'ns-app.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoStudy.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoStudy.html construit : $((Get-Item $sortie).Length) octets"
