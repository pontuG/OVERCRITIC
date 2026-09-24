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
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s;
                box-sizing: border-box;
            }
            .gamer-profile-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .gamer-profile-card {
                width: 100%;
                max-width: 820px;
                max-height: 90vh;
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
                padding: 28px 30px 20px 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                position: relative;
                background: radial-gradient(circle at 10% 50%, rgba(0, 240, 255, 0.1), transparent 50%);
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
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
                gap: 8px;
                padding: 16px 30px 0 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .gp-tab-btn {
                background: transparent;
                border: none;
                padding: 10px 18px;
                font-size: 0.88rem;
                font-weight: 700;
                color: var(--text-muted, #adb5bd);
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
            }
            .gp-tab-btn.active {
                color: var(--accent-cyan, #00f0ff);
                border-bottom-color: var(--accent-cyan, #00f0ff);
            }
            /* Content Area */
            .gp-content {
                padding: 24px 30px;
                overflow-y: auto;
                flex: 1;
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
                <div class="gp-header">
                    <div class="gp-user-info">
                        <div class="gp-avatar" id="gpAvatar">🎮</div>
                        <div class="gp-names">
                            <div class="gp-username">
                                <span id="gpUsername">Jogador</span>
                                <span id="gpAdminBadge" class="gp-badge-admin" style="display:none;">👑 ADMIN & FUNDADOR</span>
                                <span class="gp-badge-player" id="gpPlayerStatus">Membro Ativo</span>
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-muted, #adb5bd);" id="gpEmailRow">
                                Perfil Oficial da Comunidade Overcritic
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
                    <button class="gp-tab-btn active" data-tab="jogos" id="gpTabBtnJogos">🎮 Jogos (<span id="gpCountTabJogos">0</span>)</button>
                    <button class="gp-tab-btn" data-tab="platinas" id="gpTabBtnPlatinas">🏆 Platinas (<span id="gpCountTabPlatinas">0</span>)</button>
                    <button class="gp-tab-btn" data-tab="midias" id="gpTabBtnMidias">🎬 Cinema & Séries (<span id="gpCountTabMidias">0</span>)</button>
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
        if (overlay) overlay.classList.remove('active');
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
            container.innerHTML = `<div class="gp-grid">` + list.map(p => `
                <div class="gp-item-card">
                    <img class="gp-item-cover" src="${p.cover || p.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80'}" alt="${p.title || p.titulo}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80'">
                    <div class="gp-item-body">
                        <div class="gp-item-title" title="${p.title || p.titulo}">${p.title || p.titulo}</div>
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
            `).join('') + `</div>`;
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
        }
    }

    async function abrirPerfilGamerModal(targetUsername, targetUserId) {
        garantirEstruturaModal();

        const cleanName = (targetUsername || 'Jogador').trim();
        const avatarEl = document.getElementById('gpAvatar');
        const usernameEl = document.getElementById('gpUsername');
        const adminBadge = document.getElementById('gpAdminBadge');
        const overlay = document.getElementById('gamerProfileOverlay');

        usernameEl.textContent = cleanName;
        avatarEl.textContent = cleanName.charAt(0).toUpperCase() || '🎮';

        // Verifica se o usuário é Admin
        const isAdmin = (window.isAdminUser && window.isAdminUser({ id: targetUserId, email: cleanName }))
            || cleanName.toLowerCase().includes('gabriel')
            || cleanName.toLowerCase() === 'admin'
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

        // Busca dados sincronizados
        let jogos = [];
        let platinas = [];
        let midias = [];

        // 1. Supabase (Online)
        if (window.sbClient) {
            try {
                // Jogos
                const qJogos = window.sbClient.from('reviews_jogos').select('*');
                if (targetUserId) {
                    qJogos.or(`user_id.eq.${targetUserId},autor.ilike.%${cleanName}%`);
                } else {
                    qJogos.ilike('autor', `%${cleanName}%`);
                }
                const resJ = await qJogos;
                if (resJ.data) jogos = resJ.data;

                // Platinas
                const qPlat = window.sbClient.from('platinas').select('*');
                if (targetUserId) {
                    qPlat.or(`user_id.eq.${targetUserId},usuario.ilike.%${cleanName}%`);
                } else {
                    qPlat.ilike('usuario', `%${cleanName}%`);
                }
                const resP = await qPlat;
                if (resP.data) platinas = resP.data;

                // Mídias
                const qMid = window.sbClient.from('reviews_midias').select('*');
                if (targetUserId) {
                    qMid.or(`user_id.eq.${targetUserId},autor.ilike.%${cleanName}%`);
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
            const localJogos = JSON.parse(localStorage.getItem('overcritic_reviews') || localStorage.getItem('overcritic_jogos') || '[]');
            const extraJ = localJogos.filter(j => (j.autor || '').toLowerCase() === cleanName.toLowerCase());
            extraJ.forEach(ej => {
                if (!jogos.some(j => String(j.id) === String(ej.id))) jogos.push(ej);
            });

            const localPlat = JSON.parse(localStorage.getItem('overcritic_platinas_feed') || localStorage.getItem('overcritic_platinas') || '[]');
            const extraP = localPlat.filter(p => (p.user || p.usuario || '').toLowerCase() === cleanName.toLowerCase());
            extraP.forEach(ep => {
                if (!platinas.some(p => String(p.id) === String(ep.id))) platinas.push(ep);
            });

            const localMid = JSON.parse(localStorage.getItem('OVERCRITIC_MIDIAS') || localStorage.getItem('overcritic_midias') || '[]');
            const extraM = localMid.filter(m => (m.autor || '').toLowerCase() === cleanName.toLowerCase());
            extraM.forEach(em => {
                if (!midias.some(m => String(m.id) === String(em.id))) midias.push(em);
            });
        } catch(e) {}

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
            userId: targetUserId,
            jogos,
            platinas,
            midias,
            abaAtiva: 'jogos'
        };

        // Reseta aba ativa para "jogos"
        document.querySelectorAll('.gp-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('gpTabBtnJogos').classList.add('active');
        renderizarAbaAtual('jogos');
    }

    // Exporta globalmente
    window.abrirPerfilGamerModal = abrirPerfilGamerModal;
    window.fecharPerfilGamerModal = fecharPerfilGamerModal;
    console.log('🎮 [Overcritic] Sistema de Perfil Gamer carregado!');
})();
