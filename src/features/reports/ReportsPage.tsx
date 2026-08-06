import { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { FileText, Table2, FileJson, FileSpreadsheet } from 'lucide-react'
import ReportFilters from '@/features/reports/components/ReportFilters'
import ReportTable from '@/features/reports/components/ReportTable'
import ReportChart from '@/features/reports/components/ReportChart'
import ReportQrCode from '@/features/reports/components/ReportQrCode'
import { exportToPdf } from '@/features/reports/utils/pdf'
import { exportToExcel } from '@/features/reports/utils/excel'
import { exportToCsv } from '@/features/reports/utils/csv'
import { exportToJson } from '@/features/reports/utils/json'

const SAMPLE_ROWS = [
  { id: '1', title: 'OS-001', status: 'Concluída', category: 'Corretiva', date: '2025-01-15', equipment: 'Motor Trifásico', assignee: 'João Silva' },
  { id: '2', title: 'OS-002', status: 'Em Andamento', category: 'Preventiva', date: '2025-01-16', equipment: 'Compressor', assignee: 'Maria Souza' },
  { id: '3', title: 'OS-003', status: 'Aberta', category: 'Preditiva', date: '2025-01-17', equipment: 'Bomba Hidráulica', assignee: 'Pedro Costa' },
]

const COLUMNS = [
  { key: 'title', label: 'OS' },
  { key: 'status', label: 'Status' },
  { key: 'category', label: 'Categoria' },
  { key: 'date', label: 'Data' },
  { key: 'equipment', label: 'Equipamento' },
  { key: 'assignee', label: 'Responsável' },
]

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    reportType: 'work-orders',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: 'all',
    category: 'all',
  })

  const filteredRows = useMemo(() => {
    let rows = SAMPLE_ROWS
    if (filters.status !== 'all') {
      const map: Record<string, string> = { open: 'Aberta', 'in-progress': 'Em Andamento', completed: 'Concluída', cancelled: 'Cancelado' }
      rows = rows.filter(r => r.status === map[filters.status])
    }
    if (filters.category !== 'all') {
      const map: Record<string, string> = { corrective: 'Corretiva', preventive: 'Preventiva', predictive: 'Preditiva' }
      rows = rows.filter(r => r.category === map[filters.category])
    }
    return rows
  }, [filters])

  const chartData = useMemo(() => {
    const map: Record<string, { name: string; value: number }[]> = {
      'work-orders': [
        { name: 'Corretiva', value: 12 },
        { name: 'Preventiva', value: 24 },
        { name: 'Preditiva', value: 6 },
      ],
      maintenance: [
        { name: 'Jan', value: 4 },
        { name: 'Fev', value: 6 },
        { name: 'Mar', value: 8 },
      ],
      equipment: [
        { name: 'Operacional', value: 85 },
        { name: 'Manutenção', value: 10 },
        { name: 'Parado', value: 5 },
      ],
      employees: [
        { name: 'Elétrica', value: 8 },
        { name: 'Mecânica', value: 12 },
        { name: 'Automação', value: 4 },
      ],
      inventory: [
        { name: 'Pecas', value: 340 },
        { name: 'Insumos', value: 120 },
        { name: 'Ferramentas', value: 45 },
      ],
    }
    return map[filters.reportType] || map['work-orders']
  }, [filters.reportType])

  const handleExportPdf = () => {
    const title = `Relatório de ${filters.reportType}`
    exportToPdf(title, COLUMNS.map(c => c.label), filteredRows, `${filters.reportType}-relatorio.pdf`)
  }

  const handleExportExcel = () => {
    const title = `Relatório de ${filters.reportType}`
    exportToExcel(title, COLUMNS.map(c => c.label), filteredRows, `${filters.reportType}-relatorio.xlsx`)
  }

  const handleExportCsv = () => {
    exportToCsv(COLUMNS.map(c => c.label), filteredRows, `${filters.reportType}-relatorio.csv`)
  }

  const handleExportJson = () => {
    exportToJson(filteredRows, `${filters.reportType}-relatorio.json`)
  }

  const qrValue = useMemo(() => {
    return JSON.stringify({ reportType: filters.reportType, generatedAt: new Date().toISOString(), rows: filteredRows.length })
  }, [filters.reportType, filteredRows.length])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-gray-600">Gere relatórios completos com filtros e exportações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Table2 className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      <ReportFilters filters={filters} onFilterChange={setFilters} onReset={() => setFilters({
        reportType: 'work-orders',
        startDate: undefined,
        endDate: undefined,
        status: 'all',
        category: 'all',
      })} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ReportTable title="Resultados" columns={COLUMNS} rows={filteredRows} />
        </div>
        <div className="space-y-6">
          <ReportChart title="Visão Geral" type="pie" data={chartData} />
          <ReportQrCode value={qrValue} title="QR Code do Relatório" />
        </div>
      </div>
    </div>
  )
}
