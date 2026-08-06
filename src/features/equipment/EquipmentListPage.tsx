import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getEquipments, createEquipment, deleteEquipment } from '@/services/storage'
import { Plus, Search, Trash2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

interface Equipment {
  id: string
  name: string
  code: string
  sector: string
  status: string
}

export default function EquipmentListPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', code: '', sector: '', status: 'operational' })

  useEffect(() => {
    loadEquipments()
  }, [])

  const loadEquipments = async () => {
    try {
      const data = await getEquipments()
      setEquipments(data as Equipment[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar equipamentos')
    }
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return
    try {
      await deleteEquipment(id)
      await loadEquipments()
      toast.success('Equipamento excluído')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const filteredEquipments = equipments.filter(eq =>
    eq.name.toLowerCase().includes(search.toLowerCase()) ||
    eq.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Equipamentos" />

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-8">
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
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipamentos</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(!showForm)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Equipamento
                </Button>
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
                    <th className="p-2 text-left">Ações</th>
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
                      <td className="p-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(eq.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEquipments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
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