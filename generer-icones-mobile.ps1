# Génère les icônes d'installation (téléphone/tablette) de NaoFactu, NaoPlan
# et NaoLang : icon-192.png, icon-512.png, icon-512-maskable.png (avec la
# marge de sécurité que demandent Android) et apple-touch-icon.png pour iOS.
# Reprend exactement les tracés déjà utilisés pour les icônes .ico de bureau.
#   clic droit → « Exécuter avec PowerShell », ou :
#   powershell -ExecutionPolicy Bypass -File generer-icones-mobile.ps1
# À relancer si un logo change.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$racine = Split-Path -Parent $MyInvocation.MyCommand.Path

function New-Stylo { param($Couleur, $Largeur)
  $p = New-Object System.Drawing.Pen($Couleur, [float]$Largeur)
  $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
  $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $p
}

# Dessine le jeton (carré 40, rayon 13, dégradé) dans un carré de $S pixels,
# avec $marge de vide tout autour (la « zone de sécurité » maskable d'Android :
# les lanceurs peuvent découper l'icône en cercle, en carré arrondi, etc. —
# le contenu doit tenir dans les 80 % centraux).
function Dessiner-Jeton {
  param([System.Drawing.Graphics]$g, [int]$S, [int]$Marge, [string[]]$Couleurs, [float[]]$Positions)
  $zone = $S - 2 * $Marge
  $k = $zone / 40.0
  $r = [int](13 * $k); $d = $r * 2
  $jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
  $jeton.AddArc($Marge, $Marge, $d, $d, 180, 90)
  $jeton.AddArc($Marge + $zone - $d, $Marge, $d, $d, 270, 90)
  $jeton.AddArc($Marge + $zone - $d, $Marge + $zone - $d, $d, $d, 0, 90)
  $jeton.AddArc($Marge, $Marge + $zone - $d, $d, $d, 90, 90)
  $jeton.CloseFigure()
  $p1 = [System.Drawing.Point]::new([int]$Marge, [int]$Marge)
  $p2 = [System.Drawing.Point]::new([int]($Marge + $zone), [int]($Marge + $zone))
  $brosse = [System.Drawing.Drawing2D.LinearGradientBrush]::new($p1, $p2, [System.Drawing.Color]::Black, [System.Drawing.Color]::White)
  if ($Couleurs.Count -eq 2) {
    $brosse.LinearColors = @([System.Drawing.ColorTranslator]::FromHtml($Couleurs[0]), [System.Drawing.ColorTranslator]::FromHtml($Couleurs[1]))
  } else {
    $blend = New-Object System.Drawing.Drawing2D.ColorBlend($Couleurs.Count)
    $blend.Colors = @($Couleurs | ForEach-Object { [System.Drawing.ColorTranslator]::FromHtml($_) })
    $blend.Positions = $Positions
    $brosse.InterpolationColors = $blend
  }
  $g.FillPath($brosse, $jeton)
  return @{ k = $k; d = $Marge }   # d = décalage à ajouter à chaque coordonnée du tracé (0..40)
}

function Pt { param($x, $y, $Echelle) [System.Drawing.PointF]::new([float]($Echelle.d + $x * $Echelle.k), [float]($Echelle.d + $y * $Echelle.k)) }

function Enregistrer-Png { param([System.Drawing.Bitmap]$Bmp, [string]$Chemin)
  $dossier = Split-Path -Parent $Chemin
  if (-not (Test-Path $dossier)) { New-Item -ItemType Directory -Path $dossier | Out-Null }
  $Bmp.Save($Chemin, [System.Drawing.Imaging.ImageFormat]::Png)
}

