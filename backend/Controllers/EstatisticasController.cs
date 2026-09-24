using Microsoft.AspNetCore.Mvc;
using Overcritic.Api.Services;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstatisticasController : ControllerBase
{
    private readonly ISupabaseService _supabase;

    public EstatisticasController(ISupabaseService supabase)
    {
        _supabase = supabase;
    }

    [HttpGet]
    public async Task<IActionResult> ObterEstatisticas()
    {
        var stats = await _supabase.ObterEstatisticasAsync();
        return Ok(stats);
    }
}
