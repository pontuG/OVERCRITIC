// supabaseClient.js - Conexão do Overcritic com o Supabase
const SUPABASE_URL = 'https://lvvihjivyniqsmihnkof.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fMxN0GsGQDTuvQjc9wvPzw_yYA9efcd';

// Configuração Oficial de Moderação do Overcritic (Credencial Protegida)
const _ADMIN_UID = '958a1b5f-4151-42c7-97f2-caf0e59fbb86';
const _isAdminEmail = (email) => {
    if (!email) return false;
    const clean = String(email).trim().toLowerCase();
    return clean === atob('bWVzcXVpdGFnYWJyaWVsMjU1QGdtYWlsLmNvbQ==');
};

window.OVERCRITIC_ADMIN = {
    uid: _ADMIN_UID,
    username: 'pontuG'
};

window.isAdminUser = function(user) {
    if (!user) {
        const storedEmail = (localStorage.getItem('overcritic_user_email') || '').toLowerCase();
        const storedUid = localStorage.getItem('overcritic_user_id');
        const storedUser = (localStorage.getItem('overcritic_currentUser') || '').toLowerCase();
        return storedUid === _ADMIN_UID || _isAdminEmail(storedEmail) || storedUser === 'pontug';
    }
    const uid = typeof user === 'string' ? user : (user.id || user.uid);
    const email = typeof user === 'object' ? (user.email || '').toLowerCase() : null;
    const name = typeof user === 'object' ? (user.user_metadata?.username || user.username || '').toLowerCase() : (typeof user === 'string' ? user.toLowerCase() : '');
    return uid === _ADMIN_UID || _isAdminEmail(email) || name === 'pontug';
};

// Inicializa o cliente Supabase disponível globalmente com suporte a fluxo de autenticação universal (implicit)
window.sbClient = (window.supabase && typeof window.supabase.createClient === 'function')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            flowType: 'implicit',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null;

if (window.sbClient) {
    console.log('⚡ [Overcritic] Conexão com Supabase inicializada com sucesso!');
} else {
    console.warn('⚠️ [Overcritic] Biblioteca do Supabase não detectada.');
}

/* ══════════════════════════════════════════════════════════════════
   GERENCIADOR GLOBAL DE EXCLUSÃO & MODERAÇÃO (PERSISTÊNCIA DEFINITIVA)
   Garante que itens deletados por moderador/usuário nunca retornem
══════════════════════════════════════════════════════════════════ */
window.obterRegistrosExcluidosGlobal = function() {
    try {
        let lista = JSON.parse(localStorage.getItem('overcritic_deleted_records') || '[]');
        if (Array.isArray(lista)) {
            return lista;
        }
        return [];
    } catch (e) {
        return [];
    }
};

window.isItemExcluidoGlobal = function(tipo, id, titulo, autor) {
    if (!id && !titulo) return false;
    const excluidos = window.obterRegistrosExcluidosGlobal();
    if (!excluidos || excluidos.length === 0) return false;

    const strId = id !== undefined && id !== null ? String(id).trim() : '';
    const cleanTipo = (tipo || '').toLowerCase().trim();
    const cleanTitulo = (titulo || '').toLowerCase().trim();
    const cleanAutor = (autor || '').toLowerCase().trim();

    return excluidos.some(ex => {
        const exAutor = (ex.autor || '').toLowerCase().trim();
        const exId = ex.id !== undefined && ex.id !== null ? String(ex.id).trim() : '';
        const exTitulo = (ex.titulo || '').toLowerCase().trim();
        const exTipo = (ex.tipo || '').toLowerCase().trim();

        // 1. Checa por ID correspondente (método oficial e seguro)
        if (strId && exId && strId === exId) {
            return true;
        }

        // 2. Se o registro atual possuir um ID diferente do ID que foi excluído, NUNCA exclua por título!
        // Pois trata-se de um NOVO registro legítimo criado pelo usuário.
        if (strId && exId && strId !== exId) {
            return false;
        }

        // 3. Fallback apenas se o registro sendo verificado NÃO tiver ID definido
        if (!strId && cleanTitulo && exTitulo && cleanTitulo === exTitulo && cleanAutor && exAutor && cleanAutor === exAutor) {
            if (!cleanTipo || !exTipo || cleanTipo === exTipo) {
                return true;
            }
        }

        return false;
    });
};

window.removerExclusaoGlobal = function(tipo, id, titulo, autor) {
    try {
        const excluidos = window.obterRegistrosExcluidosGlobal();
        if (!excluidos || excluidos.length === 0) return;
        const strId = id !== undefined && id !== null ? String(id).trim() : '';
        const cleanTipo = (tipo || '').toLowerCase().trim();
        const cleanTitulo = (titulo || '').toLowerCase().trim();
        const cleanAutor = (autor || '').toLowerCase().trim();

        const filtrados = excluidos.filter(e => {
            const exId = e.id !== undefined && e.id !== null ? String(e.id).trim() : '';
            const exTipo = (e.tipo || '').toLowerCase().trim();
            const exTitulo = (e.titulo || '').toLowerCase().trim();
            const exAutor = (e.autor || '').toLowerCase().trim();

            if (strId && exId && strId === exId) return false;
            if (cleanTitulo && exTitulo && cleanTitulo === exTitulo) {
                if (!cleanTipo || !exTipo || cleanTipo === exTipo) {
                    if (!cleanAutor || !exAutor || cleanAutor === exAutor) {
                        return false; // Remove o bloqueio porque o item está sendo ativamente cadastrado/recriado!
                    }
                }
            }
            return true;
        });

        localStorage.setItem('overcritic_deleted_records', JSON.stringify(filtrados));
    } catch(e) {}
};

