import fs from 'fs'

const src = fs.readFileSync('supabase-schema.sql', 'utf8')

function splitTopLevel(s) {
  const res = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') { depth++; cur += ch }
    else if (ch === ')') { depth--; cur += ch }
    else if (ch === ',' && depth === 0) { res.push(cur); cur = '' }
    else cur += ch
  }
  if (cur.trim()) res.push(cur)
  return res
}

const re = /create\s+table\s+if\s+not\s+exists\s+public\.(\w+)\s*\(/gi
let m
const alters = []
while ((m = re.exec(src))) {
  const tableName = m[1]
  let i = m.index + m[0].length
  let depth = 1
  while (i < src.length && depth > 0) {
    const ch = src[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    i++
  }
  const block = src.slice(m.index + m[0].length, i - 1)
  const cols = splitTopLevel(block)
  for (const col of cols) {
    const trimmed = col.trim()
    if (!trimmed) continue
    const firstWord = trimmed.split(/\s+/)[0].replace(/"/g, '').toLowerCase()
    if (['primary', 'foreign', 'unique', 'check', 'constraint', 'key'].includes(firstWord)) continue
    const colName = trimmed.split(/\s+/)[0].replace(/"/g, '')
    let rest = trimmed.slice(trimmed.indexOf(' ') + 1)
    rest = rest.replace(/\bnot\s+null\b/gi, '').replace(/\bprimary\s+key\b/gi, '').trim()
    alters.push(`alter table public.${tableName} add column if not exists ${colName} ${rest};`)
  }
}

const header = `-- Migração idempotente e aditiva gerada a partir de supabase-schema.sql
-- Aplicável via Supabase SQL Editor (projeto rbkojlhvpqjfhyhonfcr).
-- Não destrói dados: cria tabelas que faltam e adiciona colunas ausentes.
-- As colunas são adicionadas sem NOT NULL/PRIMARY KEY para não falhar em tabelas populadas.

`

const out = header + src + '\n\n-- ============================================================\n' +
  '-- Bloco aditivo: garante que colunas existam em tabelas pré-existentes\n' +
  '-- ============================================================\n\n' + alters.join('\n') + '\n'

fs.writeFileSync('supabase-migration-apply.sql', out)
console.log('Generated', alters.length, 'ADD COLUMN statements -> supabase-migration-apply.sql')
