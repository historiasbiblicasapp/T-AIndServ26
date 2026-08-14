import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Home } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'

interface OS {
  id: string
  numero: string
  titulo: string
  equipamento: string
  categoria: string
  status: string
  responsavel: string
  dataAbertura: string
  dataConclusao?: string
  observacoes?: string
  cliente: string
  cnpj: string
  empresa: string
  cidade: string
  estado: string
  cep: string
  numeroEndereco: string
  telefone: string
  servicos: { tipo: string; executante: string; qualificacao: string }[]
  escopo: { n: number; servico: string; pessoas: number; horas: string }[]
  recursos: { nome: string; unidade: string; quantidade: number; valorUnitario: number; total: number }[]
  maoObra: number
  deslocamento: number
  imposto: number
  desconto: number
  valorTotal: number
  executante: string
  dataExecucao: string
  assinaturaEmitente?: string
  assinaturaCliente?: string
}

const MOCK: Record<string, OS> = {
  '1': {
    id: '1',
    numero: 'OS-001',
    titulo: 'Manutenção corretiva',
    equipamento: 'Motor Trifásico',
    categoria: 'Corretiva',
    status: 'Em Andamento',
    responsavel: 'João Silva',
    dataAbertura: '2025-01-15',
    cliente: 'Cliente Teste',
    cnpj: '00.000.000/0000-00',
    empresa: 'T&A Serv Ind',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '00000-000',
    numeroEndereco: '100',
    telefone: '(00) 0000-0000',
    servicos: [
      { tipo: 'Elétrica', executante: 'Profissional de Serviços Gerais', qualificacao: 'Serviços Gerais' },
      { tipo: 'Mecânica', executante: 'Profissional de Manutenção Elétrica', qualificacao: 'Elétrica' },
      { tipo: 'Instrumentação', executante: '', qualificacao: '' },
      { tipo: 'Automação', executante: '', qualificacao: '' },
      { tipo: 'Serviços Gerais', executante: '', qualificacao: '' },
      { tipo: 'Civil', executante: '', qualificacao: '' },
      { tipo: 'Outros: _________________', executante: '', qualificacao: '' },
    ],
    escopo: [
      { n: 1, servico: 'Realização de limpeza do local', pessoas: 1, horas: '3h' },
      { n: 2, servico: 'Verificação de equipamentos', pessoas: 1, horas: '2h' },
      { n: 3, servico: 'Reparo no equipamento X', pessoas: 1, horas: '1h' },
      { n: 4, servico: 'Reparo no equipamento Y', pessoas: 1, horas: '1h' },
      { n: 5, servico: 'Reparo no equipamento Z', pessoas: 1, horas: '0,5h' },
    ],
    recursos: [
      { nome: 'Insumos', unidade: 'Un.', quantidade: 1, valorUnitario: 100, total: 100 },
      { nome: 'Produto X', unidade: 'Un.', quantidade: 1, valorUnitario: 75, total: 75 },
    ],
    maoObra: 247.5,
    deslocamento: 205.5,
    imposto: 100.48,
    desconto: 0,
    valorTotal: 728.48,
    executante: 'Profissional de Serviços Gerais',
    dataExecucao: '28/07/2026',
  },
}

export default function OSViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const data = id ? MOCK[id] : null

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Ordem de serviço não encontrada.</p>
        <Button className="mt-4" onClick={() => navigate('/work-orders')}>Voltar</Button>
      </div>
    )
  }

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

      <div className="mx-auto max-w-5xl p-4 print:mx-0">
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
              <p className="text-xs text-gray-500">Cidade/Estado</p>
              <p className="text-sm font-medium">{data.cidade} / {data.estado}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CEP</p>
              <p className="text-sm font-medium">{data.cep}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Número</p>
              <p className="text-sm font-medium">{data.numeroEndereco}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefone</p>
              <p className="text-sm font-medium">{data.telefone}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Serviços diversos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium">Dados do Serviço</p>
              <ul className="space-y-1 text-sm">
                {data.servicos.map((item, idx) => (
                  <li key={idx} className="border-b py-1 last:border-0">
                    {item.tipo}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Executantes</p>
              <ul className="space-y-1 text-sm">
                {data.servicos.map((item, idx) => (
                  <li key={idx} className="border-b py-1 last:border-0">
                    {item.executante || '—'}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Qualificação</p>
              <ul className="space-y-1 text-sm">
                {data.servicos.map((item, idx) => (
                  <li key={idx} className="border-b py-1 last:border-0">
                    {item.qualificacao || '—'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Escopo do Serviço</h2>
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
                {data.escopo.map(item => (
                  <tr key={item.n} className="border-b last:border-0">
                    <td className="py-2">{item.n}º</td>
                    <td className="py-2">{item.servico}</td>
                    <td className="py-2 text-center">{item.pessoas}</td>
                    <td className="py-2 text-center">{item.horas}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 7 - data.escopo.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="border-b last:border-0">
                    <td className="py-2">{data.escopo.length + idx + 1}º</td>
                    <td className="py-2 text-gray-400">—</td>
                    <td className="py-2 text-center">—</td>
                    <td className="py-2 text-center">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Execução</h2>
          <p className="text-sm">Já realizado ({data.dataExecucao})</p>
        </div>

        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Recursos</h2>
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
                {data.recursos.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2">{item.nome}</td>
                    <td className="py-2">{item.unidade}</td>
                    <td className="py-2 text-center">{item.quantidade}</td>
                    <td className="py-2 text-right">R$ {item.valorUnitario.toFixed(2)}</td>
                    <td className="py-2 text-right">R$ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between border-b py-1">
              <span>Recursos</span>
              <span>R$ {data.recursos.reduce((acc, item) => acc + item.total, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span>Mão de Obra</span>
              <span>R$ {data.maoObra.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span>Deslocamento</span>
              <span>R$ {data.deslocamento.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b py-1 font-semibold">
              <span>Sub Total</span>
              <span>R$ {(data.recursos.reduce((acc, item) => acc + item.total, 0) + data.maoObra + data.deslocamento).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span>Imposto</span>
              <span>R$ {data.imposto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b py-1">
              <span>Desconto</span>
              <span>R$ {data.desconto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-base font-bold">
              <span>Valor Total</span>
              <span>R$ {data.valorTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Emitente</p>
            <p className="text-sm text-gray-500">{data.assinaturaEmitente || '_________________________'}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-8 text-sm font-medium">Assinatura Cliente</p>
            <p className="text-sm text-gray-500">{data.assinaturaCliente || '_________________________'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
