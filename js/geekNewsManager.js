/**
 * Overcritic - Gerenciador Central de Notícias Diárias, Lançamentos & Radar Geek/Gamer em Tempo Real
 * Consome feeds ao vivo de notícias (IGN Brasil, Geek Culture, Cinema & Games)
 * Sincroniza novidades diárias e tendências em tempo real no Brasil e no mundo.
 * Inclui Leitor de Matérias Completo em Modal Interativo Overcritic.
 */

(function (window) {
    const NEWS_CACHE_KEY = 'overcritic_geek_news_v4';
    const NEWS_CACHE_TIME_KEY = 'overcritic_geek_news_time';
    const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos de cache inteligente

    // Limpa versões obsoletas do cache na inicialização
    try {
        sessionStorage.removeItem('overcritic_geek_news_v3');
        sessionStorage.removeItem('overcritic_geek_news_v2');
        sessionStorage.removeItem('overcritic_geek_news');
    } catch (e) {}

    // Feeds Oficiais em Português e Global com fallback
    const RSS_ENDPOINTS = [
        'https://api.rss2json.com/v1/api.json?rss_url=https://br.ign.com/feed.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/ign/all'
    ];

    // Fallback editorial atualizado do mundo geek com textos completos e links de fontes oficiais
    const NOTICIAS_CONTINGENCIA = [
        {
            id: "gta6-novidades-mapa",
            title: "GTA 6 revela novidades do mapa, estações de rádio e mecânicas antes do lançamento",
            pubDate: new Date().toISOString(),
            link: "https://www.rockstargames.com/vi",
            author: "Overcritic Radar / Rockstar Games",
            thumbnail: "https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png",
            category: "Games",
            description: "A Rockstar Games compartilhou novos detalhes sobre a imersão em Vice City, novos sistemas de físicas e elenco musical imperdível.",
            badge: "🔥 PLANTÃO GAMER",
            tempoLeitura: "3 min",
            fullContent: [
                "A Rockstar Games revelou novas informações técnicas e criativas sobre o aguardado Grand Theft Auto VI (GTA 6), considerado o projeto de entretenimento mais ambicioso e aguardado de toda a história dos videogames.",
                "Ambientado no estado fictício de Leonida — que recria com fidelidade impressionante a metrópole neon de Vice City, as praias de Ocean Beach e as misteriosas áreas pantanosas dos Everglades —, o título promete um salto geracional sem paralelos em termos de imersão e densidade.",
                "Centenas de interiores estarão completamente acessíveis e interativos, desde shoppings luxuosos e casas noturnas até residências suburbanas e armazéns industriais. Os pedestres e NPCs contam com rotinas avançadas alimentadas por algoritmos inteligentes, reagindo de maneira única a condições climáticas extremas e delitos cometidos pelos jogadores.",
                "No quesito jogabilidade, a Rockstar aprimorou a física de tempestades tropicais e tempestades de vento, além de introduzir um sistema dinâmico de redes sociais in-game (inspirado no TikTok e Instagram). Neste sistema, vídeos gravados por cidadãos podem viralizar, alterando a reputação pública e o cerco policial sobre os protagonistas Lucia e Jason.",
                "A trilha sonora das estações de rádio celebra tanto o charme retrô dos anos 80 quanto batidas modernas de trap, synthwave, reggaeton e rock, intercaladas por programas humorísticos de rádio que comentam diretamente os desdobramentos da campanha.",
                "GTA 6 segue com lançamento confirmado para as plataformas PlayStation 5 e Xbox Series X|S."
            ]
        },
        {
            id: "cyberpunk-filme-paramount",
            title: "Paramount confirma início da produção de filme live-action de Cyberpunk 2077",
            pubDate: new Date(Date.now() - 3600000 * 2).toISOString(),
            link: "https://br.ign.com/cyberpunk-2077/115161/news/filme-live-action-de-cyberpunk-2077-e-anunciado-pela-cd-projekt-red",
            author: "Overcritic Cinema",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
            category: "Cinema & TV",
            description: "CD Projekt Red e Paramount unem forças para levar Night City aos cinemas mundiais em uma adaptação cinematográfica de grande orçamento.",
            badge: "🎬 NOVIDADE HOJE",
            tempoLeitura: "2 min",
            fullContent: [
                "A CD Projekt Red anunciou formalmente uma parceria de peso com a Paramount Pictures e a Anonymous Content para dar vida ao primeiro filme live-action em longa-metragem ambientado no rico universo de Cyberpunk 2077.",
                "A produção executiva fica a cargo do mesmo time vencedor do Emmy responsável por obras conceituadas como True Detective e Mr. Robot. O longa não fará uma cópia direta da trama dos jogos de V e Johnny Silverhand, mas sim narrará uma história original focada nas disputas sangrentas entre mercenários e megacorporações opressivas como a Arasaka e a Militech.",
                "Os cineastas prometeram uma estética crua, utilizando efeitos práticos arrojados combinados com CGI de ponta para traduzir a névoa ácida, o brilho neon das ruas de Night City e a visceralidade dos aprimoramentos cibernéticos.",
                "O anúncio coroa o momento de glória da marca, que após o enorme triunfo da expansão Phantom Liberty e da série animada Cyberpunk: Mercenários (Edgerunners), consolidou seu posto entre as franquias de ficção científica mais relevantes da cultura pop moderna."
            ]
        },
        {
            id: "expedition-33-gameplay",
            title: "Clair Obscur: Expedition 33 ganha novo gameplay impressionante com combate por turnos reativo",
            pubDate: new Date(Date.now() - 3600000 * 4).toISOString(),
            link: "https://store.steampowered.com/app/1903340/Clair_Obscur_Expedition_33/",
            author: "Overcritic Games",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/header.jpg",
            category: "Lançamentos",
            description: "Novo RPG com visual em Unreal Engine 5 surpreende fãs com mecânicas inspiradas em clássicos e dublagem de estrelas de Hollywood.",
            badge: "🚀 LANÇAMENTO",
            tempoLeitura: "3 min",
            fullContent: [
                "O estúdio francês Sandfall Interactive revelou uma demonstração de gameplay estendida de Clair Obscur: Expedition 33, um RPG épico de fantasia construído na Unreal Engine 5 que tem encantado entusiastas de combates táticos refinados.",
                "A premissa da obra é tão poética quanto angustiante: uma vez ao ano, uma misteriosa entidade conhecida como A Pintora acorda e pinta um número em seu monólito. Todas as pessoas no mundo que possuem aquela idade instantaneamente viram fumaça e deixam de existir. A Expedição 33 parte em uma missão suicida final para exterminar a Pintora antes que ela pinte o número 33.",
                "O grande diferencial do gameplay está na fusão perfeita da estratégia tradicional baseada em turnos com reflexos de ação em tempo real: esquivas no momento exato, aparos perfeitos (parries) e combinações de botões que amplificam o dano desferido pelos personagens.",
                "Além da direção de arte de tirar o fôlego, o elenco de dubladores inclui nomes consagrados como Charlie Cox (Demolidor), Andy Serkis (Senhor dos Anéis), Ben Starr (Final Fantasy XVI) e Jennifer English (Baldur's Gate 3). O título chegará para PC, PlayStation 5, Xbox Series e catálogo Game Pass."
            ]
        },
        {
            id: "demolidor-renascido-fotos",
            title: "Demolidor: Renascido (Born Again) - Fotos oficiais dos bastidores da nova temporada na Marvel Studios",
            pubDate: new Date(Date.now() - 3600000 * 6).toISOString(),
            link: "https://www.marvel.com",
            author: "Overcritic Séries",
            thumbnail: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
            category: "Cinema & TV",
            description: "Charlie Cox e Vincent D'Onofrio retornam em confrontos intensos gravados nas ruas de Nova York, prometendo o tom mais maduro do MCU.",
            badge: "📺 SÉRIES EM ALTA",
            tempoLeitura: "2 min",
            fullContent: [
                "A Marvel Studios revelou as primeiras imagens oficiais dos bastidores de Daredevil: Born Again (Demolidor: Renascido), confirmando que a série manterá o tom violento, maduro e urbano que consagrou o vigilante cego de Hell's Kitchen.",
                "As imagens mostram Matt Murdock (Charlie Cox) em trajes civis no tribunal e com o novo uniforme escarlate, além de Wilson Fisk (Vincent D'Onofrio) em sua escalada política rumo à prefeitura de Nova York. A produção passou por um recomeço criativo para resgatar coreografias de artes marciais práticas e lutas em plano-sequência sem cortes abruptos.",
                "Outra grande comemoração dos fãs foi a confirmação de Jon Bernthal revivendo o impiedoso Frank Castle (Justiceiro), bem como o retorno oficial de Deborah Ann Woll (Karen Page) e Elden Henson (Foggy Nelson).",
                "A classificação indicativa será TV-MA (recomendada para adultos), marcando uma nova era mais séria e realista para o Universo Cinematográfico da Marvel (MCU) no Disney+."
            ]
        },
        {
            id: "astro-bot-aclamado",
            title: "Astro Bot é coroado um dos jogos mais aclamados do ano com nota 94 no Metacritic",
            pubDate: new Date(Date.now() - 3600000 * 9).toISOString(),
            link: "https://www.playstation.com/pt-br/games/astro-bot/",
            author: "Overcritic Avaliações",
            thumbnail: "https://upload.wikimedia.org/wikipedia/en/a/a9/Astro_Bot_cover_art.jpg",
            category: "Games",
            description: "A aventura de plataforma da Team Asobi conquista a crítica mundial, superando marcos históricos do PlayStation 5.",
            badge: "🏆 CRÍTICA MUNDIAL",
            tempoLeitura: "2 min",
            fullContent: [
                "A desenvolvedora Team Asobi alcançou um triunfo histórico: Astro Bot para PlayStation 5 alcançou a consagradora nota 94 no Metacritic e no OpenCritic, tornando-se o jogo de plataforma 3D mais bem avaliado de toda a década.",
                "Com mais de 50 planetas espalhados por seis galáxias vibrantes, a aventura explora o poder de imersão do controle DualSense como nenhuma outra obra jamais fez. Cada superfície percorrida — grama, água, areia ou metal fundido — transmite sensações táteis singulares nas mãos do jogador, combinadas com o uso magistral de gatilhos adaptáveis e áudio 3D.",
                "O jogo funciona também como uma verdadeira carta de amor aos 30 anos de história dos videogames PlayStation, permitindo salvar mais de 150 robôs VIP caracterizados como heróis lendários, como Kratos, Crash Bandicoot, Spyro, Aloy, Nathan Drake e Solid Snake.",
                "Com média estelar unânime em todo o planeta, Astro Bot desponta como concorrente fortíssimo ao título de Jogo do Ano (GOTY)."
            ]
        },
        {
            id: "monster-hunter-wilds-detalhes",
            title: "Monster Hunter Wilds: Capcom detalha ecossistemas dinâmicos e suporte cross-play completo",
            pubDate: new Date(Date.now() - 3600000 * 12).toISOString(),
            link: "https://store.steampowered.com/app/2246340/Monster_Hunter_Wilds/",
            author: "Overcritic Radar",
            thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg",
            category: "Lançamentos",
            description: "Caçadores poderão explorar tempestades de areia e mudanças climáticas que alteram o comportamento dos monstros em tempo real.",
            badge: "⚡ DESTAQUE",
            tempoLeitura: "3 min",
            fullContent: [
                "A Capcom revelou um relatório aprofundado com detalhes técnicos impressionantes sobre Monster Hunter Wilds, próximo grande salto evolutivo de sua consagrada franquia global de caça.",
                "O mundo do jogo agora é totalmente contínuo, sem nenhuma tela de transição ou carregamento entre os acampamentos base e os ecossistemas selvagens. As regiões alternam entre períodos de fartura e temporadas extremas de tempestades severas. Durante tempestades elétricas de areia, predadores territoriais vorazes emergem para caçar em bandos, alterando a cadeia alimentar em tempo real.",
                "Entre as inovações mecânicas, o destaque é o Seikret, uma montaria plumada super veloz e ágil capaz de planar, permitindo ao caçador consumir poções, afiar lâminas e trocar para uma segunda arma primária mesmo em plena cavalgada.",
                "Por fim, a Capcom garantiu suporte integral a partidas multiplayer em cross-play unindo jogadores de PC (Steam), PlayStation 5 e Xbox Series X|S logo no dia de lançamento."
            ]
        }
    ];

    // Armazenamento em memória das notícias ativas para abertura rápida do modal
    let _noticiasCarregadas = [];
    let _noticiasTickerCarregadas = [];

    /**
     * Injeta folha de estilos do Modal de Matéria Overcritic
     */
    function injetarEstilosModalNoticia() {
        if (document.getElementById('overcritic-news-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'overcritic-news-modal-styles';
        style.textContent = `
            /* Overlay Leitor de Matérias Overcritic */
            .news-reader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 7, 15, 0.85);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .news-reader-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .news-reader-modal {
                width: 100%;
                max-width: 760px;
                max-height: 90vh;
                background: linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 13, 24, 0.99) 100%);
                border: 1px solid rgba(0, 240, 255, 0.3);
                border-radius: 20px;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.15);
                color: #f1f5f9;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.94) translateY(16px);
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .news-reader-overlay.active .news-reader-modal {
                transform: scale(1) translateY(0);
            }

            /* Tema Claro */
            body.light-mode .news-reader-overlay {
                background: rgba(15, 23, 42, 0.65);
            }
            body.light-mode .news-reader-modal {
                background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
                border-color: rgba(8, 145, 178, 0.35);
                box-shadow: 0 25px 60px rgba(8, 145, 178, 0.18), 0 10px 30px rgba(0, 0, 0, 0.1);
                color: #0f172a;
            }

            /* Topo do Modal */
            .news-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.02);
            }
            body.light-mode .news-modal-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
                background: rgba(0, 0, 0, 0.02);
            }
            .news-modal-tags {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .news-modal-badge {
                font-size: 0.76rem;
                font-weight: 800;
                padding: 4px 12px;
                border-radius: 999px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: rgba(0, 240, 255, 0.15);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.3);
            }
            body.light-mode .news-modal-badge {
                background: rgba(8, 145, 178, 0.15);
                color: #0891b2;
                border-color: rgba(8, 145, 178, 0.35);
            }
            .news-modal-time-tag {
                font-size: 0.78rem;
                color: var(--text-muted, #94a3b8);
                font-weight: 600;
            }
            body.light-mode .news-modal-time-tag {
                color: #64748b;
            }
            .news-modal-close-btn {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #f1f5f9;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                font-size: 1.15rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                line-height: 1;
            }
            .news-modal-close-btn:hover {
                background: rgba(255, 0, 85, 0.25);
                border-color: #ff0055;
                color: #ff3366;
                transform: scale(1.08);
            }
            body.light-mode .news-modal-close-btn {
                background: rgba(0, 0, 0, 0.06);
                border-color: rgba(0, 0, 0, 0.12);
                color: #334155;
            }
            body.light-mode .news-modal-close-btn:hover {
                background: rgba(225, 29, 72, 0.15);
                border-color: #e11d48;
                color: #e11d48;
            }

            /* Corpo do Modal */
            .news-modal-body {
                padding: 24px;
                overflow-y: auto;
                max-height: calc(90vh - 150px);
                scroll-behavior: smooth;
            }
            .news-modal-body::-webkit-scrollbar {
                width: 6px;
            }
            .news-modal-body::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.25);
                border-radius: 3px;
            }
            body.light-mode .news-modal-body::-webkit-scrollbar-thumb {
                background: rgba(8, 145, 178, 0.3);
            }
            .news-modal-hero-wrap {
                position: relative;
                width: 100%;
                max-height: 350px;
                border-radius: 14px;
                overflow: hidden;
                margin-bottom: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: #000;
            }
            body.light-mode .news-modal-hero-wrap {
                border-color: rgba(0, 0, 0, 0.1);
            }
            .news-modal-hero-img {
                width: 100%;
                max-height: 350px;
                object-fit: cover;
                display: block;
                transition: transform 0.4s ease;
            }
            .news-modal-title {
                font-size: 1.55rem;
                font-weight: 900;
                line-height: 1.35;
                letter-spacing: -0.3px;
                margin-bottom: 12px;
                color: #ffffff;
            }
            body.light-mode .news-modal-title {
                color: #0f172a;
            }
            .news-modal-meta-strip {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                font-size: 0.85rem;
                color: var(--text-muted, #94a3b8);
                margin-bottom: 22px;
                padding-bottom: 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            body.light-mode .news-modal-meta-strip {
                border-bottom-color: rgba(0, 0, 0, 0.08);
                color: #64748b;
            }
            .news-modal-author-badge {
                font-weight: 700;
                color: var(--accent-cyan, #00f0ff);
            }
            body.light-mode .news-modal-author-badge {
                color: #0284c7;
            }
            .news-modal-content {
                font-size: 1.02rem;
                line-height: 1.8;
                color: #cbd5e1;
            }
            body.light-mode .news-modal-content {
                color: #334155;
            }
            .news-modal-content p {
                margin-bottom: 16px;
            }
            .news-modal-content p:last-child {
                margin-bottom: 0;
            }
            .news-modal-lead-box {
                background: rgba(0, 240, 255, 0.06);
                border-left: 4px solid var(--accent-cyan, #00f0ff);
                padding: 14px 18px;
                border-radius: 0 10px 10px 0;
                margin-bottom: 20px;
                font-weight: 600;
                font-size: 1.05rem;
                color: #f8fafc;
            }
            body.light-mode .news-modal-lead-box {
                background: rgba(8, 145, 178, 0.08);
                border-left-color: #0891b2;
                color: #0f172a;
            }

            /* Rodapé do Modal com Ações */
            .news-modal-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.02);
                gap: 12px;
                flex-wrap: wrap;
            }
            body.light-mode .news-modal-footer {
                border-top-color: rgba(0, 0, 0, 0.08);
                background: rgba(0, 0, 0, 0.02);
            }
            .news-modal-action-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 9px 18px;
                border-radius: 10px;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.2s ease;
            }
            .news-modal-btn-primary {
                background: linear-gradient(135deg, #00f0ff, #0088ff);
                color: #07090f !important;
                border: none;
                box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
            }
            .news-modal-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0, 240, 255, 0.5);
            }
            .news-modal-btn-secondary {
                background: rgba(255, 255, 255, 0.08);
                color: #e2e8f0;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .news-modal-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.14);
                color: #fff;
            }
            body.light-mode .news-modal-btn-secondary {
                background: rgba(0, 0, 0, 0.05);
                color: #334155;
                border-color: rgba(0, 0, 0, 0.12);
            }
            body.light-mode .news-modal-btn-secondary:hover {
                background: rgba(0, 0, 0, 0.09);
                color: #0f172a;
            }

            /* Botão de Ler Matéria nos cards do Grid */
            .news-read-btn {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.82rem;
                font-weight: 700;
                color: var(--accent-cyan, #00f0ff);
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: gap 0.2s ease, transform 0.2s ease;
            }
            .news-read-btn:hover {
                gap: 9px;
                transform: translateX(2px);
            }
            body.light-mode .news-read-btn {
                color: #0284c7;
            }
            .news-card {
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Garante a criação do container do Modal no DOM
     */
    function obterOuCriarModalDOM() {
        injetarEstilosModalNoticia();
        let overlay = document.getElementById('overcriticNewsReaderOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overcriticNewsReaderOverlay';
            overlay.className = 'news-reader-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.onclick = function (e) {
                if (e.target === overlay) {
                    fecharModalNoticia();
                }
            };
            document.body.appendChild(overlay);

            // Listener de teclado (ESC)
            window.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    fecharModalNoticia();
                }
            });
        }
        return overlay;
    }

    /**
     * Abre o modal com os dados completos de uma notícia
     */
    function abrirModalNoticia(noticia) {
        if (!noticia) return;
        const overlay = obterOuCriarModalDOM();

        const safeTitle = (noticia.title || '').replace(/"/g, '&quot;');
        const safeAuthor = noticia.author || 'Overcritic Radar';
        const safeData = noticia.dataCompleta ? `Publicado em ${noticia.dataCompleta}` : (noticia.tempoFormatado || 'Hoje');
        const safeBadge = noticia.badge || '⚡ NOTÍCIA OVERCRITIC';
        const safeTempo = noticia.tempoLeitura || '2 min';
        const safeLink = (noticia.link && noticia.link.startsWith('http')) ? noticia.link : 'https://br.ign.com/';

        // Monta o corpo dos parágrafos
        let paragrafosHtml = '';
        if (Array.isArray(noticia.fullContent) && noticia.fullContent.length > 0) {
            paragrafosHtml = noticia.fullContent.map((p, idx) => {
                if (idx === 0) {
                    return `<div class="news-modal-lead-box">${p}</div>`;
                }
                return `<p>${p}</p>`;
            }).join('');
        } else if (noticia.description) {
            paragrafosHtml = `
                <div class="news-modal-lead-box">${noticia.description}</div>
                <p>Esta matéria foi sincronizada em tempo real a partir dos canais oficiais do nosso Radar Geek & Gamer. Para ler a reportagem completa com entrevistas, galeria de imagens e cobertura minuto a minuto na íntegra, utilize o botão abaixo para acessar o portal oficial.</p>
            `;
        } else {
            paragrafosHtml = `<p>Confira todos os detalhes completos desta reportagem no canal oficial da produtora e veículos especializados parceiros.</p>`;
        }

        overlay.innerHTML = `
            <div class="news-reader-modal" onclick="event.stopPropagation();">
                <div class="news-modal-header">
                    <div class="news-modal-tags">
                        <span class="news-modal-badge">${safeBadge}</span>
                        <span class="news-modal-time-tag">⏱️ ${safeTempo} de leitura • ${noticia.tempoFormatado || 'Hoje'}</span>
                    </div>
                    <button type="button" class="news-modal-close-btn" onclick="window.OvercriticGeekNews.fecharModal()" title="Fechar matéria (Esc)">✕</button>
                </div>
                <div class="news-modal-body">
                    <div class="news-modal-hero-wrap">
                        <img src="${noticia.thumbnail}" alt="${safeTitle}" class="news-modal-hero-img" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';">
                    </div>
                    <h2 class="news-modal-title">${noticia.title}</h2>
                    <div class="news-modal-meta-strip">
                        <span class="news-modal-author-badge">✍️ ${safeAuthor}</span>
                        <span>•</span>
                        <span>📅 ${safeData}</span>
                    </div>
                    <div class="news-modal-content">
                        ${paragrafosHtml}
                    </div>
                </div>
                <div class="news-modal-footer">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="news-modal-action-btn news-modal-btn-primary">
                            🔗 Ver Fonte Oficial Externa ➔
                        </a>
                        <button type="button" class="news-modal-action-btn news-modal-btn-secondary" onclick="window.OvercriticGeekNews.compartilharNoticia('${safeTitle.replace(/'/g, "\\'")}', '${safeLink}')">
                            📋 Compartilhar
                        </button>
                    </div>
                    <button type="button" class="news-modal-action-btn news-modal-btn-secondary" onclick="window.OvercriticGeekNews.fecharModal()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        overlay.classList.add('active');

        // Bloqueia scroll de fundo da página
        if (typeof window.bloquearScrollFundo === 'function') {
            window.bloquearScrollFundo();
        } else {
            document.documentElement.classList.add('og-modal-scroll-lock');
            document.body.classList.add('og-modal-scroll-lock');
        }
    }

    /**
     * Fecha o modal de notícia
     */
    function fecharModalNoticia() {
        const overlay = document.getElementById('overcriticNewsReaderOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        // Libera scroll de fundo
        if (typeof window.liberarScrollFundo === 'function') {
            window.liberarScrollFundo();
        } else {
            document.documentElement.classList.remove('og-modal-scroll-lock');
            document.body.classList.remove('og-modal-scroll-lock');
        }
    }

    /**
     * Compartilha ou copia o link da notícia
     */
    function compartilharNoticia(titulo, url) {
        if (navigator.share) {
            navigator.share({
                title: titulo,
                text: `${titulo} - Confira no Overcritic Geek Radar:`,
                url: url
            }).catch(() => {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                if (window.showToast && window.showToast.success) {
                    window.showToast.success('Link da matéria copiado para a área de transferência!');
                } else {
                    alert('Link copiado com sucesso!');
                }
            });
        }
    }

    /**
     * Abre modal a partir do índice da notícia na lista do grid
     */
    function abrirModalNoticiaByIndex(index) {
        if (_noticiasCarregadas && _noticiasCarregadas[index]) {
            abrirModalNoticia(_noticiasCarregadas[index]);
        }
    }

    /**
     * Abre modal a partir do índice da notícia na lista do ticker
     */
    function abrirModalNoticiaTicker(index) {
        if (_noticiasTickerCarregadas && _noticiasTickerCarregadas[index]) {
            abrirModalNoticia(_noticiasTickerCarregadas[index]);
        }
    }

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
     * Normaliza qualquer formato de data para um objeto Date válido.
     */
    function normalizarDataNoticia(dateInput) {
        if (!dateInput) return null;
        if (dateInput instanceof Date) {
            return isNaN(dateInput.getTime()) ? null : dateInput;
        }
        let s = String(dateInput).trim();
        if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(s)) {
            s = s.replace(' ', 'T') + 'Z';
        }
        let d = new Date(s);
        if (!isNaN(d.getTime())) return d;

        d = new Date(dateInput);
        return isNaN(d.getTime()) ? null : d;
    }

    /**
     * Formata data para o padrão amigável do dia-a-dia em Português (Fuso Local Brasil / BRT)
     */
    function formatarTempoNoticia(dateStr) {
        const d = normalizarDataNoticia(dateStr);
        if (!d) return 'Hoje';

        const agora = new Date();
        const diffMs = agora.getTime() - d.getTime();

        if (diffMs < 0 && Math.abs(diffMs) < 5 * 60 * 1000) {
            return '🔴 Agora mesmo';
        }

        const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
        const inicioOntem = inicioHoje - (24 * 60 * 60 * 1000);
        const inicioNoticia = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

        const horasFormat = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        if (inicioNoticia === inicioHoje) {
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 2) return '🔴 Agora mesmo';
            if (diffMin < 60) return `Há ${diffMin} min`;
            return `Hoje às ${horasFormat}`;
        }

        if (inicioNoticia === inicioOntem) {
            return `Ontem às ${horasFormat}`;
        }

        const diaMes = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return `${diaMes} às ${horasFormat}`;
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
        if (item.description) {
            const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match && match[1]) return match[1];
        }
        const cat = classificarCategoria(item);
        if (cat === 'Cinema & TV') {
            return 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg';
        }
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
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
                            const dataObj = normalizarDataNoticia(item.pubDate);
                            const dataCompleta = dataObj ? dataObj.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '';

                            return {
                                title: item.title,
                                pubDate: item.pubDate,
                                timestamp: dataObj ? dataObj.getTime() : 0,
                                dataCompleta: dataCompleta,
                                tempoFormatado: formatarTempoNoticia(item.pubDate),
                                link: item.link,
                                author: item.author || 'IGN Brasil / Geek News',
                                thumbnail: extrairImagemNoticia(item),
                                category: cat,
                                description: limparDescricao(item.description || item.content),
                                badge: cat === 'Cinema & TV' ? '🎬 CINEMA & SÉRIES' : (cat === 'Lançamentos' ? '🚀 LANÇAMENTO' : '🎮 GAMES')
                            };
                        });

                        normalizadas.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

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

        // Se ambos os feeds ao vivo falharem, retorna o catálogo de contingência atualizado
        return NOTICIAS_CONTINGENCIA.map(item => {
            const dataObj = normalizarDataNoticia(item.pubDate);
            return {
                ...item,
                timestamp: dataObj ? dataObj.getTime() : 0,
                dataCompleta: dataObj ? dataObj.toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
                tempoFormatado: formatarTempoNoticia(item.pubDate)
            };
        });
    }

    /**
     * Renderiza o Grid de Notícias Diárias em qualquer container
     */
    async function renderizarGridNoticias({ containerId, categoria = 'todos', limite = 6, onFinish = null }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        injetarEstilosModalNoticia();

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
                if (filtradas.length === 0) filtradas = todasNoticias;
            }

            const exibidas = filtradas.slice(0, limite);
            _noticiasCarregadas = exibidas;

            container.innerHTML = exibidas.map((noticia, idx) => {
                const safeTitle = (noticia.title || '').replace(/"/g, '&quot;');
                const catClass = noticia.category === 'Cinema & TV' ? 'badge-cinema' : (noticia.category === 'Lançamentos' ? 'badge-launch' : 'badge-game');

                return `
                    <article class="news-card" onclick="window.OvercriticGeekNews.abrirModalNoticiaByIndex(${idx})" title="Clique para ler a matéria completa">
                        <div class="news-thumb-wrapper">
                            <img src="${noticia.thumbnail}" alt="${safeTitle}" class="news-thumb-img" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';">
                            <span class="news-badge ${catClass}">${noticia.badge}</span>
                            <span class="news-time-chip" title="${noticia.dataCompleta ? 'Publicado em: ' + noticia.dataCompleta : noticia.tempoFormatado}">${noticia.tempoFormatado}</span>
                        </div>
                        <div class="news-body">
                            <h3 class="news-title">
                                <a href="javascript:void(0)" onclick="event.stopPropagation(); window.OvercriticGeekNews.abrirModalNoticiaByIndex(${idx});" title="${safeTitle}">${noticia.title}</a>
                            </h3>
                            <p class="news-desc">${noticia.description}</p>
                            <div class="news-footer">
                                <span class="news-author">✍️ ${noticia.author || 'Overcritic Geek'}</span>
                                <button type="button" class="news-read-btn" onclick="event.stopPropagation(); window.OvercriticGeekNews.abrirModalNoticiaByIndex(${idx});">
                                    Ler Matéria ➔
                                </button>
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

        injetarEstilosModalNoticia();

        const noticias = await obterNoticiasGeekAoVivo();
        if (!noticias || noticias.length === 0) return;

        _noticiasTickerCarregadas = noticias;

        const manchetesHtml = noticias.slice(0, 8).map((n, idx) => {
            return `<a href="javascript:void(0)" onclick="window.OvercriticGeekNews.abrirModalNoticiaTicker(${idx});" class="ticker-item"><span class="ticker-dot">⚡</span> <strong>${n.category.toUpperCase()}:</strong> ${n.title} <span class="ticker-time">(${n.tempoFormatado})</span></a>`;
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
        renderizarTicker: renderizarTickerGeek,
        abrirModal: abrirModalNoticia,
        abrirModalNoticiaByIndex: abrirModalNoticiaByIndex,
        abrirModalNoticiaTicker: abrirModalNoticiaTicker,
        fecharModal: fecharModalNoticia,
        compartilharNoticia: compartilharNoticia
    };

})(window);
