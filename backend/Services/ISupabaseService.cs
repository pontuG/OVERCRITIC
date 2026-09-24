using Overcritic.Api.Models;

namespace Overcritic.Api.Services;

public interface ISupabaseService
{
    // Jogos
    Task<IEnumerable<ReviewJogo>> ObterJogosAsync();
    Task<ReviewJogo?> ObterJogoPorIdAsync(long id);
    Task<ReviewJogo> SalvarJogoAsync(ReviewJogo jogo);
    Task<bool> ExcluirJogoAsync(long id);

    // Mídias
    Task<IEnumerable<ReviewMidia>> ObterMidiasAsync();
    Task<ReviewMidia> SalvarMidiaAsync(ReviewMidia midia);
    Task<bool> ExcluirMidiaAsync(long id);

    // Platinas
    Task<IEnumerable<Platina>> ObterPlatinasAsync();
    Task<Platina> SalvarPlatinaAsync(Platina platina);
    Task<bool> ExcluirPlatinaAsync(long id);

    // Estatísticas
    Task<EstatisticasDto> ObterEstatisticasAsync();
}
