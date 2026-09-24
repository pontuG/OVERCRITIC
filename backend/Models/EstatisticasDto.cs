namespace Overcritic.Api.Models;

public class EstatisticasDto
{
    public int TotalJogos { get; set; }
    public int TotalMidias { get; set; }
    public int TotalPlatinas { get; set; }
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
