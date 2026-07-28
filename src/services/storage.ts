import { supabase } from './supabase'

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

export async function getEquipments() {
  try {
    const { data, error } = await supabase.from('equipments').select('*')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_equipments', [])
  }
}

export async function createEquipment(equipment: any) {
  try {
    const { data, error } = await supabase.from('equipments').insert(equipment).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_equipments', [])
    const newItem = { ...equipment, id: Date.now().toString() }
    items.push(newItem)
    setLocalData('gmi_equipments', items)
    return newItem
  }
}

export async function updateEquipment(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from('equipments').update(updates).eq('id', id).select().single()
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
    const { error } = await supabase.from('equipments').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_equipments', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_equipments', filtered)
  }
}

export async function getSectors() {
  try {
    const { data, error } = await supabase.from('sectors').select('*')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_sectors', [])
  }
}

export async function getEmployees() {
  try {
    const { data, error } = await supabase.from('employees').select('*')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_employees', [])
  }
}

export async function createEmployee(employee: any) {
  try {
    const { data, error } = await supabase.from('employees').insert(employee).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_employees', [])
    const newItem = { ...employee, id: Date.now().toString() }
    items.push(newItem)
    setLocalData('gmi_employees', items)
    return newItem
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_employees', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_employees', filtered)
  }
}

export async function getWorkOrders() {
  try {
    const { data, error } = await supabase.from('work_orders').select('*')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_work_orders', [])
  }
}

export async function createWorkOrder(workOrder: any) {
  try {
    const { data, error } = await supabase.from('work_orders').insert(workOrder).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    const newItem = { ...workOrder, id: Date.now().toString() }
    items.push(newItem)
    setLocalData('gmi_work_orders', items)
    return newItem
  }
}

export async function updateWorkOrder(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from('work_orders').update(updates).eq('id', id).select().single()
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
    const { error } = await supabase.from('work_orders').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_work_orders', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_work_orders', filtered)
  }
}

export async function getMaintenances() {
  try {
    const { data, error } = await supabase.from('preventive_maintenances').select('*')
    if (error) throw error
    return data || []
  } catch {
    return getLocalData<any[]>('gmi_maintenances', [])
  }
}

export async function createMaintenance(maintenance: any) {
  try {
    const { data, error } = await supabase.from('preventive_maintenances').insert(maintenance).select().single()
    if (error) throw error
    return data
  } catch {
    const items = getLocalData<any[]>('gmi_maintenances', [])
    const newItem = { ...maintenance, id: Date.now().toString() }
    items.push(newItem)
    setLocalData('gmi_maintenances', items)
    return newItem
  }
}

export async function updateMaintenance(id: string, updates: any) {
  try {
    const { data, error } = await supabase.from('preventive_maintenances').update(updates).eq('id', id).select().single()
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
    const { error } = await supabase.from('preventive_maintenances').delete().eq('id', id)
    if (error) throw error
  } catch {
    const items = getLocalData<any[]>('gmi_maintenances', [])
    const filtered = items.filter((item: any) => item.id !== id)
    setLocalData('gmi_maintenances', filtered)
  }
}
