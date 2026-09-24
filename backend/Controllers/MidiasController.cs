using Microsoft.AspNetCore.Mvc;
using Overcritic.Api.Models;
using Overcritic.Api.Services;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MidiasController : ControllerBase
{
    private readonly ISupabaseService _supabase;
    private readonly ILogger<MidiasController> _logger;

    public MidiasController(ISupabaseService supabase, ILogger<MidiasController> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> ObterTodos()
    {
        var lista = await _supabase.ObterMidiasAsync();
        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Salvar([FromBody] ReviewMidia midia)
    {
        if (string.IsNullOrWhiteSpace(midia.Titulo))
            return BadRequest(new { message = "O título da mídia é obrigatório." });

        var salvo = await _supabase.SalvarMidiaAsync(midia);
        return Ok(salvo);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Excluir(long id)
    {
        var sucesso = await _supabase.ExcluirMidiaAsync(id);
        if (!sucesso) return StatusCode(500, new { message = "Não foi possível excluir a mídia." });
        return Ok(new { message = "Mídia excluída com sucesso!", id });
    }
}
