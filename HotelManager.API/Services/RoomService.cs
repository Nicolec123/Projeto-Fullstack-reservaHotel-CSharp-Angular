using HotelManager.API.DTOs.Room;
using HotelManager.API.Models;
using HotelManager.API.Repositories;

namespace HotelManager.API.Services;

public class RoomService : IRoomService
{
    private readonly IRoomRepository _roomRepo;
    private readonly IReservationRepository _reservationRepo;

    public RoomService(IRoomRepository roomRepo, IReservationRepository reservationRepo)
    {
        _roomRepo = roomRepo;
        _reservationRepo = reservationRepo;
    }

    public async Task<RoomDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var room = await _roomRepo.GetByIdAsync(id, ct);
        return room == null ? null : MapToDto(room);
    }

    public async Task<(List<RoomDto> Items, int Total)> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var rooms = await _roomRepo.GetAllAsync(page, pageSize, ct);
        var total = await _roomRepo.CountAsync(ct);
        return (rooms.Select(MapToDto).ToList(), total);
    }

    public async Task<List<RoomDto>> GetAvailableAsync(DateTime dataInicio, DateTime dataFim, CancellationToken ct = default)
    {
        var rooms = await _roomRepo.GetAllAsync(1, 1000, ct);
        var result = new List<RoomDto>();
        foreach (var room in rooms)
        {
            if (room.Bloqueado) continue;
            var hasConflict = await _reservationRepo.HasConflictAsync(room.Id, dataInicio, dataFim, null, ct);
            if (!hasConflict)
                result.Add(MapToDto(room));
        }
        return result;
    }

    public async Task<RoomDto?> CreateAsync(CreateRoomRequest request, CancellationToken ct = default)
    {
        if (await _roomRepo.GetByNumeroAsync(request.Numero, ct) != null)
            return null;

        var room = new Room
        {
            Numero = request.Numero,
            Tipo = request.Tipo,
            PrecoDiaria = request.PrecoDiaria
        };
        room = await _roomRepo.CreateAsync(room, ct);
        return MapToDto(room);
    }

    public async Task<RoomDto?> UpdateAsync(int id, UpdateRoomRequest request, CancellationToken ct = default)
    {
        var room = await _roomRepo.GetByIdAsync(id, ct);
        if (room == null) return null;

        if (request.Tipo != null) room.Tipo = request.Tipo;
        if (request.PrecoDiaria.HasValue) room.PrecoDiaria = request.PrecoDiaria.Value;
        if (request.Bloqueado.HasValue) room.Bloqueado = request.Bloqueado.Value;

        await _roomRepo.UpdateAsync(room, ct);
        return MapToDto(room);
    }

    private static RoomDto MapToDto(Room r) => new()
    {
        Id = r.Id,
        Numero = r.Numero,
        Tipo = r.Tipo,
        PrecoDiaria = r.PrecoDiaria,
        Bloqueado = r.Bloqueado
    };
}
