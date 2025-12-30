// js/dashboard.js
import { getUser } from './storage.js';
import { questoes } from './questoes.js';
import { renderMenuLateral, setPaginaAtual } from './navegacao.js';

const appDiv = document.getElementById("app");

export function renderDashboard() {
  setPaginaAtual('dashboard');
  const user = getUser();
  
  // Garante que os valores existam
  if (!user.totalQuestoes) user.totalQuestoes = 0;
  if (!user.totalAcertos) user.totalAcertos = 0;
  
  const percentual = user.totalQuestoes > 0 ? Math.round((user.totalAcertos / user.totalQuestoes) * 100) : 0;
  const erros = user.totalQuestoes - user.totalAcertos;
  
  // Obtém nome do usuário (prioriza o nome do objeto user, depois localStorage)
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const displayName = user.nome || userData.name || userData.nome || 'Usuário';

  // Calcula progresso dos últimos 7 dias
  const progresso7dias = calcularProgresso7Dias(user.progressoDiario || {});
  
  // Obtém meta configurada
  const metaTipo = localStorage.getItem('metaTipo') || 'diaria';
  const metaValor = parseInt(localStorage.getItem('metaValor') || '10');
  const metaDiaria = calcularMetaDiariaConfigurada(metaTipo, metaValor);
  const questoesHoje = obterQuestoesHoje(user.progressoDiario || {});
  const faltamHoje = Math.max(0, metaDiaria - questoesHoje);
  const metaLabel = obterLabelMeta(metaTipo);
  
  appDiv.className = 'dashboard-page';
  appDiv.innerHTML = `
    <div class="welcome-message">
      <h1 class="page-title">👋 Olá, ${displayName}!</h1>
      <p class="welcome-subtitle">Bem-vindo de volta ao seu painel de estudos</p>
    </div>
    
    <div class="cards">
      <div class="card card-respondidas">
        <h3>Total Respondidas</h3>
        <p>${user.totalQuestoes}</p>
      </div>
      <div class="card card-acertos">
        <h3>Acertos</h3>
        <p>${user.totalAcertos}</p>
      </div>
      <div class="card card-erros">
        <h3>Erros</h3>
        <p>${erros}</p>
      </div>
      <div class="card card-percentual">
        <h3>% de Acerto</h3>
        <p>${percentual}%</p>
      </div>
    </div>

    <div class="dashboard-main-content">
      <div class="dashboard-left">
        <div class="meta-visual-card">
          <div class="meta-visual-header">
            <h3>🎯 Meta ${metaLabel}</h3>
            <span class="meta-badge meta-badge-${metaTipo}">${obterLabelMeta(metaTipo)}</span>
          </div>
          <div class="meta-visual-content">
            <div class="meta-progress-circle">
              <svg class="progress-ring" width="140" height="140">
                <circle class="progress-ring-circle-bg" cx="70" cy="70" r="64"></circle>
                <circle class="progress-ring-circle" cx="70" cy="70" r="64" 
                        style="stroke-dashoffset: ${calcularProgressoCircular(user, metaTipo, metaValor)}"></circle>
              </svg>
              <div class="progress-text">
                <span class="progress-value">${calcularPercentualMeta(user, metaTipo, metaValor)}%</span>
                <span class="progress-label">Concluído</span>
              </div>
            </div>
            <div class="meta-stats">
              <div class="meta-stat-item">
                <span class="stat-label">Meta:</span>
                <span class="stat-value">${metaValor} questões</span>
              </div>
              <div class="meta-stat-item">
                <span class="stat-label">Realizado:</span>
                <span class="stat-value">${calcularRealizado(user, metaTipo)} questões</span>
              </div>
              <div class="meta-stat-item">
                <span class="stat-label">Faltam:</span>
                <span class="stat-value ${calcularFaltam(user, metaTipo, metaValor) > 0 ? 'stat-faltam' : 'stat-completo'}">
                  ${calcularFaltam(user, metaTipo, metaValor)} questões
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-right">
        <div class="grafico-container">
          <h2>Desempenho dos Últimos 7 Dias</h2>
          <div id="grafico-barras">
            ${renderizarGrafico(progresso7dias)}
          </div>
        </div>
      </div>
    </div>
  `;
  
  renderMenuLateral();
}

function calcularProgresso7Dias(progressoDiario) {
  const dias = [];
  const hoje = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    // Formato consistente: DD/MM/YYYY
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const dataStr = `${dia}/${mes}/${ano}`;
    
    dias.push({
      data: dataStr,
      quantidade: progressoDiario[dataStr] || 0
    });
  }
  
  return dias;
}

