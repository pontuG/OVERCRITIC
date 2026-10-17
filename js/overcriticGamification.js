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
    function avaliarQualidadeReview(item) {
        if (!item) return { xp: 100, nivel: 'rapida', label: 'Nota Rápida', bonus: 0, icone: '⚡', cor: '#94a3b8' };

        let texto = '';
        if (typeof item === 'string') {
            texto = item;
        } else if (typeof item === 'object') {
            texto = item.review || item.relato || item.notes || item.resenha || item.texto || item.comentario || '';
        }

        texto = String(texto || '').trim();
        const len = texto.length;

        if (len < 60) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#94a3b8',
                motivo: len === 0 ? 'Sem resenha escrita' : `Faltam ${Math.max(0, 80 - len)} caracteres para bônus de Resenha`
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
                motivo: 'Caracteres repetitivos em sequência detectados (sem bônus)'
            };
        }

        // Filtro 2: Bloqueia sequências em loop de 2 a 4 caracteres (ex: asdasdasdasd, abcabcabc)
        if (/(.{2,4})\1{3,}/i.test(texto)) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: 'Padrão repetitivo detectado (sem bônus)'
            };
        }

        // Filtro 3: Fonética em português (proporção saudável de vogais em textos com letras)
        const totalLetras = (texto.match(/[a-zà-ú]/gi) || []).length;
        const totalVogais = (texto.match(/[aeiouáéíóúâêôãõ]/gi) || []).length;
        if (totalLetras >= 20) {
            const ratioVogais = totalVogais / totalLetras;
            if (ratioVogais < 0.22 || ratioVogais > 0.75) {
                return {
                    xp: 100,
                    nivel: 'rapida',
                    label: 'Nota Rápida',
                    bonus: 0,
                    icone: '⚡',
                    cor: '#f59e0b',
                    spam: true,
                    motivo: 'Estrutura fonética irregular / mash de consoantes (sem bônus)'
                };
            }
        }

        // Extrai palavras válidas (alfanumérico com acentuação)
        const palavras = texto.toLowerCase().match(/[a-zà-ú0-9]+/gi) || [];

        // Filtro 4: Palavras gigantescas coladas sem espaço (mash de teclado)
        const temPalavraMonstro = palavras.some(p => p.length > 25);
        if (temPalavraMonstro) {
            return {
                xp: 100,
                nivel: 'rapida',
                label: 'Nota Rápida',
                bonus: 0,
                icone: '⚡',
                cor: '#f59e0b',
                spam: true,
                motivo: 'Palavras excessivamente longas sem espaçamento (sem bônus)'
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

        // Filtro 5: Vocabulário único (evita Ctrl+V da mesma palavra infinitamente)
        const palavrasUnicas = new Set(palavras);
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
                motivo: 'Repetição excessiva da mesma palavra (sem bônus)'
            };
        }

        // 🌟 Nível 3: Crítica Overcritic Completa (200 XP -> +100 XP bônus)
        if (len >= 180 && palavrasUnicas.size >= 14) {
            return {
                xp: 200,
                nivel: 'completa',
                label: 'Crítica Completa',
                bonus: 100,
                icone: '🌟',
                cor: '#ffd700',
                motivo: 'Análise aprofundada e fundamentada (+100 XP de Bônus Ativado!)'
            };
        }

        // 📝 Nível 2: Resenha Opinativa (150 XP -> +50 XP bônus)
        if (len >= 75 && palavrasUnicas.size >= 8) {
            const faltamCompleta = Math.max(0, 180 - len);
            return {
                xp: 150,
                nivel: 'opinativa',
                label: 'Resenha Opinativa',
                bonus: 50,
                icone: '📝',
                cor: '#22c55e',
                motivo: `Opinião autêntica (+50 XP de Bônus!). Faltam ~${faltamCompleta} caracteres para Crítica Completa.`
            };
        }

        return {
            xp: 100,
            nivel: 'rapida',
            label: 'Nota Rápida',
            bonus: 0,
            icone: '⚡',
            cor: '#94a3b8',
            motivo: `Faltam ${Math.max(0, 80 - len)} caracteres para alcançar Resenha Opinativa`
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

                const mapaJ = new Map();
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

                const mapaPlat = new Map();
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
                        const k = plat.title.trim().toLowerCase();
                        mapaPlat.set(k, plat);
                    });
                }

                const consolidadaP = Array.from(mapaPlat.values());
                localStorage.setItem('overcritic_minhas_platinas', JSON.stringify(consolidadaP));
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

        // 1. Jogos do usuário
        let jogos = [];
        const fakeReviewIds = [1789741152346, 1789742639992, 1789743477104];
        try {
            const rawJ = localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]';
            const parsedJ = JSON.parse(rawJ);
            if (Array.isArray(parsedJ)) {
                jogos = parsedJ.filter(j => {
                    if (!j || !j.titulo) return false;
                    const idNum = Number(j.id);
                    const isSeed = idNum && (idNum === 101 || idNum === 102 || idNum === 103 || idNum === 104 || idNum === 105 || String(j.id).startsWith('feed_seed_'));
                    if (isSeed || fakeReviewIds.includes(idNum)) return false;
                    const dono = (j.autor || '').toLowerCase();
                    const eDoUsuario = dono === usernameLower 
                        || (isAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                        || (effectiveUid && (j.userId === effectiveUid || j.user_id === effectiveUid));
                    return eDoUsuario;
                });
            }
        } catch(e) {}

        // 2. Mídias
        let midias = [];
        try {
            const rawM = localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]';
            const parsedM = JSON.parse(rawM);
            if (Array.isArray(parsedM)) {
                midias = parsedM.filter(m => {
                    if (!m) return false;
                    const dono = (m.autor || '').toLowerCase();
                    const eDoUsuario = dono === usernameLower 
                        || (isAdmin && ['admin', 'administrador', 'adm', 'pontug'].includes(dono)) 
                        || (effectiveUid && (m.userId === effectiveUid || m.user_id === effectiveUid));
                    return eDoUsuario;
                });
            }
        } catch(e) {}

        // 3. Platinas (Unifica overcritic_minhas_platinas, overcritic_platinas_feed e overcritic_platinas)
        let platinas = [];
        try {
            const rawMinhas = localStorage.getItem('overcritic_minhas_platinas') || '[]';
            const rawFeed = localStorage.getItem('overcritic_platinas_feed') || '[]';
            const rawPlats = localStorage.getItem('overcritic_platinas') || '[]';
            const combinadas = [...JSON.parse(rawMinhas), ...JSON.parse(rawFeed), ...JSON.parse(rawPlats)];
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
        executarLimpezaGeralDados,
        abrirGamerCardModal,
        fecharGamerCardModal,
        abrirModalTierList,
        fecharModalTierList,
        atualizarBadgesNivelPagina
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
    window.executarLimpezaGeralDados = executarLimpezaGeralDados;

    console.log('🎮 [Overcritic] Motor de Gamificação, Níveis & Tier List carregado!');
})();

