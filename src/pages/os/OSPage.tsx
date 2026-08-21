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
import { Plus, Search, Eye, Edit, Trash2, ChevronDown, ChevronUp, FileText, Users, ListChecks, Package, Paperclip, PenLine, ClipboardList, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CATEGORY_OPTIONS, categoriaFromType, typeFromCategoria } from '@/lib/os'
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getClients,
  getEquipments,
  searchCep,
  getEscopoItems,
  createEscopoItem,
  deleteEscopoItem,
  getRecursos,
  createRecurso,
  deleteRecurso,
  getAnexos,
  createAnexo,
  deleteAnexo,
  getAssinaturas,
  createAssinatura,
  getChecklistItens,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getHistoricoOS,
  getExecucoes,
  createExecucao,
  getLaborRoles,
  getWorkOrderLabor,
  createWorkOrderLabor,
  deleteWorkOrderLabor,
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
  displacement_type?: string
  displacement_value?: number
  tax_rate?: number
  discount?: number
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
  const [cepNotFound, setCepNotFound] = useState(false)
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

  const [escopo, setEscopo] = useState<any[]>([])
  const [recursos, setRecursos] = useState<any[]>([])
  const [laborItems, setLaborItems] = useState<any[]>([])
  const [laborRoles, setLaborRoles] = useState<any[]>([])
  const [anexos, setAnexos] = useState<any[]>([])
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [execucoes, setExecucoes] = useState<any[]>([])
  const [displacementType, setDisplacementType] = useState<'none' | 'individual' | 'collective'>('none')
  const [displacementValue, setDisplacementValue] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [selectedScopeRole, setSelectedScopeRole] = useState('')
  const [selectedLaborRole, setSelectedLaborRole] = useState('')

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    escopo: false,
    recursos: false,
    labor: false,
    anexos: false,
    assinaturas: false,
    checklist: false,
    historico: false,
    execucoes: false,
    values: false,
  })

  const loadOS = async () => {
    try {
      const data = await getWorkOrders()
      const mapped = (data as any[]).map((item) => ({
        id: item.id,
        numero: item.number || `OS-${String(item.id).slice(-3)}`,
        titulo: item.title || '',
        equipamento: item.equipment_id || '',
        categoria: categoriaFromType(item.type),
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
        displacement_type: item.displacement_type || 'none',
        displacement_value: item.displacement_value || 0,
        tax_rate: item.tax_rate || 0,
        discount: item.discount || 0,
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
      setEquipments(data.map((eq: any) => ({ id: eq.id, name: eq.name, code: eq.code })))
    } catch {
      // ignore
    }
  }

  const loadLaborRoles = async () => {
    try {
      const data = await getLaborRoles()
      setLaborRoles(data as any[])
    } catch {
      // ignore
    }
  }

  const loadRelatedData = async (osId: string) => {
    try {
      const escopoData = await getEscopoItems(osId)
      const recursosData = await getRecursos(osId)
      const anexosData = await getAnexos(osId)
      const assinaturasData = await getAssinaturas(osId)
      const checklistData = await getChecklistItens(undefined, osId)
      const historicoData = await getHistoricoOS(osId)
      const execucoesData = await getExecucoes(osId)
      const laborData = await getWorkOrderLabor(osId)

      setEscopo(escopoData)
      setRecursos(recursosData)
      setAnexos(anexosData)
      setAssinaturas(assinaturasData)
      setChecklist(checklistData)
      setHistorico(historicoData)
      setExecucoes(execucoesData)
      setLaborItems(laborData)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadOS()
    loadClients()
    loadEquipments()
    loadLaborRoles()
  }, [])

  useEffect(() => {
    if (editingId) {
      loadRelatedData(editingId)
    }
  }, [editingId])

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
    setEscopo([])
    setRecursos([])
    setAnexos([])
    setAssinaturas([])
    setChecklist([])
    setHistorico([])
    setExecucoes([])
    setLaborItems([])
    setDisplacementType('none')
    setDisplacementValue(0)
    setTaxRate(0)
    setDiscount(0)
  }

  const openCreate = () => {
    resetForm()
    setOpenDialog(true)
  }

  const openEdit = async (item: OS) => {
    setForm(item)
    setEditingId(item.id)
    setOpenDialog(true)
    setDisplacementType((item.displacement_type as 'none' | 'individual' | 'collective') || 'none')
    setDisplacementValue(item.displacement_value || 0)
    setTaxRate(item.tax_rate || 0)
    setDiscount(item.discount || 0)
    await loadRelatedData(item.id)
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
    setCepNotFound(false)
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
        } else {
          setCepNotFound(true)
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
        type: typeFromCategoria(form.categoria),
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
        displacement_type: displacementType === 'none' ? null : displacementType,
        displacement_value: displacementValue,
        tax_rate: taxRate,
        discount: discount,
      }

      let savedOrderId = editingId

      if (editingId) {
        await updateWorkOrder(editingId, payload)
        toast.success('Ordem de serviço atualizada')
      } else {
        const created = await createWorkOrder(payload)
        setForm((prev) => ({ ...prev, id: created.id }))
        savedOrderId = created.id
        toast.success('Ordem de serviço criada')
      }

      if (savedOrderId && laborItems.length > 0) {
        const existingLabor = await getWorkOrderLabor(savedOrderId)
        for (const existing of existingLabor) {
          await deleteWorkOrderLabor(existing.id, savedOrderId)
        }
        for (const item of laborItems) {
          await createWorkOrderLabor({
            work_order_id: savedOrderId,
            role_id: item.role_id,
            employee_id: item.employee_id,
            hours: item.hours,
            total: item.total,
          })
        }
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

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
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
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
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
                    onValueChange={(value: string) => setForm({ ...form, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
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
                <Input value={form.cep} onChange={(e) => handleCepChange(e.target.value)} placeholder="CEP" disabled={loadingCep} />
                {loadingCep && <p className="text-xs text-gray-500">Buscando CEP...</p>}
                {cepNotFound && !loadingCep && <p className="text-xs text-red-500">CEP não encontrado. Preencha o endereço manualmente.</p>}
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

              {editingId && (
                <div className="mt-4 space-y-2">
                  <Label>Itens da OS</Label>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('labor')}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Mão de Obra</span>
                      </div>
                      {openSections.labor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.labor && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5">
                            <Label>Cargo</Label>
                            <Select value={selectedLaborRole} onValueChange={setSelectedLaborRole}>
                              <SelectTrigger data-testid="labor-role">
                                <SelectValue placeholder="Selecione um cargo" />
                              </SelectTrigger>
                              <SelectContent>
                                {laborRoles.map(role => (
                                  <SelectItem key={role.id} value={role.id}>{role.name} ({role.code}) - R$ {Number(role.hourly_rate).toFixed(2)}/h</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label>Horas</Label>
                            <Input placeholder="Horas" id="labor-hours" type="number" />
                          </div>
                          <div className="col-span-2">
                            <Label>Qtd. Executantes</Label>
                            <Input placeholder="Qtd." id="labor-people" type="number" />
                          </div>
                          <div className="col-span-2">
                            <Label>Item</Label>
                            <Input placeholder="Item" id="labor-item" />
                          </div>
                          <div className="col-span-1">
                            <Button className="w-full" onClick={async () => {
                              const hours = Number((document.getElementById('labor-hours') as HTMLInputElement)?.value || 0)
                              const people = Number((document.getElementById('labor-people') as HTMLInputElement)?.value || 0)
                              const item = (document.getElementById('labor-item') as HTMLInputElement)?.value || ''
                              if (!selectedLaborRole || !editingId) return
                              const role = laborRoles.find(r => r.id === selectedLaborRole)
                              const total = hours * Number(role?.hourly_rate || 0)
                              await createWorkOrderLabor({
                                work_order_id: editingId,
                                role_id: selectedLaborRole,
                                employee_id: null,
                                hours,
                                quantity: people,
                                escopo_item: item ? Number(item) : null,
                                total,
                              })
                              setSelectedLaborRole('')
                              await loadRelatedData(editingId)
                            }}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {laborItems.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{laborRoles.find(r => r.id === item.role_id)?.name || 'Sem cargo'}{item.escopo_item ? ` • Item ${item.escopo_item}` : ''}{item.quantity ? ` • ${item.quantity} exec.` : ''}</p>
                                <p className="text-xs text-gray-500">{item.hours}h • R$ {Number(item.total).toFixed(2)}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if (editingId) {
                                  await deleteWorkOrderLabor(item.id, editingId)
                                  await loadRelatedData(editingId)
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('escopo')}>
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        <span className="text-sm font-medium">Escopo</span>
                      </div>
                      {openSections.escopo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.escopo && (
                      <div className="mt-2 space-y-2">
                        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
                          <Select onValueChange={(value) => setSelectedScopeRole(value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Cargo" />
                            </SelectTrigger>
                            <SelectContent>
                              {laborRoles.map(role => (
                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input placeholder="Item" id="escopo-item" />
                          <Input placeholder="Pessoas" id="escopo-people" type="number" />
                          <Input placeholder="Horas" id="escopo-hours" />
                          <Button onClick={async () => {
                            const service = (document.getElementById('escopo-item') as HTMLInputElement)?.value
                            const people = Number((document.getElementById('escopo-people') as HTMLInputElement)?.value || 0)
                            const hours = (document.getElementById('escopo-hours') as HTMLInputElement)?.value
                            if (!service || !editingId) return
                            await createEscopoItem({
                              work_order_id: editingId,
                              item_number: escopo.length + 1,
                              service,
                              people,
                              hours,
                              role_id: selectedScopeRole,
                            })
                            setSelectedScopeRole('')
                            await loadRelatedData(editingId)
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {escopo.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{item.service}</p>
                                <p className="text-xs text-gray-500">{item.role?.name || ''} • {item.people} pessoas • {item.hours}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if (editingId) {
                                  await deleteEscopoItem(item.id, editingId)
                                  await loadRelatedData(editingId)
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('recursos')}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">Recursos</span>
                      </div>
                      {openSections.recursos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.recursos && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <Input placeholder="Nome" id="recurso-nome" />
                          </div>
                          <div className="col-span-2">
                            <Input placeholder="UNI." id="recurso-unidade" />
                          </div>
                          <div className="col-span-2">
                            <Input placeholder="Qtd" id="recurso-qtd" type="number" />
                          </div>
                          <div className="col-span-2">
                            <Input placeholder="Valor" id="recurso-valor" type="number" />
                          </div>
                          <div className="col-span-2">
                            <Button className="w-full" onClick={async () => {
                              const name = (document.getElementById('recurso-nome') as HTMLInputElement)?.value
                              const unit = (document.getElementById('recurso-unidade') as HTMLInputElement)?.value
                              const quantity = Number((document.getElementById('recurso-qtd') as HTMLInputElement)?.value || 0)
                              const unit_value = Number((document.getElementById('recurso-valor') as HTMLInputElement)?.value || 0)
                              const total = quantity * unit_value
                              if (!name || !editingId) return
                              await createRecurso({
                                work_order_id: editingId,
                                name,
                                unit,
                                quantity,
                                unit_value,
                                total,
                              })
                              await loadRelatedData(editingId)
                            }}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {recursos.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.quantity} {item.unit} • R$ {Number(item.unit_value).toFixed(2)} • Total: R$ {Number(item.total).toFixed(2)}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if (editingId) {
                                  await deleteRecurso(item.id, editingId)
                                  await loadRelatedData(editingId)
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('values')}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">$ Valores</span>
                      </div>
                      {openSections.values ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.values && (
                      <div className="mt-2 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Deslocamento</Label>
                          <Select value={displacementType} onValueChange={(value: 'none' | 'individual' | 'collective') => setDisplacementType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem deslocamento</SelectItem>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="collective">Coletivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Valor do Deslocamento (R$)</Label>
                          <Input type="number" step="0.01" value={displacementValue} onChange={(e) => setDisplacementValue(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Imposto (%)</Label>
                          <Input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Desconto (R$)</Label>
                          <Input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('anexos')}>
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm font-medium">Anexos</span>
                      </div>
                      {openSections.anexos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.anexos && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Input placeholder="URL do arquivo" id="anexo-url" />
                          <Button onClick={async () => {
                            const file_path = (document.getElementById('anexo-url') as HTMLInputElement)?.value
                            if (!file_path || !editingId) return
                            await createAnexo({
                              work_order_id: editingId,
                              file_name: file_path.split('/').pop() || file_path,
                              file_path,
                              file_size: 0,
                              mime_type: 'application/octet-stream',
                            })
                            await loadRelatedData(editingId)
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {anexos.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <a href={item.file_path} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
                                {item.file_name}
                              </a>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if (editingId) {
                                  await deleteAnexo(item.id, editingId)
                                  await loadRelatedData(editingId)
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('assinaturas')}>
                      <div className="flex items-center gap-2">
                        <PenLine className="h-4 w-4" />
                        <span className="text-sm font-medium">Assinaturas</span>
                      </div>
                      {openSections.assinaturas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.assinaturas && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Select data-testid="assinatura-tipo">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="executante">Executante</SelectItem>
                              <SelectItem value="cliente">Cliente</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input placeholder="Nome" data-testid="assinatura-nome" />
                          <Input placeholder="CPF" data-testid="assinatura-cpf" />
                          <Button onClick={async () => {
                            const tipo = (document.querySelector('[data-testid="assinatura-tipo"]') as HTMLSelectElement)?.value
                            const nome = (document.querySelector('[data-testid="assinatura-nome"]') as HTMLInputElement)?.value
                            const cpf = (document.querySelector('[data-testid="assinatura-cpf"]') as HTMLInputElement)?.value
                            if (!nome || !editingId) return
                            await createAssinatura({
                              work_order_id: editingId,
                              signer_id: null,
                              tipo,
                              nome,
                              cpf,
                              data: new Date().toISOString(),
                            })
                            await loadRelatedData(editingId)
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {assinaturas.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{item.nome} {item.cpf ? `(${item.cpf})` : ''}</p>
                                <p className="text-xs text-gray-500">{item.tipo}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('checklist')}>
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="text-sm font-medium">Checklist</span>
                      </div>
                      {openSections.checklist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.checklist && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Input placeholder="Novo item" id="checklist-text" className="flex-1" />
                          <Button onClick={async () => {
                            const title = (document.getElementById('checklist-text') as HTMLInputElement)?.value
                            if (!title || !editingId) return
                            await createChecklistItem({
                              work_order_id: editingId,
                              title,
                              checked: false,
                            })
                            await loadRelatedData(editingId)
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {checklist.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={item.checked} onChange={async () => {
                                  if (editingId) {
                                    await updateChecklistItem(item.id, { checked: !item.checked }, editingId)
                                    await loadRelatedData(editingId)
                                  }
                                }} />
                                <span className={`text-sm ${item.checked ? 'line-through text-gray-500' : ''}`}>{item.title}</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if (editingId) {
                                  await deleteChecklistItem(item.id, editingId)
                                  await loadRelatedData(editingId)
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('historico')}>
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        <span className="text-sm font-medium">Histórico</span>
                      </div>
                      {openSections.historico ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.historico && (
                      <div className="mt-2 space-y-1">
                        {historico.map((item: any) => (
                          <div key={item.id} className="text-sm border-b py-1 last:border-0">
                            <span className="font-medium">{item.action}</span> — {item.description}
                            <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('pt-BR')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('execucoes')}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Execuções</span>
                      </div>
                      {openSections.execucoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    {openSections.execucoes && (
                      <div className="mt-2 space-y-2">
                        <Button onClick={async () => {
                          if (!editingId) return
                          await createExecucao({
                            work_order_id: editingId,
                            user_id: null,
                          })
                          await loadRelatedData(editingId)
                          toast.success('Execução registrada')
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          Registrar Execução
                        </Button>
                        <div className="space-y-1">
                          {execucoes.map((item: any) => (
                            <div key={item.id} className="text-sm border-b py-1 last:border-0">
                              {new Date(item.executed_at).toLocaleString('pt-BR')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
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
                    <th className="py-2">Cliente</th>
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
                      <td colSpan={8} className="py-6 text-center text-gray-500">
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
                          <td className="py-2">{item.cliente}</td>
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
