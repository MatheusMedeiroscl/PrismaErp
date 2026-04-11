
import axios from 'axios';

const axiosInstance = axios.create();
interface IUser{
    name: String ,
    email: String,
    password: String
}

interface SignInCredentials {
  email: string
  password: string
}

interface SignInResponse {
  user: {
    id: string
    name: string
    email: string
  }
}

export const Service =  {
   async Login({email, password}: SignInCredentials): Promise<SignInResponse>{
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            throw new Error('Email ou senha inválidos')
        }

        return response.json()
        },

    async createUser(request: IUser){
        const response = await axiosInstance.post('/api/users', request);
        return response.data
    }
}