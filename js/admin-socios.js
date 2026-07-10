let listaSocios = [];
let ultimoCambio = null;
let toastTimeout = null;

// Mostrar Toast de Deshacer
function mostrarToastDeshacer(id, campo, valorAnterior, valorNuevo, nombreSocio) {
    ultimoCambio = { id, campo, valorAnterior, valorNuevo };

    const traduccionesCampos = {
        no: 'Nº socio',
        pareja: 'Nº pareja',
        nombre: 'Nombre',
        apellido1: 'Primer apellido',
        apellido2: 'Segundo apellido',
        movil: 'Móvil',
        direccion: 'Dirección',
        cp: 'Código postal',
        poblacion: 'Población',
        provincia: 'Provincia',
        cuota_2024: 'Cuota 2024',
        bajas: 'Bajas',
        regalo: 'Regalo',
        comida: 'Comida'
    };

    const campoBonito = traduccionesCampos[campo] || campo;
    const toast = document.getElementById('undo-toast');
    const toastText = document.getElementById('undo-toast-text');

    toastText.textContent = `Cambio guardado en ${campoBonito} de ${nombreSocio}`;
    toast.style.display = 'flex';

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
        ultimoCambio = null;
    }, 15000);
}

// Inicializar oyentes del Toast de Deshacer
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('undo-toast-close');
    const undoBtn = document.getElementById('undo-toast-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('undo-toast').style.display = 'none';
            ultimoCambio = null;
            if (toastTimeout) clearTimeout(toastTimeout);
        });
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', async () => {
            if (!ultimoCambio) return;

            const { id, campo, valorAnterior } = ultimoCambio;
            const toast = document.getElementById('undo-toast');

            toast.style.display = 'none';
            if (toastTimeout) clearTimeout(toastTimeout);

            const { error } = await supabaseClient
                .from('socios')
                .update({ [campo]: valorAnterior })
                .eq('id', id);

            if (error) {
                alert('No se pudo deshacer el cambio: ' + error.message);
            } else {
                // Actualizar en memoria local
                const socio = listaSocios.find(s => s.id === id);
                if (socio) socio[campo] = valorAnterior;

                // Volver a aplicar filtros / refrescar tabla
                aplicarFiltros();

                // Mostrar alerta temporal
                const tempAlert = document.createElement('div');
                tempAlert.className = 'custom-toast';
                tempAlert.style.backgroundColor = '#198754';
                tempAlert.style.border = '1px solid #157347';
                tempAlert.innerHTML = `
                    <div class="d-flex align-items-center">
                        <i data-feather="check" class="me-2" style="width: 18px; height: 18px;"></i>
                        <span>Cambio deshecho correctamente.</span>
                    </div>
                `;
                document.body.appendChild(tempAlert);
                feather.replace();
                setTimeout(() => tempAlert.remove(), 2500);
            }
            ultimoCambio = null;
        });
    }
});

function escapeHtml(texto) {
    if (texto === null || texto === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(texto);
    return div.innerHTML;
}

// 1. Proteger la página (solo administradores logueados)
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
    await supabaseClient.signOut();
    location.href = './index.html';
});

// 2. Cargar lista de socios
async function cargarSocios() {
    const mensaje = document.getElementById('lista-mensaje');
    const tabla = document.getElementById('tabla-socios');

    const { data, error } = await supabaseClient
        .from('socios')
        .select('*')
        .order('no', { ascending: true, nullsFirst: false });

    if (error) {
        mensaje.textContent = 'Error al cargar los socios: ' + error.message;
        console.error(error);
        return;
    }

    listaSocios = data;

    if (!listaSocios.length) {
        mensaje.textContent = 'No hay socios registrados. Crea uno nuevo.';
        tabla.style.display = 'none';
        return;
    }

    mensaje.textContent = '';
    aplicarFiltros();
    tabla.style.display = '';
}

// 3. Renderizar filas en la tabla (DNI y Cuenta bancaria excluidos aquí para privacidad)
function renderizarTabla(socios) {
    const tbody = document.getElementById('tabla-socios-body');
    if (socios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted py-3">Ningún socio coincide con los filtros aplicados.</td></tr>';
        return;
    }

    tbody.innerHTML = socios.map(filaSocio).join('');
    feather.replace(); // Inicializar iconos
}

