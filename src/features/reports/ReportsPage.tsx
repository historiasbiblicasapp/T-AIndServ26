import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Table2, FileJson, FileSpreadsheet } from 'lucide-react'
import ReportTable from '@/features/reports/components/ReportTable'
import { exportToPdf } from '@/features/reports/utils/pdf'
import { exportToExcel } from '@/features/reports/utils/excel'
import { exportToCsv } from '@/features/reports/utils/csv'
import { exportToJson } from '@/features/reports/utils/json'

const ROWS = [
  { id: '1', os: 'OS-001', status: 'Concluída', categoria: 'Corretiva', data: '2025-01-15', equipamento: 'Motor Trifásico', responsavel: 'João Silva' },
  { id: '2', os: 'OS-002', status: 'Em Andamento', categoria: 'Preventiva', data: '2025-01-16', equipamento: 'Compressor', responsavel: 'Maria Souza' },
  { id: '3', os: 'OS-003', status: 'Aberta', categoria: 'Preditiva', data: '2025-01-17', equipamento: 'Bomba Hidráulica', responsavel: 'Pedro Costa' },
]

const COLUMNS = [
  { key: 'os', label: 'OS' },
  { key: 'status', label: 'Status' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'data', label: 'Data' },
  { key: 'equipamento', label: 'Equipamento' },
  { key: 'responsavel', label: 'Responsável' },
]

export default function ReportsPage() {
  const [status, setStatus] = useState('all')
  const [categoria, setCategoria] = useState('all')

  const filteredRows = ROWS.filter(r => {
    if (status !== 'all' && r.status !== status) return false
    if (categoria !== 'all' && r.categoria !== categoria) return false
    return true
  })

  const exportPdf = () => exportToPdf('Relatório', COLUMNS.map(c => c.label), filteredRows, 'relatorio.pdf')
  const exportExcel = () => exportToExcel('Relatório', COLUMNS.map(c => c.label), filteredRows, 'relatorio.xlsx')
  const exportCsv = () => exportToCsv(COLUMNS.map(c => c.label), filteredRows, 'relatorio.csv')
  const exportJson = () => exportToJson(filteredRows, 'relatorio.json')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-gray-600">Gere relatórios completos com filtros e exportações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Table2 className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="all">Todos</option>
            <option value="Aberta">Aberta</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="all">Todas</option>
            <option value="Corretiva">Corretiva</option>
            <option value="Preventiva">Preventiva</option>
            <option value="Preditiva">Preditiva</option>
          </select>
        </div>
      </div>

      <ReportTable title="Resultados" columns={COLUMNS} rows={filteredRows} />
    </div>
  )
}
