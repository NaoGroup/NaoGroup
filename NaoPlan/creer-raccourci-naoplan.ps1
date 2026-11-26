# Pose sur le bureau un raccourci « NaoPlan » qui ouvre l'outil dans sa propre
# fenêtre, sans barre d'adresse ni onglets, avec son logo comme icône.
#
# À lancer depuis le dossier du projet : clic droit sur ce fichier →
# « Exécuter avec PowerShell ». À relancer si vous déplacez le dossier.
#
# Attention : le projet en cours est enregistré par le navigateur, pour cette
# adresse de fichier. Avant de déplacer le dossier, enregistrez une copie
# (.json) depuis l'outil, puis rechargez-la depuis le nouvel emplacement.
$ErrorActionPreference = 'Stop'
$dossier = Split-Path -Parent $MyInvocation.MyCommand.Path

# Chrome en priorité (mode --app, la fenêtre la plus propre), sinon Edge.
$navigateur = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $navigateur) { throw "Ni Chrome ni Edge n'ont été trouvés sur cet ordinateur." }

$bureau = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell

$cible = Join-Path $dossier 'NaoPlan.html'
if (-not (Test-Path $cible)) { throw "NaoPlan.html est introuvable dans $dossier." }
$adresse = ([System.Uri]$cible).AbsoluteUri      # espaces et accents encodés
$lien = Join-Path $bureau 'NaoPlan.lnk'
$r = $shell.CreateShortcut($lien)
$r.TargetPath = $navigateur
$r.Arguments = "--app=`"$adresse`""
$r.WorkingDirectory = $dossier
$r.Description = 'NaoPlan — plans de projet immobilier'
$ico = Join-Path $dossier 'naoplan.ico'
if (Test-Path $ico) { $r.IconLocation = "$ico,0" }
$r.Save()

"Raccourci créé sur le bureau :"
"  NaoPlan.lnk"
"Navigateur utilisé : $navigateur"
