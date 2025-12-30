// js/resumos-novo.js
// Sistema de resumos reestruturado: Matéria Base > Subtema > Resumo

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { renderEditorResumos } from './editor-resumos.js';

const appDiv = document.getElementById("app");

export function renderResumos() {
  setPaginaAtual('resumos');
  appDiv.className = 'resumos-page';
  const resumos = carregarResumos();
  
  appDiv.innerHTML = `
    <h1 class="page-title">📚 Resumos</h1>
    
    <div class="resumos-container">
      <div class="resumos-header">
        <p style="text-align: center; color: #64748b; margin: 20px 0;">
          Selecione uma matéria base para visualizar os resumos disponíveis.
        </p>
        <button id="btn-nova-materia" class="btn-nova-materia">➕ Nova Matéria Base</button>
      </div>
      
      <div id="lista-materias" class="lista-materias"></div>
      
      <div id="lista-subtemas" class="lista-subtemas" style="display: none;">
        <div class="subtemas-header">
          <button id="btn-voltar-materias" class="btn-voltar">← Voltar</button>
          <h2 id="titulo-materia-atual"></h2>
        </div>
        <div id="lista-subtemas-content"></div>
      </div>
      
      <div id="lista-sub-subtemas" class="lista-sub-subtemas" style="display: none;">
        <div class="subtemas-header">
          <button id="btn-voltar-subtemas" class="btn-voltar">← Voltar</button>
          <h2 id="titulo-subtema-atual"></h2>
        </div>
        <div id="lista-sub-subtemas-content"></div>
      </div>
      
      <div id="visualizacao-resumo" class="visualizacao-resumo" style="display: none;">
        <div class="resumo-view-header">
          <button id="btn-voltar-sub-subtemas" class="btn-voltar">← Voltar</button>
          <h2 id="titulo-sub-subtema-atual"></h2>
          <button id="btn-editar-resumo-view" class="btn-editar-view">✏️ Editar</button>
        </div>
        <div id="conteudo-resumo-view" class="conteudo-resumo-view"></div>
      </div>
    </div>
  `;
  
  renderizarMaterias(resumos);
  setupEventListeners();
  renderMenuLateral();
}

function renderizarMaterias(resumos) {
  const lista = document.getElementById("lista-materias");
  const materias = Object.keys(resumos);
  
  if (materias.length === 0) {
    lista.innerHTML = `
      <div class="sem-materias">
        <p>Nenhuma matéria base criada ainda.</p>
        <p style="font-size: 0.9em; color: #64748b; margin-top: 10px;">
          Clique em "Nova Matéria Base" para começar.
        </p>
      </div>
    `;
    return;
  }
  
  lista.innerHTML = materias.map(materia => {
    const dados = resumos[materia];
    const subtemas = dados.subtemas || [];
    const totalSubtemas = subtemas.length;
    
    return `
      <div class="card-materia" data-materia="${materia}">
        <div class="card-materia-icon">📚</div>
        <div class="card-materia-content">
          <h3>${materia}</h3>
          <p>${totalSubtemas} subtema(s)</p>
        </div>
        <button class="btn-abrir-materia" data-materia="${materia}">Abrir</button>
      </div>
    `;
  }).join('');
  
  // Event listeners
  document.querySelectorAll('.btn-abrir-materia').forEach(btn => {
    btn.onclick = () => mostrarSubtemas(btn.dataset.materia, resumos[btn.dataset.materia]);
  });
}

