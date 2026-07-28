create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
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

create table if not exists public.sectors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  description text,
  parent_id uuid references public.sectors(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.employees (
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

create table if not exists public.equipments (
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

create table if not exists public.suppliers (
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

create table if not exists public.checklists (
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

create table if not exists public.work_orders (
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

create table if not exists public.preventive_maintenances (
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

create table if not exists public.lubrications (
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

create table if not exists public.parts (
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

create table if not exists public.contracts (
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

create table if not exists public.documents (
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

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'error', 'success')),
  read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.audit_logs (
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists update_sectors_updated_at on public.sectors;
create trigger update_sectors_updated_at before update on public.sectors for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_employees_updated_at on public.employees;
create trigger update_employees_updated_at before update on public.employees for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_equipments_updated_at on public.equipments;
create trigger update_equipments_updated_at before update on public.equipments for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_suppliers_updated_at on public.suppliers;
create trigger update_suppliers_updated_at before update on public.suppliers for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_parts_updated_at on public.parts;
create trigger update_parts_updated_at before update on public.parts for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_contracts_updated_at on public.contracts;
create trigger update_contracts_updated_at before update on public.contracts for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_checklists_updated_at on public.checklists;
create trigger update_checklists_updated_at before update on public.checklists for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_work_orders_updated_at on public.work_orders;
create trigger update_work_orders_updated_at before update on public.work_orders for each row execute procedure public.update_updated_at_column();

drop trigger if exists update_preventive_maintenances_updated_at on public.preventive_maintenances;
create trigger update_preventive_maintenances_updated_at before update on public.preventive_maintenances for each row execute procedure public.update_updated_at_column();

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

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can update all profiles" on public.profiles for update using (auth.uid() in (select id from public.profiles where role = 'admin'));

drop policy if exists "Authenticated users can view sectors" on public.sectors;
drop policy if exists "Admins can manage sectors" on public.sectors;
create policy "Authenticated users can view sectors" on public.sectors for select using (auth.role() = 'authenticated');
create policy "Admins can manage sectors" on public.sectors for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view employees" on public.employees;
drop policy if exists "Admins can manage employees" on public.employees;
create policy "Authenticated users can view employees" on public.employees for select using (auth.role() = 'authenticated');
create policy "Admins can manage employees" on public.employees for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view equipments" on public.equipments;
drop policy if exists "Admins can manage equipments" on public.equipments;
create policy "Authenticated users can view equipments" on public.equipments for select using (auth.role() = 'authenticated');
create policy "Admins can manage equipments" on public.equipments for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view work orders" on public.work_orders;
drop policy if exists "Admins can manage work orders" on public.work_orders;
create policy "Authenticated users can view work orders" on public.work_orders for select using (auth.role() = 'authenticated');
create policy "Admins can manage work orders" on public.work_orders for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view preventive maintenances" on public.preventive_maintenances;
drop policy if exists "Admins can manage preventive maintenances" on public.preventive_maintenances;
create policy "Authenticated users can view preventive maintenances" on public.preventive_maintenances for select using (auth.role() = 'authenticated');
create policy "Admins can manage preventive maintenances" on public.preventive_maintenances for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view checklists" on public.checklists;
drop policy if exists "Admins can manage checklists" on public.checklists;
create policy "Authenticated users can view checklists" on public.checklists for select using (auth.role() = 'authenticated');
create policy "Admins can manage checklists" on public.checklists for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view lubrications" on public.lubrications;
drop policy if exists "Admins can manage lubrications" on public.lubrications;
create policy "Authenticated users can view lubrications" on public.lubrications for select using (auth.role() = 'authenticated');
create policy "Admins can manage lubrications" on public.lubrications for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view documents" on public.documents;
drop policy if exists "Admins can upload documents" on public.documents;
drop policy if exists "Admins can delete documents" on public.documents;
create policy "Authenticated users can view documents" on public.documents for select using (auth.role() = 'authenticated');
create policy "Admins can upload documents" on public.documents for insert with check (auth.uid() in (select id from public.profiles where role in ('admin')));
create policy "Admins can delete documents" on public.documents for delete using (auth.uid() in (select id from public.profiles where role = 'admin'));

drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs" on public.audit_logs for select using (auth.uid() in (select id from public.profiles where role = 'admin'));

drop policy if exists "Authenticated users can view suppliers" on public.suppliers;
drop policy if exists "Admins can manage suppliers" on public.suppliers;
create policy "Authenticated users can view suppliers" on public.suppliers for select using (auth.role() = 'authenticated');
create policy "Admins can manage suppliers" on public.suppliers for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view parts" on public.parts;
drop policy if exists "Admins can manage parts" on public.parts;
create policy "Authenticated users can view parts" on public.parts for select using (auth.role() = 'authenticated');
create policy "Admins can manage parts" on public.parts for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

drop policy if exists "Authenticated users can view contracts" on public.contracts;
drop policy if exists "Admins can manage contracts" on public.contracts;
create policy "Authenticated users can view contracts" on public.contracts for select using (auth.role() = 'authenticated');
create policy "Admins can manage contracts" on public.contracts for all using (auth.uid() in (select id from public.profiles where role in ('admin')));

insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Admins can delete" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id = 'documents');
create policy "Authenticated users can upload" on storage.objects for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Admins can delete" on storage.objects for delete using (bucket_id = 'documents' and auth.uid() in (select id from public.profiles where role = 'admin'));

insert into public.sectors (name, code, description) values
  ('Produção', 'PROD', 'Setor de produção'),
  ('Manutenção', 'MANU', 'Setor de manutenção'),
  ('Logística', 'LOGI', 'Setor de logística')
on conflict (code) do nothing;