
import axios from 'axios';

const axiosInstance = axios.create();

export const Service =  {
   async get(){
        const response = await axiosInstance.get('/api/users');     
        return response.data;
    }
}