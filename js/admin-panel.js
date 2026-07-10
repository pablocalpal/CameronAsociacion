let actividades = [];

function slugify(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD').replace(new RegExp('[̀-ͯ]', 'g'), '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function generarSlugUnico(base, idExcluido) {
    let slug = slugify(base) || 'actividad';
    let sufijo = 1;
    let candidato = slug;
    while (actividades.some(a => a.slug === candidato && a.id !== idExcluido)) {
        sufijo += 1;
        candidato = `${slug}-${sufijo}`;
    }
    return candidato;
}

async function protegerPagina() {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session) {
        location.href = './index.html';
        return null;
    }
    document.getElementById('usuario-email').textContent = data.session.user.email;
    return data.session;
}

document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    location.href = './index.html';
});

function filaActividad(actividad) {
    return `
    <tr>
        <td>${escapeHtml(actividad.titulo)}</td>
        <td>${formatearFecha(actividad.fecha)}</td>
        <td>${escapeHtml(actividad.lugar || '—')}</td>
        <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-2 btn-editar" data-id="${actividad.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${actividad.id}">Eliminar</button>
        </td>
    </tr>`;
}

async function cargarLista() {
    const { data, error } = await supabaseClient
        .from('actividades')
        .select('*')
        .order('fecha', { ascending: false });

    const mensaje = document.getElementById('lista-mensaje');
    const tabla = document.getElementById('tabla-actividades');

    if (error) {
        mensaje.textContent = 'No se han podido cargar las actividades.';
        return;
    }

    actividades = data;

    if (!data.length) {
        mensaje.textContent = 'Todavía no hay actividades. Crea la primera con el botón "Nueva actividad".';
        tabla.style.display = 'none';
        return;
    }

    mensaje.textContent = '';
    document.getElementById('tabla-actividades-body').innerHTML = data.map(filaActividad).join('');
    tabla.style.display = '';

    document.querySelectorAll('.btn-editar').forEach(btn =>
        btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id)));
    document.querySelectorAll('.btn-eliminar').forEach(btn =>
        btn.addEventListener('click', () => eliminarActividad(btn.dataset.id)));
}

function limpiarFormulario() {
    document.getElementById('form-actividad').reset();
    document.getElementById('actividad-id').value = '';
    document.getElementById('imagen-actual').style.display = 'none';
    document.getElementById('form-mensaje').style.display = 'none';
    document.getElementById('modal-actividad-titulo').textContent = 'Nueva actividad';
}

function abrirModalEdicion(id) {
    const actividad = actividades.find(a => a.id === id);
    if (!actividad) return;

    limpiarFormulario();
    document.getElementById('modal-actividad-titulo').textContent = 'Editar actividad';
    document.getElementById('actividad-id').value = actividad.id;
    document.getElementById('titulo').value = actividad.titulo;
    document.getElementById('resumen').value = actividad.resumen;
    document.getElementById('contenido').value = actividad.contenido || '';
    document.getElementById('fecha').value = actividad.fecha;
    document.getElementById('hora').value = actividad.hora || '';
    document.getElementById('precio').value = actividad.precio || '';
    document.getElementById('lugar').value = actividad.lugar || '';

    if (actividad.imagen_url) {
        const img = document.getElementById('imagen-actual');
        img.src = actividad.imagen_url;
        img.style.display = '';
    }

    new bootstrap.Modal(document.getElementById('modal-actividad')).show();
}

async function eliminarActividad(id) {
    const actividad = actividades.find(a => a.id === id);
    if (!confirm(`¿Seguro que quieres eliminar "${actividad?.titulo}"? Esta acción no se puede deshacer.`)) return;

    const { error } = await supabaseClient.from('actividades').delete().eq('id', id);
    if (error) {
        alert('No se ha podido eliminar la actividad.');
        return;
    }
    cargarLista();
}

async function subirImagen(file) {
    const nombreArchivo = `${Date.now()}-${slugify(file.name)}`;
    const { error } = await supabaseClient.storage.from('actividades-media').upload(nombreArchivo, file);
    if (error) throw error;
    const { data } = supabaseClient.storage.from('actividades-media').getPublicUrl(nombreArchivo);
    return data.publicUrl;
}

document.getElementById('btn-nueva').addEventListener('click', limpiarFormulario);

document.getElementById('form-actividad').addEventListener('submit', async (e) => {
    e.preventDefault();

    const guardarBtn = document.getElementById('guardar-btn');
    const mensaje = document.getElementById('form-mensaje');
    guardarBtn.disabled = true;
    guardarBtn.textContent = 'Guardando...';
    mensaje.style.display = 'none';

    try {
        const idEditando = document.getElementById('actividad-id').value || null;
        const titulo = document.getElementById('titulo').value.trim();
        const actividadPrevia = idEditando ? actividades.find(a => a.id === idEditando) : null;

        let imagen_url = actividadPrevia?.imagen_url ?? null;
        const archivo = document.getElementById('imagen').files[0];
        if (archivo) {
            imagen_url = await subirImagen(archivo);
        }

        const payload = {
            titulo,
            slug: actividadPrevia?.slug ?? await generarSlugUnico(titulo, idEditando),
            resumen: document.getElementById('resumen').value.trim(),
            contenido: document.getElementById('contenido').value.trim(),
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value.trim() || null,
            precio: document.getElementById('precio').value.trim() || null,
            lugar: document.getElementById('lugar').value.trim() || null,
            imagen_url,
        };

        const { error } = idEditando
            ? await supabaseClient.from('actividades').update(payload).eq('id', idEditando)
            : await supabaseClient.from('actividades').insert(payload);

        if (error) throw error;

        bootstrap.Modal.getInstance(document.getElementById('modal-actividad')).hide();
        await cargarLista();
    } catch (error) {
        mensaje.className = 'message error';
        mensaje.textContent = 'No se ha podido guardar la actividad. Inténtalo de nuevo.';
        mensaje.style.display = 'block';
        console.error(error);
    } finally {
        guardarBtn.disabled = false;
        guardarBtn.textContent = 'Guardar';
    }
});

(async function iniciar() {
    const sesion = await protegerPagina();
    if (!sesion) return;
    await cargarLista();
})();
