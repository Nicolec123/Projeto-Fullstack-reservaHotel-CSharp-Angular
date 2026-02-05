using System.ComponentModel.DataAnnotations;

namespace HotelManager.API.DTOs.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    public string Senha { get; set; } = string.Empty;

    /// <summary>Se true, usa refresh token longo (7-30 dias). Caso contrário, sessão curta (~24h).</summary>
    public bool LembrarDeMim { get; set; }
}
