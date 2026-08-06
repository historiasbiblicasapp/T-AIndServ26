# Documentação Técnica — T&A Serv Ind

**Versão:** 1.0.0  
**Data:** 2026-08-06  
**Projeto:** Sistema de Gestão da Manutenção Industrial  
**Stack:** React 18 + TypeScript 5 + Vite 6 + Tailwind CSS 3 + Supabase + Capacitor

---

## 1. Visão Geral

O T&A Serv Ind é uma aplicação web + mobile para gestão de manutenção industrial. Permite controlar ordens de serviço, equipamentos, colaboradores, estoque, relatórios e inclui um assistente de IA para análise de histórico e sugestões de manutenção.

### Objetivos Principais
- Centralizar ordens de serviço e manutenções
- Controlar equipamentos e estoque de peças
- Gerenciar equipes, turnos e escalas
- Gerar relatórios em PDF, Excel, CSV e JSON
- Oferecer assistência via IA (histórico, falhas recorrentes, sugestões)
- Funcionar offline com sincronização posterior
- Disponibilizar PWA e apps nativos Android/iOS via Capacitor

---

## 2. Arquitetura

### 2.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Navegador / App Nativo               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    React Router v7                   │  │
│  │  / ── Dashboard    /work-orders ── OS               │  │
│  │  /equipment ── Equipamentos  /employees ── Equipe   │  │
│  │  /maintenance ── Manutenção /reports ── Relatórios   │  │
│  │  /ai ── Inteligência Artificial  /admin ── Admin    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┼──────────────────────────┐   │
│  │          Contextos / Estado                         │   │
│  │  AuthContext  ThemeContext  OfflineProvider  AIProvider │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Supabase                            │  │
│  │  - Autenticação  - Postgres  - Storage  - Realtime    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Mobile (Capacitor)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Android    │  │     iOS      │  │   Plugins    │      │
│  │  (Android    │  │  (Xcode /    │  │ Push / Hapt /│      │
│  │   Studio)    │  │  Mac only)   │  │ Network / KB │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Princípios Arquiteturais
- **Separação por features:** cada domínio do negócio vive em `src/features/<nome>/`
- **Componentes reutilizáveis:** UI base em `src/components/ui/` (estilo shadcn/ui)
- **Compartilhados:** `src/components/shared/` para componentes cross-feature
- **Layouts:** `src/layouts/` define estrutura de páginas (sidebar, header, bottom nav)
- **Serviços:** `src/services/` concentra acesso a dados
- **Config:** `src/config/` centraliza rotas e constantes

---

## 3. Estrutura de Pastas

```
src/
├── components/
│   ├── mobile/
│   │   └── BottomNavigation.tsx
│   ├── shared/
│   │   └── PageHeader.tsx
│   └── ui/
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       └── textarea.tsx
├── config/
│   └── routes.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── OfflineContext.tsx
│   └── OfflineProvider.tsx
├── features/
│   ├── ai/
│   │   ├── AIProvider.tsx
│   │   ├── AIPage.tsx
│   │   ├── components/
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── AIInsightCard.tsx
│   │   │   └── AISuggestionModal.tsx
│   │   ├── hooks/
│   │   │   └── useAI.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   └── prompts.ts
│   │   └── types/
│   │       └── index.ts
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── employees/
│   │   └── EmployeeListPage.tsx
│   ├── equipment/
│   │   └── EquipmentListPage.tsx
│   ├── maintenance/
│   │   └── MaintenancePage.tsx
│   ├── reports/
│   │   ├── ReportsPage.tsx
│   │   ├── components/
│   │   │   ├── ReportChart.tsx
│   │   │   ├── ReportFilters.tsx
│   │   │   ├── ReportQrCode.tsx
│   │   │   └── ReportTable.tsx
│   │   └── utils/
│   │       ├── csv.ts
│   │       ├── excel.ts
│   │       ├── json.ts
│   │       └── pdf.ts
│   └── work-orders/
│       └── (futuro)
├── layouts/
│   ├── AppLayout.tsx
│   └── (MobileLayout removido)
├── lib/
│   ├── capacitor.ts
│   └── utils.ts
├── pages/
│   └── os/
│       └── OSPage.tsx
├── services/
│   ├── supabase.ts
│   └── storage.ts
├── styles/
│   └── global.css
├── types/
│   └── capacitor.d.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 4. Stack Tecnológica

| Categoria | Tecnologia | Versão | Finalidade |
|-----------|------------|--------|------------|
| Frontend | React | 18.3.1 | Biblioteca UI |
| Linguagem | TypeScript | ~5.6.2 | Tipagem estática |
| Build | Vite | 6.0.3 | Bundler |
| Estilo | Tailwind CSS | 3.4.17 | Utilitários CSS |
| Componentes | shadcn/ui + Radix | - | Componentes acessíveis |
| Roteamento | React Router | 7.1.3 | Navegação |
| Dados | React Query | 5.62.7 | Cache e estado de servidor |
| Backend | Supabase | 2.49.1 | BaaS (DB + Auth + Storage) |
| PDF | jsPDF + jspdf-autotable | 2.5.1 / 3.8.4 | Geração de PDFs |
| Planilhas | xlsx (SheetJS) | 0.18.5 | Exportação Excel |
| QR Code | qrcode | 1.5.4 | Geração de QR Codes |
| Mobile | Capacitor | 8.x | Empacotamento nativo |
| PWA | vite-plugin-pwa | 1.3.0 | Service Worker e manifest |
| Gráficos | recharts | 2.15.0 | Gráficos no dashboard |
| Animações | framer-motion | 12.4.0 | Animações |
| Notificações | sonner | 1.7.4 | Toasts |
| IA | Simulada localmente | - | Assistente inteligente |

---

## 5. Configuração e Variáveis de Ambiente

### 5.1 Arquivo `.env` (não commitado)

```env
VITE_SUPABASE_URL=https://rbkojlhvpqjfhyhonfcr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Variáveis Obrigatórias

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave anon/public do Supabase | Sim |

