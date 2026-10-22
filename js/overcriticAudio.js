// js/overcriticAudio.js - Efeitos Sonoros de Interface Sci-Fi (Web Audio API)
// Inspirado nas interfaces de nova geração do PlayStation 5 e Nintendo Switch
// 100% Nativo, Sintetizado em Tempo Real, Leve e com Zero Arquivos Externos

(function () {
    'use strict';

    if (window.OvercriticAudio) return;

    const STORAGE_KEY = 'overcritic_sound_fx_enabled';

    // Estado do áudio: padrão ATIVADO (true), a menos que o usuário tenha explicitamente desligado
    let _audioAtivo = localStorage.getItem(STORAGE_KEY) !== 'false';
    let _audioCtx = null;
    let _ultimoClickTime = 0;

    function obterAudioContext() {
        if (!_audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                _audioCtx = new AudioCtx();
            }
        }
        if (_audioCtx && _audioCtx.state === 'suspended') {
            _audioCtx.resume().catch(() => {});
        }
        return _audioCtx;
    }

    /**
     * Sintetizador de Sons de Interface Sci-Fi
     * Inspirados nas UIs do PS5 e Nintendo Switch
     */
    function tocarSom(tipo = 'click') {
        if (!_audioAtivo) return;

        try {
            const ctx = obterAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            if (tipo === 'click' || tipo === 'ps5_click') {
                // Clique Tátil Sutil Estilo PS5: impulso rápido metálico de alta frequência
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.015);

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1200, now);
                filter.Q.setValueAtTime(3.5, now);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.045, now + 0.003);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.04);
            } 
            else if (tipo === 'pop' || tipo === 'switch_pop') {
                // Pop Orgânico Suave Estilo Nintendo Switch: bolha tátil harmônica
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc1.type = 'sine';
                osc2.type = 'sine';

                // Pitch bend descendente rápido
                osc1.frequency.setValueAtTime(540, now);
                osc1.frequency.exponentialRampToValueAtTime(380, now + 0.04);

                osc2.frequency.setValueAtTime(1080, now);
                osc2.frequency.exponentialRampToValueAtTime(760, now + 0.04);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.04, now + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.05);
                osc2.stop(now + 0.05);
            }
            else if (tipo === 'confirm' || tipo === 'switch_confirm') {
                // Confirmação Positiva Harmônica (Duplo Tom Switch/PS5)
                const notas = [587.33, 880]; // D5 -> A5
                notas.forEach((freq, idx) => {
                    const t = now + idx * 0.035;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);

                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.006);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(t);
                    osc.stop(t + 0.07);
                });
            }
            else if (tipo === 'modal_open') {
                // Sweep Futurista de Abertura Holográfica
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.exponentialRampToValueAtTime(820, now + 0.08);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1500, now);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.04, now + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.09);
            }
            else if (tipo === 'modal_close') {
                // Sweep Suave de Fechamento / Recolhimento
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(620, now);
                osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.08);
            }
            else if (tipo === 'trophy' || tipo === 'achievement') {
                // Arpeggio Cristalino Sci-Fi de Conquista Rara
                const arpeggio = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
                arpeggio.forEach((freq, idx) => {
                    const t = now + idx * 0.045;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = idx === 3 ? 'sine' : 'triangle';
                    osc.frequency.setValueAtTime(freq, t);

                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(t);
                    osc.stop(t + 0.36);
                });
            }
            else if (tipo === 'toggle') {
                // Clique de Interruptor Mecânico / Botão de Som
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(_audioAtivo ? 600 : 380, now);
                osc.frequency.exponentialRampToValueAtTime(_audioAtivo ? 900 : 260, now + 0.025);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.04, now + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.035);
            }
        } catch (e) {
            // Falha silenciosa se áudio não for permitido
        }
    }

    /**
     * Alternância do Áudio (Mute / Unmute)
     */
    function alternarAudio() {
        _audioAtivo = !_audioAtivo;
        localStorage.setItem(STORAGE_KEY, _audioAtivo ? 'true' : 'false');
        atualizarVisualBotoesAudio();

        if (_audioAtivo) {
            tocarSom('pop');
            if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
                window.OvercriticNotificacoes.exibir('🔊 Efeitos Sonoros Sci-Fi Ativados (Estilo PS5/Switch)', 'info');
            }
        } else {
            if (typeof window.OvercriticNotificacoes !== 'undefined' && window.OvercriticNotificacoes.exibir) {
                window.OvercriticNotificacoes.exibir('🔇 Efeitos Sonoros Silenciados', 'aviso');
            }
        }
    }

    function definirAudioAtivo(ativo) {
        _audioAtivo = !!ativo;
        localStorage.setItem(STORAGE_KEY, _audioAtivo ? 'true' : 'false');
        atualizarVisualBotoesAudio();
    }

    /**
     * Atualiza os ícones e tooltips de todos os botões de som na tela
     */
    function atualizarVisualBotoesAudio() {
        const botoes = document.querySelectorAll('.og-sound-toggle-btn');
        botoes.forEach(btn => {
            btn.innerHTML = _audioAtivo ? '🔊' : '🔇';
            btn.title = _audioAtivo 
                ? 'Efeitos Sonoros Sci-Fi: Ligados (Clique para silenciar)' 
                : 'Efeitos Sonoros Sci-Fi: Silenciados (Clique para ativar)';
            btn.setAttribute('aria-label', btn.title);
            btn.classList.toggle('muted', !_audioAtivo);
        });
    }

    /**
     * Injeta e sincroniza o botão discreto de controle de som
     */
    function injetarBotoesAudio() {
        const styleId = 'overcritic-audio-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .og-sound-toggle-btn {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: var(--text-main, #f8f9fa);
                    width: 36px;
                    height: 36px;
                    border-radius: 11px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.05rem;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    user-select: none;
                    flex-shrink: 0;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
                }
                .og-sound-toggle-btn:hover {
                    background: rgba(0, 240, 255, 0.12);
                    border-color: var(--accent-cyan, #00f0ff);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(0, 240, 255, 0.3);
                }
                .og-sound-toggle-btn.muted {
                    opacity: 0.7;
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                .og-sound-toggle-btn.muted:hover {
                    opacity: 1;
                    border-color: #ef4444;
                    box-shadow: 0 6px 18px rgba(239, 68, 68, 0.3);
                }
                body.light-mode .og-sound-toggle-btn {
                    background: rgba(0, 0, 0, 0.06);
                    border-color: rgba(0, 0, 0, 0.15);
                    color: #0c2333;
                }
                body.light-mode .og-sound-toggle-btn:hover {
                    background: rgba(2, 132, 199, 0.12);
                    border-color: #0284c7;
                    box-shadow: 0 6px 18px rgba(2, 132, 199, 0.2);
                }

                /* Botão Discreto no Topo Fixo para Todas as Telas */
                .og-sound-fixed-btn {
                    position: fixed;
                    top: 16px;
                    right: 18px;
                    z-index: 9999;
                }
                @media (max-width: 768px) {
                    .og-sound-fixed-btn {
                        top: 12px;
                        right: 12px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 1. Inserção na barra lateral ao lado ou abaixo do botão de tema, se houver
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn && themeBtn.parentElement && !document.getElementById('ogSidebarSoundBtn')) {
            const soundBtn = document.createElement('button');
            soundBtn.type = 'button';
            soundBtn.id = 'ogSidebarSoundBtn';
            soundBtn.className = 'nav-item og-sound-toggle-btn';
            soundBtn.setAttribute('data-tooltip', 'Som Sci-Fi (PS5/Switch)');
            soundBtn.style.marginTop = '6px';
            soundBtn.addEventListener('click', alternarAudio);
            themeBtn.parentElement.appendChild(soundBtn);
        }

        // 2. Inserção no Header Superior (ao lado das ações de login/busca) se houver
        const authAction = document.getElementById('authHeaderAction');
        if (authAction && !document.getElementById('ogHeaderSoundBtn')) {
            const soundBtn = document.createElement('button');
            soundBtn.type = 'button';
            soundBtn.id = 'ogHeaderSoundBtn';
            soundBtn.className = 'og-sound-toggle-btn';
            soundBtn.style.marginLeft = '4px';
            soundBtn.addEventListener('click', alternarAudio);
            authAction.parentElement.insertBefore(soundBtn, authAction.nextSibling);
        }

        // 3. Fallback caso a página não tenha nem sidebar nem authHeaderAction (cria flutuante discreto no topo)
        if (!document.getElementById('ogSidebarSoundBtn') && !document.getElementById('ogHeaderSoundBtn') && !document.getElementById('ogFloatingSoundBtn')) {
            const floatBtn = document.createElement('button');
            floatBtn.type = 'button';
            floatBtn.id = 'ogFloatingSoundBtn';
            floatBtn.className = 'og-sound-toggle-btn og-sound-fixed-btn';
            floatBtn.addEventListener('click', alternarAudio);
            document.body.appendChild(floatBtn);
        }

        atualizarVisualBotoesAudio();
    }

    /**
     * Delegação Global de Sons de Clique nos Botões
     * Detecta cliques em elementos interativos e emite sons sutis sem poluir o código
     */
    function configurarDelegacaoCliques() {
        document.addEventListener('click', (e) => {
            const now = performance.now();
            if (now - _ultimoClickTime < 45) return; // Debounce de 45ms para evitar repetição artificial

            // Elemento clicado ou ancestral interativo
            const el = e.target.closest(
                'button, .nav-item, .bento-card, .og-btn-action, .plat-chip-btn, .cat-tab-btn, .gp-tab-btn, ' +
                '.og-format-pill, .og-chip-filter, .og-legend-pill, .og-chip-action, .spotlight-quick-trigger, ' +
                '.btn-vote-a, .btn-vote-b, .duel-vote-btn, .og-modal-btn, .btn-submit, .btn-home'
            );

            if (!el) return;

            // Se for o próprio botão de som, o clique já é tratado
            if (el.classList.contains('og-sound-toggle-btn') || el.id === 'ogSidebarSoundBtn' || el.id === 'ogHeaderSoundBtn') {
                return;
            }

            _ultimoClickTime = now;

            // Escolha do timbre de acordo com a intenção do botão
            if (el.classList.contains('og-btn-share') || el.classList.contains('btn-submit') || el.classList.contains('btn-vote-a') || el.classList.contains('btn-vote-b')) {
                tocarSom('confirm');
            } else if (el.classList.contains('og-btn-close') || el.classList.contains('gp-close-btn') || el.classList.contains('og-bo-close')) {
                tocarSom('modal_close');
            } else if (el.classList.contains('og-format-pill') || el.classList.contains('og-b-filter-btn') || el.classList.contains('og-chip-filter')) {
                tocarSom('pop');
            } else {
                tocarSom('click');
            }
        }, { capture: true, passive: true });
    }

    // Inicialização quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injetarBotoesAudio();
            configurarDelegacaoCliques();
        });
    } else {
        injetarBotoesAudio();
        configurarDelegacaoCliques();
    }

    // Exportação da API Pública
    window.OvercriticAudio = {
        play: tocarSom,
        toggle: alternarAudio,
        isMuted: () => !_audioAtivo,
        setEnabled: definirAudioAtivo
    };

    console.log('🔊 [Overcritic] Motor de Áudio Sci-Fi (PS5/Switch UI) carregado com sucesso!');
})();
