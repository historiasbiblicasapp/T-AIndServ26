import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getLaborRoles } from '@/services/storage'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import DashboardButton from '@/components/shared/DashboardButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
  department?: string
}

interface LaborRole {
  id: string
  name: string
  code: string
  hourly_rate: number
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [laborRoles, setLaborRoles] = useState<LaborRole[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: '', department: '' })

  useEffect(() => {
    loadEmployees()
    loadLaborRoles()
  }, [])

  const loadLaborRoles = async () => {
    try {
      const data = await getLaborRoles()
      setLaborRoles(data as LaborRole[])
    } catch {
      // ignore
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data as Employee[])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar colaboradores')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateEmployee(editingId, formData)
        toast.success('Colaborador atualizado')
      } else {
        await createEmployee(formData)
        toast.success('Colaborador cadastrado')
      }
      await loadEmployees()
      setFormData({ full_name: '', email: '', phone: '', role: '', department: '' })
      setEditingId(null)
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar colaborador')
    }
  }

  const handleEdit = (emp: Employee) => {
    setFormData({ full_name: emp.full_name, email: emp.email, phone: emp.phone || '', role: emp.role, department: emp.department || '' })
    setEditingId(emp.id)
    setShowForm(true)
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

  const roleLabel = (code: string) => laborRoles.find(r => r.code === code)?.name || code

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
            <p className="text-muted-foreground">Gerencie a equipe de manutenção</p>
          </div>
          <DashboardButton />
        </div>
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Colaborador' : 'Cadastrar Colaborador'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {laborRoles.map(role => (
                        <SelectItem key={role.id} value={role.code}>{role.name} ({role.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Departamento</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
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
            <div className="flex items-center justify-between">
              <CardTitle>Colaboradores</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ full_name: '', email: '', phone: '', role: '', department: '' }) }}>
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
                      <td className="p-2">{roleLabel(emp.role)}</td>
                      <td className="p-2">{emp.department || '-'}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)} title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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