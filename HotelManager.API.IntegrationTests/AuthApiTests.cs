using System.Net;
using System.Net.Http.Json;
using HotelManager.API.DTOs.Auth;
using Xunit;

namespace HotelManager.API.IntegrationTests;

public class AuthApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ComCredenciaisInvalidas_Retorna401()
    {
        var request = new LoginRequest { Email = "invalido@test.com", Senha = "wrong" };
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_ComHospedeSeed_Retorna200EToken()
    {
        var request = new LoginRequest
        {
            Email = "hospede@hotel.com",
            Senha = "Hospede@123",
            LembrarDeMim = false
        };
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);
        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.NotEmpty(auth.AccessToken);
        Assert.Equal("User", auth.Role);
        Assert.Equal("Hóspede Teste", auth.Nome);
    }

    [Fact]
    public async Task Login_AdminSeed_Retorna200EToken()
    {
        var request = new LoginRequest { Email = "admin@hotel.com", Senha = "Admin@123" };
        var response = await _client.PostAsJsonAsync("/api/admin/login", request);
        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.NotEmpty(auth.AccessToken);
        Assert.Equal("Admin", auth.Role);
    }

    [Fact]
    public async Task Register_EmailNovo_Retorna200ECriaUsuario()
    {
        var email = $"novo{Guid.NewGuid():N}@test.com";
        var request = new RegisterRequest
        {
            Nome = "Novo Usuário",
            Email = email,
            Senha = "Senha@123",
            ConfirmarSenha = "Senha@123"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.Equal(email, auth.Email);
        Assert.Equal("User", auth.Role);
    }

    [Fact]
    public async Task Register_SenhasDiferentes_Retorna400()
    {
        var request = new RegisterRequest
        {
            Nome = "Test",
            Email = "test@test.com",
            Senha = "Senha@123",
            ConfirmarSenha = "OutraSenha"
        };
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
