namespace HotelManager.API.Models;

public class Reservation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = "Confirmada"; // Confirmada, Cancelada, Concluída, Pendente
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Ocupação
    public int Adultos { get; set; } = 1;
    public int Criancas { get; set; } = 0;
    public int Pets { get; set; } = 0;
    public string? Observacoes { get; set; }

    // Pagamento
    public string? MetodoPagamento { get; set; } // CartaoCredito, Pix, Boleto
    public string? StatusPagamento { get; set; } // Pendente, Pago, Cancelado
    public decimal? ValorTotal { get; set; }
    public string? CodigoPix { get; set; }
    public string? CodigoBoleto { get; set; }
    public string? TokenPagamento { get; set; } // Token do cartão (simulado)
    public DateTime? DataPagamento { get; set; }

    public User User { get; set; } = null!;
    public Room Room { get; set; } = null!;
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
}
