// js/auth.js - Versão FINAL e CORRIGIDA (sem erro de sintaxe)

import { supabase } from './supabase.js';
import API_CONFIG from './config.js';
import { loadUser, setCurrentUserId } from './storage.js';
import { renderDashboard } from './dashboard.js';

const appDiv = document.getElementById('app');

function showError(msg) {
  alert(msg);
  console.error('Erro:', msg);
}

function hideMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'none';
}

function showMenu() {
  const menu = document.getElementById('menu-lateral');
  if (menu) menu.style.display = 'flex';
}

export async function isAuthenticated() {
  if (!API_CONFIG.USE_SUPABASE || !supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

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

async function handleLogin(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showError('Email ou senha inválidos');
    return;
  }

  await afterAuthSuccess(data.user);
}

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

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
    showError(error.message);
    return;
  }

  alert('Conta criada com sucesso! Faça login para continuar.');
  renderLogin();
}

async function afterAuthSuccess(user) {
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || 'Usuário'
  }));

  setCurrentUserId(user.id);
  await loadUser();  // O trigger já criou o perfil e progresso

  showMenu();
  renderDashboard();
}

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  localStorage.removeItem('currentUser');
  sessionStorage.clear();
  setCurrentUserId(null);

  hideMenu();
  renderLogin();
}

// Listener global de autenticação
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session?.user) {
      await afterAuthSuccess(session.user);
    }
  } else if (event === 'SIGNED_OUT') {
    logout();
  }
});