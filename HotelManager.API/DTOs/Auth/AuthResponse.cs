namespace HotelManager.API.DTOs.Auth;

public class AuthResponse
{
    /// <summary>Access token (Bearer) — uso em Authorization header.</summary>
    public string Token { get; set; } = string.Empty;
    /// <summary>Refresh token — hóspede com LembrarDeMim. Admin não usa.</summary>
    public string? RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    /// <summary>guest = hóspede, admin = painel administrativo.</summary>
    public string Tipo { get; set; } = "guest";
    public int UserId { get; set; }
    public string Permissions { get; set; } = string.Empty;
}
