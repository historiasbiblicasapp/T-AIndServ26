-- PASSO 2: Adicionar colunas em work_orders
alter table public.work_orders add column if not exists client_id uuid;
alter table public.work_orders add column if not exists description text;
alter table public.work_orders add column if not exists cliente text;
alter table public.work_orders add column if not exists cnpj text;
alter table public.work_orders add column if not exists empresa text;
alter table public.work_orders add column if not exists cidade text;
alter table public.work_orders add column if not exists estado text;
alter table public.work_orders add column if not exists cep text;
alter table public.work_orders add column if not exists numero_endereco text;
alter table public.work_orders add column if not exists telefone text;
