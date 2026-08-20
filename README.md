# T&A - Gestão da Manutenção Industrial

Sistema web + mobile para gestão de manutenção industrial. Inclui ordens de serviço, controle de equipamentos, gestão de equipes, relatórios em múltiplos formatos e assistente de IA.

## Acesso (Desenvolvimento)

**Admin 1**
- Email: admin@tindserv.com
- Senha: Admin@123

**Admin 2**
- Email: admin@admin.com.br
- Senha: info2013

> **Aviso de Segurança:** As credenciais acima são apenas para desenvolvimento. O projeto está em fase de migração para autenticação real com Supabase Auth. Nunca exponha senhas em código de produção.

## Configuração

### 1. Variáveis de Ambiente

Copie o `.env.example` para `.env` e configure:

```env
VITE_SUPABASE_URL=https://rbkojlhvpqjfhyhonfcr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia29qbGh2cHFqZmh5aG9uZmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzUwOTksImV4cCI6MjEwMDIxMTA5OX0.3GZhMJ741lXvLbn5FjVXAqijH_5eeuInlsKJSIuCAOo
```

### 2. Banco de Dados (Supabase)

Execute os scripts SQL na pasta `supabase/` no SQL Editor do Supabase Dashboard:

```bash
# Ordem sugerida:
supabase/bloco01_base.sql
supabase/bloco02_empresas_unidades.sql
supabase/bloco03_pessoas_usuarios.sql
supabase/bloco04_equipamentos.sql
supabase/bloco05_manutencao.sql
supabase/bloco06_estoque.sql
supabase/bloco07_fiscal.sql
supabase/bloco08_documentos.sql
supabase/bloco09_estoque.sql
supabase/bloco10_equipes.sql
```

Projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr

### 3. Instalar Dependências

```bash
npm install
```

## Como Rodar

```bash
npm run dev
```

Acesse: http://localhost:5173

## Build

```bash
npm run build
```

Os arquivos de produção ficam na pasta `dist/`.

## Mobile (Capacitor)

### Sincronizar

```bash
npm run build
npm run cap:sync
```

### Abrir Projeto Nativo

```bash
# Android
npm run cap:open:android

# iOS (apenas macOS)
npm run cap:open:ios
```

## PWA

O aplicativo funciona como PWA e pode ser instalado no desktop e mobile. Basta acessar a URL e usar a opção "Instalar" do navegador.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/` | Dashboard |
| `/work-orders` | Ordens de Serviço |
| `/equipment` | Equipamentos |
| `/employees` | Colaboradores |
| `/maintenance` | Manutenção |
| `/inventory` | Estoque |
| `/reports` | Relatórios |
| `/ai` | Inteligência Artificial |
| `/admin` | Administração |

## Funcionalidades

- Dashboard com KPIs, indicadores (MTBF, MTTR, OEE, Disponibilidade) e gráficos
- Ordens de Serviço (em desenvolvimento)
- Gestão de Equipamentos
- Gestão de Colaboradores
- Manutenções (preventiva, corretiva, preditiva)
- Estoque e compras
- Relatórios em PDF, Excel, CSV e JSON com filtros
- Assistente de IA para análise de histórico, falhas recorrentes e sugestões de manutenção
- Modo offline com sincronização
- Push notifications (mobile)
- Modo Dark/Light
- Responsivo (desktop + mobile)

## Stack

- React 18 + TypeScript
- Vite + Tailwind CSS
- Supabase (Backend)
- Capacitor (Mobile)
- jsPDF + SheetJS (Relatórios)
- Recharts (Gráficos)
- Radix UI + shadcn/ui (Componentes)

## Documentação

Para documentação técnica completa, consulte: [DOCUMENTATION.md](./DOCUMENTATION.md)

## Licença

Privado - T&A Serv Ind
