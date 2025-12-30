// js/quiz.js
import { questoes } from './questoes.js';
import { getUser, saveUser } from './storage.js';
import { iniciarCronometro, pararCronometro } from './timer.js';
import { renderDashboard } from './dashboard.js';
import { gerarQuestaoId } from './questao-utils.js';

const appDiv = document.getElementById("app");

let indiceAtual = 0;
let currentQuestoes = [];
let respostasFiltradas = [];

// Função global para navegar
window.irPara = function(idx) {
  indiceAtual = idx;
  renderQuestao();
};

export function iniciarAtividade() {
  // Verifica se está no modo revisão
  const modoRevisao = sessionStorage.getItem('modoRevisao') === 'true';
  const questoesRevisao = modoRevisao ? JSON.parse(sessionStorage.getItem('questoesRevisao') || '[]') : null;
  
  if (modoRevisao && questoesRevisao && questoesRevisao.length > 0) {
    // Modo revisão: usa as questões salvas
    currentQuestoes = questoesRevisao;
    sessionStorage.removeItem('modoRevisao');
    sessionStorage.removeItem('questoesRevisao');
  } else {
    // Modo normal: filtra por assuntos
    const checkboxes = document.querySelectorAll('#listaAssuntos input[type="checkbox"]:checked');
    const assuntos = Array.from(checkboxes).map(cb => cb.value);
    if (assuntos.length === 0) {
      alert("Selecione pelo menos um assunto!");
      return;
    }

    const qtd = parseInt(document.getElementById("quantidadeQuestoes").value) || 10;
    let filtradas = questoes.filter(q => assuntos.includes(q.assunto));
    filtradas = shuffle(filtradas);
    currentQuestoes = filtradas.slice(0, qtd);
  }

  if (currentQuestoes.length === 0) {
    alert("Não há questões suficientes!");
    return;
  }

  indiceAtual = 0;
  respostasFiltradas = new Array(currentQuestoes.length).fill(null);

  iniciarCronometro();
  renderQuestao();
}

export function renderQuestao() {
  const appDiv = document.getElementById("app");
  appDiv.className = 'quiz-page';
  const q = currentQuestoes[indiceAtual];
  const resposta = respostasFiltradas[indiceAtual];

  // Painel numerado clicável - logo abaixo do cronômetro
  let painelHTML = "<div class='painel-questoes'>";
  currentQuestoes.forEach((_, i) => {
    const r = respostasFiltradas[i];
    let classe = "questao-numero";
    if (r !== null) {
      classe += (r === currentQuestoes[i].correta) ? " questao-correta" : " questao-errada";
    }
    if (i === indiceAtual) {
      classe += " questao-atual";
    }
    painelHTML += `
      <button 
        class="${classe}"
        onclick='irPara(${i})'>
        ${i + 1}
      </button>`;
  });
  painelHTML += "</div>";

  const btnFinalizar = "<button id='btnFinalizar'>Finalizar</button>";

  appDiv.innerHTML = `
    <div class="header-questao">
      <h2>Questão ${indiceAtual + 1} de ${currentQuestoes.length}</h2>
      <span class="badge-assunto">${q.assunto}</span>
    </div>

    <p id="cronometro" class="cronometro-display">Tempo: 00:00</p>

    ${painelHTML}

    <div class="pergunta-container">
      <p class="pergunta-texto">${q.pergunta}</p>
    </div>

    <div id="alternativas" class="alternativas"></div>

    <div id="comentario" class="comentario" style="display:${resposta !== null ? 'block' : 'none'}">
      ${resposta !== null ? q.explicacao : ''}
    </div>

    <div class="botoes-navegacao">
      <button id="btnAnterior" ${indiceAtual === 0 ? "disabled" : ""}>Anterior</button>
      ${btnFinalizar}
      <button id="btnProximo" ${indiceAtual === currentQuestoes.length - 1 ? "disabled" : ""}>Próxima</button>
    </div>
  `;

  const divAlt = document.getElementById("alternativas");
  const letras = ['A', 'B', 'C', 'D', 'E'];
  q.alternativas.forEach((alt, i) => {
    const btn = document.createElement("button");
    btn.textContent = alt;
    btn.className = "alt-btn";
    btn.setAttribute("data-letra", letras[i]);
    btn.style.fontSize = "0.95em"; // Fonte reduzida como você pediu

    if (resposta !== null) {
      btn.disabled = true;
      if (i === q.correta) btn.classList.add("correct");
      if (i === resposta && resposta !== q.correta) btn.classList.add("wrong");
    } else {
      btn.onclick = () => responder(i);
    }
    divAlt.appendChild(btn);
  });

  document.getElementById("btnAnterior").onclick = () => {
    if (indiceAtual > 0) {
      indiceAtual--;
      renderQuestao();
    }
  };
  document.getElementById("btnProximo").onclick = () => {
    if (indiceAtual < currentQuestoes.length - 1) {
      indiceAtual++;
      renderQuestao();
    }
  };
  document.getElementById("btnFinalizar").onclick = finalizarQuiz;
}

