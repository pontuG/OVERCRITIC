/**
 * OVERCRITIC Gamification Engine & Social Suite v26.10.7
 * - Sistema de Níveis & XP Gamer (Level Engine)
 * - Gamer Card Holográfico Compartilhável (Exportação PNG via Canvas)
 * - Criador Interativo de Tier List (Desktop Drag&Drop + Mobile Touch)
 */

(function () {
    'use strict';

    /* ════════════════════════════════════════════════════════
       SEASON RESET: ZERAMENTO GERAL DE DADOS & NOVO COMEÇO
       (Preserva 100% contas, logins, avatares e preferências)
    ════════════════════════════════════════════════════════ */
    const SEASON_RESET_KEY = 'overcritic_season_reset_v26_10_7';
    function aplicarSeasonResetSeNecessario() {
        try {
            if (localStorage.getItem(SEASON_RESET_KEY) !== 'concluido') {
                const keysParaZerar = [
                    'overcritic_reviews',
                    'overcritic_jogos',
                    'overclock_jogos',
                    'OVERCRITIC_MIDIAS',
                    'overcritic_midias',
                    'overcritic_minhas_platinas',
                    'overcritic_platinas_feed',
                    'overcritic_platinas',
                    'overclock_platinas',
                    'platinasSalvas',
                    'overcritic_feed',
                    'overcritic_avaliacoes_rapidas',
                    'overcritic_deleted_records',
                    'overcritic_user_stats'
                ];
                keysParaZerar.forEach(k => {
                    localStorage.setItem(k, '[]');
                });
                localStorage.setItem(SEASON_RESET_KEY, 'concluido');
                console.info('🚀 [OVERCRITIC] Season Reset aplicado com sucesso! Todos os perfis reiniciados do Nv. 1 Recruta Gamer.');
            }
        } catch (e) {
            console.warn('[OVERCRITIC] Aviso ao aplicar Season Reset:', e);
        }
    }
    aplicarSeasonResetSeNecessario();

    /* ════════════════════════════════════════════════════════
       1. TABELA DE NÍVEIS & PROGRESSÃO DE XP
    ════════════════════════════════════════════════════════ */
    const NIVEIS_GAMER = [
        { nivel: 1, titulo: "Recruta Gamer", minXp: 0, maxXp: 499, icone: "🌱", cor: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
        { nivel: 2, titulo: "Aventureiro Geek", minXp: 500, maxXp: 1499, icone: "⚡", cor: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
        { nivel: 3, titulo: "Crítico de Bronze", minXp: 1500, maxXp: 3499, icone: "🥉", cor: "#cd7f32", bg: "rgba(205, 127, 50, 0.15)" },
        { nivel: 4, titulo: "Crítico de Prata", minXp: 3500, maxXp: 6999, icone: "🥈", cor: "#cbd5e1", bg: "rgba(203, 213, 225, 0.15)" },
        { nivel: 5, titulo: "Mestre dos Troféus", minXp: 7000, maxXp: 11999, icone: "🏆", cor: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)" },
        { nivel: 6, titulo: "Cineasta & Gamer Ouro", minXp: 12000, maxXp: 18999, icone: "🥇", cor: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
        { nivel: 7, titulo: "Veterano Overcritic", minXp: 19000, maxXp: 27999, icone: "🛡️", cor: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" },
        { nivel: 8, titulo: "Caçador Platina Lendário", minXp: 28000, maxXp: 37999, icone: "💎", cor: "#00f0ff", bg: "rgba(0, 240, 255, 0.15)" },
        { nivel: 9, titulo: "Grão-Mestre Geek", minXp: 38000, maxXp: 49999, icone: "👑", cor: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" },
        { nivel: 10, titulo: "Lenda do Overcritic", minXp: 50000, maxXp: 999999, icone: "🔥", cor: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }
    ];

    /**
     * Calcula o XP individual de uma platina com base na sua dificuldade:
     * - Fácil / Tranquila (1-3/10): 150 XP
     * - Moderada (4-6/10): 250 XP
     * - Difícil (7-8/10): 400 XP
     * - Lendária / Insana (9-10/10): 600 XP
     */
    function calcularXpPlatina(platina) {
        if (!platina) return 250;
        if (typeof platina === 'number') return 250;

        const cat = String(platina.difficultyCategory || '').toLowerCase();
        const diff = String(platina.difficulty || platina.dificuldade || '').toLowerCase();

        // Lendária (9-10/10, insana, extrema, hardcore)
        if (cat === 'lendaria' || diff.includes('lendár') || diff.includes('lendar') || diff.includes('insan') || diff.includes('10/10') || diff.includes('9/10')) {
            return 600;
        }

        // Difícil (7-8/10, soulslike, pesada)
        if (cat === 'dificil' || diff.includes('difícil') || diff.includes('dificil') || diff.includes('8/10') || diff.includes('7/10')) {
            return 400;
        }

        // Fácil (1-3/10, rápida, tranquila)
        if (cat === 'facil' || diff.includes('fácil') || diff.includes('facil') || diff.includes('tranquil') || diff.includes('1/10') || diff.includes('2/10') || diff.includes('3/10')) {
            return 150;
        }

        // Moderada (4-6/10) ou padrão
        return 250;
    }

    /**
     * Avalia a qualidade, profundidade e autenticidade da resenha de um jogo ou mídia,
     * aplicando 5 filtros heurísticos anti-spam / anti-asneiras:
     * 1. Bloqueia "Keyboard Smash" (repetição contínua de letras: aaaaaa, kkkkkk, zzzzzz).
     * 2. Bloqueia repetições em loop (asdasdasdasd, qwertyqwerty).
     * 3. Bloqueia palavras gigantes sem espaçamento (palavras > 25 chars).
     * 4. Bloqueia repetição da mesma palavra (ratio de vocabulário único < 45%).
     * 5. Bloqueia emaranhados sem vogais / fonética inválida (ratio de vogais fora de 22% a 75%).
     * 
     * Patamares:
     * - ⚡ Nota Rápida (sem texto ou texto curto/spam): 100 XP
     * - 📝 Resenha Opinativa (>= 80 chars autênticos): 150 XP (+50 XP bônus)
     * - 🌟 Crítica Overcritic Completa (>= 200 chars autênticos e ricos): 200 XP (+100 XP bônus)
     */
    /**
     * Dicionário Estruturado de Palavras-Chave de Análise & Universo Gamer / Audiovisual
     * Organizado em pilares de crítica fundamentada
     */
    const CRITERIOS_CRITICA = {
        jogabilidade: [
            'jogabilidade', 'gameplay', 'mecanica', 'mecanicas', 'combate', 'controle', 'controles',
            'movimentacao', 'movimentacoes', 'fisica', 'dificuldade', 'desafio', 'boss', 'bosses',
            'chefe', 'chefes', 'level design', 'fases', 'missao', 'missoes', 'quest', 'quests',
            'multiplayer', 'coop', 'campanha', 'exploracao', 'explorar', 'habilidade', 'habilidades',
            'skills', 'build', 'progressao', 'precisao', 'estrategia', 'armas', 'tiro', 'tiroteio'
        ],
        narrativa: [
            'historia', 'enredo', 'narrativa', 'roteiro', 'personagem', 'personagens', 'protagonista',
            'antagonista', 'vilao', 'viloes', 'dialogo', 'dialogos', 'lore', 'desfecho', 'final',
            'trama', 'reviravolta', 'plot', 'universo', 'mundo', 'profundidade', 'emocionante',
            'desenvolvimento', 'campanha'
        ],
        visual: [
            'grafico', 'graficos', 'visual', 'visuais', 'direcao de arte', 'arte', 'ambientacao',
            'iluminacao', 'texturas', 'textura', 'animacao', 'animacoes', 'cenario', 'cenarios',
            'fotografia', 'estetica', 'design'
        ],
        audio: [
            'trilha sonora', 'trilha', 'musica', 'musicas', 'audio', 'som', 'dublagem',
            'sonoplastia', 'soundtrack', 'ost', 'vozes', 'efeitos sonoros'
        ],
        tecnico: [
            'desempenho', 'performance', 'otimizacao', 'fps', 'taxa de quadros', 'bugs', 'bug',
            'glitches', 'glitch', 'fluidez', 'estabilidade', 'resolucao', 'loading', 'carregamento'
        ],
        experiencia: [
            'imersao', 'imersivo', 'imersiva', 'atmosfera', 'experiencia', 'diversao', 'divertido',
            'viciante', 'obra-prima', 'sensacional', 'espetacular', 'marcante', 'cativante',
            'frustrante', 'repetitivo', 'decepcionante', 'vale a pena', 'recomendo', 'recomenda'
        ],
        audiovisual: [
            'atuacao', 'atuacoes', 'elenco', 'diretor', 'direcao', 'cenas', 'cena', 'fotografia',
            'efeitos especiais', 'cgi', 'temporada', 'episodio', 'episodios', 'filme', 'serie'
        ]
    };

    /**
     * Detector de Palavras Ininteligíveis / Teclado Mash / Gibberish
     */
    function isPalavraGibberish(p) {
        if (!p || p.length < 5) return false;
        const pLower = p.toLowerCase();

        // 1. Letra 'ç' colada a outra consoante (impossível em português)
        if (/[bcdfghjklmnpqrstvwxyz]ç|ç[bcdfghjklmnpqrstvwxyz]/.test(pLower)) return true;

        // 2. Quatro ou mais consoantes consecutivas (exceto padrões válidos raros como 'nstr', 'ngth')
        if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(pLower)) {
            if (!/(nstr|rstr|lstr|mstr|ngth)/.test(pLower)) return true;
        }

        // 3. Padrões de mash de teclado e agrupamentos dissonantes (ex: hch, cj, vhf, açov, etc.)
        if (/(cj|hcç|hch|vh|hf|çv|ncv|lkch|hch|qz|zj|zx|q[b-df-hj-np-tv-z]|asdf|zxcv|hjkl)/.test(pLower)) {
            const excecoes = ['feedback', 'checkpoint', 'match', 'sketch', 'switch', 'witcher', 'block', 'black'];
            if (!excecoes.some(ex => pLower.includes(ex))) return true;
        }

        // 4. Quatro ou mais vogais consecutivas (ex: açeoif)
        if (/[aeiouáéíóúâêôãõ]{4,}/.test(pLower)) return true;

        // 5. Proporção anômala de vogais em palavras de 6+ letras
        const vogais = (pLower.match(/[aeiouáéíóúâêôãõ]/g) || []).length;
        const ratio = vogais / pLower.length;
        if (pLower.length >= 6 && (ratio < 0.18 || ratio > 0.78)) return true;

        return false;
    }

    /**
     * Avalia a qualidade de uma resenha para conceder bônus de XP com proteção anti-spam avançada:
     * 1. Bloqueia repetições consecutivas de caracteres e palavras (ex: aaaaa, etc etc etc, ata ata ata).
     * 2. Bloqueia sequências de teclado mash / gibberish (ex: hchalokch, açeoif, vianv).
     * 3. Exige vocabulário crítico autêntico (termos reais de análise gamer/audiovisual).
     * 
     * Patamares:
     * - ⚡ Nota Rápida (100 XP): Sem resenha, curta (< 75 caracteres) ou sem termos analíticos.
     * - 📝 Resenha Opinativa (150 XP -> +50 XP bônus): >= 75 chars, termos de análise e sem spam.
     * - 🌟 Crítica Completa (200 XP -> +100 XP bônus): >= 180 chars, múltiplos pilares críticos e profundidade.
     */
    function avaliarQualidadeReview(item) {
        if (!item) return { xp: 100, nivel: 'rapida', label: 'Nota Rápida', bonus: 0, icone: '⚡', cor: '#94a3b8', motivo: 'Escreva uma resenha autêntica para ganhar bônus de XP' };

        let texto = '';
        if (typeof item === 'string') {
            texto = item;
        } else if (typeof item === 'object') {
            texto = item.review || item.relato || item.notes || item.resenha || item.texto || item.comentario || '';
        }

        texto = String(texto || '').trim();
        const len = texto.length;

        if (len < 50) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#94a3b8',
                motivo: len === 0 ? 'Sem resenha escrita' : `Faltam ${Math.max(0, 75 - len)} caracteres e termos de análise para bônus`
            };
        }

        // Filtro 1: Bloqueia caracteres repetidos consecutivos (ex: aaaaa, fffff, kkkkkk)
        if (/(.)\1{4,}/i.test(texto)) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Caracteres repetitivos em sequência detectados (sem bônus de XP)'
            };
        }

        // Filtro 2: Bloqueia palavras repetidas consecutivas com espaçamento (ex: "etc etc etc", "ata ata ata", "la la la")
        if (/\b(\p{L}{2,})\b(?:\s+[.,/\\-]*\s*\b\1\b){2,}/iu.test(texto)) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Repetição excessiva de palavras idênticas (sem bônus de XP)'
            };
        }

        // Filtro 3: Bloqueia sequências ou frases repetidas em loop (ex: "muito bom muito bom muito bom")
        if (/\b(\p{L}+\s+\p{L}+)\b(?:\s+\1\b){1,}/iu.test(texto)) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Frases repetitivas em loop detectadas (sem bônus de XP)'
            };
        }

        // Extrai palavras individuais
        const palavras = texto.match(/[\p{L}0-9]+/giu) || [];

        // Filtro 4: Palavras gigantescas coladas sem espaço (mash de teclado)
        const temPalavraMonstro = palavras.some(p => p.length > 24);
        if (temPalavraMonstro) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Palavras excessivamente longas sem espaçamento (sem bônus de XP)'
            };
        }

        // Filtro 5: Detector de Palavras Gibberish / Mash aleatório
        const palavrasGibberish = palavras.filter(isPalavraGibberish);
        if (palavrasGibberish.length >= 1) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Palavras sem sentido ou sequências desconexas detectadas (sem bônus de XP)'
            };
        }

        if (palavras.length < 8) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#94a3b8',
                motivo: 'Poucas palavras identificadas para análise de mérito'
            };
        }

        // Filtro 6: Vocabulário único (evita Ctrl+V de palavras)
        const palavrasUnicas = new Set(palavras.map(p => p.toLowerCase()));
        const ratioUnicas = palavrasUnicas.size / palavras.length;
        if (ratioUnicas < 0.45 && palavras.length > 10) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: '⚠️ Baixa variedade de vocabulário detectada (sem bônus de XP)'
            };
        }

        // ══════════════════════════════════════════════
        // VERIFICAÇÃO DE PALAVRAS-CHAVE DE CRÍTICA REAL
        // ══════════════════════════════════════════════
        const textoNormalizado = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const categoriasPresentes = new Set();
        const palavrasChaveEncontradas = new Set();

        for (const [categoria, termos] of Object.entries(CRITERIOS_CRITICA)) {
            for (const termo of termos) {
                const termoNorm = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const regexTermo = new RegExp(`\\b${termoNorm}\\b`, 'i');
                if (regexTermo.test(textoNormalizado)) {
                    categoriasPresentes.add(categoria);
                    palavrasChaveEncontradas.add(termoNorm);
                }
            }
        }

        // Se tem comprimento mas nenhuma palavra-chave crítica foi identificada
        if (len >= 75 && palavrasChaveEncontradas.size === 0) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#94a3b8',
                motivo: '💡 Comente sobre aspectos do jogo (ex: jogabilidade, história, gráficos ou combate) para ativar o bônus de XP!'
            };
        }

        // 🌟 Nível 3: Crítica Overcritic Completa (200 XP -> +100 XP bônus)
        // Exige >= 180 caracteres, ao menos 18 palavras, 14 únicas, 3 termos analíticos e 2 pilares distintos
        if (len >= 180 && palavras.length >= 16 && palavrasUnicas.size >= 12 && palavrasChaveEncontradas.size >= 3 && categoriasPresentes.size >= 2) {
            return {
                xp: 200,
                nivel: 'completa',
                label: 'Crítica Completa',
                bonus: 100,
                icone: '🌟',
                cor: '#ffd700',
                motivo: '🌟 Análise aprofundada com múltiplos pilares críticos (+100 XP de Bônus Ativado!)'
            };
        }

        // 📝 Nível 2: Resenha Opinativa (150 XP -> +50 XP bônus)
        // Exige >= 75 caracteres, ao menos 10 palavras e 1 termo analítico
        if (len >= 75 && palavras.length >= 9 && palavrasUnicas.size >= 7 && palavrasChaveEncontradas.size >= 1) {
            const faltamChar = Math.max(0, 180 - len);
            const faltamCategorias = Math.max(0, 2 - categoriasPresentes.size);
            const faltamTermos = Math.max(0, 3 - palavrasChaveEncontradas.size);

            let dicaCompleta = 'Opinião autêntica com termos de análise (+50 XP de Bônus!). ';
            if (faltamChar > 0) {
                dicaCompleta += `Escreva mais ~${faltamChar} caracteres para Crítica Completa (+100 XP).`;
            } else if (faltamCategorias > 0 || faltamTermos > 0) {
                dicaCompleta += `Aborde outro pilar (ex: gráficos, enredo, áudio ou jogabilidade) para Crítica Completa (+100 XP).`;
            }

            return {
                xp: 150,
                nivel: 'opinativa',
                label: 'Resenha Opinativa',
                bonus: 50,
                icone: '📝',
                cor: '#22c55e',
                motivo: dicaCompleta
            };
        }

        return {
            xp: 100,
            nivel: 'rapida',
            label: 'Nota Rápida',
            bonus: 0,
            icone: '⚡',
            cor: '#94a3b8',
            motivo: `Faltam ${Math.max(0, 75 - len)} caracteres para alcançar Resenha Opinativa (+50 XP)`
        };
    }

    function calcularXpReview(item) {
        return avaliarQualidadeReview(item).xp;
    }

    /**
     * Calcula o XP total e o nível atual com base nas atividades do jogador
     * - Jogo avaliado: 100 a 200 XP (escalonado por qualidade de resenha com anti-spam)
     * - Filme/Série avaliado: 100 a 200 XP (escalonado por qualidade de resenha com anti-spam)
     * - Platina registrada: 150 a 600 XP (escalonado por dificuldade)
     * - Interações/Likes/Comentários: 20 XP cada
     */
    function calcularProgressoGamer(stats = {}) {
        const numInteracoes = Number(stats.interacoes || 0);

        // 1. Cálculo de XP dos Jogos (com bônus de detalhe se houver array de análises)
        let xpJogos = 0;
        let numJogos = 0;
        if (Array.isArray(stats.jogos)) {
            numJogos = stats.jogos.length;
            stats.jogos.forEach(j => {
                xpJogos += calcularXpReview(j);
            });
        } else {
            numJogos = Number(stats.jogos || 0);
            xpJogos = numJogos * 100;
        }

        // 2. Cálculo de XP das Mídias (com bônus de detalhe se houver array de análises)
        let xpMidias = 0;
        let numMidias = 0;
        if (Array.isArray(stats.midias)) {
            numMidias = stats.midias.length;
            stats.midias.forEach(m => {
                xpMidias += calcularXpReview(m);
            });
        } else {
            numMidias = Number(stats.midias || 0);
            xpMidias = numMidias * 100;
        }

        // 3. Cálculo de XP das Platinas (por dificuldade)
        let xpPlatinas = 0;
        let numPlatinas = 0;
        if (Array.isArray(stats.platinas)) {
            numPlatinas = stats.platinas.length;
            stats.platinas.forEach(p => {
                xpPlatinas += calcularXpPlatina(p);
            });
        } else if (Array.isArray(stats.listaPlatinas)) {
            numPlatinas = stats.listaPlatinas.length;
            stats.listaPlatinas.forEach(p => {
                xpPlatinas += calcularXpPlatina(p);
            });
        } else {
            numPlatinas = Number(stats.platinas || 0);
            xpPlatinas = numPlatinas * 250;
        }

        const xpTotal = xpJogos + xpMidias + xpPlatinas + (numInteracoes * 20);

        let infoNivel = NIVEIS_GAMER[0];
        let proximoNivel = NIVEIS_GAMER[1];

        for (let i = 0; i < NIVEIS_GAMER.length; i++) {
            if (xpTotal >= NIVEIS_GAMER[i].minXp && xpTotal <= NIVEIS_GAMER[i].maxXp) {
                infoNivel = NIVEIS_GAMER[i];
                proximoNivel = NIVEIS_GAMER[i + 1] || null;
                break;
            }
        }

        if (xpTotal >= 50000) {
            infoNivel = NIVEIS_GAMER[NIVEIS_GAMER.length - 1];
            proximoNivel = null;
        }

        const xpBase = infoNivel.minXp;
        const xpTeto = proximoNivel ? proximoNivel.minXp : infoNivel.maxXp;
        const xpNoNivel = xpTotal - xpBase;
        const faixaXp = xpTeto - xpBase;
        const porcentagem = proximoNivel ? Math.min(100, Math.max(0, Math.floor((xpNoNivel / faixaXp) * 100))) : 100;
        const xpRestante = proximoNivel ? Math.max(0, proximoNivel.minXp - xpTotal) : 0;

        return {
            xpTotal,
            nivel: infoNivel.nivel,
            titulo: infoNivel.titulo,
            icone: infoNivel.icone,
            cor: infoNivel.cor,
            bg: infoNivel.bg,
            porcentagem,
            xpNoNivel,
            faixaXp,
            xpRestante,
            proximoNivel
        };
    }

    /* ════════════════════════════════════════════════════════
       CONTROLE GLOBAL DE SCROLL / TRAVAMENTO DE FUNDO DOS MODAIS
    ════════════════════════════════════════════════════════ */
    let _ogModaisAbertosCount = 0;
    function bloquearScrollFundo() {
        _ogModaisAbertosCount++;
        document.documentElement.classList.add('og-modal-scroll-lock');
        document.body.classList.add('og-modal-scroll-lock');
    }
    function liberarScrollFundo() {
        _ogModaisAbertosCount = Math.max(0, _ogModaisAbertosCount - 1);
        if (_ogModaisAbertosCount === 0) {
            document.documentElement.classList.remove('og-modal-scroll-lock');
            document.body.classList.remove('og-modal-scroll-lock');
        }
    }
    window.bloquearScrollFundo = bloquearScrollFundo;
    window.liberarScrollFundo = liberarScrollFundo;

    /* ════════════════════════════════════════════════════════
       2. INJEÇÃO DE ESTILOS CSS DA GAMIFICAÇÃO & TIER LIST
    ════════════════════════════════════════════════════════ */
    function injetarEstilosGamificacao() {
        if (document.getElementById('overcritic-gamification-styles')) return;
        const style = document.createElement('style');
        style.id = 'overcritic-gamification-styles';
        style.textContent = `
            /* Trava de scroll para o corpo da página quando modal estiver aberto */
            html.og-modal-scroll-lock,
            body.og-modal-scroll-lock {
                overflow: hidden !important;
                height: 100% !important;
                touch-action: none !important;
                -webkit-overflow-scrolling: auto !important;
            }
            /* Badge de Nível no Perfil e Header */
            .og-level-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.76rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                border: 1px solid currentColor;
                box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                white-space: nowrap;
            }
            .og-level-badge:hover {
                transform: scale(1.05);
            }

            /* Barra de XP Gamer no Perfil */
            .og-xp-bar-wrap {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 10px;
                padding: 10px 14px;
                border-radius: 14px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            body.light-mode .og-xp-bar-wrap {
                background: rgba(0, 0, 0, 0.04);
                border-color: rgba(0, 0, 0, 0.08);
            }
            .og-xp-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.78rem;
                font-weight: 700;
                color: var(--text-muted, #adb5bd);
            }
            .og-xp-track {
                width: 100%;
                height: 8px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.08);
                overflow: hidden;
                position: relative;
            }
            body.light-mode .og-xp-track {
                background: rgba(0, 0, 0, 0.08);
            }
            .og-xp-fill {
                height: 100%;
                border-radius: 8px;
                background: linear-gradient(90deg, #0284c7, #00f0ff, #a855f7);
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
                transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* Botões de Ação Gamificada no Perfil */
            .og-profile-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 6px;
            }
            .og-btn-action {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 8px 14px;
                border-radius: 10px;
                font-size: 0.8rem;
                font-weight: 800;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                text-decoration: none;
                letter-spacing: 0.4px;
                border: 1px solid transparent;
            }
            .og-btn-card {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.16) 0%, rgba(157, 78, 221, 0.24) 100%);
                border: 1px solid rgba(0, 240, 255, 0.5);
                color: #00f0ff;
                box-shadow: 0 2px 10px rgba(0, 240, 255, 0.15), inset 0 0 12px rgba(0, 240, 255, 0.08);
                text-shadow: 0 0 8px rgba(0, 240, 255, 0.45);
            }
            .og-btn-card:hover {
                background: linear-gradient(135deg, #00f0ff 0%, #9d4edd 100%);
                color: #05070d;
                border-color: #00f0ff;
                box-shadow: 0 4px 20px rgba(0, 240, 255, 0.6), 0 0 25px rgba(157, 78, 221, 0.4);
                transform: translateY(-2px);
                text-shadow: none;
            }
            .og-btn-tier {
                background: linear-gradient(135deg, rgba(255, 183, 3, 0.16) 0%, rgba(255, 107, 107, 0.24) 100%);
                border: 1px solid rgba(255, 183, 3, 0.5);
                color: #ffc837;
                box-shadow: 0 2px 10px rgba(255, 183, 3, 0.15), inset 0 0 12px rgba(255, 183, 3, 0.08);
                text-shadow: 0 0 8px rgba(255, 183, 3, 0.45);
            }
            .og-btn-tier:hover {
                background: linear-gradient(135deg, #ffb703 0%, #ff5e7e 100%);
                color: #05070d;
                border-color: #ffb703;
                box-shadow: 0 4px 20px rgba(255, 183, 3, 0.6), 0 0 25px rgba(255, 94, 126, 0.4);
                transform: translateY(-2px);
                text-shadow: none;
            }
            body.light-mode .og-btn-card {
                background: linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(124, 58, 237, 0.14) 100%);
                border-color: #0284c7;
                color: #0284c7;
                box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15);
                text-shadow: none;
            }
            body.light-mode .og-btn-card:hover {
                background: linear-gradient(135deg, #0284c7 0%, #7c3aed 100%);
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(2, 132, 199, 0.35);
            }
            body.light-mode .og-btn-tier {
                background: linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(225, 29, 72, 0.14) 100%);
                border-color: #d97706;
                color: #d97706;
                box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
                text-shadow: none;
            }
            body.light-mode .og-btn-tier:hover {
                background: linear-gradient(135deg, #d97706 0%, #e11d48 100%);
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(217, 119, 6, 0.35);
            }

            /* ── OVERLAY & MODAIS (GAMER CARD & TIER LIST) ── */
            .og-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(4, 7, 14, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 100005;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: 24px 16px;
                box-sizing: border-box;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
                overflow-y: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
            }
            .og-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* Custom Scrollbars Elegantes */
            .og-modal-overlay::-webkit-scrollbar,
            .og-card-preview::-webkit-scrollbar,
            .og-tier-body::-webkit-scrollbar,
            .og-tier-pool::-webkit-scrollbar,
            .og-ladder-list::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .og-modal-overlay::-webkit-scrollbar-track,
            .og-card-preview::-webkit-scrollbar-track,
            .og-tier-body::-webkit-scrollbar-track,
            .og-tier-pool::-webkit-scrollbar-track,
            .og-ladder-list::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.25);
                border-radius: 8px;
            }
            .og-modal-overlay::-webkit-scrollbar-thumb,
            .og-card-preview::-webkit-scrollbar-thumb,
            .og-tier-body::-webkit-scrollbar-thumb,
            .og-tier-pool::-webkit-scrollbar-thumb,
            .og-ladder-list::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.35);
                border-radius: 8px;
            }
            .og-modal-overlay::-webkit-scrollbar-thumb:hover,
            .og-card-preview::-webkit-scrollbar-thumb:hover,
            .og-tier-body::-webkit-scrollbar-thumb:hover,
            .og-tier-pool::-webkit-scrollbar-thumb:hover,
            .og-ladder-list::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 240, 255, 0.65);
            }

            /* ── MODAL DO GAMER CARD ── */
            .og-gamer-card-modal {
                width: 100%;
                max-width: 480px;
                margin: auto;
                display: flex;
                flex-direction: column;
                gap: 14px;
                align-items: center;
                transform: scale(0.92) translateY(20px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
            }
            .og-modal-overlay.active .og-gamer-card-modal {
                transform: scale(1) translateY(0);
            }

            /* Card Holográfico Exibido na Tela */
            .og-card-preview {
                width: 100%;
                max-height: calc(88vh - 60px);
                overflow-y: auto;
                overscroll-behavior: contain;
                background: linear-gradient(150deg, #090e1a 0%, #111a2e 50%, #0d1222 100%);
                border: 2px solid rgba(0, 240, 255, 0.4);
                border-radius: 20px;
                padding: 20px 20px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.25);
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-sizing: border-box;
            }
            .og-card-preview::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.12), transparent 45%),
                            radial-gradient(circle at 80% 80%, rgba(157, 78, 221, 0.12), transparent 45%);
                pointer-events: none;
            }
            .og-card-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                z-index: 2;
            }
            .og-card-brand {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.82rem;
                font-weight: 900;
                letter-spacing: 1.5px;
                color: #00f0ff;
                text-transform: uppercase;
            }
            .og-card-chip {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 0.65rem;
                font-weight: 800;
                letter-spacing: 1px;
                color: #cbd5e1;
            }
            .og-card-close-btn {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.16);
                color: #cbd5e1;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            .og-card-close-btn:hover {
                background: rgba(239, 68, 68, 0.25);
                color: #ff6b6b;
                border-color: #ef4444;
                transform: scale(1.08);
            }
            .og-card-user {
                display: flex;
                align-items: center;
                gap: 14px;
                position: relative;
                z-index: 2;
            }
            .og-card-avatar {
                width: 54px;
                height: 54px;
                border-radius: 16px;
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(157, 78, 221, 0.3));
                border: 2px solid #00f0ff;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.7rem;
                font-weight: 800;
                color: #fff;
                flex-shrink: 0;
                overflow: hidden;
            }
            .og-card-user-info {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .og-card-username {
                font-size: 1.25rem;
                font-weight: 900;
                color: #fff;
                letter-spacing: -0.5px;
            }
            .og-card-rank {
                font-size: 0.78rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            /* Grid de Stats no Card */
            .og-card-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 6px;
                position: relative;
                z-index: 2;
            }
            .og-card-stat-box {
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 8px 4px;
                text-align: center;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .og-card-stat-num {
                font-size: 1.05rem;
                font-weight: 900;
                color: #fff;
            }
            .og-card-stat-label {
                font-size: 0.62rem;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.4px;
            }

            /* Mini Vitrine de Favoritos */
            .og-card-favorites {
                display: flex;
                flex-direction: column;
                gap: 6px;
                position: relative;
                z-index: 2;
            }
            .og-card-fav-title {
                font-size: 0.68rem;
                font-weight: 800;
                letter-spacing: 0.8px;
                color: #94a3b8;
                text-transform: uppercase;
            }
            .og-card-fav-covers {
                display: flex;
                gap: 8px;
                overflow: hidden;
            }
            .og-card-fav-item {
                flex: 1;
                height: 48px;
                border-radius: 8px;
                background-size: cover;
                background-position: center;
                border: 1px solid rgba(255, 255, 255, 0.15);
                position: relative;
            }

            /* Rodapé do Card */
            .og-card-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.65rem;
                color: #64748b;
                font-weight: 700;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                padding-top: 10px;
                position: relative;
                z-index: 2;
            }

            /* ── Destaque do Próximo Ranking na Barra de XP ── */
            .og-card-next-goal {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px dashed rgba(255, 255, 255, 0.1);
                font-size: 0.74rem;
                color: #cbd5e1;
            }
            .og-card-missing-badge {
                font-weight: 800;
                font-size: 0.7rem;
                padding: 3px 8px;
                border-radius: 6px;
                background: rgba(255, 215, 0, 0.14);
                color: #ffd700;
                border: 1px solid rgba(255, 215, 0, 0.35);
                white-space: nowrap;
                letter-spacing: 0.3px;
                box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
            }

            /* ── Trilha de Rankings no Gamer Card ── */
            .og-card-ladder-section {
                background: rgba(0, 0, 0, 0.32);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                padding: 10px 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                position: relative;
                z-index: 2;
                transition: all 0.3s ease;
            }
            .og-ladder-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .og-ladder-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.74rem;
                font-weight: 800;
                letter-spacing: 0.6px;
                color: #e2e8f0;
                text-transform: uppercase;
            }
            .og-btn-ladder-toggle {
                background: rgba(0, 240, 255, 0.1);
                border: 1px solid rgba(0, 240, 255, 0.3);
                color: #00f0ff;
                padding: 3px 9px;
                border-radius: 6px;
                font-size: 0.68rem;
                font-weight: 800;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
                font-family: inherit;
            }
            .og-btn-ladder-toggle:hover {
                background: rgba(0, 240, 255, 0.22);
                border-color: #00f0ff;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
            }
            .og-ladder-quick-summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                padding: 6px 10px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                font-size: 0.72rem;
            }
            .og-ladder-pill {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 3px 8px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.7rem;
            }
            .og-ladder-pill.current {
                background: rgba(0, 240, 255, 0.14);
                border: 1px solid #00f0ff;
                color: #00f0ff;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
            }
            .og-ladder-pill.next {
                background: rgba(255, 215, 0, 0.12);
                border: 1px solid rgba(255, 215, 0, 0.5);
                color: #ffd700;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
            }
            .og-ladder-bridge {
                color: #64748b;
                font-weight: 900;
                font-size: 0.75rem;
            }
            .og-ladder-list {
                max-height: 200px;
                overflow-y: auto;
                padding-right: 4px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 4px;
            }
            .og-ladder-list::-webkit-scrollbar {
                width: 4px;
            }
            .og-ladder-list::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.4);
                border-radius: 4px;
            }
            .og-ladder-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                transition: transform 0.15s ease, background 0.15s ease;
                font-size: 0.72rem;
            }
            .og-ladder-item:hover {
                background: rgba(255, 255, 255, 0.05);
                transform: translateX(2px);
            }
            .og-ladder-item.is-current {
                background: rgba(0, 240, 255, 0.12);
                border: 1px solid #00f0ff;
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
            }
            .og-ladder-item.is-next {
                background: rgba(255, 215, 0, 0.08);
                border: 1px dashed rgba(255, 215, 0, 0.5);
            }
            .og-ladder-item.is-conquered {
                opacity: 0.75;
            }
            .og-ladder-item.is-locked {
                opacity: 0.55;
            }
            .og-ladder-item-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .og-ladder-item-icon {
                font-size: 1rem;
                width: 22px;
                text-align: center;
            }
            .og-ladder-item-title {
                font-weight: 800;
                color: #f1f5f9;
            }
            .og-ladder-item-sub {
                font-size: 0.65rem;
                color: #94a3b8;
            }
            .og-ladder-item-badge {
                font-weight: 800;
                font-size: 0.66rem;
                padding: 2px 7px;
                border-radius: 6px;
                white-space: nowrap;
            }
            .og-ladder-hints {
                font-size: 0.64rem;
                color: #64748b;
                line-height: 1.3;
                border-top: 1px solid rgba(255, 255, 255, 0.04);
                padding-top: 6px;
                margin-top: 2px;
            }
            body.light-mode .og-card-ladder-section {
                background: rgba(241, 245, 249, 0.6);
                border-color: rgba(0, 0, 0, 0.08);
            }
            body.light-mode .og-ladder-item-title {
                color: #0f172a;
            }
            body.light-mode .og-ladder-quick-summary {
                background: rgba(0, 0, 0, 0.03);
            }

            /* Barra de Ações do Modal */
            .og-modal-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
            }
            .og-modal-btn {
                flex: 1;
                padding: 12px 18px;
                border-radius: 14px;
                font-size: 0.92rem;
                font-weight: 800;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.25s ease;
                font-family: inherit;
            }
            .og-btn-download {
                background: linear-gradient(135deg, #0284c7, #00f0ff);
                color: #07090f;
                box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4);
            }
            .og-btn-download:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 240, 255, 0.6);
            }
            .og-btn-close {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .og-btn-close:hover {
                background: rgba(239, 68, 68, 0.25);
                color: #ff6b6b;
                border-color: #ef4444;
            }

            /* ── MODAL DO CRIADOR DE TIER LIST ── */
            .og-tier-modal {
                width: 100%;
                max-width: 980px;
                max-height: 94vh;
                margin: auto;
                background: linear-gradient(145deg, #0d1222 0%, #070a14 100%);
                border: 1px solid rgba(0, 240, 255, 0.3);
                border-radius: 20px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
            }
            body.light-mode .og-tier-modal {
                background: #ffffff;
                border-color: #cbd5e1;
            }
            .og-tier-header {
                padding: 14px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                flex-wrap: wrap;
                gap: 10px;
                flex-shrink: 0;
            }
            body.light-mode .og-tier-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
            }
            .og-tier-title-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .og-tier-title {
                font-size: 1.15rem;
                font-weight: 900;
                color: var(--text-main, #fff);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .og-tier-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .og-tier-body {
                padding: 14px 18px;
                overflow-y: auto;
                overscroll-behavior: contain;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .og-tier-board {
                display: flex;
                flex-direction: column;
                gap: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                overflow: hidden;
                background: #000;
                flex-shrink: 0;
            }
            .og-tier-row {
                display: flex;
                min-height: 58px;
                background: rgba(15, 23, 42, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                transition: background 0.15s ease;
            }
            .og-tier-row:last-child {
                border-bottom: none;
            }
            .og-tier-label {
                width: 74px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-weight: 900;
                color: #07090f;
                padding: 6px 4px;
                text-align: center;
                flex-shrink: 0;
                user-select: none;
            }
            .og-tier-label-letter {
                font-size: 1.45rem;
                line-height: 1;
            }
            .og-tier-label-desc {
                font-size: 0.54rem;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                font-weight: 800;
                opacity: 0.92;
                margin-top: 2px;
                white-space: nowrap;
            }
            .og-tier-s { background: #ff4757; }
            .og-tier-a { background: #ffa502; }
            .og-tier-b { background: #eccc68; }
            .og-tier-c { background: #2ed573; }
            .og-tier-d { background: #70a1ff; }

            .og-tier-dropzone {
                flex: 1;
                padding: 4px 8px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
                min-height: 58px;
                transition: background 0.2s ease;
                position: relative;
            }
            .og-tier-dropzone:empty::before {
                content: 'Arraste obras para cá...';
                font-size: 0.72rem;
                color: rgba(255, 255, 255, 0.22);
                font-style: italic;
                pointer-events: none;
                margin-left: 6px;
            }
            .og-tier-dropzone.dragover {
                background: rgba(0, 240, 255, 0.15);
                outline: 2px dashed #00f0ff;
                outline-offset: -2px;
            }

            /* Bandeja de Itens Não Alocados */
            .og-tier-pool-wrap {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 4px;
                flex-shrink: 0;
            }
            .og-tier-pool-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 8px;
            }
            .og-tier-pool-title {
                font-size: 0.82rem;
                font-weight: 800;
                color: var(--accent-cyan, #00f0ff);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .og-tier-pool-filters {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            .og-pool-filter-btn {
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(255, 255, 255, 0.05);
                color: #94a3b8;
                font-size: 0.7rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .og-pool-filter-btn:hover {
                color: #fff;
                border-color: rgba(0, 240, 255, 0.4);
            }
            .og-pool-filter-btn.active {
                background: rgba(0, 240, 255, 0.18);
                color: #00f0ff;
                border-color: #00f0ff;
            }

            .og-tier-pool {
                background: rgba(0, 0, 0, 0.4);
                border: 1px dashed rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 8px 10px;
                min-height: 68px;
                max-height: 125px;
                overflow-y: auto;
                overscroll-behavior: contain;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                align-items: center;
            }
            body.light-mode .og-tier-pool {
                background: rgba(0, 0, 0, 0.03);
                border-color: rgba(0, 0, 0, 0.2);
            }

            /* Card Arrastável da Tier List */
            .og-tier-item {
                width: 48px;
                height: 62px;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
                cursor: grab;
                border: 1.5px solid rgba(255, 255, 255, 0.2);
                background-size: cover;
                background-position: center;
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
                user-select: none;
                flex-shrink: 0;
            }
            .og-tier-item:active {
                cursor: grabbing;
            }
            .og-tier-item:hover {
                transform: scale(1.12);
                border-color: var(--accent-cyan, #00f0ff);
                box-shadow: 0 4px 14px rgba(0, 240, 255, 0.5);
                z-index: 10;
            }
            .og-tier-item-rating {
                position: absolute;
                bottom: 2px;
                right: 2px;
                background: rgba(0, 0, 0, 0.85);
                color: #ffd700;
                font-size: 0.58rem;
                font-weight: 800;
                padding: 1px 3px;
                border-radius: 3px;
                line-height: 1;
            }

            /* Menu Seletor Touch no Celular */
            .og-touch-menu {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(13, 18, 30, 0.98);
                border: 1px solid var(--accent-cyan);
                border-radius: 18px;
                padding: 8px 14px;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.4);
                z-index: 100010;
                animation: slideUpTouch 0.25s ease;
                max-width: 95vw;
                flex-wrap: wrap;
                justify-content: center;
            }
            @keyframes slideUpTouch {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            .og-touch-btn {
                padding: 6px 10px;
                border-radius: 8px;
                border: none;
                font-weight: 900;
                font-size: 0.85rem;
                cursor: pointer;
                color: #000;
            }

            /* ── RESPONSIVIDADE COMPLETA PARA NOTEBOOKS, TELAS PEQUENAS E MOBILE ── */
            @media (max-height: 780px) {
                .og-tier-modal {
                    max-height: 96vh;
                }
                .og-tier-header {
                    padding: 10px 16px;
                }
                .og-tier-body {
                    padding: 10px 14px;
                    gap: 8px;
                }
                .og-tier-row {
                    min-height: 50px;
                }
                .og-tier-dropzone {
                    min-height: 50px;
                    padding: 3px 6px;
                }
                .og-tier-label {
                    width: 66px;
                    padding: 4px 2px;
                }
                .og-tier-label-letter {
                    font-size: 1.3rem;
                }
                .og-tier-label-desc {
                    font-size: 0.5rem;
                }
                .og-tier-item {
                    width: 40px;
                    height: 52px;
                }
                .og-tier-pool {
                    min-height: 58px;
                    max-height: 100px;
                }
                .og-card-preview {
                    max-height: calc(85vh - 50px);
                    padding: 16px 16px;
                    gap: 10px;
                }
            }

            @media (max-width: 640px) {
                .og-modal-overlay {
                    padding: 12px 10px;
                }
                .og-tier-header {
                    padding: 10px 12px;
                }
                .og-tier-title {
                    font-size: 1rem;
                }
                .og-tier-header-actions {
                    width: 100%;
                    justify-content: flex-end;
                }
                .og-tier-label {
                    width: 52px;
                    padding: 4px 2px;
                }
                .og-tier-label-letter {
                    font-size: 1.15rem;
                }
                .og-tier-label-desc {
                    font-size: 0.48rem;
                }
                .og-tier-item {
                    width: 38px;
                    height: 50px;
                }
                .og-tier-dropzone {
                    padding: 2px 4px;
                    gap: 4px;
                }
                .og-tier-pool-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .og-card-preview {
                    padding: 14px 12px;
                    gap: 10px;
                    border-radius: 16px;
                }
                .og-card-avatar {
                    width: 46px;
                    height: 46px;
                    font-size: 1.4rem;
                }
                .og-card-username {
                    font-size: 1.15rem;
                }
                .og-card-stats {
                    gap: 5px;
                }
                .og-card-stat-box {
                    padding: 6px 2px;
                }
                .og-card-stat-num {
                    font-size: 0.95rem;
                }
                .og-modal-actions {
                    flex-direction: column;
                    width: 100%;
                }
                .og-modal-btn {
                    width: 100%;
                    justify-content: center;
                }
            }

            /* ══════ RANKING GERAL DA COMUNIDADE (LÍDERES OVERCRITIC) ══════ */
            .og-community-ranking-card {
                background: var(--card-bg, rgba(13, 19, 33, 0.7));
                border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
                border-radius: 24px;
                padding: clamp(20px, 3vw, 36px);
                margin: 40px 0;
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 240, 255, 0.05);
                position: relative;
                overflow: hidden;
            }
            body.light-mode .og-community-ranking-card {
                background: rgba(255, 255, 255, 0.88);
                border-color: rgba(0, 0, 0, 0.08);
                box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
            }
            .og-ranking-main-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 16px;
                margin-bottom: 28px;
            }
            .og-ranking-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                background: rgba(255, 215, 0, 0.12);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                color: #ffd700;
                font-size: 0.75rem;
                font-weight: 800;
                letter-spacing: 1.5px;
                margin-bottom: 8px;
            }
            body.light-mode .og-ranking-badge {
                background: rgba(217, 119, 6, 0.12);
                border-color: rgba(217, 119, 6, 0.3);
                color: #b45309;
            }
            .og-ranking-title {
                font-size: clamp(1.4rem, 2.4vw, 2rem);
                font-weight: 900;
                color: var(--text-main, #f8f9fa);
                margin: 0 0 6px 0;
                letter-spacing: -0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            body.light-mode .og-ranking-title {
                color: #0f172a;
            }
            .og-ranking-subtitle {
                font-size: 0.88rem;
                color: var(--text-muted, #adb5bd);
                max-width: 650px;
                line-height: 1.5;
            }
            body.light-mode .og-ranking-subtitle {
                color: #64748b;
            }
            .og-ranking-actions {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }
            .og-btn-ranking-action {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 9px 18px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
                color: var(--text-main, #f8f9fa);
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.25s ease;
            }
            .og-btn-ranking-action:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            .og-btn-ranking-action.primary {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(157, 78, 221, 0.18));
                border-color: var(--accent-cyan, #00f0ff);
                color: var(--accent-cyan, #00f0ff);
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
            }
            .og-btn-ranking-action.primary:hover {
                background: linear-gradient(135deg, #00f0ff, #9d4edd);
                color: #07090f;
                box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);
            }

            /* PÓDIO DOS LÍDERES */
            .og-podium-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                align-items: flex-end;
                margin-bottom: 36px;
            }
            @media (max-width: 860px) {
                .og-podium-grid {
                    grid-template-columns: 1fr;
                    align-items: stretch;
                }
            }
            .og-podium-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 20px;
                padding: 24px 20px;
                text-align: center;
                position: relative;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            body.light-mode .og-podium-card {
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(0, 0, 0, 0.08);
            }
            .og-podium-card:hover {
                transform: translateY(-4px);
            }
            .og-podium-card.rank-1 {
                border-color: rgba(255, 215, 0, 0.45);
                background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.12);
                padding-top: 32px;
                padding-bottom: 28px;
            }
            body.light-mode .og-podium-card.rank-1 {
                background: linear-gradient(180deg, rgba(254, 243, 199, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
                border-color: rgba(245, 158, 11, 0.4);
            }
            .og-podium-card.rank-2 {
                border-color: rgba(203, 213, 225, 0.35);
                background: linear-gradient(180deg, rgba(203, 213, 225, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            }
            .og-podium-card.rank-3 {
                border-color: rgba(205, 127, 50, 0.35);
                background: linear-gradient(180deg, rgba(205, 127, 50, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            }
            .og-podium-crown {
                position: absolute;
                top: -16px;
                font-size: 1.8rem;
                animation: ogFloatCrown 2.5s ease-in-out infinite alternate;
                filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
            }
            @keyframes ogFloatCrown {
                from { transform: translateY(0); }
                to { transform: translateY(-5px); }
            }
            .og-podium-avatar-wrap {
                width: 68px;
                height: 68px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.2rem;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid currentColor;
                margin-bottom: 12px;
                position: relative;
            }
            .og-podium-card.rank-1 .og-podium-avatar-wrap {
                width: 80px;
                height: 80px;
                font-size: 2.6rem;
                border-color: #ffd700;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
            }
            .og-podium-card.rank-2 .og-podium-avatar-wrap {
                border-color: #cbd5e1;
                box-shadow: 0 0 15px rgba(203, 213, 225, 0.3);
            }
            .og-podium-card.rank-3 .og-podium-avatar-wrap {
                border-color: #cd7f32;
                box-shadow: 0 0 15px rgba(205, 127, 50, 0.3);
            }
            .og-podium-rank-badge {
                position: absolute;
                bottom: -8px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.72rem;
                font-weight: 800;
                background: #000;
                border: 1px solid currentColor;
                letter-spacing: 0.5px;
            }
            .og-podium-name {
                font-size: 1.15rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                margin: 6px 0 2px;
                display: flex;
                align-items: center;
                gap: 6px;
                justify-content: center;
            }
            body.light-mode .og-podium-name {
                color: #0f172a;
            }
            .og-podium-patente {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 800;
                margin-bottom: 12px;
                border: 1px solid currentColor;
            }
            .og-podium-xp {
                font-size: 1.35rem;
                font-weight: 900;
                letter-spacing: -0.5px;
                margin-bottom: 10px;
            }
            .og-podium-card.rank-1 .og-podium-xp {
                color: #ffd700;
                text-shadow: 0 0 16px rgba(255, 215, 0, 0.4);
            }
            .og-podium-card.rank-2 .og-podium-xp {
                color: #cbd5e1;
            }
            .og-podium-card.rank-3 .og-podium-xp {
                color: #cd7f32;
            }
            .og-podium-stats-row {
                display: flex;
                gap: 12px;
                font-size: 0.78rem;
                color: var(--text-muted, #adb5bd);
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                width: 100%;
                justify-content: center;
            }
            body.light-mode .og-podium-stats-row {
                color: #64748b;
                border-color: rgba(0, 0, 0, 0.06);
            }

            /* TABELA DO RANKING GERAL */
            .og-ranking-table-card {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 18px;
                overflow: hidden;
            }
            body.light-mode .og-ranking-table-card {
                background: #ffffff;
                border-color: rgba(0, 0, 0, 0.08);
            }
            .og-ranking-table-header {
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                background: rgba(255, 255, 255, 0.02);
            }
            body.light-mode .og-ranking-table-header {
                background: rgba(0, 0, 0, 0.02);
                border-color: rgba(0, 0, 0, 0.06);
            }
            .og-ranking-table-title {
                font-size: 0.95rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            body.light-mode .og-ranking-table-title {
                color: #0f172a;
            }
            .og-ranking-table-legend {
                display: flex;
                gap: 8px;
                font-size: 0.76rem;
                color: var(--text-muted, #adb5bd);
            }
            .og-legend-pill {
                padding: 2px 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
            }
            .og-ranking-table-responsive {
                width: 100%;
                overflow-x: auto;
            }
            .og-ranking-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.88rem;
            }
            .og-ranking-table th {
                padding: 14px 18px;
                font-size: 0.75rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                color: var(--text-muted, #adb5bd);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                background: rgba(0, 0, 0, 0.15);
            }
            body.light-mode .og-ranking-table th {
                background: #f8fafc;
                color: #64748b;
                border-color: #e2e8f0;
            }
            .og-ranking-table td {
                padding: 14px 18px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                color: var(--text-main, #f8f9fa);
                vertical-align: middle;
            }
            body.light-mode .og-ranking-table td {
                color: #1e293b;
                border-color: #f1f5f9;
            }
            .og-rank-row {
                transition: background 0.2s ease;
            }
            .og-rank-row:hover {
                background: rgba(0, 240, 255, 0.04);
            }
            body.light-mode .og-rank-row:hover {
                background: rgba(2, 132, 199, 0.04);
            }
            .og-rank-row.is-current-user {
                background: rgba(0, 240, 255, 0.08);
                border-left: 3px solid var(--accent-cyan, #00f0ff);
            }
            body.light-mode .og-rank-row.is-current-user {
                background: rgba(2, 132, 199, 0.08);
                border-left: 3px solid #0284c7;
            }
            .og-rank-num {
                font-size: 1.05rem;
                font-weight: 900;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .og-rank-user-cell {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .og-rank-user-avatar {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
                border: 1px solid rgba(255, 255, 255, 0.15);
                flex-shrink: 0;
            }
            .og-rank-user-name {
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            body.light-mode .og-rank-user-name {
                color: #0f172a;
            }
            .og-rank-badge-role {
                font-size: 0.68rem;
                padding: 2px 6px;
                border-radius: 6px;
                background: rgba(255, 215, 0, 0.12);
                color: #ffd700;
                border: 1px solid rgba(255, 215, 0, 0.3);
                font-weight: 700;
            }
            body.light-mode .og-rank-badge-role {
                background: rgba(217, 119, 6, 0.12);
                color: #b45309;
                border-color: rgba(217, 119, 6, 0.3);
            }
            .og-rank-badge-you {
                font-size: 0.68rem;
                padding: 2px 6px;
                border-radius: 6px;
                background: rgba(0, 240, 255, 0.15);
                color: var(--accent-cyan, #00f0ff);
                border: 1px solid var(--accent-cyan, #00f0ff);
                font-weight: 800;
            }
            .og-rank-patente-pill {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.76rem;
                font-weight: 800;
                border: 1px solid currentColor;
            }
            .og-rank-xp-bar-wrap {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .og-rank-xp-text {
                display: flex;
                justify-content: space-between;
                font-size: 0.75rem;
                font-weight: 700;
            }
            .og-rank-xp-track {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 6px;
                overflow: hidden;
            }
            body.light-mode .og-rank-xp-track {
                background: #e2e8f0;
            }
            .og-rank-xp-fill {
                height: 100%;
                background: linear-gradient(90deg, #00f0ff, #9d4edd);
                border-radius: 6px;
            }
            .og-rank-btn-view {
                padding: 6px 12px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-main, #f8f9fa);
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .og-rank-btn-view:hover {
                background: rgba(0, 240, 255, 0.15);
                border-color: var(--accent-cyan, #00f0ff);
                color: var(--accent-cyan, #00f0ff);
            }
            .og-ranking-empty {
                text-align: center;
                padding: 40px 20px;
            }
            .og-podium-card-placeholder {
                min-height: 200px;
            }
        `;
        document.head.appendChild(style);
    }

    /* ════════════════════════════════════════════════════════
       3. MODAL & GERADOR DE GAMER CARD
    ════════════════════════════════════════════════════════ */
    function garantirModalGamerCard() {
        injetarEstilosGamificacao();
        let overlay = document.getElementById('ogGamerCardOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogGamerCardOverlay';
        overlay.className = 'og-modal-overlay';
        overlay.innerHTML = `
            <div class="og-gamer-card-modal">
                <div class="og-card-preview" id="ogCardPreview">
                    <div class="og-card-top">
                        <div class="og-card-brand">
                            <span>🎮</span> OVERCRITIC
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="og-card-chip" id="ogCardChip">PASSE GAMER OFICIAL</div>
                            <button type="button" class="og-card-close-btn" id="ogBtnFloatingCloseCard" title="Fechar (Esc)">✕</button>
                        </div>
                    </div>

                    <div class="og-card-user">
                        <div class="og-card-avatar" id="ogCardAvatar">🎮</div>
                        <div class="og-card-user-info">
                            <div class="og-card-username" id="ogCardUsername">Jogador</div>
                            <div class="og-card-rank" id="ogCardRank">
                                <span id="ogCardRankIcon">🏆</span>
                                <span id="ogCardRankTitle" style="color: #00f0ff;">Mestre dos Troféus</span>
                                <span style="opacity:0.8; font-size:0.7rem;" id="ogCardRankNv">• Nv. 5</span>
                            </div>
                        </div>
                    </div>

                    <div class="og-xp-bar-wrap" style="margin: 0; padding: 10px 14px; background: rgba(0, 0, 0, 0.25); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.06);">
                        <div class="og-xp-header" style="margin-bottom: 6px;">
                            <span>Progresso de Reputação</span>
                            <span id="ogCardXpText" style="color:#00f0ff; font-weight: 800;">2.450 XP</span>
                        </div>
                        <div class="og-xp-track">
                            <div class="og-xp-fill" id="ogCardXpFill" style="width: 75%;"></div>
                        </div>
                        <div class="og-card-next-goal" id="ogCardNextGoal">
                            <span id="ogCardNextRankDesc">🎯 Próximo: 🥈 Crítico de Prata (Nv. 4)</span>
                            <span class="og-card-missing-badge" id="ogCardMissingXp">Faltam 150 XP</span>
                        </div>
                    </div>

                    <div class="og-card-stats">
                        <div class="og-card-stat-box">
                            <div class="og-card-stat-num" id="ogCardNumJogos">0</div>
                            <div class="og-card-stat-label">Jogos</div>
                        </div>
                        <div class="og-card-stat-box">
                            <div class="og-card-stat-num" id="ogCardNumMidias">0</div>
                            <div class="og-card-stat-label">Filmes/Séries</div>
                        </div>
                        <div class="og-card-stat-box">
                            <div class="og-card-stat-num" id="ogCardNumPlatinas" style="color:#ffd700;">0</div>
                            <div class="og-card-stat-label">Platinas</div>
                        </div>
                        <div class="og-card-stat-box">
                            <div class="og-card-stat-num" id="ogCardNumMedia" style="color:#00f0ff;">—</div>
                            <div class="og-card-stat-label">Média</div>
                        </div>
                    </div>

                    <!-- ══════ NOVA SEÇÃO: TRILHA DE RANKINGS & REQUISITOS ══════ -->
                    <div class="og-card-ladder-section" id="ogCardLadderSection">
                        <div class="og-ladder-header">
                            <div class="og-ladder-title">
                                <span>🧭</span>
                                <span>Trilha de Patentes</span>
                            </div>
                            <button type="button" class="og-btn-ladder-toggle" id="ogBtnToggleLadder" title="Exibir ou ocultar todos os 10 níveis do Overcritic">
                                <span id="ogLadderToggleText">Ver Todos (10)</span>
                                <span id="ogLadderToggleIcon">▾</span>
                            </button>
                        </div>
                        <div class="og-ladder-quick-summary" id="ogLadderQuickSummary"></div>
                        <div class="og-ladder-list" id="ogLadderList" style="display: none;"></div>
                        <div class="og-ladder-hints">
                            <span>💡 <strong>Recálculo dinâmico:</strong> +150 a 600 XP por Platina • +100 a 200 XP por Análise (bônus de resenha)</span>
                        </div>
                    </div>

                    <div class="og-card-favorites" id="ogCardFavSection">
                        <div class="og-card-fav-title">⭐ Obras em Destaque</div>
                        <div class="og-card-fav-covers" id="ogCardFavCovers"></div>
                    </div>

                    <div class="og-card-footer">
                        <span>OVERCRITIC ID • AUTENTICADO</span>
                        <span id="ogCardTimestamp">2026</span>
                    </div>
                </div>

                <div class="og-modal-actions">
                    <button class="og-modal-btn og-btn-download" id="ogBtnDownloadCard">
                        <span>📥</span> Baixar Imagem (PNG)
                    </button>
                    <button class="og-modal-btn og-btn-close" id="ogBtnCloseCard">
                        ✕ Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharGamerCardModal();
        });
        document.getElementById('ogBtnCloseCard').addEventListener('click', fecharGamerCardModal);
        const btnFloatingClose = document.getElementById('ogBtnFloatingCloseCard');
        if (btnFloatingClose) btnFloatingClose.addEventListener('click', fecharGamerCardModal);
        document.getElementById('ogBtnDownloadCard').addEventListener('click', exportarGamerCardPng);

        // Listener do botão de alternar lista de rankings
        const btnToggleLadder = document.getElementById('ogBtnToggleLadder');
        if (btnToggleLadder) {
            btnToggleLadder.addEventListener('click', (e) => {
                e.stopPropagation();
                const list = document.getElementById('ogLadderList');
                const text = document.getElementById('ogLadderToggleText');
                const icon = document.getElementById('ogLadderToggleIcon');
                if (list) {
                    const isVisible = list.style.display !== 'none';
                    list.style.display = isVisible ? 'none' : 'flex';
                    if (text) text.textContent = isVisible ? 'Ver Todos (10)' : 'Ocultar';
                    if (icon) icon.textContent = isVisible ? '▾' : '▴';
                }
            });
        }

        return overlay;
    }

    let _dadosCardAtuais = null;

    function abrirGamerCardModal(dados = {}) {
        const overlay = garantirModalGamerCard();

        // Sempre busca consolidação fresca para recalcular exatamente o estado atual
        const consolidados = obterDadosConsolidadosUsuario(dados?.username, dados?.userId);
        const isSelf = !dados?.username || dados.username.toLowerCase() === (consolidados.username || '').toLowerCase();
        
        let jogos = isSelf ? consolidados.jogos : ((dados && Array.isArray(dados.jogos)) ? dados.jogos : consolidados.jogos);
        let midias = isSelf ? consolidados.midias : ((dados && Array.isArray(dados.midias)) ? dados.midias : consolidados.midias);
        let platinas = isSelf ? consolidados.platinas : ((dados && Array.isArray(dados.platinas)) ? dados.platinas : consolidados.platinas);

        const username = dados?.username || consolidados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const uid = dados?.userId || consolidados.userId || localStorage.getItem('overcritic_user_id') || '';

        dados = {
            username,
            userId: uid,
            jogos,
            midias,
            platinas
        };

        _dadosCardAtuais = dados;

        const jogosArr = dados.jogos || [];
        const midiasArr = dados.midias || [];
        const platinasArr = (dados.platinas || []);
        const numJogos = jogosArr.length;
        const numMidias = midiasArr.length;
        const numPlatinas = platinasArr.length;

        const prog = calcularProgressoGamer({
            jogos: jogosArr,
            midias: midiasArr,
            platinas: platinasArr
        });

        // Preenche campos do Card
        document.getElementById('ogCardUsername').textContent = username;
        document.getElementById('ogCardRankIcon').textContent = prog.icone;
        document.getElementById('ogCardRankTitle').textContent = prog.titulo;
        document.getElementById('ogCardRankTitle').style.color = prog.cor;
        document.getElementById('ogCardRankNv').textContent = `• Nv. ${prog.nivel}`;
        document.getElementById('ogCardXpText').textContent = `${prog.xpTotal.toLocaleString('pt-BR')} XP`;
        document.getElementById('ogCardXpFill').style.width = `${prog.porcentagem}%`;

        // Indicador de quanto falta para o próximo ranking
        const nextRankDesc = document.getElementById('ogCardNextRankDesc');
        const missingXpEl = document.getElementById('ogCardMissingXp');

        if (prog.proximoNivel) {
            const faltam = prog.xpRestante;
            const eqPlat = Math.ceil(faltam / 400);
            const eqAv = Math.ceil(faltam / 100);
            if (nextRankDesc) {
                nextRankDesc.innerHTML = `🎯 Próximo: <strong>${prog.proximoNivel.icone} ${prog.proximoNivel.titulo}</strong> (Nv. ${prog.proximoNivel.nivel})`;
            }
            if (missingXpEl) {
                missingXpEl.textContent = `Faltam ${faltam.toLocaleString('pt-BR')} XP`;
                missingXpEl.title = `Equivale a ~${eqPlat} Platina(s) Difíceis ou ${eqAv} Avaliação(ões)`;
                missingXpEl.style.display = 'inline-block';
                missingXpEl.style.color = '#ffd700';
                missingXpEl.style.background = 'rgba(255, 215, 0, 0.14)';
                missingXpEl.style.borderColor = 'rgba(255, 215, 0, 0.35)';
            }
        } else {
            if (nextRankDesc) {
                nextRankDesc.innerHTML = `🔥 <strong>Nível Máximo Conquistado!</strong> Lenda Suprema do Overcritic`;
            }
            if (missingXpEl) {
                missingXpEl.textContent = `MÁXIMO`;
                missingXpEl.style.color = '#ef4444';
                missingXpEl.style.background = 'rgba(239, 68, 68, 0.15)';
                missingXpEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }
        }

        // Mini Resumo Rápido da Trilha (Nível Atual -> Próximo Nível)
        const quickSummary = document.getElementById('ogLadderQuickSummary');
        if (quickSummary) {
            if (prog.proximoNivel) {
                quickSummary.innerHTML = `
                    <div class="og-ladder-pill current" title="Patente Atual">
                        <span>${prog.icone}</span>
                        <span>Nv. ${prog.nivel} ${prog.titulo}</span>
                    </div>
                    <span class="og-ladder-bridge">${prog.porcentagem}% ➔</span>
                    <div class="og-ladder-pill next" title="Próximo Objetivo (Faltam ${prog.xpRestante.toLocaleString('pt-BR')} XP)">
                        <span>${prog.proximoNivel.icone}</span>
                        <span>Nv. ${prog.proximoNivel.nivel} ${prog.proximoNivel.titulo}</span>
                    </div>
                `;
            } else {
                quickSummary.innerHTML = `
                    <div class="og-ladder-pill current" style="border-color:#ef4444; color:#ef4444; width: 100%; justify-content: center;">
                        <span>🔥</span>
                        <span>Nv. 10 Lenda do Overcritic • Patente Suprema Conquistada!</span>
                    </div>
                `;
            }
        }

        // Lista Completa dos 10 Níveis Recalculada em Tempo Real
        const ladderList = document.getElementById('ogLadderList');
        if (ladderList) {
            ladderList.innerHTML = NIVEIS_GAMER.map(lvl => {
                const isCurrent = lvl.nivel === prog.nivel;
                const isConquered = lvl.nivel < prog.nivel;
                const isNext = prog.proximoNivel && lvl.nivel === prog.proximoNivel.nivel;

                let itemClass = '';
                let badgeHtml = '';

                if (isCurrent) {
                    itemClass = 'is-current';
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:${lvl.bg}; color:${lvl.cor}; border:1px solid ${lvl.cor};">📍 Nível Atual (${prog.xpTotal.toLocaleString('pt-BR')} XP)</span>`;
                } else if (isConquered) {
                    itemClass = 'is-conquered';
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);">✓ Conquistado</span>`;
                } else if (isNext) {
                    itemClass = 'is-next';
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 215, 0, 0.15); color:#ffd700; border:1px solid rgba(255, 215, 0, 0.4); box-shadow:0 0 8px rgba(255, 215, 0, 0.2);">🎯 Próximo (Faltam ${prog.xpRestante.toLocaleString('pt-BR')} XP)</span>`;
                } else {
                    itemClass = 'is-locked';
                    const diff = Math.max(0, lvl.minXp - prog.xpTotal);
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 255, 255, 0.05); color:#94a3b8; border:1px solid rgba(255, 255, 255, 0.08);">🔒 Faltam ${diff.toLocaleString('pt-BR')} XP</span>`;
                }

                return `
                    <div class="og-ladder-item ${itemClass}">
                        <div class="og-ladder-item-left">
                            <span class="og-ladder-item-icon">${lvl.icone}</span>
                            <div>
                                <div class="og-ladder-item-title" style="color: ${isCurrent ? lvl.cor : ''}">${lvl.titulo} <span style="font-size:0.68rem; opacity:0.8;">• Nv. ${lvl.nivel}</span></div>
                                <div class="og-ladder-item-sub">Requisito: ${lvl.minXp.toLocaleString('pt-BR')} XP</div>
                            </div>
                        </div>
                        <div>${badgeHtml}</div>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('ogCardNumJogos').textContent = numJogos;
        document.getElementById('ogCardNumMidias').textContent = numMidias;
        document.getElementById('ogCardNumPlatinas').textContent = numPlatinas;

        // Média de Notas
        let somaNotas = 0;
        let countNotas = 0;
        (dados.jogos || []).forEach(j => {
            const n = parseFloat(j.minhaNota || j.nota || 0);
            if (n > 0) { somaNotas += n; countNotas++; }
        });
        const mediaFinal = countNotas > 0 ? (somaNotas / countNotas).toFixed(1) : '10.0';
        document.getElementById('ogCardNumMedia').textContent = mediaFinal;

        // Avatar
        const avatarEl = document.getElementById('ogCardAvatar');
        const userAvatar = typeof window.getUsuarioAvatarAtual === 'function'
            ? window.getUsuarioAvatarAtual()
            : (localStorage.getItem('overcritic_user_avatar') || '🎮');
        if (typeof window.renderizarAvatarHtml === 'function') {
            avatarEl.innerHTML = window.renderizarAvatarHtml(userAvatar, username.charAt(0).toUpperCase() || '🎮');
        } else {
            avatarEl.textContent = username.charAt(0).toUpperCase() || '🎮';
        }

        // Favoritos (Top 3 Melhores Avaliados)
        const favContainer = document.getElementById('ogCardFavCovers');
        favContainer.innerHTML = '';
        const combinados = [
            ...(dados.jogos || []).map(j => ({ titulo: j.titulo, capa: j.capaUrl || j.capa, nota: parseFloat(j.minhaNota || j.nota || 0) })),
            ...(dados.midias || []).map(m => ({ titulo: m.title || m.titulo, capa: m.coverUrl || m.cover_url, nota: parseFloat(m.myRating || m.nota || 0) }))
        ].sort((a, b) => b.nota - a.nota).slice(0, 3);

        if (combinados.length > 0) {
            document.getElementById('ogCardFavSection').style.display = 'flex';
            combinados.forEach(c => {
                const item = document.createElement('div');
                item.className = 'og-card-fav-item';
                if (c.capa) {
                    item.style.backgroundImage = `url('${c.capa}')`;
                }
                item.title = `${c.titulo} (Nota ${c.nota})`;
                favContainer.appendChild(item);
            });
        } else {
            document.getElementById('ogCardFavSection').style.display = 'none';
        }

        document.getElementById('ogCardTimestamp').textContent = new Date().toLocaleDateString('pt-BR');

        overlay.classList.add('active');
        bloquearScrollFundo();
    }

    function fecharGamerCardModal() {
        const overlay = document.getElementById('ogGamerCardOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            liberarScrollFundo();
        }
    }

    /**
     * Exporta o Gamer Card como imagem PNG de alta resolução usando Canvas
     */
    function exportarGamerCardPng() {
        const dados = _dadosCardAtuais || {};
        const username = dados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const jogosArr = dados.jogos || [];
        const midiasArr = dados.midias || [];
        const platinasArr = (dados.platinas || []);
        const numJogos = jogosArr.length;
        const numMidias = midiasArr.length;
        const numPlatinas = platinasArr.length;

        const prog = calcularProgressoGamer({ jogos: jogosArr, midias: midiasArr, platinas: platinasArr });

        // Média
        let somaNotas = 0;
        let countNotas = 0;
        (dados.jogos || []).forEach(j => {
            const n = parseFloat(j.minhaNota || j.nota || 0);
            if (n > 0) { somaNotas += n; countNotas++; }
        });
        const mediaFinal = countNotas > 0 ? (somaNotas / countNotas).toFixed(1) : '10.0';

        // Cria canvas de alta resolução (1000 x 1300)
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1300;
        const ctx = canvas.getContext('2d');

        // Fundo com Gradiente Futurista
        const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1300);
        bgGrad.addColorStop(0, '#090e1a');
        bgGrad.addColorStop(0.5, '#0e162a');
        bgGrad.addColorStop(1, '#070a14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1000, 1300);

        // Brilhos radiais neon
        const r1 = ctx.createRadialGradient(250, 250, 20, 250, 250, 500);
        r1.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        r1.addColorStop(1, 'transparent');
        ctx.fillStyle = r1;
        ctx.fillRect(0, 0, 1000, 1300);

        const r2 = ctx.createRadialGradient(800, 900, 20, 800, 900, 600);
        r2.addColorStop(0, 'rgba(157, 78, 221, 0.22)');
        r2.addColorStop(1, 'transparent');
        ctx.fillStyle = r2;
        ctx.fillRect(0, 0, 1000, 1300);

        // Borda externa neon
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 8;
        ctx.strokeRect(30, 30, 940, 1240);

        ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(45, 45, 910, 1210);

        // Header: Logo e Badge
        ctx.fillStyle = '#00f0ff';
        ctx.font = '900 36px "Inter", sans-serif';
        ctx.fillText('🎮 OVERCRITIC', 80, 110);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '700 20px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('OFFICIAL GAMER CARD', 920, 110);
        ctx.textAlign = 'left';

        // Linha divisória
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 140);
        ctx.lineTo(920, 140);
        ctx.stroke();

        // Avatar Circle
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(160, 250, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 60px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(username.charAt(0).toUpperCase() || '🎮', 160, 272);
        ctx.textAlign = 'left';

        // Nome do Usuário
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 52px "Inter", sans-serif';
        ctx.fillText(username, 260, 235);

        // Patente e Nível
        ctx.fillStyle = prog.cor;
        ctx.font = '800 30px "Inter", sans-serif';
        ctx.fillText(`${prog.icone} Nível ${prog.nivel} • ${prog.titulo}`, 260, 280);

        // Barra de Progresso XP
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 22px "Inter", sans-serif';
        ctx.fillText(`EXPERIÊNCIA GAMER: ${prog.xpTotal.toLocaleString('pt-BR')} XP (${prog.porcentagem}%)`, 80, 385);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(80, 400, 840, 18, 9);
        ctx.fill();

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.roundRect(80, 400, Math.max(30, 840 * (prog.porcentagem / 100)), 18, 9);
        ctx.fill();

        // Próximo Ranking & Meta
        if (prog.proximoNivel) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '800 19px "Inter", sans-serif';
            ctx.fillText(`🎯 PRÓXIMO: ${prog.proximoNivel.icone} ${prog.proximoNivel.titulo.toUpperCase()} (NV. ${prog.proximoNivel.nivel}) • FALTAM ${prog.xpRestante.toLocaleString('pt-BR')} XP`, 80, 450);
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.font = '800 19px "Inter", sans-serif';
            ctx.fillText(`🔥 PATENTE SUPREMA CONQUISTADA: NÍVEL MÁXIMO (LENDA DO OVERCRITIC)`, 80, 450);
        }

        // 4 Caixas de Estatísticas
        const stats = [
            { label: 'JOGOS AVALIADOS', val: numJogos, cor: '#ffffff', icone: '🎮' },
            { label: 'FILMES & SÉRIES', val: numMidias, cor: '#ffffff', icone: '🎬' },
            { label: 'PLATINAS (100%)', val: numPlatinas, cor: '#ffd700', icone: '🏆' },
            { label: 'MÉDIA GERAL', val: mediaFinal, cor: '#00f0ff', icone: '⭐' }
        ];

        stats.forEach((s, idx) => {
            const x = 80 + (idx * 218);
            const y = 480;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.beginPath();
            ctx.roundRect(x, y, 200, 170, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = '36px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(s.icone, x + 100, y + 55);

            ctx.fillStyle = s.cor;
            ctx.font = '900 44px "Inter", sans-serif';
            ctx.fillText(String(s.val), x + 100, y + 115);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '800 15px "Inter", sans-serif';
            ctx.fillText(s.label, x + 100, y + 148);
        });
        ctx.textAlign = 'left';

        // Selo de Autenticidade e Carimbo
        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(80, 700, 840, 420, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.font = '900 24px "Inter", sans-serif';
        ctx.fillText('🛡️ CERTIFICADO DE AUTENTICIDADE OVERCRITIC', 110, 750);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '500 22px "Inter", sans-serif';
        ctx.fillText(`Este Gamer Card certifica as avaliações técnicas e o progresso`, 110, 805);
        ctx.fillText(`registrado por ${username} na comunidade geek & gamer Overcritic.`, 110, 845);

        ctx.fillStyle = '#ffd166';
        ctx.font = '800 25px "Inter", sans-serif';
        ctx.fillText(`Status Atual: ${prog.icone} ${prog.titulo} (Nível ${prog.nivel})`, 110, 915);

        if (prog.proximoNivel) {
            ctx.fillStyle = '#00f0ff';
            ctx.font = '700 21px "Inter", sans-serif';
            ctx.fillText(`Meta Gamer: Faltam ${prog.xpRestante.toLocaleString('pt-BR')} XP para alcançar ${prog.proximoNivel.icone} ${prog.proximoNivel.titulo} (Nv. ${prog.proximoNivel.nivel})`, 110, 960);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 18px "Inter", sans-serif';
            ctx.fillText(`Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • overcritic.com`, 110, 1010);
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.font = '700 21px "Inter", sans-serif';
            ctx.fillText(`Meta Gamer: Patente Suprema 100% Conquistada na Temporada!`, 110, 960);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 18px "Inter", sans-serif';
            ctx.fillText(`Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} • overcritic.com`, 110, 1010);
        }

        ctx.fillText(`Portal Oficial: https://pontug.github.io/OVERCRITIC`, 110, 1050);

        // Rodapé Final
        ctx.fillStyle = '#64748b';
        ctx.font = '700 20px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OVERCRITIC • SEU PORTAL DIÁRIO DE JOGOS, FILMES & PLATINAS', 500, 1220);

        // Trigger Download
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `overcritic-card-${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
            if (window.showToast) window.showToast.success('Gamer Card baixado com sucesso!');
        } catch (e) {
            console.error('Erro ao exportar canvas:', e);
            if (window.showToast) window.showToast.error('Não foi possível gerar a imagem automaticamente.');
        }
    }

    /* ════════════════════════════════════════════════════════
       4. CRIADOR INTERATIVO DE TIER LIST PESSOAL
    ════════════════════════════════════════════════════════ */
    function garantirModalTierList() {
        injetarEstilosGamificacao();
        let overlay = document.getElementById('ogTierListOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogTierListOverlay';
        overlay.className = 'og-modal-overlay';
        overlay.innerHTML = `
            <div class="og-tier-modal">
                <div class="og-tier-header">
                    <div class="og-tier-title-wrap">
                        <div class="og-tier-title">
                            <span>🎯</span> Minha Tier List Pessoal
                        </div>
                    </div>
                    <div class="og-tier-header-actions">
                        <button class="og-modal-btn" id="ogBtnResetTier" title="Mover todas as obras de volta para a coleção" style="padding: 7px 12px; font-size: 0.8rem; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5;">
                            <span>🔄</span> Limpar
                        </button>
                        <button class="og-modal-btn og-btn-download" id="ogBtnExportTierPng" style="padding: 7px 14px; font-size: 0.82rem;">
                            <span>📸</span> Exportar Imagem
                        </button>
                        <button class="gp-close-btn" id="ogBtnCloseTier" title="Fechar (Esc)">✕</button>
                    </div>
                </div>

                <div class="og-tier-body">
                    <div class="og-tier-board" id="ogTierBoard">
                        <div class="og-tier-row" data-tier="S">
                            <div class="og-tier-label og-tier-s">
                                <span class="og-tier-label-letter">S</span>
                                <span class="og-tier-label-desc">Obra-Prima</span>
                            </div>
                            <div class="og-tier-dropzone" data-dropzone="S"></div>
                        </div>

                        <div class="og-tier-row" data-tier="A">
                            <div class="og-tier-label og-tier-a">
                                <span class="og-tier-label-letter">A</span>
                                <span class="og-tier-label-desc">Excelente</span>
                            </div>
                            <div class="og-tier-dropzone" data-dropzone="A"></div>
                        </div>

                        <div class="og-tier-row" data-tier="B">
                            <div class="og-tier-label og-tier-b">
                                <span class="og-tier-label-letter">B</span>
                                <span class="og-tier-label-desc">Muito Bom</span>
                            </div>
                            <div class="og-tier-dropzone" data-dropzone="B"></div>
                        </div>

                        <div class="og-tier-row" data-tier="C">
                            <div class="og-tier-label og-tier-c">
                                <span class="og-tier-label-letter">C</span>
                                <span class="og-tier-label-desc">Mediano</span>
                            </div>
                            <div class="og-tier-dropzone" data-dropzone="C"></div>
                        </div>

                        <div class="og-tier-row" data-tier="D">
                            <div class="og-tier-label og-tier-d">
                                <span class="og-tier-label-letter">D</span>
                                <span class="og-tier-label-desc">Esquecível</span>
                            </div>
                            <div class="og-tier-dropzone" data-dropzone="D"></div>
                        </div>
                    </div>

                    <div class="og-tier-pool-wrap">
                        <div class="og-tier-pool-header">
                            <div class="og-tier-pool-title">
                                <span>📦 Coleção</span>
                                <span style="font-size:0.75rem; font-weight:600; color:var(--text-muted);" id="ogTierCountPool">0 obras</span>
                            </div>
                            <div class="og-tier-pool-filters" id="ogTierPoolFilters">
                                <button type="button" class="og-pool-filter-btn active" data-filter="todas">Todas</button>
                                <button type="button" class="og-pool-filter-btn" data-filter="jogo">🎮 Jogos</button>
                                <button type="button" class="og-pool-filter-btn" data-filter="midia">🎬 Filmes/Séries</button>
                            </div>
                        </div>
                        <div class="og-tier-pool" id="ogTierPool">
                            <div style="color:var(--text-muted); font-size:0.85rem; padding:10px;">Carregando suas obras...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModalTierList();
        });
        document.getElementById('ogBtnCloseTier').addEventListener('click', fecharModalTierList);
        document.getElementById('ogBtnExportTierPng').addEventListener('click', exportarTierListPng);

        // Botão de Redefinir / Limpar Tier List
        const btnResetTier = document.getElementById('ogBtnResetTier');
        if (btnResetTier) {
            btnResetTier.addEventListener('click', () => {
                if (confirm('Deseja retornar todas as obras da Tier List para a coleção?')) {
                    _tierState = { S: [], A: [], B: [], C: [], D: [] };
                    salvarEstadoTierList();
                    renderizarTierListCompleta();
                    if (window.showToast) window.showToast.info('Tier List limpa com sucesso!');
                }
            });
        }

        // Filtros de tipo de obra no Pool (Jogos / Filmes / Todas)
        const filterBtns = overlay.querySelectorAll('.og-pool-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                _filtroPoolTier = btn.dataset.filter || 'todas';
                renderizarTierListCompleta();
            });
        });

        configurarDragAndDropTier();

        return overlay;
    }

    let _dadosTierUsuario = null;
    let _tierState = { S: [], A: [], B: [], C: [], D: [] };
    let _filtroPoolTier = 'todas';

    function abrirModalTierList(dados = {}) {
        const overlay = garantirModalTierList();

        // Sempre busca consolidação completa para garantir que todas as obras reais apareçam
        const consolidados = obterDadosConsolidadosUsuario(dados?.username, dados?.userId);
        
        let jogos = (dados && Array.isArray(dados.jogos) && dados.jogos.length > 0) ? dados.jogos : consolidados.jogos;
        let midias = (dados && Array.isArray(dados.midias) && dados.midias.length > 0) ? dados.midias : consolidados.midias;
        let platinas = (dados && Array.isArray(dados.platinas) && dados.platinas.length > 0) ? dados.platinas : consolidados.platinas;

        if (consolidados.jogos.length > jogos.length) jogos = consolidados.jogos;
        if (consolidados.midias.length > midias.length) midias = consolidados.midias;
        if (consolidados.platinas.length > platinas.length) platinas = consolidados.platinas;

        const username = dados?.username || consolidados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const uid = dados?.userId || consolidados.userId || localStorage.getItem('overcritic_user_id') || '';

        dados = {
            username,
            userId: uid,
            jogos,
            midias,
            platinas
        };

        _dadosTierUsuario = dados;

        const storageKey = `overcritic_tierlist_${username.toLowerCase()}`;

        try {
            const salvo = localStorage.getItem(storageKey);
            if (salvo) {
                _tierState = JSON.parse(salvo);
            } else {
                _tierState = { S: [], A: [], B: [], C: [], D: [] };
            }
        } catch(e) {
            _tierState = { S: [], A: [], B: [], C: [], D: [] };
        }

        renderizarTierListCompleta();
        overlay.classList.add('active');
        bloquearScrollFundo();
    }

    function fecharModalTierList() {
        const overlay = document.getElementById('ogTierListOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            liberarScrollFundo();
        }
        removerMenuTouch();
    }

    function salvarEstadoTierList() {
        const username = (_dadosTierUsuario && _dadosTierUsuario.username) || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const storageKey = `overcritic_tierlist_${username.toLowerCase()}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(_tierState));
        } catch(e) {}
    }

    function renderizarTierListCompleta() {
        const poolEl = document.getElementById('ogTierPool');
        if (!poolEl) return;

        // Limpa todas as dropzones
        ['S', 'A', 'B', 'C', 'D'].forEach(tier => {
            const dz = document.querySelector(`.og-tier-dropzone[data-dropzone="${tier}"]`);
            if (dz) dz.innerHTML = '';
        });

        // Consolida lista de todas as obras avaliadas
        const jogos = (_dadosTierUsuario && _dadosTierUsuario.jogos) || [];
        const midias = (_dadosTierUsuario && _dadosTierUsuario.midias) || [];

        const todasObras = [
            ...jogos.map(j => ({ id: `j_${j.id || j.titulo}`, titulo: j.titulo, capa: j.capaUrl || j.capa, nota: j.minhaNota || j.nota || '10', tipo: 'jogo' })),
            ...midias.map(m => ({ id: `m_${m.id || m.title || m.titulo}`, titulo: m.title || m.titulo, capa: m.coverUrl || m.cover_url, nota: m.myRating || m.nota || '8', tipo: 'midia' }))
        ];

        // Mapeia obras já posicionadas nas tiers
        const idsAlocados = new Set();
        ['S', 'A', 'B', 'C', 'D'].forEach(tier => {
            const idsNoTier = _tierState[tier] || [];
            const dz = document.querySelector(`.og-tier-dropzone[data-dropzone="${tier}"]`);
            if (!dz) return;

            idsNoTier.forEach(id => {
                const obra = todasObras.find(o => o.id === id);
                if (obra) {
                    idsAlocados.add(obra.id);
                    dz.appendChild(criarCardItemTier(obra, tier));
                }
            });
        });

        // Renderiza não alocados no pool (com suporte a filtro)
        poolEl.innerHTML = '';
        const naoAlocados = todasObras.filter(o => !idsAlocados.has(o.id));
        
        let paraExibir = naoAlocados;
        if (_filtroPoolTier === 'jogo') {
            paraExibir = naoAlocados.filter(o => o.tipo === 'jogo');
        } else if (_filtroPoolTier === 'midia') {
            paraExibir = naoAlocados.filter(o => o.tipo === 'midia');
        }

        const countPoolEl = document.getElementById('ogTierCountPool');
        if (countPoolEl) {
            countPoolEl.textContent = _filtroPoolTier === 'todas'
                ? `${naoAlocados.length} disponíveis`
                : `${paraExibir.length} de ${naoAlocados.length} disponíveis`;
        }

        if (naoAlocados.length === 0) {
            poolEl.innerHTML = `<div style="color:var(--text-muted); font-size:0.82rem; padding:10px;">Todas as suas obras foram posicionadas na Tier List! 🏆</div>`;
        } else if (paraExibir.length === 0) {
            poolEl.innerHTML = `<div style="color:var(--text-muted); font-size:0.82rem; padding:10px;">Nenhuma obra deste tipo restante na coleção.</div>`;
        } else {
            paraExibir.forEach(obra => {
                poolEl.appendChild(criarCardItemTier(obra, 'pool'));
            });
        }
    }

    function criarCardItemTier(obra, localAtual = 'pool') {
        const item = document.createElement('div');
        item.className = 'og-tier-item';
        item.draggable = true;
        item.dataset.id = obra.id;
        item.dataset.title = obra.titulo;
        item.dataset.tier = localAtual;

        const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="130" viewBox="0 0 100 130"><rect width="100" height="130" fill="#111726"/><text x="50%" y="45%" text-anchor="middle" font-size="28">🎮</text><text x="50%" y="75%" text-anchor="middle" fill="#00f0ff" font-family="sans-serif" font-weight="bold" font-size="10">' + (obra.titulo || '').substring(0, 10) + '</text></svg>')}`;
        const capaFinal = obra.capa || fallbackSvg;

        item.style.backgroundImage = `url('${capaFinal}')`;
        item.title = `${obra.titulo} (Nota ${obra.nota}) • Toque para mover`;

        item.innerHTML = `<span class="og-tier-item-rating">⭐ ${obra.nota}</span>`;

        // Eventos Drag Desktop
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', obra.id);
            item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });

        // Evento Touch Mobile (Abre mini seletor para tocar e escolher o Tier)
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirMenuTouchTier(obra, item);
        });

        return item;
    }

    function configurarDragAndDropTier() {
        const dropzones = document.querySelectorAll('.og-tier-dropzone, #ogTierPool');
        dropzones.forEach(dz => {
            dz.addEventListener('dragover', (e) => {
                e.preventDefault();
                dz.classList.add('dragover');
            });
            dz.addEventListener('dragleave', () => {
                dz.classList.remove('dragover');
            });
            dz.addEventListener('drop', (e) => {
                e.preventDefault();
                dz.classList.remove('dragover');
                const obraId = e.dataTransfer.getData('text/plain');
                if (!obraId) return;

                const destino = dz.dataset.dropzone || 'pool';
                moverObraParaTier(obraId, destino);
            });
        });
    }

    function moverObraParaTier(obraId, tierDestino) {
        // Remove de qualquer tier anterior
        ['S', 'A', 'B', 'C', 'D'].forEach(t => {
            _tierState[t] = (_tierState[t] || []).filter(id => id !== obraId);
        });

        if (tierDestino && tierDestino !== 'pool' && ['S', 'A', 'B', 'C', 'D'].includes(tierDestino)) {
            _tierState[tierDestino].push(obraId);
        }

        salvarEstadoTierList();
        renderizarTierListCompleta();
        removerMenuTouch();
    }

    function abrirMenuTouchTier(obra, itemElement) {
        removerMenuTouch();

        const menu = document.createElement('div');
        menu.id = 'ogTouchMenuTier';
        menu.className = 'og-touch-menu';
        menu.innerHTML = `
            <span style="color:#fff; font-size:0.8rem; font-weight:800; max-width:110px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${obra.titulo}:
            </span>
            <button class="og-touch-btn og-tier-s" onclick="window.moverTierDirect('${obra.id}', 'S')">S</button>
            <button class="og-touch-btn og-tier-a" onclick="window.moverTierDirect('${obra.id}', 'A')">A</button>
            <button class="og-touch-btn og-tier-b" onclick="window.moverTierDirect('${obra.id}', 'B')">B</button>
            <button class="og-touch-btn og-tier-c" onclick="window.moverTierDirect('${obra.id}', 'C')">C</button>
            <button class="og-touch-btn og-tier-d" onclick="window.moverTierDirect('${obra.id}', 'D')">D</button>
            <button class="og-touch-btn" style="background:#ef4444; color:#fff;" onclick="window.moverTierDirect('${obra.id}', 'pool')">✕</button>
        `;

        document.body.appendChild(menu);

        setTimeout(() => {
            const fecharMenu = (ev) => {
                if (!menu.contains(ev.target) && ev.target !== itemElement) {
                    removerMenuTouch();
                    document.removeEventListener('click', fecharMenu);
                }
            };
            document.addEventListener('click', fecharMenu);
        }, 100);
    }

    function removerMenuTouch() {
        const m = document.getElementById('ogTouchMenuTier');
        if (m) m.remove();
    }

    window.moverTierDirect = function (obraId, tier) {
        moverObraParaTier(obraId, tier);
    };

    /**
     * Exporta a Tier List montada como imagem PNG de alta resolução
     */
    function exportarTierListPng() {
        const username = (_dadosTierUsuario && _dadosTierUsuario.username) || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Fundo Escuro Gamer
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, 1200, 800);

        // Header
        ctx.fillStyle = '#00f0ff';
        ctx.font = '900 34px "Inter", sans-serif';
        ctx.fillText(`🎯 OVERCRITIC TIER LIST • ${username.toUpperCase()}`, 50, 60);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 18px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toLocaleDateString('pt-BR'), 1150, 60);
        ctx.textAlign = 'left';

        // Tiers
        const tiersInfo = [
            { id: 'S', letra: 'S', desc: 'OBRA-PRIMA', cor: '#ff4757' },
            { id: 'A', letra: 'A', desc: 'EXCELENTE', cor: '#ffa502' },
            { id: 'B', letra: 'B', desc: 'MUITO BOM', cor: '#eccc68' },
            { id: 'C', letra: 'C', desc: 'MEDIANO', cor: '#2ed573' },
            { id: 'D', letra: 'D', desc: 'ESQUECÍVEL', cor: '#70a1ff' }
        ];

        let startY = 90;
        const rowHeight = 125;

        tiersInfo.forEach((t) => {
            // Label box
            ctx.fillStyle = t.cor;
            ctx.fillRect(50, startY, 130, rowHeight);

            ctx.fillStyle = '#07090f';
            ctx.font = '900 52px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(t.letra, 115, startY + 68);

            ctx.font = '800 13px "Inter", sans-serif';
            ctx.fillText(t.desc, 115, startY + 100);
            ctx.textAlign = 'left';

            // Drop area background
            ctx.fillStyle = '#111726';
            ctx.fillRect(182, startY, 968, rowHeight);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.strokeRect(182, startY, 968, rowHeight);

            // Itens no Tier (Texto legível e limpo)
            const ids = _tierState[t.id] || [];
            let itemX = 195;
            ids.forEach((id, idx) => {
                if (idx < 10) { // Mostra até 10 obras por linha
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                    ctx.beginPath();
                    ctx.roundRect(itemX, startY + 12, 85, 100, 8);
                    ctx.fill();
                    ctx.strokeStyle = t.cor;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Pega o nome abreviado
                    const itemEl = document.querySelector(`.og-tier-item[data-id="${id}"]`);
                    const title = itemEl ? (itemEl.dataset.title || 'Obra') : 'Obra';

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '700 11px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(title.substring(0, 10), itemX + 42, startY + 62);
                    ctx.textAlign = 'left';

                    itemX += 95;
                }
            });

            startY += rowHeight + 10;
        });

        // Rodapé
        ctx.fillStyle = '#64748b';
        ctx.font = '700 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Crie sua Tier List oficial em pontug.github.io/OVERCRITIC', 600, 775);

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `overcritic-tierlist-${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
            if (window.showToast) window.showToast.success('Tier List salva com sucesso!');
        } catch(e) {
            console.error('Erro ao exportar Tier List canvas:', e);
            if (window.showToast) window.showToast.error('Não foi possível salvar a imagem.');
        }
    }

    /* ════════════════════════════════════════════════════════
       5. VINCULAÇÃO UNIVERSAL DE DADOS LEGADOS & ÓRFÃOS
       Garante que análises clássicas, avaliações rápidas e platinas
       registradas antes do sistema de autenticação sejam retroativamente
       vinculadas à conta do usuário (especialmente do Administrador).
    ════════════════════════════════════════════════════════ */
    function vincularDadosLegadosUsuario(customUsername, customUid) {
        // Na nova temporada, não restaura dados legados para manter o estado zerado
        return { alterou: false, jogos: [], midias: [], platinas: [] };
    }
    function _vincularDadosLegadosDesativado(customUsername, customUid) {

        const usernameLower = username.toLowerCase();
        const isAdmin = (window.isAdminUser && window.isAdminUser())
            || email === 'mesquitagabriel255@gmail.com'
            || usernameLower === 'pontug'
            || usernameLower === 'admin'
            || localStorage.getItem('overcritic_is_admin') === 'true';

        const effectiveUid = uid || (isAdmin ? '958a1b5f-4151-42c7-97f2-caf0e59fbb86' : '');
        if (effectiveUid && !localStorage.getItem('overcritic_user_id')) {
            localStorage.setItem('overcritic_user_id', effectiveUid);
        }

        let alterouGeral = false;

        // 1. RECONCILIAÇÃO DE JOGOS & ANÁLISES (Unifica todas as fontes locais)
        let rawJogosAll = [];
        ['overcritic_reviews', 'overcritic_jogos', 'overclock_jogos'].forEach(k => {
            try {
                const arr = JSON.parse(localStorage.getItem(k) || '[]');
                if (Array.isArray(arr)) rawJogosAll.push(...arr);
            } catch(e) {}
        });

        const mapJogos = new Map();
        const fakeReviewIds = [1789741152346, 1789742639992, 1789743477104];
        rawJogosAll.forEach(j => {
            if (!j || !j.titulo) return;
            const idNum = Number(j.id);
            const isSeed = idNum && (idNum === 101 || idNum === 102 || idNum === 103 || idNum === 104 || idNum === 105 || String(j.id).startsWith('feed_seed_'));
            if (isSeed || fakeReviewIds.includes(idNum)) return;
            const key = j.titulo.trim().toLowerCase();
            if (!mapJogos.has(key)) {
                mapJogos.set(key, j);
            }
        });

        const jogosExistentes = Array.from(mapJogos.values());

        // Atualiza vínculo (userId e autor) nos jogos existentes
        jogosExistentes.forEach(j => {
            if (!j) return;
            const jAutor = (j.autor || '').trim().toLowerCase();
            const eDoUsuario = jAutor === usernameLower || (isAdmin && ['admin', 'administrador', 'adm', 'pontug', 'anônimo', 'anonimo', 'visitante'].includes(jAutor));
            if (eDoUsuario) {
                if (effectiveUid && (!j.userId || !j.user_id)) {
                    j.userId = effectiveUid;
                    j.user_id = effectiveUid;
                    alterouGeral = true;
                }
                if (jAutor !== usernameLower && (isAdmin || ['admin', 'anônimo', 'anonimo', 'visitante'].includes(jAutor))) {
                    j.autor = username;
                    alterouGeral = true;
                }
            }
        });

        localStorage.setItem('overcritic_reviews', JSON.stringify(jogosExistentes));
        localStorage.setItem('overcritic_jogos', JSON.stringify(jogosExistentes));

        // 2. RECONCILIAÇÃO DE PLATINAS (Unifica todas as coleções locais)
        let rawPlatinasAll = [];
        ['overcritic_minhas_platinas', 'overcritic_platinas_feed', 'overcritic_platinas', 'overclock_platinas', 'platinasSalvas'].forEach(k => {
            try {
                const arr = JSON.parse(localStorage.getItem(k) || '[]');
                if (Array.isArray(arr)) rawPlatinasAll.push(...arr);
            } catch(e) {}
        });

        let alterouPlat = false;
        const mapMinhasP = new Map();
        const mapFeedP = new Map();

        rawPlatinasAll.forEach(p => {
            if (!p || !p.title && !p.titulo) return;
            const k = (p.title || p.titulo).trim().toLowerCase();
            const pUser = (p.user || p.usuario || '').trim().toLowerCase();
            const isSeed = p.id && String(p.id).startsWith('plat_seed_');

            const eDoUsuario = pUser === usernameLower 
                || (isAdmin && ['admin', 'administrador', 'adm', 'pontug', 'anônimo', 'anonimo', 'visitante'].includes(pUser)) 
                || (effectiveUid && (p.userId === effectiveUid || p.user_id === effectiveUid));

            if (eDoUsuario && !isSeed) {
                if (effectiveUid && (!p.userId || !p.user_id)) {
                    p.userId = effectiveUid;
                    p.user_id = effectiveUid;
                    alterouPlat = true;
                }
                if (pUser !== usernameLower) {
                    p.user = username;
                    p.usuario = username;
                    alterouPlat = true;
                }
                if (!mapMinhasP.has(k)) mapMinhasP.set(k, p);
            }

            if (!mapFeedP.has(k)) mapFeedP.set(k, p);
        });

        const minhasPlatinas = Array.from(mapMinhasP.values());
        const platinasFeed = Array.from(mapFeedP.values());

        if (minhasPlatinas.length > 0) {
            localStorage.setItem('overcritic_minhas_platinas', JSON.stringify(minhasPlatinas));
        }
        if (platinasFeed.length > 0) {
            localStorage.setItem('overcritic_platinas_feed', JSON.stringify(platinasFeed));
            localStorage.setItem('overcritic_platinas', JSON.stringify(platinasFeed));
        }

        // 3. RECONCILIAÇÃO DE MÍDIAS (Filmes / Séries)
        let midiasExistentes = [];
        try {
            const rawM = localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]';
            midiasExistentes = JSON.parse(rawM);
            if (!Array.isArray(midiasExistentes)) midiasExistentes = [];
        } catch(e) { midiasExistentes = []; }

        let alterouMidias = false;
        midiasExistentes.forEach(m => {
            if (!m) return;
            const mAutor = (m.autor || '').trim().toLowerCase();
            const eDoUsuario = mAutor === usernameLower || (isAdmin && ['admin', 'administrador', 'adm', 'pontug', 'anônimo', 'anonimo', 'visitante'].includes(mAutor));
            if (eDoUsuario) {
                if (effectiveUid && (!m.userId || !m.user_id)) {
                    m.userId = effectiveUid;
                    m.user_id = effectiveUid;
                    alterouMidias = true;
                }
                if (mAutor !== usernameLower && (isAdmin || ['admin', 'anônimo', 'anonimo', 'visitante'].includes(mAutor))) {
                    m.autor = username;
                    alterouMidias = true;
                }
            }
        });

        if (alterouMidias) {
            localStorage.setItem('OVERCRITIC_MIDIAS', JSON.stringify(midiasExistentes));
            localStorage.setItem('overcritic_midias', JSON.stringify(midiasExistentes));
        }

        return {
            alterou: alterouGeral || alterouPlat || alterouMidias,
            jogos: jogosExistentes.filter(j => (j.autor || '').toLowerCase() === usernameLower || j.userId === effectiveUid),
            midias: midiasExistentes.filter(m => (m.autor || '').toLowerCase() === usernameLower || m.userId === effectiveUid),
            platinas: minhasPlatinas
        };
    }

    /**
     * Sincronização Bidirecional Completa (Nuvem Supabase <-> LocalStorage)
     * Garante que análises, platinas e mídias sejam mescladas com segurança,
     * persistidas na nuvem e no armazenamento local sem nunca perder dados.
     */
    async function sincronizarDadosCompletosUsuario(customUsername, customUid) {
        const username = (customUsername || localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || 'Jogador').trim();
        const uid = (customUid || localStorage.getItem('overcritic_user_id') || '').trim();

        // 1. Vinculação local prévia
        vincularDadosLegadosUsuario(username, uid);

        const usernameLower = username.toLowerCase();
        const email = (localStorage.getItem('overcritic_user_email') || '').trim().toLowerCase();
        const isAdmin = (window.isAdminUser && window.isAdminUser())
            || email === 'mesquitagabriel255@gmail.com'
            || usernameLower === 'pontug'
            || usernameLower === 'admin'
            || localStorage.getItem('overcritic_is_admin') === 'true';

        const effectiveUid = uid || (isAdmin ? '958a1b5f-4151-42c7-97f2-caf0e59fbb86' : '');

        // 2. Se o Supabase estiver disponível, faz o merge bidirecional
        if (window.sbClient) {
            try {
                // Temporada ativa: garante que o flag de reset esteja concluído para proteger novos cadastros
                const CLOUD_SEASON_RESET_KEY = 'overcritic_cloud_season_reset_v26_10_7';
                try { localStorage.setItem(CLOUD_SEASON_RESET_KEY, 'concluido'); } catch(e) {}

                // A) JOGOS: Upload local prévio e Download da nuvem
                let localJ = [];
                const fakeReviewIds = [1789741152346, 1789742639992, 1789743477104];
                try {
                    const rawJ = localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]';
                    const parsedJ = JSON.parse(rawJ);
                    if (Array.isArray(parsedJ)) {
                        localJ = parsedJ.filter(j => {
                            if (!j || !j.titulo) return false;
                            const idNum = Number(j.id);
                            if (idNum >= 101 && idNum <= 105) return false;
                            if (fakeReviewIds.includes(idNum)) return false;
                            return true;
                        });
                    }
                } catch(e) { localJ = []; }

                let qJogos = window.sbClient.from('reviews_jogos').select('*');
                if (effectiveUid) {
                    qJogos = qJogos.or(`user_id.eq.${effectiveUid},autor.ilike.${username}`);
                } else {
                    qJogos = qJogos.ilike('autor', username);
                }
                const { data: nuvemJogos } = await qJogos;

                // A) JOGOS: Sincronização segura sem deletar o acervo de outros membros
                let reviewsAtuais = [];
                try {
                    reviewsAtuais = JSON.parse(localStorage.getItem('overcritic_reviews') || '[]') || [];
                    if (!Array.isArray(reviewsAtuais)) reviewsAtuais = [];
                } catch(e) { reviewsAtuais = []; }

                // Mantém os jogos de outros autores intactos
                const mapaJ = new Map();
                reviewsAtuais.forEach(j => {
                    if (!j || !j.titulo) return;
                    const dono = (j.autor || '').toLowerCase();
                    const eDeste = dono === usernameLower || (effectiveUid && (j.userId === effectiveUid || j.user_id === effectiveUid));
                    if (!eDeste) {
                        mapaJ.set(j.titulo.trim().toLowerCase(), j);
                    }
                });

                if (Array.isArray(nuvemJogos)) {
                    nuvemJogos.forEach(row => {
                        const idNum = Number(row.id);
                        if (fakeReviewIds.includes(idNum) || (idNum >= 101 && idNum <= 105)) return;
                        const item = {
                            id: idNum,
                            userId: row.user_id,
                            autor: row.autor,
                            titulo: row.titulo,
                            generos: row.generos,
                            palavrasChave: row.palavras_chave,
                            mediaInternet: row.media_internet,
                            plataforma: row.plataforma,
                            minhaNota: String(row.minha_nota),
                            status: row.status,
                            review: row.review,
                            capaUrl: row.capa_url,
                            dataRegistro: row.data_registro,
                            likes: Array.isArray(row.likes) ? row.likes : [],
                            comments: Array.isArray(row.comments) ? row.comments : []
                        };
                        mapaJ.set(item.titulo.trim().toLowerCase(), item);
                    });
                }

                const consolidadaJ = Array.from(mapaJ.values());
                localStorage.setItem('overcritic_reviews', JSON.stringify(consolidadaJ));
                localStorage.setItem('overcritic_jogos', JSON.stringify(consolidadaJ));
                localStorage.setItem('overclock_jogos', JSON.stringify(consolidadaJ));

                // B) PLATINAS: Nuvem é a fonte oficial da temporada
                let qPlat = window.sbClient.from('platinas').select('*');
                if (effectiveUid) {
                    qPlat = qPlat.or(`user_id.eq.${effectiveUid},usuario.ilike.${username}`);
                } else {
                    qPlat = qPlat.ilike('usuario', username);
                }
                const { data: nuvemPlatinas } = await qPlat;

                const minhasPlatinasUsuario = [];
                if (Array.isArray(nuvemPlatinas)) {
                    nuvemPlatinas.forEach(row => {
                        const plat = {
                            id: row.id,
                            userId: row.user_id,
                            user: row.usuario,
                            title: row.titulo,
                            platform: row.plataforma,
                            difficulty: row.dificuldade,
                            difficultyCategory: (row.dificuldade || '').toLowerCase().includes('fácil') || (row.dificuldade || '').toLowerCase().includes('tranquila') ? 'facil' : ((row.dificuldade || '').toLowerCase().includes('difícil') ? 'dificil' : ((row.dificuldade || '').toLowerCase().includes('lendária') || (row.dificuldade || '').toLowerCase().includes('insana') ? 'lendaria' : 'moderada')),
                            hours: row.horas || 0,
                            progress: row.nota !== null && row.nota !== undefined ? Number(row.nota) : 100,
                            trophiesCount: '100% Conquistado',
                            notes: row.relato || '',
                            cover: row.cover_url,
                            date: row.data_conquista,
                            badges: Array.isArray(row.badges) ? row.badges : []
                        };
                        minhasPlatinasUsuario.push(plat);
                    });
                }

                // Minhas platinas pessoais (exclusivas do usuário logado)
                localStorage.setItem('overcritic_minhas_platinas', JSON.stringify(minhasPlatinasUsuario));

                // Feed e repositório global de platinas: Mantém platinas de outros usuários intactas!
                let platinasGlobais = [];
                try {
                    platinasGlobais = JSON.parse(localStorage.getItem('overcritic_platinas') || '[]') || [];
                    if (!Array.isArray(platinasGlobais)) platinasGlobais = [];
                } catch(e) { platinasGlobais = []; }

                const mapaPlat = new Map();
                platinasGlobais.forEach(p => {
                    if (!p || (!p.title && !p.titulo)) return;
                    const dono = (p.user || p.usuario || '').toLowerCase();
                    const eDeste = dono === usernameLower || (effectiveUid && (p.userId === effectiveUid || p.user_id === effectiveUid));
                    if (!eDeste) {
                        const k = (p.title || p.titulo).trim().toLowerCase() + '___' + dono;
                        mapaPlat.set(k, p);
                    }
                });
                minhasPlatinasUsuario.forEach(p => {
                    const k = (p.title || p.titulo).trim().toLowerCase() + '___' + (p.user || p.usuario || '').trim().toLowerCase();
                    mapaPlat.set(k, p);
                });

                const consolidadaP = Array.from(mapaPlat.values());
                localStorage.setItem('overcritic_platinas_feed', JSON.stringify(consolidadaP));
                localStorage.setItem('overcritic_platinas', JSON.stringify(consolidadaP));
                localStorage.setItem('overclock_platinas', JSON.stringify(consolidadaP));
                localStorage.setItem('platinasSalvas', JSON.stringify(consolidadaP));
            } catch(err) {
                console.warn('⚠️ [Gamificação] Aviso na sincronização bidirecional Supabase:', err);
            }
        }

        return obterDadosConsolidadosUsuario(username, effectiveUid);
    }

    /**
     * Retorna os dados consolidados do usuário para uso imediato
     * no Gamer Card, Tier List, Níveis e Estatísticas do Perfil.
     */
    function obterDadosConsolidadosUsuario(customUsername, customUid) {
        const username = (customUsername || localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || 'Jogador').trim();
        const uid = (customUid || localStorage.getItem('overcritic_user_id') || '').trim();

        const usernameLower = username.toLowerCase();
        const email = (localStorage.getItem('overcritic_user_email') || '').trim().toLowerCase();
        const isAdmin = (window.isAdminUser && window.isAdminUser())
            || email === 'mesquitagabriel255@gmail.com'
            || usernameLower === 'pontug'
            || usernameLower === 'admin'
            || localStorage.getItem('overcritic_is_admin') === 'true';

        const effectiveUid = uid || (isAdmin ? '958a1b5f-4151-42c7-97f2-caf0e59fbb86' : '');

        // 1. Jogos do usuário (Lê caches da nuvem e local)
        let jogos = [];
        const fakeReviewIds = [1789741152346, 1789742639992, 1789743477104];
        try {
            const rawNuvemJ = localStorage.getItem('overcritic_comunidade_jogos_nuvem') || '[]';
            const rawJ = localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]';
            const combinadosJ = [...JSON.parse(rawNuvemJ), ...JSON.parse(rawJ)];
            const mapJ = new Map();
            combinadosJ.forEach(j => {
                if (!j || !j.titulo) return;
                const idNum = Number(j.id);
                const isSeed = idNum && (idNum === 101 || idNum === 102 || idNum === 103 || idNum === 104 || idNum === 105 || String(j.id).startsWith('feed_seed_'));
                if (isSeed || fakeReviewIds.includes(idNum)) return;
                const dono = (j.autor || '').toLowerCase();
                const eDoUsuario = dono === usernameLower 
                    || (isAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                    || (effectiveUid && (j.userId === effectiveUid || j.user_id === effectiveUid));
                if (eDoUsuario) {
                    const key = j.titulo.trim().toLowerCase();
                    if (!mapJ.has(key)) mapJ.set(key, j);
                }
            });
            jogos = Array.from(mapJ.values());
        } catch(e) {}

        // 2. Mídias
        let midias = [];
        try {
            const rawNuvemM = localStorage.getItem('overcritic_comunidade_midias_nuvem') || '[]';
            const rawM = localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]';
            const combinadasM = [...JSON.parse(rawNuvemM), ...JSON.parse(rawM)];
            const mapM = new Map();
            combinadasM.forEach(m => {
                if (!m) return;
                const dono = (m.autor || '').toLowerCase();
                const eDoUsuario = dono === usernameLower 
                    || (isAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                    || (effectiveUid && (m.userId === effectiveUid || m.user_id === effectiveUid));
                if (eDoUsuario) {
                    const key = (m.titulo || '').trim().toLowerCase();
                    if (!mapM.has(key)) mapM.set(key, m);
                }
            });
            midias = Array.from(mapM.values());
        } catch(e) {}

        // 3. Platinas (Unifica nuvem comunitária, overcritic_minhas_platinas, overcritic_platinas_feed e overcritic_platinas)
        let platinas = [];
        try {
            const rawNuvemP = localStorage.getItem('overcritic_comunidade_platinas_nuvem') || '[]';
            const rawMinhas = localStorage.getItem('overcritic_minhas_platinas') || '[]';
            const rawFeed = localStorage.getItem('overcritic_platinas_feed') || '[]';
            const rawPlats = localStorage.getItem('overcritic_platinas') || '[]';
            const combinadas = [...JSON.parse(rawNuvemP), ...JSON.parse(rawMinhas), ...JSON.parse(rawFeed), ...JSON.parse(rawPlats)];
            const mapP = new Map();

            const idsExpurgados = [1790130987906, 1790131037408, 1790339420104];
            combinadas.forEach(p => {
                if (!p || (!p.title && !p.titulo)) return;
                const idNum = Number(p.id);
                if (idsExpurgados.includes(idNum)) return; // Expurgo definitivo da temporada anterior
                const dono = (p.user || p.usuario || '').toLowerCase();
                const eDoUsuario = dono === usernameLower 
                    || (isAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                    || (effectiveUid && (p.userId === effectiveUid || p.user_id === effectiveUid));

                if (eDoUsuario) {
                    const key = (p.title || p.titulo).trim().toLowerCase();
                    if (!mapP.has(key)) mapP.set(key, p);
                }
            });
            platinas = Array.from(mapP.values());
        } catch(e) {}

        const progresso = calcularProgressoGamer({
            jogos: jogos,
            midias: midias,
            platinas: platinas
        });

        return {
            username,
            userId: effectiveUid,
            jogos,
            midias,
            platinas,
            progresso
        };
    }

    /* ════════════════════════════════════════════════════════
       6. ATUALIZADOR AUTOMÁTICO DE NÍVEL NO HEADER / PERFIL
    ════════════════════════════════════════════════════════ */
    function atualizarBadgesNivelPagina() {
        injetarEstilosGamificacao();

        const currentUser = (localStorage.getItem('overcritic_currentUser') || '').trim();
        if (!currentUser || currentUser.toLowerCase() === 'visitante') return;

        const dados = obterDadosConsolidadosUsuario(currentUser);
        const prog = dados.progresso;

        // Atualiza status no header da Home (se existir elemento .header-user-status)
        const headerStatusEl = document.querySelector('.header-user-status');
        if (headerStatusEl) {
            headerStatusEl.innerHTML = `<span style="color:${prog.cor}; font-weight:800;">${prog.icone} Nv. ${prog.nivel} ${prog.titulo}</span>`;
        }

        // Atualiza badge pill se presente no DOM
        const pill = document.getElementById('profLevelBadgePill');
        if (pill) {
            pill.innerHTML = `${prog.icone} Nv. ${prog.nivel} ${prog.titulo} • ${prog.xpTotal.toLocaleString('pt-BR')} XP`;
            pill.style.color = prog.cor;
            pill.style.borderColor = prog.cor;
            pill.style.background = prog.bg;
        }
    }

    /**
     * ZERA todas as análises, platinas e rankings da plataforma,
     * PRESERVANDO rigorosamente as contas, senhas e sessões de login dos usuários.
     */
    function executarLimpezaGeralDados() {
        const chavesParaZerar = [
            'overcritic_reviews',
            'overcritic_jogos',
            'overclock_jogos',
            'overcritic_minhas_platinas',
            'overcritic_platinas_feed',
            'overcritic_platinas',
            'overclock_platinas',
            'platinasSalvas',
            'OVERCRITIC_MIDIAS',
            'overcritic_midias',
            'overcritic_avaliacoes_rapidas',
            'overcritic_deleted_records',
            'overcritic_feed'
        ];

        chavesParaZerar.forEach(key => {
            try {
                localStorage.setItem(key, '[]');
            } catch(e) {}
        });

        try {
            localStorage.setItem('overcritic_reset_season_v26_10_9', 'true');
        } catch(e) {}

        console.log('🧹 [Overcritic] Reset Geral de Análises & Platinas concluído! Contas de usuários 100% preservadas.');
    }

    // Executa automaticamente uma única vez para sincronizar o reset da temporada
    try {
        if (localStorage.getItem('overcritic_reset_season_v26_10_9') !== 'true') {
            executarLimpezaGeralDados();
        }
    } catch(e) {}

    // Inicialização ao carregar o DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', atualizarBadgesNivelPagina);
    } else {
        atualizarBadgesNivelPagina();
    }

    /* ════════════════════════════════════════════════════════
       7. RANKING GERAL DA COMUNIDADE (LÍDERES OVERCRITIC)
       Passo 4: Classificação Global dos Jogadores Cadastrados
    ════════════════════════════════════════════════════════ */
    const CHAVE_STORAGE_RANKING_MEMBROS = 'overcritic_ranking_comunidade_v26_10';

    /**
     * Registra ou atualiza um jogador na base oficial de ranking comunitário.
     * Chamado automaticamente no cadastro em conta_login.html ou ao atualizar perfil.
     */
    function registrarNovoJogadorNoRanking(dados) {
        if (!dados || !dados.username) return null;
        const username = String(dados.username).trim();
        if (!username || ['visitante', 'anônimo', 'anonimo', 'jogador'].includes(username.toLowerCase())) return null;

        let rankingLista = [];
        try {
            rankingLista = JSON.parse(localStorage.getItem(CHAVE_STORAGE_RANKING_MEMBROS) || '[]');
            if (!Array.isArray(rankingLista)) rankingLista = [];
        } catch(e) { rankingLista = []; }

        const uLower = username.toLowerCase();
        const idx = rankingLista.findIndex(u => (u.username || '').toLowerCase() === uLower);
        const agora = new Date().toISOString();

        const jogadorDados = {
            username: username,
            avatar: dados.avatar || '🎮',
            email: dados.email || '',
            role: (uLower === 'pontug' || dados.email === 'mesquitagabriel255@gmail.com') ? 'Fundador & Admin' : 'Membro da Comunidade',
            dataCadastro: dados.dataCadastro || agora,
            ultimaAtividade: agora
        };

        if (idx >= 0) {
            rankingLista[idx] = { ...rankingLista[idx], ...jogadorDados, dataCadastro: rankingLista[idx].dataCadastro || agora };
        } else {
            rankingLista.push(jogadorDados);
        }

        try {
            localStorage.setItem(CHAVE_STORAGE_RANKING_MEMBROS, JSON.stringify(rankingLista));
        } catch(e) {}

        // Dispara evento para atualização em tempo real de widgets abertos
        window.dispatchEvent(new CustomEvent('overcritic_ranking_atualizado', { detail: jogadorDados }));
        return jogadorDados;
    }

    /**
     * SINCRONIZAÇÃO EM TEMPO REAL DO RANKING GERAL COM A NUVEM SUPABASE
     * Consulta a coleção global de platinas, análises de jogos e mídias no Supabase,
     * garantindo que pontuações (XP), platinas e críticas de TODOS os membros fiquem 100%
     * idênticas e sincronizadas em qualquer computador, navegador e conta autenticada.
     */
    async function sincronizarRankingNuvem(forcar = false) {
        if (!window.sbClient) {
            return obterRankingGeralComunidade();
        }

        const agora = Date.now();
        if (!forcar && window._ultimoSyncRankingNuvem && (agora - window._ultimoSyncRankingNuvem < 10000)) {
            return obterRankingGeralComunidade();
        }
        window._ultimoSyncRankingNuvem = agora;

        try {
            const fakeReviewIds = [1789741152346, 1789742639992, 1789743477104];
            const idsExpurgados = [1790130987906, 1790131037408, 1790339420104];

            // 1. Busca todos os registros públicos da comunidade em paralelo
            const [resJogos, resPlatinas, resMidias] = await Promise.all([
                window.sbClient.from('reviews_jogos').select('*').order('created_at', { ascending: false }),
                window.sbClient.from('platinas').select('*').order('created_at', { ascending: false }),
                window.sbClient.from('reviews_midias').select('*').order('created_at', { ascending: false })
            ]);

            const nuvemJogos = Array.isArray(resJogos?.data) ? resJogos.data : [];
            const nuvemPlatinas = Array.isArray(resPlatinas?.data) ? resPlatinas.data : [];
            const nuvemMidias = Array.isArray(resMidias?.data) ? resMidias.data : [];

            // 2. Normaliza Jogos
            const formatadosJ = nuvemJogos
                .filter(row => {
                    const idNum = Number(row.id);
                    return !fakeReviewIds.includes(idNum) && !(idNum >= 101 && idNum <= 105);
                })
                .map(row => ({
                    id: Number(row.id),
                    userId: row.user_id,
                    autor: row.autor,
                    titulo: row.titulo,
                    generos: row.generos,
                    palavrasChave: row.palavras_chave,
                    mediaInternet: row.media_internet,
                    plataforma: row.plataforma,
                    minhaNota: String(row.minha_nota),
                    status: row.status,
                    review: row.review,
                    capaUrl: row.capa_url,
                    dataRegistro: row.data_registro,
                    likes: Array.isArray(row.likes) ? row.likes : [],
                    comments: Array.isArray(row.comments) ? row.comments : []
                }));

            // 3. Normaliza Platinas
            const formatadosP = nuvemPlatinas
                .filter(row => {
                    const idNum = Number(row.id);
                    return !idsExpurgados.includes(idNum);
                })
                .map(row => ({
                    id: row.id,
                    userId: row.user_id,
                    user: row.usuario,
                    title: row.titulo,
                    platform: row.plataforma,
                    difficulty: row.dificuldade,
                    difficultyCategory: (row.dificuldade || '').toLowerCase().includes('fácil') || (row.dificuldade || '').toLowerCase().includes('tranquila') ? 'facil' : ((row.dificuldade || '').toLowerCase().includes('difícil') ? 'dificil' : ((row.dificuldade || '').toLowerCase().includes('lendária') || (row.dificuldade || '').toLowerCase().includes('insana') ? 'lendaria' : 'moderada')),
                    hours: row.horas || 0,
                    progress: row.nota !== null && row.nota !== undefined ? Number(row.nota) : 100,
                    trophiesCount: '100% Conquistado',
                    notes: row.relato || '',
                    cover: row.cover_url,
                    date: row.data_conquista,
                    badges: Array.isArray(row.badges) ? row.badges : []
                }));

            // 4. Normaliza Mídias
            const formatadosM = nuvemMidias.map(row => ({
                id: row.id,
                userId: row.user_id,
                autor: row.autor,
                titulo: row.titulo,
                tipo: row.tipo,
                genero: row.genero,
                nota: row.nota,
                review: row.review,
                posterUrl: row.poster_url,
                dataRegistro: row.data_registro
            }));

            // Armazena nas chaves dedicadas de nuvem comunitária
            localStorage.setItem('overcritic_comunidade_jogos_nuvem', JSON.stringify(formatadosJ));
            localStorage.setItem('overcritic_comunidade_platinas_nuvem', JSON.stringify(formatadosP));
            localStorage.setItem('overcritic_comunidade_midias_nuvem', JSON.stringify(formatadosM));

            // Mescla de forma segura nas chaves de reviews e platinas gerais
            try {
                let localJ = [];
                try { localJ = JSON.parse(localStorage.getItem('overcritic_reviews') || '[]') || []; } catch(e) {}
                const mapJ = new Map();
                formatadosJ.forEach(item => { if (item && item.titulo) mapJ.set(item.titulo.trim().toLowerCase(), item); });
                localJ.forEach(item => {
                    if (item && item.titulo && !mapJ.has(item.titulo.trim().toLowerCase())) {
                        mapJ.set(item.titulo.trim().toLowerCase(), item);
                    }
                });
                const mergedJ = Array.from(mapJ.values());
                localStorage.setItem('overcritic_reviews', JSON.stringify(mergedJ));
                localStorage.setItem('overcritic_jogos', JSON.stringify(mergedJ));
                localStorage.setItem('overclock_jogos', JSON.stringify(mergedJ));
            } catch(e) {}

            try {
                let localP = [];
                try { localP = JSON.parse(localStorage.getItem('overcritic_platinas') || '[]') || []; } catch(e) {}
                const mapP = new Map();
                formatadosP.forEach(item => {
                    if (item && item.title) {
                        const k = item.title.trim().toLowerCase() + '___' + (item.user || '').trim().toLowerCase();
                        mapP.set(k, item);
                    }
                });
                localP.forEach(item => {
                    if (item && item.title) {
                        const k = item.title.trim().toLowerCase() + '___' + (item.user || item.usuario || '').trim().toLowerCase();
                        if (!mapP.has(k)) mapP.set(k, item);
                    }
                });
                const mergedP = Array.from(mapP.values());
                localStorage.setItem('overcritic_platinas_feed', JSON.stringify(mergedP));
                localStorage.setItem('overcritic_platinas', JSON.stringify(mergedP));
                localStorage.setItem('overclock_platinas', JSON.stringify(mergedP));
                localStorage.setItem('platinasSalvas', JSON.stringify(mergedP));
            } catch(e) {}

            // Atualiza membros da comunidade com base nos autores da nuvem
            let membros = [];
            try {
                membros = JSON.parse(localStorage.getItem(CHAVE_STORAGE_RANKING_MEMBROS) || '[]');
                if (!Array.isArray(membros)) membros = [];
            } catch(e) { membros = []; }

            const mapaMembros = new Map();
            membros.forEach(m => {
                if (m && m.username) mapaMembros.set(m.username.trim().toLowerCase(), m);
            });

            // Garante pontuG como Fundador & Admin oficial
            if (!mapaMembros.has('pontug')) {
                mapaMembros.set('pontug', {
                    username: 'pontuG',
                    avatar: localStorage.getItem('overcritic_user_avatar') || '👑',
                    email: 'mesquitagabriel255@gmail.com',
                    role: 'Fundador & Admin',
                    dataCadastro: '2026-10-01'
                });
            } else {
                const p = mapaMembros.get('pontug');
                p.role = 'Fundador & Admin';
            }

            // Registra autores encontrados nas platinas da nuvem
            formatadosP.forEach(p => {
                const autor = (p.user || '').trim();
                if (!autor || ['visitante', 'anônimo', 'anonimo', 'jogador'].includes(autor.toLowerCase())) return;
                const k = autor.toLowerCase();
                if (!mapaMembros.has(k)) {
                    mapaMembros.set(k, {
                        username: autor,
                        avatar: '🎮',
                        email: '',
                        role: k === 'pontug' ? 'Fundador & Admin' : 'Membro da Comunidade',
                        dataCadastro: p.date || new Date().toISOString()
                    });
                }
            });

            // Registra autores encontrados nas análises de jogos da nuvem
            formatadosJ.forEach(j => {
                const autor = (j.autor || '').trim();
                if (!autor || ['visitante', 'anônimo', 'anonimo', 'jogador'].includes(autor.toLowerCase())) return;
                const k = autor.toLowerCase();
                if (!mapaMembros.has(k)) {
                    mapaMembros.set(k, {
                        username: autor,
                        avatar: '🎮',
                        email: '',
                        role: k === 'pontug' ? 'Fundador & Admin' : 'Membro da Comunidade',
                        dataCadastro: j.dataRegistro || new Date().toISOString()
                    });
                }
            });

            try {
                localStorage.setItem(CHAVE_STORAGE_RANKING_MEMBROS, JSON.stringify(Array.from(mapaMembros.values())));
            } catch(e) {}

            // Atualiza nível do usuário no header / perfil
            atualizarBadgesNivelPagina();

            // Dispara evento para re-renderização
            window.dispatchEvent(new CustomEvent('overcritic_ranking_atualizado', { detail: { origem: 'nuvem' } }));

            return obterRankingGeralComunidade();
        } catch(err) {
            console.warn('⚠️ [Gamificação] Aviso na sincronização do ranking na nuvem:', err);
            return obterRankingGeralComunidade();
        }
    }

    /**
     * Consolida e calcula em tempo real o Ranking Geral da Comunidade.
     * Percorre todos os membros cadastrados e todos os autores reais de platinas e críticas,
     * aplicando o cálculo oficial da matriz NIVEIS_GAMER e bônus de XP.
     */
    function obterRankingGeralComunidade() {
        let membrosCadastrados = [];
        try {
            membrosCadastrados = JSON.parse(localStorage.getItem(CHAVE_STORAGE_RANKING_MEMBROS) || '[]');
            if (!Array.isArray(membrosCadastrados)) membrosCadastrados = [];
        } catch(e) { membrosCadastrados = []; }

        // 1. Garante perfil oficial do Administrador pontuG
        if (!membrosCadastrados.some(m => (m.username || '').toLowerCase() === 'pontug')) {
            membrosCadastrados.push({
                username: 'pontuG',
                avatar: localStorage.getItem('overcritic_user_avatar') || '👑',
                email: 'mesquitagabriel255@gmail.com',
                role: 'Fundador & Admin',
                dataCadastro: '2026-10-01'
            });
        }

        // 2. Garante o usuário ativo na sessão
        const userAtivo = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim();
        if (userAtivo && !['visitante', 'anônimo', 'anonimo', 'jogador'].includes(userAtivo.toLowerCase())) {
            if (!membrosCadastrados.some(m => (m.username || '').toLowerCase() === userAtivo.toLowerCase())) {
                membrosCadastrados.push({
                    username: userAtivo,
                    avatar: localStorage.getItem('overcritic_user_avatar') || '🎮',
                    email: localStorage.getItem('overcritic_user_email') || '',
                    role: 'Membro da Comunidade',
                    dataCadastro: new Date().toISOString()
                });
            }
        }

        // 3. Lê todos os registros (combinando caches da nuvem e locais para máxima consistência)
        let todosJogos = [];
        let todasPlatinas = [];
        let todasMidias = [];

        try {
            const rawNuvemJ = localStorage.getItem('overcritic_comunidade_jogos_nuvem') || '[]';
            const rawLocalJ = localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]';
            const combinadosJ = [...JSON.parse(rawNuvemJ), ...JSON.parse(rawLocalJ)];
            const mapJ = new Map();
            combinadosJ.forEach(j => {
                if (j && j.titulo) {
                    const k = j.titulo.trim().toLowerCase();
                    if (!mapJ.has(k)) mapJ.set(k, j);
                }
            });
            todosJogos = Array.from(mapJ.values());
        } catch(e) { todosJogos = []; }

        try {
            const rawNuvemP = localStorage.getItem('overcritic_comunidade_platinas_nuvem') || '[]';
            const rawMinhas = localStorage.getItem('overcritic_minhas_platinas') || '[]';
            const rawFeed = localStorage.getItem('overcritic_platinas_feed') || '[]';
            const rawPlats = localStorage.getItem('overcritic_platinas') || '[]';
            const combinadas = [...JSON.parse(rawNuvemP), ...JSON.parse(rawMinhas), ...JSON.parse(rawFeed), ...JSON.parse(rawPlats)];
            const mapP = new Map();
            combinadas.forEach(p => {
                if (!p || (!p.title && !p.titulo)) return;
                const k = (p.title || p.titulo).trim().toLowerCase() + '___' + (p.user || p.usuario || '').trim().toLowerCase();
                if (!mapP.has(k)) mapP.set(k, p);
            });
            todasPlatinas = Array.from(mapP.values());
        } catch(e) { todasPlatinas = []; }

        try {
            const rawNuvemM = localStorage.getItem('overcritic_comunidade_midias_nuvem') || '[]';
            const rawM = localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]';
            const combinadasM = [...JSON.parse(rawNuvemM), ...JSON.parse(rawM)];
            const mapM = new Map();
            combinadasM.forEach(m => {
                if (!m || !m.titulo) return;
                const k = (m.titulo || '').trim().toLowerCase() + '___' + (m.autor || '').trim().toLowerCase();
                if (!mapM.has(k)) mapM.set(k, m);
            });
            todasMidias = Array.from(mapM.values());
        } catch(e) { todasMidias = []; }

        // Mapeia todos os jogadores únicos
        const mapaJogadores = new Map();
        membrosCadastrados.forEach(m => {
            const k = (m.username || '').trim().toLowerCase();
            if (k) mapaJogadores.set(k, { ...m });
        });

        // Adiciona autores legítimos encontrados nos registros
        [...todosJogos, ...todasPlatinas, ...todasMidias].forEach(item => {
            if (!item) return;
            const autor = (item.autor || item.user || item.usuario || '').trim();
            if (!autor || ['visitante', 'anônimo', 'anonimo', 'gamer'].includes(autor.toLowerCase())) return;
            const k = autor.toLowerCase();
            if (!mapaJogadores.has(k)) {
                mapaJogadores.set(k, {
                    username: autor,
                    avatar: '🎮',
                    email: '',
                    role: k === 'pontug' ? 'Fundador & Admin' : 'Membro da Comunidade',
                    dataCadastro: item.dataRegistro || item.date || new Date().toISOString()
                });
            }
        });

        // 4. Calcula o progresso e XP oficial de cada jogador
        const ranking = [];
        for (const [keyUser, membro] of mapaJogadores.entries()) {
            const uName = membro.username;
            const uNameLower = keyUser;

            // Filtra acervo do jogador com verificação cruzada de autor e ID único de pontuG/Admin
            let jogosDoUser = todosJogos.filter(j => {
                const autor = (j.autor || '').toLowerCase();
                if (autor === uNameLower) return true;
                if (uNameLower === 'pontug' && (['admin', 'administrador', 'adm'].includes(autor) || j.userId === '958a1b5f-4151-42c7-97f2-caf0e59fbb86' || j.user_id === '958a1b5f-4151-42c7-97f2-caf0e59fbb86')) return true;
                return false;
            });

            let platinasDoUser = todasPlatinas.filter(p => {
                const autor = (p.user || p.usuario || '').toLowerCase();
                if (autor === uNameLower) return true;
                if (uNameLower === 'pontug' && (['admin', 'administrador', 'adm'].includes(autor) || p.userId === '958a1b5f-4151-42c7-97f2-caf0e59fbb86' || p.user_id === '958a1b5f-4151-42c7-97f2-caf0e59fbb86')) return true;
                return false;
            });

            let midiasDoUser = todasMidias.filter(m => {
                const autor = (m.autor || '').toLowerCase();
                if (autor === uNameLower) return true;
                if (uNameLower === 'pontug' && (['admin', 'administrador', 'adm'].includes(autor) || m.userId === '958a1b5f-4151-42c7-97f2-caf0e59fbb86' || m.user_id === '958a1b5f-4151-42c7-97f2-caf0e59fbb86')) return true;
                return false;
            });

            // Se for pontuG / Admin ou o usuário logado, utiliza a consolidação detalhada do perfil
            if (uNameLower === 'pontug' || (userAtivo && uNameLower === userAtivo.toLowerCase())) {
                const dadosConsolidados = obterDadosConsolidadosUsuario(uName);
                if (dadosConsolidados) {
                    if (dadosConsolidados.jogos.length > 0) jogosDoUser = dadosConsolidados.jogos;
                    if (dadosConsolidados.platinas.length > 0) platinasDoUser = dadosConsolidados.platinas;
                    if (dadosConsolidados.midias.length > 0) midiasDoUser = dadosConsolidados.midias;
                }
            }

            const progresso = calcularProgressoGamer({
                jogos: jogosDoUser,
                midias: midiasDoUser,
                platinas: platinasDoUser
            });

            ranking.push({
                username: uName,
                avatar: membro.avatar || '🎮',
                role: membro.role || (uNameLower === 'pontug' ? 'Fundador & Admin' : 'Membro da Comunidade'),
                email: membro.email || '',
                xp: progresso.xpTotal || 0,
                nivel: progresso.nivel || 1,
                tituloPatente: progresso.titulo || 'Recruta Gamer',
                iconePatente: progresso.icone || '🌱',
                corPatente: progresso.cor || '#94a3b8',
                bgPatente: progresso.bg || 'rgba(148, 163, 184, 0.15)',
                totalPlatinas: platinasDoUser.length,
                totalJogos: jogosDoUser.length,
                totalMidias: midiasDoUser.length,
                totalAnalises: jogosDoUser.length + midiasDoUser.length,
                progresso: progresso,
                dataCadastro: membro.dataCadastro
            });
        }

        // 5. Ordenação do Ranking:
        // 1º XP Total (quem tem mais pontos fica no topo)
        // 2º Total de Platinas (desempate)
        // 3º Total de Análises (desempate)
        // 4º Prioridade do Fundador & Admin (evita que contas zeradas assumam a coroa)
        // 5º Membro mais antigo por data de cadastro
        // 6º Ordem Alfabética
        ranking.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp;
            if (b.totalPlatinas !== a.totalPlatinas) return b.totalPlatinas - a.totalPlatinas;
            if (b.totalAnalises !== a.totalAnalises) return b.totalAnalises - a.totalAnalises;
            const aIsAdmin = a.role === 'Fundador & Admin' || (a.username || '').toLowerCase() === 'pontug';
            const bIsAdmin = b.role === 'Fundador & Admin' || (b.username || '').toLowerCase() === 'pontug';
            if (aIsAdmin && !bIsAdmin) return -1;
            if (!aIsAdmin && bIsAdmin) return 1;
            const dataA = new Date(a.dataCadastro || 0).getTime();
            const dataB = new Date(b.dataCadastro || 0).getTime();
            if (dataA !== dataB) return dataA - dataB;
            return a.username.localeCompare(b.username);
        });

        // Atribui colocação oficial
        ranking.forEach((j, idx) => {
            j.rank = idx + 1;
        });

        // Mantém atualizado no localStorage para acesso ultrarrápido (0ms)
        try {
            const simplificado = ranking.map(r => ({
                username: r.username,
                avatar: r.avatar,
                role: r.role,
                email: r.email,
                dataCadastro: r.dataCadastro
            }));
            localStorage.setItem(CHAVE_STORAGE_RANKING_MEMBROS, JSON.stringify(simplificado));
        } catch(e) {}

        return ranking;
    }

    /**
     * Retorna a posição e os dados no ranking de um usuário específico.
     */
    function obterPosicaoRankingUsuario(nomeUsuario) {
        const ranking = obterRankingGeralComunidade();
        const target = (nomeUsuario || localStorage.getItem('overcritic_currentUser') || '').toLowerCase().trim();
        const encontrado = ranking.find(j => j.username.toLowerCase() === target);
        if (encontrado) {
            return {
                posicao: encontrado.rank,
                totalJogadores: ranking.length,
                jogador: encontrado
            };
        }
        return {
            posicao: ranking.length + 1,
            totalJogadores: ranking.length,
            jogador: null
        };
    }

    /**
     * Renderizador do Card do Pódio (Top 1, 2 e 3)
     */
    function renderizarCardPodio(jogador, posicao, currentUser) {
        if (!jogador) return '';
        const isUser = currentUser && (jogador.username || '').toLowerCase() === currentUser;
        const rankClass = `rank-${posicao}`;
        const medalhas = {
            1: { icone: '👑', label: '1º Lugar', cor: '#ffd700' },
            2: { icone: '🥈', label: '2º Lugar', cor: '#cbd5e1' },
            3: { icone: '🥉', label: '3º Lugar', cor: '#cd7f32' }
        };
        const m = medalhas[posicao] || { icone: '🎖️', label: `${posicao}º`, cor: '#94a3b8' };
        const avatarHtml = typeof window.renderizarAvatarHtml === 'function'
            ? window.renderizarAvatarHtml(jogador.avatar, '🎮')
            : (jogador.avatar || '🎮');

        return `
            <div class="og-podium-card ${rankClass} ${isUser ? 'is-current-user' : ''}">
                ${posicao === 1 ? '<div class="og-podium-crown">👑</div>' : ''}
                <div class="og-podium-avatar-wrap">
                    <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${avatarHtml}
                    </div>
                    <span class="og-podium-rank-badge" style="color:${m.cor}; border-color:${m.cor};">
                        ${m.icone} #${posicao}
                    </span>
                </div>
                <div class="og-podium-name">
                    ${jogador.username}
                    ${isUser ? '<span class="og-rank-badge-you">(Você)</span>' : ''}
                </div>
                <div class="og-podium-patente" style="color:${jogador.corPatente}; background:${jogador.bgPatente}; border-color:${jogador.corPatente};">
                    ${jogador.iconePatente} Nv. ${jogador.nivel} ${jogador.tituloPatente}
                </div>
                <div class="og-podium-xp">
                    ${jogador.xp.toLocaleString('pt-BR')} <span style="font-size:0.85rem; font-weight:700; color:var(--text-muted, #adb5bd);">XP</span>
                </div>
                <div class="og-podium-stats-row">
                    <span>🏆 <b>${jogador.totalPlatinas}</b> platinas</span>
                    <span>•</span>
                    <span>📝 <b>${jogador.totalAnalises}</b> críticas</span>
                </div>
                <button type="button" class="og-rank-btn-view" style="margin-top: 14px; width: 100%;" onclick="if(window.abrirGamerCardModal) window.abrirGamerCardModal('${jogador.username}');">
                    🎴 Ver Gamer Card
                </button>
            </div>
        `;
    }

    /**
     * Renderizador de Linha da Tabela de Classificação
     */
    function renderizarLinhaTabelaRanking(jogador, posicao, currentUser) {
        const isUser = currentUser && (jogador.username || '').toLowerCase() === currentUser;
        const medalhasRank = {
            1: '<span style="color:#ffd700; font-size:1.2rem;">🥇 1</span>',
            2: '<span style="color:#cbd5e1; font-size:1.2rem;">🥈 2</span>',
            3: '<span style="color:#cd7f32; font-size:1.2rem;">🥉 3</span>'
        };
        const rankDisplay = medalhasRank[posicao] || `<span style="font-weight:800; color:var(--text-muted, #adb5bd);">#${posicao}</span>`;

        const prog = jogador.progresso || {};
        const pct = prog.pctNivel || 0;
        const avatarHtml = typeof window.renderizarAvatarHtml === 'function'
            ? window.renderizarAvatarHtml(jogador.avatar, '🎮')
            : (jogador.avatar || '🎮');

        return `
            <tr class="og-rank-row ${isUser ? 'is-current-user' : ''}">
                <td class="og-rank-num">
                    ${rankDisplay}
                </td>
                <td>
                    <div class="og-rank-user-cell">
                        <div class="og-rank-user-avatar" style="overflow: hidden; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            ${avatarHtml}
                        </div>
                        <div>
                            <div class="og-rank-user-name">
                                <span>${jogador.username}</span>
                                ${isUser ? '<span class="og-rank-badge-you">(Você)</span>' : ''}
                                ${jogador.role === 'Fundador & Admin' ? '<span class="og-rank-badge-role">ADMIN</span>' : ''}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted, #adb5bd);">
                                ${jogador.role || 'Membro da Comunidade'}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="og-rank-patente-pill" style="color:${jogador.corPatente}; background:${jogador.bgPatente}; border-color:${jogador.corPatente};">
                        ${jogador.iconePatente} Nv. ${jogador.nivel} ${jogador.tituloPatente}
                    </div>
                </td>
                <td style="text-align: center; font-weight: 800; color: #ffd700;">
                    ${jogador.totalPlatinas}
                </td>
                <td style="text-align: center; font-weight: 700;">
                    ${jogador.totalAnalises}
                </td>
                <td>
                    <div class="og-rank-xp-bar-wrap">
                        <div class="og-rank-xp-text">
                            <span style="color:var(--text-main, #f8f9fa); font-weight:800;">${jogador.xp.toLocaleString('pt-BR')} XP</span>
                            <span style="color:var(--text-muted, #adb5bd); font-size:0.7rem;">${pct}%</span>
                        </div>
                        <div class="og-rank-xp-track">
                            <div class="og-rank-xp-fill" style="width: ${Math.min(100, Math.max(5, pct))}%;"></div>
                        </div>
                    </div>
                </td>
                <td style="text-align: center;">
                    <button type="button" class="og-rank-btn-view" onclick="if(window.abrirGamerCardModal) window.abrirGamerCardModal('${jogador.username}');" title="Ver Gamer Card Oficial">
                        🎴 Card
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Renderizador Modular Completo do Ranking da Comunidade
     */
    function renderizarRankingComunidade(containerId = 'communityRankingContainer', opcoes = {}) {
        const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!container) return;
        injetarEstilosGamificacao();

        const lista = obterRankingGeralComunidade();
        const currentUser = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || 'visitante').toLowerCase();

        if (!lista || lista.length === 0) {
            container.innerHTML = `
                <div class="og-ranking-empty">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">🏆</div>
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-gold, #ffd700); margin-bottom: 6px;">Temporada Aberta: Ranking da Comunidade</div>
                    <div style="font-size: 0.88rem; color: var(--text-muted, #adb5bd); max-width: 500px; margin: 0 auto 16px;">
                        Cadastre sua conta ou registre sua primeira platina / crítica para inaugurar o topo do Ranking Geral!
                    </div>
                    <a href="conta_login.html?tab=register" class="og-btn-ranking-action primary" style="text-decoration: none;">
                        ✨ Entrar na Disputa do Ranking
                    </a>
                </div>
            `;
            return;
        }

        const top3 = lista.slice(0, 3);

        // Pódio Top 3
        let podiumHtml = '';
        if (top3.length > 0) {
            podiumHtml = `
                <div class="og-podium-grid">
                    ${top3[1] ? renderizarCardPodio(top3[1], 2, currentUser) : '<div class="og-podium-card-placeholder"></div>'}
                    ${top3[0] ? renderizarCardPodio(top3[0], 1, currentUser) : ''}
                    ${top3[2] ? renderizarCardPodio(top3[2], 3, currentUser) : '<div class="og-podium-card-placeholder"></div>'}
                </div>
            `;
        }

        // Tabela Completa
        const tabelaHtml = `
            <div class="og-ranking-table-card">
                <div class="og-ranking-table-header">
                    <div class="og-ranking-table-title">
                        <span>📜</span> Classificação Geral dos Jogadores (${lista.length} ${lista.length === 1 ? 'Membro' : 'Membros'})
                    </div>
                    <div class="og-ranking-table-legend">
                        <span class="og-legend-pill">🏆 Platinas</span>
                        <span class="og-legend-pill">📝 Críticas</span>
                        <span class="og-legend-pill">✨ XP Overcritic</span>
                    </div>
                </div>
                <div class="og-ranking-table-responsive">
                    <table class="og-ranking-table">
                        <thead>
                            <tr>
                                <th style="width: 70px; text-align: center;">Posição</th>
                                <th>Jogador / Perfil</th>
                                <th>Patente Atual</th>
                                <th style="text-align: center;">Platinas 🏆</th>
                                <th style="text-align: center;">Análises 📝</th>
                                <th style="width: 220px;">Progresso de XP</th>
                                <th style="width: 110px; text-align: center;">Gamer Card</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lista.map((jogador, idx) => renderizarLinhaTabelaRanking(jogador, idx + 1, currentUser)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="og-community-ranking-card">
                <div class="og-ranking-main-header">
                    <div>
                        <div class="og-ranking-badge">
                            <span>🏆</span> LEADERBOARD OFICIAL
                        </div>
                        <h2 class="og-ranking-title">
                            <span>🏆</span> Ranking Geral da Comunidade
                        </h2>
                        <div class="og-ranking-subtitle">
                            Classificação dos membros cadastrados por experiência (XP), platinas conquistadas e análises avaliadas no Overcritic.
                        </div>
                    </div>
                    <div class="og-ranking-actions">
                        <button type="button" class="og-btn-ranking-action" onclick="if(window.OvercriticGamification && typeof window.OvercriticGamification.sincronizarRankingNuvem === 'function') { window.OvercriticGamification.sincronizarRankingNuvem(true).then(() => window.OvercriticGamification.renderizarRankingComunidade('${containerId}', { silentSyncDone: true })); } else if(window.OvercriticGamification) { window.OvercriticGamification.renderizarRankingComunidade('${containerId}', { forcar: true }); }" title="Atualizar Ranking da Comunidade via Nuvem">
                            <span>🔄</span> Atualizar
                        </button>
                        <button type="button" class="og-btn-ranking-action primary" onclick="if(window.abrirGamerCardModal) window.abrirGamerCardModal();" title="Visualizar meu Gamer Card Oficial">
                            <span>🎴</span> Meu Gamer Card
                        </button>
                    </div>
                </div>
                ${podiumHtml}
                ${tabelaHtml}
            </div>
        `;

        // Dispara sincronização em segundo plano com a nuvem Supabase
        if (!opcoes.silentSyncDone && (opcoes.forcar || !window._ultimoSyncRankingNuvem || (Date.now() - window._ultimoSyncRankingNuvem > 10000))) {
            sincronizarRankingNuvem(opcoes.forcar).then(() => {
                const cAtual = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
                if (cAtual) {
                    renderizarRankingComunidade(cAtual, { silentSyncDone: true });
                }
            }).catch(e => console.warn('Sync nuvem ranking background:', e));
        }
    }

    // Listener Global de Tecla Escape para Fechamento Seguro de Modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const tierOverlay = document.getElementById('ogTierListOverlay');
            const cardOverlay = document.getElementById('ogGamerCardOverlay');
            if (tierOverlay && tierOverlay.classList.contains('active')) {
                fecharModalTierList();
            } else if (cardOverlay && cardOverlay.classList.contains('active')) {
                fecharGamerCardModal();
            }
        }
    });

    // Exporta globalmente
    window.OvercriticGamification = {
        NIVEIS_GAMER,
        calcularProgressoGamer,
        calcularXpPlatina,
        avaliarQualidadeReview,
        calcularXpReview,
        vincularDadosLegadosUsuario,
        obterDadosConsolidadosUsuario,
        sincronizarDadosCompletosUsuario,
        sincronizarRankingNuvem,
        executarLimpezaGeralDados,
        abrirGamerCardModal,
        fecharGamerCardModal,
        abrirModalTierList,
        fecharModalTierList,
        atualizarBadgesNivelPagina,
        registrarNovoJogadorNoRanking,
        obterRankingGeralComunidade,
        obterPosicaoRankingUsuario,
        renderizarRankingComunidade
    };

    window.NIVEIS_GAMER = NIVEIS_GAMER;
    window.calcularXpPlatina = calcularXpPlatina;
    window.avaliarQualidadeReview = avaliarQualidadeReview;
    window.calcularXpReview = calcularXpReview;
    window.abrirGamerCardModal = abrirGamerCardModal;
    window.fecharGamerCardModal = fecharGamerCardModal;
    window.abrirModalTierList = abrirModalTierList;
    window.fecharModalTierList = fecharModalTierList;
    window.vincularDadosLegadosUsuario = vincularDadosLegadosUsuario;
    window.obterDadosConsolidadosUsuario = obterDadosConsolidadosUsuario;
    window.sincronizarDadosCompletosUsuario = sincronizarDadosCompletosUsuario;
    window.sincronizarRankingNuvem = sincronizarRankingNuvem;
    window.executarLimpezaGeralDados = executarLimpezaGeralDados;
    window.registrarNovoJogadorNoRanking = registrarNovoJogadorNoRanking;
    window.obterRankingGeralComunidade = obterRankingGeralComunidade;
    window.obterPosicaoRankingUsuario = obterPosicaoRankingUsuario;
    window.renderizarRankingComunidade = renderizarRankingComunidade;

    console.log('🎮 [Overcritic] Motor de Gamificação, Níveis, Ranking Comunitário & Tier List carregado!');
})();

