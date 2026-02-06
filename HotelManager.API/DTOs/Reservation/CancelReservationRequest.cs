namespace HotelManager.API.DTOs.Reservation;

/// <summary>
/// Corpo opcional do POST de cancelamento. Quando há taxa (cancelamento dentro de 48h), o token de pagamento é obrigatório.
/// </summary>
public class CancelReservationRequest
{
    /// <summary>Token de pagamento (ex.: cartão) para cobrança da taxa de 1 diária quando aplicável.</summary>
    public string? TokenPagamento { get; set; }
}
