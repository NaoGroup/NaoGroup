# Pose sur le bureau un raccourci NaoCV qui ouvre l'outil dans sa propre
# fenêtre, sans barre d'adresse ni onglets, avec son logo comme icône.
#
# À lancer depuis le dossier du projet : clic droit sur ce fichier →
# « Exécuter avec PowerShell ». À relancer si vous déplacez le dossier.
#
# Attention : vos CV sont enregistrés par le navigateur, pour cette adresse de
# fichier. Avant de déplacer le dossier, faites 💾 Sauvegarder depuis l'outil,
# puis rechargez la sauvegarde (📂) depuis le nouvel emplacement.
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

$cible = Join-Path $dossier 'NaoCV.html'
if (-not (Test-Path $cible)) { throw "NaoCV.html est introuvable dans $dossier." }
$adresse = ([System.Uri]$cible).AbsoluteUri      # espaces et accents encodés

$bureau = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell
$r = $shell.CreateShortcut((Join-Path $bureau 'NaoCV.lnk'))
$r.TargetPath = $navigateur
$r.Arguments = "--app=`"$adresse`""
$r.WorkingDirectory = $dossier
$r.Description = 'NaoCV — Votre parcours mérite d''être remarqué.'
$ico = Join-Path $dossier 'naocv.ico'
if (Test-Path $ico) { $r.IconLocation = "$ico,0" }
$r.Save()
"Raccourci créé sur le bureau : NaoCV.lnk"
"Navigateur utilisé : $navigateur"
