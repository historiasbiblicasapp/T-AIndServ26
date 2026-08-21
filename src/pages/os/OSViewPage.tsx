import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'
import { getWorkOrderWithCalculations, getLaborRoles } from '@/services/storage'
import { categoriaFromType } from '@/lib/os'
import { useEffect, useState } from 'react'

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

interface LaborItem {
  id: string
  role?: { name: string; code: string; hourly_rate: number }
  employee?: { full_name: string }
  hours: number
  quantity?: number
  escopo_item?: number
  total: number
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
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [escopo, setEscopo] = useState<EscopoItem[]>([])
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  const [laborRoles, setLaborRoles] = useState<any[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    executantes: true,
    escopo: true,
    recursos: true,
    labor: true,
    anexos: true,
    assinaturas: true,
    checklist: true,
    historico: true,
    execucoes: true,
    values: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const [result, roles] = await Promise.all([
          getWorkOrderWithCalculations(id),
          getLaborRoles(),
        ])
        if (!result) {
          setData(null)
          return
        }
        setData(result)
        setRecursos(result.recursos || [])
        setEscopo(result.escopo || [])
        setLaborItems(result.labor || [])
        setLaborRoles(roles)
        setAssinaturas([])
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

  const recursosTotal = recursos.reduce((acc, item) => acc + Number(item.total || 0), 0)
  const laborTotal = laborItems.reduce((acc, item) => acc + Number(item.total || 0), 0)
  const displacement = Number(data?.displacement_value || 0)
  const subtotal = recursosTotal + laborTotal + displacement
  const taxRate = Number(data?.tax_rate || 0)
  const tax = subtotal * (taxRate / 100)
  const discount = Number(data?.discount || 0)
  const total = subtotal + tax - discount
  const categoriaLabel = categoriaFromType(data?.type)
  const numero = data?.number || data?.numero || '—'

  return (
    <div className="min-h-screen bg-white print:min-h-0 print:p-0">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&A</div>
          <div>
            <p className="font-semibold">Ordem de Serviço</p>
            <p className="text-xs text-gray-500">{numero} • {data.dataAbertura}</p>
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

      <div className="mx-auto max-w-5xl p-4 print:mx-0 print:max-w-none print:p-0">
        <table className="w-full os-print-table">
          <thead>
            <tr>
              <td>
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                  <div>
                    <h1 className="text-2xl font-bold">T&A Industrial Service</h1>
                    <p className="text-sm text-gray-500">Ordem de Serviço – {numero} • {data.dataAbertura}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Status: {data.status}</p>
                    <p>Categoria: {categoriaLabel}</p>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>

        <div className="mb-6 rounded-lg border p-4 print-break-avoid">
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

        <div className="mb-6 rounded-lg border p-4 print-break-avoid">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('labor')}>
            <h2 className="mb-3 font-semibold">Mão de Obra</h2>
            {openSections.labor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {openSections.labor && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="py-2 text-left">Item</th>
                    <th className="py-2">Cargo</th>
                    <th className="py-2 text-center">Qtd.</th>
                    <th className="py-2 text-center">Horas</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laborItems.length > 0 ? (
                    laborItems.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2 text-left">{item.escopo_item ?? '—'}</td>
                        <td className="py-2">{laborRoles.find(r => r.id === item.role_id)?.name || '—'}</td>
                        <td className="py-2 text-center">{item.quantity ?? '—'}</td>
                        <td className="py-2 text-center">{item.hours}h</td>
                        <td className="py-2 text-right">R$ {Number(item.total).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        Nenhuma mão de obra cadastrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border p-4 print-break-avoid">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('values')}>
            <h2 className="mb-3 font-semibold">Valores</h2>
            {openSections.values ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          {openSections.values && (
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between border-b py-1">
                <span>Recursos</span>
                <span>R$ {recursosTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Mão de Obra</span>
                <span>R$ {laborTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Deslocamento</span>
                <span>R$ {displacement.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1 font-semibold">
                <span>Sub Total</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Imposto</span>
                <span>R$ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Desconto</span>
                <span>R$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-base font-bold">
                <span>Valor Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border p-4 print-break-avoid">
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

        <div className="mb-6 rounded-lg border p-4 print-break-avoid">
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
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 print-break-avoid">
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Emitente</p>
            <p className="text-sm text-gray-500">{assinaturas.find(a => a.tipo === 'executante')?.nome || '_________________________'}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Cliente</p>
            <p className="text-sm text-gray-500">{assinaturas.find(a => a.tipo === 'cliente')?.nome || '_________________________'}</p>
          </div>
        </div>
          </td>
        </tr>
        </tbody>
      </table>
      </div>
    </div>
  )
}
