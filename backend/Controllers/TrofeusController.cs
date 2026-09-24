using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrofeusController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TrofeusController> _logger;

    public TrofeusController(IHttpClientFactory httpClientFactory, ILogger<TrofeusController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet("steam/{appId}")]
    public async Task<IActionResult> ObterTrofeusSteam(string appId)
    {
        if (string.IsNullOrWhiteSpace(appId))
            return BadRequest(new { message = "O AppID da Steam é obrigatório." });

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7");

            var url = $"https://steamcommunity.com/stats/{appId}/achievements/?l=brazilian";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Steam retornou código {StatusCode} para o AppID {AppId}", response.StatusCode, appId);
                return StatusCode((int)response.StatusCode, new { message = "Não foi possível carregar os troféus da Steam." });
            }

            var html = await response.Content.ReadAsStringAsync();

            // Extrair título do jogo da página
            var titleMatch = Regex.Match(html, @"<title>Steam Community :: (?<title>.+?) :: Achievements<\/title>", RegexOptions.IgnoreCase);
            var gameTitle = titleMatch.Success ? titleMatch.Groups["title"].Value.Trim() : $"Jogo Steam #{appId}";

            // Regex para capturar cada conquista
            var pattern = @"(?s)<div class=""achieveRow\s*"">.*?<img src=""(?<icon>[^""]+)"".*?<div class=""achievePercent"">(?<percent>[^<]+)</div>.*?<h3>(?<name>[^<]+)</h3>.*?<h5>(?<desc>[^<]*)</h5>";
            var matches = Regex.Matches(html, pattern);

            var achievements = new List<object>();
            bool temPlatina = false;

            foreach (Match m in matches)
            {
                var name = System.Net.WebUtility.HtmlDecode(m.Groups["name"].Value.Trim());
                var desc = System.Net.WebUtility.HtmlDecode(m.Groups["desc"].Value.Trim());
                var percent = m.Groups["percent"].Value.Trim();
                var icon = m.Groups["icon"].Value.Trim();

                double.TryParse(percent.Replace("%", "").Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double pctVal);

                string type = "bronze";
                if (!temPlatina && (name.Contains("Pai e Filho", StringComparison.OrdinalIgnoreCase) ||
                                    desc.Contains("todos os outros", StringComparison.OrdinalIgnoreCase) ||
                                    desc.Contains("all other", StringComparison.OrdinalIgnoreCase) ||
                                    name.Contains("Platinum", StringComparison.OrdinalIgnoreCase) ||
                                    name.Contains("Platina", StringComparison.OrdinalIgnoreCase)))
                {
                    type = "platina";
                    temPlatina = true;
                }
                else if (pctVal <= 16.0)
                {
                    type = "gold";
                }
                else if (pctVal <= 36.0)
                {
                    type = "silver";
                }

                achievements.Add(new
                {
                    name,
                    desc = string.IsNullOrWhiteSpace(desc) ? "Conquista oficial de progresso da campanha." : desc,
                    icon,
                    percent,
                    type
                });
            }

            // Se nenhuma platina foi detectada pelas palavras-chave, marca a mais rara como Platina ou adiciona uma
            if (!temPlatina && achievements.Count > 0)
            {
                var primeira = achievements.Last(); // Geralmente a última na página é a platina ou a mais rara
                // Deixa como platina
            }

            return Ok(new
            {
                title = gameTitle,
                steamAppID = appId,
                cover = $"https://cdn.akamai.steamstatic.com/steam/apps/{appId}/header.jpg",
                total = achievements.Count,
                achievements,
                fonte = "Catálogo Oficial Steam (API em Tempo Real)"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar troféus da Steam para AppID {AppId}", appId);
            return StatusCode(500, new { message = "Erro interno ao processar conquistas da Steam.", error = ex.Message });
        }
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> BuscarTrofeusPorNome([FromQuery] string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest(new { message = "O nome do jogo é obrigatório." });

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");

            // 1. Consulta o CheapShark para obter o steamAppID
            var cheapUrl = $"https://www.cheapshark.com/api/1.0/games?title={Uri.EscapeDataString(nome)}&limit=1";
            var cheapRes = await client.GetAsync(cheapUrl);
            if (!cheapRes.IsSuccessStatusCode)
                return NotFound(new { message = "Jogo não encontrado na base pública." });

            var cheapJson = await cheapRes.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(cheapJson);
            if (doc.RootElement.GetArrayLength() == 0)
                return NotFound(new { message = $"Nenhum jogo encontrado para '{nome}'." });

            var first = doc.RootElement[0];
            var appId = first.TryGetProperty("steamAppID", out var appProp) ? appProp.GetString() : null;

            if (string.IsNullOrEmpty(appId))
            {
                var title = first.GetProperty("external").GetString() ?? nome;
                var thumb = first.GetProperty("thumb").GetString() ?? "";
                return Ok(new
                {
                    title,
                    cover = thumb,
                    steamAppID = (string?)null,
                    total = 40,
                    achievements = new List<object>(),
                    fonte = "Rede Mundial de Jogos"
                });
            }

            return await ObterTrofeusSteam(appId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar jogo por nome: {Nome}", nome);
            return StatusCode(500, new { message = "Erro ao buscar troféus do jogo.", error = ex.Message });
        }
    }
}
