using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<List<Reservation>> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<List<Reservation>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<int> CountByUserAsync(int userId, CancellationToken ct = default);
    Task<bool> HasConflictAsync(int roomId, DateTime dataInicio, DateTime dataFim, int? excludeReservationId, CancellationToken ct = default);
    Task<Reservation> CreateAsync(Reservation reservation, CancellationToken ct = default);
    Task<Reservation> UpdateAsync(Reservation reservation, CancellationToken ct = default);
}
