/**
 * Overcritic - Duelo Diário da Comunidade (Interatividade na Home)
 * Coloca dois grandes títulos frente a frente todos os dias.
 * Permite voto em 1 clique, exibição de porcentagens ao vivo e garante +25 XP diários no primeiro voto do dia.
 */

(function (window) {
    const STORAGE_KEY_PREFIX = 'overcritic_daily_duel_vote_';
    const COUNTS_KEY_PREFIX = 'overcritic_daily_duel_counts_v2_';
    const XP_HISTORY_KEY_PREFIX = 'overcritic_duelos_xp_';

    // Catálogo épico com 30 duelos lendários da história dos games
    const CATALOGO_DUELOS = [
        {
            id: 'duel_elden_vs_gow',
            categoria: 'Duelo dos Titãs GOTY',
            jogoA: {
                id: 'elden_ring',
                titulo: 'Elden Ring',
                estudio: 'FromSoftware • 2022',
                genero: 'RPG de Ação / Soulsborne',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 24
            },
            jogoB: {
                id: 'gow_ragnarok',
                titulo: 'God of War Ragnarök',
                estudio: 'Santa Monica Studio • 2022',
                genero: 'Ação / Mitologia Nórdica',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/capsule_616x353.jpg',
                cor: '#ff0055',
                votosBase: 22
            }
        },
        {
            id: 'duel_cp2077_vs_witcher3',
            categoria: 'Obras-Primas da CD Projekt Red',
            jogoA: {
                id: 'cyberpunk_2077',
                titulo: 'Cyberpunk 2077',
                estudio: 'CD PROJEKT RED • 2020',
                genero: 'RPG / Ficção Futurista',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 29
            },
            jogoB: {
                id: 'witcher_3',
                titulo: 'The Witcher 3: Wild Hunt',
                estudio: 'CD PROJEKT RED • 2015',
                genero: 'RPG / Alta Fantasia Sombria',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg',
                cor: '#ff9900',
                votosBase: 31
            }
        },
        {
            id: 'duel_rdr2_vs_gta5',
            categoria: 'Titãs de Mundo Aberto da Rockstar',
            jogoA: {
                id: 'rdr2',
                titulo: 'Red Dead Redemption 2',
                estudio: 'Rockstar Games • 2018',
                genero: 'Aventura / Velho Oeste',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_616x353.jpg',
                cor: '#ff3333',
                votosBase: 36
            },
            jogoB: {
                id: 'gta5',
                titulo: 'Grand Theft Auto V',
                estudio: 'Rockstar Games • 2013',
                genero: 'Mundo Aberto / Ação Urbana',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 33
            }
        },
        {
            id: 'duel_bg3_vs_dragonage',
            categoria: 'Lendas do RPG Ocidental',
            jogoA: {
                id: 'baldurs_gate_3',
                titulo: "Baldur's Gate 3",
                estudio: 'Larian Studios • 2023',
                genero: 'CRPG / Narrativa & Escolhas',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_616x353.jpg',
                cor: '#9d4edd',
                votosBase: 28
            },
            jogoB: {
                id: 'dragon_age_veilguard',
                titulo: 'Dragon Age: The Veilguard',
                estudio: 'BioWare • 2024',
                genero: 'RPG de Ação e Fantasia',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1845910/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 19
            }
        },
        {
            id: 'duel_tlou1_vs_re4r',
            categoria: 'Terror de Sobrevivência & Narrativa',
            jogoA: {
                id: 'tlou_part1',
                titulo: 'The Last of Us Part I',
                estudio: 'Naughty Dog • 2022',
                genero: 'Ação / Sobrevivência Pós-Apocalíptica',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 26
            },
            jogoB: {
                id: 're4_remake',
                titulo: 'Resident Evil 4 Remake',
                estudio: 'Capcom • 2023',
                genero: 'Survival Horror / Ação Intensa',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/capsule_616x353.jpg',
                cor: '#ff0055',
                votosBase: 27
            }
        },
        {
            id: 'duel_sekiro_vs_ghostoftsushima',
            categoria: 'Caminho do Samurai vs Honra Shinobi',
            jogoA: {
                id: 'sekiro',
                titulo: 'Sekiro: Shadows Die Twice',
                estudio: 'FromSoftware • 2019',
                genero: 'Ação / Combate de Postura',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/capsule_616x353.jpg',
                cor: '#ff7700',
                votosBase: 31
            },
            jogoB: {
                id: 'ghost_of_tsushima',
                titulo: 'Ghost of Tsushima',
                estudio: 'Sucker Punch • 2020',
                genero: 'Mundo Aberto / Épica Samurai',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 33
            }
        },
        {
            id: 'duel_hollowknight_vs_ori',
            categoria: 'A Magia dos Metroidvanias',
            jogoA: {
                id: 'hollow_knight',
                titulo: 'Hollow Knight',
                estudio: 'Team Cherry • 2017',
                genero: 'Metroidvania / Atmosférico',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 34
            },
            jogoB: {
                id: 'ori_wisp',
                titulo: 'Ori and the Will of the Wisps',
                estudio: 'Moon Studios • 2020',
                genero: 'Metroidvania / Plataforma Artística',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1057090/capsule_616x353.jpg',
                cor: '#9d4edd',
                votosBase: 29
            }
        },
        {
            id: 'duel_ff7r_vs_persona5r',
            categoria: 'Reis dos JRPGs Modernos',
            jogoA: {
                id: 'ff7_remake',
                titulo: 'Final Fantasy VII Remake',
                estudio: 'Square Enix • 2020',
                genero: 'JRPG de Ação Cinemático',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 25
            },
            jogoB: {
                id: 'persona_5_royal',
                titulo: 'Persona 5 Royal',
                estudio: 'ATLUS • 2019',
                genero: 'JRPG / Turnos Estiloso',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/capsule_616x353.jpg',
                cor: '#ff0055',
                votosBase: 27
            }
        },
        {
            id: 'duel_wukong_vs_liesofp',
            categoria: 'A Nova Era dos Souls-Likes',
            jogoA: {
                id: 'black_myth_wukong',
                titulo: 'Black Myth: Wukong',
                estudio: 'Game Science • 2024',
                genero: 'RPG de Ação / Jornada ao Oeste',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/capsule_616x353.jpg',
                cor: '#ffd700',
                votosBase: 35
            },
            jogoB: {
                id: 'lies_of_p',
                titulo: 'Lies of P',
                estudio: 'Round8 Studio • 2023',
                genero: 'Souls-like / Fantasia Vitoriana',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1627720/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 28
            }
        },
        {
            id: 'duel_spiderman_vs_batman',
            categoria: 'O Ápice dos Heróis nos Quadrinhos & Games',
            jogoA: {
                id: 'spider_man_remastered',
                titulo: "Marvel's Spider-Man",
                estudio: 'Insomniac Games • 2018',
                genero: 'Ação / Teias em Nova York',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/capsule_616x353.jpg',
                cor: '#ff0055',
                votosBase: 24
            },
            jogoB: {
                id: 'batman_arkham_city',
                titulo: 'Batman: Arkham City',
                estudio: 'Rocksteady Studios • 2011',
                genero: 'Ação & Furtividade / O Cavaleiro das Trevas',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/200260/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 32
            }
        },
        {
            id: 'duel_hades2_vs_deadcells',
            categoria: 'Supremacia dos Roguelikes',
            jogoA: {
                id: 'hades_2',
                titulo: 'Hades II',
                estudio: 'Supergiant Games • 2024',
                genero: 'Rogue-like Hack & Slash Mitológico',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/capsule_616x353.jpg',
                cor: '#9d4edd',
                votosBase: 31
            },
            jogoB: {
                id: 'dead_cells',
                titulo: 'Dead Cells',
                estudio: 'Motion Twin • 2018',
                genero: 'Roguevania / Combate Frenético',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/588650/capsule_616x353.jpg',
                cor: '#ff7700',
                votosBase: 24
            }
        },
        {
            id: 'duel_doom_vs_ultrakill',
            categoria: 'Adrenalina Pura nos FPS',
            jogoA: {
                id: 'doom_eternal',
                titulo: 'DOOM Eternal',
                estudio: 'id Software • 2020',
                genero: 'FPS Rápido / Carnificina Heavy Metal',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/capsule_616x353.jpg',
                cor: '#ff3300',
                votosBase: 33
            },
            jogoB: {
                id: 'ultrakill',
                titulo: 'ULTRAKILL',
                estudio: 'Arsi "Hakita" Patala • 2020',
                genero: 'Retro FPS / Movimentação Hiper-Rápida',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1229490/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 22
            }
        },
        {
            id: 'duel_forza_vs_unbound',
            categoria: 'Velocidade, Asfalto e Tuning',
            jogoA: {
                id: 'forza_horizon_5',
                titulo: 'Forza Horizon 5',
                estudio: 'Playground Games • 2021',
                genero: 'Corrida em Mundo Aberto no México',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 29
            },
            jogoB: {
                id: 'nfs_unbound',
                titulo: 'Need for Speed Unbound',
                estudio: 'Criterion Games • 2022',
                genero: 'Corrida de Rua & Estilo Urbano',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1846380/capsule_616x353.jpg',
                cor: '#00ff66',
                votosBase: 18
            }
        },
        {
            id: 'duel_silenthill2_vs_alanwake2',
            categoria: 'Terror Psicológico Cinematográfico',
            jogoA: {
                id: 'silent_hill_2',
                titulo: 'Silent Hill 2 Remake',
                estudio: 'Bloober Team • 2024',
                genero: 'Terror Psicológico / Névoa Sombria',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/capsule_616x353.jpg',
                cor: '#00f0ff',
                votosBase: 26
            },
            jogoB: {
                id: 'dark_souls_3',
                titulo: 'Dark Souls III',
                estudio: 'FromSoftware • 2016',
                genero: 'Dark Fantasy RPG / O Fim das Cinzas',
                banner: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/capsule_616x353.jpg',
                cor: '#ff7700',
                votosBase: 31
            }
        }
    ];

    /**
     * Retorna a data chave YYYY-MM-DD determinística no horário local
     */
    function obterChaveDataHoje() {
        const agora = new Date();
        const y = agora.getFullYear();
        const m = String(agora.getMonth() + 1).padStart(2, '0');
        const d = String(agora.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /**
     * Retorna o Duelo do Dia determinístico sincronizado para toda a comunidade.
     * Inicia a rotação em 20/10/2026 com o Duelo 0 (Elden Ring vs God of War Ragnarök),
     * avançando 1 duelo épico a cada virada de dia à meia-noite.
     */
    function obterDueloDoDia() {
        const dataChave = obterChaveDataHoje();
        const agora = new Date();
        const dataBase = new Date(2026, 9, 20); // 20 de outubro de 2026
        const diffDias = Math.floor((agora - dataBase) / 86400000);
        const indice = ((diffDias % CATALOGO_DUELOS.length) + CATALOGO_DUELOS.length) % CATALOGO_DUELOS.length;

        return {
            dataChave,
            duelo: CATALOGO_DUELOS[indice],
            indice
        };
    }

    /**
     * Retorna a contagem atualizada de votos do dia (com cache/localStorage)
     */
    function obterContagemVotos(dataChave, duelo) {
        const storageKey = COUNTS_KEY_PREFIX + dataChave;
        try {
            const salvo = localStorage.getItem(storageKey);
            if (salvo) {
                return JSON.parse(salvo);
            }
        } catch (e) {}

        // Inicializa com os votos base orgÃ¢nicos e reduzidos do confronto
        const inicial = {
            votosA: duelo.jogoA.votosBase,
            votosB: duelo.jogoB.votosBase
        };

        // Se o jogador jÃ¡ tiver votado hoje, soma seu voto real Ã  nova base
        const votoUsuario = obterVotoUsuarioHoje(dataChave);
        if (votoUsuario && votoUsuario.opcao === 'A') {
            inicial.votosA += 1;
        } else if (votoUsuario && votoUsuario.opcao === 'B') {
            inicial.votosB += 1;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(inicial));
        } catch (e) {}
        return inicial;
    }

    /**
     * Salva a nova contagem de votos do dia
     */
    function salvarContagemVotos(dataChave, counts) {
        const storageKey = COUNTS_KEY_PREFIX + dataChave;
        try {
            localStorage.setItem(storageKey, JSON.stringify(counts));
        } catch (e) {}
    }

    /**
     * Retorna o voto do usuário hoje, se já votou
     */
    function obterVotoUsuarioHoje(dataChave) {
        const storageKey = STORAGE_KEY_PREFIX + dataChave;
        try {
            const salvo = localStorage.getItem(storageKey);
            if (salvo) {
                return JSON.parse(salvo);
            }
        } catch (e) {}
        return null;
    }

    /**
     * Registra o bônus de XP do duelo diário para o usuário
     */
    function registrarXpDueloDiario(dataChave) {
        const username = (localStorage.getItem('overcritic_currentUser') || 'Jogador').trim();
        const usernameLower = username.toLowerCase();
        const storageKey = XP_HISTORY_KEY_PREFIX + usernameLower;

        let historico = [];
        try {
            historico = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!Array.isArray(historico)) historico = [];
        } catch (e) {
            historico = [];
        }

        if (!historico.includes(dataChave)) {
            historico.push(dataChave);
            try {
                localStorage.setItem(storageKey, JSON.stringify(historico));
            } catch (e) {}
            return true;
        }
        return false;
    }

    /**
     * Síntese de áudio tecnológica para celebração do voto
     */
    function tocarSomVotoDuelo() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Nota 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, now); // C5
            osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
            gain1.gain.setValueAtTime(0.18, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.25);

            // Nota 2 (Triunfo)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
            osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
            gain2.gain.setValueAtTime(0.22, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.55);
        } catch (e) {}
    }

    /**
     * Computa o voto no Duelo Diário
     */
    function votarNoDuelo(opcao) {
        const { dataChave, duelo } = obterDueloDoDia();
        const jaVotou = obterVotoUsuarioHoje(dataChave);

        if (jaVotou) {
            if (window.showToast && typeof window.showToast.info === 'function') {
                window.showToast.info('Você já votou no Duelo de hoje! O próximo confronto começa à meia-noite.');
            }
            return;
        }

        const counts = obterContagemVotos(dataChave, duelo);
        if (opcao === 'A') {
            counts.votosA = (counts.votosA || 0) + 1;
        } else if (opcao === 'B') {
            counts.votosB = (counts.votosB || 0) + 1;
        }
        salvarContagemVotos(dataChave, counts);

        // Salva voto do usuário
        const registroVoto = {
            opcao,
            dataChave,
            votedAt: new Date().toISOString(),
            dueloId: duelo.id,
            xpColetado: true
        };
        try {
            localStorage.setItem(STORAGE_KEY_PREFIX + dataChave, JSON.stringify(registroVoto));
        } catch (e) {}

        // Concede +25 XP diários
        const ganhouXpAgora = registrarXpDueloDiario(dataChave);

        // Toca áudio e notifica
        tocarSomVotoDuelo();

        const nomeJogoVotado = opcao === 'A' ? duelo.jogoA.titulo : duelo.jogoB.titulo;

        if (window.showToast && typeof window.showToast.success === 'function') {
            window.showToast.success(`⚔️ Voto computado em ${nomeJogoVotado}! +25 XP garantidos no seu perfil!`, 4500);
        }

        // Sincroniza Gamificação e Ranking
        const currentUser = (localStorage.getItem('overcritic_currentUser') || 'Jogador').trim();
        if (window.OvercriticGamification) {
            try {
                if (typeof window.OvercriticGamification.atualizarBadgesNivelPagina === 'function') {
                    window.OvercriticGamification.atualizarBadgesNivelPagina();
                }
                if (typeof window.OvercriticGamification.sincronizarRankingNuvem === 'function') {
                    window.OvercriticGamification.sincronizarRankingNuvem(currentUser);
                }
            } catch (e) {}
        }

        // Atualiza a visualização do card com animação instantânea
        renderizarCardDuelo('homeDailyDuelContainer');
    }

    /**
     * Inicia cronômetro regressivo até a meia-noite (próximo duelo)
     */
    let intervalTimer = null;
    function iniciarCronometroRegressivo(elId) {
        if (intervalTimer) clearInterval(intervalTimer);

        function atualizar() {
            const el = document.getElementById(elId);
            if (!el) return;

            const agora = new Date();
            const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0);
            const diffMs = meiaNoite - agora;

            if (diffMs <= 0) {
                el.innerText = '00h 00m 00s';
                renderizarCardDuelo('homeDailyDuelContainer');
                return;
            }

            const h = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
            const m = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
            const s = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');

            el.innerText = `${h}h ${m}m ${s}s`;
        }

        atualizar();
        intervalTimer = setInterval(atualizar, 1000);
    }

    /**
     * Renderiza o Card de Destaque do Duelo Diário
     */
    function renderizarCardDuelo(containerId = 'homeDailyDuelContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { dataChave, duelo } = obterDueloDoDia();
        const counts = obterContagemVotos(dataChave, duelo);
        const votoUsuario = obterVotoUsuarioHoje(dataChave);

        const totalVotos = (counts.votosA || 0) + (counts.votosB || 0);
        const pctA = totalVotos > 0 ? Math.round((counts.votosA / totalVotos) * 100) : 50;
        const pctB = 100 - pctA;

        const jaVotou = !!votoUsuario;
        const votouA = jaVotou && votoUsuario.opcao === 'A';
        const votouB = jaVotou && votoUsuario.opcao === 'B';

        const cardHtml = `
            <div class="daily-duel-card ${jaVotou ? 'voted-state' : 'active-state'}">
                <div class="duel-top-bar">
                    <div class="duel-title-group">
                        <span class="duel-live-badge"><span class="duel-dot"></span> DUELO DIÁRIO DA COMUNIDADE</span>
                        <span class="duel-category-pill">${duelo.categoria}</span>
                    </div>
                    <div class="duel-meta-group">
                        <div class="duel-xp-chip" title="Ganhe +25 XP diários pelo primeiro voto do dia">
                            <span class="duel-xp-icon">⚡</span>
                            <span class="duel-xp-text">${jaVotou ? '+25 XP Coletados' : '+25 XP Diários'}</span>
                        </div>
                        <div class="duel-timer-wrap" title="Tempo restante até a rotação para o próximo confronto">
                            <span class="duel-timer-label">Novo Duelo em:</span>
                            <span class="duel-timer-val" id="duelCountdownTimer">--:--:--</span>
                        </div>
                    </div>
                </div>

                <div class="duel-arena-grid">
                    <!-- COMPETIDOR A -->
                    <div class="duel-fighter fighter-a ${votouA ? 'user-selected' : ''}">
                        <div class="fighter-banner-wrap">
                            <img src="${duelo.jogoA.banner}" alt="${duelo.jogoA.titulo}" class="fighter-img" loading="lazy" onerror="this.src='https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg'">
                            <div class="fighter-overlay"></div>
                            <span class="fighter-side-tag side-a">DESAFIANTE A</span>
                            ${votouA ? '<span class="user-vote-badge"><span class="vote-icon">👑</span> SEU VOTO</span>' : ''}
                        </div>
                        <div class="fighter-info">
                            <h3 class="fighter-name">${duelo.jogoA.titulo}</h3>
                            <div class="fighter-studio">${duelo.jogoA.estudio}</div>
                            <div class="fighter-genre">${duelo.jogoA.genero}</div>

                            ${jaVotou ? `
                                <div class="fighter-stats-reveal">
                                    <div class="fighter-pct-row">
                                        <span class="fighter-pct-number" style="color: ${duelo.jogoA.cor};">${pctA}%</span>
                                        <span class="fighter-votes-count">${counts.votosA.toLocaleString('pt-BR')} votos</span>
                                    </div>
                                    <div class="fighter-progress-track">
                                        <div class="fighter-progress-fill fill-a" style="width: ${pctA}%; background: ${duelo.jogoA.cor};"></div>
                                    </div>
                                </div>
                            ` : `
                                <div class="fighter-cta-wrap">
                                    <button type="button" class="duel-vote-btn btn-vote-a" onclick="window.OvercriticDailyDuel.votar('A')" title="Votar em ${duelo.jogoA.titulo} e ganhar +25 XP">
                                        <span class="btn-sword">⚔️</span> Votar em ${duelo.jogoA.titulo}
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- EMBLEMA VERSUS NO CENTRO -->
                    <div class="duel-versus-center">
                        <div class="versus-orb">
                            <span class="versus-text">VS</span>
                        </div>
                        <div class="versus-lighting-fx"></div>
                    </div>

                    <!-- COMPETIDOR B -->
                    <div class="duel-fighter fighter-b ${votouB ? 'user-selected' : ''}">
                        <div class="fighter-banner-wrap">
                            <img src="${duelo.jogoB.banner}" alt="${duelo.jogoB.titulo}" class="fighter-img" loading="lazy" onerror="this.src='https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/capsule_616x353.jpg'">
                            <div class="fighter-overlay"></div>
                            <span class="fighter-side-tag side-b">DESAFIANTE B</span>
                            ${votouB ? '<span class="user-vote-badge"><span class="vote-icon">👑</span> SEU VOTO</span>' : ''}
                        </div>
                        <div class="fighter-info">
                            <h3 class="fighter-name">${duelo.jogoB.titulo}</h3>
                            <div class="fighter-studio">${duelo.jogoB.estudio}</div>
                            <div class="fighter-genre">${duelo.jogoB.genero}</div>

                            ${jaVotou ? `
                                <div class="fighter-stats-reveal">
                                    <div class="fighter-pct-row">
                                        <span class="fighter-pct-number" style="color: ${duelo.jogoB.cor};">${pctB}%</span>
                                        <span class="fighter-votes-count">${counts.votosB.toLocaleString('pt-BR')} votos</span>
                                    </div>
                                    <div class="fighter-progress-track">
                                        <div class="fighter-progress-fill fill-b" style="width: ${pctB}%; background: ${duelo.jogoB.cor};"></div>
                                    </div>
                                </div>
                            ` : `
                                <div class="fighter-cta-wrap">
                                    <button type="button" class="duel-vote-btn btn-vote-b" onclick="window.OvercriticDailyDuel.votar('B')" title="Votar em ${duelo.jogoB.titulo} e ganhar +25 XP">
                                        <span class="btn-sword">⚔️</span> Votar em ${duelo.jogoB.titulo}
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- BARRA DE PLACAR GERAL DA COMUNIDADE -->
                <div class="duel-bottom-bar">
                    <div class="duel-community-stats">
                        <span class="duel-total-icon">👥</span>
                        <span class="duel-total-text">
                            <strong>${totalVotos.toLocaleString('pt-BR')}</strong> jogadores votaram hoje na comunidade
                        </span>
                    </div>

                    ${jaVotou ? `
                        <div class="duel-community-bar-track">
                            <div class="duel-bar-split bar-split-a" style="width: ${pctA}%;" title="${duelo.jogoA.titulo}: ${pctA}%">
                                <span>${duelo.jogoA.titulo} (${pctA}%)</span>
                            </div>
                            <div class="duel-bar-split bar-split-b" style="width: ${pctB}%;" title="${duelo.jogoB.titulo}: ${pctB}%">
                                <span>${duelo.jogoB.titulo} (${pctB}%)</span>
                            </div>
                        </div>
                    ` : `
                        <div class="duel-mystery-hint">
                            <span class="mystery-lock">🔒</span> Escolha um título acima para revelar as porcentagens ao vivo da comunidade!
                        </div>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = cardHtml;
        iniciarCronometroRegressivo('duelCountdownTimer');
    }

    // Inicialização automática quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        renderizarCardDuelo('homeDailyDuelContainer');
    });

    // Exporta globalmente
    window.OvercriticDailyDuel = {
        obterDueloDoDia,
        votar: votarNoDuelo,
        renderizarCard: renderizarCardDuelo
    };

})(window);
