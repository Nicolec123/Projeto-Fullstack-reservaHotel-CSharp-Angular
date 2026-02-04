using HotelManager.API.Auth;
using HotelManager.API.DTOs.Auth;
using HotelManager.API.Models;
using HotelManager.API.Repositories;

namespace HotelManager.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, IJwtService jwtService, IConfiguration config)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _config = config;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email, ct);
        if (user == null)
            return null;

        if (!VerifyPassword(request.Senha, user.SenhaHash))
            return null;

        var token = _jwtService.GenerateToken(user);
        var expires = DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpiresHours"] ?? "24"));

        return new AuthResponse
        {
            Token = token,
            Email = user.Email,
            Nome = user.Nome,
            Role = user.Role,
            UserId = user.Id,
            ExpiresAt = expires
        };
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
        var token = _jwtService.GenerateToken(user);
        var expires = DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpiresHours"] ?? "24"));

        return new AuthResponse
        {
            Token = token,
            Email = user.Email,
            Nome = user.Nome,
            Role = user.Role,
            UserId = user.Id,
            ExpiresAt = expires
        };
    }

    private static string HashPassword(string senha)
    {
        return BCrypt.Net.BCrypt.HashPassword(senha, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    private static bool VerifyPassword(string senha, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(senha, hash);
    }
}
