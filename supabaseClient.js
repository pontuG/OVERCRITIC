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
