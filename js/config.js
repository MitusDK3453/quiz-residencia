// js/config.js
// Configuração da API - Ajuste para produção

const API_CONFIG = {
  USE_SUPABASE: true,    // ✅ true
  USE_MOCK_API: false,   // ⚠️ false (importante!)
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

export default API_CONFIG;
