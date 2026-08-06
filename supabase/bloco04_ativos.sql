-- ============================================================
-- BLOCO 04 — Cadastro de Ativos (v3 com limpeza segura)
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE ATIVOS SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.asset_history CASCADE;
DROP TABLE IF EXISTS public.asset_photos CASCADE;
DROP TABLE IF EXISTS public.asset_documents CASCADE;
DROP TABLE IF EXISTS public.asset_components CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.asset_models CASCADE;
DROP TABLE IF EXISTS public.asset_families CASCADE;
DROP TABLE IF EXISTS public.asset_categories CASCADE;
DROP TABLE IF EXISTS public.manufacturers CASCADE;
DROP TABLE IF EXISTS public.asset_status CASCADE;
DROP TABLE IF EXISTS public.asset_criticality CASCADE;

-- ============================================================
-- 1. GARANTIR TABELAS BASE
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

CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id),
  area_id uuid REFERENCES public.areas(id),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES public.sectors(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.cost_centers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  cpf text,
  phone text,
  avatar_url text,
  role_id uuid REFERENCES public.roles(id),
  company_id uuid REFERENCES public.companies(id),
  department text,
  position text,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELAS DE ATIVOS
-- ============================================================

CREATE TABLE public.asset_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_families (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  category_id uuid REFERENCES public.asset_categories(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.manufacturers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  country text,
  website text,
  contact_email text,
  contact_phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_models (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  manufacturer_id uuid REFERENCES public.manufacturers(id) NOT NULL,
  family_id uuid REFERENCES public.asset_families(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  specifications jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_status (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_criticality (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#F59E0B',
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  plant_id uuid REFERENCES public.plants(id) NOT NULL,
  area_id uuid REFERENCES public.areas(id) NOT NULL,
  sector_id uuid REFERENCES public.sectors(id) NOT NULL,
  location_id uuid REFERENCES public.locations(id),
  category_id uuid REFERENCES public.asset_categories(id) NOT NULL,
  family_id uuid REFERENCES public.asset_families(id) NOT NULL,
  model_id uuid REFERENCES public.asset_models(id) NOT NULL,
  manufacturer_id uuid REFERENCES public.manufacturers(id) NOT NULL,
  status_id uuid REFERENCES public.asset_status(id) NOT NULL,
  criticality_id uuid REFERENCES public.asset_criticality(id) NOT NULL,
  cost_center_id uuid REFERENCES public.cost_centers(id),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  tag text UNIQUE NOT NULL,
  description text,
  serial_number text,
  asset_number text,
  year integer,
  acquisition_date date,
  installation_date date,
  power numeric(10,2),
  voltage text,
  capacity numeric(10,2),
  hourmeter numeric(10,2) DEFAULT 0,
  odometer numeric(10,2),
  specifications jsonb,
  qr_code text,
  barcode text,
  image_url text,
  manual_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_components (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.asset_components(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  serial_number text,
  specifications jsonb,
  image_url text,
  position text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES public.asset_components(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  description text,
  uploaded_by uuid REFERENCES public.user_profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_photos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES public.asset_components(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text,
  is_main boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. GARANTIR COLUNAS EM TABELAS EXISTENTES
-- ============================================================

ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.sectors ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id);

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
ALTER TABLE public.equipments ADD COLUMN IF NOT EXISTS cost_center_id uuid REFERENCES public.cost_centers(id);
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

ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS plant_id uuid REFERENCES public.plants(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.user_profiles(id);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS resumed_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS execution_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS downtime_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS cause text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS defect text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS action_taken text;

-- ============================================================
-- 4. TRIGGERS / RLS / POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_asset_categories_updated_at ON public.asset_categories;
CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON public.asset_categories FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_families_updated_at ON public.asset_families;
CREATE TRIGGER update_asset_families_updated_at BEFORE UPDATE ON public.asset_families FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_manufacturers_updated_at ON public.manufacturers;
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON public.manufacturers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_models_updated_at ON public.asset_models;
CREATE TRIGGER update_asset_models_updated_at BEFORE UPDATE ON public.asset_models FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_components_updated_at ON public.asset_components;
CREATE TRIGGER update_asset_components_updated_at BEFORE UPDATE ON public.asset_components FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_criticality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view asset_categories" ON public.asset_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_categories" ON public.asset_categories FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_families" ON public.asset_families FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_families" ON public.asset_families FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view manufacturers" ON public.manufacturers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage manufacturers" ON public.manufacturers FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_models" ON public.asset_models FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_models" ON public.asset_models FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_status" ON public.asset_status FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_status" ON public.asset_status FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_criticality" ON public.asset_criticality FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_criticality" ON public.asset_criticality FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view assets" ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage assets" ON public.assets FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_components" ON public.asset_components FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_components" ON public.asset_components FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_documents" ON public.asset_documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_documents" ON public.asset_documents FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_photos" ON public.asset_photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_photos" ON public.asset_photos FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view asset_history" ON public.asset_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage asset_history" ON public.asset_history FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 5. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_asset_categories_company_id ON public.asset_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_families_category_id ON public.asset_families(category_id);
CREATE INDEX IF NOT EXISTS idx_asset_models_manufacturer_id ON public.asset_models(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_assets_company_id ON public.assets(company_id);
CREATE INDEX IF NOT EXISTS idx_assets_sector_id ON public.assets(sector_id);
CREATE INDEX IF NOT EXISTS idx_assets_status_id ON public.assets(status_id);
CREATE INDEX IF NOT EXISTS idx_assets_criticality_id ON public.assets(criticality_id);
CREATE INDEX IF NOT EXISTS idx_asset_components_asset_id ON public.asset_components(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset_id ON public.asset_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_photos_asset_id ON public.asset_photos(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON public.asset_history(asset_id);

-- ============================================================
-- 6. DADOS INICIAIS
-- ============================================================

INSERT INTO public.asset_status (company_id, name, code, color, description)
SELECT c.id, 'Operacional', 'OPERATIONAL', '#10B981', 'Equipamento operando normalmente'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_status LIMIT 1);

INSERT INTO public.asset_status (company_id, name, code, color, description)
SELECT c.id, 'Em Manutenção', 'IN_MAINTENANCE', '#F59E0B', 'Equipamento em manutenção'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_status WHERE code = 'IN_MAINTENANCE');

INSERT INTO public.asset_status (company_id, name, code, color, description)
SELECT c.id, 'Parado', 'STOPPED', '#EF4444', 'Equipamento parado'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_status WHERE code = 'STOPPED');

INSERT INTO public.asset_status (company_id, name, code, color, description)
SELECT c.id, 'Desativado', 'DECOMMISSIONED', '#6B7280', 'Equipamento desativado'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_status WHERE code = 'DECOMMISSIONED');

INSERT INTO public.asset_criticality (company_id, name, code, color, description)
SELECT c.id, 'Baixa', 'LOW', '#10B981', 'Baixa criticidade'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_criticality LIMIT 1);

INSERT INTO public.asset_criticality (company_id, name, code, color, description)
SELECT c.id, 'Média', 'MEDIUM', '#F59E0B', 'Média criticidade'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_criticality WHERE code = 'MEDIUM');

INSERT INTO public.asset_criticality (company_id, name, code, color, description)
SELECT c.id, 'Alta', 'HIGH', '#F97316', 'Alta criticidade'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_criticality WHERE code = 'HIGH');

INSERT INTO public.asset_criticality (company_id, name, code, color, description)
SELECT c.id, 'Crítica', 'CRITICAL', '#EF4444', 'Crítica criticidade'
FROM public.companies c
WHERE NOT EXISTS (SELECT 1 FROM public.asset_criticality WHERE code = 'CRITICAL');

-- ============================================================
-- FIM DO BLOCO 04
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
