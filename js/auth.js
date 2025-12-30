// js/auth.js
// Sistema de autenticação completo

import { renderDashboard } from './dashboard.js';
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const appDiv = document.getElementById("app");

// Verifica se o usuário está autenticado
export function isAuthenticated() {
  // Para desenvolvimento: permite acesso sem autenticação se não houver token
  // Em produção, sempre verificar autenticação
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  
  // Se não houver token mas houver usuário (modo desenvolvimento), permite acesso
  if (!token && user) {
    return true; // Modo desenvolvimento - permite continuar
  }
  
  return !!(token && user);
}

// Renderiza a tela de login
export function renderLogin() {
  // Esconde o menu lateral
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
  
  appDiv.className = 'auth-page';
  appDiv.style.marginLeft = '0';
  appDiv.style.maxWidth = '100%';
  appDiv.innerHTML = `
    <div class="auth-container">
      <div class="auth-card-integrado">
        <div class="auth-header">
          <h1>🔐 Login</h1>
          <p>Entre na sua conta para continuar</p>
        </div>
        
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="email" required 
                   placeholder="seu@email.com" autocomplete="email">
          </div>
          
          <div class="form-group">
            <label for="login-password">Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="login-password" name="password" required 
                     placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="toggle-password" data-target="login-password">👁️</button>
            </div>
          </div>
          
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" id="remember-me" name="remember">
              <span>Lembrar-me</span>
            </label>
            <a href="#" id="forgot-password-link" class="forgot-link">Esqueceu a senha?</a>
          </div>
          
          <button type="submit" class="btn-auth btn-primary">Entrar</button>
          
          <div class="auth-divider">
            <span>ou</span>
          </div>
          
          <button type="button" id="go-to-register" class="btn-auth btn-secondary">
            Criar nova conta
          </button>
        </form>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
      </div>
    </div>
  `;
  
  setupLoginListeners();
}

// Renderiza a tela de registro
export function renderRegister() {
  // Esconde o menu lateral
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
  
  appDiv.className = 'auth-page';
  appDiv.style.marginLeft = '0';
  appDiv.style.maxWidth = '100%';
  appDiv.innerHTML = `
    <div class="auth-container">
      <div class="auth-card-integrado">
        <div class="auth-header">
          <h1>📝 Criar Conta</h1>
          <p>Registre-se para começar a estudar</p>
        </div>
        
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="register-name">Nome Completo</label>
            <input type="text" id="register-name" name="name" required 
                   placeholder="Seu nome completo" autocomplete="name">
          </div>
          
          <div class="form-group">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" name="email" required 
                   placeholder="seu@email.com" autocomplete="email">
          </div>
          
          <div class="form-group">
            <label for="register-password">Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="register-password" name="password" required 
                     placeholder="Mínimo 8 caracteres" autocomplete="new-password" minlength="8">
              <button type="button" class="toggle-password" data-target="register-password">👁️</button>
            </div>
            <div class="password-strength" id="password-strength"></div>
          </div>
          
          <div class="form-group">
            <label for="register-confirm-password">Confirmar Senha</label>
            <div class="password-input-wrapper">
              <input type="password" id="register-confirm-password" name="confirmPassword" required 
                     placeholder="Digite a senha novamente" autocomplete="new-password">
              <button type="button" class="toggle-password" data-target="register-confirm-password">👁️</button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="terms-checkbox">
              <input type="checkbox" id="accept-terms" name="terms" required>
              <span>Eu aceito os <a href="#" id="terms-link">termos de uso</a> e <a href="#" id="privacy-link">política de privacidade</a></span>
            </label>
          </div>
          
          <button type="submit" class="btn-auth btn-primary">Criar Conta</button>
          
          <div class="auth-divider">
            <span>ou</span>
          </div>
          
          <button type="button" id="go-to-login" class="btn-auth btn-secondary">
            Já tenho uma conta
          </button>
        </form>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
      </div>
    </div>
  `;
  
  setupRegisterListeners();
}

