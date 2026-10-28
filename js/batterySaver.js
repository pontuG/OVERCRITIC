/**
 * Overcritic Battery Saver & Performance Engine (6.3)
 * Modo Desempenho 60 FPS para Celulares Básicos e Máquinas de Entrada.
 * 
 * Contraste Claro e Evidente:
 * - Modo Visual Máximo: Partículas neon flutuantes, vidros translúcidos com reflexo superior, auroras volumétricas ciano/roxo e física 3D.
 * - Modo Desempenho: Fundo preto fosco esportivo, zero partículas, cards sólidos de alta nitidez, zero sombras pesadas e badge de 60 FPS cravados.
 */

(function (window) {
    'use strict';

    if (window.OvercriticBatterySaver) return;

    const STORAGE_KEY = 'overcritic_battery_saver_mode';
    const STYLE_ID = 'overcritic-battery-saver-styles';
    const BANNER_ID = 'overcriticBatteryStatusBanner';

    let _ativo = false;

    // Recupera preferência persistida
    try {
        _ativo = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
        _ativo = false;
    }

    /**
     * Injeta ou remove os estilos CSS globais de ultra-desempenho
     */
    function aplicarEstilos() {
        let styleEl = document.getElementById(STYLE_ID);

        if (_ativo) {
            document.documentElement.classList.add('battery-saver-active');
            if (document.body) document.body.classList.add('battery-saver-active');

            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = STYLE_ID;
                styleEl.textContent = `
                    /* ══════════════════════════════════════════════════════════
                       MODO DESEMPENHO (60 FPS CRAVADOS) - CONTRASTE FOSCO HIGH-PERF
                       ══════════════════════════════════════════════════════════ */
                    
                    /* 1. Eliminação Total de Efeitos de Blur (GPU Killer) */
                    html.battery-saver-active *,
                    body.battery-saver-active * {
                        -webkit-backdrop-filter: none !important;
                        backdrop-filter: none !important;
                    }

                    /* 2. Fundo Preto Fosco Puro (Desliga a Aurora e Gradientes Pesados) */
                    html.battery-saver-active body,
                    body.battery-saver-active {
                        background: #05070c !important;
                        background-image: none !important;
                    }

                    /* 3. Cards com Acabamento Esportivo Fosco (Zero Transparência / Zero Reflexo) */
                    html.battery-saver-active .bento-card,
                    body.battery-saver-active .bento-card {
                        background: #0d121f !important;
                        border: 1px solid #1e2638 !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
                    }
                    html.battery-saver-active .bento-card::before,
                    body.battery-saver-active .bento-card::before {
                        display: none !important; /* Desliga o reflexo de luz superior */
                    }
                    html.battery-saver-active .bento-card:hover,
                    body.battery-saver-active .bento-card:hover {
                        transform: none !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8) !important;
                        border-color: #334155 !important;
                    }

                    /* Light Mode Otimizado */
                    body.light-mode.battery-saver-active {
                        background: #cbd5e1 !important;
                        background-image: none !important;
                    }
                    body.light-mode.battery-saver-active .bento-card {
                        background: #f1f5f9 !important;
                        border-color: #94a3b8 !important;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
                    }

                    /* 4. Sidebar Sólida e Estável */
                    html.battery-saver-active .sidebar,
                    body.battery-saver-active .sidebar {
                        background: #090e18 !important;
                        border-right-color: #1e2638 !important;
                    }
                    body.light-mode.battery-saver-active .sidebar {
                        background: #e2e8f0 !important;
                        border-right-color: #cbd5e1 !important;
                    }

                    /* 5. Desativação Completa de Partículas em Canvas */
                    html.battery-saver-active #bgParticlesCanvas,
                    body.battery-saver-active #bgParticlesCanvas,
                    html.battery-saver-active canvas.particles-bg {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                    }

                    /* 6. Desativação de Glows Neon e Sombras Difusas */
                    html.battery-saver-active .stat-item,
                    html.battery-saver-active .home-central-gamer-btn,
                    html.battery-saver-active .og-btn-action,
                    html.battery-saver-active .brand-icon img,
                    html.battery-saver-active .greeting-user-name,
                    html.battery-saver-active .quests-strip-icon-pulse {
                        box-shadow: none !important;
                        filter: none !important;
                        text-shadow: none !important;
                    }

                    /* 7. Desativação de Animações Infinitas Decorativas */
                    html.battery-saver-active .quests-strip-icon-pulse,
                    html.battery-saver-active .og-radio-bar,
                    html.battery-saver-active [class*="pulse"],
                    html.battery-saver-active [class*="glow-anim"] {
                        animation: none !important;
                    }

                    /* 8. Letreiro de Notícias e Barra de Missões em Modo Clean */
                    html.battery-saver-active .live-ticker-container,
                    html.battery-saver-active .home-quests-live-strip {
                        background: #0a0e1a !important;
                        border-color: #1e2638 !important;
                        box-shadow: none !important;
                    }

                    /* 9. Desativação de Física 3D e Parallax no Gamer Card */
                    html.battery-saver-active .og-card-preview {
                        transform: none !important;
                        transition: none !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
                    }
                    html.battery-saver-active .og-card-holo-foil,
                    html.battery-saver-active .og-card-holo-glare,
                    html.battery-saver-active .og-card-holo-sparkles,
                    html.battery-saver-active .og-card-holo-hint {
                        display: none !important;
                    }

                    /* 10. Rádio Lo-Fi em Modo Fosco Econômico */
                    html.battery-saver-active .og-radio-panel {
                        background: #0a0e1a !important;
                        border-color: #1e2638 !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
                    }
                    html.battery-saver-active .og-radio-bar {
                        height: 6px !important;
                        opacity: 0.7 !important;
                    }

                    /* 11. Botão da Sidebar Iluminado em Verde Elétrico */
                    .btn-battery-saver.is-active,
                    #batterySaverBtn.is-active {
                        color: #10b981 !important;
                        background: rgba(16, 185, 129, 0.20) !important;
                        border-color: #10b981 !important;
                        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4) !important;
                    }

                    /* 12. BANNER DE STATUS SUPERIOR (MODO 60 FPS) */
                    .overcritic-battery-status-strip {
                        width: 100%;
                        background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.25) 100%);
                        border: 1px solid rgba(16, 185, 129, 0.4);
                        border-radius: 12px;
                        padding: 8px 16px;
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        box-sizing: border-box;
                        color: #f1f5f9;
                        font-size: 0.82rem;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    }
                    .og-strip-left {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .og-strip-badge {
                        background: #10b981;
                        color: #042f2e;
                        font-weight: 900;
                        font-size: 0.72rem;
                        padding: 3px 8px;
                        border-radius: 6px;
                        letter-spacing: 0.5px;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .og-strip-msg {
                        color: #cbd5e1;
                        font-weight: 500;
                    }
                    .og-strip-btn {
                        background: rgba(0, 240, 255, 0.12);
                        border: 1px solid var(--accent-cyan, #00f0ff);
                        color: var(--accent-cyan, #00f0ff);
                        font-weight: 700;
                        font-size: 0.78rem;
                        padding: 5px 14px;
                        border-radius: 8px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.2s ease;
                        flex-shrink: 0;
                    }
                    .og-strip-btn:hover {
                        background: var(--accent-cyan, #00f0ff);
                        color: #040711;
                        box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
                    }
                `;
                document.head.appendChild(styleEl);
            }
            gerenciarBannerStatus(true);
        } else {
            document.documentElement.classList.remove('battery-saver-active');
            if (document.body) document.body.classList.remove('battery-saver-active');
            if (styleEl) {
                styleEl.remove();
            }
            gerenciarBannerStatus(false);
        }

        // Atualiza o estado visual de todos os botões de alternância na página
        atualizarBotoesUI();

        // Dispara evento global para que outros módulos (rádio, tilt, canvas) pausem loops
        try {
            const evento = new CustomEvent('overcritic:batterySaverChange', {
                detail: { ativo: _ativo }
            });
            window.dispatchEvent(evento);
        } catch (e) {}
    }

    /**
     * Cria ou remove o banner visual superior quando em modo de desempenho
     */
    function gerenciarBannerStatus(exibir) {
        let banner = document.getElementById(BANNER_ID);
        if (exibir) {
            if (!banner) {
                const containerAlvo = document.querySelector('.main-content') || document.querySelector('main') || document.body;
                if (!containerAlvo) return;

                banner = document.createElement('div');
                banner.id = BANNER_ID;
                banner.className = 'overcritic-battery-status-strip';
                banner.innerHTML = `
                    <div class="og-strip-left">
                        <span class="og-strip-badge">⚡ 60 FPS CRAVADOS</span>
                        <span class="og-strip-msg">Modo Desempenho Ativo • Partículas e blurs pesados desligados para fluidez total</span>
                    </div>
                    <button type="button" class="og-strip-btn" onclick="window.OvercriticBatterySaver.disable()">
                        <span>✨</span> Modo Visual Máximo
                    </button>
                `;

                // Insere logo no topo do conteúdo principal
                if (containerAlvo.firstChild) {
                    containerAlvo.insertBefore(banner, containerAlvo.firstChild);
                } else {
                    containerAlvo.appendChild(banner);
                }
            }
        } else {
            if (banner) banner.remove();
        }
    }

    /**
     * Atualiza o estado visual de todos os botões de alternância da página
     */
    function atualizarBotoesUI() {
        const botoes = document.querySelectorAll('#batterySaverBtn, .btn-battery-saver, [data-action="toggle-battery-saver"]');
        botoes.forEach(btn => {
            if (_ativo) {
                btn.classList.add('is-active');
                btn.setAttribute('title', 'Modo Desempenho (60 FPS) ATIVO • Clique para restaurar efeitos visuais completos');
                btn.setAttribute('aria-pressed', 'true');
                if (btn.querySelector('.battery-icon')) {
                    btn.querySelector('.battery-icon').textContent = '⚡';
                } else if (!btn.querySelector('span')) {
                    btn.textContent = '⚡';
                }
                if (btn.hasAttribute('data-tooltip')) {
                    btn.setAttribute('data-tooltip', '60 FPS Ativo (⚡)');
                }
            } else {
                btn.classList.remove('is-active');
                btn.setAttribute('title', 'Modo Desempenho • Desligar blurs e partículas para 60 FPS cravados');
                btn.setAttribute('aria-pressed', 'false');
                if (btn.querySelector('.battery-icon')) {
                    btn.querySelector('.battery-icon').textContent = '🔋';
                } else if (!btn.querySelector('span')) {
                    btn.textContent = '🔋';
                }
                if (btn.hasAttribute('data-tooltip')) {
                    btn.setAttribute('data-tooltip', 'Modo 60 FPS (🔋)');
                }
            }
        });
    }

    /**
     * Exibe notificação toast elegante
     */
    function exibirToastFeedback(ativo) {
        if (window.showToast && typeof window.showToast.info === 'function') {
            if (ativo) {
                window.showToast.success('⚡ Modo Desempenho (60 FPS) Ativado! Partículas, auras e blurs desligados.');
            } else {
                window.showToast.info('✨ Modo Visual Máximo Restaurado! Partículas neon, reflexos de vidro e auras reativadas.');
            }
        }
    }

    /**
     * Alterna o Modo Bateria / Desempenho
     */
    function toggle(silencioso = false) {
        _ativo = !_ativo;
        try {
            localStorage.setItem(STORAGE_KEY, _ativo ? 'true' : 'false');
        } catch (e) {}

        aplicarEstilos();

        if (!silencioso) {
            exibirToastFeedback(_ativo);
        }

        return _ativo;
    }

    /**
     * Ativa explicitamente o Modo Desempenho
     */
    function enable(silencioso = false) {
        if (!_ativo) {
            _ativo = true;
            try {
                localStorage.setItem(STORAGE_KEY, 'true');
            } catch (e) {}
            aplicarEstilos();
            if (!silencioso) exibirToastFeedback(true);
        }
        return true;
    }

    /**
     * Desativa explicitamente o Modo Desempenho
     */
    function disable(silencioso = false) {
        if (_ativo) {
            _ativo = false;
            try {
                localStorage.setItem(STORAGE_KEY, 'false');
            } catch (e) {}
            aplicarEstilos();
            if (!silencioso) exibirToastFeedback(false);
        }
        return false;
    }

    /**
     * Inicialização e vinculação de eventos quando o DOM estiver pronto
     */
    function init() {
        aplicarEstilos();

        // Vincula cliques aos botões existentes
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#batterySaverBtn, .btn-battery-saver, [data-action="toggle-battery-saver"]');
            if (btn) {
                e.preventDefault();
                toggle();
            }
        });

        // Verificação inteligente de bateria nativa
        if (navigator.getBattery && typeof navigator.getBattery === 'function') {
            navigator.getBattery().then(battery => {
                if (!battery.charging && battery.level <= 0.20 && !_ativo) {
                    const jaAvisou = sessionStorage.getItem('overcritic_battery_low_prompt');
                    if (!jaAvisou) {
                        sessionStorage.setItem('overcritic_battery_low_prompt', '1');
                        setTimeout(() => {
                            if (window.showToast && typeof window.showToast.info === 'function') {
                                window.showToast.info('Bateria baixa detectada! O Modo Desempenho (60 FPS) está disponível no menu lateral 🔋');
                            }
                        }, 3000);
                    }
                }
            }).catch(() => {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exportação da API Pública Global
    window.OvercriticBatterySaver = {
        toggle: toggle,
        enable: enable,
        disable: disable,
        isEnabled: () => _ativo,
        isAtivo: () => _ativo
    };

    console.log(`⚡ [Overcritic] Motor de Bateria & Desempenho 60 FPS inicializado (Estado: ${_ativo ? 'ATIVO' : 'DESATIVADO'}).`);

})(window);
