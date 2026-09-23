// js/apiClient.js - Camada de integração com o Backend C# e Supabase
(function () {
    const API_BASE_URL = 'http://localhost:5000/api';

    let _backendDisponivel = null;

    async function checarBackend() {
        if (_backendDisponivel !== null) return _backendDisponivel;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${API_BASE_URL}/estatisticas`, { signal: controller.signal });
            clearTimeout(timeoutId);
            _backendDisponivel = res.ok;
        } catch (e) {
            _backendDisponivel = false;
        }
        return _backendDisponivel;
    }

    const OvercriticApi = {
        baseUrl: API_BASE_URL,
        checarBackend,

        // JOGOS
        async obterJogos() {
            if (await checarBackend()) {
                try {
                    const res = await fetch(`${API_BASE_URL}/jogos`);
                    if (res.ok) return await res.json();
                } catch (e) {
                    console.warn('[API C#] Falha ao obter jogos, usando fallback:', e);
                }
            }
            // Fallback direto ao Supabase se backend C# estiver desligado
            if (window.sbClient) {
                const { data } = await window.sbClient.from('reviews_jogos').select('*');
                if (data) return data;
            }
            return JSON.parse(localStorage.getItem('overcritic_reviews') || '[]');
        },

        async salvarJogo(jogo) {
            if (await checarBackend()) {
                try {
                    const res = await fetch(`${API_BASE_URL}/jogos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(jogo)
                    });
                    if (res.ok) {
                        console.log('⚡ [API C#] Jogo persistido via Backend C#!');
                        return await res.json();
                    }
                } catch (e) {
                    console.warn('[API C#] Erro no envio, usando fallback Supabase:', e);
                }
            }
            // Fallback direto ao Supabase
            if (window.sbClient) {
                await window.sbClient.from('reviews_jogos').upsert(jogo);
            }
            return jogo;
        },

        async excluirJogo(id) {
            if (await checarBackend()) {
                try {
                    const res = await fetch(`${API_BASE_URL}/jogos/${id}`, { method: 'DELETE' });
                    if (res.ok) return true;
                } catch (e) {
                    console.warn('[API C#] Erro ao excluir via backend:', e);
                }
            }
            if (window.sbClient) {
                await window.sbClient.from('reviews_jogos').delete().eq('id', id);
            }
            return true;
        },

        // ESTATÍSTICAS
        async obterEstatisticas() {
            if (await checarBackend()) {
                try {
                    const res = await fetch(`${API_BASE_URL}/estatisticas`);
                    if (res.ok) return await res.json();
                } catch (e) {}
            }
            return null;
        }
    };

    window.OvercriticApi = OvercriticApi;
    console.log('🔌 [Overcritic] Cliente de API C# carregado!');
})();
