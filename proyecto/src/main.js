import './style.css';
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js';
import { mostrarLogin } from './login.js';
import { mostrarMVP } from './mvp.js';
import { mostrarUser } from './user.js';
import { mostrarAdmin } from './admin.js';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header id="header">
      <div class="header-content">
        <div class="logo">
          <img src="https://cdn-icons-png.flaticon.com/512/220/220214.png" alt="Pinterest" />
          <h1>Pinterest Clone</h1>
        </div>
        <nav id="menu"></nav>
      </div>
    </header>
    <main id="app"></main>
  </div>
`;

const routes = {
  registro: mostrarRegistro,
  login: mostrarLogin,
  inicio: mostrarMVP,
  perfil: mostrarUser,
  admin: mostrarAdmin,
};

async function cerrarSesion() {
  await supabase.auth.signOut();
  await cargarMenu();
  mostrarLogin();
}

export async function cargarMenu() {
  const menu = document.getElementById('menu');
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    menu.innerHTML = `
      <div class="nav-buttons">
        <button data-action="login" class="btn-secondary">Iniciar sesión</button>
        <button data-action="registro" class="btn-primary">Registrarse</button>
      </div>
    `;
    mostrarLogin();
  } else {
    // Obtener datos del usuario
    const { data: userData } = await supabase
      .from('estudiantes')
      .select('nombre, avatar')
      .eq('correo', user.email)
      .single();

    menu.innerHTML = `
      <div class="nav-buttons">
        <button data-action="inicio" class="btn-nav">🏠 Inicio</button>
        <button data-action="perfil" class="btn-nav">👤 Perfil</button>
        ${user.email === 'admin@mail.com' ? '<button data-action="admin" class="btn-nav">⚙️ Admin</button>' : ''}
        <div class="user-menu">
          <img src="${userData?.avatar || 'https://ui-avatars.com/api/?name=User'}" alt="Avatar" class="user-avatar" />
          <span>${userData?.nombre || 'Usuario'}</span>
          <button data-action="logout" class="btn-danger btn-sm">Salir</button>
        </div>
      </div>
    `;
    mostrarMVP();
  }

  // Event listeners
  menu.querySelectorAll('button').forEach(button => {
    const action = button.getAttribute('data-action');
    if (action === 'logout') {
      button.addEventListener('click', cerrarSesion);
    } else if (routes[action]) {
      button.addEventListener('click', routes[action]);
    }
  });
}

document.addEventListener('DOMContentLoaded', cargarMenu);