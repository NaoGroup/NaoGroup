# Génère l'icône Windows (naofactu.ico) à partir des mêmes tracés que le logo
# SVG de NaoFactu.html. À relancer si le logo change.
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

# Le jeton : carré de 40, rayon 13, dégradé violet profond → lavande → bleu-violet.
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
    [System.Drawing.Color]::Black, [System.Drawing.Color]::White)
$blend = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$blend.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#4E36C4'), [System.Drawing.ColorTranslator]::FromHtml('#A488F1'), [System.Drawing.ColorTranslator]::FromHtml('#7C8BF0'))
$blend.Positions = @([float]0, [float]0.55, [float]1)
$fond.InterpolationColors = $blend
$g.FillPath($fond, $jeton)

# Le relief : un voile blanc léger sur le haut du jeton.
$relief = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point(0, [int]($S / 2))),
    [System.Drawing.Color]::FromArgb(56, 255, 255, 255), [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.SetClip($jeton); $g.FillRectangle($relief, 0, 0, $S, [int]($S / 2)); $g.ResetClip()

# La lueur lavande derrière la coche.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](20.4 * $k), [float](5.2 * $k), [float](12.4 * $k), [float](12.4 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(140, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pinceauHalo, $halo)

# L'accent : la ligne de facture (blanc à 50 %), puis la coche de paiement (blanc plein).
$demi = New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) 2.8
$g.DrawLine($demi, (Pt 9.5 11.8), (Pt 19 11.8))
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 2.8), @((Pt 23.2 11.4), (Pt 26 14.2), (Pt 31 8.6)))

# Le N de la famille, d'un seul tracé.
$g.DrawLines((New-Stylo ([System.Drawing.Color]::White) 4.2), @((Pt 12 31.5), (Pt 12 18.5), (Pt 28 31.5), (Pt 28 18.5)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naofactu.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
