-- Drop todas as tabelas existentes
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Admins can delete" on storage.objects;
drop table if exists public.audit_logs;
drop table if exists public.notifications;
drop table if exists public.documents;
drop table if exists public.lubrications;
drop table if exists public.preventive_maintenances;
drop table if exists public.work_orders;
drop table if exists public.checklists;
drop table if exists public.contracts;
drop table if exists public.parts;
drop table if exists public.equipments;
drop table if exists public.employees;
drop table if exists public.sectors;
drop table if exists public.suppliers;
drop table if exists public.profiles;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.update_updated_at_column();

-- Criar tabelas
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null default 'operator' check (role in ('admin', 'planner', 'supervisor', 'technician', 'operator', 'visitor')),
  avatar_url text,
  phone text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.sectors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  description text,
  parent_id uuid references public.sectors(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.employees (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text unique not null,
  phone text,
  role text not null,
  department text,
  sector_id uuid references public.sectors(id),
  avatar_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.equipments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  description text,
  category text not null check (category in ('machine', 'tool', 'vehicle', 'infrastructure')),
  sector_id uuid references public.sectors(id) not null,
  model text,
  manufacturer text,
  serial_number text,
  installation_date date,
  status text not null default 'operational' check (status in ('operational', 'attention', 'critical', 'failure', 'archived')),
  specifications jsonb,
  image_url text,
  qr_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  cnpj text unique,
  email text,
  phone text,
  address text,
  contact_name text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.checklists (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  items jsonb not null default '[]',
  equipment_id uuid references public.equipments(id),
  sector_id uuid references public.sectors(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.work_orders (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  title text not null,
  description text,
  type text not null check (type in ('preventive', 'corrective', 'predictive', 'lubrication')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  equipment_id uuid references public.equipments(id) not null,
  sector_id uuid references public.sectors(id) not null,
  assigned_to uuid references public.employees(id),
  requested_by uuid references public.profiles(id) not null,
  planned_date date,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.preventive_maintenances (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  frequency text not null check (frequency in ('weekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  equipment_id uuid references public.equipments(id) not null,
  sector_id uuid references public.sectors(id) not null,
  assigned_to uuid references public.employees(id),
  checklist_id uuid references public.checklists(id),
  status text not null default 'scheduled' check (status in ('scheduled', 'overdue', 'completed', 'in_progress')),
  last_execution date,
  next_execution date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.lubrications (
  id uuid default uuid_generate_v4() primary key,
  equipment_id uuid references public.equipments(id) not null,
  sector_id uuid references public.sectors(id) not null,
  lubricant_type text not null,
  quantity numeric(10,2) not null,
  unit text not null,
  performed_by uuid references public.employees(id) not null,
  performed_at date not null,
  next_lubrication date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.parts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  description text,
  unit text not null default 'un',
  stock_quantity integer not null default 0,
  min_stock integer not null default 0,
  unit_price numeric(10,2),
  supplier_id uuid references public.suppliers(id),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  supplier_id uuid references public.suppliers(id) not null,
  start_date date not null,
  end_date date not null,
  value numeric(12,2),
  description text,
  file_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_url text not null,
  file_type text not null,
  file_size integer not null,
  equipment_id uuid references public.equipments(id),
  work_order_id uuid references public.work_orders(id),
  uploaded_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'error', 'success')),
  read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funções e triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'operator');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger update_sectors_updated_at before update on public.sectors for each row execute procedure public.update_updated_at_column();
create trigger update_employees_updated_at before update on public.employees for each row execute procedure public.update_updated_at_column();
create trigger update_equipments_updated_at before update on public.equipments for each row execute procedure public.update_updated_at_column();
create trigger update_suppliers_updated_at before update on public.suppliers for each row execute procedure public.update_updated_at_column();
create trigger update_parts_updated_at before update on public.parts for each row execute procedure public.update_updated_at_column();
create trigger update_contracts_updated_at before update on public.contracts for each row execute procedure public.update_updated_at_column();
create trigger update_checklists_updated_at before update on public.checklists for each row execute procedure public.update_updated_at_column();
create trigger update_work_orders_updated_at before update on public.work_orders for each row execute procedure public.update_updated_at_column();
create trigger update_preventive_maintenances_updated_at before update on public.preventive_maintenances for each row execute procedure public.update_updated_at_column();

-- RLS
alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.employees enable row level security;
alter table public.equipments enable row level security;
alter table public.work_orders enable row level security;
alter table public.preventive_maintenances enable row level security;
alter table public.checklists enable row level security;
alter table public.lubrications enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.suppliers enable row level security;
alter table public.parts enable row level security;
alter table public.contracts enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can update all profiles" on public.profiles for update using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Authenticated users can view sectors" on public.sectors for select using (auth.role() = 'authenticated');
create policy "Admins can manage sectors" on public.sectors for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view employees" on public.employees for select using (auth.role() = 'authenticated');
create policy "Admins can manage employees" on public.employees for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view equipments" on public.equipments for select using (auth.role() = 'authenticated');
create policy "Admins can manage equipments" on public.equipments for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view work orders" on public.work_orders for select using (auth.role() = 'authenticated');
create policy "Admins can manage work orders" on public.work_orders for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view preventive maintenances" on public.preventive_maintenances for select using (auth.role() = 'authenticated');
create policy "Admins can manage preventive maintenances" on public.preventive_maintenances for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view checklists" on public.checklists for select using (auth.role() = 'authenticated');
create policy "Admins can manage checklists" on public.checklists for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view lubrications" on public.lubrications for select using (auth.role() = 'authenticated');
create policy "Admins can manage lubrications" on public.lubrications for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view documents" on public.documents for select using (auth.role() = 'authenticated');
create policy "Admins can upload documents" on public.documents for insert with check (auth.uid() in (select id from public.profiles where role in ('admin')));
create policy "Admins can delete documents" on public.documents for delete using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

create policy "Admins can view audit logs" on public.audit_logs for select using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Authenticated users can view suppliers" on public.suppliers for select using (auth.role() = 'authenticated');
create policy "Admins can manage suppliers" on public.suppliers for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view parts" on public.parts for select using (auth.role() = 'authenticated');
create policy "Admins can manage parts" on public.parts for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

create policy "Authenticated users can view contracts" on public.contracts for select using (auth.role() = 'authenticated');
create policy "Admins can manage contracts" on public.contracts for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

-- Storage
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using (bucket_id = 'documents');
create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Admins can delete" on storage.objects for delete using (bucket_id = 'documents' and auth.uid() in (select id from public.profiles where role = 'admin'));

-- Seeds
insert into public.sectors (name, code, description) values
  ('Produção', 'PROD', 'Setor de produção'),
  ('Manutenção', 'MANU', 'Setor de manutenção'),
  ('Logística', 'LOGI', 'Setor de logística')
on conflict (code) do nothing;
