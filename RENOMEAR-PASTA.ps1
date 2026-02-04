# Script para renomear a pasta removendo o caractere "#"
# Execute este script como Administrador se necessário

Write-Host "Renomeando pasta para remover caractere '#'..." -ForegroundColor Yellow

$pastaAtual = "C:\Users\ncruz\Desktop\Projeto-reservaHotel-C#"
$pastaNova = "C:\Users\ncruz\Desktop\Projeto-reservaHotel-CSharp"

if (Test-Path $pastaNova) {
    Write-Host "A pasta destino já existe: $pastaNova" -ForegroundColor Red
    Write-Host "Por favor, renomeie ou remova manualmente." -ForegroundColor Yellow
    exit
}

try {
    Rename-Item -Path $pastaAtual -NewName "Projeto-reservaHotel-CSharp" -ErrorAction Stop
    Write-Host "Pasta renomeada com sucesso!" -ForegroundColor Green
    Write-Host "Nova localização: $pastaNova" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora execute:" -ForegroundColor Yellow
    Write-Host "  cd '$pastaNova\hotel-manager-frontend'" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor Cyan
} catch {
    Write-Host "Erro ao renomear: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente renomear manualmente:" -ForegroundColor Yellow
    Write-Host "  1. Feche todos os programas que estão usando a pasta" -ForegroundColor Yellow
    Write-Host "  2. Renomeie 'Projeto-reservaHotel-C#' para 'Projeto-reservaHotel-CSharp'" -ForegroundColor Yellow
}
