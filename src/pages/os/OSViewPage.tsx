import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'
import { getWorkOrderById, getRecursos, getEscopoItems, getWorkOrderExecutantes, getAssinaturas } from '@/services/storage'
import { useEffect, useState } from 'react'

interface OS {
  id: string
  numero: string
  titulo: string
  equipamento: string
  categoria: string
  status: string
  responsavel: string
  dataAbertura: string
  observacoes?: string
  cliente: string
  cnpj: string
  empresa: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  numeroEndereco: string
  telefone: string
}

interface Recurso {
  id: string
  name: string
  unit: string
  quantity: number
  unit_value: number
  total: number
}

interface EscopoItem {
  id: string
  service: string
  people: number
  hours: string
}

interface Executante {
  id: string
  employee_id: string
  type: string
  qualification: string
  employee?: { full_name: string }
}

interface Assinatura {
  id: string
  tipo: string
  nome: string
  cpf: string
}

export default function OSViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<OS | null>(null)
  const [loading, setLoading] = useState(true)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [escopo, setEscopo] = useState<EscopoItem[]>([])
  const [executantes, setExecutantes] = useState<Executante[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    executantes: true,
    escopo: true,
    recursos: true,
    anexos: true,
    assinaturas: true,
    checklist: true,
    historico: true,
    execucoes: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const item = await getWorkOrderById(id)
        if (!item) {
          setData(null)
          return
        }
        const mapped: OS = {
          id: item.id,
          numero: item.number || `OS-${String(item.id).slice(-3)}`,
          titulo: item.title || '',
          equipamento: item.equipment_id || '',
          categoria: item.type === 'preventive' ? 'Preventiva' : item.type === 'predictive' ? 'Preditiva' : 'Corretiva',
          status: item.status || 'Aberta',
          responsavel: item.assigned_to || '',
          dataAbertura: item.planned_date || '',
          observacoes: item.description || '',
          cliente: item.cliente || '',
          cnpj: item.cnpj || '',
          empresa: item.empresa || '',
          endereco: item.endereco || '',
          cidade: item.cidade || '',
          estado: item.estado || '',
          cep: item.cep || '',
          numeroEndereco: item.numero_endereco || '',
          telefone: item.telefone || '',
        }
        setData(mapped)

        const [recursosData, escopoData, executantesData, assinaturasData] = await Promise.all([
          getRecursos(id),
          getEscopoItems(id),
          getWorkOrderExecutantes(id),
          getAssinaturas(id),
        ])

        setRecursos(recursosData as Recurso[])
        setEscopo(escopoData as EscopoItem[])
        setExecutantes(executantesData as any[])
        setAssinaturas(assinaturasData as any[])
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Ordem de serviço não encontrada.</p>
        <Button className="mt-4" onClick={() => navigate('/work-orders')}>Voltar</Button>
      </div>
    )
  }

  const recursosTotal = recursos.reduce((acc, item) => acc + item.total, 0)

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&A</div>
          <div>
            <p className="font-semibold">Ordem de Serviço</p>
            <p className="text-xs text-gray-500">{data.numero} • {data.dataAbertura}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl overflow-y-auto p-4 print:mx-0">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">Ordem de Serviço</h1>
            <p className="text-sm text-gray-500">{data.numero} • {data.dataAbertura}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Status: {data.status}</p>
            <p>Categoria: {data.categoria}</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Cliente</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="text-sm font-medium">{data.cliente}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CNPJ</p>
              <p className="text-sm font-medium">{data.cnpj}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Empresa</p>
              <p className="text-sm font-medium">{data.empresa}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Endereço</p>
              <p className="text-sm font-medium">{data.endereco} {data.numeroEndereco ? `, ${data.numeroEndereco}` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cidade/Estado</p>
              <p className="text-sm font-medium">{data.cidade} / {data.estado}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CEP</p>
              <p className="text-sm font-medium">{data.cep}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefone</p>
              <p className="text-sm font-medium">{data.telefone}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('executantes')}>
            <h2 className="mb-3 font-semibold">Serviços diversos</h2>
            {openSections.executantes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {openSections.executantes && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-medium">Dados do Serviço</p>
                <ul className="space-y-1 text-sm">
                  {executantes.length > 0 ? executantes.map((item, _idx) => (
                    <li key={item.id} className="border-b py-1 last:border-0">
                      {item.type || '—'}
                    </li>
                  )) : <li className="text-gray-500">—</li>}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Executantes</p>
                <ul className="space-y-1 text-sm">
                  {executantes.length > 0 ? executantes.map((item, _idx) => (
                    <li key={item.id} className="border-b py-1 last:border-0">
                      {item.employee?.full_name || item.employee_id || '—'}
                    </li>
                  )) : <li className="text-gray-500">—</li>}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Qualificação</p>
                <ul className="space-y-1 text-sm">
                  {executantes.length > 0 ? executantes.map((item, _idx) => (
                    <li key={item.id} className="border-b py-1 last:border-0">
                      {item.qualification || '—'}
                    </li>
                  )) : <li className="text-gray-500">—</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('escopo')}>
            <h2 className="mb-3 font-semibold">Escopo do Serviço</h2>
            {openSections.escopo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {openSections.escopo && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="py-2">Nº</th>
                    <th className="py-2">Escopo do Serviço</th>
                    <th className="py-2 text-center">Pessoas</th>
                    <th className="py-2 text-center">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {escopo.length > 0 ? (
                    escopo.map((item, _idx) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2">{_idx + 1}º</td>
                        <td className="py-2">{item.service}</td>
                        <td className="py-2 text-center">{item.people}</td>
                        <td className="py-2 text-center">{item.hours}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Nenhum item de escopo cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('recursos')}>
            <h2 className="mb-3 font-semibold">Recursos</h2>
            {openSections.recursos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {openSections.recursos && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="py-2">Recurso</th>
                      <th className="py-2">UNI.</th>
                      <th className="py-2 text-center">QUANT.</th>
                      <th className="py-2 text-right">VALOR (U)</th>
                      <th className="py-2 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                     {recursos.length > 0 ? (
                       recursos.map((item, _idx) => (
                         <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.unit}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">R$ {Number(item.unit_value).toFixed(2)}</td>
                          <td className="py-2 text-right">R$ {Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          Nenhum recurso cadastrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between border-b py-1">
                  <span>Recursos</span>
                  <span>R$ {recursosTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span>Mão de Obra</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span>Deslocamento</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between border-b py-1 font-semibold">
                  <span>Sub Total</span>
                  <span>R$ {recursosTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span>Imposto</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span>Desconto</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between py-1 text-base font-bold">
                  <span>Valor Total</span>
                  <span>R$ {recursosTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Emitente</p>
            <p className="text-sm text-gray-500">{assinaturas.find(a => a.tipo === 'executante')?.nome || '_________________________'}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Cliente</p>
            <p className="text-sm text-gray-500">{assinaturas.find(a => a.tipo === 'cliente')?.nome || '_________________________'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
