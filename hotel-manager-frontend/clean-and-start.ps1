# Script para limpar cache do Angular e reiniciar
Write-Host "Limpando cache do Angular..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "Cache limpo!" -ForegroundColor Green
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
npm start
