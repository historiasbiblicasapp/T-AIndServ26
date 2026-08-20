import fs from 'fs'
import https from 'https'

const projectRef = 'cnawymsaozndrfbuysar'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3] || ''
const mode = process.argv[2] || 'apply'

if (!serviceRoleKey) {
  console.error('Uso: node scripts/apply-migration.mjs [inspect|apply] <service-role-key>')
  console.error('Ou defina SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const sql = mode === 'inspect'
  ? `select table_name, count(*) as cols from information_schema.columns where table_schema='public' group by table_name order by table_name;`
  : fs.readFileSync('supabase-migration-apply.sql', 'utf8')

const body = JSON.stringify({ query: sql })

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
    try {
      const rows = JSON.parse(data)
      if (Array.isArray(rows)) {
        console.log('Linhas:', rows.length)
        for (const r of rows) console.log(JSON.stringify(r))
      } else {
        console.log('Response:', data)
      }
    } catch {
      console.log('Raw:', data)
    }
  })
})

req.on('error', (error) => { console.error('Error:', error) })
req.write(body)
req.end()
