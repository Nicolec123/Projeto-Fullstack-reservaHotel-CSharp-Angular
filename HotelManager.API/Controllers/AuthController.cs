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

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        if (result == null)
            return Unauthorized(new { message = "Email ou senha inválidos." });
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
}
