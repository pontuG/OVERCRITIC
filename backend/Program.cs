using Microsoft.Extensions.FileProviders;
using Overcritic.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurações de Serviços
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Overcritic API - C# .NET 8", Version = "v1", Description = "Backend REST integrado ao Supabase para o Overcritic" });
});

// 2. Serviço HTTP e Supabase
builder.Services.AddHttpClient<ISupabaseService, SupabaseService>();

// 3. CORS permissivo para desenvolvimento
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 4. Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Overcritic API v1");
    c.RoutePrefix = "swagger";
});

app.UseStaticFiles(); // Necessário para recursos embutidos do Swagger UI

// 5. Servidor de arquivos estáticos do Frontend (Permite abrir http://localhost:5000 sem erro de CORS!)
var rootPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, ".."));
if (Directory.Exists(rootPath))
{
    var fileProvider = new PhysicalFileProvider(rootPath);
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = fileProvider,
        DefaultFileNames = new List<string> { "index.html" }
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("=================================================");
Console.WriteLine("🚀 [OVERCRITIC C# BACKEND] INICIADO COM SUCESSO!");
Console.WriteLine("👉 Acesse o Site:    http://localhost:5000");
Console.WriteLine("👉 Acesse o Swagger: http://localhost:5000/swagger");
Console.WriteLine("=================================================");

app.Run("http://localhost:5000");
