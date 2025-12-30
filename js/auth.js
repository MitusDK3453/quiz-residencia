// js/auth.js
// Autenticação com Supabase (login, registro, logout) - Versão corrigida

import { supabase } from './supabase.js';
import API_CONFIG from './config.js';
import { loadUser, setCurrentUserId } from './storage.js';
import { renderDashboard } from './dashboard.js';

const appDiv = document.getElementById('app');

/* ======================================================
   HELPERS
====================================================== */

function showError(msg) {
  alert(msg);
  console.error('Erro de autenticação:', msg);
}

function hideMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
}

function showMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'flex';
}

/* ======================================================
   VERIFICA AUTENTICAÇÃO
====================================================== */

export async function isAuthenticated() {
  if (!API_CONFIG.USE_SUPABASE || !supabase) return false;
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error('Erro ao verificar sessão:', error);
  return !!data.session;
}

/* ======================================================
   TELAS
====================================================== */

export function renderLogin() {
  hideMenu();
  appDiv.innerHTML = `
    <div class="auth-container">
      <h2>🔐 Login</h2>
      <form id="login-form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
      <p>
        <a href="#" id="go-register">Criar conta</a>
      </p>
    </div>
  `;

  document.getElementById('login-form').onsubmit = handleLogin;
  document.getElementById('go-register').onclick = renderRegister;
}

export function renderRegister() {
  hideMenu();
  appDiv.innerHTML = `
    <div class="auth-container">
      <h2>📝 Criar Conta</h2>
      <form id="register-form">
        <input type="text" name="name" placeholder="Nome" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Senha (mín. 8 caracteres)" required />
        <button type="submit">Registrar</button>
      </form>
      <p>
        <a href="#" id="go-login">Já tenho conta</a>
      </p>
    </div>
  `;

  document.getElementById('register-form').onsubmit = handleRegister;
  document.getElementById('go-login').onclick = renderLogin;
}

/* ======================================================
   LOGIN
====================================================== */

async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  if (!email || !password) {
    showError('Preencha email e senha');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Erro no login:', error);
    if (error.message.includes('Invalid login credentials')) {
      showError('Email ou senha inválidos');
    } else {
      showError('Erro ao fazer login: ' + error.message);
    }
    return;
  }

  if (!data.user) {
    showError('Usuário não encontrado após login');
    return;
  }

  await afterAuthSuccess(data.user);
}

/* ======================================================
   REGISTRO
====================================================== */

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  if (!name || !email || !password) {
    showError('Preencha todos os campos');
    return;
  }

  if (password.length < 8) {
    showError('Senha precisa ter pelo menos 8 caracteres');
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    console.error('Erro no signup:', error);
    if (error.message.includes('rate limit')) {
      showError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    } else if (error.message.includes('already registered')) {
      showError('Este email já está registrado. Faça login.');
    } else {
      showError('Erro ao registrar: ' + error.message);
    }
    return;
  }

  if (!data.user) {
    showError('Usuário não criado corretamente');
    return;
  }

  console.log('Usuário criado com sucesso:', data.user.id);

  // Aguarda um momento para a sessão ser propagada (importante!)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Atualiza sessão manualmente
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.warn('Sessão ainda não ativa. Tentando refresh...');
    await supabase.auth.refreshSession();
  }

  // Agora tenta criar perfil e progresso (com upsert para segurança)
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, name }, { onConflict: 'id' });

    if (profileError) {
      console.error('Erro ao criar/atualizar perfil:', profileError);
      // Não bloqueia o fluxo - perfil pode ser criado depois
    } else {
      console.log('Perfil criado/atualizado');
    }
  } catch (err) {
    console.error('Exceção ao criar perfil:', err);
  }

  try {
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({ user_id: data.user.id }, { onConflict: 'user_id' });

    if (progressError) {
      console.error('Erro ao criar progresso:', progressError);
    } else {
      console.log('Row de progresso criado/atualizado');
    }
  } catch (err) {
    console.error('Exceção ao criar progresso:', err);
  }

  // Salva dados do usuário localmente para compatibilidade
  localStorage.setItem('currentUser', JSON.stringify({
    id: data.user.id,
    email: data.user.email,
    name: name
  }));

  await afterAuthSuccess(data.user);
}

/* ======================================================
   PÓS LOGIN / REGISTRO
====================================================== */

async function afterAuthSuccess(user) {
  console.log('Autenticação bem-sucedida para usuário:', user.id);

  // Salva no localStorage
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || 'Usuário'
  }));

  // Define ID global
  setCurrentUserId(user.id);

  // Carrega progresso (agora com a versão corrigida do storage.js)
  await loadUser();

  showMenu();
  renderDashboard();
}

/* ======================================================
   LOGOUT
====================================================== */

export async function logout() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao fazer logout:', error);
  }

  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  sessionStorage.clear();

  // Limpa usuário atual
  setCurrentUserId(null);

  hideMenu();
  renderLogin();
}