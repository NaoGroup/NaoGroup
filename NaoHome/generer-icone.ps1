# Génère l'icône Windows (naohome.ico) à partir des mêmes tracés que le logo
# SVG de NaoHome.html. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, turquoise → violet → lilas rosé, comme « Notre histoire ».
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Coul '#17C9C0'), (Coul '#E99BFF'))
$melange = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$melange.Colors = @((Coul '#17C9C0'), (Coul '#7A4FF0'), (Coul '#E99BFF'))
$melange.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $melange
$g.FillPath($fond, $jeton)

# Un léger relief : le bas du jeton s'assombrit à peine.
$haut = [int]($S * 0.55)
$relief = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, ($haut - 1))), (New-Object System.Drawing.Point(0, ($S + 1))), [System.Drawing.Color]::FromArgb(0, 42, 28, 110), [System.Drawing.Color]::FromArgb(70, 42, 28, 110))
$g.SetClip($jeton)
$g.FillRectangle($relief, 0, $haut, $S, $S - $haut)
$g.ResetClip()

# La lueur lavande derrière la maison.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse((Rect 11.4 1.2 17.2 17.2))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(120, 237, 228, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 237, 228, 255))
$g.FillPath($pinceauHalo, $halo)

# L'accent : une petite maison en blanc plein — toit, cheminée — avec deux fenêtres et une porte lavande, et un éclat.
$blanc = [System.Drawing.Brushes]::White
$g.FillPolygon($blanc, @((Pt 20 3.4), (Pt 28 10.2), (Pt 25.8 10.2), (Pt 25.8 16.4), (Pt 14.2 16.4), (Pt 14.2 10.2), (Pt 12 10.2)))
$g.FillRectangle($blanc, (Rect 23.2 4.6 1.9 3.6))
$lavande = New-Object System.Drawing.SolidBrush((Coul '#7A4FF0' 180))
$g.FillRectangle($lavande, (Rect 15.4 11.2 2.4 2.2))
$g.FillRectangle($lavande, (Rect 22.2 11.2 2.4 2.2))
$g.FillRectangle($lavande, (Rect 18.6 13.9 2.8 2.5))
$g.FillEllipse($lavande, (Rect 18.6 12.5 2.8 2.8))
$eclat = New-Object System.Drawing.Drawing2D.GraphicsPath
$eclat.AddPolygon(@((Pt 32 3.6), (Pt 32.5 5.3), (Pt 34.2 5.8), (Pt 32.5 6.3), (Pt 32 8), (Pt 31.5 6.3), (Pt 29.8 5.8), (Pt 31.5 5.3)))
$g.FillPath($blanc, $eclat)

# Le N de la famille, d'un seul tracé.
$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](4.2 * $k))
$stylo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $stylo.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$stylo.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLines($stylo, @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naohome.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
