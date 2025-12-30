// js/storage.js
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

function getCurrentUserId() {
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (userData.id) return userData.id.toString();
  if (userData.email) return `email_${userData.email}`;
  return 'default';
}

function getUserStorageKey(userId) {
  return userId ? `user_${userId}` : 'currentUser';
}

export async function loadUser() {
  try {
    currentUserId = getCurrentUserId();
    const storageKey = getUserStorageKey(currentUserId);

    // Primeiro tenta carregar do Supabase (se ativado)
    if (API_CONFIG.USE_SUPABASE && supabase && currentUserId !== 'default') {
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();  // <-- Importante: evita 406 se não existir row

      if (error && error.code !== 'PGRST116') {  // Ignora erro de "0 rows"
        console.error('Erro ao carregar progresso do Supabase:', error);
      }

      if (progress) {
        currentUser = {
          ...DEFAULT_USER,
          ...progress,
          totalAcertos: progress.total_acertos || 0,
          totalQuestoes: progress.total_questoes || 0,
          progressoDiario: progress.progresso_diario || {},
          questoesErradas: progress.questoes_erradas || [],
          questoesAcertadas: progress.questoes_acertadas || [],
          historicoQuestoes: progress.historico_questoes || [],
          estatisticasPorAssunto: progress.estatisticas_por_assunto || {}
        };
        console.log('✅ Progresso carregado do Supabase');
      } else {
        // Se não existir row, cria um inicial
        console.log('📝 Nenhum progresso encontrado no Supabase. Criando row inicial...');
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({ 
            user_id: currentUserId,
            total_questoes: 0,
            total_acertos: 0,
            progresso_diario: {},
            questoes_erradas: [],
            questoes_acertadas: [],
            historico_questoes: [],
            estatisticas_por_assunto: {}
          });

        if (insertError) {
          console.error('Erro ao criar row inicial no Supabase:', insertError);
        } else {
          currentUser = { ...DEFAULT_USER };
          console.log('✅ Row inicial criado no Supabase');
        }
      }
    } else {
      // Fallback LocalStorage
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        currentUser = JSON.parse(saved);
      } else {
        const oldData = localStorage.getItem("currentUser");
        if (oldData) {
          currentUser = JSON.parse(oldData);
        } else {
          currentUser = { ...DEFAULT_USER };
        }
      }
    }

    // Garante inicialização de campos
    if (!currentUser.progressoDiario) currentUser.progressoDiario = {};
    if (!currentUser.totalQuestoes) currentUser.totalQuestoes = 0;
    if (!currentUser.totalAcertos) currentUser.totalAcertos = 0;
    if (!Array.isArray(currentUser.questoesErradas)) currentUser.questoesErradas = [];
    if (!Array.isArray(currentUser.questoesAcertadas)) currentUser.questoesAcertadas = [];
    if (!Array.isArray(currentUser.historicoQuestoes)) currentUser.historicoQuestoes = [];
    if (!currentUser.estatisticasPorAssunto) currentUser.estatisticasPorAssunto = {};

    // Salva backup local
    localStorage.setItem(storageKey, JSON.stringify(currentUser));

  } catch (e) {
    console.error('Erro crítico ao carregar usuário:', e);
    currentUser = { ...DEFAULT_USER };
  }

  return currentUser;
}

export async function saveUser() {
  if (!currentUser) return;

  const storageKey = getUserStorageKey(currentUserId);
  localStorage.setItem(storageKey, JSON.stringify(currentUser));

  if (API_CONFIG.USE_SUPABASE && supabase && currentUserId !== 'default') {
    const { error } = await supabase
      .from('user_progress')
      .upsert({  // <-- Upsert para evitar conflitos
        user_id: currentUserId,
        total_questoes: currentUser.totalQuestoes || 0,
        total_acertos: currentUser.totalAcertos || 0,
        progresso_diario: currentUser.progressoDiario || {},
        questoes_erradas: currentUser.questoesErradas || [],
        questoes_acertadas: currentUser.questoesAcertadas || [],
        historico_questoes: currentUser.historicoQuestoes || [],
        estatisticas_por_assunto: currentUser.estatisticasPorAssunto || {}
      });

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
    } else {
      console.log('✅ Progresso salvo no Supabase');
    }
  }
}

export function getUser() {
  return currentUser || { ...DEFAULT_USER };
}

export function setCurrentUserId(userId) {
  currentUserId = userId ? userId.toString() : null;
  loadUser();  // Recarrega dados do novo usuário
}

export function resetProgress() {
  if (confirm("Tem certeza que deseja resetar todo o progresso?")) {
    currentUser = { ...DEFAULT_USER };
    saveUser();
    alert("Progresso resetado!");
  }
}