import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { PublicLayout } from './components/Layouts'
import GlobalNavbar from './components/GlobalNavbar'
import Home from './pages/public/Home'
import Catalogue from './pages/public/Catalogue'
import EquipmentDetail from './pages/public/EquipmentDetail'
import Suppliers from './pages/public/Suppliers'
import Pricing from './pages/public/Pricing'
import Login from './pages/public/Login'
import ClientDashboard from './pages/dashboards/ClientDashboard'
import SupplierDashboard from './pages/dashboards/SupplierDashboard'
import TechnicalDashboard from './pages/dashboards/TechnicalDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <GlobalNavbar />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/fournisseurs" element={<Suppliers />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
          <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
