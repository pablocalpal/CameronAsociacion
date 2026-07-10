function tarjetaPasada(actividad, rutaDetalle = './detalle.html') {
    return `
    <div class="col-md-6">
        <a href="${rutaDetalle}?id=${actividad.id}" class="text-decoration-none text-reset">
            <div class="card h-100 border-0 shadow-sm" style="cursor: pointer; transition: transform 0.2s;"
                onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
                <div class="card-body">
                    <h3 class="card-title h5">${escapeHtml(actividad.titulo)}</h3>
                    <p class="card-text text-muted small"><i data-feather="calendar" class="me-1"></i> ${formatearFecha(actividad.fecha)}</p>
                    <p class="card-text">${escapeHtml(actividad.resumen)}</p>
                    <span class="btn btn-link px-0 text-decoration-none fw-bold" style="color: var(--primary-color);">Ver actividad →</span>
                </div>
            </div>
        </a>
    </div>`;
}

async function cargarActividades() {
    const contenedorProximas = document.getElementById('proximas-container');
    const contenedorPasadas = document.getElementById('pasadas-container');

    const { data, error } = await supabaseClient
        .from('actividades')
        .select('*')
        .order('fecha', { ascending: true });

    if (error) {
        console.error('Error al cargar actividades', error);
        contenedorProximas.innerHTML = '<p class="text-center text-muted">No se han podido cargar las actividades.</p>';
        contenedorPasadas.innerHTML = '';
        return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const proximas = data.filter(a => a.fecha >= hoy);
    const pasadas = data.filter(a => a.fecha < hoy).reverse();

    contenedorProximas.innerHTML = proximas.length
        ? proximas.map(a => tarjetaProxima(a)).join('')
        : '<p class="text-center text-muted">No hay próximas actividades programadas por el momento.</p>';

    contenedorPasadas.innerHTML = pasadas.length
        ? pasadas.map(a => tarjetaPasada(a)).join('')
        : '<p class="text-center text-muted">Todavía no hay actividades pasadas.</p>';

    feather.replace();
}

cargarActividades();
