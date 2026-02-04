using HotelManager.API.Models;
using System.Text;

namespace HotelManager.API.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendReservationConfirmationAsync(Reservation reservation, CancellationToken ct = default)
    {
        try
        {
            // Simulação de envio de email
            // Em produção, integraria com SendGrid, AWS SES, Mailgun, etc.
            
            var emailBody = GenerateReservationEmail(reservation);
            
            // Log do email (em produção, enviaria de verdade)
            _logger.LogInformation("Email enviado para {Email}", reservation.User.Email);
            _logger.LogDebug("Conteúdo do email:\n{EmailBody}", emailBody);

            // Simula latência de envio
            await Task.Delay(200, ct);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email de confirmação");
            return false;
        }
    }

    private string GenerateReservationEmail(Reservation reservation)
    {
        var sb = new StringBuilder();
        var dias = (reservation.DataFim - reservation.DataInicio).Days;
        var precoDiaria = reservation.Room?.PrecoDiaria ?? 0;
        var total = reservation.ValorTotal ?? (precoDiaria * dias);

        sb.AppendLine("═══════════════════════════════════════════════════");
        sb.AppendLine("         HOTEL MANAGER - CONFIRMAÇÃO DE RESERVA");
        sb.AppendLine("═══════════════════════════════════════════════════");
        sb.AppendLine();
        sb.AppendLine($"Olá, {reservation.User.Nome}!");
        sb.AppendLine();
        sb.AppendLine("Sua reserva foi confirmada com sucesso!");
        sb.AppendLine();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine("📋 DETALHES DA RESERVA");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine($"Nº da Reserva: #{reservation.Id:D6}");
        sb.AppendLine($"Quarto: {reservation.Room?.Numero} - {reservation.Room?.Tipo}");
        sb.AppendLine($"Check-in: {reservation.DataInicio:dd/MM/yyyy}");
        sb.AppendLine($"Check-out: {reservation.DataFim:dd/MM/yyyy}");
        sb.AppendLine($"Período: {dias} {(dias == 1 ? "noite" : "noites")}");
        sb.AppendLine();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine("👥 OCUPAÇÃO");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine($"Adultos: {reservation.Adultos}");
        if (reservation.Criancas > 0)
            sb.AppendLine($"Crianças: {reservation.Criancas}");
        if (reservation.Pets > 0)
            sb.AppendLine($"Pets: {reservation.Pets}");
        sb.AppendLine();

        if (reservation.Guests.Any())
        {
            sb.AppendLine("Hóspedes adicionais:");
            foreach (var guest in reservation.Guests)
            {
                sb.AppendLine($"  • {guest.Nome} ({guest.Tipo})");
                if (!string.IsNullOrEmpty(guest.Cpf))
                    sb.AppendLine($"    CPF: {guest.Cpf}");
            }
            sb.AppendLine();
        }

        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine("💰 RESUMO FINANCEIRO");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine($"Hospedagem ({dias} {(dias == 1 ? "noite" : "noites")}): R$ {precoDiaria * dias:F2}");
        sb.AppendLine($"Total: R$ {total:F2}");
        sb.AppendLine();
        
        if (!string.IsNullOrEmpty(reservation.MetodoPagamento))
        {
            sb.AppendLine($"Método de pagamento: {reservation.MetodoPagamento}");
            if (!string.IsNullOrEmpty(reservation.CodigoPix))
                sb.AppendLine($"Código PIX: {reservation.CodigoPix}");
            if (!string.IsNullOrEmpty(reservation.CodigoBoleto))
                sb.AppendLine($"Código do boleto: {reservation.CodigoBoleto}");
            sb.AppendLine();
        }

        if (!string.IsNullOrEmpty(reservation.Observacoes))
        {
            sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            sb.AppendLine("📝 OBSERVAÇÕES");
            sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            sb.AppendLine();
            sb.AppendLine(reservation.Observacoes);
            sb.AppendLine();
        }

        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine("🎫 TICKET DO HOTEL");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine($"Hóspede Principal: {reservation.User.Nome}");
        if (!string.IsNullOrEmpty(reservation.User.Cpf))
            sb.AppendLine($"CPF: {reservation.User.Cpf}");
        if (!string.IsNullOrEmpty(reservation.User.Telefone))
            sb.AppendLine($"Telefone: {reservation.User.Telefone}");
        sb.AppendLine($"Email: {reservation.User.Email}");
        sb.AppendLine();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine("Obrigado por escolher o Hotel Manager!");
        sb.AppendLine("Esperamos recebê-lo em breve.");
        sb.AppendLine();
        sb.AppendLine("Atenciosamente,");
        sb.AppendLine("Equipe Hotel Manager");
        sb.AppendLine();
        sb.AppendLine("═══════════════════════════════════════════════════");

        return sb.ToString();
    }
}
