import https from 'https'

const projectRef = 'rbkojlhvpqjfhyhonfcr'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia29qbGh2cHFqZmh5aG9uZmNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYzNTA5OSwiZXhwIjoyMTAwMjExMDk5fQ.OELOxjvFCIjUTGyESJK7lIxN_ZOG1cNzts40D8NCTHE'

const sql = `
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Admins can delete" on storage.objects;
drop table if exists public.audit_logs;
drop table if exists public.notifications;
drop table if exists public.documents;
drop table if exists public.lubrications;
drop table if exists public.preventive_maintenances;
drop table if exists public.work_orders;
drop table if exists public.checklists;
drop table if exists public.contracts;
drop table if exists public.parts;
drop table if exists public.equipments;
drop table if exists public.employees;
drop table if exists public.sectors;
drop table if exists public.suppliers;
drop table if exists public.profiles;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at_column();
`

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  },
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', data)
  })
})

req.on('error', (error) => {
  console.error('Error:', error)
})

req.write(JSON.stringify({ query: sql }))
req.end()