// Renderiza a tela de recuperação de senha
export function renderForgotPassword() {
  // Esconde o menu lateral
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
  
  appDiv.className = 'auth-page';
  appDiv.style.marginLeft = '0';
  appDiv.style.maxWidth = '100%';
  appDiv.innerHTML = `
    <div class="auth-container">
      <div class="auth-card-integrado">
        <div class="auth-header">
          <h1>🔑 Recuperar Senha</h1>
          <p>Digite seu email para receber o link de recuperação</p>
        </div>
        
        <form id="forgot-password-form" class="auth-form">
          <div class="form-group">
            <label for="forgot-email">Email</label>
            <input type="email" id="forgot-email" name="email" required 
                   placeholder="seu@email.com" autocomplete="email">
          </div>
          
          <button type="submit" class="btn-auth btn-primary">Enviar Link de Recuperação</button>
          
          <button type="button" id="back-to-login" class="btn-auth btn-secondary">
            Voltar para Login
          </button>
        </form>
        
        <div id="auth-error" class="auth-error" style="display: none;"></div>
        <div id="auth-success" class="auth-success" style="display: none;"></div>
      </div>
    </div>
  `;
  
  setupForgotPasswordListeners();
}

// Configura listeners do login
function setupLoginListeners() {
  const form = document.getElementById('login-form');
  const togglePassword = document.querySelector('.toggle-password[data-target="login-password"]');
  const forgotLink = document.getElementById('forgot-password-link');
  const goToRegister = document.getElementById('go-to-register');
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form);
  };
  
  togglePassword.onclick = () => togglePasswordVisibility('login-password');
  
  forgotLink.onclick = (e) => {
    e.preventDefault();
    renderForgotPassword();
  };
  
  goToRegister.onclick = () => renderRegister();
}

// Configura listeners do registro
function setupRegisterListeners() {
  const form = document.getElementById('register-form');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const toggles = document.querySelectorAll('.toggle-password');
  const goToLogin = document.getElementById('go-to-login');
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleRegister(form);
  };
  
  passwordInput.oninput = () => checkPasswordStrength(passwordInput.value);
  confirmPasswordInput.oninput = () => validatePasswordMatch();
  
  toggles.forEach(toggle => {
    toggle.onclick = () => togglePasswordVisibility(toggle.dataset.target);
  });
  
  goToLogin.onclick = () => renderLogin();
}

// Configura listeners de recuperação de senha
function setupForgotPasswordListeners() {
  const form = document.getElementById('forgot-password-form');
  const backToLogin = document.getElementById('back-to-login');
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleForgotPassword(form);
  };
  
  backToLogin.onclick = () => renderLogin();
}

// Processa login
async function handleLogin(form) {
  const errorDiv = document.getElementById('auth-error');
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember');
  
  errorDiv.style.display = 'none';
  
  try {
    // TODO: Substituir por chamada real à API
    const response = await loginAPI(email, password);
    
    if (response.success) {
      // Salva token e dados do usuário
      if (remember) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('authTokenExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
      } else {
        sessionStorage.setItem('authToken', response.token);
      }
      
      // Se usar Supabase, os dados já vêm completos no response.user
      if (API_CONFIG.USE_SUPABASE) {
        const mergedUser = {
          ...response.user,
          nome: response.user.name || response.user.nome,
          name: response.user.name || response.user.nome
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));
        
        // Sincronizar com storage.js
        import('./storage.js').then(storage => {
          storage.setCurrentUserId(response.user.id);
          storage.loadUser();
        });
      } else {
        // Código antigo para mock/backend próprio
        const userId = response.user.id || response.user.email || `email_${email}`;
        const userStorageKey = `user_${userId}`;
        const existingUserData = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
        
        const isNewUser = !existingUserData.id && !existingUserData.email;
        
        const mergedUser = isNewUser ? {
          ...response.user,
          name: response.user.name || 'Usuário',
          nome: response.user.nome || response.user.name || 'Usuário',
          email: response.user.email || email,
          id: response.user.id || userId,
          totalQuestoes: 0,
          totalAcertos: 0,
          progressoDiario: {},
          metaSemanal: 50,
          questoesErradas: [],
          questoesAcertadas: [],
          historicoQuestoes: [],
          estatisticasPorAssunto: {}
        } : {
          ...existingUserData,
          ...response.user,
          name: existingUserData.name || existingUserData.nome || response.user.name || response.user.nome,
          nome: existingUserData.nome || existingUserData.name || response.user.nome || response.user.name,
          foto: existingUserData.foto || response.user.foto,
          totalQuestoes: existingUserData.totalQuestoes || 0,
          totalAcertos: existingUserData.totalAcertos || 0,
          progressoDiario: existingUserData.progressoDiario || {},
          metaSemanal: existingUserData.metaSemanal || 50,
          questoesErradas: existingUserData.questoesErradas || [],
          questoesAcertadas: existingUserData.questoesAcertadas || [],
          historicoQuestoes: existingUserData.historicoQuestoes || [],
          estatisticasPorAssunto: existingUserData.estatisticasPorAssunto || {}
        };
        
        localStorage.setItem(userStorageKey, JSON.stringify(mergedUser));
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));
        
        import('./storage.js').then(storage => {
          storage.setCurrentUserId(userId);
          storage.loadUser();
        });
      }
      
      // Mostra o menu lateral novamente
      const menu = document.getElementById('menu-lateral');
      if (menu) menu.style.display = 'flex';
      appDiv.style.marginLeft = '';
      appDiv.style.maxWidth = '';
      
      // Redireciona para o dashboard
      import('./navegacao.js').then(m => {
        m.renderMenuLateral();
        renderDashboard();
      });
    } else {
      showError(errorDiv, response.message || 'Email ou senha incorretos');
    }
  } catch (error) {
    showError(errorDiv, 'Erro ao fazer login. Tente novamente.');
    console.error('Login error:', error);
  }
}

