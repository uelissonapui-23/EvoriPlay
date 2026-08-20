$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectRef = 'aiblckekbiudkyrkywnz'

Set-Location -LiteralPath $ProjectRoot
Write-Host 'Conectando EvoriPlay ao projeto compartilhado evoria-platform...' -ForegroundColor Cyan
Write-Host 'O Supabase pode solicitar autenticação e a senha do banco nesta primeira execução.' -ForegroundColor Yellow

pnpm dlx supabase@latest link --project-ref $ProjectRef

Write-Host 'Projeto Supabase conectado. Migrações do EvoriPlay usam o schema exclusivo evoriplay.' -ForegroundColor Green
