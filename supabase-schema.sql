-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cnpj text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Units
create table if not exists public.units (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamp with time zone default now()
);

-- Plants
create table if not exists public.plants (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamp with time zone default now()
);

-- Areas
create table if not exists public.areas (
  id uuid primary key default uuid_generate_v4(),
  plant_id uuid references public.plants(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamp with time zone default now()
);

-- Sectors
create table if not exists public.sectors (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  name text not null,
  code text,
  created_at timestamp with time zone default now()
);

-- Locations
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  sector_id uuid references public.sectors(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamp with time zone default now()
);

-- Equipments
create table if not exists public.equipments (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  sector text,
  status text default 'operational',
  created_at timestamp with time zone default now()
);

-- Employees
create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text,
  department text,
  sector_id uuid references public.sectors(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Preventive Maintenances
create table if not exists public.preventive_maintenances (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  equipment_id uuid references public.equipments(id) on delete set null,
  title text not null,
  description text,
  type text default 'preventive',
  status text default 'scheduled',
  priority text default 'medium',
  scheduled_date text,
  completed_date text,
  created_at timestamp with time zone default now()
);

-- Work Orders
create table if not exists public.work_orders (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  plant_id uuid references public.plants(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  sector_id uuid references public.sectors(id) on delete set null,
  equipment_id uuid references public.equipments(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  assigned_to uuid references public.employees(id) on delete set null,
  number text,
  title text,
  status text default 'Aberta',
  type text,
  priority text,
  planned_date text,
  description text,
  cliente text,
  cnpj text,
  empresa text,
  cidade text,
  estado text,
  cep text,
  numero_endereco text,
  telefone text,
  displacement_type text,
  displacement_value numeric default 0,
  tax_rate numeric default 0,
  discount numeric default 0,
  created_at timestamp with time zone default now()
);

-- Work Order Status History
create table if not exists public.work_order_status_history (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  old_status text,
  new_status text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Work Order Executantes
create table if not exists public.work_order_executantes (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  type text,
  qualification text,
  created_at timestamp with time zone default now()
);

-- Escopo Servico
create table if not exists public.escopo_servico (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  item_number integer,
  service text,
  people integer,
  hours text,
  created_at timestamp with time zone default now()
);

-- Recursos
create table if not exists public.recursos (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  name text,
  unit text,
  quantity numeric,
  unit_value numeric,
  total numeric,
  created_at timestamp with time zone default now()
);

-- Execucoes
create table if not exists public.execucoes (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  executed_at timestamp with time zone default now()
);

-- Anexos
create table if not exists public.anexos (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  file_name text,
  file_path text,
  file_size integer,
  mime_type text,
  created_at timestamp with time zone default now()
);

-- Assinaturas
create table if not exists public.assinaturas (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  signer_id uuid references public.profiles(id) on delete set null,
  signature_data text,
  signed_at timestamp with time zone default now()
);

-- Checklist Itens
create table if not exists public.checklist_itens (
  id uuid primary key default uuid_generate_v4(),
  checklist_id uuid,
  work_order_id uuid references public.work_orders(id) on delete cascade,
  title text,
  checked boolean default false,
  created_at timestamp with time zone default now()
);

-- Historico OS
create table if not exists public.historico_os (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  action text,
  description text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'user',
  created_at timestamp with time zone default now()
);

-- Clients
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

-- Brazilian Cities
create table if not exists public.brazilian_cities (
  id uuid primary key default uuid_generate_v4(),
  city_name text not null,
  state text not null,
  state_name text not null,
  ibge_code text
);

-- Labor roles (cargos e valores HH)
create table if not exists public.labor_roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  hourly_rate numeric not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Employee roles (vinculo funcionario x cargo)
create table if not exists public.employee_roles (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade,
  role_id uuid references public.labor_roles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Work order labor (vinculo OS x cargo/executante/horas)
create table if not exists public.work_order_labor (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  role_id uuid references public.labor_roles(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  hours numeric not null,
  total numeric not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.companies enable row level security;
alter table public.units enable row level security;
alter table public.plants enable row level security;
alter table public.areas enable row level security;
alter table public.locations enable row level security;
alter table public.sectors enable row level security;
alter table public.equipments enable row level security;
alter table public.employees enable row level security;
alter table public.preventive_maintenances enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_status_history enable row level security;
alter table public.work_order_executantes enable row level security;
alter table public.escopo_servico enable row level security;
alter table public.recursos enable row level security;
alter table public.execucoes enable row level security;
alter table public.anexos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.checklist_itens enable row level security;
alter table public.historico_os enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.brazilian_cities enable row level security;
alter table public.labor_roles enable row level security;
alter table public.employee_roles enable row level security;
alter table public.work_order_labor enable row level security;

-- Policies
create policy "Allow public read companies" on public.companies for select using (true);
create policy "Allow public insert companies" on public.companies for insert with check (true);
create policy "Allow public update companies" on public.companies for update using (true);
create policy "Allow public delete companies" on public.companies for delete using (true);

create policy "Allow public read units" on public.units for select using (true);
create policy "Allow public insert units" on public.units for insert with check (true);
create policy "Allow public update units" on public.units for update using (true);
create policy "Allow public delete units" on public.units for delete using (true);

create policy "Allow public read plants" on public.plants for select using (true);
create policy "Allow public insert plants" on public.plants for insert with check (true);
create policy "Allow public update plants" on public.plants for update using (true);
create policy "Allow public delete plants" on public.plants for delete using (true);

create policy "Allow public read areas" on public.areas for select using (true);
create policy "Allow public insert areas" on public.areas for insert with check (true);
create policy "Allow public update areas" on public.areas for update using (true);
create policy "Allow public delete areas" on public.areas for delete using (true);

create policy "Allow public read locations" on public.locations for select using (true);
create policy "Allow public insert locations" on public.locations for insert with check (true);
create policy "Allow public update locations" on public.locations for update using (true);
create policy "Allow public delete locations" on public.locations for delete using (true);

create policy "Allow public read sectors" on public.sectors for select using (true);
create policy "Allow public insert sectors" on public.sectors for insert with check (true);
create policy "Allow public update sectors" on public.sectors for update using (true);
create policy "Allow public delete sectors" on public.sectors for delete using (true);

create policy "Allow public read equipments" on public.equipments for select using (true);
create policy "Allow public insert equipments" on public.equipments for insert with check (true);
create policy "Allow public update equipments" on public.equipments for update using (true);
create policy "Allow public delete equipments" on public.equipments for delete using (true);

create policy "Allow public read employees" on public.employees for select using (true);
create policy "Allow public insert employees" on public.employees for insert with check (true);
create policy "Allow public update employees" on public.employees for update using (true);
create policy "Allow public delete employees" on public.employees for delete using (true);

create policy "Allow public read preventive_maintenances" on public.preventive_maintenances for select using (true);
create policy "Allow public insert preventive_maintenances" on public.preventive_maintenances for insert with check (true);
create policy "Allow public update preventive_maintenances" on public.preventive_maintenances for update using (true);
create policy "Allow public delete preventive_maintenances" on public.preventive_maintenances for delete using (true);

create policy "Allow public read work_orders" on public.work_orders for select using (true);
create policy "Allow public insert work_orders" on public.work_orders for insert with check (true);
create policy "Allow public update work_orders" on public.work_orders for update using (true);
create policy "Allow public delete work_orders" on public.work_orders for delete using (true);

create policy "Allow public read work_order_status_history" on public.work_order_status_history for select using (true);
create policy "Allow public insert work_order_status_history" on public.work_order_status_history for insert with check (true);
create policy "Allow public update work_order_status_history" on public.work_order_status_history for update using (true);
create policy "Allow public delete work_order_status_history" on public.work_order_status_history for delete using (true);

create policy "Allow public read work_order_executantes" on public.work_order_executantes for select using (true);
create policy "Allow public insert work_order_executantes" on public.work_order_executantes for insert with check (true);
create policy "Allow public update work_order_executantes" on public.work_order_executantes for update using (true);
create policy "Allow public delete work_order_executantes" on public.work_order_executantes for delete using (true);

create policy "Allow public read escopo_servico" on public.escopo_servico for select using (true);
create policy "Allow public insert escopo_servico" on public.escopo_servico for insert with check (true);
create policy "Allow public update escopo_servico" on public.escopo_servico for update using (true);
create policy "Allow public delete escopo_servico" on public.escopo_servico for delete using (true);

create policy "Allow public read recursos" on public.recursos for select using (true);
create policy "Allow public insert recursos" on public.recursos for insert with check (true);
create policy "Allow public update recursos" on public.recursos for update using (true);
create policy "Allow public delete recursos" on public.recursos for delete using (true);

create policy "Allow public read execucoes" on public.execucoes for select using (true);
create policy "Allow public insert execucoes" on public.execucoes for insert with check (true);
create policy "Allow public update execucoes" on public.execucoes for update using (true);
create policy "Allow public delete execucoes" on public.execucoes for delete using (true);

create policy "Allow public read anexos" on public.anexos for select using (true);
create policy "Allow public insert anexos" on public.anexos for insert with check (true);
create policy "Allow public update anexos" on public.anexos for update using (true);
create policy "Allow public delete anexos" on public.anexos for delete using (true);

create policy "Allow public read assinaturas" on public.assinaturas for select using (true);
create policy "Allow public insert assinaturas" on public.assinaturas for insert with check (true);
create policy "Allow public update assinaturas" on public.assinaturas for update using (true);
create policy "Allow public delete assinaturas" on public.assinaturas for delete using (true);

create policy "Allow public read checklist_itens" on public.checklist_itens for select using (true);
create policy "Allow public insert checklist_itens" on public.checklist_itens for insert with check (true);
create policy "Allow public update checklist_itens" on public.checklist_itens for update using (true);
create policy "Allow public delete checklist_itens" on public.checklist_itens for delete using (true);

create policy "Allow public read historico_os" on public.historico_os for select using (true);
create policy "Allow public insert historico_os" on public.historico_os for insert with check (true);
create policy "Allow public update historico_os" on public.historico_os for update using (true);
create policy "Allow public delete historico_os" on public.historico_os for delete using (true);

create policy "Allow public read profiles" on public.profiles for select using (true);
create policy "Allow public insert profiles" on public.profiles for insert with check (true);
create policy "Allow public update profiles" on public.profiles for update using (true);
create policy "Allow public delete profiles" on public.profiles for delete using (true);

create policy "Allow public read clients" on public.clients for select using (true);
create policy "Allow public insert clients" on public.clients for insert with check (true);
create policy "Allow public update clients" on public.clients for update using (true);
create policy "Allow public delete clients" on public.clients for delete using (true);

create policy "Allow public read brazilian_cities" on public.brazilian_cities for select using (true);
create policy "Allow public insert brazilian_cities" on public.brazilian_cities for insert with check (true);
create policy "Allow public update brazilian_cities" on public.brazilian_cities for update using (true);
create policy "Allow public delete brazilian_cities" on public.brazilian_cities for delete using (true);

create policy "Allow public read labor_roles" on public.labor_roles for select using (true);
create policy "Allow public insert labor_roles" on public.labor_roles for insert with check (true);
create policy "Allow public update labor_roles" on public.labor_roles for update using (true);
create policy "Allow public delete labor_roles" on public.labor_roles for delete using (true);

create policy "Allow public read employee_roles" on public.employee_roles for select using (true);
create policy "Allow public insert employee_roles" on public.employee_roles for insert with check (true);
create policy "Allow public update employee_roles" on public.employee_roles for update using (true);
create policy "Allow public delete employee_roles" on public.employee_roles for delete using (true);

create policy "Allow public read work_order_labor" on public.work_order_labor for select using (true);
create policy "Allow public insert work_order_labor" on public.work_order_labor for insert with check (true);
create policy "Allow public update work_order_labor" on public.work_order_labor for update using (true);
create policy "Allow public delete work_order_labor" on public.work_order_labor for delete using (true);

insert into public.brazilian_cities (city_name, state, state_name, ibge_code) values
('São Paulo', 'SP', 'São Paulo', '3550308'),
('Rio de Janeiro', 'RJ', 'Rio de Janeiro', '3304557'),
('Belo Horizonte', 'MG', 'Minas Gerais', '3106200'),
('Curitiba', 'PR', 'Paraná', '4106902'),
('Porto Alegre', 'RS', 'Rio Grande do Sul', '4314902'),
('Salvador', 'BA', 'Bahia', '2927408'),
('Brasília', 'DF', 'Distrito Federal', '5300108'),
('Fortaleza', 'CE', 'Ceará', '2304400'),
('Manaus', 'AM', 'Amazonas', '1302603'),
('Recife', 'PE', 'Pernambuco', '2611606')
on conflict do nothing;

insert into public.labor_roles (name, code, hourly_rate, active) values
('Elétrica', 'EL', 35.00, true),
('Elétrica II', 'EL II', 55.00, true),
('Mecânica', 'ME', 33.00, true),
('Mecânica II', 'ME II', 53.00, true),
('Instrumentação', 'IN', 40.00, true),
('Instrumentação II', 'IN II', 60.00, true),
('Automação', 'AU', 60.00, true),
('Automação II', 'AU II', 80.00, true),
('Transporte', 'TR', 45.00, true),
('Administrativo', 'AD', 28.00, true),
('Serviços Gerais', 'SG', 33.00, true),
('Serviços Gerais II', 'SG II', 38.00, true),
('Civil', 'CI', 45.00, true)
on conflict do nothing;
