# Pose (ou remet à jour) le raccourci « NaoGroup » sur le bureau : il ouvre la
# maison dans sa propre fenêtre, sans barre d'adresse, avec le logo actuel.
#   clic droit → « Exécuter avec PowerShell ». À relancer si le dossier est déplacé.
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

# L'icône d'abord, si elle manque : elle vient du logo actuel.
$ico = Join-Path $dossier 'naogroup.ico'
if (-not (Test-Path $ico)) { & (Join-Path $dossier 'generer-icone-naogroup.ps1') | Out-Null }

$navigateur = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $navigateur) { throw "Ni Chrome ni Edge n'ont été trouvés sur cet ordinateur." }

$page = Join-Path $dossier 'NaoGroup.html'
$adresse = ([System.Uri]$page).AbsoluteUri
$lien = Join-Path ([Environment]::GetFolderPath('Desktop')) 'NaoGroup.lnk'
$r = (New-Object -ComObject WScript.Shell).CreateShortcut($lien)
$r.TargetPath = $navigateur
$r.Arguments = "--app=`"$adresse`""
$r.WorkingDirectory = $dossier
$r.Description = 'NaoGroup — tous mes outils'
$r.IconLocation = "$ico,0"
$r.Save()
"Raccourci mis à jour : $lien"
& "$env:SystemRoot\System32\ie4uinit.exe" -show 2>$null    # rafraîchit les icônes affichées
