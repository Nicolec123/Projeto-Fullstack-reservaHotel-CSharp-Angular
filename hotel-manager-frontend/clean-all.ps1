# Script para limpar TODO o cache do Angular/Vite
Write-Host "Limpando cache completo..." -ForegroundColor Yellow

# Parar processos Node
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpar cache Angular
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

Write-Host "Cache limpo!" -ForegroundColor Green
Write-Host "Reinstalando dependências..." -ForegroundColor Yellow
npm install

Write-Host "Iniciando servidor..." -ForegroundColor Yellow
npm start
