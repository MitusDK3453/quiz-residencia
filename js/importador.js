// js/importador.js
// Sistema de importação de questões

import { questoes } from './questoes.js';
import { processarPDF } from './pdf-processor.js';
import { renderDashboard } from './dashboard.js';

const appDiv = document.getElementById("app");

export function renderImportador() {
  appDiv.className = '';
  appDiv.innerHTML = `
    <h1>Importar Questões</h1>
    
    <div class="import-section">
      <h2>Opção 1: Importar de PDF</h2>
      <p>Faça upload de um arquivo PDF com questões para extrair automaticamente.</p>
      
      <div class="upload-area" id="uploadArea">
        <input type="file" id="fileInput" accept=".pdf" style="display: none;">
        <button id="btnSelecionarPDF" class="btn-primary">Selecionar PDF</button>
        <p id="nomeArquivo" style="margin-top: 10px; color: #666;"></p>
      </div>
      
      <div style="margin: 20px 0;">
        <label for="assuntoPDF">Assunto das questões:</label>
        <input type="text" id="assuntoPDF" placeholder="Ex: Cardiologia, Neurologia..." value="Geral" style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 8px;">
      </div>
      
      <div id="progressoPDF" style="display: none; margin: 20px 0;">
        <p>Processando PDF... <span id="progressoTexto">0/0</span></p>
        <progress id="progressBar" value="0" max="100" style="width: 100%;"></progress>
      </div>
      
      <button id="btnProcessarPDF" class="btn-primary" style="display: none;">Processar PDF</button>
      
      <div id="resultadoPDF" style="margin-top: 20px;"></div>
    </div>
    
    <div class="import-section" style="margin-top: 40px;">
      <h2>Opção 2: Importar de JSON</h2>
      <p>Importe questões de um arquivo JSON gerado pelo script Python ou criado manualmente.</p>
      
      <div class="upload-area">
        <input type="file" id="fileInputJSON" accept=".json" style="display: none;">
        <button id="btnSelecionarJSON" class="btn-primary">Selecionar JSON</button>
        <p id="nomeArquivoJSON" style="margin-top: 10px; color: #666;"></p>
      </div>
      
      <button id="btnProcessarJSON" class="btn-primary" style="display: none; margin-top: 10px;">Importar JSON</button>
      
      <div id="resultadoJSON" style="margin-top: 20px;"></div>
    </div>
    
    <div class="import-section" style="margin-top: 40px;">
      <h2>Opção 3: Adicionar Questão Manualmente</h2>
      <form id="formQuestaoManual">
        <div style="margin: 15px 0;">
          <label>Pergunta:</label>
          <textarea id="perguntaManual" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-family: inherit;"></textarea>
        </div>
        
        <div style="margin: 15px 0;">
          <label>Alternativas:</label>
          <input type="text" id="altA" placeholder="Alternativa A" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 8px;">
          <input type="text" id="altB" placeholder="Alternativa B" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 8px;">
          <input type="text" id="altC" placeholder="Alternativa C" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 8px;">
          <input type="text" id="altD" placeholder="Alternativa D" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 8px;">
          <input type="text" id="altE" placeholder="Alternativa E (opcional)" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ccc; border-radius: 8px;">
        </div>
        
        <div style="margin: 15px 0;">
          <label>Resposta Correta:</label>
          <select id="corretaManual" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
            <option value="4">E</option>
          </select>
        </div>
        
        <div style="margin: 15px 0;">
          <label>Explicação (opcional):</label>
          <textarea id="explicacaoManual" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-family: inherit;"></textarea>
        </div>
        
        <div style="margin: 15px 0;">
          <label>Assunto:</label>
          <input type="text" id="assuntoManual" placeholder="Ex: Cardiologia" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">
        </div>
        
        <button type="submit" class="btn-primary">Adicionar Questão</button>
      </form>
      
      <div id="resultadoManual" style="margin-top: 20px;"></div>
    </div>
    
    <div class="botoes-navegacao" style="margin-top: 40px;">
      <button id="btnVoltarDashboard" class="btn-secondary">Voltar ao Dashboard</button>
      <button id="btnExportarQuestoes" class="btn-secondary">Exportar Todas as Questões (JSON)</button>
    </div>
  `;
  
  // Event listeners para PDF
  const fileInputPDF = document.getElementById("fileInput");
  const btnSelecionarPDF = document.getElementById("btnSelecionarPDF");
  const btnProcessarPDF = document.getElementById("btnProcessarPDF");
  const nomeArquivoPDF = document.getElementById("nomeArquivo");
  let arquivoPDFSelecionado = null;
  
  btnSelecionarPDF.onclick = () => fileInputPDF.click();
  fileInputPDF.onchange = (e) => {
    arquivoPDFSelecionado = e.target.files[0];
    if (arquivoPDFSelecionado) {
      nomeArquivoPDF.textContent = `Arquivo selecionado: ${arquivoPDFSelecionado.name}`;
      btnProcessarPDF.style.display = "block";
    }
  };
  
  btnProcessarPDF.onclick = async () => {
    if (!arquivoPDFSelecionado) return;
    
    const assunto = document.getElementById("assuntoPDF").value || "Geral";
    const progressoDiv = document.getElementById("progressoPDF");
    const progressoTexto = document.getElementById("progressoTexto");
    const progressBar = document.getElementById("progressBar");
    const resultadoDiv = document.getElementById("resultadoPDF");
    
    progressoDiv.style.display = "block";
    btnProcessarPDF.disabled = true;
    resultadoDiv.innerHTML = "";
    
    try {
      const questoesExtraidas = await processarPDF(
        arquivoPDFSelecionado,
        assunto,
        (paginaAtual, totalPaginas) => {
          progressoTexto.textContent = `${paginaAtual}/${totalPaginas}`;
          progressBar.value = (paginaAtual / totalPaginas) * 100;
        }
      );
      
      if (questoesExtraidas.length > 0) {
        // Adiciona questões ao array
        questoes.push(...questoesExtraidas);
        salvarQuestoes();
        
        resultadoDiv.innerHTML = `
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; color: #065f46;">
            ✓ ${questoesExtraidas.length} questões importadas com sucesso!
            <br><small>Revise os gabaritos, pois alguns podem precisar de correção manual.</small>
          </div>
        `;
        
        // Limpa formulário
        fileInputPDF.value = "";
        arquivoPDFSelecionado = null;
        nomeArquivoPDF.textContent = "";
        btnProcessarPDF.style.display = "none";
      } else {
        resultadoDiv.innerHTML = `
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #991b1b;">
            ✗ Nenhuma questão foi extraída. Verifique se o PDF contém texto e está no formato esperado.
          </div>
        `;
      }
    } catch (erro) {
      resultadoDiv.innerHTML = `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #991b1b;">
          ✗ Erro ao processar PDF: ${erro.message}
        </div>
      `;
    } finally {
      progressoDiv.style.display = "none";
      btnProcessarPDF.disabled = false;
    }
  };
  
  // Event listeners para JSON
  const fileInputJSON = document.getElementById("fileInputJSON");
  const btnSelecionarJSON = document.getElementById("btnSelecionarJSON");
  const btnProcessarJSON = document.getElementById("btnProcessarJSON");
  const nomeArquivoJSON = document.getElementById("nomeArquivoJSON");
  let arquivoJSONSelecionado = null;
  
  btnSelecionarJSON.onclick = () => fileInputJSON.click();
  fileInputJSON.onchange = (e) => {
    arquivoJSONSelecionado = e.target.files[0];
    if (arquivoJSONSelecionado) {
      nomeArquivoJSON.textContent = `Arquivo selecionado: ${arquivoJSONSelecionado.name}`;
      btnProcessarJSON.style.display = "block";
    }
  };
  
  btnProcessarJSON.onclick = () => {
    if (!arquivoJSONSelecionado) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const questoesImportadas = JSON.parse(e.target.result);
        
        if (Array.isArray(questoesImportadas)) {
          questoes.push(...questoesImportadas);
          salvarQuestoes();
          
          document.getElementById("resultadoJSON").innerHTML = `
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; color: #065f46;">
              ✓ ${questoesImportadas.length} questões importadas com sucesso!
            </div>
          `;
          
          fileInputJSON.value = "";
          arquivoJSONSelecionado = null;
          nomeArquivoJSON.textContent = "";
          btnProcessarJSON.style.display = "none";
        } else {
          throw new Error("Formato inválido: o JSON deve ser um array de questões");
        }
      } catch (erro) {
        document.getElementById("resultadoJSON").innerHTML = `
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #991b1b;">
            ✗ Erro ao importar JSON: ${erro.message}
          </div>
        `;
      }
    };
    reader.readAsText(arquivoJSONSelecionado);
  };
  
  // Event listener para questão manual
  document.getElementById("formQuestaoManual").onsubmit = (e) => {
    e.preventDefault();
    
    const pergunta = document.getElementById("perguntaManual").value.trim();
    const altA = document.getElementById("altA").value.trim();
    const altB = document.getElementById("altB").value.trim();
    const altC = document.getElementById("altC").value.trim();
    const altD = document.getElementById("altD").value.trim();
    const altE = document.getElementById("altE").value.trim();
    const correta = parseInt(document.getElementById("corretaManual").value);
    const explicacao = document.getElementById("explicacaoManual").value.trim();
    const assunto = document.getElementById("assuntoManual").value.trim() || "Geral";
    
    if (!pergunta || !altA || !altB) {
      document.getElementById("resultadoManual").innerHTML = `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #991b1b;">
          ✗ Preencha pelo menos a pergunta e as alternativas A e B.
        </div>
      `;
      return;
    }
    
    const alternativas = [altA, altB];
    if (altC) alternativas.push(altC);
    if (altD) alternativas.push(altD);
    if (altE) alternativas.push(altE);
    
    const novaQuestao = {
      pergunta,
      alternativas,
      correta,
      explicacao: explicacao || "Sem explicação disponível.",
      assunto
    };
    
    questoes.push(novaQuestao);
    salvarQuestoes();
    
    document.getElementById("resultadoManual").innerHTML = `
      <div style="background: #d1fae5; padding: 15px; border-radius: 8px; color: #065f46;">
        ✓ Questão adicionada com sucesso!
      </div>
    `;
    
    // Limpa formulário
    document.getElementById("formQuestaoManual").reset();
    document.getElementById("assuntoManual").value = "";
  };
  
  // Botões de navegação
  document.getElementById("btnVoltarDashboard").onclick = renderDashboard;
  
  document.getElementById("btnExportarQuestoes").onclick = () => {
    const json = JSON.stringify(questoes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questoes_exportadas.json";
    a.click();
    URL.revokeObjectURL(url);
  };
}

// Salva questões no localStorage (backup)
function salvarQuestoes() {
  try {
    // Atualiza o módulo questoes.js dinamicamente não é possível,
    // então salvamos no localStorage como backup
    localStorage.setItem("questoes_backup", JSON.stringify(questoes));
    
    // Para persistir permanentemente, você precisará atualizar o arquivo questoes.js manualmente
    // ou usar um servidor para salvar
    console.log(`Questões salvas (${questoes.length} total). Nota: Atualize o arquivo questoes.js para persistência permanente.`);
  } catch (e) {
    console.error("Erro ao salvar questões:", e);
  }
}

// Carrega questões do backup se existir
export function carregarQuestoesBackup() {
  try {
    const backup = localStorage.getItem("questoes_backup");
    if (backup) {
      const questoesBackup = JSON.parse(backup);
      // Adiciona questões do backup que não estão no array principal
      const idsExistentes = new Set(questoes.map(q => q.pergunta));
      questoesBackup.forEach(q => {
        if (!idsExistentes.has(q.pergunta)) {
          questoes.push(q);
        }
      });
    }
  } catch (e) {
    console.error("Erro ao carregar backup:", e);
  }
}

