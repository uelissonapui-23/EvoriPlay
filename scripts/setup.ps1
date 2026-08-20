$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$RepositoryUrl = 'https://github.com/uelissonapui-23/EvoriPlay.git'

Set-Location -LiteralPath $ProjectRoot
Write-Host 'Preparando o EvoriPlay...' -ForegroundColor Cyan

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw 'pnpm não foi encontrado. Instale o Node.js atual e ative o pnpm com: corepack enable'
}

pnpm install

if (-not (Test-Path -LiteralPath '.env.local')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
  Write-Host '.env.local criado. Supabase permanece opcional até as chaves serem informadas.' -ForegroundColor Yellow
}

if (-not (Test-Path -LiteralPath '.git')) {
  git init -b main
}

$Origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $RepositoryUrl
} elseif ($Origin -ne $RepositoryUrl) {
  git remote set-url origin $RepositoryUrl
}

pnpm test
pnpm build

Write-Host ''
Write-Host 'EvoriPlay preparado com sucesso.' -ForegroundColor Green
Write-Host 'Desenvolvimento: pnpm dev'
Write-Host 'Conectar Supabase compartilhado: pnpm supabase:link'
Write-Host 'Publicação: pnpm release'
