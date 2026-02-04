namespace HotelManager.API.DTOs.Reservation;

public class ReservationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public string? UserNome { get; set; }
    public string? RoomNumero { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? PrecoTotal { get; set; }
    public string? MetodoPagamento { get; set; }
    public string? StatusPagamento { get; set; }
    public string? CodigoPix { get; set; }
    public string? CodigoBoleto { get; set; }
}

public class GuestDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Cpf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    public string? Telefone { get; set; }
    public string Tipo { get; set; } = "Adulto";
    public int? Idade { get; set; }
}

public class CreateReservationRequest
{
    public int RoomId { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public int Adultos { get; set; } = 1;
    public int Criancas { get; set; } = 0;
    public int Pets { get; set; } = 0;
    public string? Observacoes { get; set; }
    public string? MetodoPagamento { get; set; } // CartaoCredito, Pix, Boleto
    public string? TokenPagamento { get; set; } // Para cartão (simulado)
    public List<GuestDto>? Guests { get; set; }
}

public class AvailabilityRequest
{
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
}
