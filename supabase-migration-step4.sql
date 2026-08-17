-- PASSO 4: Popular cidades (seed)
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

-- PASSO 5 (opcional): Adicionar FK de client_id após confirmar que clients existe
-- alter table public.work_orders add constraint fk_work_orders_client foreign key (client_id) references public.clients(id) on delete set null;
