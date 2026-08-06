import { getSupabaseClient } from './supabase'

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setLocalData<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getNextNumber(_key: string, prefix: string): string {
  const counter = getLocalData<number>(`gmi_counter_${prefix}`, 0)
  const next = counter + 1
  setLocalData(`gmi_counter_${prefix}`, next)
  return `${prefix}${next.toString().padStart(6, '0')}`
}

export async function getCompanies() {
  try {
    const { data, error } = await getSupabaseClient().from('companies').select('*').order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_companies', [])
  }
}

export async function createCompany(company: any) {
  try {
    const { data, error } = await getSupabaseClient().from('companies').insert(company).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_companies', [])
    const newItem = { ...company, id: generateId() }
    items.push(newItem)
    setLocalData('gmi_companies', items)
    return newItem
  }
}

export async function updateCompany(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('companies').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_companies', [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData('gmi_companies', items)
      return items[index]
    }
    return null
  }
}

export async function getUnits(companyId?: string) {
  try {
    let query = getSupabaseClient().from('units').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_units', [])
  }
}

export async function createUnit(unit: any) {
  try {
    const { data, error } = await getSupabaseClient().from('units').insert(unit).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_units', [])
    const newItem = { ...unit, id: generateId() }
    items.push(newItem)
    setLocalData('gmi_units', items)
    return newItem
  }
}

export async function getPlants(unitId?: string) {
  try {
    let query = getSupabaseClient().from('plants').select('*')
    if (unitId) query = query.eq('unit_id', unitId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_plants', [])
  }
}

export async function getAreas(plantId?: string) {
  try {
    let query = getSupabaseClient().from('areas').select('*')
    if (plantId) query = query.eq('plant_id', plantId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_areas', [])
  }
}

export async function getLocations(sectorId?: string) {
  try {
    let query = getSupabaseClient().from('locations').select('*')
    if (sectorId) query = query.eq('sector_id', sectorId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_locations', [])
  }
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
  } catch {
    return getLocalData<any[]>('gmi_work_orders', [])
  }
}

export async function getWorkOrderById(id: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_orders').select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    return items.find((item: any) => item.id === id)
  }
}

export async function createWorkOrder(workOrder: any) {
  try {
    if (!workOrder.number) {
      workOrder.number = getNextNumber('work_orders', 'OS-')
    }
    const { data, error } = await getSupabaseClient().from('work_orders').insert(workOrder).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    const newItem = { ...workOrder, id: generateId(), number: workOrder.number || `OS-${Date.now()}` }
    items.push(newItem)
    setLocalData('gmi_work_orders', items)
    return newItem
  }
}

export async function updateWorkOrder(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_orders').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData('gmi_work_orders', items)
      return items[index]
    }
    return null
  }
}

export async function deleteWorkOrder(id: string) {
  try {
    await getSupabaseClient().from('work_orders').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_work_orders', filtered)
  }
}

export async function getWorkOrderStatusHistory(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_status_history').select('*').eq('work_order_id', workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_status_history_${workOrderId}`, [])
  }
}

export async function createWorkOrderStatusHistory(history: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_status_history').insert(history).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_status_history_${history.work_order_id}`, [])
    const newItem = { ...history, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_status_history_${history.work_order_id}`, items)
    return newItem
  }
}

export async function getWorkOrderExecutantes(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_executantes').select('*, employee:employees(*)').eq('work_order_id', workOrderId)
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_executantes_${workOrderId}`, [])
  }
}

export async function createWorkOrderExecutante(executante: any) {
  try {
    const { data, error } = await getSupabaseClient().from('work_order_executantes').insert(executante).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_executantes_${executante.work_order_id}`, [])
    const newItem = { ...executante, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_executantes_${executante.work_order_id}`, items)
    return newItem
  }
}

export async function deleteWorkOrderExecutante(id: string, workOrderId: string) {
  try {
    await getSupabaseClient().from('work_order_executantes').delete().eq('id', id)
  } catch {
    const items = getLocalData<any[]>(`gmi_executantes_${workOrderId}`, [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData(`gmi_executantes_${workOrderId}`, filtered)
  }
}

export async function getEscopoItems(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').select('*').eq('work_order_id', workOrderId).order('item_number')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_escopo_${workOrderId}`, [])
  }
}

export async function createEscopoItem(item: any) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').insert(item).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_escopo_${item.work_order_id}`, [])
    const newItem = { ...item, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_escopo_${item.work_order_id}`, items)
    return newItem
  }
}

export async function updateEscopoItem(id: string, updates: any, workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('escopo_servico').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_escopo_${workOrderId}`, [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData(`gmi_escopo_${workOrderId}`, items)
      return items[index]
    }
    return null
  }
}

