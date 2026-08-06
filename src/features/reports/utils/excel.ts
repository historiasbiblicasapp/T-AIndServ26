import * as XLSX from 'xlsx'

export function exportToExcel(
  _title: string,
  _columns: string[],
  rows: Record<string, unknown>[],
  filename = 'relatorio.xlsx'
) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório')
  XLSX.writeFile(workbook, filename)
}
