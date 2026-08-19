import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getClients, createClient, updateClient, deleteClient, searchCep } from '@/services/storage'
import { Plus, Search, Trash2, Edit, Loader2 } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'

interface Client {
  id: string
  name: string
  cnpj: string
  company: string
  address: string
  city: string
  state: string
  zip_code: string
  number: string
  complement: string
  neighborhood: string
  phone: string
  email: string
  responsible: string
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export default function ClientListPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    number: '',
    complement: '',
    neighborhood: '',
    phone: '',
    email: '',
    responsible: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const FALLBACK_CITIES_BY_STATE: Record<string, string[]> = {
    SP: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'São José dos Campos', 'Santo André', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá'],
    RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Ouro Preto'],
    ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'],
  }

  const filteredCityNames = formData.state && FALLBACK_CITIES_BY_STATE[formData.state]
    ? FALLBACK_CITIES_BY_STATE[formData.state]
    : []

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data as Client[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar clientes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateClient(editingId, formData)
        toast.success('Cliente atualizado')
      } else {
        await createClient(formData)
        toast.success('Cliente cadastrado')
      }
      await loadClients()
      setFormData({
        name: '',
        cnpj: '',
        company: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        number: '',
        complement: '',
        neighborhood: '',
        phone: '',
        email: '',
        responsible: '',
      })
      setEditingId(null)
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar cliente')
    }
  }

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      cnpj: client.cnpj || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      zip_code: client.zip_code || '',
      number: client.number || '',
      complement: client.complement || '',
      neighborhood: client.neighborhood || '',
      phone: client.phone || '',
      email: client.email || '',
      responsible: client.responsible || '',
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await deleteClient(id)
      await loadClients()
      toast.success('Cliente excluído')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const handleCepBlur = async () => {
    const cep = formData.zip_code.replace(/\D/g, '')
    if (cep.length !== 8) return
    setLoadingCep(true)
    try {
      const data = await searchCep(cep)
      if (data) {
        setFormData(prev => ({
          ...prev,
          address: data.address,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
        }))
      }
    } finally {
      setLoadingCep(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.cnpj.toLowerCase().includes(search.toLowerCase()) ||
    client.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Gerencie os clientes da planta</p>
          </div>
          <DashboardButton />
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Cliente' : 'Cadastrar Cliente'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Input value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} />
                </div>
                <div>
                  <Label>CEP</Label>
                  <div className="relative">
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                    />
                    {loadingCep && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value, city: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {BRAZILIAN_STATES.map(state => (
                        <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })} disabled={!formData.state}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {filteredCityNames.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input value={formData.complement} onChange={(e) => setFormData({ ...formData, complement: e.target.value })} />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancelar</Button>
                  <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', cnpj: '', company: '', address: '', city: '', state: '', zip_code: '', number: '', complement: '', neighborhood: '', phone: '', email: '', responsible: '' }) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">CNPJ</th>
                    <th className="p-2 text-left">Cidade/UF</th>
                    <th className="p-2 text-left">Telefone</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b">
                      <td className="p-2">{client.name}</td>
                      <td className="p-2">{client.cnpj || '-'}</td>
                      <td className="p-2">{client.city}/{client.state}</td>
                      <td className="p-2">{client.phone || '-'}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(client)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        Nenhum cliente encontrado
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
