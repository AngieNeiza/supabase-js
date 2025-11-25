// src/mvp.js
import { supabase } from './supabase.js';

export function mostrarMVP() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="pinterest-container">
      <!-- Header con botón crear -->
      <div class="create-pin-header">
        <button id="btn-crear-pin" class="btn-create">+ Crear Pin</button>
      </div>

      <!-- Modal para crear pin -->
      <div id="modal-crear" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Crear nuevo Pin</h2>
          
          <form id="pin-form">
            <div class="form-group">
              <label>URL de la imagen *</label>
              <input type="url" name="imagen" placeholder="https://ejemplo.com/imagen.jpg" required />
              <small>Pega la URL de una imagen desde internet</small>
            </div>

            <div class="form-group">
              <label>Título *</label>
              <input type="text" name="titulo" placeholder="Añade un título" required />
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" placeholder="Cuenta de qué trata este Pin" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Enlace externo</label>
              <input type="url" name="enlace" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label>Tablero *</label>
              <select name="tablero" id="select-tablero" required>
                <option value="">Cargando tableros...</option>
              </select>
              <button type="button" id="btn-nuevo-tablero" class="btn-secondary">+ Nuevo tablero</button>
            </div>

            <button type="submit" class="btn-primary">Publicar Pin</button>
          </form>
        </div>
      </div>

      <!-- Modal para crear tablero -->
      <div id="modal-tablero" class="modal">
        <div class="modal-content modal-small">
          <span class="close-tablero">&times;</span>
          <h2>Crear tablero</h2>
          
          <form id="tablero-form">
            <div class="form-group">
              <label>Nombre del tablero *</label>
              <input type="text" name="nombre" placeholder="Ej: Recetas favoritas" required />
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" placeholder="¿De qué trata este tablero?" rows="2"></textarea>
            </div>

            <button type="submit" class="btn-primary">Crear tablero</button>
          </form>
        </div>
      </div>

      <p id="mensaje" class="mensaje-toast"></p>

      <!-- Grid de Pins estilo Pinterest -->
      <div class="pins-grid" id="pins-grid"></div>
    </div>
  `;

  const modal = document.getElementById('modal-crear');
  const modalTablero = document.getElementById('modal-tablero');
  const btnCrear = document.getElementById('btn-crear-pin');
  const closeModal = document.querySelector('.close');
  const closeTablero = document.querySelector('.close-tablero');
  const pinForm = document.getElementById('pin-form');
  const tableroForm = document.getElementById('tablero-form');
  const mensaje = document.getElementById('mensaje');
  const selectTablero = document.getElementById('select-tablero');
  const btnNuevoTablero = document.getElementById('btn-nuevo-tablero');
  const pinsGrid = document.getElementById('pins-grid');

  // Abrir/cerrar modales
  btnCrear.onclick = () => modal.style.display = 'block';
  closeModal.onclick = () => modal.style.display = 'none';
  closeTablero.onclick = () => modalTablero.style.display = 'none';
  btnNuevoTablero.onclick = () => modalTablero.style.display = 'block';

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === modalTablero) modalTablero.style.display = 'none';
  };

  // Cargar tableros
  async function cargarTableros() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data, error } = await supabase
      .from('tableros')
      .select('id, nombre')
      .eq('usuario_id', user.id)
      .order('nombre', { ascending: true });

    if (error) {
      selectTablero.innerHTML = '<option value="">Error al cargar</option>';
      return;
    }

    if (!data.length) {
      selectTablero.innerHTML = '<option value="">Crea tu primer tablero</option>';
      return;
    }

    selectTablero.innerHTML = '<option value="">Selecciona un tablero</option>';
    data.forEach(tablero => {
      const opt = document.createElement('option');
      opt.value = tablero.id;
      opt.textContent = tablero.nombre;
      selectTablero.appendChild(opt);
    });
  }

  // Cargar pins (todos los públicos)
  async function cargarPins() {
    pinsGrid.innerHTML = '<p class="loading">Cargando pins...</p>';

    const { data, error } = await supabase
      .from('pins')
      .select(`
        id,
        titulo,
        descripcion,
        imagen_url,
        enlace_externo,
        creado_en,
        estudiantes(nombre, avatar)
      `)
      .order('creado_en', { ascending: false });

    if (error) {
      pinsGrid.innerHTML = '<p class="error">Error al cargar pins</p>';
      return;
    }

    if (!data.length) {
      pinsGrid.innerHTML = '<p class="empty-state">No hay pins todavía. ¡Sé el primero en crear uno!</p>';
      return;
    }

    pinsGrid.innerHTML = '';
    data.forEach(pin => {
      const usuario = Array.isArray(pin.estudiantes) ? pin.estudiantes[0] : pin.estudiantes;
      
      const pinCard = document.createElement('div');
      pinCard.className = 'pin-card';
      pinCard.innerHTML = `
        <div class="pin-image">
          <img src="${pin.imagen_url}" alt="${pin.titulo}" loading="lazy" />
          ${pin.enlace_externo ? `<a href="${pin.enlace_externo}" target="_blank" class="pin-link">🔗 Ver enlace</a>` : ''}
        </div>
        <div class="pin-content">
          <h3>${escapeHtml(pin.titulo)}</h3>
          ${pin.descripcion ? `<p>${escapeHtml(pin.descripcion)}</p>` : ''}
          <div class="pin-author">
            <img src="${usuario?.avatar || 'https://ui-avatars.com/api/?name=User'}" alt="${usuario?.nombre}" />
            <span>${usuario?.nombre || 'Usuario'}</span>
          </div>
        </div>
      `;
      pinsGrid.appendChild(pinCard);
    });
  }

  // Crear tablero
  tableroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      mostrarMensaje('⚠️ Debes iniciar sesión', 'error');
      return;
    }

    const nombre = tableroForm.nombre.value.trim();
    const descripcion = tableroForm.descripcion.value.trim();

    const { error } = await supabase.from('tableros').insert([{
      usuario_id: user.id,
      nombre,
      descripcion,
    }]);

    if (error) {
      mostrarMensaje('❌ Error al crear tablero', 'error');
    } else {
      mostrarMensaje('✅ Tablero creado', 'success');
      tableroForm.reset();
      modalTablero.style.display = 'none';
      cargarTableros();
    }
  });

  // Crear pin
  pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      mostrarMensaje('⚠️ Debes iniciar sesión', 'error');
      return;
    }

    const titulo = pinForm.titulo.value.trim();
    const descripcion = pinForm.descripcion.value.trim();
    const imagen_url = pinForm.imagen.value.trim();
    const enlace_externo = pinForm.enlace.value.trim();
    const tablero_id = pinForm.tablero.value;

    if (!tablero_id) {
      mostrarMensaje('❌ Selecciona un tablero', 'error');
      return;
    }

    const { error } = await supabase.from('pins').insert([{
      usuario_id: user.id,
      tablero_id,
      titulo,
      descripcion,
      imagen_url,
      enlace_externo: enlace_externo || null,
    }]);

    if (error) {
      mostrarMensaje('❌ Error al crear pin: ' + error.message, 'error');
    } else {
      mostrarMensaje('✅ Pin publicado', 'success');
      pinForm.reset();
      modal.style.display = 'none';
      cargarPins();
    }
  });

  function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-toast ${tipo}`;
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Inicializar
  cargarTableros();
  cargarPins();
}