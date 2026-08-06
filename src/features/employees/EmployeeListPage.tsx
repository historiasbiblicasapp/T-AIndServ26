import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getEmployees, createEmployee, deleteEmployee } from '@/services/storage'
import { Search, Plus, Trash2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
  department?: string
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: '', department: '' })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data as Employee[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar colaboradores')
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEmployee(formData)
      await loadEmployees()
      setFormData({ full_name: '', email: '', phone: '', role: '', department: '' })
      setShowForm(false)
      toast.success('Colaborador cadastrado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar colaborador')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return
    try {
      await deleteEmployee(id)
      await loadEmployees()
      toast.success('Colaborador excluído')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Colaboradores" />

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cadastrar Colaborador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmployee} className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome Completo</Label>
                  <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <Label>Departamento</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
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
              <CardTitle>Colaboradores</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(!showForm)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Colaborador
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colaboradores..."
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
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Cargo</th>
                    <th className="p-2 text-left">Departamento</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-2">{emp.full_name}</td>
                      <td className="p-2">{emp.email}</td>
                      <td className="p-2">{emp.role}</td>
                      <td className="p-2">{emp.department || '-'}</td>
                      <td className="p-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        Nenhum colaborador encontrado
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