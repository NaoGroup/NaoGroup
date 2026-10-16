# Génère l'icône Windows (naoroots.ico) à partir des mêmes tracés que le logo
# SVG de NaoRoots. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, violet profond → bleu-violet → lavande très claire.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Couleur '#4B2FB8'), (Couleur '#D4BEFA'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @((Couleur '#4B2FB8'), (Couleur '#7A70EC'), (Couleur '#D4BEFA'))
$mix.Positions = @([float]0, [float]0.52, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur lavande derrière l'arbre.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](11 * $k), [float](0.6 * $k), [float](18 * $k), [float](18 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(120, 241, 232, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 241, 232, 255))
$g.FillPath($pinceauHalo, $halo)

# Les deux racines, à demi transparentes.
$racines = New-Object System.Drawing.Drawing2D.GraphicsPath
Quad $racines 20 16.4 17.9 16.6 16.4 17.8
$racines.StartFigure()
Quad $racines 20 16.4 22.1 16.6 23.6 17.8
$g.DrawPath((New-Stylo ([System.Drawing.Color]::FromArgb(155, 255, 255, 255)) 1.15), $racines)

# Le tronc et les deux branches.
$blanc = New-Stylo ([System.Drawing.Color]::White) 1.6
$g.DrawLine($blanc, (Pt 20 16.4), (Pt 20 9.6))
$g.DrawLine($blanc, (Pt 20 12.6), (Pt 15.6 9.2))
$g.DrawLine($blanc, (Pt 20 11.2), (Pt 24.4 8))

# Deux générations, et la feuille qui monte.
$g.FillEllipse([System.Drawing.Brushes]::White, [float](13.2 * $k), [float](6.8 * $k), [float](3.8 * $k), [float](3.8 * $k))
$g.FillEllipse([System.Drawing.Brushes]::White, [float](23 * $k), [float](5.6 * $k), [float](3.8 * $k), [float](3.8 * $k))
$feuille = New-Object System.Drawing.Drawing2D.GraphicsPath
$feuille.AddBezier((Pt 20 3.6), (Pt 21.9 5.2), (Pt 22 7.6), (Pt 20 9.4))
$feuille.AddBezier((Pt 20 9.4), (Pt 18 7.6), (Pt 18.1 5.2), (Pt 20 3.6))
$feuille.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $feuille)
$g.DrawLine((New-Stylo (Couleur '#8A7CEE') 0.7), (Pt 20 5.2), (Pt 20 8.4))

# L'éclat, en haut à droite.
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(205, 255, 255, 255))), [float](30.3 * $k), [float](5.3 * $k), [float](2.2 * $k), [float](2.2 * $k))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naoroots.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
