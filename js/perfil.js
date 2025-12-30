// js/perfil.js
console.log('📄 Página de perfil carregada');

export function renderPerfil() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div style="padding: 24px">
      <h2>Perfil</h2>
      <p>Em construção 🚧</p>
    </div>
  `;
}
