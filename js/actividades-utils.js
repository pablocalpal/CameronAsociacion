const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatearFecha(fechaIso) {
    const [anio, mes, dia] = fechaIso.split('-').map(Number);
    return `${dia} ${MESES[mes - 1]}, ${anio}`;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function horaYPrecio(actividad) {
    const partes = [actividad.hora, actividad.precio].filter(Boolean);
    return partes.join(' — ');
}

function tarjetaProxima(actividad, rutaDetalle = './detalle.html') {
    const infoHora = horaYPrecio(actividad);
    return `
    <div class="col-md-4">
        <a href="${rutaDetalle}?id=${actividad.id}" class="text-decoration-none text-reset">
            <div class="card h-100 border-0 shadow-sm" style="cursor: pointer; transition: transform 0.2s;"
                onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
                ${actividad.imagen_url ? `<img src="${escapeHtml(actividad.imagen_url)}" class="card-img-top" alt="${escapeHtml(actividad.titulo)}" style="height: 220px; object-fit: cover;">` : ''}
                <div class="card-body">
                    <h3 class="card-title h4">${escapeHtml(actividad.titulo)}</h3>
                    <p class="card-text text-muted small"><i data-feather="calendar" class="me-1"></i> ${formatearFecha(actividad.fecha)}</p>
                    <p class="card-text">${escapeHtml(actividad.resumen)}</p>
                    ${actividad.lugar ? `<p class="card-text text-muted small"><i data-feather="map-pin" class="me-1"></i> ${escapeHtml(actividad.lugar)}</p>` : ''}
                    ${infoHora ? `<p class="card-text text-muted small"><i data-feather="clock" class="me-1"></i> ${escapeHtml(infoHora)}</p>` : ''}
                    <span class="btn btn-link px-0 text-decoration-none fw-bold" style="color: var(--primary-color);">Ver actividad →</span>
                </div>
            </div>
        </a>
    </div>`;
}
