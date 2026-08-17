-- PASSO 3: Habilitar RLS e recriar policies
alter table public.clients enable row level security;
alter table public.brazilian_cities enable row level security;

drop policy if exists "Allow public read companies" on public.companies;
drop policy if exists "Allow public insert companies" on public.companies;
drop policy if exists "Allow public update companies" on public.companies;
drop policy if exists "Allow public delete companies" on public.companies;

drop policy if exists "Allow public read units" on public.units;
drop policy if exists "Allow public insert units" on public.units;
drop policy if exists "Allow public update units" on public.units;
drop policy if exists "Allow public delete units" on public.units;

drop policy if exists "Allow public read plants" on public.plants;
drop policy if exists "Allow public insert plants" on public.plants;
drop policy if exists "Allow public update plants" on public.plants;
drop policy if exists "Allow public delete plants" on public.plants;

drop policy if exists "Allow public read areas" on public.areas;
drop policy if exists "Allow public insert areas" on public.areas;
drop policy if exists "Allow public update areas" on public.areas;
drop policy if exists "Allow public delete areas" on public.areas;

drop policy if exists "Allow public read locations" on public.locations;
drop policy if exists "Allow public insert locations" on public.locations;
drop policy if exists "Allow public update locations" on public.locations;
drop policy if exists "Allow public delete locations" on public.locations;

drop policy if exists "Allow public read sectors" on public.sectors;
drop policy if exists "Allow public insert sectors" on public.sectors;
drop policy if exists "Allow public update sectors" on public.sectors;
drop policy if exists "Allow public delete sectors" on public.sectors;

drop policy if exists "Allow public read equipments" on public.equipments;
drop policy if exists "Allow public insert equipments" on public.equipments;
drop policy if exists "Allow public update equipments" on public.equipments;
drop policy if exists "Allow public delete equipments" on public.equipments;

drop policy if exists "Allow public read employees" on public.employees;
drop policy if exists "Allow public insert employees" on public.employees;
drop policy if exists "Allow public update employees" on public.employees;
drop policy if exists "Allow public delete employees" on public.employees;

drop policy if exists "Allow public read preventive_maintenances" on public.preventive_maintenances;
drop policy if exists "Allow public insert preventive_maintenances" on public.preventive_maintenances;
drop policy if exists "Allow public update preventive_maintenances" on public.preventive_maintenances;
drop policy if exists "Allow public delete preventive_maintenances" on public.preventive_maintenances;

drop policy if exists "Allow public read work_orders" on public.work_orders;
drop policy if exists "Allow public insert work_orders" on public.work_orders;
drop policy if exists "Allow public update work_orders" on public.work_orders;
drop policy if exists "Allow public delete work_orders" on public.work_orders;

drop policy if exists "Allow public read work_order_status_history" on public.work_order_status_history;
drop policy if exists "Allow public insert work_order_status_history" on public.work_order_status_history;
drop policy if exists "Allow public update work_order_status_history" on public.work_order_status_history;
drop policy if exists "Allow public delete work_order_status_history" on public.work_order_status_history;

drop policy if exists "Allow public read work_order_executantes" on public.work_order_executantes;
drop policy if exists "Allow public insert work_order_executantes" on public.work_order_executantes;
drop policy if exists "Allow public update work_order_executantes" on public.work_order_executantes;
drop policy if exists "Allow public delete work_order_executantes" on public.work_order_executantes;

drop policy if exists "Allow public read escopo_servico" on public.escopo_servico;
drop policy if exists "Allow public insert escopo_servico" on public.escopo_servico;
drop policy if exists "Allow public update escopo_servico" on public.escopo_servico;
drop policy if exists "Allow public delete escopo_servico" on public.escopo_servico;

drop policy if exists "Allow public read recursos" on public.recursos;
drop policy if exists "Allow public insert recursos" on public.recursos;
drop policy if exists "Allow public update recursos" on public.recursos;
drop policy if exists "Allow public delete recursos" on public.recursos;

drop policy if exists "Allow public read execucoes" on public.execucoes;
drop policy if exists "Allow public insert execucoes" on public.execucoes;
drop policy if exists "Allow public update execucoes" on public.execucoes;
drop policy if exists "Allow public delete execucoes" on public.execucoes;

drop policy if exists "Allow public read anexos" on public.anexos;
drop policy if exists "Allow public insert anexos" on public.anexos;
drop policy if exists "Allow public update anexos" on public.anexos;
drop policy if exists "Allow public delete anexos" on public.anexos;

drop policy if exists "Allow public read assinaturas" on public.assinaturas;
drop policy if exists "Allow public insert assinaturas" on public.assinaturas;
drop policy if exists "Allow public update assinaturas" on public.assinaturas;
drop policy if exists "Allow public delete assinaturas" on public.assinaturas;

drop policy if exists "Allow public read checklist_itens" on public.checklist_itens;
drop policy if exists "Allow public insert checklist_itens" on public.checklist_itens;
drop policy if exists "Allow public update checklist_itens" on public.checklist_itens;
drop policy if exists "Allow public delete checklist_itens" on public.checklist_itens;

drop policy if exists "Allow public read historico_os" on public.historico_os;
drop policy if exists "Allow public insert historico_os" on public.historico_os;
drop policy if exists "Allow public update historico_os" on public.historico_os;
drop policy if exists "Allow public delete historico_os" on public.historico_os;

drop policy if exists "Allow public read profiles" on public.profiles;
drop policy if exists "Allow public insert profiles" on public.profiles;
drop policy if exists "Allow public update profiles" on public.profiles;
drop policy if exists "Allow public delete profiles" on public.profiles;

drop policy if exists "Allow public read clients" on public.clients;
drop policy if exists "Allow public insert clients" on public.clients;
drop policy if exists "Allow public update clients" on public.clients;
drop policy if exists "Allow public delete clients" on public.clients;

drop policy if exists "Allow public read brazilian_cities" on public.brazilian_cities;
drop policy if exists "Allow public insert brazilian_cities" on public.brazilian_cities;
drop policy if exists "Allow public update brazilian_cities" on public.brazilian_cities;
drop policy if exists "Allow public delete brazilian_cities" on public.brazilian_cities;

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
