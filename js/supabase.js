// js/supabase.js
// Configuração do Supabase

// ⚠️ IMPORTANTE: Substitua pelas suas credenciais do Supabase!
// Encontre-as em: Supabase Dashboard → Settings → API

const SUPABASE_URL = 'https://ioihmlhcrpfpvfxykbjh.supabase.co'; // ← Sua Project URL
const SUPABASE_ANON_KEY = 'sb_publishable_pZquzlvnR4ruE1EeV5JiTw_M2_kcQFj'; // ← Sua anon public key

// Criar cliente Supabase
let supabaseClient = null;

// Função para inicializar Supabase
function initSupabase() {
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao criar cliente Supabase:', error);
      return false;
    }
  }
  return false;
}

// Tentar inicializar imediatamente
if (!initSupabase()) {
  // Se não estiver disponível, aguardar o script carregar
  if (typeof window !== 'undefined') {
    // Aguardar o evento load
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => {
        if (!initSupabase()) {
          // Última tentativa após um delay
          setTimeout(() => initSupabase(), 500);
        }
      });
    } else {
      // Documento já carregado, tentar novamente
      setTimeout(() => {
        if (!initSupabase()) {
          console.error('❌ Supabase não está disponível. Verifique se o script foi carregado no HTML.');
        }
      }, 100);
    }
  }
}

export const supabase = supabaseClient;

// Função helper para obter usuário atual
export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}

// Função helper para obter sessão
export async function getSession() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
}

// Função helper para verificar se está autenticado
export async function isAuthenticatedSupabase() {
  const session = await getSession();
  return !!session;
}

