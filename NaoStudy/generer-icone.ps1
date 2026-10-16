# Génère l'icône Windows (naostudy.ico) à partir des mêmes tracés que le logo
# SVG de NaoStudy. À relancer si le logo change.
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
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Couleur '#4B34C8'), (Couleur '#CDB4F8'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @((Couleur '#4B34C8'), (Couleur '#7A7CF0'), (Couleur '#CDB4F8'))
$mix.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur lavande derrière le livre.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](10.6 * $k), [float](0.2 * $k), [float](18.8 * $k), [float](18.8 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(120, 239, 230, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 239, 230, 255))
$g.FillPath($pinceauHalo, $halo)

# Le livre ouvert : la page de gauche en blanc plein, celle de droite à demi transparente.
function Page { param([double]$s)
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddBezier((Pt 20 8.1), (Pt (20 + $s * 2.4) 6.5), (Pt (20 + $s * 5.3) 6), (Pt (20 + $s * 8.2) 6.4))
    $p.AddLine((Pt (20 + $s * 8.2) 6.4), (Pt (20 + $s * 8.2) 14.4))
    $p.AddBezier((Pt (20 + $s * 8.2) 14.4), (Pt (20 + $s * 5.3) 14), (Pt (20 + $s * 2.4) 14.5), (Pt 20 16.1))
    $p.CloseFigure(); $p
}
$g.FillPath([System.Drawing.Brushes]::White, (Page -1))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(199, 255, 255, 255))), (Page 1))
$g.DrawLine((New-Stylo (Couleur '#8A7CEE') 0.9), (Pt 20 8.1), (Pt 20 16.1))

# L'étoile de connaissance qui s'élève du livre.
$etoile = New-Object System.Drawing.Drawing2D.GraphicsPath
Quad $etoile 20 1.4 20.3 3.3 22 3.6
Quad $etoile 22 3.6 20.3 3.9 20 5.8
Quad $etoile 20 5.8 19.7 3.9 18 3.6
Quad $etoile 18 3.6 19.7 3.3 20 1.4
$etoile.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $etoile)

# L'éclat, en haut à droite.
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(205, 255, 255, 255))), [float](30.55 * $k), [float](5.15 * $k), [float](2.1 * $k), [float](2.1 * $k))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naostudy.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
