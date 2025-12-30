// js/configuracoes.js
// Página de configurações

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { resetProgress } from './storage.js';
import { getUser } from './storage.js';

const appDiv = document.getElementById("app");

export function renderConfiguracoes() {
  setPaginaAtual('configuracoes');
  appDiv.className = 'config-page';
  const user = getUser();
  const metaTipo = localStorage.getItem('metaTipo') || 'diaria';
  const metaValor = parseInt(localStorage.getItem('metaValor') || '10');
  const isDark = document.body.classList.contains('dark');
  
  appDiv.innerHTML = `
    <h1 class="page-title">⚙️ Configurações</h1>
    
    <div class="configuracoes-container-integrado">
      <div class="config-section-integrado">
        <h2>🌙 Aparência</h2>
        <div class="config-item">
          <label class="config-label">Modo Escuro</label>
          <div class="config-control">
            <button id="btn-dark-mode" class="btn-toggle-dark ${isDark ? 'active' : ''}">
              <span class="toggle-icon">${isDark ? '☀️' : '🌙'}</span>
              <span class="toggle-text">${isDark ? 'Ativado' : 'Desativado'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="config-section-integrado">
        <h2>🎯 Configurar Metas</h2>
        <div class="meta-config-panel-integrado">
          <div class="config-item">
            <label class="config-label">Tipo de Meta</label>
            <div class="config-control">
              <select id="meta-tipo-select" class="config-select">
                <option value="diaria" ${metaTipo === 'diaria' ? 'selected' : ''}>Diária</option>
                <option value="semanal" ${metaTipo === 'semanal' ? 'selected' : ''}>Semanal</option>
                <option value="mensal" ${metaTipo === 'mensal' ? 'selected' : ''}>Mensal</option>
                <option value="anual" ${metaTipo === 'anual' ? 'selected' : ''}>Anual</option>
              </select>
            </div>
          </div>
          <div class="config-item">
            <label class="config-label">Quantidade de Questões</label>
            <div class="config-control">
              <input type="number" id="meta-valor-input" min="1" max="10000" value="${metaValor}" class="config-input">
              <span class="config-hint" id="meta-hint">questões por dia</span>
            </div>
          </div>
          <div class="meta-suggestions">
            <p class="suggestion-title">💡 Sugestões Rápidas:</p>
            <div class="suggestion-buttons">
              <button class="suggestion-btn" data-value="5">5/dia</button>
              <button class="suggestion-btn" data-value="10">10/dia</button>
              <button class="suggestion-btn" data-value="20">20/dia</button>
              <button class="suggestion-btn" data-value="30">30/dia</button>
              <button class="suggestion-btn" data-value="50">50/dia</button>
            </div>
          </div>
          <button id="btn-salvar-meta" class="btn-salvar-meta">💾 Salvar Meta</button>
        </div>
      </div>
      
      <div class="config-section-integrado">
        <h2>🔄 Dados</h2>
        <div class="config-item">
          <label class="config-label">Resetar Progresso</label>
          <p class="config-description">Esta ação irá apagar todo o seu progresso, incluindo questões respondidas, acertos e histórico.</p>
          <button id="btn-reset-progresso" class="btn-reset-progresso">🔄 Resetar Progresso</button>
        </div>
      </div>
    </div>
  `;
  
  // Event listeners
  document.getElementById('btn-dark-mode').onclick = () => {
    toggleDarkMode();
    renderConfiguracoes(); // Recarrega para atualizar o estado
  };
  
  // Atualiza hint quando tipo muda
  const tipoSelect = document.getElementById('meta-tipo-select');
  const metaHint = document.getElementById('meta-hint');
  const tipos = {
    diaria: 'questões por dia',
    semanal: 'questões por semana',
    mensal: 'questões por mês',
    anual: 'questões por ano'
  };
  
  tipoSelect.onchange = () => {
    metaHint.textContent = tipos[tipoSelect.value];
  };
  
  // Botões de sugestão rápida
  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('meta-valor-input').value = btn.dataset.value;
      tipoSelect.value = 'diaria';
      metaHint.textContent = tipos['diaria'];
    };
  });
  
  document.getElementById('btn-salvar-meta').onclick = () => {
    const tipo = tipoSelect.value;
    const valor = parseInt(document.getElementById('meta-valor-input').value);
    if (valor > 0) {
      localStorage.setItem('metaTipo', tipo);
      localStorage.setItem('metaValor', valor.toString());
      // Mantém compatibilidade com código antigo
      if (tipo === 'semanal') {
        localStorage.setItem('metaSemanal', valor.toString());
      }
      alert(`✅ Meta ${tipos[tipo]} definida: ${valor} questões`);
      renderConfiguracoes();
      // Atualiza dashboard se estiver aberto
      import('./dashboard.js').then(m => m.renderDashboard()).catch(() => {});
    } else {
      alert('❌ Por favor, insira um valor válido maior que zero.');
    }
  };
  
  document.getElementById('btn-reset-progresso').onclick = () => {
    if (confirm("⚠️ Tem certeza que deseja resetar todo o progresso?\n\nEsta ação não pode ser desfeita!")) {
      if (confirm("⚠️ Última confirmação: Todos os seus dados serão perdidos. Continuar?")) {
        resetProgress();
        alert("✅ Progresso resetado com sucesso!");
        renderConfiguracoes();
        // Volta para o dashboard
        import('./dashboard.js').then(m => m.renderDashboard());
      }
    }
  };
  
  renderMenuLateral();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark ? "true" : "false");
}

function obterLabelMeta(tipo) {
  const labels = {
    diaria: 'Diária',
    semanal: 'Semanal',
    mensal: 'Mensal',
    anual: 'Anual'
  };
  return labels[tipo] || 'Diária';
}

