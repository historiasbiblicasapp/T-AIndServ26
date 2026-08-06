-- ============================================================
-- BLOCO 02 — Usuários, Segurança, RLS, Auditoria e LGPD
-- ============================================================
-- Copie TODO este script e cole no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
-- ============================================================

-- ============================================================
-- 0. LIMPAR TABELAS ANTIGAS SE EXISTIREM
-- ============================================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.lgpd_consents CASCADE;
DROP TABLE IF EXISTS public.lgpd_data_retention CASCADE;
DROP TABLE IF EXISTS public.lgpd_anonymizations CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- ============================================================
-- 1. CRIAR TABELAS DE USUÁRIOS E PERFIS
-- ============================================================

CREATE TABLE public.roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.role_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_id, permission_id)
);

CREATE TABLE public.user_profiles (
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
-- 2. CRIAR TABELAS DE SEGURANÇA
-- ============================================================

CREATE TABLE public.sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.password_resets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. CRIAR TABELAS DE AUDITORIA
-- ============================================================

CREATE TABLE public.audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. CRIAR TABELAS LGPD
-- ============================================================

CREATE TABLE public.lgpd_consents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL,
  granted boolean NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.lgpd_data_retention (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  retention_period integer NOT NULL,
  auto_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.lgpd_anonymizations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  anonymized_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 5. CRIAR TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lgpd_data_retention_updated_at ON public.lgpd_data_retention;
CREATE TRIGGER update_lgpd_data_retention_updated_at BEFORE UPDATE ON public.lgpd_data_retention FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- 6. HABILITAR RLS
-- ============================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_data_retention ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_anonymizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. CRIAR POLICIES RLS
-- ============================================================

-- Roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));
CREATE POLICY "Authenticated users can view roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

-- Permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));
CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

-- Role Permissions
DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Authenticated users can view role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));
CREATE POLICY "Authenticated users can view role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');

-- User Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- Sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.sessions;
CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all sessions" ON public.sessions FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- Password Resets
DROP POLICY IF EXISTS "Users can view their own password_resets" ON public.password_resets;
DROP POLICY IF EXISTS "Admins can manage password_resets" ON public.password_resets;
CREATE POLICY "Users can view their own password_resets" ON public.password_resets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage password_resets" ON public.password_resets FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- LGPD Consents
DROP POLICY IF EXISTS "Users can view their own consents" ON public.lgpd_consents;
DROP POLICY IF EXISTS "Admins can manage all consents" ON public.lgpd_consents;
CREATE POLICY "Users can view their own consents" ON public.lgpd_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all consents" ON public.lgpd_consents FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- LGPD Data Retention
DROP POLICY IF EXISTS "Admins can manage data_retention" ON public.lgpd_data_retention;
CREATE POLICY "Admins can manage data_retention" ON public.lgpd_data_retention FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- LGPD Anonymizations
DROP POLICY IF EXISTS "Admins can manage anonymizations" ON public.lgpd_anonymizations;
CREATE POLICY "Admins can manage anonymizations" ON public.lgpd_anonymizations FOR ALL USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role_id IN (SELECT id FROM public.roles WHERE name = 'admin')));

-- ============================================================
-- 8. CRIAR ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================
-- 9. INSERIR DADOS INICIAIS
-- ============================================================

INSERT INTO public.roles (name, description, is_system) VALUES
  ('admin', 'Administrador do sistema', true),
  ('gestor', 'Gestor de manutenção', false),
  ('supervisor', 'Supervisor de equipe', false),
  ('tecnico', 'Técnico de manutenção', false),
  ('operador', 'Operador', false),
  ('solicitante', 'Solicitante de serviços', false),
  ('almoxarife', 'Almoxarife', false),
  ('auditor', 'Auditor', false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name, description, module, action) VALUES
  ('dashboard.view', 'Visualizar dashboard', 'dashboard', 'view'),
  ('work_orders.view', 'Visualizar ordens de serviço', 'work_orders', 'view'),
  ('work_orders.create', 'Criar ordens de serviço', 'work_orders', 'create'),
  ('work_orders.edit', 'Editar ordens de serviço', 'work_orders', 'edit'),
  ('work_orders.delete', 'Excluir ordens de serviço', 'work_orders', 'delete'),
  ('work_orders.approve', 'Aprovar ordens de serviço', 'work_orders', 'approve'),
  ('equipment.view', 'Visualizar equipamentos', 'equipment', 'view'),
  ('equipment.create', 'Criar equipamentos', 'equipment', 'create'),
  ('equipment.edit', 'Editar equipamentos', 'equipment', 'edit'),
  ('equipment.delete', 'Excluir equipamentos', 'equipment', 'delete'),
  ('employees.view', 'Visualizar colaboradores', 'employees', 'view'),
  ('employees.create', 'Criar colaboradores', 'employees', 'create'),
  ('employees.edit', 'Editar colaboradores', 'employees', 'edit'),
  ('employees.delete', 'Excluir colaboradores', 'employees', 'delete'),
  ('maintenance.view', 'Visualizar manutenções', 'maintenance', 'view'),
  ('maintenance.create', 'Criar manutenções', 'maintenance', 'create'),
  ('maintenance.edit', 'Editar manutenções', 'maintenance', 'edit'),
  ('maintenance.delete', 'Excluir manutenções', 'maintenance', 'delete'),
  ('inventory.view', 'Visualizar estoque', 'inventory', 'view'),
  ('inventory.create', 'Criar itens de estoque', 'inventory', 'create'),
  ('inventory.edit', 'Editar itens de estoque', 'inventory', 'edit'),
  ('inventory.delete', 'Excluir itens de estoque', 'inventory', 'delete'),
  ('reports.view', 'Visualizar relatórios', 'reports', 'view'),
  ('reports.export', 'Exportar relatórios', 'reports', 'export'),
  ('admin.users', 'Gerenciar usuários', 'admin', 'users'),
  ('admin.roles', 'Gerenciar perfis', 'admin', 'roles'),
  ('admin.permissions', 'Gerenciar permissões', 'admin', 'permissions'),
  ('admin.companies', 'Gerenciar empresas', 'admin', 'companies'),
  ('admin.settings', 'Gerenciar configurações', 'admin', 'settings'),
  ('admin.audit', 'Visualizar auditoria', 'admin', 'audit')
ON CONFLICT (name) DO NOTHING;

-- Atribuir todas as permissões para admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. CRIAR FUNÇÃO DE AUDITORIA AUTOMÁTICA
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    (SELECT email FROM public.user_profiles WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em tabelas importantes
DROP TRIGGER IF EXISTS audit_work_orders ON public.work_orders;
CREATE TRIGGER audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_equipments ON public.equipments;
CREATE TRIGGER audit_equipments AFTER INSERT OR UPDATE OR DELETE ON public.equipments FOR EACH ROW EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- ============================================================
-- FIM DO BLOCO 02
-- ============================================================
-- Verifique se apareceu "Success. No rows returned" no final
-- ============================================================