### 5.3 Segurança das Variáveis
- O arquivo `.env` **nunca** deve ser commitado no Git
- Use `.env.example` para documentar variáveis necessárias
- Em produção, configure as variáveis no provedor de hosting (Vercel, Netlify, etc.)

---

## 6. Rotas e Navegação

### 6.1 Rotas da Aplicação

| Rota | Componente | Descrição | Ícone |
|------|------------|-----------|-------|
| `/` | DashboardPage | Dashboard principal | LayoutDashboard |
| `/work-orders` | OSPage | Ordens de Serviço | ClipboardList |
| `/equipment` | EquipmentListPage | Equipamentos | Wrench |
| `/employees` | EmployeeListPage | Colaboradores | Users |
| `/maintenance` | MaintenancePage | Manutenções | Calendar |
| `/inventory` | InventoryListPage | Estoque | Package |
| `/reports` | ReportsPage | Relatórios | BarChart3 |
| `/ai` | AIPage | Inteligência Artificial | Brain |
| `/admin` | AdminPage | Administração | Shield |
| `/login` | LoginPage | Login | - |

### 6.2 Navegação Mobile (Bottom Nav)
Exibida em telas `< 1024px`:
- Início, OS, Equip., Manut., IA, Relat.

### 6.3 Navegação Desktop (Sidebar)
Exibida em telas `>= 1024px`:
- Dashboard, Ordens de Serviço, Equipamentos, Colaboradores, Manutenção, Estoque, Relatórios, IA, Administração

### 6.4 Configuração Centralizada
As rotas estão definidas em `src/config/routes.ts` e usadas tanto pelo `AppLayout` quanto pelo `BottomNavigation`.

---

## 7. Autenticação e Autorização

### 7.1 Estado Atual
- **AuthContext** simula autenticação com contas hardcoded
- **NÃO** há integração com Supabase Auth no momento
- Tokens são armazenados em `localStorage`

### 7.2 Contas de Teste
| Email | Senha | Perfil |
|-------|-------|--------|
| `admin@tindserv.com` | `Admin@123` | Admin |
| `admin@admin.com.br` | `info2013` | Admin |

### 7.3 Planejado
- Implementar Supabase Auth (email/senha, OAuth)
- RLS no Supabase baseado em `auth.uid()`
- Roles e permissões via `user_profiles` + `roles`

---

## 8. Segurança

### 8.1 Credenciais e Segredos
- **ANTES:** Chaves do Supabase hardcoded em `supabase.ts`
- **DEPOIS:** Variáveis de ambiente via `import.meta.env`
- `.env` está no `.gitignore`
- `.env.example` documenta as variáveis necessárias

### 8.2 Validação
- Zod está instalado mas **não utilizado**
- Todos os formulários usam apenas `required` do HTML
- **Recomendação:** Implementar validação com Zod + React Hook Form

### 8.3 Sanitização
- Nenhum sanitizador de input implementado
- **Recomendação:** Implementar sanitização ou confiar em JSX escaping + validação server-side

### 8.4 CORS e Headers
- Configurado via Vite + Supabase
- Service Worker com cache strategy padrão do Workbox

---

## 9. Banco de Dados (Supabase)

### 9.1 Migrações SQL

Os scripts de migração estão na pasta `supabase/`:

