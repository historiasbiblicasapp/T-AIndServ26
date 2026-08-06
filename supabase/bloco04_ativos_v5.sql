-- ============================================================
-- BLOCO 04 — Cadastro de Ativos (v5 limpa e recria)
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE ATIVOS EXISTENTES
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
-- 1. CRIAR TABELAS DE ATIVOS
-- ============================================================

CREATE TABLE public.asset_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_families (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  category_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.manufacturers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
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
  company_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL,
  family_id uuid NOT NULL,
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
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_criticality (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#F59E0B',
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  plant_id uuid NOT NULL,
  area_id uuid NOT NULL,
  sector_id uuid NOT NULL,
  location_id uuid,
  category_id uuid NOT NULL,
  family_id uuid NOT NULL,
  model_id uuid NOT NULL,
  manufacturer_id uuid NOT NULL,
  status_id uuid NOT NULL,
  criticality_id uuid NOT NULL,
  cost_center_id uuid,
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
  asset_id uuid NOT NULL,
  parent_id uuid,
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
  asset_id uuid NOT NULL,
  component_id uuid,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  description text,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_photos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid NOT NULL,
  component_id uuid,
  url text NOT NULL,
  description text,
  is_main boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.asset_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. GARANTIR COLUNAS EM TABELAS EXISTENTES
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

ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS unit_id uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS plant_id uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS area_id uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS location_id uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS approved_by uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS resumed_at timestamp with time zone;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS execution_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS downtime_time numeric(10,2);
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS cause text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS defect text;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS action_taken text;

-- ============================================================
-- 3. ADICIONAR FOREIGN KEYS APÓS GARANTIR COLUNAS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_categories' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_categories ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.asset_categories ADD CONSTRAINT fk_asset_categories_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_families' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_families ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.asset_families ADD CONSTRAINT fk_asset_families_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_families' AND column_name = 'category_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_families ADD COLUMN category_id uuid;
  END IF;
  ALTER TABLE public.asset_families ADD CONSTRAINT fk_asset_families_category FOREIGN KEY (category_id) REFERENCES public.asset_categories(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manufacturers' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.manufacturers ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.manufacturers ADD CONSTRAINT fk_manufacturers_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_models' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_models ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.asset_models ADD CONSTRAINT fk_asset_models_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_models' AND column_name = 'manufacturer_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_models ADD COLUMN manufacturer_id uuid;
  END IF;
  ALTER TABLE public.asset_models ADD CONSTRAINT fk_asset_models_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_models' AND column_name = 'family_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_models ADD COLUMN family_id uuid;
  END IF;
  ALTER TABLE public.asset_models ADD CONSTRAINT fk_asset_models_family FOREIGN KEY (family_id) REFERENCES public.asset_families(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_status' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_status ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.asset_status ADD CONSTRAINT fk_asset_status_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_criticality' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_criticality ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.asset_criticality ADD CONSTRAINT fk_asset_criticality_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'company_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN company_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'unit_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN unit_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_unit FOREIGN KEY (unit_id) REFERENCES public.units(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'plant_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN plant_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_plant FOREIGN KEY (plant_id) REFERENCES public.plants(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'area_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN area_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_area FOREIGN KEY (area_id) REFERENCES public.areas(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'sector_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN sector_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_sector FOREIGN KEY (sector_id) REFERENCES public.sectors(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'location_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN location_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_location FOREIGN KEY (location_id) REFERENCES public.locations(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'category_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN category_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_category FOREIGN KEY (category_id) REFERENCES public.asset_categories(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'family_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN family_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_family FOREIGN KEY (family_id) REFERENCES public.asset_families(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'model_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN model_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_model FOREIGN KEY (model_id) REFERENCES public.asset_models(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'manufacturer_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN manufacturer_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'status_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN status_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_status FOREIGN KEY (status_id) REFERENCES public.asset_status(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'criticality_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN criticality_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_criticality FOREIGN KEY (criticality_id) REFERENCES public.asset_criticality(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'cost_center_id' AND table_schema = 'public') THEN
    ALTER TABLE public.assets ADD COLUMN cost_center_id uuid;
  END IF;
  ALTER TABLE public.assets ADD CONSTRAINT fk_assets_cost_center FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_components' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_components ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.asset_components ADD CONSTRAINT fk_asset_components_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_components' AND column_name = 'parent_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_components ADD COLUMN parent_id uuid;
  END IF;
  ALTER TABLE public.asset_components ADD CONSTRAINT fk_asset_components_parent FOREIGN KEY (parent_id) REFERENCES public.asset_components(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_documents' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_documents ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.asset_documents ADD CONSTRAINT fk_asset_documents_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_documents' AND column_name = 'component_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_documents ADD COLUMN component_id uuid;
  END IF;
  ALTER TABLE public.asset_documents ADD CONSTRAINT fk_asset_documents_component FOREIGN KEY (component_id) REFERENCES public.asset_components(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_photos' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_photos ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.asset_photos ADD CONSTRAINT fk_asset_photos_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_photos' AND column_name = 'component_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_photos ADD COLUMN component_id uuid;
  END IF;
  ALTER TABLE public.asset_photos ADD CONSTRAINT fk_asset_photos_component FOREIGN KEY (component_id) REFERENCES public.asset_components(id) ON DELETE CASCADE;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'asset_history' AND column_name = 'asset_id' AND table_schema = 'public') THEN
    ALTER TABLE public.asset_history ADD COLUMN asset_id uuid;
  END IF;
  ALTER TABLE public.asset_history ADD CONSTRAINT fk_asset_history_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END $$;

-- ============================================================
-- 4. DADOS INICIAIS
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
