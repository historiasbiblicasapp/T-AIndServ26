import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  Calendar,
  Package,
  BarChart3,
  Brain,
  Shield,
  Home,
  FileText,
  Box,
} from 'lucide-react'

export const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/work-orders', icon: ClipboardList, label: 'Ordens de Serviço' },
  { to: '/equipment', icon: Wrench, label: 'Equipamentos' },
  { to: '/employees', icon: Users, label: 'Colaboradores' },
  { to: '/maintenance', icon: Calendar, label: 'Manutenção' },
  { to: '/inventory', icon: Package, label: 'Estoque' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
  { to: '/ai', icon: Brain, label: 'Inteligência Artificial' },
  { to: '/admin', icon: Shield, label: 'Administração' },
]

export const bottomItems = [
  { to: '/', icon: Home, label: 'Início', end: true },
  { to: '/work-orders', icon: ClipboardList, label: 'OS' },
  { to: '/equipment', icon: Box, label: 'Equip.' },
  { to: '/maintenance', icon: Calendar, label: 'Manut.' },
  { to: '/ai', icon: Brain, label: 'IA' },
  { to: '/reports', icon: FileText, label: 'Relat.' },
]
