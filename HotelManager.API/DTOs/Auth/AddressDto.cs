using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.Auth;

public class AddressDto
{
    [Required(ErrorMessage = "Rua é obrigatória")]
    [StringLength(200)]
    public string Rua { get; set; } = string.Empty;
    
    public string? Numero { get; set; }
    
    public string? Complemento { get; set; }
    
    [Required(ErrorMessage = "Bairro é obrigatório")]
    [StringLength(100)]
    public string Bairro { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Cidade é obrigatória")]
    [StringLength(100)]
    public string Cidade { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Estado é obrigatório")]
    [StringLength(50)]
    public string Estado { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "CEP é obrigatório")]
    [StringLength(10)]
    public string Cep { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "País é obrigatório")]
    [StringLength(50)]
    public string Pais { get; set; } = string.Empty;
}
