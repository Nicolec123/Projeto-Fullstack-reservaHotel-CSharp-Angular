using System.Security.Cryptography;
using System.Text;

namespace HotelManager.API.Services;

public class PaymentService : IPaymentService
{
    public async Task<PaymentResult> ProcessPaymentAsync(decimal amount, string method, string? token = null, CancellationToken ct = default)
    {
        // Simulação de processamento de pagamento
        await Task.Delay(500, ct); // Simula latência da API

        return method.ToLower() switch
        {
            "cartaocredito" => ProcessCardPayment(amount, token),
            "pix" => ProcessPixPayment(amount),
            "boleto" => ProcessBoletoPayment(amount),
            _ => new PaymentResult { Success = false, Message = "Método de pagamento inválido" }
        };
    }

    private PaymentResult ProcessCardPayment(decimal amount, string? token)
    {
        // Simulação de API de pagamento (como Stripe, PagSeguro, etc)
        if (string.IsNullOrEmpty(token))
            return new PaymentResult { Success = false, Message = "Token de cartão inválido" };

        // Simula validação do cartão
        var transactionId = GenerateTransactionId();
        
        // Simula aprovação (90% de chance de sucesso)
        var random = new Random();
        var success = random.Next(1, 11) <= 9;

        return new PaymentResult
        {
            Success = success,
            TransactionId = success ? transactionId : null,
            Message = success ? "Pagamento aprovado" : "Pagamento recusado. Verifique os dados do cartão."
        };
    }

    private PaymentResult ProcessPixPayment(decimal amount)
    {
        var pixCode = GeneratePixCode(amount, Guid.NewGuid().ToString());
        return new PaymentResult
        {
            Success = true,
            CodigoPix = pixCode,
            Message = "Código PIX gerado. O pagamento será confirmado após a confirmação."
        };
    }

    private PaymentResult ProcessBoletoPayment(decimal amount)
    {
        var boletoCode = GenerateBoletoCode(amount, Guid.NewGuid().ToString());
        return new PaymentResult
        {
            Success = true,
            CodigoBoleto = boletoCode,
            Message = "Boleto gerado. O pagamento será confirmado após a compensação."
        };
    }

    public string GeneratePixCode(decimal amount, string reservationId)
    {
        // Gera um código PIX simulado (formato simplificado)
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var hash = ComputeHash($"{reservationId}{amount}{timestamp}");
        return $"00020126580014BR.GOV.BCB.PIX0136{hash.Substring(0, 36)}5204000053039865802BR5925HOTEL MANAGER LTDA6009SAO PAULO62070503***6304{hash.Substring(0, 4)}";
    }

    public string GenerateBoletoCode(decimal amount, string reservationId)
    {
        // Gera código de barras de boleto simulado
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var hash = ComputeHash($"{reservationId}{amount}{timestamp}");
        return $"34191{timestamp}{hash.Substring(0, 11)}2{amount.ToString("0000000000").Replace(".", "").Substring(0, 10)}{hash.Substring(11, 4)}";
    }

    private string GenerateTransactionId()
    {
        return $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}";
    }

    private string ComputeHash(string input)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
}
