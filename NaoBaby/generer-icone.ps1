# Génère l'icône Windows (naobaby.ico) à partir des mêmes tracés que le logo
# SVG de NaoBaby.html. À relancer si le logo change.
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File generer-icone.ps1
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

$S = 256; $k = $S / 40.0
function Pt { param($x, $y) New-Object System.Drawing.PointF([float]($x * $k), [float]($y * $k)) }
function Rect { param($x, $y, $l, $h) New-Object System.Drawing.RectangleF([float]($x * $k), [float]($y * $k), [float]($l * $k), [float]($h * $k)) }
function Coul { param($hex, $a = 255) [System.Drawing.Color]::FromArgb($a, [System.Drawing.ColorTranslator]::FromHtml($hex)) }

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, violet profond → bleu-violet → lavande → rose poudré.
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Coul '#5A44CC'), (Coul '#EBC3E0'))
$melange = New-Object System.Drawing.Drawing2D.ColorBlend(4)
$melange.Colors = @((Coul '#5A44CC'), (Coul '#8C7BEA'), (Coul '#C3A6F4'), (Coul '#EBC3E0'))
$melange.Positions = @([float]0, [float]0.45, [float]0.8, [float]1)
$fond.InterpolationColors = $melange
$g.FillPath($fond, $jeton)

# Le halo doux derrière l'étoile.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse((Rect 13.6 1 12.8 12.8))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(110, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# L'accent : un croissant de lune couché (le berceau), en blanc à 55 %.
$lune = New-Object System.Drawing.Drawing2D.GraphicsPath
$lune.AddArc((Rect 11 0 18 13.6), 180, -180)
$lune.AddArc((Rect 11 3.2 18 7.2), 0, 180)
$lune.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 255, 255))), $lune)

# La petite étoile bercée, pleine.
$etoile = New-Object System.Drawing.Drawing2D.GraphicsPath
$etoile.AddBezier((Pt 20 3.5), (Pt 20.29 5.15), (Pt 21.25 6.11), (Pt 22.9 6.4))
$etoile.AddBezier((Pt 22.9 6.4), (Pt 21.25 6.69), (Pt 20.29 7.65), (Pt 20 9.3))
$etoile.AddBezier((Pt 20 9.3), (Pt 19.71 7.65), (Pt 18.75 6.69), (Pt 17.1 6.4))
$etoile.AddBezier((Pt 17.1 6.4), (Pt 18.75 6.11), (Pt 19.71 5.15), (Pt 20 3.5))
$etoile.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $etoile)

# Le N de la famille, d'un seul tracé.
$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](4.2 * $k))
$stylo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $stylo.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$stylo.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLines($stylo, @((Pt 12 31.5), (Pt 12 18.5), (Pt 28 31.5), (Pt 28 18.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naobaby.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
