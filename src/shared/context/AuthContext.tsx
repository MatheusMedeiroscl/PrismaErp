import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserServices } from '../services/UserServices'

interface AuthContextData {
  token: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

interface User {
  name: string;
  email: string;
  id: number;
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') // persiste o token ao recarregar a página
  );
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  async function signIn(email: string, password: string) {
    const receivedToken = await UserServices.login(email, password);

    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);


    const userData = await UserServices.getme(receivedToken)
    setUser(userData);

    navigate('/home') 
  }

  function signOut() {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}