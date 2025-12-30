// js/config.js
// Configuração da API - Ajuste para produção

const API_CONFIG = {
  // ============================================
  // OPÇÕES DE BACKEND
  // ============================================
  // Escolha UMA opção:
  
  // Opção 1: Supabase (Recomendado - Gratuito)
  USE_SUPABASE: true, // ← Mude para true para usar Supabase
  
  // Opção 2: Backend próprio (Node.js + PostgreSQL)
  USE_MOCK_API: true, // ← false para usar backend real
  BASE_URL: 'http://localhost:3000/api', // URL do backend
  
  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  TIMEOUT: 10000, // Timeout para requisições (milissegundos)
  
  // ============================================
  // NOTAS
  // ============================================
  // - Se USE_SUPABASE = true, configure js/supabase.js
  // - Se USE_MOCK_API = false, configure BASE_URL
  // - Se ambos false, usa localStorage (desenvolvimento)
};

export default API_CONFIG;
