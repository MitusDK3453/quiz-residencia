// js/editor-resumos.js
// Editor completo de resumos com formatação e submaterias

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { carregarResumos } from './resumos-novo.js';

const appDiv = document.getElementById("app");
let materiaAtual = null;
let indexSubtemaAtual = null;
let indexSubSubtemaAtual = null;
let novoSubtema = false;
let novoSubSubtema = false;
let modoEdicao = false;

export function renderEditorResumos(materia, indexSubtema = null, isNovoSubtema = false, indexSubSubtema = null, isNovoSubSubtema = false) {
  setPaginaAtual('resumos');
  materiaAtual = materia;
  indexSubtemaAtual = indexSubtema;
  indexSubSubtemaAtual = indexSubSubtema;
  novoSubtema = isNovoSubtema;
  novoSubSubtema = isNovoSubSubtema;
  modoEdicao = true;
  
  const resumos = carregarResumos();
  const dadosMateria = resumos[materia] || { subtemas: [] };
  
  // Determina qual conteúdo editar
  let subtemaAtual = null;
  let tituloEditor = '';
  
  if (isNovoSubSubtema && indexSubtema !== null) {
    // Criar novo sub-subtema dentro de um subtema
    tituloEditor = `Novo Sub-subtema em: ${dadosMateria.subtemas[indexSubtema]?.titulo || 'Subtema'}`;
    subtemaAtual = { titulo: '', conteudo: '' };
  } else if (indexSubSubtema !== null && indexSubtema !== null && dadosMateria.subtemas[indexSubtema]?.subSubtemas) {
    // Editando sub-subtema existente
    tituloEditor = `Sub-subtema: ${dadosMateria.subtemas[indexSubtema].subSubtemas[indexSubSubtema]?.titulo || 'Sem título'}`;
    subtemaAtual = dadosMateria.subtemas[indexSubtema].subSubtemas[indexSubSubtema];
  } else if (isNovoSubtema) {
    // Criar novo subtema
    tituloEditor = `Novo Subtema em: ${materia}`;
    subtemaAtual = { titulo: '', conteudo: '' };
  } else if (indexSubtema !== null && dadosMateria.subtemas && dadosMateria.subtemas[indexSubtema]) {
    // Editando subtema existente
    tituloEditor = `Subtema: ${dadosMateria.subtemas[indexSubtema].titulo || 'Sem título'}`;
    subtemaAtual = dadosMateria.subtemas[indexSubtema];
  } else {
    // Modo antigo (compatibilidade) - criar subtema único
    tituloEditor = `Novo Subtema em: ${materia}`;
    subtemaAtual = { titulo: materia, conteudo: '' };
  }
  
  appDiv.innerHTML = `
    <div class="editor-container">
      <div class="editor-header">
        <h1>📝 Editor de Resumos</h1>
        <div class="editor-header-info">
          <span class="editor-materia-badge">Matéria: ${materia}</span>
          ${tituloEditor ? `<span class="editor-subtema-badge">${tituloEditor}</span>` : ''}
        </div>
        <div class="editor-header-buttons">
          <button id="btn-salvar-resumo" class="btn-salvar">💾 Salvar</button>
          <button id="btn-voltar-editor" class="btn-voltar">← Voltar</button>
        </div>
      </div>
      
      <div class="editor-toolbar-container">
        <div class="editor-toolbar" id="toolbar">
          <!-- Formatação de texto -->
          <div class="toolbar-group">
            <button class="toolbar-btn" data-command="bold" title="Negrito (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button class="toolbar-btn" data-command="italic" title="Itálico (Ctrl+I)">
              <em>I</em>
            </button>
            <button class="toolbar-btn" data-command="underline" title="Sublinhado (Ctrl+U)">
              <u>U</u>
            </button>
            <button class="toolbar-btn" data-command="strikeThrough" title="Tachado">
              <s>S</s>
            </button>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Cores -->
          <div class="toolbar-group">
            <input type="color" id="cor-texto" class="toolbar-color" title="Cor do texto" value="#000000">
            <button class="toolbar-btn" id="btn-remover-formato" title="Remover formatação">
              🧹
            </button>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Tamanho da fonte -->
          <div class="toolbar-group">
            <select id="font-size" class="toolbar-select" title="Tamanho da fonte">
              <option value="12px">12px</option>
              <option value="14px" selected>14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Alinhamento -->
          <div class="toolbar-group">
            <button class="toolbar-btn" data-command="justifyLeft" title="Alinhar à esquerda">
              ⬅
            </button>
            <button class="toolbar-btn" data-command="justifyCenter" title="Centralizar">
              ⬌
            </button>
            <button class="toolbar-btn" data-command="justifyRight" title="Alinhar à direita">
              ➡
            </button>
            <button class="toolbar-btn" data-command="justifyFull" title="Justificar">
              ⬌⬌
            </button>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Títulos -->
          <div class="toolbar-group">
            <select id="heading-select" class="toolbar-select" title="Estilo de título">
              <option value="">Texto normal</option>
              <option value="h1">Título 1</option>
              <option value="h2">Título 2</option>
              <option value="h3">Título 3</option>
              <option value="h4">Título 4</option>
            </select>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Listas -->
          <div class="toolbar-group">
            <button class="toolbar-btn" data-command="insertUnorderedList" title="Lista com marcadores">
              •
            </button>
            <button class="toolbar-btn" data-command="insertOrderedList" title="Lista numerada">
              1.
            </button>
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Imagem -->
          <div class="toolbar-group">
            <button class="toolbar-btn" id="btn-inserir-imagem" title="Inserir imagem">
              🖼️
            </button>
            <input type="file" id="input-imagem" accept="image/*" style="display: none;">
          </div>
          
          <div class="toolbar-separator"></div>
          
          <!-- Colunas -->
          <div class="toolbar-group">
            <button class="toolbar-btn" id="btn-coluna-1" title="1 coluna" data-cols="1">1</button>
            <button class="toolbar-btn" id="btn-coluna-2" title="2 colunas" data-cols="2">2</button>
            <button class="toolbar-btn" id="btn-coluna-3" title="3 colunas" data-cols="3">3</button>
          </div>
        </div>
      </div>
      
      <div class="editor-content">
        <div class="editor-subtema-container">
          <div class="editor-subtema-header">
            <input type="text" id="subtema-titulo" class="subtema-titulo-input" 
                   placeholder="Título do subtema" value="${subtemaAtual.titulo || ''}">
          </div>
          
          <div class="editor-area-container">
            <div class="editor-area ${subtemaAtual.colunas && subtemaAtual.colunas > 1 ? `editor-cols-${subtemaAtual.colunas}` : ''}" id="editor-area" contenteditable="true">
              ${subtemaAtual.conteudo ? (subtemaAtual.conteudo.includes('editor-cols-') ? 
                (subtemaAtual.conteudo.match(/<div[^>]*editor-cols-\d+[^>]*>([\s\S]*)<\/div>/) || [null, subtemaAtual.conteudo])[1] || subtemaAtual.conteudo : 
                subtemaAtual.conteudo) : '<p>Comece a escrever seu resumo aqui...</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Event listeners
  setupToolbar();
  setupEditor();
  
  document.getElementById("btn-salvar-resumo").onclick = () => salvarResumoCompleto();
  document.getElementById("btn-voltar-editor").onclick = () => {
    if (confirm("Tem certeza que deseja sair? Alterações não salvas serão perdidas.")) {
      import('./resumos-novo.js').then(m => m.renderResumos());
    }
  };
  
  document.getElementById("btn-inserir-imagem").onclick = () => {
    document.getElementById("input-imagem").click();
  };
  
  document.getElementById("input-imagem").onchange = (e) => {
    inserirImagem(e.target.files[0]);
  };
  
  // Cor do texto
  document.getElementById("cor-texto").onchange = (e) => {
    const editor = getEditorAtivo();
    if (!editor) return;
    editor.focus();
    document.execCommand('foreColor', false, e.target.value);
  };
  
  // Remover formatação
  document.getElementById("btn-remover-formato").onclick = () => {
    const editor = getEditorAtivo();
    if (!editor) return;
    editor.focus();
    document.execCommand('removeFormat', false, null);
    atualizarToolbar();
  };
  
  // Colunas
  document.querySelectorAll('[id^="btn-coluna-"]').forEach(btn => {
    btn.onclick = () => {
      const cols = parseInt(btn.dataset.cols);
      aplicarColunas(cols);
      document.querySelectorAll('[id^="btn-coluna-"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });
  
  renderMenuLateral();
}

function setupEditor() {
  const editor = document.getElementById("editor-area");
  if (!editor) return;
  
  editor.onfocus = () => atualizarToolbar();
  
  // Suporte para arrastar e soltar imagens
  editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  
  editor.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        inserirImagem(file);
      }
    });
  });
  
  // Previne colar HTML perigoso
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  });
  
  // Redimensionamento de imagens
  editor.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      mostrarControlesImagem(e.target);
    }
  });
}

function aplicarColunas(numColunas) {
  const editor = document.getElementById("editor-area");
  if (!editor) return;
  
  // Remove classes de colunas anteriores
  editor.className = editor.className.replace(/editor-cols-\d+/g, '');
  
  if (numColunas > 1) {
    editor.classList.add(`editor-cols-${numColunas}`);
  }
}

function mostrarControlesImagem(img) {
  // Remove controles anteriores
  const controlesAntigos = document.querySelectorAll('.img-controls');
  controlesAntigos.forEach(c => c.remove());
  
  // Cria controles
  const controles = document.createElement('div');
  controles.className = 'img-controls';
  controles.innerHTML = `
    <div class="img-controls-content">
      <label>Tamanho: 
        <input type="range" id="img-size" min="20" max="100" value="${parseInt(img.style.width) || 100}">
        <span id="img-size-value">${parseInt(img.style.width) || 100}%</span>
      </label>
      <button class="btn-remover-imagem">🗑️ Remover</button>
    </div>
  `;
  
  // Posiciona controles
  const rect = img.getBoundingClientRect();
  controles.style.position = 'fixed';
  controles.style.top = `${rect.bottom + 10}px`;
  controles.style.left = `${rect.left}px`;
  controles.style.zIndex = '10000';
  
  document.body.appendChild(controles);
  
  // Slider de tamanho
  const slider = controles.querySelector('#img-size');
  const valueSpan = controles.querySelector('#img-size-value');
  
  slider.oninput = (e) => {
    const valor = e.target.value;
    img.style.width = `${valor}%`;
    img.style.height = 'auto';
    valueSpan.textContent = `${valor}%`;
  };
  
  // Remover imagem
  controles.querySelector('.btn-remover-imagem').onclick = () => {
    img.remove();
    controles.remove();
  };
  
  // Remove controles ao clicar fora
  setTimeout(() => {
    const removerControles = (e) => {
      if (!controles.contains(e.target) && e.target !== img) {
        controles.remove();
        document.removeEventListener('click', removerControles);
      }
    };
    setTimeout(() => document.addEventListener('click', removerControles), 100);
  }, 100);
}

// Função removida - agora usamos estrutura diferente

function setupToolbar() {
  // Botões de formatação
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const editor = getEditorAtivo();
      if (!editor) {
        // Foca no primeiro editor visível
        const firstEditor = document.querySelector('.editor-area');
        if (firstEditor) firstEditor.focus();
        return;
      }
      
      const command = btn.dataset.command;
      document.execCommand(command, false, null);
      editor.focus();
      atualizarToolbar();
    };
  });
  
  // Tamanho da fonte
  document.getElementById("font-size").onchange = (e) => {
    const editor = getEditorAtivo();
    if (!editor) return;
    
    editor.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        // Se não há seleção, aplica ao próximo texto digitado
        document.execCommand('fontSize', false, '3');
        const spans = editor.querySelectorAll('font[size="3"]');
        if (spans.length > 0) {
          spans[spans.length - 1].style.fontSize = e.target.value;
        }
      } else {
        // Aplica à seleção
        const span = document.createElement('span');
        span.style.fontSize = e.target.value;
        try {
          range.surroundContents(span);
        } catch (err) {
          // Fallback: cria span e insere
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }
      }
    }
    editor.focus();
  };
  
  // Título
  document.getElementById("heading-select").onchange = (e) => {
    const editor = getEditorAtivo();
    if (!editor) return;
    
    editor.focus();
    const tag = e.target.value;
    if (tag) {
      document.execCommand('formatBlock', false, `<${tag}>`);
    } else {
      document.execCommand('formatBlock', false, '<p>');
    }
    atualizarToolbar();
  };
  
  // Atualiza toolbar quando seleção muda
  document.addEventListener('selectionchange', () => {
    const editor = getEditorAtivo();
    if (editor && editor.contains(document.activeElement)) {
      atualizarToolbar();
    }
  });
}

function atualizarToolbar() {
  // Atualiza estado dos botões baseado na seleção
  const editor = getEditorAtivo();
  if (!editor) return;
  
  // Foca no editor para que os comandos funcionem
  const hadFocus = document.activeElement === editor;
  if (!hadFocus) {
    editor.focus();
  }
  
  document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
    const command = btn.dataset.command;
    try {
      const active = document.queryCommandState(command);
      btn.classList.toggle('active', active);
    } catch (e) {
      // Ignora erros
    }
  });
  
  if (!hadFocus) {
    // Restaura foco se não tinha antes
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) {
        editor.blur();
      }
    }
  }
}

// Funções antigas removidas - nova estrutura não precisa mais

function inserirImagem(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem válido.');
    return;
  }
  
  // Verifica tamanho (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Imagem muito grande! Máximo permitido: 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const editor = getEditorAtivo();
    if (editor) {
      editor.focus();
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '15px auto';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      img.contentEditable = 'false';
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Remove seleção vazia ou colapsada
        if (!range.collapsed) {
          range.deleteContents();
        }
        range.insertNode(img);
        // Move cursor após a imagem
        range.setStartAfter(img);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Se não há seleção, adiciona no final
        editor.appendChild(img);
        // Move cursor após a imagem
        const range = document.createRange();
        range.setStartAfter(img);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      
      editor.focus();
    }
  };
  reader.onerror = () => {
    alert('Erro ao carregar a imagem.');
  };
  reader.readAsDataURL(file);
}

function getEditorAtivo() {
  return document.getElementById("editor-area");
}

function salvarResumoCompleto() {
  const tituloInput = document.getElementById("subtema-titulo");
  const editor = document.getElementById("editor-area");
  
  if (!tituloInput || !editor) return false;
  
  const titulo = tituloInput.value.trim();
  let conteudo = editor.innerHTML.trim();
  
  // Salva o número de colunas
  const numColunas = editor.classList.contains('editor-cols-2') ? 2 : 
                     editor.classList.contains('editor-cols-3') ? 3 : 1;
  
  // Adiciona atributo data-cols ao conteúdo para preservar colunas
  if (numColunas > 1) {
    // Cria um wrapper com as colunas
    const wrapper = document.createElement('div');
    wrapper.className = `editor-cols-${numColunas}`;
    wrapper.innerHTML = conteudo;
    conteudo = wrapper.outerHTML;
  }
  
  if (!titulo) {
    alert('Por favor, preencha o título do subtema.');
    tituloInput.focus();
    return false;
  }
  
  const resumos = carregarResumos();
  
  // Inicializa matéria se não existir
  if (!resumos[materiaAtual]) {
    resumos[materiaAtual] = { subtemas: [] };
  }
  
  // Determina onde salvar
  if (novoSubSubtema && indexSubtemaAtual !== null) {
    // Criar novo sub-subtema
    if (!resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas) {
      resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas = [];
    }
    resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas.push({
      titulo: titulo,
      conteudo: conteudo,
      colunas: numColunas
    });
  } else if (indexSubSubtemaAtual !== null && indexSubtemaAtual !== null) {
    // Atualiza sub-subtema existente
    resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas[indexSubSubtemaAtual] = {
      titulo: titulo,
      conteudo: conteudo,
      colunas: numColunas
    };
  } else if (indexSubtemaAtual === null || novoSubtema) {
    // Criar novo subtema
    resumos[materiaAtual].subtemas.push({
      titulo: titulo,
      conteudo: conteudo,
      colunas: numColunas,
      subSubtemas: []
    });
  } else {
    // Atualiza subtema existente
    if (!resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas) {
      resumos[materiaAtual].subtemas[indexSubtemaAtual].subSubtemas = [];
    }
    resumos[materiaAtual].subtemas[indexSubtemaAtual] = {
      ...resumos[materiaAtual].subtemas[indexSubtemaAtual],
      titulo: titulo,
      conteudo: conteudo,
      colunas: numColunas
    };
  }
  
  try {
    localStorage.setItem('resumos', JSON.stringify(resumos));
    
    // Mostra mensagem de sucesso
    const mensagem = document.createElement('div');
    mensagem.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 3000; font-weight: 600;';
    mensagem.textContent = '✅ Resumo salvo com sucesso!';
    document.body.appendChild(mensagem);
    
    setTimeout(() => {
      mensagem.remove();
      // Volta para a lista de resumos
      import('./resumos-novo.js').then(m => m.renderResumos());
    }, 1500);
    
    return true;
  } catch (e) {
    alert('❌ Erro ao salvar resumo: ' + e.message);
    return false;
  }
}

