import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { OfflineProvider } from '@/contexts/OfflineProvider'
import { AIProvider } from '@/features/ai/AIProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import LGPDConsent from '@/features/legal/LGPDConsent'
import AIPage from '@/features/ai/AIPage'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import OSPage from '@/pages/os/OSPage'
import OSViewPage from '@/pages/os/OSViewPage'
import EquipmentListPage from '@/features/equipment/EquipmentListPage'
import EmployeeListPage from '@/features/employees/EmployeeListPage'
import MaintenancePage from '@/features/maintenance/MaintenancePage'
import ReportsPage from '@/features/reports/ReportsPage'
import InventoryListPage from '@/features/inventory/InventoryListPage'
import AdminPage from '@/features/admin/AdminPage'
import PrivacyPolicyPage from '@/features/legal/PrivacyPolicyPage'
import TermsOfUsePage from '@/features/legal/TermsOfUsePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="work-orders" element={<OSPage />} />
        <Route path="work-orders/:id" element={<OSViewPage />} />
        <Route path="equipment" element={<EquipmentListPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="inventory" element={<InventoryListPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsOfUsePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <AIProvider>
            <ErrorBoundary>
              <AppRoutes />
              <LGPDConsent />
            </ErrorBoundary>
            <Toaster />
          </AIProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
