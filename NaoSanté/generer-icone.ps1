# Génère l'icône Windows (naosante.ico) à partir des mêmes tracés que le logo
# SVG de NaoSanté. À relancer si le logo change.
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

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, violet profond → lavande → bleu clair.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Couleur '#4B36C6'), (Couleur '#A9D6F6'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @((Couleur '#4B36C6'), (Couleur '#9A84EE'), (Couleur '#A9D6F6'))
$mix.Positions = @([float]0, [float]0.55, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur douce derrière le cœur.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](20.2 * $k), [float](3.2 * $k), [float](14.4 * $k), [float](14.4 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(120, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# La ligne de pulsation, à demi transparente.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::FromArgb(140, 255, 255, 255)) 2.1), @((Pt 7.6 10.6), (Pt 11.6 10.6), (Pt 13.4 7), (Pt 15.9 14.4), (Pt 17.8 10.6), (Pt 20.2 10.6)))

# Le petit cœur, en blanc plein : deux arcs et une pointe.
$coeur = New-Object System.Drawing.Drawing2D.GraphicsPath
$coeur.AddBezier((Pt 27.4 14.8), (Pt 23.9 12.5), (Pt 22.6 10.7), (Pt 22.6 8.9))
$coeur.AddArc([float](22.6 * $k), [float](6.3 * $k), [float](4.8 * $k), [float](4.8 * $k), 180, 180)
$coeur.AddArc([float](27.4 * $k), [float](6.3 * $k), [float](4.8 * $k), [float](4.8 * $k), 180, 180)
$coeur.AddBezier((Pt 32.2 8.9), (Pt 32.2 10.7), (Pt 30.9 12.5), (Pt 27.4 14.8))
$coeur.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $coeur)

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naosante.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
