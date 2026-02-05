using HotelManager.API.Models;

namespace HotelManager.API.Auth;

public interface IJwtService
{
    /// <summary>Gera access token para hóspede (tipo: guest).</summary>
    string GenerateGuestAccessToken(User user);
    /// <summary>Gera access token para admin/staff (tipo: admin).</summary>
    string GenerateAdminAccessToken(User user);
    /// <summary>Legado: access token genérico.</summary>
    string GenerateAccessToken(User user);
    /// <summary>Gera string aleatória segura para refresh token.</summary>
    string GenerateRefreshToken();
    /// <summary>Gera hash do refresh token para armazenar em banco.</summary>
    string HashRefreshToken(string refreshToken);
    /// <summary>Legado.</summary>
    string GenerateToken(User user) => GenerateAccessToken(user);
}
