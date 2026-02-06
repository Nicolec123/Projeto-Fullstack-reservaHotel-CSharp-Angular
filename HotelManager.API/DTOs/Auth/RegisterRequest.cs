using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.Auth;

public class RegisterRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [StringLength(100, MinimumLength = 6)]
    public string Senha { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
    public string ConfirmarSenha { get; set; } = string.Empty;

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

    // Preferências de estadia (opcional)
    public string? TipoCamaPreferido { get; set; }
    public bool? AndarAlto { get; set; }
    public bool? QuartoSilencioso { get; set; }
    public bool? NaoFumante { get; set; }
    public bool? Acessibilidade { get; set; }
    public string? PreferenciaAlimentar { get; set; }

    // Endereço completo
    public AddressDto? EnderecoCompleto { get; set; }

    // Contato de emergência
    public EmergencyContactDto? ContatoEmergencia { get; set; }

    // Dependentes
    public List<DependentDto>? Dependentes { get; set; }
}
