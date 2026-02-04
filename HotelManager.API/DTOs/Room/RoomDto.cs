namespace HotelManager.API.DTOs.Room;

public class RoomDto
{
    public int Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal PrecoDiaria { get; set; }
    public bool Bloqueado { get; set; }
}

public class CreateRoomRequest
{
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal PrecoDiaria { get; set; }
}

public class UpdateRoomRequest
{
    public string? Tipo { get; set; }
    public decimal? PrecoDiaria { get; set; }
    public bool? Bloqueado { get; set; }
}
