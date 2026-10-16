# Génère l'icône Windows (naodoc.ico) à partir des mêmes tracés que le logo
# SVG de NaoDoc. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, dégradé violet → lavande.
$jeton = Arrondi 0 0 $S $S ([int](13 * $k))
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
    [System.Drawing.ColorTranslator]::FromHtml('#5F48D2'), [System.Drawing.ColorTranslator]::FromHtml('#CDB6F7'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#5F48D2'), [System.Drawing.ColorTranslator]::FromHtml('#9580EC'), [System.Drawing.ColorTranslator]::FromHtml('#CDB6F7'))
$mix.Positions = @([float]0, [float]0.55, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur derrière les feuilles.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](17.6 * $k), [float](1.2 * $k), [float](14.8 * $k), [float](14.8 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(110, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# La feuille de derrière, posée de biais, à demi transparente.
$derriere = Arrondi ([float](12.6 * $k)) ([float](5.2 * $k)) ([float](9.6 * $k)) ([float](11.4 * $k)) ([float](1.5 * $k))
$m = New-Object System.Drawing.Drawing2D.Matrix
$m.RotateAt(-11, (Pt 17.4 10.9))
$derriere.Transform($m)
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(115, 255, 255, 255))), $derriere)

# La feuille de devant, coin corné.
$feuille = New-Object System.Drawing.Drawing2D.GraphicsPath
$feuille.AddPolygon(@((Pt 17.4 3.6), (Pt 24.2 3.6), (Pt 27.6 7), (Pt 27.6 15.8), (Pt 17.4 15.8)))
$g.FillPath([System.Drawing.Brushes]::White, $feuille)
$coin = New-Object System.Drawing.Drawing2D.GraphicsPath
$coin.AddPolygon(@((Pt 24.2 3.6), (Pt 24.2 7), (Pt 27.6 7)))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#B9A6F4'))), $coin)
$lignes = New-Stylo ([System.Drawing.Color]::FromArgb(150, 124, 102, 221)) 1.1
$g.DrawLine($lignes, (Pt 19.9 10.2), (Pt 25.1 10.2)); $g.DrawLine($lignes, (Pt 19.9 12.9), (Pt 23.3 12.9))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naodoc.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
