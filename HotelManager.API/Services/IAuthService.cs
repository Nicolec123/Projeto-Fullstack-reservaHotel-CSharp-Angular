using HotelManager.API.DTOs.Auth;
using HotelManager.API.DTOs.User;

namespace HotelManager.API.Services;

public interface IAuthService
{
    /// <summary>Login de hóspede (User) — reservas, histórico, fidelidade. LembrarDeMim = refresh token longo.</summary>
    Task<AuthResponse?> LoginGuestAsync(LoginRequest request, string? ip = null, string? device = null, CancellationToken ct = default);
    /// <summary>Login de admin/staff — painel administrativo. Sem refresh token.</summary>
    Task<AuthResponse?> LoginAdminAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    /// <summary>Refresh token — apenas hóspedes.</summary>
    Task<AuthResponse?> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task<bool> LogoutAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task<UserDto?> CreateCollaboratorAsync(CreateCollaboratorRequest request, CancellationToken ct = default);
}
