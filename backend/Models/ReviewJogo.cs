using System.Text.Json.Serialization;

namespace Overcritic.Api.Models;

public class ReviewJogo
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("autor")]
    public string Autor { get; set; } = "Anônimo";

    [JsonPropertyName("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [JsonPropertyName("generos")]
    public string? Generos { get; set; }

    [JsonPropertyName("palavras_chave")]
    public string? PalavrasChave { get; set; }

    [JsonPropertyName("media_internet")]
    public string? MediaInternet { get; set; }

    [JsonPropertyName("plataforma")]
    public string? Plataforma { get; set; }

    [JsonPropertyName("minha_nota")]
    public decimal? MinhaNota { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("review")]
    public string? Review { get; set; }

    [JsonPropertyName("capa_url")]
    public string? CapaUrl { get; set; }

    [JsonPropertyName("data_registro")]
    public string? DataRegistro { get; set; }

    [JsonPropertyName("likes")]
    public List<string>? Likes { get; set; } = new();

    [JsonPropertyName("comments")]
    public List<object>? Comments { get; set; } = new();
}
