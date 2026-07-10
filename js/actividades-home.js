async function cargarProximasActividadesHome() {
    const contenedor = document.getElementById('proximas-container-home');
    const hoy = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabaseClient
        .from('actividades')
        .select('*')
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .limit(3);

    if (error) {
        console.error('Error al cargar actividades', error);
        contenedor.innerHTML = '<p class="text-center text-muted">No se han podido cargar las actividades.</p>';
        return;
    }

    contenedor.innerHTML = data.length
        ? data.map(a => tarjetaProxima(a, './actividades/detalle.html')).join('')
        : '<p class="text-center text-muted">No hay próximas actividades programadas por el momento.</p>';

    feather.replace();
}

cargarProximasActividadesHome();
