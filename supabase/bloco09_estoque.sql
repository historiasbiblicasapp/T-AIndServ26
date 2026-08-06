-- ============================================================
-- BLOCO 09 — Estoque
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS DE ESTOQUE SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.inventory_counts CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- ============================================================
-- 1. CRIAR TABELA DE FORNECEDORES
-- ============================================================

CREATE TABLE public.suppliers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  trade_name text,
  cnpj text UNIQUE,
  cpf text,
  email text,
  phone text,
  cellphone text,
  address text,
  city text,
  state text,
  zip_code text,
  contact_name text,
  contact_phone text,
  contact_email text,
  specialty text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. CRIAR TABELA DE ALMOXARIFADOS
-- ============================================================

CREATE TABLE public.warehouses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  location text,
  responsible_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELA DE ITENS DE ESTOQUE
-- ============================================================

CREATE TABLE public.inventory_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('part', 'tool', 'consumable', 'epi')),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'un',
  stock_quantity integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  max_stock integer NOT NULL DEFAULT 1000,
  unit_price numeric(10,2),
  supplier_id uuid,
  image_url text,
  qr_code text,
  barcode text,
  location_in_warehouse text,
  last_entry_date date,
  last_exit_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. CRIAR TABELA DE MOVIMENTAÇÕES
-- ============================================================

CREATE TABLE public.inventory_movements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  item_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('entry', 'exit', 'transfer', 'adjustment', 'return')),
  quantity integer NOT NULL,
  unit_price numeric(10,2),
  total_value numeric(12,2),
  work_order_id uuid,
  supplier_id uuid,
  performed_by uuid NOT NULL,
  approved_by uuid,
  notes text,
  reference_document text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 5. CRIAR TABELA DE SOLICITAÇÕES DE COMPRA
-- ============================================================

CREATE TABLE public.purchase_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  number text UNIQUE NOT NULL,
  requester_id uuid NOT NULL,
  approver_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'received', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  justification text,
  rejection_reason text,
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 6. CRIAR TABELA DE ITENS DE SOLICITAÇÃO
-- ============================================================

CREATE TABLE public.purchase_request_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_request_id uuid REFERENCES public.purchase_requests(id) ON DELETE CASCADE NOT NULL,
  item_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2),
  estimated_delivery date,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 7. CRIAR TABELA DE PEDIDOS DE COMPRA
-- ============================================================

CREATE TABLE public.purchase_orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  number text UNIQUE NOT NULL,
  purchase_request_id uuid REFERENCES public.purchase_requests(id),
  supplier_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'shipped', 'received', 'cancelled')),
  payment_terms text,
  delivery_terms text,
  shipping_method text,
  tracking_number text,
  estimated_delivery date,
  actual_delivery date,
  total_value numeric(12,2),
  notes text,
  created_by uuid NOT NULL,
  approved_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 8. CRIAR TABELA DE ITENS DO PEDIDO
-- ============================================================

CREATE TABLE public.purchase_order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_order_id uuid NOT NULL,
  purchase_request_id uuid,
  item_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(12,2) NOT NULL,
  received_quantity integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 9. CRIAR TABELA DE CONTAGEM DE INVENTÁRIO
-- ============================================================

CREATE TABLE public.inventory_counts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  item_id uuid NOT NULL,
  counted_quantity integer NOT NULL,
  system_quantity integer NOT NULL,
  difference integer NOT NULL,
  reason text,
  performed_by uuid NOT NULL,
  approved_by uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  counted_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 10. GARANTIR COLUNAS EM TABELAS EXISTENTES
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
-- 11. FOREIGN KEYS SEGUROS
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.suppliers ADD CONSTRAINT fk_suppliers_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.warehouses ADD CONSTRAINT fk_warehouses_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.warehouses ADD CONSTRAINT fk_warehouses_responsible FOREIGN KEY (responsible_id) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_items ADD CONSTRAINT fk_inventory_items_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_items ADD CONSTRAINT fk_inventory_items_warehouse FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_items ADD CONSTRAINT fk_inventory_items_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_warehouse FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_item FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_orders' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_work_order FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_movements ADD CONSTRAINT fk_inventory_movements_performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_requests ADD CONSTRAINT fk_purchase_requests_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_requests ADD CONSTRAINT fk_purchase_requests_requester FOREIGN KEY (requester_id) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_requests ADD CONSTRAINT fk_purchase_requests_approver FOREIGN KEY (approver_id) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_requests' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_request FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_item FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_requests' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_purchase_request FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_created_by FOREIGN KEY (created_by) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_orders ADD CONSTRAINT fk_purchase_orders_approved_by FOREIGN KEY (approved_by) REFERENCES public.user_profiles(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_orders' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_order FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public') THEN
    ALTER TABLE public.purchase_order_items ADD CONSTRAINT fk_purchase_order_items_inventory_item FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_counts ADD CONSTRAINT fk_inventory_counts_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_counts ADD CONSTRAINT fk_inventory_counts_warehouse FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_counts ADD CONSTRAINT fk_inventory_counts_item FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.inventory_counts ADD CONSTRAINT fk_inventory_counts_performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profiles(id);
  END IF;
END $$;

-- ============================================================
-- 12. TRIGGERS / RLS / POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_warehouses_updated_at ON public.warehouses;
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_movements_updated_at ON public.inventory_movements;
CREATE TRIGGER update_inventory_movements_updated_at BEFORE UPDATE ON public.inventory_movements FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_requests_updated_at ON public.purchase_requests;
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view warehouses" ON public.warehouses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage warehouses" ON public.warehouses FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view inventory_items" ON public.inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage inventory_items" ON public.inventory_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view inventory_movements" ON public.inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage inventory_movements" ON public.inventory_movements FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view purchase_requests" ON public.purchase_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage purchase_requests" ON public.purchase_requests FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view purchase_request_items" ON public.purchase_request_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage purchase_request_items" ON public.purchase_request_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view purchase_orders" ON public.purchase_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage purchase_orders" ON public.purchase_orders FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view purchase_order_items" ON public.purchase_order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage purchase_order_items" ON public.purchase_order_items FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

CREATE POLICY "Authenticated users can view inventory_counts" ON public.inventory_counts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage inventory_counts" ON public.inventory_counts FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 13. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_cnpj ON public.suppliers(cnpj);
CREATE INDEX IF NOT EXISTS idx_warehouses_company_id ON public.warehouses(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_id ON public.inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_warehouse_id ON public.inventory_items(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON public.inventory_items(code);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON public.inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_company_id ON public.purchase_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_id ON public.purchase_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_item_id ON public.inventory_counts(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_counted_at ON public.inventory_counts(counted_at);

-- ============================================================
-- FIM DO BLOCO 09
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
