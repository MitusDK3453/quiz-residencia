// js/storage.js
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const DEFAULT_USER = {
  nome: "Usuário",
  totalAcertos: 0,
  totalQuestoes: 0,
  progressoDiario: {},
  metaSemanal: 50,
  questoesErradas: [], // IDs das questões erradas
  questoesAcertadas: [], // IDs das questões acertadas
  historicoQuestoes: [], // Histórico completo: {questaoId, acertou, data, assunto}
  estatisticasPorAssunto: {} // {assunto: {total: 0, acertos: 0, erros: 0}}
};

let currentUser = null;
let currentUserId = null;

// Obtém o ID do usuário atual (do token ou localStorage)
function getCurrentUserId() {
  // Tenta obter do localStorage primeiro
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (userData.id) {
    return userData.id.toString();
  }
  
  // Se não tiver ID, usa email como identificador temporário
  if (userData.email) {
    return `email_${userData.email}`;
  }
  
  // Fallback: usa 'default' para usuários sem autenticação
  return 'default';
}

// Obtém a chave do localStorage baseada no ID do usuário
function getUserStorageKey(userId) {
  return userId ? `user_${userId}` : 'currentUser';
}

export async function loadUser() {
  try {
    // Obtém ID do usuário atual
    currentUserId = getCurrentUserId();
    const storageKey = getUserStorageKey(currentUserId);
    
    // Tenta carregar dados do usuário específico
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      currentUser = JSON.parse(saved);
    } else {
      // Se não encontrar, tenta carregar do 'currentUser' antigo (compatibilidade)
      const oldData = localStorage.getItem("currentUser");
      if (oldData) {
        const oldUser = JSON.parse(oldData);
        // Se o usuário antigo tem email/ID diferente, cria novo usuário
        if (oldUser.email && oldUser.email !== currentUserId.replace('email_', '')) {
          currentUser = { ...DEFAULT_USER };
        } else {
          currentUser = oldUser;
        }
      } else {
        currentUser = { ...DEFAULT_USER };
      }
    }
    
    // Se usar Supabase, carrega progresso do servidor
    if (API_CONFIG.USE_SUPABASE && supabase && currentUserId && currentUserId !== 'default' && !currentUserId.startsWith('email_')) {
      try {
        const { data: progress, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUserId)
          .single();

        if (!error && progress) {
          // Mescla dados do servidor com dados locais
          currentUser = {
            ...currentUser,
            totalQuestoes: progress.total_questoes || currentUser.totalQuestoes || 0,
            totalAcertos: progress.total_acertos || currentUser.totalAcertos || 0,
            progressoDiario: progress.progresso_diario || currentUser.progressoDiario || {},
            metaSemanal: progress.meta_semanal || currentUser.metaSemanal || 50,
            questoesErradas: progress.questoes_erradas || currentUser.questoesErradas || [],
            questoesAcertadas: progress.questoes_acertadas || currentUser.questoesAcertadas || [],
            historicoQuestoes: progress.historico_questoes || currentUser.historicoQuestoes || [],
            estatisticasPorAssunto: progress.estatisticas_por_assunto || currentUser.estatisticasPorAssunto || {}
          };
        }
      } catch (error) {
        console.error('Erro ao carregar progresso do Supabase:', error);
      }
    }
    
    // Inicializa campos obrigatórios
    if (!currentUser.progressoDiario) currentUser.progressoDiario = {};
    if (typeof currentUser.totalQuestoes !== 'number') currentUser.totalQuestoes = 0;
    if (typeof currentUser.totalAcertos !== 'number') currentUser.totalAcertos = 0;
    if (!Array.isArray(currentUser.questoesErradas)) currentUser.questoesErradas = [];
    if (!Array.isArray(currentUser.questoesAcertadas)) currentUser.questoesAcertadas = [];
    if (!Array.isArray(currentUser.historicoQuestoes)) currentUser.historicoQuestoes = [];
    if (!currentUser.estatisticasPorAssunto) currentUser.estatisticasPorAssunto = {};
    
    // Salva na chave correta
    saveUser();
  } catch (e) {
    currentUser = { ...DEFAULT_USER };
  }
  return currentUser;
}

export async function saveUser() {
  if (currentUser) {
    // Atualiza o ID se necessário
    if (!currentUserId) {
      currentUserId = getCurrentUserId();
    }
    
    const storageKey = getUserStorageKey(currentUserId);
    
    // Salva na chave específica do usuário (localStorage)
    localStorage.setItem(storageKey, JSON.stringify(currentUser));
    
    // Também salva em 'currentUser' para compatibilidade
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    
    // Sincronizar com Supabase se estiver ativo
    if (API_CONFIG.USE_SUPABASE && supabase && currentUserId && currentUserId !== 'default' && !currentUserId.startsWith('email_')) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: currentUserId,
            total_questoes: currentUser.totalQuestoes || 0,
            total_acertos: currentUser.totalAcertos || 0,
            progresso_diario: currentUser.progressoDiario || {},
            meta_semanal: currentUser.metaSemanal || 50,
            questoes_erradas: currentUser.questoesErradas || [],
            questoes_acertadas: currentUser.questoesAcertadas || [],
            historico_questoes: currentUser.historicoQuestoes || [],
            estatisticas_por_assunto: currentUser.estatisticasPorAssunto || {}
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('❌ Erro ao sincronizar progresso:', error);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar:', error);
      }
    }
  }
}

export function getUser() {
  return currentUser;
}

// Define o ID do usuário atual (chamado após login/registro)
export function setCurrentUserId(userId) {
  currentUserId = userId ? userId.toString() : null;
  // Recarrega os dados do novo usuário
  loadUser();
}

export function resetProgress() {
  if (confirm("Tem certeza que deseja resetar todo o progresso?")) {
    currentUser = { ...DEFAULT_USER };
    saveUser();
  }
}