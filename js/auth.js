// js/auth.js - VERSÃO CORRIGIDA
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';
import { loadUser, setCurrentUserId, saveUser } from './storage.js';
import { renderDashboard } from './dashboard.js';
import { renderMenuLateral } from './navegacao.js';

const appDiv = document.getElementById('app');

// ===============================
// HELPERS
// ===============================

function showError(msg) {
  const errorDiv = document.getElementById('auth-error');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  } else {
    alert(msg);
  }
}

function hideMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
}

function showMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'flex';
}

// ===============================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ===============================

export async function isAuthenticated() {
  if (!API_CONFIG.USE_SUPABASE || !supabase) return false;
  
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

// ===============================
// TELAS DE LOGIN E REGISTRO
// ===============================

export function renderLogin() {
  hideMenu();
  appDiv.className = 'auth-page';
  appDiv.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h1>🔐 Login</h1>
        <p>Entre na sua conta para continuar</p>
      </div>
      
      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" name="email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        
        <div class="form-group">
          <label for="login-password">Senha</label>
          <div class="password-input-wrapper">
            <input type="password" id="login-password" name="password" placeholder="Sua senha" required autocomplete="current-password">
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility('login-password')">👁️</button>
          </div>
        </div>
        
        <button type="submit" class="btn-auth btn-primary">Entrar</button>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
      </form>
      
      <div class="auth-divider">
        <span>ou</span>
      </div>
      
      <p style="text-align: center; margin-top: 20px;">
        Não tem conta? 
        <a href="#" id="go-register" style="color: #2563eb; font-weight: 600;">Criar conta</a>
      </p>
    </div>
  `;

  document.getElementById('login-form').onsubmit = handleLogin;
  document.getElementById('go-register').onclick = (e) => {
    e.preventDefault();
    renderRegister();
  };
}

export function renderRegister() {
  hideMenu();
  appDiv.className = 'auth-page';
  appDiv.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h1>📝 Criar Conta</h1>
        <p>Registre-se para começar</p>
      </div>
      
      <form id="register-form" class="auth-form">
        <div class="form-group">
          <label for="register-name">Nome Completo</label>
          <input type="text" id="register-name" name="name" placeholder="Seu nome" required autocomplete="name">
        </div>
        
        <div class="form-group">
          <label for="register-email">Email</label>
          <input type="email" id="register-email" name="email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        
        <div class="form-group">
          <label for="register-password">Senha</label>
          <div class="password-input-wrapper">
            <input type="password" id="register-password" name="password" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password">
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility('register-password')">👁️</button>
          </div>
          <small class="form-hint">Use pelo menos 8 caracteres</small>
        </div>
        
        <div class="form-group">
          <label for="register-confirm">Confirmar Senha</label>
          <div class="password-input-wrapper">
            <input type="password" id="register-confirm" name="confirm" placeholder="Digite a senha novamente" required minlength="8" autocomplete="new-password">
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility('register-confirm')">👁️</button>
          </div>
        </div>
        
        <button type="submit" class="btn-auth btn-primary">Criar Conta</button>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
      </form>
      
      <div class="auth-divider">
        <span>ou</span>
      </div>
      
      <p style="text-align: center; margin-top: 20px;">
        Já tem conta? 
        <a href="#" id="go-login" style="color: #2563eb; font-weight: 600;">Fazer login</a>
      </p>
    </div>
  `;

  document.getElementById('register-form').onsubmit = handleRegister;
  document.getElementById('go-login').onclick = (e) => {
    e.preventDefault();
    renderLogin();
  };
}

// ===============================
// HANDLER DE LOGIN
// ===============================

async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  if (!email || !password) {
    showError('Preencha todos os campos');
    return;
  }

  try {
    console.log('🔐 Tentando login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      showError('Email ou senha inválidos');
      return;
    }

    if (data.user) {
      console.log('✅ Login bem-sucedido:', data.user.email);
      await afterAuthSuccess(data.user);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    showError('Erro ao fazer login. Tente novamente.');
  }
}

// ===============================
// HANDLER DE REGISTRO
// ===============================

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const confirm = form.confirm.value;

  // Validações
  if (!name || !email || !password || !confirm) {
    showError('Preencha todos os campos');
    return;
  }

  if (password.length < 8) {
    showError('A senha deve ter pelo menos 8 caracteres');
    return;
  }

  if (password !== confirm) {
    showError('As senhas não coincidem');
    return;
  }

  try {
    console.log('📝 Criando conta...');
    
    // 1. Cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      console.error('Erro no registro:', error);
      showError(error.message);
      return;
    }

    if (data.user) {
      console.log('✅ Usuário criado:', data.user.email);
      
      // 2. Cria perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      } else {
        console.log('✅ Perfil criado');
      }

      // 3. Cria progresso inicial na tabela user_progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: data.user.id,
          total_questoes: 0,
          total_acertos: 0,
          progresso_diario: {},
          meta_semanal: 50,
          questoes_erradas: [],
          questoes_acertadas: [],
          historico_questoes: [],
          estatisticas_por_assunto: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (progressError) {
        console.error('Erro ao criar progresso:', progressError);
      } else {
        console.log('✅ Progresso criado');
      }

      // 4. Prossegue com o login
      await afterAuthSuccess(data.user);
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    showError('Erro ao criar conta. Tente novamente.');
  }
}

// ===============================
// PÓS-AUTENTICAÇÃO
// ===============================

async function afterAuthSuccess(user) {
  try {
    console.log('🎉 Autenticação bem-sucedida');
    
    // 1. Define o ID do usuário no storage
    setCurrentUserId(user.id);
    
    // 2. Salva dados básicos no localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'Usuário'
    }));
    
    // 3. Carrega progresso do usuário
    await loadUser();
    
    // 4. Mostra menu e dashboard
    showMenu();
    renderMenuLateral();
    renderDashboard();
    
    console.log('✅ Usuário carregado e dashboard renderizado');
  } catch (error) {
    console.error('Erro pós-autenticação:', error);
    showError('Erro ao carregar dados. Tente fazer login novamente.');
  }
}

// ===============================
// LOGOUT
// ===============================

export async function logout() {
  try {
    console.log('👋 Fazendo logout...');
    
    if (supabase) {
      await supabase.auth.signOut();
    }

    // Limpa dados locais
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.clear();

    hideMenu();
    renderLogin();
    
    console.log('✅ Logout realizado');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}

// ===============================
// HELPER GLOBAL PARA MOSTRAR/OCULTAR SENHA
// ===============================

window.togglePasswordVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
};