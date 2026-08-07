import { useState } from 'react'
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

type Status = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada'
type Categoria = 'Corretiva' | 'Preventiva' | 'Preditiva'

interface OS {
  id: string
  numero: string
  titulo: string
  equipamento: string
  categoria: Categoria
  status: Status
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
}

const INITIAL_OS: OS[] = [
  { id: '1', numero: 'OS-001', titulo: 'Manutenção corretiva', equipamento: 'Motor Trifásico', categoria: 'Corretiva', status: 'Em Andamento', responsavel: 'João Silva', dataAbertura: '2025-01-15', cliente: 'Cliente Teste', cnpj: '00.000.000/0000-00', empresa: 'T&A Serv Ind', cidade: 'São Paulo', estado: 'SP', cep: '00000-000', numeroEndereco: '100', telefone: '(00) 0000-0000' },
  { id: '2', numero: 'OS-002', titulo: 'Troca de filtro', equipamento: 'Compressor', categoria: 'Preventiva', status: 'Concluída', responsavel: 'Maria Souza', dataAbertura: '2025-01-16', dataConclusao: '2025-01-17', cliente: 'Cliente Teste', cnpj: '00.000.000/0000-00', empresa: 'T&A Serv Ind', cidade: 'São Paulo', estado: 'SP', cep: '00000-000', numeroEndereco: '100', telefone: '(00) 0000-0000' },
  { id: '3', numero: 'OS-003', titulo: 'Inspeção de bombas', equipamento: 'Bomba Hidráulica', categoria: 'Preditiva', status: 'Aberta', responsavel: 'Pedro Costa', dataAbertura: '2025-01-17', cliente: 'Cliente Teste', cnpj: '00.000.000/0000-00', empresa: 'T&A Serv Ind', cidade: 'São Paulo', estado: 'SP', cep: '00000-000', numeroEndereco: '100', telefone: '(00) 0000-0000' },
]

export default function WorkOrdersPage() {
  const [osList, setOsList] = useState<OS[]>(INITIAL_OS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OS>({ id: '', numero: '', titulo: '', equipamento: '', categoria: 'Corretiva', status: 'Aberta', responsavel: '', dataAbertura: '', cliente: '', cnpj: '', empresa: '', cidade: '', estado: '', cep: '', numeroEndereco: '', telefone: '' })
  const navigate = useNavigate()

  const filtered = osList.filter(item => {
    if (search && !item.numero.toLowerCase().includes(search.toLowerCase()) && !item.titulo.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false
    return true
  })

  const resetForm = () => {
    setForm({ id: '', numero: '', titulo: '', equipamento: '', categoria: 'Corretiva', status: 'Aberta', responsavel: '', dataAbertura: '', cliente: '', cnpj: '', empresa: '', cidade: '', estado: '', cep: '', numeroEndereco: '', telefone: '' })
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

  const handleSubmit = () => {
    if (!form.numero || !form.titulo || !form.equipamento || !form.responsavel || !form.dataAbertura) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (editingId) {
      setOsList(prev => prev.map(item => item.id === editingId ? { ...form, id: editingId } : item))
      toast.success('Ordem de serviço atualizada')
    } else {
      const newOs: OS = { ...form, id: Date.now().toString(), numero: form.numero || `OS-${String(osList.length + 1).padStart(3, '0')}` }
      setOsList(prev => [...prev, newOs])
      toast.success('Ordem de serviço criada')
    }

    setOpenDialog(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setOsList(prev => prev.filter(item => item.id !== id))
    toast.success('Ordem de serviço removida')
  }

  const handleStatusChange = (id: string, status: Status) => {
    setOsList(prev => prev.map(item => item.id === id ? { ...item, status, dataConclusao: status === 'Concluída' ? new Date().toISOString().split('T')[0] : item.dataConclusao } : item))
    toast.success('Status atualizado')
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
                <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título da OS" />
              </div>
              <div className="space-y-2">
                <Label>Equipamento</Label>
                <Input value={form.equipamento} onChange={e => setForm({ ...form, equipamento: e.target.value })} placeholder="Equipamento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.categoria} onValueChange={(value: Categoria) => setForm({ ...form, categoria: value })}>
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
                <Input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} placeholder="Responsável" />
              </div>
              <div className="space-y-2">
                <Label>Data de Abertura</Label>
                <Input type="date" value={form.dataAbertura} onChange={e => setForm({ ...form, dataAbertura: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={form.observacoes || ''} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Cliente" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="CNPJ" />
                </div>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Empresa" />
                </div>
                <div className="space-y-2">
                  <Label>Cidade/Estado</Label>
                  <Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade/Estado" />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} placeholder="CEP" />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={form.numeroEndereco} onChange={e => setForm({ ...form, numeroEndereco: e.target.value })} placeholder="Número" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
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
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 sm:w-64" />
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
                  <tr><td colSpan={7} className="py-6 text-center text-gray-500">Nenhuma ordem de serviço encontrada</td></tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.numero}</td>
                      <td className="py-2">{item.titulo}</td>
                      <td className="py-2">{item.equipamento}</td>
                      <td className="py-2">{item.categoria}</td>
                      <td className="py-2">
                        <Select value={item.status} onValueChange={(value: Status) => handleStatusChange(item.id, value)}>
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
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/work-orders/${item.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
