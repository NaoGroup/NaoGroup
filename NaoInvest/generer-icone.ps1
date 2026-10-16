# Génère l'icône Windows (naoinvest.ico) à partir des mêmes tracés que le logo
# SVG de NaoInvest. À relancer si le logo change.
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File generer-icone.ps1
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

$S = 256; $k = $S / 40.0
function Pt { param($x, $y) New-Object System.Drawing.PointF([float]($x * $k), [float]($y * $k)) }
function New-Stylo { param($couleur, $largeur)
    $p = New-Object System.Drawing.Pen($couleur, [float]($largeur * $k))
    $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $p.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $p
}
function Arrondi { param($x, $y, $w, $h, $r)
    $g = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $g.AddArc($x, $y, $d, $d, 180, 90); $g.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $g.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $g.AddArc($x, $y + $h - $d, $d, $d, 90, 90); $g.CloseFigure()
    $g
}
function Couleur { param($hex) [System.Drawing.ColorTranslator]::FromHtml($hex) }
# Une courbe quadratique (Q du SVG) convertie en courbe de Bézier cubique.
function Quad { param($chemin, $x0, $y0, $cx, $cy, $x1, $y1)
    $chemin.AddBezier((Pt $x0 $y0), (Pt ($x0 + 2 / 3 * ($cx - $x0)) ($y0 + 2 / 3 * ($cy - $y0))), (Pt ($x1 + 2 / 3 * ($cx - $x1)) ($y1 + 2 / 3 * ($cy - $y1))), (Pt $x1 $y1))
}

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, violet profond → bleu-violet → lavande.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Couleur '#3F2CB9'), (Couleur '#CDB3F8'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @((Couleur '#3F2CB9'), (Couleur '#6C78EE'), (Couleur '#CDB3F8'))
$mix.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur lavande derrière l'étoile.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](18.4 * $k), [float](0.6 * $k), [float](16 * $k), [float](16 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(140, 239, 230, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 239, 230, 255))
$g.FillPath($pinceauHalo, $halo)

# Les trois petites barres qui montent doucement, à demi transparentes.
$demi = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 255, 255))
foreach ($b in @(@(8, 12.2, 3.8), @(12.4, 10, 6), @(16.8, 7.8, 8.2))) {
    $g.FillPath($demi, (Arrondi ([float]($b[0] * $k)) ([float]($b[1] * $k)) ([float](2.8 * $k)) ([float]($b[2] * $k)) ([float](1.1 * $k))))
}

# L'étoile qui s'élève, en blanc plein.
$etoile = New-Object System.Drawing.Drawing2D.GraphicsPath
Quad $etoile 26.4 3.4 26.9 8 31.4 8.6
Quad $etoile 31.4 8.6 26.9 9.2 26.4 13.8
Quad $etoile 26.4 13.8 25.9 9.2 21.4 8.6
Quad $etoile 21.4 8.6 25.9 8 26.4 3.4
$etoile.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $etoile)

# L'éclat, en haut à droite.
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 255, 255, 255))), [float](32.2 * $k), [float](3.4 * $k), [float](2 * $k), [float](2 * $k))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naoinvest.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
