import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./style/index.css"
import './mocks/server.ts'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