function filaSocio(socio) {
    return `
    <tr>
        <td contenteditable="false" data-id="${socio.id}" data-campo="no" class="celda-editable border-dotted-hover fw-bold text-center">${socio.no ?? ''}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="pareja" class="celda-editable border-dotted-hover text-center">${socio.pareja ?? ''}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="nombre" class="celda-editable border-dotted-hover">${escapeHtml(socio.nombre)}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="apellido1" class="celda-editable border-dotted-hover">${escapeHtml(socio.apellido1)}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="apellido2" class="celda-editable border-dotted-hover">${escapeHtml(socio.apellido2 ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="movil" class="celda-editable border-dotted-hover">${escapeHtml(socio.movil ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="direccion" class="celda-editable border-dotted-hover text-truncate-max" title="${escapeHtml(socio.direccion ?? '')}">${escapeHtml(socio.direccion ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="cp" class="celda-editable border-dotted-hover text-center">${escapeHtml(socio.cp ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="poblacion" class="celda-editable border-dotted-hover">${escapeHtml(socio.poblacion ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="provincia" class="celda-editable border-dotted-hover">${escapeHtml(socio.provincia ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="cuota_2024" class="celda-editable border-dotted-hover">${escapeHtml(socio.cuota_2024 ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="bajas" class="celda-editable border-dotted-hover">${escapeHtml(socio.bajas ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="regalo" class="celda-editable border-dotted-hover">${escapeHtml(socio.regalo ?? '')}</td>
        <td contenteditable="false" data-id="${socio.id}" data-campo="comida" class="celda-editable border-dotted-hover">${escapeHtml(socio.comida ?? '')}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-editar-detalle py-0 px-2 me-1" data-id="${socio.id}" title="Ver detalle / Editar completo">
                <i data-feather="eye" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-eliminar py-0 px-2" data-id="${socio.id}" title="Eliminar socio">
                <i data-feather="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        </td>
    </tr>`;
}

// 4. Búsqueda y Filtros
function aplicarFiltros() {
    const busqueda = document.getElementById('buscar-input').value.toLowerCase().trim();
    const filtroBaja = document.getElementById('filtro-baja').value;
    const filtroCuota = document.getElementById('filtro-cuota').value;
    const filtroRegalo = document.getElementById('filtro-regalo').value;
    const filtroComida = document.getElementById('filtro-comida').value;

    const sociosFiltrados = listaSocios.filter(socio => {
        // A. Buscador global (Nombre, Apellidos, DNI, Nº Socio, Teléfono, Población)
        const coincideBusqueda = !busqueda ||
            `${socio.nombre} ${socio.apellido1} ${socio.apellido2}`.toLowerCase().includes(busqueda) ||
            (socio.dni && socio.dni.toLowerCase().includes(busqueda)) ||
            (socio.no && String(socio.no).includes(busqueda)) ||
            (socio.movil && socio.movil.includes(busqueda)) ||
            (socio.poblacion && socio.poblacion.toLowerCase().includes(busqueda));

        // B. Filtro Bajas
        let coincideBaja = true;
        const bajasValor = (socio.bajas || '').trim().toUpperCase();
        if (filtroBaja === 'activo') {
            coincideBaja = (bajasValor !== 'BAJA');
        } else if (filtroBaja === 'baja') {
            coincideBaja = (bajasValor === 'BAJA');
        }

        // C. Filtro Cuota
        let coincideCuota = true;
        const cuotaValor = (socio.cuota_2024 || '').trim().toLowerCase();
        if (filtroCuota !== 'todos') {
            if (filtroCuota === 'pendiente') {
                coincideCuota = !cuotaValor;
            } else {
                coincideCuota = cuotaValor.includes(filtroCuota);
            }
        }

        // D. Filtro Regalo
        let coincideRegalo = true;
        const regaloValor = (socio.regalo || '').trim().toLowerCase();
        if (filtroRegalo !== 'todos') {
            if (filtroRegalo === 'vacio') {
                coincideRegalo = !regaloValor;
            } else if (filtroRegalo === 'x') {
                coincideRegalo = regaloValor === 'x';
            } else if (filtroRegalo === 'falta') {
                coincideRegalo = regaloValor.includes('falta');
            }
        }

        // E. Filtro Comida
        let coincideComida = true;
        const comidaValor = (socio.comida || '').trim().toLowerCase();
        if (filtroComida !== 'todos') {
            if (filtroComida === 'apuntado') {
                coincideComida = comidaValor === 'x' || comidaValor !== '';
            } else if (filtroComida === 'vacio') {
                coincideComida = !comidaValor;
            }
        }

        return coincideBusqueda && coincideBaja && coincideCuota && coincideRegalo && coincideComida;
    });

    renderizarTabla(sociosFiltrados);
}

