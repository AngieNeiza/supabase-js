// src/admin.js
import { supabase } from './supabase.js';

export async function mostrarAdmin() {
  const app = document.getElementById('app');
  
  // Verificar admin
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    app.innerHTML = '<p class="error">⚠️ Debes iniciar sesión.</p>';
    return;
  }

  // CAMBIAR ESTE CORREO por tu correo de administrador
  if (user.email !== 'angie.neizac@uniagustiniana.edu.co') {
    app.innerHTML = '<p class="error">⛔ No tienes permisos de administrador.</p>';
    return;
  }

  app.innerHTML = `
    <div class="admin-container">
      <h2>🛠️ Panel Administrativo</h2>
      
      <div class="admin-section">
        <h3>👥 Usuarios Registrados</h3>
        <div id="lista-usuarios"></div>
      </div>

      <div class="admin-section">
        <h3>📌 Pins Publicados</h3>
        <div id="lista-pins"></div>
      </div>

      <div class="admin-section">
        <h3>📁 Tableros Creados</h3>
        <div id="lista-tableros"></div>
      </div>

      <p id="mensaje" class="mensaje-toast"></p>
    </div>
  `;

  const listaUsuarios = document.getElementById('lista-usuarios');
  const listaPins = document.getElementById('lista-pins');
  const listaTableros = document.getElementById('lista-tableros');
  const mensaje = document.getElementById('mensaje');

  // Función para mostrar mensajes
  function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-toast ${tipo}`;
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
  }

  // Cargar usuarios
  const { data: usuarios } = await supabase
    .from('estudiantes')
    .select('id, nombre, correo, telefono, creado_en')
    .order('creado_en', { ascending: false });

  if (usuarios && usuarios.length > 0) {
    listaUsuarios.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Fecha registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map(u => `
            <tr>
              <td>${u.nombre}</td>
              <td>${u.correo}</td>
              <td>${u.telefono || 'N/A'}</td>
              <td>${new Date(u.creado_en).toLocaleDateString()}</td>
              <td>
                <button class="btn-danger btn-sm eliminar-usuario" data-id="${u.id}">🗑️ Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    listaUsuarios.innerHTML = '<p>No hay usuarios registrados</p>';
  }

  // Cargar pins
  const { data: pins } = await supabase
    .from('pins')
    .select(`
      id,
      titulo,
      imagen_url,
      creado_en,
      estudiantes(nombre, correo)
    `)
    .order('creado_en', { ascending: false });

  if (pins && pins.length > 0) {
    listaPins.innerHTML = `
      <div class="admin-pins-grid">
        ${pins.map(p => {
          const usuario = Array.isArray(p.estudiantes) ? p.estudiantes[0] : p.estudiantes;
          return `
            <div class="admin-pin-card">
              <img src="${p.imagen_url}" alt="${p.titulo}" />
              <h4>${p.titulo}</h4>
              <p><small>Por: ${usuario?.nombre || 'Usuario'}</small></p>
              <button class="btn-danger btn-sm eliminar-pin" data-id="${p.id}">🗑️ Eliminar</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    listaPins.innerHTML = '<p>No hay pins publicados</p>';
  }

  // Cargar tableros
  const { data: tableros } = await supabase
    .from('tableros')
    .select(`
      id,
      nombre,
      descripcion,
      creado_en,
      estudiantes(nombre)
    `)
    .order('creado_en', { ascending: false });

  if (tableros && tableros.length > 0) {
    listaTableros.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Creado por</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${tableros.map(t => {
            const usuario = Array.isArray(t.estudiantes) ? t.estudiantes[0] : t.estudiantes;
            return `
              <tr>
                <td>${t.nombre}</td>
                <td>${t.descripcion || 'Sin descripción'}</td>
                <td>${usuario?.nombre || 'Usuario'}</td>
                <td>${new Date(t.creado_en).toLocaleDateString()}</td>
                <td>
                  <button class="btn-danger btn-sm eliminar-tablero" data-id="${t.id}">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else {
    listaTableros.innerHTML = '<p>No hay tableros creados</p>';
  }

  // Event Listeners para eliminar (usando delegación de eventos)
  document.addEventListener('click', async (e) => {
    // Eliminar usuario
    if (e.target.classList.contains('eliminar-usuario')) {
      const id = e.target.getAttribute('data-id');
      if (!confirm('¿Eliminar este usuario? Se eliminarán también sus pins y tableros.')) return;
      
      const { error } = await supabase.from('estudiantes').delete().eq('id', id);
      
      if (error) {
        mostrarMensaje('❌ Error al eliminar', 'error');
      } else {
        mostrarMensaje('✅ Usuario eliminado', 'success');
        setTimeout(() => mostrarAdmin(), 1000);
      }
    }

    // Eliminar pin
    if (e.target.classList.contains('eliminar-pin')) {
      const id = e.target.getAttribute('data-id');
      if (!confirm('¿Eliminar este pin?')) return;
      
      const { error } = await supabase.from('pins').delete().eq('id', id);
      
      if (error) {
        mostrarMensaje('❌ Error al eliminar', 'error');
      } else {
        mostrarMensaje('✅ Pin eliminado', 'success');
        setTimeout(() => mostrarAdmin(), 1000);
      }
    }

    // Eliminar tablero
    if (e.target.classList.contains('eliminar-tablero')) {
      const id = e.target.getAttribute('data-id');
      if (!confirm('¿Eliminar este tablero? Se eliminarán también todos sus pins.')) return;
      
      const { error } = await supabase.from('tableros').delete().eq('id', id);
      
      if (error) {
        mostrarMensaje('❌ Error al eliminar', 'error');
      } else {
        mostrarMensaje('✅ Tablero eliminado', 'success');
        setTimeout(() => mostrarAdmin(), 1000);
      }
    }
  });
}