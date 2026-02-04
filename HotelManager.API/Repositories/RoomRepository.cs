using Microsoft.EntityFrameworkCore;
using HotelManager.API.Data;
using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly ApplicationDbContext _db;

    public RoomRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Room?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Rooms.FindAsync([id], ct);
    }

    public async Task<Room?> GetByNumeroAsync(string numero, CancellationToken ct = default)
    {
        return await _db.Rooms.AsNoTracking()
            .FirstOrDefaultAsync(r => r.Numero == numero, ct);
    }

    public async Task<List<Room>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        return await _db.Rooms
            .OrderBy(r => r.Numero)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default)
    {
        return await _db.Rooms.CountAsync(ct);
    }

    public async Task<Room> CreateAsync(Room room, CancellationToken ct = default)
    {
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync(ct);
        return room;
    }

    public async Task<Room> UpdateAsync(Room room, CancellationToken ct = default)
    {
        _db.Rooms.Update(room);
        await _db.SaveChangesAsync(ct);
        return room;
    }
}