// Processa registro
async function handleRegister(form) {
  const errorDiv = document.getElementById('auth-error');
  const formData = new FormData(form);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  errorDiv.style.display = 'none';
  
  // Validações
  if (password !== confirmPassword) {
    showError(errorDiv, 'As senhas não coincidem');
    return;
  }
  
  if (password.length < 8) {
    showError(errorDiv, 'A senha deve ter no mínimo 8 caracteres');
    return;
  }
  
  try {
    // TODO: Substituir por chamada real à API
    const response = await registerAPI(name, email, password);
    
    if (!response.success) {
      showError(errorDiv, response.message || 'Erro ao criar conta. Tente novamente.');
      return;
    }
    
    if (response.success) {
      // Auto-login após registro
      localStorage.setItem('authToken', response.token);
      
      // Para registro, sempre cria um novo usuário com dados limpos
      const userId = response.user.id || `email_${email}`;
      const userStorageKey = `user_${userId}`;
      
      // Cria novo usuário com dados limpos (não preserva progresso de usuários anteriores)
      const mergedUser = {
        ...response.user,
        name: response.user.name || name || 'Usuário',
        nome: response.user.nome || response.user.name || name || 'Usuário',
        email: response.user.email || email,
        id: response.user.id || userId,
        passwordHash: response.user.passwordHash, // Salva o hash da senha
        // Dados iniciais limpos para novo registro
        totalQuestoes: 0,
        totalAcertos: 0,
        progressoDiario: {},
        metaSemanal: 50,
        questoesErradas: [],
        questoesAcertadas: [],
        historicoQuestoes: [],
        estatisticasPorAssunto: {},
        foto: response.user.foto || null
      };
      
      // Salva na chave específica do usuário
      localStorage.setItem(userStorageKey, JSON.stringify(mergedUser));
      localStorage.setItem('currentUser', JSON.stringify(mergedUser));
      
      // Sincroniza o currentUser no storage.js
      import('./storage.js').then(storage => {
        storage.setCurrentUserId(userId);
        storage.loadUser();
      });
      
      // Mostra o menu lateral novamente
      const menu = document.getElementById('menu-lateral');
      if (menu) menu.style.display = 'flex';
      appDiv.style.marginLeft = '';
      appDiv.style.maxWidth = '';
      
      // Redireciona para o dashboard
      import('./navegacao.js').then(m => {
        m.renderMenuLateral();
        renderDashboard();
      });
    } else {
      showError(errorDiv, response.message || 'Erro ao criar conta');
    }
  } catch (error) {
    showError(errorDiv, 'Erro ao criar conta. Tente novamente.');
    console.error('Register error:', error);
  }
}