// Escuchar cambios en los inputs de filtrado
document.getElementById('buscar-input').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-baja').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-cuota').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-regalo').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-comida').addEventListener('change', aplicarFiltros);


// 5. Edición en Línea (contenteditable)
// Doble clic para activar edición
document.getElementById('tabla-socios-body').addEventListener('dblclick', (e) => {
    const celda = e.target;
    if (!celda.classList.contains('celda-editable')) return;
    if (celda.getAttribute('contenteditable') === 'true') return;

    // Guardar valor original antes de editar
    celda.dataset.valorOriginal = celda.textContent.trim();

    celda.setAttribute('contenteditable', 'true');
    celda.focus();

    // Seleccionar todo el texto
    const range = document.createRange();
    range.selectNodeContents(celda);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
});

// Keydown: Enter para guardar, Escape para cancelar
document.getElementById('tabla-socios-body').addEventListener('keydown', (e) => {
    const celda = e.target;
    if (!celda.classList.contains('celda-editable')) return;
    if (celda.getAttribute('contenteditable') !== 'true') return;

    if (e.key === 'Enter') {
        e.preventDefault();
        celda.setAttribute('contenteditable', 'false');
        celda.blur();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        // Restaurar valor original
        if (celda.dataset.valorOriginal !== undefined) {
            celda.textContent = celda.dataset.valorOriginal;
        }
        celda.setAttribute('contenteditable', 'false');
        celda.blur();
    }
});

// Blur para guardar (usa captura porque blur no burbujea)
document.getElementById('tabla-socios-body').addEventListener('blur', async (e) => {
    const celda = e.target;
    if (!celda.classList.contains('celda-editable')) return;

    // Guardar estado de si estaba siendo editado para no procesar blurs de celdas no activadas
    if (celda.getAttribute('contenteditable') !== 'true') return;

    // Desactivar editable de inmediato para evitar ejecuciones duplicadas
    celda.setAttribute('contenteditable', 'false');

    const id = celda.dataset.id;
    const campo = celda.dataset.campo;
    let valor = celda.textContent.trim();

    const valorOriginal = celda.dataset.valorOriginal !== undefined ? celda.dataset.valorOriginal.trim() : '';

    // Validar y castear campos numéricos
    if (campo === 'no' || campo === 'pareja') {
        if (valor === '') {
            valor = null;
        } else {
            const numero = parseInt(valor);
            if (isNaN(numero)) {
                alert('Este campo debe ser un número entero.');
                celda.textContent = valorOriginal;
                return;
            }
            valor = numero;
        }
    } else {
        if (valor === '') {
            valor = null;
        }
    }

    // Comprobar si el valor realmente cambió
    const socioOriginal = listaSocios.find(s => s.id === id);
    const valorOriginalCasteado = socioOriginal ? socioOriginal[campo] : null;

    // Comparar valor original con el nuevo normalizando nulos y vacíos
    const normalizar = v => (v === null || v === undefined) ? '' : String(v).trim();
    const esIgual = normalizar(valor) === normalizar(valorOriginalCasteado);

    if (esIgual) {
        celda.textContent = (valorOriginalCasteado ?? '');
        return;
    }

    // Si el campo modificado en línea es 'no' (Nº socio), validar que no esté duplicado
    if (campo === 'no' && valor !== null) {
        const noDuplicado = listaSocios.some(s => s.no === valor && s.id !== id);
        if (noDuplicado) {
            alert('Error: Ya existe otro socio con este número.');
            celda.textContent = (valorOriginalCasteado ?? '');
            return;
        }
    }



    // Actualizar en Supabase
    const { error } = await supabaseClient
        .from('socios')
        .update({ [campo]: valor })
        .eq('id', id);

    if (error) {
        alert('Error al guardar el cambio: ' + error.message);
        celda.textContent = (valorOriginalCasteado ?? '');
    } else {
        // Guardar en memoria local
        const valorAnterior = valorOriginalCasteado;
        if (socioOriginal) socioOriginal[campo] = valor;

        celda.classList.add('guardado-exito');
        setTimeout(() => celda.classList.remove('guardado-exito'), 600);

        // Mostrar Toast de Deshacer
        const nombreSocio = socioOriginal ? `${socioOriginal.nombre} ${socioOriginal.apellido1}` : 'este socio';
        mostrarToastDeshacer(id, campo, valorAnterior, valor, nombreSocio);
    }
}, true);


