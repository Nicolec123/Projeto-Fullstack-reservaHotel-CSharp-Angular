using Microsoft.EntityFrameworkCore;
using HotelManager.API.Data;
using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly ApplicationDbContext _db;

    public ReservationRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .Include(r => r.Guests)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<List<Reservation>> GetByUserIdAsync(int userId, CancellationToken ct = default)
    {
        return await _db.Reservations
            .Include(r => r.Room)
            .Include(r => r.Guests)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.DataInicio)
            .ToListAsync(ct);
    }

    public async Task<List<Reservation>> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        return await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Room)
            .Include(r => r.Guests)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default)
    {
        return await _db.Reservations.CountAsync(ct);
    }

    public async Task<int> CountByUserAsync(int userId, CancellationToken ct = default)
    {
        return await _db.Reservations.CountAsync(r => r.UserId == userId, ct);
    }

    /// <summary>
    /// Verifica se existe reserva no mesmo quarto com sobreposição de datas (regra de conflito).
    /// Considera apenas reservas com status Confirmada.
    /// </summary>
    public async Task<bool> HasConflictAsync(int roomId, DateTime dataInicio, DateTime dataFim, int? excludeReservationId, CancellationToken ct = default)
    {
        var query = _db.Reservations
            .Where(r => r.RoomId == roomId && r.Status == "Confirmada")
            .Where(r => r.DataInicio < dataFim && r.DataFim > dataInicio);

        if (excludeReservationId.HasValue)
            query = query.Where(r => r.Id != excludeReservationId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<Reservation> CreateAsync(Reservation reservation, CancellationToken ct = default)
    {
        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync(ct);
        return reservation;
    }

    public async Task<Reservation> UpdateAsync(Reservation reservation, CancellationToken ct = default)
    {
        _db.Reservations.Update(reservation);
        await _db.SaveChangesAsync(ct);
        return reservation;
    }
}
