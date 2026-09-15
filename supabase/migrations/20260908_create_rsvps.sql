create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attending text not null,
  diet text,
  created_at timestamptz not null default now()
);
