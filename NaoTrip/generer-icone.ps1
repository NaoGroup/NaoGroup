# Génère l'icône Windows (naotrip.ico) à partir des mêmes tracés que le logo
# SVG de NaoTrip. À relancer si le logo change.
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
    [System.Drawing.ColorTranslator]::FromHtml('#5B45CF'), [System.Drawing.ColorTranslator]::FromHtml('#C9B2F7'))
$mix = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$mix.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#5B45CF'), [System.Drawing.ColorTranslator]::FromHtml('#9A86EE'), [System.Drawing.ColorTranslator]::FromHtml('#C9B2F7'))
$mix.Positions = @([float]0, [float]0.55, [float]1)
$fond.InterpolationColors = $mix
$g.FillPath($fond, $jeton)

# La lueur derrière l'avion.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](25.4 * $k), [float](2.2 * $k), [float](10.4 * $k), [float](10.4 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(140, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# La petite valise et sa poignée.
$blanc = [System.Drawing.Color]::FromArgb(237, 255, 255, 255)
$g.FillPath((New-Object System.Drawing.SolidBrush($blanc)), (Arrondi ([float](8 * $k)) ([float](8.4 * $k)) ([float](8.4 * $k)) ([float](6.4 * $k)) ([float](1.7 * $k))))
$poignee = New-Stylo $blanc 1.3
$g.DrawLines($poignee, @((Pt 10.7 8.4), (Pt 10.7 6.9), (Pt 11.4 6.1), (Pt 13 6.1), (Pt 13.7 6.9), (Pt 13.7 8.4)))
$bande = New-Stylo ([System.Drawing.Color]::FromArgb(150, 124, 102, 221)) 0.9
$g.DrawLine($bande, (Pt 10.6 9.5), (Pt 10.6 13.7)); $g.DrawLine($bande, (Pt 13.8 9.5), (Pt 13.8 13.7))

# Le trajet en pointillés.
$trajet = New-Stylo ([System.Drawing.Color]::FromArgb(205, 255, 255, 255)) 1.5
$trajet.DashCap = [System.Drawing.Drawing2D.DashCap]::Round
$trajet.DashPattern = @([float]0.01, [float]1.7)
$g.DrawBezier($trajet, (Pt 18.4 11.4), (Pt 21.6 6.7), (Pt 24.9 5.3), (Pt 28.2 7.1))

# L'avion de papier, incliné de 14°.
$avion = New-Object System.Drawing.Drawing2D.GraphicsPath
$avion.AddPolygon(@((Pt 28.4 4.4), (Pt 33.8 7.6), (Pt 28.5 10.2), (Pt 29.7 7.5)))
$m = New-Object System.Drawing.Drawing2D.Matrix
$m.RotateAt(14, (Pt 30.6 7.4))
$avion.Transform($m)
$g.FillPath([System.Drawing.Brushes]::White, $avion)

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naotrip.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
