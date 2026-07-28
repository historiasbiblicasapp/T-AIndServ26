# T&A - Gestão da Manutenção Industrial

## Acesso

**Admin 1**
- Email: admin@tindserv.com.br
- Senha: Admin@123

**Admin 2**
- Email: admin@admin.com.br
- Senha: info2013

## Configuração do Supabase

1. Acesse o dashboard do projeto: https://supabase.com/dashboard/project/rbkojlhvpqjfhyhonfcr
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/init.sql`
4. Clique em **Run**

Esse script cria todas as tabelas, políticas RLS, triggers e seeds necessários.

## Como rodar

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
```

Os arquivos de produção ficam na pasta `dist/`.

## Modo Dark

Clique no ícone de lua/sol no canto superior direito de qualquer página para alternar entre modo claro e escuro. A preferência é salva no localStorage.

## Estrutura

- `/login` - Login
- `/` - Dashboard
- `/os` - Ordens de Serviço
- `/equipments` - Equipamentos
- `/employees` - Colaboradores
- `/maintenance` - Manutenção
