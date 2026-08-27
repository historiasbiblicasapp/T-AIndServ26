import { getSupabaseClient } from './supabase'

function getNextNumber(_key: string, prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`
}

export async function getCompanies() {
  try {
    const { data, error } = await getSupabaseClient().from('companies').select('*').order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createCompany(company: any) {
  try {
    const { data, error } = await getSupabaseClient().from('companies').insert(company).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateCompany(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('companies').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getUnits(companyId?: string) {
  try {
    let query = getSupabaseClient().from('units').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createUnit(unit: any) {
  try {
    const { data, error } = await getSupabaseClient().from('units').insert(unit).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getPlants(unitId?: string) {
  try {
    let query = getSupabaseClient().from('plants').select('*')
    if (unitId) query = query.eq('unit_id', unitId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getAreas(plantId?: string) {
  try {
    let query = getSupabaseClient().from('areas').select('*')
    if (plantId) query = query.eq('plant_id', plantId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getLocations(sectorId?: string) {
  try {
    let query = getSupabaseClient().from('locations').select('*')
    if (sectorId) query = query.eq('sector_id', sectorId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getWorkOrders(filter?: any) {
  try {
    let query = getSupabaseClient().from('work_orders').select('*')
    
    if (filter?.company_id) query = query.eq('company_id', filter.company_id)
    if (filter?.unit_id) query = query.eq('unit_id', filter.unit_id)
    if (filter?.plant_id) query = query.eq('plant_id', filter.plant_id)
    if (filter?.area_id) query = query.eq('area_id', filter.area_id)
    if (filter?.sector_id) query = query.eq('sector_id', filter.sector_id)
    if (filter?.equipment_id) query = query.eq('equipment_id', filter.equipment_id)
    if (filter?.assigned_to) query = query.eq('assigned_to', filter.assigned_to)
    if (filter?.status) query = query.eq('status', filter.status)
    if (filter?.type) query = query.eq('type', filter.type)
    if (filter?.priority) query = query.eq('priority', filter.priority)
    if (filter?.number) query = query.ilike('number', `%${filter.number}%`)
    if (filter?.title) query = query.ilike('title', `%${filter.title}%`)
    if (filter?.planned_date_start) query = query.gte('planned_date', filter.planned_date_start)
    if (filter?.planned_date_end) query = query.lte('planned_date', filter.planned_date_end)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getWorkOrderById(id: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_orders').select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function createWorkOrder(workOrder: any) {
  try {
    if (!workOrder.number) {
      workOrder.number = getNextNumber('work_orders', 'OS-')
    }
    const { data, error } = await getSupabaseClient().from('work_orders').insert(workOrder).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateWorkOrder(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_orders').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteWorkOrder(id: string) {
  try {
    await getSupabaseClient().from('work_orders').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  } catch (error) { throw error }
}

export async function getWorkOrderStatusHistory(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_status_history').select('*').eq('work_order_id', _workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createWorkOrderStatusHistory(history: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_status_history').insert(history).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getWorkOrderExecutantes(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_executantes').select('*, employee:employees(*)').eq('work_order_id', _workOrderId)
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createWorkOrderExecutante(executante: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_executantes').insert(executante).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteWorkOrderExecutante(id: string, _workOrderId: string) {
  try {
    await getSupabaseClient().from('work_order_executantes').delete().eq('id', id)
  } catch (error) { throw error }
}

export async function getEscopoItems(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').select('*').eq('work_order_id', _workOrderId).order('item_number')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createEscopoItem(item: any) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').insert(item).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateEscopoItem(id: string, updates: any, _workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteEscopoItem(id: string, _workOrderId: string) {
  try {
    await getSupabaseClient().from('escopo_servico').delete().eq('id', id)
  } catch (error) { throw error }
}

export async function getRecursos(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').select('*').eq('work_order_id', _workOrderId)
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createRecurso(recurso: any) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').insert(recurso).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateRecurso(id: string, updates: any, _workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteRecurso(id: string, _workOrderId: string) {
  try {
    await getSupabaseClient().from('recursos').delete().eq('id', id)
  } catch (error) { throw error }
}

export async function getExecucoes(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('execucoes').select('*, user:profiles(*)').eq('work_order_id', _workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createExecucao(execucao: any) {
  try {
    const { data, error } = await getSupabaseClient().from('execucoes').insert(execucao).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getAnexos(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('anexos').select('*').eq('work_order_id', _workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createAnexo(anexo: any) {
  try {
    const { data, error } = await getSupabaseClient().from('anexos').insert(anexo).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteAnexo(id: string, _workOrderId: string) {
  try {
    await getSupabaseClient().from('anexos').delete().eq('id', id)
  } catch (error) { throw error }
}

export async function getAssinaturas(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('assinaturas').select('*, signer:profiles(*)').eq('work_order_id', _workOrderId)
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createAssinatura(assinatura: any) {
  try {
    const { data, error } = await getSupabaseClient().from('assinaturas').insert(assinatura).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getChecklistItens(checklistId?: string, _workOrderId?: string) {
  try {
    let query = getSupabaseClient().from('checklist_itens').select('*')
    if (checklistId) query = query.eq('checklist_id', checklistId)
    if (_workOrderId) query = query.eq('work_order_id', _workOrderId)
    const { data, error } = await query.order('created_at')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createChecklistItem(item: any) {
  try {
    const { data, error } = await getSupabaseClient().from('checklist_itens').insert(item).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateChecklistItem(id: string, updates: any, _key: string) {
  try {
    const { data, error } = await getSupabaseClient().from('checklist_itens').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteChecklistItem(id: string, _key: string) {
  try {
    await getSupabaseClient().from('checklist_itens').delete().eq('id', id)
  } catch (error) { throw error }
}

export async function createHistoricoOS(historico: any) {
  try {
    const { data, error } = await getSupabaseClient().from('historico_os').insert(historico).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function getHistoricoOS(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('historico_os').select('*').eq('work_order_id', _workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getEquipments(companyId?: string) {
  try {
    let query = getSupabaseClient().from('equipments').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createEquipment(equipment: any) {
  try {
    const { data, error } = await getSupabaseClient().from('equipments').insert(equipment).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateEquipment(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('equipments').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteEquipment(id: string) {
  try {
    const { error } = await getSupabaseClient().from('equipments').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getSectors(companyId?: string, areaId?: string) {
  try {
    let query = getSupabaseClient().from('sectors').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (areaId) query = query.eq('area_id', areaId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function getEmployees(companyId?: string, sectorId?: string) {
  try {
    let query = getSupabaseClient().from('employees').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (sectorId) query = query.eq('sector_id', sectorId)
    const { data, error } = await query.order('full_name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createEmployee(employee: any) {
  try {
    const { data, error } = await getSupabaseClient().from('employees').insert(employee).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateEmployee(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('employees').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await getSupabaseClient().from('employees').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getMaintenances(companyId?: string, equipmentId?: string) {
  try {
    let query = getSupabaseClient().from('preventive_maintenances').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (equipmentId) query = query.eq('equipment_id', equipmentId)
    const { data, error } = await query.order('next_execution')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createMaintenance(maintenance: any) {
  try {
    const { data, error } = await getSupabaseClient().from('preventive_maintenances').insert(maintenance).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateMaintenance(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('preventive_maintenances').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteMaintenance(id: string) {
  try {
    const { error } = await getSupabaseClient().from('preventive_maintenances').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getClients() {
  try {
    const { data, error } = await getSupabaseClient().from('clients').select('*').order('name')
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createClient(client: any) {
  try {
    const { data, error } = await getSupabaseClient().from('clients').insert(client).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateClient(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('clients').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteClient(id: string) {
  try {
    const { error } = await getSupabaseClient().from('clients').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getBrazilianCities(state?: string) {
  try {
    let query = getSupabaseClient().from('brazilian_cities').select('*').order('city_name')
    if (state) query = query.eq('state', state)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function searchCep(cep: string) {
  try {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return null
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.erro) return null
    return {
      address: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zip_code: data.cep || cep,
    }
  } catch (error) { throw error }
}

export const DEFAULT_LABOR_ROLES = [
  { name: 'Mecânico', code: 'MEC', hourly_rate: 95, active: true },
  { name: 'Eletricista', code: 'ELE', hourly_rate: 110, active: true },
  { name: 'Soldador', code: 'SOL', hourly_rate: 100, active: true },
  { name: 'Instrumentista', code: 'INS', hourly_rate: 120, active: true },
  { name: 'Técnico de Manutenção', code: 'TM', hourly_rate: 105, active: true },
  { name: 'Auxiliar de Manutenção', code: 'AUX', hourly_rate: 80, active: true },
  { name: 'Supervisor de Manutenção', code: 'SUP', hourly_rate: 140, active: true },
  { name: 'Analista de Manutenção', code: 'ANL', hourly_rate: 130, active: true },
]

export async function ensureDefaultLaborRoles() {
  try {
    const { data, error } = await getSupabaseClient().from('labor_roles').select('*')
    if (error) throw error

    if ((data || []).length > 0) return data || []

    const { data: created, error: insertError } = await getSupabaseClient()
      .from('labor_roles')
      .insert(DEFAULT_LABOR_ROLES)
      .select()

    if (insertError) throw insertError
    return created || []
  } catch (error) { throw error }
}

export async function getLaborRoles() {
  try {
    const { data, error } = await getSupabaseClient().from('labor_roles').select('*').order('name')
    if (error) throw error
    if ((data || []).length === 0) return await ensureDefaultLaborRoles()
    return data || []
  } catch (error) { throw error }
}

export async function createLaborRole(role: any) {
  try {
    const { data, error } = await getSupabaseClient().from('labor_roles').insert(role).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateLaborRole(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('labor_roles').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteLaborRole(id: string) {
  try {
    const { error } = await getSupabaseClient().from('labor_roles').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getEmployeeRoles(employeeId?: string) {
  try {
    let query = getSupabaseClient().from('employee_roles').select('*, role:labor_roles(*)')
    if (employeeId) query = query.eq('employee_id', employeeId)
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createEmployeeRole(role: any) {
  try {
    const { data, error } = await getSupabaseClient().from('employee_roles').insert(role).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteEmployeeRole(id: string) {
  try {
    const { error } = await getSupabaseClient().from('employee_roles').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getWorkOrderLabor(_workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_labor').select('*, role:labor_roles(*), employee:employees(*)').eq('work_order_id', _workOrderId)
    if (error) throw error
    return data || []
  } catch (error) { throw error }
}

export async function createWorkOrderLabor(labor: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_labor').insert(labor).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function updateWorkOrderLabor(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_labor').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (error) { throw error }
}

export async function deleteWorkOrderLabor(id: string, _workOrderId: string) {
  try {
    const { error } = await getSupabaseClient().from('work_order_labor').delete().eq('id', id)
    if (error) throw error
  } catch (error) { throw error }
}

export async function getWorkOrderWithCalculations(id: string) {
  try {
    const wo = await getWorkOrderById(id)
    if (!wo) return null

    const [labor, recursos, escopo] = await Promise.all([
      getWorkOrderLabor(id),
      getRecursos(id),
      getEscopoItems(id),
    ])

    const recursosTotal = recursos.reduce((acc: number, item: any) => acc + Number(item.total || 0), 0)
    const laborTotal = labor.reduce((acc: number, item: any) => acc + Number(item.total || 0), 0)
    const displacement = Number(wo.displacement_value || 0)
    const subtotal = recursosTotal + laborTotal + displacement
    const taxRate = Number(wo.tax_rate || 0)
    const tax = subtotal * (taxRate / 100)
    const discount = Number(wo.discount || 0)
    const total = subtotal + tax - discount

    return {
      ...wo,
      labor,
      recursos,
      escopo,
      recursosTotal,
      laborTotal,
      displacement,
      subtotal,
      taxRate,
      tax,
      discount,
      total,
    }
  } catch (error) { throw error }
}
