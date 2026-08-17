-- PASSO 5: Adicionar colunas financeiras em work_orders se não existirem
alter table public.work_orders add column if not exists mao_obra numeric default 0;
alter table public.work_orders add column if not exists deslocamento numeric default 0;
alter table public.work_orders add column if not exists imposto numeric default 0;
alter table public.work_orders add column if not exists desconto numeric default 0;
