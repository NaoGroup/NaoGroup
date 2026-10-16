# Génère les icônes Windows (.ico) de NaoGroup à partir des mêmes tracés que
# les logos SVG des pages. À relancer si le logo change.
#   clic droit → « Exécuter avec PowerShell », ou : powershell -File generer-icones.ps1
Add-Type -AssemblyName System.Drawing
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path
$sortie  = Split-Path -Parent $dossier        # le dossier du projet

function New-Jeton {
    param([string]$c1, [string]$c2, [scriptblock]$Glyphe, [string]$Fichier)
    $S = 256; $k = $S / 40.0
    $bmp = New-Object System.Drawing.Bitmap($S, $S, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $r = [int](13 * $k); $d = $r * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90); $path.AddArc($S - $d, 0, $d, $d, 270, 90)
    $path.AddArc($S - $d, $S - $d, $d, $d, 0, 90); $path.AddArc(0, $S - $d, $d, $d, 90, 90); $path.CloseFigure()
    $br = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)), (New-Object System.Drawing.Point($S, $S)),
        [System.Drawing.ColorTranslator]::FromHtml($c1), [System.Drawing.ColorTranslator]::FromHtml($c2))
    $g.FillPath($br, $path)
    & $Glyphe $g $k
    $g.Dispose()
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
    $f = Join-Path $sortie $Fichier
    $fs = [System.IO.File]::Create($f); $bw = New-Object System.IO.BinaryWriter($fs)
    $bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
    $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
    $bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
    $bw.Write($png); $bw.Flush(); $bw.Close(); $fs.Close()
    "  $Fichier"
}
function New-Stylo { param($couleur, $largeur)
    $p = New-Object System.Drawing.Pen($couleur, [float]$largeur)
    $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $p.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $p
}
function Pt { param($x, $y, $k) New-Object System.Drawing.PointF([float]($x * $k), [float]($y * $k)) }

"Icônes générées dans $sortie :"

# NaoBudget — le N posé sur l'axe d'un graphique
New-Jeton '#7B5FD9' '#B48CF2' {
    param($g, $k)
    $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (4.2 * $k)),
        @((Pt 12 25.5 $k), (Pt 12 11 $k), (Pt 27 25 $k), (Pt 27 10.5 $k)))
    $g.DrawLine((New-Stylo ([System.Drawing.Color]::FromArgb(128, 255, 255, 255)) (2.8 * $k)),
        (Pt 9.5 30.5 $k), (Pt 30.5 30.5 $k))
} 'naobudget.ico'

# NaoGroup — le N de la maison et sa constellation de quatre points (logo actuel).
New-Jeton '#6F55D0' '#C39BF3' {
    param($g, $k)
    $g.DrawLines((New-Stylo ([System.Drawing.Color]::White) (4.2 * $k)),
        @((Pt 12 27 $k), (Pt 12 11 $k), (Pt 28 25 $k), (Pt 28 9.5 $k)))
    $blanc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(153, 255, 255, 255))
    foreach ($c in @(@(10.5, 31.5), @(16.3, 33.2), @(22.4, 33.2), @(28.2, 31.5))) {
        $rp = 1.9 * $k
        $g.FillEllipse($blanc, [float]($c[0] * $k - $rp), [float]($c[1] * $k - $rp), [float]($rp * 2), [float]($rp * 2))
    }
} 'naogroup.ico'
