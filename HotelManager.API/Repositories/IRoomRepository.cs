using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Room?> GetByNumeroAsync(string numero, CancellationToken ct = default);
    Task<List<Room>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<Room> CreateAsync(Room room, CancellationToken ct = default);
    Task<Room> UpdateAsync(Room room, CancellationToken ct = default);
}
