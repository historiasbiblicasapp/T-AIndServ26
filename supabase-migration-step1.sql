-- PASSO 1: Criar tabelas novas
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cnpj text,
  company text,
  address text,
  city text,
  state text,
  zip_code text,
  number text,
  complement text,
  neighborhood text,
  phone text,
  email text,
  responsible text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.brazilian_cities (
  id uuid primary key default uuid_generate_v4(),
  city_name text not null,
  state text not null,
  state_name text not null,
  ibge_code text
);
