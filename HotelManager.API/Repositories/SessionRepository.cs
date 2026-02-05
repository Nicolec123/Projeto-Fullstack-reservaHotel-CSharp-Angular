using Microsoft.EntityFrameworkCore;
using HotelManager.API.Data;
using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly ApplicationDbContext _db;

    public SessionRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Session> CreateAsync(Session session, CancellationToken ct = default)
    {
        _db.Sessions.Add(session);
        await _db.SaveChangesAsync(ct);
        return session;
    }

    public async Task<Session?> GetValidByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        return await _db.Sessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.RefreshTokenHash == refreshTokenHash && s.ExpiresAt > now, ct);
    }

    public async Task InvalidateAsync(Guid sessionId, CancellationToken ct = default)
    {
        await _db.Sessions.Where(s => s.SessionId == sessionId).ExecuteDeleteAsync(ct);
    }

    public async Task InvalidateByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken ct = default)
    {
        await _db.Sessions.Where(s => s.RefreshTokenHash == refreshTokenHash).ExecuteDeleteAsync(ct);
    }

    public async Task InvalidateAllForUserAsync(int userId, CancellationToken ct = default)
    {
        await _db.Sessions.Where(s => s.UserId == userId).ExecuteDeleteAsync(ct);
    }

    public async Task DeleteExpiredAsync(CancellationToken ct = default)
    {
        await _db.Sessions.Where(s => s.ExpiresAt <= DateTime.UtcNow).ExecuteDeleteAsync(ct);
    }
}