function mostrarSubtemas(materia, dados) {
  const listaMaterias = document.getElementById("lista-materias");
  const listaSubtemas = document.getElementById("lista-subtemas");
  const listaSubtemasContent = document.getElementById("lista-subtemas-content");
  const tituloMateria = document.getElementById("titulo-materia-atual");
  
  listaMaterias.style.display = "none";
  listaSubtemas.style.display = "block";
  tituloMateria.textContent = materia;
  
  const subtemas = dados.subtemas || [];
  
  if (subtemas.length === 0) {
    listaSubtemasContent.innerHTML = `
      <div class="sem-subtemas">
        <p>Nenhum subtema criado ainda para esta matéria.</p>
        <button class="btn-criar-subtema" data-materia="${materia}">➕ Criar Primeiro Subtema</button>
      </div>
    `;
  } else {
    listaSubtemasContent.innerHTML = `
      <button class="btn-nova-subtema" data-materia="${materia}">➕ Novo Subtema</button>
      <div class="grid-subtemas">
        ${subtemas.map((subtema, index) => {
          const temSubSubtemas = subtema.subSubtemas && subtema.subSubtemas.length > 0;
          const temConteudo = subtema.conteudo && subtema.conteudo.trim();
          return `
          <div class="card-subtema" data-materia="${materia}" data-index="${index}">
            <h3>${subtema.titulo || 'Sem título'}</h3>
            <p>${temSubSubtemas ? `${subtema.subSubtemas.length} sub-subtema(s)` : temConteudo ? 'Resumo disponível' : 'Sem conteúdo'}</p>
            <div class="card-subtema-buttons">
              ${temSubSubtemas ? `
                <button class="btn-abrir-subtema" data-materia="${materia}" data-index="${index}">Abrir</button>
              ` : `
                <button class="btn-ver-subtema" data-materia="${materia}" data-index="${index}">Ver</button>
                <button class="btn-editar-subtema" data-materia="${materia}" data-index="${index}">✏️ Editar</button>
              `}
              <button class="btn-adicionar-sub-subtema" data-materia="${materia}" data-index="${index}" title="Adicionar sub-subtema">➕</button>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    `;
  }
  
  // Event listeners
  document.querySelectorAll('.btn-ver-subtema').forEach(btn => {
    btn.onclick = () => mostrarResumo(btn.dataset.materia, parseInt(btn.dataset.index), null);
  });
  
  document.querySelectorAll('.btn-editar-subtema').forEach(btn => {
    btn.onclick = () => {
      renderEditorResumos(btn.dataset.materia, parseInt(btn.dataset.index), false, null);
    };
  });
  
  document.querySelectorAll('.btn-abrir-subtema').forEach(btn => {
    btn.onclick = () => {
      const materia = btn.dataset.materia;
      const index = parseInt(btn.dataset.index);
      const resumos = carregarResumos();
      mostrarSubSubtemas(materia, index, resumos[materia].subtemas[index]);
    };
  });
  
  document.querySelectorAll('.btn-adicionar-sub-subtema').forEach(btn => {
    btn.onclick = () => {
      const materia = btn.dataset.materia;
      const indexSubtema = parseInt(btn.dataset.index);
      renderEditorResumos(materia, indexSubtema, false, null, true);
    };
  });
  
  document.querySelectorAll('.btn-criar-subtema, .btn-nova-subtema').forEach(btn => {
    btn.onclick = () => {
      renderEditorResumos(btn.dataset.materia, null, true, null);
    };
  });
}

function mostrarSubSubtemas(materia, indexSubtema, subtema) {
  const listaSubtemas = document.getElementById("lista-subtemas");
  const listaSubSubtemas = document.getElementById("lista-sub-subtemas");
  const listaSubSubtemasContent = document.getElementById("lista-sub-subtemas-content");
  const tituloSubtema = document.getElementById("titulo-subtema-atual");
  
  listaSubtemas.style.display = "none";
  listaSubSubtemas.style.display = "block";
  tituloSubtema.textContent = subtema.titulo || 'Sem título';
  
  const subSubtemas = subtema.subSubtemas || [];
  
  if (subSubtemas.length === 0) {
    listaSubSubtemasContent.innerHTML = `
      <div class="sem-subtemas">
        <p>Nenhum sub-subtema criado ainda para este subtema.</p>
        <button class="btn-criar-sub-subtema" data-materia="${materia}" data-index-subtema="${indexSubtema}">➕ Criar Primeiro Sub-subtema</button>
      </div>
    `;
  } else {
    listaSubSubtemasContent.innerHTML = `
      <button class="btn-novo-sub-subtema" data-materia="${materia}" data-index-subtema="${indexSubtema}">➕ Novo Sub-subtema</button>
      <div class="grid-subtemas">
        ${subSubtemas.map((subSubtema, index) => `
          <div class="card-subtema" data-materia="${materia}" data-index-subtema="${indexSubtema}" data-index="${index}">
            <h3>${subSubtema.titulo || 'Sem título'}</h3>
            <p>${subSubtema.conteudo ? 'Resumo disponível' : 'Sem conteúdo'}</p>
            <div class="card-subtema-buttons">
              <button class="btn-ver-sub-subtema" data-materia="${materia}" data-index-subtema="${indexSubtema}" data-index="${index}">Ver</button>
              <button class="btn-editar-sub-subtema" data-materia="${materia}" data-index-subtema="${indexSubtema}" data-index="${index}">✏️ Editar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Event listeners
  document.querySelectorAll('.btn-ver-sub-subtema').forEach(btn => {
    btn.onclick = () => mostrarResumo(btn.dataset.materia, parseInt(btn.dataset.indexSubtema), parseInt(btn.dataset.index));
  });
  
  document.querySelectorAll('.btn-editar-sub-subtema').forEach(btn => {
    btn.onclick = () => {
      renderEditorResumos(btn.dataset.materia, parseInt(btn.dataset.indexSubtema), false, parseInt(btn.dataset.index));
    };
  });
  
  document.querySelectorAll('.btn-criar-sub-subtema, .btn-novo-sub-subtema').forEach(btn => {
    btn.onclick = () => {
      renderEditorResumos(btn.dataset.materia, parseInt(btn.dataset.indexSubtema), false, null, true);
    };
  });
}

function mostrarResumo(materia, indexSubtema, indexSubSubtema = null) {
  const listaSubtemas = document.getElementById("lista-subtemas");
  const listaSubSubtemas = document.getElementById("lista-sub-subtemas");
  const visualizacao = document.getElementById("visualizacao-resumo");
  const titulo = document.getElementById(indexSubSubtema !== null ? "titulo-sub-subtema-atual" : "titulo-subtema-atual");
  const conteudo = document.getElementById("conteudo-resumo-view");
  const btnEditar = document.getElementById("btn-editar-resumo-view");
  
  const resumos = carregarResumos();
  const dados = resumos[materia];
  
  let conteudoResumo = '';
  let tituloResumo = '';
  
  if (indexSubSubtema !== null) {
    // Mostrando sub-subtema
    const subtema = dados.subtemas[indexSubtema];
    const subSubtema = subtema.subSubtemas[indexSubSubtema];
    tituloResumo = subSubtema.titulo || 'Sem título';
    conteudoResumo = subSubtema.conteudo || '<p>Sem conteúdo ainda.</p>';
    
    listaSubSubtemas.style.display = "none";
    btnEditar.onclick = () => {
      renderEditorResumos(materia, indexSubtema, false, indexSubSubtema);
    };
  } else {
    // Mostrando subtema
    const subtema = dados.subtemas[indexSubtema];
    tituloResumo = subtema.titulo || 'Sem título';
    conteudoResumo = subtema.conteudo || '<p>Sem conteúdo ainda.</p>';
    
    listaSubtemas.style.display = "none";
    btnEditar.onclick = () => {
      renderEditorResumos(materia, indexSubtema, false, null);
    };
  }
  
  visualizacao.style.display = "block";
  titulo.textContent = tituloResumo;
  
  // Remove classes de colunas anteriores
  conteudo.className = conteudo.className.replace(/editor-cols-\d+/g, '').trim();
  
  // Aplica classes de colunas se existirem
  if (conteudoResumo.includes('editor-cols-')) {
    const match = conteudoResumo.match(/class="[^"]*editor-cols-(\d+)[^"]*"/);
    if (match) {
      conteudo.classList.add(`editor-cols-${match[1]}`);
      // Remove o wrapper div das colunas do conteúdo
      conteudoResumo = conteudoResumo.replace(/<div[^>]*editor-cols-\d+[^>]*>([\s\S]*)<\/div>/, '$1');
    }
  }
  
  conteudo.innerHTML = conteudoResumo || '<p>Sem conteúdo ainda.</p>';
}

function setupEventListeners() {
  document.getElementById("btn-nova-materia").onclick = () => {
    const nome = prompt("Digite o nome da nova matéria base:");
    if (nome && nome.trim()) {
      renderEditorResumos(nome.trim(), null, true);
    }
  };
  
  document.getElementById("btn-voltar-materias").onclick = () => {
    document.getElementById("lista-materias").style.display = "grid";
    document.getElementById("lista-subtemas").style.display = "none";
  };
  
  document.getElementById("btn-voltar-subtemas").onclick = () => {
    const materia = document.getElementById("titulo-materia-atual").textContent;
    const resumos = carregarResumos();
    mostrarSubtemas(materia, resumos[materia]);
    document.getElementById("lista-sub-subtemas").style.display = "none";
  };
  
  document.getElementById("btn-voltar-sub-subtemas").onclick = () => {
    const materia = document.getElementById("titulo-materia-atual").textContent;
    const resumos = carregarResumos();
    const dados = resumos[materia];
    // Encontra o subtema que tem sub-subtemas
    const subtemaComSubSubtemas = dados.subtemas.findIndex(s => s.subSubtemas && s.subSubtemas.length > 0);
    if (subtemaComSubSubtemas !== -1) {
      mostrarSubSubtemas(materia, subtemaComSubSubtemas, dados.subtemas[subtemaComSubSubtemas]);
    } else {
      mostrarSubtemas(materia, dados);
    }
    document.getElementById("visualizacao-resumo").style.display = "none";
  };
}

function carregarResumos() {
  try {
    const resumos = localStorage.getItem('resumos');
    return resumos ? JSON.parse(resumos) : {};
  } catch (e) {
    return {};
  }
}

export { carregarResumos };

