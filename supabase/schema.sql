-- Esquema mínimo para el Demo Day: un solo proyecto Supabase compartido por Vue, React y Angular.
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('estudiante','administrador')) default 'estudiante',
  nombres text,
  apellidos text,
  cedula text,
  carrera text,
  semestre int,
  created_at timestamptz default now()
);

create table if not exists public.solicitudes_beca (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo_beca text,
  promedio numeric,
  ingreso numeric,
  carga_familiar int,
  estado text not null default 'borrador' check (estado in ('borrador','enviada','en_revision','aprobada','rechazada')),
  observacion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.documentos_solicitud (
  id bigint generated always as identity primary key,
  solicitud_id bigint not null references public.solicitudes_beca(id) on delete cascade,
  nombre text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','cargado','observado','aprobado')),
  url text,
  created_at timestamptz default now()
);

alter table public.perfiles enable row level security;
alter table public.solicitudes_beca enable row level security;
alter table public.documentos_solicitud enable row level security;

create policy "perfil propio" on public.perfiles for select using (auth.uid() = id);
create policy "actualizar perfil propio" on public.perfiles for update using (auth.uid() = id);
create policy "crear perfil propio" on public.perfiles for insert with check (auth.uid() = id);

create policy "estudiante ve sus solicitudes" on public.solicitudes_beca for select using (auth.uid() = user_id);
create policy "estudiante crea sus solicitudes" on public.solicitudes_beca for insert with check (auth.uid() = user_id);
create policy "estudiante actualiza sus solicitudes" on public.solicitudes_beca for update using (auth.uid() = user_id);

create policy "documentos de mis solicitudes" on public.documentos_solicitud for select using (
  exists (select 1 from public.solicitudes_beca s where s.id = solicitud_id and s.user_id = auth.uid())
);
create policy "crear documentos en mis solicitudes" on public.documentos_solicitud for insert with check (
  exists (select 1 from public.solicitudes_beca s where s.id = solicitud_id and s.user_id = auth.uid())
);
create policy "actualizar documentos de mis solicitudes" on public.documentos_solicitud for update using (
  exists (select 1 from public.solicitudes_beca s where s.id = solicitud_id and s.user_id = auth.uid())
);
