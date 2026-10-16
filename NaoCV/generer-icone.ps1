# Génère l'icône Windows (naocv.ico) à partir des mêmes tracés que le logo
# SVG de NaoCV. À relancer si le logo change.
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

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, dégradé indigo → pervenche → bleu ciel.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
    [System.Drawing.ColorTranslator]::FromHtml('#4A3DC4'), [System.Drawing.ColorTranslator]::FromHtml('#9FD0F2'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#4A3DC4'), [System.Drawing.ColorTranslator]::FromHtml('#7C7BE8'), [System.Drawing.ColorTranslator]::FromHtml('#9FD0F2'))
$mix.Positions = @([float]0, [float]0.55, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur derrière l'éclat.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](23.4 * $k), [float](4 * $k), [float](11.2 * $k), [float](11.2 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(140, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# La carte de profil : une photo, deux lignes.
$blanc = [System.Drawing.Color]::FromArgb(240, 255, 255, 255)
$g.FillPath((New-Object System.Drawing.SolidBrush($blanc)), (Arrondi ([float](7.4 * $k)) ([float](5.4 * $k)) ([float](13.4 * $k)) ([float](8.8 * $k)) ([float](2.1 * $k))))
$encre = [System.Drawing.Color]::FromArgb(185, 106, 98, 218)
$g.FillEllipse((New-Object System.Drawing.SolidBrush($encre)), [float](9.2 * $k), [float](7.7 * $k), [float](4.2 * $k), [float](4.2 * $k))
$ligne = New-Stylo ([System.Drawing.Color]::FromArgb(155, 106, 98, 218)) 1.05
$g.DrawLine($ligne, (Pt 14.6 8.5), (Pt 18.4 8.5)); $g.DrawLine($ligne, (Pt 14.6 11.2), (Pt 17 11.2))

# L'éclat : une étoile à quatre branches, en blanc plein.
$eclat = New-Object System.Drawing.Drawing2D.GraphicsPath
$eclat.AddBezier((Pt 29 5.2), (Pt 29.3 7.6), (Pt 29.5 9.1), (Pt 33.4 9.6))
$eclat.AddBezier((Pt 33.4 9.6), (Pt 29.5 10.1), (Pt 29.3 11.6), (Pt 29 14))
$eclat.AddBezier((Pt 29 14), (Pt 28.7 11.6), (Pt 28.5 10.1), (Pt 24.6 9.6))
$eclat.AddBezier((Pt 24.6 9.6), (Pt 28.5 9.1), (Pt 28.7 7.6), (Pt 29 5.2))
$eclat.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $eclat)

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naocv.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Close(); $fs.Close()
"Icône créée : $f"
