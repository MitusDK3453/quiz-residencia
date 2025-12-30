// js/auth.js
// Autenticação com Supabase (login, registro, logout)

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
  const { data } = await supabase.auth.getSession();
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
        <input type="password" name="password" placeholder="Senha (mín. 8)" required />
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
  const email = form.email.value.toLowerCase();
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

/* ======================================================
   REGISTRO
====================================================== */

async function handleRegister(e) {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value;
  const email = form.email.value.toLowerCase();
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

  // cria perfil
  await supabase.from('profiles').insert({
    id: data.user.id,
    name
  });

  // cria progresso inicial
  await supabase.from('user_progress').insert({
    user_id: data.user.id
  });

  await afterAuthSuccess(data.user);
}

/* ======================================================
   PÓS LOGIN / REGISTRO
====================================================== */

async function afterAuthSuccess(user) {
  // salva ID do usuário
  setCurrentUserId(user.id);

  // carrega progresso
  await loadUser();

  showMenu();
  renderDashboard();
}

/* ======================================================
   LOGOUT
====================================================== */

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  localStorage.removeItem('authToken');
  sessionStorage.clear();

  hideMenu();
  renderLogin();
}