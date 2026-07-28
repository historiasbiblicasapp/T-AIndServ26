import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getEquipments, createEquipment } from '@/services/storage'
import { getWorkOrders } from '@/services/storage'
import { Wrench, Users, Building2, Plus, Search, Share2 } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  code: string
  sector: string
  status: string
}

interface WorkOrder {
  id: string
  code: string
  title: string
  status: string
  priority: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', code: '', sector: '', status: 'operational' })

  useEffect(() => {
    const stored = localStorage.getItem('gmi_user')
    if (stored) setUser(JSON.parse(stored))
    loadEquipments()
    loadWorkOrders()
  }, [])

  const loadEquipments = async () => {
    try {
      const data = await getEquipments()
      setEquipments(data as Equipment[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar equipamentos')
    }
  }

  const loadWorkOrders = async () => {
    try {
      const data = await getWorkOrders()
      setWorkOrders(data as WorkOrder[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar ordens de serviço')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('gmi_user')
    setUser(null)
    toast.success('Logout realizado')
  }

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEquipment(formData)
      await loadEquipments()
      setFormData({ name: '', code: '', sector: '', status: 'operational' })
      setShowForm(false)
      toast.success('Equipamento cadastrado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar equipamento')
    }
  }

  const handleShareOS = async () => {
    const url = `${window.location.origin}/os`
    await navigator.clipboard.writeText(url)
    toast.success('Link das OS copiado!')
  }

  const filteredEquipments = equipments.filter(eq =>
    eq.name.toLowerCase().includes(search.toLowerCase()) ||
    eq.code.toLowerCase().includes(search.toLowerCase())
  )

  const openWorkOrders = workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled')

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">GMI</CardTitle>
            <p className="text-sm text-muted-foreground">Acesso restrito</p>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="GMI" className="h-8 w-8" />
            <h1 className="text-xl font-bold">GMI - Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.full_name} ({user.role})</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, {user.full_name}!</h2>
            <p className="text-muted-foreground">Painel de controle da manutenção industrial</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareOS}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar OS
            </Button>
            <Button onClick={() => navigate('/os')}>
              <Building2 className="mr-2 h-4 w-4" />
              Ver Ordens de Serviço
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </div>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEquipment} className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Código</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Setor</Label>
                    <Input value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="operational">Operacional</option>
                      <option value="attention">Atenção</option>
                      <option value="critical">Crítico</option>
                      <option value="failure">Falha</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="cursor-pointer transition-colors hover:border-brand" onClick={() => navigate('/maintenance')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
              <Wrench className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Programadas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-colors hover:border-brand" onClick={() => navigate('/equipments')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
              <Wrench className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipments.length}</div>
              <p className="text-xs text-muted-foreground">Total cadastrado</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-colors hover:border-brand" onClick={() => navigate('/employees')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-colors hover:border-brand" onClick={() => navigate('/os')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
              <Building2 className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openWorkOrders.length}</div>
              <p className="text-xs text-muted-foreground">Abertas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipamentos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Setor</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipments.map((eq) => (
                    <tr key={eq.id} className="border-b">
                      <td className="p-2">{eq.code}</td>
                      <td className="p-2">{eq.name}</td>
                      <td className="p-2">{eq.sector}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          eq.status === 'operational' ? 'bg-green-100 text-green-800' :
                          eq.status === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                          eq.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                          eq.status === 'failure' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {eq.status === 'operational' ? 'Operacional' :
                           eq.status === 'attention' ? 'Atenção' :
                           eq.status === 'critical' ? 'Crítico' :
                           eq.status === 'failure' ? 'Falha' : 'Arquivado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredEquipments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        Nenhum equipamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
