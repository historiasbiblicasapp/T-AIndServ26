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
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getBrazilianCities,
} from '@/services/storage'
import { Plus, Search, Trash2 } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'
import type { Client } from '@/types/clients'

export default function ClientListPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<{ id: string; city_name: string }[]>([])
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
    loadStates()
  }, [])

  useEffect(() => {
    if (formData.state) {
      loadCities(formData.state)
    }
  }, [formData.state])

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data as Client[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar clientes')
    }
  }

  const loadStates = async () => {
    try {
      const data = await getBrazilianCities()
      const uniqueStates = Array.from(new Set(data.map((c: any) => c.state))).sort()
      setStates(uniqueStates)
    } catch {
      // ignore
    }
  }

  const loadCities = async (state: string) => {
    try {
      const data = await getBrazilianCities(state)
      setCities(data.map((c: any) => ({ id: c.id, city_name: c.city_name })))
    } catch {
      setCities([])
    }
  }

  const resetForm = () => {
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
      resetForm()
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

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpj && c.cnpj.includes(search)) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Gerencie os clientes</p>
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
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={c.city_name}>
                          {c.city_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Responsável</Label>
                  <Input
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => { resetForm(); setShowForm(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clientes</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
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
                    <th className="p-2 text-left">Empresa</th>
                    <th className="p-2 text-left">Cidade/UF</th>
                    <th className="p-2 text-left">Telefone</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b">
                      <td className="p-2">{client.name}</td>
                      <td className="p-2">{client.cnpj || '—'}</td>
                      <td className="p-2">{client.company || '—'}</td>
                      <td className="p-2">
                        {client.city && client.state ? `${client.city} / ${client.state}` : '—'}
                      </td>
                      <td className="p-2">{client.phone || '—'}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
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
