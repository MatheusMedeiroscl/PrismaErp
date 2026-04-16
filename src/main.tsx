import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './style/Dashboard.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'

 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </BrowserRouter>
)
 