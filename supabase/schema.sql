-- Esquema compatible con los módulos Vue, React y Angular del proyecto.
create table if not exists public.becas (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  requisito_promedio numeric not null default 0,
  requisito_ingresos numeric not null default 0,
  activa boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.solicitudes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  beca_id bigint not null references public.becas(id) on delete restrict,
  promedio numeric,
  ingresos numeric,
  estado text not null default 'pendiente' check (estado in ('pendiente','revision','aprobada','rechazada','correccion')),
  observacion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.documentos (
  id bigint generated always as identity primary key,
  solicitud_id bigint not null references public.solicitudes(id) on delete cascade,
  nombre text not null,
  url text,
  estado text not null default 'pendiente' check (estado in ('pendiente','cargado','observado','aprobado')),
  created_at timestamptz default now()
);

create table if not exists public.seguimiento (
  id bigint generated always as identity primary key,
  solicitud_id bigint not null references public.solicitudes(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente','revision','aprobada','rechazada','correccion')),
  comentario text,
  created_at timestamptz default now()
);

alter table public.becas enable row level security;
alter table public.solicitudes enable row level security;
alter table public.documentos enable row level security;
alter table public.seguimiento enable row level security;

drop policy if exists "becas visibles para todos" on public.becas;
create policy "becas visibles para todos" on public.becas
  for select using (true);

drop policy if exists "consultar solicitudes" on public.solicitudes;
create policy "consultar solicitudes" on public.solicitudes
  for select using (true);

drop policy if exists "crear solicitudes" on public.solicitudes;
create policy "crear solicitudes" on public.solicitudes
  for insert with check (true);

drop policy if exists "actualizar solicitudes" on public.solicitudes;
create policy "actualizar solicitudes" on public.solicitudes
  for update using (true);

drop policy if exists "eliminar solicitudes" on public.solicitudes;
create policy "eliminar solicitudes" on public.solicitudes
  for delete using (true);

drop policy if exists "consultar documentos" on public.documentos;
create policy "consultar documentos" on public.documentos
  for select using (true);

drop policy if exists "crear documentos" on public.documentos;
create policy "crear documentos" on public.documentos
  for insert with check (true);

drop policy if exists "actualizar documentos" on public.documentos;
create policy "actualizar documentos" on public.documentos
  for update using (true);

drop policy if exists "consultar seguimiento" on public.seguimiento;
create policy "consultar seguimiento" on public.seguimiento
  for select using (true);

drop policy if exists "crear seguimiento" on public.seguimiento;
create policy "crear seguimiento" on public.seguimiento
  for insert with check (true);

drop policy if exists "actualizar seguimiento" on public.seguimiento;
create policy "actualizar seguimiento" on public.seguimiento
  for update using (true);