| Bloco | Arquivo | Conteúdo |
|-------|---------|----------|
| 1 | `bloco01_base.sql` | Extensões, tipos ENUM, schema base |
| 2 | `bloco02_empresas_unidades.sql` | Companies, Units, Plants, Areas, Locations |
| 3 | `bloco03_pessoas_usuarios.sql` | Employees, User Profiles, Roles, Permissions |
| 4 | `bloco04_equipamentos.sql` | Equipment Categories, Equipments |
| 5 | `bloco05_manutencao.sql` | Work Orders, Maintenance Plans |
| 6 | `bloco06_estoque.sql` | Suppliers, Inventory Items |
| 7 | `bloco07_fiscal.sql` | Fiscal entities |
| 8 | `bloco08_documentos.sql` | Documents |
| 9 | `bloco09_estoque.sql` | Purchase Orders |
| 10 | `bloco10_equipes.sql` | Specialties, Shifts, Schedules, Availability, Productivity |
| 11 | (Dashboard) | — |
| 12 | (Relatórios) | — |

### 9.2 RLS (Row Level Security)
- As políticas RLS são criadas nos scripts SQL
- Acessadas via `auth.uid()` e roles
- **Importante:** Como a autenticação real ainda não foi implementada, as políticas precisam ser revisadas

---

## 10. Módulos da Aplicação

### 10.1 Dashboard
- **Arquivo:** `src/features/dashboard/DashboardPage.tsx`
- **Funcionalidades:**
  - 4 KPIs principais
  - 6 indicadores (Disponibilidade, MTBF, MTTR, Backlog, Preventivas Atrasadas, OEE)
  - Seção de Preventivas
  - Ações rápidas
  - Informações do sistema
- **Dados:** Placeholders `0`/`0%`/`0h` (integração pendente)

### 10.2 Ordens de Serviço
- **Arquivo:** `src/pages/os/OSPage.tsx`
- **Status:** Placeholder básico
- **Planejado:** Lista, criação, edição, filtros, status, categorias (corretiva, preventiva, preditiva)

### 10.3 Equipamentos
- **Arquivo:** `src/features/equipment/EquipmentListPage.tsx`
- **Funcionalidades:** Lista, filtros, ações (visualizar, editar, excluir)
- **Dados:** Mock local

### 10.4 Colaboradores
- **Arquivo:** `src/features/employees/EmployeeListPage.tsx`
- **Funcionalidades:** Lista, busca, ações
- **Dados:** Mock local

### 10.5 Manutenções
- **Arquivo:** `src/features/maintenance/MaintenancePage.tsx`
- **Funcionalidades:** Lista, filtros por status/categoria, ações
- **Dados:** Mock local

### 10.6 Estoque
- **Arquivo:** (não implementado ainda)
- **Planejado:** Itens, movimentações, fornecedores, ordens de compra

### 10.7 Relatórios
- **Arquivo:** `src/features/reports/ReportsPage.tsx`
- **Exportações:**
  - PDF (jsPDF + autotable)
  - Excel (SheetJS/xlsx)
  - CSV (Blob + download)
  - JSON (Blob + download)
- **Filtros:** tipo, data início/fim, status, categoria
- **Gráficos:** Recharts (pie, bar, line)
- **QR Code:** qrcode library

### 10.8 Inteligência Artificial
- **Arquivo:** `src/features/ai/AIPage.tsx`
- **Funcionalidades:**
  - Análise de histórico
  - Detecção de falhas recorrentes
  - Sugestões de manutenção
  - Resumo de OS
  - Geração automática de descrição
  - Assistente de planejamento
  - Chat conversacional
- **Segurança:** Todas as sugestões requerem confirmação explícita do usuário (modal de confirmação)
- **Dados:** Simulados localmente (sem API real)

---

## 11. Offline e Sincronização

### 11.1 OfflineProvider
- **Arquivo:** `src/contexts/OfflineProvider.tsx`
- Detecta status de rede via `@capacitor/network`
- Exibe banner vermelho quando offline
- Contexto `OfflineContext` disponível globalmente

### 11.2 Capacitor Sync
- **Arquivo:** `src/lib/capacitor.ts`
- Wrapper para plugins nativos:
  - Push Notifications
  - Network (online/offline)
  - Haptics (feedback tátil)
  - Status Bar
  - Keyboard

### 11.3 Estado Atual
- Estrutura pronta
- Fila de sincronização não implementada (apenas `pendingSync` como contador)

---

## 12. PWA (Progressive Web App)

### 12.1 Configuração
- **Plugin:** `vite-plugin-pwa`
- **Manifest:** `public/manifest.json`
- **Service Worker:** Gerado automaticamente pelo Workbox

