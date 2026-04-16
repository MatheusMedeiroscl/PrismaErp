import { createContext, useContext, useState, type ReactNode } from 'react'
import { Service } from '../services/Service'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const isAuthenticated = !!user

  async function signIn(email: string, password: string) {
    const data = await Service.Login({ email, password })
    setUser(data.user)
  }

  function signOut() {
    setUser(null)
    navigate('/login')  // redireciona após logout
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}