export async function deleteEscopoItem(id: string, workOrderId: string) {
  try {
    await getSupabaseClient().from('escopo_servico').delete().eq('id', id)
  } catch {
    const items = getLocalData<any[]>(`gmi_escopo_${workOrderId}`, [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData(`gmi_escopo_${workOrderId}`, filtered)
  }
}

export async function getRecursos(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').select('*, part:parts(*)').eq('work_order_id', workOrderId)
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_recursos_${workOrderId}`, [])
  }
}

export async function createRecurso(recurso: any) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').insert(recurso).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_recursos_${recurso.work_order_id}`, [])
    const newItem = { ...recurso, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_recursos_${recurso.work_order_id}`, items)
    return newItem
  }
}

export async function updateRecurso(id: string, updates: any, workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('recursos').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_recursos_${workOrderId}`, [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData(`gmi_recursos_${workOrderId}`, items)
      return items[index]
    }
    return null
  }
}

export async function deleteRecurso(id: string, workOrderId: string) {
  try {
    await getSupabaseClient().from('recursos').delete().eq('id', id)
  } catch {
    const items = getLocalData<any[]>(`gmi_recursos_${workOrderId}`, [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData(`gmi_recursos_${workOrderId}`, filtered)
  }
}

export async function getExecucoes(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('execucoes').select('*, user:profiles(*)').eq('work_order_id', workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_execucoes_${workOrderId}`, [])
  }
}

export async function createExecucao(execucao: any) {
  try {
    const { data, error } = await getSupabaseClient().from('execucoes').insert(execucao).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_execucoes_${execucao.work_order_id}`, [])
    const newItem = { ...execucao, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_execucoes_${execucao.work_order_id}`, items)
    return newItem
  }
}

export async function getAnexos(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('anexos').select('*').eq('work_order_id', workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_anexos_${workOrderId}`, [])
  }
}

export async function createAnexo(anexo: any) {
  try {
    const { data, error } = await getSupabaseClient().from('anexos').insert(anexo).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_anexos_${anexo.work_order_id}`, [])
    const newItem = { ...anexo, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_anexos_${anexo.work_order_id}`, items)
    return newItem
  }
}

export async function deleteAnexo(id: string, workOrderId: string) {
  try {
    await getSupabaseClient().from('anexos').delete().eq('id', id)
  } catch {
    const items = getLocalData<any[]>(`gmi_anexos_${workOrderId}`, [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData(`gmi_anexos_${workOrderId}`, filtered)
  }
}

export async function getAssinaturas(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('assinaturas').select('*, signer:profiles(*)').eq('work_order_id', workOrderId)
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_assinaturas_${workOrderId}`, [])
  }
}

export async function createAssinatura(assinatura: any) {
  try {
    const { data, error } = await getSupabaseClient().from('assinaturas').insert(assinatura).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_assinaturas_${assinatura.work_order_id}`, [])
    const newItem = { ...assinatura, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_assinaturas_${assinatura.work_order_id}`, items)
    return newItem
  }
}

export async function getChecklistItens(checklistId?: string, workOrderId?: string) {
  try {
    let query = getSupabaseClient().from('checklist_itens').select('*')
    if (checklistId) query = query.eq('checklist_id', checklistId)
    if (workOrderId) query = query.eq('work_order_id', workOrderId)
    const { data, error } = await query.order('created_at')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_checklist_itens_${checklistId || workOrderId || 'all'}`, [])
  }
}

export async function createChecklistItem(item: any) {
  try {
    const { data, error } = await getSupabaseClient().from('checklist_itens').insert(item).select().single()
    if (error) throw error
    return data
  } catch {
    const key = `gmi_checklist_itens_${item.checklist_id || item.work_order_id || 'all'}`
    const items = getLocalData<any[]>(key, [])
    const newItem = { ...item, id: generateId() }
    items.push(newItem)
    setLocalData(key, items)
    return newItem
  }
}

export async function updateChecklistItem(id: string, updates: any, key: string) {
  try {
    const { data, error } = await getSupabaseClient().from('checklist_itens').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_checklist_itens_${key}`, [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData(`gmi_checklist_itens_${key}`, items)
      return items[index]
    }
    return null
  }
}

export async function deleteChecklistItem(id: string, key: string) {
  try {
    await getSupabaseClient().from('checklist_itens').delete().eq('id', id)
  } catch {
    const items = getLocalData<any[]>(`gmi_checklist_itens_${key}`, [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData(`gmi_checklist_itens_${key}`, filtered)
  }
}

export async function createHistoricoOS(historico: any) {
  try {
    const { data, error } = await getSupabaseClient().from('historico_os').insert(historico).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>(`gmi_historico_${historico.work_order_id}`, [])
    const newItem = { ...historico, id: generateId() }
    items.push(newItem)
    setLocalData(`gmi_historico_${historico.work_order_id}`, items)
    return newItem
  }
}

export async function getHistoricoOS(workOrderId: string) {
  try {
    const { data, error } = await getSupabaseClient().from('historico_os').select('*').eq('work_order_id', workOrderId).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>(`gmi_historico_${workOrderId}`, [])
  }
}

export async function getEquipments(companyId?: string) {
  try {
    let query = getSupabaseClient().from('equipments').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_equipments', [])
  }
}

export async function createEquipment(equipment: any) {
  try {
    const { data, error } = await getSupabaseClient().from('equipments').insert(equipment).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_equipments', [])
    const newItem = { ...equipment, id: generateId() }
    items.push(newItem)
    setLocalData('gmi_equipments', items)
    return newItem
  }
}

export async function updateEquipment(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('equipments').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_equipments', [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData('gmi_equipments', items)
      return items[index]
    }
    return null
  }
}

export async function deleteEquipment(id: string) {
  try {
    const { error } = await getSupabaseClient().from('equipments').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_equipments', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_equipments', filtered)
  }
}

export async function getSectors(companyId?: string, areaId?: string) {
  try {
    let query = getSupabaseClient().from('sectors').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (areaId) query = query.eq('area_id', areaId)
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_sectors', [])
  }
}

export async function getEmployees(companyId?: string, sectorId?: string) {
  try {
    let query = getSupabaseClient().from('employees').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (sectorId) query = query.eq('sector_id', sectorId)
    const { data, error } = await query.order('full_name')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_employees', [])
  }
}

export async function createEmployee(employee: any) {
  try {
    const { data, error } = await getSupabaseClient().from('employees').insert(employee).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_employees', [])
    const newItem = { ...employee, id: generateId() }
    items.push(newItem)
    setLocalData('gmi_employees', items)
    return newItem
  }
}

export async function updateEmployee(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('employees').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_employees', [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData('gmi_employees', items)
      return items[index]
    }
    return null
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await getSupabaseClient().from('employees').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_employees', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_employees', filtered)
  }
}

export async function getMaintenances(companyId?: string, equipmentId?: string) {
  try {
    let query = getSupabaseClient().from('preventive_maintenances').select('*')
    if (companyId) query = query.eq('company_id', companyId)
    if (equipmentId) query = query.eq('equipment_id', equipmentId)
    const { data, error } = await query.order('next_execution')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_maintenances', [])
  }
}

export async function createMaintenance(maintenance: any) {
  try {
    const { data, error } = await getSupabaseClient().from('preventive_maintenances').insert(maintenance).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_maintenances', [])
    const newItem = { ...maintenance, id: generateId() }
    items.push(newItem)
    setLocalData('gmi_maintenances', items)
    return newItem
  }
}

export async function updateMaintenance(id: string, updates: any) {
  try {
    const { data, error } = await getSupabaseClient().from('preventive_maintenances').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_maintenances', [])
    const index = items.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...updates }
      setLocalData('gmi_maintenances', items)
      return items[index]
    }
    return null
  }
}

export async function deleteMaintenance(id: string) {
  try {
    const { error } = await getSupabaseClient().from('preventive_maintenances').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_maintenances', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_maintenances', filtered)
  }
}
