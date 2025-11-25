// src/register.js
import { supabase } from './supabase.js';

export function mostrarRegistro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <img src="https://cdn-icons-png.flaticon.com/512/220/220214.png" alt="Logo" class="logo">
        <h2>Únete a Pinterest</h2>
        <p class="subtitle">Encuentra y guarda ideas creativas</p>
        
        <form id="registro-form">
          <input type="text" name="nombre" placeholder="Nombre completo" required />
          <input type="email" name="correo" placeholder="Correo electrónico" required />
          <input type="password" name="password" placeholder="Contraseña (min. 6 caracteres)" required />
          <input type="text" name="telefono" placeholder="Teléfono (opcional)" />
          <button type="submit" class="btn-primary">Registrarse</button>
        </form>
        
        <p id="error" class="error-msg"></p>
        
        <div class="divider">
          <span>o</span>
        </div>
        
        <p class="switch-auth">
          ¿Ya tienes cuenta? <a href="#" id="ir-login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('registro-form');
  const errorMsg = document.getElementById('error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const telefono = form.telefono.value.trim();

    if (!nombre || !correo || !password) {
      errorMsg.textContent = '❌ Por favor completa todos los campos obligatorios.';
      return;
    }

    if (password.length < 6) {
      errorMsg.textContent = '❌ La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Crear usuario en Auth
    const { data: dataAuth, error: errorAuth } = await supabase.auth.signUp({
      email: correo,
      password: password,
    });

    if (errorAuth) {
      errorMsg.textContent = `❌ Error: ${errorAuth.message}`;
      return;
    }

    const uid = dataAuth.user?.id;
    if (!uid) {
      errorMsg.textContent = '❌ No se pudo obtener el ID del usuario.';
      return;
    }

    // Insertar en tabla estudiantes
    const { error: errorInsert } = await supabase.from('estudiantes').insert([
      {
        id: uid,
        nombre,
        correo,
        telefono: telefono || null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`
      },
    ]);

    if (errorInsert) {
      errorMsg.textContent = '❌ Error guardando datos: ' + errorInsert.message;
      return;
    }

    alert('✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
    location.reload();
  });
}