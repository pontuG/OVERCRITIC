using Microsoft.AspNetCore.Mvc;
using Overcritic.Api.Models;
using Overcritic.Api.Services;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JogosController : ControllerBase
{
    private readonly ISupabaseService _supabase;
    private readonly ILogger<JogosController> _logger;

    public JogosController(ISupabaseService supabase, ILogger<JogosController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> ObterTodos()
    {
        var lista = await _supabase.ObterJogosAsync();
        return Ok(lista);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> ObterPorId(long id)
    {
        var jogo = await _supabase.ObterJogoPorIdAsync(id);
        if (jogo == null) return NotFound(new { message = $"Jogo com id {id} não encontrado." });
        return Ok(jogo);
    }

    [HttpPost]
    public async Task<IActionResult> Salvar([FromBody] ReviewJogo jogo)
    {
        if (string.IsNullOrWhiteSpace(jogo.Titulo))
            return BadRequest(new { message = "O título do jogo é obrigatório." });

        var salvo = await _supabase.SalvarJogoAsync(jogo);
        return Ok(salvo);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Excluir(long id)
    {
        var sucesso = await _supabase.ExcluirJogoAsync(id);
        if (!sucesso) return StatusCode(500, new { message = "Não foi possível excluir o jogo." });
        return Ok(new { message = "Jogo excluído com sucesso!", id });
    }
}
