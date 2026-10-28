// js/apiClient.js - Camada de integração com o Backend C# (.NET 8) e Supabase
(function () {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // URL oficial do Backend C# em produção no Render
    const RENDER_API_URL = (localStorage.getItem('overcritic_api_url') || 'https://overcritic.onrender.com/api').replace(/\/+$/, '');
    const LOCAL_API_URL = 'http://localhost:5000/api';

    const API_BASE_URL = isLocal ? LOCAL_API_URL : RENDER_API_URL;

    let _backendDisponivel = null;

    async function checarBackend() {
        if (_backendDisponivel !== null) return _backendDisponivel;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${API_BASE_URL}/estatisticas`, { signal: controller.signal });
            clearTimeout(timeoutId);
            _backendDisponivel = res.ok;
            if (_backendDisponivel) {
                console.log(`🚀 [API C#] Conectado com sucesso ao Backend: ${API_BASE_URL}`);
            }
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
        },

        // ════════════════════════════════════════════════════════
        // RAWG VIDEO GAMES API (CATÁLOGO & TENDÊNCIAS EM TEMPO REAL)
        // ════════════════════════════════════════════════════════
        rawgKey: 'c542e67aec3a4340908f9de9e86038af',

        getRawgKey() {
            try {
                const uKey = localStorage.getItem('OVERCRITIC_RAWG_USER_KEY');
                if (uKey && uKey.trim()) return uKey.trim();
            } catch (e) {}
            return this.rawgKey;
        },

        traduzirGenero(nomeEn) {
            if (!nomeEn) return 'Ação / Games';
            const mapa = {
                'Action': 'Ação',
                'Adventure': 'Aventura',
                'RPG': 'RPG',
                'Shooter': 'Tiro',
                'Strategy': 'Estratégia',
                'Simulation': 'Simulação',
                'Puzzle': 'Quebra-Cabeça',
                'Arcade': 'Arcade',
                'Platformer': 'Plataforma',
                'Racing': 'Corrida',
                'Sports': 'Esporte',
                'Massively Multiplayer': 'MMO',
                'Fighting': 'Luta',
                'Family': 'Família',
                'Board Games': 'Tabuleiro',
                'Card': 'Cartas',
                'Indie': 'Indie',
                'Casual': 'Casual'
            };
            return mapa[nomeEn] || nomeEn;
        },

        detectarPlataformaPrincipal(parentPlatforms) {
            if (!parentPlatforms || !parentPlatforms.length) return 'PC';
            const slugs = parentPlatforms.map(p => (p.platform && p.platform.slug || '').toLowerCase());
            if (slugs.includes('playstation')) return 'PlayStation 5';
            if (slugs.includes('xbox')) return 'Xbox Series X/S';
            if (slugs.includes('nintendo')) return 'Nintendo Switch';
            if (slugs.includes('pc')) return 'PC';
            return 'PC';
        },

        async obterJogosEmAltaRawg(limite = 8) {
            const cacheKey = 'overcritic_cache_trending_games_v2';
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}

            try {
                const key = this.getRawgKey();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6500);

                // Janela de lançamentos recentes mais adicionados (últimos 180 dias)
                const hoje = new Date().toISOString().split('T')[0];
                const d = new Date();
                d.setDate(d.getDate() - 180);
                const dataInicio = d.toISOString().split('T')[0];

                const url = `https://api.rawg.io/api/games?key=${key}&dates=${dataInicio},${hoje}&ordering=-added&page_size=${limite}`;
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error(`RAWG HTTP ${res.status}`);
                const data = await res.json();
                const results = data.results || [];

                const formatados = results.map((g, idx) => {
                    const genero = (g.genres && g.genres[0]) ? this.traduzirGenero(g.genres[0].name) : 'Ação / Games';
                    const score = g.metacritic ? `Metacritic ${g.metacritic}` : (g.rating ? `⭐ ${g.rating.toFixed(1)} RAWG` : 'Destaque');
                    const rank = idx + 1;
                    const badge = rank === 1 ? '🔥 #1 NO MUNDO' : (g.metacritic >= 90 ? '🏆 OBRA-PRIMA' : (rank <= 3 ? '⚡ EM ALTA' : 'POPULAR'));
                    const plat = this.detectarPlataformaPrincipal(g.parent_platforms);

                    return {
                        rank,
                        title: g.name,
                        thumb: g.background_image || 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
                        meta: genero,
                        score: score,
                        badge: badge,
                        metacritic: g.metacritic,
                        rating: g.rating,
                        plataforma: plat,
                        url: `adicionar_jogos.html?titulo=${encodeURIComponent(g.name)}&capa=${encodeURIComponent(g.background_image || '')}&genero=${encodeURIComponent(genero)}&plataforma=${encodeURIComponent(plat)}&media=${encodeURIComponent(score)}`
                    };
                });

                if (formatados.length > 0) {
                    try { sessionStorage.setItem(cacheKey, JSON.stringify(formatados)); } catch (e) {}
                }
                return formatados;
            } catch (err) {
                console.warn('[OvercriticApi] Falha ao consultar RAWG em alta:', err);
                return null;
            }
        },

        async buscarJogosRawg(query, limite = 6) {
            if (!query || !query.trim()) return [];
            try {
                const key = this.getRawgKey();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5500);
                const url = `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(query.trim())}&page_size=${limite}`;
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error(`RAWG HTTP ${res.status}`);
                const data = await res.json();
                const results = data.results || [];

                return results.map(g => {
                    const genero = (g.genres || []).map(x => this.traduzirGenero(x.name)).join(', ') || 'Ação / Aventura';
                    const plat = this.detectarPlataformaPrincipal(g.parent_platforms);
                    const tags = (g.tags || []).slice(0, 4).map(t => '#' + (t.name || '').replace(/[^a-zA-Z0-9À-ÿ]/g, '')).filter(Boolean).join(', ');
                    const media = g.metacritic ? `Metacritic ${g.metacritic}` : (g.rating ? `RAWG ${(g.rating * 20).toFixed(0)} / 100` : '');

                    return {
                        title: g.name,
                        thumb: g.background_image || '',
                        isRawg: true,
                        badgeText: g.metacritic ? `Metacritic ${g.metacritic}` : (g.rating ? `Nota ${(g.rating * 2).toFixed(1)}/10` : 'RAWG API'),
                        meta: {
                            titulo: g.name,
                            capa: g.background_image || '',
                            generos: genero,
                            tags: tags,
                            media: media,
                            plataforma: plat
                        }
                    };
                });
            } catch (err) {
                console.warn('[OvercriticApi] Falha na busca RAWG:', err);
                return [];
            }
        }
    };

    window.OvercriticApi = OvercriticApi;
    console.log('🔌 [Overcritic] Cliente de API C# e RAWG carregado!');
})();
