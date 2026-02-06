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
    /// <summary>True se o usuário já possui alguma reserva (qualquer quarto) com datas sobrepostas, exceto Cancelada.</summary>
    Task<bool> HasUserOverlapAsync(int userId, DateTime dataInicio, DateTime dataFim, int? excludeReservationId, CancellationToken ct = default);
    /// <summary>Ids das reservas do usuário que se sobrepõem ao período (para exibir no alerta e permitir cancelar).</summary>
    Task<List<int>> GetUserOverlappingIdsAsync(int userId, DateTime dataInicio, DateTime dataFim, int? excludeReservationId, CancellationToken ct = default);
    Task<Reservation> CreateAsync(Reservation reservation, CancellationToken ct = default);
    Task<Reservation> UpdateAsync(Reservation reservation, CancellationToken ct = default);
}
