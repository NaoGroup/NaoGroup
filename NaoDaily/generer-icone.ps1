# Génère l'icône Windows (naodaily.ico) à partir des mêmes tracés que le logo
# SVG de NaoDaily. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, violet profond → bleu-violet → lavande.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Couleur '#4F37C9'), (Couleur '#C7B1F7'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @((Couleur '#4F37C9'), (Couleur '#6F7FEF'), (Couleur '#C7B1F7'))
$mix.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur lavande derrière le cercle de planning.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](20.5 * $k), [float](2.5 * $k), [float](14 * $k), [float](14 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(110, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# Les trois points bien rangés.
$points = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 255, 255))
foreach ($cx in 9.8, 14.2, 18.6) { $g.FillEllipse($points, [float](($cx - 1.7) * $k), [float](7.8 * $k), [float](3.4 * $k), [float](3.4 * $k)) }

# Le cercle de planning : la piste à demi transparente, puis les trois quarts parcourus.
$cadre = New-Object System.Drawing.RectangleF([float](22.9 * $k), [float](4.9 * $k), [float](9.2 * $k), [float](9.2 * $k))
$g.DrawEllipse((New-Stylo ([System.Drawing.Color]::FromArgb(90, 255, 255, 255)) 2.2), $cadre)
$g.DrawArc((New-Stylo ([System.Drawing.Color]::White) 2.2), $cadre, -90, 270)

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naodaily.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
