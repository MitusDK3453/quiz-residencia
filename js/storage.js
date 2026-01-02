// js/storage.js - VERSÃO CORRIGIDA COMPLETA
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const DEFAULT_USER = {
  nome: "Usuário",
  totalAcertos: 0,
  totalQuestoes: 0,
  progressoDiario: {},
  metaSemanal: 50,
  questoesErradas: [],
  questoesAcertadas: [],
  historicoQuestoes: [],
  estatisticasPorAssunto: {}
};

let currentUser = null;
let currentUserId = null;

// ===============================
// GERENCIAMENTO DE ID DO USUÁRIO
// ===============================

function getCurrentUserId() {
  // 1. Tenta obter do currentUserId em memória
  if (currentUserId) return currentUserId;
  
  // 2. Tenta obter do localStorage
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (userData.id) {
    currentUserId = userData.id.toString();
    return currentUserId;
  }
  
  // 3. Fallback: usuário padrão (desenvolvimento)
  return 'default';
}

export function setCurrentUserId(userId) {
  currentUserId = userId ? userId.toString() : null;
  console.log('✅ User ID definido:', currentUserId);
}

function getUserStorageKey(userId) {
  return userId && userId !== 'default' ? `user_${userId}` : 'currentUser';
}

// ===============================
// CARREGAR USUÁRIO
// ===============================

export async function loadUser() {
  try {
    currentUserId = getCurrentUserId();
    const storageKey = getUserStorageKey(currentUserId);
    
    console.log('📥 Carregando usuário:', currentUserId);
    
    // 1. Carrega do localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      currentUser = JSON.parse(saved);
      console.log('✅ Dados locais carregados');
    } else {
      currentUser = { ...DEFAULT_USER };
      console.log('✅ Usuário novo criado');
    }
    
    // 2. Se usar Supabase, sincroniza com servidor
    if (API_CONFIG.USE_SUPABASE && supabase && currentUserId && currentUserId !== 'default') {
      try {
        console.log('🔄 Sincronizando com Supabase...');
        
        const { data: progress, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Usuário não existe no banco, criar
            console.log('📝 Criando progresso no Supabase...');
            await createUserProgress(currentUserId);
          } else {
            console.error('Erro ao carregar do Supabase:', error);
          }
        } else if (progress) {
          // Mescla dados do servidor (prioriza servidor)
          currentUser = {
            ...currentUser,
            totalQuestoes: progress.total_questoes || 0,
            totalAcertos: progress.total_acertos || 0,
            progressoDiario: progress.progresso_diario || {},
            metaSemanal: progress.meta_semanal || 50,
            questoesErradas: progress.questoes_erradas || [],
            questoesAcertadas: progress.questoes_acertadas || [],
            historicoQuestoes: progress.historico_questoes || [],
            estatisticasPorAssunto: progress.estatisticas_por_assunto || {}
          };
          console.log('✅ Dados do Supabase sincronizados');
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar com Supabase:', error);
      }
    }
    
    // 3. Garante que todos os campos existem
    currentUser = {
      ...DEFAULT_USER,
      ...currentUser
    };
    
    // 4. Salva de volta (garante consistência)
    localStorage.setItem(storageKey, JSON.stringify(currentUser));
    
    return currentUser;
  } catch (e) {
    console.error('❌ Erro ao carregar usuário:', e);
    currentUser = { ...DEFAULT_USER };
    return currentUser;
  }
}

// ===============================
// SALVAR USUÁRIO (FUNÇÃO CORRIGIDA)
// ===============================

export async function saveUser() {
  try {
    if (!currentUser) {
      console.warn('⚠️ Nenhum usuário para salvar');
      return;
    }
    
    const userId = getCurrentUserId();
    const storageKey = getUserStorageKey(userId);
    
    // 1. Salva no localStorage SEMPRE
    localStorage.setItem(storageKey, JSON.stringify(currentUser));
    console.log('💾 Salvo no localStorage:', storageKey);
    
    // 2. Se usar Supabase, salva no servidor
    if (API_CONFIG.USE_SUPABASE && supabase && userId && userId !== 'default') {
      try {
        console.log('☁️ Salvando no Supabase...');
        
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            total_questoes: currentUser.totalQuestoes || 0,
            total_acertos: currentUser.totalAcertos || 0,
            progresso_diario: currentUser.progressoDiario || {},
            meta_semanal: currentUser.metaSemanal || 50,
            questoes_erradas: currentUser.questoesErradas || [],
            questoes_acertadas: currentUser.questoesAcertadas || [],
            historico_questoes: currentUser.historicoQuestoes || [],
            estatisticas_por_assunto: currentUser.estatisticasPorAssunto || {},
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('❌ Erro ao salvar no Supabase:', error);
        } else {
          console.log('✅ Salvo no Supabase com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro ao salvar no Supabase:', error);
      }
    }
  } catch (e) {
    console.error('❌ Erro ao salvar usuário:', e);
  }
}

// ===============================
// CRIAR PROGRESSO INICIAL
// ===============================

async function createUserProgress(userId) {
  try {
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_questoes: 0,
        total_acertos: 0,
        progresso_diario: {},
        meta_semanal: 50,
        questoes_erradas: [],
        questoes_acertadas: [],
        historico_questoes: [],
        estatisticas_por_assunto: {}
      });

    if (error) {
      console.error('Erro ao criar progresso:', error);
    } else {
      console.log('✅ Progresso criado no Supabase');
    }
  } catch (error) {
    console.error('Erro ao criar progresso:', error);
  }
}

// ===============================
// GETTERS E RESETAR
// ===============================

export function getUser() {
  return currentUser || { ...DEFAULT_USER };
}

export function resetProgress() {
  if (confirm("Tem certeza que deseja resetar todo o progresso?")) {
    currentUser = { ...DEFAULT_USER };
    saveUser();
    console.log('🔄 Progresso resetado');
  }
}