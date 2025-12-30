// js/perfil.js
// Página de perfil do usuário

import { renderMenuLateral, setPaginaAtual } from './navegacao.js';
import { getUser, saveUser, loadUser } from './storage.js';
import { supabase } from './supabase.js';
import API_CONFIG from './config.js';

const appDiv = document.getElementById("app");

export function renderPerfil() {
  setPaginaAtual('perfil');
  appDiv.className = 'perfil-page';
  
  // Garante que o usuário está carregado com dados atualizados
  loadUser().catch(console.error);
  
  // Carrega dados mais atualizados do localStorage
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const user = getUser();
  
  // Prioriza: userData (localStorage) > user (objeto) > padrão
  const nome = userData.name || userData.nome || (user && user.nome) || 'Usuário';
  const email = userData.email || 'usuario@email.com';
  const foto = userData.foto || user?.foto || '';
  
  appDiv.innerHTML = `
    <h1 class="page-title">👤 Meu Perfil</h1>
    
    <div class="perfil-container">
      <div class="perfil-header">
        <div class="perfil-foto-container">
          <img src="${foto || 'https://via.placeholder.com/150?text=Usuário'}" alt="Foto do usuário" id="perfil-foto-preview" class="perfil-foto">
          <button id="btn-alterar-foto" class="btn-alterar-foto">📷 Alterar Foto</button>
          <input type="file" id="input-foto" accept="image/*" style="display: none;">
        </div>
        <div class="perfil-info">
          <h2>${nome}</h2>
          <p>${email}</p>
        </div>
      </div>
      
      <div class="perfil-form">
        <div class="form-section">
          <h3>Informações Pessoais</h3>
          <div class="form-group">
            <label for="perfil-nome">Nome Completo</label>
            <input type="text" id="perfil-nome" value="${nome}" class="form-input">
          </div>
          <div class="form-group">
            <label for="perfil-email">Email</label>
            <input type="email" id="perfil-email" value="${email}" class="form-input" disabled>
            <small class="form-hint">O email não pode ser alterado</small>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Alterar Senha</h3>
          <div class="form-group">
            <label for="perfil-senha-atual">Senha Atual</label>
            <input type="password" id="perfil-senha-atual" class="form-input" placeholder="Digite sua senha atual">
          </div>
          <div class="form-group">
            <label for="perfil-senha-nova">Nova Senha</label>
            <input type="password" id="perfil-senha-nova" class="form-input" placeholder="Mínimo 8 caracteres" minlength="8">
          </div>
          <div class="form-group">
            <label for="perfil-senha-confirmar">Confirmar Nova Senha</label>
            <input type="password" id="perfil-senha-confirmar" class="form-input" placeholder="Digite a senha novamente">
          </div>
          <button id="btn-alterar-senha" class="btn-primary">🔒 Alterar Senha</button>
        </div>
        
        <div class="form-actions">
          <button id="btn-salvar-perfil" class="btn-primary">💾 Salvar Alterações</button>
        </div>
      </div>
    </div>
  `;
  
  setupPerfilListeners();
  renderMenuLateral();
}

function setupPerfilListeners() {
  // Alterar foto
  document.getElementById('btn-alterar-foto').onclick = () => {
    document.getElementById('input-foto').click();
  };
  
  document.getElementById('input-foto').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fotoUrl = event.target.result;
        document.getElementById('perfil-foto-preview').src = fotoUrl;
        // Salva temporariamente
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        userData.foto = fotoUrl;
        localStorage.setItem('currentUser', JSON.stringify(userData));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Salvar perfil
  document.getElementById('btn-salvar-perfil').onclick = async () => {
    const nome = document.getElementById('perfil-nome').value.trim();
    if (!nome) {
      alert('Por favor, preencha o nome');
      return;
    }
    
    // Carrega dados atuais do localStorage
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const foto = userData.foto || '';
    
    // Se usar Supabase, atualiza no banco
    if (API_CONFIG.USE_SUPABASE && supabase && userData.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: nome,
            foto: foto
          })
          .eq('id', userData.id);

        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          alert('❌ Erro ao salvar perfil no servidor');
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('❌ Erro ao salvar perfil');
      }
    }
    
    // Atualiza no objeto userData
    userData.name = nome;
    userData.nome = nome;
    
    // Atualiza também no objeto currentUser
    const user = getUser();
    if (user) {
      user.nome = nome;
      if (foto) {
        user.foto = foto;
      }
    }
    
    // Salva no localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Recarrega o usuário para sincronizar
    await loadUser();
    const updatedUser = getUser();
    if (updatedUser) {
      updatedUser.nome = nome;
      if (foto) {
        updatedUser.foto = foto;
      }
      // Salva via saveUser para garantir sincronização
      await saveUser();
    }
    
    alert('✅ Perfil atualizado com sucesso!');
    
    // Atualiza o dashboard se estiver na página principal
    import('./navegacao.js').then(nav => {
      if (nav.getPaginaAtual() === 'dashboard') {
        import('./dashboard.js').then(dash => dash.renderDashboard());
      }
    });
    
    renderPerfil();
  };
  
  // Alterar senha
  document.getElementById('btn-alterar-senha').onclick = async () => {
    const senhaAtual = document.getElementById('perfil-senha-atual').value;
    const senhaNova = document.getElementById('perfil-senha-nova').value;
    const senhaConfirmar = document.getElementById('perfil-senha-confirmar').value;
    
    if (!senhaAtual || !senhaNova || !senhaConfirmar) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (senhaNova.length < 8) {
      alert('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }
    
    if (senhaNova !== senhaConfirmar) {
      alert('As senhas não coincidem');
      return;
    }
    
    // Se usar Supabase, atualiza senha
    if (API_CONFIG.USE_SUPABASE && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: senhaNova
        });

        if (error) {
          alert('❌ Erro ao alterar senha: ' + error.message);
          return;
        }

        alert('✅ Senha alterada com sucesso!');
        document.getElementById('perfil-senha-atual').value = '';
        document.getElementById('perfil-senha-nova').value = '';
        document.getElementById('perfil-senha-confirmar').value = '';
      } catch (error) {
        alert('❌ Erro ao alterar senha: ' + error.message);
      }
    } else {
      // Modo mock - apenas simula
      alert('✅ Senha alterada com sucesso!');
      document.getElementById('perfil-senha-atual').value = '';
      document.getElementById('perfil-senha-nova').value = '';
      document.getElementById('perfil-senha-confirmar').value = '';
    }
  };
}