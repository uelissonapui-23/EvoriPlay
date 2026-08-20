$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

pnpm test
pnpm build

if (-not (Test-Path -LiteralPath '.git')) {
  throw 'Execute pnpm setup antes da primeira publicação.'
}

git add .
$Pending = git status --porcelain
if ($Pending) {
  git commit -m 'chore: prepare EvoriPlay release'
}

git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Falha ao enviar alterações ao GitHub.' }

Write-Host 'Alterações enviadas. A Vercel publicará automaticamente pela integração com o GitHub.' -ForegroundColor Green
