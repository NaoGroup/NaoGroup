# Génère l'icône Windows (naopassword.ico) à partir des mêmes tracés que le logo
# SVG de NaoPassword (un petit cadenas au-dessus du N). À relancer si le logo change.
#   clic droit → « Exécuter avec PowerShell », ou :
#   powershell -NoProfile -ExecutionPolicy Bypass -File generer-icone.ps1
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

# Le jeton : carré de 40, rayon 13, dégradé turquoise → violet → lilas rosé.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
    [System.Drawing.ColorTranslator]::FromHtml('#17C9C0'), [System.Drawing.ColorTranslator]::FromHtml('#E99BFF'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#17C9C0'), [System.Drawing.ColorTranslator]::FromHtml('#7A4FF0'), [System.Drawing.ColorTranslator]::FromHtml('#E99BFF'))
$mix.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur derrière le cadenas.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](11.4 * $k), [float](1.6 * $k), [float](17.2 * $k), [float](17.2 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(110, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# L'anse, à demi transparente : deux branches et un demi-cercle de rayon 3,4 centré en (20 ; 7,6).
$anse = New-Object System.Drawing.Drawing2D.GraphicsPath
$anse.AddLine((Pt 16.6 9.4), (Pt 16.6 7.6))
$anse.AddArc([float](16.6 * $k), [float](4.2 * $k), [float](6.8 * $k), [float](6.8 * $k), 180, 180)
$anse.AddLine((Pt 23.4 7.6), (Pt 23.4 9.4))
$g.DrawPath((New-Stylo ([System.Drawing.Color]::FromArgb(153, 255, 255, 255)) 1.6), $anse)

# Le corps du cadenas, en blanc plein, et le trou de serrure violet.
$corps = Arrondi ([float](14.6 * $k)) ([float](9.2 * $k)) ([float](10.8 * $k)) ([float](7.6 * $k)) ([float](2 * $k))
$g.FillPath([System.Drawing.Brushes]::White, $corps)
$violet = [System.Drawing.ColorTranslator]::FromHtml('#7A4FF0')
$g.FillEllipse((New-Object System.Drawing.SolidBrush($violet)), [float](18.85 * $k), [float](11.25 * $k), [float](2.3 * $k), [float](2.3 * $k))
$g.DrawLine((New-Stylo $violet 1.1), (Pt 20 12.9), (Pt 20 14.6))

# Le petit éclat en haut à droite.
$g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(204, 255, 255, 255))), [float](30.3 * $k), [float](5.3 * $k), [float](2.2 * $k), [float](2.2 * $k))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naopassword.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
