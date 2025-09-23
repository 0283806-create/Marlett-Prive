-- Schema for clientes, eventos, reservas

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  telefono text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha date not null,
  lugar text not null,
  descripcion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  evento_id uuid references eventos(id) on delete cascade,
  fecha_reserva timestamptz default now(),
  estado text check (estado in ('pending','confirmed','cancelled','in-progress','completed')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_reservas_cliente on reservas(cliente_id);
create index if not exists idx_reservas_evento on reservas(evento_id);
create index if not exists idx_eventos_fecha on eventos(fecha);


