import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, ClipboardList, Users, Calendar, ArrowRight, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const kpis = [
    { label: 'Ordens Abertas', value: '0', icon: ClipboardList, color: 'bg-blue-100 text-blue-600', link: '/work-orders' },
    { label: 'Equipamentos', value: '0', icon: Wrench, color: 'bg-green-100 text-green-600', link: '/equipment' },
    { label: 'Colaboradores', value: '0', icon: Users, color: 'bg-purple-100 text-purple-600', link: '/employees' },
    { label: 'Manutenções', value: '0', icon: Calendar, color: 'bg-orange-100 text-orange-600', link: '/maintenance' },
  ]

  const indicators = [
    { label: 'Disponibilidade', value: '0%', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'MTBF', value: '0h', icon: Clock, color: 'bg-blue-100 text-blue-700' },
    { label: 'MTTR', value: '0h', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Backlog', value: '0', icon: ClipboardList, color: 'bg-red-100 text-red-700' },
    { label: 'Preventivas Atrasadas', value: '0', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    { label: 'OEE', value: '0%', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700' },
  ]

  const quickActions = [
    { label: 'Nova Ordem de Serviço', icon: ClipboardList, link: '/work-orders' },
    { label: 'Ver Equipamentos', icon: Wrench, link: '/equipment' },
    { label: 'Agenda', icon: Calendar, link: '/maintenance' },
  ]

  const preventionAlerts = [
    { label: 'Programadas', value: 0, color: 'bg-green-100 text-green-800' },
    { label: 'Próximas', value: 0, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Vencendo', value: 0, color: 'bg-orange-100 text-orange-800' },
    { label: 'Vencidas', value: 0, color: 'bg-red-100 text-red-800' },
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
