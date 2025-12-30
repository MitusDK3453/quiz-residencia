// js/ranking.js
// Página de ranking de usuários

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { getUser } from './storage.js';
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const appDiv = document.getElementById("app");

export async function renderRanking() {
  setPaginaAtual('ranking');
  appDiv.className = 'ranking-page';
  
  // Buscar ranking
  let ranking;
  if (API_CONFIG.USE_SUPABASE && supabase) {
    ranking = await obterRankingSupabase();
  } else {
    ranking = obterRankingMockado();
  }
  
  const user = getUser();
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = userData.id || 1;
  
  appDiv.innerHTML = `
    <h1 class="page-title">🏆 Ranking</h1>
    
    <div class="ranking-container">
      <div class="ranking-header">
        <p class="ranking-description">Top usuários que mais responderam questões</p>
      </div>
      
      <div class="ranking-list">
        ${ranking.map((usuario, index) => {
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
                <p>${usuario.totalQuestoes} questões respondidas</p>
              </div>
              <div class="ranking-stats">
                <div class="stat-item">
                  <span class="stat-label">Acertos</span>
                  <span class="stat-value">${usuario.totalAcertos}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">% Acerto</span>
                  <span class="stat-value">${usuario.percentual}%</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="ranking-footer">
        <p class="ranking-note">💡 O ranking é atualizado em tempo real</p>
      </div>
    </div>
  `;
  
  renderMenuLateral();
}

async function obterRankingSupabase() {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        total_questoes,
        total_acertos,
        profiles:user_id (
          name,
          foto
        )
      `)
      .gt('total_questoes', 0)
      .order('total_questoes', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao carregar ranking:', error);
      return obterRankingMockado();
    }

    return data.map(item => ({
      id: item.user_id,
      nome: item.profiles?.name || 'Usuário',
      foto: item.profiles?.foto || null,
      totalQuestoes: item.total_questoes,
      totalAcertos: item.total_acertos,
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
      id: userData.id || 1,
      nome: userData.name || userData.nome || 'Você',
      totalQuestoes: user.totalQuestoes || 0,
      totalAcertos: user.totalAcertos || 0,
      percentual: user.totalQuestoes > 0 ? Math.round((user.totalAcertos / user.totalQuestoes) * 100) : 0,
      foto: userData.foto || ''
    },
    {
      id: 2,
      nome: 'João Silva',
      totalQuestoes: 450,
      totalAcertos: 380,
      percentual: 84,
      foto: ''
    },
    {
      id: 3,
      nome: 'Maria Santos',
      totalQuestoes: 420,
      totalAcertos: 360,
      percentual: 86,
      foto: ''
    },
    {
      id: 4,
      nome: 'Pedro Costa',
      totalQuestoes: 380,
      totalAcertos: 320,
      percentual: 84,
      foto: ''
    },
    {
      id: 5,
      nome: 'Ana Oliveira',
      totalQuestoes: 350,
      totalAcertos: 300,
      percentual: 86,
      foto: ''
    }
  ].sort((a, b) => b.totalQuestoes - a.totalQuestoes);
}