function renderizarGrafico(dados) {
  const metaTipo = localStorage.getItem('metaTipo') || 'diaria';
  const metaValor = parseInt(localStorage.getItem('metaValor') || '10');
  const metaDiaria = calcularMetaDiariaConfigurada(metaTipo, metaValor);
  
  const valores = dados.map(d => d.quantidade);
  const maxValor = Math.max(...valores);
  // O máximo deve incluir a meta para que ela seja sempre visível
  const max = Math.max(maxValor, metaDiaria, 1);
  
  // Calcula altura da meta relativa ao máximo (sempre visível)
  const alturaMetaPercent = metaDiaria > 0 && max > 0 ? (metaDiaria / max) * 100 : 0;
  
  return `
    <div class="grafico-wrapper">
      <div class="grafico-eixo-y">
        <div class="eixo-label eixo-max">${max}</div>
        <div class="eixo-label eixo-meta" style="bottom: ${alturaMetaPercent}%">Meta: ${metaDiaria}</div>
        <div class="eixo-label eixo-min">0</div>
      </div>
      <div class="grafico-barras-container">
        ${dados.map((d, index) => {
          // Calcula altura da barra baseada no máximo
          const altura = max > 0 ? (d.quantidade / max) * 100 : 0;
          
          // Extrai dia da semana da data
          const [dia, mes, ano] = d.data.split('/');
          const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
          const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' });
          const diaNumero = dataObj.getDate();
          const mesNome = dataObj.toLocaleDateString('pt-BR', { month: 'short' });
          
          // Verifica se atingiu a meta
          const atingiuMeta = d.quantidade >= metaDiaria;
          
          return `
            <div class="barra-item-novo">
              <div class="barra-valor-novo ${atingiuMeta ? 'meta-atingida' : ''}">${d.quantidade}</div>
              <div class="barra-container-novo">
                <div class="barra-nova ${atingiuMeta ? 'barra-meta-atingida' : ''}" style="height: ${altura}%"></div>
              </div>
              <div class="barra-label-novo">
                <div class="barra-dia-semana-novo">${diaSemana}</div>
                <div class="barra-dia-numero-novo">${diaNumero}</div>
                <div class="barra-mes-novo">${mesNome}</div>
              </div>
            </div>
          `;
        }).join('')}
        <div class="barra-meta-linha" style="bottom: ${alturaMetaPercent}%"></div>
      </div>
    </div>
  `;
}

function calcularTendencia(dados) {
  const ultimos3 = dados.slice(-3).map(d => d.quantidade);
  const anteriores3 = dados.slice(0, 3).map(d => d.quantidade);
  
  const mediaUltimos = ultimos3.reduce((a, b) => a + b, 0) / 3;
  const mediaAnteriores = anteriores3.reduce((a, b) => a + b, 0) / 3;
  
  if (mediaUltimos > mediaAnteriores * 1.1) return '📈 Em alta';
  if (mediaUltimos < mediaAnteriores * 0.9) return '📉 Em queda';
  return '➡️ Estável';
}

function calcularSequencia(progressoDiario) {
  const hoje = new Date();
  let sequencia = 0;
  
  for (let i = 0; i < 365; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    // Formato consistente: DD/MM/YYYY
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const dataStr = `${dia}/${mes}/${ano}`;
    
    if (progressoDiario[dataStr] && progressoDiario[dataStr] > 0) {
      sequencia++;
    } else {
      break;
    }
  }
  
  return sequencia;
}

function obterQuestoesHoje(progressoDiario) {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  const dataStr = `${dia}/${mes}/${ano}`;
  return progressoDiario[dataStr] || 0;
}

function calcularMetaDiariaConfigurada(tipo, valor) {
  switch(tipo) {
    case 'diaria':
      return valor;
    case 'semanal':
      return Math.ceil(valor / 7);
    case 'mensal':
      return Math.ceil(valor / 30);
    case 'anual':
      return Math.ceil(valor / 365);
    default:
      return valor;
  }
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

function calcularProgressoCircular(user, tipo, valor) {
  const realizado = calcularRealizado(user, tipo);
  const percentual = valor > 0 ? Math.min(100, (realizado / valor) * 100) : 0;
  const circumference = 2 * Math.PI * 64;
  return circumference - (percentual / 100) * circumference;
}

function calcularPercentualMeta(user, tipo, valor) {
  const realizado = calcularRealizado(user, tipo);
  return valor > 0 ? Math.round(Math.min(100, (realizado / valor) * 100)) : 0;
}

function calcularRealizado(user, tipo) {
  const hoje = new Date();
  const progressoDiario = user.progressoDiario || {};
  
  switch(tipo) {
    case 'diaria':
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const dataStr = `${dia}/${mes}/${ano}`;
      return progressoDiario[dataStr] || 0;
    case 'semanal':
      let totalSemanal = 0;
      for (let i = 0; i < 7; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const d = String(data.getDate()).padStart(2, '0');
        const m = String(data.getMonth() + 1).padStart(2, '0');
        const a = data.getFullYear();
        const ds = `${d}/${m}/${a}`;
        totalSemanal += progressoDiario[ds] || 0;
      }
      return totalSemanal;
    case 'mensal':
      let totalMensal = 0;
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      for (let d = 1; d <= 31; d++) {
        const dataStr = `${String(d).padStart(2, '0')}/${String(mesAtual + 1).padStart(2, '0')}/${anoAtual}`;
        totalMensal += progressoDiario[dataStr] || 0;
      }
      return totalMensal;
    case 'anual':
      let totalAnual = 0;
      const anoAtual2 = hoje.getFullYear();
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 31; d++) {
          const dataStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${anoAtual2}`;
          totalAnual += progressoDiario[dataStr] || 0;
        }
      }
      return totalAnual;
    default:
      return 0;
  }
}

function calcularFaltam(user, tipo, valor) {
  const realizado = calcularRealizado(user, tipo);
  return Math.max(0, valor - realizado);
}
