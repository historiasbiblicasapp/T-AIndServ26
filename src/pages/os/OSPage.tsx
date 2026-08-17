import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getClients,
  getEquipments,
  searchCep,
} from '@/services/storage'
import type { Client } from '@/types/clients'

type Status = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada'

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
  client_id?: string
}

export default function WorkOrdersPage() {
  const [osList, setOsList] = useState<OS[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [equipments, setEquipments] = useState<{ id: string; name: string; code: string }[]>([])
  const [loadingCep, setLoadingCep] = useState(false)
  const [form, setForm] = useState<OS>({
    id: '',
    numero: '',
    titulo: '',
    equipamento: '',
    categoria: 'Corretiva',
    status: 'Aberta',
    responsavel: '',
    dataAbertura: '',
    cliente: '',
    cnpj: '',
    empresa: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    numeroEndereco: '',
    telefone: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const loadOS = async () => {
    try {
      const data = await getWorkOrders()
      const mapped = (data as any[]).map((item) => ({
        id: item.id,
        numero: item.number || `OS-${String(item.id).slice(-3)}`,
        titulo: item.title || '',
        equipamento: item.equipment_id || '',
        categoria:
          item.type === 'preventive'
            ? 'Preventiva'
            : item.type === 'corrective'
              ? 'Corretiva'
              : item.type === 'predictive'
                ? 'Preditiva'
                : 'Corretiva',
        status:
          item.status === 'Aberta' ||
          item.status === 'Em Andamento' ||
          item.status === 'Concluída' ||
          item.status === 'Cancelada'
            ? item.status
            : 'Aberta',
        responsavel: item.assigned_to || '',
        dataAbertura: item.planned_date || new Date().toISOString().split('T')[0],
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
        client_id: item.client_id || '',
      }))
      setOsList(mapped)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar ordens de serviço')
    } finally {
      setIsLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data as Client[])
    } catch {
      // ignore
    }
  }

  const loadEquipments = async () => {
    try {
      const data = await getEquipments()
      setEquipments(
        data.map((eq: any) => ({
          id: eq.id,
          name: eq.name,
          code: eq.code,
        }))
      )
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadOS()
    loadClients()
    loadEquipments()
  }, [])

  const filtered = osList.filter((item) => {
    if (search && !item.numero.toLowerCase().includes(search.toLowerCase()) && !item.titulo.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false
    return true
  })

  const resetForm = () => {
    setForm({
      id: '',
      numero: '',
      titulo: '',
      equipamento: '',
      categoria: 'Corretiva',
      status: 'Aberta',
      responsavel: '',
      dataAbertura: '',
      cliente: '',
      cnpj: '',
      empresa: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      numeroEndereco: '',
      telefone: '',
    })
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setOpenDialog(true)
  }

  const openEdit = (item: OS) => {
    setForm(item)
    setEditingId(item.id)
    setOpenDialog(true)
  }

  const handleClientChange = async (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setForm({
        ...form,
        client_id: clientId,
        cliente: client.name,
        cnpj: client.cnpj || '',
        empresa: client.company || '',
        endereco: client.address || '',
        cidade: client.city || '',
        estado: client.state || '',
        cep: client.zip_code || '',
        numeroEndereco: client.number || '',
        telefone: client.phone || '',
      })
    }
  }

  const handleCepChange = async (cep: string) => {
    setForm({ ...form, cep })
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const result = await searchCep(cleanCep)
        if (result) {
          setForm((prev) => ({
            ...prev,
            cep: result.zip_code,
            endereco: result.address,
            cidade: result.city,
            estado: result.state,
          }))
        }
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const payload: any = {
        number: form.numero,
        title: form.titulo,
        equipment_id: form.equipamento,
        type: form.categoria === 'Preventiva' ? 'preventive' : form.categoria === 'Preditiva' ? 'predictive' : 'corrective',
        status: form.status,
        assigned_to: form.responsavel,
        planned_date: form.dataAbertura,
        description: form.observacoes,
        client_id: form.client_id,
        cliente: form.cliente,
        cnpj: form.cnpj,
        empresa: form.empresa,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        numero_endereco: form.numeroEndereco,
        telefone: form.telefone,
      }

      if (editingId) {
        await updateWorkOrder(editingId, payload)
        toast.success('Ordem de serviço atualizada')
      } else {
        const created = await createWorkOrder(payload)
        setForm((prev) => ({ ...prev, id: created.id }))
        toast.success('Ordem de serviço criada')
      }

      await loadOS()
      setOpenDialog(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar ordem de serviço')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return
    try {
      await deleteWorkOrder(id)
      await loadOS()
      toast.success('Ordem de serviço removida')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateWorkOrder(id, { status })
      await loadOS()
      toast.success('Status atualizado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="mt-1 text-gray-600">Gerencie ordens de serviço e manutenções.</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título da OS" />
              </div>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={form.client_id || ''} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company ? `- ${client.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="CNPJ" />
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Empresa" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Equipamento</Label>
                <Select value={form.equipamento} onValueChange={(value) => setForm({ ...form, equipamento: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} ({eq.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={form.categoria}
                    onValueChange={(value: 'Corretiva' | 'Preventiva' | 'Preditiva') => setForm({ ...form, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corretiva">Corretiva</SelectItem>
                      <SelectItem value="Preventiva">Preventiva</SelectItem>
                      <SelectItem value="Preditiva">Preditiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value: Status) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Responsável" />
              </div>
              <div className="space-y-2">
                <Label>Data de Abertura</Label>
                <Input type="date" value={form.dataAbertura} onChange={(e) => setForm({ ...form, dataAbertura: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={form.observacoes || ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" />
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={form.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="CEP"
                  disabled={loadingCep}
                />
                {loadingCep && <p className="text-xs text-gray-500">Buscando CEP...</p>}
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={form.numeroEndereco} onChange={(e) => setForm({ ...form, numeroEndereco: e.target.value })} placeholder="Número" />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="Estado" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>{editingId ? 'Salvar' : 'Criar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 sm:w-64" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Preditiva">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="py-2">OS</th>
                    <th className="py-2">Título</th>
                    <th className="py-2">Equipamento</th>
                    <th className="py-2">Categoria</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Responsável</th>
                    <th className="py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500">
                        Nenhuma ordem de serviço encontrada
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const equipment = equipments.find((eq) => eq.id === item.equipamento)
                      return (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 font-medium">{item.numero}</td>
                          <td className="py-2">{item.titulo}</td>
                          <td className="py-2">{equipment ? `${equipment.name} (${equipment.code})` : item.equipamento}</td>
                          <td className="py-2">{item.categoria}</td>
                          <td className="py-2">
                            <Select value={item.status} onValueChange={(value: string) => handleStatusChange(item.id, value)}>
                              <SelectTrigger className="h-8 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aberta">Aberta</SelectItem>
                                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                <SelectItem value="Concluída">Concluída</SelectItem>
                                <SelectItem value="Cancelada">Cancelada</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2">{item.responsavel}</td>
                          <td className="py-2">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/work-orders/${item.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
