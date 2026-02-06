using HotelManager.API.Auth;
using HotelManager.API.Data;
using HotelManager.API.DTOs.Auth;
using HotelManager.API.DTOs.User;
using HotelManager.API.Models;
using HotelManager.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelManager.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ISessionRepository _sessionRepo;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _config;
    private readonly ApplicationDbContext _db;

    public AuthService(IUserRepository userRepo, ISessionRepository sessionRepo, IJwtService jwtService, IConfiguration config, ApplicationDbContext db)
    {
        _userRepo = userRepo;
        _sessionRepo = sessionRepo;
        _jwtService = jwtService;
        _config = config;
        _db = db;
    }

    public async Task<AuthResponse?> LoginGuestAsync(LoginRequest request, string? ip = null, string? device = null, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email, ct);
        if (user == null || user.Role != "User")
            return null;

        if (!user.Ativo)
            return null;

        if (!VerifyPassword(request.Senha, user.SenhaHash))
            return null;

        var userToUpdate = await _userRepo.GetByIdAsync(user.Id, ct);
        if (userToUpdate != null)
        {
            userToUpdate.UltimoLogin = DateTime.UtcNow;
            await _userRepo.UpdateAsync(userToUpdate, ct);
        }

        var accessToken = _jwtService.GenerateGuestAccessToken(user);
        var accessExpiresMinutes = int.Parse(_config["Jwt:GuestAccessTokenExpiresMinutes"] ?? "60");
        var accessExpires = DateTime.UtcNow.AddMinutes(accessExpiresMinutes);

        if (request.LembrarDeMim)
        {
            var refreshToken = _jwtService.GenerateRefreshToken();
            var refreshHash = _jwtService.HashRefreshToken(refreshToken);
            var refreshExpiresDays = int.Parse(_config["Jwt:GuestRefreshTokenExpiresDays"] ?? "30");
            var refreshExpiresAt = DateTime.UtcNow.AddDays(refreshExpiresDays);

            var session = new Session
            {
                SessionId = Guid.NewGuid(),
                UserId = user.Id,
                RefreshTokenHash = refreshHash,
                Ip = ip,
                Device = device,
                ExpiresAt = refreshExpiresAt
            };
            await _sessionRepo.CreateAsync(session, ct);

            return BuildGuestAuthResponse(user, accessToken, accessExpires, refreshToken, refreshExpiresAt);
        }

        return BuildGuestAuthResponse(user, accessToken, accessExpires, null, null);
    }

    public async Task<AuthResponse?> LoginAdminAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email, ct);
        if (user == null || !IsStaff(user.Role))
            return null;

        if (!user.Ativo)
            return null;

        if (!VerifyPassword(request.Senha, user.SenhaHash))
            return null;

        var userToUpdate = await _userRepo.GetByIdAsync(user.Id, ct);
        if (userToUpdate != null)
        {
            userToUpdate.UltimoLogin = DateTime.UtcNow;
            await _userRepo.UpdateAsync(userToUpdate, ct);
        }

        var accessToken = _jwtService.GenerateAdminAccessToken(user);
        var expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:AdminAccessTokenExpiresMinutes"] ?? "480"));
        return BuildAdminAuthResponse(user, accessToken, expires);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _userRepo.GetByEmailAsync(request.Email, ct) != null)
            return null;

        if (request.Senha != request.ConfirmarSenha)
            return null; // Senhas não coincidem

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            SenhaHash = HashPassword(request.Senha),
            Role = "User",
            Telefone = request.Telefone,
            Cpf = request.Cpf,
            DataNascimento = request.DataNascimento,
            Nacionalidade = request.Nacionalidade,
            Endereco = request.Endereco,
            Cidade = request.Cidade,
            Pais = request.Pais,
            IdiomaPreferido = request.IdiomaPreferido,
            TipoCamaPreferido = request.TipoCamaPreferido,
            AndarAlto = request.AndarAlto,
            QuartoSilencioso = request.QuartoSilencioso,
            NaoFumante = request.NaoFumante,
            Acessibilidade = request.Acessibilidade,
            PreferenciaAlimentar = request.PreferenciaAlimentar
        };

        user = await _userRepo.CreateAsync(user, ct);

        // Salvar endereço completo se fornecido
        if (request.EnderecoCompleto != null)
        {
            var address = new Address
            {
                UserId = user.Id,
                Rua = request.EnderecoCompleto.Rua,
                Numero = request.EnderecoCompleto.Numero,
                Complemento = request.EnderecoCompleto.Complemento,
                Bairro = request.EnderecoCompleto.Bairro,
                Cidade = request.EnderecoCompleto.Cidade,
                Estado = request.EnderecoCompleto.Estado,
                Cep = request.EnderecoCompleto.Cep,
                Pais = request.EnderecoCompleto.Pais
            };
            _db.Addresses.Add(address);
        }

        // Salvar contato de emergência se fornecido
        if (request.ContatoEmergencia != null)
        {
            var emergencyContact = new EmergencyContact
            {
                UserId = user.Id,
                Nome = request.ContatoEmergencia.Nome,
                Telefone = request.ContatoEmergencia.Telefone,
                Email = request.ContatoEmergencia.Email,
                Relacao = request.ContatoEmergencia.Relacao
            };
            _db.EmergencyContacts.Add(emergencyContact);
        }

        // Salvar dependentes se fornecidos
        if (request.Dependentes != null && request.Dependentes.Any())
        {
            foreach (var depDto in request.Dependentes)
            {
                var dependent = new Dependent
                {
                    UserId = user.Id,
                    Nome = depDto.Nome,
                    DataNascimento = depDto.DataNascimento,
                    Cpf = depDto.Cpf,
                    NivelDependente = depDto.NivelDependente,
                    Observacoes = depDto.Observacoes
                };
                _db.Dependents.Add(dependent);
            }
        }

        // Salvar todas as alterações relacionadas
        await _db.SaveChangesAsync(ct);

        var accessToken = _jwtService.GenerateGuestAccessToken(user);
        var accessExpires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:GuestAccessTokenExpiresMinutes"] ?? "60"));
        var refreshExpiresDays = int.Parse(_config["Jwt:GuestRefreshTokenExpiresDays"] ?? "30");
        var refreshToken = _jwtService.GenerateRefreshToken();
        var refreshHash = _jwtService.HashRefreshToken(refreshToken);
        var refreshExpiresAt = DateTime.UtcNow.AddDays(refreshExpiresDays);

        var session = new Session
        {
            SessionId = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = refreshHash,
            ExpiresAt = refreshExpiresAt
        };
        await _sessionRepo.CreateAsync(session, ct);

        return BuildGuestAuthResponse(user, accessToken, accessExpires, refreshToken, refreshExpiresAt);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var refreshHash = _jwtService.HashRefreshToken(request.RefreshToken);
        var session = await _sessionRepo.GetValidByRefreshTokenHashAsync(refreshHash, ct);
        if (session == null)
            return null;

        var user = session.User;
        if (!user.Ativo || user.Role != "User")
        {
            await _sessionRepo.InvalidateByRefreshTokenHashAsync(refreshHash, ct);
            return null;
        }

        await _sessionRepo.InvalidateByRefreshTokenHashAsync(refreshHash, ct);

        var accessToken = _jwtService.GenerateGuestAccessToken(user);
        var accessExpires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:GuestAccessTokenExpiresMinutes"] ?? "60"));
        var refreshExpiresDays = int.Parse(_config["Jwt:GuestRefreshTokenExpiresDays"] ?? "30");
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var newRefreshHash = _jwtService.HashRefreshToken(newRefreshToken);
        var refreshExpiresAt = DateTime.UtcNow.AddDays(refreshExpiresDays);

        var newSession = new Session
        {
            SessionId = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = newRefreshHash,
            Ip = session.Ip,
            Device = session.Device,
            ExpiresAt = refreshExpiresAt
        };
        await _sessionRepo.CreateAsync(newSession, ct);

        return BuildGuestAuthResponse(user, accessToken, accessExpires, newRefreshToken, refreshExpiresAt);
    }

    public async Task<bool> LogoutAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var refreshHash = _jwtService.HashRefreshToken(request.RefreshToken);
        var session = await _sessionRepo.GetValidByRefreshTokenHashAsync(refreshHash, ct);
        if (session == null)
            return true;
        await _sessionRepo.InvalidateByRefreshTokenHashAsync(refreshHash, ct);
        return true;
    }

    public async Task<UserDto?> CreateCollaboratorAsync(CreateCollaboratorRequest request, CancellationToken ct = default)
    {
        var role = request.Nivel switch
        {
            "Gerente" => "Gerente",
            "Recepcionista" => "Recepcionista",
            _ => null
        };
        if (role == null)
            return null;

        if (await _userRepo.GetByEmailAsync(request.Email, ct) != null)
            return null;

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            SenhaHash = HashPassword(request.Senha),
            Role = role
        };
        user = await _userRepo.CreateAsync(user, ct);
        return new UserDto { Id = user.Id, Nome = user.Nome, Email = user.Email, Role = user.Role, CreatedAt = user.CreatedAt };
    }

    private static string HashPassword(string senha)
    {
        return BCrypt.Net.BCrypt.HashPassword(senha, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    private static bool VerifyPassword(string senha, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(senha, hash);
    }

    private static bool IsStaff(string role) =>
        role is "Admin" or "Gerente" or "Recepcionista";

    private static AuthResponse BuildGuestAuthResponse(
        User user,
        string accessToken,
        DateTime accessExpires,
        string? refreshToken,
        DateTime? refreshExpiresAt)
    {
        return new AuthResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = accessExpires,
            RefreshTokenExpiresAt = refreshExpiresAt,
            Email = user.Email,
            Nome = user.Nome,
            Role = user.Role,
            Tipo = "guest",
            UserId = user.Id,
            Permissions = "none"
        };
    }

    private static AuthResponse BuildAdminAuthResponse(User user, string accessToken, DateTime expires)
    {
        var permissions = user.Role switch
        {
            "Admin" => "all",
            "Gerente" => "manage,reservations,rooms,guests,reports",
            "Recepcionista" => "reservations,rooms,guests",
            _ => "none"
        };
        return new AuthResponse
        {
            Token = accessToken,
            RefreshToken = null,
            ExpiresAt = expires,
            RefreshTokenExpiresAt = null,
            Email = user.Email,
            Nome = user.Nome,
            Role = user.Role,
            Tipo = "admin",
            UserId = user.Id,
            Permissions = permissions
        };
    }
}
