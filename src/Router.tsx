// src/Router.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'
import { Home } from './pages/Home'
import { Estoque } from './pages/Estoque'
import { Vendas } from './pages/Vendas'
import { PrivateRoute } from './components/PrivateRoute'

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Register />} />

      <Route path="/home" element={
        <PrivateRoute><Home /></PrivateRoute>
      } />

      <Route path="/estoque" element={
        <PrivateRoute><Estoque /></PrivateRoute>
      } />

      <Route path="/vendas" element={
        <PrivateRoute><Vendas /></PrivateRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}