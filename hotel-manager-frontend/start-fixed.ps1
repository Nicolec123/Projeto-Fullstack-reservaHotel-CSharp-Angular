# Script para iniciar Angular com workaround para caractere "#" no caminho
Write-Host "Configurando variáveis de ambiente..." -ForegroundColor Yellow

# Desabilitar otimização de dependências do Vite
$env:VITE_OPTIMIZE_DEPS = "false"
$env:NODE_OPTIONS = "--no-warnings"

# Limpar cache problemático
Remove-Item -Recurse -Force .angular\cache -ErrorAction SilentlyContinue

Write-Host "Iniciando servidor..." -ForegroundColor Green
npm start
