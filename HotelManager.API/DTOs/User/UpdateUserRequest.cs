using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.User;

public class UpdateUserRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Telefone { get; set; }
    public string? Cpf { get; set; }
    public DateTime? DataNascimento { get; set; }
    public string? Nacionalidade { get; set; }
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Pais { get; set; }
    public string? IdiomaPreferido { get; set; }
    public string? TipoCamaPreferido { get; set; }
    public bool? AndarAlto { get; set; }
    public bool? QuartoSilencioso { get; set; }
    public bool? NaoFumante { get; set; }
    public bool? Acessibilidade { get; set; }
    public string? PreferenciaAlimentar { get; set; }
    public bool? Ativo { get; set; }
    
    // Role só pode ser alterada por Admin
    public string? Role { get; set; }
}
