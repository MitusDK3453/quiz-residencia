// js/supabase.js
// Configuração do Supabase - VERSÃO CORRIGIDA

// ⚠️ IMPORTANTE: Você precisa das credenciais CORRETAS do seu projeto Supabase
// Acesse: https://supabase.com/dashboard/project/SEU_PROJETO/settings/api
// Copie: Project URL e anon/public key

const SUPABASE_URL = 'https://ioihmlhcrpfpvfxykbjh.supabase.co';
// ❌ ESTA CHAVE ESTÁ ERRADA! Use a chave "anon public" do seu dashboard
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaWhtbGhjcnBmcHZmeHlrYmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3Njk3MzAsImV4cCI6MjA1MTM0NTczMH0.SEU_TOKEN_AQUI';

// Verificar se o SDK está carregado
if (!window.supabase) {
  console.error('❌ Supabase SDK não está carregado!');
  console.error('Adicione no index.html: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
}

// Criar cliente Supabase
export const supabase = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
) || null;

// Verificar se o cliente foi criado com sucesso
if (supabase) {
  console.log('✅ Cliente Supabase criado com sucesso');
} else {
  console.error('❌ Falha ao criar cliente Supabase');
}

// ===============================
// HELPERS DE AUTENTICAÇÃO
// ===============================

export async function getCurrentUser() {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}

export async function getSession() {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
}

export async function isAuthenticatedSupabase() {
  const session = await getSession();
  return !!session;
}

// ===============================
// LISTENER DE MUDANÇAS DE AUTH
// ===============================

export function onAuthStateChange(callback) {
  if (!supabase) return () => {};
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      callback(event, session);
    }
  );
  
  return () => subscription.unsubscribe();
}