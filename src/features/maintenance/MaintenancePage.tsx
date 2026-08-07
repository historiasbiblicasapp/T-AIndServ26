import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getEquipments, getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance } from '@/services/storage'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  code: string
  sector: string
  status: string
}

interface Maintenance {
  id: string
  equipment_id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  scheduled_date?: string
  completed_date?: string
}

export default function MaintenancePage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    equipment_id: '',
    title: '',
    description: '',
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    scheduled_date: '',
    completed_date: '',
  })

  useEffect(() => {
    loadEquipments()
    loadMaintenances()
  }, [])

  const loadEquipments = async () => {
    try {
      const data = await getEquipments()
      setEquipments(data as Equipment[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar equipamentos')
    }
  }

  const loadMaintenances = async () => {
    try {
      const data = await getMaintenances()
      setMaintenances(data as Maintenance[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar manutenções')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateMaintenance(editingId, formData)
        toast.success('Manutenção atualizada')
      } else {
        await createMaintenance(formData)
        toast.success('Manutenção criada')
      }
      await loadMaintenances()
      setFormData({
        equipment_id: '',
        title: '',
        description: '',
        type: 'preventive',
        status: 'scheduled',
        priority: 'medium',
        scheduled_date: '',
        completed_date: '',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar manutenção')
    }
  }

  const handleEdit = (maintenance: Maintenance) => {
    setFormData({
      equipment_id: maintenance.equipment_id,
      title: maintenance.title,
      description: maintenance.description || '',
      type: maintenance.type,
      status: maintenance.status,
      priority: maintenance.priority,
      scheduled_date: maintenance.scheduled_date || '',
      completed_date: maintenance.completed_date || '',
    })
    setEditingId(maintenance.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) return
    try {
      await deleteMaintenance(id)
      await loadMaintenances()
      toast.success('Manutenção excluída')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const filteredMaintenances = maintenances.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.equipment_id.toLowerCase().includes(search.toLowerCase())
  )

  const getEquipmentName = (equipmentId: string) => {
    const eq = equipments.find(e => e.id === equipmentId)
    return eq ? `${eq.code} - ${eq.name}` : equipmentId
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manutenção</h2>
            <p className="text-muted-foreground">Gerencie as manutenções dos equipamentos</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ equipment_id: '', title: '', description: '', type: 'preventive', status: 'scheduled', priority: 'medium', scheduled_date: '', completed_date: '' }) }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Manutenção
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar' : 'Nova'} Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Equipamento</Label>
                  <select
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selecione um equipamento</option>
                    {equipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>
                    ))}
                  </select>
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
                    <option value="preventive">Preventiva</option>
                    <option value="corrective">Corretiva</option>
                    <option value="predictive">Preditiva</option>
                    <option value="lubrication">Lubrificação</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="scheduled">Programada</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluída</option>
                    <option value="overdue">Atrasada</option>
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
                  <Label>Data Agendada</Label>
                  <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Manutenções</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar manutenções..."
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
                    <th className="p-2 text-left">Equipamento</th>
                    <th className="p-2 text-left">Título</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Prioridade</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenances.map((m) => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2">{getEquipmentName(m.equipment_id)}</td>
                      <td className="p-2">{m.title}</td>
                      <td className="p-2 capitalize">{m.type}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          m.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          m.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          m.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {m.status === 'scheduled' ? 'Programada' :
                           m.status === 'in_progress' ? 'Em Andamento' :
                           m.status === 'completed' ? 'Concluída' : 'Atrasada'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          m.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                          m.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          m.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {m.priority === 'low' ? 'Baixa' :
                           m.priority === 'medium' ? 'Média' :
                           m.priority === 'high' ? 'Alta' : 'Crítica'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(m)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMaintenances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Nenhuma manutenção encontrada
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