// Higienização automática: desobstrui títulos legítimos que foram bloqueados por re-cadastro
try {
    const excluidosInit = window.obterRegistrosExcluidosGlobal();
    if (Array.isArray(excluidosInit) && excluidosInit.length > 0) {
        const corrigidos = excluidosInit.filter(e => {
            const t = (e.titulo || '').toLowerCase().trim();
            return t !== 'v rising';
        });
        if (corrigidos.length !== excluidosInit.length) {
            localStorage.setItem('overcritic_deleted_records', JSON.stringify(corrigidos));
        }
    }
} catch(e) {}

window.limparItemDeTodosStorages = function(tipo, id, titulo, autor) {
    // 1. Jogos locais
    ['overcritic_reviews', 'overcritic_jogos'].forEach(key => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const limpos = parsed.filter(j => !window.isItemExcluidoGlobal('jogo', j.id, j.titulo, j.autor));
                    localStorage.setItem(key, JSON.stringify(limpos));
                }
            }
        } catch(e) {}
    });

    // 2. Mídias locais (Filmes, Séries, Animes)
    ['OVERCRITIC_MIDIAS', 'overcritic_midias'].forEach(key => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const limpos = parsed.filter(m => !window.isItemExcluidoGlobal('midia', m.id, m.title || m.titulo, m.autor));
                    localStorage.setItem(key, JSON.stringify(limpos));
                }
            }
        } catch(e) {}
    });

    // 3. Platinas locais
    ['overcritic_platinas_feed', 'overcritic_platinas', 'platinasSalvas', 'overcritic_minhas_platinas'].forEach(key => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const limpos = parsed.filter(p => !window.isItemExcluidoGlobal('platina', p.id, p.title || p.titulo, p.user || p.usuario));
                    localStorage.setItem(key, JSON.stringify(limpos));
                }
            }
        } catch(e) {}
    });
};

window.registrarExclusaoGlobal = async function(tipo, id, titulo, autor) {
    const cleanTipo = (tipo || '').toLowerCase().trim();
    const cleanTitulo = (titulo || '').toLowerCase().trim();
    const cleanAutor = (autor || '').toLowerCase().trim();
    const strId = id !== undefined && id !== null ? String(id).trim() : '';

    // Adiciona na lista persistente de excluídos (Tombstones)
    const excluidos = window.obterRegistrosExcluidosGlobal();
    const jaExiste = excluidos.some(e => 
        (strId && String(e.id).trim() === strId) || 
        (cleanTitulo && e.titulo === cleanTitulo && (!cleanTipo || e.tipo === cleanTipo))
    );

    if (!jaExiste) {
        excluidos.push({
            id: strId,
            tipo: cleanTipo,
            titulo: cleanTitulo,
            autor: cleanAutor,
            dataExclusao: Date.now()
        });
        try {
            localStorage.setItem('overcritic_deleted_records', JSON.stringify(excluidos));
        } catch(e) {}
    }

    // Remove imediatamente de todos os storages do navegador
    window.limparItemDeTodosStorages(cleanTipo, id, titulo, autor);

    // Remove do Supabase com múltiplas estratégias
    if (window.sbClient) {
        let tabela = 'reviews_jogos';
        let colTitulo = 'titulo';
        let colAutor = 'autor';

        if (cleanTipo === 'midia') {
            tabela = 'reviews_midias';
            colTitulo = 'title';
            colAutor = 'autor';
        } else if (cleanTipo === 'platina') {
            tabela = 'platinas';
            colTitulo = 'titulo';
            colAutor = 'usuario';
        }

        const numId = Number(strId.replace(/\D/g, '')) || null;

        // Estratégia A: Deletar por ID numérico
        if (numId) {
            try { await window.sbClient.from(tabela).delete().eq('id', numId); } catch(e) {}
        }
        // Estratégia B: Deletar por ID string
        if (strId) {
            try { await window.sbClient.from(tabela).delete().eq('id', strId); } catch(e) {}
        }
        // Estratégia C: Deletar por Título (+ Autor se houver)
        if (cleanTitulo) {
            try {
                let q = window.sbClient.from(tabela).delete().ilike(colTitulo, cleanTitulo);
                if (cleanAutor && cleanAutor !== 'anônimo' && cleanAutor !== 'gamer') {
                    q = q.ilike(colAutor, cleanAutor);
                }
                await q;
            } catch(e) {}
        }
    }

    // Se houver Backend C#, chama exclusão no backend
    if (window.OvercriticApi && cleanTipo === 'jogo' && strId) {
        try { await window.OvercriticApi.excluirJogo(strId); } catch(e) {}
    }

    // Dispara evento para sincronizar abas e componentes abertos
    window.dispatchEvent(new CustomEvent('overcritic_item_excluido', {
        detail: { tipo: cleanTipo, id: strId, titulo: cleanTitulo, autor: cleanAutor }
    }));
};

