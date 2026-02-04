using HotelManager.API.DTOs.Room;

namespace HotelManager.API.Services;

public interface IRoomService
{
    Task<RoomDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<(List<RoomDto> Items, int Total)> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<List<RoomDto>> GetAvailableAsync(DateTime dataInicio, DateTime dataFim, CancellationToken ct = default);
    Task<RoomDto?> CreateAsync(CreateRoomRequest request, CancellationToken ct = default);
    Task<RoomDto?> UpdateAsync(int id, UpdateRoomRequest request, CancellationToken ct = default);
}
