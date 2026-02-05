using HotelManager.API.DTOs.Room;
using HotelManager.API.Models;
using HotelManager.API.Repositories;
using HotelManager.API.Services;
using Moq;
using Xunit;

namespace HotelManager.API.Tests.Services;

public class RoomServiceTests
{
    private readonly Mock<IRoomRepository> _roomRepo;
    private readonly Mock<IReservationRepository> _reservationRepo;
    private readonly RoomService _sut;

    public RoomServiceTests()
    {
        _roomRepo = new Mock<IRoomRepository>();
        _reservationRepo = new Mock<IReservationRepository>();
        _sut = new RoomService(_roomRepo.Object, _reservationRepo.Object);
    }

    [Fact]
    public async Task GetByIdAsync_QuartoInexistente_RetornaNull()
    {
        _roomRepo.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room?)null);

        var result = await _sut.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_QuartoExistente_RetornaDto()
    {
        var room = new Room { Id = 1, Numero = "101", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = false };
        _roomRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(room);

        var result = await _sut.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("101", result.Numero);
        Assert.Equal("Standard", result.Tipo);
        Assert.Equal(150, result.PrecoDiaria);
        Assert.False(result.Bloqueado);
    }

    [Fact]
    public async Task GetAvailableAsync_QuartoBloqueado_NaoRetornaNaLista()
    {
        var rooms = new List<Room>
        {
            new() { Id = 1, Numero = "1", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = true },
            new() { Id = 2, Numero = "2", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = false }
        };
        _roomRepo.Setup(r => r.GetAllAsync(1, 1000, It.IsAny<CancellationToken>())).ReturnsAsync(rooms);
        _reservationRepo.Setup(r => r.HasConflictAsync(2, It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.GetAvailableAsync(DateTime.Today.AddDays(1), DateTime.Today.AddDays(3));

        Assert.Single(result);
        Assert.Equal(2, result[0].Id);
    }

    [Fact]
    public async Task CreateAsync_NumeroJaExistente_RetornaNull()
    {
        _roomRepo.Setup(r => r.GetByNumeroAsync("101", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Room { Id = 1, Numero = "101" });

        var request = new CreateRoomRequest { Numero = "101", Tipo = "Standard", PrecoDiaria = 150 };
        var result = await _sut.CreateAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_DadosValidos_RetornaRoomDto()
    {
        _roomRepo.Setup(r => r.GetByNumeroAsync("201", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room?)null);
        Room? created = null;
        _roomRepo.Setup(r => r.CreateAsync(It.IsAny<Room>(), It.IsAny<CancellationToken>()))
            .Callback<Room, CancellationToken>((room, _) => { room.Id = 5; created = room; })
            .ReturnsAsync((Room r, CancellationToken _) => r);

        var request = new CreateRoomRequest { Numero = "201", Tipo = "Luxo", PrecoDiaria = 250 };
        var result = await _sut.CreateAsync(request);

        Assert.NotNull(result);
        Assert.Equal(5, result.Id);
        Assert.Equal("201", result.Numero);
        Assert.Equal("Luxo", result.Tipo);
        Assert.Equal(250, result.PrecoDiaria);
    }

    [Fact]
    public async Task UpdateAsync_QuartoInexistente_RetornaNull()
    {
        _roomRepo.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room?)null);

        var request = new UpdateRoomRequest { Bloqueado = true };
        var result = await _sut.UpdateAsync(999, request);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_QuartoExistente_AtualizaERetornaDto()
    {
        var room = new Room { Id = 1, Numero = "101", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = false };
        _roomRepo.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(room);
        _roomRepo.Setup(r => r.UpdateAsync(It.IsAny<Room>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Room r, CancellationToken _) => r);

        var request = new UpdateRoomRequest { Bloqueado = true, PrecoDiaria = 180 };
        var result = await _sut.UpdateAsync(1, request);

        Assert.NotNull(result);
        Assert.True(result.Bloqueado);
        Assert.Equal(180, result.PrecoDiaria);
    }
}
