# Assemble les sources de src/ en un seul fichier autonome : NaoCar.html.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naocar.css">', "<style>`n" + (& $lire 'naocar.css') + "</style>")
foreach ($js in 'nc-core.js', 'nc-vues.js', 'nc-app.js', 'nc-aide.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoCar.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoCar.html construit : $((Get-Item $sortie).Length) octets"
