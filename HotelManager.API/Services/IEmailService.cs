using HotelManager.API.Models;

namespace HotelManager.API.Services;

public interface IEmailService
{
    Task<bool> SendReservationConfirmationAsync(Reservation reservation, CancellationToken ct = default);
}
