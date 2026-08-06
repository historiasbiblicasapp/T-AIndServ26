-- ============================================================
-- BLOCO 05 — Solicitações e Ordens de Serviço
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE OS SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.checklist_itens CASCADE;
DROP TABLE IF EXISTS public.assinaturas CASCADE;
DROP TABLE IF EXISTS public.anexos CASCADE;
DROP TABLE IF EXISTS public.execucoes CASCADE;
DROP TABLE IF EXISTS public.recursos CASCADE;
DROP TABLE IF EXISTS public.escopo_servico CASCADE;
DROP TABLE IF EXISTS public.work_order_executantes CASCADE;
DROP TABLE IF EXISTS public.work_order_status_history CASCADE;
DROP TABLE IF EXISTS public.historico_os CASCADE;
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.maintenance_requests CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE SOLICITAÇÕES
-- ============================================================

CREATE TABLE public.maintenance_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  plant_id uuid NOT NULL,
  area_id uuid NOT NULL,
  sector_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('electrical', 'mechanical', 'instrumentation', 'automation', 'general', 'civil', 'other')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'analysis', 'approved', 'planning', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected')),
  photos jsonb,
  videos jsonb,
  attachments jsonb,
  location text,
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE ORDENS DE SERVIÇO
-- ============================================================

CREATE TABLE public.work_orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  plant_id uuid NOT NULL,
  area_id uuid NOT NULL,
  sector_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  assigned_to uuid,
  requested_by uuid NOT NULL,
  approved_by uuid,
  maintenance_request_id uuid REFERENCES public.maintenance_requests(id),
  number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('corrective', 'preventive', 'predictive', 'inspection', 'lubrication', 'calibration', 'emergency', 'improvement')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'planning', 'scheduled', 'awaiting_material', 'awaiting_resource', 'in_progress', 'paused', 'completed', 'cancelled', 'blocked')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  planned_date date,
  started_at timestamp with time zone,
  paused_at timestamp with time zone,
  resumed_at timestamp with time zone,
  completed_at timestamp with time zone,
  execution_time numeric(10,2),
  downtime_time numeric(10,2),
  cause text,
  defect text,
  action_taken text,
  notes text,
  checklist_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELAS RELACIONADAS A OS
-- ============================================================

CREATE TABLE public.work_order_status_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  observation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.work_order_executantes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE public.recursos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  part_id uuid,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit text NOT NULL,
  cost numeric(10,2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.execucoes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('start', 'pause', 'resume', 'stop')),
  observation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.anexos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assinaturas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  signer_id uuid NOT NULL,
  signer_name text NOT NULL,
  signer_role text NOT NULL,
  signature_data text NOT NULL,
  signed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.checklist_itens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id uuid,
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

CREATE TABLE public.historico_os (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. GARANTIR COLUNAS EM TABELAS EXISTENTES
-- ============================================================

ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS area_id uuid;

ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS unit_id uuid;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS plant_id uuid;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS area_id uuid;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS location_id uuid;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS tag text UNIQUE;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS manufacturer text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS asset_number text;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS acquisition_date date;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS installation_date date;
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS cost_center_id uuid;
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
-- 5. FOREIGN KEYS SEGUROS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'unit_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN unit_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_unit FOREIGN KEY (unit_id) REFERENCES public.units(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'plant_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN plant_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_plant FOREIGN KEY (plant_id) REFERENCES public.plants(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'area_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN area_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_area FOREIGN KEY (area_id) REFERENCES public.areas(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'sector_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN sector_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_sector FOREIGN KEY (sector_id) REFERENCES public.sectors(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_equipment FOREIGN KEY (equipment_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_requests' AND column_name = 'requested_by' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_requests ADD COLUMN requested_by uuid;
  END IF;
  ALTER TABLE public.maintenance_requests ADD CONSTRAINT fk_maintenance_requests_requested_by FOREIGN KEY (requested_by) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'unit_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN unit_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_unit FOREIGN KEY (unit_id) REFERENCES public.units(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'plant_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN plant_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_plant FOREIGN KEY (plant_id) REFERENCES public.plants(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'area_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN area_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_area FOREIGN KEY (area_id) REFERENCES public.areas(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'sector_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN sector_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_sector FOREIGN KEY (sector_id) REFERENCES public.sectors(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_equipment FOREIGN KEY (equipment_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'assigned_to' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN assigned_to uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_assigned_to FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'requested_by' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN requested_by uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_requested_by FOREIGN KEY (requested_by) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'approved_by' AND table_schema = 'public') THEN
    ALTER TABLE public.work_orders ADD COLUMN approved_by uuid;
  END IF;
  ALTER TABLE public.work_orders ADD CONSTRAINT fk_work_orders_approved_by FOREIGN KEY (approved_by) REFERENCES public.user_profiles(id);
END $$;

-- ============================================================
-- 6. TRIGGERS / RLS / POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_maintenance_requests_updated_at ON public.maintenance_requests;
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_orders_updated_at ON public.work_orders;
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_escopo_servico_updated_at ON public.escopo_servico;
CREATE TRIGGER update_escopo_servico_updated_at BEFORE UPDATE ON public.escopo_servico FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_itens_updated_at ON public.checklist_itens;
CREATE TRIGGER update_checklist_itens_updated_at BEFORE UPDATE ON public.checklist_itens FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Authenticated users can view maintenance_requests" ON public.maintenance_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage maintenance_requests" ON public.maintenance_requests FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view work_orders" ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work_orders" ON public.work_orders FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view work_order_status_history" ON public.work_order_status_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work_order_status_history" ON public.work_order_status_history FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view work_order_executantes" ON public.work_order_executantes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage work_order_executantes" ON public.work_order_executantes FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view escopo_servico" ON public.escopo_servico FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage escopo_servico" ON public.escopo_servico FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view recursos" ON public.recursos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage recursos" ON public.recursos FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view execucoes" ON public.execucoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage execucoes" ON public.execucoes FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view anexos" ON public.anexos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage anexos" ON public.anexos FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view assinaturas" ON public.assinaturas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage assinaturas" ON public.assinaturas FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view checklist_itens" ON public.checklist_itens FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklist_itens" ON public.checklist_itens FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view historico_os" ON public.historico_os FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage historico_os" ON public.historico_os FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 7. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_company_id ON public.maintenance_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_equipment_id ON public.maintenance_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON public.maintenance_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON public.work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_equipment_id ON public.work_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON public.work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON public.work_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_work_order_status_history_work_order_id ON public.work_order_status_history(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_executantes_work_order_id ON public.work_order_executantes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_escopo_servico_work_order_id ON public.escopo_servico(work_order_id);
CREATE INDEX IF NOT EXISTS idx_recursos_work_order_id ON public.recursos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_work_order_id ON public.execucoes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_anexos_work_order_id ON public.anexos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_work_order_id ON public.assinaturas(work_order_id);
CREATE INDEX IF NOT EXISTS idx_historico_os_work_order_id ON public.historico_os(work_order_id);

-- ============================================================
-- FIM DO BLOCO 05
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
