using System.Text.Json.Serialization;

namespace Overcritic.Api.Models;

public class TicketSuporte
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("autor")]
    public string Autor { get; set; } = "Visitante";

    [JsonPropertyName("assunto")]
    public string Assunto { get; set; } = string.Empty;

    [JsonPropertyName("categoria")]
    public string Categoria { get; set; } = "Geral";

    [JsonPropertyName("mensagem")]
    public string Mensagem { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Aberto";

    [JsonPropertyName("data")]
    public string Data { get; set; } = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm");

    [JsonPropertyName("respostas")]
    public List<object>? Respostas { get; set; } = new();
}