function responder(idx) {
  const q = currentQuestoes[indiceAtual];
  const user = getUser();

  // Garante que os valores existam
  if (typeof user.totalQuestoes !== 'number') user.totalQuestoes = 0;
  if (typeof user.totalAcertos !== 'number') user.totalAcertos = 0;
  if (!user.progressoDiario) user.progressoDiario = {};
  if (!Array.isArray(user.questoesErradas)) user.questoesErradas = [];
  if (!Array.isArray(user.questoesAcertadas)) user.questoesAcertadas = [];
  if (!Array.isArray(user.historicoQuestoes)) user.historicoQuestoes = [];
  if (!user.estatisticasPorAssunto) user.estatisticasPorAssunto = {};

  respostasFiltradas[indiceAtual] = idx;
  user.totalQuestoes++;
  
  const questaoId = gerarQuestaoId(q);
  const acertou = idx === q.correta;
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  const dataStr = `${dia}/${mes}/${ano}`;
  
  if (acertou) {
    user.totalAcertos++;
    // Adiciona à lista de acertadas (sem duplicatas)
    if (!user.questoesAcertadas.includes(questaoId)) {
      user.questoesAcertadas.push(questaoId);
    }
    // Remove de erradas se estava lá
    const indexErrada = user.questoesErradas.indexOf(questaoId);
    if (indexErrada > -1) {
      user.questoesErradas.splice(indexErrada, 1);
    }
  } else {
    // Adiciona à lista de erradas (sem duplicatas)
    if (!user.questoesErradas.includes(questaoId)) {
      user.questoesErradas.push(questaoId);
    }
    // Remove de acertadas se estava lá
    const indexAcertada = user.questoesAcertadas.indexOf(questaoId);
    if (indexAcertada > -1) {
      user.questoesAcertadas.splice(indexAcertada, 1);
    }
  }
  
  // Atualiza estatísticas por assunto
  const assunto = q.assunto || 'Geral';
  if (!user.estatisticasPorAssunto[assunto]) {
    user.estatisticasPorAssunto[assunto] = { total: 0, acertos: 0, erros: 0 };
  }
  user.estatisticasPorAssunto[assunto].total++;
  if (acertou) {
    user.estatisticasPorAssunto[assunto].acertos++;
  } else {
    user.estatisticasPorAssunto[assunto].erros++;
  }
  
  // Adiciona ao histórico
  user.historicoQuestoes.push({
    questaoId: questaoId,
    acertou: acertou,
    data: dataStr,
    assunto: assunto,
    respostaEscolhida: idx,
    respostaCorreta: q.correta
  });
  
  // Mantém histórico limitado (últimos 1000 registros)
  if (user.historicoQuestoes.length > 1000) {
    user.historicoQuestoes = user.historicoQuestoes.slice(-1000);
  }

  user.progressoDiario[dataStr] = (user.progressoDiario[dataStr] || 0) + 1;

  saveUser();
  renderQuestao();
}

function finalizarQuiz() {
  const tempo = pararCronometro();
  const minutos = Math.floor(tempo / 60);
  const segundos = tempo % 60;
  
  // Conta apenas questões respondidas
  const questoesRespondidas = respostasFiltradas.filter(r => r !== null).length;
  const acertos = respostasFiltradas.filter((r, i) => r !== null && r === currentQuestoes[i].correta).length;
  const erros = questoesRespondidas - acertos;
  const percentual = questoesRespondidas > 0 ? Math.round((acertos / questoesRespondidas) * 100) : 0;

  appDiv.className = '';
  appDiv.innerHTML = `
    <div class="resultado-final">
      <h1 style="color: #2563eb; margin-bottom: 30px;">🎯 Quiz Finalizado!</h1>
      
      <div class="cards-resultado">
        <div class="card-resultado card-respondidas">
          <h3>Questões Respondidas</h3>
          <p>${questoesRespondidas}</p>
        </div>
        <div class="card-resultado card-acertos">
          <h3>Acertos</h3>
          <p>${acertos}</p>
        </div>
        <div class="card-resultado card-erros">
          <h3>Erros</h3>
          <p>${erros}</p>
        </div>
        <div class="card-resultado card-percentual">
          <h3>% de Acerto</h3>
          <p>${percentual}%</p>
        </div>
      </div>
      
      <div class="tempo-final">
        <p><strong>⏱️ Tempo total: ${minutos}:${segundos.toString().padStart(2, '0')}</strong></p>
      </div>
      
      <div class="botoes-navegacao">
        <button id="btn-voltar-questoes" class="btn-voltar-dashboard">Voltar para Questões</button>
      </div>
    </div>
  `;
  
  document.getElementById('btn-voltar-questoes').onclick = () => {
    import('./navegacao.js').then(m => m.navegarPara('questoes'));
  };
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}