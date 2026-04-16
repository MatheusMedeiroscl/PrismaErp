import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { Estoque } from './pages/Estoque'
import { Vendas } from './pages/Vendas'
import { Catalogo } from './pages/Catalogo'
import { AppLayout } from './shared/layout/AppLayout'
import { useAuth } from './shared/context/AuthContext'

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
        <Route path='/home' element={<Home />} />
        <Route path='/estoque' element={<Estoque />} />
        <Route path='/vendas' element={<Vendas />} />
        <Route path='/catalogo' element={<Catalogo />} />
        <Route path='*' element={<Navigate to='/home' />} />
      </Routes>
    </AppLayout>
  )
}