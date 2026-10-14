/**
 * OVERCRITIC - Gerenciador Universal de PWA (Instalação, Cache & Modo Standalone)
 * v26.10.5
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');

  // 1. Registro do Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Registra com escopo relativo para suportar GitHub Pages (/OVERCRITIC/) e servidores locais
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((registration) => {
          console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

          // Verifica se há atualização disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  exibirAvisoAtualizacao();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    });
  }

  // 2. Captura do Prompt Nativo de Instalação (Android / Windows / Chrome / Edge)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    renderizarBotaoInstalacao();
  });

  // 3. Notificação quando o app for instalado com sucesso
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] OVERCRITIC instalado como App com sucesso!');
    deferredInstallPrompt = null;
    removerBotaoInstalacao();
    if (typeof showToast === 'object' && showToast.success) {
      showToast.success('🎉 <b>OVERCRITIC Instalado!</b> O app já está disponível na sua área de trabalho/tela inicial.');
    }
  });

  // 4. Renderização do Botão de Instalação na Barra Lateral ou Header
  function renderizarBotaoInstalacao() {
    if (isStandalone) return; // Já está rodando dentro do aplicativo instalado

    // Procura a barra lateral
    const sidebarNav = document.querySelector('.sidebar .nav-links') || document.querySelector('.sidebar');
    if (!sidebarNav || document.getElementById('pwaInstallBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.className = 'nav-item pwa-install-nav-btn';
    btn.setAttribute('data-tooltip', 'Instalar Aplicativo OVERCRITIC');
    btn.setAttribute('aria-label', 'Instalar App');
    btn.innerHTML = '📲';
    btn.style.cssText = `
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(157, 78, 221, 0.15));
      border: 1px solid var(--accent-cyan, #00f0ff);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
      animation: pwaPulse 3s infinite;
      cursor: pointer;
    `;

    btn.addEventListener('click', acionarInstalacaoPWA);

    // Insere antes do botão de tema se existir
    const themeContainer = document.querySelector('.theme-toggle-container');
    if (themeContainer && themeContainer.parentNode) {
      themeContainer.parentNode.insertBefore(btn, themeContainer);
    } else {
      sidebarNav.appendChild(btn);
    }
  }

  function removerBotaoInstalacao() {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.remove();
  }

  // 5. Acionamento do Fluxo de Instalação
  async function acionarInstalacaoPWA() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`[PWA] Escolha do usuário: ${outcome}`);
      if (outcome === 'accepted') {
        removerBotaoInstalacao();
      }
      deferredInstallPrompt = null;
    } else {
      // Se for iOS ou navegador sem beforeinstallprompt nativo
      exibirModalInstrucoesInstalacao();
    }
  }

  // 6. Modal de Instruções (iOS Safari e navegadores manuais)
  function exibirModalInstrucoesInstalacao() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let dicaTexto = isIOS
      ? 'No seu iPhone/iPad: Toque no botão <b>Compartilhar</b> (ícone do quadrado com a seta) e escolha <b>"Adicionar à Tela de Início"</b>.'
      : 'No seu navegador: Clique no menu de três pontos ou no ícone de instalar na barra de endereços e selecione <b>"Instalar OVERCRITIC"</b>.';

    const modal = document.createElement('div');
    modal.id = 'pwaGuideModal';
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = `
      <div style="background: #0d111b; border: 1px solid var(--accent-cyan, #00f0ff); border-radius: 20px; max-width: 420px; width: 100%; padding: 26px; box-shadow: 0 10px 40px rgba(0,240,255,0.3); color: #fff; text-align: center; font-family: 'Inter', sans-serif;">
        <img src="assets/overcritic_icon.png" alt="OVERCRITIC" style="width: 72px; height: 72px; border-radius: 16px; margin-bottom: 14px; box-shadow: 0 0 20px rgba(0,240,255,0.4);">
        <h3 style="margin: 0 0 10px 0; font-size: 1.25rem; font-weight: 800; color: #fff;">Instalar OVERCRITIC App</h3>
        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; margin: 0 0 20px 0;">
          Aproveite a experiência de aplicativo nativo: carregamento instantâneo, modo tela cheia e acesso rápido direto da sua tela inicial.
        </p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; font-size: 0.82rem; color: #94a3b8; text-align: left; margin-bottom: 20px;">
          ${dicaTexto}
        </div>
        <button id="closePwaGuide" style="background: var(--accent-cyan, #00f0ff); color: #07090f; border: none; font-weight: 800; font-size: 0.9rem; padding: 10px 24px; border-radius: 10px; cursor: pointer; transition: opacity 0.2s;">
          Entendido
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('closePwaGuide').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // 7. Notificação de Nova Versão Disponível
  function exibirAvisoAtualizacao() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: #0d111b; border: 1px solid #00f0ff; border-radius: 14px;
      padding: 14px 20px; box-shadow: 0 8px 30px rgba(0,240,255,0.3);
      color: #fff; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 14px;
    `;
    toast.innerHTML = `
      <div>
        <b style="color:#00f0ff;">✨ Nova versão disponível!</b>
        <div style="font-size:0.8rem; color:#94a3b8;">Clique para atualizar o aplicativo.</div>
      </div>
      <button id="btnPwaReload" style="background:#00f0ff; color:#07090f; border:none; padding:6px 14px; border-radius:8px; font-weight:700; cursor:pointer;">Atualizar</button>
    `;
    document.body.appendChild(toast);
    document.getElementById('btnPwaReload').addEventListener('click', () => {
      window.location.reload();
    });
  }

  // 8. Monitoramento Online / Offline
  window.addEventListener('offline', () => {
    console.warn('[PWA] Conexão perdida. Operando em modo cache offline.');
  });
  window.addEventListener('online', () => {
    console.log('[PWA] Conexão restabelecida.');
  });

  // Estilos de animação para o botão de instalação
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes pwaPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 240, 255, 0.25); }
      50% { transform: scale(1.08); box-shadow: 0 0 20px rgba(0, 240, 255, 0.5); }
    }
  `;
  document.head.appendChild(styleEl);

  // Inicialização no DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarBotaoInstalacao);
  } else {
    renderizarBotaoInstalacao();
  }

  // Exporta função para acionamento manual se necessário
  window.instalarOvercriticApp = acionarInstalacaoPWA;

})();
