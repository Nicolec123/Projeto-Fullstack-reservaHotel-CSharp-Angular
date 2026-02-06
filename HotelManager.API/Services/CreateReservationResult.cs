using HotelManager.API.DTOs.Reservation;

namespace HotelManager.API.Services;

public enum CreateReservationFailureReason
{
    None,
    InvalidDates,
    RoomUnavailable,
    RoomConflict,
    UserOverlap
}

public class CreateReservationResult
{
    public bool Success { get; set; }
    public ReservationDto? Reservation { get; set; }
    public CreateReservationFailureReason FailureReason { get; set; }
    /// <summary>Ids das reservas que se sobrepõem ao período (quando FailureReason == UserOverlap).</summary>
    public List<int> OverlappingReservationIds { get; set; } = new();
}
