-- EJECUTAR EN SUPABASE: Dashboard > SQL Editor > New query
-- Crea la tabla de socios, establece políticas de seguridad (RLS) e índices.

create table if not exists public.socios (
    id uuid primary key default gen_random_uuid(),
    no integer,                   -- Nº de Socio
    pareja integer,               -- Nº de Socio de la pareja (relación)
    apellido1 text not null,
    apellido2 text,
    nombre text not null,
    movil text,
    cuota_2024 text,              -- Guarda estados: 'domiciliado', 'PAGADO', 'NUEVO APUNTAR'
    bajas text,                   -- Guarda 'BAJA' o null/vacío
    no_de_cuenta text,            -- Datos sensibles de cuenta bancaria
    direccion text,               -- Dirección postal
    cp text,                      -- Código postal
    poblacion text,
    provincia text,
    dni text,                     -- Documento de identidad
    regalo text,                  -- Estados de regalo: 'x', 'FALTA 23/24', etc.
    comida text,                  -- Estados de comida
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.socios enable row level security;

-- Solo usuarios autenticados (los del portal admin) pueden ver o realizar cambios.
-- Los socios NO se exponen públicamente en la web.
create policy "Usuarios autenticados gestionan socios"
    on public.socios
    for all
    to authenticated
    using (true)
    with check (true);

-- Crear índices de optimización para búsquedas rápidas
create index if not exists socios_no_idx on public.socios (no);
create index if not exists socios_dni_idx on public.socios (dni);
create index if not exists socios_apellidos_nombre_idx on public.socios (apellido1, apellido2, nombre);

-- Función y Trigger para actualización automática de updated_at
create or replace function public.actualizar_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
    before update on public.socios
    for each row
    execute function public.actualizar_updated_at_column();
