# Push a GitHub como dordaz-bithonor sin depender de credenciales guardadas de otra cuenta.
#
# Uso (en PowerShell, desde la raíz del repo):
#   $env:GITHUB_PAT = "ghp_xxxxxxxx"   # token classic con scope "repo"
#   .\scripts\push-bithonor.ps1
#
# Luego borra el PAT de la sesión:
#   Remove-Item Env:\GITHUB_PAT

$ErrorActionPreference = "Stop"

if (-not $env:GITHUB_PAT) {
  Write-Host ""
  Write-Host "Falta GITHUB_PAT. Haz esto y vuelve a ejecutar el script:" -ForegroundColor Yellow
  Write-Host '  $env:GITHUB_PAT = "pega_aqui_tu_token_classic"' -ForegroundColor Cyan
  Write-Host "  .\scripts\push-bithonor.ps1" -ForegroundColor Cyan
  Write-Host ""
  exit 1
}

$repo = "https://dordaz-bithonor:$($env:GITHUB_PAT)@github.com/dordaz-bithonor/honordesk.git"

Write-Host "Subiendo rama main..." -ForegroundColor DarkGray
git push "$repo" HEAD:refs/heads/main
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Push correcto. Borra el token de esta sesión:" -ForegroundColor Green
Write-Host "  Remove-Item Env:\GITHUB_PAT" -ForegroundColor Cyan
Write-Host ""
