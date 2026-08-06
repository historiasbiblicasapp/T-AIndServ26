-- ============================================================
-- BLOCO 04 — Cadastro de Ativos (v4 mínimo)
-- ============================================================
-- Execute este script primeiro para isolar o erro
-- ============================================================

-- Apenas criar as tabelas de ativos, sem seeds/policies/triggers
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
