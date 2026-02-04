namespace HotelManager.API.Models;

public class Guest
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Cpf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    public string? Telefone { get; set; }
    public string Tipo { get; set; } = "Adulto"; // Adulto, Criança
    public int? Idade { get; set; } // Para crianças

    public Reservation Reservation { get; set; } = null!;
}
