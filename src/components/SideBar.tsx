// src/shared/components/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/context/AuthContext'
import logo from '../assets/prisma_erp_logo.svg'
import '../style/sidebar.css'

export function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Prisma ERP" />
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Operações</p>

        <NavLink to="/home" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Dashboard
        </NavLink>

        <NavLink to="/estoque" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Estoque
        </NavLink>

        <NavLink to="/vendas" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Vendas
        </NavLink>
        <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          Catálogo
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-section-label">Configurações</p>
        <button className="sidebar-link sidebar-logout" onClick={handleSignOut}>
          Sair
        </button>
      </div>
    </aside>
  )
}