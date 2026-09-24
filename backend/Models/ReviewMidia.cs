using System.Text.Json.Serialization;

namespace Overcritic.Api.Models;

public class ReviewMidia
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("autor")]
    public string Autor { get; set; } = "Anônimo";

    [JsonPropertyName("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string? Tipo { get; set; } = "movie";

    [JsonPropertyName("ano")]
    public string? Ano { get; set; }

    [JsonPropertyName("generos")]
    public string? Generos { get; set; }

    [JsonPropertyName("palavras_chave")]
    public string? PalavrasChave { get; set; }

    [JsonPropertyName("media_internet")]
    public string? MediaInternet { get; set; }

    [JsonPropertyName("onde_assistir")]
    public string? OndeAssistir { get; set; }

    [JsonPropertyName("minha_nota")]
    public decimal? MinhaNota { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("review")]
    public string? Review { get; set; }

    [JsonPropertyName("cover_url")]
    public string? CoverUrl { get; set; }

    [JsonPropertyName("data_registro")]
    public string? DataRegistro { get; set; }

    [JsonPropertyName("likes")]
    public List<string>? Likes { get; set; } = new();

    [JsonPropertyName("comments")]
    public List<object>? Comments { get; set; } = new();
}
