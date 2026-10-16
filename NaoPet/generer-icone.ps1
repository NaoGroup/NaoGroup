# Génère l'icône Windows (naopet.ico) à partir des mêmes tracés que le logo
# SVG de NaoPet.html. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, violet profond → bleu-violet → lavande.
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)), (Coul '#5B42CE'), (Coul '#C6ACF6'))
$melange = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$melange.Colors = @((Coul '#5B42CE'), (Coul '#7F84F0'), (Coul '#C6ACF6'))
$melange.Positions = @([float]0, [float]0.5, [float]1)
$fond.InterpolationColors = $melange
$g.FillPath($fond, $jeton)

# Un léger relief : le bas du jeton s'assombrit à peine.
$haut = [int]($S * 0.55)
$relief = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Point(0, ($haut - 1))), (New-Object System.Drawing.Point(0, ($S + 1))), [System.Drawing.Color]::FromArgb(0, 42, 28, 110), [System.Drawing.Color]::FromArgb(70, 42, 28, 110))
$g.SetClip($jeton)
$g.FillRectangle($relief, 0, $haut, $S, $S - $haut)
$g.ResetClip()

# La lueur lavande derrière la patte.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse((Rect 12 1.4 16 16))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(120, 237, 228, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 237, 228, 255))
$g.FillPath($pinceauHalo, $halo)

# L'accent : une empreinte de patte, un coussinet et quatre doigts, en blanc plein.
$blanc = [System.Drawing.Brushes]::White
$g.FillEllipse($blanc, (Rect 15.7 8.9 8.6 6.6))
foreach ($c in @(@(13.7, 8.4), @(17.7, 5.3), @(22.3, 5.3), @(26.3, 8.4))) {
    $g.FillEllipse($blanc, (Rect ($c[0] - 1.95) ($c[1] - 1.95) 3.9 3.9))
}

# Le N de la famille, d'un seul tracé.
$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](4.2 * $k))
$stylo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $stylo.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$stylo.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLines($stylo, @((Pt 12 31.5), (Pt 12 19.5), (Pt 28 31.5), (Pt 28 19.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naopet.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
