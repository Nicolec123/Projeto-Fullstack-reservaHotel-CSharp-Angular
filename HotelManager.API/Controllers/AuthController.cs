using Microsoft.AspNetCore.Mvc;
using HotelManager.API.DTOs.Auth;
using HotelManager.API.Services;

namespace HotelManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Login de hóspede. LembrarDeMim = refresh token longo (7-30 dias).</summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var device = HttpContext.Request.Headers.UserAgent.FirstOrDefault();
        var result = await _authService.LoginGuestAsync(request, ip, device, ct);
        if (result == null)
            return Unauthorized(new { message = "Email ou senha inválidos, ou conta inativa." });
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (request.Senha != request.ConfirmarSenha)
            return BadRequest(new { message = "As senhas não coincidem." });

        var result = await _authService.RegisterAsync(request, ct);
        if (result == null)
            return BadRequest(new { message = "Email já cadastrado ou dados inválidos." });
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request, ct);
        if (result == null)
            return Unauthorized(new { message = "Refresh token inválido ou expirado." });
        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequest? request, CancellationToken ct)
    {
        await _authService.LogoutAsync(request ?? new RefreshTokenRequest { RefreshToken = "" }, ct);
        return Ok(new { message = "Logout realizado." });
    }
}
