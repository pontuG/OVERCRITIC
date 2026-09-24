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
    version: "26.09.3",
    year: "2026",
    month: "09",
    build: 3,
    releaseDate: "24/09/2026",
    status: "Versão Estável",
    codename: "Neon Genesis & Titanium",
    author: "pontuG (Admin)",
    changelog: [
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
 * Inicialização automática na carga da página
 */
function inicializarSistemaVersoes() {
    const displayVersion = `v${OVERCRITIC_APP.version}`;

    // 1. Atualiza todos os elementos marcados para receber a versão
    document.querySelectorAll('[data-overcritic-version], .site-version-text, .overcritic-version-badge').forEach(el => {
        el.textContent = displayVersion;
    });

    // 2. Insere a tag de versão na sidebar se existir e se ainda não tiver a tag
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

    // 3. Cria o modal no DOM antecipadamente
    criarModalChangelogDOM();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaVersoes);
} else {
    inicializarSistemaVersoes();
}
