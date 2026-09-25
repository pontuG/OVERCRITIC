/**
 * Overcritic - Controle Central de Versões do Sistema
 * 
 * PADRÃO DE IDENTIFICAÇÃO DE VERSÃO (CalVer):
 * Formato: [ANO].[MÊS].[BUILD/SUBIDA]
 * Exemplo: 26.09.3
 *   - 26 : Ano da publicação (2026 -> 26)
 *   - 09 : Mês da publicação (09 = Setembro)
 *   - 3  : Número de vezes que o site foi subido/atualizado (Deploy/Build #3)
 */
const OVERCRITIC_APP = {
    version: "26.09.6",
    year: "2026",
    month: "09",
    build: 6,
    releaseDate: "24/09/2026",
    status: "Versão Estável",
    codename: "Mobile Tabs & Seamless Navigation",
    author: "pontuG (Admin)",
    changelog: [
        {
            version: "26.09.6",
            date: "24/09/2026",
            title: "Abas Móveis Otimizadas & Navegação Seccionada sem Cortes",
            highlights: [
                "Carrossel de abas fluido em Troféus & Platinas com rolagem suave (scroll-snap), termos objetivos e máscara lateral translúcida eliminando cortes",
                "Nova barra de abas de seções no celular para Críticas de Jogos (Cadastrar, Críticas, Em Alta), permitindo alternar telas instantaneamente",
                "Nova barra de abas de seções no celular para Filmes & Séries (Cadastrar, Meu Catálogo, Tendências TMDB)",
                "Redirecionamento inteligente ao tocar em 'Avaliar' ou 'Editar', alternando e rolando automaticamente para o formulário no mobile",
                "Correção da propriedade CSS padrão background-clip para conformidade com especificações W3C"
            ]
        },
        {
            version: "26.09.5",
            date: "24/09/2026",
            title: "Aba Lateral Deslizante (Drawer) & Visualização Mobile Livre",
            highlights: [
                "Nova Aba Lateral Móvel Deslizante (Drawer) com suporte a gestos swipe para puxar da borda e recolher facilmente",
                "Eliminação completa da barra inferior fixa no celular, liberando 100% da visualização dos formulários de cadastro sem cortes",
                "Exibição contínua da versão oficial do sistema (v26.09.5) na barra superior móvel e dentro da aba lateral",
                "Centralização perfeita do pôster e placeholder de mídia e capa de jogos, corrigindo o espaçamento vazio à esquerda",
                "Resolução definitiva da colisão e sobreposição de ícones (perfil e alternador de tema) em todas as abas",
                "Alternador de tema sincronizado no topo e no menu lateral para alternar rapidamente entre Modo Claro e Escuro"
            ]
        },
        {
            version: "26.09.4",
            date: "24/09/2026",
            title: "Responsividade 100% Universal & Mobile Flawless",
            highlights: [
                "Responsividade 100% funcional e testada para qualquer tela (smartphones de 320px a 430px, tablets, laptops e monitores 4K)",
                "Correção definitiva da tela de abertura (Splash Intro) com tipografia clamp() fluida e logo proporcional",
                "Eliminação completa de overflow horizontal nos formulários, busca TMDB e cards de visualização de mídia e jogos",
                "Unificação da navegação mobile em todas as páginas, padronizando a experiência do app"
            ]
        },
        {
            version: "26.09.3",
            date: "24/09/2026",
            title: "Responsividade Universal & Refinamento de Contraste",
            highlights: [
                "Responsividade dinâmica para todas as telas (Laptops 1366x768, telas com escala 125%/150%, Tablets e Celulares), eliminando a necessidade de zoom manual",
                "Remoção dos nomes técnicos de arquivos e pastas no menu suspenso do Suporte",
                "Contraste e cores refinadas nos campos de seleção nos modos Claro e Escuro",
                "Novo padrão de versão Ano.Mês.Subida (26.09.3)",
                "Sistema centralizado de versões com histórico interativo de atualizações"
            ]
        },
        {
            version: "26.09.2",
            date: "24/09/2026",
            title: "Platinas & Troféus Expandido",
            highlights: [
                "Integração do banco de dados completo de troféus e platinas (God of War, jogos de PS, Xbox e PC)",
                "Novo controlador backend de sincronização de troféus",
                "Filtro por plataforma e visualização de conquistas detalhada"
            ]
        },
        {
            version: "26.09.1",
            date: "01/09/2026",
            title: "Lançamento Oficial Overcritic",
            highlights: [
                "Dashboard Bento Grid dinâmico e interativo",
                "Críticas e notas de jogos eletrônicos, filmes e séries",
                "Suporte completo aos modos Escuro (Cyberpunk) e Claro (Titânio)"
            ]
        }
    ]
};