# ---------- Le dessin propre à chaque outil (N + accent), sur l'échelle $ech ----------
function Dessin-NaoFactu { param($g, $ech)
  $demi = New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) (2.8 * $ech.k)
  $g.DrawLine($demi, (Pt 9.5 11.8 $ech), (Pt 19 11.8 $ech))
  $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (2.8 * $ech.k)), @((Pt 23.2 11.4 $ech), (Pt 26 14.2 $ech), (Pt 31 8.6 $ech)))
  $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (4.2 * $ech.k)), @((Pt 12 31.5 $ech), (Pt 12 18.5 $ech), (Pt 28 31.5 $ech), (Pt 28 18.5 $ech)))
}
function Dessin-NaoPlan { param($g, $ech)
  $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (4.2 * $ech.k)), @((Pt 12.5 31 $ech), (Pt 12.5 20.5 $ech), (Pt 27.5 31 $ech), (Pt 27.5 19.5 $ech)))
  $g.DrawLines((New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) (2.8 * $ech.k)), @((Pt 7.5 16.5 $ech), (Pt 20 8.5 $ech), (Pt 32.5 16.5 $ech)))
}
function Dessin-NaoLang { param($g, $ech)
  # Le tilde : deux courbes de Bézier bout à bout (M...C...S...), comme dans le logo SVG.
  $stylo = New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) (2.8 * $ech.k)
  $pts = @((Pt 10.5 13.2 $ech), (Pt 13 9.6 $ech), (Pt 16.2 9.6 $ech), (Pt 19.6 12.2 $ech), (Pt 23 14.8 $ech), (Pt 26.4 14.8 $ech), (Pt 29.5 11 $ech))
  $g.DrawBeziers($stylo, $pts)
  $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (4.2 * $ech.k)), @((Pt 12 31.5 $ech), (Pt 12 18.5 $ech), (Pt 28 31.5 $ech), (Pt 28 18.5 $ech)))
}

# ---------- Le catalogue des 3 outils du lancement ----------
$outils = @(
  @{ Dossier = 'NaoFactu'; Couleurs = @('#4E36C4', '#A488F1', '#7C8BF0'); Positions = @(0, 0.55, 1); Dessin = ${function:Dessin-NaoFactu} },
  @{ Dossier = 'NaoPlan';  Couleurs = @('#7A4FD6', '#BE9AF4'); Positions = $null; Dessin = ${function:Dessin-NaoPlan} },
  @{ Dossier = 'NaoLang';  Couleurs = @('#5E4BD4', '#BBA5F6'); Positions = $null; Dessin = ${function:Dessin-NaoLang} }
)

foreach ($outil in $outils) {
  $dossierIcones = Join-Path (Join-Path $racine $outil.Dossier) 'icons'
  Write-Host "== $($outil.Dossier)"

  # icon-192 et icon-512 : le jeton remplit tout le carré (comme le favicon existant).
  foreach ($taille in 192, 512) {
    $bmp = New-Object System.Drawing.Bitmap($taille, $taille, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $ech = Dessiner-Jeton -g $g -S $taille -Marge 0 -Couleurs $outil.Couleurs -Positions $outil.Positions
    & $outil.Dessin $g $ech
    $g.Dispose()
    Enregistrer-Png $bmp (Join-Path $dossierIcones "icon-$taille.png")
    $bmp.Dispose()
    "  icon-$taille.png"
  }

  # icon-512-maskable : le jeton est réduit avec une marge de sécurité (~20 %),
  # pour ne pas être rogné quand Android découpe l'icône en cercle ou en carré.
  $bmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $fond = [System.Drawing.ColorTranslator]::FromHtml('#1C1636')
  $g.Clear($fond)
  $ech = Dessiner-Jeton -g $g -S 512 -Marge 52 -Couleurs $outil.Couleurs -Positions $outil.Positions
  & $outil.Dessin $g $ech
  $g.Dispose()
  Enregistrer-Png $bmp (Join-Path $dossierIcones 'icon-512-maskable.png')
  $bmp.Dispose()
  "  icon-512-maskable.png"

  # apple-touch-icon (180) : iOS n'utilise pas le manifeste, seulement cette balise ;
  # comme le favicon existant, le jeton remplit tout le carré.
  $bmp = New-Object System.Drawing.Bitmap(180, 180, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $ech = Dessiner-Jeton -g $g -S 180 -Marge 0 -Couleurs $outil.Couleurs -Positions $outil.Positions
  & $outil.Dessin $g $ech
  $g.Dispose()
  Enregistrer-Png $bmp (Join-Path (Join-Path $racine $outil.Dossier) 'apple-touch-icon.png')
  $bmp.Dispose()
  "  apple-touch-icon.png (à la racine du dossier de l'outil)"
}
"Terminé."