### 12.2 Meta Tags
```html
<meta name="theme-color" content="#2563EB" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

### 12.3 Ícones
- `logo.png` (192x192 e 512x512)
- Ícone Apple touch: `/logo.png`

### 12.4 Limitações Atuais
- Service Worker não existia como arquivo customizado (usava o gerado pelo plugin)
- Estratégia de cache padrão do Workbox

---

## 13. Mobile (Capacitor)

### 13.1 Configuração
- **Arquivo:** `capacitor.config.json`
- **App ID:** `com.ta.servind`
- **Web Dir:** `dist`
- **Plugins configurados:**
  - Push Notifications
  - Haptics
  - Keyboard
  - Network
  - Status Bar
  - App

### 13.2 Plataformas
```
android/  # Android Studio
ios/      # Xcode (macOS only)
```

### 13.3 Scripts Disponíveis
```bash
npm run cap:sync         # Sincronizar web assets
npm run cap:open:android # Abrir Android Studio
npm run cap:open:ios     # Abrir Xcode
```

### 13.4 Build para Produção
```bash
npm run build
npm run cap:sync
npx cap open android
# No Android Studio: Build > Generate Signed APK / App Bundle
```

---

## 14. Deploy

### 14.1 Web (Vercel / Netlify)
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Build command: `npm run build`
4. Publish directory: `dist`

### 14.2 Android
1. `npm run build && npm run cap:sync`
2. `npx cap open android`
3. Gerar APK/AAB assinado
4. Publicar na Google Play Store

### 14.3 iOS
1. `npm run build && npm run cap:sync`
2. `npx cap open ios`
3. Configurar signing, provisioning profile
4. Publicar na App Store

---

## 15. Performance

### 15.1 Bundle
- **CSS:** ~27 KB (gzip: ~5.6 KB)
- **JS principal:** ~2 MB (gzip: ~616 KB)
- **Service Worker:** ~22 KB
- **Total precache:** ~2.3 MB

### 15.2 Otimizações Aplicadas
- Tree shaking (ícones Lucide importados individualmente)
- Code splitting por rotas (planejado)
- PWA com cache via Workbox

### 15.3 Recomendações
- Implementar `React.lazy()` + `Suspense` nas rotas
- Configurar `manualChunks` no Vite para separar vendor bundles
- Usar `react-query` para cache e deduplicação de requisições

---

## 16. Acessibilidade

### 16.1 Implementado
- Componentes Radix UI (acessibilidade nativa)
- Navegação por teclado em dialogs, selects, tabs
- ARIA labels em botões de ícone

### 16.3 Recomendações
- Adicionar `aria-label` em todos os botões de ícone sem texto
- Implementar skip links
- Garantir contraste de cores (WCAG AA)
- Testar com leitores de tela

---

## 17. Testes

### 17.1 Situação Atual
- Nenhum teste automatizado implementado
- `tsconfig.test.json` existe mas sem arquivos de teste

### 17.2 Recomendações
- **Unitários:** Vitest + React Testing Library
- **Integração:** Testing Library + MSW para mock de API
- **E2E:** Playwright ou Cypress
- **Cobertura mínima:** 70%

---

## 18. Troubleshooting

### 18.1 Erro: `Cannot find module '@/...'`
- Verifique se o alias `@` está configurado no `tsconfig.json` e `vite.config.ts`
- Reinicie o servidor de desenvolvimento

### 18.2 Erro: `Failed to run sql query`
- Scripts SQL devem ser executados no SQL Editor do Supabase Dashboard
- Não execute arquivos `.sql` via `npm run` ou ferramentas CLI diretamente

### 18.3 Erro: `Capacitor platform not found`
- Execute `npm install @capacitor/android @capacitor/ios`
- Execute `npx cap add android` e `npx cap add ios`

### 18.4 Erro: `Service Worker registration failed`
- Verifique se o `dist/` foi gerado com `npm run build`
- Verifique se o `vite-plugin-pwa` está configurado no `vite.config.ts`

---

## 19. Glossário

| Termo | Significado |
|-------|-------------|
| OS | Ordem de Serviço |
| RLS | Row Level Security (Supabase) |
| PWA | Progressive Web App |
| MTBF | Mean Time Between Failures |
| MTTR | Mean Time To Repair |
| OEE | Overall Equipment Effectiveness |
| CRUD | Create, Read, Update, Delete |
| Roteiro | Script SQL de migração |
| Capacitor | Framework para apps híbridos/nativos |
| Workbox | Biblioteca de service workers usada pelo PWA |

---

## 20. Contatos e Suporte

- **Repositório:** [github.com/...]
- **Documentação Supabase:** https://supabase.com/docs
- **Documentação Capacitor:** https://capacitorjs.com/docs
- **Documentação React Router:** https://reactrouter.com/

---

*Documento gerado automaticamente em 2026-08-06.*
