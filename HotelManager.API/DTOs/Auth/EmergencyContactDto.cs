using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.Auth;

public class EmergencyContactDto
{
    [Required(ErrorMessage = "Nome do contato de emergência é obrigatório")]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Telefone do contato de emergência é obrigatório")]
    [StringLength(20)]
    public string Telefone { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? Relacao { get; set; } // Ex: Cônjuge, Pai, Mãe, Amigo, etc.
}
