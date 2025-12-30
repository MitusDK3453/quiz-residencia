// js/resumos.js
// Leitor de PDF simples

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';

const appDiv = document.getElementById("app");

export function renderResumos() {
  setPaginaAtual('resumos');
  appDiv.className = 'resumos-page';
  
  // Carrega PDF salvo
  const pdfData = localStorage.getItem('resumoPdf');
  const pdfNome = localStorage.getItem('resumoPdfNome') || 'Nenhum PDF carregado';
  
  appDiv.innerHTML = `
    <h1 class="page-title">📚 Resumos</h1>
    
    <div class="pdf-viewer-container">
      <div class="pdf-controls">
        <div class="pdf-upload-section">
          <button type="button" id="btn-trigger-upload" class="btn-upload-pdf">
            📄 ${pdfData ? 'Trocar PDF' : 'Importar PDF'}
          </button>
          <input type="file" id="pdf-upload" accept="application/pdf,.pdf" style="display: none;">
          <span class="pdf-nome">${pdfNome}</span>
          ${pdfData ? '<button id="btn-remover-pdf" class="btn-remover-pdf">🗑️ Remover PDF</button>' : ''}
        </div>
      </div>
      
      <div id="pdf-viewer" class="pdf-viewer">
        ${pdfData ? `
          <object data="${pdfData}" type="application/pdf" width="100%" height="100%">
            <iframe src="${pdfData}" width="100%" height="100%" style="border: none;"></iframe>
            <p style="padding: 20px; text-align: center; color: #64748b;">
              Seu navegador não suporta visualização de PDF. 
              <a href="${pdfData}" download="${pdfNome}" style="color: #2563eb;">Clique aqui para baixar</a>
            </p>
          </object>
        ` : `
          <div class="pdf-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📄</div>
              <h2>Nenhum PDF carregado</h2>
              <p>Clique no botão acima para importar um PDF</p>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
  
  setupPdfListeners();
  renderMenuLateral();
}

function setupPdfListeners() {
  const uploadInput = document.getElementById('pdf-upload');
  const triggerBtn = document.getElementById('btn-trigger-upload');
  const removeBtn = document.getElementById('btn-remover-pdf');
  
  if (!uploadInput) {
    console.error('Input de upload não encontrado');
    return;
  }
  
  // Botão que aciona o input
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      uploadInput.click();
    });
  }
  
  // Listener no input
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    // Verifica se é PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('❌ Por favor, selecione um arquivo PDF válido.');
      e.target.value = ''; // Limpa o input
      return;
    }
    
    // Verifica tamanho do arquivo (localStorage tem limite de ~5-10MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`❌ O arquivo é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O limite é 5MB.`);
      e.target.value = '';
      return;
    }
    
    // Mostra feedback de carregamento
    const pdfNomeSpan = document.querySelector('.pdf-nome');
    if (pdfNomeSpan) {
      pdfNomeSpan.textContent = 'Carregando...';
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const pdfDataUrl = event.target.result;
        const fileName = file.name;
        
        // Verifica se o data URL é válido
        if (!pdfDataUrl || !pdfDataUrl.startsWith('data:application/pdf')) {
          throw new Error('Formato de arquivo inválido');
        }
        
        // Salva no localStorage
        localStorage.setItem('resumoPdf', pdfDataUrl);
        localStorage.setItem('resumoPdfNome', fileName);
        
        // Recarrega a página para mostrar o PDF
        renderResumos();
      } catch (error) {
        console.error('Erro ao salvar PDF:', error);
        alert('❌ Erro ao salvar o PDF. Tente novamente.');
        if (pdfNomeSpan) {
          pdfNomeSpan.textContent = 'Erro ao carregar';
        }
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erro no FileReader:', error);
      alert('❌ Erro ao ler o arquivo. Tente novamente.');
      if (pdfNomeSpan) {
        pdfNomeSpan.textContent = 'Erro ao carregar';
      }
      e.target.value = '';
    };
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        if (pdfNomeSpan) {
          pdfNomeSpan.textContent = `Carregando... ${percentLoaded}%`;
        }
      }
    };
    
    reader.readAsDataURL(file);
  });
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja remover o PDF atual?')) {
        localStorage.removeItem('resumoPdf');
        localStorage.removeItem('resumoPdfNome');
        renderResumos();
      }
    });
  }
}
