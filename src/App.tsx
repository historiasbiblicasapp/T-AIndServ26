import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OSPage from './pages/OSPage'
import EquipmentListPage from './pages/equipment/EquipmentListPage'
import EmployeeListPage from './pages/employee/EmployeeListPage'
import MaintenancePage from './pages/maintenance/MaintenancePage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/os" element={<OSPage />} />
      <Route path="/equipments" element={<EquipmentListPage />} />
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  )
}
