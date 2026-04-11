// src/Router.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { PrivateRoute } from './components/PrivateRoute'

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Register />} />

      <Route path="/home" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      }/>

      {/* redireciona a raiz para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}