// src/user.js
import { supabase } from './supabase.js';

export async function mostrarUser() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="profile-container">
      <div class="profile-card">
        <h2>Mi Perfil</h2>
        
        <div class="profile-avatar">
          <img id="avatar-preview" src="" alt="Avatar" />
        </div>

        <form id="user-form">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" id="nombre" required />
          </div>

          <div class="form-group">
            <label>Correo (no editable)</label>
            <input type="email" id="correo" disabled />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" id="telefono" />
          </div>

          <div class="form-group">
            <label>URL del Avatar</label>
            <input type="url" id="avatar" placeholder="https://..." />
          </div>

          <button type="submit" class="btn-primary">Actualizar perfil</button>
        </form>

        <p id="mensaje" class="mensaje-toast"></p>

        <div class="profile-stats">
          <h3>Mis Tableros</h3>
          <div id="mis-tableros"></div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('user-form');
  const mensaje = document.getElementById('mensaje');
  const avatarPreview = document.getElementById('avatar-preview');
  const avatarInput = document.getElementById('avatar');
  const misTableros = document.getElementById('mis-tableros');

  // Obtener usuario
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    mensaje.textContent = '❌ Error: No hay sesión activa';
    return;
  }

  const correo = user.email;

  // Cargar datos
  const { data, error } = await supabase
    .from('estudiantes')
    .select('*')
    .eq('correo', correo)
    .single();

  if (error) {
    mensaje.textContent = '❌ Error cargando datos: ' + error.message;
    return;
  }

  document.getElementById('nombre').value = data.nombre || '';
  document.getElementById('correo').value = data.correo || '';
  document.getElementById('telefono').value = data.telefono || '';
  document.getElementById('avatar').value = data.avatar || '';
  avatarPreview.src = data.avatar || 'https://ui-avatars.com/api/?name=User';

  // Actualizar preview del avatar
  avatarInput.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      avatarPreview.src = url;
    }
  });

  // Actualizar perfil
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const avatar = document.getElementById('avatar').value.trim();

    const { error: updateError } = await supabase
      .from('estudiantes')
      .update({ nombre, telefono, avatar })
      .eq('correo', correo);

    if (updateError) {
      mensaje.textContent = '❌ Error al actualizar: ' + updateError.message;
      mensaje.className = 'mensaje-toast error';
    } else {
      mensaje.textContent = '✅ Perfil actualizado correctamente';
      mensaje.className = 'mensaje-toast success';
    }
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
  });

  // Cargar tableros del usuario
  const { data: tableros } = await supabase
    .from('tableros')
    .select('id, nombre, descripcion, creado_en')
    .eq('usuario_id', user.id)
    .order('creado_en', { ascending: false });

  if (tableros && tableros.length > 0) {
    misTableros.innerHTML = tableros.map(t => `
      <div class="tablero-item">
        <h4>📌 ${t.nombre}</h4>
        <p>${t.descripcion || 'Sin descripción'}</p>
        <small>${new Date(t.creado_en).toLocaleDateString()}</small>
      </div>
    `).join('');
  } else {
    misTableros.innerHTML = '<p>Aún no has creado tableros</p>';
  }
}