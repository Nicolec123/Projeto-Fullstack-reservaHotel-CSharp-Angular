namespace HotelManager.API.Models;

public class Dependent
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string Nome { get; set; } = string.Empty;
    public DateTime? DataNascimento { get; set; }
    public string? Cpf { get; set; }
    public string NivelDependente { get; set; } = string.Empty; // Ex: Cônjuge, Filho, Pai, Mãe, Outro
    public string? Observacoes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
