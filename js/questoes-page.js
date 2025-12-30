// js/questoes-page.js
// Página dedicada para seleção de questões

import { iniciarAtividade } from './quiz.js';
import { questoes } from './questoes.js';
import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { renderImportador } from './importador.js';

const appDiv = document.getElementById("app");

export function renderQuestoesPage() {
  setPaginaAtual('questoes');
  appDiv.className = 'questoes-page';
  
  const assuntos = [...new Set(questoes.map(q => q.assunto))];
  
  appDiv.innerHTML = `
    <h1 class="page-title">📝 Questões</h1>
    
    <div class="questoes-container">
      <h2>Selecione os assuntos</h2>
      <div class="checkbox-container">
        <div id="listaAssuntos" class="lista-assuntos-grid"></div>
      </div>

      <h2>Quantas questões você quer responder?</h2>
      <div class="input-container">
        <input type="number" id="quantidadeQuestoes" min="1" max="${questoes.length}" value="10">
      </div>

      <div class="botoes-navegacao">
        <button id="btnIniciar" class="btn-iniciar-grande">🚀 Iniciar Atividade</button>
        <button id="btnImportar" class="btn-secondary">📥 Importar Questões</button>
      </div>
    </div>
  `;

  const lista = document.getElementById("listaAssuntos");
  assuntos.forEach(a => {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML = `
      <input type="checkbox" value="${a}" class="checkbox-input">
      <span class="checkbox-label">${a}</span>
    `;
    lista.appendChild(label);
  });

  document.getElementById("btnIniciar").onclick = iniciarAtividade;
  document.getElementById("btnImportar").onclick = renderImportador;
  
  renderMenuLateral();
}

