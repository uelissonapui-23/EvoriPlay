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

Write-Host 'Publicando na Vercel...' -ForegroundColor Cyan
pnpm dlx vercel@latest --prod

Write-Host 'EvoriPlay publicado. O Supabase continua opcional e desacoplado do gameplay offline.' -ForegroundColor Green
