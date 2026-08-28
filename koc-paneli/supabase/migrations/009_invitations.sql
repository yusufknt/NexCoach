-- Öğrenci davet sistemi
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles(id) on delete cascade not null,
  package_id uuid references public.packages(id) on delete set null,
  token text unique not null,
  email text,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')) not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null
);

alter table public.invitations enable row level security;

create policy "Koç kendi davetlerini yönetebilir"
  on public.invitations for all
  using (auth.uid() = coach_id);

create policy "Davet detayı herkes tarafından okunabilir (kayıt için)"
  on public.invitations for select
  using (status = 'pending' and expires_at > now());
