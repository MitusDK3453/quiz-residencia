// js/auth.js - FINAL

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

export async function isAuthenticated() {
  if (!API_CONFIG.USE_SUPABASE || !supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export function renderLogin() {
  hideMenu();
  appDiv.innerHTML = /* seu HTML de login */;
  // ... (mesmo de antes)
}

export function renderRegister() {
  hideMenu();
  appDiv.innerHTML = /* seu HTML de registro */;
  // ... (mesmo de antes)
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

  if (password.length < 8) return showError('Senha curta');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (error) return showError(error.message);

  alert('Conta criada! Faça login.');
  renderLogin();
}

async function createInitialData(user) {
  // Perfil
  await supabase
    .from('profiles')
    .upsert({ id: user.id, name: user.user_metadata?.name || 'Usuário' }, { returning: 'minimal' });

  // Progresso
  await supabase
    .from('user_progress')
    .upsert({ user_id: user.id }, { returning: 'minimal' });
}

async function afterAuthSuccess(user) {
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || 'Usuário'
  }));

  setCurrentUserId(user.id);
  await loadUser();
  await createInitialData(user);

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