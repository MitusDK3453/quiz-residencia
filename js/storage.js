// js/storage.js - FINAL COM returning: 'minimal'

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

    if (API_CONFIG.USE_SUPABASE && supabase && currentUserId !== 'default') {
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
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
        console.log('📝 Nenhum progresso encontrado. Criando row inicial...');
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
          }, { returning: 'minimal' }); // <-- ESSENCIAL

        if (insertError) {
          console.error('Erro ao criar row inicial:', insertError);
        } else {
          console.log('✅ Row inicial criado');
        }
        currentUser = { ...DEFAULT_USER };
      }
    } else {
      const saved = localStorage.getItem(storageKey);
      currentUser = saved ? JSON.parse(saved) : { ...DEFAULT_USER };
    }

    currentUser.progressoDiario ||= {};
    currentUser.totalQuestoes ||= 0;
    currentUser.totalAcertos ||= 0;
    currentUser.questoesErradas ||= [];
    currentUser.questoesAcertadas ||= [];
    currentUser.historicoQuestoes ||= [];
    currentUser.estatisticasPorAssunto ||= {};

    localStorage.setItem(storageKey, JSON.stringify(currentUser));

  } catch (e) {
    console.error('Erro ao carregar usuário:', e);
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
      .upsert({
        user_id: currentUserId,
        total_questoes: currentUser.totalQuestoes || 0,
        total_acertos: currentUser.totalAcertos || 0,
        progresso_diario: currentUser.progressoDiario || {},
        questoes_erradas: currentUser.questoesErradas || [],
        questoes_acertadas: currentUser.questoesAcertadas || [],
        historico_questoes: currentUser.historicoQuestoes || [],
        estatisticas_por_assunto: currentUser.estatisticasPorAssunto || {}
      }, { returning: 'minimal' }); // <-- ESSENCIAL

    if (error) console.error('Erro ao salvar:', error);
    else console.log('✅ Salvo no Supabase');
  }
}

export function getUser() {
  return currentUser || { ...DEFAULT_USER };
}

export function setCurrentUserId(userId) {
  currentUserId = userId ? userId.toString() : null;
  loadUser();
}

export function resetProgress() {
  if (confirm("Resetar progresso?")) {
    currentUser = { ...DEFAULT_USER };
    saveUser();
  }
}