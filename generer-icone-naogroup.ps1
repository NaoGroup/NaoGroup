# Génère naogroup.ico à partir du logo actuel de NaoGroup : le N de la maison,
# et sous lui une constellation de quatre points (mêmes tracés que le logo SVG).
# Chaque taille (16 à 256 px) est dessinée à sa propre échelle pour rester nette.
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File generer-icone-naogroup.ps1
# À relancer si le logo change, puis « creer-raccourci-naogroup.ps1 » pour le bureau.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

function Pt { param($x, $y, $k) New-Object System.Drawing.PointF([float]($x * $k), [float]($y * $k)) }

function New-PngJeton {
    param([int]$S)
    $k = $S / 40.0
    $bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # le jeton : carré aux coins arrondis (rayon 13 sur 40), dégradé lilas en diagonale
    $r = 13 * $k; $d = $r * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90); $path.AddArc($S - $d, 0, $d, $d, 270, 90)
    $path.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $path.AddArc(0, $S - $d, $d, $d, 90, 90); $path.CloseFigure()
    $br = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)), (New-Object System.Drawing.PointF([float]$S, [float]$S)),
        [System.Drawing.ColorTranslator]::FromHtml('#6F55D0'), [System.Drawing.ColorTranslator]::FromHtml('#C39BF3'))
    $g.FillPath($br, $path)

    # le N, d'un seul geste
    $stylo = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](4.2 * $k))
    $stylo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $stylo.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $stylo.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($stylo, @((Pt 12 27 $k), (Pt 12 11 $k), (Pt 28 25 $k), (Pt 28 9.5 $k)))

    # la constellation : quatre points, un par outil de la maison
    $blanc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(153, 255, 255, 255))
    foreach ($c in @(@(10.5, 31.5), @(16.3, 33.2), @(22.4, 33.2), @(28.2, 31.5))) {
        $rp = 1.9 * $k
        $g.FillEllipse($blanc, [float]($c[0] * $k - $rp), [float]($c[1] * $k - $rp), [float]($rp * 2), [float]($rp * 2))
    }
    $g.Dispose()
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $octets = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
    , $octets
}

$tailles = @(16, 24, 32, 48, 64, 128, 256)
$images = @(); foreach ($t in $tailles) { $images += , (New-PngJeton $t) }

$fichier = Join-Path $dossier 'naogroup.ico'
$fs = [System.IO.File]::Create($fichier); $bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$tailles.Count)
$decalage = 6 + 16 * $tailles.Count
for ($i = 0; $i -lt $tailles.Count; $i++) {
    $t = $tailles[$i]; $png = $images[$i]
    $oct = if ($t -ge 256) { 0 } else { $t }
    $bw.Write([Byte]$oct); $bw.Write([Byte]$oct); $bw.Write([Byte]0); $bw.Write([Byte]0)
    $bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]$decalage)
    $decalage += $png.Length
}
foreach ($png in $images) { $bw.Write($png) }
$bw.Flush(); $bw.Close(); $fs.Close()
"naogroup.ico généré ($($tailles -join ', ') px) : $fichier"
