# Génère l'icône Windows (naoagenda.ico) à partir des mêmes tracés que le logo
# SVG de NaoAgenda.html. À relancer si le logo change.
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

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, dégradé violet → lavande.
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
    [System.Drawing.ColorTranslator]::FromHtml('#6A4ED0'), [System.Drawing.ColorTranslator]::FromHtml('#C7A6F6'))
$g.FillPath($fond, $jeton)

# L'accent : l'en-tête du calendrier (ligne + anneau), en blanc à 50 %.
$demi = New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) 2.8
$g.DrawLine($demi, (Pt 9.5 12.8), (Pt 30.5 12.8))
$g.DrawLine($demi, (Pt 14.5 6.6), (Pt 14.5 9.4))

# L'étoile lumineuse, à la place du second anneau : un halo doux puis l'étoile pleine.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](20.9 * $k), [float](3.4 * $k), [float](9.2 * $k), [float](9.2 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(150, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)
$etoile = New-Object System.Drawing.Drawing2D.GraphicsPath
$etoile.AddBezier((Pt 25.5 4.6), (Pt 25.83 6.53), (Pt 26.97 7.67), (Pt 28.9 8))
$etoile.AddBezier((Pt 28.9 8), (Pt 26.97 8.33), (Pt 25.83 9.47), (Pt 25.5 11.4))
$etoile.AddBezier((Pt 25.5 11.4), (Pt 25.17 9.47), (Pt 24.03 8.33), (Pt 22.1 8))
$etoile.AddBezier((Pt 22.1 8), (Pt 24.03 7.67), (Pt 25.17 6.53), (Pt 25.5 4.6))
$etoile.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $etoile)

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 18.5), (Pt 28 31.5), (Pt 28 18.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naoagenda.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
