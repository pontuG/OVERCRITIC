// supabaseClient.js - Conexão do Overcritic com o Supabase
const SUPABASE_URL = 'https://lvvihjivyniqsmihnkof.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fMxN0GsGQDTuvQjc9wvPzw_yYA9efcd';

// Configuração Oficial do Administrador do Overcritic
window.OVERCRITIC_ADMIN = {
    uid: '958a1b5f-4151-42c7-97f2-caf0e59fbb86',
    email: 'mesquitagabriel255@gmail.com'
};

window.isAdminUser = function(user) {
    if (!user) {
        const storedAdmin = localStorage.getItem('overcritic_is_admin');
        const storedEmail = localStorage.getItem('overcritic_user_email');
        const storedUid = localStorage.getItem('overcritic_user_id');
        return storedAdmin === 'true' || storedEmail === window.OVERCRITIC_ADMIN.email || storedUid === window.OVERCRITIC_ADMIN.uid;
    }
    const uid = typeof user === 'string' ? user : (user.id || user.uid);
    const email = typeof user === 'object' ? user.email : null;
    return uid === window.OVERCRITIC_ADMIN.uid || email === window.OVERCRITIC_ADMIN.email;
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
        return JSON.parse(localStorage.getItem('overcritic_deleted_records') || '[]');
    } catch (e) {
        return [];
    }
};

window.isItemExcluidoGlobal = function(tipo, id, titulo, autor) {
    if (!id && !titulo) return false;
    const excluidos = window.obterRegistrosExcluidosGlobal();
    if (!excluidos || excluidos.length === 0) return false;

    const strId = id !== undefined && id !== null ? String(id).trim() : '';
    const numId = strId ? Number(strId.replace(/\D/g, '')) : null;
    const cleanTipo = (tipo || '').toLowerCase().trim();
    const cleanTitulo = (titulo || '').toLowerCase().trim();
    const cleanAutor = (autor || '').toLowerCase().trim();

    return excluidos.some(ex => {
        // 1. Checa por ID correspondente
        if (strId && ex.id) {
            if (String(ex.id).trim() === strId) return true;
            const exNum = Number(String(ex.id).replace(/\D/g, ''));
            if (numId && exNum && numId === exNum) return true;
        }

        // 2. Checa por Tipo + Título (+ Autor se houver)
        if (cleanTitulo && ex.titulo) {
            const tipoBate = !cleanTipo || !ex.tipo || cleanTipo === ex.tipo;
            const tituloBate = cleanTitulo === ex.titulo;
            if (tipoBate && tituloBate) {
                if (cleanAutor && ex.autor && ex.autor !== 'anônimo' && ex.autor !== 'gamer' && cleanAutor !== 'anônimo' && cleanAutor !== 'gamer') {
                    if (cleanAutor === ex.autor) return true;
                } else {
                    return true;
                }
            }
        }

        return false;
    });
};

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

