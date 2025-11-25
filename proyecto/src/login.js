// src/login.js
import { supabase } from './supabase.js';
import { mostrarRegistro } from './register.js';

export function mostrarLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <img src="https://cdn-icons-png.flaticon.com/512/220/220214.png" alt="Logo" class="logo">
        <h2>Bienvenido a Pinterest</h2>
        <p class="subtitle">Inicia sesión para continuar</p>
        
        <form id="login-form">
          <input type="email" name="correo" placeholder="Correo electrónico" required />
          <input type="password" name="password" placeholder="Contraseña" required />
          <button type="submit" class="btn-primary">Iniciar sesión</button>
        </form>
        
        <p id="error" class="error-msg"></p>
        
        <div class="divider">
          <span>o</span>
        </div>
        
        <p class="switch-auth">
          ¿No tienes cuenta? <a href="#" id="ir-registro">Regístrate</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error');
  const irRegistro = document.getElementById('ir-registro');

  irRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarRegistro();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const correo = form.correo.value.trim();
    const password = form.password.value.trim();

    if (!correo || !password) {
      errorMsg.textContent = '❌ Por favor completa todos los campos.';
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password,
    });

    if (error) {
      errorMsg.textContent = '❌ Error: ' + error.message;
      return;
    }

    console.log('✅ Usuario logueado:', data.user);
    location.reload();
  });
}