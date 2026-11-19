# Assemble les sources de src/ en un seul fichier autonome : NaoCV.html.
# Aucune bibliothèque externe : l'export Word (.docx) et la lecture des .docx
# importés sont faits maison, l'outil marche sans connexion.
# À relancer après chaque modification de src/ :
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File build.ps1
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $dossier 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$lire = { param($nom) [IO.File]::ReadAllText((Join-Path $src $nom), $utf8) }

$html = & $lire 'index.html'
$html = $html.Replace('<link rel="stylesheet" href="naocv.css">', "<style>`n" + (& $lire 'naocv.css') + "</style>")
# pdf.js (1,5 Mo) ne sert qu'à importer un CV en PDF : il n'est plus embarqué dans la page, mais copié
# à côté, dans lib/, et chargé au premier import (balise <script>, donc aussi en double-clic).
$html = $html.Replace('@@PDFJS@@', '').Replace('@@PDFWORKER@@', '')
$lib = Join-Path $dossier 'lib'
New-Item -ItemType Directory -Force $lib | Out-Null
Copy-Item (Join-Path $src 'lib\pdf.min.js'), (Join-Path $src 'lib\pdf.worker.min.js') $lib -Force
foreach ($js in 'nc-core.js', 'nc-savoir.js', 'nc-cv.js', 'nc-vues.js', 'nc-app.js', 'nc-aide.js') {
    $html = $html.Replace("<script src=`"$js`"></script>", "<script>`n" + (& $lire $js) + "</script>")
}
$sortie = Join-Path $dossier 'NaoCV.html'
[IO.File]::WriteAllText($sortie, $html, $utf8)
"NaoCV.html construit : $((Get-Item $sortie).Length) octets"
