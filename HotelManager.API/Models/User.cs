namespace HotelManager.API.Models;

public class User
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin | User (Hóspede)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Dados essenciais
    public string? Telefone { get; set; }
    
    // Dados comuns em hotéis
    public string? Cpf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    
    // Dados opcionais
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Pais { get; set; }
    public string? IdiomaPreferido { get; set; }
    
    // Preferências de estadia
    public string? TipoCamaPreferido { get; set; } // King, Twin, etc
    public bool? AndarAlto { get; set; }
    public bool? QuartoSilencioso { get; set; }
    public bool? NaoFumante { get; set; }
    public bool? Acessibilidade { get; set; }
    public string? PreferenciaAlimentar { get; set; }

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
