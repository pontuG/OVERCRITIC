/**
 * Overcritic Lo-Fi & Synthwave Radio (6.1 - Opção 1: Hospedagem Própria & Áudio Real)
 * Minitocador discreto e flutuante no rodapé para imersão auditiva durante leitura e navegação.
 * 
 * Funcionalidades:
 * - 3 Estações Temáticas (Cyberpunk 88.4 FM, Chill Lo-Fi 92.1 FM e Arcade 104.5 FM).
 * - Arquivos de Áudio Reais (.mp3) com qualidade de estúdio (Kevin MacLeod / Royalty-Free CC-BY 4.0).
 * - Suporte Híbrido: Prioriza arquivos locais em assets/audio/ e faz streaming confiável de URLs remotas / Supabase Storage.
 * - Fallback Instantâneo Procedural via Web Audio API caso a rede falhe e não haja arquivo local.
 * - Slider de Volume 100% Maleável e Contínuo: arrasto fluido e elástico sem saltos nem travamentos de clique.
 * - Reprodução Contínua: ao término de cada faixa, avança automaticamente para a próxima música.
 * - Equalizador Visual Holográfico Dinâmico que reage ao status de reprodução.
 * - Persistência completa no localStorage.
 */

(function (window) {
    'use strict';

    if (window.OvercriticRadio) return;

    const STORAGE_KEY = 'overcritic_lofi_radio_v1';
    
    // ═════════════════════════════════════════════════════════════════
    // 1. CATÁLOGO MUSICAL: 3 ESTAÇÕES E 12 FAIXAS COM ÁUDIO REAL & SYNTH
    // ═════════════════════════════════════════════════════════════════
    const ESTACOES = [
        {
            id: 'synthwave',
            nome: 'Cyberpunk 88.4 FM',
            badge: '🌆 SYNTHWAVE',
            frequencia: '88.4 FM',
            cor: '#00f0ff',
            descricao: 'Arpeggios analógicos, neon noturno e sintetizadores retrô',
            faixas: [
                {
                    titulo: 'RetroFuture Clean',
                    artista: 'Kevin MacLeod',
                    estilo: 'Synthwave Retrô Anos 80',
                    arquivoLocal: 'assets/audio/synthwave/retrofuture_clean.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/RetroFuture%20Clean.mp3',
                    synth: {
                        bpm: 98,
                        tempoBatida: 1830,
                        tipo: 'sawtooth',
                        filterFreq: 1400,
                        resonance: 2.2,
                        chords: [[196, 233, 293, 392], [155, 196, 233, 311], [116, 174, 233, 293], [174, 220, 261, 349]],
                        bass: [98, 77, 58, 87],
                        arp: [392, 466, 587, 466, 349, 440, 523, 440]
                    }
                },
                {
                    titulo: 'Chill Wave',
                    artista: 'Kevin MacLeod',
                    estilo: 'Sintetizadores Analógicos Suaves',
                    arquivoLocal: 'assets/audio/synthwave/chill_wave.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Chill%20Wave.mp3',
                    synth: {
                        bpm: 86,
                        tempoBatida: 2090,
                        tipo: 'sawtooth',
                        filterFreq: 1150,
                        resonance: 1.8,
                        chords: [[146, 220, 261, 329], [130, 196, 246, 329], [116, 174, 220, 261], [130, 196, 246, 293]],
                        bass: [73, 65, 58, 65],
                        arp: [293, 329, 392, 440, 523, 440, 392, 329]
                    }
                },
                {
                    titulo: 'Equatorial Complex',
                    artista: 'Kevin MacLeod',
                    estilo: 'Cyberpunk Noturno & Atmosférico',
                    arquivoLocal: 'assets/audio/synthwave/equatorial_complex.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Equatorial%20Complex.mp3',
                    synth: {
                        bpm: 72,
                        tempoBatida: 2500,
                        tipo: 'triangle',
                        filterFreq: 580,
                        resonance: 1.2,
                        chords: [[82, 164, 196, 246], [123, 185, 220, 293], [130, 196, 246, 329], [146, 220, 293, 369]],
                        bass: [41, 61, 65, 73],
                        arp: [196, 246, 293, 369, 329, 246]
                    }
                },
                {
                    titulo: 'Digital Lemonade',
                    artista: 'Kevin MacLeod',
                    estilo: 'Synth Pop Eletrônico Vibrante',
                    arquivoLocal: 'assets/audio/synthwave/digital_lemonade.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Digital%20Lemonade.mp3',
                    synth: {
                        bpm: 116,
                        tempoBatida: 1550,
                        tipo: 'sawtooth',
                        filterFreq: 1850,
                        resonance: 3.0,
                        chords: [[220, 261, 329, 440], [174, 220, 261, 349], [130, 196, 261, 329], [196, 246, 293, 392]],
                        bass: [110, 87, 65, 98],
                        arp: [440, 523, 659, 523, 349, 440, 523, 659]
                    }
                }
            ]
        },
        {
            id: 'lofi',
            nome: 'Chill Lo-Fi 92.1 FM',
            badge: '☕ LO-FI STUDY',
            frequencia: '92.1 FM',
            cor: '#ffd166',
            descricao: 'Teclas de Rhodes quentes, batidas relaxantes e textura de vinil',
            faixas: [
                {
                    titulo: 'Hypnothis',
                    artista: 'Kevin MacLeod',
                    estilo: 'Lo-Fi Beats & Relaxamento Suave',
                    arquivoLocal: 'assets/audio/lofi/hypnothis.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hypnothis.mp3',
                    synth: {
                        bpm: 74,
                        tempoBatida: 2430,
                        tipo: 'triangle',
                        filterFreq: 680,
                        resonance: 1.1,
                        chords: [[130, 164, 196, 246], [110, 164, 196, 220], [146, 174, 220, 261], [98, 146, 174, 220]],
                        bass: [65, 55, 73, 49],
                        arp: [246, 293, 329, 392]
                    }
                },
                {
                    titulo: 'Airport Lounge',
                    artista: 'Kevin MacLeod',
                    estilo: 'Rhodes Jazz & Lounge Café',
                    arquivoLocal: 'assets/audio/lofi/airport_lounge.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Airport%20Lounge.mp3',
                    synth: {
                        bpm: 64,
                        tempoBatida: 2810,
                        tipo: 'sine',
                        filterFreq: 520,
                        resonance: 0.9,
                        chords: [[174, 220, 261, 329], [164, 196, 246, 293], [146, 220, 261, 329], [130, 196, 246, 329]],
                        bass: [87, 82, 73, 65],
                        arp: [392, 329, 261, 220]
                    }
                },
                {
                    titulo: 'Overcast',
                    artista: 'Kevin MacLeod',
                    estilo: 'Piano Acústico & Serenidade',
                    arquivoLocal: 'assets/audio/lofi/overcast.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Overcast.mp3',
                    synth: {
                        bpm: 78,
                        tempoBatida: 2300,
                        tipo: 'triangle',
                        filterFreq: 750,
                        resonance: 1.4,
                        chords: [[196, 246, 293, 369], [123, 185, 220, 293], [130, 196, 246, 293], [146, 220, 293, 349]],
                        bass: [98, 123, 65, 73],
                        arp: [369, 440, 587, 440]
                    }
                },
                {
                    titulo: 'Carefree',
                    artista: 'Kevin MacLeod',
                    estilo: 'Acústico Alegre & Descontraído',
                    arquivoLocal: 'assets/audio/lofi/carefree.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3',
                    synth: {
                        bpm: 70,
                        tempoBatida: 2570,
                        tipo: 'triangle',
                        filterFreq: 620,
                        resonance: 1.2,
                        chords: [[146, 220, 261, 329], [98, 196, 246, 293], [130, 196, 246, 329], [110, 174, 220, 277]],
                        bass: [73, 98, 65, 55],
                        arp: [329, 369, 392, 440]
                    }
                }
            ]
        },
        {
            id: 'arcade',
            nome: 'Arcade 104.5 FM',
            badge: '👾 8-BIT NOSTALGIA',
            frequencia: '104.5 FM',
            cor: '#c77dff',
            descricao: 'Harmonias de Chiptune nostálgicas e trilhas sonoras 16-bit',
            faixas: [
                {
                    titulo: 'Pixelland',
                    artista: 'Kevin MacLeod',
                    estilo: 'Chiptune Clássico & Aventura 8-Bit',
                    arquivoLocal: 'assets/audio/arcade/pixelland.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pixelland.mp3',
                    synth: {
                        bpm: 122,
                        tempoBatida: 1475,
                        tipo: 'square',
                        filterFreq: 1900,
                        resonance: 2.5,
                        chords: [[261, 329, 392, 523], [196, 246, 293, 392], [220, 261, 329, 440], [174, 220, 261, 349]],
                        bass: [130, 98, 110, 87],
                        arp: [523, 659, 783, 659, 392, 493, 587, 493]
                    }
                },
                {
                    titulo: 'Exit the Premises',
                    artista: 'Kevin MacLeod',
                    estilo: 'Arcade Retro Dance Acelerado',
                    arquivoLocal: 'assets/audio/arcade/exit_the_premises.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Exit%20the%20Premises.mp3',
                    synth: {
                        bpm: 104,
                        tempoBatida: 1730,
                        tipo: 'square',
                        filterFreq: 1500,
                        resonance: 2.2,
                        chords: [[174, 220, 261, 349], [196, 246, 293, 392], [164, 196, 246, 329], [220, 261, 329, 440]],
                        bass: [87, 98, 82, 110],
                        arp: [349, 392, 440, 523, 659, 523]
                    }
                },
                {
                    titulo: '8bit Dungeon Boss',
                    artista: 'Kevin MacLeod',
                    estilo: 'Batalha de RPG 8-Bit Retrô',
                    arquivoLocal: 'assets/audio/arcade/8bit_dungeon_boss.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/8bit%20Dungeon%20Boss.mp3',
                    synth: {
                        bpm: 80,
                        tempoBatida: 2250,
                        tipo: 'square',
                        filterFreq: 850,
                        resonance: 2.0,
                        chords: [[261, 311, 392, 523], [207, 261, 311, 415], [174, 207, 261, 349], [196, 246, 293, 392]],
                        bass: [130, 103, 87, 98],
                        arp: [523, 493, 440, 392]
                    }
                },
                {
                    titulo: 'Takeover of the 8-bit Synths',
                    artista: 'Kevin MacLeod',
                    estilo: 'Sintetizadores Chiptune Eletrizantes',
                    arquivoLocal: 'assets/audio/arcade/takeover_8bit_synths.mp3',
                    urlRemota: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Takeover%20of%20the%208-bit%20Synths.mp3',
                    synth: {
                        bpm: 72,
                        tempoBatida: 2500,
                        tipo: 'triangle',
                        filterFreq: 950,
                        resonance: 1.5,
                        chords: [[146, 220, 293, 369], [220, 277, 329, 440], [123, 185, 220, 293], [196, 246, 293, 392]],
                        bass: [73, 55, 61, 49],
                        arp: [369, 440, 587, 739, 587, 440]
                    }
                }
            ]
        }
    ];

    // Estado da Rádio
    let _estado = {
        tocando: false,
        estacaoIndex: 0,
        faixaIndex: 0,
        volume: 0.55,
        mudo: false,
        minimizado: true,
        modoProceduralAtivo: false // Indica se está no fallback procedural Web Audio
    };

    // Recursos de Áudio
    let _audioEl = null;        // Elemento HTML5 <audio>
    let _audioCtx = null;       // Web Audio Context (para fallback e efeitos)
    let _masterGain = null;     // Ganho master para síntese
    let _synthTimeout = null;
    let _arpInterval = null;
    let _activeNodes = [];
    let _stepAcorde = 0;

    // Carrega preferências salvas no localStorage
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.volume === 'number') _estado.volume = Math.max(0, Math.min(1, parsed.volume));
            if (typeof parsed.estacaoIndex === 'number' && ESTACOES[parsed.estacaoIndex]) _estado.estacaoIndex = parsed.estacaoIndex;
            if (typeof parsed.faixaIndex === 'number') _estado.faixaIndex = parsed.faixaIndex;
            if (typeof parsed.minimizado === 'boolean') _estado.minimizado = parsed.minimizado;
        }
    } catch (e) {}

    function salvarEstado() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                volume: _estado.volume,
                estacaoIndex: _estado.estacaoIndex,
                faixaIndex: _estado.faixaIndex,
                minimizado: _estado.minimizado
            }));
        } catch (e) {}
    }

    // Carrega playlist externa do assets/audio/playlist.json caso disponível
    function carregarPlaylistExterna() {
        if (!window.fetch) return;
        fetch('assets/audio/playlist.json')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data.estacoes) && data.estacoes.length > 0) {
                    data.estacoes.forEach(estNova => {
                        const estExistente = ESTACOES.find(e => e.id === estNova.id);
                        if (estExistente && Array.isArray(estNova.faixas)) {
                            // Atualiza URLs caso o desenvolvedor tenha configurado links próprios
                            estNova.faixas.forEach((faixaNova, idx) => {
                                if (estExistente.faixas[idx]) {
                                    if (faixaNova.arquivoLocal) estExistente.faixas[idx].arquivoLocal = faixaNova.arquivoLocal;
                                    if (faixaNova.urlRemota) estExistente.faixas[idx].urlRemota = faixaNova.urlRemota;
                                }
                            });
                        }
                    });
                    console.log('📻 [Overcritic Radio] Playlist externa assets/audio/playlist.json sincronizada!');
                }
            })
            .catch(() => {});
    }
    carregarPlaylistExterna();

    /* ═════════════════════════════════════════════════════════════════
       2. ELEMENTO NATIVO HTML5 <AUDIO>
       ═════════════════════════════════════════════════════════════════ */
    function obterAudioElemento() {
        if (!_audioEl) {
            _audioEl = document.getElementById('ogRadioAudio');
            if (!_audioEl) {
                _audioEl = document.createElement('audio');
                _audioEl.id = 'ogRadioAudio';
                _audioEl.preload = 'auto';
                _audioEl.style.display = 'none';
                document.body.appendChild(_audioEl);
            }

            // Ao término da música, passa automaticamente para a próxima faixa
            _audioEl.addEventListener('ended', () => {
                console.log('📻 [Overcritic Radio] Faixa concluída, avançando para a próxima...');
                proximaFaixa();
            });

            // Tratamento inteligente de erro de carregamento: fallback automático para síntese
            _audioEl.addEventListener('error', (e) => {
                console.warn('📻 [Overcritic Radio] Não foi possível carregar o arquivo MP3 remoto/local. Ativando sintetizador procedural de contingência...', e);
                ativarFallbackProcedural();
            });

            _audioEl.addEventListener('playing', () => {
                _estado.modoProceduralAtivo = false;
                animarEqualizador(true);
            });

            _audioEl.addEventListener('pause', () => {
                if (!_estado.modoProceduralAtivo) {
                    animarEqualizador(false);
                }
            });
        }
        return _audioEl;
    }

    /* ═════════════════════════════════════════════════════════════════
       3. ESTILOS CSS INJETADOS AUTOMATICAMENTE
       ═════════════════════════════════════════════════════════════════ */
    function injetarEstilosRadio() {
        if (document.getElementById('overcritic-radio-styles')) return;
        const style = document.createElement('style');
        style.id = 'overcritic-radio-styles';
        style.textContent = `
            /* Container Flutuante da Rádio no Rodapé */
            .og-radio-widget {
                position: fixed;
                bottom: 22px;
                left: 88px;
                z-index: 99998;
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
                touch-action: none;
                -webkit-touch-callout: none;
                user-select: none;
                -webkit-user-select: none;
            }
            @media (max-width: 768px) {
                .og-radio-widget {
                    bottom: 78px;
                    left: auto;
                    right: 14px;
                    touch-action: none !important;
                }
                /* No mobile, a pílula minimizada vira apenas um ícone circular compacto de 48px */
                .og-radio-widget.og-radio-minimized .og-radio-pill {
                    width: 48px !important;
                    height: 48px !important;
                    border-radius: 50% !important;
                    padding: 0 !important;
                    justify-content: center !important;
                    gap: 0 !important;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 240, 255, 0.4) !important;
                    touch-action: none !important;
                    cursor: grab;
                }
                .og-radio-widget.og-radio-minimized.og-radio-dragging .og-radio-pill {
                    cursor: grabbing !important;
                }
                .og-radio-widget.og-radio-minimized .og-radio-pill-text {
                    display: none !important;
                }
                .og-radio-widget.og-radio-minimized .og-radio-pill-action {
                    display: none !important;
                }
                .og-radio-widget.og-radio-minimized .og-radio-pill-icon {
                    font-size: 1.35rem !important;
                    pointer-events: none !important;
                }
                /* No mobile, quando expandido, o player fica elegantemente centralizado no rodapé */
                .og-radio-widget:not(.og-radio-minimized) {
                    left: 50% !important;
                    top: auto !important;
                    bottom: 16px !important;
                    right: auto !important;
                    transform: translateX(-50%) !important;
                    width: calc(100vw - 24px) !important;
                    max-width: 350px !important;
                    z-index: 999999 !important;
                }
                .og-radio-widget:not(.og-radio-minimized) .og-radio-panel {
                    width: 100% !important;
                    max-width: 100% !important;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.35) !important;
                }
                /* Durante o arrasto: remove transições para resposta tátil instantânea a 60-120fps */
                .og-radio-widget.og-radio-dragging {
                    transition: none !important;
                    opacity: 0.92;
                    transform: scale(1.08) !important;
                }
            }

            /* ── Pílula Recolhida (Modo Minimalista) ── */
            .og-radio-pill {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, rgba(13, 19, 33, 0.94) 0%, rgba(8, 12, 22, 0.98) 100%);
                border: 1px solid rgba(0, 240, 255, 0.35);
                border-radius: 999px;
                padding: 6px 14px 6px 10px;
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.15);
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
            }
            .og-radio-pill:hover {
                transform: translateY(-2px) scale(1.02);
                border-color: rgba(0, 240, 255, 0.7);
                box-shadow: 0 14px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 240, 255, 0.35);
            }
            body.light-mode .og-radio-pill {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 244, 248, 0.98) 100%);
                border-color: rgba(8, 145, 178, 0.4);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 0 15px rgba(8, 145, 178, 0.2);
            }
            .og-radio-pill-icon {
                font-size: 1.15rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .og-radio-pill-text {
                display: flex;
                flex-direction: column;
                line-height: 1.15;
            }
            .og-radio-pill-title {
                font-size: 0.76rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                color: #00f0ff;
                text-transform: uppercase;
            }
            body.light-mode .og-radio-pill-title {
                color: #0891b2;
            }
            .og-radio-pill-sub {
                font-size: 0.68rem;
                color: #94a3b8;
                font-weight: 500;
                max-width: 140px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.light-mode .og-radio-pill-sub {
                color: #64748b;
            }
            .og-radio-pill-action {
                background: rgba(0, 240, 255, 0.15);
                border: 1px solid rgba(0, 240, 255, 0.35);
                color: #00f0ff;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }
            .og-radio-pill-action:hover {
                transform: scale(1.1);
                background: #00f0ff;
                color: #07090f;
            }

            /* ── Player Expandido (Painel Holográfico Sci-Fi) ── */
            .og-radio-panel {
                width: 320px;
                background: linear-gradient(160deg, rgba(13, 19, 35, 0.96) 0%, rgba(9, 13, 24, 0.98) 100%);
                border: 1px solid rgba(0, 240, 255, 0.35);
                border-radius: 20px;
                padding: 16px;
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 240, 255, 0.18);
                display: flex;
                flex-direction: column;
                gap: 12px;
                color: #f1f5f9;
                transform-origin: bottom left;
                animation: ogRadioPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes ogRadioPopIn {
                from { opacity: 0; transform: scale(0.9) translateY(12px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            body.light-mode .og-radio-panel {
                background: linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%);
                border-color: rgba(8, 145, 178, 0.35);
                box-shadow: 0 25px 50px rgba(8, 145, 178, 0.18), 0 10px 25px rgba(0, 0, 0, 0.1);
                color: #0f172a;
            }

            /* Header da Rádio */
            .og-radio-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 10px;
            }
            body.light-mode .og-radio-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
            }
            .og-radio-brand {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 800;
                font-size: 0.85rem;
                letter-spacing: 0.5px;
            }
            .og-radio-min-btn {
                background: rgba(255, 255, 255, 0.08);
                border: none;
                color: #94a3b8;
                width: 24px;
                height: 24px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                transition: background 0.2s ease, color 0.2s ease;
            }
            .og-radio-min-btn:hover {
                background: rgba(255, 255, 255, 0.18);
                color: #fff;
            }

            /* Abas de Estações */
            .og-radio-tabs {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
                background: rgba(0, 0, 0, 0.35);
                padding: 4px;
                border-radius: 10px;
            }
            body.light-mode .og-radio-tabs {
                background: rgba(0, 0, 0, 0.06);
            }
            .og-radio-tab {
                background: transparent;
                border: none;
                border-radius: 8px;
                padding: 6px 4px;
                font-size: 0.72rem;
                font-weight: 700;
                color: #94a3b8;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                text-align: center;
            }
            .og-radio-tab:hover {
                color: #f1f5f9;
                background: rgba(255, 255, 255, 0.06);
            }
            .og-radio-tab.active {
                background: rgba(0, 240, 255, 0.2);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.4);
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
            }
            body.light-mode .og-radio-tab.active {
                background: rgba(8, 145, 178, 0.15);
                color: #0891b2;
                border-color: rgba(8, 145, 178, 0.4);
            }

            /* Informações da Faixa Atual */
            .og-radio-track-box {
                background: rgba(0, 0, 0, 0.45);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                position: relative;
                overflow: hidden;
            }
            body.light-mode .og-radio-track-box {
                background: rgba(0, 0, 0, 0.03);
                border-color: rgba(0, 0, 0, 0.08);
            }
            .og-radio-track-title {
                font-size: 0.88rem;
                font-weight: 700;
                color: #f8fafc;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.light-mode .og-radio-track-title {
                color: #0f172a;
            }
            .og-radio-track-artist {
                font-size: 0.72rem;
                color: #94a3b8;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.light-mode .og-radio-track-artist {
                color: #64748b;
            }

            /* Equalizador de Barras Neon */
            .og-radio-eq-bars {
                display: flex;
                align-items: flex-end;
                gap: 3px;
                height: 16px;
                position: absolute;
                right: 12px;
                top: 14px;
            }
            .og-radio-bar {
                width: 3px;
                background: #00f0ff;
                border-radius: 2px;
                height: 3px;
                transition: height 0.15s ease;
            }
            .is-playing .og-radio-bar:nth-child(1) { animation: ogEqBar1 0.7s infinite alternate ease-in-out; }
            .is-playing .og-radio-bar:nth-child(2) { animation: ogEqBar2 0.5s infinite alternate ease-in-out 0.1s; }
            .is-playing .og-radio-bar:nth-child(3) { animation: ogEqBar3 0.8s infinite alternate ease-in-out 0.2s; }
            .is-playing .og-radio-bar:nth-child(4) { animation: ogEqBar4 0.6s infinite alternate ease-in-out 0.15s; }
            .is-playing .og-radio-bar:nth-child(5) { animation: ogEqBar5 0.9s infinite alternate ease-in-out 0.25s; }

            @keyframes ogEqBar1 { 0% { height: 3px; } 100% { height: 14px; } }
            @keyframes ogEqBar2 { 0% { height: 4px; } 100% { height: 16px; } }
            @keyframes ogEqBar3 { 0% { height: 2px; } 100% { height: 15px; } }
            @keyframes ogEqBar4 { 0% { height: 5px; } 100% { height: 12px; } }
            @keyframes ogEqBar5 { 0% { height: 3px; } 100% { height: 13px; } }

            /* Controles de Reprodução */
            .og-radio-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                margin-top: 2px;
            }
            .og-radio-btn-play {
                background: linear-gradient(135deg, #00f0ff 0%, #00a8ff 100%);
                color: #05070d;
                border: none;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.15rem;
                cursor: pointer;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.45);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .og-radio-btn-play:hover {
                transform: scale(1.08);
                box-shadow: 0 0 25px rgba(0, 240, 255, 0.7);
            }
            .og-radio-btn-ctrl {
                background: rgba(255, 255, 255, 0.08);
                color: #f1f5f9;
                border: 1px solid rgba(255, 255, 255, 0.15);
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.85rem;
                cursor: pointer;
                transition: transform 0.2s ease, background 0.2s ease;
            }
            .og-radio-btn-ctrl:hover {
                transform: scale(1.1);
                background: rgba(0, 240, 255, 0.2);
                border-color: rgba(0, 240, 255, 0.4);
                color: #00f0ff;
            }
            body.light-mode .og-radio-btn-ctrl {
                background: rgba(0, 0, 0, 0.06);
                border-color: rgba(0, 0, 0, 0.12);
                color: #334155;
            }

            /* Faixa de Volume Contínuo Maleável */
            .og-radio-vol-strip {
                display: flex;
                align-items: center;
                gap: 10px;
                padding-top: 4px;
            }
            .og-radio-vol-btn {
                background: transparent;
                border: none;
                font-size: 1rem;
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease;
            }
            .og-radio-vol-btn:hover {
                transform: scale(1.15);
            }
            .og-radio-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 6px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.18);
                outline: none;
                cursor: pointer;
                transition: background 0.05s ease;
            }
            body.light-mode .og-radio-slider {
                background: rgba(0, 0, 0, 0.15);
            }
            .og-radio-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #00f0ff;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
                transition: transform 0.15s ease;
            }
            .og-radio-slider::-webkit-slider-thumb:hover {
                transform: scale(1.25);
            }
            .og-radio-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #00f0ff;
                border: none;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
            }
        `;
        document.head.appendChild(style);
    }

    /* ═════════════════════════════════════════════════════════════════
       4. MOTOR DE SÍNTESE PROCEDURAL (CONTINGÊNCIA OFFLINE EM 0MS)
       ═════════════════════════════════════════════════════════════════ */
    function obterAudioContext() {
        if (!_audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                _audioCtx = new AudioCtx();
                _masterGain = _audioCtx.createGain();
                _masterGain.connect(_audioCtx.destination);
                aplicarVolumeInstantaneo();
            }
        }
        if (_audioCtx && _audioCtx.state === 'suspended') {
            _audioCtx.resume().catch(() => {});
        }
        return _audioCtx;
    }

    function pararMotorSonoro() {
        if (_synthTimeout) {
            clearTimeout(_synthTimeout);
            _synthTimeout = null;
        }
        if (_arpInterval) {
            clearInterval(_arpInterval);
            _arpInterval = null;
        }

        const now = _audioCtx ? _audioCtx.currentTime : 0;
        _activeNodes.forEach(item => {
            try {
                if (item.gain && item.gain.gain) {
                    item.gain.gain.setValueAtTime(item.gain.gain.value, now);
                    item.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
                }
                setTimeout(() => {
                    try { item.osc.stop(); } catch(e) {}
                    try { item.osc.disconnect(); } catch(e) {}
                }, 130);
            } catch(e) {}
        });
        _activeNodes = [];
    }

    function dispararCompassoFaixa(synthConfig) {
        if (!_estado.tocando || !_estado.modoProceduralAtivo) return;
        const ctx = obterAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const tempoTotalCompasso = (synthConfig.tempoBatida / 1000);
        const acordes = synthConfig.chords || [[220, 261, 329]];
        const notasAcorde = acordes[_stepAcorde % acordes.length];
        const notaBass = synthConfig.bass ? synthConfig.bass[_stepAcorde % synthConfig.bass.length] : (notasAcorde[0] / 2);
        _stepAcorde++;

        // Filtro Analógico
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(synthConfig.filterFreq || 1000, now);
        filter.Q.setValueAtTime(synthConfig.resonance || 1.5, now);
        filter.connect(_masterGain);

        // Pads Polifônicos
        notasAcorde.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = synthConfig.tipo || 'sawtooth';
            const detune = (idx - 1.5) * 6;
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(detune, now);

            const attackTime = tempoTotalCompasso * 0.25;
            const releaseTime = tempoTotalCompasso * 0.95;
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.045, now + attackTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

            osc.connect(gain);
            gain.connect(filter);

            osc.start(now);
            osc.stop(now + releaseTime);
            _activeNodes.push({ osc, gain });
        });

        // Linha de Baixo Sub-Bass
        if (notaBass) {
            const bassOsc = ctx.createOscillator();
            const bassGain = ctx.createGain();

            bassOsc.type = synthConfig.tipo === 'square' ? 'square' : 'triangle';
            bassOsc.frequency.setValueAtTime(notaBass, now);

            bassGain.gain.setValueAtTime(0.0001, now);
            bassGain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
            bassGain.gain.exponentialRampToValueAtTime(0.0001, now + tempoTotalCompasso * 0.85);

            bassOsc.connect(bassGain);
            bassGain.connect(_masterGain);

            bassOsc.start(now);
            bassOsc.stop(now + tempoTotalCompasso * 0.9);
            _activeNodes.push({ osc: bassOsc, gain: bassGain });
        }

        // Melodia de Arpeggio
        if (synthConfig.arp && synthConfig.arp.length > 0) {
            const arpNotas = synthConfig.arp;
            const intervaloArp = (tempoTotalCompasso * 1000) / arpNotas.length;
            let subPasso = 0;

            const tArp = setInterval(() => {
                if (!_estado.tocando || !_estado.modoProceduralAtivo || subPasso >= arpNotas.length) {
                    clearInterval(tArp);
                    return;
                }
                const nTime = ctx.currentTime;
                const freqNota = arpNotas[subPasso % arpNotas.length];
                subPasso++;

                const aOsc = ctx.createOscillator();
                const aGain = ctx.createGain();

                aOsc.type = synthConfig.tipo === 'sawtooth' ? 'sawtooth' : 'square';
                aOsc.frequency.setValueAtTime(freqNota, nTime);

                const durNota = (intervaloArp / 1000) * 0.8;
                aGain.gain.setValueAtTime(0.0001, nTime);
                aGain.gain.exponentialRampToValueAtTime(0.025, nTime + 0.02);
                aGain.gain.exponentialRampToValueAtTime(0.0001, nTime + durNota);

                aOsc.connect(aGain);
                aGain.connect(filter);

                aOsc.start(nTime);
                aOsc.stop(nTime + durNota);
                _activeNodes.push({ osc: aOsc, gain: aGain });
            }, intervaloArp);
        }

        _synthTimeout = setTimeout(() => {
            if (_estado.tocando && _estado.modoProceduralAtivo) {
                dispararCompassoFaixa(synthConfig);
            }
        }, synthConfig.tempoBatida);
    }

    function ativarFallbackProcedural() {
        _estado.modoProceduralAtivo = true;
        pararMotorSonoro();
        _stepAcorde = 0;

        const estacao = ESTACOES[_estado.estacaoIndex];
        const faixa = estacao.faixas[_estado.faixaIndex] || estacao.faixas[0];
        if (faixa.synth) {
            obterAudioContext();
            dispararCompassoFaixa(faixa.synth);
        }
        animarEqualizador(true);
    }

    /* ═════════════════════════════════════════════════════════════════
       5. REPRODUÇÃO DA FAIXA ATUAL (LOCAL OU REMOTA COM FALLBACK)
       ═════════════════════════════════════════════════════════════════ */
    function iniciarReproducaoFaixaAtual() {
        pararMotorSonoro();
        _estado.modoProceduralAtivo = false;

        const estacao = ESTACOES[_estado.estacaoIndex];
        const faixa = estacao.faixas[_estado.faixaIndex] || estacao.faixas[0];
        const audio = obterAudioElemento();

        // Determina a fonte de áudio: tenta arquivo local primeiro se estiver em ambiente http/https ou caminho relativo
        // Se a faixa tiver URL remota direta, usa a URL remota (ou local)
        const fonteAudio = faixa.arquivoLocal || faixa.urlRemota;

        if (audio && fonteAudio) {
            aplicarVolumeInstantaneo();
            
            // Se já for a mesma música tocando, apenas garante play
            if (audio.src !== fonteAudio && !audio.src.endsWith(encodeURI(faixa.arquivoLocal))) {
                audio.src = fonteAudio;
                audio.load();
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    _estado.modoProceduralAtivo = false;
                    animarEqualizador(true);
                }).catch(err => {
                    console.log('📻 [Overcritic Radio] Auto-play ou carregamento direto requer fallback ou interação:', err.message);
                    // Tenta a URL remota se o arquivo local tiver falhado
                    if (audio.src.includes(faixa.arquivoLocal) && faixa.urlRemota) {
                        audio.src = faixa.urlRemota;
                        audio.load();
                        audio.play().catch(() => ativarFallbackProcedural());
                    } else {
                        ativarFallbackProcedural();
                    }
                });
            }
        } else {
            ativarFallbackProcedural();
        }
    }

    function animarEqualizador(ativo) {
        const widget = document.getElementById('ogRadioWidget');
        if (widget) {
            widget.classList.toggle('is-playing', ativo);
        }
    }

    /* ═════════════════════════════════════════════════════════════════
       6. CONTROLE MALEÁVEL DE VOLUME (ARRASte CONTÍNUO ELÁSTICO)
       ═════════════════════════════════════════════════════════════════ */
    function aplicarVolumeInstantaneo() {
        const volEfetivo = _estado.mudo ? 0 : _estado.volume;

        // 1. Aplica no elemento HTML5 <audio>
        if (_audioEl) {
            _audioEl.volume = Math.max(0, Math.min(1, volEfetivo));
        }

        // 2. Aplica no sintetizador Web Audio se ativo
        if (_masterGain && _audioCtx) {
            const now = _audioCtx.currentTime;
            _masterGain.gain.setTargetAtTime(volEfetivo * 0.45, now, 0.02);
        }

        atualizarSliderVisual(_estado.volume, _estado.mudo);
    }

    function atualizarSliderVisual(vol, mudo) {
        const slider = document.getElementById('ogRadioVolSlider');
        const volBtn = document.getElementById('ogRadioVolBtn');
        const volPercent = Math.round(vol * 100);

        if (slider) {
            slider.value = vol;
            const corAtiva = '#00f0ff';
            const corFundo = document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.18)';
            slider.style.background = `linear-gradient(to right, ${corAtiva} 0%, ${corAtiva} ${volPercent}%, ${corFundo} ${volPercent}%, ${corFundo} 100%)`;
        }

        if (volBtn) {
            volBtn.textContent = (mudo || vol === 0) ? '🔇' : (vol < 0.4 ? '🔉' : '🔊');
            volBtn.title = mudo ? 'Desmutar rádio' : 'Mutar rádio';
        }
    }

    function definirVolumeMaleavel(novoVol) {
        const v = parseFloat(novoVol);
        if (isNaN(v)) return;
        _estado.volume = Math.max(0, Math.min(1, v));
        _estado.mudo = false;
        aplicarVolumeInstantaneo();
    }

    function alternarMudo() {
        _estado.mudo = !_estado.mudo;
        aplicarVolumeInstantaneo();
        salvarEstado();
    }

    /* ═════════════════════════════════════════════════════════════════
       7. COMANDOS DO TOCADOR (PLAY, PAUSE, PRÓXIMA / ANTERIOR)
       ═════════════════════════════════════════════════════════════════ */
    function play() {
        _estado.tocando = true;
        iniciarReproducaoFaixaAtual();
        atualizarVisual();
    }

    function pause() {
        _estado.tocando = false;
        if (_audioEl) {
            _audioEl.pause();
        }
        pararMotorSonoro();
        animarEqualizador(false);
        atualizarVisual();
    }

    function togglePlay() {
        if (_estado.tocando) {
            pause();
        } else {
            play();
        }
    }

    function selecionarEstacao(index) {
        if (index < 0 || index >= ESTACOES.length) return;
        _estado.estacaoIndex = index;
        _estado.faixaIndex = 0;
        salvarEstado();

        if (_estado.tocando) {
            iniciarReproducaoFaixaAtual();
        }
        atualizarVisual();
    }

    function proximaFaixa() {
        const estacao = ESTACOES[_estado.estacaoIndex];
        _estado.faixaIndex = (_estado.faixaIndex + 1) % estacao.faixas.length;
        salvarEstado();

        if (_estado.tocando) {
            iniciarReproducaoFaixaAtual();
        }
        atualizarVisual();
    }

    function faixaAnterior() {
        const estacao = ESTACOES[_estado.estacaoIndex];
        _estado.faixaIndex = (_estado.faixaIndex - 1 + estacao.faixas.length) % estacao.faixas.length;
        salvarEstado();

        if (_estado.tocando) {
            iniciarReproducaoFaixaAtual();
        }
        atualizarVisual();
    }

    function alternarMinimizado() {
        _estado.minimizado = !_estado.minimizado;
        salvarEstado();
        atualizarVisual();
    }

    /* ═════════════════════════════════════════════════════════════════
       8. CONSTRUÇÃO E ATUALIZAÇÃO DA INTERFACE (DOM)
       ═════════════════════════════════════════════════════════════════ */
    function montarDOM() {
        injetarEstilosRadio();

        let widget = document.getElementById('ogRadioWidget');
        if (widget) return widget;

        widget = document.createElement('div');
        widget.id = 'ogRadioWidget';
        widget.className = 'og-radio-widget';
        document.body.appendChild(widget);

        return widget;
    }

    function atualizarVisual() {
        const widget = montarDOM();
        if (!widget) return;

        const estacao = ESTACOES[_estado.estacaoIndex];
        const faixa = estacao.faixas[_estado.faixaIndex] || estacao.faixas[0];

        widget.classList.toggle('is-playing', _estado.tocando);
        widget.classList.toggle('og-radio-minimized', _estado.minimizado);

        if (_estado.minimizado) {
            // Pílula compacta (no mobile vira só o ícone circular via CSS)
            widget.innerHTML = `
                <div class="og-radio-pill" onclick="window.OvercriticRadio.toggleMinimizar()" title="Abrir Overcritic Radio">
                    <span class="og-radio-pill-icon">📻</span>
                    <div class="og-radio-pill-text">
                        <span class="og-radio-pill-title">${estacao.badge}</span>
                        <span class="og-radio-pill-sub">${_estado.tocando ? faixa.titulo : 'Pausado • Clique para ouvir'}</span>
                    </div>
                    <button type="button" class="og-radio-pill-action" onclick="event.stopPropagation(); window.OvercriticRadio.togglePlay();" title="${_estado.tocando ? 'Pausar' : 'Tocar'}">
                        ${_estado.tocando ? '⏸' : '▶'}
                    </button>
                </div>
            `;
            // Habilita arraste no mobile quando minimizado
            configurarDragMobile(widget);
        } else {
            // Player expandido: limpa estilos manuais de arrasto no mobile para centralizar com perfeição
            if (window.innerWidth <= 768) {
                widget.style.left = '';
                widget.style.top = '';
                widget.style.right = '';
                widget.style.bottom = '';
            }
            const tabsHtml = ESTACOES.map((est, idx) => `
                <button type="button" class="og-radio-tab ${idx === _estado.estacaoIndex ? 'active' : ''}" onclick="window.OvercriticRadio.selecionarEstacao(${idx})">
                    ${est.badge.split(' ')[0]} ${est.nome.split(' ')[0]}
                </button>
            `).join('');

            const volIcon = _estado.mudo || _estado.volume === 0 ? '🔇' : (_estado.volume < 0.4 ? '🔉' : '🔊');

            widget.innerHTML = `
                <div class="og-radio-panel" onclick="event.stopPropagation();">
                    <div class="og-radio-header">
                        <div class="og-radio-brand">
                            <span>📻</span> OVERCRITIC RADIO
                            <span style="font-size: 0.65rem; background: rgba(0, 240, 255, 0.15); border: 1px solid rgba(0, 240, 255, 0.3); padding: 2px 6px; border-radius: 4px;">${estacao.frequencia}</span>
                        </div>
                        <button type="button" class="og-radio-min-btn" onclick="window.OvercriticRadio.toggleMinimizar()" title="Minimizar tocador">─</button>
                    </div>

                    <div class="og-radio-tabs">
                        ${tabsHtml}
                    </div>

                    <div class="og-radio-track-box">
                        <div class="og-radio-track-title">${faixa.titulo}</div>
                        <div class="og-radio-track-artist">✨ ${faixa.artista} • ${faixa.estilo || estacao.badge}</div>
                        
                        <div class="og-radio-eq-bars" title="${_estado.tocando ? 'Sintonizado em alta fidelidade' : 'Pausado'}">
                            <div class="og-radio-bar"></div>
                            <div class="og-radio-bar"></div>
                            <div class="og-radio-bar"></div>
                            <div class="og-radio-bar"></div>
                            <div class="og-radio-bar"></div>
                        </div>
                    </div>

                    <div class="og-radio-controls">
                        <button type="button" class="og-radio-btn-ctrl" onclick="window.OvercriticRadio.faixaAnterior()" title="Faixa Anterior">⏮</button>
                        <button type="button" class="og-radio-btn-play" onclick="window.OvercriticRadio.togglePlay()" title="${_estado.tocando ? 'Pausar rádio' : 'Iniciar rádio'}">
                            ${_estado.tocando ? '⏸' : '▶'}
                        </button>
                        <button type="button" class="og-radio-btn-ctrl" onclick="window.OvercriticRadio.proximaFaixa()" title="Próxima Faixa">⏭</button>
                    </div>

                    <div class="og-radio-vol-strip">
                        <button type="button" class="og-radio-vol-btn" id="ogRadioVolBtn" onclick="window.OvercriticRadio.toggleMudo()" title="Mutar / Desmutar">${volIcon}</button>
                        <input type="range" id="ogRadioVolSlider" min="0" max="1" step="0.005" value="${_estado.volume}" class="og-radio-slider" title="Volume da rádio">
                    </div>
                </div>
            `;

            // Vinculação nativa dos eventos de volume maleável sem re-renderizar o widget
            const sliderEl = document.getElementById('ogRadioVolSlider');
            if (sliderEl) {
                sliderEl.addEventListener('input', (e) => {
                    definirVolumeMaleavel(e.target.value);
                });
                sliderEl.addEventListener('change', () => {
                    salvarEstado();
                });
            }
            atualizarSliderVisual(_estado.volume, _estado.mudo);
        }
    }

        /* ═════════════════════════════════════════════════════════════════
       9. ARRASTE MÓVEL ULTRA-FLUIDO DO WIDGET NO CELULAR (DRAG TO MOVE)
       ═════════════════════════════════════════════════════════════════ */
    let _dragState = {
        ativo: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        moved: false,
        rafId: null
    };

    function configurarDragMobile(widget) {
        if (window.innerWidth > 768) return;

        const pill = widget.querySelector('.og-radio-pill');
        if (!pill) return;

        pill.style.touchAction = 'none';
        widget.style.touchAction = 'none';

        function onTouchStart(e) {
            if (!_estado.minimizado) return;
            const touch = e.touches[0];
            const rect = widget.getBoundingClientRect();

            _dragState.ativo = true;
            _dragState.moved = false;
            _dragState.startX = touch.clientX;
            _dragState.startY = touch.clientY;
            _dragState.offsetX = touch.clientX - rect.left;
            _dragState.offsetY = touch.clientY - rect.top;

            widget.classList.add('og-radio-dragging');
        }

        function onTouchMove(e) {
            if (!_dragState.ativo || !_estado.minimizado) return;

            // BLOQUEIA TOTALMENTE O SCROLL DA PÁGINA DO FUNDO!
            e.preventDefault();
            e.stopPropagation();

            const touch = e.touches[0];
            const dx = touch.clientX - _dragState.startX;
            const dy = touch.clientY - _dragState.startY;

            if (Math.hypot(dx, dy) > 5) {
                _dragState.moved = true;
            }

            const wWidth = window.innerWidth;
            const wHeight = window.innerHeight;
            const size = 48; // Diâmetro do botão 48px

            let targetLeft = touch.clientX - _dragState.offsetX;
            let targetTop = touch.clientY - _dragState.offsetY;

            // Limites visíveis da viewport (8px de margem)
            targetLeft = Math.max(8, Math.min(wWidth - size - 8, targetLeft));
            targetTop = Math.max(8, Math.min(wHeight - size - 8, targetTop));

            if (_dragState.rafId) cancelAnimationFrame(_dragState.rafId);
            _dragState.rafId = requestAnimationFrame(() => {
                widget.style.left = targetLeft + 'px';
                widget.style.top = targetTop + 'px';
                widget.style.right = 'auto';
                widget.style.bottom = 'auto';
            });
        }

        function onTouchEnd(e) {
            if (!_dragState.ativo) return;
            widget.classList.remove('og-radio-dragging');

            if (_dragState.moved) {
                e.preventDefault();
                e.stopPropagation();

                // Persiste posição no LocalStorage
                try {
                    localStorage.setItem('og_radio_pos_v4', JSON.stringify({
                        left: widget.style.left,
                        top: widget.style.top
                    }));
                } catch(err) {}
            }

            _dragState.ativo = false;
        }

        pill.addEventListener('touchstart', onTouchStart, { passive: true });
        // PASSIVE: FALSE É OBRIGATÓRIO PARA e.preventDefault() BLOQUEAR O SCROLL DA PÁGINA
        pill.addEventListener('touchmove', onTouchMove, { passive: false });
        pill.addEventListener('touchend', onTouchEnd, { passive: false });
        pill.addEventListener('touchcancel', onTouchEnd, { passive: false });

        pill.removeAttribute('onclick');
        pill.addEventListener('click', function(e) {
            if (!_dragState.moved) {
                window.OvercriticRadio.toggleMinimizar();
            }
            _dragState.moved = false;
        });

        // Restaura posição salva no mobile se estiver minimizado
        if (_estado.minimizado) {
            try {
                const posicaoSalva = localStorage.getItem('og_radio_pos_v4');
                if (posicaoSalva) {
                    const pos = JSON.parse(posicaoSalva);
                    if (pos.left && pos.top) {
                        widget.style.left = pos.left;
                        widget.style.top = pos.top;
                        widget.style.right = 'auto';
                        widget.style.bottom = 'auto';
                    }
                }
            } catch(err) {}
        }
    }

    // Inicialização quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            obterAudioElemento();
            atualizarVisual();
        });
    } else {
        obterAudioElemento();
        atualizarVisual();
    }

    // Exportação da API Pública Global
    window.OvercriticRadio = {
        play: play,
        pause: pause,
        togglePlay: togglePlay,
        selecionarEstacao: selecionarEstacao,
        proximaFaixa: proximaFaixa,
        faixaAnterior: faixaAnterior,
        toggleMudo: alternarMudo,
        setVolume: definirVolumeMaleavel,
        toggleMinimizar: alternarMinimizado,
        isTocando: () => _estado.tocando,
        getFaixaAtual: () => {
            const est = ESTACOES[_estado.estacaoIndex];
            return est ? (est.faixas[_estado.faixaIndex] || est.faixas[0]) : null;
        }
    };

    console.log('📻 [Overcritic] Lo-Fi & Synthwave Radio 88.4 FM (Opção 1) pronta com suporte a MP3 de estúdio e controle maleável!');

})(window);
