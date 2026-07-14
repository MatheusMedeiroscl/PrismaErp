import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserServices } from '../services/UserServices'

interface AuthContextData {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

interface User {
  name: string
  email: string
  id: number
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function validateToken() {
      const storedToken = sessionStorage.getItem('token')

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await UserServices.getme(storedToken)
        setToken(storedToken)
        setUser(userData)
      } catch {
        sessionStorage.removeItem('token')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [])

  const isAuthenticated = !!token

  async function signIn(email: string, password: string) {
    const receivedToken = await UserServices.login(email, password)
    sessionStorage.setItem('token', receivedToken)
    setToken(receivedToken)

    const userData = await UserServices.getme(receivedToken)
    setUser(userData)

    navigate('/dashboard')
  }

  function signOut() {
    sessionStorage.removeItem('token')
    setToken(null)
    navigate('/registro')
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}