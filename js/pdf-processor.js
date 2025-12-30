// js/pdf-processor.js
// Processador de PDF no navegador usando PDF.js

let pdfjsLib = null;

// Carrega PDF.js dinamicamente
async function carregarPDFJS() {
  if (pdfjsLib) return pdfjsLib;
  
  // Usa CDN do PDF.js
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(script);
  
  return new Promise((resolve, reject) => {
    script.onload = () => {
      pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = reject;
  });
}

// Limpa texto extraído
function limparTexto(texto) {
  if (!texto) return "";
  return texto.replace(/\s+/g, ' ').trim();
}

// Identifica questões no texto
function identificarQuestoes(texto) {
  const questoes = [];
  
  // Padrão para questão: número seguido de pergunta
  const padraoQuestao = /(?:^|\n)\s*(?:QUESTÃO\s*)?(\d+)[\.\)]\s*(.+?)(?=\n\s*(?:QUESTÃO\s*)?\d+[\.\)]|\n\s*[A-Ea-e][\.\)]|\Z)/gs;
  
  // Padrão para alternativas
  const padraoAlternativas = /([A-Ea-e])[\.\)]\s*([^\n]+?)(?=\n\s*[A-Ea-e][\.\)]|\n\s*(?:GABARITO|RESPOSTA|GAB|CORRETA|CORRETO)|\Z)/gi;
  
  // Padrão para gabarito
  const padraoGabarito = /(?:GABARITO|RESPOSTA|GAB|CORRETA|CORRETO)[\s:]*([A-E])/i;
  
  let match;
  const questoesEncontradas = [];
  
  // Encontra todas as questões
  while ((match = padraoQuestao.exec(texto)) !== null) {
    const numQuestao = match[1];
    const conteudo = match[2];
    
    // Extrai alternativas
    const alternativas = [];
    let altMatch;
    const conteudoCopy = conteudo;
    
    while ((altMatch = padraoAlternativas.exec(conteudoCopy)) !== null) {
      const letra = altMatch[1].toUpperCase();
      const textoAlt = limparTexto(altMatch[2]);
      if (textoAlt) {
        alternativas.push({ letra, texto: textoAlt });
      }
    }
    
    // Remove alternativas da pergunta
    let pergunta = conteudo;
    padraoAlternativas.lastIndex = 0;
    while ((altMatch = padraoAlternativas.exec(conteudo)) !== null) {
      pergunta = pergunta.replace(altMatch[0], '');
    }
    pergunta = limparTexto(pergunta);
    
    // Procura gabarito
    const posFim = match.index + match[0].length;
    const textoRestante = texto.substring(posFim, posFim + 500);
    const gabMatch = padraoGabarito.exec(textoRestante);
    
    let gabarito = null;
    if (gabMatch) {
      gabarito = gabMatch[1].toUpperCase();
    }
    
    if (pergunta && alternativas.length >= 2) {
      questoesEncontradas.push({
        numero: numQuestao,
        pergunta,
        alternativas: alternativas.sort((a, b) => a.letra.localeCompare(b.letra)),
        gabarito
      });
    }
  }
  
  return questoesEncontradas;
}

// Processa arquivo PDF
export async function processarPDF(arquivo, assunto = "Geral", callbackProgresso) {
  try {
    await carregarPDFJS();
    
    const arrayBuffer = await arquivo.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let textoCompleto = "";
    
    // Extrai texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      if (callbackProgresso) {
        callbackProgresso(i, pdf.numPages);
      }
      
      const pagina = await pdf.getPage(i);
      const texto = await pagina.getTextContent();
      const textoPagina = texto.items.map(item => item.str).join(' ');
      textoCompleto += textoPagina + "\n";
    }
    
    // Identifica questões
    const questoesRaw = identificarQuestoes(textoCompleto);
    
    // Converte para formato do site
    const questoesFormatadas = questoesRaw.map(q => {
      const alternativas = q.alternativas.map(alt => alt.texto);
      const letras = q.alternativas.map(alt => alt.letra);
      
      // Determina índice correto
      let indiceCorreto = 0;
      if (q.gabarito) {
        const idx = letras.indexOf(q.gabarito);
        if (idx !== -1) {
          indiceCorreto = idx;
        }
      }
      
      return {
        pergunta: q.pergunta,
        alternativas: alternativas.slice(0, 5), // Máximo 5 alternativas
        correta: indiceCorreto,
        explicacao: `Questão extraída do PDF. Gabarito: ${q.gabarito || 'Não identificado - REVISAR'}`,
        assunto: assunto
      };
    });
    
    return questoesFormatadas;
    
  } catch (erro) {
    console.error("Erro ao processar PDF:", erro);
    throw erro;
  }
}

