-- ============================================================
-- BLOCO 03 — Estrutura Organizacional (v2 segura)
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. RECRIAR TABELAS QUE PRECISAM DE ESTRUTURA ATUALIZADA
-- ============================================================

DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.lines CASCADE;

CREATE TABLE public.lines (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sector_id uuid REFERENCES public.sectors(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.locations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  sector_id uuid REFERENCES public.sectors(id) NOT NULL,
  line_id uuid REFERENCES public.lines(id),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.cost_centers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  name text NOT NULL,
  description text,
  supervisor_id uuid REFERENCES public.user_profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  is_leader boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- ============================================================
-- 1. GARANTIR COLUNAS / COMPATIBILIDADE COM BLOCO 01
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
-- 2. RLS / POLICIES / TRIGGERS
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

DROP TRIGGER IF EXISTS update_lines_updated_at ON public.lines;
CREATE TRIGGER update_lines_updated_at BEFORE UPDATE ON public.lines FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_centers_updated_at ON public.cost_centers;
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON public.cost_centers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;
DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
CREATE POLICY "Authenticated users can view units" ON public.units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage units" ON public.units FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view plants" ON public.plants;
DROP POLICY IF EXISTS "Admins can manage plants" ON public.plants;
CREATE POLICY "Authenticated users can view plants" ON public.plants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage plants" ON public.plants FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view areas" ON public.areas;
DROP POLICY IF EXISTS "Admins can manage areas" ON public.areas;
CREATE POLICY "Authenticated users can view areas" ON public.areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage areas" ON public.areas FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view sectors" ON public.sectors;
DROP POLICY IF EXISTS "Admins can manage sectors" ON public.sectors;
CREATE POLICY "Authenticated users can view sectors" ON public.sectors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage sectors" ON public.sectors FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view lines" ON public.lines;
DROP POLICY IF EXISTS "Admins can manage lines" ON public.lines;
CREATE POLICY "Authenticated users can view lines" ON public.lines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage lines" ON public.lines FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
CREATE POLICY "Authenticated users can view locations" ON public.locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view cost_centers" ON public.cost_centers;
DROP POLICY IF EXISTS "Admins can manage cost_centers" ON public.cost_centers;
CREATE POLICY "Authenticated users can view cost_centers" ON public.cost_centers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage cost_centers" ON public.cost_centers FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Authenticated users can view teams" ON public.teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

DROP POLICY IF EXISTS "Authenticated users can view team_members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage team_members" ON public.team_members;
CREATE POLICY "Authenticated users can view team_members" ON public.team_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage team_members" ON public.team_members FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_units_company_id ON public.units(company_id);
CREATE INDEX IF NOT EXISTS idx_plants_unit_id ON public.plants(unit_id);
CREATE INDEX IF NOT EXISTS idx_areas_plant_id ON public.areas(plant_id);
CREATE INDEX IF NOT EXISTS idx_sectors_area_id ON public.sectors(area_id);
CREATE INDEX IF NOT EXISTS idx_lines_sector_id ON public.lines(sector_id);
CREATE INDEX IF NOT EXISTS idx_locations_sector_id ON public.locations(sector_id);
CREATE INDEX IF NOT EXISTS idx_locations_line_id ON public.locations(line_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_company_id ON public.cost_centers(company_id);
CREATE INDEX IF NOT EXISTS idx_teams_company_id ON public.teams(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- ============================================================
-- FIM DO BLOCO 03
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
