
import { createRoot } from 'react-dom/client'
import "./style/index.css"
import './mocks/server.ts'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { Router } from './Routes.tsx'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </BrowserRouter>
)
