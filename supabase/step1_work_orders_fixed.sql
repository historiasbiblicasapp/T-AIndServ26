-- ============================================================
-- PASSO 1: ATUALIZAR BANCO DE DADOS - MÓDULO OS COMPLETO
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 1. CRIAR TABELAS DE ESTRUTURA ORGANIZACIONAL
-- ============================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  trade_name text,
  cnpj text UNIQUE NOT NULL,
  state_registration text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.units (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  city text,
  state text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.plants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id uuid REFERENCES public.plants(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. ATUALIZAR TABELAS EXISTENTES COM company_id
-- ============================================================

ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id);

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  sector_id uuid REFERENCES public.sectors(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. ATUALIZAR EQUIPMENTS COM ESTRUTURA COMPLETA
-- ============================================================

ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS plant_id uuid REFERENCES public.plants(id);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS tag text UNIQUE;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS manufacturer text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS asset_number text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS acquisition_date date;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS installation_date date;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS cost_center text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS criticality text NOT NULL DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS power numeric(10,2);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS voltage text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS capacity numeric(10,2);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS hourmeter numeric(10,2) DEFAULT 0;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS odometer numeric(10,2);
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS specifications jsonb;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS qr_code text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS manual_url text;

-- ============================================================
-- 4. ATUALIZAR WORK_ORDERS COM ESTRUTURA COMPLETA
-- ============================================================

ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS plant_id uuid REFERENCES public.plants(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS resumed_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS execution_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS downtime_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS cause text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS defect text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS action_taken text;

-- ============================================================
-- 5. CRIAR TABELAS RELACIONADAS A OS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.work_order_status_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  old_status text,
  new_status text NOT NULL,
  observation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.work_order_executantes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TABLE IF EXISTS public.escopo_servico CASCADE;

CREATE TABLE public.escopo_servico (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  item_number integer NOT NULL,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recursos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  part_id uuid REFERENCES public.parts(id),
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit text NOT NULL,
  cost numeric(10,2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.execucoes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  action text NOT NULL CHECK (action IN ('start', 'pause', 'resume', 'stop')),
  observation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.anexos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id) NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assinaturas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  signer_id uuid REFERENCES public.profiles(id) NOT NULL,
  signer_name text NOT NULL,
  signer_role text NOT NULL,
  signature_data text NOT NULL,
  signed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.checklist_itens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id uuid REFERENCES public.checklists(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('yes_no', 'conforme_nc', 'number', 'text', 'select', 'photo', 'signature')),
  required boolean DEFAULT false,
  options jsonb,
  value text,
  photo_url text,
  signature_data text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.historico_os (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 6. CRIAR TRIGGERS DE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON public.units;
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_plants_updated_at ON public.plants;
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_areas_updated_at ON public.areas;
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sectors_updated_at ON public.sectors;
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_orders_updated_at ON public.work_orders;
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipments_updated_at ON public.equipments;
CREATE TRIGGER update_equipments_updated_at BEFORE UPDATE ON public.equipments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_itens_updated_at ON public.checklist_itens;
CREATE TRIGGER update_checklist_itens_updated_at BEFORE UPDATE ON public.checklist_itens FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- 7. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_executantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escopo_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_os ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. CRIAR POLICIES RLS
-- ============================================================

-- Companies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Units
DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;
DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
CREATE POLICY "Authenticated users can view units" ON public.units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage units" ON public.units FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Plants
DROP POLICY IF EXISTS "Authenticated users can view plants" ON public.plants;
DROP POLICY IF EXISTS "Admins can manage plants" ON public.plants;
CREATE POLICY "Authenticated users can view plants" ON public.plants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage plants" ON public.plants FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Areas
DROP POLICY IF EXISTS "Authenticated users can view areas" ON public.areas;
DROP POLICY IF EXISTS "Admins can manage areas" ON public.areas;
CREATE POLICY "Authenticated users can view areas" ON public.areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage areas" ON public.areas FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Sectors
DROP POLICY IF EXISTS "Authenticated users can view sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can manage sectors" ON public.sectors;
CREATE POLICY "Authenticated users can view sectors" ON public.sectors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage sectors" ON public.sectors FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Locations
DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
CREATE POLICY "Authenticated users can view locations" ON public.locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Work Orders
DROP POLICY IF EXISTS "Authenticated users can view work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Admins can manage work orders" ON public.work_orders;
CREATE POLICY "Authenticated users can view work orders" ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work orders" ON public.work_orders FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Work Order Status History
DROP POLICY IF EXISTS "Authenticated users can view work order status history" ON public.work_order_status_history;
DROP POLICY IF EXISTS "Admins can manage work order status history" ON public.work_order_status_history;
CREATE POLICY "Authenticated users can view work order status history" ON public.work_order_status_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work order status history" ON public.work_order_status_history FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Work Order Executantes
DROP POLICY IF EXISTS "Authenticated users can view work order executantes" ON public.work_order_executantes;
DROP POLICY IF EXISTS "Admins can manage work order executantes" ON public.work_order_executantes;
CREATE POLICY "Authenticated users can view work order executantes" ON public.work_order_executantes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work order executantes" ON public.work_order_executantes FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Escopo Servico
DROP POLICY IF EXISTS "Authenticated users can view escopo servico" ON public.escopo_servico;
DROP POLICY IF EXISTS "Admins can manage escopo servico" ON public.escopo_servico;
CREATE POLICY "Authenticated users can view escopo servico" ON public.escopo_servico FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage escopo servico" ON public.escopo_servico FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Recursos
DROP POLICY IF EXISTS "Authenticated users can view recursos" ON public.recursos;
DROP POLICY IF EXISTS "Admins can manage recursos" ON public.recursos;
CREATE POLICY "Authenticated users can view recursos" ON public.recursos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage recursos" ON public.recursos FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Execucoes
DROP POLICY IF EXISTS "Authenticated users can view execucoes" ON public.execucoes;
DROP POLICY IF EXISTS "Admins can manage execucoes" ON public.execucoes;
CREATE POLICY "Authenticated users can view execucoes" ON public.execucoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage execucoes" ON public.execucoes FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Anexos
DROP POLICY IF EXISTS "Authenticated users can view anexos" ON public.anexos;
DROP POLICY IF EXISTS "Admins can manage anexos" ON public.anexos;
CREATE POLICY "Authenticated users can view anexos" ON public.anexos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage anexos" ON public.anexos FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Assinaturas
DROP POLICY IF EXISTS "Authenticated users can view assinaturas" ON public.assinaturas;
DROP POLICY IF EXISTS "Admins can manage assinaturas" ON public.assinaturas;
CREATE POLICY "Authenticated users can view assinaturas" ON public.assinaturas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage assinaturas" ON public.assinaturas FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Checklist Itens
DROP POLICY IF EXISTS "Authenticated users can view checklist_itens" ON public.checklist_itens;
DROP POLICY IF EXISTS "Admins can manage checklist_itens" ON public.checklist_itens;
CREATE POLICY "Authenticated users can view checklist_itens" ON public.checklist_itens FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklist_itens" ON public.checklist_itens FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- Historico OS
DROP POLICY IF EXISTS "Authenticated users can view historico_os" ON public.historico_os;
DROP POLICY IF EXISTS "Admins can manage historico_os" ON public.historico_os;
CREATE POLICY "Authenticated users can view historico_os" ON public.historico_os FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage historico_os" ON public.historico_os FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin')));

-- ============================================================
-- 9. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON public.work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_equipment_id ON public.work_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON public.work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON public.work_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_work_order_executantes_work_order_id ON public.work_order_executantes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_escopo_servico_work_order_id ON public.escopo_servico(work_order_id);
CREATE INDEX IF NOT EXISTS idx_recursos_work_order_id ON public.recursos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_work_order_id ON public.execucoes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_anexos_work_order_id ON public.anexos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_work_order_id ON public.assinaturas(work_order_id);
CREATE INDEX IF NOT EXISTS idx_historico_os_work_order_id ON public.historico_os(work_order_id);

-- ============================================================
-- 10. INSERIR DADOS INICIAIS (SEED)
-- ============================================================

-- Inserir empresa padrão se não existir
INSERT INTO public.companies (name, trade_name, cnpj, email, phone, is_active)
SELECT 'T&A Serv Ind', 'T&A Serv Ind', '00000000000000', 'contato@taservind.com.br', '(00) 0000-0000', true
WHERE NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- Inserir unidade padrão
INSERT INTO public.units (company_id, name, code, is_active)
SELECT c.id, 'Unidade Principal', 'UNI-001', true
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.units LIMIT 1);

-- Inserir planta padrão
INSERT INTO public.plants (unit_id, name, code, description, is_active)
SELECT u.id, 'Planta Principal', 'PLA-001', 'Planta principal da empresa', true
FROM public.units u
WHERE NOT EXISTS (SELECT 1 FROM public.plants LIMIT 1);

-- Inserir área padrão
INSERT INTO public.areas (plant_id, name, code, description, is_active)
SELECT p.id, 'Área de Manutenção', 'ARE-001', 'Área responsável pela manutenção industrial', true
FROM public.plants p
WHERE NOT EXISTS (SELECT 1 FROM public.areas LIMIT 1);

-- ============================================================
-- FIM DO PASSO 1
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================