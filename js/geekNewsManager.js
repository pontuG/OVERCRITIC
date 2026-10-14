/**
 * Overcritic - Gerenciador Central de Notícias Diárias, Lançamentos & Radar Geek/Gamer em Tempo Real
 * Consome feeds ao vivo de notícias (IGN Brasil, Geek Culture, Cinema & Games)
 * Sincroniza novidades diárias e tendências em tempo real no Brasil e no mundo.
 */

(function (window) {
    const NEWS_CACHE_KEY = 'overcritic_geek_news_v2';
    const NEWS_CACHE_TIME_KEY = 'overcritic_geek_news_time';
    const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos de cache inteligente

    // Feeds Oficiais em Português e Global com fallback
    const RSS_ENDPOINTS = [
        'https://api.rss2json.com/v1/api.json?rss_url=https://br.ign.com/feed.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/ign/all'
    ];

    // Fallback editorial atualizado do mundo geek caso a rede externa esteja offline
    const NOTICIAS_CONTINGENCIA = [
        {
            title: "GTA 6 revela novidades do mapa, estações de rádio e mecânicas antes do lançamento",
            pubDate: new Date().toISOString(),
            link: "descobrir_jogos.html",
            author: "Overcritic Radar",
            thumbnail: "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_VI.png",
            category: "Games",
            description: "A Rockstar Games compartilhou novos detalhes sobre a imersão em Vice City, novos sistemas de físicas e elenco musical imperdível.",
            badge: "🔥 PLANTÃO GAMER"
        },
        {
            title: "Paramount confirma início da produção de filme live-action de Cyberpunk 2077",
            pubDate: new Date(Date.now() - 3600000 * 2).toISOString(),
            link: "descobrir_titulos.html",
            author: "Overcritic Cinema",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
            category: "Cinema & TV",
            description: "CD Projekt Red e Paramount unem forças para levar Night City aos cinemas mundiais em uma adaptação cinematográfica de grande orçamento.",
            badge: "🎬 NOVIDADE HOJE"
        },
        {
            title: "Clair Obscur: Expedition 33 ganha novo gameplay impressionante com combate por turnos reativo",
            pubDate: new Date(Date.now() - 3600000 * 4).toISOString(),
            link: "descobrir_jogos.html",
            author: "Overcritic Games",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/header.jpg",
            category: "Lançamentos",
            description: "Novo RPG com visual em Unreal Engine 5 surpreende fãs com mecânicas inspiradas em clássicos e dublagem de estrelas de Hollywood.",
            badge: "🚀 LANÇAMENTO"
        },
        {
            title: "Demolidor: Renascido (Born Again) - Fotos oficiais dos bastidores da nova temporada na Marvel Studios",
            pubDate: new Date(Date.now() - 3600000 * 6).toISOString(),
            link: "descobrir_titulos.html",
            author: "Overcritic Séries",
            thumbnail: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
            category: "Cinema & TV",
            description: "Charlie Cox e Vincent D'Onofrio retornam em confrontos intensos gravados nas ruas de Nova York, prometendo o tom mais maduro do MCU.",
            badge: "📺 SÉRIES EM ALTA"
        },
        {
            title: "Astro Bot é coroado um dos jogos mais aclamados do ano com nota 94 no Metacritic",
            pubDate: new Date(Date.now() - 3600000 * 9).toISOString(),
            link: "descobrir_jogos.html",
            author: "Overcritic Avaliações",
            thumbnail: "https://upload.wikimedia.org/wikipedia/en/e/e3/Astro_Bot_cover_art.jpg",
            category: "Games",
            description: "A aventura de plataforma da Team Asobi conquista a crítica mundial, superando marcos históricos do PlayStation 5.",
            badge: "🏆 CRÍTICA MUNDIAL"
        },
        {
            title: "Monster Hunter Wilds: Capcom detalha ecossistemas dinâmicos e suporte cross-play completo",
            pubDate: new Date(Date.now() - 3600000 * 12).toISOString(),
            link: "descobrir_jogos.html",
            author: "Overcritic Radar",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg",
            category: "Lançamentos",
            description: "Caçadores poderão explorar tempestades de areia e mudanças climáticas que alteram o comportamento dos monstros em tempo real.",
            badge: "⚡ DESTAQUE"
        }
    ];

    /**
     * Classifica a categoria da notícia com base nas palavras-chave do título e tags
     */
    function classificarCategoria(item) {
        const txt = `${item.title || ''} ${item.description || ''} ${(item.categories || []).join(' ')}`.toLowerCase();
        
        if (txt.includes('lançamento') || txt.includes('estreia') || txt.includes('anunciado') || txt.includes('revelado') || txt.includes('chega')) {
            return 'Lançamentos';
        }
        if (txt.includes('filme') || txt.includes('cinema') || txt.includes('série') || txt.includes('netflix') || txt.includes('disney') || txt.includes('marvel') || txt.includes('anime') || txt.includes('trailer') || txt.includes('ator')) {
            return 'Cinema & TV';
        }
        return 'Games';
    }

    /**
     * Formata data para o padrão amigável do dia-a-dia em Português
     */
    function formatarTempoNoticia(dateStr) {
        if (!dateStr) return 'Hoje';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Hoje';

        const agora = new Date();
        const diffMs = agora - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);

        if (diffMin < 2) return '🔴 Agora mesmo';
        if (diffMin < 60) return `Há ${diffMin} min`;
        if (diffHoras < 24) {
            const horasFormat = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `Hoje às ${horasFormat}`;
        }
        if (diffHoras < 48) {
            const horasFormat = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `Ontem às ${horasFormat}`;
        }
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    /**
     * Extrai a melhor imagem disponível para a notícia
     */
    function extrairImagemNoticia(item) {
        if (item.thumbnail && !item.thumbnail.includes('default') && !item.thumbnail.endsWith('.svg')) {
            return item.thumbnail;
        }
        if (item.enclosure && item.enclosure.link) {
            return item.enclosure.link;
        }
        // Tenta regex no HTML da descrição
        if (item.description) {
            const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match && match[1]) return match[1];
        }
        // Fallbacks temáticos de alta definição
        const cat = classificarCategoria(item);
        if (cat === 'Cinema & TV') {
            return 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg';
        }
        return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg';
    }

    /**
     * Limpa texto de HTML
     */
    function limparDescricao(html, maxLen = 140) {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let text = doc.body.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > maxLen) {
            text = text.substring(0, maxLen).trim() + '...';
        }
        return text;
    }

    /**
     * Busca as notícias ao vivo com cache e redundância
     */
    async function obterNoticiasGeekAoVivo(forcarAtualizacao = false) {
        // Verifica cache
        if (!forcarAtualizacao) {
            try {
                const cacheSalvo = sessionStorage.getItem(NEWS_CACHE_KEY);
                const cacheHora = sessionStorage.getItem(NEWS_CACHE_TIME_KEY);
                if (cacheSalvo && cacheHora && (Date.now() - parseInt(cacheHora, 10)) < CACHE_TTL_MS) {
                    return JSON.parse(cacheSalvo);
                }
            } catch (e) {
                console.warn('[GeekNews] Falha ao ler cache:', e);
            }
        }

        // Tenta os endpoints oficiais
        for (const url of RSS_ENDPOINTS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6500);

                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.items && data.items.length > 0) {
                        const normalizadas = data.items.map(item => {
                            const cat = classificarCategoria(item);
                            return {
                                title: item.title,
                                pubDate: item.pubDate,
                                tempoFormatado: formatarTempoNoticia(item.pubDate),
                                link: item.link,
                                author: item.author || 'IGN Brasil / Geek News',
                                thumbnail: extrairImagemNoticia(item),
                                category: cat,
                                description: limparDescricao(item.description || item.content),
                                badge: cat === 'Cinema & TV' ? '🎬 CINEMA & SÉRIES' : (cat === 'Lançamentos' ? '🚀 LANÇAMENTO' : '🎮 GAMES')
                            };
                        });

                        try {
                            sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(normalizadas));
                            sessionStorage.setItem(NEWS_CACHE_TIME_KEY, Date.now().toString());
                        } catch (e) {}

                        return normalizadas;
                    }
                }
            } catch (err) {
                console.warn(`[GeekNews] Endpoint falhou (${url}):`, err.message);
            }
        }

        // Se ambos falharem, retorna o catálogo de contingência com horários atuais
        return NOTICIAS_CONTINGENCIA.map(item => ({
            ...item,
            tempoFormatado: formatarTempoNoticia(item.pubDate)
        }));
    }

    /**
     * Renderiza o Grid de Notícias Diárias em qualquer container
     */
    async function renderizarGridNoticias({ containerId, categoria = 'todos', limite = 6, onFinish = null }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Skeleton loading
        container.innerHTML = Array(limite).fill(0).map(() => `
            <div class="news-skeleton-card">
                <div class="news-skeleton-img"></div>
                <div class="news-skeleton-body">
                    <div class="news-skeleton-line" style="width: 40%;"></div>
                    <div class="news-skeleton-line" style="width: 85%;"></div>
                    <div class="news-skeleton-line" style="width: 70%;"></div>
                </div>
            </div>
        `).join('');

        try {
            const todasNoticias = await obterNoticiasGeekAoVivo();
            
            let filtradas = todasNoticias;
            if (categoria && categoria !== 'todos') {
                filtradas = todasNoticias.filter(n => n.category.toLowerCase() === categoria.toLowerCase());
                if (filtradas.length === 0) filtradas = todasNoticias; // Garante que nunca fique vazio
            }

            const exibidas = filtradas.slice(0, limite);

            container.innerHTML = exibidas.map(noticia => {
                const safeTitle = (noticia.title || '').replace(/"/g, '&quot;');
                const safeLink = noticia.link || '#';
                const isExternal = safeLink.startsWith('http');
                const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
                const catClass = noticia.category === 'Cinema & TV' ? 'badge-cinema' : (noticia.category === 'Lançamentos' ? 'badge-launch' : 'badge-game');

                return `
                    <article class="news-card">
                        <div class="news-thumb-wrapper">
                            <img src="${noticia.thumbnail}" alt="${safeTitle}" class="news-thumb-img" loading="lazy" decoding="async" onerror="this.src='https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg'">
                            <span class="news-badge ${catClass}">${noticia.badge}</span>
                            <span class="news-time-chip">${noticia.tempoFormatado}</span>
                        </div>
                        <div class="news-body">
                            <h3 class="news-title">
                                <a href="${safeLink}" ${targetAttr} title="${safeTitle}">${noticia.title}</a>
                            </h3>
                            <p class="news-desc">${noticia.description}</p>
                            <div class="news-footer">
                                <span class="news-author">✍️ ${noticia.author || 'Overcritic Geek'}</span>
                                <a href="${safeLink}" ${targetAttr} class="news-read-btn">
                                    Ler Matéria ➔
                                </a>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            if (typeof onFinish === 'function') onFinish(exibidas);

        } catch (e) {
            console.error('[GeekNews] Erro ao renderizar grid:', e);
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">Não foi possível carregar as notícias no momento. Tente novamente em instantes.</div>`;
        }
    }

    /**
     * Renderiza Barra Letreiro / Ticker de Plantão Geek no topo da página
     */
    async function renderizarTickerGeek(tickerContainerId) {
        const container = document.getElementById(tickerContainerId);
        if (!container) return;

        const noticias = await obterNoticiasGeekAoVivo();
        if (!noticias || noticias.length === 0) return;

        const manchetesHtml = noticias.slice(0, 8).map(n => {
            const isExternal = (n.link || '').startsWith('http');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${n.link}" ${targetAttr} class="ticker-item"><span class="ticker-dot">⚡</span> <strong>${n.category.toUpperCase()}:</strong> ${n.title} <span class="ticker-time">(${n.tempoFormatado})</span></a>`;
        }).join('<span class="ticker-sep">•</span>');

        container.innerHTML = `
            <div class="live-ticker-wrap">
                <div class="ticker-tag">🔴 RADAR AO VIVO</div>
                <div class="ticker-marquee-track">
                    <div class="ticker-marquee-content">
                        ${manchetesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    // Exporta globalmente
    window.OvercriticGeekNews = {
        obterNoticias: obterNoticiasGeekAoVivo,
        renderizarGrid: renderizarGridNoticias,
        renderizarTicker: renderizarTickerGeek
    };

})(window);
