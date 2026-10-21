using Microsoft.AspNetCore.Mvc;

namespace Overcritic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _config;

    public ConfigController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet]
    public IActionResult GetConfig()
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL") 
            ?? _config["Supabase:Url"] 
            ?? "";
        var key = Environment.GetEnvironmentVariable("SUPABASE_PUBLISHABLE_KEY") 
            ?? _config["Supabase:PublishableKey"] 
            ?? "";

        return Ok(new
        {
            url,
            anonKey = key,
            backend = "Overcritic C# .NET 8 Cloud Engine"
        });
    }
}
