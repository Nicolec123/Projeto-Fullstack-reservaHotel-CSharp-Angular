namespace HotelManager.API.Services;

public interface IPaymentService
{
    Task<PaymentResult> ProcessPaymentAsync(decimal amount, string method, string? token = null, CancellationToken ct = default);
    string GeneratePixCode(decimal amount, string reservationId);
    string GenerateBoletoCode(decimal amount, string reservationId);
}

public class PaymentResult
{
    public bool Success { get; set; }
    public string? TransactionId { get; set; }
    public string? CodigoPix { get; set; }
    public string? CodigoBoleto { get; set; }
    public string? Message { get; set; }
}
