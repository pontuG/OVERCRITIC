using Microsoft.AspNetCore.Mvc;
using Overcritic.Api.Models;
using Overcritic.Api.Services;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlatinasController : ControllerBase
{
    private readonly ISupabaseService _supabase;
    private readonly ILogger<PlatinasController> _logger;

    public PlatinasController(ISupabaseService supabase, ILogger<PlatinasController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> ObterTodos()
    {
        var lista = await _supabase.ObterPlatinasAsync();
        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Salvar([FromBody] Platina platina)
    {
        if (string.IsNullOrWhiteSpace(platina.Titulo))
            return BadRequest(new { message = "O título do jogo platinado é obrigatório." });

        var salvo = await _supabase.SalvarPlatinaAsync(platina);
        return Ok(salvo);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Excluir(long id)
    {
        var sucesso = await _supabase.ExcluirPlatinaAsync(id);
        if (!sucesso) return StatusCode(500, new { message = "Não foi possível excluir a platina." });
        return Ok(new { message = "Platina excluída com sucesso!", id });
    }
}