// Processa recuperação de senha
async function handleForgotPassword(form) {
  const errorDiv = document.getElementById('auth-error');
  const successDiv = document.getElementById('auth-success');
  const formData = new FormData(form);
  const email = formData.get('email');
  
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  try {
    // TODO: Substituir por chamada real à API
    const response = await forgotPasswordAPI(email);
    
    if (response.success) {
      successDiv.textContent = 'Email de recuperação enviado! Verifique sua caixa de entrada.';
      successDiv.style.display = 'block';
    } else {
      showError(errorDiv, response.message || 'Erro ao enviar email de recuperação');
    }
  } catch (error) {
    showError(errorDiv, 'Erro ao processar solicitação. Tente novamente.');
    console.error('Forgot password error:', error);
  }
}

// Funções auxiliares
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
}

function checkPasswordStrength(password) {
  const strengthDiv = document.getElementById('password-strength');
  if (!strengthDiv) return;
  
  let strength = 0;
  let feedback = [];
  
  if (password.length >= 8) strength++;
  else feedback.push('Mínimo 8 caracteres');
  
  if (/[a-z]/.test(password)) strength++;
  else feedback.push('Letra minúscula');
  
  if (/[A-Z]/.test(password)) strength++;
  else feedback.push('Letra maiúscula');
  
  if (/[0-9]/.test(password)) strength++;
  else feedback.push('Número');
  
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  else feedback.push('Caractere especial');
  
  const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
  const strengthColors = ['#dc2626', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
  
  if (password.length > 0) {
    strengthDiv.innerHTML = `
      <div class="strength-bar">
        <div class="strength-fill" style="width: ${strength * 20}%; background: ${strengthColors[strength - 1] || '#dc2626'}"></div>
      </div>
      <p class="strength-text">Força: ${strengthLabels[strength - 1] || 'Muito fraca'}</p>
      ${feedback.length > 0 ? `<p class="strength-feedback">Falta: ${feedback.join(', ')}</p>` : ''}
    `;
  } else {
    strengthDiv.innerHTML = '';
  }
}

function validatePasswordMatch() {
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const confirmInput = document.getElementById('register-confirm-password');
  
  if (confirmPassword.length > 0) {
    if (password !== confirmPassword) {
      confirmInput.setCustomValidity('As senhas não coincidem');
    } else {
      confirmInput.setCustomValidity('');
    }
  }
}

function showError(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Importar configuração da API
import API_CONFIG from './config.js';

// Função simples de hash para desenvolvimento (NÃO usar em produção!)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Função mock de login (usado quando USE_MOCK_API = true)
async function mockLoginAPI(email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userId = `email_${email}`;
      const userStorageKey = `user_${userId}`;
      const existingUser = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
      
      if (!existingUser.email) {
        resolve({
          success: false,
          message: 'Email não cadastrado. Por favor, crie uma conta primeiro.'
        });
        return;
      }
      
      const passwordHash = existingUser.passwordHash;
      if (!passwordHash) {
        resolve({
          success: true,
          token: 'mock_token_' + Date.now(),
          user: {
            id: existingUser.id || userId,
            name: existingUser.name || existingUser.nome || 'Usuário',
            email: existingUser.email || email
          }
        });
        return;
      }
      
      const inputPasswordHash = simpleHash(password);
      if (passwordHash !== inputPasswordHash) {
        resolve({
          success: false,
          message: 'Email ou senha incorretos'
        });
        return;
      }
      
      resolve({
        success: true,
        token: 'mock_token_' + Date.now(),
        user: {
          id: existingUser.id || userId,
          name: existingUser.name || existingUser.nome || 'Usuário',
          email: existingUser.email || email
        }
      });
    }, 500);
  });
}

