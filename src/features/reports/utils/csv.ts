export function exportToCsv(
  columns: string[],
  rows: Record<string, unknown>[],
  filename = 'relatorio.csv'
) {
  const header = columns.join(';')
  const body = rows
    .map(row => columns.map(col => String(row[col] ?? '')).join(';'))
    .join('\n')
  const csv = `${header}\n${body}`
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
