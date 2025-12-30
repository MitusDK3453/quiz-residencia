// js/supabase.js
// Configuração do Supabase (VERSÃO CORRETA)

const SUPABASE_URL = 'https://ioihmlhcrpfpvfxykbjh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pZquzlvnR4ruE1EeV5JiTw_M2_kcQFj';

// ⚠️ O script do Supabase DEVE estar carregado no HTML
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

if (!window.supabase) {
  console.error('❌ Supabase SDK não carregado no HTML');
}

// Criar cliente diretamente (SEM gambiarra)
export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// HELPERS
// ===============================

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
  return data.user;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
  return data.session;
}

export async function isAuthenticatedSupabase() {
  const session = await getSession();
  return !!session;
}
