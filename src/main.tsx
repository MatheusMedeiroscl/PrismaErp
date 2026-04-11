import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { Router } from './Router'
import { makeServer } from './mocks/server'
 import './style/Dashboard.css'

// Inicia o servidor Mirage apenas em desenvolvimento
if (import.meta.env.DEV) {
  makeServer()
}
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
 