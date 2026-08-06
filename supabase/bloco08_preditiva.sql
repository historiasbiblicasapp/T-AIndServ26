-- ============================================================
-- BLOCO 08 — Preditiva
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE PREDITIVA SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.predictive_alerts CASCADE;
DROP TABLE IF EXISTS public.predictive_alert_rules CASCADE;
DROP TABLE IF EXISTS public.predictive_measurements CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE MEDIÇÕES PREDITIVAS
-- ============================================================

CREATE TABLE public.predictive_measurements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  measurement_type text NOT NULL CHECK (measurement_type IN ('temperature', 'vibration', 'current', 'voltage', 'noise', 'oil_analysis', 'pressure', 'humidity', 'flow', 'level')),
  value numeric(10,2) NOT NULL,
  unit text NOT NULL,
  sensor_id text,
  location text,
  notes text,
  measured_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE REGRAS DE ALERTA
-- ============================================================

CREATE TABLE public.predictive_alert_rules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  measurement_type text NOT NULL CHECK (measurement_type IN ('temperature', 'vibration', 'current', 'voltage', 'noise', 'oil_analysis', 'pressure', 'humidity', 'flow', 'level')),
  name text NOT NULL,
  description text,
  condition_type text NOT NULL CHECK (condition_type IN ('greater_than', 'less_than', 'between', 'outside_range', 'trend_up', 'trend_down')),
  threshold_min numeric(10,2),
  threshold_max numeric(10,2),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELA DE ALERTAS
-- ============================================================

CREATE TABLE public.predictive_alerts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  rule_id uuid REFERENCES public.predictive_alert_rules(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  measurement_id uuid REFERENCES public.predictive_measurements(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'false_positive')),
  value numeric(10,2) NOT NULL,
  unit text NOT NULL,
  threshold_min numeric(10,2),
  threshold_max numeric(10,2),
  acknowledged_by uuid,
  acknowledged_at timestamp with time zone,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_measurements' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_measurements ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.predictive_measurements ADD CONSTRAINT fk_predictive_measurements_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_measurements' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_measurements ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.predictive_measurements ADD CONSTRAINT fk_predictive_measurements_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_measurements' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_measurements ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.predictive_measurements ADD CONSTRAINT fk_predictive_measurements_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipments(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_measurements' AND column_name = 'created_by' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_measurements ADD COLUMN created_by uuid;
  END IF;
  ALTER TABLE public.predictive_measurements ADD CONSTRAINT fk_predictive_measurements_created_by FOREIGN KEY (created_by) REFERENCES public.user_profiles(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_alert_rules' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_alert_rules ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.predictive_alert_rules ADD CONSTRAINT fk_predictive_alert_rules_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_alert_rules' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_alert_rules ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.predictive_alert_rules ADD CONSTRAINT fk_predictive_alert_rules_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_alerts' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_alerts ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.predictive_alerts ADD CONSTRAINT fk_predictive_alerts_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_alerts' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_alerts ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.predictive_alerts ADD CONSTRAINT fk_predictive_alerts_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictive_alerts' AND column_name = 'equipment_id' AND table_schema = 'public') THEN
    ALTER TABLE public.predictive_alerts ADD COLUMN equipment_id uuid;
  END IF;
  ALTER TABLE public.predictive_alerts ADD CONSTRAINT fk_predictive_alerts_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipments(id);
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

DROP TRIGGER IF EXISTS update_predictive_alert_rules_updated_at ON public.predictive_alert_rules;
CREATE TRIGGER update_predictive_alert_rules_updated_at BEFORE UPDATE ON public.predictive_alert_rules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_predictive_alerts_updated_at ON public.predictive_alerts;
CREATE TRIGGER update_predictive_alerts_updated_at BEFORE UPDATE ON public.predictive_alerts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.predictive_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view predictive_measurements" ON public.predictive_measurements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage predictive_measurements" ON public.predictive_measurements FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view predictive_alert_rules" ON public.predictive_alert_rules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage predictive_alert_rules" ON public.predictive_alert_rules FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view predictive_alerts" ON public.predictive_alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage predictive_alerts" ON public.predictive_alerts FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 7. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_predictive_measurements_company_id ON public.predictive_measurements(company_id);
CREATE INDEX IF NOT EXISTS idx_predictive_measurements_asset_id ON public.predictive_measurements(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_measurements_equipment_id ON public.predictive_measurements(equipment_id);
CREATE INDEX IF NOT EXISTS idx_predictive_measurements_measurement_type ON public.predictive_measurements(measurement_type);
CREATE INDEX IF NOT EXISTS idx_predictive_measurements_measured_at ON public.predictive_measurements(measured_at);

CREATE INDEX IF NOT EXISTS idx_predictive_alert_rules_company_id ON public.predictive_alert_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alert_rules_asset_id ON public.predictive_alert_rules(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alert_rules_measurement_type ON public.predictive_alert_rules(measurement_type);
CREATE INDEX IF NOT EXISTS idx_predictive_alert_rules_is_active ON public.predictive_alert_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_predictive_alerts_company_id ON public.predictive_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_asset_id ON public.predictive_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_rule_id ON public.predictive_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_status ON public.predictive_alerts(status);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_created_at ON public.predictive_alerts(created_at);

-- ============================================================
-- FIM DO BLOCO 08
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
