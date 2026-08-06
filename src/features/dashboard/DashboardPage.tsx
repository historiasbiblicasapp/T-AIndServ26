import { useAuth } from '@/contexts/AuthContext'
import { Wrench, ClipboardList, Users, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = [
    { label: 'Ordens Abertas', value: '0', icon: ClipboardList, color: 'bg-blue-100 text-blue-600', link: '/work-orders' },
    { label: 'Equipamentos', value: '0', icon: Wrench, color: 'bg-green-100 text-green-600', link: '/equipment' },
    { label: 'Colaboradores', value: '0', icon: Users, color: 'bg-purple-100 text-purple-600', link: '/employees' },
    { label: 'Manutenções', value: '0', icon: Calendar, color: 'bg-orange-100 text-orange-600', link: '/maintenance' },
  ]

  const quickActions = [
    { label: 'Nova Ordem de Serviço', icon: ClipboardList, link: '/work-orders' },
    { label: 'Ver Equipamentos', icon: Wrench, link: '/equipment' },
    { label: 'Agenda', icon: Calendar, link: '/maintenance' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Bem-vindo, {user?.full_name}! Aqui está o resumo do sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
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
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.link)}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-brand hover:bg-brand/5"
                >
                  <action.icon className="h-5 w-5 text-brand" />
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
            <div className="space-y-3 text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
