import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'

import { AppLayout } from './shared/layout/AppLayout'
import { useAuth } from './shared/context/AuthContext'
import { StockPage } from './pages/Stock'

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
        <Route path='*' element={<Navigate to='/home' />} />
        <Route path='/estoque' element= {<StockPage/>}/>
      </Routes>
    </AppLayout>
  )
}