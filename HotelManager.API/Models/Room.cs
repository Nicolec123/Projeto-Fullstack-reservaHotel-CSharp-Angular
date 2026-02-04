namespace HotelManager.API.Models;

public class Room
{
    public int Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // Standard, Luxo, Suíte
    public decimal PrecoDiaria { get; set; }
    public bool Bloqueado { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
