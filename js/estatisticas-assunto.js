// js/estatisticas-assunto.js
// Página de estatísticas detalhadas por assunto

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { getUser } from './storage.js';
import { questoes } from './questoes.js';

const appDiv = document.getElementById("app");

export function renderEstatisticasAssunto() {
  setPaginaAtual('estatisticas-assunto');
  appDiv.className = 'estatisticas-assunto-page';
  
  const user = getUser();
  const stats = user.estatisticasPorAssunto || {};
  
  // Obtém todos os assuntos disponíveis
  const todosAssuntos = [...new Set(questoes.map(q => q.assunto))];
  
  // Calcula estatísticas para cada assunto
  const estatisticas = todosAssuntos.map(assunto => {
    const stat = stats[assunto] || { total: 0, acertos: 0, erros: 0 };
    const percentual = stat.total > 0 ? Math.round((stat.acertos / stat.total) * 100) : 0;
    
    return {
      assunto,
      total: stat.total,
      acertos: stat.acertos,
      erros: stat.erros,
      percentual
    };
  }).filter(s => s.total > 0).sort((a, b) => b.total - a.total);
  
  const totalGeral = estatisticas.reduce((sum, s) => sum + s.total, 0);
  const acertosGeral = estatisticas.reduce((sum, s) => sum + s.acertos, 0);
  const percentualGeral = totalGeral > 0 ? Math.round((acertosGeral / totalGeral) * 100) : 0;
  
  appDiv.innerHTML = `
    <h1 class="page-title">📊 Estatísticas por Assunto</h1>
    
    <div class="estatisticas-header">
      <div class="estatisticas-resumo">
        <div class="resumo-card">
          <h3>Total de Questões</h3>
          <p class="resumo-number">${totalGeral}</p>
        </div>
        <div class="resumo-card">
          <h3>Taxa de Acerto Geral</h3>
          <p class="resumo-number">${percentualGeral}%</p>
        </div>
        <div class="resumo-card">
          <h3>Assuntos Estudados</h3>
          <p class="resumo-number">${estatisticas.length}</p>
        </div>
      </div>
    </div>
    
    ${estatisticas.length === 0 ? `
      <div class="sem-estatisticas">
        <div class="sem-estatisticas-icon">📈</div>
        <h2>Nenhuma estatística disponível</h2>
        <p>Responda algumas questões para ver suas estatísticas por assunto.</p>
      </div>
    ` : `
      <div class="estatisticas-grid">
        ${estatisticas.map(stat => {
          const corBarra = stat.percentual >= 70 ? '#22c55e' : stat.percentual >= 50 ? '#eab308' : '#ef4444';
          const corBarraDark = stat.percentual >= 70 ? '#16a34a' : stat.percentual >= 50 ? '#ca8a04' : '#dc2626';
          
          return `
            <div class="estatistica-card">
              <div class="estatistica-header">
                <h3>${stat.assunto}</h3>
                <span class="estatistica-percentual ${stat.percentual >= 70 ? 'alta' : stat.percentual >= 50 ? 'media' : 'baixa'}">
                  ${stat.percentual}%
                </span>
              </div>
              
              <div class="estatistica-detalhes">
                <div class="detalhe-item">
                  <span class="detalhe-label">Total:</span>
                  <span class="detalhe-value">${stat.total}</span>
                </div>
                <div class="detalhe-item">
                  <span class="detalhe-label">Acertos:</span>
                  <span class="detalhe-value acerto">${stat.acertos}</span>
                </div>
                <div class="detalhe-item">
                  <span class="detalhe-label">Erros:</span>
                  <span class="detalhe-value erro">${stat.erros}</span>
                </div>
              </div>
              
              <div class="estatistica-bar">
                <div class="bar-fill" style="width: ${stat.percentual}%; background: ${corBarra};"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
  
  renderMenuLateral();
}

