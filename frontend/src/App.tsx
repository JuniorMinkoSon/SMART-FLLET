import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import { Login } from '@/pages/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { CreateProjet } from '@/pages/admin/CreateProjet'
import { OperateurDashboard } from '@/pages/operateur/Dashboard'
import { RapportJournalier } from '@/pages/operateur/RapportJournalier'
import { ChefProjetDashboard } from '@/pages/chef/Dashboard'
import { FleetCommand } from '@/pages/dg/FleetCommand'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="nouveau-projet" element={<CreateProjet />} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/operateur/*"
          element={
            <ProtectedRoute requiredRole="operateur">
              <AppLayout>
                <Routes>
                  <Route path="/" element={<OperateurDashboard />} />
                  <Route path="dashboard" element={<OperateurDashboard />} />
                  <Route path="rapport" element={<RapportJournalier />} />
                  <Route path="*" element={<Navigate to="/operateur" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chef/*"
          element={
            <ProtectedRoute requiredRole="chef_projet">
              <AppLayout>
                <Routes>
                  <Route path="/" element={<ChefProjetDashboard />} />
                  <Route path="dashboard" element={<ChefProjetDashboard />} />
                  <Route path="*" element={<Navigate to="/chef" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dg/*"
          element={
            <ProtectedRoute requiredRole="dg">
              <AppLayout>
                <Routes>
                  <Route path="/" element={<FleetCommand />} />
                  <Route path="command" element={<FleetCommand />} />
                  <Route path="*" element={<Navigate to="/dg" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
