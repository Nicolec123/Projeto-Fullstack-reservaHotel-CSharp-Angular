namespace HotelManager.API.DTOs.Reservation;

/// <summary>
/// Informações sobre a política de cancelamento para uma reserva (regra 48h).
/// </summary>
public class CancellationInfoDto
{
    /// <summary>True se o cancelamento for dentro de 48h do check-in (será cobrada 1 diária).</summary>
    public bool AplicaTaxa { get; set; }

    /// <summary>Valor da taxa em reais (1 diária do quarto). Zero se cancelamento gratuito.</summary>
    public decimal ValorTaxa { get; set; }

    /// <summary>Mensagem explicativa para exibir ao usuário.</summary>
    public string Mensagem { get; set; } = string.Empty;
}
