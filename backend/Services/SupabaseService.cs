using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Overcritic.Api.Models;

namespace Overcritic.Api.Services;

public class SupabaseService : ISupabaseService
{
    private readonly HttpClient _http;
    private readonly ILogger<SupabaseService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public SupabaseService(HttpClient http, IConfiguration config, ILogger<SupabaseService> logger)
    {
        _http = http;
        _logger = logger;
        
        var url = config["Supabase:Url"]?.TrimEnd('/') ?? "https://lvvihjivyniqsmihnkof.supabase.co";
        var key = config["Supabase:SecretKey"] ?? config["Supabase:PublishableKey"] ?? "";

        _http.BaseAddress = new Uri(url);
        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("apikey", key);
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", key);

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    #region Jogos

    public async Task<IEnumerable<ReviewJogo>> ObterJogosAsync()
    {
        try
        {
            var res = await _http.GetAsync("/rest/v1/reviews_jogos?select=*&order=created_at.desc");
            if (!res.IsSuccessStatusCode)
            {
                _logger.LogWarning("Supabase retornou status {Status} ao buscar jogos.", res.StatusCode);
                return Enumerable.Empty<ReviewJogo>();
            }

            var content = await res.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<ReviewJogo>>(content, _jsonOptions) ?? new List<ReviewJogo>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao buscar jogos no Supabase.");
            return Enumerable.Empty<ReviewJogo>();
        }
    }

    public async Task<ReviewJogo?> ObterJogoPorIdAsync(long id)
    {
        try
        {
            var res = await _http.GetAsync($"/rest/v1/reviews_jogos?id=eq.{id}&select=*");
            if (!res.IsSuccessStatusCode) return null;

            var content = await res.Content.ReadAsStringAsync();
            var list = JsonSerializer.Deserialize<List<ReviewJogo>>(content, _jsonOptions);
            return list?.FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar jogo id {Id}", id);
            return null;
        }
    }

    public async Task<ReviewJogo> SalvarJogoAsync(ReviewJogo jogo)
    {
        if (jogo.Id <= 0) jogo.Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var json = JsonSerializer.Serialize(jogo, _jsonOptions);
        var req = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/reviews_jogos")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        req.Headers.Add("Prefer", "resolution=merge-duplicates,return=representation");

        var res = await _http.SendAsync(req);
        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            _logger.LogError("Erro ao persistir jogo no Supabase: {Err}", err);
            throw new InvalidOperationException($"Erro no Supabase: {res.StatusCode} - {err}");
        }

        var content = await res.Content.ReadAsStringAsync();
        var savedList = JsonSerializer.Deserialize<List<ReviewJogo>>(content, _jsonOptions);
        return savedList?.FirstOrDefault() ?? jogo;
    }

    public async Task<bool> ExcluirJogoAsync(long id)
    {
        try
        {
            var res = await _http.DeleteAsync($"/rest/v1/reviews_jogos?id=eq.{id}");
            return res.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir jogo id {Id}", id);
            return false;
        }
    }

    #endregion

    #region Mídias

    public async Task<IEnumerable<ReviewMidia>> ObterMidiasAsync()
    {
        try
        {
            var res = await _http.GetAsync("/rest/v1/reviews_midias?select=*&order=created_at.desc");
            if (!res.IsSuccessStatusCode) return Enumerable.Empty<ReviewMidia>();

            var content = await res.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<ReviewMidia>>(content, _jsonOptions) ?? new List<ReviewMidia>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao buscar mídias.");
            return Enumerable.Empty<ReviewMidia>();
        }
    }

    public async Task<ReviewMidia> SalvarMidiaAsync(ReviewMidia midia)
    {
        if (midia.Id <= 0) midia.Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var json = JsonSerializer.Serialize(midia, _jsonOptions);
        var req = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/reviews_midias")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        req.Headers.Add("Prefer", "resolution=merge-duplicates,return=representation");

        var res = await _http.SendAsync(req);
        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Erro no Supabase ao salvar mídia: {err}");
        }

        var content = await res.Content.ReadAsStringAsync();
        var savedList = JsonSerializer.Deserialize<List<ReviewMidia>>(content, _jsonOptions);
        return savedList?.FirstOrDefault() ?? midia;
    }

    public async Task<bool> ExcluirMidiaAsync(long id)
    {
        try
        {
            var res = await _http.DeleteAsync($"/rest/v1/reviews_midias?id=eq.{id}");
            return res.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir mídia id {Id}", id);
            return false;
        }
    }

    #endregion

    #region Platinas

    public async Task<IEnumerable<Platina>> ObterPlatinasAsync()
    {
        try
        {
            var res = await _http.GetAsync("/rest/v1/platinas?select=*&order=created_at.desc");
            if (!res.IsSuccessStatusCode) return Enumerable.Empty<Platina>();

            var content = await res.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<Platina>>(content, _jsonOptions) ?? new List<Platina>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao buscar platinas.");
            return Enumerable.Empty<Platina>();
        }
    }

    public async Task<Platina> SalvarPlatinaAsync(Platina platina)
    {
        if (platina.Id <= 0) platina.Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var json = JsonSerializer.Serialize(platina, _jsonOptions);
        var req = new HttpRequestMessage(HttpMethod.Post, "/rest/v1/platinas")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        req.Headers.Add("Prefer", "resolution=merge-duplicates,return=representation");

        var res = await _http.SendAsync(req);
        if (!res.IsSuccessStatusCode)
        {
            var err = await res.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Erro no Supabase ao salvar platina: {err}");
        }

        var content = await res.Content.ReadAsStringAsync();
        var savedList = JsonSerializer.Deserialize<List<Platina>>(content, _jsonOptions);
        return savedList?.FirstOrDefault() ?? platina;
    }

    public async Task<bool> ExcluirPlatinaAsync(long id)
    {
        try
        {
            var res = await _http.DeleteAsync($"/rest/v1/platinas?id=eq.{id}");
            return res.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir platina id {Id}", id);
            return false;
        }
    }

    #endregion

    #region Estatísticas

    public async Task<EstatisticasDto> ObterEstatisticasAsync()
    {
        var jogos = await ObterJogosAsync();
        var midias = await ObterMidiasAsync();
        var platinas = await ObterPlatinasAsync();

        return new EstatisticasDto
        {
            TotalJogos = jogos.Count(),
            TotalMidias = midias.Count(),
            TotalPlatinas = platinas.Count()
        };
    }

    #endregion
}
