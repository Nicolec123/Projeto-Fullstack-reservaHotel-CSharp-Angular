using HotelManager.API.DTOs.Reservation;

namespace HotelManager.API.Services;

public interface IReservationService
{
    Task<ReservationDto?> GetByIdAsync(int id, int? userId, bool isAdmin, CancellationToken ct = default);
    Task<(List<ReservationDto> Items, int Total)> GetByUserAsync(int userId, int page, int pageSize, CancellationToken ct = default);
    Task<(List<ReservationDto> Items, int Total)> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<CreateReservationResult> CreateAsync(int userId, CreateReservationRequest request, CancellationToken ct = default);
    Task<CancellationInfoDto?> GetCancellationInfoAsync(int id, int? userId, bool isAdmin, CancellationToken ct = default);
    Task<CancelReservationResult> CancelAsync(int id, int userId, bool isAdmin, CancelReservationRequest? request, CancellationToken ct = default);
}
