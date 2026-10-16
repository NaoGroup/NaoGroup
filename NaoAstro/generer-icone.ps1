# Génère l'icône Windows (naoastro.ico) à partir des mêmes tracés que le logo
# SVG de NaoAstro.html. À relancer si le logo change.
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File generer-icone.ps1
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

$S = 256; $k = $S / 40.0
function Pt { param($x, $y) New-Object System.Drawing.PointF([float]($x * $k), [float]($y * $k)) }
function Couleur { param($hex, $a = 255) $c = [System.Drawing.ColorTranslator]::FromHtml($hex); [System.Drawing.Color]::FromArgb($a, $c.R, $c.G, $c.B) }
# Une étoile fine à quatre branches (courbes quadratiques converties en cubiques).
function Etoile { param($x, $y, $s)
    $q = 0.16 * $s
    $pts = @(@($x, ($y - $s)), @(($x + $s), $y), @($x, ($y + $s)), @(($x - $s), $y))
    $ctl = @(@(($x + $q), ($y - $q)), @(($x + $q), ($y + $q)), @(($x - $q), ($y + $q)), @(($x - $q), ($y - $q)))
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    for ($i = 0; $i -lt 4; $i++) {
        $a = $pts[$i]; $b = $pts[($i + 1) % 4]; $c = $ctl[$i]
        $p.AddBezier((Pt $a[0] $a[1]),
            (Pt ($a[0] + 2 / 3 * ($c[0] - $a[0])) ($a[1] + 2 / 3 * ($c[1] - $a[1]))),
            (Pt ($b[0] + 2 / 3 * ($c[0] - $b[0])) ($b[1] + 2 / 3 * ($c[1] - $b[1]))),
            (Pt $b[0] $b[1]))
    }
    $p.CloseFigure(); $p
}

$bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Le jeton : carré de 40, rayon 13, du bleu nuit (en haut) à la lavande (à l'horizon).
$r = [int](13 * $k); $d = $r * 2
$jeton = New-Object System.Drawing.Drawing2D.GraphicsPath
$jeton.AddArc(0, 0, $d, $d, 180, 90); $jeton.AddArc($S - $d, 0, $d, $d, 270, 90)
$jeton.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $jeton.AddArc(0, $S - $d, $d, $d, 90, 90); $jeton.CloseFigure()
$fond = New-Object System.Drawing.Drawing2D.LinearGradientBrush((Pt 10 0), (Pt 30 40), (Couleur '#1E2266'), (Couleur '#B89CF3'))
$degrade = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$degrade.Colors = @((Couleur '#1E2266'), (Couleur '#5A3FC6'), (Couleur '#B89CF3'))
$degrade.Positions = @([float]0, [float]0.52, [float]1)
$fond.InterpolationColors = $degrade
$g.FillPath($fond, $jeton)

# La lueur douce autour de la lune.
$halo = New-Object System.Drawing.Drawing2D.GraphicsPath
$halo.AddEllipse([float](19.4 * $k), [float](2.2 * $k), [float](16 * $k), [float](16 * $k))
$pinceauHalo = New-Object System.Drawing.Drawing2D.PathGradientBrush($halo)
$pinceauHalo.CenterColor = [System.Drawing.Color]::FromArgb(84, 255, 255, 255)
$pinceauHalo.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.SetClip($jeton); $g.FillPath($pinceauHalo, $halo); $g.ResetClip()

# Le croissant : le disque de la lune, moins un disque décalé vers le haut à gauche.
$lune = New-Object System.Drawing.Drawing2D.GraphicsPath
$lune.AddEllipse([float]((27.4 - 5.2) * $k), [float]((10.2 - 5.2) * $k), [float](10.4 * $k), [float](10.4 * $k))
$ombre = New-Object System.Drawing.Drawing2D.GraphicsPath
$ombre.AddEllipse([float]((24.6 - 4.5) * $k), [float]((8.1 - 4.5) * $k), [float](9 * $k), [float](9 * $k))
$croissant = New-Object System.Drawing.Region($lune); $croissant.Exclude($ombre)
$g.FillRegion([System.Drawing.Brushes]::White, $croissant)

# Les trois étoiles fines.
$g.FillPath([System.Drawing.Brushes]::White, (Etoile 11.2 9.6 2.9))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(191, 255, 255, 255))), (Etoile 17.2 5.6 1.8))
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(153, 255, 255, 255))), (Etoile 18.3 13.2 1.4))

# Le N de la famille, d'un seul tracé.
$stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](4.2 * $k))
$stylo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round; $stylo.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$stylo.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLines($stylo, @((Pt 12 31.5), (Pt 12 19), (Pt 28 31.5), (Pt 28 19)))
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
$f = Join-Path $dossier 'naoastro.ico'
$fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
"Icône générée : $f"
