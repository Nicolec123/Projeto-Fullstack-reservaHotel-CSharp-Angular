using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.Auth;

public class DependentDto
{
    [Required(ErrorMessage = "Nome do dependente é obrigatório")]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;
    
    public DateTime? DataNascimento { get; set; }
    
    public string? Cpf { get; set; }
    
    [Required(ErrorMessage = "Nível de dependente é obrigatório")]
    [StringLength(50)]
    public string NivelDependente { get; set; } = string.Empty; // Ex: Cônjuge, Filho, Pai, Mãe, Outro
    
    public string? Observacoes { get; set; }
}
