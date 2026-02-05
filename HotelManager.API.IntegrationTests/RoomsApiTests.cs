using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace HotelManager.API.IntegrationTests;

public class RoomsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RoomsApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetRooms_SemAuth_Retorna200ELista()
    {
        var response = await _client.GetAsync("/api/rooms");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("items", out var items));
        Assert.True(items.GetArrayLength() >= 0);
    }

    [Fact]
    public async Task GetRooms_Paginacao_RetornaItemsETotal()
    {
        var response = await _client.GetAsync("/api/rooms?page=1&pageSize=2");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("items", out var items));
        Assert.True(json.TryGetProperty("total", out var total));
        Assert.True(items.GetArrayLength() <= 2);
        Assert.True(total.GetInt32() >= 0);
    }

    [Fact]
    public async Task GetRoomById_Existente_Retorna200()
    {
        var response = await _client.GetAsync("/api/rooms/1");
        response.EnsureSuccessStatusCode();
        var room = await response.Content.ReadFromJsonAsync<RoomDto>();
        Assert.NotNull(room);
        Assert.Equal(1, room.Id);
        Assert.NotEmpty(room.Numero);
    }

    [Fact]
    public async Task GetRoomById_Inexistente_Retorna404()
    {
        var response = await _client.GetAsync("/api/rooms/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetAvailable_PeriodoValido_Retorna200()
    {
        var dataInicio = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd");
        var dataFim = DateTime.UtcNow.AddDays(12).ToString("yyyy-MM-dd");
        var response = await _client.GetAsync($"/api/rooms/available?dataInicio={dataInicio}&dataFim={dataFim}");
        response.EnsureSuccessStatusCode();
        var list = await response.Content.ReadFromJsonAsync<List<RoomDto>>();
        Assert.NotNull(list);
    }

    private class RoomDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = "";
        public string Tipo { get; set; } = "";
        public decimal PrecoDiaria { get; set; }
        public bool Bloqueado { get; set; }
    }
}
