import { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/gestion/Dashboard'
import { Flotte } from '@/pages/gestion/Flotte'
import { FicheEngin } from '@/pages/gestion/FicheEngin'
import { Missions } from '@/pages/gestion/Missions'
import { MissionWizard } from '@/pages/gestion/MissionWizard'
import { MissionDetail } from '@/pages/gestion/MissionDetail'
import { Controles } from '@/pages/gestion/Controles'
import { Conducteurs } from '@/pages/gestion/Conducteurs'
import { Carburant } from '@/pages/gestion/Carburant'
import { Depenses } from '@/pages/gestion/Depenses'
import { Alertes } from '@/pages/gestion/Alertes'
import { Utilisateurs } from '@/pages/gestion/Utilisateurs'
import { Parametres } from '@/pages/gestion/Parametres'
import { DriverHome } from '@/pages/conducteur/DriverHome'
import { DriverMission } from '@/pages/conducteur/DriverMission'
import { DriverEngin } from '@/pages/conducteur/DriverEngin'
import { DriverProfil } from '@/pages/conducteur/DriverProfil'
import { CounterForm } from '@/pages/conducteur/CounterForm'
import { UserRole } from '@/types'

function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'conducteur' ? '/conducteur' : '/dashboard'} replace />
  }
  return <>{children}</>
}

function Managed({ title, children }: { title: string; children: ReactNode }) {
  return (
    <RequireRole roles={['admin', 'gestionnaire']}>
      <AppLayout title={title}>{children}</AppLayout>
    </RequireRole>
  )
}

function DriverOnly({ children }: { children: ReactNode }) {
  return <RequireRole roles={['conducteur']}>{children}</RequireRole>
}

export function App() {
  const user = useAuthStore((s) => s.user)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Managed title="Dashboard"><Dashboard /></Managed>} />
        <Route path="/flotte" element={<Managed title="Flotte"><Flotte /></Managed>} />
        <Route path="/flotte/:id" element={<Managed title="Fiche engin"><FicheEngin /></Managed>} />
        <Route path="/missions" element={<Managed title="Missions"><Missions /></Managed>} />
        <Route path="/missions/nouvelle" element={<Managed title="Créer une mission"><MissionWizard /></Managed>} />
        <Route path="/missions/:id" element={<Managed title="Mission"><MissionDetail /></Managed>} />
        <Route path="/controles" element={<Managed title="Départs & retours"><Controles /></Managed>} />
        <Route path="/conducteurs" element={<Managed title="Conducteurs"><Conducteurs /></Managed>} />
        <Route path="/carburant" element={<Managed title="Carburant"><Carburant /></Managed>} />
        <Route path="/depenses" element={<Managed title="Dépenses"><Depenses /></Managed>} />
        <Route path="/alertes" element={<Managed title="Alertes"><Alertes /></Managed>} />
        <Route
          path="/utilisateurs"
          element={
            <RequireRole roles={['admin']}>
              <AppLayout title="Utilisateurs">
                <Utilisateurs />
              </AppLayout>
            </RequireRole>
          }
        />
        <Route path="/parametres" element={<Managed title="Paramètres"><Parametres /></Managed>} />

        <Route path="/conducteur" element={<DriverOnly><DriverHome /></DriverOnly>} />
        <Route path="/conducteur/mission" element={<DriverOnly><DriverMission /></DriverOnly>} />
        <Route path="/conducteur/engin" element={<DriverOnly><DriverEngin /></DriverOnly>} />
        <Route path="/conducteur/depart" element={<DriverOnly><CounterForm mode="depart" /></DriverOnly>} />
        <Route path="/conducteur/retour" element={<DriverOnly><CounterForm mode="retour" /></DriverOnly>} />
        <Route path="/conducteur/profil" element={<DriverOnly><DriverProfil /></DriverOnly>} />

        <Route
          path="*"
          element={
            <Navigate
              to={!user ? '/login' : user.role === 'conducteur' ? '/conducteur' : '/dashboard'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
