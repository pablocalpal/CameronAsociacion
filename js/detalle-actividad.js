function renderCuerpo(contenido) {
    return contenido
        .split('\n\n')
        .filter(parrafo => parrafo.trim().length > 0)
        .map(parrafo => `<p>${escapeHtml(parrafo).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function tarjetaOtraActividad(actividad) {
    return `
    <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm">
            ${actividad.imagen_url ? `<img src="${escapeHtml(actividad.imagen_url)}" class="card-img-top" alt="${escapeHtml(actividad.titulo)}" style="height: 180px; object-fit: cover;">` : ''}
            <div class="card-body">
                <h3 class="card-title h5">${escapeHtml(actividad.titulo)}</h3>
                <p class="card-text text-muted small"><i data-feather="calendar" class="me-1"></i> ${formatearFecha(actividad.fecha)}</p>
                <a href="./detalle.html?id=${actividad.id}" class="btn btn-link px-0 text-decoration-none fw-bold" style="color: var(--primary-color);">Ver actividad →</a>
            </div>
        </div>
    </div>`;
}

function mostrarSiHay(idWrap, idValor, valor) {
    if (!valor) return;
    document.getElementById(idWrap).style.display = '';
    document.getElementById(idValor).textContent = valor;
}

async function cargarOtrasActividades(idActual) {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data } = await supabaseClient
        .from('actividades')
        .select('*')
        .neq('id', idActual)
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .limit(2);

    const contenedor = document.getElementById('otras-actividades-container');
    if (data && data.length) {
        contenedor.innerHTML = data.map(tarjetaOtraActividad).join('');
    } else {
        document.getElementById('otras-actividades-container').closest('section').style.display = 'none';
    }
}

async function cargarActividad() {
    const id = new URLSearchParams(location.search).get('id');

    if (!id) {
        document.getElementById('cargando').style.display = 'none';
        document.getElementById('no-encontrada').style.display = '';
        return;
    }

    const { data: actividad, error } = await supabaseClient
        .from('actividades')
        .select('*')
        .eq('id', id)
        .single();

    document.getElementById('cargando').style.display = 'none';

    if (error || !actividad) {
        document.getElementById('no-encontrada').style.display = '';
        return;
    }

    document.title = `${actividad.titulo} — Asociación cultural Camerón`;
    document.getElementById('meta-descripcion').setAttribute('content', actividad.resumen);

    document.getElementById('hero-titulo').textContent = actividad.titulo;
    document.getElementById('hero-fecha').textContent = formatearFecha(actividad.fecha);
    document.getElementById('breadcrumb-titulo').textContent = actividad.titulo;
    document.getElementById('resumen-actividad').textContent = actividad.resumen;
    document.getElementById('cuerpo-actividad').innerHTML = renderCuerpo(actividad.contenido || '');

    if (actividad.imagen_url) {
        const heroImg = document.getElementById('hero-imagen');
        heroImg.src = actividad.imagen_url;
        heroImg.alt = actividad.titulo;
    }

    mostrarSiHay('hero-lugar-wrap', 'hero-lugar', actividad.lugar);
    mostrarSiHay('hero-hora-wrap', 'hero-hora', actividad.hora);
    mostrarSiHay('hero-precio-wrap', 'hero-precio', actividad.precio);

    document.getElementById('info-fecha').textContent = formatearFecha(actividad.fecha);
    mostrarSiHay('info-hora-wrap', 'info-hora', actividad.hora);
    mostrarSiHay('info-lugar-wrap', 'info-lugar', actividad.lugar);
    mostrarSiHay('info-precio-wrap', 'info-precio', actividad.precio);

    document.getElementById('contenido-actividad').style.display = '';
    feather.replace();

    cargarOtrasActividades(actividad.id);
}

cargarActividad();
