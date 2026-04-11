import { useState } from 'react'
import logo from '../assets/prisma_erp_logo.svg'
import '../style/register.css'
import { useAuth } from '../shared/context/AuthContext'

export function Register(){
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
        } catch (err) {
            setError('Email ou senha inválidos')
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className='card'>
            <img src={logo} alt="" className='logo' />

            <section className='inputArea'>
                <label htmlFor="email">Email:</label><br />
                <input
                    type="text"
                    className='input'
                    placeholder='Digite seu email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /> <br />

                <label htmlFor="password">Senha:</label><br />
                <input
                    type="password"
                    className='input'
                    placeholder='Digite sua senha...'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /> <br />

                {error && <p className='error'>{error}</p>}
            </section>

            <button className='submit' onClick={handleLogin} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </div>
    )
}