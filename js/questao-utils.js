// js/questao-utils.js
// Utilitários para gerenciar questões

import { questoes } from './questoes.js';

// Gera um ID único para uma questão baseado no seu conteúdo
export function gerarQuestaoId(questao) {
  // Usa a pergunta como base para o hash (mais confiável que índice)
  const texto = questao.pergunta + questao.assunto;
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Encontra uma questão pelo ID
export function encontrarQuestaoPorId(questaoId) {
  return questoes.find(q => gerarQuestaoId(q) === questaoId);
}

// Encontra o índice de uma questão no array
export function encontrarIndiceQuestao(questao) {
  const questaoId = gerarQuestaoId(questao);
  return questoes.findIndex(q => gerarQuestaoId(q) === questaoId);
}

