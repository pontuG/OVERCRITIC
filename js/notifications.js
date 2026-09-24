/**
 * OVERCRITIC - Sistema de Notificações & Diálogos In-App
 * Substitui o alert() e confirm() nativos do navegador por Toasts e Modais personalizados
 * Estilo Gamer / Cyberpunk / Glassmorphism
 */
(function () {
    // 1. Injeção dos estilos CSS
    const styles = `
        /* Container de Toasts */
        #oc-toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
            max-width: 420px;
            width: calc(100vw - 48px);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Card individual do Toast */
        .oc-toast {
            pointer-events: auto;
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 16px 18px;
            border-radius: 12px;
            background: rgba(13, 17, 27, 0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8f9fa;
            overflow: hidden;
            transform: translateX(120%) scale(0.95);
            opacity: 0;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                        opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        box-shadow 0.25s ease;
            cursor: pointer;
            user-select: none;
        }

        .oc-toast.oc-toast-visible {
            transform: translateX(0) scale(1);
            opacity: 1;
        }

        .oc-toast.oc-toast-hiding {
            transform: translateX(110%) scale(0.9);
            opacity: 0;
        }

        /* Variações de Cores e Bordas */
        .oc-toast.oc-success {
            border-left: 4px solid #00f0ff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.15);
        }
        .oc-toast.oc-error {
            border-left: 4px solid #ff3366;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 51, 102, 0.2);
        }
        .oc-toast.oc-warning {
            border-left: 4px solid #ffb703;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 183, 3, 0.15);
        }
        .oc-toast.oc-info {
            border-left: 4px solid #9d4edd;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(157, 78, 221, 0.2);
        }

        /* Ícone do Toast */
        .oc-toast-icon {
            flex-shrink: 0;
            width: 26px;
            height: 26px;
            margin-top: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .oc-toast.oc-success .oc-toast-icon { color: #00f0ff; }
        .oc-toast.oc-error .oc-toast-icon { color: #ff3366; }
        .oc-toast.oc-warning .oc-toast-icon { color: #ffb703; }
        .oc-toast.oc-info .oc-toast-icon { color: #9d4edd; }

        /* Corpo do Toast */
        .oc-toast-content {
            flex: 1;
            min-width: 0;
        }
        .oc-toast-title {
            font-size: 0.92rem;
            font-weight: 700;
            margin-bottom: 3px;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .oc-toast.oc-success .oc-toast-title { color: #00f0ff; }
        .oc-toast.oc-error .oc-toast-title { color: #ff3366; }
        .oc-toast.oc-warning .oc-toast-title { color: #ffb703; }
        .oc-toast.oc-info .oc-toast-title { color: #c77dff; }

        .oc-toast-message {
            font-size: 0.86rem;
            line-height: 1.4;
            color: #d1d5db;
            word-break: break-word;
        }

        /* Botão de Fechar */
        .oc-toast-close {
            flex-shrink: 0;
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            margin: -4px -6px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        .oc-toast-close:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
        }

        /* Barra de Progresso do Toast */
        .oc-toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            width: 100%;
            background: rgba(255, 255, 255, 0.15);
            transform-origin: left;
        }
        .oc-toast.oc-success .oc-toast-progress { background: linear-gradient(90deg, #00f0ff, #00b4d8); }
        .oc-toast.oc-error .oc-toast-progress { background: linear-gradient(90deg, #ff3366, #ff0055); }
        .oc-toast.oc-warning .oc-toast-progress { background: linear-gradient(90deg, #ffb703, #fb8500); }
        .oc-toast.oc-info .oc-toast-progress { background: linear-gradient(90deg, #9d4edd, #7b2cbf); }

        /* Suporte ao Modo Claro */
        body.light-mode .oc-toast {
            background: rgba(245, 247, 250, 0.94);
            border: 1px solid rgba(0, 0, 0, 0.12);
            color: #111827;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 0 10px rgba(0, 0, 0, 0.05);
        }
        body.light-mode .oc-toast-message {
            color: #374151;
        }
        body.light-mode .oc-toast-close {
            color: #6b7280;
        }
        body.light-mode .oc-toast-close:hover {
            color: #111827;
            background: rgba(0, 0, 0, 0.08);
        }

        /* ══════════════════════════════════════════════
           MODAL DE CONFIRMAÇÃO CUSTOMIZADO (Substitui confirm)
           ══════════════════════════════════════════════ */
        #oc-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(5, 8, 15, 0.78);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        #oc-modal-backdrop.oc-modal-active {
            opacity: 1;
            pointer-events: auto;
        }

        .oc-confirm-box {
            position: relative;
            max-width: 440px;
            width: 100%;
            background: #0d121f;
            background: linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(11, 15, 26, 0.98));
            border: 1px solid rgba(0, 240, 255, 0.25);
            border-radius: 16px;
            padding: 28px 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15);
            transform: scale(0.92) translateY(10px);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: center;
            color: #f8f9fa;
        }

        #oc-modal-backdrop.oc-modal-active .oc-confirm-box {
            transform: scale(1) translateY(0);
        }

        .oc-confirm-icon-wrap {
            width: 60px;
            height: 60px;
            margin: 0 auto 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 240, 255, 0.1);
            color: #00f0ff;
            border: 1px solid rgba(0, 240, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
        }

        .oc-confirm-box.oc-danger .oc-confirm-icon-wrap {
            background: rgba(255, 51, 102, 0.12);
            color: #ff3366;
            border-color: rgba(255, 51, 102, 0.3);
            box-shadow: 0 0 20px rgba(255, 51, 102, 0.2);
        }

        .oc-confirm-title {
            font-size: 1.25rem;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }

        .oc-confirm-message {
            font-size: 0.95rem;
            color: #9ca3af;
            line-height: 1.5;
            margin-bottom: 24px;
        }

        .oc-confirm-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .oc-confirm-btn {
            flex: 1;
            padding: 12px 18px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            outline: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .oc-btn-cancel {
            background: rgba(255, 255, 255, 0.06);
            color: #d1d5db;
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .oc-btn-cancel:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.25);
        }

        .oc-btn-confirm {
            background: linear-gradient(135deg, #00f0ff, #0099ff);
            color: #050811;
            box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
        }
        .oc-btn-confirm:hover {
            box-shadow: 0 6px 20px rgba(0, 240, 255, 0.5);
            transform: translateY(-1px);
        }

        .oc-confirm-box.oc-danger .oc-btn-confirm {
            background: linear-gradient(135deg, #ff3366, #e60049);
            color: #ffffff;
            box-shadow: 0 4px 15px rgba(255, 51, 102, 0.35);
        }
        .oc-confirm-box.oc-danger .oc-btn-confirm:hover {
            box-shadow: 0 6px 20px rgba(255, 51, 102, 0.55);
        }

        body.light-mode #oc-modal-backdrop {
            background: rgba(15, 23, 42, 0.55);
        }
        body.light-mode .oc-confirm-box {
            background: #ffffff;
            color: #0f172a;
            border-color: rgba(0, 0, 0, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        body.light-mode .oc-confirm-message {
            color: #4b5563;
        }
        body.light-mode .oc-btn-cancel {
            background: #f3f4f6;
            color: #374151;
            border-color: #e5e7eb;
        }
        body.light-mode .oc-btn-cancel:hover {
            background: #e5e7eb;
            color: #111827;
        }
    `;

    // Injetar estilo se não existir
    if (!document.getElementById('oc-notifications-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'oc-notifications-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }

    // Containers globais
    let toastContainer = null;
    let modalBackdrop = null;

    function getToastContainer() {
        if (!toastContainer || !document.body.contains(toastContainer)) {
            toastContainer = document.getElementById('oc-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'oc-toast-container';
                document.body.appendChild(toastContainer);
            }
        }
        return toastContainer;
    }

    // Síntese de som gamer futurista (suave e opcional)
    function playNotificationSound(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0.025, now); // volume suave

            if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
            } else if (type === 'error') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(349.23, now); // F4
                osc.frequency.setValueAtTime(261.63, now + 0.08); // C4
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'warning') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(493.88, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            }
        } catch (e) {
            // Silencioso se navegador bloquear autoplay de áudio
        }
    }

    // SVGs dos ícones
    const icons = {
        success: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        warning: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    };

    // Detecção inteligente de tipo a partir de mensagem
    function inferTypeFromMessage(msg) {
        if (!msg) return 'info';
        const lower = String(msg).toLowerCase();
        if (lower.includes('erro') || lower.includes('falha') || lower.includes('não confere') || lower.includes('incorret') || lower.includes('remover') || lower.includes('excluir')) {
            return 'error';
        }
        if (lower.includes('sucesso') || lower.includes('carregado') || lower.includes('atualizada') || lower.includes('registrada') || lower.includes('bem-vindo') || lower.includes('salvo') || lower.includes('parabéns')) {
            return 'success';
        }
        if (lower.includes('atenção') || lower.includes('aviso') || lower.includes('digite') || lower.includes('informe') || lower.includes('login') || lower.includes('você só pode')) {
            return 'warning';
        }
        return 'info';
    }

    // Títulos automáticos padrão
    const defaultTitles = {
        success: 'Sucesso',
        error: 'Atenção',
        warning: 'Aviso',
        info: 'Informação'
    };

    /**
     * Exibe um Toast na tela
     * @param {string} message - Texto da notificação
     * @param {string} [type] - 'success' | 'error' | 'warning' | 'info'
     * @param {number} [duration=4000] - Tempo em ms (0 para não sumir sozinho)
     * @param {string} [customTitle] - Título customizado opcional
     */
    function showToast(message, type = null, duration = 4000, customTitle = null) {
        if (!type) {
            type = inferTypeFromMessage(message);
        }
        const title = customTitle || defaultTitles[type] || 'Notificação';

        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `oc-toast oc-${type}`;

        toast.innerHTML = `
            <div class="oc-toast-icon">${icons[type] || icons.info}</div>
            <div class="oc-toast-content">
                <div class="oc-toast-title">${title}</div>
                <div class="oc-toast-message">${message}</div>
            </div>
            <button class="oc-toast-close" title="Fechar">${icons.close}</button>
            ${duration > 0 ? '<div class="oc-toast-progress"></div>' : ''}
        `;

        container.appendChild(toast);
        playNotificationSound(type);

        // Animação de entrada
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('oc-toast-visible');
            });
        });

        let remainingTime = duration;
        let timerStart = Date.now();
        let timeoutId = null;
        const progressEl = toast.querySelector('.oc-toast-progress');

        function startTimer() {
            if (duration <= 0) return;
            timerStart = Date.now();
            if (progressEl) {
                progressEl.style.transition = `transform ${remainingTime}ms linear`;
                progressEl.style.transform = 'scaleX(0)';
            }
            timeoutId = setTimeout(() => {
                closeToast();
            }, remainingTime);
        }

        function pauseTimer() {
            if (duration <= 0 || !timeoutId) return;
            clearTimeout(timeoutId);
            timeoutId = null;
            const elapsed = Date.now() - timerStart;
            remainingTime = Math.max(0, remainingTime - elapsed);
            if (progressEl) {
                const computed = window.getComputedStyle(progressEl);
                progressEl.style.transition = 'none';
                progressEl.style.transform = computed.transform;
            }
        }

        function closeToast() {
            if (toast.classList.contains('oc-toast-hiding')) return;
            toast.classList.remove('oc-toast-visible');
            toast.classList.add('oc-toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 360);
        }

        // Eventos
        toast.querySelector('.oc-toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeToast();
        });
        toast.addEventListener('click', closeToast);
        toast.addEventListener('mouseenter', pauseTimer);
        toast.addEventListener('mouseleave', () => {
            if (remainingTime > 0) startTimer();
        });

        startTimer();
        return toast;
    }

    // Atalhos
    showToast.success = (msg, title, duration) => showToast(msg, 'success', duration, title);
    showToast.error = (msg, title, duration) => showToast(msg, 'error', duration, title);
    showToast.warning = (msg, title, duration) => showToast(msg, 'warning', duration, title);
    showToast.info = (msg, title, duration) => showToast(msg, 'info', duration, title);

    /**
     * Modal de confirmação personalizado que substitui window.confirm()
     * Retorna uma Promise<boolean>
     * @param {string} message 
     * @param {object} [options] - { title, confirmText, cancelText, isDanger }
     */
    function showConfirm(message, options = {}) {
        return new Promise((resolve) => {
            const isDanger = options.isDanger !== undefined ? options.isDanger : (
                message.toLowerCase().includes('excluir') || 
                message.toLowerCase().includes('remover') || 
                message.toLowerCase().includes('sair')
            );
            const title = options.title || (isDanger ? 'Confirmar Ação' : 'Confirmação');
            const confirmText = options.confirmText || (isDanger ? 'Sim, Prosseguir' : 'Confirmar');
            const cancelText = options.cancelText || 'Cancelar';

            if (!modalBackdrop || !document.body.contains(modalBackdrop)) {
                modalBackdrop = document.createElement('div');
                modalBackdrop.id = 'oc-modal-backdrop';
                document.body.appendChild(modalBackdrop);
            }

            modalBackdrop.innerHTML = `
                <div class="oc-confirm-box ${isDanger ? 'oc-danger' : ''}">
                    <div class="oc-confirm-icon-wrap">
                        ${isDanger ? icons.warning : icons.info}
                    </div>
                    <div class="oc-confirm-title">${title}</div>
                    <div class="oc-confirm-message">${message}</div>
                    <div class="oc-confirm-actions">
                        <button class="oc-confirm-btn oc-btn-cancel" id="ocConfirmCancel">${cancelText}</button>
                        <button class="oc-confirm-btn oc-btn-confirm" id="ocConfirmOk">${confirmText}</button>
                    </div>
                </div>
            `;

            requestAnimationFrame(() => {
                modalBackdrop.classList.add('oc-modal-active');
            });

            function cleanup(result) {
                modalBackdrop.classList.remove('oc-modal-active');
                document.removeEventListener('keydown', handleKeyDown);
                setTimeout(() => {
                    modalBackdrop.innerHTML = '';
                    resolve(result);
                }, 260);
            }

            function handleKeyDown(e) {
                if (e.key === 'Escape') cleanup(false);
                if (e.key === 'Enter') cleanup(true);
            }

            document.addEventListener('keydown', handleKeyDown);
            document.getElementById('ocConfirmCancel').addEventListener('click', () => cleanup(false));
            document.getElementById('ocConfirmOk').addEventListener('click', () => cleanup(true));
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) cleanup(false);
            });

            // Focar o botão de ação principal
            setTimeout(() => {
                const btn = document.getElementById('ocConfirmOk');
                if (btn) btn.focus();
            }, 50);
        });
    }

    // ════════════════════════════════════════════════════════════
    // SOBRESCRITA GLOBAL INTELIGENTE DE window.alert
    // Qualquer alert() chamado em qualquer lugar vira um Toast Gamer!
    // ════════════════════════════════════════════════════════════
    if (window.alert) {
        window._nativeAlert = window.alert;
    }
    window.alert = function (message) {
        showToast(message);
    };

    // Exportação das funções globais para o Overcritic
    window.showToast = showToast;
    window.showConfirm = showConfirm;
    window.mostrarToast = function (msg, tipoOuIcone) {
        let type = 'info';
        if (typeof tipoOuIcone === 'string') {
            if (tipoOuIcone.includes('✅') || tipoOuIcone === 'success') type = 'success';
            else if (tipoOuIcone.includes('⚠️') || tipoOuIcone === 'warning') type = 'warning';
            else if (tipoOuIcone.includes('🔒') || tipoOuIcone.includes('🗑️') || tipoOuIcone === 'error') type = 'error';
            else type = inferTypeFromMessage(msg);
        }
        showToast(msg, type);
    };
    window.exibirToast = function (msg, duration) {
        showToast(msg, null, duration || 4000);
    };

})();
