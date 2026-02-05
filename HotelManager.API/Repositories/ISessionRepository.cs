using HotelManager.API.Models;

namespace HotelManager.API.Repositories;

public interface ISessionRepository
{
    Task<Session> CreateAsync(Session session, CancellationToken ct = default);
    Task<Session?> GetValidByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken ct = default);
    Task InvalidateAsync(Guid sessionId, CancellationToken ct = default);
    Task InvalidateByRefreshTokenHashAsync(string refreshTokenHash, CancellationToken ct = default);
    Task InvalidateAllForUserAsync(int userId, CancellationToken ct = default);
    Task DeleteExpiredAsync(CancellationToken ct = default);
}
