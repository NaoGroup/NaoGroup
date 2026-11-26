# Assemble les sources de src/ en un seul fichier autonome : NaoHome.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naohome.css">', "<style>`n" + (& $lire 'naohome.css') + "</style>")
foreach ($js in 'nh-core.js', 'nh-vues.js', 'nh-app.js', 'nh-aide.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoHome.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoHome.html construit : $((Get-Item $sortie).Length) octets"
