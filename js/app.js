// js/app.js - COM SUPORTE MOBILE
import { loadUser } from './storage.js';
import { renderDashboard } from './dashboard.js';
import { carregarQuestoesBackup } from './importador.js';
import { renderMenuLateral } from './navegacao.js';
import { isAuthenticated, renderLogin } from './auth.js';
import { inicializarMenuMobile } from './mobile-menu.js';

function mostrarErroCORS() {
  const app = document.getElementById("app");
  if (app && !app.innerHTML.includes("servidor local")) {
    app.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ Erro ao Carregar</h1>
        <p style="font-size: 1.2em; margin-bottom: 30px;">
          Este site precisa ser aberto através de um <strong>servidor local</strong> para funcionar corretamente.
        </p>
        
        <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
          <h2 style="color: #1e40af; margin-top: 0;">Como resolver:</h2>
          
          <h3 style="color: #1e40af; margin-top: 20px;">Opção 1: Python (Mais Fácil)</h3>
          <ol style="line-height: 2;">
            <li>Abra o terminal na pasta do projeto</li>
            <li>Execute: <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">python -m http.server 8000</code></li>
            <li>Abra no navegador: <a href="http://localhost:8000" target="_blank" style="color: #2563eb;">http://localhost:8000</a></li>
          </ol>
          
          <h3 style="color: #1e40af; margin-top: 20px;">Opção 2: Use o arquivo servidor.bat</h3>
          <ol style="line-height: 2;">
            <li>Dê duplo clique no arquivo <strong>servidor.bat</strong></li>
            <li>Abra no navegador: <a href="http://localhost:8000" target="_blank" style="color: #2563eb;">http://localhost:8000</a></li>
          </ol>
          
          <h3 style="color: #1e40af; margin-top: 20px;">Opção 3: VS Code</h3>
          <ol style="line-height: 2;">
            <li>Instale a extensão "Live Server"</li>
            <li>Clique com botão direito no index.html</li>
            <li>Selecione "Open with Live Server"</li>
          </ol>
        </div>
        
        <p style="color: #64748b; margin-top: 30px;">
          <small>Isso acontece porque os módulos JavaScript (import/export) não funcionam com arquivos locais (file://) por questões de segurança.</small>
        </p>
      </div>
    `;
  }
}

// Captura erros de módulos (CORS, etc)
window.addEventListener('error', (e) => {
  if (e.message && (
      e.message.includes('Failed to fetch') || 
      e.message.includes('CORS') ||
      e.message.includes('module') ||
      e.message.includes('import') ||
      e.filename && e.filename.includes('.js'))) {
    setTimeout(() => {
      const app = document.getElementById("app");
      if (app && app.innerHTML.trim() === '') {
        mostrarErroCORS();
      }
    }, 500);
  }
}, true);

// Inicializa a aplicação
try {
  // Inicializa menu mobile
  inicializarMenuMobile();
  
  // Verifica autenticação
  isAuthenticated().then(autenticado => {
    if (!autenticado) {
      const menu = document.getElementById('menu-lateral');
      if (menu) menu.style.display = 'none';
      renderLogin();
    } else {
      const menu = document.getElementById('menu-lateral');
      if (menu) menu.style.display = 'flex';
      loadUser().catch(console.error);
      carregarQuestoesBackup();
      renderMenuLateral();
      renderDashboard();
    }
  }).catch(err => {
    console.error('Erro na autenticação:', err);
    // Modo desenvolvimento - acesso direto
    const menu = document.getElementById('menu-lateral');
    if (menu) menu.style.display = 'flex';
    loadUser();
    carregarQuestoesBackup();
    renderMenuLateral();
    renderDashboard();
  });
} catch (e) {
  console.error("Erro ao inicializar:", e);
  setTimeout(() => mostrarErroCORS(), 500);
}

// Dark Mode Toggle
window.toggleDarkMode = function() {
  try {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    // Atualiza o menu se já estiver renderizado
    const menu = document.getElementById('menu-lateral');
    if (menu) {
      import('./navegacao.js').then(m => m.renderMenuLateral());
    }
  } catch (e) {
    console.error("Erro no dark mode:", e);
  }
};

// Aplicar modo salvo ao carregar
try {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark");
  }
} catch (e) {
  console.error("Erro ao aplicar configurações:", e);
}