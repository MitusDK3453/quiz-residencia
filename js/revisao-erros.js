// js/revisao-erros.js
// Página para revisar questões erradas

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { getUser } from './storage.js';
import { questoes } from './questoes.js';
import { gerarQuestaoId, encontrarQuestaoPorId } from './questao-utils.js';
import { iniciarAtividade } from './quiz.js';

const appDiv = document.getElementById("app");

export function renderRevisaoErros() {
  setPaginaAtual('revisao-erros');
  appDiv.className = 'revisao-erros-page';
  
  const user = getUser();
  const questoesErradasIds = user.questoesErradas || [];
  const questoesErradas = questoesErradasIds
    .map(id => {
      const questao = encontrarQuestaoPorId(id);
      return questao ? { ...questao, id } : null;
    })
    .filter(q => q !== null);
  
  // Agrupa por assunto
  const questoesPorAssunto = {};
  questoesErradas.forEach(q => {
    const assunto = q.assunto || 'Geral';
    if (!questoesPorAssunto[assunto]) {
      questoesPorAssunto[assunto] = [];
    }
    questoesPorAssunto[assunto].push(q);
  });
  
  const totalErros = questoesErradas.length;
  
  appDiv.innerHTML = `
    <h1 class="page-title">❌ Revisão de Erros</h1>
    
    <div class="revisao-header">
      <div class="revisao-stats">
        <div class="stat-box">
          <h3>Total de Erros</h3>
          <p class="stat-number">${totalErros}</p>
        </div>
        <div class="stat-box">
          <h3>Assuntos com Erros</h3>
          <p class="stat-number">${Object.keys(questoesPorAssunto).length}</p>
        </div>
      </div>
      
      ${totalErros > 0 ? `
        <div class="revisao-actions">
          <button id="btn-revisar-todas" class="btn-primary">🔄 Revisar Todas as Questões Erradas</button>
          <button id="btn-limpar-erros" class="btn-secondary">🗑️ Limpar Lista de Erros</button>
        </div>
      ` : ''}
    </div>
    
    ${totalErros === 0 ? `
      <div class="sem-erros">
        <div class="sem-erros-icon">✅</div>
        <h2>Parabéns!</h2>
        <p>Você não tem questões erradas para revisar no momento.</p>
        <p>Continue estudando para manter esse desempenho!</p>
      </div>
    ` : `
      <div class="revisao-content">
        ${Object.keys(questoesPorAssunto).map(assunto => {
          const questoesAssunto = questoesPorAssunto[assunto];
          return `
            <div class="assunto-group">
              <div class="assunto-header">
                <h2>${assunto}</h2>
                <span class="assunto-count">${questoesAssunto.length} ${questoesAssunto.length === 1 ? 'erro' : 'erros'}</span>
              </div>
              <button class="btn-revisar-assunto" data-assunto="${assunto}">
                🔄 Revisar ${questoesAssunto.length} ${questoesAssunto.length === 1 ? 'questão' : 'questões'} de ${assunto}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
  
  setupRevisaoListeners(questoesErradas, questoesPorAssunto);
  renderMenuLateral();
}

function setupRevisaoListeners(questoesErradas, questoesPorAssunto) {
  const btnRevisarTodas = document.getElementById('btn-revisar-todas');
  const btnLimparErros = document.getElementById('btn-limpar-erros');
  
  if (btnRevisarTodas) {
    btnRevisarTodas.onclick = () => {
      // Filtra questões para revisar apenas as erradas
      const questoesParaRevisar = questoesErradas;
      if (questoesParaRevisar.length === 0) {
        alert('Não há questões para revisar');
        return;
      }
      
      // Salva temporariamente as questões para revisão
      sessionStorage.setItem('questoesRevisao', JSON.stringify(questoesParaRevisar));
      
      // Redireciona para questões e inicia revisão
      import('./questoes-page.js').then(m => {
        m.renderQuestoesPage();
        setTimeout(() => {
          // Seleciona os assuntos automaticamente
          const assuntos = [...new Set(questoesParaRevisar.map(q => q.assunto))];
          assuntos.forEach(assunto => {
            const checkbox = document.querySelector(`input[value="${assunto}"]`);
            if (checkbox) checkbox.checked = true;
          });
          
          // Define quantidade
          const qtdInput = document.getElementById('quantidadeQuestoes');
          if (qtdInput) qtdInput.value = questoesParaRevisar.length;
          
          // Marca que é revisão
          sessionStorage.setItem('modoRevisao', 'true');
          
          // Inicia automaticamente
          iniciarAtividade();
        }, 100);
      });
    };
  }
  
  if (btnLimparErros) {
    btnLimparErros.onclick = () => {
      if (confirm('Tem certeza que deseja limpar toda a lista de erros? Esta ação não pode ser desfeita.')) {
        const user = getUser();
        user.questoesErradas = [];
        import('./storage.js').then(m => m.saveUser());
        renderRevisaoErros();
      }
    };
  }
  
  // Botões de revisar por assunto
  document.querySelectorAll('.btn-revisar-assunto').forEach(btn => {
    btn.onclick = () => {
      const assunto = btn.dataset.assunto;
      const questoesAssunto = questoesPorAssunto[assunto];
      
      if (questoesAssunto.length === 0) {
        alert('Não há questões para revisar neste assunto');
        return;
      }
      
      sessionStorage.setItem('questoesRevisao', JSON.stringify(questoesAssunto));
      
      import('./questoes-page.js').then(m => {
        m.renderQuestoesPage();
        setTimeout(() => {
          const checkbox = document.querySelector(`input[value="${assunto}"]`);
          if (checkbox) checkbox.checked = true;
          
          const qtdInput = document.getElementById('quantidadeQuestoes');
          if (qtdInput) qtdInput.value = questoesAssunto.length;
          
          sessionStorage.setItem('modoRevisao', 'true');
          iniciarAtividade();
        }, 100);
      });
    };
  });
}