// Disponibiliza globalmente
window.OVERCRITIC_APP = OVERCRITIC_APP;

/**
 * Abre o Modal de Novidades / Changelog
 */
function abrirChangelogModal() {
    let modal = document.getElementById('overcriticChangelogModal');
    if (!modal) {
        criarModalChangelogDOM();
        modal = document.getElementById('overcriticChangelogModal');
    }
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha o Modal de Novidades
 */
function fecharChangelogModal() {
    const modal = document.getElementById('overcriticChangelogModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.abrirChangelogModal = abrirChangelogModal;
window.fecharChangelogModal = fecharChangelogModal;

/**
 * Cria a estrutura DOM do modal caso não exista na página
 */
function criarModalChangelogDOM() {
    if (document.getElementById('overcriticChangelogModal')) return;

    const modalHTML = `
    <div id="overcriticChangelogModal" class="version-modal-overlay" onclick="if(event.target === this) fecharChangelogModal()">
        <div class="version-modal-card">
            <div class="version-modal-header">
                <div class="version-header-left">
                    <span class="version-icon-glow">🚀</span>
                    <div>
                        <div class="version-title-row">
                            <h3>Overcritic v${OVERCRITIC_APP.version}</h3>
                            <span class="version-badge-status">${OVERCRITIC_APP.status}</span>
                        </div>
                        <p class="version-subtitle">${OVERCRITIC_APP.codename} • Lançado em ${OVERCRITIC_APP.releaseDate}</p>
                    </div>
                </div>
                <button class="version-close-btn" onclick="fecharChangelogModal()" title="Fechar">✕</button>
            </div>

            <div class="version-modal-body">
                <!-- EXPLICADOR DO PADRÃO DE VERSÃO -->
                <div class="version-scheme-explainer" style="background: rgba(0, 240, 255, 0.06); border: 1px dashed rgba(0, 240, 255, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">🏷️</span>
                    <div>
                        <strong>Padrão de Versão: ${OVERCRITIC_APP.version}</strong>
                        <div style="color: var(--text-muted, #8b9bb4); font-size: 0.74rem; margin-top: 2px;">
                            Ano: <strong>20${OVERCRITIC_APP.version.split('.')[0]}</strong> • 
                            Mês: <strong>${OVERCRITIC_APP.version.split('.')[1]}</strong> • 
                            Deploy/Subida: <strong>#${OVERCRITIC_APP.version.split('.')[2]}</strong>
                        </div>
                    </div>
                </div>

                <div class="version-section">
                    <h4 class="version-section-title">✨ Destaques da Atualização (v${OVERCRITIC_APP.version})</h4>
                    <ul class="version-highlights-list">
                        ${OVERCRITIC_APP.changelog[0].highlights.map(h => `<li><span class="check-icon">✓</span> ${h}</li>`).join('')}
                    </ul>
                </div>

                <div class="version-section">
                    <h4 class="version-section-title">📜 Histórico de Versões</h4>
                    <div class="version-history-list">
                        ${OVERCRITIC_APP.changelog.slice(1).map(c => `
                            <div class="version-history-item">
                                <div class="version-history-top">
                                    <strong>v${c.version} - ${c.title}</strong>
                                    <span>${c.date}</span>
                                </div>
                                <ul>
                                    ${c.highlights.map(h => `<li>${h}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="version-modal-footer">
                <div class="version-footer-note">Administrado por <strong>${OVERCRITIC_APP.author}</strong></div>
                <button class="version-btn-ok" onclick="fecharChangelogModal()">Fechar</button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Alterna entre Modo Claro e Modo Escuro em qualquer tela
 */
function alternarTemaGlobal() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('overcritic_theme', isLight ? 'light' : 'dark');
    atualizarIconesTema(isLight);
}

function atualizarIconesTema(isLight) {
    if (typeof isLight === 'undefined') {
        isLight = document.body.classList.contains('light-mode') || localStorage.getItem('overcritic_theme') === 'light';
    }
    const icon = isLight ? '☀️' : '🌓';
    const text = isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro';

    document.querySelectorAll('.mobile-theme-icon, #mobileDrawerThemeIcon').forEach(el => {
        el.textContent = icon;
    });

    const drawerThemeText = document.getElementById('mobileDrawerThemeText');
    if (drawerThemeText) drawerThemeText.textContent = text;
}

window.alternarTemaGlobal = alternarTemaGlobal;
window.atualizarIconesTema = atualizarIconesTema;

/**
 * Controle de Abertura e Fechamento da Aba Lateral Móvel (Drawer)
 */
function abrirMenuLateralMobile() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharMenuLateralMobile() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
}

window.abrirMenuLateralMobile = abrirMenuLateralMobile;
window.fecharMenuLateralMobile = fecharMenuLateralMobile;

/**
 * Inicializa a Barra Superior e a Aba Lateral Deslizante para Celulares
 */
function inicializarMobileDrawer() {
    if (document.getElementById('mobileTopBar')) return;

    // Detecta a página ativa
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const displayVersion = `v${OVERCRITIC_APP.version}`;

    // 8 abas de navegação do Overcritic
    const navItems = [
        { href: 'index.html', icon: '🏠', title: 'Início', desc: 'Dashboard & Feed Geral' },
        { href: 'adicionar_jogos.html', icon: '🎮', title: 'Cadastrar Jogos', desc: 'Registrar análise de games' },
        { href: 'descobrir_jogos.html', icon: '🪐', title: 'Descobrir Jogos', desc: 'Tendências e lançamentos' },
        { href: 'adicionar_midias.html', icon: '🎬', title: 'Cadastrar Mídia', desc: 'Filmes, Séries e Animes' },
        { href: 'descobrir_titulos.html', icon: '🍿', title: 'Descobrir Títulos', desc: 'Streaming & Catálogo TMDB' },
        { href: 'adicionar_platinas.html', icon: '🏆', title: 'Platinas & Troféus', desc: 'Conquistas & 100% Gamer' },
        { href: 'suporte_overcritic.html', icon: '💡', title: 'Suporte & Ajuda', desc: 'Central de dúvidas e FAQ' },
        { href: 'conta_login.html', icon: '👤', title: 'Minha Conta', desc: 'Perfil e credenciais' }
    ];

    const navLinksHTML = navItems.map(item => {
        const isActive = currentPath === item.href || (currentPath === '' && item.href === 'index.html');
        return `
            <a href="${item.href}" class="drawer-nav-item ${isActive ? 'active' : ''}">
                <span class="drawer-nav-icon">${item.icon}</span>
                <div class="drawer-nav-text">
                    <span class="drawer-nav-title">${item.title}</span>
                    <span class="drawer-nav-desc">${item.desc}</span>
                </div>
                <span class="drawer-nav-arrow">›</span>
            </a>
        `;
    }).join('');

    const mobileHTML = `
        <!-- BARRA SUPERIOR MOBILE FIXA -->
        <header class="mobile-top-bar" id="mobileTopBar">
            <button class="mobile-menu-trigger" onclick="abrirMenuLateralMobile()" aria-label="Abrir Menu de Abas" title="Menu de Navegação">
                <span class="hamburger-icon">☰</span>
            </button>
            <a href="index.html" class="mobile-top-brand" title="Início Overcritic">
                <span class="mobile-top-title">OVERCRITIC</span>
            </a>
            <div class="mobile-top-actions">
                <button class="mobile-version-badge" onclick="abrirChangelogModal()" title="Versão oficial - Toque para ver novidades">
                    <span>🚀 ${displayVersion}</span>
                </button>
                <button class="mobile-top-theme-btn" onclick="alternarTemaGlobal()" aria-label="Alternar Modo Claro e Escuro" title="Tema">
                    <span class="mobile-theme-icon">🌓</span>
                </button>
            </div>
        </header>

        <!-- BACKDROP DESFOCADO PARA FECHAR O MENU -->
        <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop" onclick="fecharMenuLateralMobile()"></div>

        <!-- ABA LATERAL MÓVEL DESLIZANTE (DRAWER) -->
        <aside class="mobile-drawer" id="mobileDrawer">
            <div class="mobile-drawer-header">
                <div class="mobile-drawer-brand">
                    <span class="drawer-logo-icon">🎬</span>
                    <div>
                        <div class="drawer-title">OVERCRITIC</div>
                        <div class="drawer-version-pill" onclick="abrirChangelogModal()" title="Toque para ver novidades da versão">
                            <span>${displayVersion}</span> <span class="drawer-badge-mini">Estável</span>
                        </div>
                    </div>
                </div>
                <button class="mobile-drawer-close" onclick="fecharMenuLateralMobile()" aria-label="Fechar Menu" title="Tirar da frente das abas">
                    ✕
                </button>
            </div>

            <div class="mobile-drawer-hint">
                <span>👈 Toque no ✕ ou deslize para fechar</span>
            </div>

            <!-- NAVEGAÇÃO COMPLETA DAS ABAS -->
            <nav class="mobile-drawer-nav">
                ${navLinksHTML}
            </nav>

            <!-- RODAPÉ DO DRAWER -->
            <div class="mobile-drawer-footer">
                <button class="drawer-footer-theme-btn" onclick="alternarTemaGlobal()">
                    <span id="mobileDrawerThemeIcon">🌓</span>
                    <span id="mobileDrawerThemeText">Alternar Modo Claro / Escuro</span>
                </button>
                <div class="drawer-footer-version" onclick="abrirChangelogModal()">
                    <span>Overcritic ${displayVersion} • Ver Notas da Versão</span>
                </div>
            </div>
        </aside>
    `;

    document.body.insertAdjacentHTML('afterbegin', mobileHTML);
    atualizarIconesTema();

    // Suporte a gestos touch (swipe da borda esquerda para abrir, swipe para fechar)
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 768) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (window.innerWidth > 768) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Se o drawer estiver fechado e arrastou a partir da borda esquerda para a direita (> 50px)
        const drawer = document.getElementById('mobileDrawer');
        const isDrawerOpen = drawer && drawer.classList.contains('active');

        if (!isDrawerOpen && touchStartX < 35 && deltaX > 50 && Math.abs(deltaY) < 60) {
            abrirMenuLateralMobile();
        } else if (isDrawerOpen && deltaX < -50 && Math.abs(deltaY) < 60) {
            // Se o drawer estiver aberto e arrastou para a esquerda
            fecharMenuLateralMobile();
        }
    }, { passive: true });

    // Fecha ao pressionar ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharMenuLateralMobile();
    });
}

/**
 * Inicialização automática na carga da página
 */
function inicializarSistemaVersoes() {
    const displayVersion = `v${OVERCRITIC_APP.version}`;

    // 1. Atualiza todos os elementos marcados para receber a versão
    document.querySelectorAll('[data-overcritic-version], .site-version-text, .overcritic-version-badge').forEach(el => {
        el.textContent = displayVersion;
    });

    // 2. Insere a tag de versão na sidebar desktop se existir e se ainda não tiver a tag
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.getElementById('sidebarVersionPill')) {
        const bottomArea = sidebar.querySelector('.sidebar-bottom') || sidebar;
        const versionPill = document.createElement('div');
        versionPill.id = 'sidebarVersionPill';
        versionPill.className = 'sidebar-version-pill';
        versionPill.title = `Overcritic ${displayVersion} - Clique para ver novidades`;
        versionPill.innerHTML = `<span>${displayVersion}</span>`;
        versionPill.onclick = abrirChangelogModal;

        if (sidebar.querySelector('.sidebar-bottom')) {
            sidebar.querySelector('.sidebar-bottom').appendChild(versionPill);
        } else {
            sidebar.appendChild(versionPill);
        }
    }

    // 3. Inicializa a barra superior mobile e o Mobile Drawer lateral deslizante
    inicializarMobileDrawer();

    // 4. Cria o modal no DOM antecipadamente
    criarModalChangelogDOM();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaVersoes);
} else {
    inicializarSistemaVersoes();
}

