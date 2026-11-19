# Pose sur le bureau deux raccourcis — NaoBudget et NaoGroup — qui ouvrent
# l'outil dans sa propre fenêtre, sans barre d'adresse ni onglets, avec son
# logo comme icône.
#
# À lancer depuis le dossier du projet : clic droit sur ce fichier →
# « Exécuter avec PowerShell ». À relancer si vous déplacez le dossier.
#
# Attention : le budget est enregistré par le navigateur, pour cette adresse de
# fichier. Avant de déplacer le dossier, exportez une sauvegarde (.json) depuis
# l'outil, puis rechargez-la depuis le nouvel emplacement.
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

function New-Raccourci {
    param([string]$Nom, [string]$Page, [string]$Icone, [string]$Description)
    $cible = Join-Path $dossier $Page
    if (-not (Test-Path $cible)) { Write-Warning "$Page est introuvable, raccourci ignoré."; return }
    $adresse = ([System.Uri]$cible).AbsoluteUri      # espaces et accents encodés
    $lien = Join-Path $bureau "$Nom.lnk"
    $r = $shell.CreateShortcut($lien)
    $r.TargetPath = $navigateur
    $r.Arguments = "--app=`"$adresse`""
    $r.WorkingDirectory = $dossier
    $r.Description = $Description
    $ico = Join-Path $dossier $Icone
    if (Test-Path $ico) { $r.IconLocation = "$ico,0" }
    $r.Save()
    "  $Nom.lnk"
}

"Raccourcis créés sur le bureau :"
New-Raccourci 'NaoBudget' 'NaoBudget.html' 'naobudget.ico' 'NaoBudget — budget mensuel et annuel'
New-Raccourci 'NaoGroup'  'NaoGroup.html'  'naogroup.ico'  'NaoGroup — tous mes outils'
"Navigateur utilisé : $navigateur"
