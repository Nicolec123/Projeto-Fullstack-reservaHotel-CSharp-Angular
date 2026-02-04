# Script para iniciar Angular com cache em local temporário sem "#"
Write-Host "Configurando cache temporário..." -ForegroundColor Yellow

# Criar pasta temporária para cache (sem #)
$cacheTemp = "$env:TEMP\hotel-manager-angular-cache"
New-Item -ItemType Directory -Force -Path $cacheTemp | Out-Null

# Limpar cache antigo
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue

# Definir variável de ambiente para o cache
$env:ANGULAR_CACHE = $cacheTemp
$env:NODE_OPTIONS = "--no-warnings"

Write-Host "Cache temporário: $cacheTemp" -ForegroundColor Green
Write-Host "Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "NOTA: Se ainda der erro, a melhor solução é renomear a pasta do projeto" -ForegroundColor Yellow
Write-Host "      removendo o caractere '#' do nome." -ForegroundColor Yellow
Write-Host ""

npm start
