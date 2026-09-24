using System.Text.Json.Serialization;

namespace Overcritic.Api.Models;

public class Platina
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("usuario")]
    public string Usuario { get; set; } = "Visitante";

    [JsonPropertyName("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [JsonPropertyName("plataforma")]
    public string Plataforma { get; set; } = "PC";

    [JsonPropertyName("dificuldade")]
    public string? Dificuldade { get; set; }

    [JsonPropertyName("horas")]
    public int? Horas { get; set; }

    [JsonPropertyName("data_conquista")]
    public string? DataConquista { get; set; }

    [JsonPropertyName("nota")]
    public decimal? Nota { get; set; }

    [JsonPropertyName("relato")]
    public string? Relato { get; set; }

    [JsonPropertyName("cover_url")]
    public string? CoverUrl { get; set; }

    [JsonPropertyName("badges")]
    public List<string>? Badges { get; set; } = new();
}
