-- ============================================================
-- BLOCO 07 — Checklist
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE CHECKLIST SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.checklist_results CASCADE;
DROP TABLE IF EXISTS public.checklist_items CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE CHECKLISTS
-- ============================================================

CREATE TABLE public.checklists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('inspection', 'preventive', 'safety', 'electrical', 'mechanical', 'lubrication', 'operation', 'custom')),
  category text CHECK (category IN ('equipment', 'asset', 'general', 'sector', 'location')),
  equipment_id uuid,
  asset_id uuid,
  sector_id uuid,
  location_id uuid,
  is_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE ITENS DO CHECKLIST
-- ============================================================

CREATE TABLE public.checklist_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id uuid REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('yes_no', 'conforme_nc', 'number', 'text', 'select', 'photo', 'signature', 'qr_code', 'video', 'audio')),
  required boolean DEFAULT false,
  options jsonb,
  value text,
  photo_url text,
  signature_data text,
  qr_code_data text,
  video_url text,
  audio_url text,
  completed boolean DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELA DE RESULTADOS DE CHECKLIST
-- ============================================================

CREATE TABLE public.checklist_results (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_id uuid REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE,
  asset_id uuid,
  equipment_id uuid,
  performed_by uuid NOT NULL,
  approved_by uuid,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved', 'rejected')),
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone,
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. CRIAR TABELA DE RESPOSTAS DOS ITENS
-- ============================================================

CREATE TABLE public.checklist_item_results (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  checklist_result_id uuid REFERENCES public.checklist_results(id) ON DELETE CASCADE NOT NULL,
  checklist_item_id uuid REFERENCES public.checklist_items(id) ON DELETE CASCADE NOT NULL,
  value text,
  photo_url text,
  signature_data text,
  qr_code_data text,
  video_url text,
  audio_url text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 5. GARANTIR COLUNAS EM TABELAS EXISTENTES
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
-- 6. FOREIGN KEYS SEGUROS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklists ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.checklists ADD CONSTRAINT fk_checklists_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklists ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.checklists ADD CONSTRAINT fk_checklists_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipments(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklists ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.checklists ADD CONSTRAINT fk_checklists_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'sector_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklists ADD COLUMN sector_id uuid;
  END IF;
  ALTER TABLE public.checklists ADD CONSTRAINT fk_checklists_sector FOREIGN KEY (sector_id) REFERENCES public.sectors(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'location_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklists ADD COLUMN location_id uuid;
  END IF;
  ALTER TABLE public.checklists ADD CONSTRAINT fk_checklists_location FOREIGN KEY (location_id) REFERENCES public.locations(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'work_order_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_results ADD COLUMN work_order_id uuid;
  END IF;
  ALTER TABLE public.checklist_results ADD CONSTRAINT fk_checklist_results_work_order FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_results ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.checklist_results ADD CONSTRAINT fk_checklist_results_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_results ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.checklist_results ADD CONSTRAINT fk_checklist_results_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipments(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'performed_by' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_results ADD COLUMN performed_by uuid;
  END IF;
  ALTER TABLE public.checklist_results ADD CONSTRAINT fk_checklist_results_performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'approved_by' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_results ADD COLUMN approved_by uuid;
  END IF;
  ALTER TABLE public.checklist_results ADD CONSTRAINT fk_checklist_results_approved_by FOREIGN KEY (approved_by) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_item_results' AND column_name = 'checklist_result_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_item_results ADD COLUMN checklist_result_id uuid;
  END IF;
  ALTER TABLE public.checklist_item_results ADD CONSTRAINT fk_checklist_item_results_checklist_result FOREIGN KEY (checklist_result_id) REFERENCES public.checklist_results(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_item_results' AND column_name = 'checklist_item_id' AND table_schema = 'public') THEN
    ALTER TABLE public.checklist_item_results ADD COLUMN checklist_item_id uuid;
  END IF;
  ALTER TABLE public.checklist_item_results ADD CONSTRAINT fk_checklist_item_results_checklist_item FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON DELETE CASCADE;
END $$;

-- ============================================================
-- 7. TRIGGERS / RLS / POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_checklists_updated_at ON public.checklists;
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_items_updated_at ON public.checklist_items;
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_results_updated_at ON public.checklist_results;
CREATE TRIGGER update_checklist_results_updated_at BEFORE UPDATE ON public.checklist_results FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_item_results_updated_at ON public.checklist_item_results;
CREATE TRIGGER update_checklist_item_results_updated_at BEFORE UPDATE ON public.checklist_item_results FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checklists" ON public.checklists FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklists" ON public.checklists FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view checklist_items" ON public.checklist_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklist_items" ON public.checklist_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view checklist_results" ON public.checklist_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklist_results" ON public.checklist_results FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view checklist_item_results" ON public.checklist_item_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage checklist_item_results" ON public.checklist_item_results FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 8. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_checklists_company_id ON public.checklists(company_id);
CREATE INDEX IF NOT EXISTS idx_checklists_equipment_id ON public.checklists(equipment_id);
CREATE INDEX IF NOT EXISTS idx_checklists_asset_id ON public.checklists(asset_id);
CREATE INDEX IF NOT EXISTS idx_checklists_type ON public.checklists(type);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_results_checklist_id ON public.checklist_results(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_results_work_order_id ON public.checklist_results(work_order_id);
CREATE INDEX IF NOT EXISTS idx_checklist_results_status ON public.checklist_results(status);
CREATE INDEX IF NOT EXISTS idx_checklist_item_results_checklist_result_id ON public.checklist_item_results(checklist_result_id);
CREATE INDEX IF NOT EXISTS idx_checklist_item_results_checklist_item_id ON public.checklist_item_results(checklist_item_id);

-- ============================================================
-- FIM DO BLOCO 07
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
