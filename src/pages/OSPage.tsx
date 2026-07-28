import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder } from '@/services/storage'
import { Plus, Search, Share2, Edit, Trash2 } from 'lucide-react'
import PageHeader from '@/components/PageHeader'

interface WorkOrder {
  id: string
  code: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  equipment_id: string
  sector_id: string
  planned_date?: string
}

export default function OSPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'corrective',
    status: 'pending',
    priority: 'medium',
    equipment_id: '',
    sector_id: '',
    planned_date: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('gmi_user')
    if (stored) setUser(JSON.parse(stored))
    loadWorkOrders()
  }, [])

  const loadWorkOrders = async () => {
    try {
      const data = await getWorkOrders()
      setWorkOrders(data as WorkOrder[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar ordens de serviço')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateWorkOrder(editingId, formData)
        toast.success('Ordem de serviço atualizada')
      } else {
        await createWorkOrder(formData)
        toast.success('Ordem de serviço criada')
      }
      await loadWorkOrders()
      setFormData({
        code: '',
        title: '',
        description: '',
        type: 'corrective',
        status: 'pending',
        priority: 'medium',
        equipment_id: '',
        sector_id: '',
        planned_date: '',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar ordem de serviço')
    }
  }

  const handleEdit = (wo: WorkOrder) => {
    setFormData({
      code: wo.code,
      title: wo.title,
      description: wo.description || '',
      type: wo.type,
      status: wo.status,
      priority: wo.priority,
      equipment_id: wo.equipment_id,
      sector_id: wo.sector_id,
      planned_date: wo.planned_date || '',
    })
    setEditingId(wo.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return
    try {
      await deleteWorkOrder(id)
      await loadWorkOrders()
      toast.success('Ordem de serviço excluída')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const handleShare = (wo: WorkOrder) => {
    const url = `${window.location.origin}/os/${wo.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado para a área de transferência')
  }

  const filteredWorkOrders = workOrders.filter(wo =>
    wo.title.toLowerCase().includes(search.toLowerCase()) ||
    wo.code.toLowerCase().includes(search.toLowerCase())
  )

  const openWorkOrders = workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled')

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">T&A Serv Ind</CardTitle>
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
      <PageHeader title="Ordens de Serviço" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
            <p className="text-muted-foreground">{openWorkOrders.length} ordens abertas</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ code: '', title: '', description: '', type: 'corrective', status: 'pending', priority: 'medium', equipment_id: '', sector_id: '', planned_date: '' }) }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova OS
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Editar' : 'Nova'} Ordem de Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Código</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descrição</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                      <option value="corrective">Corretiva</option>
                      <option value="preventive">Preventiva</option>
                      <option value="predictive">Preditiva</option>
                      <option value="lubrication">Lubrificação</option>
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluída</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <Label>Equipamento</Label>
                    <Input value={formData.equipment_id} onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Setor</Label>
                    <Input value={formData.sector_id} onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Data Planejada</Label>
                    <Input type="date" value={formData.planned_date} onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })} />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Todas as Ordens de Serviço</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar OS..."
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
                    <th className="p-2 text-left">Título</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Prioridade</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((wo) => (
                    <tr key={wo.id} className="border-b">
                      <td className="p-2">{wo.code}</td>
                      <td className="p-2">{wo.title}</td>
                      <td className="p-2 capitalize">{wo.type}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          wo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {wo.status === 'pending' ? 'Pendente' :
                           wo.status === 'in_progress' ? 'Em Andamento' :
                           wo.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          wo.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                          wo.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          wo.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {wo.priority === 'low' ? 'Baixa' :
                           wo.priority === 'medium' ? 'Média' :
                           wo.priority === 'high' ? 'Alta' : 'Crítica'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(wo)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleShare(wo)} title="Compartilhar">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(wo.id)} title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredWorkOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Nenhuma ordem de serviço encontrada
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