// 6. Cargar y abrir modal en modo Edición / Detalle
document.getElementById('tabla-socios-body').addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-editar-detalle');
    if (!boton) return;

    const id = boton.dataset.id;
    const socio = listaSocios.find(s => s.id === id);
    if (!socio) return;

    // Limpiar mensaje previo
    document.getElementById('form-mensaje').style.display = 'none';

    // Rellenar todos los campos del modal
    document.getElementById('socio-id').value = socio.id;
    document.getElementById('modal-socio-titulo').textContent = 'Detalles y Edición de Socio';
    document.getElementById('no').value = socio.no ?? '';
    document.getElementById('pareja').value = socio.pareja ?? '';
    document.getElementById('nombre').value = socio.nombre ?? '';
    document.getElementById('apellido1').value = socio.apellido1 ?? '';
    document.getElementById('apellido2').value = socio.apellido2 ?? '';
    document.getElementById('dni').value = socio.dni ?? '';
    document.getElementById('movil').value = socio.movil ?? '';
    document.getElementById('direccion').value = socio.direccion ?? '';
    document.getElementById('cp').value = socio.cp ?? '';
    document.getElementById('poblacion').value = socio.poblacion ?? '';
    document.getElementById('provincia').value = socio.provincia ?? '';
    document.getElementById('cuota_2024').value = socio.cuota_2024 ?? '';
    document.getElementById('bajas').value = socio.bajas ?? '';
    document.getElementById('regalo').value = socio.regalo ?? '';
    document.getElementById('comida').value = socio.comida ?? '';
    document.getElementById('no_de_cuenta').value = socio.no_de_cuenta ?? '';

    // Abrir modal
    new bootstrap.Modal(document.getElementById('modal-socio')).show();
});

// Limpiar modal al pulsar "Nuevo socio"
document.getElementById('btn-nuevo').addEventListener('click', () => {
    document.getElementById('form-socio').reset();
    document.getElementById('socio-id').value = '';
    document.getElementById('modal-socio-titulo').textContent = 'Registrar Nuevo Socio';
    document.getElementById('form-mensaje').style.display = 'none';
});


// 7. Eliminar socio
document.getElementById('tabla-socios-body').addEventListener('click', async (e) => {
    const boton = e.target.closest('.btn-eliminar');
    if (!boton) return;

    const id = boton.dataset.id;
    const socio = listaSocios.find(s => s.id === id);
    const nombreCompleto = socio ? `${socio.nombre} ${socio.apellido1}` : 'este socio';

    if (!confirm(`¿Seguro que quieres eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`)) {
        return;
    }

    const { error } = await supabaseClient
        .from('socios')
        .delete()
        .eq('id', id);

    if (error) {
        alert('No se pudo eliminar el socio: ' + error.message);
    } else {
        await cargarSocios();
    }
});