// Função mock de registro (usado quando USE_MOCK_API = true)
async function mockRegisterAPI(name, email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userId = `email_${email}`;
      const userStorageKey = `user_${userId}`;
      const existingUser = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
      
      if (existingUser.email) {
        resolve({
          success: false,
          message: 'Este email já está cadastrado. Faça login ou use outro email.'
        });
        return;
      }
      
      const uniqueId = `user_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const passwordHash = simpleHash(password);
      
      resolve({
        success: true,
        token: 'mock_token_' + Date.now(),
        user: { 
          id: uniqueId, 
          name: name, 
          email: email,
          passwordHash: passwordHash
        }
      });
    }, 500);
  });
}

// Funções de API (usa Supabase, mock ou API real baseado em config)
async function loginAPI(email, password) {
  // Se estiver usando Supabase
  if (API_CONFIG.USE_SUPABASE && supabase) {
    try {
      // Fazer login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (error) {
        return {
          success: false,
          message: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message
        };
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Criar perfil se não existir
      if (profileError && profileError.code === 'PGRST116') {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Usuário'
          });
      }

      // Buscar progresso
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      return {
        success: true,
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email?.split('@')[0] || 'Usuário',
          nome: profile?.name || data.user.email?.split('@')[0] || 'Usuário',
          foto: profile?.foto || null,
          // Dados de progresso
          totalQuestoes: progress?.total_questoes || 0,
          totalAcertos: progress?.total_acertos || 0,
          progressoDiario: progress?.progresso_diario || {},
          metaSemanal: progress?.meta_semanal || 50,
          questoesErradas: progress?.questoes_erradas || [],
          questoesAcertadas: progress?.questoes_acertadas || [],
          historicoQuestoes: progress?.historico_questoes || [],
          estatisticasPorAssunto: progress?.estatisticas_por_assunto || {}
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro ao fazer login. Tente novamente.'
      };
    }
  }
  
  // Se estiver em modo mock, usa função mock
  if (API_CONFIG.USE_MOCK_API) {
    return await mockLoginAPI(email, password);
  }
  
  // Caso contrário, usa API real (backend próprio)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao fazer login'
      };
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tempo de conexão esgotado. Tente novamente.'
      };
    }
    console.error('Erro na requisição:', error);
    return {
      success: false,
      message: 'Erro de conexão. Verifique sua internet.'
    };
  }
}

async function registerAPI(name, email, password) {
  // Se estiver usando Supabase
  if (API_CONFIG.USE_SUPABASE && supabase) {
    try {
      // Registrar usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: authError.message === 'User already registered'
            ? 'Este email já está cadastrado'
            : authError.message
        };
      }

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: name
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      }

      // Criar progresso inicial
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: authData.user.id
        });

      if (progressError) {
        console.error('Erro ao criar progresso:', progressError);
      }

      return {
        success: true,
        token: authData.session?.access_token || '',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          nome: name,
          foto: null
        }
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        message: 'Erro ao criar conta. Tente novamente.'
      };
    }
  }
  
  // Se estiver em modo mock, usa função mock
  if (API_CONFIG.USE_MOCK_API) {
    return await mockRegisterAPI(name, email, password);
  }
  
  // Caso contrário, usa API real (backend próprio)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao criar conta'
      };
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tempo de conexão esgotado. Tente novamente.'
      };
    }
    console.error('Erro na requisição:', error);
    return {
      success: false,
      message: 'Erro de conexão. Verifique sua internet.'
    };
  }
}

async function forgotPasswordAPI(email) {
  // TODO: Implementar chamada real à API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Email enviado com sucesso' });
    }, 500);
  });
}

// Logout
export function logout() {
  // Se usar Supabase, fazer logout também
  if (API_CONFIG.USE_SUPABASE && supabase) {
    supabase.auth.signOut();
  }
  
  // Remove apenas os dados de autenticação
  localStorage.removeItem('authToken');
  localStorage.removeItem('authTokenExpiry');
  sessionStorage.removeItem('authToken');
  
  // IMPORTANTE: Preserva os dados do usuário (nome, foto, progresso) no localStorage
  // Cria um novo objeto apenas com os dados que queremos preservar
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (userData && Object.keys(userData).length > 0) {
    // Cria objeto apenas com dados que devem ser preservados
    const preservedData = {
      nome: userData.nome || userData.name,
      name: userData.name || userData.nome,
      foto: userData.foto,
      email: userData.email,
      totalQuestoes: userData.totalQuestoes || 0,
      totalAcertos: userData.totalAcertos || 0,
      progressoDiario: userData.progressoDiario || {},
      metaSemanal: userData.metaSemanal || 50
    };
    
    // Remove campos vazios/null
    Object.keys(preservedData).forEach(key => {
      if (preservedData[key] === null || preservedData[key] === undefined) {
        delete preservedData[key];
      }
    });
    
    // Salva os dados preservados (mesmo que vazio, para manter a estrutura)
    localStorage.setItem('currentUser', JSON.stringify(preservedData));
  }
  
  // Esconde o menu lateral
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
  
  renderLogin();
}

