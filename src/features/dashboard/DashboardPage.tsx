import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, ClipboardList, Users, Calendar, ArrowRight, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getWorkOrders, getEquipments, getEmployees, getMaintenances, getClients } from '@/services/storage'

interface DashboardStats {
  ordensAbertas: number
  equipamentos: number
  colaboradores: number
  manutencoes: number
  totalOs: number
  concluidas: number
  emAndamento: number
  clientes: number
  backlog: number
  preventivasAtrasadas: number
  programadas: number
  vencendo: number
  proximas: number
  vencidas: number
}

const EMPTY: DashboardStats = {
  ordensAbertas: 0,
  equipamentos: 0,
  colaboradores: 0,
  manutencoes: 0,
  totalOs: 0,
  concluidas: 0,
  emAndamento: 0,
  clientes: 0,
  backlog: 0,
  preventivasAtrasadas: 0,
  programadas: 0,
  vencendo: 0,
  proximas: 0,
  vencidas: 0,
}

function parseDate(value?: string): Date | null {
  if (!value) return null
  const d = new Date(value.split('T')[0])
  return isNaN(d.getTime()) ? null : d
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(EMPTY)

  useEffect(() => {
    const load = async () => {
      try {
        const [workOrders, equipments, employees, maintenances, clients] = await Promise.all([
          getWorkOrders(),
          getEquipments(),
          getEmployees(),
          getMaintenances(),
          getClients(),
        ])

        const isConcluded = (s?: string) =>
          s === 'Concluída' || s === 'concluida' || s === 'Concluded'
        const isCancelled = (s?: string) =>
          s === 'Cancelada' || s === 'cancelada' || s === 'Cancelled'
        const open = workOrders.filter((o: any) => !isConcluded(o.status) && !isCancelled(o.status))

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const addDays = (n: number) => new Date(today.getTime() + n * 86400000)
        const inRange = (d: Date | null, min: number, max: number) =>
          d != null && d >= addDays(min) && d <= addDays(max)

        const vencidas = maintenances.filter(
          (m: any) => {
            const d = parseDate(m.scheduled_date)
            return d != null && d < today && m.status !== 'completed' && m.status !== 'done' && m.status !== 'concluida'
          },
        )
        const vencendo = maintenances.filter((m: any) => inRange(parseDate(m.scheduled_date), 0, 7))
        const proximas = maintenances.filter((m: any) => inRange(parseDate(m.scheduled_date), 8, 30))
        const programadas = maintenances.filter((m: any) => m.status === 'scheduled' || m.status === 'agendada')

        setStats({
          ordensAbertas: open.length,
          equipamentos: equipments.length,
          colaboradores: employees.length,
          manutencoes: maintenances.length,
          totalOs: workOrders.length,
          concluidas: workOrders.filter((o: any) => isConcluded(o.status)).length,
          emAndamento: workOrders.filter(
            (o: any) => o.status === 'Em Andamento' || o.status === 'em_andamento' || o.status === 'em execucao',
          ).length,
          clientes: clients.length,
          backlog: open.length,
          preventivasAtrasadas: vencidas.length,
          programadas: programadas.length,
          vencendo: vencendo.length,
          proximas: proximas.length,
          vencidas: vencidas.length,
        })
      } catch {
        // keep zeros on error
      }
    }
    load()
  }, [])

  const kpis = [
    { label: 'Ordens Abertas', value: String(stats.ordensAbertas), icon: ClipboardList, color: 'bg-brand/10 text-brand', link: '/work-orders' },
    { label: 'Equipamentos', value: String(stats.equipamentos), icon: Wrench, color: 'bg-blue-50 text-brand', link: '/equipment' },
    { label: 'Colaboradores', value: String(stats.colaboradores), icon: Users, color: 'bg-indigo-50 text-indigo-600', link: '/employees' },
    { label: 'Manutenções', value: String(stats.manutencoes), icon: Calendar, color: 'bg-orange-50 text-orange-600', link: '/maintenance' },
  ]

  const indicators = [
    { label: 'Total de OS', value: String(stats.totalOs), icon: ClipboardList, color: 'bg-brand/10 text-brand' },
    { label: 'OS Concluídas', value: String(stats.concluidas), icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
    { label: 'OS em Andamento', value: String(stats.emAndamento), icon: Clock, color: 'bg-brand/10 text-brand' },
    { label: 'Clientes', value: String(stats.clientes), icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Backlog', value: String(stats.backlog), icon: ClipboardList, color: 'bg-red-50 text-red-700' },
    { label: 'Preventivas Atrasadas', value: String(stats.preventivasAtrasadas), icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
  ]

  const quickActions = [
    { label: 'Nova Ordem de Serviço', icon: ClipboardList, link: '/work-orders' },
    { label: 'Ver Equipamentos', icon: Wrench, link: '/equipment' },
    { label: 'Agenda', icon: Calendar, link: '/maintenance' },
  ]

  const preventionAlerts = [
    { label: 'Programadas', value: stats.programadas, color: 'text-brand' },
    { label: 'Próximas', value: stats.proximas, color: 'text-yellow-700' },
    { label: 'Vencendo', value: stats.vencendo, color: 'text-orange-700' },
    { label: 'Vencidas', value: stats.vencidas, color: 'text-red-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Bem-vindo, {user?.full_name}! Aqui está o resumo do sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(stat => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.link)}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-brand hover:shadow-md"
          >
            <div className={`rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {indicators.map(indicator => (
                  <div key={indicator.label} className="rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${indicator.color}`}>
                        <indicator.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{indicator.label}</p>
                        <p className="text-lg font-bold">{indicator.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preventivas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {preventionAlerts.map(alert => (
                  <div key={alert.label} className="rounded-lg border p-4 text-center">
                    <p className="text-xs text-gray-500">{alert.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${alert.color}`}>{alert.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map(action => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(action.link)}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Versão</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ambiente</span>
                <span className="font-medium">Produção</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Usuário</span>
                <span className="font-medium">{user?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Perfil</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clientes</span>
                <span className="font-medium">{stats.clientes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
