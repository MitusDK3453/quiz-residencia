// js/auth.js - Versão SIMPLES e FUNCIONAL (com trigger no banco)

import { supabase } from './supabase.js';
import API_CONFIG from './config.js';
import { loadUser, setCurrentUserId } from './storage.js';
import { renderDashboard } from './dashboard.js';

const appDiv = document.getElementById('app');

function showError(msg) {
  alert(msg);
}

function hideMenu() {
  document.getElementById('menu-lateral')?.style.display = 'none';
}

function showMenu() {
  document.getElementById('menu-lateral')?.style.display = 'flex';
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
      <p><a href="#" id="go-register">Criar conta</a></p>
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
      <p><a href="#" id="go-login">Já tenho conta</a></p>
    </div>
  `;
  document.getElementById('register-form').onsubmit = handleRegister;
  document.getElementById('go-login').onclick = renderLogin;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value.trim().toLowerCase();
  const password = e.target.password.value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showError(error.message || 'Erro no login');
  await afterAuthSuccess(data.user);
}

async function handleRegister(e) {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim().toLowerCase();
  const password = e.target.password.value;

  if (password.length < 8) return showError('Senha precisa ter pelo menos 8 caracteres');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) return showError(error.message);

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
  await loadUser();  // Agora o row já existe (criado pelo trigger)

  showMenu();
  renderDashboard();
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('currentUser');
  setCurrentUserId(null);
  hideMenu();
  renderLogin();
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
    await afterAuthSuccess(session.user);
  } else if (event === 'SIGNED_OUT') {
    logout();
  }
});