import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'

import { AppLayout } from './shared/layout/AppLayout'
import { useAuth } from './shared/context/AuthContext'
import { StockPage } from './pages/Stock'
import { DashboardPage } from './pages/Dashboard'
import { CatalogPage } from './pages/Catalog'
import { SalePage } from './pages/sale/Sale'

export function Router() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Carregando...</div> // ou um Spinner
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path='/registro' element={<Register />} />
        <Route path='*' element={<Navigate to='/registro' replace />} />
      </Routes>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path='/estoque' element={<StockPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/catalogo' element={<CatalogPage />} />
        <Route path='/vendas' element={<SalePage />} />
        <Route path='*' element={<Navigate to='/dashboard' />} />
      </Routes>
    </AppLayout>
  )
}