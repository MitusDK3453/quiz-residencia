// js/navegacao.js - SEM RANKING
// Sistema de navegação e menu lateral

import { renderDashboard } from './dashboard.js';
import { renderQuestoesPage } from './questoes-page.js';
import { renderConfiguracoes } from './configuracoes.js';
import { renderPerfil } from './perfil.js';
import { renderRevisaoErros } from './revisao-erros.js';
import { renderEstatisticasAssunto } from './estatisticas-assunto.js';

let paginaAtual = 'dashboard';

// Função para atualizar página atual sem renderizar
export function setPaginaAtual(pagina) {
  paginaAtual = pagina;
}

export function renderMenuLateral() {
  const menu = document.getElementById('menu-lateral');
  if (!menu) return;

  menu.innerHTML = `
    <div class="menu-header">
      <h2>Menu</h2>
    </div>
    <nav class="menu-nav">
      <button class="menu-item ${paginaAtual === 'dashboard' ? 'active' : ''}" data-page="dashboard">
        <span class="menu-icon">🏠</span>
        <span class="menu-text">Página Principal</span>
      </button>
      <button class="menu-item ${paginaAtual === 'questoes' ? 'active' : ''}" data-page="questoes">
        <span class="menu-icon">📝</span>
        <span class="menu-text">Questões</span>
      </button>
      <button class="menu-item ${paginaAtual === 'revisao-erros' ? 'active' : ''}" data-page="revisao-erros">
        <span class="menu-icon">❌</span>
        <span class="menu-text">Revisão de Erros</span>
      </button>
      <button class="menu-item ${paginaAtual === 'estatisticas-assunto' ? 'active' : ''}" data-page="estatisticas-assunto">
        <span class="menu-icon">📊</span>
        <span class="menu-text">Estatísticas</span>
      </button>
      <button class="menu-item ${paginaAtual === 'configuracoes' ? 'active' : ''}" data-page="configuracoes">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">Configurações</span>
      </button>
      <button class="menu-item ${paginaAtual === 'perfil' ? 'active' : ''}" data-page="perfil">
        <span class="menu-icon">👤</span>
        <span class="menu-text">Meu Perfil</span>
      </button>
    </nav>
    <div class="menu-footer">
      <button id="btn-logout" class="menu-item menu-logout">
        <span class="menu-icon">🚪</span>
        <span class="menu-text">Sair</span>
      </button>
    </div>
  `;
  
  document.getElementById('btn-logout').onclick = () => {
    import('./auth.js').then(m => m.logout());
  };

  // Event listeners
  document.querySelectorAll('.menu-item[data-page]').forEach(item => {
    item.onclick = () => {
      const page = item.dataset.page;
      navegarPara(page);
    };
  });
}

export function navegarPara(pagina) {
  paginaAtual = pagina;
  
  if (pagina === 'dashboard') {
    renderDashboard();
  } else if (pagina === 'questoes') {
    renderQuestoesPage();
  } else if (pagina === 'revisao-erros') {
    renderRevisaoErros();
  } else if (pagina === 'estatisticas-assunto') {
    renderEstatisticasAssunto();
  } else if (pagina === 'configuracoes') {
    renderConfiguracoes();
  } else if (pagina === 'perfil') {
    renderPerfil();
  }
  
  renderMenuLateral();
}

export function getPaginaAtual() {
  return paginaAtual;
}