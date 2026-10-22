// js/overcriticBacklogOracle.js - Organizador de Backlog ("Minha Fila de Jogos") & "Oráculo Gamer" (Roleta Cyberpunk)
// OVERCRITIC Gamers Daily Utility Engine - 100% Nativo, Responsivo e Gamificado

(function () {
    'use strict';

    if (window.OvercriticBacklog && window.OvercriticOracle) return;

    /* ══════════════════════════════════════════════════════════════════════════
       1. DEFINIÇÕES DE CATEGORIAS OFICIAIS DO BACKLOG
    ══════════════════════════════════════════════════════════════════════════ */
    const CATEGORIAS_BACKLOG = [
        { id: 'jogando', label: 'Jogando Agora', emoji: '🎮', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.5)', desc: 'Jogos atualmente em andamento' },
        { id: 'zerados', label: 'Zerados', emoji: '✅', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', desc: 'Campanha ou história principal concluída' },
        { id: 'platinados', label: 'Platinados', emoji: '🏆', color: '#ffd700', glow: 'rgba(255, 215, 0, 0.5)', desc: '100% das conquistas e troféus conquistados' },
        { id: 'pausados', label: 'Pausados', emoji: '⏸️', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', desc: 'Jogos deixados em espera temporária' },
        { id: 'backlog', label: 'Fila da Vergonha', emoji: '⏳', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.5)', desc: 'Comprados ou guardados para jogar algum dia' }
    ];

    const MAPA_CATEGORIAS = {};
    CATEGORIAS_BACKLOG.forEach(c => { MAPA_CATEGORIAS[c.id] = c; });

    /* ══════════════════════════════════════════════════════════════════════════
       2. ACERVO ROBUSTO DO ORÁCULO GAMER (METACRITIC OFICIAL & SINOPSES COMPLETAS)
    ══════════════════════════════════════════════════════════════════════════ */
    const ACERVO_ORACULO = [
        {
            title: "Baldur's Gate 3",
            metacritic: 96,
            scoreBadge: "🔥 Metacritic 96",
            genre: "RPG de Ação / Estratégia",
            genreKey: "rpg",
            hours: 85,
            timeCategory: "epic",
            vibe: ["emocionante", "desafio"],
            platforms: ["PC", "PS5", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
            synopsis: "Reunindo companheiros improváveis em uma aventura épica por Faerûn, você é infectado por uma larva devoradora de mentes. Suas decisões morais, relacionamentos e criatividade tática moldam um dos mundos mais vivos e profundos da história dos videogames."
        },
        {
            title: "Elden Ring",
            metacritic: 96,
            scoreBadge: "🏆 Metacritic 96",
            genre: "Soulslike / RPG de Ação",
            genreKey: "soulslike",
            hours: 60,
            timeCategory: "epic",
            vibe: ["desafio", "exploracao"],
            platforms: ["PC", "PS5", "PS4", "Xbox Series", "Xbox One"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
            synopsis: "Nas vastas Terras Intermédias guiadas pela Rainha Marika, o Anel Prístino foi destruído. Como um Maculado que já perdeu a graça divina, atravesse masmorras colossais, enfrente semideuses lendários e trilhe seu caminho para se tornar o Lorde Prístino."
        },
        {
            title: "Red Dead Redemption 2",
            metacritic: 97,
            scoreBadge: "⭐ Metacritic 97",
            genre: "Mundo Aberto / Ação Narrativa",
            genreKey: "openworld",
            hours: 50,
            timeCategory: "epic",
            vibe: ["emocionante", "exploracao"],
            platforms: ["PC", "PS4", "Xbox One"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
            synopsis: "América, 1899. O fim da era do Velho Oeste começou. Arthur Morgan e a gangue Van der Linde são forçados a fugir, roubar e lutar pela sobrevivência no coração implacável dos Estados Unidos enquanto dilemas morais e desconfiança ameaçam destruí-los."
        },
        {
            title: "Hollow Knight: Silksong",
            metacritic: 95,
            scoreBadge: "✨ Metacritic 95",
            genre: "Metroidvania / Ação Ágil",
            genreKey: "metroidvania",
            hours: 28,
            timeCategory: "epic",
            vibe: ["desafio", "exploracao"],
            platforms: ["PC", "PS5", "Xbox Series", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/header.jpg",
            synopsis: "Assuma o controle de Hornet, a princesa-protetora de Hallownest, capturada e levada ao misterioso reino de Pharloom governado pela seda e pela música coral. Escale até a cidadela brilhante dominando combates acrobatas mortais e dezenas de ferramentas inéditas."
        },
        {
            title: "Cyberpunk 2077: Phantom Liberty",
            metacritic: 89,
            scoreBadge: "⚡ Metacritic 89",
            genre: "RPG de Ação / Ficção Científica",
            genreKey: "rpg",
            hours: 32,
            timeCategory: "epic",
            vibe: ["emocionante", "adrenalina", "scifi"],
            platforms: ["PC", "PS5", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
            synopsis: "Mergulhe no perigoso enclave de Dogtown como o mercenário V em um thriller de espionagem cibernética de alta espionagem. Com o agente secreto da FIA Solomon Reed, desvende conspirações corporativas no coração decadente de Night City."
        },
        {
            title: "Astro Bot",
            metacritic: 94,
            scoreBadge: "🏆 Metacritic 94",
            genre: "Plataforma 3D / Aventura",
            genreKey: "platform",
            hours: 14,
            timeCategory: "medium",
            vibe: ["relaxar", "desafio"],
            platforms: ["PS5"],
            thumb: "https://upload.wikimedia.org/wikipedia/en/a/a9/Astro_Bot_cover_art.jpg",
            synopsis: "Uma celebração sensorial exultante do mundo dos videogames! Viaje por mais de 50 galáxias vibrantes, explore mecânicas inovadoras que redefinem o DualSense e resgate centenas de bots lendários em uma jornada de pura alegria e criatividade."
        },
        {
            title: "Disco Elysium - The Final Cut",
            metacritic: 97,
            scoreBadge: "👑 Metacritic 97",
            genre: "RPG Narrativo / Investigação",
            genreKey: "narrative",
            hours: 24,
            timeCategory: "medium",
            vibe: ["emocionante", "exploracao"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632470/header.jpg",
            synopsis: "Acorde como um detetive acometido por amnésia catastrófica em um quarto destruído no bairro costeiro de Revachol. Interrogue personagens inesquecíveis, desvende um assassinato hediondo e trave duelos dialéticos com as 24 facetas da sua própria mente."
        },
        {
            title: "Resident Evil 4 Remake",
            metacritic: 93,
            scoreBadge: "🩸 Metacritic 93",
            genre: "Terror de Sobrevivência / Ação",
            genreKey: "horror",
            hours: 16,
            timeCategory: "medium",
            vibe: ["adrenalina", "desafio", "horror"],
            platforms: ["PC", "PS5", "PS4", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg",
            synopsis: "Seis anos após o desastre biológico de Raccoon City, o agente Leon S. Kennedy é enviado a um vilarejo remoto na Europa para resgatar a filha do presidente dos EUA. Enfrente moradores hostis dominados pelo parasita Las Plagas em uma aula magistral de sobrevivência."
        },
        {
            title: "Metaphor: ReFantazio",
            metacritic: 94,
            scoreBadge: "⭐ Metacritic 94",
            genre: "JRPG de Turnos / Fantasia",
            genreKey: "rpg",
            hours: 75,
            timeCategory: "epic",
            vibe: ["emocionante", "desafio"],
            platforms: ["PC", "PS5", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2620600/header.jpg",
            synopsis: "Dos célebres criadores de Persona 3, 4 e 5, o Reino de Euchronia mergulha em caos após o regicídio. Um torneio real mágico é instaurado onde você e sua fada Gallica devem conquistar o apoio do povo canalizando os lendários poderes de Arquétipos heroicos."
        },
        {
            title: "DOOM: The Dark Ages",
            metacritic: 91,
            scoreBadge: "🔥 Metacritic 91",
            genre: "FPS Brutal / Ação",
            genreKey: "fps",
            hours: 12,
            timeCategory: "medium",
            vibe: ["adrenalina", "desafio"],
            platforms: ["PC", "PS5", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3017860/header.jpg",
            synopsis: "A visceral origem cinematográfica da fúria do Doom Slayer em uma sangrenta guerra medieval contra as hordas do Inferno. Empunhe escudos serra destruidores, maças eletrizadas e despedace legiões demoníacas em combates pesados no chão."
        },
        {
            title: "Silent Hill 2 Remake",
            metacritic: 86,
            scoreBadge: "🌫️ Metacritic 86",
            genre: "Terror Psicológico / Mistério",
            genreKey: "horror",
            hours: 15,
            timeCategory: "medium",
            vibe: ["emocionante", "horror", "exploracao"],
            platforms: ["PC", "PS5"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/header.jpg",
            synopsis: "Ao receber uma carta misteriosa de sua falecida esposa Mary pedindo para reencontrá-la em 'seu lugar especial', James Sunderland viaja até Silent Hill. Em meio à neblina e monstros grotescos que refletem sua psique, descubra a trágica verdade enterrada no lago."
        },
        {
            title: "Portal 2",
            metacritic: 95,
            scoreBadge: "🌀 Metacritic 95",
            genre: "Puzzle em 1ª Pessoa / Comédia",
            genreKey: "platform",
            hours: 8,
            timeCategory: "medium",
            vibe: ["relaxar", "emocionante"],
            platforms: ["PC", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/header.jpg",
            synopsis: "Preso nas entranhas abandonadas da Aperture Science, use a arma de portais quântica para resolver quebra-cabeças que desafiam a gravidade e o espaço, enquanto contracena com a inteligência artificial sarcástica GLaDOS e o atrapalhado robô Wheatley."
        },
        {
            title: "Inside",
            metacritic: 93,
            scoreBadge: "🌑 Metacritic 93",
            genre: "Plataforma / Quebra-Cabeça Sombrio",
            genreKey: "platform",
            hours: 3.5,
            timeCategory: "quick",
            vibe: ["emocionante", "exploracao"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/304430/header.jpg",
            synopsis: "Sozinho e perseguido, um menino se vê atraído para o centro de um projeto governamental macabro. Uma narrativa hipnótica, sem uma única palavra falada, que você conclui em uma única noite inesquecível de tensão máxima."
        },
        {
            title: "What Remains of Edith Finch",
            metacritic: 89,
            scoreBadge: "📖 Metacritic 89",
            genre: "Aventura Narrativa Imersiva",
            genreKey: "narrative",
            hours: 2.5,
            timeCategory: "quick",
            vibe: ["emocionante"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/501300/header.jpg",
            synopsis: "Edith Finch visita a colossal e labiríntica mansão de sua família para descobrir por que ela é a última viva de sua linhagem. Experimente os últimos momentos poéticos e criativos de cada parente através de minijogos únicos de puro lirismo."
        },
        {
            title: "Vampire Survivors",
            metacritic: 87,
            scoreBadge: "🦇 Metacritic 87",
            genre: "Ação Roguelite / Bullet Hell",
            genreKey: "fps",
            hours: 1.5,
            timeCategory: "quick",
            vibe: ["relaxar", "adrenalina"],
            platforms: ["PC", "PS5", "Xbox", "Switch", "Mobile"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1794680/header.jpg",
            synopsis: "Corte hordas de milhares de criaturas noturnas e sobreviva até o amanhecer! Escolha power-ups sinérgicos devastadores a cada nível e sinta a dopamina pura fluir em sessões frenéticas e ultra-divertidas de 20 minutos."
        },
        {
            title: "Celeste",
            metacritic: 94,
            scoreBadge: "🏔️ Metacritic 94",
            genre: "Plataforma de Precisão / Superação",
            genreKey: "platform",
            hours: 8,
            timeCategory: "medium",
            vibe: ["emocionante", "desafio"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg",
            synopsis: "Ajude a jovem Madeline a escalar a misteriosa e desafiadora Montanha Celeste enquanto enfrenta seus próprios demônios internos e ansiedade. Controles milimétricos, trilha sonora arrebatadora e uma história que aquece o coração."
        },
        {
            title: "Sekiro: Shadows Die Twice",
            metacritic: 90,
            scoreBadge: "⚔️ Metacritic 90",
            genre: "Ação Shinobi / Soulslike",
            genreKey: "soulslike",
            hours: 30,
            timeCategory: "epic",
            vibe: ["desafio", "adrenalina"],
            platforms: ["PC", "PS5", "PS4", "Xbox"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
            synopsis: "No Japão brutal do período Sengoku, você é o Lobo de um Braço Só, um guerreiro mutilado ressuscitado à beira da morte. Domine a arte do desvio de lâminas com espadas de katana e prótese shinobi para resgatar seu jovem mestre real."
        },
        {
            title: "Forza Horizon 5",
            metacritic: 92,
            scoreBadge: "🏎️ Metacritic 92",
            genre: "Corrida em Mundo Aberto",
            genreKey: "openworld",
            hours: 22,
            timeCategory: "epic",
            vibe: ["relaxar", "adrenalina"],
            platforms: ["PC", "Xbox Series", "Xbox One"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
            synopsis: "Lidere expedições de tirar o fôlego pelas paisagens vibrantes e em constante evolução do México. Pilote centenas dos carros mais cobiçados do planeta por desertos vivos, selvas tropicais exuberantes e o topo do vulcão Gran Caldera."
        },
        {
            title: "BioShock",
            metacritic: 96,
            scoreBadge: "⚡ Metacritic 96",
            genre: "FPS Imersivo / Ficção Científica",
            genreKey: "fps",
            hours: 12,
            timeCategory: "medium",
            vibe: ["emocionante", "exploracao"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7670/header.jpg",
            synopsis: "Sobrevivente de uma queda de avião em pleno oceano Atlântico, você adentra Rapture, uma metrópole subaquática utópica corrompida pela ganância e engenharia genética. Reescreva seu DNA com plasmídeos para enfrentar os temíveis Big Daddies."
        },
        {
            title: "The Witcher 3: Wild Hunt",
            metacritic: 93,
            scoreBadge: "🐺 Metacritic 93",
            genre: "RPG de Ação / Fantasia Épica",
            genreKey: "rpg",
            hours: 55,
            timeCategory: "epic",
            vibe: ["emocionante", "exploracao"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg",
            synopsis: "Como Geralt de Rívia, um lendário caçador de monstros mercenário, percorra continentes devastados pela guerra em busca de Ciri, sua protegida e uma arma viva ligada a uma profecia ancestral caçada pelos cavaleiros fantasmagóricos da Caçada Selvagem."
        },
        {
            title: "Persona 5 Royal",
            metacritic: 95,
            scoreBadge: "🎭 Metacritic 95",
            genre: "JRPG Estilizado / Vida Escolar",
            genreKey: "rpg",
            hours: 100,
            timeCategory: "epic",
            vibe: ["emocionante", "desafio"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg",
            synopsis: "Durante o dia, viva como um estudante normal de Tóquio construindo amizades e romances. À noite, vista a máscara dos Phantom Thieves e invada o Metaverso para roubar os desejos distorcidos de criminosos e corruptos."
        },
        {
            title: "Hades",
            metacritic: 93,
            scoreBadge: "🔥 Metacritic 93",
            genre: "Roguelike de Ação / Mitologia",
            genreKey: "rpg",
            hours: 22,
            timeCategory: "epic",
            vibe: ["desafio", "adrenalina", "emocionante"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch", "iOS"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg",
            synopsis: "Desafie o próprio Deus dos Mortos no papel de Zagreu, Príncipe do Submundo, que luta para escapar do domínio de seu pai com o auxílio das bênçãos dos deuses do Olimpo em combates frenéticos e diálogos inesquecíveis."
        },
        {
            title: "Monster Hunter Wilds",
            metacritic: 89,
            scoreBadge: "🦖 Metacritic 89",
            genre: "RPG de Ação / Caçada Co-op",
            genreKey: "rpg",
            hours: 45,
            timeCategory: "epic",
            vibe: ["adrenalina", "desafio"],
            platforms: ["PC", "PS5", "Xbox Series"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/header.jpg",
            synopsis: "Aventure-se pelas Terras Proibidas com ecossistemas vivos e clima dinâmico que altera o comportamento da fauna. Cace feras titânicas, forje equipamentos com suas presas e domine novas técnicas com sua montaria Seikret."
        },
        {
            title: "Slay the Spire",
            metacritic: 89,
            scoreBadge: "🃏 Metacritic 89",
            genre: "Construção de Baralho / Roguelike",
            genreKey: "narrative",
            hours: 18,
            timeCategory: "medium",
            vibe: ["desafio", "relaxar"],
            platforms: ["PC", "PS5", "PS4", "Xbox", "Switch", "Mobile"],
            thumb: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg",
            synopsis: "Mistura genial de card game colecionável e roguelike em turnos. Construa um baralho dinâmico, descubra relíquias que alteram drasticamente suas sinergias e derrote chefes enigmáticos no topo da Torre."
        }
    ];

    /* ══════════════════════════════════════════════════════════════════════════
       3. SINTETIZADOR DE ÁUDIO CYBERPUNK (WEB AUDIO API - ZERO ARQUIVOS EXTERNOS)
    ══════════════════════════════════════════════════════════════════════════ */
    function emitirSomCyber(tipo = 'tick', pitchOffset = 0) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window._ogAudioCtx) window._ogAudioCtx = new AudioCtx();
            if (window._ogAudioCtx.state === 'suspended') window._ogAudioCtx.resume();
            const ctx = window._ogAudioCtx;
            const now = ctx.currentTime;

            if (tipo === 'tick') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                const freq = 450 + Math.min(pitchOffset, 500);
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.03);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.exponentialRampToValueAtTime(0.04, now + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.045);
            } else if (tipo === 'win') {
                // Acorde triunfal em camadas cyberpunk (C5 -> E5 -> G5 -> C6)
                const notas = [523.25, 659.25, 783.99, 1046.50];
                notas.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = idx === 3 ? 'sine' : 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.06 + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.65);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.7);
                });
            } else if (tipo === 'status_change') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.13);
            }
        } catch (e) {
            // Ignora se o navegador restringir áudio
        }
    }

    /* ══════════════════════════════════════════════════════════════════════════
       4. ESTILOS CSS CYBERPUNK PARA O BACKLOG E O ORÁCULO
    ══════════════════════════════════════════════════════════════════════════ */
    function injetarEstilosBacklogOracle() {
        const styleId = 'overcritic-backlog-oracle-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ════ OVERLAYS & MODAIS GLOBAIS ════ */
            .og-bo-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 7, 14, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 100010;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
                box-sizing: border-box;
                overflow-y: auto;
            }
            .og-bo-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .og-bo-modal {
                width: 100%;
                max-width: 920px;
                max-height: 92vh;
                background: linear-gradient(145deg, rgba(13, 18, 30, 0.98), rgba(8, 12, 22, 0.98));
                border: 1px solid rgba(0, 240, 255, 0.35);
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 240, 255, 0.22);
                border-radius: 24px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.92) translateY(20px);
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
            }
            .og-bo-overlay.active .og-bo-modal {
                transform: scale(1) translateY(0);
            }
            body.light-mode .og-bo-modal {
                background: #f1f4f9;
                border-color: rgba(2, 132, 199, 0.4);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 25px rgba(2, 132, 199, 0.18);
            }

            /* Header do Modal */
            .og-bo-header {
                padding: 20px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                background: radial-gradient(circle at 15% 50%, rgba(0, 240, 255, 0.12), transparent 50%);
            }
            body.light-mode .og-bo-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
                background: radial-gradient(circle at 15% 50%, rgba(2, 132, 199, 0.1), transparent 50%);
            }
            .og-bo-title-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .og-bo-badge-icon {
                width: 44px;
                height: 44px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                background: rgba(0, 240, 255, 0.12);
                border: 1px solid rgba(0, 240, 255, 0.35);
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
            }
            .og-bo-title {
                font-size: 1.35rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                letter-spacing: -0.5px;
            }
            .og-bo-subtitle {
                font-size: 0.78rem;
                color: var(--text-muted, #adb5bd);
                margin-top: 2px;
            }
            .og-bo-close {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: var(--text-muted, #adb5bd);
                width: 38px;
                height: 38px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.15rem;
                transition: all 0.2s ease;
            }
            .og-bo-close:hover {
                background: rgba(239, 68, 68, 0.25);
                border-color: #ef4444;
                color: #fff;
                transform: scale(1.08);
            }

            /* Corpo do Modal */
            .og-bo-body {
                padding: 20px 24px;
                overflow-y: auto;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 18px;
            }

            /* ════ SEÇÃO DO GRÁFICO DE PIZZA (DONUT) NO BACKLOG ════ */
            .og-chart-container-card {
                background: rgba(255, 255, 255, 0.025);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 18px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 14px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
                position: relative;
            }
            body.light-mode .og-chart-container-card {
                background: rgba(255, 255, 255, 0.8);
                border-color: rgba(0, 0, 0, 0.08);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            }
            .og-chart-top-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            .og-chart-title {
                font-size: 0.95rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .og-chart-toggle-group {
                display: inline-flex;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 3px;
                gap: 4px;
            }
            body.light-mode .og-chart-toggle-group {
                background: rgba(0, 0, 0, 0.06);
            }
            .og-chart-toggle-btn {
                background: transparent;
                border: none;
                color: var(--text-muted, #adb5bd);
                font-size: 0.74rem;
                font-weight: 700;
                padding: 6px 12px;
                border-radius: 7px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .og-chart-toggle-btn.active {
                background: var(--accent-cyan, #00f0ff);
                color: #07090f;
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
            }
            body.light-mode .og-chart-toggle-btn.active {
                background: #0284c7;
                color: #fff;
            }

            .og-chart-grid-layout {
                display: grid;
                grid-template-columns: 240px 1fr;
                gap: 20px;
                align-items: center;
            }
            @media (max-width: 680px) {
                .og-chart-grid-layout {
                    grid-template-columns: 1fr;
                    justify-items: center;
                }
            }
            .og-canvas-wrap {
                position: relative;
                width: 220px;
                height: 220px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .og-pie-canvas {
                width: 220px;
                height: 220px;
                display: block;
                cursor: pointer;
            }
            .og-chart-tooltip {
                position: absolute;
                pointer-events: none;
                background: rgba(10, 15, 26, 0.95);
                border: 1px solid var(--accent-cyan, #00f0ff);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 14px rgba(0, 240, 255, 0.3);
                border-radius: 10px;
                padding: 8px 12px;
                font-size: 0.76rem;
                color: #fff;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(5px);
                transition: opacity 0.15s ease, transform 0.15s ease;
                z-index: 10;
            }
            .og-chart-tooltip.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Legenda Interativa */
            .og-chart-legend {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 8px;
            }
            .og-legend-pill {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
            }
            .og-legend-pill:hover,
            .og-legend-pill.active {
                transform: translateY(-2px);
                border-color: currentColor;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
            }
            .og-legend-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .og-legend-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .og-legend-name {
                font-size: 0.78rem;
                font-weight: 700;
                color: var(--text-main, #f8f9fa);
            }
            .og-legend-val {
                font-size: 0.78rem;
                font-weight: 800;
                color: var(--accent-cyan, #00f0ff);
            }

            /* ════ CONTROLES & FILTROS DO BACKLOG ════ */
            .og-backlog-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            }
            .og-backlog-filter-pills {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            .og-b-filter-btn {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.09);
                color: var(--text-muted, #adb5bd);
                padding: 6px 12px;
                font-size: 0.76rem;
                font-weight: 700;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .og-b-filter-btn:hover {
                border-color: rgba(0, 240, 255, 0.35);
                color: var(--text-main, #f8f9fa);
            }
            .og-b-filter-btn.active {
                background: rgba(0, 240, 255, 0.14);
                border-color: var(--accent-cyan, #00f0ff);
                color: var(--accent-cyan, #00f0ff);
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
            }
            .og-btn-add-game {
                background: linear-gradient(135deg, #00f0ff, #0088ff);
                color: #07090f;
                border: none;
                padding: 8px 16px;
                border-radius: 10px;
                font-size: 0.8rem;
                font-weight: 800;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
            }
            .og-btn-add-game:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 240, 255, 0.5);
            }

            /* Lista de Jogos da Fila */
            .og-backlog-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
                gap: 14px;
            }
            .og-backlog-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                position: relative;
            }
            .og-backlog-card:hover {
                transform: translateY(-3px);
                border-color: rgba(0, 240, 255, 0.4);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.1);
            }
            .og-backlog-cover-wrap {
                height: 110px;
                position: relative;
                background: #000;
                overflow: hidden;
            }
            .og-backlog-cover {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            .og-backlog-card:hover .og-backlog-cover {
                transform: scale(1.05);
            }
            .og-backlog-status-badge {
                position: absolute;
                top: 8px;
                left: 8px;
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 0.72rem;
                font-weight: 800;
                color: #fff;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .og-backlog-hours-badge {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.75);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 3px 8px;
                font-size: 0.72rem;
                font-weight: 700;
                color: #ffd700;
            }
            .og-backlog-card-body {
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;
            }
            .og-backlog-card-title {
                font-size: 0.95rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .og-backlog-card-meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.76rem;
                color: var(--text-muted, #adb5bd);
            }
            .og-backlog-status-actions {
                display: flex;
                gap: 4px;
                padding-top: 6px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                flex-wrap: wrap;
            }
            .og-chip-action {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: var(--text-muted, #adb5bd);
                font-size: 0.68rem;
                font-weight: 700;
                padding: 4px 6px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 3px;
            }
            .og-chip-action:hover {
                border-color: currentColor;
                transform: scale(1.05);
            }
            .og-chip-action.current {
                background: rgba(0, 240, 255, 0.15);
                border-color: var(--accent-cyan, #00f0ff);
                color: var(--accent-cyan, #00f0ff);
            }

            /* ══════════════════════════════════════════════════════════
               5. ESTILOS CYBERPUNK DA ROLETA / ORÁCULO GAMER
            ══════════════════════════════════════════════════════════ */
            .og-oracle-wrap {
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
            }
            /* Filtros Rápidos */
            .og-oracle-filters-box {
                width: 100%;
                background: rgba(255, 255, 255, 0.025);
                border: 1px solid rgba(0, 240, 255, 0.2);
                border-radius: 18px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.03);
            }
            .og-filter-row {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .og-filter-label {
                font-size: 0.78rem;
                font-weight: 800;
                color: var(--accent-cyan, #00f0ff);
                min-width: 110px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .og-filter-options {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                flex: 1;
            }
            .og-chip-filter {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-muted, #adb5bd);
                padding: 5px 12px;
                font-size: 0.76rem;
                font-weight: 700;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .og-chip-filter:hover {
                border-color: rgba(0, 240, 255, 0.4);
                color: #fff;
            }
            .og-chip-filter.active {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(157, 78, 221, 0.25));
                border-color: var(--accent-cyan, #00f0ff);
                color: #fff;
                box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
                font-weight: 800;
            }

            /* Palco da Roleta Cibernética */
            .og-wheel-stage {
                position: relative;
                width: 320px;
                height: 320px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px auto;
            }
            .og-wheel-pointer {
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 14px solid transparent;
                border-right: 14px solid transparent;
                border-top: 24px solid #00f0ff;
                filter: drop-shadow(0 0 10px #00f0ff);
                z-index: 25;
                animation: pointerPulse 1.8s infinite;
            }
            @keyframes pointerPulse {
                0%, 100% { filter: drop-shadow(0 0 8px #00f0ff); }
                50% { filter: drop-shadow(0 0 18px #00f0ff) drop-shadow(0 0 24px #ff007f); }
            }
            .og-wheel-canvas {
                width: 320px;
                height: 320px;
                border-radius: 50%;
                box-shadow: 0 0 40px rgba(0, 240, 255, 0.25), inset 0 0 30px rgba(0, 0, 0, 0.8);
                display: block;
            }
            .og-wheel-center-core {
                position: absolute;
                width: 72px;
                height: 72px;
                border-radius: 50%;
                background: radial-gradient(circle, #0d121e 40%, #00f0ff 120%);
                border: 2px solid #00f0ff;
                box-shadow: 0 0 25px rgba(0, 240, 255, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                z-index: 20;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            .og-wheel-center-core:hover {
                transform: scale(1.1);
            }

            .og-btn-spin {
                background: linear-gradient(135deg, #00f0ff 0%, #9d4edd 100%);
                border: none;
                color: #fff;
                font-size: 1.05rem;
                font-weight: 900;
                padding: 14px 34px;
                border-radius: 14px;
                cursor: pointer;
                box-shadow: 0 8px 30px rgba(0, 240, 255, 0.4), 0 0 20px rgba(157, 78, 221, 0.3);
                letter-spacing: 0.5px;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }
            .og-btn-spin:hover:not(:disabled) {
                transform: translateY(-3px) scale(1.03);
                box-shadow: 0 12px 40px rgba(0, 240, 255, 0.6), 0 0 30px rgba(157, 78, 221, 0.5);
            }
            .og-btn-spin:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Card Holográfico do Jogo Sorteado */
            .og-oracle-result-card {
                width: 100%;
                background: linear-gradient(135deg, rgba(13, 20, 36, 0.95), rgba(8, 12, 22, 0.95));
                border: 1px solid rgba(0, 240, 255, 0.4);
                box-shadow: 0 15px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.25);
                border-radius: 20px;
                padding: 20px;
                display: none;
                animation: ogResultReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes ogResultReveal {
                0% { opacity: 0; transform: scale(0.92) translateY(15px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .og-oracle-result-layout {
                display: grid;
                grid-template-columns: 180px 1fr;
                gap: 20px;
                align-items: flex-start;
            }
            @media (max-width: 600px) {
                .og-oracle-result-layout {
                    grid-template-columns: 1fr;
                }
            }
            .og-oracle-result-cover {
                width: 100%;
                height: 180px;
                border-radius: 14px;
                object-fit: cover;
                border: 1px solid rgba(0, 240, 255, 0.35);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
            }
            .og-oracle-result-content {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .og-oracle-result-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
            }
            .og-oracle-result-title {
                font-size: 1.35rem;
                font-weight: 900;
                color: var(--text-main, #f8f9fa);
                line-height: 1.2;
            }
            .og-meta-badge-metacritic {
                background: linear-gradient(135deg, #10b981, #059669);
                color: #fff;
                font-size: 0.82rem;
                font-weight: 900;
                padding: 4px 10px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .og-oracle-result-meta-row {
                display: flex;
                gap: 10px;
                font-size: 0.78rem;
                color: var(--text-muted, #adb5bd);
                flex-wrap: wrap;
            }
            .og-oracle-result-synopsis {
                font-size: 0.88rem;
                color: #cbd5e1;
                line-height: 1.55;
            }
            body.light-mode .og-oracle-result-synopsis {
                color: #334155;
            }
            .og-oracle-result-actions {
                display: flex;
                gap: 10px;
                margin-top: 6px;
                flex-wrap: wrap;
            }
            .og-btn-result-action {
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 0.84rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border: none;
            }
            .og-btn-action-primary {
                background: linear-gradient(135deg, #00f0ff, #0088ff);
                color: #07090f;
                box-shadow: 0 4px 18px rgba(0, 240, 255, 0.35);
            }
            .og-btn-action-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 240, 255, 0.55);
            }
            .og-btn-action-secondary {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: var(--text-main, #f8f9fa);
            }
            .og-btn-action-secondary:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.3);
            }

            /* Modal de Confirmação Cyberpunk (Limpar Fila) */
            .og-cyber-confirm-overlay {
                position: fixed;
                inset: 0;
                z-index: 100000;
                background: rgba(4, 6, 12, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .og-cyber-confirm-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }
            .og-cyber-confirm-modal {
                background: linear-gradient(145deg, rgba(17, 24, 39, 0.98), rgba(11, 15, 25, 0.98));
                border: 1px solid rgba(239, 68, 68, 0.5);
                box-shadow: 0 0 40px rgba(239, 68, 68, 0.28), 0 20px 50px rgba(0, 0, 0, 0.8);
                border-radius: 20px;
                max-width: 440px;
                width: 100%;
                padding: 28px 24px 22px;
                text-align: center;
                transform: scale(0.92) translateY(12px);
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .og-cyber-confirm-overlay.active .og-cyber-confirm-modal {
                transform: scale(1) translateY(0);
            }
            .og-cyber-confirm-icon-wrap {
                position: relative;
                width: 70px;
                height: 70px;
                margin: 0 auto 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(239, 68, 68, 0.12);
                border: 2px solid rgba(239, 68, 68, 0.5);
                border-radius: 50%;
                font-size: 2rem;
                box-shadow: 0 0 24px rgba(239, 68, 68, 0.35);
            }
            .og-cyber-confirm-icon-glow {
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 1px dashed rgba(239, 68, 68, 0.4);
                animation: ogSpinSlow 12s linear infinite;
            }
            @keyframes ogSpinSlow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .og-cyber-confirm-title {
                font-size: 1.3rem;
                font-weight: 800;
                color: #f8f9fa;
                margin-bottom: 8px;
                letter-spacing: -0.3px;
            }
            .og-cyber-confirm-desc {
                font-size: 0.9rem;
                color: var(--text-muted, #adb5bd);
                line-height: 1.5;
                margin-bottom: 22px;
            }
            .og-cyber-confirm-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .og-cyber-confirm-btn-cancel {
                flex: 1;
                padding: 12px 18px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #e5e7eb;
                border-radius: 12px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .og-cyber-confirm-btn-cancel:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(0, 240, 255, 0.4);
                color: #00f0ff;
                transform: translateY(-1px);
            }
            .og-cyber-confirm-btn-danger {
                flex: 1.2;
                padding: 12px 18px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border: 1px solid rgba(239, 68, 68, 0.8);
                color: #ffffff;
                border-radius: 12px;
                font-weight: 800;
                font-size: 0.9rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.45);
                transition: all 0.2s ease;
            }
            .og-cyber-confirm-btn-danger:hover {
                transform: translateY(-1px);
                box-shadow: 0 0 30px rgba(239, 68, 68, 0.7);
                filter: brightness(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    /* ══════════════════════════════════════════════════════════════════════════
       6. GERENCIAMENTO DE DADOS DO BACKLOG (LOCALSTORAGE & FALLBACK CONSOLIDADO)
    ══════════════════════════════════════════════════════════════════════════ */
    function obterChaveStorageUsuario(username) {
        const u = (username || localStorage.getItem('overcritic_currentUser') || 'jogador').trim().toLowerCase();
        return `overcritic_backlog_v1_${u}`;
    }

    function obterFilaUsuario(username) {
        const u = (username || localStorage.getItem('overcritic_currentUser') || 'jogador').trim().toLowerCase();
        const chave = obterChaveStorageUsuario(u);
        const chaveIniciado = `overcritic_backlog_iniciado_${u}`;

        // 1. Se já existe registro salvo no localStorage (inclusive array vazio []), RESPEITA A ESCOLHA DO USUÁRIO
        try {
            const raw = localStorage.getItem(chave);
            if (raw !== null) {
                const listaSalva = JSON.parse(raw);
                if (Array.isArray(listaSalva)) {
                    return listaSalva;
                }
            }
        } catch (e) {
            // Em caso de erro de parse, continua para checar inicialização
        }

        // 2. Se já foi inicializado anteriormente pelo usuário, NÃO recria nada (mantém vazio se ele removeu tudo)
        const jaInicializado = localStorage.getItem(chaveIniciado) === 'true';
        if (jaInicializado) {
            return [];
        }

        // 3. Primeira execução para este usuário: importa apenas dados reais já existentes (reviews/platinas)
        let listaInicial = [];
        try {
            localStorage.setItem(chaveIniciado, 'true');

            // Jogos avaliados reais viram "Zerados"
            const localJogos = JSON.parse(localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]');
            localJogos.filter(j => (j.autor || '').toLowerCase() === u).forEach(j => {
                listaInicial.push({
                    id: 'rev_' + (j.id || Math.random().toString(36).substr(2, 6)),
                    user: u,
                    titulo: j.titulo,
                    categoria: 'zerados',
                    horas: Number(j.horas || 15),
                    plataforma: j.plataforma || 'PC',
                    nota: j.minhaNota || j.nota || 10,
                    capa: j.capaUrl || j.capa || '',
                    atualizadoEm: new Date().toISOString()
                });
            });

            // Platinas reais viram "Platinados"
            const localPlat = JSON.parse(localStorage.getItem('overcritic_platinas_feed') || localStorage.getItem('overcritic_platinas') || '[]');
            localPlat.filter(p => (p.user || p.usuario || '').toLowerCase() === u).forEach(p => {
                const title = p.title || p.titulo;
                if (!listaInicial.some(item => (item.titulo || '').toLowerCase() === (title || '').toLowerCase())) {
                    listaInicial.push({
                        id: 'plat_' + (p.id || Math.random().toString(36).substr(2, 6)),
                        user: u,
                        titulo: title,
                        categoria: 'platinados',
                        horas: Number(p.hours || p.horas || 35),
                        plataforma: p.platform || 'PS5',
                        nota: 10,
                        capa: p.cover || p.cover_url || '',
                        atualizadoEm: new Date().toISOString()
                    });
                }
            });
        } catch (e) {
            listaInicial = [];
        }

        // Salva a lista real inicial (sem mocks de teste!) e retorna
        salvarFilaUsuario(u, listaInicial);
        return listaInicial;
    }

    function salvarFilaUsuario(username, lista) {
        const u = (username || localStorage.getItem('overcritic_currentUser') || 'jogador').trim().toLowerCase();
        const chave = obterChaveStorageUsuario(u);
        const chaveIniciado = `overcritic_backlog_iniciado_${u}`;
        try {
            const arr = Array.isArray(lista) ? lista : [];
            localStorage.setItem(chave, JSON.stringify(arr));
            localStorage.setItem(chaveIniciado, 'true');
        } catch (e) {}
    }

    function obterEstatisticasBacklog(username) {
        const lista = obterFilaUsuario(username);
        const contagem = { jogando: 0, zerados: 0, platinados: 0, pausados: 0, backlog: 0 };
        const horas = { jogando: 0, zerados: 0, platinados: 0, pausados: 0, backlog: 0 };
        let totalJogos = lista.length;
        let totalHoras = 0;

        lista.forEach(item => {
            const cat = item.categoria || 'backlog';
            if (contagem[cat] !== undefined) {
                contagem[cat]++;
                const h = Number(item.horas) || 0;
                horas[cat] += h;
                totalHoras += h;
            }
        });

        return {
            totalJogos,
            totalHoras,
            contagem,
            horas
        };
    }

    /* ══════════════════════════════════════════════════════════════════════════
       7. RENDERIZADOR DO GRÁFICO DE PIZZA / DONUT NEON (CANVAS NATIVO)
    ══════════════════════════════════════════════════════════════════════════ */
    let _chartAnimFrameId = null;

    function renderizarGraficoPizza(canvasEl, stats, modo = 'jogos', hoverIndex = -1) {
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = 220;
        const height = 220;

        if (canvasEl.width !== width * dpr) {
            canvasEl.width = width * dpr;
            canvasEl.height = height * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = 90;
        const innerRadius = 55;

        const fonteDados = modo === 'jogos' ? stats.contagem : stats.horas;
        const valorTotal = modo === 'jogos' ? stats.totalJogos : stats.totalHoras;

        // Se estiver zerado, desenha um aro cyberpunk vazio elegante
        if (!valorTotal || valorTotal === 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
            ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fill();

            ctx.fillStyle = '#adb5bd';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Sem jogos', centerX, centerY - 6);
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText('na fila', centerX, centerY + 10);
            ctx.restore();
            return [];
        }

        let startAngle = -Math.PI / 2;
        const segmentosCalculados = [];

        CATEGORIAS_BACKLOG.forEach((cat, index) => {
            const val = fonteDados[cat.id] || 0;
            if (val <= 0) return;

            const sliceAngle = (val / valorTotal) * (Math.PI * 2);
            const endAngle = startAngle + sliceAngle;
            const isHovered = hoverIndex === index;

            // Se hover ativo, desloca a fatia levemente para fora
            let offsetR = 0;
            let drawCenterX = centerX;
            let drawCenterY = centerY;

            if (isHovered) {
                offsetR = 8;
                const midAngle = startAngle + sliceAngle / 2;
                drawCenterX += Math.cos(midAngle) * offsetR;
                drawCenterY += Math.sin(midAngle) * offsetR;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(drawCenterX, drawCenterY, outerRadius, startAngle, endAngle);
            ctx.arc(drawCenterX, drawCenterY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            // Glow Neon
            if (isHovered) {
                ctx.shadowColor = cat.color;
                ctx.shadowBlur = 18;
            } else {
                ctx.shadowColor = cat.color;
                ctx.shadowBlur = 6;
            }

            ctx.fillStyle = cat.color;
            ctx.fill();

            // Borda de separação suave
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#07090f';
            ctx.stroke();
            ctx.restore();

            segmentosCalculados.push({
                index,
                cat,
                val,
                startAngle,
                endAngle,
                porcentagem: ((val / valorTotal) * 100).toFixed(1)
            });

            startAngle = endAngle;
        });

        // Núcleo Central (Texto Informativo)
        ctx.fillStyle = '#f8f9fa';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (modo === 'jogos') {
            ctx.fillText(`${stats.totalJogos}`, centerX, centerY - 8);
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText('JOGOS TOTAIS', centerX, centerY + 10);
        } else {
            ctx.fillText(`${stats.totalHoras}h`, centerX, centerY - 8);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText('HORAS TOTAIS', centerX, centerY + 10);
        }

        ctx.restore();
        return segmentosCalculados;
    }

    /* ══════════════════════════════════════════════════════════════════════════
       8. MODAL DO ORGANIZADOR DE BACKLOG ("MINHA FILA DE JOGOS")
    ══════════════════════════════════════════════════════════════════════════ */
    let _backlogState = {
        usuario: '',
        modoChart: 'jogos', // 'jogos' ou 'horas'
        filtroAtivo: 'todos',
        hoverSliceIndex: -1,
        segmentosAtuais: []
    };

    function garantirModalBacklog() {
        injetarEstilosBacklogOracle();
        let overlay = document.getElementById('ogBacklogModalOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogBacklogModalOverlay';
        overlay.className = 'og-bo-overlay';
        overlay.innerHTML = `
            <div class="og-bo-modal" id="ogBacklogModalCard">
                <div class="og-bo-header">
                    <div class="og-bo-title-wrap">
                        <div class="og-bo-badge-icon">⏳</div>
                        <div>
                            <div class="og-bo-title">Minha Fila de Jogos & Backlog</div>
                            <div class="og-bo-subtitle">Organizador Gamer de Utilidade Diária • OVERCRITIC</div>
                        </div>
                    </div>
                    <button type="button" class="og-bo-close" id="ogBacklogCloseBtn" title="Fechar (Esc)">✕</button>
                </div>

                <div class="og-bo-body">
                    <!-- Card do Gráfico de Pizza -->
                    <div class="og-chart-container-card">
                        <div class="og-chart-top-bar">
                            <div class="og-chart-title">
                                <span>📊</span> Distribuição & Tempo da sua Vida Gamer
                            </div>
                            <div class="og-chart-toggle-group">
                                <button type="button" class="og-chart-toggle-btn active" id="ogToggleChartJogos">🎮 Por Quantidade</button>
                                <button type="button" class="og-chart-toggle-btn" id="ogToggleChartHoras">⏱️ Por Tempo (Horas)</button>
                            </div>
                        </div>

                        <div class="og-chart-grid-layout">
                            <div class="og-canvas-wrap">
                                <canvas class="og-pie-canvas" id="ogBacklogPieCanvas"></canvas>
                                <div class="og-chart-tooltip" id="ogBacklogTooltip"></div>
                            </div>

                            <div class="og-chart-legend" id="ogBacklogLegendArea">
                                <!-- Preenchido dinamicamente -->
                            </div>
                        </div>
                    </div>

                    <!-- Barra de Ferramentas / Filtros -->
                    <div class="og-backlog-toolbar">
                        <div class="og-backlog-filter-pills" id="ogBacklogFilters">
                            <button type="button" class="og-b-filter-btn active" data-filter="todos">Todos (<span id="ogCountFilterTodos">0</span>)</button>
                            <button type="button" class="og-b-filter-btn" data-filter="jogando">🎮 Jogando (<span id="ogCountFilterJogando">0</span>)</button>
                            <button type="button" class="og-b-filter-btn" data-filter="zerados">✅ Zerados (<span id="ogCountFilterZerados">0</span>)</button>
                            <button type="button" class="og-b-filter-btn" data-filter="platinados">🏆 Platinados (<span id="ogCountFilterPlatinados">0</span>)</button>
                            <button type="button" class="og-b-filter-btn" data-filter="pausados">⏸️ Pausados (<span id="ogCountFilterPausados">0</span>)</button>
                            <button type="button" class="og-b-filter-btn" data-filter="backlog">⏳ Fila da Vergonha (<span id="ogCountFilterBacklog">0</span>)</button>
                        </div>

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button type="button" class="og-btn-add-game" id="ogBtnOpenAddGame">
                                <span>➕</span> Adicionar Jogo
                            </button>
                            <button type="button" class="og-btn-add-game" id="ogBtnOraculoFromBacklog" style="background: linear-gradient(135deg, #ff007f, #9d4edd); color:#fff;" title="Sortear o que jogar hoje">
                                <span>🔮</span> Oráculo
                            </button>
                            <button type="button" class="og-btn-add-game" id="ogBtnLimparFila" onclick="window.OvercriticBacklog.limparFila();" style="background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.4); color: #ef4444;" title="Remover todos os jogos da fila">
                                <span>🗑️</span> Limpar Fila
                            </button>
                        </div>
                    </div>

                    <!-- Formulário Rápido de Adição (Oculto por padrão) -->
                    <div id="ogAddGameFormBox" style="display:none; background: rgba(0,240,255,0.04); border: 1px solid rgba(0,240,255,0.25); border-radius: 14px; padding: 14px 18px; margin-bottom: 6px;">
                        <div style="font-size:0.88rem; font-weight:800; color:#00f0ff; margin-bottom: 10px;">➕ Adicionar Jogo à sua Fila</div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                            <div>
                                <label style="font-size:0.74rem; color:#adb5bd; display:block; margin-bottom:4px;">Título do Jogo</label>
                                <input type="text" id="ogInputTitulo" placeholder="Ex: Elden Ring" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.84rem;">
                            </div>
                            <div>
                                <label style="font-size:0.74rem; color:#adb5bd; display:block; margin-bottom:4px;">Categoria Inicial</label>
                                <select id="ogSelectCategoria" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; background:#0d121e; border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.84rem;">
                                    <option value="jogando">🎮 Jogando Agora</option>
                                    <option value="backlog" selected>⏳ Fila da Vergonha (Backlog)</option>
                                    <option value="zerados">✅ Zerados</option>
                                    <option value="platinados">🏆 Platinados</option>
                                    <option value="pausados">⏸️ Pausados</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.74rem; color:#adb5bd; display:block; margin-bottom:4px;">Horas Estimadas/Jogadas</label>
                                <input type="number" id="ogInputHoras" value="20" min="0" max="999" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.84rem;">
                            </div>
                            <div>
                                <label style="font-size:0.74rem; color:#adb5bd; display:block; margin-bottom:4px;">Plataforma</label>
                                <select id="ogSelectPlataforma" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; background:#0d121e; border:1px solid rgba(255,255,255,0.15); color:#fff; font-size:0.84rem;">
                                    <option value="PC">PC (Steam / Epic)</option>
                                    <option value="PS5">PlayStation 5</option>
                                    <option value="PS4">PlayStation 4</option>
                                    <option value="Xbox Series">Xbox Series X|S</option>
                                    <option value="Switch">Nintendo Switch</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
                            <button type="button" id="ogBtnCancelAddGame" style="background:rgba(255,255,255,0.08); border:none; color:#adb5bd; padding:7px 14px; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer;">Cancelar</button>
                            <button type="button" id="ogBtnConfirmAddGame" style="background:#00f0ff; border:none; color:#07090f; padding:7px 18px; border-radius:8px; font-size:0.78rem; font-weight:800; cursor:pointer;">Salvar na Fila</button>
                        </div>
                    </div>

                    <!-- Grid de Jogos -->
                    <div class="og-backlog-grid" id="ogBacklogGridArea">
                        <!-- Renderizado via JS -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Listeners de fechamento
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModalFilaDeJogos();
        });
        document.getElementById('ogBacklogCloseBtn').addEventListener('click', fecharModalFilaDeJogos);

        // Toggle Jogos vs Horas
        const btnJogos = document.getElementById('ogToggleChartJogos');
        const btnHoras = document.getElementById('ogToggleChartHoras');
        btnJogos.addEventListener('click', () => {
            btnJogos.classList.add('active');
            btnHoras.classList.remove('active');
            _backlogState.modoChart = 'jogos';
            atualizarGraficoBacklog();
        });
        btnHoras.addEventListener('click', () => {
            btnHoras.classList.add('active');
            btnJogos.classList.remove('active');
            _backlogState.modoChart = 'horas';
            atualizarGraficoBacklog();
        });

        // Filtros de Categoria
        const filterBtns = overlay.querySelectorAll('.og-b-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                _backlogState.filtroAtivo = btn.dataset.filter;
                renderizarCardsBacklog();
            });
        });

        // Formulário de Adicionar Jogo
        const btnOpenAdd = document.getElementById('ogBtnOpenAddGame');
        const formBox = document.getElementById('ogAddGameFormBox');
        const btnCancelAdd = document.getElementById('ogBtnCancelAddGame');
        const btnConfirmAdd = document.getElementById('ogBtnConfirmAddGame');

        btnOpenAdd.addEventListener('click', () => {
            formBox.style.display = formBox.style.display === 'none' ? 'block' : 'none';
            if (formBox.style.display === 'block') {
                document.getElementById('ogInputTitulo').focus();
            }
        });
        btnCancelAdd.addEventListener('click', () => {
            formBox.style.display = 'none';
        });
        btnConfirmAdd.addEventListener('click', salvarNovoJogoManual);

        // Botão para abrir o Oráculo
        document.getElementById('ogBtnOraculoFromBacklog').addEventListener('click', () => {
            fecharModalFilaDeJogos();
            abrirOraculoGamer();
        });

        // Interação com o Canvas do Gráfico (Hover & Tooltip)
        const canvas = document.getElementById('ogBacklogPieCanvas');
        const tooltip = document.getElementById('ogBacklogTooltip');

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const dist = Math.sqrt(x * x + y * y);

            if (dist >= 50 && dist <= 100) {
                let angle = Math.atan2(y, x);
                if (angle < -Math.PI / 2) angle += Math.PI * 2;

                const seg = _backlogState.segmentosAtuais.find(s => angle >= s.startAngle && angle < s.endAngle);
                if (seg) {
                    _backlogState.hoverSliceIndex = seg.index;
                    canvas.style.cursor = 'pointer';
                    tooltip.innerHTML = `<strong>${seg.cat.emoji} ${seg.cat.label}</strong><br>${_backlogState.modoChart === 'jogos' ? `${seg.val} jogo(s)` : `${seg.val} hora(s)`} (${seg.porcentagem}%)`;
                    tooltip.style.left = `${e.clientX - rect.left + 10}px`;
                    tooltip.style.top = `${e.clientY - rect.top - 30}px`;
                    tooltip.classList.add('visible');
                    atualizarGraficoBacklog();
                    return;
                }
            }

            _backlogState.hoverSliceIndex = -1;
            canvas.style.cursor = 'default';
            tooltip.classList.remove('visible');
            atualizarGraficoBacklog();
        });

        canvas.addEventListener('mouseleave', () => {
            _backlogState.hoverSliceIndex = -1;
            tooltip.classList.remove('visible');
            atualizarGraficoBacklog();
        });

        return overlay;
    }

    function abrirModalFilaDeJogos(targetUsername) {
        garantirModalBacklog();
        const username = targetUsername || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        _backlogState.usuario = username;

        const overlay = document.getElementById('ogBacklogModalOverlay');
        overlay.classList.add('active');

        if (typeof window.bloquearScrollFundo === 'function') {
            window.bloquearScrollFundo();
        } else {
            document.documentElement.classList.add('og-modal-scroll-lock');
            document.body.classList.add('og-modal-scroll-lock');
        }

        atualizarGraficoBacklog();
        renderizarCardsBacklog();
    }

    function fecharModalFilaDeJogos() {
        const overlay = document.getElementById('ogBacklogModalOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            if (typeof window.liberarScrollFundo === 'function') {
                window.liberarScrollFundo();
            } else {
                document.documentElement.classList.remove('og-modal-scroll-lock');
                document.body.classList.remove('og-modal-scroll-lock');
            }
            sincronizarAtualizacaoBacklogEmTodaInterface(_backlogState.usuario);
        }
    }

    function atualizarGraficoBacklog() {
        const stats = obterEstatisticasBacklog(_backlogState.usuario);
        const canvas = document.getElementById('ogBacklogPieCanvas');
        if (!canvas) return;

        _backlogState.segmentosAtuais = renderizarGraficoPizza(canvas, stats, _backlogState.modoChart, _backlogState.hoverSliceIndex);

        // Atualiza a legenda interativa
        const legendArea = document.getElementById('ogBacklogLegendArea');
        if (legendArea) {
            legendArea.innerHTML = CATEGORIAS_BACKLOG.map(cat => {
                const count = stats.contagem[cat.id] || 0;
                const hours = stats.horas[cat.id] || 0;
                const displayVal = _backlogState.modoChart === 'jogos' ? `${count} jogos` : `${hours}h`;

                return `
                    <div class="og-legend-pill" data-cat="${cat.id}" style="color:${cat.color};">
                        <div class="og-legend-left">
                            <span class="og-legend-dot" style="background:${cat.color}; box-shadow:0 0 8px ${cat.color};"></span>
                            <span class="og-legend-name">${cat.emoji} ${cat.label}</span>
                        </div>
                        <span class="og-legend-val">${displayVal}</span>
                    </div>
                `;
            }).join('');

            // Clique na legenda filtra a lista
            legendArea.querySelectorAll('.og-legend-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    const catId = pill.dataset.cat;
                    _backlogState.filtroAtivo = catId;
                    const btns = document.querySelectorAll('.og-b-filter-btn');
                    btns.forEach(b => {
                        b.classList.toggle('active', b.dataset.filter === catId);
                    });
                    renderizarCardsBacklog();
                });
            });
        }

        // Atualiza contadores dos filtros
        const elTodos = document.getElementById('ogCountFilterTodos');
        if (elTodos) elTodos.textContent = stats.totalJogos;
        CATEGORIAS_BACKLOG.forEach(c => {
            const el = document.getElementById(`ogCountFilter${c.id.charAt(0).toUpperCase() + c.id.slice(1)}`);
            if (el) el.textContent = stats.contagem[c.id] || 0;
        });
    }

    function renderizarCardsBacklog() {
        const grid = document.getElementById('ogBacklogGridArea');
        if (!grid) return;

        const lista = obterFilaUsuario(_backlogState.usuario);
        let filtrados = lista;

        if (_backlogState.filtroAtivo !== 'todos') {
            filtrados = lista.filter(item => item.categoria === _backlogState.filtroAtivo);
        }

        if (filtrados.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted, #adb5bd);">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;">🎮</div>
                    <div style="font-size: 1rem; font-weight: 700;">Nenhum jogo nesta categoria no momento.</div>
                    <div style="font-size: 0.8rem; margin-top: 4px;">Clique em "+ Adicionar Jogo" para organizar sua fila ou sorteie um pelo Oráculo!</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtrados.map(item => {
            const cat = MAPA_CATEGORIAS[item.categoria] || MAPA_CATEGORIAS.backlog;
            const capa = item.capa || resolverCapaJogoPadrao(item.titulo);

            return `
                <div class="og-backlog-card" data-id="${item.id}">
                    <div class="og-backlog-cover-wrap">
                        <img class="og-backlog-cover" src="${capa}" alt="${item.titulo}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'">
                        <div class="og-backlog-status-badge" style="background:${cat.glow}; border: 1px solid ${cat.color};">
                            ${cat.emoji} ${cat.label}
                        </div>
                        <div class="og-backlog-hours-badge">
                            ⏱️ ${item.horas || 0}h
                        </div>
                    </div>
                    <div class="og-backlog-card-body">
                        <div class="og-backlog-card-title" title="${item.titulo}">${item.titulo}</div>
                        <div class="og-backlog-card-meta">
                            <span>🎮 ${item.plataforma || 'PC'}</span>
                            <button type="button" class="og-btn-remove-item" onclick="window.OvercriticBacklog.removerJogo('${item.id}')" style="background:none; border:none; color:#ef4444; font-size:0.75rem; cursor:pointer;" title="Remover da fila">🗑️</button>
                        </div>
                        <div class="og-backlog-status-actions">
                            ${CATEGORIAS_BACKLOG.map(c => `
                                <button type="button" class="og-chip-action ${c.id === item.categoria ? 'current' : ''}" onclick="window.OvercriticBacklog.alterarStatus('${item.id}', '${c.id}')" title="Mudar para ${c.label}">
                                    ${c.emoji} ${c.label.split(' ')[0]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function resolverCapaJogoPadrao(titulo) {
        if (!titulo) return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80';
        const match = ACERVO_ORACULO.find(g => g.title.toLowerCase() === titulo.toLowerCase());
        if (match && match.thumb) return match.thumb;
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80';
    }

    /* ══════════════════════════════════════════════════════════════════════════
       SINCRONIZAÇÃO EM TEMPO REAL COM A ABA DO PERFIL & CONTADORES
    ══════════════════════════════════════════════════════════════════════════ */
    function sincronizarAtualizacaoBacklogEmTodaInterface(usuarioAlvo) {
        const usuario = (usuarioAlvo || _backlogState.usuario || localStorage.getItem('overcritic_currentUser') || 'Jogador').trim();
        const stats = obterEstatisticasBacklog(usuario);

        // 1. Atualiza na página do perfil principal (conta_login.html?tab=perfil)
        const elProfCount = document.getElementById('profBacklogCount');
        if (elProfCount) {
            elProfCount.textContent = stats.totalJogos;
            elProfCount.style.transform = 'scale(1.25)';
            elProfCount.style.transition = 'transform 0.2s ease';
            setTimeout(() => { if (elProfCount) elProfCount.style.transform = 'scale(1)'; }, 200);
        }

        // 2. Atualiza no modal do Gamer Profile (se existir / estiver aberto)
        const elGpTabCount = document.getElementById('gpCountTabBacklog');
        if (elGpTabCount) {
            elGpTabCount.textContent = stats.totalJogos;
        }

        // 3. Se a aba de backlog do Perfil Gamer estiver visível no momento, re-renderiza na hora
        if (typeof window.renderizarAbaAtualGamerProfile === 'function') {
            try {
                window.renderizarAbaAtualGamerProfile('backlog');
            } catch (e) {}
        }

        // 4. Se a janela de perfil gamer tiver contadores gerais na aba de visão geral
        if (window._dadosUsuarioAtual && (window._dadosUsuarioAtual.username || '').toLowerCase() === usuario.toLowerCase()) {
            const elProfBacklogMini = document.getElementById('gpCountBacklogMini');
            if (elProfBacklogMini) elProfBacklogMini.textContent = stats.totalJogos;
        }

        // 5. Emite evento CustomEvent global para qualquer componente ou página escutar
        try {
            window.dispatchEvent(new CustomEvent('overcritic_backlog_updated', {
                detail: {
                    usuario: usuario,
                    total: stats.totalJogos,
                    stats: stats
                }
            }));
        } catch (e) {}
    }

    function salvarNovoJogoManual() {
        const tituloInput = document.getElementById('ogInputTitulo');
        const catSelect = document.getElementById('ogSelectCategoria');
        const horasInput = document.getElementById('ogInputHoras');
        const platSelect = document.getElementById('ogSelectPlataforma');

        const titulo = (tituloInput.value || '').trim();
        if (!titulo) {
            if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
                window.OvercriticNotificacoes.exibir('⚠️ Por favor, informe o título do jogo!', 'aviso');
            } else {
                alert('Por favor, informe o título do jogo!');
            }
            return;
        }

        const novoJogo = {
            id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            user: _backlogState.usuario,
            titulo: titulo,
            categoria: catSelect.value,
            horas: Number(horasInput.value) || 10,
            plataforma: platSelect.value,
            capa: resolverCapaJogoPadrao(titulo),
            atualizadoEm: new Date().toISOString()
        };

        const lista = obterFilaUsuario(_backlogState.usuario);
        lista.unshift(novoJogo);
        salvarFilaUsuario(_backlogState.usuario, lista);

        emitirSomCyber('status_change');
        tituloInput.value = '';
        document.getElementById('ogAddGameFormBox').style.display = 'none';

        atualizarGraficoBacklog();
        renderizarCardsBacklog();
        sincronizarAtualizacaoBacklogEmTodaInterface(_backlogState.usuario);
    }

    function alterarStatusJogo(jogoId, novoStatus) {
        const usuario = _backlogState.usuario || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const lista = obterFilaUsuario(usuario);
        const item = lista.find(j => String(j.id) === String(jogoId));
        if (item) {
            item.categoria = novoStatus;
            item.atualizadoEm = new Date().toISOString();
            salvarFilaUsuario(usuario, lista);
            emitirSomCyber('status_change');
            atualizarGraficoBacklog();
            renderizarCardsBacklog();
            sincronizarAtualizacaoBacklogEmTodaInterface(usuario);
        }
    }

    function removerJogo(jogoId) {
        const usuario = _backlogState.usuario || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        let lista = obterFilaUsuario(usuario);
        const itemRemovido = lista.find(j => String(j.id) === String(jogoId));
        lista = lista.filter(j => String(j.id) !== String(jogoId));
        salvarFilaUsuario(usuario, lista);

        if (window.OvercriticAudio) {
            window.OvercriticAudio.play('pop');
        }

        if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
            const titulo = itemRemovido ? `"${itemRemovido.titulo}"` : 'Jogo';
            window.OvercriticNotificacoes.exibir(`🗑️ ${titulo} removido da sua fila.`, 'info');
        }

        atualizarGraficoBacklog();
        renderizarCardsBacklog();

        // Sincroniza instantaneamente na aba de backlog do perfil e no contador "NA FILA ⏳"
        sincronizarAtualizacaoBacklogEmTodaInterface(usuario);
    }

    /* ══════════════════════════════════════════════════════════════════════════
       MODAL DE CONFIRMAÇÃO IN-APP CYBERPUNK (LIMPAR FILA)
    ══════════════════════════════════════════════════════════════════════════ */
    function garantirModalConfirmacaoLimparFila() {
        injetarEstilosBacklogOracle();
        let overlay = document.getElementById('ogConfirmLimparFilaOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogConfirmLimparFilaOverlay';
        overlay.className = 'og-cyber-confirm-overlay';
        overlay.innerHTML = `
            <div class="og-cyber-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="ogConfirmLimparTitle">
                <div class="og-cyber-confirm-icon-wrap">
                    <span class="og-cyber-confirm-icon">🗑️</span>
                    <div class="og-cyber-confirm-icon-glow"></div>
                </div>
                <h3 class="og-cyber-confirm-title" id="ogConfirmLimparTitle">Limpar Fila de Jogos?</h3>
                <p class="og-cyber-confirm-desc">
                    Deseja realmente remover todos os jogos da sua fila de backlog?
                    <br>
                    <span style="color: #ef4444; font-size: 0.82rem; font-weight: 600; display: block; margin-top: 6px;">⚠️ Esta ação é irreversível e zerará sua fila e estatísticas.</span>
                </p>
                <div class="og-cyber-confirm-actions">
                    <button type="button" class="og-cyber-confirm-btn-cancel" id="ogBtnConfirmLimparCancelar">
                        Cancelar
                    </button>
                    <button type="button" class="og-cyber-confirm-btn-danger" id="ogBtnConfirmLimparExecutar">
                        <span>🗑️</span> Sim, Limpar Tudo
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const btnCancel = overlay.querySelector('#ogBtnConfirmLimparCancelar');
        const btnConfirm = overlay.querySelector('#ogBtnConfirmLimparExecutar');

        const fechar = () => {
            overlay.classList.remove('active');
            if (window.OvercriticAudio) window.OvercriticAudio.play('click');
        };

        btnCancel.addEventListener('click', fechar);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                fechar();
            }
        });

        btnConfirm.addEventListener('click', () => {
            overlay.classList.remove('active');
            executarLimpezaRealFila();
        });

        return overlay;
    }

    function abrirModalConfirmacaoLimparFila() {
        const overlay = garantirModalConfirmacaoLimparFila();
        if (window.OvercriticAudio) {
            window.OvercriticAudio.play('pop');
        }
        overlay.classList.add('active');
    }

    function limparTodaFila() {
        const usuario = _backlogState.usuario || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const listaAtual = obterFilaUsuario(usuario);
        if (!listaAtual || listaAtual.length === 0) {
            if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
                window.OvercriticNotificacoes.exibir('Sua fila de jogos já está vazia!', 'info');
            }
            return;
        }

        abrirModalConfirmacaoLimparFila();
    }

    function executarLimpezaRealFila() {
        const usuario = _backlogState.usuario || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        salvarFilaUsuario(usuario, []);

        if (window.OvercriticAudio) {
            window.OvercriticAudio.play('pop');
        }

        if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
            window.OvercriticNotificacoes.exibir('🗑️ Todos os jogos foram removidos da sua fila.', 'aviso');
        }

        atualizarGraficoBacklog();
        renderizarCardsBacklog();

        sincronizarAtualizacaoBacklogEmTodaInterface(usuario);
    }

    /* ══════════════════════════════════════════════════════════════════════════
       9. ENGINE DO "ORÁCULO GAMER" (ROLETA CIBERNÉTICA "O QUE EU JOGO HOJE?")
    ══════════════════════════════════════════════════════════════════════════ */
    let _oracleState = {
        tempo: 'todos',     // 'todos' | 'quick' (< 2h) | 'medium' (2-6h) | 'epic' (+20h)
        genero: 'todos',    // 'todos' | 'rpg' | 'metroidvania' | 'openworld' | 'horror' | 'fps' | 'soulslike' | 'platform'
        vibe: 'todos',      // 'todos' | 'emocionante' | 'desafio' | 'relaxar' | 'adrenalina' | 'exploracao'
        origem: 'todos',    // 'todos' | 'backlog' | 'acervo'
        isSpinning: false,
        currentRotation: 0,
        targetRotation: 0,
        candidateGames: [],
        winningGame: null
    };

    function garantirModalOraculo() {
        injetarEstilosBacklogOracle();
        let overlay = document.getElementById('ogOracleModalOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogOracleModalOverlay';
        overlay.className = 'og-bo-overlay';
        overlay.innerHTML = `
            <div class="og-bo-modal" id="ogOracleModalCard" style="max-width: 860px;">
                <div class="og-bo-header">
                    <div class="og-bo-title-wrap">
                        <div class="og-bo-badge-icon" style="background:rgba(255,0,127,0.15); border-color:#ff007f; color:#ff007f; box-shadow:0 0 15px rgba(255,0,127,0.3);">🔮</div>
                        <div>
                            <div class="og-bo-title">Oráculo Gamer • "O que eu jogo hoje?"</div>
                            <div class="og-bo-subtitle">Roleta Cibernética Inteligente • Decisão Rápida para Gamers com Pouco Tempo</div>
                        </div>
                    </div>
                    <button type="button" class="og-bo-close" id="ogOracleCloseBtn" title="Fechar (Esc)">✕</button>
                </div>

                <div class="og-bo-body">
                    <!-- Caixa de Filtros Rápidos -->
                    <div class="og-oracle-filters-box">
                        <!-- Filtro: Tempo Disponível -->
                        <div class="og-filter-row">
                            <span class="og-filter-label">⏱️ Tempo Livre:</span>
                            <div class="og-filter-options" id="ogFilterTempo">
                                <button type="button" class="og-chip-filter active" data-val="todos">Qualquer Tempo</button>
                                <button type="button" class="og-chip-filter" data-val="quick">⚡ Rápido (&lt; 2h)</button>
                                <button type="button" class="og-chip-filter" data-val="medium">🎯 Médio (2h - 6h)</button>
                                <button type="button" class="og-chip-filter" data-val="epic">🌌 Maratona (+20h)</button>
                            </div>
                        </div>

                        <!-- Filtro: Gênero -->
                        <div class="og-filter-row">
                            <span class="og-filter-label">🎮 Gênero / Estilo:</span>
                            <div class="og-filter-options" id="ogFilterGenero">
                                <button type="button" class="og-chip-filter active" data-val="todos">Qualquer Gênero</button>
                                <button type="button" class="og-chip-filter" data-val="rpg">RPG de Ação</button>
                                <button type="button" class="og-chip-filter" data-val="metroidvania">Metroidvania</button>
                                <button type="button" class="og-chip-filter" data-val="openworld">Mundo Aberto</button>
                                <button type="button" class="og-chip-filter" data-val="horror">Terror / Sobrevivência</button>
                                <button type="button" class="og-chip-filter" data-val="fps">FPS & Tiro</button>
                                <button type="button" class="og-chip-filter" data-val="soulslike">Soulslike</button>
                                <button type="button" class="og-chip-filter" data-val="platform">Plataforma</button>
                            </div>
                        </div>

                        <!-- Filtro: Vibe / Humor Gamer -->
                        <div class="og-filter-row">
                            <span class="og-filter-label">✨ Vibe Gamer:</span>
                            <div class="og-filter-options" id="ogFilterVibe">
                                <button type="button" class="og-chip-filter active" data-val="todos">Qualquer Vibe</button>
                                <button type="button" class="og-chip-filter" data-val="emocionante">❤️ História Emocionante</button>
                                <button type="button" class="og-chip-filter" data-val="desafio">⚔️ Desafio Extremo</button>
                                <button type="button" class="og-chip-filter" data-val="relaxar">☕ Relaxar & Desestressar</button>
                                <button type="button" class="og-chip-filter" data-val="adrenalina">🔥 Adrenalina Pura</button>
                                <button type="button" class="og-chip-filter" data-val="exploracao">🪐 Mistério & Exploração</button>
                            </div>
                        </div>

                        <!-- Filtro: Fonte dos Jogos -->
                        <div class="og-filter-row" style="padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06);">
                            <span class="og-filter-label">🎲 Origem:</span>
                            <div class="og-filter-options" id="ogFilterOrigem">
                                <button type="button" class="og-chip-filter active" data-val="todos">Acervo + Minha Fila</button>
                                <button type="button" class="og-chip-filter" data-val="backlog">⏳ Só Minha Fila da Vergonha</button>
                                <button type="button" class="og-chip-filter" data-val="acervo">🏆 Só Acervo Metacritic (85+)</button>
                            </div>
                        </div>
                    </div>

                    <!-- Palco da Roleta -->
                    <div class="og-oracle-wrap">
                        <div class="og-wheel-stage">
                            <div class="og-wheel-pointer"></div>
                            <canvas class="og-wheel-canvas" id="ogOracleCanvas" width="320" height="320"></canvas>
                            <div class="og-wheel-center-core" id="ogWheelCoreBtn" title="Girar a Roleta!">
                                🔮
                            </div>
                        </div>

                        <button type="button" class="og-btn-spin" id="ogBtnGirarRoleta">
                            <span>🎡</span> GIRAR O ORÁCULO
                        </button>
                    </div>

                    <!-- Card do Jogo Sorteado (Revelação) -->
                    <div class="og-oracle-result-card" id="ogOracleResultCard">
                        <div class="og-oracle-result-layout">
                            <img class="og-oracle-result-cover" id="ogResCover" src="" alt="Jogo Sorteado">
                            <div class="og-oracle-result-content">
                                <div class="og-oracle-result-header">
                                    <div class="og-oracle-result-title" id="ogResTitle">Título do Jogo</div>
                                    <div class="og-meta-badge-metacritic" id="ogResMetacritic">Metacritic 96</div>
                                </div>
                                <div class="og-oracle-result-meta-row">
                                    <span id="ogResGenre">🎮 RPG de Ação</span>
                                    <span>•</span>
                                    <span id="ogResHours">⏱️ ~45 horas</span>
                                    <span>•</span>
                                    <span id="ogResPlatforms">🖥️ PC, PS5</span>
                                </div>
                                <div class="og-oracle-result-synopsis" id="ogResSynopsis">
                                    Sinopse completa do jogo sorteado...
                                </div>
                                <div class="og-oracle-result-actions">
                                    <button type="button" class="og-btn-result-action og-btn-action-primary" id="ogBtnResJogandoAgora">
                                        <span>🎮</span> Colocar no 'Jogando Agora'!
                                    </button>
                                    <button type="button" class="og-btn-result-action og-btn-action-secondary" id="ogBtnResGuardarFila">
                                        <span>⏳</span> Guardar na Fila da Vergonha
                                    </button>
                                    <button type="button" class="og-btn-result-action og-btn-action-secondary" id="ogBtnResGirarNovamente">
                                        <span>🎡</span> Girar Novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Listeners de fechamento
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharOraculoGamer();
        });
        document.getElementById('ogOracleCloseBtn').addEventListener('click', fecharOraculoGamer);

        // Listeners dos Filtros Rápidos
        vincularFiltrosRoleta(overlay);

        // Girar Roleta
        document.getElementById('ogBtnGirarRoleta').addEventListener('click', girarRoleta);
        document.getElementById('ogWheelCoreBtn').addEventListener('click', girarRoleta);
        document.getElementById('ogBtnResGirarNovamente').addEventListener('click', girarRoleta);

        // Ações do Resultado Sorteado
        document.getElementById('ogBtnResJogandoAgora').addEventListener('click', () => {
            if (!_oracleState.winningGame) return;
            adicionarJogoAoBacklogRapido(_oracleState.winningGame, 'jogando');
            emitirSomCyber('win');
            fecharOraculoGamer();
            abrirModalFilaDeJogos();
        });

        document.getElementById('ogBtnResGuardarFila').addEventListener('click', () => {
            if (!_oracleState.winningGame) return;
            adicionarJogoAoBacklogRapido(_oracleState.winningGame, 'backlog');
            emitirSomCyber('status_change');
            fecharOraculoGamer();
            abrirModalFilaDeJogos();
        });

        return overlay;
    }

    function vincularFiltrosRoleta(overlay) {
        ['Tempo', 'Genero', 'Vibe', 'Origem'].forEach(tipo => {
            const container = overlay.querySelector(`#ogFilter${tipo}`);
            if (!container) return;
            const buttons = container.querySelectorAll('.og-chip-filter');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    _oracleState[tipo.toLowerCase()] = btn.dataset.val;
                    atualizarCandidatosRoleta();
                });
            });
        });
    }

    function abrirOraculoGamer(filtrosIniciais = {}) {
        garantirModalOraculo();
        const overlay = document.getElementById('ogOracleModalOverlay');
        overlay.classList.add('active');

        if (typeof window.bloquearScrollFundo === 'function') {
            window.bloquearScrollFundo();
        } else {
            document.documentElement.classList.add('og-modal-scroll-lock');
            document.body.classList.add('og-modal-scroll-lock');
        }

        // Reseta resultado anterior
        document.getElementById('ogOracleResultCard').style.display = 'none';

        // Aplica filtros se passados
        if (filtrosIniciais.tempo) _oracleState.tempo = filtrosIniciais.tempo;
        if (filtrosIniciais.genero) _oracleState.genero = filtrosIniciais.genero;
        if (filtrosIniciais.vibe) _oracleState.vibe = filtrosIniciais.vibe;

        atualizarCandidatosRoleta();
    }

    function fecharOraculoGamer() {
        const overlay = document.getElementById('ogOracleModalOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            if (typeof window.liberarScrollFundo === 'function') {
                window.liberarScrollFundo();
            } else {
                document.documentElement.classList.remove('og-modal-scroll-lock');
                document.body.classList.remove('og-modal-scroll-lock');
            }
        }
    }

    function atualizarCandidatosRoleta() {
        let pool = [];

        // Origem 1: Backlog do Usuário
        const usuarioAtual = localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const listaBacklog = obterFilaUsuario(usuarioAtual);
        const backlogNaoZerados = listaBacklog.filter(j => j.categoria === 'backlog' || j.categoria === 'pausados');

        const backlogFormatado = backlogNaoZerados.map(j => ({
            title: j.titulo,
            metacritic: 90,
            scoreBadge: '⏳ Na Sua Fila',
            genre: j.genero || 'Jogo da sua Fila',
            genreKey: 'rpg',
            hours: j.horas || 20,
            timeCategory: (j.horas <= 3) ? 'quick' : ((j.horas <= 16) ? 'medium' : 'epic'),
            vibe: ['emocionante', 'desafio', 'adrenalina', 'relaxar'],
            platforms: [j.plataforma || 'PC'],
            thumb: j.capa || resolverCapaJogoPadrao(j.titulo),
            synopsis: `Jogo salvo na sua Fila de Jogos (${j.categoria === 'backlog' ? 'Fila da Vergonha' : 'Pausado'}). Aproveite o momento para finalmente jogá-lo!`
        }));

        if (_oracleState.origem === 'backlog') {
            pool = backlogFormatado;
        } else if (_oracleState.origem === 'acervo') {
            pool = [...ACERVO_ORACULO];
        } else {
            pool = [...ACERVO_ORACULO, ...backlogFormatado];
        }

        // Filtro: Tempo
        if (_oracleState.tempo !== 'todos') {
            pool = pool.filter(g => g.timeCategory === _oracleState.tempo);
        }

        // Filtro: Gênero
        if (_oracleState.genero !== 'todos') {
            pool = pool.filter(g => g.genreKey === _oracleState.genero || (g.genre || '').toLowerCase().includes(_oracleState.genero));
        }

        // Filtro: Vibe
        if (_oracleState.vibe !== 'todos') {
            pool = pool.filter(g => (g.vibe || []).includes(_oracleState.vibe));
        }

        // Se o filtro for muito restrito e zerar, usa o acervo geral como fallback inteligente
        if (pool.length === 0) {
            pool = ACERVO_ORACULO.slice(0, 8);
        }

        _oracleState.candidateGames = pool.slice(0, 12); // Máximo de 12 fatias na roleta para visual perfeito
        desenharRoleta(_oracleState.currentRotation);
    }

    function desenharRoleta(rotationRad = 0) {
        const canvas = document.getElementById('ogOracleCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 320;
        const height = 320;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 150;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRad);

        const games = _oracleState.candidateGames;
        const numSlices = games.length;
        const sliceAngle = (Math.PI * 2) / numSlices;

        const coresCyber = [
            '#00f0ff', '#ff007f', '#9d4edd', '#ffd700',
            '#10b981', '#f59e0b', '#38bdf8', '#e11d48'
        ];

        games.forEach((game, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const cor = coresCyber[i % coresCyber.length];

            // Fatia
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = cor;
            ctx.globalAlpha = 0.85;
            ctx.fill();

            // Borda futurista
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#07090f';
            ctx.stroke();

            // Texto com o Título do Jogo
            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#07090f';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = 4;

            const maxLen = 16;
            const titleShort = game.title.length > maxLen ? game.title.substring(0, maxLen) + '...' : game.title;
            ctx.fillText(titleShort, radius - 18, 4);
            ctx.restore();
        });

        // Aro externo iluminado
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.stroke();

        ctx.restore();
    }

    function girarRoleta() {
        if (_oracleState.isSpinning) return;
        if (!_oracleState.candidateGames.length) return;

        _oracleState.isSpinning = true;
        const btnSpin = document.getElementById('ogBtnGirarRoleta');
        if (btnSpin) btnSpin.disabled = true;

        document.getElementById('ogOracleResultCard').style.display = 'none';

        // Escolhe o vencedor aleatoriamente dentro dos candidatos filtrados
        const numSlices = _oracleState.candidateGames.length;
        const sliceAngle = (Math.PI * 2) / numSlices;
        const winningIndex = Math.floor(Math.random() * numSlices);
        const winningGame = _oracleState.candidateGames[winningIndex];
        _oracleState.winningGame = winningGame;

        // O ponteiro fica no topo (ângulo = -PI / 2).
        // Para a fatia winningIndex parar sob o ponteiro:
        // sliceCenter = winningIndex * sliceAngle + sliceAngle / 2
        // currentRotation + sliceCenter = -PI / 2 (mod 2PI)
        const voltasCompletas = (5 + Math.floor(Math.random() * 4)) * (Math.PI * 2);
        const targetAngle = -Math.PI / 2 - (winningIndex * sliceAngle + sliceAngle / 2);
        const startRotation = _oracleState.currentRotation % (Math.PI * 2);
        const finalRotation = startRotation + voltasCompletas + (targetAngle - startRotation);

        const duracao = 4200; // 4.2 segundos de rotação suave
        const startTime = performance.now();
        let lastTickSlice = -1;

        function animar(agora) {
            const decorrido = agora - startTime;
            const progresso = Math.min(decorrido / duracao, 1);

            // Easing Ease-Out Quintic super suave
            const ease = 1 - Math.pow(1 - progresso, 4);
            const rotation = startRotation + (finalRotation - startRotation) * ease;
            _oracleState.currentRotation = rotation;

            desenharRoleta(rotation);

            // Som de tick ao passar por cada fatia
            const currentSliceIndex = Math.floor(((-rotation - Math.PI / 2) % (Math.PI * 2) + (Math.PI * 2)) / sliceAngle) % numSlices;
            if (currentSliceIndex !== lastTickSlice) {
                lastTickSlice = currentSliceIndex;
                emitirSomCyber('tick', (1 - progresso) * 400);
            }

            if (progresso < 1) {
                requestAnimationFrame(animar);
            } else {
                _oracleState.isSpinning = false;
                if (btnSpin) btnSpin.disabled = false;
                emitirSomCyber('win');
                revelarResultadoOraculo(winningGame);
            }
        }

        requestAnimationFrame(animar);
    }

    function revelarResultadoOraculo(game) {
        const card = document.getElementById('ogOracleResultCard');
        if (!card || !game) return;

        document.getElementById('ogResCover').src = game.thumb || resolverCapaJogoPadrao(game.title);
        document.getElementById('ogResTitle').textContent = game.title;
        document.getElementById('ogResMetacritic').textContent = game.scoreBadge || `⭐ Metacritic ${game.metacritic || 90}`;
        document.getElementById('ogResGenre').textContent = `🎮 ${game.genre || 'Aventura'}`;
        document.getElementById('ogResHours').textContent = `⏱️ ~${game.hours || 15}h para zerar`;
        document.getElementById('ogResPlatforms').textContent = `🖥️ ${(game.platforms || ['PC']).join(', ')}`;
        document.getElementById('ogResSynopsis').textContent = game.synopsis || 'Uma obra-prima imperdível com aclamação da crítica mundial.';

        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function adicionarJogoAoBacklogRapido(game, categoria = 'jogando') {
        const usuario = localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const lista = obterFilaUsuario(usuario);

        const existente = lista.find(j => j.titulo.toLowerCase() === game.title.toLowerCase());
        if (existente) {
            existente.categoria = categoria;
            existente.atualizadoEm = new Date().toISOString();
        } else {
            lista.unshift({
                id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                user: usuario,
                titulo: game.title,
                categoria: categoria,
                horas: game.hours || 15,
                plataforma: (game.platforms && game.platforms[0]) || 'PC',
                capa: game.thumb || resolverCapaJogoPadrao(game.title),
                atualizadoEm: new Date().toISOString()
            });
        }

        salvarFilaUsuario(usuario, lista);
        if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
            window.OvercriticNotificacoes.exibir(`🎮 "${game.title}" adicionado a ${MAPA_CATEGORIAS[categoria].label}!`, 'sucesso');
        }

        sincronizarAtualizacaoBacklogEmTodaInterface(usuario);
    }

    /* ══════════════════════════════════════════════════════════════════════════
       10. EXPORTAÇÃO GLOBAL DE APIS E MÉTODOS
    ══════════════════════════════════════════════════════════════════════════ */
    window.OvercriticBacklog = {
        CATEGORIAS: CATEGORIAS_BACKLOG,
        MAPA_CATEGORIAS,
        obterFila: obterFilaUsuario,
        salvarFila: salvarFilaUsuario,
        obterEstatisticas: obterEstatisticasBacklog,
        renderizarGraficoPizza,
        abrirModal: abrirModalFilaDeJogos,
        fecharModal: fecharModalFilaDeJogos,
        alterarStatus: alterarStatusJogo,
        removerJogo: removerJogo,
        limparFila: limparTodaFila,
        adicionarJogoAoBacklogRapido,
        sincronizarInterface: sincronizarAtualizacaoBacklogEmTodaInterface,
        injetarEstilos: injetarEstilosBacklogOracle
    };

    window.OvercriticOracle = {
        ACERVO: ACERVO_ORACULO,
        abrir: abrirOraculoGamer,
        fechar: fecharOraculoGamer,
        girar: girarRoleta
    };

    window.abrirModalFilaDeJogos = abrirModalFilaDeJogos;
    window.fecharModalFilaDeJogos = fecharModalFilaDeJogos;
    window.abrirOraculoGamer = abrirOraculoGamer;
    window.fecharOraculoGamer = fecharOraculoGamer;
    window.adicionarJogoAoBacklogRapido = adicionarJogoAoBacklogRapido;
    window.limparTodaFilaBacklog = limparTodaFila;
    window.sincronizarBacklogEmTodaInterface = sincronizarAtualizacaoBacklogEmTodaInterface;

    // Injeta os estilos CSS do Backlog e Oráculo globalmente no carregamento do script
    try {
        injetarEstilosBacklogOracle();
    } catch(e) {}

    // Sincronização inicial automática da interface em 50ms
    setTimeout(() => {
        try {
            sincronizarAtualizacaoBacklogEmTodaInterface();
        } catch (e) {}
    }, 50);

    console.log('🎮 [Overcritic] Backlog Organizer & Oráculo Gamer carregados com sucesso!');
})();
