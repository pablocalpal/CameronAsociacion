-- Ejecutar en Supabase: Dashboard > SQL Editor > New query
-- Crea la tabla de actividades, sus políticas de seguridad (RLS) y la carga con
-- los datos que hoy están escritos a mano en actividades/index.html

create table if not exists public.actividades (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    titulo text not null,
    resumen text not null,
    contenido text not null default '',
    fecha date not null,
    hora text,
    lugar text,
    precio text default 'Entrada libre',
    imagen_url text,
    created_at timestamptz not null default now()
);

alter table public.actividades enable row level security;

-- Cualquiera (incluso sin login) puede leer las actividades: la web pública las muestra
create policy "Lectura publica de actividades"
    on public.actividades for select
    using (true);

-- Solo usuarios autenticados (los del portal admin) pueden crear, editar o borrar
create policy "Usuarios autenticados crean actividades"
    on public.actividades for insert
    to authenticated
    with check (true);

create policy "Usuarios autenticados editan actividades"
    on public.actividades for update
    to authenticated
    using (true) with check (true);

create policy "Usuarios autenticados borran actividades"
    on public.actividades for delete
    to authenticated
    using (true);

-- Datos iniciales: lo que ya existía como HTML estático, para no perder contenido
insert into public.actividades (slug, titulo, resumen, contenido, fecha, hora, lugar, precio, imagen_url) values
(
    'tour-historico-teatralizado',
    'Tour histórico teatralizado',
    'Recorre las calles de Camarillas mientras actores locales interpretan escenas históricas del pueblo. Un viaje en el tiempo que conecta pasado y presente a través del teatro callejero.',
    'El tour histórico teatralizado es una de las actividades más queridas de la asociación. Durante aproximadamente dos horas, grupos de vecinos y actores aficionados recrean momentos clave de la historia de Camarillas en los escenarios reales donde ocurrieron.

El recorrido comienza en la Plaza Mayor del pueblo, donde se narra la fundación medieval de Camarillas, y continúa por las calles empedradas hasta llegar a la iglesia parroquial. En cada parada, los actores representan una escena diferente: desde la vida cotidiana de los pastores trashumantes hasta las dificultades de la posguerra.

Programa:
11:00 – Punto de encuentro en la Plaza Mayor
11:15 – Primera escena: "Los orígenes de Camarillas"
11:45 – Paseo hasta la Calle Mayor con parada dramatizada
12:15 – Escena en la iglesia: "La fe del pueblo"
12:45 – Final del recorrido y aperitivo en la plaza

Esta actividad está abierta a todo el público, tanto socios como no socios de la asociación. Los niños y niñas son especialmente bienvenidos. En caso de lluvia, la actividad se trasladará al salón social del pueblo.',
    '2025-12-15', '11:00', 'Plaza Mayor, Camarillas', 'Entrada libre', '/media/actividad_teatro.jpg'
),
(
    'documental-espana-vaciada',
    'Documental España Vaciada',
    'Proyección del documental que pone el foco en la despoblación rural con especial atención a nuestro pueblo. Tras la proyección tendrá lugar un coloquio con el director.',
    'Proyección del documental que pone el foco en la despoblación rural con especial atención a nuestro pueblo. Tras la proyección tendrá lugar un coloquio con el director.',
    '2026-06-10', '19:00', 'Salón social, Camarillas', 'Entrada libre', '/media/presentacion_documental.jpg'
),
(
    'presentacion-libro-en-busca-de-la-ferte',
    'Presentación libro "En busca de La Ferte"',
    'Presentación del estudio sobre el patrimonio abandonado de la provincia de Teruel. El autor compartirá sus hallazgos y fotografías inéditas de la investigación.',
    'Presentación del estudio sobre el patrimonio abandonado de la provincia de Teruel. El autor compartirá sus hallazgos y fotografías inéditas de la investigación.',
    '2026-08-12', '18:00', 'Salón social, Camarillas', 'Entrada libre', '/media/presentacion_libro.jpg'
),
(
    'fiestas-patronales-2024',
    'Fiestas Patronales 2024',
    'Cuatro días de celebración con verbenas, comidas populares, juegos tradicionales y la procesión en honor a la Virgen del Campo. Un éxito de convivencia con más de 200 asistentes.',
    'Cuatro días de celebración con verbenas, comidas populares, juegos tradicionales y la procesión en honor a la Virgen del Campo. Un éxito de convivencia con más de 200 asistentes.',
    '2024-08-14', null, 'Camarillas', null, '/media/virgen-del-campo.jpg'
),
(
    'jornada-limpieza-monte-2024',
    'Jornada de limpieza del monte',
    'Voluntarios de la asociación y vecinos se unieron para limpiar y acondicionar los senderos del monte que rodea el pueblo. Se recogieron más de 50 bolsas de residuos.',
    'Voluntarios de la asociación y vecinos se unieron para limpiar y acondicionar los senderos del monte que rodea el pueblo. Se recogieron más de 50 bolsas de residuos.',
    '2024-04-22', null, 'Camarillas', null, '/media/pueblo.jpg'
),
(
    'taller-reposteria-tradicional-2024',
    'Taller de repostería tradicional',
    'Las vecinas más veteranas del pueblo compartieron las recetas de tortas, mantecados y otros dulces tradicionales de Camarillas con las generaciones más jóvenes.',
    'Las vecinas más veteranas del pueblo compartieron las recetas de tortas, mantecados y otros dulces tradicionales de Camarillas con las generaciones más jóvenes.',
    '2024-03-03', null, 'Camarillas', null, null
),
(
    'exposicion-fotografica-camarillas-en-el-recuerdo',
    'Exposición fotográfica "Camarillas en el recuerdo"',
    'Recopilación de fotografías antiguas del pueblo cedidas por familias del lugar. La muestra incluyó imágenes desde los años 40 hasta los 90 y estuvo expuesta durante las fiestas patronales.',
    'Recopilación de fotografías antiguas del pueblo cedidas por familias del lugar. La muestra incluyó imágenes desde los años 40 hasta los 90 y estuvo expuesta durante las fiestas patronales.',
    '2023-08-15', null, 'Camarillas', null, '/media/cementerio-viejo.jpg'
);

-- Almacenamiento de imágenes: crear el bucket "actividades-media" desde
-- Dashboard > Storage > New bucket (marcarlo como "Public"), y luego ejecutar esto
-- para permitir que cualquiera vea las imágenes pero solo el admin pueda subir/borrar.
insert into storage.buckets (id, name, public)
values ('actividades-media', 'actividades-media', true)
on conflict (id) do nothing;

create policy "Lectura publica de imagenes de actividades"
    on storage.objects for select
    using (bucket_id = 'actividades-media');

create policy "Usuarios autenticados suben imagenes de actividades"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'actividades-media');

create policy "Usuarios autenticados borran imagenes de actividades"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'actividades-media');