// 8. Formulario de Guardado (Modal: Alta o Edición)
document.getElementById('form-socio').addEventListener('submit', async (e) => {
    e.preventDefault();

    const guardarBtn = document.getElementById('guardar-btn');
    const mensaje = document.getElementById('form-mensaje');
    const socioId = document.getElementById('socio-id').value || null;

    guardarBtn.disabled = true;
    guardarBtn.textContent = 'Guardando...';
    mensaje.style.display = 'none';

    try {
        const noVal = document.getElementById('no').value;
        const parejaVal = document.getElementById('pareja').value;

        const numeroSocio = noVal ? parseInt(noVal) : null;

        // A. Validar duplicación de número de socio
        if (numeroSocio !== null) {
            const noDuplicado = listaSocios.some(s => s.no === numeroSocio && s.id !== socioId);
            if (noDuplicado) {
                throw new Error('Ya existe otro socio registrado con el número ' + numeroSocio);
            }
        }

        const payload = {
            no: numeroSocio,
            pareja: parejaVal ? parseInt(parejaVal) : null,
            nombre: document.getElementById('nombre').value.trim(),
            apellido1: document.getElementById('apellido1').value.trim(),
            apellido2: document.getElementById('apellido2').value.trim() || null,
            dni: document.getElementById('dni').value.trim() || null,
            movil: document.getElementById('movil').value.trim() || null,
            direccion: document.getElementById('direccion').value.trim() || null,
            cp: document.getElementById('cp').value.trim() || null,
            poblacion: document.getElementById('poblacion').value.trim() || null,
            provincia: document.getElementById('provincia').value.trim() || null,
            cuota_2024: document.getElementById('cuota_2024').value || null,
            bajas: document.getElementById('bajas').value || null,
            regalo: document.getElementById('regalo').value.trim() || null,
            comida: document.getElementById('comida').value.trim() || null,
            no_de_cuenta: document.getElementById('no_de_cuenta').value.trim() || null
        };

        let resError;
        if (socioId) {
            // Edición de socio existente
            const { error } = await supabaseClient
                .from('socios')
                .update(payload)
                .eq('id', socioId);
            resError = error;
        } else {
            // Alta de nuevo socio
            const { error } = await supabaseClient
                .from('socios')
                .insert([payload]);
            resError = error;
        }

        if (resError) throw resError;

        // Cerrar modal y limpiar
        document.getElementById('form-socio').reset();
        bootstrap.Modal.getInstance(document.getElementById('modal-socio')).hide();

        await cargarSocios();
    } catch (error) {
        mensaje.className = 'message error';
        mensaje.textContent = 'No se pudo guardar el socio: ' + error.message;
        mensaje.style.display = 'block';
        console.error(error);
    } finally {
        guardarBtn.disabled = false;
        guardarBtn.textContent = 'Guardar';
    }
});


// 9. Exportar Copia de Respaldo a Excel (SheetJS)
document.getElementById('btn-exportar-excel').addEventListener('click', () => {
    if (listaSocios.length === 0) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    // Mapear los datos de Supabase a las columnas originales del Excel
    const datosExportacion = listaSocios.map(socio => ({
        'nº': socio.no,
        'Pareja': socio.pareja,
        'Apellido1': socio.apellido1,
        'Apellido2': socio.apellido2,
        'Nombre': socio.nombre,
        'Móvil': socio.movil,
        'CUOTA 2024': socio.cuota_2024,
        'BAJAS': socio.bajas,
        'Nº de Cuenta': socio.no_de_cuenta,
        'Dirección': socio.direccion,
        'CP': socio.cp,
        'Población': socio.poblacion,
        'Provincia': socio.provincia,
        'DNI': socio.dni,
        'regalo': socio.regalo,
        'comida': socio.comida
    }));

    // Generar la hoja y el archivo Excel
    const hoja = XLSX.utils.json_to_sheet(datosExportacion);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'LISTADO');

    // Descargar el archivo
    XLSX.writeFile(libro, 'backup_socios_cameron.xlsx');
});


// 10. Inicialización
(async function iniciar() {
    const sesion = await protegerPagina();
    if (!sesion) return;
    await cargarSocios();
})();
