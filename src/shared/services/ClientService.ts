const URL = 'http://localhost:8080'

interface IClient {
    storeName: string,
    owner: string
    cnpj: string,
    address: string
}


export const ClientService = {
    async getAll(token: string | null){
        const response = await fetch(`${URL}/client`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();

    },

    async create(token: string | null, client: IClient){
        const response = await fetch(`${URL}/client`, {
           method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(client)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}