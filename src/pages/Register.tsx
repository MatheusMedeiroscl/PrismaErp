import { useState } from 'react'
import logo from '../assets/prisma_erp_logo.svg'
import '../style/register.css'
import { Service } from '../shared/services/Service';

export function Register(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const login = await Service.get()
        alert(login); 
    }


    return(<div className='card'>
        <img src={logo} alt="" className='logo' />

        <section className='inputArea'>
            <label htmlFor="email">Email:</label><br />
            <input type="text"className='input' placeholder='Digite seu email...'
               value={email} onChange={(e) => setEmail(e.target.value)}/> <br />

            <label htmlFor="email">Senha:</label><br />
            <input type="password" className='input' placeholder='Digite sua senha...'
                value={password} onChange={(e) => setPassword(e.target.value)}/> <br />
        </section>
            <button className='submit' onClick={handleLogin}>Entrar</button>

    </div>)
}