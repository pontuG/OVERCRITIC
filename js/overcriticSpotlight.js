/**
 * ══════════════════════════════════════════════════════════════════════════
 * OVERCRITIC SPOTLIGHT - BUSCA GLOBAL INSTANTÂNEA ESTILO RAYCAST / CYBERPUNK
 * ══════════════════════════════════════════════════════════════════════════
 * Atalho Universal: Ctrl + K (ou Cmd + K no Mac) / Clique no ícone de busca
 * 
 * Funcionalidades:
 * - Busca simultânea em tempo real de:
 *   1. Jogos (Catálogo, avaliações locais e títulos populares)
 *   2. Críticas e Resenhas (textos opinativos de jogos e mídias)
 *   3. Mídias (Filmes, Séries e obras audiovisuais)
 *   4. Troféus e Platinas (registros 100% e conquistas virtuais)
 *   5. Usuários e Jogadores (perfis, patentes e Gamer Cards)
 *   6. Ações Rápidas (Raycast Commands: missões, tier list, alternar tema)
 * - Navegação total pelo teclado com setas (↑, ↓) e Enter (↵)
 * - Filtros rápidos por chips de categorias
 * - Visual Cyberpunk Glassmorphism com suporte a Dark e Light Mode
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    if (window.OvercriticSpotlight) return;

    let _spotlightAberto = false;
    let _itensResultados = [];
    let _indiceSelecionado = 0;
    let _filtroCategoriaAtivo = 'todos';
    let _somAtivo = true;

    // Catálogo Curado de Fallback (Garante experiência imediata e rica)
    const CATALOGO_CURADO_JOGOS = [
        { titulo: 'Elden Ring', genero: 'RPG / Soulslike', ano: 2022, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg' },
        { titulo: "Baldur's Gate 3", genero: 'RPG / Turnos', ano: 2023, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg' },
        { titulo: 'Cyberpunk 2077', genero: 'Ação / RPG', ano: 2020, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg' },
        { titulo: 'Black Myth: Wukong', genero: 'Ação / Soulslike', ano: 2024, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg' },
        { titulo: 'God of War Ragnarök', genero: 'Ação / Aventura', ano: 2022, plataforma: 'PlayStation / PC', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg' },
        { titulo: 'The Witcher 3: Wild Hunt', genero: 'RPG / Mundo Aberto', ano: 2015, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg' },
        { titulo: 'Red Dead Redemption 2', genero: 'Mundo Aberto / Aventura', ano: 2018, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg' },
        { titulo: 'Hollow Knight', genero: 'Metroidvania / Indie', ano: 2017, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg' },
        { titulo: 'The Legend of Zelda: Tears of the Kingdom', genero: 'Aventura / RPG', ano: 2023, plataforma: 'Nintendo Switch', capa: '' },
        { titulo: 'Resident Evil 4 Remake', genero: 'Survival Horror', ano: 2023, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg' },
        { titulo: 'Astro Bot', genero: 'Plataforma 3D', ano: 2024, plataforma: 'PlayStation 5', capa: '' },
        { titulo: 'Metaphor: ReFantazio', genero: 'JRPG', ano: 2024, plataforma: 'Multi', capa: '' },
        { titulo: 'Silent Hill 2 Remake', genero: 'Horror Psicológico', ano: 2024, plataforma: 'PS5 / PC', capa: '' },
        { titulo: 'Grand Theft Auto V', genero: 'Ação / Mundo Aberto', ano: 2013, plataforma: 'Multi', capa: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg' }
    ];

    const CATALOGO_CURADO_MIDIAS = [
        { titulo: 'Breaking Bad', tipo: 'Série', genero: 'Crime / Drama', ano: '2008-2013' },
        { titulo: 'Arcane', tipo: 'Série', genero: 'Animação / Sci-Fi', ano: 2021 },
        { titulo: 'Better Call Saul', tipo: 'Série', genero: 'Drama / Jurídico', ano: '2015-2022' },
        { titulo: 'Duna: Parte 2 (Dune: Part Two)', tipo: 'Filme', genero: 'Ficção Científica', ano: 2024 },
        { titulo: 'Oppenheimer', tipo: 'Filme', genero: 'Biografia / Drama', ano: 2023 },
        { titulo: 'The Last of Us (Série HBO)', tipo: 'Série', genero: 'Drama / Pós-Apocalíptico', ano: 2023 },
        { titulo: 'Interestelar (Interstellar)', tipo: 'Filme', genero: 'Ficção Científica', ano: 2014 },
        { titulo: 'Homem-Aranha: Através do Aranhaverso', tipo: 'Filme', genero: 'Animação / Ação', ano: 2023 },
        { titulo: 'Ruptura (Severance)', tipo: 'Série', genero: 'Suspense / Sci-Fi', ano: 2022 },
        { titulo: 'Xógum: A Gloriosa Saga do Japão', tipo: 'Série', genero: 'Histórico / Drama', ano: 2024 },
        { titulo: 'O Pinguim (The Penguin)', tipo: 'Série', genero: 'Crime / Drama', ano: 2024 }
    ];

    // Som Tecnológico Sutíl via Web Audio API
    function emitirBipSpotlight(tipo = 'open') {
        if (!_somAtivo) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window._ogAudioCtx) window._ogAudioCtx = new AudioCtx();
            if (window._ogAudioCtx.state === 'suspended') window._ogAudioCtx.resume();
            const ctx = window._ogAudioCtx;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            if (tipo === 'open') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.13);
            } else if (tipo === 'move') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.02, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (tipo === 'select') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now);
                osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.17);
            }
        } catch (e) {}
    }

    // Normalizador de Texto (remove acentos e pontuações)
    function normalizar(texto) {
        if (!texto) return '';
        return String(texto)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // Destaque de Texto com <mark>
    function destacarCorrespondencia(texto, termo) {
        if (!texto) return '';
        if (!termo || !termo.trim()) return escapeHtml(texto);

        const termoNorm = normalizar(termo);
        const tokens = termoNorm.split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return escapeHtml(texto);

        let escapado = escapeHtml(texto);
        tokens.forEach(tok => {
            const regex = new RegExp(`(${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            escapado = escapado.replace(regex, '<mark class="spotlight-mark">$1</mark>');
        });
        return escapado;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ══════════════════════════════════════════════════════════
    // COLETORES DE DADOS DE BUSCA
    // ══════════════════════════════════════════════════════════

    function coletarJogos() {
        const itens = [];
        const titulosVistos = new Set();

        const chaves = ['overcritic_jogos', 'listaJogos', 'overcritic_lista_jogos'];
        chaves.forEach(chave => {
            try {
                const lista = JSON.parse(localStorage.getItem(chave) || '[]');
                if (Array.isArray(lista)) {
                    lista.forEach(j => {
                        const titulo = (j.titulo || j.nome || '').trim();
                        if (titulo && !titulosVistos.has(normalizar(titulo))) {
                            titulosVistos.add(normalizar(titulo));
                            itens.push({
                                categoria: 'jogos',
                                categoriaLabel: 'Jogos',
                                icone: '🎮',
                                cor: '#00f0ff',
                                titulo: titulo,
                                sub: `${j.genero || 'Jogo'} • ${j.plataforma || 'Multi'}${j.anoLancamento ? ' (' + j.anoLancamento + ')' : ''}`,
                                metaExtra: j.nota ? `⭐ ${j.nota}/10` : '',
                                capa: j.capaUrl || j.capa || '',
                                payload: j,
                                executar: () => {
                                    window.location.href = `adicionar_jogos.html?titulo=${encodeURIComponent(titulo)}`;
                                }
                            });
                        }
                    });
                }
            } catch (e) {}
        });

        // Adiciona Jogos Curados se não estiverem na lista
        CATALOGO_CURADO_JOGOS.forEach(curado => {
            if (!titulosVistos.has(normalizar(curado.titulo))) {
                titulosVistos.add(normalizar(curado.titulo));
                itens.push({
                    categoria: 'jogos',
                    categoriaLabel: 'Jogos',
                    icone: '🎮',
                    cor: '#00f0ff',
                    titulo: curado.titulo,
                    sub: `${curado.genero} • ${curado.plataforma} (${curado.ano})`,
                    metaExtra: '🔥 Catálogo Oficial',
                    capa: curado.capa,
                    payload: curado,
                    executar: () => {
                        window.location.href = `adicionar_jogos.html?titulo=${encodeURIComponent(curado.titulo)}`;
                    }
                });
            }
        });

        return itens;
    }

    function coletarMidias() {
        const itens = [];
        const titulosVistos = new Set();

        const chaves = ['overcritic_midias', 'listaMidias', 'overcritic_lista_midias'];
        chaves.forEach(chave => {
            try {
                const lista = JSON.parse(localStorage.getItem(chave) || '[]');
                if (Array.isArray(lista)) {
                    lista.forEach(m => {
                        const titulo = (m.titulo || m.nome || '').trim();
                        if (titulo && !titulosVistos.has(normalizar(titulo))) {
                            titulosVistos.add(normalizar(titulo));
                            itens.push({
                                categoria: 'midias',
                                categoriaLabel: 'Mídias',
                                icone: '🍿',
                                cor: '#ec4899',
                                titulo: titulo,
                                sub: `${m.tipo || 'Cinema'} • ${m.genero || 'Audiovisual'}${m.ano ? ' (' + m.ano + ')' : ''}`,
                                metaExtra: m.nota ? `⭐ ${m.nota}/10` : '',
                                capa: m.capaUrl || m.capa || '',
                                payload: m,
                                executar: () => {
                                    window.location.href = `adicionar_midias.html?titulo=${encodeURIComponent(titulo)}`;
                                }
                            });
                        }
                    });
                }
            } catch (e) {}
        });

        CATALOGO_CURADO_MIDIAS.forEach(curado => {
            if (!titulosVistos.has(normalizar(curado.titulo))) {
                titulosVistos.add(normalizar(curado.titulo));
                itens.push({
                    categoria: 'midias',
                    categoriaLabel: 'Mídias',
                    icone: '🍿',
                    cor: '#ec4899',
                    titulo: curado.titulo,
                    sub: `${curado.tipo} • ${curado.genero} (${curado.ano})`,
                    metaExtra: '🎬 Destaque Cine',
                    capa: '',
                    payload: curado,
                    executar: () => {
                        window.location.href = `adicionar_midias.html?titulo=${encodeURIComponent(curado.titulo)}`;
                    }
                });
            }
        });

        return itens;
    }

    function coletarCriticas() {
        const itens = [];
        const chaves = ['overcritic_jogos', 'listaJogos', 'overcritic_midias', 'listaMidias'];

        chaves.forEach(chave => {
            try {
                const lista = JSON.parse(localStorage.getItem(chave) || '[]');
                if (Array.isArray(lista)) {
                    lista.forEach(item => {
                        const texto = (item.review || item.opiniao || item.texto || item.resenha || item.relato || item.comentario || '').trim();
                        if (texto && texto.length >= 25) {
                            const tituloObra = (item.titulo || item.nome || 'Obra').trim();
                            const autor = item.autor || item.usuario || 'Crítico Anônimo';
                            const trecho = texto.length > 95 ? texto.substring(0, 95) + '...' : texto;

                            itens.push({
                                categoria: 'criticas',
                                categoriaLabel: 'Críticas',
                                icone: '✍️',
                                cor: '#f59e0b',
                                titulo: `Resenha: ${tituloObra}`,
                                sub: `"${trecho}" — por ${autor}`,
                                metaExtra: item.nota ? `⭐ ${item.nota}/10` : '📝 Resenha',
                                capa: item.capaUrl || '',
                                payload: item,
                                executar: () => {
                                    const destino = chave.includes('midia') ? 'adicionar_midias.html' : 'adicionar_jogos.html';
                                    window.location.href = `${destino}?titulo=${encodeURIComponent(tituloObra)}`;
                                }
                            });
                        }
                    });
                }
            } catch (e) {}
        });

        return itens;
    }

    function coletarPlatinasETrofeus() {
        const itens = [];
        const titulosVistos = new Set();

        // 1. Platinas registradas pelo usuário
        const chaves = ['overcritic_platinas', 'listaPlatinas', 'overcritic_lista_platinas'];
        chaves.forEach(chave => {
            try {
                const lista = JSON.parse(localStorage.getItem(chave) || '[]');
                if (Array.isArray(lista)) {
                    lista.forEach(p => {
                        const jogo = (p.jogo || p.titulo || '').trim();
                        if (jogo && !titulosVistos.has(normalizar(jogo))) {
                            titulosVistos.add(normalizar(jogo));
                            itens.push({
                                categoria: 'trofeus',
                                categoriaLabel: 'Platinas',
                                icone: '🏆',
                                cor: '#ffd700',
                                titulo: `Platina: ${jogo}`,
                                sub: `Dificuldade: ${p.dificuldade || 'Média'} • ${p.tempoHoras ? p.tempoHoras + 'h' : '100% Completo'}`,
                                metaExtra: '👑 100% Concluído',
                                capa: p.capaUrl || '',
                                payload: p,
                                executar: () => {
                                    window.location.href = `adicionar_platinas.html?tab=minhas&titulo=${encodeURIComponent(jogo)}`;
                                }
                            });
                        }
                    });
                }
            } catch (e) {}
        });

        // 2. Insígnias e Conquistas Virtuais do Overcritic
        const insigniasConfig = (window.OvercriticGamification && window.OvercriticGamification.CONFIG_INSIGNIAS) || [
            { id: 'primeiro_passo', nome: 'Primeiro Passo', icone: '🎮', descricao: 'Registrar o primeiro jogo avaliado.', xpBonus: 100 },
            { id: 'cacador_trofeus', nome: 'Caçador de Platinas', icone: '👑', descricao: 'Conquistar 3 platinas cadastradas.', xpBonus: 500 },
            { id: 'critico_respeitado', nome: 'Crítico Respeitado', icone: '✍️', descricao: 'Publicar 5 resenhas detalhadas (+180 caracteres).', xpBonus: 400 },
            { id: 'cineasta', nome: 'Cineasta', icone: '🍿', descricao: 'Avaliar 5 filmes ou séries.', xpBonus: 350 },
            { id: 'semana_perfeita', nome: 'Semana Perfeita', icone: '⚡', descricao: 'Cumprir as 4 missões semanais antes do timer expirar.', xpBonus: 500 }
        ];

        insigniasConfig.forEach(ins => {
            itens.push({
                categoria: 'trofeus',
                categoriaLabel: 'Troféus Virtuais',
                icone: ins.icone || '🏆',
                cor: '#ffd700',
                titulo: `Troféu: ${ins.nome}`,
                sub: ins.descricao,
                metaExtra: `+${ins.xpBonus} XP`,
                capa: '',
                payload: ins,
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirModalMuralInsignias) {
                        window.OvercriticGamification.abrirModalMuralInsignias('trofeus');
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            });
        });

        return itens;
    }

    function coletarUsuarios() {
        const itens = [];
        const usersVistos = new Set();

        // 1. Usuário atual
        const currentUser = (localStorage.getItem('overcritic_currentUser') || '').trim();
        if (currentUser) {
            usersVistos.add(normalizar(currentUser));
            itens.push({
                categoria: 'usuarios',
                categoriaLabel: 'Jogadores',
                icone: '👤',
                cor: '#a855f7',
                titulo: `${currentUser} (Você)`,
                sub: 'Ver meu Perfil & Gamer Card Oficial',
                metaExtra: '✨ Conectado',
                capa: '',
                payload: { username: currentUser },
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirGamerCardModal) {
                        window.OvercriticGamification.abrirGamerCardModal(currentUser);
                    } else {
                        window.location.href = 'conta_login.html?tab=perfil';
                    }
                }
            });
        }

        // 2. Ranking da Comunidade
        try {
            const ranking = JSON.parse(localStorage.getItem('overcritic_ranking_comunidade') || '[]');
            if (Array.isArray(ranking)) {
                ranking.forEach(j => {
                    const uname = (j.username || '').trim();
                    if (uname && !usersVistos.has(normalizar(uname))) {
                        usersVistos.add(normalizar(uname));
                        itens.push({
                            categoria: 'usuarios',
                            categoriaLabel: 'Jogadores',
                            icone: j.avatar || '🎮',
                            cor: j.corPatente || '#a855f7',
                            titulo: uname,
                            sub: `${j.iconePatente || '🌱'} Nv. ${j.nivel || 1} ${j.tituloPatente || 'Recruta Gamer'} • ${(j.xp || 0).toLocaleString('pt-BR')} XP`,
                            metaExtra: j.role || 'Membro Gamer',
                            capa: '',
                            payload: j,
                            executar: () => {
                                if (window.OvercriticGamification && window.OvercriticGamification.abrirGamerCardModal) {
                                    window.OvercriticGamification.abrirGamerCardModal(uname);
                                } else {
                                    window.location.href = `conta_login.html?user=${encodeURIComponent(uname)}`;
                                }
                            }
                        });
                    }
                });
            }
        } catch (e) {}

        return itens;
    }

    function coletarAcoesRapidas() {
        return [
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '⚡',
                cor: '#00f0ff',
                titulo: 'Missões da Semana & Temporizador',
                sub: 'Ver desafios com prazo e garantir até +1.800 XP para subir no ranking',
                metaExtra: 'Atalho: M',
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirModalMuralInsignias) {
                        window.OvercriticGamification.abrirModalMuralInsignias('missoes');
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🏆',
                cor: '#ffd700',
                titulo: 'Estante de Troféus & Insígnias Virtuais',
                sub: 'Abrir mural com todas as conquistas permanentes do portal',
                metaExtra: 'Atalho: T',
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirModalMuralInsignias) {
                        window.OvercriticGamification.abrirModalMuralInsignias('trofeus');
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🎴',
                cor: '#00f0ff',
                titulo: 'Gerar e Exportar meu Gamer Card Oficial',
                sub: 'Criar card colecionável em PNG de alta definição para redes sociais',
                metaExtra: 'Card Pro',
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirGamerCardModal) {
                        window.OvercriticGamification.abrirGamerCardModal();
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🎯',
                cor: '#ffb703',
                titulo: 'Criar Minha Tier List Pessoal',
                sub: 'Classificar jogos e filmes nos níveis S, A, B, C, D com exportação',
                metaExtra: 'Tier List',
                executar: () => {
                    if (window.OvercriticGamification && window.OvercriticGamification.abrirModalTierList) {
                        window.OvercriticGamification.abrirModalTierList();
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '⏳',
                cor: '#ff007f',
                titulo: 'Minha Fila de Jogos (Organizador de Backlog)',
                sub: 'Gerenciar jogos em: Jogando Agora, Zerados, Platinados, Pausados e Fila da Vergonha',
                metaExtra: 'Backlog Pro',
                executar: () => {
                    fecharSpotlight();
                    if (window.abrirModalFilaDeJogos) {
                        window.abrirModalFilaDeJogos();
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🔮',
                cor: '#00f0ff',
                titulo: 'Oráculo Gamer • Roleta "O que eu jogo hoje?"',
                sub: 'Sorteio estilo cyberpunk com filtros rápidos de tempo, gênero e vibe com Metacritic',
                metaExtra: 'Roleta IA',
                executar: () => {
                    fecharSpotlight();
                    if (window.abrirOraculoGamer) {
                        window.abrirOraculoGamer();
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🎮',
                cor: '#00f0ff',
                titulo: 'Adicionar Crítica de Jogo',
                sub: 'Ir para a página de cadastro e avaliação de jogos',
                metaExtra: 'Página',
                executar: () => { window.location.href = 'adicionar_jogos.html'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🍿',
                cor: '#ec4899',
                titulo: 'Adicionar Crítica de Filme ou Série',
                sub: 'Ir para a página de catálogo audiovisual',
                metaExtra: 'Página',
                executar: () => { window.location.href = 'adicionar_midias.html'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🏆',
                cor: '#ffd700',
                titulo: 'Registrar Nova Platina (100%)',
                sub: 'Ir para o painel de platinas e tempo de conclusão',
                metaExtra: 'Página',
                executar: () => { window.location.href = 'adicionar_platinas.html?tab=cadastrar'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🪐',
                cor: '#38bdf8',
                titulo: 'Descobrir Novos Jogos',
                sub: 'Explorar lançamentos, filtros e tendências de games',
                metaExtra: 'Página',
                executar: () => { window.location.href = 'descobrir_jogos.html'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🎬',
                cor: '#f59e0b',
                titulo: 'Descobrir Títulos & Filmes',
                sub: 'Explorar produções em alta do cinema mundial',
                metaExtra: 'Página',
                executar: () => { window.location.href = 'descobrir_titulos.html'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🌓',
                cor: '#ffd700',
                titulo: 'Alternar Tema Claro / Escuro',
                sub: 'Alternar entre o tema Cyberpunk Dark e o Modo Claro do portal',
                metaExtra: 'Tema',
                executar: () => {
                    document.body.classList.toggle('light-mode');
                    const isLight = document.body.classList.contains('light-mode');
                    localStorage.setItem('overcritic_theme', isLight ? 'light' : 'dark');
                }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '👤',
                cor: '#a855f7',
                titulo: 'Minha Conta / Perfil',
                sub: 'Gerenciar dados da conta, login, avatar e bio',
                metaExtra: 'Conta',
                executar: () => { window.location.href = 'conta_login.html?tab=perfil'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '💡',
                cor: '#10b981',
                titulo: 'Suporte & Sugestões',
                sub: 'Enviar feedback e relatar novas ideias para o Overcritic',
                metaExtra: 'Suporte',
                executar: () => { window.location.href = 'suporte_overcritic.html'; }
            },
            {
                categoria: 'acoes',
                categoriaLabel: 'Ações Rápidas',
                icone: '🏠',
                cor: '#00f0ff',
                titulo: 'Página Inicial (Dashboard)',
                sub: 'Ir para o painel principal do Overcritic',
                metaExtra: 'Home',
                executar: () => { window.location.href = 'index.html'; }
            }
        ];
    }

    // ══════════════════════════════════════════════════════════
    // MOTOR DE BUSCA EM TEMPO REAL
    // ══════════════════════════════════════════════════════════

    function buscar(termo, categoriaFiltro = 'todos') {
        const termoLimpo = (termo || '').trim();
        const termoNorm = normalizar(termoLimpo);
        const tokens = termoNorm.split(/\s+/).filter(Boolean);

        let banco = [];

        if (categoriaFiltro === 'todos' || categoriaFiltro === 'jogos') {
            banco = banco.concat(coletarJogos());
        }
        if (categoriaFiltro === 'todos' || categoriaFiltro === 'midias') {
            banco = banco.concat(coletarMidias());
        }
        if (categoriaFiltro === 'todos' || categoriaFiltro === 'trofeus') {
            banco = banco.concat(coletarPlatinasETrofeus());
        }
        if (categoriaFiltro === 'todos' || categoriaFiltro === 'criticas') {
            banco = banco.concat(coletarCriticas());
        }
        if (categoriaFiltro === 'todos' || categoriaFiltro === 'usuarios') {
            banco = banco.concat(coletarUsuarios());
        }
        if (categoriaFiltro === 'todos' || categoriaFiltro === 'acoes') {
            banco = banco.concat(coletarAcoesRapidas());
        }

        // Se a busca estiver vazia, exibe ações rápidas e destaques
        if (!termoNorm) {
            if (categoriaFiltro === 'todos') {
                return coletarAcoesRapidas().slice(0, 8);
            }
            return banco.slice(0, 10);
        }

        // Pontuação e Filtragem Inteligente
        const resultadosComScore = [];

        banco.forEach(item => {
            const titNorm = normalizar(item.titulo);
            const subNorm = normalizar(item.sub);
            const extraNorm = normalizar(item.metaExtra);

            // Verifica se todos os tokens estão presentes em algum dos campos
            const matchTodosTokens = tokens.every(tok => 
                titNorm.includes(tok) || subNorm.includes(tok) || extraNorm.includes(tok)
            );

            if (!matchTodosTokens) return;

            let score = 0;

            // Bônus de relevância
            if (titNorm === termoNorm) score += 120;
            else if (titNorm.startsWith(termoNorm)) score += 80;
            else if (titNorm.includes(termoNorm)) score += 50;

            if (subNorm.includes(termoNorm)) score += 20;
            if (extraNorm.includes(termoNorm)) score += 15;

            // Prioridade de categoria quando em 'todos'
            if (item.categoria === 'acoes') score += 10;
            if (item.categoria === 'jogos') score += 8;

            resultadosComScore.push({ item, score });
        });

        resultadosComScore.sort((a, b) => b.score - a.score);

        return resultadosComScore.slice(0, 25).map(r => r.item);
    }

    // ══════════════════════════════════════════════════════════
    // INTERFACE MODAL & ESTILOS CYBERPUNK
    // ══════════════════════════════════════════════════════════

    function injetarEstilosSpotlight() {
        if (document.getElementById('overcritic-spotlight-styles')) return;

        const style = document.createElement('style');
        style.id = 'overcritic-spotlight-styles';
        style.textContent = `
            /* ══════ TRAVA DE SCROLL TOTAL DO DOCUMENTO ══════ */
            html.og-spotlight-scroll-locked,
            body.og-spotlight-scroll-locked {
                overflow: hidden !important;
                height: 100% !important;
                max-height: 100vh !important;
                overscroll-behavior: none !important;
                touch-action: none !important;
            }

            /* ══════ OVERLAY DO SPOTLIGHT ══════ */
            .og-spotlight-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                background: rgba(5, 7, 13, 0.85);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 100000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: 70px 20px 30px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;
                box-sizing: border-box;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                overflow: hidden;
                overscroll-behavior: contain;
            }
            .og-spotlight-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* ══════ MODAL FLUTUANTE RAYCAST ══════ */
            .og-spotlight-modal {
                position: relative;
                width: 100%;
                max-width: 680px;
                background: linear-gradient(145deg, rgba(13, 18, 30, 0.98) 0%, rgba(8, 11, 20, 0.99) 100%);
                border: 1px solid rgba(0, 240, 255, 0.45);
                border-radius: 22px;
                box-shadow: 0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.22), inset 0 0 30px rgba(0, 240, 255, 0.04);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.96) translateY(-14px);
                transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .og-spotlight-overlay.active .og-spotlight-modal {
                transform: scale(1) translateY(0);
            }

            body.light-mode .og-spotlight-modal {
                background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                border-color: rgba(2, 132, 199, 0.45);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(2, 132, 199, 0.15);
            }

            /* Shimmer animado superior */
            .og-spotlight-modal::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 3px;
                background: linear-gradient(90deg, transparent, #00f0ff, #9d4edd, transparent);
                animation: spotlightBeam 4s infinite ease-in-out;
            }
            @keyframes spotlightBeam {
                0% { left: -100%; }
                40%, 100% { left: 200%; }
            }

            /* ══════ BARRA DE BUSCA SUPERIOR ══════ */
            .og-spotlight-search-bar {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 18px 22px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                position: relative;
            }
            body.light-mode .og-spotlight-search-bar {
                border-bottom-color: #e2e8f0;
            }
            .og-spotlight-search-icon {
                font-size: 1.35rem;
                color: #00f0ff;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.5));
            }
            body.light-mode .og-spotlight-search-icon {
                color: #0284c7;
                filter: none;
            }
            .og-spotlight-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                font-size: 1.15rem;
                font-weight: 700;
                color: #ffffff;
                font-family: inherit;
                letter-spacing: 0.3px;
            }
            body.light-mode .og-spotlight-input {
                color: #0f172a;
            }
            .og-spotlight-input::placeholder {
                color: #64748b;
                font-weight: 500;
            }
            .og-spotlight-clear-btn {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 8px;
                color: #94a3b8;
                font-size: 0.78rem;
                padding: 4px 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: none;
            }
            .og-spotlight-clear-btn:hover {
                background: rgba(255, 255, 255, 0.18);
                color: #ffffff;
            }
            .og-spotlight-esc-pill {
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 0.72rem;
                font-weight: 800;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #94a3b8;
                letter-spacing: 0.5px;
                user-select: none;
            }

            /* ══════ CHIPS DE FILTRO DE CATEGORIAS ══════ */
            .og-spotlight-filter-bar {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.25);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                overflow-x: auto;
                scrollbar-width: none;
            }
            .og-spotlight-filter-bar::-webkit-scrollbar {
                display: none;
            }
            body.light-mode .og-spotlight-filter-bar {
                background: #f1f5f9;
                border-bottom-color: #e2e8f0;
            }
            .og-spotlight-chip {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 5px 12px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 800;
                cursor: pointer;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.03);
                color: #94a3b8;
                white-space: nowrap;
                transition: all 0.2s ease;
                user-select: none;
            }
            .og-spotlight-chip:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.2);
            }
            .og-spotlight-chip.active {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(157, 78, 221, 0.25) 100%);
                border-color: #00f0ff;
                color: #00f0ff;
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
            }
            body.light-mode .og-spotlight-chip {
                background: #ffffff;
                border-color: #cbd5e1;
                color: #64748b;
            }
            body.light-mode .og-spotlight-chip.active {
                background: #e0f2fe;
                border-color: #0284c7;
                color: #0284c7;
            }

            /* ══════ LISTA DE RESULTADOS ══════ */
            .og-spotlight-results-wrap {
                max-height: 420px;
                overflow-y: auto;
                padding: 10px 14px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 240, 255, 0.4) transparent;
                overscroll-behavior: contain;
            }
            .og-spotlight-results-wrap::-webkit-scrollbar {
                width: 6px;
            }
            .og-spotlight-results-wrap::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.35);
                border-radius: 4px;
            }

            /* Item de Resultado Individual */
            .og-spotlight-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 12px 14px;
                border-radius: 14px;
                background: transparent;
                border: 1px solid transparent;
                cursor: pointer;
                transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                user-select: none;
            }
            .og-spotlight-item:hover,
            .og-spotlight-item.is-selected {
                background: linear-gradient(90deg, rgba(0, 240, 255, 0.12) 0%, rgba(157, 78, 221, 0.08) 100%);
                border-color: rgba(0, 240, 255, 0.45);
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.05);
                transform: translateX(3px);
            }
            body.light-mode .og-spotlight-item:hover,
            body.light-mode .og-spotlight-item.is-selected {
                background: #f0f9ff;
                border-color: rgba(2, 132, 199, 0.4);
                box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
            }

            /* Ícone / Capa do item */
            .og-spotlight-thumb {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
                flex-shrink: 0;
                overflow: hidden;
            }
            .og-spotlight-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* Dados textuais */
            .og-spotlight-info {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .og-spotlight-title {
                font-size: 0.96rem;
                font-weight: 800;
                color: #ffffff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            body.light-mode .og-spotlight-title {
                color: #0f172a;
            }
            .og-spotlight-sub {
                font-size: 0.78rem;
                color: #94a3b8;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.light-mode .og-spotlight-sub {
                color: #64748b;
            }

            /* Tag lateral / Badges */
            .og-spotlight-item-right {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            .og-spotlight-badge {
                padding: 3px 8px;
                border-radius: 8px;
                font-size: 0.68rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #cbd5e1;
            }
            .og-spotlight-enter-hint {
                font-size: 0.72rem;
                color: #00f0ff;
                display: none;
                align-items: center;
                gap: 4px;
                font-weight: 800;
            }
            .og-spotlight-item.is-selected .og-spotlight-enter-hint {
                display: inline-flex;
            }
            body.light-mode .og-spotlight-enter-hint {
                color: #0284c7;
            }

            /* Destaque <mark> */
            .spotlight-mark {
                background: rgba(0, 240, 255, 0.35);
                color: #ffffff;
                border-radius: 3px;
                padding: 0 3px;
                font-weight: 900;
            }
            body.light-mode .spotlight-mark {
                background: rgba(2, 132, 199, 0.25);
                color: #0369a1;
            }

            /* Estado Vazio */
            .og-spotlight-empty {
                padding: 40px 20px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                color: #94a3b8;
            }
            .og-spotlight-empty-icon {
                font-size: 2.2rem;
                opacity: 0.7;
            }
            .og-spotlight-empty-title {
                font-size: 1.05rem;
                font-weight: 800;
                color: #ffffff;
            }
            body.light-mode .og-spotlight-empty-title {
                color: #0f172a;
            }

            /* ══════ RODAPÉ COM ATALHOS DE TECLADO ══════ */
            .og-spotlight-footer {
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.4);
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.75rem;
                color: #94a3b8;
                user-select: none;
            }
            body.light-mode .og-spotlight-footer {
                background: #f8fafc;
                border-top-color: #e2e8f0;
                color: #64748b;
            }
            .og-spotlight-shortcuts {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            .og-spotlight-shortcuts span {
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .og-spotlight-shortcuts kbd {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 2px 6px;
                border-radius: 5px;
                font-size: 0.7rem;
                font-weight: 800;
                color: #ffffff;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            body.light-mode .og-spotlight-shortcuts kbd {
                background: #ffffff;
                border-color: #cbd5e1;
                color: #0f172a;
            }

            /* ══════ BOTÃO DE TRIGGER RÁPIDO NO HEADER (CYBERPUNK GLASS) ══════ */
            .spotlight-quick-trigger {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 8px 18px;
                border-radius: 14px;
                background: linear-gradient(135deg, rgba(13, 18, 30, 0.92) 0%, rgba(20, 26, 44, 0.92) 100%);
                border: 1px solid rgba(0, 240, 255, 0.4);
                color: #cbd5e1;
                font-size: 0.86rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), 0 0 14px rgba(0, 240, 255, 0.12);
                font-family: inherit;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                outline: none;
                user-select: none;
            }
            .spotlight-quick-trigger:hover {
                background: linear-gradient(135deg, rgba(18, 25, 42, 0.96) 0%, rgba(26, 35, 60, 0.96) 100%);
                border-color: #00f0ff;
                color: #ffffff;
                box-shadow: 0 0 22px rgba(0, 240, 255, 0.35), 0 6px 20px rgba(0, 0, 0, 0.5);
                transform: translateY(-1px);
            }
            .spotlight-quick-trigger:active {
                transform: translateY(0);
            }
            .spotlight-quick-trigger .spotlight-quick-icon {
                color: #00f0ff;
                font-size: 1rem;
                display: flex;
                align-items: center;
                filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.65));
            }
            .spotlight-quick-trigger .spotlight-quick-text {
                color: #94a3b8;
                font-weight: 500;
                letter-spacing: 0.2px;
            }
            .spotlight-quick-trigger:hover .spotlight-quick-text {
                color: #f1f5f9;
            }
            .spotlight-quick-trigger .spotlight-quick-kbd {
                display: inline-flex;
                align-items: center;
                gap: 3px;
                margin-left: 6px;
                font-size: 0.72rem;
                color: #64748b;
            }
            .spotlight-quick-trigger kbd {
                background: rgba(0, 240, 255, 0.08);
                border: 1px solid rgba(0, 240, 255, 0.3);
                padding: 2px 7px;
                border-radius: 6px;
                font-size: 0.7rem;
                font-weight: 800;
                color: #00f0ff;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                font-family: inherit;
            }
            body.light-mode .spotlight-quick-trigger {
                background: #ffffff;
                border-color: #cbd5e1;
                color: #475569;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
            }
            body.light-mode .spotlight-quick-trigger:hover {
                background: #f8fafc;
                border-color: #0284c7;
                color: #0f172a;
                box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
            }
            body.light-mode .spotlight-quick-trigger .spotlight-quick-icon {
                color: #0284c7;
                filter: none;
            }
            body.light-mode .spotlight-quick-trigger .spotlight-quick-text {
                color: #64748b;
            }
            body.light-mode .spotlight-quick-trigger:hover .spotlight-quick-text {
                color: #0f172a;
            }
            body.light-mode .spotlight-quick-trigger kbd {
                background: #f1f5f9;
                border-color: #cbd5e1;
                color: #0284c7;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            @media (max-width: 640px) {
                .og-spotlight-overlay {
                    padding: 30px 10px;
                }
                .og-spotlight-shortcuts span:not(:last-child) {
                    display: none;
                }
                .spotlight-quick-trigger .spotlight-quick-text {
                    display: none;
                }
            }
        `;

        const target = document.head || document.documentElement;
        if (target) {
            target.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                (document.head || document.documentElement).appendChild(style);
            });
        }
    }

    // Injeção Imediata de Estilos
    injetarEstilosSpotlight();

    // ══════════════════════════════════════════════════════════
    // CONTROLE DE TRAVA E LIBERAÇÃO DE SCROLL DA PÁGINA
    // ══════════════════════════════════════════════════════════
    let _scrollPosAnterior = 0;

    function travarScroll() {
        _scrollPosAnterior = window.scrollY || document.documentElement.scrollTop || 0;
        document.documentElement.classList.add('og-spotlight-scroll-locked');
        document.body.classList.add('og-spotlight-scroll-locked');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function destravarScroll() {
        document.documentElement.classList.remove('og-spotlight-scroll-locked');
        document.body.classList.remove('og-spotlight-scroll-locked');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        if (typeof _scrollPosAnterior === 'number') {
            window.scrollTo(0, _scrollPosAnterior);
        }
    }

    function garantirModalSpotlight() {
        injetarEstilosSpotlight();

        let overlay = document.getElementById('overcriticSpotlightOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'overcriticSpotlightOverlay';
        overlay.className = 'og-spotlight-overlay';
        overlay.innerHTML = `
            <div class="og-spotlight-modal" role="dialog" aria-modal="true" aria-label="Busca Global Overcritic">
                <!-- Barra de Busca -->
                <div class="og-spotlight-search-bar">
                    <span class="og-spotlight-search-icon">🔍</span>
                    <input type="text" 
                           id="ogSpotlightInput" 
                           class="og-spotlight-input" 
                           placeholder="Buscar jogos, críticas, mídias, troféus, usuários ou ações..." 
                           autocomplete="off" 
                           spellcheck="false">
                    <button type="button" id="ogSpotlightClearBtn" class="og-spotlight-clear-btn" title="Limpar busca">✕</button>
                    <span class="og-spotlight-esc-pill">ESC</span>
                </div>

                <!-- Chips de Categorias -->
                <div class="og-spotlight-filter-bar">
                    <button type="button" class="og-spotlight-chip active" data-cat="todos">✨ Todos</button>
                    <button type="button" class="og-spotlight-chip" data-cat="jogos">🎮 Jogos</button>
                    <button type="button" class="og-spotlight-chip" data-cat="midias">🍿 Mídias</button>
                    <button type="button" class="og-spotlight-chip" data-cat="trofeus">🏆 Platinas & Troféus</button>
                    <button type="button" class="og-spotlight-chip" data-cat="criticas">✍️ Críticas</button>
                    <button type="button" class="og-spotlight-chip" data-cat="usuarios">👤 Jogadores</button>
                    <button type="button" class="og-spotlight-chip" data-cat="acoes">⚡ Ações Rápidas</button>
                </div>

                <!-- Lista de Resultados -->
                <div class="og-spotlight-results-wrap" id="ogSpotlightResultsList" role="listbox"></div>

                <!-- Rodapé com Atalhos -->
                <div class="og-spotlight-footer">
                    <div class="og-spotlight-shortcuts">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> Navegar</span>
                        <span><kbd>↵</kbd> Selecionar</span>
                        <span><kbd>ESC</kbd> Fechar</span>
                    </div>
                    <div id="ogSpotlightStatusText" style="font-weight:700;">Overcritic Spotlight</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Previne vazamento de rolagem do mouse e touch para a página de trás
        overlay.addEventListener('wheel', (e) => {
            const list = document.getElementById('ogSpotlightResultsList');
            if (!list || !list.contains(e.target)) {
                e.preventDefault();
                return;
            }
            const atTop = list.scrollTop <= 0 && e.deltaY < 0;
            const atBottom = (list.scrollTop + list.clientHeight >= list.scrollHeight - 1) && e.deltaY > 0;
            if (atTop || atBottom) {
                e.preventDefault();
            }
        }, { passive: false });

        overlay.addEventListener('touchmove', (e) => {
            const list = document.getElementById('ogSpotlightResultsList');
            if (!list || !list.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Eventos do Modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });

        const input = document.getElementById('ogSpotlightInput');
        const clearBtn = document.getElementById('ogSpotlightClearBtn');

        input.addEventListener('input', () => {
            clearBtn.style.display = input.value.trim() ? 'block' : 'none';
            _indiceSelecionado = 0;
            renderizarResultados();
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            _indiceSelecionado = 0;
            input.focus();
            renderizarResultados();
        });

        // Navegação por teclado dentro do input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                moverSelecao(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moverSelecao(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executarSelecionado();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                fechar();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                alternarProximoChipFiltro(e.shiftKey ? -1 : 1);
            }
        });

        // Eventos nos chips de filtro
        const chips = overlay.querySelectorAll('.og-spotlight-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                _filtroCategoriaAtivo = chip.getAttribute('data-cat') || 'todos';
                _indiceSelecionado = 0;
                renderizarResultados();
                emitirBipSpotlight('move');
                input.focus();
            });
        });

        return overlay;
    }

    function alternarProximoChipFiltro(direcao = 1) {
        const overlay = document.getElementById('overcriticSpotlightOverlay');
        if (!overlay) return;
        const chips = Array.from(overlay.querySelectorAll('.og-spotlight-chip'));
        const indexAtual = chips.findIndex(c => c.classList.contains('active'));
        let novoIndex = (indexAtual + direcao + chips.length) % chips.length;
        chips[novoIndex].click();
    }

    function moverSelecao(delta) {
        if (_itensResultados.length === 0) return;
        _indiceSelecionado = (_indiceSelecionado + delta + _itensResultados.length) % _itensResultados.length;
        emitirBipSpotlight('move');
        atualizarItemAtivoDOM();
    }

    function atualizarItemAtivoDOM() {
        const container = document.getElementById('ogSpotlightResultsList');
        if (!container) return;

        const elementos = container.querySelectorAll('.og-spotlight-item');
        elementos.forEach((el, idx) => {
            if (idx === _indiceSelecionado) {
                el.classList.add('is-selected');
                el.setAttribute('aria-selected', 'true');
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                el.classList.remove('is-selected');
                el.setAttribute('aria-selected', 'false');
            }
        });
    }

    function executarSelecionado() {
        if (_itensResultados.length === 0) return;
        const item = _itensResultados[_indiceSelecionado];
        if (item && typeof item.executar === 'function') {
            emitirBipSpotlight('select');
            fechar();
            setTimeout(() => {
                item.executar();
            }, 80);
        }
    }

    function renderizarResultados() {
        const input = document.getElementById('ogSpotlightInput');
        const container = document.getElementById('ogSpotlightResultsList');
        const statusText = document.getElementById('ogSpotlightStatusText');
        if (!container || !input) return;

        const termo = input.value;
        _itensResultados = buscar(termo, _filtroCategoriaAtivo);

        if (_itensResultados.length === 0) {
            container.innerHTML = `
                <div class="og-spotlight-empty">
                    <span class="og-spotlight-empty-icon">🔍</span>
                    <div class="og-spotlight-empty-title">Nenhum resultado encontrado</div>
                    <div style="font-size:0.82rem;">Tente buscar com outros termos ou selecione o filtro "✨ Todos".</div>
                </div>
            `;
            if (statusText) statusText.textContent = '0 resultados';
            return;
        }

        if (_indiceSelecionado >= _itensResultados.length) {
            _indiceSelecionado = 0;
        }

        if (statusText) {
            statusText.textContent = `${_itensResultados.length} resultado(s)`;
        }

        const html = _itensResultados.map((item, index) => {
            const isSelected = index === _indiceSelecionado;
            const thumbHtml = item.capa 
                ? `<img src="${item.capa}" alt="${escapeHtml(item.titulo)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                   <span style="display:none;">${item.icone}</span>`
                : `<span>${item.icone}</span>`;

            return `
                <div class="og-spotlight-item ${isSelected ? 'is-selected' : ''}" 
                     data-index="${index}" 
                     role="option" 
                     aria-selected="${isSelected ? 'true' : 'false'}">
                    <div class="og-spotlight-thumb" style="border-color:${item.cor};">
                        ${thumbHtml}
                    </div>
                    <div class="og-spotlight-info">
                        <div class="og-spotlight-title">
                            <span>${destacarCorrespondencia(item.titulo, termo)}</span>
                        </div>
                        <div class="og-spotlight-sub">
                            ${destacarCorrespondencia(item.sub, termo)}
                        </div>
                    </div>
                    <div class="og-spotlight-item-right">
                        <span class="og-spotlight-badge" style="color:${item.cor}; border-color:${item.cor};">
                            ${item.metaExtra || item.categoriaLabel}
                        </span>
                        <span class="og-spotlight-enter-hint">
                            <span>Abrir</span> <kbd style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);">↵</kbd>
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Adiciona eventos de mouse para seleção suave
        const itensElements = container.querySelectorAll('.og-spotlight-item');
        itensElements.forEach(el => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            el.addEventListener('mouseenter', () => {
                _indiceSelecionado = idx;
                atualizarItemAtivoDOM();
            });
            el.addEventListener('click', () => {
                _indiceSelecionado = idx;
                executarSelecionado();
            });
        });
    }

    function abrir(termoInicial = '') {
        const overlay = garantirModalSpotlight();
        const input = document.getElementById('ogSpotlightInput');

        if (termoInicial && input) {
            input.value = termoInicial;
        }

        _spotlightAberto = true;
        _indiceSelecionado = 0;

        overlay.classList.add('active');
        emitirBipSpotlight('open');

        // Renderiza lista inicial
        renderizarResultados();

        // Foca no input
        setTimeout(() => {
            if (input) {
                input.focus();
                if (termoInicial) input.select();
            }
        }, 60);

        // Bloqueia scroll de fundo de forma infalível
        travarScroll();
    }

    function fechar() {
        const overlay = document.getElementById('overcriticSpotlightOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        _spotlightAberto = false;
        destravarScroll();
    }

    function alternar() {
        if (_spotlightAberto) fechar();
        else abrir();
    }

    // ══════════════════════════════════════════════════════════
    // LISTENER GLOBAL DE ATALHO UNIVERSAL (Ctrl + K / Cmd + K)
    // ══════════════════════════════════════════════════════════

    window.addEventListener('keydown', (e) => {
        // Ctrl + K ou Cmd + K
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            alternar();
            return;
        }

        // Tecla ESC para fechar caso esteja aberto
        if (e.key === 'Escape' && _spotlightAberto) {
            e.preventDefault();
            fechar();
        }
    });

    // Injeção ou vínculo do botão de busca na barra de navegação (.sidebar)
    function autoVincularGatilhosNav() {
        // 1. Vincula cliques em botões já existentes
        document.querySelectorAll('.btn-spotlight-nav, #btnOpenSpotlightNav, [data-spotlight-trigger]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                abrir();
            });
        });

        // 2. Se houver .nav-links na sidebar e ainda não possuir o botão de busca, insere automaticamente!
        const navLinks = document.querySelector('.sidebar .nav-links');
        if (navLinks && !document.getElementById('btnOpenSpotlightNav')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'btnOpenSpotlightNav';
            btn.className = 'nav-item btn-spotlight-nav';
            btn.setAttribute('data-tooltip', 'Busca Global (Ctrl + K)');
            btn.setAttribute('title', 'Busca Global Instantânea (Ctrl + K)');
            btn.style.cursor = 'pointer';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.innerHTML = '🔍';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                abrir();
            });

            // Insere logo após o primeiro link (Home) ou no topo da navegação
            const primeiroItem = navLinks.firstElementChild;
            if (primeiroItem && primeiroItem.nextSibling) {
                navLinks.insertBefore(btn, primeiroItem.nextSibling);
            } else {
                navLinks.appendChild(btn);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injetarEstilosSpotlight();
            autoVincularGatilhosNav();
        });
    } else {
        injetarEstilosSpotlight();
        autoVincularGatilhosNav();
    }

    // API Global
    window.OvercriticSpotlight = {
        abrir,
        fechar,
        alternar,
        buscar,
        coletarJogos,
        coletarMidias,
        coletarCriticas,
        coletarPlatinasETrofeus,
        coletarUsuarios,
        coletarAcoesRapidas
    };

    console.log('⚡ [Overcritic] Busca Global Instantânea (Spotlight / Ctrl+K) carregada com sucesso!');
})();
