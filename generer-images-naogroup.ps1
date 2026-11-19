# Produit les images de la marque NaoGroup à partir de images-naogroup.html (les vrais logos SVG),
# photographiées par Chrome ou Edge sans fenêtre :
#   icones/ : aperçu de partage (og), icônes de l'application installable (192, 512, maskable, Apple)
#   logo/   : logo carré, logo sans fond, Instagram, couverture LinkedIn
# À relancer si le logo ou les couleurs changent :
#   powershell -NoProfile -ExecutionPolicy Bypass -File generer-images-naogroup.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$nav = @('C:\Program Files\Google\Chrome\Application\chrome.exe',
         'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $nav) { throw 'Ni Chrome ni Edge trouvé.' }
$page = ([Uri](Join-Path $dossier 'images-naogroup.html')).AbsoluteUri
$profil = Join-Path $env:TEMP 'naogroup-images-profil'

function Photo($f, $w, $h, $sortie) {
    $chemin = Join-Path $dossier $sortie
    New-Item -ItemType Directory -Force (Split-Path $chemin) | Out-Null
    $tmp = Join-Path $env:TEMP ("ng-" + [IO.Path]::GetFileName($sortie))
    if (Test-Path $tmp) { Remove-Item $tmp -Force }
    # le navigateur écrit des avertissements sans gravité : on les ignore
    $args_ = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', "--user-data-dir=$profil",
               '--default-background-color=00000000', '--virtual-time-budget=3000', "--window-size=$w,$h", "--screenshot=$tmp", "$page`?f=$f")
    Start-Process -FilePath $nav -ArgumentList $args_ -Wait -WindowStyle Hidden -RedirectStandardError (Join-Path $env:TEMP 'ng-images-err.txt')
    $t = 0; while (-not (Test-Path $tmp) -and $t -lt 50) { Start-Sleep -Milliseconds 200; $t++ }
    if (-not (Test-Path $tmp)) { throw "Capture ratée : $sortie" }
    Move-Item $tmp $chemin -Force
    "  $sortie ($w x $h)"
}
# l'icône à 192 px : réduction propre de celle à 512 px
function Reduire($source, $taille, $sortie) {
    $src = [System.Drawing.Image]::FromFile((Join-Path $dossier $source))
    $bmp = New-Object System.Drawing.Bitmap($taille, $taille, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $taille, $taille)
    $bmp.Save((Join-Path $dossier $sortie), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $src.Dispose()
    "  $sortie ($taille x $taille)"
}

"Images NaoGroup :"
Photo 'og'          1200 630 'icones\naogroup-apercu.png'
Photo 'icone'        512 512 'icones\naogroup-512.png'
Reduire 'icones\naogroup-512.png' 192 'icones\naogroup-192.png'
Photo 'maskable'     512 512 'icones\naogroup-maskable-512.png'
Photo 'apple'        180 180 'icones\apple-touch-icon.png'
Photo 'carre'        512 512 'logo\naogroup-logo-carre.png'
Photo 'transparent'  512 512 'logo\naogroup-logo-fond-transparent.png'
Photo 'instagram'   1080 1080 'logo\naogroup-logo-instagram.png'
Photo 'linkedin'    1584 396 'logo\naogroup-couverture-linkedin.png'
