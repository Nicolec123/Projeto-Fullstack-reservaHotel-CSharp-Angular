using HotelManager.API.Auth;
using HotelManager.API.DTOs.Auth;
using HotelManager.API.Models;
using HotelManager.API.Repositories;
using HotelManager.API.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace HotelManager.API.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo;
    private readonly Mock<ISessionRepository> _sessionRepo;
    private readonly Mock<IJwtService> _jwtService;
    private readonly IConfiguration _config;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepo = new Mock<IUserRepository>();
        _sessionRepo = new Mock<ISessionRepository>();
        _jwtService = new Mock<IJwtService>();
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:GuestAccessTokenExpiresMinutes"] = "60",
                ["Jwt:GuestRefreshTokenExpiresDays"] = "30",
                ["Jwt:AdminAccessTokenExpiresMinutes"] = "480"
            })
            .Build();
        _sut = new AuthService(_userRepo.Object, _sessionRepo.Object, _jwtService.Object, _config);
    }

    [Fact]
    public async Task LoginGuestAsync_UsuarioInexistente_RetornaNull()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var request = new LoginRequest { Email = "naoexiste@test.com", Senha = "Senha@123" };
        var result = await _sut.LoginGuestAsync(request, null, null);

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginGuestAsync_UsuarioNaoEhRoleUser_RetornaNull()
    {
        var admin = new User
        {
            Id = 1,
            Email = "admin@hotel.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            Ativo = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("admin@hotel.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(admin);

        var request = new LoginRequest { Email = "admin@hotel.com", Senha = "Admin@123" };
        var result = await _sut.LoginGuestAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginGuestAsync_UsuarioInativo_RetornaNull()
    {
        var user = new User
        {
            Id = 1,
            Email = "hospede@hotel.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Hospede@123"),
            Role = "User",
            Ativo = false
        };
        _userRepo.Setup(r => r.GetByEmailAsync("hospede@hotel.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var request = new LoginRequest { Email = "hospede@hotel.com", Senha = "Hospede@123" };
        var result = await _sut.LoginGuestAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginGuestAsync_SenhaIncorreta_RetornaNull()
    {
        var user = new User
        {
            Id = 1,
            Email = "hospede@hotel.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Hospede@123"),
            Role = "User",
            Ativo = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("hospede@hotel.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var request = new LoginRequest { Email = "hospede@hotel.com", Senha = "SenhaErrada" };
        var result = await _sut.LoginGuestAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginGuestAsync_CredenciaisValidas_RetornaAuthResponse()
    {
        var user = new User
        {
            Id = 1,
            Nome = "Hóspede",
            Email = "hospede@hotel.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Hospede@123"),
            Role = "User",
            Ativo = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("hospede@hotel.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _userRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _jwtService.Setup(j => j.GenerateGuestAccessToken(It.IsAny<User>())).Returns("access-token");

        var request = new LoginRequest { Email = "hospede@hotel.com", Senha = "Hospede@123", LembrarDeMim = false };
        var result = await _sut.LoginGuestAsync(request);

        Assert.NotNull(result);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("Hóspede", result.Nome);
        Assert.Equal("User", result.Role);
    }

    [Fact]
    public async Task LoginAdminAsync_UsuarioAdminComSenhaCorreta_RetornaAuthResponse()
    {
        var admin = new User
        {
            Id = 1,
            Nome = "Administrador",
            Email = "admin@hotel.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            Ativo = true
        };
        _userRepo.Setup(r => r.GetByEmailAsync("admin@hotel.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(admin);
        _userRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(admin);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(admin);
        _jwtService.Setup(j => j.GenerateAdminAccessToken(It.IsAny<User>())).Returns("admin-token");

        var request = new LoginRequest { Email = "admin@hotel.com", Senha = "Admin@123" };
        var result = await _sut.LoginAdminAsync(request);

        Assert.NotNull(result);
        Assert.Equal("admin-token", result.AccessToken);
        Assert.Equal("Admin", result.Role);
    }

    [Fact]
    public async Task RegisterAsync_EmailJaCadastrado_RetornaNull()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("existente@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = 1, Email = "existente@test.com" });

        var request = new RegisterRequest
        {
            Nome = "Novo",
            Email = "existente@test.com",
            Senha = "Senha@123",
            ConfirmarSenha = "Senha@123"
        };
        var result = await _sut.RegisterAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_SenhasNaoCoincidem_RetornaNull()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var request = new RegisterRequest
        {
            Nome = "Novo",
            Email = "novo@test.com",
            Senha = "Senha@123",
            ConfirmarSenha = "OutraSenha"
        };
        var result = await _sut.RegisterAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task RegisterAsync_DadosValidos_RetornaAuthResponse()
    {
        User? createdUser = null;
        _userRepo.Setup(r => r.GetByEmailAsync("novo@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.CreateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((u, _) => { u.Id = 1; createdUser = u; })
            .ReturnsAsync((User u, CancellationToken _) => u);

        _jwtService.Setup(j => j.GenerateGuestAccessToken(It.IsAny<User>())).Returns("new-token");

        var request = new RegisterRequest
        {
            Nome = "Novo Usuário",
            Email = "novo@test.com",
            Senha = "Senha@123",
            ConfirmarSenha = "Senha@123"
        };
        var result = await _sut.RegisterAsync(request);

        Assert.NotNull(result);
        Assert.Equal("new-token", result.AccessToken);
        Assert.Equal("Novo Usuário", result.Nome);
        Assert.NotNull(createdUser);
        Assert.Equal("User", createdUser.Role);
    }
}
