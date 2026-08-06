import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToPdf(
  title: string,
  columns: string[],
  rows: Record<string, unknown>[],
  filename = 'relatorio.pdf'
) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 24)

  const tableBody = rows.map(row => columns.map(col => String(row[col] ?? '')))

  autoTable(doc, {
    head: [columns],
    body: tableBody,
    startY: 32,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  })

  doc.save(filename)
}
