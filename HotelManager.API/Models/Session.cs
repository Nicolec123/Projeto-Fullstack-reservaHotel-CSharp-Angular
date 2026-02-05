namespace HotelManager.API.Models;

/// <summary>
/// Sessão ativa para refresh token. Permite rastrear dispositivos e encerrar sessões remotamente.
/// </summary>
public class Session
{
    public int Id { get; set; }
    public Guid SessionId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    /// <summary>Hash do refresh token (nunca armazenar o token em claro).</summary>
    public string RefreshTokenHash { get; set; } = string.Empty;
    public string? Ip { get; set; }
    public string? Device { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
