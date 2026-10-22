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
        { nivel: 1, titulo: "Recruta Gamer", xpNecessario: 500, minXp: 0, maxXp: 499, icone: "🌱", cor: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
        { nivel: 2, titulo: "Aventureiro Geek", xpNecessario: 1500, minXp: 500, maxXp: 1999, icone: "⚡", cor: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
        { nivel: 3, titulo: "Crítico de Bronze", xpNecessario: 3500, minXp: 2000, maxXp: 5499, icone: "🥉", cor: "#cd7f32", bg: "rgba(205, 127, 50, 0.15)" },
        { nivel: 4, titulo: "Crítico de Prata", xpNecessario: 7000, minXp: 5500, maxXp: 12499, icone: "🥈", cor: "#cbd5e1", bg: "rgba(203, 213, 225, 0.15)" },
        { nivel: 5, titulo: "Mestre dos Troféus", xpNecessario: 12000, minXp: 12500, maxXp: 24499, icone: "🏆", cor: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)" },
        { nivel: 6, titulo: "Cineasta & Gamer Ouro", xpNecessario: 19000, minXp: 24500, maxXp: 43499, icone: "🥇", cor: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
        { nivel: 7, titulo: "Veterano Overcritic", xpNecessario: 28000, minXp: 43500, maxXp: 71499, icone: "🛡️", cor: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" },
        { nivel: 8, titulo: "Caçador Platina Lendário", xpNecessario: 38000, minXp: 71500, maxXp: 109499, icone: "💎", cor: "#00f0ff", bg: "rgba(0, 240, 255, 0.15)" },
        { nivel: 9, titulo: "Grão-Mestre Geek", xpNecessario: 50000, minXp: 109500, maxXp: 159499, icone: "👑", cor: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" },
        { nivel: 10, titulo: "Lenda do Overcritic", xpNecessario: 0, minXp: 159500, maxXp: 999999, icone: "🔥", cor: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }
    ];

    /**
     * Identifica se um usuário/dados pertence à equipe de Desenvolvimento e Moderação do Overcritic.
     * Desenvolvedores possuem a patente exclusiva "DEV" (inalcançável) e não competem no Ranking Geral da Comunidade.
     */
    function isUsuarioDevOuStaff(usernameOrDados) {
        if (!usernameOrDados) {
            const current = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim().toLowerCase();
            const email = (localStorage.getItem('overcritic_user_email') || '').trim().toLowerCase();
            return current === 'pontug' || current === 'admin' || email === 'mesquitagabriel255@gmail.com' || localStorage.getItem('overcritic_is_admin') === 'true';
        }
        let u = '';
        if (typeof usernameOrDados === 'string') {
            u = usernameOrDados.trim().toLowerCase();
        } else if (typeof usernameOrDados === 'object') {
            u = (usernameOrDados.username || '').trim().toLowerCase();
            if (usernameOrDados.role && (usernameOrDados.role.includes('Admin') || usernameOrDados.role.includes('DEV') || usernameOrDados.role.includes('Fundador'))) return true;
            if (usernameOrDados.email && usernameOrDados.email.toLowerCase() === 'mesquitagabriel255@gmail.com') return true;
            if (usernameOrDados.userId === '958a1b5f-4151-42c7-97f2-caf0e59fbb86' || usernameOrDados.user_id === '958a1b5f-4151-42c7-97f2-caf0e59fbb86') return true;
        }
        return u === 'pontug' || u === 'admin';
    }

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

        // 4. Bônus de XP das Conquistas / Insígnias Desbloqueadas
        let xpInsignias = 0;
        if (Array.isArray(stats.insignias)) {
            stats.insignias.forEach(ins => {
                if (ins && ins.desbloqueada) xpInsignias += Number(ins.xpBonus || 0);
            });
        } else if (typeof obterStatusInsigniasUsuario === 'function') {
            try {
                const insList = obterStatusInsigniasUsuario(stats);
                insList.forEach(ins => {
                    if (ins && ins.desbloqueada) xpInsignias += Number(ins.xpBonus || 0);
                });
            } catch (e) {}
        }

        // 5. Bônus de XP das Missões Semanais Concluídas (Weekly Quests)
        let xpMissoesSemanais = 0;
        if (typeof obterTotalXpMissoesSemanaisUsuario === 'function') {
            try {
                xpMissoesSemanais = obterTotalXpMissoesSemanaisUsuario(stats);
            } catch (e) {}
        }

        // 6. Bônus de XP dos Duelos Diários da Comunidade (+25 XP por dia votado)
        let xpDuelosDiarios = 0;
        if (typeof obterTotalXpDuelosDiariosUsuario === 'function') {
            try {
                xpDuelosDiarios = obterTotalXpDuelosDiariosUsuario(stats);
            } catch (e) {}
        }

        const xpTotal = xpJogos + xpMidias + xpPlatinas + xpInsignias + xpMissoesSemanais + xpDuelosDiarios + (numInteracoes * 20);

        // Se for o Desenvolvedor / Criador / Moderação (pontuG / admin), atribui a patente exclusiva e inalcançável "DEV"
        if (isUsuarioDevOuStaff(stats)) {
            return {
                xpTotal,
                xpJogos,
                xpMidias,
                xpPlatinas,
                xpInsignias,
                xpMissoesSemanais,
                nivel: 'DEV',
                titulo: 'Criador & Desenvolvedor',
                icone: '🛠️',
                cor: '#00f0ff',
                bg: 'rgba(0, 240, 255, 0.2)',
                porcentagem: 100,
                xpNoNivel: xpTotal,
                faixaXp: xpTotal,
                xpRestante: 0,
                proximoNivel: null,
                isDev: true
            };
        }

        let infoNivel = NIVEIS_GAMER[0];
        let proximoNivel = NIVEIS_GAMER[1];

        for (let i = 0; i < NIVEIS_GAMER.length; i++) {
            if (xpTotal >= NIVEIS_GAMER[i].minXp && xpTotal <= NIVEIS_GAMER[i].maxXp) {
                infoNivel = NIVEIS_GAMER[i];
                proximoNivel = NIVEIS_GAMER[i + 1] || null;
                break;
            }
        }

        if (xpTotal >= NIVEIS_GAMER[NIVEIS_GAMER.length - 1].minXp) {
            infoNivel = NIVEIS_GAMER[NIVEIS_GAMER.length - 1];
            proximoNivel = null;
        }

        const xpBase = infoNivel.minXp;
        const xpNoNivel = xpTotal - xpBase;
        const faixaXp = infoNivel.xpNecessario || (proximoNivel ? (proximoNivel.minXp - xpBase) : 1);
        const porcentagem = proximoNivel ? Math.min(100, Math.max(0, Math.floor((xpNoNivel / faixaXp) * 100))) : 100;
        const xpRestante = proximoNivel ? Math.max(0, faixaXp - xpNoNivel) : 0;

        return {
            xpTotal,
            xpJogos,
            xpMidias,
            xpPlatinas,
            xpInsignias,
            xpMissoesSemanais,
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
    function liberarScrollFundo(force = false) {
        if (force) {
            _ogModaisAbertosCount = 0;
        } else {
            _ogModaisAbertosCount = Math.max(0, _ogModaisAbertosCount - 1);
        }
        const anyModalActive = document.querySelector('.og-modal-overlay.active, .og-mural-overlay.active, .og-gamer-card-modal.active');
        if (_ogModaisAbertosCount <= 0 || !anyModalActive) {
            _ogModaisAbertosCount = 0;
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
                align-items: center;
                justify-content: center;
                padding: 24px 16px;
                box-sizing: border-box;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
                overflow-y: auto;
                overflow-x: hidden;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
            }
            .og-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* Custom Scrollbars Elegantes */
            .og-modal-overlay::-webkit-scrollbar,
            .og-mural-overlay::-webkit-scrollbar,
            .og-mural-modal::-webkit-scrollbar,
            .og-card-preview::-webkit-scrollbar,
            .og-tier-body::-webkit-scrollbar,
            .og-tier-pool::-webkit-scrollbar,
            .og-ladder-list::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .og-modal-overlay::-webkit-scrollbar-track,
            .og-mural-overlay::-webkit-scrollbar-track,
            .og-mural-modal::-webkit-scrollbar-track,
            .og-card-preview::-webkit-scrollbar-track,
            .og-tier-body::-webkit-scrollbar-track,
            .og-tier-pool::-webkit-scrollbar-track,
            .og-ladder-list::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.25);
                border-radius: 8px;
            }
            .og-modal-overlay::-webkit-scrollbar-thumb,
            .og-mural-overlay::-webkit-scrollbar-thumb,
            .og-mural-modal::-webkit-scrollbar-thumb,
            .og-card-preview::-webkit-scrollbar-thumb,
            .og-tier-body::-webkit-scrollbar-thumb,
            .og-tier-pool::-webkit-scrollbar-thumb,
            .og-ladder-list::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.35);
                border-radius: 8px;
            }
            .og-modal-overlay::-webkit-scrollbar-thumb:hover,
            .og-mural-overlay::-webkit-scrollbar-thumb:hover,
            .og-mural-modal::-webkit-scrollbar-thumb:hover,
            .og-card-preview::-webkit-scrollbar-thumb:hover,
            .og-tier-body::-webkit-scrollbar-thumb:hover,
            .og-tier-pool::-webkit-scrollbar-thumb:hover,
            .og-ladder-list::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 240, 255, 0.65);
            }

            /* ── MODAL DO GAMER CARD ── */
            .og-gamer-card-modal {
                width: 100%;
                max-width: 460px;
                margin: auto;
                display: flex;
                flex-direction: column;
                gap: 14px;
                align-items: center;
                justify-content: center;
                transform: scale(0.92) translateY(20px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                box-sizing: border-box;
                perspective: 1200px;
                perspective-origin: center center;
            }
            .og-modal-overlay.active .og-gamer-card-modal {
                transform: scale(1) translateY(0);
            }

            /* Card Holográfico Exibido na Tela (Efeito Carta Rara Lendária 3D) */
            .og-card-preview {
                width: 100%;
                max-height: calc(88vh - 60px);
                overflow-y: auto;
                overflow-x: hidden;
                overscroll-behavior: contain;
                background: linear-gradient(150deg, #090e1a 0%, #111a2e 50%, #0d1222 100%);
                border: 2px solid rgba(0, 240, 255, 0.45);
                border-radius: 20px;
                padding: 20px 20px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.25);
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-sizing: border-box;
                transform-style: preserve-3d;
                transform: perspective(1200px) rotateX(var(--og-tilt-x, 0deg)) rotateY(var(--og-tilt-y, 0deg)) scale3d(1, 1, 1);
                transition: transform 0.12s ease-out, box-shadow 0.2s ease-out, border-color 0.25s ease;
                will-change: transform, box-shadow;
            }
            .og-card-preview.is-tilting {
                transition: none; /* Resposta imediata e sem lag ao movimento do mouse / giroscópio */
            }
            .og-card-preview.is-resetting {
                transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease;
            }
            .og-card-preview::before {
                content: '';
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.12), transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(157, 78, 221, 0.12), transparent 50%);
                pointer-events: none;
                z-index: 0;
            }

            /* Camada 1: Foil Furta-cor Holográfico (Arco-íris Prismatic Foil de Colecionador) */
            .og-card-holo-foil {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                z-index: 8;
                mix-blend-mode: color-dodge;
                opacity: var(--og-holo-opacity, 0);
                background-image: linear-gradient(
                    var(--og-holo-angle, 135deg),
                    rgba(255, 0, 128, 0.55) 0%,
                    rgba(255, 140, 0, 0.5) 15%,
                    rgba(255, 230, 0, 0.5) 30%,
                    rgba(0, 240, 255, 0.6) 50%,
                    rgba(157, 78, 221, 0.55) 70%,
                    rgba(255, 0, 128, 0.55) 85%,
                    rgba(0, 240, 255, 0.6) 100%
                );
                background-size: 260% 260%;
                background-position: var(--og-pointer-x, 50%) var(--og-pointer-y, 50%);
                filter: brightness(1.15) contrast(1.25) saturate(1.4);
                transition: opacity 0.3s ease;
            }

            /* Camada 2: Reflexo Especular de Feixe de Luz (Specular Glare) */
            .og-card-holo-glare {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                z-index: 9;
                mix-blend-mode: overlay;
                opacity: var(--og-glare-opacity, 0);
                background: radial-gradient(
                    farthest-corner circle at var(--og-pointer-x, 50%) var(--og-pointer-y, 50%),
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(255, 255, 255, 0.45) 20%,
                    rgba(0, 240, 255, 0.25) 45%,
                    transparent 75%
                );
                transition: opacity 0.25s ease;
            }

            /* Camada 3: Micro-ranhuras Prismáticas de Colecionador (Sparkle / Prismatic Ribbon) */
            .og-card-holo-sparkles {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                z-index: 7;
                mix-blend-mode: color-dodge;
                opacity: calc(var(--og-holo-opacity, 0) * 0.7);
                background-image: repeating-linear-gradient(
                    calc(var(--og-holo-angle, 135deg) + 45deg),
                    rgba(255, 255, 255, 0.12) 0px,
                    rgba(255, 255, 255, 0.12) 2px,
                    transparent 2px,
                    transparent 7px
                );
                transition: opacity 0.3s ease;
            }

            /* Badge/Dica Discreta de Efeito Holográfico */
            .og-card-holo-hint {
                font-size: 0.72rem;
                font-weight: 700;
                color: rgba(0, 240, 255, 0.9);
                text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
                text-align: center;
                pointer-events: none;
                opacity: 0.85;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: -4px;
                animation: ogHoloHintPulse 3s ease-in-out infinite;
                z-index: 3;
            }
            @keyframes ogHoloHintPulse {
                0%, 100% { opacity: 0.65; transform: translateY(0); }
                50% { opacity: 1; transform: translateY(-2px); }
            }

            /* Parallax Z nos elementos internos da carta */
            .og-card-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                z-index: 2;
                transform: translateZ(16px);
                transform-style: preserve-3d;
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
                transform: translateZ(24px);
                transform-style: preserve-3d;
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
                transform: translateZ(36px);
                transition: transform 0.25s ease, box-shadow 0.25s ease;
            }
            .og-card-user-info {
                display: flex;
                flex-direction: column;
                gap: 3px;
                transform: translateZ(22px);
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

            /* Grid de Stats no Card com Parallax 3D */
            .og-card-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 6px;
                position: relative;
                z-index: 2;
                transform: translateZ(20px);
                transform-style: preserve-3d;
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
                transform: translateZ(14px);
                transition: transform 0.2s ease, border-color 0.2s ease;
            }
            .og-card-stat-box:hover {
                transform: translateZ(26px) scale(1.04);
                border-color: rgba(0, 240, 255, 0.5);
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

            /* Mini Vitrine de Favoritos com Elevação 3D */
            .og-card-favorites {
                display: flex;
                flex-direction: column;
                gap: 6px;
                position: relative;
                z-index: 2;
                transform: translateZ(20px);
                transform-style: preserve-3d;
            }
            .og-card-fav-title {
                font-size: 0.68rem;
                font-weight: 800;
                letter-spacing: 0.8px;
                color: #94a3b8;
                text-transform: uppercase;
            }
            .og-card-fav-covers {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }
            .og-card-fav-item {
                aspect-ratio: 3 / 4;
                min-height: 90px;
                max-height: 120px;
                border-radius: 10px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                background-color: #080d1a;
                border: 1px solid rgba(0, 240, 255, 0.35);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                transform: translateZ(16px);
                transition: transform 0.22s ease, box-shadow 0.22s ease;
            }
            .og-card-fav-item:hover {
                transform: translateZ(28px) scale(1.05);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 240, 255, 0.4);
            }
            .og-card-fav-badge {
                align-self: flex-start;
                background: rgba(0, 0, 0, 0.88);
                border: 1px solid #ffd700;
                color: #ffd700;
                font-size: 0.62rem;
                font-weight: 900;
                padding: 2px 5px;
                border-radius: 5px;
                line-height: 1;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
            }
            .og-card-fav-name {
                background: rgba(0, 0, 0, 0.88);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #ffffff;
                font-size: 0.58rem;
                font-weight: 800;
                text-align: center;
                padding: 3px 4px;
                border-radius: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.1;
            }
            .og-card-fav-empty {
                aspect-ratio: 3 / 4;
                min-height: 90px;
                max-height: 120px;
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px dashed rgba(255, 255, 255, 0.12);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #64748b;
                font-size: 0.62rem;
                font-weight: 700;
                text-align: center;
                gap: 4px;
                padding: 4px;
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

            /* Barra de Formato Social (Stories / Feed) */
            .og-social-format-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 10px;
                background: rgba(0, 0, 0, 0.45);
                border: 1px solid rgba(0, 240, 255, 0.22);
                border-radius: 14px;
                padding: 10px 14px;
                box-sizing: border-box;
                backdrop-filter: blur(10px);
                flex-wrap: wrap;
            }
            .og-social-format-title {
                font-size: 0.74rem;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .og-social-format-pills {
                display: flex;
                gap: 8px;
            }
            .og-format-pill {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #cbd5e1;
                padding: 6px 12px;
                border-radius: 10px;
                font-size: 0.76rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
                font-family: inherit;
                box-sizing: border-box;
                white-space: nowrap;
            }
            .og-format-pill span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                flex-shrink: 0;
            }
            .og-format-pill:hover {
                border-color: rgba(0, 240, 255, 0.5);
                color: #fff;
                transform: translateY(-1px);
            }
            .og-format-pill.active {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(157, 78, 221, 0.22));
                border-color: #00f0ff;
                color: #00f0ff;
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
            }

            /* Barra de Ações do Gamer Card */
            .og-modal-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 9px;
                width: 100%;
                box-sizing: border-box;
            }
            .og-modal-btn {
                box-sizing: border-box;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 0.84rem;
                font-weight: 800;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: inherit;
                white-space: nowrap;
                position: relative;
                user-select: none;
                -webkit-user-select: none;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .og-modal-btn span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 1.05rem;
                line-height: 1;
                flex-shrink: 0;
            }
            .og-modal-actions .og-btn-download {
                grid-column: 1 / -1;
                padding: 13px 20px;
                font-size: 0.94rem;
                background: linear-gradient(135deg, #0284c7 0%, #00f0ff 100%);
                color: #07090f;
                font-weight: 900;
                letter-spacing: 0.3px;
                box-shadow: 0 4px 20px rgba(0, 240, 255, 0.45);
            }
            .og-modal-actions .og-btn-download:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 28px rgba(0, 240, 255, 0.65);
                filter: brightness(1.08);
            }
            .og-modal-actions .og-btn-download:active {
                transform: translateY(0);
            }
            .og-btn-share {
                background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
            }
            .og-btn-share:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.55);
                filter: brightness(1.08);
            }
            .og-btn-share:active {
                transform: translateY(0);
            }
            .og-btn-copy {
                background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
            }
            .og-btn-copy:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.55);
                filter: brightness(1.08);
            }
            .og-btn-copy:active {
                transform: translateY(0);
            }
            .og-btn-trilha {
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.45);
                box-shadow: 0 4px 14px rgba(0, 240, 255, 0.2);
            }
            .og-btn-trilha:hover {
                transform: translateY(-2px);
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
                border-color: #00f0ff;
                box-shadow: 0 6px 20px rgba(0, 240, 255, 0.45);
                color: #ffffff;
            }
            .og-btn-trilha:active {
                transform: translateY(0);
            }
            .og-modal-actions .og-btn-close {
                background: rgba(255, 255, 255, 0.08);
                color: #cbd5e1;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .og-modal-actions .og-btn-close:hover {
                background: rgba(239, 68, 68, 0.25);
                color: #ff6b6b;
                border-color: #ef4444;
            }
            .og-modal-actions .og-btn-close:active {
                transform: translateY(0);
            }

            /* ── MODAL DEDICADO DA TRILHA DE PATENTES (ESTÁTICO & SEM PARALLAX) ── */
            .og-trilha-modal {
                width: 100%;
                max-width: 580px;
                max-height: 88vh;
                margin: auto;
                background: linear-gradient(145deg, #0d1222 0%, #070a14 100%);
                border: 1px solid rgba(0, 240, 255, 0.35);
                border-radius: 20px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 240, 255, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-sizing: border-box;
                animation: ogScaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .og-trilha-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.02);
            }
            .og-trilha-modal-body {
                padding: 18px 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .og-trilha-modal-body::-webkit-scrollbar {
                width: 6px;
            }
            .og-trilha-modal-body::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.4);
                border-radius: 4px;
            }
            body.light-mode .og-trilha-modal {
                background: #ffffff;
                border-color: rgba(0, 240, 255, 0.4);
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
            }
            body.light-mode .og-trilha-modal-header {
                background: #f8fafc;
                border-color: #e2e8f0;
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
                    width: 100%;
                }
                .og-modal-btn {
                    width: 100%;
                    justify-content: center;
                }
            }

            @media (max-width: 460px) {
                .og-modal-actions {
                    grid-template-columns: 1fr;
                    gap: 8px;
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

            /* ══════ ESTILOS DO POPUP DE CONQUISTA DESBLOQUEADA ══════ */
            .og-achievement-popup-container {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000000;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                width: 90%;
                max-width: 480px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .og-achievement-popup {
                pointer-events: auto;
                position: relative;
                width: 100%;
                padding: 16px 20px;
                border-radius: 18px;
                background: linear-gradient(135deg, rgba(13, 20, 36, 0.98), rgba(7, 10, 18, 0.98));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1.5px solid rgba(255, 215, 0, 0.5);
                box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 215, 0, 0.35);
                display: flex;
                align-items: center;
                gap: 16px;
                transform: translateY(-80px) scale(0.92);
                opacity: 0;
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
                overflow: hidden;
                user-select: none;
                cursor: pointer;
            }
            .og-achievement-popup.active {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            .og-achievement-popup.hiding {
                transform: translateY(-50px) scale(0.9);
                opacity: 0;
                transition: transform 0.4s ease, opacity 0.3s ease;
            }
            .og-achievement-shimmer {
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(60deg, transparent 40%, rgba(255, 215, 0, 0.15) 50%, transparent 60%);
                transform: rotate(25deg);
                animation: ogAchShimmer 3.5s infinite;
                pointer-events: none;
            }
            @keyframes ogAchShimmer {
                0% { transform: translateX(-100%) rotate(25deg); }
                100% { transform: translateX(100%) rotate(25deg); }
            }
            .og-achievement-icon-wrap {
                width: 58px;
                height: 58px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                flex-shrink: 0;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.25), rgba(0, 0, 0, 0.5));
                border: 2px solid #ffd700;
                box-shadow: 0 0 18px rgba(255, 215, 0, 0.45);
                animation: ogAchPulse 2s infinite ease-in-out;
            }
            @keyframes ogAchPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 18px rgba(255, 215, 0, 0.45); }
                50% { transform: scale(1.06); box-shadow: 0 0 28px rgba(255, 215, 0, 0.7); }
            }
            .og-achievement-content {
                flex: 1;
                min-width: 0;
            }
            .og-achievement-header {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .og-achievement-badge-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 0.72rem;
                font-weight: 900;
                letter-spacing: 1px;
                color: #ffd700;
                text-transform: uppercase;
            }
            .og-achievement-xp-badge {
                background: rgba(255, 215, 0, 0.18);
                border: 1px solid rgba(255, 215, 0, 0.4);
                color: #ffd700;
                padding: 2px 7px;
                border-radius: 8px;
                font-size: 0.7rem;
                font-weight: 800;
            }
            .og-achievement-title {
                font-size: 1.05rem;
                font-weight: 800;
                color: #ffffff;
                margin-top: 2px;
                line-height: 1.25;
            }
            .og-achievement-desc {
                font-size: 0.8rem;
                color: #94a3b8;
                margin-top: 3px;
                line-height: 1.3;
            }
            .og-achievement-close {
                background: transparent;
                border: none;
                color: #64748b;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 4px 8px;
                transition: color 0.2s;
                border-radius: 8px;
            }
            .og-achievement-close:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.08);
            }

            /* ══════ ESTILOS DA ESTANTE DE TROFÉUS / MURAL DE INSÍGNIAS ══════ */
            .og-trophy-shelf-section {
                width: 100%;
                margin-top: 16px;
                display: flex;
                flex-direction: column;
                gap: 14px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .og-shelf-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                flex-wrap: wrap;
                gap: 8px;
            }
            .og-shelf-title-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .og-shelf-title {
                font-size: 1.05rem;
                font-weight: 800;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            body.light-mode .og-shelf-title {
                color: #0f172a;
            }
            .og-shelf-counter-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 800;
                background: rgba(0, 240, 255, 0.1);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.3);
            }
            .og-shelf-rack {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 16px;
                position: relative;
            }
            .og-trophy-card {
                position: relative;
                padding: 18px 16px;
                border-radius: 18px;
                background: linear-gradient(180deg, rgba(17, 24, 39, 0.9), rgba(10, 14, 23, 0.95));
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                gap: 12px;
                transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                cursor: pointer;
                overflow: hidden;
            }
            body.light-mode .og-trophy-card {
                background: #ffffff;
                border-color: rgba(0, 0, 0, 0.08);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            }
            .og-trophy-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6);
            }
            .og-trophy-card.unlocked {
                border-color: var(--card-cor-borda, rgba(255, 215, 0, 0.4));
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px var(--card-glow, rgba(255, 215, 0, 0.15));
            }
            .og-trophy-card.unlocked:hover {
                box-shadow: 0 14px 35px rgba(0, 0, 0, 0.6), 0 0 30px var(--card-glow, rgba(255, 215, 0, 0.3));
            }
            .og-trophy-card.locked {
                opacity: 0.72;
                background: rgba(10, 14, 23, 0.75);
                border-color: rgba(255, 255, 255, 0.05);
            }
            body.light-mode .og-trophy-card.locked {
                background: #f8fafc;
                opacity: 0.8;
            }
            .og-trophy-card-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
            }
            .og-trophy-icon-wrap {
                width: 52px;
                height: 52px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.85rem;
                flex-shrink: 0;
                background: rgba(0, 0, 0, 0.4);
                border: 1.5px solid rgba(255, 255, 255, 0.1);
                transition: transform 0.25s ease;
            }
            .og-trophy-card.unlocked .og-trophy-icon-wrap {
                background: radial-gradient(circle, var(--card-glow, rgba(255, 215, 0, 0.25)), rgba(0, 0, 0, 0.5));
                border-color: var(--card-cor, #ffd700);
                box-shadow: 0 0 15px var(--card-glow, rgba(255, 215, 0, 0.35));
            }
            .og-trophy-card.locked .og-trophy-icon-wrap {
                filter: grayscale(1) opacity(0.5);
            }
            .og-trophy-card:hover .og-trophy-icon-wrap {
                transform: scale(1.1) rotate(5deg);
            }
            .og-trophy-status-pill {
                padding: 4px 9px;
                border-radius: 8px;
                font-size: 0.68rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .og-trophy-status-pill.unlocked {
                background: rgba(34, 197, 94, 0.15);
                color: #22c55e;
                border: 1px solid rgba(34, 197, 94, 0.4);
            }
            .og-trophy-status-pill.locked {
                background: rgba(255, 255, 255, 0.06);
                color: #94a3b8;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            body.light-mode .og-trophy-status-pill.locked {
                background: rgba(0, 0, 0, 0.05);
                color: #64748b;
                border-color: rgba(0, 0, 0, 0.1);
            }
            .og-trophy-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .og-trophy-name {
                font-size: 1rem;
                font-weight: 800;
                color: #ffffff;
                line-height: 1.25;
            }
            body.light-mode .og-trophy-name {
                color: #0f172a;
            }
            .og-trophy-card.locked .og-trophy-name {
                color: #94a3b8;
            }
            .og-trophy-desc {
                font-size: 0.78rem;
                color: #94a3b8;
                line-height: 1.35;
            }
            body.light-mode .og-trophy-desc {
                color: #64748b;
            }
            .og-trophy-progress-wrap {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: auto;
                padding-top: 6px;
            }
            .og-trophy-progress-labels {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.72rem;
                font-weight: 700;
            }
            .og-trophy-progress-text {
                color: #94a3b8;
            }
            body.light-mode .og-trophy-progress-text {
                color: #64748b;
            }
            .og-trophy-xp-bonus {
                color: #ffd700;
                font-weight: 800;
            }
            .og-trophy-track {
                width: 100%;
                height: 7px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.08);
                overflow: hidden;
                position: relative;
            }
            body.light-mode .og-trophy-track {
                background: rgba(0, 0, 0, 0.08);
            }
            .og-trophy-fill {
                height: 100%;
                border-radius: 4px;
                background: linear-gradient(90deg, #00f0ff, #9d4edd);
                transition: width 0.4s ease;
            }
            .og-trophy-card.unlocked .og-trophy-fill {
                background: linear-gradient(90deg, #22c55e, #10b981);
            }

            /* ══════ MODAL DEDICADO DO MURAL DE TROFÉUS ══════ */
            .og-mural-overlay {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 7, 14, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 100005;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px 16px;
                box-sizing: border-box;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                overflow-y: auto;
                overflow-x: hidden;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
            }
            .og-mural-overlay.active {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }
            .og-mural-modal {
                position: relative;
                width: 100%;
                max-width: 860px;
                max-height: 85vh;
                background: #0b1120;
                border: 1px solid rgba(255, 215, 0, 0.35);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 215, 0, 0.2);
                border-radius: 24px;
                padding: 28px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 20px;
                transform: scale(0.95);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                touch-action: pan-y !important;
            }
            body.light-mode .og-mural-modal {
                background: #ffffff;
                border-color: rgba(255, 215, 0, 0.45);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 0 30px rgba(255, 215, 0, 0.15);
            }
            .og-mural-overlay.active .og-mural-modal {
                transform: scale(1);
            }
            .og-mural-modal-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 16px;
            }
            .og-mural-modal-title {
                font-size: 1.4rem;
                font-weight: 900;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            body.light-mode .og-mural-modal-title {
                color: #0f172a;
            }
            .og-mural-modal-subtitle {
                font-size: 0.85rem;
                color: #94a3b8;
                margin-top: 4px;
            }
            .og-mural-modal-close {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #cbd5e1;
                font-size: 1.1rem;
                border-radius: 12px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            .og-mural-modal-close:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #ffffff;
            }

            /* ══════ ABAS DO HUB GAMER (MISSÕES VS TROFÉUS) ══════ */
            .og-hub-tab-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 14px;
                flex-wrap: wrap;
            }
            .og-hub-tab-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #94a3b8;
                font-weight: 800;
                font-size: 0.88rem;
                cursor: pointer;
                transition: all 0.25s ease;
            }
            .og-hub-tab-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.2);
            }
            .og-hub-tab-btn.active {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(157, 78, 221, 0.15) 100%);
                border-color: #00f0ff;
                color: #00f0ff;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
            }
            body.light-mode .og-hub-tab-btn {
                background: #f1f5f9;
                border-color: #e2e8f0;
                color: #64748b;
            }
            body.light-mode .og-hub-tab-btn.active {
                background: #e0f2fe;
                border-color: #0284c7;
                color: #0284c7;
                box-shadow: 0 0 15px rgba(2, 132, 199, 0.15);
            }
            .og-hub-timer-badge {
                font-size: 0.72rem;
                padding: 3px 8px;
                border-radius: 10px;
                background: rgba(255, 215, 0, 0.12);
                border: 1px solid rgba(255, 215, 0, 0.35);
                color: #ffd700;
                font-weight: 800;
            }

            /* ══════ DASHBOARD DE MISSÕES SEMANAIS COM TIMER ══════ */
            .og-quests-container {
                display: flex;
                flex-direction: column;
                gap: 18px;
                width: 100%;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .og-quests-header-card {
                padding: 22px;
                border-radius: 20px;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%);
                border: 1px solid rgba(0, 240, 255, 0.3);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), inset 0 0 25px rgba(0, 240, 255, 0.05);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            body.light-mode .og-quests-header-card {
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                border-color: rgba(2, 132, 199, 0.3);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            }
            .og-quests-header-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            }
            .og-quests-season-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 0.78rem;
                font-weight: 900;
                letter-spacing: 0.6px;
                text-transform: uppercase;
                background: rgba(0, 240, 255, 0.12);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.35);
            }
            body.light-mode .og-quests-season-tag {
                background: rgba(2, 132, 199, 0.1);
                color: #0284c7;
                border-color: rgba(2, 132, 199, 0.35);
            }
            .og-quests-timer-wrap {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 215, 0, 0.4);
                padding: 6px 16px;
                border-radius: 14px;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.18);
            }
            body.light-mode .og-quests-timer-wrap {
                background: #fefce8;
                border-color: rgba(217, 119, 6, 0.4);
            }
            .og-quests-timer-label {
                font-size: 0.74rem;
                font-weight: 800;
                color: #94a3b8;
                text-transform: uppercase;
            }
            .og-quests-timer-val {
                font-size: 0.95rem;
                font-weight: 900;
                color: #ffd700;
                letter-spacing: 0.8px;
            }
            body.light-mode .og-quests-timer-val {
                color: #b45309;
            }

            .og-quests-alert-banner {
                font-size: 0.8rem;
                color: #cbd5e1;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 10px;
                background: rgba(255, 215, 0, 0.06);
                border: 1px dashed rgba(255, 215, 0, 0.25);
            }
            body.light-mode .og-quests-alert-banner {
                color: #475569;
                background: #fffbeb;
                border-color: rgba(217, 119, 6, 0.25);
            }

            .og-quests-progress-summary {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .og-quests-progress-labels {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.84rem;
                font-weight: 700;
            }
            .og-quests-track {
                width: 100%;
                height: 10px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.06);
                overflow: hidden;
            }
            body.light-mode .og-quests-track {
                background: #e2e8f0;
            }
            .og-quests-fill {
                height: 100%;
                border-radius: 6px;
                background: linear-gradient(90deg, #00f0ff, #9d4edd, #ffd700);
                transition: width 0.4s ease;
            }

            .og-quests-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                gap: 16px;
            }
            @media (max-width: 640px) {
                .og-quests-grid {
                    grid-template-columns: 1fr;
                }
            }

            .og-quest-card {
                padding: 20px;
                border-radius: 18px;
                background: linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(10, 14, 23, 0.95) 100%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                gap: 14px;
                position: relative;
                overflow: hidden;
                transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            }
            body.light-mode .og-quest-card {
                background: #ffffff;
                border-color: #e2e8f0;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
            }
            .og-quest-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
            }
            .og-quest-card.completed {
                border-color: rgba(34, 197, 94, 0.5);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.15);
            }
            .og-quest-card.expired {
                opacity: 0.6;
                border-color: rgba(239, 68, 68, 0.3);
            }

            .og-quest-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
            }
            .og-quest-icon-wrap {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--quest-cor, rgba(0, 240, 255, 0.4));
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
            }
            .og-quest-xp-badge {
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.78rem;
                font-weight: 800;
                background: rgba(255, 215, 0, 0.12);
                border: 1px solid rgba(255, 215, 0, 0.4);
                color: #ffd700;
            }
            .og-quest-title {
                font-size: 1.05rem;
                font-weight: 800;
                color: #ffffff;
            }
            body.light-mode .og-quest-title {
                color: #0f172a;
            }
            .og-quest-desc {
                font-size: 0.84rem;
                color: #94a3b8;
                line-height: 1.45;
            }
            body.light-mode .og-quest-desc {
                color: #475569;
            }

            .og-quest-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-top: auto;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .og-quest-status-pill {
                font-size: 0.74rem;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 10px;
                letter-spacing: 0.5px;
            }
            .og-quest-status-pill.concluida {
                background: rgba(34, 197, 94, 0.15);
                color: #22c55e;
                border: 1px solid rgba(34, 197, 94, 0.4);
            }
            .og-quest-status-pill.andamento {
                background: rgba(0, 240, 255, 0.1);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.3);
            }
            .og-quest-status-pill.expirada {
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.35);
            }

            .og-quest-action-btn {
                padding: 6px 14px;
                border-radius: 10px;
                font-size: 0.78rem;
                font-weight: 700;
                text-decoration: none;
                background: rgba(0, 240, 255, 0.08);
                border: 1px solid rgba(0, 240, 255, 0.3);
                color: var(--accent-cyan, #00f0ff);
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .og-quest-action-btn:hover {
                background: rgba(0, 240, 255, 0.2);
                border-color: #00f0ff;
                color: #ffffff;
            }

            .og-perfect-week-card {
                padding: 22px;
                border-radius: 20px;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(157, 78, 221, 0.15) 100%);
                border: 1px solid rgba(255, 215, 0, 0.4);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 215, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
            }
            body.light-mode .og-perfect-week-card {
                background: linear-gradient(135deg, #fffbeb 0%, #faf5ff 100%);
                border-color: rgba(217, 119, 6, 0.4);
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
                    <!-- Camadas Holográficas Furta-Cor e Especular (Carta Rara 3D) -->
                    <div class="og-card-holo-foil" aria-hidden="true"></div>
                    <div class="og-card-holo-glare" aria-hidden="true"></div>
                    <div class="og-card-holo-sparkles" aria-hidden="true"></div>

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
                            <span id="ogCardXpHeaderLabel">Progresso do Nível</span>
                            <span id="ogCardXpText" style="color:#00f0ff; font-weight: 800;">0 / 500 XP</span>
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

                    <div class="og-card-favorites" id="ogCardFavSection">
                        <div class="og-card-fav-title">⭐ Obras em Destaque</div>
                        <div class="og-card-fav-covers" id="ogCardFavCovers"></div>
                    </div>

                    <div class="og-card-footer">
                        <span>OVERCRITIC ID • AUTENTICADO</span>
                        <span id="ogCardTimestamp">2026</span>
                    </div>
                </div>
 
                <!-- Dica Flutuante de Interação 3D -->
                <div class="og-card-holo-hint" aria-hidden="true">
                    <span>✨</span> Incline o mouse ou o celular para refletir a luz holográfica
                </div>

                <!-- BARRA DE SELEÇÃO DE FORMATO SOCIAL (EXCLUSIVO PARA O TITULAR) -->
                <div class="og-social-format-bar" id="ogCardSocialFormatBar">
                    <span class="og-social-format-title">📐 Formato da Imagem:</span>
                    <div class="og-social-format-pills">
                        <button type="button" class="og-format-pill active" id="ogBtnFmtStories" data-format="stories" title="1080 x 1920 (9:16) • Ideal para Instagram Stories, TikTok e WhatsApp Status">
                            <span>📱</span> Stories (9:16)
                        </button>
                        <button type="button" class="og-format-pill" id="ogBtnFmtPost" data-format="post" title="1080 x 1350 (4:5) • Ideal para Feed do Instagram, Discord e Twitter/X">
                            <span>🖼️</span> Feed / Discord (4:5)
                        </button>
                    </div>
                </div>

                <!-- AVISO DE VISUALIZAÇÃO DE MEMBRO DA COMUNIDADE -->
                <div id="ogCardViewingNotice" style="display: none; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px 14px; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; font-size: 0.82rem; color: #94a3b8; text-align: center;">
                    <span>👁️</span>
                    <span id="ogCardViewingNoticeText">Modo de visualização da comunidade</span>
                </div>

                <div class="og-modal-actions" id="ogCardModalActions">
                    <button type="button" class="og-modal-btn og-btn-download" id="ogBtnDownloadCard" title="Baixar imagem em alta resolução (PNG)">
                        <span>📥</span> Baixar Imagem (PNG)
                    </button>
                    <button type="button" class="og-modal-btn og-btn-share" id="ogBtnShareCard" title="Compartilhar direto no WhatsApp, Instagram ou redes sociais">
                        <span>🚀</span> Compartilhar
                    </button>
                    <button type="button" class="og-modal-btn og-btn-copy" id="ogBtnCopyCard" title="Copiar imagem para colar no Discord ou WhatsApp (Ctrl + V)">
                        <span>📋</span> Copiar Imagem
                    </button>
                    <button type="button" class="og-modal-btn og-btn-trilha" id="ogBtnVerTrilhaModal" title="Consultar detalhes de todos os 10 níveis do Overcritic em modal fixo">
                        <span>🧭</span> Trilha de Patentes
                    </button>
                    <button type="button" class="og-modal-btn og-btn-close" id="ogBtnCloseCard" title="Fechar modal (Esc)">
                        <span>✕</span> Fechar
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

        // Gerenciamento de Formatos Sociais
        let _formatoCardSelecionado = 'stories';
        const btnFmtStories = document.getElementById('ogBtnFmtStories');
        const btnFmtPost = document.getElementById('ogBtnFmtPost');
        if (btnFmtStories && btnFmtPost) {
            btnFmtStories.addEventListener('click', () => {
                _formatoCardSelecionado = 'stories';
                btnFmtStories.classList.add('active');
                btnFmtPost.classList.remove('active');
                preaquecerCanvasGamerCard('stories');
            });
            btnFmtPost.addEventListener('click', () => {
                _formatoCardSelecionado = 'post';
                btnFmtPost.classList.add('active');
                btnFmtStories.classList.remove('active');
                preaquecerCanvasGamerCard('post');
            });
        }

        // Ações: Download, Compartilhar, Copiar
        const btnDownload = document.getElementById('ogBtnDownloadCard');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => processarExportacaoGamerCard('download', _formatoCardSelecionado));
        }
        const btnShare = document.getElementById('ogBtnShareCard');
        if (btnShare) {
            btnShare.addEventListener('click', () => processarExportacaoGamerCard('share', _formatoCardSelecionado));
        }
        const btnCopy = document.getElementById('ogBtnCopyCard');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => processarExportacaoGamerCard('copy', _formatoCardSelecionado));
        }

        // Listener do botão para consultar a Trilha de Patentes sem distorção 3D
        const btnVerTrilha = document.getElementById('ogBtnVerTrilhaModal');
        if (btnVerTrilha) {
            btnVerTrilha.addEventListener('click', () => {
                abrirModalTrilhaPatentes(_ultimoProgressoCard || _dadosCardAtuais);
            });
        }

        return overlay;
    }

    /* ════════════════════════════════════════════════════════
       3.1 MOTOR DE FÍSICA & EFEITO HOLOGRÁFICO 3D (PARALLAX TILT)
    ════════════════════════════════════════════════════════ */
    let _holoTiltState = {
        cardEl: null,
        rafId: null,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        isHovered: false,
        rect: null
    };

    function configurarGamerCardHoloTilt(cardEl) {
        if (!cardEl) return;
        _holoTiltState.cardEl = cardEl;

        const maxAngle = 18; // Ângulo máximo de inclinação em graus

        function updateRect() {
            if (_holoTiltState.cardEl) {
                _holoTiltState.rect = _holoTiltState.cardEl.getBoundingClientRect();
            }
        }

        function renderFrame() {
            // Lerp para suavização cinemática
            const lerpFactor = _holoTiltState.isHovered ? 0.16 : 0.08;
            _holoTiltState.currentX += (_holoTiltState.targetX - _holoTiltState.currentX) * lerpFactor;
            _holoTiltState.currentY += (_holoTiltState.targetY - _holoTiltState.currentY) * lerpFactor;

            const cX = _holoTiltState.currentX;
            const cY = _holoTiltState.currentY;

            const rotX = -cY * maxAngle;
            const rotY = cX * maxAngle;

            const pointerX = ((cX + 1) * 50);
            const pointerY = ((cY + 1) * 50);

            // Ângulo do prisma/foil holográfico
            const angleRad = Math.atan2(cY, cX);
            const angleDeg = (angleRad * (180 / Math.PI)) + 90;

            // Distância normalizada do centro
            const dist = Math.min(1, Math.hypot(cX, cY));

            const holoOpacity = _holoTiltState.isHovered ? (0.45 + dist * 0.45) : (dist * 0.65);
            const glareOpacity = _holoTiltState.isHovered ? (0.35 + dist * 0.45) : (dist * 0.55);

            cardEl.style.setProperty('--og-tilt-x', `${rotX.toFixed(2)}deg`);
            cardEl.style.setProperty('--og-tilt-y', `${rotY.toFixed(2)}deg`);
            cardEl.style.setProperty('--og-pointer-x', `${pointerX.toFixed(1)}%`);
            cardEl.style.setProperty('--og-pointer-y', `${pointerY.toFixed(1)}%`);
            cardEl.style.setProperty('--og-holo-angle', `${angleDeg.toFixed(1)}deg`);
            cardEl.style.setProperty('--og-holo-opacity', `${holoOpacity.toFixed(2)}`);
            cardEl.style.setProperty('--og-glare-opacity', `${glareOpacity.toFixed(2)}`);

            // Sombra reativa à luz dinâmica
            const shadowX = (-cX * 24).toFixed(1);
            const shadowY = (30 + -cY * 20).toFixed(1);
            cardEl.style.boxShadow = `0 ${shadowY}px 70px rgba(0, 0, 0, 0.85), ${shadowX}px 10px 45px rgba(0, 240, 255, 0.28)`;

            if (_holoTiltState.isHovered || dist > 0.005) {
                _holoTiltState.rafId = requestAnimationFrame(renderFrame);
            } else {
                _holoTiltState.rafId = null;
                cardEl.classList.remove('is-tilting');
            }
        }

        function startLoop() {
            if (!_holoTiltState.rafId) {
                cardEl.classList.add('is-tilting');
                cardEl.classList.remove('is-resetting');
                _holoTiltState.rafId = requestAnimationFrame(renderFrame);
            }
        }

        if (!cardEl.__holoConfigured) {
            cardEl.__holoConfigured = true;

            cardEl.addEventListener('mouseenter', () => {
                _holoTiltState.isHovered = true;
                updateRect();
                startLoop();
            });

            cardEl.addEventListener('mousemove', (e) => {
                if (!_holoTiltState.rect) updateRect();
                const r = _holoTiltState.rect;
                if (!r || r.width === 0 || r.height === 0) return;

                const mouseX = e.clientX - r.left;
                const mouseY = e.clientY - r.top;

                _holoTiltState.targetX = Math.max(-1, Math.min(1, (mouseX / r.width) * 2 - 1));
                _holoTiltState.targetY = Math.max(-1, Math.min(1, (mouseY / r.height) * 2 - 1));
                _holoTiltState.isHovered = true;
                startLoop();
            });

            cardEl.addEventListener('mouseleave', () => {
                _holoTiltState.isHovered = false;
                _holoTiltState.targetX = 0;
                _holoTiltState.targetY = 0;
                cardEl.classList.remove('is-tilting');
                cardEl.classList.add('is-resetting');
                startLoop();
            });

            cardEl.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches.length > 0) {
                    if (!_holoTiltState.rect) updateRect();
                    const r = _holoTiltState.rect;
                    if (!r) return;
                    const touch = e.touches[0];
                    const touchX = touch.clientX - r.left;
                    const touchY = touch.clientY - r.top;
                    _holoTiltState.targetX = Math.max(-1, Math.min(1, (touchX / r.width) * 2 - 1));
                    _holoTiltState.targetY = Math.max(-1, Math.min(1, (touchY / r.height) * 2 - 1));
                    _holoTiltState.isHovered = true;
                    startLoop();
                }
            }, { passive: true });

            cardEl.addEventListener('touchend', () => {
                _holoTiltState.isHovered = false;
                _holoTiltState.targetX = 0;
                _holoTiltState.targetY = 0;
                startLoop();
            }, { passive: true });

            window.addEventListener('resize', updateRect);
            window.addEventListener('scroll', updateRect, { passive: true });

            // Giroscópio para celulares (Mobile Gyroscope Parallax)
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', (e) => {
                    const overlay = document.getElementById('ogGamerCardOverlay');
                    if (!overlay || !overlay.classList.contains('active')) return;
                    if (e.gamma === null && e.beta === null) return;

                    const gamma = e.gamma || 0; // -90 a 90
                    const beta = e.beta || 45;  // -180 a 180

                    const normX = Math.max(-1, Math.min(1, gamma / 28));
                    const normY = Math.max(-1, Math.min(1, (beta - 45) / 28));

                    _holoTiltState.targetX = normX;
                    _holoTiltState.targetY = normY;
                    startLoop();
                }, { passive: true });
            }
        }

        updateRect();
        startLoop();
    }

    function pararGamerCardHoloTilt() {
        if (_holoTiltState.rafId) {
            cancelAnimationFrame(_holoTiltState.rafId);
            _holoTiltState.rafId = null;
        }
        if (_holoTiltState.cardEl) {
            _holoTiltState.cardEl.classList.remove('is-tilting');
            _holoTiltState.cardEl.classList.remove('is-resetting');
            _holoTiltState.cardEl.style.removeProperty('--og-tilt-x');
            _holoTiltState.cardEl.style.removeProperty('--og-tilt-y');
            _holoTiltState.cardEl.style.removeProperty('--og-pointer-x');
            _holoTiltState.cardEl.style.removeProperty('--og-pointer-y');
            _holoTiltState.cardEl.style.removeProperty('--og-holo-angle');
            _holoTiltState.cardEl.style.removeProperty('--og-holo-opacity');
            _holoTiltState.cardEl.style.removeProperty('--og-glare-opacity');
            _holoTiltState.cardEl.style.removeProperty('box-shadow');
        }
        _holoTiltState.currentX = 0;
        _holoTiltState.currentY = 0;
        _holoTiltState.targetX = 0;
        _holoTiltState.targetY = 0;
        _holoTiltState.isHovered = false;
    }

    let _dadosCardAtuais = null;
    let _ultimoProgressoCard = null;

    function abrirGamerCardModal(dados = {}) {
        const overlay = garantirModalGamerCard();

        let targetUsername = '';
        let targetUid = '';
        let targetAvatar = '';
        let customJogos = null;
        let customMidias = null;
        let customPlatinas = null;

        if (typeof dados === 'string') {
            targetUsername = dados.trim();
        } else if (dados && typeof dados === 'object') {
            targetUsername = (dados.username || '').trim();
            targetUid = (dados.userId || dados.user_id || '').trim();
            targetAvatar = dados.avatar || '';
            if (Array.isArray(dados.jogos)) customJogos = dados.jogos;
            if (Array.isArray(dados.midias)) customMidias = dados.midias;
            if (Array.isArray(dados.platinas)) customPlatinas = dados.platinas;
        }

        const currentLoggedUser = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim();
        const isSelf = !targetUsername || (currentLoggedUser && targetUsername.toLowerCase() === currentLoggedUser.toLowerCase());

        const username = targetUsername || currentLoggedUser || 'Jogador';
        const uid = targetUid || (isSelf ? (localStorage.getItem('overcritic_user_id') || '') : '');

        // Sempre busca consolidação fresca para recalcular exatamente o estado do usuário solicitado
        const consolidados = obterDadosConsolidadosUsuario(username, uid);
        
        let jogos = customJogos || consolidados.jogos || [];
        let midias = customMidias || consolidados.midias || [];
        let platinas = customPlatinas || consolidados.platinas || [];

        // Avatar específico do usuário alvo
        let userAvatar = targetAvatar;
        if (!userAvatar) {
            if (isSelf) {
                userAvatar = typeof window.getUsuarioAvatarAtual === 'function'
                    ? window.getUsuarioAvatarAtual()
                    : (localStorage.getItem('overcritic_user_avatar') || '🎮');
            } else {
                try {
                    const rankingLista = JSON.parse(localStorage.getItem('overcritic_ranking_comunidade_v26_10') || '[]');
                    const m = rankingLista.find(x => (x.username || '').toLowerCase() === username.toLowerCase());
                    if (m && m.avatar) userAvatar = m.avatar;
                } catch(e) {}
                if (!userAvatar) {
                    try {
                        const contas = JSON.parse(localStorage.getItem('overcritic_contas_diretorio_v26_10') || '[]');
                        const c = contas.find(x => (x.username || '').toLowerCase() === username.toLowerCase());
                        if (c && c.avatar) userAvatar = c.avatar;
                    } catch(e) {}
                }
                if (!userAvatar && username.toLowerCase() === 'pontug') {
                    userAvatar = '👑';
                }
                if (!userAvatar) userAvatar = '🎮';
            }
        }

        dados = {
            username,
            userId: uid,
            avatar: userAvatar,
            isSelf,
            jogos,
            midias,
            platinas
        };

        _dadosCardAtuais = dados;
        invalidarCacheGamerCard();
        if (isSelf) {
            preaquecerCanvasGamerCard('stories');
            setTimeout(() => preaquecerCanvasGamerCard('post'), 300);
        }

        const jogosArr = dados.jogos || [];
        const midiasArr = dados.midias || [];
        const platinasArr = (dados.platinas || []);
        const numJogos = jogosArr.length;
        const numMidias = midiasArr.length;
        const numPlatinas = platinasArr.length;

        const prog = calcularProgressoGamer({
            username,
            jogos: jogosArr,
            midias: midiasArr,
            platinas: platinasArr
        });
        _ultimoProgressoCard = prog;

        // Preenche campos do Card
        const chipEl = document.getElementById('ogCardChip');
        if (chipEl) {
            chipEl.textContent = prog.isDev ? 'PASSE EXCLUSIVO DEV' : 'PASSE GAMER OFICIAL';
            if (prog.isDev) {
                chipEl.style.background = 'rgba(0, 240, 255, 0.15)';
                chipEl.style.color = '#00f0ff';
                chipEl.style.borderColor = 'rgba(0, 240, 255, 0.4)';
            } else {
                chipEl.style.background = '';
                chipEl.style.color = '';
                chipEl.style.borderColor = '';
            }
        }

        document.getElementById('ogCardUsername').textContent = username;
        document.getElementById('ogCardRankIcon').textContent = prog.icone;
        document.getElementById('ogCardRankTitle').textContent = prog.titulo;
        document.getElementById('ogCardRankTitle').style.color = prog.cor;
        document.getElementById('ogCardRankNv').textContent = prog.isDev ? `• DEV` : `• Nv. ${prog.nivel}`;
        const xpHeaderLabel = document.getElementById('ogCardXpHeaderLabel');
        if (xpHeaderLabel) {
            if (prog.isDev) {
                xpHeaderLabel.innerHTML = `Patente Exclusiva de Desenvolvedor <span style="font-size: 0.72rem; color: var(--text-muted, #94a3b8); font-weight: 600;">(Total: ${prog.xpTotal.toLocaleString('pt-BR')} XP)</span>`;
            } else {
                xpHeaderLabel.innerHTML = `Progresso do Nível ${prog.nivel} <span style="font-size: 0.72rem; color: var(--text-muted, #94a3b8); font-weight: 600;">(Total: ${prog.xpTotal.toLocaleString('pt-BR')} XP)</span>`;
            }
        }
        const xpTextEl = document.getElementById('ogCardXpText');
        if (xpTextEl) {
            if (prog.isDev) {
                xpTextEl.textContent = `ACESSO TOTAL (DEV)`;
                xpTextEl.title = `Patente exclusiva do Criador e Desenvolvedor do Overcritic (Inalcançável para outros membros).`;
            } else {
                xpTextEl.textContent = prog.proximoNivel
                    ? `${prog.xpNoNivel.toLocaleString('pt-BR')} / ${prog.faixaXp.toLocaleString('pt-BR')} XP`
                    : `${prog.xpTotal.toLocaleString('pt-BR')} XP (MÁX)`;
                xpTextEl.title = `Progresso no Nível ${prog.nivel}: ${prog.xpNoNivel.toLocaleString('pt-BR')} XP conquistados de ${prog.faixaXp.toLocaleString('pt-BR')} XP necessários para o próximo nível. Reputação Total: ${prog.xpTotal.toLocaleString('pt-BR')} XP.`;
            }
        }
        document.getElementById('ogCardXpFill').style.width = `${prog.porcentagem}%`;
        if (prog.isDev) {
            document.getElementById('ogCardXpFill').style.background = 'linear-gradient(90deg, #00f0ff, #a855f7)';
        } else {
            document.getElementById('ogCardXpFill').style.background = '';
        }

        // Indicador de quanto falta para o próximo ranking
        const nextRankDesc = document.getElementById('ogCardNextRankDesc');
        const missingXpEl = document.getElementById('ogCardMissingXp');

        if (prog.isDev) {
            if (nextRankDesc) {
                nextRankDesc.innerHTML = `🛠️ <strong>Patente Suprema de Desenvolvedor</strong> (Inalcançável)`;
            }
            if (missingXpEl) {
                missingXpEl.textContent = `DEV`;
                missingXpEl.style.display = 'inline-block';
                missingXpEl.style.color = '#00f0ff';
                missingXpEl.style.background = 'rgba(0, 240, 255, 0.15)';
                missingXpEl.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                missingXpEl.title = 'Patente exclusiva do criador e desenvolvedor do Overcritic';
            }
        } else if (prog.proximoNivel) {
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
            if (prog.isDev) {
                quickSummary.innerHTML = `
                    <div class="og-ladder-pill current" style="border-color:#00f0ff; color:#00f0ff; width: 100%; justify-content: center; background: rgba(0, 240, 255, 0.12); box-shadow: 0 0 14px rgba(0, 240, 255, 0.2);">
                        <span>🛠️</span>
                        <span>Patente Exclusiva: DEV • Criador & Desenvolvedor (Inalcançável)</span>
                    </div>
                `;
            } else if (prog.proximoNivel) {
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
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:${lvl.bg}; color:${lvl.cor}; border:1px solid ${lvl.cor};">📍 Nível Atual (${prog.xpNoNivel.toLocaleString('pt-BR')} / ${prog.faixaXp.toLocaleString('pt-BR')} XP)</span>`;
                } else if (isConquered) {
                    itemClass = 'is-conquered';
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);">✓ Conquistado</span>`;
                } else if (isNext) {
                    itemClass = 'is-next';
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 215, 0, 0.15); color:#ffd700; border:1px solid rgba(255, 215, 0, 0.4); box-shadow:0 0 8px rgba(255, 215, 0, 0.2);">🎯 Próximo (Faltam ${prog.xpRestante.toLocaleString('pt-BR')} XP)</span>`;
                } else {
                    itemClass = 'is-locked';
                    const diff = Math.max(0, lvl.minXp - prog.xpTotal);
                    badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 255, 255, 0.05); color:#94a3b8; border:1px solid rgba(255, 255, 255, 0.08);">🔒 Faltam ${diff.toLocaleString('pt-BR')} XP no total</span>`;
                }

                const reqTexto = lvl.xpNecessario > 0
                    ? `Requisito: ${lvl.xpNecessario.toLocaleString('pt-BR')} XP no nível <span style="opacity:0.75; font-size:0.68rem;">(Total acumulado: ${lvl.minXp.toLocaleString('pt-BR')} XP)</span>`
                    : `Patente Suprema <span style="opacity:0.75; font-size:0.68rem;">(Acima de ${lvl.minXp.toLocaleString('pt-BR')} XP)</span>`;

                return `
                    <div class="og-ladder-item ${itemClass}">
                        <div class="og-ladder-item-left">
                            <span class="og-ladder-item-icon">${lvl.icone}</span>
                            <div>
                                <div class="og-ladder-item-title" style="color: ${isCurrent ? lvl.cor : ''}">${lvl.titulo} <span style="font-size:0.68rem; opacity:0.8;">• Nv. ${lvl.nivel}</span></div>
                                <div class="og-ladder-item-sub">${reqTexto}</div>
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
        const userAvatarParaExibir = dados.avatar || '🎮';
        if (typeof window.renderizarAvatarHtml === 'function') {
            avatarEl.innerHTML = window.renderizarAvatarHtml(userAvatarParaExibir, username.charAt(0).toUpperCase() || '🎮');
        } else {
            avatarEl.textContent = username.charAt(0).toUpperCase() || '🎮';
        }

        // Favoritos (Top 3 Melhores Avaliados) com visual idêntico ao Gamer Card Oficial
        const favContainer = document.getElementById('ogCardFavCovers');
        if (favContainer) {
            favContainer.innerHTML = '';
            const combinados = [
                ...(dados.jogos || []).map(j => ({ titulo: j.titulo, capa: j.capaUrl || j.capa, nota: parseFloat(j.minhaNota || j.nota || 0) })),
                ...(dados.midias || []).map(m => ({ titulo: m.title || m.titulo, capa: m.coverUrl || m.cover_url, nota: parseFloat(m.myRating || m.nota || 0) }))
            ].sort((a, b) => b.nota - a.nota).slice(0, 3);

            const favSection = document.getElementById('ogCardFavSection');
            if (favSection) favSection.style.display = 'flex';

            for (let i = 0; i < 3; i++) {
                const c = combinados[i];
                if (c) {
                    const item = document.createElement('div');
                    item.className = 'og-card-fav-item';
                    if (c.capa) {
                        item.style.backgroundImage = `url('${c.capa}')`;
                    }
                    item.title = `${c.titulo} (Nota ${c.nota.toFixed(1)})`;
                    const titCurto = c.titulo.length > 15 ? c.titulo.substring(0, 13) + '..' : c.titulo;
                    item.innerHTML = `
                        <span class="og-card-fav-badge">★ ${c.nota.toFixed(1)}</span>
                        <span class="og-card-fav-name" title="${c.titulo}">${titCurto}</span>
                    `;
                    favContainer.appendChild(item);
                } else {
                    const empty = document.createElement('div');
                    empty.className = 'og-card-fav-empty';
                    empty.innerHTML = `<span>🎮</span><span>+ Avaliar</span>`;
                    empty.title = 'Avalie mais obras para preencher este destaque!';
                    favContainer.appendChild(empty);
                }
            }
        }

        document.getElementById('ogCardTimestamp').textContent = new Date().toLocaleDateString('pt-BR');

        // Configuração de Ações (Apenas o próprio titular do Gamer Card pode exportar e compartilhar)
        const formatBarEl = document.getElementById('ogCardSocialFormatBar');
        const viewingNoticeEl = document.getElementById('ogCardViewingNotice');
        const viewingNoticeText = document.getElementById('ogCardViewingNoticeText');
        const btnShare = document.getElementById('ogBtnShareCard');
        const btnCopy = document.getElementById('ogBtnCopyCard');
        const btnDownload = document.getElementById('ogBtnDownloadCard');
        const btnClose = document.getElementById('ogBtnCloseCard');

        if (isSelf) {
            if (formatBarEl) formatBarEl.style.display = 'flex';
            if (viewingNoticeEl) viewingNoticeEl.style.display = 'none';
            if (btnShare) btnShare.style.display = 'inline-flex';
            if (btnCopy) btnCopy.style.display = 'inline-flex';
            if (btnDownload) btnDownload.style.display = 'inline-flex';
            if (btnClose) {
                btnClose.style.flex = '0 0 auto';
                btnClose.style.minWidth = '65px';
                btnClose.textContent = '✕ Fechar';
            }
        } else {
            if (formatBarEl) formatBarEl.style.display = 'none';
            if (viewingNoticeEl) {
                viewingNoticeEl.style.display = 'flex';
                if (viewingNoticeText) {
                    viewingNoticeText.innerHTML = `Visualizando Passe Gamer Oficial de <strong>${username}</strong>`;
                }
            }
            if (btnShare) btnShare.style.display = 'none';
            if (btnCopy) btnCopy.style.display = 'none';
            if (btnDownload) btnDownload.style.display = 'none';
            if (btnClose) {
                btnClose.style.flex = '1';
                btnClose.style.minWidth = '100%';
                btnClose.textContent = '✕ Fechar Visualização';
            }
        }

        const cardPreviewEl = document.getElementById('ogCardPreview');
        if (cardPreviewEl) {
            cardPreviewEl.scrollLeft = 0;
            cardPreviewEl.scrollTop = 0;
            configurarGamerCardHoloTilt(cardPreviewEl);
        }

        overlay.classList.add('active');
        bloquearScrollFundo();

        if (window.OvercriticAudio) {
            window.OvercriticAudio.play('modal_open');
        }
    }

    function fecharGamerCardModal() {
        pararGamerCardHoloTilt();
        const overlay = document.getElementById('ogGamerCardOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            liberarScrollFundo();
            if (window.OvercriticAudio) {
                window.OvercriticAudio.play('modal_close');
            }
        }
    }

    /* ════════════════════════════════════════════════════════
       3.0 MODAL DEDICADO DA TRILHA DE PATENTES (ESTÁTICO & SEM PARALLAX)
    ════════════════════════════════════════════════════════ */
    function garantirModalTrilhaPatentes() {
        injetarEstilosGamificacao();
        let overlay = document.getElementById('ogTrilhaPatentesOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogTrilhaPatentesOverlay';
        overlay.className = 'og-modal-overlay og-trilha-overlay';
        overlay.style.zIndex = '100020';
        overlay.innerHTML = `
            <div class="og-trilha-modal">
                <div class="og-trilha-modal-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">🧭</span>
                        <div>
                            <div style="font-weight: 900; font-size: 1.05rem; color: #f1f5f9; letter-spacing: 0.5px;">Trilha de Patentes do Overcritic</div>
                            <div style="font-size: 0.74rem; color: #94a3b8;">Consulte todos os 10 níveis do ranking gamer, critérios e requisitos de XP</div>
                        </div>
                    </div>
                    <button type="button" class="og-card-close-btn" id="ogBtnCloseTrilhaPatentes" title="Fechar (Esc)">✕</button>
                </div>
                <div class="og-trilha-modal-body" id="ogTrilhaPatentesBody"></div>
                <div class="og-trilha-modal-footer" style="padding: 12px 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.25);">
                    <button type="button" class="og-modal-btn og-btn-close" id="ogBtnCloseTrilhaPatentesFooter" style="min-width: 110px;">✕ Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModalTrilhaPatentes();
        });
        const closeBtn1 = document.getElementById('ogBtnCloseTrilhaPatentes');
        if (closeBtn1) closeBtn1.addEventListener('click', fecharModalTrilhaPatentes);
        const closeBtn2 = document.getElementById('ogBtnCloseTrilhaPatentesFooter');
        if (closeBtn2) closeBtn2.addEventListener('click', fecharModalTrilhaPatentes);

        return overlay;
    }

    function abrirModalTrilhaPatentes(dadosOuProg) {
        const overlay = garantirModalTrilhaPatentes();
        let prog = null;
        if (dadosOuProg && dadosOuProg.nivel !== undefined) {
            prog = dadosOuProg;
        } else {
            const username = (dadosOuProg && dadosOuProg.username) || localStorage.getItem('overcritic_currentUser') || 'pontuG';
            prog = calcularProgressoGamer({ username });
        }

        const bodyEl = document.getElementById('ogTrilhaPatentesBody');
        if (bodyEl && prog) {
            bodyEl.innerHTML = `
                <!-- RESUMO DO STATUS ATUAL DO JOGADOR -->
                <div class="og-trilha-user-card" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Sua Reputação Atual</span>
                        <span style="font-size: 0.78rem; font-weight: 900; color: #00f0ff;">${prog.xpTotal.toLocaleString('pt-BR')} XP Total</span>
                    </div>
                    ${prog.isDev ? `
                        <div class="og-ladder-pill current" style="border-color:#00f0ff; color:#00f0ff; width: 100%; justify-content: center; background: rgba(0, 240, 255, 0.15); box-shadow: 0 0 14px rgba(0, 240, 255, 0.25); padding: 8px 12px; font-size: 0.82rem;">
                            <span>🛠️</span>
                            <span>Patente Exclusiva: DEV • Criador & Desenvolvedor (Inalcançável)</span>
                        </div>
                    ` : `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                            <div class="og-ladder-pill current" style="padding: 6px 12px; font-size: 0.8rem;">
                                <span>${prog.icone}</span>
                                <span>Nv. ${prog.nivel} ${prog.titulo}</span>
                            </div>
                            ${prog.proximoNivel ? `
                                <span class="og-ladder-bridge">${prog.porcentagem}% ➔</span>
                                <div class="og-ladder-pill next" style="padding: 6px 12px; font-size: 0.8rem;">
                                    <span>${prog.proximoNivel.icone}</span>
                                    <span>Nv. ${prog.proximoNivel.nivel} ${prog.proximoNivel.titulo} (Faltam ${prog.xpRestante.toLocaleString('pt-BR')} XP)</span>
                                </div>
                            ` : `
                                <div class="og-ladder-pill current" style="border-color:#ef4444; color:#ef4444; padding: 6px 12px; font-size: 0.8rem;">
                                    <span>🔥</span>
                                    <span>Nv. 10 Lenda • Patente Suprema!</span>
                                </div>
                            `}
                        </div>
                        <div class="og-xp-track" style="height: 10px; background: rgba(255, 255, 255, 0.08); border-radius: 5px; overflow: hidden; margin-top: 4px;">
                            <div class="og-xp-fill" style="width: ${prog.porcentagem}%; height: 100%; background: linear-gradient(90deg, #00f0ff, #9d4edd);"></div>
                        </div>
                    `}
                </div>

                <!-- LISTA COMPLETA DOS 10 NÍVEIS -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-size: 0.76rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Todas as Patentes & Requisitos</div>
                    ${NIVEIS_GAMER.map(lvl => {
                        const isCurrent = lvl.nivel === prog.nivel;
                        const isConquered = lvl.nivel < prog.nivel;
                        const isNext = prog.proximoNivel && lvl.nivel === prog.proximoNivel.nivel;

                        let itemClass = '';
                        let badgeHtml = '';

                        if (isCurrent) {
                            itemClass = 'is-current';
                            badgeHtml = `<span class="og-ladder-item-badge" style="background:${lvl.bg}; color:${lvl.cor}; border:1px solid ${lvl.cor};">📍 Patente Atual</span>`;
                        } else if (isConquered) {
                            itemClass = 'is-conquered';
                            badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(34, 197, 94, 0.12); color:#22c55e; border:1px solid rgba(34, 197, 94, 0.3);">✓ Conquistada</span>`;
                        } else if (isNext) {
                            itemClass = 'is-next';
                            badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 215, 0, 0.15); color:#ffd700; border:1px solid rgba(255, 215, 0, 0.4); box-shadow:0 0 8px rgba(255, 215, 0, 0.2);">🎯 Próximo Alvo</span>`;
                        } else {
                            itemClass = 'is-locked';
                            const diff = Math.max(0, lvl.minXp - prog.xpTotal);
                            badgeHtml = `<span class="og-ladder-item-badge" style="background:rgba(255, 255, 255, 0.05); color:#94a3b8; border:1px solid rgba(255, 255, 255, 0.08);">🔒 Faltam ${diff.toLocaleString('pt-BR')} XP</span>`;
                        }

                        const reqTexto = lvl.xpNecessario > 0
                            ? `Requisito: ${lvl.xpNecessario.toLocaleString('pt-BR')} XP no nível <span style="opacity:0.75; font-size:0.7rem;">(Total acumulado: ${lvl.minXp.toLocaleString('pt-BR')} XP)</span>`
                            : `Patente Suprema <span style="opacity:0.75; font-size:0.7rem;">(Acima de ${lvl.minXp.toLocaleString('pt-BR')} XP)</span>`;

                        return `
                            <div class="og-ladder-item ${itemClass}" style="padding: 10px 12px;">
                                <div class="og-ladder-item-left" style="gap: 12px;">
                                    <span class="og-ladder-item-icon" style="font-size: 1.35rem; width: 28px;">${lvl.icone}</span>
                                    <div>
                                        <div class="og-ladder-item-title" style="font-size: 0.88rem; color: ${isCurrent ? lvl.cor : ''}">${lvl.titulo} <span style="font-size:0.72rem; opacity:0.8;">• Nv. ${lvl.nivel}</span></div>
                                        <div class="og-ladder-item-sub" style="font-size: 0.72rem; margin-top: 2px;">${reqTexto}</div>
                                    </div>
                                </div>
                                <div>${badgeHtml}</div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- DICAS DE GANHO DE XP -->
                <div class="og-ladder-hints" style="font-size: 0.76rem; color: #94a3b8; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 10px 14px; margin-top: 4px; line-height: 1.5;">
                    💡 <strong>Como subir na Trilha:</strong><br>
                    • <strong>Platinas (100%):</strong> +150 a 600 XP (conforme a dificuldade do jogo)<br>
                    • <strong>Críticas & Resenhas:</strong> +100 a 200 XP por análise detalhada<br>
                    • <strong>Missões Semanais & Duelos:</strong> bônus extras de reputação no Hub Gamer
                </div>
            `;
        }

        overlay.classList.add('active');
        bloquearScrollFundo();
        if (window.OvercriticAudio) {
            window.OvercriticAudio.play('modal_open');
        }
    }

    function fecharModalTrilhaPatentes() {
        const overlay = document.getElementById('ogTrilhaPatentesOverlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            liberarScrollFundo();
            if (window.OvercriticAudio) {
                window.OvercriticAudio.play('modal_close');
            }
        }
    }

    /**
     * Carrega imagem de forma segura evitando bloqueios de CORS e quedas de rede
     */
    function carregarImagemSegura(url, timeoutMs = 4000) {
        return new Promise((resolve) => {
            if (!url || typeof url !== 'string' || !url.trim()) return resolve(null);
            const limpo = url.trim();

            const timer = setTimeout(() => {
                resolve(null);
            }, timeoutMs);

            const img = new Image();
            if (!limpo.startsWith('data:image/')) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                clearTimeout(timer);
                resolve(img);
            };
            img.onerror = () => {
                clearTimeout(timer);
                // Se falhou com crossOrigin e era URL de dados, tenta carregar direto
                if (limpo.startsWith('data:image/')) {
                    const img2 = new Image();
                    img2.onload = () => resolve(img2);
                    img2.onerror = () => resolve(null);
                    img2.src = limpo;
                } else {
                    resolve(null);
                }
            };
            img.src = limpo;
        });
    }

    /**
     * Auxiliar de desenho para retângulos arredondados com preenchimento e borda
     */
    function desenharRoundBox(ctx, x, y, w, h, r, fillStyle, strokeStyle, strokeWidth) {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.rect(x, y, w, h);
        }
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle && strokeWidth) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
        ctx.restore();
    }

    // Cache de renderização do Gamer Card em alta resolução (Stories e Post)
    const _cacheCanvasGamerCard = {
        stories: null,
        post: null
    };

    function invalidarCacheGamerCard() {
        _cacheCanvasGamerCard.stories = null;
        _cacheCanvasGamerCard.post = null;
    }

    async function preaquecerCanvasGamerCard(formato = 'stories') {
        try {
            if (!_cacheCanvasGamerCard[formato]) {
                const cv = await gerarCanvasGamerCardPro(formato);
                _cacheCanvasGamerCard[formato] = cv;
            }
        } catch (e) {
            console.warn('Pré-aquecimento do Gamer Card:', e);
        }
    }

    /**
     * Converte dataURL para File de forma 100% síncrona (preserva o User Gesture Token no Chrome)
     */
    function dataURLtoFileSync(dataUrl, fileName) {
        const arr = dataUrl.split(',');
        const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    }

    /**
     * Desenha a capa da obra de forma inteligente, 100% centralizada e completa:
     * - Imagens horizontais (como o banner do God of War 460x215) são exibidas INTEIRAS, sem cortes
     * - Imagens verticais (pôsteres) ou quadradas também são exibidas completas e centralizadas
     * - Fundo com textura atmosférica suave escurecida da própria obra para visual cinematográfico
     */
    function desenharCapaGamerCardPro(ctx, img, px, py, cardW, cardH, radius = 16, tituloFallback = '') {
        ctx.save();

        // 1. Recorte do card base com cantos arredondados
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(px, py, cardW, cardH, radius);
        } else {
            ctx.rect(px, py, cardW, cardH);
        }
        ctx.clip();

        // Fundo escuro base do card
        const gradFundo = ctx.createLinearGradient(px, py, px, py + cardH);
        gradFundo.addColorStop(0, '#0c1527');
        gradFundo.addColorStop(1, '#060913');
        ctx.fillStyle = gradFundo;
        ctx.fillRect(px, py, cardW, cardH);

        if (img && img.width && img.height) {
            // 2. Fundo atmosférico suave com a própria arte expandida (Ambient Glow)
            ctx.save();
            ctx.globalAlpha = 0.30;
            const bgRatio = img.width / img.height;
            const targetRatio = cardW / cardH;
            let sW, sH, sx, sy;
            if (bgRatio > targetRatio) {
                sH = img.height;
                sW = img.height * targetRatio;
                sx = (img.width - sW) / 2;
                sy = 0;
            } else {
                sW = img.width;
                sH = img.width / targetRatio;
                sx = 0;
                sy = (img.height - sH) / 2;
            }
            ctx.drawImage(img, sx, sy, sW, sH, px, py, cardW, cardH);

            // Escurece o fundo atmosférico para garantir contraste e foco na arte central
            ctx.fillStyle = 'rgba(5, 8, 18, 0.78)';
            ctx.fillRect(px, py, cardW, cardH);
            ctx.restore();

            // 3. A Imagem Principal Centralizada e COMPLETA (SEM NENHUM CORTE - CONTAIN)
            const imgRatio = img.width / img.height;
            const isWide = imgRatio > 1.05; // banners horizontais (ex: God of War Steam 460x215)

            // Espaçamento de segurança para margem de vitrine
            const margemX = isWide ? 4 : 8;
            const maxW = cardW - (margemX * 2);
            const maxH = cardH;

            // Calcula proporção contain para aparecer 100% completa
            const escala = Math.min(maxW / img.width, maxH / img.height);
            const dw = Math.round(img.width * escala);
            const dh = Math.round(img.height * escala);
            const dx = Math.round(px + (cardW - dw) / 2);
            const dy = Math.round(py + (cardH - dh) / 2);

            // Sombra suave sob a imagem centralizada
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 4;

            // Desenha a imagem principal com cantos sutilmente arredondados
            const imgRadius = 8;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(dx, dy, dw, dh, imgRadius);
            } else {
                ctx.rect(dx, dy, dw, dh);
            }
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.clip();
            ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
            ctx.restore();

            // Borda sutil neon na arte centralizada para destacar o banner
            if (isWide) {
                desenharRoundBox(ctx, dx, dy, dw, dh, 8, null, 'rgba(0, 240, 255, 0.25)', 1);
            }
        } else {
            // Fallback elegante cyberpunk caso imagem não carregue ou bloqueie CORS
            const gradCapa = ctx.createLinearGradient(px, py, px, py + cardH);
            gradCapa.addColorStop(0, '#1e293b');
            gradCapa.addColorStop(1, '#0f172a');
            desenharRoundBox(ctx, px, py, cardW, cardH, radius, gradCapa, 'rgba(0, 240, 255, 0.3)', 2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '60px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎮', px + cardW / 2, py + cardH / 2 - 20);

            if (tituloFallback) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '800 18px "Inter", sans-serif';
                const titAbrev = tituloFallback.length > 18 ? tituloFallback.substring(0, 16) + '...' : tituloFallback;
                ctx.fillText(titAbrev, px + cardW / 2, py + cardH / 2 + 30);
            }
        }

        ctx.restore();

        // Moldura externa neon do card
        desenharRoundBox(ctx, px, py, cardW, cardH, radius, null, 'rgba(0, 240, 255, 0.35)', 2);
    }

    /**
     * Helper para download do Canvas gerado
     */
    function baixarCanvasComoArquivo(canvas, fileName) {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
            if (window.showToast) window.showToast.success('Gamer Card baixado com sucesso!');
        } catch (e) {
            console.error('Erro ao baixar canvas:', e);
            if (window.showToast) window.showToast.error('Não foi possível salvar o arquivo.');
        }
    }

    /**
     * Gera o Canvas Ultra-HD estilizado nos formatos Stories (9:16) ou Feed/Discord (4:5)
     */
    async function gerarCanvasGamerCardPro(formato = 'stories') {
        const dados = _dadosCardAtuais || {};
        const username = dados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const isSelf = !dados.username || dados.username.toLowerCase() === (localStorage.getItem('overcritic_currentUser') || '').toLowerCase();
        const jogosArr = dados.jogos || [];
        const midiasArr = dados.midias || [];
        const platinasArr = (dados.platinas || []);
        const numJogos = jogosArr.length;
        const numMidias = midiasArr.length;
        const numPlatinas = platinasArr.length;

        const prog = calcularProgressoGamer({ username, jogos: jogosArr, midias: midiasArr, platinas: platinasArr });

        // Média de Notas
        let somaNotas = 0;
        let countNotas = 0;
        jogosArr.forEach(j => {
            const n = parseFloat(j.minhaNota || j.nota || 0);
            if (n > 0) { somaNotas += n; countNotas++; }
        });
        const mediaFinal = countNotas > 0 ? (somaNotas / countNotas).toFixed(1) : '10.0';

        // Dimensões segundo o formato
        const isStories = formato === 'stories';
        const width = 1080;
        const height = isStories ? 1920 : 1350;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Carrega avatar em segundo plano
        let userAvatarRaw = dados.avatar;
        if (!userAvatarRaw) {
            userAvatarRaw = (isSelf && typeof window.getUsuarioAvatarAtual === 'function')
                ? window.getUsuarioAvatarAtual()
                : (localStorage.getItem('overcritic_user_avatar') || '🎮');
        }
        
        const avatarImgPromise = (userAvatarRaw && (userAvatarRaw.startsWith('http') || userAvatarRaw.startsWith('data:image/')))
            ? carregarImagemSegura(userAvatarRaw, 3000)
            : Promise.resolve(null);

        // Seleciona as 3 principais obras avaliadas
        const topObras = [
            ...jogosArr.map(j => ({ titulo: j.titulo || 'Jogo', capa: j.capaUrl || j.capa, nota: parseFloat(j.minhaNota || j.nota || 0), tipo: 'jogo' })),
            ...midiasArr.map(m => ({ titulo: m.title || m.titulo || 'Mídia', capa: m.coverUrl || m.cover_url, nota: parseFloat(m.myRating || m.nota || 0), tipo: 'midia' }))
        ].sort((a, b) => b.nota - a.nota).slice(0, 3);

        const capasPromises = topObras.map(o => carregarImagemSegura(o.capa, 3000));

        // Aguarda carregamento de imagens com timeout seguro
        const [avatarImg, ...capasImgs] = await Promise.all([avatarImgPromise, ...capasPromises]);

        // ════════ 1. FUNDO CYBERPUNK GLASS ════════
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#040711');
        bgGrad.addColorStop(0.35, '#0b1326');
        bgGrad.addColorStop(0.75, '#0e1830');
        bgGrad.addColorStop(1, '#050814');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Brilhos Radiais Neon
        const rTop = ctx.createRadialGradient(240, 240, 30, 240, 240, 650);
        rTop.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
        rTop.addColorStop(1, 'transparent');
        ctx.fillStyle = rTop;
        ctx.fillRect(0, 0, width, height);

        const rMid = ctx.createRadialGradient(850, 750, 40, 850, 750, 700);
        rMid.addColorStop(0, 'rgba(157, 78, 221, 0.26)');
        rMid.addColorStop(1, 'transparent');
        ctx.fillStyle = rMid;
        ctx.fillRect(0, 0, width, height);

        const rBot = ctx.createRadialGradient(300, height - 200, 30, 300, height - 200, 650);
        rBot.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
        rBot.addColorStop(1, 'transparent');
        ctx.fillStyle = rBot;
        ctx.fillRect(0, 0, width, height);

        // Molduras Holográficas Externas
        desenharRoundBox(ctx, 30, 30, width - 60, height - 60, 28, null, 'rgba(0, 240, 255, 0.5)', 6);
        desenharRoundBox(ctx, 44, 44, width - 88, height - 88, 22, null, 'rgba(157, 78, 221, 0.35)', 2);

        // ════════ 2. HEADER: LOGO E BADGE ════════
        ctx.fillStyle = '#00f0ff';
        ctx.font = '900 42px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 OVERCRITIC', 80, 115);

        // Tag oficial
        desenharRoundBox(ctx, width - 360, 78, 280, 48, 12, 'rgba(0, 240, 255, 0.12)', 'rgba(0, 240, 255, 0.4)', 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 18px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PASSE GAMER OFICIAL', width - 220, 108);
        ctx.textAlign = 'left';

        // Divisória do Topo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 148);
        ctx.lineTo(width - 80, 148);
        ctx.stroke();

        if (isStories) {
            // ════════ LAYOUT STORIES (9:16 - 1080 x 1920) ════════

            // 1. Bloco de Perfil Centralizado
            const avatarCenterY = 320;
            const avatarRadius = 88;

            // Halo de brilho do avatar
            const avatarHalo = ctx.createRadialGradient(width / 2, avatarCenterY, 60, width / 2, avatarCenterY, 130);
            avatarHalo.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
            avatarHalo.addColorStop(1, 'transparent');
            ctx.fillStyle = avatarHalo;
            ctx.fillRect(width / 2 - 140, avatarCenterY - 140, 280, 280);

            // Borda do Avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, avatarCenterY, avatarRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#0b1326';
            ctx.fill();
            ctx.clip();

            if (avatarImg) {
                ctx.drawImage(avatarImg, width / 2 - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
            } else {
                ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
                ctx.fillRect(width / 2 - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 80px "Inter", sans-serif';
                ctx.textAlign = 'center';
                const charFallback = (userAvatarRaw && userAvatarRaw.length <= 4) ? userAvatarRaw : (username.charAt(0).toUpperCase() || '🎮');
                ctx.fillText(charFallback, width / 2, avatarCenterY + 28);
            }
            ctx.restore();

            // Anel externo neon
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(width / 2, avatarCenterY, avatarRadius + 3, 0, Math.PI * 2);
            ctx.stroke();

            // Nome do Usuário
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 56px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(username, width / 2, 475);

            // Badge de Patente
            desenharRoundBox(ctx, width / 2 - 250, 505, 500, 52, 26, 'rgba(15, 23, 42, 0.9)', prog.cor || '#00f0ff', 2);
            ctx.fillStyle = prog.cor || '#00f0ff';
            ctx.font = '800 24px "Inter", sans-serif';
            const textoBadgeCanvas = prog.isDev ? `${prog.icone} PATENTE EXCLUSIVA • ${prog.titulo.toUpperCase()}` : `${prog.icone} NÍVEL ${prog.nivel} • ${prog.titulo.toUpperCase()}`;
            ctx.fillText(textoBadgeCanvas, width / 2, 540);

            // 2. Barra de Experiência XP
            const xpBoxY = 590;
            desenharRoundBox(ctx, 80, xpBoxY, width - 160, 110, 18, 'rgba(0, 0, 0, 0.4)', 'rgba(255, 255, 255, 0.1)', 1.5);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '800 20px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`XP NO NÍVEL: ${prog.xpNoNivel.toLocaleString('pt-BR')} / ${prog.faixaXp.toLocaleString('pt-BR')} XP (${prog.porcentagem}%) • TOTAL: ${prog.xpTotal.toLocaleString('pt-BR')} XP`, 110, xpBoxY + 40);

            // Barra Track
            desenharRoundBox(ctx, 110, xpBoxY + 55, width - 220, 20, 10, 'rgba(255, 255, 255, 0.1)', null, 0);
            const xpFillWidth = Math.max(30, (width - 220) * (prog.porcentagem / 100));
            const xpFillGrad = ctx.createLinearGradient(110, 0, 110 + xpFillWidth, 0);
            xpFillGrad.addColorStop(0, '#00f0ff');
            xpFillGrad.addColorStop(1, '#9d4edd');
            desenharRoundBox(ctx, 110, xpBoxY + 55, xpFillWidth, 20, 10, xpFillGrad, null, 0);

            // 3. Quatro Caixas de Estatísticas (Grid 2x2)
            const stats = [
                { label: 'JOGOS AVALIADOS', val: numJogos, cor: '#ffffff', icone: '🎮' },
                { label: 'FILMES & SÉRIES', val: numMidias, cor: '#ffffff', icone: '🎬' },
                { label: 'PLATINAS (100%)', val: numPlatinas, cor: '#ffd700', icone: '🏆' },
                { label: 'MÉDIA PESSOAL', val: mediaFinal, cor: '#00f0ff', icone: '⭐' }
            ];

            const gridY1 = 735;
            const gridY2 = 895;
            const cardW = 445;
            const cardH = 135;

            stats.forEach((s, idx) => {
                const isCol1 = idx % 2 === 0;
                const isRow1 = idx < 2;
                const cx = isCol1 ? 80 : 555;
                const cy = isRow1 ? gridY1 : gridY2;

                desenharRoundBox(ctx, cx, cy, cardW, cardH, 18, 'rgba(15, 23, 42, 0.85)', 'rgba(0, 240, 255, 0.25)', 2);

                ctx.textAlign = 'left';
                ctx.font = '40px "Inter", sans-serif';
                ctx.fillText(s.icone, cx + 24, cy + 82);

                ctx.fillStyle = s.cor;
                ctx.font = '900 48px "Inter", sans-serif';
                ctx.fillText(String(s.val), cx + 85, cy + 78);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '800 15px "Inter", sans-serif';
                ctx.fillText(s.label, cx + 85, cy + 108);
            });

            // 4. Seção Top Obras & Capas Reais
            const topY = 1065;
            ctx.fillStyle = '#00f0ff';
            ctx.font = '900 24px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('⭐ OBRAS & AVALIAÇÕES EM DESTAQUE', 80, topY);

            const capaW = 286;
            const capaH = 390;
            const capaGap = 30;

            for (let i = 0; i < 3; i++) {
                const px = 80 + i * (capaW + capaGap);
                const py = topY + 25;
                const obra = topObras[i];
                const capaImg = capasImgs[i];

                if (obra) {
                    desenharCapaGamerCardPro(ctx, capaImg, px, py, capaW, capaH, 16, obra.titulo);

                    // Badge de Nota no Topo
                    desenharRoundBox(ctx, px + 12, py + 12, 100, 34, 10, 'rgba(0, 0, 0, 0.88)', '#ffd700', 1.5);
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '900 16px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`★ ${obra.nota.toFixed(1)}`, px + 62, py + 35);

                    // Título na base
                    desenharRoundBox(ctx, px + 8, py + capaH - 46, capaW - 16, 38, 8, 'rgba(0, 0, 0, 0.88)', 'rgba(255, 255, 255, 0.12)', 1);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '800 15px "Inter", sans-serif';
                    const titCurto = obra.titulo.length > 18 ? obra.titulo.substring(0, 16) + '..' : obra.titulo;
                    ctx.fillText(titCurto, px + capaW / 2, py + capaH - 22);
                } else {
                    // Slot Vazio
                    desenharRoundBox(ctx, px, py, capaW, capaH, 16, 'rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.08)', 2);
                    ctx.fillStyle = '#64748b';
                    ctx.font = '700 16px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('+ Avaliar Obra', px + capaW / 2, py + capaH / 2);
                }
            }

            // 5. Certificado e Rodapé Oficial
            const certY = 1530;
            desenharRoundBox(ctx, 80, certY, width - 160, 260, 20, 'rgba(0, 240, 255, 0.05)', 'rgba(0, 240, 255, 0.25)', 2);

            ctx.fillStyle = '#00f0ff';
            ctx.font = '900 24px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('🛡️ CERTIFICADO DE AUTENTICIDADE OVERCRITIC', 110, certY + 50);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '500 21px "Inter", sans-serif';
            ctx.fillText(`Este Gamer Card certifica as críticas e conquistas registradas por`, 110, certY + 95);
            ctx.fillText(`${username} na comunidade geek & gamer oficial do Overcritic.`, 110, certY + 130);

            ctx.fillStyle = '#ffd700';
            ctx.font = '800 22px "Inter", sans-serif';
            ctx.fillText(`Status Oficial: ${prog.icone} ${prog.titulo} • Temporada 2026`, 110, certY + 180);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 18px "Inter", sans-serif';
            ctx.fillText(`Acesse o portal e monte o seu: https://pontug.github.io/OVERCRITIC`, 110, certY + 225);

            // Watermark Final
            ctx.fillStyle = '#64748b';
            ctx.font = '700 18px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('OVERCRITIC • SEU PORTAL DIÁRIO DE JOGOS, FILMES & PLATINAS', width / 2, height - 55);

        } else {
            // ════════ LAYOUT POST / FEED (4:5 - 1080 x 1350) ════════

            // 1. Perfil Horizontal
            const avatarX = 145;
            const avatarY = 245;
            const avatarRadius = 65;

            // Halo
            const aHalo = ctx.createRadialGradient(avatarX, avatarY, 40, avatarX, avatarY, 95);
            aHalo.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
            aHalo.addColorStop(1, 'transparent');
            ctx.fillStyle = aHalo;
            ctx.fillRect(avatarX - 100, avatarY - 100, 200, 200);

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#0b1326';
            ctx.fill();
            ctx.clip();

            if (avatarImg) {
                ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
            } else {
                ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
                ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 64px "Inter", sans-serif';
                ctx.textAlign = 'center';
                const charFb = (userAvatarRaw && userAvatarRaw.length <= 4) ? userAvatarRaw : (username.charAt(0).toUpperCase() || '🎮');
                ctx.fillText(charFb, avatarX, avatarY + 22);
            }
            ctx.restore();

            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2);
            ctx.stroke();

            // Textos do Perfil
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 50px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(username, 240, 230);

            ctx.fillStyle = prog.cor || '#00f0ff';
            ctx.font = '800 24px "Inter", sans-serif';
            const textoPostCanvas = prog.isDev ? `${prog.icone} PATENTE EXCLUSIVA • ${prog.titulo}` : `${prog.icone} Nível ${prog.nivel} • ${prog.titulo}`;
            ctx.fillText(textoPostCanvas, 240, 270);

            // Barra de XP Compacta
            const xpBarY = 330;
            desenharRoundBox(ctx, 80, xpBarY, width - 160, 50, 12, 'rgba(0, 0, 0, 0.4)', 'rgba(255, 255, 255, 0.08)', 1);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '700 16px "Inter", sans-serif';
            ctx.fillText(`XP NO NÍVEL: ${prog.xpNoNivel.toLocaleString('pt-BR')}/${prog.faixaXp.toLocaleString('pt-BR')} XP (${prog.porcentagem}%) • TOTAL: ${prog.xpTotal.toLocaleString('pt-BR')} XP`, 100, xpBarY + 32);

            const xpWPost = Math.max(20, 420 * (prog.porcentagem / 100));
            desenharRoundBox(ctx, width - 530, xpBarY + 16, 420, 16, 8, 'rgba(255, 255, 255, 0.1)', null, 0);
            const xpGradPost = ctx.createLinearGradient(width - 530, 0, width - 530 + xpWPost, 0);
            xpGradPost.addColorStop(0, '#00f0ff');
            xpGradPost.addColorStop(1, '#9d4edd');
            desenharRoundBox(ctx, width - 530, xpBarY + 16, xpWPost, 16, 8, xpGradPost, null, 0);

            // 2. Quatro Estatísticas em Linha Única
            const statsPost = [
                { label: 'JOGOS', val: numJogos, cor: '#ffffff', icone: '🎮' },
                { label: 'MÍDIAS', val: numMidias, cor: '#ffffff', icone: '🎬' },
                { label: 'PLATINAS', val: numPlatinas, cor: '#ffd700', icone: '🏆' },
                { label: 'MÉDIA', val: mediaFinal, cor: '#00f0ff', icone: '⭐' }
            ];

            const statBoxY = 405;
            const sBoxW = 215;
            const sBoxH = 130;
            const sGap = 20;

            statsPost.forEach((s, idx) => {
                const sx = 80 + idx * (sBoxW + sGap);
                desenharRoundBox(ctx, sx, statBoxY, sBoxW, sBoxH, 16, 'rgba(15, 23, 42, 0.85)', 'rgba(0, 240, 255, 0.22)', 2);

                ctx.textAlign = 'center';
                ctx.font = '32px "Inter", sans-serif';
                ctx.fillText(s.icone, sx + sBoxW / 2, statBoxY + 45);

                ctx.fillStyle = s.cor;
                ctx.font = '900 38px "Inter", sans-serif';
                ctx.fillText(String(s.val), sx + sBoxW / 2, statBoxY + 88);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '800 13px "Inter", sans-serif';
                ctx.fillText(s.label, sx + sBoxW / 2, statBoxY + 114);
            });

            // 3. Top Obras em Destaque
            const topPostY = 565;
            ctx.fillStyle = '#00f0ff';
            ctx.font = '900 22px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('⭐ TOP OBRAS AVALIADAS', 80, topPostY);

            const cWPost = 290;
            const cHPost = 380;
            const cGapPost = 25;

            for (let i = 0; i < 3; i++) {
                const px = 80 + i * (cWPost + cGapPost);
                const py = topPostY + 18;
                const obra = topObras[i];
                const capaImg = capasImgs[i];

                if (obra) {
                    desenharCapaGamerCardPro(ctx, capaImg, px, py, cWPost, cHPost, 16, obra.titulo);

                    // Badge de Nota
                    desenharRoundBox(ctx, px + 10, py + 10, 95, 32, 8, 'rgba(0, 0, 0, 0.85)', '#ffd700', 1.5);
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '900 15px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`★ ${obra.nota.toFixed(1)}`, px + 47, py + 31);

                    // Faixa de Título
                    desenharRoundBox(ctx, px + 8, py + cHPost - 42, cWPost - 16, 34, 8, 'rgba(0, 0, 0, 0.85)', 'rgba(255, 255, 255, 0.1)', 1);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '800 14px "Inter", sans-serif';
                    const titCurto = obra.titulo.length > 18 ? obra.titulo.substring(0, 16) + '..' : obra.titulo;
                    ctx.fillText(titCurto, px + cWPost / 2, py + cHPost - 20);
                } else {
                    desenharRoundBox(ctx, px, py, cWPost, cHPost, 16, 'rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.08)', 2);
                    ctx.fillStyle = '#64748b';
                    ctx.font = '700 15px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('+ Avaliar Obra', px + cWPost / 2, py + cHPost / 2);
                }
            }

            // 4. Rodapé e Certificação
            const botY = 1000;
            desenharRoundBox(ctx, 80, botY, width - 160, 245, 18, 'rgba(0, 240, 255, 0.06)', 'rgba(0, 240, 255, 0.25)', 2);

            ctx.fillStyle = '#00f0ff';
            ctx.font = '900 22px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('🛡️ CERTIFICADO DE AUTENTICIDADE OVERCRITIC', 110, botY + 45);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '500 19px "Inter", sans-serif';
            ctx.fillText(`Passe Gamer Oficial emitido para ${username} na plataforma Overcritic.`, 110, botY + 85);

            ctx.fillStyle = '#ffd700';
            ctx.font = '800 20px "Inter", sans-serif';
            ctx.fillText(`Status: ${prog.icone} ${prog.titulo} • Temporada 2026`, 110, botY + 130);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 17px "Inter", sans-serif';
            ctx.fillText(`https://pontug.github.io/OVERCRITIC`, 110, botY + 175);

            // Watermark Final
            ctx.fillStyle = '#64748b';
            ctx.font = '700 16px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('OVERCRITIC • SEU PORTAL DIÁRIO DE JOGOS, FILMES & PLATINAS', width / 2, height - 35);
        }

        return canvas;
    }

    /**
     * Processa a exportação inteligente do Gamer Card (download, compartilhamento social ou cópia)
     */
    async function processarExportacaoGamerCard(acao = 'download', formato = 'stories') {
        const btnDownload = document.getElementById('ogBtnDownloadCard');
        const btnShare = document.getElementById('ogBtnShareCard');
        const btnCopy = document.getElementById('ogBtnCopyCard');

        const btnAtivo = acao === 'share' ? btnShare : (acao === 'copy' ? btnCopy : btnDownload);
        const textoOriginal = btnAtivo ? btnAtivo.innerHTML : '';
        if (btnAtivo) {
            btnAtivo.disabled = true;
            btnAtivo.innerHTML = `<span>⏳</span> Processando...`;
        }

        try {
            const dados = _dadosCardAtuais || {};
            if (dados.isSelf === false) {
                if (window.showToast) {
                    window.showToast.info('Você só pode exportar ou compartilhar o seu próprio Gamer Card oficial.');
                }
                return;
            }
            const username = dados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
            const slug = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const fileName = `overcritic-card-${slug}-${formato}.png`;

            // Utiliza o canvas pré-renderizado em cache ou gera instantaneamente
            let canvas = _cacheCanvasGamerCard[formato];
            if (!canvas) {
                if (window.showToast) window.showToast.info('Renderizando Gamer Card em alta resolução...');
                canvas = await gerarCanvasGamerCardPro(formato);
                _cacheCanvasGamerCard[formato] = canvas;
            }

            if (acao === 'copy') {
                if (navigator.clipboard && window.ClipboardItem && canvas.toBlob) {
                    canvas.toBlob(async (blob) => {
                        try {
                            await navigator.clipboard.write([
                                new ClipboardItem({ 'image/png': blob })
                            ]);
                            if (window.showToast) {
                                window.showToast.success('Gamer Card copiado! Pressione Ctrl + V no Discord ou WhatsApp.');
                            }
                        } catch (err) {
                            console.warn('Erro ao copiar blob:', err);
                            if (window.showToast) {
                                window.showToast.info('Seu navegador não permitiu copiar imagem diretamente. Use o botão "Baixar PNG".');
                            }
                        }
                    }, 'image/png');
                } else {
                    if (window.showToast) {
                        window.showToast.info('Cópia de imagem não suportada no seu navegador. Use o botão "Baixar PNG".');
                    }
                }
            } else if (acao === 'share') {
                // Conversão síncrona instantânea preservando o User Gesture Token do Chrome/Edge
                const dataUrl = canvas.toDataURL('image/png');
                const file = dataURLtoFileSync(dataUrl, fileName);

                const shareDataComArquivo = {
                    title: `Gamer Card de ${username} • OVERCRITIC`,
                    text: `Confira meu perfil gamer oficial no OVERCRITIC! 🎮 Acesse: https://pontug.github.io/OVERCRITIC`,
                    files: [file]
                };

                const shareDataTexto = {
                    title: `Gamer Card de ${username} • OVERCRITIC`,
                    text: `Confira meu perfil gamer oficial no OVERCRITIC! 🎮 Acesse: https://pontug.github.io/OVERCRITIC`,
                    url: 'https://pontug.github.io/OVERCRITIC'
                };

                if (navigator.share) {
                    try {
                        if (navigator.canShare && navigator.canShare(shareDataComArquivo)) {
                            await navigator.share(shareDataComArquivo);
                            if (window.showToast) window.showToast.success('Compartilhado com sucesso!');
                        } else if (navigator.canShare && navigator.canShare(shareDataTexto)) {
                            await navigator.share(shareDataTexto);
                            if (window.showToast) window.showToast.info('Link compartilhado! Para enviar a imagem, use "Copiar Imagem" ou "Baixar PNG".');
                        } else {
                            await navigator.share(shareDataComArquivo);
                            if (window.showToast) window.showToast.success('Compartilhado com sucesso!');
                        }
                    } catch (e) {
                        if (e.name === 'AbortError') {
                            // Usuário cancelou ou fechou a janela nativa de compartilhamento: comportamento esperado, não faz nada
                            return;
                        }
                        console.warn('Erro no compartilhamento nativo:', e);
                        if (window.showToast) {
                            window.showToast.info('Não foi possível abrir o compartilhador nativo agora. Use "Copiar Imagem" (Ctrl+V) ou "Baixar PNG".');
                        }
                    }
                } else {
                    if (window.showToast) {
                        window.showToast.info('Compartilhamento nativo não suportado neste dispositivo. Use "Copiar Imagem" ou "Baixar PNG".');
                    }
                }
            } else {
                // Ação EXCLUSIVA de download de arquivo PNG
                baixarCanvasComoArquivo(canvas, fileName);
            }
        } catch (error) {
            console.error('Erro ao exportar Gamer Card:', error);
            if (window.showToast) window.showToast.error('Não foi possível gerar a imagem automaticamente.');
        } finally {
            if (btnAtivo) {
                btnAtivo.disabled = false;
                btnAtivo.innerHTML = textoOriginal;
            }
        }
    }

    /**
     * Atalho retrocompatível para download direto do Gamer Card
     */
    function exportarGamerCardPng() {
        return processarExportacaoGamerCard('download', 'stories');
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
        if (typeof dados === 'string') {
            dados = { username: dados };
        }
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
        const currentUser = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim();
        const username = (customUsername || currentUser || 'Jogador').trim();
        const usernameLower = username.toLowerCase();
        const isSelf = !customUsername || (currentUser && usernameLower === currentUser.toLowerCase());

        // Atenção: isTargetAdmin deve ser relativo ao usuário CONSULTADO, NÃO ao visualizador logado!
        const isTargetAdmin = usernameLower === 'pontug' 
            || usernameLower === 'admin'
            || (isSelf && (
                (typeof window.isAdminUser === 'function' && window.isAdminUser()) ||
                ((localStorage.getItem('overcritic_user_email') || '').trim().toLowerCase() === 'mesquitagabriel255@gmail.com') ||
                (localStorage.getItem('overcritic_is_admin') === 'true')
            ));

        const effectiveUid = (customUid || '').trim() || (isSelf ? (localStorage.getItem('overcritic_user_id') || '').trim() : (isTargetAdmin ? '958a1b5f-4151-42c7-97f2-caf0e59fbb86' : ''));

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
                    || (isTargetAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
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
                    || (isTargetAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
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
                    || (isTargetAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                    || (effectiveUid && (p.userId === effectiveUid || p.user_id === effectiveUid));

                if (eDoUsuario) {
                    const key = (p.title || p.titulo).trim().toLowerCase();
                    if (!mapP.has(key)) mapP.set(key, p);
                }
            });
            platinas = Array.from(mapP.values());
        } catch(e) {}

        const progresso = calcularProgressoGamer({
            username: username,
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
            if (prog.isDev) {
                headerStatusEl.innerHTML = `<span style="color:${prog.cor}; font-weight:800;">${prog.icone} DEV • ${prog.titulo}</span>`;
            } else {
                headerStatusEl.innerHTML = `<span style="color:${prog.cor}; font-weight:800;">${prog.icone} Nv. ${prog.nivel} ${prog.titulo}</span>`;
            }
        }

        // Atualiza badge pill se presente no DOM
        const pill = document.getElementById('profLevelBadgePill');
        if (pill) {
            if (prog.isDev) {
                pill.innerHTML = `🛠️ <b>PATENTE EXCLUSIVA DEV</b> • Criador & Admin`;
                pill.title = `Patente exclusiva do Desenvolvedor e Criador do Overcritic • Reputação Total: ${prog.xpTotal.toLocaleString('pt-BR')} XP`;
            } else {
                pill.innerHTML = `${prog.icone} Nv. ${prog.nivel} ${prog.titulo} • ${prog.xpNoNivel.toLocaleString('pt-BR')}/${prog.faixaXp.toLocaleString('pt-BR')} XP`;
                pill.title = `Progresso no Nível ${prog.nivel}: ${prog.xpNoNivel.toLocaleString('pt-BR')} de ${prog.faixaXp.toLocaleString('pt-BR')} XP conquistados • Reputação Total: ${prog.xpTotal.toLocaleString('pt-BR')} XP`;
            }
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

            // Moderadores, Administradores e Desenvolvedores (como pontuG/admin) possuem patente exclusiva DEV e não competem no Ranking Geral
            if (isUsuarioDevOuStaff(uName) || isUsuarioDevOuStaff(membro)) {
                continue;
            }

            // Filtra acervo do jogador com verificação cruzada de autor
            let jogosDoUser = todosJogos.filter(j => (j.autor || '').toLowerCase() === uNameLower);
            let platinasDoUser = todasPlatinas.filter(p => (p.user || p.usuario || '').toLowerCase() === uNameLower);
            let midiasDoUser = todasMidias.filter(m => (m.autor || '').toLowerCase() === uNameLower);

            // Se for o usuário logado, utiliza a consolidação detalhada do perfil
            if (userAtivo && uNameLower === userAtivo.toLowerCase()) {
                const dadosConsolidados = obterDadosConsolidadosUsuario(uName);
                if (dadosConsolidados) {
                    if (dadosConsolidados.jogos.length > 0) jogosDoUser = dadosConsolidados.jogos;
                    if (dadosConsolidados.platinas.length > 0) platinasDoUser = dadosConsolidados.platinas;
                    if (dadosConsolidados.midias.length > 0) midiasDoUser = dadosConsolidados.midias;
                }
            }

            const progresso = calcularProgressoGamer({
                username: uName,
                jogos: jogosDoUser,
                midias: midiasDoUser,
                platinas: platinasDoUser
            });

            ranking.push({
                username: uName,
                avatar: membro.avatar || '🎮',
                role: membro.role || 'Membro da Comunidade',
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

        // 5. Ordenação do Ranking da Comunidade:
        // 1º XP Total (quem tem mais pontos fica no topo)
        // 2º Total de Platinas (desempate)
        // 3º Total de Análises (desempate)
        // 4º Membro mais antigo por data de cadastro
        // 5º Ordem Alfabética
        ranking.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp;
            if (b.totalPlatinas !== a.totalPlatinas) return b.totalPlatinas - a.totalPlatinas;
            if (b.totalAnalises !== a.totalAnalises) return b.totalAnalises - a.totalAnalises;
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
        const target = (nomeUsuario || localStorage.getItem('overcritic_currentUser') || '').toLowerCase().trim();
        if (isUsuarioDevOuStaff(target)) {
            return {
                isDev: true,
                posicao: 'DEV',
                totalJogadores: 0,
                jogador: null
            };
        }
        const ranking = obterRankingGeralComunidade();
        const encontrado = ranking.find(j => j.username.toLowerCase() === target);
        if (encontrado) {
            return {
                isDev: false,
                posicao: encontrado.rank,
                totalJogadores: ranking.length,
                jogador: encontrado
            };
        }
        return {
            isDev: false,
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
                <button type="button" class="og-rank-btn-view" style="margin-top: 14px; width: 100%;" onclick="if(window.abrirGamerCardModal) window.abrirGamerCardModal({ username: '${jogador.username.replace(/'/g, "\\'")}', avatar: '${(jogador.avatar || '🎮').replace(/'/g, "\\'")}' });">
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
                            <span style="color:var(--text-main, #f8f9fa); font-weight:800;">${jogador.xp.toLocaleString('pt-BR')} XP Total</span>
                            <span style="color:var(--text-muted, #adb5bd); font-size:0.7rem;">${prog.xpNoNivel !== undefined ? `${prog.xpNoNivel.toLocaleString('pt-BR')}/${prog.faixaXp.toLocaleString('pt-BR')} XP` : ''} (${pct}%)</span>
                        </div>
                        <div class="og-rank-xp-track">
                            <div class="og-rank-xp-fill" style="width: ${Math.min(100, Math.max(5, pct))}%;"></div>
                        </div>
                    </div>
                </td>
                <td style="text-align: center;">
                    <button type="button" class="og-rank-btn-view" onclick="if(window.abrirGamerCardModal) window.abrirGamerCardModal({ username: '${jogador.username.replace(/'/g, "\\'")}', avatar: '${(jogador.avatar || '🎮').replace(/'/g, "\\'")}' });" title="Ver Gamer Card Oficial">
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

    /* ════════════════════════════════════════════════════════
       7. MURAL DE INSÍGNIAS & CONQUISTAS DESBLOQUEÁVEIS
       Popups animados de troféu estilo console, som triunfante
       via Web Audio API e estante virtual interativa de troféus.
    ════════════════════════════════════════════════════════ */
    const CONFIG_INSIGNIAS = [
        {
            id: 'soulslike_slayer',
            nome: 'Soulslike Slayer',
            icone: '🗡️',
            cor: '#ef4444',
            corBorda: 'rgba(239, 68, 68, 0.5)',
            glow: 'rgba(239, 68, 68, 0.35)',
            descricao: 'Registrar 3 ou mais jogos com a tag Soulslike.',
            detalhe: 'Avalie jogos do gênero Soulslike como Elden Ring, Dark Souls, Bloodborne, Sekiro, Lies of P, etc.',
            xpBonus: 300,
            meta: 3,
            unidade: 'jogos',
            obterProgresso: (dados) => {
                const jogos = dados.jogos || [];
                const termosSouls = [
                    'soulslike', 'souls', 'elden ring', 'dark souls', 'bloodborne', 
                    'sekiro', 'lies of p', "demon's souls", 'demons souls', 'nioh', 
                    'lords of the fallen', 'wo long', 'mortal shell', 'black myth', 
                    'wukong', 'stellar blade', 'hollow knight', 'remnant', 'blasphemous'
                ];
                return jogos.filter(j => {
                    const genero = (j.genero || '').toLowerCase();
                    const tags = Array.isArray(j.tags) ? j.tags.map(t => String(t).toLowerCase()).join(' ') : (j.tags || '').toLowerCase();
                    const titulo = (j.titulo || j.nome || '').toLowerCase();
                    const subtitulo = (j.subtitulo || '').toLowerCase();
                    const textoFull = `${genero} ${tags} ${titulo} ${subtitulo}`;
                    return termosSouls.some(termo => textoFull.includes(termo));
                }).length;
            }
        },
        {
            id: 'platina_hunter',
            nome: 'Caçador de Platinas',
            icone: '👑',
            cor: '#38bdf8',
            corBorda: 'rgba(56, 189, 248, 0.5)',
            glow: 'rgba(56, 189, 248, 0.35)',
            descricao: 'Conquistar 3 platinas cadastradas.',
            detalhe: 'Cadastre e registre 3 jogos 100% platinados no seu catálogo.',
            xpBonus: 500,
            meta: 3,
            unidade: 'platinas',
            obterProgresso: (dados) => {
                return (dados.platinas || []).length;
            }
        },
        {
            id: 'critico_respeitado',
            nome: 'Crítico Respeitado',
            icone: '✍️',
            cor: '#ffd700',
            corBorda: 'rgba(255, 215, 0, 0.5)',
            glow: 'rgba(255, 215, 0, 0.35)',
            descricao: 'Publicar 5 resenhas detalhadas (+180 caracteres).',
            detalhe: 'Escreva análises aprofundadas com argumentos críticos e mais de 180 caracteres.',
            xpBonus: 400,
            meta: 5,
            unidade: 'resenhas',
            obterProgresso: (dados) => {
                const jogos = dados.jogos || [];
                const midias = dados.midias || [];
                const todos = [...jogos, ...midias];
                return todos.filter(item => {
                    const texto = (item.opiniao || item.review || item.texto || item.comentario || item.resenha || '').trim();
                    return texto.length >= 180;
                }).length;
            }
        },
        {
            id: 'cineasta',
            nome: 'Cineasta',
            icone: '🍿',
            cor: '#a855f7',
            corBorda: 'rgba(168, 85, 247, 0.5)',
            glow: 'rgba(168, 85, 247, 0.35)',
            descricao: 'Avaliar 5 filmes ou séries em adicionar_midias.html.',
            detalhe: 'Registre suas opiniões e notas para produções cinematográficas e séries de TV.',
            xpBonus: 350,
            meta: 5,
            unidade: 'mídias',
            obterProgresso: (dados) => {
                return (dados.midias || []).length;
            }
        }
    ];

    // Som Triunfante Gamer via Web Audio API (zero arquivos externos)
    function tocarSomConquista() {
        if (window.OvercriticAudio) {
            if (window.OvercriticAudio.isMuted()) return;
            window.OvercriticAudio.play('trophy');
            return;
        }
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window._ogAudioCtx) window._ogAudioCtx = new AudioCtx();
            if (window._ogAudioCtx.state === 'suspended') {
                window._ogAudioCtx.resume();
            }
            const ctx = window._ogAudioCtx;
            const now = ctx.currentTime;
            // Arpeggio de triunfo cristalino (Dó5, Mi5, Sol5, Dó6)
            const notas = [523.25, 659.25, 783.99, 1046.50];
            notas.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.09);

                gain.gain.setValueAtTime(0.0001, now + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.09 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + i * 0.09);
                osc.stop(now + i * 0.09 + 0.5);
            });
        } catch (e) {
            // Silencioso se áudio não for permitido no navegador
        }
    }

    // Fila e Exibição de Popups Animados de Conquista
    let _filaPopupsConquistas = [];
    let _popupConquistaAtivo = false;

    function garantirContainerPopupConquista() {
        injetarEstilosGamificacao();
        let c = document.getElementById('ogAchievementPopupContainer');
        if (!c) {
            c = document.createElement('div');
            c.id = 'ogAchievementPopupContainer';
            c.className = 'og-achievement-popup-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function exibirPopupConquista(insignia) {
        if (!insignia) return;
        _filaPopupsConquistas.push(insignia);
        processarProximoPopupConquista();
    }

    function processarProximoPopupConquista() {
        if (_popupConquistaAtivo || _filaPopupsConquistas.length === 0) return;
        _popupConquistaAtivo = true;

        const insignia = _filaPopupsConquistas.shift();
        const container = garantirContainerPopupConquista();

        // Toca o som de celebração gamer
        tocarSomConquista();

        const popup = document.createElement('div');
        popup.className = 'og-achievement-popup';
        popup.style.borderColor = insignia.corBorda || '#ffd700';
        popup.style.boxShadow = `0 16px 45px rgba(0, 0, 0, 0.75), 0 0 30px ${insignia.glow || 'rgba(255, 215, 0, 0.35)'}`;
        popup.innerHTML = `
            <div class="og-achievement-shimmer"></div>
            <div class="og-achievement-icon-wrap" style="border-color:${insignia.cor}; box-shadow: 0 0 20px ${insignia.glow};">
                <span>${insignia.icone}</span>
            </div>
            <div class="og-achievement-content">
                <div class="og-achievement-header">
                    <span class="og-achievement-badge-tag" style="color:${insignia.cor};">🏆 CONQUISTA DESBLOQUEADA!</span>
                    <span class="og-achievement-xp-badge">+${insignia.xpBonus} XP</span>
                </div>
                <div class="og-achievement-title">${insignia.nome}</div>
                <div class="og-achievement-desc">${insignia.descricao}</div>
            </div>
            <button type="button" class="og-achievement-close" title="Fechar">✕</button>
        `;

        container.appendChild(popup);

        // Força reflow para animação fluida
        void popup.offsetWidth;
        popup.classList.add('active');

        let timeoutDismiss = null;

        const fechar = () => {
            if (timeoutDismiss) clearTimeout(timeoutDismiss);
            popup.classList.remove('active');
            popup.classList.add('hiding');
            setTimeout(() => {
                if (popup.parentNode) popup.parentNode.removeChild(popup);
                _popupConquistaAtivo = false;
                processarProximoPopupConquista();
            }, 400);
        };

        const btnClose = popup.querySelector('.og-achievement-close');
        if (btnClose) btnClose.addEventListener('click', (e) => {
            e.stopPropagation();
            fechar();
        });

        // Clique no popup abre o mural de troféus!
        popup.addEventListener('click', () => {
            fechar();
            abrirModalMuralInsignias();
        });

        timeoutDismiss = setTimeout(fechar, 6000);
    }

    // Obter Status Completo das Insígnias do Jogador
    function obterStatusInsigniasUsuario(dadosOuUsername) {
        let username = '';
        let dados = null;

        if (typeof dadosOuUsername === 'string') {
            username = dadosOuUsername.trim();
            dados = obterDadosConsolidadosUsuario(username);
        } else if (dadosOuUsername && typeof dadosOuUsername === 'object') {
            dados = dadosOuUsername;
            username = dados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        } else {
            username = localStorage.getItem('overcritic_currentUser') || 'Jogador';
            dados = obterDadosConsolidadosUsuario(username);
        }

        const usernameLower = username.toLowerCase();
        const storageKey = `overcritic_insignias_desbloqueadas_${usernameLower}`;
        let registrosSalvos = {};
        try {
            registrosSalvos = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (Array.isArray(registrosSalvos)) {
                // Retrocompatibilidade se tiver sido salvo como array
                const map = {};
                registrosSalvos.forEach(id => { map[id] = { unlockedAt: new Date().toISOString() }; });
                registrosSalvos = map;
            }
        } catch (e) {
            registrosSalvos = {};
        }

        return CONFIG_INSIGNIAS.map(cfg => {
            const progressoAtual = typeof cfg.obterProgresso === 'function' ? cfg.obterProgresso(dados) : 0;
            const atingiuMeta = progressoAtual >= cfg.meta;
            const registro = registrosSalvos[cfg.id];
            const desbloqueada = atingiuMeta || !!registro;

            let porcentagem = Math.min(100, Math.floor((progressoAtual / cfg.meta) * 100));
            if (desbloqueada) porcentagem = 100;

            return {
                id: cfg.id,
                nome: cfg.nome,
                icone: cfg.icone,
                cor: cfg.cor,
                corBorda: cfg.corBorda,
                glow: cfg.glow,
                descricao: cfg.descricao,
                detalhe: cfg.detalhe,
                xpBonus: cfg.xpBonus,
                meta: cfg.meta,
                progressoAtual: Math.min(cfg.meta, progressoAtual),
                unidade: cfg.unidade,
                porcentagem,
                desbloqueada,
                dataDesbloqueio: registro ? registro.unlockedAt : (desbloqueada ? new Date().toISOString() : null)
            };
        });
    }

    // Verificação em Tempo Real com Notificação de Novas Conquistas
    function verificarConquistas(opcoes = { notificar: true }) {
        const username = (localStorage.getItem('overcritic_currentUser') || 'Jogador').trim();
        const usernameLower = username.toLowerCase();
        const storageKey = `overcritic_insignias_desbloqueadas_${usernameLower}`;

        let registrosSalvos = {};
        try {
            registrosSalvos = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (Array.isArray(registrosSalvos)) {
                const map = {};
                registrosSalvos.forEach(id => { map[id] = { unlockedAt: new Date().toISOString() }; });
                registrosSalvos = map;
            }
        } catch (e) {
            registrosSalvos = {};
        }

        const dados = obterDadosConsolidadosUsuario(username);
        const listaStatus = obterStatusInsigniasUsuario(dados);
        let houveNovidade = false;

        listaStatus.forEach(ins => {
            if (ins.progressoAtual >= ins.meta && !registrosSalvos[ins.id]) {
                // Nova conquista desbloqueada!
                registrosSalvos[ins.id] = {
                    unlockedAt: new Date().toISOString()
                };
                houveNovidade = true;

                if (opcoes.notificar) {
                    exibirPopupConquista(ins);
                }
            }
        });

        if (houveNovidade) {
            localStorage.setItem(storageKey, JSON.stringify(registrosSalvos));
            atualizarBadgesNivelPagina();
            console.log('🏆 [Overcritic] Novas conquistas sincronizadas no perfil do jogador!');
        }

        try {
            if (typeof verificarMissoesSemanais === 'function') {
                verificarMissoesSemanais(opcoes);
            }
        } catch(e) {}

        return listaStatus;
    }

    // Renderizador HTML da Estante Virtual de Troféus (Para Perfil, Modais ou Hub)
    function renderizarMuralTrofeusHtml(username, customDados) {
        injetarEstilosGamificacao();
        const lista = obterStatusInsigniasUsuario(customDados || username);
        const totalDesbloqueadas = lista.filter(i => i.desbloqueada).length;
        const totalXpInsignias = lista.filter(i => i.desbloqueada).reduce((acc, i) => acc + i.xpBonus, 0);

        const cardsHtml = lista.map(ins => {
            const statusClass = ins.desbloqueada ? 'unlocked' : 'locked';
            const statusLabel = ins.desbloqueada ? '✓ DESBLOQUEADO' : '🔒 BLOQUEADO';
            const statusPillClass = ins.desbloqueada ? 'unlocked' : 'locked';
            const progressoTexto = ins.desbloqueada 
                ? `Meta Completa (${ins.meta}/${ins.meta} ${ins.unidade})` 
                : `${ins.progressoAtual} de ${ins.meta} ${ins.unidade} (${ins.porcentagem}%)`;

            return `
                <div class="og-trophy-card ${statusClass}" 
                     style="--card-cor:${ins.cor}; --card-cor-borda:${ins.corBorda}; --card-glow:${ins.glow};"
                     onclick="alert('🏆 Conquista: ${ins.nome}\\n\\n🎯 Objetivo: ${ins.descricao}\\n💡 Dica: ${ins.detalhe}\\n⚡ Recompensa: +${ins.xpBonus} XP\\n\\nStatus: ${ins.desbloqueada ? 'Desbloqueada!' : 'Em progresso (' + ins.progressoAtual + '/' + ins.meta + ')'}')"
                     title="Clique para ver detalhes do troféu">
                    <div class="og-trophy-card-header">
                        <div class="og-trophy-icon-wrap">
                            <span>${ins.icone}</span>
                        </div>
                        <span class="og-trophy-status-pill ${statusPillClass}">${statusLabel}</span>
                    </div>
                    <div class="og-trophy-info">
                        <div class="og-trophy-name">${ins.nome}</div>
                        <div class="og-trophy-desc">${ins.descricao}</div>
                    </div>
                    <div class="og-trophy-progress-wrap">
                        <div class="og-trophy-progress-labels">
                            <span class="og-trophy-progress-text">${progressoTexto}</span>
                            <span class="og-trophy-xp-bonus">+${ins.xpBonus} XP</span>
                        </div>
                        <div class="og-trophy-track">
                            <div class="og-trophy-fill" style="width: ${ins.porcentagem}%;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="og-trophy-shelf-section">
                <div class="og-shelf-header">
                    <div class="og-shelf-title-wrap">
                        <div class="og-shelf-title">
                            <span>🏆</span> Estante de Troféus & Insígnias Virtuais
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="og-shelf-counter-badge">
                            ${totalDesbloqueadas} / ${lista.length} Conquistas (+${totalXpInsignias.toLocaleString('pt-BR')} XP)
                        </span>
                    </div>
                </div>
                <div class="og-shelf-rack">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    // ════════════════════════════════════════════════════════
    // 5. MOTOR DE MISSÕES SEMANAIS COM TEMPORIZADOR (WEEKLY QUESTS)
    // ════════════════════════════════════════════════════════

    function extrairTimestampItem(item) {
        if (!item) return null;
        const raw = item.created_at || item.dataRegistro || item.data_registro || item.timestamp || item.dataConclusao || item.data;
        if (!raw) return null;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
            const rawTrim = raw.trim();
            // Formato DD/MM/YYYY ou DD/MM/YYYY HH:mm
            const ddmmyyyy = rawTrim.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (ddmmyyyy) {
                const d = parseInt(ddmmyyyy[1], 10);
                const m = parseInt(ddmmyyyy[2], 10) - 1;
                const y = parseInt(ddmmyyyy[3], 10);
                return new Date(y, m, d, 12, 0, 0).getTime();
            }
            const parsed = Date.parse(rawTrim);
            if (!isNaN(parsed)) return parsed;
        }
        return null;
    }

    /**
     * Calcula o ciclo semanal determinístico ISO-8601 (Segunda 00:00:00 até Domingo 23:59:59.999)
     */
    function obterCicloSemanaAtual(dataRef = new Date()) {
        const d = new Date(dataRef);
        const day = d.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;

        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Determinação da semana ISO
        const tempDate = new Date(monday.valueOf());
        tempDate.setDate(tempDate.getDate() + 3);
        const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1);
        if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
        }
        const weekNumber = Math.max(1, 1 + Math.ceil((firstThursday - tempDate) / 604800000));
        const year = monday.getFullYear();
        const chaveSemana = `semana_${year}_w${String(weekNumber).padStart(2, '0')}`;

        const now = Date.now();
        const fimMs = sunday.getTime();
        const inicioMs = monday.getTime();
        const restanteMs = Math.max(0, fimMs - now);
        const expirado = restanteMs <= 0;

        const totalSec = Math.floor(restanteMs / 1000);
        const dias = Math.floor(totalSec / 86400);
        const horas = Math.floor((totalSec % 86400) / 3600);
        const minutos = Math.floor((totalSec % 3600) / 60);
        const segundos = totalSec % 60;
        const formatadoRestante = `${dias}d ${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m ${String(segundos).padStart(2, '0')}s`;

        return {
            ano: year,
            semana: weekNumber,
            chaveSemana,
            inicioMs,
            fimMs,
            restanteMs,
            expirado,
            formatadoRestante
        };
    }

    // Pool de Missões Semanais Rotativas
    const POOL_MISSOES_SEMANAIS = [
        {
            id: 'semanal_analises_2',
            nome: 'Maratona Crítica',
            icone: '🎮',
            cor: '#00f0ff',
            glow: 'rgba(0, 240, 255, 0.4)',
            descricao: 'Avaliar 2 jogos esta semana com resenha autêntica.',
            detalhe: 'Cadastre ou analise 2 jogos com resenha crítica durante esta semana.',
            xpBonus: 300,
            meta: 2,
            unidade: 'jogos',
            actionUrl: 'adicionar_jogos.html',
            actionLabel: 'Analisar Jogos',
            verificarProgresso: (dados, ciclo) => {
                const jogos = dados.jogos || [];
                return jogos.filter(j => {
                    const ts = extrairTimestampItem(j);
                    if (!ts || ts < ciclo.inicioMs || ts > ciclo.fimMs) return false;
                    const texto = (j.opiniao || j.review || j.texto || j.comentario || j.resenha || '').trim();
                    return texto.length >= 40;
                }).length;
            }
        },
        {
            id: 'semanal_platina_1',
            nome: 'Caçador de Troféus',
            icone: '🏆',
            cor: '#ffd700',
            glow: 'rgba(255, 215, 0, 0.4)',
            descricao: 'Registrar 1 nova platina durante esta semana.',
            detalhe: 'Complete e registre 1 jogo 100% platinado na sua estante virtual.',
            xpBonus: 400,
            meta: 1,
            unidade: 'platina',
            actionUrl: 'adicionar_platinas.html',
            actionLabel: 'Registrar Platina',
            verificarProgresso: (dados, ciclo) => {
                const platinas = dados.platinas || [];
                return platinas.filter(p => {
                    const ts = extrairTimestampItem(p);
                    return ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs;
                }).length;
            }
        },
        {
            id: 'semanal_cinema_2',
            nome: 'Sessão Pipoca',
            icone: '🍿',
            cor: '#ec4899',
            glow: 'rgba(236, 72, 153, 0.4)',
            descricao: 'Avaliar 2 filmes ou séries esta semana.',
            detalhe: 'Registre suas opiniões e notas para 2 filmes ou séries nesta semana.',
            xpBonus: 250,
            meta: 2,
            unidade: 'títulos',
            actionUrl: 'adicionar_midias.html',
            actionLabel: 'Avaliar Cinema',
            verificarProgresso: (dados, ciclo) => {
                const midias = dados.midias || [];
                return midias.filter(m => {
                    const ts = extrairTimestampItem(m);
                    return ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs;
                }).length;
            }
        },
        {
            id: 'semanal_critica_profunda_1',
            nome: 'Mestre das Palavras',
            icone: '✍️',
            cor: '#a855f7',
            glow: 'rgba(168, 85, 247, 0.4)',
            descricao: 'Publicar 1 crítica aprofundada (+180 caracteres) esta semana.',
            detalhe: 'Escreva ao menos 1 análise rica e fundamentada sobre jogos ou mídias audiovisuais.',
            xpBonus: 350,
            meta: 1,
            unidade: 'crítica',
            actionUrl: 'adicionar_jogos.html',
            actionLabel: 'Escrever Crítica',
            verificarProgresso: (dados, ciclo) => {
                const todos = [...(dados.jogos || []), ...(dados.midias || [])];
                return todos.filter(item => {
                    const ts = extrairTimestampItem(item);
                    if (!ts || ts < ciclo.inicioMs || ts > ciclo.fimMs) return false;
                    const texto = (item.opiniao || item.review || item.texto || item.comentario || item.resenha || '').trim();
                    return texto.length >= 180;
                }).length;
            }
        },
        {
            id: 'semanal_indie_retro_1',
            nome: 'Explorador dos Games',
            icone: '🕹️',
            cor: '#38bdf8',
            glow: 'rgba(56, 189, 248, 0.4)',
            descricao: 'Avaliar 1 jogo indie, clássico ou retrô esta semana.',
            detalhe: 'Descubra ou resenhe um jogo independente ou clássico no seu catálogo.',
            xpBonus: 250,
            meta: 1,
            unidade: 'jogo',
            actionUrl: 'descobrir_jogos.html',
            actionLabel: 'Explorar Jogos',
            verificarProgresso: (dados, ciclo) => {
                const jogos = dados.jogos || [];
                return jogos.filter(j => {
                    const ts = extrairTimestampItem(j);
                    if (!ts || ts < ciclo.inicioMs || ts > ciclo.fimMs) return false;
                    const str = `${j.titulo || ''} ${j.nome || ''} ${j.genero || ''} ${j.categoria || ''}`.toLowerCase();
                    return str.includes('indie') || str.includes('retro') || str.includes('retrô') || str.includes('pixel') || str.includes('arcade') || str.includes('metroidvania') || (j.anoLancamento && Number(j.anoLancamento) < 2012);
                }).length;
            }
        },
        {
            id: 'semanal_cineasta_resenha_1',
            nome: 'Crítico Cinematográfico',
            icone: '🎬',
            cor: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.4)',
            descricao: 'Escrever resenha detalhada (+100 caracteres) para 1 filme ou série.',
            detalhe: 'Compartilhe sua visão crítica para 1 produção cinematográfica nesta semana.',
            xpBonus: 300,
            meta: 1,
            unidade: 'resenha',
            actionUrl: 'adicionar_midias.html',
            actionLabel: 'Avaliar Cinema',
            verificarProgresso: (dados, ciclo) => {
                const midias = dados.midias || [];
                return midias.filter(m => {
                    const ts = extrairTimestampItem(m);
                    if (!ts || ts < ciclo.inicioMs || ts > ciclo.fimMs) return false;
                    const texto = (m.opiniao || m.review || m.texto || m.comentario || m.resenha || '').trim();
                    return texto.length >= 100;
                }).length;
            }
        },
        {
            id: 'semanal_combo_gamer_2',
            nome: 'Dose Dupla Gamer',
            icone: '⚡',
            cor: '#10b981',
            glow: 'rgba(16, 185, 129, 0.4)',
            descricao: 'Registrar 2 atividades gamers (análises ou platinas) esta semana.',
            detalhe: 'Mantenha o ritmo gamer ativo registrando 2 jogos ou platinas no Overcritic.',
            xpBonus: 350,
            meta: 2,
            unidade: 'atividades',
            actionUrl: 'adicionar_jogos.html',
            actionLabel: 'Acessar Jogos',
            verificarProgresso: (dados, ciclo) => {
                let count = 0;
                (dados.jogos || []).forEach(j => {
                    const ts = extrairTimestampItem(j);
                    if (ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs) count++;
                });
                (dados.platinas || []).forEach(p => {
                    const ts = extrairTimestampItem(p);
                    if (ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs) count++;
                });
                return count;
            }
        },
        {
            id: 'semanal_polivalente_2',
            nome: 'Crítico Multimídia',
            icone: '🌟',
            cor: '#8b5cf6',
            glow: 'rgba(139, 92, 246, 0.4)',
            descricao: 'Avaliar ao menos 1 jogo E 1 filme/série esta semana.',
            detalhe: 'Demonstre versatilidade avaliando obras tanto no mundo dos games quanto do cinema.',
            xpBonus: 400,
            meta: 2,
            unidade: 'obras',
            actionUrl: 'adicionar_midias.html',
            actionLabel: 'Mídias & Filmes',
            verificarProgresso: (dados, ciclo) => {
                const temJogo = (dados.jogos || []).some(j => {
                    const ts = extrairTimestampItem(j);
                    return ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs;
                });
                const temMidia = (dados.midias || []).some(m => {
                    const ts = extrairTimestampItem(m);
                    return ts && ts >= ciclo.inicioMs && ts <= ciclo.fimMs;
                });
                return (temJogo ? 1 : 0) + (temMidia ? 1 : 0);
            }
        }
    ];

    /**
     * Retorna as 4 missões ativas da semana de forma determinística
     */
    function obterMissoesSemanaisAtivas(dataRef = new Date()) {
        const ciclo = obterCicloSemanaAtual(dataRef);
        const pool = POOL_MISSOES_SEMANAIS;
        const offset = (ciclo.semana * 2) % pool.length;
        const selecionadas = [];
        for (let i = 0; i < 4; i++) {
            selecionadas.push(pool[(offset + i) % pool.length]);
        }
        return {
            ciclo,
            missoes: selecionadas
        };
    }

    /**
     * Calcula todo o XP de missões semanais acumulado pelo jogador (em todas as semanas)
     */
    function obterTotalXpMissoesSemanaisUsuario(dadosOuUsername) {
        let username = '';
        if (typeof dadosOuUsername === 'string') {
            username = dadosOuUsername.trim();
        } else if (dadosOuUsername && typeof dadosOuUsername === 'object') {
            username = dadosOuUsername.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        } else {
            username = localStorage.getItem('overcritic_currentUser') || 'Jogador';
        }
        const usernameLower = username.toLowerCase();
        const storageKey = `overcritic_missoes_semanais_${usernameLower}`;
        let registroSemanas = {};
        try {
            registroSemanas = JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch(e) {
            return 0;
        }

        let totalXp = 0;
        Object.values(registroSemanas).forEach(sem => {
            if (sem && typeof sem.totalXpGanho === 'number') {
                totalXp += sem.totalXpGanho;
            } else if (sem && sem.concluidas) {
                Object.values(sem.concluidas).forEach(c => {
                    totalXp += Number(c.xpGanho || 0);
                });
                if (sem.bonusSemanaPerfeita) totalXp += 500;
            }
        });
        return totalXp;
    }

    /**
     * Retorna o total de XP acumulado em Duelos Diários da Comunidade (+25 XP por voto diário)
     */
    function obterTotalXpDuelosDiariosUsuario(dadosOuUsername) {
        let username = '';
        if (typeof dadosOuUsername === 'string') {
            username = dadosOuUsername.trim();
        } else if (dadosOuUsername && typeof dadosOuUsername === 'object') {
            username = dadosOuUsername.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        } else {
            username = localStorage.getItem('overcritic_currentUser') || 'Jogador';
        }
        const usernameLower = username.toLowerCase();
        const storageKey = `overcritic_duelos_xp_${usernameLower}`;
        try {
            const historico = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (Array.isArray(historico)) {
                return historico.length * 25;
            }
        } catch(e) {}
        return 0;
    }

    /**
     * Retorna o status detalhado das missões da semana atual do jogador
     */
    function obterStatusMissoesSemanaisUsuario(dadosOuUsername) {
        let username = '';
        let dados = null;
        if (typeof dadosOuUsername === 'string') {
            username = dadosOuUsername.trim();
            dados = obterDadosConsolidadosUsuario(username);
        } else if (dadosOuUsername && typeof dadosOuUsername === 'object') {
            dados = dadosOuUsername;
            username = dados.username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        } else {
            username = localStorage.getItem('overcritic_currentUser') || 'Jogador';
            dados = obterDadosConsolidadosUsuario(username);
        }
        const usernameLower = username.toLowerCase();
        const { ciclo, missoes } = obterMissoesSemanaisAtivas();
        const storageKey = `overcritic_missoes_semanais_${usernameLower}`;
        let registroSemanas = {};
        try {
            registroSemanas = JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch(e) {
            registroSemanas = {};
        }
        const regSemana = registroSemanas[ciclo.chaveSemana] || { concluidas: {}, bonusSemanaPerfeita: false, totalXpGanho: 0 };

        let totalConcluidas = 0;
        let totalXpSemana = 0;
        let totalXpMaximoSemana = 500; // Inclui bônus de semana perfeita

        const listaFormatada = missoes.map(m => {
            totalXpMaximoSemana += m.xpBonus;
            const jaConcluida = !!(regSemana.concluidas && regSemana.concluidas[m.id]);
            const progressoCalculado = typeof m.verificarProgresso === 'function' ? m.verificarProgresso(dados, ciclo) : 0;
            const progressoFinal = jaConcluida ? m.meta : Math.min(m.meta, progressoCalculado);
            const estaConcluida = jaConcluida || progressoFinal >= m.meta;
            if (estaConcluida) {
                totalConcluidas++;
                totalXpSemana += m.xpBonus;
            }
            const pct = Math.min(100, Math.floor((progressoFinal / m.meta) * 100));

            return {
                id: m.id,
                nome: m.nome,
                icone: m.icone,
                cor: m.cor,
                glow: m.glow,
                descricao: m.descricao,
                detalhe: m.detalhe,
                xpBonus: m.xpBonus,
                meta: m.meta,
                unidade: m.unidade,
                actionUrl: m.actionUrl,
                actionLabel: m.actionLabel,
                progressoAtual: progressoFinal,
                porcentagem: pct,
                concluida: estaConcluida,
                expirada: ciclo.expirado && !estaConcluida
            };
        });

        const todasConcluidas = totalConcluidas >= missoes.length;
        const bonusConcedido = !!regSemana.bonusSemanaPerfeita || todasConcluidas;
        if (bonusConcedido) {
            totalXpSemana += 500;
        }

        return {
            ciclo,
            missoes: listaFormatada,
            totalConcluidas,
            todasConcluidas,
            bonusConcedido,
            bonusSemanaPerfeita: 500,
            totalXpSemana,
            totalXpMaximoSemana
        };
    }

    /**
     * Valida em tempo real se alguma missão foi concluída e salva no localStorage
     */
    function verificarMissoesSemanais(opcoes = { notificar: true }) {
        const username = (localStorage.getItem('overcritic_currentUser') || 'Jogador').trim();
        const usernameLower = username.toLowerCase();
        const dados = obterDadosConsolidadosUsuario(username);
        const { ciclo, missoes } = obterMissoesSemanaisAtivas();

        const storageKey = `overcritic_missoes_semanais_${usernameLower}`;
        let registroSemanas = {};
        try {
            registroSemanas = JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch(e) {
            registroSemanas = {};
        }

        if (!registroSemanas[ciclo.chaveSemana]) {
            registroSemanas[ciclo.chaveSemana] = {
                ano: ciclo.ano,
                semana: ciclo.semana,
                concluidas: {},
                bonusSemanaPerfeita: false,
                totalXpGanho: 0
            };
        }

        const regSemana = registroSemanas[ciclo.chaveSemana];
        let houveNovoDesbloqueio = false;
        let novoXpGanho = 0;

        missoes.forEach(m => {
            if (!regSemana.concluidas[m.id]) {
                const progressoAtual = typeof m.verificarProgresso === 'function' ? m.verificarProgresso(dados, ciclo) : 0;
                if (progressoAtual >= m.meta) {
                    regSemana.concluidas[m.id] = {
                        nome: m.nome,
                        xpGanho: m.xpBonus,
                        concluidoEm: new Date().toISOString()
                    };
                    regSemana.totalXpGanho = (regSemana.totalXpGanho || 0) + m.xpBonus;
                    houveNovoDesbloqueio = true;
                    novoXpGanho += m.xpBonus;

                    if (opcoes.notificar) {
                        exibirPopupMissaoConcluida(m);
                    }
                }
            }
        });

        // Verifica Semana Perfeita (todas as 4 missões)
        const numConcluidas = Object.keys(regSemana.concluidas).length;
        if (numConcluidas >= missoes.length && !regSemana.bonusSemanaPerfeita) {
            regSemana.bonusSemanaPerfeita = true;
            regSemana.totalXpGanho = (regSemana.totalXpGanho || 0) + 500;
            houveNovoDesbloqueio = true;
            novoXpGanho += 500;

            if (opcoes.notificar) {
                exibirPopupMissaoConcluida({
                    id: 'semana_perfeita',
                    nome: '👑 SEMANA PERFEITA!',
                    icone: '👑',
                    cor: '#ffd700',
                    glow: 'rgba(255, 215, 0, 0.5)',
                    descricao: 'Você completou todas as missões semanais antes do timer expirar!',
                    xpBonus: 500
                });
            }
        }

        if (houveNovoDesbloqueio) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(registroSemanas));
            } catch(e) {}

            try {
                sincronizarRankingNuvem(username);
                atualizarBadgesNivelPagina();
                atualizarWidgetHomeQuests();
            } catch(e) {}
        }

        return {
            houveNovoDesbloqueio,
            novoXpGanho,
            statusSemana: regSemana
        };
    }

    /**
     * Popup Cyberpunk de Missão Semanal Concluída
     */
    function exibirPopupMissaoConcluida(missao) {
        if (!missao) return;
        tocarSomConquista();
        const container = garantirContainerPopupConquista();

        const popup = document.createElement('div');
        popup.className = 'og-achievement-popup';
        popup.style.borderColor = missao.cor || '#00f0ff';
        popup.style.boxShadow = `0 16px 45px rgba(0, 0, 0, 0.75), 0 0 30px ${missao.glow || 'rgba(0, 240, 255, 0.35)'}`;
        popup.innerHTML = `
            <div class="og-achievement-shimmer"></div>
            <div class="og-achievement-icon-wrap" style="border-color:${missao.cor || '#00f0ff'}; box-shadow: 0 0 20px ${missao.glow || 'rgba(0, 240, 255, 0.35)'};">
                <span>${missao.icone || '⚡'}</span>
            </div>
            <div class="og-achievement-content">
                <div class="og-achievement-header">
                    <span class="og-achievement-badge-tag" style="color:${missao.cor || '#00f0ff'};">⚡ MISSÃO SEMANAL CONCLUÍDA!</span>
                    <span class="og-achievement-xp-badge">+${missao.xpBonus} XP</span>
                </div>
                <div class="og-achievement-title">${missao.nome}</div>
                <div class="og-achievement-desc">${missao.descricao}</div>
            </div>
            <button type="button" class="og-achievement-close" title="Fechar">✕</button>
        `;

        container.appendChild(popup);
        void popup.offsetWidth;
        popup.classList.add('active');

        let timeoutDismiss = null;
        const fechar = () => {
            if (timeoutDismiss) clearTimeout(timeoutDismiss);
            popup.classList.remove('active');
            popup.classList.add('hiding');
            setTimeout(() => {
                if (popup.parentNode) popup.parentNode.removeChild(popup);
            }, 400);
        };

        const btnClose = popup.querySelector('.og-achievement-close');
        if (btnClose) btnClose.addEventListener('click', (e) => {
            e.stopPropagation();
            fechar();
        });

        popup.addEventListener('click', () => {
            fechar();
            abrirModalMuralInsignias('missoes');
        });

        timeoutDismiss = setTimeout(fechar, 6000);
    }

    /**
     * Renderizador HTML do Dashboard de Missões Semanais
     */
    function renderizarMissoesSemanaisHtml(username) {
        injetarEstilosGamificacao();
        const user = username || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const status = obterStatusMissoesSemanaisUsuario(user);
        const ciclo = status.ciclo;

        const cardsHtml = status.missoes.map(m => {
            const statusClass = m.concluida ? 'concluida' : (m.expirada ? 'expirada' : 'andamento');
            const statusLabel = m.concluida ? '✓ Concluída' : (m.expirada ? '✕ Expirada' : '⏳ Em Andamento');

            let actionHtml = '';
            if (m.concluida) {
                actionHtml = `<span style="font-size:0.75rem; color:#22c55e; font-weight:800; display:inline-flex; align-items:center; gap:4px;">✨ +${m.xpBonus} XP creditados</span>`;
            } else if (m.expirada) {
                actionHtml = `<span style="font-size:0.75rem; color:#ef4444; font-weight:700;">Prazo encerrado</span>`;
            } else {
                actionHtml = `<a href="${m.actionUrl || '#'}" class="og-quest-action-btn">${m.actionLabel || 'Cumprir Missão'} →</a>`;
            }

            return `
                <div class="og-quest-card ${m.concluida ? 'completed' : (m.expirada ? 'expired' : '')}" style="--quest-cor:${m.cor};">
                    <div class="og-quest-header">
                        <div class="og-quest-icon-wrap" style="color:${m.cor};">
                            <span>${m.icone}</span>
                        </div>
                        <span class="og-quest-xp-badge">+${m.xpBonus} XP</span>
                    </div>
                    <div>
                        <div class="og-quest-title">${m.nome}</div>
                        <div class="og-quest-desc" style="margin-top:4px;">${m.detalhe}</div>
                    </div>
                    <div style="margin-top:auto; display:flex; flex-direction:column; gap:6px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem; font-weight:700;">
                            <span style="color:#94a3b8;">Progresso: ${m.progressoAtual} / ${m.meta} ${m.unidade}</span>
                            <span style="color:${m.cor}; font-weight:800;">${m.porcentagem}%</span>
                        </div>
                        <div class="og-quests-track">
                            <div class="og-quests-fill" style="width: ${m.porcentagem}%; background: ${m.cor};"></div>
                        </div>
                    </div>
                    <div class="og-quest-footer">
                        <span class="og-quest-status-pill ${statusClass}">${statusLabel}</span>
                        ${actionHtml}
                    </div>
                </div>
            `;
        }).join('');

        const pctGeral = Math.min(100, Math.floor((status.totalConcluidas / status.missoes.length) * 100));

        return `
            <div class="og-quests-container">
                <div class="og-quests-header-card">
                    <div class="og-quests-header-top">
                        <span class="og-quests-season-tag">
                            ⚡ Temporada Ativa • Semana ${ciclo.semana} de ${ciclo.ano}
                        </span>
                        <div class="og-quests-timer-wrap">
                            <span class="og-quests-timer-label">Reinicia em:</span>
                            <span class="og-quests-timer-val" id="ogQuestsTimerVal">${ciclo.formatadoRestante}</span>
                        </div>
                    </div>

                    <div class="og-quests-alert-banner">
                        <span>⚠️</span>
                        <span><b>Regra do Desafio:</b> As missões e o XP bônus reiniciam todo domingo às 23:59. Se não forem concluídas dentro do prazo semanal, o XP extra é perdido permanentemente!</span>
                    </div>

                    <div class="og-quests-progress-summary">
                        <div class="og-quests-progress-labels">
                            <span style="color:var(--text-main, #f8f9fa);">
                                Concluídas: <strong style="color:#00f0ff;">${status.totalConcluidas} de ${status.missoes.length} Missões</strong>
                            </span>
                            <span style="color:#ffd700; font-weight:800;">
                                +${status.totalXpSemana.toLocaleString('pt-BR')} XP obtidos esta semana
                            </span>
                        </div>
                        <div class="og-quests-track">
                            <div class="og-quests-fill" style="width: ${pctGeral}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="og-perfect-week-card">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="font-size:2.2rem; filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));">👑</div>
                        <div>
                            <div style="font-size:1.05rem; font-weight:900; color:#ffd700;">
                                Bônus de Semana Perfeita (+500 XP Extra)
                            </div>
                            <div style="font-size:0.82rem; color:#cbd5e1; max-width:540px; margin-top:2px;">
                                Cumpra todos os 4 desafios semanais antes do timer zerar para desbloquear este mega bônus de XP e disparar no ranking!
                            </div>
                        </div>
                    </div>
                    <div>
                        ${status.todasConcluidas 
                            ? '<span class="og-quest-status-pill concluida" style="font-size:0.85rem; padding:8px 16px;">✨ CONQUISTADO (+500 XP)</span>'
                            : `<span class="og-quest-status-pill andamento" style="font-size:0.85rem; padding:8px 16px;">🔒 Faltam ${status.missoes.length - status.totalConcluidas} missão(ões)</span>`
                        }
                    </div>
                </div>

                <div class="og-quests-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    // Modal Dedicado do Hub Gamer (Missões Semanais & Mural de Insígnias)
    function garantirModalMuralInsignias() {
        injetarEstilosGamificacao();
        let overlay = document.getElementById('ogMuralInsigniasOverlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'ogMuralInsigniasOverlay';
        overlay.className = 'og-mural-overlay';
        overlay.innerHTML = `
            <div class="og-mural-modal">
                <div class="og-mural-modal-header">
                    <div>
                        <div class="og-mural-modal-title" id="ogMuralModalTitle">
                            <span>⚡</span> Hub Gamer & Conquistas Overcritic
                        </div>
                        <div class="og-mural-modal-subtitle" id="ogMuralModalSubtitle">
                            Missões dinâmicas com prazo, troféus virtuais e elevação de Nível Gamer!
                        </div>
                    </div>
                    <button type="button" class="og-mural-modal-close" id="ogBtnCloseMural" title="Fechar (Esc)">✕</button>
                </div>
                <div class="og-hub-tab-bar" id="ogHubTabBar">
                    <button type="button" class="og-hub-tab-btn active" id="ogTabBtnMissoes" onclick="if(window.OvercriticGamification) window.OvercriticGamification.alternarAbaHub('missoes');">
                        <span>⚡</span> Missões da Semana
                        <span class="og-hub-timer-badge" id="ogHubTabTimer">00d 00h</span>
                    </button>
                    <button type="button" class="og-hub-tab-btn" id="ogTabBtnTrofeus" onclick="if(window.OvercriticGamification) window.OvercriticGamification.alternarAbaHub('trofeus');">
                        <span>🏆</span> Estante de Troféus
                    </button>
                </div>
                <div id="ogMuralModalBody"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharModalMuralInsignias();
        });
        document.getElementById('ogBtnCloseMural').addEventListener('click', fecharModalMuralInsignias);

        return overlay;
    }

    function alternarAbaHub(aba = 'missoes', customUser) {
        const overlay = document.getElementById('ogMuralInsigniasOverlay');
        const user = customUser || (overlay ? overlay.getAttribute('data-current-user') : null) || localStorage.getItem('overcritic_currentUser') || 'Jogador';
        const body = document.getElementById('ogMuralModalBody');
        const tabMissoes = document.getElementById('ogTabBtnMissoes');
        const tabTrofeus = document.getElementById('ogTabBtnTrofeus');

        if (aba === 'trofeus') {
            if (tabMissoes) tabMissoes.classList.remove('active');
            if (tabTrofeus) tabTrofeus.classList.add('active');
            if (body) body.innerHTML = renderizarMuralTrofeusHtml(user);
        } else {
            if (tabTrofeus) tabTrofeus.classList.remove('active');
            if (tabMissoes) tabMissoes.classList.add('active');
            if (body) body.innerHTML = renderizarMissoesSemanaisHtml(user);
        }
    }

    function abrirModalMuralInsignias(abaOuUser = 'missoes', possivelUser) {
        let abaInicial = 'missoes';
        let user = localStorage.getItem('overcritic_currentUser') || 'Jogador';

        if (abaOuUser === 'trofeus' || abaOuUser === 'missoes') {
            abaInicial = abaOuUser;
            if (possivelUser && typeof possivelUser === 'string') user = possivelUser.trim();
        } else if (typeof abaOuUser === 'string' && abaOuUser.trim()) {
            user = abaOuUser.trim();
        }

        const overlay = garantirModalMuralInsignias();
        overlay.setAttribute('data-current-user', user);
        alternarAbaHub(abaInicial, user);
        iniciarContadorRegressivoSemanal();

        overlay.classList.add('active');
        bloquearScrollFundo();
    }

    function fecharModalMuralInsignias() {
        const overlay = document.getElementById('ogMuralInsigniasOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        liberarScrollFundo(true);
    }

    // Temporizador Regressivo Global em Tempo Real
    let _intervaloTimerSemanal = null;
    function iniciarContadorRegressivoSemanal() {
        if (_intervaloTimerSemanal) return;

        function tick() {
            const ciclo = obterCicloSemanaAtual();
            const str = ciclo.formatadoRestante;

            // Elementos no modal
            const elTimerVal = document.getElementById('ogQuestsTimerVal');
            if (elTimerVal) elTimerVal.textContent = str;

            const elTabTimer = document.getElementById('ogHubTabTimer');
            if (elTabTimer) {
                const dias = Math.floor(ciclo.restanteMs / (1000 * 60 * 60 * 24));
                const horas = Math.floor((ciclo.restanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                elTabTimer.textContent = `${dias}d ${horas}h`;
            }

            // Elemento na home page
            const elHomeCountdown = document.getElementById('homeQuestsCountdown');
            if (elHomeCountdown) elHomeCountdown.textContent = str;
        }

        tick();
        _intervaloTimerSemanal = setInterval(tick, 1000);
    }

    /**
     * Atualiza dados do Widget / Faixa de Missões na Home Page
     */
    function atualizarWidgetHomeQuests() {
        const elStrip = document.getElementById('homeQuestsLiveStrip');
        const elWeekCode = document.getElementById('homeQuestsWeekCode');
        const elSummary = document.getElementById('homeQuestsSummaryText');
        const elCountdown = document.getElementById('homeQuestsCountdown');

        if (!elStrip && !elWeekCode && !elSummary && !elCountdown) return;

        const status = obterStatusMissoesSemanaisUsuario();
        const ciclo = status.ciclo;

        if (elWeekCode) {
            elWeekCode.textContent = `SEMANA ${ciclo.semana} • ${ciclo.ano}`;
        }

        if (elCountdown) {
            elCountdown.textContent = ciclo.formatadoRestante;
        }

        if (elSummary) {
            if (status.todasConcluidas) {
                elSummary.innerHTML = `🎉 <strong>SEMANA PERFEITA CONQUISTADA!</strong> Todas as 4 missões foram cumpridas (+${status.totalXpSemana} XP somados ao seu Nível Gamer).`;
            } else if (status.totalConcluidas > 0) {
                elSummary.innerHTML = `Progresso: <strong>${status.totalConcluidas} de 4 missões</strong> (+${status.totalXpSemana} XP garantidos). Complete as restantes antes do timer expirar para o Bônus Perfeito (+500 XP)!`;
            } else {
                elSummary.innerHTML = `Complete as 4 missões antes do timer zerar para garantir até <strong>+${status.totalXpMaximoSemana} XP</strong> e acelerar no Ranking Geral!`;
            }
        }
    }

    // Listener Global de Tecla Escape para Fechamento Seguro de Modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const trilhaOverlay = document.getElementById('ogTrilhaPatentesOverlay');
            const tierOverlay = document.getElementById('ogTierListOverlay');
            const cardOverlay = document.getElementById('ogGamerCardOverlay');
            const muralOverlay = document.getElementById('ogMuralInsigniasOverlay');
            if (trilhaOverlay && trilhaOverlay.classList.contains('active')) {
                fecharModalTrilhaPatentes();
            } else if (muralOverlay && muralOverlay.classList.contains('active')) {
                fecharModalMuralInsignias();
            } else if (tierOverlay && tierOverlay.classList.contains('active')) {
                fecharModalTierList();
            } else if (cardOverlay && cardOverlay.classList.contains('active')) {
                fecharGamerCardModal();
            }
        }
    });

    // Inicialização suave ao carregar a página
    setTimeout(() => {
        try {
            verificarConquistas({ notificar: true });
            verificarMissoesSemanais({ notificar: false });
            iniciarContadorRegressivoSemanal();
            atualizarWidgetHomeQuests();
        } catch(e) {}
    }, 1500);

    // Exporta globalmente
    window.OvercriticGamification = {
        NIVEIS_GAMER,
        CONFIG_INSIGNIAS,
        POOL_MISSOES_SEMANAIS,
        isUsuarioDevOuStaff,
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
        abrirModalTrilhaPatentes,
        fecharModalTrilhaPatentes,
        gerarCanvasGamerCardPro,
        processarExportacaoGamerCard,
        exportarGamerCardPng,
        abrirModalTierList,
        fecharModalTierList,
        atualizarBadgesNivelPagina,
        registrarNovoJogadorNoRanking,
        obterRankingGeralComunidade,
        obterPosicaoRankingUsuario,
        renderizarRankingComunidade,
        // Conquistas e Insígnias
        obterStatusInsigniasUsuario,
        verificarConquistas,
        exibirPopupConquista,
        tocarSomConquista,
        renderizarMuralTrofeusHtml,
        // Missões Semanais (Weekly Quests)
        obterCicloSemanaAtual,
        obterMissoesSemanaisAtivas,
        obterStatusMissoesSemanaisUsuario,
        obterTotalXpMissoesSemanaisUsuario,
        obterTotalXpDuelosDiariosUsuario,
        verificarMissoesSemanais,
        exibirPopupMissaoConcluida,
        renderizarMissoesSemanaisHtml,
        alternarAbaHub,
        iniciarContadorRegressivoSemanal,
        atualizarWidgetHomeQuests,
        abrirModalMuralInsignias,
        fecharModalMuralInsignias
    };

    window.OvercriticInsignias = {
        CONFIG_INSIGNIAS,
        POOL_MISSOES_SEMANAIS,
        obterStatusInsigniasUsuario,
        verificarConquistas,
        exibirPopupConquista,
        tocarSomConquista,
        renderizarMuralTrofeusHtml,
        obterStatusMissoesSemanaisUsuario,
        verificarMissoesSemanais,
        alternarAbaHub,
        abrirModalMuralInsignias,
        fecharModalMuralInsignias
    };

    window.NIVEIS_GAMER = NIVEIS_GAMER;
    window.calcularXpPlatina = calcularXpPlatina;
    window.avaliarQualidadeReview = avaliarQualidadeReview;
    window.calcularXpReview = calcularXpReview;
    window.abrirGamerCardModal = abrirGamerCardModal;
    window.fecharGamerCardModal = fecharGamerCardModal;
    window.abrirModalTrilhaPatentes = abrirModalTrilhaPatentes;
    window.fecharModalTrilhaPatentes = fecharModalTrilhaPatentes;
    window.gerarCanvasGamerCardPro = gerarCanvasGamerCardPro;
    window.processarExportacaoGamerCard = processarExportacaoGamerCard;
    window.exportarGamerCardPng = exportarGamerCardPng;
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
    window.abrirModalMuralInsignias = abrirModalMuralInsignias;
    window.fecharModalMuralInsignias = fecharModalMuralInsignias;
    window.verificarMissoesSemanais = verificarMissoesSemanais;
    window.atualizarWidgetHomeQuests = atualizarWidgetHomeQuests;

    console.log('🎮 [Overcritic] Motor de Gamificação, Missões Semanais com Temporizador & Mural Gamer carregado!');
})();


