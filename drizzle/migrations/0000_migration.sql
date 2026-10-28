create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  location text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  location text,
  size_acres numeric,
  created_at timestamptz not null default now()
);
create table public.crops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  farm_id uuid references public.farms(id) on delete cascade,
  name text not null,
  stage text not null default 'sowing',
  sown_on date,
  treatments text,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  category text not null default 'seed',
  quantity numeric not null default 0,
  unit text default 'kg',
  price numeric default 0,
  created_at timestamptz not null default now()
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  item text not null,
  booking_date date not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);
do $$ declare t text; begin
  foreach t in array array['farms','crops','products','bookings'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "owner or admin select" on public.%I for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "owner insert" on public.%I for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "owner or admin update" on public.%I for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "owner or admin delete" on public.%I for delete to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create table public.crop_catalog (
  id serial primary key,
  name text not null,
  duration_days int,
  season text,
  common_pests text
);
grant select on public.crop_catalog to anon, authenticated;
grant all on public.crop_catalog to service_role;
alter table public.crop_catalog enable row level security;
create policy "public read" on public.crop_catalog for select to anon, authenticated using (true);
insert into public.crop_catalog(name,duration_days,season,common_pests) values
('Wheat',120,'Rabi','Aphids, Rust'),
('Rice',140,'Kharif','Stem borer, Brown planthopper'),
('Maize',100,'Kharif','Fall armyworm'),
('Cotton',170,'Kharif','Bollworm, Whitefly'),
('Sugarcane',360,'Annual','Top borer'),
('Tomato',90,'All','Fruit borer, Leaf curl'),
('Mustard',110,'Rabi','Aphids'),
('Soybean',100,'Kharif','Girdle beetle');