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
    [Authorize(Roles = "Admin,Gerente,Recepcionista")]
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

    [HttpGet("users/{id}")]
    [Authorize(Roles = "Admin,Gerente,Recepcionista")]
    public async Task<ActionResult<UserDetailDto>> GetUser(int id, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(id, ct);
        if (user == null)
            return NotFound(new { message = "Usuário não encontrado." });
        
        return Ok(new UserDetailDto
        {
            Id = user.Id,
            Nome = user.Nome,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            Ativo = user.Ativo,
            Telefone = user.Telefone,
            Cpf = user.Cpf,
            DataNascimento = user.DataNascimento,
            Nacionalidade = user.Nacionalidade,
            Endereco = user.Endereco,
            Cidade = user.Cidade,
            Pais = user.Pais,
            IdiomaPreferido = user.IdiomaPreferido,
            TipoCamaPreferido = user.TipoCamaPreferido,
            AndarAlto = user.AndarAlto,
            QuartoSilencioso = user.QuartoSilencioso,
            NaoFumante = user.NaoFumante,
            Acessibilidade = user.Acessibilidade,
            PreferenciaAlimentar = user.PreferenciaAlimentar
        });
    }

    [HttpPut("users/{id}")]
    [Authorize(Roles = "Admin,Gerente,Recepcionista")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(id, ct);
        if (user == null)
            return NotFound(new { message = "Usuário não encontrado." });

        // Verificar se email já está em uso por outro usuário
        if (request.Email != user.Email)
        {
            var existingUser = await _userRepo.GetByEmailAsync(request.Email, ct);
            if (existingUser != null && existingUser.Id != id)
                return BadRequest(new { message = "Email já está em uso por outro usuário." });
        }

        // Verificar permissões para alterar role
        var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        if (request.Role != null && request.Role != user.Role)
        {
            // Apenas Admin pode alterar roles para Admin/Gerente/Recepcionista
            if (currentUserRole != "Admin" && (request.Role == "Admin" || request.Role == "Gerente" || request.Role == "Recepcionista"))
                return StatusCode(403, new { message = "Apenas administradores podem alterar roles de colaboradores." });
        }

        // Atualizar campos obrigatórios
        user.Nome = request.Nome;
        user.Email = request.Email;
        
        // Atualizar campos opcionais (sempre atualizar quando presentes no request)
        user.Telefone = request.Telefone;
        user.Cpf = request.Cpf;
        user.DataNascimento = request.DataNascimento;
        user.Nacionalidade = request.Nacionalidade;
        user.Endereco = request.Endereco;
        user.Cidade = request.Cidade;
        user.Pais = request.Pais;
        user.IdiomaPreferido = request.IdiomaPreferido;
        user.TipoCamaPreferido = request.TipoCamaPreferido;
        user.PreferenciaAlimentar = request.PreferenciaAlimentar;
        
        // Campos booleanos opcionais
        if (request.AndarAlto.HasValue)
            user.AndarAlto = request.AndarAlto.Value;
        if (request.QuartoSilencioso.HasValue)
            user.QuartoSilencioso = request.QuartoSilencioso.Value;
        if (request.NaoFumante.HasValue)
            user.NaoFumante = request.NaoFumante.Value;
        if (request.Acessibilidade.HasValue)
            user.Acessibilidade = request.Acessibilidade.Value;
        if (request.Ativo.HasValue)
            user.Ativo = request.Ativo.Value;
        
        // Apenas Admin pode alterar role
        if (request.Role != null && currentUserRole == "Admin")
            user.Role = request.Role;

        await _userRepo.UpdateAsync(user, ct);

        return Ok(new UserDto
        {
            Id = user.Id,
            Nome = user.Nome,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        });
    }
}
