namespace HotelManager.API.Models;

public class User
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin | Gerente | Recepcionista | User (Hóspede)
    public bool Ativo { get; set; } = true;
    public DateTime? UltimoLogin { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public int? HotelId { get; set; } // multi-hotel: futuro
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

    // Relações
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<EmergencyContact> EmergencyContacts { get; set; } = new List<EmergencyContact>();
    public ICollection<Dependent> Dependents { get; set; } = new List<Dependent>();
}
