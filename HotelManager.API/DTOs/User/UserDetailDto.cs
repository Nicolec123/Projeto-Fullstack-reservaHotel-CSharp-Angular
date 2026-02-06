namespace HotelManager.API.DTOs.User;

public class UserDetailDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool Ativo { get; set; } = true;
    
    // Dados de contato
    public string? Telefone { get; set; }
    
    // Dados pessoais
    public string? Cpf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    
    // Endereço
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Pais { get; set; }
    
    // Preferências
    public string? IdiomaPreferido { get; set; }
    public string? TipoCamaPreferido { get; set; }
    public bool? AndarAlto { get; set; }
    public bool? QuartoSilencioso { get; set; }
    public bool? NaoFumante { get; set; }
    public bool? Acessibilidade { get; set; }
    public string? PreferenciaAlimentar { get; set; }
}
