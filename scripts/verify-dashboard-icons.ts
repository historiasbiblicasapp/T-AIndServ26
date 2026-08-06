#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const file = join(process.cwd(), 'src/features/dashboard/DashboardPage.tsx')

if (!existsSync(file)) {
  console.error('Arquivo nao encontrado:', file)
  process.exit(1)
}

const content = readFileSync(file, 'utf8')
const lines = content.split('\n')

const usedIcons = new Set()
const importLine = lines.find(l => l.includes("from 'lucide-react'"))

if (!importLine) {
  console.error('Import de lucide-react nao encontrado')
  process.exit(1)
}

lines.forEach((line, idx) => {
  if (idx === 0 || line === importLine) return
  const matches = line.match(/\b(ClipboardList|Wrench|Users|Calendar|ArrowRight|AlertTriangle|CheckCircle2|TrendingUp|Clock)\b/g)
  if (matches) matches.forEach(m => usedIcons.add(m))
})

const importIcons = importLine.match(/\b(ClipboardList|Wrench|Users|Calendar|ArrowRight|AlertTriangle|CheckCircle2|TrendingUp|Clock)\b/g) || []

const missing = [...usedIcons].filter(i => !importIcons.includes(i))
const unused = [...new Set(importIcons)].filter(i => !usedIcons.has(i))

if (missing.length) {
  console.error('Icones usados mas nao importados:', missing.join(', '))
  process.exit(1)
}

if (unused.length) {
  console.warn('Icones importados mas nao usados:', unused.join(', '))
}

console.log('Verificacao OK: todos os icones usados estao importados.')
