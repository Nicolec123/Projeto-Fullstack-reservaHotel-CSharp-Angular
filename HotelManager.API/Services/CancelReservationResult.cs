using HotelManager.API.DTOs.Reservation;

namespace HotelManager.API.Services;

/// <summary>
/// Resultado da tentativa de cancelamento. Indica sucesso, reserva atualizada ou necessidade de pagamento da taxa.
/// </summary>
public class CancelReservationResult
{
    public bool Success { get; set; }
    public ReservationDto? Reservation { get; set; }
    /// <summary>Quando true, o cancelamento exige pagamento da taxa (1 diária) antes de concluir.</summary>
    public bool PaymentRequired { get; set; }
    public decimal FeeAmount { get; set; }
}
