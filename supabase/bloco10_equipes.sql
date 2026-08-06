-- ============================================================
-- BLOCO 10 — Equipes
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE EQUIPES SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.productivity_records CASCADE;
DROP TABLE IF EXISTS public.availability CASCADE;
DROP TABLE IF EXISTS public.schedule_assignments CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.shifts CASCADE;
DROP TABLE IF EXISTS public.employee_specialties CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE ESPECIALIDADES
-- ============================================================

CREATE TABLE public.specialties (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('electrical', 'mechanical', 'instrumentation', 'automation', 'civil', 'hydraulic', 'pneumatic', 'welding', 'other')),
  color text DEFAULT '#2563EB',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE ESPECIALIDADES DO FUNCIONÁRIO
-- ============================================================

CREATE TABLE public.employee_specialties (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid NOT NULL,
  specialty_id uuid NOT NULL,
  level text NOT NULL DEFAULT 'intermediate' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert', 'specialist')),
  certified boolean DEFAULT false,
  certification_date date,
  certification_expiry date,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(employee_id, specialty_id)
);

-- ============================================================
-- 3. CRIAR TABELA DE TURNOS
-- ============================================================

CREATE TABLE public.shifts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_duration integer DEFAULT 60,
  color text DEFAULT '#2563EB',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. CRIAR TABELA DE ESCALAS
-- ============================================================

CREATE TABLE public.schedules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  team_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 5. CRIAR TABELA DE ALOCAÇÃO NA ESCALA
-- ============================================================

CREATE TABLE public.schedule_assignments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  schedule_id uuid REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  date date NOT NULL,
  is_leader boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(schedule_id, employee_id, date)
);

-- ============================================================
-- 6. CRIAR TABELA DE DISPONIBILIDADE
-- ============================================================

CREATE TABLE public.availability (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  date date NOT NULL,
  shift_id uuid,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'partial', 'vacation', 'sick', 'training')),
  start_time time,
  end_time time,
  reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(employee_id, date)
);

-- ============================================================
-- 7. CRIAR TABELA DE PRODUTIVIDADE
-- ============================================================

CREATE TABLE public.productivity_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  work_order_id uuid NOT NULL,
  date date NOT NULL,
  hours_worked numeric(5,2) NOT NULL,
  tasks_completed integer NOT NULL DEFAULT 0,
  tasks_total integer NOT NULL DEFAULT 0,
  efficiency numeric(5,2),
  quality_score numeric(5,2),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 8. GARANTIR COLUNAS EM TABELAS EXISTENTES
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
-- 9. FOREIGN KEYS SEGUROS
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.specialties ADD CONSTRAINT fk_specialties_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees' AND table_schema = 'public') THEN
    ALTER TABLE public.employee_specialties ADD CONSTRAINT fk_employee_specialties_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties' AND table_schema = 'public') THEN
    ALTER TABLE public.employee_specialties ADD CONSTRAINT fk_employee_specialties_specialty FOREIGN KEY (specialty_id) REFERENCES public.specialties(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.shifts ADD CONSTRAINT fk_shifts_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_team FOREIGN KEY (team_id) REFERENCES public.teams(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts' AND table_schema = 'public') THEN
    ALTER TABLE public.schedules ADD CONSTRAINT fk_schedules_shift FOREIGN KEY (shift_id) REFERENCES public.shifts(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules' AND table_schema = 'public') THEN
    ALTER TABLE public.schedule_assignments ADD CONSTRAINT fk_schedule_assignments_schedule FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees' AND table_schema = 'public') THEN
    ALTER TABLE public.schedule_assignments ADD CONSTRAINT fk_schedule_assignments_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts' AND table_schema = 'public') THEN
    ALTER TABLE public.schedule_assignments ADD CONSTRAINT fk_schedule_assignments_shift FOREIGN KEY (shift_id) REFERENCES public.shifts(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.availability ADD CONSTRAINT fk_availability_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees' AND table_schema = 'public') THEN
    ALTER TABLE public.availability ADD CONSTRAINT fk_availability_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts' AND table_schema = 'public') THEN
    ALTER TABLE public.availability ADD CONSTRAINT fk_availability_shift FOREIGN KEY (shift_id) REFERENCES public.shifts(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.productivity_records ADD CONSTRAINT fk_productivity_records_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees' AND table_schema = 'public') THEN
    ALTER TABLE public.productivity_records ADD CONSTRAINT fk_productivity_records_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_orders' AND table_schema = 'public') THEN
    ALTER TABLE public.productivity_records ADD CONSTRAINT fk_productivity_records_work_order FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);
  END IF;
END $$;

-- ============================================================
-- 10. TRIGGERS / RLS / POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_specialties_updated_at ON public.specialties;
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_specialties_updated_at ON public.employee_specialties;
CREATE TRIGGER update_employee_specialties_updated_at BEFORE UPDATE ON public.employee_specialties FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON public.shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_assignments_updated_at ON public.schedule_assignments;
CREATE TRIGGER update_schedule_assignments_updated_at BEFORE UPDATE ON public.schedule_assignments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_availability_updated_at ON public.availability;
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_productivity_records_updated_at ON public.productivity_records;
CREATE TRIGGER update_productivity_records_updated_at BEFORE UPDATE ON public.productivity_records FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view specialties" ON public.specialties FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage specialties" ON public.specialties FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view employee_specialties" ON public.employee_specialties FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage employee_specialties" ON public.employee_specialties FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view shifts" ON public.shifts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage shifts" ON public.shifts FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view schedules" ON public.schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage schedules" ON public.schedules FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view schedule_assignments" ON public.schedule_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage schedule_assignments" ON public.schedule_assignments FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view availability" ON public.availability FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage availability" ON public.availability FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view productivity_records" ON public.productivity_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage productivity_records" ON public.productivity_records FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 11. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_specialties_company_id ON public.specialties(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_specialties_employee_id ON public.employee_specialties(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_specialties_specialty_id ON public.employee_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_shifts_company_id ON public.shifts(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_company_id ON public.schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON public.schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_dates ON public.schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_schedule_id ON public.schedule_assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_employee_id ON public.schedule_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_date ON public.schedule_assignments(date);
CREATE INDEX IF NOT EXISTS idx_availability_employee_id ON public.availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_status ON public.availability(status);
CREATE INDEX IF NOT EXISTS idx_productivity_records_employee_id ON public.productivity_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_productivity_records_work_order_id ON public.productivity_records(work_order_id);
CREATE INDEX IF NOT EXISTS idx_productivity_records_date ON public.productivity_records(date);

-- ============================================================
-- FIM DO BLOCO 10
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
