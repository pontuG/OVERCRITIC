// js/gamerProfile.js - Modal Universal de Perfil Público e Catálogo do Jogador (OVERCRITIC)
(function () {
    // Injeta os estilos CSS necessários para o Modal Gamer
    const styleId = 'gamer-profile-modal-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .gamer-profile-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 7, 14, 0.85);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 100000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: 24px 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
                box-sizing: border-box;
                overflow-y: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
            }
            .gamer-profile-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .gamer-profile-card {
                width: 100%;
                max-width: 820px;
                max-height: 90vh;
                margin: auto;
                background: linear-gradient(145deg, rgba(13, 18, 30, 0.98), rgba(9, 12, 22, 0.98));
                border: 1px solid rgba(0, 240, 255, 0.3);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.2);
                border-radius: 24px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.92) translateY(20px);
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .gamer-profile-overlay.active .gamer-profile-card {
                transform: scale(1) translateY(0);
            }
            body.light-mode .gamer-profile-card {
                background: #f1f4f9;
                border-color: rgba(197, 27, 41, 0.3);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2), 0 0 30px rgba(197, 27, 41, 0.15);
            }
            .gp-header {
                padding: 24px 30px 18px 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                position: relative;
                background: radial-gradient(circle at 10% 50%, rgba(0, 240, 255, 0.1), transparent 50%);
                flex-shrink: 0;
            }
            body.light-mode .gp-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
                background: radial-gradient(circle at 10% 50%, rgba(197, 27, 41, 0.08), transparent 50%);
            }
            .gp-user-info {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .gp-avatar {
                width: 68px;
                height: 68px;
                border-radius: 18px;
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(157, 78, 221, 0.4));
                border: 2px solid var(--accent-cyan, #00f0ff);
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                font-weight: 800;
                color: #fff;
                flex-shrink: 0;
                overflow: hidden;
            }
            .gp-names {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .gp-username {
                font-size: 1.5rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                letter-spacing: -0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .gp-badge-admin {
                background: linear-gradient(135deg, #ffd700, #ff8c00);
                color: #07090f;
                font-size: 0.72rem;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 8px;
                box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
                letter-spacing: 0.5px;
            }
            .gp-badge-player {
                background: rgba(0, 240, 255, 0.12);
                border: 1px solid rgba(0, 240, 255, 0.3);
                color: var(--accent-cyan, #00f0ff);
                font-size: 0.72rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 6px;
            }
            .gp-close-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: var(--text-muted, #adb5bd);
                width: 40px;
                height: 40px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.25s ease;
            }
            .gp-close-btn:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: #ef4444;
                color: #fff;
                transform: scale(1.08);
            }
            /* Stats Bar */
            .gp-stats-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                gap: 14px;
                padding: 18px 30px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                flex-shrink: 0;
            }
            body.light-mode .gp-stats-row {
                background: rgba(0, 0, 0, 0.03);
                border-bottom-color: rgba(0, 0, 0, 0.05);
            }
            .gp-stat-item {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 14px;
                padding: 12px;
                text-align: center;
                transition: transform 0.2s ease;
            }
            .gp-stat-item:hover {
                transform: translateY(-2px);
                border-color: rgba(0, 240, 255, 0.3);
            }
            .gp-stat-val {
                font-size: 1.4rem;
                font-weight: 800;
                color: var(--accent-cyan, #00f0ff);
                line-height: 1.2;
            }
            #gpStatJogos { color: #00f0ff; text-shadow: 0 0 12px rgba(0, 240, 255, 0.4); }
            #gpStatMedia { color: #ffd166; text-shadow: 0 0 12px rgba(255, 209, 102, 0.4); }
            #gpStatPlatinas { color: #ffd700; text-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
            #gpStatMidias { color: #c77dff; text-shadow: 0 0 12px rgba(199, 125, 255, 0.4); }
            #gpStatHoras { color: #06d6a0; text-shadow: 0 0 12px rgba(6, 214, 160, 0.4); }
            .gp-stat-lbl {
                font-size: 0.72rem;
                color: var(--text-muted, #adb5bd);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 4px;
            }
            /* Tabs */
            .gp-tabs {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 0 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                overflow-x: auto;
                overflow-y: hidden;
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 240, 255, 0.15) transparent;
                flex-shrink: 0;
                height: 50px;
                min-height: 50px;
                background: rgba(8, 12, 22, 0.85);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-sizing: border-box;
                z-index: 5;
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
            }
            .gp-tabs::-webkit-scrollbar {
                height: 3px;
            }
            .gp-tabs::-webkit-scrollbar-thumb {
                background: rgba(0, 240, 255, 0.25);
                border-radius: 4px;
            }
            .gp-tab-btn {
                background: transparent;
                border: none;
                padding: 0 11px;
                height: 50px;
                font-size: 0.83rem;
                font-weight: 700;
                color: var(--text-muted, #adb5bd);
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.2s ease;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
                box-sizing: border-box;
                user-select: none;
            }
            .gp-tab-btn:hover {
                color: #fff;
            }
            .gp-tab-btn.active {
                color: var(--accent-cyan, #00f0ff);
                border-bottom-color: var(--accent-cyan, #00f0ff);
                text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
            }
            .gp-tab-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.08);
                padding: 1px 7px;
                border-radius: 10px;
                font-size: 0.72rem;
                font-weight: 800;
                line-height: 1.2;
                color: var(--text-muted, #adb5bd);
                transition: all 0.2s ease;
            }
            .gp-tab-btn:hover .gp-tab-badge {
                background: rgba(255, 255, 255, 0.16);
                color: #fff;
            }
            .gp-tab-btn.active .gp-tab-badge {
                background: rgba(0, 240, 255, 0.18);
                color: #00f0ff;
                border: 1px solid rgba(0, 240, 255, 0.35);
                box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
            }
            /* Content Area */
            .gp-content {
                padding: 24px 30px;
                overflow-y: auto;
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
                gap: 14px;
            }
            .gp-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 16px;
            }
            .gp-item-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: transform 0.25s ease, border-color 0.25s ease;
            }
            .gp-item-card:hover {
                transform: translateY(-4px);
                border-color: rgba(0, 240, 255, 0.4);
            }
            .gp-item-cover {
                width: 100%;
                height: 115px;
                object-fit: cover;
                background: #000;
            }
            .gp-item-body {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                flex: 1;
            }
            .gp-item-title {
                font-size: 0.95rem;
                font-weight: 700;
                color: var(--text-main, #f8f9fa);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .gp-item-meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.78rem;
                color: var(--text-muted, #adb5bd);
            }
            .gp-empty-state {
                text-align: center;
                padding: 50px 20px;
                color: var(--text-muted, #adb5bd);
            }
            .gp-skeleton {
                background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
                background-size: 200% 100%;
                animation: gpShimmer 1.5s infinite;
                border-radius: 12px;
                height: 120px;
            }
            @keyframes gpShimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Barra de Ações Rápidas no Cabeçalho */
            .og-profile-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-top: 10px;
            }
            .og-profile-actions .og-btn-action {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                padding: 7px 14px;
                border-radius: 9px;
                font-size: 0.78rem;
                font-weight: 800;
                cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.25s ease;
                background: rgba(255, 255, 255, 0.05);
                color: #f8f9fa;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
                font-family: inherit;
                user-select: none;
            }
            .og-profile-actions .og-btn-action:hover {
                transform: translateY(-2px);
            }
            .og-profile-actions .og-btn-card {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(157, 78, 221, 0.22));
                border-color: rgba(0, 240, 255, 0.45);
                color: #00f0ff;
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
            }
            .og-profile-actions .og-btn-card:hover {
                background: linear-gradient(135deg, #00f0ff, #9d4edd);
                color: #05070d;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
            }
            .og-profile-actions .og-btn-tier {
                background: linear-gradient(135deg, rgba(255, 183, 3, 0.15), rgba(255, 107, 107, 0.2));
                border-color: rgba(255, 183, 3, 0.45);
                color: #ffc837;
                box-shadow: 0 0 12px rgba(255, 183, 3, 0.2);
            }
            .og-profile-actions .og-btn-tier:hover {
                background: linear-gradient(135deg, #ffb703, #ff5e7e);
                color: #05070d;
                box-shadow: 0 0 20px rgba(255, 183, 3, 0.5);
            }
            .og-profile-actions .og-btn-oracle {
                background: linear-gradient(135deg, rgba(157, 78, 221, 0.16), rgba(255, 0, 127, 0.16));
                border-color: rgba(255, 0, 127, 0.45);
                color: #ff70a6;
                box-shadow: 0 0 12px rgba(255, 0, 127, 0.2);
            }
            .og-profile-actions .og-btn-oracle:hover {
                background: linear-gradient(135deg, #ff007f, #9d4edd);
                color: #ffffff;
                box-shadow: 0 0 20px rgba(255, 0, 127, 0.5);
            }

            /* ════ ABAS E COMPONENTES MODERNOS DE BACKLOG / FILA DE JOGOS ════ */
            .og-chart-container-card {
                background: linear-gradient(135deg, rgba(16, 23, 40, 0.75), rgba(10, 14, 26, 0.85));
                border: 1px solid rgba(0, 240, 255, 0.2);
                border-radius: 18px;
                padding: 18px 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                flex-shrink: 0;
            }
            body.light-mode .og-chart-container-card {
                background: #ffffff;
                border-color: rgba(0, 0, 0, 0.1);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            }
            .og-chart-top-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 14px;
            }
            .og-chart-title {
                font-size: 0.92rem;
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
                grid-template-columns: 220px 1fr;
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
            .og-chart-legend {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                gap: 10px;
            }
            .og-legend-pill {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
            }
            .og-legend-pill:hover,
            .og-legend-pill.active {
                transform: translateY(-2px);
                border-color: currentColor;
                background: rgba(255, 255, 255, 0.06);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
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
            .og-backlog-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
                padding: 4px 0;
                flex-shrink: 0;
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
                padding: 7px 14px;
                font-size: 0.76rem;
                font-weight: 700;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .og-b-filter-btn:hover {
                border-color: rgba(0, 240, 255, 0.4);
                color: var(--text-main, #f8f9fa);
                background: rgba(255, 255, 255, 0.08);
            }
            .og-b-filter-btn.active {
                background: rgba(0, 240, 255, 0.15);
                border-color: var(--accent-cyan, #00f0ff);
                color: var(--accent-cyan, #00f0ff);
                box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
                font-weight: 800;
            }
            .og-btn-add-game {
                background: linear-gradient(135deg, #00f0ff, #0077b6);
                color: #040814;
                border: none;
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 800;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
            }
            .og-btn-add-game:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 240, 255, 0.5);
            }
            .og-backlog-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 16px;
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
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.15);
            }
            .og-backlog-cover-wrap {
                height: 115px;
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
            }
            .og-chip-action:hover, .og-chip-action.current {
                background: rgba(0, 240, 255, 0.2);
                border-color: var(--accent-cyan, #00f0ff);
                color: #00f0ff;
            }
        `;
        document.head.appendChild(style);
    }

    // Cria a estrutura HTML do modal se ainda não existir
    function garantirEstruturaModal() {
        if (document.getElementById('gamerProfileOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'gamerProfileOverlay';
        overlay.className = 'gamer-profile-overlay';
        overlay.innerHTML = `
            <div class="gamer-profile-card">
                <div class="gp-header" style="flex-wrap: wrap; gap: 16px;">
                    <div class="gp-user-info" style="flex: 1; min-width: 260px;">
                        <div class="gp-avatar" id="gpAvatar">🎮</div>
                        <div class="gp-names" style="flex: 1;">
                            <div class="gp-username">
                                <span id="gpUsername">Jogador</span>
                                <span id="gpAdminBadge" class="gp-badge-admin" style="display:none;">👑 ADMIN & FUNDADOR</span>
                                <span class="gp-badge-player" id="gpPlayerStatus">Membro Ativo</span>
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-muted, #adb5bd);" id="gpEmailRow">
                                Perfil Oficial da Comunidade Overcritic
                            </div>
                            <!-- Barra de XP e Nível Gamer -->
                            <div class="og-xp-bar-wrap" id="gpXpBarWrap">
                                <div class="og-xp-header">
                                    <span id="gpLevelBadge" class="og-level-badge">🌱 Nv. 1 Recruta Gamer</span>
                                    <span id="gpXpText">0 XP</span>
                                </div>
                                <div class="og-xp-track">
                                    <div class="og-xp-fill" id="gpXpFill" style="width: 0%;"></div>
                                </div>
                            </div>
                            <!-- Ações Gamificadas -->
                            <div class="og-profile-actions">
                                <button type="button" class="og-btn-action og-btn-card" id="gpBtnGamerCard" title="Gerar e compartilhar seu Gamer Card Holográfico 3D">
                                    <span>🎴</span> Gamer Card 3D
                                </button>
                                <button type="button" class="og-btn-action og-btn-tier" id="gpBtnTierList" title="Criar sua Tier List personalizada com seus jogos e filmes">
                                    <span>🎯</span> Minha Tier List
                                </button>
                                <button type="button" class="og-btn-action og-btn-oracle" id="gpBtnOracle" title="Oráculo Gamer • Roleta O que eu jogo hoje?">
                                    <span>🔮</span> Oráculo Gamer
                                </button>
                            </div>
                        </div>
                    </div>
                    <button class="gp-close-btn" id="gpCloseBtn" title="Fechar perfil (Esc)">✕</button>
                </div>

                <div class="gp-stats-row">
                    <div class="gp-stat-item">
                        <div class="gp-stat-val" id="gpStatJogos">0</div>
                        <div class="gp-stat-lbl">🎮 Jogos Avaliados</div>
                    </div>
                    <div class="gp-stat-item">
                        <div class="gp-stat-val" id="gpStatMedia">0.0</div>
                        <div class="gp-stat-lbl">⭐ Média de Notas</div>
                    </div>
                    <div class="gp-stat-item">
                        <div class="gp-stat-val" id="gpStatPlatinas">0</div>
                        <div class="gp-stat-lbl">🏆 Platinas (100%)</div>
                    </div>
                    <div class="gp-stat-item">
                        <div class="gp-stat-val" id="gpStatMidias">0</div>
                        <div class="gp-stat-lbl">🎬 Filmes & Séries</div>
                    </div>
                    <div class="gp-stat-item">
                        <div class="gp-stat-val" id="gpStatHoras">0h</div>
                        <div class="gp-stat-lbl">⏱️ Horas Registradas</div>
                    </div>
                </div>

                <div class="gp-tabs">
                    <button class="gp-tab-btn active" data-tab="jogos" id="gpTabBtnJogos"><span>🎮 Jogos</span> <span class="gp-tab-badge" id="gpCountTabJogos">0</span></button>
                    <button class="gp-tab-btn" data-tab="backlog" id="gpTabBtnBacklog"><span>⏳ Fila de Jogos</span> <span class="gp-tab-badge" id="gpCountTabBacklog">0</span></button>
                    <button class="gp-tab-btn" data-tab="platinas" id="gpTabBtnPlatinas"><span>🏆 Platinas</span> <span class="gp-tab-badge" id="gpCountTabPlatinas">0</span></button>
                    <button class="gp-tab-btn" data-tab="midias" id="gpTabBtnMidias"><span>🎬 Cinema & Séries</span> <span class="gp-tab-badge" id="gpCountTabMidias">0</span></button>
                    <button class="gp-tab-btn" data-tab="insignias" id="gpTabBtnInsignias"><span>🎖️ Insígnias</span> <span class="gp-tab-badge" id="gpCountTabInsignias">0</span></button>
                </div>

                <div class="gp-content" id="gpContentArea">
                    <div class="gp-skeleton"></div>
                    <div class="gp-skeleton"></div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Listeners de fechamento
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fecharPerfilGamerModal();
        });
        document.getElementById('gpCloseBtn').addEventListener('click', fecharPerfilGamerModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                fecharPerfilGamerModal();
            }
        });

        // Alternância de abas dentro do modal
        const tabBtns = overlay.querySelectorAll('.gp-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (typeof btn.scrollIntoView === 'function') {
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
                renderizarAbaAtual(btn.dataset.tab);
            });
        });
    }

    let _dadosUsuarioAtual = {
        username: '',
        userId: '',
        jogos: [],
        platinas: [],
        midias: [],
        abaAtiva: 'jogos'
    };

    function fecharPerfilGamerModal() {
        const overlay = document.getElementById('gamerProfileOverlay');
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

    function renderizarAbaAtual(aba) {
        _dadosUsuarioAtual.abaAtiva = aba;
        const container = document.getElementById('gpContentArea');
        if (!container) return;

        if (aba === 'jogos') {
            const list = _dadosUsuarioAtual.jogos;
            if (!list.length) {
                container.innerHTML = `<div class="gp-empty-state">🎮 Nenhum jogo cadastrado por este jogador ainda.</div>`;
                return;
            }
            container.innerHTML = `<div class="gp-grid">` + list.map(j => `
                <div class="gp-item-card">
                    <img class="gp-item-cover" src="${j.capaUrl || j.capa || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'}" alt="${j.titulo}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'">
                    <div class="gp-item-body">
                        <div class="gp-item-title" title="${j.titulo}">${j.titulo}</div>
                        <div class="gp-item-meta">
                            <span>🎮 ${j.plataforma || 'PC'}</span>
                            <span style="color:#00f0ff; font-weight:bold;">⭐ ${j.minhaNota || j.nota || '10'}/10</span>
                        </div>
                        <div class="gp-item-meta">
                            <span>📌 ${j.status || 'Concluído'}</span>
                            <span>❤️ ${(j.likes || []).length}</span>
                        </div>
                    </div>
                </div>
            `).join('') + `</div>`;
        } else if (aba === 'platinas') {
            const list = _dadosUsuarioAtual.platinas;
            if (!list.length) {
                container.innerHTML = `<div class="gp-empty-state">🏆 Nenhuma platina registrada por este jogador ainda.</div>`;
                return;
            }
            container.innerHTML = `<div class="gp-grid">` + list.map(p => {
                const gameTitle = p.title || p.titulo || 'Jogo';
                const resolvedCover = (typeof window !== 'undefined' && typeof window.resolverCapaOficialJogo === 'function')
                    ? window.resolverCapaOficialJogo(gameTitle, p.cover || p.cover_url)
                    : (p.cover && !p.cover.includes('unsplash.com') ? p.cover : (p.cover_url && !p.cover_url.includes('unsplash.com') ? p.cover_url : ''));
                const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="#0d1117"/><text x="50%" y="45%" text-anchor="middle" font-size="40">🏆</text><text x="50%" y="70%" text-anchor="middle" fill="#00f0ff" font-family="sans-serif" font-weight="bold" font-size="16">' + gameTitle.substring(0, 20).replace(/[<>&"']/g, '') + '</text></svg>')}`;
                const finalCover = resolvedCover || fallbackSvg;
                return `
                <div class="gp-item-card">
                    <img class="gp-item-cover" src="${finalCover}" alt="${gameTitle}" onerror="this.onerror=null; this.src='${fallbackSvg}'">
                    <div class="gp-item-body">
                        <div class="gp-item-title" title="${gameTitle}">${gameTitle}</div>
                        <div class="gp-item-meta">
                            <span>🎯 ${p.difficulty || p.dificuldade || 'Moderada'}</span>
                            <span style="color:#ffd700; font-weight:bold;">🏆 ${p.progress || p.nota || '100'}%</span>
                        </div>
                        <div class="gp-item-meta">
                            <span>⏱️ ${p.hours || p.horas || 0}h</span>
                            <span>👏 ${(p.applaudedBy || p.badges || []).length}</span>
                        </div>
                    </div>
                </div>
            `;}).join('') + `</div>`;
        } else if (aba === 'midias') {
            const list = _dadosUsuarioAtual.midias;
            if (!list.length) {
                container.innerHTML = `<div class="gp-empty-state">🎬 Nenhum filme ou série avaliado por este jogador ainda.</div>`;
                return;
            }
            container.innerHTML = `<div class="gp-grid">` + list.map(m => `
                <div class="gp-item-card">
                    <img class="gp-item-cover" src="${m.coverUrl || m.cover_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'}" alt="${m.title || m.titulo}" onerror="this.src='https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'">
                    <div class="gp-item-body">
                        <div class="gp-item-title" title="${m.title || m.titulo}">${m.title || m.titulo}</div>
                        <div class="gp-item-meta">
                            <span>📺 ${m.type || m.tipo || 'Filme'}</span>
                            <span style="color:#c77dff; font-weight:bold;">🍿 ${m.myRating || m.minha_nota || '8'}/10</span>
                        </div>
                        <div class="gp-item-meta">
                            <span>🏷️ ${m.status || 'Assistido'}</span>
                            <span>❤️ ${(m.likes || []).length}</span>
                        </div>
                    </div>
                </div>
            `).join('') + `</div>`;
        } else if (aba === 'backlog') {
            renderizarAbaBacklogPerfil(container, _dadosUsuarioAtual.username);
        } else if (aba === 'insignias') {
            if (window.OvercriticInsignias && typeof window.OvercriticInsignias.renderizarMuralTrofeusHtml === 'function') {
                container.innerHTML = window.OvercriticInsignias.renderizarMuralTrofeusHtml(_dadosUsuarioAtual.username, _dadosUsuarioAtual);
            } else {
                container.innerHTML = `<div class="gp-empty-state">🏆 Carregando Estante de Troféus Virtuais...</div>`;
            }
        }
    }

    let _gpBacklogModo = 'jogos';
    let _gpBacklogFiltro = 'todos';

    function renderizarAbaBacklogPerfil(container, username) {
        if (!window.OvercriticBacklog) {
            container.innerHTML = `<div class="gp-empty-state">⏳ Carregando Organizador de Backlog...</div>`;
            return;
        }

        if (typeof window.OvercriticBacklog.injetarEstilos === 'function') {
            window.OvercriticBacklog.injetarEstilos();
        }

        const sessaoAtual = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim();
        const targetUser = (username || (_dadosUsuarioAtual && _dadosUsuarioAtual.username) || sessaoAtual || 'Jogador').trim();
        const stats = window.OvercriticBacklog.obterEstatisticas(targetUser);
        const lista = window.OvercriticBacklog.obterFila(targetUser);
        const categorias = window.OvercriticBacklog.CATEGORIAS;
        const mapaCat = window.OvercriticBacklog.MAPA_CATEGORIAS;

        // Atualiza imediatamente o contador da aba no cabeçalho
        const elCountBacklog = document.getElementById('gpCountTabBacklog');
        if (elCountBacklog) elCountBacklog.textContent = stats.totalJogos;

        let filtrados = lista;
        if (_gpBacklogFiltro !== 'todos') {
            filtrados = lista.filter(j => j.categoria === _gpBacklogFiltro);
        }

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px;">
                <!-- 📊 GRÁFICO DE PIZZA NO PERFIL GAMER -->
                <div class="og-chart-container-card" style="margin-bottom: 4px;">
                    <div class="og-chart-top-bar">
                        <div class="og-chart-title">
                            <span>📊</span> Distribuição e Horas • Fila de Jogos de <b style="color:var(--accent-cyan, #00f0ff); margin-left:4px;">${targetUser}</b>
                        </div>
                        <div class="og-chart-toggle-group">
                            <button type="button" class="og-chart-toggle-btn ${_gpBacklogModo === 'jogos' ? 'active' : ''}" id="gpProfToggleJogos">🎮 Por Quantidade</button>
                            <button type="button" class="og-chart-toggle-btn ${_gpBacklogModo === 'horas' ? 'active' : ''}" id="gpProfToggleHoras">⏱️ Por Horas</button>
                        </div>
                    </div>

                    <div class="og-chart-grid-layout">
                        <div class="og-canvas-wrap">
                            <canvas class="og-pie-canvas" id="gpProfPieCanvas"></canvas>
                        </div>

                        <div class="og-chart-legend" id="gpProfLegendArea">
                            ${categorias.map(cat => {
                                const cVal = _gpBacklogModo === 'jogos' ? `${stats.contagem[cat.id] || 0} jogos` : `${stats.horas[cat.id] || 0}h`;
                                return `
                                    <div class="og-legend-pill ${_gpBacklogFiltro === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="color:${cat.color};">
                                        <div class="og-legend-left">
                                            <span class="og-legend-dot" style="background:${cat.color}; box-shadow:0 0 8px ${cat.color};"></span>
                                            <span class="og-legend-name">${cat.emoji} ${cat.label}</span>
                                        </div>
                                        <span class="og-legend-val">${cVal}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Barra de Ações & Filtros -->
                <div class="og-backlog-toolbar" style="margin-top:2px;">
                    <div class="og-backlog-filter-pills" id="gpProfBacklogFilters">
                        <button type="button" class="og-b-filter-btn ${_gpBacklogFiltro === 'todos' ? 'active' : ''}" data-filter="todos">Todos (${stats.totalJogos})</button>
                        ${categorias.map(c => `
                            <button type="button" class="og-b-filter-btn ${_gpBacklogFiltro === c.id ? 'active' : ''}" data-filter="${c.id}">${c.emoji} ${c.label} (${stats.contagem[c.id] || 0})</button>
                        `).join('')}
                    </div>

                    <div style="display:flex; gap:8px;">
                        <button type="button" class="og-btn-add-game" onclick="if(window.abrirModalFilaDeJogos) window.abrirModalFilaDeJogos('${targetUser}');" title="Abrir Gerenciador de Backlog Completo">
                            <span>⏳</span> Gerenciar Fila
                        </button>
                        <button type="button" class="og-btn-add-game" onclick="if(window.abrirOraculoGamer) window.abrirOraculoGamer();" style="background:linear-gradient(135deg, #9d4edd, #ff007f); color:#fff;" title="Sortear o que jogar">
                            <span>🔮</span> Oráculo
                        </button>
                    </div>
                </div>

                <!-- Cards dos Jogos da Fila -->
                <div class="og-backlog-grid">
                    ${filtrados.length === 0 ? (
                        stats.totalJogos === 0 ? `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(0, 240, 255, 0.25); border-radius: 18px;">
                                <div style="font-size: 2.4rem; margin-bottom: 8px;">🎮</div>
                                <div style="font-size: 1.05rem; font-weight: 800; color: #f8f9fa; margin-bottom: 6px;">Sua Fila de Jogos está Pronta!</div>
                                <div style="font-size: 0.82rem; color: #adb5bd; max-width: 440px; margin: 0 auto 16px auto; line-height: 1.5;">
                                    Organize os jogos que você está jogando agora, pausados ou que planeja zerar e platinar para acompanhar suas horas e estatísticas!
                                </div>
                                <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                                    <button type="button" class="og-btn-add-game" onclick="if(window.abrirModalFilaDeJogos) window.abrirModalFilaDeJogos('${targetUser}');">
                                        <span>➕</span> Adicionar Primeiro Jogo à Fila
                                    </button>
                                    <button type="button" class="og-btn-add-game" onclick="if(window.abrirOraculoGamer) window.abrirOraculoGamer();" style="background: linear-gradient(135deg, #9d4edd, #ff007f); color: #fff;">
                                        <span>🔮</span> Consultar Oráculo
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted, #adb5bd);">
                                <div style="font-size: 2rem; margin-bottom: 6px;">🔍</div>
                                <div>Nenhum jogo nesta categoria no momento.</div>
                            </div>
                        `
                    ) : filtrados.map(j => {
                        const cat = mapaCat[j.categoria] || mapaCat.backlog;
                        const capa = j.capa || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80';
                        return `
                            <div class="og-backlog-card">
                                <div class="og-backlog-cover-wrap">
                                    <img class="og-backlog-cover" src="${capa}" alt="${j.titulo}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'">
                                    <div class="og-backlog-status-badge" style="background:${cat.glow}; border: 1px solid ${cat.color};">
                                        ${cat.emoji} ${cat.label}
                                    </div>
                                    <div class="og-backlog-hours-badge">
                                        ⏱️ ${j.horas || 0}h
                                    </div>
                                </div>
                                <div class="og-backlog-card-body">
                                    <div class="og-backlog-card-title" title="${j.titulo}">${j.titulo}</div>
                                    <div class="og-backlog-card-meta">
                                        <span>🎮 ${j.plataforma || 'PC'}</span>
                                        <button type="button" onclick="window.OvercriticBacklog.removerJogo('${j.id}'); window.renderizarAbaAtualGamerProfile && window.renderizarAbaAtualGamerProfile('backlog');" style="background:none; border:none; color:#ef4444; font-size:0.75rem; cursor:pointer;" title="Remover da fila">🗑️</button>
                                    </div>
                                    <div class="og-backlog-status-actions">
                                        ${categorias.map(c => `
                                            <button type="button" class="og-chip-action ${c.id === j.categoria ? 'current' : ''}" onclick="window.OvercriticBacklog.alterarStatus('${j.id}', '${c.id}'); window.renderizarAbaAtualGamerProfile && window.renderizarAbaAtualGamerProfile('backlog');" title="Mudar para ${c.label}">
                                                ${c.emoji} ${c.label.split(' ')[0]}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Renderiza o Canvas do Gráfico de Pizza no Perfil
        setTimeout(() => {
            const canvas = document.getElementById('gpProfPieCanvas');
            if (canvas && window.OvercriticBacklog) {
                window.OvercriticBacklog.renderizarGraficoPizza(canvas, stats, _gpBacklogModo);
            }
        }, 30);

        // Toggle Jogos vs Horas
        const btnJ = document.getElementById('gpProfToggleJogos');
        const btnH = document.getElementById('gpProfToggleHoras');
        if (btnJ && btnH) {
            btnJ.onclick = () => {
                _gpBacklogModo = 'jogos';
                renderizarAbaBacklogPerfil(container, targetUser);
            };
            btnH.onclick = () => {
                _gpBacklogModo = 'horas';
                renderizarAbaBacklogPerfil(container, targetUser);
            };
        }

        // Filtros de Categoria
        const fBtns = container.querySelectorAll('.og-b-filter-btn');
        fBtns.forEach(btn => {
            btn.onclick = () => {
                _gpBacklogFiltro = btn.dataset.filter;
                renderizarAbaBacklogPerfil(container, targetUser);
            };
        });

        // Clique na Legenda
        const lPills = container.querySelectorAll('.og-legend-pill');
        lPills.forEach(pill => {
            pill.onclick = () => {
                _gpBacklogFiltro = pill.dataset.cat;
                renderizarAbaBacklogPerfil(container, targetUser);
            };
        });
    }

    async function abrirPerfilGamerModal(targetUsername, targetUserId) {
        if (window.OvercriticBacklog && typeof window.OvercriticBacklog.injetarEstilos === 'function') {
            window.OvercriticBacklog.injetarEstilos();
        }

        garantirEstruturaModal();

        // 1. Identificação infalível do usuário da sessão atual caso targetUsername não seja passado ou seja 'Jogador'
        const sessaoUser = (localStorage.getItem('overcritic_currentUser') || localStorage.getItem('overcritic_user') || '').trim();
        const sessaoEmail = (localStorage.getItem('overcritic_user_email') || '').trim();
        const sessaoUid = (localStorage.getItem('overcritic_user_id') || '').trim();

        let cleanName = (targetUsername || '').trim();
        if (!cleanName || cleanName.toLowerCase() === 'jogador') {
            if (sessaoUser && sessaoUser.toLowerCase() !== 'visitante') {
                cleanName = sessaoUser;
            } else {
                cleanName = 'Jogador';
            }
        }

        const isSelfUser = Boolean(sessaoUser && cleanName.toLowerCase() === sessaoUser.toLowerCase());
        const isPontuG = cleanName.toLowerCase() === 'pontug';
        const finalUserId = (targetUserId || '').trim() || (isSelfUser ? sessaoUid : (isPontuG ? '958a1b5f-4151-42c7-97f2-caf0e59fbb86' : ''));

        const avatarEl = document.getElementById('gpAvatar');
        const usernameEl = document.getElementById('gpUsername');
        const adminBadge = document.getElementById('gpAdminBadge');
        const overlay = document.getElementById('gamerProfileOverlay');

        usernameEl.textContent = cleanName;
        
        let avatarGamer = '🎮';
        if (isSelfUser) {
            avatarGamer = typeof window.getUsuarioAvatarAtual === 'function' 
                ? window.getUsuarioAvatarAtual() 
                : (localStorage.getItem('overcritic_user_avatar') || '🎮');
            avatarEl.style.cursor = 'pointer';
            avatarEl.title = 'Clique para alterar seu avatar gamer';
            avatarEl.onclick = function() {
                if (window.abrirModalSeletorAvatar) window.abrirModalSeletorAvatar();
            };
        } else {
            avatarGamer = cleanName.charAt(0).toUpperCase() || '🎮';
            avatarEl.style.cursor = 'default';
            avatarEl.title = '';
            avatarEl.onclick = null;
        }

        if (typeof window.renderizarAvatarHtml === 'function') {
            avatarEl.innerHTML = window.renderizarAvatarHtml(avatarGamer, cleanName.charAt(0).toUpperCase() || '🎮');
        } else {
            avatarEl.textContent = cleanName.charAt(0).toUpperCase() || '🎮';
        }

        // Verifica se o usuário é Admin
        const isAdmin = (window.isAdminUser && window.isAdminUser({ id: finalUserId, email: sessaoEmail || cleanName }))
            || (isSelfUser && localStorage.getItem('overcritic_is_admin') === 'true')
            || cleanName.toLowerCase().includes('gabriel')
            || cleanName.toLowerCase() === 'admin'
            || cleanName.toLowerCase() === 'pontug'
            || sessaoEmail.toLowerCase().includes('mesquitagabriel255')
            || cleanName.toLowerCase().includes('mesquitagabriel255');

        if (isAdmin) {
            adminBadge.style.display = 'inline-block';
            avatarEl.style.borderColor = '#ffd700';
            avatarEl.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)';
        } else {
            adminBadge.style.display = 'none';
            avatarEl.style.borderColor = 'var(--accent-cyan, #00f0ff)';
            avatarEl.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
        }

        // Abre com skeleton loading
        document.getElementById('gpContentArea').innerHTML = `
            <div class="gp-skeleton"></div>
            <div class="gp-skeleton"></div>
            <div class="gp-skeleton"></div>
        `;
        overlay.classList.add('active');
        if (typeof window.bloquearScrollFundo === 'function') {
            window.bloquearScrollFundo();
        } else {
            document.documentElement.classList.add('og-modal-scroll-lock');
            document.body.classList.add('og-modal-scroll-lock');
        }

        // Busca dados sincronizados
        let jogos = [];
        let platinas = [];
        let midias = [];

        // 1. Supabase (Online)
        if (window.sbClient) {
            try {
                // Jogos
                const qJogos = window.sbClient.from('reviews_jogos').select('*');
                if (finalUserId) {
                    qJogos.or(`user_id.eq.${finalUserId},autor.ilike.%${cleanName}%`);
                } else {
                    qJogos.ilike('autor', `%${cleanName}%`);
                }
                const resJ = await qJogos;
                if (resJ.data) jogos = resJ.data;

                // Platinas
                const qPlat = window.sbClient.from('platinas').select('*');
                if (finalUserId) {
                    qPlat.or(`user_id.eq.${finalUserId},usuario.ilike.%${cleanName}%`);
                } else {
                    qPlat.ilike('usuario', `%${cleanName}%`);
                }
                const resP = await qPlat;
                if (resP.data) platinas = resP.data;

                // Mídias
                const qMid = window.sbClient.from('reviews_midias').select('*');
                if (finalUserId) {
                    qMid.or(`user_id.eq.${finalUserId},autor.ilike.%${cleanName}%`);
                } else {
                    qMid.ilike('autor', `%${cleanName}%`);
                }
                const resM = await qMid;
                if (resM.data) midias = resM.data;
            } catch(e) {
                console.warn('[Perfil Gamer] Consulta Supabase retornou aviso, buscando fallback local:', e);
            }
        }

        // 2. Fallback / Merge LocalStorage
        try {
            if (window.OvercriticGamification && typeof window.OvercriticGamification.obterDadosConsolidadosUsuario === 'function') {
                const consolidados = window.OvercriticGamification.obterDadosConsolidadosUsuario(cleanName, finalUserId);
                consolidados.jogos.forEach(ej => {
                    if (!jogos.some(j => String(j.id) === String(ej.id))) jogos.push(ej);
                });
                consolidados.platinas.forEach(ep => {
                    if (!platinas.some(p => String(p.id) === String(ep.id))) platinas.push(ep);
                });
                consolidados.midias.forEach(em => {
                    if (!midias.some(m => String(m.id) === String(em.id))) midias.push(em);
                });
            } else {
                const localJogos = JSON.parse(localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]');
                const extraJ = localJogos.filter(j => {
                    const dono = (j.autor || '').toLowerCase();
                    const uid = j.userId || j.user_id;
                    return dono === cleanName.toLowerCase() || (finalUserId && uid === finalUserId);
                });
                extraJ.forEach(ej => {
                    if (!jogos.some(j => String(j.id) === String(ej.id))) jogos.push(ej);
                });

                const localPlat = JSON.parse(localStorage.getItem('overcritic_platinas_feed') || localStorage.getItem('overcritic_platinas') || '[]');
                const extraP = localPlat.filter(p => {
                    const dono = (p.user || p.usuario || '').toLowerCase();
                    const uid = p.userId || p.user_id;
                    return dono === cleanName.toLowerCase() || (finalUserId && uid === finalUserId);
                });
                extraP.forEach(ep => {
                    if (!platinas.some(p => String(p.id) === String(ep.id))) platinas.push(ep);
                });

                const localMid = JSON.parse(localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]');
                const extraM = localMid.filter(m => {
                    const dono = (m.autor || '').toLowerCase();
                    const uid = m.userId || m.user_id;
                    return dono === cleanName.toLowerCase() || (finalUserId && uid === finalUserId);
                });
                extraM.forEach(em => {
                    if (!midias.some(m => String(m.id) === String(em.id))) midias.push(em);
                });
            }
        } catch(e) {}

        // Filtra quaisquer registros que tenham sido excluídos
        if (window.isItemExcluidoGlobal) {
            jogos = jogos.filter(j => !window.isItemExcluidoGlobal('jogo', j.id, j.titulo, j.autor));
            platinas = platinas.filter(p => !window.isItemExcluidoGlobal('platina', p.id, p.titulo || p.title, p.usuario || p.user));
            midias = midias.filter(m => !window.isItemExcluidoGlobal('midia', m.id, m.title || m.titulo, m.autor));
        }

        // Atualiza estatísticas no modal
        document.getElementById('gpStatJogos').textContent = jogos.length;
        document.getElementById('gpCountTabJogos').textContent = jogos.length;

        document.getElementById('gpStatPlatinas').textContent = platinas.length;
        document.getElementById('gpCountTabPlatinas').textContent = platinas.length;

        document.getElementById('gpStatMidias').textContent = midias.length;
        document.getElementById('gpCountTabMidias').textContent = midias.length;

        // Horas totais
        let totalHoras = 0;
        platinas.forEach(p => { totalHoras += Number(p.hours || p.horas || 0); });
        document.getElementById('gpStatHoras').textContent = totalHoras + 'h';

        // Média de notas
        let somaNotas = 0;
        jogos.forEach(j => { somaNotas += parseFloat(j.minhaNota || j.minha_nota || j.nota || 0); });
        const media = jogos.length > 0 ? (somaNotas / jogos.length).toFixed(1) : '—';
        document.getElementById('gpStatMedia').textContent = media;

        _dadosUsuarioAtual = {
            username: cleanName,
            userId: finalUserId,
            jogos,
            platinas,
            midias,
            abaAtiva: 'jogos'
        };

        // 3. Atualiza Nível Gamer, XP e Botões Gamificados
        if (window.OvercriticGamification) {
            const prog = window.OvercriticGamification.calcularProgressoGamer({
                username: cleanName,
                jogos: jogos,
                midias: midias,
                platinas: platinas
            });

            const levelBadge = document.getElementById('gpLevelBadge');
            if (levelBadge) {
                levelBadge.innerHTML = prog.isDev ? `🛠️ <b>PATENTE DEV</b> • ${prog.titulo}` : `${prog.icone} Nv. ${prog.nivel} ${prog.titulo}`;
                levelBadge.style.color = prog.cor;
                levelBadge.style.borderColor = prog.cor;
                levelBadge.style.background = prog.bg;
            }

            const xpText = document.getElementById('gpXpText');
            if (xpText) {
                xpText.textContent = prog.proximoNivel 
                    ? `${prog.xpNoNivel.toLocaleString('pt-BR')} / ${prog.faixaXp.toLocaleString('pt-BR')} XP (${prog.porcentagem}%)`
                    : `${prog.xpTotal.toLocaleString('pt-BR')} XP (${prog.porcentagem}%)`;
            }

            const xpFill = document.getElementById('gpXpFill');
            if (xpFill) {
                xpFill.style.width = `${prog.porcentagem}%`;
            }
        }

        // 4. Atualiza contagem de insígnias desbloqueadas na aba
        let countInsignias = 0;
        if (window.OvercriticInsignias && typeof window.OvercriticInsignias.obterStatusInsigniasUsuario === 'function') {
            const insList = window.OvercriticInsignias.obterStatusInsigniasUsuario(_dadosUsuarioAtual);
            countInsignias = insList.filter(i => i.desbloqueada).length;
        }
        const elCountIns = document.getElementById('gpCountTabInsignias');
        if (elCountIns) elCountIns.textContent = countInsignias;

        // 5. Atualiza contagem de jogos no Backlog / Fila
        if (window.OvercriticBacklog) {
            const bStats = window.OvercriticBacklog.obterEstatisticas(cleanName);
            const elCountBacklog = document.getElementById('gpCountTabBacklog');
            if (elCountBacklog) elCountBacklog.textContent = bStats.totalJogos;
        }

        // Listeners para abrir o Gamer Card, Tier List, Mural de Insígnias, Backlog e Oráculo
        const btnCard = document.getElementById('gpBtnGamerCard');
        if (btnCard) {
            btnCard.onclick = () => {
                if (window.abrirGamerCardModal) {
                    window.abrirGamerCardModal(_dadosUsuarioAtual);
                }
            };
        }
        const btnTier = document.getElementById('gpBtnTierList');
        if (btnTier) {
            btnTier.onclick = () => {
                if (window.abrirModalTierList) {
                    window.abrirModalTierList(_dadosUsuarioAtual);
                }
            };
        }
        const btnIns = document.getElementById('gpBtnInsignias');
        if (btnIns) {
            btnIns.onclick = () => {
                document.querySelectorAll('.gp-tab-btn').forEach(b => b.classList.remove('active'));
                const tabBtn = document.getElementById('gpTabBtnInsignias');
                if (tabBtn) {
                    tabBtn.classList.add('active');
                    if (typeof tabBtn.scrollIntoView === 'function') {
                        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
                renderizarAbaAtual('insignias');
            };
        }
        const btnBacklog = document.getElementById('gpBtnBacklog');
        if (btnBacklog) {
            btnBacklog.onclick = () => {
                document.querySelectorAll('.gp-tab-btn').forEach(b => b.classList.remove('active'));
                const tabBtn = document.getElementById('gpTabBtnBacklog');
                if (tabBtn) {
                    tabBtn.classList.add('active');
                    if (typeof tabBtn.scrollIntoView === 'function') {
                        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }
                }
                renderizarAbaAtual('backlog');
            };
        }
        const btnOracle = document.getElementById('gpBtnOracle');
        if (btnOracle) {
            btnOracle.onclick = () => {
                if (window.abrirOraculoGamer) {
                    window.abrirOraculoGamer();
                }
            };
        }

        // Reseta aba ativa para "jogos"
        document.querySelectorAll('.gp-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('gpTabBtnJogos').classList.add('active');
        renderizarAbaAtual('jogos');
    }

    window.renderizarAbaAtualGamerProfile = renderizarAbaAtual;

    // Exporta globalmente
    window.abrirPerfilGamerModal = abrirPerfilGamerModal;
    window.fecharPerfilGamerModal = fecharPerfilGamerModal;
    console.log('🎮 [Overcritic] Sistema de Perfil Gamer carregado!');
})();
