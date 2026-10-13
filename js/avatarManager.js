// js/avatarManager.js - Gerenciador Universal de Avatares e Fotos de Perfil do OVERCRITIC
(function() {
    'use strict';

    // Coleção Oficial de Ícones e Avatares Gamers do Overcritic
    const PRESET_CATEGORIAS = [
        {
            nome: '🎮 Setup & Controles',
            icones: ['🎮', '🕹️', '👾', '🎧', '🖥️', '🏆', '💎', '🎲']
        },
        {
            nome: '⚔️ Combate & Fantasia',
            icones: ['⚔️', '🛡️', '👑', '🐉', '💀', '🏹', '🧙‍♂️', '🗡️']
        },
        {
            nome: '⚡ Poder & Cósmico',
            icones: ['🔥', '⚡', '💥', '🌌', '🪐', '🚀', '🔮', '🌟']
        },
        {
            nome: '🤖 Ciborgues & Criaturas',
            icones: ['🤖', '🐱‍👤', '🦊', '🐺', '🦁', '🎯', '🏎️', '👻']
        }
    ];

    /**
     * Retorna o HTML adequado para renderizar um avatar (imagem ou ícone/emoji)
     */
    function renderizarAvatarHtml(avatar, fallback = '🎮') {
        const val = (avatar || '').trim() || fallback;
        if (val.startsWith('data:image/') || val.startsWith('http://') || val.startsWith('https://')) {
            return `<img src="${val}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; display:block;" onerror="this.onerror=null; this.parentElement.innerHTML='${fallback}';">`;
        }
        return `<span style="display:inline-flex; align-items:center; justify-content:center; width:100%; height:100%; line-height:1;">${val}</span>`;
    }

    /**
     * Obtém o avatar salvo do usuário atual (localStorage ou Supabase)
     */
    function getUsuarioAvatarAtual() {
        const local = localStorage.getItem('overcritic_user_avatar');
        if (local && local.trim()) return local.trim();

        // Tenta obter do metadata do Supabase se disponível
        try {
            if (window.sbClient) {
                const sessionStr = localStorage.getItem('sb-' + (window.sbClient.supabaseKey || '') + '-auth-token');
                if (sessionStr) {
                    const parsed = JSON.parse(sessionStr);
                    const metaAvatar = parsed?.user?.user_metadata?.avatar_url;
                    if (metaAvatar) {
                        localStorage.setItem('overcritic_user_avatar', metaAvatar);
                        return metaAvatar;
                    }
                }
            }
        } catch(e) {}

        return '🎮';
    }

    /**
     * Salva o avatar no LocalStorage, no Supabase Auth e notifica a aplicação
     */
    async function salvarAvatarUsuario(novoAvatar) {
        if (!novoAvatar) return;
        const limpo = novoAvatar.trim();
        localStorage.setItem('overcritic_user_avatar', limpo);

        // Sincroniza com Supabase Auth
        if (window.sbClient && window.sbClient.auth) {
            try {
                const { data: { session } } = await window.sbClient.auth.getSession();
                if (session && session.user) {
                    await window.sbClient.auth.updateUser({
                        data: { avatar_url: limpo }
                    });
                    console.log('⚡ [AvatarManager] Avatar sincronizado no perfil Supabase com sucesso.');
                }
            } catch (err) {
                console.warn('⚠️ [AvatarManager] Não foi possível salvar avatar no Supabase:', err);
            }
        }

        // Dispara evento global para sincronizar todas as abas e componentes
        window.dispatchEvent(new CustomEvent('overcritic_avatar_alterado', { detail: { avatar: limpo } }));
        atualizarAvataresVisiveisNaPagina(limpo);
    }

    /**
     * Atualiza elementos da página que exibem o avatar do usuário logado
     */
    function atualizarAvataresVisiveisNaPagina(avatar) {
        const avatarAtual = avatar || getUsuarioAvatarAtual();
        
        // Elemento da tela de perfil (conta_login.html)
        const profAvatar = document.getElementById('profAvatar');
        if (profAvatar) profAvatar.innerHTML = renderizarAvatarHtml(avatarAtual);

        // Preview da tela de registro
        const regPreview = document.getElementById('regAvatarPreview');
        if (regPreview) regPreview.innerHTML = renderizarAvatarHtml(avatarAtual);

        // Header Avatar Circle (index.html)
        const headerAvatar = document.querySelector('.header-avatar-circle');
        if (headerAvatar) headerAvatar.innerHTML = renderizarAvatarHtml(avatarAtual);

        // Mini Avatar no Perfil Gamer Modal
        const gpAvatar = document.getElementById('gpAvatar');
        const currentUser = (localStorage.getItem('overcritic_currentUser') || '').toLowerCase();
        const modalUser = (document.getElementById('gpUsername')?.textContent || '').toLowerCase();
        if (gpAvatar && modalUser === currentUser) {
            gpAvatar.innerHTML = renderizarAvatarHtml(avatarAtual);
        }
    }

    /**
     * Comprime e recorta uma imagem de arquivo para 160x160 em formato WebP/JPEG leve
     */
    function processarUploadFoto(file, callbackSucesso, callbackErro) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            if (callbackErro) callbackErro('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
            return;
        }

        // Limite de 8MB para leitura inicial
        if (file.size > 8 * 1024 * 1024) {
            if (callbackErro) callbackErro('A imagem selecionada é muito grande. Escolha uma foto com até 8MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const targetSize = 160;
                    canvas.width = targetSize;
                    canvas.height = targetSize;

                    // Recorte quadrado centralizado (Center Crop 1:1)
                    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
                    if (img.width > img.height) {
                        sWidth = img.height;
                        sx = (img.width - img.height) / 2;
                    } else {
                        sHeight = img.width;
                        sy = (img.height - img.width) / 2;
                    }

                    // Fundo transparente ou preto suave
                    ctx.clearRect(0, 0, targetSize, targetSize);
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

                    // Converte para WebP (ou JPEG caso navegador não suporte)
                    let base64 = canvas.toDataURL('image/webp', 0.88);
                    if (!base64.startsWith('data:image/webp')) {
                        base64 = canvas.toDataURL('image/jpeg', 0.88);
                    }

                    callbackSucesso(base64);
                } catch (err) {
                    console.error('Erro ao processar imagem no canvas:', err);
                    if (callbackErro) callbackErro('Erro ao processar imagem. Tente outra foto.');
                }
            };
            img.onerror = function() {
                if (callbackErro) callbackErro('Falha ao abrir o arquivo de imagem.');
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            if (callbackErro) callbackErro('Erro ao ler arquivo.');
        };
        reader.readAsDataURL(file);
    }

    // ════════════════════════════════════════════════════════
    // ESTRUTURA DOM E ESTILOS DO MODAL SELETOR DE AVATAR
    // ════════════════════════════════════════════════════════

    let avatarSelecionadoTemp = '🎮';
    let callbackAoConfirmar = null;

    function injetarEstilosModal() {
        if (document.getElementById('avatarModalStyles')) return;
        const style = document.createElement('style');
        style.id = 'avatarModalStyles';
        style.textContent = `
            .avatar-modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(4, 7, 15, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .avatar-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .avatar-modal-card {
                background: #0d121f;
                border: 1px solid rgba(0, 240, 255, 0.3);
                border-radius: 24px;
                width: 100%;
                max-width: 520px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 240, 255, 0.15);
                overflow: hidden;
                transform: scale(0.92);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .avatar-modal-overlay.active .avatar-modal-card {
                transform: scale(1);
            }
            body.light-mode .avatar-modal-card {
                background: #eef1f6;
                border-color: rgba(197, 27, 41, 0.35);
                box-shadow: 0 16px 50px rgba(0,0,0,0.15), 0 0 35px rgba(197, 27, 41, 0.1);
            }
            .avatar-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            body.light-mode .avatar-modal-header {
                border-bottom-color: rgba(0, 0, 0, 0.08);
            }
            .avatar-modal-title {
                font-size: 1.2rem;
                font-weight: 800;
                color: var(--text-main, #f8f9fa);
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
            }
            body.light-mode .avatar-modal-title {
                color: #0e121a;
            }
            .avatar-modal-close-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: var(--text-muted, #adb5bd);
                border-radius: 12px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s ease;
            }
            .avatar-modal-close-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #fff;
            }
            body.light-mode .avatar-modal-close-btn {
                background: rgba(0, 0, 0, 0.05);
                border-color: rgba(0, 0, 0, 0.1);
                color: #555;
            }
            .avatar-modal-body {
                padding: 22px 24px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            /* Preview Box */
            .avatar-preview-box {
                display: flex;
                align-items: center;
                gap: 18px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 18px;
                padding: 16px 20px;
            }
            body.light-mode .avatar-preview-box {
                background: rgba(0, 0, 0, 0.03);
                border-color: rgba(0, 0, 0, 0.08);
            }
            .avatar-big-circle {
                width: 80px;
                height: 80px;
                border-radius: 22px;
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(157, 78, 221, 0.2));
                border: 2px solid var(--accent-cyan, #00f0ff);
                box-shadow: 0 0 25px rgba(0, 240, 255, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                overflow: hidden;
                flex-shrink: 0;
                transition: all 0.3s ease;
            }
            body.light-mode .avatar-big-circle {
                border-color: #c51b29;
                box-shadow: 0 0 20px rgba(197, 27, 41, 0.3);
            }
            .avatar-preview-info h4 {
                margin: 0 0 4px 0;
                font-size: 1.05rem;
                font-weight: 700;
                color: var(--text-main, #fff);
            }
            body.light-mode .avatar-preview-info h4 {
                color: #0e121a;
            }
            .avatar-preview-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--text-muted, #adb5bd);
                line-height: 1.4;
            }
            /* Abas de Escolha */
            .avatar-subtabs {
                display: flex;
                gap: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 10px;
            }
            body.light-mode .avatar-subtabs {
                border-bottom-color: rgba(0, 0, 0, 0.08);
            }
            .avatar-tab-btn {
                background: transparent;
                border: none;
                color: var(--text-muted, #adb5bd);
                font-size: 0.85rem;
                font-weight: 700;
                padding: 8px 14px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .avatar-tab-btn:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.05);
            }
            .avatar-tab-btn.active {
                background: rgba(0, 240, 255, 0.12);
                color: var(--accent-cyan, #00f0ff);
                border: 1px solid rgba(0, 240, 255, 0.3);
            }
            body.light-mode .avatar-tab-btn.active {
                background: rgba(197, 27, 41, 0.12);
                color: #c51b29;
                border-color: rgba(197, 27, 41, 0.3);
            }
            /* Grid de Ícones Preset */
            .avatar-presets-container {
                display: flex;
                flex-direction: column;
                gap: 14px;
                max-height: 230px;
                overflow-y: auto;
                padding-right: 4px;
            }
            .avatar-category-label {
                font-size: 0.76rem;
                font-weight: 700;
                color: var(--accent-cyan, #00f0ff);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 6px;
            }
            body.light-mode .avatar-category-label {
                color: #c51b29;
            }
            .avatar-icons-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(46px, 1fr));
                gap: 10px;
            }
            .avatar-preset-btn {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 1.45rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .avatar-preset-btn:hover {
                transform: scale(1.15);
                border-color: var(--accent-cyan, #00f0ff);
                background: rgba(0, 240, 255, 0.1);
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
            }
            .avatar-preset-btn.selected {
                border-color: var(--accent-cyan, #00f0ff);
                background: rgba(0, 240, 255, 0.2);
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
                transform: scale(1.08);
            }
            body.light-mode .avatar-preset-btn {
                background: #fff;
                border-color: rgba(0,0,0,0.1);
            }
            body.light-mode .avatar-preset-btn.selected {
                border-color: #c51b29;
                background: rgba(197, 27, 41, 0.15);
                box-shadow: 0 0 15px rgba(197, 27, 41, 0.3);
            }
            /* Painel de Upload de Foto */
            .avatar-upload-panel {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 14px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border: 2px dashed rgba(0, 240, 255, 0.25);
                border-radius: 18px;
                text-align: center;
            }
            body.light-mode .avatar-upload-panel {
                background: #fff;
                border-color: rgba(0,0,0,0.2);
            }
            .btn-select-file {
                background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(157, 78, 221, 0.2));
                border: 1px solid var(--accent-cyan, #00f0ff);
                color: var(--text-main, #fff);
                font-weight: 700;
                font-size: 0.88rem;
                padding: 12px 22px;
                border-radius: 12px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.25s ease;
            }
            .btn-select-file:hover {
                background: var(--accent-cyan, #00f0ff);
                color: #07090f;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
            }
            body.light-mode .btn-select-file {
                background: rgba(197, 27, 41, 0.1);
                border-color: #c51b29;
                color: #c51b29;
            }
            body.light-mode .btn-select-file:hover {
                background: #c51b29;
                color: #fff;
            }
            /* Painel de URL */
            .avatar-url-panel {
                display: flex;
                gap: 8px;
                width: 100%;
            }
            .avatar-url-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #fff;
                padding: 10px 14px;
                border-radius: 10px;
                font-size: 0.85rem;
                outline: none;
            }
            .avatar-url-input:focus {
                border-color: var(--accent-cyan, #00f0ff);
            }
            body.light-mode .avatar-url-input {
                background: #fff;
                color: #0e121a;
                border-color: rgba(0,0,0,0.15);
            }
            /* Footer */
            .avatar-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            body.light-mode .avatar-modal-footer {
                border-top-color: rgba(0,0,0,0.08);
            }
            .btn-modal-cancel {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: var(--text-muted, #adb5bd);
                padding: 10px 18px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-modal-confirm {
                background: var(--accent-cyan, #00f0ff);
                border: none;
                color: #07090f;
                padding: 10px 22px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
                transition: all 0.2s ease;
            }
            .btn-modal-confirm:hover {
                opacity: 0.92;
                transform: translateY(-1px);
            }
            body.light-mode .btn-modal-confirm {
                background: #c51b29;
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    function garantirEstruturaModal() {
        injetarEstilosModal();
        if (document.getElementById('overcriticAvatarModalOverlay')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'overcriticAvatarModalOverlay';
        modalDiv.className = 'avatar-modal-overlay';
        modalDiv.onclick = function(e) {
            if (e.target === modalDiv) fecharModalSeletorAvatar();
        };

        // Monta o grid de ícones agrupados por categoria
        let htmlCategorias = '';
        PRESET_CATEGORIAS.forEach(cat => {
            htmlCategorias += `
                <div>
                    <div class="avatar-category-label">${cat.nome}</div>
                    <div class="avatar-icons-grid">
                        ${cat.icones.map(ico => `
                            <button type="button" class="avatar-preset-btn" data-icon="${ico}" onclick="window.selecionarPresetAvatar('${ico}')">
                                ${ico}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        modalDiv.innerHTML = `
            <div class="avatar-modal-card">
                <div class="avatar-modal-header">
                    <h3 class="avatar-modal-title">
                        <span>👤</span> Escolha sua Imagem de Perfil
                    </h3>
                    <button type="button" class="avatar-modal-close-btn" onclick="window.fecharModalSeletorAvatar()" title="Fechar">✕</button>
                </div>

                <div class="avatar-modal-body">
                    <!-- Preview em destaque -->
                    <div class="avatar-preview-box">
                        <div class="avatar-big-circle" id="modalAvatarPreviewCircle">
                            🎮
                        </div>
                        <div class="avatar-preview-info">
                            <h4 id="modalAvatarUsername">Seu Perfil Gamer</h4>
                            <p>Essa foto ou ícone aparecerá nas suas avaliações, platinas e feed da comunidade.</p>
                        </div>
                    </div>

                    <!-- Abas de seleção -->
                    <div class="avatar-subtabs">
                        <button type="button" id="tabBtnPresets" class="avatar-tab-btn active" onclick="window.alternarSubtabAvatar('presets')">🎮 Ícones Gamer</button>
                        <button type="button" id="tabBtnUpload" class="avatar-tab-btn" onclick="window.alternarSubtabAvatar('upload')">📷 Enviar Foto</button>
                        <button type="button" id="tabBtnUrl" class="avatar-tab-btn" onclick="window.alternarSubtabAvatar('url')">🌐 Link da Web</button>
                    </div>

                    <!-- Painel 1: Presets -->
                    <div id="panelAvatarPresets" class="avatar-presets-container">
                        ${htmlCategorias}
                    </div>

                    <!-- Painel 2: Upload de Foto -->
                    <div id="panelAvatarUpload" class="avatar-upload-panel" style="display: none;">
                        <input type="file" id="avatarFileInput" accept="image/png, image/jpeg, image/webp" style="display: none;" onchange="window.aoSelecionarArquivoAvatar(event)">
                        <div style="font-size: 2.2rem;">🖼️</div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main, #fff);">Faça upload da sua foto ou imagem</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted, #adb5bd); max-width: 320px;">
                            Arquivos PNG, JPG ou WEBP. Sua foto será ajustada em formato quadrado de forma automática e otimizada.
                        </div>
                        <button type="button" class="btn-select-file" onclick="document.getElementById('avatarFileInput').click()">
                            <span>📁</span> Escolher Foto do Computador / Celular
                        </button>
                    </div>

                    <!-- Painel 3: URL Externa -->
                    <div id="panelAvatarUrl" style="display: none;">
                        <div style="font-size: 0.8rem; color: var(--text-muted, #adb5bd); margin-bottom: 8px;">
                            Cole abaixo o link direto de uma imagem (ex.: do Discord, Steam ou Imgur):
                        </div>
                        <div class="avatar-url-panel">
                            <input type="url" id="avatarUrlInput" class="avatar-url-input" placeholder="https://exemplo.com/minha-foto.png">
                            <button type="button" class="btn-modal-confirm" onclick="window.aoAplicarUrlAvatar()" style="padding: 8px 16px;">Carregar</button>
                        </div>
                    </div>
                </div>

                <div class="avatar-modal-footer">
                    <button type="button" class="btn-modal-cancel" onclick="window.fecharModalSeletorAvatar()">Cancelar</button>
                    <button type="button" class="btn-modal-confirm" onclick="window.confirmarEscolhaAvatar()">✨ Salvar Avatar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);
    }

    /**
     * Abre o modal seletor de avatar
     */
    function abrirModalSeletorAvatar(callbackCustomizado) {
        garantirEstruturaModal();
        callbackAoConfirmar = callbackCustomizado || null;

        const overlay = document.getElementById('overcriticAvatarModalOverlay');
        const preview = document.getElementById('modalAvatarPreviewCircle');
        const userLabel = document.getElementById('modalAvatarUsername');

        const currentUser = localStorage.getItem('overcritic_currentUser') || 'Jogador';
        if (userLabel) userLabel.textContent = currentUser;

        avatarSelecionadoTemp = getUsuarioAvatarAtual();
        if (preview) preview.innerHTML = renderizarAvatarHtml(avatarSelecionadoTemp);

        destacarBotaoPreset(avatarSelecionadoTemp);
        alternarSubtabAvatar('presets');

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function fecharModalSeletorAvatar() {
        const overlay = document.getElementById('overcriticAvatarModalOverlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function alternarSubtabAvatar(tab) {
        const btnPresets = document.getElementById('tabBtnPresets');
        const btnUpload = document.getElementById('tabBtnUpload');
        const btnUrl = document.getElementById('tabBtnUrl');

        const panelPresets = document.getElementById('panelAvatarPresets');
        const panelUpload = document.getElementById('panelAvatarUpload');
        const panelUrl = document.getElementById('panelAvatarUrl');

        [btnPresets, btnUpload, btnUrl].forEach(b => b && b.classList.remove('active'));
        if (panelPresets) panelPresets.style.display = 'none';
        if (panelUpload) panelUpload.style.display = 'none';
        if (panelUrl) panelUrl.style.display = 'none';

        if (tab === 'presets') {
            if (btnPresets) btnPresets.classList.add('active');
            if (panelPresets) panelPresets.style.display = 'flex';
        } else if (tab === 'upload') {
            if (btnUpload) btnUpload.classList.add('active');
            if (panelUpload) panelUpload.style.display = 'flex';
        } else {
            if (btnUrl) btnUrl.classList.add('active');
            if (panelUrl) panelUrl.style.display = 'block';
        }
    }

    function selecionarPresetAvatar(ico) {
        avatarSelecionadoTemp = ico;
        const preview = document.getElementById('modalAvatarPreviewCircle');
        if (preview) preview.innerHTML = renderizarAvatarHtml(ico);
        destacarBotaoPreset(ico);
    }

    function destacarBotaoPreset(ico) {
        document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
            if (btn.getAttribute('data-icon') === ico) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    function aoSelecionarArquivoAvatar(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        processarUploadFoto(file, (base64Img) => {
            avatarSelecionadoTemp = base64Img;
            const preview = document.getElementById('modalAvatarPreviewCircle');
            if (preview) preview.innerHTML = renderizarAvatarHtml(base64Img);
            destacarBotaoPreset(null);
            if (window.showToast && window.showToast.info) {
                window.showToast.info('Foto carregada no preview! Clique em Salvar.');
            }
        }, (err) => {
            alert(err);
        });
    }

    function aoAplicarUrlAvatar() {
        const input = document.getElementById('avatarUrlInput');
        const url = (input?.value || '').trim();
        if (!url || !url.startsWith('http')) {
            alert('Por favor, informe uma URL válida iniciando com http:// ou https://');
            return;
        }

        avatarSelecionadoTemp = url;
        const preview = document.getElementById('modalAvatarPreviewCircle');
        if (preview) preview.innerHTML = renderizarAvatarHtml(url);
        destacarBotaoPreset(null);
        if (window.showToast && window.showToast.info) {
            window.showToast.info('Link da foto aplicado no preview! Clique em Salvar.');
        }
    }

    async function confirmarEscolhaAvatar() {
        if (!avatarSelecionadoTemp) return;

        if (typeof callbackAoConfirmar === 'function') {
            callbackAoConfirmar(avatarSelecionadoTemp);
        } else {
            await salvarAvatarUsuario(avatarSelecionadoTemp);
            if (window.showToast && window.showToast.success) {
                window.showToast.success('Foto / Avatar atualizado com sucesso!');
            }
        }

        fecharModalSeletorAvatar();
    }

    // Exporta funções globalmente no objeto window
    window.renderizarAvatarHtml = renderizarAvatarHtml;
    window.getUsuarioAvatarAtual = getUsuarioAvatarAtual;
    window.salvarAvatarUsuario = salvarAvatarUsuario;
    window.atualizarAvataresVisiveisNaPagina = atualizarAvataresVisiveisNaPagina;
    window.abrirModalSeletorAvatar = abrirModalSeletorAvatar;
    window.fecharModalSeletorAvatar = fecharModalSeletorAvatar;
    window.alternarSubtabAvatar = alternarSubtabAvatar;
    window.selecionarPresetAvatar = selecionarPresetAvatar;
    window.aoSelecionarArquivoAvatar = aoSelecionarArquivoAvatar;
    window.aoAplicarUrlAvatar = aoAplicarUrlAvatar;
    window.confirmarEscolhaAvatar = confirmarEscolhaAvatar;

    // Inicialização ao carregar o DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            atualizarAvataresVisiveisNaPagina();
        });
    } else {
        atualizarAvataresVisiveisNaPagina();
    }
})();
