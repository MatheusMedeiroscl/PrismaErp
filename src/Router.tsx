import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'

import { AppLayout } from './shared/layout/AppLayout'
import { useAuth } from './shared/context/AuthContext'
import { StockPage } from './pages/Stock'
import { DashboardPage } from './pages/Dashboard'
import { CatalogPage } from './pages/Catalog'

export function Router() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path='*' element={<Register />} />
      </Routes>
    )
  }

  return (
    <AppLayout>
      <Routes>
        <Route path='/estoque' element= {<StockPage/>}/>
        <Route path='/dashboard' element= {<DashboardPage/>}/>
         <Route path='/catalogo' element= {<CatalogPage/>}/>
        <Route path='*' element= {<Navigate to='/dashboard'/> }/>
      </Routes>
    </AppLayout>
  )
}