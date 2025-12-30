// js/ranking.js
// Página de ranking de usuários - Versão corrigida (sem join problemático)

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { getUser } from './storage.js';
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const appDiv = document.getElementById("app");

export async function renderRanking() {
  setPaginaAtual('ranking');
  appDiv.className = 'ranking-page';
  
  let ranking = [];
  
  if (API_CONFIG.USE_SUPABASE && supabase) {
    ranking = await obterRankingSupabase();
  } else {
    ranking = obterRankingMockado();
  }
  
  const user = getUser();
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = userData.id || 'local';

  appDiv.innerHTML = `
    <h1 class="page-title">🏆 Ranking</h1>
    
    <div class="ranking-container">
      <div class="ranking-header">
        <p class="ranking-description">Top usuários que mais responderam questões</p>
      </div>
      
      <div class="ranking-list">
        ${ranking.length > 0 ? ranking.map((usuario, index) => {
          const isCurrentUser = usuario.id === userId;
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
          const posicao = index + 1;
          
          return `
            <div class="ranking-item ${isCurrentUser ? 'ranking-item-current' : ''}">
              <div class="ranking-posicao">
                ${medal || posicao}
              </div>
              <div class="ranking-foto">
                <img src="${usuario.foto || 'https://via.placeholder.com/50?text=U'}" alt="${usuario.nome}">
              </div>
              <div class="ranking-info">
                <h3>${usuario.nome} ${isCurrentUser ? '<span class="ranking-you">(Você)</span>' : ''}</h3>
                <p>${usuario.totalQuestoes} questões • ${usuario.percentual}% acertos</p>
              </div>
            </div>
          `;
        }).join('') : '<p style="text-align:center; color:#64748b;">Nenhum dado no ranking ainda.</p>'}
      </div>
    </div>
  `;
  
  renderMenuLateral();
}

async function obterRankingSupabase() {
  try {
    // Query simples: só user_progress, sem join com profiles
    const { data, error } = await supabase
      .from('user_progress')
      .select('user_id, total_questoes, total_acertos')
      .gt('total_questoes', 0)
      .order('total_questoes', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao carregar ranking do Supabase:', error);
      return obterRankingMockado();
    }

    // Busca nomes dos usuários em batch (opcional: pode pular se não tiver profiles completos)
    const userIds = data.map(item => item.user_id);
    let profilesMap = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach(p => {
          profilesMap[p.id] = p.name || 'Usuário';
        });
      }
    }

    return data.map(item => ({
      id: item.user_id,
      nome: profilesMap[item.user_id] || 'Usuário',
      foto: null, // pode adicionar coluna foto em profiles depois
      totalQuestoes: item.total_questoes || 0,
      totalAcertos: item.total_acertos || 0,
      percentual: item.total_questoes > 0 
        ? Math.round((item.total_acertos / item.total_questoes) * 100)
        : 0
    }));

  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    return obterRankingMockado();
  }
}

function obterRankingMockado() {
  const user = getUser();
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  return [
    {
      id: userData.id || 'local',
      nome: userData.name || userData.nome || 'Você',
      totalQuestoes: user.totalQuestoes || 0,
      totalAcertos: user.totalAcertos || 0,
      percentual: user.totalQuestoes > 0 ? Math.round((user.totalAcertos / user.totalQuestoes) * 100) : 0,
      foto: null
    }
  ].concat([
    { id: 2, nome: 'João Silva', totalQuestoes: 450, totalAcertos: 380, percentual: 84 },
    { id: 3, nome: 'Maria Santos', totalQuestoes: 420, totalAcertos: 360, percentual: 86 },
    { id: 4, nome: 'Pedro Costa', totalQuestoes: 380, totalAcertos: 320, percentual: 84 },
    { id: 5, nome: 'Ana Oliveira', totalQuestoes: 350, totalAcertos: 300, percentual: 86 }
  ]).sort((a, b) => b.totalQuestoes - a.totalQuestoes);
}