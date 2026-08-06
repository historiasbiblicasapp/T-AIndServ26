-- ============================================================
-- BLOCO 06 — Preventivas
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE PREVENTIVAS SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.preventive_maintenances CASCADE;
DROP TABLE IF EXISTS public.preventive_schedules CASCADE;
DROP TABLE IF EXISTS public.maintenance_plan_tasks CASCADE;
DROP TABLE IF EXISTS public.maintenance_plans CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE PLANOS DE MANUTENÇÃO
-- ============================================================

CREATE TABLE public.maintenance_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'daily', 'biweekly', 'bimonthly', 'biennial')),
  frequency_by_hours boolean DEFAULT false,
  frequency_hours numeric(10,2),
  frequency_by_cycles boolean DEFAULT false,
  frequency_cycles integer,
  frequency_by_odometer boolean DEFAULT false,
  frequency_odometer numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE TAREFAS DO PLANO
-- ============================================================

CREATE TABLE public.maintenance_plan_tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id uuid REFERENCES public.maintenance_plans(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  estimated_duration numeric(10,2),
  checklist_id uuid,
  parts jsonb,
  tools jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELA DE AGENDAMENTOS PREVENTIVOS
-- ============================================================

CREATE TABLE public.preventive_schedules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  plan_id uuid REFERENCES public.maintenance_plans(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid NOT NULL,
  assigned_to uuid,
  scheduled_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'overdue', 'completed', 'in_progress', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes text,
  work_order_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. CRIAR TABELA DE MANUTENÇÕES PREVENTIVAS
-- ============================================================

CREATE TABLE public.preventive_maintenances (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  plan_id uuid REFERENCES public.maintenance_plans(id) ON DELETE CASCADE NOT NULL,
  schedule_id uuid REFERENCES public.preventive_schedules(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid NOT NULL,
  assigned_to uuid,
  work_order_id uuid,
  title text NOT NULL,
  description text,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'daily', 'biweekly', 'bimonthly', 'biennial')),
  frequency_by_hours boolean DEFAULT false,
  frequency_hours numeric(10,2),
  frequency_by_cycles boolean DEFAULT false,
  frequency_cycles integer,
  frequency_by_odometer boolean DEFAULT false,
  frequency_odometer numeric(10,2),
  last_execution date,
  next_execution date NOT NULL,
  current_hourmeter numeric(10,2),
  current_odometer numeric(10,2),
  current_cycles integer,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'overdue', 'completed', 'in_progress')),
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_plans' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_plans ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.maintenance_plans ADD CONSTRAINT fk_maintenance_plans_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_plans' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.maintenance_plans ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.maintenance_plans ADD CONSTRAINT fk_maintenance_plans_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_schedules' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_schedules ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.preventive_schedules ADD CONSTRAINT fk_preventive_schedules_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_schedules' AND column_name = 'plan_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_schedules ADD COLUMN plan_id uuid;
  END IF;
  ALTER TABLE public.preventive_schedules ADD CONSTRAINT fk_preventive_schedules_plan FOREIGN KEY (plan_id) REFERENCES public.maintenance_plans(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_schedules' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_schedules ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.preventive_schedules ADD CONSTRAINT fk_preventive_schedules_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_schedules' AND column_name = 'assigned_to' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_schedules ADD COLUMN assigned_to uuid;
  END IF;
  ALTER TABLE public.preventive_schedules ADD CONSTRAINT fk_preventive_schedules_assigned_to FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_maintenances' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_maintenances ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.preventive_maintenances ADD CONSTRAINT fk_preventive_maintenances_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_maintenances' AND column_name = 'plan_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_maintenances ADD COLUMN plan_id uuid;
  END IF;
  ALTER TABLE public.preventive_maintenances ADD CONSTRAINT fk_preventive_maintenances_plan FOREIGN KEY (plan_id) REFERENCES public.maintenance_plans(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_maintenances' AND column_name = 'schedule_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_maintenances ADD COLUMN schedule_id uuid;
  END IF;
  ALTER TABLE public.preventive_maintenances ADD CONSTRAINT fk_preventive_maintenances_schedule FOREIGN KEY (schedule_id) REFERENCES public.preventive_schedules(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_maintenances' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_maintenances ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.preventive_maintenances ADD CONSTRAINT fk_preventive_maintenances_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preventive_maintenances' AND column_name = 'assigned_to' AND table_schema = 'public') THEN
    ALTER TABLE public.preventive_maintenances ADD COLUMN assigned_to uuid;
  END IF;
  ALTER TABLE public.preventive_maintenances ADD CONSTRAINT fk_preventive_maintenances_assigned_to FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id);
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

DROP TRIGGER IF EXISTS update_maintenance_plans_updated_at ON public.maintenance_plans;
CREATE TRIGGER update_maintenance_plans_updated_at BEFORE UPDATE ON public.maintenance_plans FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_plan_tasks_updated_at ON public.maintenance_plan_tasks;
CREATE TRIGGER update_maintenance_plan_tasks_updated_at BEFORE UPDATE ON public.maintenance_plan_tasks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_preventive_schedules_updated_at ON public.preventive_schedules;
CREATE TRIGGER update_preventive_schedules_updated_at BEFORE UPDATE ON public.preventive_schedules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_preventive_maintenances_updated_at ON public.preventive_maintenances;
CREATE TRIGGER update_preventive_maintenances_updated_at BEFORE UPDATE ON public.preventive_maintenances FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_maintenances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view maintenance_plans" ON public.maintenance_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage maintenance_plans" ON public.maintenance_plans FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view maintenance_plan_tasks" ON public.maintenance_plan_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage maintenance_plan_tasks" ON public.maintenance_plan_tasks FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view preventive_schedules" ON public.preventive_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage preventive_schedules" ON public.preventive_schedules FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view preventive_maintenances" ON public.preventive_maintenances FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage preventive_maintenances" ON public.preventive_maintenances FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 8. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_plans_company_id ON public.maintenance_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_asset_id ON public.maintenance_plans(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_plan_tasks_plan_id ON public.maintenance_plan_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_company_id ON public.preventive_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_plan_id ON public.preventive_schedules(plan_id);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_asset_id ON public.preventive_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_status ON public.preventive_schedules(status);
CREATE INDEX IF NOT EXISTS idx_preventive_schedules_due_date ON public.preventive_schedules(due_date);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenances_company_id ON public.preventive_maintenances(company_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenances_plan_id ON public.preventive_maintenances(plan_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenances_asset_id ON public.preventive_maintenances(asset_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenances_status ON public.preventive_maintenances(status);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenances_next_execution ON public.preventive_maintenances(next_execution);

-- ============================================================
-- 9. DADOS INICIAIS
-- ============================================================

INSERT INTO public.maintenance_plans (company_id, asset_id, name, description, frequency, is_active)
SELECT c.id, a.id, 'Plano Padrão - Inspeção Visual', 'Inspeção visual geral dos equipamentos', 'monthly', true
FROM public.companies c
CROSS JOIN LATERAL (SELECT id FROM public.assets LIMIT 1) a
WHERE NOT EXISTS (SELECT 1 FROM public.maintenance_plans LIMIT 1);

-- ============================================================
-- FIM DO BLOCO 06
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
