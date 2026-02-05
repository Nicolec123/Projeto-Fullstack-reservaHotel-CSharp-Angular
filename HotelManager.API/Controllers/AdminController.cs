using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManager.API.DTOs.Auth;
using HotelManager.API.DTOs.Common;
using HotelManager.API.DTOs.User;
using HotelManager.API.Repositories;
using HotelManager.API.Services;

namespace HotelManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly IAuthService _authService;

    public AdminController(IUserRepository userRepo, IAuthService authService)
    {
        _userRepo = userRepo;
        _authService = authService;
    }

    /// <summary>Login de admin/staff — painel administrativo. Sem refresh token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAdminAsync(request, ct);
        if (result == null)
            return Unauthorized(new { message = "Email ou senha inválidos." });
        return Ok(result);
    }

    [HttpPost("collaborators")]
    [Authorize(Roles = "Admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateCollaborator([FromBody] CreateCollaboratorRequest request, CancellationToken ct)
    {
        var user = await _authService.CreateCollaboratorAsync(request, ct);
        if (user == null)
            return BadRequest(new { message = "Email já cadastrado ou nível inválido. Use: Gerente ou Recepcionista." });
        return Created("/api/admin/users", user);
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Gerente")]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (pageSize > 50) pageSize = 50;
        var users = await _userRepo.GetAllAsync(page, pageSize, ct);
        var total = await _userRepo.CountAsync(ct);
        var items = users.Select(u => new UserDto
        {
            Id = u.Id,
            Nome = u.Nome,
            Email = u.Email,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        }).ToList();
        return Ok(new PagedResult<UserDto> { Items = items, Total = total, Page = page, PageSize = pageSize });
    }
}
